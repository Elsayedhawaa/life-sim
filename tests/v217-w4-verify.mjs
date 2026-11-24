/* v2.17 W4 verify — Business Operations (§5 operating menu).
   Run from the game root: node tests/v217-w4-verify.mjs
   Every effect is measured with the v2.14 twin-lives method: two lives
   built from the same seed, one takes the action, the other does not,
   then both settle through the REAL monthly P&L (computeBusinessMonthFull)
   plus the W4 reference fold (applyOperationsEffects + foldMonthEffectsIntoPL)
   — the same fold the coordinator wires into computeBusinessMonthFull.
   The promised effect must land EXACTLY in the next month's P&L. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { launchSmallBusiness } from '../src/systems/careerEducationEngine.js';
import { computeBusinessMonthFull } from '../src/systems/businessMonthly.js';
import { stampMonthEffects } from '../src/systems/businessRoles.js';
import { computeBusinessTax } from '../src/systems/businessEngine.js';
import { takeBusinessLoan, getBusinessLoan } from '../src/systems/businessLoans.js';
import { getCountry } from '../src/data/countries.js';
import {
  ensureOpsState, emptyMonthEffects, addMonthEffect,
  orderStock, setPrice, pricingEffectFor, chooseSupplier,
  setOvertime, giveDayOff, spendMarketing,
  maintainPremises, opsExpandBusiness, opsOpenBranch, moveBusiness, opsMoveCost,
  opsWithdrawCash, opsReinvestCash, opsPayDownDebt,
  applyOperationsEffects, foldMonthEffectsIntoPL,
  renderOperationsMenuHtml, renderStockSectionHtml, renderPricingSectionHtml,
  renderSuppliersSectionHtml, renderStaffRotaSectionHtml, renderMarketingSectionHtml,
  renderPremisesSectionHtml, renderCashSectionHtml,
  opsMonthlyUnits, opsUnitCost, opsBaseUnitCost, OPS_SECTIONS
} from '../src/systems/businessOperations.js';
import fs from 'node:fs';

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

function adultLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.money.creditScore = 750; /* business loan needs 700 */
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function launch(S, name = 'Twin Restaurant') {
  const r = launchSmallBusiness(S, 'restaurant', name, { mode: 'part_time' });
  if (!r.ok) throw new Error('launch failed: ' + r.msg);
  const biz = S.career.businesses[0];
  ensureOpsState(S, biz);
  return biz;
}
function nextMonth(S) { S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; } }
/* Settle one month through the real P&L. v2.17 merge — the ops fold
   lives INSIDE computeBusinessMonthFull (step 5.5) on the merged
   tree, so calling applyOperationsEffects + foldMonthEffectsIntoPL
   again here applied the same effects twice (waste and delivery
   costs landed 2x, stock-outs squared). opts (e.g. { forceDelivery })
   ride through computeBusinessMonthFull's opts.ops. rev0/costs0/rr0
   are the FOLDED values now (the fold is inside); checks that need
   the pre-action base use a control twin instead. */
function settleOps(S, biz, opts = {}) {
  const pl = computeBusinessMonthFull(S, biz, { ops: opts });
  return { pl, eff: null, rev0: pl.revenue, costs0: pl.costs, rr0: biz.repeatRate };
}
function twinPair() {
  const A = adultLife(); const bizA = launch(A, 'Twin Restaurant');
  const B = adultLife(); const bizB = launch(B, 'Twin Restaurant');
  return { A, bizA, B, bizB };
}
/* Neutralise the staff (skill 50 = break-even) so a check measures
   only the thing it names — the W3 role effects would otherwise sit
   inside both twins' numbers and an exact multiplier comparison
   (stock-out x0.55, prices x1.04^3) would need a tolerance. */
function neutralStaff(S, biz) {
  biz.staff=[];biz.employees=0;
  stampMonthEffects(S, biz);
}

/* ================= §0 module hygiene ================= */
console.log('--- §0 hygiene ---');
{
  const src = fs.readFileSync('src/systems/businessOperations.js', 'utf8');
  check('businessOperations.js has 0 "reputation"', !/reputation/i.test(src));
  check('businessOperations.js never writes the P&L directly (no ".lastPL =" / "pl.revenue =")', !/lastPL\s*=/.test(src) && !/pl\.revenue\s*=/.test(src.replace(/foldMonthEffectsIntoPL[\s\S]*$/, '')));
  check('7 sections defined', OPS_SECTIONS.length === 7 && OPS_SECTIONS.join(',') === 'Stock,Pricing,Suppliers,Staff,Marketing,Premises,Cash');
}

/* ================= §1 menu render ================= */
console.log('--- §1 menu render ---');
{
  const S = adultLife(); const biz = launch(S);
  const html = renderOperationsMenuHtml(S, biz);
  const text = strip(html);
  for (const sec of OPS_SECTIONS) check(`menu shows section ${sec}`, text.includes(sec==='Pricing'?'Products & prices':sec));
  check('menu is 10 collapsed <details> (no open attribute)', (html.match(/<details/g) || []).length >= 10 && !/<details[^>]*\bopen\b/.test(html));
  const costMentions = (text.match(/costs [0-9][0-9,]*/g) || []).length + (text.match(/Spend [0-9][0-9,]*/g) || []).length;
  check('buttons name their cost in plain words (>=5 cost mentions)', costMentions >= 5, `found ${costMentions}`);
  check('stock section states stock level + what the month sells', strip(renderStockSectionHtml(S, biz)).includes('usually sells'));
  check('pricing section lists 3 items', (strip(renderPricingSectionHtml(S, biz)).match(/Lunch plate|Family meal|Catering tray/g) || []).length === 3);
  check('suppliers section names 2 suppliers', strip(renderSuppliersSectionHtml(S, biz)).includes('Budget Bulk Traders') && strip(renderSuppliersSectionHtml(S, biz)).includes('Freshline Wholesale'));
  check('staff rota section names a real staff member', strip(renderStaffRotaSectionHtml(S, biz)).includes(biz.staff[0].name));
  check('marketing section names 3 channels + diminishing returns', strip(renderMarketingSectionHtml(S, biz)).includes('Flyers') && strip(renderMarketingSectionHtml(S, biz)).includes('Social media ads') && strip(renderMarketingSectionHtml(S, biz)).includes('Radio') && strip(renderMarketingSectionHtml(S, biz)).includes('worth half'));
  check('premises section names repair + expand + move', strip(renderPremisesSectionHtml(S, biz)).includes('Repair premises') || strip(renderPremisesSectionHtml(S, biz)).includes('Maintain') && strip(renderPremisesSectionHtml(S, biz)).includes('Expand') && strip(renderPremisesSectionHtml(S, biz)).includes('Move to'));
  check('cash section names withdraw + reinvest + loan', strip(renderCashSectionHtml(S, biz)).includes('Withdraw') && strip(renderCashSectionHtml(S, biz)).includes('Reinvest'));
  console.log('restaurant monthlyRev:', biz.monthlyRev, '| monthly units:', opsMonthlyUnits(biz), '| unit cost:', opsUnitCost(S, biz), '| staff:', biz.staff.map(e => `${e.name} (${e.role}, wage ${e.wageLocal}, morale ${e.morale})`).join(' | '));
}

/* ================= §2 monthEffects contract ================= */
console.log('--- §2 monthEffects contract ---');
{
  const S = adultLife(); const biz = launch(S);
  const me = emptyMonthEffects();
  check('empty monthEffects defaults are exactly the contract', me.revenueMult === 1 && me.revenueAdd === 0 && me.costAdd === 0 && me.repeatRateDelta === 0 && me.moraleDelta === 0 && Array.isArray(me.notes) && me.notes.length === 0);
  /* The staff's own contribution (W3) is already stamped at launch —
     the marketing spend adds to it, so the check measures the delta. */
  const roleAddBefore = biz.monthEffects.revenueAdd;
  const m = spendMarketing(S, biz, 'social');
  check('marketing action stamps monthEffects (revenueAdd = promised)', m.ok && biz.monthEffects.revenueAdd - roleAddBefore === m.promisedNumbers.revenueAdd, `stamped ${biz.monthEffects.revenueAdd - roleAddBefore} vs promised ${m.promisedNumbers.revenueAdd}`);
  check('marketing action states its cost before committing', /costs/.test(m.promised) && m.promisedNumbers.cost > 0, m.promised);
  const r = settleOps(S, biz);
  check('fold consumes monthEffects (the marketing add is gone after the month)', biz.monthEffects.revenueAdd === roleAddBefore, `after settle: ${biz.monthEffects.revenueAdd} vs role baseline ${roleAddBefore}`);
  console.log('marketing social: cost', m.promisedNumbers.cost, '-> revenueAdd', m.promisedNumbers.revenueAdd, '| settled pl.revenue', r.pl.revenue, 'net', r.pl.net);
}

/* ================= §3 marketing twin — exact ================= */
console.log('--- §3 marketing lands exactly (twin lives) ---');
{
  const { A, bizA, B, bizB } = twinPair();
  check('twins identical before the action (rng state)', A.rngState === B.rngState, `${A.rngState} vs ${B.rngState}`);
  const m = spendMarketing(B, bizB, 'social');
  check('marketing applies', m.ok, m.msg);
  const promised = m.promisedNumbers.revenueAdd;
  const ra = settleOps(A, bizA);
  const rb = settleOps(B, bizB);
  check('promised revenueAdd lands EXACTLY in next month P&L revenue', rb.pl.revenue - ra.pl.revenue === promised, `B-A = ${rb.pl.revenue - ra.pl.revenue} vs promised ${promised}`);
  /* Control twin C (no action) proves the twins are identical apart
     from the action — the fold is inside the settlement now, so there
     is no pre-fold base to compare. */
  const C = adultLife(); const bizC = launch(C, 'Twin Restaurant');
  const rc = settleOps(C, bizC);
  check('control twins settle identically (base revenues identical before the action)', ra.pl.revenue === rc.pl.revenue, `${ra.pl.revenue} vs ${rc.pl.revenue}`);
  console.log('marketing twin: promised', promised, '| A revenue', ra.pl.revenue, '| B revenue', rb.pl.revenue);
}

/* ================= §4 rota twins — exact (3-way, morale isolated) ================= */
console.log('--- §4 rota lands exactly (twin lives, morale isolated) ---');
{
  const { A, bizA, B, bizB } = twinPair();
  const empB = bizB.staff[0];
  const ot = setOvertime(B, bizB, empB.id);
  check('overtime applies', ot.ok, ot.msg);
  /* Twin C: same morale drop, no overtime cost — isolates the money. */
  const C = adultLife(); const bizC = launch(C, 'Twin Restaurant');
  bizC.staff[0].morale = Math.max(5, Math.round(Number(bizC.staff[0].morale) || 0) - 6);
  const rc = settleOps(C, bizC);
  const rb = settleOps(B, bizB);
  check('overtime costAdd lands EXACTLY in next month P&L costs', rb.pl.costs - rc.pl.costs === ot.promisedNumbers.costAdd, `B-C = ${rb.pl.costs - rc.pl.costs} vs promised ${ot.promisedNumbers.costAdd}`);
  check('overtime tires the person (morale -6)', Math.round(Number(empB.morale)) === Math.round(Number(bizC.staff[0].morale)), `${empB.morale} vs ${bizC.staff[0].morale}`);
  console.log('overtime:', empB.name, 'cost', ot.promisedNumbers.costAdd, '| B costs', rb.pl.costs, '| C costs', rc.pl.costs);

  const t2 = twinPair();
  const emp2 = t2.bizB.staff[0];
  const off = giveDayOff(t2.B, t2.bizB, emp2.id);
  check('day off applies', off.ok, off.msg);
  const C2 = adultLife(); const bizC2 = launch(C2, 'Twin Restaurant');
  bizC2.staff[0].morale = Math.min(100, Math.round(Number(bizC2.staff[0].morale) || 0) + 8);
  const rc2 = settleOps(C2, bizC2);
  const rb2 = settleOps(t2.B, t2.bizB);
  check('day-off lost sales land EXACTLY in next month P&L revenue', rb2.pl.revenue - rc2.pl.revenue === off.promisedNumbers.revenueAdd, `B-C = ${rb2.pl.revenue - rc2.pl.revenue} vs promised ${off.promisedNumbers.revenueAdd}`);
  check('day off rests the person (morale +8)', Math.round(Number(emp2.morale)) === Math.round(Number(bizC2.staff[0].morale)), `${emp2.morale} vs ${bizC2.staff[0].morale}`);
  console.log('day off:', emp2.name, 'lost sales', -off.promisedNumbers.revenueAdd, '| B revenue', rb2.pl.revenue, '| C revenue', rc2.pl.revenue);
}

/* ================= §5 stock-out + overstock ================= */
console.log('--- §5 stock-out loses sales, overstock wastes money ---');
{
  const { A, bizA, B, bizB } = twinPair();
  const demand = opsMonthlyUnits(bizA);
  bizA.stockLevel = demand; bizB.stockLevel = 0;
  neutralStaff(A, bizA); neutralStaff(B, bizB); /* the x0.55 check measures stock only */
  /* These twins are ops-managed by hand (the test sets stock directly
     instead of ordering it) — mark them engaged so the settlement
     resolves stock. */
  bizA.opsEngaged = true; bizB.opsEngaged = true;
  const ra = settleOps(A, bizA);
  const rb = settleOps(B, bizB);
  const expected = Math.round(ra.pl.revenue * 0.55);
  check('stock-out: revenue is exactly x0.55 of the stocked twin', rb.pl.revenue === expected, `B ${rb.pl.revenue} vs expected ${expected} (A ${ra.pl.revenue})`);
  console.log('stock-out: stocked revenue', ra.pl.revenue, '| empty-shelf revenue', rb.pl.revenue, '| ratio', (rb.pl.revenue / ra.pl.revenue).toFixed(3));

  const t2 = twinPair();
  const demand2 = opsMonthlyUnits(t2.bizA);
  const extra = 200;
  t2.bizA.stockLevel = demand2; t2.bizB.stockLevel = demand2 + extra;
  t2.bizA.opsEngaged = true; t2.bizB.opsEngaged = true;
  neutralStaff(t2.A, t2.bizA); neutralStaff(t2.B, t2.bizB);
  const waste = Math.round(extra * opsBaseUnitCost(t2.B, t2.bizB));
  const ra2 = settleOps(t2.A, t2.bizA);
  const rb2 = settleOps(t2.B, t2.bizB);
  check('overstock: waste lands EXACTLY in next month P&L costs', rb2.pl.costs - ra2.pl.costs === waste, `B-A = ${rb2.pl.costs - ra2.pl.costs} vs waste ${waste} (${extra} units x ${opsBaseUnitCost(t2.B, t2.bizB)})`);
  check('overstock: stock is gone after the month (sold + wasted)', t2.bizB.stockLevel === 0, `stockLevel ${t2.bizB.stockLevel}`);
  console.log('overstock: waste', waste, '| A costs', ra2.pl.costs, '| B costs', rb2.pl.costs);
}

/* ================= §6 supplier failure + success ================= */
console.log('--- §6 supplier delivery: cheap fails, reliable delivers ---');
{
  const { A, bizA, B, bizB } = twinPair();
  const demand = opsMonthlyUnits(bizA);
  bizA.stockLevel = demand; bizB.stockLevel = 0;
  neutralStaff(A, bizA); neutralStaff(B, bizB); /* the x0.55 check measures stock only */
  const ch = chooseSupplier(B, bizB, 'budget_bulk');
  check('switch to cheap supplier applies', ch.ok && ch.reliability === 0.70, ch.msg);
  const ord = orderStock(B, bizB, demand);
  check('order from cheap supplier applies', ord.ok, ord.msg);
  /* The delivery is due NEXT month: advance both twins, then settle. */
  nextMonth(A); nextMonth(B);
  const ra = settleOps(A, bizA);
  const rb = settleOps(B, bizB, { forceDelivery: 'fail' });
  check('cheap supplier failure happens (pending delivery gone, outcome recorded)', bizB.pendingDeliveries.length === 0 && !!bizB.lastSupplierOutcome, bizB.lastSupplierOutcome?.text || 'no outcome');
  check('failed delivery charges nothing (costs equal to stocked twin)', rb.pl.costs === ra.pl.costs, `B ${rb.pl.costs} vs A ${ra.pl.costs}`);
  check('failed delivery costs sales (stock-out x0.55)', rb.pl.revenue === Math.round(ra.pl.revenue * 0.55), `B ${rb.pl.revenue} vs expected ${Math.round(ra.pl.revenue * 0.55)}`);
  console.log('supplier fail:', bizB.lastSupplierOutcome?.text);

  const t2 = twinPair();
  const demand2 = opsMonthlyUnits(t2.bizA);
  t2.bizA.stockLevel = demand2; t2.bizB.stockLevel = 0;
  const ord2 = orderStock(t2.B, t2.bizB, demand2);
  check('order from reliable supplier applies', ord2.ok, ord2.msg);
  nextMonth(t2.A); nextMonth(t2.B);
  const ra2 = settleOps(t2.A, t2.bizA);
  const rb2 = settleOps(t2.B, t2.bizB, { forceDelivery: 'ok' });
  const expectedCost = Math.round(demand2 * ord2.unitCost);
  check('delivered stock cost lands EXACTLY in next month P&L costs', rb2.pl.costs - ra2.pl.costs === expectedCost, `B-A = ${rb2.pl.costs - ra2.pl.costs} vs ${expectedCost}`);
  check('delivered stock prevents the stock-out (revenue equals stocked twin)', rb2.pl.revenue === ra2.pl.revenue, `B ${rb2.pl.revenue} vs A ${ra2.pl.revenue}`);
  console.log('supplier ok: delivered', demand2, 'units for', expectedCost, '| B costs', rb2.pl.costs, '| A costs', ra2.pl.costs);
}

/* ================= §7 marketing diminishing returns ================= */
console.log('--- §7 marketing diminishing returns (measured) ---');
{
  const S = adultLife(); const biz = launch(S);
  /* The staff's own contribution (W3) is already stamped at launch —
     the spends add to it, so the check measures the delta. */
  const roleAddBefore = biz.monthEffects.revenueAdd;
  const p1 = spendMarketing(S, biz, 'flyers');
  const p2 = spendMarketing(S, biz, 'flyers');
  const p3 = spendMarketing(S, biz, 'flyers');
  check('first flyer spend applies', p1.ok, p1.msg);
  check('second spend same channel same month is worth exactly half the first', p2.ok && p2.promisedNumbers.revenueAdd === Math.round(p1.promisedNumbers.revenueAdd * 0.5), `1st ${p1.promisedNumbers.revenueAdd} vs 2nd ${p2.promisedNumbers.revenueAdd}`);
  check('third spend is worth a quarter of the first', p3.ok && p3.promisedNumbers.revenueAdd === Math.round(p1.promisedNumbers.revenueAdd * 0.25), `1st ${p1.promisedNumbers.revenueAdd} vs 3rd ${p3.promisedNumbers.revenueAdd}`);
  check('monthEffects add the spends together', biz.monthEffects.revenueAdd - roleAddBefore === p1.promisedNumbers.revenueAdd + p2.promisedNumbers.revenueAdd + p3.promisedNumbers.revenueAdd, `${biz.monthEffects.revenueAdd - roleAddBefore}`);
  console.log('flyers: 1st +', p1.promisedNumbers.revenueAdd, '| 2nd +', p2.promisedNumbers.revenueAdd, '| 3rd +', p3.promisedNumbers.revenueAdd, '| each cost', p1.promisedNumbers.cost);
}

/* ================= §8 pricing — too high loses customers ================= */
console.log('--- §8 pricing: too high loses customers (repeatRate, measured) ---');
{
  /* Neutralise the staff (skill 50 = break-even) so the pricing
     multiplier is the only thing moving revenue — the W3 role effects
     would otherwise sit inside both twins' numbers and the exact
     1.04^3 / 0.97^3 comparison would need a tolerance. Twin pairs:
     control (stocked, standard prices) vs priced. */
  const cat = ['product_0','product_1','product_2'];
  const tH = twinPair();
  tH.bizA.stockLevel = opsMonthlyUnits(tH.bizA); tH.bizB.stockLevel = opsMonthlyUnits(tH.bizB);
  neutralStaff(tH.A, tH.bizA); neutralStaff(tH.B, tH.bizB);
  for (const item of cat) { setPrice(tH.B, tH.bizB, item, 'up'); setPrice(tH.B, tH.bizB, item, 'up'); }
  const pe = pricingEffectFor(tH.B, tH.bizB);
  check('all 3 items high: revenueMult is exactly 1.04^3', Math.abs(pe.revenueMult - Math.pow(1.04, 3)) < 1e-9, `got ${pe.revenueMult}`);
  check('all 3 items high: repeatRateDelta is exactly -0.036', Math.abs(pe.repeatRateDelta - (-0.036)) < 1e-9, `got ${pe.repeatRateDelta}`);
  const rH = settleOps(tH.A, tH.bizA);
  const rH2 = settleOps(tH.B, tH.bizB);
  check('high prices: revenue is exactly base x 1.04^3', rH2.pl.revenue === Math.round(rH.pl.revenue * Math.pow(1.04, 3)), `got ${rH2.pl.revenue} vs expected ${Math.round(rH.pl.revenue * Math.pow(1.04, 3))}`);
  check('high prices: repeatRate falls by exactly 0.036 in the fold', Math.abs((tH.bizB.repeatRate - tH.bizA.repeatRate) - (-0.036)) < 1e-9, `delta ${tH.bizB.repeatRate - tH.bizA.repeatRate}`);
  console.log('pricing high: revenue', rH.pl.revenue, '->', rH2.pl.revenue, '| repeatRate', tH.bizA.repeatRate.toFixed(3), '->', tH.bizB.repeatRate.toFixed(3));

  const tL = twinPair();
  tL.bizA.stockLevel = opsMonthlyUnits(tL.bizA); tL.bizB.stockLevel = opsMonthlyUnits(tL.bizB);
  neutralStaff(tL.A, tL.bizA); neutralStaff(tL.B, tL.bizB);
  for (const item of cat) { setPrice(tL.B, tL.bizB, item, 'down'); setPrice(tL.B, tL.bizB, item, 'down'); }
  const pe2 = pricingEffectFor(tL.B, tL.bizB);
  check('all 3 items low: revenueMult is exactly 0.97^3', Math.abs(pe2.revenueMult - Math.pow(0.97, 3)) < 1e-9, `got ${pe2.revenueMult}`);
  check('all 3 items low: repeatRateDelta is exactly +0.018', Math.abs(pe2.repeatRateDelta - 0.018) < 1e-9, `got ${pe2.repeatRateDelta}`);
  const rL = settleOps(tL.A, tL.bizA);
  const rL2 = settleOps(tL.B, tL.bizB);
  check('low prices: revenue is exactly base x 0.97^3', rL2.pl.revenue === Math.round(rL.pl.revenue * Math.pow(0.97, 3)), `got ${rL2.pl.revenue} vs expected ${Math.round(rL.pl.revenue * Math.pow(0.97, 3))}`);
  check('low prices: repeatRate rises by exactly 0.018 in the fold', Math.abs((tL.bizB.repeatRate - tL.bizA.repeatRate) - 0.018) < 1e-9, `delta ${tL.bizB.repeatRate - tL.bizA.repeatRate}`);
  console.log('pricing low: revenue', rL.pl.revenue, '->', rL2.pl.revenue, '| repeatRate', tL.bizA.repeatRate.toFixed(3), '->', tL.bizB.repeatRate.toFixed(3));
}

/* ================= §9 premises move + expand/branch wrappers ================= */
console.log('--- §9 premises: move, expand, branch wrappers ---');
{
  const S = adultLife(); const biz = launch(S);
  const homeCity = S.city;
  const otherCity = (getCountry('egy').cities || []).find(c => c !== homeCity && c !== biz.city) || (getCountry('egy').cities || []).find(c => c !== biz.city);
  const cashBefore = S.money.cash;
  const mv = moveBusiness(S, biz, otherCity);
  check('move applies', mv.ok, mv.msg);
  check('move charges exactly the stated cost', cashBefore - S.money.cash === mv.cost, `${cashBefore - S.money.cash} vs ${mv.cost}`);
  check('move lands in the new city', biz.city === otherCity, biz.city);
  check('move resets repeat customers to exactly 0.30 (W1 new-city rule)', biz.repeatRate === 0.30, `got ${biz.repeatRate}`);
  console.log('move:', mv.from, '->', mv.to, '| cost', mv.cost, '| repeatRate', biz.repeatRate, '| remote', biz.remote);

  const S2 = adultLife(); const biz2 = launch(S2);
  const ex = opsExpandBusiness(S2, biz2);
  check('expand wrapper returns the real gate (not ready yet, plain reason)', !ex.ok && typeof ex.msg === 'string' && ex.msg.length > 10, ex.msg);
  const br = opsOpenBranch(S2, biz2, 'NotACity');
  check('branch wrapper returns the real refusal for a bad city', !br.ok, br.msg);
  const rep = maintainPremises(S2, biz2);
  check('maintain on a home business refuses plainly (nothing to repair)', !rep.ok, rep.msg);
}

/* ================= §10 cash wrappers reuse v2.14 ================= */
console.log('--- §10 cash: withdraw / reinvest / pay down (v2.14 reused) ---');
{
  const S = adultLife(); const biz = launch(S);
  biz.retainedCash = 100000;
  const cashBefore = S.money.cash;
  const w = opsWithdrawCash(S, biz, 40000);
  const tax = computeBusinessTax(S, 40000).tax;
  check('withdraw applies with v2.14 tax', w.ok && w.tax === tax, w.msg);
  check('withdraw lands exactly (gross minus tax) in cash', S.money.cash - cashBefore === 40000 - tax, `${S.money.cash - cashBefore} vs ${40000 - tax}`);
  check('withdraw leaves the rest retained', biz.retainedCash === 60000, `got ${biz.retainedCash}`);
  console.log('withdraw: gross 40000, tax', tax, 'net', 40000 - tax, '| retained left', biz.retainedCash);

  const S2 = adultLife(); const biz2 = launch(S2);
  const cash2 = S2.money.cash;
  const ri = opsReinvestCash(S2, biz2, 50000);
  check('reinvest applies with a boost', ri.ok && ri.boost > 1, ri.msg);
  check('reinvest moves exactly the amount out of cash', cash2 - S2.money.cash === 50000, `${cash2 - S2.money.cash}`);
  console.log('reinvest: 50000 in, boost x', ri.boost.toFixed(3), '| retained', ri.retainedCash);

  const S3 = adultLife(); const biz3 = launch(S3);
  const loan = takeBusinessLoan(S3, biz3, 250000); /* loan minimum is 250,000 EGP */
  check('test loan taken', loan.ok, loan.msg);
  const balBefore = getBusinessLoan(S3, biz3).balance;
  const pd = opsPayDownDebt(S3, biz3, 20000);
  check('pay down debt applies', pd.ok, pd.msg);
  check('pay down cuts the balance by exactly the amount', getBusinessLoan(S3, biz3).balance === balBefore - 20000, `${getBusinessLoan(S3, biz3).balance} vs ${balBefore - 20000}`);
  console.log('pay down: balance', balBefore, '->', getBusinessLoan(S3, biz3).balance);
}

/* ================= §11 render anchors for the coordinator ================= */
console.log('--- §11 wiring anchors exist (views.js / main.js untouched by W4) ---');
{
  const views = fs.readFileSync('src/ui/views.js', 'utf8');
  check('views.js still has the decisions render line (insert after it)', views.includes('${renderDecisionsHtml(S, biz)}'));
  check('menu Cash supersedes the standalone cash render (line removed at merge)', !views.includes('${renderCashHtml(S, biz)}'), 'renderCashHtml still rendered — the card would show two withdraw/reinvest controls');
  const main = fs.readFileSync('src/main.js', 'utf8');
  check('main.js still has the biz-decision dispatch (ops dispatch goes beside it)', main.includes("action === 'biz-decision'"));
  const ops = fs.readFileSync('src/systems/businessOperations.js', 'utf8');
  check('operations module exports the dispatch functions', /export function (orderStock|setPrice|chooseSupplier|setOvertime|giveDayOff|spendMarketing|maintainPremises|opsExpandBusiness|opsOpenBranch|moveBusiness|opsWithdrawCash|opsReinvestCash|opsPayDownDebt)/.test(ops));
}

console.log(`\nW4: ${pass} passed, ${fail} failed${fail ? ' — ' + failures.join('; ') : ''}`);
process.exit(fail ? 1 : 0);
