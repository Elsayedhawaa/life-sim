// The sibling venture (wealth event 6): own money locked three years, shared uncertain outcome, closer either way, passing neutral.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const mk = (tier, seed) => { const S = createNewLifeState({ seed, country: 'usa', birthYear: 2000, familyTier: tier, gender: 'm' }); ensureExtendedState(S); S.player.age = 28; S.year = 2028; S.money.cash = 500000; S.activeScene = null; S.sceneQueue = []; F.ensureFamilyFortune(S); return S; };
let S = null;
for (let seed = 1; seed < 150 && !S; seed++) { const T = mk('wealthy', seed); if (!(T.relations.siblingIds || []).some(id => T.people[id]?.alive && (T.people[id].birthYear != null ? T.year - T.people[id].birthYear : 99) >= 18)) continue;
  for (let m = 1; m <= 12 && !T.familyFortune.ventureOffer; m++) { T.month = m; T.activeScene = null; T.sceneQueue = []; F.offerSiblingVenture(T); }
  if (T.familyFortune.ventureOffer) S = T; }
assert.ok(S, 'an adult with an adult sibling is eventually invited');
const f = S.familyFortune, o = f.ventureOffer, sib = S.people[o.sibId];
assert.equal(F.restoreHomeScene(S, { key: 'family_venture' })?.key, 'family_venture', 'survives a reload');
const cash0 = S.money.cash, aff0 = sib.rel?.affection || 0;
assert.ok(F.resolveVenture(S, true).joined);
assert.equal(Math.round(cash0 - S.money.cash), o.stake, 'your own money goes in');
assert.ok(f.venture && !f.ventureOffer);
const c1 = S.money.cash; S.year += 2; F.checkVentureMaturity(S, f); assert.equal(S.money.cash, c1, 'locked: nothing back before three years');
S.year += 1; S.month = 12; const r = F.checkVentureMaturity(S, f);
assert.ok(r && r.mult >= 0.5 && r.mult <= 2, 'outcome within half to double');
assert.equal(Math.round(S.money.cash - c1), r.back);
assert.ok((sib.rel.affection || 0) > aff0, 'closer either way');
assert.ok(!f.venture);
// passing is neutral
{ const T = mk('wealthy', 2); const g = T.familyFortune; const id = (T.relations.siblingIds || [])[0] || Object.keys(T.people)[0]; g.ventureOffer = { sibId: id, stake: 1000, year: T.year }; const c = T.money.cash; const x = F.resolveVenture(T, false); assert.ok(x.ok && !x.joined); assert.equal(T.money.cash, c); assert.ok(!g.venture); }
// not offered when the stake could not be afforded, or to non-fortune tiers
{ const T = mk('wealthy', 3); T.money.cash = 10; for (let m = 1; m <= 12; m++) { T.month = m; assert.equal(F.offerSiblingVenture(T), null); } const U = mk('middle', 3); assert.equal(F.offerSiblingVenture(U), null); }
console.log('sibling venture OK');
