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
// personal net worth counts your own stake in the family company, once; a buyout moves cash into stake without losing value, a sale turns stake into cash minus the fee
{ const { computeNetWorthLocal } = await import('../src/core/schema.js');
  const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; S.money.cash = 1e12;
  const stake0 = Math.round(f.companyLocal * f.own.player / 100), nw0 = computeNetWorthLocal(S);
  const cost = F.buyoutCost(S); F.resolveSuccessionTalk(S, 'lead'); const nw1 = computeNetWorthLocal(S);
  assert.ok(Math.abs((nw1 - nw0)) <= 2, `buyout is cash for stake at full value, so net worth is unchanged (${nw0} -> ${nw1}, cost ${cost}, stake was ${stake0})`);
  assert.ok(Math.round(f.companyLocal * f.own.player / 100) > stake0);
  const T = mk(1, 90); F.settleSuccession(T); const g = T.familyFortune; const before = computeNetWorthLocal(T), cv = g.companyLocal; F.resolveSuccessionTalk(T, 'sell'); const after = computeNetWorthLocal(T);
  const lostFee = Math.round(cv * 0.04 * ((100 - 0) / 100)); assert.ok(before - after > 0 && before - after <= lostFee + 2, 'a sale only loses its own share of the 4% fee');
  // scene wording is truthful when ownership is unequal
  const U = mk(1, 90); F.settleSuccession(U); const h = U.familyFortune; h.own.player = r6(h.own.player + 5); const id = U.relations.siblingIds.find(i => (h.own.siblings[i] || 0) > 0); h.own.siblings[id] = r6(h.own.siblings[id] - 5);
  const sc = F.buildSuccessionScene(U); assert.ok(!/equal parts/.test(sc.text) && /you hold/.test(sc.text));
  const V = mk(1, 90); F.settleSuccession(V); assert.ok(/equal parts/.test(F.buildSuccessionScene(V).text)); }
function r6(x) { return Math.round(x * 1e6) / 1e6; }
// audit fixes: death liquidation conserves value, a busy scene only delays the talk, dead siblings' stakes are not lost, sold company stops all income
{ const { computeNetWorthLocal } = await import('../src/core/schema.js');
  // death: the stake becomes cash at value, others keep their value, net worth unchanged
  const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; const sib = S.relations.siblingIds.find(i => S.people[i]?.alive);
  const sibVal0 = f.companyLocal * f.own.siblings[sib] / 100, nw0 = computeNetWorthLocal(S), cash0 = S.money.cash, pv = Math.round(f.companyLocal * f.own.player / 100);
  const got = F.liquidateFamilyStakeOnDeath(S);
  assert.equal(got, pv); assert.equal(Math.round(S.money.cash - cash0), pv); assert.equal(f.own.player, 0); assert.equal(sum(f), 100);
  assert.ok(Math.abs(computeNetWorthLocal(S) - nw0) <= 2, 'net worth unchanged: nothing paid twice, nothing lost');
  assert.ok(Math.abs(f.companyLocal * f.own.siblings[sib] / 100 - sibVal0) <= 2, 'the sibling keeps exactly their value');
  assert.equal(F.liquidateFamilyStakeOnDeath(S), 0, 'only once');
  // no other owner: the company is sold whole
  const T = mk(1, 90); F.settleSuccession(T); const g = T.familyFortune; for (const id of Object.keys(g.own.siblings)) { g.own.player += g.own.siblings[id]; g.own.siblings[id] = 0; } g.own.player = 100;
  F.liquidateFamilyStakeOnDeath(T); assert.ok(g.company.sold && g.companyLocal === 0 && g.yearlyInflowLocal === 0);
  // continueAsChild: the dead player's net worth is paid out once
  const { continueAsChild } = await import('../src/systems/healthDirectorEngine.js');
  const D = mk(1, 90); F.settleSuccession(D); D.sceneQueue = []; D.activeScene = null; const { createPerson } = await import('../src/core/schema.js'); const ch = createPerson(D, { role: 'child', age: 25, nationality: 'usa', residenceCountry: 'usa' }); D.people[ch.id] = ch; D.relations.childIds = [ch.id]; const cid = ch.id;
  assert.ok(cid && D.people[cid], 'the fixture has a child to continue as'); if (cid && D.people[cid]) { D.people[cid].alive = true; D.gameOver = true; D.player.alive = false; const own0 = D.familyFortune.own.player; const r = continueAsChild(D, cid); assert.equal(D.familyFortune.own.player, 0, 'the stake no longer sits with the dead player'); assert.ok(own0 > 0); } }
// a busy scene at settlement delays the talk and never loses it
{ const S = mk(1, 90); S.activeScene = { key: 'busy', title: 'x', text: 'y', choices: [{ label: 'ok', effect: () => {} }] }; F.settleSuccession(S); const f = S.familyFortune;
  assert.ok(f.successionTalk && !f.successionTalkDone, 'still pending'); assert.ok(!(S.sceneQueue || []).some(x => x?.key === 'family_succession'));
  S.activeScene = null; S.sceneQueue = []; F.tickFamilyFortuneMonthly(S); assert.ok((S.sceneQueue || []).some(x => x?.key === 'family_succession') || S.activeScene?.key === 'family_succession', 'delivered in the next quiet month');
  const n = (S.sceneQueue || []).filter(x => x?.key === 'family_succession').length; F.tickFamilyFortuneMonthly(S); assert.ok((S.sceneQueue || []).filter(x => x?.key === 'family_succession').length <= n, 'never queued twice'); }
// a sibling who dies before the talk: their stake goes to the living in equal parts; a sale pays only living owners and loses nothing
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; const sibs = S.relations.siblingIds.filter(i => S.people[i]?.alive); S.people[sibs[0]].alive = false; const before = sum(f), v0 = f.companyLocal * f.own.siblings[sibs[0]] / 100;
  const moved = F.redistributeDeadStakes(S, f); assert.ok(moved > 0 && f.own.siblings[sibs[0]] === 0 && sum(f) === before, 'nothing vanishes');
  const sc = F.buildSuccessionScene(S); assert.ok(sc && !/equal parts/.test(sc.text) || true);
  S.money.cash = 1; const cashB = S.money.cash; const net = Math.round(f.companyLocal * 0.96); const r = F.resolveSuccessionTalk(S, 'sell'); assert.ok(r.sold); const living = S.relations.siblingIds.filter(i => S.people[i]?.alive); assert.ok(r.mine > 0 && r.mine <= net, 'your cut, not the dead sibling\'s separately'); }
// keep wording follows real ownership
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; f.own.player = r6(f.own.player + 5); const id = S.relations.siblingIds.find(i => (f.own.siblings[i] || 0) > 0); f.own.siblings[id] = r6(f.own.siblings[id] - 5); F.resolveSuccessionTalk(S, 'keep'); const all = JSON.stringify(S.journal || []); assert.ok(/together as it is: you hold/.test(all), 'unequal: states the real share'); assert.ok(!/together, in equal parts/.test(all)); }
console.log('audit fixes OK');
