// Wedding ask: the family pays a share of the real venue at the real wedding, from the fund, capped, tied to the fiance(e).
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState, createPerson } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const M = await import('../src/systems/marriageFamilyEngine.js');
const mk = (tier, seed = 4) => { const S = createNewLifeState({ seed, country: 'usa', birthYear: 2000, familyTier: tier, gender: 'm' }); ensureExtendedState(S); S.player.age = 27; S.year = 2027; S.month = 5; S.money.cash = 1e7; F.ensureFamilyFortune(S);
  const p = createPerson(S, { role: 'partner', age: 26, gender: 'f' }); S.people[p.id] = p; S.relations.partnerId = p.id; S.marriage.engagement = { partnerId: p.id, mahrPrompt: 0 }; return { S, p }; };
{ const { S, p } = mk('wealthy'); const f = S.familyFortune;
  assert.equal(F.offerWeddingHelp(S)?.partnerId, p.id); assert.equal(F.restoreHomeScene(S, { key: 'family_wedding' })?.key, 'family_wedding', 'survives a reload');
  F.resolveWeddingHelp(S, true); assert.equal(f.weddingPledge.share, 0.5);
  const fund0 = f.fundLocal, cash0 = S.money.cash, est0 = f.companyLocal + f.fundLocal + f.otherLocal; const c0 = f.companyLocal, o0 = f.otherLocal; const r = M.celebrateWedding(S);  assert.ok(r.ok !== false, JSON.stringify(r).slice(0, 150));
  const paid = fund0 - f.fundLocal; assert.ok(paid > 0, 'the family really paid from the fund'); assert.equal(f.companyLocal + f.fundLocal + f.otherLocal, est0 - paid, 'estate falls by exactly what was paid'); assert.equal(f.weddingPledge, null);
  assert.ok(S.money.cash < cash0, 'the couple still pays the rest'); assert.equal(f.grants.at(-1).kind, 'wedding'); assert.equal(F.offerWeddingHelp(S), null, 'not offered twice'); }
{ const { S } = mk('wealthy'); F.offerWeddingHelp(S); F.resolveWeddingHelp(S, true); const f = S.familyFortune; f.giftYear = S.year; f.yearGifts = f.yearlyInflowLocal * 10; const fund0 = f.fundLocal; M.celebrateWedding(S); assert.equal(f.fundLocal, fund0, 'gift cap reached: nothing paid, explained'); }
{ const { S } = mk('wealthy'); F.offerWeddingHelp(S); F.resolveWeddingHelp(S, false); assert.ok(!S.familyFortune.weddingPledge); const fund0 = S.familyFortune.fundLocal; M.celebrateWedding(S); assert.equal(S.familyFortune.fundLocal, fund0, 'declined: no help'); }
{ const { S } = mk('middle'); assert.equal(F.offerWeddingHelp(S), null, 'not a fortune family'); }
{ const { S } = mk('wealthy'); F.offerWeddingHelp(S); F.resolveWeddingHelp(S, true); const f = S.familyFortune; const other = createPerson(S, { role: 'partner', age: 26, gender: 'f' }); S.people[other.id] = other; S.marriage.engagement = { partnerId: other.id, mahrPrompt: 0 }; const fund0 = f.fundLocal; M.celebrateWedding(S); assert.equal(f.fundLocal, fund0, 'a pledge for someone else is not paid'); }
console.log('wedding help OK');
