/* Major life events are announced from the saved state that actually changed
   during the turn (promotion record, a person's death, an affair coming out,
   a separation or divorce, losing a job, an eviction, a car crash). Each
   announcement is an urgent card that interrupts play, and each is stored in
   S.majorEvents so later events can be gated on it. Nothing here invents a
   change: if the state did not change, nothing is announced. */
import { chance } from '../core/rng.js';
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

function announce(S, kind, { title, text, personId = null, facts = {}, journal = null }) {
  S.majorEvents ??= [];
  const rec = { kind, year: S.year, month: S.month, turn: S.turn, personId, facts };
  S.majorEvents.push(rec);
  if (S.majorEvents.length > 120) S.majorEvents.splice(0, S.majorEvents.length - 120);
  const key = `major_${kind}_${S.year}_${S.month}_${personId || 'self'}`;
  queueScene(S, {
    key, baseId: key, category: 'milestone', title, text, urgent: true, major: true, majorKind: kind, maxPerLife: 99,
    choices: continueChoices(text, journal),
  }, true);
  return rec;
}

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
      }));
    }
  }
  for (const [id, b] of Object.entries(before.people)) {
    const p = S.people?.[id];
    if (b.alive && p && !p.alive) {
      const nm = p.fullName || p.firstName || ROLE_WORD[b.role];
      made.push(announce(S, 'death', {
        title: `${p.firstName || 'Someone close'} Has Died`,
        text: `${nm}, ${ROLE_WORD[b.role]}, has died${p.age ? ` at ${p.age}` : ''}${p.deathCause ? ` of ${p.deathCause}` : ''}.`,
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
      made.push(announce(S, 'separation', { title: `${p.firstName} Is Leaving`, text: `You and ${p.firstName} are now separated and living apart.`, personId: id, facts: {} }));
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
      text: `Your ${c.carName} was in a ${c.severity} crash. ${c.injury ? 'You were hurt. ' : 'You were not badly hurt. '}Repairs cost ${formatMoney(c.repair, S.country)}; ${c.insured ? `insurance covered most of it and you paid ${formatMoney(c.paid, S.country)}` : `you had no auto cover, so you paid ${formatMoney(c.paid, S.country)}`}.`,
      facts: { carId: c.carId, severity: c.severity, paid: c.paid, insured: c.insured },
    }));
  }
  return made;
}

/* Rare, real consequence of owning and driving a car. */
export function tickCarCrashes(S) {
  for (const car of S.cars || []) {
    let p = 0.004;
    if ((S.player?.age || 30) < 25) p *= 1.6;
    if ((car.condition ?? 100) < 50) p *= 1.4;
    if (!chance(S, p)) continue;
    const roll = chance(S, 0.2) ? 'serious' : chance(S, 0.5) ? 'moderate' : 'minor';
    const share = roll === 'serious' ? 0.28 : roll === 'moderate' ? 0.14 : 0.05;
    const repair = Math.max(1, Math.round((car.valueLocal || 0) * share));
    const insured = !!S.insurance?.auto;
    const paid = insured ? Math.round(repair * 0.15) : repair;
    const injury = roll === 'serious' || (roll === 'moderate' && chance(S, 0.3));
    walletMove(S, -paid, `Crash repair, ${car.name}`, 'money');
    car.condition = Math.max(20, (car.condition ?? 100) - (roll === 'serious' ? 35 : roll === 'moderate' ? 20 : 8));
    if (injury && S.player?.vitals) S.player.vitals.health = Math.max(1, S.player.vitals.health - (roll === 'serious' ? 14 : 6));
    S.carCrashes ??= [];
    S.carCrashes.push({ carId: car.id, carName: car.name, year: S.year, month: S.month, severity: roll, repair, paid, insured, injury });
    recordJournal(S, `Your ${car.name} was in a ${roll} crash. Repairs ${repair}; you paid ${paid}.`, 'money');
    break; // one crash a month
  }
}

export function majorEventRecent(S, kind, withinMonths = 12) {
  const now = S.year * 12 + S.month;
  return (S.majorEvents || []).filter((e) => e.kind === kind && now - (e.year * 12 + e.month) <= withinMonths);
}
