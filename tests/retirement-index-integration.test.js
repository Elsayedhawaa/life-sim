import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleUSRetirement } from '../src/systems/usRetirement.js';
import { convertFinancesOnCountryMove } from '../src/systems/economyEngine.js';
import { eraLocalCost } from '../src/data/economy.js';

const retiree = (country, year, month, pension) => {
  const s = createNewLifeState({ country, seed: 9 }); ensureExtendedState(s);
  s.year = year; s.month = month; s.player.age = 70;
  Object.assign(s.career, { retired: true, retirementCountry: country, statePensionMonthly: pension, monthlyPension: pension });
  return s;
};
const idx = (c, y1, y0) => eraLocalCost(10000, c, y1) / eraLocalCost(10000, c, y0);

// Old save: no pensionIndexedYear. Baseline is set, no back-pay for earlier years.
{
  const s = retiree('gbr', 2060, 6, 4000);
  assert.equal(s.career.pensionIndexedYear, undefined);
  settleUSRetirement(s);
  assert.equal(s.career.statePensionMonthly, 4000);
  assert.equal(s.career.pensionIndexedYear, 2060);
}
// Many years: each January indexes once, result equals the product of yearly basket ratios.
{
  const s = retiree('tur', 2050, 12, 10000); s.career.pensionIndexedYear = 2050;
  let expect = 10000;
  for (let y = 2051; y <= 2070; y++) for (let m = 1; m <= 12; m++) {
    s.year = y; s.month = m; settleUSRetirement(s);
    if (m === 1) expect = Math.round(expect * idx('tur', y, y - 1));
  }
  assert.ok(Math.abs(s.career.statePensionMonthly - expect) <= 20, `${s.career.statePensionMonthly} vs ${expect}`);
}
// Emigration: converted once at the move, then indexed from the next January by the residence basket,
// with no catch-up for years before the move.
{
  const s = retiree('gbr', 2060, 11, 4000); s.career.pensionIndexedYear = 2060;
  convertFinancesOnCountryMove(s, 'gbr', 'egy'); s.country = 'egy';
  const converted = s.career.statePensionMonthly;
  s.month = 12; settleUSRetirement(s);
  assert.equal(s.career.statePensionMonthly, converted, 'no indexation outside January');
  s.year = 2061; s.month = 1; settleUSRetirement(s);
  assert.equal(s.career.statePensionMonthly, Math.round(converted * idx('egy', 2061, 2060)));
}
// US retirees are untouched by indexation.
{
  const s = retiree('usa', 2060, 12, 3000); s.career.pensionIndexedYear = 2060;
  s.year = 2061; s.month = 1; settleUSRetirement(s);
  assert.equal(s.career.pensionIndexedYear, 2060, 'US path does not use the indexation field');
}
// Zero or missing pension is never touched.
{
  const s = retiree('gbr', 2060, 12, 0); s.year = 2061; s.month = 1; settleUSRetirement(s);
  assert.equal(s.career.statePensionMonthly, 0);
}
// Private drawdown plus state: monthlyPension equals state plus draw after indexing.
{
  const s = retiree('gbr', 2060, 12, 3000); s.career.pensionIndexedYear = 2060;
  s.career.market = { pension: { paidOut: { year: 2058, month: 1, pot: 120000, monthlyTopUp: 500, remaining: 100000 } } };
  s.year = 2061; s.month = 1; settleUSRetirement(s);
  assert.equal(s.career.monthlyPension, s.career.statePensionMonthly + 500);
}
console.log('retirement indexation integration ok');
