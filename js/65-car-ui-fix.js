/* =====================================================================
   65. CAR UI + PURCHASE LOGIC FIX
   - Config modal rebuilt with income-aware financial preview
   - Down payment, monthly, yearly, total cost all shown in EGP
   - Bank approval likelihood shown upfront
   - Garage card layout rewritten (no text overlap)
   - Removes stale broken modals automatically
   Load AFTER 64-final-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p65Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p65Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p65EGP(usd2026) { return Math.round(usd2026 * 52.7 * p65Idx()); }

/* ============ 1. INCOME HELPERS ============ */
function p65MonthlyIncome() {
  let total = 0;
  if (typeof p54LiveIncome === 'function') total = p54LiveIncome();
  else total = Number(S.income) || 0;
  return total / 12;
}
function p65MonthlyExpenses() {
  let total = 0;
  if (typeof p54LiveExpenses === 'function') total = p54LiveExpenses();
  else total = Number(S.expenses) || 0;
  return total / 12;
}
function p65CurrentNetMonthly() {
  return p65MonthlyIncome() - p65MonthlyExpenses();
}

/* ============ 2. LOAN CALCULATION ============ */
function p65LoanBreakdown(priceInternal, downPct, months) {
  const down = priceInternal * downPct;
  const financed = priceInternal - down;
  const ratePct = 0.16;
  const years = months / 12;
  const totalWithInterest = financed * (1 + ratePct * years);
  const monthlyPayment = totalWithInterest / months;
  const yearlyPayment = monthlyPayment * 12;
  return {
    down: down,
    downEGP: Math.round(down * p65Rate()),
    financed: financed,
    financedEGP: Math.round(financed * p65Rate()),
    totalWithInterest: totalWithInterest,
    totalEGP: Math.round(totalWithInterest * p65Rate()),
    monthlyPayment: monthlyPayment,
    monthlyEGP: Math.round(monthlyPayment * p65Rate()),
    yearlyPayment: yearlyPayment,
    yearlyEGP: Math.round(yearlyPayment * p65Rate()),
    interestEGP: Math.round((totalWithInterest - financed) * p65Rate()),
    months: months,
    years: years
  };
}

/* ============ 3. BANK APPROVAL PREDICTION ============ */
function p65PredictApproval(monthlyPaymentInternal) {
  const monthlyIncome = p65MonthlyIncome();
  const monthlyExpenses = p65MonthlyExpenses();
  const currentNet = monthlyIncome - monthlyExpenses;
  const projectedNet = currentNet - monthlyPaymentInternal;

  const creditScore = (S.bank && S.bank.score) || 680;
  const employed = !!(S.job || S.remote || S.remoteJob);
  const incomeRatio = monthlyPaymentInternal / Math.max(1, monthlyIncome);

  let score = 0;
  let reasons = [];

  /* Credit score */
  if (creditScore >= 740) { score += 3; reasons.push('Good credit score'); }
  else if (creditScore >= 680) { score += 2; reasons.push('Acceptable credit score'); }
  else if (creditScore >= 620) { score += 1; reasons.push('Borderline credit score'); }
  else { score -= 1; reasons.push('Low credit score'); }

  /* Employment */
  if (employed) { score += 2; reasons.push('Stable employment'); }
  else { score -= 2; reasons.push('No stable income'); }

  /* Income ratio */
  if (incomeRatio <= 0.15) { score += 3; reasons.push('Monthly payment is small relative to income'); }
  else if (incomeRatio <= 0.25) { score += 1; reasons.push('Payment fits income'); }
  else if (incomeRatio <= 0.35) { score -= 1; reasons.push('Payment is high relative to income'); }
  else { score -= 4; reasons.push('Payment exceeds 35% of income'); }

  /* Projected net */
  if (projectedNet < 0) { score -= 3; reasons.push('Your monthly cashflow would go negative'); }

  /* Assessment */
  let verdict, color;
  if (score >= 5) { verdict = 'Likely approved'; color = 'var(--mint)'; }
  else if (score >= 2) { verdict = 'Possibly approved'; color = 'var(--amber)'; }
  else if (score >= 0) { verdict = 'Risky — may be declined'; color = 'var(--amber)'; }
  else { verdict = 'Will likely be declined'; color = 'var(--rose)'; }

  return {
    verdict: verdict,
    color: color,
    score: score,
    reasons: reasons,
    projectedNet: projectedNet,
    projectedNetEGP: Math.round(projectedNet * p65Rate()),
    incomeRatio: incomeRatio
  };
}

/* ============ 4. PURCHASE HANDLER ============ */
function p65PurchaseCar(method) {
  p62Init();
  if (!p62HasLicense()) return hint('You need a valid driving licence first.');
  const price = p62CfgPrice();
  if (!price.model) return hint('No car configured. Please pick a model first.');
  const rate = p65Rate();

  /* Cash purchase */
  if (method === 'cash') {
    if (S.wealth < price.total) {
      const haveEGP = Math.round(S.wealth * rate);
      const needEGP = Math.round(price.total * rate);
      return hint('❌ Not enough cash. You need ' + needEGP.toLocaleString() + ' EGP. You have ' + haveEGP.toLocaleString() + ' EGP.');
    }
    S.wealth -= price.total;
  } else {
    /* Loan purchase */
    const isSevenYear = method === 'loan7';
    const downPct = isSevenYear ? 0.10 : 0.15;
    const months = isSevenYear ? 84 : 60;
    const loan = p65LoanBreakdown(price.car, downPct, months);

    if (S.wealth < loan.down) {
      const haveEGP = Math.round(S.wealth * rate);
      return hint('❌ Not enough cash for down payment. Need ' + loan.downEGP.toLocaleString() + ' EGP. You have ' + haveEGP.toLocaleString() + ' EGP.');
    }

    /* Bank approval roll */
    const prediction = p65PredictApproval(loan.monthlyPayment);
    const approvalChance = Math.max(0.05, Math.min(0.95, 0.5 + prediction.score * 0.08));
    if (Math.random() > approvalChance) {
      return hint('❌ Bank DECLINED your financing.\n\n' +
        'Reason: ' + prediction.reasons.join(', ') + '\n\n' +
        'Improve your credit score or income and try again. Cash purchase is still available.');
    }

    S.wealth -= loan.down;
    if (!S.bank) S.bank = { installments: {}, cardDebt: {}, activeCards: [], primaryCard: null, score: 680, savingsBal: 0, loans: [], missedPmts: 0 };
    if (!S.bank.installments) S.bank.installments = {};
    const key = 'car_loan_' + Date.now();
    S.bank.installments[key] = {
      name: 'Car loan — ' + price.model[1] + ' (' + months + ' mo)',
      totalBalance: loan.totalWithInterest,
      remaining: loan.totalWithInterest,
      monthlyPayment: loan.monthlyPayment,
      monthsTotal: months,
      monthsLeft: months,
      fee: loan.totalWithInterest - loan.financed,
      startedYear: gameYear()
    };
    log('🏦 Bank APPROVED car loan. Down payment: ' + loan.downEGP.toLocaleString() + ' EGP. Monthly: ' + loan.monthlyEGP.toLocaleString() + ' EGP for ' + months + ' months.');
  }

  /* Register the car */
  const cfg = S.p62.carCfg;
  const model = price.model;
  const newCar = {
    uid: 'c' + Math.random().toString(36).slice(2, 8),
    make: P62_BRANDS[model[0]] ? P62_BRANDS[model[0]].name : model[0],
    name: model[1],
    cls: model[3],
    year: gameYear(),
    trim: cfg.trim,
    color: cfg.color,
    interior: cfg.interior,
    opts: (cfg.opts || []).slice(),
    msrp: price.car,
    paid: method === 'cash' ? price.total : (price.car * (method === 'loan7' ? 0.10 : 0.15) + price.registration + price.insurance),
    insurance: cfg.insurance,
    insuranceExpiry: gameYear() + 1,
    registrationExpiry: gameYear() + 1,
    miles: 0,
    cond: 100,
    age: 0,
    acc: false,
    broken: false,
    fix: 0,
    mods: [],
    modCost: 0,
    seller: 'dealer',
    brand: model[0],
    fuel: model[11] ? 'e' : (model[10] && gameYear() >= model[10] ? 'h' : 'g'),
    life: model[7],
    value: price.car
  };
  S.cars = S.cars || [];
  S.cars.push(newCar);
  S.cars = S.cars.slice(-4);

  fx({ happiness: 8, social: 6 });
  const methodLabel = method === 'cash' ? 'cash' : (method === 'loan7' ? '7-year loan' : '5-year loan');
  log('🚗 Purchased a new ' + newCar.year + ' ' + newCar.make + ' ' + newCar.name + ' (' + methodLabel + ').');
  realismNotice('Car purchased', newCar.year + ' ' + newCar.make + ' ' + newCar.name + ' via ' + methodLabel + '.');

  /* Close modal and cleanup */
  const modal = document.getElementById('p62-cfg-modal');
  if (modal) modal.remove();
  p62ResetCfg(null, null);
  S.p62.subTab = 'garage';
  render();
}
window.p65PurchaseCar = p65PurchaseCar;

/* ============ 5. REBUILD CONFIG MODAL WITH FINANCIAL PREVIEW ============ */
function p65RenderConfigModal() {
  p62Init();
  const cfg = S.p62.carCfg;
  if (!cfg || !cfg.modelId) {
    /* No model configured — clean up any stale modal */
    const stale = document.getElementById('p62-cfg-modal');
    if (stale) stale.remove();
    return;
  }
  const model = p62ModelById(cfg.modelId);
  if (!model) {
    const stale = document.getElementById('p62-cfg-modal');
    if (stale) stale.remove();
    return;
  }
  const brand = P62_BRANDS[model[0]];
  const price = p62CfgPrice();
  const rate = p65Rate();
  const year = gameYear();

  /* Trim buttons */
  const trimBtns = P62_TRIMS.map(function (t, i) {
    return '<button class="btn ' + (cfg.trim === i ? 'sel' : '') + '" style="margin:0;padding:8px;font-size:.72rem;text-align:center" onclick="p62CfgSet(\'trim\',' + i + ')">' +
      '<b>' + t.label + '</b>' +
      '<small style="display:block;font-size:.68rem;opacity:.7;margin-top:2px">' + t.desc + '</small></button>';
  }).join('');

  /* Colors */
  const colorHex = ['#ffffff', '#16161a', '#b9bcc4', '#6b6f7a', '#c8202f', '#2457c5', '#2f7d4f', '#e8731a', '#fbfaf3', '#2a2a2e'];
  const colorBtns = P62_COLORS.map(function (c, i) {
    return '<button title="' + c[0] + '" onclick="p62CfgSet(\'color\',' + i + ')" style="width:32px;height:32px;border-radius:50%;background:' + colorHex[i] + ';border:3px solid ' + (cfg.color === i ? 'var(--violet)' : 'var(--line)') + ';cursor:pointer"></button>';
  }).join('');

  /* Interiors */
  const intBtns = P62_INTERIORS.map(function (int, idx) {
    return '<button class="btn ' + (cfg.interior === idx ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.72rem" onclick="p62CfgSet(\'interior\',' + idx + ')">' +
      int.label + (int.usd ? ' · +' + Math.round(int.usd * 52.7 * p65Idx()).toLocaleString() + ' EGP' : '') + '</button>';
  }).join('');

  /* Options */
  const optsHtml = P62_OPTIONS.filter(function (o) {
    if (o.from && year < o.from) return false;
    if (o.until && year > o.until) return false;
    return true;
  }).map(function (o) {
    const on = (cfg.opts || []).indexOf(o.id) >= 0;
    return '<label class="muted" style="display:flex;align-items:center;gap:8px;padding:8px;border:1px solid var(--line);border-radius:6px;font-size:.82rem;cursor:pointer;margin-top:4px">' +
      '<input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="p62CfgSet(\'opt\',\'' + o.id + '\')">' +
      '<span style="flex:1">' + o.label + '</span>' +
      '<b class="mono" style="font-size:.8rem">+' + Math.round(o.usd * 52.7 * p65Idx()).toLocaleString() + '</b>' +
      '</label>';
  }).join('');

  /* Insurance */
  const insBtns = Object.keys(P62_INSURANCE).map(function (k) {
    const ins = P62_INSURANCE[k];
    return '<button class="btn ' + (cfg.insurance === k ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.7rem" onclick="p62CfgSet(\'insurance\',\'' + k + '\')">' + ins.label + '</button>';
  }).join('');

  /* Financial breakdown */
  const carEGP = Math.round(price.car * rate);
  const regEGP = Math.round(price.registration * rate);
  const insEGP = Math.round(price.insurance * rate);
  const totalEGP = Math.round(price.total * rate);

  const loan5 = p65LoanBreakdown(price.car, 0.15, 60);
  const loan7 = p65LoanBreakdown(price.car, 0.10, 84);
  const cashOK = S.wealth >= price.total;
  const down5OK = S.wealth >= loan5.down;
  const down7OK = S.wealth >= loan7.down;
  const pred5 = p65PredictApproval(loan5.monthlyPayment);
  const pred7 = p65PredictApproval(loan7.monthlyPayment);

  const monthlyIncomeEGP = Math.round(p65MonthlyIncome() * rate);
  const currentNetEGP = Math.round(p65CurrentNetMonthly() * rate);
  const haveCashEGP = Math.round(S.wealth * rate);

  const html = '<div class="p24-modal" style="max-width:540px;max-height:92vh;overflow-y:auto;padding:16px">' +

    /* Header */
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="display:flex;align-items:center;gap:10px">' + p62BrandBadge(model[0], 40) +
    '<div><div class="p24-pill">' + year + ' Model</div>' +
    '<h2 style="margin-top:6px;font-size:1.15rem">' + brand.name + ' ' + model[1] + '</h2>' +
    '<div class="muted" style="font-size:.78rem">' + (P62_CLS[model[3]] || {}).label + '</div></div></div>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p62-cfg-modal\').remove()">✕</button></div>' +

    /* Your finances at a glance */
    '<div style="margin-top:14px;padding:10px;background:rgba(34,211,238,.06);border-radius:8px;border-left:3px solid var(--cyan)">' +
    '<b style="font-size:.78rem;color:var(--cyan)">YOUR FINANCES</b>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.82rem"><span>Monthly income</span><b class="mono">' + monthlyIncomeEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.82rem"><span>Current monthly net</span><b class="mono" style="color:' + (currentNetEGP >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (currentNetEGP >= 0 ? '+' : '') + currentNetEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.82rem"><span>Cash available</span><b class="mono">' + haveCashEGP.toLocaleString() + ' EGP</b></div>' +
    '</div>' +

    /* Trim */
    '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Trim</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">' + trimBtns + '</div>' +

    /* Colors */
    '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Paint colour</h4>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">' + colorBtns + '</div>' +

    /* Interior */
    '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Interior</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">' + intBtns + '</div>' +

    /* Options */
    '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Options</h4>' + optsHtml +

    /* Insurance */
    '<h4 style="margin-top:14px;font-size:.85rem;color:var(--cyan)">Insurance</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">' + insBtns + '</div>' +

    /* Price breakdown */
    '<div style="margin-top:16px;padding:12px;background:rgba(255,255,255,.04);border-radius:10px">' +
    '<b style="font-size:.85rem;color:var(--cyan)">💰 PRICE BREAKDOWN</b>' +
    '<div class="row" style="padding:4px 0"><span>Car</span><b class="mono">' + carEGP.toLocaleString() + ' EGP</b></div>' +
    (price.options > 0 ? '<div class="row" style="padding:4px 0"><span>Options</span><b class="mono">+' + Math.round(price.options * rate).toLocaleString() + ' EGP</b></div>' : '') +
    '<div class="row" style="padding:4px 0"><span>Registration & tax (6%)</span><b class="mono">+' + regEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="padding:4px 0"><span>Insurance (year 1)</span><b class="mono">+' + insEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>On the road</b></span><b class="mono" style="color:var(--mint);font-size:1rem">' + totalEGP.toLocaleString() + ' EGP</b></div>' +
    '</div>' +

    /* Payment options */
    '<h4 style="margin-top:16px;font-size:.85rem;color:var(--cyan)">Choose payment method</h4>' +

    /* Cash */
    '<div style="margin-top:8px;padding:12px;border:1px solid ' + (cashOK ? 'var(--mint)' : 'var(--line)') + ';border-radius:10px;background:' + (cashOK ? 'rgba(52,211,153,.06)' : 'transparent') + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
    '<div><b>💵 Pay cash</b><div class="muted" style="font-size:.78rem;margin-top:3px">No loan, no interest</div></div>' +
    '<div class="mono" style="font-size:.95rem;font-weight:700">' + totalEGP.toLocaleString() + ' EGP</div>' +
    '</div>' +
    (cashOK ? '<button class="btn" style="margin-top:8px;text-align:center;background:var(--mint);color:#000;font-weight:700" onclick="p65PurchaseCar(\'cash\')">Buy with cash</button>'
            : '<p class="muted" style="font-size:.78rem;margin-top:8px">❌ You need ' + (totalEGP - haveCashEGP).toLocaleString() + ' EGP more</p>') +
    '</div>' +

    /* Loan 5 years */
    '<div style="margin-top:10px;padding:12px;border:1px solid ' + (down5OK ? 'var(--cyan)' : 'var(--line)') + ';border-radius:10px;background:' + (down5OK ? 'rgba(34,211,238,.06)' : 'transparent') + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="flex:1"><b>🏦 Bank loan — 5 years</b>' +
    '<div class="muted" style="font-size:.76rem;margin-top:3px">15% down · 16% flat interest</div></div>' +
    '<div style="text-align:right"><div class="mono" style="font-size:.9rem;font-weight:700">' + loan5.monthlyEGP.toLocaleString() + '</div><div class="muted" style="font-size:.68rem">EGP/month</div></div>' +
    '</div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem;margin-top:6px"><span>Down payment (15%)</span><b class="mono">' + loan5.downEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Yearly payment</span><b class="mono">' + loan5.yearlyEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Total cost (with interest)</span><b class="mono">' + loan5.totalEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Interest paid over 5 yrs</span><b class="mono" style="color:var(--rose)">' + loan5.interestEGP.toLocaleString() + ' EGP</b></div>' +
    '<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;font-size:.78rem">' +
    '<b style="color:' + pred5.color + '">' + pred5.verdict + '</b>' +
    '<div class="muted" style="font-size:.72rem;margin-top:3px">Projected monthly net after purchase: <b style="color:' + (pred5.projectedNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (pred5.projectedNetEGP >= 0 ? '+' : '') + pred5.projectedNetEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="muted" style="font-size:.7rem;margin-top:3px">' + pred5.reasons.slice(0, 3).join(' · ') + '</div>' +
    '</div>' +
    (down5OK ? '<button class="btn" style="margin-top:8px;text-align:center" onclick="p65PurchaseCar(\'loan5\')">Apply for 5-year loan</button>'
            : '<p class="muted" style="font-size:.78rem;margin-top:8px">❌ You need ' + (loan5.downEGP - haveCashEGP).toLocaleString() + ' EGP more for the down payment</p>') +
    '</div>' +

    /* Loan 7 years */
    '<div style="margin-top:10px;padding:12px;border:1px solid ' + (down7OK ? 'var(--cyan)' : 'var(--line)') + ';border-radius:10px;background:' + (down7OK ? 'rgba(34,211,238,.06)' : 'transparent') + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="flex:1"><b>🏦 Bank loan — 7 years</b>' +
    '<div class="muted" style="font-size:.76rem;margin-top:3px">10% down · lower monthly, more interest</div></div>' +
    '<div style="text-align:right"><div class="mono" style="font-size:.9rem;font-weight:700">' + loan7.monthlyEGP.toLocaleString() + '</div><div class="muted" style="font-size:.68rem">EGP/month</div></div>' +
    '</div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem;margin-top:6px"><span>Down payment (10%)</span><b class="mono">' + loan7.downEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Yearly payment</span><b class="mono">' + loan7.yearlyEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Total cost (with interest)</span><b class="mono">' + loan7.totalEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Interest paid over 7 yrs</span><b class="mono" style="color:var(--rose)">' + loan7.interestEGP.toLocaleString() + ' EGP</b></div>' +
    '<div style="margin-top:8px;padding:6px 8px;background:rgba(255,255,255,.03);border-radius:6px;font-size:.78rem">' +
    '<b style="color:' + pred7.color + '">' + pred7.verdict + '</b>' +
    '<div class="muted" style="font-size:.72rem;margin-top:3px">Projected monthly net after purchase: <b style="color:' + (pred7.projectedNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (pred7.projectedNetEGP >= 0 ? '+' : '') + pred7.projectedNetEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="muted" style="font-size:.7rem;margin-top:3px">' + pred7.reasons.slice(0, 3).join(' · ') + '</div>' +
    '</div>' +
    (down7OK ? '<button class="btn" style="margin-top:8px;text-align:center" onclick="p65PurchaseCar(\'loan7\')">Apply for 7-year loan</button>'
            : '<p class="muted" style="font-size:.78rem;margin-top:8px">❌ You need ' + (loan7.downEGP - haveCashEGP).toLocaleString() + ' EGP more for the down payment</p>') +
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

/* Override both entry points to use our modal */
p62OpenConfig = function (brandKey, modelId) {
  p62ResetCfg(brandKey, modelId);
  if (!p62ModelById(modelId)) return hint('Model not found.');
  p65RenderConfigModal();
};
p62RenderConfigModal = p65RenderConfigModal;

/* ============ 6. GARAGE CARD — clean layout, no overlap ============ */
p62BuildGarageTab = function () {
  const cars = S.cars || [];
  if (!cars.length) {
    return '<section class="card" style="text-align:center;padding:32px 16px">' +
      '<div style="font-size:3rem;opacity:.4">🅿️</div>' +
      '<h3 style="margin-top:12px">Your garage is empty</h3>' +
      '<p class="muted">Browse the New or Used tabs to buy your first car.</p></section>';
  }
  const rate = p65Rate();
  const year = gameYear();

  return cars.map(function (car) {
    const value = Math.round((Number(car.value) || Number(car.msrp) * 0.5) * rate);
    const cond = Math.round(car.cond || 100);
    const condColor = cond < 40 ? 'var(--rose)' : cond < 65 ? 'var(--amber)' : 'var(--mint)';
    const fuel = car.fuel === 'e' ? '⚡' : car.fuel === 'h' ? '🔋' : '⛽';
    const insLabel = (P62_INSURANCE[car.insurance] || P62_INSURANCE.compreh).label;

    return '<section class="card" style="padding:14px;border-left:3px solid ' + condColor + '">' +
      /* Brand + name — stacked vertically to prevent overlap */
      '<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px">' +
      '<div style="flex-shrink:0">' + p62BrandBadge(car.brand || 'toyota', 40) + '</div>' +
      '<div style="min-width:0;flex:1">' +
      '<div style="font-weight:700;font-size:.95rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + car.year + ' ' + car.make + ' ' + car.name + '</div>' +
      '<div class="muted" style="font-size:.75rem;margin-top:2px">' + (P62_TRIMS[car.trim || 0] || P62_TRIMS[0]).label + ' · ' + fuel + ' ' + (car.miles || 0).toLocaleString() + ' km</div>' +
      '</div>' +
      '</div>' +

      /* Value row */
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">' +
      '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
      '<div class="muted" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">Value</div>' +
      '<div class="mono" style="font-size:.9rem;font-weight:700;margin-top:3px">' + value.toLocaleString() + ' EGP</div>' +
      '</div>' +
      '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
      '<div class="muted" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">Condition</div>' +
      '<div class="mono" style="font-size:.9rem;font-weight:700;margin-top:3px;color:' + condColor + '">' + cond + '%</div>' +
      '</div>' +
      '</div>' +

      /* Condition bar */
      '<div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:10px">' +
      '<div style="height:100%;width:' + cond + '%;background:' + condColor + '"></div></div>' +

      /* Broken warning */
      (car.broken ? '<div style="padding:10px;background:rgba(251,113,133,.1);border-left:3px solid var(--rose);border-radius:6px;margin-bottom:10px">' +
      '<b style="font-size:.82rem;color:var(--rose)">🔧 Broken down</b>' +
      '<div class="muted" style="font-size:.78rem;margin-top:3px">Repair: ' + Math.round((car.fix || 0) * rate).toLocaleString() + ' EGP</div></div>' : '') +

      /* Info rows */
      '<div class="row" style="padding:5px 0;font-size:.82rem"><span>Insurance</span><b>' + insLabel + '</b></div>' +
      '<div class="row" style="padding:5px 0;font-size:.82rem"><span>Insurance until</span><b>' + (car.insuranceExpiry || year) + '</b></div>' +
      '<div class="row" style="padding:5px 0;font-size:.82rem"><span>Registration until</span><b>' + (car.registrationExpiry || year) + '</b></div>' +

      /* Actions */
      '<div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">' +
      (car.broken ? '<button class="btn" style="text-align:center;margin:0" onclick="p62RepairCar(\'' + car.uid + '\')">🔧 Repair · ' + Math.round((car.fix || 0) * rate).toLocaleString() + ' EGP</button>' : '') +
      '<button class="btn" style="text-align:center;margin:0" onclick="p62RenewInsurance(\'' + car.uid + '\')">🛡 Renew insurance</button>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
      '<button class="btn" style="margin:0;text-align:center;font-size:.78rem;padding:8px" onclick="p62ChangeInsurance(\'' + car.uid + '\',\'tp\')">Third-party</button>' +
      '<button class="btn" style="margin:0;text-align:center;font-size:.78rem;padding:8px" onclick="p62ChangeInsurance(\'' + car.uid + '\',\'compreh\')">Comprehensive</button>' +
      '</div>' +
      '</div>' +
      '</section>';
  }).join('');
};

/* ============ 7. CLEANUP STALE MODALS ON LOAD ============ */
setTimeout(function () {
  /* If the config modal exists without a valid modelId, remove it */
  const modal = document.getElementById('p62-cfg-modal');
  if (modal && (!S || !S.p62 || !S.p62.carCfg || !S.p62.carCfg.modelId)) {
    modal.remove();
  }
}, 500);

/* Watch after render — also clean stale modals */
const P65_renderBefore = render;
render = function () {
  const r = P65_renderBefore.apply(this, arguments);
  /* Refresh config modal if open and model is set */
  if (S && S.p62 && S.p62.carCfg && S.p62.carCfg.modelId && document.getElementById('p62-cfg-modal')) {
    p65RenderConfigModal();
  }
  /* Clean stale modal */
  if (document.getElementById('p62-cfg-modal') && (!S || !S.p62 || !S.p62.carCfg || !S.p62.carCfg.modelId)) {
    document.getElementById('p62-cfg-modal').remove();
  }
  return r;
};

/* ============ 8. FUEL IN EGP (per litre) ============ */
const P65_headerBefore = p62BuildCarsHeader;
p62BuildCarsHeader = function () {
  let html = P65_headerBefore.apply(this, arguments);
  if (S && S.country === 'egy') {
    const petrol = Math.round(15.25 * p65Idx());
    html = html.replace(/Fuel \$[\d.]+(\/gal)?\s*·/, '⛽ Petrol ' + petrol + ' EGP/L ·');
  }
  return html;
};

/* ============ INIT ============ */
console.log('[p65] Car UI fix loaded.');
