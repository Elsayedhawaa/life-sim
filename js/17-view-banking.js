/* ============================================================
   WORLD LIFE — VIEW: BANKING SYSTEM (Ultimate Edition v2)
   ============================================================
   Registers tab 'bank' at order 6.
   10 sub-tabs: Accounts, Certs, Cards, Loans, Score, Wealth,
                Insurance, Goals, Transfer, Pension.
   Exposes rich Public API for external modules.

   v2 changes (all additive):
   - bankSpend() / bankAvailableCash() helpers (bug fix)
   - Overdraft resolution UI (bug fix)
   - Loan amortization fixed (was 70/30 split)
   - Bond maturity handling (was leaking)
   - Milestones, transactions, netWorth chart
   - Salary auto-deposit toggle
   - Emergency fund warnings
   - bankGetMortgageQuote() for real estate
   ============================================================ */

/* ---------- DEEP STATE INITIALIZATION ---------- */
function ensureBankState() {
  if (!S) return;
  if (!S.bank) S.bank = {};
  const b = S.bank;

  if (typeof b.score !== 'number') b.score = 680;
  if (!Array.isArray(b.scoreHistory)) b.scoreHistory = [];
  if (typeof b.missedPayments !== 'number') b.missedPayments = 0;
  if (typeof b.hardInquiries !== 'number') b.hardInquiries = 0;
  if (typeof b.cashbackBal !== 'number') b.cashbackBal = 0;
  if (typeof b.bankTab !== 'string') b.bankTab = 'accounts';

  if (!Array.isArray(b.accounts)) {
    b.accounts = [];
    if (b.savingsBal > 0) {
      b.accounts.push({ id: 'acc_legacy', bankId: (BANKS[S.country] && BANKS[S.country][0].id) || 'cib', type: 'savings', balance: b.savingsBal, openedYear: gameYear() });
      b.savingsBal = 0;
    }
  }

  if (!Array.isArray(b.certificates)) b.certificates = [];
  if (!Array.isArray(b.creditCards)) b.creditCards = [];
  if (!Array.isArray(b.loans)) b.loans = [];
  if (!Array.isArray(b.installments)) b.installments = [];

  if (!Array.isArray(b.investments)) b.investments = [];
  if (!Array.isArray(b.gold)) b.gold = [];
  if (!Array.isArray(b.insurance)) b.insurance = [];
  if (!Array.isArray(b.goals)) b.goals = [];
  if (!Array.isArray(b.linkedWallets)) b.linkedWallets = [];
  if (!Array.isArray(b.remitHistory)) b.remitHistory = [];
  if (!b.pension || typeof b.pension !== 'object') b.pension = { active: [], totalContributed: 0, totalValue: 0 };
  if (typeof b.salaryAutoSavePct !== 'number') b.salaryAutoSavePct = 0;
  if (typeof b.accountOpenedYear !== 'number') b.accountOpenedYear = S.age >= 18 ? gameYear() : 0;
  if (typeof b.fraudLockYear !== 'number') b.fraudLockYear = -1;

  // NEW: milestones, transactions, netWorth history, auto-deposit
  if (!Array.isArray(b.milestones)) b.milestones = [];
  if (!Array.isArray(b.transactions)) b.transactions = [];
  if (!Array.isArray(b.netWorthHistory)) b.netWorthHistory = [];
  if (typeof b.autoDepositSalary !== 'boolean') b.autoDepositSalary = false;

  b.certificates.forEach(c => {
    if (typeof c.principal !== 'number') c.principal = 0;
    if (typeof c.yearsHeld !== 'number') c.yearsHeld = 0;
    if (typeof c.totalInterestPaid !== 'number') c.totalInterestPaid = 0;
    if (typeof c.autoRenew !== 'boolean') c.autoRenew = false;
  });
  b.creditCards.forEach(c => {
    if (typeof c.balance !== 'number') c.balance = 0;
    if (typeof c.limit !== 'number') c.limit = 10000;
    if (typeof c.autoPay !== 'boolean') c.autoPay = false;
    if (typeof c.lastPaymentYear !== 'number') c.lastPaymentYear = -1;
  });
  b.loans.forEach(l => {
    if (typeof l.remaining !== 'number') l.remaining = l.principal || 0;
    if (typeof l.missedPayments !== 'number') l.missedPayments = 0;
  });
}
GameHooks.on('newGame', ensureBankState);
GameHooks.on('migrate', ensureBankState);

/* ---------- FINANCIAL HELPER METRICS ---------- */
function bankGetMonthlyIncome() {
  let m = 0;
  if (S.job && S.job.salary) m += S.job.salary / 12;
  (S.ownedHomes || []).forEach(h => { if (h.status === 'rented' && h.monthlyRent) m += h.monthlyRent; });
  return Math.round(m);
}
function bankGetAnnualIncome() { return bankGetMonthlyIncome() * 12; }
function bankGetTotalDebt() {
  const b = S.bank || {};
  let d = 0;
  (b.creditCards || []).forEach(c => { d += c.balance || 0; });
  (b.loans || []).forEach(l => { d += l.remaining || 0; });
  (b.installments || []).forEach(i => { d += i.remaining || 0; });
  return Math.round(d);
}
function bankGetTotalObligationsMonthly() {
  const b = S.bank || {};
  let m = 0;
  (b.loans || []).forEach(l => { m += l.monthlyPayment || 0; });
  (b.installments || []).forEach(i => { m += i.monthlyPayment || 0; });
  (b.creditCards || []).forEach(c => { m += BankMath.cardMinPayment(c, c.balance); });
  return Math.round(m);
}
function bankGetTotalLiquidCash() {
  const b = S.bank || {};
  let s = S.wealth || 0;
  (b.accounts || []).forEach(a => { s += a.balance || 0; });
  return Math.round(s);
}
function bankGetTotalAssets() {
  let a = bankGetTotalLiquidCash();
  ((S.bank && S.bank.certificates) || []).forEach(c => { a += c.principal || 0; });
  ((S.bank && S.bank.investments) || []).forEach(i => { a += i.currentValue || 0; });
  if (S.bank && S.bank.pension && S.bank.pension.totalValue) a += S.bank.pension.totalValue;
  (S.ownedHomes || []).forEach(h => { a += h.value || 0; });
  ((S.bank && S.bank.gold) || []).forEach(g => {
    const prices = (typeof GOLD_PRICES !== 'undefined' ? GOLD_PRICES[S.country] : null) || GOLD_PRICES.egy;
    const perGram = g.karat === '24K' ? prices.perGram24K : g.karat === '21K' ? prices.perGram21K : prices.perGram18K;
    a += (g.grams * perGram);
  });
  return Math.round(a);
}

/* ---------- NEW: Available cash + smart spending helpers ---------- */
function bankAvailableCash() {
  return bankGetTotalLiquidCash();
}

function bankSpend(amount, description) {
  if (!S || !S.bank) return false;
  const b = S.bank;
  if (bankGetTotalLiquidCash() < amount) return false;

  // First resolve any overdraft from accounts
  if (S.wealth < 0) {
    let overdraft = -S.wealth;
    for (const acc of (b.accounts || [])) {
      if (overdraft <= 0) break;
      const pay = Math.min(acc.balance, overdraft);
      acc.balance -= pay;
      S.wealth += pay;
      overdraft -= pay;
    }
  }

  // Drain accounts first for the actual purchase
  let remaining = amount;
  for (const acc of (b.accounts || [])) {
    if (remaining <= 0) break;
    const pay = Math.min(acc.balance, remaining);
    acc.balance -= pay;
    remaining -= pay;
  }
  if (remaining > 0) S.wealth -= remaining;

  bankLogTransaction(description || 'Payment', amount, 'expense');
  return true;
}

function bankLogTransaction(desc, amount, type) {
  if (!S || !S.bank) return;
  if (!Array.isArray(S.bank.transactions)) S.bank.transactions = [];
  S.bank.transactions.unshift({ year: gameYear(), desc, amount, type: type || 'other' });
  S.bank.transactions = S.bank.transactions.slice(0, 50);
}

function bankGetMortgageQuote(principal, years) {
  ensureBankState();
  const product = (LOAN_PRODUCTS[S.country] || []).find(p => p.id === 'mortgage') || null;
  if (!product) return { approved: false, reason: 'No mortgage product in this country' };
  if (S.bank.score < product.reqScore) return { approved: false, reason: `Needs score ${product.reqScore}+` };
  if (bankGetAnnualIncome() < product.reqIncome) return { approved: false, reason: `Needs annual income ${product.reqIncome}+` };
  const monthly = BankMath.loanPayment(principal, product.rate, years);
  const dti = (bankGetTotalObligationsMonthly() + monthly) / Math.max(1, bankGetMonthlyIncome());
  if (dti > 0.45) return { approved: false, reason: `DTI would be ${Math.round(dti * 100)}% (max 45%)` };
  return { approved: true, rate: product.rate, monthly, dti };
}

function bankGetRetirementProjection() {
  const b = S.bank || {};
  const total = b.pension ? b.pension.totalValue : 0;
  const yearsTo60 = Math.max(0, 60 - S.age);
  const projected = total * Math.pow(1.07, yearsTo60);
  return { current: total, projectedAt60: Math.round(projected), yearsTo60 };
}

window.bankGetMonthlyIncome = bankGetMonthlyIncome;
window.bankGetTotalDebt = bankGetTotalDebt;
window.bankGetTotalLiquidCash = bankGetTotalLiquidCash;
window.bankGetTotalAssets = bankGetTotalAssets;
window.bankAvailableCash = bankAvailableCash;
window.bankSpend = bankSpend;
window.bankGetMortgageQuote = bankGetMortgageQuote;
window.bankGetRetirementProjection = bankGetRetirementProjection;

/* ---------- FINANCIAL HEALTH DASHBOARD ---------- */
function bankFinancialHealth() {
  const b = S.bank || {};
  const monthlyExp = (S.expenses || 0) / 12;
  const monthlyInc = bankGetMonthlyIncome();
  const liquid = bankGetTotalLiquidCash();
  const emergencyMonths = monthlyExp > 0 ? liquid / monthlyExp : (liquid > 0 ? 12 : 0);
  const dti = monthlyInc > 0 ? bankGetTotalObligationsMonthly() / monthlyInc : 0;

  const totalSaved = (b.certificates || []).reduce((s, c) => s + (c.principal || 0), 0);
  const totalInvested = (b.investments || []).reduce((s, i) => s + (i.currentValue || 0), 0);
  const goldValue = (b.gold || []).reduce((s, g) => {
    const prices = (typeof GOLD_PRICES !== 'undefined' ? GOLD_PRICES[S.country] : null) || GOLD_PRICES.egy;
    const perGram = g.karat === '24K' ? prices.perGram24K : g.karat === '21K' ? prices.perGram21K : prices.perGram18K;
    return s + (g.grams * perGram);
  }, 0);

  const totalAssets = bankGetTotalAssets();
  const totalDebt = bankGetTotalDebt();
  const netWorth = totalAssets - totalDebt;

  const savingsRate = monthlyInc > 0 ? Math.max(0, ((monthlyInc - monthlyExp - bankGetTotalObligationsMonthly()) / monthlyInc) * 100) : 0;
  const cardBal = (b.creditCards || []).reduce((s, c) => s + (c.balance || 0), 0);
  const cardLimit = (b.creditCards || []).reduce((s, c) => s + (c.limit || 0), 0);
  const util = cardLimit > 0 ? cardBal / cardLimit : 0;

  return {
    emergencyMonths,
    emergencyColor: emergencyMonths >= 6 ? '#34d399' : emergencyMonths >= 3 ? '#fbbf24' : '#fb7185',
    dti,
    dtiColor: dti >= 0.45 ? '#fb7185' : dti >= 0.30 ? '#fbbf24' : '#34d399',
    savingsRate,
    util,
    utilColor: util > 0.8 ? '#fb7185' : util > 0.3 ? '#fbbf24' : '#34d399',
    liquid, totalSaved, totalInvested, goldValue, totalAssets, totalDebt, netWorth,
  };
}

/* ---------- SCORE ENGINE ---------- */
function bankScoreChange(delta, reason) {
  if (!S.bank) return;
  const before = S.bank.score;
  S.bank.score = Math.max(300, Math.min(850, S.bank.score + delta));
  const actual = S.bank.score - before;
  if (Math.abs(actual) > 0) {
    S.bank.scoreHistory.unshift({ year: gameYear(), before, after: S.bank.score, delta: actual, reason });
    S.bank.scoreHistory = S.bank.scoreHistory.slice(0, 25);
    log(`Credit score ${actual > 0 ? '+' : ''}${actual} → ${S.bank.score}: ${reason}`);
  }
}

/* ---------- NEW: Net worth sparkline ---------- */
function bankRenderNetWorthChart() {
  const hist = (S.bank && S.bank.netWorthHistory) || [];
  if (hist.length < 2) return '';
  const values = hist.map(h => h.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const bars = '▁▂▃▄▅▆▇█';
  const spark = values.map(v => bars[Math.min(7, Math.floor(((v - min) / range) * 8))]).join('');
  const first = values[0];
  const last = values[values.length - 1];
  const pct = first !== 0 ? Math.round(((last - first) / Math.abs(first)) * 100) : 0;
  return `<div style="font-family:monospace;font-size:.9rem;color:${pct >= 0 ? '#34d399' : '#fb7185'};letter-spacing:1px;margin-top:4px">
    ${spark} <span style="font-size:.75rem">${pct >= 0 ? '+' : ''}${pct}% over ${hist.length} yr</span>
  </div>`;
}

/* ---------- PUBLIC API FOR EXTERNAL MODULES ---------- */
window.bankChargeCard = function(cardId, amount, description) {
  ensureBankState();
  const card = S.bank.creditCards.find(c => c.id === cardId);
  if (!card) return { ok: false, reason: 'Card not found' };
  if ((card.balance || 0) + amount > card.limit) {
    bankScoreChange(-2, 'Attempted over-limit transaction');
    return { ok: false, reason: 'Exceeds credit limit' };
  }
  card.balance = (card.balance || 0) + amount;
  if (card.cashbackRate > 0) S.bank.cashbackBal = (S.bank.cashbackBal || 0) + (amount * card.cashbackRate);
  bankLogTransaction(card.name + (description ? ' · ' + description : ''), amount, 'card');
  log(`💳 Charged ${money(amount)} to ${card.name}${description ? ' (' + description + ')' : ''}.`);
  return { ok: true };
};

window.bankPayBill = function(amount, description) {
  ensureBankState();
  if (bankGetTotalLiquidCash() < amount) return { ok: false, reason: 'Insufficient total funds' };
  bankSpend(amount, description || 'Bill');
  log(`🧾 Paid ${money(amount)} for ${description || 'bill'}.`);
  return { ok: true };
};

window.bankGetEmergencyMonths = function() {
  return bankFinancialHealth().emergencyMonths;
};

/* ---------- MAIN VIEW ROUTER ---------- */
function bankView() {
  ensureBankState();
  const tab = S.bank.bankTab;
  const tabs = [
    ['accounts', '🏦 Accounts'],
    ['certificates', '📜 Certs'],
    ['cards', '💳 Cards'],
    ['loans', '💰 Loans'],
    ['score', '📊 Score'],
    ['wealth', '📈 Wealth'],
    ['insurance', '🛡️ Insurance'],
    ['goals', '🎯 Goals'],
    ['transfer', '💸 Transfer'],
    ['pension', '🏛️ Pension'],
  ];

  const health = bankFinancialHealth();

  let html = `<div class="card" style="border-color:#3b82f6; background: linear-gradient(180deg, #1e3a8a20 0%, transparent 100%);">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin-bottom:2px;color:#60a5fa">Banking & Finance · ${C().name}</h3>
        <p class="muted small" style="margin:0">Net Worth: <b class="good">${money(health.netWorth)}</b></p>
        ${bankRenderNetWorthChart()}
      </div>
      <div style="text-align:right">
        <div class="muted small">FICO® Score</div>
        <div style="font-size:1.4rem;color:${BankMath.scoreCategory(S.bank.score).color};font-weight:bold;font-family:monospace">${S.bank.score}</div>
      </div>
    </div>

    <div style="margin-top:10px;padding:8px;background:#0a0a12;border-radius:6px;font-size:.78rem">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
        <div><span class="muted">Emergency:</span> <b style="color:${health.emergencyColor}">${health.emergencyMonths.toFixed(1)} mo</b></div>
        <div><span class="muted">DTI Ratio:</span> <b style="color:${health.dtiColor}">${Math.round(health.dti * 100)}%</b></div>
        <div><span class="muted">Savings rate:</span> <b style="color:${health.savingsRate >= 10 ? '#34d399' : '#fbbf24'}">${Math.round(health.savingsRate)}%</b></div>
        <div><span class="muted">Utilization:</span> <b style="color:${health.utilColor}">${Math.round(health.util * 100)}%</b></div>
      </div>
    </div>

    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:12px">
      ${tabs.map(([id, label]) => `<button class="pill ${tab === id ? 'on' : ''}" style="padding:6px 10px;font-size:.72rem;border-color:#3b82f640" onclick="S.bank.bankTab='${id}';render()">${label}</button>`).join('')}
    </div>
  </div>`;

  if (tab === 'accounts') html += bankAccountsSection();
  else if (tab === 'certificates') html += bankCertificatesSection();
  else if (tab === 'cards') html += bankCardsSection();
  else if (tab === 'loans') html += bankLoansSection();
  else if (tab === 'score') html += bankScoreSection();
  else if (tab === 'wealth') html += bankWealthSection();
  else if (tab === 'insurance') html += bankInsuranceSection();
  else if (tab === 'goals') html += bankGoalsSection();
  else if (tab === 'transfer') html += bankTransferSection();
  else if (tab === 'pension') html += bankPensionSection();
  return html;
}

/* ---------- 1. ACCOUNTS ---------- */
function bankAccountsSection() {
  const b = S.bank;
  const banksHere = BANKS[S.country] || [];

  let html = `<div class="card">
    <h3>Wealth Dashboard</h3>
    <div class="row"><span>Cash in Pocket (Unbanked)</span><b class="mono ${S.wealth < 0 ? 'bad' : 'good'}">${money(S.wealth)}</b></div>
    <div class="row"><span>Total Banked Cash</span><b class="mono good">${money(bankGetTotalLiquidCash() - S.wealth)}</b></div>
    <div class="row"><span>Total Debt (Cards + Loans)</span><b class="mono ${bankGetTotalDebt() > 0 ? 'bad' : 'muted'}">−${money(bankGetTotalDebt())}</b></div>
    <div class="row" style="border-top:1px solid #1a1a2a;padding-top:6px;margin-top:6px">
      <span>Monthly Income (DTI: ${Math.round((bankGetTotalObligationsMonthly() / Math.max(1, bankGetMonthlyIncome())) * 100)}%)</span>
      <b class="mono">${money(bankGetMonthlyIncome())}</b>
    </div>
    ${S.wealth < 0 ? `<div class="card" style="border-color:#fb7185;padding:8px;margin-top:8px">
      <b style="color:#fb7185;font-size:.85rem">⚠️ Overdraft Detected</b>
      <p class="muted small" style="margin:4px 0">You owe ${money(-S.wealth)} in pocket overdraft. You can clear it from bank accounts.</p>
      <button class="opt" style="padding:6px;font-size:.72rem;background:#fb7185;color:#fff;text-align:center" onclick="bankDoResolveOverdraft()">Resolve overdraft from accounts</button>
    </div>` : ''}
  </div>`;

  html += `<div class="card"><h3>Your Active Accounts (${b.accounts.length})</h3>`;
  if (!b.accounts.length) {
    html += `<p class="muted small">No active bank accounts.</p>`;
  } else {
    b.accounts.forEach((acc, i) => {
      const bankDef = banksHere.find(x => x.id === acc.bankId) || { shortName: 'Bank', savingsRate: 0 };
      html += `<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between">
          <b>${bankDef.shortName} ${acc.type.charAt(0).toUpperCase() + acc.type.slice(1)}</b>
          <b class="mono good">${money(acc.balance)}</b>
        </div>
        <div class="muted small">Interest: ${(bankDef.savingsRate * 100).toFixed(2)}% APY</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
          <button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="bankDoDepositAcc(${i})">Deposit</button>
          <button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="bankDoWithdrawAcc(${i})">Withdraw</button>
          <button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="bankDoQuickDeposit()">+ Quick 5k</button>
          <button class="opt" style="flex:1;padding:6px;font-size:.72rem;border-color:#34d399;color:#34d399" onclick="bankDoSweepCash()">Sweep all cash</button>
        </div>
      </div>`;
    });
  }
  html += `</div>`;

  html += `<div class="card"><h3>Financial Institutions</h3>`;
  banksHere.forEach(bank => {
    const hasAccount = b.accounts.some(a => a.bankId === bank.id);
    html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
      <div style="display:flex;justify-content:space-between">
        <b>${bank.name}</b><b class="mono small good">${(bank.savingsRate * 100).toFixed(2)}% Yield</b>
      </div>
      <div class="muted small">Type: ${bank.type.toUpperCase()} · Rep: ${'⭐'.repeat(bank.reputation)}</div>
      ${hasAccount ? `<div class="muted small good" style="margin-top:4px">✓ Customer</div>` : `<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" onclick="bankDoOpenAccount('${bank.id}')">Open Account</button>`}
    </div>`;
  });
  html += `</div>`;

  if (b.transactions && b.transactions.length > 0) {
    html += `<div class="card"><h3>Recent Transactions</h3>`;
    b.transactions.slice(0, 15).forEach(t => {
      const color = t.type === 'expense' || t.type === 'card' ? 'var(--rose)' : 'var(--mint)';
      html += `<div class="row" style="padding:4px 0;font-size:.78rem">
        <span>${t.year} · ${t.desc}</span>
        <b class="mono" style="color:${color}">${money(t.amount)}</b>
      </div>`;
    });
    html += `</div>`;
  }

  return html;
}

window.bankDoResolveOverdraft = function() {
  if (!S.bank || S.wealth >= 0) return;
  const b = S.bank;
  const overdraft = -S.wealth;
  const totalInAccounts = (b.accounts || []).reduce((s, a) => s + a.balance, 0);
  if (totalInAccounts <= 0) {
    log(`No bank accounts with funds. Consider taking a small personal loan to cover ${money(overdraft)}.`);
    render();
    return;
  }
  if (!confirm(`Move ${money(Math.min(overdraft, totalInAccounts))} from accounts to clear overdraft?`)) return;
  let remaining = overdraft;
  for (const acc of (b.accounts || [])) {
    if (remaining <= 0) break;
    const pay = Math.min(acc.balance, remaining);
    acc.balance -= pay;
    S.wealth += pay;
    remaining -= pay;
  }
  if (S.wealth >= 0) log(`✅ Overdraft fully resolved. Pocket: ${money(S.wealth)}.`);
  else log(`Partially cleared. Remaining overdraft: ${money(-S.wealth)}.`);
  render();
};

window.bankDoOpenAccount = function(bankId) {
  const bank = (BANKS[S.country] || []).find(b => b.id === bankId);
  if (S.wealth < 500) { log(`Need at least ${money(500)} in pocket cash.`); render(); return; }
  S.wealth -= 500;
  S.bank.accounts.push({ id: 'acc_' + Math.random().toString(36).slice(2, 10), bankId: bank.id, type: 'savings', balance: 500, openedYear: gameYear() });
  bankLogTransaction('Opened account at ' + bank.shortName, 500, 'transfer');
  log(`Opened account at ${bank.shortName} with ${money(500)}.`);
  render();
};
window.bankDoDepositAcc = function(idx) {
  const acc = S.bank.accounts[idx];
  const input = prompt(`Deposit cash into ${acc.bankId}?\n(Pocket Cash: ${money(S.wealth)})`, '1000');
  if (!input) return;
  const amt = Math.round(Number(input));
  if (amt <= 0 || S.wealth < amt) return;
  S.wealth -= amt; acc.balance += amt;
  bankLogTransaction('Deposit to ' + acc.bankId, amt, 'transfer');
  render();
};
window.bankDoWithdrawAcc = function(idx) {
  const acc = S.bank.accounts[idx];
  const input = prompt(`Withdraw cash from ${acc.bankId}?\n(Balance: ${money(acc.balance)})`, '1000');
  if (!input) return;
  const amt = Math.round(Number(input));
  if (amt <= 0 || acc.balance < amt) return;
  acc.balance -= amt; S.wealth += amt;
  bankLogTransaction('Withdraw from ' + acc.bankId, amt, 'transfer');
  render();
};
window.bankDoQuickDeposit = function() {
  if (!S.bank.accounts.length) { log('Open an account first.'); render(); return; }
  const acc = S.bank.accounts[0];
  const amt = Math.min(S.wealth, 5000);
  if (amt <= 0) return;
  S.wealth -= amt; acc.balance += amt;
  log(`Quick deposit: ${money(amt)} to ${acc.bankId}.`);
  render();
};
window.bankDoSweepCash = function() {
  if (!S.bank.accounts.length) return;
  if (S.wealth === 0) return;
  const acc = S.bank.accounts[0];
  if (S.wealth > 0) {
    const amt = S.wealth;
    S.wealth = 0; acc.balance += amt;
    bankLogTransaction('Cash sweep to ' + acc.bankId, amt, 'transfer');
    log(`Swept ${money(amt)} cash into ${acc.bankId}.`);
  } else {
    const overdraft = -S.wealth;
    const pay = Math.min(acc.balance, overdraft);
    if (pay <= 0) { log('Account has no balance to clear overdraft.'); render(); return; }
    acc.balance -= pay;
    S.wealth += pay;
    bankLogTransaction('Overdraft clearance from ' + acc.bankId, pay, 'transfer');
    if (S.wealth >= 0) log(`✅ Fully cleared ${money(overdraft)} overdraft.`);
    else log(`Partially cleared ${money(pay)} of ${money(overdraft)} overdraft.`);
  }
  render();
};

/* ---------- 2. CERTIFICATES ---------- */
function bankCertificatesSection() {
  const b = S.bank;
  const available = CERTIFICATES[S.country] || [];

  let html = `<div class="card"><h3>Your Active Certificates (${b.certificates.length})</h3>`;
  if (!b.certificates.length) html += `<p class="muted small">Lock in your savings for guaranteed high-yield returns.</p>`;
  else {
    b.certificates.forEach((c, i) => {
      const rate = c.rates[Math.min(c.yearsHeld, c.rates.length - 1)] || 0;
      const progress = Math.round((c.yearsHeld / c.term) * 100);
      html += `<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between">
          <b>${c.name}</b><b class="mono good">${money(c.principal)}</b>
        </div>
        <div class="muted small">${(rate * 100).toFixed(2)}% APY · Maturity: Year ${c.yearsHeld} of ${c.term} · Paid: ${money(c.totalInterestPaid)}</div>
        <div style="height:4px;background:#1a1a2a;border-radius:2px;margin:6px 0"><div style="height:100%;width:${progress}%;background:#34d399;border-radius:2px"></div></div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button class="opt" style="flex:1;padding:4px;font-size:.7rem" onclick="bankToggleCertAutoRenew(${i})">Auto-Renew: ${c.autoRenew ? 'ON' : 'OFF'}</button>
          <button class="opt" style="flex:1;padding:4px;font-size:.7rem;border-color:#fb7185;color:#fb7185" onclick="bankDoRedeemCert('${c.id}')">Break Early (-${(c.earlyPenalty * 100).toFixed(1)}%)</button>
        </div>
      </div>`;
    });
  }
  html += `</div>`;

  html += `<div class="card"><h3>Available Market Certificates</h3>`;
  available.forEach(c => {
    const isCustomer = b.accounts.some(a => a.bankId === c.bankId);
    const maxRate = Math.max(...c.rates);
    const canAfford = bankGetTotalLiquidCash() >= c.minAmount;
    html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a; opacity:${isCustomer ? 1 : 0.6}">
      <div style="display:flex;justify-content:space-between"><b>${c.name}</b><b class="mono good">${(maxRate * 100).toFixed(2)}%</b></div>
      <div class="muted small">${c.term}-Year Term · Min Deposit: ${money(c.minAmount)} · Pays ${c.payout}</div>
      ${!isCustomer ? `<div class="muted small bad" style="margin-top:4px">Requires account at this bank</div>` :
        `<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" ${canAfford ? '' : 'disabled'} onclick="bankDoBuyCert('${c.id}')">${canAfford ? 'Purchase CD' : 'Insufficient Cash'}</button>`}
    </div>`;
  });
  html += `</div>`;
  return html;
}

window.bankToggleCertAutoRenew = function(idx) { S.bank.certificates[idx].autoRenew = !S.bank.certificates[idx].autoRenew; render(); };
window.bankDoBuyCert = function(certId) {
  const cert = (CERTIFICATES[S.country] || []).find(c => c.id === certId);
  const amt = Math.round(Number(prompt(`Invest amount?\n(Min ${money(cert.minAmount)}, Available: ${money(bankGetTotalLiquidCash())})`, String(cert.minAmount))));
  if (amt < cert.minAmount) return;
  if (!bankSpend(amt, 'CD: ' + cert.name)) { log('Insufficient funds across accounts.'); return; }
  S.bank.certificates.push({
    id: 'cert_' + Math.random().toString(36).slice(2), bankId: cert.bankId, certId: cert.id, name: cert.name, principal: amt, term: cert.term,
    rates: cert.rates.slice(), payout: cert.payout, earlyPenalty: cert.earlyPenalty, yearsHeld: 0, totalInterestPaid: 0, startYear: gameYear(), autoRenew: false
  });
  render();
};
window.bankDoRedeemCert = function(certId) {
  const idx = S.bank.certificates.findIndex(c => c.id === certId);
  const c = S.bank.certificates[idx];
  const penalty = Math.round(c.principal * c.earlyPenalty);
  const proceeds = c.principal - penalty;
  if (!confirm(`Break certificate early?\nPenalty: ${money(penalty)}\nReturns to cash: ${money(proceeds)}`)) return;
  S.wealth += proceeds;
  S.bank.certificates.splice(idx, 1);
  bankLogTransaction('Broke CD: ' + c.name, proceeds, 'income');
  render();
};

/* ---------- 3. CREDIT CARDS ---------- */
function bankCardsSection() {
  const b = S.bank;
  const available = CREDIT_CARDS[S.country] || [];

  let html = `<div class="card"><div style="display:flex;justify-content:space-between;align-items:center">
    <h3>Your Credit Cards (${b.creditCards.length})</h3>
    ${b.cashbackBal > 0 ? `<button class="pill" style="padding:4px 8px;font-size:.7rem;border-color:#fbbf24;color:#fbbf24" onclick="bankRedeemCashback()">Redeem ${money(b.cashbackBal)}</button>` : ''}
  </div></div>`;

  b.creditCards.forEach(c => {
    const util = c.limit > 0 ? Math.round((c.balance / c.limit) * 100) : 0;
    const utilColor = util > 80 ? '#fb7185' : util > 30 ? '#fbbf24' : '#34d399';
    const min = BankMath.cardMinPayment(c, c.balance);
    html += `<div class="card" style="border-left:4px solid ${utilColor}">
      <div style="display:flex;justify-content:space-between"><b>${c.name}</b><b class="mono ${c.balance > 0 ? 'bad' : 'good'}">${money(c.balance)}</b></div>
      <div class="muted small">Limit: ${money(c.limit)} · APR: ${(c.apr * 100).toFixed(1)}% · Util: <span style="color:${utilColor}">${util}%</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
        <button class="opt" style="flex:1;font-size:.72rem;padding:6px;${c.balance === 0 ? 'opacity:.5' : ''}" ${c.balance === 0 ? 'disabled' : ''} onclick="bankDoPayCard('${c.id}','full')">Pay Full</button>
        <button class="opt" style="flex:1;font-size:.72rem;padding:6px;${c.balance === 0 ? 'opacity:.5' : ''}" ${c.balance === 0 ? 'disabled' : ''} onclick="bankDoPayCard('${c.id}','min')">Pay Min (${money(min)})</button>
        <button class="opt" style="flex:1;font-size:.72rem;padding:6px;${c.autoPay ? 'background:#34d39920;border-color:#34d399;color:#34d399' : ''}" onclick="bankToggleAutoPay('${c.id}')">Auto-Pay: ${c.autoPay ? 'ON' : 'OFF'}</button>
        <button class="opt" style="flex:1;font-size:.72rem;padding:6px" onclick="bankReqLimitInc('${c.id}')">Req. Increase</button>
      </div>
    </div>`;
  });

  html += `<div class="card"><h3>Card Offers</h3><p class="muted small">Applying causes a Hard Inquiry (-5 points for 1 year).</p>`;
  available.forEach(card => {
    const owned = b.creditCards.some(c => c.cardId === card.id);
    const scoreOK = b.score >= card.reqScore;
    const incomeOK = bankGetAnnualIncome() >= card.reqIncome;
    const blocked = !scoreOK || !incomeOK;
    const reason = !scoreOK ? `Needs Score ${card.reqScore}` : !incomeOK ? `Needs Income ${money(card.reqIncome)}/yr` : '';
    html += `<div style="padding:10px 0;border-bottom:1px solid #1a1a2a; opacity:${owned ? 0.5 : 1}">
      <div style="display:flex;justify-content:space-between"><b>${card.name}</b><b class="mono good">${(card.cashbackRate * 100).toFixed(1)}% CB</b></div>
      <div class="muted small">Limits: ${money(card.minLimit)} - ${money(card.maxLimit)} · ${card.tier.toUpperCase()} Tier</div>
      <div class="muted small" style="color:#8b5cf6">${card.perks.join(' · ')}</div>
      ${owned ? `<div class="muted small good" style="margin-top:4px">✓ In Wallet</div>` : blocked ? `<div class="muted small bad" style="margin-top:4px">Denied: ${reason}</div>` : `<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" onclick="bankDoApplyCard('${card.id}')">Apply Now (Hard Pull)</button>`}
    </div>`;
  });
  html += `</div>`;
  return html;
}
window.bankRedeemCashback = function() {
  if (S.bank.cashbackBal <= 0) return;
  S.wealth += S.bank.cashbackBal;
  log(`Redeemed ${money(S.bank.cashbackBal)} in rewards to cash!`);
  S.bank.cashbackBal = 0;
  render();
};
window.bankToggleAutoPay = function(cardId) { const card = S.bank.creditCards.find(c => c.id === cardId); card.autoPay = !card.autoPay; render(); };
window.bankReqLimitInc = function(cardId) {
  const card = S.bank.creditCards.find(c => c.id === cardId);
  const def = (CREDIT_CARDS[S.country] || []).find(c => c.id === card.cardId);
  S.bank.hardInquiries++;
  bankScoreChange(-3, 'Hard Inquiry');
  const newLimit = BankMath.creditLimit(bankGetAnnualIncome(), S.bank.score, def);
  if (newLimit > card.limit) { card.limit = newLimit; bankScoreChange(5, 'Credit limit increased'); log(`✅ Limit increased to ${money(newLimit)}.`); }
  else log(`❌ Limit increase denied.`);
  render();
};
window.bankDoApplyCard = function(cardId) {
  const card = (CREDIT_CARDS[S.country] || []).find(c => c.id === cardId);
  S.bank.hardInquiries++;
  bankScoreChange(-5, 'Hard Inquiry');
  const limit = BankMath.creditLimit(bankGetAnnualIncome(), S.bank.score, card);
  S.bank.creditCards.push({ id: 'card_' + Math.random().toString(36).slice(2), cardId: card.id, name: card.name, limit, balance: 0, apr: card.apr, minPaymentPct: card.minPaymentPct, cashbackRate: card.cashbackRate, openedYear: gameYear(), lastPaymentYear: -1, autoPay: false });
  bankScoreChange(10, 'New credit account added');
  log(`✅ Approved: ${card.name} · ${money(limit)} limit.`);
  render();
};
window.bankDoPayCard = function(cardId, mode) {
  const card = S.bank.creditCards.find(c => c.id === cardId);
  const pay = mode === 'full' ? card.balance : BankMath.cardMinPayment(card, card.balance);
  if (!bankSpend(pay, 'Card payment: ' + card.name)) { log(`Not enough total funds for ${money(pay)}.`); render(); return; }
  card.balance = Math.max(0, card.balance - pay);
  card.lastPaymentYear = gameYear();
  if (card.balance === 0) bankScoreChange(4, 'Card balance cleared');
  else bankScoreChange(2, 'Card payment made');
  log(`Paid ${money(pay)} to ${card.name}. Remaining: ${money(card.balance)}.`);
  render();
};

/* ---------- 4. LOANS & CONSOLIDATION ---------- */
function bankLoansSection() {
  const b = S.bank;
  const products = LOAN_PRODUCTS[S.country] || [];

  let html = `<div class="card"><h3>Active Debt Obligations (${b.loans.length})</h3>`;
  if (!b.loans.length) html += `<p class="muted small">No active loans.</p>`;
  b.loans.forEach(l => {
    const pct = Math.round(((l.principal - l.remaining) / l.principal) * 100);
    const annualInterest = l.remaining * l.rate;
    html += `<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">
      <div style="display:flex;justify-content:space-between"><b>${l.name}</b><b class="mono bad">${money(l.remaining)}</b></div>
      <div class="muted small">Original: ${money(l.principal)} · ${(l.rate * 100).toFixed(2)}% Fixed · ${l.monthsLeft}mo remaining</div>
      <div class="muted small">Monthly P&I Payment: <b>${money(l.monthlyPayment)}</b></div>
      <div class="muted small">This year: ${money(annualInterest)} interest · ${money(l.monthlyPayment * 12 - annualInterest)} principal</div>
      <div style="height:4px;background:#1a1a2a;border-radius:2px;margin:6px 0"><div style="height:100%;width:${pct}%;background:#3b82f6;border-radius:2px"></div></div>
      <button class="opt" style="margin-top:6px;padding:6px;font-size:.72rem" ${bankGetTotalLiquidCash() < l.remaining ? 'disabled' : ''} onclick="bankDoPayoffLoan('${l.id}')">Payoff Entire Balance (${money(l.remaining)})</button>
    </div>`;
  });
  html += `</div>`;

  html += `<div class="card"><h3>Lending Center</h3>`;
  products.forEach(p => {
    const scoreOK = b.score >= p.reqScore;
    const incomeOK = bankGetMonthlyIncome() >= p.reqIncome;
    const reason = !scoreOK ? `Score ${p.reqScore}+` : !incomeOK ? `Income ${money(p.reqIncome)}+/mo` : '';
    html += `<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">
      <div style="display:flex;justify-content:space-between"><b>${p.name}</b><b class="mono good">${(p.rate * 100).toFixed(2)}%</b></div>
      <div class="muted small">Limits: ${money(p.minAmount)} - ${money(p.maxAmount)} · Terms: ${p.minTerm}-${p.maxTerm} Yrs</div>
      ${(!scoreOK || !incomeOK) ? `<div class="muted small bad" style="margin-top:4px">Requires: ${reason}</div>` :
        p.requiresProperty ? `<div class="muted small" style="margin-top:4px">Applied at time of property purchase</div>` :
          p.requiresCar ? `<div class="muted small" style="margin-top:4px">Applied at dealership</div>` :
            `<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" onclick="bankDoTakeLoan('${p.id}')">Apply Now</button>`}
    </div>`;
  });
  html += `</div>`;

  const totalDebt = bankGetTotalDebt();
  if (totalDebt > 5000) {
    html += `<div class="card" style="border-color:#8b5cf6">
      <h3>💡 Debt Consolidation</h3>
      <p class="muted small">Combine all cards + loans into one lower-APR loan.</p>
      <div class="row"><span>Total debt</span><b class="mono bad">${money(totalDebt)}</b></div>
      <div class="row"><span>Monthly obligations</span><b class="mono">${money(bankGetTotalObligationsMonthly())}</b></div>
      <button class="opt" style="margin-top:8px;text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="bankDoConsolidateDebt()">Consolidate into one loan</button>
    </div>`;
  }
  return html;
}
window.bankDoTakeLoan = function(loanType) {
  const p = (LOAN_PRODUCTS[S.country] || []).find(x => x.id === loanType);
  S.bank.hardInquiries++;
  bankScoreChange(-5, 'Hard Inquiry');
  const amt = Math.round(Number(prompt(`Requested Amount?\n(Limits: ${money(p.minAmount)} - ${money(p.maxAmount)})`, String(p.minAmount))));
  if (amt < p.minAmount || amt > p.maxAmount) return;
  const yrs = Math.round(Number(prompt(`Term Length (Years)?\n(${p.minTerm} - ${p.maxTerm} Yrs)`, String(p.minTerm))));
  if (yrs < p.minTerm || yrs > p.maxTerm) return;
  const monthly = BankMath.loanPayment(amt, p.rate, yrs);
  if ((bankGetTotalObligationsMonthly() + monthly) / Math.max(1, bankGetMonthlyIncome()) > 0.45) { log('❌ Loan Denied: DTI > 45%.'); render(); return; }
  if (!confirm(`Review Disclosure:\n\nPrincipal: ${money(amt)}\nRate: ${(p.rate * 100).toFixed(2)}%\nTerm: ${yrs} Yrs\nMonthly P&I: ${money(monthly)}\nTotal Interest: ${money(BankMath.loanTotalInterest(amt, p.rate, yrs))}\n\nSign Agreement?`)) return;
  S.wealth += amt;
  S.bank.loans.push({ id: 'loan_' + Math.random().toString(36).slice(2), loanType: p.id, name: p.name, principal: amt, remaining: amt, rate: p.rate, monthsLeft: yrs * 12, monthsTotal: yrs * 12, monthlyPayment: monthly, startYear: gameYear(), missedPayments: 0 });
  bankScoreChange(-10, 'New debt obligation');
  bankLogTransaction('Loan proceeds: ' + p.name, amt, 'income');
  log(`✅ Funded: ${money(amt)} for ${p.name}.`);
  render();
};
window.bankDoPayoffLoan = function(loanId) {
  const idx = S.bank.loans.findIndex(l => l.id === loanId);
  const loan = S.bank.loans[idx];
  if (!bankSpend(loan.remaining, 'Loan payoff: ' + loan.name)) { log(`Not enough total funds.`); render(); return; }
  S.bank.loans.splice(idx, 1);
  bankScoreChange(15, 'Loan paid in full successfully');
  log(`✅ ${loan.name} paid off.`);
  render();
};
window.bankDoConsolidateDebt = function() {
  const b = S.bank;
  const total = bankGetTotalDebt();
  const income = bankGetMonthlyIncome();
  if (income < 10000) { log('Income too low to qualify for a consolidation loan.'); render(); return; }
  const rate = 0.18; const years = 5;
  const monthly = BankMath.loanPayment(total, rate, years);
  if (monthly > income * 0.40) { log(`Consolidation payment ${money(monthly)}/mo exceeds 40% of income.`); render(); return; }
  if (!confirm(`Consolidate ALL debt?\nTotal: ${money(total)}\nNew loan: ${(rate * 100).toFixed(1)}% APR over ${years} years\nMonthly: ${money(monthly)}`)) return;
  b.creditCards.forEach(c => { c.balance = 0; });
  b.loans = [];
  b.loans.push({ id: 'consol_' + Math.random().toString(36).slice(2), loanType: 'consolidation', name: 'Debt Consolidation Loan', principal: total, remaining: total, rate: rate, monthsLeft: years * 12, monthsTotal: years * 12, monthlyPayment: monthly, startYear: gameYear(), missedPayments: 0 });
  bankScoreChange(10, 'Debt consolidated');
  log(`✅ Consolidated ${money(total)} of debt into one ${years}-year loan.`);
  render();
};

/* ---------- 5. SCORE & SIMULATOR ---------- */
function bankScoreSection() {
  const b = S.bank;
  const cat = BankMath.scoreCategory(b.score);
  const util = b.creditCards.reduce((s, c) => s + c.limit, 0) > 0 ? (b.creditCards.reduce((s, c) => s + c.balance, 0) / b.creditCards.reduce((s, c) => s + c.limit, 0)) : 0;
  const accAge = gameYear() - b.accountOpenedYear;

  let html = `<div class="card" style="text-align:center;padding:24px 0">
    <div style="font-size:3.5rem;font-weight:bold;color:${cat.color};font-family:monospace;line-height:1">${b.score}</div>
    <div style="font-size:1.2rem;color:${cat.color};font-weight:600;margin-bottom:12px">${cat.label}</div>
    <div style="height:8px;background:#1a1a2a;border-radius:4px;overflow:hidden;width:80%;margin:0 auto">
      <div style="height:100%;width:${((b.score - 300) / 550) * 100}%;background:${cat.color}"></div>
    </div>
  </div>`;

  html += `<div class="card"><h3>Credit Profile Factors</h3>
    <div class="row"><span>Payment History (35%)</span><b class="${b.missedPayments > 0 ? 'bad' : 'good'}">${b.missedPayments === 0 ? 'Exceptional' : b.missedPayments + ' Missed'}</b></div>
    <div class="row"><span>Credit Utilization (30%)</span><b style="color:${util > 0.8 ? '#fb7185' : util > 0.3 ? '#fbbf24' : '#34d399'}">${Math.round(util * 100)}%</b></div>
    <div class="row"><span>Age of Credit (15%)</span><b class="${accAge > 5 ? 'good' : 'muted'}">${accAge} Years</b></div>
    <div class="row"><span>Total Accounts (10%)</span><b>${b.creditCards.length + b.loans.length}</b></div>
    <div class="row"><span>Hard Inquiries (10%)</span><b class="${b.hardInquiries > 2 ? 'bad' : 'muted'}">${b.hardInquiries} (Last 12mo)</b></div>
  </div>`;

  if (b.scoreHistory.length) {
    html += `<div class="card"><h3>Score History</h3>
      ${b.scoreHistory.slice(0, 8).map(h => `<div class="row" style="padding:4px 0"><span class="small">${h.year} ·${h.reason}</span><b class="mono small ${h.delta > 0 ? 'good' : 'bad'}">${h.delta > 0 ? '+' : ''}${h.delta}</b></div>`).join('')}
    </div>`;
  }

  if (b.milestones && b.milestones.length > 0) {
    html += `<div class="card" style="border-color:#fbbf24">
      <h3>🏆 Milestones Achieved</h3>
      ${b.milestones.map(m => `<div class="row" style="padding:4px 0">
        <span style="color:#fbbf24">✓ ${m.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
      </div>`).join('')}
    </div>`;
  }

  html += `<div class="card" style="border-color:#22d3ee">
    <h3>🔮 Credit Score Simulator</h3>
    <p class="muted small">See what happens if you pay off debt, avoid missed payments, or wait for inquiries to age off.</p>
    <button class="opt" style="text-align:center;background:#22d3ee;color:#000;font-weight:700" onclick="bankSimulateScore()">Show projected score</button>
  </div>`;

  return html;
}

window.bankSimulateScore = function() {
  const b = S.bank;
  const current = b.score;
  const cardBal = (b.creditCards || []).reduce((s, c) => s + (c.balance || 0), 0);
  const cardLim = (b.creditCards || []).reduce((s, c) => s + (c.limit || 0), 0);
  const util = cardLim > 0 ? cardBal / cardLim : 0;
  let projected = current;
  const actions = [];
  if (util > 0.3) {
    const newUtil = Math.max(0, util - 0.3);
    projected += Math.round(newUtil * 100);
    actions.push(`Pay down cards to 30% utilization: +${Math.round(newUtil * 100)} pts`);
  }
  if (b.missedPayments > 0) {
    const cleanYears = 2;
    projected += cleanYears * 15;
    actions.push(`No missed payments for ${cleanYears} years: +${cleanYears * 15} pts`);
  }
  if (b.hardInquiries > 0) {
    projected += b.hardInquiries * 3;
    actions.push(`Wait for ${b.hardInquiries} inquiries to age off: +${b.hardInquiries * 3} pts`);
  }
  const newScore = Math.min(850, projected);
  const cat = BankMath.scoreCategory(newScore);
  const currentCat = BankMath.scoreCategory(current);

  const modal = document.createElement('div');
  modal.className = 'p24-modal-backdrop';
  modal.id = 'bank-sim-modal';
  modal.innerHTML = `<div class="p24-modal" style="max-width:420px">
    <h2 style="color:#22d3ee;margin-bottom:10px">Credit Score Simulator</h2>
    <div class="row" style="margin-top:10px"><span>Current score</span><b class="mono">${current} (${currentCat.label})</b></div>
    <div class="row"><span>Projected score</span><b class="mono" style="color:${cat.color}">${newScore} (${cat.label})</b></div>
    <h3 style="margin-top:14px;font-size:.9rem;border-bottom:1px solid #25253a;padding-bottom:4px">What would help:</h3>
    ${actions.length ? actions.map(a => `<div class="row" style="padding:8px 0;font-size:.82rem"><span>${a.split(':')[0]}</span><b>${a.split(':')[1]}</b></div>`).join('') : '<p class="muted small" style="margin-top:10px">Your score is highly optimized. Keep paying on time!</p>'}
    <button class="opt" style="margin-top:14px;text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="document.getElementById('bank-sim-modal').remove()">Close</button>
  </div>`;
  document.body.appendChild(modal);
};

/* ---------- 6. WEALTH & INVESTMENTS ---------- */
function bankWealthSection() {
  const b = S.bank;
  const investments = (typeof INVESTMENT_PRODUCTS !== 'undefined' ? INVESTMENT_PRODUCTS[S.country] : []) || [];
  const bonds = (typeof GOV_BONDS !== 'undefined' ? GOV_BONDS[S.country] : []) || [];
  const goldPrices = (typeof GOLD_PRICES !== 'undefined' ? GOLD_PRICES[S.country] : null) || { perGram24K: 4200, perGram21K: 3700, perGram18K: 3200, dealerSpread: 0.02 };
  const liquid = bankGetTotalLiquidCash();

  let html = `<div class="card"><h3>Your Portfolio</h3>`;
  if (b.investments.length > 0) {
    html += `<h4 style="font-size:.85rem;color:#8b5cf6;margin-top:10px">Investments</h4>`;
    b.investments.forEach((inv, i) => {
      const gain = inv.currentValue - inv.principal;
      const pct = inv.principal > 0 ? Math.round((gain / inv.principal) * 100) : 0;
      const matStr = inv.maturityYear ? ` · Matures ${inv.maturityYear}` : '';
      html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between"><b>${inv.name}</b><b class="mono ${gain >= 0 ? 'good' : 'bad'}">${money(inv.currentValue)}</b></div>
        <div class="muted small">Invested: ${money(inv.principal)} · ${gain >= 0 ? '+' : ''}${pct}%${matStr}</div>
        <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.7rem" onclick="bankDoSellInvestment(${i})">Sell</button>
      </div>`;
    });
  }
  if (b.gold.length > 0) {
    html += `<h4 style="font-size:.85rem;color:#fbbf24;margin-top:12px">Gold Holdings</h4>`;
    b.gold.forEach((g, i) => {
      const perGram = g.karat === '24K' ? goldPrices.perGram24K : g.karat === '21K' ? goldPrices.perGram21K : goldPrices.perGram18K;
      const currentVal = g.grams * perGram;
      const gain = currentVal - g.purchaseValue;
      html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between"><b>${g.grams}g ${g.karat} gold</b><b class="mono good">${money(currentVal)}</b></div>
        <div class="muted small">Bought ${money(g.purchaseValue)} · ${gain >= 0 ? '+' : ''}${Math.round((gain / Math.max(1, g.purchaseValue)) * 100)}%</div>
        <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.7rem" onclick="bankDoSellGold(${i})">Sell</button>
      </div>`;
    });
  }
  if (b.investments.length === 0 && b.gold.length === 0) html += `<p class="muted small" style="margin-top:8px">No investments yet. Buy below to grow your wealth.</p>`;
  html += `</div>`;

  html += `<div class="card"><h3>Investments & Funds</h3>`;
  investments.forEach(inv => {
    const canAfford = liquid >= inv.minInvestment;
    html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
      <div style="display:flex;justify-content:space-between"><b>${inv.name}</b><b class="mono good">${(inv.expectedReturn * 100).toFixed(1)}%</b></div>
      <div class="muted small">${inv.provider} · ${inv.risk.toUpperCase()} risk · Min ${money(inv.minInvestment)}</div>
      <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" ${canAfford ? '' : 'disabled'} onclick="bankDoBuyInvestment('${inv.id}')">${canAfford ? 'Invest' : 'Insufficient funds'}</button>
    </div>`;
  });
  html += `</div>`;

  html += `<div class="card"><h3>Government Bonds</h3>`;
  bonds.forEach(bond => {
    const canAfford = liquid >= bond.minAmount;
    html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
      <div style="display:flex;justify-content:space-between"><b>${bond.name}</b><b class="mono good">${(bond.yield * 100).toFixed(2)}%</b></div>
      <div class="muted small">Term: ${bond.termDays} days · Min ${money(bond.minAmount)}</div>
      <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" ${canAfford ? '' : 'disabled'} onclick="bankDoBuyBond('${bond.id}')">${canAfford ? 'Buy' : 'Insufficient funds'}</button>
    </div>`;
  });
  html += `</div>`;

  html += `<div class="card"><h3>🪙 Gold & Precious Metals</h3>
    <div class="row"><span>24K price</span><b class="mono gold">${goldPrices.perGram24K.toLocaleString()} ${C().currency}/g</b></div>
    <div class="row"><span>21K price</span><b class="mono gold">${goldPrices.perGram21K.toLocaleString()} ${C().currency}/g</b></div>
    <div class="row"><span>18K price</span><b class="mono gold">${goldPrices.perGram18K.toLocaleString()} ${C().currency}/g</b></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:10px">
      <button class="opt" style="margin:0;text-align:center;padding:8px;font-size:.72rem" onclick="bankDoBuyGold('24K')">Buy 24K</button>
      <button class="opt" style="margin:0;text-align:center;padding:8px;font-size:.72rem" onclick="bankDoBuyGold('21K')">Buy 21K</button>
      <button class="opt" style="margin:0;text-align:center;padding:8px;font-size:.72rem" onclick="bankDoBuyGold('18K')">Buy 18K</button>
    </div>
  </div>`;
  return html;
}

window.bankDoBuyInvestment = function(invId) {
  const prod = INVESTMENT_PRODUCTS[S.country].find(x => x.id === invId);
  const amt = Math.round(Number(prompt(`Invest amount?\n(Min ${money(prod.minInvestment)}, Available: ${money(bankGetTotalLiquidCash())})`, String(prod.minInvestment))));
  if (amt < prod.minInvestment) return;
  if (!bankSpend(amt, 'Invest: ' + prod.name)) { log('Insufficient total funds.'); return; }
  S.bank.investments.push({ id: 'inv_' + Math.random().toString(36).slice(2), productId: prod.id, name: prod.name, provider: prod.provider, principal: amt, currentValue: amt, expectedReturn: prod.expectedReturn, volatility: prod.volatility, startYear: gameYear() });
  render();
};
window.bankDoSellInvestment = function(idx) {
  const inv = S.bank.investments[idx];
  if (!confirm(`Sell ${inv.name} for ${money(inv.currentValue)}?`)) return;
  S.wealth += inv.currentValue;
  bankLogTransaction('Sold: ' + inv.name, inv.currentValue, 'income');
  S.bank.investments.splice(idx, 1);
  render();
};
window.bankDoBuyBond = function(bondId) {
  const bond = GOV_BONDS[S.country].find(x => x.id === bondId);
  const amt = Math.round(Number(prompt(`Bond amount?\n(Min ${money(bond.minAmount)}, Available: ${money(bankGetTotalLiquidCash())})`, String(bond.minAmount))));
  if (amt < bond.minAmount) return;
  if (!bankSpend(amt, 'Bond: ' + bond.name)) { log('Insufficient total funds.'); return; }
  S.bank.investments.push({ id: 'bond_' + Math.random().toString(36).slice(2), productId: bond.id, name: bond.name, provider: 'Government', principal: amt, currentValue: amt, expectedReturn: bond.yield, volatility: 0, startYear: gameYear(), maturityYear: gameYear() + Math.ceil(bond.termDays / 365) });
  render();
};
window.bankDoBuyGold = function(karat) {
  const prices = GOLD_PRICES[S.country] || GOLD_PRICES.egy;
  const perGram = karat === '24K' ? prices.perGram24K : karat === '21K' ? prices.perGram21K : prices.perGram18K;
  const grams = Number(prompt(`Grams of ${karat} gold?\nPrice: ${perGram.toLocaleString()} ${C().currency}/g`, '10'));
  if (grams <= 0) return;
  const total = grams * perGram;
  if (!bankSpend(total, `Gold: ${grams}g ${karat}`)) { log('Insufficient total funds.'); return; }
  S.bank.gold.push({ id: 'gold_' + Math.random().toString(36).slice(2), karat, grams, purchaseValue: total, buyPricePerGram: perGram, buyYear: gameYear() });
  render();
};
window.bankDoSellGold = function(idx) {
  const g = S.bank.gold[idx];
  const prices = GOLD_PRICES[S.country] || GOLD_PRICES.egy;
  const perGram = g.karat === '24K' ? prices.perGram24K : g.karat === '21K' ? prices.perGram21K : prices.perGram18K;
  
window.bankDoSellGold = function(idx) {
  const g = S.bank.gold[idx];
  const prices = GOLD_PRICES[S.country] || GOLD_PRICES.egy;
  const perGram = g.karat === '24K' ? prices.perGram24K : g.karat === '21K' ? prices.perGram21K : prices.perGram18K;
  const value = Math.round(g.grams * perGram * (1 - prices.dealerSpread));
  if (!confirm(`Sell ${g.grams}g ${g.karat} gold for ${money(value)}?`)) return;
  S.wealth += value;
  bankLogTransaction('Sold ' + g.grams + 'g ' + g.karat + ' gold', value, 'income');
  S.bank.gold.splice(idx, 1);
  render();
};

/* ---------- 7. INSURANCE ---------- */
function bankInsuranceSection() {
  const b = S.bank;
  const available = (typeof INSURANCE_PRODUCTS !== 'undefined' ? INSURANCE_PRODUCTS[S.country] : null) || [];

  let html = `<div class="card"><h3>Your Active Policies (${b.insurance.length})</h3>`;
  if (!b.insurance.length) html += `<p class="muted small">No active policies. Protect what you own.</p>`;
  else {
    b.insurance.forEach((ins, i) => {
      html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between"><b>${ins.name}</b><b class="mono good">${money(ins.annualPremium)}/yr</b></div>
        <div class="muted small">${ins.type.toUpperCase()} · Coverage ${money(ins.coverage)} · ${ins.provider}</div>
        <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="bankCancelInsurance(${i})">Cancel</button>
      </div>`;
    });
  }
  html += `</div>`;

  html += `<div class="card"><h3>Available Policies</h3>`;
  if (!available.length) html += `<p class="muted small">No products for this country yet.</p>`;
  available.forEach(prod => {
    if (b.insurance.some(i => i.productId === prod.id)) return;
    const coverage = typeof prod.maxCoverage === 'number' ? prod.maxCoverage : Math.round(bankGetTotalAssets() * 0.5);
    const premium = Math.round(coverage * prod.annualRate);
    const canAfford = bankGetTotalLiquidCash() >= premium;
    html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
      <div style="display:flex;justify-content:space-between"><b>${prod.name}</b><b class="mono">${money(premium)}/yr</b></div>
      <div class="muted small">${prod.type.toUpperCase()} · Coverage ${money(coverage)} · ${prod.provider}</div>
      <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" ${canAfford ? '' : 'disabled'} onclick="bankBuyInsurance('${prod.id}')">${canAfford ? 'Activate' : 'Insufficient funds'}</button>
    </div>`;
  });
  html += `</div>`;
  return html;
}

window.bankBuyInsurance = function(productId) {
  const prod = ((typeof INSURANCE_PRODUCTS !== 'undefined' ? INSURANCE_PRODUCTS[S.country] : null) || []).find(p => p.id === productId);
  if (!prod) return;
  const coverage = typeof prod.maxCoverage === 'number' ? prod.maxCoverage : Math.round(bankGetTotalAssets() * 0.5);
  const premium = Math.round(coverage * prod.annualRate);
  if (!bankSpend(premium, 'Insurance: ' + prod.name)) { log('Insufficient funds.'); return; }
  S.bank.insurance.push({
    id: 'ins_' + Math.random().toString(36).slice(2), productId: prod.id, name: prod.name,
    type: prod.type, provider: prod.provider, coverage, annualPremium: premium, startedYear: gameYear(),
  });
  log(`✅ Activated ${prod.name}. Annual premium ${money(premium)}.`);
  render();
};

window.bankCancelInsurance = function(idx) {
  const ins = S.bank.insurance[idx];
  if (!ins) return;
  if (!confirm(`Cancel ${ins.name}?`)) return;
  S.bank.insurance.splice(idx, 1);
  log(`Cancelled policy: ${ins.name}.`);
  render();
};

/* ---------- 8. SAVINGS GOALS ---------- */
function bankGoalsSection() {
  const b = S.bank;
  const templates = (typeof SAVINGS_GOAL_TEMPLATES !== 'undefined' ? SAVINGS_GOAL_TEMPLATES[S.country] : null) || [];

  let html = `<div class="card"><h3>Your Savings Goals (${b.goals.length})</h3>`;
  if (!b.goals.length) html += `<p class="muted small">Set targets and watch progress. Each year, your auto-deposit goes here.</p>`;
  else {
    b.goals.forEach((g, i) => {
      const pct = Math.min(100, Math.round((g.saved / Math.max(1, g.target)) * 100));
      const done = g.saved >= g.target;
      html += `<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between"><b>${g.name}</b><b class="mono ${done ? 'good' : ''}">${money(g.saved)} / ${money(g.target)}</b></div>
        <div style="height:6px;background:#1a1a2a;border-radius:3px;margin:6px 0"><div style="height:100%;width:${pct}%;background:${done ? '#34d399' : '#8b5cf6'};border-radius:3px"></div></div>
        <div class="muted small">${g.monthlyDeposit > 0 ? 'Auto-deposit ' + money(g.monthlyDeposit) + '/mo · ' : ''}${pct}% complete</div>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button class="opt" style="flex:1;padding:4px;font-size:.72rem" onclick="bankGoalDeposit(${i})">Deposit</button>
          <button class="opt" style="flex:1;padding:4px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="bankGoalRemove(${i})">Remove</button>
        </div>
      </div>`;
    });
  }
  html += `</div>`;

  html += `<div class="card"><h3>Add a New Goal</h3>`;
  templates.forEach(t => {
    if (b.goals.some(g => g.templateId === t.id)) return;
    html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
      <div style="display:flex;justify-content:space-between"><b>${t.name}</b><b class="mono">${money(t.targetAmount)}</b></div>
      <div class="muted small">${t.note}</div>
      <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" onclick="bankAddGoal('${t.id}')">Create Goal</button>
    </div>`;
  });
  html += `</div>`;
  return html;
}

window.bankAddGoal = function(templateId) {
  const t = ((typeof SAVINGS_GOAL_TEMPLATES !== 'undefined' ? SAVINGS_GOAL_TEMPLATES[S.country] : null) || []).find(x => x.id === templateId);
  if (!t) return;
  const monthly = Math.round(Number(prompt(`Auto-deposit per month? (0 = manual)`, '0')) || 0);
  S.bank.goals.push({
    id: 'goal_' + Math.random().toString(36).slice(2), templateId: t.id, name: t.name,
    target: t.targetAmount, saved: 0, monthlyDeposit: monthly, createdYear: gameYear(),
  });
  log(`Goal created: ${t.name} (${money(t.targetAmount)}).`);
  render();
};

window.bankGoalDeposit = function(idx) {
  const g = S.bank.goals[idx];
  const amt = Math.round(Number(prompt(`Deposit into "${g.name}"?\nAvailable: ${money(bankGetTotalLiquidCash())}`, '1000')) || 0);
  if (amt <= 0) return;
  if (!bankSpend(amt, 'Goal deposit: ' + g.name)) { log('Insufficient funds.'); return; }
  g.saved += amt;
  log(`Deposited ${money(amt)} into ${g.name}. Progress: ${money(g.saved)} / ${money(g.target)}.`);
  render();
};

window.bankGoalRemove = function(idx) {
  const g = S.bank.goals[idx];
  if (!g) return;
  if (g.saved > 0) { S.wealth += g.saved; log(`Returned ${money(g.saved)} from ${g.name} to cash.`); }
  S.bank.goals.splice(idx, 1);
  render();
};

/* ---------- 9. TRANSFERS & REMITTANCES ---------- */
function bankTransferSection() {
  const services = (typeof REMITTANCE_SERVICES !== 'undefined' ? REMITTANCE_SERVICES[S.country] : null) || [];
  const receiving = services.length === 0 ? [] : ((typeof REMITTANCE_SERVICES !== 'undefined' ? REMITTANCE_SERVICES.foreign_to_egy : null) || []);

  let html = `<div class="card">
    <h3>Send Money</h3>
    <p class="muted small">Send to family, receive remittances, or transfer to another bank account.</p>
  </div>`;

  html += `<div class="card"><h3>Domestic Transfer</h3>
    <p class="muted small">Move between your own accounts, or send to family in ${C().name}.</p>
    <button class="opt" style="text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="bankDomesticTransfer()">New Transfer</button>
  </div>`;

  if (services.length > 0) {
    html += `<div class="card"><h3>Remittance Services</h3>`;
    services.forEach(svc => {
      html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between"><b>${svc.name}</b><b class="mono small">${(svc.feePct * 100).toFixed(2)}% fee</b></div>
        <div class="muted small">Speed: ${svc.speed}${svc.maxPerTransfer ? ' · Max ' + money(svc.maxPerTransfer) : ''}</div>
      </div>`;
    });
    html += `<button class="opt" style="margin-top:6px;text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="bankSendRemittance()">Send via Remittance</button></div>`;
  }

  if (b_remitHistory_has_entries()) {
    html += `<div class="card"><h3>Recent Transfers</h3>`;
    S.bank.remitHistory.slice(0, 10).forEach(r => {
      html += `<div class="row" style="padding:4px 0;font-size:.78rem">
        <span>${r.year} · ${r.desc}</span><b class="mono">${money(r.amount)}</b>
      </div>`;
    });
    html += `</div>`;
  }

  return html;
}

function b_remitHistory_has_entries() { return S.bank && S.bank.remitHistory && S.bank.remitHistory.length > 0; }

window.bankDomesticTransfer = function() {
  const amt = Math.round(Number(prompt(`Amount to transfer?\nAvailable: ${money(bankGetTotalLiquidCash())}`, '1000')) || 0);
  if (amt <= 0) return;
  const who = prompt('To who? (e.g. "Mother", "Brother", "Spouse")', 'Family member');
  if (!who) return;
  if (!bankSpend(amt, 'Transfer to ' + who)) { log('Insufficient funds.'); return; }
  S.bank.remitHistory.unshift({ year: gameYear(), desc: 'Transfer to ' + who, amount: amt });
  log(`Sent ${money(amt)} to ${who}.`);
  render();
};

window.bankSendRemittance = function() {
  const services = (typeof REMITTANCE_SERVICES !== 'undefined' ? REMITTANCE_SERVICES[S.country] : null) || [];
  if (!services.length) return;
  const svc = services[0];
  const amt = Math.round(Number(prompt(`Send abroad via ${svc.name}?\nFee: ${(svc.feePct * 100).toFixed(2)}%\nAvailable: ${money(bankGetTotalLiquidCash())}`, '5000')) || 0);
  if (amt <= 0) return;
  const fee = Math.round(amt * svc.feePct);
  const total = amt + fee;
  if (!bankSpend(total, 'Remittance: ' + amt)) { log('Insufficient funds.'); return; }
  S.bank.remitHistory.unshift({ year: gameYear(), desc: 'Sent abroad via ' + svc.name, amount: amt });
  log(`Sent ${money(amt)} abroad via ${svc.name} (fee ${money(fee)}).`);
  render();
};

/* ---------- 10. PENSION ---------- */
function bankPensionSection() {
  const b = S.bank;
  const products = (typeof PENSION_PRODUCTS !== 'undefined' ? PENSION_PRODUCTS[S.country] : null) || [];

  let html = `<div class="card"><h3>Retirement Planning</h3>
    <div class="row"><span>Current pension value</span><b class="mono good">${money(b.pension.totalValue || 0)}</b></div>
    <div class="row"><span>Total contributed</span><b class="mono">${money(b.pension.totalContributed || 0)}</b></div>
    <div class="row"><span>Years to retirement (60)</span><b>${Math.max(0, 60 - S.age)}</b></div>
    ${bankRenderPensionProjection()}
  </div>`;

  if (b.pension.active.length > 0) {
    html += `<div class="card"><h3>Active Plans (${b.pension.active.length})</h3>`;
    b.pension.active.forEach((p, i) => {
      html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
        <div style="display:flex;justify-content:space-between"><b>${p.name}</b><b class="mono good">${money(p.value)}</b></div>
        <div class="muted small">Contributing ${money(p.monthlyContribution)}/mo · ${p.provider}</div>
        <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="bankPensionStop(${i})">Stop Contributions</button>
      </div>`;
    });
    html += `</div>`;
  }

  html += `<div class="card"><h3>Available Plans</h3>`;
  products.forEach(prod => {
    if (b.pension.active.some(p => p.productId === prod.id)) return;
    html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
      <div style="display:flex;justify-content:space-between"><b>${prod.name}</b><b class="mono small">${(prod.expectedReturn * 100).toFixed(1)}%</b></div>
      <div class="muted small">${prod.provider} · Contribution ${(prod.contributionRate * 100).toFixed(1)}%${prod.employerRate ? ' + employer ' + (prod.employerRate * 100).toFixed(1) + '%' : ''}</div>
      <button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" onclick="bankPensionStart('${prod.id}')">Enroll</button>
    </div>`;
  });
  html += `</div>`;
  return html;
}

function bankRenderPensionProjection() {
  const b = S.bank;
  const total = b.pension.totalValue || 0;
  const yearsTo60 = Math.max(0, 60 - S.age);
  const projected = Math.round(total * Math.pow(1.07, yearsTo60));
  return `<div class="row" style="border-top:1px solid #1a1a2a;padding-top:6px;margin-top:6px">
    <span>Projected at 60 (7% growth)</span><b class="mono gold">${money(projected)}</b>
  </div>`;
}

window.bankPensionStart = function(productId) {
  const prod = ((typeof PENSION_PRODUCTS !== 'undefined' ? PENSION_PRODUCTS[S.country] : null) || []).find(p => p.id === productId);
  if (!prod) return;
  const monthly = S.job && S.job.salary ? Math.round((S.job.salary / 12) * prod.contributionRate) : 0;
  if (monthly <= 0) { log('You need a job to contribute to pension.'); render(); return; }
  S.bank.pension.active.push({
    id: 'pen_' + Math.random().toString(36).slice(2), productId: prod.id, name: prod.name,
    provider: prod.provider, monthlyContribution: monthly, value: 0, startedYear: gameYear(),
  });
  log(`Enrolled in ${prod.name}. Monthly contribution ${money(monthly)}.`);
  render();
};

window.bankPensionStop = function(idx) {
  const p = S.bank.pension.active[idx];
  if (!p) return;
  if (!confirm(`Stop contributions to ${p.name}?`)) return;
  S.bank.pension.totalValue += p.value;
  S.bank.pension.active.splice(idx, 1);
  log(`Stopped contributions to ${p.name}.`);
  render();
};

/* ============================================================
   YEAR TICK — banking
   ============================================================ */
function bankYearTick() {
  if (!S || !S.bank || S.age < 18) return;
  ensureBankState();
  const b = S.bank;

  // 1. Auto-deposit toggle: sweep positive cash into first account
  if (b.autoDepositSalary && b.accounts.length > 0 && S.wealth > 0) {
    const amt = S.wealth;
    S.wealth = 0;
    b.accounts[0].balance += amt;
    bankLogTransaction('Auto-deposit cash sweep', amt, 'income');
  }

  // 2. Savings account interest
  b.accounts.forEach(acc => {
    const bankDef = (BANKS[S.country] || []).find(x => x.id === acc.bankId);
    if (bankDef && bankDef.savingsRate > 0 && acc.balance > 0) {
      const interest = Math.round(acc.balance * bankDef.savingsRate);
      if (interest > 0) acc.balance += interest;
    }
  });

  // 3. Certificates: interest + maturity
  b.certificates = b.certificates.filter(c => {
    if (c.yearsHeld >= c.term) {
      const proceeds = c.principal + c.totalInterestPaid;
      if (c.autoRenew) {
        c.yearsHeld = 0;
        c.totalInterestPaid = 0;
        log(`🔄 Certificate auto-renewed: ${c.name}.`);
        return true;
      } else {
        S.wealth += proceeds;
        log(`✅ Certificate matured: ${c.name} returned ${money(proceeds)} to cash.`);
        return false;
      }
    }
    const rate = c.rates[Math.min(c.yearsHeld, c.rates.length - 1)] || 0;
    const interest = Math.round(c.principal * rate);
    c.totalInterestPaid += interest;
    c.yearsHeld++;
    return true;
  });

  // 4. Loans: annual payment
  b.loans.forEach(l => {
    if (l.remaining <= 0) return;
    const annualPayment = l.monthlyPayment * 12;
    if (S.wealth >= annualPayment) {
      S.wealth -= annualPayment;
      const interest = Math.round(l.remaining * l.rate);
      const principalPaid = annualPayment - interest;
      l.remaining = Math.max(0, l.remaining - principalPaid);
      l.monthsLeft = Math.max(0, l.monthsLeft - 12);
    } else {
      l.missedPayments = (l.missedPayments || 0) + 1;
      l.remaining = Math.round(l.remaining * 1.05);
      bankScoreChange(-50, 'Missed payment on ' + l.name);
    }
  });
  b.loans = b.loans.filter(l => l.remaining > 0 && l.monthsLeft > 0);

  // 5. Credit cards: auto-pay or accrue interest
  b.creditCards.forEach(c => {
    if (c.balance <= 0) return;
    const min = BankMath.cardMinPayment(c, c.balance);
    if (c.autoPay && S.wealth >= min) {
      S.wealth -= min;
      c.balance -= min;
      c.lastPaymentYear = gameYear();
    } else {
      c.balance = Math.round(c.balance * (1 + c.apr));
      if (!c.autoPay) bankScoreChange(-20, 'Card interest accrued: ' + c.name);
    }
  });

  // 6. Investments: mark-to-market
  b.investments.forEach(inv => {
    if (!inv.volatility && inv.expectedReturn) {
      inv.currentValue = Math.round(inv.currentValue * (1 + inv.expectedReturn));
    } else {
      const ret = (Math.random() - 0.35) * (inv.volatility || 0.1) + (inv.expectedReturn || 0.05);
      inv.currentValue = Math.max(0, Math.round(inv.currentValue * (1 + ret)));
    }
  });

  // 7. Pension: add contributions to value
  let pensionContrib = 0;
  b.pension.active.forEach(p => {
    const yearly = p.monthlyContribution * 12;
    if (S.wealth >= yearly) {
      S.wealth -= yearly;
      p.value = Math.round(p.value * 1.07 + yearly);
      b.pension.totalContributed = (b.pension.totalContributed || 0) + yearly;
      pensionContrib += yearly;
    }
  });
  if (pensionContrib > 0) log(`🏛️ Pension contributions this year: ${money(pensionContrib)}.`);

  // 8. Insurance: pay premiums
  b.insurance.forEach(ins => {
    if (S.wealth >= ins.annualPremium) {
      S.wealth -= ins.annualPremium;
    } else {
      log(`⚠️ Could not pay premium on ${ins.name}. Policy may lapse.`);
    }
  });

  // 9. Goals: auto-deposit
  b.goals.forEach(g => {
    if (g.monthlyDeposit > 0 && g.saved < g.target) {
      const monthly = Math.min(g.monthlyDeposit * 12, g.target - g.saved);
      if (S.wealth >= monthly) {
        S.wealth -= monthly;
        g.saved += monthly;
      }
    }
  });

  // 10. Snapshot net worth for sparkline
  const nw = bankGetTotalAssets() - bankGetTotalDebt();
  if (!Array.isArray(b.netWorthHistory)) b.netWorthHistory = [];
  b.netWorthHistory.unshift({ year: gameYear(), value: nw });
  b.netWorthHistory = b.netWorthHistory.slice(0, 20);
}
GameHooks.on('year', bankYearTick);

/* ============================================================
   REGISTER TAB
   ============================================================ */
GameHooks.registerTab({ id: 'bank', label: '🏦 Bank', order: 6, view: bankView });
