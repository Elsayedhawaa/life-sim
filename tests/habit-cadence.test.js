import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { doDailyActivity, activityAvailability, CHILD_YEAR_SESSIONS } from '../src/systems/completeLifeSystems.js';
import { V1_ACTIVITIES } from '../src/data/megaCareerEduMedical.js';

const life = (age, pacing) => { const s = createNewLifeState({ country: 'egy', seed: 4 }); ensureExtendedState(s); s.player.age = age; s.pacing = pacing; s.year = 2030; s.month = 3; s.money.cash = 1e6; return s; };
const snap = (s) => JSON.stringify([s.player.vitals, s.skills.fitness, s.money.cash, s.journal.length]);

// Adult, monthly: once per calendar month, reason shown, nothing changes on refusal.
{
  const s = life(25, 'monthly');
  assert.ok(doDailyActivity(s, 'jog').ok);
  const before = snap(s);
  const r = doDailyActivity(s, 'jog');
  assert.equal(r.ok, false); assert.match(r.msg, /this month/);
  assert.equal(snap(s), before, 'a refused repeat changes nothing');
  assert.equal(activityAvailability(s, 'jog').ok, false);
  assert.equal(activityAvailability(s, 'gym').ok, true, 'other habits are independent');
  // seven clicks in a row give the same result as one
  const fit = s.skills.fitness; for (let i = 0; i < 7; i++) doDailyActivity(s, 'jog'); assert.equal(s.skills.fitness, fit);
  s.month = 4; assert.ok(doDailyActivity(s, 'jog').ok, 'next month it is available again');
}
// Reload safe: the lock survives a save and load round trip.
{
  const s = life(25, 'monthly'); doDailyActivity(s, 'jog');
  const t = JSON.parse(JSON.stringify(s)); ensureExtendedState(t);
  assert.equal(activityAvailability(t, 'jog').ok, false);
  assert.equal(doDailyActivity(t, 'jog').ok, false);
}
// Childhood, yearly turns: a month habit is not collapsed to one a year.
{
  const s = life(9, 'yearly');
  for (let i = 0; i < CHILD_YEAR_SESSIONS; i++) assert.ok(doDailyActivity(s, 'jog').ok, `session ${i + 1}`);
  const r = doDailyActivity(s, 'jog'); assert.equal(r.ok, false); assert.match(r.msg, /this year/);
  s.year++; assert.ok(doDailyActivity(s, 'jog').ok, 'next childhood year starts fresh');
}
// A "year" habit is once per year in both paces.
{
  const yearly = V1_ACTIVITIES.find((a) => a.repeat === 'year');
  assert.ok(yearly, 'there is a yearly habit');
  for (const [age, pacing] of [[25, 'monthly'], [9, 'yearly']]) {
    const s = life(age, pacing); const first = doDailyActivity(s, yearly.id);
    if (!first.ok) continue; // unaffordable or age-locked for this fixture
    const again = doDailyActivity(s, yearly.id); assert.equal(again.ok, false); assert.match(again.msg, /this year/);
    s.month = 9; assert.equal(doDailyActivity(s, yearly.id).ok, false, 'same year, later month, still locked');
    s.year++; assert.ok(doDailyActivity(s, yearly.id).ok);
  }
}
// Age guard: an age 0 life cannot start the gym and nobody is charged.
{
  const s = life(0, 'yearly'); const cash = s.money.cash; const r = doDailyActivity(s, 'gym');
  assert.equal(r.ok, false); assert.match(r.msg, /Needs age 14/); assert.equal(s.money.cash, cash);
  assert.equal(activityAvailability(s, 'gym').locked, 'age');
}
// Cost is not charged for a refused repeat.
{
  const s = life(25, 'monthly'); doDailyActivity(s, 'gym'); const cash = s.money.cash; assert.equal(doDailyActivity(s, 'gym').ok, false); assert.equal(s.money.cash, cash);
}
console.log('habit cadence ok');
