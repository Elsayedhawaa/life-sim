/* =====================================================================
   32. BANKING FIX + EGYPTIAN DEPOSIT CERTIFICATES & FLEXIBLE FINANCING
   - Auto-repairs NaN wealth/savings corrupted by earlier ledger bugs
   - Adds real Egyptian bank certificates (NBE, Banque Misr, CIB, ALEXBANK)
   - Adds customizable loan builder (1 to 10 years) with early payoff options
   - Upgrades credit cards with real game perks, cashback & emergency buffers
   ===================================================================== */

/* ---------- 1. ADVANCED NaN REPAIR & SANITIZATION ---------- */
function p32SafeNum(v, fallback = 0) {
  if (v === null || v === undefined) return fallback;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
}

function p32RepairNaN() {
  if (!S) return;
  const keys = ['wealth', 'income', 'expenses', 'loan', 'nest', 'savings', 'invest', 'pension', 'lastSalary'];
  keys.forEach(k => { S[k] = p32SafeNum(S[k], 0); });

  if (!S.bank || typeof S.bank !== 'object') {
    S.bank = { score: 680, savingsBal: 0, activeCards: [], primaryCard: null, cardDebt: {}, loans: [], missedPmts: 0 };
  } else {
    S.bank.savingsBal = p32SafeNum(S.bank.savingsBal, 0);
    S.bank.score = Math.min(850, Math.max(300, p32SafeNum(S.bank.score, 680)));
    S.bank.missedPmts = p32SafeNum(S.bank.missedPmts, 0);
    
    if (!S.bank.cardDebt || typeof S.bank.cardDebt !== 'object') S.bank.cardDebt = {};
    Object.keys(S.bank.cardDebt).forEach(k => { S.bank.cardDebt[k] = p32SafeNum(S.bank.cardDebt[k], 0); });
    
    if (Array.isArray(S.bank.loans)) {
      S.bank.loans.forEach(l => {
        if (!l) return;
        l.principal = p32SafeNum(l.principal, 0);
        l.remainingBal = p32SafeNum(l.remainingBal, 0);
        l.annualPmt = p32SafeNum(l.annualPmt, 0);
        l.rate = p32SafeNum(l.rate, 0.12);
        l.yearsLeft = p32SafeNum(l.yearsLeft, 1);
        l.yearsTotal = p32SafeNum(l.yearsTotal, 3);
      });
      S.bank.loans = S.bank.loans.filter(l => l && l.remainingBal > 0);
    } else S.bank.loans = [];
  }

  if (!S.bill || typeof S.bill !== 'object') S.bill = {};
  Object.keys(S.bill).forEach(k => { S.bill[k] = p32SafeNum(S.bill[k], 0); });

  if (S.yearPopup) {
    S.yearPopup.income = p32SafeNum(S.yearPopup.income, 0);
    S.yearPopup.expenses = p32SafeNum(S.yearPopup.expenses, 0);
  }
}

/* ---------- 2. EGYPTIAN DEPOSIT CERTIFICATES DATA (2026 RATES) ---------- */
const P32_EGYPT_CERTIFICATES = [
  {
    id: 'nbe_platinum_monthly',
    bank: 'National Bank of Egypt (NBE)',
    name: 'Platinum Certificate — Monthly Payout',
    rateSchedule: [0.1775, 0.1775, 0.1775],
    payout: 'Monthly',
    years: 3,
    minEGP: 1000,
    desc: '17.75% fixed annual rate paid out monthly into your checking account. Backed by state guarantee.'
  },
  {
    id: 'nbe_platinum_quarterly',
    bank: 'National Bank of Egypt (NBE)',
    name: 'Platinum Certificate — Quarterly Payout',
    rateSchedule: [0.1785, 0.1785, 0.1785],
    payout: 'Quarterly',
    years: 3,
    minEGP: 1000,
    desc: '17.85% fixed annual yield paid every 3 months. Slightly higher return for quarterly payout.'
  },
  {
    id: 'bm_alqimma',
    bank: 'Banque Misr',
    name: 'Al Qimma Certificate',
    rateSchedule: [0.1775, 0.1775, 0.1775],
    payout: 'Monthly',
    years: 3,
    minEGP: 1000,
    desc: '17.75% fixed yield paid monthly. State bank security with high liquidity returns.'
  },
  {
    id: 'bm_ibnmisr_descending',
    bank: 'Banque Misr',
    name: 'Ibn Misr Al Tholatheya (Descending)',
    rateSchedule: [0.205, 0.1625, 0.1225],
    payout: 'Monthly',
    years: 3,
    minEGP: 1000,
    desc: 'Front-loaded return: 20.5% Year 1, 16.25% Year 2, and 12.25% Year 3. Maximizes cashflow early on.'
  },
  {
    id: 'cib_premium',
    bank: 'Commercial International Bank (CIB)',
    name: 'CIB Premium Certificate',
    rateSchedule: [0.18, 0.18, 0.18],
    payout: 'Monthly',
    years: 3,
    minEGP: 50000,
    desc: 'Fixed 18.0% annual yield paid monthly. Private banking tier for higher balances (50k EGP min).'
  },
  {
    id: 'alexbank_cdmax',
    bank: 'ALEXBANK',
    name: 'CD MAX High-Yield Certificate',
    rateSchedule: [0.1825, 0.1825, 0.1825],
    payout: 'Monthly',
    years: 3,
    minEGP: 1000000,
    desc: 'Fixed 18.25% annual rate paid monthly. Highest fixed rate available, minimum 1,000,000 EGP.'
  }
];

function p32CertificateById(id) {
  return P32_EGYPT_CERTIFICATES.find(c => c.id === id) || null;
}

/* ---------- 3. CREDIT CARD PERKS & UTILITY CATALOG ---------- */
const P32_CARDS_CATALOG = {
  egy: [
    {
      id: 'nbe_gold',
      bank: 'National Bank of Egypt',
      name: 'NBE Gold Visa',
      feeEGP: 500,
      apr: 0.27,
      cashback: 0.015,
      reqScore: 580,
      reqIncomeEGP: 120000,
      limitMult: 0.35,
      hapBuff: 1,
      perks: ['1.5% Cashback on purchases', 'Credit Line Overdraft', 'Score Building (+10 pts/yr)']
    },
    {
      id: 'cib_wealth_infinite',
      bank: 'CIB Egypt',
      name: 'CIB Wealth Visa Infinite',
      feeEGP: 3500,
      apr: 0.22,
      cashback: 0.03,
      reqScore: 730,
      reqIncomeEGP: 600000,
      limitMult: 0.75,
      hapBuff: 4,
      hpBuff: 2,
      perks: ['3.0% Unlimited Cashback', 'Cairo & Alex Airport Lounge Access (+Happiness)', 'Global Travel Insurance (+Health)', 'Dedicated Concierge']
    }
  ],
  global: [
    {
      id: 'global_cashback_plus',
      bank: 'Retail Global Bank',
      name: 'Everyday Preferred Cashback',
      fee: 0,
      apr: 0.18,
      cashback: 0.02,
      reqScore: 620,
      reqIncome: 30000,
      limitMult: 0.40,
      hapBuff: 1,
      perks: ['2% Unlimited Cashback', 'Zero Annual Fee', 'Auto Credit Line Overdraft']
    },
    {
      id: 'reserve_world_elite',
      bank: 'International Reserve',
      name: 'World Elite Travel Pass',
      fee: 350,
      apr: 0.15,
      cashback: 0.035,
      reqScore: 740,
      reqIncome: 80000,
      limitMult: 0.85,
      hapBuff: 5,
      hpBuff: 3,
      perks: ['3.5% Travel & Dining Rewards', 'Global Airport Lounge Pass', 'Concierge Service', '+5 Happiness / +3 Health yearly']
    }
  ]
};

/* ---------- 4. STATE MIGRATION & INIT ---------- */
function p32Init(o) {
  if (!o) return;
  p32RepairNaN();
  if (!Array.isArray(o.certificates)) o.certificates = [];
  o.certificates.forEach(c => {
    if (!c) return;
    c.principalEGP = p32SafeNum(c.principalEGP, 1000);
    c.principalInternal = p32SafeNum(c.principalInternal, 20);
    c.yearsHeld = p32SafeNum(c.yearsHeld, 0);
    c.totalPaid = p32SafeNum(c.totalPaid, 0);
    c.rateSchedule = Array.isArray(c.rateSchedule) ? c.rateSchedule : [0.1775, 0.1775, 0.1775];
    c.yearsTotal = p32SafeNum(c.yearsTotal, 3);
  });
}

/* ---------- 5. CERTIFICATE ACTIONS ---------- */
function p32BuyCertificate(certId, rawAmount) {
  if (!S || S.age < 18) return hint('Certificates require age 18.');
  p32RepairNaN();
  const cert = p32CertificateById(certId);
  if (!cert) return hint('Certificate offer not found.');

  const amountEGP = Math.round(p32SafeNum(rawAmount, 0));
  if (amountEGP <= 0) return hint('Please enter a valid amount.');
  if (amountEGP < cert.minEGP) return hint(`Minimum deposit for ${cert.name} is ${cert.minEGP.toLocaleString()} EGP.`);

  const egyRateVal = Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry('egy', gameYear()) : 52.7);
  const internalAmount = amountEGP / egyRateVal;

  if (S.wealth < internalAmount) {
    alert(`Insufficient funds in checking account!\n\nRequired: ${amountEGP.toLocaleString()} EGP (${typeof money === 'function' ? money(internalAmount) : internalAmount})\nYour Cash: ${typeof money === 'function' ? money(S.wealth) : S.wealth}`);
    return hint('Insufficient cash available.');
  }

  S.wealth = p32SafeNum(S.wealth - internalAmount, 0);
  S.certificates = S.certificates || [];
  S.certificates.push({
    id: 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    certId: cert.id,
    bank: cert.bank,
    name: cert.name,
    principalEGP: amountEGP,
    principalInternal: internalAmount,
    rateSchedule: cert.rateSchedule.slice(),
    payout: cert.payout,
    yearsTotal: cert.years,
    yearsHeld: 0,
    totalPaid: 0,
    startedYear: gameYear()
  });

  log(`Purchased ${cert.name} from ${cert.bank} for ${amountEGP.toLocaleString()} EGP.`);
  if (typeof realismNotice === 'function') {
    realismNotice('Certificate Booked', `${cert.name} active for ${amountEGP.toLocaleString()} EGP. Year 1 yield: ${(cert.rateSchedule[0] * 100).toFixed(2)}%, paid ${cert.payout}.`);
  }
  if (typeof render === 'function') render();
}

function p32RedeemCertificate(certUid) {
  p32RepairNaN();
  const cert = (S.certificates || []).find(c => c.id === certUid);
  if (!cert) return hint('Certificate not found.');

  const yearsLeft = cert.yearsTotal - cert.yearsHeld;
  if (yearsLeft > 0) {
    const penalty = 0.0925; // Standard 9.25% early break penalty on principal
    const penaltyEGP = Math.round(cert.principalEGP * penalty);
    if (!confirm(`Redeeming early from ${cert.bank} incurs an estimated ${penaltyEGP.toLocaleString()} EGP penalty. Continue?`)) return;
    
    const netEGP = cert.principalEGP - penaltyEGP;
    const egyRateVal = Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry('egy', gameYear()) : 52.7);
    S.wealth = p32SafeNum(S.wealth + (netEGP / egyRateVal), 0);
    log(`Redeemed ${cert.name} early. Received ${netEGP.toLocaleString()} EGP after penalty.`);
  } else {
    S.wealth = p32SafeNum(S.wealth + cert.principalInternal, 0);
    log(`${cert.name} matured. Principal ${cert.principalEGP.toLocaleString()} EGP returned to checking.`);
  }
  S.certificates = S.certificates.filter(c => c.id !== certUid);
  if (typeof render === 'function') render();
}

/* ---------- 6. FLEXIBLE LOANS SYSTEM ---------- */
function p32CalculateLoanOffer(amount, years) {
  amount = p32SafeNum(amount, 0);
  years = p32SafeNum(years, 3);
  
  const score = p32SafeNum(S.bank && S.bank.score, 680);
  const isEgypt = S.country === 'egy';
  
  // Base rate: Egypt ~22%, Global ~7%. Longer terms add +0.5% per year beyond 1 yr.
  const baseRate = isEgypt ? 0.22 : 0.07;
  const termMarkup = (years - 1) * 0.005;
  const scoreDiscount = (score - 600) * 0.0004;
  
  const finalRate = Math.max(0.04, baseRate + termMarkup - scoreDiscount);
  
  // Amortized annual payment formula
  const annualPmt = Math.round((amount * finalRate) / (1 - Math.pow(1 + finalRate, -years)));
  const totalPayback = annualPmt * years;
  const totalInterest = totalPayback - amount;

  return { rate: finalRate, annualPmt, monthlyPmt: Math.round(annualPmt / 12), totalPayback, totalInterest };
}

function p32ApplyCustomLoan(amountInput, yearsInput) {
  p32RepairNaN();
  const amount = p32SafeNum(amountInput, 0);
  const years = p32SafeNum(yearsInput, 3);

  if (amount <= 0) return alert('Please enter a valid loan amount.');
  if (years < 1 || years > 10) return alert('Loan term must be between 1 and 10 years.');

  const score = p32SafeNum(S.bank.score, 680);
  const maxLoan = (S.income || 20000) * (score >= 740 ? 3.5 : score >= 650 ? 2.0 : 1.0);

  if (amount > maxLoan) {
    alert(`Loan Declined!\n\nRequested: ${typeof money === 'function' ? money(amount) : amount}\nYour Max Approved Limit: ${typeof money === 'function' ? money(maxLoan) : maxLoan}\n\nImprove your credit score or income to qualify for larger financing.`);
    return hint('Requested amount exceeds bank credit limit.');
  }

  const offer = p32CalculateLoanOffer(amount, years);

  S.wealth = p32SafeNum(S.wealth + amount, 0);
  S.bank.loans = S.bank.loans || [];
  S.bank.loans.push({
    id: 'loan_' + gameYear() + '_' + Math.random().toString(36).slice(2, 6),
    principal: amount,
    remainingBal: amount,
    rate: offer.rate,
    annualPmt: offer.annualPmt,
    yearsTotal: years,
    yearsLeft: years
  });

  log(`Bank Loan Approved: Received ${typeof money === 'function' ? money(amount) : amount}. Term: ${years} yrs at ${(offer.rate * 100).toFixed(1)}% interest.`);
  if (typeof render === 'function') render();
}

function p32RepayLoanPart(loanId, mode, customAmt) {
  p32RepairNaN();
  const loan = (S.bank.loans || []).find(l => l.id === loanId);
  if (!loan) return;

  let payAmt = 0;
  if (mode === 'full') payAmt = loan.remainingBal;
  else if (mode === 'half') payAmt = Math.round(loan.remainingBal / 2);
  else if (mode === 'annual') payAmt = Math.min(loan.annualPmt, loan.remainingBal);
  else if (mode === 'custom') payAmt = Math.min(p32SafeNum(customAmt, 0), loan.remainingBal);

  if (payAmt <= 0) return alert('Enter a valid payment amount.');

  if (S.wealth < payAmt) {
    alert(`Insufficient funds in checking account!\n\nRequired: ${typeof money === 'function' ? money(payAmt) : payAmt}\nYour Cash: ${typeof money === 'function' ? money(S.wealth) : S.wealth}`);
    return hint('Insufficient cash for loan repayment.');
  }

  S.wealth = p32SafeNum(S.wealth - payAmt, 0);
  loan.remainingBal = p32SafeNum(loan.remainingBal - payAmt, 0);

  // Recalculate annual payment if partial pay
  if (loan.remainingBal > 0 && loan.yearsLeft > 0) {
    loan.annualPmt = Math.round((loan.remainingBal * loan.rate) / (1 - Math.pow(1 + loan.rate, -loan.yearsLeft)));
  }

  S.bank.score = Math.min(850, S.bank.score + (mode === 'full' ? 25 : 8));
  log(`Paid ${typeof money === 'function' ? money(payAmt) : payAmt} toward bank loan. Remaining balance: ${typeof money === 'function' ? money(loan.remainingBal) : loan.remainingBal}.`);

  S.bank.loans = S.bank.loans.filter(l => l.remainingBal > 0);
  if (typeof render === 'function') render();
}

/* ---------- 7. YEARLY TICK PROCESSOR ---------- */
function p32ProcessYearlyBank() {
  if (!S || S.dead || S.age < 18) return;
  p32RepairNaN();

  // A. Certificate Interest & Yield Payouts
  if (Array.isArray(S.certificates) && S.certificates.length > 0) {
    for (let i = S.certificates.length - 1; i >= 0; i--) {
      const c = S.certificates[i];
      if (!c || c.yearsHeld >= c.yearsTotal) continue;

      const yearIdx = Math.min(c.yearsHeld, c.rateSchedule.length - 1);
      const rate = c.rateSchedule[yearIdx] || 0.1775;
      const interestEGP = Math.round(c.principalEGP * rate);
      const egyRateVal = Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry('egy', gameYear()) : 52.7);
      const interestInternal = interestEGP / egyRateVal;

      S.wealth = p32SafeNum(S.wealth + interestInternal, 0);
      S.income = p32SafeNum(S.income + interestInternal, 0);
      c.totalPaid = p32SafeNum(c.totalPaid + interestEGP, 0);
      c.yearsHeld = p32SafeNum(c.yearsHeld + 1, 0);

      log(`${c.bank} — ${c.name}: Paid ${interestEGP.toLocaleString()} EGP yield (${(rate * 100).toFixed(2)}%) in year ${c.yearsHeld}.`);

      if (c.yearsHeld >= c.yearsTotal) {
        S.wealth = p32SafeNum(S.wealth + c.principalInternal, 0);
        log(`${c.name} has matured! Principal of ${c.principalEGP.toLocaleString()} EGP returned to checking account.`);
        c.matured = true;
      }
    }
    S.certificates = S.certificates.filter(c => !c.matured);
  }

  // B. Process Credit Cards Benefits & Fees
  const isEgypt = S.country === 'egy';
  const cardCatalog = isEgypt ? P32_CARDS_CATALOG.egy : P32_CARDS_CATALOG.global;

  (S.bank.activeCards || []).forEach(cardId => {
    const card = cardCatalog.find(c => c.id === cardId);
    if (!card) return;

    // Apply Happiness / Health Perks
    if (card.hapBuff && typeof fx === 'function') fx({ happiness: card.hapBuff });
    if (card.hpBuff && typeof fx === 'function') fx({ health: card.hpBuff });

    // Cashback payout on expenses
    if (S.bank.primaryCard === cardId && (S.expenses || 0) > 0) {
      const reward = Math.round(S.expenses * card.cashback);
      S.wealth = p32SafeNum(S.wealth + reward, 0);
      log(`${card.name}: Earned ${typeof money === 'function' ? money(reward) : reward} in annual cashback.`);
    }

    // Process Outstanding Card Debt
    let debt = p32SafeNum(S.bank.cardDebt[cardId], 0);
    if (debt > 0) {
      const interest = Math.round(debt * card.apr);
      debt += interest;
      S.bank.score = Math.max(300, S.bank.score - 12);
      log(`Credit Card Interest Charged (${card.name}): Debt accrued ${typeof money === 'function' ? money(interest) : interest}.`);
    } else {
      S.bank.score = Math.min(850, S.bank.score + 10); // Timely card standing boosts credit
    }
    S.bank.cardDebt[cardId] = debt;
  });

  // C. Process Loans
  (S.bank.loans || []).forEach(loan => {
    if (loan.remainingBal <= 0) return;

    const dueAmt = Math.min(loan.annualPmt, loan.remainingBal);
    if (S.wealth >= dueAmt) {
      S.wealth = p32SafeNum(S.wealth - dueAmt, 0);
      S.expenses = p32SafeNum(S.expenses + dueAmt, 0);
      loan.remainingBal = p32SafeNum(loan.remainingBal - dueAmt, 0);
      loan.yearsLeft--;
      S.bank.score = Math.min(850, S.bank.score + 12);
      log(`Bank Loan Payment: Paid ${typeof money === 'function' ? money(dueAmt) : dueAmt}. Remaining balance: ${typeof money === 'function' ? money(loan.remainingBal) : loan.remainingBal}.`);
    } else {
      // Missed loan payment
      loan.remainingBal = Math.round(loan.remainingBal * 1.08);
      S.bank.score = Math.max(300, S.bank.score - 50);
      S.bank.missedPmts = p32SafeNum(S.bank.missedPmts + 1, 1);
      log(`MISSED BANK LOAN PAYMENT! 8% penalty fee charged. Credit score dropped to ${S.bank.score}.`);
      if (typeof fx === 'function') fx({ happiness: -10 });
    }
  });

  S.bank.loans = S.bank.loans.filter(l => l.remainingBal > 0);
}

/* ---------- 8. HOOK REGISTRATION ---------- */
GameHooks.on('year', p32ProcessYearlyBank);
GameHooks.on('migrate', p32Init);
GameHooks.on('newGame', () => p32Init(S));
GameHooks.on('render', p32RepairNaN);

/* ---------- 9. DASHBOARD UI RENDER ---------- */
function p32SavingsAPY() {
  return S.country === 'egy' ? 0.16 : 0.045; // 16% in Egypt High-Yield Savings
}

function viewBank() {
  if (!S || S.age < 18) return '<section class="card"><h3>Banking</h3><p class="muted">Banking services unlock at age 18.</p></section>';
  p32RepairNaN();

  const isEgypt = S.country === 'egy';
  const score = p32SafeNum(S.bank.score, 680);
  const scoreColor = score >= 740 ? 'var(--mint)' : score >= 650 ? 'var(--amber)' : 'var(--rose)';
  const checking = p32SafeNum(S.wealth, 0);
  const savings = p32SafeNum(S.bank.savingsBal, 0);

  const cardCatalog = isEgypt ? P32_CARDS_CATALOG.egy : P32_CARDS_CATALOG.global;

  let html = `
    <!-- Financial Dashboard Header -->
    <section class="card">
      <h3>💳 Financial Dashboard & Credit Rating</h3>
      <div class="row"><span>Credit Score</span><b class="mono" style="color:${scoreColor}">${score} / 850</b></div>
      <div class="row"><span>Checking Account</span><b class="mono" style="color:${checking < 0 ? 'var(--rose)' : 'var(--mint)'}">${typeof money === 'function' ? money(checking) : checking}</b></div>
      <div class="row"><span>High-Yield Savings (${(p32SavingsAPY() * 100).toFixed(1)}% APY)</span><b class="mono">${typeof money === 'function' ? money(savings) : savings}</b></div>
      
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:12px">
        <button class="btn" style="flex:1;" onclick="let a=prompt('Enter deposit amount:'); if(a) { let n=p32SafeNum(a,0); if(n>0 && S.wealth>=n){ S.wealth-=n; S.bank.savingsBal+=n; log('Deposited '+money(n)+' into savings.'); render(); } else alert('Invalid amount or insufficient funds.'); }">Deposit to Savings</button>
        <button class="btn" style="flex:1;" onclick="let a=prompt('Enter withdrawal amount:'); if(a) { let n=p32SafeNum(a,0); if(n>0 && S.bank.savingsBal>=n){ S.bank.savingsBal-=n; S.wealth+=n; log('Withdrew '+money(n)+' from savings.'); render(); } else alert('Invalid amount or insufficient savings balance.'); }">Withdraw to Checking</button>
      </div>
    </section>
  `;

  // Egyptian Bank Deposit Certificates
  if (isEgypt) {
    html += `
      <section class="card">
        <h3>🏦 Egyptian Deposit Certificates (2026 Real Rates)</h3>
        <p class="muted" style="font-size:0.85rem">High-yield term certificates backed by Egyptian banks. Lock funds for 3 years to earn high monthly returns directly into your checking account.</p>
    `;

    P32_EGYPT_CERTIFICATES.forEach(cert => {
      const firstYearYield = (cert.rateSchedule[0] * 100).toFixed(2);
      const scheduleText = cert.rateSchedule.map(r => (r * 100).toFixed(2) + '%').join(' → ');
      
      html += `
        <details class="p32-cert">
          <summary style="cursor:pointer; padding:6px 0;">
            <b>${cert.bank}</b> — ${cert.name} 
            <span style="color:var(--mint); float:right; font-weight:bold;">${firstYearYield}% ${cert.payout}</span>
          </summary>
          <div style="margin-top:8px; padding-top:8px; border-top:1px solid var(--line); font-size:0.85rem;">
            <p class="muted">${cert.desc}</p>
            <div class="row"><span>Yield Schedule</span><b class="mono">${scheduleText}</b></div>
            <div class="row"><span>Term Duration</span><b>${cert.years} Years</b></div>
            <div class="row"><span>Minimum Investment</span><b>${cert.minEGP.toLocaleString()} EGP</b></div>
            
            <div style="display:flex; gap:6px; margin-top:8px">
              <input type="number" id="amt-cert-${cert.id}" min="${cert.minEGP}" step="1000" placeholder="Amount in EGP" style="flex:1; min-width:0;">
              <button class="btn" style="width:auto; margin:0;" onclick="p32BuyCertificate('${cert.id}', document.getElementById('amt-cert-${cert.id}').value)">Book Certificate</button>
            </div>
          </div>
        </details>
      `;
    });

    // Active Owned Certificates
    const activeCerts = (S.certificates || []).filter(c => c && !c.matured);
    if (activeCerts.length > 0) {
      html += `<h4 style="margin-top:16px; color:var(--cyan);">Your Active Certificates</h4>`;
      activeCerts.forEach(c => {
        const yearIdx = Math.min(c.yearsHeld, c.rateSchedule.length - 1);
        const nextRate = c.rateSchedule[yearIdx];
        const annualYieldEGP = Math.round(c.principalEGP * nextRate);

        html += `
          <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px; background:var(--bg);">
            <b>${c.bank}</b> — ${c.name}<br>
            <span class="muted" style="font-size:0.85rem">Principal: <b>${c.principalEGP.toLocaleString()} EGP</b> · Term: Year ${c.yearsHeld + 1} of ${c.yearsTotal}</span><br>
            <span style="color:var(--mint); font-size:0.85rem">Current Yield: <b>${(nextRate * 100).toFixed(2)}%</b> (+${Math.round(annualYieldEGP/12).toLocaleString()} EGP/month)</span><br>
            <span class="muted" style="font-size:0.85rem">Total Dividends Earned: ${c.totalPaid.toLocaleString()} EGP</span>
            <div style="margin-top:6px;">
              <button class="btn" onclick="p32RedeemCertificate('${c.id}')">Redeem Early (9.25% Penalty)</button>
            </div>
          </div>
        `;
      });
    }
    html += `</section>`;
  }

  // Flexible Loans Section
  html += `
    <section class="card">
      <h3>🏛️ Flexible Personal Loans</h3>
      <p class="muted" style="font-size:0.85rem">Customize your loan principal and choose terms from 1 to 10 years. Higher credit scores unlock discounted rates.</p>

      <!-- Active Loans List -->
  `;

  if (Array.isArray(S.bank.loans) && S.bank.loans.length > 0) {
    html += `<b>Your Active Loans</b>`;
    S.bank.loans.forEach((l, idx) => {
      html += `
        <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
          <b>Loan #${idx + 1}</b> — <span style="color:var(--rose)">Balance Left: ${typeof money === 'function' ? money(l.remainingBal) : l.remainingBal}</span><br>
          <span class="muted" style="font-size:0.85rem">Rate: ${(l.rate * 100).toFixed(1)}% · Annual Installment: ${typeof money === 'function' ? money(l.annualPmt) : l.annualPmt} (${l.yearsLeft} yrs remaining)</span>
          
          <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
            <button class="btn" style="flex:1;" onclick="p32RepayLoanPart('${l.id}', 'annual')">Pay Yearly Due (${typeof money === 'function' ? money(l.annualPmt) : l.annualPmt})</button>
            <button class="btn" style="flex:1;" onclick="p32RepayLoanPart('${l.id}', 'half')">Pay 50% Balance</button>
            <button class="btn" style="flex:1;" onclick="p32RepayLoanPart('${l.id}', 'full')">Pay Off 100% Full</button>
          </div>
        </div>
      `;
    });
  }

  // Interactive Loan Calculator / Builder
  html += `
    <div style="margin-top:14px; border:1px solid var(--line); border-radius:8px; padding:12px; background:var(--bg);">
      <b>Request Custom Personal Loan</b>
      <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
        <input type="number" id="p32-loan-amt" placeholder="Loan Amount" style="flex:2; min-width:140px;">
        <select id="p32-loan-yrs" style="flex:1; min-width:110px; padding:8px; border-radius:6px; background:var(--line); color:var(--text); border:none;">
          <option value="1">1 Year</option>
          <option value="2">2 Years</option>
          <option value="3" selected>3 Years</option>
          <option value="4">4 Years</option>
          <option value="5">5 Years</option>
          <option value="6">6 Years</option>
          <option value="8">8 Years</option>
          <option value="10">10 Years</option>
        </select>
        <button class="btn" style="width:auto; margin:0;" onclick="p32ApplyCustomLoan(document.getElementById('p32-loan-amt').value, document.getElementById('p32-loan-yrs').value)">Apply for Loan</button>
      </div>
    </div>
  </section>`;

  // Credit Cards Section
  html += `<section class="card"><h3>💳 Credit Cards Marketplace & Management</h3>`;
  
  if (Array.isArray(S.bank.activeCards) && S.bank.activeCards.length > 0) {
    html += `<b>Issued Cards</b>`;
    S.bank.activeCards.forEach(cardId => {
      const card = cardCatalog.find(c => c.id === cardId);
      if (!card) return;
      const debt = p32SafeNum(S.bank.cardDebt[cardId], 0);
      const isPrimary = S.bank.primaryCard === cardId;

      html += `
        <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
          <b>${card.name}</b> ${isPrimary ? '<span style="color:var(--cyan); font-size:0.8rem;">(Primary Auto-Pay)</span>' : ''}<br>
          <span class="muted" style="font-size:0.85rem">Bank: ${card.bank} · APR: ${(card.apr * 100)}% · Debt: <b style="color:${debt > 0 ? 'var(--rose)' : 'inherit'}">${typeof money === 'function' ? money(debt) : debt}</b></span><br>
          <span class="muted" style="font-size:0.85rem">Perks: ${card.perks.join(' · ')}</span>
          <div style="display:flex; gap:6px; margin-top:8px;">
            ${debt > 0 ? `<button class="btn" onclick="let d=S.bank.cardDebt['${cardId}']; if(S.wealth>=d){ S.wealth-=d; S.bank.cardDebt['${cardId}']=0; log('Paid full card balance.'); render(); } else alert('Insufficient cash in checking.');">Pay Off Debt (${typeof money === 'function' ? money(debt) : debt})</button>` : ''}
            ${!isPrimary ? `<button class="btn" onclick="S.bank.primaryCard='${cardId}'; render();">Set Primary</button>` : ''}
          </div>
        </div>
      `;
    });
  }

  html += `<h4 style="margin-top:14px; color:var(--cyan);">Apply for Credit Lines</h4>`;
  cardCatalog.forEach(card => {
    const owned = (S.bank.activeCards || []).includes(card.id);
    html += `
      <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
        <b>${card.name}</b> — <span class="muted">${card.bank}</span><br>
        <span class="muted" style="font-size:0.85rem">${card.perks.join(' · ')}</span><br>
        <span class="muted" style="font-size:0.85rem">Req. Credit Score: ${card.reqScore}</span>
        <button class="btn" style="margin-top:6px;" ${owned || score < card.reqScore ? 'disabled' : ''} onclick="S.bank.activeCards.push('${card.id}'); S.bank.cardDebt['${card.id}']=0; if(!S.bank.primaryCard) S.bank.primaryCard='${card.id}'; S.bank.score=Math.min(850, S.bank.score+15); log('Approved for ${card.name}!'); render();">
          ${owned ? 'Card Issued' : 'Apply for Card'}
        </button>
      </div>
    `;
  });

  html += `</section>`;

  return html;
}

/* ---------- 10. STYLES INJECTION ---------- */
(function injectBankingStyles() {
  if (document.getElementById('p32-banking-styles')) return;
  const style = document.createElement('style');
  style.id = 'p32-banking-styles';
  style.textContent = `
    .p32-cert { margin-top: 10px; padding: 10px; border: 1px solid var(--line); border-radius: 8px; background: var(--bg); }
    .p32-cert[open] { border-color: var(--cyan); }
    .p32-cert summary { outline: none; }
  `;
  document.head.appendChild(style);
})();
