/* ============================================================
   MONTHLY SETTLEMENT
   ============================================================
   Handles per-month cash flow when pacing = monthly.
   In yearly mode: does nothing (yearly engine handles everything).
   In monthly mode: engine's advanceYear no longer runs, so this
   file is what pays salary, charges bills, and rolls events.
   ============================================================ */
/* ---------- LOCAL CURRENCY HELPER ---------- */
function localEGP(egp) {
  if (!S) return egp;
  if (S.country === 'egy') return egp;
  const egpRate = (typeof COUNTRIES !== 'undefined' && COUNTRIES.egy && COUNTRIES.egy.rate) || 52.7;
  return Math.round(egp / egpRate * (C().rate || 1));
}
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
    /* ---------- 7. MONTHLY BURDEN: OTHER SYSTEMS ---------- */
  /* Tax */
  if (S.job && S.job.salary && typeof carComputeTax === 'function') {
    const taxMonthly = Math.round(carComputeTax(S.job.salary) / 12);
    if (taxMonthly > 0) {
      S.wealth -= taxMonthly;
      log('💰 Income tax: −' + money(taxMonthly));
    }
  }

  /* Cars (fuel + service + insurance) */
  if (Array.isArray(S.cars) && S.cars.length > 0) {
    let carMonthly = 0;
    S.cars.forEach(function(car) {
      if (car.stolen) return;
      if (typeof carInsuranceYearLocal === 'function') carMonthly += carInsuranceYearLocal(car) / 12;
      if (typeof carMaintenanceYearLocal === 'function') carMonthly += carMaintenanceYearLocal(car) / 12;
      if (typeof carFuelCostYearLocal === 'function') carMonthly += carFuelCostYearLocal(car) / 12;
    });
    carMonthly = Math.round(carMonthly);
    if (carMonthly > 0) {
      S.wealth -= carMonthly;
      log('🚗 Car costs: −' + money(carMonthly));
    }
  }

  /* Family allowances (already stored monthly per parent) */
  if (S.parentAllowances && typeof S.parentAllowances === 'object') {
    const famMonthly = Object.values(S.parentAllowances).reduce(function(s, v) { return s + (v || 0); }, 0);
    if (famMonthly > 0) {
      S.wealth -= famMonthly;
      log('👨‍👩‍👧 Family allowances: −' + money(famMonthly));
    }
  }

  /* Medical medications */
  if (S.medical && Array.isArray(S.medical.medications) && S.medical.medications.length > 0 &&
      typeof MED_MEDICATIONS !== 'undefined') {
    let medMonthly = 0;
    S.medical.medications.forEach(function(md) {
      const def = MED_MEDICATIONS.find(function(d) { return d.id === md.id; });
      if (def && def.monthlyEGP) medMonthly += localEGP(def.monthlyEGP);
    });
    if (medMonthly > 0) {
      S.wealth -= medMonthly;
      log('💊 Medications: −' + money(medMonthly));
    }
  }

  /* Children — school fees + lifestyle + activities (annual ÷ 12) */
  if (Array.isArray(S.childrenList) && S.childrenList.length > 0) {
    let kidsAnnual = 0;
    S.childrenList.forEach(function(c) {
      if (c.school && c.age >= 4 && c.age <= 18 &&
          typeof chBySchoolLabel === 'function' && typeof chEGP === 'function') {
        const s = chBySchoolLabel(c.school);
        if (s) kidsAnnual += chEGP(s.annualEGP);
      }
      if (typeof chBabyAgeCategory === 'function' &&
          typeof CHILDREN_EXPENSE_TIERS !== 'undefined' && typeof chEGP === 'function') {
        const ageGroup = chBabyAgeCategory(c.age);
        const tier = CHILDREN_EXPENSE_TIERS[ageGroup] && CHILDREN_EXPENSE_TIERS[ageGroup][c.lifestyle || 'standard'];
        if (tier) kidsAnnual += chEGP(tier.monthlyEGP * 12);
      }
      if (Array.isArray(c.activities) &&
          typeof CHILDREN_ACTIVITIES !== 'undefined' && typeof chEGP === 'function') {
        c.activities.forEach(function(aid) {
          const act = CHILDREN_ACTIVITIES.find(function(a) { return a.id === aid; });
          if (act) kidsAnnual += act.monthlyEGP ? chEGP(act.monthlyEGP * 12) : chEGP(act.annualEGP);
        });
      }
    });
    const kidsMonthly = Math.round(kidsAnnual / 12);
    if (kidsMonthly > 0) {
      S.wealth -= kidsMonthly;
      log('👶 Child costs: −' + money(kidsMonthly));
    }
  }

  /* Shopping card installments (each has monthlyPayment) */
  if (S.shopping && Array.isArray(S.shopping.cardInstallments) && S.shopping.cardInstallments.length > 0) {
    let cardMonthly = 0;
    S.shopping.cardInstallments.forEach(function(ci) {
      cardMonthly += ci.monthlyPayment || 0;
    });
    if (cardMonthly > 0) {
      S.wealth -= cardMonthly;
      log('💳 Card installments: −' + money(cardMonthly));
    }
  }

  /* ---------- 8. SEASONAL & MONTH-SPECIFIC EVENTS ---------- */

  /* September — school year starts */
  if (month === 9) {
    const schoolKids = (S.childrenList || []).filter(function(c) { return c.age >= 4 && c.age <= 18; });
    if (schoolKids.length > 0) {
      const perKid = localEGP(3000 + Math.floor(Math.random() * 3000));
      const totalCost = perKid * schoolKids.length;
      S.wealth -= totalCost;
      log('📚 Back to school — uniform, books, supplies: −' + money(totalCost));
      fx({ happiness: -3 });
    }
  }

  /* June-August — Summer AC electricity surge */
  if (month >= 6 && month <= 8) {
    const summerExtra = localEGP(500 + Math.floor(Math.random() * 500));
    S.wealth -= summerExtra;
    log('☀️ Summer AC electricity: −' + money(summerExtra));
  }

  /* December-February — Winter heating surge */
  if (month === 12 || month === 1 || month === 2) {
    const winterExtra = localEGP(250 + Math.floor(Math.random() * 350));
    S.wealth -= winterExtra;
    log('🥶 Winter heating: −' + money(winterExtra));
  }

  /* Ramadan (via isRamadanMonth helper from engine) */
  if (typeof isRamadanMonth === 'function' && isRamadanMonth()) {
    const yameesh = localEGP(2000 + Math.floor(Math.random() * 3000));
    S.wealth -= yameesh;
    log('🌙 Ramadan yameesh & iftar extras: −' + money(yameesh));
    fx({ happiness: 4 });
  }

  /* Eid al-Fitr — month after Ramadan */
  if (typeof isRamadanMonth === 'function') {
    const y = gameYear();
    const cycle = (y - 2024) % 33;
    const monthShift = Math.floor(cycle / 3);
    let rm = 3 - monthShift;
    while (rm < 1) rm += 12;
    while (rm > 12) rm -= 12;
    const eidMonth = rm >= 12 ? 1 : rm + 1;
    if (month === eidMonth) {
      const eidClothes = localEGP(1500 + Math.floor(Math.random() * 3000));
      S.wealth -= eidClothes;
      log('🎉 Eid clothes & celebration: −' + money(eidClothes));
      fx({ happiness: 5 });
    }
  }

  /* December — Christmas (Coptic & general) */
  if (month === 12) {
    const xmasCost = localEGP(800 + Math.floor(Math.random() * 1500));
    S.wealth -= xmasCost;
    log('🎄 Christmas celebrations: −' + money(xmasCost));
    fx({ happiness: 3 });
  }

  /* June-September — Wedding season (25% chance per month) */
  if (month >= 6 && month <= 9 && Math.random() < 0.25) {
    const weddingGift = localEGP(1500 + Math.floor(Math.random() * 3500));
    S.wealth -= weddingGift;
    log('💍 Wedding season — attended a wedding: −' + money(weddingGift));
    fx({ happiness: 2, social: 3 });
  }

  } /* end skipFinance guard */

  /* ---------- 9. RANDOM EVENT CHANCE (30% per month) ---------- */
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
