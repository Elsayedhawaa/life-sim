/* ============================================================
   MONTHLY SETTLEMENT
   ============================================================
   Each block is a separate function for readability.
   v2: Skips stored cars for ongoing costs.
       Moved orphaned real-estate blocks back inside monthlyApplyFinance.
   ============================================================ */

function localEGP(egp) {
  if (!S) return egp;
  if (S.country === 'egy') return egp;
  const egpRate = (typeof COUNTRIES !== 'undefined' && COUNTRIES.egy && COUNTRIES.egy.rate) || 52.7;
  return Math.round(egp / egpRate * (C().rate || 1));
}

GameHooks.on('month', function() {
  if (!isMonthly() || !S) return;

  const month = currentMonth();
  const c = C();
  const isSkippedYear = (S.pacingSwitchYear === gameYear());
  const isMinor = (S.age < 18);

  /* FINANCE handled by chargeHousehold() in engine — only seasonal events here */
  if (!isSkippedYear && !isMinor) {
    monthlyApplySeasonal(c, month);
  }

  monthlyFireRandomEvent();
});
/* ---------- 1. FINANCE ---------- */
function monthlyApplyFinance(c, monthStr) {

  /* Salary */
  if (S.job && S.job.salary) {
    const monthlyPay = Math.round(S.job.salary / 12);
    S.wealth += monthlyPay;
    log('💰 Salary: +' + money(monthlyPay) + ' · ' + monthStr);
  }

  /* Lifestyle or fallback base bills */
  let monthlyBills = 0;
  let lifestyle = null;
  if (typeof lifeCalculate === 'function' && S.lifestyle && S.lifestyle.active) {
    try {
      lifestyle = lifeCalculate();
      monthlyBills = Math.round(lifestyle.monthly);
    } catch (e) { monthlyBills = 0; }
  }
  if (monthlyBills === 0) {
    let baseAnnual = 0;
    if (S.housing === 'parents') {
      baseAnnual = (c.prices.phone || 0) * 0.5 + (c.prices.transport || 0) * 0.25;
    } else {
      baseAnnual = (c.prices.food || 0) + (c.prices.phone || 0) + (c.prices.transport || 0);
      if (S.housing === 'rented') baseAnnual += c.prices.rent || 0;
    }
    monthlyBills = Math.round(baseAnnual / 12);
  }
  if (monthlyBills > 0) {
    S.wealth -= monthlyBills;
    log('🏠 Living costs: −' + money(monthlyBills) + ' · ' + monthStr);
    if (lifestyle) {
      if (lifestyle.happiness) fx({ happiness: Math.round(lifestyle.happiness / 12) });
      if (lifestyle.health) fx({ health: Math.round(lifestyle.health / 12) });
    }
  }

  /* Bank loans */
  if (S.bank && Array.isArray(S.bank.loans) && S.bank.loans.length > 0) {
    S.bank.loans.forEach(function(loan) {
      const mp = loan.monthlyPayment || 0;
      if (mp <= 0 || (loan.monthsLeft || 0) <= 0) return;
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
        log('⚠️ Missed loan payment (' + loan.name + ')');
      }
    });
    S.bank.loans = S.bank.loans.filter(function(l) {
      return (l.remaining || 0) > 0 && (l.monthsLeft || 0) > 0;
    });
  }

  /* Credit cards */
  if (S.bank && Array.isArray(S.bank.creditCards)) {
    S.bank.creditCards.forEach(function(card) {
      if (!card.balance || card.balance <= 0) return;
      const minPayment = Math.max(50, Math.round(card.balance * 0.05));
      if (card.autoPay && S.wealth >= minPayment) {
        S.wealth -= minPayment;
        card.balance = Math.max(0, card.balance - minPayment);
      } else {
        card.balance = Math.round(card.balance * (1 + (card.apr || 0) / 12));
      }
    });
  }

  /* Shopping store financing */
  if (S.shopping && Array.isArray(S.shopping.loans) && S.shopping.loans.length > 0) {
    S.shopping.loans.forEach(function(loan) {
      const monthly = Math.round((loan.yearlyPayment || 0) / 12);
      if (S.wealth >= monthly) {
        S.wealth -= monthly;
        loan.totalOwed = Math.max(0, (loan.totalOwed || 0) - monthly);
      }
    });
  }

  /* Income tax (1/12 of annual) */
  if (S.job && S.job.salary && typeof carComputeTax === 'function') {
    const taxMonthly = Math.round(carComputeTax(S.job.salary) / 12);
    if (taxMonthly > 0) {
      S.wealth -= taxMonthly;
      log('💰 Income tax: −' + money(taxMonthly));
    }
  }

  /* Cars (fuel + service + insurance) — v2: skip stored cars */
  if (Array.isArray(S.cars) && S.cars.length > 0) {
    let carMonthly = 0;
    S.cars.forEach(function(car) {
      if (car.stolen) return;
      if (car.storedIn) return;   /* v2: stored cars incur no costs */
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

  /* Family allowances (already monthly amount per parent) */
  if (S.parentAllowances && typeof S.parentAllowances === 'object') {
    let famMonthly = 0;
    Object.keys(S.parentAllowances).forEach(function(k) {
      famMonthly += (S.parentAllowances[k] || 0);
    });
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

  /* Children (school + lifestyle + activities ÷ 12) */
  if (Array.isArray(S.childrenList) && S.childrenList.length > 0) {
    let kidsAnnual = 0;
    S.childrenList.forEach(function(child) {
      if (child.school && child.age >= 4 && child.age <= 18 &&
          typeof chBySchoolLabel === 'function' && typeof chEGP === 'function') {
        const s = chBySchoolLabel(child.school);
        if (s) kidsAnnual += chEGP(s.annualEGP);
      }
      if (typeof chBabyAgeCategory === 'function' &&
          typeof CHILDREN_EXPENSE_TIERS !== 'undefined' && typeof chEGP === 'function') {
        const ageGroup = chBabyAgeCategory(child.age);
        const tier = CHILDREN_EXPENSE_TIERS[ageGroup] && CHILDREN_EXPENSE_TIERS[ageGroup][child.lifestyle || 'standard'];
        if (tier) kidsAnnual += chEGP(tier.monthlyEGP * 12);
      }
      if (Array.isArray(child.activities) &&
          typeof CHILDREN_ACTIVITIES !== 'undefined' && typeof chEGP === 'function') {
        child.activities.forEach(function(aid) {
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

  /* Shopping card installments */
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

  /* Real estate: HOA + rent income (monthly slice, currency-aware)
     FIX: was previously outside this function. Now correctly runs monthly. */
  if (S && Array.isArray(S.ownedHomes) && S.ownedHomes.length > 0) {
    let reCashInPlayer = 0;
    S.ownedHomes.forEach(function(h) {
      const hc = h.country || 'egy';
      const hcRate = (COUNTRIES[hc] && COUNTRIES[hc].rate) || 1;
      const playerRate = (typeof C === 'function' && C().rate) || 1;
      const conv = hcRate !== playerRate ? (playerRate / hcRate) : 1;

      const hoaAnnualInHome = Math.round((h.value || 0) * 0.005);
      reCashInPlayer -= Math.round((hoaAnnualInHome / 12) * conv);

      if (h.status === 'rented' && h.monthlyRent) {
        reCashInPlayer += Math.round(h.monthlyRent * conv);
      }
    });
    if (reCashInPlayer !== 0) {
      S.wealth += reCashInPlayer;
      if (reCashInPlayer < 0) log('🏠 Property HOA: −' + money(-reCashInPlayer));
      else if (reCashInPlayer > 0) log('🏠 Rental income: +' + money(reCashInPlayer));
    }
  }

  /* Real estate mortgages (annualPayment / 12 per contract)
     FIX: was previously outside this function. Now correctly runs monthly. */
  if (S && Array.isArray(S.realestateContracts) && S.realestateContracts.length > 0) {
    let mortMonthly = 0;
    S.realestateContracts.forEach(function(c) {
      if (c.yearsLeft <= 0) return;

      const home = (S.ownedHomes || []).find(h => h.id === c.homeId);
      const homeCountry = home ? (home.country || S.country) : S.country;

      const sliceLocal = Math.round((c.annualPayment || 0) / 12);
      const slice = typeof convertToPlayerCurrency === 'function'
        ? convertToPlayerCurrency(sliceLocal, homeCountry)
        : sliceLocal;

      if (S.wealth >= slice) {
        S.wealth -= slice;
        c.remaining = Math.max(0, (c.remaining || 0) - sliceLocal);
        c.missedPayments = 0;
      } else {
        c.missedPayments = (c.missedPayments || 0) + 1;
        c.remaining = Math.round((c.remaining || 0) * 1.01);
        log('⚠️ Missed mortgage payment on ' + c.name);
      }
      mortMonthly += slice;
    });
    if (mortMonthly > 0) log('🏠 Mortgage payments: −' + money(mortMonthly));
    if (currentMonth() === 1) {
      S.realestateContracts.forEach(function(c) {
        if (c.yearsLeft > 0) c.yearsLeft--;
      });
    }
  }
}   /* ← monthlyApplyFinance closes here */

/* ---------- 2. SEASONAL ---------- */
function monthlyApplySeasonal(c, month) {

  /* September — school starts */
  if (month === 9) {
    const schoolKids = (S.childrenList || []).filter(function(child) {
      return child.age >= 4 && child.age <= 18;
    });
    if (schoolKids.length > 0) {
      const perKid = localEGP(3000 + Math.floor(Math.random() * 3000));
      const totalCost = perKid * schoolKids.length;
      S.wealth -= totalCost;
      log('📚 Back to school — uniform, books, supplies: −' + money(totalCost));
      fx({ happiness: -3 });
    }
  }

  /* Summer AC (June-August) */
  if (month >= 6 && month <= 8) {
    const summerExtra = localEGP(500 + Math.floor(Math.random() * 500));
    S.wealth -= summerExtra;
    log('☀️ Summer AC electricity: −' + money(summerExtra));
  }

  /* Winter heating (December-February) */
  if (month === 12 || month === 1 || month === 2) {
    const winterExtra = localEGP(250 + Math.floor(Math.random() * 350));
    S.wealth -= winterExtra;
    log('🥶 Winter heating: −' + money(winterExtra));
  }

  /* Ramadan */
  if (typeof isRamadanMonth === 'function' && isRamadanMonth()) {
    const yameesh = localEGP(2000 + Math.floor(Math.random() * 3000));
    S.wealth -= yameesh;
    log('🌙 Ramadan yameesh & iftar extras: −' + money(yameesh));
    fx({ happiness: 4 });
  }

  /* Eid (month after Ramadan) */
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

  /* Christmas (December) */
  if (month === 12) {
    const xmasCost = localEGP(800 + Math.floor(Math.random() * 1500));
    S.wealth -= xmasCost;
    log('🎄 Christmas celebrations: −' + money(xmasCost));
    fx({ happiness: 3 });
  }

  /* Wedding season (June-September, 25% chance) */
  if (month >= 6 && month <= 9 && Math.random() < 0.25) {
    const weddingGift = localEGP(1500 + Math.floor(Math.random() * 3500));
    S.wealth -= weddingGift;
    log('💍 Wedding season — attended a wedding: −' + money(weddingGift));
    fx({ happiness: 2, social: 3 });
  }
}

/* ---------- 3. RANDOM EVENT ---------- */
function monthlyFireRandomEvent() {
  if (S.pending) return;
  if (typeof pickEligibleEvent !== 'function') return;
  var _evt = pickEligibleEvent();
  if (_evt && Math.random() < 0.45) {
    S.pending = prepareEvent(_evt);
    S.evId = _evt.id;
    log('📖 ' + (_evt.title || 'Event'));
  }
}

/* ---------- 4. PACING TOGGLE ---------- */
window.togglePacing = function() {
  if (!S) return;
  if (S.pending) {
    log('Resolve the pending event first.');
    return;
  }

  if (S.pacing === 'monthly') {
    /* MONTHLY → YEARLY */
    const currentM = currentMonth();

    if (S.pacingSwitchYear === gameYear()) {
      if (!confirm('Switch to YEARLY mode?\n\nThis year was already settled by the yearly tick. No extra charges apply.')) return;
         S.pacing = 'yearly';
    S.month = 1;
    S.pacingSwitchYear = 0;
    try { localStorage.setItem('wl_pacing', 'yearly'); } catch(e) {}
    log('📅 Switched to yearly mode.');
    save(); render(); return;
    }

    const monthsToSettle = 12 - currentM;
    if (monthsToSettle > 0) {
      const msg = 'Switch to YEARLY mode?\n\nYou are in ' + currentMonthName() + ' ' + gameYear() +
        '.\n\nThis will settle the remaining ' + monthsToSettle +
        ' month(s) now (salary, bills), then switch to yearly.';
      if (!confirm(msg)) return;

          var h = computeHousehold();
      var periodNet = Math.round(h.net * monthsToSettle / 12);
      S.wealth += periodNet;

      log('📅 Settled ' + monthsToSettle + ' remaining month(s): net ' + (periodNet >= 0 ? '+' : '') + money(periodNet) + '.');
    } else {
      if (!confirm('Switch to YEARLY mode?')) return;
    }

      S.pacing = 'yearly';
    S.month = 1;
    S.pacingSwitchYear = 0;
    try { localStorage.setItem('wl_pacing', 'yearly'); } catch(e) {}
    log('📅 Switched to yearly mode. Ready to advance year by year.');
    save(); render();

  } else {
    /* YEARLY → MONTHLY */
    const msg = 'Switch to MONTHLY mode?\n\nYou will restart in January ' + gameYear() +
      '.\n\n⚠️ Finances for ' + gameYear() +
      ' were already settled. No salary/bills will be charged in ' + gameYear() +
      ' monthly. Full monthly begins January ' + (gameYear() + 1) + '.';
    if (!confirm(msg)) return;

       S.pacing = 'monthly';
    S.month = 1;
    S.pacingSwitchYear = gameYear();
    try { localStorage.setItem('wl_pacing', 'monthly'); } catch(e) {}
    log('🗓 Switched to monthly mode. Starting January ' + gameYear() + '. Finance already settled this year; monthly cash flow begins January ' + (gameYear() + 1) + '.');
    save(); render();
  }
};
