/* ============================================================
   VIEW: VACATIONS — full planning & booking system
   ============================================================ */

/* ---------- STATE ---------- */
function ensureVacationState() {
  if (!S) return;
  if (!S.vacation) {
    S.vacation = {
      tab: 'destinations',
      planning: null,        /* active plan being configured */
      planned: null,         /* approved plan waiting to depart */
      visaApps: [],          /* pending visa applications */
      history: [],           /* past trips */
      activeTrip: null       /* currently on vacation */
    };
  }
  const v = S.vacation;
  if (!Array.isArray(v.visaApps)) v.visaApps = [];
  if (!Array.isArray(v.history)) v.history = [];
  if (!v.tab) v.tab = 'destinations';
  if (typeof S.vacationDays === 'undefined') S.vacationDays = 21;
  if (typeof S.vacationDaysUsedThisYear === 'undefined') S.vacationDaysUsedThisYear = 0;
}
GameHooks.on('newGame', ensureVacationState);
GameHooks.on('migrate', ensureVacationState);

function vacSetTab(tab) { S.vacation.tab = tab; render(); }
window.vacSetTab = vacSetTab;

/* ---------- CURRENCY HELPERS ---------- */
function vacUSD(usd) { return Math.round(usd * (C().rate || 1)); }
function vacEGP(egp) { return Math.round(egp * ((C().rate || 1) / 52.7)); }

/* ---------- PASSPORT TIER ---------- */
function vacPassportTier() {
  const pd = (typeof immPassportData === 'function') ? immPassportData() : null;
  if (!pd) return 'mid';
  const score = pd.strengthScore || 80;
  if (score >= 170) return 'strong';
  if (score >= 80) return 'mid';
  return 'weak';
}

function vacNeedsVisa(destId) {
  const req = VAC_VISA_REQUIREMENTS[destId];
  if (!req) return { needed: false, type: 'none' };
  /* Domestic = same country as player */
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === destId; });
  if (dest && dest.country === S.country) return { needed: false, type: 'domestic' };
  const tier = vacPassportTier();
  const needed = !!req[tier];
  return { needed: needed, type: req.visa };
}

/* ---------- FAMILY AVAILABILITY ---------- */
function vacHasFamilyAbroad(destId) {
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === destId; });
  if (!dest) return false;
  const country = dest.country;
  /* Family abroad = relatives living in dest country */
  const fam = (S.family || []).filter(function(m) {
    return m.alive !== false && !m.estranged && m.country === country;
  });
  if (fam.length > 0) return { available: true, members: fam };
  return { available: false, members: [] };
}

/* ---------- FLIGHT COST ---------- */
function vacBaseFlightUSD(destId) {
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === destId; });
  if (!dest) return 0;
  const originRegion = VAC_COUNTRY_REGION[S.country] || 'mena';
  const destRegion = dest.region;
  const factor = (VAC_REGION_FACTOR[originRegion] && VAC_REGION_FACTOR[originRegion][destRegion]) || 1.5;
  return Math.round(dest.baseFlightUSD * factor);
}

/* ---------- COST CALCULATION ---------- */
function vacCalculateCosts(plan) {
  if (!plan || !plan.destinationId) return null;
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === plan.destinationId; });
  if (!dest) return null;
  const days = plan.duration || 7;
  const classDef = VAC_AIRFARE_CLASSES.find(function(c) { return c.id === plan.airfareClass; }) || VAC_AIRFARE_CLASSES[0];
  const hotel = VAC_HOTEL_TIERS.find(function(h) { return h.id === plan.accommodation; }) || VAC_HOTEL_TIERS[3];
  const spending = VAC_SPENDING_OPTIONS.find(function(s) { return s.id === plan.spending; }) || VAC_SPENDING_OPTIONS[1];

  const baseFlightUSD = vacBaseFlightUSD(plan.destinationId);

  /* Travelers */
  const travelerCount = { adults: 1, children: 0 };
  let spouseIncluded = false;
  let childIds = [];
  if (plan.travelers && plan.travelers.spouse) {
    spouseIncluded = true;
    travelerCount.adults++;
  }
  if (plan.travelers && Array.isArray(plan.travelers.children)) {
    childIds = plan.travelers.children.slice();
    travelerCount.children = childIds.length;
  }

  /* Airfare */
  let airfareUSD = baseFlightUSD * classDef.mult;
  if (spouseIncluded) airfareUSD += baseFlightUSD * classDef.mult;
  childIds.forEach(function(cid) {
    const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (child) airfareUSD += baseFlightUSD * classDef.mult * vacChildAirfareMult(child.age);
  });

  /* Hotel / accommodation */
  let hotelUSD = (hotel.perNightUSD || 0) * days;
  if (spouseIncluded) hotelUSD *= 1.0; /* same room */
  childIds.forEach(function(cid) {
    const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (child) hotelUSD *= (1 + vacChildHotelAddPct(child.age) * 0.5);
  });

  /* Activities */
  let activitiesUSD = 0;
  (plan.activities || []).forEach(function(aid) {
    const list = VAC_ACTIVITIES[dest.country] || VAC_ACTIVITIES.egy;
    const act = list.find(function(a) { return a.id === aid; });
    if (!act) return;
    let cost = act.costUSD * classDef.comfort > 0 ? act.costUSD : act.costUSD;
    /* Self */
    activitiesUSD += cost;
    /* Spouse */
    if (spouseIncluded) activitiesUSD += cost;
    /* Children */
    childIds.forEach(function(cid) {
      const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
      if (child) activitiesUSD += cost * vacChildActivityPct(child.age);
    });
  });

  /* Spending money (personal allowance x traveler count) */
  let totalTravelers = 1 + (spouseIncluded ? 1 : 0);
  let childWeight = 0;
  childIds.forEach(function(cid) {
    const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (child) childWeight += (child.age <= 5 ? 0.3 : child.age <= 12 ? 0.6 : 1.0);
  });
  const spendingUSD = spending.usdPerDay * days * (totalTravelers + childWeight);

  /* Travel insurance */
  const travelInsuranceUSD = plan.travelInsurance ? (50 + (dest.tier === 'luxury' ? 200 : dest.tier === 'premium' ? 100 : 50)) * (totalTravelers + childIds.length * 0.5) : 0;

  /* Airport transfer / misc */
  const miscUSD = 80;

  /* Visa fee per traveler (approximate - full calc on apply) */
  const visa = vacNeedsVisa(plan.destinationId);
  const perVisaFee = visa.needed ? (VAC_VISA_FEES_USD[visa.type] || 100) : 0;
  const totalVisaFee = perVisaFee * (totalTravelers + childIds.length);

  /* Total in USD */
  const totalUSD = airfareUSD + hotelUSD + activitiesUSD + spendingUSD + travelInsuranceUSD + miscUSD + totalVisaFee;

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
    travelers: { adults: travelerCount.adults, children: travelerCount.children },
    dest: dest,
    hotelDef: hotel,
    classDef: classDef,
    spendingDef: spending
  };
}
window.vacCalculateCosts = vacCalculateCosts;

/* ============================================================
   PLANNING FLOW
   ============================================================ */
window.vacStartPlanning = function(destId) {
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === destId; });
  if (!dest) return;

  S.vacation.planning = {
    destinationId: destId,
    duration: dest.days_typical,
    airfareClass: 'economy',
    accommodation: dest.tier === 'luxury' ? 'hotel5' : dest.tier === 'premium' ? 'hotel4' : 'hotel3',
    travelers: { spouse: false, children: [] },
    activities: [],
    spending: 'normal',
    tripStyle: 'relaxing',
    notice: '1month',
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
  if (field === 'activity') {
    const idx = S.vacation.planning.activities.indexOf(value);
    if (idx >= 0) S.vacation.planning.activities.splice(idx, 1);
    else S.vacation.planning.activities.push(value);
  } else if (field === 'child') {
    const idx = S.vacation.planning.travelers.children.indexOf(value);
    if (idx >= 0) S.vacation.planning.travelers.children.splice(idx, 1);
    else S.vacation.planning.travelers.children.push(value);
  } else if (field === 'spouse') {
    S.vacation.planning.travelers.spouse = !S.vacation.planning.travelers.spouse;
  } else {
    S.vacation.planning[field] = value;
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
  if (!S.career || !S.career.job) return { chance: 1, reason: 'self-employed' };
  const job = S.career.job;
  let chance = 0.65;
  if (job.performance >= 80) chance += 0.15;
  else if (job.performance < 50) chance -= 0.25;
  const bossBond = job.boss ? job.boss.bond : 50;
  if (bossBond >= 70) chance += 0.10;
  else if (bossBond < 40) chance -= 0.15;
  /* Duration */
  if (plan.duration > 14) chance -= 0.15;
  if (plan.duration > 21) chance -= 0.15;
  /* Notice */
  const notice = VAC_NOTICE_OPTIONS.find(function(n) { return n.id === plan.notice; });
  if (notice) chance += notice.approvalMod;
  /* Manager personality */
  const style = VAC_MANAGER_STYLES[Math.random() < 0.5 ? 'neutral' : 'flexible'];
  /* Prefer deterministic: use boss trait if exists */
  let bossStyle = VAC_MANAGER_STYLES.neutral;
  if (job.boss && job.boss.trait && VAC_MANAGER_STYLES[job.boss.trait]) {
    bossStyle = VAC_MANAGER_STYLES[job.boss.trait];
  } else {
    /* Deterministic based on boss name hash */
    const hash = (job.boss ? job.boss.name : 'unknown').split('').reduce(function(s, c) { return s + c.charCodeAt(0); }, 0);
    const styleKeys = Object.keys(VAC_MANAGER_STYLES);
    bossStyle = VAC_MANAGER_STYLES[styleKeys[hash % styleKeys.length]];
  }
  chance += bossStyle.approvalMod;
  /* Tenure */
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
  if (!S.career || !S.career.job) return 365;
  return Math.max(0, (S.vacationDays || 21) - (S.vacationDaysUsedThisYear || 0));
}
window.vacDaysAvailable = vacDaysAvailable;

/* ============================================================
   VISA APPLICATION
   ============================================================ */
function vacVisaApprovalChance(plan) {
  const visaInfo = vacNeedsVisa(plan.destinationId);
  if (!visaInfo.needed) return { chance: 1, reason: 'no_visa_required' };
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === plan.destinationId; });
  let chance = 0.65;
  /* Income / funds */
  const income = (S.job ? S.job.salary : 0) + (S.career && S.career.job ? S.career.job.salary : 0);
  if (income > 200000) chance += 0.15;
  else if (income < 50000) chance -= 0.15;
  /* Wealth proof */
  if (S.wealth > vacUSD(20000)) chance += 0.10;
  if (S.wealth < vacUSD(1000)) chance -= 0.20;
  /* Previous approved visa history */
  const pastApproved = S.vacation.history.filter(function(h) { return h.visaApproved; }).length;
  if (pastApproved > 0) chance += Math.min(0.20, pastApproved * 0.05);
  /* Destination strictness */
  if (visaInfo.type === 'usa_b1b2') chance -= 0.30;
  else if (visaInfo.type === 'uk_visa' || visaInfo.type === 'canada_visa') chance -= 0.15;
  else if (visaInfo.type === 'australia_visa') chance -= 0.10;
  else if (visaInfo.type === 'schengen') chance -= 0.05;
  else if (visaInfo.type === 'evisa' || visaInfo.type === 'voa') chance += 0.15;
  /* Trip duration - longer = more scrutiny */
  if (plan.duration > 21) chance -= 0.10;
  /* Travel history boosts */
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
  if (!vacNeedsVisa(plan.destinationId).needed) {
    log('✅ No visa needed for this destination.');
    render(); return;
  }
  if (S.vacation.visaApps.some(function(v) { return v.destinationId === plan.destinationId && v.status === 'pending'; })) {
    log('❌ Visa application already pending for this destination.');
    render(); return;
  }
  const feeLocal = vacUSD(info.feeUSD);
  if (S.wealth < feeLocal) { log('❌ Need ' + money(feeLocal) + ' for the visa fee.'); render(); return; }
  if (!confirm('Apply for a visa to ' + plan.destinationId + '?\n\nFee: ' + money(feeLocal) + '\nWait: ' + info.waitMonths + ' months\nApproval chance: ' + Math.round(info.chance * 100) + '%\n\nIf denied, the fee is lost.')) return;

  S.wealth -= feeLocal;
  const dest = VAC_DESTINATIONS.find(function(d) { return d.id === plan.destinationId; });
  const app = {
    id: 'v_' + Math.random().toString(36).slice(2, 8),
    destinationId: plan.destinationId,
    destinationName: dest ? dest.name : plan.destinationId,
    visaType: info.visaType,
    feeUSD: info.feeUSD,
    appliedYear: gameYear(),
    decisionYear: gameYear() + Math.max(1, info.waitMonths),
    approvalChance: info.chance,
    status: 'pending'
  };
  S.vacation.visaApps.push(app);
  log('📋 Visa application submitted for ' + app.destinationName + '. Decision in ~' + info.waitMonths + ' months.');
  render();
};

/* ============================================================
   FINAL BOOKING (payment method selection)
   ============================================================ */
window.vacRequestApproval = function(method) {
  const plan = S.vacation.planning;
  if (!plan) return;
  const costs = vacCalculateCosts(plan);
  if (!costs) return;

  /* Check days available */
  if (S.career && S.career.job) {
    const available = vacDaysAvailable();
    if (plan.duration > available) {
      log('❌ Only ' + available + ' vacation days remaining. You requested ' + plan.duration + '.');
      render(); return;
    }
  }

  /* Check visa */
  const needsVisa = vacNeedsVisa(plan.destinationId);
  if (needsVisa.needed) {
    const pending = S.vacation.visaApps.find(function(v) {
      return v.destinationId === plan.destinationId && v.status === 'pending';
    });
    const approved = S.vacation.visaApps.find(function(v) {
      return v.destinationId === plan.destinationId && v.status === 'approved';
    });
    if (!approved) {
      if (pending) {
        log('⏳ Your visa is still pending. Decision expected ' + pending.decisionYear + '.');
      } else {
        log('❌ You need to apply for a visa first.');
      }
      render(); return;
    }
  }

  /* If employed, ask manager */
  if (S.career && S.career.job) {
    const approval = vacManagerApprovalChance(plan);
    const roll = Math.random();
    const approved = roll < approval.chance;

    /* Update boss bond regardless — asking always has small effect */
    if (S.career.job.boss) {
      S.career.job.boss.bond = Math.min(100, (S.career.job.boss.bond || 50) + (approved ? 2 : -3));
    }

    if (!approved) {
      log('❌ ' + approval.managerName + ' (' + approval.managerStyle + ') denied your time-off request. "Not at this time."');
      fx({ happiness: -6 });
      render(); return;
    }

    log('✅ ' + approval.managerName + ' approved your vacation (' + approval.managerStyle + ').');
  } else {
    log('✅ You are self-employed — no manager approval needed.');
  }

  /* Store planned trip awaiting payment */
  S.vacation.planned = { plan: plan, costs: costs, method: method, needsVisa: needsVisa };
  render();
};

window.vacBookTrip = function(paymentMethod) {
  const planned = S.vacation.planned;
  if (!planned) return;
  const costs = planned.costs;
  const plan = planned.plan;

  /* Payment */
  let paid = false;
  if (paymentMethod === 'cash') {
    if (S.wealth < costs.totalLocal) { log('❌ Need ' + money(costs.totalLocal) + ' in cash.'); render(); return; }
    S.wealth -= costs.totalLocal;
    paid = true;
    log('💵 Paid ' + money(costs.totalLocal) + ' for the trip (cash).');
  } else if (paymentMethod === 'card') {
    const cards = (S.bank && S.bank.creditCards) || [];
    const usable = cards.filter(function(c) { return (c.limit || 0) - (c.balance || 0) >= costs.totalLocal; });
    if (!usable.length) { log('❌ No card with enough credit available.'); render(); return; }
    const card = usable[0];
    card.balance = (card.balance || 0) + costs.totalLocal;
    if (card.cashbackRate > 0) S.bank.cashbackBal = (S.bank.cashbackBal || 0) + Math.round(costs.totalLocal * card.cashbackRate);
    paid = true;
    log('💳 Charged ' + money(costs.totalLocal) + ' to ' + card.name + ' for the trip.');
  } else if (paymentMethod === 'loan') {
    if (!S.bank) { log('❌ No bank available.'); render(); return; }
    if (!Array.isArray(S.bank.loans)) S.bank.loans = [];
    const years = 2;
    const rate = 0.18;
    const totalOwed = Math.round(costs.totalLocal * (1 + rate * years));
    const monthlyPayment = Math.ceil(totalOwed / (years * 12));
    const monthlyIncome = ((S.career && S.career.job ? S.career.job.salary : 0) + (S.job ? S.job.salary : 0)) / 12;
    if (monthlyPayment > monthlyIncome * 0.40) {
      log('❌ Bank declined. Monthly payment ' + money(monthlyPayment) + ' exceeds 40% of income.');
      render(); return;
    }
    S.bank.loans.push({
      id: 'vacation_loan_' + Math.random().toString(36).slice(2, 8),
      name: 'Vacation Loan: ' + costs.dest.name,
      loanType: 'vacation',
      principal: costs.totalLocal,
      remaining: totalOwed,
      rate: rate,
      monthsLeft: years * 12,
      monthsTotal: years * 12,
      monthlyPayment: monthlyPayment,
      startYear: gameYear(),
      missedPayments: 0
    });
    paid = true;
    log('🏦 Vacation Loan: ' + money(monthlyPayment) + '/mo × ' + years + ' years (' + money(totalOwed) + ' total).');
  }

  if (!paid) return;

  /* Consume vacation days */
  if (S.career && S.career.job) {
    S.vacationDaysUsedThisYear = (S.vacationDaysUsedThisYear || 0) + plan.duration;
  }

  /* Execute trip immediately */
  vacExecuteTrip(plan, costs);
  S.vacation.planned = null;
  S.vacation.planning = null;
  S.vacation.tab = 'history';
  render();
};

/* ============================================================
   TRIP EXECUTION
   ============================================================ */
function vacExecuteTrip(plan, costs) {
  const dest = costs.dest;
  const days = plan.duration;

  /* Base happiness from trip */
  let happy = (costs.classDef.happiness || 0) + (costs.hotelDef.happiness || 0);
  happy += Math.min(15, Math.round(days * 0.8));

  /* Trip style */
  const style = VAC_TRIP_STYLES.find(function(s) { return s.id === plan.tripStyle; });
  if (style) {
    happy += style.happyMod || 0;
    if (style.healthMod) fx({ health: style.healthMod });
    if (style.smartsMod) fx({ smarts: style.smartsMod });
  }

  /* Spending */
  happy += (costs.spendingDef.happyMod || 0);

  /* Family effects */
  const spouseIncluded = plan.travelers && plan.travelers.spouse;
  const childIds = (plan.travelers && plan.travelers.children) || [];

  if (spouseIncluded && S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    const spouseBondUp = 5 + (style && style.bondMod ? style.bondMod : 0) + Math.min(10, Math.floor(days * 0.4));
    S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + spouseBondUp);
    happy += 5;
    /* Spouse traits affect */
    const traits = S.marriage.partner.traits || [];
    if (traits.indexOf('adventurous') >= 0 && style && style.id === 'adventure') { S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + 5); }
    if (traits.indexOf('homebody') >= 0 && style && style.id === 'party') { S.marriage.partner.bond = Math.max(0, S.marriage.partner.bond - 5); }
  }

  childIds.forEach(function(cid) {
    const child = (S.childrenList || []).find(function(x) { return x.id === cid; });
    if (!child) return;
    const childHappy = 6 + Math.floor(days * 0.5);
    child.happiness = Math.min(100, (child.happiness || 70) + childHappy);
    child.bond = Math.min(100, (child.bond || 55) + 4);
    if (!Array.isArray(child.events)) child.events = [];
    child.events.push({ year: gameYear(), event: 'Family trip to ' + dest.name });
  });

  /* ---- Fire random trip events ---- */
  const eligible = VAC_TRIP_EVENTS.filter(function(ev) {
    if (ev.requiresSpouse && !spouseIncluded) return false;
    if (ev.requiresChild && !childIds.length) return false;
    if (ev.requiresJob && !(S.career && S.career.job)) return false;
    return true;
  });

  const numEvents = 3 + Math.floor(Math.random() * 4);
  const firedEvents = [];
  let eventCostUSD = 0;
  let eventHappy = 0;
  let eventHealth = 0;
  let eventSoc = 0;
  let eventSmarts = 0;

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
    /* Friend made during trip */
    if (chosen.id === 'made_friend' && typeof friendMeet === 'function') {
      /* Auto-add a friend if system present */
      try {
        const pool = (typeof FRIEND_NAMES !== 'undefined' && FRIEND_NAMES[dest.country]) || FRIEND_NAMES.egy;
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

  /* Deduct extra event cost from wealth (post-trip surprise) */
  if (eventCostUSD > 0) {
    const extraCostLocal = vacUSD(eventCostUSD);
    if (S.wealth >= extraCostLocal) {
      S.wealth -= extraCostLocal;
      log('💸 Extra costs during trip: ' + money(extraCostLocal));
    } else {
      S.wealth -= extraCostLocal;
      log('💸 Extra costs during trip: ' + money(extraCostLocal) + ' (put you into debt).');
    }
  }

  /* Apply final effects */
  happy += eventHappy;
  fx({ happiness: Math.max(-20, happy) });
  if (eventHealth) fx({ health: eventHealth });
  if (eventSoc) fx({ social: eventSoc });
  if (eventSmarts) fx({ smarts: eventSmarts });

  /* Add to history */
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
   VISA / MANAGER YEAR TICK
   ============================================================ */
GameHooks.on('year', function() {
  ensureVacationState();
  if (!S) return;

  /* Process pending visa apps */
  S.vacation.visaApps.forEach(function(app) {
    if (app.status !== 'pending') return;
    if (gameYear() < app.decisionYear) return;
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
});

/* ============================================================
   MAIN VIEW
   ============================================================ */
function vacationsView() {
  ensureVacationState();
  if (S.age < 18) return '<div class="card"><h3>✈️ Vacations</h3><p class="muted">Available from age 18+.</p></div>';

  const pendingVisaCount = S.vacation.visaApps.filter(function(v) { return v.status === 'pending'; }).length;
  const hasPlanned = !!S.vacation.planned;
  const hasPlanning = !!S.vacation.planning;

  const tabs = [
    ['destinations', '🌍 Destinations'],
    ['applications', '📋 Applications' + (pendingVisaCount > 0 ? ' (' + pendingVisaCount + ')' : '')],
    ['history', '📖 History (' + S.vacation.history.length + ')']
  ];
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
  else if (currentTab === 'plan') html += vacRenderPlan();
  else if (currentTab === 'checkout') html += vacRenderCheckout();
  else if (currentTab === 'applications') html += vacRenderApplications();
  else if (currentTab === 'history') html += vacRenderHistory();

  return html;
}

/* ---------- DESTINATIONS LIST ---------- */
function vacRenderDestinations() {
  const byRegion = {};
  VAC_DESTINATIONS.forEach(function(d) {
    if (!byRegion[d.region]) byRegion[d.region] = [];
    byRegion[d.region].push(d);
  });

  let html = '<div class="card"><h3>🌍 Choose Your Destination</h3>' +
    '<p class="muted small">Tap a destination to see full pricing and options.</p></div>';

  const regionLabels = {
    mena: '🏜 Middle East & North Africa',
    europe: '🏛 Europe',
    asia: '🏯 Asia',
    north_america: '🗽 North America',
    oceania: '🦘 Oceania',
    south_america: '🌴 South America',
    africa: '🦁 Africa'
  };

  Object.keys(byRegion).forEach(function(region) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee;margin-bottom:8px">' + (regionLabels[region] || region.toUpperCase()) + '</h4>';
    byRegion[region].forEach(function(d) {
      const flight = vacBaseFlightUSD(d.id);
      const visa = vacNeedsVisa(d.id);
      const isCurrentCountry = d.country === S.country;
      const minCost = Math.round(flight * 1.0 + 25 * d.days_typical + 100 * d.days_typical);

      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="flex:1"><div style="font-weight:700">' + d.name + (isCurrentCountry ? ' 🏠' : '') + '</div>' +
        '<div class="muted small">' + d.tag + '</div>' +
        '<div class="muted small">' +
        '✈️ ' + money(vacUSD(flight)) + ' · ' +
        '📅 typical ' + d.days_typical + ' days · ' +
        (visa.needed ? '📋 Visa required' : '✅ No visa') +
        '</div>' +
        '<div class="muted small">Safety ' + d.safety + '/10 · Language ' + d.language.toUpperCase() + '</div>' +
        '</div></div>' +
        '<div style="margin-top:8px;display:flex;gap:6px">' +
        '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;background:#22d3ee;color:#000;font-weight:700" onclick="vacStartPlanning(\'' + d.id + '\')">Plan trip →</button>' +
        '</div>' +
        '</div>';
    });
    html += '</div>';
  });

  return html;
}

/* ---------- PLAN TAB ---------- */
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
    (S.career && S.career.job ? '<div class="muted small" style="margin-top:6px">You have ' + daysAvail + ' days remaining ' + (enoughDays ? '✓' : '<span class="bad">— not enough!</span>') + '</div>' : '') +
    '</div>';

  /* Airfare class */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">✈️ Airfare Class</h4>';
  VAC_AIRFARE_CLASSES.forEach(function(c) {
    const active = plan.airfareClass === c.id;
    const costLocal = vacUSD(costs.baseFlightUSD * c.mult);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'airfareClass\',\'' + c.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + c.label + (active ? ' ✓' : '') + '</b><span>' + money(costLocal) + '/person</span></div>' +
      '<div class="muted small">Comfort +' + (c.comfort || 0) + ' · Happiness +' + (c.happiness || 0) + '</div></button>';
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
      '<div class="muted small">' + s.desc + ' · Happy +' + s.happyMod + (s.healthMod ? ' · Health ' + (s.healthMod > 0 ? '+' : '') + s.healthMod : '') + '</div></button>';
  });
  html += '</div>';

  /* Spending */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">💵 Daily Spending</h4>';
  VAC_SPENDING_OPTIONS.forEach(function(s) {
    const active = plan.spending === s.id;
    const costLocal = vacUSD(s.usdPerDay * plan.duration);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'spending\',\'' + s.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + s.label + (active ? ' ✓' : '') + '</b><span>' + money(costLocal) + '</span></div>' +
      '<div class="muted small">$' + s.usdPerDay + '/day · Happy ' + (s.happyMod > 0 ? '+' : '') + s.happyMod + '</div></button>';
  });
  html += '</div>';

  /* Travelers */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">👥 Travelers</h4>';
  html += '<div class="row"><span>You (always)</span><b>✓</b></div>';
  if (spouseAvailable) {
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (plan.travelers.spouse ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'spouse\',true)">' +
      '<div style="display:flex;justify-content:space-between"><b>' + S.marriage.partner.name + ' (spouse)' + (plan.travelers.spouse ? ' ✓' : '') + '</b><span>' + (plan.travelers.spouse ? 'Included' : 'Add') + '</span></div></button>';
  }
  childrenAvailable.forEach(function(c) {
    const active = plan.travelers.children.indexOf(c.id) >= 0;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'child\',\'' + c.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + c.name + ' (age ' + c.age + ')' + (active ? ' ✓' : '') + '</b><span>' + (active ? 'Included' : 'Add') + '</span></div></button>';
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

  /* Travel insurance */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">🛡 Travel Insurance</h4>';
  html += '<button class="opt" style="width:100%;text-align:left;padding:8px;font-size:.78rem;' + (plan.travelInsurance ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'travelInsurance\',!' + plan.travelInsurance + ')">' +
    '<div style="display:flex;justify-content:space-between"><b>Travel Insurance' + (plan.travelInsurance ? ' ✓' : '') + '</b><span>~' + money(vacUSD(50 + costs.dest.tier === 'luxury' ? 200 : 100)) + '</span></div>' +
    '<div class="muted small">Covers medical, luggage, cancellations. Recommended.</div></button>';
  html += '</div>';

  /* Notice */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">📢 Notice to Manager</h4>';
  VAC_NOTICE_OPTIONS.forEach(function(n) {
    const active = plan.notice === n.id;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem;' + (active ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="vacPlanSet(\'notice\',\'' + n.id + '\')">' +
      '<div><b>' + n.label + (active ? ' ✓' : '') + '</b></div>' +
      '<div class="muted small">' + n.desc + ' (Approval ' + (n.approvalMod > 0 ? '+' : '') + Math.round(n.approvalMod * 100) + '%)</div></button>';
  });
  html += '</div>';

  /* Visa status */
  if (visa.needed) {
    html += '<div class="card" style="border-color:#fbbf24"><h4 style="font-size:.85rem;color:#fbbf24">📋 Visa</h4>' +
      (approvedVisa ? '<div class="good" style="font-weight:700">✅ Visa APPROVED</div>' :
        pendingVisa ? '<div class="bad" style="font-weight:700">⏳ Visa pending — decision expected ' + pendingVisa.decisionYear + '</div>' :
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
    '</div>';

  /* Submit */
  const canProceed = enoughDays && (visa.needed ? (approvedVisa || pendingVisa) : true);
  html += '<button class="opt" style="margin-top:10px;width:100%;text-align:center;font-size:.85rem;font-weight:700;padding:12px;background:' + (canProceed ? '#34d399' : '#25253a') + ';color:' + (canProceed ? '#000' : '#666') + '" ' + (canProceed ? '' : 'disabled') + ' onclick="vacRequestApproval()">' +
    (canProceed ? '📝 Review & Approve' : (!enoughDays ? 'Not enough vacation days' : (visa.needed && !approvedVisa ? 'Visa required first' : 'Cannot proceed'))) +
    '</button>';

  return html;
}

/* ---------- CHECKOUT TAB ---------- */
function vacRenderCheckout() {
  const planned = S.vacation.planned;
  if (!planned) return '<div class="card"><p class="muted small">No plan to check out.</p></div>';
  const costs = planned.costs;

  let html = '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">💳 Checkout: ' + costs.dest.name + '</h3>' +
    '<div class="row"><span>Duration</span><b>' + costs.days + ' days</b></div>' +
    '<div class="row"><span>Travelers</span><b>' + costs.travelers.adults + ' adult' + (costs.travelers.adults > 1 ? 's' : '') + (costs.travelers.children > 0 ? ' + ' + costs.travelers.children + ' child' + (costs.travelers.children > 1 ? 'ren' : '') : '') + '</b></div>' +
    '<div class="row"><span>Airfare class</span><b>' + costs.classDef.label + '</b></div>' +
    '<div class="row"><span>Accommodation</span><b>' + costs.hotelDef.label + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>TOTAL</b><b class="good" style="font-size:1.15rem">' + money(costs.totalLocal) + '</b></div>' +
    '</div>';

  /* Manager approved - show check */
  html += '<div class="card" style="border-color:#34d399"><p class="muted small">✅ Manager approved · ✅ Visa handled</p></div>';

  /* Payment methods */
  html += '<div class="card"><h3>Choose Payment Method</h3>';

  /* Cash */
  const canCash = S.wealth >= costs.totalLocal;
  html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.85rem;' + (canCash ? 'background:#34d39920;border-color:#34d399' : 'opacity:.5') + '" ' + (canCash ? '' : 'disabled') + ' onclick="vacBookTrip(\'cash\')">' +
    '<div style="display:flex;justify-content:space-between"><b>💵 Pay Cash</b><span>' + money(costs.totalLocal) + '</span></div>' +
    '<div class="muted small">From your pocket (' + money(S.wealth) + ' available) ' + (canCash ? '' : '— insufficient') + '</div></button>';

  /* Card */
  const cards = (S.bank && S.bank.creditCards) || [];
  const usableCards = cards.filter(function(c) { return (c.limit || 0) - (c.balance || 0) >= costs.totalLocal; });
  if (cards.length === 0) {
    html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.85rem;opacity:.5" disabled>' +
      '<div><b>💳 Pay by Credit Card</b></div><div class="muted small">No credit cards. Get one in Banking tab.</div></button>';
  } else if (usableCards.length === 0) {
    html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.85rem;opacity:.5" disabled>' +
      '<div><b>💳 Pay by Credit Card</b></div><div class="muted small">No card with enough available credit</div></button>';
  } else {
    usableCards.forEach(function(card) {
      const avail = (card.limit || 0) - (card.balance || 0);
      html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.85rem;background:#22d3ee20;border-color:#22d3ee" onclick="vacBookTrip(\'card\')">' +
        '<div style="display:flex;justify-content:space-between"><b>💳 ' + card.name + '</b><span>' + money(costs.totalLocal) + '</span></div>' +
        '<div class="muted small">' + money(avail) + ' available of ' + money(card.limit) + ' · Cashback ' + Math.round((card.cashbackRate || 0) * 100) + '%</div></button>';
    });
  }

  /* Loan */
  const monthlyIncome = ((S.career && S.career.job ? S.career.job.salary : 0) + (S.job ? S.job.salary : 0)) / 12;
  const totalOwed = Math.round(costs.totalLocal * 1.36);
  const monthlyPayment = Math.ceil(totalOwed / 24);
  const loanEligible = monthlyIncome > 0 && monthlyPayment <= monthlyIncome * 0.40;
  html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.85rem;' + (loanEligible ? 'background:#fbbf2420;border-color:#fbbf24' : 'opacity:.5') + '" ' + (loanEligible ? '' : 'disabled') + ' onclick="vacBookTrip(\'loan\')">' +
    '<div style="display:flex;justify-content:space-between"><b>🏦 Vacation Loan</b><span>' + money(monthlyPayment) + '/mo</span></div>' +
    '<div class="muted small">2 years @ 18% · ' + money(totalOwed) + ' total ' + (loanEligible ? '' : '— declined (income too low)') + '</div></button>';

  html += '</div>';

  html += '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="S.vacation.planned=null;S.vacation.tab=\'plan\';render()">← Back to planning</button>';

  return html;
}

/* ---------- APPLICATIONS TAB ---------- */
function vacRenderApplications() {
  const pending = S.vacation.visaApps.filter(function(v) { return v.status === 'pending'; });
  const decided = S.vacation.visaApps.filter(function(v) { return v.status !== 'pending'; });

  let html = '<div class="card"><h3>📋 Visa Applications</h3></div>';

  if (!pending.length && !decided.length) {
    html += '<div class="card"><p class="muted small">No visa applications. Visit Destinations tab to plan a trip.</p></div>';
    return html;
  }

  if (pending.length) {
    html += '<div class="card" style="border-color:#fbbf24"><h4 style="color:#fbbf24;margin-top:0">⏳ Pending Decisions</h4>';
    pending.forEach(function(a) {
      const monthsLeft = Math.max(0, a.decisionYear - gameYear());
      html += '<div style="padding:8px 0;border-bottom:1px solid #25253a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + a.destinationName + '</b><span class="muted small">' + a.visaType.toUpperCase() + '</span></div>' +
        '<div class="muted small">Applied Year ' + a.appliedYear + ' · Cost ' + money(vacUSD(a.feeUSD)) + '</div>' +
        '<div class="muted small" style="margin-top:4px">Decision in: <b>' + monthsLeft + ' year(s)</b></div>' +
        '</div>';
    });
    html += '</div>';
  }

  if (decided.length) {
    html += '<div class="card"><h4 style="color:#a1a1aa;margin-top:0">🗄️ Past Applications</h4>';
    decided.slice().reverse().forEach(function(a) {
      const approved = a.status === 'approved';
      html += '<div style="padding:8px 0;border-bottom:1px solid #25253a">' +
        '<div style="display:flex;justify-content:space-between"><b class="' + (approved ? 'good' : 'bad') + '">' + (approved ? '✅' : '❌') + ' ' + a.destinationName + '</b><span class="muted small">' + a.visaType.toUpperCase() + '</span></div>' +
        '<div class="muted small">Decided Year ' + a.decisionYear + ' · Status: <span class="' + (approved ? 'good' : 'bad') + '">' + (approved ? 'APPROVED' : 'DENIED') + '</span></div>' +
        '</div>';
    });
    html += '</div>';
  }

  return html;
}

/* ---------- HISTORY TAB ---------- */
function vacRenderHistory() {
  let html = '<div class="card"><h3>📖 Travel History</h3>' +
    '<p class="muted small">A log of your global adventures and vacations.</p></div>';

  if (!S.vacation.history || S.vacation.history.length === 0) {
    html += '<div class="card"><p class="muted small">You haven\'t taken any trips yet.</p></div>';
    return html;
  }

  S.vacation.history.forEach(function(trip) {
    html += '<div class="card" style="border-left:3px solid #34d399;padding:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div style="flex:1"><b style="font-size:1.05rem">' + trip.destName + '</b>' +
      '<div class="muted small">Year ' + trip.year + ' · ' + trip.days + ' days</div>' +
      '<div class="muted small" style="margin-top:4px">Spent: ' + money(trip.totalCostLocal) + '</div>' +
      '</div>' +
      '<div style="text-align:right">' +
      '<div class="good" style="font-weight:700">+' + trip.happyGained + ' Happy</div>' +
      '<div class="muted small">' + (trip.travelers.adults + trip.travelers.children) + ' traveler(s)</div>' +
      '</div></div>';

    if (trip.events && trip.events.length > 0) {
      html += '<div style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px">' +
        '<b style="font-size:.75rem;color:#22d3ee">📸 TRIP HIGHLIGHTS</b>';
      trip.events.forEach(function(ev) {
        html += '<div class="muted small" style="margin-top:2px">• ' + ev + '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
  });

  return html;
}

/* ---------- REGISTER TAB ---------- */
GameHooks.registerTab({ id: 'vacation', label: '✈️ Travel', order: 12, view: vacationsView });
