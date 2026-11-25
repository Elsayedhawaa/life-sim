// Launching a business and selling it in the same month must not make money, and the "profitable sale" achievement must still match a sale line with a suffix.
import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { launchSmallBusiness } from '../src/systems/careerEducationEngine.js';
import { sellBusiness } from '../src/systems/businessEngine.js';
import { businessValuation } from '../src/data/businessValuation.js';
import { evaluateProgress, getProgress } from '../src/systems/progressEngine.js';
for (const [country, year] of [['egy', 2025], ['usa', 2025], ['egy', 2009]]) {
  const S = createNewLifeState({ seed: 777, country, birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' }); ensureExtendedState(S);
  S.year = year; S.month = 1; S.player.age = 35; S.money.cash = 5e6;
  const before = S.money.cash; assert.ok(launchSmallBusiness(S, 'cafe', 'Flip', { mode: 'part_time' }).ok);
  const biz = S.career.businesses[0]; evaluateProgress(S);
  assert.ok(sellBusiness(S, biz.id).ok);
  assert.ok(S.money.cash < before, `${country} ${year}: instant launch-and-sell loses money (before ${before}, after ${S.money.cash})`);
}
// A business that has traded counts its earnings.
const T = createNewLifeState({ seed: 5, country: 'egy', birthYear: 1990 }); ensureExtendedState(T);
const fresh = { capitalInvested: 1000000, staff: [], monthlyRev: 400000, monthlyCost: 100000 };
const traded = { ...fresh, lastPL: { net: 250000 } };
assert.ok(businessValuation(traded) > businessValuation(fresh) * 2, 'a month of real profit raises the value');
// Achievement: the sale line carries ", after unpaid bills" and still counts when the price beat the capital.
const P = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' }); ensureExtendedState(P);
P.year = 2025; P.month = 1; P.player.age = 35; P.money.cash = 5e6; launchSmallBusiness(P, 'cafe', 'Good Cafe', { mode: 'part_time' });
const pb = P.career.businesses[0]; evaluateProgress(P); pb.lastPL = { net: 400000, revenue: 900000, costs: 500000 }; pb.monthlyRev = 900000;
assert.ok(sellBusiness(P, pb.id).ok); evaluateProgress(P);
assert.ok((getProgress(P).earned || []).some((e) => e.id === 'business_sold_profit'), 'profitable sale earns the achievement');
console.log('business flip + sold-profit OK');
