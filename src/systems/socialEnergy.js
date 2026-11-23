/* ============================================================================
   v2.15 W3 — Social energy + friendship decay.
   Two systems, one file, both wired to the real people:

   1. SOCIAL ENERGY — a real monthly budget, stored on the state
      (S.social = { energy, max, refilledKey }), refilled by the monthly
      settlement (economyEngine settleHouseholdMonth) and by the yearly
      childhood turn (gameLoop has no monthly settlement before 18).
      Every relationship action costs energy — a call costs 1, a
      conversation 2, a visit 3, a gift 2, asking for help 4 — and the
      cost is printed on the button (ui/socialEnergy.js). When the budget
      is gone the game refuses in plain words; it never silently fails.

   2. FRIENDSHIP DECAY — driven by the real last-contact record
      (person.rel.lastContactTurn, which the schema sets at creation and
      every relationship verb updates). A friend uncontacted for 6 months
      starts drifting (a visible warning on their card, naming what stops
      the drift); at 12 months a notice fires — "You have not spoken to
      X in a year" — with a real choice: reach out now (costs 1 energy,
      restores the friendship) or let it go (the friendship ends: the
      person leaves the circle, the record changes, and a best friend
      lost is journalled as a real loss). Nothing ends silently, and
      nothing is decided after the fact — the warning always comes first.

   Backfill rule: a person record with no last-contact field is backfilled
   honestly from the journal — the newest journal entry naming them is
   the last contact. If the journal says nothing about them, the record
   is marked lastContactUnknown and that person NEVER drifts on a guess;
   the first real contact after that clears the mark.
   ========================================================================== */

import { clamp } from '../core/rng.js';
import { recordJournal, queueScene, nextId } from '../core/schema.js';

/* A month of social life: enough for a couple of visits and a few calls,
   not enough to work every relationship every month. A big favour (4) is
   nearly half the month — as it should feel. */
export const SOCIAL_ENERGY_MAX = 10;

export const SOCIAL_ENERGY_COSTS = {
  call: 1,
  talk: 2,
  visit: 3,
  gift: 2,
  askHelp: 4,
  /* npc-interact kinds: a visit at home is an evening out (3); an
     international call is a long call (2); the rest are real evenings. */
  talkVisitSameCountry: 3,
  talkVisitAbroad: 2,
  familyMeal: 3,
  financialSupport: 3,
  wastaReferral: 4,
  mentorChild: 3,
  reconcile: 3
};

/* 6 months of silence: the friendship is drifting (warning, still alive).
   12 months of silence: the drift notice fires (choice, still alive).
   Nothing here ends a friendship on its own — only "let it go" does. */
export const DRIFT_WARN_MONTHS = 6;
export const DRIFT_NOTICE_MONTHS = 12;
/* Reaching out through the notice IS a call, so it costs what a call costs. */
export const DRIFT_REACH_OUT_COST = SOCIAL_ENERGY_COSTS.call;
/* A friend at this affection or higher is one of your closest friends. */
export const BEST_FRIEND_AFFECTION = 80;

/* --------------------------------------------------------------------------
   The budget itself — a real record, not a number computed on the fly.
   -------------------------------------------------------------------------- */

export function ensureSocialEnergy(S) {
  if (!S) return null;
  if (!S.social || typeof S.social !== 'object') S.social = {};
  if (typeof S.social.max !== 'number' || S.social.max <= 0) S.social.max = SOCIAL_ENERGY_MAX;
  if (typeof S.social.energy !== 'number') S.social.energy = S.social.max;
  S.social.energy = clamp(S.social.energy, 0, S.social.max);
  return S.social;
}

/* One refill key per month (adults) or per year-turn (children, whose clock
   runs yearly and has no monthly settlement). The key is what stops the
   settlement refilling the budget twice in the same month. */
export function socialEnergyKey(S) {
  return S.pacing === 'monthly'
    ? `${S.year}-${String(S.month || 1).padStart(2, '0')}`
    : `${S.year}`;
}

/* Refill the budget to full. Returns true only when the month actually
   changed — calling it twice in the same month refills nothing. */
export function refillSocialEnergy(S) {
  if (!S) return false;
  const soc = ensureSocialEnergy(S);
  const key = socialEnergyKey(S);
  if (soc.refilledKey === key) return false;
  soc.energy = soc.max;
  soc.refilledKey = key;
  return true;
}

export function socialEnergy(S) {
  const soc = ensureSocialEnergy(S);
  return { energy: soc.energy, max: soc.max };
}

/* Plain-words refusal. Never a bare false, never a code. */
export function checkSocialEnergy(S, cost) {
  const soc = ensureSocialEnergy(S);
  if (soc.energy >= cost) return { ok: true };
  if (soc.energy <= 0) {
    return {
      ok: false,
      msg: `You are out of social energy this month — you have spent the month's ${soc.max} energy on calls, visits and favours. It comes back at the start of next month.`
    };
  }
  return {
    ok: false,
    msg: `You only have ${soc.energy} social energy left this month, and that costs ${cost}. It comes back at the start of next month.`
  };
}

export function spendSocialEnergy(S, cost) {
  const soc = ensureSocialEnergy(S);
  if (soc.energy < cost) return false;
  soc.energy -= cost;
  return true;
}

/* Check and spend in one step; the refusal is the plain-words message. */
export function requireSocialEnergy(S, cost) {
  const c = checkSocialEnergy(S, cost);
  if (!c.ok) return c;
  spendSocialEnergy(S, cost);
  return { ok: true };
}

/* One cost table for every relationship verb and npc-interact kind, so the
   number on the button and the number charged are never two different
   numbers. Unknown kinds cost 2 — a real evening, not a free one. */
export function energyCostFor(key, S, p) {
  switch (key) {
    case 'call': return SOCIAL_ENERGY_COSTS.call;
    case 'talk': return SOCIAL_ENERGY_COSTS.talk;
    case 'visit': return SOCIAL_ENERGY_COSTS.visit;
    case 'gift': return SOCIAL_ENERGY_COSTS.gift;
    case 'askHelp': return SOCIAL_ENERGY_COSTS.askHelp;
    case 'interact:talk_visit':
      return (p && S && p.residenceCountry === S.country)
        ? SOCIAL_ENERGY_COSTS.talkVisitSameCountry
        : SOCIAL_ENERGY_COSTS.talkVisitAbroad;
    case 'interact:family_meal': return SOCIAL_ENERGY_COSTS.familyMeal;
    case 'interact:gift': return SOCIAL_ENERGY_COSTS.gift;
    case 'interact:financial_support': return SOCIAL_ENERGY_COSTS.financialSupport;
    case 'interact:ask_for_help': return SOCIAL_ENERGY_COSTS.askHelp;
    case 'interact:wasta_referral': return SOCIAL_ENERGY_COSTS.wastaReferral;
    case 'interact:mentor_child': return SOCIAL_ENERGY_COSTS.mentorChild;
    case 'interact:reconcile': return SOCIAL_ENERGY_COSTS.reconcile;
    default: return 2;
  }
}

/* --------------------------------------------------------------------------
   Last contact — the record drift is driven by.
   -------------------------------------------------------------------------- */

/* Every real contact goes through here: it stamps the turn, clears an
   honest "we don't know" mark, and stops any drift that was under way. */
export function noteSocialContact(S, p) {
  if (!p || !p.rel) return;
  p.rel.lastContactTurn = S.turn;
  p.rel.lastContactUnknown = false;
  if (p.rel.driftState === 'drifting' || p.rel.driftState === 'noticed') {
    p.rel.driftState = 'none';
  }
}

/* Months since the last real contact. Turns are months in adult pacing
   and years in childhood pacing. */
export function monthsSinceContact(S, p) {
  if (!p || !p.rel || typeof p.rel.lastContactTurn !== 'number') return 0;
  const turns = Math.max(0, (S.turn || 0) - p.rel.lastContactTurn);
  return S.pacing === 'monthly' ? turns : turns * 12;
}

/* Honest backfill for a record with no last-contact field. The journal is
   newest-first, so the first entry naming the person IS the last contact
   the game has evidence of. If the journal says nothing about them, the
   record is marked unknown and that person never drifts on a guess. */
export function backfillLastContact(S, p) {
  if (!p || !p.rel) return null;
  if (typeof p.rel.lastContactTurn === 'number') return p.rel.lastContactTurn;
  const name = p.fullName || '';
  const entry = (S.journal || []).find(j =>
    j && typeof j.text === 'string' && name && j.text.includes(name) && typeof j.turn === 'number'
  );
  if (entry) {
    p.rel.lastContactTurn = entry.turn;
    p.rel.lastContactUnknown = false;
    return entry.turn;
  }
  p.rel.lastContactTurn = S.turn;
  p.rel.lastContactUnknown = true;
  return S.turn;
}

/* --------------------------------------------------------------------------
   Drift — the yearly check, the warning, the notice, the two endings.
   -------------------------------------------------------------------------- */

/* What the person card shows, if anything: null when the friendship is
   healthy, otherwise the state and how long the silence has lasted. */
export function driftStatusFor(S, p) {
  if (!p || !p.alive || !p.rel) return null;
  const state = p.rel.driftState || 'none';
  if (state !== 'drifting' && state !== 'noticed') return null;
  return { state, months: monthsSinceContact(S, p) };
}

/* A memory written by this file's own hand (soulEngine's rememberDeed is
   not imported here — this file must not import soulEngine, which imports
   this file). Same shape, same cap, same clamping. */
function rememberSocialDeed(S, person, kind, summary, impact = {}) {
  if (!person || !person.rel) return;
  if (!Array.isArray(person.rel.memories)) person.rel.memories = [];
  person.rel.memories.unshift({
    id: nextId(S, 'mem'),
    year: S.year,
    month: S.month,
    turn: S.turn,
    kind,
    summary,
    weight: impact.weight || 1
  });
  if (person.rel.memories.length > 24) person.rel.memories.length = 24;
  if (impact.affection) person.rel.affection = clamp(person.rel.affection + impact.affection);
  if (impact.respect) person.rel.respect = clamp(person.rel.respect + impact.respect);
  if (impact.trust) person.rel.trust = clamp(person.rel.trust + impact.trust);
  if (impact.resentment != null) person.rel.resentment = clamp(person.rel.resentment + impact.resentment);
}

/* The notice scene: "You have not spoken to X in a year", with the real
   choice. The reach-out choice costs a call's energy; the let-go choice
   ends the friendship. The scene is the notice — it fires while the
   friendship is still alive, never after it is gone. */
export function queueDriftNoticeScene(S, p) {
  // Childhood is already fast yearly pacing. Keep drift visible on People,
  // without forcing several near-identical friend decisions per school year.
  if (S.player.age < 18 || S.lastDriftNoticeYear === S.year) return false;
  const queued = queueScene(S, buildDriftNoticeScene(S, p));
  if (queued) S.lastDriftNoticeYear = S.year;
  return queued;
}

export function restoreDriftNoticeScene(S, saved) {
  if (!saved?.baseId?.startsWith('drift_notice_')) return null;
  const p = S.people[saved.speakerId];
  if (!p?.alive || !S.relations.friendIds.includes(p.id)) return null;
  return { ...saved, ...buildDriftNoticeScene(S, p) };
}

function buildDriftNoticeScene(S, p) {
  const close = (p.rel.affection || 0) >= BEST_FRIEND_AFFECTION;
  return {
    key: `drift_${p.id}_${S.year}`,
    baseId: `drift_notice_${p.id}`,
    maxPerLife: 99,
    category: 'relationship',
    speakerId: p.id,
    title: `You have not spoken to ${p.firstName} in a year`,
    text: `It has been a year since you last spoke to ${p.fullName}. ${close ? `${p.firstName} was one of your closest friends — the kind of friend you do not replace. ` : ''}You have both been busy. The friendship is fading, but it will not end unless you choose to let it go.`,
    choices: [
      {
        label: `Reach out now — call ${p.firstName} (${DRIFT_REACH_OUT_COST} energy)`,
        available: st => socialEnergy(st).energy >= DRIFT_REACH_OUT_COST,
        lockReason: 'Not enough social energy to call this month.',
        effect: (st) => { reachOutToDriftingFriend(st, p); }
      },
      {
        label: 'Not today. Keep the door open.',
        effect: st => {
          p.rel.driftState = 'noticed';
          recordJournal(st, `You left the door open with ${p.fullName}. You have not reconnected yet; you can call or visit from People when you are ready.`, 'relationship');
        }
      },
      {
        label: 'Let it go — the friendship ends',
        effect: (st) => { endFriendship(st, p); }
      }
    ]
  };
}

/* Reach out through the notice: a call, costing a call's energy. If the
   month's energy is already gone, the choice says so plainly in the
   journal and the friendship stays hanging — the player can still call
   from the person card when next month's energy comes back. */
export function reachOutToDriftingFriend(S, p) {
  if (!S || !p || !p.alive) return { ok: false, msg: 'Person unavailable.' };
  const cost = DRIFT_REACH_OUT_COST;
  if (socialEnergy(S).energy < cost) {
    recordJournal(S, `You meant to call ${p.fullName} after a year of silence, but you had no social energy left this month. The friendship is still hanging — call them when next month's energy comes back.`, 'relationship');
    return { ok: false, msg: `You have no social energy left this month to reach out to ${p.firstName}. It comes back at the start of next month.` };
  }
  spendSocialEnergy(S, cost);
  noteSocialContact(S, p);
  rememberSocialDeed(S, p, 'visited', 'You reached out after a year apart — the friendship is alive again.', { affection: 12, trust: 6, resentment: -10 });
  recordJournal(S, `After a year of silence, you called ${p.fullName}. It was awkward for a minute, then it was like no time had passed. The friendship is alive again.`, 'relationship');
  return { ok: true, msg: `You reached out to ${p.firstName} — the friendship is alive again.` };
}

/* Let it go: the friendship ends for real. The person leaves the circle,
   the record says so (drifted, and in which year), and a close friend
   lost is journalled as a real loss, not a number going down silently. */
export function endFriendship(S, p) {
  if (!S || !p || !p.rel) return { ok: false };
  const wasClose = (p.rel.affection || 0) >= BEST_FRIEND_AFFECTION;
  p.rel.driftState = 'drifted';
  p.rel.driftedAway = true;
  p.rel.driftedYear = S.year;
  p.rel.affection = 8;
  p.rel.trust = 20;
  if (S.relations && Array.isArray(S.relations.friendIds)) {
    S.relations.friendIds = S.relations.friendIds.filter(id => id !== p.id);
  }
  rememberSocialDeed(S, p, 'neglected', `You let the friendship go in ${S.year}.`, { weight: 2 });
  recordJournal(S, wasClose
    ? `You let your friendship with ${p.fullName} go. ${p.firstName} was one of your closest friends, and now they are a stranger. That is a real loss — you do not get close friends back by accident.`
    : `You let the friendship with ${p.fullName} drift away. You stopped calling, they stopped calling, and now the thread is cut.`,
  'relationship');
  return { ok: true };
}

/* The yearly drift check, run from the NPC yearly tick (soulEngine
   tickNpcAutonomyYearly). Friends only — family has its own ties, and a
   spouse, parent or child is not a friendship you let go of from a card.
   - 6+ months silent and never warned: state 'drifting', journalled in
     plain words, affection thins a little each year it goes on.
   - 12+ months silent and never noticed: state 'noticed', the notice
     scene fires, journalled in plain words. The friendship is still
     alive at this point — the choice, not the silence, ends it.
   - Already noticed and still silent: the bond keeps thinning, but the
     friendship is never ended for the player. Only "let it go" ends it.
   v2.18 W3 — the notice NEVER fires on a friendship that was never
   warned. In monthly pacing the warning (6 months) and the notice (12)
   are six turns apart by themselves. In yearly childhood pacing one
   turn IS twelve months, so without this gate a friend jumped 0 → 12
   months silent in a single turn and the notice scene itself was the
   warning. Now a 12-month silence on a never-warned friendship sets
   'drifting' and journals the warning; the notice fires only on a later
   tick, once the warning has had a full turn to be acted on. */
export function tickFriendshipDrift(S) {
  if (!S || !S.people || !S.relations || !Array.isArray(S.relations.friendIds)) {
    return { warned: 0, noticed: 0 };
  }
  let warned = 0;
  let noticed = 0;
  for (const id of [...S.relations.friendIds]) {
    const p = S.people[id];
    if (!p || !p.alive) continue;
    backfillLastContact(S, p);
    /* No real record of a last contact: never drift on a guess. */
    if (p.rel.lastContactUnknown) continue;
    const months = monthsSinceContact(S, p);
    const state = p.rel.driftState || 'none';
    if (state === 'drifted') continue;
    if (months >= DRIFT_NOTICE_MONTHS) {
      /* v2.18 W3: the notice needs a warning first. A friendship that
         was never warned (yearly pacing: 0 → 12 months in one turn)
         gets the warning now, not the notice. */
      if (state !== 'drifting' && state !== 'noticed') {
        p.rel.driftState = 'drifting';
        recordJournal(S, `You and ${p.fullName} are drifting apart — you have not spoken in ${months} months. A call or a visit would stop the drift.`, 'relationship');
        warned++;
      } else if (state !== 'noticed') {
        if (queueDriftNoticeScene(S, p)) {
          p.rel.driftState = 'noticed';
          recordJournal(S, `You have not spoken to ${p.fullName} in a year. You can reconnect, leave the door open, or let the friendship go.`, 'relationship');
          noticed++;
        }
      } else {
        p.rel.affection = clamp(p.rel.affection - 3);
      }
    } else if (months >= DRIFT_WARN_MONTHS) {
      if (state === 'none') {
        p.rel.driftState = 'drifting';
        recordJournal(S, `You and ${p.fullName} are drifting apart — you have not spoken in ${months} months. A call or a visit would stop the drift.`, 'relationship');
        warned++;
      }
      p.rel.affection = clamp(p.rel.affection - 3);
    }
  }
  return { warned, noticed };
}
