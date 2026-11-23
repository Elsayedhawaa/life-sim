/* ============================================================================
   World Life 2.0 — Business Operations (v2.17 W4: §5, operate the business)
   A real operating menu inside each business: Stock, Pricing, Suppliers,
   Staff (rota), Marketing, Premises, Cash. Each section is a real set of
   actions with real numbers and real consequences in the NEXT month's
   P&L — never a score, never a forecast, never an estimate.

   THE monthEffects CONTRACT (W2's fold reads this object; this file only
   stamps it and resolves it — it NEVER writes the P&L directly and
   NEVER touches the settlement):
   - Action functions stamp one-month effects into biz.monthEffects via
     addMonthEffect() at commit time (marketing revenueAdd, rota
     costAdd / revenueAdd). Fields: { revenueMult, revenueAdd, costAdd,
     repeatRateDelta, moraleDelta, notes }. Defaults when absent:
     revenueMult 1, revenueAdd 0, costAdd 0, repeatRateDelta 0,
     moraleDelta 0, notes []. Several effects in one month ADD into the
     one object (revenueMults multiply together, the rest add).
   - Settlement-resolved effects (stock on hand, prices, supplier
     deliveries) are computed by applyOperationsEffects(S, biz) at
     settlement time from the persistent state on the biz record, and
     MERGED into the same biz.monthEffects — so the fold reads one
     object, however the effect got there.
   - foldMonthEffectsIntoPL(S, biz, pl, eff) is the reference fold the
     coordinator wires into computeBusinessMonthFull right after the
     per-industry decisions fold (step 6): it applies revenueMult /
     revenueAdd / costAdd to the P&L, recomputes profit/tax/net on the
     folded numbers, applies repeatRateDelta to biz.repeatRate and
     moraleDelta to staff morale, then clears biz.monthEffects
     (consumed — one month only). Idempotent within a month via
     biz._opsAppliedMonth, the same guard pattern businessMonthly.js
     uses (biz._monthlyFoldMonth).

   PERSISTENT STATE on the biz record (plain fields, documented here):
   - biz.stockLevel (number, units on hand). A month usually sells
     opsMonthlyUnits; stock 0 -> sales fall 45% that month; stock above
     what the month sells is written off as waste (costAdd).
   - biz.prices { itemId: { price, standard } } — the price list the
     player sets. Above standard by 15%+ is "high" (more money per
     sale, some customers stop coming back); below by 15%+ is "low"
     (less margin, customers come back).
   - biz.supplier { id, name, priceMult, reliability } — the supplier
     the business buys from. A cheap supplier costs less per unit but
     can fail to deliver (reliability 0.70); a reliable one costs more
     and almost always delivers (0.98).
   - biz.pendingDeliveries [{ id, qty, unitCost, supplierId,
     supplierName, reliability, orderedMonth, landsMonth, cost }] —
     stock ordered but not yet arrived. Resolved at the next
     settlement: delivered -> stockLevel += qty and the cost lands in
     that month's P&L (costAdd); failed -> nothing arrives, nothing is
     charged, the shelves stay empty (stock-out).
   - biz.opsMarketing { monthIdx, counts: { channelId: n } } — how many
     times each marketing channel was bought this month (diminishing
     returns: 2nd spend same channel same month is worth half).
   - biz.opsRota { monthIdx, overtime: [staffId], dayOff: [staffId] } —
     who did overtime / took a day off this month (one each per person
     per month).
   - biz.opsLog [{ year, month, text }] — last 20 operating actions,
     shown at the bottom of the menu.
   - biz.lastSupplierOutcome { year, month, text } — the last failed
     delivery, also shown by the decisions render (it already reads
     this field).
   - biz._opsAppliedMonth / biz._opsAppliedEffects — the once-a-month
     guard + cached result for applyOperationsEffects.

   CASH: withdraw / reinvest / pay-down-debt are the v2.14 functions,
   reused exactly (withdrawBusinessCash, reinvestBusinessCash,
   payExtraOnBusinessLoan) through thin wrappers — their behaviour,
   including the tax on withdrawal, is unchanged. No cash action was
   missing, so no new cash function was invented here.
   PREMISES: maintenance reuses repairBusinessPremises; expansion
   reuses expandBusiness (level) and openBranch (branch API) — this
   file does not modify those systems. Moving reuses W1's rule: a
   business in a new city starts with repeat customers at 0.30.
   ========================================================================== */

import { rand, clamp } from '../core/rng.js';
import { ensureExtendedState, nextId, recordJournal, walletMove } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import {
  industryForBusiness, businessMonthIndex, computeBusinessTax, expandBusiness, businessValuation
} from './businessEngine.js';
import { repairBusinessPremises, repairCostLocal } from './businessPremises.js';
/* v2.20 I4 — branchSetupCost is gone with the second branch UI (below):
   the Branches section is the ONE branch offer UI now. openBranch stays
   for the opsOpenBranch action helper. */
import { openBranch } from './businessBranches.js';
import { withdrawBusinessCash, reinvestBusinessCash } from './businessExits.js';
import { payExtraOnBusinessLoan, getBusinessLoan } from './businessLoans.js';
/* v2.18 W3 — disabled buttons state their reason with the central helper,
   never a bare title tooltip or a one-off muted span. */
import { lockReason } from '../ui/lockReason.js';

/* ------------------------------------------------------------------ *
   Catalogues — per industry group. Prices are the business's OWN
   numbers: an average ticket is monthlyRev / monthlyUnits, and each
   item is a fraction of that ticket, so a Cairo cafe and a London
   clinic both get prices in their own currency at their own scale.
   No invented currency scale, no forecast.
   ------------------------------------------------------------------ */
export const OPS_CATALOGUE = {
  food: {
    label: 'Food & Hospitality', monthlyUnits: 800,
    items: [
      { id: 'drink', label: 'Coffee & tea', frac: 0.12 },
      { id: 'main', label: 'Main dish', frac: 1.0 },
      { id: 'dessert', label: 'Dessert & cake', frac: 0.45 }
    ]
  },
  retail: {
    label: 'Retail & Trade', monthlyUnits: 400,
    items: [
      { id: 'everyday', label: 'Everyday item', frac: 0.5 },
      { id: 'mid', label: 'Mid-range item', frac: 1.0 },
      { id: 'premium', label: 'Premium item', frac: 2.2 }
    ]
  },
  tech: {
    label: 'Startup / Tech', monthlyUnits: 40,
    items: [
      { id: 'support', label: 'Support hour', frac: 0.6 },
      { id: 'licence', label: 'Licence / seat', frac: 1.0 },
      { id: 'project', label: 'Project package', frac: 3.0 }
    ]
  },
  health: {
    label: 'Health', monthlyUnits: 200,
    items: [
      { id: 'consult', label: 'Consultation', frac: 1.0 },
      { id: 'treatment', label: 'Treatment session', frac: 1.8 },
      { id: 'product', label: 'Medicine & products', frac: 0.5 }
    ]
  },
  services: {
    label: 'Services', monthlyUnits: 120,
    items: [
      { id: 'small', label: 'Small job', frac: 0.45 },
      { id: 'standard', label: 'Standard job', frac: 1.0 },
      { id: 'halfday', label: 'Half-day booking', frac: 1.6 }
    ]
  }
};

export const OPS_SUPPLIERS = {
  food: [
    { id: 'budget_bulk', name: 'Budget Bulk Traders', priceMult: 0.85, reliability: 0.70, blurb: 'Cheap — but 3 deliveries in 10 never arrive.' },
    { id: 'freshline', name: 'Freshline Wholesale', priceMult: 1.10, reliability: 0.98, blurb: 'Costs more, delivers 98 times in 100.' }
  ],
  retail: [
    { id: 'discount_import', name: 'Discount Import Co.', priceMult: 0.85, reliability: 0.70, blurb: 'Cheap — but 3 deliveries in 10 never arrive.' },
    { id: 'meridian', name: 'Meridian Trade Supplies', priceMult: 1.10, reliability: 0.98, blurb: 'Costs more, delivers 98 times in 100.' }
  ],
  tech: [
    { id: 'cutrate', name: 'Cut-Rate Cloud & Parts', priceMult: 0.85, reliability: 0.70, blurb: 'Cheap — but 3 deliveries in 10 never arrive.' },
    { id: 'vertex', name: 'Vertex Systems Supply', priceMult: 1.10, reliability: 0.98, blurb: 'Costs more, delivers 98 times in 100.' }
  ],
  health: [
    { id: 'valuemed', name: 'ValueMed Distributors', priceMult: 0.85, reliability: 0.70, blurb: 'Cheap — but 3 deliveries in 10 never arrive.' },
    { id: 'medsupply', name: 'Certified MedSupply', priceMult: 1.10, reliability: 0.98, blurb: 'Costs more, delivers 98 times in 100.' }
  ],
  services: [
    { id: 'bargain_trade', name: 'Bargain Trade Services', priceMult: 0.85, reliability: 0.70, blurb: 'Cheap — but 3 deliveries in 10 never arrive.' },
    { id: 'reliable_trade', name: 'Reliable Trade Partners', priceMult: 1.10, reliability: 0.98, blurb: 'Costs more, delivers 98 times in 100.' }
  ]
};

export const OPS_MARKETING_CHANNELS = [
  { id: 'flyers', label: 'Flyers & local posters', costFrac: 0.02, revFrac: 0.05, blurb: 'Cheap and local — a poster in the window, flyers on the street.' },
  { id: 'social', label: 'Social media ads', costFrac: 0.04, revFrac: 0.10, blurb: 'Reaches people nearby who have never heard of you.' },
  { id: 'radio', label: 'Radio & local paper', costFrac: 0.08, revFrac: 0.16, blurb: 'The expensive one — the whole neighbourhood hears about you.' }
];

/* Diminishing returns: the 1st spend on a channel in a month is worth
   full value, the 2nd half, the 3rd a quarter, the 4th and later a
   tenth. The player is told so on the button and in the section text. */
export const OPS_MARKETING_DIMINISH = [1, 0.5, 0.25, 0.1];
export const OPS_STOCKOUT_MULT = 0.55; /* no stock on hand: sales fall 45% */
export const OPS_PRICE_HIGH_RATIO = 1.15;
export const OPS_PRICE_LOW_RATIO = 0.85;
export const OPS_PRICE_HIGH_REV = 1.04; /* per high-priced item */
export const OPS_PRICE_HIGH_REPEAT = -0.012;
export const OPS_PRICE_LOW_REV = 0.97; /* per low-priced item */
export const OPS_PRICE_LOW_REPEAT = 0.006;
export const OPS_SECTIONS = ['Stock', 'Pricing', 'Suppliers', 'Staff', 'Marketing', 'Premises', 'Cash'];

/* ------------------------------------------------------------------ *
   State + small helpers
   ------------------------------------------------------------------ */
export function opsGroupForBusiness(biz) {
  const ind = industryForBusiness(biz?.typeId, biz?.name);
  return OPS_CATALOGUE[ind] ? ind : 'services';
}
export function opsMonthlyUnits(biz) {
  return OPS_CATALOGUE[opsGroupForBusiness(biz)].monthlyUnits;
}
/* v2.20 I3 — one unit price per VENTURE, not per business record: a
   branch prices the same goods the same way as its parent. A branch's
   own monthlyRev is its share of the parent's takings, so a ticket
   computed from it (the Alexandria kiosk: 5,225 / 800 = 7, cost 3)
   contradicts the parent's (20,900 / 800 = 26, cost 13) for the same
   fruit. The ticket is read from the parent's takings instead; a
   branch whose parent is gone falls back to its own. */
export function opsPricingBusiness(S, biz) {
  if (biz && biz.isBranch && biz.parentBusinessId && S && Array.isArray(S.career?.businesses)) {
    const parent = S.career.businesses.find(b => b && b.id === biz.parentBusinessId);
    if (parent) return parent;
  }
  return biz;
}
export function opsAvgTicket(S, biz) {
  const priced = opsPricingBusiness(S, biz);
  return Math.max(1, Math.round((Number(priced?.monthlyRev) || 0) / opsMonthlyUnits(biz)));
}
/* Cost of one unit of stock before the supplier's price: 45% of the
   average ticket (the goods cost less than they sell for). */
export function opsBaseUnitCost(S, biz) {
  return Math.max(1, Math.round(opsAvgTicket(S, biz) * 0.45));
}
export function opsUnitCost(S, biz) {
  ensureOpsState(S, biz);
  return Math.max(1, Math.round(opsBaseUnitCost(S, biz) * (Number(biz.supplier?.priceMult) || 1)));
}
export function opsSuppliersFor(biz) {
  return OPS_SUPPLIERS[opsGroupForBusiness(biz)];
}

export function emptyMonthEffects() {
  return { revenueMult: 1, revenueAdd: 0, costAdd: 0, repeatRateDelta: 0, moraleDelta: 0, notes: [] };
}

/* Merge one partial effect into biz.monthEffects (revenueMults
   multiply together, everything else adds, notes append). */
export function addMonthEffect(biz, partial = {}) {
  if (!biz) return emptyMonthEffects();
  /* v2.17 merge — stamping an effect IS operating the business: from
     now on the settlement resolves stock/prices/deliveries for it. */
  biz.opsEngaged = true;
  if (!biz.monthEffects || typeof biz.monthEffects !== 'object') biz.monthEffects = emptyMonthEffects();
  const me = biz.monthEffects;
  if (partial.revenueMult != null && Number.isFinite(partial.revenueMult)) me.revenueMult = (Number(me.revenueMult) || 1) * partial.revenueMult;
  me.revenueAdd += Math.round(partial.revenueAdd || 0);
  me.costAdd += Math.round(partial.costAdd || 0);
  me.repeatRateDelta += Number(partial.repeatRateDelta) || 0;
  me.moraleDelta += Number(partial.moraleDelta) || 0;
  if (partial.notes) me.notes.push(...(Array.isArray(partial.notes) ? partial.notes : [partial.notes]));
  return me;
}

export function ensureOpsState(S, biz) {
  if (!biz) return null;
  const cat = OPS_CATALOGUE[opsGroupForBusiness(biz)];
  if (typeof biz.stockLevel !== 'number' || Number.isNaN(biz.stockLevel)) biz.stockLevel = cat.monthlyUnits;
  if (!biz.prices || typeof biz.prices !== 'object') {
    biz.prices = {};
    const avg = opsAvgTicket(S, biz);
    for (const it of cat.items) {
      const p = Math.max(1, Math.round(avg * it.frac));
      biz.prices[it.id] = { price: p, standard: p };
    }
  }
  if (!biz.supplier || typeof biz.supplier !== 'object') {
    biz.supplier = { ...opsSuppliersFor(biz)[1] }; /* reliable one by default */
  }
  if (!Array.isArray(biz.pendingDeliveries)) biz.pendingDeliveries = [];
  if (!biz.monthEffects || typeof biz.monthEffects !== 'object') biz.monthEffects = emptyMonthEffects();
  if (!biz.opsMarketing || typeof biz.opsMarketing !== 'object') biz.opsMarketing = { monthIdx: -1, counts: {} };
  if (!biz.opsRota || typeof biz.opsRota !== 'object') biz.opsRota = { monthIdx: -1, overtime: [], dayOff: [] };
  if (!Array.isArray(biz.opsLog)) biz.opsLog = [];
  return biz;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmt(S, n) { return formatMoney(Math.round(n || 0), S.country); }
function nowIdx(S) { return businessMonthIndex(S); }
function logOps(S, biz, text) {
  biz.opsLog.unshift({ year: S.year, month: S.month, text });
  if (biz.opsLog.length > 20) biz.opsLog = biz.opsLog.slice(0, 20);
  recordJournal(S, text, 'career');
}
function resetMonthlyTrackers(S, biz) {
  const now = nowIdx(S);
  if (biz.opsMarketing.monthIdx !== now) biz.opsMarketing = { monthIdx: now, counts: {} };
  if (biz.opsRota.monthIdx !== now) biz.opsRota = { monthIdx: now, overtime: [], dayOff: [] };
}

/* ------------------------------------------------------------------ *
   STOCK — order stock (paid on delivery, in next month's P&L).
   ------------------------------------------------------------------ */
export const OPS_STOCK_PACKS = [
  { id: 'week', label: 'One week of stock', frac: 0.25 },
  { id: 'fortnight', label: 'Two weeks of stock', frac: 0.5 },
  { id: 'month', label: 'One month of stock', frac: 1 }
];

export function orderStock(S, biz, qty, opts = {}) {
  ensureExtendedState(S);
  ensureOpsState(S, biz);
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const q = Math.max(0, Math.round(Number(qty) || 0));
  if (q <= 0) return { ok: false, msg: 'Order how many units? Pick a pack size.' };
  const unitCost = opsUnitCost(S, biz);
  const cost = Math.round(q * unitCost);
  if ((Number(S.money?.cash) || 0) < cost) {
    return { ok: false, msg: `Ordering ${q} units from ${biz.supplier.name} costs ${fmt(S, cost)} — you have ${fmt(S, S.money?.cash || 0)} in cash.` };
  }
  const now = nowIdx(S);
  const sup = biz.supplier;
  biz.pendingDeliveries.push({
    id: nextId(S, 'opdel'), qty: q, unitCost, supplierId: sup.id, supplierName: sup.name,
    reliability: sup.reliability, orderedMonth: now, landsMonth: now + 1, cost
  });
  const promised = `${q} units from ${sup.name} for ${fmt(S, cost)} — arrives next month if the delivery comes through (${Math.round(sup.reliability * 100)}% of deliveries arrive). If it fails, nothing arrives and nothing is charged, but the shelves stay empty.`;
  logOps(S, biz, `Ordered ${q} units from ${sup.name} for ${biz.name} (${fmt(S, cost)}) — due next month.`);
  biz.opsEngaged = true; /* ordering stock means the player operates this business now */
  return {
    ok: true, qty: q, unitCost, cost, supplier: sup.name, reliability: sup.reliability, landsMonth: now + 1,
    promised, promisedNumbers: { qty: q, unitCost, cost, landsMonth: now + 1 },
    msg: `Ordered ${q} units from ${sup.name} for ${fmt(S, cost)}. ${promised}`
  };
}

/* ------------------------------------------------------------------ *
   PRICING — set prices per item. The effect is read from biz.prices
   at settlement (pricingEffectFor), so it always matches the list.
   ------------------------------------------------------------------ */
export function pricingEffectFor(S, biz) {
  ensureOpsState(S, biz);
  const cat = OPS_CATALOGUE[opsGroupForBusiness(biz)];
  let revenueMult = 1, repeatRateDelta = 0;
  const lines = [];
  for (const it of cat.items) {
    const p = biz.prices[it.id] || { price: it.frac, standard: it.frac };
    const std = Number(p.standard) || 1;
    const ratio = (Number(p.price) || 0) / std;
    if (ratio >= OPS_PRICE_HIGH_RATIO) {
      revenueMult *= OPS_PRICE_HIGH_REV;
      repeatRateDelta += OPS_PRICE_HIGH_REPEAT;
      lines.push(`${it.label} is priced high (${fmt(S, p.price)} vs the usual ${fmt(S, std)}) — more money per sale, but some customers stop coming back.`);
    } else if (ratio <= OPS_PRICE_LOW_RATIO) {
      revenueMult *= OPS_PRICE_LOW_REV;
      repeatRateDelta += OPS_PRICE_LOW_REPEAT;
      lines.push(`${it.label} is priced low (${fmt(S, p.price)} vs the usual ${fmt(S, std)}) — thinner margin, but customers come back.`);
    }
  }
  return { revenueMult, repeatRateDelta, lines };
}

export function setPrice(S, biz, itemId, dir) {
  ensureExtendedState(S);
  ensureOpsState(S, biz);
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const cat = OPS_CATALOGUE[opsGroupForBusiness(biz)];
  const item = cat.items.find(i => i.id === itemId);
  if (!item) return { ok: false, msg: `This business prices: ${cat.items.map(i => i.label).join(', ')}.` };
  const cur = biz.prices[itemId] || { price: 0, standard: 0 };
  const std = Number(cur.standard) || Math.max(1, Math.round(opsAvgTicket(S, biz) * item.frac));
  let price = Number(cur.price) || std;
  if (dir === 'up') price = Math.min(Math.round(std * 1.3), Math.round(price + std * 0.1));
  else if (dir === 'down') price = Math.max(Math.round(std * 0.7), Math.round(price - std * 0.1));
  else if (dir === 'std') price = std;
  else return { ok: false, msg: 'Raise, lower, or reset the price.' };
  biz.prices[itemId] = { price, standard: std };
  const ratio = price / std;
  const eff = pricingEffectFor(S, biz);
  const state = ratio >= OPS_PRICE_HIGH_RATIO
    ? 'priced high — more money per sale, but some customers stop coming back'
    : ratio <= OPS_PRICE_LOW_RATIO
      ? 'priced low — thinner margin, but customers come back'
      : 'at the usual price';
  logOps(S, biz, `${item.label} at ${biz.name} is now ${fmt(S, price)} (usual ${fmt(S, std)}) — ${state}.`);
  biz.opsEngaged = true; /* setting a price means the player operates this business now */
  return {
    ok: true, itemId, item: item.label, price, standard: std, ratio,
    promised: `${item.label} at ${fmt(S, price)} (${state}). The whole price list moves next month's revenue ×${eff.revenueMult.toFixed(3)} and repeat customers ${eff.repeatRateDelta >= 0 ? '+' : ''}${(eff.repeatRateDelta * 100).toFixed(1)}%.`,
    promisedNumbers: { price, standard: std, ratio, revenueMult: eff.revenueMult, repeatRateDelta: eff.repeatRateDelta },
    msg: `${item.label} at ${biz.name} is now ${fmt(S, price)} — ${state}.`
  };
}

/* ------------------------------------------------------------------ *
   SUPPLIERS — switch supplier (free; it changes what future orders
   cost and whether they arrive).
   ------------------------------------------------------------------ */
export function chooseSupplier(S, biz, supplierId) {
  ensureExtendedState(S);
  ensureOpsState(S, biz);
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const sup = opsSuppliersFor(biz).find(s => s.id === supplierId);
  if (!sup) return { ok: false, msg: `Suppliers here: ${opsSuppliersFor(biz).map(s => s.name).join(', ')}.` };
  if (biz.supplier?.id === sup.id) return { ok: false, msg: `${biz.name} already buys from ${sup.name}.` };
  biz.supplier = { ...sup };
  const unitCost = opsUnitCost(S, biz);
  logOps(S, biz, `${biz.name} now buys from ${sup.name} — ${fmt(S, unitCost)} a unit, ${Math.round(sup.reliability * 100)}% of deliveries arrive.`);
  biz.opsEngaged = true; /* switching supplier means the player operates this business now */
  return {
    ok: true, supplier: sup.name, priceMult: sup.priceMult, reliability: sup.reliability, unitCost,
    promised: `From now on a unit costs ${fmt(S, unitCost)} (${sup.priceMult}× the base cost) and ${Math.round(sup.reliability * 100)}% of deliveries arrive.`,
    promisedNumbers: { priceMult: sup.priceMult, reliability: sup.reliability, unitCost },
    msg: `${biz.name} now buys from ${sup.name} — ${fmt(S, unitCost)} a unit, ${Math.round(sup.reliability * 100)}% of deliveries arrive.`
  };
}

/* ------------------------------------------------------------------ *
   STAFF — the rota. Overtime costs extra pay in next month's P&L and
   tires the person out (their morale falls now, so the card shows it);
   a day off costs a little revenue next month and rests them.
   ------------------------------------------------------------------ */
export function setOvertime(S, biz, staffId) {
  ensureExtendedState(S);
  ensureOpsState(S, biz);
  resetMonthlyTrackers(S, biz);
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const emp = (biz.staff || []).find(e => e.id === staffId);
  if (!emp) return { ok: false, msg: 'That person does not work here.' };
  if (biz.opsRota.overtime.includes(staffId)) return { ok: false, msg: `${emp.name} is already on overtime this month.` };
  if (biz.opsRota.dayOff.includes(staffId)) return { ok: false, msg: `${emp.name} already has a day off this month — not overtime too.` };
  const cost = Math.max(1, Math.round((Number(emp.wageLocal) || 0) * 0.25));
  biz.opsRota.overtime.push(staffId);
  emp.morale = clamp(Math.round(Number(emp.morale) || 0) - 6, 5, 100);
  addMonthEffect(biz, { costAdd: cost, notes: [`Overtime for ${emp.name} — ${fmt(S, cost)} extra pay in this month's costs.`] });
  logOps(S, biz, `${emp.name} is on overtime at ${biz.name} — ${fmt(S, cost)} extra pay next month, and they are tired (morale ${Math.round(emp.morale)}).`);
  return {
    ok: true, staffId, name: emp.name, cost,
    promised: `Overtime costs ${fmt(S, cost)} extra pay in next month's costs, and ${emp.name}'s morale falls 6 (tired staff make mistakes).`,
    promisedNumbers: { costAdd: cost, moraleDelta: -6 },
    msg: `${emp.name} is on overtime — ${fmt(S, cost)} extra pay next month, morale −6.`
  };
}

export function giveDayOff(S, biz, staffId) {
  ensureExtendedState(S);
  ensureOpsState(S, biz);
  resetMonthlyTrackers(S, biz);
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const emp = (biz.staff || []).find(e => e.id === staffId);
  if (!emp) return { ok: false, msg: 'That person does not work here.' };
  if (biz.opsRota.dayOff.includes(staffId)) return { ok: false, msg: `${emp.name} already has a day off this month.` };
  if (biz.opsRota.overtime.includes(staffId)) return { ok: false, msg: `${emp.name} is on overtime this month — not a day off too.` };
  const lostSales = Math.max(1, Math.round((Number(biz.monthlyRev) || 0) * 0.02));
  biz.opsRota.dayOff.push(staffId);
  emp.morale = clamp(Math.round(Number(emp.morale) || 0) + 8, 5, 100);
  addMonthEffect(biz, { revenueAdd: -lostSales, notes: [`${emp.name} took a day off — ${fmt(S, lostSales)} less revenue this month (one person short).`] });
  logOps(S, biz, `${emp.name} took a day off from ${biz.name} — ${fmt(S, lostSales)} less revenue next month, and they are rested (morale ${Math.round(emp.morale)}).`);
  return {
    ok: true, staffId, name: emp.name, lostSales,
    promised: `A day off costs ${fmt(S, lostSales)} in lost sales next month, and ${emp.name}'s morale rises 8 (a rested person works better).`,
    promisedNumbers: { revenueAdd: -lostSales, moraleDelta: 8 },
    msg: `${emp.name} took a day off — ${fmt(S, lostSales)} less revenue next month, morale +8.`
  };
}

/* ------------------------------------------------------------------ *
   MARKETING — spend on a channel now (cash out now, through the
   ledger like any decision cost); new customers arrive next month
   (revenueAdd). Diminishing returns per channel per month.
   ------------------------------------------------------------------ */
export function spendMarketing(S, biz, channelId) {
  ensureExtendedState(S);
  ensureOpsState(S, biz);
  resetMonthlyTrackers(S, biz);
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const ch = OPS_MARKETING_CHANNELS.find(c => c.id === channelId);
  if (!ch) return { ok: false, msg: `Channels: ${OPS_MARKETING_CHANNELS.map(c => c.label).join(', ')}.` };
  const cost = Math.max(1, Math.round((Number(biz.monthlyRev) || 0) * ch.costFrac));
  if ((Number(S.money?.cash) || 0) < cost) {
    return { ok: false, msg: `${ch.label} costs ${fmt(S, cost)} — you have ${fmt(S, S.money?.cash || 0)} in cash.` };
  }
  const n = Number(biz.opsMarketing.counts[channelId] || 0);
  const factor = OPS_MARKETING_DIMINISH[Math.min(n, OPS_MARKETING_DIMINISH.length - 1)];
  const revenueAdd = Math.max(1, Math.round((Number(biz.monthlyRev) || 0) * ch.revFrac * factor));
  walletMove(S, -cost, `${ch.label} — ${biz.name}`, 'business');
  biz.opsMarketing.counts[channelId] = n + 1;
  addMonthEffect(biz, { revenueAdd, notes: [`${ch.label} — ${fmt(S, revenueAdd)} more revenue next month (spend #${n + 1} on this channel this month${n > 0 ? ', worth less than the first' : ''}).`] });
  logOps(S, biz, `Spent ${fmt(S, cost)} on ${ch.label} for ${biz.name} — ${fmt(S, revenueAdd)} more revenue next month (spend #${n + 1} on this channel this month).`);
  return {
    ok: true, channelId, channel: ch.label, cost, revenueAdd, spendNumber: n + 1, factor,
    promised: `${ch.label} costs ${fmt(S, cost)} now and brings ${fmt(S, revenueAdd)} more revenue next month. This is spend #${n + 1} on this channel this month${n === 0 ? ' — a second spend on the same channel is worth half as much' : ' — diminishing returns, each spend on the same channel is worth less than the one before'}.`,
    promisedNumbers: { cost, revenueAdd, spendNumber: n + 1, factor },
    msg: `Spent ${fmt(S, cost)} on ${ch.label} — ${fmt(S, revenueAdd)} more revenue next month.`
  };
}

/* ------------------------------------------------------------------ *
   PREMISES — maintain (existing repair), expand (existing level /
   branch APIs), move (new city, W1's 0.30 repeat rule).
   ------------------------------------------------------------------ */
export function maintainPremises(S, biz) {
  ensureExtendedState(S);
  ensureOpsState(S, biz);
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const r = repairBusinessPremises(S, biz);
  if (r && r.ok) biz.opsEngaged = true; /* a real repair means the player operates this business now */
  return r;
}

export function opsExpandBusiness(S, biz) {
  ensureExtendedState(S);
  const r = expandBusiness(S, biz);
  if (r && r.ok) biz.opsEngaged = true; /* a real expansion means the player operates this business now */
  return r;
}

export function opsOpenBranch(S, biz, cityId, opts = {}) {
  ensureExtendedState(S);
  const r = openBranch(S, biz, cityId, opts);
  if (r && r.ok) biz.opsEngaged = true; /* a real branch means the player operates this business now */
  return r;
}

export function opsMoveCost(S, biz) {
  ensureOpsState(S, biz);
  return Math.max(1, Math.round((Number(biz.monthlyRev) || 0) * 0.25 + (Number(biz.premises?.monthlyRentLocal) || 0)));
}

export function moveBusiness(S, biz, newCity) {
  ensureExtendedState(S);
  ensureOpsState(S, biz);
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const countryId = biz.country || S.country;
  const cities = getCountry(countryId).cities || [];
  if (!newCity || !cities.includes(newCity)) {
    return { ok: false, msg: `Move where? ${biz.name} can move to another city in ${getCountry(countryId).name}: ${cities.filter(c => c !== biz.city).join(', ')}.` };
  }
  if (newCity === biz.city) return { ok: false, msg: `${biz.name} is already in ${newCity}.` };
  const cost = opsMoveCost(S, biz);
  if ((Number(S.money?.cash) || 0) < cost) {
    return { ok: false, msg: `Moving ${biz.name} to ${newCity} costs ${fmt(S, cost)} — you have ${fmt(S, S.money?.cash || 0)} in cash.` };
  }
  const oldCity = biz.city;
  walletMove(S, -cost, `Moved ${biz.name} from ${oldCity} to ${newCity}`, 'business');
  biz.city = newCity;
  /* W1's new-city rule: nobody knows you there yet — repeat customers
     start at 30%. The base P&L's repeat effect then cuts next month's
     revenue until regulars build up again. */
  biz.repeatRate = 0.30;
  biz.opsEngaged = true; /* moving the business means the player operates it now */
  biz.remote = newCity !== S.city;
  biz.premises = { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 };
  logOps(S, biz, `Moved ${biz.name} from ${oldCity} to ${newCity} for ${fmt(S, cost)} — repeat customers reset to 30% in the new city${biz.remote ? ', and it is now run remotely' : ''}.`);
  return {
    ok: true, from: oldCity, to: newCity, cost, repeatRateAfter: 0.30, remote: biz.remote,
    promised: `Moving costs ${fmt(S, cost)} now. In ${newCity} nobody knows the business yet — repeat customers reset to 30%, so next month's revenue falls until regulars build up again.`,
    promisedNumbers: { cost, repeatRateAfter: 0.30 },
    msg: `Moved ${biz.name} to ${newCity} for ${fmt(S, cost)} — repeat customers reset to 30% in the new city.`
  };
}

/* ------------------------------------------------------------------ *
   CASH — thin wrappers over the v2.14 functions. Behaviour (including
   the tax on withdrawal) is exactly as v2.14 shipped it.
   ------------------------------------------------------------------ */
export function opsWithdrawCash(S, biz, amount) {
  ensureExtendedState(S);
  const r = withdrawBusinessCash(S, biz, amount);
  if (r && r.ok) biz.opsEngaged = true;
  return r;
}
export function opsReinvestCash(S, biz, amount) {
  ensureExtendedState(S);
  const r = reinvestBusinessCash(S, biz, amount);
  if (r && r.ok) biz.opsEngaged = true;
  return r;
}
export function opsPayDownDebt(S, biz, amount) {
  ensureExtendedState(S);
  const r = payExtraOnBusinessLoan(S, biz, amount);
  if (r && r.ok) biz.opsEngaged = true;
  return r;
}

/* ------------------------------------------------------------------ *
   SETTLEMENT — resolve this month's operating effects into
   biz.monthEffects, for the fold to read. Called ONCE per month by
   the fold (guarded by biz._opsAppliedMonth); a second call in the
   same month returns the cached result without re-resolving.
   Order inside: deliveries first (they decide what stock is on
   hand), then prices, then stock vs what the month usually sells.
   opts.forceDelivery ('ok' | 'fail') pins a delivery outcome for
   deterministic testing; real play never sets it.
   ------------------------------------------------------------------ */
export function applyOperationsEffects(S, biz, opts = {}) {
  if (!biz) return emptyMonthEffects();
  /* v2.17 merge — the stock/pricing/delivery system only runs for a
     business the player actually operates: taking any ops action sets
     biz.opsEngaged, and only then does the settlement touch stock.
     Without this gate, wiring the fold into the real settlement made
     every business burn through its starting stock in month 1 and
     then lose 45% of its sales every month after — businesses the
     player never opened the menu for starved to death (v217-verify
     3a/4a/4b/5c, v217-w2 twins). A business the player never operates
     trades exactly as it did in v2.14. Rendering the menu does NOT
     engage (ensureOpsState below is only called for engaged ones). */
  if (!biz.opsEngaged) return emptyMonthEffects();
  ensureOpsState(S, biz);
  const now = nowIdx(S);
  if (biz._opsAppliedMonth === now && !opts.force) {
    const cached = biz._opsAppliedEffects || biz.monthEffects || emptyMonthEffects();
    return { ...cached, notes: [...(cached.notes || [])] };
  }
  let revenueMult = 1, revenueAdd = 0, costAdd = 0, repeatRateDelta = 0;
  const notes = [];

  /* 1. Deliveries due this month. */
  const due = (biz.pendingDeliveries || []).filter(d => (Number(d.landsMonth) || 0) <= now);
  biz.pendingDeliveries = (biz.pendingDeliveries || []).filter(d => (Number(d.landsMonth) || 0) > now);
  for (const d of due) {
    const forced = opts.forceDelivery || d.forceDelivery || null;
    const delivered = forced === 'fail' ? false : forced === 'ok' ? true : rand(S) < (Number(d.reliability) || 0.98);
    if (delivered) {
      biz.stockLevel = (Number(biz.stockLevel) || 0) + Number(d.qty || 0);
      const dc = Math.round(Number(d.qty || 0) * (Number(d.unitCost) || 0));
      costAdd += dc;
      notes.push(`${Number(d.qty)} units arrived from ${d.supplierName} — ${fmt(S, dc)} of stock in this month's costs.`);
    } else {
      biz.lastSupplierOutcome = {
        year: S.year, month: S.month,
        text: `${d.supplierName} failed to deliver ${Number(d.qty)} units — nothing arrived, nothing was charged, and the shelves stayed empty.`
      };
      notes.push(`${d.supplierName} failed to deliver ${Number(d.qty)} units — nothing arrived and nothing was charged.`);
    }
  }

  /* 2. Prices (read from the price list the player set). */
  const pe = pricingEffectFor(S, biz);
  revenueMult *= pe.revenueMult;
  repeatRateDelta += pe.repeatRateDelta;
  notes.push(...pe.lines);

  /* 3. Stock on hand vs what the month usually sells. */
  const demand = opsMonthlyUnits(biz);
  const stock = Math.max(0, Math.round(Number(biz.stockLevel) || 0));
  if (stock <= 0) {
    revenueMult *= OPS_STOCKOUT_MULT;
    notes.push(`No stock on hand — with empty shelves, sales fell 45% this month (revenue ×${OPS_STOCKOUT_MULT}).`);
  } else if (stock < demand) {
    const m = OPS_STOCKOUT_MULT + (1 - OPS_STOCKOUT_MULT) * (stock / demand);
    revenueMult *= m;
    notes.push(`Only ${stock} of the ${demand} units the month usually sells were on hand — sales fell to ${Math.round(m * 100)}% (revenue ×${m.toFixed(2)}).`);
  } else if (stock > demand) {
    const waste = Math.round((stock - demand) * opsBaseUnitCost(S, biz));
    if (waste > 0) {
      costAdd += waste;
      notes.push(`Bought ${stock - demand} units more than the ${demand} the month sold — ${fmt(S, waste)} of stock wasted.`);
    }
  }
  biz.stockLevel = 0; /* sold + wasted — next month needs a new order */

  /* Merge into the one monthEffects object (actions may already have
     stamped marketing / rota effects into it this month). */
  addMonthEffect(biz, { revenueMult, revenueAdd, costAdd, repeatRateDelta, notes });
  biz._opsAppliedMonth = now;
  biz._opsAppliedEffects = { ...biz.monthEffects, notes: [...biz.monthEffects.notes] };
  return { ...biz.monthEffects, notes: [...biz.monthEffects.notes] };
}

/* Reference fold (coordinator: call in computeBusinessMonthFull right
   after the per-industry decisions fold, step 6). Applies the
   monthEffects to the P&L, recomputes profit/tax/net on the folded
   numbers, applies repeatRateDelta / moraleDelta to the business
   state, then clears monthEffects (consumed — one month only). */
export function foldMonthEffectsIntoPL(S, biz, pl, eff) {
  if (!pl) return pl;
  if (!biz) return pl;
  const e = eff || biz.monthEffects || emptyMonthEffects();
  if (e.revenueMult != null && e.revenueMult !== 1) pl.revenue = Math.max(0, Math.round(pl.revenue * e.revenueMult));
  if (e.revenueAdd) pl.revenue = Math.max(0, pl.revenue + Math.round(e.revenueAdd));
  if (e.costAdd) {
    pl.other = Math.max(0, (pl.other || 0) + Math.round(e.costAdd));
    pl.costs = (pl.costs || 0) + Math.round(e.costAdd);
  }
  pl.profit = pl.revenue - pl.costs;
  const ti = computeBusinessTax(S, pl.profit);
  pl.tax = ti.tax;
  pl.taxLabel = ti.label;
  pl.net = pl.profit - pl.tax;
  if (Number(e.repeatRateDelta) || 0) biz.repeatRate = clamp((Number(biz.repeatRate ?? 0.5)) + Number(e.repeatRateDelta), 0, 1);
  if (Number(e.moraleDelta) || 0) {
    for (const emp of (biz.staff || [])) emp.morale = clamp(Math.round(Number(emp.morale) || 0) + Number(e.moraleDelta), 5, 100);
  }
  pl.opsNotes = [...(e.notes || [])];
  pl.repeatRate = Number((Number(biz.repeatRate ?? 0.5)).toFixed(3));
  biz.monthEffects = emptyMonthEffects();
  biz._lastRoleEffects = null; /* the stamped role contribution goes with it */
  return pl;
}

/* ------------------------------------------------------------------ *
   RENDER — the operating menu. Seven <details> sections, collapsed by
   default; the player opens the one they want. Every button names its
   cost in plain words before committing. This file never touches
   views.js — the coordinator inserts renderOperationsMenuHtml(S, biz)
   into the business card (see PROGRESS.md for the exact anchor).
   v2.20 I4 — the card is a menu now: the sections that used to sit
   OPEN on every card live inside these <details> instead, passed in
   as `extras` by views.js (staff list + manager → Staff, premises +
   branches → Premises, loan + exits + group costs → Cash, brand →
   Marketing, group supply chain → Suppliers). No extras means the
   plain seven-section menu, as before.
   ------------------------------------------------------------------ */
export function renderOperationsMenuHtml(S, biz, extras = {}) {
  if (!biz) return '';
  ensureOpsState(S, biz);
  return `
  <div class="biz-ops-menu" style="margin-top:10px;">
    <h4>Run the business — open a section</h4>
    <div class="muted" style="margin-bottom:6px;">One section at a time. Every action names its cost before you commit, and its effect lands in next month's profit and loss.</div>
    ${renderStockSectionHtml(S, biz)}
    ${renderPricingSectionHtml(S, biz)}
    ${renderSuppliersSectionHtml(S, biz, extras)}
    ${renderStaffRotaSectionHtml(S, biz, extras)}
    ${renderMarketingSectionHtml(S, biz, extras)}
    ${renderPremisesSectionHtml(S, biz, extras)}
    ${renderCashSectionHtml(S, biz, extras)}
    ${biz.opsLog.length ? `<div class="muted" style="margin-top:6px;font-size:12px;"><strong>Recently:</strong> ${biz.opsLog.slice(0, 3).map(l => escHtml(l.text)).join(' · ')}</div>` : ''}
  </div>`;
}

export function renderStockSectionHtml(S, biz) {
  ensureOpsState(S, biz);
  const demand = opsMonthlyUnits(biz);
  const unitCost = opsUnitCost(S, biz);
  /* v2.20 I3 — the unit cost is what a unit costs to BUY, labelled as
     such, next to the selling price (the average ticket) and the
     takings capacity, so stock and revenue visibly reconcile: 800
     units × 26 selling price = 20,800 takings capacity against
     monthly takings of 20,900. The old bare "13 EGP a unit" read as
     the selling price and never added up. */
  const ticket = opsAvgTicket(S, biz);
  const capacity = Math.round(demand * ticket);
  const pending = (biz.pendingDeliveries || []).map(d =>
    `${Number(d.qty)} units from ${escHtml(d.supplierName)} (${fmt(S, d.cost)}) due next month`).join('; ');
  const packs = OPS_STOCK_PACKS.map(p => {
    const qty = Math.round(demand * p.frac);
    const cost = Math.round(qty * unitCost);
    const afford = (Number(S.money?.cash) || 0) >= cost;
    return `<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:4px 0;">
      <span><strong>${escHtml(p.label)}</strong> — ${qty} units · costs ${fmt(S, unitCost)} a unit to buy from ${escHtml(biz.supplier.name)}</span>
      <span>${afford
        ? `<button class="btn btn-sm" data-action="biz-ops-stock-order" data-biz="${escHtml(biz.id)}" data-qty="${qty}">Order ${qty} units — costs ${fmt(S, cost)}</button>`
        : `<button class="btn btn-sm" disabled>Order ${qty} units — costs ${fmt(S, cost)}</button> ${lockReason('Not enough cash', `Need ${fmt(S, cost)} — you have ${fmt(S, S.money?.cash || 0)}`)}`}</span>
    </div>`;
  }).join('');
  return `
  <details class="biz-ops-stock" style="margin:6px 0;">
    <summary><strong>Stock</strong> — <span class="muted">${Math.round(Number(biz.stockLevel) || 0)} units on hand · usually sells ${demand} a month · costs ${fmt(S, unitCost)} a unit to buy (sells for ~${fmt(S, ticket)})</span></summary>
    <div class="muted" style="margin:4px 0;">${demand} units × ${fmt(S, ticket)} selling price = ${fmt(S, capacity)} takings capacity a month. Stock is paid for when it arrives, in next month's costs. Empty shelves lose sales; buying more than the month sells wastes money.${pending ? ` <strong>On its way:</strong> ${escHtml(pending)}.` : ''}</div>
    ${packs}
  </details>`;
}

export function renderPricingSectionHtml(S, biz) {
  ensureOpsState(S, biz);
  const cat = OPS_CATALOGUE[opsGroupForBusiness(biz)];
  const rows = cat.items.map(it => {
    const p = biz.prices[it.id] || { price: 0, standard: 0 };
    const ratio = (Number(p.price) || 0) / (Number(p.standard) || 1);
    const state = ratio >= OPS_PRICE_HIGH_RATIO ? 'priced high — more per sale, some customers leave'
      : ratio <= OPS_PRICE_LOW_RATIO ? 'priced low — thinner margin, customers come back' : 'at the usual price';
    return `<div style="padding:4px 0;">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;">
        <strong>${escHtml(it.label)}</strong><span class="muted">${fmt(S, p.price)} (usual ${fmt(S, p.standard)}) — ${escHtml(state)}</span>
      </div>
      <div style="display:flex;gap:6px;margin-top:4px;">
        <button class="btn btn-sm" data-action="biz-ops-price" data-biz="${escHtml(biz.id)}" data-item="${escHtml(it.id)}" data-dir="up">Raise price +10%</button>
        <button class="btn btn-sm" data-action="biz-ops-price" data-biz="${escHtml(biz.id)}" data-item="${escHtml(it.id)}" data-dir="down">Lower price −10%</button>
        <button class="btn btn-sm" data-action="biz-ops-price" data-biz="${escHtml(biz.id)}" data-item="${escHtml(it.id)}" data-dir="std">Back to usual price</button>
      </div>
    </div>`;
  }).join('');
  return `
  <details class="biz-ops-pricing" style="margin:6px 0;">
    <summary><strong>Pricing</strong> — <span class="muted">${cat.items.length} priced items</span></summary>
    <div class="muted" style="margin:4px 0;">Setting a price is free. A price 15% above usual is "high" (+4% revenue per item, some customers stop coming back); 15% below is "low" (−3% revenue per item, customers come back).</div>
    ${rows}
  </details>`;
}

export function renderSuppliersSectionHtml(S, biz, extras = {}) {
  ensureOpsState(S, biz);
  const rows = opsSuppliersFor(biz).map(sup => {
    const cur = biz.supplier?.id === sup.id;
    const unitCost = Math.max(1, Math.round(opsBaseUnitCost(S, biz) * sup.priceMult));
    return `<div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:4px 0;">
      <span><strong>${escHtml(sup.name)}</strong> — costs ${fmt(S, unitCost)} a unit to buy · ${Math.round(sup.reliability * 100)}% of deliveries arrive</span>
      <span>${cur ? '<span class="muted">Current supplier</span>'
        : `<button class="btn btn-sm" data-action="biz-ops-supplier" data-biz="${escHtml(biz.id)}" data-supplier="${escHtml(sup.id)}">Switch to ${escHtml(sup.name)} (free — next order costs ${fmt(S, unitCost)} a unit to buy)</button>`}</span>
    </div>`;
  }).join('');
  return `
  <details class="biz-ops-suppliers" style="margin:6px 0;">
    <summary><strong>Suppliers</strong> — <span class="muted">buying from ${escHtml(biz.supplier.name)} · ${Math.round((Number(biz.supplier.reliability) || 0) * 100)}% of deliveries arrive</span></summary>
    <div class="muted" style="margin:4px 0;">Switching supplier is free. A cheap supplier can fail to deliver — then nothing arrives, nothing is charged, and the shelves stay empty.${biz.lastSupplierOutcome ? ` <strong>Last failure:</strong> ${escHtml(biz.lastSupplierOutcome.text)}` : ''}</div>
    ${rows}
    ${extras.groupSupplyHtml || ''}
  </details>`;
}

export function renderStaffRotaSectionHtml(S, biz, extras = {}) {
  ensureOpsState(S, biz);
  resetMonthlyTrackers(S, biz);
  const staff = biz.staff || [];
  /* v2.20 I4 — the staff list (hire / train / promote / fire) and the
     manager section live HERE now, inside Staff, not open on the card.
     The summary names the headcount and payroll so the collapsed
     section still says what it holds. */
  const payroll = staff.reduce((sum, e) => sum + (Number(e.wageLocal) || 0), 0);
  const summary = staff.length === 0
    ? 'nobody hired yet'
    : `${staff.length} employee${staff.length === 1 ? '' : 's'} · payroll ${fmt(S, payroll)}/mo · rota`;
  if (!staff.length) {
    return `
  <details class="biz-ops-staff" style="margin:6px 0;">
    <summary><strong>Staff</strong> — <span class="muted">${summary}</span></summary>
    ${extras.staffHtml || ''}
    <div class="muted">No staff to rota — hire someone below.</div>
    ${extras.managerHtml || ''}
  </details>`;
  }
  const rows = staff.map(emp => {
    const wage = Number(emp.wageLocal) || 0;
    const otCost = Math.max(1, Math.round(wage * 0.25));
    const offCost = Math.max(1, Math.round((Number(biz.monthlyRev) || 0) * 0.02));
    const onOt = biz.opsRota.overtime.includes(emp.id);
    const onOff = biz.opsRota.dayOff.includes(emp.id);
    return `<div style="padding:4px 0;">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;">
        <strong>${escHtml(emp.name)}</strong><span class="muted">${escHtml(emp.role || 'Staff member')} · ${fmt(S, wage)}/mo · morale ${Math.round(Number(emp.morale) || 0)}${onOt ? ' · on overtime this month' : ''}${onOff ? ' · day off this month' : ''}</span>
      </div>
      <div style="display:flex;gap:6px;margin-top:4px;">
        ${onOt || onOff ? '<span class="muted" style="font-size:12px;">Rota already set for this person this month.</span>' : `
        <button class="btn btn-sm" data-action="biz-ops-overtime" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}">Overtime — costs ${fmt(S, otCost)} extra pay, morale −6</button>
        <button class="btn btn-sm" data-action="biz-ops-dayoff" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}">Day off — costs ${fmt(S, offCost)} in lost sales, morale +8</button>`}
      </div>
    </div>`;
  }).join('');
  return `
  <details class="biz-ops-staff" style="margin:6px 0;">
    <summary><strong>Staff</strong> — <span class="muted">${summary}</span></summary>
    ${extras.staffHtml || ''}
    <div class="muted" style="margin:4px 0;">One rota choice per person per month. Tired staff make mistakes — their morale shows on the card.</div>
    ${rows}
    ${extras.managerHtml || ''}
  </details>`;
}

export function renderMarketingSectionHtml(S, biz, extras = {}) {
  ensureOpsState(S, biz);
  resetMonthlyTrackers(S, biz);
  const rows = OPS_MARKETING_CHANNELS.map(ch => {
    const cost = Math.max(1, Math.round((Number(biz.monthlyRev) || 0) * ch.costFrac));
    const n = Number(biz.opsMarketing.counts[ch.id] || 0);
    const factor = OPS_MARKETING_DIMINISH[Math.min(n, OPS_MARKETING_DIMINISH.length - 1)];
    const revenueAdd = Math.max(1, Math.round((Number(biz.monthlyRev) || 0) * ch.revFrac * factor));
    const afford = (Number(S.money?.cash) || 0) >= cost;
    const dimNote = n === 0 ? ''
      : `Spend #${n + 1} on this channel this month — worth ${Math.round(factor * 100)}% of the first (diminishing returns).`;
    return `<div style="padding:4px 0;">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;">
        <strong>${escHtml(ch.label)}</strong><span class="muted">${escHtml(ch.blurb)}</span>
      </div>
      <div style="display:flex;gap:6px;margin-top:4px;align-items:baseline;flex-wrap:wrap;">
        ${afford
          ? `<button class="btn btn-sm" data-action="biz-ops-market" data-biz="${escHtml(biz.id)}" data-channel="${escHtml(ch.id)}">Spend ${fmt(S, cost)} on ${escHtml(ch.label)} — +${fmt(S, revenueAdd)} revenue next month</button>`
          : `<button class="btn btn-sm" disabled>Spend ${fmt(S, cost)} on ${escHtml(ch.label)} — +${fmt(S, revenueAdd)} revenue next month</button> ${lockReason('Not enough cash', `Need ${fmt(S, cost)} — you have ${fmt(S, S.money?.cash || 0)}`)}`}
        ${dimNote ? `<span class="muted" style="font-size:12px;">${escHtml(dimNote)}</span>` : ''}
      </div>
    </div>`;
  }).join('');
  return `
  <details class="biz-ops-marketing" style="margin:6px 0;">
    <summary><strong>Marketing</strong> — <span class="muted">spend on a channel now, new customers arrive next month · second spend on the same channel is worth half</span></summary>
    ${rows}
    ${extras.brandHtml || ''}
  </details>`;
}

export function renderPremisesSectionHtml(S, biz, extras = {}) {
  ensureOpsState(S, biz);
  const cond = Math.round(Number(biz.premises?.conditionPct ?? 90));
  const repairCost = repairCostLocal(S, biz);
  const countryId = biz.country || S.country;
  const cities = getCountry(countryId).cities || [];
  const expandCost = Math.round((Number(biz.capitalInvested) || 0) * 0.55);
  /* v2.20 I4 — the second branch UI lived here (one shop-only button
     per city, its own city rule). It is gone: the Branches section is
     the ONE branch offer UI now, and it renders inside this Premises
     section via extras.branchesHtml. Moving the business to another
     city is a different action and stays. */
  const moveCities = cities.filter(c => c !== biz.city);
  const moveCost = opsMoveCost(S, biz);
  const moveRows = moveCities.map(city => `
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:4px 0;">
      <span><strong>${escHtml(city)}</strong> — nobody knows you there yet, repeat customers reset to 30%</span>
      <span>${(Number(S.money?.cash) || 0) >= moveCost
        ? `<button class="btn btn-sm" data-action="biz-ops-move" data-biz="${escHtml(biz.id)}" data-city="${escHtml(city)}">Move to ${escHtml(city)} — costs ${fmt(S, moveCost)}</button>`
        : `<button class="btn btn-sm" disabled>Move to ${escHtml(city)} — costs ${fmt(S, moveCost)}</button> ${lockReason('Not enough cash', `Need ${fmt(S, moveCost)} — you have ${fmt(S, S.money?.cash || 0)}`)}`}</span>
    </div>`).join('');
  return `
  <details class="biz-ops-premises" style="margin:6px 0;">
    <summary><strong>Premises</strong> — <span class="muted">${escHtml(biz.premises?.label || 'Run from home')} · condition ${cond}% · in ${escHtml(biz.city || S.city)}</span></summary>
    <div class="muted" style="margin:4px 0;">Condition below 60% drags revenue down — repairs keep it up.</div>
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:4px 0;">
      <span><strong>Maintain the premises</strong> — repair to 100% condition</span>
      <span>${repairCost > 0
        ? `<button class="btn btn-sm" data-action="biz-ops-repair" data-biz="${escHtml(biz.id)}">Repair premises — costs ${fmt(S, repairCost)}</button>`
        : '<span class="muted">Nothing to repair — condition is good, or the business runs from home.</span>'}</span>
    </div>
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline;padding:4px 0;">
      <span><strong>Expand this business</strong> — grow a level (needs months trading, profitable months in a row, and a good enough team)</span>
      <span><button class="btn btn-sm" data-action="biz-ops-expand" data-biz="${escHtml(biz.id)}">Expand — costs ${fmt(S, expandCost)}</button></span>
    </div>
    ${moveRows}
    ${extras.premisesHtml || ''}
    ${extras.branchesHtml || ''}
  </details>`;
}

export function renderCashSectionHtml(S, biz, extras = {}) {
  ensureOpsState(S, biz);
  const retained = Math.round(Number(biz.retainedCash) || 0);
  const loan = getBusinessLoan(S, biz);
  const reinvestDefault = Math.round((Number(biz.monthlyRev) || 0) * 0.25);
  const valuation = businessValuation(biz);
  const payExtra = loan ? [
    { label: `Pay extra ${fmt(S, Math.round(loan.monthlyPayment))} (one monthly payment)`, amount: Math.round(loan.monthlyPayment) },
    { label: `Pay extra ${fmt(S, Math.max(Math.round(loan.monthlyPayment), Math.round(loan.balance * 0.1)))} (10% of the balance)`, amount: Math.max(Math.round(loan.monthlyPayment), Math.round(loan.balance * 0.1)) }
  ] : [];
  return `
  <details class="biz-ops-cash" style="margin:6px 0;">
    <summary><strong>Cash</strong> — <span class="muted">retained cash ${fmt(S, retained)}${loan ? ` · loan balance ${fmt(S, loan.balance)}` : ' · no business loan'}</span></summary>
    <div class="muted" style="margin:4px 0;">Retained cash is money already inside the business — not the monthly profit and loss, which already landed in your household. Withdrawing it is taxed again, under ${escHtml(getCountry(S.country).name)} brackets. Reinvesting lifts next month's revenue.</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px;">
      <label class="muted">Withdraw <input type="number" data-ops-cash="withdraw" value="${retained}" min="0" max="${retained}" style="width:130px"> (taxed)</label>
      <button class="btn btn-sm" data-action="biz-ops-withdraw" data-biz="${escHtml(biz.id)}">Withdraw</button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px;">
      <label class="muted">Reinvest <input type="number" data-ops-cash="reinvest" value="${reinvestDefault}" min="0" style="width:130px"></label>
      <button class="btn btn-sm" data-action="biz-ops-reinvest" data-biz="${escHtml(biz.id)}">Reinvest</button>
    </div>
    ${loan ? `<div style="margin-top:6px;"><strong>Pay down the loan.</strong> <span class="muted">Balance ${fmt(S, loan.balance)} · ${fmt(S, loan.monthlyPayment)}/month · ${(Number(loan.annualRate) * 100).toFixed(1)}% APR · ${loan.remainingMonths} months left.</span>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
        ${payExtra.map(p => `<button class="btn btn-sm" data-action="biz-ops-paydebt" data-biz="${escHtml(biz.id)}" data-amount="${p.amount}">${escHtml(p.label)}</button>`).join('')}
      </div></div>` : `<div class="muted" style="margin-top:6px;">No business loan to pay down — the loan offers are below in this section.</div>`}
    ${extras.loanHtml || ''}
    ${extras.exitsHtml || ''}
    ${extras.groupCashHtml || ''}
    <div style="margin-top:8px;"><button class="btn btn-sm" data-action="sell-business" data-biz="${escHtml(biz.id)}">Sell ${escHtml(biz.name)} now (valuation ${fmt(S, valuation)})</button></div>
  </details>`;
}
