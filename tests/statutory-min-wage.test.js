import assert from 'node:assert/strict';
import { statutoryMinMonthlyGross as F } from '../src/data/economy.js';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
// dated, month-precise rows
assert.equal(F('egy', 2025, { month: 2 }), 0); assert.equal(F('egy', 2025, { month: 3 }), 7000);
assert.equal(F('egy', 2026, { month: 12 }), 7000); assert.equal(F('egy', 2027, { month: 1 }), 8500);
assert.equal(F('tur', 2025, { month: 12 }), 0); assert.equal(F('tur', 2026, { month: 1 }), 33030);
assert.equal(F('gbr', 2030, { month: 5 }), 0);
// past the last row: indexed assumption for offers, but datedOnly stays the last legal figure
assert(F('egy', 2035, { month: 6 }) > 8500); assert.equal(F('egy', 2035, { datedOnly: true, month: 6 }), 8500);
// saved jobs: full-time lifted, part-time scaled, applies when an older save is loaded after the date
function st(country, year, month, gross, frac) {
  const s = createNewLifeState({ country, seed: 3 }); ensureExtendedState(s);
  s.year = year; s.month = month; s.player.age = 30; s.career.employed = true;
  s.career.job = { employer: 'X', title: frac ? 'part-time Y' : 'Y', monthlyGross: gross, performance: 60, workMode: 'normal', ...(frac ? { employmentFraction: 0.45 } : {}) };
  return s;
}
{ const s = st('tur', 2026, 5, 22000); settleHouseholdMonth(s); assert.equal(s.career.job.monthlyGross, 33030); assert(s.journal?.some?.((j) => /legal minimum wage/.test(j.text || j.msg || JSON.stringify(j)))); }
{ const s = st('tur', 2026, 5, 10000, true); settleHouseholdMonth(s); assert.equal(s.career.job.monthlyGross, Math.round(33030 * 0.45)); }
{ const s = st('tur', 2025, 5, 22000); settleHouseholdMonth(s); assert.equal(s.career.job.monthlyGross, 22000, 'before the effective date'); }
{ const s = st('gbr', 2026, 5, 1000); settleHouseholdMonth(s); assert.equal(s.career.job.monthlyGross, 1000, 'no floor modeled'); }
{ const s = st('egy', 2026, 5, 9000); settleHouseholdMonth(s); assert.equal(s.career.job.monthlyGross, 9000, 'already above floor'); }
console.log('statutory minimum wage floors pass');
// a promotion keeps a real raise: pay is scaled by the rung ratio from the (lifted) current pay
{ const { CAREER_TRACKS } = await import('../src/data/institutions.js'); const t = CAREER_TRACKS.trades; const r = t.rungs; assert(r[1].mult > r[0].mult, 'trades step 1->2 is a real ratio, applied to current pay'); }
console.log('promotion ratio kept');
