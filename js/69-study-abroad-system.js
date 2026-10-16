/* =====================================================================
   69. STUDY ABROAD SYSTEM — Real universities, scholarships, full flow
   - Bachelor's abroad (not just master's)
   - Thanaweya Amma score drives eligibility
   - Per-country university catalog with real names
   - Full application: fee → admission → funding → visa → travel
   - Language courses respect monthly pacing (cooldown per month, not per year)
   - Family funding option (based on famWealth + bond)
   - Scholarship types per country (Chevening, DAAD, Fulbright, MEXT, etc.)
   Load AFTER 68-car-education-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p69Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p69Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* =================================================================
   STATE
   ================================================================= */
function p69Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p69) o.p69 = {};
  const d = o.p69;
  if (!d.thanaweya) d.thanaweya = { score: null, track: null, year: null };
  if (!Array.isArray(d.applications)) d.applications = [];
  if (!d.enrolled) d.enrolled = null;
  if (!d.languageCooldowns || typeof d.languageCooldowns !== 'object') d.languageCooldowns = {};
  if (!d.abroadTarget) d.abroadTarget = null;
  if (!d.abroadLevel) d.abroadLevel = 'master';
  if (!d.pendingScholarships || typeof d.pendingScholarships !== 'object') d.pendingScholarships = {};
}
const P69_migrate = migrate;
migrate = function (o) { const r = P69_migrate(o); p69Init(r); return r; };
const P69_newGame = newGame;
newGame = function () { P69_newGame.apply(this, arguments); p69Init(S); };

/* =================================================================
   UNIVERSITY CATALOG (per country, real names)
   ================================================================= */
const P69_UNIS = {
  gbr: [
    { n: 'University of Oxford',       tier: 1, tu: 45000, gpaMin: 3.7, ielts: 7.5 },
    { n: 'University of Cambridge',    tier: 1, tu: 45000, gpaMin: 3.7, ielts: 7.5 },
    { n: 'Imperial College London',    tier: 1, tu: 42000, gpaMin: 3.5, ielts: 7.0 },
    { n: 'University College London',  tier: 1, tu: 38000, gpaMin: 3.4, ielts: 7.0 },
    { n: 'London School of Economics', tier: 1, tu: 40000, gpaMin: 3.5, ielts: 7.0 },
    { n: 'University of Edinburgh',    tier: 2, tu: 32000, gpaMin: 3.2, ielts: 6.5 },
    { n: 'King\'s College London',     tier: 2, tu: 34000, gpaMin: 3.2, ielts: 6.5 },
    { n: 'University of Manchester',   tier: 2, tu: 28000, gpaMin: 3.0, ielts: 6.5 },
    { n: 'University of Warwick',      tier: 2, tu: 30000, gpaMin: 3.1, ielts: 6.5 },
    { n: 'University of Bristol',      tier: 2, tu: 29000, gpaMin: 3.0, ielts: 6.5 }
  ],
  usa: [
    { n: 'Massachusetts Institute of Technology', tier: 1, tu: 55000, gpaMin: 3.8, ielts: 7.5 },
    { n: 'Harvard University',         tier: 1, tu: 55000, gpaMin: 3.8, ielts: 7.5 },
    { n: 'Stanford University',        tier: 1, tu: 55000, gpaMin: 3.8, ielts: 7.5 },
    { n: 'Yale University',            tier: 1, tu: 52000, gpaMin: 3.7, ielts: 7.0 },
    { n: 'Princeton University',       tier: 1, tu: 52000, gpaMin: 3.7, ielts: 7.0 },
    { n: 'University of California Berkeley', tier: 1, tu: 44000, gpaMin: 3.5, ielts: 7.0 },
    { n: 'University of Chicago',      tier: 1, tu: 52000, gpaMin: 3.6, ielts: 7.0 },
    { n: 'Columbia University',        tier: 1, tu: 55000, gpaMin: 3.6, ielts: 7.0 },
    { n: 'University of California Los Angeles', tier: 2, tu: 42000, gpaMin: 3.4, ielts: 7.0 },
    { n: 'New York University',        tier: 2, tu: 50000, gpaMin: 3.3, ielts: 7.0 }
  ],
  deu: [
    { n: 'Technical University of Munich', tier: 1, tu: 0, gpaMin: 3.5, ielts: 6.5 },
    { n: 'Ludwig Maximilian University Munich', tier: 1, tu: 0, gpaMin: 3.4, ielts: 6.5 },
    { n: 'Heidelberg University',      tier: 1, tu: 0, gpaMin: 3.4, ielts: 6.5 },
    { n: 'RWTH Aachen University',     tier: 1, tu: 0, gpaMin: 3.3, ielts: 6.5 },
    { n: 'Free University of Berlin',  tier: 2, tu: 0, gpaMin: 3.0, ielts: 6.0 },
    { n: 'Humboldt University of Berlin', tier: 2, tu: 0, gpaMin: 3.0, ielts: 6.0 },
    { n: 'Technical University of Berlin', tier: 2, tu: 0, gpaMin: 3.0, ielts: 6.0 },
    { n: 'University of Freiburg',     tier: 2, tu: 0, gpaMin: 3.0, ielts: 6.0 }
  ],
  fra: [
    { n: 'Sorbonne University',        tier: 1, tu: 3000, gpaMin: 3.4, ielts: 6.5 },
    { n: 'Sciences Po Paris',          tier: 1, tu: 14000, gpaMin: 3.5, ielts: 7.0 },
    { n: 'HEC Paris',                  tier: 1, tu: 22000, gpaMin: 3.6, ielts: 7.0 },
    { n: 'École Polytechnique',        tier: 1, tu: 8000, gpaMin: 3.6, ielts: 6.5 },
    { n: 'École Normale Supérieure',   tier: 1, tu: 3000, gpaMin: 3.7, ielts: 6.5 },
    { n: 'Université Paris-Saclay',    tier: 2, tu: 4000, gpaMin: 3.2, ielts: 6.0 }
  ],
  can: [
    { n: 'University of Toronto',      tier: 1, tu: 35000, gpaMin: 3.5, ielts: 6.5 },
    { n: 'McGill University',          tier: 1, tu: 25000, gpaMin: 3.4, ielts: 6.5 },
    { n: 'University of British Columbia', tier: 1, tu: 32000, gpaMin: 3.4, ielts: 6.5 },
    { n: 'University of Waterloo',     tier: 1, tu: 28000, gpaMin: 3.4, ielts: 6.5 },
    { n: 'McMaster University',        tier: 2, tu: 24000, gpaMin: 3.2, ielts: 6.5 },
    { n: 'University of Alberta',      tier: 2, tu: 20000, gpaMin: 3.0, ielts: 6.5 }
  ],
  nld: [
    { n: 'Delft University of Technology', tier: 1, tu: 18000, gpaMin: 3.4, ielts: 6.5 },
    { n: 'University of Amsterdam',    tier: 1, tu: 16000, gpaMin: 3.3, ielts: 6.5 },
    { n: 'Utrecht University',         tier: 1, tu: 15000, gpaMin: 3.2, ielts: 6.5 },
    { n: 'Leiden University',          tier: 2, tu: 14000, gpaMin: 3.1, ielts: 6.5 },
    { n: 'Erasmus University Rotterdam', tier: 2, tu: 16000, gpaMin: 3.2, ielts: 6.5 }
  ],
  ita: [
    { n: 'University of Bologna',      tier: 1, tu: 3000, gpaMin: 3.2, ielts: 6.0 },
    { n: 'Politecnico di Milano',      tier: 1, tu: 3500, gpaMin: 3.3, ielts: 6.0 },
    { n: 'Sapienza University of Rome', tier: 1, tu: 2900, gpaMin: 3.2, ielts: 6.0 },
    { n: 'University of Padua',        tier: 2, tu: 2700, gpaMin: 3.0, ielts: 6.0 }
  ],
  aus: [
    { n: 'University of Melbourne',    tier: 1, tu: 32000, gpaMin: 3.4, ielts: 6.5 },
    { n: 'University of Sydney',       tier: 1, tu: 34000, gpaMin: 3.3, ielts: 6.5 },
    { n: 'Australian National University', tier: 1, tu: 30000, gpaMin: 3.3, ielts: 6.5 },
    { n: 'University of New South Wales', tier: 2, tu: 32000, gpaMin: 3.2, ielts: 6.5 },
    { n: 'Monash University',          tier: 2, tu: 30000, gpaMin: 3.1, ielts: 6.5 }
  ],
  jpn: [
    { n: 'University of Tokyo',        tier: 1, tu: 5000, gpaMin: 3.5, ielts: 6.5 },
    { n: 'Kyoto University',           tier: 1, tu: 5000, gpaMin: 3.4, ielts: 6.5 },
    { n: 'Osaka University',           tier: 1, tu: 5000, gpaMin: 3.2, ielts: 6.0 },
    { n: 'Tohoku University',          tier: 2, tu: 5000, gpaMin: 3.0, ielts: 6.0 },
    { n: 'Waseda University',          tier: 2, tu: 9000, gpaMin: 3.0, ielts: 6.0 }
  ],
  kor: [
    { n: 'Seoul National University',  tier: 1, tu: 6000, gpaMin: 3.4, ielts: 6.5 },
    { n: 'KAIST',                      tier: 1, tu: 6000, gpaMin: 3.5, ielts: 6.5 },
    { n: 'Yonsei University',          tier: 1, tu: 8000, gpaMin: 3.2, ielts: 6.0 },
    { n: 'Korea University',           tier: 1, tu: 7500, gpaMin: 3.2, ielts: 6.0 }
  ],
  sgp: [
    { n: 'National University of Singapore', tier: 1, tu: 30000, gpaMin: 3.6, ielts: 6.5 },
    { n: 'Nanyang Technological University', tier: 1, tu: 28000, gpaMin: 3.5, ielts: 6.5 },
    { n: 'Singapore Management University', tier: 2, tu: 32000, gpaMin: 3.3, ielts: 6.5 }
  ],
  sau: [
    { n: 'King Fahd University of Petroleum and Minerals', tier: 1, tu: 8000, gpaMin: 3.2, ielts: 6.0 },
    { n: 'King Abdullah University of Science and Technology', tier: 1, tu: 12000, gpaMin: 3.5, ielts: 6.5 },
    { n: 'King Saud University',       tier: 2, tu: 6000, gpaMin: 3.0, ielts: 6.0 }
  ],
  uae: [
    { n: 'NYU Abu Dhabi',              tier: 1, tu: 55000, gpaMin: 3.7, ielts: 7.0 },
    { n: 'American University of Sharjah', tier: 2, tu: 32000, gpaMin: 3.2, ielts: 6.5 },
    { n: 'Khalifa University',         tier: 2, tu: 28000, gpaMin: 3.3, ielts: 6.5 }
  ]
};

/* =================================================================
   SCHOLARSHIP CATALOG (per country)
   ================================================================= */
const P69_SCHOLARSHIPS = {
  gbr: [
    { id: 'chevening', name: 'Chevening Scholarship', cover: 1.0, gpaMin: 3.5, ielts: 7.0, chance: 0.15, note: 'UK government · full tuition + living + flights' },
    { id: 'commonwealth', name: 'Commonwealth Scholarship', cover: 1.0, gpaMin: 3.4, ielts: 6.5, chance: 0.12, note: 'Commonwealth countries only' },
    { id: 'uni-merit', name: 'University merit scholarship', cover: 0.5, gpaMin: 3.5, ielts: 6.5, chance: 0.35, note: 'Awarded by the university · 30-50% tuition' }
  ],
  usa: [
    { id: 'fulbright', name: 'Fulbright Foreign Student Program', cover: 1.0, gpaMin: 3.6, ielts: 7.0, chance: 0.10, note: 'US State Dept · full funding' },
    { id: 'uni-full', name: 'University full-ride scholarship', cover: 1.0, gpaMin: 3.8, ielts: 7.5, chance: 0.08, note: 'Need-blind elite universities only' },
    { id: 'uni-partial', name: 'University partial scholarship', cover: 0.5, gpaMin: 3.5, ielts: 7.0, chance: 0.30, note: 'Tuition discount · 30-50%' }
  ],
  deu: [
    { id: 'daad', name: 'DAAD Scholarship', cover: 1.0, gpaMin: 3.4, ielts: 6.5, chance: 0.18, note: 'German Academic Exchange · full funding + stipend' },
    { id: 'erasmus', name: 'Erasmus+ Scholarship', cover: 0.8, gpaMin: 3.2, ielts: 6.5, chance: 0.22, note: 'EU mobility program' }
  ],
  fra: [
    { id: 'eiffel', name: 'Eiffel Excellence Scholarship', cover: 1.0, gpaMin: 3.5, ielts: 6.5, chance: 0.14, note: 'French government · full funding' },
    { id: 'uni-partial-fra', name: 'University tuition discount', cover: 0.4, gpaMin: 3.2, ielts: 6.0, chance: 0.30, note: 'Partial tuition waiver' }
  ],
  can: [
    { id: 'vanier', name: 'Vanier Canada Graduate Scholarship', cover: 1.0, gpaMin: 3.7, ielts: 7.0, chance: 0.10, note: 'Doctoral level only' },
    { id: 'uni-partial-can', name: 'University entrance scholarship', cover: 0.4, gpaMin: 3.3, ielts: 6.5, chance: 0.35, note: 'Merit-based discount' }
  ],
  nld: [
    { id: 'ots', name: 'Orange Tulip Scholarship', cover: 0.6, gpaMin: 3.3, ielts: 6.5, chance: 0.25, note: 'For specific countries including Egypt' },
    { id: 'holland', name: 'Holland Scholarship', cover: 0.3, gpaMin: 3.2, ielts: 6.5, chance: 0.40, note: 'EUR 5000 one-time' }
  ],
  ita: [
    { id: 'invest', name: 'Invest Your Talent in Italy', cover: 1.0, gpaMin: 3.3, ielts: 6.0, chance: 0.20, note: 'Full tuition + living · for Egypt and other countries' },
    { id: 'uni-partial-ita', name: 'University merit award', cover: 0.4, gpaMin: 3.0, ielts: 6.0, chance: 0.40, note: 'Tuition discount' }
  ],
  aus: [
    { id: 'australia-awards', name: 'Australia Awards', cover: 1.0, gpaMin: 3.4, ielts: 6.5, chance: 0.15, note: 'Australian government · full funding' },
    { id: 'uni-partial-aus', name: 'University merit scholarship', cover: 0.3, gpaMin: 3.2, ielts: 6.5, chance: 0.40, note: 'Tuition discount' }
  ],
  jpn: [
    { id: 'mext', name: 'MEXT Scholarship', cover: 1.0, gpaMin: 3.4, ielts: 6.0, chance: 0.15, note: 'Japanese government · full funding' },
    { id: 'jasso', name: 'JASSO Honors Scholarship', cover: 0.2, gpaMin: 3.0, ielts: 6.0, chance: 0.35, note: 'Monthly stipend' }
  ],
  kor: [
    { id: 'gks', name: 'Global Korea Scholarship (GKS)', cover: 1.0, gpaMin: 3.3, ielts: 6.0, chance: 0.18, note: 'Korean government · full funding' }
  ],
  sgp: [
    { id: 'sgs', name: 'Singapore Government Scholarship', cover: 1.0, gpaMin: 3.6, ielts: 6.5, chance: 0.12, note: 'Full funding + bond to work in Singapore' },
    { id: 'uni-partial-sgp', name: 'University tuition grant', cover: 0.5, gpaMin: 3.4, ielts: 6.5, chance: 0.30, note: 'Tuition grant with work obligation' }
  ],
  sau: [
    { id: 'kaust', name: 'KAUST Fellowship', cover: 1.0, gpaMin: 3.5, ielts: 6.5, chance: 0.20, note: 'Full funding + stipend' },
    { id: 'kfupm', name: 'KFUPM Graduate Scholarship', cover: 1.0, gpaMin: 3.3, ielts: 6.0, chance: 0.25, note: 'Full funding' }
  ],
  uae: [
    { id: 'khalifa', name: 'Khalifa University Scholarship', cover: 1.0, gpaMin: 3.5, ielts: 6.5, chance: 0.20, note: 'Full funding + stipend' },
    { id: 'nyuad', name: 'NYUAD Merit Scholarship', cover: 1.0, gpaMin: 3.7, ielts: 7.0, chance: 0.15, note: 'Full need-based aid' }
  ]
};

/* =================================================================
   THANAWEYA AMMA SCORE (from smarts + GPA + effort)
   ================================================================= */
function p69ComputeThanaweya() {
  if (!S) return 0;
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const smarts = S.smarts || 50;
  const effort = S.effort || 'coast';
  /* Formula: 60% smarts + 30% GPA + 10% effort noise */
  const gpaScore = (gpa / 4) * 100;
  const effortBonus = effort === 'hard' ? 6 : effort === 'coast' ? 0 : -10;
  let score = smarts * 0.6 + gpaScore * 0.3 + effortBonus + (Math.random() * 6 - 3);
  /* Egyptian high-school track bonus */
  if (S.p68 && S.p68.thanaweyaTrack === 'elmi-olom') score += 3;
  if (S.p68 && S.p68.thanaweyaTrack === 'elmi-riyada') score += 2;
  return Math.max(40, Math.min(100, Math.round(score * 10) / 10));
}

/* =================================================================
   APPLICATION FLOW
   ================================================================= */
function p69ApplyToUniversity(countryCode, uniName, level, fundingType) {
  p69Init(S);
  if (!S || S.age < 17) return hint('Too young.');

  const country = COUNTRIES[countryCode] || {};
  const uni = (P69_UNIS[countryCode] || []).find(function (u) { return u.n === uniName; });
  if (!uni) return hint('University not found.');

  /* Pre-check */
  const isBachelor = level === 'bachelor';
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  const thanaweya = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || 0;

  const requiredGPA = uni.gpaMin;
  const requiredIELTS = uni.ielts;

  if (isBachelor) {
    if (!S.diploma) return hint('You need a high-school diploma.');
    if (thanaweya < 70) return hint('Bachelor abroad usually needs a Thanaweya Amma score of 70%+. Yours: ' + thanaweya + '%');
  } else {
    if (!S.degree) return hint('You need a bachelor\'s degree first.');
    if (gpa < requiredGPA) return hint('This university requires GPA ' + requiredGPA + '+. Yours: ' + gpa.toFixed(2));
  }
  if (ielts < requiredIELTS) return hint('This university requires IELTS ' + requiredIELTS + '+. Yours: ' + (ielts || 'not taken'));

  /* Application fee */
  const feeUSD = uni.tier === 1 ? 120 : uni.tier === 2 ? 90 : 60;
  const feeEGP = Math.round(feeUSD * 52.7 * p69Idx());
  const feeInternal = feeEGP / p69Rate();
  if (S.wealth < feeInternal) return hint('Application fee is ' + feeEGP.toLocaleString() + ' EGP.');

  /* Deduct */
  S.wealth -= feeInternal;
  S.expenses = (S.expenses || 0) + feeInternal;
  S.bill = S.bill || {};
  S.bill.applicationFees = (S.bill.applicationFees || 0) + feeInternal;

  /* Create application */
  const app = {
    id: 'app_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    country: countryCode,
    uni: uniName,
    level: level,
    gpaAtApply: gpa,
    ieltsAtApply: ielts,
    thanaweyaAtApply: thanaweya,
    funding: fundingType,
    stage: 'submitted',
    appliedMonth: S.pacingAbsoluteMonth || 0,
    readyMonth: (S.pacingAbsoluteMonth || 0) + 2,
    admission: null,
    awarded: null,
    visaResult: null,
    fee: feeInternal
  };
  S.p69.applications.push(app);

  log('📤 Applied to ' + uniName + ' (' + country.n + ', ' + level + ', ' + fundingType + '). Fee: ' + feeEGP.toLocaleString() + ' EGP. Decision in ~2 months.');
  realismNotice('Application submitted', 'Applied to ' + uniName + '. The university will decide within 2 game months. Track progress in the Education tab.');
  hint(); render();
}
window.p69ApplyToUniversity = p69ApplyToUniversity;

/* Process applications each month */
function p69TickApplications() {
  p69Init(S);
  if (!S || !S.p69 || !Array.isArray(S.p69.applications)) return;
  const absMonth = S.pacingAbsoluteMonth || 0;

  S.p69.applications.forEach(function (app) {
    if (!app || app.stage === 'completed' || app.stage === 'refused') return;

    /* Admission decision */
    if (app.stage === 'submitted' && absMonth >= app.readyMonth) {
      const uni = (P69_UNIS[app.country] || []).find(function (u) { return u.n === app.uni; });
      if (!uni) { app.stage = 'refused'; return; }
      /* Admission chance */
      const gpaDelta = app.gpaAtApply - uni.gpaMin;
      const ieltsDelta = app.ieltsAtApply - uni.ielts;
      const thanaBonus = app.level === 'bachelor' ? (app.thanaweyaAtApply - 70) / 100 : 0;
      let chance = 0.25 + gpaDelta * 0.6 + ieltsDelta * 0.1 + thanaBonus;
      if (app.level === 'bachelor') chance += 0.05;
      /* Target universities competitive */
      if (uni.tier === 1) chance -= 0.15;
      chance = Math.max(0.05, Math.min(0.92, chance));

      if (Math.random() < chance) {
        app.admission = 'admitted';
        app.stage = 'admitted';
        log('✅ ADMITTED to ' + app.uni + ' (' + COUNTRIES[app.country].n + ')! Now processing funding.');
        realismNotice('University admission', 'You were admitted to ' + app.uni + ' for a ' + app.level + '\'s program. Next step: funding decision.');
      } else {
        app.admission = 'refused';
        app.stage = 'refused';
        log('❌ ' + app.uni + ' rejected your application.');
        realismNotice('Application rejected', 'Your application to ' + app.uni + ' was rejected. The fee was not refunded.');
      }
      return;
    }

    /* Funding decision */
    if (app.stage === 'admitted' && !app.awarded) {
      /* Wait 1 more month for funding */
      if (absMonth < app.readyMonth + 1) return;
      p69ProcessFunding(app);
      return;
    }

    /* Visa decision */
    if (app.stage === 'funding-done' && !app.visaResult) {
      if (absMonth < app.readyMonth + 2) return;
      p69ProcessVisa(app);
      return;
    }
  });

  /* Cleanup old refused applications */
  S.p69.applications = S.p69.applications.filter(function (a) {
    return a && a.stage !== 'refused' || (absMonth - a.readyMonth < 6);
  });

  /* Auto-render if any change */
  if (S.p69.applications.length && activeTab === 'school') render();
}

function p69ProcessFunding(app) {
  const rate = p69Rate();
  const gpa = app.gpaAtApply;
  const ielts = app.ieltsAtApply;

  /* If self-funded, check the money */
  if (app.funding === 'self') {
    const year1 = p69Year1Cost(app.country);
    const bank = Math.round(S.wealth * rate);
    if (bank < year1) {
      app.awarded = { type: 'self', cover: 0, note: 'Self-funded — bank insufficient at decision time' };
      app.stage = 'funding-failed';
      log('⚠️ Admitted to ' + app.uni + ' but you no longer have the funds for year 1 (' + year1.toLocaleString() + ' EGP needed).');
      return;
    }
    app.awarded = { type: 'self', cover: 0, note: 'Self-funded' };
    app.stage = 'funding-done';
    log('💰 Funding: self-funded. Bank: ' + bank.toLocaleString() + ' EGP.');
    return;
  }

  /* If family-funded, check parents */
  if (app.funding === 'parents') {
    const fw = Number(S.famWealth) || 0;
    const aliveParents = (typeof parents === 'function') ? parents().length : 0;
    if (!aliveParents || fw === 0) {
      app.awarded = { type: 'parents', cover: 0, note: 'Parents cannot fund' };
      app.stage = 'funding-failed';
      log('⚠️ Admitted to ' + app.uni + ' but your parents cannot fund the program.');
      return;
    }
    const agreeChance = fw === 2 ? 0.85 : fw === 1 ? 0.35 : 0.05;
    if (Math.random() < agreeChance) {
      app.awarded = { type: 'parents', cover: 1.0, note: 'Family-funded' };
      app.stage = 'funding-done';
      log('💰 Parents agreed to fund your ' + app.level + '\'s at ' + app.uni + '.');
      realismNotice('Family funding approved', 'Your parents will cover tuition and living costs.');
    } else {
      app.awarded = { type: 'parents', cover: 0, note: 'Family refused funding' };
      app.stage = 'funding-failed';
      log('⚠️ Admitted to ' + app.uni + ' but your parents declined to fund it.');
    }
    return;
  }

  /* Scholarship applications */
  const pool = P69_SCHOLARSHIPS[app.country] || [];
  const eligible = pool.filter(function (s) {
    return gpa >= s.gpaMin && ielts >= s.ielts;
  });
  if (!eligible.length) {
    app.awarded = { type: 'none', cover: 0, note: 'No scholarship eligible' };
    app.stage = 'funding-failed';
    log('⚠️ Admitted to ' + app.uni + ' but no scholarship matched your profile.');
    return;
  }

  /* Pick highest-cover eligible scholarship */
  const target = eligible.reduce(function (best, s) { return s.cover > (best ? best.cover : 0) ? s : best; }, null);
  const bonus = Math.min(0.15, (gpa - target.gpaMin) * 0.1 + (ielts - target.ielts) * 0.05);
  const finalChance = Math.min(0.9, target.chance + bonus);

  if (Math.random() < finalChance) {
    app.awarded = { type: target.id, name: target.name, cover: target.cover, note: target.note };
    app.stage = 'funding-done';
    log('🏆 Awarded ' + target.name + ' (' + Math.round(target.cover * 100) + '% coverage)!');
    realismNotice('Scholarship awarded', target.name + ' — ' + target.note + '. Coverage: ' + Math.round(target.cover * 100) + '%.');
  } else {
    app.awarded = { type: 'none', cover: 0, note: 'Scholarship not awarded' };
    app.stage = 'funding-failed';
    log('⚠️ Admitted to ' + app.uni + ' but did not receive any scholarship.');
  }
}

function p69ProcessVisa(app) {
  const country = COUNTRIES[app.country];
  const base = {
    gbr: 0.75, usa: 0.65, can: 0.70, deu: 0.85, fra: 0.78, nld: 0.75,
    ita: 0.80, aus: 0.72, jpn: 0.78, kor: 0.75, sgp: 0.70, sau: 0.72, uae: 0.80
  }[app.country] || 0.70;
  /* Self-funded needs strong bank proof */
  const funded = app.awarded && (app.awarded.cover >= 1 || app.awarded.type === 'parents');
  const chance = funded ? Math.min(0.95, base + 0.12) : base;

  if (Math.random() < chance) {
    app.visaResult = 'approved';
    app.stage = 'visa-approved';
    log('✅ STUDENT VISA APPROVED for ' + app.uni + ' (' + country.n + ').');
    realismNotice('Student visa approved', 'Your visa to ' + country.n + ' was approved. You can now travel and enroll at ' + app.uni + '.');
  } else {
    app.visaResult = 'refused';
    app.stage = 'visa-refused';
    log('❌ Student visa for ' + country.n + ' was refused.');
    realismNotice('Visa refused', 'Your student visa was refused. The application fee is not refunded.');
  }
}

/* Year 1 cost for a country */
function p69Year1Cost(code) {
  const c = {
    ita: 2500 + 9500 + 90 + 580 + 700,
    fra: 5000 + 10500 + 100 + 620 + 800,
    jpn: 6000 + 12000 + 60 + 850 + 900,
    kor: 5500 + 11000 + 60 + 850 + 900,
    deu: 0 + 11500 + 11208 + 75 + 590 + 800,
    sau: 15000 + 11000 + 200 + 340 + 700,
    nld: 18000 + 12500 + 210 + 640 + 900,
    uae: 22000 + 14000 + 250 + 300 + 800,
    gbr: 25000 + 15000 + 490 + 650 + 1000,
    nzl: 24000 + 17000 + 430 + 1350 + 1000,
    sgp: 28000 + 16000 + 90 + 950 + 1000,
    aus: 28000 + 20000 + 710 + 1350 + 1200,
    can: 22000 + 16000 + 14000 + 150 + 1000 + 1200,
    usa: 35000 + 18000 + 185 + 1100 + 1500
  }[code] || 30000;
  return Math.round(c * 52.7 * p69Idx());
}

/* =================================================================
   LANGUAGE — MONTHLY COOLDOWN
   ================================================================= */
function p69CanTakeLang(lang) {
  p69Init(S);
  const cd = S.p69.languageCooldowns[lang] || { lastMonth: -100 };
  const abs = S.pacingAbsoluteMonth || 0;
  return (abs - (cd.lastMonth || -100)) >= 6;   /* 6 months minimum between courses */
}
function p69MarkLangTaken(lang) {
  p69Init(S);
  S.p69.languageCooldowns[lang] = { lastMonth: S.pacingAbsoluteMonth || 0 };
}
window.p69CanTakeLang = p69CanTakeLang;

/* Override English course handler to use cooldown */
const P69_takeEngBefore = (typeof takeEng === 'function') ? takeEng : null;
if (P69_takeEngBefore) {
  takeEng = function (i) {
    if (!p69CanTakeLang('english')) return hint('You took an English course recently. Wait at least 6 months.');
    const r = P69_takeEngBefore.apply(this, arguments);
    p69MarkLangTaken('english');
    return r;
  };
}

/* =================================================================
   UI — REPLACE THE ABROAD MASTER'S CARD + ADD BACHELOR FLOW
   ================================================================= */
const P69_viewSchoolBefore = viewSchool;
viewSchool = function () {
  if (!S) return P69_viewSchoolBefore.apply(this, arguments);
  p69Init(S);

  /* -------- 1. If there's an active application, show tracking card -------- */
  let html = '';
  const apps = S.p69.applications.filter(function (a) { return a && a.stage !== 'refused' || (a && a.stage === 'refused' && S.pacingAbsoluteMonth - a.readyMonth < 6); });

  if (apps.length) {
    html += '<section class="card" style="border-color:var(--violet)"><h3>📤 Study applications in progress</h3>';
    apps.forEach(function (app) {
      const country = COUNTRIES[app.country] || {};
      let status = '';
      let color = 'var(--amber)';
      if (app.stage === 'submitted') status = '⏳ Admission decision pending';
      else if (app.stage === 'admitted') status = '✅ Admitted — funding pending';
      else if (app.stage === 'funding-done') status = '✅ Funding secured — visa pending';
      else if (app.stage === 'visa-approved') { status = '🎉 Visa approved — ready to travel'; color = 'var(--mint)'; }
      else if (app.stage === 'visa-refused') { status = '❌ Visa refused'; color = 'var(--rose)'; }
      else if (app.stage === 'funding-failed') { status = '⚠️ Admitted but funding failed'; color = 'var(--rose)'; }
      else if (app.stage === 'refused') { status = '❌ Application rejected'; color = 'var(--rose)'; }

      html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
        '<div><b>' + app.uni + '</b><div class="muted" style="font-size:.75rem">' + country.n + ' · ' + app.level + '</div></div>' +
        '<span style="color:' + color + ';font-size:.8rem;font-weight:600">' + status + '</span>' +
        '</div>' +
        (app.awarded ? '<div class="row" style="margin-top:6px;padding:3px 0;font-size:.78rem"><span>Funding</span><b>' + (app.awarded.name || app.awarded.type) + ' · ' + Math.round((app.awarded.cover || 0) * 100) + '%</b></div>' : '') +
        (app.stage === 'visa-approved' ? '<button class="btn" style="margin-top:8px;background:var(--mint);color:#000;font-weight:700" onclick="p69TravelTo(\'' + app.id + '\')">✈️ Travel to ' + country.n + '</button>' : '') +
        '</div>';
    });
    html += '</section>';
  }

  /* -------- 2. If enrolled abroad -------- */
  if (S.p69.enrolled) {
    const e = S.p69.enrolled;
    const country = COUNTRIES[e.country] || {};
    html += '<section class="card" style="border-color:var(--mint)"><h3>🎓 Currently studying abroad</h3>' +
      '<div class="row"><span>University</span><b>' + e.uni + '</b></div>' +
      '<div class="row"><span>Country</span><b>' + country.n + '</b></div>' +
      '<div class="row"><span>Level</span><b>' + e.level + '</b></div>' +
      '<div class="row"><span>Started</span><b>' + e.startYear + '</b></div>' +
      '</section>';
  }

  /* -------- 3. Thanaweya Amma result card (age 18) -------- */
  if (S.age === 18 && S.country === 'egy' && S.p69.thanaweya.score == null) {
    html += '<section class="card" style="border-color:var(--amber)"><h3>📝 Thanaweya Amma result</h3>' +
      '<p class="muted" style="font-size:.85rem">Your high-school track will determine your final score.</p>' +
      '<div class="row"><span>Track</span><b>' + (S.p68 && S.p68.thanaweyaTrack ? S.p68.thanaweyaTrack : 'not chosen') + '</b></div>' +
      '<button class="btn" onclick="p69ComputeAndShowResult()">Get Thanaweya Amma score</button>' +
      '</section>';
  }
  if (S.p69.thanaweya.score != null) {
    const sc = S.p69.thanaweya.score;
    const color = sc >= 85 ? 'var(--mint)' : sc >= 70 ? 'var(--amber)' : 'var(--rose)';
    const tier = sc >= 90 ? 'Top 5% — anything is open' :
                 sc >= 85 ? 'Excellent — elite universities possible' :
                 sc >= 75 ? 'Very good — public university competitive' :
                 sc >= 65 ? 'Good — many universities accept' :
                 sc >= 55 ? 'Below average — limited options' :
                            'Low — consider alternatives';
    html += '<section class="card"><h3>📝 Thanaweya Amma: ' + sc + '%</h3>' +
      '<div class="row"><span>Rating</span><b style="color:' + color + '">' + tier + '</b></div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:6px">Bachelor abroad typically needs 70%+. Top universities need 85%+.</p>' +
      '</section>';
  }

  /* -------- 4. Base education content (all the original) -------- */
  let baseHtml = P69_viewSchoolBefore.apply(this, arguments);

  /* Remove the old study-abroad master's card from baseHtml */
  baseHtml = baseHtml.replace(/<section class="card">[\s\S]*?🌍 Master’s abroad — year 1 costs[\s\S]*?<\/section>/g, '');
  baseHtml = baseHtml.replace(/<section class="card">[\s\S]*?🌍 Study abroad — realistic costs[\s\S]*?<\/section>/g, '');

  /* -------- 5. Abroad picker (bachelor OR master) -------- */
  if (S.diploma && S.age >= 17 && (S.degree || S.diploma)) {
    const canDoBachelor = !S.degree && S.diploma && S.p69.thanaweya.score != null;
    const canDoMaster = !!S.degree;
    if (canDoBachelor || canDoMaster) {
      html += p69AbroadPickerCard(canDoBachelor, canDoMaster);
    }
  }

  return html + baseHtml;
};

function p69ComputeAndShowResult() {
  p69Init(S);
  const score = p69ComputeThanaweya();
  S.p69.thanaweya.score = score;
  S.p69.thanaweya.year = gameYear();
  log('📝 Thanaweya Amma result: ' + score + '%');
  realismNotice('Thanaweya Amma result', 'You scored ' + score + '%. This determines your university options.');
  render();
}
window.p69ComputeAndShowResult = p69ComputeAndShowResult;

function p69AbroadPickerCard(canBachelor, canMaster) {
  const rate = p69Rate();
  const bank = Math.round(S.wealth * rate);
  const level = (S.p69 && S.p69.abroadLevel) || (canMaster ? 'master' : 'bachelor');
  const countryCode = (S.p69 && S.p69.abroadTarget) || null;

  let html = '<section class="card" style="border-color:var(--violet)"><h3>🌍 Study abroad</h3>' +
    '<p class="muted" style="font-size:.82rem">Real universities, real scholarships, real application flow. Year-1 costs are estimates.</p>' +

    '<h4 style="font-size:.85rem;color:var(--cyan);margin-top:10px">Level</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
    (canBachelor ? '<button class="btn ' + (level === 'bachelor' ? 'sel' : '') + '" onclick="p69SetLevel(\'bachelor\')">🎓 Bachelor\'s<small>Requires Thanaweya Amma ≥ 70%</small></button>' : '') +
    (canMaster ? '<button class="btn ' + (level === 'master' ? 'sel' : '') + '" onclick="p69SetLevel(\'master\')">🎓 Master\'s<small>Requires bachelor degree</small></button>' : '') +
    '</div>' +

    '<h4 style="font-size:.85rem;color:var(--cyan);margin-top:14px">Destination</h4>' +
    '<select id="p69-country" style="width:100%;margin:6px 0" onchange="p69SetCountry(this.value)">' +
    '<option value="">— Choose country —</option>' +
    Object.keys(P69_UNIS).map(function (code) {
      const c = COUNTRIES[code] || {};
      const year1 = p69Year1Cost(code);
      const afford = bank >= year1;
      return '<option value="' + code + '"' + (countryCode === code ? ' selected' : '') + '>' +
        c.f + ' ' + c.n + ' · Year 1 ≈ E£' + year1.toLocaleString() + (afford ? ' ✓' : ' ✗') +
        '</option>';
    }).join('') +
    '</select>';

  if (!countryCode) {
    html += '<p class="muted" style="font-size:.8rem">Pick a country to see universities and scholarships.</p></section>';
    return html;
  }

  /* Selected country — show universities */
  const country = COUNTRIES[countryCode] || {};
  const unis = P69_UNIS[countryCode] || [];
  const schols = P69_SCHOLARSHIPS[countryCode] || [];
  const year1 = p69Year1Cost(countryCode);

  html += '<div style="margin-top:14px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.8rem"><span>Your bank</span><b class="mono">E£' + bank.toLocaleString() + '</b></div>' +
    '<div class="row" style="border:0;padding:3px 0;font-size:.8rem"><span>Year 1 estimated cost</span><b class="mono">E£' + year1.toLocaleString() + '</b></div>' +
    (bank < year1 ? '<p class="muted" style="font-size:.78rem;margin-top:4px;color:var(--rose)">⚠️ You cannot self-fund year 1. You need a scholarship or family funding.</p>' : '') +
    '</div>';

  /* Universities */
  html += '<h4 style="font-size:.85rem;color:var(--cyan);margin-top:14px">Universities in ' + country.n + '</h4>';
  unis.forEach(function (uni) {
    const tuitionEGP = Math.round(uni.tu * 52.7 * p69Idx());
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    const thana = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || 0;
    const gpaOK = level === 'master' ? gpa >= uni.gpaMin : true;
    const thanaOK = level === 'bachelor' ? thana >= 70 : true;
    const ieltsOK = ielts >= uni.ielts;
    const canApply = gpaOK && thanaOK && ieltsOK;

    html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<b>' + uni.n + '</b> <span class="muted" style="font-size:.72rem">· Tier ' + uni.tier + '</span>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Tuition/year</span><b class="mono">' + (uni.tu === 0 ? 'FREE' : 'E£' + tuitionEGP.toLocaleString()) + '</b></div>' +
      '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Requires</span><b>GPA ' + uni.gpaMin + '+ · IELTS ' + uni.ielts + '+</b></div>' +
      (canApply
        ? '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px">' +
          '<button class="btn" style="margin:0;padding:6px;font-size:.72rem" onclick="p69ApplyToUniversity(\'' + countryCode + '\',\'' + uni.n + '\',\'' + level + '\',\'self\')">Self-funded</button>' +
          '<button class="btn" style="margin:0;padding:6px;font-size:.72rem" onclick="p69ApplyToUniversity(\'' + countryCode + '\',\'' + uni.n + '\',\'' + level + '\',\'scholarship\')">Scholarship</button>' +
          '<button class="btn" style="margin:0;padding:6px;font-size:.72rem" onclick="p69ApplyToUniversity(\'' + countryCode + '\',\'' + uni.n + '\',\'' + level + '\',\'parents\')">Ask family</button>' +
          '</div>'
        : '<p class="muted" style="font-size:.75rem;margin-top:6px;color:var(--rose)">❌ ' +
          (!gpaOK ? 'GPA too low. ' : '') +
          (!thanaOK ? 'Thanaweya score too low. ' : '') +
          (!ieltsOK ? 'IELTS too low. ' : '') + '</p>') +
      '</div>';
  });

  /* Scholarships */
  if (schols.length) {
    html += '<h4 style="font-size:.85rem;color:var(--cyan);margin-top:14px">Scholarships for ' + country.n + '</h4>';
    schols.forEach(function (s) {
      const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
      const ielts = S.ielts || 0;
      const ok = gpa >= s.gpaMin && ielts >= s.ielts;
      html += '<div style="margin-top:8px;padding:10px;border:1px solid var(--line);border-radius:8px;opacity:' + (ok ? '1' : '.5') + '">' +
        '<b>' + s.name + '</b> <span style="color:var(--mint);font-size:.75rem">· ' + Math.round(s.cover * 100) + '%</span>' +
        '<p class="muted" style="font-size:.78rem;margin-top:4px">' + s.note + '</p>' +
        '<div class="row" style="border:0;padding:2px 0;font-size:.75rem"><span>Needs</span><b>GPA ' + s.gpaMin + '+ · IELTS ' + s.ielts + '+</b></div>' +
        (ok ? '<p style="color:var(--mint);font-size:.75rem;margin-top:4px">✓ You qualify — apply through any university above</p>' : '<p class="muted" style="font-size:.75rem;margin-top:4px">Improve your profile to qualify</p>') +
        '</div>';
    });
  }

  html += '</section>';
  return html;
}

function p69SetLevel(l) {
  p69Init(S);
  S.p69.abroadLevel = l;
  render();
}
function p69SetCountry(c) {
  p69Init(S);
  S.p69.abroadTarget = c || null;
  if (c && typeof p68SetTarget === 'function') p68SetTarget(c);
  render();
}
window.p69SetLevel = p69SetLevel;
window.p69SetCountry = p69SetCountry;

/* =================================================================
   TRAVEL TO (move abroad + enroll)
   ================================================================= */
function p69TravelTo(appId) {
  p69Init(S);
  const app = S.p69.applications.find(function (a) { return a && a.id === appId; });
  if (!app) return hint('Application not found.');
  if (app.stage !== 'visa-approved') return hint('Not yet approved.');

  /* Move abroad */
  const country = COUNTRIES[app.country] || {};
  S.country = app.country;
  S.cf = null;
  S.rentWorld = false;
  S.curF = 1;
  S.housing = 'room';
  S.transport = 'bus';
  if (typeof setWorld === 'function') setWorld(S);

  /* Track enrollment */
  S.p69.enrolled = {
    uni: app.uni,
    country: app.country,
    level: app.level,
    funding: app.awarded,
    startYear: gameYear()
  };

  /* Deduct year-1 cost if self-funded */
  if (app.awarded && app.awarded.type === 'self') {
    const cost = p69Year1Cost(app.country) / p69Rate();
    if (S.wealth >= cost) S.wealth -= cost;
  }

  /* Move app to completed */
  app.stage = 'completed';

  log('✈️ Traveled to ' + country.n + ' and enrolled at ' + app.uni + '.');
  realismNotice('Welcome to ' + country.n, 'You have started your ' + app.level + '\'s at ' + app.uni + '. Local prices and immigration rules now apply.');
  hint(); render();
}
window.p69TravelTo = p69TravelTo;

/* =================================================================
   TICK every month
   ================================================================= */
const P69_p52TickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  P69_p52TickBefore.apply(this, arguments);
  try { p69TickApplications(); } catch (e) { console.error('p69 tick failed:', e); }
};

/* Also tick on yearly (for players in yearly pacing) */
const P69_ageUpBefore = ageUp;
ageUp = function () {
  const r = P69_ageUpBefore.apply(this, arguments);
  try { p69TickApplications(); } catch (e) { console.error('p69 tick failed:', e); }
  return r;
};

/* =================================================================
   INIT
   ================================================================= */
p69Init(S);
console.log('[p69] Study abroad system loaded');
