// GAME DESIGN: revenue above a business's own base row carries volume costs (85% of base other costs scale with it).
// Tuned, not source-verified. Upside only; a weak month keeps the fixed bill.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const B = await import('../src/systems/businessEngine.js');
const { computeBusinessMonthFull } = await import('../src/systems/businessMonthly.js');
function run(mult) {
  const S = createNewLifeState({ country: 'usa', seed: 7, familyTier: 'wealthy', birthYear: 1995 }); ensureExtendedState(S);
  S.year = 2026; S.month = 3; S.player.age = 30; S.money.cash = 1e9;
  const made = B.createBusiness(S, 'cafe', 'T', {}); assert.ok(made.ok, made.msg);
  const biz = S.career.businesses.at(-1); biz.monthEffects = { revenueMult: mult, notes: [] };
  S.month = 4; const pl = computeBusinessMonthFull(S, biz); return { pl, biz };
}
const a = run(1), b = run(2.5);
assert.ok(b.pl.volumeCost > 0, 'grown revenue adds a volume cost');
assert.ok(b.pl.other > a.pl.other, 'other costs rise with revenue');
const lo = run(0.6); assert.ok(!lo.pl.volumeCost, 'no discount for a weak month');
console.log('ok v221 volume costs');
