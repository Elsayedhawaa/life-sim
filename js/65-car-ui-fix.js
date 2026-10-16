/* =====================================================================
   65. CAR UI + PRICE + LOAN DEFAULT — Final Fixed Version
   Fixes:
   - Class index is [2] not [3] (was showing wrong class label)
   - Unified car value: garage and sell button show the SAME number
   - P62_OPTIONS read as array-of-arrays (fixed)
   - Single price source: brand list matches config modal
   - Sell car with dealership fee (10%)
   - Loan default → warnings → repossession
   Load AFTER 64-final-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p65Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p65Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* =================================================================
   UNIFIED CAR VALUE — used by garage AND sell button
   Formula: msrp × depreciation × condition factor
   ================================================================= */
function p65CarValueInternal(car) {
  if (!car) return 0;
  const msrp = Number(car.msrp) || 0;
  const dep = (typeof p62Depreciation === 'function') ? p62Depreciation(car.age || 0) : 1;
  const cond = Number(car.cond) || 100;
  const condFactor = 0.6 + 0.4 * (cond / 100);
  return Math.round(msrp * dep * condFactor);
}

/* =================================================================
   PRICE HELPERS — single source of truth
   P62_MODELS row indices:
     [0]make [1]model [2]class [3]price [4]mpg [5]hap [6]soc [7]life
     [8]fromYear [9]toYear [10]hybridFrom [11]isElectric
   ================================================================= */
function p65CarBaseUSD(model, year) {
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
function p65CarBaseEGP(model, year) {
  const usd = p65CarBaseUSD(model, year);
  return Math.round(usd * 52.7 * p65Idx());
}
function p65CarBaseInternal(model, year) {
  return p65CarBaseEGP(model, year) / p65Rate();
}
function p65EGPtoInternal(egp) { return egp / p65Rate(); }
function p65InternalToEGP(internal) { return internal * p65Rate(); }

/* Override the base function so everyone uses this math */
p62BasePriceUSD = function (model, year) {
  return p65CarBaseInternal(model, year || gameYear());
};

/* =================================================================
   INCOME HELPERS
   ================================================================= */
function p65MonthlyIncomeInternal() {
  const total = (typeof p54LiveIncome === 'function') ? p54LiveIncome() : (Number(S.income) || 0);
  return total / 12;
}
function p65MonthlyExpensesInternal() {
  const total = (typeof p54LiveExpenses === 'function') ? p54LiveExpenses() : (Number(S.expenses) || 0);
  return total / 12;
}
function p65CurrentNetInternal() {
  return p65MonthlyIncomeInternal() - p65MonthlyExpensesInternal();
}

/* =================================================================
   OPTION READERS (P62_OPTIONS is array-of-arrays)
   Row: [id, label, usd, hap, soc, fromYear, untilYear]
   ================================================================= */
function p65OptionsForYear(year) {
  if (typeof P62_OPTIONS === 'undefined') return [];
  return P62_OPTIONS.filter(function (o) {
    if (!Array.isArray(o)) return false;
    const from = Number(o[5]) || 0;
    const until = Number(o[6]) || 9999;
    return year >= from && year <= until;
  });
}
function p65OptionPriceEGP(o) {
  const usd = Number(o[2]) || 0;
  return Math.round(usd * 52.7 * p65Idx());
}
function p65OptionPriceInternal(o) {
  return p65EGPtoInternal(p65OptionPriceEGP(o));
}

/* =================================================================
   CONFIG PRICE — single source of truth
   ================================================================= */
function p65CfgPrice() {
  p62Init();
  const cfg = S.p62.carCfg;
  const empty = { car: 0, opts: 0, registration: 0, insurance: 0, total: 0, model: null, cls: P62_CLS.compact };
  if (!cfg || !cfg.modelId) return empty;
  const model = p62ModelById(cfg.modelId);
  if (!model) return empty;

  const year = gameYear();
  const baseInternal = p65CarBaseInternal(model, year);

  /* Trim */
  const trim = (P62_TRIMS && P62_TRIMS[cfg.trim]) || (P62_TRIMS && P62_TRIMS[0]) || { mult: 1 };
  const colorAdd = (P62_COLORS && P62_COLORS[cfg.color]) ? Number(P62_COLORS[cfg.color][1]) || 0 : 0;
  const colorInternal = p65EGPtoInternal(colorAdd * 52.7 * p65Idx());

  const interior = (P62_INTERIORS && P62_INTERIORS[cfg.interior]) || (P62_INTERIORS && P62_INTERIORS[0]) || { usd: 0 };
  const interiorInternal = p65EGPtoInternal((Number(interior.usd) || 0) * 52.7 * p65Idx());

  /* Options */
  let optsInternal = 0;
  (cfg.opts || []).forEach(function (oid) {
    const o = p65OptionsForYear(year).find(function (opt) { return opt[0] === oid; });
    if (o) optsInternal += p65OptionPriceInternal(o);
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
    cls: P62_CLS[model[2]] || P62_CLS.compact   /* FIX: model[2] is class */
  };
}
p62CfgPrice = p65CfgPrice;

/* =================================================================
   LOAN BREAKDOWN
   ================================================================= */
function p65LoanBreakdown(carInternal, downPct, months) {
  const down = carInternal * downPct;
  const financed = carInternal - down;
  const ratePct = 0.16;
  const years = months / 12;
  const totalWithInterest = financed * (1 + ratePct * years);
  const monthlyPayment = totalWithInterest / months;
  const yearlyPayment = monthlyPayment * 12;
  const rate = p65Rate();
  return {
    down: down,
    downEGP: Math.round(down * rate),
    financed: financed,
    financedEGP: Math.round(financed * rate),
    totalWithInterest: totalWithInterest,
    totalEGP: Math.round(totalWithInterest * rate),
    monthlyPayment: monthlyPayment,
    monthlyEGP: Math.round(monthlyPayment * rate),
    yearlyPayment: yearlyPayment,
    yearlyEGP: Math.round(yearlyPayment * rate),
    interestEGP: Math.round((totalWithInterest - financed) * rate),
    months: months,
    years: years
  };
}

/* =================================================================
   BANK APPROVAL PREDICTION
   ================================================================= */
function p65PredictApproval(monthlyPaymentInternal) {
  const monthlyIncome = p65MonthlyIncomeInternal();
  const currentNet = p65CurrentNetInternal();
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

  if (ratio <= 0.15) { score += 3; reasons.push('Payment is small vs income'); }
  else if (ratio <= 0.25) { score += 1; reasons.push('Payment fits income'); }
  else if (ratio <= 0.35) { score -= 1; reasons.push('Payment is high vs income'); }
  else { score -= 4; reasons.push('Payment exceeds 35% of income'); }

  if (projectedNet < 0) { score -= 3; reasons.push('Cashflow would go negative'); }

  let verdict, color;
  if (score >= 5) { verdict = 'Likely approved'; color = 'var(--mint)'; }
  else if (score >= 2) { verdict = 'Possibly approved'; color = 'var(--amber)'; }
  else if (score >= 0) { verdict = 'Risky — may be declined'; color = 'var(--amber)'; }
  else { verdict = 'Will likely be declined'; color = 'var(--rose)'; }

  return { verdict, color, score, reasons, projectedNet, projectedNetEGP: Math.round(projectedNet * p65Rate()), incomeRatio: ratio };
}

/* =================================================================
   PURCHASE HANDLER
   ================================================================= */
function p65PurchaseCar(method) {
  p62Init();
  if (typeof p62HasLicense === 'function' && !p62HasLicense()) return hint('You need a valid driving licence first.');
  const price = p65CfgPrice();
  if (!price.model) return hint('No car configured. Please pick a model first.');
  const rate = p65Rate();
  const model = price.model;

  /* Cash */
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
      name: model[1],
      cls: model[2],                             /* FIX: class is [2] */
      year: gameYear(),
      trim: cfg.trim, color: cfg.color, interior: cfg.interior,
      opts: (cfg.opts || []).slice(),
      msrp: price.car,
      paid: price.total,
      insurance: cfg.insurance,
      insuranceExpiry: gameYear() + 1,
      registrationExpiry: gameYear() + 1,
      miles: 0, cond: 100, age: 0, acc: false, broken: false, fix: 0,
      mods: [], modCost: 0, seller: 'dealer',
      brand: model[0],
      fuel: model[11] ? 'e' : (model[10] && gameYear() >= model[10] ? 'h' : 'g'),
      life: model[7],
      value: price.car,
      hasLoan: false
    };
    S.cars = S.cars || [];
    S.cars.push(car);
    S.cars = S.cars.slice(-4);
    fx({ happiness: 8, social: 6 });
    log('🚗 Purchased ' + car.year + ' ' + car.make + ' ' + car.name + ' for cash (' + Math.round(price.total * rate).toLocaleString() + ' EGP).');
    closeCarModal();
    p62ResetCfg(null, null);
    S.p62.subTab = 'garage';
    render();
    return;
  }

  /* Loan */
  const isSeven = method === 'loan7';
  const downPct = isSeven ? 0.10 : 0.15;
  const months = isSeven ? 84 : 60;
  const loan = p65LoanBreakdown(price.car, downPct, months);

  if (S.wealth < loan.down) {
    return hint('❌ Not enough cash for down payment. Need ' + loan.downEGP.toLocaleString() + ' EGP. You have ' + Math.round(S.wealth * rate).toLocaleString() + ' EGP.');
  }

  const pred = p65PredictApproval(loan.monthlyPayment);
  const approvalChance = Math.max(0.05, Math.min(0.95, 0.5 + pred.score * 0.08));
  if (Math.random() > approvalChance) {
    return hint('❌ Bank DECLINED your financing.\n\nReasons: ' + pred.reasons.join(', ') + '\n\nImprove your credit score or income and try again.');
  }

  S.wealth -= loan.down;
  if (!S.bank) S.bank = { installments: {}, cardDebt: {}, activeCards: [], primaryCard: null, score: 680, savingsBal: 0, loans: [], missedPmts: 0 };
  if (!S.bank.installments) S.bank.installments = {};

  const cfg = S.p62.carCfg;
  const uid = 'c' + Math.random().toString(36).slice(2, 8);
  const key = 'car_loan_' + uid;

  S.bank.installments[key] = {
    name: 'Car loan — ' + model[1] + ' (' + months + ' mo)',
    totalBalance: loan.totalWithInterest,
    remaining: loan.totalWithInterest,
    monthlyPayment: loan.monthlyPayment,
    monthsTotal: months,
    monthsLeft: months,
    fee: loan.totalWithInterest - loan.financed,
    startedYear: gameYear(),
    linkedCarUid: uid,
    missedPayments: 0,
    warningsSent: 0
  };

  const car = {
    uid: uid,
    make: P62_BRANDS[model[0]] ? P62_BRANDS[model[0]].name : model[0],
    name: model[1],
    cls: model[2],                                /* FIX: class is [2] */
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
    value: price.car,
    hasLoan: true,
    loanKey: key
  };
  S.cars = S.cars || [];
  S.cars.push(car);
  S.cars = S.cars.slice(-4);
  fx({ happiness: 8, social: 6 });
  log('🏦 Bank APPROVED car loan. Down: ' + loan.downEGP.toLocaleString() + ' EGP. Monthly: ' + loan.monthlyEGP.toLocaleString() + ' EGP × ' + months + ' months.');
  realismNotice('Car purchased on loan', car.year + ' ' + car.make + ' ' + car.name + ' financed over ' + months + ' months.');
  closeCarModal();
  p62ResetCfg(null, null);
  S.p62.subTab = 'garage';
  render();
}
window.p65PurchaseCar = p65PurchaseCar;

function closeCarModal() {
  const m = document.getElementById('p62-cfg-modal');
  if (m) m.remove();
}
window.closeCarModal = closeCarModal;

/* =================================================================
   SELL CAR — matches garage value exactly
   ================================================================= */
function p65SellCar(uid) {
  if (!S || !S.cars) return;
  const car = S.cars.find(function (c) { return c && c.uid === uid; });
  if (!car) return hint('Car not found.');

  const rate = p65Rate();
  const fullValueInternal = p65CarValueInternal(car);
  const fullValueEGP = Math.round(fullValueInternal * rate);
  const commission = Math.round(fullValueEGP * 0.10);
  const sellEGP = fullValueEGP - commission;

  /* With active loan */
  if (car.hasLoan && car.loanKey && S.bank && S.bank.installments && S.bank.installments[car.loanKey]) {
    const loan = S.bank.installments[car.loanKey];
    const loanRemainingEGP = Math.round(loan.remaining * rate);

    if (loan.remaining > fullValueInternal) {
      const shortfallEGP = Math.round((loan.remaining - fullValueInternal) * rate);
      if (!confirm('⚠️ SELLING AT A LOSS\n\n' +
        'Car value: ' + fullValueEGP.toLocaleString() + ' EGP\n' +
        'Dealer commission (10%): -' + commission.toLocaleString() + ' EGP\n' +
        'You receive: ' + sellEGP.toLocaleString() + ' EGP\n\n' +
        'Loan remaining: ' + loanRemainingEGP.toLocaleString() + ' EGP\n\n' +
        'After the sale you will still owe ' + shortfallEGP.toLocaleString() + ' EGP.\n\n' +
        'That amount will be charged to your cash.\n\nProceed?')) return;

      if (S.wealth < p65EGPtoInternal(shortfallEGP)) {
        return hint('❌ You cannot afford the shortfall of ' + shortfallEGP.toLocaleString() + ' EGP.');
      }
      S.wealth -= p65EGPtoInternal(shortfallEGP);
      delete S.bank.installments[car.loanKey];
      log('🚗 Sold ' + car.make + ' ' + car.name + ' at a loss. Shortfall ' + shortfallEGP.toLocaleString() + ' EGP paid from cash.');
    } else {
      const netInternal = fullValueInternal - loan.remaining;
      const netEGP = Math.round(netInternal * rate) - commission;
      if (!confirm('Sell ' + car.year + ' ' + car.make + ' ' + car.name + '?\n\n' +
        'Car value: ' + fullValueEGP.toLocaleString() + ' EGP\n' +
        'Dealer commission (10%): -' + commission.toLocaleString() + ' EGP\n' +
        'Loan remaining: ' + loanRemainingEGP.toLocaleString() + ' EGP\n\n' +
        'You receive: ' + netEGP.toLocaleString() + ' EGP\n\nProceed?')) return;
      S.wealth += p65EGPtoInternal(Math.max(0, netEGP));
      delete S.bank.installments[car.loanKey];
      log('🚗 Sold ' + car.make + ' ' + car.name + ' and cleared the loan. Net: ' + netEGP.toLocaleString() + ' EGP.');
    }
  } else {
    if (!confirm('Sell ' + car.year + ' ' + car.make + ' ' + car.name + '?\n\n' +
      'Car value: ' + fullValueEGP.toLocaleString() + ' EGP\n' +
      'Dealer commission (10%): -' + commission.toLocaleString() + ' EGP\n\n' +
      'You receive: ' + sellEGP.toLocaleString() + ' EGP\n\nProceed?')) return;
    S.wealth += p65EGPtoInternal(sellEGP);
    log('🚗 Sold ' + car.make + ' ' + car.name + ' for ' + sellEGP.toLocaleString() + ' EGP.');
  }
  S.cars = S.cars.filter(function (c) { return c.uid !== uid; });
  render();
}
window.p65SellCar = p65SellCar;

/* =================================================================
   CONFIG MODAL
   ================================================================= */
function p65RenderConfigModal() {
  p62Init();
  const cfg = S.p62.carCfg;
  if (!cfg || !cfg.modelId) { closeCarModal(); return; }
  const model = p62ModelById(cfg.modelId);
  if (!model) { closeCarModal(); return; }

  const brand = P62_BRANDS[model[0]];
  const price = p65CfgPrice();
  const rate = p65Rate();
  const year = gameYear();
  const baseCarEGP = p65CarBaseEGP(model, year);

  /* Trim buttons */
  const trimBtns = P62_TRIMS.map(function (t, i) {
    const delta = Math.round((Number(t.mult) - 1) * baseCarEGP);
    return '<button class="btn ' + (cfg.trim === i ? 'sel' : '') + '" style="margin:0;padding:8px;font-size:.72rem;text-align:left" onclick="p62CfgSet(\'trim\',' + i + ')">' +
      '<b>' + t.label + '</b>' +
      '<div class="muted" style="font-size:.66rem;margin-top:2px">' + t.desc + '</div>' +
      (delta > 0 ? '<div class="mono" style="font-size:.7rem;color:var(--amber);margin-top:2px">+' + delta.toLocaleString() + ' EGP</div>' : '') +
      '</button>';
  }).join('');

  /* Colors */
  const colorHex = ['#ffffff', '#16161a', '#b9bcc4', '#6b6f7a', '#c8202f', '#2457c5', '#2f7d4f', '#e8731a', '#fbfaf3', '#2a2a2e'];
  const colorBtns = P62_COLORS.map(function (c, i) {
    const extra = Number(c[1]) || 0;
    const label = c[0] + (extra > 0 ? ' +' + Math.round(extra * 52.7 * p65Idx()).toLocaleString() + ' EGP' : '');
    return '<button title="' + label + '" onclick="p62CfgSet(\'color\',' + i + ')" style="width:34px;height:34px;border-radius:50%;background:' + colorHex[i] + ';border:3px solid ' + (cfg.color === i ? 'var(--violet)' : 'var(--line)') + ';cursor:pointer"></button>';
  }).join('');

  /* Interiors */
  const intBtns = P62_INTERIORS.map(function (int, idx) {
    const egp = Math.round((Number(int.usd) || 0) * 52.7 * p65Idx());
    return '<button class="btn ' + (cfg.interior === idx ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.7rem" onclick="p62CfgSet(\'interior\',' + idx + ')">' +
      int.label + (egp > 0 ? ' · +' + egp.toLocaleString() + ' EGP' : '') + '</button>';
  }).join('');

  /* Options — array format */
  const optsHtml = p65OptionsForYear(year).map(function (o) {
    const id = o[0];
    const label = o[1];
    const egp = p65OptionPriceEGP(o);
    const on = (cfg.opts || []).indexOf(id) >= 0;
    return '<label class="muted" style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--line);border-radius:6px;font-size:.82rem;cursor:pointer;margin-top:4px">' +
      '<input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="p62CfgSet(\'opt\',\'' + id + '\')">' +
      '<span style="flex:1">' + label + '</span>' +
      '<b class="mono" style="font-size:.8rem">+' + egp.toLocaleString() + '</b>' +
      '</label>';
  }).join('');

  /* Insurance */
  const insBtns = Object.keys(P62_INSURANCE).map(function (k) {
    const ins = P62_INSURANCE[k];
    return '<button class="btn ' + (cfg.insurance === k ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.68rem" onclick="p62CfgSet(\'insurance\',\'' + k + '\')">' + ins.label + '</button>';
  }).join('');

  /* Financial preview */
  const monthlyIncomeEGP = Math.round(p65MonthlyIncomeInternal() * rate);
  const netEGP = Math.round(p65CurrentNetInternal() * rate);
  const cashEGP = Math.round(S.wealth * rate);
  const loan5 = p65LoanBreakdown(price.car, 0.15, 60);
  const loan7 = p65LoanBreakdown(price.car, 0.10, 84);
  const cashOK = S.wealth >= price.total;
  const down5OK = S.wealth >= loan5.down;
  const down7OK = S.wealth >= loan7.down;
  const pred5 = p65PredictApproval(loan5.monthlyPayment);
  const pred7 = p65PredictApproval(loan7.monthlyPayment);

  /* Class label — index 2 */
  const clsLabel = (P62_CLS[model[2]] || {}).label || 'Car';

  const html = '<div class="p24-modal" style="max-width:540px;max-height:92vh;overflow-y:auto;padding:16px">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="display:flex;align-items:center;gap:10px">' + p62BrandBadge(model[0], 40) +
    '<div><div class="p24-pill">' + year + ' Model</div>' +
    '<h2 style="margin-top:6px;font-size:1.15rem">' + brand.name + ' ' + model[1] + '</h2>' +
    '<div class="muted" style="font-size:.78rem">' + clsLabel + ' · Base from ' + baseCarEGP.toLocaleString() + ' EGP</div>' +
    '</div></div>' +
    '<button class="menu-btn" onclick="closeCarModal()">✕</button></div>' +

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

    '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Options</h4>' + (optsHtml || '<p class="muted" style="font-size:.8rem">No options available this year.</p>') +

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

    /* Cash */
    '<div style="margin-top:8px;padding:12px;border:1px solid ' + (cashOK ? 'var(--mint)' : 'var(--line)') + ';border-radius:10px">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
    '<div><b>💵 Pay cash</b><div class="muted" style="font-size:.78rem;margin-top:3px">No loan, no interest</div></div>' +
    '<div class="mono" style="font-size:.95rem;font-weight:700">' + Math.round(price.total * rate).toLocaleString() + ' EGP</div>' +
    '</div>' +
    (cashOK ? '<button class="btn" style="margin-top:8px;text-align:center;background:var(--mint);color:#000;font-weight:700" onclick="p65PurchaseCar(\'cash\')">Buy with cash</button>'
            : '<p class="muted" style="font-size:.78rem;margin-top:8px">❌ Need ' + Math.round((price.total - S.wealth) * rate).toLocaleString() + ' EGP more</p>') +
    '</div>' +

    /* 5-year */
    '<div style="margin-top:10px;padding:12px;border:1px solid ' + (down5OK ? 'var(--cyan)' : 'var(--line)') + ';border-radius:10px">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="flex:1"><b>🏦 Bank loan — 5 years</b><div class="muted" style="font-size:.76rem;margin-top:3px">15% down · 16% flat interest</div></div>' +
    '<div style="text-align:right"><div class="mono" style="font-size:.9rem;font-weight:700">' + loan5.monthlyEGP.toLocaleString() + '</div><div class="muted" style="font-size:.68rem">EGP/month</div></div></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem;margin-top:6px"><span>Down payment (15%)</span><b class="mono">' + loan5.downEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Yearly payment</span><b class="mono">' + loan5.yearlyEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Total over 5 years</span><b class="mono">' + loan5.totalEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Interest paid</span><b class="mono" style="color:var(--rose)">' + loan5.interestEGP.toLocaleString() + ' EGP</b></div>' +
    '<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;font-size:.78rem">' +
    '<b style="color:' + pred5.color + '">' + pred5.verdict + '</b>' +
    '<div class="muted" style="font-size:.72rem;margin-top:3px">Net after purchase: <b style="color:' + (pred5.projectedNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (pred5.projectedNetEGP >= 0 ? '+' : '') + pred5.projectedNetEGP.toLocaleString() + ' EGP/month</b></div>' +
    '<div class="muted" style="font-size:.7rem;margin-top:3px">' + pred5.reasons.slice(0, 3).join(' · ') + '</div></div>' +
    (down5OK ? '<button class="btn" style="margin-top:8px;text-align:center" onclick="p65PurchaseCar(\'loan5\')">Apply for 5-year loan</button>'
            : '<p class="muted" style="font-size:.78rem;margin-top:8px">❌ Need ' + Math.max(0, loan5.downEGP - cashEGP).toLocaleString() + ' EGP more for down payment</p>') +
    '</div>' +

    /* 7-year */
    '<div style="margin-top:10px;padding:12px;border:1px solid ' + (down7OK ? 'var(--cyan)' : 'var(--line)') + ';border-radius:10px">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="flex:1"><b>🏦 Bank loan — 7 years</b><div class="muted" style="font-size:.76rem;margin-top:3px">10% down · lower monthly, more interest</div></div>' +
    '<div style="text-align:right"><div class="mono" style="font-size:.9rem;font-weight:700">' + loan7.monthlyEGP.toLocaleString() + '</div><div class="muted" style="font-size:.68rem">EGP/month</div></div></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem;margin-top:6px"><span>Down payment (10%)</span><b class="mono">' + loan7.downEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Yearly payment</span><b class="mono">' + loan7.yearlyEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Total over 7 years</span><b class="mono">' + loan7.totalEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Interest paid</span><b class="mono" style="color:var(--rose)">' + loan7.interestEGP.toLocaleString() + ' EGP</b></div>' +
    '<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;font-size:.78rem">' +
    '<b style="color:' + pred7.color + '">' + pred7.verdict + '</b>' +
    '<div class="muted" style="font-size:.72rem;margin-top:3px">Net after purchase: <b style="color:' + (pred7.projectedNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (pred7.projectedNetEGP >= 0 ? '+' : '') + pred7.projectedNetEGP.toLocaleString() + ' EGP/month</b></div>' +
    '<div class="muted" style="font-size:.7rem;margin-top:3px">' + pred7.reasons.slice(0, 3).join(' · ') + '</div></div>' +
    (down7OK ? '<button class="btn" style="margin-top:8px;text-align:center" onclick="p65PurchaseCar(\'loan7\')">Apply for 7-year loan</button>'
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
window.p65RenderConfigModal = p65RenderConfigModal;
p62OpenConfig = function (brandKey, modelId) {
  p62ResetCfg(brandKey, modelId);
  if (!p62ModelById(modelId)) return hint('Model not found.');
  p65RenderConfigModal();
};
p62RenderConfigModal = p65RenderConfigModal;

/* =================================================================
   NEW CARS TAB + BRAND LIST
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
    const models = P62_MODELS.filter(function (m) { return m[0] === key && p64ModelValid(m, year); });
    if (models.length) brands.push({ key: key, brand: P62_BRANDS[key], models: models });
  });
  const cards = brands.map(function (b) {
    let cheapest = Infinity;
    b.models.forEach(function (m) {
      const p = p65CarBaseEGP(m, year);
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
  const models = P62_MODELS.filter(function (m) { return m[0] === brandKey && p64ModelValid(m, year); });
  if (!models.length) return hint('No models available for ' + brand.name + ' in ' + year + '.');
  const list = models.map(function (m) {
    const egpPrice = p65CarBaseEGP(m, year);
    const cls = P62_CLS[m[2]] || P62_CLS.compact;      /* FIX: class is [2] */
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
   GARAGE TAB — clean layout, uses unified value
   ================================================================= */
p62BuildGarageTab = function () {
  const cars = S.cars || [];
  if (!cars.length) {
    return '<section class="card" style="text-align:center;padding:32px 16px"><div style="font-size:3rem;opacity:.4">🅿️</div><h3 style="margin-top:12px">Your garage is empty</h3><p class="muted">Browse the New or Used tabs to buy your first car.</p></section>';
  }
  const rate = p65Rate();
  const year = gameYear();

  return cars.map(function (car) {
    const value = Math.round(p65CarValueInternal(car) * rate);      /* UNIFIED VALUE */
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
        (missed > 0 ? '<div style="margin-top:5px;padding:5px;background:rgba(251,113,133,.15);border-radius:4px;font-size:.76rem;color:var(--rose)"><b>⚠️ ' + missed + ' missed payment(s)</b> — pay soon or bank will repossess.</div>' : '') +
        '<button class="btn" style="margin-top:6px;font-size:.78rem;padding:6px" onclick="p65PayCarLoanEarly(\'' + car.loanKey + '\')">Pay extra / pay off</button>' +
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
      '<button class="btn" style="text-align:center;margin:0;border-color:var(--rose);color:var(--rose)" onclick="p65SellCar(\'' + car.uid + '\')">💵 Sell car · ' + value.toLocaleString() + ' EGP</button>' +
      '</div></section>';
  }).join('');
};

/* =================================================================
   CAR LOAN DEFAULT → REPOSSESSION
   ================================================================= */
function p65ProcessCarLoans() {
  if (!S || !S.cars || !S.bank || !S.bank.installments) return;
  const rate = p65Rate();

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
        realismNotice('Missed car loan payment', 'Pay soon or the bank will act. Late fee applied.');
        loan.remaining *= 1.05;
      } else if (missed === 2 || missed === 3) {
        log('⚠️⚠️ ' + missed + ' missed payments. Formal bank warning.');
        realismNotice('Bank warning letter', 'You have missed ' + missed + ' payments. The bank will repossess if unpaid.');
        loan.remaining *= 1.05;
      } else if (missed >= 6) {
        log('🚨 BANK REPOSSESSED ' + car.year + ' ' + car.make + ' ' + car.name + ' after ' + missed + ' missed payments.');
        realismNotice('Car repossessed', 'The bank repossessed your ' + car.make + ' ' + car.name + '.');
        S.cars = (S.cars || []).filter(function (c) { return c.uid !== loan.linkedCarUid; });
        if (loan.remaining > 0) {
          if (!S.bank.loans) S.bank.loans = [];
          S.bank.loans.push({
            id: 'repo_' + Date.now(),
            principal: loan.remaining,
            remainingBal: loan.remaining,
            rate: 0.16,
            annualPmt: Math.round(loan.remaining / 3),
            yearsTotal: 3,
            yearsLeft: 3
          });
          log('💸 Remaining ' + Math.round(loan.remaining * rate).toLocaleString() + ' EGP moved to bank debt.');
        }
        delete S.bank.installments[key];
      }
    }
  });
}

/* Pay car loan early */
function p65PayCarLoanEarly(loanKey) {
  if (!S.bank || !S.bank.installments || !S.bank.installments[loanKey]) return hint('Loan not found.');
  const loan = S.bank.installments[loanKey];
  const rate = p65Rate();
  const remainingEGP = Math.round(loan.remaining * rate);
  const input = prompt('How much to pay? (Full remaining: ' + remainingEGP.toLocaleString() + ' EGP)', '');
  if (input == null) return;
  const egp = Number(input);
  if (!isFinite(egp) || egp <= 0) return hint('Enter a valid amount.');
  const internal = egp / rate;
  const pay = Math.min(internal, loan.remaining, S.wealth);
  if (pay <= 0) return hint('Not enough cash.');
  S.wealth -= pay;
  loan.remaining = Math.max(0, loan.remaining - pay);
  log('💸 Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP toward car loan. Remaining: ' + Math.round(loan.remaining * rate).toLocaleString() + ' EGP.');
  if (loan.remaining < 0.5) {
    log('✅ Car loan fully paid off!');
    delete S.bank.installments[loanKey];
    if (S.cars) S.cars.forEach(function (c) { if (c.loanKey === loanKey) { c.hasLoan = false; c.loanKey = null; } });
  }
  render();
}
window.p65PayCarLoanEarly = p65PayCarLoanEarly;

/* Hook into monthly tick */
const P65_monthlyTickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  P65_monthlyTickBefore.apply(this, arguments);
  try { p65ProcessCarLoans(); } catch (e) { console.error('p65 car loan tick failed:', e); }
};

/* =================================================================
   FUEL DISPLAY IN EGP
   ================================================================= */
const P65_headerBefore = p62BuildCarsHeader;
p62BuildCarsHeader = function () {
  let html = P65_headerBefore.apply(this, arguments);
  if (S && S.country === 'egy') {
    const petrol = Math.round(15.25 * p65Idx());
    html = html.replace(/Fuel \$[\d.]+(\/gal)?\s*·/, '⛽ Petrol ' + petrol + ' EGP/L ·');
  }
  return html;
};

/* =================================================================
   ONE-TIME REBUILD OF EXISTING SAVED CARS
   Repairs msrp + class for cars bought before the fix.
   ================================================================= */
function p65RebuildOldCars() {
  if (!S || !S.cars || !S.cars.length) return;
  let fixed = 0;
  S.cars.forEach(function (car) {
    if (!car) return;
    /* Find matching model row */
    const model = P62_MODELS.find(function (m) {
      return m[0] === (car.brand || '') && m[1] === car.name;
    });
    if (!model) return;
    /* Fix class if wrong */
    if (car.cls !== model[2]) car.cls = model[2];
    /* Rebuild msrp using current base price for that year */
    const year = car.year || gameYear();
    const modelYear = Math.max(year, model[8] || 2007);
    const correctMsrp = p65CarBaseInternal(model, modelYear);
    /* Only override if existing msrp looks wrong (< 30% or > 300% of expected) */
    const ratio = Number(car.msrp) / Math.max(1, correctMsrp);
    if (ratio < 0.3 || ratio > 3) {
      car.msrp = correctMsrp;
      fixed++;
    }
    /* Recompute value */
    car.value = p65CarValueInternal(car);
  });
  if (fixed > 0) {
    log('🔧 Rebuilt prices for ' + fixed + ' old car(s) in your garage.');
    save();
  }
}
p65RebuildOldCars();

/* =================================================================
   RENDER HOOK
   ================================================================= */
const P65_renderBefore = render;
render = function () {
  const r = P65_renderBefore.apply(this, arguments);
  if (S && S.p62 && S.p62.carCfg && S.p62.carCfg.modelId && document.getElementById('p62-cfg-modal')) {
    p65RenderConfigModal();
  }
  if (document.getElementById('p62-cfg-modal') && (!S || !S.p62 || !S.p62.carCfg || !S.p62.carCfg.modelId)) {
    document.getElementById('p62-cfg-modal').remove();
  }
  return r;
};

console.log('[p65 v3] Loaded — class index fixed, unified value, sell matches garage, loan default active');
