// The succession talk (wealth event 9): after the estate is settled, keep, buy out (needs agreement, costs cash) or sell (needs everyone, 4% fee).
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
function mk(seed, mood) {
  for (let sd = seed; sd < seed + 200; sd++) {
    const S = createNewLifeState({ seed: sd, country: 'usa', birthYear: 1970, familyTier: 'wealthy', gender: 'm' }); ensureExtendedState(S);
    S.player.age = 50; S.year = 2020; S.activeScene = null; S.sceneQueue = [];
    const f = F.ensureFamilyFortune(S); if (!f.company || !(S.relations.siblingIds || []).filter(i => S.people[i]?.alive).length) continue;
    for (const id of (S.relations.siblingIds || [])) { const p = S.people[id]; if (p) p.rel = { affection: mood, trust: mood, resentment: mood > 50 ? 0 : 80 }; }
    S.money.cash = 10; for (const id of [S.relations.fatherId, S.relations.motherId]) if (id && S.people[id]) S.people[id].alive = false;
    return S;
  }
}
const sum = f => Math.round((f.own.parents + f.own.pool + f.own.player + f.own.heirs + Object.values(f.own.siblings).reduce((a, b) => a + b, 0)) * 1e6) / 1e6;
// settlement queues the talk, and it survives a reload
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; assert.ok(f.successionTalk && S.sceneQueue.some(x => x && x.key === 'family_succession') || S.activeScene?.key === 'family_succession'); assert.equal(F.restoreHomeScene(S, { key: 'family_succession' })?.key, 'family_succession'); }
// keep: nothing changes
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune, o0 = JSON.stringify(f.own), c0 = f.companyLocal; F.resolveSuccessionTalk(S, 'keep'); assert.equal(JSON.stringify(f.own), o0); assert.equal(f.companyLocal, c0); assert.ok(f.successionTalkDone && !f.successionTalk); }
// lead: willing siblings sell at full value for your cash; ownership still sums to 100; company value untouched; money conserved
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; S.money.cash = 1e12; const cost = F.buyoutCost(S), cv = f.companyLocal, cash0 = S.money.cash;
  const r = F.resolveSuccessionTalk(S, 'lead'); assert.ok(r.bought > 0); assert.equal(sum(f), 100); assert.equal(f.companyLocal, cv); assert.equal(Math.round(cash0 - S.money.cash), cost, 'you pay exactly their stake value'); assert.ok(r.control && f.own.player > 50); }
// lead with no cash: nothing bought, nothing lost
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; S.money.cash = 0; const own0 = f.own.player; const r = F.resolveSuccessionTalk(S, 'lead'); assert.equal(r.bought, 0); assert.equal(f.own.player, own0); assert.equal(S.money.cash, 0); }
// cold siblings refuse; pressing costs warmth; nothing moves
{ const S = mk(1, 10); F.settleSuccession(S); const f = S.familyFortune; S.money.cash = 1e12; const own0 = JSON.stringify(f.own), id = S.relations.siblingIds.find(i => S.people[i]?.alive), a0 = S.people[id].rel.affection;
  const r = F.resolveSuccessionTalk(S, 'lead'); assert.equal(r.bought, 0); assert.equal(JSON.stringify(f.own), own0); assert.ok(S.people[id].rel.affection < a0, 'pressing costs a little warmth'); }
// sell: everyone agrees -> 4% fee, proceeds by ownership, company gone
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; const cv = f.companyLocal, mineBefore = f.own.player, cash0 = S.money.cash;
  const r = F.resolveSuccessionTalk(S, 'sell'); assert.ok(r.sold); assert.equal(Math.round(S.money.cash - cash0), r.mine); assert.ok(Math.abs(r.mine - Math.round(cv * 0.96 * mineBefore / 100)) <= 2, 'your cut of the net sale'); assert.equal(f.companyLocal, 0); assert.equal(sum(f), 0); assert.equal(F.tickFamilyFortuneMonthly(S), undefined); }
// sell is refused unless everyone agrees
{ const S = mk(1, 10); F.settleSuccession(S); const f = S.familyFortune, cv = f.companyLocal; const r = F.resolveSuccessionTalk(S, 'sell'); assert.ok(!r.sold); assert.equal(f.companyLocal, cv); assert.equal(sum(f), 100); }
console.log('succession talk OK');
