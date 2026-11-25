// The missed-bill warning names one real action (repay). Before/after proof it exists and what it changes.
import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { createBusiness } from '../src/systems/businessEngine.js';
import { repayBusinessDebt } from '../src/systems/economyEngine.js';
const S = createNewLifeState({ seed: 31337, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' }); ensureExtendedState(S);
S.player.age = 34; S.year = 2024; S.month = 6; S.pacing = 'monthly'; S.money.cash = 2000000; S.money.creditScore = 700;
const biz = createBusiness(S, 'tech_founder', '', { mode: 'part_time' }).biz; biz.monthlyRev = 1; biz.monthlyCost = 90000; S.money.cash = 0; S.money.savings = 0;
let warning = null;
for (let m = 0; m < 14 && !warning; m++) {
  for (let g = 0; g < 6 && S.activeScene; g++) { if (/Second Missed/.test(S.activeScene.title)) { warning = S.activeScene; break; } const i = S.activeScene.choices.findIndex((c) => !c.available || c.available(S)); if (i < 0) break; resolveActiveSceneChoice(S, i); }
  if (!warning) advanceSingleTurn(S); if (!warning && /Second Missed/.test(S.activeScene?.title || '')) warning = S.activeScene;
}
assert.ok(warning, 'warning appears');
assert.doesNotMatch(warning.text, /cut costs|sell it/i, 'no unsupported actions are promised');
assert.match(warning.text, /repay the bills/i);
const owed = biz.debtLocal; assert.ok(owed > 0 && biz.misses >= 2);
S.money.cash = -5000; const noCash = repayBusinessDebt(S, biz.id); assert.equal(noCash.ok, false); assert.equal(biz.debtLocal, owed, 'refused repay changes nothing');
S.money.cash = owed + 1000; const before = S.money.cash; const ok = repayBusinessDebt(S, biz.id); assert.ok(ok.ok);
assert.equal(biz.debtLocal, 0); assert.equal(biz.misses, 0); assert.equal(S.money.cash, before - owed);
console.log('warning action proof ok: refused without cash; with cash debt', owed, '-> 0, misses reset');
