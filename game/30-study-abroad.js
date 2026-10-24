/* ============================================================
   STUDY ABROAD — full lifecycle system (v2)
   ============================================================
- Major selection & real degree at graduation
- Currency conversion when arriving abroad
- Post-grad job search window per country
- Illegal stay with deportation risk
- Master's continuation with scholarship
- Marriage-for-visa regularization
- NEW: Part-time student jobs strictly bounded by visa hours
- NEW: Summer internships to boost post-grad hire chances
- NEW: Academic probation and visa cancellation for low GPA
- NEW: Culture shock and language requirements
   ============================================================ */

function ensureStudyAbroadState() {
  if (!S) return;
  if (typeof S.studyAbroad === 'undefined') S.studyAbroad = null;
  if (typeof S.studyAbroadApps === 'undefined') S.studyAbroadApps = [];
  if (typeof S.studyAbroadHistory === 'undefined') S.studyAbroadHistory = [];
  if (!S.homeCountry) S.homeCountry = S.country;
}
GameHooks.on('newGame', ensureStudyAbroadState);
GameHooks.on('migrate', ensureStudyAbroadState);

/* ---------- COUNTRY RULES ---------- */
const STUDY_ABROAD_RULES = {
  gbr: { studyHoursPerWeek: 20, hoursNote: '20 hours/week during term, full-time during official holidays', postGradMonths: 24, postGradVisaName: 'Graduate Route', jobMarketStrength: 0.65, regularizeMarriage: true, language: 'English' },
  usa: { studyHoursPerWeek: 20, hoursNote: '20 hours/week on-campus only. Off-campus requires special approval.', postGradMonths: 3, postGradVisaName: 'OPT (Optional Practical Training)', stemExtension: 24, jobMarketStrength: 0.55, regularizeMarriage: true, language: 'English' },
  can: { studyHoursPerWeek: 20, hoursNote: '20 hours/week during term (unlimited during scheduled breaks)', postGradMonths: 36, postGradVisaName: 'PGWP (Post-Graduation Work Permit)', jobMarketStrength: 0.65, regularizeMarriage: true, language: 'English' },
  aus: { studyHoursPerWeek: 48, hoursNote: '48 hours per fortnight (24h/week average) during term', postGradMonths: 24, postGradVisaName: 'Temporary Graduate Visa (485)', jobMarketStrength: 0.60, regularizeMarriage: true, language: 'English' },
  deu: { studyHoursPerWeek: 20, hoursNote: '120 full days or 240 half days per year (~20h/week)', postGradMonths: 18, postGradVisaName: 'Job Seeker Visa', jobMarketStrength: 0.75, requiresLanguage: 'German', regularizeMarriage: true, language: 'German' },
  nld: { studyHoursPerWeek: 16, hoursNote: '16 hours/week during term, or full-time in June-August', postGradMonths: 12, postGradVisaName: 'Orientation Year (Zoekjaar)', jobMarketStrength: 0.70, regularizeMarriage: true, language: 'Dutch' },
  fra: { studyHoursPerWeek: 20, hoursNote: '964 hours/year (~20h/week)', postGradMonths: 12, postGradVisaName: 'APS (Autorisation Provisoire de Séjour)', jobMarketStrength: 0.65, requiresMaster: true, regularizeMarriage: true, language: 'French' },
  jpn: { studyHoursPerWeek: 28, hoursNote: '28 hours/week during term, 40 hours during vacation', postGradMonths: 12, postGradVisaName: 'Designated Activities', jobMarketStrength: 0.50, requiresLanguage: 'Japanese', regularizeMarriage: true, language: 'Japanese' },
  ita: { studyHoursPerWeek: 20, hoursNote: '20 hours/week during term', postGradMonths: 12, postGradVisaName: 'Attesa Occupazione', jobMarketStrength: 0.55, regularizeMarriage: true, language: 'Italian' },
  sgp: { studyHoursPerWeek: 16, hoursNote: '16 hours/week during term', postGradMonths: 12, postGradVisaName: 'Long-Term Visit Pass', jobMarketStrength: 0.70, regularizeMarriage: true, language: 'English' }
};
window.STUDY_ABROAD_RULES = STUDY_ABROAD_RULES;

const STUDY_ABROAD_MAJORS = ['cs', 'engineering', 'business', 'medicine', 'law', 'economics', 'finance', 'architecture', 'psychology', 'nursing'];

/* ---------- CURRENCY CONVERSION ---------- */
function _convertWealthToCountry(oldCountry, newCountry) {
  if (!S) return;
  const oldData = (typeof COUNTRIES !== 'undefined') ? COUNTRIES[oldCountry] : null;
  const newData = (typeof COUNTRIES !== 'undefined') ? COUNTRIES[newCountry] : null;
  if (!oldData || !newData) return;
  const oldRate = oldData.rate || 1;
  const newRate = newData.rate || 1;
  if (oldRate === newRate) return;

  if (typeof S.wealth === 'number') S.wealth = Math.round(S.wealth / oldRate * newRate);
  if (S.job && typeof S.job.salary === 'number') S.job.salary = Math.round(S.job.salary / oldRate * newRate);
  if (S.career && S.career.job && typeof S.career.job.salary === 'number') S.career.job.salary = Math.round(S.career.job.salary / oldRate * newRate);

  if (S.bank && Array.isArray(S.bank.accounts)) S.bank.accounts.forEach(function(a) { if (typeof a.balance === 'number') a.balance = Math.round(a.balance / oldRate * newRate); });
  if (S.bank && Array.isArray(S.bank.loans)) S.bank.loans.forEach(function(l) {
    if (typeof l.remaining === 'number') l.remaining = Math.round(l.remaining / oldRate * newRate);
    if (typeof l.principal === 'number') l.principal = Math.round(l.principal / oldRate * newRate);
    if (typeof l.monthlyPayment === 'number') l.monthlyPayment = Math.round(l.monthlyPayment / oldRate * newRate);
  });
  if (S.bank && Array.isArray(S.bank.creditCards)) S.bank.creditCards.forEach(function(c) {
    if (typeof c.balance === 'number') c.balance = Math.round(c.balance / oldRate * newRate);
    if (typeof c.limit === 'number') c.limit = Math.round(c.limit / oldRate * newRate);
  });

  if (S.rentedHome && typeof S.rentedHome.yearlyRent === 'number') S.rentedHome.yearlyRent = Math.round(S.rentedHome.yearlyRent / oldRate * newRate);
}

/* ---------- ARRIVE ABROAD ---------- */
window.studyAbroadArrive = function(app, uni) {
  if (!S) return;
  const dest = app.country;
  const oldCountry = S.country;
  if (!S.homeCountry) S.homeCountry = oldCountry;

  if (S.job || (S.career && S.career.job)) {
    if (!confirm('You have a job.\n\nStudying abroad means quitting it.\n\nProceed?')) {
      log('❌ Declined admission to keep your job.');
      return;
    }
    if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('study abroad');
    else { S.job = null; if (S.career) S.career.job = null; }
    log('👋 You left your job to study abroad.');
  }

  if (S.housing === 'rented' && S.rentedHome) {
    log('🏠 You ended your rental lease to move abroad.');
    S.housing = 'parents';
    S.rentedHome = null;
  }

  _convertWealthToCountry(oldCountry, dest);
  S.country = dest;

  const majorId = app.major || 'cs';
  const major = (typeof EDU_MAJORS !== 'undefined') ? EDU_MAJORS.find(function(m) { return m.id === majorId; }) : null;
  const yearsTotal = major ? (major.years || 4) : 4;
  const degree = major ? (major.degree || majorId) : majorId;

  S.uni = {
    id: uni.id,
    name: uni.name,
    type: 'study_abroad',
    city: (uni.country || '').toUpperCase(),
    quality: uni.quality,
    tuition: Math.round(uni.tuitionUSD * 52.7), /* base EGP */
    year: 0,
    yearsTotal: yearsTotal,
    major: majorId,
    degree: degree,
    faculty: majorId,
    gpa: 3.0,
    semestersCompleted: 0,
    credits: 0,
    startedYear: gameYear(),
    paymentMode: app.mode || 'self',
    isStudyAbroad: true
  };

  const rules = STUDY_ABROAD_RULES[dest] || { studyHoursPerWeek: 20, postGradMonths: 12 };

  S.studyAbroad = {
    status: 'studying',
    country: dest,
    university: uni.name,
    uniId: uni.id,
    major: majorId,
    majorLabel: major ? major.label : majorId,
    degreeLevel: 'bachelor',
    tuitionUSD: uni.tuitionUSD,
    mode: app.mode || 'self',
    startYear: gameYear(),
    graduationYear: gameYear() + yearsTotal,
    workRights: {
      maxHoursPerWeek: rules.studyHoursPerWeek,
      note: rules.hoursNote || ''
    },
    language: rules.language || 'English',
    languageLevel: 'beginner',
    internshipsCompleted: 0,
    partTimeJob: null,
    academicProbation: false,
    jobSearchDeadlineAbsMonth: null,
    jobApplications: [],
    illegalSinceAbsMonth: null,
    masterOffer: null
  };

  S.studyAbroadHistory.push({
    year: gameYear(),
    event: 'Arrived in ' + (COUNTRIES[dest] ? COUNTRIES[dest].name : dest) + ' for ' + uni.name
  });

  log('✈️ Arrived in ' + (COUNTRIES[dest] ? COUNTRIES[dest].name : dest) + ' to study ' + (major ? major.label : majorId) + ' at ' + uni.name + '.');
  log('💼 You can work up to ' + rules.studyHoursPerWeek + ' hours/week while studying.');
  emitSignal('studyAbroadStarted', { country: dest, uni: uni.name, major: majorId });
};

/* ---------- STUDENT LIFE ACTIONS ---------- */
window.studyAbroadGetPartTimeJob = function() {
  if (!S || !S.studyAbroad || S.studyAbroad.status !== 'studying') return;
  const sa = S.studyAbroad;
  if (sa.partTimeJob) { log('❌ You already have a part-time job.'); return; }
  
  const jobs = ['Barista', 'Library Assistant', 'Tutor', 'Research Assistant', 'Retail Cashier'];
  const title = jobs[Math.floor(Math.random() * jobs.length)];
  
  // Calculate localized minimum wage roughly
  const baseHourlyUSD = 12;
  const rate = COUNTRIES[sa.country] ? COUNTRIES[sa.country].rate : 1;
  const hourlyLocal = Math.round(baseHourlyUSD * rate);
  
  const hours = sa.workRights.maxHoursPerWeek;
  const annualSalary = hourlyLocal * hours * 40; // 40 weeks of work per year
  
  sa.partTimeJob = { title: title, annualSalary: annualSalary, hours: hours };
  S.job = { company: sa.university, title: title + ' (Student)', salary: annualSalary, level: 0, years: 0 };
  
  log('☕ Hired as a ' + title + '! Working ' + hours + ' hrs/week for ' + money(annualSalary) + '/yr.');
  fx({ happiness: 5, health: -5 }); // Stressful to balance work and study
  render();
};

window.studyAbroadDoInternship = function() {
  if (!S || !S.studyAbroad || S.studyAbroad.status !== 'studying') return;
  const sa = S.studyAbroad;
  if (S.uni && S.uni.year < 2) { log('❌ You must complete your first year before getting an internship.'); return; }
  
  const gpa = S.uni ? S.uni.gpa : 3.0;
  let chance = 0.4 + (gpa - 2.5) * 0.3; // Higher GPA = better chance
  
  if (Math.random() < chance) {
    sa.internshipsCompleted = (sa.internshipsCompleted || 0) + 1;
    log('🤝 You completed a prestigious summer internship in ' + (COUNTRIES[sa.country] ? COUNTRIES[sa.country].name : sa.country) + '!');
    fx({ smarts: 10, happiness: 10 });
  } else {
    log('❌ You applied for internships but didn\'t get selected this summer.');
    fx({ happiness: -3 });
  }
  render();
};

window.studyAbroadStudyLanguage = function() {
  if (!S || !S.studyAbroad) return;
  const sa = S.studyAbroad;
  if (sa.languageLevel === 'fluent') { log('✅ You are already fluent in ' + sa.language + '.'); return; }
  
  const cost = vacUSD ? vacUSD(500) : 500; // Localized cost
  if (S.wealth < cost) { log('❌ Not enough money for language classes (' + money(cost) + ').'); return; }
  
  S.wealth -= cost;
  if (sa.languageLevel === 'beginner') sa.languageLevel = 'intermediate';
  else if (sa.languageLevel === 'intermediate') sa.languageLevel = 'fluent';
  
  log('🗣️ Took intensive ' + sa.language + ' classes. Proficiency is now: ' + sa.languageLevel.toUpperCase() + '.');
  fx({ smarts: 5, happiness: 3 });
  render();
};

/* ---------- GRADUATE ---------- */
function _studyAbroadGraduate() {
  if (!S || !S.studyAbroad || S.studyAbroad.status !== 'studying') return;
  const sa = S.studyAbroad;
  const rules = STUDY_ABROAD_RULES[sa.country] || { postGradMonths: 12, postGradVisaName: 'Post-study work' };

  if (sa.partTimeJob) {
    S.job = null; // Clear student job
    sa.partTimeJob = null;
  }

  const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
  sa.jobSearchDeadlineAbsMonth = currentAbs + rules.postGradMonths;
  sa.status = 'job_search';
  sa.jobSearchMonthsLeft = rules.postGradMonths;
  sa.postGradVisaName = rules.postGradVisaName;

  const gpa = S.graduation ? S.graduation.gpa : (S.uni ? S.uni.gpa : 0);
  if (gpa >= 3.3) {
    sa.masterOffer = {
      available: true,
      funded: gpa >= 3.7,
      requiresGpa: 3.3,
      expiresAbsMonth: currentAbs + 12
    };
  }

  log('🎓 Graduated from ' + sa.university + ' in ' + sa.majorLabel + ' (GPA ' + gpa.toFixed(2) + ')!');
  log('📅 You have ' + rules.postGradMonths + ' months on ' + rules.postGradVisaName + ' to find a job.');
  emitSignal('studyAbroadGraduated', { country: sa.country, gpa: gpa });
}

/* ---------- JOB SEARCH ---------- */
window.studyAbroadApplyJob = function(companyIdx) {
  if (!S || !S.studyAbroad || S.studyAbroad.status !== 'job_search') return;
  const sa = S.studyAbroad;
  const industryMap = { cs: 'tech', engineering: 'engineering', business: 'banking', medicine: 'hospitals', law: 'law', economics: 'banking', finance: 'banking', architecture: 'architecture', psychology: 'hospitals', nursing: 'hospitals' };
  const industry = industryMap[sa.major] || 'retail';

  let companies = [];
  if (typeof CAR_COMPANIES !== 'undefined' && CAR_COMPANIES[sa.country] && CAR_COMPANIES[sa.country][industry]) {
    companies = CAR_COMPANIES[sa.country][industry];
  }
  if (!companies.length) { log('❌ No companies in this market.'); return; }
  const company = companies[companyIdx];
  if (!company) return;

  const countryObj = (typeof COUNTRIES !== 'undefined' && COUNTRIES[sa.country]) || (typeof C === 'function' ? C() : { salary: 50000 });
  const entryBase = (countryObj.salaryTiers && countryObj.salaryTiers.entry) || countryObj.salary || 50000;
  const salaryLocal = Math.round(entryBase * (company.payMult || 1));

  const rules = STUDY_ABROAD_RULES[sa.country] || { jobMarketStrength: 0.5 };
  const gpa = S.graduation ? S.graduation.gpa : 3.0;
  let chance = rules.jobMarketStrength * 0.6;
  
  if (gpa >= 3.5) chance += 0.15;
  if (sa.internshipsCompleted > 0) chance += (sa.internshipsCompleted * 0.10); // Internships matter heavily
  if (rules.requiresLanguage && sa.languageLevel !== 'fluent') chance -= 0.30; // Language barrier penalty
  if (S.smarts > 70) chance += 0.05;
  
  chance = Math.max(0.01, Math.min(0.95, chance));

  const roll = Math.random();
  sa.jobApplications.push({
    company: company.name,
    industry: industry,
    salary: salaryLocal,
    appliedAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1),
    status: roll < chance ? 'offer' : 'rejected'
  });

  if (roll < chance) log('🎉 ' + company.name + ' extended you an OFFER at ' + money(salaryLocal) + '/year!');
  else { log('❌ ' + company.name + ' rejected your application.'); fx({ happiness: -2 }); }
  render();
};

window.studyAbroadAcceptJob = function(offerIdx) {
  if (!S || !S.studyAbroad || S.studyAbroad.status !== 'job_search') return;
  const sa = S.studyAbroad;
  const offers = sa.jobApplications.filter(function(a) { return a.status === 'offer'; });
  const offer = offers[offerIdx];
  if (!offer) return;

  sa.status = 'working_abroad';
  S.job = { company: offer.company, title: 'Junior ' + sa.majorLabel, salary: offer.salary, level: 0, years: 0 };

  if (S.career) {
    S.career.job = {
      company: offer.company, title: 'Junior ' + sa.majorLabel, track: 'entry', level: 0,
      salary: offer.salary, baseSalaryEGP: 0, payMult: 1.0, performance: 50,
      hiredYear: gameYear(), tenure: 0, benefits: ['health'], stability: 0.85,
      prestige: 3, salaryCurrency: C().currency
    };
    S.career.mood = 'satisfied';
  }
  if (S.immigration) {
    S.immigration.destination = sa.country;
    S.immigration.visaType = 'work';
    S.immigration.status = 'visa_work';
    S.immigration.workRights = 'full';
    S.immigration.sponsor = offer.company;
    S.immigration.expiresYear = gameYear() + 3;
  }
  log('🎉 HIRED at ' + offer.company + ' — ' + money(offer.salary) + '/year.');
  log('💼 Work visa granted in ' + (COUNTRIES[sa.country] ? COUNTRIES[sa.country].name : sa.country) + '.');
  emitSignal('studyAbroadJobAccepted', { company: offer.company, salary: offer.salary });
  render();
};

window.studyAbroadGoIllegal = function() {
  if (!S || !S.studyAbroad) return;
  if (S.studyAbroad.status !== 'job_search') return;
  if (!confirm('Stay illegally after your visa expires?\n\n• No legal work\n• Only cash jobs\n• Deportation risk each year\n\nProceed?')) return;
  S.studyAbroad.status = 'illegal';
  S.studyAbroad.illegalSinceAbsMonth = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
  log('🚨 You are now undocumented. Only cash work available.');
  fx({ happiness: -10 });
  emitSignal('studyAbroadIllegal', { country: S.studyAbroad.country });
  render();
};

window.studyAbroadReturnHome = function(deported) {
  if (!S || !S.studyAbroad) return;
  const sa = S.studyAbroad;
  const oldCountry = S.country;
  const homeCountry = S.homeCountry || 'egy';

  _convertWealthToCountry(oldCountry, homeCountry);
  S.country = homeCountry;
  sa.status = 'returned';
  sa.returnedYear = gameYear();
  sa.wasDeported = !!deported;

  if (S.job) S.job = null;
  if (S.career) S.career.job = null;
  if (S.uni) S.uni = null;

  if (deported) {
    log('🚨 Deported back to ' + (COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].name : homeCountry) + '.');
    fx({ happiness: -25 });
    if (!Array.isArray(S.visaBans)) S.visaBans = [];
    S.visaBans.push({ country: sa.country, untilAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) + 60 });
  } else {
    log('🏠 Returned home to ' + (COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].name : homeCountry) + '.');
  }
  emitSignal('studyAbroadReturned', { from: oldCountry, to: homeCountry, deported: !!deported });
  render();
};

window.studyAbroadApplyMasters = function() {
  if (!S || !S.studyAbroad) return;
  const sa = S.studyAbroad;
  if (!sa.masterOffer || !sa.masterOffer.available) { log('❌ No master\'s offer available.'); return; }
  const gpa = S.graduation ? S.graduation.gpa : 0;
  if (gpa < sa.masterOffer.requiresGpa) { log('❌ GPA below requirement.'); return; }

  const tuitionUSD = 30000;
  if (!sa.masterOffer.funded && sa.mode !== 'family') {
    const tuitionLocal = Math.round(tuitionUSD * (COUNTRIES[sa.country] ? COUNTRIES[sa.country].rate : 1));
    if (S.wealth < tuitionLocal) { log('❌ Cannot afford master\'s tuition (' + money(tuitionLocal) + ').'); return; }
    S.wealth -= tuitionLocal;
  }

  const masterYears = 2;
  const funded = sa.masterOffer.funded;
  S.uni = {
    id: sa.uniId + '_master', name: sa.university + ' (Master\'s)', type: 'study_abroad',
    city: sa.country.toUpperCase(), quality: 9,
    tuition: funded ? 0 : Math.round(tuitionUSD * 52.7),
    year: 0, yearsTotal: masterYears, major: sa.major, degree: sa.major, faculty: sa.major,
    gpa: 3.0, semestersCompleted: 0, credits: 0, startedYear: gameYear(),
    paymentMode: funded ? 'scholarship' : sa.mode, isStudyAbroad: true
  };
  sa.status = 'studying';
  sa.degreeLevel = 'master';
  sa.graduationYear = gameYear() + masterYears;
  sa.jobSearchDeadlineAbsMonth = null;
  sa.masterOffer = null;
  log('🎓 Enrolled in Master\'s at ' + sa.university + '! ' + (funded ? 'Fully funded.' : 'Self-funded.') + ' ' + masterYears + ' years.');
  emitSignal('masterStarted', { university: sa.university });
  render();
};

onSignal('married', function() {
  if (!S || !S.studyAbroad) return;
  const sa = S.studyAbroad;
  if (sa.status === 'illegal' || sa.status === 'job_search') {
    const rules = STUDY_ABROAD_RULES[sa.country] || {};
    if (rules.regularizeMarriage) {
      sa.status = 'married_citizen';
      sa.regularizedByMarriage = true;
      log('💍 Your marriage regularizes your immigration status in ' + (COUNTRIES[sa.country] ? COUNTRIES[sa.country].name : sa.country) + '.');
      if (S.immigration) {
        S.immigration.destination = sa.country;
        S.immigration.visaType = 'pr';
        S.immigration.status = 'pr';
        S.immigration.workRights = 'full';
      }
      emitSignal('studyAbroadMarriageRegularized', { country: sa.country });
    }
  }
});

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureStudyAbroadState();
  if (!S || !S.studyAbroad) return;
  const sa = S.studyAbroad;

  /* Culture Shock & Language Barriers */
  if (sa.status === 'studying' && sa.language !== 'English' && sa.languageLevel === 'beginner') {
    log('🗣️ The language barrier in ' + sa.country.toUpperCase() + ' is isolating. Consider taking classes.');
    fx({ happiness: -5, social: -10 });
  }

  /* Academic Probation & Visa Revocation */
  if (sa.status === 'studying' && S.uni) {
    if (S.uni.gpa < 2.0) {
      if (sa.academicProbation) {
        log('🚨 STUDENT VISA REVOKED: You failed to meet academic requirements in ' + sa.country.toUpperCase() + '.');
        studyAbroadReturnHome(true); // Deported
        return;
      } else {
        sa.academicProbation = true;
        log('⚠️ VISA WARNING: Your GPA is too low. Immigration requires you to maintain a 2.0+ GPA or face deportation.');
      }
    } else {
      sa.academicProbation = false;
    }
  }

  /* Graduation detection */
  if (sa.status === 'studying' && !S.uni && S.degree) {
    _studyAbroadGraduate();
  }

  /* Job search window */
  if (sa.status === 'job_search') {
    const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
    if (sa.jobSearchDeadlineAbsMonth && currentAbs >= sa.jobSearchDeadlineAbsMonth) {
      sa.status = 'illegal';
      sa.illegalSinceAbsMonth = currentAbs;
      log('🚨 Post-study visa expired. You are now undocumented in ' + (COUNTRIES[sa.country] ? COUNTRIES[sa.country].name : sa.country) + '.');
      emitSignal('visaExpired', { country: sa.country });
    }
    if (sa.masterOffer && sa.masterOffer.available && currentAbs >= sa.masterOffer.expiresAbsMonth) {
      sa.masterOffer = null;
      log('⏰ Master\'s scholarship offer expired.');
    }
  }

  /* Illegal stay consequences */
  if (sa.status === 'illegal') {
    const yearsIllegal = Math.floor(((gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) - sa.illegalSinceAbsMonth) / 12);
    const deportChance = Math.min(0.55, 0.10 + yearsIllegal * 0.08);
    if (Math.random() < deportChance) {
      log('🚨 You were caught and DEPORTED from ' + (COUNTRIES[sa.country] ? COUNTRIES[sa.country].name : sa.country) + '.');
      studyAbroadReturnHome(true);
    }
  }
});

/* ---------- RENDER ---------- */
window.studyAbroadRender = function() {
  if (!S) return '';
  ensureStudyAbroadState();

  if (!S.studyAbroad) {
    return '<div class="card"><h3>🌍 Study Abroad</h3><p class="muted small">You have not studied abroad. Apply via Opportunities sub-tab.</p></div>';
  }

  const sa = S.studyAbroad;
  const rules = STUDY_ABROAD_RULES[sa.country] || {};
  const countryName = COUNTRIES[sa.country] ? COUNTRIES[sa.country].name : sa.country;
  const flag = COUNTRIES[sa.country] ? COUNTRIES[sa.country].flag : '🌍';
  const statusLabels = { studying: '📚 Studying', job_search: '⏳ Job search', illegal: '🚨 Undocumented', returned: '🏠 Returned home', working_abroad: '💼 Working abroad', married_citizen: '💍 Married citizen' };

  let html = '<div class="card" style="border-color:#22d3ee"><h3 style="color:#22d3ee">🌍 Study Abroad Status</h3>' +
    '<div class="row"><span>Country</span><b>' + flag + ' ' + countryName + '</b></div>' +
    '<div class="row"><span>University</span><b>' + sa.university + '</b></div>' +
    '<div class="row"><span>Major</span><b>' + sa.majorLabel + '</b></div>' +
    '<div class="row"><span>Degree</span><b>' + (sa.degreeLevel === 'master' ? "Master's" : 'Bachelor') + '</b></div>' +
    '<div class="row"><span>Status</span><b>' + (statusLabels[sa.status] || sa.status) + '</b></div>' +
    '<div class="row"><span>Local currency</span><b>' + C().currency + '</b></div>' +
    (sa.academicProbation ? '<div class="row" style="margin-top:6px"><b class="bad">⚠️ Academic Probation (Visa Risk)</b></div>' : '') +
    '</div>';

  if (sa.status === 'studying') {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#34d399">💼 Student Work & Experience</h4>' +
      '<div class="row"><span>Visa limit</span><b>' + rules.studyHoursPerWeek + ' hrs/week</b></div>' +
      '<div class="muted small" style="margin-top:4px; margin-bottom:8px">' + (rules.hoursNote || '') + '</div>' +
      
      (sa.partTimeJob 
        ? '<div class="row"><span>Part-time Job</span><b class="good">' + sa.partTimeJob.title + '</b></div>' 
        : '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem" onclick="studyAbroadGetPartTimeJob()"><div><b>Find Part-Time Job</b></div><div class="muted small">Work up to ' + rules.studyHoursPerWeek + ' hours/week.</div></button>') +
      
      '<div class="row" style="margin-top:8px"><span>Internships Completed</span><b>' + (sa.internshipsCompleted || 0) + '</b></div>' +
      '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem" onclick="studyAbroadDoInternship()"><div><b>Apply for Summer Internship</b></div><div class="muted small">Boosts post-grad hire chances. Requires Year 2+.</div></button>' +
      '</div>';

    if (sa.language !== 'English') {
      html += '<div class="card" style="border-color:#fbbf24"><h4 style="font-size:.85rem;color:#fbbf24">🗣️ Language & Culture</h4>' +
        '<div class="row"><span>Language</span><b>' + sa.language + '</b></div>' +
        '<div class="row"><span>Proficiency</span><b>' + sa.languageLevel.toUpperCase() + '</b></div>' +
        (sa.languageLevel !== 'fluent' ? '<button class="opt" style="width:100%;margin-top:8px;text-align:center;font-size:.75rem;background:#fbbf24;color:#000;font-weight:700" onclick="studyAbroadStudyLanguage()">Take Language Classes</button>' : '<div class="good small" style="margin-top:6px">You are fully fluent!</div>') +
        '</div>';
    }
  }

  if (sa.status === 'job_search') {
    const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
    const monthsLeft = Math.max(0, (sa.jobSearchDeadlineAbsMonth || 0) - currentAbs);
    const deadlineYear = sa.jobSearchDeadlineAbsMonth ? 2001 + Math.floor((sa.jobSearchDeadlineAbsMonth - 1) / 12) : '?';

    html += '<div class="card" style="border-color:#fbbf24"><h4 style="color:#fbbf24">⏳ Post-Study Job Search</h4>' +
      '<div class="row"><span>Visa</span><b>' + (sa.postGradVisaName || rules.postGradVisaName || 'Post-study') + '</b></div>' +
      '<div class="row"><span>Months remaining</span><b class="' + (monthsLeft < 6 ? 'bad' : 'good') + '">' + monthsLeft + '</b></div>' +
      '<div class="row"><span>Deadline</span><b>' + deadlineYear + '</b></div>' +
      (rules.requiresLanguage && sa.languageLevel !== 'fluent' ? '<div class="bad small" style="margin-top:6px">⚠️ Language barrier lowering hire chances.</div>' : '') +
      '<p class="muted small" style="margin-top:8px">Apply for jobs below to convert to a work visa. If your window expires, you become undocumented.</p></div>';

    html += _saRenderJobMarket(sa);

    if (sa.masterOffer && sa.masterOffer.available) {
      const gpa = S.graduation ? S.graduation.gpa : 0;
      html += '<div class="card" style="border-color:#8b5cf6"><h4 style="color:#8b5cf6">🎓 Master\'s Offer</h4>' +
        '<div class="row"><span>Type</span><b>' + (sa.masterOffer.funded ? 'Fully funded scholarship' : 'Self-funded') + '</b></div>' +
        '<div class="row"><span>Your GPA</span><b>' + gpa.toFixed(2) + ' / needs ' + sa.masterOffer.requiresGpa + '</b></div>' +
        (gpa >= sa.masterOffer.requiresGpa
          ? '<button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="studyAbroadApplyMasters()">Accept Master\'s Offer →</button>'
          : '<div class="muted small" style="margin-top:6px;color:#fb7185">GPA too low for this offer.</div>') +
        '</div>';
    }

    const offers = sa.jobApplications.filter(function(a) { return a.status === 'offer'; });
    if (offers.length) {
      html += '<div class="card" style="border-color:#34d399"><h4 style="color:#34d399">🎉 Offers (' + offers.length + ')</h4>';
      offers.forEach(function(off, i) {
        html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
          '<div style="display:flex;justify-content:space-between"><b>' + off.company + '</b><b class="mono">' + money(off.salary) + '/yr</b></div>' +
          '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:#34d399;color:#000;font-weight:700" onclick="studyAbroadAcceptJob(' + i + ')">Accept & Convert to Work Visa</button></div>';
      });
      html += '</div>';
    }

    html += '<div class="card"><h4 style="font-size:.85rem;color:#fb7185">Other Options</h4>' +
      '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:8px;font-size:.78rem;border-color:#fb7185;color:#fb7185" onclick="studyAbroadGoIllegal()"><div><b>Stay illegally</b></div><div class="muted small">Cash work only. Deportation risk.</div></button>' +
      '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:8px;font-size:.78rem" onclick="studyAbroadReturnHome(false)"><div><b>Return home to ' + (COUNTRIES[S.homeCountry] ? COUNTRIES[S.homeCountry].name : S.homeCountry) + '</b></div></button>' +
      '</div>';
  }

  if (sa.status === 'illegal') {
    const yearsIllegal = Math.floor(((gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) - sa.illegalSinceAbsMonth) / 12);
    html += '<div class="card" style="border-color:#fb7185"><h4 style="color:#fb7185">🚨 Undocumented in ' + countryName + '</h4>' +
      '<div class="row"><span>Years illegal</span><b class="bad">' + yearsIllegal + '</b></div>' +
      '<div class="row"><span>Deportation risk</span><b class="bad">' + Math.round(Math.min(55, 10 + yearsIllegal * 8)) + '%/yr</b></div>' +
      '<p class="muted small" style="margin-top:8px">Cash jobs only. Ways to legalize:</p>' +
      '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="switchTab(\'marriage\')">💍 Marry a citizen</button>' +
      '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="switchTab(\'immigration\')">🕊 Apply for asylum</button>' +
      '<button class="opt" style="width:100%;margin-top:8px;text-align:left;padding:8px;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="studyAbroadReturnHome(false)"><div><b>Leave voluntarily</b></div><div class="muted small">Avoid deportation ban.</div></button>' +
      '</div>';
  }

  if (sa.status === 'returned') {
    html += '<div class="card"><p class="muted small">You returned home in ' + sa.returnedYear + (sa.wasDeported ? ' (deported)' : '') + '.</p></div>';
  }

  if (sa.status === 'working_abroad' || sa.status === 'married_citizen') {
    html += '<div class="card" style="border-color:#34d399"><p class="muted small">✅ ' + (sa.status === 'married_citizen' ? 'Married citizen — PR status' : 'Working on a work visa') + ' in ' + countryName + '. Career continues in the Career tab.</p></div>';
  }

  return html;
};

function _saRenderJobMarket(sa) {
  const industryMap = { cs: 'tech', engineering: 'engineering', business: 'banking', medicine: 'hospitals', law: 'law', economics: 'banking', finance: 'banking', architecture: 'architecture', psychology: 'hospitals', nursing: 'hospitals' };
  const industry = industryMap[sa.major] || 'retail';
  let companies = (typeof CAR_COMPANIES !== 'undefined' && CAR_COMPANIES[sa.country] && CAR_COMPANIES[sa.country][industry]) ? CAR_COMPANIES[sa.country][industry] : [];
  if (!companies.length) return '<div class="card"><p class="muted small">No companies listed for your major here.</p></div>';

  const countryObj = (typeof COUNTRIES !== 'undefined' && COUNTRIES[sa.country]) || (typeof C === 'function' ? C() : { salary: 50000 });
  const entryBase = (countryObj.salaryTiers && countryObj.salaryTiers.entry) || countryObj.salary || 50000;

  let html = '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">💼 ' + industry.charAt(0).toUpperCase() + industry.slice(1) + ' Job Market</h4>';
  companies.slice(0, 8).forEach(function(c, i) {
    const salaryLocal = Math.round(entryBase * (c.payMult || 1));
    const applied = sa.jobApplications.some(function(a) { return a.company === c.name; });
    html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
      '<div style="display:flex;justify-content:space-between"><b>' + c.name + '</b><b class="mono">' + money(salaryLocal) + '/yr</b></div>' +
      (applied ? '<div class="muted small">✓ Already applied</div>' : '<button class="opt" style="margin-top:4px;width:100%;text-align:center;font-size:.72rem" onclick="studyAbroadApplyJob(' + i + ')">Apply</button>') +
      '</div>';
  });
  html += '</div>';
  return html;
}
console.log('[World Life] 30-study-abroad.js loaded — v2 (Jobs, Visas, Language)');
