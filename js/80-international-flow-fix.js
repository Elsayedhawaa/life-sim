/* =====================================================================
   80. INTERNATIONAL FLOW v2 — Egyptian private + fixed resolution
   - Restore Egyptian private universities for rich families
   - Applications resolve by month/year tick (not setTimeout)
   - Choose pathway: private (Egypt) OR abroad OR wait
   - Family business can never fire you
   - Aggressive dedup
   Load AFTER 79-emergency-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p80Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p80Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

function p80Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p80) o.p80 = {};
  if (typeof o.p80.modalCountry !== 'string') o.p80.modalCountry = 'gbr';
  if (typeof o.p80.pathwayChosen !== 'boolean') o.p80.pathwayChosen = false;
}
const P80_migrate = migrate;
migrate = function (o) { const r = P80_migrate(o); p80Init(r); return r; };
const P80_newGame = newGame;
newGame = function () { P80_newGame.apply(this, arguments); p80Init(S); };

/* =================================================================
   1. FAMILY BUSINESS CAN NEVER FIRE
   ================================================================= */
const P80_packYearBefore = packYear;
packYear = function () {
  if (!S) return P80_packYearBefore.apply(this, arguments);
  const wasFamilyBiz = !!(S.job && S.job.isFamilyBusiness);
  const savedJob = wasFamilyBiz ? Object.assign({}, S.job) : null;
  const result = P80_packYearBefore.apply(this, arguments);
  if (wasFamilyBiz && savedJob && !S.job) {
    S.job = savedJob;
    S.job.years = (S.job.years || 0) + 1;
    log('ℹ️ The family business continues — you remain employed as ' + S.job.title + '.');
  }
  return result;
};

/* =================================================================
   2. EGYPTIAN PRIVATE UNIVERSITIES
   ================================================================= */
const P80_EGY_PRIVATE = [
  { id: 'auc',    name: 'American University in Cairo (AUC)',      reqGpa: 3.2, ielts: 6.5, tuitionUSD: 21000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'US-accredited liberal arts. Most prestigious private university in Egypt.' },
  { id: 'guc',    name: 'German University in Cairo (GUC)',        reqGpa: 3.0, ielts: 6.0, tuitionEGP: 280000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'German-accredited. Engineering, management, pharmacy.' },
  { id: 'bue',    name: 'British University in Egypt (BUE)',       reqGpa: 2.9, ielts: 6.0, tuitionEGP: 180000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'UK-validated degrees. Dentistry, engineering, business.' },
  { id: 'aastmt', name: 'Arab Academy for Science & Technology',   reqGpa: 3.0, ielts: 6.0, tuitionUSD: 10000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'Maritime, engineering, IT. Regional network.' },
  { id: 'buc',    name: 'Badr University in Cairo (BUC)',           reqGpa: 2.7, ielts: 5.5, tuitionEGP: 130000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'Modern private university. Medicine, dentistry, engineering.' },
  { id: 'miu',    name: 'Misr International University (MIU)',     reqGpa: 2.7, ielts: 5.5, tuitionEGP: 120000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'Private university, English-taught. Business, pharmacy, computer science.' },
  { id: 'msa',    name: 'Modern Sciences and Arts University',      reqGpa: 2.7, ielts: 5.5, tuitionEGP: 110000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'Private university. Business, media, computer science.' },
  { id: 'nile',   name: 'Nile University',                          reqGpa: 3.0, ielts: 6.0, tuitionEGP: 160000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'Engineering, business, computer science.' },
  { id: 'future', name: 'Future University in Egypt',               reqGpa: 2.8, ielts: 5.5, tuitionEGP: 130000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'Engineering, pharmacy, business.' },
  { id: 'helwan_i', name: 'Heliopolis University',                  reqGpa: 2.7, ielts: 5.5, tuitionEGP: 100000, accepts: ['igcse', 'american', 'ib', 'thanaweya'], notes: 'Sustainable development focus. Private.' }
];

function p80TuitionEGP(uni) {
  if (uni.tuitionUSD) return Math.round(uni.tuitionUSD * 52.7 * p80Idx());
  if (uni.tuitionEGP) return Math.round(uni.tuitionEGP * p80Idx());
  return 0;
}

/* =================================================================
   3. INTERNATIONAL UNIVERSITY CATALOG
   ================================================================= */
const P80_INT_UNIS = {
  gbr: [
    { n: 'University of Oxford',          tier: 1, req: 3.7, ielts: 7.5, tuition: 28000 },
    { n: 'University of Cambridge',       tier: 1, req: 3.7, ielts: 7.5, tuition: 28000 },
    { n: 'Imperial College London',       tier: 1, req: 3.5, ielts: 7.0, tuition: 32000 },
    { n: 'London School of Economics',    tier: 1, req: 3.6, ielts: 7.0, tuition: 30000 },
    { n: 'University College London',     tier: 1, req: 3.4, ielts: 7.0, tuition: 28000 },
    { n: 'King\'s College London',        tier: 2, req: 3.2, ielts: 6.5, tuition: 26000 },
    { n: 'University of Edinburgh',       tier: 2, req: 3.2, ielts: 6.5, tuition: 24000 },
    { n: 'University of Manchester',      tier: 2, req: 3.0, ielts: 6.5, tuition: 22000 },
    { n: 'University of Warwick',         tier: 2, req: 3.1, ielts: 6.5, tuition: 24000 },
    { n: 'University of Bristol',         tier: 2, req: 3.0, ielts: 6.5, tuition: 24000 }
  ],
  usa: [
    { n: 'MIT',                           tier: 1, req: 3.8, ielts: 7.5, tuition: 55000 },
    { n: 'Harvard University',            tier: 1, req: 3.8, ielts: 7.5, tuition: 55000 },
    { n: 'Stanford University',           tier: 1, req: 3.8, ielts: 7.5, tuition: 55000 },
    { n: 'Yale University',               tier: 1, req: 3.7, ielts: 7.0, tuition: 52000 },
    { n: 'Princeton University',          tier: 1, req: 3.7, ielts: 7.0, tuition: 52000 },
    { n: 'Columbia University',           tier: 1, req: 3.6, ielts: 7.0, tuition: 55000 },
    { n: 'UC Berkeley',                   tier: 1, req: 3.5, ielts: 7.0, tuition: 44000 },
    { n: 'UCLA',                          tier: 2, req: 3.4, ielts: 7.0, tuition: 42000 },
    { n: 'New York University',           tier: 2, req: 3.3, ielts: 7.0, tuition: 50000 }
  ],
  deu: [
    { n: 'Technical University of Munich', tier: 1, req: 3.5, ielts: 6.5, tuition: 0 },
    { n: 'Heidelberg University',          tier: 1, req: 3.4, ielts: 6.5, tuition: 0 },
    { n: 'RWTH Aachen University',         tier: 1, req: 3.3, ielts: 6.5, tuition: 0 },
    { n: 'Free University of Berlin',      tier: 2, req: 3.0, ielts: 6.0, tuition: 0 },
    { n: 'Humboldt University of Berlin',  tier: 2, req: 3.0, ielts: 6.0, tuition: 0 }
  ],
  can: [
    { n: 'University of Toronto',          tier: 1, req: 3.5, ielts: 6.5, tuition: 35000 },
    { n: 'McGill University',              tier: 1, req: 3.4, ielts: 6.5, tuition: 25000 },
    { n: 'University of British Columbia', tier: 1, req: 3.4, ielts: 6.5, tuition: 32000 },
    { n: 'University of Waterloo',         tier: 1, req: 3.4, ielts: 6.5, tuition: 28000 }
  ],
  fra: [
    { n: 'Sorbonne University',            tier: 1, req: 3.4, ielts: 6.5, tuition: 3000 },
    { n: 'Sciences Po Paris',              tier: 1, req: 3.5, ielts: 7.0, tuition: 14000 },
    { n: 'HEC Paris',                      tier: 1, req: 3.6, ielts: 7.0, tuition: 22000 },
    { n: 'École Polytechnique',            tier: 1, req: 3.6, ielts: 6.5, tuition: 8000 }
  ],
  nld: [
    { n: 'Delft University of Technology', tier: 1, req: 3.4, ielts: 6.5, tuition: 18000 },
    { n: 'University of Amsterdam',        tier: 1, req: 3.3, ielts: 6.5, tuition: 16000 },
    { n: 'Utrecht University',             tier: 1, req: 3.2, ielts: 6.5, tuition: 15000 }
  ],
  aus: [
    { n: 'University of Melbourne',        tier: 1, req: 3.4, ielts: 6.5, tuition: 32000 },
    { n: 'University of Sydney',           tier: 1, req: 3.3, ielts: 6.5, tuition: 34000 },
    { n: 'Australian National University', tier: 1, req: 3.3, ielts: 6.5, tuition: 30000 }
  ]
};

const P80_INT_SCHOLARSHIPS = {
  gbr: [
    { name: 'Chevening Scholarship',       cover: 1.0, reqGpa: 3.5, reqIelts: 7.0, chance: 0.20 },
    { name: 'Commonwealth Scholarship',    cover: 1.0, reqGpa: 3.4, reqIelts: 6.5, chance: 0.18 },
    { name: 'University merit scholarship', cover: 0.5, reqGpa: 3.5, reqIelts: 6.5, chance: 0.38 }
  ],
  usa: [
    { name: 'Fulbright Foreign Student Program', cover: 1.0, reqGpa: 3.6, reqIelts: 7.0, chance: 0.15 },
    { name: 'University full-ride',        cover: 1.0, reqGpa: 3.8, reqIelts: 7.5, chance: 0.10 },
    { name: 'University partial scholarship', cover: 0.5, reqGpa: 3.5, reqIelts: 7.0, chance: 0.35 }
  ],
  deu: [
    { name: 'DAAD Scholarship',            cover: 1.0, reqGpa: 3.4, reqIelts: 6.5, chance: 0.22 },
    { name: 'Erasmus+ Scholarship',        cover: 0.8, reqGpa: 3.2, reqIelts: 6.5, chance: 0.28 }
  ],
  can: [{ name: 'University entrance scholarship', cover: 0.4, reqGpa: 3.3, reqIelts: 6.5, chance: 0.40 }],
  fra: [{ name: 'Eiffel Excellence Scholarship', cover: 1.0, reqGpa: 3.5, reqIelts: 6.5, chance: 0.18 }],
  nld: [{ name: 'Orange Tulip Scholarship', cover: 0.6, reqGpa: 3.3, reqIelts: 6.5, chance: 0.32 }],
  aus: [{ name: 'Australia Awards',          cover: 1.0, reqGpa: 3.4, reqIelts: 6.5, chance: 0.18 }]
};

function p80Year1CostAbroad(countryCode, tuitionUSD) {
  const living = { gbr: 15000, usa: 18000, deu: 11500, can: 16000, fra: 10500, nld: 12500, aus: 20000 }[countryCode] || 15000;
  const blocked = { deu: 11208, can: 14000 }[countryCode] || 0;
  const visa = { gbr: 490, usa: 185, deu: 75, can: 150, fra: 100, nld: 210, aus: 710 }[countryCode] || 200;
  const flight = { gbr: 650, usa: 1100, deu: 590, can: 1000, fra: 620, nld: 640, aus: 1350 }[countryCode] || 700;
  const setup = 1000;
  const total = (tuitionUSD || 0) + living + blocked + visa + flight + setup;
  return Math.round(total * 52.7 * p80Idx());
}

/* =================================================================
   4. APPLICATION RESOLUTION — tick-based, not setTimeout
   ================================================================= */
function p80ResolvePendingApplications() {
  if (!S || !S.p79 || !Array.isArray(S.p79.appliedUnis)) return;
  const absMonth = Number(S.pacingAbsoluteMonth) || 0;
  const year = gameYear();
  let changed = false;

  S.p79.appliedUnis.forEach(function (app) {
    if (!app || app.resolved) return;
    /* Both private (Egypt) and abroad applications resolve after N months */
    const readyAbs = app.appliedAbs + (app.resolveAfterMonths || 3);
    const readyYear = (app.appliedYear || year) + (app.resolveAfterYears || 0);
    const isReady = (S.pacing === 'monthly')
      ? (absMonth >= readyAbs)
      : (year >= readyYear + 1);   /* at least next year */
    if (!isReady) return;

    /* Admission decision */
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
    const ielts = S.ielts || 0;
    const gpaDelta = gpa - (app.reqGpa || 3.0);
    const ieltsDelta = ielts - (app.reqIelts || 6.5);
    let chance = 0.35 + gpaDelta * 0.4 + ieltsDelta * 0.08;
    if ((app.reqGpa || 3.0) >= 3.5) chance -= 0.15;
    if (app.universityId && app.universityId === 'auc') chance -= 0.05;
    chance = Math.max(0.05, Math.min(0.9, chance));

    if (Math.random() > chance) {
      app.resolved = true;
      app.result = 'rejected';
      log('❌ ' + app.uni + ' rejected your application.');
      realismNotice('Application rejected', app.uni + ' did not admit you.');
      changed = true;
      return;
    }

    /* Funding */
    if (app.funding === 'self') {
      const costEGP = app.year1CostEGP || 0;
      const bank = Math.round(S.wealth * p80Rate());
      if (bank < costEGP) {
        app.resolved = true;
        app.result = 'admitted-no-funds';
        log('⚠️ Admitted to ' + app.uni + ' but bank is E£' + bank.toLocaleString() + ' and year 1 costs E£' + costEGP.toLocaleString() + '.');
      } else {
        app.resolved = true;
        app.result = 'admitted-self';
        log('✅ Admitted to ' + app.uni + '! Self-funded.');
        realismNotice('Admitted (self-funded)', app.uni + ' admitted you. Tuition will be deducted at the start of the year.');
      }
    } else if (app.funding === 'parents') {
      const tier = (S.p76 && S.p76.wealthLevel) || 0;
      const agreeChance = tier >= 4 ? 0.92 : tier >= 3 ? 0.60 : 0.15;
      if (Math.random() < agreeChance) {
        app.resolved = true;
        app.result = 'admitted-parents';
        log('✅ Admitted to ' + app.uni + '! Parents agreed to fund.');
        realismNotice('Admitted (family-funded)', 'Your family will cover tuition at ' + app.uni + '.');
      } else {
        app.resolved = true;
        app.result = 'admitted-no-funds';
        log('⚠️ Admitted to ' + app.uni + ' but parents declined to fund.');
      }
    } else if (app.funding === 'scholarship') {
      const schols = P80_INT_SCHOLARSHIPS[app.country] || [];
      const target = schols.find(function (s) { return gpa >= s.reqGpa && ielts >= s.reqIelts; });
      if (target && Math.random() < target.chance + gpaDelta * 0.05) {
        app.resolved = true;
        app.result = 'admitted-scholarship';
        app.scholarship = target.name;
        app.cover = target.cover;
        log('🏆 Admitted to ' + app.uni + ' with ' + target.name + ' (' + Math.round(target.cover * 100) + '%)!');
        realismNotice('Admitted with scholarship', target.name + ' at ' + app.uni + '.');
      } else {
        app.resolved = true;
        app.result = 'admitted-no-funds';
        log('⚠️ Admitted to ' + app.uni + ' but no scholarship was awarded.');
      }
    } else {
      /* Fallback */
      app.resolved = true;
      app.result = 'admitted-no-funds';
    }
    changed = true;
  });

  if (changed) save();
}

/* Call on monthly tick */
const P80_p52TickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  P80_p52TickBefore.apply(this, arguments);
  try { p80ResolvePendingApplications(); } catch (e) { console.error('p80 resolve:', e); }
};

/* Call on yearly age-up */
const P80_ageUpBefore = ageUp;
ageUp = function () {
  const r = P80_ageUpBefore.apply(this, arguments);
  try { p80ResolvePendingApplications(); } catch (e) {}
  return r;
};

/* Also resolve on load — in case game was closed between apply and decision */
setTimeout(p80ResolvePendingApplications, 800);
setTimeout(p80ResolvePendingApplications, 2500);

/* =================================================================
   5. APPLY ACTIONS
   ================================================================= */
function p80ApplyEgyptPrivate(uniIndex, funding) {
  if (!S) return;
  const uni = P80_EGY_PRIVATE[uniIndex];
  if (!uni) return hint('University not found.');

  /* Check education system is accepted */
  const sys = (S.p78 && S.p78.educationSystem) || 'thanaweya';
  if (uni.accepts.indexOf(sys) === -1) return hint('This university does not accept your education system.');

  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  if (gpa < uni.reqGpa) return hint('GPA too low: needs ' + uni.reqGpa + '+');
  if (ielts < uni.ielts) return hint('IELTS too low: needs ' + uni.ielts + '+');

  const feeEGP = Math.round(500 * 52.7 * p80Idx());
  const internal = feeEGP / p80Rate();
  if (S.wealth < internal) return hint('Application fee: E£' + feeEGP.toLocaleString());

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;

  p79Init(S);
  S.p79.appliedUnis = S.p79.appliedUnis || [];
  const year1CostEGP = p80TuitionEGP(uni) * (1 + 0.15);   /* tuition + living */
  S.p79.appliedUnis.push({
    uni: uni.name,
    country: 'egy',
    level: 'bachelor',
    funding: funding,
    appliedYear: gameYear(),
    appliedAbs: S.pacingAbsoluteMonth || 0,
    resolveAfterMonths: 2,
    resolveAfterYears: 0,
    resolved: false,
    result: null,
    reqGpa: uni.reqGpa,
    reqIelts: uni.ielts,
    tuitionUSD: uni.tuitionUSD || 0,
    tuitionEGP: p80TuitionEGP(uni),
    year1CostEGP: year1CostEGP,
    isEgyptPrivate: true
  });

  log('📤 Applied to ' + uni.name + ' · ' + funding + '. Fee: E£' + feeEGP.toLocaleString() + '.');
  realismNotice('Application submitted', uni.name + ' — ' + funding + '. Decision expected in 2 months.');
  hint(); render();
}
window.p80ApplyEgyptPrivate = p80ApplyEgyptPrivate;

function p80ApplyAbroad(country, index, funding) {
  if (!S) return;
  const unis = P80_INT_UNIS[country] || [];
  const uni = unis[index];
  if (!uni) return hint('University not found.');

  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  if (gpa < uni.req) return hint('GPA too low: needs ' + uni.req + '+');
  if (ielts < uni.ielts) return hint('IELTS too low: needs ' + uni.ielts + '+');

  const feeEGP = Math.round(100 * 52.7 * p80Idx());
  const internal = feeEGP / p80Rate();
  if (S.wealth < internal) return hint('Application fee: E£' + feeEGP.toLocaleString());

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;

  p79Init(S);
  S.p79.appliedUnis = S.p79.appliedUnis || [];
  S.p79.appliedUnis.push({
    uni: uni.n,
    country: country,
    level: 'bachelor',
    funding: funding,
    appliedYear: gameYear(),
    appliedAbs: S.pacingAbsoluteMonth || 0,
    resolveAfterMonths: 3,
    resolveAfterYears: 0,
    resolved: false,
    result: null,
    reqGpa: uni.req,
    reqIelts: uni.ielts,
    tuitionUSD: uni.tuition,
    year1CostEGP: p80Year1CostAbroad(country, uni.tuition)
  });

  log('📤 Applied to ' + uni.n + ' (' + country.toUpperCase() + ') · ' + funding + '. Fee: E£' + feeEGP.toLocaleString() + '.');
  realismNotice('Application submitted', uni.n + ' — ' + funding + '. Decision expected in 3 months.');
  hint(); render();
}
window.p80ApplyAbroad = p80ApplyAbroad;

/* =================================================================
   6. ENROLL INTO THE ADMITTED UNIVERSITY
   ================================================================= */
function p80EnrollFromApp(uniName) {
  p79Init(S);
  const app = (S.p79.appliedUnis || []).find(function (a) { return a.uni === uniName && a.result && a.result.indexOf('admitted') === 0; });
  if (!app) return hint('No admission to accept.');

  /* Egyptian private */
  if (app.isEgyptPrivate) {
    const uni = P80_EGY_PRIVATE.find(function (u) { return u.name === app.uni; });
    const facultyMap = { 'auc': 'Business', 'guc': 'Engineering', 'bue': 'Dentistry', 'aastmt': 'Engineering', 'buc': 'Medicine', 'miu': 'Business', 'msa': 'Business', 'nile': 'Engineering', 'future': 'Engineering', 'helwan_i': 'Business' };
    const faculty = facultyMap[uni.id] || 'Business';
    S.uni = {
      type: 'private',
      universityId: uni.id,
      universityName: uni.name,
      faculty: faculty,
      year: 0,
      yearsTotal: 4,
      annualCostEGP: p80TuitionEGP(uni),
      annualCostInternal: p80TuitionEGP(uni) / p80Rate(),
      pay: app.funding === 'parents' ? 'parents' : 'self',
      scholar: app.funding === 'scholarship'
    };
    log('🎓 Enrolled at ' + uni.name + ' — Faculty of ' + faculty + '.');
    realismNotice('Enrolled at private university', uni.name + ' · ' + faculty + '. Tuition E£' + p80TuitionEGP(uni).toLocaleString() + '/year.');
    app.resolved = true;
    app.result = 'enrolled';
    hint(); render();
    return;
  }

  /* Abroad */
  const cc = COUNTRIES[app.country] || {};
  /* Move abroad and set enrollment */
  S.country = app.country;
  S.cf = null;
  if (typeof setWorld === 'function') setWorld(S);
  S.p69 = S.p69 || {};
  S.p69.enrolled = {
    uni: app.uni,
    country: app.country,
    level: 'bachelor',
    funding: { name: app.scholarship || app.funding, cover: app.cover || (app.funding === 'parents' ? 1 : 0) },
    field: 'General'
  };
  S.p73 = S.p73 || {};
  S.p73.abroadStartedYear = gameYear();
  S.p73.abroadField = 'General';
  /* Deduct year-1 cost if self-funded */
  if (app.funding === 'self') {
    const cost = (app.year1CostEGP || 0) / p80Rate();
    if (S.wealth >= cost) S.wealth -= cost;
  }
  log('✈️ Enrolled at ' + app.uni + ' in ' + cc.n + '.');
  realismNotice('Enrolled abroad', 'You are now studying at ' + app.uni + ' in ' + cc.n + '.');
  app.result = 'enrolled';
  hint(); render();
}
window.p80EnrollFromApp = p80EnrollFromApp;

/* =================================================================
   7. MODAL — Egypt + Abroad options
   ================================================================= */
function p80ShowPathwayModal() {
  if (!S) return;
  const rate = p80Rate();
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  const bankEGP = Math.round(S.wealth * rate);
  const tier = (S.p76 && S.p76.wealthLevel) || 0;
  const sys = (S.p78 && S.p78.educationSystem) || 'thanaweya';

  /* Egyptian private universities */
  const egyCards = P80_EGY_PRIVATE.map(function (uni, i) {
    const accepted = uni.accepts.indexOf(sys) !== -1;
    const gpaOK = gpa >= uni.reqGpa;
    const ieltsOK = ielts >= uni.ielts;
    const canApply = accepted && gpaOK && ieltsOK;
    const tuitionEGP = p80TuitionEGP(uni);
    const tuitionLabel = uni.tuitionUSD ? '$' + uni.tuitionUSD.toLocaleString() + '/yr (~E£' + tuitionEGP.toLocaleString() + ')' : 'E£' + tuitionEGP.toLocaleString() + '/yr';

    return '<div style="margin-top:8px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
      '<div style="flex:1;min-width:0"><b style="font-size:.86rem">' + uni.name + '</b>' +
      '<div class="muted" style="font-size:.72rem;margin-top:2px">' + uni.notes + '</div>' +
      '<div class="muted" style="font-size:.72rem;margin-top:4px"><b>' + tuitionLabel + '</b> · Needs GPA ' + uni.reqGpa + '+ · IELTS ' + uni.ielts + '+</div>' +
      '</div></div>' +
      (canApply
        ? '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:8px">' +
          '<button class="btn" style="margin:0;padding:5px;font-size:.7rem" onclick="p80ApplyEgyptPrivate(' + i + ',\'self\')">Self</button>' +
          '<button class="btn" style="margin:0;padding:5px;font-size:.7rem" onclick="p80ApplyEgyptPrivate(' + i + ',\'scholarship\')">Scholarship</button>' +
          '<button class="btn" style="margin:0;padding:5px;font-size:.7rem" onclick="p80ApplyEgyptPrivate(' + i + ',\'parents\')">Family</button>' +
          '</div>'
        : '<p style="color:var(--rose);font-size:.72rem;margin-top:5px">' +
          (!accepted ? '❌ Does not accept ' + sys + '. ' : '') +
          (!gpaOK ? '❌ GPA ' + gpa.toFixed(2) + ' < ' + uni.reqGpa + '. ' : '') +
          (!ieltsOK ? '❌ IELTS ' + (ielts || 'none') + ' < ' + uni.ielts + '.' : '') +
          '</p>') +
      '</div>';
  }).join('');

  /* Applications in progress */
  const inProg = (S.p79 && Array.isArray(S.p79.appliedUnis)) ? S.p79.appliedUnis.filter(function (a) { return !a.resolved; }) : [];
  const inProgHtml = inProg.length ? '<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line)">' +
    '<b style="font-size:.85rem;color:var(--amber)">⏳ Applications in progress</b>' +
    inProg.map(function (a) {
      const cc = COUNTRIES[a.country] || {};
      const flag = cc.f || (a.isEgyptPrivate ? '🇪🇬' : '');
      return '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + flag + ' ' + a.uni + '</span><b>' + a.funding + '</b></div>';
    }).join('') + '</div>' : '';

  /* Admitted offers */
  const admitted = (S.p79 && Array.isArray(S.p79.appliedUnis)) ? S.p79.appliedUnis.filter(function (a) { return a.result && a.result.indexOf('admitted') === 0; }) : [];
  const admitHtml = admitted.length ? '<div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line)">' +
    '<b style="font-size:.85rem;color:var(--mint)">✅ Admission offers — click to enroll</b>' +
    admitted.map(function (a) {
      const cc = COUNTRIES[a.country] || {};
      const flag = cc.f || (a.isEgyptPrivate ? '🇪🇬' : '');
      const funding = a.scholarship ? ' · ' + a.scholarship : (a.funding === 'parents' ? ' · Family' : ' · Self');
      return '<button class="btn" style="margin-top:6px;text-align:left;background:rgba(52,211,153,.15);border-color:var(--mint)" onclick="p80EnrollFromApp(\'' + a.uni.replace(/'/g, "\\'") + '\')">' +
        flag + ' <b>' + a.uni + '</b>' + funding +
        '<small>Click to accept and enroll</small>' +
        '</button>';
    }).join('') + '</div>' : '';

  const existing = document.getElementById('p80-path-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'p80-path-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
  modal.innerHTML = '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:540px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
    '<b style="font-size:1rem">🎓 Apply to universities</b>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p80-path-modal\').remove()">✕</button>' +
    '</div>' +
    '<p class="muted" style="font-size:.78rem;margin-top:8px">GPA <b>' + gpa.toFixed(2) + '</b> · IELTS <b>' + (ielts || 'none') + '</b> · Bank <b>E£' + bankEGP.toLocaleString() + '</b> · System <b>' + sys + '</b></p>' +

    '<h4 style="font-size:.9rem;color:var(--cyan);margin-top:14px">🇪🇬 Egyptian private universities</h4>' +
    '<p class="muted" style="font-size:.75rem">These accept your education system and are close to home. Rich families often choose this route.</p>' +
    egyCards +

    '<div style="margin-top:18px;padding:12px;background:rgba(139,92,246,.08);border-radius:8px">' +
    '<b style="font-size:.85rem">🌍 Study abroad</b>' +
    '<p class="muted" style="font-size:.75rem;margin-top:4px">Apply to universities in the UK, USA, Germany, Canada, France, Netherlands, Australia. Longer commitment, higher costs, but international career and immigration path.</p>' +
    '<button class="btn" style="margin-top:8px" onclick="document.getElementById(\'p80-path-modal\').remove();p80ShowAbroadModal()">Open study-abroad list</button>' +
    '</div>' +

    inProgHtml +
    admitHtml +
    '</div>';
  document.body.appendChild(modal);
}
window.p80ShowPathwayModal = p80ShowPathwayModal;

function p80ShowAbroadModal() {
  if (!S) return;
  p80Init(S);
  const rate = p80Rate();
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  const bankEGP = Math.round(S.wealth * rate);

  const countries = Object.keys(P80_INT_UNIS);
  const active = S.p80.modalCountry || 'gbr';
  S.p80.modalCountry = active;

  const unis = P80_INT_UNIS[active] || [];
  const schols = P80_INT_SCHOLARSHIPS[active] || [];
  const c = COUNTRIES[active] || {};

  const countryTabs = countries.map(function (code) {
    const cc = COUNTRIES[code] || {};
    const sel = code === active;
    return '<button class="btn ' + (sel ? 'sel' : '') + '" style="margin:0;padding:5px;font-size:.7rem;flex:1;min-width:60px" onclick="p80SwitchAbroad(\'' + code + '\')">' +
      (cc.f || '') + ' ' + (cc.n || code) + '</button>';
  }).join('');

  const uniCards = unis.map(function (uni, i) {
    const tuitionEGP = Math.round(uni.tuition * 52.7 * p80Idx());
    const canApply = gpa >= uni.req && ielts >= uni.ielts;
    const alreadyApplied = (S.p79 && Array.isArray(S.p79.appliedUnis)) && S.p79.appliedUnis.some(function (a) { return a.uni === uni.n; });

    return '<div style="margin-top:8px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<b style="font-size:.86rem">' + uni.n + '</b> <span class="muted" style="font-size:.7rem">· Tier ' + uni.tier + '</span>' +
      '<div class="row" style="border:0;padding:2px 0;font-size:.74rem"><span>Tuition/year</span><b class="mono">' + (uni.tuition === 0 ? 'FREE' : 'E£' + tuitionEGP.toLocaleString()) + '</b></div>' +
      '<div class="row" style="border:0;padding:2px 0;font-size:.74rem"><span>Needs</span><b>GPA ' + uni.req + '+ · IELTS ' + uni.ielts + '+</b></div>' +
      (alreadyApplied
        ? '<p style="color:var(--amber);font-size:.74rem;margin-top:5px">⏳ Application submitted</p>'
        : canApply
          ? '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin-top:6px">' +
            '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80ApplyAbroad(\'' + active + '\',' + i + ',\'self\')">Self</button>' +
            '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80ApplyAbroad(\'' + active + '\',' + i + ',\'scholarship\')">Scholarship</button>' +
            '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80ApplyAbroad(\'' + active + '\',' + i + ',\'parents\')">Family</button>' +
            '</div>'
          : '<p style="color:var(--rose);font-size:.7rem;margin-top:5px">' +
            (gpa < uni.req ? '❌ GPA ' + gpa.toFixed(2) + ' < ' + uni.req + '. ' : '') +
            (ielts < uni.ielts ? '❌ IELTS ' + (ielts || 'none') + ' < ' + uni.ielts + '.' : '') +
            '</p>') +
      '</div>';
  }).join('');

  const scholsHtml = schols.length ? '<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">' +
    '<b style="font-size:.82rem;color:var(--cyan)">Scholarships for ' + (c.n || active) + '</b>' +
    schols.map(function (s) {
      const ok = gpa >= s.reqGpa && ielts >= s.reqIelts;
      return '<div style="margin-top:6px;padding:8px;border-left:3px solid ' + (ok ? 'var(--mint)' : 'var(--line)') + ';background:rgba(255,255,255,.02);border-radius:4px">' +
        '<b style="font-size:.78rem">' + s.name + '</b> <span style="color:var(--mint);font-size:.7rem">· ' + Math.round(s.cover * 100) + '%</span>' +
        '<div class="muted" style="font-size:.7rem;margin-top:2px">Needs GPA ' + s.reqGpa + '+ · IELTS ' + s.reqIelts + '+</div>' +
        (ok ? '<div style="color:var(--mint);font-size:.7rem;margin-top:3px">✓ You qualify</div>' : '') +
        '</div>';
    }).join('') + '</div>' : '';

  const existing = document.getElementById('p80-abroad-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'p80-abroad-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
  modal.innerHTML = '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:540px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
    '<b style="font-size:1rem">🌍 Study abroad</b>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p80-abroad-modal\').remove()">✕</button>' +
    '</div>' +
    '<p class="muted" style="font-size:.78rem;margin-top:8px">GPA <b>' + gpa.toFixed(2) + '</b> · IELTS <b>' + (ielts || 'none') + '</b> · Bank <b>E£' + bankEGP.toLocaleString() + '</b></p>' +
    '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">' + countryTabs + '</div>' +
    '<div style="margin-top:12px">' + uniCards + '</div>' +
    scholsHtml +
    '<button class="btn" style="margin-top:14px" onclick="document.getElementById(\'p80-abroad-modal\').remove();p80ShowPathwayModal()">← Back to Egyptian private universities</button>' +
    '</div>';
  document.body.appendChild(modal);
}
window.p80ShowAbroadModal = p80ShowAbroadModal;

function p80SwitchAbroad(country) {
  p80Init(S);
  S.p80.modalCountry = country;
  p80ShowAbroadModal();
}
window.p80SwitchAbroad = p80SwitchAbroad;

/* =================================================================
   8. CLEAN REBUILD OF EDUCATION TAB
   ================================================================= */
const P80_viewSchoolBefore = viewSchool;
viewSchool = function () {
  if (!S) return P80_viewSchoolBefore.apply(this, arguments);

  /* Handle the "ready for university" state — no matter the system */
  if (!S.uni && !S.degree && S.diploma && S.age >= 15) {
    return p80BuildReadyForUniView();
  }

  let html = P80_viewSchoolBefore.apply(this, arguments);
  html = p80DedupEverything(html);
  return html;
};

function p80DedupEverything(html) {
  if (!html) return html;

  /* Dedup by section title (H3) */
  const seenTitles = {};
  const h3re = /<section class="card"[^>]*>\s*<h3>([^<]+)<\/h3>/g;
  const starts = [];
  let m;
  while ((m = h3re.exec(html)) !== null) {
    starts.push({ idx: m.index, title: m[1].trim() });
  }
  for (let i = starts.length - 1; i >= 0; i--) {
    const s = starts[i];
    if (seenTitles[s.title] === undefined) {
      seenTitles[s.title] = s.idx;
      continue;
    }
    /* Duplicate — find section end and remove */
    let end = html.indexOf('</section>', s.idx);
    if (end === -1) continue;
    end += '</section>'.length;
    html = html.slice(0, s.idx) + html.slice(end);
  }

  /* Special handling for EDUCATION STATUS inside a div */
  const statusMatches = html.match(/<section class="card"[^>]*>\s*<div[^>]*>EDUCATION STATUS[\s\S]*?<\/section>/g);
  if (statusMatches && statusMatches.length > 1) {
    let count = 0;
    html = html.replace(/<section class="card"[^>]*>\s*<div[^>]*>EDUCATION STATUS[\s\S]*?<\/section>/g, function (match) {
      count++;
      return count === 1 ? match : '';
    });
  }

  return html;
}

/* =================================================================
   9. READY-FOR-UNIVERSITY VIEW
   ================================================================= */
function p80BuildReadyForUniView() {
  p80Init(S);
  const rate = p80Rate();
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
  const gpaColor = gpa >= 3.7 ? 'var(--mint)' : gpa >= 3.0 ? 'var(--cyan)' : gpa >= 2.0 ? 'var(--amber)' : 'var(--rose)';
  const bankEGP = Math.round(S.wealth * rate);
  const sys = (S.p78 && S.p78.educationSystem) || 'thanaweya';
  const sysLabel = (typeof p78EducationSystemLabel === 'function') ? p78EducationSystemLabel(sys) : sys;
  const isIntl = ['igcse', 'american', 'ib'].indexOf(sys) !== -1;
  const tier = (S.p76 && S.p76.wealthLevel) || 2;

  let html = '';

  /* Status card */
  html += '<section class="card" style="padding:14px;border-left:3px solid var(--violet)">' +
    '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS</div>' +
    '<div style="font-size:1.15rem;font-weight:700;margin-top:4px">🎓 Ready for university</div>' +
    '<div class="muted" style="font-size:.82rem;margin-top:2px">' + sysLabel + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px">' +
    '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
    '<div class="muted" style="font-size:.66rem;text-transform:uppercase">GPA</div>' +
    '<div class="mono" style="font-size:1rem;font-weight:700;margin-top:3px;color:' + gpaColor + '">' + gpa.toFixed(2) + '</div>' +
    '</div>' +
    '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
    '<div class="muted" style="font-size:.66rem;text-transform:uppercase">IELTS</div>' +
    '<div class="mono" style="font-size:1rem;font-weight:700;margin-top:3px">' + (S.ielts || '—') + '</div>' +
    '</div>' +
    '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
    '<div class="muted" style="font-size:.66rem;text-transform:uppercase">Bank</div>' +
    '<div class="mono" style="font-size:.85rem;font-weight:700;margin-top:3px">E£' + Math.round(bankEGP / 1000) + 'k</div>' +
    '</div>' +
    '</div>' +
    '</section>';

  /* What to do next — pathway buttons */
  html += '<section class="card"><h3>✅ What to do next</h3>' +
    '<button class="btn" style="text-align:left;background:var(--violet);color:#fff;font-weight:700" onclick="p80ShowPathwayModal()">' +
    '🎓 Apply to universities' +
    '<small>Egyptian private universities (AUC, GUC, BUE...) AND study abroad</small>' +
    '</button>' +
    (!S.ielts && S.age >= 16 ? '<button class="btn" style="text-align:left" onclick="takeIelts()">📝 Take IELTS first</button>' : '') +
    '</section>';

  /* Thanaweya-only info (if system is Thanaweya) */
  if (sys === 'thanaweya' && (!S.p68 || !S.p68.thanaweyaTrack)) {
    html += '<section class="card" style="border-color:var(--amber)"><h3>📝 Thanaweya Amma track</h3>' +
      '<p class="muted" style="font-size:.82rem">Choose your national high-school track first — this determines public university eligibility.</p>' +
      '<button class="btn" onclick="p68ChooseTrack(\'adabi\')">📖 Adabi (Literary)</button>' +
      '<button class="btn" onclick="p68ChooseTrack(\'elmi-riyada\')">🔬 Elmi Riyada (Science-Math)</button>' +
      '<button class="btn" onclick="p68ChooseTrack(\'elmi-olom\')">🧬 Elmi Olom (Science-Biology)</button>' +
      '</section>';
  }

  /* In-progress applications */
  const inProg = (S.p79 && Array.isArray(S.p79.appliedUnis)) ? S.p79.appliedUnis.filter(function (a) { return !a.resolved; }) : [];
  if (inProg.length) {
    html += '<section class="card" style="border-color:var(--amber)"><h3>⏳ Applications in progress</h3>' +
      inProg.map(function (a) {
        const cc = COUNTRIES[a.country] || {};
        const flag = cc.f || (a.isEgyptPrivate ? '🇪🇬' : '');
        return '<div class="row" style="padding:4px 0;font-size:.82rem"><span>' + flag + ' ' + a.uni + '</span><b>' + a.funding + '</b></div>';
      }).join('') +
      '</section>';
  }

  /* Admission offers */
  const admits = (S.p79 && Array.isArray(S.p79.appliedUnis)) ? S.p79.appliedUnis.filter(function (a) { return a.result && a.result.indexOf('admitted') === 0; }) : [];
  if (admits.length) {
    html += '<section class="card" style="border-color:var(--mint)"><h3>✅ Admission offers</h3>' +
      admits.map(function (a) {
        const cc = COUNTRIES[a.country] || {};
        const flag = cc.f || (a.isEgyptPrivate ? '🇪🇬' : '');
        const fundingLabel = a.scholarship ? ' · ' + a.scholarship : (a.funding === 'parents' ? ' · Family' : ' · Self');
        return '<button class="btn" style="margin-top:6px;text-align:left;background:rgba(52,211,153,.15);border-color:var(--mint)" onclick="p80EnrollFromApp(\'' + a.uni.replace(/'/g, "\\'") + '\')">' +
          flag + ' <b>' + a.uni + '</b>' + fundingLabel +
          '<small>Click to accept and enroll</small>' +
          '</button>';
      }).join('') +
      '</section>';
  }

  /* Results */
  const results = (S.p79 && Array.isArray(S.p79.appliedUnis)) ? S.p79.appliedUnis.filter(function (a) { return a.resolved && a.result === 'rejected'; }) : [];
  if (results.length) {
    html += '<section class="card"><h3>📋 Recent results</h3>' +
      results.slice(-3).reverse().map(function (a) {
        const cc = COUNTRIES[a.country] || {};
        const flag = cc.f || (a.isEgyptPrivate ? '🇪🇬' : '');
        return '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + flag + ' ' + a.uni + '</span><b style="color:var(--rose)">Rejected</b></div>';
      }).join('') +
      '</section>';
  }

  /* English + IELTS */
  html += '<section class="card"><h3>🇬🇧 English — ' + (S.eng || 0) + '%</h3>' +
    '<button class="btn" onclick="takeEng(0)">Self-study · Free</button>' +
    '<button class="btn" onclick="takeEng(1)">Online · +5</button>' +
    '<button class="btn" onclick="takeEng(2)">Institute · +9</button>' +
    '<button class="btn" onclick="takeEng(3)">Intensive · +14</button>' +
    '</section>';

  html += '<section class="card"><h3>📝 IELTS / TOEFL</h3>' +
    '<div class="row"><span>IELTS</span><b>' + (S.ielts || 'Not taken') + '</b></div>' +
    '<div class="row"><span>TOEFL</span><b>' + (S.toefl ? S.toefl + '/120' : 'Not taken') + '</b></div>' +
    '<button class="btn" onclick="takeIelts()">Take IELTS</button>' +
    '</section>';

  /* Passport */
  if (S.age >= 16 && typeof passportCard === 'function') {
    const passportHtml = passportCard();
    if (passportHtml) html += passportHtml;
  }

  return html;
}

/* =================================================================
   10. INIT
   ================================================================= */
p80Init(S);
/* Mark existing application requests with resolve timing for old saves */
if (S && S.p79 && Array.isArray(S.p79.appliedUnis)) {
  S.p79.appliedUnis.forEach(function (a) {
    if (a && !a.resolveAfterMonths) {
      a.resolveAfterMonths = 3;
      a.appliedAbs = a.appliedAbs || Number(S.pacingAbsoluteMonth) || 0;
      a.appliedYear = a.appliedYear || gameYear();
    }
  });
}
setTimeout(p80ResolvePendingApplications, 500);

console.log('[p80 v2] Egyptian private + abroad + tick-based resolution loaded');
