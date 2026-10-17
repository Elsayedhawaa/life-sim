/* =====================================================================
   63. CARS FIXES — consolidated from 63/64/65
   Replaces: 63-car-bug-fixes.js, 64-final-fixes.js, 65-car-ui-fix.js
   Load AFTER 62-cars-overhaul.js and BEFORE 66-finance-reality-fix.js
   ===================================================================== */

(function p63CarsFixes() {
  'use strict';

  /* =================================================================
     PART 1 — HELPERS (single source of truth for all car math)
     ================================================================= */
  function p63Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
  function p63Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

  /* MODEL VALIDATOR — correct indices
     Row = [0]make [1]model [2]class [3]price [4]mpg [5]hap [6]soc [7]life
            [8]fromYear [9]toYear [10]hybridFrom [11]isElectric */
  function p63ModelValid(m, year) {
    if (!m || !Array.isArray(m)) return false;
    const from = Number(m[8]) || 0;
    const to   = Number(m[9]) || 9999;
    return year >= from && year <= to;
  }
  window.p63ModelValid = p63ModelValid;

  function p63ModelsForBrand(brand, year) {
    year = year || gameYear();
    return P62_MODELS.filter(function (m) { return m[0] === brand && p63ModelValid(m, year); });
  }

  /* Base price calculations — SINGLE SOURCE OF TRUTH */
  function p63CarBaseUSD(model) {
    if (!model) return 0;
    let usd = Number(model[3]) || 0;
    if (S && S.country === 'egy') {
      const tier = (P62_BRANDS[model[0]] || {}).tier || 2;
      if (tier === 3) usd *= 1.15;
      else if (tier === 4) usd *= 1.25;
      else if (tier === 5) usd *= 1.35;
    }
    return usd;
  }
  function p63CarBaseEGP(model, year) {
    const usd = p63CarBaseUSD(model);
    return Math.round(usd * 52.7 * p63Idx());
  }
  function p63CarBaseInternal(model, year) {
    return p63CarBaseEGP(model, year) / p63Rate();
  }
  function p63EGPtoInternal(egp) { return egp / p63Rate(); }
  function p63InternalToEGP(internal) { return internal * p63Rate(); }

  /* Unified car value — used by both garage and sell button */
  function p63CarValueInternal(car) {
    if (!car) return 0;
    const msrp = Number(car.msrp) || 0;
    const dep = (typeof p62Depreciation === 'function') ? p62Depreciation(car.age || 0) : 1;
    const cond = Number(car.cond) || 100;
    const condFactor = 0.6 + 0.4 * (cond / 100);
    return Math.round(msrp * dep * condFactor);
  }
  window.p63CarValueInternal = p63CarValueInternal;

  /* Override base price globally */
  p62BasePriceUSD = function (model, year) {
    return p63CarBaseInternal(model, year || gameYear());
  };

  /* Override model filter globally */
  p62ModelsForBrand = p63ModelsForBrand;

  /* =================================================================
     PART 2 — OPTIONS READERS (P62_OPTIONS is array-of-arrays)
     Row: [id, label, usd, hap, soc, fromYear, untilYear]
     ================================================================= */
  function p63OptionsForYear(year) {
    if (typeof P62_OPTIONS === 'undefined') return [];
    return P62_OPTIONS.filter(function (o) {
      if (!Array.isArray(o)) return false;
      const from = Number(o[5]) || 0;
      const until = Number(o[6]) || 9999;
      return year >= from && year <= until;
    });
  }
  function p63OptionPriceEGP(o) {
    const usd = Number(o[2]) || 0;
    return Math.round(usd * 52.7 * p63Idx());
  }
  function p63OptionPriceInternal(o) {
    return p63EGPtoInternal(p63OptionPriceEGP(o));
  }

  /* =================================================================
     PART 3 — INCOME HELPERS
     ================================================================= */
  function p63MonthlyIncomeInternal() {
    return ((typeof p54LiveIncome === 'function') ? p54LiveIncome() : (S.income || 0)) / 12;
  }
  function p63MonthlyExpensesInternal() {
    return ((typeof p54LiveExpenses === 'function') ? p54LiveExpenses() : (S.expenses || 0)) / 12;
  }
  function p63CurrentNetInternal() { return p63MonthlyIncomeInternal() - p63MonthlyExpensesInternal(); }

  /* =================================================================
     PART 4 — CONFIG PRICE (single source)
     ================================================================= */
  function p63CfgPrice() {
    if (typeof p62Init === 'function') p62Init();
    const cfg = S.p62.carCfg;
    const empty = { car:0, options:0, registration:0, insurance:0, total:0, model:null, cls:P62_CLS.compact };
    if (!cfg || !cfg.modelId) return empty;
    const model = p62ModelById(cfg.modelId);
    if (!model) return empty;
    const year = gameYear();
    const baseInternal = p63CarBaseInternal(model, year);
    const trim = (P62_TRIMS && P62_TRIMS[cfg.trim]) || { mult: 1 };
    const colorAdd = (P62_COLORS && P62_COLORS[cfg.color]) ? Number(P62_COLORS[cfg.color][1]) || 0 : 0;
    const colorInternal = p63EGPtoInternal(colorAdd * 52.7 * p63Idx());
    const interior = (P62_INTERIORS && P62_INTERIORS[cfg.interior]) || { usd: 0 };
    const interiorInternal = p63EGPtoInternal((Number(interior.usd) || 0) * 52.7 * p63Idx());
    let optsInternal = 0;
    (cfg.opts || []).forEach(function (oid) {
      const o = p63OptionsForYear(year).find(function (opt) { return opt[0] === oid; });
      if (o) optsInternal += p63OptionPriceInternal(o);
    });
    const carInternal = Math.round(baseInternal * (Number(trim.mult) || 1) + colorInternal + interiorInternal + optsInternal);
    const registrationInternal = Math.round(carInternal * 0.06);
    const insTier = (P62_INSURANCE && P62_INSURANCE[cfg.insurance]) || P62_INSURANCE.compreh;
    const insuranceInternal = Math.round(carInternal * (Number(insTier.mult) || 0.055));
    const totalInternal = carInternal + registrationInternal + insuranceInternal;
    return {
      car: carInternal,
      options: optsInternal,
      registration: registrationInternal,
      insurance: insuranceInternal,
      total: totalInternal,
      model: model,
      cls: P62_CLS[model[2]] || P62_CLS.compact
    };
  }
  p62CfgPrice = p63CfgPrice;

  /* =================================================================
     PART 5 — LOAN BREAKDOWN
     ================================================================= */
  function p63LoanBreakdown(carInternal, downPct, months) {
    const down = carInternal * downPct;
    const financed = carInternal - down;
    const ratePct = 0.16;
    const years = months / 12;
    const totalWithInterest = financed * (1 + ratePct * years);
    const monthlyPayment = totalWithInterest / months;
    const rate = p63Rate();
    return {
      down: down, downEGP: Math.round(down * rate),
      financed: financed, financedEGP: Math.round(financed * rate),
      totalWithInterest: totalWithInterest, totalEGP: Math.round(totalWithInterest * rate),
      monthlyPayment: monthlyPayment, monthlyEGP: Math.round(monthlyPayment * rate),
      yearlyPayment: monthlyPayment * 12, yearlyEGP: Math.round(monthlyPayment * 12 * rate),
      interestEGP: Math.round((totalWithInterest - financed) * rate),
      months: months, years: years
    };
  }

  /* =================================================================
     PART 6 — BANK APPROVAL PREDICTION
     ================================================================= */
  function p63PredictApproval(monthlyPaymentInternal) {
    const monthlyIncome = p63MonthlyIncomeInternal();
    const currentNet = p63CurrentNetInternal();
    const projectedNet = currentNet - monthlyPaymentInternal;
    const creditScore = (S.bank && S.bank.score) || 680;
    const employed = !!(S.job || S.remote || S.remoteJob);
    const ratio = monthlyPaymentInternal / Math.max(1, monthlyIncome);
    let score = 0;
    const reasons = [];
    if (creditScore >= 740) { score += 3; reasons.push('Good credit score'); }
    else if (creditScore >= 680) { score += 2; reasons.push('Acceptable credit'); }
    else if (creditScore >= 620) { score += 1; reasons.push('Borderline credit'); }
    else { score -= 1; reasons.push('Low credit score'); }
    if (employed) { score += 2; reasons.push('Stable employment'); }
    else { score -= 2; reasons.push('No stable employment'); }
    if (ratio <= 0.15) { score += 3; reasons.push('Payment small vs income'); }
    else if (ratio <= 0.25) { score += 1; reasons.push('Payment fits income'); }
    else if (ratio <= 0.35) { score -= 1; reasons.push('Payment high vs income'); }
    else { score -= 4; reasons.push('Payment exceeds 35% of income'); }
    if (projectedNet < 0) { score -= 3; reasons.push('Cashflow would go negative'); }
    let verdict, color;
    if (score >= 5) { verdict = 'Likely approved'; color = 'var(--mint)'; }
    else if (score >= 2) { verdict = 'Possibly approved'; color = 'var(--amber)'; }
    else if (score >= 0) { verdict = 'Risky — may be declined'; color = 'var(--amber)'; }
    else { verdict = 'Will likely be declined'; color = 'var(--rose)'; }
    return { verdict, color, score, reasons, projectedNet, projectedNetEGP: Math.round(projectedNet * p63Rate()), incomeRatio: ratio };
  }

  /* =================================================================
     PART 7 — PURCHASE HANDLER
     ================================================================= */
  function closeCarModal() {
    const m = document.getElementById('p62-cfg-modal');
    if (m) m.remove();
  }
  window.p63CloseCarModal = closeCarModal;

  function p63PurchaseCar(method) {
    if (typeof p62Init === 'function') p62Init();
    if (typeof p62HasLicense === 'function' && !p62HasLicense()) return hint('You need a valid driving licence first.');
    const price = p63CfgPrice();
    if (!price.model) return hint('No car configured.');
    const rate = p63Rate();
    const model = price.model;

    if (method === 'cash') {
      if (S.wealth < price.total) {
        return hint('❌ Not enough cash. Need ' + Math.round(price.total * rate).toLocaleString() + ' EGP. You have ' + Math.round(S.wealth * rate).toLocaleString() + ' EGP.');
      }
      S.wealth -= price.total;
      const cfg = S.p62.carCfg;
      const uid = 'c' + Math.random().toString(36).slice(2, 8);
      const car = {
        uid: uid,
        make: P62_BRANDS[model[0]] ? P62_BRANDS[model[0]].name : model[0],
        name: model[1], cls: model[2],
        year: gameYear(),
        trim: cfg.trim, color: cfg.color, interior: cfg.interior,
        opts: (cfg.opts || []).slice(),
        msrp: price.car, paid: price.total,
        insurance: cfg.insurance,
        insuranceExpiry: gameYear() + 1,
        registrationExpiry: gameYear() + 1,
        miles: 0, cond: 100, age: 0, acc: false, broken: false, fix: 0,
        mods: [], modCost: 0, seller: 'dealer',
        brand: model[0],
        fuel: model[11] ? 'e' : (model[10] && gameYear() >= model[10] ? 'h' : 'g'),
        life: model[7],
        value: price.car, hasLoan: false
      };
      S.cars = S.cars || [];
      S.cars.push(car);
      S.cars = S.cars.slice(-4);
      if (typeof fx === 'function') fx({ happiness: 8, social: 6 });
      if (typeof log === 'function') log('🚗 Purchased ' + car.year + ' ' + car.make + ' ' + car.name + ' for cash (' + Math.round(price.total * rate).toLocaleString() + ' EGP).');
      closeCarModal();
      if (typeof p62ResetCfg === 'function') p62ResetCfg(null, null);
      S.p62.subTab = 'garage';
      render();
      return;
    }

    /* Loan */
    const isSeven = method === 'loan7';
    const downPct = isSeven ? 0.10 : 0.15;
    const months = isSeven ? 84 : 60;
    const loan = p63LoanBreakdown(price.car, downPct, months);
    if (S.wealth < loan.down) {
      return hint('❌ Not enough cash for down payment. Need ' + loan.downEGP.toLocaleString() + ' EGP.');
    }
    const pred = p63PredictApproval(loan.monthlyPayment);
    const approvalChance = Math.max(0.05, Math.min(0.95, 0.5 + pred.score * 0.08));
    if (Math.random() > approvalChance) {
      return hint('❌ Bank DECLINED financing. Reasons: ' + pred.reasons.join(', '));
    }
    S.wealth -= loan.down;
    if (!S.bank) S.bank = { installments:{}, cardDebt:{}, activeCards:[], primaryCard:null, score:680, savingsBal:0, loans:[], missedPmts:0 };
    if (!S.bank.installments) S.bank.installments = {};
    const cfg = S.p62.carCfg;
    const uid = 'c' + Math.random().toString(36).slice(2, 8);
    const key = 'car_loan_' + uid;
    S.bank.installments[key] = {
      name: 'Car loan — ' + model[1] + ' (' + months + ' mo)',
      totalBalance: loan.totalWithInterest,
      remaining: loan.totalWithInterest,
      monthlyPayment: loan.monthlyPayment,
      monthsTotal: months, monthsLeft: months,
      fee: loan.totalWithInterest - loan.financed,
      startedYear: gameYear(),
      linkedCarUid: uid,
      missedPayments: 0, warningsSent: 0
    };
    const car = {
      uid: uid,
      make: P62_BRANDS[model[0]] ? P62_BRANDS[model[0]].name : model[0],
      name: model[1], cls: model[2],
      year: gameYear(),
      trim: cfg.trim, color: cfg.color, interior: cfg.interior,
      opts: (cfg.opts || []).slice(),
      msrp: price.car,
      paid: loan.down + price.registration + price.insurance,
      insurance: cfg.insurance,
      insuranceExpiry: gameYear() + 1,
      registrationExpiry: gameYear() + 1,
      miles: 0, cond: 100, age: 0, acc: false, broken: false, fix: 0,
      mods: [], modCost: 0, seller: 'dealer',
      brand: model[0],
      fuel: model[11] ? 'e' : (model[10] && gameYear() >= model[10] ? 'h' : 'g'),
      life: model[7],
      value: price.car, hasLoan: true, loanKey: key
    };
    S.cars = S.cars || [];
    S.cars.push(car);
    S.cars = S.cars.slice(-4);
    if (typeof fx === 'function') fx({ happiness: 8, social: 6 });
    if (typeof log === 'function') log('🏦 Bank APPROVED loan. Down: ' + loan.downEGP.toLocaleString() + ' EGP. Monthly: ' + loan.monthlyEGP.toLocaleString() + ' EGP × ' + months + ' months.');
    if (typeof realismNotice === 'function') realismNotice('Car purchased on loan', car.year + ' ' + car.make + ' ' + car.name + ' financed.');
    closeCarModal();
    if (typeof p62ResetCfg === 'function') p62ResetCfg(null, null);
    S.p62.subTab = 'garage';
    render();
  }
  window.p62PurchaseCar = p63PurchaseCar;
  window.p63PurchaseCar = p63PurchaseCar;

  /* =================================================================
     PART 8 — SELL CAR (matches garage value exactly)
     ================================================================= */
  function p63SellCar(uid) {
    if (!S || !S.cars) return;
    const car = S.cars.find(function (c) { return c && c.uid === uid; });
    if (!car) return hint('Car not found.');
    const rate = p63Rate();
    const fullValueInternal = p63CarValueInternal(car);
    const fullValueEGP = Math.round(fullValueInternal * rate);
    const commission = Math.round(fullValueEGP * 0.10);
    const sellEGP = fullValueEGP - commission;

    if (car.hasLoan && car.loanKey && S.bank && S.bank.installments && S.bank.installments[car.loanKey]) {
      const loan = S.bank.installments[car.loanKey];
      const loanRemainingEGP = Math.round(loan.remaining * rate);
      if (loan.remaining > fullValueInternal) {
        const shortfallEGP = Math.round((loan.remaining - fullValueInternal) * rate);
        if (!confirm('⚠️ SELLING AT A LOSS\n\nCar value: E£' + fullValueEGP.toLocaleString() + '\nDealer fee (10%): -E£' + commission.toLocaleString() + '\nYou receive: E£' + sellEGP.toLocaleString() + '\n\nLoan remaining: E£' + loanRemainingEGP.toLocaleString() + '\nShortfall: E£' + shortfallEGP.toLocaleString() + '\n\nShortfall charged from cash.\n\nProceed?')) return;
        if (S.wealth < p63EGPtoInternal(shortfallEGP)) return hint('❌ You cannot afford the shortfall of E£' + shortfallEGP.toLocaleString() + '.');
        S.wealth -= p63EGPtoInternal(shortfallEGP);
        delete S.bank.installments[car.loanKey];
        log('🚗 Sold ' + car.make + ' ' + car.name + ' at a loss. Shortfall E£' + shortfallEGP.toLocaleString() + ' paid.');
      } else {
        const netInternal = fullValueInternal - loan.remaining;
        const netEGP = Math.round(netInternal * rate) - commission;
        if (!confirm('Sell ' + car.year + ' ' + car.make + ' ' + car.name + '?\n\nCar value: E£' + fullValueEGP.toLocaleString() + '\nDealer fee (10%): -E£' + commission.toLocaleString() + '\nLoan remaining: E£' + loanRemainingEGP.toLocaleString() + '\n\nYou receive: E£' + netEGP.toLocaleString() + '\n\nProceed?')) return;
        S.wealth += p63EGPtoInternal(Math.max(0, netEGP));
        delete S.bank.installments[car.loanKey];
        log('🚗 Sold ' + car.make + ' ' + car.name + ' and cleared loan. Net: E£' + netEGP.toLocaleString() + '.');
      }
    } else {
      if (!confirm('Sell ' + car.year + ' ' + car.make + ' ' + car.name + '?\n\nCar value: E£' + fullValueEGP.toLocaleString() + '\nDealer fee (10%): -E£' + commission.toLocaleString() + '\n\nYou receive: E£' + sellEGP.toLocaleString() + '\n\nProceed?')) return;
      S.wealth += p63EGPtoInternal(sellEGP);
      log('🚗 Sold ' + car.make + ' ' + car.name + ' for E£' + sellEGP.toLocaleString() + '.');
    }
    S.cars = S.cars.filter(function (c) { return c.uid !== uid; });
    render();
  }
  window.p65SellCar = p63SellCar;

  /* =================================================================
     PART 9 — CONFIG MODAL
     ================================================================= */
  function p63RenderConfigModal() {
    if (typeof p62Init === 'function') p62Init();
    const cfg = S.p62.carCfg;
    if (!cfg || !cfg.modelId) { closeCarModal(); return; }
    const model = p62ModelById(cfg.modelId);
    if (!model) { closeCarModal(); return; }
    const brand = P62_BRANDS[model[0]];
    const price = p63CfgPrice();
    const rate = p63Rate();
    const year = gameYear();
    const baseCarEGP = p63CarBaseEGP(model, year);

    const trimBtns = P62_TRIMS.map(function (t, i) {
      const delta = Math.round((Number(t.mult) - 1) * baseCarEGP);
      return '<button class="btn ' + (cfg.trim === i ? 'sel' : '') + '" style="margin:0;padding:8px;font-size:.72rem;text-align:left" onclick="p62CfgSet(\'trim\',' + i + ')">' +
        '<b>' + t.label + '</b>' +
        '<div class="muted" style="font-size:.66rem;margin-top:2px">' + t.desc + '</div>' +
        (delta > 0 ? '<div class="mono" style="font-size:.7rem;color:var(--amber);margin-top:2px">+' + delta.toLocaleString() + ' EGP</div>' : '') +
        '</button>';
    }).join('');

    const colorHex = ['#ffffff', '#16161a', '#b9bcc4', '#6b6f7a', '#c8202f', '#2457c5', '#2f7d4f', '#e8731a', '#fbfaf3', '#2a2a2e'];
    const colorBtns = P62_COLORS.map(function (c, i) {
      const extra = Number(c[1]) || 0;
      const label = c[0] + (extra > 0 ? ' +' + Math.round(extra * 52.7 * p63Idx()).toLocaleString() + ' EGP' : '');
      return '<button title="' + label + '" onclick="p62CfgSet(\'color\',' + i + ')" style="width:34px;height:34px;border-radius:50%;background:' + colorHex[i] + ';border:3px solid ' + (cfg.color === i ? 'var(--violet)' : 'var(--line)') + ';cursor:pointer"></button>';
    }).join('');

    const intBtns = P62_INTERIORS.map(function (int, idx) {
      const egp = Math.round((Number(int.usd) || 0) * 52.7 * p63Idx());
      return '<button class="btn ' + (cfg.interior === idx ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.7rem" onclick="p62CfgSet(\'interior\',' + idx + ')">' +
        int.label + (egp > 0 ? ' · +' + egp.toLocaleString() + ' EGP' : '') + '</button>';
    }).join('');

    const optsHtml = p63OptionsForYear(year).map(function (o) {
      const id = o[0], label = o[1], egp = p63OptionPriceEGP(o);
      const on = (cfg.opts || []).indexOf(id) >= 0;
      return '<label class="muted" style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--line);border-radius:6px;font-size:.82rem;cursor:pointer;margin-top:4px">' +
        '<input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="p62CfgSet(\'opt\',\'' + id + '\')">' +
        '<span style="flex:1">' + label + '</span>' +
        '<b class="mono" style="font-size:.8rem">+' + egp.toLocaleString() + '</b>' +
        '</label>';
    }).join('');

    const insBtns = Object.keys(P62_INSURANCE).map(function (k) {
      return '<button class="btn ' + (cfg.insurance === k ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.68rem" onclick="p62CfgSet(\'insurance\',\'' + k + '\')">' + P62_INSURANCE[k].label + '</button>';
    }).join('');

    const monthlyIncomeEGP = Math.round(p63MonthlyIncomeInternal() * rate);
    const netEGP = Math.round(p63CurrentNetInternal() * rate);
    const cashEGP = Math.round(S.wealth * rate);
    const loan5 = p63LoanBreakdown(price.car, 0.15, 60);
    const loan7 = p63LoanBreakdown(price.car, 0.10, 84);
    const cashOK = S.wealth >= price.total;
    const down5OK = S.wealth >= loan5.down;
    const down7OK = S.wealth >= loan7.down;
    const pred5 = p63PredictApproval(loan5.monthlyPayment);
    const pred7 = p63PredictApproval(loan7.monthlyPayment);
    const clsLabel = (P62_CLS[model[2]] || {}).label || 'Car';

    const html = '<div class="p24-modal" style="max-width:540px;max-height:92vh;overflow-y:auto;padding:16px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
      '<div style="display:flex;align-items:center;gap:10px">' + p62BrandBadge(model[0], 40) +
      '<div><div class="p24-pill">' + year + ' Model</div>' +
      '<h2 style="margin-top:6px;font-size:1.15rem">' + brand.name + ' ' + model[1] + '</h2>' +
      '<div class="muted" style="font-size:.78rem">' + clsLabel + ' · Base from ' + baseCarEGP.toLocaleString() + ' EGP</div>' +
      '</div></div>' +
      '<button class="menu-btn" onclick="p63CloseCarModal()">✕</button></div>' +

      '<div style="margin-top:14px;padding:10px;background:rgba(34,211,238,.06);border-radius:8px;border-left:3px solid var(--cyan)">' +
      '<b style="font-size:.78rem;color:var(--cyan)">YOUR FINANCES</b>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.82rem"><span>Monthly income</span><b class="mono">' + monthlyIncomeEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.82rem"><span>Current monthly net</span><b class="mono" style="color:' + (netEGP >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (netEGP >= 0 ? '+' : '') + netEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.82rem"><span>Cash available</span><b class="mono">' + cashEGP.toLocaleString() + ' EGP</b></div>' +
      '</div>' +

      '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Trim</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">' + trimBtns + '</div>' +

      '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Paint colour</h4>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">' + colorBtns + '</div>' +

      '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Interior</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">' + intBtns + '</div>' +

      '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Options</h4>' + (optsHtml || '<p class="muted" style="font-size:.8rem">No options this year.</p>') +

      '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Insurance</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">' + insBtns + '</div>' +

      '<div style="margin-top:16px;padding:12px;background:rgba(255,255,255,.04);border-radius:10px">' +
      '<b style="font-size:.85rem;color:var(--cyan)">💰 PRICE BREAKDOWN</b>' +
      '<div class="row" style="padding:4px 0"><span>Car</span><b class="mono">' + Math.round(price.car * rate).toLocaleString() + ' EGP</b></div>' +
      (price.options > 0 ? '<div class="row" style="padding:4px 0"><span>Options</span><b class="mono">+' + Math.round(price.options * rate).toLocaleString() + ' EGP</b></div>' : '') +
      '<div class="row" style="padding:4px 0"><span>Registration & tax (6%)</span><b class="mono">+' + Math.round(price.registration * rate).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="padding:4px 0"><span>Insurance (year 1)</span><b class="mono">+' + Math.round(price.insurance * rate).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>On the road</b></span><b class="mono" style="color:var(--mint);font-size:1rem">' + Math.round(price.total * rate).toLocaleString() + ' EGP</b></div>' +
      '</div>' +

      '<h4 style="margin-top:16px;font-size:.85rem;color:var(--cyan)">Payment</h4>' +

      '<div style="margin-top:8px;padding:12px;border:1px solid ' + (cashOK ? 'var(--mint)' : 'var(--line)') + ';border-radius:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
      '<div><b>💵 Pay cash</b><div class="muted" style="font-size:.78rem;margin-top:3px">No loan, no interest</div></div>' +
      '<div class="mono" style="font-size:.95rem;font-weight:700">' + Math.round(price.total * rate).toLocaleString() + ' EGP</div>' +
      '</div>' +
      (cashOK ? '<button class="btn" style="margin-top:8px;text-align:center;background:var(--mint);color:#000;font-weight:700" onclick="p63PurchaseCar(\'cash\')">Buy with cash</button>'
              : '<p class="muted" style="font-size:.78rem;margin-top:8px">❌ Need ' + Math.round((price.total - S.wealth) * rate).toLocaleString() + ' EGP more</p>') +
      '</div>' +

      '<div style="margin-top:10px;padding:12px;border:1px solid ' + (down5OK ? 'var(--cyan)' : 'var(--line)') + ';border-radius:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
      '<div style="flex:1"><b>🏦 Bank loan — 5 years</b><div class="muted" style="font-size:.76rem;margin-top:3px">15% down · 16% flat interest</div></div>' +
      '<div style="text-align:right"><div class="mono" style="font-size:.9rem;font-weight:700">' + loan5.monthlyEGP.toLocaleString() + '</div><div class="muted" style="font-size:.68rem">EGP/month</div></div></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem;margin-top:6px"><span>Down payment (15%)</span><b class="mono">' + loan5.downEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Total over 5 years</span><b class="mono">' + loan5.totalEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Interest paid</span><b class="mono" style="color:var(--rose)">' + loan5.interestEGP.toLocaleString() + ' EGP</b></div>' +
      '<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;font-size:.78rem">' +
      '<b style="color:' + pred5.color + '">' + pred5.verdict + '</b>' +
      '<div class="muted" style="font-size:.72rem;margin-top:3px">Net after purchase: <b style="color:' + (pred5.projectedNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (pred5.projectedNetEGP >= 0 ? '+' : '') + pred5.projectedNetEGP.toLocaleString() + ' EGP/month</b></div>' +
      '<div class="muted" style="font-size:.7rem;margin-top:3px">' + pred5.reasons.slice(0, 3).join(' · ') + '</div></div>' +
      (down5OK ? '<button class="btn" style="margin-top:8px;text-align:center" onclick="p63PurchaseCar(\'loan5\')">Apply for 5-year loan</button>'
              : '<p class="muted" style="font-size:.78rem;margin-top:8px">❌ Need ' + Math.max(0, loan5.downEGP - cashEGP).toLocaleString() + ' EGP more for down payment</p>') +
      '</div>' +

      '<div style="margin-top:10px;padding:12px;border:1px solid ' + (down7OK ? 'var(--cyan)' : 'var(--line)') + ';border-radius:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
      '<div style="flex:1"><b>🏦 Bank loan — 7 years</b><div class="muted" style="font-size:.76rem;margin-top:3px">10% down · lower monthly, more interest</div></div>' +
      '<div style="text-align:right"><div class="mono" style="font-size:.9rem;font-weight:700">' + loan7.monthlyEGP.toLocaleString() + '</div><div class="muted" style="font-size:.68rem">EGP/month</div></div></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem;margin-top:6px"><span>Down payment (10%)</span><b class="mono">' + loan7.downEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Total over 7 years</span><b class="mono">' + loan7.totalEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Interest paid</span><b class="mono" style="color:var(--rose)">' + loan7.interestEGP.toLocaleString() + ' EGP</b></div>' +
      '<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;font-size:.78rem">' +
      '<b style="color:' + pred7.color + '">' + pred7.verdict + '</b>' +
      '<div class="muted" style="font-size:.72rem;margin-top:3px">Net after purchase: <b style="color:' + (pred7.projectedNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (pred7.projectedNetEGP >= 0 ? '+' : '') + pred7.projectedNetEGP.toLocaleString() + ' EGP/month</b></div>' +
      '<div class="muted" style="font-size:.7rem;margin-top:3px">' + pred7.reasons.slice(0, 3).join(' · ') + '</div></div>' +
      (down7OK ? '<button class="btn" style="margin-top:8px;text-align:center" onclick="p63PurchaseCar(\'loan7\')">Apply for 7-year loan</button>'
              : '<p class="muted" style="font-size:.78rem;margin-top:8px">❌ Need ' + Math.max(0, loan7.downEGP - cashEGP).toLocaleString() + ' EGP more for down payment</p>') +
      '</div>' +
      '</div>';

    let modal = document.getElementById('p62-cfg-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'p62-cfg-modal';
      modal.className = 'p24-modal-backdrop';
      document.body.appendChild(modal);
    }
    modal.innerHTML = html;
  }
  p62RenderConfigModal = p63RenderConfigModal;

  p62OpenConfig = function (brandKey, modelId) {
    p62ResetCfg(brandKey, modelId);
    if (!p62ModelById(modelId)) return hint('Model not found.');
    p63RenderConfigModal();
  };

  /* =================================================================
     PART 10 — NEW CARS TAB
     ================================================================= */
  p62BuildNewTab = function () {
    if (!S.cars) S.cars = [];
    if (S.cars.length >= 4) {
      return '<section class="card" style="text-align:center;padding:32px 16px"><div style="font-size:3rem;opacity:.4">🅿️</div><h3 style="margin-top:12px">Garage full</h3><p class="muted">Sell a car first.</p></section>';
    }
    if (typeof P62_BRANDS === 'undefined' || typeof P62_MODELS === 'undefined') return '<section class="card"><h3>⚠️ Car data missing</h3></section>';
    const year = gameYear();
    const brands = [];
    Object.keys(P62_BRANDS).forEach(function (key) {
      const models = p63ModelsForBrand(key, year);
      if (models.length) brands.push({ key: key, brand: P62_BRANDS[key], models: models });
    });
    const cards = brands.map(function (b) {
      let cheapest = Infinity;
      b.models.forEach(function (m) {
        const p = p63CarBaseEGP(m, year);
        if (p < cheapest) cheapest = p;
      });
      return '<button class="btn" style="margin:0;padding:12px;text-align:left;display:flex;align-items:center;gap:10px" onclick="p62OpenBrand(\'' + b.key + '\')">' +
        p62BrandBadge(b.key, 36) +
        '<div style="flex:1;min-width:0"><div style="font-weight:700">' + b.brand.name + '</div>' +
        '<div class="muted" style="font-size:.72rem">' + b.models.length + ' models · from ' + cheapest.toLocaleString() + ' EGP</div></div></button>';
    }).join('');
    return '<section class="card"><h3>🆕 New cars (' + brands.length + ' brands · ' + year + ')</h3>' +
      '<div style="display:grid;grid-template-columns:1fr;gap:6px;margin-top:10px">' + cards + '</div></section>';
  };

  p62OpenBrand = function (brandKey) {
    const brand = P62_BRANDS[brandKey];
    if (!brand) return;
    const year = gameYear();
    const models = p63ModelsForBrand(brandKey, year);
    if (!models.length) return hint('No models available for ' + brand.name + ' in ' + year + '.');
    const list = models.map(function (m) {
      const egpPrice = p63CarBaseEGP(m, year);
      const cls = P62_CLS[m[2]] || P62_CLS.compact;
      const fuel = m[11] ? '⚡ Electric' : (m[10] && year >= m[10] ? '🔋 Hybrid' : '⛽ Gasoline');
      return '<button class="btn" style="text-align:left;padding:12px;margin:0" onclick="p62OpenConfig(\'' + brandKey + '\',\'' + m[0] + '_' + m[1] + '\')">' +
        '<div style="display:flex;justify-content:space-between;gap:8px">' +
        '<div style="min-width:0;flex:1"><b>' + m[1] + '</b>' +
        '<div class="muted" style="font-size:.75rem;margin-top:2px">' + cls.label + ' · ' + fuel + '</div></div>' +
        '<div style="text-align:right;flex-shrink:0">' +
        '<div class="mono" style="font-size:.85rem;font-weight:700">' + egpPrice.toLocaleString() + '</div>' +
        '<div class="muted" style="font-size:.68rem">EGP from</div></div></div></button>';
    }).join('');
    const modal = document.createElement('div');
    modal.id = 'p62-brand-modal';
    modal.className = 'p24-modal-backdrop';
    modal.innerHTML = '<div class="p24-modal" style="max-width:480px;max-height:88vh;overflow-y:auto">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
      '<div style="display:flex;align-items:center;gap:10px">' + p62BrandBadge(brandKey, 44) +
      '<div><div class="p24-pill">' + brand.origin + ' ' + brand.name + '</div>' +
      '<h2 style="margin-top:6px">' + models.length + ' models</h2></div></div>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p62-brand-modal\').remove()">✕</button></div>' +
      '<div style="margin-top:14px;display:flex;flex-direction:column;gap:6px">' + list + '</div></div>';
    document.body.appendChild(modal);
  };

  /* =================================================================
     PART 11 — GARAGE TAB
     ================================================================= */
  p62BuildGarageTab = function () {
    const cars = S.cars || [];
    if (!cars.length) {
      return '<section class="card" style="text-align:center;padding:32px 16px"><div style="font-size:3rem;opacity:.4">🅿️</div><h3 style="margin-top:12px">Your garage is empty</h3><p class="muted">Browse the New or Used tabs to buy a car.</p></section>';
    }
    const rate = p63Rate();
    const year = gameYear();
    return cars.map(function (car) {
      const value = Math.round(p63CarValueInternal(car) * rate);
      const cond = Math.round(car.cond || 100);
      const condColor = cond < 40 ? 'var(--rose)' : cond < 65 ? 'var(--amber)' : 'var(--mint)';
      const fuel = car.fuel === 'e' ? '⚡ Electric' : car.fuel === 'h' ? '🔋 Hybrid' : '⛽ Gasoline';
      const insLabel = (P62_INSURANCE[car.insurance] || P62_INSURANCE.compreh).label;
      const clsLabel = (P62_CLS[car.cls] || {}).label || 'Car';
      let loanHtml = '';
      if (car.hasLoan && car.loanKey && S.bank && S.bank.installments && S.bank.installments[car.loanKey]) {
        const loan = S.bank.installments[car.loanKey];
        const remainingEGP = Math.round(loan.remaining * rate);
        const monthlyEGP = Math.round(loan.monthlyPayment * rate);
        const missed = loan.missedPayments || 0;
        loanHtml = '<div style="margin-top:10px;padding:10px;background:rgba(251,191,36,.08);border-left:3px solid var(--amber);border-radius:6px">' +
          '<b style="font-size:.82rem;color:var(--amber)">💳 Active car loan</b>' +
          '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Remaining</span><b class="mono">' + remainingEGP.toLocaleString() + ' EGP</b></div>' +
          '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Monthly</span><b class="mono">' + monthlyEGP.toLocaleString() + ' EGP</b></div>' +
          '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Payments left</span><b>' + (loan.monthsLeft || 0) + '</b></div>' +
          (missed > 0 ? '<div style="margin-top:5px;padding:5px;background:rgba(251,113,133,.15);border-radius:4px;font-size:.76rem;color:var(--rose)"><b>⚠️ ' + missed + ' missed payment(s)</b></div>' : '') +
          '<button class="btn" style="margin-top:6px;font-size:.78rem;padding:6px" onclick="p63PayCarLoanEarly(\'' + car.loanKey + '\')">Pay extra / pay off</button>' +
          '</div>';
      }
      return '<section class="card" style="padding:14px;border-left:3px solid ' + condColor + '">' +
        '<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">' +
        '<div style="flex-shrink:0">' + p62BrandBadge(car.brand || 'toyota', 40) + '</div>' +
        '<div style="min-width:0;flex:1">' +
        '<div style="font-weight:700;font-size:.95rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + car.year + ' ' + car.make + ' ' + car.name + '</div>' +
        '<div class="muted" style="font-size:.75rem;margin-top:2px">' + (P62_TRIMS[car.trim || 0] || P62_TRIMS[0]).label + ' · ' + clsLabel + ' · ' + fuel + '</div>' +
        '<div class="muted" style="font-size:.72rem;margin-top:1px">' + (car.miles || 0).toLocaleString() + ' km</div>' +
        '</div></div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">' +
        '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
        '<div class="muted" style="font-size:.68rem;text-transform:uppercase">Market value</div>' +
        '<div class="mono" style="font-size:.9rem;font-weight:700;margin-top:3px">' + value.toLocaleString() + ' EGP</div></div>' +
        '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
        '<div class="muted" style="font-size:.68rem;text-transform:uppercase">Condition</div>' +
        '<div class="mono" style="font-size:.9rem;font-weight:700;margin-top:3px;color:' + condColor + '">' + cond + '%</div></div></div>' +
        '<div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:10px">' +
        '<div style="height:100%;width:' + cond + '%;background:' + condColor + '"></div></div>' +
        (car.broken ? '<div style="padding:10px;background:rgba(251,113,133,.1);border-left:3px solid var(--rose);border-radius:6px;margin-bottom:10px"><b style="font-size:.82rem;color:var(--rose)">🔧 Broken down</b><div class="muted" style="font-size:.78rem;margin-top:3px">Repair: ' + Math.round((car.fix || 0) * rate).toLocaleString() + ' EGP</div></div>' : '') +
        '<div class="row" style="padding:4px 0;font-size:.82rem"><span>Insurance</span><b>' + insLabel + '</b></div>' +
        '<div class="row" style="padding:4px 0;font-size:.82rem"><span>Insurance until</span><b>' + (car.insuranceExpiry || year) + '</b></div>' +
        '<div class="row" style="padding:4px 0;font-size:.82rem"><span>Registration until</span><b>' + (car.registrationExpiry || year) + '</b></div>' +
        loanHtml +
        '<div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">' +
        (car.broken ? '<button class="btn" style="text-align:center;margin:0" onclick="p62RepairCar(\'' + car.uid + '\')">🔧 Repair</button>' : '') +
        '<button class="btn" style="text-align:center;margin:0" onclick="p62RenewInsurance(\'' + car.uid + '\')">🛡 Renew insurance</button>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
        '<button class="btn" style="margin:0;text-align:center;font-size:.78rem;padding:8px" onclick="p62ChangeInsurance(\'' + car.uid + '\',\'tp\')">Third-party</button>' +
        '<button class="btn" style="margin:0;text-align:center;font-size:.78rem;padding:8px" onclick="p62ChangeInsurance(\'' + car.uid + '\',\'compreh\')">Comprehensive</button>' +
        '</div>' +
        '<button class="btn" style="text-align:center;margin:0;border-color:var(--rose);color:var(--rose)" onclick="p63SellCar(\'' + car.uid + '\')">💵 Sell car · ' + value.toLocaleString() + ' EGP</button>' +
        '</div></section>';
    }).join('');
  };

  /* =================================================================
     PART 12 — CAR LOAN DEFAULT + REPOSSESSION
     ================================================================= */
  function p63ProcessCarLoans() {
    if (!S || !S.cars || !S.bank || !S.bank.installments) return;
    const rate = p63Rate();
    Object.keys(S.bank.installments).forEach(function (key) {
      const loan = S.bank.installments[key];
      if (!loan || !loan.linkedCarUid) return;
      const car = (S.cars || []).find(function (c) { return c && c.uid === loan.linkedCarUid; });
      if (!car) { delete S.bank.installments[key]; return; }
      const monthlyPayment = Number(loan.monthlyPayment) || 0;
      if (monthlyPayment <= 0) return;
      if (S.wealth >= monthlyPayment) {
        S.wealth -= monthlyPayment;
        S.expenses = (S.expenses || 0) + monthlyPayment;
        S.bill = S.bill || {};
        S.bill.carLoan = (S.bill.carLoan || 0) + monthlyPayment;
        loan.remaining = Math.max(0, loan.remaining - monthlyPayment);
        loan.monthsLeft = Math.max(0, (loan.monthsLeft || 0) - 1);
        loan.missedPayments = 0;
        if (loan.remaining < 0.5) {
          log('✅ Car loan for ' + car.make + ' ' + car.name + ' fully paid off!');
          delete S.bank.installments[key];
          car.hasLoan = false;
          car.loanKey = null;
        }
      } else {
        loan.missedPayments = (loan.missedPayments || 0) + 1;
        const missed = loan.missedPayments;
        if (missed === 1) {
          log('⚠️ MISSED car loan payment for ' + car.make + ' ' + car.name + '.');
          if (typeof realismNotice === 'function') realismNotice('Missed car loan payment', 'Pay soon or the bank will act.');
          loan.remaining *= 1.05;
        } else if (missed === 2 || missed === 3) {
          log('⚠️⚠️ ' + missed + ' missed payments. Formal bank warning.');
          if (typeof realismNotice === 'function') realismNotice('Bank warning', 'Missed ' + missed + ' payments.');
          loan.remaining *= 1.05;
        } else if (missed >= 6) {
          log('🚨 BANK REPOSSESSED ' + car.year + ' ' + car.make + ' ' + car.name + ' after ' + missed + ' missed payments.');
          if (typeof realismNotice === 'function') realismNotice('Car repossessed', 'Bank repossessed your ' + car.make + ' ' + car.name + '.');
          S.cars = (S.cars || []).filter(function (c) { return c.uid !== loan.linkedCarUid; });
          if (loan.remaining > 0) {
            if (!S.bank.loans) S.bank.loans = [];
            S.bank.loans.push({
              id: 'repo_' + Date.now(), principal: loan.remaining,
              remainingBal: loan.remaining, rate: 0.16,
              annualPmt: Math.round(loan.remaining / 3),
              yearsTotal: 3, yearsLeft: 3
            });
            log('💸 Remaining ' + Math.round(loan.remaining * rate).toLocaleString() + ' EGP moved to bank debt.');
          }
          delete S.bank.installments[key];
        }
      }
    });
  }

  function p63PayCarLoanEarly(loanKey) {
    if (!S.bank || !S.bank.installments || !S.bank.installments[loanKey]) return hint('Loan not found.');
    const loan = S.bank.installments[loanKey];
    const rate = p63Rate();
    const remainingEGP = Math.round(loan.remaining * rate);
    const input = prompt('How much to pay? (Full remaining: ' + remainingEGP.toLocaleString() + ' EGP)', '');
    if (input == null) return;
    const egp = Number(input);
    if (!isFinite(egp) || egp <= 0) return hint('Enter a valid amount.');
    const pay = Math.min(p63EGPtoInternal(egp), loan.remaining, S.wealth);
    if (pay <= 0) return hint('Not enough cash.');
    S.wealth -= pay;
    loan.remaining = Math.max(0, loan.remaining - pay);
    log('💸 Paid E£' + Math.round(pay * rate).toLocaleString() + ' toward car loan. Remaining: E£' + Math.round(loan.remaining * rate).toLocaleString() + ' EGP.');
    if (loan.remaining < 0.5) {
      log('✅ Car loan fully paid off!');
      delete S.bank.installments[loanKey];
      if (S.cars) S.cars.forEach(function (c) { if (c.loanKey === loanKey) { c.hasLoan = false; c.loanKey = null; } });
    }
    render();
  }
  window.p63PayCarLoanEarly = p63PayCarLoanEarly;

  const _p52Tick = p52MonthlyTick;
  p52MonthlyTick = function () {
    _p52Tick.apply(this, arguments);
    try { p63ProcessCarLoans(); } catch (e) { console.error('[p63] car loan tick failed:', e); }
  };

  /* =================================================================
     PART 13 — FUEL IN EGP + CAR HEADER
     ================================================================= */
  const _headerBefore = p62BuildCarsHeader;
  p62BuildCarsHeader = function () {
    let html = _headerBefore.apply(this, arguments);
    if (S && S.country === 'egy') {
      const petrol = Math.round(15.25 * p63Idx());
      html = html.replace(/Fuel \$[\d.]+(\/gal)?\s*·/, '⛽ Petrol ' + petrol + ' EGP/L ·');
    }
    return html;
  };

  /* =================================================================
     PART 14 — PARENT CAR OFFER (safe)
     ================================================================= */
  p62ParentCarOffer = function () {
    if (!S || S.age < 18) return;
    if (typeof p62Init === 'function') p62Init();
    if (S.p62.lastOfferYear === gameYear()) return;
    const _plist = (typeof parents === 'function') ? parents() : [];
    const _alive = _plist.filter(function (p) { return p && p.alive !== false; });
    if (!_alive.length) return;
    const fw = Number(S.famWealth) || 0;
    if (fw === 0) return;
    if (S.cars && S.cars.length > 0) return;
    if (Math.random() > (fw === 2 ? 0.35 : 0.15)) return;
    S.p62.lastOfferYear = gameYear();
    S.p62.pendingOffers.push({ year: gameYear(), type: 'parent_gift_car', wealthTier: fw });
  };

  /* =================================================================
     PART 15 — PROPERTY GATES (from 63/64)
     ================================================================= */
  function p63AnnualIncome() {
    if (typeof p54LiveIncome === 'function') return p54LiveIncome();
    return Number(S.income) || 0;
  }
  function p63AnnualExpenses() {
    if (typeof p54LiveExpenses === 'function') return p54LiveExpenses();
    return Number(S.expenses) || 0;
  }

  const _p12Buy = (typeof p12BuyListing === 'function') ? p12BuyListing : null;
  if (_p12Buy) {
    p12BuyListing = function (id, financing) {
      const market = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket() : [];
      const listing = market.find(function (x) { return x && x.id === id; });
      if (!listing) return _p12Buy.apply(this, arguments);
      const rate = p63Rate();
      const priceInternal = Number(listing.priceInternal) || 0;
      const priceEGP = Math.round(priceInternal * rate);
      const downInternal = financing === 'mortgage' ? priceInternal * 0.20 : priceInternal;
      const downEGP = Math.round(downInternal * rate);
      const cashEGP = Math.round(S.wealth * rate);
      if (financing !== 'mortgage' && S.wealth < priceInternal) {
        return hint('❌ REFUSED: Need E£' + priceEGP.toLocaleString() + ' in cash. You have E£' + cashEGP.toLocaleString() + '.');
      }
      if (financing === 'mortgage') {
        if (S.wealth < downInternal) {
          return hint('❌ REFUSED: Down payment E£' + downEGP.toLocaleString() + '. You have E£' + cashEGP.toLocaleString() + '.');
        }
        const mortRate = S.mortRate || 0.19;
        const annualMort = (priceInternal - downInternal) * (mortRate / (1 - Math.pow(1 + mortRate, -20)));
        const monthlyMort = annualMort / 12;
        const monthlyInc = p63AnnualIncome() / 12;
        const ratio = monthlyMort / Math.max(1, monthlyInc);
        if (ratio > 0.35) {
          return hint('❌ REFUSED by bank: monthly mortgage would be ' + Math.round(monthlyMort * rate).toLocaleString() + ' EGP (' + Math.round(ratio * 100) + '% of income). Limit is 35%.');
        }
      }
      return _p12Buy.apply(this, arguments);
    };
  }

  const _purchaseProperty = purchaseProperty;
  purchaseProperty = function (rosterId, unitId, planId, isCompound, isEgypt) {
    const y = gameYear();
    const catalog = isCompound
      ? (typeof COMPOUND_ROSTER !== 'undefined' && (COMPOUND_ROSTER[isEgypt ? 'egy' : S.country] || COMPOUND_ROSTER.egy))
      : (typeof LOCAL_MARKET_ROSTER !== 'undefined' && (LOCAL_MARKET_ROSTER[isEgypt ? 'egy' : S.country] || LOCAL_MARKET_ROSTER.egy));
    if (!catalog) return _purchaseProperty.apply(this, arguments);
    const prop = catalog.find(function (p) { return p.id === rosterId; });
    const unit = (typeof PROPERTY_UNITS !== 'undefined') ? PROPERTY_UNITS.find(function (u) { return u.id === unitId; }) : null;
    const plan = isCompound && typeof COMPOUND_PLANS !== 'undefined' ? COMPOUND_PLANS.find(function (p) { return p.id === planId; }) : { downPct: 1, years: 0, markup: 1 };
    if (!prop || !unit || !plan) return _purchaseProperty.apply(this, arguments);
    const idx = (isEgypt && typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(y) : 1;
    const rawPrice = unit.area * prop.ppm * unit.mult * idx;
    const basePrice = isEgypt ? Math.round(rawPrice / 1000) * 1000 : Math.round(rawPrice);
    const finalPriceAmt = Math.round(basePrice * plan.markup);
    const downAmt = Math.round(finalPriceAmt * plan.downPct);
    const rate = p63Rate();
    const internalDown = downAmt / rate;
    const internalRemaining = (finalPriceAmt - downAmt) / rate;
    const cashEGP = Math.round(S.wealth * rate);
    if (plan.years === 0) {
      if (S.wealth < internalDown) return hint('❌ REFUSED: Full cash E£' + finalPriceAmt.toLocaleString() + '. You have E£' + cashEGP.toLocaleString() + '.');
    } else {
      if (S.wealth < internalDown) return hint('❌ REFUSED: Down E£' + downAmt.toLocaleString() + '. You have E£' + cashEGP.toLocaleString() + '.');
      const annualPaymentInternal = internalRemaining / plan.years;
      const annualIncomeInternal = p63AnnualIncome();
      const ratio = annualPaymentInternal / Math.max(1, annualIncomeInternal);
      if (ratio > 0.35) return hint('❌ REFUSED by developer: monthly payment/income ' + Math.round(ratio * 100) + '%. Limit 35%.');
    }
    return _purchaseProperty.apply(this, arguments);
  };

  /* =================================================================
     PART 16 — PROPERTY CARD CASHFLOW BREAKDOWN
     ================================================================= */
  const _p61Card = (typeof p61BuildPropertyCard === 'function') ? p61BuildPropertyCard : null;
  if (_p61Card) {
    p61BuildPropertyCard = function (home) {
      let html = _p61Card.apply(this, arguments);
      if (!home) return html;
      if (html.indexOf('Monthly breakdown') !== -1) return html;
      const rate = p63Rate();
      const rent = ((home.status === 'p12-rented' || home.status === 'rent'))
        ? (home.rentLocalAmount || ((Number(home.rentAmount) || 0) * rate)) : 0;
      const mort = ((Number(home.balance) || 0) > 0 && home.pay) ? ((Number(home.pay) * rate) / 12) : 0;
      const val = Number(home.value) || 0;
      const maint = (val * rate * 0.01) / 12;
      const tax = (val * rate * 0.01) / 12;
      const util = (val * rate * 0.008) / 12;
      const net = rent - mort - maint - tax - util;
      const block = '<div style="margin-top:10px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
        '<b style="font-size:.82rem;color:var(--cyan)">📊 Monthly breakdown</b>' +
        '<div class="row" style="border:0;padding:3px 0"><span>Rent collected</span><b class="mono" style="color:var(--mint)">' + (rent > 0 ? '+' : '') + Math.round(rent).toLocaleString() + ' EGP</b></div>' +
        (mort > 0 ? '<div class="row" style="border:0;padding:3px 0"><span>Mortgage</span><b class="mono" style="color:var(--rose)">-' + Math.round(mort).toLocaleString() + ' EGP</b></div>' : '') +
        '<div class="row" style="border:0;padding:3px 0"><span>Maintenance (1%/yr)</span><b class="mono" style="color:var(--rose)">-' + Math.round(maint).toLocaleString() + ' EGP</b></div>' +
        '<div class="row" style="border:0;padding:3px 0"><span>Property tax</span><b class="mono" style="color:var(--rose)">-' + Math.round(tax).toLocaleString() + ' EGP</b></div>' +
        '<div class="row" style="border:0;padding:3px 0"><span>Utilities</span><b class="mono" style="color:var(--rose)">-' + Math.round(util).toLocaleString() + ' EGP</b></div>' +
        '<div class="row" style="border-top:1px solid var(--line);margin-top:4px;padding-top:4px"><span><b>Net monthly</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (net >= 0 ? '+' : '') + Math.round(net).toLocaleString() + ' EGP</b></div>' +
        '</div>';
      const idx = html.lastIndexOf('</section>');
      if (idx !== -1) html = html.slice(0, idx) + block + html.slice(idx);
      return html;
    };
  }

  /* =================================================================
     PART 17 — MORTGAGE RECALC AFTER EARLY PAYMENT
     ================================================================= */
  const _p59Custom = (typeof p59PayMortgageCustom === 'function') ? p59PayMortgageCustom : null;
  if (_p59Custom) {
    p59PayMortgageCustom = function (homeId) {
      const home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
      if (!home) return _p59Custom.apply(this, arguments);
      const oldBal = Number(home.balance) || 0;
      const oldPay = Number(home.pay) || 0;
      const result = _p59Custom.apply(this, arguments);
      const newBal = Number(home.balance) || 0;
      if (oldPay > 0 && oldBal > 0 && newBal < oldBal && newBal > 0) {
        const newPay = Math.max(500, Math.round(oldPay * (newBal / oldBal)));
        home.pay = newPay;
        log('🏠 Annual mortgage recalculated: E£' + Math.round(oldPay * p63Rate()).toLocaleString() + ' → E£' + Math.round(newPay * p63Rate()).toLocaleString() + '.');
      }
      return result;
    };
  }
  const _p59Full = (typeof p59PayMortgageFull === 'function') ? p59PayMortgageFull : null;
  if (_p59Full) {
    p59PayMortgageFull = function (homeId) {
      const home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
      if (home) home.pay = 0;
      return _p59Full.apply(this, arguments);
    };
  }

  /* =================================================================
     PART 18 — CLEAN STALE BILLS ON SALE
     ================================================================= */
  function p63CleanBills() {
    if (!S || !S.bill) return;
    const hasMort = (S.ownedHomes || []).some(function (h) { return h && (Number(h.balance) || 0) > 0; });
    const hasRent = (S.ownedHomes || []).some(function (h) { return h && h.p12 && h.status === 'p12-rented'; });
    if (!hasMort && S.bill.mortgage) { delete S.bill.mortgage; log('🧹 Cleaned stale mortgage line.'); }
    if (!hasRent && S.bill.rentalMaintenance) { delete S.bill.rentalMaintenance; log('🧹 Cleaned stale rental maintenance.'); }
    S.expenses = Object.values(S.bill).reduce(function (s, v) { const n = Number(v); return s + (isFinite(n) && n > 0 ? n : 0); }, 0);
    if (S.yearPopup) S.yearPopup.expenses = S.expenses;
    save();
  }
  const _p61Sell = (typeof p61SellProperty === 'function') ? p61SellProperty : null;
  if (_p61Sell) {
    p61SellProperty = function (homeId) {
      const before = (S.ownedHomes || []).length;
      const r = _p61Sell.apply(this, arguments);
      if ((S.ownedHomes || []).length < before) p63CleanBills();
      return r;
    };
  }
  const _sellOwned = (typeof sellOwnedProperty === 'function') ? sellOwnedProperty : null;
  if (_sellOwned) {
    sellOwnedProperty = function (idx) {
      const before = (S.ownedHomes || []).length;
      const r = _sellOwned.apply(this, arguments);
      if ((S.ownedHomes || []).length < before) p63CleanBills();
      return r;
    };
  }

  /* =================================================================
     PART 19 — ONE-TIME REBUILD OF OLD CARS
     ================================================================= */
  function p63RebuildOldCars() {
    if (!S || !S.cars || !S.cars.length) return;
    let fixed = 0;
    S.cars.forEach(function (car) {
      if (!car) return;
      const model = P62_MODELS.find(function (m) { return m[0] === (car.brand || '') && m[1] === car.name; });
      if (!model) return;
      if (car.cls !== model[2]) car.cls = model[2];
      const year = car.year || gameYear();
      const modelYear = Math.max(year, model[8] || 2007);
      const correctMsrp = p63CarBaseInternal(model, modelYear);
      const ratio = Number(car.msrp) / Math.max(1, correctMsrp);
      if (ratio < 0.3 || ratio > 3) { car.msrp = correctMsrp; fixed++; }
      car.value = p63CarValueInternal(car);
    });
    if (fixed > 0) { log('🔧 Rebuilt prices for ' + fixed + ' old car(s).'); save(); }
  }
  p63RebuildOldCars();

  /* =================================================================
     PART 20 — RENDER HOOK (refresh modal on cfg change)
     ================================================================= */
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    if (S && S.p62 && S.p62.carCfg && S.p62.carCfg.modelId && document.getElementById('p62-cfg-modal')) {
      p63RenderConfigModal();
    }
    if (document.getElementById('p62-cfg-modal') && (!S || !S.p62 || !S.p62.carCfg || !S.p62.carCfg.modelId)) {
      document.getElementById('p62-cfg-modal').remove();
    }
    return r;
  };

  /* =================================================================
     PART 21 — CLEANUP ON LOAD
     ================================================================= */
  p63CleanBills();

  console.log('[p63] Cars fixes consolidated (was 63, 64, 65) — loaded');
})();
