#!/usr/bin/env node
/* v2.19 Worker 2 verify — F1 / B2 business-fate branches, measured end to end.
 * Run from the game root:  node tests/v219-w2-verify.mjs
 * This is the round-spec §0 item 2: the two branches v2.18 never exercised
 * in measurement, now executed on crafted lives with the LEDGER moves
 * measured, not just the scene rendering:
 *  F1  bank-call loan restructure (businessFate.js buildBankCallScene):
 *      a high-credit life (820) with a struggling loaned business takes
 *      the Restructure choice through the game's own scene queue, and
 *      the next settlement is shown charging the restructured payment.
 *      (v2.18 could not reach this: its test life had credit 680 against
 *      the Egypt SME bar of 700, so takeBusinessLoan refused and the
 *      test fell into the no-loan arrears branch instead.)
 *  B2  bigger-loan offer (biggerLoanOffer, gated on terms.reqScore):
 *      a booming business with a high-credit owner takes the offer
 *      through the monthly check, and the money landing in the account
 *      plus the new loan record plus the next settlement's charge are
 *      all measured.
 *  Also measured: the true reqScore bars (Egypt 700, USA 700, Saudi
 *  690, fallback 620) — no business product anywhere requires 800,
 *  so the v2.18 log's "800" was wrong; 820 clears every bar.
 * Exit 0 only when there are no FAILs. */
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: (k) => store.delete(k),
};

let pass = 0, fail = 0; const failedNames = [];
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`); }
  else { fail++; failedNames.push(name); console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const section = (t) => console.log(`\n--- ${t} ---`);

const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const { checkBusinessFate, biggerLoanOffer } = await import('../src/systems/businessFate.js');
const { takeBusinessLoan, getBusinessLoan, businessLoanTerms } = await import('../src/systems/businessLoans.js');
const { settleHouseholdMonth } = await import('../src/systems/economyEngine.js');
await import('../src/main.js');

/* ---------- crafted-life helpers (same shapes as v218-verify) ---------- */
function adultLife(cash = 5_000_000, seed = 777, credit = 820) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = cash;
  S.money.savings = 0;
  S.money.creditScore = credit;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkBiz(id, name, opts = {}) {
  return {
    id, typeId: 'cafe', name, country: 'egy', city: 'Cairo', level: opts.level || 1,
    maxLevel: Infinity, volatility: 0.05,
    monthlyRev: 300000, monthlyCost: 80000, capitalInvested: opts.capitalInvested ?? 500000,
    totalCapitalIn: opts.capitalInvested ?? 500000, brandValue: 1000, retainedEarnings: 0,
    repeatRate: opts.repeatRate ?? 0.5, mode: 'full_time',
    staff: [], premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: opts.monthsLosing || 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 }, history: opts.history || [], heirId: null, remote: false,
    foundedYear: 2024, foundedMonth: 1, manager: null, ownerManaged: true, ownerHoursPerWeek: 40,
    dead: !!opts.dead, deathCause: opts.deathCause || null, group: opts.group || null, brokeOut: false,
    distressStage: 0, marketSlumpMonths: 0,
    lastPL: opts.lastPL || null,
  };
}
const journalTexts = (S) => (S.journal || []).map((e) => e.text || '');
const LOSING_PL = { year: 2026, month: 1, name: 'Struggling Café', typeId: 'cafe', revenue: 40000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: -40000, tax: 0, taxLabel: 'No tax — loss', net: -40000, wave: 0, repeatRate: 0.4 };

/* ================= F1: bank-call loan restructure ================= */
section('F1 — the bank-call loan restructure, end to end');
{
  /* The v2.18 block, reproduced: a 680 life cannot even take the loan
     the restructure would restructure (Egypt SME bar is 700). */
  const Low = adultLife(5_000_000, 777, 680);
  const lowBiz = mkBiz('biz_low', 'Low Credit Café');
  Low.career.businesses = [lowBiz]; Low.career.business = lowBiz;
  const lowRes = takeBusinessLoan(Low, lowBiz, 500000);
  check('F1 setup: credit 680 cannot take the Egypt SME loan (bar 700) — the v2.18 block',
    lowRes.ok === false && /below the 700/.test(lowRes.msg), lowRes.msg);
}
{
  const S = adultLife(5_000_000, 777, 820);
  const terms = businessLoanTerms(S, 500000, { typeId: 'cafe' });
  check('F1 setup: Egypt SME terms for a 500,000 EGP cafe loan are 5% / 5y / bar 700',
    terms.annualRate === 0.05 && terms.termYears === 5 && terms.months === 60 && terms.reqScore === 700 && terms.monthlyPayment === 9436,
    `${terms.source}, ${terms.monthlyPayment}/mo, ${terms.months} months`);
  const biz = mkBiz('biz_f1', 'Struggling Café', { monthsLosing: 2, lastPL: LOSING_PL });
  S.career.businesses = [biz]; S.career.business = biz;
  const cashBeforeLoan = S.money.cash;
  const loanRes = takeBusinessLoan(S, biz, 500000);
  const loan0 = getBusinessLoan(S, biz);
  check('F1 setup: the 820 life takes the 500,000 EGP loan — the money lands, the terms are real',
    loanRes.ok === true && S.money.cash === cashBeforeLoan + 500000
    && loan0.balance === 500000 && loan0.monthlyPayment === 9436 && loan0.remainingMonths === 60 && loan0.annualRate === 0.05,
    `cash ${cashBeforeLoan}->${S.money.cash}, monthly ${loan0.monthlyPayment}, term ${loan0.remainingMonths}mo`);
  const payBefore = loan0.monthlyPayment;
  const termBefore = loan0.remainingMonths;
  const creditBefore = S.money.creditScore;
  const rep = checkBusinessFate(S);
  check('F1: the monthly check fires the bank scene for the struggling loaned business',
    rep.fired.length === 1 && rep.fired[0].kind === 'bank' && S.activeScene?.title === 'The Bank Calls About Struggling Café',
    JSON.stringify(rep.fired));
  check('F1: the scene names the real balance and the real monthly payment',
    /500,000 EGP still owed, 9,436 EGP a month/.test(S.activeScene?.text || ''), (S.activeScene?.text || '').slice(0, 120));
  check('F1: choice 0 is the Restructure, priced at the new payment in its label',
    /Restructure — pay 7,077 EGP\/mo instead/.test(S.activeScene?.choices[0]?.label || ''), S.activeScene?.choices[0]?.label || 'no choice');
  const r = resolveActiveSceneChoice(S, 0);
  const loan1 = getBusinessLoan(S, biz);
  check('F1: resolving Restructure through the scene queue works', r.ok === true);
  check('F1: monthly payment falls to exactly 75% (9,436 -> 7,077)',
    loan1.monthlyPayment === Math.round(payBefore * 0.75) && loan1.monthlyPayment === 7077,
    `${payBefore} -> ${loan1.monthlyPayment}`);
  check('F1: term stretches to exactly 1.5x (60 -> 90 months)',
    loan1.remainingMonths === Math.round(termBefore * 1.5) && loan1.remainingMonths === 90,
    `${termBefore} -> ${loan1.remainingMonths}`);
  check('F1: the balance is untouched by the restructure (500,000)',
    loan1.balance === 500000, `balance ${loan1.balance}`);
  check('F1: credit score falls exactly 5 (820 -> 815)',
    S.money.creditScore === creditBefore - 5 && S.money.creditScore === 815,
    `${creditBefore} -> ${S.money.creditScore}`);
  check('F1: the journal records the restructure in plain words',
    journalTexts(S).some((t) => /Restructured the Struggling Café loan — payments down to 7,077 EGP\/month/.test(t)));
  /* The ledger move, not just the field: the next settlement must
     charge the RESTRUCTURED payment, not the old one. */
  const balBeforeSettle = loan1.balance;
  settleHouseholdMonth(S);
  const loan2 = getBusinessLoan(S, biz);
  const interest = Math.round(balBeforeSettle * (loan1.annualRate / 12));
  check('F1: the next settlement charges the restructured 7,077 (summary.debt, single loan)',
    S.money.lastMonthSummary?.debt === 7077, `summary.debt ${S.money.lastMonthSummary?.debt}`);
  check('F1: the balance falls by payment minus interest (500,000 -> 495,006) and the term ticks down (90 -> 89)',
    loan2.balance === balBeforeSettle - 7077 + interest && loan2.balance === 495006 && loan2.remainingMonths === 89,
    `balance ${balBeforeSettle}->${loan2.balance} (interest ${interest}), term ${loan2.remainingMonths}`);
}
{
  /* Same branch, dead business: the loan survives the closure (it is a
     personal debt) and the bank still offers the restructure. */
  const S = adultLife(5_000_000, 778, 820);
  const biz = mkBiz('biz_f1d', 'Dead Café', {
    monthsLosing: 4, dead: true, deathCause: 'ran out of money after months of losses', lastPL: LOSING_PL,
  });
  S.career.businesses = [biz]; S.career.business = biz;
  const loanRes = takeBusinessLoan(S, biz, 500000);
  check('F1 (dead business): the loan is still taken after the closure', loanRes.ok === true);
  const rep = checkBusinessFate(S);
  check('F1 (dead business): the bank scene still fires',
    rep.fired.some((f) => f.kind === 'bank') && /has closed — ran out of money/.test(S.activeScene?.text || ''),
    S.activeScene?.title || 'no scene');
  const payBefore = getBusinessLoan(S, biz).monthlyPayment;
  const termBefore = getBusinessLoan(S, biz).remainingMonths;
  const creditBefore = S.money.creditScore;
  resolveActiveSceneChoice(S, 0);
  const loan1 = getBusinessLoan(S, biz);
  check('F1 (dead business): Restructure still cuts the payment to 75% and stretches the term 1.5x, credit -5',
    loan1.monthlyPayment === Math.round(payBefore * 0.75) && loan1.remainingMonths === Math.round(termBefore * 1.5)
    && S.money.creditScore === creditBefore - 5,
    `${payBefore}->${loan1.monthlyPayment}, ${termBefore}->${loan1.remainingMonths}, credit ${creditBefore}->${S.money.creditScore}`);
}

/* ================= B2: the bigger-loan offer ================= */
section('B2 — the bank offers a bigger loan, end to end');
{
  const S = adultLife(5_000_000, 777, 820);
  const bbiz = mkBiz('biz_b2', 'Booming Café', {
    level: 6, repeatRate: 0.66, capitalInvested: 1000000,
    history: Array.from({ length: 6 }, () => ({ net: 5000 })),
    lastPL: { year: 2026, month: 1, name: 'Booming Café', typeId: 'cafe', revenue: 300000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: 220000, tax: 20000, taxLabel: 'Income tax', net: 200000, wave: 0, repeatRate: 0.66 },
    group: { headOffice: { cost: 10000 }, regionalManager: { name: 'Rania', salary: 20000 }, supplyChain: { discount: 0.1 } },
  });
  S.career.businesses = [bbiz]; S.career.business = bbiz;
  const offer = biggerLoanOffer(S, bbiz);
  check('B2: the offer is half the capital invested (1,000,000 -> 500,000 EGP)',
    !!offer && offer.amount === 500000, offer ? `amount ${offer.amount}` : 'no offer');
  check('B2: the offer terms are the real SME terms (5% APR, 9,436/mo, 5y/60mo, bar 700)',
    !!offer && offer.terms.annualRate === 0.05 && offer.terms.monthlyPayment === 9436
    && offer.terms.termYears === 5 && offer.terms.months === 60 && offer.terms.reqScore === 700,
    offer ? `${offer.terms.source}, ${offer.terms.monthlyPayment}/mo` : 'no offer');
  /* Via the monthly check with no spouse: the house scene is skipped
     (no spouse), so the loan scene is the one that fires. */
  const rep = checkBusinessFate(S);
  check('B2: the monthly check fires the bigger-loan scene',
    rep.fired.length === 1 && rep.fired[0].kind === 'loan' && S.activeScene?.title === 'The Bank Offers Booming Café a Bigger Loan',
    JSON.stringify(rep.fired));
  check('B2: choice 0 is Take it, priced at the real amount and payment',
    /Take it — 500,000 EGP at 9,436 EGP\/mo/.test(S.activeScene?.choices[0]?.label || ''), S.activeScene?.choices[0]?.label || 'no choice');
  const cashBefore = S.money.cash;
  const loansBefore = (S.money.loans || []).length;
  const r = resolveActiveSceneChoice(S, 0);
  const loansAfter = S.money.loans || [];
  const newLoan = loansAfter[loansAfter.length - 1];
  check('B2: resolving Take it through the scene queue works', r.ok === true);
  check('B2: the 500,000 EGP lands in the account (cash 5,000,000 -> 5,500,000)',
    S.money.cash === cashBefore + 500000 && S.money.cash === 5500000,
    `${cashBefore} -> ${S.money.cash}`);
  check('B2: exactly one real loan is added, with the offered balance',
    loansAfter.length === loansBefore + 1 && newLoan.balance === 500000,
    `loans ${loansBefore}->${loansAfter.length}, balance ${newLoan?.balance}`);
  check('B2: the new loan carries the offered terms (9,436/mo, 60 months, 5% APR, business purpose)',
    newLoan.monthlyPayment === 9436 && newLoan.remainingMonths === 60 && newLoan.annualRate === 0.05 && newLoan.purpose === 'business',
    `${newLoan.monthlyPayment}/mo, ${newLoan.remainingMonths}mo, ${newLoan.annualRate * 100}%`);
  check('B2: the loan is linked to the business both ways (loan.businessId + biz.loanId)',
    newLoan.businessId === 'biz_b2' && bbiz.loanId === newLoan.id,
    `businessId ${newLoan.businessId}, biz.loanId ${bbiz.loanId}`);
  check('B2: the journal records the loan in plain words',
    journalTexts(S).some((t) => /Took a 500,000 EGP business loan for Booming Café at 5.0%/.test(t)));
  /* The ledger move: the next settlement must charge the new loan. */
  const balBeforeSettle = newLoan.balance;
  settleHouseholdMonth(S);
  const loanAfterSettle = (S.money.loans || []).find((l) => l.id === newLoan.id);
  const interest = Math.round(balBeforeSettle * (newLoan.annualRate / 12));
  check('B2: the next settlement charges the new loan (summary.debt 9,436, single loan)',
    S.money.lastMonthSummary?.debt === 9436, `summary.debt ${S.money.lastMonthSummary?.debt}`);
  check('B2: the balance falls by payment minus interest (500,000 -> 492,647) and the term ticks down (60 -> 59)',
    loanAfterSettle.balance === balBeforeSettle - 9436 + interest && loanAfterSettle.balance === 492647 && loanAfterSettle.remainingMonths === 59,
    `balance ${balBeforeSettle}->${loanAfterSettle.balance} (interest ${interest}), term ${loanAfterSettle.remainingMonths}`);
}
{
  /* The gate itself: below the bar there is no offer at all. */
  const S = adultLife(5_000_000, 777, 699);
  const bbiz = mkBiz('biz_b2g', 'Booming Café', {
    level: 6, repeatRate: 0.66, capitalInvested: 1000000,
    history: Array.from({ length: 6 }, () => ({ net: 5000 })),
    group: { headOffice: { cost: 10000 }, regionalManager: { name: 'Rania', salary: 20000 }, supplyChain: { discount: 0.1 } },
  });
  S.career.businesses = [bbiz]; S.career.business = bbiz;
  check('B2 gate: credit 699 (one below the 700 bar) gets no bigger-loan offer',
    biggerLoanOffer(S, bbiz) === null);
}

/* ================= The true bars (correcting the v2.18 log) ================= */
section('True reqScore bars — no business product requires 800');
{
  const bars = {};
  for (const c of ['egy', 'usa', 'sau', 'uae', 'gbr']) {
    const S = adultLife(5_000_000, 777, 850);
    S.country = c;
    bars[c] = businessLoanTerms(S, 500000, { typeId: 'cafe' }).reqScore;
  }
  check('Egypt SME bar is 700, USA SBA bar is 700, Saudi Monsha\u2019at bar is 690',
    bars.egy === 700 && bars.usa === 700 && bars.sau === 690,
    `egy ${bars.egy}, usa ${bars.usa}, sau ${bars.sau}`);
  check('Countries with no SME product fall back to 620 (UAE, UK)',
    bars.uae === 620 && bars.gbr === 620, `uae ${bars.uae}, gbr ${bars.gbr}`);
  check('No business product anywhere requires 800 (the v2.18 log was wrong)',
    Object.values(bars).every((b) => b < 800), `max bar ${Math.max(...Object.values(bars))}`);
}

console.log(`\n==== v219-w2-verify: ${pass} PASS, ${fail} FAIL ====`);
if (failedNames.length) console.log('failed:', failedNames.join(' | '));
process.exit(fail ? 1 : 0);
