/* ============================================================
   MONTHLY SETTLEMENT
   ============================================================
   Handles per-month cash flow when pacing = monthly.
   In yearly mode: does nothing (yearly engine handles everything).
   In monthly mode: engine's advanceYear no longer runs, so this
   file is what pays salary, charges bills, and rolls events.
   ============================================================ */

/* ---------- MONTH HOOK: CASH FLOW ---------- */
GameHooks.on('month', function() {
  if (!isMonthly()) return;
  if (!S) return;
  if (S.age < 18) return;

  const month = currentMonth();
  const monthStr = monthName(month);
  const c = C();

  /* ---------- 1. SALARY (1/12 of annual) ---------- */
  if (S.job && S.job.salary) {
    const monthlyPay = Math.round(S.job.salary / 12);
    S.wealth += monthlyPay;
    log(`💰 Salary: +${money(monthlyPay)} · ${monthStr}`);
  }

  /* ---------- 2. LIFESTYLE / BILLS (1/12 of annual) ---------- */
  if (typeof lifeCalculate === 'function' && S.lifestyle && S.lifestyle.active) {
    try {
      const totals = lifeCalculate();
      const monthlyBills = Math.round(totals.monthly);
      if (S.wealth >= monthlyBills) {
        S.wealth -= monthlyBills;
      } else {
        S.wealth -= monthlyBills; // force negative — real life
      }
      log(`🏠 Living costs: −${money(monthlyBills)} · ${monthStr}`);
      if (totals.happiness) fx({ happiness: Math.round(totals.happiness / 12) });
      if (totals.health) fx({ health: Math.round(totals.health / 12) });
    } catch (e) { /* lifestyle not ready */ }
  } else {
    /* Fallback: engine base charges / 12 */
    let baseAnnual = 0;
    if (S.housing === 'parents') {
      baseAnnual = (c.prices.phone || 0) * 0.5 + (c.prices.transport || 0) * 0.25;
    } else {
      baseAnnual = (c.prices.food || 0) + (c.prices.phone || 0) + (c.prices.transport || 0);
      if (S.housing === 'rented') baseAnnual += c.prices.rent || 0;
    }
    const monthlyBase = Math.round(baseAnnual / 12);
    if (monthlyBase > 0) {
      S.wealth -= monthlyBase;
      log(`🏠 Base costs: −${money(monthlyBase)} · ${monthStr}`);
    }
  }

  /* ---------- 3. BANK LOAN MONTHLY PAYMENTS ---------- */
  if (S.bank && Array.isArray(S.bank.loans) && S.bank.loans.length > 0) {
    S.bank.loans.forEach(loan => {
      const mp = loan.monthlyPayment || 0;
      if (mp <= 0 || loan.monthsLeft <= 0) return;
      if (S.wealth >= mp) {
        S.wealth -= mp;
        const interest = Math.round((loan.remaining || 0) * (loan.rate || 0) / 12);
        const principal = Math.max(0, mp - interest);
        loan.remaining = Math.max(0, (loan.remaining || 0) - principal);
        loan.monthsLeft = Math.max(0, (loan.monthsLeft || 0) - 1);
        loan.missedPayments = 0;
      } else {
        loan.missedPayments = (loan.missedPayments || 0) + 1;
        loan.remaining = Math.round((loan.remaining || 0) * 1.01);
        log(`⚠️ Missed loan payment (${loan.name})`);
      }
    });
    S.bank.loans = S.bank.loans.filter(l => (l.remaining || 0) > 0 && (l.monthsLeft || 0) > 0);
  }

  /* ---------- 4. CREDIT CARD MINIMUM MONTHLY ---------- */
  if (S.bank && Array.isArray(S.bank.creditCards)) {
    S.bank.creditCards.forEach(card => {
      if (!card.balance || card.balance <= 0) return;
      const minPayment = Math.max(50, Math.round(card.balance * 0.05));
      if (card.autoPay && S.wealth >= minPayment) {
        S.wealth -= minPayment;
        card.balance = Math.max(0, card.balance - minPayment);
      } else {
        /* Interest accrues monthly on outstanding balance */
        card.balance = Math.round(card.balance * (1 + (card.apr || 0) / 12));
      }
    });
  }

  /* ---------- 5. SHOPPING STORE FINANCING (monthly slice) ---------- */
  if (S.shopping && Array.isArray(S.shopping.loans) && S.shopping.loans.length > 0) {
    S.shopping.loans.forEach(loan => {
      const monthly = Math.round((loan.yearlyPayment || 0) / 12);
      if (S.wealth >= monthly) {
        S.wealth -= monthly;
        loan.totalOwed = Math.max(0, (loan.totalOwed || 0) - monthly);
      }
    });
  }

  /* ---------- 6. CAR LOAN MONTHLY (if not already in S.bank.loans) ---------- */
  /* Car loans live in S.bank.loans with loanType 'car' — already handled in step 3 */

  /* ---------- 7. RANDOM EVENT CHANCE (30% per month) ---------- */
  if (S.pending) return;
  const allEvents = [...GLOBAL_EVENTS, ...(C().events || [])];
  const eligible = allEvents.filter(e =>
    S.age >= e.minAge && S.age <= e.maxAge &&
    !S.flags['evt_' + e.id] &&
    (!e.condition || e.condition(S))
  );
  if (eligible.length && Math.random() < 0.30) {
    const e = eligible[Math.floor(Math.random() * eligible.length)];
    S.pending = prepareEvent(e);
    S.evId = e.id;
    log(`📖 ${e.title}`);
  }
});

/* ---------- PACING TOGGLE (called from settings/life tab) ---------- */
window.togglePacing = function() {
  if (!S) return;
  if (S.pacing === 'monthly') {
    if (!confirm('Switch to YEARLY mode? Months will no longer be tracked. Any pending bills this year will be settled at year end.')) return;
    S.pacing = 'yearly';
    S.month = 1;
    log('📅 Switched to yearly mode.');
  } else {
    if (!confirm('Switch to MONTHLY mode? You will start in January and bills/events will occur throughout the year.')) return;
    S.pacing = 'monthly';
    S.month = 1;
    log('🗓 Switched to monthly mode. You are now in January.');
  }
  save(); render();
};
