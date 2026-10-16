/* =====================================================================
   63. CAR BUG FIXES
   - Fix licence cost explosion (147,560 EGP → 2,800 EGP)
   - Fix "Cannot access 'parents' before initialization" (TDZ bug)
   - Fix New Cars tab showing empty brand list
   - Fix fuel price display to use local currency in Egypt
   - Add property affordability warning before purchase
   - Add car-debug helper
   - Clean stale bill entries after selling property
   Load AFTER 62-cars-overhaul.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. LICENCE COST — change p62EGP semantics ============ */
/* p62EGP now takes EGP (2026) and applies the price index. Old version
   treated the argument as USD, so p62EGP(2800) became 147,560 EGP. */
function p62EGP(egp2026) {
  return Math.round((Number(egp2026) || 0) * p62Idx());
}

/* Recalculate p62CfgPrice to keep USD→internal conversion intact
   (it uses its own logic, not p62EGP, so no change needed there). */

/* ============ 2. TDZ BUG — rename local `parents` shadow ============ */
/* The function declared `const parents = ...` inside itself, which created
   a TDZ shadow of the global `parents()` function. Renaming the local. */
function p62ParentCarOffer() {
  if (!S || S.age < 18) return;
  p62Init();
  if (S.p62.lastOfferYear === gameYear()) return;
  const _parentList = (typeof parents === 'function' ? parents() : []).filter(function (p) {
    return p && p.alive !== false;
  });
  if (!_parentList.length) return;
  const fw = Number(S.famWealth) || 0;
  if (fw === 0) return;
  if (S.cars && S.cars.length > 0) return;
  if (Math.random() > (fw === 2 ? 0.35 : 0.15)) return;

  S.p62.lastOfferYear = gameYear();
  S.p62.pendingOffers.push({
    year: gameYear(),
    type: 'parent_gift_car',
    wealthTier: fw
  });
}

/* Same bug in p62AcceptParentCar and p62DeclineParentCar — patch those too */
function p62AcceptParentCar() {
  p62Init();
  if (!S.p62.pendingOffers.length) return;
  const off = S.p62.pendingOffers.shift();
  const fw = off.wealthTier;
  const rate = p62Rate();

  const pool = P62_MODELS.filter(function (m) {
    if (gameYear() < m[9] || gameYear() > m[10]) return false;
    const cls = m[3];
    if (fw === 2) return ['compact', 'mid', 'suv'].indexOf(cls) >= 0 && m[3] !== 'truck';
    return ['econ', 'compact'].indexOf(cls) >= 0;
  });
  if (!pool.length) return hint('No suitable car available.');

  const model = pool[Math.floor(Math.random() * pool.length)];
  const brand = P62_BRANDS[model[0]];
  const base = p62BasePriceUSD(model, gameYear());
  const age = fw === 2 ? 0 : 3 + Math.floor(Math.random() * 4);
  const value = Math.round(base * p62Depreciation(age));
  const car = {
    uid: 'cg' + Math.random().toString(36).slice(2, 8),
    make: brand.name,
    name: model[1],
    cls: model[3],
    year: gameYear() - age,
    trim: 0,
    color: 0,
    interior: 0,
    opts: [],
    msrp: base,
    paid: 0,
    insurance: 'tp',
    insuranceExpiry: gameYear() + 1,
    registrationExpiry: gameYear() + 1,
    miles: age * 12000,
    cond: fw === 2 ? 98 : 70,
    age: age,
    acc: false,
    broken: false,
    fix: 0,
    mods: [],
    modCost: 0,
    seller: 'parents',
    brand: model[0],
    fuel: model[11] ? 'e' : (model[10] ? 'h' : 'g'),
    life: model[8],
    value: value
  };
  S.cars = S.cars || [];
  S.cars.push(car);
  S.cars = S.cars.slice(-4);
  const _plist = (typeof parents === 'function' ? parents() : []);
  _plist.forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 8);
  });
  fx({ happiness: 6 });
  log('🎁 Your parents gave you a ' + car.year + ' ' + car.make + ' ' + car.name + '. They paid for it; you cover insurance and maintenance.');
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  render();
}

function p62DeclineParentCar() {
  p62Init();
  if (!S.p62.pendingOffers.length) return;
  S.p62.pendingOffers.shift();
  const _plist = (typeof parents === 'function' ? parents() : []);
  _plist.forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 3);
  });
  log('You politely declined your parents\' car offer.');
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  render();
}

/* ============ 3. NEW CARS TAB — defensive rebuild with empty check ============ */
function p62BuildNewTab() {
  if (!S.cars) S.cars = [];
  if (S.cars.length >= 4) {
    return '<section class="card" style="text-align:center;padding:32px 16px">' +
      '<div style="font-size:3rem;opacity:.4">🅿️</div>' +
      '<h3 style="margin-top:12px">Garage full</h3>' +
      '<p class="muted">You can own up to 4 cars. Sell one first.</p></section>';
  }

  /* Safety: ensure data exists */
  if (typeof P62_BRANDS === 'undefined' || typeof P62_MODELS === 'undefined') {
    return '<section class="card" style="border-color:var(--rose)"><h3>⚠️ Car data missing</h3>' +
      '<p class="muted">P62_BRANDS or P62_MODELS is not loaded. Check that 62-cars-overhaul.js loaded without errors in the console.</p></section>';
  }

  const year = gameYear();
  const brands = Object.keys(P62_BRANDS);
  const availableBrands = [];

  brands.forEach(function (key) {
    const models = P62_MODELS.filter(function (m) {
      return m && m[0] === key && year >= m[9] && year <= m[10];
    });
    if (models.length) {
      availableBrands.push({ key: key, brand: P62_BRANDS[key], models: models });
    }
  });

  if (!availableBrands.length) {
    return '<section class="card" style="border-color:var(--amber)"><h3>⚠️ No models available in ' + year + '</h3>' +
      '<p class="muted">Something is filtering out every model. Debug info below.</p>' +
      '<button class="btn" onclick="p62DebugCars()">Show debug info</button></section>';
  }

  const brandCards = availableBrands.map(function (b) {
    const cheapest = b.models.reduce(function (min, m) {
      const p = p62BasePriceUSD(m, year);
      return p < min ? p : min;
    }, Infinity);
    const cheapestEGP = Math.round(cheapest * 52.7 * p62Idx());
    return '<button class="btn" style="margin:0;padding:12px;text-align:left;display:flex;align-items:center;gap:10px" onclick="p62OpenBrand(\'' + b.key + '\')">' +
      p62BrandBadge(b.key, 36) +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-weight:700">' + b.brand.name + '</div>' +
      '<div class="muted" style="font-size:.72rem">' + b.models.length + ' models · from ' + cheapestEGP.toLocaleString() + ' EGP</div>' +
      '</div>' +
      '</button>';
  }).join('');

  return '<section class="card"><h3>🆕 New cars — browse brands</h3>' +
    '<p class="muted" style="font-size:.82rem">Egyptian market ' + year + '. All prices are on-the-road before options. ' +
    availableBrands.length + ' brands available.</p>' +
    '<div style="display:grid;grid-template-columns:1fr;gap:6px;margin-top:10px">' + brandCards + '</div>' +
    '</section>';
}

window.p62DebugCars = function () {
  console.log('=== p62 debug ===');
  console.log('gameYear:', typeof gameYear === 'function' ? gameYear() : 'missing');
  console.log('S.born:', S && S.born, '| S.age:', S && S.age);
  console.log('P62_BRANDS count:', typeof P62_BRANDS !== 'undefined' ? Object.keys(P62_BRANDS).length : 'undefined');
  console.log('P62_MODELS count:', typeof P62_MODELS !== 'undefined' ? P62_MODELS.length : 'undefined');
  if (typeof P62_MODELS !== 'undefined') {
    console.log('First 3 models:', P62_MODELS.slice(0, 3));
    const y = gameYear();
    const matching = P62_MODELS.filter(function (m) { return m && y >= m[9] && y <= m[10]; });
    console.log('Models valid for year ' + y + ':', matching.length);
  }
};

/* ============ 4. FUEL — display in EGP for Egypt ============ */
const P63_p62BuildCarsHeaderBefore = p62BuildCarsHeader;
p62BuildCarsHeader = function () {
  let html = P63_p62BuildCarsHeaderBefore.apply(this, arguments);
  /* Replace the raw $/gal string with local currency in Egypt */
  if (S && S.country === 'egy') {
    const gasEGP = Math.round((S.gas || 3.3) * 52.7 * p62Idx() / 3.785 * 4.55);
    /* Approximate: $/gal → EGP/liter in Egypt. Egyptian petrol is subsidised. */
    const petrolEgpPerLitre = Math.round(15.25 * p62Idx());  /* 2026 Egyptian subsidised petrol */
    html = html.replace(
      /Fuel \$[\d.]+(\/gal)?\s*·/,
      '⛽ Petrol ' + petrolEgpPerLitre + ' EGP/L ·'
    );
  }
  return html;
};

/* ============ 5. PROPERTY AFFORDABILITY WARNING ============ */
/* Patch p12BuyListing so it warns before completing a purchase that would
   push the player into negative monthly cashflow. */
if (typeof p12BuyListing === 'function') {
  const P63_p12BuyBefore = p12BuyListing;
  p12BuyListing = function (id, financing) {
    /* Pre-flight check */
    const market = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket() : [];
    const listing = market.find(function (x) { return x.id === id; });
    if (!listing) return P63_p12BuyBefore.apply(this, arguments);

    const rate = p63Rate();
    const priceInternal = Number(listing.priceInternal) || 0;
    const downInternal = financing === 'mortgage' ? priceInternal * 0.20 : priceInternal;

    /* Estimate annual cost */
    let annualMortgage = 0;
    if (financing === 'mortgage') {
      const mortRate = S.mortRate || 0.05;
      annualMortgage = (priceInternal - downInternal) * (mortRate / (1 - Math.pow(1 + mortRate, -20)));
    }
    const annualMaint = priceInternal * 0.01;
    const annualUtil = priceInternal * 0.008;
    const annualTax = priceInternal * 0.01;
    const estAnnualCost = annualMortgage + annualMaint + annualUtil + annualTax;
    const estAnnualRent = priceInternal * 0.0035 * 12 * 0.9;   /* 90% occupancy assumption */
    const netAnnual = estAnnualRent - estAnnualCost;
    const netMonthly = netAnnual / 12;

    /* Current income */
    const monthlyIncome = (p54LiveIncome ? p54LiveIncome() : (S.income || 0)) / 12;
    const monthlyExpenses = (p54LiveExpenses ? p54LiveExpenses() : (S.expenses || 0)) / 12;
    const projectedMonthlyNet = (monthlyIncome - monthlyExpenses) + netMonthly;

    /* If the cashflow is already negative or would go negative, warn */
    const priceEGP = Math.round(priceInternal * rate);
    const estCostEGP = Math.round(estAnnualCost * rate);
    const estRentEGP = Math.round(estAnnualRent * rate);
    const netMonthlyEGP = Math.round(netMonthly * rate);
    const projectedNetEGP = Math.round(projectedMonthlyNet * rate);

    let warning = '';
    if (netMonthly < 0) {
      warning += '\n⚠️ This property will LOSE money every month:\n' +
        '   Mortgage + costs: ' + estCostEGP.toLocaleString() + ' EGP/year\n' +
        '   Expected rent: ' + estRentEGP.toLocaleString() + ' EGP/year\n' +
        '   Net: ' + (netMonthlyEGP >= 0 ? '+' : '') + netMonthlyEGP.toLocaleString() + ' EGP/month';
    } else {
      warning += '\nEstimated monthly cashflow: ' + (netMonthlyEGP >= 0 ? '+' : '') + netMonthlyEGP.toLocaleString() + ' EGP.';
    }
    warning += '\n\nAfter this purchase your projected monthly net:\n' +
      '   ' + (projectedNetEGP >= 0 ? '+' : '') + projectedNetEGP.toLocaleString() + ' EGP/month';

    if (projectedMonthlyNet < 0 && netMonthly < 0) {
      warning += '\n\n❌ This purchase will make you lose money every month. The bank / developer would likely refuse this loan in real life. Are you sure?';
    } else if (projectedMonthlyNet < 0) {
      warning += '\n\n⚠️ This purchase will make your household cashflow negative. Continue anyway?';
    }

    const confirmed = confirm('Buy this property?\n\n' +
      'Price: ' + priceEGP.toLocaleString() + ' EGP\n' +
      'Payment: ' + (financing === 'mortgage' ? 'Mortgage (20% down)' : 'Cash') + '\n' +
      warning);

    if (!confirmed) return;

    return P63_p12BuyBefore.apply(this, arguments);
  };
}
function p63Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* ============ 6. CLEAN STALE BILLS after selling property ============ */
/* Patch p61SellProperty and the base sellOwnedProperty to clean the bill
   of any mortgage/rental entries for the sold property. */
const P63_p61SellPropertyBefore = (typeof p61SellProperty === 'function') ? p61SellProperty : null;
if (P63_p61SellPropertyBefore) {
  p61SellProperty = function (homeId) {
    const before = (S.ownedHomes || []).length;
    const result = P63_p61SellPropertyBefore.apply(this, arguments);
    const after = (S.ownedHomes || []).length;
    if (after < before) {
      p63RecomputeBills();
    }
    return result;
  };
}

/* Also patch the base sellOwnedProperty */
const P63_sellOwnedBefore = (typeof sellOwnedProperty === 'function') ? sellOwnedProperty : null;
if (P63_sellOwnedBefore) {
  sellOwnedProperty = function (idx) {
    const before = (S.ownedHomes || []).length;
    const result = P63_sellOwnedBefore.apply(this, arguments);
    const after = (S.ownedHomes || []).length;
    if (after < before) {
      p63RecomputeBills();
    }
    return result;
  };
}

function p63RecomputeBills() {
  if (!S) return;
  if (!S.bill || typeof S.bill !== 'object') S.bill = {};

  /* Check if the player still owns any property with a mortgage */
  const hasMortgage = (S.ownedHomes || []).some(function (h) { return h && (Number(h.balance) || 0) > 0; });
  const hasRentals = (S.ownedHomes || []).some(function (h) { return h && h.p12 && h.status === 'p12-rented'; });

  if (!hasMortgage && S.bill.mortgage) {
    log('🧹 Cleaned stale mortgage line from bills: ' + Math.round(S.bill.mortgage * p63Rate()).toLocaleString() + ' EGP was removed.');
    delete S.bill.mortgage;
  }
  if (!hasRentals && S.bill.rentalMaintenance) {
    log('🧹 Cleaned stale rental maintenance: ' + Math.round(S.bill.rentalMaintenance * p63Rate()).toLocaleString() + ' EGP was removed.');
    delete S.bill.rentalMaintenance;
  }

  /* Recompute total expenses from the bill */
  S.expenses = Object.values(S.bill).reduce(function (sum, v) {
    const n = Number(v);
    return sum + (isFinite(n) && n > 0 ? n : 0);
  }, 0);
  if (S.yearPopup) S.yearPopup.expenses = S.expenses;
  save();
}

/* ============ 7. RUN ON LOAD ============ */
p63RecomputeBills();

if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    /* Recompute bills whenever a property transaction changed state */
  });
}
