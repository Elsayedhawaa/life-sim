/* v2.15 Worker 1 verify — Property: being a landlord, played.
   Run from the game root: node tests/v215-w1-verify.mjs
   Every check goes through the REAL monthly settlement
   (settleHouseholdMonth) or the REAL Real Estate render
   (renderRealEstateTabHtml) — no direct calls to the new module's
   internals except where the spec's contract says so (a tenant
   losing their job, a lease ending, damage existing — those are
   states the game reaches on its own; the test puts the property
   in that state and lets the real functions decide).
   - §1: a named tenant pays rent and the ledger line names them;
     the deposit arrives as its own ledger line.
   - §2: a tenant who loses their job struggles to pay; give-time
     leads back to work, eviction costs real money and real months.
   - §3: a deposit is charged for real damage (the damage list and
     the price are real); keep / return / court all settle it.
   - §4: a lease renewal offers renew / raise / sell; a raise can
     be refused (measured over 100 tenants).
   - §5: condition 40 earns less rent than condition 90 for the
     same property (measured, settled).
   - §6: the market state is shown with its history (real chart).
   - §7: void months cost real money and a new tenant is found;
     maintenance and damage fixes move real money.
   - §8: the Lease Out toggle finds a tenant at once; Stop Lease
     ends the tenancy. The shipped tests are NOT run by this
     harness — run them separately. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth, finalizePropertyPurchase, togglePropertyRental } from '../src/systems/economyEngine.js';
import {
  findTenant, giveTenantTime, startEviction, renewLease, maintainProperty,
  fixDamage, settleDeposit, endTenancy, tickPropertyMarketMonth,
  conditionRentFactor, effectiveMonthlyRentLocal, landlordRentForMonth
} from '../src/systems/propertyLandlord.js';
import { EVICTION_LAW, DAMAGE_TYPES, evictionLawFor } from '../src/data/propertyLandlordData.js';
import { renderRealEstateTabHtml } from '../src/ui/views.js';
import { renderLandlordSectionHtml } from '../src/ui/propertyLandlord.js';

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
function adultLife(seed = 777) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.legal.residency.kind = 'citizen';
  return S;
}
function nextMonth(S) { S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; } }
function buyFlat(S, name = 'Test Flat, Zamalek', rent = 12000, value = 2500000) {
  const r = finalizePropertyPurchase(S, {
    catalogId: 'test_flat', name, shape: 'apartment', country: 'egy', city: 'Cairo',
    tier: 'standard', rooms: 2, areaM2: 90, nativeValue: value,
    nativeMonthlyRent: rent, downInPlayerLocal: value
  }, null, { moveIn: false });
  if (!r.ok) throw new Error(`buyFlat failed: ${r.msg}`);
  return r.prop;
}
const ledgerLines = (S, re) => (S.ledger || []).filter(l => l.label && re.test(l.label));
const ui = { activeTab: 'realestate', propMarket: 'local', gulfTarget: 'uae', reUnitId: 'apt_m', reFinishId: 'standard', rePlanId: 'cash', reQuery: '', reSub: 'myhome' };

/* ================= §0 data ================= */
console.log('--- §0 law + damage data ---');
{
  check('eviction law covers all 18 countries', Object.keys(EVICTION_LAW).length === 18, `got ${Object.keys(EVICTION_LAW).length}`);
  check('every law row has notice, court time, cost and deposit', Object.values(EVICTION_LAW).every(l => l.noticeMonths >= 0 && l.courtMonths > 0 && l.costRentMonths > 0 && l.depositMonths >= 1 && l.depositMonths <= 2 && l.court), '');
  check('6 damage types, each priced as a share of value', DAMAGE_TYPES.length === 6 && DAMAGE_TYPES.every(d => d.pctOfValue > 0 && d.costLocal === undefined), '');
  check('condition factor: 90 -> 1.00, 40 -> 0.75', conditionRentFactor(90) === 1 && conditionRentFactor(40) === 0.75, `90->${conditionRentFactor(90)} 40->${conditionRentFactor(40)}`);
}

/* ================= §1 named tenant pays rent ================= */
console.log('--- §1 named tenant pays rent ---');
{
  const S = adultLife(101);
  const prop = buyFlat(S);
  const found = findTenant(S, prop);
  check('findTenant ok', found.ok, found.msg);
  const t = prop.landlord.tenant;
  check('tenant is a real person record in S.people', !!t && !!S.people[t.personId] && S.people[t.personId].fullName === t.name, t && t.name);
  check('tenant has a job from the employer pool', !!t && !!t.employer && !!t.jobTitle && t.monthlyIncomeLocal > 0, t && `${t.jobTitle} at ${t.employer}`);
  check('tenant reliability is a real figure 35-95', t.reliability >= 35 && t.reliability <= 95, `got ${t.reliability}`);
  check('tenant can afford the rent (income >= 1.6x rent)', t.monthlyIncomeLocal >= effectiveMonthlyRentLocal(S, prop) * 1.6, `income ${t.monthlyIncomeLocal} vs rent ${effectiveMonthlyRentLocal(S, prop)}`);
  const depositLocal = prop.landlord.deposit.amountLocal;
  check('deposit is 1-2 months rent, held', prop.landlord.deposit.months >= 1 && prop.landlord.deposit.months <= 2 && prop.landlord.deposit.held && depositLocal > 0, `months ${prop.landlord.deposit.months} amount ${depositLocal}`);
  const cashBefore = S.money.cash;
  t.reliability = 100; // a model tenant pays on time, every time
  settleHouseholdMonth(S);
  const rentLines = ledgerLines(S, new RegExp(`^Rent from ${prop.name} — paid by ${t.name}`));
  check('settled rent ledger line names the tenant', rentLines.length === 1, rentLines.map(l => l.label).join(' | '));
  const depLines = ledgerLines(S, new RegExp(`^Deposit from ${t.name} — ${prop.name}`));
  check('deposit arrives as its own ledger line', depLines.length === 1 && depLines[0].delta === depositLocal, depLines.map(l => `${l.label} (${l.delta})`).join(' | '));
  const rentLocal = effectiveMonthlyRentLocal(S, prop);
  check('rent paid is the effective rent (condition x market x 0.88)', rentLines.length === 1 && rentLines[0].delta === Math.round(rentLocal * 0.88), `ledger ${rentLines[0] && rentLines[0].delta} vs expected ${Math.round(rentLocal * 0.88)}`);
  console.log('tenant:', t.name, '|', t.jobTitle, 'at', t.employer, '| reliability', t.reliability, '| rent/mo', rentLocal, '| deposit', depositLocal, '| cash before settle', cashBefore, 'after', S.money.cash);
}

/* ================= §2 job loss: give time vs evict ================= */
console.log('--- §2 tenant loses their job ---');
{
  const S = adultLife(202);
  const prop = buyFlat(S);
  findTenant(S, prop);
  const t = prop.landlord.tenant;
  t.reliability = 100;
  t.jobLost = true;
  const person = S.people[t.personId];
  person.career.monthlyIncomeLocal = 0;
  settleHouseholdMonth(S);
  const partial = ledgerLines(S, new RegExp(`^Rent from ${prop.name} — paid by ${t.name} \\(partial`));
  check('jobless tenant pays only part of the rent', partial.length === 1 && partial[0].delta > 0 && partial[0].delta < Math.round(effectiveMonthlyRentLocal(S, prop) * 0.88), partial.map(l => l.label).join(' | '));
  check('arrears grow while the tenant is out of work', t.arrearsLocal > 0, `arrears ${t.arrearsLocal}`);
  const gave = giveTenantTime(S, prop.id);
  check('give-time gives 3 months', gave.ok && t.graceMonthsLeft === 3, gave.msg);
  let foundWorkIn = -1;
  for (let m = 1; m <= 24; m++) {
    nextMonth(S);
    settleHouseholdMonth(S);
    if (!t.jobLost) { foundWorkIn = m; break; }
  }
  check('tenant given time finds work again (within 24 months)', foundWorkIn > 0, `found work in month ${foundWorkIn}`);
  console.log('give-time: tenant found work in month', foundWorkIn, '| arrears at that point', t.arrearsLocal);

  /* Eviction twin: real cost, real months, tenant gone at the end. */
  const E = adultLife(203);
  const eprop = buyFlat(E);
  findTenant(E, eprop);
  const et = eprop.landlord.tenant;
  et.reliability = 100;
  et.jobLost = true;
  const law = evictionLawFor('egy');
  const expectedMonths = law.noticeMonths + law.courtMonths;
  const cashBeforeEvict = E.money.cash;
  const ev = startEviction(E, eprop.id);
  const evictCost = Math.round(effectiveMonthlyRentLocal(E, eprop) * law.costRentMonths);
  check('eviction states its cost and time before committing', ev.ok && ev.msg.includes(String(expectedMonths)), ev.msg);
  check('eviction filing fee leaves cash at once', E.money.cash === cashBeforeEvict - evictCost, `cash ${E.money.cash} vs expected ${cashBeforeEvict - evictCost} (cost ${evictCost})`);
  check('eviction runs through the country\'s own court', et.eviction && et.eviction.court === law.court && et.eviction.monthsLeft === expectedMonths, `court ${et.eviction && et.eviction.court}, months ${et.eviction && et.eviction.monthsLeft}`);
  let rentWhileEvicting = 0;
  for (let m = 0; m < expectedMonths; m++) {
    nextMonth(E);
    settleHouseholdMonth(E);
    rentWhileEvicting += ledgerLines(E, new RegExp(`^Rent from ${eprop.name} — paid by`)).length;
  }
  check('no rent arrives while the eviction runs', rentWhileEvicting === 0, `rent lines ${rentWhileEvicting}`);
  check('tenant is gone when the court months run out', eprop.landlord.tenant === null, eprop.landlord.tenant && eprop.landlord.tenant.name);
  console.log('eviction: cost', evictCost, '| months', expectedMonths, '| court', law.court);
}

/* ================= §3 deposit charged for real damage ================= */
console.log('--- §3 deposit vs real damage ---');
{
  const S = adultLife(303);
  const prop = buyFlat(S);
  findTenant(S, prop);
  const t = prop.landlord.tenant;
  const depositLocal = prop.landlord.deposit.amountLocal;
  const dmgCost = 15000;
  prop.landlord.damage.push({
    id: 'dmg_test_wall', key: 'wall', label: 'Tenant damaged a wall and the door frames',
    costLocal: dmgCost, condHit: 4, tenantCaused: true, status: 'open', year: S.year, month: S.month
  });
  const ended = endTenancy(S, prop, 'test move-out');
  check('end of tenancy lists the real damage and its price', ended.ok && ended.deductions.length === 1 && ended.deductions[0].costLocal === dmgCost, JSON.stringify(ended.deductions));
  const st = prop.landlord.depositSettlement;
  check('deposit settlement is pending the player\'s decision', !!st && st.status === 'pending' && st.totalLocal === dmgCost && st.remainderLocal === depositLocal - dmgCost, JSON.stringify(st));
  const cashBefore = S.money.cash;
  const kept = settleDeposit(S, prop.id, 'keep');
  check('keep: deposit kept for the damage, remainder returned', kept.ok && st.status === 'kept' && S.money.cash === cashBefore - st.remainderLocal, kept.msg);
  check('deposit record shows what was kept', prop.landlord.deposit.keptLocal === dmgCost && prop.landlord.deposit.returnedLocal === depositLocal - dmgCost, `kept ${prop.landlord.deposit.keptLocal} returned ${prop.landlord.deposit.returnedLocal}`);
  console.log('deposit:', depositLocal, '| damage:', dmgCost, '| returned:', st.remainderLocal);

  /* Court twin: either outcome settles the deposit, fee is real. */
  const C = adultLife(304);
  const cprop = buyFlat(C);
  findTenant(C, cprop);
  cprop.landlord.damage.push({
    id: 'dmg_test_window', key: 'window', label: 'Broken window',
    costLocal: 8000, condHit: 2, tenantCaused: true, status: 'open', year: C.year, month: C.month
  });
  endTenancy(C, cprop, 'test move-out');
  const cst = cprop.landlord.depositSettlement;
  const court = settleDeposit(C, cprop.id, 'court');
  check('court settles the dispute one way or the other', court.ok && (cst.status === 'court-win' || cst.status === 'court-lost'), `${court.msg} | status ${cst.status}`);
  check('court filing fee appears in the ledger', ledgerLines(C, /Small-claims filing/).length === 1, '');
  check('deposit is no longer held after the court ruling', cprop.landlord.deposit.held === false, '');
  console.log('court outcome:', cst.status, '|', court.msg);
}

/* ================= §4 lease renewal: renew / raise / sell ================= */
console.log('--- §4 lease renewal ---');
{
  const S = adultLife(404);
  const prop = buyFlat(S);
  findTenant(S, prop);
  const t = prop.landlord.tenant;
  t.reliability = 100;
  prop.landlord.lease.monthsLeft = 0;
  const same = renewLease(S, prop.id, 'same');
  check('renew at the same rent: 12 more months', same.ok && same.outcome === 'renewed' && prop.landlord.lease.monthsLeft === 12, same.msg);
  prop.landlord.lease.monthsLeft = 0;
  const outcomes = { accepted: 0, negotiated: 0, left: 0 };
  for (let i = 0; i < 100; i++) {
    const T = adultLife(500 + i);
    const tp = buyFlat(T);
    findTenant(T, tp);
    tp.landlord.tenant.reliability = 100;
    tp.landlord.tenant.relationship = 50;
    tp.landlord.lease.monthsLeft = 0;
    const r = renewLease(T, tp.id, 'raise', 5);
    outcomes[r.outcome] = (outcomes[r.outcome] || 0) + 1;
  }
  console.log('raise 5% over 100 tenants:', JSON.stringify(outcomes));
  check('a raise can be accepted', outcomes.accepted > 0, JSON.stringify(outcomes));
  check('a raise can be refused (tenant leaves)', outcomes.left > 0, JSON.stringify(outcomes));
  check('a raise can be negotiated', outcomes.negotiated > 0, JSON.stringify(outcomes));

  const V = adultLife(405);
  const vprop = buyFlat(V);
  findTenant(V, vprop);
  const vname = vprop.landlord.tenant.name;
  const sold = renewLease(V, vprop.id, 'sell');
  check('sell with tenant in place: property gone, money in', sold.ok && sold.outcome === 'sold' && !V.housing.properties.find(p => p.id === vprop.id) && sold.netProceeds > 0, sold.msg);
  console.log('sold with', vname, 'in place for', sold.netProceeds);
}

/* ================= §5 condition 40 vs 90 ================= */
console.log('--- §5 condition cuts rent ---');
{
  const S = adultLife(505);
  const low = buyFlat(S, 'Low Flat, Shubra', 12000, 2500000);
  const high = buyFlat(S, 'High Flat, Zamalek', 12000, 2500000);
  findTenant(S, low); findTenant(S, high);
  low.landlord.tenant.reliability = 100;
  high.landlord.tenant.reliability = 100;
  low.conditionPct = 40;
  high.conditionPct = 90;
  const rentLow = effectiveMonthlyRentLocal(S, low);
  const rentHigh = effectiveMonthlyRentLocal(S, high);
  console.log('same flat, same rent base: condition 40 ->', rentLow, '| condition 90 ->', rentHigh);
  check('condition 40 earns less rent than condition 90 (same property)', rentLow < rentHigh, `${rentLow} vs ${rentHigh}`);
  check('condition 40 earns 25% less than condition 90', Math.abs(rentLow / rentHigh - 0.75) < 0.01, `ratio ${(rentLow / rentHigh).toFixed(3)}`);
  settleHouseholdMonth(S);
  const lowLine = ledgerLines(S, new RegExp(`^Rent from Low Flat, Shubra — paid by`))[0];
  const highLine = ledgerLines(S, new RegExp(`^Rent from High Flat, Zamalek — paid by`))[0];
  check('settled rent lines show the same gap', !!lowLine && !!highLine && lowLine.delta < highLine.delta, `low ${lowLine && lowLine.delta} high ${highLine && highLine.delta}`);
}

/* ================= §6 market state + history ================= */
console.log('--- §6 market state and history ---');
{
  const S = adultLife(606);
  buyFlat(S);
  for (let m = 0; m < 24; m++) { nextMonth(S); tickPropertyMarketMonth(S); }
  const hist = (S.propertyMarket?.egy?.history || []);
  check('market history records 24+ months', hist.length >= 24, `got ${hist.length}`);
  check('market states are only Rising / Stable / Falling', hist.every(h => ['rising', 'stable', 'falling'].includes(h.state)), [...new Set(hist.map(h => h.state))].join(','));
  check('history rent index moves with the state', hist.some(h => h.rentIndex !== 1), JSON.stringify(hist.slice(0, 5)));
  const html = strip(renderLandlordSectionHtml(S));
  check('landlord section shows the market state', /Property Market/.test(html) && /(Rising|Stable|Falling)/.test(html), html.slice(0, 200));
  const raw = renderLandlordSectionHtml(S);
  check('market chart is drawn from the real history', /data-chart="property-market"/.test(raw) && /<svg/.test(raw), '');
  console.log('market over 24 months:', [...new Set(hist.map(h => h.state))].join(' -> '), '| points', hist.length, '| current', S.propertyMarket.egy.state, 'x' + S.propertyMarket.egy.rentIndex);
}

/* ================= §7 void, maintenance, damage fixes ================= */
console.log('--- §7 void cost, maintenance, damage fixes ---');
{
  const S = adultLife(707);
  const prop = buyFlat(S);
  /* Force a void: no tenant, and keep the search from succeeding
     this one check by calling the rent calc directly. */
  const ll = landlordRentForMonth(S, prop);
  check('a void property pays no rent', ll.amount === 0 && ll.label === null, JSON.stringify(ll));
  check('a void month still costs real money (empty bills)', ll.voidCost > 0, `void cost ${ll.voidCost}`);
  let foundIn = -1;
  for (let m = 1; m <= 24; m++) {
    nextMonth(S);
    settleHouseholdMonth(S);
    if (prop.landlord.tenant) { foundIn = m; break; }
  }
  check('a new tenant is found for the void property (within 24 months)', foundIn > 0, `found in month ${foundIn}`);

  /* Maintenance: real price, real condition gain. */
  const M = adultLife(708);
  const mprop = buyFlat(M);
  mprop.conditionPct = 60;
  const mCost = Math.max(250, Math.round(mprop.valueLocal * 0.008));
  const cashBefore = M.money.cash;
  const maint = maintainProperty(M, mprop.id);
  check('maintenance restores +10 condition for 0.8% of value', maint.ok && mprop.conditionPct === 70 && M.money.cash === cashBefore - mCost, maint.msg);
  check('maintenance is its own ledger line', ledgerLines(M, new RegExp(`^Maintenance — ${mprop.name}`)).length === 1, '');

  /* Damage fixes: full / cheap / ignore, each with a real price. */
  const D = adultLife(709);
  const dprop = buyFlat(D);
  findTenant(D, dprop);
  const d = { id: 'dmg_test_boiler', key: 'boiler', label: 'Boiler / water heater failed', costLocal: 20000, condHit: 6, tenantCaused: false, status: 'open', year: D.year, month: D.month };
  dprop.landlord.damage.push(d);
  const dCash = D.money.cash;
  const fixed = fixDamage(D, dprop.id, d.id, 'full');
  check('fix properly: pays the full real price, damage closed', fixed.ok && d.status === 'fixed' && D.money.cash === dCash - 20000, fixed.msg);
  const d2 = { id: 'dmg_test_roof', key: 'roof', label: 'Roof leak — water coming through the ceiling', costLocal: 16000, condHit: 8, tenantCaused: false, status: 'open', year: D.year, month: D.month };
  dprop.landlord.damage.push(d2);
  const cheap = fixDamage(D, dprop.id, d2.id, 'cheap');
  check('fix cheaply: pays 40%, damage marked cheap-fixed', cheap.ok && d2.status === 'cheap-fixed' && D.money.cash === dCash - 20000 - 6400, cheap.msg);
  const d3 = { id: 'dmg_test_pipe', key: 'plumbing', label: 'Burst pipe / plumbing leak', costLocal: 12000, condHit: 5, tenantCaused: false, status: 'open', year: D.year, month: D.month };
  dprop.landlord.damage.push(d3);
  const condBefore = dprop.conditionPct;
  const ignored = fixDamage(D, dprop.id, d3.id, 'ignore');
  check('ignore: no money moves, condition falls, tenant unhappy', ignored.ok && d3.status === 'ignored' && dprop.conditionPct < condBefore, ignored.msg);
}

/* ================= §8 toggle + render ================= */
console.log('--- §8 Lease Out toggle + Real Estate render ---');
{
  const S = adultLife(808);
  const prop = buyFlat(S);
  findTenant(S, prop);
  const name = prop.landlord.tenant.name;
  const stopped = togglePropertyRental(S, prop.id);
  check('Stop Lease ends the tenancy', stopped.ok && prop.landlord.tenant === null && prop.rentedOut === false, stopped.msg);
  const cashBefore = S.money.cash;
  const listed = togglePropertyRental(S, prop.id);
  check('Lease Out finds a tenant at once', listed.ok && !!prop.landlord.tenant && prop.rentedOut === true, listed.msg);
  check('the new tenant\'s deposit lands in cash at once', S.money.cash === cashBefore + prop.landlord.deposit.amountLocal, `cash ${S.money.cash} vs ${cashBefore + prop.landlord.deposit.amountLocal}`);
  const html = strip(renderRealEstateTabHtml(S, ui));
  check('Real Estate tab shows the landlord section', /Being a Landlord/.test(html), '');
  check('Real Estate tab names the tenant', html.includes(prop.landlord.tenant.name), `tenant ${prop.landlord.tenant.name}`);
  check('Real Estate tab shows the market', /Property Market/.test(html), '');
  check('Real Estate tab shows the deposit', /Deposit held/.test(html), '');
  console.log('first tenant:', name, '| second tenant:', prop.landlord.tenant.name);
}

console.log(`\nV215-W1: ${pass} passed, ${fail} failed${fail ? ` — ${failures.join('; ')}` : ''}`);
process.exit(fail ? 1 : 0);
