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
const sum = f => Math.round(((f.own.outside || 0) + f.own.parents + f.own.pool + f.own.player + f.own.heirs + Object.values(f.own.siblings).reduce((a, b) => a + b, 0)) * 1e6) / 1e6;
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
  // death: the stake is sold for cash someone really paid: siblings from their savings (to the cent), the rest to outsiders at a 10% discount
  const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; const sibIds = S.relations.siblingIds.filter(i => S.people[i]?.alive);
  for (const id of sibIds) S.people[id].career = { ...(S.people[id].career || {}), savingsLocal: 0 };
  const cv = f.companyLocal, pv = Math.round(cv * f.own.player / 100), cash0 = S.money.cash, nw0 = computeNetWorthLocal(S);
  const got = F.liquidateFamilyStakeOnDeath(S);
  assert.equal(Math.round(S.money.cash - cash0), got); assert.equal(f.own.player, 0); assert.equal(sum(f), 100); assert.equal(f.companyLocal, cv, 'the company is untouched');
  assert.ok(Math.abs(got - pv) <= 2, 'siblings with no savings pay nothing, so it all sells to outsiders at full value'); assert.ok(f.own.outside > 0);
  assert.ok(Math.abs(nw0 - computeNetWorthLocal(S)) <= 3, 'net worth is unchanged: the stake became cash');
  assert.equal(F.liquidateFamilyStakeOnDeath(S), 0, 'only once');
  // rich siblings really pay from savings
  const R = mk(1, 90); F.settleSuccession(R); const rf = R.familyFortune; const rs = R.relations.siblingIds.filter(i => R.people[i]?.alive); for (const id of rs) R.people[id].career = { ...(R.people[id].career || {}), savingsLocal: 1e12 };
  const sav0 = rs.reduce((a, id) => a + R.people[id].career.savingsLocal, 0), rv = Math.round(rf.companyLocal * rf.own.player / 100), rc0 = R.money.cash; const rg = F.liquidateFamilyStakeOnDeath(R);
  const sav1 = rs.reduce((a, id) => a + R.people[id].career.savingsLocal, 0);
  assert.ok(Math.abs(rg - rv) <= 3 && Math.abs((sav0 - sav1) - rg) <= 3, 'siblings pay full value and their savings fall by exactly that'); assert.ok(!(rf.own.outside > 0)); assert.equal(sum(rf), 100);
  // mixed currencies: a sibling living abroad is checked and debited in THEIR currency
  { const { convertCurrency } = await import('../src/data/economy.js');
    const M = mk(1, 90); F.settleSuccession(M); const mf = M.familyFortune; const ms = M.relations.siblingIds.filter(i => M.people[i]?.alive); const foreign = M.country === 'jpn' ? 'usa' : 'jpn';
    for (const id of ms) { M.people[id].residenceCountry = foreign; M.people[id].career = { ...(M.people[id].career || {}), savingsLocal: 0 }; }
    const mv = Math.round(mf.companyLocal * mf.own.player / 100), part = mv / ms.length;
    /* the first sibling holds savings numerically equal to the price in the player's currency, which is NOT enough once converted */
    const a = M.people[ms[0]]; a.career.savingsLocal = Math.round(part);
    const own = convertCurrency(part, M.country, foreign, M.year); const worth = convertCurrency(a.career.savingsLocal, foreign, M.country, M.year);
    const mc0 = M.money.cash; const mg = F.liquidateFamilyStakeOnDeath(M);
    const expectPay = Math.min(part, worth);
    assert.ok(Math.abs(mg - (expectPay + (mv - expectPay))) <= ms.length + 3, 'price is compared in one currency');
    assert.ok(Math.abs(convertCurrency(a.career.savingsLocal, foreign, M.country, M.year) - (worth - expectPay)) <= 3, 'debit is in their own currency');
    assert.equal(sum(mf), 100); }
  // continueAsChild: the dead player's net worth is paid out once
  const { continueAsChild } = await import('../src/systems/healthDirectorEngine.js');
  const D = mk(1, 90); F.settleSuccession(D); D.sceneQueue = []; D.activeScene = null; const { createPerson } = await import('../src/core/schema.js'); const ch = createPerson(D, { role: 'child', age: 25, nationality: 'usa', residenceCountry: 'usa' }); D.people[ch.id] = ch; D.relations.childIds = [ch.id]; const cid = ch.id;
  assert.ok(cid && D.people[cid], 'the fixture has a child to continue as'); if (cid && D.people[cid]) { D.people[cid].alive = true; D.gameOver = true; D.player.alive = false; const own0 = D.familyFortune.own.player; const r = continueAsChild(D, cid); assert.equal(D.familyFortune.own.player, 0, 'the stake no longer sits with the dead player'); assert.ok(own0 > 0); } }
// a busy scene at settlement delays the talk and never loses it
{ const S = mk(1, 90); S.activeScene = { key: 'busy', title: 'x', text: 'y', choices: [{ label: 'ok', effect: () => {} }] }; F.settleSuccession(S); const f = S.familyFortune;
  assert.ok(f.successionTalk && !f.successionTalkDone, 'still pending'); assert.ok(!(S.sceneQueue || []).some(x => x?.key === 'family_succession'));
  S.activeScene = null; S.sceneQueue = []; F.tickFamilyFortuneMonthly(S); assert.ok((S.sceneQueue || []).some(x => x?.key === 'family_succession') || S.activeScene?.key === 'family_succession', 'delivered in the next quiet month');
  const n = (S.sceneQueue || []).filter(x => x?.key === 'family_succession').length; F.tickFamilyFortuneMonthly(S); assert.ok((S.sceneQueue || []).filter(x => x?.key === 'family_succession').length <= n, 'never queued twice'); }
// a sibling who dies: their living children inherit the stake as owners (dividends, buyout, sale reach them); with no children it passes to the other living owners; settling twice changes nothing
{ const { createPerson } = await import('../src/core/schema.js');
  const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; const sibs = S.relations.siblingIds.filter(i => S.people[i]?.alive); const dead = sibs[0]; const pct = f.own.siblings[dead];
  const kid = createPerson(S, { role: 'nephew', age: 25, nationality: 'usa', residenceCountry: 'usa' }); kid.parentIds = [dead]; S.people[kid.id] = kid;
  S.people[dead].alive = false; const me0 = f.own.player, other0 = f.own.siblings[sibs[1]];
  assert.equal(F.redistributeDeadStakes(S, f), pct); assert.equal(f.own.siblings[dead], 0); assert.equal(f.own.siblings[kid.id], pct, 'the child holds the stake'); assert.equal(f.own.player, me0); assert.equal(f.own.siblings[sibs[1]], other0); assert.equal(sum(f), 100);
  assert.equal(F.redistributeDeadStakes(S, f), 0, 'idempotent');
  const sc = F.buildSuccessionScene(S); assert.ok(sc && /equal parts|you hold/.test(sc.text));
  // the heir is paid dividends
  const sv0 = kid.career?.savingsLocal || 0; f.yearlyInflowLocal = f.yearlyInflowLocal || 1e6; S.year += 1; F.payDividends(S, 0); assert.ok((kid.career.savingsLocal || 0) > sv0, 'the heir is paid dividends as an owner');
  // and receives a sale share
  const cv = f.companyLocal; const kc0 = kid.career.savingsLocal || 0; const r = F.resolveSuccessionTalk(S, 'sell'); assert.ok(r.sold); assert.ok((kid.career.savingsLocal || 0) - kc0 >= Math.round(cv * 0.96 * pct / 100) - 2, 'the heir gets their share of the proceeds'); assert.equal(sum(f), 0); }
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; const sibs = S.relations.siblingIds.filter(i => S.people[i]?.alive); S.people[sibs[0]].alive = false; const pct = f.own.siblings[sibs[0]], me0 = f.own.player;
  assert.equal(F.redistributeDeadStakes(S, f), pct); assert.ok(f.own.player > me0, 'no children: it passes to the living owners'); assert.equal(sum(f), 100); assert.equal(F.deadHolderPct(S, f), 0); assert.equal(F.redistributeDeadStakes(S, f), 0); F.tickFamilyFortuneMonthly(S); assert.equal(sum(f), 100); }
// keep wording follows real ownership
{ const S = mk(1, 90); F.settleSuccession(S); const f = S.familyFortune; f.own.player = r6(f.own.player + 5); const id = S.relations.siblingIds.find(i => (f.own.siblings[i] || 0) > 0); f.own.siblings[id] = r6(f.own.siblings[id] - 5); F.resolveSuccessionTalk(S, 'keep'); const all = JSON.stringify(S.journal || []); assert.ok(/together as it is: you hold/.test(all), 'unequal: states the real share'); assert.ok(!/together, in equal parts/.test(all)); }
console.log('audit fixes OK');
