/* ============================================================================
   World Life 2.0 — v2.11 W3: Business Premises (businessPremises.js)

   A business is linked to a premises: an owned or rented property unit,
   a rented commercial unit from the catalogue below, or run from home.
   This file is the one place that knows the premises rules, so the
   monthly P&L (Worker 1's computeBusinessMonth), the events and the UI
   all read the same numbers:

   - RENT CHARGED = RENT SHOWN (Verdant hold-the-line): the monthly rent
     a business pays is exactly biz.premises.monthlyRentLocal. A rent
     review/renewal only changes what is charged when the player ACCEPTS
     the new rent (acceptBusinessRentReview writes it into that field);
     until then the old rent is charged and the old rent is shown.
   - RUN FROM HOME: no rent, revenue x0.8, level capped at 2 (a home
     business cannot grow past a small operation).
   - CONDITION: starts 90, decays -5/yr (like cars). Condition < 60 ->
     revenue x0.85; < 40 -> revenue x0.7. Repair costs 5% of the unit's
     value per 10 condition points restored, and restores to 100.
   - OWNED property premises: no rent, condition tracked on the business
     AND on the property record (repairing one repairs the other).

   Shared business-access helpers (businessesOf, bizStaffCount, etc.)
   live here too, because the v2.10 base still stores a single business
   as S.career.business while v2.11 stores S.career.businesses[]: every
   reader below works with BOTH shapes, so the events and the gates
   keep working before and after Worker 1 lands businessEngine.js.
   ========================================================================== */

import { chance, clamp, randInt } from '../core/rng.js';
import { nextId, recordJournal, walletMove, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { convertCurrency } from '../data/economy.js';

/* --------------------------------------------------------------------------
   Business access — works with the v2.10 single-business shape AND the
   v2.11 businesses[] shape. S.career.business stays a live mirror of
   businesses[0] (Worker 1 owns the sync); readers never assume one.
   -------------------------------------------------------------------------- */

export function businessesOf(S) {
  if (!S || !S.career) return [];
  if (Array.isArray(S.career.businesses) && S.career.businesses.length) return S.career.businesses;
  if (S.career.business) return [S.career.business];
  return [];
}

export function businessById(S, id) {
  if (!id) return businessesOf(S)[0] || null;
  return businessesOf(S).find((b) => b && b.id === id) || null;
}

/* Staff: v2.11 staff[] of {id,name,role,wageLocal,morale,skill}; v2.10
   only kept a headcount (biz.employees as a number). */
export function bizStaffList(biz) {
  if (!biz) return [];
  if (Array.isArray(biz.staff)) return biz.staff;
  return [];
}

export function bizStaffCount(biz) {
  if (!biz) return 0;
  if (Array.isArray(biz.staff)) return biz.staff.length;
  if (typeof biz.employees === 'number') return biz.employees;
  return 0;
}

/* Age in months since founding. A pre-v2.11 business carries no founding
   date; it was already trading when the save was made, so it counts as
   established (24 months) rather than brand-new — a tax inspection must
   not be gated out forever on an old save, nor gated in on day one. */
export function bizAgeMonths(S, biz) {
  if (!biz) return 0;
  if (biz.foundedYear !== undefined && biz.foundedYear !== null) {
    const months = (S.year - biz.foundedYear) * 12 + (S.month - (biz.foundedMonth || 1));
    return Math.max(0, months);
  }
  return 24;
}

/* Fill any missing v2.11 contract field with its default, without
   overwriting anything already there. Used as a safety net after a
   business is created (the launcher owns the shape; this only patches
   holes, e.g. a business created by the pre-v2.11 launcher). */
export function ensureBusinessContract(S, biz) {
  if (!biz) return null;
  if (biz.level === undefined || biz.level === null) biz.level = 1;
  if (biz.maxLevel === undefined || biz.maxLevel === null) biz.maxLevel = businessLevelCap(biz); /* v2.20 I4: one cap, from the premises */
  if (biz.volatility === undefined || biz.volatility === null) biz.volatility = 0.25;
  if (typeof biz.repeatRate !== 'number' || Number.isNaN(biz.repeatRate)) biz.repeatRate = 0.5;
  if (biz.mode === undefined || biz.mode === null) biz.mode = 'full_time';
  if (!Array.isArray(biz.staff)) biz.staff = [];
  if (biz.premises === undefined) biz.premises = null;
  if (biz.loanId === undefined) biz.loanId = null;
  if (biz.misses === undefined) biz.misses = 0;
  if (biz.debtLocal === undefined) biz.debtLocal = 0;
  if (biz.monthsLosing === undefined) biz.monthsLosing = 0;
  if (!biz.buffs) biz.buffs = { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 1 };
  if (!biz.lastOpUsed) biz.lastOpUsed = { rd: 0, bonus: 0, pricing: 0 };
  if (!Array.isArray(biz.history)) biz.history = [];
  if (biz.heirId === undefined) biz.heirId = null;
  if (biz.remote === undefined) biz.remote = false;
  if (biz.foundedYear === undefined || biz.foundedYear === null) {
    biz.foundedYear = S.year;
    biz.foundedMonth = S.month;
  }
  if (biz.country === undefined || biz.country === null) biz.country = S.country;
  if (biz.city === undefined || biz.city === null) biz.city = S.city;
  return biz;
}

/* --------------------------------------------------------------------------
   Premises factors — the exact numbers Worker 1's computeBusinessMonth
   reads. Keep them here so the P&L, the events and the card agree.
   -------------------------------------------------------------------------- */

/* Revenue multiplier from the premises alone. Home: x0.8 (no shopfront,
   no passing trade). A run-down unit sells less: < 60 -> x0.85, < 40 ->
   x0.7. A home business has no commercial condition to decay, so the
   home factor stands on its own. */
export function premisesRevenueFactor(biz) {
  if (!biz || !biz.premises) return 1;
  if (biz.premises.kind === 'home') return 0.8;
  const cond = Number(biz.premises.conditionPct ?? 100);
  if (cond < 40) return 0.7;
  if (cond < 60) return 0.85;
  return 1;
}

/* A home business cannot grow past level 2 — a small operation run from
   a kitchen table. Any other premises has no cap. This is THE level
   cap (v2.20 I4): displays and expandBusiness both call this one
   function, so the number on the card and the number the gate enforces
   are the same number. biz.maxLevel is only a stored mirror of it
   (refreshed by normalizeBusiness); never read the field for the cap. */
export function businessLevelCap(biz) {
  if (!biz) return 5;
  if (!biz.premises || biz.premises.kind === 'home') return 2;
  return Infinity;
}

/* Old name for the same rule — kept so existing callers keep working. */
export const premisesLevelCap = businessLevelCap;

/* The rent the P&L charges this month: exactly monthlyRentLocal, 0 for
   home or owned premises. This is the Verdant hold-the-line field — the
   rent shown on the card and the rent charged are the same field. */
export function premisesMonthlyRentLocal(biz) {
  if (!biz || !biz.premises) return 0;
  return Number(biz.premises.monthlyRentLocal || 0);
}

/* Yearly decay, -5/yr like cars. Called once per game year per business
   (Worker 1 / the yearly tick owns the call); it catches up if years
   were skipped, and never drops a unit below 5%. */
export function applyPremisesYearlyDecay(S, biz) {
  if (!biz || !biz.premises) return biz;
  if (biz.premises.kind === 'home') return biz;
  const last = Number(biz.premises.lastDecayYear ?? S.year);
  const years = Math.max(0, S.year - last);
  if (years <= 0) return biz;
  biz.premises.conditionPct = Math.max(5, Math.round((biz.premises.conditionPct ?? 90) - 5 * years));
  biz.premises.lastDecayYear = S.year;
  return biz;
}

/* Monthly tick for a rented lease (Worker 1's settlement owns the call):
   counts the lease down. Returns months left, or null for non-rented. */
export function tickBusinessPremisesMonth(S, biz) {
  if (!biz || !biz.premises || biz.premises.kind !== 'rented') return null;
  if (typeof biz.premises.leaseMonthsLeft === 'number' && biz.premises.leaseMonthsLeft > 0) {
    biz.premises.leaseMonthsLeft -= 1;
  }
  return biz.premises.leaseMonthsLeft;
}

/* Which business (if any) uses an owned property as its premises.
   Read by the property card in views.js: "Used by {business name}". */
export function businessUsingProperty(S, propId) {
  if (!propId) return null;
  return businessesOf(S).find((b) => b && b.premises && b.premises.unitId === `prop:${propId}`) || null;
}

/* --------------------------------------------------------------------------
   Commercial catalogue — small per-country rent table.

   WHY THESE NUMBERS: the base rents are 2026 USD for a modest
   neighbourhood unit in an average US town — a market stall ($120/mo),
   a small shop ($300/mo), a small office ($450/mo), a workshop /
   warehouse ($650/mo). They are NOT prime high-street rents: a small
   shop in the $150-400/mo band is a side-street unit, not a mall unit.
   The country multiplier is the relative commercial-rent level against
   that US average (London / Singapore / Zurich / Tokyo high; Cairo /
   Mumbai / Istanbul / Sao Paulo low; Gulf mid-high). The local rent is
   then convertCurrency(usd x multiplier, 'usa' -> country, year), so
   the game prices it in the player's own currency and era, the same
   way it prices startup capital. A small Cairo shop lands near
   7,000-8,000 EGP/mo; a small London shop near $950/mo — both
   plausible for a modest unit in 2026.
   Value (for repair cost) is the unit's capital value on the same
   basis: roughly 15-20 years of rent for a shop/office, less for a
   stall.
   -------------------------------------------------------------------------- */

export const COMMERCIAL_PREMISES_TYPES = [
  {
    id: 'comm_stall', kind: 'stall', label: 'Market Stall',
    areaM2: 6, rentUsd2026: 120, valueUsd2026: 9000,
    desc: 'A pitch in the local market — cheap, busy, and weather-dependent.',
  },
  {
    id: 'comm_shop', kind: 'shop', label: 'Small Shop',
    areaM2: 45, rentUsd2026: 300, valueUsd2026: 65000,
    desc: 'A street-level shop with a window and passing trade.',
  },
  {
    id: 'comm_office', kind: 'office', label: 'Small Office',
    areaM2: 60, rentUsd2026: 450, valueUsd2026: 130000,
    desc: 'A plain office floor — desks, a door, and a sign outside.',
  },
  {
    id: 'comm_workshop', kind: 'workshop', label: 'Workshop / Warehouse',
    areaM2: 180, rentUsd2026: 650, valueUsd2026: 160000,
    desc: 'Space for machines, stock and deliveries, out of the centre.',
  },
];

/* Relative commercial-rent level vs the US average (= 1.0), 2026.
   Countries not listed here default to 1.0. */
export const COMMERCIAL_RENT_MULTIPLIER = {
  egy: 0.55, sau: 1.1, uae: 1.5, gbr: 3.2, usa: 1.0, deu: 1.6,
  can: 1.2, aus: 1.3, nld: 1.8, fra: 1.9, jpn: 2.0, ita: 1.2,
  sgp: 2.4, bra: 0.6, ind: 0.5, che: 2.8, swe: 1.7, tur: 0.6,
};

function rentMultFor(countryId) {
  return Number(COMMERCIAL_RENT_MULTIPLIER[countryId] ?? 1.0);
}

function localiseUsd(S, usd2026, countryId) {
  return Math.max(1, Math.round(convertCurrency(usd2026 * rentMultFor(countryId), 'usa', countryId, S.year)));
}

/* Every premises a business in this country could take: the 4 rented
   commercial units (with the rent that WILL be charged, in local money)
   plus each owned property in this country (no rent — the player
   already owns it — condition taken from the property record).
   Every unit carries the city it is in (cityId, or the player's city
   when none is given): a branch only ever offers units in its own
   city, and rentBusinessPremises refuses a unit from another city. */
export function listCommercialPremises(S, cityId) {
  const countryId = S.country;
  const city = cityId || S.city;
  const units = COMMERCIAL_PREMISES_TYPES.map((t) => ({
    unitId: t.id,
    kind: 'rented',
    typeKind: t.kind,
    city,
    label: t.label,
    areaM2: t.areaM2,
    monthlyRentLocal: localiseUsd(S, t.rentUsd2026, countryId),
    valueLocal: localiseUsd(S, t.valueUsd2026, countryId),
    conditionPct: 90,
    desc: t.desc,
  }));
  for (const pr of (S.housing.properties || [])) {
    if (pr.country !== countryId) continue;
    /* An owned property houses a business only in its own city. */
    if (cityId && pr.city && pr.city !== cityId) continue;
    units.push({
      unitId: `prop:${pr.id}`,
      kind: 'owned',
      typeKind: 'property',
      city: pr.city || S.city,
      label: `${pr.name} (owned)`,
      areaM2: pr.areaM2 || null,
      monthlyRentLocal: 0,
      valueLocal: Number(pr.valueLocal || 0),
      conditionPct: Number(pr.conditionPct ?? 100),
      desc: 'A property you already own — no rent, and its condition is the shop’s condition.',
      propId: pr.id,
    });
  }
  return units;
}

/* --------------------------------------------------------------------------
   Actions — each returns { ok, msg } like every other game action.
   -------------------------------------------------------------------------- */

/* Rent a commercial unit (or move the business into an owned property).
   The first month's rent is charged now, in full, through the ledger —
   that is the same figure the P&L will charge every month after, because
   both read premises.monthlyRentLocal. A switch ends the old lease with
   no refund; the player is told that before it happens (the message
   names the rent). */
export function rentBusinessPremises(S, biz, unitId) {
  ensureExtendedState(S);
  if (!biz) return { ok: false, msg: 'No business to house.' };
  /* Units are resolved in the BUSINESS's city, never the player's:
     a branch in Alexandria rents Alexandrian units, and a unit from
     another city is refused in plain words. */
  const unit = listCommercialPremises(S, biz.city).find((u) => u.unitId === unitId);
  if (!unit) return { ok: false, msg: 'That unit is not available here.' };
  if (unit.city && biz.city && unit.city !== biz.city) {
    return { ok: false, msg: `That unit is in ${unit.city} — ${biz.name} trades in ${biz.city}. A business rents premises in its own city.` };
  }
  if (unit.kind === 'owned') {
    const prop = (S.housing.properties || []).find((p) => p.id === unit.propId);
    if (!prop) return { ok: false, msg: 'You no longer own that property.' };
    if (prop.country !== biz.country) {
      return { ok: false, msg: `${biz.name} trades in ${getCountry(biz.country).name} — this property is in ${getCountry(prop.country).name}.` };
    }
  }
  if (unit.kind === 'rented' && S.money.cash < unit.monthlyRentLocal) {
    return { ok: false, msg: `The first month's rent is ${formatMoney(unit.monthlyRentLocal, S.country)} — you have ${formatMoney(S.money.cash, S.country)}.` };
  }
  const oldLabel = biz.premises ? biz.premises.label : null;
  if (unit.kind === 'rented') {
    walletMove(S, -unit.monthlyRentLocal, `First month's rent — ${unit.label} for ${biz.name}`, 'business');
  }
  biz.premises = {
    kind: unit.kind,
    unitId: unit.unitId,
    label: unit.label,
    monthlyRentLocal: unit.monthlyRentLocal,
    conditionPct: unit.conditionPct,
    valueLocal: unit.valueLocal,
    rentedYear: S.year,
    rentedMonth: S.month,
    lastDecayYear: S.year,
    leaseMonthsLeft: unit.kind === 'rented' ? 12 : null,
    lastReviewYear: null,
    lastReviewMonth: null,
    pendingReview: null,
  };
  recordJournal(S, oldLabel
    ? `${biz.name} moved out of ${oldLabel} and into ${unit.label}${unit.kind === 'rented' ? ` at ${formatMoney(unit.monthlyRentLocal, S.country)} a month` : ' (a property you own, so no rent)'}.`
    : `${biz.name} set up in ${unit.label}${unit.kind === 'rented' ? ` at ${formatMoney(unit.monthlyRentLocal, S.country)} a month` : ' (a property you own, so no rent)'}.`, 'business');
  return {
    ok: true,
    msg: unit.kind === 'rented'
      ? `${biz.name} is now in ${unit.label} — ${formatMoney(unit.monthlyRentLocal, S.country)} a month, charged every month from the P&L.`
      : `${biz.name} now trades from ${unit.label} — no rent, you own it.`,
  };
}

/* Run the business from home. No rent, revenue x0.8, level capped at 2.
   If the business was already bigger than a home operation, it is cut
   back to level 2 and the player is told — a kitchen table cannot hold
   a level-4 operation. */
export function setBusinessHomePremises(S, biz) {
  ensureExtendedState(S);
  if (!biz) return { ok: false, msg: 'No business to house.' };
  const wasLevel = Number(biz.level || 1);
  biz.premises = {
    kind: 'home',
    unitId: 'home',
    label: 'Run from home',
    monthlyRentLocal: 0,
    conditionPct: 100,
    valueLocal: 0,
    rentedYear: null,
    rentedMonth: null,
    lastDecayYear: S.year,
    leaseMonthsLeft: null,
    lastReviewYear: null,
    lastReviewMonth: null,
    pendingReview: null,
  };
  let cutNote = '';
  if (wasLevel > businessLevelCap(biz)) {
    biz.level = businessLevelCap(biz);
    cutNote = ` It was level ${wasLevel} — a home business caps at level ${businessLevelCap(biz)}, so it is cut back to a small operation.`;
  }
  recordJournal(S, `${biz.name} now runs from home — no rent, but a home business earns less and cannot grow past level 2.${cutNote}`, 'business');
  return {
    ok: true,
    msg: `${biz.name} now runs from home: no rent, revenue x0.8, level capped at 2.${cutNote}`,
  };
}

/* Repair cost: 5% of the unit's value per 10 condition points restored,
   restoring fully to 100. The amount is stated before the player pays;
   a home business has nothing to repair. */
export function repairCostLocal(S, biz) {
  if (!biz || !biz.premises || biz.premises.kind === 'home') return 0;
  const cond = Number(biz.premises.conditionPct ?? 100);
  if (cond >= 95) return 0;
  const steps = Math.ceil((100 - cond) / 10);
  const value = Number(biz.premises.valueLocal || 0);
  return Math.max(1, Math.round(value * 0.05 * steps));
}

export function repairBusinessPremises(S, biz) {
  ensureExtendedState(S);
  if (!biz) return { ok: false, msg: 'No business to repair.' };
  if (!biz.premises) return { ok: false, msg: `${biz.name} has no premises to repair — rent a unit or run it from home first.` };
  if (biz.premises.kind === 'home') return { ok: false, msg: 'A home business has no commercial premises to repair.' };
  const cond = Number(biz.premises.conditionPct ?? 100);
  if (cond >= 95) return { ok: false, msg: `${biz.premises.label} is already in good shape (${Math.round(cond)}%).` };
  const cost = repairCostLocal(S, biz);
  const charge = Math.round(convertCurrency(cost,biz.figuresCurrency||biz.country||S.country,S.country,S.year));
  if (S.money.cash < charge) {
    return { ok: false, msg: `Repairing ${biz.premises.label} from ${Math.round(cond)}% to 100% costs ${formatMoney(cost, biz.figuresCurrency||biz.country||S.country)} — you have ${formatMoney(S.money.cash, S.country)}.` };
  }
  walletMove(S, -charge, `Repairs at ${biz.premises.label} for ${biz.name}`, 'business');
  biz.premises.conditionPct = 100;
  /* An owned property's own condition is the same condition — fixing
     the shop fixes the property record too. */
  if (biz.premises.kind === 'owned' && biz.premises.unitId) {
    const propId = biz.premises.unitId.replace(/^prop:/, '');
    const prop = (S.housing.properties || []).find((p) => p.id === propId);
    if (prop) prop.conditionPct = Math.max(Number(prop.conditionPct ?? 0), 100);
  }
  recordJournal(S, `You paid ${formatMoney(cost, biz.figuresCurrency||biz.country||S.country)} to repair ${biz.premises.label} for ${biz.name} — condition back to 100%.`, 'business');
  return { ok: true, msg: `${biz.premises.label} repaired to 100% for ${formatMoney(cost, biz.figuresCurrency||biz.country||S.country)}.` };
}

/* --------------------------------------------------------------------------
   Rent review / renewal — the Verdant hold-the-line.

   A rented lease runs 12 months. After 12 months the landlord may
   review the rent: reviewBusinessRent PROPOSES a new rent (usually up:
   -5% to +20%) and stores it as pendingReview — nothing is charged yet.
   The player is shown the new rent BEFORE accepting, on the card and in
   the message. acceptBusinessRentReview writes the new rent into
   premises.monthlyRentLocal — the same field the P&L reads — so the
   rent charged from next month IS the rent shown. Declining keeps the
   old rent for 3 more months, then the lease ends.
   -------------------------------------------------------------------------- */

export function rentReviewDue(S, biz) {
  if (!biz || !biz.premises || biz.premises.kind !== 'rented') return false;
  if (biz.premises.pendingReview) return false;
  const sinceYear = biz.premises.lastReviewYear ?? biz.premises.rentedYear;
  const sinceMonth = biz.premises.lastReviewMonth ?? biz.premises.rentedMonth;
  if (sinceYear === null || sinceYear === undefined) return false;
  const elapsed = (S.year - sinceYear) * 12 + (S.month - (sinceMonth || 1));
  return elapsed >= 12;
}

export function reviewBusinessRent(S, biz) {
  ensureExtendedState(S);
  if (!biz) return { ok: false, msg: 'No business to review.' };
  if (!biz.premises || biz.premises.kind !== 'rented') {
    return { ok: false, msg: `${biz.name} has no rented lease to review.` };
  }
  if (biz.premises.pendingReview) {
    const p = biz.premises.pendingReview;
    return { ok: true, msg: `The landlord already proposed ${formatMoney(p.newRentLocal, biz.figuresCurrency||biz.country||S.country)} a month (was ${formatMoney(biz.premises.monthlyRentLocal, biz.figuresCurrency||biz.country||S.country)}). Accept it on the business card, or decline it.` };
  }
  if (!rentReviewDue(S, biz)) {
    return { ok: false, msg: `The lease on ${biz.premises.label} is not up for review yet — it renews yearly.` };
  }
  const oldRent = Number(biz.premises.monthlyRentLocal || 0);
  const pct = randInt(S, -5, 20);
  const newRent = Math.max(1, Math.round(oldRent * (1 + pct / 100)));
  biz.premises.pendingReview = { newRentLocal: newRent, pct, proposedYear: S.year, proposedMonth: S.month };
  recordJournal(S, `The landlord of ${biz.premises.label} proposed a new rent for ${biz.name}: ${formatMoney(newRent, biz.figuresCurrency||biz.country||S.country)} a month (was ${formatMoney(oldRent, biz.figuresCurrency||biz.country||S.country)}). You have not accepted it yet.`, 'business');
  return {
    ok: true,
    msg: `Rent review: the landlord wants ${formatMoney(newRent, biz.figuresCurrency||biz.country||S.country)} a month (was ${formatMoney(oldRent, biz.figuresCurrency||biz.country||S.country)}, ${pct >= 0 ? '+' : ''}${pct}%). Nothing changes until you accept — the old rent is still what is charged.`,
  };
}

export function acceptBusinessRentReview(S, biz) {
  ensureExtendedState(S);
  if (!biz) return { ok: false, msg: 'No business to review.' };
  if (!biz.premises || !biz.premises.pendingReview) {
    return { ok: false, msg: 'There is no rent proposal waiting.' };
  }
  const p = biz.premises.pendingReview;
  const oldRent = Number(biz.premises.monthlyRentLocal || 0);
  biz.premises.monthlyRentLocal = p.newRentLocal;
  biz.premises.rentedYear = S.year;
  biz.premises.rentedMonth = S.month;
  biz.premises.lastReviewYear = S.year;
  biz.premises.lastReviewMonth = S.month;
  biz.premises.leaseMonthsLeft = 12;
  biz.premises.pendingReview = null;
  recordJournal(S, `You accepted the new rent for ${biz.name}: ${formatMoney(p.newRentLocal, biz.figuresCurrency||biz.country||S.country)} a month (was ${formatMoney(oldRent, biz.figuresCurrency||biz.country||S.country)}). That is the rent the business will be charged from next month.`, 'business');
  return {
    ok: true,
    msg: `Accepted: rent is now ${formatMoney(p.newRentLocal, biz.figuresCurrency||biz.country||S.country)} a month — that is the rent charged from next month, not the old ${formatMoney(oldRent, biz.figuresCurrency||biz.country||S.country)}.`,
  };
}

export function declineBusinessRentReview(S, biz) {
  ensureExtendedState(S);
  if (!biz) return { ok: false, msg: 'No business to review.' };
  if (!biz.premises || !biz.premises.pendingReview) {
    return { ok: false, msg: 'There is no rent proposal waiting.' };
  }
  biz.premises.pendingReview = null;
  biz.premises.leaseMonthsLeft = 3;
  recordJournal(S, `You turned down the landlord's new rent for ${biz.name}. The old rent stands for 3 more months — then you must move out or agree a new rent.`, 'business');
  return { ok: true, msg: 'Declined. The old rent stands for 3 more months — then you must move out or agree a new rent.' };
}

/* --------------------------------------------------------------------------
   Render — the premises section of a business card. Returns an HTML
   string. The coordinator wires it into the Ventures card (Worker 1
   owns that render); the rent shown here is premises.monthlyRentLocal,
   the same field the P&L charges, so the card can never promise a rent
   the ledger does not charge.
   -------------------------------------------------------------------------- */

function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderBusinessPremisesSection(S, biz) {
  if (!biz) return '';
  const p = biz.premises || null;
  const factor = premisesRevenueFactor(biz);
  /* v2.20 I4 — the level cap is stated ONCE per card, in the card
     pill (views.js, from businessLevelCap). This section never
     restates it: no "Level cap" pill here, and the run-from-home line
     no longer repeats "Level capped at 2". */
  const units = listCommercialPremises(S, biz.city);
  const repairCost = p ? repairCostLocal(S, biz) : 0;
  const due = p ? rentReviewDue(S, biz) : false;
  const pending = p && p.pendingReview ? p.pendingReview : null;

  const current = !p ? `<span class="muted">No premises yet — the business trades without a base. Rent a unit below, use a property you own, or run it from home.</span>`
    : p.kind === 'home'
      ? `<span><strong>Run from home</strong> · No rent · Revenue x0.8</span>`
      : `<span><strong>${esc(p.label)}</strong> · ${p.kind === 'rented' ? `Rent: <strong class="mono">${esc(formatMoney(p.monthlyRentLocal, biz.figuresCurrency||biz.country||S.country))}/mo</strong>` : 'Owned — no rent'} · Condition: <strong class="${(p.conditionPct ?? 100) < 60 ? 'text-bad' : 'text-good'}">${Math.round(p.conditionPct ?? 100)}%</strong>${factor < 1 ? ` · Run-down premises: revenue x${factor}` : ''}${p.kind === 'rented' && typeof p.leaseMonthsLeft === 'number' ? ` · Lease: ${p.leaseMonthsLeft} month${p.leaseMonthsLeft === 1 ? '' : 's'} left` : ''}</span>`;

  return `
    <div class="card" style="margin-top:8px">
      <div class="section-head"><h4>Premises — ${esc(biz.name)}</h4></div>
      <div class="item-row"><div class="item-row-main">${current}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${p && p.kind !== 'home' && repairCost > 0 ? `<button class="btn btn-sm" data-action="biz-premises-repair" data-biz="${esc(biz.id)}">Repair (${esc(formatMoney(repairCost, biz.figuresCurrency||biz.country||S.country))})</button>` : ''}
          ${p && p.kind === 'rented' && pending ? `
            <button class="btn btn-primary btn-sm" data-action="biz-premises-review-accept" data-biz="${esc(biz.id)}">Accept new rent ${esc(formatMoney(pending.newRentLocal, biz.figuresCurrency||biz.country||S.country))}/mo</button>
            <button class="btn btn-sm" data-action="biz-premises-review-decline" data-biz="${esc(biz.id)}">Decline</button>` : ''}
          ${p && p.kind === 'rented' && !pending && due ? `<button class="btn btn-sm" data-action="biz-premises-review" data-biz="${esc(biz.id)}">Rent review (lease year up)</button>` : ''}
          ${!p || p.kind !== 'home' ? `<button class="btn btn-sm" data-action="biz-premises-home" data-biz="${esc(biz.id)}">Run from home (no rent, x0.8 revenue)</button>` : ''}
        </div>
      </div>
      ${pending ? `<p class="muted" style="font-size:0.85rem">Landlord's proposal: <strong class="mono">${esc(formatMoney(pending.newRentLocal, biz.figuresCurrency||biz.country||S.country))}/mo</strong> (was ${esc(formatMoney(p.monthlyRentLocal, biz.figuresCurrency||biz.country||S.country))}/mo, ${pending.pct >= 0 ? '+' : ''}${pending.pct}%). Nothing changes until you accept — the old rent is still charged.</p>` : ''}
      <div style="margin-top:6px">
        <strong style="font-size:0.82rem">Rent a unit in ${esc(biz.city || S.city)}:</strong>
        ${units.map((u) => `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(u.label)}</strong>
              <span>${u.areaM2 ? `${u.areaM2} m² · ` : ''}${u.kind === 'rented' ? `Rent: <strong class="mono">${esc(formatMoney(u.monthlyRentLocal, S.country))}/mo</strong>` : 'No rent — you own it'} · Condition ${Math.round(u.conditionPct)}%${u.desc ? ` · ${esc(u.desc)}` : ''}</span>
            </div>
            <button class="btn btn-sm ${(p && p.unitId === u.unitId) ? 'btn-navy' : ''}" data-action="biz-premises-rent" data-biz="${esc(biz.id)}" data-unit="${esc(u.unitId)}" ${(p && p.unitId === u.unitId) ? 'disabled' : ''}>${(p && p.unitId === u.unitId) ? '✓ In use' : (u.kind === 'rented' ? 'Rent this unit' : 'Use this property')}</button>
          </div>`).join('')}
      </div>
    </div>
  `;
}
