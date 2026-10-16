/* =====================================================================
   64. FINAL FIXES — model filter, hard purchase gate, cashflow breakdown
   Overrides all previous car/property logic.
   Load AFTER 63-car-bug-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p64Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p64Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* ============ 1. MODEL VALIDATOR — correct indices ============
   Row = [make, model, class, price, mpg, hap, soc, life,
          fromYear(8), toYear(9), hybridFrom(10), isElectric(11)]
   =============================================================== */
function p64ModelValid(m, year) {
  if (!m || !Array.isArray(m)) return false;
  const fromYear = Number(m[8]) || 0;
  const toYear   = Number(m[9]) || 9999;
  return year >= fromYear && year <= toYear;
}

/* Override the base filter */
p62ModelsForBrand = function (brand, year) {
  year = year || gameYear();
  return P62_MODELS.filter(function (m) { return m[0] === brand && p64ModelValid(m, year); });
};

/* Override p62BasePriceUSD so it also uses the correct validator */
const P64_p62BasePriceBefore = p62BasePriceUSD;
p62BasePriceUSD = function (model, year) {
  if (!model) return 0;
  year = year || gameYear();
  const inflation = (typeof prOf === 'function') ? prOf(year, S) : 1;
  let base = Number(model[3]) || 0;
  if (S && S.country === 'egy') {
    const brand = P62_BRANDS[model[0]];
    if (brand && brand.tier === 3) base *= 1.15;
    if (brand && brand.tier === 4) base *= 1.25;
    if (brand && brand.tier === 5) base *= 1.35;
  }
  return Math.round(base * inflation);
};

/* ============ 2. NEW CARS TAB — rebuilt with correct filter ============ */
p62BuildNewTab = function () {
  if (!S.cars) S.cars = [];
  if (S.cars.length >= 4) {
    return '<section class="card" style="text-align:center;padding:32px 16px">' +
      '<div style="font-size:3rem;opacity:.4">🅿️</div>' +
      '<h3 style="margin-top:12px">Garage full</h3>' +
      '<p class="muted">You can own up to 4 cars. Sell one first.</p></section>';
  }
  if (typeof P62_BRANDS === 'undefined' || typeof P62_MODELS === 'undefined') {
    return '<section class="card"><h3>⚠️ Car data missing</h3></section>';
  }
  const year = gameYear();
  const brands = [];
  Object.keys(P62_BRANDS).forEach(function (key) {
    const models = P62_MODELS.filter(function (m) { return m[0] === key && p64ModelValid(m, year); });
    if (models.length) brands.push({ key: key, brand: P62_BRANDS[key], models: models });
  });
  if (!brands.length) {
    return '<section class="card"><h3>⚠️ No models available in ' + year + '</h3>' +
      '<button class="btn" onclick="p64Debug()">Debug info</button></section>';
  }
  const cards = brands.map(function (b) {
    let cheapest = Infinity;
    b.models.forEach(function (m) {
      const p = p62BasePriceUSD(m, year);
      if (p < cheapest) cheapest = p;
    });
    const cheapestEGP = Math.round(cheapest * 52.7 * p64Idx());
    return '<button class="btn" style="margin:0;padding:12px;text-align:left;display:flex;align-items:center;gap:10px" onclick="p62OpenBrand(\'' + b.key + '\')">' +
      p62BrandBadge(b.key, 36) +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-weight:700">' + b.brand.name + '</div>' +
      '<div class="muted" style="font-size:.72rem">' + b.models.length + ' models · from ' + cheapestEGP.toLocaleString() + ' EGP</div>' +
      '</div></button>';
  }).join('');
  return '<section class="card"><h3>🆕 New cars — ' + brands.length + ' brands available (' + year + ')</h3>' +
    '<div style="display:grid;grid-template-columns:1fr;gap:6px;margin-top:10px">' + cards + '</div></section>';
};

/* Override p62OpenBrand to use the correct filter */
p62OpenBrand = function (brandKey) {
  const brand = P62_BRANDS[brandKey];
  if (!brand) return;
  const year = gameYear();
  const models = P62_MODELS.filter(function (m) { return m[0] === brandKey && p64ModelValid(m, year); });
  if (!models.length) return hint('No models available for ' + brand.name + ' in ' + year + '.');
  const list = models.map(function (m) {
    const baseUSD = p62BasePriceUSD(m, year);
    const baseEGP = Math.round(baseUSD * 52.7 * p64Idx());
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

/* ============ 3. DEBUG (new name to avoid cache) ============ */
window.p64Debug = function () {
  const y = gameYear();
  console.log('=== p64 debug ===');
  console.log('gameYear:', y);
  console.log('P62_MODELS rows:', P62_MODELS.length);
  const sample = P62_MODELS[0];
  console.log('Sample indices: m[8]=' + sample[8] + ' m[9]=' + sample[9] + ' m[10]=' + sample[10] + ' m[11]=' + sample[11]);
  let valid = 0;
  P62_MODELS.forEach(function (m) { if (p64ModelValid(m, y)) valid++; });
  console.log('Valid for ' + y + ':', valid);
  const byBrand = {};
  P62_MODELS.forEach(function (m) { if (p64ModelValid(m, y)) byBrand[m[0]] = (byBrand[m[0]] || 0) + 1; });
  console.log('By brand:', byBrand);
};

/* ============ 4. HARD GATE — Buy tab (market listings) ============ */
const P64_p12BuyBefore = (typeof p12BuyListing === 'function') ? p12BuyListing : null;
if (P64_p12BuyBefore) {
  p12BuyListing = function (id, financing) {
    const market = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket() : [];
    const listing = market.find(function (x) { return x && x.id === id; });
    if (!listing) return P64_p12BuyBefore.apply(this, arguments);

    const rate = p64Rate();
    const priceInternal = Number(listing.priceInternal) || 0;
    const priceEGP = Math.round(priceInternal * rate);
    const downInternal = financing === 'mortgage' ? priceInternal * 0.20 : priceInternal;
    const downEGP = Math.round(downInternal * rate);
    const cashEGP = Math.round(S.wealth * rate);

    /* Cash check */
    if (financing !== 'mortgage' && S.wealth < priceInternal) {
      return hint('❌ REFUSED: Need ' + priceEGP.toLocaleString() + ' EGP in cash. You have ' + cashEGP.toLocaleString() + ' EGP.');
    }

    /* Mortgage checks */
    if (financing === 'mortgage') {
      if (S.wealth < downInternal) {
        return hint('❌ REFUSED: Down payment ' + downEGP.toLocaleString() + ' EGP. You have ' + cashEGP.toLocaleString() + ' EGP.');
      }
      const mortRate = S.mortRate || 0.19;
      const annualMortgage = (priceInternal - downInternal) * (mortRate / (1 - Math.pow(1 + mortRate, -20)));
      const monthlyMortgage = annualMortgage / 12;
      const monthlyIncome = (typeof p54LiveIncome === 'function' ? p54LiveIncome() : (S.income || 0)) / 12;
      const ratio = monthlyMortgage / Math.max(1, monthlyIncome);

      if (ratio > 0.35) {
        return hint('❌ REFUSED by bank:\n\nYour monthly income: ' +
          Math.round(monthlyIncome * rate).toLocaleString() + ' EGP\n' +
          'Monthly mortgage would be: ' + Math.round(monthlyMortgage * rate).toLocaleString() + ' EGP (' +
          Math.round(ratio * 100) + '% of income)\n\n' +
          'Egyptian banks require monthly payments ≤ 35% of income.');
      }
    }

    return P64_p12BuyBefore.apply(this, arguments);
  };
}

/* ============ 5. HARD GATE — Compounds tab (purchaseProperty) ============ */
const P64_purchasePropertyBefore = purchaseProperty;
purchaseProperty = function (rosterId, unitId, planId, isCompound, isEgypt) {
  /* Rebuild the price calculation to know the total cost */
  const y = gameYear();
  const catalog = isCompound
    ? (typeof COMPOUND_ROSTER !== 'undefined' && (COMPOUND_ROSTER[isEgypt ? 'egy' : S.country] || COMPOUND_ROSTER.egy))
    : (typeof LOCAL_MARKET_ROSTER !== 'undefined' && (LOCAL_MARKET_ROSTER[isEgypt ? 'egy' : S.country] || LOCAL_MARKET_ROSTER.egy));
  if (!catalog) return P64_purchasePropertyBefore.apply(this, arguments);
  const prop = catalog.find(function (p) { return p.id === rosterId; });
  const unit = (typeof PROPERTY_UNITS !== 'undefined') ? PROPERTY_UNITS.find(function (u) { return u.id === unitId; }) : null;
  const plan = isCompound && typeof COMPOUND_PLANS !== 'undefined' ? COMPOUND_PLANS.find(function (p) { return p.id === planId; }) : { downPct: 1, years: 0, markup: 1 };
  if (!prop || !unit || !plan) return P64_purchasePropertyBefore.apply(this, arguments);

  const idx = (isEgypt && typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(y) : 1;
  const rawPrice = unit.area * prop.ppm * unit.mult * idx;
  const basePrice = isEgypt ? Math.round(rawPrice / 1000) * 1000 : Math.round(rawPrice);
  const finalPriceAmt = Math.round(basePrice * plan.markup);
  const downPaymentAmt = Math.round(finalPriceAmt * plan.downPct);

  const rate = p64Rate();
  const internalDown = downPaymentAmt / rate;
  const internalRemaining = (finalPriceAmt - downPaymentAmt) / rate;
  const cashEGP = Math.round(S.wealth * rate);
  const priceEGP = finalPriceAmt;
  const downEGP = downPaymentAmt;

  /* Cash for full purchase */
  if (plan.years === 0) {
    if (S.wealth < internalDown) {
      return hint('❌ REFUSED: Full cash price is ' + priceEGP.toLocaleString() + ' EGP. You have ' + cashEGP.toLocaleString() + ' EGP.');
    }
  } else {
    /* Installment plan — check down + income ratio */
    if (S.wealth < internalDown) {
      return hint('❌ REFUSED: Down payment is ' + downEGP.toLocaleString() + ' EGP. You have ' + cashEGP.toLocaleString() + ' EGP.');
    }
    const annualPaymentInternal = internalRemaining / plan.years;
    const annualPaymentEGP = Math.round(annualPaymentInternal * rate);
    const monthlyPaymentEGP = Math.round(annualPaymentEGP / 12);

    const annualIncomeInternal = (typeof p54LiveIncome === 'function' ? p54LiveIncome() : (S.income || 0));
    const monthlyIncomeEGP = Math.round((annualIncomeInternal / 12) * rate);
    const ratio = annualPaymentInternal / Math.max(1, annualIncomeInternal);

    if (ratio > 0.35) {
      return hint('❌ REFUSED by developer:\n\n' +
        'Full price: ' + priceEGP.toLocaleString() + ' EGP\n' +
        'Down payment: ' + downEGP.toLocaleString() + ' EGP\n' +
        'Annual installment: ' + annualPaymentEGP.toLocaleString() + ' EGP\n' +
        'Monthly installment: ' + monthlyPaymentEGP.toLocaleString() + ' EGP\n\n' +
        'Your monthly income: ' + monthlyIncomeEGP.toLocaleString() + ' EGP\n' +
        'Monthly payment / income: ' + Math.round(ratio * 100) + '%\n\n' +
        'Egyptian developers and banks require this to stay below 35%.');
    }

    /* Confirm with full breakdown */
    const confirmMsg = '💰 PROPERTY PURCHASE\n\n' +
      'Full price: ' + priceEGP.toLocaleString() + ' EGP\n' +
      'Down payment: ' + downEGP.toLocaleString() + ' EGP\n' +
      'Annual installment: ' + annualPaymentEGP.toLocaleString() + ' EGP\n' +
      'Monthly installment: ' + monthlyPaymentEGP.toLocaleString() + ' EGP\n\n' +
      'Your monthly income: ' + monthlyIncomeEGP.toLocaleString() + ' EGP\n' +
      'Monthly payment / income: ' + Math.round(ratio * 100) + '% (limit 35%)\n\n' +
      'Proceed?';
    if (!confirm(confirmMsg)) return;
  }

  return P64_purchasePropertyBefore.apply(this, arguments);
};

/* ============ 6. PROPERTY CARD — monthly cashflow breakdown ============ */
const P64_p61CardBefore = (typeof p61BuildPropertyCard === 'function') ? p61BuildPropertyCard : null;
if (P64_p61CardBefore) {
  p61BuildPropertyCard = function (home) {
    let html = P64_p61CardBefore.apply(this, arguments);
    if (!home) return html;
    if (html.indexOf('Monthly breakdown') !== -1) return html;

    const rate = p64Rate();
    const rent = ((home.status === 'p12-rented' || home.status === 'rent'))
      ? (home.rentLocalAmount || ((Number(home.rentAmount) || 0) * rate)) : 0;
    const mort = ((Number(home.balance) || 0) > 0 && home.pay) ? ((Number(home.pay) * rate) / 12) : 0;
    const val = Number(home.value) || 0;
    const maint = (val * rate * 0.01) / 12;
    const tax = (val * rate * 0.01) / 12;
    const util = (val * rate * 0.008) / 12;
    const net = rent - mort - maint - tax - util;

    const breakdown = '<div style="margin-top:10px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
      '<b style="font-size:.82rem;color:var(--cyan)">📊 Monthly breakdown</b>' +
      '<div class="row" style="border:0;padding:3px 0"><span>Rent collected</span><b class="mono" style="color:var(--mint)">' + (rent > 0 ? '+' : '') + Math.round(rent).toLocaleString() + ' EGP</b></div>' +
      (mort > 0 ? '<div class="row" style="border:0;padding:3px 0"><span>Mortgage payment</span><b class="mono" style="color:var(--rose)">-' + Math.round(mort).toLocaleString() + ' EGP</b></div>' : '') +
      '<div class="row" style="border:0;padding:3px 0"><span>Maintenance (1%/yr)</span><b class="mono" style="color:var(--rose)">-' + Math.round(maint).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0"><span>Property tax</span><b class="mono" style="color:var(--rose)">-' + Math.round(tax).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border:0;padding:3px 0"><span>Utilities</span><b class="mono" style="color:var(--rose)">-' + Math.round(util).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border-top:1px solid var(--line);margin-top:4px;padding-top:4px"><span><b>Net monthly</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (net >= 0 ? '+' : '') + Math.round(net).toLocaleString() + ' EGP</b></div>' +
      '</div>';

    const idx = html.lastIndexOf('</section>');
    if (idx !== -1) html = html.slice(0, idx) + breakdown + html.slice(idx);
    return html;
  };
}

/* ============ 7. MORTGAGE ANNUAL PAYMENT RECALC ============ */
const P64_p59CustomBefore = (typeof p59PayMortgageCustom === 'function') ? p59PayMortgageCustom : null;
if (P64_p59CustomBefore) {
  p59PayMortgageCustom = function (homeId) {
    const home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
    if (!home) return P64_p59CustomBefore.apply(this, arguments);
    const oldBal = Number(home.balance) || 0;
    const oldPay = Number(home.pay) || 0;
    const result = P64_p59CustomBefore.apply(this, arguments);
    const newBal = Number(home.balance) || 0;
    if (oldPay > 0 && oldBal > 0 && newBal < oldBal && newBal > 0) {
      const newPay = Math.max(500, Math.round(oldPay * (newBal / oldBal)));
      home.pay = newPay;
      log('🏠 Annual mortgage payment recalculated: ' +
        Math.round(oldPay * p64Rate()).toLocaleString() + ' → ' +
        Math.round(newPay * p64Rate()).toLocaleString() + ' EGP/yr.');
    }
    return result;
  };
}
const P64_p59FullBefore = (typeof p59PayMortgageFull === 'function') ? p59PayMortgageFull : null;
if (P64_p59FullBefore) {
  p59PayMortgageFull = function (homeId) {
    const home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
    if (home) home.pay = 0;
    return P64_p59FullBefore.apply(this, arguments);
  };
}

/* ============ 8. FUEL IN EGP ============ */
const P64_headerBefore = p62BuildCarsHeader;
p62BuildCarsHeader = function () {
  let html = P64_headerBefore.apply(this, arguments);
  if (S && S.country === 'egy') {
    const petrol = Math.round(15.25 * p64Idx());
    html = html.replace(/Fuel \$[\d.]+(\/gal)?\s*·/, '⛽ Petrol ' + petrol + ' EGP/L ·');
  }
  return html;
};

/* ============ 9. CLEAN STALE BILLS ON SELL ============ */
function p64CleanBills() {
  if (!S || !S.bill) return;
  const hasMortgage = (S.ownedHomes || []).some(function (h) { return h && (Number(h.balance) || 0) > 0; });
  const hasRentals = (S.ownedHomes || []).some(function (h) { return h && h.p12 && h.status === 'p12-rented'; });
  if (!hasMortgage && S.bill.mortgage) { delete S.bill.mortgage; log('🧹 Cleaned stale mortgage line.'); }
  if (!hasRentals && S.bill.rentalMaintenance) { delete S.bill.rentalMaintenance; log('🧹 Cleaned stale rental maintenance.'); }
  S.expenses = Object.values(S.bill).reduce(function (s, v) { const n = Number(v); return s + (isFinite(n) && n > 0 ? n : 0); }, 0);
  if (S.yearPopup) S.yearPopup.expenses = S.expenses;
  save();
}
const P64_sellBefore = (typeof p61SellProperty === 'function') ? p61SellProperty : null;
if (P64_sellBefore) {
  p61SellProperty = function (homeId) {
    const before = (S.ownedHomes || []).length;
    const r = P64_sellBefore.apply(this, arguments);
    if ((S.ownedHomes || []).length < before) p64CleanBills();
    return r;
  };
}
const P64_sellOwnedBefore = (typeof sellOwnedProperty === 'function') ? sellOwnedProperty : null;
if (P64_sellOwnedBefore) {
  sellOwnedProperty = function (idx) {
    const before = (S.ownedHomes || []).length;
    const r = P64_sellOwnedBefore.apply(this, arguments);
    if ((S.ownedHomes || []).length < before) p64CleanBills();
    return r;
  };
}

/* ============ 10. HELP SCRIPT — sell everything unaffordable ============ */
window.p64SellAllUnaffordable = function () {
  if (!S || !S.ownedHomes) return;
  const monthlyInc = (typeof p54LiveIncome === 'function' ? p54LiveIncome() : (S.income || 0)) / 12;
  const toSell = [];
  S.ownedHomes.forEach(function (h, i) {
    const pay = Number(h.pay) || 0;
    if (pay > 0 && pay / 12 > monthlyInc * 0.35) toSell.push(i);
  });
  if (!toSell.length) { console.log('Nothing to sell'); return; }
  for (let i = toSell.length - 1; i >= 0; i--) {
    const h = S.ownedHomes[toSell[i]];
    console.log('Selling', h.name);
    if (typeof p61SellProperty === 'function') p61SellProperty(h.id);
  }
  render();
};

/* ============ INIT ============ */
p64CleanBills();
