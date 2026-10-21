/* ============================================================
   GULF SPONSORSHIP — kafala system, job offers, NOC, exit visa
   ============================================================ */

function ensureGulfWorkState() {
  if (!S) return;
  if (!S.gulfWork) {
    S.gulfWork = {
      active: false,
      offer: null,
      sponsor: null,
      iqama: null,
      exitVisa: null,
      noc: null,
      wageArrears: 0,
      arrearsMonths: 0,
      passportHeld: false,
      absconded: false,
      abscondingReport: null,
      reentryBan: null,
      pendingDrama: null,
      numJobsInGulf: 0,
      history: []
    };
  }
  const g = S.gulfWork;
  if (!Array.isArray(g.history)) g.history = [];
}
GameHooks.on('newGame', ensureGulfWorkState);
GameHooks.on('migrate', ensureGulfWorkState);

/* ---------- HELPERS ---------- */
function _gulfAbsMonth() {
  return (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
}
function _gulfAbsToYear(abs) { return 2001 + Math.floor((abs - 1) / 12); }
function _gulfAbsToLabel(abs) {
  const y = _gulfAbsToYear(abs);
  const m = ((abs - 1) % 12) + 1;
  return isMonthly() ? monthName(m) + ' ' + y : 'Year ' + y;
}
function _gulfRate() { return (C().rate || 1) / 52.7; }
function _gulfLocal(egp) { return Math.round(egp * _gulfRate()); }

function _gulfIsInGulf() {
  return GULF_COUNTRIES.indexOf(S.country) >= 0;
}
window.gulfIsInGulf = _gulfIsInGulf;

function _gulfConvertWealth(oldCountry, newCountry) {
  if (!S) return;
  const oldData = COUNTRIES[oldCountry];
  const newData = COUNTRIES[newCountry];
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
    if (typeof l.monthlyPayment === 'number') l.monthlyPayment = Math.round(l.monthlyPayment / oldRate * newRate);
  });
  if (S.bank && Array.isArray(S.bank.creditCards)) S.bank.creditCards.forEach(function(c) {
    if (typeof c.balance === 'number') c.balance = Math.round(c.balance / oldRate * newRate);
    if (typeof c.limit === 'number') c.limit = Math.round(c.limit / oldRate * newRate);
  });
}
/* ---------- SALARY / CAREER HELPERS (v2) ---------- */
function _gulfNationalityMult() {
  const origin = (S.passports && S.passports[0]) || S.homeCountry || S.country || 'egy';
  return GULF_NATIONALITY_MULT[origin] || 1.0;
}

function _gulfOriginCountry() {
  return (S.passports && S.passports[0]) || S.homeCountry || 'egy';
}

function _gulfCareerInfo() {
  const cj = S.career && S.career.job;
  if (!cj) return { track: 'entry', title: 'Entry Worker', industry: 'retail', level: 0, careerLevel: 0 };
  const track = (typeof CAR_TRACKS !== 'undefined') ? CAR_TRACKS.find(function(t) { return t.id === cj.track; }) : null;
  if (!track) return { track: 'entry', title: 'Entry Worker', industry: 'retail', level: 0, careerLevel: 0 };
  const lvl = Math.min(cj.level || 0, track.levels.length - 1);
  return {
    track: track.id,
    title: track.levels[lvl].title,
    industry: track.industry,
    level: lvl,
    careerLevel: cj.level || 0,
    requiresDegree: track.requiresDegree
  };
}

function _gulfSalaryBreakdown(sourceId, destCountry) {
  const career = _gulfCareerInfo();
  const baseUSD = GULF_TRACK_BASE_USD_MONTH[career.track] || GULF_TRACK_BASE_USD_MONTH.entry;
  const levelMult = GULF_LEVEL_MULT[Math.min(career.level, GULF_LEVEL_MULT.length - 1)];
  const natMult = _gulfNationalityMult();
  const srcMult = GULF_SOURCE_SALARY_MULT[sourceId] || 1.0;
  const monthlyUSD = baseUSD * levelMult * natMult * srcMult;
  const annualUSD = monthlyUSD * 12;
  const destRate = (COUNTRIES[destCountry] && COUNTRIES[destCountry].rate) || 1;
  const basicAnnualLocal = Math.round(annualUSD * destRate);

  /* Allowances (added on top of basic) */
  const housingAllowance = Math.round(basicAnnualLocal * GULF_ALLOWANCES.housingPct);
  const transportAllowance = Math.round(basicAnnualLocal * GULF_ALLOWANCES.transportPct);
  const mobileAllowance = Math.round(basicAnnualLocal * GULF_ALLOWANCES.mobilePct);

  return {
    career: career,
    basicAnnualLocal: basicAnnualLocal,
    housingAllowance: housingAllowance,
    transportAllowance: transportAllowance,
    mobileAllowance: mobileAllowance,
    baseUSD: Math.round(monthlyUSD),
    levelMult: levelMult,
    natMult: natMult,
    srcMult: srcMult
  };
}

function _gulfMoneyFor(amountLocal, countryCode) {
  const c = COUNTRIES[countryCode];
  if (!c) return Math.round(amountLocal).toLocaleString();
  const monthly = Math.round(amountLocal / 12);
  const isMon = (typeof isMonthly === 'function') && isMonthly();
  if (isMon) return monthly.toLocaleString() + ' ' + c.currency + '/mo (' + Math.round(amountLocal).toLocaleString() + '/yr)';
  return Math.round(amountLocal).toLocaleString() + ' ' + c.currency + '/yr (' + monthly.toLocaleString() + '/mo)';
}

function _gulfMoneyShort(amountLocal, countryCode) {
  const c = COUNTRIES[countryCode];
  if (!c) return Math.round(amountLocal).toLocaleString();
  const isMon = (typeof isMonthly === 'function') && isMonthly();
  if (isMon) return Math.round(amountLocal / 12).toLocaleString() + ' ' + c.currency + '/mo';
  return Math.round(amountLocal).toLocaleString() + ' ' + c.currency + '/yr';
}

function _gulfConvertToHome(amountLocal, destCountry) {
  const dest = COUNTRIES[destCountry];
  const home = COUNTRIES[S.homeCountry || 'egy'];
  if (!dest || !home) return amountLocal;
  return Math.round(amountLocal / dest.rate * home.rate);
}

function _gulfIndustryForTrack(track) {
  const map = {
    teaching: 'schools', academia: 'universities', medicine: 'hospitals',
    surgery: 'hospitals', pediatrics: 'hospitals', cardiology: 'hospitals',
    nursing: 'hospitals', psychology: 'hospitals', pharmacy: 'pharma',
    dentistry: 'dental', veterinary: 'veterinary', physiotherapy: 'hospitals',
    law: 'law', prosecutor: 'government', engineering: 'engineering',
    civil_eng: 'engineering', architect: 'architecture', tech: 'tech',
    data_science: 'tech', cybersecurity: 'tech', product_design: 'tech',
    qa_engineering: 'tech', product: 'tech', business: 'banking',
    accounting: 'consulting', investment: 'banking', marketing: 'fmcg',
    sales: 'retail', hr: 'fmcg', consulting: 'consulting', bpo: 'bpo',
    hospitality: 'hotels', aviation: 'aviation', media: 'media',
    government: 'government', trades: 'trades', entry: 'retail'
  };
  return map[track] || 'retail';
}

function _gulfProfessionTitle(track, level) {
  const trackDef = (typeof CAR_TRACKS !== 'undefined') ? CAR_TRACKS.find(function(t) { return t.id === track; }) : null;
  if (trackDef && trackDef.levels[Math.min(level, trackDef.levels.length - 1)]) {
    return trackDef.levels[Math.min(level, trackDef.levels.length - 1)].title;
  }
  return 'Worker';
}
/* ---------- SPONSOR SELECTION ---------- */
function _gulfPickSponsor(source) {
  const bias = source.sponsorBias || ['fair'];
  const type = bias[Math.floor(Math.random() * bias.length)];
  const typeDef = GULF_SPONSOR_TYPES[type] || GULF_SPONSOR_TYPES.fair;

  const gulfCountry = S.gulfWork.pendingCountry || 'sau';
  const career = _gulfCareerInfo();
  const industry = _gulfIndustryForTrack(career.track);

  /* Pick company from the CORRECT industry for the player's career */
  let companyName = 'Gulf Employer ' + Math.floor(Math.random() * 900 + 100);
  const pools = (typeof CAR_COMPANIES !== 'undefined' && CAR_COMPANIES[gulfCountry]) ? CAR_COMPANIES[gulfCountry] : null;
  if (pools) {
    let list = pools[industry] || null;
    /* If exact industry missing, try sensible fallbacks */
    if (!list || !list.length) {
      const fallbacks = ['hospitals', 'schools', 'universities', 'tech', 'banking', 'engineering', 'retail', 'hotels'];
      for (const fb of fallbacks) {
        if (pools[fb] && pools[fb].length) { list = pools[fb]; break; }
      }
    }
    /* Final fallback: any company */
    if (!list || !list.length) {
      for (const k of Object.keys(pools)) {
        if (pools[k] && pools[k].length) { list = pools[k]; break; }
      }
    }
    if (list && list.length) {
      const c = list[Math.floor(Math.random() * list.length)];
      companyName = c.name;
    }
  }

  return {
    type: type,
    label: typeDef.label,
    company: companyName,
    industry: industry,
    control: typeDef.control,
    paysOnTime: typeDef.paysOnTime,
    exitVisaGrant: typeDef.exitVisaGrant,
    nocGrant: typeDef.nocGrant,
    renewsIqama: typeDef.renewsIqama,
    desc: typeDef.desc,
    bond: 50
  };
}

/* ---------- APPLY FLOW ---------- */
window.gulfStartApplication = function(sourceId, countryId) {
  ensureGulfWorkState();
  if (S.age < 18) { log('❌ Must be 18+.'); render(); return; }
  if (_gulfIsInGulf()) { log('❌ You are already in the Gulf.'); render(); return; }
  if (!GULF_COUNTRIES.includes(countryId)) { log('❌ Invalid Gulf country.'); render(); return; }

  const source = GULF_JOB_SOURCES.find(function(s) { return s.id === sourceId; });
  if (!source) return;

  if (source.requiresFriend && (!S.friends || !S.friends.length)) { log('❌ You need at least one friend to refer you.'); render(); return; }
  if (source.requiresRelative) {
    const rels = (S.family || []).filter(function(m) { return m.alive !== false && (m.isSibling || m.role === 'Brother' || m.role === 'Sister'); });
    if (!rels.length) { log('❌ No sibling/relative to refer you.'); render(); return; }
  }
  if (source.requiresJob && !(S.career && S.career.job)) { log('❌ You need a current job for internal transfer.'); render(); return; }

  /* Agency commission */
  if (source.commissionCost > 0) {
    const costLocal = _gulfLocal(source.commissionCost);
    if (S.wealth < costLocal) { log('❌ Agency commission is ' + money(costLocal) + '. You cannot afford it.'); render(); return; }
    if (!confirm('Pay agency commission upfront?\n\nCost: ' + money(costLocal) + '\n\nAgencies are risky — sometimes no real job.')) return;
    S.wealth -= costLocal;
  }

  let successChance = source.successChance;
  if (source.id === 'friend') successChance += 0.10;
  if (S.smarts > 70) successChance += 0.10;
  if (S.smarts < 40) successChance -= 0.10;

  /* Agency scam */
  if (source.scamRisk && Math.random() < source.scamRisk) {
    log('😱 The agency disappeared. No job. Your commission is gone.');
    fx({ happiness: -15 });
    S.gulfWork.history.push({ year: gameYear(), event: 'Agency scam — paid commission, no job' });
    render(); return;
  }

  if (Math.random() > successChance) {
    log('❌ The application was rejected. No offer this time.');
    S.gulfWork.history.push({ year: gameYear(), event: 'Gulf job application rejected (' + source.label + ')' });
    render(); return;
  }

  S.gulfWork.pendingCountry = countryId;
  const sponsor = _gulfPickSponsor(source);

  /* ---- REAL SALARY (Gulf-appropriate, career-matched, nationality-adjusted) ---- */
  const salary = _gulfSalaryBreakdown(sourceId, countryId);

  /* Iqama profession reflects actual career, not random */
  const career = salary.career;
  const iqamaProfession = career.track === 'teaching' ? 'teacher'
    : career.track === 'medicine' ? 'physician'
    : career.track === 'nursing' ? 'nurse'
    : career.track === 'engineering' ? 'engineer'
    : career.track === 'tech' ? 'software engineer'
    : career.track === 'accounting' ? 'accountant'
    : career.track === 'law' ? 'lawyer'
    : career.track === 'bpo' ? 'customer service agent'
    : 'worker';

  const housingIncluded = Math.random() < 0.45; /* 45% get housing included */

  S.gulfWork.offer = {
    country: countryId,
    source: sourceId,
    sourceLabel: source.label,
    sponsor: sponsor,
    track: career.track,
    careerLevel: career.careerLevel,
    title: career.title,
    profession: iqamaProfession,
    basicAnnualLocal: salary.basicAnnualLocal,
    housingAllowance: housingIncluded ? 0 : salary.housingAllowance,
    transportAllowance: salary.transportAllowance,
    mobileAllowance: salary.mobileAllowance,
    totalAnnualLocal: salary.basicAnnualLocal + (housingIncluded ? 0 : salary.housingAllowance) + salary.transportAllowance + salary.mobileAllowance,
    salaryLocal: salary.basicAnnualLocal + (housingIncluded ? 0 : salary.housingAllowance) + salary.transportAllowance + salary.mobileAllowance,
    breakdown: salary,
    housingIncluded: housingIncluded,
    flightsIncluded: Math.random() < 0.7,
    medicalInsuranceProvided: true,
    expiresAbsMonth: _gulfAbsMonth() + 3,
    iqamaYears: (GULF_IQAMA_RULES[countryId] && GULF_IQAMA_RULES[countryId].renewalYears) || 2,
    contractYears: 2 + Math.floor(Math.random() * 2)
  };

  const natLabel = _gulfOriginCountry().toUpperCase();
  log('📨 Job offer from ' + sponsor.company + ' (' + sponsor.label + ')');
  log('💼 ' + career.title + ' · ' + _gulfMoneyShort(S.gulfWork.offer.totalAnnualLocal, countryId));
  log('🌍 Nationality bracket: ' + natLabel + ' (×' + salary.natMult.toFixed(2) + ' market rate)');
  log('📅 Offer expires ' + _gulfAbsToLabel(S.gulfWork.offer.expiresAbsMonth) + '.');
  render();
};

/* ---------- ACCEPT OFFER → RELOCATE ---------- */
window.gulfAcceptOffer = function() {
  ensureGulfWorkState();
  const offer = S.gulfWork.offer;
  if (!offer) { log('❌ No offer to accept.'); render(); return; }
  if (_gulfAbsMonth() > offer.expiresAbsMonth) { log('❌ Offer expired.'); S.gulfWork.offer = null; render(); return; }

  if (!confirm('Accept the offer from ' + offer.sponsor.company + '?\n\n• Relocate to ' + COUNTRIES[offer.country].name + '\n• Role: ' + offer.title + '\n• Total package: ' + _gulfMoneyShort(offer.totalAnnualLocal, offer.country) + '\n• Sponsorship: ' + offer.sponsor.label + '\n\nYou will be bound to this sponsor.')) return;

  const oldCountry = S.country;

  /* Quit current job */
  if (S.career && S.career.job) {
    if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('relocated to Gulf');
    else { S.career.job = null; S.job = null; }
  }

  /* End rental */
  if (S.housing === 'rented') { S.housing = 'parents'; S.rentedHome = null; }

  /* Convert wealth */
  _gulfConvertWealth(oldCountry, offer.country);
  S.country = offer.country;
  if (!S.homeCountry) S.homeCountry = oldCountry;

  /* Job with career track preserved (for career ladder to work) */
  S.job = { company: offer.sponsor.company, title: offer.title, salary: offer.totalAnnualLocal, level: offer.careerLevel, years: 0 };
  if (S.career) {
    S.career.job = {
      company: offer.sponsor.company,
      title: offer.title,
      track: offer.track, /* SAME track as before! Career ladder intact */
      level: offer.careerLevel,
      salary: offer.totalAnnualLocal,
      baseSalaryEGP: offer.breakdown.basicAnnualLocal / (C().rate / 52.7), /* correct base */
      payMult: 1.0,
      performance: 50,
      hiredYear: gameYear(),
      tenure: 0,
      benefits: ['health', 'bonus'],
      stability: offer.sponsor.paysOnTime >= 0.9 ? 0.85 : 0.6,
      prestige: 3,
      salaryCurrency: C().currency
    };
    S.career.mood = 'satisfied';
  }

  /* Immigration */
  if (S.immigration) {
    S.immigration.destination = offer.country;
    S.immigration.visaType = 'work';
    S.immigration.status = 'visa_work';
    S.immigration.workRights = 'full';
    S.immigration.sponsor = offer.sponsor.company;
    S.immigration.expiresYear = gameYear() + offer.iqamaYears;
    S.immigration.iqamaRenewalYear = gameYear() + offer.iqamaYears;
  }

  /* Gulf state */
  const iqamaExpiryAbs = _gulfAbsMonth() + offer.iqamaYears * 12;
  S.gulfWork.active = true;
  S.gulfWork.sponsor = offer.sponsor;
  S.gulfWork.contractStartAbs = _gulfAbsMonth();
  S.gulfWork.basicAnnualLocal = offer.basicAnnualLocal;
  S.gulfWork.eosbAccrued = 0;
  S.gulfWork.iqama = {
    number: 'IQ' + Math.floor(Math.random() * 900000000 + 100000000),
    profession: offer.profession,
    expiresAbsMonth: iqamaExpiryAbs,
    sponsorCompany: offer.sponsor.company,
    issuedAbsMonth: _gulfAbsMonth()
  };
  S.gulfWork.exitVisa = { status: 'valid', issuedAbsMonth: _gulfAbsMonth(), usedForTrip: null };
  S.gulfWork.noc = { status: 'not_requested', requestedAbsMonth: null };
  S.gulfWork.offer = null;
  S.gulfWork.pendingCountry = null;
  S.gulfWork.numJobsInGulf = (S.gulfWork.numJobsInGulf || 0) + 1;
  S.gulfWork.passportHeld = (offer.sponsor.control >= 0.7);
  if (S.gulfWork.passportHeld) log('🚨 Your employer took your passport "for safekeeping."');

  /* ---- ACCOMMODATION ---- */
  if (offer.housingIncluded) {
    /* Company housing */
    S.housing = 'rented';
    S.rentedHome = {
      tierId: 'company_housing',
      yearlyRent: 0,
      area: 60,
      condition: 70,
      rentedYear: gameYear(),
      isCompanyProvided: true
    };
    log('🏠 Company housing provided — rent-free.');
  } else {
    /* Must choose accommodation */
    S.pending = _gulfBuildHousingChoice(offer);
    S.evId = 'gulf_housing_choice';
  }

  S.gulfWork.history.push({ year: gameYear(), event: 'Arrived in ' + COUNTRIES[offer.country].name + ' for ' + offer.sponsor.company });
  log('✈️ Arrived in ' + COUNTRIES[offer.country].name + '. Joined ' + offer.sponsor.company + ' as ' + offer.title + '.');
  log('💼 Total package: ' + _gulfMoneyShort(offer.totalAnnualLocal, offer.country) + '.');
  log('🪪 Iqama issued. Expires ' + _gulfAbsToLabel(iqamaExpiryAbs) + '.');

  emitSignal('gulfWorkArrived', { country: offer.country, company: offer.sponsor.company });
  render();
};

function _gulfBuildHousingChoice(offer) {
  const basic = offer.basicAnnualLocal;
  const country = offer.country;
  const currency = COUNTRIES[country].currency;

  const options = GULF_HOUSING_TIERS.map(function(tier) {
    const yearly = Math.round(basic * tier.rentPct);
    const monthly = Math.round(yearly / 12);
    return {
      label: tier.label + ' · ' + monthly.toLocaleString() + ' ' + currency + '/mo · ' + tier.desc,
      effect: function(s) {
        s.housing = 'rented';
        s.rentedHome = {
          tierId: tier.id,
          yearlyRent: yearly,
          area: tier.area,
          condition: tier.condition,
          rentedYear: gameYear()
        };
        if (tier.happiness) fx({ happiness: tier.happiness });
        log('🏠 Moved into ' + tier.label + ' — ' + Math.round(yearly / 12).toLocaleString() + ' ' + currency + '/month.');
      }
    };
  });

  return {
    title: '🏠 Find Accommodation',
    text: 'Your employer does not provide housing. Choose where to live in ' + COUNTRIES[country].name + '.\n\nBasic salary: ' + Math.round(basic / 12).toLocaleString() + ' ' + currency + '/month.',
    choices: options
  };
}
window.gulfDeclineOffer = function() {
  if (!S.gulfWork.offer) return;
  log('❌ Offer declined.');
  S.gulfWork.offer = null;
  S.gulfWork.pendingCountry = null;
  render();
};

/* ---------- NOC REQUEST ---------- */
window.gulfRequestNOC = function() {
  ensureGulfWorkState();
  const g = S.gulfWork;
  if (!g.active || !g.sponsor) return;

  if (g.noc.status === 'granted') { log('✅ You already have an NOC.'); render(); return; }
  if (g.noc.status === 'requested' && g.noc.requestedAbsMonth === _gulfAbsMonth()) {
    log('⏳ NOC request already pending this period.');
    render(); return;
  }

  g.noc.status = 'requested';
  g.noc.requestedAbsMonth = _gulfAbsMonth();

  const grantChance = g.sponsor.nocGrant;
  const roll = Math.random();

  if (roll < grantChance) {
    g.noc.status = 'granted';
    log('✅ Your sponsor signed the NOC. You can now transfer to another sponsor.');
    fx({ happiness: 5 });
  } else {
    g.noc.status = 'refused';
    log('❌ Your sponsor refused to sign the NOC. "You are needed here."');
    /* Sponsor may demand bribe */
    if (g.sponsor.control >= 0.6 && Math.random() < 0.4) {
      log('💡 A middleman whispers: your sponsor might sign for money.');
    }
    fx({ happiness: -4 });
  }
  render();
};

/* ---------- BRIBED NOC ---------- */
window.gulfBribeForNOC = function() {
  ensureGulfWorkState();
  const g = S.gulfWork;
  if (!g.active) return;
  const cost = _gulfLocal(50000);
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + ' for the bribe.'); render(); return; }
  if (!confirm('Offer your sponsor ' + money(cost) + ' for the NOC?\n\n70% chance they sign. If they refuse, you lose the money.')) return;
  S.wealth -= cost;
  if (Math.random() < 0.70) {
    g.noc.status = 'granted';
    log('💰 Your sponsor took the money and signed the NOC.');
    fx({ happiness: 3 });
  } else {
    g.noc.status = 'refused';
    log('😡 Your sponsor took the money AND refused. Shameful.');
    fx({ happiness: -8 });
  }
  render();
};

/* ---------- EXIT VISA ---------- */
window.gulfRequestExitVisa = function() {
  ensureGulfWorkState();
  const g = S.gulfWork;
  if (!g.active) return;

  const grantChance = g.sponsor.exitVisaGrant;
  if (Math.random() < grantChance) {
    g.exitVisa = { status: 'valid', issuedAbsMonth: _gulfAbsMonth(), usedForTrip: null };
    log('✅ Exit visa granted. You can travel freely.');
    fx({ happiness: 3 });
  } else {
    g.exitVisa.status = 'denied';
    log('❌ Your employer refused an exit visa. You cannot leave the country right now.');
    fx({ happiness: -8 });
  }
  render();
};

/* ---------- CHANGE JOB ---------- */
window.gulfTryChangeJob = function() {
  ensureGulfWorkState();
  const g = S.gulfWork;
  if (!g.active) return;
  if (g.noc.status !== 'granted') { log('❌ You need a granted NOC to change jobs legally.'); render(); return; }

  const country = S.country;
  const career = _gulfCareerInfo();
  const industry = _gulfIndustryForTrack(career.track);
  const pools = (typeof CAR_COMPANIES !== 'undefined' && CAR_COMPANIES[country]) ? CAR_COMPANIES[country] : null;
  if (!pools) { log('❌ No job market here.'); render(); return; }

  let list = pools[industry];
  if (!list || !list.length) { log('❌ No companies in your industry here.'); render(); return; }
  const newCompany = list[Math.floor(Math.random() * list.length)];

  const currentSalary = (S.career && S.career.job ? S.career.job.salary : 0) || (S.job ? S.job.salary : 0);
  const bumpPct = 0.10 + Math.random() * 0.25;
  const newSalary = Math.round(currentSalary * (1 + bumpPct));

  if (!confirm('Transfer to ' + newCompany.name + '?\n\nSame role: ' + career.title + '\nNew salary: ' + _gulfMoneyShort(newSalary, country) + ' (+' + Math.round(bumpPct * 100) + '%)\n\nSponsorship transfers to the new employer.')) return;

  const newSponsor = _gulfPickSponsor({ sponsorBias: ['fair', 'strict', 'generous'] });
  newSponsor.company = newCompany.name;
  newSponsor.industry = industry;
  g.sponsor = newSponsor;

  if (S.career && S.career.job) {
    S.career.job.company = newCompany.name;
    S.career.job.salary = newSalary;
    S.career.job.tenure = 0;
    S.career.job.hiredYear = gameYear();
  }
  if (S.job) {
    S.job.company = newCompany.name;
    S.job.salary = newSalary;
    S.job.years = 0;
  }

  g.noc = { status: 'not_requested', requestedAbsMonth: null };
  const rules = GULF_IQAMA_RULES[S.country] || { renewalYears: 2 };
  g.iqama.expiresAbsMonth = _gulfAbsMonth() + rules.renewalYears * 12;
  g.iqama.sponsorCompany = newCompany.name;
  g.numJobsInGulf = (g.numJobsInGulf || 0) + 1;

  log('🔄 Transferred to ' + newCompany.name + '. New salary: ' + _gulfMoneyShort(newSalary, country) + '.');
  emitSignal('gulfJobTransferred', { company: newCompany.name, salary: newSalary });
  render();
};
/* ---------- ABSCOND (leave job without NOC) ---------- */
window.gulfAbscond = function() {
  ensureGulfWorkState();
  const g = S.gulfWork;
  if (!g.active) return;
  if (!confirm('Abandon your job without NOC?\n\n⚠️ Sponsor will file an ABSONDING REPORT\n⚠️ You will be banned from working legally\n⚠️ Deportation risk rises sharply\n\nProceed?')) return;

  g.absconded = true;
  g.abscondingReport = { filedAbsMonth: _gulfAbsMonth(), by: g.sponsor.company };
  g.iqama = null;
  g.exitVisa = null;

  /* Immigration status → undocumented */
  if (S.immigration) {
    S.immigration.visaType = 'undocumented';
    S.immigration.status = 'undocumented';
    S.immigration.workRights = 'none';
  }
  if (S.career && S.career.job) {
    S.career.job = null;
    S.job = null;
  }

  log('🚨 You absconded. Your sponsor filed a report. You are undocumented.');
  fx({ happiness: -15, health: -5 });
  emitSignal('gulfAbsconded', { company: g.sponsor.company });
  render();
};

/* ---------- VISIT HOME (uses exit visa + vacation days) ---------- */
window.gulfVisitHome = function(days) {
  ensureGulfWorkState();
  const g = S.gulfWork;
  if (!g.active) return;

  if (!g.exitVisa || g.exitVisa.status !== 'valid') {
    log('❌ No valid exit visa. You cannot leave.');
    render(); return;
  }

  const vacationDays = S.vacationDays || 21;
  const usedDays = S.vacationDaysUsedThisYear || 0;
  if (days > vacationDays - usedDays) {
    log('❌ Not enough vacation days (' + (vacationDays - usedDays) + ' left).');
    render(); return;
  }

  const flightCost = _gulfLocal(35000);
  if (S.wealth < flightCost) { log('❌ Need ' + money(flightCost) + ' for flights.'); render(); return; }

  if (!confirm('Visit home for ' + days + ' days?\n\nFlights: ' + money(flightCost) + '\nVacation days used: ' + days + '\n\nYour exit visa will be consumed.')) return;

  S.wealth -= flightCost;
  S.vacationDaysUsedThisYear = usedDays + days;
  g.exitVisa.status = 'consumed';
  g.exitVisa.usedForTrip = { year: gameYear(), days: days };

  fx({ happiness: Math.min(20, days), health: 2 });
  log('✈️ Visited home for ' + days + ' days. Happiness +' + Math.min(20, days) + '.');

  /* Family bond boost */
  (S.family || []).forEach(function(m) {
    if (m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 4);
  });
  if (S.marriage && S.marriage.partner) {
    S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + 5);
  }

  /* Need new exit visa to return */
  g.exitVisa.status = 'valid';
  g.exitVisa.issuedAbsMonth = _gulfAbsMonth();

  emitSignal('gulfVisitedHome', { days: days });
  render();
};

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureGulfWorkState();
  if (!S || !S.gulfWork) return;
  const g = S.gulfWork;
  if (!g.active || !_gulfIsInGulf()) return;

  /* Iqama expiry */
  if (g.iqama) {
    const currentAbs = _gulfAbsMonth();
    if (currentAbs >= g.iqama.expiresAbsMonth) {
      /* Try renewal */
      if (Math.random() < (g.sponsor ? g.sponsor.renewsIqama : 0.8)) {
        const rules = GULF_IQAMA_RULES[S.country] || { renewalYears: 2 };
        g.iqama.expiresAbsMonth = currentAbs + rules.renewalYears * 12;
        log('🪪 Iqama renewed by sponsor. New expiry ' + _gulfAbsToLabel(g.iqama.expiresAbsMonth) + '.');
      } else {
        log('🚨 Sponsor failed to renew your iqama. You are now undocumented.');
        if (S.immigration) {
          S.immigration.visaType = 'undocumented';
          S.immigration.status = 'undocumented';
          S.immigration.workRights = 'none';
        }
        g.iqama = null;
        g.exitVisa = null;
      }
    }
  }

  /* Wage theft accumulation */
  if (g.sponsor && !g.absconded) {
    if (Math.random() > g.sponsor.paysOnTime) {
      const salary = (S.career && S.career.job ? S.career.job.salary : 0) || (S.job ? S.job.salary : 0);
      g.wageArrears += salary;
      g.arrearsMonths += 12;
      log('⚠️ ' + g.sponsor.company + ' delayed your wages. Total owed: ' + money(g.wageArrears) + '.');
    } else if (g.wageArrears > 0) {
      /* Catch-up payment */
      S.wealth += g.wageArrears;
      log('💰 Employer paid back wages: ' + money(g.wageArrears) + '.');
      g.wageArrears = 0;
      g.arrearsMonths = 0;
    }
  }

  /* Drama event roll — 35% chance per year */
  if (Math.random() < 0.35 && !S.pending) {
    _gulfFireDrama();
  }

  /* Notify if wage arrears escalate */
  if (g.wageArrears >= (S.career && S.career.job ? S.career.job.salary * 3 : 0) && !g._wageWarning) {
    log('🚨 Your employer owes you 3+ months of wages. This is serious.');
    g._wageWarning = true;
  }
});

/* ---------- DRAMA EVENT ---------- */
function _gulfFireDrama() {
  const g = S.gulfWork;
  const eligible = GULF_DRAMA_EVENTS.filter(function(ev) {
    if (ev.requiresAttemptedChange && g.noc.status !== 'refused') return false;
    if (ev.requiresMarried && !(S.marriage && S.marriage.status === 'married')) return false;
    if (ev.requiresAgencyPlacement && g.sponsor.type !== 'agency') return false;
    if (ev.requiresSpouse && !(S.marriage && S.marriage.partner)) return false;
    return true;
  });
  if (!eligible.length) return;
  const total = eligible.reduce(function(s, e) { return s + e.weight; }, 0);
  let roll = Math.random() * total;
  let chosen = eligible[0];
  for (let i = 0; i < eligible.length; i++) {
    roll -= eligible[i].weight;
    if (roll <= 0) { chosen = eligible[i]; break; }
  }

  /* Non-choice events apply immediately */
  if (chosen.choice === false) {
    if (chosen.id === 'gulf_wage_rise') {
      if (S.career && S.career.job) { S.career.job.salary = Math.round(S.career.job.salary * 1.10); }
      if (S.job) { S.job.salary = Math.round(S.job.salary * 1.10); }
      log('💰 ' + chosen.title + ': ' + chosen.text);
      fx({ happiness: 6 });
    } else if (chosen.id === 'sponsor_noc_offer') {
      g.noc.status = 'granted';
      log('✅ ' + chosen.title + ': ' + chosen.text);
    } else if (chosen.id === 'gulf_housemaid_rights') {
      log('ℹ️ ' + chosen.title + ': ' + chosen.text);
    }
    g.history.push({ year: gameYear(), event: chosen.title });
    return;
  }

  /* Choice event → pending */
  S.pending = {
    title: chosen.title,
    text: chosen.text,
    choices: chosen.choices.map(function(c) {
      return {
        label: c.label,
        effect: function(s) { _gulfResolveDrama(chosen.id, c.effect, s); }
      };
    })
  };
  S.evId = 'gulf_drama_' + chosen.id;
  g.history.push({ year: gameYear(), event: chosen.title });
  log('🚨 ' + chosen.title + ': ' + chosen.text);
  render();
}

function _gulfResolveDrama(eventId, effect, s) {
  const g = s.gulfWork;
  const salary = (s.career && s.career.job ? s.career.job.salary : 0) || (s.job ? s.job.salary : 0);

  if (eventId === 'wage_theft') {
    if (effect === 'complain') {
      if (Math.random() < 0.4) {
        s.wealth += g.wageArrears;
        log('💰 Employer paid some arrears after you complained: ' + money(g.wageArrears));
        g.wageArrears = 0; g.arrearsMonths = 0;
      } else log('❌ Complaint ignored. Wages still owed.');
    } else if (effect === 'report') {
      if (Math.random() < 0.6) {
        s.wealth += g.wageArrears;
        log('⚖️ Labor office ruled in your favor. Arrears paid.');
        g.wageArrears = 0; g.arrearsMonths = 0;
        g.sponsor.bond = Math.max(0, g.sponsor.bond - 30);
      } else log('❌ Labor office sided with your employer. You must continue waiting.');
    } else {
      log('⏳ You waited. Wages still owed.');
    }
  } else if (eventId === 'passport_confiscation') {
    if (effect === 'demand') {
      if (Math.random() < 0.5) { g.passportHeld = false; log('✅ Your passport was returned.'); }
      else { log('❌ Employer refused. Passport still held.'); fx({ happiness: -5 }); }
    } else {
      g.passportHeld = true;
      log('😔 Passport remains with your employer.');
    }
  } else if (eventId === 'family_emergency') {
    if (effect === 'beg') {
      if (Math.random() < g.sponsor.exitVisaGrant) {
        g.exitVisa = { status: 'valid', issuedAbsMonth: _gulfAbsMonth(), usedForTrip: null };
        log('✅ Employer relented. Exit visa granted. Book a flight home.');
      } else {
        log('❌ Employer refused. Your family must wait.');
        fx({ happiness: -12 });
      }
    } else if (effect === 'abscond') {
      g.absconded = true;
      g.abscondingReport = { filedAbsMonth: _gulfAbsMonth(), by: g.sponsor.company };
      g.iqama = null; g.exitVisa = null;
      if (s.immigration) { s.immigration.visaType = 'undocumented'; s.immigration.status = 'undocumented'; s.immigration.workRights = 'none'; }
      s.career.job = null; s.job = null;
      log('🚨 You left without permission. Your employer filed an absconding report.');
      fx({ happiness: -20 });
    } else {
      const cost = _gulfLocal(50000);
      if (s.wealth >= cost) { s.wealth -= cost; log('💸 Sent ' + money(cost) + ' home for medical care.'); fx({ happiness: 2 }); }
      else log('❌ Not enough money to send.');
    }
  } else if (eventId === 'iqama_profession_mismatch') {
    if (effect === 'bribe') {
      const cost = _gulfLocal(15000);
      if (s.wealth >= cost) { s.wealth -= cost; log('💵 Inspector pocketed the money and left.'); }
      else log('❌ Cannot afford the bribe. Fine issued.'); fx({ happiness: -6 });
    } else {
      const fine = _gulfLocal(8000);
      if (s.wealth >= fine) { s.wealth -= fine; log('💸 Fine paid: ' + money(fine)); }
      fx({ happiness: -4 });
    }
  } else if (eventId === 'child_birth_nationality') {
    if (effect === 'register') {
      log('📋 You registered your child with your home embassy. They have your home nationality.');
      fx({ happiness: 5 });
    } else {
      log('⚠️ Child is undocumented in the Gulf. Problems will come later.');
      fx({ happiness: -3 });
    }
  } else if (eventId === 'employer_company_failure') {
    if (effect === 'search') {
      log('💼 You started looking. Check NOC status and job market.');
    } else {
      log('😐 You waited. Company collapsed next year.');
      if (Math.random() < 0.5) {
        s.career.job = null; s.job = null;
        g.iqama = null; g.exitVisa = null;
        if (s.immigration) { s.immigration.visaType = 'undocumented'; s.immigration.status = 'undocumented'; s.immigration.workRights = 'none'; }
        log('🚨 You lost your job. You are now undocumented.');
      }
    }
  } else if (eventId === 'sponsor_death') {
    if (effect === 'contact') {
      if (Math.random() < 0.6) { log('✅ The heir agreed to inherit your sponsorship.'); }
      else {
        g.iqama = null; g.exitVisa = null;
        if (s.immigration) { s.immigration.visaType = 'undocumented'; s.immigration.status = 'undocumented'; s.immigration.workRights = 'none'; }
        log('❌ Heir refused. You are undocumented.');
      }
    } else {
      log('🔄 You looked for transfer. Check NOC status.');
    }
  } else if (eventId === 'housing_eviction') {
    const rent = _gulfLocal(24000);
    if (effect === 'rent') {
      if (s.wealth >= rent) { s.wealth -= rent; s.housing = 'rented'; log('🏠 Rented an apartment for ' + money(rent) + '/year.'); }
      else log('❌ Cannot afford. Moved to camp.');
    } else {
      s.housing = 'camp';
      log('🏕 You moved to the worker camp. Cheap but cramped.');
      fx({ happiness: -8 });
    }
  } else if (eventId === 'medical_no_insurance') {
    const bill = _gulfLocal(15000 * 52.7);
    if (effect === 'pay') {
      if (s.wealth >= bill) { s.wealth -= bill; log('💸 Paid hospital bill: ' + money(bill)); fx({ health: 5 }); }
      else log('❌ Cannot afford. Health declined.'); fx({ health: -10 });
    } else {
      log('😔 Refused treatment. Health declined.');
      fx({ health: -15 });
    }
  } else if (eventId === 'sponsor_wants_noc_bribe') {
    const cost = _gulfLocal(50000);
    if (effect === 'pay_bribe') {
      if (s.wealth >= cost) { s.wealth -= cost; g.noc.status = 'granted'; log('💰 Paid bribe. NOC granted.'); }
      else log('❌ Cannot afford the bribe.');
    } else {
      log('😤 You refused. Sponsor closed the door.');
      g.noc.status = 'refused';
    }
  } else if (eventId === 'recruiter_fee_swindle') {
    const cost = _gulfLocal(30000);
    if (effect === 'pay') {
      if (s.wealth >= cost) { s.wealth -= cost; log('💸 Paid the recruiter again. They go quiet... for now.'); }
      else log('❌ Cannot afford. They may escalate.');
    } else {
      log('📞 You reported them to the labor ministry. Investigation opened.');
    }
  } else if (eventId === 'gulf_layoff') {
    if (effect === 'severance') {
      const sev = salary * 0.5;
      s.wealth += sev;
      s.career.job = null; s.job = null;
      g.iqama = null; g.exitVisa = null;
      if (s.immigration) { s.immigration.visaType = 'undocumented'; s.immigration.status = 'undocumented'; s.immigration.workRights = 'none'; }
      log('💸 Accepted severance: ' + money(sev) + '. Job terminated. Find new work or leave.');
    } else {
      if (Math.random() < 0.3) log('✅ Your appeal succeeded. Job retained.');
      else { s.career.job = null; s.job = null; log('❌ Appeal failed. You are terminated.'); }
    }
  } else if (eventId === 'wanted_return_home') {
    if (effect === 'reassure') { fx({ happiness: 2 }); log('💬 You reassured your family. They understand for now.'); }
    else if (effect === 'money') {
      const cost = _gulfLocal(15000);
      if (s.wealth >= cost) { s.wealth -= cost; log('💸 Sent ' + money(cost) + ' home. Everyone calmer.'); }
    } else { log('📝 You started planning your eventual return home.'); }
  } else if (eventId === 'document_lost') {
    if (effect === 'proper') {
      const fee = _gulfLocal(3000);
      if (s.wealth >= fee) { s.wealth -= fee; log('🪪 Police report filed and iqama replaced: ' + money(fee)); }
    } else {
      log('⚠️ No report. You may face penalties later.');
    }
  } else if (eventId === 'saudi_contract_reform') {
    if (effect === 'sign') {
      log('📝 You signed. Profession changed on iqama.');
      if (g.iqama) g.iqama.profession = 'worker';
    } else {
      if (Math.random() < 0.4) log('✅ You refused. Employer backed down.');
      else {
        s.career.job = null; s.job = null;
        g.iqama = null; g.exitVisa = null;
        if (s.immigration) { s.immigration.visaType = 'undocumented'; s.immigration.status = 'undocumented'; s.immigration.workRights = 'none'; }
        log('🚨 Terminated. You are undocumented.');
      }
    }
  }
}

/* ---------- RENDER ---------- */
window.gulfWorkRender = function() {
  ensureGulfWorkState();
  const g = S.gulfWork;

  /* Not in Gulf, no offer */
  if (!_gulfIsInGulf() && !g.offer) return _gulfRenderApplyUI();

  /* Offer pending — FULL REWRITE with correct currency + pace + career match */
  if (g.offer) {
    const offer = g.offer;
    const country = COUNTRIES[offer.country];
    const currency = country.currency;
    const monthlyBasic = Math.round(offer.basicAnnualLocal / 12);
    const monthlyTotal = Math.round(offer.totalAnnualLocal / 12);
    const homeEquivalent = _gulfConvertToHome(offer.totalAnnualLocal, offer.country);
    const homeCurrency = COUNTRIES[S.homeCountry || 'egy'].currency;
    const homeMonthly = Math.round(homeEquivalent / 12);

    const isMon = (typeof isMonthly === 'function') && isMonthly();
    const monthlySalary = isMon ? monthlyBasic : monthlyBasic;
    const natLabel = _gulfOriginCountry().toUpperCase();
    const natMult = offer.breakdown.natMult;

    let html = '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">📨 Job Offer Pending</h3>' +
      '<div class="row"><span>Country</span><b>' + country.flag + ' ' + country.name + '</b></div>' +
      '<div class="row"><span>Company</span><b>' + offer.sponsor.company + '</b></div>' +
      '<div class="row"><span>Your role</span><b>' + offer.title + '</b></div>' +
      '<div class="row"><span>Industry</span><b>' + (offer.sponsor.industry || 'General').toUpperCase() + '</b></div>' +
      '<div class="row"><span>Sponsor type</span><b>' + offer.sponsor.label + '</b></div>' +
      '<div class="muted small" style="margin-top:2px">' + offer.sponsor.desc + '</div>' +
      '</div>';

    /* Salary breakdown — the whole point */
    html += '<div class="card" style="border-color:#22d3ee"><h4 style="color:#22d3ee">💰 Salary Package</h4>' +
      '<div class="row"><span>Basic salary</span><b class="mono">' + monthlyBasic.toLocaleString() + ' ' + currency + '/mo</b></div>' +
      (offer.housingIncluded
        ? '<div class="row"><span>Housing</span><b class="good">Free (company provided)</b></div>'
        : '<div class="row"><span>Housing allowance (25%)</span><b class="mono">+' + Math.round(offer.housingAllowance / 12).toLocaleString() + ' ' + currency + '/mo</b></div>') +
      '<div class="row"><span>Transport (10%)</span><b class="mono">+' + Math.round(offer.transportAllowance / 12).toLocaleString() + ' ' + currency + '/mo</b></div>' +
      '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total package</b><b class="good mono" style="font-size:1.05rem">' + monthlyTotal.toLocaleString() + ' ' + currency + '/mo</b></div>' +
      '<div class="muted small" style="margin-top:2px">≈ ' + homeMonthly.toLocaleString() + ' ' + homeCurrency + '/month equivalent</div>' +
      '</div>';

    /* Nationality disclosure */
    html += '<div class="card" style="border-color:#fbbf24;background:#fbbf2410">' +
      '<div class="row"><span>Passport</span><b>' + natLabel + '</b></div>' +
      '<div class="row"><span>Market rate for your nationality</span><b>×' + natMult.toFixed(2) + '</b></div>' +
      '<p class="muted small" style="margin-top:4px">' + 
        (natMult >= 1.4 ? '🌍 Western passport — premium pay bracket.' :
         natMult >= 1.0 ? '🌍 Arab passport — standard market rate.' :
         natMult >= 0.8 ? '🌍 South Asian passport — reduced market rate.' :
         '🌍 Non-Arab passport — entry-tier market rate.') +
      '</div>';

    /* Contract terms */
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">📋 Contract Terms</h4>' +
      '<div class="row"><span>Iqama profession</span><b>' + offer.profession + '</b></div>' +
      '<div class="row"><span>Contract length</span><b>' + offer.contractYears + ' years</b></div>' +
      '<div class="row"><span>Housing</span><b>' + (offer.housingIncluded ? '✓ Included' : '✗ Not included (allowance provided)') + '</b></div>' +
      '<div class="row"><span>Flights home</span><b>' + (offer.flightsIncluded ? '✓ Annual round-trip' : '✗ You pay') + '</b></div>' +
      '<div class="row"><span>Medical insurance</span><b>✓ Provided</b></div>' +
      '<div class="row"><span>Annual vacation</span><b>30 days</b></div>' +
      '<div class="row"><span>EOSB</span><b>Half-month basic per year (first 5 years)</b></div>' +
      '<div class="row"><span>Offer expires</span><b class="' + (_gulfAbsMonth() > offer.expiresAbsMonth ? 'bad' : '') + '">' + _gulfAbsToLabel(offer.expiresAbsMonth) + '</b></div>' +
      '</div>';

    /* Career ladder preview */
    const trackDef = (typeof CAR_TRACKS !== 'undefined') ? CAR_TRACKS.find(function(t) { return t.id === offer.track; }) : null;
    if (trackDef && trackDef.levels.length > offer.careerLevel + 1) {
      const nextLevel = trackDef.levels[offer.careerLevel + 1];
      html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">📈 Career Ladder</h4>' +
        '<div class="row"><span>Current</span><b>' + offer.title + '</b></div>' +
        '<div class="row"><span>Next level</span><b>' + nextLevel.title + '</b></div>' +
        '<div class="muted small">Your Gulf job preserves your career track — promotions continue normally.</div>' +
        '</div>';
    }

    html += '<button class="opt" style="margin-top:10px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;padding:12px" onclick="gulfAcceptOffer()">✅ Accept & Relocate</button>';
    html += '<button class="opt" style="margin-top:6px;width:100%;text-align:center;border-color:#fb7185;color:#fb7185" onclick="gulfDeclineOffer()">✕ Decline</button>';
    html += '</div>';

    return html;
  }

  /* In Gulf — sponsorship dashboard (unchanged structurally, but add EOSB display) */
  const sponsor = g.sponsor;
  const sponsorColor = sponsor.type === 'exploitative' ? '#fb7185' : sponsor.type === 'generous' || sponsor.type === 'fair' ? '#34d399' : '#fbbf24';
  const iqama = g.iqama;
  const iqamaMonthsLeft = iqama ? Math.max(0, iqama.expiresAbsMonth - _gulfAbsMonth()) : 0;
  const noc = g.noc;
  const exit = g.exitVisa;

  let html = '';

  if (g.absconded) {
    html += '<div class="card" style="border-color:#fb7185;background:#fb718515"><h3 style="color:#fb7185">🚨 Absconded</h3><p class="muted small">Your sponsor filed an absconding report. You are undocumented in ' + C().name + '.</p></div>';
  } else if (S.immigration && S.immigration.status === 'undocumented') {
    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">🚨 Undocumented</h3><p class="muted small">You are no longer legally employed. See Career → Underground section.</p></div>';
  } else {
    html += '<div class="card" style="border-color:' + sponsorColor + '">' +
      '<h3 style="color:' + sponsorColor + '">🏢 Your Sponsor</h3>' +
      '<div class="row"><span>Company</span><b>' + sponsor.company + '</b></div>' +
      '<div class="row"><span>Type</span><b>' + sponsor.label + '</b></div>' +
      '<div class="muted small" style="margin-top:2px">' + sponsor.desc + '</div>' +
      '<div class="row"><span>Control level</span><b>' + Math.round(sponsor.control * 100) + '%</b></div>' +
      (S.career && S.career.job ? '<div class="row"><span>Your role</span><b>' + S.career.job.title + '</b></div>' : '') +
      '</div>';
  }

  if (iqama) {
    const iqamaColor = iqamaMonthsLeft < 3 ? '#fb7185' : iqamaMonthsLeft < 6 ? '#fbbf24' : '#34d399';
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🪪 Iqama (Residence Permit)</h4>' +
      '<div class="row"><span>Number</span><b class="mono">' + iqama.number + '</b></div>' +
      '<div class="row"><span>Profession</span><b>' + iqama.profession + '</b></div>' +
      '<div class="row"><span>Sponsor</span><b>' + iqama.sponsorCompany + '</b></div>' +
      '<div class="row"><span>Expires</span><b style="color:' + iqamaColor + '">' + _gulfAbsToLabel(iqama.expiresAbsMonth) + ' (' + iqamaMonthsLeft + ' mo)</b></div>' +
      '</div>';
  }

  /* EOSB tracker */
  if (g.eosbAccrued > 0 || g.contractStartAbs) {
    const monthsIn = g.contractStartAbs ? (_gulfAbsMonth() - g.contractStartAbs) : 0;
    const basicMonthly = Math.round((g.basicAnnualLocal || 0) / 12);
    const years = Math.floor(monthsIn / 12);
    let eosb = 0;
    for (let i = 1; i <= years; i++) eosb += i <= 5 ? basicMonthly * GULF_EOSB.first5Years : basicMonthly * GULF_EOSB.after5Years;
    html += '<div class="card" style="border-color:#34d399"><h4 style="color:#34d399">💰 End of Service Benefits</h4>' +
      '<div class="row"><span>Years of service</span><b>' + years + '</b></div>' +
      '<div class="row"><span>Accrued EOSB</span><b class="good mono">' + (eosb + (g.eosbAccrued || 0)).toLocaleString() + ' ' + C().currency + '</b></div>' +
      '<p class="muted small">Paid when you leave Gulf employment (contract end or resignation).</p>' +
      '</div>';
  }

  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">📄 NOC</h4>' +
    '<div class="row"><span>Status</span><b>' +
    (noc.status === 'granted' ? '<span class="good">Granted</span>' :
      noc.status === 'refused' ? '<span class="bad">Refused</span>' :
        noc.status === 'requested' ? 'Requested' : 'Not requested') + '</b></div>';
  if (noc.status !== 'granted') {
    html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.75rem" onclick="gulfRequestNOC()">📄 Request NOC</button>';
    if (noc.status === 'refused') html += '<button class="opt" style="margin-top:4px;width:100%;text-align:center;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="gulfBribeForNOC()">💰 Offer bribe</button>';
  } else {
    html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;font-size:.75rem" onclick="gulfTryChangeJob()">🔄 Transfer</button>';
  }
  html += '</div>';

  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🚪 Exit Visa</h4>' +
    '<div class="row"><span>Status</span><b>' + (exit && exit.status === 'valid' ? '<span class="good">Valid</span>' : exit && exit.status === 'denied' ? '<span class="bad">Denied</span>' : exit && exit.status === 'consumed' ? 'Used' : 'None') + '</b></div>';
  if (!exit || exit.status !== 'valid') {
    html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.75rem" onclick="gulfRequestExitVisa()">🚪 Request exit visa</button>';
  } else {
    const vacationDays = S.vacationDays || 21;
    const usedDays = S.vacationDaysUsedThisYear || 0;
    const daysLeft = vacationDays - usedDays;
    html += '<div class="muted small" style="margin-top:6px">Vacation days remaining: ' + daysLeft + '</div>';
    if (daysLeft >= 7) html += '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:#fbbf2420;border-color:#fbbf24" onclick="gulfVisitHomePrompt()">✈️ Visit home (uses vacation days)</button>';
  }
  html += '</div>';

  if (g.wageArrears > 0) {
    html += '<div class="card" style="border-color:#fb7185"><h4 style="color:#fb7185">💸 Wage Arrears</h4>' +
      '<div class="row"><span>Total owed</span><b class="bad mono">' + money(g.wageArrears) + '</b></div>' +
      '<div class="row"><span>Months behind</span><b>' + Math.round(g.arrearsMonths / 12) + '</b></div></div>';
  }

  if (g.passportHeld) {
    html += '<div class="card" style="border-color:#fb7185"><h4 style="color:#fb7185">🛂 Passport</h4><p class="muted small">Your employer holds your passport.</p></div>';
  }

  if (!g.absconded && S.immigration && S.immigration.status !== 'undocumented') {
    html += '<div class="card" style="border-color:#fb7185;background:#fb718510"><h4 style="color:#fb7185">🚨 Emergency Exit</h4>' +
      '<p class="muted small">Leave your job without NOC. You will be reported.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="gulfAbscond()">Abscond</button></div>';
  }

  return html;
};
function _gulfRenderApplyUI() {
  const eligibleCountries = GULF_COUNTRIES.filter(function(c) { return COUNTRIES[c]; });
  const career = _gulfCareerInfo();

  let html = '<div class="card" style="border-color:#22d3ee">' +
    '<h3 style="color:#22d3ee">🌍 Gulf Work Migration</h3>' +
    '<p class="muted small">Real Gulf jobs, sponsorship (kafala), and the drama that comes with it.</p>' +
    '<div class="row"><span>Your current career</span><b>' + career.title + '</b></div>' +
    '<div class="row"><span>Industry</span><b>' + career.industry.toUpperCase() + '</b></div>' +
    '<div class="row"><span>Passport bracket</span><b>' + _gulfOriginCountry().toUpperCase() + ' (×' + _gulfNationalityMult().toFixed(2) + ')</b></div>' +
    '</div>';

  html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">1. Choose Destination</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">';
  eligibleCountries.forEach(function(c) {
    html += '<button class="pill ' + (S._gulfPickCountry === c ? 'on' : '') + '" style="padding:10px;font-size:.78rem" onclick="S._gulfPickCountry=\'' + c + '\';render()">' + COUNTRIES[c].flag + ' ' + COUNTRIES[c].name + '</button>';
  });
  html += '</div>';
  if (S._gulfPickCountry) {
    const est = _gulfSalaryBreakdown('direct_apply', S._gulfPickCountry);
    const estMonthly = Math.round(est.basicAnnualLocal / 12);
    const currency = COUNTRIES[S._gulfPickCountry].currency;
    html += '<div class="muted small" style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px">' +
      '<b>Estimated basic salary</b>: ' + estMonthly.toLocaleString() + ' ' + currency + '/month<br>' +
      '<span class="muted">Based on your career, level, and ' + _gulfOriginCountry().toUpperCase() + ' passport.</span>' +
      '</div>';
  }
  html += '</div>';

  if (!S._gulfPickCountry) return html;

  html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">2. How to Find a Job</h4>';
  GULF_JOB_SOURCES.forEach(function(src) {
    const blocked = (src.requiresFriend && (!S.friends || !S.friends.length)) ||
                    (src.requiresRelative && !(S.family || []).some(function(m) { return m.alive !== false && m.isSibling; })) ||
                    (src.requiresJob && !(S.career && S.career.job));
    let reason = '';
    if (src.requiresFriend && (!S.friends || !S.friends.length)) reason = 'Needs at least 1 friend';
    if (src.requiresRelative && !(S.family || []).some(function(m) { return m.alive !== false && m.isSibling; })) reason = 'Needs sibling/relative';
    if (src.requiresJob && !(S.career && S.career.job)) reason = 'Needs current job';
    const commission = src.commissionCost > 0 ? _gulfLocal(src.commissionCost) : 0;
    const srcMult = GULF_SOURCE_SALARY_MULT[src.id] || 1.0;

    html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a;' + (blocked ? 'opacity:.5' : '') + '">' +
      '<div style="font-weight:700">' + src.label + '</div>' +
      '<div class="muted small">' + src.desc + '</div>' +
      '<div class="muted small">Success: ' + Math.round(src.successChance * 100) + '% · Salary ×' + srcMult.toFixed(2) +
      (commission > 0 ? ' · Commission: ' + money(commission) : '') +
      (src.scamRisk ? ' · ⚠️ Scam ' + Math.round(src.scamRisk * 100) + '%' : '') + '</div>' +
      (blocked ? '<div class="bad small">' + reason + '</div>' :
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:#22d3ee20;border-color:#22d3ee" onclick="gulfStartApplication(\'' + src.id + '\',\'' + S._gulfPickCountry + '\')">Apply via ' + src.label + '</button>') +
      '</div>';
  });
  html += '</div>';

  if (S.gulfWork && S.gulfWork.history.length) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">History</h4>';
    S.gulfWork.history.slice(-5).reverse().forEach(function(h) {
      html += '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + h.year + ' · ' + h.event + '</span></div>';
    });
    html += '</div>';
  }

  return html;
}

window.gulfVisitHomePrompt = function() {
  const vacationDays = S.vacationDays || 21;
  const usedDays = S.vacationDaysUsedThisYear || 0;
  const daysLeft = vacationDays - usedDays;
  const days = parseInt(prompt('How many days will you visit home?\n\nVacation days available: ' + daysLeft + '\nTypical: 7-14 days', '7'), 10);
  if (!days || days < 1) return;
  gulfVisitHome(days);
};

console.log('[World Life] 34-gulf-sponsorship.js loaded');
