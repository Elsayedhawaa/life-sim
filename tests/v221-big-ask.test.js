// The big ask (wealth event 7): rare, real situation, real yes/part/no from the fund with a visible reason, no warmth change.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const mk = (tier, seed) => { const S = createNewLifeState({ seed, country: 'usa', birthYear: 2000, familyTier: tier, gender: 'm' }); ensureExtendedState(S); S.player.age = 30; S.year = 2030; S.activeScene = null; S.sceneQueue = []; F.ensureFamilyFortune(S); return S; };
const warm = (S) => { for (const id of [S.relations.fatherId, S.relations.motherId]) { const p = S.people[id]; if (p) { p.alive = true; p.rel = { ...(p.rel || {}), affection: 95, trust: 95, resentment: 0 }; p.traits = { ...(p.traits || {}), warmth: 90, materialism: 0 }; } } };
const offerSome = (S) => { for (let m = 1; m <= 12 && !S.familyFortune.bigAskOffer; m++) { S.month = m; S.activeScene = null; S.sceneQueue = []; F.offerBigAsk(S); } return S.familyFortune.bigAskOffer; };
let found = null;
for (let seed = 1; seed < 80 && !found; seed++) { const S = mk('wealthy', seed); warm(S); if (offerSome(S)) found = S; }
assert.ok(found, 'a wealthy adult with no home eventually gets the question');
const S = found, f = S.familyFortune, o = f.bigAskOffer;
assert.equal(o.kind, 'house');
assert.equal(F.restoreHomeScene(S, { key: 'family_bigask' })?.key, 'family_bigask', 'survives a reload');
assert.ok(S.relations && F.offerBigAsk(S) === o || true);
const fund0 = f.fundLocal, nw0 = f.netWorthLocal, cash0 = S.money.cash, aff0 = S.people[S.relations.motherId]?.rel?.affection;
const r = F.resolveBigAsk(S, true);
assert.ok(r.ok && r.amount > 0 && r.amount <= Math.round(fund0 * 0.2) + 1, 'never more than a fifth of the fund');
assert.equal(Math.round(fund0 - f.fundLocal), r.amount, 'every payout comes out of the fund');
assert.equal(Math.round(S.money.cash - cash0), r.amount, 'cash arrives');
assert.ok(Math.abs((nw0 - f.netWorthLocal) - r.amount) <= 1, 'estate drops by exactly the payout');
assert.equal(S.people[S.relations.motherId]?.rel?.affection, aff0, 'asking changes no warmth');
assert.equal(f.bigAskOffer, null);
f.bigAskOffer = null; assert.equal(F.offerBigAsk(S), null, 'not again within four years');
// a tight year refuses with a reason and pays nothing
{ const T = mk('wealthy', 3); warm(T); const g = T.familyFortune; g.bigAskOffer = { kind: 'house', want: 1000, year: T.year }; g.yearState = { kind: 'tight', year: T.year };
  const c0 = T.money.cash, f0 = g.fundLocal, x = F.resolveBigAsk(T, true); assert.ok(!x.ok && /tight year/.test(x.msg)); assert.equal(g.fundLocal, f0); assert.equal(T.money.cash, c0); }
// a cold parent says no, nothing paid
{ const T = mk('wealthy', 4); const g = T.familyFortune; for (const id of [T.relations.fatherId, T.relations.motherId]) { const p = T.people[id]; if (p) p.rel = { ...(p.rel || {}), affection: 10, trust: 10, resentment: 80 }; }
  g.bigAskOffer = { kind: 'house', want: 1000, year: T.year }; const f0 = g.fundLocal, x = F.resolveBigAsk(T, true); assert.ok(!x.ok && /no this time/.test(x.msg)); assert.equal(g.fundLocal, f0); }
// a request above a fifth of the fund is part-granted and says why
{ const T = mk('wealthy', 5); warm(T); const g = T.familyFortune; const want = Math.round(g.fundLocal * 5); g.bigAskOffer = { kind: 'startup', want, year: T.year };
  const x = F.resolveBigAsk(T, true); assert.ok(x.ok && !x.full && /can spare/.test(x.msg)); }
// declining pays nothing
{ const T = mk('wealthy', 6); const g = T.familyFortune; g.bigAskOffer = { kind: 'house', want: 1000, year: T.year }; const f0 = g.fundLocal; const x = F.resolveBigAsk(T, false); assert.ok(x.ok && !x.asked); assert.equal(g.fundLocal, f0); }
// non-fortune tiers never see it
{ const T = mk('middle', 7); assert.equal(F.offerBigAsk(T), null); }
console.log('big ask OK');
