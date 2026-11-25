// The deposit offer shows one coherent snapshot: amount = shown % of a 20% deposit on the shown entry price.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
for (const seed of [4, 5, 6, 7, 8, 9]) {
  const S = createNewLifeState({ seed, country: 'usa', birthYear: 1998, familyTier: 'upper_middle', gender: 'm' }); ensureExtendedState(S);
  S.player.age = 26; S.year = 2026; S.month = 5; S.activeScene = null; S.sceneQueue = []; F.ensureFamilyFortune(S);
  const o = F.offerDepositHelp(S); if (!o) continue;
  const dep = o.entryPrice * 0.2;
  assert.ok(Math.abs(o.pct - Math.round(o.amount / dep * 100)) <= 1, `seed ${seed}: ${o.pct}% of ${dep} is not ${o.amount}`);
}
console.log('deposit snapshot OK');
