/* =====================================================================
   28. GLOBAL BANKING, HIGH-YIELD CERTIFICATES & CREDIT SYSTEM
   Connects via GameHooks (see 90-hooks.js).
   ===================================================================== */

/* ---------- 1. EGYPTIAN & GLOBAL CERTIFICATES OF DEPOSIT (CDs) ---------- */
const BANK_CERTIFICATES_EGYPT = [
  {
    id: 'bm_ibn_misr_tiered',
    bank: 'Banque Misr / NBE',
    name: 'Ibn Misr 3-Year Tiered Certificate',
    rates: [0.21, 0.165, 0.125], // Year 1: 21%, Year 2: 16.5%, Year 3: 12.5%
    tenorYears: 3,
    minAmountEGP: 1000,
    type: 'tiered',
    payoutFreq: 'Monthly',
    desc: 'High initial return: 21.0% Year 1, 16.5% Year 2, 12.5% Year 3 (Paid monthly).'
  },
  {
    id: 'nbe_platinum_3yr',
    bank: 'National Bank of Egypt (NBE)',
    name: 'Platinum 3-Year Monthly Certificate',
    rate: 0.195, // 19.5% annual
    tenorYears: 3,
    minAmountEGP: 1000,
    type: 'fixed',
    payoutFreq: 'Monthly',
    desc: '19.5% fixed annual return paid out monthly into your checking account.'
  },
  {
    id: 'cib_premium_3yr',
    bank: 'CIB Egypt',
    name: 'CIB Premium 3-Year Fixed CD',
    rate: 0.180, // 18.0% annual
    tenorYears: 3,
    minAmountEGP: 50000,
    type: 'fixed',
    payoutFreq: 'Monthly',
    desc: '18.0% fixed annual return paid monthly. High stability tier.'
  }
];

const BANK_CERTIFICATES_GLOBAL = [
  {
    id: 'global_term_cd_3yr',
    bank: 'Global Reserve Bank',
    name: 'High-Yield 3-Year Term Certificate',
    rate: 0.085, // 8.5% annual
    tenorYears: 3,
    minAmountLocal: 1000,
    type: 'fixed',
    payoutFreq: 'Monthly',
    desc: '8.5% fixed annual rate paid monthly to checking account over 3 years.'
  }
];

/* ---------- 2. CREDIT CARDS CATALOG ---------- */
const BANK_CARDS_EGYPT = [
  {
    id: 'cib_classic',
    name: 'CIB / NBE Classic Credit Card',
    bank: 'Commercial International Bank / NBE',
    fee: 300,
    apr: 0.28,
    cashback: 0.01,
    perks: ['Basic EGP limit', '1% rewards cashback'],
    reqIncomeEGP: 120000,
    reqScore: 550,
    limitMult: 0.25,
    hapBonus: 0
  },
  {
    id: 'cib_wealth',
    name: 'CIB Wealth / HSBC Premier Visa Infinite',
    bank: 'CIB / HSBC Egypt',
    fee: 2500,
    apr: 0.24,
    cashback: 0.025,
    perks: ['High EGP limit', '2.5% luxury cashback', 'Airport Lounge Access', 'Dedicated Relationship Manager'],
    reqIncomeEGP: 600000,
    reqScore: 720,
    limitMult: 0.60,
    hapBonus: 3
  }
];

const BANK_CARDS_GLOBAL = [
  {
    id: 'cashback_everyday',
    name: 'Everyday Freedom Cashback Card',
    bank: 'Global Retail Bank',
    fee: 0,
    apr: 0.19,
    cashback: 0.015,
    perks: ['Zero annual fee', '1.5% unlimited cashback', 'Auto fraud protection'],
    reqIncomeLocal: 25000,
    reqScore: 620,
    limitMult: 0.30,
    hapBonus: 0
  },
  {
    id: 'sapphire_reserve',
    name: 'Premier Passport World Elite',
    bank: 'International Reserve Bank',
    fee: 250,
    apr: 0.16,
    cashback: 0.03,
    perks: ['Global Airport Lounge Access', 'Travel Insurance', '3% Travel Rewards', 'Concierge Service'],
    reqIncomeLocal: 75000,
    reqScore: 740,
    limitMult: 0.75,
    hapBonus: 4
  }
];

/* ---------- 3. HELPERS & AUTO-REPAIR SYSTEM ---------- */
function bankOn() { return !!(S && S.age >= 18); }

function sanitizeNum(v, fallback = 0) {
  const n = Number(v);
  return (isNaN(n) || !isFinite(n)) ? fallback : n;
}

function bankInit(o) {
  if (!o) return;

  // Auto-Repair corrupted NaN balances
  o.wealth = sanitizeNum(o.wealth, 0);

  if (!o.bank || typeof o.bank !== 'object') {
    o.bank = {};
  }
  
  o.bank.score = sanitizeNum(o.bank.score, 680);
  o.bank.savingsBal = sanitizeNum(o.bank.savingsBal, 0);
  o.bank.activeCards = Array.isArray(o.bank.activeCards) ? o.bank.activeCards : [];
  o.bank.primaryCard = o.bank.primaryCard || null;
  o.bank.cardDebt = (o.bank.cardDebt && typeof o.bank.cardDebt === 'object') ? o.bank.cardDebt : {};
  o.bank.loans = Array.isArray(o.bank.loans) ? o.bank.loans : [];
  o.bank.certificates = Array.isArray(o.bank.certificates) ? o.bank.certificates : [];
  o.bank.missedPmts = sanitizeNum(o.bank.missedPmts, 0);
}

function bankLocalRate(year) {
  return Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry(S.country, year || gameYear()) : 1);
}

function egpToLocalBank(egp, year) {
  const egyR = Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry('egy', year || gameYear()) : 1);
  return (Number(egp) || 0) / egyR * bankLocalRate(year);
}

function bankFmt(internalAmount) {
  const safeAmt = sanitizeNum(internalAmount, 0);
  if (typeof money === 'function') return money(safeAmt);
  return '$' + Math.round(safeAmt).toLocaleString();
}

function parseInputNumber(raw) {
  if (raw === null || raw === undefined) return NaN;
  if (typeof raw === 'number') return raw;
  const cleaned = String(raw).replace(/[^0-9.]/g, '');
  return Number(cleaned);
}

/* ---------- 4. SAVINGS ACCOUNT OPERATIONS ---------- */
function bankDepositSavings(rawAmount) {
  bankInit(S);
  const amount = parseInputNumber(rawAmount);

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount to deposit.');
    return hint('Invalid deposit amount.');
  }
  if (S.wealth < amount) {
    alert(`Insufficient cash in Checking Account. You have ${bankFmt(S.wealth)}.`);
    return hint('Insufficient funds in Checking account.');
  }

  S.wealth = sanitizeNum(S.wealth - amount, 0);
  S.bank.savingsBal = sanitizeNum(S.bank.savingsBal + amount, 0);
  
  log(`Transferred ${bankFmt(amount)} from Checking to High-Yield Savings.`);
  if (typeof render === 'function') render();
}

function bankWithdrawSavings(rawAmount) {
  bankInit(S);
  const amount = parseInputNumber(rawAmount);

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount to withdraw.');
    return hint('Invalid withdrawal amount.');
  }
  if (S.bank.savingsBal < amount) {
    alert(`Insufficient funds in Savings Account. You have ${bankFmt(S.bank.savingsBal)}.`);
    return hint('Insufficient funds in Savings account.');
  }

  S.bank.savingsBal = sanitizeNum(S.bank.savingsBal - amount, 0);
  S.wealth = sanitizeNum(S.wealth + amount, 0);

  log(`Withdrew ${bankFmt(amount)} from Savings to Checking Account.`);
  if (typeof render === 'function') render();
}

function getSavingsAPY() {
  return S.country === 'egy' ? 0.16 : 0.045; // 16% in Egypt, 4.5% Globally
}

/* ---------- 5. CERTIFICATES OF DEPOSIT (CDs) ENGINE ---------- */
function buyCertificate(certId, rawAmount) {
  bankInit(S);
  const isEgypt = S.country === 'egy';
  const catalog = isEgypt ? BANK_CERTIFICATES_EGYPT : BANK_CERTIFICATES_GLOBAL;
  const cert = catalog.find(c => c.id === certId);
  if (!cert) return hint('Certificate offer not found.');

  const amount = parseInputNumber(rawAmount);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount.');
    return hint('Invalid amount entered.');
  }

  const minAmtEGP = isEgypt ? cert.minAmountEGP : cert.minAmountLocal;
  const minAmtInternal = isEgypt ? (minAmtEGP / Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry('egy', gameYear()) : 1)) : minAmtEGP;

  if (amount < minAmtInternal) {
    alert(`Minimum deposit required for this certificate is ${bankFmt(minAmtInternal)}.`);
    return hint('Amount below certificate minimum.');
  }

  if (S.wealth < amount) {
    alert(`Insufficient funds in Checking Account. You need ${bankFmt(amount)}.`);
    return hint('Insufficient cash for Certificate booking.');
  }

  S.wealth = sanitizeNum(S.wealth - amount, 0);

  const initialRate = cert.type === 'tiered' ? cert.rates[0] : cert.rate;

  S.bank.certificates.push({
    uid: 'cd_' + Math.random().toString(36).slice(2, 8),
    certId: cert.id,
    name: cert.name,
    bank: cert.bank,
    principal: amount,
    boughtYear: gameYear(),
    tenorYears: cert.tenorYears,
    yearsPassed: 0,
    type: cert.type,
    rate: initialRate,
    rates: cert.rates || null,
    isEgypt: isEgypt
  });

  log(`Booked Investment Certificate: ${cert.name} for ${bankFmt(amount)}.`);
  if (typeof render === 'function') render();
}

function redeemCertificateEarly(uid) {
  bankInit(S);
  const idx = S.bank.certificates.findIndex(c => c.uid === uid);
  if (idx < 0) return;
  const c = S.bank.certificates[idx];

  const penalty = Math.round(c.principal * 0.05); // 5% early break penalty
  const refund = Math.max(0, c.principal - penalty);

  S.wealth = sanitizeNum(S.wealth + refund, 0);
  S.bank.certificates.splice(idx, 1);

  log(`Early Certificate Break: Redeemed ${c.name} early. Received ${bankFmt(refund)} after 5% penalty.`);
  if (typeof render === 'function') render();
}

/* ---------- 6. CREDIT CARDS & LOANS ---------- */
function getCreditLimit(card) {
  const isEgypt = S.country === 'egy';
  const localInc = (S.income || 0) * bankLocalRate(gameYear());
  
  if (isEgypt) {
    return Math.round((localInc * card.limitMult) / bankLocalRate(gameYear()));
  } else {
    return Math.round(S.income * card.limitMult);
  }
}

function applyForCard(cardId) {
  bankInit(S);
  const isEgypt = S.country === 'egy';
  const catalog = isEgypt ? BANK_CARDS_EGYPT : BANK_CARDS_GLOBAL;
  const card = catalog.find(c => c.id === cardId);
  if (!card) return hint('Card offer no longer available.');

  if (S.bank.activeCards.includes(cardId)) return hint('You already own this card.');

  const localInc = (S.income || 0) * bankLocalRate(gameYear());
  const reqInc = isEgypt ? card.reqIncomeEGP : card.reqIncomeLocal;

  if (S.bank.score < card.reqScore) {
    return hint(`Application Declined: Credit score of ${card.reqScore} required.`);
  }
  if (localInc < reqInc) {
    return hint('Application Declined: Minimum income requirement not met.');
  }

  S.bank.activeCards.push(cardId);
  S.bank.cardDebt[cardId] = 0;
  if (!S.bank.primaryCard) S.bank.primaryCard = cardId;

  S.bank.score = Math.min(850, S.bank.score + 15);
  log(`Credit Card Approved: ${card.name}!`);
  if (typeof render === 'function') render();
}

function payCardDebt(cardId, amount) {
  bankInit(S);
  const currentDebt = sanitizeNum(S.bank.cardDebt[cardId], 0);
  if (currentDebt <= 0) return hint('No balance owed on this card.');
  
  const payAmt = Math.min(amount, currentDebt);
  if (S.wealth < payAmt) return hint('Not enough funds in Checking account.');

  S.wealth = sanitizeNum(S.wealth - payAmt, 0);
  S.bank.cardDebt[cardId] = sanitizeNum(S.bank.cardDebt[cardId] - payAmt, 0);
  
  if (S.bank.cardDebt[cardId] <= 0) {
    S.bank.score = Math.min(850, S.bank.score + 8);
  }
  log(`Paid ${bankFmt(payAmt)} toward credit card balance.`);
  if (typeof render === 'function') render();
}

function applyBankLoan(rawAmount, years) {
  bankInit(S);
  const amount = parseInputNumber(rawAmount);
  if (isNaN(amount) || amount <= 0 || years < 1 || years > 5) return hint('Invalid loan request.');

  const maxLoan = (S.income || 0) * (S.bank.score > 740 ? 3.0 : 1.5);
  if (amount > maxLoan) return hint(`Loan Declined: Maximum approval limit is ${bankFmt(maxLoan)}.`);

  const baseRate = S.country === 'egy' ? 0.22 : 0.07;
  const scoreDiscount = (S.bank.score - 600) * 0.0003;
  const rate = Math.max(0.04, baseRate - scoreDiscount);

  const annualPmt = Math.round((amount * rate) / (1 - Math.pow(1 + rate, -years)));

  S.wealth = sanitizeNum(S.wealth + amount, 0);
  S.bank.loans.push({
    id: 'loan_' + gameYear() + '_' + Math.random().toString(36).slice(2, 5),
    principal: amount,
    remainingBal: amount,
    rate: rate,
    annualPmt: annualPmt,
    yearsTotal: years,
    yearsLeft: years
  });

  log(`Bank Loan Approved: ${bankFmt(amount)} deposited. Annual payment: ${bankFmt(annualPmt)} for ${years} years.`);
  if (typeof render === 'function') render();
}

/* ---------- 7. YEARLY TICK ENGINE ---------- */
function bankYear() {
  if (!S || S.dead || S.age < 18) return;
  bankInit(S);
  const y = gameYear();

  // A. High Yield Savings Interest
  if (S.bank.savingsBal > 0) {
    const apy = getSavingsAPY();
    const interestEarned = Math.round(S.bank.savingsBal * apy);
    S.bank.savingsBal = sanitizeNum(S.bank.savingsBal + interestEarned, 0);
    log(`Savings Account Interest: Earned ${bankFmt(interestEarned)} (${(apy * 100).toFixed(1)}% APY).`);
  }

  // B. Certificates Dividend Yield Payouts
  if (S.bank.certificates.length > 0) {
    for (let i = S.bank.certificates.length - 1; i >= 0; i--) {
      const c = S.bank.certificates[i];
      
      let currentRate = c.rate;
      if (c.type === 'tiered' && Array.isArray(c.rates)) {
        currentRate = c.rates[Math.min(c.yearsPassed, c.rates.length - 1)];
      }

      const annualPayout = Math.round(c.principal * currentRate);
      const monthlyPayout = Math.round(annualPayout / 12);

      // Deposit monthly return payouts into checking account
      S.wealth = sanitizeNum(S.wealth + annualPayout, 0);
      c.yearsPassed++;

      log(`Certificate Dividend (${c.name}): Earned ${bankFmt(annualPayout)} this year (${bankFmt(monthlyPayout)}/month).`);

      // Maturity payout
      if (c.yearsPassed >= c.tenorYears) {
        S.wealth = sanitizeNum(S.wealth + c.principal, 0);
        log(`Certificate Matured! ${c.name} term completed. Principal of ${bankFmt(c.principal)} returned to Checking.`);
        S.bank.certificates.splice(i, 1);
      }
    }
  }

  // C. Process Credit Cards
  const isEgypt = S.country === 'egy';
  const catalog = isEgypt ? BANK_CARDS_EGYPT : BANK_CARDS_GLOBAL;

  S.bank.activeCards.forEach(cardId => {
    const card = catalog.find(c => c.id === cardId);
    if (!card) return;

    let debt = sanitizeNum(S.bank.cardDebt[cardId], 0);

    const feeInternal = card.fee / bankLocalRate(y);
    if (card.fee > 0) debt += feeInternal;

    if (card.hapBonus > 0 && typeof fx === 'function') fx({ happiness: card.hapBonus });

    if (S.bank.primaryCard === cardId && S.expenses > 0) {
      const reward = Math.round(S.expenses * card.cashback);
      S.wealth = sanitizeNum(S.wealth + reward, 0);
      log(`${card.name} Rewards: Earned ${bankFmt(reward)} cashback.`);
    }

    if (debt > 0) {
      const interest = Math.round(debt * card.apr);
      debt += interest;
      S.bank.score = Math.max(300, S.bank.score - 10);
      if (typeof fx === 'function') fx({ happiness: -2 });
    }

    S.bank.cardDebt[cardId] = Math.round(debt);
  });

  // D. Process Loans
  S.bank.loans.forEach(loan => {
    if (loan.remainingBal <= 0) return;

    if (S.wealth >= loan.annualPmt) {
      S.wealth = sanitizeNum(S.wealth - loan.annualPmt, 0);
      S.expenses = (S.expenses || 0) + loan.annualPmt;
      loan.remainingBal -= Math.min(loan.remainingBal, loan.annualPmt);
      loan.yearsLeft--;
      S.bank.score = Math.min(850, S.bank.score + 10);
      log(`Bank Loan Payment: Paid ${bankFmt(loan.annualPmt)}. Remaining: ${bankFmt(loan.remainingBal)}.`);
    } else {
      loan.remainingBal = Math.round(loan.remainingBal * 1.08);
      S.bank.score = Math.max(300, S.bank.score - 45);
      S.bank.missedPmts++;
      log(`MISSED LOAN PAYMENT! Penalty added and score dropped to ${S.bank.score}.`);
      if (typeof fx === 'function') fx({ happiness: -8 });
    }
  });

  S.bank.loans = S.bank.loans.filter(l => l.remainingBal > 0);
}

/* ---------- 8. UI VIEW RENDER ENGINE ---------- */
function viewBank() {
  if (!bankOn()) return '<section class="card"><h3>Banking</h3><p class="muted">Banking services unlock at age 18.</p></section>';
  bankInit(S);

  const isEgypt = S.country === 'egy';
  const cardCatalog = isEgypt ? BANK_CARDS_EGYPT : BANK_CARDS_GLOBAL;
  const certCatalog = isEgypt ? BANK_CERTIFICATES_EGYPT : BANK_CERTIFICATES_GLOBAL;

  const score = S.bank.score;
  const scoreColor = score >= 740 ? 'var(--mint)' : score >= 650 ? 'var(--amber)' : 'var(--rose)';

  let html = `
    <section class="card">
      <h3>Financial Dashboard & Credit Rating</h3>
      <div class="row"><span>Credit Score</span><b class="mono" style="color:${scoreColor}">${score} / 850</b></div>
      <div class="row"><span>Checking Account</span><b class="mono" style="color:var(--mint)">${bankFmt(S.wealth)}</b></div>
      <div class="row"><span>High-Yield Savings (${(getSavingsAPY() * 100).toFixed(1)}% APY)</span><b class="mono">${bankFmt(S.bank.savingsBal)}</b></div>
      
      <div style="margin-top:12px; display:flex; gap:8px;">
        <button class="btn" onclick="let a=prompt('Deposit amount to Savings:'); if(a) bankDepositSavings(a);">Deposit to Savings</button>
        <button class="btn" onclick="let a=prompt('Withdraw amount to Checking:'); if(a) bankWithdrawSavings(a);">Withdraw to Checking</button>
      </div>
    </section>
  `;

  // Investment Certificates Section
  html += `<section class="card"><h3>Monthly Yield Investment Certificates</h3>`;
  if (S.bank.certificates.length > 0) {
    html += `<b>Active Certificates</b>`;
    S.bank.certificates.forEach(c => {
      let currentRate = c.rate;
      if (c.type === 'tiered' && Array.isArray(c.rates)) {
        currentRate = c.rates[Math.min(c.yearsPassed, c.rates.length - 1)];
      }
      const annualYield = Math.round(c.principal * currentRate);
      const monthlyYield = Math.round(annualYield / 12);

      html += `
        <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
          <b>${c.name}</b> (${c.bank})<br>
          <span class="muted" style="font-size:0.85rem">Principal: <b>${bankFmt(c.principal)}</b> · Current Yield: <b>${(currentRate * 100).toFixed(1)}% p.a.</b></span><br>
          <span style="color:var(--mint); font-size:0.85rem;">Monthly Payout: <b>+${bankFmt(monthlyYield)}/mo</b> (${bankFmt(annualYield)}/yr)</span><br>
          <span class="muted" style="font-size:0.8rem">Term: Year ${c.yearsPassed + 1} of ${c.tenorYears}</span>
          <div style="margin-top:6px;">
            <button class="btn" onclick="redeemCertificateEarly('${c.uid}')">Redeem Early (5% Penalty)</button>
          </div>
        </div>
      `;
    });
  }

  html += `<h4 style="margin-top:16px; color:var(--cyan);">Available Certificates (${isEgypt ? 'Egyptian Banks' : 'International Banks'})</h4>`;
  certCatalog.forEach(cert => {
    const minAmt = isEgypt ? (cert.minAmountEGP / Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry('egy', gameYear()) : 1)) : cert.minAmountLocal;
    html += `
      <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
        <b>${cert.name}</b> — <span class="muted">${cert.bank}</span><br>
        <span class="muted" style="font-size:0.85rem">${cert.desc}</span><br>
        <span class="muted" style="font-size:0.85rem">Minimum Investment: ${bankFmt(minAmt)}</span>
        <div style="margin-top:6px;">
          <button class="btn" onclick="let a=prompt('Enter Certificate Deposit Amount:'); if(a) buyCertificate('${cert.id}', a);">Book Certificate</button>
        </div>
      </div>
    `;
  });
  html += `</section>`;

  // Active Credit Cards Section
  html += `<section class="card"><h3>Your Credit Cards</h3>`;
  if (!S.bank.activeCards.length) {
    html += `<p class="muted">You currently do not hold any active credit cards.</p>`;
  } else {
    S.bank.activeCards.forEach(id => {
      const card = cardCatalog.find(c => c.id === id);
      if (!card) return;
      const debt = sanitizeNum(S.bank.cardDebt[id], 0);
      const limit = getCreditLimit(card);
      const isPrimary = S.bank.primaryCard === id;

      html += `
        <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
          <b>${card.name}</b> ${isPrimary ? '<span style="color:var(--cyan); font-size:0.8rem;">(Primary Auto-Pay)</span>' : ''}<br>
          <span class="muted" style="font-size:0.85rem">Bank: ${card.bank} · APR: ${(card.apr * 100)}%</span><br>
          <span class="muted" style="font-size:0.85rem">Limit: ${bankFmt(limit)} · Owed: <b style="color:${debt > 0 ? 'var(--rose)' : 'inherit'}">${bankFmt(debt)}</b></span>
          <div class="acts" style="margin-top:8px;">
            ${debt > 0 ? `<button class="btn" onclick="payCardDebt('${id}',${debt})">Pay Full Balance (${bankFmt(debt)})</button>` : ''}
            ${!isPrimary ? `<button class="btn" onclick="S.bank.primaryCard='${id}'; if(typeof render==='function') render();">Set as Primary</button>` : ''}
          </div>
        </div>
      `;
    });
  }
  html += `</section>`;

  // Card Marketplace Section
  html += `<section class="card"><h3>Available Credit Cards (${isEgypt ? 'Egypt' : 'International'})</h3>`;
  cardCatalog.forEach(card => {
    const owned = S.bank.activeCards.includes(card.id);
    const limit = getCreditLimit(card);
    html += `
      <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
        <b>${card.name}</b><br>
        <span class="muted" style="font-size:0.85rem">${card.perks.join(' · ')}</span><br>
        <span class="muted" style="font-size:0.85rem">Credit Limit: ${bankFmt(limit)} · Req. Score: ${card.reqScore}</span>
        <button class="btn" ${owned || score < card.reqScore ? 'disabled' : ''} onclick="applyForCard('${card.id}')">
          ${owned ? 'Card Issued' : 'Apply for Card'}
        </button>
      </div>
    `;
  });
  html += `</section>`;

  // Bank Loans Section
  html += `<section class="card"><h3>Bank Loans & Financing</h3>`;
  if (S.bank.loans.length) {
    html += `<b>Active Loans</b>`;
    S.bank.loans.forEach(l => {
      html += `
        <div style="border-top:1px solid var(--line); margin-top:6px; padding-top:6px; font-size:0.85rem;" class="muted">
          Remaining Principal: ${bankFmt(l.remainingBal)} · Rate: ${(l.rate * 100).toFixed(1)}% · Annual Payment: ${bankFmt(l.annualPmt)} (${l.yearsLeft} yrs left)
        </div>
      `;
    });
  }
  html += `
    <div style="margin-top:12px;">
      <b>Request Personal Loan</b>
      <button class="btn" onclick="let a=prompt('Loan Amount:'); if(a) applyBankLoan(a, 3);">Request 3-Year Personal Loan</button>
    </div>
  </section>`;

  return html;
}

/* ---------- 9. HOOK REGISTER ---------- */
GameHooks.on('migrate', bankInit);
GameHooks.on('newGame', bankInit);
GameHooks.on('year', bankYear);
