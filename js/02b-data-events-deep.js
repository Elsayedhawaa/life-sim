/* ============================================================
   02b-data-events-deep.js — SESSION 4: CONNECTED DEEP EVENTS
   Every event here mutates real game state.
   Requires: 00-engine.js, 02-data-events.js
   ============================================================ */

/* ============================================================
   CONNECTED PUZZLE MEMORY SYSTEM
   ============================================================ */
/* ============================================================
   SESSION 5 — REAL STATE MUTATORS for Gulf / Study / Migration
   ============================================================ */

/* --- Push a real Gulf job offer into S.gulfWork.offer --- */
function evtPushGulfOffer(countryId) {
  if (!S) return false;
  if (typeof ensureGulfWorkState === 'function') ensureGulfWorkState();
  if (!S.gulfWork) return false;
  if (S.gulfWork.active) return false;
  if (S.gulfWork.offer) return false;

  if (typeof _gulfSalaryBreakdown !== 'function' || typeof _gulfPickSponsor !== 'function') return false;

  S.gulfWork.pendingCountry = countryId;
  var sponsor = _gulfPickSponsor({ sponsorBias: ['fair', 'generous', 'multinational'] });
  var salary = _gulfSalaryBreakdown('linkedin', countryId);
  var career = salary.career || { track: 'entry', title: 'Worker', careerLevel: 0 };
  var housingIncluded = Math.random() < 0.45;
  var total = salary.basicAnnualLocal +
    (housingIncluded ? 0 : salary.housingAllowance) +
    salary.transportAllowance +
    salary.mobileAllowance;

  S.gulfWork.offer = {
    country: countryId,
    source: 'event',
    sourceLabel: 'Direct Recruiter Offer',
    sponsor: sponsor,
    track: career.track,
    careerLevel: career.careerLevel,
    title: career.title,
    profession: career.track === 'teaching' ? 'teacher'
      : career.track === 'medicine' ? 'physician'
      : career.track === 'engineering' ? 'engineer'
      : career.track === 'tech' ? 'software engineer'
      : career.track === 'nursing' ? 'nurse'
      : 'professional',
    basicAnnualLocal: salary.basicAnnualLocal,
    housingAllowance: housingIncluded ? 0 : salary.housingAllowance,
    transportAllowance: salary.transportAllowance,
    mobileAllowance: salary.mobileAllowance,
    totalAnnualLocal: total,
    salaryLocal: total,
    breakdown: salary,
    housingIncluded: housingIncluded,
    flightsIncluded: Math.random() < 0.7,
    medicalInsuranceProvided: true,
    expiresAbsMonth: (typeof _gulfAbsMonth === 'function') ? _gulfAbsMonth() + 3 : 0,
    iqamaYears: 2,
    contractYears: 2 + Math.floor(Math.random() * 2)
  };
  return true;
}
window.evtPushGulfOffer = evtPushGulfOffer;

/* --- Push a real study abroad acceptance --- */
function evtPushStudyAbroad(uniId, majorId) {
  if (!S) return false;
  if (S.studyAbroad && S.studyAbroad.status !== 'returned') return false;
  if (S.uni) return false;
  if (typeof EDU_STUDY_ABROAD_UNIS === 'undefined') return false;

  var uni = EDU_STUDY_ABROAD_UNIS.find(function(u) { return u.id === uniId; });
  if (!uni) return false;

  if (typeof studyAbroadArrive === 'function') {
    var app = { country: uni.country, major: majorId || 'cs', mode: 'self' };
    var uniData = {
      id: uni.id,
      name: uni.name,
      country: uni.country,
      quality: uni.quality,
      tuitionUSD: uni.tuitionUSD
    };
    studyAbroadArrive(app, uniData);
    return true;
  }
  return false;
}
window.evtPushStudyAbroad = evtPushStudyAbroad;

/* --- Actually migrate country (converts wealth) --- */
function evtMigrateTo(newCountry) {
  if (!S || !newCountry) return false;
  if (newCountry === S.country) return false;
  if (typeof COUNTRIES === 'undefined' || !COUNTRIES[newCountry]) return false;

  var oldCountry = S.country;
  var oldRate = (COUNTRIES[oldCountry] && COUNTRIES[oldCountry].rate) || 1;
  var newRate = (COUNTRIES[newCountry] && COUNTRIES[newCountry].rate) || 1;

  if (typeof S.wealth === 'number' && oldRate !== newRate) {
    S.wealth = Math.round(S.wealth / oldRate * newRate);
  }
  if (S.job && typeof S.job.salary === 'number') {
    S.job.salary = Math.round(S.job.salary / oldRate * newRate);
  }
  if (S.career && S.career.job && typeof S.career.job.salary === 'number') {
    S.career.job.salary = Math.round(S.career.job.salary / oldRate * newRate);
  }
  if (S.bank && Array.isArray(S.bank.accounts)) {
    S.bank.accounts.forEach(function(a) {
      if (typeof a.balance === 'number') a.balance = Math.round(a.balance / oldRate * newRate);
    });
  }

  S.country = newCountry;
  S.homeCountry = S.homeCountry || oldCountry;
  log('✈️ You moved from ' + (COUNTRIES[oldCountry] ? COUNTRIES[oldCountry].name : oldCountry) +
      ' to ' + (COUNTRIES[newCountry] ? COUNTRIES[newCountry].name : newCountry) + '.');
  return true;
}
window.evtMigrateTo = evtMigrateTo;

function evtRemember(key, value, yearsValid) {
  if (!S) return;
  if (!S.evtMemory) S.evtMemory = {};
  S.evtMemory[key] = { value: value, year: gameYear(), yearsValid: yearsValid || 15 };
}

function evtRecall(key) {
  if (!S || !S.evtMemory || !S.evtMemory[key]) return null;
  var m = S.evtMemory[key];
  if (gameYear() - m.year > m.yearsValid) { delete S.evtMemory[key]; return null; }
  return m.value;
}

function evtForget(key) { if (S && S.evtMemory) delete S.evtMemory[key]; }

/* ============================================================
   REAL STATE MUTATION HELPERS — these CHANGE your actual game
   ============================================================ */

/* Force layoff — actually fires you */
function evtForceLayoff(s, companyName) {
  var company = companyName || (s.career && s.career.job ? s.career.job.company : 'your employer');
  if (typeof carLeaveCurrentJob === 'function') {
    carLeaveCurrentJob('laid off');
  } else {
    if (s.career) s.career.job = null;
    s.job = null;
  }
  s.happiness = Math.max(0, (s.happiness || 50) - 25);
  log('🚨 You were laid off from ' + company + '.');
  log('💼 Check the Career tab to find new work.');
  if (typeof emitSignal === 'function') emitSignal('jobLost', { company: company, title: 'Laid Off' });
}

/* Push a real offer into Career tab */
function evtPushOffer(s, data) {
  if (!s.career) s.career = { offers: [] };
  if (!Array.isArray(s.career.offers)) s.career.offers = [];
  var currentJob = s.career.job || s.job || {};
  s.career.offers.push({
    id: 'off_' + Math.random().toString(36).slice(2, 8),
    company: data.company,
    title: data.title || currentJob.title || 'Employee',
    track: data.track || currentJob.track || 'entry',
    level: data.level !== undefined ? data.level : (currentJob.level || 0),
    salary: data.salary,
    baseSalaryEGP: data.baseSalaryEGP || data.salary,
    payMult: data.payMult || 1.2,
    benefits: data.benefits || ['health', 'bonus'],
    prestige: data.prestige || 4,
    country: s.country,
    salaryCurrency: C().currency,
    message: data.message || 'We want you on our team.',
    addedYear: gameYear()
  });
  log('💼 New job offer added to Career → Offers tab.');
}

/* Real rent hike */
function evtRentHike(s, pct) {
  if (!s.rentedHome) return false;
  var old = s.rentedHome.yearlyRent || 0;
  s.rentedHome.yearlyRent = Math.round(old * (1 + pct));
  log('🏠 Rent increased: ' + money(old) + ' → ' + money(s.rentedHome.yearlyRent) + '/year');
  return true;
}

/* Real eviction */
function evtEvict(s) {
  if (s.housing !== 'rented') return;
  s.housing = 'parents';
  s.rentedHome = null;
  s.happiness = Math.max(0, (s.happiness || 50) - 15);
  log('🚪 You were evicted. You moved back in with your parents.');
}

/* Tenant leaves a rented-out property */
function evtTenantLeaves(s, homeId) {
  if (!s.ownedHomes) return;
  var home = s.ownedHomes.find(function(h) { return h.id === homeId; });
  if (home && home.status === 'rented') {
    home.status = 'vacant';
    home.tenant = null;
    home.monthsVacant = 0;
    log('🏚 Your tenant at ' + home.name + ' broke the lease and left.');
  }
}

/* Tenant damages property */
function evtTenantDamage(s, homeId, repairCost) {
  if (!s.ownedHomes) return;
  var home = s.ownedHomes.find(function(h) { return h.id === homeId; });
  if (home) {
    home.condition = Math.max(0, (home.condition || 100) - 25);
    s.wealth -= repairCost;
    log('🔨 Tenant damaged ' + home.name + '. Repair: ' + money(repairCost));
  }
}

/* Real divorce with custody and child support */
function evtForceDivorce(s, causeLabel) {
  var m = s.marriage;
  if (!m || !m.partner) return;

  var p = m.partner;
  var children = s.childrenList || [];
  var isEgypt = (s.country === 'egy');
  var supportAmount = 0;
  var supportDirection = 'pay';
  var custodyNote = 'No children';

  if (children.length > 0) {
    var myInc = (s.career && s.career.job ? s.career.job.salary : 0) + (s.job ? s.job.salary : 0);
    var partnerInc = p.income || 0;
    if (isEgypt) {
      if (s.gender === 'm') {
        supportAmount = Math.round(myInc * 0.25 * children.length);
        supportDirection = 'pay';
        custodyNote = 'Mother (until age 15)';
      } else {
        supportAmount = Math.round(partnerInc * 0.25 * children.length);
        supportDirection = 'receive';
        custodyNote = 'You (until age 15)';
      }
    } else {
      var diff = myInc - partnerInc;
      supportAmount = Math.round(Math.abs(diff) * 0.20 * children.length);
      supportDirection = diff > 0 ? 'pay' : 'receive';
      custodyNote = 'Joint custody 50/50';
    }
    children.forEach(function(c) {
      c.happiness = Math.max(0, (c.happiness || 70) - 20);
      c.bond = Math.max(0, (c.bond || 55) - 10);
      if (!Array.isArray(c.events)) c.events = [];
      c.events.push({ year: gameYear(), event: 'Parents divorced (' + causeLabel + ')' });
    });
  }

  m.exSpouses.push({
    name: p.name,
    marriedYear: p.marriedYear || gameYear() - 1,
    divorcedYear: gameYear(),
    reason: causeLabel,
    support: supportAmount > 0 ? { direction: supportDirection, amount: supportAmount, untilYear: gameYear() + 15, arrears: 0 } : null,
    custody: custodyNote,
    remarried: false
  });

  m.partner = null;
  m.status = 'divorced';
  m.wedding = null;
  m.engagement = null;
  m.financeModel = null;
  m.sharedAccountBalance = 0;
  m.home = null;
  m.prenup = null;
  m.pendingConflict = null;
  m.motherInLawBond = 50;
  m.stress = 20;
  m.mahrAdvanced = 0;
  m.mahrDeferred = 0;
  s.spouse = null;

  if (s.ownedHomes) {
    var hadOwned = s.ownedHomes.some(function(h) { return h.isHusbandOwned; });
    s.ownedHomes = s.ownedHomes.filter(function(h) { return !h.isHusbandOwned; });
    if (hadOwned && !s.ownedHomes.some(function(h) { return h.status === 'occupied'; })) {
      s.housing = 'parents';
    }
  }

  s.happiness = Math.max(0, (s.happiness || 50) - 25);
  s.health = Math.max(0, (s.health || 100) - 5);
  if (s.career && s.career.job) {
    s.career.job.performance = Math.max(0, (s.career.job.performance || 50) - 12);
  }

  log('💔 You divorced ' + p.name + ' over ' + causeLabel + '.');
  if (supportAmount > 0) log('💰 Child support: ' + money(supportAmount) + '/yr (' + supportDirection + ')');
  log('👶 Custody: ' + custodyNote);
  if (typeof emitSignal === 'function') emitSignal('divorce', { partner: p.name, cause: causeLabel });
}

/* Chain a follow-up event after this choice resolves */
function evtChain(event, delay) {
  setTimeout(function() {
    if (S && !S.pending) {
      S.pending = prepareEvent(event);
      S.evId = event.id;
      log('📖 ' + (event.title || 'Event'));
      render();
    }
  }, delay || 300);
}

/* ============================================================
   DEEP EVENTS — the connected, state-mutating pool
   ============================================================ */
const DEEP_EVENTS = [

/* ============================================================
   CAREER CRISIS — REAL LAYOFF, REAL OFFER
   ============================================================ */

{ id: 'career_mass_layoff', minAge: 22, maxAge: 60, weight: 8, maxFires: 4,
  condition: s => evtHasJob(),
  title: '🚨 Mass Layoffs Today',
  text: s => {
    var job = (s.career && s.career.job) ? s.career.job : s.job;
    return 'An all-hands meeting was called at ' + (job ? job.company : 'work') + '. HR is in the room. They read a list of names. Yours is on it. You are being laid off, effective immediately.\n\nSeverance: ' + evtMoney(15000).toLocaleString() + ' ' + C().currency + ' if you sign the papers today.';
  },
  choices: [
    { label: 'Sign and take the severance (you are fired)',
      effect: s => {
        s.wealth += evtMoney(15000);
        evtForceLayoff(s, null);
        evtRemember('wasLaidOff', true, 5);
        fx({ happiness: -20, health: -5 });
      }
    },
    { label: 'Refuse to sign — fight for your job',
      effect: s => {
        if (Math.random() < 0.35) {
          evtAffectPerf(5);
          log('💪 Legal pressure worked. You kept your job — for now.');
          fx({ happiness: 10 });
        } else {
          evtForceLayoff(s, null);
          log('❌ Fighting them failed. Fired with no severance.');
          evtRemember('wasLaidOff', true, 5);
          fx({ happiness: -30 });
        }
      }
    }
  ]
},

{ id: 'career_toxic_boss', minAge: 24, maxAge: 55, weight: 7, maxFires: 3,
  condition: s => evtHasJob(),
  title: '😤 Toxic Boss Escalation',
  text: s => {
    var job = (s.career && s.career.job) ? s.career.job : s.job;
    var boss = job && job.boss ? job.boss.name : 'Your manager';
    return boss + ' humiliates you in front of the whole team again. "You cannot do anything right, can you?" Everyone stares at the floor.\n\nThis is the third time this month.';
  },
  choices: [
    { label: 'Report to HR formally',
      effect: s => {
        if (Math.random() < 0.45) {
          evtAffectPerf(3);
          log('✅ HR took it seriously. Your boss is now under review.');
          fx({ happiness: 5 });
        } else {
          evtAffectPerf(-12);
          log('❌ HR sided with your boss. Now you are marked.');
          fx({ happiness: -10 });
        }
      }
    },
    { label: 'Confront them directly',
      effect: s => {
        if (Math.random() < 0.30) {
          evtAffectPerf(5);
          log('🔥 They backed down. Respect earned.');
          fx({ happiness: 6 });
        } else {
          evtAffectPerf(-20);
          log('❌ It went badly. They are now actively trying to get you fired.');
          fx({ happiness: -15 });
          evtRemember('bossHostile', true, 3);
        }
      }
    },
    { label: 'Endure silently',
      effect: s => { evtAffectPerf(-6); fx({ happiness: -8, health: -2 }); }
    }
  ]
},

{ id: 'career_competitor_offer', minAge: 26, maxAge: 55, weight: 8, maxFires: 5,
  condition: s => evtHasJob() && evtJobPerf() >= 60,
  title: '💼 Competitor Reaches Out',
  text: s => {
    var job = (s.career && s.career.job) ? s.career.job : s.job;
    var current = job ? job.salary : 0;
    var bump = Math.round(current * 0.25);
    return 'A rival company contacted you on LinkedIn. They want you. The offer would be ' + money(current + bump) + '/year — a 25% raise. "We have heard great things about your work."';
  },
  choices: [
    { label: 'Accept the offer (leave current job)',
      effect: s => {
        var job = (s.career && s.career.job) ? s.career.job : s.job;
        if (!job) return;
        var current = job.salary || 0;
        evtPushOffer(s, {
          company: 'Rival Tech Co.',
          title: job.title || 'Senior Role',
          track: job.track,
          level: (job.level || 0) + 1,
          salary: Math.round(current * 1.25),
          baseSalaryEGP: Math.round((job.baseSalaryEGP || current) * 1.25),
          message: 'Competitor offer, 25% raise.'
        });
        log('📬 Check Career → Offers to accept.');
        fx({ happiness: 8 });
        evtRemember('gotCompetitorOffer', true, 5);
      }
    },
    { label: 'Use the offer to negotiate with current boss',
      effect: s => {
        var job = (s.career && s.career.job) ? s.career.job : s.job;
        if (!job) return;
        if (Math.random() < 0.55) {
          var bump = Math.round((job.salary || 0) * 0.15);
          job.salary = (job.salary || 0) + bump;
          if (s.job) s.job.salary = job.salary;
          log('🎉 Current company raised your salary by ' + money(bump) + ' to keep you.');
          fx({ happiness: 10 });
        } else {
          evtAffectPerf(-8);
          log('❌ Your boss called your bluff. "Then leave."');
          fx({ happiness: -8 });
        }
      }
    },
    { label: 'Stay loyal, decline politely',
      effect: s => { evtAffectPerf(2); fx({ happiness: 2 }); }
    }
  ]
},

{ id: 'career_headhunter', minAge: 28, maxAge: 55, weight: 6, maxFires: 3,
  condition: s => evtHasJob() && evtJobPerf() >= 70,
  title: '📞 Headhunter Called',
  text: s => 'An executive headhunter found your profile. They are representing a premium firm who wants you. They are offering ' + evtMoney(60000).toLocaleString() + ' ' + C().currency + ' signing bonus and a 40% raise.',
  choices: [
    { label: 'Accept the offer (leave current job)',
      effect: s => {
        var job = (s.career && s.career.job) ? s.career.job : s.job;
        if (!job) return;
        var current = job.salary || 0;
        s.wealth += evtMoney(60000);
        evtPushOffer(s, {
          company: 'Elite Recruiter Placement',
          title: (job.title || 'Senior') + ' (Executive)',
          track: job.track,
          level: (job.level || 0) + 2,
          salary: Math.round(current * 1.40),
          message: 'Headhunter placement with signing bonus.'
        });
        log('📬 Offer in Career tab. Signing bonus already paid.');
        fx({ happiness: 12 });
        evtRemember('gotHeadhunted', true, 5);
      }
    },
    { label: 'Decline — you are happy where you are',
      effect: s => { evtAffectPerf(3); fx({ happiness: 3 }); }
    }
  ]
},

{ id: 'career_promotion_denied', minAge: 26, maxAge: 55, weight: 6, maxFires: 3,
  condition: s => evtHasJob() && evtJobPerf() >= 70,
  title: '📉 Passed Over for Promotion',
  text: s => 'You have been promised a promotion for a year. Today they announced it went to someone with half your experience. Your manager says: "Maybe next cycle."',
  choices: [
    { label: 'Accept and keep working',
      effect: s => { evtAffectPerf(-8); fx({ happiness: -8 }); }
    },
    { label: 'Demand a formal explanation from HR',
      effect: s => {
        if (Math.random() < 0.4) {
          evtAffectPerf(2);
          log('💬 HR promised to review. Small win.');
          fx({ happiness: 3 });
        } else {
          evtAffectPerf(-5);
          log('❌ They dismissed your complaint.');
          fx({ happiness: -6 });
        }
      }
    },
    { label: 'Start looking for another job',
      effect: s => {
        var job = (s.career && s.career.job) ? s.career.job : s.job;
        if (!job) return;
        var bump = Math.round((job.salary || 0) * 0.20);
        evtPushOffer(s, {
          company: 'A Fresh Start Co.',
          title: job.title || 'Senior',
          track: job.track,
          level: job.level || 0,
          salary: (job.salary || 0) + bump,
          message: 'Lateral move with 20% raise.'
        });
        log('📬 Offer in Career tab.');
        fx({ happiness: 4 });
      }
    }
  ]
},

{ id: 'career_salary_freeze', minAge: 25, maxAge: 58, weight: 6, maxFires: 3,
  condition: s => evtHasJob(),
  title: '❄️ Salary Freeze Announced',
  text: s => 'Company-wide email: "Due to market conditions, all salaries are frozen for 12 months." Your raise is cancelled. Prices keep rising.',
  choices: [
    { label: 'Accept it silently',
      effect: s => { fx({ happiness: -6 }); evtRemember('salaryFrozen', true, 2); }
    },
    { label: 'Start quietly job hunting',
      effect: s => {
        var job = (s.career && s.career.job) ? s.career.job : s.job;
        if (!job) return;
        evtPushOffer(s, {
          company: 'Fresh Horizon Ltd.',
          title: job.title || 'Role',
          track: job.track,
          level: job.level || 0,
          salary: Math.round((job.salary || 0) * 1.15),
          message: 'A 15% raise elsewhere.'
        });
        log('📬 Offer ready.');
        fx({ happiness: 3 });
      }
    }
  ]
},

{ id: 'career_office_romance', minAge: 24, maxAge: 45, weight: 5, maxFires: 2,
  condition: s => evtHasJob() && evtIsSingle(),
  title: '💕 Office Romance',
  text: s => 'A colleague has been flirting with you for weeks. Today they asked if you want to get coffee after work. If things go wrong, work could be unbearable.',
  choices: [
    { label: 'Yes, let us see what happens',
      effect: s => {
        if (Math.random() < 0.55) {
          s.happiness = Math.min(100, (s.happiness || 50) + 8);
          log('😊 You have a wonderful coffee. A new romance begins.');
          evtRemember('officeRomance', true, 3);
        } else {
          evtAffectPerf(-5);
          fx({ happiness: -6 });
          log('❌ It was awkward. Now every meeting feels tense.');
        }
      }
    },
    { label: 'Politely decline — professional only',
      effect: s => { evtAffectPerf(2); fx({ happiness: -1 }); }
    }
  ]
},

/* ============================================================
   REAL ESTATE — TENANT SIDE (you own a rental property)
   ============================================================ */

{ id: 're_tenant_late_rent', minAge: 26, maxAge: 70, weight: 8, maxFires: 5,
  condition: s => (S.ownedHomes || []).some(function(h) { return h.status === 'rented' && h.tenant; }),
  title: '💸 Tenant Late on Rent',
  text: s => {
    var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
    var rent = home ? home.monthlyRent : 0;
    var tenantName = home && home.tenant ? home.tenant.name : 'Your tenant';
    return tenantName + ' has not paid rent for 2 months. They called in tears: "I lost my job. Please give me more time."\n\nYou are owed ' + money(rent * 2) + '.';
  },
  choices: [
    { label: 'Give them 1 more month',
      effect: s => {
        var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
        if (home && home.tenant) home.tenant.reliability = Math.max(200, (home.tenant.reliability || 500) - 150);
        log('🤝 You gave them grace. They cried with gratitude.');
        fx({ happiness: 3 });
      }
    },
    { label: 'Issue formal eviction notice',
      effect: s => {
        var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
        if (home) evtTenantLeaves(s, home.id);
        log('📄 You evicted them. Legal costs ate a month of rent.');
        s.wealth -= evtMoney(5000);
        fx({ happiness: -3 });
      }
    }
  ]
},

{ id: 're_tenant_damage', minAge: 26, maxAge: 70, weight: 7, maxFires: 4,
  condition: s => (S.ownedHomes || []).some(function(h) { return h.status === 'rented' && h.tenant; }),
  title: '🔨 Tenant Trashed the Place',
  text: s => {
    var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
    var name = home && home.tenant ? home.tenant.name : 'Your tenant';
    return name + ' moved out in the middle of the night. The apartment is destroyed — walls punched, doors broken, food on the floor.\n\nRepair cost: ' + evtMoney(20000).toLocaleString() + ' ' + C().currency + '.';
  },
  choices: [
    { label: 'Repair and re-list the property',
      effect: s => {
        var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
        if (home) {
          s.wealth -= evtMoney(20000);
          evtTenantDamage(s, home.id, 0);
          evtTenantLeaves(s, home.id);
        }
        log('🔨 You paid for repairs. The property is vacant and listed.');
        fx({ happiness: -5 });
      }
    },
    { label: 'Sell it as-is, take the loss',
      effect: s => {
        var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
        if (home) {
          var value = Math.round((home.value || 0) * 0.7);
          s.wealth += value;
          s.ownedHomes = (S.ownedHomes || []).filter(function(x) { return x.id !== home.id; });
          log('💸 Sold at 30% discount for ' + money(value) + '.');
        }
        fx({ happiness: -10 });
      }
    }
  ]
},

{ id: 're_tenant_wants_discount', minAge: 26, maxAge: 70, weight: 6, maxFires: 3,
  condition: s => (S.ownedHomes || []).some(function(h) { return h.status === 'rented' && h.tenant; }),
  title: '🤝 Tenant Wants a Rent Cut',
  text: s => {
    var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
    var rent = home ? home.monthlyRent : 0;
    return 'Your tenant found out the market rate dropped. "I need 20% off or I am leaving." Your current rent: ' + money(rent) + '/month.';
  },
  choices: [
    { label: 'Give them 15% off to keep them',
      effect: s => {
        var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
        if (home) home.monthlyRent = Math.round(home.monthlyRent * 0.85);
        log('🤝 Agreed. Steady income over higher-but-empty rent.');
      }
    },
    { label: 'Call their bluff — no discount',
      effect: s => {
        if (Math.random() < 0.5) {
          log('💪 They stayed. They just wanted to test you.');
          fx({ happiness: 3 });
        } else {
          var home = (S.ownedHomes || []).find(function(h) { return h.status === 'rented' && h.tenant; });
          if (home) evtTenantLeaves(s, home.id);
          fx({ happiness: -4 });
        }
      }
    }
  ]
},

/* ============================================================
   REAL ESTATE — LANDLORD SIDE (you are renting)
   ============================================================ */

{ id: 're_landlord_rent_hike', minAge: 22, maxAge: 65, weight: 8, maxFires: 5,
  condition: s => s.housing === 'rented' && s.rentedHome,
  title: '📈 Landlord Raising Rent',
  text: s => {
    var rent = s.rentedHome.yearlyRent || 0;
    return 'Your landlord called. "Inflation. I am raising the rent by 20%. You can take it or leave by next month."\n\nCurrent: ' + money(rent) + '/year. New: ' + money(rent * 1.20) + '/year.';
  },
  choices: [
    { label: 'Accept the hike',
      effect: s => { evtRentHike(s, 0.20); fx({ happiness: -6 }); }
    },
    { label: 'Negotiate for smaller increase',
      effect: s => {
        if (Math.random() < 0.5) { evtRentHike(s, 0.10); log('🤝 Negotiated to +10%.'); }
        else { evtRentHike(s, 0.20); log('❌ They insisted on 20%.'); }
        fx({ happiness: -3 });
      }
    },
    { label: 'Start looking for a new place',
      effect: s => { log('🔍 You are searching for somewhere cheaper.'); fx({ happiness: -4 }); }
    }
  ]
},

{ id: 're_landlord_evict', minAge: 22, maxAge: 65, weight: 5, maxFires: 3,
  condition: s => s.housing === 'rented' && s.rentedHome,
  title: '🚪 Eviction Notice',
  text: s => 'A formal letter arrived. Your landlord is selling the building. You have 60 days to vacate.',
  choices: [
    { label: 'Accept and find a new place',
      effect: s => {
        evtEvict(s);
        log('🏠 You moved back with your parents for now. Start looking.');
        fx({ happiness: -8 });
      }
    },
    { label: 'Fight the eviction legally',
      effect: s => {
        var legalCost = evtMoney(20000);
        if (s.wealth >= legalCost) {
          s.wealth -= legalCost;
          if (Math.random() < 0.4) {
            log('✅ Judge gave you 6 more months.');
          } else {
            evtEvict(s);
            log('❌ Court sided with landlord. Legal fees wasted.');
          }
        } else {
          evtEvict(s);
          log('❌ Could not afford lawyer. Evicted.');
        }
        fx({ happiness: -5 });
      }
    }
  ]
},

{ id: 're_landlord_no_repair', minAge: 22, maxAge: 65, weight: 6, maxFires: 3,
  condition: s => s.housing === 'rented' && s.rentedHome,
  title: '🔧 Landlord Refuses Repairs',
  text: s => 'The bathroom ceiling is leaking into the living room. You called your landlord three times. He said: "Not my problem, deal with it."',
  choices: [
    { label: 'Pay for repairs yourself',
      effect: s => { s.wealth -= evtMoney(8000); fx({ happiness: -3, health: -1 }); }
    },
    { label: 'Deduct repair cost from next rent',
      effect: s => {
        var home = s.rentedHome;
        if (home) {
          home.yearlyRent = Math.max(0, (home.yearlyRent || 0) - evtMoney(8000));
          log('💸 You deducted from rent. Landlord is furious but legally you are protected.');
        }
        fx({ happiness: 2 });
      }
    },
    { label: 'Move out',
      effect: s => { evtEvict(s); fx({ happiness: -3 }); }
    }
  ]
},

{ id: 're_landlord_sell', minAge: 22, maxAge: 65, weight: 4, maxFires: 2,
  condition: s => s.housing === 'rented' && s.rentedHome,
  title: '🏚 Landlord Selling the Building',
  text: s => 'Your landlord called: "I sold the building. New owner takes over next month. But they want vacant possession. You have 30 days."',
  choices: [
    { label: 'Accept and find a new place',
      effect: s => { evtEvict(s); fx({ happiness: -10 }); }
    },
    { label: 'Negotiate a longer exit window',
      effect: s => {
        if (Math.random() < 0.5) {
          log('🤝 Got 90 days instead. A small win.');
        } else {
          evtEvict(s);
        }
      }
    }
  ]
},

/* ============================================================
   MARRIAGE — CHEATING DISCOVERY (connected to real divorce + custody)
   ============================================================ */

{ id: 'mar_spouse_cheating', minAge: 24, maxAge: 55, weight: 6, maxFires: 2,
  condition: s => evtIsMarried(),
  title: '💔 You Found the Messages',
  text: s => {
    var p = evtPartnerName();
    return 'You picked up ' + p + '\'s phone to check the time. A message from "Cousin Tarek" popped up. It was not from a cousin.\n\nThe evidence is undeniable. ' + p + ' has been having an affair for months.';
  },
  choices: [
    { label: 'Confront them immediately',
      effect: s => {
        var p = evtPartnerName();
        if (Math.random() < 0.5) {
          evtBumpPartner(-30);
          log('😢 ' + p + ' broke down and begged for forgiveness.');
          evtRemember('spouseCheated', true, 5);
        } else {
          evtBumpPartner(-50);
          log('😡 ' + p + ' denied everything. Then packed a bag.');
          evtRemember('spouseCheated', true, 5);
        }
        fx({ happiness: -20, health: -3 });
      }
    },
    { label: 'File for divorce immediately',
      effect: s => { evtForceDivorce(s, 'infidelity'); evtRemember('divorcedForInfidelity', true, 10); }
    },
    { label: 'Say nothing, plan exit quietly',
      effect: s => {
        evtRemember('spouseCheated', true, 5);
        evtRemember('quietExitPlan', true, 3);
        log('🤫 You said nothing. You are planning your exit.');
        fx({ happiness: -15 });
      }
    }
  ]
},

{ id: 'mar_you_cheated_discovered', minAge: 26, maxAge: 55, weight: 5, maxFires: 2,
  condition: s => evtIsMarried() && evtRecall('youCheated') === true,
  title: '🚨 Your Spouse Found Out',
  text: s => {
    var p = evtPartnerName();
    return p + ' is standing in the doorway with your phone. "Who is this? How long has this been going on?"\n\nYou have been caught.';
  },
  choices: [
    { label: 'Confess everything',
      effect: s => {
        evtBumpPartner(-40);
        fx({ happiness: -25, health: -3 });
        log('😢 You confessed. ' + evtPartnerName() + ' is devastated.');
        evtRemember('spouseCheated', true, 5);
      }
    },
    { label: 'Deny everything',
      effect: s => {
        if (Math.random() < 0.25) {
          log('🤥 They believed you. For now.');
        } else {
          evtBumpPartner(-30);
          log('❌ They did not believe you.');
          evtRemember('spouseCheated', true, 5);
        }
        fx({ happiness: -15 });
      }
    }
  ]
},

{ id: 'mar_quiet_exit', minAge: 26, maxAge: 55, weight: 8, maxFires: 1,
  condition: s => evtIsMarried() && evtRecall('quietExitPlan') === true,
  title: '📋 Time to Execute the Exit',
  text: s => 'You have been planning this for months. Now is the moment. All the evidence is gathered. Your lawyer is ready.',
  choices: [
    { label: 'File for divorce',
      effect: s => { evtForceDivorce(s, 'infidelity'); evtForget('quietExitPlan'); }
    },
    { label: 'Cancel the exit — try to forgive',
      effect: s => {
        evtBumpPartner(5);
        evtForget('quietExitPlan');
        log('🤝 You decided to try to save the marriage.');
      }
    }
  ]
},

{ id: 'mar_trial_separation', minAge: 28, maxAge: 55, weight: 5, maxFires: 2,
  condition: s => evtIsMarried() && evtPartner() && (evtPartner().bond || 70) < 40,
  title: '🛏 Trial Separation',
  text: s => {
    var p = evtPartnerName();
    return p + ' sits you down. "Maybe we need space. I will stay at my mother\'s for a while. We should think."';
  },
  choices: [
    { label: 'Agree to trial separation',
      effect: s => {
        evtBumpPartner(-10);
        log('🏠 ' + evtPartnerName() + ' moved out temporarily.');
        fx({ happiness: -8 });
        evtRemember('separated', true, 2);
      }
    },
    { label: 'Fight for the marriage — couples therapy',
      effect: s => {
        var cost = evtMoney(15000);
        if (s.wealth >= cost) {
          s.wealth -= cost;
          evtBumpPartner(15);
          log('💞 Therapy helped. You are rebuilding.');
          fx({ happiness: 5 });
        } else {
          evtBumpPartner(-5);
          fx({ happiness: -5 });
        }
      }
    },
    { label: 'Say "Then let us just divorce"',
      effect: s => { evtForceDivorce(s, 'irreconcilable differences'); }
    }
  ]
},

/* ============================================================
   FUNERALS — REAL DEATHS
   ============================================================ */

{ id: 'fam_parent_funeral', minAge: 25, maxAge: 70, weight: 5, maxFires: 1,
  condition: s => {
    var parent = (S.family || []).find(function(m) {
      return m.alive !== false && (m.role === 'Mother' || m.role === 'Father') && (m.age || 0) >= 68;
    });
    return !!parent;
  },
  title: '🕊 Parent Has Passed',
  text: s => {
    var parent = (S.family || []).find(function(m) {
      return m.alive !== false && (m.role === 'Mother' || m.role === 'Father') && (m.age || 0) >= 68;
    });
    return 'You got the call at 3 AM. ' + (parent ? parent.name : 'Your parent') + ' passed away peacefully in their sleep.\n\nFuneral costs: ' + evtMoney(30000).toLocaleString() + ' ' + C().currency + '.';
  },
  choices: [
    { label: 'Pay for a proper funeral (cash)',
      available: s => s.wealth >= evtMoney(30000),
      effect: s => {
        s.wealth -= evtMoney(30000);
        var parent = (S.family || []).find(function(m) { return m.role === 'Mother' || m.role === 'Father'; });
        if (parent) { parent.alive = false; parent.deathYear = gameYear(); }
        fx({ happiness: -20, health: -3 });
        log('🕊 You gave them a proper goodbye.');
      }
    },
    { label: 'Charge to credit card',
      available: s => typeof evtCreditRoom === 'function' && evtCreditRoom() >= evtMoney(30000),
      effect: s => {
        if (typeof evtChargeCredit === 'function') evtChargeCredit(evtMoney(30000));
        var parent = (S.family || []).find(function(m) { return m.role === 'Mother' || m.role === 'Father'; });
        if (parent) { parent.alive = false; parent.deathYear = gameYear(); }
        fx({ happiness: -20, health: -3 });
      }
    },
    { label: 'Simple burial only',
      available: s => s.wealth >= evtMoney(8000),
      effect: s => {
        s.wealth -= evtMoney(8000);
        var parent = (S.family || []).find(function(m) { return m.role === 'Mother' || m.role === 'Father'; });
        if (parent) { parent.alive = false; parent.deathYear = gameYear(); }
        fx({ happiness: -25, health: -3 });
        log('🕊 A simple ceremony. Family whispered you were cheap.');
      }
    }
  ]
},

{ id: 'friend_funeral', minAge: 22, maxAge: 70, weight: 4, maxFires: 2,
  condition: s => (S.friends || []).some(function(f) { return (f.age || 0) >= 65; }),
  title: '🕊 Friend Has Passed',
  text: s => {
    var friend = (S.friends || []).find(function(f) { return (f.age || 0) >= 65; });
    return 'You got the news: ' + (friend ? friend.name : 'A close friend') + ' passed away. The funeral is tomorrow.';
  },
  choices: [
    { label: 'Attend with a gift of condolence (' + evtMoney(2000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(2000),
      effect: s => {
        s.wealth -= evtMoney(2000);
        if (S.friends && S.friends[0]) S.friends[0].alive = false;
        fx({ happiness: -10, social: 2 });
        log('🕊 You said goodbye properly.');
      }
    },
    { label: 'Send flowers only (' + evtMoney(500).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(500),
      effect: s => {
        s.wealth -= evtMoney(500);
        if (S.friends && S.friends[0]) S.friends[0].alive = false;
        fx({ happiness: -8 });
      }
    }
  ]
},

/* ============================================================
   CONNECTED PUZZLE EVENTS — past choices fire new events
   ============================================================ */

{ id: 'puzzle_mom_remembers_refusal', minAge: 28, maxAge: 60, weight: 12, maxFires: 1,
  condition: s => evtRecall('refusedParentSurgery') === true && evtParent(),
  title: '💔 She Remembers',
  text: s => {
    var parent = evtParent();
    var name = parent ? parent.name : 'Your mother';
    return 'You are short on rent. You call ' + name + ' to ask for help.\n\n"Remember when I needed surgery and you said you could not afford it? Now you come asking me? I am sorry, but no."';
  },
  choices: [
    { label: 'Apologize and try to make it right',
      effect: s => {
        evtBumpFamily(null, 5);
        evtForget('refusedParentSurgery');
        evtRemember('madeAmends', true, 10);
        log('💬 You apologized. It will take time, but she is listening.');
        fx({ happiness: 3 });
      }
    },
    { label: 'Get angry and hang up',
      effect: s => {
        evtBumpFamily(null, -15);
        fx({ happiness: -8 });
        log('💔 The relationship is broken.');
      }
    }
  ]
},

{ id: 'puzzle_coworker_returns_favor', minAge: 26, maxAge: 55, weight: 8, maxFires: 1,
  condition: s => evtRecall('helpedCoworker') === true && evtHasJob(),
  title: '🤝 Karma Comes Back',
  text: s => {
    var job = (s.career && s.career.job) ? s.career.job : s.job;
    return 'A former coworker you once lent money to when they were broke walks up to you at a job fair.\n\n"I am a manager at a new firm now. We are hiring. You helped me when nobody else would. The job is yours if you want it."';
  },
  choices: [
    { label: 'Accept the offer',
      effect: s => {
        var job = (s.career && s.career.job) ? s.career.job : s.job;
        evtPushOffer(s, {
          company: 'Karma Return Inc.',
          title: job ? (job.title || 'Senior') : 'Senior Role',
          track: job ? job.track : 'entry',
          level: job ? ((job.level || 0) + 1) : 1,
          salary: job ? Math.round((job.salary || 0) * 1.30) : 90000,
          message: 'Old favor returned with a 30% raise.'
        });
        evtForget('helpedCoworker');
        log('📬 Offer in Career tab.');
        fx({ happiness: 12 });
      }
    },
    { label: 'Politely decline — happy where you are',
      effect: s => { evtForget('helpedCoworker'); fx({ happiness: 3 }); }
    }
  ]
},

{ id: 'puzzle_sibling_skips_wedding', minAge: 26, maxAge: 45, weight: 10, maxFires: 1,
  condition: s => {
    var hasSibling = (S.family || []).some(function(m) {
      return m.alive !== false && (m.isSibling || m.role === 'Sibling' || m.role === 'Brother' || m.role === 'Sister');
    });
    return hasSibling && evtRecall('skippedSiblingWedding') === true;
  },
  title: '💍 "I Will Not Attend"',
  text: s => 'You are getting married. You call your sibling to invite them.\n\n"I am sorry. When I invited you to my wedding and asked for your help, you said no. So I will not come to yours."',
  choices: [
    { label: 'Apologize for the past',
      effect: s => {
        evtBumpFamily(null, 8);
        evtForget('skippedSiblingWedding');
        log('💬 They agreed to come — but barely.');
        fx({ happiness: 2 });
      }
    },
    { label: 'Accept their choice',
      effect: s => { evtBumpFamily(null, -5); fx({ happiness: -4 }); }
    }
  ]
},

{ id: 'puzzle_child_resents_absence', minAge: 35, maxAge: 60, weight: 8, maxFires: 2,
  condition: s => (S.childrenList || []).some(function(c) { return c.age >= 16 && (c.bond || 55) < 35; }),
  title: '👶 "You Were Never There"',
  text: s => {
    var child = (S.childrenList || []).find(function(c) { return c.age >= 16 && (c.bond || 55) < 35; });
    return (child ? child.name : 'Your child') + ' is home from school. You try to hug them. They pull away.\n\n"You were never around when I needed you. Do not pretend to be a parent now."';
  },
  choices: [
    { label: 'Apologize and try to reconnect',
      effect: s => {
        (S.childrenList || []).forEach(function(c) {
          if (c.age >= 16) c.bond = Math.min(100, (c.bond || 55) + 15);
        });
        evtRemember('reconnectedWithChild', true, 10);
        log('💬 You listened. They are still hurt but listening.');
        fx({ happiness: 3 });
      }
    },
    { label: 'Get defensive',
      effect: s => {
        (S.childrenList || []).forEach(function(c) {
          if (c.age >= 16) c.bond = Math.max(0, (c.bond || 55) - 10);
        });
        fx({ happiness: -6 });
      }
    }
  ]
},

/* ============================================================
   IN-LAW SEVERE DRAMA
   ============================================================ */

{ id: 'inlaw_severe_drama', minAge: 26, maxAge: 55, weight: 6, maxFires: 2,
  condition: s => evtIsMarried() && (s.marriage && (s.marriage.motherInLawBond || 50) < 35),
  title: '👵 In-Law Escalation',
  text: s => {
    var p = evtPartnerName();
    return 'Your mother-in-law calls you screaming: "You have turned my son against me! I will not be disrespected in my own family!"\n\nShe is threatening to go to the newspapers or the family elders.';
  },
  choices: [
    { label: 'Try to smooth things over',
      effect: s => {
        if (s.marriage) s.marriage.motherInLawBond = Math.min(100, (s.marriage.motherInLawBond || 50) + 10);
        evtBumpPartner(2);
        log('🤝 You visited her with a gift. She calmed down. A little.');
        fx({ happiness: -3 });
      }
    },
    { label: 'Set firm boundaries',
      effect: s => {
        if (s.marriage) s.marriage.motherInLawBond = Math.max(0, (s.marriage.motherInLawBond || 50) - 15);
        evtBumpPartner(5);
        log('🚪 "This is my home. I make the rules here." She left in silence.');
        fx({ happiness: 3 });
      }
    },
       { label: s => 'Tell ' + evtPartnerName() + ' to choose between you and her',
      effect: s => {
        if (Math.random() < 0.5) {
          evtBumpPartner(-20);
          log('❌ He chose his mother. The marriage is in crisis.');
        } else {
          evtBumpPartner(15);
          log('✅ He chose you. But she will never forgive you.');
        }
        fx({ happiness: -8 });
      }
    }
  ]
},

/* ============================================================
   SOCIAL / SOCIETY EVENTS
   ============================================================ */

{ id: 'social_class_reunion', minAge: 28, maxAge: 55, weight: 6, maxFires: 3,
  condition: s => (S.friends || []).length > 0,
  title: '🎉 School Reunion',
  text: s => 'You got invited to your high school reunion. Old classmates you have not seen in years. Everyone will be comparing lives.',
  choices: [
    { label: 'Attend and dress to impress (' + evtMoney(3000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(3000),
      effect: s => {
        s.wealth -= evtMoney(3000);
        (S.friends || []).forEach(function(f) { f.bond = Math.min(100, (f.bond || 50) + 4); });
        log('🥂 You looked successful. Reconnected with old friends.');
        fx({ happiness: 6, social: 5 });
      }
    },
    { label: 'Attend in normal clothes (free)',
      effect: s => {
        (S.friends || []).forEach(function(f) { f.bond = Math.min(100, (f.bond || 50) + 2); });
        fx({ happiness: 2, social: 2 });
      }
    },
    { label: 'Skip it',
      effect: s => { fx({ happiness: -1 }); }
    }
  ]
},

{ id: 'social_rumor_spread', minAge: 26, maxAge: 55, weight: 5, maxFires: 2,
  condition: s => evtIsMarried(),
  title: '🗣 Rumors Spreading',
  text: s => {
    var p = evtPartnerName();
    return 'A rumor is spreading through your social circle: someone claimed they saw ' + p + ' acting inappropriately with a coworker at a party.';
  },
  choices: [
    { label: 'Confront the rumor source publicly',
      effect: s => {
        (S.friends || []).forEach(function(f) { f.bond = Math.min(100, (f.bond || 50) + 3); });
        evtBumpPartner(2);
        log('💪 You defended your family publicly. Rumors died down.');
        fx({ happiness: 2 });
      }
    },
    { label: 'Ignore it',
      effect: s => { evtBumpPartner(-3); fx({ happiness: -4, social: -3 }); }
    },
     { label: s => 'Ask ' + evtPartnerName() + ' if it is true',
      effect: s => {
        if (Math.random() < 0.85) {
          evtBumpPartner(-8);
          log('😢 They were devastated you believed the rumor.');
        } else {
          evtBumpPartner(-25);
          log('❌ It was true. Your marriage is broken.');
          evtRemember('spouseCheated', true, 5);
        }
        fx({ happiness: -5 });
      }
    }
  ]
},

{ id: 'social_old_flame', minAge: 26, maxAge: 50, weight: 5, maxFires: 2,
  condition: s => evtIsMarried(),
  title: '🔥 An Old Flame Reappears',
  text: s => 'Your ex messages you out of the blue. "I miss what we had. Coffee sometime? Just to talk." They look even better in their profile picture.',
  choices: [
    { label: 'Ignore the message',
      effect: s => { evtBumpPartner(2); fx({ happiness: 1 }); }
    },
    { label: 'Meet them for coffee (dangerous)',
      effect: s => {
        if (Math.random() < 0.5) {
          log('😬 You drank coffee and talked about the past. Nothing happened. But you feel guilty.');
          evtBumpPartner(-3);
          fx({ happiness: -2 });
        } else {
          log('💋 You kissed them. You are now cheating.');
          evtRemember('youCheated', true, 10);
          evtBumpPartner(-5);
          fx({ happiness: 5, health: -1 });
        }
      }
    },
    { label: 'Block them',
      effect: s => { evtBumpPartner(5); fx({ happiness: 3 }); }
    }
  ]
},

{ id: 'social_neighbor_complaint', minAge: 26, maxAge: 65, weight: 5, maxFires: 3,
  condition: s => s.housing && s.housing !== 'parents' && (S.ownedHomes || []).some(function(h) { return h.status === 'occupied'; }),
  title: '🏘 Neighbor Complaint',
  text: s => 'A formal letter from the building committee arrived. Your neighbor complained about your noise, your guests, and the smell from your kitchen. You are summoned to a meeting.',
  choices: [
    { label: 'Attend and apologize',
      effect: s => { (S.friends || []).forEach(function(f) { f.bond = Math.min(100, (f.bond || 50) + 2); }); fx({ happiness: -2, social: 1 }); }
    },
    { label: 'Fight back — claim they are harassing YOU',
      effect: s => {
        if (Math.random() < 0.4) {
          log('💪 Committee sided with you. Neighbor is now on record as a complainer.');
          fx({ happiness: 3 });
        } else {
          log('❌ Committee sided with neighbor. You now have a formal warning.');
          fx({ happiness: -5 });
        }
      }
    }
  ]
},

{ id: 'social_wedding_season', minAge: 24, maxAge: 40, weight: 8, maxFires: 6,
  condition: s => (S.friends || []).length >= 2,
  title: '💒 Three Weddings This Month',
  text: s => 'Your calendar is packed: three close friends are getting married in the same month. Each expects a generous negoot (cash gift). Total: ' + evtMoney(6000).toLocaleString() + ' ' + C().currency + ' if you attend all properly.',
  choices: [
    { label: 'Attend all with proper gifts (cash)',
      available: s => s.wealth >= evtMoney(6000),
      effect: s => {
        s.wealth -= evtMoney(6000);
        (S.friends || []).forEach(function(f) { f.bond = Math.min(100, (f.bond || 50) + 8); });
        log('💒 You danced at three weddings. You are exhausted and broke.');
        fx({ happiness: 6, social: 6, health: -2 });
      }
    },
    { label: 'Charge to credit card',
      available: s => typeof evtCreditRoom === 'function' && evtCreditRoom() >= evtMoney(6000),
      effect: s => {
        if (typeof evtChargeCredit === 'function') evtChargeCredit(evtMoney(6000));
        (S.friends || []).forEach(function(f) { f.bond = Math.min(100, (f.bond || 50) + 8); });
        fx({ happiness: 5, social: 5 });
      }
    },
    { label: 'Attend one only',
      available: s => s.wealth >= evtMoney(2000),
      effect: s => {
        s.wealth -= evtMoney(2000);
        (S.friends || []).forEach(function(f) { f.bond = Math.min(100, (f.bond || 50) + 2); });
        fx({ happiness: 1, social: -3 });
      }
    },
    { label: 'Skip all and apologize',
      effect: s => {
        (S.friends || []).forEach(function(f) { f.bond = Math.max(0, (f.bond || 50) - 12); });
        fx({ happiness: -3, social: -6 });
      }
    }
  ]
},

/* ============================================================
   FRIEND'S WEDDING — remember choice for future puzzle
   ============================================================ */

{ id: 's_sibling_wedding_connected', minAge: 22, maxAge: 40, weight: 5, maxFires: 2,
  condition: s => (S.family || []).some(function(m) {
    return m.alive !== false && (m.isSibling || m.role === 'Sibling' || m.role === 'Brother' || m.role === 'Sister');
  }),
  title: '💍 Sibling\'s Wedding — Contribute?',
  text: s => 'Your sibling is getting married. Your family is asking for a contribution. Traditionally brothers help with the groom\'s costs, sisters with the bride\'s. Expected: ' + evtMoney(15000).toLocaleString() + ' ' + C().currency + '.',
  choices: [
    { label: 'Pay full contribution',
      available: s => s.wealth >= evtMoney(15000),
      effect: s => {
        s.wealth -= evtMoney(15000);
        evtBumpFamily(null, 15);
        evtRemember('paidSiblingWedding', true, 20);
        log('💍 You helped your sibling. The family is grateful.');
        fx({ happiness: 5, social: 4 });
      }
    },
    { label: 'Charge it to your credit card',
      available: s => typeof evtCreditRoom === 'function' && evtCreditRoom() >= evtMoney(15000),
      effect: s => {
        if (typeof evtChargeCredit === 'function') evtChargeCredit(evtMoney(15000));
        evtBumpFamily(null, 12);
        evtRemember('paidSiblingWedding', true, 20);
        fx({ happiness: 4 });
      }
    },
    { label: 'Contribute what you can',
      available: s => s.wealth >= evtMoney(5000),
      effect: s => {
        s.wealth -= evtMoney(5000);
        evtBumpFamily(null, 5);
        evtRemember('partialSiblingWedding', true, 20);
        fx({ happiness: 1 });
      }
    },
    { label: 'Refuse to contribute',
      effect: s => {
        evtBumpFamily(null, -20);
        evtRemember('skippedSiblingWedding', true, 20);
        log('💔 The family is outraged. Your sibling will not forget this.');
        fx({ happiness: -8, social: -5 });
      }
    }
  ]
},

/* ============================================================
   COWORKER FAVOR — remember for future return
   ============================================================ */

{ id: 'coworker_help_connected', minAge: 24, maxAge: 55, weight: 6, maxFires: 2,
  condition: s => evtHasJob(),
  title: '🤝 Coworker Needs Help',
  text: s => 'A coworker pulls you aside. They cannot make rent this month. "Can you lend me ' + evtMoney(2000).toLocaleString() + ' ' + C().currency + '? I will pay you back with interest."',
  choices: [
    { label: 'Lend the money',
      available: s => s.wealth >= evtMoney(2000),
      effect: s => {
        s.wealth -= evtMoney(2000);
        evtRemember('helpedCoworker', true, 8);
        log('🤝 They thanked you. Remember: what goes around comes around.');
        fx({ happiness: 3 });
      }
    },
    { label: 'Politely refuse',
      effect: s => { fx({ happiness: -1 }); }
    }
  ]
},

{ id: 'parent_surgery_connected', minAge: 24, maxAge: 65, weight: 4, maxFires: 1,
  condition: s => evtParent() && !evtRecall('refusedParentSurgery') && !evtRecall('paidParentSurgery'),
  title: '🏥 Parent Surgery Emergency',
  text: s => {
    var parent = evtParent();
    return (parent ? parent.name : 'Your parent') + ' needs urgent surgery. Hospital demands ' + evtMoney(15000).toLocaleString() + ' ' + C().currency + ' upfront.';
  },
  choices: [
    { label: 'Pay for the surgery (cash)',
      available: s => s.wealth >= evtMoney(15000),
      effect: s => {
        s.wealth -= evtMoney(15000);
        evtBumpFamily(null, 15);
        evtRemember('paidParentSurgery', true, 15);
        log('💰 You saved their life. They will never forget this.');
        fx({ happiness: 5 });
      }
    },
    { label: 'Charge to credit card',
      available: s => typeof evtCreditRoom === 'function' && evtCreditRoom() >= evtMoney(15000),
      effect: s => {
        if (typeof evtChargeCredit === 'function') evtChargeCredit(evtMoney(15000));
        evtBumpFamily(null, 12);
        evtRemember('paidParentSurgery', true, 15);
        fx({ happiness: 3 });
      }
    },
    { label: 'Ask your spouse to help',
      available: s => evtIsMarried(),
      effect: s => {
        if (typeof evtAskPartner === 'function') {
          var r = evtAskPartner(evtMoney(15000));
          if (r.ok) {
            evtBumpFamily(null, 10);
            evtRemember('paidParentSurgery', true, 15);
            fx({ happiness: 3 });
          } else {
            evtBumpFamily(null, -15);
            evtRemember('refusedParentSurgery', true, 15);
            fx({ happiness: -10 });
          }
        }
      }
    },
    { label: 'Say you cannot afford it',
      effect: s => {
        evtBumpFamily(null, -25);
        evtRemember('refusedParentSurgery', true, 15);
        log('💔 The surgery was delayed. The family is shattered.');
        fx({ happiness: -20, health: -5 });
      }
    }
  ]
},

/* ============================================================
   SESSION 5 — GULF OFFERS / STUDY ABROAD / MIGRATION EVENTS
   ============================================================ */

/* ---------- Gulf Job Offer Events ---------- */

{ id: 'gulf_recruiter_offer_sau', minAge: 22, maxAge: 55, weight: 6, maxFires: 2,
  condition: s => S.gulfWork && !S.gulfWork.active && !S.gulfWork.offer && s.country !== 'sau',
  title: '🇸🇦 Saudi Recruiter Called',
  text: s => {
    var job = (s.career && s.career.job) ? s.career.job : s.job;
    var cur = job ? money(job.salary) : 'your current salary';
    return 'A Saudi recruiter found your profile on LinkedIn. They are impressed and want to fly you out for an interview. Their offer would nearly double your salary of ' + cur + '.\n\n"Your skills are exactly what the Kingdom needs."';
  },
  choices: [
    { label: 'Accept the interview — show me the offer',
      effect: s => {
        if (evtPushGulfOffer('sau')) {
          log('🇸🇦 Offer loaded into Career → Gulf tab.');
          log('💼 Go to Career → Gulf Jobs to review and accept.');
          fx({ happiness: 8 });
        } else {
          log('❌ The offer could not be processed.');
        }
      }
    },
    { label: 'Decline — happy where you are',
      effect: s => { fx({ happiness: 2 }); }
    }
  ]
},

{ id: 'gulf_recruiter_offer_uae', minAge: 22, maxAge: 55, weight: 5, maxFires: 2,
  condition: s => S.gulfWork && !S.gulfWork.active && !S.gulfWork.offer && s.country !== 'uae',
  title: '🇦🇪 Dubai Wants You',
  text: s => 'A Dubai-based firm reached out through a mutual contact. They have a role reserved for you if you are interested. No tax. Housing allowance. Flights home once a year.\n\n"You can double your savings within 2 years."',
  choices: [
    { label: 'Show me the offer',
      effect: s => {
        if (evtPushGulfOffer('uae')) {
          log('🇦🇪 Offer loaded. Check Career → Gulf Jobs.');
          fx({ happiness: 8 });
        } else {
          log('❌ Could not process the offer.');
        }
      }
    },
    { label: 'Not interested',
      effect: s => { fx({ happiness: 1 }); }
    }
  ]
},

{ id: 'gulf_visit_offer', minAge: 26, maxAge: 50, weight: 4, maxFires: 1,
  condition: s => S.gulfWork && !S.gulfWork.active && !S.gulfWork.offer && (S.job || (S.career && S.career.job)),
  title: '🇸🇦 Former Colleague Wants You Back',
  text: s => 'Someone you used to work with is now a hiring manager in Saudi Arabia. They called you directly: "You were the best. Come work with me. I will make it worth your while."',
  choices: [
    { label: 'Accept the offer',
      effect: s => {
        if (evtPushGulfOffer('sau')) {
          log('🇸🇦 Offer ready in Career → Gulf Jobs.');
          fx({ happiness: 10 });
        } else {
          log('❌ Offer could not be generated.');
        }
      }
    },
    { label: 'Politely decline',
      effect: s => { fx({ happiness: 1 }); }
    }
  ]
},

/* ---------- Study Abroad Acceptance Events ---------- */

{ id: 'study_abroad_oxford', minAge: 17, maxAge: 24, weight: 3, maxFires: 1,
  condition: s => {
    if (S.uni || S.studyAbroad) return false;
    var ielts = (S.languageScores && S.languageScores.ielts) || 0;
    var toefl = (S.languageScores && S.languageScores.toefl) || 0;
    return (ielts >= 7.5 || toefl >= 110) && S.smarts >= 85;
  },
  title: '🎓 Oxford Letter Arrived',
  text: s => 'An envelope arrived from the UK with that familiar blue crest. You got in. The University of Oxford has offered you a place.\n\nTuition alone is £45,000 a year. You have to decide.',
  choices: [
    { label: 'Accept — move to Oxford (self-funded)',
      effect: s => {
        if (evtPushStudyAbroad('oxford', 'economics')) {
          log('✈️ You moved to Oxford. A new life begins.');
          fx({ happiness: 25, smarts: 5 });
        } else {
          log('❌ Move failed.');
        }
      }
    },
    { label: 'Decline — cannot afford it',
      effect: s => { fx({ happiness: -10 }); }
    }
  ]
},

{ id: 'study_abroad_germany', minAge: 17, maxAge: 24, weight: 4, maxFires: 1,
  condition: s => {
    if (S.uni || S.studyAbroad) return false;
    var goethe = (S.languageScores && S.languageScores.goethe) || 0;
    return goethe >= 3 && S.smarts >= 70;
  },
  title: '🎓 TU Munich Accepts You',
  text: s => 'Germany offers almost-free tuition if you speak the language. You do. TU Munich just sent you an admission letter.\n\nThis is your chance. The cost of living is the only real hurdle.',
  choices: [
    { label: 'Accept — move to Munich',
      effect: s => {
        if (evtPushStudyAbroad('tum', 'engineering')) {
          log('✈️ You moved to Munich. Free tuition. New life.');
          fx({ happiness: 20, smarts: 3 });
        } else {
          log('❌ Move failed.');
        }
      }
    },
    { label: 'Decline — cannot leave family',
      effect: s => { fx({ happiness: -5 }); }
    }
  ]
},

{ id: 'study_abroad_toronto', minAge: 17, maxAge: 24, weight: 3, maxFires: 1,
  condition: s => {
    if (S.uni || S.studyAbroad) return false;
    var ielts = (S.languageScores && S.languageScores.ielts) || 0;
    return ielts >= 6.5 && S.smarts >= 70;
  },
  title: '🎓 Toronto Admission',
  text: s => 'The University of Toronto has accepted you. Canada. Cold, but full of opportunity. And a pathway to permanent residency after graduation.\n\nThis is the move that changes the trajectory of your life.',
  choices: [
    { label: 'Accept — move to Toronto',
      effect: s => {
        if (evtPushStudyAbroad('toronto', 'cs')) {
          log('✈️ You moved to Toronto. A new chapter.');
          fx({ happiness: 20, smarts: 3 });
        } else {
          log('❌ Move failed.');
        }
      }
    },
    { label: 'Decline — stay close to home',
      effect: s => { fx({ happiness: -3 }); }
    }
  ]
},

/* ---------- Migration Decision Events ---------- */

{ id: 'migration_job_abroad', minAge: 25, maxAge: 50, weight: 5, maxFires: 2,
  condition: s => {
    if (s.country !== 'egy') return false;
    if (!evtHasJob()) return false;
    if (S.immigration && S.immigration.status === 'visa_work') return false;
    return true;
  },
  title: '🌍 International Job Offer',
  text: s => {
    var target = (s.career && s.career.job && s.career.job.track === 'tech') ? 'deu' :
                 (s.career && s.career.job && s.career.job.track === 'medicine') ? 'gbr' :
                 (s.career && s.career.job && s.career.job.track === 'engineering') ? 'can' :
                 'gbr';
    var countryName = (COUNTRIES[target] && COUNTRIES[target].name) || target;
    return 'A recruiter from ' + countryName + ' reached out. They want you. They will handle relocation and the work visa.\n\nA move like this changes everything — your salary, your lifestyle, your children\'s future.';
  },
  choices: [
    { label: 'Accept — move abroad',
      effect: s => {
        var target = (s.career && s.career.job && s.career.job.track === 'tech') ? 'deu' :
                     (s.career && s.career.job && s.career.job.track === 'medicine') ? 'gbr' :
                     (s.career && s.career.job && s.career.job.track === 'engineering') ? 'can' :
                     'gbr';
        var success = evtMigrateTo(target);
        if (success) {
          if (S.immigration) {
            S.immigration.status = 'visa_work';
            S.immigration.visaType = 'work';
            S.immigration.destination = target;
            S.immigration.workRights = 'full';
            S.immigration.sponsor = 'employer';
            S.immigration.expiresYear = gameYear() + 3;
          }
          log('🌍 You emigrated to ' + (COUNTRIES[target] ? COUNTRIES[target].name : target) + '.');
          log('💼 Check the Immigration tab for your new status.');
          fx({ happiness: 20, social: -10 });
        } else {
          log('❌ Move failed.');
        }
      }
    },
    { label: 'Decline — family and home matter more',
      effect: s => { fx({ happiness: 3, social: 2 }); evtBumpFamily(null, 5); }
    }
  ]
},

{ id: 'migration_marriage_abroad', minAge: 24, maxAge: 45, weight: 4, maxFires: 1,
  condition: s => {
    if (s.country !== 'egy') return false;
    if (!evtIsMarried()) return false;
    var p = evtPartner();
    return p && ((p.income || 0) > 500000 || (p.traits && p.traits.indexOf('ambitious') >= 0));
  },
  title: '💼 Partner\'s Job Abroad',
  text: s => {
    var p = evtPartnerName();
    return p + ' has been offered a senior role in the Gulf. The pay is triple what they make here. But it means leaving Egypt. Leaving family. Starting over.\n\n"What do you think?"';
  },
  choices: [
    { label: 'Support the move — we go together',
      effect: s => {
        if (evtMigrateTo('uae')) {
          if (S.immigration) {
            S.immigration.status = 'visa_work';
            S.immigration.visaType = 'work';
            S.immigration.destination = 'uae';
            S.immigration.workRights = 'full';
            S.immigration.expiresYear = gameYear() + 3;
          }
          evtBumpPartner(15);
          log('🌍 You moved to the UAE with your spouse.');
          fx({ happiness: 8 });
        }
      }
    },
    { label: 'Refuse — you will stay here',
      effect: s => {
        evtBumpPartner(-20);
        fx({ happiness: -10 });
        log('💔 The fight that followed was brutal.');
      }
    }
  ]
},

{ id: 'migration_return_home', minAge: 30, maxAge: 60, weight: 5, maxFires: 2,
  condition: s => {
    if (s.country === (s.homeCountry || s.country)) return false;
    return true;
  },
  title: '🏠 Home Is Calling',
  text: s => {
    var homeName = (COUNTRIES[S.homeCountry] && COUNTRIES[S.homeCountry].name) || 'home';
    return 'You have been away from ' + homeName + ' for years. Your parents are getting older. Your friends have moved on. The pull to go back is strong.\n\nWould you leave your career abroad to return home?';
  },
  choices: [
    { label: 'Return home — money is not everything',
      effect: s => {
        var home = S.homeCountry || 'egy';
        if (evtMigrateTo(home)) {
          if (S.immigration) {
            S.immigration.status = 'citizen_home';
            S.immigration.visaType = null;
            S.immigration.destination = null;
            S.immigration.workRights = 'full';
          }
          evtBumpFamily(null, 20);
          log('🏠 You returned to ' + (COUNTRIES[home] ? COUNTRIES[home].name : home) + '. Family is overjoyed.');
          fx({ happiness: 20, social: 15 });
        }
      }
    },
    { label: 'Stay abroad — you have built a life here',
      effect: s => {
        evtBumpFamily(null, -10);
        fx({ happiness: -5 });
        log('💔 Your parents understood. But you felt the distance.');
      }
    }
  ]
}

];

window.DEEP_EVENTS = DEEP_EVENTS;

/* ============================================================
   INIT
   ============================================================ */
if (S && !S.evtMemory) S.evtMemory = {};
console.log('[World Life] 02b-data-events-deep.js loaded — ' + DEEP_EVENTS.length + ' connected events');
