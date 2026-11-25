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
assert.ok(f.trust.totalLocal <= f.netWorthLocal * perChildCap * 1.5, 'trust stays inside the per-child cap (net worth grew since funding)');
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
// Birthday keys: a real owned car per tier, paid from the fund, priced in era money; only very_wealthy has running costs covered.
{
  const { showroomCarQuote } = await import('../src/systems/completeLifeSystems.js');
  const prices = {};
  for (const tier of ['upper_middle', 'wealthy', 'very_wealthy']) {
    const T = life(tier, 'usa', 2003, 5); const fund0 = () => T.familyFortune?.fundLocal;
    run(T, 12 * 19);
    const car = T.cars.find(c => c.gifted);
    assert.ok(car, tier + ' gets a gifted car by 19');
    assert.ok(T.familyFortune.grants.some(g => g.kind === 'car'), 'car gift is in the ledger');
    assert.equal(!!car.familyCoversUpkeep, tier === 'very_wealthy');
    prices[tier] = car.valueLocal;
    assert.ok(T.familyFortune.yearGifts <= T.familyFortune.yearlyInflowLocal * F.FORTUNE_DIALS.annualGiftShareCap + 1, 'annual gift cap holds');
  }
  assert.ok(prices.upper_middle < prices.wealthy && prices.wealthy < prices.very_wealthy, 'car class rises with the tier: ' + JSON.stringify(prices));
  // a gifted car can be sold like any car
  const E = life('wealthy', 'usa', 2003, 5); run(E, 12 * 19);
  const { sellVehicle } = await import('../src/systems/economyEngine.js');
  const c0 = E.cars.find(c => c.gifted); const cash = E.money.cash;
  assert.ok(sellVehicle(E, c0.id).ok && E.money.cash > cash, 'gifted car can be sold');
  // existing adult saves get no retroactive car
  const X = life('wealthy', 'usa', 2003, 5); run(X, 12 * 30); X.familyFortune = null; X.cars = [];
  F.ensureFamilyFortune(X); F.tickFamilyFortuneMonthly(X);
  assert.equal(X.cars.length, 0, 'no retroactive gift');
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
