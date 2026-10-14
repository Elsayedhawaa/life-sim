/* =====================================================================
   49. EDUCATION ADDITIONS — safe, non-destructive
   Adds:
   - French language courses (alongside existing English, German, Dutch)
   - Study-abroad cost breakdown (as ADDITION, not replacement)
   - Graduation info panel
   Does NOT remove or replace any existing education content.
   Load AFTER 47-visa-travel-realism.js and BEFORE 99-boot.js
   ===================================================================== */

function p49Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p49Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p49EGP(usd2026) { return Math.round(usd2026 * 52.7 * p49Idx()); }

/* ============ 1. STATE ============ */
function p49Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p49) o.p49 = { graduationYear: -1 };
  if (!o.lang) o.lang = { german: 0, dutch: 0 };
  if (typeof o.lang.french !== 'number') o.lang.french = 0;
}
const P49_migrate = migrate;
migrate = function (o) { const r = P49_migrate(o); p49Init(r); return r; };
const P49_newGame = newGame;
newGame = function () { P49_newGame.apply(this, arguments); p49Init(S); };

/* ============ 2. FRENCH LANGUAGE COURSE ============ */
/* Add French to LANG_INFO so the existing language card system picks it up */
if (typeof LANG_INFO !== 'undefined' && !LANG_INFO.french) {
  LANG_INFO.french = {
    name: 'French',
    flag: '🇫🇷',
    country: 'fra',
    exams: [
      ['B1', 'DELF B1', 45, 'Required for many French-taught programs and integration'],
      ['B2', 'DELF B2', 60, 'Needed for university admission in France']
    ]
  };
}

/* Override the language render panel to include French + English */
/* The original file (25-languages-passport.js) appends the panel via GameHooks.
   We add French by re-rendering after that hook fires. */
function p49LanguagePanel() {
  const view = document.getElementById('view');
  if (!view) return;
  if (typeof activeTab === 'undefined' || activeTab !== 'school') return;
  if (!S || S.age < 12) return;

  /* Remove any old p49 panel first */
  const old = document.getElementById('p49-lang-panel');
  if (old) old.remove();

  /* Only show French if the player is heading to France or learning languages */
  const headingToFrance = (S.studentVisaCase && S.studentVisaCase.dest === 'fra') ||
                          (S.mast && S.mast.dest === 'fra') ||
                          S.country === 'fra';
  const langCurious = S.lang && S.lang.french > 0;

  if (!headingToFrance && !langCurious) return;

  /* Only add French if not already rendered by 25-languages-passport.js */
  const view_has_french = view.innerHTML.indexOf('🇫🇷 French') !== -1;
  if (view_has_french) return;

  p49Init();
  const frenchLevel = S.lang.french || 0;
  const levelName = frenchLevel >= 80 ? 'C1 (advanced)'
    : frenchLevel >= 60 ? 'B2 (upper-intermediate)'
    : frenchLevel >= 45 ? 'B1 (intermediate)'
    : frenchLevel >= 30 ? 'A2 (basic)'
    : frenchLevel >= 15 ? 'A1 (beginner)'
    : 'No language skill yet';

  const cost = function (usd) { return Math.round(usd * 52.7 * p49Idx()); };
  const canPay = function (usd) { return S.wealth >= cost(usd) / p49Rate(); };
  const courseDone = S.langDone === S.age;

  const wrap = document.createElement('div');
  wrap.id = 'p49-lang-panel';
  wrap.innerHTML = '<section class="card">' +
    '<h3>🇫🇷 French · ' + levelName + '</h3>' +
    '<div class="bar" style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin-bottom:10px">' +
    '<div style="width:' + frenchLevel + '%;height:100%;background:var(--cyan)"></div>' +
    '</div>' +
    '<p class="muted" style="font-size:.85rem">French matters if you want to live and work in France, or study at a French-taught master\u2019s. Even where English works at work, daily life and bureaucracy often need French. Living there also teaches you faster.</p>' +
    '<button class="btn" ' + (courseDone || !canPay(0) ? '' : '') + ' onclick="p49TakeFrench(0)">Self-study (apps and videos)<small>' + (courseDone ? 'One language course per year' : 'Free · +3 French') + '</small></button>' +
    '<button class="btn" ' + (courseDone || !canPay(250) ? 'disabled' : '') + ' onclick="p49TakeFrench(1)">Online course<small>' + cost(250).toLocaleString() + ' EGP · +6 French</small></button>' +
    '<button class="btn" ' + (courseDone || !canPay(900) ? 'disabled' : '') + ' onclick="p49TakeFrench(2)">Language institute<small>' + cost(900).toLocaleString() + ' EGP · +10 French</small></button>' +
    '<button class="btn" ' + (courseDone || !canPay(2200) ? 'disabled' : '') + ' onclick="p49TakeFrench(3)">Private tutor + speaking club<small>' + cost(2200).toLocaleString() + ' EGP · +14 French</small></button>' +
    '<button class="btn" ' + (S.certs && S.certs.frenchB1 ? 'disabled' : '') + ' onclick="p49FrenchExam(0)">' + (S.certs && S.certs.frenchB1 ? 'DELF B1 · Passed ✓' : 'Take DELF B1 · ' + cost(180).toLocaleString() + ' EGP') + '</button>' +
    '<button class="btn" ' + (S.certs && S.certs.frenchB2 ? 'disabled' : '') + ' onclick="p49FrenchExam(1)">' + (S.certs && S.certs.frenchB2 ? 'DELF B2 · Passed ✓' : 'Take DELF B2 · ' + cost(180).toLocaleString() + ' EGP') + '</button>' +
    '</section>';
  view.appendChild(wrap);
}

function p49TakeFrench(idx) {
  p49Init();
  const courses = [
    { name: 'Self-study (apps and videos)', cost: 0, gain: 3 },
    { name: 'Online course', cost: 250, gain: 6 },
    { name: 'Language institute', cost: 900, gain: 10 },
    { name: 'Private tutor + speaking club', cost: 2200, gain: 14 }
  ];
  const c = courses[idx];
  if (!c) return;
  if (S.langDone === S.age) return hint('One language course per year.');
  const egp = Math.round(c.cost * 52.7 * p49Idx());
  const internal = egp / p49Rate();
  if (S.wealth < internal) return hint('You need ' + egp.toLocaleString() + ' EGP for this course.');
  if (internal > 0) {
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.languageCourse = (S.bill.languageCourse || 0) + internal;
  }
  S.langDone = S.age;
  S.lang.french = Math.min(100, (S.lang.french || 0) + c.gain);
  fx({ smarts: 1 });
  log(c.name + ' (French): your French is now about ' + S.lang.french + '%.');
  hint();
  render();
}
window.p49TakeFrench = p49TakeFrench;

function p49FrenchExam(idx) {
  p49Init();
  const exams = [
    { key: 'frenchB1', label: 'DELF B1', minLevel: 45 },
    { key: 'frenchB2', label: 'DELF B2', minLevel: 60 }
  ];
  const ex = exams[idx];
  if (!ex) return;
  if (!S.certs) S.certs = {};
  if (S.certs[ex.key]) return hint('You already hold this certificate.');
  const egp = Math.round(180 * 52.7 * p49Idx());
  const internal = egp / p49Rate();
  if (S.wealth < internal) return hint('Exam fee is ' + egp.toLocaleString() + ' EGP.');
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.languageExams = (S.bill.languageExams || 0) + internal;
  const pass = Math.random() < Math.max(0.05, Math.min(0.95, ((S.lang.french || 0) - ex.minLevel + 8) / 16));
  if (pass) {
    S.certs[ex.key] = true;
    fx({ happiness: 4 });
    log('You passed the ' + ex.label + ' exam.');
  } else {
    fx({ happiness: -2 });
    log('You did not pass the ' + ex.label + ' exam. The fee is not refunded.');
  }
  hint();
  render();
}
window.p49FrenchExam = p49FrenchExam;

/* ============ 3. STUDY ABROAD PANEL (ADDITION, NOT REPLACEMENT) ============ */
const P49_STUDY = {
  usa: { name: 'United States', flag: '🇺🇸', tuition: 35000, living: 18000, blocked: 0, visaFee: 185, flight: 1100, setup: 1500, years: 2, note: 'Tuition varies wildly. Health insurance mandatory. Most expensive option.' },
  gbr: { name: 'United Kingdom', flag: '🇬🇧', tuition: 25000, living: 15000, blocked: 0, visaFee: 490, flight: 650, setup: 1000, years: 1, note: 'One-year master\'s. IHS surcharge ~£776/yr. London +30%.' },
  can: { name: 'Canada', flag: '🇨🇦', tuition: 22000, living: 16000, blocked: 14000, visaFee: 150, flight: 1000, setup: 1200, years: 2, note: 'GIC (CAD 20,635) required upfront for the student visa.' },
  deu: { name: 'Germany', flag: '🇩🇪', tuition: 0, living: 11500, blocked: 11208, visaFee: 75, flight: 590, setup: 800, years: 2, note: 'Public universities free. Blocked account €11,208/year mandatory. Health insurance ~€110/mo.' },
  nld: { name: 'Netherlands', flag: '🇳🇱', tuition: 18000, living: 12500, blocked: 0, visaFee: 210, flight: 640, setup: 900, years: 2, note: 'Housing is scarce. Deposit + first month often needed upfront.' },
  fra: { name: 'France', flag: '🇫🇷', tuition: 5000, living: 10500, blocked: 0, visaFee: 100, flight: 620, setup: 800, years: 2, note: 'Public universities ~€3,770/yr. Proof of €615/month required.' },
  ita: { name: 'Italy', flag: '🇮🇹', tuition: 2500, living: 9500, blocked: 0, visaFee: 90, flight: 580, setup: 700, years: 2, note: 'Income-based tuition — Egyptians may pay less.' },
  aus: { name: 'Australia', flag: '🇦🇺', tuition: 28000, living: 20000, blocked: 0, visaFee: 710, flight: 1350, setup: 1200, years: 2, note: 'OSHC health cover mandatory. Living costs AUD 29,710/year.' },
  nzl: { name: 'New Zealand', flag: '🇳🇿', tuition: 24000, living: 17000, blocked: 0, visaFee: 430, flight: 1350, setup: 1000, years: 2, note: 'NZD 20,000/year funds must be shown.' },
  jpn: { name: 'Japan', flag: '🇯🇵', tuition: 6000, living: 12000, blocked: 0, visaFee: 60, flight: 850, setup: 900, years: 2, note: 'MEXT scholarship covers everything, very competitive. Self-funded usually work part-time.' },
  kor: { name: 'South Korea', flag: '🇰🇷', tuition: 5500, living: 11000, blocked: 0, visaFee: 60, flight: 850, setup: 900, years: 2, note: 'GKS scholarship competitive. Proof of KRW 20M/year for self-funded.' },
  sgp: { name: 'Singapore', flag: '🇸🇬', tuition: 28000, living: 16000, blocked: 0, visaFee: 90, flight: 950, setup: 1000, years: 2, note: 'Very competitive admission. Proof of SGD 12,000/year.' },
  uae: { name: 'UAE', flag: '🇦🇪', tuition: 22000, living: 14000, blocked: 0, visaFee: 250, flight: 300, setup: 800, years: 2, note: 'No citizenship path. Student visa sponsored by university.' },
  sau: { name: 'Saudi Arabia', flag: '🇸🇦', tuition: 15000, living: 11000, blocked: 0, visaFee: 200, flight: 340, setup: 700, years: 2, note: 'Tuition varies. Living costs lower than UAE.' }
};

function p49StudyAbroadPanel() {
  if (!S || S.age < 18) return '';
  if (!S.degree) return '';
  if (S.country !== S.home) return '';
  if (S.mast || S.studentVisaCase || S.localMast) return '';

  const bankEGP = Math.round(Number(S.wealth || 0) * p49Rate());

  let html = '<section class="card" style="border-color:var(--violet)">' +
    '<h3>🌍 Study abroad — realistic costs</h3>' +
    '<p class="muted">Full cost of a master\'s abroad: tuition + living + blocked account + visa + flight + setup. This is the actual money a student visa requires.</p>' +
    '<div class="row"><span>Your available bank</span><b class="mono" style="color:var(--mint)">' + bankEGP.toLocaleString() + ' EGP</b></div>';

  ['deu', 'usa', 'gbr', 'can', 'nld', 'fra', 'ita', 'aus', 'nzl', 'jpn', 'kor', 'sgp', 'uae', 'sau'].forEach(function (code) {
    const c = P49_STUDY[code];
    if (!c) return;

    const firstYearUSD = c.tuition + c.living + c.blocked + c.visaFee + c.flight + c.setup;
    const programUSD = c.tuition * c.years + c.living * c.years + c.blocked + c.visaFee + c.flight + c.setup;
    const firstYearEGP = p49EGP(firstYearUSD);
    const programEGP = p49EGP(programUSD);
    const canAfford = bankEGP >= firstYearEGP;
    const shortBy = canAfford ? 0 : firstYearEGP - bankEGP;

    html += '<details style="margin-top:10px;border:1px solid ' + (canAfford ? 'var(--mint)' : 'var(--line)') + ';border-radius:8px;padding:10px">' +
      '<summary style="cursor:pointer"><b>' + c.flag + ' ' + c.name + '</b>' +
      '<span style="float:right;color:' + (canAfford ? 'var(--mint)' : 'var(--rose)') + '">' + firstYearEGP.toLocaleString() + ' EGP (year 1)</span>' +
      '</summary>' +
      '<p class="muted" style="font-size:.82rem;margin:8px 0">' + c.note + '</p>' +
      '<div class="row"><span>Tuition/year</span><b>' + (c.tuition === 0 ? '<span style="color:var(--mint)">FREE (public)</span>' : p49EGP(c.tuition).toLocaleString() + ' EGP') + '</b></div>' +
      '<div class="row"><span>Living costs/year</span><b>' + p49EGP(c.living).toLocaleString() + ' EGP</b></div>' +
      (c.blocked > 0 ? '<div class="row"><span>Blocked account (one-time)</span><b>' + p49EGP(c.blocked).toLocaleString() + ' EGP</b></div>' : '') +
      '<div class="row"><span>Visa fee</span><b>' + p49EGP(c.visaFee).toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Return flight</span><b>' + p49EGP(c.flight).toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Setup (deposit, books, essentials)</span><b>' + p49EGP(c.setup).toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>First year total</b></span><b style="color:var(--rose)">' + firstYearEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Full program (' + c.years + ' yrs)</span><b>' + programEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Affordable?</b></span><b style="color:' + (canAfford ? 'var(--mint)' : 'var(--rose)') + '">' + (canAfford ? '✅ Yes' : '❌ Short by ' + shortBy.toLocaleString() + ' EGP') + '</b></div>' +
      '<button class="btn" ' + (canAfford ? '' : 'disabled') + ' onclick="p49ApplyMaster(\'' + code + '\',\'self\')" style="margin-top:8px">' + (canAfford ? 'Apply self-funded' : 'Insufficient funds') + '</button>' +
      '<button class="btn" onclick="p49ApplyMaster(\'' + code + '\',\'scholar\')">Apply for full scholarship<small>Rare. Covers everything if awarded.</small></button>' +
      '<button class="btn" onclick="p49ApplyMaster(\'' + code + '\',\'part\')">Apply for partial scholarship<small>Covers tuition only.</small></button>' +
      '<button class="btn" onclick="p49ApplyMaster(\'' + code + '\',\'parents\')">Ask parents to fund<small>Only if family is wealthy.</small></button>' +
      '</details>';
  });

  html += '</section>';
  return html;
}

function p49ApplyMaster(code, funding) {
  if (!S || S.age < 21) return hint('Master\'s programs require adult entry.');
  if (!S.degree) return hint('You need a bachelor\'s degree first.');
  if (S.mast || S.studentVisaCase || S.localMast) return hint('You already have a study path in progress.');

  const c = P49_STUDY[code];
  if (!c) return hint('Destination not supported.');
  const feeEGP = Math.round(80 * 52.7 * p49Idx());
  const fee = feeEGP / p49Rate();
  if (S.wealth < fee) return hint('Application fees cost about ' + feeEGP.toLocaleString() + ' EGP.');

  /* Self-funded gate */
  if (funding === 'self') {
    const firstYear = p49EGP(c.tuition + c.living + c.blocked + c.visaFee + c.flight + c.setup);
    const bankEGP = Math.round(S.wealth * p49Rate());
    if (bankEGP < firstYear) return hint('You need ' + firstYear.toLocaleString() + ' EGP in the bank. You have ' + bankEGP.toLocaleString() + ' EGP.');
  }

  /* English requirement */
  const reqIELTS = ['usa', 'gbr', 'can', 'aus', 'nzl', 'nld', 'sgp'].indexOf(code) >= 0 ? 6.5 : 6.0;
  if ((S.ielts || 0) < reqIELTS) return hint('This destination requires IELTS ' + reqIELTS + '+. Yours: ' + (S.ielts || 'not taken') + '.');

  /* Deduct fee */
  S.wealth -= fee;
  S.expenses = (S.expenses || 0) + fee;
  S.bill = S.bill || {};
  S.bill.applicationFees = (S.bill.applicationFees || 0) + fee;

  /* Academic chance */
  const gpa = S.gpaN ? S.gpa : 2.5;
  let academicChance = 0.30 + (S.smarts / 300) + (gpa >= 3.5 ? 0.15 : gpa >= 3.0 ? 0.08 : 0);
  if (['usa', 'gbr'].indexOf(code) >= 0) academicChance -= 0.05;
  if (['deu', 'fra', 'ita'].indexOf(code) >= 0) academicChance += 0.05;
  academicChance = Math.max(0.10, Math.min(0.85, academicChance));

  /* Admission */
  if (Math.random() > academicChance) {
    const reason = (S.smarts < 60) ? 'Academic profile was below the competitive range.'
      : (S.ielts || 0) < reqIELTS + 0.5 ? 'IELTS score was on the edge.'
      : 'Stronger candidates were selected this cycle.';
    log('❌ ' + c.name + ' rejected your application. ' + reason + ' Fee not refunded.');
    realismNotice('Admission refused', c.flag + ' ' + c.name + '. ' + reason + ' Application fee ' + feeEGP.toLocaleString() + ' EGP not refunded.');
    render();
    return;
  }

  /* Funding decision */
  let fundingChance, coverage, fundingLabel;
  if (funding === 'scholar') {
    fundingChance = gpa >= 3.7 ? 0.15 : gpa >= 3.4 ? 0.08 : 0.02;
    coverage = 1.0;
    fundingLabel = 'full scholarship';
  } else if (funding === 'part') {
    fundingChance = gpa >= 3.3 ? 0.40 : 0.20;
    coverage = 0.5;
    fundingLabel = 'partial scholarship';
  } else if (funding === 'parents') {
    fundingChance = [0.05, 0.40, 0.90][S.famWealth || 0];
    coverage = 1.0;
    fundingLabel = 'family funded';
    if (!parents().length || bestBond() < 35) fundingChance = 0;
  } else {
    fundingChance = 1.0;
    coverage = 0;
    fundingLabel = 'self-funded';
  }

  if (Math.random() > fundingChance) {
    const reason = funding === 'scholar'
      ? 'Full scholarships go to less than 10% of applicants. Your GPA (' + gpa.toFixed(2) + ') was not in the top tier.'
      : funding === 'part'
        ? 'Partial scholarship competition was strong.'
        : 'Your family said they cannot commit to the amount.';
    log('❌ Admitted to ' + c.name + ', but funding failed. ' + reason);
    realismNotice('Admission without funding', c.flag + ' ' + c.name + '. ' + reason + ' Application fee not refunded.');
    render();
    return;
  }

  /* SUCCESS */
  S.studentVisaCase = {
    dest: code,
    field: S.masterField || S.degree,
    years: 0,
    cover: coverage,
    fund: funding,
    proof: funding === 'self' ? p49EGP(c.tuition + c.living + c.blocked) : p49EGP(c.tuition + c.living + c.blocked) * 0.3,
    started: gameYear()
  };
  log('✅ Admitted to ' + c.name + ' as ' + fundingLabel + '. Student visa application in progress.');
  realismNotice('Master\'s admission granted', c.flag + ' ' + c.name + '. Funding: ' + fundingLabel + '. Visa decision takes about 1 year and can be refused.');
  hint();
  render();
}
window.p49ApplyMaster = p49ApplyMaster;

/* ============ 4. GRADUATION INFO PANEL ============ */
function p49GraduationPanel() {
  if (!S || !S.degree) return '';
  /* Only for Egypt-native players */
  if (S.country !== S.home) return '';

  const degreeName = (MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree;
  const gradYear = S.p49.graduationYear > 0 ? S.p49.graduationYear : gameYear();

  let html = '<section class="card" style="border-color:var(--mint)">' +
    '<h3>🎓 Your education</h3>' +
    '<div class="row"><span>Highest degree</span><b>' + degreeName + '</b></div>' +
    '<div class="row"><span>Graduated</span><b>' + gradYear + '</b></div>';

  if (S.masterField) {
    html += '<div class="row"><span>Master\'s</span><b>' + S.masterField + '</b></div>';
  }

  html += '</section>';
  return html;
}

/* Set graduation year when degree is granted */
const P49_p44EgyptUniYearBefore = (typeof p44EgyptUniYear === 'function') ? p44EgyptUniYear : null;
const P49_uniYearBefore = uniYear;
uniYear = function (notes, bill) {
  const hadDegree = S && S.degree;
  const result = P49_uniYearBefore.apply(this, arguments);
  if (S && !hadDegree && S.degree) {
    p49Init();
    S.p49.graduationYear = gameYear();
  }
  return result;
};

/* ============ 5. INJECT THE PANELS (NON-DESTRUCTIVE) ============ */
const P49_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P49_viewSchoolBefore();
  if (!S || S.age < 12) return html;

  /* Just append. Do not remove anything. */
  const grad = p49GraduationPanel();
  const study = p49StudyAbroadPanel();

  /* Insert graduation panel near top of education tab (after the first section) */
  if (grad) {
    const firstEnd = html.indexOf('</section>');
    if (firstEnd !== -1) {
      html = html.slice(0, firstEnd + 10) + grad + html.slice(firstEnd + 10);
    }
  }

  /* Append study abroad panel at the end */
  if (study) {
    html = html + study;
  }

  return html;
};

/* ============ 6. FRENCH PANEL RENDERED VIA HOOK ============ */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', p49LanguagePanel);
} else {
  const P49_renderBefore = render;
  render = function () {
    const r = P49_renderBefore.apply(this, arguments);
    p49LanguagePanel();
    return r;
  };
}

/* ============ 7. INIT ON LOAD ============ */
p49Init(S);
