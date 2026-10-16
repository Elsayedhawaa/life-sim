/* =====================================================================
   63. CAR BUG FIXES v2 — Real Fixes
   - Model filter index fix (was reading the wrong columns → 0 models)
   - Licence cost now correct (2,800 EGP not 147,560)
   - TDZ bug in parent car offer fixed
   - Property purchase HARD GATE: developer/bank refuses if unaffordable
   - Clear monthly cashflow breakdown per property
   - Mortgage annual payment recalculates after early payment
   - Fuel shown in EGP for Egypt
   - Stale bills cleaned after selling property
   Load AFTER 62-cars-overhaul.js and BEFORE 99-boot.js
   ===================================================================== */

function p63Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p63Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* =================================================================
   FIX 1 — MODEL FILTER INDEX (the real cause of 0 cars)
   The P62_MODELS row is:
     [0]make [1]model [2]class [3]price [4]mpg [5]hap [6]soc [7]life
     [8]fromYear [9]toYear [10]hybridFrom [11]isElectric
   Every place that reads m[9]/m[10] as years is WRONG.
   ================================================================= */
function p63IsModelValid(model, year) {
  if (!model || !Array.isArray(model)) return false;
  const fromYear = Number(model[8]) || 0;
  const toYear = Number(model[9]) || 9999;
  return year >= fromYear && year <= toYear;
}
function p63ModelsForBrand(brand, year) {
  year = year || gameYear();
  return P62_MODELS.filter(function (m) {
    return m && m[0] === brand && p63IsModelValid(m, year);
  });
}

/* =================================================================
   FIX 2 — Licence cost (p62EGP semantics)
   ================================================================= */
function p62EGP(egp2026) { return Math.round((Number(egp2026) || 0) * p63Idx()); }

/* =================================================================
   FIX 3 — Parent car offer (TDZ rename)
   ================================================================= */
function p62ParentCarOffer() {
  if (!S || S.age < 18) return;
  p62Init();
  if (S.p62.lastOfferYear === gameYear()) return;
  const _plist = (typeof parents === 'function') ? parents() : [];
  const _aliveParents = _plist.filter(function (p) { return p && p.alive !== false; });
  if (!_aliveParents.length) return;
  const fw = Number(S.famWealth) || 0;
  if (fw === 0) return;
  if (S.cars && S.cars.length > 0) return;
  if (Math.random() > (fw === 2 ? 0.35 : 0.15)) return;
  S.p62.lastOfferYear = gameYear();
  S.p62.pendingOffers.push({ year: gameYear(), type: 'parent_gift_car', wealthTier: fw });
}

function p62AcceptParentCar() {
  p62Init();
  if (!S.p62.pendingOffers.length) return;
  const off = S.p62.pendingOffers.shift();
  const fw = off.wealthTier;
  const rate = p63Rate();
  const year = gameYear();

  const pool = P62_MODELS.filter(function (m) {
    if (!p63IsModelValid(m, year)) return false;
    const cls = m[3];
    if (fw === 2) return ['compact', 'mid', 'suv'].indexOf(cls) >= 0 && m[3] !== 'truck';
    return ['econ', 'compact'].indexOf(cls) >= 0;
  });
  if (!pool.length) return hint('No suitable car available.');

  const model = pool[Math.floor(Math.random() * pool.length)];
  const brand = P62_BRANDS[model[0]];
  const base = p62BasePriceUSD(model, year);
  const age = fw === 2 ? 0 : 3 + Math.floor(Math.random() * 4);
  const value = Math.round(base * p62Depreciation(age));
  const car = {
    uid: 'cg' + Math.random().toString(36).slice(2, 8),
    make: brand.name, name: model[1], cls: model[3], year: year - age,
    trim: 0, color: 0, interior: 0, opts: [],
    msrp: base, paid: 0, insurance: 'tp',
    insuranceExpiry: year + 1, registrationExpiry: year + 1,
    miles: age * 12000, cond: fw === 2 ? 98 : 70, age: age,
    acc: false, broken: false, fix: 0, mods: [], modCost: 0,
    seller: 'parents', brand: model[0],
    fuel: model[11] ? 'e' : (model[10] && year >= model[10] ? 'h' : 'g'),
    life: model[7], value: value
  };
  S.cars = S.cars || [];
  S.cars.push(car);
  S.cars = S.cars.slice(-4);
  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 8);
  });
  fx({ happiness: 6 });
  log('🎁 Your parents gave you a ' + car.year + ' ' + car.make + ' ' + car.name + '.');
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  render();
}

function p62DeclineParentCar() {
  p62Init();
  if (!S.p62.pendingOffers.length) return;
  S.p62.pendingOffers.shift();
  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 3);
  });
  log('You politely declined your parents\' car offer.');
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  render();
}

/* =================================================================
   FIX 4 — Override p62ModelsForBrand + p62BuildNewTab
   ================================================================= */
p62ModelsForBrand = function (brand, year) {
  return p63ModelsForBrand(brand, year || gameYear());
};

const P63_p62BuildNewTabBefore = p62BuildNewTab;
p62BuildNewTab = function () {
  if (!S.cars) S.cars = [];
  if (S.cars.length >= 4) {
    return '<section class="card" style="text-align:center;padding:32px 16px"><div style="font-size:3rem;opacity:.4">🅿️</div><h3 style="margin-top:12px">Garage full</h3><p class="muted">You can own up to 4 cars. Sell one first.</p></section>';
  }
  if (typeof P62_BRANDS === 'undefined' || typeof P62_MODELS === 'undefined') {
    return '<section class="card"><h3>⚠️ Car data missing</h3></section>';
  }
  const year = gameYear();
  const availableBrands = [];
  Object.keys(P62_BRANDS).forEach(function (key) {
    const models = p63ModelsForBrand(key, year);
    if (models.length) availableBrands.push({ key: key, brand: P62_BRANDS[key], models: models });
  });
  if (!availableBrands.length) {
    return '<section class="card"><h3>⚠️ No models available in ' + year + '</h3>' +
      '<p class="muted">P62_MODELS has ' + P62_MODELS.length + ' rows but none match this year.</p>' +
      '<button class="btn" onclick="p62DebugCars()">Show debug info</button></section>';
  }
  const brandCards = availableBrands.map(function (b) {
    const cheapest = b.models.reduce(function (min, m) {
      const p = p62BasePriceUSD(m, year);
      return p < min ? p : min;
    }, Infinity);
    const cheapestEGP = Math.round(cheapest * 52.7 * p63Idx());
    return '<button class="btn" style="margin:0;padding:12px;text-align:left;display:flex;align-items:center;gap:10px" onclick="p62OpenBrand(\'' + b.key + '\')">' +
      p62BrandBadge(b.key, 36) +
      '<div style="flex:1;min-width:0"><div style="font-weight:700">' + b.brand.name + '</div>' +
      '<div class="muted" style="font-size:.72rem">' + b.models.length + ' models · from ' + cheapestEGP.toLocaleString() + ' EGP</div></div>' +
      '</button>';
  }).join('');
  return '<section class="card"><h3>🆕 New cars — browse brands (' + availableBrands.length + ')</h3>' +
    '<p class="muted" style="font-size:.82rem">Egyptian market ' + year + '.</p>' +
    '<div style="display:grid;grid-template-columns:1fr;gap:6px;margin-top:10px">' + brandCards + '</div></section>';
};

/* Also fix p62OpenBrand to use the correct filter */
p62OpenBrand = function (brandKey) {
  const brand = P62_BRANDS[brandKey];
  if (!brand) return;
  const year = gameYear();
  const models = p63ModelsForBrand(brandKey, year);
  if (!models.length) return hint('No models available for this brand in ' + year + '.');
  const list = models.map(function (m) {
    const baseUSD = p62BasePriceUSD(m, year);
    const baseEGP = Math.round(baseUSD * 52.7 * p63Idx());
    const cls = P62_CLS[m[3]] || P62_CLS.compact;
    const fuel = m[11] ? '⚡ Electric' : (m[10] && year >= m[10] ? '🔋 Hybrid' : '⛽ Gasoline');
    return '<button class="btn" style="text-align:left;padding:12px;margin:0" onclick="p62OpenConfig(\'' + brandKey + '\',\'' + m[0] + '_' + m[1] + '\')">' +
      '<div style="display:flex;justify-content:space-between;gap:8px">' +
      '<div style="min-width:0;flex:1"><b>' + m[1] + '</b>' +
      '<div class="muted" style="font-size:.75rem;margin-top:2px">' + cls.label + ' · ' + fuel + '</div></div>' +
      '<div style="text-align:right;flex-shrink:0">' +
      '<div class="mono" style="font-size:.85rem;font-weight:700">' + baseEGP.toLocaleString() + '</div>' +
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

window.p62DebugCars = function () {
  const y = gameYear();
  console.log('=== p62 debug ===');
  console.log('gameYear:', y);
  console.log('Total models:', P62_MODELS.length);
  const sample = P62_MODELS[0];
  console.log('Sample row [0]:', sample);
  console.log('  m[8]=fromYear:', sample[8], ' m[9]=toYear:', sample[9], ' m[10]=hybridFrom:', sample[10], ' m[11]=electric:', sample[11]);
  const valid = P62_MODELS.filter(function (m) { return p63IsModelValid(m, y); });
  console.log('Models valid for ' + y + ':', valid.length);
  const byBrand = {};
  valid.forEach(function (m) { byBrand[m[0]] = (byBrand[m[0]] || 0) + 1; });
  console.log('By brand:', byBrand);
};

/* =================================================================
   FIX 5 — PROPERTY PURCHASE HARD GATE
   Developer/bank REFUSES if you can't afford it.
   Two rules:
     - Cash: you must have the full price
     - Mortgage: annual payment must be ≤ 35% of annual income
   Overrides p12BuyListing from 63 v1.
   ================================================================= */
function p63AnnualIncome() {
  if (typeof p54LiveIncome === 'function') return p54LiveIncome();
  return Number(S.income) || 0;
}
function p63AnnualExpenses() {
  if (typeof p54LiveExpenses === 'function') return p54LiveExpenses();
  return Number(S.expenses) || 0;
}

const P63_p12BuyBefore = (typeof p12BuyListing === 'function') ? p12BuyListing : null;
if (P63_p12BuyBefore) {
  p12BuyListing = function (id, financing) {
    const market = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket() : [];
    const listing = market.find(function (x) { return x && x.id === id; });
    if (!listing) return P63_p12BuyBefore.apply(this, arguments);

    const rate = p63Rate();
    const priceInternal = Number(listing.priceInternal) || 0;
    const priceEGP = Math.round(priceInternal * rate);
    const downInternal = financing === 'mortgage' ? priceInternal * 0.20 : priceInternal;
    const downEGP = Math.round(downInternal * rate);

    /* Estimated monthly cashflow */
    const mortRate = S.mortRate || 0.19;
    const annualMortgage = financing === 'mortgage'
      ? (priceInternal - downInternal) * (mortRate / (1 - Math.pow(1 + mortRate, -20)))
      : 0;
    const annualMaint = priceInternal * 0.01;
    const annualUtil = priceInternal * 0.008;
    const annualTax = priceInternal * 0.01;
    const annualCost = annualMortgage + annualMaint + annualUtil + annualTax;
    const annualRent = priceInternal * 0.0035 * 12 * 0.9;
    const netAnnual = annualRent - annualCost;
    const netMonthlyEGP = Math.round((netAnnual / 12) * rate);
    const costMonthlyEGP = Math.round((annualMortgage / 12) * rate);

    /* Income check */
    const annualInc = p63AnnualIncome();
    const annualExp = p63AnnualExpenses();
    const monthlyInc = annualInc / 12;
    const monthlyExp = annualExp / 12;
    const monthlyMortgageInternal = annualMortgage / 12;

    /* Current cash in EGP */
    const cashEGP = Math.round(S.wealth * rate);

    /* ---- HARD GATE ---- */
    /* Rule 1: cash purchase needs full cash */
    if (financing !== 'mortgage' && S.wealth < priceInternal) {
      return hint('❌ REFUSED: You need ' + priceEGP.toLocaleString() + ' EGP in cash. You have ' + cashEGP.toLocaleString() + ' EGP.');
    }
    /* Rule 2: mortgage down payment must exist */
    if (financing === 'mortgage' && S.wealth < downInternal) {
      return hint('❌ REFUSED: Down payment is ' + downEGP.toLocaleString() + ' EGP. You have ' + cashEGP.toLocaleString() + ' EGP.');
    }
    /* Rule 3: mortgage payment ≤ 35% of monthly income (real bank rule) */
    if (financing === 'mortgage') {
      const ratio = monthlyMortgageInternal / Math.max(1, monthlyInc);
      if (ratio > 0.35) {
        return hint('❌ REFUSED by the bank: Your monthly income is ' +
          Math.round(monthlyInc * rate).toLocaleString() + ' EGP. The monthly mortgage payment would be ' +
          Math.round(monthlyMortgageInternal * rate).toLocaleString() + ' EGP (' +
          Math.round(ratio * 100) + '% of income). Egyptian banks require this to stay below 35%.');
      }
    }

    /* ---- WARNING ---- */
    const projectedMonthlyNet = (monthlyInc - monthlyExp) + (netAnnual / 12);

    let warning = '📋 AFFORDABILITY CHECK\n\n' +
      'Price: ' + priceEGP.toLocaleString() + ' EGP\n' +
      'Payment: ' + (financing === 'mortgage' ? 'Mortgage (20% down: ' + downEGP.toLocaleString() + ' EGP)' : 'Cash') + '\n\n' +
      'Monthly mortgage payment: ' + costMonthlyEGP.toLocaleString() + ' EGP\n' +
      'Monthly maintenance/tax/util: ' + Math.round(((annualMaint + annualUtil + annualTax) / 12) * rate).toLocaleString() + ' EGP\n' +
      'Expected rent (if rented): +' + Math.round((annualRent / 12) * rate).toLocaleString() + ' EGP\n' +
      '───\n' +
      'Net property cashflow: ' + (netMonthlyEGP >= 0 ? '+' : '') + netMonthlyEGP.toLocaleString() + ' EGP/month\n\n' +
      'Your current income: ' + Math.round(monthlyInc * rate).toLocaleString() + ' EGP/month\n' +
      'Your current expenses: ' + Math.round(monthlyExp * rate).toLocaleString() + ' EGP/month\n' +
      'Projected net after purchase: ' + (Math.round(projectedMonthlyNet * rate) >= 0 ? '+' : '') + Math.round(projectedMonthlyNet * rate).toLocaleString() + ' EGP/month';

    if (projectedMonthlyNet < 0) {
      warning += '\n\n⚠️ WARNING: You will still be losing money each month.';
    }

    warning += '\n\nProceed with this purchase?';

    if (!confirm(warning)) return;

    return P63_p12BuyBefore.apply(this, arguments);
  };
}

/* =================================================================
   FIX 6 — PROPERTY MONTHLY CASHFLOW BREAKDOWN (clear display)
   Patch the property detail expand so it explains the -54k figure.
   ================================================================= */
const P63_p61BuildPropertyCardBefore = (typeof p61BuildPropertyCard === 'function') ? p61BuildPropertyCard : null;
if (P63_p61BuildPropertyCardBefore) {
  p61BuildPropertyCard = function (home) {
    let html = P63_p61BuildPropertyCardBefore.apply(this, arguments);
    if (!home) return html;
    const rate = p63Rate();

    /* Compute the exact breakdown */
    const rentMonthlyEGP = (home.status === 'p12-rented' || home.status === 'rent')
      ? (home.rentLocalAmount || (Number(home.rentAmount) || 0) * rate)
      : 0;
    const mortgageMonthlyEGP = (Number(home.balance) || 0) > 0 && home.pay
      ? (Number(home.pay) * rate) / 12
      : 0;
    const maintMonthlyEGP = ((Number(home.value) || 0) * rate * 0.01) / 12;
    const taxMonthlyEGP = ((Number(home.value) || 0) * rate * 0.01) / 12;
    const utilMonthlyEGP = ((Number(home.value) || 0) * rate * 0.008) / 12;
    const net = rentMonthlyEGP - mortgageMonthlyEGP - maintMonthlyEGP - taxMonthlyEGP - utilMonthlyEGP;

    const breakdown = '<div style="margin-top:10px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
      '<b style="font-size:.82rem">Monthly cashflow breakdown</b>' +
      '<div class="row" style="border:0;padding:3px 0"><span>Rent collected</span><b class="mono" style="color:var(--mint)">' + (rentMonthlyEGP > 0 ? '+' : '') + Math.round(rentMonthlyEGP).toLocaleString() + ' EGP</b></div>' +
      (mortgageMonthlyEGP > 0 ? '<div class="row" style="border:0;padding:3px 0"><span>Mortgage</span><b class="mono" style="color:var(--rose)">-' + Math.round(mortgageMonthlyEGP).toLocaleString() + ' EGP</b></div>' : '') +
      '<div class="row" style="border:0;padding:3px 0"><span>Maintenance (1%/yr)</span><b class="mono" style="color:var(--rose)">-' + Math.round(maintMonthlyEGP).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0"><span>Property tax (1%/yr)</span><b class="mono" style="color:var(--rose)">-' + Math.round(taxMonthlyEGP).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0"><span>Utilities</span><b class="mono" style="color:var(--rose)">-' + Math.round(utilMonthlyEGP).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border-top:1px solid var(--line);margin-top:4px;padding-top:4px"><span><b>Net</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (net >= 0 ? '+' : '') + Math.round(net).toLocaleString() + ' EGP</b></div>' +
      '</div>';

    /* Insert it right before the "Details expand" is closed, only once */
    if (html.indexOf('Monthly cashflow breakdown') === -1) {
      html = html.replace('</section>', breakdown + '</section>');
    }
    return html;
  };
}

/* =================================================================
   FIX 7 — MORTGAGE ANNUAL PAYMENT RECALC AFTER EARLY PAYMENT
   ================================================================= */
const P63_p59MortgageBefore = (typeof p59PayMortgageCustom === 'function') ? p59PayMortgageCustom : null;
if (P63_p59MortgageBefore) {
  p59PayMortgageCustom = function (homeId) {
    const home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
    if (!home) return P63_p59MortgageBefore.apply(this, arguments);
    const oldBalance = Number(home.balance) || 0;
    const oldPay = Number(home.pay) || 0;
    const result = P63_p59MortgageBefore.apply(this, arguments);
    const newBalance = Number(home.balance) || 0;
    if (oldPay > 0 && oldBalance > 0 && newBalance < oldBalance && newBalance > 0) {
      const reduction = newBalance / oldBalance;
      const newPay = Math.max(500, Math.round(oldPay * reduction));
      home.pay = newPay;
      log('🏠 Annual mortgage payment recalculated: ' +
        Math.round(oldPay * p63Rate()).toLocaleString() + ' → ' +
        Math.round(newPay * p63Rate()).toLocaleString() + ' EGP/yr.');
    }
    return result;
  };
}

const P63_p59MortgageFullBefore = (typeof p59PayMortgageFull === 'function') ? p59PayMortgageFull : null;
if (P63_p59MortgageFullBefore) {
  p59PayMortgageFull = function (homeId) {
    const home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
    if (home) home.pay = 0;
    return P63_p59MortgageFullBefore.apply(this, arguments);
  };
}

/* =================================================================
   FIX 8 — STALE BILLS AFTER SELLING PROPERTY
   ================================================================= */
function p63RecomputeBills() {
  if (!S) return;
  if (!S.bill || typeof S.bill !== 'object') S.bill = {};
  const hasMortgage = (S.ownedHomes || []).some(function (h) { return h && (Number(h.balance) || 0) > 0; });
  const hasRentals = (S.ownedHomes || []).some(function (h) { return h && h.p12 && h.status === 'p12-rented'; });
  if (!hasMortgage && S.bill.mortgage) {
    delete S.bill.mortgage;
    log('🧹 Cleaned stale mortgage line from bills.');
  }
  if (!hasRentals && S.bill.rentalMaintenance) {
    delete S.bill.rentalMaintenance;
    log('🧹 Cleaned stale rental maintenance line.');
  }
  S.expenses = Object.values(S.bill).reduce(function (sum, v) {
    const n = Number(v);
    return sum + (isFinite(n) && n > 0 ? n : 0);
  }, 0);
  if (S.yearPopup) S.yearPopup.expenses = S.expenses;
  save();
}

const P63_p61SellBefore = (typeof p61SellProperty === 'function') ? p61SellProperty : null;
if (P63_p61SellBefore) {
  p61SellProperty = function (homeId) {
    const before = (S.ownedHomes || []).length;
    const result = P63_p61SellBefore.apply(this, arguments);
    if ((S.ownedHomes || []).length < before) p63RecomputeBills();
    return result;
  };
}

const P63_sellOwnedBefore = (typeof sellOwnedProperty === 'function') ? sellOwnedProperty : null;
if (P63_sellOwnedBefore) {
  sellOwnedProperty = function (idx) {
    const before = (S.ownedHomes || []).length;
    const result = P63_sellOwnedBefore.apply(this, arguments);
    if ((S.ownedHomes || []).length < before) p63RecomputeBills();
    return result;
  };
}

/* =================================================================
   FIX 9 — FUEL DISPLAY IN EGP FOR EGYPT
   ================================================================= */
const P63_headerBefore = p62BuildCarsHeader;
p62BuildCarsHeader = function () {
  let html = P63_headerBefore.apply(this, arguments);
  if (S && S.country === 'egy') {
    const petrolEgpPerLitre = Math.round(15.25 * p63Idx());
    html = html.replace(/Fuel \$[\d.]+(\/gal)?\s*·/, '⛽ Petrol ' + petrolEgpPerLitre + ' EGP/L ·');
  }
  return html;
};

/* =================================================================
   INIT
   ================================================================= */
p63RecomputeBills();
