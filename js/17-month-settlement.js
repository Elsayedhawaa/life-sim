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

  const month = currentMonth();
  const monthStr = monthName(month);
  const c = C();

  /* Skip finance if this year was already settled by yearly tick */
  const skipFinance = (S.pacingSwitchYear === gameYear());

  /* Kids still fire events, just not money */
  const skipAll = (S.age < 18);
     if (!skipFinance && !skipAll) {
        
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
  } /* end skipFinance guard */
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
  if (S.pending) {
    log('Resolve the pending event first.');
    return;
  }

  if (S.pacing === 'monthly') {
    /* ============ MONTHLY → YEARLY ============ */
    const currentM = currentMonth();

    /* Case 1: This year was skipped (switched from yearly earlier this year) */
    if (S.pacingSwitchYear === gameYear()) {
      if (!confirm('Switch to YEARLY mode?\n\nThis year was already settled by the yearly tick, so no extra charges apply. You will continue in yearly mode.')) return;
      S.pacing = 'yearly';
      S.month = 1;
      S.pacingSwitchYear = 0;
      log('📅 Switched to yearly mode.');
      save(); render(); return;
    }

    /* Case 2: Normal mid-year switch — settle remaining months */
    const monthsToSettle = 12 - currentM;
    if (monthsToSettle > 0) {
      if (!confirm('Switch to YEARLY mode?\n\nYou are in ' + currentMonthName() + ' ' + gameYear() + '.\n\nThis will settle the remaining ' + monthsToSettle + ' month(s) now — applying salary and bills — then switch to yearly. Your next click will advance one full year.')) return;

      /* Calculate 1 month of salary + bills */
      let monthlySalary = 0;
      if (S.job && S.job.salary) monthlySalary = Math.round(S.job.salary / 12);

      let monthlyBills = 0;
      if (typeof lifeCalculate === 'function' && S.lifestyle && S.lifestyle.active) {
        try { monthlyBills = lifeCalculate().monthly; } catch(e) { monthlyBills = 0; }
      }
      if (monthlyBills === 0) {
        const c = C();
        let annual = 0;
        if (S.housing === 'parents') {
          annual = (c.prices.phone || 0) * 0.5 + (c.prices.transport || 0) * 0.25;
        } else {
          annual = (c.prices.food || 0) + (c.prices.phone || 0) + (c.prices.transport || 0);
          if (S.housing === 'rented') annual += c.prices.rent || 0;
        }
        monthlyBills = Math.round(annual / 12);
      }

      const totalSalary = monthlySalary * monthsToSettle;
      const totalBills = monthlyBills * monthsToSettle;
      S.wealth += totalSalary - totalBills;

      log('📅 Settled ' + monthsToSettle + ' remaining month(s): salary +' + money(totalSalary) + ', bills −' + money(totalBills) + '.');
    } else {
      if (!confirm('Switch to YEARLY mode?')) return;
    }

    S.pacing = 'yearly';
    S.month = 1;
    S.pacingSwitchYear = 0;
    log('📅 Switched to yearly mode. Ready to advance year by year.');
    save(); render();

  } else {
    /* ============ YEARLY → MONTHLY ============ */
    if (!confirm('Switch to MONTHLY mode?\n\nYou will restart in January ' + gameYear() + '.\n\n⚠️ Your finances for ' + gameYear() + ' were already settled when the year started. No salary or bills will be charged during ' + gameYear() + ' in monthly mode — only events. Full monthly settlement begins January ' + (gameYear() + 1) + '.')) return;

    S.pacing = 'monthly';
    S.month = 1;
    S.pacingSwitchYear = gameYear();
    log('🗓 Switched to monthly mode. Starting January ' + gameYear() + '. Finance already settled this year; monthly cash flow begins January ' + (gameYear() + 1) + '.');
    save(); render();
  }
};
