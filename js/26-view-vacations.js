/* ============================================================
   VIEW: VACATIONS — full planning & booking system  (v2)
   ============================================================
   v2 fixes:
   - Visa/departure scheduling uses absolute months (not years)
   - Spending display shows "× N days" formula
   - Friends can be invited; spouse/children/friends rolled for willingness
   - Payment split (you pay all / split evenly)
   - Trips scheduled based on notice; fire on arrival
   - Departures tab shows upcoming trips
   ============================================================ */

/* ---------- STATE ---------- */
function ensureVacationState() {
  if (!S) return;
  if (!S.vacation) {
    S.vacation = {
      tab: 'destinations',
      planning: null,
      planned: null,
      visaApps: [],
      history: [],
      activeTrip: null,
      pendingDepartures: []
    };
  }
  const v = S.vacation;
  if (!Array.isArray(v.visaApps)) v.visaApps = [];
  if (!Array.isArray(v.history)) v.history = [];
  if (!Array.isArray(v.pendingDepartures)) v.pendingDepartures = [];
  if (!v.tab) v.tab = 'destinations';
  if (typeof S.vacationDays === 'undefined') S.vacationDays = 21;
  if (typeof S.vacationDaysUsedThisYear === 'undefined') S.vacationDaysUsedThisYear = 0;
}
GameHooks.on('newGame', ensureVacationState);
GameHooks.on('migrate', ensureVacationState);

function vacSetTab(tab) { S.vacation.tab = tab; render(); }
window.vacSetTab = vacSetTab;

/* ---------- CURRENCY / DATE HELPERS ---------- */
function vacUSD(usd) { return Math.round(usd * (C().rate || 1)); }
function vacEGP(egp) { return Math.round(egp * ((C().rate || 1) / 52.7)); } // Keeping this as a generic local currency converter if needed

/* Absolute month = months since Jan 2001 */
function _vacAbsMonth() {
  return (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
}
function _vacAbsToYear(absMonth) {
  return 2001 + Math.floor((absMonth - 1) / 12);
}
function _vacAbsToDate(absMonth) {
  const y = _vacAbsToYear(absMonth);
  const m = ((absMonth - 1) % 12) + 1;
  return isMonthly() ? monthName(m) + ' ' + y : 'Year ' + y;
}
function _vacCurrentAbsLabel() {
  return isMonthly() ? monthName(currentMonth()) + ' ' + gameYear() : 'Year ' + gameYear();
}

/* ---------- PASSPORT ---------- */
function vacPassportTier() {
  const pd = (typeof immPassportData === 'function') ? immPassportData() : null;
  if (!pd) return 'mid'; // Default to mid if immigration logic is missing
  const score = pd.strengthScore || 80;
  if (score >= 170) return 'strong';
  if (score >= 80) return 'mid';
  return 'weak';
}

function vacNeedsVisa(destId) {
  const req = VAC_VISA_REQUIREMENTS[destId];
  if (!req) return { needed: false, type: 'none' };
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === destId; });
  if (dest && dest.country === S.country) return { needed: false, type: 'domestic' };
  const tier = vacPassportTier();
  const needed = !!req[tier];
  return { needed: needed, type: req.visa };
}

/* ---------- FAMILY ABROAD ---------- */
function vacHasFamilyAbroad(destId) {
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === destId; });
  if (!dest) return { available: false, members: [] };
  const fam = (S.family || []).filter(function(m) {
    return m.alive !== false && !m.estranged && m.country === dest.country;
  });
  return { available: fam.length > 0, members: fam };
}

/* ---------- FLIGHT ---------- */
function vacBaseFlightUSD(destId) {
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === destId; });
  if (!dest) return 0;
  const originRegion = VAC_COUNTRY_REGION[S.country] || 'mena'; // Default to MENA origin if unknown
  const destRegion = dest.region;
  const factor = (VAC_REGION_FACTOR[originRegion] && VAC_REGION_FACTOR[originRegion][destRegion]) || 1.5;
  return Math.round(dest.baseFlightUSD * factor);
}

/* ---------- COST CALCULATION ---------- */
/* Second arg lets you override plan.travelers with ACTUAL coming travelers */
function vacCalculateCosts(plan, actualTravelers) {
  if (!plan || !plan.destinationId) return null;
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === plan.destinationId; });
  if (!dest) return null;
  const days = plan.duration || 7;
  const classDef = VAC_AIRFARE_CLASSES.find(function(c) { return c.id === plan.airfareClass; }) || VAC_AIRFARE_CLASSES[0];
  const hotel = VAC_HOTEL_TIERS.find(function(h) { return h.id === plan.accommodation; }) || VAC_HOTEL_TIERS[3];
  const spending = VAC_SPENDING_OPTIONS.find(function(s) { return s.id === plan.spending; }) || VAC_SPENDING_OPTIONS[1];
  const t = actualTravelers || plan.travelers || { spouse: false, children: [], friends: [] };

  const baseFlightUSD = vacBaseFlightUSD(plan.destinationId);

  const spouseIncluded = !!t.spouse;
  const childIds = Array.isArray(t.children) ? t.children.slice() : [];
  const friendIds = Array.isArray(t.friends) ? t.friends.slice() : [];

  /* Airfare */
  let airfareUSD = baseFlightUSD * classDef.mult;
  if (spouseIncluded) airfareUSD += baseFlightUSD * classDef.mult;
  friendIds.forEach(function() { airfareUSD += baseFlightUSD * classDef.mult; });
  childIds.forEach(function(cid) {
    const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (child) airfareUSD += baseFlightUSD * classDef.mult * vacChildAirfareMult(child.age);
  });

  /* Hotel */
  let hotelUSD = (hotel.perNightUSD || 0) * days;
  childIds.forEach(function(cid) {
    const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (child) hotelUSD += (hotel.perNightUSD || 0) * days * vacChildHotelAddPct(child.age) * 0.5; // Shared room logic
  });
  /* Friends share rooms — assume 0.5x each for simplicity in budget, though some might want their own room */
  friendIds.forEach(function() {
    hotelUSD += (hotel.perNightUSD || 0) * days * 0.5; 
  });

  /* Activities */
  let activitiesUSD = 0;
  const actList = VAC_ACTIVITIES[dest.country] || VAC_ACTIVITIES.egy; // Fallback to Egypt if empty
  (plan.activities || []).forEach(function(aid) {
    const act = actList.find(function(a) { return a.id === aid; });
    if (!act) return;
    activitiesUSD += act.costUSD;
    if (spouseIncluded) activitiesUSD += act.costUSD;
    friendIds.forEach(function() { activitiesUSD += act.costUSD; });
    childIds.forEach(function(cid) {
      const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
      if (child) activitiesUSD += act.costUSD * vacChildActivityPct(child.age);
    });
  });

  /* Spending */
  let totalAdults = 1 + (spouseIncluded ? 1 : 0) + friendIds.length;
  let childWeight = 0;
  childIds.forEach(function(cid) {
    const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (child) childWeight += (child.age <= 5 ? 0.3 : child.age <= 12 ? 0.6 : 1.0);
  });
  const spendingUSD = spending.usdPerDay * days * (totalAdults + childWeight);

  /* Insurance */
  const travelInsuranceUSD = plan.travelInsurance
    ? (50 + (dest.tier === 'luxury' ? 200 : dest.tier === 'premium' ? 100 : 50)) * (totalAdults + childIds.length * 0.5)
    : 0;

  /* Misc */
  const miscUSD = 80 + (dest.tier === 'luxury' ? 150 : 0);

  /* Visa */
  const visa = vacNeedsVisa(plan.destinationId);
  const perVisaFee = visa.needed ? (VAC_VISA_FEES_USD[visa.type] || 100) : 0;
  const totalVisaFee = perVisaFee * (totalAdults + childIds.length); // Assuming everyone needs one, simplistic

  const totalUSD = airfareUSD + hotelUSD + activitiesUSD + spendingUSD + travelInsuranceUSD + miscUSD + totalVisaFee;
  const totalTravelers = totalAdults + childIds.length;

  return {
    baseFlightUSD: baseFlightUSD,
    airfareUSD: Math.round(airfareUSD),
    hotelUSD: Math.round(hotelUSD),
    activitiesUSD: Math.round(activitiesUSD),
    spendingUSD: Math.round(spendingUSD),
    travelInsuranceUSD: Math.round(travelInsuranceUSD),
    miscUSD: miscUSD,
    visaFeeUSD: totalVisaFee,
    totalUSD: Math.round(totalUSD),
    totalLocal: vacUSD(totalUSD),
    days: days,
    travelers: { adults: totalAdults, children: childIds.length, friends: friendIds.length },
    totalTravelers: totalTravelers,
    dest: dest,
    hotelDef: hotel,
    classDef: classDef,
    spendingDef: spending
  };
}
window.vacCalculateCosts = vacCalculateCosts;

/* ---------- COMPANION WILLINGNESS ROLL ---------- */
function _vacRollCompanions(plan) {
  const companions = [];

  if (plan.travelers.spouse && S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    const p = S.marriage.partner;
    const bond = p.bond || 70;
    const willing = Math.random() < (0.5 + bond / 200); /* 50-100% chance based on bond */
    const hasIncome = (p.income || 0) > 0;
    const willPay = willing && hasIncome && Math.random() < 0.6;
    companions.push({
      type: 'spouse', id: p.id || p.name, name: p.name,
      willing: willing, willPay: willPay,
      reason: !willing ? 'Declined — not feeling up for it' :
        (willPay ? 'Happy to join and pay share' :
          (hasIncome ? 'Happy to join, prefers you pay' : 'Happy to join (no income)'))
    });
  }

  (plan.travelers.children || []).forEach(function(cid) {
    const c = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (!c) return;
    companions.push({
      type: 'child', id: cid, name: c.name, age: c.age,
      willing: true, willPay: false, // Kids don't pay
      reason: 'Coming with you (your child)'
    });
  });

  (plan.travelers.friends || []).forEach(function(fid) {
    const f = (S.friends || []).find(function(x) { return x.id === fid; });
    if (!f) return;
    const bond = f.bond || 50;
    const willing = Math.random() < (0.25 + bond / 150);
    const willPay = willing && Math.random() < (f.trait === 'generous' ? 0.6 : 0.3);
    companions.push({
      type: 'friend', id: fid, name: f.name,
      willing: willing, willPay: willPay,
      reason: !willing ? 'Can\'t make it' :
        (willPay ? 'Excited and happy to pay their share' : 'Would love to come but can\'t pay share')
    });
  });

  return companions;
}

/* ============================================================
   PLANNING ACTIONS
   ============================================================ */
window.vacStartPlanning = function(destId) {
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === destId; });
  if (!dest) return;

  S.vacation.planning = {
    destinationId: destId,
    duration: dest.days_typical,
    airfareClass: 'economy',
    accommodation: dest.tier === 'luxury' ? 'hotel5' : dest.tier === 'premium' ? 'hotel4' : 'hotel3',
    travelers: { spouse: false, children: [], friends: [] },
    activities: [],
    spending: 'normal',
    tripStyle: 'relaxing',
    notice: '1month',
    paymentSplit: 'you_pay_all',
    travelInsurance: false
  };
  S.vacation.tab = 'plan';
  render();
};

window.vacCancelPlanning = function() {
  S.vacation.planning = null;
  S.vacation.tab = 'destinations';
  render();
};

window.vacPlanSet = function(field, value) {
  if (!S.vacation.planning) return;
  const p = S.vacation.planning;
  if (field === 'activity') {
    const idx = p.activities.indexOf(value);
    if (idx >= 0) p.activities.splice(idx, 1);
    else p.activities.push(value);
  } else if (field === 'child') {
    if (!Array.isArray(p.travelers.children)) p.travelers.children = [];
    const idx = p.travelers.children.indexOf(value);
    if (idx >= 0) p.travelers.children.splice(idx, 1);
    else p.travelers.children.push(value);
  } else if (field === 'friend') {
    if (!Array.isArray(p.travelers.friends)) p.travelers.friends = [];
    const idx = p.travelers.friends.indexOf(value);
    if (idx >= 0) p.travelers.friends.splice(idx, 1);
    else p.travelers.friends.push(value);
  } else if (field === 'spouse') {
    p.travelers.spouse = !p.travelers.spouse;
  } else if (field === 'travelInsurance') {
    p.travelInsurance = !p.travelInsurance;
  } else {
    p[field] = value;
  }
  render();
};

window.vacPlanSetDuration = function(days) {
  if (!S.vacation.planning) return;
  S.vacation.planning.duration = Math.max(2, Math.min(30, days));
  render();
};

/* ============================================================
   MANAGER APPROVAL
   ============================================================ */
function vacManagerApprovalChance(plan) {
  if (!S.career || !S.career.job) return { chance: 1, reason: 'self-employed', managerName: 'You', managerStyle: 'Self-employed', managerDesc: 'No manager to ask.' };
  const job = S.career.job;
  let chance = 0.65;
  if (job.performance >= 80) chance += 0.15;
  else if (job.performance < 50) chance -= 0.25;
  const bossBond = job.boss ? job.boss.bond : 50;
  if (bossBond >= 70) chance += 0.10;
  else if (bossBond < 40) chance -= 0.15;
  if (plan.duration > 14) chance -= 0.15;
  if (plan.duration > 21) chance -= 0.15;
  
  const notice = VAC_NOTICE_OPTIONS.find(function(n) { return n.id === plan.notice; });
  if (notice) chance += notice.approvalMod;
  
  let bossStyle = VAC_MANAGER_STYLES.neutral;
  if (job.boss && job.boss.trait && VAC_MANAGER_STYLES[job.boss.trait]) {
    bossStyle = VAC_MANAGER_STYLES[job.boss.trait];
  } else {
    // Generate deterministic pseudo-random style if none assigned
    const hash = (job.boss ? job.boss.name : 'unknown').split('').reduce(function(s, c) { return s + c.charCodeAt(0); }, 0);
    const styleKeys = Object.keys(VAC_MANAGER_STYLES);
    bossStyle = VAC_MANAGER_STYLES[styleKeys[hash % styleKeys.length]];
  }
  chance += bossStyle.approvalMod;
  
  const tenure = job.tenure || 0;
  if (tenure >= 3) chance += 0.05;
  if (tenure < 1) chance -= 0.20;
  
  return {
    chance: Math.max(0.05, Math.min(0.95, chance)),
    managerName: job.boss ? job.boss.name : 'Manager',
    managerStyle: bossStyle.label,
    managerDesc: bossStyle.desc
  };
}
window.vacManagerApprovalChance = vacManagerApprovalChance;

function vacDaysAvailable() {
  if (!S.career || !S.career.job) return 365; // Unlimited if not employed conventionally
  const pending = (S.vacation.pendingDepartures || []).reduce(function(s, t) { return s + t.plan.duration; }, 0);
  return Math.max(0, (S.vacationDays || 21) - (S.vacationDaysUsedThisYear || 0) - pending);
}
window.vacDaysAvailable = vacDaysAvailable;

/* ============================================================
   VISA APPLICATION  (fixed to use absolute months)
   ============================================================ */
function vacVisaApprovalChance(plan) {
  const visaInfo = vacNeedsVisa(plan.destinationId);
  if (!visaInfo.needed) return { chance: 1, reason: 'no_visa_required', visaType: 'none', feeUSD: 0, waitMonths: 0 };
  let chance = 0.65;
  const income = (S.job ? S.job.salary : 0) + (S.career && S.career.job ? S.career.job.salary : 0);
  if (income > 200000) chance += 0.15;
  else if (income < 50000) chance -= 0.15;
  
  if (S.wealth > vacUSD(20000)) chance += 0.10;
  if (S.wealth < vacUSD(1000)) chance -= 0.20;
  
  const pastApproved = S.vacation.history.filter(function(h) { return h.visaApproved; }).length;
  if (pastApproved > 0) chance += Math.min(0.20, pastApproved * 0.05);
  
  if (visaInfo.type === 'usa_b1b2') chance -= 0.30;
  else if (visaInfo.type === 'uk_visa' || visaInfo.type === 'canada_visa') chance -= 0.15;
  else if (visaInfo.type === 'australia_visa') chance -= 0.10;
  else if (visaInfo.type === 'schengen') chance -= 0.05;
  else if (visaInfo.type === 'evisa' || visaInfo.type === 'voa') chance += 0.15;
  
  if (plan.duration > 21) chance -= 0.10;
  if (pastApproved >= 3) chance += 0.05;
  
  return {
    chance: Math.max(0.05, Math.min(0.95, chance)),
    visaType: visaInfo.type,
    feeUSD: VAC_VISA_FEES_USD[visaInfo.type] || 100,
    waitMonths: VAC_VISA_WAIT_MONTHS[visaInfo.type] || 2
  };
}
window.vacVisaApprovalChance = vacVisaApprovalChance;

window.vacApplyVisa = function() {
  const plan = S.vacation.planning;
  if (!plan) return;
  const info = vacVisaApprovalChance(plan);
  if (!vacNeedsVisa(plan.destinationId).needed) { log('✅ No visa needed.'); render(); return; }
  
  if (S.vacation.visaApps.some(function(v) { return v.destinationId === plan.destinationId && v.status === 'pending'; })) {
    log('❌ Visa already pending for this destination.'); render(); return;
  }
  
  const feeLocal = vacUSD(info.feeUSD);
  if (S.wealth < feeLocal) { log('❌ Need ' + money(feeLocal) + ' for the visa fee.'); render(); return; }

  const decisionAbsMonth = _vacAbsMonth() + info.waitMonths;
  const decisionLabel = _vacAbsToDate(decisionAbsMonth);

  if (!confirm('Apply for a visa?\n\nFee: ' + money(feeLocal) +
    '\nWait: ' + info.waitMonths + ' month' + (info.waitMonths !== 1 ? 's' : '') +
    '\nDecision expected: ' + decisionLabel +
    '\nApproval chance: ' + Math.round(info.chance * 100) + '%\n\nIf denied, the fee is lost.')) return;

  S.wealth -= feeLocal;
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === plan.destinationId; });
  
  S.vacation.visaApps.push({
    id: 'v_' + Math.random().toString(36).slice(2, 8),
    destinationId: plan.destinationId,
    destinationName: dest ? dest.name : plan.destinationId,
    visaType: info.visaType,
    feeUSD: info.feeUSD,
    appliedYear: gameYear(),
    decisionAbsMonth: decisionAbsMonth,
    decisionYear: _vacAbsToYear(decisionAbsMonth),
    approvalChance: info.chance,
    status: 'pending'
  });
  log('📋 Visa application submitted. Decision expected ' + decisionLabel + '.');
  render();
};

/* ============================================================
   APPROVAL + COMPANION ROLL
   ============================================================ */
window.vacRequestApproval = function() {
  const plan = S.vacation.planning;
  if (!plan) return;
  const costs = vacCalculateCosts(plan);
  if (!costs) return;

  /* Days check */
  if (S.career && S.career.job) {
    const available = vacDaysAvailable();
    if (plan.duration > available) {
      log('❌ Only ' + available + ' vacation days available (including pending trips). Requested ' + plan.duration + '.');
      render(); return;
    }
  }

  /* Visa check */
  const visaInfo = vacNeedsVisa(plan.destinationId);
  if (visaInfo.needed) {
    const approved = S.vacation.visaApps.find(function(v) { return v.destinationId === plan.destinationId && v.status === 'approved'; });
    const pending = S.vacation.visaApps.find(function(v) { return v.destinationId === plan.destinationId && v.status === 'pending'; });
    if (!approved) {
      if (pending) log('⏳ Visa still pending. Decision expected ' + _vacAbsToDate(pending.decisionAbsMonth) + '.');
      else log('❌ Visa required first.');
      render(); return;
    }
  }

  /* Manager approval */
  if (S.career && S.career.job) {
    const approval = vacManagerApprovalChance(plan);
    const approved = Math.random() < approval.chance;
    if (S.career.job.boss) {
      S.career.job.boss.bond = Math.min(100, (S.career.job.boss.bond || 50) + (approved ? 2 : -3));
    }
    if (!approved) {
      log('❌ ' + approval.managerName + ' (' + approval.managerStyle + ') denied your time-off request.');
      fx({ happiness: -6 });
      render(); return;
    }
    log('✅ ' + approval.managerName + ' approved your vacation (' + approval.managerStyle + ').');
  }

  /* Roll companion willingness */
  const companions = _vacRollCompanions(plan);
  const declined = companions.filter(function(c) { return !c.willing; });
  if (declined.length > 0) {
    log('⚠️ Some declined: ' + declined.map(function(c) { return c.name; }).join(', '));
  }

  S.vacation.planned = { plan: plan, costs: costs, companions: companions };
  S.vacation.tab = 'checkout';
  render();
};

/* ============================================================
   BOOKING — schedules or fires based on notice
   ============================================================ */
window.vacBookTrip = function(paymentMethod) {
  const planned = S.vacation.planned;
  if (!planned) return;
  const plan = planned.plan;

  /* Actual willing travelers */
  const willing = planned.companions.filter(function(c) { return c.willing; });
  const actualTravelers = {
    spouse: !!(plan.travelers.spouse && willing.some(function(c) { return c.type === 'spouse'; })),
    children: (plan.travelers.children || []).filter(function(cid) { return willing.some(function(c) { return c.id === cid; }); }),
    friends: (plan.travelers.friends || []).filter(function(fid) { return willing.some(function(c) { return c.id === fid; }); })
  };

  /* Recalculate with actuals */
  const costs = vacCalculateCosts(plan, actualTravelers);
  if (!costs) return;

  /* Payment split */
  const split = plan.paymentSplit || 'you_pay_all';
  let yourShare = costs.totalLocal;
  if (split !== 'you_pay_all' && willing.length > 0) {
    const totalTravelers = 1 + willing.length;
    const perPerson = costs.totalLocal / totalTravelers;
    const notPaying = willing.filter(function(c) { return !c.willPay; }).length;
    yourShare = Math.round(perPerson * (1 + notPaying));
  }

  /* Process payment */
  let paid = false;
  if (paymentMethod === 'cash') {
    if (S.wealth < yourShare) { log('❌ Need ' + money(yourShare) + ' in cash.'); render(); return; }
    S.wealth -= yourShare;
    paid = true;
    log('💵 Paid ' + money(yourShare) + ' (your share).');
  } else if (paymentMethod === 'card') {
    const usable = ((S.bank && S.bank.creditCards) || []).filter(function(c) { return (c.limit || 0) - (c.balance || 0) >= yourShare; });
    if (!usable.length) { log('❌ No card with enough credit.'); render(); return; }
    const card = usable[0];
    card.balance = (card.balance || 0) + yourShare;
    if (card.cashbackRate > 0) S.bank.cashbackBal = (S.bank.cashbackBal || 0) + Math.round(yourShare * card.cashbackRate);
    paid = true;
    log('💳 Charged ' + money(yourShare) + ' to ' + card.name + '.');
  } else if (paymentMethod === 'loan') {
    if (!S.bank) { log('❌ No bank available.'); render(); return; }
    if (!Array.isArray(S.bank.loans)) S.bank.loans = [];
    const years = 2, rate = 0.18;
    const totalOwed = Math.round(yourShare * (1 + rate * years));
    const monthlyPayment = Math.ceil(totalOwed / (years * 12));
    const monthlyIncome = ((S.career && S.career.job ? S.career.job.salary : 0) + (S.job ? S.job.salary : 0)) / 12;
    if (monthlyPayment > monthlyIncome * 0.40) { log('❌ Bank declined. Payment exceeds 40% of income.'); render(); return; }
    
    S.bank.loans.push({
      id: 'vacation_loan_' + Math.random().toString(36).slice(2, 8),
      name: 'Vacation Loan: ' + costs.dest.name,
      loanType: 'vacation',
      principal: yourShare,
      remaining: totalOwed,
      rate: rate,
      monthsLeft: years * 12,
      monthsTotal: years * 12,
      monthlyPayment: monthlyPayment,
      startYear: gameYear(),
      missedPayments: 0
    });
    paid = true;
    log('🏦 Vacation Loan: ' + money(monthlyPayment) + '/mo × ' + years + ' years.');
  }

  if (!paid) return;

  /* Schedule or fire */
  const notice = VAC_NOTICE_OPTIONS.find(function(n) { return n.id === plan.notice; });
  
  // Extract monthsAhead robustly, default to immediate if missing
  let monthsAhead = 0;
  if (notice) {
     if (notice.id === 'tomorrow' || notice.id === 'few_days') monthsAhead = 0;
     else if (notice.id === '1week') monthsAhead = 0; // treating 1 week as immediate in monthly tick system
     else if (notice.id === '1month') monthsAhead = 1;
     else if (notice.id === '3months') monthsAhead = 3;
     else if (notice.id === '6months') monthsAhead = 6;
  }

  if (monthsAhead === 0) {
    /* Fire immediately */
    S.vacationDaysUsedThisYear = (S.vacationDaysUsedThisYear || 0) + plan.duration;
    vacExecuteTrip(plan, costs);
    log('✈️ Departure today! You are on your way to ' + costs.dest.name + '.');
    S.vacation.planned = null;
    S.vacation.planning = null;
    S.vacation.tab = 'history';
    render();
    return;
  }

  /* Schedule */
  const targetAbsMonth = _vacAbsMonth() + monthsAhead;
  S.vacation.pendingDepartures.push({
    id: 't_' + Math.random().toString(36).slice(2, 8),
    plan: plan,
    costs: costs,
    targetAbsMonth: targetAbsMonth,
    targetYear: _vacAbsToYear(targetAbsMonth),
    bookedYear: gameYear(),
    companions: willing
  });

  log('🗓 Trip booked for ' + _vacAbsToDate(targetAbsMonth) + ' — ' + monthsAhead + ' month' + (monthsAhead !== 1 ? 's' : '') + ' until departure.');
  S.vacation.planned = null;
  S.vacation.planning = null;
  S.vacation.tab = 'departures';
  render();
};

/* ============================================================
   TRIP EXECUTION 
   ============================================================ */
function vacExecuteTrip(plan, costs) {
  const dest = costs.dest;
  const days = plan.duration;

  let happy = (costs.classDef.happiness || 0) + (costs.hotelDef.happiness || 0);
  happy += Math.min(15, Math.round(days * 0.8));

  const style = VAC_TRIP_STYLES.find(function(s) { return s.id === plan.tripStyle; });
  if (style) {
    happy += style.happyMod || 0;
    if (style.healthMod) fx({ health: style.healthMod });
    if (style.smartsMod) fx({ smarts: style.smartsMod });
  }
  happy += (costs.spendingDef.happyMod || 0);

  const spouseIncluded = plan.travelers && plan.travelers.spouse;
  const childIds = (plan.travelers && plan.travelers.children) || [];

  if (spouseIncluded && S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    const spouseBondUp = 5 + (style && style.bondMod ? style.bondMod : 0) + Math.min(10, Math.floor(days * 0.4));
    S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + spouseBondUp);
    happy += 5;
    const traits = S.marriage.partner.traits || [];
    if (traits.indexOf('adventurous') >= 0 && style && style.id === 'adventure') S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + 5);
    if (traits.indexOf('homebody') >= 0 && style && style.id === 'party') S.marriage.partner.bond = Math.max(0, S.marriage.partner.bond - 5);
  }

  childIds.forEach(function(cid) {
    const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (!child) return;
    child.happiness = Math.min(100, (child.happiness || 70) + 6 + Math.floor(days * 0.5));
    child.bond = Math.min(100, (child.bond || 55) + 4);
    if (!Array.isArray(child.events)) child.events = [];
    child.events.push({ year: gameYear(), event: 'Family trip to ' + dest.name });
  });

  /* Trip events */
  const eligible = VAC_TRIP_EVENTS.filter(function(ev) {
    if (ev.requiresSpouse && !spouseIncluded) return false;
    if (ev.requiresChild && !childIds.length) return false;
    if (ev.requiresJob && !(S.career && S.career.job)) return false;
    return true;
  });

  const numEvents = 3 + Math.floor(Math.random() * 4);
  const firedEvents = [];
  let eventCostUSD = 0, eventHappy = 0, eventHealth = 0, eventSoc = 0, eventSmarts = 0;

  for (let i = 0; i < numEvents; i++) {
    const totalW = eligible.reduce(function(s, e) { return s + (e.weight || 1); }, 0);
    let roll = Math.random() * totalW;
    let chosen = null;
    for (let j = 0; j < eligible.length; j++) {
      roll -= (eligible[j].weight || 1);
      if (roll <= 0) { chosen = eligible[j]; break; }
    }
    if (!chosen) continue;
    firedEvents.push(chosen);
    eventCostUSD += chosen.costUSD || 0;
    eventHappy += chosen.happy || 0;
    eventHealth += chosen.health || 0;
    eventSoc += chosen.soc || 0;
    eventSmarts += chosen.smarts || 0;
    log('📸 ' + chosen.text);

    if (chosen.id === 'made_friend') {
      try {
        const pool = (typeof FRIEND_NAMES !== 'undefined' && FRIEND_NAMES[dest.country]) || FRIEND_NAMES.egy; // fallback to egy if needed, ideally match locale
        const gender = Math.random() < 0.5 ? 'm' : 'f';
        const names = gender === 'm' ? pool.m : pool.f;
        const name = names[Math.floor(Math.random() * names.length)];
        if (!Array.isArray(S.friends)) S.friends = [];
        S.friends.push({
          id: 'f_' + Math.random().toString(36).slice(2, 8),
          name: name, gender: gender, age: S.age,
          bond: 45, trait: 'loyal',
          source: 'vacation', sourceLabel: 'Met in ' + dest.name,
          metYear: gameYear(), country: dest.country,
          alive: true, contactedThisYear: false
        });
      } catch (e) {}
    }
  }

  if (eventCostUSD > 0) {
    const extraCostLocal = vacUSD(eventCostUSD);
    S.wealth -= extraCostLocal;
    log('💸 Extra costs during trip: ' + money(extraCostLocal));
  }

  happy += eventHappy;
  fx({ happiness: Math.max(-20, happy) });
  if (eventHealth) fx({ health: eventHealth });
  if (eventSoc) fx({ social: eventSoc });
  if (eventSmarts) fx({ smarts: eventSmarts });

  S.vacation.history.unshift({
    id: 't_' + Math.random().toString(36).slice(2, 8),
    destId: plan.destinationId,
    destName: dest.name,
    country: dest.country,
    year: gameYear(),
    days: days,
    airfareClass: plan.airfareClass,
    accommodation: plan.accommodation,
    travelers: { adults: costs.travelers.adults, children: costs.travelers.children },
    totalCostLocal: costs.totalLocal,
    happyGained: happy,
    events: firedEvents.map(function(e) { return e.title; }),
    visaApproved: true
  });

  log('🌍 Returned from ' + days + '-day trip to ' + dest.name + '! Happiness +' + happy + '.');
  emitSignal('vacationCompleted', { destId: plan.destinationId, destName: dest.name, days: days });
}

/* ============================================================
   DEPARTURES + VISA PROCESSING
   ============================================================ */
function vacProcessPendingDepartures() {
  ensureVacationState();
  if (!S || !S.vacation.pendingDepartures || !S.vacation.pendingDepartures.length) return;

  const currentAbs = _vacAbsMonth();

  S.vacation.pendingDepartures = S.vacation.pendingDepartures.filter(function(trip) {
    if (currentAbs >= trip.targetAbsMonth) {
      S.vacationDaysUsedThisYear = (S.vacationDaysUsedThisYear || 0) + trip.plan.duration;
      log('✈️ Departure day! Flying to ' + trip.costs.dest.name + '.');
      vacExecuteTrip(trip.plan, trip.costs);
      return false;
    }
    return true;
  });
}

function vacProcessVisaDecisions() {
  ensureVacationState();
  if (!S || !S.vacation.visaApps) return;
  const currentAbs = _vacAbsMonth();
  S.vacation.visaApps.forEach(function(app) {
    if (app.status !== 'pending') return;
    if (currentAbs < app.decisionAbsMonth) return;
    if (Math.random() < app.approvalChance) {
      app.status = 'approved';
      log('🎉 Visa APPROVED for ' + app.destinationName + '!');
      fx({ happiness: 5 });
      emitSignal('visaApproved', { app: app });
    } else {
      app.status = 'denied';
      log('❌ Visa DENIED for ' + app.destinationName + '. Fee lost.');
      fx({ happiness: -4 });
      emitSignal('visaDenied', { app: app });
    }
  });
}

GameHooks.on('month', function() {
  vacProcessVisaDecisions();
  vacProcessPendingDepartures();
});
GameHooks.on('year', function() {
  vacProcessVisaDecisions();
  vacProcessPendingDepartures();
});

/* ============================================================
   MAIN VIEW
   ============================================================ */
function vacationsView() {
  ensureVacationState();
  if (S.age < 18) return '<div class="card"><h3>✈️ Vacations</h3><p class="muted">Available from age 18+.</p></div>';

  const pendingVisaCount = S.vacation.visaApps.filter(function(v) { return v.status === 'pending'; }).length;
  const pendingTrips = S.vacation.pendingDepartures.length;
  const hasPlanned = !!S.vacation.planned;
  const hasPlanning = !!S.vacation.planning;

  const tabs = [
    ['destinations', '🌍 Destinations'],
    ['applications', '📋 Applications' + (pendingVisaCount > 0 ? ' (' + pendingVisaCount + ')' : '')],
    ['history', '📖 History (' + S.vacation.history.length + ')']
  ];
  if (pendingTrips > 0) tabs.splice(1, 0, ['departures', '🗓 Upcoming (' + pendingTrips + ')']);
  if (hasPlanning) tabs.splice(1, 0, ['plan', '✏️ Planning']);
  if (hasPlanned) tabs.splice(1, 0, ['checkout', '💳 Checkout']);

  const currentTab = S.vacation.tab;
  const daysAvail = vacDaysAvailable();

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#22d3ee15 0%,transparent 100%);border-color:#22d3ee">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">✈️ VACATIONS · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' +
    (S.career && S.career.job
      ? daysAvail + ' / ' + S.vacationDays + ' vacation days available'
      : 'No manager — travel freely') +
    '</div></div>' +
    '<div style="font-size:2rem">✈️</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) {
      return '<button class="pill ' + (currentTab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="vacSetTab(\'' + t[0] + '\')">' + t[1] + '</button>';
    }).join('') +
    '</div></div>';

  if (currentTab === 'destinations') html += vacRenderDestinations();
  else if (currentTab === 'departures') html += vacRenderDepartures();
  else if (currentTab === 'plan') html += vacRenderPlan();
  else if (currentTab === 'checkout') html += vacRenderCheckout();
  else if (currentTab === 'applications') html += vacRenderApplications();
  else if (currentTab === 'history') html += vacRenderHistory();

  return html;
}

/* ---------- DESTINATIONS ---------- */
function vacRenderDestinations() {
  const byRegion = {};
  VAC_DESTINATIONS.forEach(function(d) {
    if (!byRegion[d.region]) byRegion[d.region] = [];
    byRegion[d.region].push(d);
  });
  const regionLabels = {
    mena: '🏜 Middle East & North Africa', europe: '🏛 Europe', asia: '🏯 Asia',
    north_america: '🗽 North America', oceania: '🦘 Oceania',
    south_america: '🌴 South America', africa: '🦁 Africa'
  };

  let html = '<div class="card"><h3>🌍 Choose Your Destination</h3>' +
    '<p class="muted small">Tap a destination to see full pricing and options.</p></div>';

  if (S.vacation.pendingDepartures.length > 0) {
    html += '<div class="card" style="border-color:#fbbf24"><h4 style="color:#fbbf24">🗓 Upcoming Trips</h4>';
    S.vacation.pendingDepartures.forEach(function(trip) {
      html += '<div class="row" style="padding:4px 0;font-size:.8rem"><span>' + trip.costs.dest.name + '</span><b>' + _vacAbsToDate(trip.targetAbsMonth) + '</b></div>';
    });
    html += '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.72rem" onclick="vacSetTab(\'departures\')">View all →</button></div>';
  }

  Object.keys(byRegion).forEach(function(region) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee;margin-bottom:8px">' + (regionLabels[region] || region.toUpperCase()) + '</h4>';
    byRegion[region].forEach(function(d) {
      const flight = vacBaseFlightUSD(d.id);
      const visa = vacNeedsVisa(d.id);
      const isCurrentCountry = d.country === S.country;

      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-weight:700">' + d.name + (isCurrentCountry ? ' 🏠' : '') + '</div>' +
        '<div class="muted small">' + d.tag + '</div>' +
        '<div class="muted small">✈️ ' + money(vacUSD(flight)) + ' · 📅 typical ' + d.days_typical + ' days · ' +
        (visa.needed ? '📋 Visa required' : '✅ No visa') + '</div>' +
        '<div class="muted small">Safety ' + d.safety + '/10 · Language ' + d.language.toUpperCase() + '</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;padding:6px;font-size:.72rem;background:#22d3ee20;border-color:#22d3ee" onclick="vacStartPlanning(\'' + d.id + '\')">Plan trip →</button>' +
        '</div>';
    });
    html += '</div>';
  });

  return html;
}

/* ---------- DEPARTURES ---------- */
function vacRenderDepartures() {
  if (!S.vacation.pendingDepartures.length) {
    return '<div class="card"><h3>🗓 Upcoming Trips</h3><p class="muted small">No scheduled departures.</p></div>';
  }
  const currentAbs = _vacAbsMonth();
  let html = '<div class="card"><h3>🗓 Upcoming Trips (' + S.vacation.pendingDepartures.length + ')</h3></div>';
  S.vacation.pendingDepartures.forEach(function(trip) {
    const monthsLeft = Math.max(0, trip.targetAbsMonth - currentAbs);
    html += '<div class="card" style="padding:10px">' +
      '<div style="display:flex;justify-content:space-between"><b>' + trip.costs.dest.name + '</b><span class="muted small">' + _vacAbsToDate(trip.targetAbsMonth) + '</span></div>' +
      '<div class="muted small">' + trip.plan.duration + ' days · ' + trip.companions.length + ' companion' + (trip.companions.length !== 1 ? 's' : '') + '</div>' +
      '<div class="row"><span>Cost paid</span><b class="mono">' + money(trip.costs.totalLocal) + '</b></div>' +
      '<div class="row"><span>Departs in</span><b>' + monthsLeft + ' month' + (monthsLeft !== 1 ? 's' : '') + '</b></div>' +
      '</div>';
  });
  return html;
}

/* ---------- PLAN ---------- */
function vacRenderPlan() {
  const plan = S.vacation.planning;
  if (!plan) return '<div class="card"><p class="muted small">No active plan.</p></div>';
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === plan.destinationId; });
  if (!dest) return '<div class="card"><p class="muted small">Destination not found.</p></div>';

  const costs = vacCalculateCosts(plan);
  const daysAvail = vacDaysAvailable();
  const enoughDays = !(S.career && S.career.job) || plan.duration <= daysAvail;
  const visa = vacNeedsVisa(plan.destinationId);
  const approvedVisa = S.vacation.visaApps.find(function(v) { return v.destinationId === plan.destinationId && v.status === 'approved'; });
  const pendingVisa = S.vacation.visaApps.find(function(v) { return v.destinationId === plan.destinationId && v.status === 'pending'; });
  const manager = vacManagerApprovalChance(plan);
  const activities = VAC_ACTIVITIES[dest.country] || VAC_ACTIVITIES.egy;
  const spouseAvailable = S.marriage && S.marriage.partner && S.marriage.partner.alive !== false;
  const childrenAvailable = (S.childrenList || []).filter(function(c) { return !c.movedOut; });
  const friendsAvailable = (S.friends || []).filter(function(f) { return f.alive && f.country === S.country; });
  const familyAbroad = vacHasFamilyAbroad(plan.destinationId);

  let html = '<div class="card" style="border-color:#22d3ee"><div style="display:flex;justify-content:space-between;align-items:center">' +
    '<h3 style="color:#22d3ee;margin:0">✏️ Planning: ' + dest.name + '</h3>' +
    '<button class="pill" style="padding:4px 10px;font-size:.72rem" onclick="vacCancelPlanning()">✕ Cancel</button>' +
    '</div></div>';

  /* Duration */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">📅 Duration</h4>' +
    '<div class="row"><span>Days</span><b>' + plan.duration + '</b></div>' +
    '<input type="range" min="2" max="30" value="' + plan.duration + '" oninput="vacPlanSetDuration(parseInt(this.value))" style="width:100%;margin-top:8px">' +
    '<div style="display:flex;justify-content:space-between" class="muted small"><span>2</span><span>30</span></div>' +
    (S.career && S.career.job ? '<div class="muted small" style="margin-top:6px">' + daysAvail + ' days available ' + (enoughDays ? '✓' : '<span class="bad">— not enough!</span>') + '</div>' : '') +
    '</div>';

  /* Airfare */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">✈️ Airfare Class</h4>';
  VAC_AIRFARE_CLASSES.forEach(function(c) {
    const active = plan.airfareClass === c.id;
    const perPerson = vacUSD(costs.baseFlightUSD * c.mult);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'airfareClass\',\'' + c.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + c.label + (active ? ' ✓' : '') + '</b><span>' + money(perPerson) + '</span></div>' +
      '<div class="muted small">Per person · Comfort +' + (c.comfort || 0) + ' · Happiness +' + (c.happiness || 0) + '</div></button>';
  });
  html += '</div>';

  /* Accommodation */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🏨 Accommodation</h4>';
  VAC_HOTEL_TIERS.forEach(function(h) {
    if (h.requiresFamilyAbroad && !familyAbroad.available) return;
    const active = plan.accommodation === h.id;
    const nightly = vacUSD(h.perNightUSD);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'accommodation\',\'' + h.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + h.label + (active ? ' ✓' : '') + '</b><span>' + (h.perNightUSD > 0 ? money(nightly) + '/night' : 'Free') + '</span></div>' +
      '<div class="muted small">Comfort ' + h.comfort + '/10 · Happiness +' + (h.happiness || 0) + '</div></button>';
  });
  html += '</div>';

  /* Trip style */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🎨 Trip Style</h4>';
  VAC_TRIP_STYLES.forEach(function(s) {
    const active = plan.tripStyle === s.id;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'tripStyle\',\'' + s.id + '\')">' +
      '<div><b>' + s.label + (active ? ' ✓' : '') + '</b></div>' +
      '<div class="muted small">' + s.desc + '</div></button>';
  });
  html += '</div>';

  /* Spending — FIXED DISPLAY */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">💵 Daily Spending</h4>';
  VAC_SPENDING_OPTIONS.forEach(function(s) {
    const active = plan.spending === s.id;
    const perPerson = vacUSD(s.usdPerDay * plan.duration);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'spending\',\'' + s.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + s.label + (active ? ' ✓' : '') + '</b><span>' + money(perPerson) + '<small class="muted">/person</small></span></div>' +
      '<div class="muted small">$' + s.usdPerDay + '/day × ' + plan.duration + ' days · Happy ' + (s.happyMod > 0 ? '+' : '') + s.happyMod + '</div></button>';
  });
  html += '</div>';

  /* Travelers */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">👥 Travelers</h4>';
  html += '<div class="row"><span>You (always)</span><b>✓</b></div>';
  if (spouseAvailable) {
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (plan.travelers.spouse ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'spouse\',true)">' +
      '<div style="display:flex;justify-content:space-between"><b>' + S.marriage.partner.name + ' (spouse · bond ' + (S.marriage.partner.bond || 70) + '%)' + (plan.travelers.spouse ? ' ✓' : '') + '</b><span>' + (plan.travelers.spouse ? 'Invited' : 'Invite') + '</span></div>' +
      '<div class="muted small">' + (S.marriage.partner.bond >= 60 ? 'Likely to join' : 'May decline') + '</div></button>';
  }
  childrenAvailable.forEach(function(c) {
    const active = plan.travelers.children.indexOf(c.id) >= 0;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'child\',\'' + c.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + c.name + ' (age ' + c.age + ')' + (active ? ' ✓' : '') + '</b><span>' + (active ? 'Included' : 'Add') + '</span></div></button>';
  });
  if (friendsAvailable.length > 0) {
    html += '<div style="margin-top:10px"><b class="muted small" style="font-size:.75rem">FRIENDS</b></div>';
    friendsAvailable.forEach(function(f) {
      const active = plan.travelers.friends.indexOf(f.id) >= 0;
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'friend\',\'' + f.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + f.name + ' (bond ' + f.bond + '%)' + (active ? ' ✓' : '') + '</b><span>' + (active ? 'Invited' : 'Invite') + '</span></div>' +
        '<div class="muted small">' + (f.bond >= 60 ? 'Likely to join' : f.bond >= 40 ? 'Might join' : 'Unlikely') + '</div></button>';
    });
  }
  html += '</div>';

  /* Payment split */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">💰 Payment Split</h4>';
  [
    { id: 'you_pay_all', label: 'You pay for everyone', desc: 'All companions come free at your expense.' },
    { id: 'split', label: 'Split evenly with companions', desc: 'Companions pay their share. You cover anyone who can\'t.' }
  ].forEach(function(opt) {
    const active = (plan.paymentSplit || 'you_pay_all') === opt.id;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'paymentSplit\',\'' + opt.id + '\')">' +
      '<div><b>' + opt.label + (active ? ' ✓' : '') + '</b></div>' +
      '<div class="muted small">' + opt.desc + '</div></button>';
  });
  html += '</div>';

  /* Activities */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🎢 Activities</h4>';
  activities.forEach(function(a) {
    const active = plan.activities.indexOf(a.id) >= 0;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'activity\',\'' + a.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + a.label + (active ? ' ✓' : '') + '</b><span>' + money(vacUSD(a.costUSD)) + '/person</span></div>' +
      '<div class="muted small">Happy +' + (a.happy || 0) + (a.social ? ' · Social +' + a.social : '') + (a.smarts ? ' · Smarts +' + a.smarts : '') + (a.health ? ' · Health +' + a.health : '') + ' · ' + a.hours + 'h</div></button>';
  });
  html += '</div>';

  /* Insurance */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🛡 Travel Insurance</h4>' +
    '<button class="opt" style="width:100%;text-align:left;padding:8px;font-size:.78rem;' + (plan.travelInsurance ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'travelInsurance\',true)">' +
    '<div style="display:flex;justify-content:space-between"><b>Travel Insurance' + (plan.travelInsurance ? ' ✓' : '') + '</b><span>~' + money(vacUSD(100)) + '</span></div>' +
    '<div class="muted small">Covers medical, luggage, cancellations.</div></button></div>';

  /* Notice */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">📢 Notice to Manager</h4>';
  VAC_NOTICE_OPTIONS.forEach(function(n) {
    const active = plan.notice === n.id;
    // Handle undefined monthsAhead gracefully
    const months = n.monthsAhead || 0; 
    const noticeLabel = months > 0 ? 'Departs ' + _vacAbsToDate(_vacAbsMonth() + months) : 'Departs immediately';
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'notice\',\'' + n.id + '\')">' +
      '<div><b>' + n.label + (active ? ' ✓' : '') + '</b></div>' +
      '<div class="muted small">' + n.desc + ' (Approval ' + (n.approvalMod > 0 ? '+' : '') + Math.round(n.approvalMod * 100) + '%) · ' + noticeLabel + '</div></button>';
  });
  html += '</div>';

  /* Visa status */
  if (visa.needed) {
    html += '<div class="card" style="border-color:#fbbf24"><h4 style="font-size:.85rem;color:#fbbf24">📋 Visa</h4>' +
      (approvedVisa ? '<div class="good" style="font-weight:700">✅ Visa APPROVED</div>' :
        pendingVisa ? '<div class="bad" style="font-weight:700">⏳ Visa pending — decision expected ' + _vacAbsToDate(pendingVisa.decisionAbsMonth) + '</div>' :
          '<div class="bad" style="font-weight:700">❌ No visa application yet</div>' +
          '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700;font-size:.75rem" onclick="vacApplyVisa()">Apply for visa</button>') +
      '</div>';
  }

  /* Manager approval preview */
  if (S.career && S.career.job) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">📋 Manager Approval</h4>' +
      '<div class="row"><span>Manager</span><b>' + manager.managerName + '</b></div>' +
      '<div class="row"><span>Style</span><b>' + manager.managerStyle + '</b></div>' +
      '<div class="muted small" style="margin-top:4px">' + manager.managerDesc + '</div>' +
      '<div class="row" style="margin-top:6px"><span>Approval chance</span><b class="' + (manager.chance > 0.6 ? 'good' : 'bad') + '">' + Math.round(manager.chance * 100) + '%</b></div>' +
      '</div>';
  }

  /* Cost preview */
  html += '<div class="card" style="border-color:#34d399"><h4 style="font-size:.85rem;color:#34d399">💰 Cost Preview</h4>' +
    '<div class="row"><span>Airfare</span><b>' + money(vacUSD(costs.airfareUSD)) + '</b></div>' +
    '<div class="row"><span>Accommodation</span><b>' + money(vacUSD(costs.hotelUSD)) + '</b></div>' +
    '<div class="row"><span>Activities</span><b>' + money(vacUSD(costs.activitiesUSD)) + '</b></div>' +
    '<div class="row"><span>Spending money</span><b>' + money(vacUSD(costs.spendingUSD)) + '</b></div>' +
    (costs.travelInsuranceUSD > 0 ? '<div class="row"><span>Insurance</span><b>' + money(vacUSD(costs.travelInsuranceUSD)) + '</b></div>' : '') +
    (costs.visaFeeUSD > 0 ? '<div class="row"><span>Visa fees</span><b>' + money(vacUSD(costs.visaFeeUSD)) + '</b></div>' : '') +
    '<div class="row"><span>Misc</span><b>' + money(vacUSD(costs.miscUSD)) + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>TOTAL</b><b class="good" style="font-size:1.1rem">' + money(costs.totalLocal) + '</b></div>' +
    (costs.totalTravelers > 1 ? '<div class="muted small" style="margin-top:2px">For all ' + costs.totalTravelers + ' travelers</div>' : '') +
    '</div>';

  /* Submit */
  const canProceed = enoughDays && (visa.needed ? (approvedVisa || pendingVisa) : true);
  html += '<button class="opt" style="margin-top:10px;width:100%;text-align:center;font-size:.85rem;font-weight:700;padding:12px;background:' + (canProceed ? '#34d399' : '#25253a') + ';color:' + (canProceed ? '#000' : '#666') + '" ' + (canProceed ? '' : 'disabled') + ' onclick="vacRequestApproval()">' +
    (canProceed ? '📝 Review & Approve' : (!enoughDays ? 'Not enough days' : (visa.needed && !approvedVisa ? 'Visa required' : 'Cannot proceed'))) +
    '</button>';

  return html;
}

/* ---------- CHECKOUT ---------- */
function vacRenderCheckout() {
  const planned = S.vacation.planned;
  if (!planned) return '<div class="card"><p class="muted small">No plan to check out.</p></div>';
  const plan = planned.plan;
  const companions = planned.companions || [];
  const willing = companions.filter(function(c) { return c.willing; });

  const actualTravelers = {
    spouse: !!(plan.travelers.spouse && willing.some(function(c) { return c.type === 'spouse'; })),
    children: (plan.travelers.children || []).filter(function(cid) { return willing.some(function(c) { return c.id === cid; }); }),
    friends: (plan.travelers.friends || []).filter(function(fid) { return willing.some(function(c) { return c.id === fid; }); })
  };
  const finalCosts = vacCalculateCosts(plan, actualTravelers);

  const split = plan.paymentSplit || 'you_pay_all';
  let yourShare = finalCosts.totalLocal;
  if (split !== 'you_pay_all' && willing.length > 0) {
    const totalTravelers = 1 + willing.length;
    const perPerson = finalCosts.totalLocal / totalTravelers;
    const notPaying = willing.filter(function(c) { return !c.willPay; }).length;
    yourShare = Math.round(perPerson * (1 + notPaying));
  }

  const notice = VAC_NOTICE_OPTIONS.find(function(n) { return n.id === plan.notice; });
  // Robust check for immediate departure
  let monthsAhead = 0;
  if (notice) {
      if (notice.id === '1month') monthsAhead = 1;
      else if (notice.id === '3months') monthsAhead = 3;
      else if (notice.id === '6months') monthsAhead = 6;
  }
  
  const departsImmediately = monthsAhead === 0;
  const targetAbsMonth = departsImmediately ? _vacAbsMonth() : _vacAbsMonth() + monthsAhead;

  let html = '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">💳 Checkout: ' + finalCosts.dest.name + '</h3>' +
    '<div class="row"><span>Duration</span><b>' + finalCosts.days + ' days</b></div>' +
    '<div class="row"><span>Total travelers</span><b>' + finalCosts.totalTravelers + '</b></div>' +
    '<div class="row"><span>Airfare</span><b>' + finalCosts.classDef.label + '</b></div>' +
    '<div class="row"><span>Accommodation</span><b>' + finalCosts.hotelDef.label + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total cost</b><b class="good">' + money(finalCosts.totalLocal) + '</b></div>' +
    (yourShare !== finalCosts.totalLocal ? '<div class="row"><b>Your share</b><b class="good" style="font-size:1.15rem">' + money(yourShare) + '</b></div>' : '') +
    '</div>';

  /* Departure info */
  html += '<div class="card" style="border-color:#fbbf24"><h4 style="color:#fbbf24">🗓 Departure</h4>' +
    (departsImmediately
      ? '<p class="small">Departs <b>immediately</b></p>'
      : '<div class="row"><span>Notice given</span><b>' + notice.label + '</b></div><div class="row"><span>Departs</span><b>' + _vacAbsToDate(targetAbsMonth) + '</b></div>') +
    '</div>';

  /* Companion status */
  if (companions.length > 0) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">👥 Companions</h4>';
    companions.forEach(function(c) {
      const color = !c.willing ? '#fb7185' : c.willPay ? '#34d399' : '#fbbf24';
      html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between">' +
        '<b style="color:' + color + '">' + c.name + '</b>' +
        '<span class="small">' + (c.willing ? '✓ Coming' : '✗ Not coming') + '</span>' +
        '</div><div class="muted small">' + c.reason + '</div></div>';
    });
    html += '</div>';
  }

  /* Payment */
  html += '<div class="card"><h3>Pay Your Share</h3>';
  const canCash = S.wealth >= yourShare;
  html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.85rem;' + (canCash ? 'background:#34d39920;border-color:#34d399' : 'opacity:.5') + '" ' + (canCash ? '' : 'disabled') + ' onclick="vacBookTrip(\'cash\')">' +
    '<div style="display:flex;justify-content:space-between"><b>💵 Cash</b><span>' + money(yourShare) + '</span></div>' +
    '<div class="muted small">Available: ' + money(S.wealth) + '</div></button>';

  const cards = (S.bank && S.bank.creditCards) || [];
  const usableCards = cards.filter(function(c) { return (c.limit || 0) - (c.balance || 0) >= yourShare; });
  if (usableCards.length > 0) {
    usableCards.forEach(function(card) {
      html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.85rem;background:#22d3ee20;border-color:#22d3ee" onclick="vacBookTrip(\'card\')">' +
        '<div style="display:flex;justify-content:space-between"><b>💳 ' + card.name + '</b><span>' + money(yourShare) + '</span></div></button>';
    });
  } else if (cards.length > 0) {
    html += '<div class="muted small" style="padding:8px 0">No card with enough credit for ' + money(yourShare) + '</div>';
  } else {
    html += '<div class="muted small" style="padding:8px 0">No credit cards. Get one in Banking tab.</div>';
  }

  const monthlyIncome = ((S.career && S.career.job ? S.career.job.salary : 0) + (S.job ? S.job.salary : 0)) / 12;
  const totalOwed = Math.round(yourShare * 1.36);
  const monthlyPayment = Math.ceil(totalOwed / 24);
  const loanEligible = monthlyIncome > 0 && monthlyPayment <= monthlyIncome * 0.40;
  html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.85rem;' + (loanEligible ? 'background:#fbbf2420;border-color:#fbbf24' : 'opacity:.5') + '" ' + (loanEligible ? '' : 'disabled') + ' onclick="vacBookTrip(\'loan\')">' +
    '<div style="display:flex;justify-content:space-between"><b>🏦 Vacation Loan</b><span>' + money(monthlyPayment) + '/mo</span></div>' +
    '<div class="muted small">2 years @ 18% · ' + money(totalOwed) + ' total</div></button>';
  html += '</div>';

  html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="S.vacation.planned=null;S.vacation.tab=\'plan\';render()">← Back to planning</button>';

  return html;
}

/* ---------- APPLICATIONS ---------- */
function vacRenderApplications() {
  const pending = S.vacation.visaApps.filter(function(v) { return v.status === 'pending'; });
  const decided = S.vacation.visaApps.filter(function(v) { return v.status !== 'pending'; });

  let html = '<div class="card"><h3>📋 Visa Applications</h3></div>';

  if (!pending.length && !decided.length) {
    return html + '<div class="card"><p class="muted small">No visa applications.</p></div>';
  }

  if (pending.length) {
    html += '<div class="card" style="border-color:#fbbf24"><h4 style="color:#fbbf24">⏳ Pending</h4>';
    pending.forEach(function(a) {
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<b>' + a.destinationName + '</b>' +
        '<div class="muted small">Applied ' + a.appliedYear + ' · Decision expected ' + _vacAbsToDate(a.decisionAbsMonth) + ' · ' + Math.round(a.approvalChance * 100) + '% chance</div>' +
        '</div>';
    });
    html += '</div>';
  }

  if (decided.length) {
    html += '<div class="card"><h4>Decided</h4>';
    decided.forEach(function(a) {
      const color = a.status === 'approved' ? 'good' : 'bad';
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + a.destinationName + '</b><b class="' + color + '">' + a.status.toUpperCase() + '</b></div>' +
        '<div class="muted small">Applied ' + a.appliedYear + ' · Fee ' + money(vacUSD(a.feeUSD)) + '</div></div>';
    });
    html += '</div>';
  }

  return html;
}

/* ---------- HISTORY ---------- */
function vacRenderHistory() {
  if (!S.vacation.history.length) {
    return '<div class="card"><h3>📖 Trip History</h3><p class="muted small">No past trips. Book your first vacation!</p></div>';
  }
  let html = '<div class="card"><h3>📖 Trip History (' + S.vacation.history.length + ')</h3></div>';
  S.vacation.history.slice(0, 30).forEach(function(t) {
    html += '<div class="card" style="padding:10px">' +
      '<div style="display:flex;justify-content:space-between"><b>' + t.destName + '</b><span class="muted small">' + t.year + '</span></div>' +
      '<div class="muted small">' + t.days + ' days · ' + (VAC_AIRFARE_CLASSES.find(function(c) { return c.id === t.airfareClass; }) || {}).label + ' · ' +
      (VAC_HOTEL_TIERS.find(function(h) { return h.id === t.accommodation; }) || {}).label + '</div>' +
      '<div class="row"><span>Total cost</span><b class="mono">' + money(t.totalCostLocal) + '</b></div>' +
      '<div class="row"><span>Happiness gained</span><b class="good">+' + t.happyGained + '</b></div>' +
      (t.events.length ? '<div class="muted small" style="margin-top:6px">📸 ' + t.events.join(' · ') + '</div>' : '') +
      '</div>';
  });
  return html;
}

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'vacations', label: '✈️ Vacations', order: 15, view: vacationsView });
console.log('[World Life] 26-view-vacations.js loaded — v2');
