/* =====================================================================
   28. MASTER CONSOLIDATED BANKING SYSTEM
   Replaces: 28, 32, 33, 36, 38, 39, 58, 59
   Features: 
   - Unified NaN Auto-Repair
   - Egyptian Deposit Certificates (2026 Rates) & Flexible Loans
   - Dynamic Credit Limits, Shopping Overrides & Smart Card Payment
   - Early Installment & Mortgage Payoffs
   - Monthly Pacing Fixes & Wife Auto-Savings
   Load AFTER 27-egypt-realism.js and BEFORE 29-egypt-universities.js
   ===================================================================== */

/* =================================================================
   PART 1: CONSTANTS & CATALOGS
   ================================================================= */

const BANK_CERTS_CATALOG = [
  { id: 'nbe_platinum_monthly', bank: 'NBE', name: 'Platinum Certificate (Monthly)', rates: [0.1775, 0.1775, 0.1775], payout: 'Monthly', years: 3, minEGP: 1000, desc: '17.75% fixed annual rate paid monthly.' },
  { id: 'nbe_platinum_quarterly', bank: 'NBE', name: 'Platinum Certificate (Quarterly)', rates: [0.1785, 0.1785, 0.1785], payout: 'Quarterly', years: 3, minEGP: 1000, desc: '17.85% fixed yield paid every 3 months.' },
  { id: 'bm_alqimma', bank: 'Banque Misr', name: 'Al Qimma Certificate', rates: [0.1775, 0.1775, 0.1775], payout: 'Monthly', years: 3, minEGP: 1000, desc: '17.75% fixed yield paid monthly.' },
  { id: 'bm_ibnmisr_descending', bank: 'Banque Misr', name: 'Ibn Misr (Descending)', rates: [0.205, 0.1625, 0.1225], payout: 'Monthly', years: 3, minEGP: 1000, desc: 'Front-loaded return: 20.5% Year 1, 16.25% Year 2, 12.25% Year 3.' },
  { id: 'cib_premium', bank: 'CIB', name: 'CIB Premium Certificate', rates: [0.18, 0.18, 0.18], payout: 'Monthly', years: 3, minEGP: 50000, desc: 'Fixed 18.0% annual yield. Private banking tier.' },
  { id: 'alexbank_cdmax', bank: 'ALEXBANK', name: 'CD MAX High-Yield', rates: [0.1825, 0.1825, 0.1825], payout: 'Monthly', years: 3, minEGP: 1000000, desc: 'Fixed 18.25% annual rate. 1M EGP minimum.' }
];

const BANK_CARDS_CATALOG = [
  { id: 'cib_classic', bank: 'CIB / NBE', name: 'Classic Credit Card', feeEGP: 500, apr: 0.27, cashback: 0.015, reqScore: 580, reqIncomeEGP: 120000, limitMult: 0.25, hapBuff: 1, hpBuff: 0, perks: ['1.5% Cashback', 'Score Building'] },
  { id: 'cashback_everyday', bank: 'Retail Global', name: 'Everyday Freedom Cashback Card', feeEGP: 0, apr: 0.19, cashback: 0.02, reqScore: 620, reqIncomeEGP: 30000, limitMult: 0.40, hapBuff: 1, hpBuff: 0, perks: ['2% Unlimited Cashback', 'Zero Annual Fee'] },
  { id: 'cib_wealth', bank: 'CIB Wealth', name: 'CIB Wealth Visa Infinite', feeEGP: 3500, apr: 0.22, cashback: 0.03, reqScore: 730, reqIncomeEGP: 600000, limitMult: 0.60, hapBuff: 4, hpBuff: 2, perks: ['3.0% Cashback', 'Lounge Access', 'Travel Insurance'] },
  { id: 'sapphire_reserve', bank: 'International Reserve', name: 'Premier Passport World Elite', feeEGP: 5000, apr: 0.16, cashback: 0.035, reqScore: 740, reqIncomeEGP: 800000, limitMult: 0.75, hapBuff: 5, hpBuff: 3, perks: ['3.5% Travel Rewards', 'Global Lounge Pass'] }
];

/* =================================================================
   PART 2: HELPERS & STATE REPAIR
   ================================================================= */

window.bankGetRate = function() {
  return typeof rateNow === 'function' ? Math.max(0.0001, rateNow()) : 52.7;
};

window.bankSafeNum = function(v, fallback = 0) {
  if (v === null || v === undefined) return fallback;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : fallback;
};

window.bankRepairState = function() {
  if (!S) return;
  ['wealth', 'income', 'expenses', 'loan', 'nest', 'invest'].forEach(k => { S[k] = bankSafeNum(S[k], 0); });
  
  if (!S.bank || typeof S.bank !== 'object') S.bank = {};
  S.bank.score = Math.min(850, Math.max(300, bankSafeNum(S.bank.score, 680)));
  S.bank.savingsBal = bankSafeNum(S.bank.savingsBal, 0);
  S.bank.missedPmts = bankSafeNum(S.bank.missedPmts, 0);
  if (!Array.isArray(S.bank.activeCards)) S.bank.activeCards = [];
  if (!S.bank.cardDebt || typeof S.bank.cardDebt !== 'object') S.bank.cardDebt = {};
  if (!S.bank.installments || typeof S.bank.installments !== 'object') S.bank.installments = {};
  
  if (Array.isArray(S.bank.loans)) {
    S.bank.loans.forEach(l => {
      l.principal = bankSafeNum(l.principal, 0);
      l.remainingBal = bankSafeNum(l.remainingBal, 0);
      l.annualPmt = bankSafeNum(l.annualPmt, 0);
    });
    S.bank.loans = S.bank.loans.filter(l => l.remainingBal > 0);
  } else S.bank.loans = [];

  if (!Array.isArray(S.certificates)) S.certificates = [];
  S.certificates.forEach(c => {
    c.principalEGP = bankSafeNum(c.principalEGP, 1000);
    c.principalInternal = bankSafeNum(c.principalInternal, 20);
    c.yearsHeld = bankSafeNum(c.yearsHeld, 0);
    c.totalPaid = bankSafeNum(c.totalPaid, 0);
    if (!Array.isArray(c.rateSchedule)) c.rateSchedule = [0.1775, 0.1775, 0.1775];
  });
};

/* =================================================================
   PART 3: BANKING ACTIONS
   ================================================================= */

// --- SAVINGS ---
window.bankDepositSavings = function(rawAmount) {
  bankRepairState();
  const amt = bankSafeNum(rawAmount, 0);
  if (amt <= 0) return hint('Invalid deposit amount.');
  if (S.wealth < amt) return hint('Insufficient funds in Checking.');
  S.wealth -= amt; S.bank.savingsBal += amt;
  log('Deposited ' + money(amt) + ' to Savings.');
  if (typeof render === 'function') render();
};

window.bankWithdrawSavings = function(rawAmount) {
  bankRepairState();
  const amt = bankSafeNum(rawAmount, 0);
  if (amt <= 0) return hint('Invalid withdrawal amount.');
  if (S.bank.savingsBal < amt) return hint('Insufficient funds in Savings.');
  S.bank.savingsBal -= amt; S.wealth += amt;
  log('Withdrew ' + money(amt) + ' to Checking.');
  if (typeof render === 'function') render();
};

// --- CERTIFICATES ---
window.buyCertificate = window.bookCertificate = window.p32BuyCertificate = function(certId, egpInput) {
  if (!S || S.age < 18) return hint('Age 18 required.');
  bankRepairState();
  const cert = BANK_CERTS_CATALOG.find(c => c.id === certId);
  if (!cert) return hint('Certificate not found.');
  
  const egp = Math.round(bankSafeNum(egpInput, 0));
  if (egp < cert.minEGP) return hint('Minimum is ' + cert.minEGP.toLocaleString() + ' EGP.');

  const internal = egp / bankGetRate();
  if (S.wealth < internal) return hint('Insufficient funds. Required: ' + egp.toLocaleString() + ' EGP.');

  S.wealth -= internal;
  S.certificates.push({
    id: 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    certId: cert.id, bank: cert.bank, name: cert.name,
    principalEGP: egp, principalInternal: internal, rateSchedule: cert.rates.slice(),
    yearsTotal: cert.years, yearsHeld: 0, totalPaid: 0, startedYear: typeof gameYear === 'function' ? gameYear() : 2026
  });

  log('Purchased ' + cert.name + ' for ' + egp.toLocaleString() + ' EGP.');
  if (typeof realismNotice === 'function') realismNotice('Certificate Booked', cert.name + ' for ' + egp.toLocaleString() + ' EGP.');
  if (typeof render === 'function') render();
};

window.redeemCertificateEarly = window.p32RedeemCertificate = function(certUid) {
  bankRepairState();
  const idx = S.certificates.findIndex(c => c.id === certUid);
  if (idx === -1) return;
  const cert = S.certificates[idx];
  
  const yearsLeft = cert.yearsTotal - cert.yearsHeld;
  if (yearsLeft > 0) {
    const penaltyEGP = Math.round(cert.principalEGP * 0.0925);
    if (!confirm('Redeeming early incurs a ' + penaltyEGP.toLocaleString() + ' EGP penalty. Continue?')) return;
    const netEGP = cert.principalEGP - penaltyEGP;
    S.wealth += (netEGP / bankGetRate());
    log('Redeemed ' + cert.name + ' early. Received ' + netEGP.toLocaleString() + ' EGP.');
  } else {
    S.wealth += cert.principalInternal;
    log(cert.name + ' matured. Principal returned.');
  }
  S.certificates.splice(idx, 1);
  if (typeof render === 'function') render();
};

// --- FLEXIBLE LOANS ---
window.applyBankLoan = window.p32ApplyCustomLoan = function(amountInput, yearsInput) {
  bankRepairState();
  const amount = bankSafeNum(amountInput, 0);
  const years = Math.max(1, Math.min(10, bankSafeNum(yearsInput, 3)));
  if (amount <= 0) return hint('Invalid loan amount.');
  
  const score = S.bank.score;
  const maxLoan = (S.income || 20000) * (score >= 740 ? 3.5 : score >= 650 ? 2.0 : 1.0);
  if (amount > maxLoan) return hint('Requested amount exceeds bank credit limit.');

  const rate = Math.max(0.04, 0.22 + ((years - 1) * 0.005) - ((score - 600) * 0.0004));
  const annualPmt = Math.round((amount * rate) / (1 - Math.pow(1 + rate, -years)));

  S.wealth += amount;
  S.bank.loans.push({
    id: 'loan_' + Date.now(), principal: amount, remainingBal: amount, rate: rate,
    annualPmt: annualPmt, yearsTotal: years, yearsLeft: years
  });

  log('Bank Loan Approved: ' + money(amount) + '. Term: ' + years + ' yrs at ' + (rate*100).toFixed(1) + '%.');
  if (typeof render === 'function') render();
};

window.p32RepayLoanPart = function(loanId, mode) {
  bankRepairState();
  const loan = S.bank.loans.find(l => l.id === loanId);
  if (!loan) return;
  
  let payAmt = 0;
  if (mode === 'full') payAmt = loan.remainingBal;
  else if (mode === 'half') payAmt = Math.round(loan.remainingBal / 2);
  else if (mode === 'annual') payAmt = Math.min(loan.annualPmt, loan.remainingBal);

  if (S.wealth < payAmt) return hint('Insufficient cash for loan repayment.');
  S.wealth -= payAmt;
  loan.remainingBal -= payAmt;
  
  if (loan.remainingBal > 0 && loan.yearsLeft > 0) {
    loan.annualPmt = Math.round((loan.remainingBal * loan.rate) / (1 - Math.pow(1 + loan.rate, -loan.yearsLeft)));
  }
  S.bank.score = Math.min(850, S.bank.score + (mode === 'full' ? 25 : 8));
  log('Paid ' + money(payAmt) + ' toward loan. Remaining: ' + money(loan.remainingBal));
  S.bank.loans = S.bank.loans.filter(l => l.remainingBal > 0);
  if (typeof render === 'function') render();
};

// --- CREDIT CARDS ---
window.bankGetCreditLimit = function(cardId) {
  if (!S) return 0;
  const card = BANK_CARDS_CATALOG.find(c => c.id === cardId);
  const mult = card ? card.limitMult : 0.25;
  const scoreMult = Math.max(0.4, Math.min(1.4, 0.4 + (S.bank.score - 300) / 550));
  const incomeInternal = (S.job && S.job.salary) ? S.job.salary : (S.income || 0);
  return Math.max(500, Math.round(incomeInternal * mult * scoreMult));
};

window.applyForCard = function(cardId) {
  bankRepairState();
  const card = BANK_CARDS_CATALOG.find(c => c.id === cardId);
  if (!card) return;
  if (S.bank.activeCards.includes(cardId)) return hint('You already own this card.');
  
  const localInc = (S.income || 0) * bankGetRate();
  if (S.bank.score < card.reqScore) return hint('Requires credit score of ' + card.reqScore + '+.');
  if (localInc < card.reqIncomeEGP) return hint('Income requirement not met.');

  S.bank.activeCards.push(cardId);
  S.bank.cardDebt[cardId] = 0;
  if (!S.bank.primaryCard) S.bank.primaryCard = cardId;
  S.bank.score = Math.min(850, S.bank.score + 15);
  log('Approved for ' + card.name + '!');
  if (typeof render === 'function') render();
};

window.payCardDebt = function(cardId, isCustom = false) {
  bankRepairState();
  // Find real card ID even if string is fuzzy
  let realId = S.bank.activeCards.find(c => c === cardId) || Object.keys(S.bank.cardDebt).find(k => S.bank.cardDebt[k] > 0);
  if (!realId) return hint('No balance to pay.');
  
  const debt = bankSafeNum(S.bank.cardDebt[realId], 0);
  if (debt <= 0) return hint('No balance on this card.');
  
  let pay = debt;
  if (isCustom) {
    const debtEGP = Math.round(debt * bankGetRate());
    const input = prompt('How much to pay? (Full: ' + debtEGP.toLocaleString() + ' EGP)', String(debtEGP));
    if (!input) return;
    pay = Number(input) / bankGetRate();
  }

  pay = Math.min(pay, debt, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash.');
  
  S.wealth -= pay;
  S.bank.cardDebt[realId] = Math.max(0, debt - pay);
  log('Paid ' + money(pay) + ' toward credit card.');
  if (S.bank.cardDebt[realId] < 0.5) S.bank.score = Math.min(850, S.bank.score + 8);
  if (typeof render === 'function') render();
};

// --- EARLY PAYOFFS (Installments & Mortgages) ---
window.p59PayInstallmentCustom = function(key) {
  bankRepairState();
  if (!S.bank.installments[key]) return hint('Not found.');
  const inst = S.bank.installments[key];
  const remEGP = Math.round(inst.remaining * bankGetRate());
  const input = prompt('Pay early? (Full: ' + remEGP.toLocaleString() + ' EGP)', '');
  if (!input) return;
  const pay = Math.min(Number(input) / bankGetRate(), inst.remaining, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash.');
  S.wealth -= pay;
  inst.remaining = Math.max(0, inst.remaining - pay);
  log('Paid ' + money(pay) + ' early toward ' + (inst.name||'installment') + '.');
  if (inst.remaining <= 0.5) delete S.bank.installments[key];
  if (typeof render === 'function') render();
};

window.p59PayInstallmentFull = function(key) {
  bankRepairState();
  if (!S.bank.installments[key]) return;
  const inst = S.bank.installments[key];
  if (inst.remaining > S.wealth) return hint('Not enough cash.');
  S.wealth -= inst.remaining;
  delete S.bank.installments[key];
  log('Paid off installment in full!');
  if (typeof render === 'function') render();
};

window.p59PayMortgageCustom = function(id) {
  const home = (S.ownedHomes || []).find(h => h.id === id);
  if (!home || !home.balance) return;
  const balEGP = Math.round(home.balance * bankGetRate());
  const input = prompt('Pay mortgage? (Full: ' + balEGP.toLocaleString() + ' EGP)', '');
  if (!input) return;
  const pay = Math.min(Number(input) / bankGetRate(), home.balance, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash.');
  S.wealth -= pay; home.balance -= pay;
  log('Paid ' + money(pay) + ' toward mortgage.');
  if (home.balance <= 0.5) home.balance = 0;
  if (typeof render === 'function') render();
};

window.p59PayMortgageFull = function(id) {
  const home = (S.ownedHomes || []).find(h => h.id === id);
  if (!home || home.balance > S.wealth) return hint('Not enough cash.');
  S.wealth -= home.balance; home.balance = 0;
  log('Mortgage paid off in full!');
  if (typeof render === 'function') render();
};

// --- SHARED ACCOUNT & WIFE ---
window.depositShared = window.p35DepositShared = window.p37DepositShared = function() {
  if (!S.marriage) S.marriage = {};
  const input = prompt('Amount to deposit (EGP):', '');
  if (!input) return;
  const internal = Number(input) / bankGetRate();
  if (S.wealth < internal) return hint('Not enough cash.');
  S.wealth -= internal; S.marriage.sharedBal = (S.marriage.sharedBal || 0) + internal;
  log('Deposited ' + Number(input).toLocaleString() + ' EGP to shared account.');
  if (typeof render === 'function') render();
};

window.withdrawShared = window.p35WithdrawShared = window.p37WithdrawShared = function() {
  if (!S.marriage) S.marriage = {};
  const availableEGP = Math.round((S.marriage.sharedBal || 0) * bankGetRate());
  const input = prompt('Withdraw (EGP). Available: ' + availableEGP.toLocaleString() + ' EGP', '');
  if (!input) return;
  const internal = Number(input) / bankGetRate();
  if ((S.marriage.sharedBal || 0) < internal) return hint('Not enough in shared account.');
  S.marriage.sharedBal -= internal; S.wealth += internal;
  log('Withdrew ' + Number(input).toLocaleString() + ' EGP from shared account.');
  if (typeof render === 'function') render();
};


/* =================================================================
   PART 4: TICK PROCESSORS (Yearly & Monthly)
   ================================================================= */

window.bankProcessYearly = function() {
  if (!S || S.dead || S.age < 18) return;
  bankRepairState();

  // 1. Savings Yield
  if (S.bank.savingsBal > 0) {
    const earned = S.bank.savingsBal * (S.country === 'egy' ? 0.16 : 0.045);
    S.bank.savingsBal += earned;
    log('Savings earned ' + money(earned) + ' interest.');
  }

  // 2. Certificates
  for (let i = S.certificates.length - 1; i >= 0; i--) {
    const c = S.certificates[i];
    if (c.yearsHeld >= c.yearsTotal) continue;
    const rate = c.rateSchedule[Math.min(c.yearsHeld, c.rateSchedule.length - 1)];
    const interest = c.principalInternal * rate;
    
    // In yearly pacing, we credit the whole year. In monthly, p52 Monthly Tick handles it.
    if (S.pacing !== 'monthly') {
      S.wealth += interest; S.income += interest;
      c.totalPaid += (c.principalEGP * rate);
      log(c.name + ' paid yield: ' + money(interest));
    }
    
    c.yearsHeld++;
    if (c.yearsHeld >= c.yearsTotal) {
      S.wealth += c.principalInternal;
      log(c.name + ' matured. Principal returned.');
      c.matured = true;
    }
  }
  S.certificates = S.certificates.filter(c => !c.matured);

  // 3. Credit Cards
  S.bank.activeCards.forEach(id => {
    const card = BANK_CARDS_CATALOG.find(c => c.id === id);
    if (!card) return;
    if (card.hapBuff && typeof fx === 'function') fx({ happiness: card.hapBuff });
    if (card.hpBuff && typeof fx === 'function') fx({ health: card.hpBuff });
    
    if (S.bank.primaryCard === id && S.expenses > 0) {
      const rew = S.expenses * card.cashback;
      S.wealth += rew; log(card.name + ' earned ' + money(rew) + ' cashback.');
    }
    
    let debt = S.bank.cardDebt[id] || 0;
    if (debt > 0) {
      debt += (debt * card.apr);
      S.bank.score -= 12;
    } else {
      S.bank.score += 10;
    }
    S.bank.cardDebt[id] = Math.max(0, debt);
  });
  S.bank.score = Math.max(300, Math.min(850, S.bank.score));

  // 4. Loans
  S.bank.loans.forEach(l => {
    if (l.remainingBal <= 0) return;
    const due = Math.min(l.annualPmt, l.remainingBal);
    if (S.wealth >= due) {
      S.wealth -= due; S.expenses += due; l.remainingBal -= due; l.yearsLeft--;
      S.bank.score += 12;
    } else {
      l.remainingBal *= 1.08; S.bank.score -= 50; S.bank.missedPmts++;
      if (typeof fx === 'function') fx({ happiness: -10 });
      log('MISSED LOAN PAYMENT! Penalty added.');
    }
  });
  S.bank.loans = S.bank.loans.filter(l => l.remainingBal > 0);

  // 5. Wife Savings & Shared Yield
  if (S.marriage) {
    if (S.marriage.sharedBank && (S.marriage.sharedBal || 0) > 0) {
      const earned = S.marriage.sharedBal * 0.12;
      S.marriage.sharedBal += earned; S.income += earned;
    }
    const spouse = typeof partner === 'function' ? partner() : null;
    if (spouse && spouse.stage === 'married' && S.marriage.wifeWorks) {
      const herInc = spouse.income || 0;
      if (herInc > 0) {
        if (S.marriage.sharedBank) {
          const amt = herInc * (0.15 + (spouse.generosity || 0.5) * 0.25);
          S.marriage.sharedBal += amt;
        } else {
          spouse.personalSavings = (spouse.personalSavings || 0) + (herInc * 0.15);
        }
      }
    }
  }
};

// Monthly processing override for cert totalPaid UI updates
const P28_p52TickBefore = typeof p52MonthlyTick === 'function' ? p52MonthlyTick : null;
window.p52MonthlyTick = function() {
  if (P28_p52TickBefore) P28_p52TickBefore.apply(this, arguments);
  if (!S || S.pacing !== 'monthly' || S.age < 18) return;
  
  let monthlyYieldEGP = 0;
  S.certificates.forEach(c => {
    if (c.matured) return;
    const rate = c.rateSchedule[Math.min(c.yearsHeld, c.rateSchedule.length - 1)];
    const monthlyEGP = (c.principalEGP * rate) / 12;
    monthlyYieldEGP += monthlyEGP;
    c.totalPaid += monthlyEGP;
  });
  if (monthlyYieldEGP > 0) {
    if (!S.p58) S.p58 = {};
    if (S.p58.lastCertLogMonth !== S.pacingAbsoluteMonth) {
      S.p58.lastCertLogMonth = S.pacingAbsoluteMonth;
      log('📈 Certificate interest credited this month: +' + Math.round(monthlyYieldEGP).toLocaleString() + ' EGP.');
    }
  }
};


/* =================================================================
   PART 5: UI OVERRIDES (viewBank, viewMoney, viewShop, buyItem)
   ================================================================= */

// Replace default `buyItem` to route credit purchases to dynamic card limit system
const P28_buyItemBefore = typeof buyItem === 'function' ? buyItem : null;
window.buyItem = function(key, method) {
  if (method === 'credit') {
    if (!S || S.age < 18) return hint('Age 18 required.');
    if (!S.bank || !S.bank.activeCards.length) return hint('No credit card owned. Apply in Bank.');
    const it = catalog().find(x => x.key === key);
    if (!it) return;
    
    const price = shopPrice(it, 0); // simplified cost calc
    let bestCard = null, bestRoom = -1;
    S.bank.activeCards.forEach(id => {
      const room = bankGetCreditLimit(id) - (S.bank.cardDebt[id] || 0);
      if (room >= price && room > bestRoom) { bestCard = id; bestRoom = room; }
    });
    
    if (!bestCard) return hint('Not enough limit on any card for ' + money(price));
    
    S.bank.cardDebt[bestCard] = (S.bank.cardDebt[bestCard] || 0) + price;
    S.inventory.push({
      uid: 'u' + (S.uidN++), key: it.key, cat: it.cat, type: it.type || it.cat, price: price, age: 0
    });
    if (typeof fx === 'function') fx({ happiness: it.hap * 2 });
    log('Charged ' + money(price) + ' to credit card. New balance: ' + money(S.bank.cardDebt[bestCard]));
    render();
    return;
  }
  if (P28_buyItemBefore) return P28_buyItemBefore.apply(this, arguments);
};

// --- VIEW: SHOP (Credit warning) ---
const P28_viewShopBefore = typeof viewShop === 'function' ? viewShop : function() { return ''; };
window.viewShop = function() {
  let html = P28_viewShopBefore.apply(this, arguments);
  if (S && S.age >= 18 && S.bank && S.bank.activeCards && S.bank.activeCards.length > 0) {
    let tRoom = 0, tLim = 0, tDebt = 0;
    S.bank.activeCards.forEach(id => {
      const l = bankGetCreditLimit(id), d = S.bank.cardDebt[id] || 0;
      tLim += l; tDebt += d; tRoom += Math.max(0, l - d);
    });
    const col = tRoom < tLim * 0.1 ? 'var(--rose)' : tRoom < tLim * 0.3 ? 'var(--amber)' : 'var(--mint)';
    html = `<section class="card" style="border-color:${col}">
      <div class="row" style="border:0"><span>Credit Available</span><b class="mono" style="color:${col}">${money(tRoom)}</b></div>
      <p class="muted" style="font-size:.78rem;margin-top:2px">Total debt ${money(tDebt)} of ${money(tLim)} limit.</p>
    </section>` + html;
  }
  return html;
};

// --- VIEW: MONEY (Financial Overview + Early Pay) ---
const P28_viewMoneyBefore = typeof viewMoney === 'function' ? viewMoney : function() { return ''; };
window.viewMoney = function() {
  let originalHtml = P28_viewMoneyBefore.apply(this, arguments);
  if (!S || S.age < 18) return originalHtml;
  bankRepairState();

  // Debt Calculations
  const mort = (S.ownedHomes || []).reduce((s, h) => s + Math.max(0, Number(h.balance) || 0), 0);
  const loan = S.bank.loans.reduce((s, l) => s + l.remainingBal, 0);
  const card = Object.values(S.bank.cardDebt).reduce((s, d) => s + d, 0);
  const stud = Math.max(0, S.loan || 0);
  const tDebt = mort + loan + card + stud;

  // Assets
  const grossProp = (S.ownedHomes || []).reduce((s, h) => s + (Number(h.value) || 0), 0);
  let certRows = '';
  if (S.certificates.length) {
    const tPaid = S.certificates.reduce((s, c) => s + c.totalPaid, 0);
    certRows = `<div class="row"><span>Certificate interest earned</span><b class="mono" style="color:var(--mint)">+E£${Math.round(tPaid).toLocaleString()}</b></div>`;
  }

  const overviewCard = `<section class="card">
    <h3>Financial Overview</h3>
    <div class="row"><span>Cash</span><b class="mono">${money(S.wealth)}</b></div>
    <div class="row"><span>Savings Account</span><b class="mono">${money(S.bank.savingsBal)}</b></div>
    <div class="row"><span>Investments</span><b class="mono">${money(S.invest)}</b></div>
    <div class="row"><span>Retirement Pot</span><b class="mono">${money(S.nest)}</b></div>
    ${certRows}
    <div class="row"><span>Property (Gross)</span><b class="mono">${money(grossProp)}</b></div>
    <div class="row"><span>Property (Net Equity)</span><b class="mono">${money(grossProp - mort)}</b></div>
    <div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px">
      <span><b>Debt Breakdown</b></span><b class="mono" style="color:var(--rose)">${money(-tDebt)}</b>
    </div>
    ${mort > 0 ? `<div class="row"><span>Home Mortgages</span><b class="mono" style="color:var(--rose)">${money(-mort)}</b></div>` : ''}
    ${loan > 0 ? `<div class="row"><span>Bank Loans</span><b class="mono" style="color:var(--rose)">${money(-loan)}</b></div>` : ''}
    ${card > 0 ? `<div class="row"><span>Credit Cards</span><b class="mono" style="color:var(--rose)">${money(-card)}</b></div>` : ''}
    ${stud > 0 ? `<div class="row"><span>Student Loan</span><b class="mono" style="color:var(--rose)">${money(-stud)}</b></div>` : ''}
    <div style="margin-top:8px; display:flex; gap:6px;">
      <button class="btn" onclick="go('bank')">Manage & Pay Debt Early in Bank Tab</button>
    </div>
  </section>`;

  // Strip the old overview from original HTML
  let cleanHtml = originalHtml.replace(/<section class="card">\s*<h3>Financial Overview<\/h3>[\s\S]*?<\/section>/, '');
  return overviewCard + cleanHtml;
};

// --- VIEW: BANK (The Master UI) ---
window.viewBank = function() {
  if (!S || S.age < 18) return '<section class="card"><h3>Banking</h3><p class="muted">Banking services unlock at age 18.</p></section>';
  bankRepairState();
  const rate = bankGetRate();

  // 1. Dashboard
  let html = `<section class="card">
    <h3>💳 Financial Dashboard & Credit</h3>
    <div class="row"><span>Credit Score</span><b class="mono" style="color:${S.bank.score >= 700 ? 'var(--mint)' : 'var(--rose)'}">${Math.floor(S.bank.score)} / 850</b></div>
    <div class="row"><span>Checking Account</span><b class="mono">${money(S.wealth)}</b></div>
    <div class="row"><span>High-Yield Savings (16% APY)</span><b class="mono">${money(S.bank.savingsBal)}</b></div>
    <div style="display:flex; gap:6px; margin-top:8px">
      <button class="btn" onclick="bankDepositSavings(prompt('Deposit amount:'))">Deposit</button>
      <button class="btn" onclick="bankWithdrawSavings(prompt('Withdraw amount:'))">Withdraw</button>
    </div>
  </section>`;

  // 2. Shared Account
  if (S.marriage) {
    const sEGP = Math.round((S.marriage.sharedBal || 0) * rate);
    html += `<section class="card">
      <h3>💍 Shared Family Account</h3>
      <div class="row"><span>Shared Balance</span><b>${money(S.marriage.sharedBal || 0)}</b></div>
      <p class="muted" style="font-size:.78rem; margin-top:2px;">≈ ${sEGP.toLocaleString()} EGP · Earns 12% APY</p>
      <div style="display:flex; gap:6px; margin-top:8px">
        <button class="btn" onclick="depositShared()">Deposit (EGP)</button>
        <button class="btn" onclick="withdrawShared()">Withdraw (EGP)</button>
      </div>
    </section>`;
  }

  // 3. Early Debt Payoff Manager (Installments & Mortgages)
  const insts = Object.entries(S.bank.installments).filter(x => x[1].remaining > 0);
  const morts = (S.ownedHomes || []).filter(h => h.balance > 0);
  if (insts.length || morts.length) {
    html += `<section class="card" style="border-color:var(--rose)">
      <h3>💸 Early Debt Payoff</h3><p class="muted">Pay down debt early to reduce interest.</p>`;
    
    insts.forEach(([k, i]) => {
      const rEGP = Math.round(i.remaining * rate);
      html += `<div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
        <b>${i.name || 'Installment'}</b><div class="row"><span>Remaining</span><b class="mono">${rEGP.toLocaleString()} EGP</b></div>
        <div style="display:flex; gap:6px; margin-top:6px">
          <button class="btn" onclick="p59PayInstallmentCustom('${k}')">Pay Custom</button>
          <button class="btn" onclick="p59PayInstallmentFull('${k}')">Pay Full</button>
        </div></div>`;
    });
    
    morts.forEach(h => {
      const bEGP = Math.round(h.balance * rate);
      html += `<div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
        <b>${h.name || 'Mortgage'}</b><div class="row"><span>Balance</span><b class="mono">${bEGP.toLocaleString()} EGP</b></div>
        <div style="display:flex; gap:6px; margin-top:6px">
          <button class="btn" onclick="p59PayMortgageCustom('${h.id}')">Pay Custom</button>
          <button class="btn" onclick="p59PayMortgageFull('${h.id}')">Pay Full</button>
        </div></div>`;
    });
    html += `</section>`;
  }

  // 4. Certificates
  html += `<section class="card" style="border-color:var(--mint)"><h3>💼 Deposit Certificates</h3>`;
  const activeCerts = S.certificates.filter(c => !c.matured);
  if (activeCerts.length) {
    html += `<b>Your Active Certificates</b>`;
    activeCerts.forEach(c => {
      html += `<div style="background:var(--bg); border:1px solid var(--line); padding:10px; border-radius:8px; margin-top:6px">
        <b>${c.name}</b> <span class="muted">· ${c.bank}</span><br>
        <span class="muted" style="font-size:.85rem">Principal: <b>${c.principalEGP.toLocaleString()} EGP</b> · Term: Yr ${c.yearsHeld+1} of ${c.yearsTotal}</span><br>
        <span style="color:var(--mint); font-size:.85rem">Total Paid Out: +${Math.round(c.totalPaid).toLocaleString()} EGP</span>
        <button class="btn" style="margin-top:6px" onclick="redeemCertificateEarly('${c.id}')">Redeem Early (Penalty)</button>
      </div>`;
    });
  }
  html += `<h4 style="margin-top:14px; color:var(--cyan);">Available Products</h4>`;
  BANK_CERTS_CATALOG.forEach(c => {
    html += `<div style="border:1px solid var(--line); padding:10px; border-radius:8px; margin-top:6px">
      <b>${c.name}</b> <span class="muted">· ${c.bank}</span><br>
      <span class="muted" style="font-size:.85rem">${c.desc} Min: ${c.minEGP.toLocaleString()} EGP.</span>
      <button class="btn" style="margin-top:6px" onclick="buyCertificate('${c.id}', prompt('Deposit Amount in EGP:', '${c.minEGP}'))">Book Certificate</button>
    </div>`;
  });
  html += `</section>`;

  // 5. Flexible Loans
  html += `<section class="card"><h3>🏛️ Personal Loans</h3>`;
  S.bank.loans.forEach(l => {
    html += `<div style="border:1px solid var(--line); padding:10px; border-radius:8px; margin-top:6px">
      <span style="color:var(--rose)">Remaining Balance: ${money(l.remainingBal)}</span><br>
      <span class="muted" style="font-size:.85rem">Rate: ${(l.rate*100).toFixed(1)}% · Annual: ${money(l.annualPmt)} (${l.yearsLeft} yrs left)</span>
      <div style="display:flex; gap:6px; margin-top:6px">
        <button class="btn" onclick="p32RepayLoanPart('${l.id}','annual')">Pay Annual</button>
        <button class="btn" onclick="p32RepayLoanPart('${l.id}','full')">Pay Full</button>
      </div>
    </div>`;
  });
  html += `<div style="margin-top:12px"><b>Request Custom Loan</b>
    <button class="btn" style="margin-top:4px" onclick="applyBankLoan(prompt('Loan Amount:'), prompt('Years (1-10):', '3'))">Apply For Financing</button></div></section>`;

  // 6. Credit Cards
  html += `<section class="card" style="border-color:var(--violet)"><h3>💳 Credit Cards</h3>`;
  if (S.bank.activeCards.length) {
    html += `<b>Your Cards</b>`;
    S.bank.activeCards.forEach(id => {
      const card = BANK_CARDS_CATALOG.find(c => c.id === id);
      const debt = S.bank.cardDebt[id] || 0;
      const limit = bankGetCreditLimit(id);
      const isPri = S.bank.primaryCard === id;
      html += `<div style="border:1px solid var(--line); padding:10px; border-radius:8px; margin-top:6px">
        <b>${card ? card.name : id}</b> ${isPri ? '<span style="color:var(--cyan);font-size:.8rem">(Primary)</span>' : ''}<br>
        <div class="row" style="padding:2px 0"><span>Owed / Limit</span><b class="mono" style="color:${debt>0?'var(--rose)':'inherit'}">${money(debt)} / ${money(limit)}</b></div>
        <div style="display:flex; gap:6px; margin-top:6px">
          ${debt > 0 ? `<button class="btn" onclick="payCardDebt('${id}', true)">Pay Debt</button>` : ''}
          ${!isPri ? `<button class="btn" onclick="S.bank.primaryCard='${id}'; render();">Make Primary</button>` : ''}
        </div></div>`;
    });
  }
  html += `<h4 style="margin-top:14px; color:var(--cyan);">Apply for Cards</h4>`;
  BANK_CARDS_CATALOG.forEach(c => {
    const owned = S.bank.activeCards.includes(c.id);
    html += `<div style="border:1px solid var(--line); padding:10px; border-radius:8px; margin-top:6px">
      <b>${c.name}</b> <span class="muted">· Min Score: ${c.reqScore}</span><br>
      <span class="muted" style="font-size:.85rem">${c.perks.join(' · ')}</span>
      <button class="btn" style="margin-top:6px" ${owned ? 'disabled' : ''} onclick="applyForCard('${c.id}')">${owned ? 'Issued' : 'Apply'}</button>
    </div>`;
  });
  html += `</section>`;

  return html;
};


/* =================================================================
   PART 6: ENGINE HOOK REGISTRATION
   ================================================================= */

if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('migrate', bankRepairState);
  GameHooks.on('newGame', bankRepairState);
  GameHooks.on('year', window.bankProcessYearly);
} else {
  // Fallback if GameHooks doesn't exist
  const _migrateBefore = typeof migrate === 'function' ? migrate : null;
  window.migrate = function(o) { const r = _migrateBefore ? _migrateBefore(o) : o; bankRepairState(); return r; };
  
  const _ageUpBefore = typeof ageUp === 'function' ? ageUp : null;
  window.ageUp = function() {
    const a0 = S && S.age;
    const r = _ageUpBefore ? _ageUpBefore.apply(this, arguments) : null;
    if (S && S.age !== a0) window.bankProcessYearly();
    return r;
  };
}

console.log('[p28] Master Consolidated Banking loaded natively. Replaces 8 modules.');
