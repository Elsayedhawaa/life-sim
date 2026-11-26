/* Major life events are announced from the saved state that actually changed
   during the turn (promotion record, a person's death, an affair coming out,
   a separation or divorce, losing a job, an eviction, a car crash). Each
   announcement is an urgent card that interrupts play, and each is stored in
   S.majorEvents so later events can be gated on it. Nothing here invents a
   change: if the state did not change, nothing is announced. */
import { chance, randInt } from '../core/rng.js';
import { queueScene, recordJournal, walletMove } from '../core/schema.js';
import { formatMoney } from '../data/countries.js';

const CLOSE_ROLES = { mother: 'mother', father: 'father', spouse: 'spouse', child: 'child', sibling: 'sibling' };

function closeIds(S) {
  const r = S.relations || {};
  const out = {};
  const add = (id, role) => { if (id) out[id] = role; };
  add(r.motherId, 'mother'); add(r.fatherId, 'father');
  (r.spouseIds || []).forEach((id) => add(id, 'spouse'));
  add(r.partnerId, 'partner');
  (r.childIds || []).forEach((id) => add(id, 'child'));
  (r.siblingIds || []).forEach((id) => add(id, 'sibling'));
  return out;
}

export function snapshotMajor(S) {
  const ids = closeIds(S);
  const people = {};
  for (const [id, role] of Object.entries(ids)) {
    const p = S.people?.[id];
    if (p) people[id] = { role, alive: !!p.alive };
  }
  const spouses = {};
  for (const id of S.relations?.spouseIds || []) {
    const p = S.people?.[id];
    spouses[id] = { stage: p?.relationshipProgress?.stage || 'together', affair: p?.relationshipProgress?.affair?.status || null, court: !!p?.relationshipProgress?.courtCase };
  }
  return {
    promoAt: S.career?.lastPromotion?.at ?? null,
    hadJob: !!(S.career?.employed && S.career?.job),
    job: S.career?.job ? { employer: S.career.job.employer, title: S.career.job.title } : null,
    lastJobLoss: S.career?.jobLoss?.lastJob ? `${S.career.jobLoss.lastJob.year}-${S.career.jobLoss.lastJob.month}-${S.career.jobLoss.lastJob.reason}` : null,
    reference: S.career?.lastReference || null,
    retired: !!S.career?.retired,
    eviction: S.housing?.lastEviction ? `${S.housing.lastEviction.year}-${S.housing.lastEviction.month}` : null,
    crashes: (S.carCrashes || []).length,
    people, spouses,
  };
}

function continueChoices(text, journal) {
  return [{ label: 'Continue', effect: (st) => { recordJournal(st, journal || text, 'milestone'); } }];
}

/* A saved announcement keeps its words; only its button is rebuilt. */
export function restoreMajorScene(S, saved) {
  if (!saved?.major || !saved.title || !saved.text) return null;
  return { ...saved, choices: continueChoices(saved.text, null) };
}

function announce(S, kind, { title, text, personId = null, facts = {}, journal = null, noScene = false }) {
  S.majorEvents ??= [];
  const rec = { kind, year: S.year, month: S.month, turn: S.turn, personId, facts };
  S.majorEvents.push(rec);
  if (S.majorEvents.length > 120) S.majorEvents.splice(0, S.majorEvents.length - 120);
  if (noScene) return rec; /* the record stays (follow-up events key off it); only the duplicate card is held back */
  const key = `major_${kind}_${S.year}_${S.month}_${personId || 'self'}`;
  const who = personId ? S.people?.[personId] : null;
  const roleKey = facts.role || (/^(separation|divorce|affair)/.test(kind) ? 'spouse' : null);
  const people = kind !== 'death' && who && who.firstName && roleKey ? [{ name: who.firstName, label: (ROLE_WORD[roleKey] || '').replace('your spouse', who.gender === 'f' ? 'your wife' : who.gender === 'm' ? 'your husband' : 'your spouse') }].filter((x) => x.label) : [];
  queueScene(S, {
    people,
    key, baseId: key, category: 'milestone', title, text, urgent: true, major: true, majorKind: kind, maxPerLife: 99,
    choices: continueChoices(text, journal),
  }, true);
  return rec;
}

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const ROLE_WORD = { mother: 'your mother', father: 'your father', spouse: 'your spouse', partner: 'your partner', child: 'your child', sibling: 'your sibling' };

export function announceMajorChanges(S, before) {
  if (!S || !before) return [];
  const made = [];
  const after = snapshotMajor(S);
  const cur = S.career?.lastPromotion;
  if (cur && cur.at !== before.promoAt) {
    const where = cur.employer ? ` at ${cur.employer}` : '';
    made.push(announce(S, 'promotion', {
      title: 'You Were Promoted',
      text: `You have been promoted${cur.newTitle ? ` to ${cur.newTitle}` : ''}${where}.${cur.oldTitle && cur.newTitle ? ` You were ${cur.oldTitle}.` : ''}`,
      facts: { employer: cur.employer || null, newTitle: cur.newTitle || null },
    }));
  }
  if (before.hadJob && !after.hadJob && !after.retired) {
    const redundant = after.lastJobLoss && after.lastJobLoss !== before.lastJobLoss;
    const dismissed = after.reference && after.reference !== before.reference && after.reference.kind === 'poor';
    if (redundant || dismissed) {
      const emp = before.job?.employer || 'your employer';
      made.push(announce(S, redundant ? 'job_lost_redundancy' : 'job_lost_dismissed', {
        title: redundant ? 'You Have Been Made Redundant' : 'You Have Been Fired',
        text: redundant ? `${emp} has let you go as part of cuts. Your pay stops, and the household budget now depends on what you do next.` : `${emp} has dismissed you after repeated formal warnings. Your pay stops, and a poor reference may follow you into the next search.`,
        facts: { employer: emp, title: before.job?.title || null },
        /* the crisis redundancy already queued its own detailed card (severance, choices): do not show a second card for the same loss */
        noScene: !!redundant && [S.activeScene, ...(S.sceneQueue || [])].some(sc => sc && sc.baseId === 'made_redundant'),
      }));
    }
  }
  for (const [id, b] of Object.entries(before.people)) {
    const p = S.people?.[id];
    if (b.alive && p && !p.alive) {
      const nm = p.fullName || p.firstName || ROLE_WORD[b.role];
      made.push(announce(S, 'death', {
        title: `${b.role in ROLE_WORD && p.firstName ? `${cap(ROLE_WORD[b.role])}, ${p.firstName}, Has Died` : `${p.firstName || 'Someone close'} Has Died`}`,
        text: `${nm}, ${ROLE_WORD[b.role]}, has died${p.age >= 1 ? ` at ${p.age}` : ''}${p.deathCause ? ` from ${p.deathCause}.` : '. The cause is not known.'}`,
        personId: id, facts: { role: b.role, age: p.age || null, cause: p.deathCause || null },
      }));
    }
  }
  for (const [id, b] of Object.entries(before.spouses)) {
    const p = S.people?.[id];
    if (!p) continue;
    const a = after.spouses[id];
    const gone = !a && p.alive;
    if (gone) {
      made.push(announce(S, 'divorce_final', { title: 'Your Divorce Is Final', text: `Your marriage to ${p.firstName} has legally ended.`, personId: id, facts: {} }));
      continue;
    }
    if (!a) continue;
    if (a.affair === 'discovered' && b.affair !== 'discovered') {
      made.push(announce(S, 'affair_discovered', { title: `You Found Out About ${p.firstName}`, text: `You have learned that ${p.firstName} has been having an affair. Trust between you has taken a real hit.`, personId: id, facts: {} }));
    }
    if (a.stage === 'separated' && b.stage !== 'separated') {
      const by = p.relationshipProgress?.separatedBy;
      made.push(announce(S, 'separation', {
        title: by === 'player' ? `You Separated From ${p.firstName}` : by === 'spouse' ? `${p.firstName} Is Leaving` : `You and ${p.firstName} Have Separated`,
        text: by === 'player' ? `You chose to separate from ${p.firstName}. You now live apart and shared income has stopped.` : by === 'spouse' ? `${p.firstName} has moved out. You are now separated and living apart.` : `You and ${p.firstName} are now separated and living apart.`,
        personId: id, facts: { by: by || null } }));
    }
    if (a.court && !b.court) {
      made.push(announce(S, 'divorce_filed', { title: 'A Divorce Case Is Open', text: `A divorce case involving ${p.firstName} has been filed.`, personId: id, facts: {} }));
    }
  }
  if (after.eviction && after.eviction !== before.eviction) {
    const e = S.housing.lastEviction;
    made.push(announce(S, 'eviction', { title: 'You Were Evicted', text: `Your landlord ended your lease at ${e.from || 'your home'} after months of unpaid rent. `.trim(), facts: { from: e.from || null } }));
  }
  if (after.crashes > before.crashes) {
    const c = S.carCrashes[S.carCrashes.length - 1];
    made.push(announce(S, 'car_crash', {
      title: 'Your Car Was in a Crash',
      text: `Your ${c.carName} was in a ${c.severity} crash. ${c.injury ? 'You were hurt. ' : 'You were not badly hurt. '}Repairs cost ${formatMoney(c.repair, S.country)}. ${c.insured ? 'Your insurance covered most of it' : 'You had no auto cover'}; ${c.owed > 0 ? `you could only pay ${formatMoney(c.paid, S.country)} now and ${formatMoney(c.owed, S.country)} stays owed until you can cover it` : `you paid ${formatMoney(c.paid, S.country)}`}.`,
      facts: { carId: c.carId, severity: c.severity, paid: c.paid, insured: c.insured, injury: !!c.injury },
    }));
  }
  return made;
}

/* Rare, real consequence of owning a car. At most one roll a month across
   all cars, a long cooldown after any crash, adults only. Insurance (when
   held) leaves a 15% share. A repair the wallet cannot cover now stays owed
   on the car and is paid once cash allows, so a crash never forces debt. */
export function tickCarCrashes(S) {
  const cars = S.cars || [];
  for (const car of cars) {
    if (car.repairOwed > 0 && (Number(S.money?.cash) || 0) >= car.repairOwed) {
      walletMove(S, -car.repairOwed, `Crash repair settled, ${car.name}`, 'money');
      recordJournal(S, `You settled the outstanding repair bill for your ${car.name}.`, 'money');
      car.repairOwed = 0;
    }
  }
  if (!cars.length || (S.player?.age || 0) < 18) return;
  const last = (S.carCrashes || [])[ (S.carCrashes || []).length - 1 ];
  if (last && (S.year * 12 + S.month) - (last.year * 12 + last.month) < 48) return;
  let p = 0.0025;
  if (S.player.age < 25) p *= 1.5;
  if (!chance(S, p)) return;
  const car = cars[randInt(S, 0, cars.length - 1)];
  const severity = chance(S, 0.15) ? 'serious' : chance(S, 0.5) ? 'moderate' : 'minor';
  const share = severity === 'serious' ? 0.25 : severity === 'moderate' ? 0.12 : 0.05;
  const repair = Math.max(1, Math.round((car.valueLocal || 0) * share));
  const insured = !!S.insurance?.auto;
  const due = insured ? Math.round(repair * 0.15) : repair;
  const cash = Math.max(0, Number(S.money?.cash) || 0);
  const paid = Math.min(due, cash);
  if (paid > 0) walletMove(S, -paid, `Crash repair, ${car.name}`, 'money');
  if (due > paid) car.repairOwed = (car.repairOwed || 0) + (due - paid);
  const injury = severity === 'serious' || (severity === 'moderate' && chance(S, 0.25));
  if (injury && S.player?.vitals) S.player.vitals.health = Math.max(1, S.player.vitals.health - (severity === 'serious' ? 12 : 5));
  S.carCrashes ??= [];
  S.carCrashes.push({ carId: car.id, carName: car.name, year: S.year, month: S.month, severity, repair, paid, owed: due - paid, insured, injury });
  recordJournal(S, `Your ${car.name} was in a ${severity} crash.`, 'money');
}

export function majorEventRecent(S, kind, withinMonths = 12) {
  const now = S.year * 12 + S.month;
  return (S.majorEvents || []).filter((e) => e.kind === kind && now - (e.year * 12 + e.month) <= withinMonths);
}
