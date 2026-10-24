/* ============================================================
   ILLEGAL WORK — cash-only survival for undocumented status (v2)
   ============================================================
   - Cash job pool varies by country strictness
   - No taxes, no records, no insurance, no pension
   - Savings capped (cash theft risk above threshold)
   - Deportation risk from random checks + employer betrayal
   - NEW: Fake IDs (reduces risk, costs heavy cash)
   - NEW: Wage Theft (employers exploiting undocumented status)
   - NEW: Workplace injuries & Underground Clinics
   - NEW: Expanded job market requiring certain stats
   ============================================================ */

function ensureIllegalWorkState() {
  if (!S) return;
  if (!S.illegalWork) {
    S.illegalWork = {
      current: null,
      history: [],
      lastPoliceCheckYear: 0,
      cashUnderMattress: 0,
      totalCashEarned: 0,
      hasFakeID: false,
      botchedMedical: false
    };
  }
}
GameHooks.on('newGame', ensureIllegalWorkState);
GameHooks.on('migrate', ensureIllegalWorkState);

/* ---------- UNIFIED UNDOCUMENTED CHECK ---------- */
function isUndocumented() {
  if (!S) return false;

  /* CRITICAL: You are a citizen of your home country — never undocumented there */
  const homeCountry = S.homeCountry || S.country;
  if (S.country === homeCountry) return false;

  /* Gulf work is authoritative — if active iqama is valid, you're legal */
  if (S.gulfWork && S.gulfWork.active && S.gulfWork.iqama) {
    const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
    if (S.gulfWork.iqama.expiresAbsMonth > currentAbs) return false;
    return true; /* iqama expired */
  }

  /* Otherwise trust immigration + studyAbroad */
  if (S.immigration && S.immigration.status === 'undocumented') return true;
  if (S.studyAbroad && S.studyAbroad.status === 'illegal') return true;
  return false;
}
window.isUndocumented = isUndocumented;

/* ---------- CASH JOB POOL ---------- */
const CASH_JOB_POOLS = {
  easy:   ['mena', 'south_america', 'africa'],
  medium: ['europe', 'north_america', 'oceania'],
  hard:   ['asia']
};

/* Job pool — wages in LOCAL currency per year (low) */
const CASH_JOBS = [
  { id: 'dishwasher',    label: 'Restaurant dishwasher',     dailyRateUSD: 15,  riskLevel: 1, desc: 'Steady cash under the table.' },
  { id: 'cleaning',      label: 'Cleaning crew (night)',     dailyRateUSD: 20,  riskLevel: 1, desc: 'Hotel and office cleaning.' },
  { id: 'farm',          label: 'Farm seasonal work',        dailyRateUSD: 18,  riskLevel: 1, desc: 'Picking fruit and vegetables.' },
  { id: 'nanny',         label: 'Cash Nanny / Au Pair',      dailyRateUSD: 22,  riskLevel: 1, desc: 'Live-in or daily childcare.', reqSocial: 40 },
  { id: 'carwash',       label: 'Car wash',                  dailyRateUSD: 12,  riskLevel: 0, desc: 'Underpaid but honest.' },
  { id: 'sweatshop',     label: 'Garment Sweatshop',         dailyRateUSD: 10,  riskLevel: 2, desc: 'Long hours, terrible conditions, low pay.' },
  { id: 'delivery',      label: 'Delivery rider (cash)',     dailyRateUSD: 22,  riskLevel: 2, desc: 'Bike or moped delivery for cash.' },
  { id: 'construction',  label: 'Construction laborer',      dailyRateUSD: 25,  riskLevel: 3, requiresPhysical: true, desc: 'Backbreaking work, no questions asked.' },
  { id: 'moving',        label: 'Moving crew',               dailyRateUSD: 26,  riskLevel: 2, requiresPhysical: true, desc: 'Lifting heavy boxes for cash.' },
  { id: 'unlicensed_taxi',label:'Unlicensed Gypsy Cab',      dailyRateUSD: 28,  riskLevel: 3, desc: 'Driving passengers off the grid.' },
  { id: 'mechanic',      label: 'Mechanic helper',           dailyRateUSD: 22,  riskLevel: 2, requiresPhysical: true, desc: 'Oil changes, tire swaps.' },
  { id: 'street_vendor', label: 'Street vendor',             dailyRateUSD: 20,  riskLevel: 3, desc: 'Sell trinkets to tourists.' },
  { id: 'nightshift',    label: 'Night shift factory work',  dailyRateUSD: 28,  riskLevel: 4, requiresPhysical: true, desc: 'Heavy machines, no safety net.' },
  { id: 'card_dealer',   label: 'Underground Casino Dealer', dailyRateUSD: 45,  riskLevel: 5, desc: 'High pay, high risk of raids & violence.', reqSmarts: 50 }
];

/* Country strictness — affects raid frequency & fine if caught */
const CASH_JOB_STRICTNESS = {
  egy: 0.4, sau: 0.2, uae: 0.3, tur: 0.5,
  usa: 0.7, can: 0.6, gbr: 0.75, deu: 0.85, fra: 0.7, nld: 0.7,
  jpn: 0.9, ita: 0.55, sgp: 0.95, aus: 0.65, bra: 0.4, ind: 0.4
};

/* ---------- HELPERS ---------- */
function _iwRate() { return C().rate || 1; }
function _iwLocal(usd) { return Math.round(usd * _iwRate()); }
function _iwCashCeiling() {
  const localSalary = (C().salary || 84000);
  return Math.round(localSalary * 0.25);
}
function _iwDeportationChance() {
  if (!isUndocumented()) return 0;
  const strictness = CASH_JOB_STRICTNESS[S.country] || 0.5;
  let years = 0;
  if (S.immigration && S.immigration.overstayYears) years = S.immigration.overstayYears;
  else if (S.studyAbroad && S.studyAbroad.illegalSinceAbsMonth) {
    const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
    years = Math.floor((currentAbs - S.studyAbroad.illegalSinceAbsMonth) / 12);
  }
  let chance = Math.min(0.60, (0.05 + years * 0.05) * (0.5 + strictness));
  if (S.illegalWork && S.illegalWork.hasFakeID) chance *= 0.5; /* Fake ID halves risk */
  return chance;
}

/* ---------- AVAILABLE JOBS ---------- */
window.illegalWorkAvailable = function() {
  if (!isUndocumented()) return [];
  const strictness = CASH_JOB_STRICTNESS[S.country] || 0.5;
  return CASH_JOBS.filter(function(j) {
    if (strictness >= 0.8 && j.riskLevel >= 4) return false;
    if (strictness < 0.3 && j.riskLevel === 0) return false;
    if (j.reqSmarts && S.smarts < j.reqSmarts) return false;
    if (j.reqSocial && S.social < j.reqSocial) return false;
    return true;
  });
};

/* ---------- ACTIONS ---------- */
window.illegalWorkTake = function(jobId) {
  if (!isUndocumented()) { log('❌ You need to be undocumented to take cash work.'); render(); return; }
  const job = CASH_JOBS.find(function(j) { return j.id === jobId; });
  if (!job) return;
  if (S.illegalWork.current) { log('❌ You already have a cash job. Quit it first.'); render(); return; }
  if (job.requiresPhysical && S.health < 40) { log('❌ You are too weak for this work (health ' + Math.round(S.health) + ').'); render(); return; }

  const yearlyLocal = _iwLocal(job.dailyRateUSD * 365);
  S.illegalWork.current = {
    id: job.id, label: job.label, dailyRateUSD: job.dailyRateUSD,
    yearlyLocal: yearlyLocal, riskLevel: job.riskLevel, requiresPhysical: job.requiresPhysical,
    startedYear: gameYear()
  };
  S.illegalWork.history.push({ year: gameYear(), event: 'Started ' + job.label });
  log('💸 Started cash work as ' + job.label + ' (' + money(yearlyLocal) + '/year, untaxed).');
  log('⚠️ Risk level: ' + job.riskLevel + '/5 · Undocumented · No benefits.');
  emitSignal('cashJobTaken', { job: job.label, yearlyLocal: yearlyLocal });
  render();
};

window.illegalWorkQuit = function() {
  if (!S || !S.illegalWork || !S.illegalWork.current) return;
  log('👋 Quit cash work as ' + S.illegalWork.current.label + '.');
  S.illegalWork.history.push({ year: gameYear(), event: 'Quit ' + S.illegalWork.current.label });
  S.illegalWork.current = null;
  emitSignal('cashJobQuit', {});
  render();
};

window.illegalWorkBuyFakeID = function() {
  if (S.illegalWork.hasFakeID) return;
  const cost = _iwLocal(1500);
  if (S.wealth < cost) { log('❌ You need ' + money(cost) + ' to buy a high-quality forged ID.'); return; }
  if (!confirm('Pay ' + money(cost) + ' to a black-market forger for a Fake ID?\n\n• Halves random deportation checks\n• Provides a new option during police stops')) return;
  
  S.wealth -= cost;
  S.illegalWork.hasFakeID = true;
  log('🪪 You purchased a highly convincing Fake ID on the black market.');
  render();
};

window.illegalWorkUndergroundClinic = function() {
  const cost = _iwLocal(300);
  if (S.wealth < cost) { log('❌ You need ' + money(cost) + ' for the underground doctor.'); return; }
  if (!confirm('Visit a cash-only underground clinic for ' + money(cost) + '?\n\n• No ID required\n• Small chance of botched treatment')) return;
  
  S.wealth -= cost;
  if (Math.random() < 0.15) {
    log('🚨 The underground doctor botched the procedure! Infection spreading.');
    fx({ health: -20, happiness: -15 });
  } else {
    log('🩹 The underground doctor patched you up safely.');
    fx({ health: 30, happiness: 5 });
  }
  render();
};

/* ---------- CASH THEFT ---------- */
window.illegalWorkHideCash = function() {
  if (!S || !S.illegalWork) return;
  const ceiling = _iwCashCeiling();
  if (S.illegalWork.cashUnderMattress >= ceiling) {
    log('❌ Already hiding ' + money(S.illegalWork.cashUnderMattress) + ' (max safe: ' + money(ceiling) + ').');
    render(); return;
  }
  const toHide = Math.min(ceiling - S.illegalWork.cashUnderMattress, S.wealth);
  if (toHide <= 0) { log('❌ No cash to hide.'); render(); return; }
  S.wealth -= toHide;
  S.illegalWork.cashUnderMattress += toHide;
  log('💵 Hid ' + money(toHide) + ' as cash under the mattress.');
  render();
};

window.illegalWorkRetrieveCash = function() {
  if (!S || !S.illegalWork || S.illegalWork.cashUnderMattress <= 0) return;
  const amt = S.illegalWork.cashUnderMattress;
  S.wealth += amt;
  S.illegalWork.cashUnderMattress = 0;
  log('💵 Retrieved ' + money(amt) + ' from hiding.');
  render();
};

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureIllegalWorkState();
  if (!S || !isUndocumented()) return;
  const iw = S.illegalWork;

  if (iw.current) {
    const isMonthlyGame = (typeof isMonthly === 'function' && isMonthly());
    
    /* Wage Theft (Employers exploiting undocumented status) */
    if (Math.random() < (0.05 + (iw.current.riskLevel * 0.03))) {
      const stolenWages = Math.round(iw.current.yearlyLocal / 12);
      log('😡 WAGE THEFT: Your employer withheld a month of pay (' + money(stolenWages) + '). You cannot report them to the police.');
      fx({ happiness: -15 });
      if (!isMonthlyGame) {
        S.wealth += (iw.current.yearlyLocal - stolenWages);
        iw.totalCashEarned += (iw.current.yearlyLocal - stolenWages);
      } else {
        S.wealth -= stolenWages; // Remove from existing pool since monthly tick already added it
      }
    } else {
      /* Normal Pay for Yearly */
      if (!isMonthlyGame) {
        S.wealth += iw.current.yearlyLocal;
        iw.totalCashEarned += iw.current.yearlyLocal;
        log('💸 Cash wages: +' + money(iw.current.yearlyLocal) + ' (' + iw.current.label + ', untaxed).');
      }
    }

    /* Workplace Hazards */
    if (iw.current.requiresPhysical && Math.random() < 0.20) {
      log('🤕 WORKPLACE INJURY: You were hurt on the job. No workers comp, no legal hospital access.');
      fx({ health: -25, happiness: -15 });
    }

    /* Employer betrayal roll */
    const betrayChance = iw.current.riskLevel * 0.02 * (CASH_JOB_STRICTNESS[S.country] || 0.5);
    if (Math.random() < betrayChance) {
      log('🚨 Your employer reported you to immigration to save their own skin.');
      illegalWorkTriggerRaid('betrayal');
      return;
    }
  }

  /* Random police/immigration check */
  const policeChance = _iwDeportationChance() * 0.35;
  if (Math.random() < policeChance) {
    illegalWorkTriggerRaid('police_check');
    return;
  }

  /* Cash under mattress theft */
  if (iw.cashUnderMattress > 0) {
    const ceiling = _iwCashCeiling();
    if (iw.cashUnderMattress > ceiling) {
      const steal = Math.round(iw.cashUnderMattress * (0.20 + Math.random() * 0.30));
      iw.cashUnderMattress = Math.max(0, iw.cashUnderMattress - steal);
      log('😱 Burglar broke in and stole ' + money(steal) + ' from your stash.');
      fx({ happiness: -12 });
    }
  }

  /* Deportation attempt */
  const deportChance = _iwDeportationChance() * 0.4;
  if (Math.random() < deportChance) {
    illegalWorkTriggerRaid('deportation');
  }
});

/* ---------- RAID / DEPORTATION HANDLER ---------- */
function illegalWorkTriggerRaid(reason) {
  const hasFake = S.illegalWork.hasFakeID;
  const scenarios = {
    betrayal: {
      title: 'Employer Betrayal',
      text: 'Immigration officers are raiding the site. Your boss sold you out.',
      options: [
        { label: 'Bribe the officer', costMult: 1.5, successChance: 0.55, outcome: 'bribe' },
        { label: 'Run and hide',      costMult: 0,   successChance: 0.45, outcome: 'flee' },
        { label: 'Surrender',         costMult: 0,   successChance: 1.00, outcome: 'deport' }
      ]
    },
    police_check: {
      title: 'Random ID Check',
      text: 'Police stopped you on the street asking for papers.',
      options: [
        { label: 'Bribe the officer', costMult: 0.8, successChance: 0.60, outcome: 'bribe' },
        { label: 'Run and hide',      costMult: 0,   successChance: 0.40, outcome: 'flee' },
        { label: 'Surrender',         costMult: 0,   successChance: 1.00, outcome: 'deport' }
      ]
    },
    deportation: {
      title: 'Deportation Sweep',
      text: 'Immigration officers are sweeping your neighborhood.',
      options: [
        { label: 'Bribe the officer', costMult: 2.0, successChance: 0.45, outcome: 'bribe' },
        { label: 'Run and hide',      costMult: 0,   successChance: 0.55, outcome: 'flee' },
        { label: 'Surrender',         costMult: 0,   successChance: 1.00, outcome: 'deport' }
      ]
    }
  };
  const scenario = scenarios[reason] || scenarios.police_check;

  if (hasFake && reason === 'police_check') {
    scenario.options.unshift({ label: 'Show Fake ID', costMult: 0, successChance: 0.80, outcome: 'fake_id' });
  }

  S.pending = {
    title: '🚨 ' + scenario.title,
    text: scenario.text,
    choices: scenario.options.map(function(opt) {
      return {
        label: opt.label + (opt.costMult > 0 ? ' (' + money(Math.round(_iwLocal(500) * opt.costMult)) + ')' : ''),
        effect: function(s) {
          const cost = Math.round(_iwLocal(500) * opt.costMult);
          if (opt.costMult > 0 && s.wealth < cost) {
            log('❌ You cannot afford the bribe.');
            illegalWorkDeport(s, 'broke');
            return;
          }
          if (opt.costMult > 0) s.wealth -= cost;

          if (opt.outcome === 'deport' || Math.random() >= opt.successChance) {
            if (opt.outcome === 'bribe') log('🚨 The officer took your money and arrested you anyway.');
            else if (opt.outcome === 'flee') log('🚨 They caught you.');
            else if (opt.outcome === 'fake_id') log('🚨 The officer scanned your Fake ID. It flagged as counterfeit.');
            
            if (opt.outcome === 'fake_id') s.illegalWork.hasFakeID = false; // Confiscated
            illegalWorkDeport(s, opt.outcome);
          } else {
            /* Success */
            if (opt.outcome === 'bribe') {
              log('💵 The officer pocketed the money and walked away.');
              fx({ happiness: -3 });
            } else if (opt.outcome === 'flee') {
              log('🏃 You escaped. That was close.');
              fx({ happiness: -5, health: -3 });
            } else if (opt.outcome === 'fake_id') {
              log('🪪 The officer glanced at your Fake ID and waved you through.');
              fx({ happiness: 2 });
            }
            emitSignal('illegalWorkSurvivedRaid', { reason: reason });
          }
        }
      };
    })
  };
  S.evId = 'illegal_work_raid';
  log('🚨 ' + scenario.title + ': ' + scenario.text);
  render();
}

function illegalWorkDeport(s, cause) {
  log('🚨 You were arrested and processed for deportation.');
  if (S.illegalWork && S.illegalWork.current) {
    S.illegalWork.current = null;
    log('💼 Lost your cash job.');
  }
  if (S.illegalWork) {
    S.illegalWork.cashUnderMattress = 0;
    S.illegalWork.hasFakeID = false;
  }

  if (typeof studyAbroadReturnHome === 'function' && S.studyAbroad) {
    studyAbroadReturnHome(true);
  } else if (S.immigration) {
    const dest = S.immigration.destination;
    const home = S.homeCountry || 'egy';
    const oldRate = (COUNTRIES[dest] ? COUNTRIES[dest].rate : 1);
    const newRate = (COUNTRIES[home] ? COUNTRIES[home].rate : 1);
    if (typeof S.wealth === 'number') S.wealth = Math.round(S.wealth / oldRate * newRate);
    S.country = home;
    S.immigration.destination = null;
    S.immigration.visaType = null;
    S.immigration.status = 'citizen_home';
    if (!Array.isArray(S.visaBans)) S.visaBans = [];
    S.visaBans.push({ country: dest, untilAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) + 60 });
    log('🚨 Deported to ' + (COUNTRIES[home] ? COUNTRIES[home].name : home) + '.');
  }
  fx({ happiness: -25, health: -5 });
  emitSignal('illegalWorkDeported', { cause: cause });
}

/* ---------- RENDER (called from career view) ---------- */
window.carRenderUnderground = function() {
  if (!isUndocumented()) return '';

  const iw = S.illegalWork || {};
  const jobs = illegalWorkAvailable();
  const current = iw.current;
  const ceiling = _iwCashCeiling();
  const deportChance = _iwDeportationChance();

  let html = '<div class="card" style="border-color:#fb7185;background:linear-gradient(180deg,#fb718515 0%,transparent 100%)">' +
    '<h3 style="color:#fb7185">🚨 Underground Work</h3>' +
    '<div class="muted small" style="margin-bottom:8px">You are undocumented in ' + (C().name || 'this country') + '. No legal work, no benefits, no records.</div>' +
    '<div class="row"><span>Annual deportation risk</span><b class="bad">' + Math.round(deportChance * 100) + '%</b></div>' +
    '<div class="row"><span>Hidden cash (under mattress)</span><b>' + money(iw.cashUnderMattress || 0) + ' / ' + money(ceiling) + '</b></div>' +
    '<div class="row"><span>Total cash earned</span><b>' + money(iw.totalCashEarned || 0) + '</b></div>' +
    '</div>';

  if (current) {
    html += '<div class="card" style="border-color:#fbbf24"><h4 style="color:#fbbf24">💸 Current Job</h4>' +
      '<div class="row"><span>Job</span><b>' + current.label + '</b></div>' +
      '<div class="row"><span>Yearly cash (untaxed)</span><b class="mono">' + money(current.yearlyLocal) + '</b></div>' +
      '<div class="row"><span>Risk level</span><b>' + current.riskLevel + '/5</b></div>' +
      '<div style="display:flex;gap:6px;margin-top:8px">' +
      '<button class="opt" style="flex:1;text-align:center;padding:6px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="illegalWorkQuit()">Quit job</button>' +
      (iw.cashUnderMattress < ceiling ? '<button class="opt" style="flex:1;text-align:center;padding:6px;font-size:.72rem" onclick="illegalWorkHideCash()">Hide cash</button>' : '') +
      (iw.cashUnderMattress > 0 ? '<button class="opt" style="flex:1;text-align:center;padding:6px;font-size:.72rem" onclick="illegalWorkRetrieveCash()">Retrieve cash</button>' : '') +
      '</div></div>';
  } else {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">💼 Available Cash Jobs</h4>' +
      '<p class="muted small" style="margin-bottom:8px">All pay under the table. No tax, no insurance, no paper trail.</p>';
    jobs.forEach(function(j) {
      const yearly = _iwLocal(j.dailyRateUSD * 365);
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + j.label + '</b><b class="mono">' + money(yearly) + '/yr</b></div>' +
        '<div class="muted small">' + j.desc + '</div>' +
        '<div class="muted small">Risk ' + j.riskLevel + '/5' + (j.requiresPhysical ? ' · Physical work' : '') + '</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.72rem;background:#34d39920;border-color:#34d399" onclick="illegalWorkTake(\'' + j.id + '\')">Take this job</button>' +
        '</div>';
    });
    html += '</div>';
  }

  /* Black Market & Survival options */
  html += '<div class="card" style="border-color:#22d3ee"><h4 style="color:#22d3ee">🕵️ Black Market & Survival</h4>' +
    '<p class="muted small">Surviving off the grid is expensive.</p>';
  if (!iw.hasFakeID) {
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="illegalWorkBuyFakeID()">' +
      '<div style="display:flex;justify-content:space-between"><b>🪪 Buy Fake ID</b><span>' + money(_iwLocal(1500)) + '</span></div>' +
      '<div class="muted small">Halves deportation checks and helps during stops.</div></button>';
  } else {
    html += '<div class="good small" style="margin-top:4px">✓ You possess a high-quality Fake ID.</div>';
  }
  if (S.health < 80) {
    html += '<button class="opt" style="width:100%;margin-top:8px;text-align:left;padding:8px;font-size:.75rem;border-color:#34d399;color:#34d399" onclick="illegalWorkUndergroundClinic()">' +
      '<div style="display:flex;justify-content:space-between"><b>🩹 Visit Underground Clinic</b><span>' + money(_iwLocal(300)) + '</span></div>' +
      '<div class="muted small">Heal without ID checks, but risk of botched treatment.</div></button>';
  }
  html += '</div>';

  /* Regularization */
  html += '<div class="card" style="border-color:#8b5cf6"><h4 style="color:#8b5cf6">🩹 Ways to Regularize</h4>' +
    '<p class="muted small">Escape routes from undocumented status:</p>' +
    '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:8px;font-size:.75rem" onclick="switchTab(\'marriage\')">💍 Marry a citizen</button>' +
    '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="switchTab(\'immigration\')">🕊 Apply for asylum</button>' +
    '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="illegalWorkLeaveVoluntarily()">🏠 Leave voluntarily</button>' +
    '</div>';

  return html;
};

window.illegalWorkLeaveVoluntarily = function() {
  if (!confirm('Leave ' + (C().name || 'this country') + ' voluntarily?\n\n• No deportation ban\n• Can return on a proper visa later\n• No criminal record')) return;
  if (typeof studyAbroadReturnHome === 'function' && S.studyAbroad) {
    studyAbroadReturnHome(false);
  } else if (S.immigration) {
    const dest = S.immigration.destination;
    const home = S.homeCountry || 'egy';
    const oldRate = (COUNTRIES[dest] ? COUNTRIES[dest].rate : 1);
    const newRate = (COUNTRIES[home] ? COUNTRIES[home].rate : 1);
    if (typeof S.wealth === 'number') S.wealth = Math.round(S.wealth / oldRate * newRate);
    S.country = home;
    S.immigration.destination = null;
    S.immigration.visaType = null;
    S.immigration.status = 'citizen_home';
    log('🏠 Returned home to ' + (COUNTRIES[home] ? COUNTRIES[home].name : home) + '.');
  }
  render();
};

/* ---------- MONTHLY PACING CASH WAGES ---------- */
GameHooks.on('month', function() {
  if (!isUndocumented() || !S || !S.illegalWork || !S.illegalWork.current) return;
  if (!(typeof isMonthly === 'function' && isMonthly())) return;
  
  const monthlyPay = Math.round(S.illegalWork.current.yearlyLocal / 12);
  S.wealth += monthlyPay;
  S.illegalWork.totalCashEarned += monthlyPay;
  log('💸 Cash wages: +' + money(monthlyPay) + ' (' + S.illegalWork.current.label + ').');
});

console.log('[World Life] 31-illegal-work.js loaded — v2 (Fake IDs, Exploitation, Hazards)');
