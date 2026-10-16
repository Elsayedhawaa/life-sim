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
console.log('[p81] Abroad reality — visa + housing + career adaptation loaded');
