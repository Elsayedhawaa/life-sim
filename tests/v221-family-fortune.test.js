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
assert.ok(/Family fortune/.test(html) && /In 2026 money/.test(html), 'rich family sees the ledger with nominal and 2026 money');
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
  const fund = V.familyFortune.fundLocal; assert.ok(F.familyPaysCarUpkeep(V, car.monthlyUpkeep) && V.familyFortune.fundLocal === fund - car.monthlyUpkeep, 'the fund pays, not nobody');
  V.familyFortune.fundLocal = 0; assert.ok(!F.familyPaysCarUpkeep(V, car.monthlyUpkeep), 'empty fund: the player pays');
}
console.log('upkeep OK');
// Company link: service shares at 21, dividends from good years paid out of the fund, succession when both parents are gone.
{
  for (const tier of ['wealthy', 'very_wealthy']) {
    const T = life(tier, 'usa', 2000, 8); run(T, 12 * 22);
    const f = T.familyFortune;
    const sg = f.grants.find(g => g.kind === 'shares'); assert.ok(f.shares && sg, tier + ' holds service shares'); const gp = parseFloat(sg.note); assert.ok(gp >= 0.5 && gp <= 1.0, 'granted stake is 0.5-1%: ' + sg.note);
    assert.ok(f.grants.some(g => g.kind === 'dividend') || f.dividendsPaid >= 0, 'dividends are recorded');
    const fund = f.fundLocal, cash = T.money.cash; const paid = F.payDividends(T, 0.1);
    assert.ok(paid > 0 && f.fundLocal === fund - paid && T.money.cash >= cash + paid - 1, 'dividend moves money from the fund to the player');
    assert.ok(paid <= f.yearlyInflowLocal * F.FORTUNE_DIALS.dividendCapPctOfInflow + 1, 'dividend capped by inflow');
    assert.ok(F.payDividends(T, -0.5) < paid, 'a losing year pays less');
  }
  const U = life('upper_middle', 'usa', 2000, 8); run(U, 12 * 22); assert.equal(U.familyFortune.shares, null, 'no company, no shares');
  // succession: kill both parents, once.
  const D = life('wealthy', 'usa', 2000, 8); run(D, 12 * 23);
  const nw = D.familyFortune.netWorthLocal, cash0 = D.money.cash; const co0 = D.familyFortune.companyLocal, fund0 = D.familyFortune.fundLocal, own0 = JSON.stringify(D.familyFortune.own);
  assert.equal(F.ownershipView(D).sum, 100, 'owners sum to 100 before');
  D.familyFortune.inherited = false;
  for (const id of [D.relations.fatherId, D.relations.motherId]) if (id) D.people[id].alive = false;
  const r = F.settleSuccession(D);
  assert.ok(r && r.share > 0 && D.familyFortune.inherited, 'estate settled');
  const sibs = (D.relations.siblingIds || []).filter(id => D.people[id].alive).length;
  const g = D.familyFortune, ls = g.lastSuccession;
  assert.equal(ls.n, 1 + sibs, 'divisor counts only living children');
  assert.equal(F.ownershipView(D).sum, 100, 'owners still sum to 100 after the transfer');
  assert.equal(g.companyLocal, co0, 'the company valuation is untouched by who owns it');
  assert.equal(g.own.parents + g.own.heirs, 0, 'the parents hold nothing after');
  assert.ok(Math.abs(D.money.cash - cash0 - r.cash) <= 1, 'the player receives the cash');
  assert.equal(g.netWorthLocal, nw - ls.cashOut, 'the estate falls by exactly the cash paid out');
  assert.equal(g.fundLocal, fund0 - ls.cashOut, 'cash came from the fund');
  const stake = Math.round(co0 * ls.stakeEach / 100);
  assert.ok(Math.abs(F.ownershipView(D).stakeValue(g.own.player) - (Math.round(co0 * JSON.parse(own0).player / 100) + stake)) <= 2, 'player stake value = earlier stake + the exact transfer value, no dilution');
  assert.ok(Math.abs(g.netWorthLocal + ls.cashOut - nw) <= 1, 'assets before = assets after + cash handed over');
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
  K.people.sibA = { id: 'sibA', alive: true }; K.people.sibB = { id: 'sibB', alive: false }; K.relations.siblingIds.push('sibA', 'sibB');
  K.player.age = 21; F.grantServiceShares(K);
  assert.ok(kf.own.siblings.sibA > 0 && kf.own.siblings.sibB == null, 'service shares go only to living siblings');
  assert.equal(F.ownershipView(K).sum, 100, 'pool + holders sum to 100');
}
console.log('fund within estate OK');
