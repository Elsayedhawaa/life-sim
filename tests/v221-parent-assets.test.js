// Parents' home and car: one shared household home, conserved against the estate / savings, revalued yearly, folded back on death.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const { handleNpcDeath } = await import('../src/systems/soulEngine.js');
const mk = (tier, seed = 2) => { const S = createNewLifeState({ seed, country: 'usa', birthYear: 1990, familyTier: tier, gender: 'm' }); ensureExtendedState(S); S.year = 2025; F.ensureFamilyFortune(S); for (const id of [S.relations.fatherId, S.relations.motherId]) if (id && S.people[id]) { S.people[id].age = 55; S.people[id].alive = true; } return S; };
const par = S => [S.relations.fatherId, S.relations.motherId].map(i => S.people[i]).filter(Boolean);
{ /* rich: subset of the estate, nothing created, one home, silent seeding */
  const S = mk('very_wealthy'); const f = S.familyFortune; const before = { nw: f.netWorthLocal, other: f.otherLocal, fund: f.fundLocal, sav: par(S).map(p => p.career?.savingsLocal || 0), j: S.journal?.length || 0 };
  assert.ok(F.syncParentAssets(S) >= 2); const homes = par(S).filter(p => p.assets?.home), cars = par(S).filter(p => p.assets?.car);
  assert.equal(homes.length, 1, 'a couple shares one home'); assert.ok(cars.length >= 1);
  assert.equal(f.netWorthLocal, before.nw); assert.equal(f.otherLocal, before.other); assert.equal(f.fundLocal, before.fund, 'no cash created or paid out');
  assert.deepEqual(par(S).map(p => p.career?.savingsLocal || 0), before.sav, 'parents savings untouched');
  assert.equal(S.journal?.length || 0, before.j, 'existing holdings are seeded silently');
  const sum = par(S).reduce((t, p) => t + (p.assets.home?.price || 0) + (p.assets.car?.price || 0), 0); assert.ok(sum <= f.otherLocal, 'recorded assets stay inside otherLocal');
  const snap = JSON.stringify(par(S).map(p => p.assets)); assert.equal(F.syncParentAssets(S), 0, 'once'); assert.equal(JSON.stringify(par(S).map(p => p.assets)), snap);
  const other = par(S).find(p => !p.assets.home); assert.match(F.parentAssetsLine(S, other.id), /family home they share/); assert.match(F.parentAssetsLine(S, homes[0].id), /^Lives in the family home/);
  /* yearly: the home follows the market, the car loses value out of otherLocal */
  const h0 = homes[0].assets.home.price, c0 = cars[0].assets.car.price, o0 = f.otherLocal; S.year++; F.revalueParentAssets(S);
  assert.notEqual(homes[0].assets.home.price, h0); assert.equal(cars[0].assets.car.price, Math.round(c0 * 0.9)); assert.ok(f.otherLocal <= o0 - Math.round((c0 - cars[0].assets.car.price) * 0.99) + 1);
  assert.equal(F.revalueParentAssets(S), 0, 'revalued once a year');
  /* upgrade is journalled, nothing created */
  const car = cars[0].assets.car; car.price = 1000; const o1 = f.otherLocal, n1 = f.netWorthLocal; assert.ok(F.syncParentAssets(S) >= 1);
  assert.equal(f.otherLocal, o1); assert.equal(f.netWorthLocal, n1); assert.ok(cars[0].assets.car.price > 1000); assert.match(JSON.stringify(S.journal.slice(0, 3)), /replaced (his|her) car/);
  /* death: the car goes back into the estate (already inside otherLocal), the home passes to the survivor */
  const keeper = homes[0], o2 = f.otherLocal; const surv = par(S).find(p => p !== keeper); handleNpcDeath(S, keeper);
  assert.ok(!keeper.assets.car && !keeper.assets.home); assert.ok(surv.assets.home, 'the surviving parent keeps the household home'); assert.equal(f.otherLocal, o2, 'estate neither grows nor shrinks on fold-back');
  handleNpcDeath(S, surv); assert.ok(!surv.assets.home && !surv.assets.car); assert.equal(f.otherLocal, o2, 'no double count'); }
{ /* ordinary family: bought from the parent's own savings, trade-in at recorded value, restored to savings on death */
  const S = mk('middle'); const [a, b] = par(S); a.career = { ...(a.career || {}), savingsLocal: 3e6 }; b.career = { ...(b.career || {}), savingsLocal: 0 };
  const total0 = 3e6; F.syncParentAssets(S);
  assert.equal(a.career.savingsLocal + (a.assets.home?.price || 0) + (a.assets.car?.price || 0), total0, 'savings fell by exactly the price');
  assert.ok(!a.assets.home?.estate); assert.ok(!(b && b.assets?.home), 'one home only');
  const worth = a.career.savingsLocal + (a.assets.home?.price || 0) + (a.assets.car?.price || 0); handleNpcDeath(S, a);
  assert.ok(!a.assets.home && !a.assets.car);
  const back = (a.career.savingsLocal) + (b.assets?.home?.price || 0) + (b.assets?.car?.price || 0); assert.equal(back, worth, 'nothing erased: the car went back to savings, the home to the surviving parent'); }
{ /* a gift or sale that drains the estate takes unallocated money first, then the fund, and only then sells the parents' assets: the subset never exceeds otherLocal */
  const S = mk('very_wealthy'); const f = S.familyFortune; F.syncParentAssets(S); const held = () => par(S).reduce((t, p) => t + (p.assets?.home?.price || 0) + (p.assets?.car?.price || 0), 0);
  const h0 = held(), free = f.otherLocal - h0; assert.ok(free > 0);
  F.__takeFromEstate(f, Math.floor(free / 2), S); assert.equal(held(), h0, 'small draw leaves the parents assets alone');
  F.__takeFromEstate(f, f.otherLocal - h0 + f.fundLocal + Math.floor(h0 / 2), S); assert.ok(held() <= f.otherLocal, 'subset protected'); assert.ok(held() < h0 && held() > 0, 'assets were sold down, not erased');
  F.__takeFromEstate(f, 1e18, S); assert.equal(f.otherLocal, 0); assert.equal(held(), 0); }
{ /* no free upgrades: with no unallocated pool left, the parents cannot upgrade */
  const S = mk('very_wealthy'); const f = S.familyFortune; F.syncParentAssets(S); const c = par(S).find(p => p.assets?.car); c.assets.car.price = 1000;
  const held = par(S).reduce((t, p) => t + (p.assets?.home?.price || 0) + (p.assets?.car?.price || 0), 0); f.otherLocal = held; f.netWorthLocal = f.companyLocal + f.fundLocal + f.otherLocal;
  assert.equal(F.syncParentAssets(S), 0); assert.equal(c.assets.car.price, 1000, 'nothing is bought without unallocated pool to pay from'); }
{ /* a dead sibling's savings-funded home is not touched by the parents' household transfer; a funding-pool mismatch blocks replacement */
  const S = mk('very_wealthy'); const f = S.familyFortune; const sib = S.relations.siblingIds.map(i => S.people[i]).find(Boolean);
  if (sib) { sib.alive = true; sib.assets = { home: { id: 'x', price: 5, country: 'usa', year: 2020 } }; const sv = sib.career?.savingsLocal; const [a] = par(S); a.assets = {}; handleNpcDeath(S, sib); assert.ok(!par(S).some(p => p.assets?.home), 'sibling home never moves to a parent'); assert.ok(sib.assets && sib.assets.home, 'sibling asset flow is untouched by the parent fold'); }
  F.syncParentAssets(S); const c = par(S).find(p => p.assets?.car); c.assets.car.estate = false; c.assets.car.price = 1000; const sav = c.career?.savingsLocal || 0; F.syncParentAssets(S);
  assert.equal(c.assets.car.price, 1000, 'no cross-pool replacement'); assert.equal(c.career?.savingsLocal || 0, sav, 'no estate trade-in credited to savings'); }
console.log('PASS v221-parent-assets');
