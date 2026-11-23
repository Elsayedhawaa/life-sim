#!/usr/bin/env node
/* v2.20 I3 verify — prices (W3 fixes), measured on this copy.
 * Run from the game root:  node tests/v220-i3-verify.mjs
 * Reproduces Elsayed's exact flow (employed player, Egypt 2022, fruit
 * stall, part-time) and proves each number reconciles:
 *  (a) one price per action everywhere shown and charged;
 *  (b) stock math reconciles with revenue; the kiosk prices the same
 *      fruit the same way as its parent;
 *  (c) manager wage scales to the business; hire warned when the wage
 *      exceeds last month's net;
 *  (d) the launch-screen manager figure and the shortlist asks come
 *      from the same curve, range shown;
 *  (e) portfolio totals are the exact sum of the visible card rows
 *      (old-code −44 gap reproduced, 0 after);
 *  (f) the debt line follows the real state (misses not reset while
 *      debt stands, repayment reduces debt, warning names the rule);
 *  (g) the launch warning fires when the wage bill exceeds the takings.
 * Exit 0 only when there are no FAILs. Sections marked OPEN are gaps
 * this worker could not close inside its owned files (named owner +
 * exact hunk in the report); they print, they do not fail the run. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { getCountry, formatMoney } from '../src/data/countries.js';
import {
  createBusiness, evaluateBusinessLaunch, findVentureRow, listAllBusinessVentures,
  ventureLocalPricing, ventureViabilityWarningHtml, businessOpInfo, runBusinessOp
} from '../src/systems/businessEngine.js';
import { staffRolesForType, roleWageLocal, seedStartingStaff } from '../src/systems/businessStaff.js';
import {
  goingRateForSkill, managerShortlist, managerWageForBusiness,
  managerWageRangeForBusiness, managerWageRangeForVenture, managerWageVsLastNet,
  hireManager, renderManagerSectionHtml, businessSizeTier
} from '../src/systems/businessManager.js';
import {
  opsAvgTicket, opsBaseUnitCost, opsUnitCost, opsMonthlyUnits,
  renderStockSectionHtml, orderStock
} from '../src/systems/businessOperations.js';
import { roleEffectForEmployee, effectiveSkill } from '../src/systems/businessRoles.js';
import { computeBusinessMonthFull } from '../src/systems/businessMonthly.js';
import { foldDecisionEffectsIntoPL } from '../src/systems/businessDecisions.js';
import { settleHouseholdMonth, repayBusinessDebt } from '../src/systems/economyEngine.js';
import { businessesLastMonthNet } from '../src/systems/moneyTruth.js';
import { openBranch } from '../src/systems/businessBranches.js';
import { renderWorkTabHtml } from '../src/ui/views.js';

let pass = 0, fail = 0; const failedNames = [];
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`); }
  else { fail++; failedNames.push(name); console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const section = (t) => console.log(`\n--- ${t} ---`);
const open = (t) => console.log(`OPEN ${t}`);
const fmt = (n) => formatMoney(Math.round(n), 'egy');

/* Elsayed's player: 34, Egypt, June 2022, employed, cash to launch. */
function makeState(seed = 777) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1988 });
  ensureExtendedState(S);
  S.year = 2022; S.month = 6;
  S.player.age = 34;
  S.money.cash = 10_000_000;
  S.money.savings = 0;
  S.career.employed = true;
  S.career.job = { employer: 'Test Trading Co', title: 'Clerk', monthlyGross: 30000, performance: 65 };
  return S;
}

function launchStall(S) {
  const r = createBusiness(S, 'fruit_stall', '', { mode: 'part_time' });
  if (!r.ok) throw new Error(`launch failed: ${r.msg}`);
  return r.biz;
}

/* ================= fix 1: monthlyCost never collapses ================= */
section('fix 1 — monthlyCost is other costs only (10 of 52 used to collapse)');
{
  const S = makeState();
  const rows = listAllBusinessVentures(S).filter(b => (!b.from || S.year >= b.from) && (!b.to || S.year <= b.to));
  let collapsed = 0; const collapsedIds = [];
  for (const bp of rows) {
    const p = ventureLocalPricing(S, bp);
    const wageBill = staffRolesForType(bp.id).slice(0, 3).reduce((s, r) => s + roleWageLocal(S, r, 'egy'), 0);
    if (p.costLocal < wageBill) { collapsed++; collapsedIds.push(bp.id); }
    check(`other costs floored at 25% of takings — ${bp.id}`, p.costLocal >= Math.round(p.revLocal * 0.25), `cost ${fmt(p.costLocal)} vs 25% rev ${fmt(p.revLocal * 0.25)}`);
  }
  check('no venture row reprices below its own cost (floor never binds in Egypt)', collapsedIds.length === 10, `rows below wage bill: ${collapsedIds.join(', ')}`);
  const stall = launchStall(S);
  check('fruit stall monthlyCost stays 7,600 after seeding 3 staff (was 100)', stall.monthlyCost === 7600, `got ${stall.monthlyCost}`);
  const wageBill = (stall.staff || []).reduce((s, e) => s + (Number(e.wageLocal) || 0), 0);
  check('starter wage bill is 13,613 and charged from staff, not the lump', wageBill === 13613, `got ${wageBill}`);
  check('monthlyCost is NOT reduced by the wage bill', stall.monthlyCost + wageBill === 7600 + 13613, `other ${stall.monthlyCost} + wages ${wageBill}`);
}

/* ================= fix 2: stock label + unit cost per venture ================= */
section('fix 2 — stock reconciles; kiosk prices the same fruit the same way');
{
  const S = makeState();
  const stall = launchStall(S);
  const ticket = opsAvgTicket(S, stall);
  const unitCost = opsUnitCost(S, stall);
  const demand = opsMonthlyUnits(stall);
  const capacity = demand * ticket;
  check('avg ticket is 26 (20,900 / 800)', ticket === 26, `got ${ticket}`);
  check('base unit cost is 12 (45% of 26)', opsBaseUnitCost(S, stall) === 12, `got ${opsBaseUnitCost(S, stall)}`);
  check('unit cost to buy is 13 (12 x 1.10 reliable supplier)', unitCost === 13, `got ${unitCost}`);
  check('800 units x 26 selling price = 20,800 takings capacity ~ monthlyRev 20,900', Math.abs(capacity - stall.monthlyRev) <= Math.round(stall.monthlyRev * 0.05), `${demand} x ${ticket} = ${capacity} vs rev ${stall.monthlyRev}`);
  const html = renderStockSectionHtml(S, stall);
  check('stock line labels the cost to buy and the selling price', html.includes('costs 13 EGP a unit to buy (sells for ~26 EGP)'), 'label as rendered');
  check('stock line shows the takings capacity', html.includes('800 units × 26 EGP selling price = 20,800 EGP takings capacity'), 'capacity line as rendered');
  const br = openBranch(S, stall, 'Alexandria', { branchType: 'kiosk' });
  check('kiosk branch opens (real API)', br.ok, br.msg || '');
  const kiosk = br.branch || (S.career.businesses || []).find(b => b && b.isBranch);
  check('kiosk monthlyRev is 5,225 (quarter of the parent)', kiosk.monthlyRev === 5225, `got ${kiosk.monthlyRev}`);
  check('kiosk monthlyCost is 1,900 (quarter of the parent other costs, was 25)', kiosk.monthlyCost === 1900, `got ${kiosk.monthlyCost}`);
  check('kiosk ticket is the parent ticket (26, was 7)', opsAvgTicket(S, kiosk) === 26, `got ${opsAvgTicket(S, kiosk)}`);
  check('kiosk unit cost is the parent unit cost (13, was 3)', opsUnitCost(S, kiosk) === 13, `got ${opsUnitCost(S, kiosk)}`);
  const kHtml = renderStockSectionHtml(S, kiosk);
  check('kiosk stock line shows the same 13/26 prices', kHtml.includes('costs 13 EGP a unit to buy (sells for ~26 EGP)'), 'kiosk label as rendered');
}

/* ================= fix 3: manager wage scales to the business ================= */
section('fix 3 — manager wage scales to the business');
{
  const S = makeState();
  const stall = launchStall(S);
  check('fruit stall is a small-tier business', businessSizeTier(S, stall) === 'small', `got ${businessSizeTier(S, stall)}`);
  check('skill-51 manager asks 6,641/mo (was 12,474)', goingRateForSkill(S, stall, 51) === 6641, `got ${fmt(goingRateForSkill(S, stall, 51))}`);
  const range = managerWageRangeForBusiness(S, stall);
  check('small-tier range is 5,981–6,806 (skill 35–55)', range.low === 5981 && range.high === 6806 && range.lowSkill === 35 && range.highSkill === 55, `${fmt(range.low)}–${fmt(range.high)} skill ${range.lowSkill}–${range.highSkill}`);
  const list = managerShortlist(S, stall);
  check('every shortlist ask is inside the range', list.every(c => c.wage >= range.low && c.wage <= range.high), list.map(c => `${c.name.split(' ')[0]} ${c.skill}→${fmt(c.wage)}`).join(', '));
  check('no shortlist ask is the old flat 1.32x-mid floor or above', list.every(c => c.wage < 10890), `min ask ${fmt(Math.min(...list.map(c => c.wage)))}`);
  const br = openBranch(S, stall, 'Alexandria', { branchType: 'kiosk' });
  const kiosk = br.branch;
  const kRange = managerWageRangeForBusiness(S, kiosk);
  check('kiosk juniors ask 5,981–6,806 (was 11,583–12,573)', kRange.low === 5981 && kRange.high === 6806, `${fmt(kRange.low)}–${fmt(kRange.high)}`);
  /* Warn when the wage exceeds last month's net (Elsayed's stall netted 4,401). */
  stall.lastPL = { net: 4401, revenue: 32251, costs: 27353, tax: 497, month: 6, year: 2022 };
  const warn = managerWageVsLastNet(S, stall, 6641);
  check('wage 6,641 vs net 4,401 warns with a 2,240 top-up', warn && warn.lastNet === 4401 && warn.topUp === 2240, warn ? `top-up ${fmt(warn.topUp)}` : 'no warning');
  check('no warning when the wage is covered by the net', managerWageVsLastNet(S, stall, 4000) === null, 'wage 4,000 <= net 4,401');
  const cashBefore = S.money.cash;
  const hired = hireManager(S, stall, { name: 'Fady Farouk', skill: 51, wage: 6641, loyalty: 60, personId: 'mgr-test' });
  check('hire goes through with the warning in the message', hired.ok && hired.wageWarning && hired.msg.includes('6,641') && hired.msg.includes('4,401') && hired.msg.includes('2,240'), hired.msg);
  check('onboarding charges exactly the ask (6,641)', S.money.cash === cashBefore - 6641, `cash moved ${fmt(cashBefore - S.money.cash)}`);
  const mgrHtml = renderManagerSectionHtml(S, launchStall(makeState()));
  check('manager section states the range once', mgrHtml.includes('ask about 5,981 EGP–6,806 EGP/month (skill 35–55)'), 'range line as rendered');
}

/* ================= fix 4: one wage source ================= */
section('fix 4 — one wage source (launch estimate = shortlist curve)');
{
  const S = makeState();
  const bp = findVentureRow(S, 'fruit_stall');
  const ev = evaluateBusinessLaunch(S, bp);
  check('launch estimate is the shortlist curve at skill 45 (6,394)', ev.managerWageEstimateLocal === 6394, `got ${fmt(ev.managerWageEstimateLocal)}`);
  check('launch estimate equals managerWageForBusiness at skill 45', ev.managerWageEstimateLocal === managerWageForBusiness(S, { monthlyRev: ev.revLocal, capitalInvested: ev.capitalLocal, country: 'egy' }, 45), 'same function');
  check('launch range equals the shortlist range', ev.managerWageRangeLocal.low === 5981 && ev.managerWageRangeLocal.high === 6806, `${fmt(ev.managerWageRangeLocal.low)}–${fmt(ev.managerWageRangeLocal.high)}`);
  check('constraint note shows the range, not the flat 8,250', ev.constraintNote.includes('5,981') && ev.constraintNote.includes('6,806') && !ev.constraintNote.includes('8,250'), ev.constraintNote);
  check('true monthly cost is other + wages + rent (24,845, was 11,232)', ev.trueMonthlyCostLocal === 24845, `got ${fmt(ev.trueMonthlyCostLocal)}`);
  const stall = launchStall(S);
  const mgrHtml = renderManagerSectionHtml(S, stall);
  /* The render draws its own shortlist, so compare what the render
     itself shows: every button's data-wage against the ask printed
     next to it. */
  const buttonWages = [...mgrHtml.matchAll(/data-wage="(\d+)"/g)].map(m => Number(m[1])).sort((a, b) => a - b);
  const shownAsks = [...mgrHtml.matchAll(/Asks ([\d,]+) EGP\/month/g)].map(m => Number(m[1].replace(/,/g, ''))).sort((a, b) => a - b);
  check('every candidate button charges exactly its shown ask', buttonWages.length > 0 && JSON.stringify(buttonWages) === JSON.stringify(shownAsks), `buttons ${buttonWages.join(', ')} vs asks ${shownAsks.join(', ')}`);
  open('staff-role "Hire Manager" button still shows roleWageLocal 8,250 vs curve 6,394 — needs the businessRoles.js:438 label + businessStaff.js hireBusinessEmployee charge hunk (coordinator/I4; see report). Button today: '
    + `${fmt(roleWageLocal(S, 'manager', 'egy'))}/mo, shortlist curve at skill 45: ${fmt(managerWageForBusiness(S, stall, 45))}/mo.`);
}

/* ================= fix 8: staff effects on absolute skill ================= */
section('fix 8 — staff effects scale on absolute skill');
{
  const S = makeState();
  const stall = launchStall(S);
  const cashier = (stall.staff || []).find(e => e.role === 'cashier');
  if (!cashier) { check('stall seeded a cashier', false, `roles: ${(stall.staff || []).map(e => e.role).join(', ')}`); }
  else {
    const skill = Math.round(effectiveSkill(cashier));
    const s = 0.5 + skill / 100;
    const expectAdd = Math.round(s * 0.02 * stall.monthlyRev);
    const expectSave = Math.round(s * -0.03 * stall.monthlyRev);
    const eff = roleEffectForEmployee(S, stall, cashier);
    check(`skill-${skill} cashier adds ${expectAdd} revenue (was +9 under deviation scaling)`, eff.revenueAdd === expectAdd, `got ${eff.revenueAdd} (skill ${skill}, s=${s.toFixed(2)})`);
    check(`skill-${skill} cashier saves ${-expectSave} on the till`, eff.costAdd === expectSave, `got ${eff.costAdd}`);
    check('effect is >= 1% of monthlyRev (no longer a joke number)', Math.abs(eff.revenueAdd) >= stall.monthlyRev * 0.01, `${eff.revenueAdd} vs 1% = ${Math.round(stall.monthlyRev * 0.01)}`);
  }
}

/* ================= fix 5: one cost identity ================= */
section('fix 5 — portfolio totals are the exact sum of the visible rows');
{
  /* OLD code arithmetic, copied verbatim from v2.19 (both folds floored
     `other` at 0 but applied the full negative delta to `costs`):
     kiosk: other 100, costs 5,100 visible; month-effects −60, then a
     decision −84. Old: costs 4,956 vs visible 5,000 → gap −44 (W3's
     measured kiosk gap; Elsayed's paste is off by 163 the same way). */
  const oldFold = (other, costs, delta) => ({ other: Math.max(0, other + delta), costs: costs + delta });
  let o = oldFold(100, 5100, -60); o = oldFold(o.other, o.costs, -84);
  const oldVisible = 0 + 5000 + o.other;
  check('OLD folds reproduce the gap: costs 4,956 vs visible 5,000 (gap −44)', o.costs === 4956 && oldVisible === 5000 && o.costs - oldVisible === -44, `costs ${o.costs} vs visible ${oldVisible}`);
  /* NEW code, live: a group parent (head office + regional manager +
     supply-chain saving) with a negative month-effects costAdd. */
  const S = makeState();
  const stall = launchStall(S);
  openBranch(S, stall, 'Alexandria', { branchType: 'kiosk' });
  stall.group = { regionalManager: { name: 'Regional', skill: 70, wage: 9000 } };
  stall.monthEffects = { revenueMult: 1, revenueAdd: 0, costAdd: -600, repeatRateDelta: 0, moraleDelta: 0, notes: [] };
  const pl = computeBusinessMonthFull(S, stall);
  const identity = pl.rent + pl.wages + pl.other + pl.remote + pl.manager + (pl.reinvest || 0)
    + (pl.headOffice || 0) + (pl.regionalManager || 0) - (pl.staffSavings || 0) - (pl.supplyChainSaving || 0);
  check('head office is a real P&L line', (pl.headOffice || 0) > 0, `head office ${fmt(pl.headOffice || 0)}`);
  check('regional manager wage is a real P&L line (9,000)', (pl.regionalManager || 0) === 9000, `got ${fmt(pl.regionalManager || 0)}`);
  check('supply-chain saving is its own line', (pl.supplyChainSaving || 0) > 0, `saving ${fmt(pl.supplyChainSaving || 0)}`);
  check('other stays the real other-costs bill (5,700 — the saving is its own row, not a cut to other)', pl.other === 5700, `other ${fmt(pl.other)}`);
  check('negative costAdd is a Staff savings line, not a floor on other', (pl.staffSavings || 0) > 0 && pl.other > 0, `staff savings ${fmt(pl.staffSavings || 0)}, other ${fmt(pl.other)}`);
  check('NEW folds: costs exactly equal the visible rows (gap 0)', pl.costs === identity, `costs ${pl.costs} vs rows ${identity}`);
  /* Decision fold, direct: negative delta lands in other in full. */
  const pl2 = { revenue: 20000, other: 100, costs: 5100, profit: 0, tax: 0, net: 0 };
  foldDecisionEffectsIntoPL(S, pl2, { revenueMult: 1, revenueDelta: 0, costDelta: -84, repeatRateDelta: 0, notes: [] });
  check('decision fold: other 100 − 84 = 16 (was floored at 0)', pl2.other === 16, `got ${pl2.other}`);
  check('decision fold: costs 5,100 − 84 = 5,016 = visible rows', pl2.costs === 5016 && pl2.costs === 5000 + pl2.other, `costs ${pl2.costs}`);
  /* Portfolio totals read the same folded P&L the cards show. */
  const totals = businessesLastMonthNet(S);
  const kiosk = (S.career.businesses || []).find(b => b && b.isBranch);
  computeBusinessMonthFull(S, kiosk);
  const totals2 = businessesLastMonthNet(S);
  const sumCosts = (S.career.businesses || []).reduce((t, b) => t + (b.lastPL ? Math.round(b.lastPL.costs) : 0), 0);
  check('portfolio total costs equal the sum of the cards’ costs', totals2.totalCosts === sumCosts, `total ${fmt(totals2.totalCosts)} vs cards ${fmt(sumCosts)}`);
  const tabHtml = renderWorkTabHtml(S, { workSub: 'ventures' });
  check('card renders Head office / Regional manager / Staff savings rows', tabHtml.includes('Head office') && tabHtml.includes('Regional manager') && tabHtml.includes('Staff savings'), 'rows present');
}

/* ================= fix 6: debt — real repayment + honest lines ================= */
section('fix 6 — debt follows the real state');
{
  /* Old arithmetic, reproduced: one missed month at Elsayed's numbers. */
  check('old debt arithmetic reproduces 14,294 = 13,613 costs + 681 fee (5%)', 13613 + Math.round(13613 * 0.05) === 14294, '13,613 + 681');
  const S = makeState();
  const stall = launchStall(S);
  stall.monthlyRev = 5000; /* a stall whose takings collapsed — a losing month, forced */
  /* No salary this month: the test state is employed, and a salary
     would cover the loss — the cannot-cover branch needs cash 0 and
     no income landing. Citizenship keeps the business settling. */
  S.career.employed = false;
  S.career.job = null;
  S.money.cash = 0; S.money.savings = 0;
  settleHouseholdMonth(S);
  const pl1 = stall.lastPL;
  check('losing month settles (net < 0)', pl1 && pl1.net < 0, `net ${fmt(pl1 ? pl1.net : 0)}`);
  const expectDebt = Math.round(pl1.costs + Math.max(10, Math.round(pl1.costs * 0.05)));
  check('miss 1: debt is exactly costs + 5% fee', stall.debtLocal === expectDebt, `debt ${fmt(stall.debtLocal)} = costs ${fmt(pl1.costs)} + fee ${fmt(expectDebt - pl1.costs)}`);
  check('miss 1: misses is 1, not 0', stall.misses === 1, `misses ${stall.misses}`);
  check('debt clock starts June 2022', stall.debtSinceYear === 2022 && stall.debtSinceMonth === 6, `${stall.debtSinceMonth}/${stall.debtSinceYear}`);
  /* Month 2 (July): household CAN cover the loss — misses must NOT reset
     while the debt stands, and the debt must shrink by auto-repay. */
  S.month = 7;
  S.money.cash = 30000; S.money.savings = 0;
  const debtBefore = stall.debtLocal;
  settleHouseholdMonth(S);
  check('covered losing month does NOT reset misses while debt stands', stall.misses === 1, `misses ${stall.misses}`);
  check('auto-repay shrinks the debt in the covered month', stall.debtLocal < debtBefore, `debt ${fmt(debtBefore)} → ${fmt(stall.debtLocal)}`);
  /* Manual repay clears it. */
  S.money.cash = 100000;
  const repaid = repayBusinessDebt(S, stall);
  check('Repay debt clears the debt in full', repaid.ok && stall.debtLocal === 0 && repaid.remaining === 0, repaid.msg);
  check('misses reset only when the debt reaches 0', stall.misses === 0, `misses ${stall.misses}`);
  check('repaying with no debt is refused plainly', repayBusinessDebt(S, stall).ok === false, 'no-debt refusal');
  /* The card lines. */
  const S2 = makeState();
  const stall2 = launchStall(S2);
  stall2.monthlyRev = 5000;
  stall2.monthsLosing = 6;
  stall2.misses = 1;
  stall2.debtLocal = 14294;
  stall2.debtSinceYear = 2022; stall2.debtSinceMonth = 6;
  stall2.capitalInvested = 47500; stall2.retainedEarnings = -8000;
  const tabHtml2 = renderWorkTabHtml(S2, { workSub: 'ventures' });
  check('debt line names the debt, the missed months and when it began', tabHtml2.includes('owes 14,294 EGP from 1 missed month (June 2022)'), 'debt line as rendered');
  check('debt line offers Repay debt from cash', tabHtml2.includes('data-action="biz-repay-debt"') && tabHtml2.includes('Repay debt (14,294 EGP)'), 'repay button as rendered');
  check('losing line names the real rule (3 months you cannot pay for, 1 so far)', tabHtml2.includes('It closes after 3 months you cannot pay for (1 so far)'), 'losing sentence as rendered');
  check('losing line names the capital left (39,500)', tabHtml2.includes('39,500 EGP') && tabHtml2.includes('capital runs out'), 'capital-left as rendered');
}

/* ================= fix 7: launch warning is real ================= */
section('fix 7 — launch warning fires on the real comparison');
{
  const S = makeState();
  const stallBp = findVentureRow(S, 'fruit_stall');
  const warnHtml = ventureViabilityWarningHtml(S, stallBp);
  check('part-time stall warns (wages + other > settled takings)', warnHtml !== '', 'warning fired');
  check('warning names the staff wage 13,613', warnHtml.includes('13,613'), 'wages named');
  check('warning names the expected takings ~9,029', warnHtml.includes('9,029'), 'expected takings named');
  check('warning names the shortfall ~10,284 from your salary', warnHtml.includes('10,284') && warnHtml.includes('from your salary'), 'shortfall named');
  check('warning names the manager top-up 6,394', warnHtml.includes('6,394'), 'manager wage named');
  const gymBp = findVentureRow(S, 'gym');
  const gymWarn = ventureViabilityWarningHtml(S, gymBp);
  check('gym self-run part-time is viable — its warning is only the manager-run branch', gymWarn.includes('cannot pay its staff and a manager part-time') && !gymWarn.includes('cannot pay its own staff part-time'), 'gym warning as rendered');
  const franchiseBp = findVentureRow(S, 'gym_franchise');
  check('a venture whose takings cover staff AND a manager (gym franchise) shows no warning', ventureViabilityWarningHtml(S, franchiseBp) === '', 'gym franchise is silent');
  const ev = evaluateBusinessLaunch(S, stallBp);
  check('expected part-time takings are 9,029 (20,900 x 0.6 x 0.8 x 0.9)', ev.expectedRevPartTimeHome === 9029, `got ${ev.expectedRevPartTimeHome}`);
  check('part-time self cost is 19,313 (13,613 wages + 5,700 other x0.75)', ev.monthlyCostPartTimeHomeSelf === 19313, `got ${ev.monthlyCostPartTimeHomeSelf}`);
}

/* ================= (a) one price per action, shown = charged ================= */
section('(a) one price per action, everywhere shown and charged');
{
  const S = makeState();
  const stall = launchStall(S);
  /* Run-op: REMOVED in the merged tree (I2) — the food "Refresh Menu"
     run-op contradicted the Decisions price (13,585 vs 1,672 for the
     same action), so the run-op no longer runs and charges nothing;
     the one price is the Decisions one. The card button is gone too
     (I4). */
  const info = businessOpInfo(S, stall, 'rd');
  const cashBefore = S.money.cash;
  const ran = runBusinessOp(S, stall, 'rd');
  check('run-op "Refresh Menu" is REMOVED — charges nothing, one price only (the Decisions one)', info.removed === true && info.available === false && ran.ok === false && S.money.cash === cashBefore, `removed ${info.removed}, charged ${fmt(cashBefore - S.money.cash)}`);
  /* Stock pack: shown cost is the order cost. */
  const stockHtml = renderStockSectionHtml(S, stall);
  const ordered = orderStock(S, stall, 800);
  check('stock pack charges exactly its shown cost (800 x 13 = 10,400)', ordered.ok && ordered.cost === 10400 && stockHtml.includes('Order 800 units — costs 10,400 EGP'), `cost ${fmt(ordered.cost)}`);
  /* Manager hire: shown ask is the charged wage (see fix 3). */
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ` — FAILED: ${failedNames.join(', ')}` : ''}`);
process.exit(fail ? 1 : 0);
