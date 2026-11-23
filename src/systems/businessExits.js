/* ============================================================================
   World Life 2.0 — Business Exits & Cash (v2.14 W5: §6 exits + §7 cash)
   Trade sale / management buyout / IPO / franchise, and the retained-cash
   decision (withdraw vs reinvest). Selling and closing stay exactly as
   they are — this file NEVER re-implements sellBusiness/closeBusiness;
   it only adds exits on top of them.

   RETAINED CASH — READ THIS FIRST (§7, the double-count trap):
   The v2.11 monthly P&L ALREADY lands in the household ledger, net of
   tax (economyEngine settleHouseholdMonth: revenue in, costs out, tax
   out, every month). biz.retainedCash is a SEPARATE pool that starts at
   0 and grows ONLY from money the player explicitly moves INTO the
   business (reinvestBusinessCash) or from franchise upfront fees held
   in the business — NEVER from the monthly P&L. Withdrawing moves
   retained cash to personal cash with tax under the country's own
   brackets (computeBusinessTax, imported — never re-derived). Every
   message below states plainly that this is retained cash, NOT the
   monthly P&L (which already landed). Old-save businesses without
   retainedCash are treated as 0, never crash.

   WIRING NOTE FOR THE COORDINATOR (this file cannot edit businessEngine):
   - franchiseIncome(S, biz) is the monthly franchise royalty. Wire it
     into computeBusinessMonth as extra revenue (a real P&L line) — the
     money then lands through the settlement like all other revenue.
   - reinvestBoost(S, biz) returns the multiplier the next month's P&L
     should apply to revenue (1 when nothing was reinvested). Wire it
     into computeBusinessMonth, then call consumeReinvestBoost(S, biz)
     so the boost applies to ONE month only.
   - Until wired, both are pure functions the verify script measures
     directly (see tests/v214-w5-verify.mjs).
   ========================================================================== */

import { rand, clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove, recordLedgerEntry, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { businessValuation, computeBusinessTax, normalizeBusiness, resolveBusiness, syncBusinessMirror, monthsInBusiness, consecutiveProfitableMonths } from './businessEngine.js';

/* ------------------------------------------------------------------ *
   Thresholds — stated on screen (renderExitsHtml) and in every refusal.
   ------------------------------------------------------------------ */
export const IPO_MIN_ANNUAL_REVENUE_LOCAL = 5000000; /* local currency */
export const IPO_MIN_YEARS = 5;
export const IPO_FLOAT_PCT = 25;          /* % of the business sold at IPO */
export const IPO_COST_RATE = 0.05;        /* underwriting + legal, % of valuation */
export const IPO_SUCCESS_BASE = 0.55;     /* base chance, moved by repeat rate/profit */
export const FRANCHISE_MIN_LEVEL = 3;
export const FRANCHISE_MIN_MONTHS = 12;        /* months trading */
export const FRANCHISE_MIN_PROFITABLE_MONTHS = 6; /* profitable months in a row */
export const FRANCHISE_MIN_REPEAT_RATE = 0.60; /* share of customers who come back */
export const FRANCHISE_MAX = 3;           /* franchisees per business */
export const FRANCHISE_ROYALTY_RATE = 0.05; /* 5% of monthly revenue per franchisee */
export const MBO_DISCOUNT = 0.85;         /* manager pays 85% of valuation */
export const MBO_LOAN_ANNUAL_RATE = 0.07;
export const MBO_LOAN_MONTHS = 60;
export const MBO_LOAN_MAX_MULT = 60;      /* bank lends up to 60x monthly wage */
export const FRANCHISE_BAD_REPEAT_COST = 0.06;      /* repeat rate lost at once when a franchisee goes bad */
export const FRANCHISE_REVOKE_REPEAT_RECOVERY = 0.03; /* repeat rate won back at once when revoked */

const TRADE_BUYERS = [
  'Al Mansour Holdings', 'Orascom Development', 'EFG Hermes Ventures',
  'Sawiris Family Office', 'Cairo Capital Partners', 'Nile Growth Fund',
  'Alexandria Trading Group', 'Delta Investment Company', 'Gulf Meridian Capital',
  'Heliopolis Business Group'
];
const FRANCHISEE_NAMES = [
  'Karim Haddad', 'Mona El Sherif', 'Omar Fathy', 'Layla Nasser',
  'Hassan Mahmoud', 'Sara Abdel Aziz', 'Tarek Ibrahim', 'Nadia Kamal'
];

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function money(S, v) { return formatMoney(Math.round(v || 0), S.country); }
function yearsInBusiness(S, biz) {
  const start = (Number(biz.foundedYear) || S.year) * 12 + (Number(biz.foundedMonth) || S.month);
  const now = S.year * 12 + S.month;
  return Math.max(0, (now - start) / 12);
}
function annualRevenue(biz) { return Math.round((Number(biz.monthlyRev) || 0) * 12); }

/* Defensive migration for old-save businesses: retainedCash starts at 0,
   never crashes, never invents money. */
export function ensureExitState(S, biz) {
  if (!biz || typeof biz !== 'object') return null;
  normalizeBusiness(S, biz);
  if (typeof biz.retainedCash !== 'number' || Number.isNaN(biz.retainedCash)) biz.retainedCash = 0;
  if (typeof biz.reinvestBoost !== 'number' || biz.reinvestBoost < 1) biz.reinvestBoost = 1;
  if (!Array.isArray(biz.franchisees)) biz.franchisees = [];
  if (typeof biz.publicFloat !== 'number') biz.publicFloat = 0;
  if (!Array.isArray(S.career.formerBusinesses)) S.career.formerBusinesses = [];
  return biz;
}

function removeFromPortfolio(S, biz) {
  S.career.businesses = (S.career.businesses || []).filter(b => b && b.id !== biz.id);
  syncBusinessMirror(S);
}
function recordExit(S, biz, exitKind, extra) {
  const rec = {
    id: biz.id, name: biz.name, typeId: biz.typeId, exit: exitKind,
    year: S.year, month: S.month, staffTransferred: (biz.staff || []).length,
    staff: (biz.staff || []).map(m => ({ ...m })), ...extra
  };
  biz.boughtBy = extra?.boughtBy || null;
  S.career.formerBusinesses.push(rec);
  return rec;
}

/* ============================================================================
   §6 — TRADE SALE
   ========================================================================== */
export function tradeSaleOffer(S, bizRef, opts = {}) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const valuation = businessValuation(biz);
  const repeatRate = Number(biz.repeatRate ?? 0.5);
  const profitable = biz.lastPL ? biz.lastPL.net > 0 : (biz.monthlyRev > biz.monthlyCost);
  const trend = biz.history && biz.history.length >= 2
    ? biz.history[biz.history.length - 1].net - biz.history[0].net : 0;
  let factor = 1;
  const reasons = [];
  if (repeatRate >= 0.75) { factor += 0.08; reasons.push(`customers keep coming back (${Math.round(repeatRate * 100)}% repeat customers) — buyers pay up for a business customers return to`); }
  else if (repeatRate < 0.5) { factor -= 0.10; reasons.push(`customers rarely come back (${Math.round(repeatRate * 100)}% repeat customers) — buyers discount a business customers do not return to`); }
  else { reasons.push(`a middling repeat-customer rate (${Math.round(repeatRate * 100)}%)`); }
  if (profitable) { factor += 0.05; reasons.push('it is profitable right now'); }
  else { factor -= 0.10; reasons.push('it is losing money right now — buyers pay less for a business that bleeds'); }
  if (trend > 0) { factor += 0.03; reasons.push('profits have been rising'); }
  else if (trend < 0) { factor -= 0.05; reasons.push('profits have been falling'); }
  const marketSwing = (rand(S) - 0.5) * 0.16;
  factor += marketSwing;
  if (marketSwing >= 0.04) reasons.push('the market for small businesses is hot this year');
  else if (marketSwing <= -0.04) reasons.push('the market for small businesses is cold this year');
  factor = clamp(factor, 0.7, 1.25);
  const buyer = opts.buyer || TRADE_BUYERS[Math.floor(rand(S) * TRADE_BUYERS.length)];
  const offer = Math.max(1, Math.round(valuation * factor));
  const above = offer >= valuation;
  const offerRec = {
    kind: 'trade', buyer, offer, valuation, factor: Number(factor.toFixed(3)),
    above, counter: null, negotiated: false,
    reason: `${buyer} offers ${money(S, offer)} — ${above ? 'above' : 'below'} the ${money(S, valuation)} valuation, because ${reasons.join(', ')}.`
  };
  biz.exitOffer = offerRec;
  return {
    ok: true, ...offerRec,
    msg: `${offerRec.reason} You can take it, negotiate once, or walk away and keep the business.`
  };
}

/* ONE round of negotiation. The counter can be higher or lower than the
   offer; walking away keeps the business. A second round is refused. */
export function negotiateTradeSale(S, bizRef, opts = {}) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  if (!biz.exitOffer || biz.exitOffer.kind !== 'trade') tradeSaleOffer(S, biz, opts);
  const offerRec = biz.exitOffer;
  if (offerRec.negotiated) {
    return { ok: false, msg: `${offerRec.buyer} already countered once — that was the one round of negotiation. Take the counter, take the original offer, or walk away and keep ${biz.name}.`, ...offerRec };
  }
  let counter = Math.round(offerRec.offer * (1 + (rand(S) - 0.5) * 0.24));
  counter = clamp(counter, Math.round(offerRec.offer * 0.85), Math.round(offerRec.offer * 1.15));
  if (counter === offerRec.offer) counter = Math.round(offerRec.offer * 1.01);
  offerRec.counter = counter;
  offerRec.negotiated = true;
  const better = counter > offerRec.offer;
  return {
    ok: true, ...offerRec,
    msg: `${offerRec.buyer} counters at ${money(S, counter)} — ${better ? 'higher' : 'lower'} than their ${money(S, offerRec.offer)} offer. Accept the counter, or walk away and keep ${biz.name}.`
  };
}

/* Accept the trade sale: the business leaves the portfolio, the money
   lands with a ledger line, staff are TRANSFERRED to the buyer — they
   keep their jobs under the new owner (morale +5, relief, recorded). */
export function acceptTradeSale(S, bizRef, offerArg) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const stored = biz.exitOffer && biz.exitOffer.kind === 'trade' ? biz.exitOffer : null;
  let amount = null;
  let buyer = stored?.buyer || 'A buyer';
  if (typeof offerArg === 'number') amount = Math.round(offerArg);
  else if (offerArg && typeof offerArg === 'object') {
    amount = Math.round(offerArg.counter ?? offerArg.offer ?? offerArg.amount ?? 0);
    buyer = offerArg.buyer || buyer;
  }
  if (!amount || amount <= 0) {
    if (stored?.counter) amount = stored.counter;
    else if (stored?.offer) amount = stored.offer;
  }
  if (!amount || amount <= 0) {
    return { ok: false, msg: `No offer on the table for ${biz.name} — get a trade-sale offer first, then accept it.` };
  }
  const staffCount = (biz.staff || []).length;
  for (const m of (biz.staff || [])) m.morale = clamp((Number(m.morale) || 0) + 5, 0, 100);
  const valuation = businessValuation(biz);
  removeFromPortfolio(S, biz);
  walletMove(S, amount, `Trade sale — ${biz.name} sold to ${buyer}`, 'business');
  recordExit(S, biz, 'trade_sale', { buyer, amount, valuation, boughtBy: { type: 'trade', name: buyer } });
  recordJournal(S, `Sold ${biz.name} to ${buyer} for ${money(S, amount)} (valuation ${money(S, valuation)}). All ${staffCount} employee${staffCount === 1 ? '' : 's'} kept their jobs under the new owner — morale up 5, they were relieved not to be let go.`, 'milestone');
  return {
    ok: true, amount, buyer, valuation, staffTransferred: staffCount,
    msg: `Sold ${biz.name} to ${buyer} for ${money(S, amount)}. Your ${staffCount} employee${staffCount === 1 ? '' : 's'} keep their jobs under the new owner.`
  };
}

/* ============================================================================
   §6 — MANAGEMENT BUYOUT
   The manager buys the business at 85% of valuation — cheaper than a
   trade sale. The manager's savings are modelled honestly: 35% of their
   wage saved for each year they have managed the business. A bank will
   lend up to 60 months of their wage at 7% over 5 years. If even
   savings + loan cannot cover the price, refuse plainly with the
   shortfall named. The manager STAYS in the game as an owner: the
   record is kept (biz.boughtBy + formerBusinesses) and their Person
   record, if one exists, is marked as a business owner.
   ========================================================================== */
export function managerAffordability(S, biz, price) {
  const mgr = biz.manager;
  if (!mgr) return { canAfford: false, reason: 'no-manager' };
  const wage = Math.max(1, Number(mgr.wage) || 0);
  const yearsManaged = Math.max(0, (S.year - (Number(mgr.hiredYear) || S.year)) + ((S.month - (Number(mgr.hiredMonth) || S.month)) / 12));
  const savings = Math.round(wage * 12 * yearsManaged * 0.35);
  const maxLoan = Math.round(wage * MBO_LOAN_MAX_MULT);
  const affordable = savings + maxLoan;
  return { canAfford: price <= affordable, savings, maxLoan, affordable, yearsManaged, wage };
}

export function managementBuyout(S, bizRef, opts = {}) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const mgr = biz.manager;
  if (!mgr || !mgr.name) {
    return { ok: false, msg: `${biz.name} has no manager — a management buyout needs a manager to buy it. Hire a manager first.` };
  }
  const valuation = businessValuation(biz);
  const price = Math.round(valuation * MBO_DISCOUNT);
  const aff = managerAffordability(S, biz, price);
  if (!aff.canAfford) {
    const shortfall = price - aff.affordable;
    return {
      ok: false, price, valuation, savings: aff.savings, maxLoan: aff.maxLoan, shortfall,
      msg: `${mgr.name} cannot afford ${biz.name}: the buyout price is ${money(S, price)} (85% of the ${money(S, valuation)} valuation), but ${mgr.name} has only ${money(S, aff.savings)} saved after ${aff.yearsManaged.toFixed(1)} years managing it and the bank will lend at most ${money(S, aff.maxLoan)} — short by ${money(S, shortfall)}.`
    };
  }
  let loan = null;
  let method;
  if (price <= aff.savings) {
    method = 'outright';
  } else {
    const loanAmount = price - aff.savings;
    const r = MBO_LOAN_ANNUAL_RATE / 12;
    const monthlyPayment = Math.round(loanAmount * r / (1 - Math.pow(1 + r, -MBO_LOAN_MONTHS)));
    loan = { amount: loanAmount, annualRate: MBO_LOAN_ANNUAL_RATE, months: MBO_LOAN_MONTHS, monthlyPayment, lender: 'Business buyout loan' };
    method = 'loan';
  }
  const staffCount = (biz.staff || []).length;
  for (const m of (biz.staff || [])) m.morale = clamp((Number(m.morale) || 0) + 3, 0, 100);
  removeFromPortfolio(S, biz);
  walletMove(S, price, `Management buyout — ${mgr.name} bought ${biz.name}`, 'business');
  const boughtBy = { type: 'mbo', name: mgr.name, personId: mgr.personId || null, price, method, loan };
  recordExit(S, biz, 'management_buyout', { buyer: mgr.name, amount: price, valuation, boughtBy });
  /* The manager stays in the game as an owner: their Person record, if
     one exists, now says so — the player can still see them in People. */
  if (mgr.personId && S.people && S.people[mgr.personId]) {
    const p = S.people[mgr.personId];
    p.businessOwner = true;
    p.ownsBusiness = biz.name;
    p.businessOwnerSince = S.year;
  }
  const termsText = method === 'outright'
    ? `${mgr.name} paid ${money(S, price)} outright from ${money(S, aff.savings)} of savings`
    : `${mgr.name} paid ${money(S, price)} with ${money(S, aff.savings)} of savings plus a ${money(S, loan.amount)} bank loan at ${(MBO_LOAN_ANNUAL_RATE * 100).toFixed(0)}% over ${MBO_LOAN_MONTHS} months (${money(S, loan.monthlyPayment)}/month)`;
  recordJournal(S, `${mgr.name} bought ${biz.name} from you for ${money(S, price)} — 85% of the ${money(S, valuation)} valuation, cheaper than a trade sale. ${termsText}. ${mgr.name} now owns the business outright and stays in your world as its owner; the ${staffCount} employee${staffCount === 1 ? '' : 's'} keep their jobs under them.`, 'milestone');
  return {
    ok: true, price, valuation, method, loan, savingsUsed: Math.min(aff.savings, price),
    manager: mgr.name, personId: mgr.personId || null, staffTransferred: staffCount,
    msg: `${mgr.name} bought ${biz.name} for ${money(S, price)} (85% of valuation, cheaper than a trade sale). ${termsText}. ${mgr.name} stays in the game as the new owner.`
  };
}

/* ============================================================================
   §6 — IPO
   Threshold (stated on screen and in every refusal): annual revenue of
   at least 5,000,000 in local currency AND at least 5 years in business.
   Cost: 5% of valuation (underwriting + legal), charged in two stages —
   half at filing, half on a successful listing. It CAN FAIL: the chance
   is 55% at a 50% repeat rate, +0.4% per repeat-rate point above 50%,
   +5% if the last month was profitable, clamped 30–90%. A failed IPO
   costs only the money spent — the listing is pulled and the fees are
   gone. A successful IPO sells a 25% float: the player is paid 25% of
   the valuation and the business continues under the player with
   biz.publicFloat = 25.
   ========================================================================== */
export function ipoThreshold(S, biz) {
  const rev = annualRevenue(biz);
  const yrs = yearsInBusiness(S, biz);
  return {
    annualRevenue: rev, years: yrs,
    minAnnualRevenue: IPO_MIN_ANNUAL_REVENUE_LOCAL, minYears: IPO_MIN_YEARS,
    revenueOk: rev >= IPO_MIN_ANNUAL_REVENUE_LOCAL, yearsOk: yrs >= IPO_MIN_YEARS,
    ok: rev >= IPO_MIN_ANNUAL_REVENUE_LOCAL && yrs >= IPO_MIN_YEARS,
    text: `needs ${money(S, IPO_MIN_ANNUAL_REVENUE_LOCAL)} annual revenue and ${IPO_MIN_YEARS} years in business`
  };
}
export function ipoSuccessChance(S, biz) {
  const repeatRate = Number(biz.repeatRate ?? 0.5);
  let chance = IPO_SUCCESS_BASE + (repeatRate - 0.5) * 0.4;
  if (biz.lastPL && biz.lastPL.net > 0) chance += 0.05;
  return clamp(chance, 0.30, 0.90);
}

export function ipoBusiness(S, bizRef, opts = {}) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const th = ipoThreshold(S, biz);
  if (!th.ok) {
    const missing = [];
    if (!th.revenueOk) missing.push(`annual revenue is ${money(S, th.annualRevenue)} — needs ${money(S, IPO_MIN_ANNUAL_REVENUE_LOCAL)}`);
    if (!th.yearsOk) missing.push(`only ${th.years.toFixed(1)} years in business — needs ${IPO_MIN_YEARS}`);
    return {
      ok: false, threshold: th,
      msg: `${biz.name} is too small to list: an IPO ${th.text}. Yours: ${missing.join('; ')}. Grow the business first.`
    };
  }
  const valuation = businessValuation(biz);
  const totalCost = Math.max(1000, Math.round(valuation * IPO_COST_RATE));
  const stage1 = Math.round(totalCost / 2);
  const stage2 = totalCost - stage1;
  if ((Number(S.money.cash) || 0) < stage1) {
    return { ok: false, threshold: th, msg: `An IPO costs ${money(S, totalCost)} in underwriting and legal fees (5% of the ${money(S, valuation)} valuation), starting with ${money(S, stage1)} at filing — you do not have that in cash.` };
  }
  const chance = ipoSuccessChance(S, biz);
  walletMove(S, -stage1, `IPO filing — ${biz.name} (legal fees, stage 1 of 2)`, 'business');
  let success;
  if (opts.force === 'success') success = true;
  else if (opts.force === 'fail') success = false;
  else success = rand(S) < chance;
  if (!success) {
    biz.ipo = { stage: 'failed', year: S.year, month: S.month, costsPaid: stage1, totalCost, chance: Number(chance.toFixed(2)) };
    recordJournal(S, `The IPO of ${biz.name} FAILED — the listing was pulled after ${money(S, stage1)} in legal fees, and that money is gone. A failed listing makes the market doubt the business.`, 'money');
    return {
      ok: true, outcome: 'failed', success: false, chance: Number(chance.toFixed(2)),
      costsPaid: stage1, totalCost,
      msg: `The IPO of ${biz.name} failed (chance was ${Math.round(chance * 100)}%). The ${money(S, stage1)} spent on legal fees is gone.`
    };
  }
  walletMove(S, -stage2, `IPO underwriting — ${biz.name} (stage 2 of 2)`, 'business');
  const payout = Math.round(valuation * (IPO_FLOAT_PCT / 100));
  walletMove(S, payout, `IPO — sold ${IPO_FLOAT_PCT}% of ${biz.name} to the public`, 'business');
  biz.publicFloat = IPO_FLOAT_PCT;
  biz.ipo = { stage: 'listed', year: S.year, month: S.month, costsPaid: totalCost, totalCost, payout, chance: Number(chance.toFixed(2)) };
  recordJournal(S, `${biz.name} listed on the stock market — ${IPO_FLOAT_PCT}% sold to the public for ${money(S, payout)} (costs ${money(S, totalCost)} in underwriting and legal fees). You still run the business, now with ${IPO_FLOAT_PCT}% of it owned by public shareholders.`, 'milestone');
  return {
    ok: true, outcome: 'listed', success: true, chance: Number(chance.toFixed(2)),
    costsPaid: totalCost, totalCost, payout, publicFloat: IPO_FLOAT_PCT,
    msg: `${biz.name} is now listed — you sold ${IPO_FLOAT_PCT}% for ${money(S, payout)} (fees ${money(S, totalCost)}). You still run the business.`
  };
}

/* ============================================================================
   §6 — FRANCHISE
   Threshold (stated on screen and in every refusal): level 3+ AND
   12 months trading AND 6 profitable months in a row AND 60% repeat
   customers. Each franchisee pays an upfront fee (3x monthly
   revenue, held in the business's retained cash — NOT personal cash)
   and a monthly royalty of 5% of monthly revenue. The royalty is a real
   P&L line: franchiseIncome(S, biz) is what the coordinator wires into
   computeBusinessMonth. A bad franchisee damages the brand (repeat
   customers −6%); revoking the franchise stops the income from that
   franchisee and wins back +3% repeat customers at once, the rest
   recovering over time.
   ========================================================================== */
export function franchiseThreshold(S, biz) {
  const level = Number(biz.level) || 1;
  const months = monthsInBusiness(S, biz);
  const profitable = consecutiveProfitableMonths(biz);
  const repeatRate = Number(biz.repeatRate ?? 0.5);
  return {
    level, monthsInBusiness: months, profitableMonths: profitable, repeatRate,
    minLevel: FRANCHISE_MIN_LEVEL, minMonths: FRANCHISE_MIN_MONTHS,
    minProfitableMonths: FRANCHISE_MIN_PROFITABLE_MONTHS, minRepeatRate: FRANCHISE_MIN_REPEAT_RATE,
    levelOk: level >= FRANCHISE_MIN_LEVEL, monthsOk: months >= FRANCHISE_MIN_MONTHS,
    profitableOk: profitable >= FRANCHISE_MIN_PROFITABLE_MONTHS, repeatRateOk: repeatRate >= FRANCHISE_MIN_REPEAT_RATE,
    ok: level >= FRANCHISE_MIN_LEVEL && months >= FRANCHISE_MIN_MONTHS
      && profitable >= FRANCHISE_MIN_PROFITABLE_MONTHS && repeatRate >= FRANCHISE_MIN_REPEAT_RATE,
    text: `needs level ${FRANCHISE_MIN_LEVEL}, ${FRANCHISE_MIN_MONTHS} months trading, ${FRANCHISE_MIN_PROFITABLE_MONTHS} profitable months in a row and ${Math.round(FRANCHISE_MIN_REPEAT_RATE * 100)}% repeat customers`
  };
}
export function franchiseIncome(S, biz) {
  if (!biz) return 0;
  const list = Array.isArray(biz.franchisees) ? biz.franchisees : [];
  return list.filter(f => f.status !== 'revoked').reduce((sum, f) => sum + (Number(f.monthlyRoyalty) || 0), 0);
}

export function franchiseBusiness(S, bizRef, opts = {}) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const th = franchiseThreshold(S, biz);
  if (!th.ok) {
    const missing = [];
    if (!th.levelOk) missing.push(`level ${th.level} — needs level ${FRANCHISE_MIN_LEVEL}`);
    if (!th.monthsOk) missing.push(`only ${th.monthsInBusiness} months trading — needs ${FRANCHISE_MIN_MONTHS}`);
    if (!th.profitableOk) missing.push(`only ${th.profitableMonths} profitable months in a row — needs ${FRANCHISE_MIN_PROFITABLE_MONTHS}`);
    if (!th.repeatRateOk) missing.push(`only ${Math.round(th.repeatRate * 100)}% repeat customers — needs ${Math.round(FRANCHISE_MIN_REPEAT_RATE * 100)}%`);
    return {
      ok: false, threshold: th,
      msg: `${biz.name} is not proven enough to franchise: franchising ${th.text}. Yours: ${missing.join('; ')}.`
    };
  }
  if (biz.franchisees.length >= FRANCHISE_MAX) {
    return { ok: false, threshold: th, msg: `${biz.name} already has ${FRANCHISE_MAX} franchisees — the most the brand can support right now.` };
  }
  const fee = Math.max(10000, Math.round((Number(biz.monthlyRev) || 0) * 3));
  const monthlyRoyalty = Math.max(100, Math.round((Number(biz.monthlyRev) || 0) * FRANCHISE_ROYALTY_RATE));
  const name = opts.name || FRANCHISEE_NAMES[Math.floor(rand(S) * FRANCHISEE_NAMES.length)];
  const franchisee = {
    id: nextId(S, 'fran'), name, status: 'good',
    fee, monthlyRoyalty, sinceYear: S.year, sinceMonth: S.month
  };
  biz.franchisees.push(franchisee);
  biz.retainedCash = Math.round((biz.retainedCash || 0) + fee);
  recordLedgerEntry(S, 0, `Franchise fee — ${name} paid ${money(S, fee)} to ${biz.name}, held in retained cash (not personal cash)`, 'business', 'business');
  recordJournal(S, `${name} opened a franchise of ${biz.name} — ${money(S, fee)} franchise fee held in the business's retained cash, plus ${money(S, monthlyRoyalty)} a month in royalties (5% of monthly revenue, a real P&L line).`, 'money');
  return {
    ok: true, franchisee, fee, monthlyRoyalty, monthlyIncome: franchiseIncome(S, biz),
    retainedCash: biz.retainedCash,
    msg: `${name} franchised ${biz.name}: ${money(S, fee)} fee held in retained cash, and ${money(S, monthlyRoyalty)} a month in royalties.`
  };
}

/* A franchisee goes bad: repeat customers fall at once. Call this when
   the coordinator's monthly tick decides a franchisee has damaged the
   brand (or directly, as the verify script does). The damage stops only
   when the franchise is revoked. */
export function franchiseeGoesBad(S, bizRef, franchiseeId) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const f = (biz.franchisees || []).find(x => x.id === (franchiseeId || (biz.franchisees[0] && biz.franchisees[0].id)));
  if (!f) return { ok: false, msg: `${biz.name} has no franchisee to go bad.` };
  if (f.status === 'bad') return { ok: false, msg: `${f.name} is already damaging the brand — revoke the franchise to stop it.` };
  const repeatBefore = Number(biz.repeatRate ?? 0.5);
  f.status = 'bad';
  biz.repeatRate = clamp(repeatBefore - FRANCHISE_BAD_REPEAT_COST, 0, 1);
  recordJournal(S, `${f.name}'s franchise of ${biz.name} is damaging the brand — dirty premises, rude staff, customers complaining online. Repeat customers fell ${Math.round(repeatBefore * 100)}% → ${Math.round(biz.repeatRate * 100)}% (−${Math.round(FRANCHISE_BAD_REPEAT_COST * 100)}%). Revoke the franchise to stop the damage.`, 'money');
  return {
    ok: true, franchisee: f, repeatRateBefore: repeatBefore, repeatRateAfter: biz.repeatRate,
    msg: `${f.name} is damaging the ${biz.name} brand — repeat customers ${Math.round(repeatBefore * 100)}% → ${Math.round(biz.repeatRate * 100)}%. Revoke the franchise to stop it.`
  };
}

export function revokeFranchise(S, bizRef, franchiseeId) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const idx = (biz.franchisees || []).findIndex(x => x.id === franchiseeId);
  if (idx < 0) return { ok: false, msg: 'That franchisee is not franchising this business.' };
  const f = biz.franchisees[idx];
  const repeatBefore = Number(biz.repeatRate ?? 0.5);
  const incomeBefore = franchiseIncome(S, biz);
  f.status = 'revoked';
  biz.franchisees.splice(idx, 1);
  biz.repeatRate = clamp(repeatBefore + FRANCHISE_REVOKE_REPEAT_RECOVERY, 0, 1);
  biz.brandRecoveryNote = `Franchise revoked ${S.month}/${S.year} — repeat customers recovering over the following months.`;
  const incomeAfter = franchiseIncome(S, biz);
  recordJournal(S, `Revoked ${f.name}'s franchise of ${biz.name}. The ${money(S, f.monthlyRoyalty)} a month in royalties from them stops, and repeat customers recover ${Math.round(repeatBefore * 100)}% → ${Math.round(biz.repeatRate * 100)}% (+${Math.round(FRANCHISE_REVOKE_REPEAT_RECOVERY * 100)}%) at once, the rest over the following months.`, 'money');
  return {
    ok: true, franchisee: f, incomeBefore, incomeAfter,
    repeatRateBefore: repeatBefore, repeatRateAfter: biz.repeatRate,
    msg: `Revoked ${f.name}'s franchise — their ${money(S, f.monthlyRoyalty)}/month in royalties stops, repeat customers ${Math.round(repeatBefore * 100)}% → ${Math.round(biz.repeatRate * 100)}% and recovering.`
  };
}

/* ============================================================================
   §7 — CASH: withdraw vs reinvest (retained cash ONLY — see header).
   ========================================================================== */
export function withdrawBusinessCash(S, bizRef, amount) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const amt = Math.round(Number(amount) || 0);
  const retained = Math.round(biz.retainedCash || 0);
  if (amt <= 0) return { ok: false, msg: `Withdraw how much? Retained cash in ${biz.name} is ${money(S, retained)} — this is retained cash, NOT the monthly P&L (which already landed in your household).` };
  if (amt > retained) {
    return { ok: false, msg: `Cannot withdraw ${money(S, amt)} — ${biz.name} holds only ${money(S, retained)} in retained cash. This is retained cash, NOT the monthly P&L (which already landed in your household).` };
  }
  const taxInfo = computeBusinessTax(S, amt);
  const tax = Math.round(taxInfo.tax || 0);
  const net = amt - tax;
  biz.retainedCash = retained - amt;
  walletMove(S, amt, `Withdrew ${money(S, amt)} retained cash from ${biz.name}`, 'business');
  if (tax > 0) walletMove(S, -tax, `${taxInfo.label} — withdrawal from ${biz.name}`, 'business');
  recordJournal(S, `Withdrew ${money(S, amt)} of retained cash from ${biz.name}: tax ${money(S, tax)} under ${getCountry(S.country).name} brackets, ${money(S, net)} landed in your cash. This was retained cash — NOT the monthly P&L, which already landed in your household. ${money(S, biz.retainedCash)} stays in the business.`, 'money');
  return {
    ok: true, gross: amt, tax, net, retainedCashAfter: biz.retainedCash,
    taxLabel: taxInfo.label,
    msg: `Withdrew ${money(S, amt)} retained cash from ${biz.name} — tax ${money(S, tax)} (${getCountry(S.country).name} brackets), ${money(S, net)} in your cash. This is retained cash, NOT the monthly P&L (which already landed).`
  };
}

export function reinvestBusinessCash(S, bizRef, amount) {
  ensureExtendedState(S);
  const biz = ensureExitState(S, resolveBusiness(S, bizRef));
  if (!biz) return { ok: false, msg: 'No business found.' };
  const amt = Math.round(Number(amount) || 0);
  if (amt <= 0) return { ok: false, msg: 'Reinvest how much? Name an amount of your own cash to put into the business.' };
  if ((Number(S.money.cash) || 0) < amt) {
    return { ok: false, msg: `Cannot reinvest ${money(S, amt)} — you have ${money(S, S.money.cash)} in cash.` };
  }
  const base = Math.max(1000, Number(biz.monthlyRev) || 0);
  const lift = Math.min(0.25, amt / (base * 4));
  const boost = 1 + lift;
  walletMove(S, -amt, `Reinvested ${money(S, amt)} of personal cash into ${biz.name} retained cash`, 'business');
  biz.retainedCash = Math.round((biz.retainedCash || 0) + amt);
  biz.reinvestBoost = boost;
  recordJournal(S, `Reinvested ${money(S, amt)} of your own cash into ${biz.name} — retained cash is now ${money(S, biz.retainedCash)}, and next month's revenue grows ×${boost.toFixed(2)} (the boost is used once, next month only). This is retained cash, NOT the monthly P&L (which already landed in your household).`, 'money');
  return {
    ok: true, amount: amt, retainedCash: biz.retainedCash, boost,
    msg: `Reinvested ${money(S, amt)} into ${biz.name} — retained cash ${money(S, biz.retainedCash)}, next month's revenue ×${boost.toFixed(2)}. This is retained cash, NOT the monthly P&L (which already landed).`
  };
}

/* The multiplier the coordinator wires into next month's P&L revenue.
   1 when nothing was reinvested. */
export function reinvestBoost(S, bizRef) {
  const biz = resolveBusiness(S, bizRef);
  if (!biz) return 1;
  const b = Number(biz.reinvestBoost);
  return (Number.isFinite(b) && b >= 1) ? b : 1;
}
/* Consume the boost after the month it applied to — one month only. */
export function consumeReinvestBoost(S, bizRef) {
  const biz = resolveBusiness(S, bizRef);
  if (!biz) return 1;
  const b = reinvestBoost(S, biz);
  biz.reinvestBoost = 1;
  return b;
}

/* ============================================================================
   Render helpers (HTML strings — the coordinator wires them into views.js;
   this file never touches views.js). Buttons carry data-action names the
   coordinator's main.js handler maps to the functions above.
   ========================================================================== */
export function renderExitsHtml(S, biz) {
  if (!biz) return '';
  const b = ensureExitState(S, biz);
  const valuation = businessValuation(b);
  const th = ipoThreshold(S, b);
  const fth = franchiseThreshold(S, b);
  const mgr = b.manager;
  const offer = b.exitOffer && b.exitOffer.kind === 'trade' ? b.exitOffer : null;
  const ipoLine = th.ok
    ? `Big enough to list — an IPO ${th.text}. Yours: annual revenue ${money(S, th.annualRevenue)}, ${th.years.toFixed(1)} years in business. Listing costs 5% of valuation (${money(S, Math.round(valuation * IPO_COST_RATE))}), sells ${IPO_FLOAT_PCT}% of the business, and can fail.`
    : `Too small to list — an IPO ${th.text}. Yours: ${money(S, th.annualRevenue)} a year, ${th.years.toFixed(1)} years.`;
  const franLine = fth.ok
    ? `Proven enough to franchise — franchising ${fth.text}. Yours: level ${fth.level}, ${fth.monthsInBusiness} months trading, ${fth.profitableMonths} profitable months in a row, ${Math.round(fth.repeatRate * 100)}% repeat customers. Each franchisee pays ${money(S, Math.max(10000, Math.round(b.monthlyRev * 3)))} up front plus 5% of monthly revenue (${money(S, Math.round(b.monthlyRev * FRANCHISE_ROYALTY_RATE))}/month).`
    : `Not proven enough to franchise — franchising ${fth.text}. Yours: level ${fth.level}, ${fth.monthsInBusiness} months trading, ${fth.profitableMonths} profitable months in a row, ${Math.round(fth.repeatRate * 100)}% repeat customers.`;
  const franRows = (b.franchisees || []).map(f => `
      <div style="display:flex;justify-content:space-between;gap:8px;padding:4px 0;">
        <span>${esc(f.name)} — ${f.status === 'bad' ? '<strong>damaging the brand</strong>' : 'in good standing'} · ${money(S, f.monthlyRoyalty)}/mo royalties</span>
        <span>${f.status === 'bad' ? `<button class="btn btn-sm" data-action="biz-revoke-franchise" data-biz="${esc(b.id)}" data-franchisee="${esc(f.id)}">Revoke franchise</button>` : ''}</span>
      </div>`).join('');
  return `
  <div class="biz-exits-section" style="margin-top:10px;">
    <h4>Exits — sell the business, list it, or franchise it</h4>
    <div class="muted" style="margin-bottom:6px;">Valuation: <strong>${money(S, valuation)}</strong> (0.7× capital + 2.8× annual net profit).</div>
    <div style="margin-bottom:8px;">
      <strong>Trade sale.</strong> ${offer ? esc(offer.reason) + (offer.negotiated ? ` Counter: <strong>${money(S, offer.counter)}</strong>.` : '') : 'A named buyer will offer above or below the valuation, depending on the business\'s health and the market.'}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
        <button class="btn btn-sm" data-action="biz-trade-offer" data-biz="${esc(b.id)}">Get a trade-sale offer</button>
        ${offer && !offer.negotiated ? `<button class="btn btn-sm" data-action="biz-trade-negotiate" data-biz="${esc(b.id)}">Negotiate (one round)</button>` : ''}
        ${offer ? `<button class="btn btn-sm" data-action="biz-trade-accept" data-biz="${esc(b.id)}">Accept ${money(S, offer.counter ?? offer.offer)}</button>` : ''}
      </div>
    </div>
    <div style="margin-bottom:8px;">
      <strong>Management buyout.</strong> ${mgr ? `${esc(mgr.name)} (your manager) can buy it for ${money(S, Math.round(valuation * MBO_DISCOUNT))} — 85% of valuation, cheaper than a trade sale — outright from savings or with a bank loan at ${(MBO_LOAN_ANNUAL_RATE * 100).toFixed(0)}% over ${MBO_LOAN_MONTHS} months. They stay in the game as the new owner.` : 'No manager — a buyout needs a manager to buy it. Hire one first.'}
      ${mgr ? `<div style="margin-top:4px;"><button class="btn btn-sm" data-action="biz-mbo" data-biz="${esc(b.id)}">Sell to ${esc(mgr.name)}</button></div>` : ''}
    </div>
    <div style="margin-bottom:8px;">
      <strong>IPO.</strong> ${esc(ipoLine)}
      ${th.ok ? `<div style="margin-top:4px;"><button class="btn btn-sm" data-action="biz-ipo" data-biz="${esc(b.id)}">List ${esc(b.name)} (costs ${money(S, Math.round(valuation * IPO_COST_RATE))})</button></div>` : ''}
      ${b.publicFloat ? `<div class="muted">Already listed — ${b.publicFloat}% owned by public shareholders.</div>` : ''}
    </div>
    <div>
      <strong>Franchise.</strong> ${esc(franLine)}
      ${franRows ? `<div style="margin-top:4px;">${franRows}</div>` : ''}
      ${fth.ok && b.franchisees.length < FRANCHISE_MAX ? `<div style="margin-top:4px;"><button class="btn btn-sm" data-action="biz-franchise" data-biz="${esc(b.id)}">Add a franchisee</button></div>` : ''}
      ${b.franchisees.length > 0 ? `<div class="muted">Franchise income: ${money(S, franchiseIncome(S, b))}/month (a real P&amp;L line).</div>` : ''}
    </div>
  </div>`;
}

export function renderCashHtml(S, biz) {
  if (!biz) return '';
  const b = ensureExitState(S, biz);
  const retained = Math.round(b.retainedCash || 0);
  const boost = reinvestBoost(S, b);
  const taxOnFull = retained > 0 ? computeBusinessTax(S, retained).tax : 0;
  return `
  <div class="biz-cash-section" style="margin-top:10px;">
    <h4>Business cash — withdraw or reinvest</h4>
    <div class="muted" style="margin-bottom:6px;">Retained cash in ${esc(b.name)}: <strong>${money(S, retained)}</strong>. This is retained cash — money you put in, or franchise fees held in the business. It is <strong>NOT</strong> the monthly profit &amp; loss, which already landed in your household ledger, net of tax. Withdrawing it is taxed again, under ${esc(getCountry(S.country).name)} brackets.</div>
    <div class="muted" style="margin-bottom:6px;">${retained > 0 ? `Withdrawing all ${money(S, retained)} would cost ${money(S, taxOnFull)} in tax, leaving ${money(S, retained - taxOnFull)}.` : 'Nothing retained yet — reinvest some of your own cash, or take a franchise fee, to build retained cash.'} ${boost > 1 ? `Next month's revenue is boosted ×${boost.toFixed(2)} from your last reinvestment.` : ''}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px;">
      <label class="muted">Withdraw <input type="number" data-cash-amount="withdraw" value="${retained}" min="0" max="${retained}" style="width:130px"> (taxed)</label>
      <button class="btn btn-sm" data-action="biz-withdraw-cash" data-biz="${esc(b.id)}">Withdraw</button>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:4px;">
      <label class="muted">Reinvest <input type="number" data-cash-amount="reinvest" value="${Math.round((Number(b.monthlyRev) || 0) * 0.25)}" min="0" style="width:130px"> of your own cash (lifts next month's revenue)</label>
      <button class="btn btn-sm" data-action="biz-reinvest-cash" data-biz="${esc(b.id)}">Reinvest</button>
    </div>
  </div>`;
}
