/* ============================================================================
   World Life 2.0 — Business Loans (v2.11 W2, Overnight Round 3)
   Borrow to start or expand a business, through the EXISTING loan system —
   no parallel system is invented.
   ----------------------------------------------------------------------------
   - Record shape is the game's own loan record (S.money.loans):
     { id, label, balance, monthlyPayment, annualRate, remainingMonths,
       country, missedMonths, purpose: 'business', businessId,
       assetKind: 'business', productId }.
     The monthly payment therefore runs through the existing settlement
     loop (economyEngine.js §14): miss 1 -> late fee + credit hit,
     miss 2 -> warning scene, miss 3 -> collections (balance frozen,
     credit −30). A business loan has no car to repossess, so miss 3
     lands in collections like any other unsecured loan.
   - Rate and term come from the country's real SME product in
     V1_LOAN_PRODUCTS (purpose 'business'): Egypt SME Commercial
     Expansion Loan 5% / 2–5y, USA SBA 7(a) 9.5% / 5–10y, Saudi
     Monsha'at SME 4% / 3–7y, Egypt doctor/clinic finance 18% / 2–6y
     (used when the venture is a medical one). Countries with NO
     business product in the table fall back to the personal-loan
     pricing rule (eraDepositRates cd1Yr + 7.5pp — the personal loan is
     cd1Yr + 5.5pp, plus a 2pp business premium), 5-year term.
     Product min/max amounts and reqIncome are era-scaled with
     eraLocalCost, because the table is 2026 local currency.
   - Gates reuse the existing credit rules (takePersonalLoan's gates):
     age 21+, valid residence for banking, no bankruptcy flag, credit
     score at or above the product's reqScore (620 fallback), and the
     existing cap of 2 active loans. The player also needs a business
     already — or be launching one (biz = null + opts.typeId).
   - The loan is linked to the business via biz.loanId (and the loan's
     businessId). If the business closes or fails, THE LOAN REMAINS a
     personal debt: the player still owes it. The card says so plainly.
   - takeBusinessLoan(S, biz, amountLocal, opts): biz may be null for a
     launch loan; pass opts.typeId then, and call linkBusinessLoan(S,
     biz, loanId) once the business exists.
   ========================================================================== */

import { lenderCreditScore } from './familyName.js';
import { clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraDepositRates, eraLocalCost } from '../data/economy.js';
import { V1_LOAN_PRODUCTS } from '../data/megaFinanceAndMarkets.js';
import { hasValidResidenceForBanking } from './economyEngine.js';
/* v2.12 Worker 3 — the one central disabled-button reason helper. */
import { lockReason } from '../ui/lockReason.js';

const MAX_ACTIVE_LOANS = 2; // same cap as takePersonalLoan
const FALLBACK_REQ_SCORE = 620;
const FALLBACK_TERM_YEARS = 5;

/* The country's business-purpose loan product, preferring a medical
   product for medical ventures. Null where the table has none. */
export function findBusinessLoanProduct(countryId, typeId = null) {
  const products = (V1_LOAN_PRODUCTS || {})[countryId] || [];
  const business = products.filter(p => p.purpose === 'business');
  if (business.length === 0) return null;
  const hay = String(typeId || '').toLowerCase();
  if (/(clinic|dental|pharmacy|medical|vet|physio|diagnostic)/.test(hay)) {
    const medical = business.find(p => /clinic|medical|doctor/i.test(p.name || ''));
    if (medical) return medical;
  }
  return business[0];
}

/* Pure terms calculation (for the card UI and probes): rate, term,
   monthly payment. `years` is clamped into the product's term range. */
export function businessLoanTerms(S, amountLocal, opts = {}) {
  const countryId = S.country;
  const product = findBusinessLoanProduct(countryId, opts.typeId || null);
  let annualRate;
  let termYears;
  let source;
  if (product) {
    annualRate = Number(product.rate);
    const minT = Number(product.minTerm) || 1;
    const maxT = Number(product.maxTerm) || 10;
    termYears = clamp(Number(opts.years) || FALLBACK_TERM_YEARS, minT, maxT);
    source = `${product.name} (${(annualRate * 100).toFixed(1)}% APR)`;
  } else {
    const rates = eraDepositRates(countryId, S.year);
    annualRate = Number((rates.cd1Yr + 0.075).toFixed(4));
    termYears = FALLBACK_TERM_YEARS;
    source = `Bank business loan — no dedicated SME product in ${getCountry(countryId).name || countryId}, priced at deposit rate + 7.5pp (${(annualRate * 100).toFixed(1)}% APR)`;
  }
  const amt = Math.max(0, Math.round(Number(amountLocal) || 0));
  const months = termYears * 12;
  const r = annualRate / 12;
  const monthlyPayment = r > 0
    ? Math.round((amt * r) / (1 - Math.pow(1 + r, -months)))
    : Math.round(amt / months);
  const minAmount = product ? Math.round(eraLocalCost(product.minAmount, countryId, S.year)) : 0;
  const maxAmount = product ? Math.round(eraLocalCost(product.maxAmount, countryId, S.year)) : 0;
  const reqScore = product ? Number(product.reqScore) || FALLBACK_REQ_SCORE : FALLBACK_REQ_SCORE;
  const reqIncome = product && product.reqIncome
    ? Math.round(eraLocalCost(product.reqIncome, countryId, S.year))
    : 0;
  return { product, annualRate, termYears, months, monthlyPayment, source, minAmount, maxAmount, reqScore, reqIncome };
}

export function takeBusinessLoan(S, biz, amountLocal, opts = {}) {
  const typeId = biz?.typeId || opts.typeId || null;
  if (!biz && !typeId) {
    return { ok: false, msg: 'A business loan needs a business — or a venture type to launch.' };
  }
  if (S.player.age < 21) return { ok: false, msg: 'Must be at least 21 for bank credit.' };
  if (!hasValidResidenceForBanking(S)) return { ok: false, msg: 'New bank credit requires a valid residence status — regularise your visa first.' };
  if (S.year <= S.money.bankruptUntilYear) {
    return { ok: false, msg: `Bankruptcy flag blocks new credit until ${S.money.bankruptUntilYear}.` };
  }
  if ((S.money.loans || []).length >= MAX_ACTIVE_LOANS) {
    return { ok: false, msg: 'Maximum active loans reached (2) — clear one first.' };
  }
  const amt = Math.round(Number(amountLocal) || 0);
  if (!Number.isFinite(amt) || amt <= 0) return { ok: false, msg: 'Invalid loan amount.' };
  const terms = businessLoanTerms(S, amt, { typeId, years: opts.years });
  if (lenderCreditScore(S) < terms.reqScore) {
    return { ok: false, msg: `Credit score (${S.money.creditScore}) is below the ${terms.reqScore} this business loan requires.` };
  }
  if (terms.minAmount > 0 && amt < terms.minAmount) {
    return { ok: false, msg: `This loan starts at ${formatMoney(terms.minAmount, S.country)}.` };
  }
  if (terms.maxAmount > 0 && amt > terms.maxAmount) {
    return { ok: false, msg: `This loan caps at ${formatMoney(terms.maxAmount, S.country)}.` };
  }
  /* No income gate: the table's reqIncome is not consistently annual vs
     monthly across countries (Egypt personal 8,000 reads monthly, USA SBA
     75,000 reads annual), and the existing loan gate (takePersonalLoan)
     checks credit score only. The score + the 2-loan cap are the gates. */
  const bizName = biz?.name || (typeId ? `your planned ${typeId.replace(/_/g, ' ')}` : 'your business');
  const loan = {
    id: nextId(S, 'loan'),
    label: `Business Loan — ${bizName} (${terms.termYears}y)`,
    balance: amt,
    monthlyPayment: terms.monthlyPayment,
    annualRate: terms.annualRate,
    remainingMonths: terms.months,
    country: S.country,
    missedMonths: 0,
    purpose: 'business',
    businessId: biz ? biz.id : null,
    assetKind: 'business',
    productId: terms.product ? terms.product.id : null
  };
  S.money.loans.push(loan);
  if (biz) {
    biz.loanId = loan.id;
    loan.businessId = biz.id;
  }
  walletMove(S, amt, `Business loan disbursement — ${bizName}`, 'bank');
  recordJournal(S, `Took a ${formatMoney(amt, S.country)} business loan for ${bizName} at ${(terms.annualRate * 100).toFixed(1)}% (${formatMoney(terms.monthlyPayment, S.country)}/mo for ${terms.termYears} years). The payments run through your normal debts — miss one and the usual fee, warning, then collections follow.`, 'money');
  return { ok: true, msg: `Business loan approved: ${formatMoney(amt, S.country)} at ${(terms.annualRate * 100).toFixed(1)}%.`, loan, terms };
}

/* Link an already-taken launch loan to the business once it exists. */
export function linkBusinessLoan(S, biz, loanId) {
  if (!biz || !loanId) return { ok: false, msg: 'Need a business and a loan to link.' };
  const loan = (S.money.loans || []).find(l => l.id === loanId);
  if (!loan) return { ok: false, msg: 'That loan no longer exists.' };
  loan.businessId = biz.id;
  biz.loanId = loan.id;
  return { ok: true, msg: `Linked ${loan.label} to ${biz.name}.`, loan };
}

/* The loan attached to a business, if any (null when paid off / none). */
export function getBusinessLoan(S, biz) {
  if (!biz || !biz.loanId) return null;
  return (S.money.loans || []).find(l => l.id === biz.loanId) || null;
}

/* Extra principal payment from personal cash. The normal monthly payment
   still runs through the settlement; this only shortens the loan. */
export function payExtraOnBusinessLoan(S, biz, amountLocal) {
  const loan = getBusinessLoan(S, biz);
  if (!loan) return { ok: false, msg: 'This business has no loan to pay down.' };
  if (loan.inCollections) return { ok: false, msg: 'This loan is in collections — pay it through the normal monthly payments.' };
  const amt = Math.min(Math.round(Number(amountLocal) || 0), loan.balance);
  if (!Number.isFinite(amt) || amt <= 0) return { ok: false, msg: 'Invalid amount.' };
  if ((Number(S.money.cash) || 0) < amt) {
    return { ok: false, msg: `Need ${formatMoney(amt, S.country)} in cash for that extra payment.` };
  }
  walletMove(S, -amt, `Extra payment on ${loan.label}`, 'bank');
  loan.balance = Math.max(0, Math.round(loan.balance - amt));
  loan.remainingMonths = loan.monthlyPayment > 0
    ? Math.max(0, Math.ceil(loan.balance / loan.monthlyPayment))
    : 0;
  if (loan.balance <= 0) {
    loan.balance = 0;
    S.money.loans = (S.money.loans || []).filter(l => l.id !== loan.id);
    biz.loanId = null;
    S.money.creditScore = clamp(S.money.creditScore + 18, 300, 850);
    recordJournal(S, `Cleared the business loan for ${biz.name} in full with an extra payment.`, 'money');
    return { ok: true, msg: `Business loan for ${biz.name} cleared in full.`, cleared: true };
  }
  recordJournal(S, `Paid an extra ${formatMoney(amt, S.country)} off the ${biz.name} business loan — ${formatMoney(loan.balance, S.country)} left.`, 'money');
  return { ok: true, msg: `Paid ${formatMoney(amt, S.country)} extra. ${formatMoney(loan.balance, S.country)} left on the loan.`, loan };
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderBusinessLoanSection(S, biz) {
  const countryId = S.country;
  const loan = biz ? getBusinessLoan(S, biz) : null;
  if (loan) {
    const extraOne = Math.min(loan.balance,Math.round(loan.monthlyPayment));
    const extraTen = Math.min(loan.balance,Math.max(extraOne, Math.round(loan.balance * 0.1)));
    return `
  <div class="biz-loan-section" style="margin-top:10px;">
    <h4>Business loan</h4>
    <div>${escHtml(loan.label)}</div>
    <div class="muted">Balance ${formatMoney(loan.balance, countryId)} · ${formatMoney(loan.monthlyPayment, countryId)}/month · ${(loan.annualRate * 100).toFixed(1)}% APR · ${loan.remainingMonths} months left${loan.missedMonths > 0 ? ` · <strong style="color:#b3261e;">${loan.missedMonths} missed payment${loan.missedMonths === 1 ? '' : 's'}</strong>` : ''}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">
      <button class="btn btn-sm" data-action="biz-loan-extra" data-biz="${escHtml(biz.id)}" data-amount="${extraOne}">Pay extra ${formatMoney(extraOne, countryId)}</button>
      <button class="btn btn-sm" data-action="biz-loan-extra" data-biz="${escHtml(biz.id)}" data-amount="${extraTen}">Pay extra ${formatMoney(extraTen, countryId)}</button>
    </div>
    <div class="muted" style="font-size:12px;margin-top:4px;">If ${escHtml(biz.name)} closes or fails, this loan stays — you still owe it, as a personal debt.</div>
  </div>`;
  }
  /* No loan (yet): show the product on offer and the take-loan buttons. */
  const terms = businessLoanTerms(S, 0, { typeId: biz?.typeId || null });
  const sample = terms.maxAmount > 0
    ? [terms.minAmount, Math.round((terms.minAmount + terms.maxAmount) / 2), terms.maxAmount]
    : [];
  const canBorrow = lenderCreditScore(S) >= terms.reqScore && (S.money.loans || []).length < MAX_ACTIVE_LOANS;
  const buttons = sample.map(amt => {
    const t = businessLoanTerms(S, amt, { typeId: biz?.typeId || null });
    return `<button class="btn btn-sm" data-action="biz-loan-take" data-biz="${biz ? escHtml(biz.id) : ''}" data-type="${biz ? escHtml(biz.typeId) : ''}" data-amount="${amt}" ${canBorrow ? '' : 'disabled'}>Borrow ${formatMoney(amt, countryId)} (${formatMoney(t.monthlyPayment, countryId)}/mo)</button>`;
  }).join(' ');
  /* v2.18 W3 — the lock reason next to the disabled buttons (above) is
     the one statement of why borrowing is blocked; the second copy of
     the same sentence that used to sit here is deleted. */
  return `
  <div class="biz-loan-section" style="margin-top:10px;">
    <h4>Business loan</h4>
    <div class="muted">${escHtml(terms.source)}${terms.maxAmount > 0 ? ` · ${formatMoney(terms.minAmount, countryId)}–${formatMoney(terms.maxAmount, countryId)} · up to ${terms.termYears} years` : ''}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">${buttons || '<span class="muted">No loan amounts available.</span>'}${!canBorrow ? lockReason(lenderCreditScore(S) < terms.reqScore ? `Credit score ${S.money.creditScore}${lenderCreditScore(S) > S.money.creditScore ? ` (${lenderCreditScore(S)} to lenders with your family name)` : ''} is below the ${terms.reqScore} this loan requires` : 'You already have the maximum 2 active loans', lenderCreditScore(S) < terms.reqScore ? 'Raise your credit score first' : 'Pay a loan off first') : ''}</div>
    <div class="muted" style="font-size:12px;margin-top:4px;">Payments run through your normal debts: miss one and there is a fee, miss two and you get a warning, miss three and it goes to collections. If the business closes, the loan stays — you still owe it.</div>
  </div>`;
}
