import{businessIllustration}from '../ui/businessVisuals.js';
/* ============================================================================
   World Life 2.0 — Business Acquisitions (v2.14 W4, §4)
   Buying an existing business, with due diligence.

   Contract:
   - A business for sale is NAMED (a real business name, never
     "Business #3"), with a type from the game's own venture catalogue,
     a city the game knows, an age, a repeat-customer rate, a stated annual
     profit, a VALUATION from the same businessValuation formula the
     game uses for selling (0.7 x capital + 2.8 x annual net profit —
     imported and reused, never re-derived), and a seller's ASK that
     may sit above or below the valuation. Both numbers are shown.
   - The list is generated from the game's own data (venture types,
     cities, era-gating respected) and is STABLE per state: it is
     generated once and cached on S.career.forSaleListings, so the
     same state always shows the same businesses.
   - HIDDEN TRUTH: a listing can look profitable and hide a debt, bad
     staff, or a lease about to end. The hidden flags live on the
     listing (listing.hidden) and are NOT shown without due diligence.
   - DUE DILIGENCE costs money AND a month: the fee and the month are
     stated before the player commits, the month is recorded, and the
     purchase cannot complete in the same month diligence starts.
     Diligence reveals the truth in plain words (debts with amounts,
     staff morale, lease end date).
   - BUYING transfers ownership through the same normalizeBusiness
     record shape a launch uses (no parallel record shape): the
     business becomes a normal record in S.career.businesses with its
     NAMED staff (morale dips on takeover — they may not like the new
     owner), its premises, and its repeat-customer rate. Buying blind (no
     diligence) is allowed but the player is told so before committing
     and the buy returns a warning; a blind buy inherits whatever was
     hidden (the debt lands on the business, the short lease stays
     short, the bad staff stay). A diligent buy is different in a
     measurable way: the price is cut by the hidden debt (the seller
     settles it / the price is renegotiated down), the bad staff are
     gone before handover, and the lease is renewed to 12 months.
   - Buying counts toward the portfolio the same as founding (§1):
     the bought business needs a manager (biz.manager, §2) or the
     player's hours — its mode is set accordingly and never exempted.
   - Every money move posts a ledger line (walletMove).
   ========================================================================== */

import { rand, randInt, clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { pickFirstName, pickFamilyName } from '../data/names.js';
import {
  businessValuation, normalizeBusiness, migrateBusinesses, syncBusinessMirror,
  listAllBusinessVentures, findVentureRow, ventureLocalPricing
} from './businessEngine.js';
import { seedStartingStaff } from './businessStaff.js';
import { listCommercialPremises } from './businessPremises.js';

export const FOR_SALE_COUNT = 4;
export const DUE_DILIGENCE_MONTHS = 1;
/* An inspection costs 2% of the valuation (a real accountant's fee for
   a small business), floored so a cheap business still costs something
   to inspect. The fee is stated on the listing before anyone commits. */
export const DUE_DILIGENCE_FEE_RATE = 0.02;
export const DUE_DILIGENCE_MIN_FEE = 500;
/* Takeover morale dip: the team does not know the new owner yet. */
export const TAKEOVER_MORALE_DIP = 10;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthLabel(year, month) {
  return `${MONTH_NAMES[Math.max(0, Math.min(11, (month || 1) - 1))]} ${year}`;
}

function nextMonth(year, month) {
  const m = (month || 1) + 1;
  return m > 12 ? { year: (year || 2026) + 1, month: 1 } : { year: year || 2026, month: m };
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ *
   Listing generation — from the game's own data, era-gated.
   ------------------------------------------------------------------ */

/* Build one listing. Overrides let a test (or a future event) seed an
   exact business: typeId, city, name, capitalInvested, monthlyRev,
   monthlyCost, repeatRate, ageYears, ask, statedAnnualProfit, and
   hidden { debt, badStaff, leaseEnding }. When overrides.hidden is
   given it is used exactly (missing keys = no hidden problem); when
   it is absent the hidden truth is rolled randomly, so a real game
   listing can hide something and a test listing can hide exactly one
   thing. */
export function makeForSaleListing(S, overrides = {}) {
  ensureExtendedState(S);
  const ventures = listAllBusinessVentures(S);
  const row = (overrides.typeId && findVentureRow(S, overrides.typeId))
    || ventures[randInt(S, 0, Math.max(0, ventures.length - 1))]
    || null;
  if (!row) return null;
  const countryId = S.country;
  const cities = getCountry(countryId).cities || ['Cairo'];
  const city = overrides.city || cities[randInt(S, 0, cities.length - 1)];
  const ageYears = overrides.ageYears !== undefined ? overrides.ageYears : randInt(S, 1, 15);
  const repeatRate = overrides.repeatRate !== undefined ? overrides.repeatRate : randInt(S, 45, 88) / 100;
  /* v2.18 W4 — a business for sale is priced from the same repriced
     venture table as a launch (ventureLocalPricing): the same
     venture in the same country has the same capital, takings and
     other costs whether founded or bought. The || fallbacks are the
     old defaults for a row missing a figure. */
  const pricing = ventureLocalPricing(S, {
    capitalUsd2026: row.capitalUsd2026 || 20000,
    monthlyRevUsd2026: row.monthlyRevUsd2026 || 3000,
    monthlyCostUsd2026: row.monthlyCostUsd2026 || 1500
  });
  const capitalInvested = overrides.capitalInvested !== undefined
    ? overrides.capitalInvested
    : pricing.capitalLocal;
  const monthlyRev = overrides.monthlyRev !== undefined
    ? overrides.monthlyRev
    : pricing.revLocal;
  /* pricing.costLocal is OTHER costs only (v2.20 I3): the venture
     table's monthlyCost is other costs, and the starter team's wages
     are charged from staff by the P&L — never folded into the lump,
     never subtracted out of it. The listing carries the same split a
     launched business carries. */
  const draft = {
    id: nextId(S, 'biz'),
    typeId: row.id,
    name: 'draft',
    country: countryId,
    city,
    level: 1,
    maxLevel: row.maxLevel || 5,
    volatility: (typeof row.volatility === 'number' ? row.volatility : 0.25),
    monthlyRev,
    monthlyCost: overrides.monthlyCost !== undefined
      ? overrides.monthlyCost
      : pricing.costLocal,
    capitalInvested,
    repeatRate,
    mode: 'full_time',
    staff: [],
    premises: null,
    foundedYear: S.year - ageYears,
    foundedMonth: randInt(S, 1, 12),
    lastPL: null,
    history: []
  };
  seedStartingStaff(S, draft, 3);
  /* Premises: a small rented shop from the game's own commercial
     catalogue — the rent shown is the rent the P&L will charge. */
  const shop = (listCommercialPremises(S) || []).find(u => u.unitId === 'comm_shop')
    || (listCommercialPremises(S) || [])[0];
  draft.premises = shop ? {
    kind: 'rented',
    unitId: shop.unitId,
    label: shop.label,
    monthlyRentLocal: shop.monthlyRentLocal,
    conditionPct: shop.conditionPct || 90,
    valueLocal: shop.valueLocal || 0,
    rentedYear: draft.foundedYear,
    rentedMonth: draft.foundedMonth,
    lastDecayYear: S.year,
    leaseMonthsLeft: 12,
    lastReviewYear: null,
    lastReviewMonth: null,
    pendingReview: null
  } : { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 };

  /* Valuation: the game's own formula, on this exact record shape. */
  const valuation = businessValuation(draft);
  const wages = (draft.staff || []).reduce((sum, st) => sum + (Number(st.wageLocal) || 0), 0);
  const rent = Number(draft.premises?.monthlyRentLocal) || 0;
  const trueAnnualProfit = Math.max(0, Math.round((draft.monthlyRev - draft.monthlyCost - wages - rent) * 12));
  /* The seller states the profit — and sellers exaggerate, by up to
     25%. The stated number is what the player sees; the valuation is
     built on the true one. */
  const statedAnnualProfit = overrides.statedAnnualProfit !== undefined
    ? overrides.statedAnnualProfit
    : Math.round(trueAnnualProfit * (1 + rand(S) * 0.25));
  const ask = overrides.ask !== undefined
    ? overrides.ask
    : Math.round(valuation * (0.85 + rand(S) * 0.4));

  /* Hidden truth. Rolled when not overridden: ~40% hide a debt,
     ~40% have bad staff, ~30% have a lease about to end. A listing
     can hide more than one thing. */
  let hidden;
  if (overrides.hidden !== undefined && overrides.hidden !== null) {
    const h = overrides.hidden;
    hidden = {
      debt: h.debt || 0,
      badStaff: h.badStaff || null,
      leaseEnding: h.leaseEnding || null
    };
  } else {
    hidden = { debt: 0, badStaff: null, leaseEnding: null };
    if (rand(S) < 0.4) hidden.debt = Math.round(valuation * (0.15 + rand(S) * 0.35));
    if (rand(S) < 0.4) {
      hidden.badStaff = {
        count: randInt(S, 1, 2),
        morale: randInt(S, 20, 40),
        note: 'One of the team has been coasting for months and the others resent carrying them.'
      };
    }
    if (rand(S) < 0.3) hidden.leaseEnding = { monthsLeft: randInt(S, 1, 3) };
  }
  /* Bad staff really are in the team, at the low morale the hidden
     flag describes — diligence reveals why, it does not invent them. */
  if (hidden.badStaff) {
    for (let i = 0; i < Math.min(hidden.badStaff.count, draft.staff.length); i++) {
      draft.staff[i].morale = hidden.badStaff.morale;
    }
  }

  const sellerFirst = pickFirstName(countryId, rand(S) < 0.5 ? 'm' : 'f', () => rand(S));
  const sellerFamily = pickFamilyName(countryId, () => rand(S));
  const name = overrides.name
    || `${sellerFamily} ${row.label}`;
  const diligenceCost = Math.max(
    DUE_DILIGENCE_MIN_FEE,
    Math.round(valuation * DUE_DILIGENCE_FEE_RATE)
  );
  return {
    id: nextId(S, 'forsale'),
    name,
    typeId: row.id,
    typeLabel: row.label,
    city,
    country: countryId,
    ageYears,
    foundedYear: draft.foundedYear,
    foundedMonth: draft.foundedMonth,
    repeatRate,
    capitalInvested: draft.capitalInvested,
    monthlyRev: draft.monthlyRev,
    monthlyCost: draft.monthlyCost,
    staff: draft.staff,
    premises: draft.premises,
    valuation,
    annualProfit: trueAnnualProfit,
    statedAnnualProfit,
    ask,
    sellerName: `${sellerFirst} ${sellerFamily}`,
    diligenceCost,
    diligenceMonths: DUE_DILIGENCE_MONTHS,
    diligence: null,
    hidden
  };
}

/* The for-sale list, stable per state: generated once, cached on the
   state, and returned as-is afterwards. A bought listing is removed
   from the list; nothing re-rolls it. */
export function listBusinessesForSale(S) {
  ensureExtendedState(S);
  if (!S.career) S.career = {};
  if (!Array.isArray(S.career.forSaleListings)) S.career.forSaleListings = [];
  if (S.career.forSaleListings.length === 0) {
    for (let i = 0; i < FOR_SALE_COUNT; i++) {
      const listing = makeForSaleListing(S);
      if (listing) S.career.forSaleListings.push(listing);
    }
  }
  return S.career.forSaleListings;
}

export function findForSaleListing(S, listingId) {
  if (!listingId) return null;
  return (listBusinessesForSale(S) || []).find(l => l.id === listingId) || null;
}

/* Add a seeded listing to the list (tests, events). Returns it. */
export function addForSaleListing(S, overrides = {}) {
  const listing = makeForSaleListing(S, overrides);
  if (!listing) return null;
  listBusinessesForSale(S).push(listing);
  return listing;
}

/* ------------------------------------------------------------------ *
   Due diligence — costs money AND a month.
   ------------------------------------------------------------------ */

export function diligenceQuote(S, listingId) {
  const listing = findForSaleListing(S, listingId);
  if (!listing) return { ok: false, msg: 'That business is no longer for sale.' };
  return {
    ok: true,
    listingId: listing.id,
    name: listing.name,
    cost: listing.diligenceCost,
    costLabel: formatMoney(listing.diligenceCost, S.country),
    months: DUE_DILIGENCE_MONTHS,
    msg: `Due diligence on ${listing.name} costs ${formatMoney(listing.diligenceCost, S.country)} and takes ${DUE_DILIGENCE_MONTHS} month — an accountant goes through the books, talks to the staff and reads the lease. The purchase cannot complete in the same month diligence starts.`
  };
}

/* Plain-words findings from the hidden truth. Debts carry amounts,
   staff carry morale, the lease carries its end date. */
export function diligenceFindingsText(S, listing) {
  const lines = [];
  const h = listing.hidden || {};
  if (h.debt > 0) {
    lines.push(`DEBT: the business owes ${formatMoney(h.debt, S.country)} that the seller did not mention — unpaid supplier bills and a loan. That debt comes with the business unless the price is cut by the same amount.`);
  } else {
    lines.push('Debts: none found — the books are clean on money owed.');
  }
  if (h.badStaff) {
    const names = (listing.staff || []).slice(0, h.badStaff.count).map(e => e.name).join(', ');
    lines.push(`STAFF: ${names || 'a member of the team'} ${h.badStaff.count > 1 ? 'are' : 'is'} a problem — morale around ${h.badStaff.morale}/100. ${h.badStaff.note}`);
  } else {
    const avg = (listing.staff || []).length
      ? Math.round((listing.staff || []).reduce((s, e) => s + (Number(e.morale) || 0), 0) / listing.staff.length)
      : null;
    lines.push(`Staff: the team looks steady${avg !== null ? ` (average morale ${avg}/100)` : ''} — no one stands out as a problem.`);
  }
  if (h.leaseEnding) {
    const end = nextMonth(S.year, S.month);
    let y = S.year, m = S.month;
    for (let i = 0; i < (h.leaseEnding.monthsLeft || 1); i++) { const n = nextMonth(y, m); y = n.year; m = n.month; }
    lines.push(`LEASE: the lease on ${listing.premises?.label || 'the premises'} ends in ${h.leaseEnding.monthsLeft} month${h.leaseEnding.monthsLeft === 1 ? '' : 's'} (${monthLabel(y, m)}) — after that the landlord can raise the rent or ask you to leave.`);
  } else {
    lines.push(`Lease: ${listing.premises?.label || 'the premises'} has ${listing.premises?.leaseMonthsLeft ?? 12} months left on its lease — no immediate problem.`);
  }
  return lines;
}

export function buyBusinessDueDiligence(S, listingId) {
  ensureExtendedState(S);
  const listing = findForSaleListing(S, listingId);
  if (!listing) return { ok: false, msg: 'That business is no longer for sale.' };
  if (listing.diligence && listing.diligence.done) {
    return {
      ok: true,
      msg: `Due diligence on ${listing.name} was already done — the report is below, no second fee.`,
      cost: 0,
      months: DUE_DILIGENCE_MONTHS,
      readyYear: listing.diligence.readyYear,
      readyMonth: listing.diligence.readyMonth,
      findings: diligenceFindingsText(S, listing),
      alreadyDone: true,
      listing
    };
  }
  const cost = listing.diligenceCost;
  if ((Number(S.money?.cash) || 0) < cost) {
    return { ok: false, msg: `Due diligence on ${listing.name} costs ${formatMoney(cost, S.country)} and takes ${DUE_DILIGENCE_MONTHS} month — you have ${formatMoney(S.money?.cash || 0, S.country)}. You can still buy blind, but you would be buying without knowing what is hidden.` };
  }
  walletMove(S, -cost, `Due diligence — ${listing.name}`, 'business');
  const ready = nextMonth(S.year, S.month);
  listing.diligence = {
    done: true,
    startedYear: S.year,
    startedMonth: S.month,
    readyYear: ready.year,
    readyMonth: ready.month
  };
  const findings = diligenceFindingsText(S, listing);
  recordJournal(S, `You paid ${formatMoney(cost, S.country)} for due diligence on ${listing.name} (${listing.typeLabel} in ${listing.city}). The report is in: ${findings.join(' ')} The purchase cannot complete until ${monthLabel(ready.year, ready.month)}.`, 'money');
  return {
    ok: true,
    msg: `Due diligence on ${listing.name} is done (${formatMoney(cost, S.country)}, ${DUE_DILIGENCE_MONTHS} month). The purchase cannot complete until ${monthLabel(ready.year, ready.month)} — the sale paperwork takes that long.`,
    cost,
    months: DUE_DILIGENCE_MONTHS,
    readyYear: ready.year,
    readyMonth: ready.month,
    readyLabel: monthLabel(ready.year, ready.month),
    findings,
    listing
  };
}

function diligenceReady(S, listing) {
  const d = listing.diligence;
  if (!d || !d.done) return false;
  if (S.year > d.readyYear) return true;
  return S.year === d.readyYear && S.month >= d.readyMonth;
}

/* ------------------------------------------------------------------ *
   Buying — transfers ownership through the same record shape.
   ------------------------------------------------------------------ */

export function buyBusiness(S, listingId, opts = {}) {
  ensureExtendedState(S);
  migrateBusinesses(S);
  const listing = findForSaleListing(S, listingId);
  if (!listing) return { ok: false, msg: 'That business is no longer for sale.' };
  const h = listing.hidden || {};
  const diligent = !!(listing.diligence && listing.diligence.done);
  /* Diligence takes a month: a purchase started in the same month
     diligence started cannot complete yet — the paperwork is not
     ready. The player is told exactly when it will be. */
  if (diligent && !diligenceReady(S, listing)) {
    return {
      ok: false,
      msg: `Due diligence on ${listing.name} started this month — the purchase cannot complete until ${monthLabel(listing.diligence.readyYear, listing.diligence.readyMonth)}. Come back then; the report is already yours.`,
      waitingUntil: monthLabel(listing.diligence.readyYear, listing.diligence.readyMonth)
    };
  }
  /* Price: blind pays the ask. Diligent pays the ask MINUS the hidden
     debt (the seller settles it / the price is renegotiated down by
     the amount owed), floored at 10% of the valuation so a huge debt
     cannot make the business free — but the floor must sit BELOW the
     ask-minus-debt price in the normal case, or diligence would make
     the buyer pay MORE than the blind buyer, which is backwards. */
  let price = listing.ask;
  let debtSettled = 0;
  if (diligent && h.debt > 0) {
    debtSettled = h.debt;
    price = Math.max(Math.round(listing.valuation * 0.1), listing.ask - h.debt);
  }
  if ((Number(S.money?.cash) || 0) < price) {
    return { ok: false, msg: `${listing.name} costs ${formatMoney(price, S.country)}${diligent && debtSettled > 0 ? ` (ask ${formatMoney(listing.ask, S.country)} less the ${formatMoney(debtSettled, S.country)} hidden debt diligence found)` : ''} — you have ${formatMoney(S.money?.cash || 0, S.country)}.` };
  }
  const mode = opts.mode === 'full_time' ? 'full_time' : 'part_time';
  const manager = opts.manager || null;
  /* Staff transfer: the team comes with the business. Morale dips on
     takeover — they do not know the new owner yet. Blind + bad staff:
     the problem staff stay, at their low morale. Diligent: the seller
     lets the problem staff go before handover, so they never join. */
  const staff = (listing.staff || []).map(e => ({ ...e }));
  let badStaffRemoved = 0;
  if (diligent && h.badStaff) {
    const cut = Math.min(h.badStaff.count, staff.length);
    staff.splice(0, cut);
    badStaffRemoved = cut;
  }
  const moraleBefore = staff.map(e => Number(e.morale) || 0);
  for (const emp of staff) emp.morale = clamp((Number(emp.morale) || 0) - TAKEOVER_MORALE_DIP, 5, 100);
  /* Premises: the lease as it stands — blind keeps a short lease,
     diligent gets it renewed to 12 months before handover. */
  const premises = { ...(listing.premises || { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 }) };
  if (h.leaseEnding && !diligent) premises.leaseMonthsLeft = h.leaseEnding.monthsLeft;
  else premises.leaseMonthsLeft = 12;

  walletMove(S, -price, `Bought ${listing.name} — ${listing.typeLabel} in ${listing.city}`, 'business');
  const biz = normalizeBusiness(S, {
    id: nextId(S, 'biz'),
    typeId: listing.typeId,
    name: listing.name,
    country: listing.country,
    city: listing.city,
    level: 1,
    maxLevel: 5,
    volatility: 0.25,
    monthlyRev: listing.monthlyRev,
    monthlyCost: listing.monthlyCost,
    capitalInvested: listing.capitalInvested,
    repeatRate: listing.repeatRate,
    mode,
    staff,
    premises,
    loanId: null,
    misses: 0,
    debtLocal: diligent ? 0 : (h.debt || 0),
    monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: [],
    heirId: null,
    remote: false,
    foundedYear: listing.foundedYear,
    foundedMonth: listing.foundedMonth,
    pricingMode: 'balanced',
    lastPL: null,
    isBranch: false,
    parentBusinessId: null,
    manager: manager || null,
    acquiredVia: 'purchase',
    acquiredYear: S.year,
    acquiredMonth: S.month,
    acquiredFrom: listing.sellerName
  });
  S.career.businesses.push(biz);
  syncBusinessMirror(S);
  /* The listing is gone — it has been bought. */
  S.career.forSaleListings = (S.career.forSaleListings || []).filter(l => l.id !== listing.id);

  const blindWarning = !diligent
    ? `You bought ${listing.name} BLIND — no due diligence was done. The seller said it makes ${formatMoney(listing.statedAnnualProfit, S.country)} a year; if it is hiding debts, unhappy staff or a lease about to end, those are yours now.`
    : null;
  const hoursNote = manager
    ? `${manager.name || 'Your manager'} runs it — it does not take your hours (manager salary applies, §2).`
    : mode === 'full_time'
      ? 'You run it yourself full-time, about 40 hours a week.'
      : 'You run it yourself part-time, 18 hours a week (revenue ×0.6).';
  recordJournal(S, `You bought ${listing.name} (${listing.typeLabel} in ${listing.city}) from ${listing.sellerName} for ${formatMoney(price, S.country)}${diligent && debtSettled > 0 ? ` — the ask was ${formatMoney(listing.ask, S.country)}, cut by the ${formatMoney(debtSettled, S.country)} hidden debt diligence found` : ''}. It comes with ${staff.length} employee${staff.length === 1 ? '' : 's'} and its premises. ${hoursNote}${blindWarning ? ` ${blindWarning}` : ''}${!diligent && (h.debt || 0) > 0 ? ` The hidden debt of ${formatMoney(h.debt, S.country)} is now on the business.` : ''}`, 'milestone');
  return {
    ok: true,
    msg: `You now own ${listing.name} (${listing.typeLabel}, ${listing.city}) — ${formatMoney(price, S.country)}. ${hoursNote}${blindWarning ? ` ${blindWarning}` : ''}`,
    biz,
    price,
    valuation: listing.valuation,
    ask: listing.ask,
    warning: blindWarning,
    blind: !diligent,
    debtInherited: diligent ? 0 : (h.debt || 0),
    debtSettled,
    badStaffRemoved,
    diligenceDone: diligent,
    hoursNote,
    moraleBefore,
    moraleAfter: staff.map(e => Number(e.morale) || 0)
  };
}

/* ------------------------------------------------------------------ *
   Render — the for-sale list.
   ------------------------------------------------------------------ */

export function renderForSaleHtml(S) {
  const listings = listBusinessesForSale(S);
  if (!listings || listings.length === 0) {
    return `<div class="muted">No businesses are for sale in ${escHtml(getCountry(S.country).name || S.country)} right now.</div>`;
  }
  const cards = listings.map(l => {
    const h = l.hidden || {};
    const askDiff = l.ask - l.valuation;
    const askNote = askDiff > 0
      ? `Ask is ${formatMoney(askDiff, S.country)} ABOVE the valuation`
      : askDiff < 0
        ? `Ask is ${formatMoney(-askDiff, S.country)} BELOW the valuation`
        : 'Ask matches the valuation';
    const d = l.diligence;
    const diligenceBlock = d && d.done
      ? `<div style="margin-top:6px;"><strong>Due diligence done</strong> — report in hand. Purchase can complete from ${escHtml(monthLabel(d.readyYear, d.readyMonth))}.<div class="muted" style="font-size:12px;">${diligenceFindingsText(S, l).map(escHtml).join('<br>')}</div></div>`
      : `<div class="muted" style="font-size:12px;margin-top:4px;">Due diligence costs ${formatMoney(l.diligenceCost, S.country)} and takes 1 month.</div>`;
    const staffNames = (l.staff || []).map(e => `${escHtml(e.name)} (${escHtml(e.role)})`).join(', ');
    return `
    <div class="card biz-acquisition-card" style="margin-top:8px;">
      <div class="section-head"><div class="biz-card-title">${businessIllustration({typeId:l.typeId,name:l.typeLabel})}<h4>${escHtml(l.name)}</h4></div><span class="muted">${escHtml(l.typeLabel)} · ${escHtml(l.city)}</span></div>
      <strong class="biz-ask">${formatMoney(l.ask,S.country)}<small>Asking price</small></strong><details data-panel="acquisition_${escHtml(l.id)}"><summary>Review business &amp; purchase</summary>
      <div>Trading ${l.ageYears} year${l.ageYears === 1 ? '' : 's'} · repeat customers ${Math.round((Number(l.repeatRate ?? 0.5)) * 100)}% · seller: ${escHtml(l.sellerName)}</div>
      <div>Seller says it makes <strong>${formatMoney(l.statedAnnualProfit, S.country)}/year</strong> · Valuation <strong>${formatMoney(l.valuation, S.country)}</strong> · Ask <strong>${formatMoney(l.ask, S.country)}</strong> — ${askNote}</div>
      <div class="muted" style="font-size:12px;">Staff who come with it: ${staffNames || 'none'} · Premises: ${escHtml(l.premises?.label || 'run from home')}${l.premises?.monthlyRentLocal ? ` (${formatMoney(l.premises.monthlyRentLocal, S.country)}/mo rent)` : ''}</div>
      ${diligenceBlock}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
        ${!(d && d.done) ? `<button class="btn btn-sm" data-action="biz-buy-diligence" data-listing="${escHtml(l.id)}">Due diligence (${formatMoney(l.diligenceCost, S.country)}, 1 month)</button>` : ''}
        <button class="btn btn-primary btn-sm" data-action="biz-buy" data-listing="${escHtml(l.id)}">Buy for ${formatMoney(l.ask, S.country)}${!(d && d.done) ? ' — BLIND, no inspection done' : ''}</button>
      </div>
      </details>
    </div>`;
  }).join('');
  return `
  <div class="biz-for-sale-section" style="margin-top:10px;">
    <h4>Businesses for sale — ${escHtml(getCountry(S.country).name || S.country)}</h4>
    <div class="muted" style="font-size:12px;">Valuation: 0.7× capital + 2.8× annual profit <span title="Hidden debt is possible. Due diligence takes one month." aria-label="Information">ⓘ</span></div>
    ${cards}
  </div>`;
}
