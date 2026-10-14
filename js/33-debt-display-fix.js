/* =====================================================================
   33. DEBT DISPLAY FIX — show home mortgages in Total Debts
   Load AFTER 32-banking-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p33MortgageDebt() {
  if (!S || !Array.isArray(S.ownedHomes)) return 0;
  return S.ownedHomes.reduce((sum, h) => sum + Math.max(0, Number(h && h.balance) || 0), 0);
}

function p33BankDebt() {
  if (!S) return 0;
  let total = 0;
  if (Array.isArray(S.loans)) {
    S.loans.forEach(l => { total += Math.max(0, Number(l && l.bal) || 0); });
  }
  if (Array.isArray(S.shopLoans)) {
    S.shopLoans.forEach(l => { total += Math.max(0, Number(l && l.bal) || 0); });
  }
  if (S.bank && Array.isArray(S.bank.loans)) {
    S.bank.loans.forEach(l => { total += Math.max(0, Number(l && l.remainingBal) || 0); });
  }
  return total;
}

function p33CardDebt() {
  if (!S || !S.bank || !S.bank.cardDebt) return 0;
  return Object.values(S.bank.cardDebt).reduce((sum, v) => sum + Math.max(0, Number(v) || 0), 0);
}

function p33StudentLoan() {
  return Math.max(0, Number(S && S.loan) || 0);
}

function p33TotalDebt() {
  return p33MortgageDebt() + p33BankDebt() + p33CardDebt() + p33StudentLoan();
}

/* Override viewMoney to break out debt sources clearly */
const P33_viewMoneyBefore = viewMoney;
viewMoney = function() {
  if (!S || S.age < 18) return P33_viewMoneyBefore();

  const mortgage = p33MortgageDebt();
  const bankLoans = p33BankDebt();
  const cardDebt = p33CardDebt();
  const studentLoan = p33StudentLoan();
  const totalDebt = mortgage + bankLoans + cardDebt + studentLoan;

  /* Build a debt breakdown section */
  let debtRows = '';
  if (totalDebt > 0) {
    if (mortgage > 0) debtRows += `<div class="row"><span>Home mortgages</span><b class="mono" style="color:var(--rose)">${money(-mortgage)}</b></div>`;
    if (bankLoans > 0) debtRows += `<div class="row"><span>Bank &amp; shop loans</span><b class="mono" style="color:var(--rose)">${money(-bankLoans)}</b></div>`;
    if (cardDebt > 0) debtRows += `<div class="row"><span>Credit card balances</span><b class="mono" style="color:var(--rose)">${money(-cardDebt)}</b></div>`;
    if (studentLoan > 0) debtRows += `<div class="row"><span>Student loan</span><b class="mono" style="color:var(--rose)">${money(-studentLoan)}</b></div>`;
  } else {
    debtRows = '<p class="muted">You have no outstanding debt.</p>';
  }

  /* Also break out real estate gross vs mortgage for clarity */
  const grossProperty = Array.isArray(S.ownedHomes)
    ? S.ownedHomes.reduce((sum, h) => sum + (Number(h && h.value) || 0), 0)
    : 0;
  const netPropertyEquity = grossProperty - mortgage;

  /* Prepend a corrected Financial Overview before the existing one, and suppress the old duplicate */
  const correctedOverview = `<section class="card">
    <h3>Financial Overview</h3>
    <div class="row"><span>Cash</span><b class="mono">${money(Number(S.wealth) || 0)}</b></div>
    <div class="row"><span>Savings account</span><b class="mono">${money(Number(S.bank && S.bank.savingsBal) || 0)}</b></div>
    <div class="row"><span>Investments</span><b class="mono">${money(Number(S.invest) || 0)}</b></div>
    <div class="row"><span>Retirement pot</span><b class="mono">${money(Number(S.nest) || 0)}</b></div>
    <div class="row"><span>Property (gross value)</span><b class="mono">${money(grossProperty)}</b></div>
    <div class="row"><span>Property (net equity)</span><b class="mono">${money(netPropertyEquity)}</b></div>
    <div class="row"><span>Cars</span><b class="mono">${money(carsEquity ? carsEquity() : 0)}</b></div>
    <div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px">
      <span><b>Debt breakdown</b></span><b class="mono" style="color:var(--rose)">${money(-totalDebt)}</b>
    </div>
    ${debtRows}
    <div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px">
      <span><b>Net worth</b></span><b class="mono" style="color:${netWorth() < 0 ? 'var(--rose)' : 'var(--mint)'}">${money(netWorth())}</b>
    </div>
  </section>`;

  /* Get the original view, then strip its outdated Financial Overview section */
  let original = P33_viewMoneyBefore();
  original = original.replace(/<section class="card">\s*<h3>Financial Overview<\/h3>[\s\S]*?<\/section>/, '');

  return correctedOverview + original;
};
