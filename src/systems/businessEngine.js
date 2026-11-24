/* ============================================================================
   World Life 2.0 — Business Engine (v2.11 W1: Core, v2.14 §1: no cap)
   Multiple businesses at once (no hard cap — management capacity is
   the limit: your hours plus your managers, see businessCapacity.js),
   monthly P&L with premises rent, wages and tax on profit under the
   country's own income-tax brackets, volatility + maxLevel, era-gated
   venture list, run ops with caps and cooldowns, workload / "Stretched"
   time conflict, and the miss-1 -> fee / miss-2 ->
   warning / miss-3 -> closure chain.

   Contract (coordinator, binding):
   - S.career.businesses[] is the list; S.career.business stays a live
     mirror (= businesses[0] or null, same object reference).
   - monthlyCost = OTHER costs only (supplies, utilities, marketing).
     Wages come from biz.staff, rent from biz.premises.monthlyRentLocal.
   - P&L posts THREE ledger lines per business per month: revenue in,
     costs out (label breaks out rent + wages + other), tax out.
     Net = revenue - costs - tax. Profit lands NET of tax.
   - A business that cannot pay goes miss 1 -> late fee, miss 2 ->
     warning scene, miss 3 -> closure/repossession. Never silently frozen.
   - HOLD THE LINE (Verdant finding): Verdant's business P&L is FAKE —
     its restaurant's -$115k/yr and Pawn Shop's $7k/mo running costs
     NEVER hit personal cash. Ours is real: every pound of revenue,
     rent, wages, other costs and tax moves the ledger.
   ========================================================================== */

import { rand, clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove, recordLedgerEntry, queueScene, ensureExtendedState, MONTH_NAMES } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { convertCurrency, computeMonthlyNetPay, eraSalary } from '../data/economy.js';
import { BUSINESS_TYPES } from '../data/institutions.js';
import { V1_BUSINESS_TYPES, EXTRA_BUSINESSES } from '../data/megaCareerEduMedical.js';
/* v2.11 W2 owns businessStaff.js. It is imported here so a closure
   fires the team through the one staff function, revenue uses W2's
   teamMoraleFactor, and the Team Bonus op lifts morale through W2's
   applyStaffBonus — one morale rule, not two. */
import { fireAllStaff, teamMoraleFactor, applyStaffBonus, seedStartingStaff, staffRolesForType, roleWageLocal, splitWagesFromCostLump, otherCostsFloor } from './businessStaff.js';
/* v2.14 §1 owns businessCapacity.js. It is imported here so launch
   gating can state the real constraint (your free hours vs a manager's
   salary), workload can skip managed businesses, the monthly tick can
   decay unmanaged businesses, and the P&L can charge the manager's
   wage and cut an unmanaged business's revenue. One-way dependency:
   businessCapacity.js never imports this file. */
import { managementCapacityInfo, businessIsManaged, unmanagedRevenueMult, tickBusinessCapacityMonth, OWNER_FULL_TIME_HOURS, OWNER_PART_TIME_HOURS, OWNER_STRETCHED_HOURS } from './businessCapacity.js';
/* v2.20 I4 — the level cap is one function of the premises
   (businessPremises.js): a home business caps at level 2, a rented or
   owned unit has no cap. businessPremises.js never imports this file,
   so this import cannot cycle. */
import { businessLevelCap } from './businessPremises.js';
/* v2.20 I3 — the manager wage estimate on the launch screen comes from
   the same tier-scaled curve the shortlist asks on (businessManager.js),
   never from the flat staff-role rate. No cycle: businessManager.js
   never imports this file. */
import { managerWageRangeForVenture, managerWageForBusiness } from './businessManager.js';

/* Weekly hours a business needs from its owner, by mode — ONE
   definition, owned by businessCapacity.js (the allocation walk).
   These aliases keep the old names working for existing importers. */
export const BUSINESS_FULL_TIME_HOURS = OWNER_FULL_TIME_HOURS;
export const BUSINESS_PART_TIME_HOURS = OWNER_PART_TIME_HOURS; /* part-time = 18 hrs/week, exactly */
export const BUSINESS_STRETCHED_HOURS = OWNER_STRETCHED_HOURS;
/* Revenue multipliers shared with the launch list and the P&L, so the
   cost figures the player sees before launching are the same rule the
   P&L charges after. v2.17: no estimate is shown before launch. */
export const BUSINESS_PART_TIME_REV_MULT = 0.6;
export const BUSINESS_HOME_REV_MULT = 0.8;
/* Part-time other costs: a business run 18 hours a week buys less
   stock, uses less power and spends less on marketing — most of the
   "other" costs vary with how much the business actually trades. 0.75,
   not 0.6, because some of it (insurance, licences, subscriptions) is
   fixed. Without this, part-time lost money for 49 of 52 ventures — a
   side business that can never pay is not a real choice, it is a trap. */
export const BUSINESS_PART_TIME_COST_MULT = 0.75;

/* Absolute month index, so cooldowns/buffs survive year boundaries. */
export function businessMonthIndex(S) {
  return (Number(S.year) || 2026) * 12 + (Number(S.month) || 1);
}

function monthYearLabel(S, idx) {
  const y = Math.floor(idx / 12);
  const m = idx - y * 12;
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${names[Math.max(0, Math.min(11, m - 1))]} ${y}`;
}

/* ------------------------------------------------------------------ *
   Industry (drives the run-op labels — a restaurant "Refreshes its
   Menu", a tech studio "Launches a Feature", a shop "Runs a Promotion").
   ------------------------------------------------------------------ */
export function industryForBusiness(typeId, label = '') {
  const hay = `${String(typeId || '')} ${String(label || '')}`.toLowerCase();
  if (/clinic|pharmacy|dental|vet|physio|diagnostic|lab|medical|health/.test(hay)) return 'health';
  if (/caf|restaurant|bakery|roastery|food|fruit/.test(hay)) return 'food';
  if (/software|saas|ai_|tech|cyber|ecommerce|e-commerce|mobile_shop|digital/.test(hay)) return 'tech';
  if (/retail|shop|store|bookstore|fashion|boutique|market/.test(hay)) return 'retail';
  return 'services';
}

const RD_LABEL_BY_INDUSTRY = {
  food: 'Refresh Menu',
  tech: 'Launch Feature',
  retail: 'Run a Promotion',
  services: 'New Service Line',
  health: 'New Treatment'
};

export function businessOpLabel(biz, opId) {
  const ind = industryForBusiness(biz?.typeId, biz?.name);
  if (opId === 'rd') return RD_LABEL_BY_INDUSTRY[ind] || 'New Service Line';
  if (opId === 'bonus') return 'Team Bonus';
  if (opId === 'pricing') return 'Premium / Value Positioning';
  return opId;
}

export const BUSINESS_OP_COOLDOWNS = { rd: 12, bonus: 3, pricing: 1 };

export function normalizeBusinessOpId(raw) {
  if (raw === 'rd_quality' || raw === 'rd') return 'rd';
  if (raw === 'staff_bonus' || raw === 'bonus') return 'bonus';
  return 'pricing';
}

export function businessOpCost(S, biz, opId) {
  if (opId === 'rd') return Math.max(500, Math.round((biz.monthlyRev || 0) * 0.65));
  if (opId === 'bonus') return Math.max(300, Math.round((biz.monthlyCost || 0) * 0.35));
  return 0; /* pricing: repositioning costs nothing but time (1-month cooldown) */
}

export function businessOpEffectText(opId) {
  if (opId === 'rd') return '+14% revenue for 12 months';
  if (opId === 'bonus') return '−5% other costs for 3 months';
  return 'Toggle between premium (+9% revenue, +3% costs) and value (−7% revenue, −3% costs) positioning';
}

export function businessOpInfo(S, biz, opIdRaw) {
  const opId = normalizeBusinessOpId(opIdRaw);
  const now = businessMonthIndex(S);
  const last = Number(biz.lastOpUsed?.[opId] ?? -9999);
  const cd = BUSINESS_OP_COOLDOWNS[opId] || 1;
  const monthsLeft = Math.max(0, cd - (now - last));
  /* v2.20 I2 — the food "Refresh Menu" and retail "Run a Promotion"
     run-ops are REMOVED: the Decisions tab holds the real one (a food
     decision at 8% of revenue, not a run-op at 65% of revenue), and
     the two prices contradicted each other in Elsayed's playtest
     (13,585 vs 1,672 for the same action). The op can no longer run
     — runBusinessOp refuses it through info.available — and the
     locked pill names the replacement instead of a date. */
  if (opId === 'rd') {
    const ind = industryForBusiness(biz?.typeId, biz?.name);
    if (ind === 'food' || ind === 'retail') {
      return {
        id: opId,
        label: businessOpLabel(biz, opId),
        cost: 0,
        effect: ind === 'food'
          ? 'Removed — refresh the menu from Decisions below (the real decision, one price).'
          : 'Removed — run a sale from Decisions below (the real decision, one price).',
        cooldownMonths: cd,
        available: false,
        availableInMonths: 0,
        nextAvailableLabel: 'Removed — see Decisions',
        removed: true
      };
    }
  }
  return {
    id: opId,
    label: businessOpLabel(biz, opId),
    cost: businessOpCost(S, biz, opId),
    effect: businessOpEffectText(opId),
    cooldownMonths: cd,
    available: monthsLeft <= 0,
    availableInMonths: monthsLeft,
    nextAvailableLabel: monthsLeft > 0 ? monthYearLabel(S, now + monthsLeft) : 'Available now'
  };
}

/* ------------------------------------------------------------------ *
   Venture catalogue: all three tables merged, era-filtered, deduped.
   BUSINESS_TYPES first, then EXTRA_BUSINESSES, then V1 rows.
   ------------------------------------------------------------------ */
function normalizeVentureRow(b, source) {
  if (source === 'v1') {
    const capUsd = Math.max(2500, Math.round((b.startupEGP || 600000) / 50));
    const revUsd = Math.max(800, Math.round((b.baseRevenueEGP || 150000) / 50));
    const costUsd = Math.max(400, Math.round((b.monthlyOverheadEGP || 65000) / 50));
    return {
      id: b.id, label: b.label, desc: b.desc || '',
      capitalUsd2026: capUsd, monthlyRevUsd2026: revUsd, monthlyCostUsd2026: costUsd,
      reqMajor: b.requiresDegree || b.reqMajor || null,
      volatility: (typeof b.volatility === 'number' ? b.volatility : 0.25),
      maxLevel: b.maxLevel || Infinity, /* v2.17 W2: no ceiling — a level can keep growing */
      from: b.from || 1960, to: b.to || null,
      industry: industryForBusiness(b.id, b.label)
    };
  }
  return {
    id: b.id, label: b.label, desc: b.desc || '',
    capitalUsd2026: b.capitalUsd2026, monthlyRevUsd2026: b.monthlyRevUsd2026,
    monthlyCostUsd2026: b.monthlyCostUsd2026,
    reqMajor: b.reqMajor || null,
    volatility: (typeof b.volatility === 'number' ? b.volatility : 0.25),
    maxLevel: b.maxLevel || Infinity, /* v2.17 W2: no ceiling — a level can keep growing */
    from: b.from || 1960, to: b.to || null,
    industry: industryForBusiness(b.id, b.label)
  };
}

export function listAllBusinessVentures(S) {
  const seen = new Set();
  const list = [];
  const pushRow = (row) => {
    if (seen.has(row.id)) return;
    if (row.from && S.year < row.from) return;
    if (row.to && S.year > row.to) return;
    seen.add(row.id);
    list.push(row);
  };
  for (const b of (BUSINESS_TYPES || [])) pushRow(normalizeVentureRow(b, 'modern'));
  for (const eb of (EXTRA_BUSINESSES || [])) pushRow(normalizeVentureRow(eb, 'modern'));
  for (const vb of (V1_BUSINESS_TYPES || [])) pushRow(normalizeVentureRow(vb, 'v1'));
  return list;
}

export function findVentureRow(S, typeId) {
  return listAllBusinessVentures(S).find(b => b.id === typeId) || null;
}

export function countVentureRows() {
  const seen = new Set();
  let total = 0;
  for (const t of [BUSINESS_TYPES, EXTRA_BUSINESSES, V1_BUSINESS_TYPES]) {
    for (const b of (t || [])) { if (!seen.has(b.id)) { seen.add(b.id); total += 1; } }
  }
  return total;
}

/* ------------------------------------------------------------------ *
   v2.18 W4 — venture repricing per country.
   THE DEFECT. The venture rows are Egypt-calibrated (v2.11 data: the
   V1 rows are Egypt EGP / 50, the modern rows are USD figures that are
   only viable at Egypt's wage level). evaluateBusinessLaunch converted
   them with convertCurrency — a pure FX conversion — so a venture's
   takings in a country are just its Egypt takings at the exchange
   rate. But the wage bill is NOT converted: roleWageLocal pays the
   country's REAL staff pay (role factor x the country's monthly MID
   salary). In Egypt the two agree (mid pay is ~$358/month in 2026, so
   takings of 14.5 mid-salaries cover a wage bill of ~2.15 of them);
   in a high-wage country they do not. Measured before the fix (2024,
   the distribution harness's year): a USA cafe takes in $5,200/month
   and its 3-person starter team (barista + waiter + manager) costs
   $13,717/month — wages 2.6x takings, dead in month 2, every time.
   A UAE cafe takes in 19,097 AED/month against a 40,850 AED wage
   bill. Only 8 of 48 ventures are launchable in the USA, 17 of 48 in
   the UAE (and the distribution script's 0-of-13 UAE figure was its
   'are' id falling back to Egypt wages with USD takings — fixed at the
   v2.18 merge: the harness now lists the real 'uae' id, re-run in v2.19
   at 100 lives / 100 launched, failure 9.0%, breakout 70.0%, UAE 12
   launched / 0 dead / 10 broke out; see tests/v219-w3-verify.mjs).
   THE RULE. A venture's three money figures (capital, monthly
   takings, monthly other costs) scale with the country's real wage
   level: the ratio of the country's monthly MID salary to Egypt's,
   both in USD at the game year, built from the game's own machinery
   only — eraSalary on the per-country salary tiers, convertCurrency
   for the common currency. No new FX table, no new wage table, and
   the salary tiers themselves are untouched. The wage bill is already
   the country's real staff pay, so scaling takings by the same ratio
   keeps the wage share — and therefore the margin — a venture has in
   Egypt, in every country. Egypt's ratio is exactly 1 by
   construction (the same computation on both sides), so Egypt
   numbers do not move at all. Rent is NOT scaled: it is already the
   country's real rent (eraSalary on rentStandard), and the manager
   wage estimate is already real-local too.
   Consequence to be honest about: the absolute takings look large in
   rich countries (a USA cafe takes in ~$99,000/month in 2026) —
   because the venture is defined as the same RELATIVE size as its
   Egypt original (about 14.5 local mid-salaries of takings a month),
   not as a fixed dollar shop. What is preserved is the economics:
   the wage share, the payback period and the margin.
   GUARDS. An unknown country id gets scale 1 (no repricing — a bad
   id can never inflate a price). A degenerate ratio (Turkey before
   2000: the game's own CPI/FX machinery prices the old lira at ~$0,
   so the mid salary in USD comes out 0) falls back to the 2026
   ratio; if that is degenerate too, scale 1. The [0.05, 50] clamp
   never binds on real data (measured ratios run 0.88–22.5 across
   countries and eras) — it only stops a degenerate ratio from
   zeroing or exploding a price.
   ------------------------------------------------------------------ */
export function ventureWageScale(countryId, year = 2026) {
  const y = Number(year) || 2026;
  const cObj = getCountry(countryId);
  if (!countryId || cObj.id !== countryId) return 1;
  const midUsdAt = (yy) => {
    const mid = eraSalary(getCountry(countryId).annualSalaryTiers2026.mid / 12, countryId, yy);
    const midEgy = eraSalary(getCountry('egy').annualSalaryTiers2026.mid / 12, 'egy', yy);
    const usd = convertCurrency(mid, countryId, 'usa', yy);
    const usdEgy = convertCurrency(midEgy, 'egy', 'usa', yy);
    if (!Number.isFinite(usd) || !Number.isFinite(usdEgy) || usd <= 0 || usdEgy <= 0) return NaN;
    return usd / usdEgy;
  };
  let scale = midUsdAt(y);
  if (!Number.isFinite(scale) || scale <= 0) scale = midUsdAt(2026);
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.min(50, Math.max(0.05, scale));
}

/* One place for a venture row's three money figures in local
   currency, so the launch screen, the launch itself and a business
   for sale all price the same venture the same way. v2.20 I3: other
   costs are floored at 25% of the takings — a venture whose row cost
   is a joke number next to its takings gets a real other-costs line
   instead of one the P&L then reads as ~nothing. Measured Egypt 2022
   the floor never binds (every row's own cost is already >= 25% of
   its takings); it only guards degenerate data. */
export function ventureLocalPricing(S, bp) {
  const scale = ventureWageScale(S.country, S.year);
  const revLocal = Math.round(convertCurrency(bp.monthlyRevUsd2026, 'usa', S.country, S.year) * scale);
  return {
    scale,
    capitalLocal: Math.round(convertCurrency(bp.capitalUsd2026, 'usa', S.country, S.year) * scale),
    revLocal,
    costLocal: Math.max(otherCostsFloor(revLocal), Math.round(convertCurrency(bp.monthlyCostUsd2026, 'usa', S.country, S.year) * scale))
  };
}

/* Launch evaluation — ONE function, used by the launch code AND by the
   Ventures tab, so the tab never shows a launch button on a locked
   option that would auto-reject (the Verdant anti-pattern: Apply
   buttons on degree-locked jobs that then auto-reject).
   v2.17: reputation deleted — the old player-standing launch gate is
   gone from the business launch path; a venture is gated on age,
   licence and capital only. The player's own standing is untouched.
   ------------------------------------------------------------------ */
export function evaluateBusinessLaunch(S, bp, mode = null) {
  ensureExtendedState(S);
  migrateBusinesses(S);
  const locks = [];
  if ((S.player?.age ?? 0) < 19) locks.push('You must be 19 or older to register a company.');
  if (bp.reqMajor && !S.education.degrees.includes(bp.reqMajor)) {
    locks.push(`Licensing requires a ${String(bp.reqMajor).toUpperCase()} qualification.`);
  }
  /* v2.18 W4 — repriced per country (ventureWageScale above): the
     row's capital, takings and other costs scale with the country's
     real wage level, so the wage bill the launch seeds is covered the
     way it is in Egypt. Egypt's scale is exactly 1, so its numbers
     are unchanged. */
  const pricing = ventureLocalPricing(S, bp);
  const capitalLocal = pricing.capitalLocal;
  const revLocal = pricing.revLocal;
  const costLocal = pricing.costLocal;
  if ((S.money?.cash || 0) < capitalLocal) {
    locks.push(`Needs ${formatMoney(capitalLocal, S.country)} startup capital (you have ${formatMoney(S.money?.cash || 0, S.country)} in cash).`);
  }
  /* No number cap any more (v2.14 §1): the limit is management
     capacity — your free hours, or a manager's salary. The launch is
     never refused for hours alone here (a launch the player insists
     on self-running with no hours left goes unmanaged and decays —
     that is the enforcement, not a refusal); the screen states the
     real constraint in plain words and offers both paths. */
  const capacity = managementCapacityInfo(S);
  const ownerHoursFree = capacity.ownerHoursFree;
  /* v2.20 I3 — ONE wage source: the manager estimate is the shortlist
     curve at junior-mid skill (skill 45) for a business this size —
     the same curve the candidates ask on — and the screen shows the
     whole range the shortlist really asks, not a flat staff-role rate
     no candidate ever asks (the old 1.00 × mid estimate could never
     equal any ask, by construction). Measured Egypt 2022 fruit stall:
     estimate 6,394/mo, range 5,981–6,806/mo (was a flat 8,250). */
  const managerWageRangeLocal = managerWageRangeForVenture(S, revLocal, capitalLocal, S.country);
  const managerWageEstimateLocal = managerWageForBusiness(S, { monthlyRev: revLocal, capitalInvested: capitalLocal, country: S.country }, 45);
  const selfRunFullTimeOk = ownerHoursFree >= BUSINESS_FULL_TIME_HOURS;
  const selfRunPartTimeOk = ownerHoursFree >= BUSINESS_PART_TIME_HOURS;
  const needsManager = !selfRunPartTimeOk;
  const selfRunNote = selfRunFullTimeOk
    ? 'You run this yourself: 40h/week.'
    : selfRunPartTimeOk
      ? `You run this yourself: 18h/week part-time — a full-time business needs 40h/week, and you have ${ownerHoursFree}h/week free.`
      : '';
  const managerNote = `Needs a manager: managers for a business this size ask about ${formatMoney(managerWageRangeLocal.low, S.country)}–${formatMoney(managerWageRangeLocal.high, S.country)}/month (skill ${managerWageRangeLocal.lowSkill}–${managerWageRangeLocal.highSkill}).`;
  const constraintNote = needsManager
    ? `${managerNote} You have ${ownerHoursFree}h/week free — not enough to run it yourself, even part-time.`
    : `${selfRunNote} Or hire a manager instead: managers for a business this size ask about ${formatMoney(managerWageRangeLocal.low, S.country)}–${formatMoney(managerWageRangeLocal.high, S.country)}/month, and it costs none of your hours.`;
  /* When the caller knows the mode (the launch screen does), report
     the constraint for that mode specifically. */
  const modeHours = mode === 'full_time' ? BUSINESS_FULL_TIME_HOURS
    : mode === 'part_time' ? BUSINESS_PART_TIME_HOURS : null;
  const selfRunOkForMode = modeHours === null ? null : ownerHoursFree >= modeHours;
  /* v2.20 I3 — TRUE monthly cost, corrected model: the venture row's
     monthlyCost is OTHER costs only (supplies, utilities, marketing),
     NOT a lump containing wages — so the total is other + the starter
     wage bill (+ rent once it moves out of the house), never the lump
     alone. The old formula (lump + rent) left the whole wage bill out
     and made every venture look ~13,000/mo cheaper than it is.
     Expected settled takings (what the P&L really pays, after the
     part-time ×0.6 / home ×0.8 multipliers and a 0.9 wave allowance)
     are exposed for the viability warning, so the warning and the
     launch screen test the same numbers. */
  const midMonthly = eraSalary(getCountry(S.country).annualSalaryTiers2026.mid / 12, S.country, S.year);
  const starterRoles = staffRolesForType(bp.id);
  const wageEstimateLocal = starterRoles.length > 0
    ? starterRoles.slice(0, 3).reduce((sum, role) => sum + roleWageLocal(S, role, S.country), 0)
    : Math.round(midMonthly * 0.6) * 3;
  const rentEstimateLocal = Math.round(eraSalary(getCountry(S.country).monthlyBasket2026.rentStandard, S.country, S.year) * 0.8);
  const trueMonthlyCostLocal = costLocal + wageEstimateLocal + rentEstimateLocal;
  const expectedRevFullTimeHome = Math.round(revLocal * BUSINESS_HOME_REV_MULT * 0.9);
  const expectedRevPartTimeHome = Math.round(revLocal * BUSINESS_PART_TIME_REV_MULT * BUSINESS_HOME_REV_MULT * 0.9);
  /* Part-time other costs run at BUSINESS_PART_TIME_COST_MULT (the P&L
     charges other ×0.75 part-time — some of it is fixed) — the warning
     tests the same numbers the P&L charges, not the full-time figure. */
  const monthlyCostPartTimeHomeSelf = Math.round(costLocal * BUSINESS_PART_TIME_COST_MULT) + wageEstimateLocal;
  const monthlyCostPartTimeHomeManagerRun = monthlyCostPartTimeHomeSelf + managerWageEstimateLocal;
  const monthlyCostFullTimeHomeSelf = costLocal + wageEstimateLocal;
  return {
    ok: locks.length === 0,
    locks,
    capitalLocal, revLocal, costLocal,
    ventureScale: pricing.scale, /* v2.18 W4 — the per-country wage-level scale applied above (1 in Egypt) */
    wageEstimateLocal, rentEstimateLocal, trueMonthlyCostLocal,
    eraLabel: bp.to ? `Available ${bp.from}–${bp.to}` : `Available since ${bp.from}`,
    /* v2.14 §1 — management capacity (the real constraint, in plain
       words, for the launch screen). ok above is the hard locks only
       (age / licence / capital): a launch is possible
       through either path. selfRun* say whether YOUR hours cover it;
       needsManager says even part-time does not fit, so the honest
       screen shows the manager path. */
    ownerHoursUsed: capacity.ownerHoursUsed,
    ownerHoursFree,
    hoursNeededFullTime: BUSINESS_FULL_TIME_HOURS,
    hoursNeededPartTime: BUSINESS_PART_TIME_HOURS,
    hoursNeeded: modeHours,
    selfRunFullTimeOk,
    selfRunPartTimeOk,
    selfRunOk: selfRunPartTimeOk,
    selfRunOkForMode,
    needsManager,
    managerWageEstimateLocal,
    managerWageRangeLocal,
    expectedRevFullTimeHome,
    expectedRevPartTimeHome,
    monthlyCostPartTimeHomeSelf,
    monthlyCostPartTimeHomeManagerRun,
    monthlyCostFullTimeHomeSelf,
    selfRunNote,
    managerNote,
    constraintNote
  };
}

/* ------------------------------------------------------------------ *
   v2.18 W4 — launch-screen viability warning, rewritten v2.20 I3.
   The old version warned only when the starter wage bill exceeded the
   venture's FULL monthly takings — it never tested the manager's wage,
   never tested wages + other costs + rent against what the business
   actually settles, and used capacity revenue before the part-time
   ×0.6 / home ×0.8 / wave cuts, so it stayed silent for the fruit
   stall (13,613 wages vs 20,900 takings). The warning now tests the
   real comparison, on the settled numbers the launch evaluation
   already computes: (staff wages + other costs [+ manager wage when
   manager-run]) against the expected settled takings (part-time from
   home first — the employed player's path — then full-time). It names
   both numbers and the monthly shortfall the player covers from their
   salary. Returns '' when the takings cover the wage bill.
   ------------------------------------------------------------------ */
export function ventureViabilityWarningHtml(S, bp, ev = null) {
  if (!S) return '';
  const e = ev || (bp ? evaluateBusinessLaunch(S, bp) : null);
  if (!e) return '';
  const fmt = (n) => formatMoney(Math.round(n), S.country);
  const wages = Number(e.wageEstimateLocal) || 0;
  const other = Number(e.costLocal) || 0;
  const otherPT = Math.round(other * BUSINESS_PART_TIME_COST_MULT);
  const managerWage = Number(e.managerWageEstimateLocal) || 0;
  const expectedPT = Number(e.expectedRevPartTimeHome) || 0;
  const expectedFT = Number(e.expectedRevFullTimeHome) || 0;
  const selfPT = (Number(e.monthlyCostPartTimeHomeSelf) || 0);
  const mgrPT = (Number(e.monthlyCostPartTimeHomeManagerRun) || 0);
  const warn = (title, text) =>
    `<div class="card" style="border:2px solid var(--brand-crimson);background:rgba(180,35,24,0.10);margin:8px 0"><strong style="color:var(--brand-crimson)">⚠ ${title}</strong> <span>${text}</span></div>`;
  /* Part-time from home, run yourself: the employed player's path. */
  if (selfPT > expectedPT) {
    const shortfall = Math.round(selfPT - expectedPT);
    return warn('This business cannot pay its own staff part-time.',
      `Your staff cost ${fmt(wages)} a month and other costs run about ${fmt(otherPT)} a month part-time, but part-time from home this takes in only about ${fmt(expectedPT)} a month — you will cover about ${fmt(shortfall)} a month from your salary. A manager would cost another ${fmt(managerWage)} a month on top. Pick a venture whose takings cover its staff pay, or be ready to cover the shortfall from your own pocket every month.`);
  }
  /* Part-time from home, manager-run: the wage bill plus the manager. */
  if (mgrPT > expectedPT) {
    const shortfall = Math.round(mgrPT - expectedPT);
    return warn('This business cannot pay its staff and a manager part-time.',
      `Your staff cost ${fmt(wages)} a month, other costs run about ${fmt(otherPT)} a month part-time and a manager asks about ${fmt(managerWage)} a month — ${fmt(mgrPT)} a month in all — but part-time from home this takes in only about ${fmt(expectedPT)} a month. You will cover about ${fmt(shortfall)} a month from your salary. Run it yourself, or pick a venture whose takings cover a manager too.`);
  }
  /* Full-time from home, run yourself. */
  const selfFT = Number(e.monthlyCostFullTimeHomeSelf) || 0;
  if (selfFT > expectedFT) {
    const shortfall = Math.round(selfFT - expectedFT);
    return warn('This business cannot pay its own staff full-time.',
      `Your staff cost ${fmt(wages)} a month and other costs run about ${fmt(other)} a month, but full-time from home this takes in only about ${fmt(expectedFT)} a month — you will cover about ${fmt(shortfall)} a month from your salary. Pick a venture whose takings cover its staff pay, or be ready to cover the shortfall from your own pocket every month.`);
  }
  return '';
}

/* ------------------------------------------------------------------ *
   Business record: migrate old saves, keep the mirror in sync.
   Old single-business saves: the old monthlyCost lump already bundled
   wages inside it, so migration splits it — estimated wages move into
   staff entries and the same amount comes OFF monthlyCost, so the old
   business's total costs do not jump on load.
   ------------------------------------------------------------------ */
export function normalizeBusiness(S, biz) {
  if (!biz || typeof biz !== 'object') return null;
  if (typeof biz.level !== 'number') biz.level = 1;
  /* v2.20 I4 — ONE level cap: businessLevelCap(biz), one function of
     the premises (home = 2, rented or owned = no cap). maxLevel is a
     stored mirror of it, refreshed here after the premises are
     defaulted below — nothing gates on the stored field any more;
     displays and expandBusiness call the function, so a move out of
     the house lifts the cap at once. */
  if (typeof biz.maxLevel !== 'number') biz.maxLevel = Infinity;
  /* v2.17 W2 — growth state (same defaults as ensureGrowthState in
     businessGrowth.js, inlined here because that file imports this
     one and a cycle is not allowed): brand value, retained earnings
     (months of profit and loss, summed), everything ever put in,
     distress stage, market slump, death, group. */
  if (typeof biz.brandValue !== 'number' || Number.isNaN(biz.brandValue)) biz.brandValue = 1000;
  biz.brandValue = Math.max(0, Math.round(biz.brandValue));
  if (typeof biz.retainedEarnings !== 'number' || Number.isNaN(biz.retainedEarnings)) biz.retainedEarnings = 0;
  biz.retainedEarnings = Math.round(biz.retainedEarnings);
  if (typeof biz.totalCapitalIn !== 'number' || Number.isNaN(biz.totalCapitalIn)) {
    biz.totalCapitalIn = Math.max(0, Math.round(Number(biz.capitalInvested) || 0));
  }
  if (typeof biz.distressStage !== 'number') biz.distressStage = 0;
  if (typeof biz.marketSlumpMonths !== 'number') biz.marketSlumpMonths = 0;
  if (biz.dead === undefined) biz.dead = false;
  if (biz.deathCause === undefined) biz.deathCause = null;
  if (biz.group === undefined) biz.group = null;
  if (biz.brokeOut === undefined) biz.brokeOut = false;
  if (!biz.isBranch && biz.branchType === undefined) biz.branchType = null;
  if (biz.isBranch && !biz.branchType) biz.branchType = 'shop';
  if (typeof biz.volatility !== 'number') biz.volatility = 0.25;
  if (!biz.mode) biz.mode = 'full_time';
  /* v2.14 §1 — management state. biz.manager is the fixed contract
     (null, or { name, skill, wage, loyalty, policy, hiredYear,
     hiredMonth, personId }); Worker 2 owns the manager itself. The
     owner fields are the INTENT (Worker 2): ownerManaged false means
     nobody runs it (a manager left and the player never took it back).
     unmanagedMonths / atRisk are the decay state (businessCapacity.js
     owns the tick). Undefined ownerManaged means owner-run, as in
     v2.11 — a launched business is run by its owner until a manager
     is hired. */
  if (biz.manager === undefined) biz.manager = null;
  if (biz.ownerManaged === undefined) biz.ownerManaged = !biz.manager;
  if (typeof biz.ownerHoursPerWeek !== 'number') {
    biz.ownerHoursPerWeek = biz.ownerManaged
      ? (biz.mode === 'full_time' ? BUSINESS_FULL_TIME_HOURS : BUSINESS_PART_TIME_HOURS)
      : 0;
  }
  if (typeof biz.unmanagedMonths !== 'number') biz.unmanagedMonths = 0;
  if (biz.atRisk === undefined) biz.atRisk = (biz.unmanagedMonths || 0) >= 3;
  if (!Array.isArray(biz.staff)) biz.staff = [];
  if (typeof biz.monthlyRev !== 'number') biz.monthlyRev = 0;
  if (typeof biz.monthlyCost !== 'number') biz.monthlyCost = 0;
  if (typeof biz.capitalInvested !== 'number') biz.capitalInvested = 0;
  /* v2.17: biz.repeatRate is the real state now — the share of
     customers who come back (0..1, 0.5 = neutral for a new business).
     The old deleted score is never set or read again; an old save may
     still carry its stale value in stored JSON, but nothing reads it. */
  if (typeof biz.repeatRate !== 'number' || Number.isNaN(biz.repeatRate)) biz.repeatRate = 0.5;
  biz.repeatRate = clamp(biz.repeatRate, 0, 1);
  if (!biz.premises) {
    biz.premises = { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 };
  }
  /* v2.20 I4 — the stored cap follows the premises (see the note
     above): a home business caps at 2, a rented or owned unit has
     no cap. */
  biz.maxLevel = businessLevelCap(biz);
  if (typeof biz.premises.monthlyRentLocal !== 'number') biz.premises.monthlyRentLocal = 0;
  if (typeof biz.premises.conditionPct !== 'number') biz.premises.conditionPct = 90;
  if (biz.loanId === undefined) biz.loanId = null;
  if (typeof biz.misses !== 'number') biz.misses = 0;
  if (typeof biz.debtLocal !== 'number') biz.debtLocal = 0;
  if (typeof biz.monthsLosing !== 'number') biz.monthsLosing = 0;
  if (!biz.buffs) biz.buffs = { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 };
  if (biz.buffs.pricingDir === undefined) biz.buffs.pricingDir = 0;
  if (!biz.lastOpUsed) biz.lastOpUsed = { rd: -9999, bonus: -9999, pricing: -9999 };
  if (!Array.isArray(biz.history)) biz.history = [];
  if (biz.heirId === undefined) biz.heirId = null;
  if (biz.remote === undefined) biz.remote = false;
  if (!biz.foundedYear) biz.foundedYear = S.year;
  if (!biz.foundedMonth) biz.foundedMonth = S.month;
  if (!biz.country) biz.country = S.country;
  if (!biz.city) biz.city = S.city;
  if (!biz.pricingMode) biz.pricingMode = biz.buffs.pricingDir === 1 ? 'premium' : biz.buffs.pricingDir === -1 ? 'value' : 'balanced';
  /* Legacy `employees` count (v2.10 and earlier) -> real staff entries. */
  if (typeof biz.employees === 'number' && biz.employees > 0 && biz.staff.length === 0) {
    const wageEach = Math.max(100, Math.round(eraSalary(getCountry(S.country).annualSalaryTiers2026.mid / 12, S.country, S.year) * 0.6));
    for (let i = 0; i < biz.employees; i++) {
      biz.staff.push({
        id: nextId(S, 'bstaff'), name: `Employee ${i + 1}`, role: 'Staff member',
        wageLocal: wageEach, morale: 65, skill: 50, hiredYear: biz.foundedYear, hiredMonth: biz.foundedMonth
      });
    }
    /* v2.20 I3 — the old lump bundled wages: move the estimated wage
       bill out of it ONLY when the lump actually contains it (see
       splitWagesFromCostLump in businessStaff.js). The old
       max(100, lump − wages) collapsed any lump smaller than its wage
       bill to 100. */
    biz.monthlyCost = splitWagesFromCostLump(biz.monthlyCost, wageEach * biz.employees, biz.monthlyRev);
  }
  biz.employees = biz.staff.length;
  if (!biz.lastPL) biz.lastPL = null;
  return biz;
}

export function migrateBusinesses(S) {
  if (!S || !S.career) return S;
  if (!Array.isArray(S.career.businesses)) S.career.businesses = [];
  if (S.career.business && typeof S.career.business === 'object') {
    const old = S.career.business;
    if (!S.career.businesses.some(b => b && b.id === old.id)) {
      S.career.businesses.unshift(normalizeBusiness(S, old));
    }
  }
  S.career.businesses = S.career.businesses.map(b => normalizeBusiness(S, b)).filter(Boolean);
  syncBusinessMirror(S);
  return S;
}

export function syncBusinessMirror(S) {
  if (!S || !S.career) return;
  if (!Array.isArray(S.career.businesses)) S.career.businesses = [];
  S.career.business = S.career.businesses[0] || null;
  return S.career.business;
}

export function resolveBusiness(S, bizRef) {
  migrateBusinesses(S);
  if (!bizRef) return S.career.business || null;
  if (typeof bizRef === 'object') return bizRef;
  return (S.career.businesses || []).find(b => b.id === bizRef) || null;
}

/* Workload: a full-time business takes ~40 hrs/week, part-time 18.
   Total = job hours + ALLOCATED business hours. Over 50 -> "Stretched".
   ------------------------------------------------------------------ */
export function computeWorkload(S) {
  migrateBusinesses(S);
  /* v2.20 I4 — ONE hour computation. The workload is the ALLOCATED
     hours from the single allocation walk in businessCapacity.js
     (managementCapacityInfo), not the intended hours: a business whose
     hours do not fit in the week costs 0 here, and the hours it needs
     but did not get are reported as uncovered, never folded into the
     total. So the header, the Stretched penalty and the card all read
     the same number: job 48 + allocated 18 = 66, free 70 − 66 = 4. */
  const cap = managementCapacityInfo(S);
  const jobHours = cap.jobHours;
  const businessHours = cap.ownerHoursUsed;
  const totalHours = cap.workloadHours;
  let ownerRunCount = 0;
  for (const biz of (S.career.businesses || [])) {
    if (biz.manager) continue;
    if (biz.ownerManaged === false) continue;
    ownerRunCount += 1;
  }
  return {
    jobHours, businessHours, totalHours,
    stretched: totalHours > BUSINESS_STRETCHED_HOURS,
    partTimeWithJob: jobHours > 0 && (S.career.businesses || []).some(b => !b.manager && b.ownerManaged !== false && b.mode === 'part_time'),
    ownerRunCount,
    /* Managed counts use the ONE definition (businessIsManaged:
       a manager, or the owner with allocated hours >= mode hours) —
       the same count the header prints and the card badges show. */
    managedCount: cap.managedCount,
    unmanagedCount: cap.unmanagedCount,
    ownerHoursFree: cap.ownerHoursFree,
    uncoveredHours: cap.uncoveredHours,
    uncoveredNames: cap.uncoveredNames
  };
}

/* Monthly workload consequences — called from the settlement, once a
   month. Stretched: +5 stress/month, job performance −2/month. A
   part-time business alongside a job also costs −2 performance/month
   (split attention), even under 50 hours. Said plainly in the journal
   the first month it bites, not spammed every month. */
export function applyWorkloadMonth(S) {
  const w = computeWorkload(S);
  /* v2.14 §1 — unmanaged decay ticks once a month, here, AFTER the
     settlement's P&L loop (this function is called there, once a
     month). The P&L of month N uses the unmanaged state of month N-1;
     this tick then advances it, so revenue and morale slide month over
     month and the at-risk flag lands at 3 months. It runs even when
     the player is not Stretched — the early return below must not
     skip it. */
  tickBusinessCapacityMonth(S);
  if (!w.stretched && !w.partTimeWithJob) {
    S.career._stretchedNoted = false;
    return w;
  }
  if (w.stretched) {
    S.player.vitals.stress = clamp((S.player.vitals.stress || 0) + 5);
    if (!S.career._stretchedNoted) {
      S.career._stretchedNoted = true;
      recordJournal(S, `You are Stretched — ${w.totalHours} hours a week across your job and your businesses (over 50). Stress rises each month until the load drops.`, 'work');
    }
  }
  if (S.career.employed && S.career.job && (w.stretched || w.partTimeWithJob)) {
    const job = S.career.job;
    job.performance = clamp((job.performance ?? 65) - 2, 0, 100);
    if (job.performanceParts) {
      job.performanceParts.quality = clamp((job.performanceParts.quality ?? 65) - 2, 0, 100);
      job.performanceParts.managerView = clamp((job.performanceParts.managerView ?? 65) - 2, 0, 100);
    }
  }
  return w;
}

/* ------------------------------------------------------------------ *
   Launch / expand / sell / close.
   ------------------------------------------------------------------ */
export function createBusiness(S, typeId, customName = '', opts = {}) {
  ensureExtendedState(S);
  migrateBusinesses(S);
  if ((S.player?.age ?? 0) < 19) return { ok: false, msg: 'Must be an adult to register a company.' };
  /* No number cap (v2.14 §1): as many businesses as you can staff
     with managers plus run yourself within your hours. */
  const bp = findVentureRow(S, typeId);
  if (!bp) return { ok: false, msg: 'Invalid venture type.' };
  const ev = evaluateBusinessLaunch(S, bp);
  if (!ev.ok) return { ok: false, msg: ev.locks.join(' ') };

  const mode = opts.mode === 'full_time' ? 'full_time' : 'part_time';
  const modeHours = mode === 'full_time' ? BUSINESS_FULL_TIME_HOURS : BUSINESS_PART_TIME_HOURS;
  /* v2.14 §1 — who runs it. opts.manager is a manager record in the
     fixed contract shape (Worker 2's hireManager builds it; the launch
     screen passes it through). A manager-run business costs the
     manager's salary, none of your hours — and a full-time manager-run
     business does NOT make you leave your job. opts.runBy is the new
     launch screen's explicit choice ('self' or 'manager'): only that
     explicit new flow is refused on hours — self-run with no free
     hours for the mode, or manager-run with no manager supplied.
     Legacy callers (no runBy — v2.11 tests, the side-business event)
     launch self-run as before; a business launched with no hours left
     for it goes unmanaged and decays, and the journal says so plainly
     at launch. That decay, not a refusal, is the enforcement there. */
  const managerOpt = opts.manager && typeof opts.manager === 'object' ? {
    name: String(opts.manager.name || 'Manager'),
    skill: clamp(Math.round(Number(opts.manager.skill) || 50), 0, 100),
    wage: Math.max(0, Math.round(Number(opts.manager.wage) || 0)),
    loyalty: clamp(Math.round(Number(opts.manager.loyalty) || 60), 0, 100),
    policy: ['growth', 'safe', 'harvest'].includes(opts.manager.policy) ? opts.manager.policy : 'safe',
    hiredYear: S.year,
    hiredMonth: S.month,
    personId: opts.manager.personId || null
  } : null;
  /* v2.20 I1 — full-time NEVER silently resigns the job. A
     full-time launch you run yourself while employed is refused in
     plain words, naming the reason and both alternatives: hire a
     manager (you keep the job — a manager-run business needs none of
     your hours) or resign first and then launch. opts.resignJob is
     no longer called anywhere on this path: leaving a job is a
     separate, explicit decision on the Career tab, never a side
     effect of a launch click. This check sits before the hours gate
     on purpose — an employed player has too few free hours for
     full-time anyway, but the job is the real reason, so the job is
     what the refusal names. */
  if (!managerOpt && mode === 'full_time' && S.career.employed && S.career.job) {
    const employer = S.career.job.employer || 'your employer';
    return { ok: false, msg: `Running this full-time yourself means leaving your job at ${employer}. Either hire a manager to run it for ~${formatMoney(ev.managerWageEstimateLocal, S.country)}/month and keep your job, or resign from ${employer} first and then launch.` };
  }
  if (opts.runBy === 'manager' && !managerOpt) {
    return { ok: false, msg: 'This launch needs a manager to run it — hire a manager from the shortlist first.' };
  }
  if (opts.runBy === 'self' && !managerOpt) {
    const free = managementCapacityInfo(S).ownerHoursFree;
    if (free < modeHours) {
      return { ok: false, msg: `You have ${free}h/week free — not enough to run this yourself (${modeHours}h/week ${mode === 'full_time' ? 'full-time' : 'part-time'}). Hire a manager to run it (managers for a business this size ask about ${formatMoney(ev.managerWageRangeLocal.low, S.country)}–${formatMoney(ev.managerWageRangeLocal.high, S.country)}/month), or free up hours first.` };
    }
  }
  /* v2.20 I1 — one launch, one record: a live business of the same
     type already exists, so a second click is a refusal, not a silent
     second business. The player confirms by launching again with
     allowDuplicate (the launch row offers "Open a second one"), and
     the second business gets its own name. Branches do not count —
     they share their parent's typeId. */
  const liveSameType = (S.career.businesses || []).find(b => b && !b.isBranch && !b.dead && b.typeId === bp.id);
  if (liveSameType && !opts.allowDuplicate) {
    return { ok: false, msg: `You already own a ${bp.label} (${liveSameType.name}, opened ${MONTH_NAMES[(liveSameType.foundedMonth || 1) - 1]} ${liveSameType.foundedYear}). Open a second one?`, duplicateOf: liveSameType.id, needsDuplicateConfirm: true };
  }

  /* v2.20 I1 — the default name is unique: a second business never
     silently reuses a name already in the portfolio. */
  const baseName = (customName && String(customName).trim()) || `${S.player.familyName} ${bp.label.split(' ')[0]}`;
  let name = baseName;
  {
    const taken = new Set((S.career.businesses || []).filter(b => b && b.name).map(b => b.name));
    let n = 2;
    while (taken.has(name)) { name = `${baseName} ${n}`; n += 1; }
  }
  walletMove(S, -ev.capitalLocal, `Startup capital for ${name}`, 'business');
  const biz = normalizeBusiness(S, {
    id: nextId(S, 'biz'),
    typeId: bp.id,
    name,
    country: S.country,
    city: S.city,
    level: 1,
    maxLevel: Infinity, /* placeholder — normalizeBusiness replaces it with businessLevelCap(biz) (home = 2, rented/owned = no cap) */
    volatility: (typeof bp.volatility === 'number' ? bp.volatility : 0.25),
    monthlyRev: ev.revLocal,
    monthlyCost: ev.costLocal,
    capitalInvested: ev.capitalLocal,
    totalCapitalIn: ev.capitalLocal, /* v2.17 W2: everything ever put in (grows on expand) */
    repeatRate: 0.5,
    mode,
    staff: [],
    premises: { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: [], heirId: null, remote: false,
    foundedYear: S.year, foundedMonth: S.month,
    pricingMode: 'balanced', lastPL: null,
    manager: managerOpt,
    ownerManaged: !managerOpt,
    ownerHoursPerWeek: managerOpt ? 0 : modeHours,
    unmanagedMonths: 0, atRisk: false
  });
  /* v2.11 merge: a fresh launch starts with a real team of 3 named
     employees (the old launch's "3 employees" rule). Without this the
     business had no staff at all — no wages, no morale, nothing to
     quit — because ensureStaffArray only seeds from a legacy
     `employees` number a fresh launch never set. */
  seedStartingStaff(S, biz, 3);
  S.career.businesses.push(biz);
  syncBusinessMirror(S);
  const hoursNote = managerOpt
    ? `run by ${managerOpt.name} (${formatMoney(managerOpt.wage, S.country)}/month — none of your hours)`
    : mode === 'full_time'
      ? 'full-time, about 40 hours a week'
      : 'part-time, 18 hours a week (revenue ×0.6; alongside a job your performance falls)';
  recordJournal(S, `Registered and opened ${name} (${bp.label}) with ${formatMoney(ev.capitalLocal, S.country)} in capital — ${hoursNote}.`, 'milestone');
  /* Launched with no hours left for it (legacy path, no runBy gate):
     say so at once — it will sit unmanaged until a manager is hired
     or hours are freed, and revenue and morale will slip each month. */
  if (!managerOpt && !businessIsManaged(S, biz)) {
    recordJournal(S, `${name} has nobody with hours to run it — you have no free hours left for it. It will sit unmanaged until you hire a manager or free up time, and revenue and staff morale will slip each month it stays unmanaged.`, 'money');
  }
  return { ok: true, msg: `Launched ${name} (${hoursNote})!`, biz };
}

/* v2.17 — real-state helpers for the gates that used to read the
   deleted score. Months in business from the founding date;
   consecutive profitable months counted back through the settled
   P&L history (lastPL first); staff quality as average skill
   (no staff counts as 50, neutral). */
export function monthsInBusiness(S, biz) {
  if (!biz) return 0;
  const start = (Number(biz.foundedYear) || S.year) * 12 + (Number(biz.foundedMonth) || S.month);
  const now = S.year * 12 + S.month;
  return Math.max(0, now - start);
}
export function consecutiveProfitableMonths(biz) {
  const hist = Array.isArray(biz?.history) ? biz.history : [];
  let n = 0;
  for (let i = hist.length - 1; i >= 0; i--) {
    if ((Number(hist[i]?.net) || 0) > 0) n += 1;
    else break;
  }
  /* The latest settled month may not be in history yet on the very
     first check — count lastPL too when history is empty. */
  if (hist.length === 0 && biz?.lastPL && Number(biz.lastPL.net) > 0) n = 1;
  return n;
}
export function averageStaffSkill(biz) {
  const staff = Array.isArray(biz?.staff) ? biz.staff : [];
  if (!staff.length) return 50;
  return staff.reduce((s, st) => s + (Number(st?.skill) || 0), 0) / staff.length;
}

export function expandBusiness(S, bizRef) {
  ensureExtendedState(S);
  const biz = resolveBusiness(S, bizRef);
  if (!biz) return { ok: false, msg: 'No active business.' };
  /* v2.20 I1 — a branch cannot expand on its own: it has no
     premises, staff or mode of its own to grow. The parent is the
     business that expands. */
  if (biz.isBranch) {
    const parent = (S.career.businesses || []).find(b => b && b.id === biz.parentBusinessId);
    return { ok: false, msg: `A branch cannot expand on its own — expand ${parent ? parent.name : 'the parent business'} instead, or open a new branch.` };
  }
  /* v2.20 I4 — the cap is ONE number, businessLevelCap(biz): a home
     business cannot grow past level 2, a rented or owned unit has no
     cap — the same number the card pill shows, so the gate and the
     display can never disagree. */
  const levelCap = businessLevelCap(biz);
  if (Number.isFinite(levelCap) && biz.level >= levelCap) {
    return { ok: false, msg: `${biz.name} runs from home and cannot grow past level ${levelCap} — rent a shop or office to expand further.` };
  }
  /* v2.17 — the level gate is real state now, not a score. To grow to
     level L+1 the business must have traded 3×(L+1) months, made a
     profit for (L+1) months in a row, and have a team good enough for
     the size (average skill 40+5×(L+1); no staff counts as 50). */
  const nextLevel = biz.level + 1;
  const monthsOpen = monthsInBusiness(S, biz);
  const profitableRun = consecutiveProfitableMonths(biz);
  const staffSkill = averageStaffSkill(biz);
  const needMonths = 3 * nextLevel;
  const needProfitable = nextLevel;
  const needSkill = 40 + 5 * nextLevel;
  const missing = [];
  if (monthsOpen < needMonths) missing.push(`${biz.name} has only traded ${monthsOpen} month${monthsOpen === 1 ? '' : 's'} — growing to level ${nextLevel} needs ${needMonths}`);
  if (profitableRun < needProfitable) missing.push(`only ${profitableRun} profitable month${profitableRun === 1 ? '' : 's'} in a row — growing to level ${nextLevel} needs ${needProfitable}`);
  if (staffSkill < needSkill) missing.push(`the team's average skill is ${Math.round(staffSkill)} — growing to level ${nextLevel} needs ${needSkill}`);
  if (missing.length) {
    return { ok: false, msg: `${biz.name} is not ready to grow to level ${nextLevel}: ${missing.join('; ')}.` };
  }
  const expandCost = Math.round(biz.capitalInvested * 0.55);
  if ((S.money?.cash || 0) < expandCost) return { ok: false, msg: `Need ${formatMoney(expandCost, S.country)} to expand.` };
  walletMove(S, -expandCost, `Expanded ${biz.name} (+capacity)`, 'business');
  biz.level += 1;
  biz.capitalInvested += expandCost;
  /* v2.17 W2 — expanding puts more capital in, so the "everything
     ever put in" total grows with it (the death rule reads it).
     normalizeBusiness always sets totalCapitalIn first, so the
     fallback below only fires for a record that never passed it. */
  biz.totalCapitalIn = Math.round((Number(biz.totalCapitalIn) || Math.max(0, biz.capitalInvested - expandCost)) + expandCost);
  biz.monthlyRev = Math.round(biz.monthlyRev * 1.42);
  biz.monthlyCost = Math.round(biz.monthlyCost * 1.32);
  recordJournal(S, `Expanded ${biz.name} to level ${biz.level} — monthly revenue capacity grew substantially.`, 'career');
  return { ok: true, msg: `Expanded ${biz.name} (level ${biz.level})!`, biz };
}

export function businessValuation(biz) {
  const wages = (biz.staff || []).reduce((sum, st) => sum + (st.wageLocal || 0), 0);
  const rent = biz.premises?.monthlyRentLocal || 0;
  const lastNet = biz.lastPL ? biz.lastPL.net : (biz.monthlyRev - biz.monthlyCost - wages - rent);
  const annualProfit = Math.max(0, lastNet * 12);
  /* v2.20 I2 — equity is real now (item 5): a business you own 80%
     of sells for 80% of its valuation. Funding rounds and co-founders
     dilute equityOwned in businessDecisions.js; the old code paid the
     full valuation whatever you owned, so the dilution was a dead
     number. Unset equity means 100%. */
  const equity = clamp((biz.equityOwned ?? 100) / 100, 0, 1);
  return Math.round((biz.capitalInvested * 0.7 + annualProfit * 2.8) * equity);
}

export function sellBusiness(S, bizRef) {
  ensureExtendedState(S);
  const biz = resolveBusiness(S, bizRef);
  if (!biz) return { ok: false, msg: 'No active business.' };
  const valuation = businessValuation(biz);
  const bName = biz.name;
  const equityPct = Math.round(biz.equityOwned ?? 100);
  S.career.businesses = (S.career.businesses || []).filter(b => b.id !== biz.id);
  syncBusinessMirror(S);
  walletMove(S, valuation, `Exited & sold ${bName}`, 'business');
  recordJournal(S, `Sold ${bName} to an acquirer for ${formatMoney(valuation, S.country)}${equityPct < 100 ? ` — your ${equityPct}% share` : ''}.`, 'milestone');
  return { ok: true, msg: `Sold ${bName} for ${formatMoney(valuation, S.country)}${equityPct < 100 ? ` (your ${equityPct}% share)` : ''}!` };
}

/* Close a business (failure, or a forced closure). Salvage = half the
   capital invested. Staff are fired through W2's fireAllStaff — they
   lose their jobs. With viaSettlement the salvage is RETURNED, not
   moved: the settlement posts it through its own net (projection
   accounting must not move cash twice). */
export function closeBusiness(S, biz, reason, opts = {}) {
  ensureExtendedState(S);
  migrateBusinesses(S);
  const target = typeof biz === 'object' ? biz : (S.career.businesses || []).find(b => b.id === biz);
  if (!target || !(S.career.businesses||[]).some(b=>b.id===target.id)) return { ok: false, msg: 'No such owned business.', salvage: 0 };
  /* v2.17 W2 — the W5 contract: ANY closure marks the record dead
     with a plain-words cause (this is the miss-3 settlement path too
     — the record is removed from the portfolio below, but the flags
     and the journal line stay on the object, so fate can read them). */
  target.dead = true;
  target.deathCause = reason;
  target.deadYear = S.year;
  target.deadMonth = S.month;
  const salvage = Math.round((target.capitalInvested || 0) * 0.5 * clamp((target.equityOwned ?? 100) / 100, 0, 1)); /* v2.20 I2 — equity is real: salvage pays out your share only. */
  const staffCount = (target.staff || []).length;
  let severancePaid = 0;
  let severanceUnpaid = 0;
  try {
    const fired = fireAllStaff(S, target, reason);
    severancePaid = Math.max(0, (fired?.totalSeverance || 0) - (fired?.unpaid || 0));
    severanceUnpaid = fired?.unpaid || 0;
  } catch (_) {
    target.staff = [];
  }
  target.staff = target.staff || [];
  S.career.businesses = (S.career.businesses || []).filter(b => b.id !== target.id);
  syncBusinessMirror(S);
  if (!opts.viaSettlement && salvage > 0) {
    walletMove(S, salvage, `Salvage sale — ${target.name} (${reason})`, 'business');
  }
  recordJournal(S, `${target.name} closed (${reason}). Sold off for ${formatMoney(salvage, S.country)} in salvage.${staffCount > 0 ? ` ${staffCount} employee${staffCount > 1 ? 's' : ''} lost their jobs.` : ''}`, 'money');
  /* quietScene (v2.11 merge): the relocation decision scene already
     tells the player the business closed — queueing the engine's
     "Has Closed" scene too would say it twice. The journal above
     still records it. The settlement's miss-3 close keeps the scene. */
  if (!opts.quietScene) queueScene(S, {
    key: `biz_closed_${target.id}_${S.year}_${S.month}`,
    category: 'money',
    title: `${target.name} Has Closed`,
    text: `${target.name} could not keep paying its bills and has closed (${reason}). The salvage sale brought in ${formatMoney(salvage, S.country)}.${staffCount > 0 ? ` ${staffCount} employee${staffCount > 1 ? 's' : ''} lost their jobs.` : ''}`,
    choices: [{ label: 'Understood', effect: () => {} }]
  });
  return { ok: true, msg: `${target.name} closed — salvage ${formatMoney(salvage, S.country)}.`, salvage, staffCount, severancePaid, severanceUnpaid };
}

/* Switch full-time <-> part-time. Going full-time while employed
   never resigns the job silently (v2.20 I1): it is refused in plain
   words, with both alternatives named — the player resigns first on
   the Career tab, or hires a manager. */
export function setBusinessMode(S, bizRef, mode, opts = {}) {
  ensureExtendedState(S);
  const biz = resolveBusiness(S, bizRef);
  if (!biz) return { ok: false, msg: 'No active business.' };
  /* v2.20 I1 — a branch has no mode of its own: it runs on the
     parent's hours, so switching it would silently do nothing the
     player can see. Refused, with the parent named. */
  if (biz.isBranch) {
    const parent = (S.career.businesses || []).find(b => b && b.id === biz.parentBusinessId);
    return { ok: false, msg: `A branch runs on the same hours as its parent — change the mode on ${parent ? parent.name : 'the parent business'} instead.` };
  }
  const next = mode === 'full_time' ? 'full_time' : 'part_time';
  if (biz.mode === next) return { ok: false, msg: `${biz.name} is already ${next === 'full_time' ? 'full-time' : 'part-time'}.` };
  /* A manager-run business needs none of your hours, so going
     full-time under a manager does not make you leave your job. */
  if (!biz.manager && next === 'full_time' && S.career.employed && S.career.job) {
    const employer = S.career.job.employer || 'your employer';
    return { ok: false, msg: `Going full-time on ${biz.name} yourself means leaving your job at ${employer}. Either hire a manager to run it and keep your job, or resign from ${employer} first and then switch.` };
  }
  biz.mode = next;
  if (biz.ownerManaged && !biz.manager) {
    biz.ownerHoursPerWeek = next === 'full_time' ? BUSINESS_FULL_TIME_HOURS : BUSINESS_PART_TIME_HOURS;
  }
  recordJournal(S, `${biz.name} is now run ${next === 'full_time' ? 'full-time (about 40 hours a week)' : 'part-time (18 hours a week, revenue ×0.6)'}.`, 'career');
  if (!biz.manager && !businessIsManaged(S, biz)) {
    recordJournal(S, `${biz.name} has nobody with hours to run it at this size — you have no free hours left for it. It will sit unmanaged until you hire a manager or free up time.`, 'money');
  }
  return { ok: true, msg: `${biz.name} is now ${next === 'full_time' ? 'full-time' : 'part-time'}.`, biz };
}

/* ------------------------------------------------------------------ *
   Tax on profit: the country's OWN income-tax brackets, annualised
   (profit x 12 -> annual tax -> /12) — computeMonthlyNetPay is the one
   bracket function; only its incomeTax line is taken (no social
   security on business profit). Labelled honestly.
   ------------------------------------------------------------------ */
export function computeBusinessTax(S, profit) {
  const cObj = getCountry(S.country);
  const p = Math.max(0, Math.round(profit || 0));
  if (p <= 0) return { tax: 0, label: `Business tax (${cObj.name} income-tax brackets on profit) — no profit, no tax` };
  const isCit = S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident';
  const pay = computeMonthlyNetPay(p, S.country, S.year, isCit);
  const tax = Math.round(pay.incomeTax || 0);
  if (tax <= 0) {
    return { tax: 0, label: `Business tax (${cObj.name} income-tax brackets on profit) — no income tax was due on this month's profit` };
  }
  return { tax, label: `Business tax (${cObj.name} income-tax brackets on profit)` };
}

/* ------------------------------------------------------------------ *
   Monthly P&L. monthlyCost is OTHER costs only; wages come from staff,
   rent from premises. Volatility swings revenue; the repeat rate,
   staff quality and financial IQ edge it; morale (W2), premises
   condition (W3), remote
   management (W4), home/part-time rules and temporary op buffs all
   multiply revenue or costs. Buffs are temporary — never a permanent
   ratchet. v2.14 §1: a manager's wage is charged as its own cost line
   (pl.manager), and an unmanaged business's revenue is cut by its
   unmanaged-months multiplier (read-only here; the monthly tick owns
   the counter). The result is stored on the business (lastPL + history)
   so the card can show it without re-rolling the month.
   ------------------------------------------------------------------ */
export function computeBusinessMonth(S, biz) {
  ensureExtendedState(S);
  normalizeBusiness(S, biz);
  const now = businessMonthIndex(S);
  const staff = biz.staff || [];
  const wages = staff.reduce((sum, st) => sum + (Number(st.wageLocal) || 0), 0);
  const rent = Number(biz.premises?.monthlyRentLocal) || 0;
  const otherBase = Number(biz.monthlyCost) || 0;

  let revMult = 1;
  if (biz.mode === 'part_time') revMult *= BUSINESS_PART_TIME_REV_MULT;
  if (biz.premises?.kind === 'home') revMult *= BUSINESS_HOME_REV_MULT;
  if (biz.remote) revMult *= 0.7;
  const cond = Number(biz.premises?.conditionPct ?? 90);
  if (cond < 40) revMult *= 0.7;
  else if (cond < 60) revMult *= 0.85;
  if (staff.length > 0) {
    /* Morale affects revenue through W2's one curve (piecewise linear
       through (20, 0.70) (40, 0.85) (70, 1.00) (90, 1.10); no staff ->
       1.00, owner-run). Never a second morale rule here. */
    revMult *= teamMoraleFactor(biz);
  }
  if (now <= (biz.buffs?.rdUntil || 0)) revMult *= 1.14;
  const pricingDir = Number(biz.buffs?.pricingDir || 0);
  if (pricingDir === 1) revMult *= 1.09;
  else if (pricingDir === -1) revMult *= 0.93;
  /* v2.14 §1 — unmanaged: nobody runs it, so revenue slides with each
     unmanaged month (businessCapacity.js owns the counter; this read is
     read-only — the monthly tick advances it). Managed again and the
     multiplier is 1: never a permanent cut to biz.monthlyRev. */
  if (!businessIsManaged(S, biz)) revMult *= unmanagedRevenueMult(biz);

  let costMult = 1;
  if (biz.mode === 'part_time') costMult *= BUSINESS_PART_TIME_COST_MULT;
  if (now <= (biz.buffs?.bonusUntil || 0)) costMult *= 0.95;
  if (pricingDir === 1) costMult *= 1.03;
  else if (pricingDir === -1) costMult *= 0.97;

  /* Remote management (W4): a kept-after-relocation business pays a
     local manager's wage. W4 records biz.remoteManagerWageLocal; until
     then the estimate is 70% of the local mid monthly salary. A hired
     manager REPLACES that figure (v2.14 §2 remote alignment): the
     manager's own wage is charged below instead — never both. */
  const remoteCost = biz.remote && !biz.manager
    ? Math.round(biz.remoteManagerWageLocal || eraSalary(getCountry(S.country).annualSalaryTiers2026.mid / 12, S.country, S.year) * 0.7)
    : 0;

  /* v2.14 §1 — a manager costs their salary, charged here as its own
     P&L line (pl.manager, inside pl.costs), so the settlement posts it
     like any other wage. MERGE NOTE: Worker 2's applyManagerEffects
     returns costDelta = wage + growth reinvestment. When the
     coordinator wires it in, fold in ONLY its revenueMult /
     moraleDelta / reinvestment part — adding costDelta on top of
     pl.manager would charge the salary twice. */
  const managerWage = biz.manager ? Math.max(0, Math.round(Number(biz.manager.wage) || 0)) : 0;

  const iqEdge = ((S.skills?.financialIq || 45) - 45) * 0.0025;
  /* v2.17: the revenue effect of the deleted score is the repeat rate
     and staff quality — customers who come back, and a team good
     enough to keep them. Repeat rate 0..1 maps to −0.20..+0.20;
     average skill maps to −0.10..+0.10 (no staff: 0). */
  const repeatEffect = ((Number(biz.repeatRate ?? 0.5)) - 0.5) * 0.4;
  const avgSkill = staff.length
    ? staff.reduce((s, st) => s + (Number(st.skill) || 0), 0) / staff.length
    : null;
  const staffQualityEffect = avgSkill === null ? 0 : (avgSkill - 50) * 0.002;
  const wave = clamp(1 + (rand(S) - 0.5) * 2 * (biz.volatility ?? 0.25) + repeatEffect + staffQualityEffect + iqEdge, 0.5, 1.6);

  const revenue = Math.max(0, Math.round(biz.monthlyRev * wave * revMult));
  const other = Math.max(0, Math.round(otherBase * costMult));
  const costs = rent + wages + other + remoteCost + managerWage;
  const profit = revenue - costs;
  const taxInfo = computeBusinessTax(S, profit);
  const tax = taxInfo.tax;
  const net = profit - tax;

  const pl = {
    year: S.year, month: S.month, name: biz.name, typeId: biz.typeId,
    revenue, rent, wages, other, remote: remoteCost, manager: managerWage, costs, profit, tax,
    taxLabel: taxInfo.label, net, wave: Number(wave.toFixed(3))
  };
  biz.lastPL = pl;
  biz.history.push(pl);
  if (biz.history.length > 24) biz.history = biz.history.slice(-24);
  return pl;
}

/* ------------------------------------------------------------------ *
   Run ops with caps + cooldowns. Effects are temporary buffs, never a
   permanent ratchet. A second click inside the cooldown is refused
   plainly, with the month it can be used again.
   ------------------------------------------------------------------ */
export function runBusinessOp(S, bizRef, opIdRaw) {
  ensureExtendedState(S);
  const opId = normalizeBusinessOpId(opIdRaw);
  const biz = resolveBusiness(S, bizRef);
  if (!biz) return { ok: false, msg: 'No active enterprise.' };
  const info = businessOpInfo(S, biz, opId);
  if (!info.available) {
    /* v2.20 merge — a REMOVED op (food Refresh Menu, retail Run a
       Promotion) is not "used recently": it no longer exists, and the
       Decisions tab holds the real one. Say so plainly instead of
       printing a 0-month cooldown. */
    if (info.removed) return { ok: false, msg: `${info.label} was removed — ${info.effect.replace(/^Removed — /, '')}` };
    return { ok: false, msg: `${info.label} was used recently — available again in ${info.availableInMonths} month${info.availableInMonths > 1 ? 's' : ''} (${info.nextAvailableLabel}).` };
  }
  if (info.cost > 0 && (S.money?.cash || 0) < info.cost) {
    return { ok: false, msg: `Need ${formatMoney(info.cost, S.country)} for ${info.label}.` };
  }
  const now = businessMonthIndex(S);
  if (info.cost > 0) walletMove(S, -info.cost, `${biz.name} — ${info.label}`, 'business');
  biz.lastOpUsed[opId] = now;
  if (opId === 'rd') {
    biz.buffs.rdUntil = now + 12;
    S.skills.creativity = clamp((S.skills.creativity || 40) + 3);
    recordJournal(S, `${info.label} at ${biz.name}: ${info.effect}.`, 'work');
    return { ok: true, msg: `${biz.name}: ${info.label} — ${info.effect}. Can be used again in 12 months.` };
  }
  if (opId === 'bonus') {
    biz.buffs.bonusUntil = now + 3;
    /* v2.17: the Team Bonus no longer lifts the player's social
       standing — that +3 lived in this business file, and the round
       requires zero occurrences of the word in business systems code.
       The player's standing itself (field, default, profile display,
       marriage/gig/event uses) is untouched. */
    applyStaffBonus(biz); /* W2: the whole team feels it (morale +10 each) */
    recordJournal(S, `${info.label} at ${biz.name}: ${info.effect}.`, 'work');
    return { ok: true, msg: `${biz.name}: ${info.label} — ${info.effect}. Can be used again in 3 months.` };
  }
  /* pricing: toggle premium <-> value. */
  const nextDir = (biz.buffs.pricingDir === 1) ? -1 : 1;
  biz.buffs.pricingDir = nextDir;
  biz.buffs.pricingUntil = now + 1;
  biz.pricingMode = nextDir === 1 ? 'premium' : 'value';
  recordJournal(S, `${biz.name} repositioned to ${nextDir === 1 ? 'premium pricing (+9% revenue, +3% costs)' : 'value pricing (−7% revenue, −3% costs)'}: ${info.effect}.`, 'work');
  return { ok: true, msg: `${biz.name}: now ${nextDir === 1 ? 'premium' : 'value'} positioning. Can change again next month.` };
}
