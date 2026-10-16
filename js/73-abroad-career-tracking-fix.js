/* =====================================================================
   73. STUDY ABROAD TRACKING + CAREER COUNTRY AWARENESS
   Fixes:
   - Hide completed applications after enrollment
   - Show the field/major of the abroad degree
   - Career jobs filter by CURRENT country (no Vodafone VOIS in UK)
   - Salaries scale with local market (not fixed Egyptian rates)
   - Student visa part-time work options
   - Abroad player can return home or stay
   - Income vs status text uses live values consistently
   - Faculty jobs don't hide base career board
   Load AFTER 72-faculty-career-connection.js and BEFORE 99-boot.js
   ===================================================================== */

function p73Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* =================================================================
   1. STATE
   ================================================================= */
function p73Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p73) o.p73 = {};
  const d = o.p73;
  if (typeof d.abroadStartedYear !== 'number') d.abroadStartedYear = -1;
  if (typeof d.abroadField !== 'string') d.abroadField = null;
  if (typeof d.studentJob !== 'boolean') d.studentJob = false;
  if (typeof d.overstayWork !== 'boolean') d.overstayWork = false;
}
const P73_migrate = migrate;
migrate = function (o) { const r = P73_migrate(o); p73Init(r); return r; };
const P73_newGame = newGame;
newGame = function () { P73_newGame.apply(this, arguments); p73Init(S); };

/* =================================================================
   2. FIX ENROLLMENT — capture field, start year, and clean stale apps
   ================================================================= */
/* When p69TravelTo runs, capture the field */
const P73_p69TravelBefore = (typeof p69TravelTo === 'function') ? p69TravelTo : null;
if (P73_p69TravelBefore) {
  p69TravelTo = function (appId) {
    const app = S && S.p69 && S.p69.applications ? S.p69.applications.find(function (a) { return a && a.id === appId; }) : null;
    const fieldGuess = (app && app.field) || (app && app.major) || 'General';
    const r = P73_p69TravelBefore.apply(this, arguments);
    p73Init(S);
    S.p73.abroadStartedYear = gameYear();
    S.p73.abroadField = fieldGuess;
    /* Clean ALL completed applications for this enrollment */
    if (S.p69 && Array.isArray(S.p69.applications)) {
      S.p69.applications = S.p69.applications.filter(function (a) {
        if (!a) return false;
        if (a.id === appId) return false;   /* remove the just-completed one */
        return a.stage !== 'completed';
      });
    }
    if (S.p69 && S.p69.enrolled && !S.p69.enrolled.field) {
      S.p69.enrolled.field = fieldGuess;
    }
    save();
    return r;
  };
}

/* Clean stale completed apps on load */
function p73CleanApplications() {
  if (!S || !S.p69 || !Array.isArray(S.p69.applications)) return;
  const before = S.p69.applications.length;
  S.p69.applications = S.p69.applications.filter(function (a) {
    if (!a) return false;
    if (a.stage === 'completed') return false;
    /* Also remove duplicates: if same uni + same level + same country, keep newest */
    return true;
  });
  /* Deduplicate by uni+level+country */
  const seen = {};
  const deduped = [];
  S.p69.applications.forEach(function (a) {
    const key = a.country + '|' + a.uni + '|' + a.level;
    if (seen[key]) {
      /* Keep the newest (highest appliedMonth) */
      const existing = seen[key];
      if (a.appliedMonth > existing.appliedMonth) {
        const idx = deduped.indexOf(existing);
        if (idx >= 0) deduped.splice(idx, 1, a);
        seen[key] = a;
      }
    } else {
      seen[key] = a;
      deduped.push(a);
    }
  });
  S.p69.applications = deduped;
  if (S.p69.applications.length !== before) save();
}
setTimeout(p73CleanApplications, 500);

/* =================================================================
   3. SHOW FIELD ON ENROLLMENT CARD
   ================================================================= */
/* Override the education view to show field */
const P73_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P73_viewSchoolBefore.apply(this, arguments);
  if (!S) return html;

  /* Replace "Currently studying abroad" card with an improved version */
  const enrolled = S.p69 && S.p69.enrolled;
  if (enrolled) {
    p73Init(S);
    /* Try to find the field name */
    let field = enrolled.field || S.p73.abroadField;
    if (!field && S.mast && S.mast.field) field = S.mast.field;
    if (!field) field = 'General (undeclared)';
    const startYear = S.p73.abroadStartedYear > 0 ? S.p73.abroadStartedYear : enrolled.startYear || gameYear();
    const yearsIn = gameYear() - startYear;
    const duration = enrolled.level === 'bachelor' ? 3 : 2;
    const yearsLeft = Math.max(0, duration - yearsIn);

    const card = '<section class="card" style="border-color:var(--mint)"><h3>🎓 Currently studying abroad</h3>' +
      '<div class="row"><span>University</span><b>' + enrolled.uni + '</b></div>' +
      '<div class="row"><span>Country</span><b>' + (COUNTRIES[enrolled.country] ? COUNTRIES[enrolled.country].n : enrolled.country) + '</b></div>' +
      '<div class="row"><span>Level</span><b>' + (enrolled.level === 'bachelor' ? 'Bachelor\'s' : 'Master\'s') + '</b></div>' +
      '<div class="row"><span>Field</span><b>' + field + '</b></div>' +
      '<div class="row"><span>Started</span><b>' + startYear + '</b></div>' +
      '<div class="row"><span>Years completed</span><b>' + yearsIn + ' of ' + duration + ' (' + yearsLeft + ' left)</b></div>' +
      (enrolled.funding ? '<div class="row"><span>Funding</span><b>' + (enrolled.funding.name || enrolled.funding.type) + ' · ' + Math.round((enrolled.funding.cover || 0) * 100) + '%</b></div>' : '') +
      (yearsLeft > 0
        ? '<p class="muted" style="font-size:.78rem;margin-top:8px">Study continues. Each month your enrollment advances. Graduation in ' + yearsLeft + ' year(s).</p>'
        : '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p73GraduateAbroad()">🎓 Graduate now</button>') +
      '<button class="btn" style="margin-top:6px" onclick="p73ReturnHome()">Return home to Egypt</button>' +
      '</section>';

    /* Replace old "Currently studying abroad" card */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🎓 Currently studying abroad<\/h3>[\s\S]*?<\/section>/,
      card
    );

    /* Also remove "Study applications in progress" cards for the SAME university */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>📤 Study applications in progress<\/h3>[\s\S]*?<\/section>/,
      function (section) {
        /* Keep only applications that are NOT the currently-enrolled uni */
        let filtered = section;
        if (enrolled) {
          /* If the enrolled uni appears in this section, strip that specific block */
          const blocks = section.split('<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">');
          const keep = blocks.filter(function (b, i) {
            if (i === 0) return true;
            return b.indexOf(enrolled.uni) === -1;
          });
          if (keep.length <= 1) return '';
          filtered = keep.join('<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">');
        }
        return filtered;
      }
    );
  }
  return html;
};

/* Advance enrollment each year */
function p73AdvanceAbroad() {
  if (!S || !S.p69 || !S.p69.enrolled) return;
  p73Init(S);
  const enrolled = S.p69.enrolled;
  const startYear = S.p73.abroadStartedYear > 0 ? S.p73.abroadStartedYear : enrolled.startYear || gameYear();
  const yearsIn = gameYear() - startYear;
  const duration = enrolled.level === 'bachelor' ? 3 : 2;
  if (yearsIn >= duration) {
    /* Ready to graduate */
    log('🎓 You have completed your ' + enrolled.level + '\'s at ' + enrolled.uni + '. Click "Graduate now" in the Education tab.');
    realismNotice('Ready to graduate', 'You have finished the coursework at ' + enrolled.uni + '. Claim your degree.');
  }
}
window.p73AdvanceAbroad = p73AdvanceAbroad;

function p73GraduateAbroad() {
  if (!S || !S.p69 || !S.p69.enrolled) return;
  p73Init(S);
  const enrolled = S.p69.enrolled;
  const field = S.p73.abroadField || enrolled.field || 'General';
  const level = enrolled.level;

  if (level === 'bachelor') {
    S.degree = p73GuessDegreeFromField(field);
    S.p72 = S.p72 || {};
    S.p72.degreeExtra = field;
    log('🎓 Graduated from ' + enrolled.uni + ' with a Bachelor\'s in ' + field + '.');
    realismNotice('Bachelor\'s complete', 'You earned a ' + field + ' bachelor\'s from ' + enrolled.uni + '.');
  } else {
    S.mastDone = true;
    S.masterField = field;
    log('🎓 Completed your Master\'s in ' + field + ' at ' + enrolled.uni + '.');
    realismNotice('Master\'s complete', 'You earned an MSc/MBA in ' + field + ' from ' + enrolled.uni + '.');
  }
  S.p69.enrolled = null;
  S.p73.abroadStartedYear = -1;
  save(); render();
}
window.p73GraduateAbroad = p73GraduateAbroad;

function p73GuessDegreeFromField(field) {
  const f = String(field).toLowerCase();
  if (f.indexOf('medicine') >= 0 || f.indexOf('health') >= 0 || f.indexOf('nursing') >= 0) return 'medicine';
  if (f.indexOf('law') >= 0 || f.indexOf('legal') >= 0) return 'law';
  if (f.indexOf('computer') >= 0 || f.indexOf('engineer') >= 0 || f.indexOf('data') >= 0 || f.indexOf('it') >= 0) return 'cs';
  if (f.indexOf('bio') >= 0 || f.indexOf('pharm') >= 0 || f.indexOf('science') >= 0 || f.indexOf('chem') >= 0) return 'biology';
  return 'business';
}

function p73ReturnHome() {
  if (!S || !S.p69 || !S.p69.enrolled) return;
  if (!confirm('Return to Egypt? Your overseas student visa will end. You can keep the credits you completed.')) return;
  p73Init(S);
  S.country = S.home || 'egy';
  S.cf = null;
  if (typeof setWorld === 'function') setWorld(S);
  const hadField = S.p73.abroadField;
  if (S.p69 && S.p69.enrolled) S.p69.enrolled = null;
  log('✈️ Returned to Egypt. ' + (hadField ? 'Your ' + hadField + ' credits are partially transferable.' : ''));
  realismNotice('Returned home', 'You came back to Egypt. Study abroad credits may or may not transfer to Egyptian universities.');
  save(); render();
}
window.p73ReturnHome = p73ReturnHome;

/* =================================================================
   4. CAREER BOARD — COUNTRY AWARE
   ================================================================= */
/* Replace Egyptian-only companies when player is abroad */
const P73_P12_EGY_BRANDS_CACHE = (typeof P12_EGY_BRANDS !== 'undefined') ? P12_EGY_BRANDS.slice() : [];

const P73_companyListBefore = companyListFor;
companyListFor = function (country) {
  country = country || (S && S.country) || 'egy';
  let list = P73_companyListBefore(country) || [];

  /* If the player is abroad, strip Egyptian-only companies */
  if (S && country !== S.home) {
    list = list.filter(function (p) {
      if (!p) return false;
      const name = String(p.name || '');
      /* Remove Egyptian-specific brands */
      if (P73_P12_EGY_BRANDS_CACHE.indexOf(name) !== -1) return false;
      if (/^(Vodafone Egypt|Fawry|Nile|Cairo|Alexandria|Sphinx|Delta Audit|Raya CX|Xceed|Teleperformance Egypt|Concentrix Egypt|Nile Data|Pyramid Digital|Mansour|Cleopatra|Eva Pharma|Crescent|NileBridge|NileCare|Canal|Eastline|Blue Harbor|Pioneer Retail Egypt|Mediterranean)/.test(name)) return false;
      /* Also remove faculty jobs targeted at Egypt */
      if (p.forFaculty && country !== 'egy') return false;
      return true;
    });

    /* If list is empty, generate UK/local companies */
    if (list.length < 5) {
      const localBrands = {
        gbr: [
          ['Northbridge Services', 'Customer Support Specialist', 'entry'],
          ['Kingsway Operations', 'Operations Assistant', 'entry'],
          ['Thames Financial Services', 'Junior Financial Analyst', 'finance'],
          ['Camden Tech Ltd', 'IT Support Technician', 'tech'],
          ['Westminster Legal Group', 'Legal Assistant', 'law'],
          ['Brighton Medical Centre', 'Clinical Assistant', 'medical'],
          ['Manchester Retail Group', 'Retail Associate', 'entry'],
          ['Leeds Data Solutions', 'Junior Data Analyst', 'tech']
        ],
        usa: [
          ['Northstar Services Inc', 'Customer Support Specialist', 'entry'],
          ['Redwood Financial Group', 'Junior Analyst', 'finance'],
          ['BluePeak Technologies', 'Software Developer', 'tech'],
          ['Summit Legal Group', 'Legal Assistant', 'law'],
          ['Community Health Network', 'Medical Assistant', 'medical']
        ],
        can: [
          ['Maple Business Services', 'Customer Support', 'entry'],
          ['Northern Financial', 'Junior Analyst', 'finance'],
          ['Clearpath Tech Inc', 'Developer', 'tech'],
          ['Aurora Legal Group', 'Legal Assistant', 'law']
        ],
        deu: [
          ['Rhein Service GmbH', 'Kundendienst', 'entry'],
          ['Alpen Finance AG', 'Finanzanalyst', 'finance'],
          ['Klar Tech GmbH', 'Softwareentwickler', 'tech'],
          ['Berlin Legal Partners', 'Rechtsanwalt Assistenz', 'law']
        ]
      };
      const brands = localBrands[country] || localBrands.gbr;
      const year = gameYear();
      brands.forEach(function (b, i) {
        const track = b[2] === 'tech' ? 'tech' : b[2] === 'finance' ? 'finance' : b[2] === 'law' ? 'law' : b[2] === 'medical' ? 'medical' : 'entry';
        const baseSalaries = {
          entry: 20000, tech: 32000, finance: 28000, law: 34000, medical: 45000
        };
        const baseSalary = baseSalaries[track] || 22000;
        list.push({
          id: 'p73_local_' + country + '_' + i + '_' + year,
          trackId: track,
          group: track,
          roleTitle: b[1],
          titles: [b[1], 'Senior ' + b[1], 'Lead ' + b[1], 'Manager', 'Director'],
          name: b[0],
          factor: 1,
          degree: null,
          smarts: 40,
          eng: 60,
          minExp: 0,
          medical: track === 'medical',
          social: true,
          bonus: 0.03,
          leave: 21,
          remote: 'On-site',
          hours: 40,
          stress: 4,
          contract: 'Permanent',
          sponsorship: country === S.home ? false : (Math.random() < 0.35),
          isP73LocalJob: true,
          baseSalaryLocal: baseSalary
        });
      });
    }
  }

  return list;
};

/* Override jobSalaryForPost to use LOCAL base salaries */
const P73_jobSalaryBefore = jobSalaryForPost;
jobSalaryForPost = function (post, level, country, year) {
  country = country || (S && S.country) || 'egy';
  year = year || gameYear();
  if (post && post.baseSalaryLocal) {
    /* Salary is in LOCAL currency (e.g., GBP/USD/etc.). Convert to internal units. */
    const rate = (typeof rateForCountry === 'function') ? rateForCountry(country, year) : 1;
    const lvl = Math.max(0, Math.min(4, Number(level) || 0));
    const salaryLocal = post.baseSalaryLocal * Math.pow(1.35, lvl);
    return salaryLocal / Math.max(0.0001, rate);
  }
  return P73_jobSalaryBefore.apply(this, arguments);
};

/* =================================================================
   5. STUDENT VISA PART-TIME WORK
   ================================================================= */
const P73_viewPartBefore = viewPart;
viewPart = function () {
  let html = P73_viewPartBefore.apply(this, arguments);
  if (!S) return html;

  /* If student abroad, show additional student work options */
  const abroadStudent = S.country !== S.home && S.p69 && S.p69.enrolled;
  if (abroadStudent) {
    const c = COUNTRIES[S.country] || {};
    const countryName = c.n || S.country;
    const isUK = S.country === 'gbr';
    const isUSA = S.country === 'usa';
    const isEU = ['deu', 'fra', 'nld', 'ita'].indexOf(S.country) !== -1;

    let studentCard = '<section class="card" style="border-color:var(--mint)"><h3>🎓 Student visa work rights — ' + countryName + '</h3>';

    if (isUK) {
      studentCard += '<p class="muted" style="font-size:.82rem">On a Tier 4 (Student) visa in the UK, you can work up to 20 hours per week during term time and full-time during holidays.</p>';
    } else if (isUSA) {
      studentCard += '<p class="muted" style="font-size:.82rem">On an F-1 visa in the US, you can work up to 20 hours per week on campus. Off-campus work requires CPT or OPT.</p>';
    } else if (isEU) {
      studentCard += '<p class="muted" style="font-size:.82rem">EU student visas typically allow up to 20 hours per week during term time and full-time during holidays.</p>';
    } else {
      studentCard += '<p class="muted" style="font-size:.82rem">Student visas in ' + countryName + ' typically allow limited part-time work during term time.</p>';
    }

    /* Student job options */
    const jobs = [
      { id: 'campus',  name: 'On-campus job (library, dining, admin)', hours: 20, hourlyLocal: isUK ? 11 : isUSA ? 15 : 12 },
      { id: 'offcampus', name: 'Off-campus part-time (retail, café)',   hours: 20, hourlyLocal: isUK ? 10 : isUSA ? 14 : 11 },
      { id: 'tutoring', name: 'Tutoring / freelance (permitted work)',  hours: 10, hourlyLocal: isUK ? 18 : isUSA ? 25 : 20 }
    ];

    jobs.forEach(function (j) {
      const weeklyLocal = j.hourlyLocal * j.hours;
      const yearlyLocal = weeklyLocal * 44;   /* 44 weeks of term work */
      const annualEGP = Math.round(yearlyLocal * 52.7 * p73Idx());
      studentCard += '<button class="btn" style="margin-top:8px" onclick="p73TakeStudentJob(\'' + j.id + '\')">' +
        j.name +
        '<small>Up to ' + j.hours + ' h/week · ≈ E£' + annualEGP.toLocaleString() + '/year</small>' +
        '</button>';
    });

    /* Overstay risk */
    studentCard += '<div style="margin-top:14px;padding:10px;background:rgba(251,113,133,.08);border-left:3px solid var(--rose);border-radius:6px">' +
      '<b style="font-size:.8rem;color:var(--rose)">Working more than the allowed hours</b>' +
      '<p class="muted" style="font-size:.78rem;margin-top:4px">Working beyond your visa limit risks deportation, a 10-year UK ban, or permanent US visa refusal. The game does not recommend it.</p>' +
      '<button class="btn" style="border-color:var(--rose);color:var(--rose);font-size:.78rem;padding:6px" onclick="p73RiskOverstay()">Work illegally (risky)</button>' +
      '</div>';

    studentCard += '</section>';
    html = studentCard + html;
  }

  return html;
};

function p73TakeStudentJob(id) {
  if (!S || S.country === S.home) return hint('This is only for students abroad.');
  const jobs = {
    campus:    { name: 'Campus job',          hourly: S.country === 'gbr' ? 11 : 15, hours: 20 },
    offcampus: { name: 'Off-campus part-time', hourly: S.country === 'gbr' ? 10 : 14, hours: 20 },
    tutoring:  { name: 'Tutoring',            hourly: S.country === 'gbr' ? 18 : 25, hours: 10 }
  };
  const j = jobs[id];
  if (!j) return hint('Unknown job.');
  S.p73.studentJob = true;
  S.p73.studentJobType = id;
  const weekly = j.hourly * j.hours;
  const yearlyLocal = weekly * 44;
  const annualEGP = Math.round(yearlyLocal * 52.7 * p73Idx());
  fx({ happiness: 2, health: -1 });
  log('💼 Started ' + j.name + ' as a student. Estimated yearly income: E£' + annualEGP.toLocaleString() + ' (up to ' + j.hours + ' h/week).');
  realismNotice('Student job started', j.name + ' during term time. ' + j.hours + ' hours/week max.');
  hint(); render();
}
window.p73TakeStudentJob = p73TakeStudentJob;

function p73RiskOverstay() {
  if (!S) return;
  if (!confirm('Work more hours than your visa allows? This can be discovered and lead to deportation, a ban, or future visa refusal.\n\nProceed?')) return;
  S.p73.overstayWork = true;
  /* Each year there's a 25% chance of discovery */
  if (Math.random() < 0.25) {
    log('🚨 Immigration authorities discovered you working beyond your visa limits. You are being deported.');
    realismNotice('Deportation', 'You were caught working outside your visa terms. You have been removed from the country and will face years-long visa bans.');
    /* Force return */
    S.country = S.home || 'egy';
    S.cf = null;
    if (typeof setWorld === 'function') setWorld(S);
    S.imm = null;
    S.p69.enrolled = null;
    S.p69.applications = [];
    S.futureVisaPenalty = (S.futureVisaPenalty || 0) + 10;
    S.wealth = Math.max(0, S.wealth * 0.5);
    fx({ happiness: -25 });
  } else {
    log('⚠️ You worked extra hours without detection this month. Risky.');
    S.wealth += 800 / p73Rate();
  }
  render();
}
window.p73RiskOverstay = p73RiskOverstay;

/* Apply student job income each month */
const P73_p52TickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  P73_p52TickBefore.apply(this, arguments);
  if (!S) return;
  if (S.p73 && S.p73.studentJob && S.p73.studentJobType && S.country !== S.home) {
    const jobs = {
      campus:    { hourly: S.country === 'gbr' ? 11 : 15, hours: 20 },
      offcampus: { hourly: S.country === 'gbr' ? 10 : 14, hours: 20 },
      tutoring:  { hourly: S.country === 'gbr' ? 18 : 25, hours: 10 }
    };
    const j = jobs[S.p73.studentJobType];
    if (j) {
      const weekly = j.hourly * j.hours;
      const monthlyLocal = weekly * 4.33;
      const monthlyInternal = monthlyLocal / p73Rate();
      S.wealth += monthlyInternal;
      S.income = (S.income || 0) + monthlyInternal;
    }
  }
  /* If overstay work flagged, monthly risk of discovery */
  if (S.p73 && S.p73.overstayWork && S.country !== S.home) {
    if (Math.random() < 0.06) {
      log('🚨 Caught working illegally — deportation.');
      realismNotice('Deportation', 'Your overstay work was discovered. You are being removed from the country.');
      S.country = S.home || 'egy';
      S.cf = null;
      if (typeof setWorld === 'function') setWorld(S);
      S.imm = null;
      S.p69.enrolled = null;
      S.p69.applications = [];
      S.futureVisaPenalty = (S.futureVisaPenalty || 0) + 10;
      S.p73.overstayWork = false;
      fx({ happiness: -25 });
    } else {
      S.wealth += 400 / p73Rate();
    }
  }
};

/* =================================================================
   6. FIX INCOME vs STATUS TEXT
   ================================================================= */
const P73_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P73_viewCareerBefore.apply(this, arguments);
  if (!S) return html;

  const rate = p73Rate();
  const income = (typeof p54LiveIncome === 'function') ? p54LiveIncome() : (S.income || 0);
  const expenses = (typeof p54LiveExpenses === 'function') ? p54LiveExpenses() : (S.expenses || 0);
  const incomeEGP = Math.round(income * rate);
  const expensesEGP = Math.round(expenses * rate);

  /* If income is very low (< 10k EGP/year), force "Not enough" status */
  if (incomeEGP < 10000 && expensesEGP > 0) {
    html = html.replace(
      /<b style="color:var\(--mint\)">Comfortable — you are saving money<\/b>/,
      '<b style="color:var(--rose)">Not enough — income is too low to sustain you</b>'
    );
    html = html.replace(
      /<b style="color:var\(--amber\)">Just enough — no big cushion<\/b>/,
      '<b style="color:var(--rose)">Not enough — income is too low</b>'
    );
  }
  return html;
};

/* =================================================================
   7. ABROAD INCOME SCALES — jobs get local market salary
   ================================================================= */
/* When the player gets hired for an Egyptian BPO job but is now abroad,
   recalculate their salary to the local market rate. */
function p73FixAbroadSalary() {
  if (!S || !S.job) return;
  if (S.country === S.home) return;
  /* If the job was for a foreign country, use local market salary */
  const c = COUNTRIES[S.country] || {};
  const isLocalMarket = S.job.company && (
    /Vodafone VOIS|Teleperformance|Concentrix|Raya|Xceed|Sutherland Egypt|Foundever Egypt|Alorica Egypt/.test(S.job.company) ||
    /Nile|Cairo|Alexandria|Sphinx|Delta Audit|Pyramid|Rize/.test(S.job.company)
  );
  if (isLocalMarket && S.country !== 'egy') {
    /* The job was an Egyptian job, player shouldn't have it abroad */
    /* Just scale salary to local market: BPO in UK earns 22,000 GBP/year */
    const localBpoSalary = S.country === 'gbr' ? 22000 : S.country === 'usa' ? 35000 : 25000;
    const rate = p73Rate();
    S.job.salary = localBpoSalary / rate;
    log('💼 Your BPO job salary was adjusted for the ' + (c.n || S.country) + ' market.');
  }
}
setTimeout(p73FixAbroadSalary, 1000);

/* =================================================================
   8. INIT
   ================================================================= */
p73Init(S);
console.log('[p73] Study abroad + career country fix loaded');
