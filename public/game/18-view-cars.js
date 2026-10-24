/* ============================================================
   VIEW: CARS
   ============================================================
   Sub-tabs: Browse · Used · Rent · Mods · Garage · License
   Uses data from js/05-data-cars.js.
   Owns S.cars, S.carsLicense, S.carsTab, S.carsConfig,
        S.carsBrandFocus, S.carsUsedMarket, S.carsUsedMarketYear.
   Registers tab 'cars' at order 7.
   Year tick: depreciation, service, fuel, insurance, breakdown, events.

   v2: Cars can be stored abroad (S.cars[i].storedIn = country code).
       Stored cars incur NO ongoing costs and are frozen in the year tick
       (only age increments). They reactivate automatically when the
       player returns to that country (handled by the countryChanged
       hook in 00-engine.js).
   ============================================================ */

/* ---------- STATE ---------- */
function ensureCarsState() {
  if (!S) return;
  if (!Array.isArray(S.cars)) S.cars = [];
  if (!S.carsLicense) S.carsLicense = { hasLicense: false, category: 'B', attempts: 0, issuedYear: 0, expiresYear: 0, points: 0, suspendedUntil: 0 };
  if (typeof S.carsLicense.hasLicense !== 'boolean') S.carsLicense.hasLicense = false;
  if (typeof S.carsLicense.category !== 'string') S.carsLicense.category = 'B';
  if (typeof S.carsLicense.attempts !== 'number') S.carsLicense.attempts = 0;
  if (typeof S.carsLicense.issuedYear !== 'number') S.carsLicense.issuedYear = 0;
  if (typeof S.carsLicense.expiresYear !== 'number') S.carsLicense.expiresYear = 0;
  if (typeof S.carsLicense.points !== 'number') S.carsLicense.points = 0;
  if (typeof S.carsLicense.suspendedUntil !== 'number') S.carsLicense.suspendedUntil = 0;
  if (!S.carsTab) S.carsTab = 'browse';
  if (typeof S.carsConfig === 'undefined') S.carsConfig = null;
  if (typeof S.carsBrandFocus === 'undefined') S.carsBrandFocus = null;
  if (!Array.isArray(S.carsUsedMarket)) S.carsUsedMarket = [];
  if (typeof S.carsUsedMarketYear !== 'number') S.carsUsedMarketYear = 0;
  if (typeof S.carsKmPerYear !== 'number') S.carsKmPerYear = 12000;
  S.cars.forEach(function(c) {
    if (!c || typeof c !== 'object') return;
    if (!c.uid) c.uid = 'c' + Math.random().toString(36).slice(2, 8);
    if (typeof c.condition !== 'number') c.condition = 100;
    if (typeof c.mileage !== 'number') c.mileage = 0;
    if (typeof c.age !== 'number') c.age = 0;
    if (!c.insurance) c.insurance = 'compreh';
    if (typeof c.insuranceExpiry !== 'number') c.insuranceExpiry = gameYear();
    if (typeof c.registrationExpiry !== 'number') c.registrationExpiry = gameYear();
    if (!Array.isArray(c.options)) c.options = [];
    if (!Array.isArray(c.mods)) c.mods = [];
    if (typeof c.hasLoan !== 'boolean') c.hasLoan = false;
    if (typeof c.broken !== 'boolean') c.broken = false;
    if (typeof c.repairCost !== 'number') c.repairCost = 0;
    if (typeof c.stolen !== 'boolean') c.stolen = false;
    if (typeof c.hpModded !== 'number') c.hpModded = 0;
    if (typeof c.batteryHealth !== 'number') c.batteryHealth = 100;
    if (typeof c.storedIn === 'undefined') c.storedIn = null;   /* country code or null */
  });
}
GameHooks.on('newGame', ensureCarsState);
GameHooks.on('migrate', ensureCarsState);

/* ---------- STORAGE HELPERS (v2) ---------- */
function carIsActive(car) { return car && !car.storedIn; }
function carActiveCount() {
  return (S.cars || []).filter(function(c) { return !c.storedIn; }).length;
}

/* ---------- HELPERS ---------- */
function carCurrency() { return C().currency; }
function carRate() { return C().rate || 1; }
function carCountry() { return S.country || 'egy'; }
function carTierMult(brandKey) {
  const b = CAR_BRANDS[brandKey];
  if (!b) return 1.0;
  const country = carCountry();
  if (country === 'egy') {
    if (b.tier >= 5) return 1.90;
    if (b.tier === 4) return 1.60;
    if (b.tier === 3) return 1.35;
    if (b.tier === 2) return 1.10;
    return 1.0;
  }
  if (country === 'usa' || country === 'uk' || country === 'deu' || country === 'can') return 1.0;
  if (b.tier >= 4) return 1.10;
  if (b.tier === 3) return 1.05;
  return 1.0;
}
function carBasePriceLocal(model) {
  if (!model) return 0;
  const priceIndex = typeof econPriceFactor === 'function' ? econPriceFactor(carCountry(), gameYear()) : 1;
  return Math.round(model[4] * carRate() * carTierMult(model[0]) * priceIndex);
}
function carDepreciationFactor(age) {
  let f = 1.0;
  for (let i = 0; i < age; i++) {
    if (i === 0) f *= 0.85;
    else if (i === 1) f *= 0.88;
    else if (i === 2) f *= 0.90;
    else f *= 0.92;
  }
  return Math.max(0.05, f);
}
function carCurrentValueLocal(car) {
  const model = carModelById(car.brand, car.model);
  if (!model) return 0;
  let modValueAdd = 0;
  if (car.mods && car.mods.length) {
     car.mods.forEach(mid => {
        let mObj = CAR_MODS.find(m => m.id === mid);
        if(mObj) modValueAdd += (mObj.usd * carRate() * 0.25);
     });
  }
  return Math.round(carBasePriceLocal(model) * carDepreciationFactor(car.age) * (0.6 + 0.4 * car.condition / 100)) + Math.round(modValueAdd);
}
function carMaintenanceYearLocal(car) {
  const cls = CAR_CLASSES[car.cls] || CAR_CLASSES.compact;
  const countryMult = carCountry() === 'egy' ? 0.5 : carCountry() === 'sau' ? 0.7 : carCountry() === 'uae' ? 0.8 : 1.0;
  const ageMult = 1 + car.age * 0.05;
  const brand = CAR_BRANDS[car.brand];
  const relMult = brand ? (1 - (brand.reliability - 5) * 0.05) : 1.0;
  const conditionMult = 1 + ((100 - car.condition) * 0.01);
  return Math.round(cls.maintenance * carRate() * countryMult * ageMult * relMult * conditionMult);
}
function carFuelCostYearLocal(car) {
  const model = carModelById(car.brand, car.model);
  if (!model) return 0;
  const prices = CAR_FUEL_PRICES[carCountry()] || CAR_FUEL_PRICES.egy;
  const km = S.carsKmPerYear || 12000;
  if (model[17]) {
    const degMult = (120 - car.batteryHealth) / 100;
    const kwh = (km / 6) * degMult;
    return Math.round(kwh * prices.electricity);
  }
  const isHybrid = model[16] && gameYear() >= model[16];
  const effMpg = isHybrid ? model[5] * 1.4 : model[5];
  const liters = (km / 100) * (235.2 / effMpg);
  return Math.round(liters * prices.petrol);
}
function carInsuranceYearLocal(car) {
  const tier = CAR_INSURANCE[car.insurance] || CAR_INSURANCE.compreh;
  const valueLocal = carCurrentValueLocal(car);
  let mult = tier.mult;
  if(S.carsLicense && S.carsLicense.points > 0) mult += (S.carsLicense.points * 0.002);
  return Math.round(valueLocal * mult);
}
function carRegistrationYearLocal(car) {
  const base = carBasePriceLocal(carModelById(car.brand, car.model));
  const country = carCountry();
  if (country === 'egy') return Math.round(base * 0.008);
  if (country === 'usa') return 300;
  if (country === 'sau') return 500;
  if (country === 'uae') return 800;
  if (country === 'uk') return 250;
  if (country === 'deu') return 400;
  return 200;
}
function carAmortizedMonthly(principal, annualRate, months) {
  if (months <= 0 || principal <= 0) return 0;
  const r = annualRate / 12;
  return Math.round(principal * r / (1 - Math.pow(1 + r, -months)));
}
function carBrandBadge(brandKey, size) {
  const b = CAR_BRANDS[brandKey];
  if (!b) return '';
  const sz = size || 36;
  return '<div style="display:inline-flex;align-items:center;justify-content:center;width:' + sz + 'px;height:' + sz + 'px;border-radius:8px;background:' + b.color + ';color:#fff;font-weight:800;font-size:' + Math.round(sz * 0.42) + 'px">' + b.logo + '</div>';
}
function carTotalHP(car) {
    const model = carModelById(car.brand, car.model);
    if(!model) return 0;
    return model[6] + (car.hpModded || 0);
}
function carIsEV(car) {
    const model = carModelById(car.brand, car.model);
    if(!model) return false;
    return model[17];
}

/* ---------- LICENSE ---------- */
function carLicenceStatus() {
  if (S.carsLicense.suspendedUntil > gameYear()) return 'suspended';
  if (!S.carsLicense.hasLicense) return 'none';
  if (S.carsLicense.expiresYear < gameYear()) return 'expired';
  return 'valid';
}
function carTakeLicenceTest() {
  ensureCarsState();
  if(S.carsLicense.suspendedUntil > gameYear()) {
      log('Your licence is suspended until ' + S.carsLicense.suspendedUntil + '.'); render(); return;
  }
  const country = carCountry();
  const info = CAR_LICENCE[country] || CAR_LICENCE.egy;
  const cat = 'B';
  const ageMin = info.ageMin[cat] || 18;
  if (S.age < ageMin) { log('Licence requires age ' + ageMin + '.'); render(); return; }
  if (S.carsLicense.attempts >= 4) { log('You have used all 4 attempts this decade.'); render(); return; }
  const cost = info.costs[cat];
  if (S.wealth < cost) { log('Not enough cash. Licence costs ' + money(cost) + '.'); render(); return; }
  S.wealth -= cost;
  S.carsLicense.attempts++;
  const chance = info.passBase + Math.max(0, (S.smarts - 40) / 200) + Math.max(0, (S.happiness - 40) / 400);
  if (Math.random() < chance) {
    S.carsLicense.hasLicense = true;
    S.carsLicense.category = cat;
    S.carsLicense.issuedYear = gameYear();
    S.carsLicense.expiresYear = gameYear() + 10;
    S.carsLicense.attempts = 0;
    S.carsLicense.points = 0;
    fx({ happiness: 6 });
    log('🎉 You passed! Driving licence valid until ' + S.carsLicense.expiresYear + '.');
  } else {
    fx({ happiness: -3 });
    log('❌ Failed (attempt ' + S.carsLicense.attempts + '/4). Costs ' + money(cost) + ' per retry.');
  }
  render();
}
function carRenewLicence() {
  ensureCarsState();
  if(S.carsLicense.suspendedUntil > gameYear()) {
      log('Your licence is suspended until ' + S.carsLicense.suspendedUntil + '. Cannot renew.'); render(); return;
  }
  const info = CAR_LICENCE[carCountry()] || CAR_LICENCE.egy;
  const cost = Math.round(info.costs['B'] * 0.4);
  if (S.wealth < cost) { log('Renewal costs ' + money(cost) + '.'); render(); return; }
  S.wealth -= cost;
  S.carsLicense.expiresYear = gameYear() + 10;
  S.carsLicense.points = Math.max(0, S.carsLicense.points - 2);
  log('🎫 Licence renewed until ' + S.carsLicense.expiresYear + '.');
  render();
}
function carPayTicketScore() {
    if(S.carsLicense.points <= 0) return;
    const cost = 800 * carRate();
    if(S.wealth < cost) { log('Defensive driving class costs ' + money(cost) + '.'); return; }
    S.wealth -= cost;
    S.carsLicense.points = Math.max(0, S.carsLicense.points - 3);
    log('Took defensive driving class. Points reduced to ' + S.carsLicense.points + '.');
    render();
}
window.carTakeLicenceTest = carTakeLicenceTest;
window.carRenewLicence = carRenewLicence;
window.carPayTicketScore = carPayTicketScore;

/* ---------- CONFIGURATOR ---------- */
function carStartConfig(brand, modelName) {
  ensureCarsState();
  S.carsConfig = {
    brand: brand, model: modelName, trim: 'base', color: 'white',
    interior: 'cloth', options: [], insurance: 'compreh', addons: []
  };
  render();
}
function carConfigSet(key, value) {
  if (!S.carsConfig) return;
  if (key === 'option') {
    const idx = S.carsConfig.options.indexOf(value);
    if (idx >= 0) S.carsConfig.options.splice(idx, 1); else S.carsConfig.options.push(value);
  } else if (key === 'addon') {
    const idx = S.carsConfig.addons.indexOf(value);
    if (idx >= 0) S.carsConfig.addons.splice(idx, 1); else S.carsConfig.addons.push(value);
  } else {
    S.carsConfig[key] = value;
  }
  render();
}
function carCancelConfig() { S.carsConfig = null; S.carsBrandFocus = null; render(); }
window.carStartConfig = carStartConfig;
window.carConfigSet = carConfigSet;
window.carCancelConfig = carCancelConfig;

function carConfigPrice() {
  if (!S.carsConfig) return null;
  const model = carModelById(S.carsConfig.brand, S.carsConfig.model);
  if (!model) return null;
  const baseLocal = carBasePriceLocal(model);
  const trim = CAR_TRIMS.find(function(t) { return t.id === S.carsConfig.trim; }) || CAR_TRIMS[0];
  const color = CAR_COLORS.find(function(c) { return c.id === S.carsConfig.color; }) || CAR_COLORS[0];
  const interior = CAR_INTERIORS.find(function(i) { return i.id === S.carsConfig.interior; }) || CAR_INTERIORS[0];
  const tierMult = carTierMult(model[0]);
  const colorCost = (color.costUSD || 0) * carRate() * tierMult;
  const interiorCost = (interior.costUSD || 0) * carRate() * tierMult;
  let optionsCost = 0;
  S.carsConfig.options.forEach(function(oid) {
    const o = CAR_OPTIONS.find(function(x) { return x.id === oid; });
    if (o && gameYear() >= o.fromYear && (!o.untilYear || gameYear() <= o.untilYear)) {
      optionsCost += o.usd * carRate() * tierMult;
    }
  });
  let addonsCost = 0;
  S.carsConfig.addons.forEach(function(aid) {
    const a = CAR_INSURANCE_ADDONS.find(function(x) { return x.id === aid; });
    if (a) addonsCost += a.annualUSD * carRate();
  });
  const carLocal = Math.round(baseLocal * trim.mult) + Math.round(colorCost) + Math.round(interiorCost) + Math.round(optionsCost);
  const regLocal = Math.round(carLocal * 0.06);
  const tier = CAR_INSURANCE[S.carsConfig.insurance] || CAR_INSURANCE.compreh;
  let insuranceMult = tier.mult;
  if(S.carsLicense && S.carsLicense.points > 0) insuranceMult += (S.carsLicense.points * 0.002);
  const insuranceLocal = Math.round(carLocal * insuranceMult) + Math.round(addonsCost);
  const totalLocal = carLocal + regLocal + insuranceLocal;
  return {
    car: carLocal, base: baseLocal,
    options: Math.round(optionsCost), color: Math.round(colorCost), interior: Math.round(interiorCost),
    registration: regLocal, insurance: insuranceLocal, addons: Math.round(addonsCost),
    total: totalLocal, model: model, trim: trim
  };
}

/* ---------- PURCHASE ---------- */
function carPurchase(method) {
  ensureCarsState();
  if (!S.carsLicense.hasLicense || S.carsLicense.expiresYear < gameYear() || S.carsLicense.suspendedUntil > gameYear()) {
    log('You need a valid, unsuspended licence first.'); render(); return;
  }
  /* v2: garage cap counts only ACTIVE cars (stored cars don't occupy the current garage) */
  if (carActiveCount() >= 4) {
    log('Garage full (4 cars max here). Sell or store one first.'); render(); return;
  }
  const price = carConfigPrice();
  if (!price) { log('No configuration.'); render(); return; }
  const model = price.model;
  const cfg = S.carsConfig;

  if (method === 'cash') {
    if (S.wealth < price.total) { log('Need ' + money(price.total) + ' for cash purchase.'); render(); return; }
    S.wealth -= price.total;
    carRegisterOwned(model, cfg, price, 'cash', price.total, null);
    S.carsConfig = null; S.carsBrandFocus = null; S.carsTab = 'garage';
    render(); return;
  }

  const isSeven = method === 'loan7';
  const downPct = isSeven ? 0.10 : 0.15;
  const months = isSeven ? 84 : 60;
  const downLocal = Math.round(price.car * downPct);
  if (S.wealth < downLocal) { log('Need ' + money(downLocal) + ' for down payment.'); render(); return; }

  const financedLocal = price.car - downLocal;
  const monthlyPayment = carAmortizedMonthly(financedLocal, 0.16, months);

  const monthlyIncome = ((S.job && S.job.salary) || S.income || 0) / 12;
  const creditScore = (S.bank && S.bank.score) || 680;
  const employed = !!S.job;
  let score = 0;
  if (creditScore >= 740) score += 3; else if (creditScore >= 680) score += 2; else if (creditScore >= 620) score += 1; else score -= 1;
  if (employed) score += 2;
  const ratio = monthlyPayment / Math.max(1, monthlyIncome);
  if (ratio <= 0.15) score += 3;
  else if (ratio <= 0.25) score += 1;
  else if (ratio <= 0.35) score -= 1;
  else score -= 4;
  const approvalChance = Math.max(0.05, Math.min(0.95, 0.5 + score * 0.08));
  if (Math.random() > approvalChance) {
    log('❌ Bank declined financing. Improve credit or income, or pay cash.');
    render(); return;
  }

  S.wealth -= downLocal;
  const loanId = 'car_loan_' + Math.random().toString(36).slice(2, 8);
  if (!S.bank) S.bank = {};
  if (!Array.isArray(S.bank.loans)) S.bank.loans = [];
  S.bank.loans.push({
    id: loanId, name: 'Car loan — ' + model[1], loanType: 'car',
    principal: financedLocal, remaining: financedLocal,
    rate: 0.16, monthsLeft: months, monthsTotal: months,
    monthlyPayment: monthlyPayment, startYear: gameYear(),
    missedPayments: 0, linkedCarUid: null
  });
  carRegisterOwned(model, cfg, price, 'loan', downLocal, loanId);
  S.carsConfig = null; S.carsBrandFocus = null; S.carsTab = 'garage';
  render();
}
window.carPurchase = carPurchase;

function carRegisterOwned(model, cfg, price, method, paid, loanId) {
  const uid = 'c' + Math.random().toString(36).slice(2, 8);
  const car = {
    uid: uid, brand: model[0], model: model[1], year: gameYear(),
    trim: cfg.trim, color: cfg.color, interior: cfg.interior,
    options: (cfg.options || []).slice(), cls: model[2],
    msrp: price.car, paid: paid,
    insurance: cfg.insurance, insuranceAddons: (cfg.addons || []).slice(),
    insuranceExpiry: gameYear() + 1, registrationExpiry: gameYear() + 1,
    mileage: 0, condition: 100, age: 0,
    hasLoan: method === 'loan', loanId: loanId || null,
    mods: [], broken: false, repairCost: 0, stolen: false, hpModded: 0, batteryHealth: 100,
    storedIn: null   /* v2: new cars are active in current country */
  };
  if (loanId && S.bank && Array.isArray(S.bank.loans)) {
    const loan = S.bank.loans.find(function(l) { return l.id === loanId; });
    if (loan) loan.linkedCarUid = uid;
  }
  S.cars.push(car);
  fx({ happiness: 8, social: 6 });
  const brandInfo = CAR_BRANDS[model[0]];
  const trimLabel = (CAR_TRIMS.find(function(t){ return t.id === cfg.trim; }) || CAR_TRIMS[0]).label;
  log('🚗 Purchased ' + car.year + ' ' + (brandInfo ? brandInfo.name : model[0]) + ' ' + model[1] + ' (' + trimLabel + ') · ' + money(price.total) + ' total.');
}

/* ---------- SELL ---------- */
function carSell(uid, method) {
  ensureCarsState();
  const idx = S.cars.findIndex(function(c) { return c.uid === uid; });
  if (idx < 0) { log('Car not found.'); render(); return; }
  const car = S.cars[idx];

  if (car.stolen) { log('Cannot sell a stolen car. Wait for police recovery or insurance payout.'); render(); return; }

  /* v2: allow remote sale of stored cars via dealer/auction (private needs the car in person) */
  if (car.storedIn && method === 'private') {
    const cName = COUNTRIES[car.storedIn] ? COUNTRIES[car.storedIn].name : car.storedIn;
    log('❌ Cannot arrange a private sale from ' + cName + '. Use dealer or auction.');
    render(); return;
  }
  if (car.storedIn) {
    const cName = COUNTRIES[car.storedIn] ? COUNTRIES[car.storedIn].name : car.storedIn;
    log('📦 Selling car remotely from ' + cName + '.');
  }

  const valueLocal = carCurrentValueLocal(car);
  let proceedsLocal, successChance;
  if (method === 'dealer') { proceedsLocal = Math.round(valueLocal * 0.90); successChance = 1.0; }
  else if (method === 'private') { proceedsLocal = Math.round(valueLocal * 0.97); successChance = 0.55; }
  else { proceedsLocal = Math.round(valueLocal * (0.85 + Math.random() * 0.20)); successChance = 0.85; }

  if (Math.random() > successChance) { log('No buyer found. Try dealer trade-in instead.'); render(); return; }

  let loanPayoutLocal = 0;
  if (car.hasLoan && car.loanId && S.bank && Array.isArray(S.bank.loans)) {
    const loan = S.bank.loans.find(function(l) { return l.id === car.loanId; });
    if (loan) loanPayoutLocal = Math.round(loan.remaining);
    S.bank.loans = S.bank.loans.filter(function(l) { return l.id !== car.loanId; });
  }
  const netLocal = proceedsLocal - loanPayoutLocal;
  S.wealth += netLocal;
  if (netLocal < 0) log('⚠️ Sold at a loss: ' + money(Math.abs(netLocal)) + ' paid from cash.');
  else log('💵 Sold ' + car.year + ' ' + (CAR_BRANDS[car.brand] ? CAR_BRANDS[car.brand].name : car.brand) + ' ' + car.model + ' for ' + money(netLocal) + '.');
  S.cars.splice(idx, 1);
  render();
}
window.carSell = carSell;

function carSellPrompt(uid) {
  const method = prompt('Sell how?\n\n- "dealer" — fast, 10% fee\n- "private" — 3% fee, ~55% chance buyer\n- "auction" — variable price', 'dealer');
  if (!method) return;
  carSell(uid, method);
}
window.carSellPrompt = carSellPrompt;

/* ---------- REPAIR / RENEW (v2: refuse for stored cars) ---------- */
function carRepair(uid) {
  ensureCarsState();
  const car = S.cars.find(function(c) { return c.uid === uid; });
  if (!car || !car.broken) return;
  if (car.storedIn) {
    const cName = COUNTRIES[car.storedIn] ? COUNTRIES[car.storedIn].name : car.storedIn;
    log('❌ This car is stored in ' + cName + '. Travel there to repair it.');
    render(); return;
  }
  if (S.wealth < car.repairCost) { log('Not enough cash for repair (' + money(car.repairCost) + ').'); render(); return; }
  const cost = car.repairCost;
  S.wealth -= cost;
  car.broken = false;
  car.repairCost = 0;
  car.condition = Math.min(100, car.condition + 20);
  log('🔧 Repaired for ' + money(cost) + '.');
  render();
}
window.carRepair = carRepair;

function carRenewInsurance(uid) {
  ensureCarsState();
  const car = S.cars.find(function(c) { return c.uid === uid; });
  if (!car) return;
  if (car.storedIn) {
    const cName = COUNTRIES[car.storedIn] ? COUNTRIES[car.storedIn].name : car.storedIn;
    log('❌ This car is stored in ' + cName + '. Insurance renews automatically when you return.');
    render(); return;
  }
  const costLocal = carInsuranceYearLocal(car);
  if (S.wealth < costLocal) { log('Not enough for insurance (' + money(costLocal) + ').'); render(); return; }
  S.wealth -= costLocal;
  car.insuranceExpiry = gameYear() + 1;
  log('🛡 Insurance renewed: ' + money(costLocal) + '.');
  render();
}
window.carRenewInsurance = carRenewInsurance;

function carRenewRegistration(uid) {
  ensureCarsState();
  const car = S.cars.find(function(c) { return c.uid === uid; });
  if (!car) return;
  if (car.storedIn) {
    const cName = COUNTRIES[car.storedIn] ? COUNTRIES[car.storedIn].name : car.storedIn;
    log('❌ This car is stored in ' + cName + '. Registration renews when you return.');
    render(); return;
  }
  const costLocal = carRegistrationYearLocal(car);
  if (S.wealth < costLocal) { log('Not enough for registration (' + money(costLocal) + ').'); render(); return; }
  S.wealth -= costLocal;
  car.registrationExpiry = gameYear() + 1;
  log('📝 Registration renewed: ' + money(costLocal) + '.');
  render();
}
window.carRenewRegistration = carRenewRegistration;

/* ---------- MODS ---------- */
function carInstallMod(uid, modId) {
    ensureCarsState();
    const car = S.cars.find(c => c.uid === uid);
    if (!car) return;
    if (car.storedIn) {
      const cName = COUNTRIES[car.storedIn] ? COUNTRIES[car.storedIn].name : car.storedIn;
      log('❌ This car is stored in ' + cName + '. Travel there to install mods.');
      render(); return;
    }
    const mod = CAR_MODS.find(m => m.id === modId);
    if (!mod) return;

    if (car.mods.includes(modId)) { log('Mod already installed.'); return; }

    const isEV = carIsEV(car);
    if(isEV && (modId === 'ecu_tune' || modId === 'intake' || modId === 'exhaust_after' || modId === 'turbo_kit' || modId === 'supercharger' || modId === 'nitrous' || modId === 'engine_swap' || modId === 'forged_internals' || modId === 'perf_camshaft' || modId === 'meth_inject')) {
         log('Cannot install this mod on an Electric Vehicle.'); render(); return;
    }

    const costLocal = Math.round(mod.usd * carRate());
    if (S.wealth < costLocal) { log('Need ' + money(costLocal) + ' for ' + mod.label); render(); return; }

    S.wealth -= costLocal;
    car.mods.push(modId);
    if(mod.hpGain) car.hpModded += mod.hpGain;

    if(mod.hap || mod.soc) fx({ happiness: mod.hap || 0, social: mod.soc || 0 });

    log('🛠 Installed ' + mod.label + ' on ' + car.model + ' for ' + money(costLocal) + '.');
    render();
}
window.carInstallMod = carInstallMod;

/* ---------- USED MARKET ---------- */
function carGenerateUsedMarket() {
  const year = gameYear();
  const country = carCountry();
  const brandKeys = Object.keys(CAR_BRANDS);
  const listings = [];
  const n = 8 + Math.floor(Math.random() * 8);
  for (let i = 0; i < n; i++) {
    const brandKey = brandKeys[Math.floor(Math.random() * brandKeys.length)];
    const models = carModelsByBrand(brandKey, year).filter(function(m) { return carModelInMarket(m, country); });
    if (!models.length) continue;
    const model = models[Math.floor(Math.random() * models.length)];
    const age = 2 + Math.floor(Math.random() * 15);
    if (year - age < model[14]) continue;
    const condition = 40 + Math.floor(Math.random() * 55);
    const mileage = age * (8000 + Math.floor(Math.random() * 12000));
    const baseLocal = carBasePriceLocal(model);
    let priceLocal = Math.round(baseLocal * carDepreciationFactor(age) * (0.6 + 0.4 * condition / 100) * (0.85 + Math.random() * 0.25));
    if (priceLocal < 1000) priceLocal = 1000;

    let preModded = [];
    if(Math.random() < 0.2 && !model[17]) {
         const possibleMods = ['tint_premium', 'exhaust_after', 'wheels_custom', 'wrap'];
         preModded.push(possibleMods[Math.floor(Math.random() * possibleMods.length)]);
         priceLocal += 500 * carRate();
    }

    listings.push({
      id: 'used_' + Math.random().toString(36).slice(2, 8),
      brand: brandKey, model: model[1], year: year - age, age: age,
      condition: condition, mileage: mileage, priceLocal: priceLocal, mods: preModded
    });
  }
  return listings;
}
function carBuyUsed(listingId) {
  /* v2: active-only garage cap */
  if (carActiveCount() >= 4) { log('Garage full.'); render(); return; }
  if (!S.carsLicense.hasLicense || S.carsLicense.suspendedUntil > gameYear()) { log('You need a valid licence first.'); render(); return; }
  const idx = S.carsUsedMarket.findIndex(function(l) { return l.id === listingId; });
  if (idx < 0) return;
  const listing = S.carsUsedMarket[idx];
  if (S.wealth < listing.priceLocal) { log('Need ' + money(listing.priceLocal) + '.'); render(); return; }
  S.wealth -= listing.priceLocal;
  const model = carModelById(listing.brand, listing.model);
  S.cars.push({
    uid: 'c' + Math.random().toString(36).slice(2, 8),
    brand: listing.brand, model: listing.model, year: listing.year,
    trim: 'base', color: 'white', interior: 'cloth',
    options: [], cls: model[2],
    msrp: carBasePriceLocal(model), paid: listing.priceLocal,
    insurance: 'tp', insuranceAddons: [],
    insuranceExpiry: gameYear() + 1, registrationExpiry: gameYear() + 1,
    mileage: listing.mileage, condition: listing.condition, age: listing.age,
    hasLoan: false, loanId: null, mods: listing.mods || [], broken: false, repairCost: 0,
    hpModded: 0, batteryHealth: model[17] ? Math.max(50, 100 - (listing.age * 2)) : 100,
    storedIn: null
  });
  S.carsUsedMarket.splice(idx, 1);
  fx({ happiness: 5 });
  log('🚗 Bought used ' + listing.year + ' ' + (CAR_BRANDS[listing.brand] ? CAR_BRANDS[listing.brand].name : listing.brand) + ' ' + listing.model + ' for ' + money(listing.priceLocal) + '.');
  render();
}
window.carBuyUsed = carBuyUsed;

/* ---------- SUB-TABS ---------- */
function carSetTab(tab) {
  S.carsTab = tab;
  S.carsBrandFocus = null;
  S.carsConfig = null;
  render();
}
window.carSetTab = carSetTab;

function carOpenBrand(brandKey) {
  S.carsBrandFocus = brandKey;
  S.carsConfig = null;
  render();
}
window.carOpenBrand = carOpenBrand;

function carBackToBrands() {
  S.carsBrandFocus = null;
  S.carsConfig = null;
  render();
}
window.carBackToBrands = carBackToBrands;

/* ---------- MAIN VIEW ---------- */
function carsView() {
  ensureCarsState();
  if (S.age < 16) {
    return '<div class="card"><h3>🚗 Cars</h3><p class="muted">Available from age 16+ (licence age varies by country).</p></div>';
  }
  const tabs = [
    ['browse', '🆕 Browse'],
    ['used',   '🔄 Used'],
    ['rent',   '🔑 Rent'],
    ['garage', '🅿️ Garage (' + S.cars.length + ')'],
    ['license','🎫 License']
  ];
  const isLicensed = S.carsLicense.hasLicense && S.carsLicense.expiresYear >= gameYear() && S.carsLicense.suspendedUntil <= gameYear();
  let statusStr = '⚠️ No licence';
  if(S.carsLicense.suspendedUntil > gameYear()) statusStr = '🚫 Suspended';
  else if (isLicensed) statusStr = '🎫 Licensed driver';

  /* v2: show storage breakdown in header */
  const activeCount = carActiveCount();
  const storedCount = S.cars.length - activeCount;

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#3b82f615 0%,transparent 100%);border-color:#3b82f6">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">CARS · ' + C().name.toUpperCase() + ' ' + gameYear() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + statusStr + '</div>' +
    (storedCount > 0 ? '<div class="muted small" style="margin-top:2px">' + activeCount + ' here · ' + storedCount + ' stored abroad</div>' : '') +
    '</div>' +
    '<div style="font-size:2rem">🚗</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (S.carsTab === t[0] && !S.carsConfig && !S.carsBrandFocus ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="carSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

  if (S.carsConfig) html += carRenderConfigurator();
  else if (S.carsTab === 'browse' && S.carsBrandFocus) html += carRenderBrandFocus();
  else if (S.carsTab === 'browse') html += carRenderBrowse();
  else if (S.carsTab === 'used') html += carRenderUsed();
  else if (S.carsTab === 'rent') html += carRenderRent();
  else if (S.carsTab === 'garage') html += carRenderGarage();
  else if (S.carsTab === 'license') html += carRenderLicense();
  return html;
}

/* ---------- LICENSE RENDER ---------- */
function carRenderLicense() {
  const info = CAR_LICENCE[carCountry()] || CAR_LICENCE.egy;
  const status = carLicenceStatus();
  let html = '<div class="card"><h3>🎫 Driving Licence</h3>';
  if (status === 'none') {
    html += '<p class="muted small">You must hold a valid licence before buying, registering, or driving a car.</p>';
    html += '<div class="row"><span>Category B (car)</span><b>' + money(info.costs.B) + '</b></div>';
    html += '<div class="row"><span>Age required</span><b>' + (info.ageMin.B || 18) + '+</b></div>';
    html += '<div class="row"><span>Attempts used</span><b>' + S.carsLicense.attempts + ' / 4</b></div>';
    html += '<div class="row"><span>Pass chance</span><b>' + Math.round(info.passBase * 100) + '% + smarts bonus</b></div>';
    html += '<button class="opt" style="margin-top:10px;background:#3b82f6;color:#fff;text-align:center;font-weight:700" onclick="carTakeLicenceTest()">Take driving test (' + money(info.costs.B) + ')</button>';
  } else if (status === 'suspended') {
    html += '<p class="small" style="color:#fb7185">🚫 Your licence is suspended until ' + S.carsLicense.suspendedUntil + ' due to traffic violations.</p>';
    html += '<p class="muted small">You cannot legally drive or purchase cars during this time.</p>';
  } else if (status === 'expired') {
    html += '<p class="small" style="color:#fb7185">⚠️ Your licence expired in ' + S.carsLicense.expiresYear + '.</p>';
    html += '<button class="opt" style="margin-top:10px;background:#3b82f6;color:#fff;text-align:center;font-weight:700" onclick="carRenewLicence()">Renew licence (' + money(Math.round(info.costs.B * 0.4)) + ')</button>';
  } else {
    html += '<p class="small" style="color:#34d399">✅ Valid until ' + S.carsLicense.expiresYear + '</p>';
    html += '<div class="row"><span>Category</span><b>' + S.carsLicense.category + '</b></div>';
    html += '<div class="row"><span>Issued</span><b>' + S.carsLicense.issuedYear + '</b></div>';
    html += '<div class="row"><span>Expires</span><b>' + S.carsLicense.expiresYear + '</b></div>';
    html += '<div class="row"><span>Penalty Points</span><b style="color:' + (S.carsLicense.points > 6 ? '#fb7185' : (S.carsLicense.points > 0 ? '#fbbf24' : '#34d399')) + '">' + S.carsLicense.points + ' / 12</b></div>';

    if(S.carsLicense.points > 0) {
        html += '<p class="muted small" style="margin-top:8px">Points increase your insurance rates. Reach 12 points and your licence will be suspended.</p>';
        html += '<button class="opt" style="margin-top:6px;text-align:center" onclick="carPayTicketScore()">Take Defensive Driving Class (-3 pts, ' + money(800 * carRate()) + ')</button>';
    }
  }
  html += '</div>';
  return html;
}

/* ---------- BROWSE ---------- */
function carRenderBrowse() {
  /* v2: only active cars count toward garage cap */
  if (carActiveCount() >= 4) return '<div class="card"><h3>🅿️ Garage full</h3><p class="muted">You have 4 active cars in ' + C().name + '. Sell or store one to buy another. (Stored cars elsewhere don\'t count toward this limit.)</p></div>';
  const year = gameYear();
  const brandKeys = Object.keys(CAR_BRANDS).filter(function(k) {
    return carModelsByBrand(k, year).filter(function(m) { return carModelInMarket(m, carCountry()); }).length > 0;
  });
  let html = '<div class="card"><h3>🆕 Browse New Cars</h3><p class="muted small">' + brandKeys.length + ' brands · ' + year + ' · ' + C().name + '</p></div>';
  brandKeys.forEach(function(k) {
    const brand = CAR_BRANDS[k];
    const models = carModelsByBrand(k, year).filter(function(m) { return carModelInMarket(m, carCountry()); });
    const cheapest = Math.min.apply(null, models.map(function(m) { return carBasePriceLocal(m); }));
    html += '<div class="card" style="padding:10px;cursor:pointer" onclick="carOpenBrand(\'' + k + '\')">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      carBrandBadge(k, 40) +
      '<div style="flex:1"><div style="font-weight:700">' + brand.name + '</div>' +
      '<div class="muted small">' + models.length + ' models · from ' + money(cheapest) + '</div></div>' +
      '<div class="muted">›</div></div></div>';
  });
  return html;
}

function carRenderBrandFocus() {
  const brandKey = S.carsBrandFocus;
  const brand = CAR_BRANDS[brandKey];
  if (!brand) return carRenderBrowse();
  const year = gameYear();
  const models = carModelsByBrand(brandKey, year).filter(function(m) { return carModelInMarket(m, carCountry()); });
  let html = '<div class="card" style="padding:10px">' +
    '<div style="display:flex;align-items:center;gap:10px">' +
    '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="carBackToBrands()">← Brands</button>' +
    carBrandBadge(brandKey, 36) +
    '<div style="flex:1"><div style="font-weight:700">' + brand.name + '</div>' +
    '<div class="muted small">' + models.length + ' models · ' + year + '</div></div></div></div>';
  models.forEach(function(m) {
    const baseLocal = carBasePriceLocal(m);
    const cls = CAR_CLASSES[m[2]] || CAR_CLASSES.compact;
    const fuel = m[17] ? '⚡ Electric' : (m[16] && year >= m[16] ? '🔋 Hybrid' : '⛽ Petrol');
    html += '<div class="card" style="padding:10px">' +
      '<div style="display:flex;justify-content:space-between;gap:8px">' +
      '<div style="min-width:0;flex:1"><b>' + m[1] + '</b>' +
      '<div class="muted small">' + cls.label + ' · ' + fuel + ' · ' + m[6] + ' hp</div></div>' +
      '<div style="text-align:right"><div style="font-weight:700">' + money(baseLocal) + '</div>' +
      '<div class="muted" style="font-size:.68rem">from</div></div></div>' +
      '<button class="opt" style="margin-top:8px;text-align:center;padding:6px;font-size:.78rem" onclick="carStartConfig(\'' + brandKey + '\',\'' + m[1] + '\')">Configure & buy</button>' +
      '</div>';
  });
  return html;
}

/* ---------- CONFIGURATOR ---------- */
function carRenderConfigurator() {
  const cfg = S.carsConfig;
  const price = carConfigPrice();
  if (!price) { S.carsConfig = null; return ''; }
  const model = price.model;
  const brand = CAR_BRANDS[cfg.brand];

  const trimBtns = CAR_TRIMS.map(function(t) {
    return '<button class="pill ' + (cfg.trim === t.id ? 'on' : '') + '" style="padding:6px;font-size:.7rem;text-align:center" onclick="carConfigSet(\'trim\',\'' + t.id + '\')">' + t.label + '</button>';
  }).join('');
  const colorBtns = CAR_COLORS.filter(function(c) {
    return !c.brandOnly || c.brandOnly.indexOf(cfg.brand) >= 0;
  }).map(function(c) {
    const cost = (c.costUSD || 0) * carRate() * carTierMult(cfg.brand);
    return '<button title="' + c.label + (cost ? ' (+' + money(cost) + ')' : '') + '" onclick="carConfigSet(\'color\',\'' + c.id + '\')" style="width:32px;height:32px;border-radius:50%;background:' + c.hex + ';border:3px solid ' + (cfg.color === c.id ? '#8b5cf6' : '#25253a') + ';cursor:pointer"></button>';
  }).join('');
  const intBtns = CAR_INTERIORS.map(function(i) {
    return '<button class="pill ' + (cfg.interior === i.id ? 'on' : '') + '" style="padding:6px;font-size:.68rem" onclick="carConfigSet(\'interior\',\'' + i.id + '\')">' + i.label + '</button>';
  }).join('');
  const optChecks = CAR_OPTIONS.filter(function(o) {
    return gameYear() >= o.fromYear && (!o.untilYear || gameYear() <= o.untilYear);
  }).map(function(o) {
    if(o.cat === 'EV' && !model[17]) return '';
    if(o.cat !== 'EV' && model[17] && (o.id === 'sport_exhaust')) return '';

    const on = cfg.options.indexOf(o.id) >= 0;
    const cost = o.usd * carRate() * carTierMult(cfg.brand);
    return '<label class="muted small" style="display:flex;align-items:center;gap:6px;padding:6px;border:1px solid #25253a;border-radius:6px;margin-top:4px;cursor:pointer">' +
      '<input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="carConfigSet(\'option\',\'' + o.id + '\')">' +
      '<span style="flex:1">' + o.label + '</span><b>+' + money(cost) + '</b></label>';
  }).join('');
  const insBtns = Object.keys(CAR_INSURANCE).map(function(k) {
    return '<button class="pill ' + (cfg.insurance === k ? 'on' : '') + '" style="padding:6px;font-size:.68rem" onclick="carConfigSet(\'insurance\',\'' + k + '\')">' + CAR_INSURANCE[k].label + '</button>';
  }).join('');
  const addonChecks = CAR_INSURANCE_ADDONS.map(function(a) {
    const on = cfg.addons.indexOf(a.id) >= 0;
    return '<label class="muted small" style="display:flex;align-items:center;gap:6px;padding:4px;cursor:pointer">' +
      '<input type="checkbox" ' + (on ? 'checked' : '') + ' onchange="carConfigSet(\'addon\',\'' + a.id + '\')">' +
      '<span style="flex:1">' + a.label + '</span><b>+' + money(a.annualUSD * carRate()) + '/yr</b></label>';
  }).join('');

  const canCash = S.wealth >= price.total;
  const isLicensed = S.carsLicense.hasLicense && S.carsLicense.expiresYear >= gameYear() && S.carsLicense.suspendedUntil <= gameYear();

  return '<div class="card" style="border-color:#8b5cf6">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
    '<div style="display:flex;align-items:center;gap:10px">' + carBrandBadge(cfg.brand, 40) +
    '<div><div style="font-weight:700">' + (brand ? brand.name : cfg.brand) + ' ' + cfg.model + '</div>' +
    '<div class="muted small">' + gameYear() + ' · ' + (CAR_CLASSES[model[2]] ? CAR_CLASSES[model[2]].label : model[2]) + '</div></div></div>' +
    '<button class="opt" style="padding:4px 8px;font-size:.7rem;background:transparent;border:1px solid #25253a;color:#888" onclick="carCancelConfig()">✕ Cancel</button></div>' +

    '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:10px">Trim</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px">' + trimBtns + '</div>' +

    '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:10px">Colour</h4>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">' + colorBtns + '</div>' +

    '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:10px">Interior</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px">' + intBtns + '</div>' +

    '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:10px">Options</h4>' + optChecks +

    '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:10px">Insurance</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px">' + insBtns + '</div>' +
    '<div style="margin-top:6px"><div class="muted small" style="margin-bottom:4px">Add-ons (annual):</div>' + addonChecks + '</div>' +

    '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">' +
    '<h4 style="font-size:.85rem;color:#8b5cf6">💰 Price Breakdown</h4>' +
    '<div class="row"><span>Base</span><b>' + money(price.base) + '</b></div>' +
    '<div class="row"><span>+ Trim (' + price.trim.label + ')</span><b>+' + money(Math.max(0, price.car - price.base - price.color - price.interior - price.options)) + '</b></div>' +
    '<div class="row"><span>+ Colour</span><b>+' + money(price.color) + '</b></div>' +
    '<div class="row"><span>+ Interior</span><b>+' + money(price.interior) + '</b></div>' +
    '<div class="row"><span>+ Options</span><b>+' + money(price.options) + '</b></div>' +
    '<div class="row"><span>+ Registration & tax (6%)</span><b>+' + money(price.registration) + '</b></div>' +
    '<div class="row"><span>+ Insurance' + (S.carsLicense.points > 0 ? ' (penalty)' : '') + '</span><b>+' + money(price.insurance) + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>On the road total</b><b style="color:#34d399">' + money(price.total) + '</b></div>' +
    '</div>' +

    '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:12px">Purchase</h4>' +
    (isLicensed ? '' : '<p class="small" style="color:#fb7185">⚠️ You need a valid licence before buying. Get one in the License tab.</p>') +
    '<button class="opt" style="margin-top:6px;background:' + (canCash && isLicensed ? '#34d399' : '#25253a') + ';color:' + (canCash && isLicensed ? '#000' : '#666') + ';font-weight:700;text-align:center" ' + (canCash && isLicensed ? '' : 'disabled') + ' onclick="carPurchase(\'cash\')">💵 Pay cash · ' + money(price.total) + '</button>' +
    '<button class="opt" style="margin-top:6px;text-align:center" ' + (isLicensed ? '' : 'disabled') + ' onclick="carPurchase(\'loan5\')">🏦 Loan 5yr · 15% down</button>' +
    '<button class="opt" style="margin-top:6px;text-align:center" ' + (isLicensed ? '' : 'disabled') + ' onclick="carPurchase(\'loan7\')">🏦 Loan 7yr · 10% down</button>' +
    '</div>';
}

/* ---------- USED ---------- */
function carRenderUsed() {
  if (S.carsUsedMarketYear !== gameYear() || !S.carsUsedMarket.length) {
    S.carsUsedMarket = carGenerateUsedMarket();
    S.carsUsedMarketYear = gameYear();
  }
  if (!S.carsUsedMarket.length) return '<div class="card"><h3>🔄 Used Market</h3><p class="muted">No listings currently. Try next year.</p></div>';
  let html = '<div class="card"><h3>🔄 Used Cars on Market</h3><p class="muted small">' + gameYear() + ' · ' + S.carsUsedMarket.length + ' listings</p></div>';
  S.carsUsedMarket.forEach(function(listing) {
    const brand = CAR_BRANDS[listing.brand];
    if (!brand) return;
    const model = carModelById(listing.brand, listing.model);
    const pctOfNew = model ? Math.round(listing.priceLocal / carBasePriceLocal(model) * 100) : 0;
    const modStr = (listing.mods && listing.mods.length) ? ' · <span style="color:#fbbf24">Modified</span>' : '';
    html += '<div class="card" style="padding:10px">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      carBrandBadge(listing.brand, 36) +
      '<div style="flex:1"><div style="font-weight:700">' + listing.year + ' ' + brand.name + ' ' + listing.model + '</div>' +
      '<div class="muted small">' + listing.age + 'y · ' + listing.mileage.toLocaleString() + ' km · cond ' + listing.condition + '%' + modStr + '</div></div>' +
      '<div style="text-align:right"><div style="font-weight:700;color:#fbbf24">' + money(listing.priceLocal) + '</div>' +
      '<div class="muted" style="font-size:.68rem">' + pctOfNew + '% of new</div></div></div>' +
      '<button class="opt" style="margin-top:8px;text-align:center" onclick="carBuyUsed(\'' + listing.id + '\')">Buy used · ' + money(listing.priceLocal) + '</button>' +
      '</div>';
  });
  return html;
}

/* ---------- RENT ---------- */
function carRenderRent() {
  const rates = { econ: 500, compact: 700, mid: 1000, suv: 1400, van: 1500, truck: 1600, lux: 2500, sport: 3000, exec: 4500, hyper: 15000 };
  const rateMult = carCountry() === 'egy' ? 1 : carCountry() === 'usa' ? 40 : 15;
  let html = '<div class="card"><h3>🔑 Rent a Car</h3><p class="muted small">Daily rates (approximate).</p>';
  Object.entries(rates).forEach(function([cls, base]) {
    const rate = Math.round(base * rateMult);
    const label = CAR_CLASSES[cls] ? CAR_CLASSES[cls].label : cls;
    html += '<div class="row"><span>' + label + '</span><b>' + money(rate) + ' / day</b></div>';
  });
  html += '<p class="muted small" style="margin-top:10px">Renting is useful for weekend trips, or when your car breaks down. (Full rental system coming in phase 2.)</p></div>';
  return html;
}

/* ---------- GARAGE & MODS (v2: split active vs stored) ---------- */
function carRenderModMenu(car) {
    if(!car || car.storedIn) return '';
    let html = '<div style="margin-top:12px;padding-top:12px;border-top:1px dashed #25253a"><h4 style="font-size:.85rem;color:#8b5cf6">🛠 Modifications</h4>';
    const installed = car.mods || [];
    const isEV = carIsEV(car);

    if(installed.length > 0) {
        html += '<div class="muted small">Installed:</div><div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px">';
        installed.forEach(mid => {
            const m = CAR_MODS.find(x => x.id === mid);
            if(m) html += '<span style="background:#25253a;padding:2px 6px;border-radius:4px;font-size:.7rem">' + m.label + '</span>';
        });
        html += '</div>';
    }

    const available = CAR_MODS.filter(m => !installed.includes(m.id));
    if(available.length === 0) {
        html += '<div class="muted small">All available mods installed.</div>';
    } else {
        html += '<select id="mod_select_' + car.uid + '" style="width:100%;margin-bottom:6px;background:#0f0f1a;color:#fff;border:1px solid #25253a;padding:6px;border-radius:4px">';
        html += '<option value="">-- Select Mod to Install --</option>';
        available.forEach(m => {
            if(isEV && (m.id === 'ecu_tune' || m.id === 'intake' || m.id === 'exhaust_after' || m.id === 'turbo_kit' || m.id === 'supercharger' || m.id === 'nitrous' || m.id === 'engine_swap' || m.id === 'forged_internals' || m.id === 'perf_camshaft' || m.id === 'meth_inject')) {
                return;
            }
            html += '<option value="' + m.id + '">' + m.label + ' - ' + money(Math.round(m.usd * carRate())) + '</option>';
        });
        html += '</select>';
        html += '<button class="opt" style="text-align:center;padding:6px;font-size:.75rem" onclick="const s=document.getElementById(\'mod_select_' + car.uid + '\'); if(s.value) carInstallMod(\'' + car.uid + '\', s.value);">Install Selected Mod</button>';
    }
    html += '</div>';
    return html;
}

function carShapeSvg(car) {
  const brand = CAR_BRANDS[car.brand];
  const paint = brand && /^#[0-9a-fA-F]{3,8}$/.test(brand.color) ? brand.color : '#73818b';
  return '<svg viewBox="0 0 120 54" width="88" height="42" role="img" aria-label="Car illustration" style="flex:none;filter:drop-shadow(0 4px 4px #0008)">' +
    '<ellipse cx="60" cy="46" rx="48" ry="5" fill="#0005"/><path d="M15 36l5-12q2-5 8-6l14-2 10-10h24l15 10 12 4 5 16-4 6H17z" fill="' + paint + '" stroke="#ffffff40" stroke-width="1.5"/>' +
    '<path d="M47 18l8-9h18l12 9z" fill="#b9d5df" stroke="#26333a" stroke-width="2"/><path d="M58 10v8" stroke="#53666c" stroke-width="1.5"/>' +
    '<circle cx="34" cy="40" r="8" fill="#16181b"/><circle cx="34" cy="40" r="3.5" fill="#b8bec2"/><circle cx="91" cy="40" r="8" fill="#16181b"/><circle cx="91" cy="40" r="3.5" fill="#b8bec2"/>' +
    '<path d="M18 31h7m86 0h-5" stroke="#f4e7bf" stroke-width="3" stroke-linecap="round"/></svg>';
}

/* v2: render a single garage card — with `isStored` flag controlling visible actions */
function carRenderGarageCard(car, isStored) {
  const brand = CAR_BRANDS[car.brand];
  const modelDef = carModelById(car.brand, car.model);
  const valueLocal = carCurrentValueLocal(car);
  const loan = car.hasLoan && car.loanId && S.bank && Array.isArray(S.bank.loans)
    ? S.bank.loans.find(function(l) { return l.id === car.loanId; }) : null;
  const condColor = car.condition > 70 ? '#34d399' : car.condition > 40 ? '#fbbf24' : '#fb7185';
  const trimLabel = (CAR_TRIMS.find(function(t) { return t.id === car.trim; }) || CAR_TRIMS[0]).label;
  const storedName = isStored && COUNTRIES[car.storedIn] ? COUNTRIES[car.storedIn].name : car.storedIn;

  let html = '<div class="card" style="border-left:3px solid ' + condColor + (isStored ? ';opacity:.9' : '') + '">' +
    '<div style="display:flex;align-items:center;gap:10px">' +
    carShapeSvg(car) + carBrandBadge(car.brand, 34) +
    '<div style="flex:1"><div style="font-weight:700">' + car.year + ' ' + (brand ? brand.name : car.brand) + ' ' + car.model + '</div>' +
    '<div class="muted small">' + trimLabel + ' · ' + car.age + 'y · ' + car.mileage.toLocaleString() + ' km</div></div>' +
    '<div style="text-align:right"><div style="font-weight:700;color:' + condColor + '">' + car.condition + '%</div>' +
    '<div class="muted" style="font-size:.68rem">condition</div></div></div>' +
    '<div style="margin-top:10px;height:5px;background:#25253a;border-radius:3px;overflow:hidden">' +
    '<div style="height:100%;width:' + car.condition + '%;background:' + condColor + '"></div></div>';

  /* Stored banner */
  if (isStored) {
    html += '<div style="margin-top:10px;padding:8px;background:#0f0f1a;border:1px dashed #444;border-radius:6px">' +
      '<b style="color:#fbbf24;font-size:.8rem">📦 Parked in ' + storedName + '</b>' +
      '<div class="muted small" style="margin-top:2px">No ongoing costs. Reactivates when you return to ' + storedName + '.</div>' +
      '</div>';
  }

  if(car.stolen) {
      html += '<div style="margin-top:12px;padding:12px;background:#fb718520;border:1px solid #fb7185;border-radius:6px;text-align:center"><b style="color:#fb7185">🚨 STOLEN</b><p class="muted small">Police have been notified. Awaiting recovery or insurance payout.</p></div></div>';
      return html;
  }

  html += '<div class="row" style="margin-top:10px"><span>Market value</span><b>' + money(valueLocal) + '</b></div>';

  if (!isStored) {
    const insuranceCost = carInsuranceYearLocal(car);
    const maintCost = carMaintenanceYearLocal(car);
    const fuelCost = carFuelCostYearLocal(car);
    html += '<div class="row"><span>Annual costs (maint + ins + fuel)</span><b>' + money(maintCost + insuranceCost + fuelCost) + '</b></div>';
  } else {
    html += '<div class="row"><span>Annual costs</span><b class="good">None (stored)</b></div>';
  }

  html += '<div class="row"><span>Total Power</span><b>' + carTotalHP(car) + ' hp' + (car.hpModded ? ' <span style="color:#fbbf24">(+' + car.hpModded + ' mod)</span>' : '') + '</b></div>';

  if(modelDef && modelDef[17]) {
      const batColor = car.batteryHealth > 80 ? '#34d399' : car.batteryHealth > 60 ? '#fbbf24' : '#fb7185';
      html += '<div class="row"><span>Battery Health</span><b style="color:' + batColor + '">' + Math.round(car.batteryHealth) + '%</b></div>';
  }

  html += '<div class="row"><span>Insurance</span><b>' + (CAR_INSURANCE[car.insurance] || CAR_INSURANCE.compreh).label + '</b></div>';

  if (!isStored) {
    html += '<div class="row"><span>Insurance expires</span><b style="color:' + (car.insuranceExpiry <= gameYear() ? '#fb7185' : 'inherit') + '">' + car.insuranceExpiry + '</b></div>' +
      '<div class="row"><span>Registration expires</span><b style="color:' + (car.registrationExpiry <= gameYear() ? '#fb7185' : 'inherit') + '">' + car.registrationExpiry + '</b></div>';
  }

  if(car.broken) {
      if (isStored) {
          html += '<div style="margin-top:8px;padding:8px;background:#fb718520;border-left:3px solid #fb7185;border-radius:6px"><b style="font-size:.82rem;color:#fb7185">🔧 Broken down</b><div class="muted small">Travel to ' + storedName + ' to repair.</div></div>';
      } else {
          html += '<div style="margin-top:8px;padding:8px;background:#fb718520;border-left:3px solid #fb7185;border-radius:6px"><b style="font-size:.82rem;color:#fb7185">🔧 Broken down</b><div class="muted small">Repair: ' + money(car.repairCost) + '</div><button class="opt" style="margin-top:6px;background:#fb7185;color:#fff" onclick="carRepair(\'' + car.uid + '\')">Repair</button></div>';
      }
  }

  if(loan) {
      html += '<div style="margin-top:8px;padding:8px;background:#fbbf2420;border-left:3px solid #fbbf24;border-radius:6px"><b style="font-size:.82rem;color:#fbbf24">💳 Active loan</b><div class="muted small">' + money(loan.remaining) + ' remaining · ' + money(loan.monthlyPayment) + '/mo · ' + loan.monthsLeft + ' months left</div></div>';
  }

  if (!isStored) {
    html += carRenderModMenu(car);
    html += '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="carRenewRegistration(\'' + car.uid + '\')">Renew Reg.</button>' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="carRenewInsurance(\'' + car.uid + '\')">Renew Ins.</button>' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;background:#451a1f;color:#fb7185;border-color:#fb7185" onclick="carSellPrompt(\'' + car.uid + '\')">Sell</button>' +
      '</div>';
  } else {
    html += '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;background:#451a1f;color:#fb7185;border-color:#fb7185" onclick="carSellPrompt(\'' + car.uid + '\')">Sell remotely</button>' +
      '</div>';
  }

  html += '</div>';
  return html;
}

function carRenderGarage() {
  if (!S.cars.length) return '<div class="card"><h3>🅿️ Garage</h3><p class="muted">Empty. Browse new or used to buy.</p></div>';

  const active = S.cars.filter(function(c) { return !c.storedIn; });
  const stored = S.cars.filter(function(c) { return !!c.storedIn; });

  let html = '';

  if (active.length) {
    if (stored.length) {
      html += '<div class="card" style="padding:8px;border-color:#3b82f6"><b style="color:#3b82f6;font-size:.85rem">🅿️ In Your Garage Here (' + active.length + ')</b></div>';
    }
    active.forEach(function(car) { html += carRenderGarageCard(car, false); });
  }

  if (stored.length) {
    html += '<div class="card" style="padding:10px;border-color:#666;background:#0a0a12">' +
      '<b style="color:#fbbf24;font-size:.85rem">📦 Parked Abroad (' + stored.length + ')</b>' +
      '<p class="muted small" style="margin-top:4px">Cars stored in other countries. They incur no costs while parked. Travel to a country to reactivate its cars.</p>' +
      '</div>';
    stored.forEach(function(car) { html += carRenderGarageCard(car, true); });
  }

  return html;
}

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureCarsState();
  if (S.age < 16) return;
  const year = gameYear();

  if (S.carsLicense.suspendedUntil === year) {
      log('Your driving licence suspension has been lifted.');
  }

  if (S.carsLicense.hasLicense && S.carsLicense.expiresYear < year && S.carsLicense.suspendedUntil <= year) {
    log('⚠️ Your driving licence expired. Renew in Cars → License tab.');
  }

  S.cars.forEach(function(car) {

    /* v2: Stored cars are frozen — only age increments. No mileage,
       no condition decay, no insurance/registration renewal, no
       breakdown checks, no random events, no costs. Reactivated
       automatically when the player returns to that country
       (countryChanged hook in 00-engine.js sets storedIn = null). */
    if (car.storedIn) {
      car.age++;
      return;
    }

    if(car.stolen) {
        if(Math.random() < 0.3) {
            car.stolen = false;
            car.condition -= 20;
            log('🚓 Police recovered your stolen ' + car.model + '! It has some damage.');
        } else if (car.insurance === 'compreh' || car.insurance === 'compreh_pl' || car.insurance === 'tp_fire') {
             const val = carCurrentValueLocal(car);
             S.wealth += val;
             log('🛡 Insurance paid out ' + money(val) + ' for your unrecovered stolen ' + car.model + '.');
             S.cars = S.cars.filter(c => c.uid !== car.uid);
             return;
        } else {
             log('Your stolen ' + car.model + ' is still missing. No insurance coverage.');
        }
    }

    car.age++;
    car.mileage += (S.carsKmPerYear || 12000) + Math.floor(Math.random() * 4000);
    const brand = CAR_BRANDS[car.brand];
    const relFactor = brand ? (11 - brand.reliability) / 10 : 0.5;
    const decay = 1 + Math.floor(Math.random() * 2) + (car.age > 8 ? 2 : 0) + relFactor * 2;
    car.condition = Math.max(10, car.condition - decay);

    if(carIsEV(car)) {
        car.batteryHealth -= (0.5 + Math.random() * 1.5);
        if(car.batteryHealth < 50) car.batteryHealth = 50;
    }

            if (!car.stolen) {
        /* Insurance charge handled by chargeHousehold — only track expiry */
        if (car.insuranceExpiry < year && car.insurance !== 'none') {
          car.insuranceExpiry = year + 1;
        }
          if (car.registrationExpiry < year) {
          car.registrationExpiry = year + 1;
        }

        const bChance = 0.02 + car.age * 0.008 + (car.condition < 50 ? 0.10 : 0) + (brand ? (11 - brand.reliability) * 0.01 : 0.03);
        if (!car.broken && Math.random() < bChance) {
          const cls = CAR_CLASSES[car.cls] || CAR_CLASSES.compact;
          car.broken = true;
           if (typeof emitSignal === 'function') emitSignal('carBroken', { car: car });
          car.repairCost = Math.round(cls.maintenance * carRate() * (0.8 + Math.random() * 1.5));
          log('⚠️ ' + (brand ? brand.name : car.brand) + ' ' + car.model + ' broke down. Repair: ' + money(car.repairCost));
        }

        if(Math.random() < 0.15) {
            const validEvents = CAR_EVENTS.filter(e => {
                if(e.requiresClass && !e.requiresClass.includes(car.cls)) return false;
                if(e.requiresSpouse && !S.hasSpouse) return false;
                if(e.requiresInsurance && car.insuranceExpiry >= year) return false;
                if(e.requiresRegistration && car.registrationExpiry >= year) return false;
                if(e.requiresEV && !carIsEV(car)) return false;
                if(e.requiresICE && carIsEV(car)) return false;
                return true;
            });

            if(validEvents.length > 0) {
                let totalWeight = validEvents.reduce((sum, e) => sum + e.weight, 0);
                let rand = Math.random() * totalWeight;
                let selectedEvent = validEvents[0];
                for (let e of validEvents) {
                    if (rand < e.weight) { selectedEvent = e; break; }
                    rand -= e.weight;
                }

                if(selectedEvent.choice) {
                     log('🚗 Event: ' + selectedEvent.title + ' - ' + selectedEvent.text);
                } else {
                     log('🚗 Event: ' + selectedEvent.title + ' - ' + selectedEvent.text);
                     if(selectedEvent.costUSD) {
                         const costLocal = Math.round((selectedEvent.costUSD[0] + Math.random() * (selectedEvent.costUSD[1] - selectedEvent.costUSD[0])) * carRate());
                         if(costLocal > 0) {
                             if(S.wealth >= costLocal) {
                                 S.wealth -= costLocal;
                                 log(' Paid ' + money(costLocal) + '.');
                             } else {
                                 log(' Could not afford ' + money(costLocal) + ' right now.');
                             }
                         }
                     }
                     if(selectedEvent.hap) fx({happiness: selectedEvent.hap});
                     if(selectedEvent.soc) fx({social: selectedEvent.soc});
                     if(selectedEvent.stolen) { car.stolen = true; }
                   if (selectedEvent.stolen) { car.stolen = true;
                 if (typeof emitSignal === 'function') emitSignal('carStolen', { car: car });
                                             }
                     if(selectedEvent.id === 'fine_speed') S.carsLicense.points += 2;
                     if(selectedEvent.id === 'red_light_cam') S.carsLicense.points += 3;
                     if(selectedEvent.id === 'road_rage' || selectedEvent.id === 'race_challenge') S.carsLicense.points += 4;
                }
            }
        }
    }
  });

  if(S.carsLicense.points >= 12 && S.carsLicense.suspendedUntil <= year) {
      S.carsLicense.suspendedUntil = year + 2;
      S.carsLicense.points = 0;
      fx({happiness: -20});
      log('🚨 DRIVING LICENCE SUSPENDED! You accumulated too many points. You cannot drive for 2 years.');
  }

});

/* ---------- REGISTER TAB ---------- */
GameHooks.registerTab({ id: 'cars', label: '🚗 Cars', order: 7, view: carsView });
