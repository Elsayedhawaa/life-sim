/* =====================================================================
   74. EDUCATION TAB WHEN ABROAD — clean, month-aware, correct
   Fixes:
   - Passport panel uses HOME country (not current) → no more British passport
   - Enrollment progress tracks absolute months, not game years
   - Force-quit Egypt job when moving abroad on student visa
   - Egyptian-only content hidden when abroad
   - Education tab cleaned: status, enrollment, languages, return home
   - Part-time tab shows student visa work options when abroad
   Load AFTER 73-abroad-career-tracking-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p74Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* =================================================================
   1. STATE
   ================================================================= */
function p74Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p74) o.p74 = {};
  const d = o.p74;
  if (typeof d.enrollStartAbsMonth !== 'number') d.enrollStartAbsMonth = -1;
  if (typeof d.enrollTotalMonths !== 'number') d.enrollTotalMonths = 0;
  if (typeof d.enrollField !== 'string') d.enrollField = null;
  if (typeof d.lastAutoJobCheck !== 'number') d.lastAutoJobCheck = -1;
  if (typeof d.jobAutoQuitDone !== 'boolean') d.jobAutoQuitDone = false;
}
const P74_migrate = migrate;
migrate = function (o) { const r = P74_migrate(o); p74Init(r); return r; };
const P74_newGame = newGame;
newGame = function () { P74_newGame.apply(this, arguments); p74Init(S); };

function p74IsAbroad() {
  return !!(S && S.country !== S.home);
}
function p74IsAbroadStudent() {
  return p74IsAbroad() && S && S.p69 && S.p69.enrolled;
}
function p74CurrentAbsMonth() {
  return Number(S && S.pacingAbsoluteMonth) || 0;
}

/* =================================================================
   2. FIX: ENROLLMENT TRACKING — absolute months
   ================================================================= */
/* Called when p69TravelTo runs (via wrapper below) */
function p74CaptureEnrollment() {
  if (!S || !S.p69 || !S.p69.enrolled) return;
  p74Init(S);
  const enrolled = S.p69.enrolled;
  const duration = enrolled.level === 'bachelor' ? 3 : 2;
  S.p74.enrollStartAbsMonth = p74CurrentAbsMonth();
  S.p74.enrollTotalMonths = duration * 12;
  S.p74.enrollField = (S.p73 && S.p73.abroadField) || enrolled.field || 'General';
}

function p74EnrollmentMonthsElapsed() {
  p74Init(S);
  if (S.p74.enrollStartAbsMonth < 0) return 0;
  return Math.max(0, p74CurrentAbsMonth() - S.p74.enrollStartAbsMonth);
}

function p74EnrollmentMonthsLeft() {
  return Math.max(0, (S.p74.enrollTotalMonths || 0) - p74EnrollmentMonthsElapsed());
}

/* Hook the enrollment capture into p69TravelTo */
const P74_p69TravelBefore = (typeof p69TravelTo === 'function') ? p69TravelTo : null;
if (P74_p69TravelBefore) {
  p69TravelTo = function () {
    const r = P74_p69TravelBefore.apply(this, arguments);
    p74CaptureEnrollment();
    /* Force-quit job if employed in Egypt */
    p74HandleJobOnMove();
    save();
    return r;
  };
}

/* =================================================================
   3. FIX: FORCE-QUIT EGYPT JOB WHEN MOVING ABROAD
   ================================================================= */
function p74HandleJobOnMove() {
  if (!S || !S.job) return;
  p74Init(S);
  if (S.p74.jobAutoQuitDone) return;
  const oldJob = S.job;
  const oldCompany = oldJob.company || 'your Egyptian employer';
  const oldTitle = oldJob.title || 'your job';

  /* Player cannot keep a job that is physically located in the home country */
  const stillHome = (S.country === S.home);
  if (stillHome) return;

  /* Student visa — no full-time work */
  const isStudent = S.p69 && S.p69.enrolled;
  if (isStudent) {
    S.job = null;
    S.p74.jobAutoQuitDone = true;
    log('💼 You left your full-time position as ' + oldTitle + ' at ' + oldCompany + ' when you moved abroad on a student visa.');
    realismNotice('Job ended', 'Your ' + oldTitle + ' position at ' + oldCompany + ' ended when you moved abroad. Student visas do not permit full-time employment.');
    /* Also clear part-time student job slot for restart */
    if (S.part) S.part = null;
  }
}

/* =================================================================
   4. FIX: PASSPORT PANEL USES HOME COUNTRY
   ================================================================= */
const P74_passportCardBefore = (typeof passportCard === 'function') ? passportCard : null;
if (P74_passportCardBefore) {
  passportCard = function () {
    /* Force passport to use home country, not current country */
    if (!S) return '';
    const prevCountry = S.country;
    S.country = S.home;   /* temporarily override */
    let html = '';
    try { html = P74_passportCardBefore.apply(this, arguments); }
    catch (e) { console.error('passportCard failed:', e); html = ''; }
    S.country = prevCountry;
    /* Remove duplicate panels — only one shown */
    return html;
  };
}

/* =================================================================
   5. FIX: JOB-AUTO-CHECK ON EVERY AGE-UP AND MONTH
   ================================================================= */
function p74TickJobCheck() {
  if (!S) return;
  p74Init(S);
  const absMonth = p74CurrentAbsMonth();
  if (S.p74.lastAutoJobCheck === absMonth) return;
  S.p74.lastAutoJobCheck = absMonth;

  /* If abroad on student visa and has a job, force-quit */
  if (p74IsAbroadStudent() && S.job) {
    p74HandleJobOnMove();
  }
}

/* Wrap monthly tick */
const P74_p52TickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  P74_p52TickBefore.apply(this, arguments);
  try { p74TickJobCheck(); } catch (e) { console.error('p74 job check failed:', e); }
};

/* Wrap ageUp */
const P74_ageUpBefore = ageUp;
ageUp = function () {
  const r = P74_ageUpBefore.apply(this, arguments);
  try { p74TickJobCheck(); } catch (e) {}
  return r;
};

/* =================================================================
   6. FIX: FULL viewSchool REPLACEMENT WHEN ABROAD
   ================================================================= */
const P74_viewSchoolBefore = viewSchool;
viewSchool = function () {
  if (!S) return P74_viewSchoolBefore.apply(this, arguments);

  /* If not abroad, use the normal education tab */
  if (!p74IsAbroad()) return P74_viewSchoolBefore.apply(this, arguments);

  /* If abroad but not enrolled — simplified view */
  if (!S.p69 || !S.p69.enrolled) {
    return p74BuildAbroadLiteEducation();
  }

  /* Abroad and enrolled — full redesigned view */
  return p74BuildAbroadEducation();
};

/* ---------- Abroad AND enrolled: redesigned education tab ---------- */
function p74BuildAbroadEducation() {
  p74Init(S);
  const c = COUNTRIES[S.country] || {};
  const enrolled = S.p69.enrolled;
  const rate = p74Rate();
  const elapsed = p74EnrollmentMonthsElapsed();
  const total = S.p74.enrollTotalMonths || 36;
  const left = p74EnrollmentMonthsLeft();
  const yearsElapsed = elapsed / 12;
  const yearsTotal = total / 12;
  const progressPct = Math.min(100, Math.round(elapsed / total * 100));
  const field = S.p74.enrollField || enrolled.field || 'General';

  let html = '';

  /* ---------- 1. Status card ---------- */
  html += '<section class="card" style="padding:14px;border-left:3px solid var(--mint)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
    '<div style="min-width:0;flex:1">' +
    '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS · ' + (c.n || S.country).toUpperCase() + '</div>' +
    '<div style="font-size:1.1rem;font-weight:700;margin-top:4px">🎓 Studying abroad — ' + (enrolled.level === 'bachelor' ? 'Bachelor\'s' : 'Master\'s') + '</div>' +
    '<div class="muted" style="font-size:.82rem;margin-top:2px">' + field + ' at ' + enrolled.uni + '</div>' +
    '</div></div></section>';

  /* ---------- 2. Enrollment progress ---------- */
  html += '<section class="card"><h3>📖 Enrollment progress</h3>' +
    '<div class="row"><span>University</span><b>' + enrolled.uni + '</b></div>' +
    '<div class="row"><span>Field</span><b>' + field + '</b></div>' +
    '<div class="row"><span>Level</span><b>' + (enrolled.level === 'bachelor' ? 'Bachelor\'s' : 'Master\'s') + '</b></div>' +
    '<div class="row"><span>Started</span><b>Month ' + S.p74.enrollStartAbsMonth + ' (game time)</b></div>' +
    '<div class="row"><span>Time elapsed</span><b>' + yearsElapsed.toFixed(1) + ' / ' + yearsTotal.toFixed(1) + ' years (' + elapsed + '/' + total + ' months)</b></div>' +
    '<div style="height:8px;background:var(--line);border-radius:4px;overflow:hidden;margin:10px 0">' +
    '<div style="height:100%;width:' + progressPct + '%;background:var(--mint);transition:width .3s"></div>' +
    '</div>' +
    '<div class="row"><span>Progress</span><b style="color:var(--mint)">' + progressPct + '%</b></div>' +
    (enrolled.funding ? '<div class="row"><span>Funding</span><b>' + (enrolled.funding.name || enrolled.funding.type) + ' · ' + Math.round((enrolled.funding.cover || 0) * 100) + '%</b></div>' : '') +
    (left > 0
      ? '<p class="muted" style="font-size:.78rem;margin-top:10px">Study continues. Every month you advance toward graduation.</p>'
      : '<button class="btn" style="margin-top:10px;background:var(--mint);color:#000;font-weight:700" onclick="p73GraduateAbroad()">🎓 Graduate now</button>') +
    '</section>';

  /* ---------- 3. Language (only the host country + English) ---------- */
  html += '<section class="card"><h3>🌍 Language & exams</h3>' +
    '<p class="muted" style="font-size:.82rem">English is universal. Local language matters for daily life and jobs in ' + (c.n || S.country) + '.</p>';

  /* English course card */
  if (S.age >= 12) {
    html += p74EnglishCard(rate);
  }
  /* IELTS / TOEFL card */
  if (S.age >= 16) {
    html += p74IELTSCard(rate);
  }
  html += '</section>';

  /* Host country language card if applicable */
  const hostLang = { deu: 'german', fra: 'french', nld: 'dutch' }[S.country];
  if (hostLang && typeof LANG_INFO !== 'undefined' && LANG_INFO[hostLang]) {
    html += p74HostLangCard(hostLang, LANG_INFO[hostLang], rate);
  }

  /* ---------- 4. Return home option ---------- */
  html += '<section class="card"><h3>✈️ Return to ' + (COUNTRIES[S.home] ? COUNTRIES[S.home].n : 'home') + '</h3>' +
    '<p class="muted" style="font-size:.82rem">You can leave at any time. Credits are partially transferable. Your student visa ends immediately.</p>' +
    '<button class="btn" style="border-color:var(--amber)" onclick="p73ReturnHome()">Return home</button>' +
    '</section>';

  /* ---------- 5. Passport (uses home country now) ---------- */
  if (S.age >= 16 && typeof passportCard === 'function') {
    html += passportCard();
  }

  return html;
}

/* ---------- Abroad but not enrolled: minimal education view ---------- */
function p74BuildAbroadLiteEducation() {
  const c = COUNTRIES[S.country] || {};
  return '<section class="card" style="padding:14px">' +
    '<h3>🌍 You are living in ' + (c.n || S.country) + '</h3>' +
    '<p class="muted" style="font-size:.85rem">You are not currently enrolled in any education program. Return to the Education tab section for university studies if you want to study here.</p>' +
    (S.degree
      ? '<div class="row"><span>Your degree</span><b>' + ((typeof MAJORS !== 'undefined' && MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree) + '</b></div>'
      : '<p class="muted" style="font-size:.82rem">No completed degree yet.</p>') +
    '<button class="btn" style="margin-top:10px;border-color:var(--amber)" onclick="p73ReturnHome()">Return home to ' + (COUNTRIES[S.home] ? COUNTRIES[S.home].n : 'Egypt') + '</button>' +
    '</section>';
}

/* ---------- Helper: English card (compact) ---------- */
function p74EnglishCard(rate) {
  const lvl = S.eng || 0;
  const courses = (typeof ENG !== 'undefined') ? ENG : [];
  const rows = courses.map(function (c, i) {
    const price = (typeof svc === 'function') ? svc(c[1]) : 0;
    const canPay = S.wealth >= price;
    const cooldown = (typeof p72CanTakeLang === 'function') ? !p72CanTakeLang('english') : false;
    return '<button class="btn" style="margin-top:6px" ' + (canPay && !cooldown ? '' : 'disabled') + ' onclick="takeEng(' + i + ')">' +
      c[0] + ' · ' + (price ? money(price) : 'Free') + ' · +' + c[2] + ' English' +
      (cooldown ? '<small>Cooldown active</small>' : '') +
      '</button>';
  }).join('');
  return '<h4 style="font-size:.85rem;margin-top:10px;color:var(--cyan)">🇬🇧 English — Level ' + lvl + '%</h4>' +
    '<div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin:6px 0">' +
    '<div style="height:100%;width:' + lvl + '%;background:var(--cyan)"></div></div>' +
    rows;
}

/* ---------- Helper: IELTS/TOEFL ---------- */
function p74IELTSCard(rate) {
  const ielts = S.ielts || 0;
  const toefl = S.toefl || 0;
  return '<h4 style="font-size:.85rem;margin-top:14px;color:var(--cyan)">📝 IELTS / TOEFL</h4>' +
    '<div class="row" style="padding:4px 0;font-size:.82rem"><span>IELTS</span><b>' + (ielts || 'Not taken') + '</b></div>' +
    '<div class="row" style="padding:4px 0;font-size:.82rem"><span>TOEFL</span><b>' + (toefl ? toefl + ' / 120' : 'Not taken') + '</b></div>';
}

/* ---------- Helper: host country language ---------- */
function p74HostLangCard(lang, info, rate) {
  if (!S.lang) S.lang = {};
  const lvl = Number(S.lang[lang]) || 0;
  const lvlName = lvl >= 80 ? 'C1' : lvl >= 60 ? 'B2' : lvl >= 45 ? 'B1' : lvl >= 30 ? 'A2' : lvl >= 15 ? 'A1' : 'No skill';
  const courses = [
    ['Self-study (apps and videos)', 0, 3],
    ['Online course', 250, 6],
    ['Language institute', 900, 10],
    ['Private tutor + speaking club', 2200, 14]
  ];
  const rows = courses.map(function (c, i) {
    const price = (typeof svc === 'function') ? svc(c[1]) : 0;
    const canPay = price <= S.wealth;
    const cooldown = (typeof p72CanTakeLang === 'function') ? !p72CanTakeLang(lang) : false;
    return '<button class="btn" style="margin-top:6px" ' + (canPay && !cooldown ? '' : 'disabled') + ' onclick="p68TakeLang(\'' + lang + '\',' + i + ')">' +
      c[0] + ' · ' + (price ? money(price) : 'Free') + ' · +' + c[2] + ' ' + info.name +
      (cooldown ? '<small>Cooldown active</small>' : '') +
      '</button>';
  }).join('');
  return '<section class="card" style="border-color:var(--violet)"><h4 style="font-size:.85rem;color:var(--violet)">' + info.flag + ' ' + info.name + ' — ' + lvlName + ' (' + lvl + '%)</h4>' +
    '<p class="muted" style="font-size:.78rem">Living in ' + (COUNTRIES[info.country] ? COUNTRIES[info.country].n : info.country) + ' — local language helps for daily life and jobs.</p>' +
    '<div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin:6px 0">' +
    '<div style="height:100%;width:' + lvl + '%;background:var(--violet)"></div></div>' +
    rows +
    '</section>';
}

/* =================================================================
   7. FIX: PART-TIME TAB ENABLED FOR STUDENT VISA
   ================================================================= */
/* Override the render tabs so "Part-time" is enabled for student visa holders */
const P74_originalRender = render;
render = function () {
  const r = P74_originalRender.apply(this, arguments);
  /* Enable the Part-time tab when abroad + student */
  if (p74IsAbroadStudent()) {
    const nav = document.getElementById('tabs');
    if (nav) {
      const partTab = nav.querySelector('button[onclick*="go(\'part\')"]');
      if (partTab && partTab.disabled) partTab.disabled = false;
    }
  }
  return r;
};

/* =================================================================
   8. EDUCATION TAB HIDES EGYPT CONTENT WHEN ABROAD (cleanup)
   ================================================================= */
/* The full viewSchool override above replaces the entire view when abroad.
   This is the clean way. Any residual Egyptian content that survived via
   other overlays is stripped here. */
const P74_viewSchoolCleanupBefore = viewSchool;
viewSchool = function () {
  let html = P74_viewSchoolCleanupBefore.apply(this, arguments);
  if (!p74IsAbroad()) return html;

  /* Strip any Egyptian school/milestone content that leaked in */
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*Thanaweya Amma[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*Egyptian university cutoffs[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*Choose your university[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*Local Master's in Egypt[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*Private lessons[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*School trips[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*School olympiads[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*Join a study group[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  html = html.replace(/<section class="card"[^>]*>\s*<h3>[^<]*Vocational \/ technical school[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
  /* Strip university scholarship hint */
  html = html.replace(/A GPA of 3\.5 or more earns a 50% scholarship[^<]*/g, '');

  return html;
};

/* =================================================================
   9. INIT — capture enrollment for players already abroad
   ================================================================= */
p74Init(S);
if (p74IsAbroadStudent() && S.p74.enrollStartAbsMonth < 0) {
  /* Existing save — set enrollment start as best we can */
  S.p74.enrollStartAbsMonth = p74CurrentAbsMonth();
  const yearsTotal = S.p69.enrolled.level === 'bachelor' ? 3 : 2;
  S.p74.enrollTotalMonths = yearsTotal * 12;
  S.p74.enrollField = (S.p69.enrolled.field) || (S.p73 && S.p73.abroadField) || 'General';
  save();
}
setTimeout(p74HandleJobOnMove, 300);

console.log('[p74] Education tab abroad fix loaded');
