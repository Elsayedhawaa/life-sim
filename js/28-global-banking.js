/* =====================================================================
   28. GLOBAL BANKING & CREDIT SYSTEM — Egypt & International
   Connects via GameHooks (see 90-hooks.js).
   ===================================================================== */

/* ---------- 1. BANK CARD CATALOGS ---------- */
const BANK_CARDS_EGYPT = [
  {
    id: 'cib_classic',
    name: 'CIB / NBE Classic Credit Card',
    bank: 'Commercial International Bank / NBE',
    fee: 300,            // Annual fee in EGP
    apr: 0.28,           // 28% annual interest on unpaid balance
    cashback: 0.01,      // 1% cashback on annual spending
    perks: ['Basic EGP limit', '1% rewards cashback'],
    reqIncomeEGP: 120000,
    reqScore: 550,
    limitMult: 0.25,     // Limit is 25% of annual income
    hapBonus: 0
  },
  {
    id: 'cib_wealth',
    name: 'CIB Wealth / HSBC Premier Visa Infinite',
    bank: 'CIB / HSBC Egypt',
    fee: 2500,
    apr: 0.24,
    cashback: 0.025,     // 2.5% cashback
    perks: ['High EGP limit', '2.5% luxury cashback', 'Cairo/Alex Airport Lounge Access (+Happiness)', 'Dedicated Relationship Manager'],
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
    cashback: 0.015,     // 1.5% cashback
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
    fee: 250,            // Local currency annual fee
    apr: 0.16,
    cashback: 0.03,      // 3% travel & dining cashback
    perks: ['Global Airport Lounge Key (+Happiness)', 'Comprehensive Travel Insurance', '3% Travel & Dining Rewards', 'Concierge Service'],
    reqIncomeLocal: 75000,
    reqScore: 740,
    limitMult: 0.75,
    hapBonus: 4
  }
];

/* ---------- 2. HELPERS & STATE INIT ---------- */
function bankOn() { return !!(S && S.age >= 18); }

function bankInit(o) {
  if (!o) return;
  if (!o.bank || typeof o.bank !== 'object') {
    o.bank = {
      score: 680,              // Credit score starting baseline (300-850)
      savingsBal: 0,           // High-yield savings account balance
      activeCards: [],         // Array of card IDs owned
      primaryCard: null,       // Currently selected card for auto-pay
      cardDebt: {},            // { cardId: amountOwed }
      loans: [],               // Active bank loans [{ id, principal, rate, annualPmt, remainingYrs }]
      missedPmts: 0
    };
  }
}

function bankLocalRate(year) {
  return Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry(S.country, year || gameYear()) : 1);
}

function bankFmt(internalAmount) {
  if (typeof money === 'function') return money(internalAmount);
  return '$' + Math.round(internalAmount).toLocaleString();
}

function getCreditLimit(card) {
  const isEgypt = S.country === 'egy';
  const localInc = (S.income || 0) * bankLocalRate(gameYear());
  
  if (isEgypt) {
    const egpInc = localInc; // In EGP
    return Math.round((egpInc * card.limitMult) / bankLocalRate(gameYear()));
  } else {
    return Math.round(S.income * card.limitMult);
  }
}

/* ---------- 3. SAVINGS ACCOUNT & INTEREST ---------- */
function bankDepositSavings(amount) {
  bankInit(S);
  if (amount <= 0 || S.wealth < amount) return hint('Invalid or insufficient checking balance.');
  S.wealth -= amount;
  S.bank.savingsBal += amount;
  log(`Transferred ${bankFmt(amount)} from Checking to Savings Account.`);
  render();
}

function bankWithdrawSavings(amount) {
  bankInit(S);
  if (amount <= 0 || S.bank.savingsBal < amount) return hint('Insufficient funds in Savings Account.');
  S.bank.savingsBal -= amount;
  S.wealth += amount;
  log(`Withdrew ${bankFmt(amount)} from Savings to Checking Account.`);
  render();
}

function getSavingsAPY() {
  // Egypt High Yield Certificates/Savings (14% - 20% in EGP) vs Global (3% - 5%)
  return S.country === 'egy' ? 0.16 : 0.045;
}

/* ---------- 4. CREDIT CARDS & LOANS ACTIONS ---------- */
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
    return hint(`Application Declined: Credit score of ${card.reqScore} required (Your score: ${S.bank.score}).`);
  }
  if (localInc < reqInc) {
    return hint(`Application Declined: Income requirement not met.`);
  }

  S.bank.activeCards.push(cardId);
  S.bank.cardDebt[cardId] = 0;
  if (!S.bank.primaryCard) S.bank.primaryCard = cardId;

  S.bank.score = Math.min(850, S.bank.score + 15); // Successful approval score bump
  log(`Credit Card Approved: ${card.name}! Limit set to ${bankFmt(getCreditLimit(card))}.`);
  if (typeof realismNotice === 'function') {
    realismNotice('Credit Line Opened', `Your new ${card.name} is active. Responsible use improves your credit score. Unpaid monthly balances accrue interest.`);
  }
  render();
}

function payCardDebt(cardId, amount) {
  bankInit(S);
  const currentDebt = S.bank.cardDebt[cardId] || 0;
  if (currentDebt <= 0) return hint('No balance owed on this card.');
  
  const payAmt = Math.min(amount, currentDebt);
  if (S.wealth < payAmt) return hint('Not enough funds in Checking account.');

  S.wealth -= payAmt;
  S.bank.cardDebt[cardId] -= payAmt;
  
  if (S.bank.cardDebt[cardId] <= 0) {
    S.bank.score = Math.min(850, S.bank.score + 8);
  }
  log(`Paid ${bankFmt(payAmt)} toward your credit card balance.`);
  render();
}

function applyBankLoan(amount, years) {
  bankInit(S);
  if (amount <= 0 || years < 1 || years > 5) return hint('Invalid loan request.');

  const maxLoan = (S.income || 0) * (S.bank.score > 740 ? 3.0 : 1.5);
  if (amount > maxLoan) return hint(`Loan Declined: Bank limit for your credit profile is ${bankFmt(maxLoan)}.`);

  // Rate scales with country inflation and credit score
  const baseRate = S.country === 'egy' ? 0.22 : 0.07;
  const scoreDiscount = (S.bank.score - 600) * 0.0003;
  const rate = Math.max(0.04, baseRate - scoreDiscount);

  // Amortized annual payment formula
  const annualPmt = Math.round((amount * rate) / (1 - Math.pow(1 + rate, -years)));

  S.wealth += amount;
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
  render();
}

/* ---------- 5. YEARLY TICK ENGINE ---------- */
function bankYear() {
  if (!S || S.dead || S.age < 18) return;
  bankInit(S);
  const y = gameYear();

  // A. High Yield Savings Interest
  if (S.bank.savingsBal > 0) {
    const apy = getSavingsAPY();
    const interestEarned = Math.round(S.bank.savingsBal * apy);
    S.bank.savingsBal += interestEarned;
    log(`Savings Account: Earned ${bankFmt(interestEarned)} in interest this year (${(apy * 100).toFixed(1)}% APY).`);
  }

  // B. Process Active Credit Cards (Interest, Cashback, Benefits)
  const isEgypt = S.country === 'egy';
  const catalog = isEgypt ? BANK_CARDS_EGYPT : BANK_CARDS_GLOBAL;

  S.bank.activeCards.forEach(cardId => {
    const card = catalog.find(c => c.id === cardId);
    if (!card) return;

    let debt = S.bank.cardDebt[cardId] || 0;

    // Apply annual card fee
    const feeInternal = card.fee / bankLocalRate(y);
    if (card.fee > 0) {
      debt += feeInternal;
    }

    // Apply card benefits
    if (card.hapBonus > 0) {
      if (typeof fx === 'function') fx({ happiness: card.hapBonus });
    }

    // Earn cashback on expenses via primary card
    if (S.bank.primaryCard === cardId && S.expenses > 0) {
      const reward = Math.round(S.expenses * card.cashback);
      S.wealth += reward;
      log(`${card.name} Reward: Earned ${bankFmt(reward)} in cashback.`);
    }

    // Carryover debt interest
    if (debt > 0) {
      const interest = Math.round(debt * card.apr);
      debt += interest;
      S.bank.score = Math.max(300, S.bank.score - 10); // Carrying debt lowers score slightly
      if (typeof fx === 'function') fx({ happiness: -2 }); // Stress from card debt
    }

    S.bank.cardDebt[cardId] = Math.round(debt);
  });

  // C. Process Bank Loans
  S.bank.loans.forEach((loan, idx) => {
    if (loan.remainingBal <= 0) return;

    if (S.wealth >= loan.annualPmt) {
      S.wealth -= loan.annualPmt;
      S.expenses = (S.expenses || 0) + loan.annualPmt;
      loan.remainingBal -= Math.min(loan.remainingBal, loan.annualPmt);
      loan.yearsLeft--;
      S.bank.score = Math.min(850, S.bank.score + 10);
      log(`Bank Loan Payment: Paid ${bankFmt(loan.annualPmt)}. Remaining balance: ${bankFmt(loan.remainingBal)}.`);
    } else {
      // Missed payment
      loan.remainingBal = Math.round(loan.remainingBal * 1.08); // Penalty fee
      S.bank.score = Math.max(300, S.bank.score - 45);
      S.bank.missedPmts++;
      log(`MISSED LOAN PAYMENT! Penalty interest charged and credit score dropped to ${S.bank.score}.`);
      if (typeof fx === 'function') fx({ happiness: -8 });
    }
  });

  // Filter out paid loans
  S.bank.loans = S.bank.loans.filter(l => l.remainingBal > 0);
}

/* ---------- 6. UI VIEW PANEL ---------- */
function viewBank() {
  if (!bankOn()) return '<section class="card"><h3>Banking</h3><p class="muted">Banking services unlock at age 18.</p></section>';
  bankInit(S);

  const isEgypt = S.country === 'egy';
  const catalog = isEgypt ? BANK_CARDS_EGYPT : BANK_CARDS_GLOBAL;
  const score = S.bank.score;
  const scoreColor = score >= 740 ? 'var(--mint)' : score >= 650 ? 'var(--amber)' : 'var(--rose)';

  let html = `
    <section class="card">
      <h3>Financial Dashboard & Credit Rating</h3>
      <div class="row"><span>Credit Score</span><b class="mono" style="color:${scoreColor}">${score} / 850</b></div>
      <div class="row"><span>Checking Account</span><b class="mono" style="color:var(--mint)">${bankFmt(S.wealth)}</b></div>
      <div class="row"><span>High-Yield Savings (${(getSavingsAPY() * 100).toFixed(1)}% APY)</span><b class="mono">${bankFmt(S.bank.savingsBal)}</b></div>
      
      <div style="margin-top:12px; display:flex; gap:8px;">
        <button class="btn" onclick="let a=prompt('Deposit amount to Savings:'); if(a) bankDepositSavings(Number(a));">Deposit to Savings</button>
        <button class="btn" onclick="let a=prompt('Withdraw amount to Checking:'); if(a) bankWithdrawSavings(Number(a));">Withdraw to Checking</button>
      </div>
    </section>
  `;

  // Active Credit Cards Section
  html += `<section class="card"><h3>Your Credit Cards</h3>`;
  if (!S.bank.activeCards.length) {
    html += `<p class="muted">You currently do not hold any active credit cards.</p>`;
  } else {
    S.bank.activeCards.forEach(id => {
      const card = catalog.find(c => c.id === id);
      if (!card) return;
      const debt = S.bank.cardDebt[id] || 0;
      const limit = getCreditLimit(card);
      const isPrimary = S.bank.primaryCard === id;

      html += `
        <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
          <b>${card.name}</b> ${isPrimary ? '<span style="color:var(--cyan); font-size:0.8rem;">(Primary Auto-Pay)</span>' : ''}<br>
          <span class="muted" style="font-size:0.85rem">Bank: ${card.bank} · APR: ${(card.apr * 100)}%</span><br>
          <span class="muted" style="font-size:0.85rem">Limit: ${bankFmt(limit)} · Balance Owed: <b style="color:${debt > 0 ? 'var(--rose)' : 'inherit'}">${bankFmt(debt)}</b></span>
          <div class="acts" style="margin-top:8px;">
            ${debt > 0 ? `<button class="btn" onclick="payCardDebt('${id}',${debt})">Pay Full Balance (${bankFmt(debt)})</button>` : ''}
            ${!isPrimary ? `<button class="btn" onclick="S.bank.primaryCard='${id}'; render();">Set as Primary</button>` : ''}
          </div>
        </div>
      `;
    });
  }
  html += `</section>`;

  // Card Marketplace Section
  html += `<section class="card"><h3>Available Credit Cards (${isEgypt ? 'Egypt' : 'International'})</h3>`;
  catalog.forEach(card => {
    const owned = S.bank.activeCards.includes(card.id);
    const limit = getCreditLimit(card);
    html += `
      <div style="border:1px solid var(--line); border-radius:8px; padding:10px; margin-top:8px;">
        <b>${card.name}</b><br>
        <span class="muted" style="font-size:0.85rem">${card.perks.join(' · ')}</span><br>
        <span class="muted" style="font-size:0.85rem">Estimated Credit Limit: ${bankFmt(limit)} · Req. Score: ${card.reqScore}</span>
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
      <button class="btn" onclick="let a=prompt('Loan Amount:'); if(a) applyBankLoan(Number(a), 3);">Request 3-Year Loan</button>
    </div>
  </section>`;

  return html;
}

/* ---------- 7. HOOK REGISTER ---------- */
GameHooks.on('migrate', bankInit);
GameHooks.on('newGame', bankInit);
GameHooks.on('year', bankYear);
