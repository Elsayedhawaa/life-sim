/* Illness and accidents for adult relatives under 58.

   Before this, a relative could only fall ill or die from 58 on, so a
   sibling, spouse or adult child never did. Here a death always has a cause
   that was recorded earlier (an illness with a start year, or an accident
   record), never a label invented at the moment of death.

   Scope, stated plainly: relatives are parents, siblings, spouses and
   children who are 18 to 57. Minors are deliberately excluded (a design
   choice, not a gap to hide). Friends, partners, bosses and everyone
   58 and over are handled elsewhere or not at all.

   Rolls are deterministic hashes of (life seed, person, year, purpose), so
   they never consume the shared random stream and old saves and tests keep
   their sequences. All fields are optional on a person; nothing is
   back-filled for old saves. The rates are game-design numbers, not
   actuarial data. */
import { hashSeed, clamp } from '../core/rng.js';
import { recordJournal } from '../core/schema.js';
import { handleNpcDeath } from './soulEngine.js';

export const NPC_HEALTH_MIN_AGE = 18;
export const NPC_HEALTH_MAX_AGE = 57;

/* Illness kinds: mort = chance of dying in a year while ill; recover =
   chance of full recovery in a year; minAge keeps old-age diseases out. */
export const YOUNG_ILLNESSES = [
  { kind: 'cancer', weight: 3, minAge: 18, mort: 0.10, recover: 0.12 },
  { kind: 'heart disease', weight: 1.5, minAge: 35, mort: 0.05, recover: 0 },
  { kind: 'a stroke', weight: 0.6, minAge: 40, mort: 0.08, recover: 0 },
  { kind: 'a serious infection', weight: 2, minAge: 18, mort: 0.04, recover: 0.8 },
  { kind: 'an autoimmune disease', weight: 1.5, minAge: 18, mort: 0.005, recover: 0 },
];

const ACCIDENT_YEARLY = 0.015;
const ACCIDENT_SEVERITY = [['minor', 0.70], ['moderate', 0.25], ['fatal', 0.05]];

function roll(S, person, year, purpose) {
  return (hashSeed(`${S.seed}|${person.id}|${year}|${purpose}`) % 100000) / 100000;
}

function onsetHazard(person) {
  const a = person.age;
  const base = a < 30 ? 0.0015 : a < 40 ? 0.003 : a < 50 ? 0.007 : 0.014;
  return base * ((person.vitals?.health ?? 70) < 50 ? 1.6 : 1);
}

function relatives(S) {
  const r = S.relations || {}, out = [];
  const add = (id, role) => { const p = id && S.people?.[id]; if (p && p.alive && p.id !== 'player') out.push([p, role]); };
  add(r.motherId, 'mother'); add(r.fatherId, 'father');
  (r.spouseIds || []).forEach((id) => add(id, 'spouse'));
  (r.siblingIds || []).forEach((id) => add(id, 'sibling'));
  (r.childIds || []).forEach((id) => add(id, 'child'));
  return out;
}

const ROLE_WORD = { mother: 'your mother', father: 'your father', spouse: 'your spouse', sibling: 'your sibling', child: 'your child' };
const who = (p, role) => `${ROLE_WORD[role]}, ${p.firstName}`;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function pickIllness(S, person) {
  const pool = YOUNG_ILLNESSES.filter((k) => person.age >= k.minAge);
  const total = pool.reduce((n, k) => n + k.weight, 0);
  let r = roll(S, person, S.year, 'kind') * total;
  for (const k of pool) { if (r < k.weight) return k; r -= k.weight; }
  return pool[0];
}

export function tickNpcHealthLife(S) {
  if (!S?.people) return [];
  const events = [];
  for (const [person, role] of relatives(S)) {
    if (!person.alive || person.age < NPC_HEALTH_MIN_AGE || person.age > NPC_HEALTH_MAX_AGE) continue;
    person.vitals ??= { health: 70 };
    const y = S.year;
    /* 1. A sudden accident. */
    if (roll(S, person, y, 'accident') < ACCIDENT_YEARLY) {
      let r = roll(S, person, y, 'severity'), sev = 'minor';
      for (const [k, w] of ACCIDENT_SEVERITY) { if (r < w) { sev = k; break; } r -= w; }
      person.accident = { year: y, severity: sev };
      if (sev === 'fatal') {
        handleNpcDeath(S, person);
        person.deathCause = 'an accident';
        events.push({ kind: 'accident_death', id: person.id, role });
        continue;
      }
      person.vitals.health = clamp(person.vitals.health - (sev === 'moderate' ? 15 : 5));
      recordJournal(S, `${cap(who(person, role))}, was hurt in an accident (${sev}).`, 'family');
      events.push({ kind: 'accident_injury', id: person.id, role, severity: sev });
    }
    /* 2. An existing illness runs its course. */
    const ill = person.illness;
    if (ill && !ill.old) {
      const def = YOUNG_ILLNESSES.find((k) => k.kind === ill.kind);
      if (def && ill.sinceYear < y) {
        if (roll(S, person, y, 'death') < def.mort) {
          handleNpcDeath(S, person);
          events.push({ kind: 'illness_death', id: person.id, role });
          continue;
        }
        if (def.recover && roll(S, person, y, 'recover') < def.recover) {
          (person.pastIllnesses ??= []).push({ kind: ill.kind, sinceYear: ill.sinceYear, resolvedYear: y });
          person.illness = null;
          person.vitals.health = clamp(person.vitals.health + 10);
          recordJournal(S, `${cap(who(person, role))}, has recovered from ${ill.kind}.`, 'family');
          events.push({ kind: 'illness_recovered', id: person.id, role });
        }
      }
      continue;
    }
    /* 3. A new serious illness. */
    if (!person.illness && roll(S, person, y, 'onset') < onsetHazard(person)) {
      const def = pickIllness(S, person);
      person.illness = { kind: def.kind, sinceYear: y };
      person.vitals.health = clamp(person.vitals.health - 15);
      recordJournal(S, `${cap(who(person, role))}, has been diagnosed with ${def.kind}.`, 'family');
      events.push({ kind: 'illness_onset', id: person.id, role, illness: def.kind });
    }
  }
  return events;
}
