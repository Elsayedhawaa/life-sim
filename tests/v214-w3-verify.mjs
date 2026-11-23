/* v2.14 W3 verify — Per-industry business decisions (§3).
   Run from the game root: node tests/v214-w3-verify.mjs
   Covers the §3 contract only: >=3 distinct decisions per industry
   group; every decision states cost + effect before committing; the
   effect lands in the NEXT month's P&L exactly as promised (measured
   through the coordinator's fold — see foldPl below, the same fold
   documented in businessDecisions.js); critic verdict moves repeat
   customers and revenue; startup stages + funding dilution; cheap
   supplier can cost repeat customers. (v2.17: business reputation
   deleted — repeatRateDelta in repeat-rate units, applied by the
   monthly fold in businessMonthly.js, never by applyDecisionEffects.) */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { computeBusinessMonth, computeBusinessTax } from '../src/systems/businessEngine.js';
import {
  decisionsForBusiness, applyDecision, applyDecisionEffects,
  renderDecisionsHtml, decisionGroupForBusiness, GROUP_TYPE_IDS_2026,
  foldDecisionEffectsIntoPL, startupStageOf
} from '../src/systems/businessDecisions.js';
import { computeBusinessMonthFull } from '../src/systems/businessMonthly.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function adultLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.reputation = 80;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkBiz(typeId, name, rev = 200000, cost = 120000, capital = 500000) {
  return {
    id: `biz_${typeId}`, typeId, name, country: 'egy', city: 'Cairo',
    level: 1, maxLevel: 5, volatility: 0.05,
    monthlyRev: rev, monthlyCost: cost, capitalInvested: capital,
    repeatRate: 0.5, mode: 'full_time',
    staff: [
      { id: 's1', name: 'Aya', role: 'manager', wageLocal: 15000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 },
      { id: 's2', name: 'Omar', role: 'assistant', wageLocal: 9000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 }
    ],
    premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: [], heirId: null, remote: false, foundedYear: 2024, foundedMonth: 1,
    pricingMode: 'balanced', lastPL: null
  };
}
function nextMonth(S) { S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; } }
/* The coordinator's fold, written out here so the test proves the
   documented fold rather than trusting the module's own helper:
   P&L first, then applyDecisionEffects, then fold (revenueMult first,
   then additive deltas, tax recomputed on the folded profit). */
function foldPl(S, basePl, eff) {
  const pl = { ...basePl };
  if (eff.revenueMult != null) pl.revenue = Math.round(pl.revenue * eff.revenueMult);
  pl.revenue += eff.revenueDelta || 0;
  pl.other = Math.max(0, (pl.other || 0) + (eff.costDelta || 0));
  pl.costs = (pl.costs || 0) + (eff.costDelta || 0);
  pl.profit = pl.revenue - pl.costs;
  pl.tax = computeBusinessTax(S, pl.profit).tax;
  pl.net = pl.profit - pl.tax;
  return pl;
}
/* Base P&L with the RNG stream reset, so the folded comparison is
   against the exact same wave the business would have had. */
function basePlSameStream(S, biz) {
  const seed = S.rngState;
  const pl = computeBusinessMonth(S, biz);
  S.rngState = seed;
  return pl;
}

/* ================= (a) >=3 distinct decisions per group ================= */
console.log('--- (a) decisions per industry group ---');
const GROUP_BIZ = {
  food: mkBiz('restaurant', 'Test Restaurant'),
  tech: mkBiz('software_startup', 'Test Startup'),
  retail: mkBiz('retail_shop', 'Test Shop'),
  services: mkBiz('law_firm', 'Test Law Firm'),
  property: mkBiz('logistics', 'Test Logistics')
};
const counts = {};
for (const [group, biz] of Object.entries(GROUP_BIZ)) {
  const S = adultLife();
  const list = decisionsForBusiness(S, biz);
  counts[group] = list.map(d => d.id);
  console.log(`${group}: ${list.length} decisions [${counts[group].join(', ')}]`);
  check(`${group} has >= 3 distinct decisions`, list.length >= 3 && new Set(list.map(d => d.id)).size === list.length, `got ${list.length}`);
  check(`${group} resolves to its own group`, decisionGroupForBusiness(biz) === group, decisionGroupForBusiness(biz));
}
console.log('GROUP_TYPE_IDS_2026 counts:', Object.fromEntries(Object.entries(GROUP_TYPE_IDS_2026).map(([g, ids]) => [g, ids.length])), '| total types:', Object.values(GROUP_TYPE_IDS_2026).flat().length);
check('group type lists cover all 52 era-open types', Object.values(GROUP_TYPE_IDS_2026).flat().length === 52);
check('cold_logistics is in the property group, not food', GROUP_TYPE_IDS_2026.property.includes('cold_logistics') && !GROUP_TYPE_IDS_2026.food.includes('cold_logistics'));
check('clinic is in the services group', GROUP_TYPE_IDS_2026.services.includes('clinic'));
check('pharmacy is in the services group (health mapping)', GROUP_TYPE_IDS_2026.services.includes('pharmacy'));
check('salon lands in retail per the engine mapping (barbershop contains "shop")', GROUP_TYPE_IDS_2026.retail.includes('salon'));

/* ================= (b) cost + effect stated before committing ================= */
console.log('--- (b) cost + effect stated before committing ---');
{
  let total = 0, bad = [];
  for (const [group, biz] of Object.entries(GROUP_BIZ)) {
    const S = adultLife();
    for (const d of decisionsForBusiness(S, biz)) {
      total += 1;
      if (typeof d.cost !== 'number' || Number.isNaN(d.cost)) bad.push(`${d.id}: cost not numeric`);
      if (!d.effectText || typeof d.effectText !== 'string' || d.effectText.trim().length < 10) bad.push(`${d.id}: effectText empty`);
      if (!d.label) bad.push(`${d.id}: label empty`);
      if (typeof d.available !== 'boolean') bad.push(`${d.id}: available not boolean`);
      if (!d.available && !d.lockReason) bad.push(`${d.id}: unavailable with no reason`);
    }
  }
  console.log(`checked ${total} decision entries across 5 groups`);
  check('every decision entry has a numeric cost + non-empty effectText', bad.length === 0, bad.join(' | '));
  /* Wrong-group decision refused plainly. */
  const S = adultLife();
  const r = applyDecision(S, GROUP_BIZ.food, 'tech_paid_acquisition');
  check('a tech decision on a restaurant is refused plainly', !r.ok && /does not fit/.test(r.msg), r.msg);
  /* Unavailable decision states why. */
  const S2 = adultLife();
  const list2 = decisionsForBusiness(S2, GROUP_BIZ.tech);
  const fundingSeed = list2.find(d => d.id === 'tech_funding_seed');
  check('seed round locked before MVP, with a plain reason', fundingSeed && !fundingSeed.available && /MVP/.test(fundingSeed.lockReason), fundingSeed ? fundingSeed.lockReason : 'missing');
}

/* ================= (c) effect lands next month AS PROMISED ================= */
console.log('--- (c) effect lands in next month P&L as promised ---');
function promisedLanding(group, bizType, bizName, decisionId, opts = {}) {
  const S = adultLife();
  const biz = mkBiz(bizType, bizName);
  S.career.businesses = [biz]; S.career.business = biz;
  const applied = applyDecision(S, biz, decisionId, opts);
  if (!applied.ok) return { S, biz, applied, ok: false };
  const promised = applied.promisedNumbers || {};
  const cashAfterApply = S.money.cash;
  nextMonth(S);
  const base = basePlSameStream(S, biz);
  const eff = applyDecisionEffects(S, biz);
  const folded = foldPl(S, base, eff);
  /* The module's own fold helper must agree with the hand-written fold
     on the SAME base P&L and the SAME effect object. */
  const foldedH = foldDecisionEffectsIntoPL(S, { ...base }, { ...eff });
  /* Idempotency: a second call in the same month returns zeros. */
  const eff2 = applyDecisionEffects(S, biz);
  return { S, biz, applied, promised, eff, base, folded, foldedH, eff2, cashAfterApply, ok: true };
}
{
  const cases = [
    ['food', 'restaurant', 'Promised Restaurant', 'food_refresh_menu', 24000, 0],
    ['tech', 'software_startup', 'Promised Startup', 'tech_paid_acquisition', 24000, 0],
    ['retail', 'retail_shop', 'Promised Shop', 'retail_buy_stock', 24000, 0],
    ['services', 'law_firm', 'Promised Law Firm', 'svc_hire_star', 30000, 0],
    ['property', 'logistics', 'Promised Logistics', 'prop_buy_vehicle', 24000, 3600]
  ];
  for (const [group, type, name, id, expRev, expCost] of cases) {
    const t = promisedLanding(group, type, name, id);
    const eff2Zero = t.eff2.revenueDelta === 0 && t.eff2.costDelta === 0 && t.eff2.repeatRateDelta === 0;
    console.log(`${group} ${id}: promised rev ${t.promised.revenueDelta} cost ${t.promised.costDelta} | actual eff rev ${t.eff.revenueDelta} cost ${t.eff.costDelta} | base rev ${t.base.revenue} -> folded rev ${t.folded.revenue}`);
    check(`${group}: apply ok + cost charged`, t.applied.ok && t.cashAfterApply < 5_000_000, t.applied.msg);
    check(`${group}: effect revenueDelta matches promised exactly`, t.eff.revenueDelta === expRev && t.eff.revenueDelta === t.promised.revenueDelta, `promised ${t.promised.revenueDelta} vs actual ${t.eff.revenueDelta}`);
    check(`${group}: effect costDelta matches promised exactly`, t.eff.costDelta === expCost && t.eff.costDelta === t.promised.costDelta, `promised ${t.promised.costDelta} vs actual ${t.eff.costDelta}`);
    check(`${group}: folded P&L revenue = base + promised`, t.folded.revenue === t.base.revenue + expRev, `${t.folded.revenue} vs ${t.base.revenue} + ${expRev}`);
    check(`${group}: folded P&L costs = base + promised`, t.folded.costs === t.base.costs + expCost, `${t.folded.costs} vs ${t.base.costs} + ${expCost}`);
    check(`${group}: folded net identity holds (net = revenue - costs - tax)`, t.folded.net === t.folded.revenue - t.folded.costs - t.folded.tax);
    check(`${group}: module fold helper agrees with the hand-written fold`, t.foldedH.revenue === t.folded.revenue && t.foldedH.costs === t.folded.costs && t.foldedH.net === t.folded.net, `helper ${t.foldedH.revenue}/${t.foldedH.costs}/${t.foldedH.net} vs ${t.folded.revenue}/${t.folded.costs}/${t.folded.net}`);
    check(`${group}: effect applies once per month (second call returns zeros)`, eff2Zero, JSON.stringify(t.eff2));
  }
  /* Repeat customers from a slice land too (refresh menu +3%): the delta
     is RETURNED here — applyDecisionEffects never writes the business
     record; the monthly fold applies it (proved in §(g) below). */
  const t = promisedLanding('food', 'restaurant', 'Rep Restaurant', 'food_refresh_menu');
  check('food refresh menu: repeatRateDelta +0.03 returned with the effect', t.eff.repeatRateDelta === 0.03 && t.promised.repeatRateDelta === 0.03, `delta ${t.eff.repeatRateDelta} promised ${t.promised.repeatRateDelta}`);
  check('food refresh menu: applyDecisionEffects alone does not move repeatRate (fold owns it)', t.biz.repeatRate === 0.5, `rate=${t.biz.repeatRate}`);
}

/* ================= (d) critic verdict moves repeat customers + revenue ================= */
console.log('--- (d) critic verdict =================');
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Verdict Restaurant');
  S.career.businesses = [biz]; S.career.business = biz;
  const rateBefore = biz.repeatRate;
  const a = applyDecision(S, biz, 'food_invite_critic', { force: 'rave' });
  check('critic booked', a.ok, a.msg);
  nextMonth(S);
  const eff = applyDecisionEffects(S, biz);
  console.log(`critic RAVE: repeatRateDelta ${eff.repeatRateDelta}, revenueDelta ${eff.revenueDelta} (rate stays ${biz.repeatRate} until the fold)`);
  check('rave: repeatRateDelta +0.10', eff.repeatRateDelta === 0.1 && biz.repeatRate === rateBefore);
  check('rave: revenue +25% of monthlyRev', eff.revenueDelta === 50000, `got ${eff.revenueDelta}`);
  check('rave: verdict text stored on the business and readable', !!biz.lastCriticVerdict && /Rave review/.test(biz.lastCriticVerdict.text), biz.lastCriticVerdict ? biz.lastCriticVerdict.text : 'none');
  /* Pan, on a second business. */
  const S2 = adultLife();
  const biz2 = mkBiz('cafe', 'Panned Café');
  S2.career.businesses = [biz2]; S2.career.business = biz2;
  applyDecision(S2, biz2, 'food_invite_critic', { force: 'pan' });
  nextMonth(S2);
  const eff2 = applyDecisionEffects(S2, biz2);
  console.log(`critic PAN: repeatRateDelta ${eff2.repeatRateDelta}, revenueDelta ${eff2.revenueDelta}`);
  check('pan: repeatRateDelta -0.08', eff2.repeatRateDelta === -0.08 && biz2.repeatRate === 0.5);
  check('pan: revenue -12% of monthlyRev', eff2.revenueDelta === -24000, `got ${eff2.revenueDelta}`);
  check('pan: verdict text stored', !!biz2.lastCriticVerdict && /Pan\./.test(biz2.lastCriticVerdict.text));
  /* Competition win, for the record. */
  const S3 = adultLife();
  const biz3 = mkBiz('bakery', 'Competing Bakery');
  applyDecision(S3, biz3, 'food_enter_competition', { force: 'win' });
  nextMonth(S3);
  const eff3 = applyDecisionEffects(S3, biz3);
  console.log(`competition WIN: repeatRateDelta ${eff3.repeatRateDelta}, revenueDelta ${eff3.revenueDelta}`);
  check('competition win: repeatRateDelta +0.12, revenue +30%', eff3.repeatRateDelta === 0.12 && eff3.revenueDelta === 60000, `${eff3.repeatRateDelta} / ${eff3.revenueDelta}`);
  check('competition result stored', !!biz3.lastCompetitionResult && /WINNERS/.test(biz3.lastCompetitionResult.text));
}

/* ================= (e) startup stages + funding dilution ================= */
console.log('--- (e) startup stages + funding ---');
{
  const S = adultLife();
  const biz = mkBiz('software_startup', 'Stage Startup');
  S.career.businesses = [biz]; S.career.business = biz;
  check('startup starts at Concept', startupStageOf(biz) === 'concept');
  const cash0 = S.money.cash;
  const a1 = applyDecision(S, biz, 'tech_advance_stage');
  console.log(`Concept -> MVP: cost ${5000000 - S.money.cash}, stage ${startupStageOf(biz)}`);
  check('Concept -> MVP ok, real cost charged (15% of capital = 75000)', a1.ok && startupStageOf(biz) === 'mvp' && S.money.cash === cash0 - 75000, a1.msg);
  /* Pre-launch revenue is near-zero the next month. */
  nextMonth(S);
  const base = basePlSameStream(S, biz);
  const eff = applyDecisionEffects(S, biz);
  const folded = foldPl(S, base, eff);
  console.log(`pre-launch month: base revenue ${base.revenue}, revenueMult ${eff.revenueMult}, folded revenue ${folded.revenue} (monthlyRev ${biz.monthlyRev})`);
  check('pre-launch: revenueMult is 0.08', eff.revenueMult === 0.08, `got ${eff.revenueMult}`);
  check('pre-launch: folded revenue is near-zero (< 15% of monthlyRev)', folded.revenue < biz.monthlyRev * 0.15, `folded ${folded.revenue} vs monthlyRev ${biz.monthlyRev}`);
  /* MVP -> Beta -> Launch (hit). */
  nextMonth(S);
  const a2 = applyDecision(S, biz, 'tech_advance_stage');
  check('MVP -> Beta ok, cost 20% of capital = 100000', a2.ok && startupStageOf(biz) === 'beta' && S.money.cash === cash0 - 75000 - 100000, a2.msg);
  nextMonth(S);
  const a3 = applyDecision(S, biz, 'tech_advance_stage', { force: 'hit' });
  check('Beta -> Launch ok, cost 30% of capital = 150000', a3.ok && startupStageOf(biz) === 'launched' && S.money.cash === cash0 - 75000 - 100000 - 150000, a3.msg);
  check('launch outcome recorded as hit', biz.launchOutcome === 'hit');
  nextMonth(S);
  const baseL = basePlSameStream(S, biz);
  const effL = applyDecisionEffects(S, biz);
  const foldedL = foldPl(S, baseL, effL);
  console.log(`launch month: revenueMult ${effL.revenueMult}, revenueDelta ${effL.revenueDelta}, base revenue ${baseL.revenue} -> folded ${foldedL.revenue}`);
  check('after Launch: no revenue cap', effL.revenueMult === null || effL.revenueMult === undefined, `got ${effL.revenueMult}`);
  check('after Launch (hit): revenue is real (folded > 50% of monthlyRev)', foldedL.revenue > biz.monthlyRev * 0.5, `folded ${foldedL.revenue}`);
  check('after Launch (hit): +20% launch revenue lands', effL.revenueDelta === 40000, `got ${effL.revenueDelta}`);
  check('advance_stage locked after launch', decisionsForBusiness(S, biz).find(d => d.id === 'tech_advance_stage').available === false);
  /* Funding round: Seed dilutes and brings cash in. */
  const cashBeforeFunding = S.money.cash;
  const eqBefore = biz.equityOwned;
  const f = applyDecision(S, biz, 'tech_funding_seed');
  const raise = 500000, fee = 10000;
  console.log(`Seed round: equity ${eqBefore}% -> ${biz.equityOwned}%, cash ${cashBeforeFunding} -> ${S.money.cash} (raise ${raise}, fee ${fee})`);
  check('seed round ok', f.ok, f.msg);
  check('seed dilutes equityOwned 100 -> 85', biz.equityOwned === 85, `got ${biz.equityOwned}`);
  check('seed brings cash in net of legal fee', S.money.cash === cashBeforeFunding + raise - fee, `${cashBeforeFunding} -> ${S.money.cash}`);
  check('seed cannot be raised twice', applyDecision(S, biz, 'tech_funding_seed').ok === false);
  check('funding cash-in has its own ledger line', S.ledger.some(l => l.label && l.label.includes('Seed round investment in')));
  /* Flop path, on a second startup. */
  const Sf = adultLife();
  const bizF = mkBiz('saas_ai_agency', 'Flop Startup');
  Sf.career.businesses = [bizF]; Sf.career.business = bizF;
  applyDecision(Sf, bizF, 'tech_advance_stage'); nextMonth(Sf);
  applyDecision(Sf, bizF, 'tech_advance_stage'); nextMonth(Sf);
  const af = applyDecision(Sf, bizF, 'tech_advance_stage', { force: 'flop' });
  check('flop launch recorded', af.ok && bizF.launchOutcome === 'flopped', af.msg);
  nextMonth(Sf);
  const effF = applyDecisionEffects(Sf, bizF);
  const baseF = basePlSameStream(Sf, bizF);
  const foldedF = foldPl(Sf, baseF, effF);
  console.log(`flop month: revenueMult ${effF.revenueMult}, repeatRateDelta ${effF.repeatRateDelta}, folded revenue ${foldedF.revenue}`);
  check('flop: revenue x0.35 for 6 months', effF.revenueMult === 0.35, `got ${effF.revenueMult}`);
  check('flop: repeatRateDelta -0.10', effF.repeatRateDelta === -0.1, `delta ${effF.repeatRateDelta}`);
  /* Co-founder + disagreement. */
  const Sc = adultLife();
  const bizC = mkBiz('software_studio', 'Cofounder Studio');
  Sc.career.businesses = [bizC]; Sc.career.business = bizC;
  const cf = applyDecision(Sc, bizC, 'tech_add_cofounder');
  check('co-founder joins with 20% equity', cf.ok && !!bizC.cofounder && bizC.cofounder.name && bizC.equityOwned === 80, cf.msg);
  console.log(`co-founder: ${bizC.cofounder.name}, equityOwned ${bizC.equityOwned}%`);
  const ov = applyDecision(Sc, bizC, 'tech_disagree_overrule', { force: 'quits' });
  check('overrule recorded', ov.ok, ov.msg);
  nextMonth(Sc);
  const effC = applyDecisionEffects(Sc, bizC);
  console.log(`co-founder quit: repeatRateDelta ${effC.repeatRateDelta}, co-founder now ${bizC.cofounder ? bizC.cofounder.name : 'gone'}`);
  check('overruled co-founder quits: repeatRateDelta -0.05, co-founder gone', effC.repeatRateDelta === -0.05 && bizC.cofounder === null, `delta ${effC.repeatRateDelta}`);
  check('quit outcome stored in words', !!bizC.lastCofounderOutcome && /quit/.test(bizC.lastCofounderOutcome.text));
}

/* ================= (f) cheap supplier can cost repeat customers ================= */
console.log('--- (f) cheap supplier =================');
{
  const S = adultLife();
  const biz = mkBiz('retail_shop', 'Cheap Supplier Shop');
  S.career.businesses = [biz]; S.career.business = biz;
  const rateBefore = biz.repeatRate;
  const a = applyDecision(S, biz, 'retail_supplier_cheap', { force: 'bad' });
  check('cheap supplier switch ok', a.ok, a.msg);
  nextMonth(S);
  const eff = applyDecisionEffects(S, biz);
  console.log(`cheap supplier BAD batch: repeatRateDelta ${eff.repeatRateDelta}, revenueDelta ${eff.revenueDelta}, costDelta ${eff.costDelta} (rate stays ${biz.repeatRate} until the fold)`);
  check('bad batch: repeatRateDelta -0.10', eff.repeatRateDelta === -0.1 && biz.repeatRate === rateBefore);
  check('bad batch: revenue -8% of monthlyRev', eff.revenueDelta === -16000, `got ${eff.revenueDelta}`);
  check('cheap supplier still saves 15% of costs that month', eff.costDelta === -18000, `got ${eff.costDelta}`);
  check('supplier outcome stored in words', !!biz.lastSupplierOutcome && biz.lastSupplierOutcome.bad === true && /BAD/.test(biz.lastSupplierOutcome.text));
  /* Fine batch: no repeat-customer cost. */
  const S2 = adultLife();
  const biz2 = mkBiz('bookstore', 'Fine Batch Bookstore');
  applyDecision(S2, biz2, 'retail_supplier_cheap', { force: 'fine' });
  nextMonth(S2);
  const eff2 = applyDecisionEffects(S2, biz2);
  check('fine batch: repeatRateDelta 0, rate untouched', eff2.repeatRateDelta === 0 && biz2.repeatRate === 0.5, `delta ${eff2.repeatRateDelta}`);
  check('fine batch: cost saving still lands', eff2.costDelta === -18000, `got ${eff2.costDelta}`);
  /* Big client leaves at term end (services risk), contract fails (property risk). */
  const S3 = adultLife();
  const biz3 = mkBiz('law_firm', 'Big Client Firm');
  applyDecision(S3, biz3, 'svc_big_client', { force: 'leaves' });
  for (let i = 0; i < 6; i++) { nextMonth(S3); applyDecisionEffects(S3, biz3); }
  const eff3 = applyDecisionEffects(S3, biz3);
  console.log(`big client leaves at term end: revenueDelta ${eff3.revenueDelta}, repeatRateDelta ${eff3.repeatRateDelta}`);
  check('big client leaves: -15% revenue slice starts, repeatRateDelta -0.04', eff3.revenueDelta === -30000 && eff3.repeatRateDelta === -0.04, `${eff3.revenueDelta} / ${eff3.repeatRateDelta}`);
  const S4 = adultLife();
  const biz4 = mkBiz('logistics', 'Failing Logistics');
  biz4.staff = []; /* short-staffed: cannot deliver */
  const c4 = applyDecision(S4, biz4, 'prop_take_contract', { force: 'fail' });
  check('contract taken', c4.ok, c4.msg);
  nextMonth(S4);
  const eff4 = applyDecisionEffects(S4, biz4);
  console.log(`contract fail: costDelta (penalty) ${eff4.costDelta}, repeatRateDelta ${eff4.repeatRateDelta}, contract now ${biz4.activeContract ? 'alive' : 'ended'}`);
  check('contract failure: penalty charged as a real cost (+30% monthlyRev)', eff4.costDelta === 60000, `got ${eff4.costDelta}`);
  check('contract failure: repeatRateDelta -0.06 and contract ends', eff4.repeatRateDelta === -0.06 && biz4.activeContract === null);
}

/* ================= render ================= */
console.log('--- render ---');
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Render Restaurant');
  const html = renderDecisionsHtml(S, biz);
  const text = strip(html);
  check('render shows decision labels + costs + effects', text.includes('Refresh the menu') && text.includes('Invite a food critic') && /Costs/.test(text));
  check('render has biz-decision buttons', html.includes('data-action="biz-decision"') && html.includes('data-decision="food_invite_critic"'));
  check('render states the group', text.includes('Food & Hospitality'));
  const S2 = adultLife();
  const biz2 = mkBiz('software_startup', 'Render Startup');
  const html2 = strip(renderDecisionsHtml(S2, biz2));
  check('tech render shows stages + funding', html2.includes('Build the MVP') && html2.includes('Pre-Seed'));
}

/* ================= (g) v2.17: repeat rate moves ONLY in the monthly fold ================= */
console.log('--- (g) repeat rate moves only in the monthly fold ---');
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Fold Restaurant');
  // staff skill 60 -> (0.60-0.50)*0.04 = +0.004; the month is profitable
  // (revenue ~200k vs ~152k costs) -> +0.01; no decision lands -> +0.014.
  const pl1 = computeBusinessMonthFull(S, biz);
  console.log(`fold month 1: net ${pl1.net}, repeatRate ${biz.repeatRate} (pl.repeatRate ${pl1.repeatRate})`);
  check('monthly fold moves repeatRate from staff quality + a profitable month', Math.abs(biz.repeatRate - 0.514) < 1e-9, `got ${biz.repeatRate}`);
  check('folded P&L carries the repeat rate', pl1.repeatRate === biz.repeatRate, `pl ${pl1.repeatRate}`);
  const again = computeBusinessMonthFull(S, biz);
  check('second fold call in the same month does not move it twice', biz.repeatRate === pl1.repeatRate, `got ${biz.repeatRate}`);
  // A decision's repeat-rate delta lands through the fold, not on its own.
  const S2 = adultLife();
  const biz2 = mkBiz('restaurant', 'Fold Decision Restaurant');
  const a = applyDecision(S2, biz2, 'food_refresh_menu');
  check('refresh menu applied', a.ok, a.msg);
  nextMonth(S2);
  const pl2 = computeBusinessMonthFull(S2, biz2);
  // +0.03 (menu slice) + 0.004 (staff) + 0.01 (profitable month) = +0.044.
  console.log(`fold with menu decision: net ${pl2.net}, repeatRate ${biz2.repeatRate}`);
  check('decision repeatRateDelta lands through the monthly fold', Math.abs(biz2.repeatRate - 0.544) < 1e-9, `got ${biz2.repeatRate}`);
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
