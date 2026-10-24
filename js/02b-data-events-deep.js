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
     if (typeof recordMoment === 'function') {
    recordMoment(
      'The day you moved to ' + (COUNTRIES[newCountry] ? COUNTRIES[newCountry].name : newCountry),
      'You packed what mattered most. You gave the rest away. You boarded a plane with your whole life in two bags.',
      { icon: '✈️', key: 'migration_' + newCountry + '_' + gameYear(), weight: 3 }
    );
  }
  if (typeof checkReflectionTriggers === 'function') {
    checkReflectionTriggers('migrated', { from: oldCountry, to: newCountry });
  }
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
},

/* ============================================================
   WEEK 4 — STAY-HOME EVENTS (both POVs, real career mutations)
   ============================================================ */

{ id: 'stay_home_early_marriage', minAge: 23, maxAge: 45, weight: 9, maxFires: 1,
  condition: s => {
    if (!evtIsMarried()) return false;
    var p = evtPartner();
    if (!p || !p.career) return false;
    if (!p.career.working) return false;
    if (S.gender === 'f' && !(s.career && s.career.job)) return false;
    if (S.gender === 'm' && !p.career.working) return false;
    var married = (S.marriage.partner && S.marriage.partner.marriedYear) || gameYear();
    var years = gameYear() - married;
    return years >= 1 && years <= 4;
  },
  title: '🏡 The Stay-Home Question',
  text: s => {
    var p = evtPartner();
    if (S.gender === 'f') {
      return p.name + ' brings it up after dinner, casually at first then with growing seriousness.\n\n"I have been thinking. Your job takes so much of you. What if you stopped working? Stayed home. Managed our life. Made this a real home instead of two exhausted people passing each other."\n\nHe waits. This is not a small ask.';
    }
    return p.name + ' sits down with you one evening, hands wrapped around her tea.\n\n"I am so tired. I love my job, but I come home and I am empty. I have been thinking — what if I stopped working? Stayed home, took care of the house, maybe we try for a baby."\n\nShe is not asking for permission. She is asking for your blessing.';
  },
  choices: [
    { label: s => S.gender === 'f'
        ? 'Accept — quit my job and become a housewife'
        : 'Support her — she can stop working',
      effect: s => {
        var p = evtPartner();
        if (S.gender === 'f') {
          if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('became housewife at husband\'s request');
          if (s.career) s.career.job = null;
          s.marriage.financeModel = 'male_provider';
          evtBumpPartner(10);
          relRemember(p, 'decision', 'Gave up her career to become a housewife', true);
          fx({ happiness: -4, health: 2, smarts: -1 });
          log('🏡 You left your job. Your identity shifts — you are now a housewife.');
                     if (typeof recordMoment === 'function') {
            recordMoment('The day you became a housewife', 'You folded up your work clothes. You did not know what to do with your mornings.', { icon: '🏡', key: 'stay_home_marriage', weight: 2 });
          }
          if (typeof emitReflection === 'function') {
            emitReflection('You are a housewife now. The word sounds like someone else. You are not sure how you feel about that.', { mood: 'reflective' });
          }
          log('💼 ' + p.name + ': "Thank you. I will take care of everything."');
        } else {
          if (p.career) {
            p.career.working = false;
            p.career.quitYear = gameYear();
            if (!p.career.gaps) p.career.gaps = [];
            p.career.gaps.push({ start: gameYear(), reason: 'stayed home with husband' });
            p.income = 0;
          }
          s.marriage.financeModel = 'male_provider';
          evtBumpPartner(10);
          relRemember(p, 'decision', 'Supported her choice to become a housewife', true);
          fx({ happiness: 6 });
          log('🏡 ' + p.name + ' quit her job. She is now home full-time.');
                     if (typeof recordMoment === 'function') {
            recordMoment('The day ' + p.name + ' quit her job', 'She seemed lighter. You felt a strange weight, being the only earner now.', { icon: '🏡', key: 'wife_stay_home_marriage', weight: 2 });
          }
          log('💼 ' + p.name + ': "I feel like I can breathe for the first time in years."');
        }
      }
    },
    { label: s => S.gender === 'f'
        ? 'Refuse — my career is not negotiable'
        : 'Refuse — we need her income',
      effect: s => {
        var p = evtPartner();
        if (S.gender === 'f') {
          evtBumpPartner(-15);
          relRemember(p, 'hurt', 'Refused his request to quit her job', false);
          fx({ happiness: -3, social: -2 });
          log('💢 ' + p.name + ': "So your career matters more than our home. I will remember this."');
        } else {
          evtBumpPartner(-10);
          relRemember(p, 'hurt', 'Refused her request to stay home', false);
          fx({ happiness: -4 });
          log('💔 ' + p.name + ' looked away. "Fine. Forget I asked."');
        }
      }
    },
    { label: 'Compromise — try part-time or remote work',
      effect: s => {
        var p = evtPartner();
        if (S.gender === 'f') {
          if (s.career && s.career.job) {
            s.career.job.salary = Math.round((s.career.job.salary || 0) * 0.6);
            s.career.job.hours = 'part-time';
            log('🕐 You cut your hours to part-time. A middle path.');
          }
          relRemember(p, 'compromise', 'Reduced her hours to part-time as a compromise', true);
        } else {
          if (p.career) {
            p.career.working = 'part-time';
            p.income = Math.round((p.career.salary || 0) * 0.6);
            p.career.salary = p.income;
            log('🕐 ' + p.name + ' cut back to part-time work.');
          }
          relRemember(p, 'compromise', 'Agreed to part-time rather than full quit', true);
        }
        evtBumpPartner(6);
        fx({ happiness: 3 });
      }
    },
    { label: 'Defer — "Let us talk again after a baby"',
      effect: s => {
        var p = evtPartner();
        if (!p.career) p.career = {};
        p.career.deferredDiscussion = true;
        relRemember(p, 'promise', 'Promised to revisit the stay-home question later', false);
        evtBumpPartner(1);
        log('💬 You put the question off for now.');
      }
    }
  ]
},

{ id: 'stay_home_after_baby', minAge: 26, maxAge: 45, weight: 12, maxFires: 1,
  condition: s => {
    if (!evtIsMarried()) return false;
    if (!evtHasChildren()) return false;
    var p = evtPartner();
    if (!p) return false;
    if (p.career && p.career.working === false) return false;
    if (S.gender === 'f' && !(s.career && s.career.job)) return false;
    var youngest = (S.childrenList || []).reduce(function(a, c) {
      return (a === null || c.age < a.age) ? c : a;
    }, null);
    return youngest && youngest.age <= 2;
  },
  title: '👶 The Baby Changes Everything',
  text: s => {
    var p = evtPartner();
    var baby = (S.childrenList || []).reduce(function(a, c) {
      return (a === null || c.age < a.age) ? c : a;
    }, null);
    var babyName = baby ? baby.name : 'the baby';
    if (S.gender === 'f') {
      return 'You have not slept through a night in weeks. ' + babyName + ' is crying again. Your work performance is falling apart. ' + p.name + ' holds the baby and looks at you with tired eyes.\n\n"Please. Stop working. Just until the baby is older. My salary can cover us. I cannot watch you destroy yourself trying to do both."';
    }
    return p.name + ' is on the edge of tears. ' + babyName + ' is finally asleep. She has not slept in weeks.\n\n"I cannot do both. I cannot be a mother and work like this. Something has to give. Please — let me stay home. Just while the baby is small."';
  },
  choices: [
    { label: s => S.gender === 'f'
        ? 'Agree — take a career break for the baby'
        : 'Agree — she stays home with the baby',
      effect: s => {
        var p = evtPartner();
        if (S.gender === 'f') {
          if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('took career break for baby');
          if (s.career) s.career.job = null;
          s.marriage.financeModel = 'male_provider';
          relRemember(p, 'decision', 'Left job to raise the baby at husband\'s request', true);
          evtBumpPartner(15);
          fx({ happiness: 3, health: 5, smarts: -2 });
          log('🍼 You left your job to raise ' + babyName + '. Your career is on hold.');
                     if (typeof recordMoment === 'function') {
            recordMoment('The day you left work to raise ' + babyName, 'The apartment is quieter in the mornings now. You still wake up at office hours out of habit.', { icon: '🍼', key: 'stay_home_baby', weight: 3 });
          }
        } else {
          if (p.career) {
            p.career.working = false;
            p.career.quitYear = gameYear();
            if (!p.career.gaps) p.career.gaps = [];
            p.career.gaps.push({ start: gameYear(), reason: 'baby' });
            p.income = 0;
          }
          s.marriage.financeModel = 'male_provider';
          relRemember(p, 'decision', 'Supported her staying home with the baby', true);
          evtBumpPartner(15);
          fx({ happiness: 8 });
          log('🍼 ' + p.name + ' is home with ' + babyName + ' now.');
        }
      }
    },
    { label: s => S.gender === 'f'
        ? 'Refuse — I need my career and my income'
        : 'Refuse — we need her income',
      effect: s => {
        var p = evtPartner();
        evtBumpPartner(-18);
        relRemember(p, 'hurt', 'Refused to allow stay-home after baby', false);
        fx({ happiness: -10, health: -3 });
        if (s.marriage) s.marriage.pendingConflict = 'children';
        if (S.gender === 'f') {
          log('💔 ' + p.name + ' quietly left the room. The silence between you was heavy.');
        } else {
          log('💔 ' + p.name + ' cried. She did not say anything. You both knew something broke.');
        }
      }
    },
    { label: 'Compromise — part-time for now',
      effect: s => {
        var p = evtPartner();
        if (S.gender === 'f') {
          if (s.career && s.career.job) s.career.job.salary = Math.round((s.career.job.salary || 0) * 0.6);
          relRemember(p, 'compromise', 'Agreed to part-time work while baby was young', true);
        } else {
          if (p.career) {
            p.career.working = 'part-time';
            p.income = Math.round((p.career.salary || 0) * 0.6);
            p.career.salary = p.income;
          }
          relRemember(p, 'compromise', 'Agreed to part-time while baby was young', true);
        }
        evtBumpPartner(8);
        fx({ happiness: 4 });
      }
    },
    { label: 'Hire a nanny instead',
      available: s => s.wealth >= evtMoney(20000),
      effect: s => {
        s.wealth -= evtMoney(20000);
        var p = evtPartner();
        relRemember(p, 'compromise', 'Hired a nanny so both could keep working', true);
        evtBumpPartner(6);
        fx({ happiness: 3 });
        log('👶 You hired a nanny for ' + evtMoney(20000).toLocaleString() + ' ' + C().currency + '/year.');
      }
    }
  ]
},

{ id: 'stay_home_return_to_work', minAge: 30, maxAge: 52, weight: 7, maxFires: 2,
  condition: s => {
    if (!evtIsMarried()) return false;
    if (!evtHasChildren()) return false;
    var p = evtPartner();
    if (!p) return false;
    if (S.gender === 'f') {
      return !(s.career && s.career.job) && (S.childrenList || []).some(function(c) { return c.age >= 3 && c.age <= 7; });
    }
    if (!p.career || p.career.working !== false) return false;
    return (S.childrenList || []).some(function(c) { return c.age >= 3 && c.age <= 7; });
  },
  title: '💼 The Restless Years',
  text: s => {
    var p = evtPartner();
    if (S.gender === 'f') {
      return 'The youngest just started school. You have spent years at home. You love your children — but you miss who you used to be.\n\nYou bring it up with ' + p.name + ': "I think I want to work again."';
    }
    return p.name + ' has been home with the children. Now the youngest is in school. She sits you down quietly.\n\n"I want to go back to work. Not full-time, maybe. But I need something for myself. I am losing who I am."';
  },
  choices: [
    { label: s => S.gender === 'f'
        ? 'Yes — start looking for work again'
        : 'Support her — she can go back to work',
      effect: s => {
        var p = evtPartner();
        if (S.gender === 'f') {
          if (s.career) {
            var rate = C().rate || 1;
            var sal = Math.round(80000 / 52.7 * rate);
            s.career.job = {
              title: 'Returning Professional',
              salary: sal,
              level: 0,
              company: 'New Employer',
              track: 'entry',
              baseSalaryEGP: sal,
              payMult: 1.0,
              performance: 50,
              hiredYear: gameYear(),
              tenure: 0,
              benefits: [],
              stability: 0.85,
              prestige: 3,
              salaryCurrency: C().currency
            };
            log('💼 You found a job. Salary is lower than before, but you are back.');
          }
          relRemember(p, 'decision', 'Chose to return to work after raising children', true);
        } else {
          if (p.career) {
            p.career.working = true;
            p.income = Math.round((p.career.salary || 0) * 0.7);
            p.career.salary = p.income;
            log('💼 ' + p.name + ' returned to work. Her salary is lower after the gap.');
          }
          relRemember(p, 'decision', 'Supported her return to work after children', true);
        }
        evtBumpPartner(8);
        fx({ happiness: 6 });
      }
    },
    { label: 'Refuse — we do not need the money',
      effect: s => {
        var p = evtPartner();
        evtBumpPartner(-10);
        relRemember(p, 'hurt', 'Refused her request to return to work', false);
        fx({ happiness: -6 });
        log('💔 She did not argue. That was worse.');
      }
    }
  ]
}

];
/* ============================================================
   SESSION 10: THREE-GENERATION FAMILY EVENTS
   ============================================================ */

DEEP_EVENTS.push(

{ id: 'inlaw_severe_criticism', minAge: 26, maxAge: 55, weight: 6, maxFires: 4,
  condition: s => {
    if (typeof getInLaws !== 'function') return false;
    var inlaws = getInLaws().filter(function(m) { return m.alive !== false && m.role === 'Mother-in-law'; });
    return inlaws.length > 0 && (inlaws[0].bond || 50) < 40;
  },
  title: '👵 Mother-in-Law Visits',
  text: s => {
    var mil = getInLaws().find(function(m) { return m.role === 'Mother-in-law' && m.alive !== false; });
    if (!mil) return 'Your mother-in-law called.';
    return mil.name + ' arrives unannounced. She walks through the apartment, runs a finger over the shelves, and says:\n\n"This is how you keep my child\'s home? I did not raise them for this."';
  },
  choices: [
    { label: 'Stand up for yourself',
      effect: s => {
        var mil = getInLaws().find(function(m) { return m.role === 'Mother-in-law' && m.alive !== false; });
        if (mil) mil.bond = Math.max(0, (mil.bond || 50) - 15);
        if (s.marriage && s.marriage.partner) s.marriage.partner.bond = Math.min(100, (s.marriage.partner.bond || 70) + 5);
        fx({ happiness: 4 });
        log('💪 You told her this is your home. She left in silence.');
      }
    },
    { label: 'Apologize and clean immediately',
      effect: s => {
        var mil = getInLaws().find(function(m) { return m.role === 'Mother-in-law' && m.alive !== false; });
        if (mil) mil.bond = Math.min(100, (mil.bond || 50) + 10);
        fx({ happiness: -5 });
        log('😔 You apologized. She nodded. You cleaned the whole house.');
      }
    },
    { label: 'Ask spouse to intervene',
      effect: s => {
        if (s.marriage && s.marriage.partner && (s.marriage.partner.bond || 70) > 60) {
          var mil = getInLaws().find(function(m) { return m.role === 'Mother-in-law' && m.alive !== false; });
          if (mil) mil.bond = Math.max(0, (mil.bond || 50) - 8);
          log('💬 Your spouse spoke to their mother. She backed down.');
          fx({ happiness: 3 });
        } else {
          log('💔 Your spouse stayed silent. You were alone in the fight.');
          fx({ happiness: -6 });
        }
      }
    }
  ]
},

{ id: 'niece_nephew_birth', minAge: 22, maxAge: 60, weight: 6, maxFires: 5,
  condition: s => {
    if (typeof getAllNiecesNephews !== 'function') return false;
    var nn = getAllNiecesNephews();
    return nn.some(function(x) { return (x.age || 0) <= 1; });
  },
  title: '👶 New Niece or Nephew',
  text: s => {
    var nn = getAllNiecesNephews().find(function(x) { return (x.age || 0) <= 1; });
    if (!nn) return 'Your sibling had a baby.';
    return 'Your ' + (nn.parentRole ? nn.parentRole.toLowerCase() : 'sibling') + ' ' + nn.parentName + ' just welcomed a baby — ' + nn.name + '.\n\nYou are expected to visit, bring a gift, and hold the baby.';
  },
  choices: [
    { label: 'Buy a gift and visit (' + evtMoney(1500).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(1500),
      effect: s => {
        s.wealth -= evtMoney(1500);
        (s.family || []).forEach(function(m) {
          if (isSiblingOf(m) && m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 10);
        });
        fx({ happiness: 6 });
        log('🎁 You brought a thoughtful gift. Your family loved it.');
      }
    },
    { label: 'Just visit (no gift)',
      effect: s => {
        (s.family || []).forEach(function(m) {
          if (isSiblingOf(m) && m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 4);
        });
        fx({ happiness: 2 });
      }
    },
    { label: 'Send a message only',
      effect: s => {
        (s.family || []).forEach(function(m) {
          if (isSiblingOf(m) && m.alive !== false) m.bond = Math.max(0, (m.bond || 70) - 5);
        });
        fx({ happiness: -2 });
      }
    }
  ]
},

{ id: 'grandchild_birth', minAge: 40, maxAge: 75, weight: 8, maxFires: 8,
  condition: s => {
    if (typeof getAllGrandchildren !== 'function') return false;
    return getAllGrandchildren().some(function(gc) { return (gc.age || 0) <= 1; });
  },
  title: '👶 Grandchild Born',
  text: s => {
    var gc = getAllGrandchildren().find(function(x) { return (x.age || 0) <= 1; });
    if (!gc) return 'You became a grandparent.';
    return 'Your child ' + gc.parentName + ' just had a baby. ' + gc.name + ' — ' + gc.age + ' year' + (gc.age !== 1 ? 's' : '') + ' old.\n\nYou are a grandparent now. This is the beginning of a new chapter.';
  },
  choices: [
    { label: 'Rush to see them (buy gift ' + evtMoney(3000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(3000),
      effect: s => {
        s.wealth -= evtMoney(3000);
        (S.childrenList || []).forEach(function(c) { c.bond = Math.min(100, (c.bond || 55) + 8); });
        fx({ happiness: 15 });
        log('👶 You held ' + (getAllGrandchildren()[0] || {}).name + ' in your arms. The world stopped.');
        if (typeof emitReflection === 'function') {
          emitReflection('You are a grandparent now. You did not know this was possible — this particular joy. This particular peace.', { mood: 'hopeful' });
        }
      }
    },
    { label: 'Call to congratulate (free)',
      effect: s => {
        (S.childrenList || []).forEach(function(c) { c.bond = Math.min(100, (c.bond || 55) + 3); });
        fx({ happiness: 8 });
      }
    }
  ]
},

{ id: 'sibling_death_grief', minAge: 40, maxAge: 80, weight: 3, maxFires: 3,
  condition: s => {
    if (!S || !Array.isArray(S.family)) return false;
    return S.family.some(function(m) { return isSiblingOf(m) && m.alive === false && m.deathYear === gameYear(); });
  },
  title: '🕊 Sibling Passed',
  text: s => {
    var dead = (S.family || []).find(function(m) { return isSiblingOf(m) && m.alive === false && m.deathYear === gameYear(); });
    if (!dead) return 'Someone you loved passed away.';
    return 'Your ' + (dead.role || 'sibling') + ' ' + dead.name + ' passed away at ' + dead.age + '.\n\nYour childhood is over. There is nobody left who remembers you as a child.';
  },
  choices: [
    { label: 'Attend the funeral (cost ' + evtMoney(8000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(8000),
      effect: s => {
        s.wealth -= evtMoney(8000);
        (s.family || []).forEach(function(m) { if (m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 10); });
        fx({ happiness: -15, health: -3 });
        if (typeof emitReflection === 'function') {
          emitReflection('You said goodbye at the funeral. Their children will remember you. That is what is left.', { mood: 'sad' });
        }
      }
    },
    { label: 'You cannot face it',
      effect: s => {
        (s.family || []).forEach(function(m) { if (m.alive !== false) m.bond = Math.max(0, (m.bond || 70) - 10); });
        fx({ happiness: -20 });
        log('💔 You did not attend. The family was hurt.');
      }
    }
  ]
},

{ id: 'grandchild_stays_over', minAge: 45, maxAge: 75, weight: 7, maxFires: 6,
  condition: s => {
    if (typeof getAllGrandchildren !== 'function') return false;
    return getAllGrandchildren().some(function(gc) { return (gc.age || 0) >= 4 && (gc.age || 0) <= 14; });
  },
  title: '👴 Grandchild Visits',
  text: s => {
    var gc = getAllGrandchildren().find(function(x) { return (x.age || 0) >= 4 && (x.age || 0) <= 14; });
    if (!gc) return 'Your grandchild is coming over.';
    return gc.name + ' is coming to stay with you for the weekend.\n\nThey want you to make their favorite food, tell them stories, and let them stay up late.';
  },
  choices: [
    { label: 'Spoil them rotten (cost ' + evtMoney(500).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(500),
      effect: s => {
        s.wealth -= evtMoney(500);
        (S.childrenList || []).forEach(function(c) {
          (c.children || []).forEach(function(gc) {
            gc.bond = Math.min(100, (gc.bond || 70) + 10);
          });
        });
        fx({ happiness: 12 });
        log('👴 You made their favorite food. They said "you are the best grandma/grandpa."');
        if (typeof emitReflection === 'function') {
          emitReflection('Your grandchild hugged you so hard you felt your age. And you were glad.', { mood: 'tender' });
        }
      }
    },
    { label: 'Keep it quiet and simple',
      effect: s => {
        fx({ happiness: 5 });
      }
    }
  ]
},

{ id: 'child_divorce', minAge: 42, maxAge: 75, weight: 4, maxFires: 3,
  condition: s => {
    if (!Array.isArray(S.childrenList)) return false;
    return S.childrenList.some(function(c) { return c.age >= 22 && c.spouse && Math.random() < 0.1; });
  },
  title: '💔 Your Child Is Divorcing',
  text: s => {
    var c = (S.childrenList || []).find(function(ch) { return ch.age >= 22 && ch.spouse; });
    if (!c) return 'Your child is going through a divorce.';
    return c.name + ' calls you in tears. "The marriage is over. I am leaving. I do not know what to do."';
  },
  choices: [
    { label: 'Support them emotionally',
      effect: s => {
        (S.childrenList || []).forEach(function(ch) {
          if (ch.age >= 22) ch.bond = Math.min(100, (ch.bond || 55) + 15);
        });
        fx({ happiness: -5, social: 2 });
        log('💬 You held them. They cried for hours. You did what a parent does.');
      }
    },
    { label: 'Give them a large financial buffer (' + evtMoney(15000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(15000),
      effect: s => {
        s.wealth -= evtMoney(15000);
        (S.childrenList || []).forEach(function(ch) {
          if (ch.age >= 22) ch.bond = Math.min(100, (ch.bond || 55) + 20);
        });
        fx({ happiness: 3 });
        log('💸 You sent them money to start over. They thanked you through tears.');
      }
    },
    { label: 'Tell them to work it out',
      effect: s => {
        (S.childrenList || []).forEach(function(ch) {
          if (ch.age >= 22) ch.bond = Math.max(0, (ch.bond || 55) - 12);
        });
        fx({ happiness: -8 });
        log('💔 They hung up. They did not call back for weeks.');
      }
    }
  ]
},

{ id: 'inlaw_wedding', minAge: 30, maxAge: 55, weight: 5, maxFires: 2,
  condition: s => {
    if (typeof getInLaws !== 'function') return false;
    return getInLaws().some(function(m) { return m.role === 'Sister-in-law' || m.role === 'Brother-in-law'; });
  },
  title: '💍 Sibling-in-Law Wedding',
  text: s => {
    var sil = getInLaws().find(function(m) { return m.role === 'Sister-in-law' || m.role === 'Brother-in-law'; });
    if (!sil) return 'Your sibling-in-law is getting married.';
    return sil.name + ' — your spouse\'s sibling — is getting married. You are expected to attend and contribute.\n\nExpected contribution: ' + evtMoney(4000).toLocaleString() + ' ' + C().currency + '.';
  },
  choices: [
    { label: 'Attend with full contribution',
      available: s => s.wealth >= evtMoney(4000),
      effect: s => {
        s.wealth -= evtMoney(4000);
        if (s.marriage && s.marriage.partner) s.marriage.partner.bond = Math.min(100, (s.marriage.partner.bond || 70) + 8);
        getInLaws().forEach(function(m) { m.bond = Math.min(100, (m.bond || 50) + 5); });
        fx({ happiness: 4, social: 3 });
      }
    },
    { label: 'Send a smaller gift',
      available: s => s.wealth >= evtMoney(1000),
      effect: s => {
        s.wealth -= evtMoney(1000);
        if (s.marriage && s.marriage.partner) s.marriage.partner.bond = Math.min(100, (s.marriage.partner.bond || 70) + 2);
        fx({ happiness: 1 });
      }
    },
    { label: 'Skip the wedding',
      effect: s => {
        if (s.marriage && s.marriage.partner) s.marriage.partner.bond = Math.max(0, (s.marriage.partner.bond || 70) - 10);
        getInLaws().forEach(function(m) { m.bond = Math.max(0, (m.bond || 50) - 8); });
        fx({ happiness: -3 });
      }
    }
  ]
}

);
/* ============================================================
   SESSION 12: REALISM EVENTS
   ============================================================ */

DEEP_EVENTS.push(

{ id: 'realism_class_pressure', minAge: 25, maxAge: 55, weight: 7, maxFires: 4,
  condition: s => {
    var cls = (typeof getSocialClass === 'function') ? getSocialClass() : 'middle';
    var born = (s.familyTier || 'middle');
    return (born === 'poor' || born === 'lower-mid') && (cls === 'poor' || cls === 'lower-middle');
  },
  title: '🏚 Born Poor, Staying Poor',
  text: s => 'You are ' + s.age + '. You have worked. You have tried. And yet — the rent went up, the salary did not.\n\nYour childhood friends from your neighborhood are in the same place. No one from your street has bought a home. Most have not even tried — they know the math.\n\nYou look at the classifieds. You close the app. You open it again.',
  choices: [
    { label: 'Keep grinding — something will break',
      effect: s => { fx({ happiness: -4, smarts: 2 }); }
    },
    { label: 'Look abroad — maybe escape is the answer',
      effect: s => {
        if (typeof evtRemember === 'function') evtRemember('dreamsOfEscape', true, 10);
        fx({ happiness: 3 });
        if (typeof log === 'function') log('✈️ You started looking at jobs abroad seriously.');
      }
    },
    { label: 'Accept it — this is your life',
      effect: s => { fx({ happiness: -8 }); }
    }
  ]
},

{ id: 'realism_marriage_rough_patch', minAge: 28, maxAge: 55, weight: 8, maxFires: 5,
  condition: s => {
    if (!s.marriage || s.marriage.status !== 'married' || !s.marriage.partner) return false;
    var marriedYears = gameYear() - (s.marriage.partner.marriedYear || gameYear());
    return marriedYears >= 3 && (s.marriage.partner.bond || 70) < 55;
  },
  title: '💔 The Rough Patch',
  text: s => {
    var p = s.marriage.partner;
    return p.name + ' has been distant for months. Tonight they finally speak:\n\n"I do not know if I am happy anymore. I do not know if you are. Are we just... going through the motions?"\n\nYou realise you have not had a real conversation in weeks.';
  },
  choices: [
    { label: 'Fight for the marriage — therapy, honesty, work',
      effect: s => {
        if (s.wealth >= 15000 && s.marriage && s.marriage.partner) {
          s.wealth -= 15000;
          s.marriage.partner.bond = Math.min(100, (s.marriage.partner.bond || 70) + 20);
          s.marriage.partner.trust = Math.min(100, (s.marriage.partner.trust || 50) + 15);
          fx({ happiness: 5 });
          if (typeof log === 'function') log('💪 You started couples therapy. It was hard. But you both showed up.');
        } else {
          fx({ happiness: -3 });
          if (typeof log === 'function') log('💔 You cannot afford therapy. You promised to try harder.');
        }
      }
    },
    { label: 'Suggest a break — space to think',
      effect: s => {
        if (s.marriage && s.marriage.partner) {
          s.marriage.partner.bond = Math.max(0, (s.marriage.partner.bond || 70) - 5);
        }
        fx({ happiness: -5 });
      }
    },
    { label: 'Say nothing. Hope it passes.',
      effect: s => {
        if (s.marriage && s.marriage.partner) {
          s.marriage.partner.bond = Math.max(0, (s.marriage.partner.bond || 70) - 12);
        }
        fx({ happiness: -8 });
        if (typeof log === 'function') log('😶 You said nothing. The silence became a wall.');
      }
    }
  ]
},

{ id: 'realism_aging_parents_burden', minAge: 30, maxAge: 60, weight: 8, maxFires: 6,
  condition: s => {
    var parents = (s.family || []).filter(function(m) {
      return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && (m.age || 0) >= 68;
    });
    return parents.length > 0;
  },
  title: '👴 Parents Need You',
  text: s => {
    var parents = (s.family || []).filter(function(m) {
      return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && (m.age || 0) >= 68;
    });
    var p = parents[0];
    return p.name + ' calls. They are not okay. They need help — medically, financially, daily.\n\nThey cannot live alone anymore.\n\n"We do not want to be a burden. But we need you."';
    choices: [
    { label: 'Move them in with you',
      effect: s => {
        if (s.marriage && s.marriage.partner) s.marriage.partner.bond = Math.max(0, (s.marriage.partner.bond || 70) - 12);
        (s.family || []).forEach(function(m) {
          if (m.role === 'Mother' || m.role === 'Father') m.bond = Math.min(100, (m.bond || 70) + 25);
        });
        if (!s.household) s.household = {};
        s.household._eldercareMonthly = 5000 * ((C().rate || 1) / 52.7);  /* food + utilities + partial care */
        s.household._eldercareMode = 'moved_in';
        fx({ happiness: -8, health: -3 });
        if (typeof log === 'function') log('🏠 Your parent moved in. Household budget +' + money(s.household._eldercareMonthly * 12) + '/yr. Marriage strained.');
      }
    },
    { label: 'Hire a full-time caregiver',
      effect: s => {
        var monthlyCost = 12000 * ((C().rate || 1) / 52.7);
        if (!s.household) s.household = {};
        s.household._eldercareMonthly = monthlyCost;
        s.household._eldercareMode = 'caregiver';
        (s.family || []).forEach(function(m) {
          if (m.role === 'Mother' || m.role === 'Father') m.bond = Math.min(100, (m.bond || 70) + 15);
        });
        fx({ happiness: 2 });
        if (typeof log === 'function') log('🏥 Hired a caregiver. Monthly cost: ' + money(monthlyCost) + '. This will show in your household budget.');
      }
    },
    { label: 'Ask siblings to share the burden',
      effect: s => {
        var sibs = (s.family || []).filter(function(m) {
          return m.alive !== false && (m.isSibling || m.role === 'Brother' || m.role === 'Sister');
        });
        if (sibs.length > 0 && Math.random() < 0.55) {
          var totalCare = 12000 * ((C().rate || 1) / 52.7);
          var perPerson = Math.round(totalCare / (1 + sibs.length));
          if (!s.household) s.household = {};
          s.household._eldercareMonthly = perPerson;
          s.household._eldercareMode = 'sibling_split';
          s.household._eldercareSiblingShare = sibs.length;
          (s.family || []).forEach(function(m) {
            if (m.role === 'Mother' || m.role === 'Father') m.bond = Math.min(100, (m.bond || 70) + 12);
          });
          fx({ happiness: 4 });
          if (typeof log === 'function') log('💬 Siblings agreed. Your share: ' + money(perPerson) + '/mo (' + sibs.length + ' siblings splitting).');
        } else {
          (s.family || []).forEach(function(m) {
            if (m.role === 'Mother' || m.role === 'Father') m.bond = Math.max(0, (m.bond || 70) - 8);
          });
          if (!s.household) s.household = {};
          s.household._eldercareMonthly = 12000 * ((C().rate || 1) / 52.7);
          s.household._eldercareMode = 'alone';
          fx({ happiness: -6 });
          if (typeof log === 'function') log('💔 Siblings refused. It is all on you.');
        }
      }
    }
  ],

{ id: 'realism_child_struggle', minAge: 42, maxAge: 65, weight: 7, maxFires: 3,
  condition: s => {
    if (!Array.isArray(s.childrenList)) return false;
    return s.childrenList.some(function(c) {
      return c.age >= 18 && c.age <= 30 && (c.bond || 55) < 40;
    });
  },
  title: '👶 Your Child Is Struggling',
  text: s => {
    var c = s.childrenList.find(function(ch) { return ch.age >= 18 && ch.age <= 30 && (ch.bond || 55) < 40; });
    if (!c) return 'Your child is going through something.';
    return c.name + ' is not okay. They lost their job. They are drinking too much. They do not call you anymore.\n\nYou hear from their sibling: "They do not want to see you. They said you were never there for them."';
  },
  choices: [
    { label: 'Reach out anyway — show up at their door',
      effect: s => {
        var c = s.childrenList.find(function(ch) { return ch.age >= 18 && ch.age <= 30; });
        if (c) c.bond = Math.min(100, (c.bond || 55) + 15);
        fx({ happiness: 3 });
        if (typeof log === 'function') log('💬 They were surprised. But they let you in. You talked for hours.');
      }
    },
    { label: 'Give them space. They will come back.',
      effect: s => {
        var c = s.childrenList.find(function(ch) { return ch.age >= 18 && ch.age <= 30; });
        if (c) c.bond = Math.max(0, (c.bond || 55) - 8);
        fx({ happiness: -5 });
      }
    },
    { label: 'Send money — let them know you love them',
      effect: s => {
        var cost = 8000 * ((C().rate || 1) / 52.7);
        if (s.wealth >= cost) {
          s.wealth -= cost;
          var c = s.childrenList.find(function(ch) { return ch.age >= 18 && ch.age <= 30; });
          if (c) c.bond = Math.min(100, (c.bond || 55) + 6);
          if (typeof log === 'function') log('💸 You sent money. No message. They know.');
        } else {
          fx({ happiness: -4 });
        }
      }
    }
  ]
},

{ id: 'realism_career_ceiling_hit', minAge: 42, maxAge: 60, weight: 6, maxFires: 2,
  condition: s => {
    if (!s.career || !s.career.job) return false;
    var ceiling = (typeof getCareerCeiling === 'function') ? getCareerCeiling(s.career.job.track) : 6;
    return (s.career.job.level || 0) >= ceiling - 1;
  },
  title: '🚧 The Ceiling',
  text: s => {
    var j = s.career.job;
    return 'You are ' + j.title + ' at ' + j.company + '. You have been for years.\n\nA younger colleague — from a different background, more connected — was just promoted above you. You know you are more capable. You also know it did not matter.\n\nYour manager says: "You are so valuable where you are. We cannot move you."';
  },
  choices: [
    { label: 'Accept the ceiling — be great at what you do',
      effect: s => { fx({ happiness: -5, smarts: 2 }); }
    },
    { label: 'Fight for the promotion anyway',
      effect: s => {
        if (Math.random() < 0.35) {
          if (s.career && s.career.job) s.career.job.level = (s.career.job.level || 0) + 1;
          fx({ happiness: 10 });
          if (typeof log === 'function') log('💪 Against the odds, you got it.');
        } else {
          if (s.career && s.career.job) s.career.job.performance = Math.max(0, (s.career.job.performance || 50) - 8);
          fx({ happiness: -10 });
          if (typeof log === 'function') log('❌ You were denied. And marked.');
        }
      }
    },
    { label: 'Look for another company that will value you',
      effect: s => {
        if (typeof evtPushOffer === 'function' && s.career && s.career.job) {
          evtPushOffer(s, {
            company: 'A Rival Firm',
            title: 'Senior ' + s.career.job.title,
            track: s.career.job.track,
            level: (s.career.job.level || 0) + 1,
            salary: Math.round((s.career.job.salary || 0) * 1.20),
            message: 'Offered a real promotion at a different company.'
          });
          if (typeof log === 'function') log('📬 Offer in Career tab.');
          fx({ happiness: 5 });
        }
      }
    }
  ]
},

{ id: 'realism_gender_pay_gap', minAge: 28, maxAge: 55, weight: 6, maxFires: 2,
  condition: s => s.gender === 'f' && s.career && s.career.job,
  title: '💼 Same Work, Different Pay',
  text: s => {
    var j = s.career.job;
    return 'You discover a male colleague at the same level — same title, same years of experience — earns 18% more than you.\n\nWhen you ask, they say: "He negotiated harder." You know that is not the whole story.';
  },
  choices: [
    { label: 'Demand a raise — show the data',
      effect: s => {
        if (Math.random() < 0.45) {
          if (s.career && s.career.job) s.career.job.salary = Math.round((s.career.job.salary || 0) * 1.15);
          fx({ happiness: 8 });
          if (typeof log === 'function') log('💪 They gave you a raise. Not an apology. But a raise.');
        } else {
          fx({ happiness: -8 });
          if (typeof log === 'function') log('❌ They said "budget constraints." You know what that means.');
        }
      }
    },
    { label: 'Start looking elsewhere',
      effect: s => {
        if (typeof log === 'function') log('🚪 You started browsing job listings on your lunch break.');
        fx({ happiness: -2 });
      }
    },
    { label: 'Say nothing — not worth the fight',
      effect: s => { fx({ happiness: -6 }); }
    }
  ]
},

{ id: 'realism_health_scare', minAge: 42, maxAge: 72, weight: 7, maxFires: 3,
  condition: s => (s.health || 100) < 65,
  title: '🏥 The Test Results',
  text: s => 'You have been putting off the checkup. Now the results are in.\n\nThe doctor does not smile. "There are some markers we need to discuss."\n\nThe rest of the conversation is a blur of words you never thought would apply to you.';
  choices: [
    { label: 'Do everything they recommend',
      effect: s => {
        var cost = 15000 * ((C().rate || 1) / 52.7);
        if (s.wealth >= cost) {
          s.wealth -= cost;
          s.health = Math.min(100, (s.health || 50) + 8);
          fx({ happiness: 3 });
          if (typeof log === 'function') log('🏥 You started treatment. It will take months.');
        } else {
          fx({ happiness: -10 });
          if (typeof log === 'function') log('💸 You cannot afford the treatment.');
        }
      }
    },
    { label: 'Get a second opinion',
      effect: s => {
        var cost = 5000 * ((C().rate || 1) / 52.7);
        if (s.wealth >= cost) {
          s.wealth -= cost;
          if (Math.random() < 0.4) {
            s.health = Math.min(100, (s.health || 50) + 4);
            if (typeof log === 'function') log('✅ The second doctor said it was less serious than feared.');
          } else {
            fx({ happiness: -5 });
            if (typeof log === 'function') log('❌ The second opinion confirmed the first.');
          }
        }
      }
    },
    { label: 'Ignore it. If it is bad, it is bad.',
      effect: s => {
        s.health = Math.max(0, (s.health || 50) - 5);
        fx({ happiness: -12 });
        if (typeof log === 'function') log('😶 You ignored it. For now.');
      }
    }
  ]
},

{ id: 'realism_age_discrimination', minAge: 50, maxAge: 65, weight: 5, maxFires: 2,
  condition: s => {
    if (!s.career || !s.career.job) return false;
    return (s.career.job.tenure || 0) < 2;
  },
  title: '👴 Too Old for the Job',
  text: s => 'You applied to a job you are perfectly qualified for. They said they went with a "different profile."\n\nYou have seen this before. The profile they picked is younger. Younger and cheaper.\n\nYou are ' + s.age + '.';
  choices: [
    { label: 'Keep applying anyway',
      effect: s => { fx({ happiness: -3 }); }
    },
    { label: 'Pivot — consult, freelance, start something',
      effect: s => {
        if (typeof evtRemember === 'function') evtRemember('pivotToConsulting', true, 5);
        fx({ happiness: 3, smarts: 2 });
        if (typeof log === 'function') log('🚀 You started pitching yourself as a consultant.');
      }
    }
  ]
},

{ id: 'realism_loneliness', minAge: 45, maxAge: 75, weight: 6, maxFires: 4,
  condition: s => {
    if (s.marriage && s.marriage.status === 'married') return false;
    if (s.marriage && s.marriage.status === 'divorced') return true;
    return (s.social || 50) < 40;
  },
  title: '🥀 Loneliness',
  text: s => 'You are sitting in your apartment. The TV is on. You are not watching it.\n\nYou realise you have not had a real conversation in weeks. The friends you had are busy with their own lives. Your children call sometimes. Not often.\n\nYou are ' + s.age + '. You wonder how this happened.';
  choices: [
    { label: 'Call someone — anyone',
      effect: s => {
        var friends = (s.friends || []).filter(function(f) { return f.alive !== false; });
        if (friends.length > 0) {
          friends[0].bond = Math.min(100, (friends[0].bond || 50) + 10);
          fx({ happiness: 6, social: 3 });
          if (typeof log === 'function') log('📞 You called ' + friends[0].name + '. They were glad to hear from you.');
        } else {
          fx({ happiness: -3 });
        }
      }
    },
    { label: 'Try to make new friends',
      effect: s => {
        if (!Array.isArray(s.friends)) s.friends = [];
        var pool = ['Sarah', 'Ahmed', 'Mona', 'Karim', 'Layla', 'Hassan'];
        s.friends.push({
          id: 'fr_' + Math.random().toString(36).slice(2, 6),
          name: pool[Math.floor(Math.random() * pool.length)],
          gender: Math.random() < 0.5 ? 'm' : 'f',
          age: s.age,
          bond: 35,
          trait: 'kind',
          source: 'later_life',
          sourceLabel: 'Met recently',
          metYear: gameYear(),
          country: s.country,
          alive: true,
          contactedThisYear: false
        });
        fx({ happiness: 5, social: 4 });
        if (typeof log === 'function') log('👥 You joined a group. You met someone.');
      }
    },
    { label: 'Stay in. It is easier.',
      effect: s => { fx({ happiness: -8 }); }
    }
  ]
},

{ id: 'realism_family_secret', minAge: 35, maxAge: 70, weight: 4, maxFires: 2,
  condition: s => (s.family || []).some(function(m) { return m.alive !== false; }),
  title: '🤫 A Family Secret',
  text: s => 'A relative is on their deathbed. They want to tell you something.\n\n"I have carried this for decades. I need to say it before I go."\n\nThe secret is not what you expected. It changes everything you thought you knew.';
  choices: [
    { label: 'Listen. Accept them as they are.',
      effect: s => {
        (s.family || []).forEach(function(m) {
          if (m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 5);
        });
        fx({ happiness: -3, smarts: 3 });
        if (typeof recordMoment === 'function') {
          recordMoment('The family secret', 'You learned something you will never tell anyone.', { icon: '🤫', key: 'secret_' + gameYear(), weight: 2 });
        }
      }
    },
    { label: 'Refuse to listen. What is done is done.',
      effect: s => {
        (s.family || []).forEach(function(m) {
          if (m.alive !== false) m.bond = Math.max(0, (m.bond || 70) - 8);
        });
        fx({ happiness: -2 });
      }
    }
  ]
},

{ id: 'realism_debt_spiral', minAge: 25, maxAge: 65, weight: 6, maxFires: 3,
  condition: s => {
    if (!s.bank) return false;
    var debt = (s.bank.loans || []).reduce(function(sum, l) { return sum + (l.remaining || 0); }, 0);
    var cardDebt = (s.bank.creditCards || []).reduce(function(sum, c) { return sum + (c.balance || 0); }, 0);
    return (debt + cardDebt) > (s.wealth || 0) * 0.8;
  },
  title: '💳 The Spiral',
  text: s => 'You check your bank account and it is not what you hoped.\n\nMinimum card payments. Loan payments. Rent. Groceries. Everything is due.\n\nYou take a small loan to cover the cards. Now the loan is due too.';
  choices: [
    { label: 'Consolidate — one loan, lower rate',
      effect: s => {
        if (typeof bankDoConsolidateDebt === 'function') bankDoConsolidateDebt();
        else {
          if (s.bank && Array.isArray(s.bank.loans)) {
            s.bank.loans.forEach(function(l) { l.monthlyPayment = Math.round((l.monthlyPayment || 0) * 0.85); });
          }
        }
      }
    },
    { label: 'Cut spending to the bone',
      effect: s => {
        if (s.lifestyle) s.lifestyle.active = false;
        fx({ happiness: -12 });
        if (typeof log === 'function') log('🥖 You cut everything. Rice and beans. No entertainment.');
      }
    },
    { label: 'Ask family for help',
      effect: s => {
        var parents = (s.family || []).filter(function(m) {
          return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false;
        });
        if (parents.length > 0 && Math.random() < 0.5) {
          var help = 10000 * ((C().rate || 1) / 52.7);
          s.wealth += help;
          parents.forEach(function(p) { p.bond = Math.max(0, (p.bond || 70) - 5); });
          if (typeof log === 'function') log('💸 Your parents bailed you out.');
        } else {
          fx({ happiness: -5 });
          if (typeof log === 'function') log('❌ They said no. Or could not.');
        }
      }
    }
  ]
}

);DEEP_EVENTS.push(
{ id: 'parent_surgery_emergency', minAge: 32, maxAge: 70, weight: 5, maxFires: 3,
  condition: s => {
    var parents = (s.family || []).filter(function(m) {
      return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && (m.age || 0) >= 72;
    });
    return parents.length > 0;
  },
  title: '🚑 Parent Medical Emergency',
  text: s => {
    var parents = (s.family || []).filter(function(m) {
      return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && (m.age || 0) >= 72;
    });
    var p = parents[0];
    return p.name + ' has been rushed to the hospital. The doctors say they need emergency surgery.\n\nThe bill: ' + (150000 * ((C().rate || 1) / 52.7)).toLocaleString() + ' ' + C().currency + '.\n\nYou have to decide. Fast.';
  },
  choices: [
    { label: 'Pay everything — do not think about the cost',
      available: s => s.wealth >= (150000 * ((C().rate || 1) / 52.7)),
      effect: s => {
        var cost = 150000 * ((C().rate || 1) / 52.7);
        s.wealth -= cost;
        (s.family || []).forEach(function(m) {
          if (m.role === 'Mother' || m.role === 'Father') {
            m.bond = Math.min(100, (m.bond || 70) + 20);
            m.health = Math.min(100, (m.health || 50) + 20);
          }
        });
        fx({ happiness: 3 });
        if (typeof log === 'function') log('💸 You paid ' + money(cost) + '. They survived. That is what matters.');
        if (typeof recordMoment === 'function') {
          recordMoment('The surgery', 'You watched the doors close. Then you waited.', { icon: '🚑', key: 'parent_surgery_' + gameYear(), weight: 3 });
        }
      }
    },
    { label: 'Charge to credit card',
      available: s => {
        var cost = 150000 * ((C().rate || 1) / 52.7);
        if (!s.bank || !Array.isArray(s.bank.creditCards)) return false;
        return s.bank.creditCards.some(function(c) { return (c.limit || 0) - (c.balance || 0) >= cost; });
      },
      effect: s => {
        var cost = 150000 * ((C().rate || 1) / 52.7);
        var card = s.bank.creditCards.find(function(c) { return (c.limit || 0) - (c.balance || 0) >= cost; });
        if (card) {
          card.balance = (card.balance || 0) + cost;
          (s.family || []).forEach(function(m) {
            if (m.role === 'Mother' || m.role === 'Father') {
              m.bond = Math.min(100, (m.bond || 70) + 20);
              m.health = Math.min(100, (m.health || 50) + 20);
            }
          });
          if (typeof log === 'function') log('💳 Charged ' + money(cost) + ' to ' + card.name + '. You will pay this off for years.');
        }
      }
    },
    { label: 'Ask siblings to split the cost',
      effect: s => {
        var sibs = (s.family || []).filter(function(m) {
          return m.alive !== false && (m.isSibling || m.role === 'Brother' || m.role === 'Sister');
        });
        if (sibs.length > 0 && Math.random() < 0.60) {
          var total = 150000 * ((C().rate || 1) / 52.7);
          var share = Math.round(total / (1 + sibs.length));
          if (s.wealth >= share) {
            s.wealth -= share;
            (s.family || []).forEach(function(m) {
              if (m.role === 'Mother' || m.role === 'Father') {
                m.bond = Math.min(100, (m.bond || 70) + 15);
                m.health = Math.min(100, (m.health || 50) + 20);
              }
            });
            if (typeof log === 'function') log('💸 Siblings agreed. You paid ' + money(share) + ' of ' + money(total) + '.');
          } else {
            if (typeof log === 'function') log('❌ You could not afford your share. The surgery was delayed.');
            (s.family || []).forEach(function(m) {
              if (m.role === 'Mother' || m.role === 'Father') m.health = Math.max(0, (m.health || 50) - 15);
            });
          }
        } else {
          (s.family || []).forEach(function(m) {
            if (m.role === 'Mother' || m.role === 'Father') m.health = Math.max(0, (m.health || 50) - 15);
          });
          if (typeof log === 'function') log('💔 Siblings refused. Health deteriorated.');
          fx({ happiness: -10 });
        }
      }
    },
    { label: 'You cannot afford it',
      effect: s => {
        var parents = (s.family || []).filter(function(m) {
          return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false;
        });
        parents.forEach(function(m) { m.health = Math.max(0, (m.health || 50) - 25); });
        if (Math.random() < 0.40 && parents[0]) {
          parents[0].alive = false;
          parents[0].deathYear = gameYear();
          if (typeof log === 'function') log('🕊 ' + parents[0].name + ' did not survive the night.');
          if (typeof emitSignal === 'function') emitSignal('parentDied', { parent: parents[0] });
        }
        fx({ happiness: -25, health: -5 });
        if (typeof recordMoment === 'function') {
          recordMoment('The night you could not pay', 'You stood outside the hospital. There was nothing else to do.', { icon: '🕊', key: 'parent_died_unfunded_' + gameYear(), weight: 4 });
        }
      }
    }
  ]
}
);
/* ============================================================
   SESSION 11: GENERATIONAL ECHO EVENTS
   ============================================================ */

DEEP_EVENTS.push(

{ id: 'echo_child_22', minAge: 40, maxAge: 65, weight: 6, maxFires: 4,
  condition: s => {
    if (!Array.isArray(S.childrenList)) return false;
    return S.childrenList.some(function(c) { return c.age === 22; });
  },
  title: '🪞 Your Child Turns 22',
  text: s => {
    var c = S.childrenList.find(function(ch) { return ch.age === 22; });
    if (!c) return 'Your child turned 22.';
    return c.name + ' turned 22 today. You sat at the kitchen table and watched them.\n\nYou remember being 22. You had nothing figured out. You did not know then how the next decade would unfold.\n\nThey think they know.';
  },
  choices: [
    { label: 'Tell them they will be fine',
      effect: s => {
        S.childrenList.forEach(function(c) { if (c.age === 22) c.bond = Math.min(100, (c.bond || 55) + 8); });
        fx({ happiness: 4 });
        log('💬 They nodded, half-believing you. But they will remember.');
      }
    },
    { label: 'Tell them the truth — that it is hard',
      effect: s => {
        S.childrenList.forEach(function(c) {
          if (c.age === 22) {
            c.bond = Math.min(100, (c.bond || 55) + 12);
            c.smarts = Math.min(100, (c.smarts || 50) + 3);
          }
        });
        fx({ happiness: 2 });
        log('💬 They respected the honesty.');
      }
    },
    { label: 'Say nothing — just sit with them',
      effect: s => {
        S.childrenList.forEach(function(c) { if (c.age === 22) c.bond = Math.min(100, (c.bond || 55) + 6); });
        fx({ happiness: 3 });
      }
    }
  ]
},

{ id: 'cycle_continue_or_break', minAge: 45, maxAge: 65, weight: 5, maxFires: 2,
  condition: s => {
    if (typeof detectFamilyPatterns !== 'function') return false;
    var p = detectFamilyPatterns();
    return (p.wasRaisedDistant && p.isDistantParent) || (p.wasRaisedDistant && p.isLovingParent) ||
           (!p.parentsStayedMarried && p.playerMarriageStrong) || (p.parentsStayedMarried && p.playerMarriedOrDivorced && !p.playerMarriageStrong);
  },
  title: '🪞 You Realize',
  text: s => {
    var p = detectFamilyPatterns();
    if (p.wasRaisedDistant && p.isDistantParent) {
      return 'You are looking at your child across the dinner table. They are quiet. Not unhappy. Just... quiet.\n\nAnd you realise: this is exactly what you did with your own parent. The same silence. The same distance. You inherited it and you passed it on.\n\nYou can see the cycle.';
    }
    if (p.wasRaisedDistant && p.isLovingParent) {
      return 'You are sitting at your child\'s graduation. They are laughing with their friends. They are okay.\n\nYou did not have this. Your parent was not there for you. But you are here for them — and they are whole.\n\nYou broke it. You actually broke it.';
    }
    if (!p.parentsStayedMarried && p.playerMarriageStrong) {
      return 'Your wife just laughed at something on the TV. You watched her face.\n\nYour parents could not do this. They did not know how. But you and her — you figured something out that they could not.\n\nYou broke the pattern without even trying.';
    }
    return 'You are looking at the divorce papers. The same papers your parents signed.\n\nYou told yourself you would be different. But here you are.';
  },
  choices: [
    { label: 'Just sit with the realization',
      effect: s => {
        fx({ happiness: -3, smarts: 3 });
        if (typeof emitReflection === 'function') {
          emitReflection('You know the pattern now. What you do next is the only thing that matters.', { mood: 'reflective' });
        }
      }
    },
    { label: 'Change something — even small',
      effect: s => {
        var p = detectFamilyPatterns();
        if (p.isDistantParent) {
          S.childrenList.forEach(function(c) { c.bond = Math.min(100, (c.bond || 55) + 15); });
          log('💪 You started showing up. Small things. Their face lit up.');
        } else if (!p.playerMarriageStrong && S.marriage && S.marriage.partner) {
          S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + 20);
          log('💪 You chose your marriage. Therapy. Honesty. The work.');
        } else {
          S.happiness = Math.min(100, (S.happiness || 50) + 10);
        }
        fx({ happiness: 6 });
      }
    }
  ]
},

{ id: 'teach_child_trade', minAge: 42, maxAge: 65, weight: 6, maxFires: 3,
  condition: s => {
    if (!Array.isArray(S.childrenList)) return false;
    if (!S.career || !S.career.job) return false;
    return S.childrenList.some(function(c) { return c.age >= 18 && c.age <= 28; });
  },
  title: '🎓 Teach Them Your Trade',
  text: s => {
    var job = S.career && S.career.job;
    var c = S.childrenList.find(function(ch) { return ch.age >= 18 && ch.age <= 28; });
    return c.name + ' asks if you would teach them what you know — what you do as ' + (job ? job.title : 'your profession') + '.\n\n"I want to be like you."';
  },
  choices: [
    { label: 'Take them under your wing',
      effect: s => {
        var c = S.childrenList.find(function(ch) { return ch.age >= 18 && ch.age <= 28; });
        if (c) {
          if (!c.career && S.career && S.career.job) {
            c.career = {
              track: S.career.job.track,
              level: 0,
              title: S.career.job.title,
              company: 'Following you',
              salary: (typeof carSalaryForLevel === 'function') ? carSalaryForLevel(S.career.job.track, 0) : 50000,
              working: true
            };
            c.income = c.career.salary;
          }
          c.bond = Math.min(100, (c.bond || 55) + 20);
          log('🎓 You started teaching ' + c.name + ' your trade. They are a natural.');
          if (typeof recordMoment === 'function') {
            recordMoment('The day you became ' + c.name + '\'s mentor',
              'You handed down what you know. Your craft will outlive you.',
              { icon: '🎓', key: 'mentor_' + c.id });
          }
        }
        fx({ happiness: 10 });
      }
    },
    { label: 'Tell them to find their own path',
      effect: s => {
        var c = S.childrenList.find(function(ch) { return ch.age >= 18 && ch.age <= 28; });
        if (c) c.bond = Math.min(100, (c.bond || 55) + 5);
        fx({ happiness: 2 });
        log('💬 "You should be your own person. Not me." They nodded slowly.');
      }
    },
    { label: 'Refuse — too busy',
      effect: s => {
        var c = S.childrenList.find(function(ch) { return ch.age >= 18 && ch.age <= 28; });
        if (c) c.bond = Math.max(0, (c.bond || 55) - 12);
        fx({ happiness: -5 });
        log('😔 They said "fine" and walked away. Something closed between you.');
      }
    }
  ]
},

{ id: 'grandchild_teach_legacy', minAge: 55, maxAge: 80, weight: 6, maxFires: 5,
  condition: s => {
    if (typeof getAllGrandchildren !== 'function') return false;
    return getAllGrandchildren().some(function(gc) { return (gc.age || 0) >= 8 && (gc.age || 0) <= 18; });
  },
  title: '👶 Grandchild Wants to Learn',
  text: s => {
    var gcs = getAllGrandchildren();
    var gc = gcs.find(function(g) { return (g.age || 0) >= 8 && (g.age || 0) <= 18; });
    if (!gc) return 'Your grandchild wants to know about your life.';
    return gc.name + ' sits next to you and asks:\n\n"Grandpa/Grandma, what was life like before I was born?"';
  },
  choices: [
    { label: 'Tell them everything — the real story',
      effect: s => {
        (S.childrenList || []).forEach(function(c) {
          (c.children || []).forEach(function(gc) {
            gc.bond = Math.min(100, (gc.bond || 70) + 15);
          });
        });
        fx({ happiness: 10 });
        if (typeof emitReflection === 'function') {
          emitReflection('You told them about your parents, your struggles, your dreams. They listened like you were the most interesting person in the world.', { mood: 'tender' });
        }
      }
    },
    { label: 'Tell them the fun stories only',
      effect: s => {
        (S.childrenList || []).forEach(function(c) {
          (c.children || []).forEach(function(gc) {
            gc.bond = Math.min(100, (gc.bond || 70) + 8);
          });
        });
        fx({ happiness: 5 });
      }
    },
    { label: 'Say "one day — not yet"',
      effect: s => {
        (S.childrenList || []).forEach(function(c) {
          (c.children || []).forEach(function(gc) {
            gc.bond = Math.max(0, (gc.bond || 70) - 5);
          });
        });
        fx({ happiness: -2 });
      }
    }
  ]
},

{ id: 'grandchild_drift', minAge: 60, maxAge: 85, weight: 5, maxFires: 3,
  condition: s => {
    if (typeof getAllGrandchildren !== 'function') return false;
    var gcs = getAllGrandchildren();
    return gcs.some(function(gc) { return (gc.bond || 70) < 35 && (gc.age || 0) >= 15; });
  },
  title: '👶 Your Grandchild Has Grown Distant',
  text: s => {
    var gc = getAllGrandchildren().find(function(g) { return (g.bond || 70) < 35 && (g.age || 0) >= 15; });
    if (!gc) return 'Your grandchild barely speaks to you now.';
    return gc.name + ' barely calls anymore. When they visit, they are on their phone. You have become someone in the background of their life.';
  },
  choices: [
    { label: 'Call them and be honest about how you feel',
      effect: s => {
        if (Math.random() < 0.60) {
          (S.childrenList || []).forEach(function(c) {
            (c.children || []).forEach(function(gc) {
              gc.bond = Math.min(100, (gc.bond || 70) + 20);
            });
          });
          fx({ happiness: 8 });
          log('💬 They were surprised. But they listened. They agreed to visit.');
        } else {
          fx({ happiness: -6 });
          log('💔 They said "I am just busy." You know it is more than that.');
        }
      }
    },
    { label: 'Let them go — kids grow up',
      effect: s => {
        fx({ happiness: -3 });
        if (typeof emitReflection === 'function') {
          emitReflection('You remember holding them as a baby. Now they have their own life. You are not sure if they will come back.', { mood: 'sad' });
        }
      }
    }
  ]
},

{ id: 'family_business_offer', minAge: 45, maxAge: 70, weight: 5, maxFires: 2,
  condition: s => {
    if (!S.career || !Array.isArray(S.career.businesses)) return false;
    if (S.career.businesses.length === 0) return false;
    if (!Array.isArray(S.childrenList)) return false;
    return S.childrenList.some(function(c) { return c.age >= 22 && c.age <= 35; });
  },
  title: '🏪 Your Child Wants Into the Business',
  text: s => {
    var biz = S.career.businesses[0];
    var c = S.childrenList.find(function(ch) { return ch.age >= 22 && ch.age <= 35; });
    return c.name + ' approaches you seriously.\n\n"I want to take over ' + biz.name + ' one day. Let me start learning the business now."';
  },
  choices: [
    { label: 'Yes — teach them the business',
      effect: s => {
        var c = S.childrenList.find(function(ch) { return ch.age >= 22 && ch.age <= 35; });
        if (c) {
          c.bond = Math.min(100, (c.bond || 55) + 20);
          c.smarts = Math.min(100, (c.smarts || 50) + 5);
          c.futureSuccession = 'family_business';
        }
        fx({ happiness: 10 });
        log('🏪 ' + c.name + ' is now learning the business. This is your legacy.');
        if (typeof recordMoment === 'function') {
          recordMoment(c.name + ' joined the family business',
            'You handed them the keys — metaphorically, for now.',
            { icon: '🏪', key: 'biz_succession' });
        }
      }
    },
    { label: 'No — they should earn their own path',
      effect: s => {
        var c = S.childrenList.find(function(ch) { return ch.age >= 22 && ch.age <= 35; });
        if (c) c.bond = Math.max(0, (c.bond || 55) - 8);
        fx({ happiness: -3 });
        log('💬 They said "I understand." They did not.');
      }
    }
  ]
}

);
window.DEEP_EVENTS = DEEP_EVENTS;
/* ============================================================
   SESSION 9B: CAREER & MARKET EVENTS
   Real crisis notifications, recruiter events, professional milestone events
   ============================================================ */

DEEP_EVENTS.push(

/* ---------- SECTOR CRISIS EVENTS ---------- */
{ id: 'crisis_financial_2008', minAge: 22, maxAge: 65, weight: 3, maxFires: 1,
  condition: s => {
    if (gameYear() !== 2008) return false;
    if (!s.career || !s.career.job) return false;
    var track = (typeof carTrackById === 'function') ? carTrackById(s.career.job.track) : null;
    if (!track) return false;
    return ['banking','consulting','law','engineering'].indexOf(track.industry) >= 0;
  },
  title: '📉 Lehman Brothers Collapses',
  text: s => 'It is September 15, 2008. Lehman Brothers files for bankruptcy. Your industry is in chaos.\n\nWithin 48 hours, your company announces emergency meetings. Hiring frozen. Bonuses cancelled. Rumors of layoffs.\n\nYou watch the news in disbelief. Your job is no longer secure.',
  choices: [
    { label: 'Stay put and hope for the best',
      effect: s => {
        if (Math.random() < 0.55) {
          log('🎲 Your company survived. You kept your job.');
          fx({ happiness: -5 });
        } else {
          if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('2008 financial crisis');
          fx({ happiness: -30, health: -5 });
          log('💸 You were laid off in the crisis.');
        }
      }
    },
    { label: 'Quit and try to find something safer',
      effect: s => {
        if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('left during crisis');
        fx({ happiness: -10 });
        log('🚪 You left. Better to be job-hunting on your terms.');
      }
    }
  ]
},

{ id: 'crisis_covid_2020', minAge: 22, maxAge: 65, weight: 5, maxFires: 1,
  condition: s => {
    if (gameYear() !== 2020) return false;
    if (!s.career || !s.career.job) return false;
    var track = (typeof carTrackById === 'function') ? carTrackById(s.career.job.track) : null;
    if (!track) return false;
    return ['hotels','aviation','retail','restaurants','media'].indexOf(track.industry) >= 0;
  },
  title: '🦠 COVID-19 Lockdown',
  text: s => 'March 2020. The world shuts down. Your industry is hit first — travel, dining, gatherings all stopped.\n\nYour employer sends an email: "Due to unprecedented circumstances, we are forced to reduce our workforce."\n\nYou are being furloughed — or laid off.',
  choices: [
    { label: 'Accept the furlough (reduced pay, return if things recover)',
      effect: s => {
        if (s.career && s.career.job) {
          s.career.job.salary = Math.round((s.career.job.salary || 0) * 0.40);
          log('📉 You are furloughed. Salary reduced to ' + money(s.career.job.salary) + '/year.');
        }
        fx({ happiness: -15 });
      }
    },
    { label: 'Take the severance and leave',
      effect: s => {
        if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('COVID-19 layoff');
        fx({ happiness: -20 });
        log('💼 You were laid off due to COVID. Job hunting during a pandemic.');
      }
    }
  ]
},

{ id: 'crisis_tech_winter_2022', minAge: 22, maxAge: 60, weight: 4, maxFires: 1,
  condition: s => {
    if (gameYear() !== 2022 && gameYear() !== 2023) return false;
    if (!s.career || !s.career.job) return false;
    var track = (typeof carTrackById === 'function') ? carTrackById(s.career.job.track) : null;
    if (!track) return false;
    return ['tech','bpo'].indexOf(track.industry) >= 0;
  },
  title: '❄️ The Tech Winter',
  text: s => 'Meta laid off 11,000. Amazon 18,000. Google 12,000. Twitter half the company.\n\nYour company announced a "strategic realignment" — code for layoffs. Slack channels are going quiet one by one.\n\nYou do not know if you are next.',
  choices: [
    { label: 'Stay — you have strong performance',
      effect: s => {
        var perf = (s.career && s.career.job && s.career.job.performance) || 50;
        if (perf > 70 || Math.random() < 0.6) {
          log('✅ You survived the cuts. Others did not.');
          fx({ happiness: 3 });
        } else {
          if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('tech winter layoff');
          fx({ happiness: -30 });
          log('💸 You were caught in the layoffs.');
        }
      }
    },
    { label: 'Leave now to control your exit',
      effect: s => {
        if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('left during tech winter');
        fx({ happiness: -10 });
        log('🚪 You left before being pushed.');
      }
    }
  ]
},

{ id: 'crisis_egp_2023', minAge: 22, maxAge: 70, weight: 4, maxFires: 1,
  condition: s => {
    if (gameYear() !== 2023 && gameYear() !== 2024) return false;
    return s.country === 'egy';
  },
  title: '💱 The Pound Collapses Again',
  text: s => 'The EGP is devalued for the fourth time in a decade. Prices triple overnight. Your salary in real terms just halved.\n\nBread, fuel, medicine — all up 60-100%. Landlords are raising rent. Grocery bills are unrecognizable.',
  choices: [
    { label: 'Cut expenses, hold on',
      effect: s => {
        fx({ happiness: -12, health: -3 });
        log('💸 Prices are impossible. You are barely keeping up.');
      }
    },
    { label: 'Ask your employer for a raise',
      effect: s => {
        if (Math.random() < 0.30) {
          if (s.career && s.career.job) {
            s.career.job.salary = Math.round(s.career.job.salary * 1.30);
          }
          log('💪 Your employer gave you a 30% raise to compensate.');
          fx({ happiness: 5 });
        } else {
          log('❌ They said no. "Everybody is suffering."');
          fx({ happiness: -8 });
        }
      }
    },
    { label: 'Start seriously considering leaving Egypt',
      effect: s => {
        if (typeof evtRemember === 'function') evtRemember('wantsToEmigrate', true, 10);
        fx({ happiness: -3 });
        log('✈️ You started looking at jobs abroad.');
      }
    }
  ]
},

{ id: 'crisis_ai_2026', minAge: 22, maxAge: 60, weight: 4, maxFires: 1,
  condition: s => {
    if (gameYear() !== 2026 && gameYear() !== 2027 && gameYear() !== 2028) return false;
    if (!s.career || !s.career.job) return false;
    var track = (typeof carTrackById === 'function') ? carTrackById(s.career.job.track) : null;
    if (!track) return false;
    return ['bpo','media','consulting','law'].indexOf(track.industry) >= 0;
  },
  title: '🤖 AI Replaced Your Junior Team',
  text: s => 'Management announced that AI tools can now do what your junior team does. The juniors are being "transitioned out."\n\nSenior roles like yours are safe — for now. But the writing on the wall is clear.',
  choices: [
    { label: 'Learn the AI tools quickly',
      effect: s => {
        if (s.career && s.career.job) {
          s.career.job.performance = Math.min(100, (s.career.job.performance || 50) + 5);
        }
        fx({ smarts: 5 });
        log('🧠 You are adapting. Learning fast.');
      }
    },
    { label: 'Refuse to adapt — keep doing things the old way',
      effect: s => {
        if (s.career && s.career.job) {
          s.career.job.performance = Math.max(0, (s.career.job.performance || 50) - 10);
        }
        fx({ happiness: -5 });
        log('⚠️ Your boss noticed. Your future here is uncertain.');
      }
    }
  ]
},

/* ---------- RECRUITER REACHES OUT ---------- */
{ id: 'recruiter_linkedin', minAge: 25, maxAge: 55, weight: 5, maxFires: 6,
  condition: s => {
    if (!s.career || !s.career.job) return false;
    if ((s.career.job.performance || 50) < 65) return false;
    if ((s.career.job.tenure || 0) < 1) return false;
    return true;
  },
  title: '📩 LinkedIn Message',
  text: s => {
    var job = s.career.job;
    return 'A recruiter messages you on LinkedIn: "Your profile caught my eye. We are hiring at ' +
      (s.country === 'egy' ? 'a major company' : 'an exciting firm') +
      '. Would you be open to a conversation? The package could be significantly better than your current ' + money(job.salary) + '/year."';
  },
  choices: [
    { label: 'Yes, send me the details',
      effect: s => {
        if (typeof evtPushOffer === 'function' && s.career && s.career.job) {
          var job = s.career.job;
          var bump = 1.20 + Math.random() * 0.15;
          var newSalary = Math.round(job.salary * bump);
          var pool = (typeof CAR_COMPANIES !== 'undefined' && CAR_COMPANIES[s.country] && CAR_COMPANIES[s.country][(carTrackById(job.track) || {}).industry]) || [];
          var target = pool.filter(function(c) { return c.name !== job.company; })[0] || { name: 'A competitor', payMult: 1.2, benefits: ['health', 'bonus'], prestige: 4 };
          evtPushOffer(s, {
            company: target.name,
            title: job.title,
            track: job.track,
            level: job.level || 0,
            salary: newSalary,
            message: 'Recruiter offer. ' + Math.round((bump - 1) * 100) + '% raise.'
          });
          log('📬 Offer in Career → Offers tab.');
          fx({ happiness: 6 });
        }
      }
    },
    { label: 'Not interested right now',
      effect: s => { fx({ happiness: 1 }); }
    }
  ]
},

{ id: 'recruiter_former_colleague', minAge: 28, maxAge: 55, weight: 4, maxFires: 4,
  condition: s => {
    if (!s.career || !s.career.job) return false;
    if ((s.career.job.performance || 50) < 70) return false;
    return (s.career.jobHistory && s.career.jobHistory.length > 0);
  },
  title: '📞 A Former Colleague Called',
  text: s => {
    var lastJob = (s.career.jobHistory && s.career.jobHistory[s.career.jobHistory.length - 1]) || { company: 'your old company' };
    return 'A former colleague from ' + lastJob.company + ' calls you directly.\n\n"We just got funding for a new team. I want you on it. The pay is better. Are you interested?"';
  },
  choices: [
    { label: 'Tell me more',
      effect: s => {
        if (typeof evtPushOffer === 'function' && s.career && s.career.job) {
          var job = s.career.job;
          var newSalary = Math.round(job.salary * (1.18 + Math.random() * 0.10));
          evtPushOffer(s, {
            company: (s.career.jobHistory && s.career.jobHistory[s.career.jobHistory.length - 1] ? s.career.jobHistory[s.career.jobHistory.length - 1].company : 'Startup'),
            title: job.title,
            track: job.track,
            level: (job.level || 0) + 1,
            salary: newSalary,
            message: 'Colleague referral offer.'
          });
          log('📬 Offer in Career → Offers.');
          fx({ happiness: 5 });
        }
      }
    },
    { label: 'Politely decline',
      effect: s => { fx({ happiness: 1 }); }
    }
  ]
},

/* ---------- PROFESSIONAL MILESTONES ---------- */
{ id: 'career_first_million', minAge: 30, maxAge: 65, weight: 3, maxFires: 1,
  condition: s => {
    if (!s.career || !s.career.job) return false;
    if (typeof econSalary !== 'function') return false;
    var track = (typeof carTrackById === 'function') ? carTrackById(s.career.job.track) : null;
    if (!track) return false;
    var econBase = econSalary(track.id, s.career.job.level || 0, s.country, gameYear(), 'private');
    return econBase >= 1000000;
  },
  title: '💰 Seven-Figure Salary',
  text: s => {
    var job = s.career.job;
    return 'Your salary just crossed ' + money(1000000) + '/year.\n\nYou look at the number on the offer letter and remember where you started. It feels unreal. Your parents would not believe it if you told them.';
  },
  choices: [
    { label: 'Call your parents',
      effect: s => {
        (s.family || []).forEach(function(m) {
          if (m.alive !== false && (m.role === 'Mother' || m.role === 'Father')) {
            m.bond = Math.min(100, (m.bond || 70) + 10);
          }
        });
        fx({ happiness: 8 });
        log('📞 You told them. They cried.');
      }
    },
    { label: 'Keep it quiet',
      effect: s => { fx({ happiness: 3 }); }
    }
  ]
},

{ id: 'career_retirement_decision', minAge: 60, maxAge: 67, weight: 6, maxFires: 1,
  condition: s => {
    if (!s.career || !s.career.job) return false;
    if (typeof PENSION_PRODUCTS === 'undefined') return true;
    return true;
  },
  title: '⏰ Time to Think About Retirement',
  text: s => {
    var job = s.career.job;
    return 'You are ' + s.age + '. Retirement is no longer theoretical.\n\n' + job.company + ' has offered you a retirement package. Or you can keep working for a few more years.\n\nWhat matters more to you now — the money or the time?';
  },
  choices: [
    { label: 'Retire now — the money is enough',
      effect: s => {
        if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('retired');
        if (s.career) { s.career.retired = true; s.career.pension.retiredYear = gameYear(); }
        fx({ happiness: 15, health: 3 });
        log('🏛 You retired. Time is yours now.');
      }
    },
    { label: 'Work 3 more years — save more',
      effect: s => {
        fx({ health: -3, happiness: -5 });
        log('💼 You kept working. The salary is good. The exhaustion is real.');
      }
    }
  ]
},

{ id: 'career_entrepreneurial_urge', minAge: 28, maxAge: 50, weight: 4, maxFires: 2,
  condition: s => {
    if (!s.career || !s.career.job) return false;
    if ((s.career.job.tenure || 0) < 4) return false;
    return s.wealth >= 100000;
  },
  title: '💡 "I Could Do This Better"',
  text: s => 'You have been in the industry for years. You have seen how things are done. You are convinced you could run it better.\n\nThe thought will not leave you alone.\n\nShould you start your own business?',
  choices: [
    { label: 'Yes — quit and start my own thing',
      effect: s => {
        if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('left to start business');
        if (typeof evtRemember === 'function') evtRemember('wantsOwnBusiness', true, 5);
        fx({ happiness: 10, smarts: 3 });
        log('🚀 You quit. Check Career → Business tab to open your business.');
      }
    },
    { label: 'Stay — the steady paycheck wins',
      effect: s => {
        fx({ happiness: -2 });
        log('💼 You stayed. Safer. But the thought lingers.');
      }
    }
  ]
},

{ id: 'career_burnout_breaking', minAge: 28, maxAge: 55, weight: 5, maxFires: 3,
  condition: s => {
    if (!s.career || !s.career.job) return false;
    if (s.health > 55) return false;
    if ((s.career.job.performance || 50) > 40) return false;
    return true;
  },
  title: '🔥 Burnout',
  text: s => {
    var job = s.career.job;
    return 'You cannot get out of bed on Monday.\n\nYou call in sick. Then again Tuesday. Wednesday you just do not show up.\n\nYour body is telling you something your mind refuses to hear: you cannot keep doing ' + job.title + ' like this.';
  },
  choices: [
    { label: 'Take medical leave (2 months, unpaid)',
      effect: s => {
        if (s.career && s.career.job) {
          s.career.job.salary = Math.round((s.career.job.salary || 0) * 0.83);
        }
        fx({ health: 20, happiness: 15 });
        log('🌿 You took medical leave. Slow recovery.');
      }
    },
    { label: 'Push through — you cannot afford to stop',
      effect: s => {
        fx({ health: -10, happiness: -10 });
        if (s.career && s.career.job) {
          s.career.job.performance = Math.max(0, (s.career.job.performance || 50) - 5);
        }
        log('😰 You pushed through. Your body will remember this.');
      }
    }
  ]
}

);
/* ============================================================
   INIT
   ============================================================ */
if (S && !S.evtMemory) S.evtMemory = {};
console.log('[World Life] 02b-data-events-deep.js loaded — ' + DEEP_EVENTS.length + ' connected events');
