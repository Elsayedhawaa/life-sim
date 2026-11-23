/* v2.20 I2 verify — per-type decisions, fruit stall, tech trap, equity,
   cost base, label collisions, premium/value exclusion.
   Run from the game root: node tests/v220-i2-verify.mjs */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import {
  computeBusinessMonth, computeBusinessTax, listAllBusinessVentures,
  businessOpInfo, runBusinessOp, businessValuation, sellBusiness
} from '../src/systems/businessEngine.js';
import {
  decisionsForBusiness, applyDecision, applyDecisionEffects,
  decisionGroupForBusiness, decisionIdsForBusiness, TYPE_OVERRIDES,
  STAR_ROLE_BY_TYPE, PRE_REVENUE_STARTUP_TYPES, renderDecisionsHtml,
  decisionDef
} from '../src/systems/businessDecisions.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};

function adultLife(year = 2026) {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = year; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkBiz(typeId, name, rev = 200000, cost = 120000, capital = 500000) {
  return {
    id: `biz_${typeId}_${Math.random().toString(36).slice(2, 8)}`, typeId, name, country: 'egy', city: 'Cairo',
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
const ids = (S, biz) => decisionsForBusiness(S, biz).map(d => d.id);
const labels = (S, biz) => decisionsForBusiness(S, biz).map(d => d.label);
const has = (S, biz, id) => ids(S, biz).includes(id);
const hasLabel = (S, biz, label) => labels(S, biz).includes(label);

/* All 55 venture types (union across eras). */
function allTypes() {
  const map = new Map();
  for (const y of [1970, 1985, 2000, 2010, 2026]) {
    const S = adultLife(y);
    for (const r of listAllBusinessVentures(S)) if (!map.has(r.id)) map.set(r.id, r);
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}
const TYPES = allTypes();
console.log(`venture types counted: ${TYPES.length} (expect 55)`);
check('55 venture types', TYPES.length === 55, `got ${TYPES.length}`);

/* ================= (a) fruit stall: exactly the 8 ================= */
console.log('--- (a) fruit stall ---');
{
  const S = adultLife();
  /* Elsayed's stall, with the collapsed monthlyCost (100) his paste had. */
  const biz = mkBiz('fruit_stall', 'Radwan Fruit', 20900, 100, 47500);
  biz.staff = [
    { id: 's1', name: 'Boy', role: 'assistant', wageLocal: 5000, morale: 70, skill: 50, hiredYear: 2022, hiredMonth: 1 },
    { id: 's2', name: 'Aya', role: 'assistant', wageLocal: 4000, morale: 70, skill: 50, hiredYear: 2022, hiredMonth: 1 }
  ];
  const got = ids(S, biz);
  const want = ['fruit_morning_wholesale', 'fruit_seasonal', 'fruit_better_corner', 'fruit_spoilage', 'fruit_regulars_box', 'fruit_price_board', 'fruit_bicycle_delivery', 'food_train_staff'];
  console.log('fruit stall decisions:', got.join(', '));
  check('fruit stall decision set is exactly the 8', JSON.stringify(got) === JSON.stringify(want), `got ${got.join(',')}`);
  const text = JSON.stringify(decisionsForBusiness(S, biz)).toLowerCase();
  for (const banned of ['menu', 'signature dish', 'critic', 'cooking competition', 'catering']) {
    check(`fruit stall: no "${banned}" anywhere`, !text.includes(banned), text.slice(0, 200));
  }
  check('fruit stall: no food_refresh_menu', !has(S, biz, 'food_refresh_menu'));
  check('fruit stall: no food_signature_dish', !has(S, biz, 'food_signature_dish'));
  check('fruit stall: no food_invite_critic', !has(S, biz, 'food_invite_critic'));
  check('fruit stall: no food_enter_competition', !has(S, biz, 'food_enter_competition'));
  check('fruit stall: no food_launch_catering', !has(S, biz, 'food_launch_catering'));
  check('fruit stall: no food_launch_delivery (bicycle replaces it)', !has(S, biz, 'food_launch_delivery'));
  check('fruit stall: train staff renamed "Teach the boy the trade"', hasLabel(S, biz, 'Teach the boy the trade'));
  /* Exact costs at the W2 anchor (rev 20,900). */
  const costOf = (id) => decisionsForBusiness(S, biz).find(d => d.id === id).cost;
  console.log(`fruit costs: wholesale ${costOf('fruit_morning_wholesale')}, seasonal ${costOf('fruit_seasonal')}, corner ${costOf('fruit_better_corner')}, spoilage ${costOf('fruit_spoilage')}, box ${costOf('fruit_regulars_box')}, board ${costOf('fruit_price_board')}, bicycle ${costOf('fruit_bicycle_delivery')}, teach ${costOf('food_train_staff')}`);
  check('fruit costs exact at anchor', costOf('fruit_morning_wholesale') === 2500 && costOf('fruit_seasonal') === 1800 && costOf('fruit_better_corner') === 4000 && costOf('fruit_spoilage') === 1500 && costOf('fruit_regulars_box') === 1000 && costOf('fruit_price_board') === 500 && costOf('fruit_bicycle_delivery') === 1800, '');
  check('teach the boy costs 50% of the wage bill (9,000 -> 4,500)', costOf('food_train_staff') === 4500, `got ${costOf('food_train_staff')}`);
  /* Effects land next month, at the promised scale (monthlyCost is 100 — the old collapse). */
  const cases = [
    ['fruit_morning_wholesale', 2508, 0], ['fruit_seasonal', 3135, 0],
    ['fruit_better_corner', 3135, 0], ['fruit_spoilage', 0, -1097],
    ['fruit_regulars_box', 1672, 0], ['fruit_price_board', 1045, 0],
    ['fruit_bicycle_delivery', 2090, 366]
  ];
  for (const [id, expRev, expCost] of cases) {
    const S2 = adultLife();
    const b2 = mkBiz('fruit_stall', 'Radwan Fruit', 20900, 100, 47500);
    const r = applyDecision(S2, b2, id);
    check(`${id} applies`, r.ok, r.msg || '');
    nextMonth(S2);
    const eff = applyDecisionEffects(S2, b2);
    console.log(`${id}: revenueDelta ${eff.revenueDelta} (expect ${expRev}), costDelta ${eff.costDelta} (expect ${expCost})`);
    check(`${id}: next-month effect lands as promised`, eff.revenueDelta === expRev && eff.costDelta === expCost, `got ${eff.revenueDelta}/${eff.costDelta}`);
  }
  /* Price board: repeat +4% is persistent on the business. */
  const S3 = adultLife();
  const b3 = mkBiz('fruit_stall', 'Radwan Fruit', 20900, 100, 47500);
  applyDecision(S3, b3, 'fruit_price_board');
  check('price board: repeatRate 0.50 -> 0.54 persistently', b3.repeatRate === 0.54, `got ${b3.repeatRate}`);
  nextMonth(S3);
  applyDecisionEffects(S3, b3);
  check('price board: repeatRate still 0.54 after a month', b3.repeatRate === 0.54, `got ${b3.repeatRate}`);
}

/* ================= (b) whole-class audit: all 55 types ================= */
console.log('--- (b) whole-class audit (55 types) ---');
{
  const S = adultLife(2000); /* 2000 keeps the era-gated types open too */
  const S26 = adultLife(2026);
  for (const t of TYPES) {
    const Sx = (t.id === 'radio_repair' || t.id === 'video_rental' || t.id === 'cyber_cafe') ? S : S26;
    const biz = mkBiz(t.id, t.label, Math.max(2000, (t.monthlyRevUsd2026 || 2000) * 50), 100, 500000);
    const list = decisionsForBusiness(Sx, biz);
    console.log(`${t.id} [${decisionGroupForBusiness(biz)}]: ${list.map(d => d.label).join(' | ')}`);
    check(`${t.id}: has decisions (>=3)`, list.length >= 3, `got ${list.length}`);
  }
  const bizFor = (typeId, year = 2026) => {
    const Sx = adultLife(year);
    const row = TYPES.find(t => t.id === typeId);
    return { S: Sx, biz: mkBiz(typeId, row.label, 200000, 100, 500000) };
  };
  /* bakery: REPLACE 3, REMOVE critic. */
  {
    const { S, biz } = bizFor('bakery');
    check('bakery: critic removed', !has(S, biz, 'food_invite_critic'));
    check('bakery: "Refresh the counter — new bakes"', hasLabel(S, biz, 'Refresh the counter — new bakes'));
    check('bakery: "Create a signature loaf"', hasLabel(S, biz, 'Create a signature loaf'));
    check('bakery: "Enter a baking competition"', hasLabel(S, biz, 'Enter a baking competition'));
    check('bakery: no "Refresh the menu"', !hasLabel(S, biz, 'Refresh the menu'));
  }
  /* roastery: REPLACE 4. */
  {
    const { S, biz } = bizFor('roastery_chain');
    check('roastery: "Create a signature roast"', hasLabel(S, biz, 'Create a signature roast'));
    check('roastery: "Invite a coffee reviewer"', hasLabel(S, biz, 'Invite a coffee reviewer'));
    check('roastery: "Enter a barista competition"', hasLabel(S, biz, 'Enter a barista competition'));
    check('roastery: "Supply offices and cafés wholesale"', hasLabel(S, biz, 'Supply offices and cafés wholesale'));
    check('roastery: no signature dish / food critic / cooking competition / catering', !hasLabel(S, biz, 'Create a signature dish') && !hasLabel(S, biz, 'Invite a food critic') && !hasLabel(S, biz, 'Enter a cooking competition') && !hasLabel(S, biz, 'Launch catering'));
  }
  /* software_studio: REMOVE 5, consultancy decisions in. */
  {
    const { S, biz } = bizFor('software_studio');
    for (const id of ['tech_advance_stage', 'tech_funding_preseed', 'tech_funding_seed', 'tech_funding_series_a', 'tech_funding_series_b']) {
      check(`software_studio: no ${id}`, !has(S, biz, id));
    }
    check('software_studio: "Win a retainer client"', has(S, biz, 'consult_win_retainer'));
    check('software_studio: "Hire a senior developer"', has(S, biz, 'consult_hire_senior'));
  }
  /* ecommerce + mobile_shop: REMOVE 7, retail set in. */
  for (const typeId of ['ecommerce', 'mobile_shop']) {
    const { S, biz } = bizFor(typeId);
    for (const id of ['tech_advance_stage', 'tech_funding_preseed', 'tech_funding_seed', 'tech_funding_series_a', 'tech_funding_series_b', 'tech_disagree_side', 'tech_disagree_overrule']) {
      check(`${typeId}: no ${id}`, !has(S, biz, id));
    }
    for (const id of ['retail_buy_stock', 'retail_supplier_cheap', 'retail_supplier_reliable', 'retail_run_sale', 'retail_appraise_rare', 'retail_sell_dead_stock']) {
      check(`${typeId}: has retail ${id}`, has(S, biz, id));
    }
  }
  /* retail replacements. */
  {
    const { S, biz } = bizFor('textile_workshop');
    check('textile: "Buy a rare fabric lot"', hasLabel(S, biz, 'Buy a rare fabric lot'));
    check('textile: no "Appraise and buy a rare item"', !hasLabel(S, biz, 'Appraise and buy a rare item'));
  }
  {
    const { S, biz } = bizFor('print_shop');
    check('print_shop: "Take a big corporate print run"', has(S, biz, 'print_big_contract'));
    check('print_shop: no appraise_rare', !has(S, biz, 'retail_appraise_rare'));
  }
  {
    const { S, biz } = bizFor('salon');
    check('salon: "Stock products & consumables"', hasLabel(S, biz, 'Stock products & consumables'));
    check('salon: bridal package replaces rare item', has(S, biz, 'salon_premium_package') && !has(S, biz, 'retail_appraise_rare'));
    check('salon: "Clear slow treatments — off-peak discount"', hasLabel(S, biz, 'Clear slow treatments — off-peak discount'));
  }
  {
    const { S, biz } = bizFor('video_rental', 2000);
    check('video_rental: "Switch tape distributor"', hasLabel(S, biz, 'Switch tape distributor'));
    check('video_rental: "Rare VHS — collectors\' tape"', hasLabel(S, biz, "Rare VHS — collectors' tape"));
    check('video_rental: "Late-fee amnesty week"', hasLabel(S, biz, 'Late-fee amnesty week'));
  }
  {
    const { S, biz } = bizFor('cyber_cafe', 2000);
    check('cyber_cafe: "Upgrade PCs — add consoles"', hasLabel(S, biz, 'Upgrade PCs — add consoles'));
    check('cyber_cafe: "Cheaper, faster internet line"', hasLabel(S, biz, 'Cheaper, faster internet line'));
    check('cyber_cafe: gaming night replaces rare item', has(S, biz, 'cyber_gaming_night') && !has(S, biz, 'retail_appraise_rare'));
    check('cyber_cafe: "Off-peak happy hours"', hasLabel(S, biz, 'Off-peak happy hours'));
    check('cyber_cafe: sale renamed "Happy-hour pricing"', hasLabel(S, biz, 'Happy-hour pricing') && !hasLabel(S, biz, 'Run a sale'));
  }
  /* services: star-role table (21 types named in the task). */
  {
    const starCases = {
      vet_clinic: 'vet', physio_clinic: 'physiotherapist', pharmacy: 'pharmacist',
      community_pharmacy: 'pharmacist', dental_clinic: 'dentist', dental_center: 'dentist',
      diagnostic_lab: 'pathologist', car_wash: 'head detailer', photo_studio: 'lead photographer',
      fashion_atelier: 'head designer', ev_service_hub: 'master technician', gym: 'head coach',
      gym_franchise: 'head coach', nursery_preschool: 'head teacher', wedding_planner: 'lead planner',
      contracting: 'site engineer', solar_epc: 'solar engineer', interior_arch: 'interior designer',
      architecture_studio: 'architect', consulting: 'senior consultant', travel_agency: 'travel agent',
      pet_grooming: 'master groomer'
    };
    for (const [typeId, wantRole] of Object.entries(starCases)) {
      const { S, biz } = bizFor(typeId);
      const r = applyDecision(S, biz, 'svc_hire_star');
      const star = (biz.staff || []).find(e => e.star);
      check(`${typeId}: star role is "${wantRole}"`, r.ok && star && star.role === wantRole, r.ok ? `got ${star && star.role}` : r.msg);
      check(`${typeId}: star role in table`, STAR_ROLE_BY_TYPE[typeId] === wantRole);
    }
    /* doctor/lawyer/accountant/teacher kept where correct. */
    for (const [typeId, wantRole] of [['clinic', 'doctor'], ['law_firm', 'lawyer'], ['law_chambers', 'lawyer'], ['accounting_firm', 'accountant'], ['audit_tax_firm', 'accountant'], ['tutoring_center', 'teacher'], ['exam_academy', 'teacher'], ['academy', 'teacher']]) {
      const { S, biz } = bizFor(typeId);
      const r = applyDecision(S, biz, 'svc_hire_star');
      const star = (biz.staff || []).find(e => e.star);
      check(`${typeId}: star role stays "${wantRole}"`, r.ok && star && star.role === wantRole, r.ok ? `got ${star && star.role}` : r.msg);
    }
  }
  /* services: big-client replacements. */
  {
    const bigCases = {
      pharmacy: 'Win a clinic supply contract', community_pharmacy: 'Win a clinic supply contract',
      nursery_preschool: 'Win a company crèche-places deal', pet_grooming: 'Win a kennel / breeder contract',
      fashion_atelier: 'A boutique orders a collection', wedding_planner: 'Book a full wedding season'
    };
    for (const [typeId, wantLabel] of Object.entries(bigCases)) {
      const { S, biz } = bizFor(typeId);
      check(`${typeId}: big client is "${wantLabel}"`, hasLabel(S, biz, wantLabel));
      check(`${typeId}: no generic "Take on a big client"`, !hasLabel(S, biz, 'Take on a big client'));
    }
  }
  /* property. */
  {
    const { S, biz } = bizFor('car_rental_fleet');
    check('car_rental_fleet: "Refurbish a vehicle"', hasLabel(S, biz, 'Refurbish a vehicle') && !hasLabel(S, biz, 'Renovate a unit'));
  }
  {
    const { S, biz } = bizFor('logistics');
    check('logistics: "Refit the depot"', hasLabel(S, biz, 'Refit the depot') && !hasLabel(S, biz, 'Renovate a unit'));
  }
  {
    const { S, biz } = bizFor('cold_logistics');
    check('cold_logistics: "Refit the cold store"', hasLabel(S, biz, 'Refit the cold store') && !hasLabel(S, biz, 'Renovate a unit'));
  }
  for (const typeId of ['prop_brokerage', 'realestate']) {
    const { S, biz } = bizFor(typeId);
    const want = ['agency_open_office', 'agency_hire_agents', 'agency_close_office', 'agency_exclusive_listings', 'agency_refit_office'];
    check(`${typeId}: exactly the 5 agency decisions`, JSON.stringify(ids(S, biz)) === JSON.stringify(want), `got ${ids(S, biz).join(',')}`);
    for (const old of ['prop_buy_vehicle', 'prop_fleet_expand', 'prop_fleet_trim', 'prop_take_contract', 'prop_renovate_unit']) {
      check(`${typeId}: no ${old}`, !has(S, biz, old));
    }
  }
  /* advance_stage exists only for the two pre-revenue startups. */
  {
    const withStage = [];
    for (const t of TYPES) {
      const Sx = adultLife((t.id === 'radio_repair' || t.id === 'video_rental' || t.id === 'cyber_cafe') ? 2000 : 2026);
      const biz = mkBiz(t.id, t.label, 200000, 100, 500000);
      if (has(Sx, biz, 'tech_advance_stage')) withStage.push(t.id);
    }
    console.log('types offering Build the MVP:', withStage.join(', '));
    check('advance_stage only for software_startup + saas_ai_agency', JSON.stringify(withStage.sort()) === JSON.stringify(['saas_ai_agency', 'software_startup']), `got ${withStage.join(',')}`);
  }
  /* group function untouched: fallback still maps as before. */
  check('group fallback intact: fruit_stall food, salon retail, clinic services, logistics property',
    decisionGroupForBusiness({ typeId: 'fruit_stall', name: 'Fruit & vegetable stall' }) === 'food'
    && decisionGroupForBusiness({ typeId: 'salon', name: 'Salon / barbershop' }) === 'retail'
    && decisionGroupForBusiness({ typeId: 'clinic', name: 'Private Specialist Clinic' }) === 'services'
    && decisionGroupForBusiness({ typeId: 'logistics', name: 'Logistics company' }) === 'property'
    && decisionGroupForBusiness({ typeId: 'software_studio', name: 'Software & Digital Consultancy' }) === 'tech');
}

/* ================= (c) tech trap ================= */
console.log('--- (c) tech trap ---');
{
  const S = adultLife();
  const biz = mkBiz('software_studio', 'Studio Trading', 200000, 120000, 500000);
  check('trading studio: startupStage unset before any decision touch', biz.startupStage === undefined);
  decisionsForBusiness(S, biz);
  console.log(`trading studio: startupStage after render = ${biz.startupStage}`);
  check('trading studio: defaults to launched', biz.startupStage === 'launched');
  const r = applyDecision(S, biz, 'tech_advance_stage');
  check('trading studio: "Build the MVP" is refused', r.ok === false, r.msg || '');
  nextMonth(S);
  const eff = applyDecisionEffects(S, biz);
  console.log(`trading studio next month: revenueMult ${eff.revenueMult}`);
  check('trading studio: no 0.08 revenue cut', eff.revenueMult === null || eff.revenueMult === undefined, `got ${eff.revenueMult}`);
  /* A real startup still stages (regression guard for the shipped v2.14 behaviour). */
  const S2 = adultLife();
  const biz2 = mkBiz('software_startup', 'Real Startup', 200000, 120000, 500000);
  const a1 = applyDecision(S2, biz2, 'tech_advance_stage');
  check('software_startup: Concept -> MVP still works', a1.ok, a1.msg || '');
  nextMonth(S2);
  const eff2 = applyDecisionEffects(S2, biz2);
  check('software_startup: pre-launch revenueMult is still 0.08', eff2.revenueMult === 0.08, `got ${eff2.revenueMult}`);
  /* An untouched startup keeps trading until it stages: no ×0.08 just
     for having been looked at (this is the v2.14-w3 paid-acquisition
     case — it failed while the stage was defaulted eagerly). */
  const S3 = adultLife();
  const biz3 = mkBiz('saas_ai_agency', 'Untouched Agency', 200000, 120000, 500000);
  const ap = applyDecision(S3, biz3, 'tech_paid_acquisition');
  check('untouched startup: paid acquisition applies', ap.ok, ap.msg || '');
  check('untouched startup: stage still unset (not forced to concept)', biz3.startupStage === undefined, `got ${biz3.startupStage}`);
  nextMonth(S3);
  const eff3 = applyDecisionEffects(S3, biz3);
  check('untouched startup: no 0.08 cut before staging', eff3.revenueMult === null || eff3.revenueMult === undefined, `got ${eff3.revenueMult}`);
  check('untouched startup: acquisition revenue lands in full', eff3.revenueDelta === 24000, `got ${eff3.revenueDelta}`);
}

/* ================= (d) equity is real ================= */
console.log('--- (d) equity real ---');
{
  const mkValBiz = (equity) => {
    const b = mkBiz('software_studio', 'Equity Biz', 200000, 120000, 500000);
    b.equityOwned = equity;
    return b;
  };
  const v100 = businessValuation(mkValBiz(100));
  const v80 = businessValuation(mkValBiz(80));
  console.log(`valuation at 100% equity: ${v100}, at 80%: ${v80} (expect ${Math.round(v100 * 0.8)})`);
  check('valuation at 80% is 80% of valuation at 100%', v80 === Math.round(v100 * 0.8), `got ${v80} vs ${Math.round(v100 * 0.8)}`);
  /* Co-founder dilutes, then the sale pays the diluted share. */
  const S = adultLife();
  const biz = mkBiz('software_studio', 'Cofounder Biz', 200000, 120000, 500000);
  S.career.businesses = [biz]; S.career.business = biz;
  const cf = applyDecision(S, biz, 'tech_add_cofounder');
  check('co-founder joins, equity 100 -> 80', cf.ok && biz.equityOwned === 80, cf.msg || '');
  const cashBefore = S.money.cash;
  const val = businessValuation(biz);
  const sold = sellBusiness(S, biz);
  console.log(`sold co-founder biz for ${val}; cash ${cashBefore} -> ${S.money.cash}`);
  check('sale pays the diluted valuation', sold.ok && S.money.cash === cashBefore + val, sold.msg || '');
  check('sale message names the 80% share', /80%/.test(sold.msg), sold.msg);
  /* Funding round dilution moves the sale price too. */
  const S2 = adultLife();
  const biz2 = mkBiz('software_startup', 'Funded Startup', 200000, 120000, 500000);
  S2.career.businesses = [biz2]; S2.career.business = biz2;
  const vBefore = businessValuation(biz2);
  const st1 = applyDecision(S2, biz2, 'tech_advance_stage'); /* Concept -> MVP: seed needs MVP or later */
  check('startup stages to MVP before the seed round', st1.ok && biz2.startupStage === 'mvp', st1.msg || '');
  const fr = applyDecision(S2, biz2, 'tech_funding_seed');
  check('seed round applies at MVP', fr.ok, fr.msg || '');
  const vAfter = businessValuation(biz2);
  console.log(`seed round: equity ${biz2.equityOwned}%, valuation ${vBefore} -> ${vAfter}`);
  check('seed dilution (100 -> 85) moves valuation', biz2.equityOwned === 85 && vAfter === Math.round(vBefore * 0.85), `got ${vAfter}`);
}

/* ================= (e) premium/value exclusion ================= */
console.log('--- (e) premium/value exclusion ---');
{
  const S = adultLife();
  const biz = mkBiz('clinic', 'Clinic', 200000, 120000, 500000);
  const pv = applyDecision(S, biz, 'svc_price_value');
  check('value pricing applies', pv.ok, pv.msg || '');
  const pr = applyDecision(S, biz, 'svc_price_premium');
  check('premium is refused while value runs', pr.ok === false, pr.msg || '');
  const live = (biz.decisionEffects || []).filter(e => (e.monthsLeft || 0) > 0 && (e.decisionId === 'svc_price_premium' || e.decisionId === 'svc_price_value'));
  check('only value is held (not both)', live.length === 1 && live[0].decisionId === 'svc_price_value', `held: ${live.map(e => e.decisionId).join(',')}`);
  const bal = applyDecision(S, biz, 'svc_price_balanced');
  check('balanced clears value', bal.ok, bal.msg || '');
  const pr2 = applyDecision(S, biz, 'svc_price_premium');
  check('premium applies after balanced', pr2.ok, pr2.msg || '');
  const va2 = applyDecision(S, biz, 'svc_price_value');
  check('value is refused while premium runs', va2.ok === false, va2.msg || '');
  nextMonth(S);
  const eff = applyDecisionEffects(S, biz);
  console.log(`premium month: revenueDelta ${eff.revenueDelta} (expect +18000), costDelta ${eff.costDelta}`);
  check('premium month moves revenue +9% only', eff.revenueDelta === 18000, `got ${eff.revenueDelta}`);
}

/* ================= (f) real numbers at each type's scale ================= */
console.log('--- (f) costs are real at each type\'s scale ---');
{
  /* The original joke numbers, re-measured on the stall with the collapsed monthlyCost. */
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Stall Scale', 20900, 100, 47500);
  const r1 = applyDecision(S, biz, 'food_launch_delivery');
  const r2 = applyDecision(S, biz, 'food_launch_catering');
  console.log(`delivery promised costDelta ${r1.promisedNumbers.costDelta}, catering ${r2.promisedNumbers.costDelta} (old: +4 / +8)`);
  check('delivery cost is a real number (>=1% of revenue)', r1.promisedNumbers.costDelta >= 209, `got ${r1.promisedNumbers.costDelta}`);
  check('catering cost is a real number (>=1% of revenue)', r2.promisedNumbers.costDelta >= 209, `got ${r2.promisedNumbers.costDelta}`);
  /* Every decision of every type, at that type's own scale, with monthlyCost collapsed to 100. */
  let worst = [];
  for (const t of TYPES) {
    const Sx = adultLife((t.id === 'radio_repair' || t.id === 'video_rental' || t.id === 'cyber_cafe') ? 2000 : 2026);
    const rev = Math.max(2000, (t.monthlyRevUsd2026 || 2000) * 50);
    const biz2 = mkBiz(t.id, t.label, rev, 100, 500000);
    for (const d of decisionsForBusiness(Sx, biz2)) {
      if (d.cost > 0 && d.cost < Math.max(100, rev * 0.005)) worst.push(`${t.id}/${d.id} cost ${d.cost} on rev ${rev}`);
      const nums = [...d.effectText.matchAll(/([\d,]+)\s*EGP/g)].map(m => Number(m[1].replace(/,/g, '')));
      /* Effect-text numbers are fees and deltas quoted at the
         decision's own scale (a legal fee is 2% of the raise, not of
         revenue). The joke-number bar is: never below 100 EGP and
         never below 0.2% of the type's revenue — the old +4/+8 fail
         both. Landed monthly deltas are held to the stricter 1% bar
         in the measured cases above. */
      for (const n of nums) if (n > 0 && (n < 100 || n < rev * 0.002)) worst.push(`${t.id}/${d.id} effectText mentions ${n} EGP on rev ${rev}`);
    }
  }
  console.log('sub-scale numbers found:', worst.length ? worst.join(' ; ') : 'none');
  check('no decision cost or effect number is a joke number', worst.length === 0, worst.slice(0, 5).join(' ; '));
}

/* ================= run-op label collisions ================= */
console.log('--- (g) run-op collisions ---');
{
  const S = adultLife();
  const food = mkBiz('fruit_stall', 'Radwan Fruit', 20900, 100, 47500);
  const retail = mkBiz('retail_shop', 'Shop', 200000, 120000, 500000);
  const tech = mkBiz('software_studio', 'Studio', 200000, 120000, 500000);
  const foodOp = businessOpInfo(S, food, 'rd');
  const retailOp = businessOpInfo(S, retail, 'rd');
  const techOp = businessOpInfo(S, tech, 'rd');
  console.log(`food rd op: available ${foodOp.available}, removed ${foodOp.removed}, label "${foodOp.label}", next "${foodOp.nextAvailableLabel}"`);
  console.log(`retail rd op: available ${retailOp.available}, removed ${retailOp.removed}, label "${retailOp.label}"`);
  console.log(`tech rd op: available ${techOp.available}, label "${techOp.label}"`);
  check('food rd run-op removed (cannot run)', foodOp.available === false && foodOp.removed === true);
  check('retail rd run-op removed (cannot run)', retailOp.available === false && retailOp.removed === true);
  check('tech rd run-op still exists', techOp.available === true);
  const S2 = adultLife();
  const biz2 = mkBiz('restaurant', 'Restaurant', 200000, 120000, 500000);
  S2.career.businesses = [biz2]; S2.career.business = biz2;
  const run = runBusinessOp(S2, biz2, 'rd');
  check('runBusinessOp refuses food rd', run.ok === false, run.msg || '');
  const dec = decisionsForBusiness(S2, biz2).find(d => d.id === 'food_refresh_menu');
  console.log(`decision Refresh the menu costs ${dec.cost} (old run-op was 65% of revenue = ${Math.round(200000 * 0.65)})`);
  check('one price for Refresh the menu: decision at 8% of revenue', dec.cost === 16000, `got ${dec.cost}`);
  const html = renderDecisionsHtml(S2, biz2);
  check('rendered decisions offer Refresh the menu exactly once', (html.match(/data-decision="food_refresh_menu"/g) || []).length === 1, '');
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
