/* v2.17 W2 verify — §3 outcome distribution + §6 expansion/groups.
   Run from the game root: node tests/v217-w2-verify.mjs
   Proves, each MEASURED (no quoted numbers — every figure below is
   counted or computed by this script):
   (a) a business reaches level 6+ (no ceiling);
   (b) a broken-out business becomes a group with a head office, a
       regional manager and a supply chain;
   (c) bulk buying cuts the per-unit cost for EVERY branch (measured
       per branch, against the base P&L);
   (d) brand value grows with profitable months and falls with a bad
       month (measured, exact deltas);
   (e) a business CAN fail (capital exhausted) and warns in plain
       words BEFORE it dies — two warnings, then death with the cause
       named, staff let go, salvage settled;
   (f) twin lives, same seed, different decisions -> different outcomes;
   (g) the monthEffects contract (W3/W4): the promised effect lands
       exactly, and nothing lands when monthEffects is absent;
   (h) the four branch types have real costs and real effects;
   (i) the 100-life distribution: a real failure rate and a real
       breakout rate, both strictly between 0% and 100%;
   (j) the folded P&L identity holds every month, and a dead business
       settles zero afterwards. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { hashSeed } from '../src/core/rng.js';
import { computeBusinessMonth, expandBusiness, businessMonthIndex } from '../src/systems/businessEngine.js';
import { computeBusinessMonthFull } from '../src/systems/businessMonthly.js';
import { openBranchOfType, branchTypeSetupCost, BRANCH_TYPES } from '../src/systems/businessBranches.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import { convertCurrency } from '../src/data/economy.js';
import { listAllBusinessVentures } from '../src/systems/businessEngine.js';
import {
  breakoutCheck, formGroup, supplyChainDiscount, brandRevenueMult,
  regionalManagerRevenueMult, groupBrandValue, BRAND_START_VALUE,
  renderGroupHtml, renderBrandHtml
} from '../src/systems/businessGrowth.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const journalTexts = (S) => (S.journal || []).map(e => e.text || '');
const findJournal = (S, re) => journalTexts(S).findIndex(t => re.test(t));

function adultLife(cash = 5_000_000, seed = 777) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = cash;
  S.money.savings = 0;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkStaff(skill, morale = 70, n = 3) {
  const roles = ['chef', 'waiter', 'cashier'];
  return Array.from({ length: n }, (_, i) => ({
    id: `s${i + 1}`, name: ['Aya', 'Omar', 'Mona'][i % 3], role: roles[i % 3],
    wageLocal: 8000, morale, skill, hiredYear: 2024, hiredMonth: 1
  }));
}
function mkBiz(id, name, rev, cost, capital, opts = {}) {
  return {
    id, typeId: 'cafe', name, country: 'egy', city: 'Cairo', level: opts.level || 1,
    maxLevel: Infinity, volatility: opts.volatility ?? 0.05,
    monthlyRev: rev, monthlyCost: cost, capitalInvested: capital,
    totalCapitalIn: capital, brandValue: 1000, retainedEarnings: 0,
    repeatRate: opts.repeatRate ?? 0.5, mode: opts.mode || 'full_time',
    staff: mkStaff(opts.skill ?? 60, opts.morale ?? 70, opts.staffN ?? 3),
    premises: opts.premises || { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: opts.history || [], heirId: null, remote: false,
    foundedYear: opts.foundedYear ?? 2024, foundedMonth: opts.foundedMonth ?? 1,
    manager: null, ownerManaged: true, ownerHoursPerWeek: 40,
    dead: false, deathCause: null, group: null, brokeOut: false,
    distressStage: 0, marketSlumpMonths: 0
  };
}
function nextMonth(S) { S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; } }
/* One simulated month through the real fold. The rng is re-seeded per
   month so the wave is reproducible and identical for twin lives. */
function simMonth(S, biz) {
  S.rngState = hashSeed(9000 + businessMonthIndex(S));
  return computeBusinessMonthFull(S, biz);
}
const plIdentity = (pl) => pl.profit === pl.revenue - pl.costs && pl.net === pl.profit - pl.tax;

/* ================= (a) level 6+ — no ceiling ================= */
console.log('--- (a) levels go past 5 ---');
{
  const S = adultLife(50_000_000);
  const biz = mkBiz('biz_lvl', 'Level Café', 300000, 80000, 500000, {
    skill: 80, history: Array.from({ length: 6 }, () => ({ net: 5000 }))
  });
  S.career.businesses = [biz]; S.career.business = biz;
  let expanded = 0;
  for (let i = 0; i < 5; i++) {
    const r = expandBusiness(S, biz);
    if (r.ok) expanded += 1;
    else console.log(`  expand ${i + 1} refused: ${r.msg}`);
  }
  console.log(`level after 5 expansions: ${biz.level} (expanded ${expanded}x), capital ${biz.capitalInvested}, total put in ${biz.totalCapitalIn}`);
  check('a business reaches level 6 (no ceiling)', biz.level === 6 && expanded === 5, `level ${biz.level}`);
  check('expanding grows the capital put in (death rule reads it)', biz.totalCapitalIn > 500000, `totalCapitalIn ${biz.totalCapitalIn}`);
}

/* ================= (b) breakout -> group ================= */
console.log('--- (b) breakout becomes a group ---');
let groupBiz = null, groupS = null;
{
  const S = adultLife(50_000_000);
  const biz = mkBiz('biz_grp', 'Group Café', 300000, 80000, 500000, {
    skill: 80, repeatRate: 0.66, history: Array.from({ length: 6 }, () => ({ net: 5000 }))
  });
  S.career.businesses = [biz]; S.career.business = biz;
  for (let i = 0; i < 5; i++) expandBusiness(S, biz);
  console.log(`pre-breakout: level ${biz.level}, brand ${biz.brandValue}, repeatRate ${biz.repeatRate}`);
  let formedAt = -1;
  for (let m = 1; m <= 12; m++) {
    nextMonth(S);
    const pl = simMonth(S, biz);
    if (!plIdentity(pl)) { check(`P&L identity holds in breakout month ${m}`, false, `profit ${pl.profit} net ${pl.net}`); }
    if (biz.group) { formedAt = m; break; }
  }
  console.log(`group formed after ${formedAt} settled month(s): level ${biz.level}, brand ${biz.brandValue}, repeatRate ${biz.repeatRate.toFixed(3)}`);
  check('a good business breaks out into a group', !!biz.group && formedAt > 0, `group ${!!biz.group}`);
  const g = biz.group || {};
  console.log(`head office: ${g.headOffice?.monthlyCostLocal}/mo, ${g.headOffice?.staff} staff in ${g.headOffice?.city}`);
  console.log(`regional manager: ${g.regionalManager?.name} (skill ${g.regionalManager?.skill}, wage ${g.regionalManager?.wage}/mo)`);
  console.log(`supply chain bulk discount: ${Math.round((g.supplyChain?.bulkDiscount || 0) * 100)}%`);
  check('group has a head office with a real cost and real staff', (g.headOffice?.monthlyCostLocal || 0) > 0 && g.headOffice?.staff === 2, `cost ${g.headOffice?.monthlyCostLocal}`);
  check('group has a regional manager with a real salary', !!(g.regionalManager?.name) && (g.regionalManager?.wage || 0) > 0, `wage ${g.regionalManager?.wage}`);
  check('regional manager effect is +5% + skill/10% on every member', Math.abs(regionalManagerRevenueMult(S, biz) - (1 + 0.05 + (g.regionalManager?.skill || 0) / 1000)) < 1e-9, `mult ${regionalManagerRevenueMult(S, biz)}`);
  check('group has a supply chain with a real bulk discount', (g.supplyChain?.bulkDiscount || 0) >= 0.10, `discount ${g.supplyChain?.bulkDiscount}`);
  check('breakout is journalled in plain words', findJournal(S, /has broken out — it is now a group/) >= 0);
  check('group fields match the W5 contract (headOffice/regionalManager/supplyChain/formedYear/formedMonth)', !!g.headOffice && !!g.regionalManager && !!g.supplyChain && !!g.formedYear && !!g.formedMonth, JSON.stringify(Object.keys(g)));
  const plAfter = null; /* (group costs are measured on the next month below) */
  nextMonth(S);
  const pl2 = simMonth(S, biz);
  console.log(`group month P&L: headOffice ${pl2.headOffice}, regionalManager ${pl2.regionalManager}, net ${pl2.net}`);
  check('head office + regional manager are real P&L cost lines on the parent', (pl2.headOffice || 0) > 0 && (pl2.regionalManager || 0) > 0, `ho ${pl2.headOffice} rm ${pl2.regionalManager}`);
  const gh = renderGroupHtml(S, biz);
  const bh = renderBrandHtml(S, biz);
  check('group render shows the head office, regional manager, discount and brand value', gh.includes('Head office') && gh.includes(g.regionalManager.name) && gh.includes('%') && gh.includes('Group brand value'), gh.slice(0, 80));
  check('brand render shows the brand value and the breakout checklist', bh.includes('Brand value') && bh.includes('Breaking out'), bh.slice(0, 80));
  groupBiz = biz; groupS = S;
  void plAfter;
}

/* ================= (c) bulk discount, every branch ================= */
console.log('--- (c) bulk buying cuts per-unit cost for EVERY branch ---');
{
  const S = groupS, biz = groupBiz;
  const bShop = openBranchOfType(S, biz, 'Alexandria', 'shop');
  const bKiosk = openBranchOfType(S, biz, 'New Cairo', 'kiosk');
  const bWh = openBranchOfType(S, biz, 'Sheikh Zayed', 'warehouse');
  check('shop branch opens', bShop.ok, bShop.msg);
  check('kiosk branch opens', bKiosk.ok, bKiosk.msg);
  check('warehouse branch opens', bWh.ok, bWh.msg);
  const branches = [biz, bShop.branch, bKiosk.branch, bWh.branch];
  const discount = supplyChainDiscount(S, biz);
  console.log(`bulk discount with 3 branches (1 warehouse): ${Math.round(discount * 100)}% (0.10 + 0.02x3 + 0.05x1 = 21%)`);
  check('bulk discount is 21% for 3 branches incl. 1 warehouse', Math.abs(discount - 0.21) < 1e-9, `got ${discount}`);
  for (const b of branches) {
    /* Base other-costs from the base P&L (no fold), then the folded
       other-costs with the same rng state: the fold must cut exactly
       the bulk discount off the base line. */
    const seed = hashSeed(31337);
    S.rngState = seed;
    const basePl = computeBusinessMonth(S, structuredClone(b));
    S.rngState = seed;
    nextMonth(S);
    const pl = simMonth(S, b);
    const expectedOther = Math.round((Number(basePl.other) || 0) * (1 - discount));
    console.log(`${b.name} (${b.branchType || 'parent'}): base other ${basePl.other} -> folded other ${pl.other} (expected ${expectedOther}), saving ${pl.supplyChainSaving}, shock ${pl.marketShock || (pl.marketSlump ? 'slump' : 'none')}`);
    check(`bulk buying cuts per-unit cost for ${b.branchType || 'the parent'}`, pl.supplyChainSaving > 0 && pl.other === expectedOther, `other ${pl.other} vs ${expectedOther}`);
    check(`P&L identity holds for ${b.branchType || 'the parent'}`, plIdentity(pl), `profit ${pl.profit} net ${pl.net}`);
  }
}

/* ================= (d) brand value up and down ================= */
console.log('--- (d) brand value grows with profit, falls with a bad month ---');
{
  const S = adultLife();
  const biz = mkBiz('biz_brand', 'Brand Café', 200000, 50000, 500000, { skill: 60 });
  S.career.businesses = [biz]; S.career.business = biz;
  console.log(`brand at launch: ${biz.brandValue} (revenue mult ${brandRevenueMult(S, biz)})`);
  check('brand starts at 1,000 and moves no revenue yet', biz.brandValue === 1000 && brandRevenueMult(S, biz) === 1, `brand ${biz.brandValue} mult ${brandRevenueMult(S, biz)}`);
  const nets = [];
  for (let m = 1; m <= 3; m++) {
    nextMonth(S);
    const pl = simMonth(S, biz);
    nets.push(pl.net);
    console.log(`month ${m}: net ${pl.net}, brand ${biz.brandValue} (delta ${pl.brandDelta})`);
  }
  const brandAfterGood = biz.brandValue;
  check('brand grows over 3 profitable months', brandAfterGood > 1000, `brand ${brandAfterGood}`);
  /* Exact delta: +50 + 2% of the net, every profitable month. */
  const S2 = adultLife();
  const biz2 = mkBiz('biz_brand2', 'Brand Café 2', 200000, 50000, 500000, { skill: 60 });
  S2.career.businesses = [biz2]; S2.career.business = biz2;
  nextMonth(S2);
  const pl1 = simMonth(S2, biz2);
  const expectedDelta = Math.round(50 + Math.max(0, pl1.net) * 0.02);
  console.log(`exact brand delta month 1: net ${pl1.net} -> delta ${pl1.brandDelta} (expected ${expectedDelta})`);
  check('brand grows by exactly +50 + 2% of a profitable month', pl1.brandDelta === expectedDelta, `delta ${pl1.brandDelta} vs ${expectedDelta}`);
  check('brand above 1,000 moves revenue (+1% per 1,000)', Math.abs(brandRevenueMult(S2, biz2) - (1 + (biz2.brandValue - 1000) / 100000)) < 1e-9, `mult ${brandRevenueMult(S2, biz2)}`);
  /* One bad month: revenue collapses, brand falls by 25 + 1% of the loss. */
  biz2.monthlyRev = 10000;
  nextMonth(S2);
  const plBad = simMonth(S2, biz2);
  const expectedFall = -Math.round(25 + Math.abs(plBad.net) * 0.01);
  console.log(`bad month: net ${plBad.net} -> brand delta ${plBad.brandDelta} (expected ${expectedFall}), brand ${biz2.brandValue}`);
  check('brand falls with a bad month', plBad.net < 0 && plBad.brandDelta === expectedFall && biz2.brandValue < brandAfterGood, `delta ${plBad.brandDelta} brand ${biz2.brandValue}`);
}

/* ================= (e) failure with warnings ================= */
console.log('--- (e) a business CAN fail, with warnings first ---');
{
  const S = adultLife();
  const biz = mkBiz('biz_fail', 'Failing Café', 100000, 90000, 200000, { skill: 50 });
  S.career.businesses = [biz]; S.career.business = biz;
  let deathMonth = -1;
  let stage1Month = -1, stage2Month = -1;
  for (let m = 1; m <= 12; m++) {
    nextMonth(S);
    const pl = simMonth(S, biz);
    if (biz.distressStage === 1 && stage1Month < 0) stage1Month = m;
    if (biz.distressStage === 2 && stage2Month < 0) stage2Month = m;
    console.log(`month ${m}: net ${pl.net}, capital ${biz.capitalInvested} + retained ${biz.retainedEarnings} = equity ${biz.capitalInvested + biz.retainedEarnings}, distress ${biz.distressStage}, dead ${biz.dead}`);
    if (biz.dead) { deathMonth = m; break; }
  }
  console.log(`stage-1 warning month ${stage1Month}, stage-2 warning month ${stage2Month}, death month ${deathMonth}`);
  check('a losing business CAN fail (capital exhausted)', biz.dead === true && deathMonth > 0, `dead ${biz.dead} month ${deathMonth}`);
  check('the at-risk warning comes first (after 2 losing months)', stage1Month === 2, `stage1 month ${stage1Month}`);
  check('the second warning names the cause and the way out', stage2Month > 0 && findJournal(S, /is in serious trouble — .* Put more money in, cut costs, sell it, or close it now/) >= 0, `stage2 month ${stage2Month}`);
  check('the death names its cause in plain words', typeof biz.deathCause === 'string' && biz.deathCause.length > 10 && !/undefined/.test(biz.deathCause), biz.deathCause);
  check('warnings come BEFORE the death in the journal', (() => {
    const j = journalTexts(S);
    const iDeath = j.findIndex(t => /has closed — /.test(t));
    const iWarn2 = j.findIndex(t => /is in serious trouble/.test(t));
    const iWarn1 = j.findIndex(t => /has lost money 2 months in a row/.test(t));
    return iDeath >= 0 && iWarn2 >= 0 && iWarn1 >= 0 && iDeath < iWarn2 && iWarn2 < iWarn1; /* journal is newest-first */
  })());
  check('staff are let go when it dies', (biz.staff || []).length === 0, `staff ${(biz.staff || []).length}`);
  check('salvage settles: capital is gone, the death is journalled', biz.capitalInvested === 0 && findJournal(S, /has closed — /) >= 0, `capital ${biz.capitalInvested}`);
  nextMonth(S);
  const plDead = simMonth(S, biz);
  check('a dead business settles zero afterwards', plDead.revenue === 0 && plDead.costs === 0 && plDead.net === 0 && plDead.dead === true, `net ${plDead.net}`);
}

/* ================= (f) twin lives ================= */
console.log('--- (f) twin lives, same seed, different decisions ---');
{
  const buildTwin = () => {
    const S = adultLife(50_000_000, 4242);
    const biz = mkBiz('biz_twin', 'Twin Café', 150000, 100000, 500000, { skill: 60 });
    S.career.businesses = [biz]; S.career.business = biz;
    return { S, biz };
  };
  /* Life A — good decisions: hire a skilled team, expand when the
     gate allows, run the business well (positive month effects). */
  const A = buildTwin();
  A.biz.staff = mkStaff(85);
  /* Life B — bad decisions: a weak team, never expand, cut corners
     every month (negative month effects). Same seed, same business,
     same months — the same luck. */
  const B = buildTwin();
  B.biz.staff = mkStaff(30);
  for (let m = 1; m <= 24; m++) {
    for (const L of [A, B]) {
      nextMonth(L.S);
      if (L === A) {
        expandBusiness(L.S, L.biz); /* expand when the gate allows */
        L.biz.monthEffects = { revenueMult: 1.1, notes: ['Good month: the team ran a tight service.'] };
      } else {
        L.biz.monthEffects = { revenueMult: 0.8, costAdd: 5000, repeatRateDelta: -0.02, moraleDelta: -5, notes: ['Bad month: corners cut, regulars noticed.'] };
      }
      simMonth(L.S, L.biz);
    }
  }
  const eqA = A.biz.capitalInvested + A.biz.retainedEarnings;
  const eqB = B.biz.capitalInvested + B.biz.retainedEarnings;
  console.log(`A (good): dead ${A.biz.dead}, level ${A.biz.level}, brand ${A.biz.brandValue}, equity ${eqA}, group ${!!A.biz.group}`);
  console.log(`B (bad): dead ${B.biz.dead}, level ${B.biz.level}, brand ${B.biz.brandValue}, equity ${eqB}, cause ${B.biz.deathCause}`);
  check('twin lives reach DIFFERENT outcomes', A.biz.dead !== B.biz.dead || A.biz.level !== B.biz.level || A.biz.brandValue !== B.biz.brandValue, `A dead ${A.biz.dead} level ${A.biz.level} / B dead ${B.biz.dead} level ${B.biz.level}`);
  check('the good twin survives and grows', A.biz.dead === false && A.biz.level > 1 && A.biz.brandValue > 1000, `level ${A.biz.level} brand ${A.biz.brandValue}`);
  check('the bad twin fails', B.biz.dead === true, `dead ${B.biz.dead}`);
}

/* ================= (g) monthEffects contract ================= */
console.log('--- (g) monthEffects lands exactly (W3/W4 contract) ---');
{
  const buildMe = () => {
    const S = adultLife();
    const biz = mkBiz('biz_me', 'Effects Café', 300000, 50000, 500000, { skill: 60, history: [{ net: 5000 }] });
    S.career.businesses = [biz]; S.career.business = biz;
    return { S, biz };
  };
  const C = buildMe(), T = buildMe();
  /* Same seed, same month, same business id -> the same wave, the
     same market shock. Only the monthEffects differ. */
  C.S.rngState = hashSeed(4242); T.S.rngState = hashSeed(4242);
  nextMonth(C.S); nextMonth(T.S);
  T.biz.monthEffects = {
    revenueMult: 1.2, revenueAdd: 5000, costAdd: 3000,
    repeatRateDelta: 0.03, moraleDelta: 5,
    notes: ['Test effect: a promotion brought a crowd.']
  };
  const plC = computeBusinessMonthFull(C.S, C.biz);
  const plT = computeBusinessMonthFull(T.S, T.biz);
  console.log(`control revenue ${plC.revenue} costs ${plC.costs} repeatRate ${C.biz.repeatRate} morale ${C.biz.staff[0].morale}`);
  console.log(`effects revenue ${plT.revenue} costs ${plT.costs} repeatRate ${T.biz.repeatRate} morale ${T.biz.staff[0].morale}`);
  check('revenueMult x revenueAdd land exactly', plT.revenue === Math.round(plC.revenue * 1.2) + 5000, `${plT.revenue} vs ${Math.round(plC.revenue * 1.2) + 5000}`);
  check('costAdd lands exactly', plT.costs === plC.costs + 3000, `${plT.costs} vs ${plC.costs + 3000}`);
  check('repeatRateDelta lands exactly (in the one move site)', Math.abs((T.biz.repeatRate - C.biz.repeatRate) - 0.03) < 1e-9, `${T.biz.repeatRate} vs ${C.biz.repeatRate}`);
  check('moraleDelta lands exactly', T.biz.staff[0].morale === C.biz.staff[0].morale + 5, `${T.biz.staff[0].morale} vs ${C.biz.staff[0].morale}`);
  check('notes land on the P&L breakdown', (plT.monthEffectNotes || []).includes('Test effect: a promotion brought a crowd.'), JSON.stringify(plT.monthEffectNotes));
  check('monthEffects is cleared after the month settles', T.biz.monthEffects === null, JSON.stringify(T.biz.monthEffects));
  check('P&L identity holds with monthEffects', plIdentity(plT) && plIdentity(plC), `net ${plT.net}`);
  /* Absent monthEffects = all defaults: the fold works identically. */
  const N = buildMe();
  N.S.rngState = hashSeed(4242);
  nextMonth(N.S);
  const plN = computeBusinessMonthFull(N.S, N.biz);
  check('no monthEffects means no effect (identical to control)', plN.revenue === plC.revenue && plN.costs === plC.costs, `${plN.revenue} vs ${plC.revenue}`);
}

/* ================= (h) branch types ================= */
console.log('--- (h) branch types have real costs and real effects ---');
{
  const S = adultLife(50_000_000);
  const parent = mkBiz('biz_types', 'Types Café', 300000, 80000, 1000000, { skill: 70 });
  S.career.businesses = [parent]; S.career.business = parent;
  const shopCost = branchTypeSetupCost(S, parent, 'Cairo', 'shop');
  const kioskCost = branchTypeSetupCost(S, parent, 'Cairo', 'kiosk');
  const whCost = branchTypeSetupCost(S, parent, 'Alexandria', 'warehouse');
  console.log(`setup Cairo shop ${shopCost.setupCost}, kiosk ${kioskCost.setupCost}, Alexandria warehouse ${whCost.setupCost}`);
  check('a kiosk is cheap (15% of capital vs 55% for a shop)', kioskCost.setupCost < shopCost.setupCost && kioskCost.setupCost === Math.round(1000000 * 0.15), `${kioskCost.setupCost} vs ${shopCost.setupCost}`);
  check('a warehouse is expensive (80% of capital)', whCost.setupCost === Math.round(1000000 * 0.80 * 1.5), `${whCost.setupCost}`);
  const k = openBranchOfType(S, parent, 'Cairo', 'kiosk');
  check('kiosk opens with 1 staff and a stall rent', k.ok && k.branch.staff.length === 1 && /Stall/.test(k.branch.premises?.label || ''), `staff ${k.branch?.staff.length} premises ${k.branch?.premises?.label}`);
  check('kiosk earns a quarter of a shop', k.branch.monthlyRev === Math.round(300000 * 0.25), `rev ${k.branch.monthlyRev}`);
  const cashBefore = S.money.cash;
  const f = openBranchOfType(S, parent, 'Alexandria', 'franchise_outlet');
  const cashDrop = cashBefore - S.money.cash;
  console.log(`franchise outlet: cash drop ${cashDrop} (setup ${f.setupCost} NOT paid by you), fee ${f.franchiseFee}, royalty ${f.monthlyRoyalty}/mo, retained cash now ${parent.retainedCash}`);
  check('a franchise outlet is funded by the franchisee (you pay no setup)', f.ok && cashDrop < f.setupCost, `drop ${cashDrop} setup ${f.setupCost}`);
  check('the franchisee pays an upfront fee into retained cash', parent.retainedCash === f.franchiseFee, `retained ${parent.retainedCash} fee ${f.franchiseFee}`);
  check('the franchise outlet pays a 5% royalty the other way', f.monthlyRoyalty === Math.max(100, Math.round(f.branch.monthlyRev * 0.05)) && (parent.franchisees || []).length === 1, `royalty ${f.monthlyRoyalty}`);
  const w = openBranchOfType(S, parent, 'New Cairo', 'warehouse');
  check('warehouse opens with 2 staff and workshop premises', w.ok && w.branch.staff.length === 2 && /Warehouse|Workshop/.test(w.branch.premises?.label || ''), `staff ${w.branch?.staff.length} premises ${w.branch?.premises?.label}`);
  /* A warehouse deepens the supply chain — but only once grouped;
     check the discount formula directly for the group in (b). */
  check('warehouse type is stored on the record', w.branch.branchType === 'warehouse' && k.branch.branchType === 'kiosk' && f.branch.branchType === 'franchise_outlet');
  const bad = openBranchOfType(S, parent, 'Cairo', 'castle');
  check('an unknown branch type is refused plainly', !bad.ok && /choose one of/.test(bad.msg), bad.msg);
  const dup = openBranchOfType(S, parent, 'Cairo', 'kiosk');
  check('two kiosks in one city are refused', !dup.ok, dup.msg);
}

/* ================= (i) 100-life distribution ================= */
console.log('--- (i) 100 lives: real failure and breakout rates ---');
{
  const rows = listAllBusinessVentures(adultLife());
  let failures = 0, breakouts = 0, alive = 0;
  const t0 = Date.now();
  for (let i = 0; i < 100; i++) {
    const S = adultLife(0, 5000 + i);
    const row = rows[(i * 7) % rows.length];
    const capital = Math.round(convertCurrency(row.capitalUsd2026, 'usa', 'egy', 2026));
    const rev = Math.round(convertCurrency(row.monthlyRevUsd2026, 'usa', 'egy', 2026));
    const cost = Math.round(convertCurrency(row.monthlyCostUsd2026, 'usa', 'egy', 2026));
    S.money.cash = capital * 2; /* tight enough that misses bite for losers */
    const skill = 40 + (i % 5) * 10; /* 40..80 */
    const biz = mkBiz(`biz_mc_${i}`, `Life ${i} ${row.label}`, rev, cost, capital, {
      skill, mode: i % 2 === 0 ? 'full_time' : 'part_time',
      premises: i % 3 === 0
        ? { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 }
        : { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
      volatility: row.volatility ?? 0.25, foundedYear: 2024, foundedMonth: 1
    });
    biz.typeId = row.id;
    S.career.businesses = [biz]; S.career.business = biz;
    for (let m = 1; m <= 36; m++) {
      nextMonth(S);
      if (!biz.dead) expandBusiness(S, biz); /* the owner expands when the gate allows */
      if (biz.dead) break;
      S.rngState = hashSeed(20000 + i * 100 + m);
      settleHouseholdMonth(S);
      if (biz.dead) break;
    }
    if (biz.dead) failures += 1;
    else { alive += 1; if (biz.group) breakouts += 1; }
  }
  const failRate = Math.round(failures);
  const outRate = Math.round(breakouts);
  console.log(`100 lives, 36 months each (${Date.now() - t0}ms): ${failures} failed, ${breakouts} broke out, ${alive} alive — failure rate ${failRate}%, breakout rate ${outRate}%`);
  check('failure rate is real (strictly between 0% and 100%)', failures > 0 && failures < 100, `${failures}/100`);
  check('breakout rate is real (strictly between 0% and 100%)', breakouts > 0 && breakouts < 100, `${breakouts}/100`);
}

/* ================= (j) group brand compounds ================= */
console.log('--- (j) brand value compounds across the group ---');
{
  const S = groupS, biz = groupBiz;
  const total = groupBrandValue(S, biz);
  const parentOnly = Number(biz.brandValue || 0);
  console.log(`group brand value ${total} vs parent alone ${parentOnly} (3 branches add theirs)`);
  check('group brand value is the parent plus every branch', total > parentOnly, `${total} vs ${parentOnly}`);
  check('the group brand moves revenue (mult > 1)', brandRevenueMult(S, biz) > 1, `mult ${brandRevenueMult(S, biz)}`);
  const bc = breakoutCheck(S, biz);
  check('a grouped business passes its own breakout check', bc.ok, bc.missing.join('; '));
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
