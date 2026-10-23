/* ============================================================
   VIEW: CAREER (v3 — massively expanded)
   ============================================================
   Owns: S.career (primary), S.job (legacy, kept in sync)
   Registers tab 'career' at order 2.

   v3 changes:
   - Fixed: truncated syntax error at end of v2
   - Fixed: medical specialty tracks now require Imtyaz completion
   - Fixed: competitor offer salary calculation
   - Added: work mode (slacking/normal/hard/overtime)
   - Added: career mood + performance reviews
   - Added: career milestones
   - Added: network tab (mentor, references, colleagues, recruiters)
   - Added: industry market conditions
   - Added: business employee names + incidents + milestones
   - Added: interview round display with scores
   - Added: offer comparison
   - Added: detailed pension year-by-year
   - Added: side income sources
   - Added: annual work expenses
   ============================================================ */

/* ============================================================
   STATE
   ============================================================ */

function ensureCareerState() {
  if (!S) return;
  if (!S.career) {
    S.career = {
      job: null,
      jobHistory: [],
      applications: [],
      offers: [],
      partTime: null,
      internships: [],
      businesses: [],
      cv: { skill: 50, experience: 0 },
      pension: { accumulated: 0, finalSalary: 0, started: null, byYear: [] },
      retired: false,
      imtyaz: { done: false, monthsLeft: 0 },
      academic: { active: false, level: 0 },
      workMode: 'normal',
      workHardThisYear: false,
      mood: 'neutral',
      milestones: [],
      reviews: [],
      lastReviewYear: 0,
      network: { mentor: null, references: [], colleagues: [], recruiters: [] },
      industryTrends: {},
      sideIncome: [],
      benefits: [],
      lastSalary: 0,
      tab: 'overview'
    };
  }
  const c = S.career;
  if (!Array.isArray(c.jobHistory)) c.jobHistory = [];
  if (!Array.isArray(c.applications)) c.applications = [];
  if (!Array.isArray(c.offers)) c.offers = [];
  if (!Array.isArray(c.internships)) c.internships = [];
  if (!Array.isArray(c.businesses)) c.businesses = [];
  if (!Array.isArray(c.benefits)) c.benefits = [];
  if (!Array.isArray(c.milestones)) c.milestones = [];
  if (!Array.isArray(c.reviews)) c.reviews = [];
  if (!Array.isArray(c.sideIncome)) c.sideIncome = [];
  if (typeof c.workHardThisYear !== 'boolean') c.workHardThisYear = false;
  if (typeof c.workMode !== 'string') c.workMode = c.workHardThisYear ? 'hard' : 'normal';
  if (typeof c.mood !== 'string') c.mood = 'neutral';
  if (typeof c.lastReviewYear !== 'number') c.lastReviewYear = 0;
  if (typeof c.retired !== 'boolean') c.retired = false;
  if (!c.pension || typeof c.pension.accumulated !== 'number') {
    c.pension = { accumulated: 0, finalSalary: 0, started: null, byYear: [] };
  }
  if (!Array.isArray(c.pension.byYear)) c.pension.byYear = [];
  if (!c.imtyaz || typeof c.imtyaz !== 'object') c.imtyaz = { done: false, monthsLeft: 0 };
  if (!c.academic || typeof c.academic !== 'object') c.academic = { active: false, level: 0 };
  if (!c.cv || typeof c.cv.skill !== 'number') c.cv = { skill: 50, experience: 0 };
  if (!c.network || typeof c.network !== 'object') c.network = { mentor: null, references: [], colleagues: [], recruiters: [] };
  if (!Array.isArray(c.network.references)) c.network.references = [];
  if (!Array.isArray(c.network.colleagues)) c.network.colleagues = [];
  if (!Array.isArray(c.network.recruiters)) c.network.recruiters = [];
  if (!c.industryTrends || typeof c.industryTrends !== 'object') c.industryTrends = {};
  if (typeof c.lastSalary !== 'number') c.lastSalary = 0;
  if (!c.tab) c.tab = 'overview';

  /* Migrate legacy S.job */
  if (S.job && !c.job) {
    var detectedTrack = carDetectTrackFromTitle(S.job.title || '');
    var trackDef = carTrackById(detectedTrack);
    var companyPool = carCompaniesFor(trackDef ? trackDef.industry : 'retail');
    var companyMatch = companyPool.find(function(co) { return co.name === S.job.company; });

    var baseSalEGP = S.job.salary || 48000;
    if (companyMatch && companyMatch.payMult > 0) {
      baseSalEGP = Math.round((S.job.salary || 48000) / companyMatch.payMult);
    }

    c.job = {
      company: S.job.company || 'Unknown',
      title: S.job.title || 'Worker',
      track: detectedTrack,
      level: S.job.level || 0,
      salary: S.job.salary || 48000,
      baseSalaryEGP: baseSalEGP,
      payMult: companyMatch ? companyMatch.payMult : 1.0,
      performance: 50,
      hiredYear: gameYear() - (S.job.years || 0),
      tenure: S.job.years || 0,
      benefits: companyMatch ? companyMatch.benefits.slice() : [],
      stability: companyMatch ? companyMatch.stability : 0.85,
      prestige: companyMatch ? companyMatch.prestige : 2,
      salaryCurrency: C().currency
    };
  }

  /* One-time fix for already-migrated saves with wrong track (v3) */
  if (!c.migratedV3 && c.job) {
    c.migratedV3 = true;
    if (c.job.track === 'entry' && c.job.title) {
      var reTrack = carDetectTrackFromTitle(c.job.title);
      if (reTrack !== 'entry') {
        var reTrackDef = carTrackById(reTrack);
        var rePool = carCompaniesFor(reTrackDef ? reTrackDef.industry : 'retail');
        var reMatch = rePool.find(function(co) { return co.name === c.job.company; });
        c.job.track = reTrack;
        if (reMatch) {
          c.job.payMult = reMatch.payMult;
          c.job.stability = reMatch.stability;
          c.job.prestige = reMatch.prestige;
          c.job.benefits = reMatch.benefits.slice();
        }
      }
    }
  }

  /* Migrate job if it exists but has no payMult */
  if (c.job && typeof c.job.payMult !== 'number') {
    c.job.payMult = 1.0;
    c.job.baseSalaryEGP = c.job.salary;
  }
}

GameHooks.on('newGame', ensureCareerState);
GameHooks.on('migrate', ensureCareerState);
/* ============================================================
   CLEAR STALE JOB DATA ON COUNTRY CHANGE
   ============================================================ */
GameHooks.on('render', function() {
  if (!S || !S.career) return;
  
  if (!S._careerCountryTrack) { 
    S._careerCountryTrack = S.country;
    /* Force check on first load */
    if (S.career.job && S.country === (S.homeCountry || S.country)) {
      const foreignCompanies = [];
      Object.keys(CAR_COMPANIES).forEach(function(c) {
        if (c !== S.country) Object.keys(CAR_COMPANIES[c]).forEach(function(ind) {
          CAR_COMPANIES[c][ind].forEach(function(co) { foreignCompanies.push(co.name); });
        });
      });
      if (foreignCompanies.indexOf(S.career.job.company) >= 0) {
        log('📍 Cleared stale foreign job (' + S.career.job.company + '). You are now in ' + C().name + '.');
        S.career.job = null;
        S.job = null;
      }
    }
    return; 
  }
  
  if (S._careerCountryTrack === S.country) return;
  S._careerCountryTrack = S.country;

  const homeCountry = S.homeCountry || S.country;
  if (S.country === homeCountry && S.career.job) {
    const foreignCompanies = [];
    Object.keys(CAR_COMPANIES).forEach(function(c) {
      if (c !== S.country) Object.keys(CAR_COMPANIES[c]).forEach(function(ind) {
        CAR_COMPANIES[c][ind].forEach(function(co) { foreignCompanies.push(co.name); });
      });
    });
    if (foreignCompanies.indexOf(S.career.job.company) >= 0) {
      log('📍 Cleared stale foreign job (' + S.career.job.company + '). You are home.');
      S.career.job = null;
      S.job = null;
    }
  }
});
/* ============================================================
   HELPERS
   ============================================================ */

var CAR_EGP_BASE_RATE = 52.7;
function carRate() { return C().rate || 1; }
function carEGP(n) {
  var localRate = C().rate || 1;
  if (localRate === CAR_EGP_BASE_RATE) return Math.round(n || 0);
  return Math.round((n || 0) * (localRate / CAR_EGP_BASE_RATE));
}
function carSetTab(tab) { S.career.tab = tab; render(); }
window.carSetTab = carSetTab;
function carDetectTrackFromTitle(title) {
  if (!title) return 'entry';
  var t = title.toLowerCase();
  if (t.indexOf('customer service') >= 0 || t.indexOf('call center') >= 0 || t.indexOf('bpo') >= 0) return 'bpo';
  if (t.indexOf('software') >= 0 || t.indexOf('developer') >= 0 || t.indexOf('programmer') >= 0) return 'tech';
  if (t.indexOf('data scientist') >= 0 || t.indexOf('machine learning') >= 0) return 'data_science';
  if (t.indexOf('cyber') >= 0 || t.indexOf('security engineer') >= 0) return 'cybersecurity';
  if (t.indexOf('designer') >= 0 || t.indexOf('ux') >= 0) return 'product_design';
  if (t.indexOf('qa') >= 0 || t.indexOf('tester') >= 0) return 'qa_engineering';
  if (t.indexOf('accountant') >= 0 || t.indexOf('auditor') >= 0) return 'accounting';
  if (t.indexOf('investment analyst') >= 0 || t.indexOf('private equity') >= 0) return 'investment';
  if (t.indexOf('financial analyst') >= 0 || t.indexOf('banker') >= 0) return 'business';
  if (t.indexOf('marketing') >= 0) return 'marketing';
  if (t.indexOf('sales') >= 0) return 'sales';
  if (t.indexOf(' hr ') >= 0 || t.indexOf('human resources') >= 0 || t.indexOf('recruiter') >= 0) return 'hr';
  if (t.indexOf('consultant') >= 0) return 'consulting';
  if (t.indexOf('product manager') >= 0) return 'product';
  if (t.indexOf('doctor') >= 0 || t.indexOf('physician') >= 0) return 'medicine';
  if (t.indexOf('surgeon') >= 0) return 'surgery';
  if (t.indexOf('pediatrician') >= 0) return 'pediatrics';
  if (t.indexOf('cardiologist') >= 0) return 'cardiology';
  if (t.indexOf('nurse') >= 0) return 'nursing';
  if (t.indexOf('pharmacist') >= 0) return 'pharmacy';
  if (t.indexOf('dentist') >= 0) return 'dentistry';
  if (t.indexOf('psychologist') >= 0) return 'psychology';
  if (t.indexOf('veterinarian') >= 0) return 'veterinary';
  if (t.indexOf('physio') >= 0) return 'physiotherapy';
  if (t.indexOf('lawyer') >= 0 || t.indexOf('legal') >= 0) return 'law';
  if (t.indexOf('prosecutor') >= 0 || t.indexOf('judge') >= 0) return 'prosecutor';
  if (t.indexOf('architect') >= 0) return 'architect';
  if (t.indexOf('civil engineer') >= 0) return 'civil_eng';
  if (t.indexOf('engineer') >= 0) return 'engineering';
  if (t.indexOf('teacher') >= 0) return 'teaching';
  if (t.indexOf('lecturer') >= 0 || t.indexOf('professor') >= 0) return 'academia';
  if (t.indexOf('hotel') >= 0 || t.indexOf('front desk') >= 0) return 'hospitality';
  if (t.indexOf('pilot') >= 0) return 'aviation';
  if (t.indexOf('journalist') >= 0 || t.indexOf('reporter') >= 0 || t.indexOf('editor') >= 0) return 'media';
  if (t.indexOf('civil servant') >= 0 || t.indexOf('government') >= 0) return 'government';
  if (t.indexOf('electrician') >= 0 || t.indexOf('plumber') >= 0 || t.indexOf('mechanic') >= 0) return 'trades';
  return 'entry';
}

function carCompaniesFor(industry) {
  const pool = CAR_COMPANIES[S.country] || CAR_COMPANIES.egy;
  return pool[industry] || [];
}

function carTrackById(trackId) {
  return CAR_TRACKS.find(function(t) { return t.id === trackId; });
}

function carPlayerTrack() {
  const deg = S.degree || null;
  if (!deg) return 'entry';
  if (deg === 'medicine') return 'medicine';
  if (deg === 'business') return 'business';
  if (deg === 'law') return 'law';
  if (deg === 'engineering') return 'engineering';
  if (deg === 'cs') return 'tech';
  if (deg === 'nursing') return 'nursing';
  if (deg === 'pharmacy') return 'pharmacy';
  if (deg === 'dentistry') return 'dentistry';
  if (deg === 'psychology') return 'psychology';
  if (deg === 'veterinary') return 'veterinary';
  if (deg === 'physiotherapy') return 'physiotherapy';
  if (deg === 'architecture') return 'architect';
  return 'entry';
}

function carCanApplyTrack(trackId) {
  const track = carTrackById(trackId);
  if (!track) return { ok: false, reason: 'Unknown track' };
  if (track.requiresDegree && S.degree !== track.requiresDegree) {
    return { ok: false, reason: 'Requires ' + track.requiresDegree + ' degree' };
  }
  if (track.requiresGPA && (!S.uni || !S.uni.gpa || S.uni.gpa < track.requiresGPA)) {
    return { ok: false, reason: 'Requires GPA ' + track.requiresGPA + '+' };
  }

  /* Medical specialty tracks require Imtyaz completion */
  const medicalSpecialtyTracks = ['surgery', 'pediatrics', 'cardiology'];
  if (medicalSpecialtyTracks.indexOf(trackId) >= 0 && S.degree === 'medicine') {
    if (!S.career.imtyaz.done) {
      if (S.career.imtyaz.monthsLeft > 0) {
        return { ok: false, reason: 'Finish Imtyaz first (' + S.career.imtyaz.monthsLeft + ' months left)' };
      }
      return { ok: false, reason: 'Complete Imtyaz first (apply to Doctor track)' };
    }
  }
  if (trackId === 'medicine' && S.degree === 'medicine' && !S.career.imtyaz.done) {
    return { ok: true, note: 'Will start as Imtyaz (12 months training)' };
  }
  return { ok: true };
}

function carGetLevelFor(job) {
  const track = carTrackById(job.track);
  if (!track || !track.levels[job.level]) return null;
  return track.levels[job.level];
}

function carNextLevel(job) {
  const track = carTrackById(job.track);
  if (!track || job.level + 1 >= track.levels.length) return null;
  return track.levels[job.level + 1];
}

function carSkillLevel() {
  const skill = S.career.cv.skill;
  if (skill >= 85) return { label: 'Expert', color: '#fbbf24' };
  if (skill >= 65) return { label: 'Senior', color: '#34d399' };
  if (skill >= 45) return { label: 'Mid-level', color: '#22d3ee' };
  if (skill >= 25) return { label: 'Junior', color: '#8b5cf6' };
  return { label: 'Novice', color: '#fb7185' };
}

function carIndustryTrend(industry) {
  const t = S.career.industryTrends[industry];
  if (t === 'booming') return { label: 'Booming', color: '#34d399', icon: '🚀' };
  if (t === 'recession') return { label: 'Recession', color: '#fb7185', icon: '📉' };
  return { label: 'Stable', color: '#888', icon: '⚖️' };
}

function carMoodLabel() {
  const mood = S.career.mood;
  const moods = {
    satisfied: { label: 'Satisfied', color: '#34d399', icon: '😊' },
    neutral: { label: 'Neutral', color: '#888', icon: '😐' },
    ambitious: { label: 'Ambitious', color: '#8b5cf6', icon: '🎯' },
    frustrated: { label: 'Frustrated', color: '#fbbf24', icon: '😤' },
    burnedout: { label: 'Burned Out', color: '#fb7185', icon: '🔥' }
  };
  return moods[mood] || moods.neutral;
}
/* ---------- TAX CALCULATION ---------- */
function carComputeTax(grossSalary) {
  if (!grossSalary || grossSalary <= 0) return 0;
  const country = S.country || 'egy';
  if (country === 'usa') return Math.round(grossSalary * 0.22);
  if (country === 'sau' || country === 'uae') return 0;
  if (country === 'egy') {
    const brackets = [
      { max: 40000, rate: 0 },
      { max: 55000, rate: 0.10 },
      { max: 70000, rate: 0.15 },
      { max: 200000, rate: 0.20 },
      { max: 400000, rate: 0.225 },
      { max: Infinity, rate: 0.25 }
    ];
    let tax = 0;
    let remaining = grossSalary;
    let prev = 0;
    for (let i = 0; i < brackets.length; i++) {
      const width = brackets[i].max - prev;
      const taxable = Math.min(remaining, width);
      if (taxable <= 0) break;
      tax += taxable * brackets[i].rate;
      remaining -= taxable;
      prev = brackets[i].max;
      if (remaining <= 0) break;
    }
    return Math.round(tax);
  }
  return 0;
}

/* ---------- MARKET SALARY COMPARISON ---------- */
function carComputeMarketSalary(trackId, level) {
  const track = carTrackById(trackId);
  if (!track || !track.levels[level]) return null;
  const companies = carCompaniesFor(track.industry);
  if (!companies.length) return null;
   const baseSalary = carSalaryForLevel(trackId, level);
  const salaries = companies.map(function(c) { return baseSalary * c.payMult; });
  const sum = salaries.reduce(function(s, x) { return s + x; }, 0);
  return {
    avg: Math.round(sum / salaries.length),
    min: Math.round(Math.min.apply(null, salaries)),
    max: Math.round(Math.max.apply(null, salaries))
  };
}

/* ---------- SMART SUGGESTIONS ---------- */
function carSmartSuggestions() {
  const c = S.career;
  const suggestions = [];

  if (!c.job && !c.partTime) {
    suggestions.push({
      icon: '🔍',
      text: 'You are unemployed. Start your job search.',
      action: "carSetTab('search')",
      actionLabel: 'Find a job',
      color: '#fb7185'
    });
    return suggestions;
  }

  if (c.job) {
    const j = c.job;
    const track = carTrackById(j.track);
    const nextLevel = carNextLevel(j);
    const market = carComputeMarketSalary(j.track, j.level);

    /* Low performance warning */
    if (j.performance < 40 && j.tenure >= 1) {
      suggestions.push({
        icon: '⚠️',
        text: 'Performance is dangerously low (' + Math.round(j.performance) + '%). You risk being fired.',
        action: "carSetTab('overview')",
        actionLabel: 'Fix it',
        color: '#fb7185'
      });
    }
    /* Promotion path */
    else if (j.performance < 80 && nextLevel) {
      const gap = Math.round(80 - j.performance);
      suggestions.push({
        icon: '📈',
        text: 'Need +' + gap + '% more performance to qualify for promotion to ' + nextLevel.title + '.',
        action: "carSetTab('overview')",
        actionLabel: 'Work harder',
        color: '#fbbf24'
      });
    }
    /* Ready but blocked by tenure */
    if (nextLevel && j.performance >= 80) {
      const reqYears = nextLevel.requirements.years || 0;
      if (j.tenure < reqYears) {
        suggestions.push({
          icon: '⏳',
          text: 'Performance is ready! Only tenure blocks you: ' + j.tenure + '/' + reqYears + ' years.',
          action: null,
          actionLabel: null,
          color: '#22d3ee'
        });
      }
    }
    /* Salary vs market */
    if (market && j.salary < market.avg * 0.85) {
      const pctBelow = Math.round((1 - j.salary / market.avg) * 100);
      suggestions.push({
        icon: '💸',
        text: 'Your salary is ' + pctBelow + '% below market (' + money(market.avg) + ' avg). Ask for a raise.',
        action: 'carAskForRaise()',
        actionLabel: 'Ask raise',
        color: '#fb7185'
      });
    } else if (market && j.salary > market.avg * 1.15) {
      suggestions.push({
        icon: '⭐',
        text: 'You earn ' + Math.round((j.salary / market.avg - 1) * 100) + '% above market average. Excellent!',
        action: null,
        actionLabel: null,
        color: '#34d399'
      });
    }
    /* Stale career */
    if (j.tenure >= 5 && j.performance >= 70 && j.performance < 85) {
      suggestions.push({
        icon: '🚪',
        text: j.tenure + ' years at same role. Consider browsing the market.',
        action: "carSetTab('search')",
        actionLabel: 'Browse',
        color: '#8b5cf6'
      });
    }
  }

  if (c.offers.length > 0) {
    suggestions.push({
      icon: '💼',
      text: c.offers.length + ' pending offer(s) waiting for your decision.',
      action: "carSetTab('offers')",
      actionLabel: 'Review',
      color: '#34d399'
    });
  }
  if (c.applications.length > 0) {
    suggestions.push({
      icon: '📝',
      text: c.applications.length + ' interview(s) in progress.',
      action: "carSetTab('interviews')",
      actionLabel: 'Continue',
      color: '#fbbf24'
    });
  }
  if (c.imtyaz && c.imtyaz.monthsLeft > 0) {
    suggestions.push({
      icon: '🏥',
      text: 'Imtyaz training in progress — ' + c.imtyaz.monthsLeft + ' months remaining.',
      action: null,
      actionLabel: null,
      color: '#22d3ee'
    });
  }

  return suggestions;
}

function carAddMilestone(id, label) {
  if (S.career.milestones.some(function(m) { return m.id === id; })) return;
  S.career.milestones.push({ id: id, label: label, year: gameYear() });
}

/* ============================================================
   JOB APPLICATION
   ============================================================ */

function carApplyToJob(trackId, companyIndex) {
  const track = carTrackById(trackId);
  if (!track) return;
  const companies = carCompaniesFor(track.industry);
  const company = companies[companyIndex];
  if (!company) return;

  const check = carCanApplyTrack(trackId);
  if (!check.ok) { log('❌ ' + check.reason); render(); return; }

  let startLevel = 0;
  if (trackId === 'medicine' && S.degree === 'medicine' && !S.career.imtyaz.done) {
    startLevel = 0;
    S.career.imtyaz.monthsLeft = 12;
  } else if (S.career.cv.experience >= 2 && track.levels.length > 1) {
    startLevel = 1;
  }

   const level = track.levels[startLevel];
  let salaryMult = company.payMult;
  if (track.id === 'bpo' && track.languageTiers) {
    var detectedLang = 'en';
    if ((S.languageScores && S.languageScores.goethe || 0) >= 3) detectedLang = 'de';
    else if ((S.languageScores && S.languageScores.delf || 0) >= 3) detectedLang = 'fr';
    var tier = track.languageTiers[detectedLang] || track.languageTiers.en;
    salaryMult *= tier.payMult;
  }
    const baseSalary = Math.round(carSalaryForLevel(trackId, startLevel) * salaryMult);
  S.career.applications.push({
    id: 'app_' + Math.random().toString(36).slice(2, 8),
    trackId: trackId,
    companyName: company.name,
    companyIndex: companyIndex,
    title: level.title,
    level: startLevel,
    baseSalaryEGP: level.baseSalaryEGP,
    baseSalary: baseSalary,
    payMult: company.payMult,
    benefits: company.benefits.slice(),
    stability: company.stability,
    prestige: company.prestige,
    round: 0,
    roundScores: [],
    status: 'pending',
    appliedYear: gameYear(),
    interviewer: carRandomInterviewer()
  });

  log('📝 Applied to ' + company.name + ' for ' + level.title + '. Awaiting first round.');
  S.career.tab = 'interviews';
  render();
}
window.carApplyToJob = carApplyToJob;

function carRandomInterviewer() {
  const firsts = ['Sarah', 'Ahmed', 'Layla', 'Omar', 'Nour', 'Karim', 'Hana', 'Youssef', 'Mariam', 'Tarek', 'Rana', 'Ali'];
  const lasts = ['Hassan', 'Mahmoud', 'Ibrahim', 'Farouk', 'Nasser', 'Sayed', 'Fahmy', 'Adel', 'Saad', 'Khalil'];
  return firsts[Math.floor(Math.random() * firsts.length)] + ' ' + lasts[Math.floor(Math.random() * lasts.length)];
}

/* ============================================================
   INTERVIEW ROUNDS
   ============================================================ */

function carResolveRound(app) {
  const roundDef = CAR_INTERVIEW_ROUNDS[app.round];
  if (!roundDef) return;

  let score = 0;
  if (roundDef.weight === 'smarts') score = S.smarts / 100;
  else if (roundDef.weight === 'social') score = S.social / 100;
  else if (roundDef.weight === 'composite') score = (S.smarts + S.social) / 200;

  score += (S.career.cv.skill - 50) / 200;
  if (S.school === 'international') score += 0.10;
  else if (S.school === 'private') score += 0.05;
  if (S.uni && S.uni.type === 'private') score += 0.08;
  score += Math.min(0.15, S.career.internships.length * 0.04);
  if (S.career.network.mentor) score += 0.05;

  /* Industry trend adjustment */
  const trend = S.career.industryTrends[app.industry || 'normal'];
  if (trend === 'booming') score += 0.05;
  else if (trend === 'recession') score -= 0.10;

  const passed = score >= roundDef.threshold;
  app.roundScores.push({ round: app.round, score: Math.round(score * 100), passed: passed });
  app.round++;

  if (!passed) {
    app.status = 'rejected';
    const msg = roundDef.failMessages[Math.floor(Math.random() * roundDef.failMessages.length)];
    log('❌ ' + app.companyName + ': ' + msg);
    fx({ happiness: -5 });
    S.career.applications = S.career.applications.filter(function(a) { return a.id !== app.id; });
    if (S.career.mood === 'neutral') S.career.mood = 'frustrated';
    return;
  }

  if (app.round >= CAR_INTERVIEW_ROUNDS.length) {
    app.status = 'hired';
    carHireFromApplication(app);
    S.career.applications = S.career.applications.filter(function(a) { return a.id !== app.id; });
    return;
  }
  const nextMsg = roundDef.passMessages[Math.floor(Math.random() * roundDef.passMessages.length)];
  log('✅ ' + app.companyName + ' · ' + roundDef.label + ': ' + nextMsg);
  fx({ happiness: 3 });
}

window.carAdvanceRound = function(appId) {
  const app = S.career.applications.find(function(a) { return a.id === appId; });
  if (!app) return;
  carResolveRound(app);
  render();
};

window.carAdvanceAllRounds = function(appId) {
  const app = S.career.applications.find(function(a) { return a.id === appId; });
  if (!app) return;
  let safety = 0;
  while (app.status === 'pending' && safety < 5) {
    carResolveRound(app);
    safety++;
  }
  render();
};

/* ============================================================
   HIRING
   ============================================================ */

function carHireFromApplication(app) {
  if (S.career.job) carLeaveCurrentJob('accepted new offer');

  S.career.job = {
    company: app.companyName,
    title: app.title,
    track: app.trackId,
    level: app.level,
    salary: app.baseSalary,
    baseSalaryEGP: app.baseSalaryEGP,
    payMult: app.payMult,
    performance: 50,
    hiredYear: gameYear(),
    tenure: 0,
    benefits: app.benefits.slice(),
    stability: app.stability,
    prestige: app.prestige,
    salaryCurrency: C().currency
  };

  if (app.benefits.indexOf('signing') >= 0) {
    const bonus = Math.round(app.baseSalary * 0.15);
    S.wealth += bonus;
    log('💰 Signing bonus: ' + money(bonus) + '.');
  }

  S.job = {
    id: app.trackId,
    title: app.title,
    company: app.companyName,
    salary: app.baseSalary,
    level: app.level,
    years: 0
  };

  /* Update CV */
  S.career.cv.experience += 1;
  S.career.cv.skill = Math.min(100, S.career.cv.skill + 5);

  /* Milestone tracking */
  if (S.career.jobHistory.length === 0) {
    carAddMilestone('first_job', 'First Full-Time Job');
  }

  /* Add a colleague from the new job */
  if (Math.random() < 0.4) {
    carAddColleague(app.companyName);
  }

  /* Auto-enroll in National Social Insurance (mandatory for formal employees) */
  if (S.bank && S.bank.pension && Array.isArray(S.bank.pension.active) && S.bank.pension.active.length === 0) {
    if (typeof PENSION_PRODUCTS !== 'undefined') {
      var pPool = PENSION_PRODUCTS[S.country] || PENSION_PRODUCTS.egy || [];
      var nationalPlan = pPool.find(function(p) {
        return p.id === 'national_pension' || (p.name && p.name.toLowerCase().indexOf('national') >= 0);
      });
      if (nationalPlan) {
        var monthlyContrib = Math.round((app.baseSalary / 12) * (nationalPlan.contributionRate || 0.11));
        S.bank.pension.active.push({
          id: 'pen_national_' + Math.random().toString(36).slice(2, 6),
          productId: nationalPlan.id,
          name: nationalPlan.name,
          provider: nationalPlan.provider || 'Government',
          monthlyContribution: monthlyContrib,
          value: 0,
          startedYear: gameYear()
        });
        log('🏛 Auto-enrolled in ' + nationalPlan.name + ' (mandatory). Monthly: ' + money(monthlyContrib) + '.');
      }
    }
  }

     /* Boss assignment */
  S.career.job.boss = {
    name: carRandomInterviewer(),
    bond: 50 + Math.floor(Math.random() * 20)
  };

  log('🎉 HIRED at ' + app.companyName + ' as ' + app.title + ' · ' + money(app.baseSalary) + '/year. Your manager is ' + S.career.job.boss.name + '.');
  fx({ happiness: 15 });
  S.career.mood = 'satisfied';
  S.career.tab = 'overview';
}
function carAddColleague(companyName) {
  const names = ['Rania', 'Hisham', 'Dina', 'Sherif', 'Mai', 'Khaled', 'Yara', 'Waleed', 'Nour', 'Rami'];
  const roles = ['colleague', 'manager', 'mentor candidate', 'rival', 'team lead'];
  const colleague = {
    id: 'col_' + Math.random().toString(36).slice(2, 8),
    name: names[Math.floor(Math.random() * names.length)],
    company: companyName,
    role: roles[Math.floor(Math.random() * roles.length)],
    bond: 50 + Math.floor(Math.random() * 30),
    metYear: gameYear()
  };
  S.career.network.colleagues.push(colleague);
  log('👥 Met ' + colleague.name + ' (' + colleague.role + ') at ' + companyName + '.');
}

/* ============================================================
   LEAVING JOB
   ============================================================ */

function carLeaveCurrentJob(reason) {
  if (!S.career.job) return;
  const j = S.career.job;
  S.career.jobHistory.push({
    company: j.company,
    title: j.title,
    level: j.level,
    salary: j.salary,
    from: j.hiredYear,
    to: gameYear(),
    reason: reason || 'left'
  });

  const pensionContrib = Math.round(j.salary * 0.05 * j.tenure);
  if (pensionContrib > 0) {
    S.career.pension.accumulated += pensionContrib;
    S.career.pension.byYear.push({ year: gameYear(), amount: pensionContrib, from: j.company });
  }
  S.career.pension.finalSalary = j.salary;

  /* Add a reference from this job if you were there 2+ years */
  if (j.tenure >= 2) {
    S.career.network.references.push({
      name: j.company,
      title: j.title,
      years: j.tenure,
      quality: j.performance >= 70 ? 'strong' : j.performance >= 50 ? 'good' : 'weak',
      addedYear: gameYear()
    });
  }

  S.career.job = null;
  S.job = null;
}

function carQuitJob() {
  if (!S.career.job) return;
  if (!confirm('Resign from ' + S.career.job.company + '?')) return;
  const company = S.career.job.company;
  carLeaveCurrentJob('resigned');
  log('🚪 You resigned from ' + company + '.');
  fx({ happiness: -5 });
  S.career.mood = 'frustrated';
  render();
}
window.quitJob = carQuitJob;
window.carQuitJob = carQuitJob;

/* ============================================================
   WORK MODE
   ============================================================ */

function carSetWorkMode(mode) {
  if (!S.career.job) return;
  S.career.workMode = mode;
  S.career.workHardThisYear = (mode === 'hard' || mode === 'overtime');
  log('💼 Work mode set to ' + mode + '.');
  render();
}
window.carSetWorkMode = carSetWorkMode;

/* ============================================================
   ASK FOR RAISE
   ============================================================ */

function carAskForRaise() {
  if (!S.career.job) return;
  const j = S.career.job;
  if (j.performance < 70) {
    log('❌ Your performance is too low to ask for a raise (needs 70+).');
    render(); return;
  }
  if (j.tenure < 1) {
    log('❌ You need at least 1 year tenure to ask for a raise.');
    render(); return;
  }
  if (Math.random() < 0.55) {
    const bump = Math.round(j.salary * (0.08 + Math.random() * 0.10));
    j.salary += bump;
    if (S.job) S.job.salary = j.salary;
    log('💰 Approved! Raise of ' + money(bump) + '. New salary: ' + money(j.salary) + '.');
    fx({ happiness: 8 });
    S.career.mood = 'satisfied';
  } else {
    log('❌ Your manager said no. "Not in the budget this year."');
    fx({ happiness: -3 });
    j.performance = Math.max(0, j.performance - 5);
  }
  render();
}
/* ---------- REQUEST PROMOTION (manual) ---------- */
window.carRequestPromotion = function() {
  if (!S.career.job) return;
  const j = S.career.job;
  const track = carTrackById(j.track);
  if (!track || j.level >= track.levels.length - 1) {
    log('❌ You are at the top of this track.');
    render(); return;
  }
  const nextLevel = track.levels[j.level + 1];
  const reqYears = nextLevel.requirements.years || 0;

  if (j.performance < 80) {
    log('❌ Your manager says: "Your performance is ' + Math.round(j.performance) + '%. Come back when you\'re at 80%+."');
    fx({ happiness: -2 });
    render(); return;
  }
  if (j.tenure < reqYears) {
    log('❌ Your manager says: "You need ' + reqYears + ' years here. You have ' + j.tenure + '."');
    fx({ happiness: -2 });
    render(); return;
  }

  /* Both conditions met — pitch to manager */
  if (!confirm('Request promotion to ' + nextLevel.title + '?\n\nYour performance is strong and you meet the tenure requirement. Your manager will likely say yes.\n\nRisk: pushing hard without a top score can annoy them.')) return;

  /* Success based on performance margin */
  let chance = 0.75;
  if (j.performance >= 95) chance = 0.95;
  else if (j.performance >= 90) chance = 0.88;
  else if (j.performance >= 85) chance = 0.80;

  if (Math.random() < chance) {
       j.level++;
    j.salary = carSalaryForLevel(j.track, j.level);
    j.baseSalaryEGP = j.salary;
    j.title = nextLevel.title;
    if (S.job) { S.job.title = j.title; S.job.salary = j.salary; S.job.level = j.level; }
    j.tenure = 0;
    j.performance = Math.max(60, j.performance - 10);
    log('🎉 PROMOTED to ' + j.title + '! Salary: ' + money(j.salary) + '/year.');
    fx({ happiness: 20, social: 5 });
    S.career.mood = 'satisfied';
    if (j.level === 1 && S.career.jobHistory.length === 0) carAddMilestone('first_promotion', 'First Promotion');
    if (j.level === track.levels.length - 1) carAddMilestone('top_of_ladder', 'Reached top of ' + track.label);
    if (typeof carCheckBranchPoint === 'function') carCheckBranchPoint();
  } else {
    log('❌ Your manager: "Not this time. Give me another quarter of the same output and we\'ll talk."');
    fx({ happiness: -5 });
    j.performance = Math.max(0, j.performance - 3);
  }
  render();
};
window.carAskForRaise = carAskForRaise;

/* ============================================================
   PART-TIME
   ============================================================ */

function carTakePartTime(id) {
  ensureCareerState();
  if (S.career.job) { log('❌ You already have a full-time job.'); return; }
  if (S.career.partTime) { log('❌ You already have a part-time job.'); render(); return; }
  const job = CAR_PARTTIME.find(function(j) { return j.id === id; });
  if (!job) return;

  if (S.age < job.minAge) { log('❌ Age ' + job.minAge + '+ only.'); render(); return; }
 if (job.requiresCar && !(S.cars && S.cars.some(function(c) { return !c.storedIn; }))) {
  log('❌ You need a car for this job (in this country).');
  render(); return;
}
  if (job.requiresBike && !(S.cars && S.cars.length > 0)) { log('❌ You need a bike or car for delivery.'); render(); return; }
  if (job.requiresSmart && S.smarts < job.requiresSmart) { log('❌ Requires smarts ' + job.requiresSmart + '+.'); render(); return; }
  if (job.requiresEnglish && (S.languageScores?.ielts || 0) < job.requiresEnglish) {
    log('❌ Requires IELTS ' + job.requiresEnglish + '+.');
    render(); return;
  }

   S.career.partTime = {
    id: job.id,
    title: job.label,
    salary: carEGP(job.monthlyEGP * 12),
    hoursPerWeek: job.hoursPerWeek,
    affectsGrades: job.affectsGrades,
    startedYear: gameYear()
  };
  log('☕ Started part-time as ' + job.label + ' · ' + money(Math.round(job.monthlyEGP * carRate())) + '/month.');
  render();
}
window.carTakePartTime = carTakePartTime;

function carQuitPartTime() {
  if (!S.career.partTime) return;
  log('Quit ' + S.career.partTime.title + '.');
  S.career.partTime = null;
  render();
}
window.carQuitPartTime = carQuitPartTime;

/* ============================================================
   INTERNSHIP
   ============================================================ */

function carTakeInternship(id) {
  const intern = CAR_INTERNSHIPS.find(function(i) { return i.id === id; });
  if (!intern) return;
  if (!S.uni) { log('❌ Internships require university enrollment.'); return; }
  if (S.career.internships.some(function(i) { return i.id === id; })) {
    log('❌ You already did this internship.'); return;
  }
  if (intern.requiresDegree && S.degree !== intern.requiresDegree) {
    log('❌ Requires ' + intern.requiresDegree + ' degree.'); return;
  }
  S.career.internships.push({
    id: id,
    company: intern.company,
    paid: intern.paid,
    monthlyEGP: intern.monthlyEGP,
    monthsLeft: intern.months,
    performance: 50,
    careerBoost: intern.careerBoost,
    startedYear: gameYear()
  });
  S.career.cv.skill = Math.min(100, S.career.cv.skill + 3);
  log('🎓 Started internship at ' + intern.company + (intern.paid ? ' · ' + money(carEGP(intern.monthlyEGP)) + '/month' : ' (unpaid)') + '.');
  render();
}
window.carTakeInternship = carTakeInternship;

/* ============================================================
   BUSINESS
   ============================================================ */

function carOpenBusiness(typeId) {
  const type = CAR_BUSINESS_TYPES.find(function(t) { return t.id === typeId; });
  if (!type) return;
  
  /* Immigration Check */
  const isHome = S.country === (S.homeCountry || S.country);
  const imStatus = S.immigration ? S.immigration.status : 'citizen_home';
  
  if (!isHome && imStatus !== 'visa_work' && imStatus !== 'pr' && imStatus !== 'citizen') {
    log('❌ You cannot open a business here. You need work authorization or permanent residency.');
    render();
    return;
  } // <--- THIS WAS MISSING

  if (type.requiresDegree && S.degree !== type.requiresDegree) {
    log('❌ Requires ' + type.requiresDegree + ' degree.'); render(); return;
  }
  
  const countryMult = (typeof CAR_COUNTRY_MULT !== 'undefined' && CAR_COUNTRY_MULT[S.country]) || 1.0;
  const cost = carEGP(type.startupEGP * countryMult);

  const name = prompt('Name your ' + type.label + ':', 'My ' + type.label);
  if (!name) return;

  S.wealth -= cost;
  S.career.businesses.push({
    id: 'biz_' + Math.random().toString(36).slice(2, 8),
    typeId: typeId,
    typeLabel: type.label,
    name: name.trim(),
    level: 1,
    employees: [],
    marketing: 0,
    quality: 60,
    revenue: carEGP(type.baseRevenueEGP),
    expenses: carEGP(type.monthlyOverheadEGP),
    monthlyProfit: 0,
    openedYear: gameYear(),
    reputation: 5,
    customers: 100,
    totalProfit: 0,
    incidents: [],
    milestones: []
  });
  log('🏪 Opened "' + name + '" (' + type.label + ') for ' + money(cost) + '.');
  fx({ happiness: 10 });
  carAddMilestone('first_business', 'First Business Opened');
  S.career.tab = 'business';
  render();
}
window.carOpenBusiness = carOpenBusiness;

function carHireStaff(bizId, role) {
  const biz = S.career.businesses.find(function(b) { return b.id === bizId; });
  if (!biz) return;
  const type = CAR_BUSINESS_TYPES.find(function(t) { return t.id === biz.typeId; });
  if (!type || type.staffRoles.indexOf(role) < 0) { log('❌ Role not available for this business.'); return; }
  const salaryDef = CAR_STAFF_SALARIES[role];
  if (!salaryDef) return;
  const salary = carEGP(salaryDef.monthlyEGP);

  const names = ['Mona', 'Hassan', 'Rana', 'Tamer', 'Nour', 'Fady', 'Dina', 'Amir', 'Lamia', 'Sherif', 'Maya', 'Ali'];
  const empName = names[Math.floor(Math.random() * names.length)];

  biz.employees.push({
    id: 'emp_' + Math.random().toString(36).slice(2, 6),
    name: empName,
    role: role,
    salary: salary,
    skill: salaryDef.skill,
    morale: 70,
    hiredYear: gameYear()
  });
  log('👥 Hired ' + empName + ' as ' + role + ' at ' + biz.name + ' · ' + money(salary) + '/month.');
  render();
}
window.carHireStaff = carHireStaff;

function carFireStaff(bizId, idx) {
  const biz = S.career.businesses.find(function(b) { return b.id === bizId; });
  if (!biz) return;
  const emp = biz.employees[idx];
  if (!emp) return;
  if (!confirm('Fire ' + emp.name + ' (' + emp.role + ')?')) return;
  biz.employees.splice(idx, 1);
  log('👋 Fired ' + emp.name + ' from ' + biz.name + '.');
  render();
}
window.carFireStaff = carFireStaff;

function carSetMarketing(bizId) {
  const biz = S.career.businesses.find(function(b) { return b.id === bizId; });
  if (!biz) return;
  const amt = Math.round(Number(prompt('Monthly marketing budget? (Current: ' + money(biz.marketing) + ')', String(biz.marketing))));
  if (isNaN(amt) || amt < 0) return;
  biz.marketing = amt;
  log('📣 Marketing budget set to ' + money(amt) + '/month.');
  render();
}
window.carSetMarketing = carSetMarketing;

function carExpandBusiness(bizId) {
  const biz = S.career.businesses.find(function(b) { return b.id === bizId; });
  if (!biz) return;
  const type = CAR_BUSINESS_TYPES.find(function(t) { return t.id === biz.typeId; });
  if (!type || biz.level >= type.maxLevel) { log('❌ At max level.'); return; }
  const cost = carEGP(Math.round(type.startupEGP * 0.6));
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + ' to expand.'); render(); return; }
  S.wealth -= cost;
  biz.level++;
  biz.revenue = Math.round(biz.revenue * 1.4);
  biz.expenses = Math.round(biz.expenses * 1.3);
  if (biz.level === 2) carAddMilestone('business_expansion', 'First Business Expansion');
  log('📈 Expanded ' + biz.name + ' to level ' + biz.level + '. Revenue up 40%.');
  render();
}
window.carExpandBusiness = carExpandBusiness;

function carSellBusiness(bizId) {
  const biz = S.career.businesses.find(function(b) { return b.id === bizId; });
  if (!biz) return;
  const annualProfit = biz.monthlyProfit * 12;
  const sellPrice = Math.max(carEGP(50000), annualProfit * 2);
  if (!confirm('Sell "' + biz.name + '" for ' + money(sellPrice) + '?')) return;
  S.wealth += sellPrice;
  S.career.businesses = S.career.businesses.filter(function(b) { return b.id !== bizId; });
  log('💰 Sold ' + biz.name + ' for ' + money(sellPrice) + '.');
  render();
}
window.carSellBusiness = carSellBusiness;

/* ============================================================
   OFFERS
   ============================================================ */

window.carAcceptOffer = function(offerId) {
  const offer = S.career.offers.find(function(o) { return o.id === offerId; });
  if (!offer) return;
  carLeaveCurrentJob('accepted offer from ' + offer.company);
  S.career.job = {
    company: offer.company,
    title: offer.title,
    track: offer.track,
    level: offer.level,
    salary: offer.salary,
    baseSalaryEGP: offer.baseSalaryEGP,
    payMult: offer.payMult,
    performance: 50,
    hiredYear: gameYear(),
    tenure: 0,
    benefits: offer.benefits || [],
    stability: 0.85,
    prestige: offer.prestige || 3,
    salaryCurrency: C().currency
  };
  S.job = { id: offer.track, title: offer.title, company: offer.company, salary: offer.salary, level: offer.level, years: 0 };
  S.career.offers = S.career.offers.filter(function(o) { return o.id !== offerId; });
  log('✅ Accepted offer at ' + offer.company + ' for ' + money(offer.salary) + '/year.');
  fx({ happiness: 10 });
  S.career.mood = 'satisfied';
  render();
};

window.carLeverageOffer = function(offerId) {
  const offer = S.career.offers.find(function(o) { return o.id === offerId; });
  if (!offer || !S.career.job) return;
  if (Math.random() < 0.40) {
    const bump = Math.round(S.career.job.salary * 0.15);
    S.career.job.salary += bump;
    if (S.job) S.job.salary = S.career.job.salary;
    log('🎉 Your current employer matched the offer! Raise: ' + money(bump) + '.');
    fx({ happiness: 8 });
  } else {
    log('❌ Your employer called your bluff. "We cannot match that."');
    fx({ happiness: -3 });
    S.career.job.performance = Math.max(0, S.career.job.performance - 5);
  }
  S.career.offers = S.career.offers.filter(function(o) { return o.id !== offerId; });
  render();
};

window.carDeclineOffer = function(offerId) {
  S.career.offers = S.career.offers.filter(function(o) { return o.id !== offerId; });
  log('Declined the offer.');
  render();
};

/* ============================================================
   RETIREMENT
   ============================================================ */

function carRetire() {
  if (!S.career.job) return;
  if (S.age < 60) { log('❌ Must be 60+ to retire voluntarily.'); return; }
  if (!confirm('Retire from ' + S.career.job.company + '?')) return;
  carLeaveCurrentJob('retired');
  S.career.retired = true;
  S.career.pension.retiredYear = gameYear();
  log('🏛 You retired. Pension: ' + money(S.career.pension.accumulated) + '.');
  carAddMilestone('retired', 'Retired');
  render();
}
window.carRetire = carRetire;

/* ============================================================
   NETWORK ACTIONS
   ============================================================ */

function carReachOutMentor() {
  if (!S.career.network.mentor) { log('❌ No mentor yet.'); render(); return; }
  const m = S.career.network.mentor;
  m.bond = Math.min(100, m.bond + 5);
  S.career.cv.skill = Math.min(100, S.career.cv.skill + 2);
  log('💬 Reached out to mentor ' + m.name + '. Learned something useful.');
  render();
}
window.carReachOutMentor = carReachOutMentor;

function carAskOldBossForReference() {
  if (!S.career.network.references.length) { log('❌ No past employers to ask.'); render(); return; }
  const ref = S.career.network.references[S.career.network.references.length - 1];
  log('📧 Asked ' + ref.name + ' for a reference. They said ' + (ref.quality === 'strong' ? 'yes, gladly.' : 'maybe.'));
  render();
}
window.carAskOldBossForReference = carAskOldBossForReference;

function carReconnectColleague(idx) {
  const col = S.career.network.colleagues[idx];
  if (!col) return;
  col.bond = Math.min(100, col.bond + 10);
  fx({ happiness: 2 });
  log('☕ Reconnected with ' + col.name + ' from ' + col.company + '.');
  render();
}
window.carReconnectColleague = carReconnectColleague;

/* ============================================================
   MAIN VIEW
   ============================================================ */

function careerView() {
  ensureCareerState();
  if (!S) return '';
  if (S.age < 15) return '<div class="card"><h3>💼 Career</h3><p class="muted">Available from age 15+.</p></div>';

  if (S.career.retired) return carRenderRetired();

  const mood = carMoodLabel();
  const hasGulfOffer = S.gulfWork && S.gulfWork.offer;
  const inGulf = typeof gulfIsInGulf === 'function' && gulfIsInGulf();
  const isAbroad = typeof expatIsAbroad === 'function' && expatIsAbroad();
  const gulfTabLabel = hasGulfOffer ? '🌍 Gulf 📨' : inGulf ? '🌍 Gulf 🏢' : '🌍 Gulf Jobs';
  const tabs = [
    ['overview', '📋 Overview'],
    ['search', '🔍 Search'],
    ['gulf', gulfTabLabel],
    ['expat', '🇪🇬 Expat Life'],
    ['tracks', '📈 Tracks'],
    ['parttime', '☕ Part-Time'],
    ['business', '🏪 Business'],
    ['interviews', '📝 Interviews' + (S.career.applications.length > 0 ? ' (' + S.career.applications.length + ')' : '')],
    ['offers', '💼 Offers' + (S.career.offers.length > 0 ? ' (' + S.career.offers.length + ')' : '')],
    ['network', '👥 Network' + (S.career.network.mentor ? ' ✓' : '')],
    ['history', '📖 History']
  ];

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#8b5cf615 0%,transparent 100%);border-color:#8b5cf6">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">CAREER · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + carStatusLabel() + '</div>' +
    '<div class="small" style="color:' + mood.color + ';margin-top:2px">' + mood.icon + ' ' + mood.label + '</div></div>' +
    '<div style="font-size:2rem">💼</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (S.career.tab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="carSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

 /* Underground section — renders above other career content if undocumented */
  if (typeof carRenderUnderground === 'function') {
    var underground = carRenderUnderground();
    if (underground) html += underground;
  }

  if (S.career.tab === 'overview') html += carRenderOverview();
  else if (S.career.tab === 'search') html += carRenderSearch();
  else if (S.career.tab === 'gulf') html += (typeof gulfWorkRender === 'function' ? gulfWorkRender() : '<div class="card"><p class="muted small">Gulf system not loaded.</p></div>');
 else if (S.career.tab === 'expat') html += (typeof expatRender === 'function' ? expatRender() : '<div class="card"><p class="muted small">Expat system not loaded.</p></div>');
  else if (S.career.tab === 'tracks') html += carRenderTracks();
  else if (S.career.tab === 'parttime') html += carRenderPartTime();
  else if (S.career.tab === 'business') html += carRenderBusiness();
  else if (S.career.tab === 'interviews') html += carRenderInterviews();
  else if (S.career.tab === 'offers') html += carRenderOffers();
  else if (S.career.tab === 'network') html += carRenderNetwork();
  else if (S.career.tab === 'history') html += carRenderHistory();

  return html;
}

function carStatusLabel() {
  const c = S.career;
  if (c.retired) return 'Retired';
  if (c.job) return c.job.title + ' at ' + c.job.company;
  if (c.partTime) return 'Part-time: ' + c.partTime.title;
  if (S.uni) return 'Student at ' + S.uni.name;
  return 'Unemployed';
}

/* ============================================================
   TAB: OVERVIEW
   ============================================================ */

function carRenderOverview() {
  const c = S.career;

  if (!c.job && !c.partTime) {
    let h = '<div class="card" style="border-color:#fb7185;text-align:center;padding:24px 16px">';
    h += '<div style="font-size:2.5rem;opacity:.5;margin-bottom:8px">💼</div>';
    h += '<h3 style="color:#fb7185">Currently Unemployed</h3>';
    h += '<p class="muted small" style="margin:8px 0 16px">Search for a job or start part-time work.</p>';
    h += '<button class="opt" style="text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="carSetTab(\'search\')">🔍 Find a Full-Time Job</button>';
    h += '<button class="opt" style="text-align:center;margin-top:6px" onclick="carSetTab(\'parttime\')">☕ Browse Part-Time</button>';
    h += '</div>';
    h += carRenderMilestonesSummary();
    return h;
  }

  if (c.partTime && !c.job) {
    let h = '<div class="card" style="border-color:#22d3ee">';
    h += '<h3 style="color:#22d3ee">☕ Part-Time: ' + c.partTime.title + '</h3>';
    h += '<div class="row"><span>Monthly salary</span><b>' + money(Math.round(c.partTime.salary / 12)) + '</b></div>';
    h += '<div class="row"><span>Hours per week</span><b>' + c.partTime.hoursPerWeek + '</b></div>';
    if (c.partTime.affectsGrades) h += '<p class="bad small" style="margin-top:8px">⚠️ Affects grades while studying.</p>';
    h += '<button class="opt" style="margin-top:8px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="carQuitPartTime()">Quit</button>';
    h += '</div>';
    h += carRenderMilestonesSummary();
       /* SESSION 9: Specialty card */
  if (c.job && typeof CAR_BRANCH_OPTIONS !== 'undefined') {
    var job = c.job;
    var branchDef = CAR_BRANCH_OPTIONS[job.track];
    var currentTrack = carTrackById(job.track);
    var currentTrackLabel = currentTrack ? currentTrack.label : job.track;

    if (job.branchChoiceAvailable) {
      /* Player needs to choose */
      h += '<div class="card" style="border-color:#fbbf24;background:#fbbf2410">' +
        '<h4 style="color:#fbbf24;font-size:.88rem">🎓 Specialization Available</h4>' +
        '<p class="muted small" style="margin:6px 0">You have reached the point in your career where you must choose a specialty. This decision shapes your salary trajectory and long-term path.</p>' +
        '<button class="opt" style="width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700;padding:10px;font-size:.78rem" onclick="if(typeof carCheckBranchPoint===\'function\')carCheckBranchPoint();render()">Choose Specialty Now →</button>' +
        '</div>';
    } else if (job.branchChosen) {
      /* Show current specialty + option to change */
      h += '<div class="card" style="border-color:#34d399">' +
        '<h4 style="color:#34d399;font-size:.85rem">🎓 Specialty</h4>' +
        '<div class="row"><span>Current path</span><b>' + currentTrackLabel + '</b></div>' +
        '<div class="row"><span>Title</span><b>' + job.title + '</b></div>' +
        '<div class="row"><span>Salary</span><b class="good">' + money(job.salary) + '/year</b></div>' +
        (job.specializedYear ? '<div class="muted small" style="margin-top:4px">Specialized in ' + job.specializedYear + '</div>' : '') +
        (branchDef ? '<button class="opt" style="margin-top:8px;width:100%;text-align:center;border-color:#fbbf24;color:#fbbf24;font-size:.75rem" onclick="S._showRespecUI=true;render()">Change specialty</button>' : '') +
        '</div>';
    }

    /* Respec panel if requested */
    if (S._showRespecUI && branchDef) {
      h += '<div class="card" style="border-color:#fbbf24;background:#fbbf2410">' +
        '<h4 style="color:#fbbf24;font-size:.85rem">Change Specialty</h4>' +
        '<p class="muted small" style="margin:4px 0">Switching tracks preserves your level progress. Your title and salary will update.</p>';
      branchDef.options.forEach(function(opt) {
        if (opt.trackId === job.track && job.branchChosen) {
          /* Already on this track — skip */
          return;
        }
        h += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="if(typeof carChooseSpecialty===\'function\'){carChooseSpecialty(\'' + opt.trackId + '\');S._showRespecUI=false;render();}">' +
          '<div><b>' + opt.label + '</b></div>' +
          '<div class="muted small">' + opt.desc + '</div></button>';
      });
      h += '<button class="opt" style="width:100%;margin-top:8px;text-align:center;font-size:.75rem;border-color:#666;color:#888" onclick="S._showRespecUI=false;render()">Cancel</button>';
      h += '</div>';
    }
  }
    return h;
  }

  const j = c.job;
  const track = carTrackById(j.track);
  const perfColor = j.performance >= 80 ? '#34d399' : j.performance >= 50 ? '#fbbf24' : '#fb7185';
  const skill = carSkillLevel();
  const trend = carIndustryTrend(track ? track.industry : 'normal');
  const nextLevel = carNextLevel(j);

  const tax = (typeof carComputeTax === 'function') ? carComputeTax(j.salary) : 0;
  const pension = Math.round(j.salary * 0.11);
  const net = j.salary - tax - pension;

  let h = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#8b5cf610 0%,transparent 100%);border-color:#8b5cf6">';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center">';
  h += '<div><div class="muted" style="font-size:.62rem;letter-spacing:.06em">SALARY</div><div class="mono" style="font-weight:700;font-size:.9rem">' + money(j.salary) + '</div><div class="muted" style="font-size:.6rem">per year</div></div>';
  h += '<div><div class="muted" style="font-size:.62rem;letter-spacing:.06em">LEVEL</div><div class="mono" style="font-weight:700;font-size:.9rem">' + (j.level + 1) + '/' + (track ? track.levels.length : 5) + '</div><div class="muted" style="font-size:.6rem">' + j.title + '</div></div>';
  h += '<div><div class="muted" style="font-size:.62rem;letter-spacing:.06em">TENURE</div><div class="mono" style="font-weight:700;font-size:.9rem">' + (j.tenure || 0) + 'y</div><div class="muted" style="font-size:.6rem">since ' + j.hiredYear + '</div></div>';
  h += '</div></div>';

  h += '<div class="card" style="border-color:#8b5cf6">';
  h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
  h += '<div><h3 style="color:#8b5cf6;margin-bottom:2px">' + j.title + '</h3><div class="muted small">' + j.company + '</div></div>';
  h += '<div class="small" style="color:' + trend.color + '">' + trend.icon + ' ' + trend.label + '</div></div>';
  if (j.boss) h += '<div class="row"><span>Manager</span><b>' + j.boss.name + '</b></div>';
  h += '<div class="row"><span>Prestige</span><b>' + j.prestige + ' / 5</b></div>';
  h += '<div class="row"><span>Skill</span><b style="color:' + skill.color + '">' + skill.label + ' (' + S.career.cv.skill + '%)</b></div>';
  h += '</div>';

  h += '<div class="card"><h4 style="font-size:.82rem;color:#34d399;margin-bottom:8px">💰 SALARY BREAKDOWN</h4>';
  h += '<div class="row"><span>Gross</span><b>' + money(j.salary) + '</b></div>';
  if (tax > 0) h += '<div class="row"><span>− Tax</span><b class="bad">' + money(tax) + '</b></div>';
  h += '<div class="row"><span>− Pension (11%)</span><b class="bad">' + money(pension) + '</b></div>';
  h += '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Take-home</b><b class="good">' + money(net) + '</b></div>';
  h += '<div class="row"><span>Per month</span><b>' + money(Math.round(net / 12)) + '</b></div>';
  h += '</div>';

  h += '<div class="card"><h4 style="font-size:.82rem;color:#8b5cf6;margin-bottom:8px">⚙️ WORK MODE</h4>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  var modes = [
    { id: 'slacking', label: '😴 Slacking', desc: '−8% perf' },
    { id: 'normal', label: '🙂 Normal', desc: '+2% perf' },
    { id: 'hard', label: '💪 Hard', desc: '+12% perf' },
    { id: 'overtime', label: '🔥 Overtime', desc: '+18%, +10% pay' }
  ];
  modes.forEach(function(m) {
    var active = c.workMode === m.id;
    h += '<button class="pill ' + (active ? 'on' : '') + '" style="padding:6px;font-size:.68rem" onclick="carSetWorkMode(\'' + m.id + '\')">' + m.label + '<br><span class="muted" style="font-size:.6rem">' + m.desc + '</span></button>';
  });
  h += '</div></div>';

  var reqYears = nextLevel ? (nextLevel.requirements.years || 0) : 0;
  var perfPct = Math.min(100, j.performance / 80 * 100);
  var tenPct = reqYears > 0 ? Math.min(100, j.tenure / reqYears * 100) : 100;

  h += '<div class="card"><h4 style="font-size:.82rem;color:#8b5cf6;margin-bottom:8px">📊 PROMOTION PROGRESS</h4>';
  h += '<div class="muted small" style="margin-bottom:4px">Performance · <b style="color:' + perfColor + '">' + Math.round(j.performance) + '% / 80%</b></div>';
  h += '<div style="height:8px;background:#1a1a2a;border-radius:4px;margin-bottom:10px;overflow:hidden"><div style="height:100%;width:' + perfPct + '%;background:' + perfColor + '"></div></div>';
  if (nextLevel) {
    h += '<div class="muted small" style="margin-bottom:4px">Tenure · <b>' + (j.tenure || 0) + ' / ' + reqYears + ' years</b></div>';
    h += '<div style="height:8px;background:#1a1a2a;border-radius:4px;margin-bottom:10px;overflow:hidden"><div style="height:100%;width:' + tenPct + '%;background:' + (j.tenure >= reqYears ? '#34d399' : '#fbbf24') + '"></div></div>';
    h += '<div class="muted small">Next: <b>' + nextLevel.title + '</b> · ' + money(nextLevel.baseSalaryEGP) + ' base</div>';

    /* Show blocking reason if not ready */
    var _perfOK = j.performance >= 80;
    var _tenureOK = j.tenure >= reqYears;
    if (!_perfOK) {
      h += '<div class="muted small" style="color:#fb7185;margin-top:6px">⚠️ Need +' + Math.round(80 - j.performance) + '% more performance</div>';
    }
    if (!_tenureOK) {
      h += '<div class="muted small" style="color:#fbbf24;margin-top:4px">⏳ Need ' + (reqYears - j.tenure) + ' more year(s) of tenure</div>';
    }
    if (_perfOK && _tenureOK) {
      h += '<div style="margin-top:8px;padding:8px;background:#34d39920;border-left:3px solid #34d399;border-radius:6px">' +
        '<b style="color:#34d399;font-size:.78rem">✅ Requirements met</b>' +
        '<div class="muted small" style="margin-top:2px">Guaranteed promotion at year end — or request now for immediate effect.</div></div>';
      h += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700" onclick="carRequestPromotion()">🚀 Request Promotion to ' + nextLevel.title + '</button>';
    }
  } else {
    h += '<div class="muted small">You are at the top of this track.</div>';
  }
  h += '<button class="opt" style="margin-top:8px;width:100%;text-align:center" onclick="carAskForRaise()">💰 Ask for raise</button>';
  h += '</div>';

  if (c.reviews.length) {
    var r = c.reviews[c.reviews.length - 1];
    var rColor = r.rating >= 4 ? '#34d399' : r.rating === 3 ? '#fbbf24' : '#fb7185';
    h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h4 style="font-size:.82rem;color:#8b5cf6">📄 REVIEW · ' + r.year + '</h4><b style="color:' + rColor + '">' + r.rating + '/5</b></div>';
    h += '<p class="muted small" style="margin-top:4px;font-style:italic">"' + r.comment + '"</p></div>';
  }

  if (c.imtyaz && c.imtyaz.monthsLeft > 0) {
    h += '<div class="card" style="border-color:#fbbf24"><h4 style="font-size:.82rem;color:#fbbf24">🏥 IMTYAZ · ' + c.imtyaz.monthsLeft + ' months left</h4></div>';
  }

  if (j.benefits && j.benefits.length) {
    h += '<div class="card"><h4 style="font-size:.82rem;color:#8b5cf6;margin-bottom:6px">🎁 BENEFITS</h4>';
    j.benefits.forEach(function(b) {
      var def = CAR_BENEFITS[b];
      if (def) h += '<div style="padding:4px 0;font-size:.78rem"><b>' + def.label + '</b><div class="muted" style="font-size:.7rem">' + def.value + '</div></div>';
    });
    h += '</div>';
  }

  h += carRenderMilestonesSummary();

  h += '<div class="card"><button class="opt" style="width:100%;text-align:center;border-color:#fb7185;color:#fb7185" onclick="carQuitJob()">🚪 Resign</button></div>';

  return h;
}
function carRenderMilestonesSummary() {
  if (!S.career.milestones.length) return '';
  let html = '<div class="card"><h3>🏆 Career Milestones</h3>';
  S.career.milestones.slice(-5).reverse().forEach(function(m) {
    html += '<div class="row"><span>' + m.label + '</span><span class="muted small">' + m.year + '</span></div>';
  });
  html += '</div>';
  return html;
}

/* ============================================================
   TAB: SEARCH
   ============================================================ */

function carRenderSearch() {
  /* If undocumented, explain and offer alternative */
  if (typeof isUndocumented === 'function' && isUndocumented()) {
    let html = '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">🔍 Job Search — Blocked</h3>' +
      '<p class="muted small">You are <b>undocumented</b> in ' + C().name + '. Legal employers cannot hire you — they will be fined and you will be deported.</p>' +
      '<p class="muted small" style="margin-top:6px">Options to fix this:</p>' +
      '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="switchTab(\'immigration\')">📋 Fix immigration status</button>' +
      '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="S.career.tab=\'overview\';render()">💸 Take cash work (Underground section)</button>' +
      '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="switchTab(\'marriage\')">💍 Marry a citizen</button>' +
      '</div>';

    /* Fake documents path — high risk, high reward */
    html += '<div class="card" style="border-color:#fbbf24;background:#fbbf2410">' +
      '<h4 style="color:#fbbf24;font-size:.85rem">⚠️ Desperate Option: Fake Documents</h4>' +
      '<p class="muted small">Buy forged work papers and apply for a real job. If caught: permanent record + deportation + 10-year ban.</p>';

    const cost = Math.round(50000 * ((C().rate || 1) / 52.7));
    const canAfford = S.wealth >= cost;
    html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.75rem;' + (canAfford ? 'border-color:#fbbf24;color:#fbbf24' : 'opacity:.5') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="carTryFakeDocs()">Buy forged papers (' + money(cost) + ')</button>';
    html += '</div>';
    return html;
  }

  let html = '<div class="card"><h3>🔍 Job Search</h3>' +
    '<p class="muted small">Only jobs you qualify for are shown. Applications go through 3 interview rounds.</p></div>';
  const visibleTracks = CAR_TRACKS.filter(function(t) {
    if (t.id === 'medicine') return S.degree === 'medicine';
    if (t.id === 'academia') return S.degree && S.uni && S.uni.gpa >= 3.5;
    if (t.id === 'entry') return true;
    if (t.requiresDegree) return S.degree === t.requiresDegree;
    return true;
  });

  visibleTracks.forEach(function(track) {
    const check = carCanApplyTrack(track.id);
    if (!check.ok) {
      html += '<div class="card" style="opacity:.5"><div style="font-weight:700">' + track.label + '</div>' +
        '<div class="bad small">' + check.reason + '</div></div>';
      return;
    }
    const companies = carCompaniesFor(track.industry);
    if (!companies.length) return;

    const level = track.levels[0];
    const salaryRange = companies.map(function(c) { return Math.round(level.baseSalaryEGP * c.payMult); });
    const minSal = Math.min.apply(null, salaryRange);
    const maxSal = Math.max.apply(null, salaryRange);

    const trend = carIndustryTrend(track.industry);

    html += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<h4 style="font-size:.9rem;color:#8b5cf6">' + track.label + '</h4>' +
      '<div class="small" style="color:' + trend.color + '">' + trend.icon + ' ' + trend.label + '</div></div>' +
      '<div class="muted small">Starting: ' + money(minSal) + ' - ' + money(maxSal) + '/year</div>';
    if (check.note) html += '<div class="muted small" style="color:#fbbf24">' + check.note + '</div>';
    companies.forEach(function(company, idx) {
      const salary = Math.round(level.baseSalaryEGP * company.payMult);
      const appliedHere = S.career.applications.some(function(a) {
        return a.trackId === track.id && a.companyName === company.name;
      });
      const workedHere = S.career.jobHistory.some(function(h) {
        return h.company === company.name;
      });

      html += '<div style="margin-top:8px;padding:8px;background:#14141f;border-radius:6px">' +
        '<div style="display:flex;justify-content:space-between"><b>' + company.name + (workedHere ? ' ⭐' : '') + '</b><span>' + money(salary) + '/yr</span></div>' +
        '<div class="muted small">' + level.title + ' · Prestige ' + company.prestige + '/5 · Stability ' + Math.round(company.stability * 100) + '%</div>' +
        '<div class="muted small" style="color:#8b5cf6">Perks: ' + company.benefits.map(function(b) { return (CAR_BENEFITS[b] || {}).label || b; }).join(', ') + '</div>' +
        (appliedHere ? '<div class="muted small" style="color:#fbbf24;margin-top:4px">📝 Application in progress</div>' :
          '<button class="opt" style="margin-top:6px;padding:6px;font-size:.72rem;width:100%;text-align:center" onclick="carApplyToJob(\'' + track.id + '\',' + idx + ')">Apply</button>') +
        '</div>';
    });
    html += '</div>';
  });

  return html;
}

/* ============================================================
   TAB: TRACKS
   ============================================================ */

function carRenderTracks() {
  let html = '<div class="card"><h3>📈 Career Ladders</h3>' +
    '<p class="muted small">Full progression paths for each career track.</p></div>';

  CAR_TRACKS.forEach(function(track) {
    const isPlayerTrack = track.id === carPlayerTrack();
    const isCurrentJob = S.career.job && S.career.job.track === track.id;
    html += '<div class="card" style="' + (isPlayerTrack ? 'border-color:#8b5cf6' : '') + '">' +
      '<h4 style="font-size:.9rem;color:#8b5cf6">' + track.label + (isPlayerTrack ? ' ⭐' : '') + '</h4>' +
      (track.requiresDegree ? '<div class="muted small">Requires: ' + track.requiresDegree + ' degree</div>' : '') +
      (track.requiresGPA ? '<div class="muted small">Requires: GPA ' + track.requiresGPA + '+</div>' : '') +
      (track.requiresImtyaz ? '<div class="muted small" style="color:#fbbf24">⚠️ Requires Imtyaz completion</div>' : '') +
      '<div style="margin-top:8px">';
    track.levels.forEach(function(level, idx) {
      const isCurrent = isCurrentJob && S.career.job.level === idx;
      html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a;' + (isCurrent ? 'background:#8b5cf610;padding-left:6px;border-radius:4px' : '') + '">' +
        '<div style="display:flex;justify-content:space-between"><b>' + level.title + (isCurrent ? ' ← you' : '') + '</b><span>' + money(level.baseSalaryEGP) + '/yr</span></div>' +
        '<div class="muted small">' + level.desc + '</div>' +
        (level.requirements.years > 0 ? '<div class="muted small" style="color:#fbbf24">Requires ' + level.requirements.years + '+ years experience</div>' : '') +
        '</div>';
    });
    html += '</div></div>';
  });

  return html;
}

/* ============================================================
   TAB: PART-TIME
   ============================================================ */

function carRenderPartTime() {
  if (S.career.job) return '<div class="card"><h3>☕ Part-Time</h3><p class="muted small">You have a full-time job. Quit it first to take part-time work.</p></div>';

  let html = '';
  if (S.career.partTime) {
    html += '<div class="card" style="border-color:#22d3ee"><h3 style="color:#22d3ee">☕ Current Part-Time</h3>' +
      '<div class="row"><span>Job</span><b>' + S.career.partTime.title + '</b></div>' +
      '<div class="row"><span>Monthly</span><b>' + money(Math.round(S.career.partTime.salary / 12)) + '</b></div>' +
      '<div class="row"><span>Hours/week</span><b>' + S.career.partTime.hoursPerWeek + '</b></div>' +
      (S.career.partTime.affectsGrades ? '<p class="bad small" style="margin-top:6px">⚠️ Affects grades</p>' : '') +
      '<button class="opt" style="margin-top:8px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="carQuitPartTime()">Quit</button></div>';
  }

  html += '<div class="card"><h3>Available Part-Time Jobs</h3>' +
    '<p class="muted small">Great for students or while between full-time jobs.</p>';
  CAR_PARTTIME.forEach(function(job) {
    if (S.career.partTime && S.career.partTime.id === job.id) return;
    const monthlyLocal = carEGP(job.monthlyEGP);
    html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:8px;font-size:.75rem" onclick="carTakePartTime(\'' + job.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + job.label + '</b><span>' + money(monthlyLocal) + '/mo</span></div>' +
      '<div class="muted small">' + job.hoursPerWeek + 'h/week · Age ' + job.minAge + '+' +
      (job.requiresCar ? ' · Needs car' : '') +
      (job.requiresBike ? ' · Needs bike/car' : '') +
      (job.requiresSmart ? ' · Smarts ' + job.requiresSmart + '+' : '') +
      (job.affectsGrades ? ' · ⚠️ affects grades' : '') +
      '</div></button>';
  });
  html += '</div>';

  if (S.uni) {
    html += '<div class="card"><h3>🎓 Internships</h3>' +
      '<p class="muted small">During university. Boost your CV for future job applications.</p>';
    CAR_INTERNSHIPS.forEach(function(intern) {
      if (S.career.internships.some(function(i) { return i.id === intern.id; })) {
        html += '<div class="row"><span>' + intern.company + ' (' + intern.label + ')</span><b class="good">✓ Done</b></div>';
        return;
      }
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="carTakeInternship(\'' + intern.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + intern.company + '</b><span>' + (intern.paid ? money(carEGP(intern.monthlyEGP)) + '/mo' : 'Unpaid') + '</span></div>' +
        '<div class="muted small">' + intern.months + ' months · CV boost +' + Math.round(intern.careerBoost * 100) + '%</div></button>';
    });
    html += '</div>';
  }

  return html;
}

/* ============================================================
   TAB: BUSINESS
   ============================================================ */

function carRenderBusiness() {
  let html = '<div class="card"><h3>🏪 Your Businesses</h3>';
  if (S.career.businesses.length === 0) {
    html += '<p class="muted small">No businesses yet.</p>';
  } else {
    S.career.businesses.forEach(function(biz) {
      const staffCost = biz.employees.reduce(function(s, e) { return s + e.salary; }, 0);
      const profit = biz.revenue - biz.expenses - biz.marketing - staffCost;
      biz.monthlyProfit = profit;
      const type = CAR_BUSINESS_TYPES.find(function(t) { return t.id === biz.typeId; });
      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + biz.name + '</b><span>' + (type ? type.label : '') + '</span></div>' +
        '<div class="row"><span>Level</span><b>' + biz.level + ' / ' + (type ? type.maxLevel : 5) + '</b></div>' +
        '<div class="row"><span>Monthly revenue</span><b class="good">' + money(biz.revenue) + '</b></div>' +
        '<div class="row"><span>Monthly expenses</span><b class="bad">' + money(biz.expenses + biz.marketing + staffCost) + '</b></div>' +
        '<div class="row"><span>Monthly profit</span><b class="' + (profit > 0 ? 'good' : 'bad') + '">' + money(profit) + '</b></div>' +
        '<div class="row"><span>Reputation</span><b>' + biz.reputation + ' / 10</b></div>' +
        '<div class="row"><span>Staff</span><b>' + biz.employees.length + ' employee(s)</b></div>';

      /* Employees */
      if (biz.employees.length > 0) {
        html += '<div style="margin-top:8px;padding:6px;background:#0f0f1a;border-radius:6px">' +
          '<div class="small" style="color:#8b5cf6;font-weight:700;margin-bottom:4px">Staff:</div>';
        biz.employees.forEach(function(emp, idx) {
          html += '<div class="row" style="font-size:.72rem">' +
            '<span>' + emp.name + ' · ' + emp.role + ' · skill ' + emp.skill + '</span>' +
            '<span>' + money(emp.salary) + '/mo ' +
            '<button class="pill" style="padding:2px 6px;font-size:.65rem;margin-left:4px;border-color:#fb7185;color:#fb7185" onclick="carFireStaff(\'' + biz.id + '\',' + idx + ')">✕</button></span>' +
            '</div>';
        });
        html += '</div>';
      }

      html += '<div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="carSetMarketing(\'' + biz.id + '\')">📣 Marketing</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="carExpandBusiness(\'' + biz.id + '\')">📈 Expand</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem;border-color:#fb7185;color:#fb7185" onclick="carSellBusiness(\'' + biz.id + '\')">💰 Sell</button>' +
        '</div>';

      if (type) {
        html += '<div style="margin-top:6px"><b style="font-size:.72rem;color:#8b5cf6">Hire staff:</b><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">';
        type.staffRoles.forEach(function(role) {
          const sal = CAR_STAFF_SALARIES[role];
          if (!sal) return;
          html += '<button class="opt" style="padding:4px 8px;font-size:.68rem" onclick="carHireStaff(\'' + biz.id + '\',\'' + role + '\')">' + role + ' · ' + money(carEGP(sal.monthlyEGP)) + '</button>';
        });
        html += '</div></div>';
      }

      html += '</div>';
    });
  }
  html += '</div>';

  html += '<div class="card"><h3>Open a New Business</h3>';
  CAR_BUSINESS_TYPES.forEach(function(type) {
    const cost = carEGP(type.startupEGP);
    const canAfford = S.wealth >= cost;
    html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:8px;font-size:.75rem;' + (canAfford ? '' : 'opacity:.5') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="carOpenBusiness(\'' + type.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + type.label + '</b><span>' + money(cost) + '</span></div>' +
      '<div class="muted small">' + type.desc + ' · Base revenue ' + money(carEGP(type.baseRevenueEGP)) + '/mo · Overhead ' + money(carEGP(type.monthlyOverheadEGP)) + '/mo</div>' +
      (type.requiresDegree ? '<div class="bad small">Requires ' + type.requiresDegree + ' degree</div>' : '') +
      '</button>';
  });
  html += '</div>';

  return html;
}

/* ============================================================
   TAB: INTERVIEWS
   ============================================================ */

function carRenderInterviews() {
  let html = '<div class="card"><h3>📝 Pending Applications</h3>';
  if (S.career.applications.length === 0) {
    html += '<p class="muted small">No applications in progress. Search for a job to apply.</p></div>';
    return html;
  }
  S.career.applications.forEach(function(app) {
    const roundDef = CAR_INTERVIEW_ROUNDS[app.round];
    html += '<div class="card" style="padding:10px;border-color:#fbbf24">' +
      '<div style="display:flex;justify-content:space-between"><b>' + app.companyName + '</b><span>' + money(app.baseSalary) + '/yr</span></div>' +
      '<div class="muted small">' + app.title + ' · Round ' + (app.round + 1) + ' of ' + CAR_INTERVIEW_ROUNDS.length + '</div>' +
      '<div class="muted small">Interviewer: ' + app.interviewer + '</div>' +
      (roundDef ? '<div class="muted small" style="color:#fbbf24;margin-top:4px">Next: ' + roundDef.label + '</div>' : '');

    /* Show round scores */
    if (app.roundScores.length > 0) {
      html += '<div style="margin-top:6px;padding:6px;background:#0f0f1a;border-radius:6px">';
      app.roundScores.forEach(function(rs) {
        html += '<div class="row" style="font-size:.72rem"><span>Round ' + (rs.round + 1) + '</span><b class="' + (rs.passed ? 'good' : 'bad') + '">' + rs.score + '% ' + (rs.passed ? '✓' : '✗') + '</b></div>';
      });
      html += '</div>';
    }

    html += '<div style="display:flex;gap:6px;margin-top:8px">' +
      '<button class="opt" style="flex:1;text-align:center;padding:6px;font-size:.72rem;background:#fbbf24;color:#000;font-weight:700" onclick="carAdvanceRound(\'' + app.id + '\')">Attend ' + (roundDef ? roundDef.label : 'round') + '</button>' +
      '<button class="opt" style="flex:1;text-align:center;padding:6px;font-size:.72rem" onclick="carAdvanceAllRounds(\'' + app.id + '\')">Attend all</button>' +
      '</div>' +
      '</div>';
  });
  html += '</div>';
  return html;
}

/* ============================================================
   TAB: OFFERS
   ============================================================ */

function carRenderOffers() {
  const currentCountry = S.country;
  const allOffers = S.career.offers || [];
  const validOffers = allOffers.filter(function(o) { return !o.country || o.country === currentCountry; });
  const staleOffers = allOffers.filter(function(o) { return o.country && o.country !== currentCountry; });

  let html = '<div class="card"><h3>💼 Offers</h3>';
  if (validOffers.length === 0 && staleOffers.length === 0) {
    html += '<p class="muted small">No pending offers. Perform well to attract competitors.</p></div>';
    return html;
  }
  if (validOffers.length === 0) {
    html += '<p class="muted small">No pending offers in your current country.</p></div>';
    return html;
  }
  html += '</div>';

  validOffers.forEach(function(offer) {
    const current = S.career.job;
    const diff = current ? offer.salary - current.salary : offer.salary;
    const diffColor = diff > 0 ? '#34d399' : '#fb7185';
    const diffPct = current && current.salary > 0 ? Math.round((diff / current.salary) * 100) : 0;

    html += '<div class="card" style="padding:10px;border-color:#34d399">' +
      '<div style="display:flex;justify-content:space-between"><b>' + offer.company + '</b><span class="good">' + money(offer.salary) + '/yr</span></div>' +
      '<div class="muted small">' + offer.title + ' · Level ' + (offer.level + 1) + '</div>' +
      '<div class="muted small">' + offer.message + '</div>';

    if (current) {
      html += '<div style="margin-top:8px;padding:6px;background:#0f0f1a;border-radius:6px">' +
        '<div class="row" style="font-size:.72rem"><span>Current salary</span><b>' + money(current.salary) + '</b></div>' +
        '<div class="row" style="font-size:.72rem"><span>New offer</span><b>' + money(offer.salary) + '</b></div>' +
        '<div class="row" style="font-size:.72rem"><span>Difference</span><b style="color:' + diffColor + '">' + (diff > 0 ? '+' : '') + money(diff) + ' (' + (diffPct > 0 ? '+' : '') + diffPct + '%)</b></div>' +
        '</div>';
    }

    html += '<div style="display:flex;gap:6px;margin-top:8px">' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;background:#34d399;color:#000;font-weight:700" onclick="carAcceptOffer(\'' + offer.id + '\')">Accept</button>' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="carLeverageOffer(\'' + offer.id + '\')">Leverage</button>' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="carDeclineOffer(\'' + offer.id + '\')">Decline</button>' +
      '</div></div>';
  });

  if (staleOffers.length > 0) {
    html += '<div class="card" style="border-color:#666;opacity:.6"><h4 style="font-size:.8rem;color:#888">📮 Offers from other countries (' + staleOffers.length + ')</h4>' +
      '<p class="muted small">You must relocate to accept these. They will expire automatically.</p>';
    staleOffers.forEach(function(offer) {
      const cName = COUNTRIES[offer.country] ? COUNTRIES[offer.country].name : offer.country;
      html += '<div class="row" style="font-size:.75rem"><span>' + offer.company + '</span><b class="muted">' + cName + '</b></div>';
    });
    html += '</div>';
  }
  return html;
}

/* ============================================================
   TAB: NETWORK
   ============================================================ */

function carRenderNetwork() {
  let html = '';

  /* Mentor */
  html += '<div class="card"><h3>🎓 Mentor</h3>';
  if (S.career.network.mentor) {
    const m = S.career.network.mentor;
    html += '<div class="row"><span>Name</span><b>' + m.name + '</b></div>' +
      '<div class="row"><span>Role</span><b>' + m.role + '</b></div>' +
      '<div class="row"><span>Bond</span><b>' + m.bond + '%</b></div>' +
      '<button class="opt" style="margin-top:8px;width:100%;text-align:center;padding:6px;font-size:.75rem" onclick="carReachOutMentor()">💬 Reach out</button>';
  } else {
    html += '<p class="muted small">No mentor yet. Mentors appear as you gain experience.</p>';
  }
  html += '</div>';

  /* References */
  html += '<div class="card"><h3>📧 References</h3>';
  if (S.career.network.references.length === 0) {
    html += '<p class="muted small">No references yet. Work at a job 2+ years to get one.</p>';
  } else {
    S.career.network.references.forEach(function(ref) {
      html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">' +
        '<b>' + ref.name + '</b> · ' + ref.title +
        '<div class="muted small">' + ref.years + ' years · Quality: <span class="' + (ref.quality === 'strong' ? 'good' : ref.quality === 'good' ? '' : 'bad') + '">' + ref.quality + '</span></div>' +
        '</div>';
    });
  }
  html += '</div>';

  /* Colleagues */
  html += '<div class="card"><h3>👥 Colleagues</h3>';
  if (S.career.network.colleagues.length === 0) {
    html += '<p class="muted small">No colleagues tracked yet.</p>';
  } else {
    S.career.network.colleagues.forEach(function(col, idx) {
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + col.name + '</b><span class="muted small">' + col.bond + '%</span></div>' +
        '<div class="muted small">' + col.role + ' · ' + col.company + ' · Met ' + col.metYear + '</div>' +
        '<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.7rem" onclick="carReconnectColleague(' + idx + ')">☕ Reconnect</button>' +
        '</div>';
    });
  }
  html += '</div>';

  /* CV */
  const skill = carSkillLevel();
  html += '<div class="card"><h3>📄 Your CV</h3>' +
    '<div class="row"><span>Skill level</span><b style="color:' + skill.color + '">' + skill.label + '</b></div>' +
    '<div class="row"><span>Years worked</span><b>' + S.career.cv.experience + '</b></div>' +
    '<div class="row"><span>Internships</span><b>' + S.career.internships.length + '</b></div>' +
    '<div class="row"><span>Job history</span><b>' + S.career.jobHistory.length + ' past job(s)</b></div>' +
    '<div class="row"><span>References</span><b>' + S.career.network.references.length + '</b></div>' +
    '</div>';

  return html;
}

/* ============================================================
   TAB: HISTORY
   ============================================================ */

function carRenderHistory() {
  let html = '<div class="card"><h3>📖 Job History</h3>';
  if (S.career.jobHistory.length === 0) {
    html += '<p class="muted small">No past jobs yet.</p>';
  } else {
    S.career.jobHistory.slice().reverse().forEach(function(j) {
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-weight:700">' + j.title + ' · ' + j.company + '</div>' +
        '<div class="muted small">' + j.from + ' - ' + j.to + ' · ' + money(j.salary) + '/yr · ' + j.reason + '</div>' +
        '</div>';
    });
  }
  html += '</div>';

  /* Pension detailed */
  html += '<div class="card"><h3>🏛 Pension</h3>' +
    '<div class="row"><span>Accumulated</span><b>' + money(S.career.pension.accumulated) + '</b></div>' +
    '<div class="row"><span>Final salary</span><b>' + money(S.career.pension.finalSalary) + '</b></div>';

  if (S.career.pension.byYear.length > 0) {
    html += '<h4 style="font-size:.78rem;color:#8b5cf6;margin-top:10px">Year-by-year</h4>';
    S.career.pension.byYear.forEach(function(entry) {
      html += '<div class="row" style="font-size:.75rem"><span>' + entry.year + ' · ' + entry.from + '</span><b>' + money(entry.amount) + '</b></div>';
    });
  }

  html += '<p class="muted small" style="margin-top:8px">Pension accrues 5% of salary per year employed. Retire at 60 (voluntary) or 67 (forced).</p>';
  if (S.age >= 60 && S.career.job) {
    html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="carRetire()">Retire now</button>';
  }
  html += '</div>';

  /* Reviews */
  if (S.career.reviews.length > 0) {
    html += '<div class="card"><h3>📄 Performance Reviews</h3>';
    S.career.reviews.slice().reverse().forEach(function(r) {
      html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + r.year + '</b><span>' + r.rating + ' / 5</span></div>' +
        '<div class="muted small">"' + r.comment + '"</div>' +
        (r.raise > 0 ? '<div class="muted small good">Raise: +' + money(r.raise) + '</div>' : '') +
        '</div>';
    });
    html += '</div>';
  }

  /* Milestones timeline */
  if (S.career.milestones.length > 0) {
    html += '<div class="card"><h3>🏆 Career Timeline</h3>';
    S.career.milestones.forEach(function(m) {
      html += '<div class="row"><span>' + m.label + '</span><span class="muted small">' + m.year + '</span></div>';
    });
    html += '</div>';
  }

  return html;
}

/* ============================================================
   RETIRED VIEW
   ============================================================ */

function carRenderRetired() {
  return '<div class="card"><h3>🏛 Retired</h3>' +
    '<div class="row"><span>Retired since</span><b>' + S.career.pension.retiredYear + '</b></div>' +
    '<div class="row"><span>Pension</span><b>' + money(S.career.pension.accumulated) + '</b></div>' +
    '<p class="muted small" style="margin-top:10px">Enjoy your retirement. You can still manage businesses.</p></div>' +
    carRenderBusiness();
}

/* ============================================================
   LEGACY applyForJob (backward compat)
   ============================================================ */

window.applyForJob = function(jobId) {
  const track = CAR_TRACKS.find(function(t) { return t.id === jobId; });
  if (track) { carSetTab('search'); return; }
  const job = C().jobs ? C().jobs.find(function(j) { return j.id === jobId; }) : null;
  if (!job) return;
  carApplyToJob('entry', 0);
};

/* ============================================================
   YEAR TICK
   ============================================================ */

GameHooks.on('year', function() {
  ensureCareerState();
  if (!S) return;
  const year = gameYear();
  const c = S.career;

  /* Part-time income */
  if (c.partTime) {
    S.wealth += c.partTime.salary;
    log('☕ Part-time income: ' + money(c.partTime.salary) + '.');
    if (c.partTime.affectsGrades && S.uni) {
      S.smarts = Math.max(0, S.smarts - 1);
    }
  }

  /* Internships */
  c.internships = c.internships.filter(function(intern) {
    intern.monthsLeft--;
    if (intern.paid) S.wealth += carEGP(intern.monthlyEGP);
    if (intern.monthsLeft <= 0) {
      log('🎓 Completed internship at ' + intern.company + '.');
      if (intern.performance > 80 && Math.random() < 0.6) {
        log('💼 ' + intern.company + ' offered you a junior role!');
      }
      return false;
    }
    return true;
  });

  /* Full-time job */
  if (c.job) {
    const j = c.job;
    j.tenure = (j.tenure || 0) + 1;
    if (S.job) S.job.years = j.tenure;

        /* Salary already paid by engine's ageUp(). Track for records only. */
    c.lastSalary = j.salary;

    /* Auto-enroll in mandatory National Social Insurance if not enrolled */
    if (S.bank && S.bank.pension && Array.isArray(S.bank.pension.active) && S.bank.pension.active.length === 0) {
      var pPool = (typeof PENSION_PRODUCTS !== 'undefined' && (PENSION_PRODUCTS[S.country] || PENSION_PRODUCTS.egy)) || [];
      var nationalPlan = pPool.find(function(p) {
        return p.id === 'national_pension' || (p.name && p.name.toLowerCase().indexOf('national') >= 0);
      });
      if (nationalPlan) {
        var monthlyContrib = Math.round((j.salary / 12) * (nationalPlan.contributionRate || 0.11));
        S.bank.pension.active.push({
          id: 'pen_national_' + Math.random().toString(36).slice(2, 6),
          productId: nationalPlan.id,
          name: nationalPlan.name,
          provider: nationalPlan.provider || 'Government',
          monthlyContribution: monthlyContrib,
          value: 0,
          startedYear: gameYear()
        });
        log('🏛 Auto-enrolled in ' + nationalPlan.name + ' (mandatory for employees). Monthly: ' + money(monthlyContrib) + '.');
      }
    }
    /* Work mode effects */
    let perfChange = 0;
    let happinessChange = 0;
    let healthChange = 0;
    if (c.workMode === 'slacking') {
      perfChange = -8;
      happinessChange = 3;
      healthChange = 1;
    } else if (c.workMode === 'normal') {
      perfChange = 2;
    } else if (c.workMode === 'hard') {
      perfChange = 12;
      happinessChange = -3;
      healthChange = -1;
    } else if (c.workMode === 'overtime') {
      perfChange = 18;
      happinessChange = -8;
      healthChange = -3;
      const overtimePay = Math.round(j.salary * 0.10);
      S.wealth += overtimePay;
      log('💼 Overtime bonus: ' + money(overtimePay) + '.');
    }
    /* Apply work mode effects */
    j.performance = Math.max(0, Math.min(100, j.performance + perfChange));
    if (happinessChange !== 0) fx({ happiness: happinessChange });
    if (healthChange !== 0) fx({ health: healthChange });
            
    /* Mood auto-recovery based on performance */
    if (j.performance >= 75) {
      c.mood = 'satisfied';
    } else if (j.performance >= 55 && c.mood === 'frustrated') {
      c.mood = 'neutral';
    } else if (j.performance >= 55 && c.mood === 'neutral') {
      c.mood = 'ambitious';
    } else if (j.performance < 35) {
      c.mood = 'frustrated';
    }

    /* Imtyaz progress */
    if (c.imtyaz.monthsLeft > 0) {
      c.imtyaz.monthsLeft -= 12;
      if (c.imtyaz.monthsLeft <= 0) {
        c.imtyaz.done = true;
        log('🏥 Imtyaz training completed! You can now pursue specialist roles.');
        fx({ happiness: 10 });
        carAddMilestone('imtyaz_done', 'Imtyaz Completed');
      }
    }

    /* Annual performance review */
    if (year - c.lastReviewYear >= 1 && j.tenure >= 1) {
      c.lastReviewYear = year;
      carConductReview(j);
    }

       /* Promotion check — GUARANTEED when requirements met */
    const track = carTrackById(j.track);
    if (track && j.level < track.levels.length - 1) {
      const nextLevel = track.levels[j.level + 1];
      const reqYears = nextLevel.requirements.years || 0;
      const perfOK = j.performance >= 80;
      const tenureOK = j.tenure >= reqYears;

            if (perfOK && tenureOK) {
        /* Guaranteed promotion — no random gate */
        j.level++;
        j.salary = carSalaryForLevel(j.track, j.level);
        j.baseSalaryEGP = j.salary;
        j.title = nextLevel.title;
        if (S.job) { S.job.title = j.title; S.job.salary = j.salary; S.job.level = j.level; }
        log('🎉 PROMOTED to ' + j.title + '! Salary: ' + money(j.salary) + '/year.');
        fx({ happiness: 15 });
        c.mood = 'satisfied';
        if (j.level === 1 && c.jobHistory.length === 0) carAddMilestone('first_promotion', 'First Promotion');
        if (j.level === track.levels.length - 1) carAddMilestone('top_of_ladder', 'Reached top of ' + track.label);
        /* Reset perf slightly after promotion — new role, back to learning */
        j.performance = Math.max(60, j.performance - 10);
        j.tenure = 0;
        if (S.job) S.job.years = 0;
        if (typeof carCheckBranchPoint === 'function') carCheckBranchPoint();
      }else if (j.tenure >= reqYears + 3 && !perfOK) {
        /* Long tenure, low performance — manager conversation */
        if (Math.random() < 0.5) {
          log('⚠️ Your manager pulled you aside about performance. "You\'ve been here ' + j.tenure + ' years. We need to see more."');
          j.performance = Math.max(0, j.performance - 5);
        }
      }
    }
       /* Firing check — now with a pending event */
    if (j.performance < 15) {
      if (Math.random() < 0.5) {
        const companyName = j.company;
        const titleName = j.title;
        carLeaveCurrentJob('fired');
        fx({ happiness: -20 });
        c.mood = 'frustrated';
        carAddMilestone('fired', 'First Time Fired');
        S.pending = {
          title: '🚨 You Have Been Fired',
          text: 'Your manager at ' + companyName + ' (' + titleName + ') called you in. "We\'re letting you go. Performance has been poor for too long."\n\nYou are now unemployed. Check the Job Search tab to find new work.',
          choices: [
            { label: 'Accept it and move on', effect: function(s) { fx({ happiness: 3 }); } },
            { label: 'Ask for another chance', effect: function(s) { log('😔 They refused. The decision was final.'); fx({ happiness: -5 }); } }
          ]
        };
        S.evId = 'fired_event_' + gameYear();
        return;
      }
    }
  /* Competitor offer — based on CURRENT salary, tagged with current country */
if (j.performance >= 65 && j.tenure >= 1 && Math.random() < 0.15) {
  const track2 = carTrackById(j.track);
  if (track2) {
    const competitors = carCompaniesFor(track2.industry).filter(function(comp) { return comp.name !== j.company; });
    if (competitors.length > 0) {
      const comp = competitors[Math.floor(Math.random() * competitors.length)];
      const bump = 15 + Math.floor(Math.random() * 20);
      /* FIX: base the offer on the player's CURRENT salary, not the track's base */
      const currentSalary = j.salary;
      const offerSalary = Math.round(currentSalary * (1 + bump / 100));
      c.offers.push({
        id: 'off_' + Math.random().toString(36).slice(2, 8),
        company: comp.name,
        title: j.title,
        track: j.track,
        level: j.level,
        salary: offerSalary,
        baseSalaryEGP: j.baseSalaryEGP,
        payMult: comp.payMult,
        benefits: comp.benefits.slice(),
        prestige: comp.prestige,
        country: S.country,
        salaryCurrency: C().currency,
        message: 'Offering ' + bump + '% more than your current salary.'
      });
      log('💼 Competitor offer from ' + comp.name + ' (' + bump + '% raise).');
    }
  }
}
    /* Bonus */
    if (j.benefits.indexOf('bonus') >= 0 && Math.random() < 0.7) {
      const bonus = Math.round(j.salary * (0.10 + Math.random() * 0.10));
      S.wealth += bonus;
      log('🎁 Annual bonus: ' + money(bonus) + '.');
    }

    /* Random work events */
    if (Math.random() < 0.40 && c.job) {
      const eligible = CAR_JOB_EVENTS.filter(function(e) {
        if (e.minTenure && j.tenure < e.minTenure) return false;
        if (e.minPerformance && j.performance < e.minPerformance) return false;
        return true;
      });
      if (eligible.length) {
        const totalW = eligible.reduce(function(s, e) { return s + e.weight; }, 0);
        let roll = Math.random() * totalW;
        for (let i = 0; i < eligible.length; i++) {
          roll -= eligible[i].weight;
          if (roll <= 0) {
            carFireJobEvent(eligible[i], j);
            break;
          }
        }
      }
    }

    /* Skill progression */
    S.career.cv.skill = Math.min(100, S.career.cv.skill + 1);

    /* Millionaire milestone */
    if (S.wealth >= 1000000 * carRate() && !c.milestones.some(function(m) { return m.id === 'millionaire'; })) {
      carAddMilestone('millionaire', 'First ' + money(1000000 * carRate()) + ' Saved');
    }
  }

  /* Global macro events */
  const globalEvent = CAR_GLOBAL_EVENTS.find(function(e) { return e.year === year; });
    if (globalEvent && c.job) {
    log('🌍 ' + globalEvent.label + ' affected the economy.');
    if (Math.random() < globalEvent.layoffChance) {
      const companyName = c.job.company;
      carLeaveCurrentJob('laid off due to ' + globalEvent.label);
      fx({ happiness: -25 });
      c.mood = 'frustrated';
      S.pending = {
        title: '🌍 Laid Off — ' + globalEvent.label,
        text: 'The ' + globalEvent.label + ' has hit your company hard. You were let go from ' + companyName + '. This was not your fault.\n\nYou are now unemployed. Use the Job Search tab to find new work.',
        choices: [
          { label: 'I understand', effect: function(s) { fx({ happiness: 2 }); } }
        ]
      };
      S.evId = 'layoff_' + gameYear();
    }
  }

  /* Industry trends update */
  const industries = ['banking','tech','law','consulting','hospitals','universities','retail','fmcg','engineering','oil_gas','telecom','hotels','aviation','media','government','schools','bpo','trades'];
  industries.forEach(function(ind) {
    if (Math.random() < 0.30) {
      const r = Math.random();
      if (r < 0.20) c.industryTrends[ind] = 'recession';
      else if (r > 0.80) c.industryTrends[ind] = 'booming';
      else c.industryTrends[ind] = 'normal';
    }
  });

  /* Businesses */
  c.businesses.forEach(function(biz) {
    const staffCost = biz.employees.reduce(function(s, e) { return s + e.salary; }, 0);
    const totalCost = biz.expenses + biz.marketing + staffCost;
    const qualityBoost = 1 + (biz.quality / 100) + (biz.employees.length * 0.05);
    const marketingBoost = 1 + (biz.marketing / Math.max(1, biz.expenses)) * 0.3;
    const luck = 0.85 + Math.random() * 0.3;
    const actualRevenue = Math.round(biz.revenue * qualityBoost * marketingBoost * luck);
    const profit = actualRevenue - totalCost;

    if (profit >= 0) {
      S.wealth += profit;
      biz.totalProfit = (biz.totalProfit || 0) + profit;
      biz.reputation = Math.min(10, biz.reputation + 1);
    } else {
      S.wealth += profit;
      biz.reputation = Math.max(0, biz.reputation - 1);
      log('⚠️ ' + biz.name + ' lost ' + money(-profit) + ' this year.');
      if (biz.reputation === 0 && Math.random() < 0.3) {
        log('💔 ' + biz.name + ' went bankrupt and closed.');
        c.businesses = c.businesses.filter(function(b) { return b.id !== biz.id; });
      }
    }
    biz.monthlyProfit = Math.round(profit / 12);

    /* Employee morale decay */
    biz.employees.forEach(function(emp) {
      emp.morale = Math.max(30, emp.morale - 2);
    });
  });

  /* Offer expiry */
  c.offers = c.offers.filter(function(o) {
    if (o.addedYear && year - o.addedYear >= 1) {
      log('⏰ Offer from ' + o.company + ' expired.');
      return false;
    }
    return true;
  });

  /* Forced retirement */
  if (c.job && S.age >= 67) {
    log('🏛 You were forced to retire at age 67.');
    carLeaveCurrentJob('forced retirement');
    c.retired = true;
    c.pension.retiredYear = year;
    carAddMilestone('retired', 'Retired');
  }
});

/* ============================================================
   PERFORMANCE REVIEW
   ============================================================ */

function carConductReview(j) {
  const score = j.performance;
  let rating, comment, raiseAmount = 0;

  if (score >= 85) {
    rating = 5;
    comment = 'Outstanding work this year. You are a top performer.';
    raiseAmount = Math.round(j.salary * 0.12);
  } else if (score >= 70) {
    rating = 4;
    comment = 'Exceeds expectations. Keep it up.';
    raiseAmount = Math.round(j.salary * 0.06);
  } else if (score >= 55) {
    rating = 3;
    comment = 'Meets expectations. Solid year.';
    raiseAmount = Math.round(j.salary * 0.03);
  } else if (score >= 40) {
    rating = 2;
    comment = 'Below expectations. We need to see more from you.';
    S.career.mood = 'frustrated';
  } else {
    rating = 1;
    comment = 'Performance is a concern. Consider this a warning.';
    S.career.mood = 'frustrated';
    fx({ happiness: -10 });
  }

  if (raiseAmount > 0) {
    j.salary += raiseAmount;
    if (S.job) S.job.salary = j.salary;
  }

  S.career.reviews.push({
    year: gameYear(),
    rating: rating,
    comment: comment,
    raise: raiseAmount
  });

  log('📄 Performance review: ' + rating + '/5. "' + comment + '"' + (raiseAmount > 0 ? ' Raise: +' + money(raiseAmount) + '.' : ''));
}

/* ============================================================
   WORK EVENTS
   ============================================================ */

function carFireJobEvent(evt, j) {
  const text = evt.text.replace('{bump}', '15').replace('{amount}', money(Math.round(j.salary * 0.15)));
  log('💼 ' + evt.label + ': ' + text);
  if (evt.id === 'bonus') {
    S.wealth += Math.round(j.salary * 0.15);
  } else if (evt.id === 'project_success') {
    j.performance = Math.min(100, j.performance + 8);
  } else if (evt.id === 'project_fail') {
    j.performance = Math.max(0, j.performance - 10);
  } else if (evt.id === 'meeting_conflict') {
    j.performance = Math.max(0, j.performance - 5);
    fx({ happiness: -8 });
  } else if (evt.id === 'burnout_warning') {
    fx({ happiness: -15, health: -5 });
    S.career.mood = 'burnedout';
  } else if (evt.id === 'overtime_pay') {
    S.wealth += Math.round(j.salary * 0.05);
  } else if (evt.id === 'promotion_rejected') {
    fx({ happiness: -8 });
    j.performance = Math.max(0, j.performance - 3);
  } else if (evt.id === 'raise_negotiation_win') {
    const bump = Math.round(j.salary * 0.08);
    j.salary += bump;
    if (S.job) S.job.salary = j.salary;
    fx({ happiness: 8 });
  } else if (evt.id === 'raise_negotiation_lose') {
    fx({ happiness: -5 });
  } else if (evt.id === 'stock_vest') {
    S.wealth += Math.round(j.salary * 0.20);
  } else if (evt.id === 'coworker_friend') {
    carAddColleague(j.company);
    fx({ happiness: 5 });
  } else if (evt.id === 'coworker_conflict') {
    fx({ happiness: -5 });
  } else if (evt.id === 'training_offer') {
    S.career.cv.skill = Math.min(100, S.career.cv.skill + 5);
    fx({ happiness: 3 });
  } else if (evt.id === 'salary_delay') {
    fx({ happiness: -10 });
  }
}
window.carTryFakeDocs = function() {
  if (!S) return;
  const cost = Math.round(50000 * ((C().rate || 1) / 52.7));
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + '.'); render(); return; }
  if (!confirm('Buy forged work papers for ' + money(cost) + '?\n\n• 30% chance employer/trade officer detects them\n• If caught: deportation + 10-year ban + criminal record\n• If successful: you can apply to real jobs\n\nProceed?')) return;

  S.wealth -= cost;

  if (Math.random() < 0.30) {
    log('🚨 CAUGHT. Your fake papers were flagged. Deportation proceedings begin.');
    fx({ happiness: -30 });
    if (!Array.isArray(S.visaBans)) S.visaBans = [];
    S.visaBans.push({ country: S.country, untilAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) + 120 });
    if (typeof illegalWorkDeport === 'function') {
      illegalWorkDeport(S, 'fake_docs');
    }
    render();
    return;
  }

  /* Successful — grant a "fake legal" work visa that will be investigated */
  if (!S.immigration) S.immigration = {};
  S.immigration.visaType = 'work';
  S.immigration.status = 'visa_work';
  S.immigration.workRights = 'full';
  S.immigration.expiresYear = gameYear() + 2;
  S.immigration._isFake = true;
  log('🎭 Forged papers accepted. You look legal... for now.');
  log('⚠️ Employers may verify later. Risk of detection each year: 20%.');
  emitSignal('fakeDocsObtained', {});
  render();
};

/* Fake docs detection — fire in year tick */
GameHooks.on('year', function() {
  if (!S || !S.immigration || !S.immigration._isFake) return;
  if (Math.random() < 0.20) {
    log('🚨 Employer verification revealed your papers are fake. Deportation.');
    fx({ happiness: -30 });
    if (!Array.isArray(S.visaBans)) S.visaBans = [];
    S.visaBans.push({ country: S.country, untilAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) + 120 });
    if (typeof illegalWorkDeport === 'function') {
      illegalWorkDeport(S, 'fake_docs_detected');
    }
  }
});
GameHooks.registerTab({ id: 'career', label: '💼 Career', order: 2, view: careerView });
/* ============================================================
   BULLETPROOF PILL HANDLERS — attach real click listeners
   after every render, bypassing inline onclick entirely.
   ============================================================ */
GameHooks.on('render', function() {
  if (typeof activeTab === 'undefined' || activeTab !== 'career') return;
  var view = document.getElementById('view');
  if (!view) return;
  var pills = view.querySelectorAll('button.pill');
  for (var i = 0; i < pills.length; i++) {
    var btn = pills[i];
    if (btn._careerBound) continue;
    var onclick = btn.getAttribute('onclick') || '';
    var match = onclick.match(/carSetTab\('([^']+)'\)/);
    if (!match) continue;
    var tabName = match[1];
    btn._careerBound = true;
    btn.removeAttribute('onclick');
    (function(name) {
      btn.addEventListener('click', function(ev) {
        ev.preventDefault();
        S.career.tab = name;
        render();
      });
    })(tabName);
  }

  /* Also bind the "Find a job" button (.opt with carSetTab) */
  var opts = view.querySelectorAll('button.opt[onclick*="carSetTab"]');
  for (var j = 0; j < opts.length; j++) {
    var ob = opts[j];
    if (ob._careerBound) continue;
    var oclick = ob.getAttribute('onclick') || '';
    var om = oclick.match(/carSetTab\('([^']+)'\)/);
    if (!om) continue;
    ob._careerBound = true;
    ob.removeAttribute('onclick');
    (function(name) {
      ob.addEventListener('click', function(ev) {
        ev.preventDefault();
        S.career.tab = name;
        render();
      });
    })(om[1]);
  }
});
/* ============================================================
   SESSION 9: CAREER SALARY FROM ECON ENGINE
   ============================================================ */

function carSalaryForLevel(trackId, level, countryOverride) {
  var country = countryOverride || (S && S.country) || 'egy';
  var sector = 'private';

  /* Try econ engine (Session 8) first — real, country-scaled, year-scaled */
  if (typeof econSalary === 'function') {
    try {
      var econVal = econSalary(trackId, level, country, gameYear(), sector);
      if (econVal > 0) return econVal;
    } catch (e) { /* fall through */ }
  }

  /* Fallback: old hardcoded, converted by current rate */
  var track = carTrackById(trackId);
  if (track && track.levels && track.levels[level]) {
    var rate = (C().rate || 1) / 52.7;
    return Math.round(track.levels[level].baseSalaryEGP * rate);
  }
  return 50000;
}
window.carSalaryForLevel = carSalaryForLevel;

/* ============================================================
   SESSION 9: SPECIALTY / BRANCH CHOICE
   ============================================================ */

function carChooseSpecialty(newTrackId) {
  if (!S || !S.career || !S.career.job) return false;
  var job = S.career.job;

  if (job.track === newTrackId) {
    job.branchChosen = true;
    job.branchChosenYear = gameYear();
    log('🎓 You committed to staying on the ' + (carTrackById(newTrackId) || {}).label + ' path.');
    return true;
  }

  var newTrack = carTrackById(newTrackId);
  if (!newTrack) { log('❌ Unknown specialty: ' + newTrackId); return false; }

  var check = (typeof carCanApplyTrack === 'function') ? carCanApplyTrack(newTrackId) : { ok: true };
  if (!check.ok) { log('❌ ' + check.reason); return false; }

  var oldLabel = (carTrackById(job.track) || {}).label || job.track;
  var newLevel = Math.min(job.level || 0, newTrack.levels.length - 1);

  job.track = newTrackId;
  job.level = newLevel;
  job.title = newTrack.levels[newLevel].title;
  job.salary = carSalaryForLevel(newTrackId, newLevel);
  job.baseSalaryEGP = job.salary;
  job.specializedYear = gameYear();
  job.branchChosen = true;
  job.branchChosenYear = gameYear();

  log('🎓 SPECIALTY CHOSEN: ' + newTrack.label);
  log('   New title: ' + job.title);
  log('   New salary: ' + money(job.salary) + '/year');
  fx({ happiness: 8, smarts: 3 });

  if (typeof recordMoment === 'function') {
    recordMoment(
      'The day you committed to ' + newTrack.label,
      'You chose your specialty. The path ahead is now specific — no more "general."',
      { icon: '🎓', key: 'specialty_' + newTrackId }
    );
  }
  if (typeof emitSignal === 'function') {
    emitSignal('careerSpecialized', { from: oldLabel, to: newTrack.label });
  }
  return true;
}
window.carChooseSpecialty = carChooseSpecialty;

function carCheckBranchPoint() {
  if (!S || !S.career || !S.career.job) return false;
  var job = S.career.job;
  var branchDef = (typeof CAR_BRANCH_OPTIONS !== 'undefined') ? CAR_BRANCH_OPTIONS[job.track] : null;
  if (!branchDef) return false;
  if (job.branchChosen) return false;
  if ((job.level || 0) < branchDef.branchAtLevel) return false;

  /* Mark as available — the UI shows a "choose specialty" card */
  if (!job.branchChoiceAvailable) {
    job.branchChoiceAvailable = true;
    log('🎓 Your career has reached a specialization point. Choose your specialty in the Career tab.');
  }

  /* Fire an interactive event if nothing else is pending */
  if (!S.pending) {
    var choices = branchDef.options.map(function(opt) {
      return {
        label: opt.label + ' — ' + opt.desc,
        effect: function() {
          carChooseSpecialty(opt.trackId);
        }
      };
    });
    S.pending = {
      title: '🎓 Choose Your Specialty',
      text: branchDef.question,
      choices: choices
    };
    S.evId = 'specialty_choice_' + gameYear();
    return true;
  }
  return false;
}
window.carCheckBranchPoint = carCheckBranchPoint;

/* ============================================================
   SESSION 9: MIGRATION FOR EXISTING CAREERS
   Mark existing players as already-specialized to avoid forced popup.
   Player can manually re-specialize via Career → Overview button.
   ============================================================ */
function carMigrateCareerSpecialty() {
  if (!S || !S.career || !S.career.job) return;
  var job = S.career.job;
  if (typeof CAR_BRANCH_OPTIONS === 'undefined') return;
  var branchDef = CAR_BRANCH_OPTIONS[job.track];
  if (!branchDef) return;
  if (job.branchChosen) return;
  if ((job.level || 0) < branchDef.branchAtLevel) return;

  /* Existing save — assume they've already specialized, just mark it */
  job.branchChosen = true;
  job.branchChosenYear = gameYear();
  job.branchChoiceAvailable = false;
  log('🎓 Your existing career is treated as already specialized. You can change specialty anytime from Career → Overview.');
}
window.carMigrateCareerSpecialty = carMigrateCareerSpecialty;

/* Run migration on render (safe, idempotent) */
GameHooks.on('render', function() {
  if (S && S.career && S.career.job) {
    if (!S.career.job._migratedSpecialty) {
      carMigrateCareerSpecialty();
      S.career.job._migratedSpecialty = true;
    }
  }
});
