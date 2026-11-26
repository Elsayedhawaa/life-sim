// Family-fortune gift amounts are written in USD; in a high-denomination currency they must be scaled like the fund itself.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
function seedFor(country){
  const S = createNewLifeState({ seed: 5, country, birthYear: 2000, familyTier: 'wealthy', gender: 'm' }); ensureExtendedState(S);
  S.year = 2026; S.player.age = 26; S.career.businesses = [{ id: 'b1', dead: false }];
  const f = F.ensureFamilyFortune(S); f.fundLocal = F.fortuneLocal(S, 5e6); f.isTight = false;
  const o = F.offerSeedGift(S); return { o, S };
}
const usa = seedFor('usa').o, jpn = seedFor('jpn').o;
assert.ok(usa && jpn, 'both countries get a seed offer');
assert.ok(jpn.amount > usa.amount * 50, 'a yen seed gift is in yen, not a dollar-sized number (usa '+usa.amount+' jpn '+jpn.amount+')');
console.log('PASS v221-fortune-currency');
