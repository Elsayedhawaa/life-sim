import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { enrollPostgraduateProgram, tickMegaSystemsMonthly } from '../src/systems/completeLifeSystems.js';
function life() { const s = createNewLifeState({ country: 'egy', seed: 9, familyTier: 'wealthy', birthYear: 1990, age: 0 }); ensureExtendedState(s); s.player.age = 25; s.year = 2015; s.month = 9; s.education.degrees = ['business']; s.education.university = null; return s; }
for (const [tier, mult] of [['masters_mba', 1.26], ['fellowship_phd', 1.42]]) {
  const s = life();
  if (tier === 'fellowship_phd') s.postgrad.completed.push({ tier: 'masters_mba' });
  s.career.employed = true; s.career.job = { title: 'Analyst', monthlyGross: 10000 };
  const r = enrollPostgraduateProgram(s, tier, 'family'); assert.ok(r.ok, r.msg);
  for (let i = 0; i < 40 && s.postgrad.active; i++) tickMegaSystemsMonthly(s);
  assert.equal(s.postgrad.active, null, 'finished');
  assert.equal(s.career.job.monthlyGross, Math.round(10000 * mult), tier + ' completion raise matches promised %');
}
console.log('postgrad-pay OK');
