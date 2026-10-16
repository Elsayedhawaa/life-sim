/* =====================================================================
   70. EDUCATION DEEP IMPROVEMENTS
   - Smarts frozen at 100 (cannot decrease once reached)
   - GPA recalculated to reflect current smarts + effort honestly
   - Thanaweya Amma cutoffs per faculty (real Egyptian 2024 numbers)
   - Faculty eligibility gating on university enrollment
   - Extracurriculars during university (student clubs, competitions)
   - Exchange semester option
   - Final-year internship
   - Dean's list / academic honors
   Load AFTER 69-study-abroad-system.js and BEFORE 99-boot.js
   ===================================================================== */

function p70Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* =================================================================
   1. SMARTS FREEZE — once you hit 100, you stay 100
   ================================================================= */
function p70Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p70) o.p70 = {};
  const d = o.p70;
  if (typeof d.smartsLocked !== 'boolean') d.smartsLocked = (Number(o.smarts) >= 100);
  if (!Array.isArray(d.achievements)) d.achievements = [];
  if (!Array.isArray(d.extracurriculars)) d.extracurriculars = [];
  if (typeof d.exchangeUsed !== 'boolean') d.exchangeUsed = false;
  if (typeof d.internshipDone !== 'boolean') d.internshipDone = false;
  if (typeof d.deansListCount !== 'number') d.deansListCount = 0;
}
const P70_migrate = migrate;
migrate = function (o) { const r = P70_migrate(o); p70Init(r); return r; };
const P70_newGame = newGame;
newGame = function () { P70_newGame.apply(this, arguments); p70Init(S); };

/* Wrap fx so smarts never drops once locked */
const P70_fxBefore = fx;
fx = function (o) {
  p70Init(S);
  const before = Number(S.smarts) || 0;
  const result = P70_fxBefore.apply(this, arguments);
  /* Once locked, always 100 */
  if (S.p70.smartsLocked) S.smarts = 100;
  /* If this call pushed smarts to 100, lock it permanently */
  if ((Number(S.smarts) || 0) >= 100) S.p70.smartsLocked = true;
  return result;
};

/* =================================================================
   2. GPA FORMULA — reflects current smarts + effort
   ================================================================= */
function p70ComputeGpa(smarts, effort) {
  const s = Math.max(0, Math.min(100, Number(smarts) || 50));
  const e = effort || (S && S.effort) || 'coast';
  /* Base on smarts: 50 → 2.85, 100 → 3.85 */
  let gpa = 1.85 + (s / 100) * 2.0;
  /* Effort modifier */
  if (e === 'hard') gpa += 0.3;
  else if (e === 'skip') gpa -= 0.6;
  return Math.max(0, Math.min(4, gpa));
}

/* Override the base GPA computation for future age-ups */
const P70_p50ComputeGBefore = (typeof p50ComputeG === 'function') ? p50ComputeG : null;
if (P70_p50ComputeGBefore) {
  p50ComputeG = function () {
    const base = p70ComputeGpa(S.smarts, S.effort);
    /* Add small noise so it's not always identical */
    const noise = Math.random() * 0.3 - 0.15;
    return Math.max(0, Math.min(4, base + noise));
  };
}

/* Recompute historical GPA on load for saves that have smarts=100 but GPA < 3.5 */
function p70RecalibrateGpa() {
  if (!S) return;
  p70Init(S);
  if (!S.gpaN || S.gpaN < 1) return;
  const smarts = Number(S.smarts) || 0;
  if (smarts < 95) return;
  const expected = p70ComputeGpa(smarts, 'coast');
  /* If the saved GPA is way off from what current smarts implies, recalibrate */
  if (S.gpa < expected - 0.4) {
    const old = S.gpa;
    S.gpa = expected;
    if (!Array.isArray(S.logRows)) S.logRows = [];
    S.logRows.unshift({ age: S.age, t: '📊 GPA recalculated: your GPA was raised from ' + old.toFixed(2) + ' to ' + expected.toFixed(2) + ' because your current smarts (' + smarts + '%) justifies a higher result.' });
    if (typeof save === 'function') save();
  }
}
setTimeout(p70RecalibrateGpa, 500);

/* =================================================================
   3. THANAWEYA AMMA CUTOFFS (real Egyptian 2024 numbers)
   ================================================================= */
const P70_EGY_CUTOFFS = {
  medicine:         91.5,
  dentistry:        90.8,
  pharmacy:         89.2,
  physical_therapy: 85.0,
  engineering:      83.5,
  computer_science: 80.0,
  science:          76.5,
  nursing:          70.0,
  business:         72.0,
  commerce:         70.5,
  economics:        74.0,
  law:              68.5,
  arts:             65.0,
  education:        62.5,
  mass_comm:        72.0,
  agriculture:      63.0,
  veterinary:       85.5
};

/* Map base majors to Egyptian faculty cutoff keys */
const P70_MAJOR_TO_CUTOFF = {
  medicine: 'medicine',
  law: 'law',
  cs: 'computer_science',
  business: 'business',
  biology: 'science'
};

function p70CutoffForMajor(majorId) {
  const key = P70_MAJOR_TO_CUTOFF[majorId] || 'business';
  return P70_EGY_CUTOFFS[key] || 65;
}

/* Block Egyptian public-university enrollment if Thanaweya is below the cutoff */
const P70_enrollEgyptBefore = (typeof enrollEgyptUniversity === 'function') ? enrollEgyptUniversity : null;
if (P70_enrollEgyptBefore) {
  enrollEgyptUniversity = function (uniId, faculty, funder) {
    if (S.country === 'egy') {
      const thana = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || (S.gpa ? S.gpa / 4 * 100 : 0);
      const key = (faculty || '').toLowerCase().replace(/\s+/g, '_');
      const cutoff = P70_EGY_CUTOFFS[key] || null;
      if (cutoff !== null && thana > 0 && thana < cutoff) {
        return hint('❌ Thanaweya Amma cutoff for ' + faculty + ' is ' + cutoff + '%. Your score is ' + thana.toFixed(1) + '%. You cannot enrol in this faculty.');
      }
    }
    return P70_enrollEgyptBefore.apply(this, arguments);
  };
}

/* Show cutoffs on the Egypt university UI */
function p70CutoffsTable() {
  const thana = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || null;
  const rows = Object.entries(P70_EGY_CUTOFFS)
    .sort(function (a, b) { return b[1] - a[1]; })
    .map(function (pair) {
      const key = pair[0], cutoff = pair[1];
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      const eligible = thana == null ? null : thana >= cutoff;
      const color = eligible == null ? 'var(--muted)' : eligible ? 'var(--mint)' : 'var(--rose)';
      return '<div class="row" style="padding:4px 0;font-size:.82rem">' +
        '<span>' + label + '</span>' +
        '<span><b class="mono" style="color:' + color + '">' + cutoff + '%</b>' +
        (eligible != null ? ' <span style="font-size:.7rem;color:' + color + '">' + (eligible ? '✓' : '✗') + '</span>' : '') +
        '</span>' +
        '</div>';
    }).join('');

  return '<section class="card"><h3>📊 Egyptian university cutoffs (Thanaweya Amma)</h3>' +
    '<p class="muted" style="font-size:.82rem">Public universities in Egypt admit by Thanaweya Amma percentage. Higher cutoffs mean more competitive faculties.</p>' +
    (thana != null ? '<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span><b>Your score</b></span><b class="mono" style="color:var(--cyan)">' + thana.toFixed(1) + '%</b></div>' : '<p class="muted" style="font-size:.78rem">Get your Thanaweya result first (age 18) to see eligibility.</p>') +
    rows +
    '</section>';
}

/* =================================================================
   4. UNIVERSITY EXTRACURRICULARS
   ================================================================= */
const P70_ACTIVITIES = [
  { id: 'debate',    name: 'Debate club',              egp: 500,  smarts: 1, social: 3, happiness: 2, note: 'Improves public speaking and confidence.' },
  { id: 'ieee',      name: 'IEEE / engineering student branch', egp: 800, smarts: 2, social: 2, happiness: 1, note: 'Technical community, networking, competitions.' },
  { id: 'model_un',  name: 'Model United Nations',     egp: 700,  smarts: 1, social: 4, happiness: 2, note: 'Diplomacy, world issues, strong for CV.' },
  { id: 'theatre',   name: 'Student theatre',          egp: 300,  smarts: 0, social: 3, happiness: 4, note: 'Creative outlet, performance, confidence.' },
  { id: 'sports_team', name: 'University sports team', egp: 400,  smarts: 0, social: 3, happiness: 3, health: 2, note: 'Physical fitness, teamwork, university league.' },
  { id: 'newspaper', name: 'Student newspaper',        egp: 0,    smarts: 2, social: 2, happiness: 2, note: 'Writing, editing, investigation.' },
  { id: 'volunteering', name: 'Volunteer at local NGO', egp: 100, smarts: 1, social: 3, happiness: 3, note: 'Community impact, references, perspective.' },
  { id: 'business_club', name: 'Business / entrepreneurship club', egp: 600, smarts: 2, social: 3, happiness: 1, note: 'Case competitions, startup projects, mentorship.' }
];

function p70JoinActivity(id) {
  p70Init(S);
  if (!S.uni && !S.localMast && !S.mast) return hint('You need to be enrolled first.');
  const a = P70_ACTIVITIES.find(function (x) { return x.id === id; });
  if (!a) return hint('Activity not found.');
  if (S.p70.extracurriculars.indexOf(id) !== -1) return hint('You are already in this club.');
  const egp = Math.round(a.egp * (typeof prOf === 'function' ? prOf(gameYear(), S) : 1));
  const internal = egp / p70Rate();
  if (S.wealth < internal) return hint('Membership costs ' + egp.toLocaleString() + ' EGP.');

  S.wealth -= internal;
  if (internal > 0) {
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.extracurricular = (S.bill.extracurricular || 0) + internal;
  }
  S.p70.extracurriculars.push(id);
  const effect = { smarts: a.smarts, social: a.social, happiness: a.happiness, health: a.health };
  fx(effect);
  log('🎭 Joined ' + a.name + '. ' + a.note);
  realismNotice('Joined ' + a.name, a.note);
  hint(); render();
}
window.p70JoinActivity = p70JoinActivity;

function p70ActivityCard() {
  p70Init(S);
  if (!S.uni && !S.localMast && !S.mast && !S.degree) return '';
  const enrolled = !!(S.uni || S.localMast || S.mast);
  const joined = S.p70.extracurriculars || [];

  let html = '<section class="card"><h3>🎭 Student life & extracurriculars</h3>';
  if (!enrolled && S.degree) {
    html += '<p class="muted" style="font-size:.82rem">You already graduated. Extracurriculars are a student-only benefit — they boost your CV while you study.</p>';
  } else if (!enrolled) {
    html += '<p class="muted" style="font-size:.82rem">Enrol at a university first to join student clubs.</p>';
  } else {
    html += '<p class="muted" style="font-size:.82rem">Join clubs while you study. They build skills, friendships, and a CV that stands out after graduation. You can join multiple clubs.</p>';
  }

  if (enrolled) {
    P70_ACTIVITIES.forEach(function (a) {
      const inClub = joined.indexOf(a.id) !== -1;
      const egp = Math.round(a.egp * (typeof prOf === 'function' ? prOf(gameYear(), S) : 1));
      const canPay = S.wealth >= egp / p70Rate();
      html += '<div style="margin-top:10px;padding:10px;border:1px solid ' + (inClub ? 'var(--mint)' : 'var(--line)') + ';border-radius:8px">' +
        '<div style="display:flex;justify-content:space-between;gap:8px">' +
        '<div style="min-width:0;flex:1"><b>' + a.name + '</b>' +
        '<div class="muted" style="font-size:.78rem;margin-top:3px">' + a.note + '</div></div>' +
        '<div style="text-align:right;flex-shrink:0"><div class="mono" style="font-size:.82rem">' + (egp ? 'E£' + egp.toLocaleString() : 'Free') + '</div></div>' +
        '</div>' +
        '<div class="row" style="border:0;padding:3px 0;font-size:.75rem;margin-top:6px"><span>Benefits</span><b>' +
        (a.smarts ? '+Smarts ' : '') + (a.social ? '+Social ' : '') + (a.happiness ? '+Happy ' : '') + (a.health ? '+Health' : '') +
        '</b></div>' +
        (inClub
          ? '<p style="color:var(--mint);font-size:.8rem;margin-top:6px">✓ Member</p>'
          : '<button class="btn" style="margin-top:6px;font-size:.8rem;padding:6px" ' + (canPay ? '' : 'disabled') + ' onclick="p70JoinActivity(\'' + a.id + '\')">' + (canPay ? 'Join' : 'Cannot afford') + '</button>') +
        '</div>';
    });
  }
  html += '</section>';
  return html;
}

/* =================================================================
   5. EXCHANGE SEMESTER
   ================================================================= */
function p70ExchangeCard() {
  if (!S || !S.uni && !S.localMast && !S.mast) return '';
  p70Init(S);
  if (S.p70.exchangeUsed) {
    return '<section class="card"><h3>✈️ Exchange semester</h3>' +
      '<p style="color:var(--mint);font-size:.85rem">✓ You completed one exchange semester abroad.</p>' +
      '</section>';
  }
  const y = gameYear();
  const yearNow = S.uni ? (S.uni.year || 0) : 0;
  /* Only in year 2 or 3 */
  if (yearNow < 1 || yearNow > 3) {
    return '<section class="card"><h3>✈️ Exchange semester</h3>' +
      '<p class="muted" style="font-size:.82rem">Available in Year 2 or 3 of your bachelor degree. Not in your first or last year.</p>' +
      '</section>';
  }

  const opts = [
    { id: 'deu', name: '🇩🇪 Germany', egp: 250000, academic: 2, social: 4, note: 'Technical universities (TUM, RWTH, TU Berlin)' },
    { id: 'fra', name: '🇫🇷 France',  egp: 280000, academic: 2, social: 4, note: 'Sorbonne, Sciences Po, engineering schools' },
    { id: 'usa', name: '🇺🇸 USA',     egp: 600000, academic: 2, social: 5, note: 'State university partners (Berkeley, Michigan)' },
    { id: 'gbr', name: '🇬🇧 UK',      egp: 500000, academic: 2, social: 5, note: 'Russell Group universities' },
    { id: 'tur', name: '🇹🇷 Türkiye', egp: 80000,  academic: 1, social: 3, note: 'Erasmus partner universities' },
    { id: 'jpn', name: '🇯🇵 Japan',   egp: 320000, academic: 2, social: 4, note: 'University of Tokyo, Kyoto partner network' }
  ];

  let html = '<section class="card" style="border-color:var(--cyan)"><h3>✈️ Exchange semester</h3>' +
    '<p class="muted" style="font-size:.82rem">Spend one semester at a partner university abroad. Covers tuition at the host, but you pay for travel, housing, and living costs. Boosts CV, networks and language.</p>';
  opts.forEach(function (o) {
    const canPay = S.wealth >= o.egp / p70Rate();
    html += '<button class="btn" style="margin-top:8px" ' + (canPay ? '' : 'disabled') + ' onclick="p70DoExchange(\'' + o.id + '\')">' +
      o.name + ' · E£' + o.egp.toLocaleString() +
      '<small>' + o.note + ' · +Smarts ' + o.academic + ', +Social ' + o.social + '</small>' +
      (canPay ? '' : '<small style="color:var(--rose)">Cannot afford</small>') +
      '</button>';
  });
  html += '</section>';
  return html;
}

function p70DoExchange(id) {
  p70Init(S);
  if (S.p70.exchangeUsed) return hint('You already did an exchange.');
  const opts = { deu: 250000, fra: 280000, usa: 600000, gbr: 500000, tur: 80000, jpn: 320000 };
  const egp = opts[id];
  if (!egp) return hint('Invalid.');
  const internal = egp / p70Rate();
  if (S.wealth < internal) return hint('Not enough cash.');
  if (!confirm('Spend a semester abroad? Cost: E£' + egp.toLocaleString() + '. You will return with new skills and connections.')) return;
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.exchange = (S.bill.exchange || 0) + internal;
  S.p70.exchangeUsed = true;
  S.p70.achievements.push('Exchange semester: ' + id);
  fx({ smarts: 3, social: 5, happiness: 6 });
  log('✈️ Completed one exchange semester abroad.');
  realismNotice('Exchange completed', 'You spent a semester abroad, boosted your CV and network.');
  hint(); render();
}
window.p70DoExchange = p70DoExchange;

/* =================================================================
   6. FINAL-YEAR INTERNSHIP
   ================================================================= */
function p70InternshipCard() {
  if (!S.uni) return '';
  p70Init(S);
  if (S.p70.internshipDone) {
    return '<section class="card"><h3>💼 Final-year internship</h3>' +
      '<p style="color:var(--mint);font-size:.85rem">✓ You completed a final-year internship. This helps your job search after graduation.</p>' +
      '</section>';
  }
  const years = S.uni.yearsTotal || 4;
  const yearNow = S.uni.year || 0;
  /* Only in final year */
  if (yearNow < years - 1) {
    return '<section class="card"><h3>💼 Final-year internship</h3>' +
      '<p class="muted" style="font-size:.82rem">Available in your last year of study. Real companies hire final-year students for a paid internship that often leads to a job offer.</p>' +
      '</section>';
  }

  const opts = [
    { id: 'corp', name: 'Corporate internship (bank, telecom, consulting)', egp: 120000, smarts: 3, social: 4, note: 'Pays well, competitive, strong for CV.' },
    { id: 'startup', name: 'Startup internship', egp: 60000, smarts: 4, social: 2, note: 'Less pay, more responsibility, faster learning.' },
    { id: 'gov', name: 'Government / public sector internship', egp: 40000, smarts: 1, social: 3, note: 'Stable, formal, less competitive pay.' },
    { id: 'ngo', name: 'NGO / international organization', egp: 80000, smarts: 3, social: 3, note: 'Purpose-driven, formal training, international network.' }
  ];

  let html = '<section class="card" style="border-color:var(--violet)"><h3>💼 Final-year internship</h3>' +
    '<p class="muted" style="font-size:.82rem">A final-year internship can convert to a full-time offer after graduation. Choose the environment that fits your goals.</p>';
  opts.forEach(function (o) {
    html += '<button class="btn" style="margin-top:8px" onclick="p70DoInternship(\'' + o.id + '\')">' +
      o.name + ' · ' + Math.round(o.egp * 0.1).toLocaleString() + ' EGP/month' +
      '<small>' + o.note + ' · +Smarts ' + o.smarts + ', +Social ' + o.social + '</small>' +
      '</button>';
  });
  html += '</section>';
  return html;
}

function p70DoInternship(id) {
  p70Init(S);
  if (S.p70.internshipDone) return hint('Already done.');
  if (!S.uni) return hint('You need to be enrolled.');
  const opts = {
    corp:    { name: 'Corporate',   egp: 120000, smarts: 3, social: 4 },
    startup: { name: 'Startup',     egp: 60000,  smarts: 4, social: 2 },
    gov:     { name: 'Government',  egp: 40000,  smarts: 1, social: 3 },
    ngo:     { name: 'NGO',         egp: 80000,  smarts: 3, social: 3 }
  };
  const o = opts[id];
  if (!o) return hint('Invalid.');
  /* Yearly stipend added over final year */
  const internal = o.egp / p70Rate();
  S.wealth += internal;
  S.income = (S.income || 0) + internal;
  S.p70.internshipDone = true;
  S.p70.achievements.push('Final-year internship: ' + o.name);
  fx({ smarts: o.smarts, social: o.social, happiness: 2 });
  log('💼 Completed a final-year internship in ' + o.name.toLowerCase() + '. Stipend: E£' + o.egp.toLocaleString() + '.');
  realismNotice('Internship completed', 'Final-year internship at ' + o.name.toLowerCase() + '. This significantly improves your job market position after graduation.');
  hint(); render();
}
window.p70DoInternship = p70DoInternship;

/* =================================================================
   7. DEAN'S LIST — automatic yearly check
   ================================================================= */
function p70DeansListCheck() {
  p70Init(S);
  if (!S.uni) return;
  const gpa = S.gpa || 0;
  if (gpa >= 3.7) {
    S.p70.deansListCount = (S.p70.deansListCount || 0) + 1;
    S.p70.achievements.push("Dean's List — age " + S.age + ' (GPA ' + gpa.toFixed(2) + ')');
    fx({ happiness: 4, social: 2 });
    log("🏅 Dean's List — your GPA of " + gpa.toFixed(2) + " qualified you this year.");
    realismNotice("Dean's List", 'Your GPA qualified for academic honors.');
  } else if (gpa >= 3.5) {
    /* Honorable mention */
    S.p70.achievements.push('Academic merit note — age ' + S.age + ' (GPA ' + gpa.toFixed(2) + ')');
    fx({ happiness: 2 });
    log('📜 Academic merit — GPA ' + gpa.toFixed(2) + ' is above the university merit threshold.');
  }
}

/* Hook into yearly cycle */
const P70_ageUpBeforeDeans = ageUp;
ageUp = function () {
  const wasStudying = !!(S && S.uni);
  const r = P70_ageUpBeforeDeans.apply(this, arguments);
  if (S && wasStudying) {
    try { p70DeansListCheck(); } catch (e) { console.error('Deans list check failed:', e); }
  }
  return r;
};

/* =================================================================
   8. ACHIEVEMENTS SUMMARY CARD
   ================================================================= */
function p70AchievementsCard() {
  p70Init(S);
  const ach = S.p70.achievements || [];
  const ex = S.p70.extracurriculars || [];
  const dean = S.p70.deansListCount || 0;
  if (!ach.length && !ex.length && !S.p70.exchangeUsed && !S.p70.internshipDone) return '';

  let html = '<section class="card"><h3>🏅 Academic achievements</h3>';

  if (S.degree) {
    html += '<div class="row"><span>Degree</span><b>' + ((typeof MAJORS !== 'undefined' && MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree) + '</b></div>';
    if (S.gpa) html += '<div class="row"><span>Final GPA</span><b>' + S.gpa.toFixed(2) + ' / 4.0</b></div>';
  }
  if (dean) html += '<div class="row"><span>Dean\'s List</span><b>' + dean + ' time(s)</b></div>';
  if (S.p70.exchangeUsed) html += '<div class="row"><span>Exchange semester</span><b>✓ Completed</b></div>';
  if (S.p70.internshipDone) html += '<div class="row"><span>Final-year internship</span><b>✓ Completed</b></div>';
  if (ex.length) html += '<div class="row"><span>Student clubs</span><b>' + ex.length + ' joined</b></div>';

  if (ach.length) {
    html += '<p class="muted" style="font-size:.78rem;margin-top:10px">Timeline</p>';
    ach.slice(-6).reverse().forEach(function (a) {
      html += '<div class="row" style="padding:3px 0;font-size:.78rem"><span>' + a + '</span></div>';
    });
  }
  html += '</section>';
  return html;
}

/* =================================================================
   9. UI INTEGRATION
   ================================================================= */
const P70_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P70_viewSchoolBefore.apply(this, arguments);
  if (!S || S.age < 12) return html;

  /* Insert new cards before the base "international" area */

  /* 1. Cutoffs table — show to Egyptian high schoolers and early adults */
  if (S.country === 'egy' && S.age >= 16 && S.age <= 22 && !S.degree) {
    html = p70CutoffsTable() + html;
  }

  /* 2. Extracurriculars — only when enrolled */
  if (S.uni || S.localMast || S.mast) {
    html += p70ActivityCard();
  }

  /* 3. Exchange semester — only for bachelor's year 2-3 */
  if (S.uni) {
    html += p70ExchangeCard();
  }

  /* 4. Final-year internship */
  if (S.uni) {
    html += p70InternshipCard();
  }

  /* 5. Achievements summary */
  html += p70AchievementsCard();

  return html;
};

/* =================================================================
   10. INIT
   ================================================================= */
p70Init(S);
setTimeout(p70RecalibrateGpa, 500);
setTimeout(p70RecalibrateGpa, 2000);
console.log('[p70] Education deep improvements loaded');
