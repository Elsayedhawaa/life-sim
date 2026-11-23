/* ============================================================================
   World Life 2.0 — Business Decisions (v2.14 W3: per-industry actions, §3)
   ONE new file. Per-industry decisions for the 55 venture types, each
   wired to the real P&L — not a label change. The existing 3 generic
   run ops (R&D, Team Bonus, Pricing) are untouched and stay.

   INDUSTRY GROUPS — built on industryForBusiness (businessEngine.js),
   which returns exactly five values: food, tech, retail, health,
   services. The task's five groups map onto it like this:
     FOOD & HOSPITALITY  = industry 'food' EXCEPT cold_logistics
     STARTUP / TECH      = industry 'tech'
     RETAIL & TRADE      = industry 'retail'
     SERVICES            = industry 'health' + industry 'services'
                           EXCEPT the property/logistics types below
     PROPERTY & LOGISTICS = type ids prop_brokerage, car_rental_fleet,
                           logistics, realestate (industry 'services')
                           + cold_logistics (industry 'food' — its label
                           is "Refrigerated Pharma & Food Transport",
                           so the engine's /food/ test catches it, but
                           it is a logistics business, so it belongs
                           here, as the spec names it here).
   Counted in 2026 (listAllBusinessVentures, 52 era-open rows):
     food 5 [cafe, roastery_chain, restaurant, bakery, fruit_stall]
     tech 5 [software_studio, saas_ai_agency, ecommerce,
             software_startup, mobile_shop]
     retail 6 [retail, retail_shop, salon, bookstore,
               textile_workshop, print_shop]
       (salon lands in retail because its label "Salon / barbershop"
       contains "shop" — the engine's mapping, not a choice here.)
     services 31 [health 10: clinic, diagnostic_lab,
               community_pharmacy, dental_center, ev_service_hub,
               fashion_atelier, pharmacy, dental_clinic, vet_clinic,
               physio_clinic — ev_service_hub lands in health because
               its label contains "Diagnostics"; fashion_atelier lands
               in health because its label "Modest & Couture Fashion
               Label" contains "lab" (in "Label"), which the engine's
               /lab/ test catches. Both are engine-mapping quirks,
               recorded here, not choices in this file.
               + services-minus-property 21: contracting, solar_epc,
               exam_academy, law_chambers, agro_export, wedding_planner,
               audit_tax_firm, interior_arch, nursery_preschool,
               tutoring_center, gym, law_firm, accounting_firm,
               architecture_studio, consulting, car_wash, pet_grooming,
               academy, gym_franchise, photo_studio, travel_agency]
     property 5 [prop_brokerage, car_rental_fleet, logistics,
               realestate, cold_logistics]
   5 + 5 + 6 + 31 + 5 = 52. Every era-open venture type is in exactly
   one group; decisionGroupForBusiness() computes the group live, so
   era-gated types that open later land in the right group too.

   v2.20 I2 — PER-TYPE OVERRIDE LAYER (TYPE_OVERRIDES, below): the
   group set is now only the fallback. A fruit stall gets its own 8
   decisions; bakery/roastery/salon/print/video/cyber get renamed or
   replaced decisions; software_studio gets consultancy decisions;
   ecommerce/mobile_shop get the retail set; brokerages get agency
   decisions. 49 DEFS total (food 14, tech 11, retail 9, services 5,
   property 10). costBase() is revenue-anchored now (never the 100 EGP
   floor). Equity is real: businessValuation multiplies by
   equityOwned, so funding rounds and co-founders cost a real share
   of the sale price. Startup staging applies only to the two
   pre-revenue startup types; every other tech business is launched
   from day one.

   CONTRACT (coordinator wires this into computeBusinessMonth):
   - decisionsForBusiness(S, biz) -> [{ id, label, cost, effectText,
       available, lockReason }] — cost + effect stated BEFORE committing.
   - applyDecision(S, biz, decisionId, opts) -> { ok, msg, promised,
       promisedNumbers } — charges the cost NOW with a ledger line
       (walletMove, same pattern as runBusinessOp) and records the
       effect on the business. opts.force ('rave'|'pan'|... ) pins a
       random outcome for deterministic testing; real play never sets it.
   - applyDecisionEffects(S, biz) -> { revenueDelta, costDelta,
   -   repeatRateDelta. (v2.17: reputation deleted — decisions move repeat customers, the fold applies it.)
       repeatRateDelta, revenueMult, notes } — the effect landing in
       the NEXT month's P&L. One-shot verdicts (critic, competition,
       supplier failure, contract failure, co-founder quit) are
       RESOLVED here, with the outcome stored on the business record
       (biz.lastCriticVerdict, biz.lastCompetitionResult,
       biz.lastSupplierOutcome, biz.decisionLog) so the player can
       read it. Idempotent within a month (lastAppliedMonth guard).
   - renderDecisionsHtml(S, biz) -> buttons, each showing cost +
       effect before committing; unavailable ones show the reason.

   HOW applyDecisionEffects FOLDS INTO computeBusinessMonth
   (coordinator: call computeBusinessMonth FIRST, then
   applyDecisionEffects, then fold — this order matters, because the
   P&L's wave uses the repeat rate BEFORE this month's verdict lands):
     const pl = computeBusinessMonth(S, biz);
     const eff = applyDecisionEffects(S, biz);
     if (eff.revenueMult != null) pl.revenue = Math.round(pl.revenue * eff.revenueMult);
     pl.revenue += eff.revenueDelta;
     pl.other = Math.max(0, pl.other + eff.costDelta);
     pl.costs += eff.costDelta;
     pl.profit = pl.revenue - pl.costs;
     pl.tax = computeBusinessTax(S, pl.profit).tax;   // tax follows profit
     pl.net = pl.profit - pl.tax;
   The revenue and costs ledger lines the settlement posts must be the
   FOLDED pl.revenue / pl.costs, so the ledger matches the promised
   numbers exactly: folded revenue = base revenue (+revenueMult) +
   promised revenueDelta, folded costs = base costs + promised
   costDelta. Tax is recomputed on the folded profit, so a decision
   that earns more also pays the country's tax on the extra profit —
   the promise is about the revenue/cost lines, and the test asserts
   exactly those lines.
   Purity: these functions never post ledger lines themselves EXCEPT
   applyDecision, which charges the decision's immediate cost (and, for
   funding rounds / fleet trims / rare-item purchases, the cash in/out
   of that decision) with walletMove ledger lines at commit time.
   applyDecisionEffects moves NO cash — it only returns deltas and
   returns a repeat-rate delta for the monthly fold to apply.
   ========================================================================== */

import { rand, clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove } from '../core/schema.js';
import { formatMoney } from '../data/countries.js';
import { pickFirstName, pickFamilyName } from '../data/names.js';
import { industryForBusiness, businessMonthIndex, computeBusinessTax } from './businessEngine.js';
import { monthlyMidSalary, averageMorale } from './businessStaff.js';

export { computeBusinessTax }; /* re-exported so the coordinator's fold has it from this module too */

/* ------------------------------------------------------------------ *
   Groups
   ------------------------------------------------------------------ */
export const PROPERTY_TYPE_IDS = ['prop_brokerage', 'car_rental_fleet', 'logistics', 'realestate', 'cold_logistics'];

/* Real type ids per group, counted from listAllBusinessVentures in
   2026 (52 era-open rows). decisionGroupForBusiness() is the live
   rule; this table is the counted record for the report/tests. */
export const GROUP_TYPE_IDS_2026 = {
  food: ['cafe', 'roastery_chain', 'restaurant', 'bakery', 'fruit_stall'],
  tech: ['software_studio', 'saas_ai_agency', 'ecommerce', 'software_startup', 'mobile_shop'],
  retail: ['retail', 'retail_shop', 'salon', 'bookstore', 'textile_workshop', 'print_shop'],
  services: ['clinic', 'diagnostic_lab', 'community_pharmacy', 'dental_center', 'ev_service_hub', 'fashion_atelier', 'pharmacy', 'dental_clinic', 'vet_clinic', 'physio_clinic',
    'contracting', 'solar_epc', 'exam_academy', 'law_chambers', 'agro_export', 'wedding_planner', 'audit_tax_firm', 'interior_arch', 'nursery_preschool', 'tutoring_center', 'gym', 'law_firm', 'accounting_firm', 'architecture_studio', 'consulting', 'car_wash', 'pet_grooming', 'academy', 'gym_franchise', 'photo_studio', 'travel_agency'],
  property: ['prop_brokerage', 'car_rental_fleet', 'logistics', 'realestate', 'cold_logistics']
};

export const DECISION_GROUP_LABELS = {
  food: 'Food & Hospitality',
  tech: 'Startup / Tech',
  retail: 'Retail & Trade',
  services: 'Services',
  property: 'Property & Logistics'
};

export function decisionGroupForBusiness(biz) {
  const typeId = String(biz?.typeId || '');
  if (PROPERTY_TYPE_IDS.includes(typeId)) return 'property';
  const ind = industryForBusiness(typeId, biz?.name);
  if (ind === 'food') return 'food';
  if (ind === 'tech') return 'tech';
  if (ind === 'retail') return 'retail';
  return 'services'; /* health + the rest of services */
}

/* v2.20 I2 — the two venture types that are founded as pre-revenue
   startups and genuinely stage Concept → MVP → Beta → Launch. Every
   other tech business trades from day one (a consultancy, an agency,
   a shop) and must never be treated as pre-revenue: the shipped
   v2.14 test pins saas_ai_agency as a staging startup (the flop path),
   so it stays in this list with software_startup. */
export const PRE_REVENUE_STARTUP_TYPES = ['software_startup', 'saas_ai_agency'];

/* v2.20 I2 — PER-TYPE OVERRIDE LAYER (W2 §2–§3). Decisions used to be
   assigned by industry group only, so a fruit stall got a food
   critic and a cooking competition. This table is consulted FIRST by
   decisionsForBusiness and applyDecision; the group set is the
   fallback for any type not listed here.
   - set: the type's whole decision list, in order (replaces the group set).
   - remove: group decisions that make no sense for this type.
   - replace: swap a group decision for a type-fitting one, same slot.
   - add: extra decisions appended after the group set.
   - sectionLabel: the heading the Decisions section shows for this type.
   Era-gated types land here too: the engine's industry mapping files
   video_rental and radio_repair under services and cyber_cafe under
   tech, but all three are shops — they get the retail set here, which
   is what the W2 audit assumed. */
export const TYPE_OVERRIDES = {
  fruit_stall: { sectionLabel: 'Fruit Stall', set: ['fruit_morning_wholesale', 'fruit_seasonal', 'fruit_better_corner', 'fruit_spoilage', 'fruit_regulars_box', 'fruit_price_board', 'fruit_bicycle_delivery', 'food_train_staff'] },
  bakery: { remove: ['food_invite_critic'] },
  software_studio: { sectionLabel: 'Software Consultancy', remove: ['tech_advance_stage', 'tech_funding_preseed', 'tech_funding_seed', 'tech_funding_series_a', 'tech_funding_series_b'], add: ['consult_win_retainer', 'consult_hire_senior'] },
  ecommerce: { sectionLabel: 'Retail & Trade', remove: ['tech_advance_stage', 'tech_funding_preseed', 'tech_funding_seed', 'tech_funding_series_a', 'tech_funding_series_b', 'tech_disagree_side', 'tech_disagree_overrule'], add: ['retail_buy_stock', 'retail_supplier_cheap', 'retail_supplier_reliable', 'retail_run_sale', 'retail_appraise_rare', 'retail_sell_dead_stock'] },
  mobile_shop: { sectionLabel: 'Retail & Trade', remove: ['tech_advance_stage', 'tech_funding_preseed', 'tech_funding_seed', 'tech_funding_series_a', 'tech_funding_series_b', 'tech_disagree_side', 'tech_disagree_overrule'], add: ['retail_buy_stock', 'retail_supplier_cheap', 'retail_supplier_reliable', 'retail_run_sale', 'retail_appraise_rare', 'retail_sell_dead_stock'] },
  salon: { replace: { retail_appraise_rare: 'salon_premium_package' } },
  print_shop: { replace: { retail_appraise_rare: 'print_big_contract' } },
  cyber_cafe: { sectionLabel: 'Retail & Trade', set: ['retail_buy_stock', 'retail_supplier_cheap', 'retail_supplier_reliable', 'retail_run_sale', 'cyber_gaming_night', 'retail_sell_dead_stock'] },
  video_rental: { sectionLabel: 'Retail & Trade', set: ['retail_buy_stock', 'retail_supplier_cheap', 'retail_supplier_reliable', 'retail_run_sale', 'retail_appraise_rare', 'retail_sell_dead_stock'] },
  radio_repair: { sectionLabel: 'Retail & Trade', set: ['retail_buy_stock', 'retail_supplier_cheap', 'retail_supplier_reliable', 'retail_run_sale', 'retail_appraise_rare', 'retail_sell_dead_stock'] },
  prop_brokerage: { sectionLabel: 'Property Agency', set: ['agency_open_office', 'agency_hire_agents', 'agency_close_office', 'agency_exclusive_listings', 'agency_refit_office'] },
  realestate: { sectionLabel: 'Property Agency', set: ['agency_open_office', 'agency_hire_agents', 'agency_close_office', 'agency_exclusive_listings', 'agency_refit_office'] }
};

export function decisionIdsForType(typeId, group) {
  const base = DEFS.filter(d => d.group === group).map(d => d.id);
  const ov = TYPE_OVERRIDES[String(typeId || '')];
  if (!ov) return base;
  const ids = ov.set ? [...ov.set] : base.filter(id => !(ov.remove || []).includes(id));
  for (const [oldId, newId] of Object.entries(ov.replace || {})) {
    const i = ids.indexOf(oldId);
    if (i >= 0) ids[i] = newId;
    else if (!ids.includes(newId)) ids.push(newId);
  }
  for (const addId of (ov.add || [])) if (!ids.includes(addId)) ids.push(addId);
  return ids;
}
export function decisionIdsForBusiness(biz) {
  return decisionIdsForType(biz?.typeId, decisionGroupForBusiness(biz));
}
export function decisionSectionLabel(biz) {
  const ov = TYPE_OVERRIDES[String(biz?.typeId || '')];
  return (ov && ov.sectionLabel) || DECISION_GROUP_LABELS[decisionGroupForBusiness(biz)] || '';
}

/* ------------------------------------------------------------------ *
   State + small helpers
   ------------------------------------------------------------------ */
function ensureDecisionState(S, biz) {
  if (!biz) return null;
  if (!Array.isArray(biz.decisionEffects)) biz.decisionEffects = [];
  if (!Array.isArray(biz.decisionLog)) biz.decisionLog = [];
  if (!biz.lastDecisionUsed || typeof biz.lastDecisionUsed !== 'object') biz.lastDecisionUsed = {};
  if (!biz.fundingRounds || typeof biz.fundingRounds !== 'object') biz.fundingRounds = {};
  if (typeof biz.equityOwned !== 'number') biz.equityOwned = 100;
  /* v2.20 I2 — tech trap (W2 §4): startupStage is never set by the
     launch code, so a trading tech business that ever staged defaulted
     to 'concept' and its revenue was cut to ×0.08. A business that
     trades from day one is launched from day one; only the two
     pre-revenue startup types start at Concept — and theirs is left
     UNSET (not 'concept') until the player actually stages, because
     applyDecisionEffects only applies the ×0.08 while a stage is
     recorded: an untouched startup keeps trading until it stages.
     This runs on every decision touch (render, apply, monthly
     effects), so the ×0.08 can never land on a trading business
     even before any decision is clicked. */
  if (biz.startupStage === undefined && decisionGroupForBusiness(biz) === 'tech'
      && !PRE_REVENUE_STARTUP_TYPES.includes(String(biz.typeId || ''))) {
    biz.startupStage = 'launched';
  }
  if (!Array.isArray(biz.staff)) biz.staff = [];
  return biz;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmt(S, n) { return formatMoney(Math.round(n || 0), S.country); }
function nowIdx(S) { return businessMonthIndex(S); }
function rev(S, biz) { return Math.max(0, Number(biz.monthlyRev) || 0); }
function costBase(S, biz) {
  /* v2.20 I2 — the old costBase was just biz.monthlyCost, which
     collapses to the 100 EGP floor when the starter wage bill eats the
     cost lump (normalizeBusiness, businessEngine.js) — that is why
     delivery was +4 EGP and catering +8 EGP in Elsayed's playtest.
     The base is now anchored on revenue: the stored figure is trusted
     only when it is at least a third of monthly revenue (I3's repriced
     base passes that test; the 100 floor never does), otherwise 35%
     of revenue stands in — the fruit stall's real other costs are
     7,600 on 20,900 revenue (36%), so the floor lands within a few
     percent of the real figure at the anchor scale. Every cost delta
     in this file scales off this base, so none of them can be a joke
     number again. */
  const r = rev(S, biz);
  const stored = Math.max(0, Number(biz.monthlyCost) || 0);
  return Math.max(stored >= r * 0.33 ? stored : 0, Math.round(r * 0.35));
}
function fruitCost(S, biz, anchorEgp) {
  /* W2 §2 scale anchor: the stall Elsayed launched had capital 47,500
     EGP and base monthly revenue 20,900 EGP. Fruit-stall decision
     costs are quoted at that scale and scale with the stall's actual
     takings, so a stall in another country or era pays a real number
     at its own scale — 2,500 at the anchor, never a flat 2,500 in
     London or a flat 100 anywhere. */
  return Math.max(100, Math.round(anchorEgp * rev(S, biz) / 20900));
}
function capital(S, biz) { return Math.max(0, Number(biz.capitalInvested) || 0); }
function totalWages(biz) { return (biz.staff || []).reduce((s, e) => s + (Number(e.wageLocal) || 0), 0); }
function pct(n, p) { return Math.round((Number(n) || 0) * p); }

function logDecision(S, biz, decisionId, label, text) {
  biz.decisionLog.unshift({ year: S.year, month: S.month, decisionId, label, text });
  if (biz.decisionLog.length > 40) biz.decisionLog = biz.decisionLog.slice(0, 40);
  recordJournal(S, text, 'career');
}

function activeEffect(biz, decisionId) {
  return (biz.decisionEffects || []).find(e => e.decisionId === decisionId && (e.monthsLeft > 0 || e.kind === 'oneshot')) || null;
}
function cooldownLeft(S, biz, id, months) {
  const last = Number(biz.lastDecisionUsed?.[id] ?? -9999);
  return Math.max(0, months - (nowIdx(S) - last));
}
function markUsed(S, biz, id) { biz.lastDecisionUsed[id] = nowIdx(S); }

let _effectSeq = 0;
function addEffect(biz, eff) {
  _effectSeq += 1;
  eff.key = `${eff.decisionId}_${eff.landsMonth}_${_effectSeq}`;
  biz.decisionEffects.push(eff);
  return eff;
}
/* A monthly slice: monthlyRevenue / monthlyCost land once a month for
   totalMonths months, starting landsMonth. monthlyRepeat lands once, in
   the first month the slice lands. revenueMult (e.g. a flopped launch)
   multiplies that month's revenue while the slice is active. */
function addSlice(S, biz, decisionId, label, opts) {
  return addEffect(biz, {
    kind: 'slice', decisionId, label,
    landsMonth: nowIdx(S) + (opts.delayMonths ?? 1),
    monthsLeft: opts.months, totalMonths: opts.months,
    monthlyRevenue: opts.monthlyRevenue || 0,
    monthlyCost: opts.monthlyCost || 0,
    monthlyRepeat: opts.monthlyRepeat || 0,
    revenueMult: opts.revenueMult != null ? opts.revenueMult : null,
    repeatApplied: false, lastAppliedMonth: -9999, data: opts.data || {}
  });
}
function addOneshot(S, biz, decisionId, label, data) {
  return addEffect(biz, {
    kind: 'oneshot', decisionId, label,
    landsMonth: nowIdx(S) + 1, monthsLeft: 1, totalMonths: 1,
    monthlyRevenue: 0, monthlyCost: 0, monthlyRepeat: 0, revenueMult: null,
    repeatApplied: false, lastAppliedMonth: -9999, data: data || {}
  });
}

/* Charge the immediate cost (ledger line, personal cash — same pattern
   as runBusinessOp). Returns { ok } or { ok:false, msg }. */
function chargeCost(S, biz, cost, label) {
  if (cost > 0 && (Number(S.money?.cash) || 0) < cost) {
    return { ok: false, msg: `Need ${fmt(S, cost)} in cash for ${label} (you have ${fmt(S, S.money?.cash || 0)}).` };
  }
  if (cost > 0) walletMove(S, -cost, `${biz.name} — ${label}`, 'business');
  return { ok: true };
}

/* ------------------------------------------------------------------ *
   Startup stages
   ------------------------------------------------------------------ */
export const STARTUP_STAGES = ['concept', 'mvp', 'beta', 'launched'];
export const STARTUP_STAGE_LABELS = { concept: 'Concept', mvp: 'MVP', beta: 'Beta', launched: 'Launched' };
export function startupStageOf(biz) {
  return STARTUP_STAGES.includes(biz?.startupStage) ? biz.startupStage : 'concept';
}
function stageCostFrac(from) {
  if (from === 'concept') return 0.15;
  if (from === 'mvp') return 0.20;
  return 0.30; /* beta -> launch */
}
function stageIndex(biz) { return STARTUP_STAGES.indexOf(startupStageOf(biz)); }

const FUNDING_ROUNDS = {
  tech_funding_preseed: { key: 'preseed', label: 'Pre-Seed round', raiseFrac: 0.5, dilution: 10, minStage: 0 },
  tech_funding_seed: { key: 'seed', label: 'Seed round', raiseFrac: 1.0, dilution: 15, minStage: 1 },
  tech_funding_series_a: { key: 'series_a', label: 'Series A round', raiseFrac: 2.0, dilution: 20, minStage: 2 },
  tech_funding_series_b: { key: 'series_b', label: 'Series B round', raiseFrac: 4.0, dilution: 20, minStage: 3 }
};

/* Star specialist role by business type — a per-type table (v2.20 I2,
   W2 §3). The old regex called a vet a "doctor", a car-wash owner a
   "developer" and defaulted 15 more types to "manager". Any type not
   listed here gets 'manager'. */
export const STAR_ROLE_BY_TYPE = {
  vet_clinic: 'vet', physio_clinic: 'physiotherapist',
  pharmacy: 'pharmacist', community_pharmacy: 'pharmacist',
  dental_clinic: 'dentist', dental_center: 'dentist',
  diagnostic_lab: 'pathologist', car_wash: 'head detailer',
  photo_studio: 'lead photographer', fashion_atelier: 'head designer',
  ev_service_hub: 'master technician', gym: 'head coach',
  gym_franchise: 'head coach', nursery_preschool: 'head teacher',
  wedding_planner: 'lead planner', contracting: 'site engineer',
  solar_epc: 'solar engineer', interior_arch: 'interior designer',
  architecture_studio: 'architect', consulting: 'senior consultant',
  travel_agency: 'travel agent', pet_grooming: 'master groomer',
  clinic: 'doctor', law_firm: 'lawyer', law_chambers: 'lawyer',
  accounting_firm: 'accountant', audit_tax_firm: 'accountant',
  tutoring_center: 'teacher', exam_academy: 'teacher', academy: 'teacher'
};
export function starRoleFor(biz) {
  return STAR_ROLE_BY_TYPE[String(biz?.typeId || '')] || 'manager';
}

function personName(S, biz) {
  const countryId = biz?.country || S.country;
  const gender = rand(S) < 0.5 ? 'm' : 'f';
  return `${pickFirstName(countryId, gender, () => rand(S))} ${pickFamilyName(countryId, () => rand(S))}`;
}

/* ------------------------------------------------------------------ *
   Decision definitions. Each: id, group, label(S,biz), cost(S,biz),
   effectText(S,biz), available(S,biz) -> { ok, reason }, apply(S,biz,opts).
   apply() assumes cost/cash were checked by applyDecision; it charges,
   records the effect and returns { ok, msg, promised, promisedNumbers }.
   ------------------------------------------------------------------ */
const DEFS = [
  /* ================= FOOD & HOSPITALITY (7) ================= */
  {
    id: 'food_refresh_menu', group: 'food', label: (S, biz) => biz?.typeId === 'bakery' ? 'Refresh the counter — new bakes' : 'Refresh the menu',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.08)),
    effectText: (S, biz) => biz?.typeId === 'bakery'
      ? `Fresh bakes on the counter and new prices: +${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 6 months, repeat customers +3%.`
      : `New dishes and new prices: +${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 6 months, repeat customers +3%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'food_refresh_menu')) return { ok: false, reason: 'The refreshed menu is still running — wait until it ends.' };
      const cd = cooldownLeft(S, biz, 'food_refresh_menu', 6);
      if (cd > 0) return { ok: false, reason: `You refreshed the menu recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Refresh the menu'); if (!ch.ok) return ch;
      markUsed(S, biz, 'food_refresh_menu');
      addSlice(S, biz, 'food_refresh_menu', 'Refreshed menu', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.12), monthlyRepeat: 0.03 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 6 months, repeat customers +3%, starting next month.`;
      logDecision(S, biz, 'food_refresh_menu', 'Refresh the menu', `Refreshed the menu at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Menu refreshed at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.12), costDelta: 0, repeatRateDelta: 0.03, months: 6 } };
    }
  },
  {
    id: 'food_signature_dish', group: 'food', label: (S, biz) => biz?.typeId === 'bakery' ? 'Create a signature loaf' : biz?.typeId === 'roastery_chain' ? 'Create a signature roast' : 'Create a signature dish',
    cost: (S, biz) => Math.max(1000, pct(rev(S, biz), 0.15)),
    effectText: (S, biz) => biz?.typeId === 'bakery'
      ? `One loaf the bakery becomes known for: +${fmt(S, pct(rev(S, biz), 0.18))} revenue a month for 6 months, repeat customers +5%.`
      : biz?.typeId === 'roastery_chain'
        ? `One roast — a house blend the regulars ask for by name: +${fmt(S, pct(rev(S, biz), 0.18))} revenue a month for 6 months, repeat customers +5%.`
        : `One dish the place becomes known for: +${fmt(S, pct(rev(S, biz), 0.18))} revenue a month for 6 months, repeat customers +5%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'food_signature_dish')) return { ok: false, reason: 'You already have a signature dish running.' };
      const cd = cooldownLeft(S, biz, 'food_signature_dish', 12);
      if (cd > 0) return { ok: false, reason: `A signature dish takes time to catch on — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Create a signature dish'); if (!ch.ok) return ch;
      markUsed(S, biz, 'food_signature_dish');
      addSlice(S, biz, 'food_signature_dish', 'Signature dish', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.18), monthlyRepeat: 0.05 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.18))} revenue a month for 6 months, repeat customers +5%, starting next month.`;
      logDecision(S, biz, 'food_signature_dish', 'Create a signature dish', `Created a signature dish at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Your signature dish is on the menu at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.18), costDelta: 0, repeatRateDelta: 0.05, months: 6 } };
    }
  },
  {
    id: 'food_train_staff', group: 'food', label: (S, biz) => biz?.typeId === 'fruit_stall' ? 'Teach the boy the trade' : 'Train the staff',
    cost: (S, biz) => Math.max(500, pct(totalWages(biz), 0.5)),
    effectText: (S, biz) => biz?.typeId === 'fruit_stall'
      ? `Take the boy through the trade properly — picking, grading, weighing honestly: every employee's morale +8, +${fmt(S, pct(rev(S, biz), 0.06))} revenue a month for 3 months.`
      : `A proper training week: every employee's morale +8, +${fmt(S, pct(rev(S, biz), 0.06))} revenue a month for 3 months.`,
    available: (S, biz) => {
      if ((biz.staff || []).length === 0) return { ok: false, reason: 'There is nobody to train — hire staff first.' };
      const cd = cooldownLeft(S, biz, 'food_train_staff', 6);
      if (cd > 0) return { ok: false, reason: `Training was recent — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, this.label(S, biz)); if (!ch.ok) return ch;
      markUsed(S, biz, 'food_train_staff');
      for (const emp of (biz.staff || [])) emp.morale = clamp((Number(emp.morale) || 0) + 8, 0, 100);
      addSlice(S, biz, 'food_train_staff', 'Staff training', { months: 3, monthlyRevenue: pct(rev(S, biz), 0.06) });
      const promised = `Team morale +8 now, +${fmt(S, pct(rev(S, biz), 0.06))} revenue a month for 3 months.`;
      logDecision(S, biz, 'food_train_staff', this.label(S, biz), `Trained the team at ${biz.name} for ${fmt(S, c)} — morale rose 8 points each. ${promised}`);
      return { ok: true, msg: `Staff trained at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.06), costDelta: 0, repeatRateDelta: 0, months: 3, moraleDelta: 8 } };
    }
  },
  {
    id: 'food_invite_critic', group: 'food', label: (S, biz) => biz?.typeId === 'roastery_chain' ? 'Invite a coffee reviewer' : 'Invite a food critic',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.10)),
    effectText: (S, biz) => biz?.typeId === 'roastery_chain'
      ? `A coffee reviewer books a tasting next month and prints a verdict. Rave: +${fmt(S, pct(rev(S, biz), 0.25))} revenue that month, repeat customers +10%. Mixed: +${fmt(S, pct(rev(S, biz), 0.05))} revenue, repeat customers +2%. Pan: −${fmt(S, pct(rev(S, biz), 0.12))} revenue, repeat customers −8%. You read the verdict when it lands.`
      : `A critic books a table next month and prints a verdict. Rave: +${fmt(S, pct(rev(S, biz), 0.25))} revenue that month, repeat customers +10%. Mixed: +${fmt(S, pct(rev(S, biz), 0.05))} revenue, repeat customers +2%. Pan: −${fmt(S, pct(rev(S, biz), 0.12))} revenue, repeat customers −8%. You read the verdict when it lands.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'food_invite_critic')) return { ok: false, reason: 'A critic is already booked — wait for the verdict.' };
      const cd = cooldownLeft(S, biz, 'food_invite_critic', 6);
      if (cd > 0) return { ok: false, reason: `Critics need time to forget you — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Invite a food critic'); if (!ch.ok) return ch;
      markUsed(S, biz, 'food_invite_critic');
      addOneshot(S, biz, 'food_invite_critic', 'Food critic visit', { force: opts.force || null });
      const promised = 'The critic visits next month and the verdict is printed — a rave, a mixed review, or a pan — and revenue and repeat customers move with it.';
      logDecision(S, biz, 'food_invite_critic', 'Invite a food critic', `Invited a food critic to ${biz.name} for ${fmt(S, c)}. The verdict comes next month.`);
      return { ok: true, msg: `A critic is booked at ${biz.name} for next month. ${promised}`, promised, promisedNumbers: { outcome: 'verdict next month', raveRevenue: pct(rev(S, biz), 0.25), mixedRevenue: pct(rev(S, biz), 0.05), panRevenue: -pct(rev(S, biz), 0.12) } };
    }
  },
  {
    id: 'food_enter_competition', group: 'food', label: (S, biz) => biz?.typeId === 'bakery' ? 'Enter a baking competition' : biz?.typeId === 'roastery_chain' ? 'Enter a barista competition' : 'Enter a cooking competition',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `The result comes next month. Win: +${fmt(S, pct(rev(S, biz), 0.30))} revenue that month, repeat customers +12%. Placed: +${fmt(S, pct(rev(S, biz), 0.10))} revenue, repeat customers +5%. Lose: no extra revenue, repeat customers −3%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'food_enter_competition')) return { ok: false, reason: 'You are already entered in a competition — wait for the result.' };
      const cd = cooldownLeft(S, biz, 'food_enter_competition', 12);
      if (cd > 0) return { ok: false, reason: `Competitions run once a year — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, this.label(S, biz)); if (!ch.ok) return ch;
      markUsed(S, biz, 'food_enter_competition');
      addOneshot(S, biz, 'food_enter_competition', 'Cooking competition', { force: opts.force || null });
      const promised = 'The result comes next month — a win, a placing, or a loss — and revenue and repeat customers move with it.';
      logDecision(S, biz, 'food_enter_competition', this.label(S, biz), `Entered ${biz.name} in a competition for ${fmt(S, c)}. The result comes next month.`);
      return { ok: true, msg: `${biz.name} is entered in a competition. ${promised}`, promised, promisedNumbers: { outcome: 'result next month', winRevenue: pct(rev(S, biz), 0.30), placeRevenue: pct(rev(S, biz), 0.10), loseRevenue: 0 } };
    }
  },
  {
    id: 'food_launch_delivery', group: 'food', label: () => 'Launch delivery',
    cost: (S, biz) => Math.max(1000, pct(rev(S, biz), 0.12)),
    effectText: (S, biz) => `Delivery riders and packaging: +${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 12 months, but +${fmt(S, pct(costBase(S, biz), 0.04))} costs a month for the same 12 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'food_launch_delivery')) return { ok: false, reason: 'Delivery is already running.' };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Launch delivery'); if (!ch.ok) return ch;
      markUsed(S, biz, 'food_launch_delivery');
      addSlice(S, biz, 'food_launch_delivery', 'Delivery service', { months: 12, monthlyRevenue: pct(rev(S, biz), 0.15), monthlyCost: pct(costBase(S, biz), 0.04) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.15))} revenue and +${fmt(S, pct(costBase(S, biz), 0.04))} costs a month for 12 months.`;
      logDecision(S, biz, 'food_launch_delivery', 'Launch delivery', `Launched delivery at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Delivery is live at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.15), costDelta: pct(costBase(S, biz), 0.04), repeatRateDelta: 0, months: 12 } };
    }
  },
  {
    id: 'food_launch_catering', group: 'food', label: (S, biz) => biz?.typeId === 'roastery_chain' ? 'Supply offices and cafés wholesale' : 'Launch catering',
    cost: (S, biz) => Math.max(1000, pct(rev(S, biz), 0.20)),
    effectText: (S, biz) => biz?.typeId === 'roastery_chain'
      ? `Beans and brewed coffee supplied to offices and cafés: +${fmt(S, pct(rev(S, biz), 0.20))} revenue a month for 6 months, but +${fmt(S, pct(costBase(S, biz), 0.08))} costs a month (beans, delivery, cups) for the same 6 months.`
      : `Weddings and company lunches: +${fmt(S, pct(rev(S, biz), 0.20))} revenue a month for 6 months, but +${fmt(S, pct(costBase(S, biz), 0.08))} costs a month for the same 6 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'food_launch_catering')) return { ok: false, reason: 'Catering is already running.' };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, this.label(S, biz)); if (!ch.ok) return ch;
      markUsed(S, biz, 'food_launch_catering');
      addSlice(S, biz, 'food_launch_catering', biz?.typeId === 'roastery_chain' ? 'Wholesale supply' : 'Catering service', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.20), monthlyCost: pct(costBase(S, biz), 0.08) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.20))} revenue and +${fmt(S, pct(costBase(S, biz), 0.08))} costs a month for 6 months.`;
      logDecision(S, biz, 'food_launch_catering', this.label(S, biz), `Launched catering at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `${biz?.typeId === 'roastery_chain' ? 'Wholesale supply is live' : 'Catering is live'} at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.20), costDelta: pct(costBase(S, biz), 0.08), repeatRateDelta: 0, months: 6 } };
    }
  },

  /* ================= FRUIT STALL (v2.20 I2, W2 §2) =================
     The fruit stall's own decisions — no menu, no dishes, no critic,
     no cooking competition, no catering. Costs are quoted at the W2
     anchor (capital 47,500 EGP, base monthly revenue 20,900 EGP,
     other costs 7,600 EGP) and scale with the stall's actual takings
     via fruitCost(). food_train_staff is reused below under its
     fruit-stall name ("Teach the boy the trade") — it is listed in
     TYPE_OVERRIDES, not here. */
  {
    id: 'fruit_morning_wholesale', group: 'food', label: () => 'Morning wholesale run',
    cost: (S, biz) => fruitCost(S, biz, 2500),
    effectText: (S, biz) => `Up at dawn for the wholesale market, first pick of the day's fruit: +${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 2 months, repeat customers +2%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'fruit_morning_wholesale')) return { ok: false, reason: 'The wholesale run is still paying off — wait until it ends.' };
      const cd = cooldownLeft(S, biz, 'fruit_morning_wholesale', 2);
      if (cd > 0) return { ok: false, reason: `You just did a wholesale run — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Morning wholesale run'); if (!ch.ok) return ch;
      markUsed(S, biz, 'fruit_morning_wholesale');
      addSlice(S, biz, 'fruit_morning_wholesale', 'Wholesale run', { months: 2, monthlyRevenue: pct(rev(S, biz), 0.12), monthlyRepeat: 0.02 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 2 months, repeat customers +2%.`;
      logDecision(S, biz, 'fruit_morning_wholesale', 'Morning wholesale run', `Did the dawn wholesale run for ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `First pick of the day's fruit at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.12), costDelta: 0, repeatRateDelta: 0.02, months: 2 } };
    }
  },
  {
    id: 'fruit_seasonal', group: 'food', label: () => "Put the season's fruit forward",
    cost: (S, biz) => fruitCost(S, biz, 1800),
    effectText: (S, biz) => `Whatever is in season, front and centre, at its best price: +${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 3 months, repeat customers +3%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'fruit_seasonal')) return { ok: false, reason: 'The seasonal display is still running.' };
      const cd = cooldownLeft(S, biz, 'fruit_seasonal', 3);
      if (cd > 0) return { ok: false, reason: `The season was just featured — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, "Put the season's fruit forward"); if (!ch.ok) return ch;
      markUsed(S, biz, 'fruit_seasonal');
      addSlice(S, biz, 'fruit_seasonal', 'Seasonal fruit forward', { months: 3, monthlyRevenue: pct(rev(S, biz), 0.15), monthlyRepeat: 0.03 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 3 months, repeat customers +3%.`;
      logDecision(S, biz, 'fruit_seasonal', "Put the season's fruit forward", `Put the season's fruit forward at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `The season's fruit is front and centre at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.15), costDelta: 0, repeatRateDelta: 0.03, months: 3 } };
    }
  },
  {
    id: 'fruit_better_corner', group: 'food', label: () => 'Move to a better corner',
    cost: (S, biz) => fruitCost(S, biz, 4000),
    effectText: (S, biz) => `A corner with real foot traffic — near the mosque gate, the school, the market entrance: +${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 6 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'fruit_better_corner')) return { ok: false, reason: 'You just moved the stall — the new corner is still paying off.' };
      const cd = cooldownLeft(S, biz, 'fruit_better_corner', 12);
      if (cd > 0) return { ok: false, reason: `You moved recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Move to a better corner'); if (!ch.ok) return ch;
      markUsed(S, biz, 'fruit_better_corner');
      addSlice(S, biz, 'fruit_better_corner', 'Better corner', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.15) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 6 months.`;
      logDecision(S, biz, 'fruit_better_corner', 'Move to a better corner', `Moved ${biz.name} to a better corner for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `${biz.name} moved to a better corner. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.15), costDelta: 0, repeatRateDelta: 0, months: 6 } };
    }
  },
  {
    id: 'fruit_spoilage', group: 'food', label: () => 'Beat the spoilage',
    cost: (S, biz) => fruitCost(S, biz, 1500),
    effectText: (S, biz) => `Shade, ice, and selling the soft fruit first instead of last: ${fmt(S, pct(costBase(S, biz), 0.15))} LESS in other costs a month for 6 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'fruit_spoilage')) return { ok: false, reason: 'The spoilage measures are already in place.' };
      const cd = cooldownLeft(S, biz, 'fruit_spoilage', 6);
      if (cd > 0) return { ok: false, reason: `Spoilage was just tackled — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Beat the spoilage'); if (!ch.ok) return ch;
      markUsed(S, biz, 'fruit_spoilage');
      addSlice(S, biz, 'fruit_spoilage', 'Spoilage measures', { months: 6, monthlyRevenue: 0, monthlyCost: -pct(costBase(S, biz), 0.15) });
      const promised = `${fmt(S, pct(costBase(S, biz), 0.15))} less in other costs a month for 6 months.`;
      logDecision(S, biz, 'fruit_spoilage', 'Beat the spoilage', `Put spoilage measures in at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Less fruit thrown away at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: 0, costDelta: -pct(costBase(S, biz), 0.15), repeatRateDelta: 0, months: 6 } };
    }
  },
  {
    id: 'fruit_regulars_box', group: 'food', label: () => "Regulars' weekly box",
    cost: (S, biz) => fruitCost(S, biz, 1000),
    effectText: (S, biz) => `A weekly box for the regulars — picked, weighed, waiting for them: +${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +6%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'fruit_regulars_box')) return { ok: false, reason: 'The weekly box is already running.' };
      const cd = cooldownLeft(S, biz, 'fruit_regulars_box', 6);
      if (cd > 0) return { ok: false, reason: `The regulars' box just ran — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, "Regulars' weekly box"); if (!ch.ok) return ch;
      markUsed(S, biz, 'fruit_regulars_box');
      addSlice(S, biz, 'fruit_regulars_box', "Regulars' weekly box", { months: 6, monthlyRevenue: pct(rev(S, biz), 0.08), monthlyRepeat: 0.06 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +6%.`;
      logDecision(S, biz, 'fruit_regulars_box', "Regulars' weekly box", `Started the regulars' weekly box at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `The regulars' weekly box is running at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.08), costDelta: 0, repeatRateDelta: 0.06, months: 6 } };
    }
  },
  {
    id: 'fruit_price_board', group: 'food', label: () => 'Prices on a board, honest scales',
    cost: (S, biz) => fruitCost(S, biz, 500),
    effectText: (S, biz) => `Every price written on a board where everyone can see it, and scales that weigh true: repeat customers +4% for good — people come back to a stall they trust — and +${fmt(S, pct(rev(S, biz), 0.05))} revenue a month for 3 months.`,
    available: (S, biz) => {
      const cd = cooldownLeft(S, biz, 'fruit_price_board', 12);
      if (cd > 0) return { ok: false, reason: `The board is already up and the scales are honest — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Prices on a board, honest scales'); if (!ch.ok) return ch;
      markUsed(S, biz, 'fruit_price_board');
      /* v2.20 I2 — the +4% repeat is persistent: it lands on
         biz.repeatRate itself, like the rare-item fake penalty, not
         on a slice that expires. */
      biz.repeatRate = clamp((Number(biz.repeatRate ?? 0.5)) + 0.04, 0, 1);
      addSlice(S, biz, 'fruit_price_board', 'Price board, honest scales', { months: 3, monthlyRevenue: pct(rev(S, biz), 0.05) });
      const promised = `Repeat customers +4% for good, +${fmt(S, pct(rev(S, biz), 0.05))} revenue a month for 3 months.`;
      logDecision(S, biz, 'fruit_price_board', 'Prices on a board, honest scales', `Put the prices on a board and fixed the scales at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Prices on a board, honest scales at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.05), costDelta: 0, repeatRateDelta: 0.04, months: 3, repeatPersistent: true } };
    }
  },
  {
    id: 'fruit_bicycle_delivery', group: 'food', label: () => 'Bicycle delivery to the street',
    cost: (S, biz) => fruitCost(S, biz, 1800),
    effectText: (S, biz) => `A boy on a bicycle with a crate, delivering to the street and the flats nearby: +${fmt(S, pct(rev(S, biz), 0.10))} revenue a month for 6 months, but +${fmt(S, pct(costBase(S, biz), 0.05))} other costs a month for the same 6 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'fruit_bicycle_delivery')) return { ok: false, reason: 'Bicycle delivery is already running.' };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Bicycle delivery to the street'); if (!ch.ok) return ch;
      markUsed(S, biz, 'fruit_bicycle_delivery');
      addSlice(S, biz, 'fruit_bicycle_delivery', 'Bicycle delivery', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.10), monthlyCost: pct(costBase(S, biz), 0.05) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.10))} revenue and +${fmt(S, pct(costBase(S, biz), 0.05))} other costs a month for 6 months.`;
      logDecision(S, biz, 'fruit_bicycle_delivery', 'Bicycle delivery to the street', `Started bicycle delivery at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Bicycle delivery is running from ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.10), costDelta: pct(costBase(S, biz), 0.05), repeatRateDelta: 0, months: 6 } };
    }
  },

  /* ================= STARTUP / TECH (9) ================= */
  {
    id: 'tech_advance_stage', group: 'tech', label: (S, biz) => {
      const cur = startupStageOf(biz);
      if (cur === 'concept') return 'Build the MVP (Concept → MVP)';
      if (cur === 'mvp') return 'Open the Beta (MVP → Beta)';
      if (cur === 'beta') return 'Launch the product (Beta → Launch)';
      return 'Launch the product (already launched)';
    },
    cost: (S, biz) => Math.max(1000, pct(capital(S, biz), stageCostFrac(startupStageOf(biz)))),
    effectText(S, biz) {
      const cur = startupStageOf(biz);
      if (cur === 'launched') return 'The product is already launched — there is no next stage.';
      const next = STARTUP_STAGES[stageIndex(biz) + 1];
      if (next === 'launched') return `Launch month: costs ${fmt(S, this.cost(S, biz))}. A launch can FLOP (25% chance) — a flop means revenue ×0.35 for 6 months and repeat customers −10%. A hit means +20% revenue for 6 months and repeat customers +8%. Before launch, revenue stays near zero (×0.08) because the product is not selling yet.`;
      return `Move from ${STARTUP_STAGE_LABELS[cur]} to ${STARTUP_STAGE_LABELS[next]} for ${fmt(S, this.cost(S, biz))}. Revenue stays near zero (×0.08) until Launch.`;
    },
    available: (S, biz) => {
      if (startupStageOf(biz) === 'launched') return { ok: false, reason: 'The product is already launched.' };
      const cd = cooldownLeft(S, biz, 'tech_advance_stage', 1);
      if (cd > 0) return { ok: false, reason: 'One stage per month — the team is still building.' };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const cur = startupStageOf(biz);
      if (cur === 'launched') return { ok: false, msg: 'The product is already launched.' };
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, `Build stage (${STARTUP_STAGE_LABELS[cur]} → ${STARTUP_STAGE_LABELS[STARTUP_STAGES[stageIndex(biz) + 1]]})`); if (!ch.ok) return ch;
      markUsed(S, biz, 'tech_advance_stage');
      const next = STARTUP_STAGES[stageIndex(biz) + 1];
      biz.startupStage = next;
      if (next === 'launched') {
        const flop = opts.force === 'flop' ? true : opts.force === 'hit' ? false : rand(S) < 0.25;
        biz.launchOutcome = flop ? 'flopped' : 'hit';
        if (flop) {
          addSlice(S, biz, 'tech_advance_stage', 'Flopped launch', { months: 6, monthlyRevenue: 0, monthlyRepeat: -0.1, revenueMult: 0.35 });
          logDecision(S, biz, 'tech_advance_stage', 'Launch the product', `${biz.name} launched — and it FLOPPED. Nobody came. Revenue is ×0.35 for 6 months and repeat customers fell 10%. The launch cost ${fmt(S, c)}.`);
          return { ok: true, msg: `${biz.name} launched, but it flopped — revenue ×0.35 for 6 months, repeat customers −10%.`, promised: 'Revenue ×0.35 for 6 months, repeat customers −10%.', promisedNumbers: { revenueMult: 0.35, repeatRateDelta: -0.1, months: 6, outcome: 'flop' } };
        }
        addSlice(S, biz, 'tech_advance_stage', 'Successful launch', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.20), monthlyRepeat: 0.08 });
        logDecision(S, biz, 'tech_advance_stage', 'Launch the product', `${biz.name} LAUNCHED and it landed — +${fmt(S, pct(rev(S, biz), 0.20))} revenue a month for 6 months, repeat customers +8%. The launch cost ${fmt(S, c)}.`);
        return { ok: true, msg: `${biz.name} launched and it landed! +${fmt(S, pct(rev(S, biz), 0.20))} revenue a month for 6 months, repeat customers +8%.`, promised: `+${fmt(S, pct(rev(S, biz), 0.20))} revenue a month for 6 months, repeat customers +8%.`, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.20), costDelta: 0, repeatRateDelta: 0.08, months: 6, outcome: 'hit' } };
      }
      logDecision(S, biz, 'tech_advance_stage', `Build stage (${STARTUP_STAGE_LABELS[cur]} → ${STARTUP_STAGE_LABELS[next]})`, `${biz.name} moved from ${STARTUP_STAGE_LABELS[cur]} to ${STARTUP_STAGE_LABELS[next]} for ${fmt(S, c)}. Still pre-revenue — revenue stays near zero until Launch.`);
      return { ok: true, msg: `${biz.name} is now at ${STARTUP_STAGE_LABELS[next]}. Still pre-revenue — revenue stays near zero (×0.08) until Launch.`, promised: `Stage ${STARTUP_STAGE_LABELS[next]}; revenue stays near zero (×0.08) until Launch.`, promisedNumbers: { revenueMult: 0.08, outcome: next } };
    }
  },
  ...Object.entries(FUNDING_ROUNDS).map(([id, round]) => ({
    id, group: 'tech',
    label: () => `Raise a ${round.label}`,
    cost: (S, biz) => Math.max(500, pct(pct(capital(S, biz), round.raiseFrac), 0.02)),
    effectText(S, biz) {
      const raise = pct(capital(S, biz), round.raiseFrac);
      return `Investors put in ${fmt(S, raise)} cash, but you give away ${round.dilution}% of the company — your share falls from ${Math.round(biz.equityOwned ?? 100)}% to ${Math.max(0, Math.round(biz.equityOwned ?? 100) - round.dilution)}%. Legal fees ${fmt(S, this.cost(S, biz))}. The money funds growth: +${fmt(S, pct(rev(S, biz), 0.10))} revenue a month for 6 months, repeat customers +3%.`;
    },
    available: (S, biz) => {
      if (biz.fundingRounds?.[round.key]) return { ok: false, reason: `The ${round.label} is already raised — each round happens once.` };
      if (stageIndex(biz) < round.minStage) return { ok: false, reason: `The ${round.label} needs the product at ${STARTUP_STAGE_LABELS[STARTUP_STAGES[round.minStage]]} or later (now: ${STARTUP_STAGE_LABELS[startupStageOf(biz)]}).` };
      if ((biz.equityOwned ?? 100) - round.dilution < 5) return { ok: false, reason: 'You would own almost nothing left — no investor round is worth that.' };
      return { ok: true };
    },
    apply(S, biz) {
      const raise = pct(capital(S, biz), round.raiseFrac);
      const fee = this.cost(S, biz);
      if ((Number(S.money?.cash) || 0) < fee) return { ok: false, msg: `Need ${fmt(S, fee)} in cash for the ${round.label} legal fees.` };
      biz.fundingRounds[round.key] = { year: S.year, month: S.month, raise, dilution: round.dilution };
      biz.equityOwned = Math.max(0, Math.round((biz.equityOwned ?? 100) - round.dilution));
      walletMove(S, raise, `${biz.name} — ${round.label} investment in`, 'business');
      if (fee > 0) walletMove(S, -fee, `${biz.name} — ${round.label} legal fees`, 'business');
      markUsed(S, biz, id);
      addSlice(S, biz, id, round.label, { months: 6, monthlyRevenue: pct(rev(S, biz), 0.10), monthlyRepeat: 0.03 });
      const promised = `${fmt(S, raise)} cash in, your share now ${Math.round(biz.equityOwned)}%, +${fmt(S, pct(rev(S, biz), 0.10))} revenue a month for 6 months, repeat customers +3%.`;
      logDecision(S, biz, id, round.label, `Raised a ${round.label} for ${biz.name}: ${fmt(S, raise)} in, ${round.dilution}% of the company given away — you now own ${Math.round(biz.equityOwned)}%. Legal fees ${fmt(S, fee)}.`);
      return { ok: true, msg: `${round.label} closed for ${biz.name}. ${promised}`, promised, promisedNumbers: { cashIn: raise, legalFee: fee, equityOwned: biz.equityOwned, dilution: round.dilution, revenueDelta: pct(rev(S, biz), 0.10), months: 6 } };
    }
  })),
  {
    id: 'tech_add_cofounder', group: 'tech', label: () => 'Bring in a co-founder',
    cost: (S, biz) => Math.max(300, pct(rev(S, biz), 0.02)),
    effectText(S, biz) { return `A named co-founder joins with 20% of the company — your share falls from ${Math.round(biz.equityOwned ?? 100)}% to ${Math.max(0, Math.round(biz.equityOwned ?? 100) - 20)}%. They work beside you, and they can disagree with you later (a real decision either way). Legal agreement ${fmt(S, this.cost(S, biz))}.`; },
    available: (S, biz) => {
      if (biz.cofounder) return { ok: false, reason: `You already have a co-founder (${biz.cofounder.name}).` };
      if ((biz.equityOwned ?? 100) <= 20) return { ok: false, reason: 'You do not own enough of the company left to give a co-founder 20%.' };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Co-founder agreement'); if (!ch.ok) return ch;
      const name = personName(S, biz);
      biz.cofounder = { id: nextId(S, 'cof'), name, equityPct: 20, skill: 55 + Math.floor(rand(S) * 35), joinedYear: S.year, joinedMonth: S.month };
      biz.equityOwned = Math.max(0, Math.round((biz.equityOwned ?? 100) - 20));
      markUsed(S, biz, 'tech_add_cofounder');
      logDecision(S, biz, 'tech_add_cofounder', 'Bring in a co-founder', `${name} joined ${biz.name} as co-founder with 20% of the company. You now own ${Math.round(biz.equityOwned)}%. The agreement cost ${fmt(S, c)}.`);
      return { ok: true, msg: `${name} is now your co-founder at ${biz.name} (20% equity). You own ${Math.round(biz.equityOwned)}%.`, promised: `${name} holds 20% and works beside you; they may disagree with you, and that will be a real decision.`, promisedNumbers: { equityOwned: biz.equityOwned, cofounderEquity: 20 } };
    }
  },
  {
    id: 'tech_disagree_side', group: 'tech', label: () => 'Co-founder disagrees — side with them',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText(S, biz) { return `Your co-founder ${biz.cofounder ? biz.cofounder.name : ''} wants to change direction. Side with them: it costs ${fmt(S, this.cost(S, biz))} to rebuild their way, but the team pulls together — +${fmt(S, pct(rev(S, biz), 0.05))} revenue a month for 3 months, repeat customers +2%, and the co-founder stays.`; },
    available: (S, biz) => {
      if (!biz.cofounder) return { ok: false, reason: 'You have no co-founder to disagree with.' };
      if (activeEffect(biz, 'tech_disagree_side') || activeEffect(biz, 'tech_disagree_overrule')) return { ok: false, reason: 'A disagreement is already being settled.' };
      const cd = cooldownLeft(S, biz, 'tech_disagree_side', 6);
      if (cd > 0) return { ok: false, reason: `You settled a disagreement recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      if (!biz.cofounder) return { ok: false, msg: 'You have no co-founder to disagree with.' };
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Side with co-founder'); if (!ch.ok) return ch;
      markUsed(S, biz, 'tech_disagree_side');
      addSlice(S, biz, 'tech_disagree_side', 'Co-founder direction', { months: 3, monthlyRevenue: pct(rev(S, biz), 0.05), monthlyRepeat: 0.02 });
      logDecision(S, biz, 'tech_disagree_side', 'Co-founder disagreement — sided with them', `You sided with ${biz.cofounder.name} at ${biz.name} and paid ${fmt(S, c)} to rebuild their way. The team pulled together.`);
      return { ok: true, msg: `You sided with ${biz.cofounder.name}. +${fmt(S, pct(rev(S, biz), 0.05))} revenue a month for 3 months, repeat customers +2%.`, promised: `+${fmt(S, pct(rev(S, biz), 0.05))} revenue a month for 3 months, repeat customers +2%; the co-founder stays.`, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.05), costDelta: 0, repeatRateDelta: 0.02, months: 3 } };
    }
  },
  {
    id: 'tech_disagree_overrule', group: 'tech', label: () => 'Co-founder disagrees — overrule them',
    cost: () => 0,
    effectText: (S, biz) => `Overrule your co-founder ${biz.cofounder ? biz.cofounder.name : ''}. It costs nothing now — but there is a 40% chance they quit next month. If they quit: −${fmt(S, pct(rev(S, biz), 0.10))} revenue a month for 3 months, repeat customers −5%, and their 20% stays with them. If they stay, nothing changes.`,
    available: (S, biz) => {
      if (!biz.cofounder) return { ok: false, reason: 'You have no co-founder to disagree with.' };
      if (activeEffect(biz, 'tech_disagree_side') || activeEffect(biz, 'tech_disagree_overrule')) return { ok: false, reason: 'A disagreement is already being settled.' };
      const cd = cooldownLeft(S, biz, 'tech_disagree_overrule', 6);
      if (cd > 0) return { ok: false, reason: `You settled a disagreement recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      if (!biz.cofounder) return { ok: false, msg: 'You have no co-founder to disagree with.' };
      markUsed(S, biz, 'tech_disagree_overrule');
      addOneshot(S, biz, 'tech_disagree_overrule', 'Co-founder overruled', { force: opts.force || null, cofounderName: biz.cofounder.name, cofounderEquity: biz.cofounder.equityPct || 20 });
      logDecision(S, biz, 'tech_disagree_overrule', 'Co-founder disagreement — overruled them', `You overruled ${biz.cofounder.name} at ${biz.name}. They will decide next month whether they stay or walk out.`);
      return { ok: true, msg: `You overruled ${biz.cofounder.name}. Next month you find out whether they stay or quit (40% quit).`, promised: 'Next month: 40% chance the co-founder quits (−10% revenue a month for 3 months, repeat customers −5%); otherwise they stay and nothing changes.', promisedNumbers: { outcome: 'resolved next month', quitRevenue: -pct(rev(S, biz), 0.10), quitRepeatRate: -0.05 } };
    }
  },
  {
    id: 'tech_paid_acquisition', group: 'tech', label: () => 'Run paid user acquisition',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.10)),
    effectText: (S, biz) => `Ads and promos to buy users: +${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 3 months. The users may not stay — the lift ends after 3 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'tech_paid_acquisition')) return { ok: false, reason: 'A paid acquisition campaign is already running.' };
      const cd = cooldownLeft(S, biz, 'tech_paid_acquisition', 3);
      if (cd > 0) return { ok: false, reason: `Ads were recent — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Paid user acquisition'); if (!ch.ok) return ch;
      markUsed(S, biz, 'tech_paid_acquisition');
      addSlice(S, biz, 'tech_paid_acquisition', 'Paid acquisition', { months: 3, monthlyRevenue: pct(rev(S, biz), 0.12) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 3 months.`;
      logDecision(S, biz, 'tech_paid_acquisition', 'Run paid user acquisition', `Ran paid ads for ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Ads are running for ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.12), costDelta: 0, repeatRateDelta: 0, months: 3 } };
    }
  },

  /* ================= SOFTWARE CONSULTANCY (v2.20 I2, W2 §3) ==============
     A consultancy is not a startup: no MVP stages, no funding rounds.
     It wins retainer clients and hires senior developers. */
  {
    id: 'consult_win_retainer', group: 'tech', label: () => 'Win a retainer client',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `One named client on a 6-month retainer: +${fmt(S, pct(rev(S, biz), 0.30))} revenue a month for 6 months. The risk is real — when the retainer ends there is a 30% chance they leave, and losing them costs −${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 2 months and repeat customers −4%.`,
    available: (S, biz) => {
      if (biz.bigClient) return { ok: false, reason: `You already serve a retainer client (${biz.bigClient.org}) — one at a time.` };
      const cd = cooldownLeft(S, biz, 'consult_win_retainer', 3);
      if (cd > 0) return { ok: false, reason: `A retainer client just left — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Win a retainer client'); if (!ch.ok) return ch;
      const org = `${pickFamilyName(biz.country || S.country, () => rand(S))} Group`;
      const contact = personName(S, biz);
      const termEnd = nowIdx(S) + 6;
      biz.bigClient = { org, contact, termEndMonth: termEnd };
      markUsed(S, biz, 'consult_win_retainer');
      const eff = addSlice(S, biz, 'consult_win_retainer', `Retainer client — ${org}`, { months: 6, monthlyRevenue: pct(rev(S, biz), 0.30) });
      eff.kind = 'client'; eff.termEndMonth = termEnd; eff.data = { org, contact, force: opts.force || null };
      const promised = `+${fmt(S, pct(rev(S, biz), 0.30))} revenue a month for 6 months from ${org}. At the end of the retainer, a 30% chance they leave (−${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 2 months, repeat customers −4%).`;
      logDecision(S, biz, 'consult_win_retainer', 'Win a retainer client', `Won ${org} (contact ${contact}) as a retainer client at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `${org} is now a retainer client of ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.30), costDelta: 0, repeatRateDelta: 0, months: 6, leaveChance: 0.30, leaveRevenue: -pct(rev(S, biz), 0.15) } };
    }
  },
  {
    id: 'consult_hire_senior', group: 'tech', label: () => 'Hire a senior developer',
    cost: (S, biz) => Math.round(monthlyMidSalary(S, biz.country || S.country) * 1.2),
    effectText(S, biz) { return `A named senior developer everyone in the trade knows joins the team (skill 85–95, wage ${fmt(S, this.cost(S, biz))}/month — onboarding costs one month's wage, like any hire). They ship real work: +${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 6 months, repeat customers +4%.`; },
    available: (S, biz) => {
      if ((biz.staff || []).length >= 12) return { ok: false, reason: 'The team is already at the maximum of 12.' };
      const cd = cooldownLeft(S, biz, 'consult_hire_senior', 6);
      if (cd > 0) return { ok: false, reason: `You hired a senior developer recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const wage = this.cost(S, biz);
      const ch = chargeCost(S, biz, wage, 'Hire a senior developer (onboarding)'); if (!ch.ok) return ch;
      const name = personName(S, biz);
      const star = { id: nextId(S, 'bstaff'), name, role: 'developer', wageLocal: wage, morale: 75, skill: 85 + Math.floor(rand(S) * 11), hiredYear: S.year, hiredMonth: S.month, fit: 'good', star: true };
      biz.staff.push(star);
      biz.employees = biz.staff.length;
      markUsed(S, biz, 'consult_hire_senior');
      addSlice(S, biz, 'consult_hire_senior', 'Senior developer', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.15), monthlyRepeat: 0.04 });
      const promised = `${name} ships real work: +${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 6 months, repeat customers +4%. Their wage (${fmt(S, wage)}/month) is in the monthly payroll from now on.`;
      logDecision(S, biz, 'consult_hire_senior', 'Hire a senior developer', `Hired ${name}, a senior developer, at ${biz.name} for ${fmt(S, wage)}/month (onboarding ${fmt(S, wage)}). ${promised}`);
      return { ok: true, msg: `${name} (senior developer) joined ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.15), costDelta: 0, repeatRateDelta: 0.04, months: 6, starWage: wage, starName: name } };
    }
  },

  /* ================= RETAIL & TRADE (6) ================= */
  {
    id: 'retail_buy_stock', group: 'retail', label: (S, biz) => biz?.typeId === 'salon' ? 'Stock products & consumables' : biz?.typeId === 'cyber_cafe' ? 'Upgrade PCs — add consoles' : biz?.typeId === 'radio_repair' ? 'Buy spare parts & stock' : 'Buy stock',
    cost: (S, biz) => Math.max(500, pct(costBase(S, biz), 0.30)),
    effectText: (S, biz) => biz?.typeId === 'salon'
      ? `Shelves full of products and consumables, nothing running out mid-appointment: +${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 2 months.`
      : biz?.typeId === 'cyber_cafe'
        ? `Faster PCs and a console corner: +${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 2 months, because the machines are why they come.`
        : `Fill the shelves: +${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 2 months, because full shelves sell.`,
    available: (S, biz) => {
      const cd = cooldownLeft(S, biz, 'retail_buy_stock', 2);
      if (cd > 0) return { ok: false, reason: `You just stocked up — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Buy stock'); if (!ch.ok) return ch;
      markUsed(S, biz, 'retail_buy_stock');
      addSlice(S, biz, 'retail_buy_stock', 'Fresh stock', { months: 2, monthlyRevenue: pct(rev(S, biz), 0.12) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 2 months.`;
      logDecision(S, biz, 'retail_buy_stock', 'Buy stock', `Bought ${fmt(S, c)} of stock for ${biz.name} — ${promised}`);
      return { ok: true, msg: `Shelves filled at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.12), costDelta: 0, repeatRateDelta: 0, months: 2 } };
    }
  },
  {
    id: 'retail_supplier_cheap', group: 'retail', label: (S, biz) => biz?.typeId === 'video_rental' ? 'Switch tape distributor' : biz?.typeId === 'cyber_cafe' ? 'Cheaper, faster internet line' : 'Switch to a cheap supplier',
    cost: (S, biz) => Math.max(300, pct(costBase(S, biz), 0.02)),
    effectText: (S, biz) => `${biz?.typeId === 'cyber_cafe' ? 'The cheaper line costs' : biz?.typeId === 'video_rental' ? 'Cheaper tapes cost' : 'Cheap stock costs'} ${fmt(S, pct(costBase(S, biz), 0.15))} LESS a month for 3 months — but there is a 35% chance a bad batch lands next month: repeat customers −10% and −${fmt(S, pct(rev(S, biz), 0.08))} revenue that month. You are told which it was.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'retail_supplier_cheap') || activeEffect(biz, 'retail_supplier_reliable')) return { ok: false, reason: 'You already switched supplier recently — the current deal is still running.' };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, this.label(S, biz)); if (!ch.ok) return ch;
      markUsed(S, biz, 'retail_supplier_cheap');
      addSlice(S, biz, 'retail_supplier_cheap', 'Cheap supplier', { months: 3, monthlyRevenue: 0, monthlyCost: -pct(costBase(S, biz), 0.15) });
      addOneshot(S, biz, 'retail_supplier_cheap', 'Cheap supplier batch check', { force: opts.force || null });
      const promised = `Costs ${fmt(S, pct(costBase(S, biz), 0.15))} less a month for 3 months; next month you find out whether the batch was good or bad (35% bad: repeat customers −10%, −${fmt(S, pct(rev(S, biz), 0.08))} revenue).`;
      logDecision(S, biz, 'retail_supplier_cheap', 'Switch to a cheap supplier', `Switched ${biz.name} to a cheap supplier for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `${biz.name} is on the cheap supplier. ${promised}`, promised, promisedNumbers: { costDelta: -pct(costBase(S, biz), 0.15), months: 3, badBatchChance: 0.35, badRepeatRate: -0.1, badRevenue: -pct(rev(S, biz), 0.08) } };
    }
  },
  {
    id: 'retail_supplier_reliable', group: 'retail', label: (S, biz) => biz?.typeId === 'video_rental' ? 'Switch tape distributor' : biz?.typeId === 'cyber_cafe' ? 'Cheaper, faster internet line' : 'Switch to a reliable supplier',
    cost: (S, biz) => Math.max(300, pct(costBase(S, biz), 0.05)),
    effectText: (S, biz) => `${biz?.typeId === 'cyber_cafe' ? 'A fast, steady line, no dropouts:' : biz?.typeId === 'video_rental' ? 'Good tapes, no surprises:' : 'Good stock, no surprises:'} costs ${fmt(S, pct(costBase(S, biz), 0.05))} MORE a month for 3 months, but +${fmt(S, pct(rev(S, biz), 0.04))} revenue a month for 3 months because the quality sells, and repeat customers +3%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'retail_supplier_cheap') || activeEffect(biz, 'retail_supplier_reliable')) return { ok: false, reason: 'You already switched supplier recently — the current deal is still running.' };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, this.label(S, biz)); if (!ch.ok) return ch;
      markUsed(S, biz, 'retail_supplier_reliable');
      addSlice(S, biz, 'retail_supplier_reliable', 'Reliable supplier', { months: 3, monthlyRevenue: pct(rev(S, biz), 0.04), monthlyCost: pct(costBase(S, biz), 0.05), monthlyRepeat: 0.03 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.04))} revenue and +${fmt(S, pct(costBase(S, biz), 0.05))} costs a month for 3 months, repeat customers +3%.`;
      logDecision(S, biz, 'retail_supplier_reliable', 'Switch to a reliable supplier', `Switched ${biz.name} to a reliable supplier for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `${biz.name} is on the reliable supplier. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.04), costDelta: pct(costBase(S, biz), 0.05), repeatRateDelta: 0.03, months: 3 } };
    }
  },
  {
    id: 'retail_run_sale', group: 'retail', label: (S, biz) => biz?.typeId === 'cyber_cafe' ? 'Happy-hour pricing' : 'Run a sale',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => biz?.typeId === 'cyber_cafe'
      ? `Happy hours every evening: +${fmt(S, pct(rev(S, biz), 0.25))} revenue next month — but it pulls demand forward, so the month after is −${fmt(S, pct(rev(S, biz), 0.05))} revenue.`
      : `A sale weekend: +${fmt(S, pct(rev(S, biz), 0.25))} revenue next month — but it pulls demand forward, so the month after is −${fmt(S, pct(rev(S, biz), 0.05))} revenue.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'retail_run_sale')) return { ok: false, reason: 'A sale is already running.' };
      const cd = cooldownLeft(S, biz, 'retail_run_sale', 3);
      if (cd > 0) return { ok: false, reason: `Sales too often train customers to wait — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Run a sale'); if (!ch.ok) return ch;
      markUsed(S, biz, 'retail_run_sale');
      addSlice(S, biz, 'retail_run_sale', 'Sale weekend', { months: 1, monthlyRevenue: pct(rev(S, biz), 0.25), delayMonths: 1 });
      addSlice(S, biz, 'retail_run_sale', 'Post-sale dip', { months: 1, monthlyRevenue: -pct(rev(S, biz), 0.05), delayMonths: 2 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.25))} revenue next month, then −${fmt(S, pct(rev(S, biz), 0.05))} revenue the month after.`;
      logDecision(S, biz, 'retail_run_sale', 'Run a sale', `Ran a sale at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Sale on at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.25), nextMonthRevenueDelta: -pct(rev(S, biz), 0.05), months: 1 } };
    }
  },
  {
    id: 'retail_appraise_rare', group: 'retail', label: (S, biz) => biz?.typeId === 'textile_workshop' ? 'Buy a rare fabric lot' : biz?.typeId === 'video_rental' ? 'Rare VHS — collectors\' tape' : 'Appraise and buy a rare item',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.03)),
    effectText(S, biz) {
      const what = biz?.typeId === 'textile_workshop' ? 'fabric lot' : biz?.typeId === 'video_rental' ? 'tape' : 'item';
      return `Pay the appraiser ${fmt(S, this.cost(S, biz))}. Half the time the ${what} is genuine: you buy it on the spot for ${fmt(S, pct(rev(S, biz), 0.40))} and sell it next month for +${fmt(S, pct(rev(S, biz), 0.80))} revenue. Half the time it is a fake: you lose only the appraisal fee, and repeat customers −2% for trying to sell it.`;
    },
    available: (S, biz) => {
      const cd = cooldownLeft(S, biz, 'retail_appraise_rare', 6);
      if (cd > 0) return { ok: false, reason: `Rare finds do not come every week — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const fee = this.cost(S, biz);
      const ch = chargeCost(S, biz, fee, this.label(S, biz)); if (!ch.ok) return ch;
      markUsed(S, biz, 'retail_appraise_rare');
      const genuine = opts.force === 'genuine' ? true : opts.force === 'fake' ? false : rand(S) < 0.5;
      if (!genuine) {
        /* v2.19 W5 — the label, the message and the promised numbers all
           say repeat customers −2% for a fake, but nothing ever moved
           biz.repeatRate: the penalty was promised and never landed.
           It lands here, in the one place repeat rate moves (the monthly
           fold only applies decision slices/effects, and this branch
           creates neither). */
        biz.repeatRate = clamp((Number(biz.repeatRate ?? 0.5)) - 0.02, 0, 1);
        biz.lastRareItem = { genuine: false, year: S.year, month: S.month, text: 'The "rare" item was a fake. The appraiser shook his head, and word got around — repeat customers −2%.' };
        logDecision(S, biz, 'retail_appraise_rare', this.label(S, biz), `The rare item at ${biz.name} was a FAKE. Lost the ${fmt(S, fee)} appraisal fee, repeat customers −2%.`);
        return { ok: true, msg: `Fake. You lost only the ${fmt(S, fee)} appraisal fee, repeat customers −2%.`, promised: 'Nothing more — the fee is gone and repeat customers fell 2%.', promisedNumbers: { outcome: 'fake', repeatRateDelta: -0.02 } };
      }
      const buyPrice = pct(rev(S, biz), 0.40);
      if ((Number(S.money?.cash) || 0) < buyPrice) {
        logDecision(S, biz, 'retail_appraise_rare', this.label(S, biz), `The rare item at ${biz.name} was GENUINE, but you could not afford the ${fmt(S, buyPrice)} asking price — it went to someone else.`);
        return { ok: true, msg: `Genuine — but you could not afford the ${fmt(S, buyPrice)} asking price, so it went to someone else. You lost only the appraisal fee.`, promised: 'Nothing more — you could not afford to buy it.', promisedNumbers: { outcome: 'genuine-unaffordable', buyPrice } };
      }
      walletMove(S, -buyPrice, `${biz.name} — Bought a rare item to resell`, 'business');
      addSlice(S, biz, 'retail_appraise_rare', 'Rare item resale', { months: 1, monthlyRevenue: pct(rev(S, biz), 0.80) });
      biz.lastRareItem = { genuine: true, buyPrice, sellRevenue: pct(rev(S, biz), 0.80), year: S.year, month: S.month, text: `A genuine rare find, bought for ${fmt(S, buyPrice)} and sold next month for ${fmt(S, pct(rev(S, biz), 0.80))}.` };
      logDecision(S, biz, 'retail_appraise_rare', this.label(S, biz), `Bought a GENUINE rare item at ${biz.name} for ${fmt(S, buyPrice)} — it sells next month for +${fmt(S, pct(rev(S, biz), 0.80))} revenue.`);
      return { ok: true, msg: `Genuine! Bought for ${fmt(S, buyPrice)} — it sells next month for +${fmt(S, pct(rev(S, biz), 0.80))} revenue.`, promised: `+${fmt(S, pct(rev(S, biz), 0.80))} revenue next month.`, promisedNumbers: { outcome: 'genuine', buyPrice, revenueDelta: pct(rev(S, biz), 0.80), months: 1 } };
    }
  },
  {
    id: 'retail_sell_dead_stock', group: 'retail', label: (S, biz) => biz?.typeId === 'salon' ? 'Clear slow treatments — off-peak discount' : biz?.typeId === 'video_rental' ? 'Late-fee amnesty week' : biz?.typeId === 'cyber_cafe' ? 'Off-peak happy hours' : 'Sell dead stock at a loss',
    cost: () => 0,
    effectText: (S, biz) => biz?.typeId === 'salon'
      ? `Fill the quiet hours with discounted treatments: +${fmt(S, pct(rev(S, biz), 0.06))} revenue next month from the bookings, and ${fmt(S, pct(costBase(S, biz), 0.05))} LESS in costs a month for 3 months. Repeat customers +2% for a salon that is never empty.`
      : biz?.typeId === 'video_rental'
        ? `Waive the late fees for a week and bring the tapes home: +${fmt(S, pct(rev(S, biz), 0.06))} revenue next month from the returns and rentals, and ${fmt(S, pct(costBase(S, biz), 0.05))} LESS in costs a month for 3 months. Repeat customers +2% for a shop that forgives.`
        : biz?.typeId === 'cyber_cafe'
          ? `Fill the quiet hours with happy-hour prices: +${fmt(S, pct(rev(S, biz), 0.06))} revenue next month from the seats, and ${fmt(S, pct(costBase(S, biz), 0.05))} LESS in costs a month for 3 months. Repeat customers +2% for a café that is never empty.`
          : `Clear the shelves that never sell: +${fmt(S, pct(rev(S, biz), 0.06))} revenue next month from the clearance, and ${fmt(S, pct(costBase(S, biz), 0.05))} LESS in storage and handling costs a month for 3 months. It is a loss on the stock itself — that is the point, it was never going to sell. repeat customers +2% for a clean shop.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'retail_sell_dead_stock')) return { ok: false, reason: 'The clearance is still running.' };
      const cd = cooldownLeft(S, biz, 'retail_sell_dead_stock', 6);
      if (cd > 0) return { ok: false, reason: `Dead stock takes time to pile up again — available in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      markUsed(S, biz, 'retail_sell_dead_stock');
      addSlice(S, biz, 'retail_sell_dead_stock', 'Dead-stock clearance', { months: 1, monthlyRevenue: pct(rev(S, biz), 0.06), monthlyRepeat: 0.02 });
      addSlice(S, biz, 'retail_sell_dead_stock', 'Freed storage', { months: 3, monthlyRevenue: 0, monthlyCost: -pct(costBase(S, biz), 0.05) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.06))} revenue next month, ${fmt(S, pct(costBase(S, biz), 0.05))} less in costs a month for 3 months, repeat customers +2%.`;
      logDecision(S, biz, 'retail_sell_dead_stock', this.label(S, biz), `Cleared dead stock at ${biz.name} at a loss — ${promised}`);
      return { ok: true, msg: `${this.label(S, biz)} — ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.06), costDelta: -pct(costBase(S, biz), 0.05), repeatRateDelta: 0.02, months: 3 } };
    }
  },

  /* ============ RETAIL REPLACEMENTS (v2.20 I2, W2 §3) ============
     A salon sells no rare item, a print shop takes corporate runs,
     a cyber café hosts gaming nights — each replaces the generic
     retail_appraise_rare for its type (see TYPE_OVERRIDES). */
  {
    id: 'salon_premium_package', group: 'retail', label: () => 'Sell a premium treatment — bridal package',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `A premium bridal package — hair, makeup, the full morning, booked weeks ahead: +${fmt(S, pct(rev(S, biz), 0.25))} revenue a month for 2 months, repeat customers +3%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'salon_premium_package')) return { ok: false, reason: 'A bridal package is already booked.' };
      const cd = cooldownLeft(S, biz, 'salon_premium_package', 3);
      if (cd > 0) return { ok: false, reason: `Bridal season needs a gap — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Sell a premium treatment — bridal package'); if (!ch.ok) return ch;
      markUsed(S, biz, 'salon_premium_package');
      addSlice(S, biz, 'salon_premium_package', 'Bridal package', { months: 2, monthlyRevenue: pct(rev(S, biz), 0.25), monthlyRepeat: 0.03 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.25))} revenue a month for 2 months, repeat customers +3%.`;
      logDecision(S, biz, 'salon_premium_package', 'Sell a premium treatment — bridal package', `Sold a premium bridal package at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `A bridal package is booked at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.25), costDelta: 0, repeatRateDelta: 0.03, months: 2 } };
    }
  },
  {
    id: 'print_big_contract', group: 'retail', label: () => 'Take a big corporate print run',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `A company wants its whole run — letterheads, menus, flyers, thousands of sheets: +${fmt(S, pct(rev(S, biz), 0.30))} revenue a month for 3 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'print_big_contract')) return { ok: false, reason: 'A big print run is already on the presses.' };
      const cd = cooldownLeft(S, biz, 'print_big_contract', 3);
      if (cd > 0) return { ok: false, reason: `The presses just cleared — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Take a big corporate print run'); if (!ch.ok) return ch;
      markUsed(S, biz, 'print_big_contract');
      addSlice(S, biz, 'print_big_contract', 'Corporate print run', { months: 3, monthlyRevenue: pct(rev(S, biz), 0.30) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.30))} revenue a month for 3 months.`;
      logDecision(S, biz, 'print_big_contract', 'Take a big corporate print run', `Took a big corporate print run at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `The presses are running a corporate job at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.30), costDelta: 0, repeatRateDelta: 0, months: 3 } };
    }
  },
  {
    id: 'cyber_gaming_night', group: 'retail', label: () => 'Host a gaming night / tournament',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `A tournament night — every PC booked, a small prize, the whole street watching: +${fmt(S, pct(rev(S, biz), 0.30))} revenue next month, repeat customers +3%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'cyber_gaming_night')) return { ok: false, reason: 'A gaming night is already booked.' };
      const cd = cooldownLeft(S, biz, 'cyber_gaming_night', 2);
      if (cd > 0) return { ok: false, reason: `You just hosted one — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Host a gaming night / tournament'); if (!ch.ok) return ch;
      markUsed(S, biz, 'cyber_gaming_night');
      addSlice(S, biz, 'cyber_gaming_night', 'Gaming night', { months: 1, monthlyRevenue: pct(rev(S, biz), 0.30), monthlyRepeat: 0.03 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.30))} revenue next month, repeat customers +3%.`;
      logDecision(S, biz, 'cyber_gaming_night', 'Host a gaming night / tournament', `Hosted a gaming night at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Tournament night at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.30), costDelta: 0, repeatRateDelta: 0.03, months: 1 } };
    }
  },

  /* ================= SERVICES (5) ================= */
  {
    id: 'svc_hire_star', group: 'services', label: () => 'Hire a star specialist',
    cost: (S, biz) => Math.round(monthlyMidSalary(S, biz.country || S.country) * 1.2),
    effectText(S, biz) { return `A named specialist everyone in the trade knows joins the team (skill 85–95, wage ${fmt(S, this.cost(S, biz))}/month — onboarding costs one month's wage, like any hire). They bring clients: +${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 6 months, repeat customers +4%.`; },
    available: (S, biz) => {
      if ((biz.staff || []).length >= 12) return { ok: false, reason: 'The team is already at the maximum of 12.' };
      const cd = cooldownLeft(S, biz, 'svc_hire_star', 6);
      if (cd > 0) return { ok: false, reason: `You hired a star recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const wage = this.cost(S, biz);
      const ch = chargeCost(S, biz, wage, 'Hire a star specialist (onboarding)'); if (!ch.ok) return ch;
      const name = personName(S, biz);
      const role = starRoleFor(biz);
      const star = { id: nextId(S, 'bstaff'), name, role, wageLocal: wage, morale: 75, skill: 85 + Math.floor(rand(S) * 11), hiredYear: S.year, hiredMonth: S.month, fit: 'good', star: true };
      biz.staff.push(star);
      biz.employees = biz.staff.length;
      markUsed(S, biz, 'svc_hire_star');
      addSlice(S, biz, 'svc_hire_star', 'Star specialist', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.15), monthlyRepeat: 0.04 });
      const promised = `${name} brings clients: +${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 6 months, repeat customers +4%. Their wage (${fmt(S, wage)}/month) is in the monthly payroll from now on.`;
      logDecision(S, biz, 'svc_hire_star', 'Hire a star specialist', `Hired ${name}, a star ${role}, at ${biz.name} for ${fmt(S, wage)}/month (onboarding ${fmt(S, wage)}). ${promised}`);
      return { ok: true, msg: `${name} (star ${role}) joined ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.15), costDelta: 0, repeatRateDelta: 0.04, months: 6, starWage: wage, starName: name } };
    }
  },
  {
    id: 'svc_price_premium', group: 'services', label: () => 'Set premium prices',
    cost: () => 0,
    effectText: (S, biz) => `Charge more per service: +${fmt(S, pct(rev(S, biz), 0.09))} revenue a month for 6 months, but +${fmt(S, pct(costBase(S, biz), 0.03))} costs a month (better materials, longer appointments).`,
    available: (S, biz) => {
      if (activeEffect(biz, 'svc_price_premium')) return { ok: false, reason: 'Prices are already premium.' };
      if (activeEffect(biz, 'svc_price_value')) return { ok: false, reason: 'Prices are value right now — return to balanced prices first, then set premium.' };
      return { ok: true };
    },
    apply(S, biz) {
      markUsed(S, biz, 'svc_price_premium');
      /* v2.20 I2 — premium and value are mutually exclusive: ending any
         value slice here too, so the two can never be held at once
         even if apply is reached past the availability check. */
      for (const eff of (biz.decisionEffects || [])) { if (eff.decisionId === 'svc_price_value') eff.monthsLeft = 0; }
      addSlice(S, biz, 'svc_price_premium', 'Premium prices', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.09), monthlyCost: pct(costBase(S, biz), 0.03) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.09))} revenue and +${fmt(S, pct(costBase(S, biz), 0.03))} costs a month for 6 months.`;
      logDecision(S, biz, 'svc_price_premium', 'Set premium prices', `Set premium prices at ${biz.name} — ${promised}`);
      return { ok: true, msg: `${biz.name} now charges premium prices. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.09), costDelta: pct(costBase(S, biz), 0.03), repeatRateDelta: 0, months: 6 } };
    }
  },
  {
    id: 'svc_price_value', group: 'services', label: () => 'Set value prices',
    cost: () => 0,
    effectText: (S, biz) => `Charge less per service to win volume: −${fmt(S, pct(rev(S, biz), 0.07))} revenue a month for 6 months, but −${fmt(S, pct(costBase(S, biz), 0.03))} costs a month (simpler service, faster turnover).`,
    available: (S, biz) => {
      if (activeEffect(biz, 'svc_price_value')) return { ok: false, reason: 'Prices are already value.' };
      if (activeEffect(biz, 'svc_price_premium')) return { ok: false, reason: 'Prices are premium right now — return to balanced prices first, then set value.' };
      return { ok: true };
    },
    apply(S, biz) {
      markUsed(S, biz, 'svc_price_value');
      /* v2.20 I2 — see svc_price_premium: the two pricings exclude each other. */
      for (const eff of (biz.decisionEffects || [])) { if (eff.decisionId === 'svc_price_premium') eff.monthsLeft = 0; }
      addSlice(S, biz, 'svc_price_value', 'Value prices', { months: 6, monthlyRevenue: -pct(rev(S, biz), 0.07), monthlyCost: -pct(costBase(S, biz), 0.03) });
      const promised = `−${fmt(S, pct(rev(S, biz), 0.07))} revenue and −${fmt(S, pct(costBase(S, biz), 0.03))} costs a month for 6 months.`;
      logDecision(S, biz, 'svc_price_value', 'Set value prices', `Set value prices at ${biz.name} — ${promised}`);
      return { ok: true, msg: `${biz.name} now charges value prices. ${promised}`, promised, promisedNumbers: { revenueDelta: -pct(rev(S, biz), 0.07), costDelta: -pct(costBase(S, biz), 0.03), repeatRateDelta: 0, months: 6 } };
    }
  },
  {
    id: 'svc_price_balanced', group: 'services', label: () => 'Return to balanced prices',
    cost: () => 0,
    effectText: () => 'Drop the premium or value pricing and go back to balanced prices. The current pricing effect ends next month.',
    available: (S, biz) => {
      if (!activeEffect(biz, 'svc_price_premium') && !activeEffect(biz, 'svc_price_value')) return { ok: false, reason: 'Prices are already balanced — there is nothing to drop.' };
      return { ok: true };
    },
    apply(S, biz) {
      for (const eff of (biz.decisionEffects || [])) {
        if (eff.decisionId === 'svc_price_premium' || eff.decisionId === 'svc_price_value') eff.monthsLeft = 0;
      }
      logDecision(S, biz, 'svc_price_balanced', 'Return to balanced prices', `Prices at ${biz.name} are back to balanced.`);
      return { ok: true, msg: `${biz.name} is back to balanced prices from next month.`, promised: 'Premium/value pricing ends; revenue and costs return to normal from next month.', promisedNumbers: { revenueDelta: 0, costDelta: 0, repeatRateDelta: 0, months: 0 } };
    }
  },
  {
    id: 'svc_big_client', group: 'services', label: (S, biz) => biz?.typeId === 'pharmacy' || biz?.typeId === 'community_pharmacy' ? 'Win a clinic supply contract' : biz?.typeId === 'nursery_preschool' ? 'Win a company crèche-places deal' : biz?.typeId === 'pet_grooming' ? 'Win a kennel / breeder contract' : biz?.typeId === 'fashion_atelier' ? 'A boutique orders a collection' : biz?.typeId === 'wedding_planner' ? 'Book a full wedding season' : 'Take on a big client',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `${biz?.typeId === 'pharmacy' || biz?.typeId === 'community_pharmacy' ? 'One clinic signs a 6-month supply contract:' : biz?.typeId === 'nursery_preschool' ? 'One company books crèche places for its staff, a 6-month deal:' : biz?.typeId === 'pet_grooming' ? 'One kennel signs a 6-month grooming contract:' : biz?.typeId === 'fashion_atelier' ? 'One boutique orders a whole collection, a 6-month run:' : biz?.typeId === 'wedding_planner' ? 'One family books a full wedding season, a 6-month run:' : 'One named client, a 6-month term:'} +${fmt(S, pct(rev(S, biz), 0.30))} revenue a month for 6 months. The risk is real — when the term ends there is a 30% chance they leave, and losing them costs −${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 2 months and repeat customers −4%.`,
    available: (S, biz) => {
      if (biz.bigClient) return { ok: false, reason: `You already serve a big client (${biz.bigClient.org}) — one at a time.` };
      const cd = cooldownLeft(S, biz, 'svc_big_client', 3);
      if (cd > 0) return { ok: false, reason: `A big client just left — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, this.label(S, biz)); if (!ch.ok) return ch;
      const org = `${pickFamilyName(biz.country || S.country, () => rand(S))} Group`;
      const contact = personName(S, biz);
      const termEnd = nowIdx(S) + 6;
      biz.bigClient = { org, contact, termEndMonth: termEnd };
      markUsed(S, biz, 'svc_big_client');
      const eff = addSlice(S, biz, 'svc_big_client', `Big client — ${org}`, { months: 6, monthlyRevenue: pct(rev(S, biz), 0.30) });
      eff.kind = 'client'; eff.termEndMonth = termEnd; eff.data = { org, contact, force: opts.force || null };
      const promised = `+${fmt(S, pct(rev(S, biz), 0.30))} revenue a month for 6 months from ${org}. At the end of the term, a 30% chance they leave (−${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 2 months, repeat customers −4%).`;
      logDecision(S, biz, 'svc_big_client', this.label(S, biz), `Took on ${org} (contact ${contact}) as a big client at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `${org} is now a big client of ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.30), costDelta: 0, repeatRateDelta: 0, months: 6, leaveChance: 0.30, leaveRevenue: -pct(rev(S, biz), 0.15) } };
    }
  },

  /* ================= PROPERTY & LOGISTICS (5) ================= */
  {
    id: 'prop_buy_vehicle', group: 'property', label: (S, biz) => /rental|logistics/.test(`${biz?.typeId || ''}`) ? 'Buy a vehicle' : 'Buy a unit',
    cost: (S, biz) => Math.max(5000, pct(capital(S, biz), 0.60)),
    effectText: (S, biz) => {
      const what = /rental|logistics/.test(`${biz?.typeId || ''}`) ? 'A new vehicle on the fleet' : 'A new unit in the portfolio';
      return `${what}: +${fmt(S, pct(rev(S, biz), 0.12))} revenue a month for 12 months, but +${fmt(S, pct(costBase(S, biz), 0.03))} costs a month (fuel, maintenance, fees) for the same 12 months.`;
    },
    available: (S, biz) => {
      if (activeEffect(biz, 'prop_buy_vehicle')) return { ok: false, reason: 'A vehicle/unit purchase is still paying off — one at a time.' };
      const cd = cooldownLeft(S, biz, 'prop_buy_vehicle', 12);
      if (cd > 0) return { ok: false, reason: `You bought recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, /rental|logistics/.test(`${biz?.typeId || ''}`) ? 'Buy a vehicle' : 'Buy a unit'); if (!ch.ok) return ch;
      markUsed(S, biz, 'prop_buy_vehicle');
      addSlice(S, biz, 'prop_buy_vehicle', 'New vehicle/unit', { months: 12, monthlyRevenue: pct(rev(S, biz), 0.12), monthlyCost: pct(costBase(S, biz), 0.03) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.12))} revenue and +${fmt(S, pct(costBase(S, biz), 0.03))} costs a month for 12 months.`;
      logDecision(S, biz, 'prop_buy_vehicle', 'Buy a vehicle / a unit', `Bought a vehicle/unit for ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `New vehicle/unit for ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.12), costDelta: pct(costBase(S, biz), 0.03), repeatRateDelta: 0, months: 12 } };
    }
  },
  {
    id: 'prop_fleet_expand', group: 'property', label: () => 'Expand the fleet',
    cost: (S, biz) => Math.max(2000, pct(capital(S, biz), 0.25)),
    effectText: (S, biz) => `More vehicles/units working: +${fmt(S, pct(rev(S, biz), 0.10))} revenue a month for 6 months, but +${fmt(S, pct(costBase(S, biz), 0.05))} costs a month for the same 6 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'prop_fleet_expand') || activeEffect(biz, 'prop_fleet_trim')) return { ok: false, reason: 'A fleet change is already running.' };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Expand the fleet'); if (!ch.ok) return ch;
      markUsed(S, biz, 'prop_fleet_expand');
      addSlice(S, biz, 'prop_fleet_expand', 'Fleet expansion', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.10), monthlyCost: pct(costBase(S, biz), 0.05) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.10))} revenue and +${fmt(S, pct(costBase(S, biz), 0.05))} costs a month for 6 months.`;
      logDecision(S, biz, 'prop_fleet_expand', 'Expand the fleet', `Expanded the fleet at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Fleet expanded at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.10), costDelta: pct(costBase(S, biz), 0.05), repeatRateDelta: 0, months: 6 } };
    }
  },
  {
    id: 'prop_fleet_trim', group: 'property', label: () => 'Trim the fleet (sell a vehicle)',
    cost: () => 0,
    effectText: (S, biz) => `Sell off a vehicle/unit now for ${fmt(S, pct(capital(S, biz), 0.15))} cash in hand — but −${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, with −${fmt(S, pct(costBase(S, biz), 0.06))} costs a month (less to run) for the same 6 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'prop_fleet_expand') || activeEffect(biz, 'prop_fleet_trim')) return { ok: false, reason: 'A fleet change is already running.' };
      return { ok: true };
    },
    apply(S, biz) {
      const sale = pct(capital(S, biz), 0.15);
      walletMove(S, sale, `${biz.name} — Sold a vehicle/unit (fleet trim)`, 'business');
      markUsed(S, biz, 'prop_fleet_trim');
      addSlice(S, biz, 'prop_fleet_trim', 'Fleet trim', { months: 6, monthlyRevenue: -pct(rev(S, biz), 0.08), monthlyCost: -pct(costBase(S, biz), 0.06) });
      const promised = `${fmt(S, sale)} cash now, −${fmt(S, pct(rev(S, biz), 0.08))} revenue and −${fmt(S, pct(costBase(S, biz), 0.06))} costs a month for 6 months.`;
      logDecision(S, biz, 'prop_fleet_trim', 'Trim the fleet', `Sold a vehicle/unit from ${biz.name} for ${fmt(S, sale)} — ${promised}`);
      return { ok: true, msg: `Fleet trimmed at ${biz.name}. ${promised}`, promised, promisedNumbers: { cashIn: sale, revenueDelta: -pct(rev(S, biz), 0.08), costDelta: -pct(costBase(S, biz), 0.06), repeatRateDelta: 0, months: 6 } };
    }
  },
  {
    id: 'prop_take_contract', group: 'property', label: () => 'Take a logistics contract',
    cost: (S, biz) => Math.max(1000, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `A named client signs a 12-month contract: +${fmt(S, pct(rev(S, biz), 0.25))} revenue a month for 12 months. But if you fail to deliver in a month, the penalty is charged for real — ${fmt(S, pct(rev(S, biz), 0.30))} that month, repeat customers −6%, and the contract ends. Failing is likely when you are short-staffed (under 2 staff) or the team is unhappy (average morale under 40); otherwise it is rare.`,
    available: (S, biz) => {
      if (biz.activeContract) return { ok: false, reason: `You already hold a contract (${biz.activeContract.org}) — one at a time.` };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Take a logistics contract'); if (!ch.ok) return ch;
      const org = `${pickFamilyName(biz.country || S.country, () => rand(S))} Group`;
      const termEnd = nowIdx(S) + 12;
      biz.activeContract = { org, termEndMonth: termEnd, penalty: pct(rev(S, biz), 0.30) };
      markUsed(S, biz, 'prop_take_contract');
      const eff = addSlice(S, biz, 'prop_take_contract', `Contract — ${org}`, { months: 12, monthlyRevenue: pct(rev(S, biz), 0.25) });
      eff.kind = 'contract'; eff.termEndMonth = termEnd; eff.data = { org, penalty: pct(rev(S, biz), 0.30), force: opts.force || null };
      const promised = `+${fmt(S, pct(rev(S, biz), 0.25))} revenue a month for 12 months from ${org}. Fail to deliver in a month and the ${fmt(S, pct(rev(S, biz), 0.30))} penalty is charged that month, repeat customers −6%, contract ends.`;
      logDecision(S, biz, 'prop_take_contract', 'Take a logistics contract', `Signed a 12-month contract with ${org} for ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `${org} signed a 12-month contract with ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.25), costDelta: 0, repeatRateDelta: 0, months: 12, penalty: pct(rev(S, biz), 0.30) } };
    }
  },
  {
    id: 'prop_renovate_unit', group: 'property', label: (S, biz) => biz?.typeId === 'car_rental_fleet' ? 'Refurbish a vehicle' : biz?.typeId === 'logistics' ? 'Refit the depot' : biz?.typeId === 'cold_logistics' ? 'Refit the cold store' : 'Renovate a unit',
    cost: (S, biz) => Math.max(2000, pct(capital(S, biz), 0.10)),
    effectText: (S, biz) => biz?.typeId === 'car_rental_fleet'
      ? `A proper refurbish of a vehicle in the fleet: +${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +2%.`
      : biz?.typeId === 'logistics'
        ? `A proper refit of the depot: +${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +2%.`
        : biz?.typeId === 'cold_logistics'
          ? `A proper refit of the cold store: +${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +2%.`
          : `A proper refit: +${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +2%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'prop_renovate_unit')) return { ok: false, reason: 'A renovation is already running.' };
      const cd = cooldownLeft(S, biz, 'prop_renovate_unit', 12);
      if (cd > 0) return { ok: false, reason: `You renovated recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, this.label(S, biz)); if (!ch.ok) return ch;
      markUsed(S, biz, 'prop_renovate_unit');
      addSlice(S, biz, 'prop_renovate_unit', 'Renovation', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.08), monthlyRepeat: 0.02 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +2%.`;
      logDecision(S, biz, 'prop_renovate_unit', this.label(S, biz), `Renovated a unit at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Renovation done at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.08), costDelta: 0, repeatRateDelta: 0.02, months: 6 } };
    }
  },
  /* ============ PROPERTY AGENCY (v2.20 I2, W2 §3) ============
     A brokerage owns no vehicles and no units to renovate or
     expand — it opens offices, hires agents, wins exclusive
     listings and refits its office. Replaces all five property
     decisions for prop_brokerage and realestate (see TYPE_OVERRIDES). */
  {
    id: 'agency_open_office', group: 'property', label: () => 'Open a new office',
    cost: (S, biz) => Math.max(2000, pct(capital(S, biz), 0.25)),
    effectText: (S, biz) => `A second office in a new neighbourhood, listings on the window: +${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 12 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'agency_open_office')) return { ok: false, reason: 'A new office is still bedding in — one at a time.' };
      const cd = cooldownLeft(S, biz, 'agency_open_office', 12);
      if (cd > 0) return { ok: false, reason: `You opened an office recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Open a new office'); if (!ch.ok) return ch;
      markUsed(S, biz, 'agency_open_office');
      addSlice(S, biz, 'agency_open_office', 'New office', { months: 12, monthlyRevenue: pct(rev(S, biz), 0.15) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 12 months.`;
      logDecision(S, biz, 'agency_open_office', 'Open a new office', `Opened a new office for ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `A new office for ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.15), costDelta: 0, repeatRateDelta: 0, months: 12 } };
    }
  },
  {
    id: 'agency_hire_agents', group: 'property', label: () => 'Hire more agents',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `More agents on the street, more viewings a week: +${fmt(S, pct(rev(S, biz), 0.10))} revenue a month for 6 months.`,
    available: (S, biz) => {
      const cd = cooldownLeft(S, biz, 'agency_hire_agents', 3);
      if (cd > 0) return { ok: false, reason: `You just hired agents — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Hire more agents'); if (!ch.ok) return ch;
      markUsed(S, biz, 'agency_hire_agents');
      addSlice(S, biz, 'agency_hire_agents', 'More agents', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.10) });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.10))} revenue a month for 6 months.`;
      logDecision(S, biz, 'agency_hire_agents', 'Hire more agents', `Hired more agents at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `More agents on the street for ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.10), costDelta: 0, repeatRateDelta: 0, months: 6 } };
    }
  },
  {
    id: 'agency_close_office', group: 'property', label: () => 'Close a slow office',
    cost: () => 0,
    effectText: (S, biz) => `Shut the office that never earns its rent: ${fmt(S, pct(capital(S, biz), 0.10))} cash back from the furniture and the deposit — but −${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, with −${fmt(S, pct(rev(S, biz), 0.02))} costs a month (less to run) for the same 6 months.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'agency_close_office')) return { ok: false, reason: 'An office closure is already running.' };
      return { ok: true };
    },
    apply(S, biz) {
      const sale = pct(capital(S, biz), 0.10);
      walletMove(S, sale, `${biz.name} — Closed a slow office (furniture & deposit back)`, 'business');
      markUsed(S, biz, 'agency_close_office');
      addSlice(S, biz, 'agency_close_office', 'Office closure', { months: 6, monthlyRevenue: -pct(rev(S, biz), 0.08), monthlyCost: -pct(rev(S, biz), 0.02) });
      const promised = `${fmt(S, sale)} cash now, −${fmt(S, pct(rev(S, biz), 0.08))} revenue and −${fmt(S, pct(rev(S, biz), 0.02))} costs a month for 6 months.`;
      logDecision(S, biz, 'agency_close_office', 'Close a slow office', `Closed a slow office at ${biz.name} for ${fmt(S, sale)} back — ${promised}`);
      return { ok: true, msg: `A slow office closed at ${biz.name}. ${promised}`, promised, promisedNumbers: { cashIn: sale, revenueDelta: -pct(rev(S, biz), 0.08), costDelta: -pct(rev(S, biz), 0.02), repeatRateDelta: 0, months: 6 } };
    }
  },
  {
    id: 'agency_exclusive_listings', group: 'property', label: () => 'Win an exclusive listings contract',
    cost: (S, biz) => Math.max(500, pct(rev(S, biz), 0.05)),
    effectText: (S, biz) => `A developer hands you the exclusive listings for a whole compound, a 6-month contract: +${fmt(S, pct(rev(S, biz), 0.30))} revenue a month for 6 months. When the contract ends there is a 30% chance they move on, and losing them costs −${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 2 months and repeat customers −4%.`,
    available: (S, biz) => {
      if (biz.bigClient) return { ok: false, reason: `You already hold an exclusive contract (${biz.bigClient.org}) — one at a time.` };
      const cd = cooldownLeft(S, biz, 'agency_exclusive_listings', 3);
      if (cd > 0) return { ok: false, reason: `A contract just ended — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz, opts = {}) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Win an exclusive listings contract'); if (!ch.ok) return ch;
      const org = `${pickFamilyName(biz.country || S.country, () => rand(S))} Developments`;
      const contact = personName(S, biz);
      const termEnd = nowIdx(S) + 6;
      biz.bigClient = { org, contact, termEndMonth: termEnd };
      markUsed(S, biz, 'agency_exclusive_listings');
      const eff = addSlice(S, biz, 'agency_exclusive_listings', `Exclusive listings — ${org}`, { months: 6, monthlyRevenue: pct(rev(S, biz), 0.30) });
      eff.kind = 'client'; eff.termEndMonth = termEnd; eff.data = { org, contact, force: opts.force || null };
      const promised = `+${fmt(S, pct(rev(S, biz), 0.30))} revenue a month for 6 months from ${org}. At the end of the contract, a 30% chance they move on (−${fmt(S, pct(rev(S, biz), 0.15))} revenue a month for 2 months, repeat customers −4%).`;
      logDecision(S, biz, 'agency_exclusive_listings', 'Win an exclusive listings contract', `Won the exclusive listings for ${org} (contact ${contact}) at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `${org} gave ${biz.name} its exclusive listings. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.30), costDelta: 0, repeatRateDelta: 0, months: 6, leaveChance: 0.30, leaveRevenue: -pct(rev(S, biz), 0.15) } };
    }
  },
  {
    id: 'agency_refit_office', group: 'property', label: () => 'Refit the office',
    cost: (S, biz) => Math.max(2000, pct(capital(S, biz), 0.10)),
    effectText: (S, biz) => `A proper refit of the office — the window, the desks, a room clients trust: +${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +2%.`,
    available: (S, biz) => {
      if (activeEffect(biz, 'agency_refit_office')) return { ok: false, reason: 'A refit is already running.' };
      const cd = cooldownLeft(S, biz, 'agency_refit_office', 12);
      if (cd > 0) return { ok: false, reason: `You refitted recently — available again in ${cd} month${cd > 1 ? 's' : ''}.` };
      return { ok: true };
    },
    apply(S, biz) {
      const c = this.cost(S, biz);
      const ch = chargeCost(S, biz, c, 'Refit the office'); if (!ch.ok) return ch;
      markUsed(S, biz, 'agency_refit_office');
      addSlice(S, biz, 'agency_refit_office', 'Office refit', { months: 6, monthlyRevenue: pct(rev(S, biz), 0.08), monthlyRepeat: 0.02 });
      const promised = `+${fmt(S, pct(rev(S, biz), 0.08))} revenue a month for 6 months, repeat customers +2%.`;
      logDecision(S, biz, 'agency_refit_office', 'Refit the office', `Refitted the office at ${biz.name} for ${fmt(S, c)} — ${promised}`);
      return { ok: true, msg: `Office refitted at ${biz.name}. ${promised}`, promised, promisedNumbers: { revenueDelta: pct(rev(S, biz), 0.08), costDelta: 0, repeatRateDelta: 0.02, months: 6 } };
    }
  }
];

export const DECISION_DEFS = DEFS;
export function decisionDef(id) { return DEFS.find(d => d.id === id) || null; }

/* ------------------------------------------------------------------ *
   Public API
   ------------------------------------------------------------------ */
export function decisionsForBusiness(S, biz) {
  if (!biz) return [];
  ensureDecisionState(S, biz);
  const group = decisionGroupForBusiness(biz);
  /* v2.20 I2 — the per-type override table (TYPE_OVERRIDES) is
     consulted first; the group set is only the fallback. */
  return decisionIdsForBusiness(biz).map(id => DEFS.find(d => d.id === id)).filter(Boolean).map(d => {
    const av = d.available(S, biz);
    return {
      id: d.id,
      group,
      label: d.label(S, biz),
      cost: d.cost(S, biz),
      effectText: d.effectText(S, biz),
      available: !!av.ok,
      lockReason: av.ok ? '' : (av.reason || 'Not available right now.')
    };
  });
}

export function applyDecision(S, biz, decisionId, opts = {}) {
  if (!biz) return { ok: false, msg: 'No business selected.', promised: '' };
  ensureDecisionState(S, biz);
  const def = decisionDef(decisionId);
  if (!def) return { ok: false, msg: `Unknown business decision: ${decisionId}.`, promised: '' };
  if (!decisionIdsForBusiness(biz).includes(decisionId)) {
    return { ok: false, msg: `${def.label(S, biz)} does not fit ${biz.name} — it is not one of this business's decisions.`, promised: '' };
  }
  const av = def.available(S, biz);
  if (!av.ok) return { ok: false, msg: av.reason || 'That decision is not available right now.', promised: '' };
  const res = def.apply(S, biz, opts);
  if (!res || typeof res !== 'object') return { ok: false, msg: 'That decision could not be applied.', promised: '' };
  if (res.ok && res.promisedNumbers === undefined) res.promisedNumbers = null;
  return res;
}

/* Resolve one-shot outcomes (critic verdict, competition result,
   supplier batch, co-founder quit). Returns { revenueDelta,
   costDelta, repeatRateDelta, text } and stores the outcome on the
   business so the player can read it. */
function resolveOneshot(S, biz, eff) {
  const r = rev(S, biz), c = costBase(S, biz);
  const forced = eff.data?.force || null;
  let out = { revenueDelta: 0, costDelta: 0, repeatRateDelta: 0, text: '' };
  const criticWords = biz?.typeId === 'roastery_chain'
    ? { rave: `The roast here is the best in the city — ${biz.name} knows its beans. Worth the trip.`, mixed: `Good beans, uneven brew — ${biz.name} is worth a visit, not a detour.`, pan: `Stale beans, tired cups — ${biz.name} needs to decide what it is.` }
    : { rave: `The best table in the city — ${biz.name} cooks like it means it. Book ahead.`, mixed: `Solid cooking, uneven service — ${biz.name} is worth a visit, not a detour.`, pan: `Tired food, tired room — ${biz.name} needs to decide what it is.` };
  if (eff.decisionId === 'food_invite_critic') {
    const verdict = forced === 'rave' ? 'rave' : forced === 'pan' ? 'pan' : forced === 'mixed' ? 'mixed'
      : (rand(S) < 0.4 ? 'rave' : rand(S) < 0.67 ? 'mixed' : 'pan');
    if (verdict === 'rave') {
      out = { revenueDelta: pct(r, 0.25), costDelta: 0, repeatRateDelta: 0.1,
        text: `Rave review! "${criticWords.rave}" Revenue +${fmt(S, pct(r, 0.25))} this month, repeat customers +10%.` };
    } else if (verdict === 'mixed') {
      out = { revenueDelta: pct(r, 0.05), costDelta: 0, repeatRateDelta: 0.02,
        text: `"${criticWords.mixed}" Revenue +${fmt(S, pct(r, 0.05))} this month, repeat customers +2%.` };
    } else {
      out = { revenueDelta: -pct(r, 0.12), costDelta: 0, repeatRateDelta: -0.08,
        text: `Pan. "${criticWords.pan}" Revenue −${fmt(S, pct(r, 0.12))} this month, repeat customers −8%.` };
    }
    biz.lastCriticVerdict = { outcome: verdict, year: S.year, month: S.month, text: out.text };
  } else if (eff.decisionId === 'food_enter_competition') {
    const result = forced === 'win' ? 'win' : forced === 'place' ? 'place' : forced === 'lose' ? 'lose'
      : (rand(S) < 0.25 ? 'win' : rand(S) < 0.6 ? 'place' : 'lose');
    if (result === 'win') {
      out = { revenueDelta: pct(r, 0.30), costDelta: 0, repeatRateDelta: 0.12,
        text: `WINNERS! ${biz.name} took first place — the trophy is in the window and the phone will not stop. Revenue +${fmt(S, pct(r, 0.30))} this month, repeat customers +12%.` };
    } else if (result === 'place') {
      out = { revenueDelta: pct(r, 0.10), costDelta: 0, repeatRateDelta: 0.05,
        text: `${biz.name} placed in the competition — no trophy, but the judges named the ${biz?.typeId === 'bakery' ? 'baking' : biz?.typeId === 'roastery_chain' ? 'coffee' : 'cooking'}. Revenue +${fmt(S, pct(r, 0.10))} this month, repeat customers +5%.` };
    } else {
      out = { revenueDelta: 0, costDelta: 0, repeatRateDelta: -0.03,
        text: `${biz.name} went out in the first round of the competition. No extra revenue, repeat customers −3% — the regulars noticed.` };
    }
    biz.lastCompetitionResult = { outcome: result, year: S.year, month: S.month, text: out.text };
  } else if (eff.decisionId === 'retail_supplier_cheap') {
    const bad = forced === 'bad' ? true : forced === 'fine' ? false : rand(S) < 0.35;
    if (bad) {
      out = { revenueDelta: -pct(r, 0.08), costDelta: 0, repeatRateDelta: -0.1,
        text: `${biz?.typeId === 'cyber_cafe' ? 'The cheap line kept dropping mid-game — the regulars walked out and word spread.' : biz?.typeId === 'video_rental' ? 'The cheap tapes were worn and chewed — customers brought them back and word spread.' : 'The cheap batch was BAD — customers brought goods back and word spread.'} Revenue −${fmt(S, pct(r, 0.08))} this month, repeat customers −10%. The cheap supplier is still costing you less each month, but this month it cost you your name.` };
    } else {
      out = { revenueDelta: 0, costDelta: 0, repeatRateDelta: 0,
        text: `${biz?.typeId === 'cyber_cafe' ? 'The cheap line held up this month — no dropouts, and the lower costs are still in your favour.' : biz?.typeId === 'video_rental' ? 'The cheap tapes played fine this month — no complaints, and the lower costs are still in your favour.' : 'The cheap batch was fine this month — no complaints, and the lower costs are still in your favour.'}` };
    }
    biz.lastSupplierOutcome = { bad, year: S.year, month: S.month, text: out.text };
  } else if (eff.decisionId === 'tech_disagree_overrule') {
    const quits = forced === 'quits' ? true : forced === 'stays' ? false : rand(S) < 0.40;
    const name = eff.data?.cofounderName || biz.cofounder?.name || 'your co-founder';
    if (quits) {
      if (biz.cofounder) biz.cofounder = null;
      biz.lastCofounderOutcome = { quits: true, year: S.year, month: S.month, text: `${name} quit. "If my name is on it, my say counts." They walked out with their 20%.` };
      addSlice(S, biz, 'tech_disagree_overrule', 'Co-founder quit', { months: 3, monthlyRevenue: -pct(r, 0.10), monthlyRepeat: 0, delayMonths: 0 });
      /* The slice above lands from next month; this month's hit is fewer customers coming back. */
      out = { revenueDelta: 0, costDelta: 0, repeatRateDelta: -0.05,
        text: `${name} quit. "If my name is on it, my say counts." They walked out with their 20%. Revenue −${fmt(S, pct(r, 0.10))} a month for 3 months from next month, repeat customers −5%.` };
    } else {
      biz.lastCofounderOutcome = { quits: false, year: S.year, month: S.month, text: `${name} stayed, grudgingly. Nothing changes — for now.` };
      out = { revenueDelta: 0, costDelta: 0, repeatRateDelta: 0, text: `${name} stayed, grudgingly. Nothing changes — for now.` };
    }
  }
  if (out.text) logDecision(S, biz, eff.decisionId, eff.label, out.text);
  return out;
}

export function applyDecisionEffects(S, biz) {
  if (!biz) return { revenueDelta: 0, costDelta: 0, repeatRateDelta: 0, revenueMult: null, notes: [] };
  ensureDecisionState(S, biz);
  const now = nowIdx(S);
  let revenueDelta = 0, costDelta = 0, repeatRateDelta = 0;
  let revenueMult = null;
  const notes = [];

  /* Pre-launch startup: revenue stays near zero while the product is
     not launched. Only once the player has started staging (a stage
     is recorded) — a normally-launched tech business is unaffected. */
  if (biz.startupStage && startupStageOf(biz) !== 'launched') {
    revenueMult = 0.08;
    notes.push(`${biz.name} is still pre-launch (${STARTUP_STAGE_LABELS[startupStageOf(biz)]}): revenue ×0.08.`);
  }

  const effects = [...(biz.decisionEffects || [])];
  for (const eff of effects) {
    if (eff.lastAppliedMonth === now) continue; /* idempotent within the month */
    if (eff.kind === 'oneshot') {
      if (now < eff.landsMonth) continue;
      const res = resolveOneshot(S, biz, eff);
      revenueDelta += res.revenueDelta;
      costDelta += res.costDelta;
      if (res.repeatRateDelta) repeatRateDelta += res.repeatRateDelta;
      if (res.text) notes.push(res.text);
      biz.decisionEffects = (biz.decisionEffects || []).filter(e => e !== eff);
      continue;
    }
    /* slice / client / contract */
    if (now < eff.landsMonth) continue;
    if ((eff.monthsLeft || 0) <= 0) { biz.decisionEffects = (biz.decisionEffects || []).filter(e => e !== eff); continue; }
    if (eff.kind === 'contract') {
      const staff = biz.staff || [];
      const avgMorale = averageMorale(biz);
      let failChance = 0.08;
      if (staff.length < 2) failChance = 0.50;
      else if (avgMorale !== null && avgMorale < 40) failChance = 0.35;
      const forced = eff.data?.force || null;
      const failed = forced === 'fail' ? true : forced === 'ok' ? false : rand(S) < failChance;
      if (failed) {
        const penalty = eff.data?.penalty || pct(rev(S, biz), 0.30);
        costDelta += penalty;
        repeatRateDelta += -0.06;
        const org = eff.data?.org || 'the client';
        const text = `${biz.name} FAILED to deliver on the ${org} contract — the ${fmt(S, penalty)} penalty was charged this month, repeat customers −6%, and the contract is over.`;
        biz.activeContract = null;
        logDecision(S, biz, eff.decisionId, eff.label, text);
        notes.push(text);
        biz.decisionEffects = (biz.decisionEffects || []).filter(e => e !== eff);
        continue;
      }
      /* Delivered this month: the revenue slice below still lands. */
    }
    revenueDelta += eff.monthlyRevenue || 0;
    costDelta += eff.monthlyCost || 0;
    if (eff.revenueMult != null) revenueMult = revenueMult == null ? eff.revenueMult : Math.min(revenueMult, eff.revenueMult);
    if ((eff.monthlyRepeat || 0) !== 0 && !eff.repeatApplied) {
      repeatRateDelta += eff.monthlyRepeat;
      eff.repeatApplied = true;
    }
    eff.monthsLeft -= 1;
    eff.lastAppliedMonth = now;
    if (eff.kind === 'client' && now >= (eff.termEndMonth || 0)) {
      const forced = eff.data?.force || null;
      const leaves = forced === 'leaves' ? true : forced === 'stays' ? false : rand(S) < 0.30;
      const org = eff.data?.org || 'the big client';
      if (leaves) {
        biz.bigClient = null;
        addSlice(S, biz, eff.decisionId, `Lost big client — ${org}`, { months: 2, monthlyRevenue: -pct(rev(S, biz), 0.15), monthlyRepeat: -0.04, delayMonths: 0 });
        const text = `${org} left at the end of the term — they took their business elsewhere. Revenue −${fmt(S, pct(rev(S, biz), 0.15))} a month for 2 months, repeat customers −4%.`;
        logDecision(S, biz, eff.decisionId, eff.label, text);
        notes.push(text);
        biz.decisionEffects = (biz.decisionEffects || []).filter(e => e !== eff);
      } else {
        eff.monthsLeft = 6;
        eff.termEndMonth = now + 6;
        const text = `${org} renewed for another 6 months — the big client stays.`;
        logDecision(S, biz, eff.decisionId, eff.label, text);
        notes.push(text);
      }
      continue;
    }
    if (eff.kind === 'contract' && (eff.monthsLeft || 0) <= 0) {
      const org = eff.data?.org || 'the client';
      const text = `The ${org} contract ran its full 12 months and ended cleanly — every delivery made.`;
      biz.activeContract = null;
      logDecision(S, biz, eff.decisionId, eff.label, text);
      notes.push(text);
    }
    if ((eff.monthsLeft || 0) <= 0) biz.decisionEffects = (biz.decisionEffects || []).filter(e => e !== eff);
  }
  return { revenueDelta, costDelta, repeatRateDelta, revenueMult, notes };
}

/* Fold helper (the coordinator's fold, in one place so the test and
   the settlement cannot drift apart). Takes the P&L computeBusinessMonth
   returned and the applyDecisionEffects result for the same month. */
export function foldDecisionEffectsIntoPL(S, pl, eff) {
  if (!pl) return pl;
  if (eff && eff.revenueMult != null) pl.revenue = Math.round(pl.revenue * eff.revenueMult);
  if (eff) {
    pl.revenue += eff.revenueDelta || 0;
    /* v2.20 I3 (worker I3 hunk — the only change in this file) — ONE
       cost identity: a negative cost delta is added to other in full,
       never floored at 0. The old max(0, other + delta) kept the full
       negative delta in costs while other stopped at 0, so costs fell
       BELOW the visible rows (the same mechanism as the month-effects
       fold in businessMonthly.js step 5.5). Only the total is clamped,
       at the final identity in businessMonthly.js step 10. */
    pl.other = (pl.other || 0) + (eff.costDelta || 0);
    pl.costs = (pl.costs || 0) + (eff.costDelta || 0);
  }
  pl.profit = pl.revenue - pl.costs;
  pl.tax = computeBusinessTax(S, pl.profit).tax;
  pl.net = pl.profit - pl.tax;
  return pl;
}

export function renderDecisionsHtml(S, biz) {
  if (!biz) return '';
  const list = decisionsForBusiness(S, biz);
  const group = decisionSectionLabel(biz);
  const rows = list.map(d => {
    const costTxt = d.cost > 0 ? `Costs ${fmt(S, d.cost)}` : 'Free';
    const btn = d.available
      ? `<button class="btn btn-sm" data-action="biz-decision" data-biz="${escHtml(biz.id)}" data-decision="${escHtml(d.id)}">${escHtml(d.label)}</button>`
      : `<button class="btn btn-sm" disabled title="${escHtml(d.lockReason)}">${escHtml(d.label)}</button>`;
    return `<div class="biz-decision-row" style="padding:6px 0;border-bottom:1px solid var(--hatch-widget-border, #ddd);">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;">
        <strong>${escHtml(d.label)}</strong><span class="muted">${escHtml(costTxt)}</span>
      </div>
      <div class="muted" style="font-size:12px;">${escHtml(d.effectText)}</div>
      ${d.available ? '' : `<div class="muted" style="font-size:12px;">Not available: ${escHtml(d.lockReason)}</div>`}
      <div style="margin-top:4px;">${btn}</div>
    </div>`;
  }).join('');
  const verdicts = [];
  if (biz.lastCriticVerdict) verdicts.push(`<div style="margin-top:6px;"><strong>Last critic's verdict (${biz.lastCriticVerdict.month}/${biz.lastCriticVerdict.year}):</strong> ${escHtml(biz.lastCriticVerdict.text)}</div>`);
  if (biz.lastCompetitionResult) verdicts.push(`<div style="margin-top:6px;"><strong>Last competition (${biz.lastCompetitionResult.month}/${biz.lastCompetitionResult.year}):</strong> ${escHtml(biz.lastCompetitionResult.text)}</div>`);
  if (biz.lastSupplierOutcome) verdicts.push(`<div style="margin-top:6px;"><strong>Last supplier batch (${biz.lastSupplierOutcome.month}/${biz.lastSupplierOutcome.year}):</strong> ${escHtml(biz.lastSupplierOutcome.text)}</div>`);
  {
    /* v2.20 I2 — the stage line is only for the two pre-revenue startup
       types (a trading business is simply launched, nothing to show);
       the ownership line only when it is not 100% or a co-founder
       holds a share — equity is real now (sale price factors it). */
    const parts = [];
    if (PRE_REVENUE_STARTUP_TYPES.includes(String(biz.typeId || ''))) parts.push(`Startup stage: ${escHtml(STARTUP_STAGE_LABELS[startupStageOf(biz)])}`);
    if ((biz.equityOwned ?? 100) < 100 || biz.cofounder) parts.push(`you own ${Math.round(biz.equityOwned ?? 100)}%${biz.cofounder ? ` · co-founder ${escHtml(biz.cofounder.name)} (${biz.cofounder.equityPct}%)` : ''}`);
    if (parts.length) verdicts.push(`<div style="margin-top:6px;" class="muted">${parts.join(' · ')}.</div>`);
  }
  return `
  <div class="biz-decisions-section" style="margin-top:10px;">
    <h4>Decisions — ${escHtml(group)}</h4>
    <div class="muted" style="margin-bottom:6px;">Each decision states its cost and its effect before you commit.</div>
    ${verdicts.join('')}
    ${rows}
  </div>`;
}
