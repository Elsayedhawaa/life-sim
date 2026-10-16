/* =====================================================================
   79. EMERGENCY FIXES v2
   - Family car offer respects wealth tier (ultra = luxury car)
   - Working international university picker for IGCSE/IB/American
   - Fix duplicated EDUCATION STATUS, Passport, TOEFL, Language cards
   - Immediate travel/study-abroad support
   - Escape key to close stuck modals
   Load AFTER 78-fixes-and-extensions.js and BEFORE 99-boot.js
   ===================================================================== */

function p79Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p79Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

function p79Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p79) o.p79 = {};
  if (typeof o.p79.showUniPicker !== 'boolean') o.p79.showUniPicker = false;
  if (!o.p79.appliedUnis) o.p79.appliedUnis = [];
}
const P79_migrate = migrate;
migrate = function (o) { const r = P79_migrate(o); p79Init(r); return r; };
const P79_newGame = newGame;
newGame = function () { P79_newGame.apply(this, arguments); p79Init(S); };

/* =================================================================
   1. CAR OFFER FIX (as before, but compact)
   ================================================================= */
p62AcceptParentCar = function () {
  p62Init();
  if (!S || !S.p62 || !S.p62.pendingOffers || !S.p62.pendingOffers.length) {
    const m = document.getElementById('p62-offer-modal');
    if (m) m.remove();
    return;
  }
  const off = S.p62.pendingOffers.shift();
  const tier = (S.p76 && S.p76.wealthLevel) || 0;
  const year = gameYear();

  let pool;
  if (tier >= 5) {
    pool = P62_MODELS.filter(function (m) {
      if (!p64ModelValid(m, year)) return false;
      const brand = P62_BRANDS[m[0]] || {};
      return brand.tier >= 3 && ['lux', 'exec', 'sport', 'suv'].indexOf(m[2]) >= 0;
    });
  } else if (tier === 4) {
    pool = P62_MODELS.filter(function (m) {
      if (!p64ModelValid(m, year)) return false;
      const brand = P62_BRANDS[m[0]] || {};
      return (brand.tier === 3 || ['suv', 'lux'].indexOf(m[2]) >= 0) && ['econ', 'compact'].indexOf(m[2]) === -1;
    });
  } else if (tier === 3) {
    pool = P62_MODELS.filter(function (m) {
      return p64ModelValid(m, year) && ['compact', 'mid', 'suv'].indexOf(m[2]) >= 0;
    });
  } else {
    pool = P62_MODELS.filter(function (m) {
      return p64ModelValid(m, year) && ['econ', 'compact'].indexOf(m[2]) >= 0;
    });
  }
  if (!pool.length) pool = P62_MODELS.filter(function (m) { return p64ModelValid(m, year); });
  if (!pool.length) { const m = document.getElementById('p62-offer-modal'); if (m) m.remove(); return hint('No suitable car available.'); }

  const carAge = tier >= 4 ? 0 : tier === 3 ? 1 : 2 + Math.floor(Math.random() * 4);
  const model = pool[Math.floor(Math.random() * pool.length)];
  const brand = P62_BRANDS[model[0]] || { name: model[0] };
  const base = p62BasePriceUSD(model, year);
  const depreciation = (typeof p62Depreciation === 'function') ? p62Depreciation(carAge) : 1;
  const value = Math.round(base * depreciation);
  const uid = 'cg' + Math.random().toString(36).slice(2, 8);
  const car = {
    uid: uid, make: brand.name, name: model[1], cls: model[2], year: year - carAge,
    trim: 0, color: 0, interior: 0, opts: [], msrp: base, paid: 0,
    insurance: 'compreh', insuranceExpiry: year + 1, registrationExpiry: year + 1,
    miles: carAge * 12000, cond: tier >= 4 ? 98 : tier === 3 ? 80 : 65,
    age: carAge, acc: false, broken: false, fix: 0, mods: [], modCost: 0,
    seller: 'parents', brand: model[0],
    fuel: model[11] ? 'e' : (model[10] && year >= model[10] ? 'h' : 'g'),
    life: model[7], value: value, int: 0, intc: 0, hasLoan: false
  };
  S.cars = S.cars || [];
  S.cars.push(car);
  S.cars = S.cars.slice(-4);
  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 8);
  });
  fx({ happiness: 6, social: tier >= 4 ? 5 : 3 });
  log('🎁 Your parents gave you a ' + (year - carAge) + ' ' + (brand.name || model[0]) + ' ' + model[1] + (carAge === 0 ? ' — brand new!' : ' (used)'));
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  save(); hint(); render();
};

window.p62DeclineParentCar = function () {
  p62Init();
  if (!S || !S.p62 || !S.p62.pendingOffers) return;
  if (S.p62.pendingOffers.length) S.p62.pendingOffers.shift();
  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 3);
  });
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  log('You declined the car offer.');
  save(); hint(); render();
};

/* =================================================================
   2. INTERNATIONAL UNIVERSITY PICKER
   ================================================================= */
function p79IsInternationalSystem() {
  if (!S || !S.p78) return false;
  return ['igcse', 'american', 'ib'].indexOf(S.p78.educationSystem) !== -1;
}

const P79_INT_UNIS = {
  gbr: [
    { n: 'University of Oxford',          tier: 1, req: 3.7, ielts: 7.5, tuition: 28000, funding: true },
    { n: 'University of Cambridge',       tier: 1, req: 3.7, ielts: 7.5, tuition: 28000, funding: true },
    { n: 'Imperial College London',       tier: 1, req: 3.5, ielts: 7.0, tuition: 32000, funding: true },
    { n: 'London School of Economics',    tier: 1, req: 3.6, ielts: 7.0, tuition: 30000, funding: true },
    { n: 'University College London',     tier: 1, req: 3.4, ielts: 7.0, tuition: 28000, funding: true },
    { n: 'King\'s College London',        tier: 2, req: 3.2, ielts: 6.5, tuition: 26000, funding: true },
    { n: 'University of Edinburgh',       tier: 2, req: 3.2, ielts: 6.5, tuition: 24000, funding: true },
    { n: 'University of Manchester',      tier: 2, req: 3.0, ielts: 6.5, tuition: 22000, funding: false },
    { n: 'University of Warwick',         tier: 2, req: 3.1, ielts: 6.5, tuition: 24000, funding: false },
    { n: 'University of Bristol',         tier: 2, req: 3.0, ielts: 6.5, tuition: 24000, funding: false }
  ],
  usa: [
    { n: 'MIT',                           tier: 1, req: 3.8, ielts: 7.5, tuition: 55000, funding: true },
    { n: 'Harvard University',            tier: 1, req: 3.8, ielts: 7.5, tuition: 55000, funding: true },
    { n: 'Stanford University',           tier: 1, req: 3.8, ielts: 7.5, tuition: 55000, funding: true },
    { n: 'Yale University',               tier: 1, req: 3.7, ielts: 7.0, tuition: 52000, funding: true },
    { n: 'Princeton University',          tier: 1, req: 3.7, ielts: 7.0, tuition: 52000, funding: true },
    { n: 'Columbia University',           tier: 1, req: 3.6, ielts: 7.0, tuition: 55000, funding: true },
    { n: 'UC Berkeley',                   tier: 1, req: 3.5, ielts: 7.0, tuition: 44000, funding: false },
    { n: 'UCLA',                          tier: 2, req: 3.4, ielts: 7.0, tuition: 42000, funding: false },
    { n: 'New York University',           tier: 2, req: 3.3, ielts: 7.0, tuition: 50000, funding: false }
  ],
  deu: [
    { n: 'Technical University of Munich', tier: 1, req: 3.5, ielts: 6.5, tuition: 0, funding: true },
    { n: 'Heidelberg University',          tier: 1, req: 3.4, ielts: 6.5, tuition: 0, funding: true },
    { n: 'RWTH Aachen University',         tier: 1, req: 3.3, ielts: 6.5, tuition: 0, funding: true },
    { n: 'Free University of Berlin',      tier: 2, req: 3.0, ielts: 6.0, tuition: 0, funding: true },
    { n: 'Humboldt University of Berlin',  tier: 2, req: 3.0, ielts: 6.0, tuition: 0, funding: true }
  ],
  can: [
    { n: 'University of Toronto',          tier: 1, req: 3.5, ielts: 6.5, tuition: 35000, funding: true },
    { n: 'McGill University',              tier: 1, req: 3.4, ielts: 6.5, tuition: 25000, funding: false },
    { n: 'University of British Columbia', tier: 1, req: 3.4, ielts: 6.5, tuition: 32000, funding: false },
    { n: 'University of Waterloo',         tier: 1, req: 3.4, ielts: 6.5, tuition: 28000, funding: true }
  ],
  fra: [
    { n: 'Sorbonne University',            tier: 1, req: 3.4, ielts: 6.5, tuition: 3000, funding: true },
    { n: 'Sciences Po Paris',              tier: 1, req: 3.5, ielts: 7.0, tuition: 14000, funding: true },
    { n: 'HEC Paris',                      tier: 1, req: 3.6, ielts: 7.0, tuition: 22000, funding: false },
    { n: 'École Polytechnique',            tier: 1, req: 3.6, ielts: 6.5, tuition: 8000, funding: true }
  ],
  nld: [
    { n: 'Delft University of Technology', tier: 1, req: 3.4, ielts: 6.5, tuition: 18000, funding: true },
    { n: 'University of Amsterdam',        tier: 1, req: 3.3, ielts: 6.5, tuition: 16000, funding: false },
    { n: 'Utrecht University',             tier: 1, req: 3.2, ielts: 6.5, tuition: 15000, funding: false }
  ]
};

const P79_INT_SCHOLARSHIPS = {
  gbr: [{ name: 'Chevening Scholarship', cover: 1.0, reqGpa: 3.5, reqIelts: 7.0, chance: 0.18 },
        { name: 'Commonwealth Scholarship', cover: 1.0, reqGpa: 3.4, reqIelts: 6.5, chance: 0.15 },
        { name: 'University merit scholarship', cover: 0.5, reqGpa: 3.5, reqIelts: 6.5, chance: 0.35 }],
  usa: [{ name: 'Fulbright Foreign Student Program', cover: 1.0, reqGpa: 3.6, reqIelts: 7.0, chance: 0.12 },
        { name: 'University full-ride', cover: 1.0, reqGpa: 3.8, reqIelts: 7.5, chance: 0.08 },
        { name: 'University partial scholarship', cover: 0.5, reqGpa: 3.5, reqIelts: 7.0, chance: 0.30 }],
  deu: [{ name: 'DAAD Scholarship', cover: 1.0, reqGpa: 3.4, reqIelts: 6.5, chance: 0.20 },
        { name: 'Erasmus+ Scholarship', cover: 0.8, reqGpa: 3.2, reqIelts: 6.5, chance: 0.25 }],
  can: [{ name: 'University entrance scholarship', cover: 0.4, reqGpa: 3.3, reqIelts: 6.5, chance: 0.35 }],
  fra: [{ name: 'Eiffel Excellence Scholarship', cover: 1.0, reqGpa: 3.5, reqIelts: 6.5, chance: 0.15 }],
  nld: [{ name: 'Orange Tulip Scholarship', cover: 0.6, reqGpa: 3.3, reqIelts: 6.5, chance: 0.28 }]
};

function p79IntUniPickerCard() {
  if (!S || S.age < 16) return '';
  if (!p79IsInternationalSystem()) return '';
  if (S.uni || S.degree) return '';
  p79Init(S);

  const rate = p79Rate();
  const bankEGP = Math.round((Number(S.wealth) || 0) * rate);
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;

  let html = '<section class="card" style="border-color:var(--violet)">' +
    '<h3>🌍 Universities for international students</h3>' +
    '<p class="muted" style="font-size:.82rem">You are on ' + p78EducationSystemLabel(S.p78.educationSystem) + '. You apply directly to universities worldwide — no Thanaweya Amma, no Tansik. GPA: <b>' + gpa.toFixed(2) + '</b> · IELTS: <b>' + (ielts || 'not taken') + '</b> · Bank: <b>E£' + bankEGP.toLocaleString() + '</b></p>';

  /* Show only a few countries at a time — pick one */
  const countries = Object.keys(P79_INT_UNIS);
  const selectedCountry = S.p79.selectedCountry || null;

  html += '<p class="muted" style="font-size:.75rem;margin-top:10px">Destination</p>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  countries.forEach(function (code) {
    const c = COUNTRIES[code] || {};
    const sel = selectedCountry === code;
    html += '<button class="btn ' + (sel ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.74rem" onclick="p79SelectCountry(\'' + code + '\')">' +
      (c.f || '') + ' ' + (c.n || code) + '</button>';
  });
  html += '</div>';

  if (!selectedCountry) {
    html += '<p class="muted" style="font-size:.78rem;margin-top:10px">Pick a country to see its universities.</p></section>';
    return html;
  }

  const unis = P79_INT_UNIS[selectedCountry] || [];
  const schols = P79_INT_SCHOLARSHIPS[selectedCountry] || [];

  html += '<p class="muted" style="font-size:.75rem;margin-top:14px">Universities in ' + (COUNTRIES[selectedCountry] ? COUNTRIES[selectedCountry].n : selectedCountry) + '</p>';

  unis.forEach(function (uni, i) {
    const tuitionEGP = Math.round(uni.tuition * 52.7 * p79Idx());
    const canApply = gpa >= uni.req && ielts >= uni.ielts;
    const alreadyApplied = (S.p79.appliedUnis || []).some(function (a) { return a.uni === uni.n; });

    html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<b>' + uni.n + '</b> <span class="muted" style="font-size:.75rem">· Tier ' + uni.tier + '</span>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Tuition/year</span><b class="mono">' + (uni.tuition === 0 ? 'FREE' : 'E£' + tuitionEGP.toLocaleString()) + '</b></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Requires</span><b>GPA ' + uni.req + '+ · IELTS ' + uni.ielts + '+</b></div>';

    if (alreadyApplied) {
      html += '<p class="muted" style="font-size:.78rem;margin-top:6px;color:var(--amber)">⏳ Application already submitted</p>';
    } else if (canApply) {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:6px">' +
        '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p79ApplyInt(\'' + selectedCountry + '\',' + i + ',\'self\')">Self-funded</button>' +
        '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p79ApplyInt(\'' + selectedCountry + '\',' + i + ',\'scholarship\')">Scholarship</button>' +
        '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p79ApplyInt(\'' + selectedCountry + '\',' + i + ',\'parents\')">Ask family</button>' +
        '</div>';
    } else {
      html += '<p style="color:var(--rose);font-size:.75rem;margin-top:6px">' +
        (!gpa || gpa < uni.req ? '❌ GPA too low. ' : '') +
        (ielts < uni.ielts ? '❌ IELTS too low.' : '') +
        '</p>';
    }
    html += '</div>';
  });

  /* Scholarships */
  if (schols.length) {
    html += '<p class="muted" style="font-size:.75rem;margin-top:14px">Scholarships</p>';
    schols.forEach(function (s) {
      const ok = gpa >= s.reqGpa && ielts >= s.reqIelts;
      html += '<div style="margin-top:6px;padding:8px;border-left:3px solid ' + (ok ? 'var(--mint)' : 'var(--line)') + ';background:rgba(255,255,255,.02);border-radius:4px">' +
        '<b style="font-size:.84rem">' + s.name + '</b> <span style="color:var(--mint);font-size:.75rem">· ' + Math.round(s.cover * 100) + '%</span>' +
        '<div class="muted" style="font-size:.74rem;margin-top:2px">Needs GPA ' + s.reqGpa + '+ · IELTS ' + s.reqIelts + '+</div>' +
        (ok ? '<div style="color:var(--mint);font-size:.74rem;margin-top:4px">✓ You qualify — select Scholarship on any university above</div>' : '') +
        '</div>';
    });
  }

  html += '</section>';
  return html;
}

function p79SelectCountry(code) {
  p79Init(S);
  S.p79.selectedCountry = code;
  render();
}
window.p79SelectCountry = p79SelectCountry;

function p79ApplyInt(countryCode, uniIndex, fundingType) {
  p79Init(S);
  const unis = P79_INT_UNIS[countryCode] || [];
  const uni = unis[uniIndex];
  if (!uni) return hint('University not found.');

  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  if (gpa < uni.req) return hint('GPA too low: needs ' + uni.req + '+');
  if (ielts < uni.ielts) return hint('IELTS too low: needs ' + uni.ielts + '+');

  /* Fee */
  const feeUSD = 100;
  const feeEGP = Math.round(feeUSD * 52.7 * p79Idx());
  const internal = feeEGP / p79Rate();
  if (S.wealth < internal) return hint('Application fee: E£' + feeEGP.toLocaleString());

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;

  /* Track application */
  S.p79.appliedUnis = S.p79.appliedUnis || [];
  S.p79.appliedUnis.push({
    uni: uni.n,
    country: countryCode,
    level: 'bachelor',
    funding: fundingType,
    appliedYear: gameYear(),
    appliedAbs: S.pacingAbsoluteMonth || 0,
    resolved: false,
    result: null
  });

  log('📤 Applied to ' + uni.n + ' (' + (COUNTRIES[countryCode] ? COUNTRIES[countryCode].n : countryCode) + ') · ' + fundingType + '. Fee: E£' + feeEGP.toLocaleString() + '.');
  realismNotice('Application submitted', uni.n + ' — ' + fundingType + '. Decision expected in a few months.');

  /* Schedule decision 3 months later (or 1 year if yearly pacing) */
  const delay = (S.pacing === 'monthly') ? 3 : 12;
  const targetAbs = (S.pacingAbsoluteMonth || 0) + delay;
  setTimeout(function () {
    p79ResolveIntApplication(uni.n);
  }, 500);
  hint(); render();
}
window.p79ApplyInt = p79ApplyInt;

function p79ResolveIntApplication(uniName) {
  if (!S || !S.p79 || !Array.isArray(S.p79.appliedUnis)) return;
  const app = S.p79.appliedUnis.find(function (a) { return a.uni === uniName && !a.resolved; });
  if (!app) return;

  const unis = P79_INT_UNIS[app.country] || [];
  const uni = unis.find(function (u) { return u.n === uniName; });
  if (!uni) return;

  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;

  /* Admission chance */
  const gpaDelta = gpa - uni.req;
  const ieltsDelta = ielts - uni.ielts;
  let admissionChance = 0.35 + gpaDelta * 0.4 + ieltsDelta * 0.08;
  if (uni.tier === 1) admissionChance -= 0.15;
  admissionChance = Math.max(0.05, Math.min(0.9, admissionChance));

  if (Math.random() > admissionChance) {
    app.resolved = true;
    app.result = 'rejected';
    log('❌ ' + uniName + ' rejected your application.');
    realismNotice('Application rejected', uniName + ' did not admit you.');
    render();
    return;
  }

  /* Funding */
  if (app.funding === 'self') {
    const year1 = p79Year1Cost(app.country, uni);
    const bank = Math.round(S.wealth * p79Rate());
    if (bank < year1) {
      app.resolved = true;
      app.result = 'admitted-no-funds';
      log('⚠️ Admitted to ' + uniName + ' but you cannot afford year 1 (E£' + year1.toLocaleString() + ').');
      render();
      return;
    }
    app.resolved = true;
    app.result = 'admitted-self';
    log('✅ Admitted to ' + uniName + '! Self-funded.');
  } else if (app.funding === 'parents') {
    const fw = Number(S.famWealth) || 0;
    const tier = (S.p76 && S.p76.wealthLevel) || 0;
    const agreeChance = tier >= 4 ? 0.9 : tier >= 3 ? 0.55 : 0.15;
    if (Math.random() < agreeChance) {
      app.resolved = true;
      app.result = 'admitted-parents';
      log('✅ Admitted to ' + uniName + '! Parents agreed to fund.');
    } else {
      app.resolved = true;
      app.result = 'admitted-no-funds';
      log('⚠️ Admitted to ' + uniName + ' but parents declined to fund.');
    }
  } else {
    /* Scholarship */
    const schols = P79_INT_SCHOLARSHIPS[app.country] || [];
    const target = schols.find(function (s) { return gpa >= s.reqGpa && ielts >= s.reqIelts; });
    if (target && Math.random() < target.chance + gpaDelta * 0.05) {
      app.resolved = true;
      app.result = 'admitted-scholarship';
      app.scholarship = target.name;
      app.cover = target.cover;
      log('🏆 Admitted to ' + uniName + ' with ' + target.name + ' (' + Math.round(target.cover * 100) + '% coverage)!');
      realismNotice('Admitted with scholarship', target.name + ' at ' + uniName + '.');
    } else {
      app.resolved = true;
      app.result = 'admitted-no-funds';
      log('⚠️ Admitted to ' + uniName + ' but no scholarship was awarded.');
    }
  }
  save(); render();
}

function p79Year1Cost(countryCode, uni) {
  const living = { gbr: 15000, usa: 18000, deu: 11500, can: 16000, fra: 10500, nld: 12500 }[countryCode] || 15000;
  const blocked = { deu: 11208, can: 14000 }[countryCode] || 0;
  const visa = { gbr: 490, usa: 185, deu: 75, can: 150, fra: 100, nld: 210 }[countryCode] || 200;
  const flight = { gbr: 650, usa: 1100, deu: 590, can: 1000, fra: 620, nld: 640 }[countryCode] || 700;
  const setup = 1000;
  const total = (uni.tuition || 0) + living + blocked + visa + flight + setup;
  return Math.round(total * 52.7 * p79Idx());
}

/* Buttons */
window.p79GoToUniPicker = function () {
  p79Init(S);
  S.p79.showUniPicker = true;
  render();
};

/* =================================================================
   3. HOOK INTO viewSchool
   ================================================================= */
const P79_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P79_viewSchoolBefore.apply(this, arguments);
  if (!S) return html;
  p79Init(S);

  /* ---- A. If international system: strip Egyptian content ---- */
  if (p79IsInternationalSystem()) {
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Your Thanaweya Amma position[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Choose Thanaweya Amma track[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏛️ Choose Your University[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🎓 Choose your university[\s\S]*?<\/section>/g, '');
    html = html.replace(/<button[^>]*onclick="p69ComputeAndShowResult\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
    html = html.replace(/<button[^>]*onclick="p68ChooseTrack[^)]*\)"[^>]*>[\s\S]*?<\/button>/g, '');
    /* Also remove "Choose a Thanaweya Amma track first." text */
    html = html.replace(/Choose a Thanaweya Amma track first\./g, '');
  }

  /* ---- B. Dedup EDUCATION STATUS cards — keep first ---- */
  const statusMarker = '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS';
  const statusIdxs = [];
  let searchStart = 0;
  while (true) {
    const idx = html.indexOf(statusMarker, searchStart);
    if (idx === -1) break;
    statusIdxs.push(idx);
    searchStart = idx + statusMarker.length;
  }
  if (statusIdxs.length > 1) {
    /* Remove cards 2..n by finding the enclosing section */
    for (let i = statusIdxs.length - 1; i >= 1; i--) {
      const idx = statusIdxs[i];
      const sectionStart = html.lastIndexOf('<section', idx);
      const sectionEnd = html.indexOf('</section>', idx) + '</section>'.length;
      if (sectionStart >= 0 && sectionEnd > sectionStart) {
        html = html.slice(0, sectionStart) + html.slice(sectionEnd);
      }
    }
  }

  /* ---- C. Dedup passport panel — keep last ---- */
  const passportMatches = html.match(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g);
  if (passportMatches && passportMatches.length > 1) {
    let count = 0;
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g,
      function (match) {
        count++;
        return count < passportMatches.length ? '' : match;
      }
    );
  }

  /* ---- D. Dedup TOEFL iBT card — keep last ---- */
  const toeflMatches = html.match(/<section class="card"[^>]*>[\s\S]*?Take TOEFL iBT[\s\S]*?<\/section>/g);
  if (toeflMatches && toeflMatches.length > 1) {
    let count = 0;
    html = html.replace(
      /<section class="card"[^>]*>[\s\S]*?Take TOEFL iBT[\s\S]*?<\/section>/g,
      function (match) {
        count++;
        return count < toeflMatches.length ? '' : match;
      }
    );
  }

  /* ---- E. Dedup German card ---- */
  const germanMatches = html.match(/<section class="card"[^>]*>\s*<h3>🇩🇪 German[\s\S]*?<\/section>/g);
  if (germanMatches && germanMatches.length > 1) {
    let count = 0;
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🇩🇪 German[\s\S]*?<\/section>/g,
      function (match) {
        count++;
        return count < germanMatches.length ? '' : match;
      }
    );
  }

  /* ---- F. Dedup Dutch card ---- */
  const dutchMatches = html.match(/<section class="card"[^>]*>\s*<h3>🇳🇱 Dutch[\s\S]*?<\/section>/g);
  if (dutchMatches && dutchMatches.length > 1) {
    let count = 0;
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🇳🇱 Dutch[\s\S]*?<\/section>/g,
      function (match) {
        count++;
        return count < dutchMatches.length ? '' : match;
      }
    );
  }

  /* ---- G. Insert international picker if applicable ---- */
  if (p79IsInternationalSystem() && !S.uni && !S.degree) {
    const picker = p79IntUniPickerCard();
    if (picker) {
      /* Insert after the first section (status card) */
      const firstEnd = html.indexOf('</section>');
      if (firstEnd !== -1) {
        html = html.slice(0, firstEnd + 10) + picker + html.slice(firstEnd + 10);
      } else {
        html = picker + html;
      }
    }
  }

  return html;
};

/* =================================================================
   4. FIX "Apply to universities" BUTTON
   ================================================================= */
/* Override the action list to give the button a working handler */
const P79_viewSchoolBeforeActions = viewSchool;
viewSchool = function () {
  let html = P79_viewSchoolBeforeActions.apply(this, arguments);
  if (!S) return html;

  /* Replace dead "Apply to universities" buttons with working ones */
  html = html.replace(
    /<button[^>]*onclick="activeTab='school';render\(\)"[^>]*>(🌍 Apply to universities \(international system\))<\/button>/g,
    '<button class="btn" style="text-align:left" onclick="p79GoToUniPicker()">$1</button>'
  );
  /* Also handle if the action string uses escaped quotes */
  html = html.replace(
    /<button[^>]*onclick="activeTab=\\?'school\\?';render\(\)"[^>]*>(🌍 Apply to universities \(international system\))<\/button>/g,
    '<button class="btn" style="text-align:left" onclick="p79GoToUniPicker()">$1</button>'
  );

  return html;
};

/* Force button to work by making render always show picker if flag is set */
const P79_renderBefore = render;
render = function () {
  if (S && S.p79 && S.p79.showUniPicker) {
    /* Ensure school tab active */
    if (activeTab !== 'school') activeTab = 'school';
  }
  return P79_renderBefore.apply(this, arguments);
};

/* =================================================================
   5. STUCK MODAL RECOVERY
   ================================================================= */
function p79ClearStuckModals() {
  if (!S) return;
  const offerModal = document.getElementById('p62-offer-modal');
  if (offerModal && (!S.p62 || !S.p62.pendingOffers || !S.p62.pendingOffers.length)) {
    offerModal.remove();
  }
}
setTimeout(p79ClearStuckModals, 500);

if (typeof document !== 'undefined') {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const m = document.getElementById('p62-offer-modal');
      if (m) {
        m.remove();
        if (S && S.p62 && S.p62.pendingOffers) S.p62.pendingOffers = [];
        render();
      }
    }
  });
}

/* =================================================================
   6. INIT
   ================================================================= */
p79Init(S);
console.log('[p79 v2] International university picker + dedup + car offer fix loaded');
