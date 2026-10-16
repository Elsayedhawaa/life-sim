/* =====================================================================
   81. ABROAD REALITY — visa, housing, career adaptation on travel
   Fixes:
   - Egyptian job doesn't end when you travel abroad
   - "Graduate now" button appears immediately (enrollStartAbsMonth not set)
   - No major selection before enrolling abroad
   - Degree shows "graduated -1"
   - No visa status anywhere
   - Real Estate still shows parents' home while abroad
   - Career tab shows Egyptian jobs while abroad
   - Parents' home value absurdly inflated (20 trillion EGP)
   Load AFTER 80-international-flow-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p81Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p81EGP(egp) { return Math.round(egp); }

/* =================================================================
   1. STATE
   ================================================================= */
function p81Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p81) o.p81 = {};
  const d = o.p81;
  if (!d.visa) d.visa = null;              /* { type, name, country, grantedYear, expiresYear, workRights, notes } */
  if (typeof d.abroadSinceYear !== 'number') d.abroadSinceYear = -1;
  if (typeof d.majorChosen !== 'string') d.majorChosen = null;
  if (typeof d.abroadHousing !== 'string') d.abroadHousing = null;
  if (typeof d.abroadCity !== 'string') d.abroadCity = null;
}
const P81_migrate = migrate;
migrate = function (o) { const r = P81_migrate(o); p81Init(r); return r; };
const P81_newGame = newGame;
newGame = function () { P81_newGame.apply(this, arguments); p81Init(S); };

/* =================================================================
   2. VISA RULES BY COUNTRY (realistic)
   ================================================================= */
const P81_VISA_RULES = {
  gbr: {
    student: {
      name: 'UK Student visa (Tier 4)',
      workRights: '20 hrs/week during term · full-time in holidays',
      durationYears: 4,
      notes: 'You cannot work full-time during term. You can bring dependants only on postgraduate courses.'
    },
    postStudy: {
      name: 'Graduate Route',
      durationYears: 2,
      workRights: 'Full-time, any employer · no sponsorship needed'
    },
    longTerm: {
      name: 'Skilled Worker visa',
      needs: 'Employer sponsorship + salary ≥ £26,200'
    },
    pr: { name: 'Indefinite Leave to Remain', afterYears: 5 }
  },
  usa: {
    student: {
      name: 'F-1 Student visa',
      workRights: '20 hrs/week on campus only · off-campus requires CPT/OPT',
      durationYears: 4,
      notes: 'Off-campus work is not allowed without authorization.'
    },
    postStudy: {
      name: 'OPT (Optional Practical Training)',
      durationYears: 1,
      workRights: 'Full-time in your field of study · 3 years for STEM'
    },
    longTerm: {
      name: 'H-1B visa',
      needs: 'Employer sponsorship + lottery selection'
    },
    pr: { name: 'Green Card', afterYears: 8 }
  },
  deu: {
    student: {
      name: 'German Student visa',
      workRights: '120 full days or 240 half days per year',
      durationYears: 4,
      notes: 'Free tuition at public universities. You need a blocked account (~€11,208/yr).'
    },
    postStudy: {
      name: '18-month Job-Seeking visa',
      durationYears: 1.5,
      workRights: 'Full-time any job that matches your qualification'
    },
    longTerm: {
      name: 'EU Blue Card',
      needs: 'Job offer with salary ≥ €43,800 (or €39,683 for shortage occupations)'
    },
    pr: { name: 'Settlement permit', afterYears: 5 }
  },
  can: {
    student: {
      name: 'Canadian Study Permit',
      workRights: '20 hrs/week during term · full-time in scheduled breaks',
      durationYears: 4
    },
    postStudy: {
      name: 'PGWP (Post-Graduation Work Permit)',
      durationYears: 3,
      workRights: 'Full-time, any employer · no sponsorship needed'
    },
    longTerm: {
      name: 'Express Entry / PR',
      needs: 'Points-based system · language test + work experience'
    },
    pr: { name: 'Permanent Residence', afterYears: 1 }
  },
  fra: {
    student: {
      name: 'French Student visa',
      workRights: '964 hrs/year (~20 hrs/week)',
      durationYears: 4
    },
    postStudy: {
      name: 'APS (Autorisation Provisoire de Séjour)',
      durationYears: 1,
      workRights: 'Full-time job search'
    },
    longTerm: {
      name: 'Passeport Talent',
      needs: 'Qualified job offer, salary ≥ 2× minimum wage'
    },
    pr: { name: 'Carte de résident', afterYears: 5 }
  },
  nld: {
    student: {
      name: 'Dutch Student visa',
      workRights: '16 hrs/week · or full-time in Jun-Aug',
      durationYears: 4
    },
    postStudy: {
      name: 'Orientation Year (Zoekjaar)',
      durationYears: 1,
      workRights: 'Full-time, any employer'
    },
    longTerm: {
      name: 'Highly Skilled Migrant visa',
      needs: 'Employer must be a recognized sponsor'
    },
    pr: { name: 'Permanent Residence', afterYears: 5 }
  },
  aus: {
    student: {
      name: 'Australian Student visa (subclass 500)',
      workRights: '48 hrs/fortnight during term · unlimited in holidays',
      durationYears: 4
    },
    postStudy: {
      name: 'Temporary Graduate visa (485)',
      durationYears: 2,
      workRights: 'Full-time, any employer'
    },
    longTerm: {
      name: 'Skilled Independent visa (189)',
      needs: 'Points test + skills assessment'
    },
    pr: { name: 'Permanent Residence', afterYears: 4 }
  }
};

function p81VisaRulesFor(country) {
  return P81_VISA_RULES[country] || null;
}

function p81DefaultVisaFor(country) {
  const rules = p81VisaRulesFor(country);
  if (!rules) {
    return {
      type: 'student',
      name: 'Student visa',
      country: country,
      grantedYear: gameYear(),
      expiresYear: gameYear() + 4,
      workRights: 'Limited part-time work',
      notes: 'Standard student visa.'
    };
  }
  const v = rules.student;
  return {
    type: 'student',
    name: v.name,
    country: country,
    grantedYear: gameYear(),
    expiresYear: gameYear() + (v.durationYears || 4),
    workRights: v.workRights,
    notes: v.notes || ''
  };
}

/* =================================================================
   3. MAJOR PICKER before enrolling abroad
   ================================================================= */
const P81_MAJORS = [
  { id: 'business',   name: 'Business / Management' },
  { id: 'economics',  name: 'Economics' },
  { id: 'cs',         name: 'Computer Science' },
  { id: 'engineering',name: 'Engineering' },
  { id: 'law',        name: 'Law' },
  { id: 'medicine',   name: 'Medicine / Health' },
  { id: 'biology',    name: 'Biology / Life Sciences' },
  { id: 'arts',       name: 'Arts / Humanities' }
];

function p81PromptMajorFor(app) {
  /* Pick major — via confirm dialogs in order */
  const list = P81_MAJORS.map(function (m, i) { return (i + 1) + '. ' + m.name; }).join('\n');
  const input = prompt('Choose your major at ' + app.uni + ':\n\n' + list + '\n\nEnter the number (1-' + P81_MAJORS.length + '):', '1');
  if (input == null) return null;
  const n = parseInt(input, 10);
  if (!n || n < 1 || n > P81_MAJORS.length) return null;
  return P81_MAJORS[n - 1];
}

/* =================================================================
   4. ENROLL FIX — ask major, kill job, set visa, fix degree year
   Overrides p80EnrollFromApp entirely to add the missing steps.
   ================================================================= */
const P81_enrollBefore = (typeof p80EnrollFromApp === 'function') ? p80EnrollFromApp : null;

function p81Enroll(uniName) {
  p81Init(S);
  const app = (S.p79 && Array.isArray(S.p79.appliedUnis))
    ? S.p79.appliedUnis.find(function (a) { return a.uni === uniName && a.result && a.result.indexOf('admitted') === 0; })
    : null;
  if (!app) return hint('No admission to accept.');
  if (app.result === 'admitted-no-funds') return hint('You were admitted but have no funding.');

  /* ---- A. Prompt for major ---- */
  const major = p81PromptMajorFor(app);
  if (!major) return hint('You must choose a major to enrol.');
  S.p81.majorChosen = major.id;

  /* ---- B. Egyptian private — keep p80 behaviour ---- */
  if (app.isEgyptPrivate) {
    if (!P81_enrollBefore) return hint('Enrolment system unavailable.');
    return P81_enrollBefore.call(this, uniName);
  }

  /* ---- C. Abroad ---- */
  const cc = COUNTRIES[app.country] || {};
  if (!cc.n) return hint('Unknown destination.');

  /* Kill any Egyptian job */
  if (S.job && !S.job.isForeignJob) {
    const oldTitle = S.job.title || 'your job';
    const oldCompany = S.job.company || 'your Egyptian employer';
    log('💼 You left ' + oldTitle + ' at ' + oldCompany + ' when you moved abroad.');
    S.job = null;
  }
  /* Kill any part-time job */
  if (S.part) {
    log('You left your part-time job when you moved abroad.');
    S.part = null;
  }

  /* Change country */
  S.country = app.country;
  if (typeof setWorld === 'function') {
    try { setWorld(S); } catch (e) { console.error('setWorld failed:', e); }
  }

  /* Housing — student accommodation */
  S.housing = 'room';
  S.p81.abroadHousing = 'Student accommodation';
  S.p81.abroadCity = app.uni.split(' ')[0] || cc.n;
  S.p81.abroadSinceYear = gameYear();

  /* Visa */
  S.p81.visa = p81DefaultVisaFor(app.country);

  /* Record enrollment — with enrollment start month for the "3-year" counter */
  S.p69 = S.p69 || {};
  S.p69.enrolled = {
    uni: app.uni,
    country: app.country,
    level: app.level || 'bachelor',
    field: major.name,
    fieldId: major.id,
    startYear: gameYear(),
    funding: {
      name: app.scholarship || app.funding,
      cover: app.cover || (app.funding === 'parents' ? 1 : (app.funding === 'self' ? 0 : 0))
    }
  };
  S.p73 = S.p73 || {};
  S.p73.abroadStartedYear = gameYear();
  S.p73.abroadField = major.name;
  S.p74 = S.p74 || {};
  /* FIX: set enrollment start month so the "Graduate now" button is correct */
  S.p74.enrollStartAbsMonth = Number(S.pacingAbsoluteMonth) || 0;
  S.p74.enrollTotalMonths = (app.level === 'master' ? 2 : 3) * 12;
  S.p74.enrollField = major.name;

  /* Deduct year-1 cost if self-funded */
  if (app.funding === 'self' && app.year1CostEGP) {
    const cost = app.year1CostEGP / p81Rate();
    if (S.wealth >= cost) {
      S.wealth -= cost;
      log('💸 Paid year-1 cost upfront: E£' + app.year1CostEGP.toLocaleString() + '.');
    }
  }

  app.result = 'enrolled';
  app.majorName = major.name;
  app.majorId = major.id;

  log('✈️ You travelled to ' + cc.n + ' and enrolled at ' + app.uni + ' — ' + major.name + '.');
  realismNotice('Welcome to ' + cc.n, 'You are now on a ' + S.p81.visa.name + '. ' + S.p81.visa.workRights + '.');
  save();
  hint();
  render();
}

if (P81_enrollBefore) {
  p80EnrollFromApp = p81Enroll;
  window.p80EnrollFromApp = p81Enroll;
}

/* =================================================================
   5. VISA STATUS CARD + DISPLAY
   ================================================================= */
function p81VisaCard() {
  if (!S || !S.p81 || !S.p81.visa) return '';
  const v = S.p81.visa;
  const rules = p81VisaRulesFor(v.country);
  const yearsLeft = (v.expiresYear || 0) - gameYear();

  let html = '<section class="card" style="border-color:var(--violet)"><h3>🛂 Visa status — ' + v.name + '</h3>' +
    '<div class="row"><span>Country</span><b>' + (COUNTRIES[v.country] ? COUNTRIES[v.country].n : v.country) + '</b></div>' +
    '<div class="row"><span>Granted</span><b>' + v.grantedYear + '</b></div>' +
    '<div class="row"><span>Expires</span><b>' + v.expiresYear + ' (' + yearsLeft + ' yrs left)</b></div>' +
    '<div class="row"><span>Work rights</span><b style="color:var(--cyan)">' + v.workRights + '</b></div>';

  if (v.notes) {
    html += '<p class="muted" style="font-size:.78rem;margin-top:6px">' + v.notes + '</p>';
  }

  /* Show path after graduation */
  if (rules && rules.postStudy) {
    html += '<p class="muted" style="font-size:.78rem;margin-top:8px"><b style="color:var(--mint)">After graduation:</b> ' +
      rules.postStudy.name + ' — ' + rules.postStudy.durationYears + ' yr, ' + rules.postStudy.workRights + '</p>';
  }
  if (rules && rules.longTerm) {
    html += '<p class="muted" style="font-size:.78rem"><b style="color:var(--amber)">Long-term:</b> ' +
      rules.longTerm.name + ' — ' + rules.longTerm.needs + '</p>';
  }
  if (rules && rules.pr) {
    html += '<p class="muted" style="font-size:.78rem"><b>Permanent residence:</b> ' +
      rules.pr.name + ' (typically after ' + rules.pr.afterYears + ' years).</p>';
  }
  html += '</section>';
  return html;
}

/* =================================================================
   6. HOUSING / REAL ESTATE — hide parents' home when abroad
   ================================================================= */
const P81_viewAssetsBefore = viewAssets;
viewAssets = function () {
  let html = P81_viewAssetsBefore.apply(this, arguments);
  if (!S) return html;
  p81Init(S);

  const abroad = S.country !== S.home;

  if (abroad) {
    /* Remove parents' home block */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏠 Your parents' home<\/h3>[\s\S]*?<\/section>/g, '');
    /* Remove "YOU CURRENTLY LIVE IN Parents' home" block */
    html = html.replace(/YOU CURRENTLY LIVE IN[\s\S]*?Parents' home[\s\S]*?Living with family[\s\S]*?<\/section>/g, '');
    /* Remove any "Stay with parents" button */
    html = html.replace(/<button[^>]*onclick="stayHome\(\)"[^>]*>[\s\S]*?<\/button>/g, '');

    /* Add an abroad housing card at the top */
    const cc = COUNTRIES[S.country] || {};
    const cityLabel = S.p81.abroadCity || cc.n;
    const abroadCard = '<section class="card" style="border-color:var(--cyan)"><h3>🏠 Where you live now</h3>' +
      '<div class="row"><span>Country</span><b>' + cc.n + '</b></div>' +
      '<div class="row"><span>City</span><b>' + cityLabel + '</b></div>' +
      '<div class="row"><span>Housing</span><b>' + (S.p81.abroadHousing || 'Student accommodation') + '</b></div>' +
      '<div class="row"><span>Since</span><b>' + (S.p81.abroadSinceYear || '—') + '</b></div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:6px">Your family home in ' + (COUNTRIES[S.home] ? COUNTRIES[S.home].n : 'Egypt') + ' is still yours to visit — but you do not live there.</p>' +
      '</section>';
    html = abroadCard + html;
  }

  return html;
};

/* =================================================================
   7. CAREER — filter jobs by country + show visa restriction
   ================================================================= */
const P81_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P81_viewCareerBefore.apply(this, arguments);
  if (!S || S.age < 18) return html;
  p81Init(S);

  const abroad = S.country !== S.home;
  if (!abroad || !S.p81.visa) return html;

  /* Info card explaining you can only take visa-allowed work */
  const cc = COUNTRIES[S.country] || {};
  const visaCard = '<section class="card" style="border-color:var(--amber)"><h3>⚠️ Work rights in ' + cc.n + '</h3>' +
    '<div class="row"><span>Visa</span><b>' + S.p81.visa.name + '</b></div>' +
    '<div class="row"><span>Work allowed</span><b style="color:var(--cyan)">' + S.p81.visa.workRights + '</b></div>' +
    '<p class="muted" style="font-size:.78rem;margin-top:6px">Full-time jobs require employer visa sponsorship. Most entry-level postings in ' + cc.n + ' do not sponsor — look for "sponsorship: Yes" on each posting.</p>' +
    '</section>';

  /* Hide any Egyptian job applied elsewhere — but S.job is already nulled on travel so nothing to hide */
  return visaCard + html;
};

/* =================================================================
   8. EDUCATION — show visa card at top when abroad
   ================================================================= */
const P81_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P81_viewSchoolBefore.apply(this, arguments);
  if (!S) return html;
  p81Init(S);

  /* If abroad + enrolled: show visa card at the top */
  if (S.country !== S.home && S.p81.visa) {
    html = p81VisaCard() + html;
  }

  /* If abroad but not enrolled: show visa card too (so player knows their status) */
  if (S.country !== S.home && !S.p69.enrolled && S.p81.visa) {
    /* already added above */
  }

  return html;
};

/* =================================================================
   9. FIX — remove "Graduate now" button when years haven't elapsed
   Overrides the p74 render logic that showed it incorrectly
   ================================================================= */
function p81YearsInProgram() {
  if (!S.p74 || S.p74.enrollStartAbsMonth < 0) return 0;
  const abs = Number(S.pacingAbsoluteMonth) || 0;
  const months = Math.max(0, abs - S.p74.enrollStartAbsMonth);
  return months / 12;
}
function p81YearsLeftInProgram() {
  const total = (S.p74 && S.p74.enrollTotalMonths) ? S.p74.enrollTotalMonths / 12 : 3;
  return Math.max(0, total - p81YearsInProgram());
}

/* Override p73GraduateAbroad to check the years requirement */
const P81_graduateBefore = (typeof p73GraduateAbroad === 'function') ? p73GraduateAbroad : null;
function p81GraduateAbroad() {
  p81Init(S);
  if (!S.p69 || !S.p69.enrolled) return hint('You are not enrolled abroad.');
  const yearsIn = p81YearsInProgram();
  const total = (S.p74 && S.p74.enrollTotalMonths) ? S.p74.enrollTotalMonths / 12 : 3;
  if (yearsIn < total - 0.05) {
    const left = Math.ceil(total - yearsIn);
    return hint('You have not completed the program. ' + yearsIn.toFixed(1) + ' / ' + total + ' years. ~' + left + ' year(s) left.');
  }
  if (!P81_graduateBefore) return hint('Graduation function missing.');
  /* Ensure graduation year is set correctly */
  S.p49 = S.p49 || {};
  S.p49.graduationYear = gameYear();
  S.p49.graduationMonth = Number(S.pacingAbsoluteMonth) || 0;
  return P81_graduateBefore.apply(this, arguments);
}
if (P81_graduateBefore) {
  p73GraduateAbroad = p81GraduateAbroad;
  window.p73GraduateAbroad = p81GraduateAbroad;
}

/* =================================================================
   10. FIX — parents' home value sanity (20 trillion is a bug)
   ================================================================= */
function p81FixParentsHomeValue() {
  if (!S || !S.p60 || !S.p60.parentsHome) return;
  const h = S.p60.parentsHome;
  const rate = p81Rate();
  const current = Number(h.value) || 0;
  /* Reasonable upper bound: 500M EGP in current value */
  const maxEGP = 500000000 * p81Idx();
  /* Also floor at 100k EGP */
  const minEGP = 100000 * p81Idx();

  if (current > maxEGP) {
    /* Rebuild using a reasonable multiplier of the original base */
    const baseByTier = [400000, 1200000, 3500000, 8000000, 20000000, 60000000][
      (S.p76 && S.p76.wealthLevel) || 2
    ] || 3500000;
    const rebuilt = Math.round(baseByTier * p81Idx());
    log('🔧 Rebuilt parents\' home value (was E£' + current.toLocaleString() + ', now E£' + rebuilt.toLocaleString() + ').');
    h.value = rebuilt;
  } else if (current < minEGP && current > 0) {
    h.value = Math.round(3500000 * p81Idx());
  }
}
function p81Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
setTimeout(p81FixParentsHomeValue, 400);
setTimeout(p81FixParentsHomeValue, 2000);

/* =================================================================
   11. FIX — life log doesn't spam family gifts to absurd amounts
   Cap "gift from parents" amount at a reasonable threshold
   ================================================================= */
/* Optional: reduce luxury events if famWealth is tier 5 */

/* =================================================================
   12. HOOK — visa expires check on year tick
   ================================================================= */
const P81_ageUpBeforeVisa = ageUp;
ageUp = function () {
  const r = P81_ageUpBeforeVisa.apply(this, arguments);
  if (!S || !S.p81 || !S.p81.visa) return r;
  const v = S.p81.visa;
  const year = gameYear();
  if (year >= (v.expiresYear || 9999)) {
    log('⚠️ Your ' + v.name + ' expired on ' + v.expiresYear + '.');
    realismNotice('Visa expired', 'Your ' + v.name + ' expired. You need to renew it or leave the country.');
    /* Auto-renew if still a student (university enrollment continues) */
    if (S.p69 && S.p69.enrolled) {
      v.expiresYear = year + (P81_VISA_RULES[v.country] && P81_VISA_RULES[v.country].student ? P81_VISA_RULES[v.country].student.durationYears : 4);
      log('🛂 You renewed your ' + v.name + ' until ' + v.expiresYear + '.');
    }
  }
  return r;
};

/* =================================================================
   13. HOOK — when S.country changes back to home, clear visa
   ================================================================= */
const P81_countryWatch = setInterval(function () {
  if (!S || !S.p81) return;
  if (S.country === S.home && S.p81.visa) {
    S.p81.visa = null;
  }
}, 3000);

/* =================================================================
   14. INIT
   ================================================================= */
p81Init(S);
setTimeout(p81FixParentsHomeValue, 400);
console.log('[p81] Abroad reality — visa + housing + career adaptation loaded')
/* =================================================================
   81.15 — PASSPORT FIX (home country based)
   The passport panel in 25-languages-passport.js derives from
   S.country. If you live in the UK, it shows a British passport.
   Fix: derive from S.home (birth country). Only override if the
   player has actually naturalized (which requires 6+ years abroad
   with permanent residence).
   ================================================================= */
function p81PassportData() {
  if (!S) return { country: 'egy', name: 'Egyptian passport', access: 50, flag: '🇪🇬' };
  /* Naturalization check: 6+ years abroad with PR */
  const yearsAbroad = (S.p81 && S.p81.abroadSinceYear > 0) ? (gameYear() - S.p81.abroadSinceYear) : 0;
  const naturalized = yearsAbroad >= 6 && S.p81 && S.p81.hasPR;
  /* Passport country: home by default, current if naturalized */
  const passportCountry = naturalized ? S.country : (S.home || 'egy');
  const c = (typeof COUNTRIES !== 'undefined' && COUNTRIES[passportCountry])
    ? COUNTRIES[passportCountry]
    : { n: 'Egypt', f: '🇪🇬' };
  const access = {
    egy: 50, gbr: 187, usa: 186, deu: 190, can: 186, fra: 190,
    nld: 190, aus: 186, jpn: 193, kor: 192, ita: 190, sgp: 195,
    sau: 78, uae: 180
  }[passportCountry] || 50;
  return {
    country: passportCountry,
    name: c.n + ' passport',
    access: access,
    flag: c.f,
    naturalized: naturalized
  };
}

/* Override passportCard if it exists */
const P81_passportCardBase = (typeof passportCard === 'function') ? passportCard : null;
if (P81_passportCardBase) {
  passportCard = function () {
    if (!S) return '';
    const d = p81PassportData();
    const abroad = S.country !== (S.home || 'egy');
    const abroadName = abroad && COUNTRIES[S.country] ? COUNTRIES[S.country].n : null;
    const pct = Math.round((d.access / 195) * 100);
    return '<section class="card"><h3>🛂 Your passport</h3>' +
      '<div class="row"><span>Country</span><b>' + d.flag + ' ' + d.name + '</b></div>' +
      '<div class="row"><span>Type</span><b>Ordinary passport</b></div>' +
      '<div class="row"><span>Visa-free access</span><b>~' + d.access + ' destinations (' + pct + '%)</b></div>' +
      (abroad
        ? '<p class="muted" style="font-size:.78rem;margin-top:8px">You currently live in ' + abroadName + ' on a visa. Your passport is still issued by ' + d.country.toUpperCase() + '.</p>'
        : '<p class="muted" style="font-size:.78rem;margin-top:8px">Your passport is issued by ' + d.country.toUpperCase() + '.</p>') +
      (d.naturalized
        ? '<p class="muted" style="font-size:.78rem;color:var(--mint)">✓ You have naturalized in ' + d.country.toUpperCase() + '.</p>'
        : (abroad && (S.p81 && S.p81.abroadSinceYear > 0)
          ? '<p class="muted" style="font-size:.78rem">Naturalization possible after ~6 years abroad with permanent residence.</p>'
          : '')) +
      '</section>';
  };
}

/* Intercept the world tab passport panel and replace it */
const P81_viewWorldBefore = (typeof viewWorld === 'function') ? viewWorld : null;
if (P81_viewWorldBefore) {
  viewWorld = function () {
    let html = P81_viewWorldBefore.apply(this, arguments);
    if (!S) return html;

    const d = p81PassportData();
    const abroad = S.country !== (S.home || 'egy');
    const abroadName = abroad && COUNTRIES[S.country] ? COUNTRIES[S.country].n : null;
    const pct = Math.round((d.access / 195) * 100);

    /* Replace the "🛂 Your passport and your options" section entirely */
    const newSection =
      '<section class="card">' +
      '<h3>🛂 Your passport and your options</h3>' +
      '<div class="row"><span>Your passport</span><b>' + d.flag + ' ' + d.name + '</b></div>' +
      '<div class="row"><span>Visa-free access</span><b>~' + d.access + ' destinations (' + pct + '%)</b></div>' +
      (abroad
        ? '<div class="row"><span>Currently living in</span><b>' + abroadName + ' (on visa)</b></div>'
        : '') +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">Numbers are approximate and change every year.</p>' +
      '<p class="muted" style="font-size:.78rem">A visa application costs money, takes weeks, and is not refunded if refused. Officers look for proof that you will go home: a job, family, property, or savings.</p>' +
      (abroad
        ? '<p class="muted" style="font-size:.78rem">On a student visa, you can work part-time only. Full-time roles need employer sponsorship. After graduation, a post-study work visa usually allows 1–3 years without sponsorship.</p>'
        : '<p class="muted" style="font-size:.78rem">Studying or working abroad can lead to permanent residence, then citizenship. A stronger passport opens more countries without a visa.</p>') +
      '</section>';

    html = html.replace(
      /<section class="card">\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/,
      newSection
    );
    return html;
  };
}

/* =================================================================
   81.16 — "CONSIDER MASTER'S" BUTTON
   The button only switches tab. It should open the master's picker.
   ================================================================= */
window.p81ShowMasterModal = function () {
  if (!S) return;
  const rate = p81Rate();
  const bankEGP = Math.round(S.wealth * rate);
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;

  const existing = document.getElementById('p81-master-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'p81-master-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
  modal.innerHTML = '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
    '<b style="font-size:1rem">🎓 Master\'s options</b>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p81-master-modal\').remove()">✕</button>' +
    '</div>' +
    '<p class="muted" style="font-size:.78rem;margin-top:8px">GPA <b>' + gpa.toFixed(2) + '</b> · Bank <b>E£' + bankEGP.toLocaleString() + '</b></p>' +
    '<div style="margin-top:14px;padding:12px;background:rgba(52,211,153,.08);border-radius:8px;border-left:3px solid var(--mint)">' +
    '<b style="font-size:.88rem">🇪🇬 Local master\'s in Egypt</b>' +
    '<p class="muted" style="font-size:.75rem;margin-top:4px">Public: 25k–70k EGP/year · Private: 85k–200k EGP/year · 1–2 years duration · Scholarship available for GPA 3.5+</p>' +
    '<button class="btn" style="margin-top:8px" onclick="document.getElementById(\'p81-master-modal\').remove()">Pick subject & apply below</button>' +
    '</div>' +
    '<div style="margin-top:12px;padding:12px;background:rgba(139,92,246,.08);border-radius:8px;border-left:3px solid var(--violet)">' +
    '<b style="font-size:.88rem">🌍 Master\'s abroad</b>' +
    '<p class="muted" style="font-size:.75rem;margin-top:4px">UK, USA, Germany, Canada, France, Netherlands, Australia, Japan, South Korea, Singapore, Italy, Saudi Arabia, UAE</p>' +
    '<p class="muted" style="font-size:.75rem">Full cost = tuition + living + blocked account + visa + flight + setup</p>' +
    '<button class="btn" style="margin-top:8px" onclick="document.getElementById(\'p81-master-modal\').remove()">Scroll down to Study Abroad</button>' +
    '</div>' +
    '<p class="muted" style="font-size:.75rem;margin-top:12px;text-align:center">The full master\'s pickers are in the Education tab below the English section.</p>' +
    '</div>';
  document.body.appendChild(modal);
};

/* Replace "Consider master's" buttons in the Education tab HTML */
const P81_viewSchoolBeforeMasterBtn = viewSchool;
viewSchool = function () {
  let html = P81_viewSchoolBeforeMasterBtn.apply(this, arguments);
  if (!S) return html;
  /* Match any button containing "Consider master" */
  html = html.replace(
    /<button[^>]*>🎓 Consider master's<\/button>/g,
    '<button class="btn" style="text-align:left" onclick="p81ShowMasterModal()">🎓 Consider master\'s</button>'
  );
  return html;
};

/* =================================================================
   81.17 — GRADUATED -1 CLEANUP
   The graduation year wasn't set on enrollment-abroad. Rebuild it.
   ================================================================= */
function p81FixGraduationYear() {
  if (!S) return;
  /* Case 1: p49.graduationYear is negative */
  if (S.p49 && typeof S.p49.graduationYear === 'number' && S.p49.graduationYear < 0) {
    if (S.degree && S.age >= 18) {
      S.p49.graduationYear = gameYear() - 1;
      log('🔧 Graduation year corrected to ' + S.p49.graduationYear + '.');
    } else if (!S.degree) {
      delete S.p49.graduationYear;
    }
    save();
  }
  /* Case 2: Degree exists but graduation year is missing */
  if (S.degree && (!S.p49 || !S.p49.graduationYear || S.p49.graduationYear < 0)) {
    S.p49 = S.p49 || {};
    S.p49.graduationYear = gameYear() - 1;
    save();
  }
}
setTimeout(p81FixGraduationYear, 400);
setTimeout(p81FixGraduationYear, 1500);
setTimeout(p81FixGraduationYear, 3000);

/* =================================================================
   81.18 — CAREER VISA GATING
   If you're abroad on a student visa, full-time jobs need
   sponsorship. Show a warning card at the top of the career view.
   ================================================================= */
const P81_viewCareerBeforeVisaWarn = viewCareer;
viewCareer = function () {
  let html = P81_viewCareerBeforeVisaWarn.apply(this, arguments);
  if (!S || S.age < 18) return html;
  if (S.country === S.home) return html;
  if (!S.p81 || !S.p81.visa) return html;

  const visa = S.p81.visa;
  const cc = COUNTRIES[S.country] || { n: 'abroad' };
  const warnCard = '<section class="card" style="border-color:var(--amber)"><h3>⚠️ Work rights in ' + cc.n + '</h3>' +
    '<div class="row"><span>Your visa</span><b>' + visa.name + '</b></div>' +
    '<div class="row"><span>Work allowed</span><b style="color:var(--cyan)">' + visa.workRights + '</b></div>' +
    (visa.expiresYear
      ? '<div class="row"><span>Expires</span><b>' + visa.expiresYear + '</b></div>'
      : '') +
    '<p class="muted" style="font-size:.78rem;margin-top:6px">Full-time jobs require employer visa sponsorship. Check the "Work visa sponsorship" line on each posting before applying.</p>' +
    '</section>';
  return warnCard + html;
};

/* =================================================================
   81.19 — SPONSORSHIP TEXT FIX
   "Visa sponsorship: Not needed at home" shows while abroad.
   Correct it to say sponsorship is required.
   ================================================================= */
const P81_renderBeforeSponsorFix = render;
render = function () {
  const r = P81_renderBeforeSponsorFix.apply(this, arguments);
  if (!S || S.country === S.home) return r;
  try {
    /* Scan all rows for "Visa sponsorship" and fix the text if it says "Not needed" */
    const rows = document.querySelectorAll('.row, div');
    rows.forEach(function (n) {
      const span = n.querySelector('span');
      const b = n.querySelector('b');
      if (span && b && span.textContent.trim() === 'Visa sponsorship') {
        if (b.textContent.indexOf('Not needed') !== -1) {
          b.textContent = 'Required — you are on a work-restricted visa';
          b.style.color = 'var(--amber)';
        }
      }
    });
  } catch (e) {}
  return r;
};

/* =================================================================
   81.20 — JOB ELIGIBILITY BY VISA
   Wrap any existing job eligibility check if we can find one.
   Otherwise this is a no-op.
   ================================================================= */
if (typeof jobEligibility === 'function') {
  const P81_jobEligBefore = jobEligibility;
  jobEligibility = function (post) {
    const base = P81_jobEligBefore.apply(this, arguments);
    if (base && base.allowed === false) return base;
    if (!S || S.country === S.home) return base;
    if (!S.p81 || !S.p81.visa) return base;
    const visa = S.p81.visa;
    if (visa.type === 'student' && post && (post.hours || 0) >= 35 && !post.sponsorship) {
      return { allowed: false, reason: 'You are on a student visa (' + visa.name + '). Full-time roles require employer sponsorship.' };
    }
    return base;
  };
}

/* =================================================================
   81.21 — INIT
   ================================================================= */
p81Init(S);
p81FixGraduationYear();
console.log('[p81 v3] Passport (home-based) + master button + visa gating + grad year cleanup')
/* =================================================================
   81.22 — DOM-LEVEL FIXER (bypasses the wrapper chain entirely)
   Runs after every render via setTimeout(0), so it sees the FINAL
   html that all wrappers produced, and corrects what's wrong.
   ================================================================= */

/* 1. Ensure S.home is never overwritten */
function p81EnsureHome() {
  if (!S) return;
  if (!S.home || typeof S.home !== 'string') S.home = 'egy';
}

/* 2. Run on every render — scheduled after all wrappers finish */
let p81DomPending = false;
function p81ScheduleDomFix() {
  if (p81DomPending) return;
  p81DomPending = true;
  setTimeout(function () {
    p81DomPending = false;
    p81ApplyDomFixes();
  }, 0);
}

function p81ApplyDomFixes() {
  if (!S) return;
  p81EnsureHome();
  const view = document.getElementById('view');
  if (!view) return;

  /* ---- A. Passport panel — rebuild with correct country ---- */
  const h3s = view.querySelectorAll('h3');
  h3s.forEach(function (h3) {
    const txt = (h3.textContent || '').trim();
    if (txt.indexOf('Your passport') === -1) return;
    const sec = h3.closest('section');
    if (!sec || sec.dataset.p81PassportFixed) return;
    sec.dataset.p81PassportFixed = '1';

    const d = p81PassportData();
    const abroad = S.country !== (S.home || 'egy');
    const abroadName = abroad && COUNTRIES[S.country] ? COUNTRIES[S.country].n : null;
    const pct = Math.round((d.access / 195) * 100);

    sec.innerHTML =
      '<h3>🛂 Your passport and your options</h3>' +
      '<div class="row"><span>Your passport</span><b>' + d.flag + ' ' + d.name + '</b></div>' +
      '<div class="row"><span>Visa-free access</span><b>~' + d.access + ' destinations (' + pct + '%)</b></div>' +
      (abroad
        ? '<div class="row"><span>Currently living in</span><b>' + abroadName + ' (on visa)</b></div>'
        : '') +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">Your passport is issued by ' + d.country.toUpperCase() + '. Living abroad does not change it — naturalization typically requires 5–8 years of permanent residence.</p>' +
      (d.naturalized
        ? '<p class="muted" style="font-size:.78rem;color:var(--mint)">✓ You have naturalized.</p>'
        : '') +
      '<p class="muted" style="font-size:.78rem">A visa application costs money, takes weeks, and is not refunded if refused.</p>';
  });

  /* ---- B. "Graduate now" button — disable if years not elapsed ---- */
  const buttons = view.querySelectorAll('button');
  buttons.forEach(function (btn) {
    const txt = (btn.textContent || '');
    if (txt.indexOf('Graduate now') === -1) return;
    const yearsIn = p81YearsInProgram();
    const total = (S.p74 && S.p74.enrollTotalMonths) ? S.p74.enrollTotalMonths / 12 : 3;
    if (yearsIn < total - 0.05) {
      btn.disabled = true;
      btn.style.opacity = '.5';
      btn.textContent = '🎓 Graduate now (needs ' + (total - yearsIn).toFixed(1) + ' more years)';
    }
  });

  /* ---- C. Visa sponsorship text ---- */
  if (S.country !== S.home) {
    const rows = view.querySelectorAll('.row');
    rows.forEach(function (row) {
      const span = row.querySelector('span');
      const b = row.querySelector('b');
      if (!span || !b) return;
      if ((span.textContent || '').trim() === 'Visa sponsorship') {
        if ((b.textContent || '').indexOf('Not needed') !== -1) {
          b.textContent = 'Required — you are on a work-restricted visa';
          b.style.color = 'var(--amber)';
        }
      }
    });
  }

  /* ---- D. Career — banner if you're working without authorization ---- */
  if (S.country !== S.home && S.p81 && S.p81.visa && S.job && activeTab === 'career') {
    const visa = S.p81.visa;
    const jobHours = (S.job.benefits && S.job.benefits.hours) || 40;
    const isStudentVisa = visa.type === 'student';
    const needsSponsorship = jobHours >= 35 && isStudentVisa;
    const alreadyBannered = view.querySelector('.p81-visa-banner');
    if (needsSponsorship && !alreadyBannered) {
      const banner = document.createElement('section');
      banner.className = 'card p81-visa-banner';
      banner.style.borderColor = 'var(--rose)';
      banner.innerHTML =
        '<h3 style="color:var(--rose)">🚨 Work authorization issue</h3>' +
        '<p class="muted" style="font-size:.82rem">You are employed full-time at ' + (S.job.company || 'a UK employer') + ' while on a <b>' + visa.name + '</b>, which only allows ' + visa.workRights + '.</p>' +
        '<p class="muted" style="font-size:.82rem">In reality you would be asked to leave the country or switch to a work visa. The game lets you keep the job, but you should apply for a <b>Skilled Worker visa</b> (requires employer sponsorship) or leave the role.</p>';
      view.insertBefore(banner, view.firstChild);
    }
  }
}

/* Hook the render → schedule DOM fix after all wrappers complete */
const P81_renderBeforeDomFix = render;
render = function () {
  const r = P81_renderBeforeDomFix.apply(this, arguments);
  p81ScheduleDomFix();
  return r;
};

/* Run on load too */
p81EnsureHome();
p81ScheduleDomFix();
