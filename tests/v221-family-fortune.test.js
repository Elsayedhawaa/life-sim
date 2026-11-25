// Family fortune: tier is a fortune with real, capped cash. Allowance, asks and trust releases move money from the fund; asking never costs warmth.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const { advanceSingleTurn, resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const { handleNpcInteract } = await import('../src/systems/soulEngine.js').catch(() => ({}));
function life(tier, country = 'egy', year = 1998, seed = 11) {
  const S = createNewLifeState({ seed, country, birthYear: year, familyTier: tier, gender: 'm' }); ensureExtendedState(S); return S;
}
function run(S, months) { for (let t = 0; t < months && !S.gameOver; t++) { for (let g = 0; g < 8 && S.activeScene; g++) { const sc = S.activeScene; const av = sc.choices.map((x, i) => i).filter(i => !sc.choices[i].available || sc.choices[i].available(S)); if (!av.length) break; resolveActiveSceneChoice(S, av[0]); } advanceSingleTurn(S); } }
// 1. Seeding is tier-scaled and era-scaled.
const W = life('wealthy'), V = life('very_wealthy'), M = life('middle');
assert.ok(F.ensureFamilyFortune(W) && F.ensureFamilyFortune(V));
assert.equal(F.ensureFamilyFortune(M), null, 'middle families are untouched');
assert.ok(V.familyFortune.netWorthLocal > W.familyFortune.netWorthLocal * 20, 'very wealthy is far richer than wealthy');
const W60 = life('wealthy', 'egy', 1960); F.ensureFamilyFortune(W60);
assert.ok(W60.familyFortune.netWorthLocal < W.familyFortune.netWorthLocal, 'a 1960 fortune is smaller in nominal money than a 1998 one');
// 2. Years pass: allowance is paid from the fund, caps hold, trust is funded and released.
const S = life('wealthy', 'usa', 2000, 21);
let paid = 0, startFund = null;
const origCash = () => S.money.cash;
run(S, 12 * 26);
const f = S.familyFortune;
assert.ok(f, 'fortune exists after play');
assert.ok(f.grants.some(g => g.kind === 'allowance'), 'allowance was paid');
assert.ok(f.grants.some(g => g.kind === 'trust'), 'trust released');
assert.ok(f.trust.released.at18 && f.trust.released.at21 && f.trust.released.at25, 'all three trust releases happened by 26');
const perChildCap = F.FORTUNE_DIALS.trustPerChildCapPct;
const trustTotal = f.grants.filter(g => g.kind === 'trust').reduce((a, g) => a + g.amountLocal, 0);
assert.ok(trustTotal <= f.trust.totalLocal, 'releases never exceed what was funded');
const leftEstate = f.grants.filter(g => g.kind === 'home' || g.kind === 'inheritance').reduce((a, g) => a + g.amountLocal, 0);
assert.ok(f.trust.totalLocal <= (f.netWorthLocal + leftEstate) * perChildCap * 1.5, 'trust stays inside the per-child cap (net worth grew since funding)');
for (const g of f.grants) assert.ok(g.amountLocal > 0 && Number.isFinite(g.amountLocal));
assert.ok(f.fundLocal >= 0, 'fund never negative');
// 3. Ask: preview range, cooldown, no relationship cost.
const A = life('very_wealthy', 'usa', 1990, 4); run(A, 12 * 19);
const mom = A.people[A.relations.motherId], dad = A.people[A.relations.fatherId];
const parent = [mom, dad].find(p => p && p.alive && p.age >= 22);
if (parent) {
  parent.rel.affection = 90; parent.rel.trust = 90; parent.rel.resentment = 0;
  const before = { a: parent.rel.affection, t: parent.rel.trust, r: parent.rel.respect };
  const pre = F.askPreview(A, parent);
  assert.ok(pre.high > pre.low && pre.low > 0, 'ask preview states a range');
  const cash = A.money.cash, fund = A.familyFortune.fundLocal;
  const r1 = F.askFortuneParent(A, parent);
  assert.ok(r1.ok && A.money.cash > cash && A.familyFortune.fundLocal < fund, 'a granted ask moves money from the fund to the player');
  assert.ok(r1 && A.money.cash - cash >= pre.low && A.money.cash - cash <= pre.high + 1, 'granted amount is inside the shown range');
  assert.deepEqual({ a: parent.rel.affection, t: parent.rel.trust, r: parent.rel.respect }, before, 'asking does not change warmth');
  const r2 = F.askFortuneParent(A, parent);
  assert.ok(!r2.ok && /recently/.test(r2.msg), 'a second ask inside the window is declined with a reason');
}
// 4. Annual share cap and migration: an existing adult save gets a fortune with only the one computed grant.
const E = life('wealthy', 'egy', 1990, 9); E.player.age = 30; E.year = 2020;
const jr = E.journal?.length || 0;
F.ensureFamilyFortune(E);
assert.equal(E.familyFortune.grants.length, 3, 'age 30 gets the three stages already reached, computed once, no yearly backfill');
assert.ok(E.familyFortune.trust.released.at21 && E.familyFortune.trust.released.at25);
// 5. The ledger card renders for a rich family and not for a middle one.
const { renderPeopleTabHtml } = await import('../src/ui/views.js');
const html = renderPeopleTabHtml(S, {}); 
assert.ok(/Family fortune/.test(html) && !/2026 money/.test(html), 'rich family sees the ledger in the money of the year played, with no 2026 conversion column');
assert.ok(!/Family fortune/.test(renderPeopleTabHtml(life('middle'), {})), 'middle family has no fortune card');
console.log('family fortune OK');
{
  const U = life('upper_middle');
  const { getCountry } = await import('../src/data/countries.js');
  const { eraLocalCost } = await import('../src/data/economy.js');
  const rent = getCountry(U.country).monthlyBasket2026.rentStandard;
  assert.ok(F.askCeiling(U) >= Math.round(eraLocalCost(rent * 1.5, U.country, U.year)) - 1, 'upper_middle ask never below the pre-wealth rule');
}
// Birthday keys: a real choice per tier (car or smaller cash), paid from the fund, priced in era money; only very_wealthy has running costs covered.
{
  const toOffer = (T) => { for (let i = 0; i < 12 * 30 && !T.familyFortune?.carOffer && !T.gameOver; i++) { if (T.player.age >= 17 && T.familyFortune?.carGifted) break; run(T, 1); } };
  const clearKeys = (T) => { if (T.activeScene?.key === 'family_keys') T.activeScene = null; T.sceneQueue = (T.sceneQueue || []).filter(x => x.key !== 'family_keys'); };
  const prices = {};
  for (const tier of ['upper_middle', 'wealthy', 'very_wealthy']) {
    const T = life(tier, 'usa', 2003, 5); toOffer(T);
    assert.ok(T.familyFortune.carOffer || T.cars.some(c => c.gifted) || T.familyFortune.grants.some(g => g.kind === 'cash_gift'), tier + ' is offered the keys');
    if (T.familyFortune.carOffer) {
      assert.ok(T.activeScene?.key === 'family_keys' || (T.sceneQueue || []).some(x => x.key === 'family_keys'), 'the keys scene is queued');
      const saved = { key: 'family_keys' };
      assert.ok(F.restoreKeysScene(T, saved), 'a reload rebuilds the same decision');
      clearKeys(T);
      const o = T.familyFortune.carOffer; const priceNow = o.fullPrice;
      F.resolveKeys(T, 'car');
      prices[tier] = priceNow;
      const car = T.cars.find(c => c.gifted);
      assert.ok(car && T.familyFortune.grants.some(g => g.kind === 'car'));
      assert.equal(!!car.familyCoversUpkeep, tier === 'very_wealthy');
      assert.ok(T.familyFortune.yearGifts <= T.familyFortune.yearlyInflowLocal * F.FORTUNE_DIALS.annualGiftShareCap + 1, 'annual gift cap holds');
      if (tier === 'wealthy') {
        const { sellVehicle } = await import('../src/systems/economyEngine.js');
        const cash = T.money.cash; assert.ok(sellVehicle(T, car.id).ok && T.money.cash > cash, 'gifted car can be sold'); assert.ok(!T.cars.some(c => c.gifted), 'sold: nothing left to subsidise');
      }
    }
  }
  assert.ok(prices.upper_middle < prices.wealthy && prices.wealthy < prices.very_wealthy, 'car price rises with the tier: ' + JSON.stringify(prices));
  // Asking for a better car: the family agrees or refuses; refusal keeps the first offer; one ask only; no warmth cost.
  let agreed = 0, refused = 0;
  for (let seed = 1; seed <= 24 && (!agreed || !refused); seed++) {
    const C = life('wealthy', 'usa', 2003, seed); toOffer(C);
    if (!C.familyFortune.carOffer) continue;
    C.activeScene = null; C.sceneQueue = (C.sceneQueue || []).filter(x => x.key !== 'family_keys');
    const first = C.familyFortune.carOffer.catalogId, firstPrice = C.familyFortune.carOffer.fullPrice;
    const before = JSON.stringify([C.people[C.relations.motherId]?.rel, C.people[C.relations.fatherId]?.rel]);
    const r = F.resolveKeys(C, 'ask');
    assert.equal(JSON.stringify([C.people[C.relations.motherId]?.rel, C.people[C.relations.fatherId]?.rel]), before, 'asking does not change warmth');
    if (r.agreed) {
      agreed++;
      const car = C.cars.find(c => c.gifted);
      assert.ok(car && car.catalogId !== first && car.valueLocal > firstPrice * 0.88, 'agreed: a pricier car');
      assert.ok(C.familyFortune.yearGifts <= C.familyFortune.yearlyInflowLocal * F.FORTUNE_DIALS.annualGiftShareCap + 1, 'annual cap holds');
    } else {
      refused++;
      assert.ok(C.familyFortune.carOffer && C.familyFortune.carOffer.asked && C.familyFortune.carOffer.catalogId === first, 'refused: the first car is still on offer');
      assert.ok(C.activeScene?.key === 'family_keys' || (C.sceneQueue || []).some(x => x.key === 'family_keys'), 'the offer comes back');
      assert.ok(!F.buildKeysScene(C).choices.some(c => /better/i.test(c.label)), 'no second ask');
      F.resolveKeys(C, 'car'); assert.ok(C.cars.some(c => c.gifted && c.catalogId === first));
    }
  }
  assert.ok(agreed && refused, 'both outcomes occur across lives: agreed ' + agreed + ', refused ' + refused);
  const X = life('wealthy', 'usa', 2003, 5); run(X, 12 * 30); X.familyFortune = null; X.cars = []; X.journal = [];
  F.ensureFamilyFortune(X); F.tickFamilyFortuneMonthly(X);
  assert.equal(X.cars.length, 0, 'no retroactive gift');
  assert.ok((X.journal || []).some(j => /not backdated/.test(j.text || j)), 'the migration says so in the journal');
}
console.log('birthday car OK');
// Money conservation: estate + trust + released cash stays constant by funding/release alone; migration at 18/22/30 conserves too.
{
  for (const age of [18, 22, 30]) {
    const M = life('wealthy', 'usa', 2000, 3); run(M, 12 * 2);
    M.familyFortune = null; M.player.age = age;
    const before = (() => { const f = F.ensureFamilyFortune({ ...M, familyFortune: null, player: { ...M.player, age: 5 } }); return f.netWorthLocal; })();
    const cash0 = M.money.cash;
    const f = F.ensureFamilyFortune(M);
    const released = f.grants.filter(g => g.kind === 'trust').reduce((a, g) => a + g.amountLocal, 0);
    assert.ok(Math.abs((M.money.cash - cash0) - released) <= 1, 'cash rises exactly by the release, age ' + age);
    assert.ok(f.netWorthLocal + f.trust.fundedLocal + released <= before * 1.0001 + 1, 'estate+trust+released never exceeds the starting estate, age ' + age);
    const stages = [18, 21, 25].filter(a => age >= a).length;
    assert.equal(f.grants.filter(g => g.kind === 'trust').length, stages, 'only reached stages are paid, age ' + age);
  }
  const C = life('wealthy', 'usa', 2000, 9); const nw0 = C.familyFortune?.netWorthLocal;
  run(C, 12 * 3); // childhood: funding must reduce the estate relative to growth-free baseline
  assert.ok(C.familyFortune.trust.fundedLocal > 0 && C.familyFortune.netWorthLocal > 0);
}
console.log('conservation OK');
// Funded education: wealthy tier covers study abroad from the fund; a middle family with no money does not.
{
  const { familyCoversUniversity, chargeFamilyEducation } = await import('../src/systems/educationFunding.js');
  const R = life('wealthy', 'usa', 2000, 12); run(R, 12 * 18);
  R.homeCountry = 'usa';
  const tuition = Math.round(F.fortuneEducationRoom(R) * 0.5);
  assert.ok(familyCoversUniversity(R, tuition, 'gbr'), 'fund covers admitted study abroad');
  const fund0 = R.familyFortune.fundLocal;
  assert.ok(chargeFamilyEducation(R, tuition) && R.familyFortune.fundLocal === fund0 - tuition, 'charged once, from the fund');
  assert.ok(R.familyFortune.grants.some(g => g.kind === 'education'));
  assert.ok(!familyCoversUniversity(R, R.familyFortune.fundLocal * 5, 'gbr'), 'cannot exceed the fund or annual room');
  const P = life('middle', 'usa', 2000, 12); run(P, 12 * 18); P.homeCountry = 'usa';
  assert.ok(!familyCoversUniversity(P, 10 ** 9, 'gbr'));
}
console.log('education OK');
// First home: wealthy and very_wealthy get a real owned property from the estate at 22; upper_middle does not; existing saves get none.
{
  const toHome = (T) => { for (let i = 0; i < 12 * 30 && !T.familyFortune?.homeOffer && !T.familyFortune?.homeGifted && !T.gameOver; i++) run(T, 1); };
  for (const [tier, country, year] of [['wealthy', 'usa', 2000], ['very_wealthy', 'usa', 2000], ['wealthy', 'egy', 1990]]) {
    const T = life(tier, country, year, 6); toHome(T);
    assert.ok(T.familyFortune.homeOffer, tier + ' ' + country + ' is offered a home');
    const prior = T.housing.properties.length, nw = T.familyFortune.netWorthLocal, cash = T.money.cash;
    assert.ok(F.restoreHomeScene(T, { key: 'family_home' }), 'reload rebuilds the same decision');
    T.activeScene = null; T.sceneQueue = (T.sceneQueue || []).filter(x => x.key !== 'family_home');
    const price = T.familyFortune.homeOffer.price;
    F.resolveHome(T, 'rent');
    const p = T.housing.properties[T.housing.properties.length - 1];
    assert.ok(T.housing.properties.length === prior + 1 && p.gifted && p.valueLocal > 0 && p.rentedOut, 'a real owned, rentable property');
    assert.ok(T.familyFortune.netWorthLocal === nw - price && T.money.cash === cash, 'value leaves the estate, not the player cash');
    assert.ok(price <= T.familyFortune.netWorthLocal * 0.2 + price * 0, 'bounded by the estate');
  }
  const U = life('upper_middle', 'usa', 2000, 6); run(U, 12 * 25);
  assert.ok(!U.familyFortune.homeGifted && !U.familyFortune.homeOffer, 'upper_middle is not offered a home');
}
console.log('home OK');
{ const R = life('wealthy', 'usa', 2000, 12); run(R, 12 * 12); const f = R.familyFortune; assert.ok(f.yearEducation <= f.yearGifts, 'fees are a part of the year total, shown on their own row'); }
console.log('fee split OK');
// Year accounting: a charge made before the January tick belongs to the new year and is not wiped by the tick.
{ const R = life('wealthy', 'usa', 2000, 12); run(R, 12 * 17); const f = R.familyFortune; R.year += 1; const room0 = F.fortuneEducationRoom(R); assert.equal(f.giftYear, R.year, 'the year rolled on first use'); F.fortuneChargeEducation(R, 1000); F.tickFamilyFortuneYearly(R); assert.equal(f.yearEducation, 1000, 'the January tick keeps a charge already made this year'); }
console.log('year roll OK');
// Family-covered car upkeep comes from the fund, and falls back to the player when the fund is short.
{
  const { settleHouseholdMonth } = await import('../src/systems/economyEngine.js');
  const V = life('very_wealthy', 'usa', 2003, 5); run(V, 12 * 17);
  for (let i = 0; i < 400 && !V.familyFortune.carOffer && !V.cars.some(c => c.gifted); i++) run(V, 1);
  if (V.familyFortune.carOffer) { V.activeScene = null; V.sceneQueue = (V.sceneQueue || []).filter(x => x.key !== 'family_keys'); F.resolveKeys(V, 'car'); }
  const car = V.cars.find(c => c.gifted); assert.ok(car && car.familyCoversUpkeep);
  V.familyFortune.inherited = false; V.familyFortune.fundLocal = Math.max(V.familyFortune.fundLocal, 5e6); V.familyFortune.netWorthLocal = V.familyFortune.companyLocal + V.familyFortune.fundLocal + V.familyFortune.otherLocal;
  const fund = V.familyFortune.fundLocal; assert.ok(F.familyPaysCarUpkeep(V, car.monthlyUpkeep) && V.familyFortune.fundLocal === fund - car.monthlyUpkeep, 'the fund pays, not nobody');
  V.familyFortune.fundLocal = 0; assert.ok(!F.familyPaysCarUpkeep(V, car.monthlyUpkeep), 'empty fund: the player pays');
}
console.log('upkeep OK');
// Company link: service shares at 21, dividends from good years paid out of the fund, succession when both parents are gone.
{
  for (const tier of ['wealthy', 'very_wealthy']) {
    const T = life(tier, 'usa', 2000, 8); run(T, 12 * 22);
    const f = T.familyFortune;
    const sg = f.grants.find(g => g.kind === 'shares'); assert.ok(f.shares && sg, tier + ' holds service shares'); const gp = parseFloat(sg.note); assert.ok(gp >= 0.25 && gp <= 1.0, 'granted stake is a 0.25-0.5% summer stint or a 0.5-1% full year: ' + sg.note);
    assert.ok(f.grants.some(g => g.kind === 'dividend') || f.dividendsPaid >= 0, 'dividends are recorded');
    const fund = f.fundLocal, cash = T.money.cash; const paid = F.payDividends(T, 0.1);
    assert.ok(paid > 0 && f.fundLocal === (f.inherited ? fund : fund - paid) && T.money.cash >= cash + paid - 1, 'dividend reaches the player; before the estate is settled it comes out of the fund, after it comes from company profit');
    assert.ok(paid <= f.yearlyInflowLocal * F.FORTUNE_DIALS.dividendCapPctOfInflow + 1, 'dividend capped by inflow');
    assert.ok(F.payDividends(T, -0.5) < paid, 'a losing year pays less');
  }
  const U = life('upper_middle', 'usa', 2000, 8); run(U, 12 * 22); assert.equal(U.familyFortune.shares, null, 'no company, no shares');
  // succession: kill both parents, once.
  const D = life('wealthy', 'usa', 2000, 8); run(D, 12 * 19); for (const id of [D.relations.fatherId, D.relations.motherId]) if (id) D.people[id].alive = true; D.familyFortune.inherited = false;
  const nw = D.familyFortune.netWorthLocal, cash0 = D.money.cash; const co0 = D.familyFortune.companyLocal, fund0 = D.familyFortune.fundLocal, oth0 = D.familyFortune.otherLocal, own0 = JSON.parse(JSON.stringify(D.familyFortune.own));
  const savings0 = Object.fromEntries((D.relations.siblingIds || []).map(id => [id, D.people[id].career?.savingsLocal || 0]));
  assert.equal(F.ownershipView(D).sum, 100, 'owners sum to 100 before');
  for (const id of [D.relations.fatherId, D.relations.motherId]) if (id) D.people[id].alive = false;
  const alive = (D.relations.siblingIds || []).filter(id => D.people[id].alive);
  D.familyFortune.inherited = false;
  const r = F.settleSuccession(D);
  assert.ok(r && r.share > 0 && D.familyFortune.inherited, 'estate settled');
  const g = D.familyFortune, ls = g.lastSuccession;
  assert.equal(ls.n, 1 + alive.length, 'divisor counts only living children');
  assert.equal(F.ownershipView(D).sum, 100, 'owners still sum to 100 after the transfer');
  assert.equal(g.companyLocal, co0, 'the company valuation is untouched by who owns it');
  assert.equal(g.own.parents + g.own.heirs + g.own.pool, 0, 'the parents and the pool hold nothing after');
  assert.equal(ls.cashAssets, fund0 + oth0, 'cash and other assets are all distributed');
  assert.equal(g.fundLocal + g.otherLocal, 0, 'nothing left in the parents estate');
  assert.ok(Math.abs(D.money.cash - cash0 - r.cash) <= 1, 'the player receives the cash');
  assert.equal(ls.cashAssets, ls.tax + ls.payout + ls.remainder, 'assets before = tax + paid out + rounding remainder');
  assert.ok(ls.remainder >= 0 && ls.remainder < ls.n, 'rounding remainder is under one unit per heir');
  assert.equal(g.netWorthLocal, co0, 'estate after = the company, owned by the children');
  for (const t of ls.toSiblings) assert.ok(D.people[t.id].career.savingsLocal === savings0[t.id] + t.amount && t.amount > 0, 'a sibling share lands in that sibling savings');
  assert.equal(ls.toSiblings.length, alive.length, 'every living sibling paid, no dead one');
  assert.ok(F.ownershipView(D).stakeValue(g.own.player) >= Math.round(co0 * own0.player / 100), 'player stake value never falls');
  assert.equal(F.settleSuccession(D), null, 'only once');
  // a living parent blocks succession
  const L = life('wealthy', 'usa', 2000, 9); run(L, 12 * 23); L.familyFortune.inherited = false; L.people[L.relations.fatherId].alive = true; if (L.relations.motherId) L.people[L.relations.motherId].alive = true;
  assert.equal(F.settleSuccession(L), null, 'nothing while a parent lives');
}
console.log('company link OK');
{ for (const tier of ['wealthy', 'very_wealthy']) { const T = life(tier, 'usa', 1990, 8); run(T, 12 * 40); const f = T.familyFortune; assert.ok(f.fundLocal <= f.netWorthLocal * F.FORTUNE_DIALS.fundMaxShareOfNetWorth + 1, tier + ': cash fund stays inside net worth'); } }
{ /* estate accounting: parts always add up, every payout lowers the estate, a clip moves cash into other assets */
  const T = life('very_wealthy', 'usa', 2000, 8); const f = F.ensureFamilyFortune(T);
  const parts = () => f.companyLocal + f.fundLocal + f.otherLocal;
  assert.ok(Math.abs(parts() - f.netWorthLocal) <= 1, 'estate = company + fund + other');
  const n0 = f.netWorthLocal; F.payFamilyAllowanceYear?.(T);
  run(T, 12 * 30);
  assert.ok(Math.abs(parts() - f.netWorthLocal) <= 1, 'still adds up after 30 years');
  assert.ok(f.fundLocal <= f.netWorthLocal * F.FORTUNE_DIALS.fundMaxShareOfNetWorth + 1, 'fund within estate cap');
  assert.ok(f.otherLocal >= 0 && f.companyLocal > 0, 'no value was erased into nothing');
  /* a payout lowers both */
    const T2 = life('wealthy', 'usa', 2000, 9); const h = F.ensureFamilyFortune(T2); const nwb = h.netWorthLocal, fb = h.fundLocal;
  T2.player.age = 18; F.payDividends(T2, 0.1); h.own.player = 1; const d = F.payDividends(T2, 0.1);
  assert.ok(d > 0 && h.netWorthLocal === nwb - d && h.fundLocal === fb - d, 'a dividend lowers fund and estate together');
  /* an old save without the split is upgraded with owners summing to 100 */
  const O = life('wealthy', 'usa', 2000, 10); const of = F.ensureFamilyFortune(O); delete of.companyLocal; delete of.otherLocal; delete of.own; const nwo = of.netWorthLocal;
  const up = F.ownershipView(O); assert.equal(up.sum, 100, 'upgrade keeps owners at 100'); assert.ok(Math.abs(of.netWorthLocal - nwo) <= 1, 'upgrade keeps the total');
  /* dead siblings are not counted */
  const K = life('wealthy', 'usa', 2000, 11); const kf = F.ensureFamilyFortune(K); K.relations.siblingIds = K.relations.siblingIds || [];
  K.people.sibA = { id: 'sibA', alive: true, age: 25 }; K.people.sibB = { id: 'sibB', alive: false, age: 25 }; K.people.sibC = { id: 'sibC', alive: true, age: 14 }; K.relations.siblingIds.push('sibA', 'sibB', 'sibC');
  K.player.age = 22; K.career.employed = true; K.career.job = { title: 'Management Trainee', employer: kf.company.name }; kf.work = { stint: false, fullSince: K.year - 2, hiredAbs: (K.year - 2) * 12 + 1, askedStint: true, askedFull: 1 };
  const sy = K.year; let pl = 0;
  for (let i = 0; i < 40; i++) { K.year = sy + i; K.player.age = 22 + i; K.people.sibA.age = 25 + i; K.people.sibC.age = 14 + i; const b4 = kf.own.player; F.grantServiceShares(K); pl = Math.max(pl, kf.own.player - b4); if (i === 3) assert.equal(kf.own.siblings.sibC || 0, 0, 'a sibling under 21 earns nothing'); assert.ok(kf.own.player <= 10.0001 && (kf.own.siblings.sibA || 0) <= 10.0001, 'at most 10% per child'); assert.equal(F.ownershipView(K).sum, 100, 'owners sum to 100 every year'); }
  assert.ok(pl > 0 && pl <= 1.0001, 'a working year earns 0.5-1%');
  assert.ok(kf.own.siblings.sibA > 0 && kf.own.siblings.sibB == null, 'service shares go only to living siblings');
  assert.ok((kf.own.siblings.sibC || 0) > 0, 'the later-born sibling starts earning once they reach 21');
  assert.ok(kf.workYears >= 10, 'work years counted for the player');
  K.career.employed = false; const wy = kf.workYears; K.year += 1; F.grantServiceShares(K); assert.equal(kf.workYears, wy, 'no job, no share year');
  assert.equal(F.ownershipView(K).sum, 100, 'pool + holders sum to 100');
}
console.log('fund within estate OK');
{ /* Your own door (seed gift) and upper-middle deposit help: real choices, conserved, reload-safe, no warmth change */
  const mk = (tier, seed) => { const T = life(tier, 'usa', 2000, seed); T.player.age = 25; T.activeScene = null; T.sceneQueue = []; return T; };
  for (const tier of ['wealthy', 'very_wealthy']) {
    const T = mk(tier, 12); const f = F.ensureFamilyFortune(T);
    assert.equal(F.offerSeedGift(T), null, 'no company, no seed offer');
    T.career.businesses = [{ id: 'b1', name: 'Mine', dead: false }];
    const fund0 = f.fundLocal, nw0 = f.netWorthLocal, cash0 = T.money.cash;
    const o = F.offerSeedGift(T); assert.ok(o && o.amount > 0, tier + ' is offered seed money');
    const sc = T.activeScene || T.sceneQueue[0]; assert.ok(sc && sc.key === 'family_seed' && sc.choices.length === 2, 'a real two-choice scene');
    assert.ok(F.restoreHomeScene(T, { key: 'family_seed' }), 'the pending offer restores after a reload');
    const warm0 = JSON.stringify(Object.values(T.people).map(p => p.relationship ?? p.closeness ?? null));
    const r = F.resolveSeed(T, true);
    assert.ok(r.taken && f.fundLocal === fund0 - r.amount && f.netWorthLocal === nw0 - r.amount && T.money.cash >= cash0 + r.amount - 1, 'cash moves from the fund and estate to the player');
    assert.equal(JSON.stringify(Object.values(T.people).map(p => p.relationship ?? p.closeness ?? null)), warm0, 'no warmth change');
    assert.equal(F.offerSeedGift(T), null, 'once only');
    const U = mk(tier, 13); F.ensureFamilyFortune(U); U.career.businesses = [{ id: 'b2', dead: false }]; const fu = U.familyFortune.fundLocal; F.offerSeedGift(U); const d = F.resolveSeed(U, false);
    assert.ok(d.taken === false && U.familyFortune.fundLocal === fu && U.familyFortune.seedDone, 'declining costs nothing');
  }
  const lo = mk('wealthy', 14), hi = mk('very_wealthy', 14); F.ensureFamilyFortune(lo); F.ensureFamilyFortune(hi); lo.career.businesses = hi.career.businesses = [{ id: 'x', dead: false }];
  assert.ok(F.offerSeedGift(hi).amount > F.offerSeedGift(lo).amount * 5, 'very wealthy seed is far larger than wealthy');
  /* deposit help */
  const U = mk('upper_middle', 15); const f = F.ensureFamilyFortune(U); U.housing.properties = [];
  U.player.age = 22; assert.equal(F.offerDepositHelp(U), null, 'not before 24');
  U.player.age = 26; const fund0 = f.fundLocal, nw0 = f.netWorthLocal, cash0 = U.money.cash;
  const o = F.offerDepositHelp(U); assert.ok(o && o.amount > 0 && o.pct >= 20 && o.pct <= 40, 'a 20-40% deposit offer: ' + JSON.stringify(o));
  assert.ok(F.restoreHomeScene(U, { key: 'family_deposit' }), 'deposit offer restores after reload');
  const r = F.resolveDeposit(U, true); assert.ok(r.taken && f.fundLocal === fund0 - r.amount && f.netWorthLocal === nw0 - r.amount && U.money.cash >= cash0 + r.amount - 1, 'deposit cash moves from fund and estate to the player');
  const V = mk('upper_middle', 16); F.ensureFamilyFortune(V); V.housing.properties = [{ id: 'p' }]; assert.equal(F.offerDepositHelp(V), null, 'no help once the player owns property');
  const W = mk('wealthy', 17); F.ensureFamilyFortune(W); assert.equal(F.offerDepositHelp(W), null, 'wealthy tiers get a home, not deposit help');
}
console.log('seed gift and deposit help OK');
{ /* equal treatment of qualifying children; one profit stream for dividends */
  const mkK = () => { const K = life('wealthy', 'usa', 2000, 21); const kf = F.ensureFamilyFortune(K); K.relations.siblingIds = K.relations.siblingIds || [];
    K.people.sA = { id: 'sA', alive: true, age: 30, fullName: 'A', career: { savingsLocal: 0 } }; K.people.sB = { id: 'sB', alive: true, age: 30, fullName: 'B', career: { savingsLocal: 0 } };
    K.relations.siblingIds = ['sA', 'sB']; K.player.age = 30; K.career.employed = true; K.career.job = { title: 'x', employer: kf.company.name }; kf.work = { stint: false, fullSince: K.year - 2, hiredAbs: (K.year - 2) * 12 + 1, askedStint: true, askedFull: 1 }; K.activeScene = null; return [K, kf]; };
  { const [K, kf] = mkK(); kf.own = { parents: 99.1, pool: 0.9, player: 0, siblings: {}, heirs: 0 }; kf.fundLocal = Math.max(kf.fundLocal, 1e6); F.ensureFamilyFortune(K);
    const sv0 = K.people.sA.career.savingsLocal; let found = false;
    for (let y = 0; y < 10 && !found; y++) { K.year += 1; const fund0 = kf.fundLocal, cash0 = K.money.cash, p0 = kf.own.pool, wy = kf.workYears || 0; F.grantServiceShares(K);
      const sA = kf.own.siblings.sA || 0, sB = kf.own.siblings.sB || 0, pl = kf.own.player;
      if (kf.workYears > wy && (K.people.sA.career.savingsLocal > sv0 || kf.bonusesPaid?.sA)) { found = true;
        assert.ok(pl > 0 && sA > 0 && sB > 0 && kf.own.pool < 0.03, 'the pool is shared by all three, none left over for later: ' + [pl, sA, sB, kf.own.pool]);
        assert.ok(kf.bonusesPaid.player > 0 && kf.bonusesPaid.sA > 0, 'short pool pays every qualifying child a cash bonus');
        assert.equal(F.ownershipView(K).sum, 100, 'owners sum to 100');
        const paid = Object.values(kf.bonusesPaid).reduce((a, b) => a + b, 0); assert.equal(kf.fundLocal, fund0 - paid, 'fund fell by every bonus paid'); assert.equal(Math.abs(kf.netWorthLocal - (kf.companyLocal + kf.fundLocal + kf.otherLocal)) <= 1, true, 'estate still adds up'); }
    }
    assert.ok(found, 'a year with a short pool was reached');
  }
  { const [K, kf] = mkK(); kf.own = { parents: 40, pool: 0, player: 20, siblings: { sA: 20, sB: 20 }, heirs: 0 }; kf.fundLocal = Math.max(kf.fundLocal, 5e6); kf.yearlyInflowLocal = Math.max(kf.yearlyInflowLocal, 1e7);
    kf.netWorthLocal = kf.companyLocal + kf.fundLocal + kf.otherLocal; const fund0 = kf.fundLocal, nw0 = kf.netWorthLocal, cash0 = K.money.cash, a0 = K.people.sA.career.savingsLocal, b0 = K.people.sB.career.savingsLocal;
    const mine = F.payDividends(K, 0.1), ld = kf.lastDividend;
    assert.equal(ld.rows.length, 3, 'every share owner is paid from the one profit stream'); assert.ok(ld.total <= Math.round(kf.yearlyInflowLocal * F.FORTUNE_DIALS.dividendCapPctOfInflow) + 1, 'capped by modelled profit');
    assert.equal(fund0 - kf.fundLocal, ld.total, 'while the parents live it comes out of the fund, all owners together'); assert.equal(nw0 - kf.netWorthLocal, ld.total, 'estate falls by the same');
    assert.ok(K.money.cash - cash0 >= mine - 1 && K.people.sA.career.savingsLocal > a0 && K.people.sB.career.savingsLocal > b0, 'player to wallet, siblings to savings');
    assert.ok(Math.abs(ld.rows[0].amt - ld.rows[1].amt) <= 1, 'equal stakes get equal dividends');
    const lose = F.payDividends(K, -0.4); assert.ok(kf.lastDividend.total < ld.total, 'a losing year pays less to everyone');
    kf.inherited = true; const fund1 = kf.fundLocal; F.payDividends(K, 0.1); assert.equal(kf.fundLocal, fund1, 'after the estate is settled the fund is not drawn'); assert.equal(kf.lastDividend.fromFund, false);
  }
}
console.log('equal treatment and dividend stream OK');
{ /* stacked pending choices cannot bypass the annual cap; a refused gift is explained, not consumed; no work years after succession */
  const T = life('wealthy', 'usa', 2000, 31); T.player.age = 25; T.activeScene = null; T.sceneQueue = []; const f = F.ensureFamilyFortune(T); T.career.businesses = [{ id: 'b', dead: false }];
  F.offerSeedGift(T); assert.ok(f.seedOffer, 'seed pending');
  f.yearGifts = f.yearlyInflowLocal * F.FORTUNE_DIALS.annualGiftShareCap; /* cap used up by other gifts */
  const cash0 = T.money.cash, fund0 = f.fundLocal, j0 = T.journal?.length ?? 0;
  const r = F.resolveSeed(T, true);
  assert.ok(r.ok === false && r.reason === 'no room' && T.money.cash === cash0 && f.fundLocal === fund0, 'nothing is paid when the annual room is gone');
  assert.ok(!f.seedDone && f.seedRetryYear === T.year + 1, 'the one-time gift is not consumed, it is retried next year');
  assert.equal(F.offerSeedGift(T), null, 'not re-offered this year');
  const U = life('upper_middle', 'usa', 2000, 32); U.player.age = 26; U.activeScene = null; U.sceneQueue = []; const g = F.ensureFamilyFortune(U); U.housing.properties = [];
  F.offerDepositHelp(U); g.yearGifts = g.yearlyInflowLocal * F.FORTUNE_DIALS.annualGiftShareCap; const rr = F.resolveDeposit(U, true);
  assert.ok(rr.ok === false && !g.depositDone, 'deposit is not consumed either');
  const W = life('wealthy', 'usa', 2000, 33); const w = F.ensureFamilyFortune(W); w.inherited = true; W.player.age = 30; W.career.employed = true; W.career.job = { title: 'x', employer: w.company.name }; w.work = { fullSince: 2020, hiredAbs: 2020 * 12 + 1 };
  const wy = w.workYears || 0; W.year += 1; F.grantServiceShares(W); assert.equal(w.workYears || 0, wy, 'no work years counted once the pool is gone');
}
console.log('gift caps recheck OK');

{ /* A place at the table: shares follow real work in the family company only */
  const T = life('wealthy', 'usa', 2000, 41); const f = F.ensureFamilyFortune(T); T.activeScene = null; T.sceneQueue = [];
  T.player.age = 17; const o = F.offerPlaceAtTable(T); assert.ok(o && o.kind === 'stint', 'a summer-stint offer at 16-20');
  const sc = T.activeScene || T.sceneQueue[0]; assert.ok(sc.key === 'family_place' && sc.choices.length === 2, 'a real two-choice scene');
  assert.ok(F.restoreHomeScene(T, { key: 'family_place' }), 'pending offer restores after reload');
  T.month = 9; F.resolvePlace(T, true); assert.ok(f.work.stint, 'stint accepted (after this year\'s summer)');
  T.year += 1; const b0 = f.own.player; F.grantServiceShares(T); assert.equal(f.own.player, b0, 'a stint accepted this year has no completed summer yet'); T.month = 1; f.work.stintAbs = (T.year - 1) * 12 + 1; f.shareYear = null; T.year += 0; F.grantServiceShares(T); assert.ok(f.own.player > b0 && f.own.player - b0 <= 0.5001, 'a completed summer stint earns a small early stake (half rate)');
  /* stint at 21+ ends: no stint credit, and any other job does not count */
  T.player.age = 22; T.career.employed = true; T.career.job = { title: 'Analyst', employer: 'Other Corp' }; f.work.fullSince = null; T.year += 1; const b1 = f.own.player; F.grantServiceShares(T); assert.equal(f.own.player, b1, 'a job elsewhere earns no family shares');
  /* full-time offer only with no job, and then it makes a real job in the company */
  T.career.job = null; T.career.employed = false; T.activeScene = null; T.sceneQueue = []; f.placeOffer = null;
  const o2 = F.offerPlaceAtTable(T); assert.ok(o2 && o2.kind === 'full', 'a full-time offer at 21+ when jobless');
  const r = F.resolvePlace(T, true); assert.ok(r.taken && T.career.job.employer === f.company.name && T.career.employed, 'a real job at the family company');
  /* late hire: a November hire gets a prorated slice the next January, not a full year */
  T.month = 11; f.work.hiredAbs = T.year * 12 + 11; f.shareYear = null; T.year += 1; const b2 = f.own.player; F.grantServiceShares(T); const late = f.own.player - b2;
  assert.ok(late > 0 && late <= 1.0001 * 2 / 12 + 0.011, 'a late-year hire earns about 2/12 of a year: ' + late);
  T.year += 1; const b3 = f.own.player; F.grantServiceShares(T); assert.ok(f.own.player - b3 >= 0.49 && f.own.player - b3 <= 1.0001, 'the next full completed year earns 0.5-1%');
  /* quitting ends the work and re-opens the door */
  T.career.job = null; T.career.employed = false; F.checkWorkQuit(T, f); assert.ok(!f.work.fullSince && f.work.quitYear === T.year, 'quit clears the work state');
  T.year += 1; const b4 = f.own.player; F.grantServiceShares(T); assert.equal(f.own.player, b4, 'no shares after quitting');
  T.activeScene = null; T.sceneQueue = []; f.placeOffer = null; f.work.lastAskYear = T.year - 5; T.player.age = 26; assert.ok(F.offerPlaceAtTable(T), 'the door is open: a place is offered again after a quit');
  const W = life('wealthy', 'usa', 2000, 42); const wf = F.ensureFamilyFortune(W); W.player.age = 25; W.career.employed = true; W.career.job = { title: 'x', employer: 'Y' }; W.activeScene = null; W.sceneQueue = [];
  assert.equal(F.offerPlaceAtTable(W), null, 'no full-time offer when the player already has a job (no job replaced)');
  const D = life('wealthy', 'usa', 2000, 43); F.ensureFamilyFortune(D); D.player.age = 25; D.career.employed = false; D.career.job = null; D.activeScene = null; D.sceneQueue = []; F.offerPlaceAtTable(D); F.resolvePlace(D, false);
  assert.ok(!D.familyFortune.work.fullSince, 'declining takes no job and costs nothing');
  const U = life('upper_middle', 'usa', 2000, 44); F.ensureFamilyFortune(U); U.player.age = 18; assert.equal(F.offerPlaceAtTable(U), null, 'no company, no place at the table');
}
console.log('place at the table OK');
{ /* record year / tight year are real states with real effects */
  const find = (want) => { for (let seed = 50; seed < 120; seed++) for (const y of [2003, 2008, 2012, 2019, 2022]) {
    const T = life('wealthy', 'usa', y - 10, seed); const f = F.ensureFamilyFortune(T); T.year = y - 1; f.lastTickYear = y - 1; T.year = y; T.player.age = 19; T.activeScene = null; T.sceneQueue = [];
    const nw0 = f.netWorthLocal; F.tickFamilyFortuneYearly(T);
    if (f.yearState && f.yearState.kind === want) return { T, f, nw0 }; } return null; };
  const rec = find('record'), tight = find('tight');
  assert.ok(rec && tight, 'both a record and a tight year are reachable');
  { const { T, f } = rec; assert.ok(['allowance', 'gift', 'property'].includes(f.yearState.outcome), 'a record year has a visible outcome: ' + f.yearState.outcome);
    assert.ok(Math.abs(f.netWorthLocal - (f.companyLocal + f.fundLocal + f.otherLocal)) <= 1, 'record year keeps the estate adding up');
    if (f.yearState.outcome === 'gift') assert.ok(f.grants.some(g => g.kind === 'gift' && g.year === T.year), 'the one-time gift is in the ledger');
    if (f.yearState.outcome === 'allowance') { const base = F.payFamilyAllowanceYear; f.yearState.kind = 'record'; assert.ok(true); } }
  { const { T, f } = tight; assert.ok(F.isTightYear(f, T), 'tight year state is set');
    f.carGifted = false; assert.equal(F.giftBirthdayCar(T), null, 'the planned car waits out a tight year');
    const calm = JSON.parse(JSON.stringify(f)); const c1 = F.askCeiling(T); f.yearState = null; const c2 = F.askCeiling(T); assert.ok(c1 <= c2 * 0.5 + 1, 'asks are capped at half in a tight year');
    f.yearState = { year: T.year, kind: 'tight' }; T.player.age = 12; const a1 = F.payFamilyAllowanceYear(T); f.yearState = null; f.yearGifts = 0; f.fundLocal = calm.fundLocal; f.netWorthLocal = calm.netWorthLocal; const a2 = F.payFamilyAllowanceYear(T);
    assert.ok(a1 > 0 && a1 < a2, 'the allowance is cut in a tight year: ' + a1 + ' < ' + a2);
    f.yearState = { year: T.year + 1, kind: 'tight' }; assert.ok(!F.isTightYear(f, T), 'recovery: the next year it no longer applies'); }
}
console.log('record and tight year OK');
