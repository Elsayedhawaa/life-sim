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

/* ---------- SPONSOR SELECTION ---------- */
function _gulfPickSponsor(source) {
  const bias = source.sponsorBias || ['fair'];
  const type = bias[Math.floor(Math.random() * bias.length)];
  const typeDef = GULF_SPONSOR_TYPES[type] || GULF_SPONSOR_TYPES.fair;

  /* Real company name from existing car companies if available, else generic */
  const gulfCountry = S.gulfWork.pendingCountry || 'sau';
  let companyName = 'Gulf Employer ' + Math.floor(Math.random() * 900 + 100);
  const pools = (typeof CAR_COMPANIES !== 'undefined' && CAR_COMPANIES[gulfCountry]) ? CAR_COMPANIES[gulfCountry] : null;
  if (pools) {
    const industries = Object.keys(pools);
    const industry = industries[Math.floor(Math.random() * industries.length)];
    const list = pools[industry];
    if (list && list.length) {
      const c = list[Math.floor(Math.random() * list.length)];
      companyName = c.name;
    }
  }

  return {
    type: type,
    label: typeDef.label,
    company: companyName,
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

  if (source.requiresFriend && (!S.friends || !S.friends.length)) {
    log('❌ You need at least one friend to refer you.'); render(); return;
  }
  if (source.requiresRelative) {
    const rels = (S.family || []).filter(function(m) { return m.alive !== false && (m.isSibling || m.role === 'Brother' || m.role === 'Sister'); });
    if (!rels.length) { log('❌ No sibling/relative to refer you.'); render(); return; }
  }
  if (source.requiresJob && !(S.career && S.career.job)) {
    log('❌ You need a current job for internal transfer.'); render(); return;
  }

  /* Agency commission upfront */
  if (source.commissionCost > 0) {
    const costLocal = _gulfLocal(source.commissionCost);
    if (S.wealth < costLocal) { log('❌ Agency commission is ' + money(costLocal) + '. You cannot afford it.'); render(); return; }
    if (!confirm('Pay agency commission upfront?\n\nCost: ' + money(costLocal) + '\n\nAgencies are risky — sometimes no real job.')) return;
    S.wealth -= costLocal;
  }

  /* Determine success */
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

  /* Build offer */
  S.gulfWork.pendingCountry = countryId;
  const sponsor = _gulfPickSponsor(source);

  /* Base salary — use Gulf company pay multiplier if available */
  let baseEGP = 180000; /* fallback */
  if (source.requiresJob && S.career && S.career.job) baseEGP = S.career.job.baseSalaryEGP || 180000;
  const salaryLocal = Math.round(baseEGP / 52.7 * (COUNTRIES[countryId].rate || 1) * source.salaryMult * 1.4);

  /* Iqama profession */
  const professions = ['engineer', 'accountant', 'technician', 'sales associate', 'manager', 'teacher', 'nurse', 'driver', 'cleaner', 'clerk'];
  const profession = professions[Math.floor(Math.random() * professions.length)];

  S.gulfWork.offer = {
    country: countryId,
    source: sourceId,
    sourceLabel: source.label,
    sponsor: sponsor,
    salaryLocal: salaryLocal,
    profession: profession,
    expiresAbsMonth: _gulfAbsMonth() + 3,
    iqamaYears: GULF_IQAMA_RULES[countryId] ? GULF_IQAMA_RULES[countryId].renewalYears : 2,
    housingIncluded: Math.random() < 0.60,
    flightsIncluded: Math.random() < 0.50,
    contractYears: 2 + Math.floor(Math.random() * 2)
  };

  log('📨 Job offer received! ' + sponsor.company + ' (' + sponsor.label + ') · ' + money(salaryLocal) + '/year.');
  log('📅 Offer expires ' + _gulfAbsToLabel(S.gulfWork.offer.expiresAbsMonth) + '.');
  render();
};

/* ---------- ACCEPT OFFER → RELOCATE ---------- */
window.gulfAcceptOffer = function() {
  ensureGulfWorkState();
  const offer = S.gulfWork.offer;
  if (!offer) { log('❌ No offer to accept.'); render(); return; }

  if (_gulfAbsMonth() > offer.expiresAbsMonth) {
    log('❌ Offer expired.');
    S.gulfWork.offer = null;
    render(); return;
  }

  if (!confirm('Accept the offer at ' + offer.sponsor.company + '?\n\n• Relocate to ' + COUNTRIES[offer.country].name + '\n• Salary: ' + money(offer.salaryLocal) + '/year\n• Sponsor: ' + offer.sponsor.label + '\n• Profession on iqama: ' + offer.profession + '\n\nYou will be bound to this sponsor.')) return;

  const oldCountry = S.country;

  /* Quit current job */
  if (S.career && S.career.job) {
    if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('relocated to Gulf');
    else { S.career.job = null; S.job = null; }
  }

  /* End rental */
  if (S.housing === 'rented') {
    S.housing = 'parents';
    S.rentedHome = null;
  }

  /* Convert wealth */
  _gulfConvertWealth(oldCountry, offer.country);
  S.country = offer.country;
  if (!S.homeCountry) S.homeCountry = oldCountry;

  /* Set new job */
  S.job = {
    company: offer.sponsor.company,
    title: 'Contract worker (' + offer.profession + ')',
    salary: offer.salaryLocal,
    level: 0,
    years: 0
  };
  if (S.career) {
    S.career.job = {
      company: offer.sponsor.company,
      title: 'Contract worker (' + offer.profession + ')',
      track: 'entry',
      level: 0,
      salary: offer.salaryLocal,
      baseSalaryEGP: 180000,
      payMult: 1,
      performance: 50,
      hiredYear: gameYear(),
      tenure: 0,
      benefits: [],
      stability: offer.sponsor.paysOnTime >= 0.9 ? 0.85 : 0.6,
      prestige: 2,
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

  S.gulfWork.history.push({ year: gameYear(), event: 'Arrived in ' + COUNTRIES[offer.country].name + ' for ' + offer.sponsor.company });

  log('✈️ Arrived in ' + COUNTRIES[offer.country].name + '. New job: ' + offer.sponsor.company + '.');
  log('💼 Salary: ' + money(offer.salaryLocal) + '/year · Profession on iqama: ' + offer.profession + '.');
  log('🪪 Iqama issued. Expires ' + _gulfAbsToLabel(iqamaExpiryAbs) + '.');

  emitSignal('gulfWorkArrived', { country: offer.country, company: offer.sponsor.company });
  render();
};

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

  if (g.noc.status !== 'granted') {
    log('❌ You need a granted NOC to change jobs legally.');
    render(); return;
  }
  if (g.noc.requestedAbsMonth && _gulfAbsMonth() - g.noc.requestedAbsMonth < 12 && g.noc.status !== 'granted') {
    log('❌ NOC granted but not yet valid — wait for next year.'); render(); return;
  }

  /* Find a competitor offer */
  const country = S.country;
  const pools = (typeof CAR_COMPANIES !== 'undefined' && CAR_COMPANIES[country]) ? CAR_COMPANIES[country] : null;
  if (!pools) { log('❌ No job market here.'); render(); return; }

  const industries = Object.keys(pools);
  const industry = industries[Math.floor(Math.random() * industries.length)];
  const list = pools[industry];
  if (!list || !list.length) { log('❌ No job market here.'); render(); return; }
  const newCompany = list[Math.floor(Math.random() * list.length)];

  const currentSalary = (S.career && S.career.job ? S.career.job.salary : 0) || (S.job ? S.job.salary : 0);
  const bumpPct = 0.10 + Math.random() * 0.30;
  const newSalary = Math.round(currentSalary * (1 + bumpPct));

  if (!confirm('Transfer to ' + newCompany.name + '?\n\nNew salary: ' + money(newSalary) + '/year (+' + Math.round(bumpPct * 100) + '%)\n\nSponsorship transfers to the new employer.')) return;

  /* Update sponsor & company */
  const newSponsor = _gulfPickSponsor({ sponsorBias: ['fair', 'strict', 'generous'] });
  newSponsor.company = newCompany.name;
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

  /* NOC consumed */
  g.noc = { status: 'not_requested', requestedAbsMonth: null };
  /* New iqama */
  const rules = GULF_IQAMA_RULES[S.country] || { renewalYears: 2 };
  g.iqama.expiresAbsMonth = _gulfAbsMonth() + rules.renewalYears * 12;
  g.iqama.sponsorCompany = newCompany.name;
  g.numJobsInGulf = (g.numJobsInGulf || 0) + 1;

  log('🔄 Transferred to ' + newCompany.name + '. New salary: ' + money(newSalary) + '/year.');
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
  if (!_gulfIsInGulf() && !g.offer) {
    return _gulfRenderApplyUI();
  }

  /* Offer pending */
  if (g.offer) {
    const offer = g.offer;
    return '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">📨 Job Offer Pending</h3>' +
      '<div class="row"><span>Country</span><b>' + COUNTRIES[offer.country].flag + ' ' + COUNTRIES[offer.country].name + '</b></div>' +
      '<div class="row"><span>Company</span><b>' + offer.sponsor.company + '</b></div>' +
      '<div class="row"><span>Sponsor type</span><b>' + offer.sponsor.label + '</b></div>' +
      '<div class="muted small" style="margin-top:2px">' + offer.sponsor.desc + '</div>' +
      '<div class="row"><span>Salary</span><b class="mono">' + money(offer.salaryLocal) + '/year</b></div>' +
      '<div class="row"><span>Iqama profession</span><b>' + offer.profession + '</b></div>' +
      '<div class="row"><span>Contract length</span><b>' + offer.contractYears + ' years</b></div>' +
      '<div class="row"><span>Housing</span><b>' + (offer.housingIncluded ? 'Included' : 'Not included') + '</b></div>' +
      '<div class="row"><span>Flights</span><b>' + (offer.flightsIncluded ? 'Paid by employer' : 'You pay') + '</b></div>' +
      '<div class="row"><span>Offer expires</span><b class="' + (_gulfAbsMonth() > offer.expiresAbsMonth ? 'bad' : '') + '">' + _gulfAbsToLabel(offer.expiresAbsMonth) + '</b></div>' +
      '<button class="opt" style="margin-top:10px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700" onclick="gulfAcceptOffer()">✅ Accept & Relocate</button>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;border-color:#fb7185;color:#fb7185" onclick="gulfDeclineOffer()">✕ Decline</button>' +
      '</div>';
  }

  /* In Gulf — sponsorship dashboard */
  const sponsor = g.sponsor;
  const sponsorColor = sponsor.type === 'exploitative' ? '#fb7185' : sponsor.type === 'generous' || sponsor.type === 'fair' ? '#34d399' : '#fbbf24';
  const iqama = g.iqama;
  const iqamaMonthsLeft = iqama ? Math.max(0, iqama.expiresAbsMonth - _gulfAbsMonth()) : 0;
  const noc = g.noc;
  const exit = g.exitVisa;

  let html = '';

  /* Status banner */
  if (g.absconded) {
    html += '<div class="card" style="border-color:#fb7185;background:#fb718515"><h3 style="color:#fb7185">🚨 Absconded</h3>' +
      '<p class="muted small">Your sponsor filed an absconding report. You are undocumented in ' + C().name + '. Check the Immigration tab for options.</p></div>';
  } else if (S.immigration && S.immigration.status === 'undocumented') {
    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">🚨 Undocumented</h3>' +
      '<p class="muted small">You are no longer legally employed. See Career → Underground section.</p></div>';
  } else {
    html += '<div class="card" style="border-color:' + sponsorColor + '">' +
      '<h3 style="color:' + sponsorColor + '">🏢 Your Sponsor</h3>' +
      '<div class="row"><span>Company</span><b>' + sponsor.company + '</b></div>' +
      '<div class="row"><span>Type</span><b>' + sponsor.label + '</b></div>' +
      '<div class="muted small" style="margin-top:2px">' + sponsor.desc + '</div>' +
      '<div class="row"><span>Control level</span><b>' + Math.round(sponsor.control * 100) + '%</b></div>' +
      '</div>';
  }

  /* Iqama */
  if (iqama) {
    const iqamaColor = iqamaMonthsLeft < 3 ? '#fb7185' : iqamaMonthsLeft < 6 ? '#fbbf24' : '#34d399';
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🪪 Iqama (Residence Permit)</h4>' +
      '<div class="row"><span>Number</span><b class="mono">' + iqama.number + '</b></div>' +
      '<div class="row"><span>Profession</span><b>' + iqama.profession + '</b></div>' +
      '<div class="row"><span>Sponsor</span><b>' + iqama.sponsorCompany + '</b></div>' +
      '<div class="row"><span>Expires</span><b style="color:' + iqamaColor + '">' + _gulfAbsToLabel(iqama.expiresAbsMonth) + ' (' + iqamaMonthsLeft + ' mo)</b></div>' +
      '</div>';
  }

  /* NOC */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">📄 NOC (No-Objection Certificate)</h4>' +
    '<div class="row"><span>Status</span><b>' +
    (noc.status === 'granted' ? '<span class="good">Granted</span>' :
      noc.status === 'refused' ? '<span class="bad">Refused</span>' :
        noc.status === 'requested' ? 'Requested' : 'Not requested') + '</b></div>' +
    '<p class="muted small">Required to change employers. Your sponsor can refuse — and often does.</p>';

  if (noc.status !== 'granted') {
    html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.75rem" onclick="gulfRequestNOC()">📄 Request NOC from sponsor</button>';
    if (noc.status === 'refused') {
      html += '<button class="opt" style="margin-top:4px;width:100%;text-align:center;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="gulfBribeForNOC()">💰 Offer bribe for NOC</button>';
    }
  } else {
    html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;font-size:.75rem" onclick="gulfTryChangeJob()">🔄 Transfer to another sponsor</button>';
  }
  html += '</div>';

  /* Exit visa */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🚪 Exit Visa</h4>' +
    '<div class="row"><span>Status</span><b>' + (exit && exit.status === 'valid' ? '<span class="good">Valid</span>' : exit && exit.status === 'denied' ? '<span class="bad">Denied</span>' : exit && exit.status === 'consumed' ? 'Used' : 'None') + '</b></div>' +
    '<p class="muted small">Required to leave the country (even to visit home).</p>';

  if (!exit || exit.status !== 'valid') {
    html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.75rem" onclick="gulfRequestExitVisa()">🚪 Request exit visa</button>';
  } else {
    const vacationDays = S.vacationDays || 21;
    const usedDays = S.vacationDaysUsedThisYear || 0;
    const daysLeft = vacationDays - usedDays;
    html += '<div class="muted small" style="margin-top:6px">Vacation days remaining: ' + daysLeft + '</div>';
    if (daysLeft >= 7) {
      html += '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:#fbbf2420;border-color:#fbbf24" onclick="gulfVisitHomePrompt()">✈️ Visit home (uses vacation days)</button>';
    }
  }
  html += '</div>';

  /* Wage arrears */
  if (g.wageArrears > 0) {
    html += '<div class="card" style="border-color:#fb7185"><h4 style="color:#fb7185">💸 Wage Arrears</h4>' +
      '<div class="row"><span>Total owed</span><b class="bad mono">' + money(g.wageArrears) + '</b></div>' +
      '<div class="row"><span>Months behind</span><b>' + Math.round(g.arrearsMonths / 12) + '</b></div>' +
      '<p class="muted small">Complain to your employer or escalate to the labor office.</p>' +
      '</div>';
  }

  /* Passport status */
  if (g.passportHeld) {
    html += '<div class="card" style="border-color:#fb7185"><h4 style="color:#fb7185">🛂 Passport</h4>' +
      '<p class="muted small">Your employer holds your passport. This is illegal but common.</p></div>';
  }

  /* Abscond option */
  if (!g.absconded && S.immigration && S.immigration.status !== 'undocumented') {
    html += '<div class="card" style="border-color:#fb7185;background:#fb718510"><h4 style="color:#fb7185">🚨 Emergency Exit</h4>' +
      '<p class="muted small">Leave your job without NOC. You will be reported.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="gulfAbscond()">Abscond (no return)</button>' +
      '</div>';
  }

  return html;
};

function _gulfRenderApplyUI() {
  const eligibleCountries = GULF_COUNTRIES.filter(function(c) { return COUNTRIES[c]; });
  let html = '<div class="card" style="border-color:#22d3ee">' +
    '<h3 style="color:#22d3ee">🌍 Gulf Work Migration</h3>' +
    '<p class="muted small">Real Gulf jobs, sponsorship (kafala), and the drama that comes with it.</p>' +
    '</div>';

  html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">1. Choose Destination</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">';
  eligibleCountries.forEach(function(c) {
    html += '<button class="pill" style="padding:10px;font-size:.78rem" onclick="S._gulfPickCountry=\'' + c + '\';render()">' + COUNTRIES[c].flag + ' ' + COUNTRIES[c].name + '</button>';
  });
  html += '</div>';
  html += '<div class="muted small" style="margin-top:6px">Selected: ' + (S._gulfPickCountry ? COUNTRIES[S._gulfPickCountry].name : 'none') + '</div>';
  html += '</div>';

  if (!S._gulfPickCountry) return html;

  html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">2. Choose How to Find a Job</h4>';
  GULF_JOB_SOURCES.forEach(function(src) {
    const blocked = (src.requiresFriend && (!S.friends || !S.friends.length)) ||
                    (src.requiresRelative && !(S.family || []).some(function(m) { return m.alive !== false && m.isSibling; })) ||
                    (src.requiresJob && !(S.career && S.career.job));
    let reason = '';
    if (src.requiresFriend && (!S.friends || !S.friends.length)) reason = 'Needs at least 1 friend';
    if (src.requiresRelative && !(S.family || []).some(function(m) { return m.alive !== false && m.isSibling; })) reason = 'Needs sibling/relative';
    if (src.requiresJob && !(S.career && S.career.job)) reason = 'Needs current job';
    const commission = src.commissionCost > 0 ? _gulfLocal(src.commissionCost) : 0;

    html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a;' + (blocked ? 'opacity:.5' : '') + '">' +
      '<div style="font-weight:700">' + src.label + '</div>' +
      '<div class="muted small">' + src.desc + '</div>' +
      '<div class="muted small">Success chance: ' + Math.round(src.successChance * 100) + '%' +
      (commission > 0 ? ' · Commission: ' + money(commission) : '') +
      (src.scamRisk ? ' · ⚠️ Scam risk ' + Math.round(src.scamRisk * 100) + '%' : '') + '</div>' +
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
