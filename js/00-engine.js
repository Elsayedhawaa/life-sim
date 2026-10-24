/* ============================================================
   WORLD LIFE — ENGINE (hardened)
   ============================================================ */

const SAVE_KEY = 'world_life_v5';
let S = null;
let activeTab = 'life';
let START = {
  name: '', gender: 'm', country: 'egy', familyTier: 'middle', parentType: 'balanced',
  pacing: (function() {
    try { return localStorage.getItem('wl_pacing') || 'yearly'; } catch(e) { return 'yearly'; }
  })()
};

/* ============================================================
   GAMEHOOKS
   ============================================================ */
const GameHooks = {
  year: [], month: [], render: [], newGame: [], migrate: [],
  tabs: [],
  on(name, fn) { if (!this[name]) this[name] = []; this[name].push(fn); },
  run(name, ...args) { if (this[name]) this[name].forEach(fn => { try { fn(...args); } catch(e) { console.error(e); } }); },
  registerTab(tab) { this.tabs.push(tab); },
};

/* ============================================================
   DATA GUARD
   ============================================================ */
function dataOK() {
  return typeof COUNTRIES !== 'undefined' && COUNTRIES && COUNTRIES.egy;
}

/* ============================================================
   HELPERS
   ============================================================ */
function C() {
  const fb = { id: 'unknown', name: 'Unknown', flag: '?', currency: '?', prices: {}, schools: [], universities: [], jobs: [], events: [] };
  if (!dataOK()) return fb;
  
  const c = COUNTRIES[S?.country] || COUNTRIES.egy;
  
  if (typeof HISTORICAL_RATES !== 'undefined' && HISTORICAL_RATES[c.id]) {
    const history = HISTORICAL_RATES[c.id];
    const y = gameYear();
    let activeRate = history[0].rate;
    
    for (let i = 0; i < history.length; i++) {
      if (y >= history[i].year) activeRate = history[i].rate;
      else break;
    }
    
    if (c._devalMult) activeRate *= c._devalMult;
    c.rate = activeRate;
  }
  
  return c;
}
function gameYear() { return 2001 + (S?.age || 6); }
function money(n) { const c = C(); return Math.round(n).toLocaleString() + ' ' + c.currency; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }

/* ---------- PACING & CALENDAR HELPERS ---------- */
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function isMonthly() { return S && S.pacing === 'monthly'; }
function currentMonth() { return (S && S.month) ? S.month : 1; }
function monthName(m) { return MONTH_NAMES[((m || 1) - 1) % 12] || 'January'; }
function currentMonthName() { return monthName(currentMonth()); }
function currentSeason() {
  const m = currentMonth();
  if (m === 12 || m <= 2) return 'winter';
  if (m <= 5) return 'spring';
  if (m <= 8) return 'summer';
  return 'autumn';
}

function isHomeCountry() {
  return S && S.country === (S.homeCountry || S.country);
}
window.isHomeCountry = isHomeCountry;

function currentAbsMonth() {
  return (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
}
window.currentAbsMonth = currentAbsMonth;
function isSummer() { return currentSeason() === 'summer'; }
function isSchoolMonth() { return currentMonth() === 9 || currentMonth() === 1; }
function monthsUntil(targetMonth) {
  let diff = (targetMonth - currentMonth() + 12) % 12;
  return diff === 0 ? 12 : diff;
}
function monthlyScale(annual) { return isMonthly() ? (annual || 0) / 12 : (annual || 0); }

function isRamadanMonth() {
  if (!isMonthly()) return false;
  const y = gameYear();
  const cycle = (y - 2024) % 33;
  const monthShift = Math.floor(cycle / 3);
  let rm = 3 - monthShift;
  while (rm < 1) rm += 12;
  while (rm > 12) rm -= 12;
  return currentMonth() === rm;
}

function log(msg) {
  if (!S.log) S.log = [];
  S.log.unshift({ age: S.age, year: gameYear(), month: S.month || null, msg: msg });
  if (S.log.length > 300) S.log.pop();
}

function fx(effects) {
  if (!effects || !S) return;

  /* Health, smarts, social stay as direct writes (they are real resources) */
  ['health', 'smarts', 'social'].forEach(k => {
    if (typeof effects[k] === 'number') S[k] = clamp(S[k] + effects[k], 0, 100);
  });

  /* Happiness is now a MOOD — routed to override, not the base */
  if (typeof effects.happiness === 'number') {
    if (typeof addHappiness === 'function') addHappiness(effects.happiness);
  }

  if (typeof effects.wealth === 'number') S.wealth += effects.wealth;
}

/* ============================================================
   UNITY PASS — WEEK 2: DERIVED HAPPINESS
   ============================================================
   Happiness is computed from life state each render.
   Event mood swings live in S.happinessOverride (decays yearly).
   ============================================================ */

function computeHappiness() {
  if (!S) return 50;
  var h = 50;

  /* --- MARRIAGE --- */
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    var bond = S.marriage.partner.bond || 70;
    h += (bond - 50) * 0.5;
    if (typeof S.marriage.motherInLawBond === 'number' && S.marriage.motherInLawBond < 30) h -= 5;
  } else if (S.marriage && S.marriage.status === 'divorced') {
    h -= 10;
  } else if (S.marriage && S.marriage.status === 'engaged' && S.marriage.partner) {
    h += 8;
  } else if (S.marriage && S.marriage.status === 'dating' && S.marriage.partner) {
    h += 4;
  } else if (S.age > 30 && S.age < 55) {
    h -= 5;
  }

  /* --- CHILDREN --- */
  if (S.childrenList && S.childrenList.length > 0) {
    var avgChildBond = S.childrenList.reduce(function(s, c) { return s + (c.bond || 55); }, 0) / S.childrenList.length;
    h += (avgChildBond - 50) * 0.4;
    h += Math.min(8, S.childrenList.length * 2);
    if (S.childrenList.some(function(c) { return (c.bond || 55) < 30; })) h -= 8;
  }

  /* --- PARENTS --- */
  var livingParents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false;
  });
  if (livingParents.length > 0) {
    var avgParentBond = livingParents.reduce(function(s, m) { return s + (m.bond || 70); }, 0) / livingParents.length;
    h += (avgParentBond - 50) * 0.25;
  } else if (S.age > 40) {
    h -= 3;
  }

  /* --- FRIENDS --- */
  var friends = S.friends || [];
  if (friends.length > 0) {
    var avgFriendBond = friends.reduce(function(s, f) { return s + (f.bond || 50); }, 0) / friends.length;
    h += Math.min(6, friends.length) * 1.5;
    h += (avgFriendBond - 50) * 0.1;
  } else if (S.age > 25) {
    h -= 8;
  }

  /* --- CAREER --- */
  if (S.career && S.career.job) {
    h += ((S.career.job.performance || 50) - 50) * 0.2;
    if ((S.career.job.tenure || 0) > 3) h += 3;
    if ((S.career.job.performance || 50) < 30) h -= 8;
  } else if (S.age >= 25 && S.age < 60) {
    h -= 12;
  }

  /* --- MONEY --- */
  var w = S.wealth || 0;
  var yearExpenses = (S.household && S.household.expenses) ||
    ((C().prices.food || 0) + (C().prices.rent || 0) + (C().prices.transport || 0));
  if (w < 0) h -= 20;
  else if (yearExpenses > 0 && w < yearExpenses) h -= 8;
  else if (yearExpenses > 0 && w > yearExpenses * 5) h += 5;

  /* --- HEALTH --- */
  if (S.health > 80) h += 5;
  else if (S.health < 40) h -= 15;
  else if (S.health < 60) h -= 5;

  /* --- HOUSING --- */
  if (S.housing === 'parents' && S.age >= 30) h -= 10;
  if (S.housing === 'owned') h += 3;

  /* --- DEBT STRESS --- */
  if (S.bank && Array.isArray(S.bank.loans)) {
    var totalDebt = S.bank.loans.reduce(function(s, l) { return s + (l.remaining || 0); }, 0);
    if (totalDebt > 0 && totalDebt > Math.max(0, w) * 2) h -= 6;
  }

  return Math.max(0, Math.min(100, Math.round(h)));
}
window.computeHappiness = computeHappiness;

function addHappiness(n) {
  if (!S || !n) return;
  if (typeof S.happinessOverride !== 'number') S.happinessOverride = 0;
  S.happinessOverride = (S.happinessOverride || 0) + n;
  if (S.happinessOverride > 30) S.happinessOverride = 30;
  if (S.happinessOverride < -30) S.happinessOverride = -30;
}
window.addHappiness = addHappiness;

/* ============================================================
   NEW LIFE
   ============================================================ */
function newLife() {
  if (!dataOK()) {
    alert('Cannot start a new life — game data (js/01-data-countries.js) failed to load.\n\nOpen browser console (F12) for the exact error.');
    return;
  }
  const c = COUNTRIES[START.country];
  if (!c) {
    alert('Country "' + START.country + '" not found.');
    return;
  }
  S = {
    name: START.name || 'You',
    gender: START.gender,
    country: START.country,
    currency: c.currency,
    month: 1,
    pacing: START.pacing || 'yearly',
    pacingSwitchYear: 0,
    age: 6,
    health: 100, happiness: 100, smarts: 50, social: 50,
    wealth: 0,
    school: null,
    uni: null,
    degree: null,
    job: null,
    spouse: null,
    children: 0,
    housing: 'parents',
    family: [],
    familyTier: START.familyTier,
    parentType: START.parentType,
    log: [],
    flags: {},
       pending: null,
    evId: null,
    evtMemory: {},
    pendingQueue: [],
  };
  S.family.push({ role: 'Mother', name: 'Mother', age: 30, bond: 70, alive: true });
  S.family.push({ role: 'Father', name: 'Father', age: 32, bond: 70, alive: true });
  log(`Born in ${c.name}, 2007. You are 6 years old.`);
  log(START.gender === 'f' ? 'You are a girl.' : 'You are a boy.');
  log(`Family: ${START.familyTier} · Parents: ${START.parentType}.`);
  if (typeof GLOBAL_EVENTS !== 'undefined' && GLOBAL_EVENTS.length) {
    S.pending = prepareEvent(GLOBAL_EVENTS[0]);
  }
    unityPass();
  GameHooks.run('newGame', S);
  save(); render();
}

/* ============================================================
   EVENT PREPARATION
   ============================================================ */
function prepareEvent(e) {
  if (!e) return null;

  if (e.dynamic === 'school') {
    const c = C();
    return {
      title: e.title,
      text: e.text,
      choices: (c.schools || []).map(sch => ({
        label: `${sch.name}${sch.cost > 0 ? ' (' + sch.cost.toLocaleString() + ' ' + c.currency + '/yr, family pays)' : ' (free)'}`,
        effect: s => { s.school = sch.id; }
      }))
    };
  }

  var prepared = Object.assign({}, e);
  if (typeof prepared.text === 'function') {
    try { prepared.text = prepared.text(S); } catch (err) { prepared.text = '...'; }
  }
  if (typeof prepared.title === 'function') {
    try { prepared.title = prepared.title(S); } catch (err) { prepared.title = 'Event'; }
  }
  return prepared;
}
/* ============================================================
   AGE UP
   ============================================================ */
function engineYearTick() {
  if (!S) return;

  if (S.age >= 6 && S.age < 18 && S.school) {
    const sch = C().schools.find(x => x.id === S.school);
    if (sch) S.smarts = clamp(S.smarts + sch.smarts, 0, 100);
  }

  if (S.age === 18 && S.school && !S.uni && !S.degree) {
    const score = clamp(S.smarts + Math.random() * 20 - 10, 0, 100);
    S.thanaweyaScore = score;
    log(`Thanaweya amma result: ${score.toFixed(1)}%`);
  }

  if (S.uni) {
    S.uni.year = (S.uni.year || 0) + 1;
    if (S.uni.year >= (S.uni.yearsTotal || 4)) {
      S.degree = S.uni.major || 'general';
      log(`Graduated from ${S.uni.name} with a degree in ${S.degree}!`);
      S.uni = null;
    } else {
      log(`University year ${S.uni.year}/${S.uni.yearsTotal || 4} complete.`);
    }
  }

  if (S.age > 50) S.health = clamp(S.health - 1, 0, 100);
}

function advanceYear() {
  if (S.pending) return;

  S.age++;
  S.family.forEach(m => { if (m.alive) m.age++; });

  engineYearTick();

   /* Keep legacy S.job and S.career.job in sync */
  if (S.career && S.career.job && S.job) {
    S.job.title = S.career.job.title || S.job.title;
    S.job.salary = S.career.job.salary || S.job.salary;
    S.job.level = S.career.job.level || S.job.level || 0;
    S.job.company = S.career.job.company || S.job.company;
  } else if (S.career && S.career.job && !S.job) {
    S.job = {
      title: S.career.job.title,
      salary: S.career.job.salary,
      level: S.career.job.level || 0,
      company: S.career.job.company,
      years: S.career.job.tenure || 0
    };
  } else if (S.job && (!S.career || !S.career.job)) {
    if (S.career) {
      S.career.job = {
        title: S.job.title,
        salary: S.job.salary,
        company: S.job.company,
        track: 'entry',
        level: S.job.level || 0,
        baseSalaryEGP: S.job.salary,
        payMult: 1.0,
        performance: 50,
        hiredYear: gameYear() - (S.job.years || 0),
        tenure: S.job.years || 0,
        benefits: [],
        stability: 0.85,
        prestige: 3,
        salaryCurrency: C().currency
      };
    }
  }

  if (S.job) {
    S.wealth += S.job.salary;
    S.job.years = (S.job.years || 0) + 1;
    if (S.job.years >= 2 && Math.random() < 0.15) {
      S.job.level = (S.job.level || 0) + 1;
      S.job.salary = Math.round(S.job.salary * 1.3);
      S.job.title = 'Senior ' + S.job.title;
      log(`Promoted to ${S.job.title}! Salary now ${money(S.job.salary)}/year.`);
    }
    if (Math.random() < 0.03) {
      log(`You were fired from ${S.job.company}.`);
      S.job = null;
    }
  }

   GameHooks.run('year', S);

  /* Unified household economy — single charge, replaces all scattered charges */
  if (typeof chargeHousehold === 'function') chargeHousehold(12);

  ['health', 'happiness', 'smarts', 'social'].forEach(k => { S[k] = clamp(S[k], 0, 100); });
 
    /* Ambient life flavor — happens every year */
  if (typeof ambientFlavor === 'function') ambientFlavor(3);

  if (!S.pending) {
    var _evt = pickEligibleEvent();
    if (_evt && Math.random() < 0.95) {
      S.pending = prepareEvent(_evt);
      S.evId = _evt.id;
      log('📖 ' + (_evt.title || 'Event'));
    }
  }

  /* Mood decay — override fades each year (emotional beats fade over time) */
  if (S && typeof S.happinessOverride === 'number' && S.happinessOverride !== 0) {
    S.happinessOverride = S.happinessOverride * 0.65;
    if (Math.abs(S.happinessOverride) < 0.5) S.happinessOverride = 0;
  }

  save(); render();
}
 
function advanceMonth(silent) {
  if (S.pending) return;

  S.month = (S.month || 1) + 1;

    if (S.month > 12) {
    S.month = 1;
    S.age++;
    S.family.forEach(m => { if (m.alive) m.age++; });
    engineYearTick();
    ['health', 'happiness', 'smarts', 'social'].forEach(k => { S[k] = clamp(S[k], 0, 100); });
    GameHooks.run('year', S);

    /* Mood decay — same as advanceYear, fires at each January rollover */
    if (S && typeof S.happinessOverride === 'number' && S.happinessOverride !== 0) {
      S.happinessOverride = S.happinessOverride * 0.65;
      if (Math.abs(S.happinessOverride) < 0.5) S.happinessOverride = 0;
    }
  }

   GameHooks.run('month', S, { month: S.month, isYearEnd: S.month === 1 });

  /* Unified household economy — monthly slice */
  if (typeof chargeHousehold === 'function') chargeHousehold(1);

  /* Ambient life flavor — happens every month */
  if (typeof ambientFlavor === 'function' && !silent) ambientFlavor(1);

  if (!silent) { save(); render(); }
}

function ageUp() {
  if (!S) return;
  if (S.pending) {
    if (isMonthly()) advanceMonth();
    else advanceYear();
    return;
  }

  var _before = snapshotForNarrative();
  if (isMonthly()) advanceMonth();
  else advanceYear();
  var _after = snapshotForNarrative();

  /* If a big event fired, don't show beat — player resolves the event first */
  if (S.pending) return;

  /* Show year beat */
  try {
    var _bullets = narrateYear(_before, _after);
    if (_bullets && _bullets.length) showYearBeat(gameYear(), S.age, _bullets);
  } catch (e) { console.warn('[Beat]', e); }
}

function chooseEvent(i) {
  var e = S.pending;
  if (!e || !e.choices[i]) return;
  var choice = e.choices[i];
  if (typeof choice.available === 'function' && !choice.available(S)) return;
  if (typeof choice.effect === 'function') choice.effect(S);
  ['health', 'happiness', 'smarts', 'social'].forEach(function(k) { S[k] = clamp(S[k], 0, 100); });
  if (S.evId) {
    S.flags['evt_' + S.evId] = true;
    S.flags['evt_count_' + S.evId] = (S.flags['evt_count_' + S.evId] || 0) + 1;
  }
  var label = typeof choice.label === 'function' ? choice.label(S) : choice.label;
  log('→ ' + label);
  S.pending = null;
  S.evId = null;
  save(); render();
}
/* ============================================================
   EVENT CARD (UI for pending events)
   ============================================================ */
function eventCard(pending) {
  if (!pending) return '';
  var html = '<div class="card" style="border-color:#8b5cf6; background:#14141f;">' +
    '<h3 style="color:#8b5cf6">' + pending.title + '</h3>' +
    '<p class="small" style="white-space:pre-wrap; margin-bottom:12px;">' + pending.text + '</p>' +
    '<div style="display:flex; flex-direction:column; gap:8px;">';

  pending.choices.forEach(function(choice, index) {
    if (typeof choice.available === 'function' && !choice.available(S)) return;
    var label = typeof choice.label === 'function' ? choice.label(S) : choice.label;
    html += '<button class="opt" style="text-align:center; background:#25253a; border-color:#8b5cf6; font-weight:bold;" onclick="chooseEvent(' + index + ')">' + label + '</button>';
  });

  html += '</div></div>';
  return html;
}
/* ============================================================
   RENDER
   ============================================================ */
function render() {
  if (!S) { renderStart(); return; }
     /* Derive happiness from actual life state */
  if (typeof computeHappiness === 'function') {
    S.happiness = Math.max(0, Math.min(100, computeHappiness() + (S.happinessOverride || 0)));
  }

  if (!dataOK()) {
    document.getElementById('header').innerHTML = '';
    document.getElementById('tabs').innerHTML = '';
    document.getElementById('bottom').innerHTML = '';
    document.getElementById('view').innerHTML = `
      <div class="card" style="border-color:#fb7185;background:#1a0a12">
        <h2 style="color:#fb7185">⚠️ Game data not loaded</h2>
        <p class="muted small" style="margin-top:8px;line-height:1.6">
          <b>js/01-data-countries.js</b> failed to load. Fix the file and refresh.
        </p>
        <p class="muted small" style="margin-top:8px">
          Restart the game to see the start screen with full instructions:
        </p>
        <button onclick="reset()" class="opt" style="margin-top:10px;background:#8b5cf6;color:#fff;font-weight:700">Reset and retry</button>
      </div>`;
    return;
  }

  document.getElementById('header').innerHTML = header();
  document.getElementById('tabs').innerHTML = tabs();
  const viewFn = getViewFn(activeTab);
  document.getElementById('view').innerHTML =
    (S.pending ? eventCard(S.pending) : '') +
    viewFn();
  const b = document.getElementById('bottom');
  if (S.pending) b.innerHTML = `<button disabled>Choose an option above</button>`;
  else if (S.age >= 100) b.innerHTML = `<button onclick="reset()">Life complete — Start over</button>`;
  else if (isMonthly()) {
    const nextMonth = (currentMonth() % 12) + 1;
    const nextMonthName = monthName(nextMonth);
    const yearLabel = nextMonth === 1 ? ` (Age ${S.age + 1})` : '';
    const canFF = currentMonth() !== 1;
    b.innerHTML = `<div style="display:flex;gap:6px">
      <button onclick="ageUp()" style="flex:3">Next Month → ${nextMonthName}${yearLabel}</button>
      <button onclick="fastForwardToYearEnd()" ${canFF ? '' : 'disabled'} style="flex:0 0 60px;background:#4b5563;padding:14px;border:none;border-radius:10px;color:#fff;font-size:1.1rem;cursor:pointer" title="Fast-forward to January">⏩</button>
    </div>`;
  }
  else b.innerHTML = `<button onclick="ageUp()">Next Year → Age ${S.age + 1}</button>`;
  GameHooks.run('render', S);
}

function getViewFn(tabId) {
  const tab = GameHooks.tabs.find(t => t.id === tabId);
  if (tab) return tab.view;
  const sorted = [...GameHooks.tabs].sort((a, b) => a.order - b.order);
  if (sorted.length) { activeTab = sorted[0].id; return sorted[0].view; }
  return () => '<div class="card"><h3>No views registered</h3><p class="muted">Add view files in js/ and load them in index.html.</p></div>';
}

function header() {
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div>
                  <div class="muted" style="font-size:.7rem;letter-spacing:.06em">AGE ${S.age}${isMonthly() ? ' · ' + currentMonthName() : ''} · ${gameYear()} · ${C().flag} ${C().name}</div>
        <div style="font-size:1.15rem;font-weight:bold;margin-top:2px">${S.name} ${S.gender==='f'?'♀':'♂'}</div>
            ${typeof lifeSummaryHtml === 'function' ? lifeSummaryHtml() : ''}
        ${typeof lifeWarningsHtml === 'function' ? lifeWarningsHtml() : ''}
      </div>
      <div style="text-align:right">
        <div class="muted" style="font-size:.7rem">WEALTH</div>
        <div class="mono ${S.wealth < 0 ? 'bad' : 'good'}" style="font-weight:bold">${money(S.wealth)}</div>
                <div style="margin-top:4px;display:flex;gap:6px;justify-content:flex-end;align-items:center">
          <button onclick="togglePacing()" style="background:none;border:none;color:#8b5cf6;font-size:.65rem;cursor:pointer;padding:0;text-decoration:underline">${isMonthly() ? '🗓 monthly' : '📅 yearly'}</button>
          <button onclick="reset()" style="background:none;border:none;color:#666;font-size:.65rem;cursor:pointer;text-decoration:underline;padding:0">restart</button>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
      ${stat('Health', S.health, '#fb7185')}
      ${stat('Happiness', S.happiness, '#fbbf24')}
      ${stat('Smarts', S.smarts, '#22d3ee')}
      ${stat('Social', S.social, '#8b5cf6')}
    </div>
  </div>`;
}

function stat(n, v, color) {
  return `<div><div style="display:flex;justify-content:space-between;font-size:.7rem;color:#888"><span>${n}</span><span>${v}%</span></div><div style="height:4px;background:#25253a;border-radius:2px;margin-top:3px"><div style="height:100%;width:${v}%;background:${color};border-radius:2px"></div></div></div>`;
}

/* ============================================================
   NAVIGATION TABS & MORE MENU
   ============================================================ */
function tabs() {
  const sorted = [...GameHooks.tabs].sort((a, b) => a.order - b.order);
  
  // We choose 4 core tabs to live in the bottom bar
  const primaryTabs = ['life', 'career', 'family', 'bank'];
  let primaryHtml = '';
  let moreHtml = '';

  sorted.forEach(t => {
    // Extract emoji from label (e.g., "🎓 Education" -> icon: "🎓", text: "Education")
    const parts = t.label.split(' ');
    const icon = parts.length > 1 && parts[0].length <= 3 ? parts[0] : '📄';
    const text = parts.length > 1 && parts[0].length <= 3 ? parts.slice(1).join(' ') : t.label;
    
    if (primaryTabs.includes(t.id)) {
      primaryHtml += `<button class="${activeTab === t.id ? 'on' : ''}" onclick="switchTab('${t.id}')">
        <span class="icon">${icon}</span>
        <span>${text}</span>
      </button>`;
    } else {
      moreHtml += `<button class="${activeTab === t.id ? 'on' : ''}" onclick="switchTab('${t.id}'); closeMoreMenu();">
        <span class="icon">${icon}</span>
        <span class="label">${text}</span>
      </button>`;
    }
  });

  // Add the "More" button to the primary dock
  const moreIsActive = !primaryTabs.includes(activeTab);
  primaryHtml += `<button class="${moreIsActive ? 'on' : ''}" onclick="openMoreMenu()">
      <span class="icon">☰</span>
      <span>More</span>
    </button>`;

  // Inject the HTML into the "More" modal grid
  const moreGrid = document.getElementById('more-grid-content');
  if (moreGrid) {
    moreGrid.innerHTML = moreHtml;
  }

  return primaryHtml;
}

window.openMoreMenu = function() {
  const menu = document.getElementById('more-menu');
  if (menu) menu.classList.add('active');
};

window.closeMoreMenu = function() {
  const menu = document.getElementById('more-menu');
  if (menu) menu.classList.remove('active');
};

/* ============================================================
   START SCREEN
   ============================================================ */
function renderStart() {
  document.getElementById('header').innerHTML = '';
  document.getElementById('tabs').innerHTML = '';
  document.getElementById('bottom').innerHTML = '';

  if (!dataOK()) {
    document.getElementById('view').innerHTML = `
      <div class="card" style="border-color:#fb7185;background:#1a0a12">
        <h2 style="color:#fb7185;margin-bottom:8px">⚠️ Game data failed to load</h2>
        <p class="muted small" style="line-height:1.6">
          <b>js/01-data-countries.js</b> has a syntax error and was skipped by the browser.
        </p>
        <button onclick="location.reload(true)" class="opt" style="margin-top:14px;background:#8b5cf6;color:#fff;font-weight:700;text-align:center">Reload page</button>
      </div>`;
    return;
  }

  const countryKeys = Object.keys(COUNTRIES);
  document.getElementById('view').innerHTML = `
    <div class="card" style="text-align:center;padding:24px">
      <h1 style="font-size:2rem;color:#8b5cf6;margin-bottom:4px">World Life</h1>
      <p class="muted small">A life simulator. Born 2001. Start at age 6.</p>
    </div>
    <div class="card">
      <h3>Your name</h3>
      <input id="start-name" value="${START.name}" placeholder="Enter name" oninput="START.name=this.value">
    </div>
    <div class="card">
      <h3>You are</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">
        <button class="pill ${START.gender==='m'?'on':''}" onclick="setGender('m')">👨 Man</button>
        <button class="pill ${START.gender==='f'?'on':''}" onclick="setGender('f')">👩 Woman</button>
      </div>
    </div>
    <div class="card">
      <h3>Born in</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:6px">
        ${countryKeys.map(id => {
          const c = COUNTRIES[id];
          return `<button class="pill ${START.country===id?'on':''}" onclick="setCountry('${id}')">${c.flag}<br><span class="small">${c.name}</span></button>`;
        }).join('')}
      </div>
    </div>
 <div class="card">
  <h3>Family Wealth</h3>
  <p class="muted small" style="margin-bottom:8px">Affects inheritance, financial support expectations, and family request frequency.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:6px">
    <button class="pill ${START.familyTier === 'poor' ? 'on' : ''}" style="padding:8px 4px;font-size:.72rem" onclick="START.familyTier='poor';renderStart()">Poor</button>
    <button class="pill ${START.familyTier === 'lower-mid' ? 'on' : ''}" style="padding:8px 4px;font-size:.72rem;letter-spacing:-0.5px" onclick="START.familyTier='lower-mid';renderStart()">Lower-middle</button>
    <button class="pill ${START.familyTier === 'middle' ? 'on' : ''}" style="padding:8px 4px;font-size:.72rem" onclick="START.familyTier='middle';renderStart()">Middle</button>
    <button class="pill ${START.familyTier === 'upper-mid' ? 'on' : ''}" style="padding:8px 4px;font-size:.72rem;letter-spacing:-0.5px" onclick="START.familyTier='upper-mid';renderStart()">Upper-middle</button>
    <button class="pill ${START.familyTier === 'wealthy' ? 'on' : ''}" style="padding:8px 4px;font-size:.72rem" onclick="START.familyTier='wealthy';renderStart()">Wealthy</button>
    <button class="pill ${START.familyTier === 'ultra' ? 'on' : ''}" style="padding:8px 4px;font-size:.72rem;letter-spacing:-0.5px" onclick="START.familyTier='ultra';renderStart()">Ultra-wealthy</button>
  </div>
</div>
    <div class="card">
      <h3>Game pace</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:6px">
        <button class="pill ${START.pacing==='yearly'?'on':''}" onclick="START.pacing='yearly';renderStart()">📅 Yearly</button>
        <button class="pill ${START.pacing==='monthly'?'on':''}" onclick="START.pacing='monthly';renderStart()">🗓 Monthly</button>
      </div>
      <p class="muted small" style="margin-top:6px">Yearly = 1 click per year. Monthly = 12 clicks per year, with seasonal events and monthly bills.</p>
    </div>
    <div class="card">
      <h3>Parents</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:6px">
        <button class="pill ${START.parentType==='strict'?'on':''}" onclick="START.parentType='strict';renderStart()">Strict</button>
        <button class="pill ${START.parentType==='balanced'?'on':''}" onclick="START.parentType='balanced';renderStart()">Balanced</button>
        <button class="pill ${START.parentType==='warm'?'on':''}" onclick="START.parentType='warm';renderStart()">Warm</button>
      </div>
    </div>
    <button onclick="startGame()" style="width:100%;padding:16px;background:#8b5cf6;color:#fff;border:none;border-radius:10px;font-size:1rem;font-weight:bold;cursor:pointer;margin-top:10px">Begin Life</button>
    ${localStorage.getItem(SAVE_KEY) ? `<button onclick="loadGame()" style="width:100%;padding:14px;background:transparent;color:#8b5cf6;border:1px solid #8b5cf6;border-radius:10px;font-size:.9rem;cursor:pointer;margin-top:8px">Continue saved life</button>` : ''}
  `;
}

function setGender(g) { START.gender = g; renderStart(); }
function setCountry(c) { START.country = c; renderStart(); }
function startGame() {
  try { localStorage.setItem('wl_pacing', START.pacing || 'yearly'); } catch(e) {}
  newLife();
  activeTab = 'life';
  render();
}

/* ============================================================
   SAVE / LOAD / RESET
   ============================================================ */
function save() {
  if (!S) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(S));
  } catch(e) {
    console.error('Failed to save game:', e);
  }
}
window.save = save;

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
         S = JSON.parse(raw);
      unityPass();
      GameHooks.run('migrate', S);
      if (typeof chargeHousehold === 'function') chargeHousehold(0);
      /* Migration: ensure new fields exist on old saves */
      if (!S.evtMemory) S.evtMemory = {};
      if (typeof S.gulfWork === 'undefined' && typeof ensureGulfWorkState === 'function') ensureGulfWorkState();
      if (typeof S.studyAbroad === 'undefined') S.studyAbroad = null;
      if (!Array.isArray(S.pendingQueue)) S.pendingQueue = [];
      /* UNITY PASS Week 1: unify dual state (S.job/S.spouse/S.children) */
      if (typeof unityPass === 'function') unityPass();
      GameHooks.run('migrate', S);
      activeTab = 'life';
      render();
      return true;
    }
  } catch(e) { console.error(e); }
  renderStart();
  return false;
}
function reset() {
  if (!confirm('Reset and start over?')) return;
  localStorage.removeItem(SAVE_KEY);
  S = null;
  renderStart();
}

/* ============================================================
   COUNTRY-CHANGE DETECTOR
   ============================================================ */
GameHooks.on('render', function() {
  if (!S) return;

  if (typeof S._lastCountry === 'undefined') {
    S._lastCountry = S.country;
    const isAbroad = S.homeCountry && S.country !== S.homeCountry;
    if (isAbroad) {
      if (S.career && Array.isArray(S.career.offers)) {
        const stale = S.career.offers.filter(function(o) { return !o.country; });
        if (stale.length > 0) {
          S.career.offers = S.career.offers.filter(function(o) { return o.country === S.country; });
          log('📍 ' + stale.length + ' legacy offer' + (stale.length > 1 ? 's' : '') + ' cleared (from before you relocated).');
        }
      }
      if (S.pending) {
        log('📍 Stale pending event cleared (you relocated).');
        S.pending = null;
        S.evId = null;
      }
    }
    return;
  }

  if (S._lastCountry === S.country) return;

  const from = S._lastCountry;
  const to = S.country;
  S._lastCountry = to;

  if (S.career && Array.isArray(S.career.offers)) {
    const before = S.career.offers.length;
    S.career.offers = S.career.offers.filter(function(o) { return o.country === to; });
    const cleared = before - S.career.offers.length;
    if (cleared > 0) log('📍 ' + cleared + ' pending offer' + (cleared > 1 ? 's' : '') + ' from your previous country expired.');
  }

  if (S.career && Array.isArray(S.career.applications)) {
    S.career.applications = S.career.applications.filter(function(a) {
      return !a.country || a.country === to;
    });
  }

  if (S.pending) {
    log('📍 Pending event cancelled due to relocation.');
    S.pending = null;
    S.evId = null;
  }

  emitSignal('countryChanged', { from: from, to: to });
});

/* ============================================================
   WINDOW BINDINGS & UTILS
   ============================================================ */
window.fastForwardToYearEnd = function() {
  if (!isMonthly()) return;
  if (S.pending) { log('Resolve the pending event first.'); return; }
  if (currentMonth() === 1) { log('Already in January. Click Next Month or switch to yearly.'); return; }

  let safety = 14;
  while (S.month !== 1 && safety > 0) {
    advanceMonth(true);
    safety--;
    if (S.pending) {
      save(); render();
      log('⏩ Stopped at event in ' + currentMonthName() + '. Resolve it first.');
      return;
    }
  }
  save(); render();
  log('⏩ Fast-forwarded to January ' + gameYear() + '.');
};

window.convertToPlayerCurrency = function(amount, fromCountryCode) {
  if (!amount) return 0;
  const fromRate = (COUNTRIES[fromCountryCode] && COUNTRIES[fromCountryCode].rate) || 1;
  const toRate = C().rate || 1;
  return Math.round((amount / fromRate) * toRate);
};

/* ============================================================
   CAR SHIPPING / SELLING / STORAGE ON COUNTRY CHANGE
   ============================================================ */
onSignal('countryChanged', function(data) {
  if (!S || !S.cars || S.cars.length === 0) return;

  const fromCountry = data.from;
  const toCountry = data.to;
  const homeCountry = S.homeCountry || 'egy';
  const fromName = COUNTRIES[fromCountry] ? COUNTRIES[fromCountry].name : fromCountry;
  const toName   = COUNTRIES[toCountry]   ? COUNTRIES[toCountry].name   : toCountry;

  /* ---------- STEP 1: Reactivate cars already parked in the destination ---------- */
  let reactivated = 0;
  S.cars.forEach(function(c) {
    if (c.storedIn === toCountry) {
      c.storedIn = null;
      reactivated++;
    }
  });
  if (reactivated > 0) {
    log('🚗 ' + reactivated + ' car' + (reactivated > 1 ? 's are' : ' is') +
        ' back in use — waiting for you in ' + toName + '.');
  }

  /* ---------- STEP 2: Handle cars currently with the player in fromCountry ---------- */
  // Only deal with cars that are actually "here" (not already stored elsewhere).
  const activeCars = S.cars.filter(function(c) {
    return !c.storedIn || c.storedIn === fromCountry;
  });
  if (activeCars.length === 0) return;

  const totalValue = activeCars.reduce(function(sum, c) { return sum + (c.value || 0); }, 0);
  const shipCost   = Math.round(totalValue * 0.40); // 40% of value in customs & freight
  const canStore   = fromCountry !== toCountry;
  const storageLabel = (fromCountry === homeCountry)
    ? ('your home garage in ' + fromName)
    : ('a garage in ' + fromName);

  let text = 'You moved to ' + toName + '. What do you want to do with your ' +
             activeCars.length + ' car(s)?';
  if (canStore) {
    text += '\n\nYou can leave them in ' + storageLabel +
            ' for free — they\'ll be waiting when you return.';
  }

  const choices = [
    {
      label: '💰 Sell them before leaving',
      effect: function(s) {
        const net = Math.round(totalValue * 0.8); // 20% dealer commission
        s.wealth += net;
        // Remove only the active cars; keep anything already stored elsewhere
        s.cars = s.cars.filter(function(c) {
          return c.storedIn && c.storedIn !== fromCountry;
        });
        log('💰 You sold your cars for ' + money(net) + ' before moving.');
      }
    },
    {
      label: '🚢 Ship them to ' + toName + ' (' + money(shipCost) + ')',
      effect: function(s) {
        if (s.wealth >= shipCost) {
          s.wealth -= shipCost;
          activeCars.forEach(function(c) { c.storedIn = null; });
          log('🚢 You shipped your cars to ' + toName +
              ' (' + money(shipCost) + ' in customs & freight).');
        } else {
          log('❌ You couldn\'t afford shipping. The cars were abandoned at the port and auctioned.');
          s.cars = s.cars.filter(function(c) {
            return c.storedIn && c.storedIn !== fromCountry;
          });
        }
      }
    }
  ];

  if (canStore) {
    choices.push({
      label: '🏠 Leave in ' + storageLabel + ' (free)',
      effect: function(s) {
        activeCars.forEach(function(c) { c.storedIn = fromCountry; });
        log('🏠 Your cars are parked in ' + storageLabel +
            '. They\'ll be waiting when you return.');
      }
    });
  }

  S.pending = {
    title: '🚗 International Move: Your Cars',
    text: text,
    choices: choices
  };
  S.evId = 'car_move_' + gameYear();
});

/* ============================================================
   SIGNAL BUS
   ============================================================ */
const SIGNAL_LOG_MAX = 80;
const SIGNAL_MAX_DEPTH = 5;
let _signalDepth = 0;

function emitSignal(type, data) {
  if (!S) return;
  if (_signalDepth >= SIGNAL_MAX_DEPTH) {
    if (typeof console !== 'undefined') console.warn('[Signal] max depth — skipped:', type);
    return;
  }
  if (!Array.isArray(S._signalLog)) S._signalLog = [];
  S._signalLog.unshift({ y: gameYear(), m: S.month || null, type: type, data: data || {} });
  if (S._signalLog.length > SIGNAL_LOG_MAX) S._signalLog.length = SIGNAL_LOG_MAX;

  _signalDepth++;
  try {
    GameHooks.run('signal_' + type, data || {});
  } catch (e) {
    if (typeof console !== 'undefined') console.error('[Signal]', type, e);
  } finally {
    _signalDepth--;
  }
}

function onSignal(type, fn) {
  GameHooks.on('signal_' + type, fn);
}

window.emitSignal = emitSignal;
window.onSignal = onSignal;
window.getSignalHistory = function(type) {
  if (!S || !Array.isArray(S._signalLog)) return [];
  if (!type) return S._signalLog.slice();
  return S._signalLog.filter(function(s) { return s.type === type; });
};

window.ageUp = ageUp;
window.chooseEvent = chooseEvent;
window.switchTab = (id) => { activeTab = id; render(); };
window.startGame = startGame;
window.setGender = setGender;
window.setCountry = setCountry;
window.loadGame = loadGame;
window.reset = reset;
window.renderStart = renderStart;
window.dataOK = dataOK;
window.START = START;
/* ============================================================
   EVENT SELECTOR — gender-aware, weighted, respects maxFires
   ============================================================ */
function pickEligibleEvent() {
  if (!S) return null;
   var allEvents = [];
  if (typeof GLOBAL_EVENTS !== 'undefined') allEvents = allEvents.concat(GLOBAL_EVENTS);
  if (typeof GENDER_EVENTS !== 'undefined') allEvents = allEvents.concat(GENDER_EVENTS);
  if (typeof DEEP_EVENTS !== 'undefined') allEvents = allEvents.concat(DEEP_EVENTS);
  if (C() && C().events) allEvents = allEvents.concat(C().events);

  var eligible = allEvents.filter(function(e) {
    if (S.age < (e.minAge || 0) || S.age > (e.maxAge || 200)) return false;
    if (e.genderOnly && e.genderOnly !== S.gender) return false;
    var fired = S.flags['evt_count_' + e.id] || 0;
    var maxFires = (typeof e.maxFires === 'number') ? e.maxFires : 1;
    if (fired >= maxFires) return false;
    if (e.condition && !e.condition(S)) return false;
    return true;
  });
  if (!eligible.length) return null;

  var totalWeight = eligible.reduce(function(sum, e) { return sum + (e.weight || 1); }, 0);
  var roll = Math.random() * totalWeight;
  for (var i = 0; i < eligible.length; i++) {
    roll -= (eligible[i].weight || 1);
    if (roll <= 0) return eligible[i];
  }
  return eligible[eligible.length - 1];
}
window.pickEligibleEvent = pickEligibleEvent;
/* ============================================================
   UNITY PASS — WEEK 1: STATE UNIFICATION
   ============================================================
   Merges every dual-state field to one source of truth:
     S.job     → S.career.job (getter/setter)
     S.spouse  → S.marriage.partner (getter/setter)
     S.children → derived from S.childrenList.length (getter, read-only)
   Old code that does `S.job = ...` still works — setter routes it.
   Old code that does `S.job.salary` still works — getter reads career.
   ============================================================ */

function migrateDualState() {
  if (!S) return;

  /* Ensure canonical structures exist */
  if (!S.career) S.career = {};
  if (!S.marriage) S.marriage = { status: 'single', partner: null };
  if (!S.bank) S.bank = {};
  if (!Array.isArray(S.childrenList)) S.childrenList = [];
  if (!Array.isArray(S.bank.creditCards)) S.bank.creditCards = [];
  if (!S.evtMemory || typeof S.evtMemory !== 'object') S.evtMemory = {};
  if (!Array.isArray(S.pendingQueue)) S.pendingQueue = [];
  if (!S.relMemory || typeof S.relMemory !== 'object') S.relMemory = {};
  /* --- JOB: legacy S.job → S.career.job --- */
  if (S.job && !S.career.job) {
    S.career.job = {
      title: S.job.title || 'Worker',
      salary: S.job.salary || 0,
      level: S.job.level || 0,
      company: S.job.company || 'Unknown',
      track: S.career.track || 'entry',
      baseSalaryEGP: S.job.salary || 0,
      payMult: 1.0,
      performance: 50,
      hiredYear: gameYear() - (S.job.years || 0),
      tenure: S.job.years || 0,
      benefits: [],
      stability: 0.85,
      prestige: 3,
      salaryCurrency: C().currency
    };
  }

  /* --- SPOUSE: legacy S.spouse → S.marriage.partner --- */
  if (S.spouse && !S.marriage.partner) {
    S.marriage.partner = {
      name: S.spouse.name || 'Partner',
      age: S.spouse.age || S.age,
      gender: S.spouse.gender || (S.gender === 'm' ? 'f' : 'm'),
      bond: S.spouse.bond || 70,
      trust: 50,
      chemistry: 50,
      compatibility: 55,
      traits: S.spouse.traits || ['kind'],
      income: S.spouse.income || 0,
      source: 'legacy',
      alive: S.spouse.alive !== false,
      marriedYear: gameYear()
    };
    if (S.marriage.status === 'single') S.marriage.status = 'married';
  }
  /* --- HAPPINESS OVERRIDE (Week 2 migration) --- */
  if (typeof S.happinessOverride !== 'number') {
    S.happinessOverride = 0;
    if (typeof computeHappiness === 'function') {
      var _comp = computeHappiness();
      if (S.happiness > _comp + 15) {
        S.happinessOverride = 8;
        log('💭 Life has caught up with you. Some things you had forgotten are weighing on your mind.');
      }
    }
  }
     /* WEEK 6: derive m.home from current S.housing if married */
  if (S.marriage && S.marriage.status === 'married' && !S.marriage.home) {
    if (S.housing === 'rented') S.marriage.home = 'small_rent';
    else if (S.housing === 'owned') S.marriage.home = 'owned_apartment';
    else if (S.housing === 'parents') S.marriage.home = 'family_home';
    else S.marriage.home = 'family_home';
  }

  /* WEEK 6: whisper state */
  if (!S.whisperLog || typeof S.whisperLog !== 'object') S.whisperLog = {};
  if (!S.whisperFiredYear || typeof S.whisperFiredYear !== 'object') S.whisperFiredYear = {};
  ['layoff', 'divorce', 'bankruptcy', 'health', 'parentdeath', 'migration'].forEach(function(cat) {
    if (!Array.isArray(S.whisperLog[cat])) S.whisperLog[cat] = [];
  });

  /* --- PREGNANCY: legacy S.pregnantMonths → S.pregnancy --- */
  if (S.pregnantMonths && S.pregnantMonths > 0 && !S.pregnancy) {
    S.pregnancy = {
      active: true,
      startYear: gameYear(),
      monthsElapsed: S.pregnantMonths,
      isIVF: false,
      motherIsPlayer: S.gender === 'f',
      fatherIsPlayer: S.gender === 'm',
      knownGender: null,
      plannedHospital: 'private',
      complications: [],
      planningChecklist: { clothes: false, clothesTier: null, nursery: false, nurseryTier: null, name: null },
      eventLog: []
    };
    S.pregnantMonths = 0;
  }
}

function unifyState() {
  if (!S) return;

  /* JOB — routes to S.career.job */
  try {
    Object.defineProperty(S, 'job', {
      configurable: true,
      enumerable: false,
      get: function() { return (S.career && S.career.job) || null; },
      set: function(v) {
        if (!S.career) S.career = {};
        if (v === null || v === undefined) {
          S.career.job = null;
        } else if (!S.career.job) {
          S.career.job = v;
        } else {
          Object.keys(v).forEach(function(k) { S.career.job[k] = v[k]; });
        }
      }
    });
  } catch (e) { console.warn('[Unity] S.job getter failed:', e); }

  /* SPOUSE — routes to S.marriage.partner */
  try {
    Object.defineProperty(S, 'spouse', {
      configurable: true,
      enumerable: false,
      get: function() { return (S.marriage && S.marriage.partner) || null; },
      set: function(v) {
        if (!S.marriage) S.marriage = { status: 'single', partner: null };
        if (v === null || v === undefined) {
          S.marriage.partner = null;
        } else if (!S.marriage.partner) {
          S.marriage.partner = v;
        } else {
          Object.keys(v).forEach(function(k) { S.marriage.partner[k] = v[k]; });
        }
      }
    });
  } catch (e) { console.warn('[Unity] S.spouse getter failed:', e); }

  /* CHILDREN — derived from S.childrenList.length (read-only) */
  try {
    Object.defineProperty(S, 'children', {
      configurable: true,
      enumerable: false,
      get: function() { return (S.childrenList || []).length; },
      set: function(v) {
        if (typeof v === 'number' && v !== (S.childrenList || []).length) {
          console.warn('[Unity] S.children write ignored — derived from childrenList.length (' + (S.childrenList || []).length + ')');
        }
      }
    });
  } catch (e) { console.warn('[Unity] S.children getter failed:', e); }
}

function unityPass() {
  migrateDualState();
  unifyState();
}
window.unityPass = unityPass;

/* Idempotent re-application on every render — safety net */
GameHooks.on('render', function() {
  if (!S) return;
  var isUnified = false;
  try {
    var desc = Object.getOwnPropertyDescriptor(S, 'job');
    if (desc && typeof desc.get === 'function') isUnified = true;
  } catch(e) {}
  if (!isUnified) {
    unityPass();
  }
});
/* ============================================================
   AMBIENT FLAVOR — life feels alive even without big events
   ============================================================ */
function ambientFlavor(count) {
  if (!S) return;
  count = count || 1;

  var pool = [];

  /* --- Childhood (6-17): parents + school --- */
  if (S.age < 18) {
    if (S.family) {
      S.family.forEach(function(m) {
        if (m.alive === false) return;
        if (m.role === 'Mother' || m.role === 'Father') {
          var bond = m.bond || 70;
          if (bond > 75) {
            pool.push(m.name + ' hugged you before you left for school.');
            pool.push(m.name + ' made your favorite breakfast without being asked.');
          } else if (bond > 45) {
            pool.push(m.name + ' asked how your day was.');
            pool.push(m.name + ' was on the phone when you got home.');
          } else {
            pool.push(m.name + ' barely looked up when you walked in.');
            pool.push('The house was quiet. ' + m.name + ' was in their room.');
          }
        }
        if (m.isSibling || m.role === 'Brother' || m.role === 'Sister') {
          pool.push('You and ' + m.name + ' argued over the TV remote.');
          pool.push(m.name + ' borrowed something from your room without asking.');
        }
      });
    }
    if (S.school) {
      var schoolFlavor = [
        'A teacher told you that you had potential.',
        'You fell asleep in class and someone nudged you.',
        'You ate lunch alone today. Nobody noticed.',
        'You laughed so hard at lunch your stomach hurt.',
        'The school bell rang. You were the first to leave.'
      ];
      pool.push(schoolFlavor[Math.floor(Math.random() * schoolFlavor.length)]);
    }
  }
  /* --- Adult (18+) --- */
  else {
    /* Spouse */
    if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
      var p = S.marriage.partner;
      var pBond = p.bond || 70;
      var trait = (Array.isArray(p.traits) ? p.traits[0] : p.trait) || 'balanced';
      if (pBond > 75) {
        if (trait === 'romantic') pool.push(p.name + ' left a note on the fridge just to say "I love you."');
        else if (trait === 'funny') pool.push(p.name + ' sent you a meme that made you laugh out loud.');
        else pool.push(p.name + ' made you tea without asking. "You looked tired."');
        pool.push(p.name + ' reached for your hand at dinner. Small, quiet moments.');
      } else if (pBond > 45) {
        if (trait === 'grumpy') pool.push(p.name + ' grumbled about the weather all morning.');
        else if (trait === 'ambitious') pool.push(p.name + ' was on their laptop till midnight again.');
        else pool.push(p.name + ' was quiet at dinner tonight. Not much was said.');
        pool.push('You and ' + p.name + ' watched TV in comfortable silence.');
      } else {
        pool.push(p.name + ' slept in the other room again.');
        pool.push('Dinner was silent. ' + p.name + ' left the table early.');
        pool.push('You and ' + p.name + ' have not talked properly in weeks.');
      }
    } else if (S.marriage && S.marriage.status === 'divorced') {
      pool.push('You woke up alone. The apartment felt too quiet.');
      pool.push('You caught yourself thinking about someone who is not here anymore.');
    }

    /* Children */
    if (S.childrenList && S.childrenList.length > 0) {
      S.childrenList.forEach(function(c) {
        if (c.movedOut) return;
        if (c.age < 3) {
          pool.push(c.name + ' laughed at something only they understood.');
        } else if (c.age < 6) {
          pool.push(c.name + ' asked "why?" seventeen times in a row.');
          pool.push(c.name + ' drew you a picture of the whole family.');
        } else if (c.age < 13) {
          pool.push(c.name + ' asked you a question you did not know how to answer.');
          pool.push(c.name + ' wanted to show you something on the way home.');
        } else if (c.age < 18) {
          pool.push(c.name + ' spent the whole day in their room.');
          if ((c.bond || 55) > 60) pool.push(c.name + ' said "thanks, mom/dad" and meant it.');
        }
      });
    }

    /* Parents still alive */
    if (S.family) {
      S.family.forEach(function(m) {
        if (m.alive === false) return;
        if (m.role === 'Mother' || m.role === 'Father') {
          if ((m.bond || 70) > 55) {
            pool.push(m.name + ' called just to say they miss you.');
            pool.push(m.name + ' asked if you are eating properly.');
          } else {
            pool.push('You have not spoken to ' + m.name + ' in a while.');
          }
        }
      });
    }

    /* Career */
    if (S.career && S.career.job) {
      var job = S.career.job;
      var perf = job.performance || 50;
      if (perf > 75) {
        pool.push('Your boss nodded at you in the hallway. Respect.');
        pool.push('A colleague asked for your advice on something.');
      } else if (perf < 40) {
        pool.push('Your boss walked past your desk without saying hello.');
        pool.push('You made a small mistake today that nobody mentioned. Yet.');
      } else {
        pool.push('Work was work. The day blurred into the next.');
      }
    }

    /* Environment */
    var envMap = {
      egy: ['Cairo traffic was a nightmare today.', 'The power cut out for an hour this afternoon.', 'A street vendor called out to you on your way home.', 'The Nile looked beautiful at sunset.'],
      usa: ['The commute felt longer than usual.', 'A neighbor waved at you across the street.', 'You overheard a conversation on the train that stuck with you.'],
      sau: ['The heat was unrelenting today.', 'You saw a sandstorm building on the horizon.', 'A friendly voice at the café asked about your family.'],
      uae: ['The city lights looked different tonight.', 'You noticed a new tower rising on the skyline.', 'Traffic on Sheikh Zayed Road was somehow worse than usual.'],
      gbr: ['It rained briefly, then stopped.', 'A stranger on the tube smiled at you.', 'The sky was that particular shade of grey again.'],
      deu: ['The autumn leaves are falling.', 'You watched the trains pass for a while.', 'You learned a new German word from a stranger.'],
      can: ['Snow was falling softly all afternoon.', 'A moose crossed the road ahead of you, unhurried.', 'The lake looked calm from the window.'],
      aus: ['The beach was empty this morning.', 'You saw a kangaroo on the drive home.', 'Someone said "mate" to you and it made you smile.'],
      nld: ['You cycled past the canals in the golden hour.', 'The tulips are blooming on your street.', 'A neighbor nodded at you from their window.'],
      fra: ['The baker remembered your usual order.', 'A street musician played something beautiful.', 'The café was full, so you walked.'],
      jpn: ['The cherry blossoms are falling.', 'The train was perfectly on time, as always.', 'You bowed back at a stranger.'],
      ita: ['The espresso was perfect this morning.', 'You watched the old men argue at the piazza.', 'Someone\'s grandmother smiled at you.'],
      sgp: ['The rain stopped as suddenly as it began.', 'The hawker centre smelled incredible.', 'You walked the waterfront, watching the ships.'],
      bra: ['The music from a street corner pulled you in.', 'The sun was relentless. You found shade.', 'Someone laughed, warm and loud.'],
      ind: ['The chai was perfect today.', 'You saw an elephant on the way to work.', 'The monsoon held off for one more day.']
    };
    var env = envMap[S.country] || envMap.egy;
    if (Math.random() < 0.35) {
      pool.push(env[Math.floor(Math.random() * env.length)]);
    }

    /* Health / mood reminders */
    if (S.health < 40) pool.push('You woke up feeling heavy. Maybe something is wrong.');
    if (S.happiness < 30) pool.push('Nothing feels quite right lately.');
    if (S.happiness > 80) pool.push('You caught yourself smiling for no reason.');
  }

  if (pool.length === 0) return;
  for (var i = 0; i < count; i++) {
    log(pool[Math.floor(Math.random() * pool.length)]);
  }
}
window.ambientFlavor = ambientFlavor;

/* ============================================================
   LIFE SUMMARY STRIP — visible in header
   ============================================================ */
function lifeSummaryHtml() {
  if (!S) return '';
  var bits = [];

  /* Spouse */
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    var p = S.marriage.partner;
    var pb = p.bond || 70;
    var heart = pb > 70 ? '❤️' : pb > 40 ? '💛' : '💔';
    bits.push(heart + ' ' + p.name);
  } else if (S.marriage && S.marriage.status === 'engaged' && S.marriage.partner) {
    bits.push('💍 Engaged to ' + S.marriage.partner.name);
  } else if (S.marriage && S.marriage.status === 'divorced') {
    bits.push('💔 Divorced');
  } else if (S.marriage && S.marriage.status === 'dating' && S.marriage.partner) {
    bits.push('💕 Dating ' + S.marriage.partner.name);
  }

  /* Children */
  if (S.childrenList && S.childrenList.length > 0) {
    var childBit = '👶 ' + S.childrenList.length + ' child' + (S.childrenList.length > 1 ? 'ren' : '');
    if (S.childrenList.length <= 3) {
      var ages = S.childrenList.map(function(c) { return c.age; }).join('/');
      childBit += ' (' + ages + ')';
    }
    bits.push(childBit);
  }

  /* Housing */
  var housingLabel =
    S.housing === 'parents' ? '🏠 Parents' :
    S.housing === 'rented' ? '🔑 Renting' :
    S.housing === 'owned' ? '🏡 Owned' : '🏠 Home';
  bits.push(housingLabel);

  /* Career */
  var j = (S.career && S.career.job) ? S.career.job : S.job;
  if (j) {
    bits.push('💼 ' + j.title);
  } else if (S.uni) {
    bits.push('🎓 Student');
  } else if (S.school) {
    bits.push('📚 School');
  } else if (S.age >= 18) {
    bits.push('💤 Unemployed');
  }

  if (bits.length === 0) return '';
  return '<div style="font-size:.72rem;color:#aaa;margin-top:3px;line-height:1.3">' + bits.join(' · ') + '</div>';
}
window.lifeSummaryHtml = lifeSummaryHtml;
/* ============================================================
   CHARACTER DIALOGUE & VOICE ENGINE (EXPANDED & REALISTIC)
   ============================================================ */
const DIALOGUE_CULTURE_TERMS = {
  egy: { term: 'Habibi', termF: 'Habibti', prayer: 'Rabbena yekhalik leya', blessing: 'Alhamdulillah', swear: 'Walahi' },
  sau: { term: 'Ya ba\'di', termF: 'Ya albi', prayer: 'Allah yehfezak', blessing: 'Mashallah', swear: 'Billah' },
  uae: { term: 'Fidwa', termF: 'Ghalia', prayer: 'Rabbi yewafgek', blessing: 'Tebarak Allah', swear: 'Wallah' },
  default: { term: 'my dear', termF: 'my darling', prayer: 'I wish you the very best', blessing: 'Thank goodness', swear: 'Honestly' }
};

function characterSay(character, intent, context) {
  if (!character) return '';

  const traits = Array.isArray(character.traits)
    ? character.traits
    : (character.trait ? [character.trait] : []);

  const countryCode = S ? S.country : 'egy';
  const cTerms = DIALOGUE_CULTURE_TERMS[countryCode] || DIALOGUE_CULTURE_TERMS.default;
  const petName = character.gender === 'f' ? cTerms.termF : cTerms.term;

  const lines = {
    greeting: {
      warm: [
        `${petName}! Come sit with me, let me look at you.`,
        `My darling, I was just thinking about you!`
      ],
      kind: [
        'It is so good to hear from you.',
        'I am really glad we can speak right now.'
      ],
      grumpy: [
        'What do you need now?',
        'Hmph. You finally remembered I exist.'
      ],
      stingy: [
        'Before we talk, I hope this call isn\'t about asking for money.',
        'Hello. Make it quick, time is money.'
      ],
      mamas_boy: [
        'Hello! My mother was just asking about us.',
        'Hey! I just got off the phone with my mom.'
      ],
      protector: [
        'Everything alright? Let me know if anyone gives you a hard time.',
        'I am right here with you. How can I help?'
      ],
      traditional: [
        `${cTerms.prayer}. Sit down, tell me how you are doing.`,
        'Peace be upon you. How are your days treating you?'
      ],
      religious: [
        `${cTerms.blessing}. It is a blessing to hear from you today.`,
        'May your day be full of peace and good health.'
      ],
      frugal: [
        'Good to hear from you. We should review the budget soon.',
        'Hello! Hope you are taking care of our resources.'
      ],
      extravagant: [
        `Darling! We simply must go out and treat ourselves soon.`,
        'Hello! I saw the most gorgeous collection today.'
      ],
      communicative: [
        'I love that we can always talk things through. How was your day?',
        'Hey there! Let\'s sit down and share what\'s on our minds.'
      ],
      avoidant: [
        'Hey. Everything is fine... we don\'t have to overcomplicate things, right?',
        'Hi. Hope things are quiet today.'
      ],
      romantic: [
        'Every time you reach out, my whole day gets lighter.',
        'Hearing your voice is always the best part of my day.'
      ],
      ambitious: [
        'I have a packed schedule today, but for you I always have time.',
        'Hello! Working hard toward our future. What is new?'
      ],
      supportive: [
        'I am so glad you reached out. How are you really feeling?',
        'Whatever you are facing today, remember I have your back.'
      ],
      shy: [
        'H-hello... I\'m really happy to hear from you.',
        'Hi. I was hoping you would reach out.'
      ],
      default: [
        'Hello. How are you doing today?',
        'Hi there! Good to hear from you.'
      ]
    },

    affection: {
      romantic: [
        'You have no idea how much I needed to hear that. You are my world.',
        'Every day by your side feels like an answered prayer.'
      ],
      mamas_boy: [
        'I care about you so much. My mother always said you have a good heart.',
        'You make our family complete.'
      ],
      protector: [
        'No matter what happens, I will always stand between you and the world.',
        'You never have to worry as long as I am here.'
      ],
      traditional: [
        `May we always build an honorable home together, ${petName}.`,
        'You bring dignity, peace, and blessing into my life.'
      ],
      warm: [
        `I love you with all my heart, ${petName}. Never forget that.`,
        'You make this house feel like a true home.'
      ],
      loyal: [
        'We stand shoulder to shoulder, through thick and thin.',
        'I am so thankful we found each other.'
      ],
      frugal: [
        'A good partner is the greatest treasure one could ever save for.',
        'You are worth more than all the gold in the market.'
      ],
      default: [
        'I love you too.',
        'That means more to me than words can say.'
      ]
    },

    upset: {
      grumpy: [
        'Do not speak to me right now.',
        'Leave me alone until I have cooled off.'
      ],
      stingy: [
        'Every time we disagree, money gets wasted!',
        'You don\'t appreciate how hard every pound/dollar is earned.'
      ],
      mamas_boy: [
        'My mother warned me that this would become an issue between us.',
        'Why can\'t you respect my family\'s advice on this?'
      ],
      protector: [
        'I am trying to shield us, but you are not listening to reason.',
        'You are putting us in a difficult position.'
      ],
      avoidant: [
        'I cannot deal with this argument right now. Please drop it.',
        'Let\'s just not talk about this today.'
      ],
      stubborn: [
        'I said what I said. My position is not changing.',
        'You can argue all day, but I am not backing down.'
      ],
      jealous: [
        'Oh, so now you remember I exist? Who was keeping you so occupied?',
        'Don\'t treat me like a fool. I see how things are.'
      ],
      moody: [
        'I am really not in the mood for another confrontation.',
        'Can we just have one peaceful day without drama?'
      ],
      default: [
        'I am very upset about this, and we need to address it properly.',
        'This hurt me more than you realize.'
      ]
    },

    happy: {
      warm: [
        `${cTerms.blessing}! You make me so proud!`,
        'Seeing you happy makes everything worth it.'
      ],
      traditional: [
        `${cTerms.blessing}, this brings true honor to our family name.`,
        'May good fortune and blessings always follow our footsteps.'
      ],
      ambitious: [
        'That is what I am talking about! Our hard work is finally paying off.',
        'Success looks good on us. On to the next milestone!'
      ],
      funny: [
        'Look at you winning at life! Don\'t forget the little people now!',
        'This calls for a celebration — dinner is on you!'
      ],
      supportive: [
        'I always believed in you! Nobody deserves this more.',
        'I am cheering for you with all my heart!'
      ],
      default: [
        'That is wonderful news!',
        'I am so happy for you!'
      ]
    },

    /* --- MARRIAGE SPECIFIC INTENTS --- */
    inlaw_clash: {
      mamas_boy: [
        'She is my mother! You expect me to just throw away her advice?',
        'Can you please just smile and agree for once? She only wants what is best.'
      ],
      protector: [
        'Do not worry. I will speak to my mother in private. She overstepped.',
        'I won\'t let anyone disrespect you under our roof, family or not.'
      ],
      traditional: [
        'In our customs, elders deserve respect even when they are mistaken.',
        'Patience brings peace. Let us handle this with grace.'
      ],
      communicative: [
        'Let us agree on firm boundaries together before our families visit next time.',
        'I understand why you felt cornered. Let\'s resolve this as a team.'
      ],
      default: [
        'Family tensions are exhausting. Let us try to stay united.',
        'Please, let us not let our relatives destroy what we have built.'
      ]
    },

    money_strain: {
      frugal: [
        'Every cent matters right now! We cannot afford unnecessary luxuries.',
        'We need to cut non-essentials until our savings balance recovers.'
      ],
      stingy: [
        'You are bleeding us dry with these purchases! Stop spending!',
        'No more unnecessary expenses! We need to tighten every lock on our wallet.'
      ],
      extravagant: [
        'What is the point of working so hard if we cannot enjoy our lives?',
        'Money comes and goes, but dignity and living well remain!'
      ],
      ambitious: [
        'This financial pinch is temporary. I am working on expanding our income.',
        'Stay focused on our 5-year plan. We will get through this dip.'
      ],
      default: [
        'The bills are getting out of hand. We need to sit down and review our budget.',
        'Money is tight, and we need to handle this together.'
      ]
    },

    jealousy: {
      jealous: [
        'Who is messaging you at this hour? Hand me your phone.',
        'I noticed how they looked at you. Do not take me for an idiot.'
      ],
      insecure: [
        'Do you still find me attractive? Sometimes I feel like you look right through me.',
        'Are you happy with me, or do you regret choosing this life?'
      ],
      protector: [
        'I trust you, but I do not trust the people hovering around you.',
        'Keep your guard up. Not everyone wishing us well is sincere.'
      ],
      default: [
        'Who was that? You seemed awfully friendly.',
        'I just need reassurance that nothing is being hidden from me.'
      ]
    },

    baby_talk: {
      family_oriented: [
        `Our home feels ready, ${petName}. Hearing little footsteps would bring so much life here.`,
        'Both our parents keep hinting, but more importantly, my own heart is ready.'
      ],
      career_focused: [
        'Having a baby right now could stall our career momentum. Let us give it another year.',
        'We need more financial security before taking on the responsibility of a child.'
      ],
      frugal: [
        'Children require school funds, medical care, and savings. Are our numbers ready?',
        'Let us build an emergency cushion before we welcome a baby.'
      ],
      traditional: [
        `Children are the blessing of a home. May we be blessed when the time is right.`,
        'Every child comes with their own sustenance. Let us trust and take the step.'
      ],
      default: [
        'What do you think about taking the next step for our family?',
        'I feel like we are at a crossroads regarding children.'
      ]
    },

    apology: {
      warm: [
        `${petName}, I was wrong. My temper got the better of me. Please forgive me.`,
        'You matter more to me than winning any silly argument. I am sorry.'
      ],
      stubborn: [
        'Fine. Perhaps I reacted too harshly. Let us put it behind us.',
        'I am not saying I was completely wrong, but I regret how it sounded.'
      ],
      communicative: [
        'I see where I hurt your feelings, and I take responsibility for it. I apologize.',
        'Let us reset. You deserve my gentleness, not my frustration.'
      ],
      default: [
        'I am sorry for how I acted.',
        'Please forgive me. I want us to be at peace.'
      ]
    }
  };

  const pool = lines[intent] || lines.greeting;
  let result = null;

  for (let i = 0; i < traits.length; i++) {
    const t = traits[i];
    if (pool[t]) {
      const arr = pool[t];
      result = arr[Math.floor(Math.random() * arr.length)];
      break;
    }
  }

  if (!result) {
    const def = pool.default || lines.greeting.default;
    result = def[Math.floor(Math.random() * def.length)];
  }

  return result;
}

/* ---------- SPEECH SYNTHESIS ENGINE (REAL VOICE) ---------- */
function characterSpeak(text, character) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!text) return;

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = (character && character.gender === 'f') ? 1.15 : 0.95;

    const countryCode = S ? S.country : 'egy';
    if (['egy', 'sau', 'uae'].includes(countryCode)) {
      utterance.lang = 'ar-EG';
    } else if (countryCode === 'gbr' || countryCode === 'uk') {
      utterance.lang = 'en-GB';
    } else {
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('[Voice Engine] Speech synthesis error:', err);
  }
}
/* ============================================================
   LIFE WARNINGS — visible stress signals in the header
   "Whispers before shocks" — player sees trouble coming
   ============================================================ */
function lifeWarningsHtml() {
  if (!S) return '';
  var w = [];

  if (S.health < 40) w.push({ icon: '🏥', label: 'Health critical', color: '#fb7185' });
  else if (S.health < 55) w.push({ icon: '💊', label: 'Health failing', color: '#fbbf24' });

  if (S.marriage && S.marriage.partner && (S.marriage.partner.bond || 70) < 35) {
    w.push({ icon: '💔', label: 'Marriage strained', color: '#fb7185' });
  }
  if (S.wealth < 0) w.push({ icon: '💸', label: 'In debt', color: '#fb7185' });
  if (S.wealth >= 0 && S.household && S.household.net < 0) {
    w.push({ icon: '📉', label: 'Overspending', color: '#fbbf24' });
  }
  if (S.career && S.career.job && (S.career.job.performance || 50) < 30) {
    w.push({ icon: '⚠️', label: 'Firing risk', color: '#fb7185' });
  }
  if (S.childrenList && S.childrenList.some(function(c) { return (c.bond || 55) < 30; })) {
    w.push({ icon: '👨‍👧', label: 'Child estranged', color: '#fbbf24' });
  }
  if (S.happiness < 25) w.push({ icon: '😔', label: 'Deeply unhappy', color: '#fb7185' });

  if (w.length === 0) return '';
  return '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:5px">' +
    w.slice(0, 4).map(function(x) {
      return '<span style="background:' + x.color + '22;color:' + x.color +
        ';padding:2px 7px;border-radius:5px;font-size:.65rem;font-weight:700">' + x.icon + ' ' + x.label + '</span>';
    }).join('') + '</div>';
}
window.lifeWarningsHtml = lifeWarningsHtml;

/* ============================================================
   HAPPINESS BREAKDOWN — transparency panel
   ============================================================ */
function happinessBreakdownHtml() {
  if (!S) return '';
  var lines = [];

  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    var b = S.marriage.partner.bond || 70;
    var c = (b - 50) * 0.5;
    lines.push({ label: 'Marriage (' + S.marriage.partner.name + ' · bond ' + b + '%)', value: c });
  } else if (S.marriage && S.marriage.status === 'divorced') {
    lines.push({ label: 'Divorced', value: -10 });
  } else if (S.age > 30 && S.age < 55) {
    lines.push({ label: 'Single at this age', value: -5 });
  }

  if (S.childrenList && S.childrenList.length > 0) {
    var avg = S.childrenList.reduce(function(s, c) { return s + (c.bond || 55); }, 0) / S.childrenList.length;
    lines.push({ label: 'Children (' + S.childrenList.length + ' · avg bond ' + Math.round(avg) + '%)', value: (avg - 50) * 0.4 + Math.min(8, S.childrenList.length * 2) });
  }

  var lp = (S.family || []).filter(function(m) { return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false; });
  if (lp.length > 0) {
    var ap = lp.reduce(function(s, m) { return s + (m.bond || 70); }, 0) / lp.length;
    lines.push({ label: 'Parents (avg bond ' + Math.round(ap) + '%)', value: (ap - 50) * 0.25 });
  }

  var fr = S.friends || [];
  if (fr.length > 0) {
    var af = fr.reduce(function(s, f) { return s + (f.bond || 50); }, 0) / fr.length;
    lines.push({ label: 'Friends (' + fr.length + ')', value: Math.min(6, fr.length) * 1.5 + (af - 50) * 0.1 });
  } else if (S.age > 25) {
    lines.push({ label: 'No friends', value: -8 });
  }

  if (S.career && S.career.job) {
    var per = S.career.job.performance || 50;
    var cv = (per - 50) * 0.2;
    if ((S.career.job.tenure || 0) > 3) cv += 3;
    if (per < 30) cv -= 8;
    lines.push({ label: 'Career (' + per + '% perf)', value: cv });
  } else if (S.age >= 25 && S.age < 60) {
    lines.push({ label: 'Unemployed', value: -12 });
  }

  if (S.wealth < 0) lines.push({ label: 'In debt', value: -20 });
  if (S.health > 80) lines.push({ label: 'Excellent health', value: 5 });
  else if (S.health < 40) lines.push({ label: 'Poor health', value: -15 });
  else if (S.health < 60) lines.push({ label: 'Frail health', value: -5 });

  if (S.housing === 'parents' && S.age >= 30) lines.push({ label: 'Living with parents at ' + S.age, value: -10 });
  if (S.housing === 'owned') lines.push({ label: 'Own home', value: 3 });

  if (S.happinessOverride) {
    lines.push({ label: 'Recent emotional events', value: S.happinessOverride });
  }

  var total = 50;
  lines.forEach(function(l) { total += l.value; });
  var final = Math.max(0, Math.min(100, Math.round(total)));

  var html = '<div class="card"><h3>😊 Why Your Happiness is ' + final + '%</h3>' +
    '<div class="muted small" style="margin-bottom:6px">This reflects your real life. It updates automatically.</div>' +
    '<div class="row"><span>Baseline</span><b>50</b></div>';
  lines.forEach(function(l) {
    var sign = l.value >= 0 ? '+' : '';
    var color = l.value >= 0 ? '#34d399' : '#fb7185';
    html += '<div class="row"><span>' + l.label + '</span><b style="color:' + color + '">' + sign + Math.round(l.value) + '</b></div>';
  });
  html += '<div class="row" style="border-top:1px solid #25253a;padding-top:6px;margin-top:6px"><b>Total</b><b style="font-size:1.05rem">' + final + '</b></div>';
  html += '</div>';
  return html;
}
window.happinessBreakdownHtml = happinessBreakdownHtml;
window.characterSay = characterSay;
window.characterSpeak = characterSpeak;
/* ============================================================
   UNITY PASS — WEEK 3: UNIFIED HOUSEHOLD ECONOMY
   ============================================================
   computeHousehold()  → reads state, returns income/expense breakdown (in player currency)
   chargeHousehold(m)  → actually deducts 1/12 or 12/12 of net from wealth
   ============================================================ */

function computeHousehold() {
  if (!S) return { income: 0, expenses: 0, net: 0, incomeItems: [], expenseItems: [], stress: 'child' };

  var income = 0, expenses = 0;
  var incomeItems = [], expenseItems = [];
  var c = C();

  /* Helper — safe currency conversion */
  function conv(amount, country) {
    if (!amount) return 0;
    if (!country) return Math.round(amount);
    if (typeof convertToPlayerCurrency === 'function') return convertToPlayerCurrency(amount, country);
    return Math.round(amount);
  }

  /* ---------- INCOME ---------- */
  if (S.career && S.career.job) {
    var sal = S.career.job.salary || 0;
    if (sal > 0) {
      income += sal;
      incomeItems.push({ label: 'Salary — ' + (S.career.job.title || 'Job'), yearly: sal, country: S.country });
    }
  }

   /* Spouse income — depends on finance model */
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    var p = S.marriage.partner;
    var fm = S.marriage.financeModel;
    var spouseWorking = !p.career || p.career.working !== false;
    var pInc = p.income || 0;
    var includeSpouse = false;

    if (spouseWorking && pInc > 0) {
      if (fm === 'egalitarian' || fm === 'proportional' || fm === 'joint_account' || fm === 'shared_savings' || fm === 'custom') {
        includeSpouse = true;
      } else if (fm === 'traditional_wife' && S.gender === 'm') {
        includeSpouse = true;
      } else if (fm === 'one_earner' && S.gender === 'f') {
        includeSpouse = true;
      } else if (!fm) {
        includeSpouse = true;
      }
      /* male_provider, princess_treatment, separate_accounts: spouse keeps her income */
    }

    if (includeSpouse) {
      income += pInc;
      incomeItems.push({ label: 'Spouse (' + p.name + ')', yearly: pInc, country: S.country });
    } else if (spouseWorking && pInc > 0) {
      /* Show spouse income as "kept separate" — for transparency, not income */
      incomeItems.push({
        label: 'Spouse (' + p.name + ') — kept separate',
        yearly: pInc,
        country: S.country,
        separate: true
      });
    }
  }
if (S.evtMemory && S.evtMemory.bornPoorTrap) {
  /* Small but real drag on growth: 3% higher expenses from poor background patterns */
  expenses = Math.round(expenses * 1.03);
}
  /* Princess treatment: player pays spouse allowance */
  if (S.marriage && S.marriage.partner && S.marriage.financeModel === 'princess_treatment' && S.gender === 'm') {
    var pSalary = (S.career && S.career.job) ? (S.career.job.salary || 0) : 0;
    if (pSalary > 0) {
      var allowance = Math.round(pSalary * 0.10);
      expenses += allowance;
      expenseItems.push({ label: 'Spouse allowance — ' + (S.marriage.partner.name || 'Wife'), yearly: allowance, country: S.country });
    }
  }

  /* Male provider with working wife: small allowance she keeps as her own */
  if (S.marriage && S.marriage.partner && S.marriage.financeModel === 'male_provider' && S.gender === 'm') {
    var pSalary2 = (S.career && S.career.job) ? (S.career.job.salary || 0) : 0;
    if (pSalary2 > 0 && S.marriage.partner.career && S.marriage.partner.career.working === false) {
      var allowance2 = Math.round(pSalary2 * 0.05);
      expenses += allowance2;
      expenseItems.push({ label: 'Household spending money', yearly: allowance2, country: S.country });
    }
  }
  if (S.career && Array.isArray(S.career.businesses)) {
    S.career.businesses.forEach(function(biz) {
      var y = (biz.monthlyProfit || 0) * 12;
      if (y > 0) {
        income += y;
        incomeItems.push({ label: 'Business — ' + biz.name, yearly: y, country: S.country });
      }
    });
  }

  (S.ownedHomes || []).forEach(function(home) {
    if (home.status === 'rented' && home.monthlyRent) {
      var yLocal = home.monthlyRent * 12;
      var yConv = conv(yLocal, home.country || 'egy');
      income += yConv;
      incomeItems.push({
        label: 'Rent — ' + home.name,
        yearly: yConv,
        yearlyLocal: yLocal,
        country: home.country,
        currency: (COUNTRIES[home.country] && COUNTRIES[home.country].currency) || ''
      });
    }
  });

  /* ---------- EXPENSES ---------- */
  if (S.housing === 'parents') {
    var pPhone = Math.round((c.prices.phone || 0) * 0.5);
    var pTrans = Math.round((c.prices.transport || 0) * 0.25);
    expenses += pPhone + pTrans;
    expenseItems.push({ label: 'Phone (at parents)', yearly: pPhone, country: S.country });
    expenseItems.push({ label: 'Transport', yearly: pTrans, country: S.country });
    } else if (S.lifestyle && S.lifestyle.active && typeof lifeCalculate === 'function') {
    var lc = lifeCalculate();
    var rentFromLife = (lc.housingMonthly || 0) * 12;
    var lifeYear = (lc.yearly || 0) - rentFromLife;

    /* Lifestyle is the aggregate of: phone, internet, utilities, food, dining,
       transport, clothing, entertainment, personal_care, domestic_staff,
       healthcare_insurance, subscriptions, charity.
       The player configured each of these in the Lifestyle tab. */
    if (lifeYear > 0) {
      expenses += lifeYear;
      expenseItems.push({ label: '🏠 Lifestyle (see Lifestyle tab for breakdown)', yearly: lifeYear, country: S.country });
    }
    if (rentFromLife > 0) {
      expenses += rentFromLife;
      expenseItems.push({ label: '🔑 Rent', yearly: rentFromLife, country: S.country });
    }
  } else {
    var food = c.prices.food || 0;
    var ph = c.prices.phone || 0;
    var trn = c.prices.transport || 0;
    expenses += food + ph + trn;
    expenseItems.push({ label: 'Food', yearly: food, country: S.country });
    expenseItems.push({ label: 'Phone', yearly: ph, country: S.country });
    expenseItems.push({ label: 'Transport', yearly: trn, country: S.country });
    if (S.housing === 'rented') {
      var rentY = (typeof currentYearlyRent === 'function') ? currentYearlyRent() : (c.prices.rent || 0);
      expenses += rentY;
      expenseItems.push({ label: 'Rent', yearly: rentY, country: S.country });
    }
  }

  /* Children — living, school, activities (all EGP-based, convert) */
  (S.childrenList || []).forEach(function(child) {
    if (child.movedOut) return;
    var ag = child.age <= 2 ? 'infant' : child.age <= 5 ? 'toddler' : child.age <= 12 ? 'child' : 'teen';
    var tier = (typeof CHILDREN_EXPENSE_TIERS !== 'undefined' && CHILDREN_EXPENSE_TIERS[ag] && CHILDREN_EXPENSE_TIERS[ag][child.lifestyle || 'standard']) || null;
    if (tier && tier.monthlyEGP) {
      var yL = conv(tier.monthlyEGP * 12, 'egy');
      expenses += yL;
      expenseItems.push({ label: 'Living — ' + child.name, yearly: yL, country: S.country });
    }
    if (child.school && child.age >= 4 && child.age <= 18) {
      var sch = (typeof chBySchoolLabel === 'function') ? chBySchoolLabel(child.school) : null;
      if (sch && sch.annualEGP) {
        var yS = conv(sch.annualEGP, 'egy');
        expenses += yS;
        expenseItems.push({ label: 'School — ' + child.name, yearly: yS, country: S.country });
      }
    }
    (child.activities || []).forEach(function(aid) {
      var act = (typeof CHILDREN_ACTIVITIES !== 'undefined') ? CHILDREN_ACTIVITIES.find(function(a) { return a.id === aid; }) : null;
      if (act) {
        var base = act.monthlyEGP ? act.monthlyEGP * 12 : (act.annualEGP || 0);
        var yA = conv(base, 'egy');
        expenses += yA;
        expenseItems.push({ label: 'Activity — ' + child.name, yearly: yA, country: S.country });
      }
    });
  });

  /* Cars — maintenance, fuel, insurance (already in player currency) */
  (S.cars || []).forEach(function(car) {
    if (car.stolen) return;
    if (car.storedIn) return;
    var carName = (car.brand || '') + ' ' + (car.model || '');
    var mnt = (typeof carMaintenanceYearLocal === 'function') ? carMaintenanceYearLocal(car) : 0;
    var fl = (typeof carFuelCostYearLocal === 'function') ? carFuelCostYearLocal(car) : 0;
    var ins = (typeof carInsuranceYearLocal === 'function') ? carInsuranceYearLocal(car) : 0;
    var reg = (typeof carRegistrationYearLocal === 'function') ? carRegistrationYearLocal(car) : 0;
    if (ins > 0) {
      expenses += ins;
      expenseItems.push({ label: '🚗 Car insurance — ' + carName, yearly: ins, country: S.country });
    }
    if (fl > 0) {
      expenses += fl;
      expenseItems.push({ label: '⛽ Car fuel — ' + carName, yearly: fl, country: S.country });
    }
    if (mnt > 0) {
      expenses += mnt;
      expenseItems.push({ label: '🔧 Car maintenance — ' + carName, yearly: mnt, country: S.country });
    }
    if (reg > 0) {
      expenses += reg;
      expenseItems.push({ label: '📋 Car registration — ' + carName, yearly: reg, country: S.country });
    }
  });

  /* Medical — insurance premium (EGP-based) + medications (EGP-based) */
  if (S.medical && S.medical.insurance && typeof MED_INSURANCE !== 'undefined') {
    var mi = MED_INSURANCE.find(function(i) { return i.id === S.medical.insurance; });
    if (mi && mi.premiumAnnualEGP > 0) {
      var yMi = conv(mi.premiumAnnualEGP, 'egy');
      expenses += yMi;
      expenseItems.push({ label: 'Health insurance', yearly: yMi, country: S.country });
    }
  }
  if (S.medical && Array.isArray(S.medical.medications) && typeof MED_MEDICATIONS !== 'undefined') {
    var medEGP = 0;
    S.medical.medications.forEach(function(md) {
      var def = MED_MEDICATIONS.find(function(d) { return d.id === md.id; });
      if (def && def.monthlyEGP) medEGP += def.monthlyEGP * 12;
    });
    if (medEGP > 0) {
      var yMed = conv(medEGP, 'egy');
      expenses += yMed;
      expenseItems.push({ label: 'Medications', yearly: yMed, country: S.country });
    }
  }

  /* Loans + card minimums */
  if (S.bank && Array.isArray(S.bank.loans)) {
    S.bank.loans.forEach(function(l) {
      var y = (l.monthlyPayment || 0) * 12;
      if (y > 0 && (l.monthsLeft || 0) > 0) {
        expenses += y;
        expenseItems.push({ label: 'Loan — ' + (l.name || 'Loan'), yearly: y, country: S.country });
      }
    });
  }
  if (S.bank && Array.isArray(S.bank.creditCards)) {
    var cardY = 0;
    S.bank.creditCards.forEach(function(card) {
      if ((card.balance || 0) > 0) {
        cardY += (card.balance || 0) * (card.minPaymentPct || 0.05) * 12;
      }
    });
    if (cardY > 0) {
      expenses += cardY;
      expenseItems.push({ label: 'Card minimum payments', yearly: cardY, country: S.country });
    }
  }

  /* Store financing + card installments */
  if (S.shopping && Array.isArray(S.shopping.loans)) {
    S.shopping.loans.forEach(function(l) {
      if ((l.yearsLeft || 0) > 0 && (l.yearlyPayment || 0) > 0) {
        expenses += l.yearlyPayment;
        expenseItems.push({ label: 'Store finance — ' + (l.itemName || 'Item'), yearly: l.yearlyPayment, country: S.country });
      }
    });
  }
  if (S.shopping && Array.isArray(S.shopping.cardInstallments)) {
    var ciY = 0;
    S.shopping.cardInstallments.forEach(function(ci) { ciY += (ci.monthlyPayment || 0) * 12; });
    if (ciY > 0) {
      expenses += ciY;
      expenseItems.push({ label: 'Card installments', yearly: ciY, country: S.country });
    }
  }

  /* Real estate HOA + mortgages (converted from property country) */
  (S.ownedHomes || []).forEach(function(home) {
    var hc = home.country || 'egy';
    var hoaHome = Math.round((home.value || 0) * 0.005);
    if (hoaHome > 0) {
      var yHoa = conv(hoaHome, hc);
      expenses += yHoa;
      expenseItems.push({ label: 'HOA — ' + home.name, yearly: yHoa, country: hc });
    }
  });
  if (Array.isArray(S.realestateContracts)) {
    S.realestateContracts.forEach(function(contract) {
      if ((contract.yearsLeft || 0) <= 0) return;
      var hh = (S.ownedHomes || []).find(function(x) { return x.id === contract.homeId; });
      var hc = hh ? (hh.country || 'egy') : S.country;
      var yMort = conv(contract.annualPayment || 0, hc);
      if (yMort > 0) {
        expenses += yMort;
        expenseItems.push({ label: 'Mortgage — ' + (contract.name || 'Property'), yearly: yMort, country: hc });
      }
    });
  }

  /* Subscriptions */
  if (S.lifestyle && Array.isArray(S.lifestyle.subscriptions) && typeof LIFE_SUBSCRIPTIONS !== 'undefined') {
    var subY = 0;
    S.lifestyle.subscriptions.forEach(function(id) {
      var sub = LIFE_SUBSCRIPTIONS.find(function(s) { return s.id === id; });
      if (sub && sub.prices) {
        var price = sub.prices[S.country] || sub.prices.egy || 0;
        subY += price * 12;
      }
    });
    if (subY > 0) {
      expenses += subY;
      expenseItems.push({ label: 'Subscriptions', yearly: subY, country: S.country });
    }
  }

  /* Family allowances (monthly × 12) */
  if (S.parentAllowances && typeof S.parentAllowances === 'object') {
    var allowY = 0;
    Object.keys(S.parentAllowances).forEach(function(k) { allowY += (S.parentAllowances[k] || 0); });
    if (allowY > 0) {
      expenses += allowY * 12;
      expenseItems.push({ label: 'Family allowances', yearly: allowY * 12, country: S.country });
    }
  }

  /* Pension contributions */
  if (S.bank && S.bank.pension && Array.isArray(S.bank.pension.active)) {
    var penY = 0;
    S.bank.pension.active.forEach(function(p) { penY += (p.monthlyContribution || 0) * 12; });
    if (penY > 0) {
      expenses += penY;
      expenseItems.push({ label: 'Pension contributions', yearly: penY, country: S.country });
    }
  }
  /* Eldercare recurring cost (from aging parent event) */
  if (S.household && S.household._eldercareMonthly > 0) {
    var ecYear = Math.round(S.household._eldercareMonthly * 12);
    expenses += ecYear;
    var ecLabel = 'Eldercare — caregiver';
    if (S.household._eldercareMode === 'moved_in') ecLabel = 'Eldercare — parent at home';
    else if (S.household._eldercareMode === 'sibling_split') ecLabel = 'Eldercare — caregiver (split with ' + (S.household._eldercareSiblingShare || 1) + ')';
    expenseItems.push({ label: ecLabel, yearly: ecYear, country: S.country });
  }
  /* Bank insurance premiums */
  if (S.bank && Array.isArray(S.bank.insurance)) {
    var biY = 0;
    S.bank.insurance.forEach(function(ins) { if (ins.annualPremium) biY += ins.annualPremium; });
    if (biY > 0) {
      expenses += biY;
      expenseItems.push({ label: 'Bank insurance', yearly: biY, country: S.country });
    }
  }

  /* Income tax */
  if (S.career && S.career.job && typeof carComputeTax === 'function') {
    var tax = carComputeTax(S.career.job.salary);
    if (tax > 0) {
      expenses += tax;
      expenseItems.push({ label: 'Income tax', yearly: tax, country: S.country });
    }
  }

  var net = income - expenses;
  var stress = 'healthy';
  if (income === 0 && expenses > 0) stress = 'critical';
  else if (expenses > income) stress = 'critical';
  else if (expenses > income * 0.85) stress = 'tight';

  return {
    income: Math.round(income),
    expenses: Math.round(expenses),
    net: Math.round(net),
    incomeItems: incomeItems,
    expenseItems: expenseItems,
    stress: stress
  };
}
window.computeHousehold = computeHousehold;

function chargeHousehold(months) {
  if (!S) return;
  months = (typeof months === 'number') ? months : 12;

  /* Minors: no charge, set stub */
  if (S.age < 18) {
    S.household = { income: 0, expenses: 0, net: 0, incomeItems: [], expenseItems: [], stress: 'child' };
    return;
  }
/* Apply inflation spike multiplier if active */
if (S.household && S.household._inflationSpike > 0) {
  var _spike = 1 + S.household._inflationSpike;
  expenses = Math.round(expenses * _spike);
  S.household._inflationSpike = 0;  /* one-shot */
}
  /* Skip monthly charge during the year-of-switch (avoids double charge) */
  if (months === 1 && S.pacingSwitchYear === gameYear()) {
    var h0 = computeHousehold();
    S.household = h0;
    return;
  }

  var h = computeHousehold();
  S.household = h;

  if (months > 0) {
    var periodNet = Math.round(h.net * months / 12);
    if (periodNet !== 0) {
      S.wealth += periodNet;
      if (months === 12) {
        if (periodNet > 0) log('💰 Year net income: +' + money(periodNet));
        else log('💸 Year net expenses: ' + money(periodNet));
      } else if (months === 1) {
        if (periodNet > 0) log('💰 ' + currentMonthName() + ': +' + money(periodNet));
        else log('💸 ' + currentMonthName() + ': ' + money(periodNet));
      }
    }
  }

  if (h.stress === 'critical' && months === 12) {
    log('⚠️ Household deficit — you are losing money every month.');
  }
}
window.chargeHousehold = chargeHousehold;

/* ---------- HOUSEHOLD UI PANEL ---------- */
function householdBreakdownHtml() {
  if (!S) return '';
  if (S.age < 18) {
    return '<div class="card"><h3>🏠 Household</h3><p class="muted small">Your parents pay the bills. You have no household of your own yet.</p></div>';
  }

   if (typeof syncSpouseFinancials === 'function') syncSpouseFinancials();
  var h = computeHousehold();
  S.household = h;
  var sb = {
    healthy: { label: '✅ Healthy', color: '#34d399' },
    tight: { label: '⚠️ Tight', color: '#fbbf24' },
    critical: { label: '🚨 Deficit', color: '#fb7185' }
  }[h.stress] || { label: '—', color: '#888' };

  var html = '<div class="card" style="border-color:' + sb.color + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<h3 style="color:' + sb.color + '">🏠 Household Economy</h3>' +
    '<span style="font-size:.72rem;color:' + sb.color + ';font-weight:700">' + sb.label + '</span>' +
    '</div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;text-align:center">' +
    '<div><div class="muted" style="font-size:.62rem">INCOME</div><div style="color:#34d399;font-weight:700;font-size:.85rem">' + money(h.income) + '</div><div class="muted" style="font-size:.6rem">/year</div></div>' +
    '<div><div class="muted" style="font-size:.62rem">EXPENSES</div><div style="color:#fb7185;font-weight:700;font-size:.85rem">' + money(h.expenses) + '</div><div class="muted" style="font-size:.6rem">/year</div></div>' +
    '<div><div class="muted" style="font-size:.62rem">NET</div><div style="color:' + (h.net >= 0 ? '#34d399' : '#fb7185') + ';font-weight:700;font-size:.85rem">' + (h.net >= 0 ? '+' : '') + money(h.net) + '</div><div class="muted" style="font-size:.6rem">/year</div></div>' +
    '</div>';

  if (h.incomeItems.length > 0) {
    html += '<h4 style="font-size:.78rem;color:#34d399;margin-top:12px">💵 Income</h4>';
    h.incomeItems.forEach(function(item) {
      html += '<div class="row" style="padding:4px 0;font-size:.75rem"><span>' + item.label + '</span><b class="mono">+' + money(item.yearly) + '</b></div>';
    });
  }

  if (h.expenseItems.length > 0) {
    html += '<h4 style="font-size:.78rem;color:#fb7185;margin-top:12px">💸 Expenses</h4>';
    h.expenseItems.forEach(function(item) {
      html += '<div class="row" style="padding:4px 0;font-size:.75rem"><span>' + item.label + '</span><b class="mono">−' + money(item.yearly) + '</b></div>';
    });
  }

  html += '<div class="row" style="border-top:2px solid #25253a;padding-top:6px;margin-top:8px"><b>Net / year</b><b style="color:' + (h.net >= 0 ? '#34d399' : '#fb7185') + ';font-size:1rem">' + (h.net >= 0 ? '+' : '') + money(h.net) + '</b></div>';
  html += '<div class="row"><span>Net / month</span><b style="color:' + (h.net >= 0 ? '#34d399' : '#fb7185') + '">' + (h.net >= 0 ? '+' : '') + money(Math.round(h.net / 12)) + '</b></div>';
  html += '</div>';
  return html;
}
window.householdBreakdownHtml = householdBreakdownHtml;
/* ============================================================
   UNITY PASS — WEEK 5: THE SOUL PASS
   Chapters, Moments, Reflections, Character Evolution
   ============================================================ */

/* ---------- CHAPTERS — life is a book, not a number line ---------- */
const CHAPTERS = [
  { key: 'childhood',  maxAge: 5,   name: 'Childhood',            color: '#fbbf24', note: 'The world is being handed to you.' },
  { key: 'school',     maxAge: 12,  name: 'The School Years',     color: '#fbbf24', note: 'You are learning who you are.' },
  { key: 'teen',       maxAge: 17,  name: 'The Teenage Years',    color: '#8b5cf6', note: 'Everything feels enormous.' },
  { key: 'university', maxAge: 22,  name: 'The Early Years',      color: '#22d3ee', note: 'You are becoming someone.' },
  { key: 'founding',   maxAge: 29,  name: 'The Founding Years',   color: '#34d399', note: 'You are building the foundation of an adult life.' },
  { key: 'building',   maxAge: 39,  name: 'The Building Years',   color: '#34d399', note: 'You are assembling a life worth living.' },
  { key: 'peak',       maxAge: 49,  name: 'The Peak Years',       color: '#fbbf24', note: 'You are at the height of your powers.' },
  { key: 'later',      maxAge: 59,  name: 'The Later Years',      color: '#8b5cf6', note: 'Some things are ending. Others are beginning.' },
  { key: 'twilight',   maxAge: 69,  name: 'The Twilight Years',   color: '#fb7185', note: 'You are watching the world you built.' },
  { key: 'reflection', maxAge: 79,  name: 'The Reflection Years', color: '#fb7185', note: 'You are counting what matters.' },
  { key: 'final',      maxAge: 200, name: 'The Final Chapter',    color: '#888',    note: 'What is left is what you made.' }
];

function getChapter() {
  if (!S) return CHAPTERS[0];
  for (var i = 0; i < CHAPTERS.length; i++) {
    if (S.age <= CHAPTERS[i].maxAge) return CHAPTERS[i];
  }
  return CHAPTERS[CHAPTERS.length - 1];
}
window.getChapter = getChapter;

/* ---------- MOMENTS — days that stay ---------- */
function recordMoment(title, description, options) {
  if (!S) return;
  options = options || {};
  if (!S.lifeMoments) S.lifeMoments = [];
  /* Prevent exact duplicates within 2 years */
  var dupKey = options.key || title;
  var exists = S.lifeMoments.some(function(m) {
    return m.key === dupKey && Math.abs(m.year - gameYear()) < 2;
  });
  if (exists) return;
  S.lifeMoments.push({
    key: dupKey,
    title: title,
    description: description || '',
    year: gameYear(),
    age: S.age,
    chapter: getChapter().key,
    icon: options.icon || '📌',
    weight: options.weight || 1
  });
  log('📌 ' + title);
}
window.recordMoment = recordMoment;

function getMoments() {
  if (!S || !Array.isArray(S.lifeMoments)) return [];
  return S.lifeMoments.slice().sort(function(a, b) { return b.year - a.year; });
}
window.getMoments = getMoments;

/* ---------- REFLECTIONS — the inner voice ---------- */
function emitReflection(text, options) {
  if (!S || !text) return;
  options = options || {};
  if (!S.log) S.log = [];
  S.log.unshift({
    age: S.age,
    year: gameYear(),
    month: S.month || null,
    msg: text,
    isReflection: true,
    mood: options.mood || 'neutral'
  });
  if (S.log.length > 300) S.log.pop();
  if (!S.reflections) S.reflections = [];
  S.reflections.push({ year: gameYear(), age: S.age, text: text, mood: options.mood || 'neutral' });
  if (S.reflections.length > 80) S.reflections.shift();
}
window.emitReflection = emitReflection;

/* ---------- REFLECTION POOL — triggered by life state ---------- */
function checkReflectionTriggers(kind, data) {
  if (!S) return;
  var age = S.age;

  /* Post-divorce */
  if (kind === 'divorce') {
    var pool = [
      'You sit alone in the apartment. It is too quiet. You wonder if you did the right thing.',
      'You see an old photo of the two of you. You feel nothing and everything at once.',
      'You try to remember when it stopped working. The memory is already fading.'
    ];
    emitReflection(pool[Math.floor(Math.random() * pool.length)], { mood: 'sad' });
    return;
  }

  /* Post-parent death */
  if (kind === 'parentDied') {
    var pool2 = [
      'You call your parent\'s number, out of habit. It rings. Nobody answers.',
      'You realize you can never ask them anything again. The weight of that is enormous.',
      'You catch yourself doing something they used to do. You stop, and just stand there.'
    ];
    emitReflection(pool2[Math.floor(Math.random() * pool2.length)], { mood: 'sad' });
    return;
  }

  /* Post-baby */
  if (kind === 'childBorn') {
    var pool3 = [
      'You hold the baby and suddenly understand why the world keeps turning.',
      'You feel the weight of the whole future in your arms. It terrifies and comforts you.',
      'You realize your own life is no longer the most important thing.'
    ];
    emitReflection(pool3[Math.floor(Math.random() * pool3.length)], { mood: 'hopeful' });
    return;
  }

  /* Post-migration */
  if (kind === 'migrated') {
    var pool4 = [
      'You are in a city that is not yours. Everyone here has a life that is not yours.',
      'You miss the sound of Arabic. Or whatever the sound was that used to be home.',
      'You take a photo of something small, to send to someone who is very far away.'
    ];
    emitReflection(pool4[Math.floor(Math.random() * pool4.length)], { mood: 'nostalgic' });
    return;
  }

  /* Age milestones */
  if (kind === 'milestone') {
    var ms = data && data.age;
    var pool5 = [];
    if (ms === 30) pool5 = [
      'Thirty. Your twenties are gone. You do not know if you used them well.',
      'Thirty. You had imagined something different by now. You are not sure what.'
    ];
    if (ms === 40) pool5 = [
      'Forty. The years ahead feel shorter than the years behind.',
      'Forty. You look at people in their twenties and remember being that uncertain.'
    ];
    if (ms === 50) pool5 = [
      'Fifty. Half a century. Your parents were this age once. Now you are.',
      'Fifty. What have you built? What have you let slip?'
    ];
    if (ms === 60) pool5 = [
      'Sixty. The word "retirement" is no longer abstract.',
      'Sixty. You wonder what you would tell yourself at twenty, if you could.'
    ];
    if (ms === 70) pool5 = [
      'Seventy. You are surrounded by what you made. And by what you lost.',
      'Seventy. You are the old person now. You feel exactly the same inside.'
    ];
    if (pool5.length > 0) {
      emitReflection(pool5[Math.floor(Math.random() * pool5.length)], { mood: 'reflective' });
    }
    return;
  }

  /* Wealth milestones */
  if (kind === 'rich') {
    emitReflection('You buy something expensive without checking the price. The old you would have cried at the price.', { mood: 'reflective' });
    return;
  }
  if (kind === 'poor') {
    emitReflection('You count the money in your pocket before buying bread.', { mood: 'sad' });
    return;
  }

  /* Health deterioration */
  if (kind === 'health') {
    emitReflection('You wake up and nothing hurts. You notice this because it does not happen often anymore.', { mood: 'tender' });
    return;
  }
}

/* ---------- CHARACTER EVOLUTION — your people grow with you ---------- */
function evolveSpouse() {
  if (!S || !S.marriage || !S.marriage.partner) return;
  var p = S.marriage.partner;
  if (p.alive === false) return;

  var yearsMarried = gameYear() - (p.marriedYear || gameYear());
  var bond = p.bond || 70;

  /* Personality deepens with time */
  if (!Array.isArray(p.evolvedTraits)) p.evolvedTraits = [];

  if (yearsMarried === 5) {
    if (bond > 70 && p.traits && p.traits.indexOf('romantic') >= 0) {
      p.evolvedTraits.push('still_romantic');
      emitReflection('You notice ' + p.name + ' still leaves you small notes on the fridge. Ten years and it still means something.', { mood: 'tender' });
    }
    if (bond < 40 && p.traits && p.traits.indexOf('grumpy') >= 0) {
      p.evolvedTraits.push('more_distant');
    }
  }

  if (yearsMarried === 10) {
    if (bond > 75) {
      p.traits = (p.traits || []).concat(['patient']);
      emitReflection('You and ' + p.name + ' can sit in silence now without it feeling wrong.', { mood: 'tender' });
    }
  }

  if (yearsMarried === 15 && bond > 60) {
    emitReflection(p.name + ' knows what you are thinking before you say it. It is comforting and slightly unnerving.', { mood: 'tender' });
  }

  /* Age-related shifts */
  if (p.age >= 55 && (p.health === undefined || p.health > 60)) {
    p.health = Math.max(60, (p.health || 100) - 2);
  }
  if (p.age >= 65) {
    p.bond = Math.max(0, (p.bond || 70) - 1); /* spouses need more care at old age */
  }

  /* Spouse reacts to being neglected */
  var recentHurt = (typeof relGetUnresolved === 'function') ? relGetUnresolved(p).filter(function(r) { return r.kind === 'hurt'; }) : [];
  if (recentHurt.length >= 3 && !p.spokenUp) {
    p.spokenUp = true;
    p.bond = Math.max(0, (p.bond || 70) - 5);
    emitReflection(p.name + ' said nothing today. That is unusual. You know what it means.', { mood: 'sad' });
  }
}
window.evolveSpouse = evolveSpouse;

function evolveParents() {
  if (!S || !Array.isArray(S.family)) return;
  S.family.forEach(function(m) {
    if (m.alive === false) return;
    if (m.role !== 'Mother' && m.role !== 'Father') return;

    /* Health decline begins at 65 */
    if (m.age >= 65 && typeof m.health === 'number') {
      m.health = Math.max(0, m.health - (m.age >= 80 ? 4 : 2));
    }

    /* Old parents need more contact */
    if (m.age >= 70 && m.bond > 30 && Math.random() < 0.20) {
      m.bond = Math.max(0, (m.bond || 70) - 2);
      emitReflection('You have not spoken to ' + m.name + ' in weeks. You should call.', { mood: 'guilt' });
    }

    /* Parent personality softens or hardens */
    if (m.age >= 70 && !m.finalWord) {
      m.finalWord = true;
      if ((m.bond || 70) >= 60) {
        emitReflection(m.name + ' looks tired but content. They seem at peace with you.', { mood: 'tender' });
      } else if ((m.bond || 70) < 40) {
        emitReflection(m.name + ' is quieter now. You cannot fix everything. You wonder if you should have tried.', { mood: 'sad' });
      }
    }
  });
}
window.evolveParents = evolveParents;

function evolveChildren() {
  if (!S || !Array.isArray(S.childrenList)) return;
  S.childrenList.forEach(function(c) {
    /* Assign personality at age 8 */
    if (c.age === 8 && !c.personality) {
      var pool = ['curious', 'shy', 'outgoing', 'bookish', 'sporty', 'artistic', 'stubborn', 'kind', 'sensitive', 'ambitious'];
      c.personality = pool[Math.floor(Math.random() * pool.length)];
      if (!Array.isArray(c.traits)) c.traits = [];
      c.traits.push(c.personality);
      recordMoment('The day you first saw who ' + c.name + ' is', c.name + ' is 8 now. Already, unmistakably, themself.', { icon: '👦', key: 'personality_' + c.id, weight: 2 });
    }

    /* Teenage rebellion or deepening at 15 */
    if (c.age === 15 && !c.teenMoment) {
      c.teenMoment = true;
      if ((c.bond || 55) > 60) {
        emitReflection(c.name + ' still tells you things. You are grateful for this.', { mood: 'tender' });
      } else if ((c.bond || 55) < 40) {
        emitReflection(c.name + ' barely speaks to you now. You cannot remember the last real conversation.', { mood: 'sad' });
      }
    }

    /* At 18, they choose their path */
    if (c.age === 18 && !c.adulthoodMoment) {
      c.adulthoodMoment = true;
      recordMoment(c.name + ' turned 18', c.name + ' is an adult now. You watch them make their first real choices.', { icon: '🎓', key: 'adult_' + c.id, weight: 2 });
    }

    /* At 22, they leave — record the moment */
    if (c.age === 22 && c.movedOut && !c.leavingMoment) {
      c.leavingMoment = true;
      recordMoment(c.name + ' left home', 'The room is still theirs. It still smells like them. It is too quiet now.', { icon: '🚪', key: 'left_' + c.id, weight: 2 });
    }
  });
}
window.evolveChildren = evolveChildren;

/* ---------- YEARLY EVOLUTION TRIGGER ---------- */
GameHooks.on('year', function() {
  if (!S) return;
  evolveSpouse();
  evolveParents();
  evolveChildren();

  /* Age milestones */
  var milestones = [30, 40, 50, 60, 70];
  if (milestones.indexOf(S.age) >= 0) {
    checkReflectionTriggers('milestone', { age: S.age });
  }

  /* Wealth milestones */
  if (S.age >= 18) {
    var w = S.wealth || 0;
    if (w >= 1000000 && !S.flags.richMoment) {
      S.flags.richMoment = true;
      checkReflectionTriggers('rich');
    }
    if (w < 0 && !S.flags.poorMoment) {
      S.flags.poorMoment = true;
      checkReflectionTriggers('poor');
    }
    if (w >= 0) S.flags.poorMoment = false;
    if (w < 1000000) S.flags.richMoment = false;
  }

  /* Health reflection */
  if (S.age > 45 && S.health > 70 && !S.flags.healthRelief) {
    S.flags.healthRelief = true;
    checkReflectionTriggers('health');
  }
});

/* ---------- MIGRATION ---------- */
(function() {
  var origMigrate = migrateDualState;
  migrateDualState = function() {
    origMigrate();
    if (!S) return;
    if (!S.lifeMoments) S.lifeMoments = [];
    if (!S.reflections) S.reflections = [];
  };
})();
window.migrateDualState = migrateDualState;
/* ============================================================
   UNITY PASS — WEEK 6: SPOUSE FINANCIAL SYNC + WHISPER SYSTEM
   ============================================================ */

/* ---------- SPOUSE FINANCIAL SYNC — one source of truth ---------- */
function syncSpouseFinancials() {
  if (!S || !S.marriage || !S.marriage.partner) return;
  var p = S.marriage.partner;
  if (!p.career) return;

  /* Not working → income must be 0 */
  if (p.career.working === false) {
    if (p.income !== 0) p.income = 0;
    return;
  }

  /* ---- CAREER.SALARY IS AUTHORITATIVE ----
     If career.salary is 0 or missing, use income as legacy base.
     Otherwise, use career.salary as the real track-based value. */
  var careerSal = p.career.salary || 0;
  var income = p.income || 0;
  var canonical = careerSal;

  if (canonical === 0 && income > 0) {
    /* Legacy save: career exists but salary missing — adopt income as base */
    p.career.salary = income;
    canonical = income;
  }

  /* Cap at track max × 1.3 (allows 30% premium for bonuses / cost of living in role) */
  if (typeof carTrackById === 'function') {
    var track = carTrackById(p.career.track);
    if (track && track.levels && track.levels.length > 0) {
      var maxBase = track.levels[track.levels.length - 1].baseSalaryEGP;
      var rate = (C().rate || 1) / 52.7;
      var maxLocal = Math.round(maxBase * rate * 1.3);
      if (canonical > maxLocal) canonical = maxLocal;
    }
  }

  /* Part-time is 60% of canonical */
  if (p.career.working === 'part-time') {
    canonical = Math.round(canonical * 0.6);
  }

  /* Set BOTH fields to canonical — they always agree after this */
  var changed = false;
  if (Math.abs((p.career.salary || 0) - canonical) > 1) {
    p.career.salary = canonical;
    changed = true;
  }
  if (Math.abs(income - canonical) > 1) {
    if (income > canonical && (income - canonical) > (canonical * 0.3)) {
      /* Only log if income was significantly higher (avoid noisy logs) */
      log('💼 ' + p.name + ' income adjusted to ' + money(canonical) + '/yr (was ' + money(income) + ').');
    }
    p.income = canonical;
    changed = true;
  }

  /* Sync S.household after change so it never shows stale */
  if (changed && typeof computeHousehold === 'function') {
    S.household = computeHousehold();
  }
}
window.syncSpouseFinancials = syncSpouseFinancials;

/* ---------- WHISPER SYSTEM — foreshadowing before consequences ---------- */
const WHISPER_POOLS = {
  layoff: [
    "Company-wide email about 'restructuring.' Nobody says the word layoff.",
    "Your manager cancelled 1-on-1s this week. Unusual.",
    "Two senior people left quietly. Their desks were cleared by lunch.",
    "The office feels emptier than usual. People are speaking in whispers.",
    "HR scheduled 'individual meetings' with three teams. Yours included."
  ],
  divorce: [
    "Conversations have become logistics. Who picks up groceries. Who takes the car.",
    "Your spouse sleeps with their back to you now. Small thing. Not small.",
    "You realise you have not laughed together in months.",
    "There is a silence in the apartment that was not there before.",
    "You catch them staring at the wall, not at you.",
    "You cook for one most nights now."
  ],
  bankruptcy: [
    "You check your bank balance. Then close the app. Then check again.",
    "You delay paying a bill this month. Just this once.",
    "At the shop, someone asks a price and you pretend not to hear.",
    "You calculate how many days before rent is due.",
    "You consider selling something you love. You do not. Yet."
  ],
  health: [
    "You get winded climbing the stairs. Just twice. It passes.",
    "There was a pain in your chest. Sharp. Then gone.",
    "You wake at 3 AM for no reason. Heart racing.",
    "You have been tired for weeks. Not the normal tired.",
    "Your hands shake holding a cup. It stops when you notice."
  ],
  parentdeath: [
    "Your parent's voice sounds older on the phone.",
    "You notice how thin they have gotten. How slow they walk.",
    "They fall asleep during the visit. You let them.",
    "Your mother asks about the small things more often now. The things she used to say were unimportant.",
    "You find yourself taking more photos. You do not know why. You do."
  ],
  migration: [
    "You scroll through job listings in another country at 2 AM.",
    "A friend abroad posts a photo. You stare at it too long.",
    "There is another life you could be living. You can feel it under the surface.",
    "You calculate, quietly, what leaving would cost.",
    "Someone asks where you are from and you hesitate."
  ]
};

const WHISPER_CONDITIONS = {
  layoff: function() {
    if (!S || !S.career || !S.career.job) return false;
    var job = S.career.job;
    if ((job.performance || 50) < 40) return true;
    if (typeof job.stability === 'number' && job.stability < 0.7) return true;
    if (S.age >= 50 && (job.performance || 50) < 60) return true;
    return false;
  },
  divorce: function() {
    if (!S || !S.marriage || !S.marriage.partner || S.marriage.status !== 'married') return false;
    var p = S.marriage.partner;
    if ((p.bond || 70) < 40) return true;
    if ((p.trust || 50) < 30) return true;
    if (typeof relGetUnresolved === 'function') {
      var hurts = relGetUnresolved(p).filter(function(r) { return r.kind === 'hurt'; });
      if (hurts.length >= 2) return true;
    }
    return false;
  },
  bankruptcy: function() {
    if (!S) return false;
    if ((S.wealth || 0) < 0) return true;
    var h = S.household;
    if (h && h.expenses > 0 && (S.wealth || 0) < h.expenses * 0.2) return true;
    return false;
  },
  health: function() {
    if (!S) return false;
    if ((S.health || 100) < 50) return true;
    if (S.age >= 55 && (S.health || 100) < 65) return true;
    return false;
  },
  parentdeath: function() {
    if (!S || !Array.isArray(S.family)) return false;
    return S.family.some(function(m) {
      return m.alive !== false && (m.role === 'Mother' || m.role === 'Father') && (m.age || 0) >= 68;
    });
  },
  migration: function() {
    if (!S) return false;
    if (S.age < 25 || S.age > 50) return false;
    if (S.career && S.career.job && (S.career.job.performance || 50) < 50 && (S.career.job.tenure || 0) >= 3) return true;
    return false;
  }
};

function ensureWhispers() {
  if (!S) return;
  if (!S.whisperLog) S.whisperLog = {};
  Object.keys(WHISPER_POOLS).forEach(function(k) {
    if (!Array.isArray(S.whisperLog[k])) S.whisperLog[k] = [];
  });
  if (!S.whisperFiredYear) S.whisperFiredYear = {};
}

function whisperFire(cat) {
  if (!S) return;
  ensureWhispers();
  if (S.whisperFiredYear[cat] === gameYear()) return;
  if (!WHISPER_POOLS[cat] || !WHISPER_POOLS[cat].length) return;
  var text = WHISPER_POOLS[cat][Math.floor(Math.random() * WHISPER_POOLS[cat].length)];
  S.whisperLog[cat].push({ year: gameYear(), text: text });
  S.whisperFiredYear[cat] = gameYear();
  log('🌫 ' + text);
}

function whisperClear(cat) {
  if (!S) return;
  ensureWhispers();
  var count = (S.whisperLog[cat] || []).length;
  S.whisperLog[cat] = [];
  S.whisperFiredYear[cat] = null;
  if (count > 0) {
    log('🌤 The tension around your ' + cat + ' has broken.');
  }
}

function checkWhispers() {
  if (!S || S.age < 18) return;
  ensureWhispers();
  Object.keys(WHISPER_CONDITIONS).forEach(function(cat) {
    try {
      if (WHISPER_CONDITIONS[cat]()) {
        if (Math.random() < 0.60) whisperFire(cat);
      } else {
        if ((S.whisperLog[cat] || []).length > 0) whisperClear(cat);
      }
    } catch (e) { /* ignore */ }
  });
}
window.checkWhispers = checkWhispers;
window.whisperFire = whisperFire;
window.whisperClear = whisperClear;
/* ============================================================
   UNITY PASS — WEEK 7: THE BEAT PASS
   Every year becomes a moment you feel.
   ============================================================ */

/* ---------- SPOUSE CAREER LEVEL FIX ---------- */
/* Old bug: partner_promotion multiplied salary each time (14 × 1.15 = 7x).
   Fix: salary follows career level, not multiplier. Cap at track max. */
function correctSpouseCareerSalary() {
  if (!S || !S.marriage || !S.marriage.partner) return;
  var p = S.marriage.partner;
  if (!p.career || typeof p.career.level !== 'number' || !p.career.track) return;
  if (typeof carTrackById !== 'function') return;

  var track = carTrackById(p.career.track);
  if (!track || !track.levels || !track.levels.length) return;

  var maxLevel = track.levels.length - 1;
  if (p.career.level > maxLevel) p.career.level = maxLevel;

  var levelDef = track.levels[p.career.level];
  if (!levelDef) return;

  var rate = (C().rate || 1) / 52.7;
  var expected = Math.round(levelDef.baseSalaryEGP * rate);

  /* If income is way off (more than 50% higher than level suggests), correct it */
  if (p.income > expected * 1.5 || p.income < expected * 0.5) {
    var oldIncome = p.income;
    p.career.salary = expected;
    p.income = expected;
    if (typeof log === 'function' && Math.abs(oldIncome - expected) > expected * 0.3) {
      log('🔧 ' + p.name + '\'s salary corrected to match their career level (' + money(expected) + ').');
    }
  }
  /* Ensure career.salary and income match */
  if (p.career.salary !== p.income) p.career.salary = p.income;
  /* Update title to match level */
  if (levelDef.title && p.career.title !== levelDef.title) {
    p.career.title = levelDef.title;
  }
}
window.correctSpouseCareerSalary = correctSpouseCareerSalary;

/* Run correction on migrate */
var _origMigrateDualState = migrateDualState;
migrateDualState = function() {
  _origMigrateDualState();
  if (typeof correctSpouseCareerSalary === 'function') correctSpouseCareerSalary();
};
window.migrateDualState = migrateDualState;

/* ---------- YEAR SNAPSHOT ---------- */
function snapshotForNarrative() {
  if (!S) return {};
  return {
    age: S.age,
    wealth: S.wealth || 0,
    health: S.health || 100,
    happiness: S.happiness || 50,
    jobTitle: (S.career && S.career.job) ? S.career.job.title : null,
    jobSalary: (S.career && S.career.job) ? (S.career.job.salary || 0) : 0,
    marriageStatus: (S.marriage && S.marriage.status) || 'single',
    partnerName: (S.marriage && S.marriage.partner) ? S.marriage.partner.name : null,
    partnerBond: (S.marriage && S.marriage.partner) ? (S.marriage.partner.bond || 70) : 0,
    childrenCount: (S.childrenList || []).length,
    childrenAges: (S.childrenList || []).map(function(c) {
      return { id: c.id, name: c.name, age: c.age, bond: c.bond || 55 };
    }),
    housing: S.housing,
    country: S.country,
    logLength: (S.log || []).length
  };
}

/* ---------- NARRATE THE YEAR ---------- */
function narrateYear(before, after) {
  var b = [];

  /* Job */
  if (before.jobTitle !== after.jobTitle) {
    if (!before.jobTitle && after.jobTitle) {
      b.push('💼 You started a new job as ' + after.jobTitle + '.');
    } else if (before.jobTitle && !after.jobTitle) {
      b.push('💼 You lost your job.');
    } else if (after.jobSalary > before.jobSalary * 1.05) {
      b.push('📈 You were promoted to ' + after.jobTitle + '.');
    }
  }

  /* Marriage status */
  if (before.marriageStatus !== after.marriageStatus) {
    if (after.marriageStatus === 'married') b.push('💍 You married ' + after.partnerName + '.');
    else if (after.marriageStatus === 'divorced') b.push('💔 You divorced ' + before.partnerName + '.');
    else if (after.marriageStatus === 'engaged') b.push('💍 You got engaged to ' + after.partnerName + '.');
  }

  /* Marriage bond */
  if (before.marriageStatus === 'married' && after.marriageStatus === 'married') {
    var bondDelta = after.partnerBond - before.partnerBond;
    if (bondDelta <= -10) b.push('💔 Your marriage grew strained.');
    else if (bondDelta >= 10) b.push('💞 Your bond with ' + after.partnerName + ' deepened.');
  }

  /* Children born */
  if (after.childrenCount > before.childrenCount) {
    var newKids = after.childrenCount - before.childrenCount;
    b.push('👶 ' + (newKids === 1 ? 'You had a child.' : 'You had ' + newKids + ' children.'));
  }

  /* Children milestones */
  after.childrenAges.forEach(function(afterChild) {
    var beforeChild = before.childrenAges.find(function(b) { return b.id === afterChild.id; });
    if (!beforeChild) return;
    if (afterChild.age === 5) b.push('👧 ' + afterChild.name + ' turned 5.');
    if (afterChild.age === 13) b.push('👦 ' + afterChild.name + ' is now a teenager.');
    if (afterChild.age === 18) b.push('🎓 ' + afterChild.name + ' became an adult.');
    if (beforeChild.bond - afterChild.bond > 15) b.push('💔 ' + afterChild.name + ' is pulling away from you.');
    else if (afterChild.bond - beforeChild.bond > 15) b.push('💞 You grew closer to ' + afterChild.name + '.');
  });

  /* Money */
  var delta = after.wealth - before.wealth;
  if (Math.abs(delta) >= 20000) {
    if (delta > 0) b.push('💰 Your savings grew by ' + money(delta) + '.');
    else b.push('💸 You spent ' + money(-delta) + ' more than you earned.');
  }

  /* Health */
  if (after.health < before.health - 10) b.push('❤️ Your health declined.');
  else if (after.health > before.health + 10) b.push('💚 Your health improved.');

  /* Housing */
  if (before.housing !== after.housing) {
    if (after.housing === 'owned') b.push('🏡 You became a homeowner.');
    else if (after.housing === 'rented') b.push('🏠 You moved into a rental.');
    else if (after.housing === 'parents') b.push('🏠 You moved back in with family.');
  }

  /* Country */
  if (before.country !== after.country) {
    b.push('🌍 You moved abroad.');
  }

  /* Nothing is also a story */
  if (b.length === 0) {
    b.push('A quiet year. Nothing much changed.');
    b.push('You kept going.');
  }

  return b;
}

/* ---------- SHOW THE BEAT MODAL ---------- */
function showYearBeat(year, age, bullets) {
  var existing = document.getElementById('year-beat');
  if (existing) existing.remove();

  var bulletsHtml = '';
  bullets.forEach(function(bullet) {
    bulletsHtml += '<div style="padding:7px 0;font-size:.88rem;line-height:1.45;color:#e8e8f2;border-bottom:1px solid #1a1a2a">' + bullet + '</div>';
  });

  var modal = document.createElement('div');
  modal.id = 'year-beat';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,0.82);backdrop-filter:blur(6px);z-index:2500;display:flex;align-items:center;justify-content:center;padding:20px;animation:ybFade .3s ease-out';
  modal.innerHTML =
    '<div style="max-width:400px;width:100%;background:#14141f;border:1px solid #8b5cf6;border-radius:14px;padding:20px;box-shadow:0 10px 40px rgba(139,92,246,0.35)">' +
    '<div style="text-align:center;margin-bottom:14px">' +
    '<div style="font-size:2.4rem;font-weight:900;color:#8b5cf6;letter-spacing:.04em;line-height:1;font-family:monospace">' + year + '</div>' +
    '<div style="font-size:.75rem;color:#888;margin-top:6px;letter-spacing:.12em;font-weight:700">AGE ' + age + '</div>' +
    '</div>' +
    '<div>' + bulletsHtml + '</div>' +
    '<button onclick="dismissYearBeat()" style="width:100%;margin-top:16px;padding:14px;background:#8b5cf6;color:#fff;border:none;border-radius:10px;font-size:.92rem;font-weight:700;cursor:pointer">Continue →</button>' +
    '</div>';

  /* Add animation keyframes if not present */
  if (!document.getElementById('yb-keyframes')) {
    var style = document.createElement('style');
    style.id = 'yb-keyframes';
    style.textContent = '@keyframes ybFade{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}';
    document.head.appendChild(style);
  }

  document.body.appendChild(modal);
}

window.dismissYearBeat = function() {
  var el = document.getElementById('year-beat');
  if (!el) return;
  el.style.transition = 'opacity .2s';
  el.style.opacity = '0';
  setTimeout(function() { el.remove(); }, 200);
};

/* ---------- AMBIENT SMALL CHOICES ---------- */
const AMBIENT_CHOICES = [
  {
    id: 'free_evening',
    weight: 10,
    minAge: 16, maxAge: 80,
    text: 'You have a free evening. How do you spend it?',
    choices: [
      { label: '📖 Read a book', effect: function(s) { fx({ smarts: 3, happiness: 2 }); } },
      { label: '💪 Exercise', effect: function(s) { fx({ health: 3, happiness: 1 }); } },
      { label: '📞 Call your mother', effect: function(s) {
          var mom = (s.family || []).find(function(m) { return m.role === 'Mother' && m.alive !== false; });
          if (mom) mom.bond = Math.min(100, (mom.bond || 70) + 4);
          fx({ happiness: 2 });
        }
      },
      { label: '💼 Work late', effect: function(s) {
          if (s.career && s.career.job) s.career.job.performance = Math.min(100, (s.career.job.performance || 50) + 4);
          fx({ happiness: -2, health: -1 });
        }
      }
    ]
  },
  {
    id: 'windfall',
    weight: 6,
    minAge: 20, maxAge: 70,
    text: 'You have some unexpected cash this month. What do you do?',
    choices: [
      { label: '💰 Save it for later', effect: function(s) { fx({ wealth: evtMoney(3000), happiness: 2 }); } },
      { label: '🎁 Treat yourself', effect: function(s) { s.wealth -= evtMoney(2000); fx({ happiness: 5 }); } },
      { label: '👨‍👩‍👧 Give it to family', effect: function(s) {
          var fam = (s.family || []).filter(function(m) { return m.alive !== false; });
          fam.forEach(function(m) { m.bond = Math.min(100, (m.bond || 70) + 3); });
          fx({ happiness: 3 });
        }
      }
    ]
  },
  {
    id: 'coworker_lunch',
    weight: 8,
    minAge: 22, maxAge: 65,
    condition: function(s) { return !!(s.career && s.career.job); },
    text: 'A coworker invites you to lunch. You have work to catch up on.',
    choices: [
      { label: '🍽 Go anyway', effect: function(s) { s.wealth -= evtMoney(500); fx({ happiness: 3, social: 2 }); } },
      { label: '💼 Stay and work through lunch', effect: function(s) {
          if (s.career && s.career.job) s.career.job.performance = Math.min(100, (s.career.job.performance || 50) + 3);
          fx({ social: -2 });
        }
      },
      { label: '🥪 Suggest eating at your desks together', effect: function(s) { fx({ social: 2, happiness: 1 }); } }
    ]
  },
  {
    id: 'partner_gift',
    weight: 8,
    minAge: 24, maxAge: 65,
    condition: function(s) { return !!(s.marriage && s.marriage.status === 'married' && s.marriage.partner); },
    text: 'Your spouse has seemed down lately. You could do something to cheer them up.',
    choices: [
      { label: '🎁 Buy them a gift', effect: function(s) {
          if (s.wealth >= evtMoney(3000)) {
            s.wealth -= evtMoney(3000);
            if (s.marriage && s.marriage.partner) s.marriage.partner.bond = Math.min(100, (s.marriage.partner.bond || 70) + 8);
            fx({ happiness: 4 });
          }
        }
      },
      { label: '💬 Have a real conversation', effect: function(s) {
          if (s.marriage && s.marriage.partner) {
            s.marriage.partner.bond = Math.min(100, (s.marriage.partner.bond || 70) + 5);
            s.marriage.partner.trust = Math.min(100, (s.marriage.partner.trust || 50) + 5);
          }
          fx({ happiness: 3 });
        }
      },
      { label: '😶 Say nothing — you are tired', effect: function(s) {
          if (s.marriage && s.marriage.partner) s.marriage.partner.bond = Math.max(0, (s.marriage.partner.bond || 70) - 2);
        }
      }
    ]
  },
  {
    id: 'child_time',
    weight: 10,
    minAge: 26, maxAge: 65,
    condition: function(s) { return (s.childrenList || []).length > 0; },
    text: 'One of your children wants your attention. You have work and errands.',
    choices: [
      { label: '⏰ Make time for them', effect: function(s) {
          (s.childrenList || []).forEach(function(c) {
            c.bond = Math.min(100, (c.bond || 55) + 6);
            c.happiness = Math.min(100, (c.happiness || 70) + 5);
          });
          fx({ happiness: 4 });
        }
      },
      { label: '💼 Tell them later', effect: function(s) {
          (s.childrenList || []).forEach(function(c) { c.bond = Math.max(0, (c.bond || 55) - 3); });
        }
      },
      { label: '💰 Promise to buy them something instead', effect: function(s) {
          if (s.wealth >= evtMoney(1000)) {
            s.wealth -= evtMoney(1000);
            (s.childrenList || []).forEach(function(c) {
              c.bond = Math.min(100, (c.bond || 55) + 2);
              c.happiness = Math.min(100, (c.happiness || 70) + 3);
            });
          }
        }
      }
    ]
  },
  {
    id: 'weekend_sleep',
    weight: 7,
    minAge: 18, maxAge: 75,
    text: 'It is the weekend. You have no obligations.',
    choices: [
      { label: '😴 Sleep in and rest', effect: function(s) { fx({ health: 2, happiness: 3 }); } },
      { label: '🧹 Clean the house', effect: function(s) { fx({ happiness: 1, social: 1 }); } },
      { label: '🚶 Go for a long walk', effect: function(s) { fx({ health: 3, happiness: 2 }); } }
    ]
  }
];

function fireAmbientChoice() {
  if (!S || S.pending) return false;
  var eligible = AMBIENT_CHOICES.filter(function(c) {
    if (S.age < c.minAge || S.age > c.maxAge) return false;
    if (c.condition && !c.condition(S)) return false;
    return true;
  });
  if (eligible.length === 0) return false;

  var totalW = eligible.reduce(function(s, c) { return s + (c.weight || 1); }, 0);
  var roll = Math.random() * totalW;
  var chosen = eligible[0];
  for (var i = 0; i < eligible.length; i++) {
    roll -= (eligible[i].weight || 1);
    if (roll <= 0) { chosen = eligible[i]; break; }
  }

  S.pending = {
    title: '🤔 A Small Choice',
    text: chosen.text,
    choices: chosen.choices.map(function(ch) {
      return { label: ch.label, effect: ch.effect };
    })
  };
  S.evId = 'ambient_' + chosen.id;
  return true;
}
window.fireAmbientChoice = fireAmbientChoice;

/* Wire whisper clearing to the signals that resolve each category */
if (typeof onSignal === 'function') {
  onSignal('jobLost', function() { whisperClear('layoff'); });
  onSignal('divorce', function() { whisperClear('divorce'); });
  onSignal('bankrupt', function() { whisperClear('bankruptcy'); });
  onSignal('parentDied', function() { whisperClear('parentdeath'); });
}

/* ---------- TICK WIRING ---------- */
GameHooks.on('year', function() {
  if (!S) return;
  if (typeof syncSpouseFinancials === 'function') syncSpouseFinancials();
  if (typeof correctSpouseCareerSalary === 'function') correctSpouseCareerSalary();
  if (typeof checkWhispers === 'function') checkWhispers();
});

/* Ambient small choices — fire ~55% of years, after big event resolution */
GameHooks.on('render', function() {
  if (!S) return;
  if (S.pending) return;
  if (S._ambientFiredThisYear === gameYear()) return;
  if (S.age < 16) return;
  /* Only fire if no beat modal is showing AND no event is pending */
  if (document.getElementById('year-beat')) return;
  if (Math.random() > 0.55) {
    S._ambientFiredThisYear = gameYear();
    return;
  }
  var fired = false;
  try { fired = fireAmbientChoice(); } catch (e) { console.warn('[Ambient]', e); }
  S._ambientFiredThisYear = gameYear();
  if (fired) render();
});

GameHooks.on('render', function() {
  if (!S) return;
  if (typeof syncSpouseFinancials === 'function') syncSpouseFinancials();
});
/* ============================================================
   UNITY PASS — WEEK 4: RELATIONSHIP MEMORY
   Every person remembers what you did. Promises echo forward.
   ============================================================ */
function relKey(rel) {
  if (!rel) return null;
  if (typeof rel === 'string') return rel;
  if (rel.id) return 'id_' + rel.id;
  if (rel.name) return 'name_' + rel.name;
  return null;
}
window.relKey = relKey;

function relRemember(rel, kind, text, resolved) {
  if (!S) return;
  var key = relKey(rel);
  if (!key) return;
  if (!S.relMemory) S.relMemory = {};
  if (!S.relMemory[key]) S.relMemory[key] = [];
  S.relMemory[key].push({
    year: gameYear(),
    kind: kind,
    text: text,
    resolved: !!resolved
  });
  if (S.relMemory[key].length > 40) S.relMemory[key].shift();
}
window.relRemember = relRemember;

function relGet(rel) {
  var key = relKey(rel);
  if (!S || !S.relMemory || !S.relMemory[key]) return [];
  return S.relMemory[key];
}
window.relGet = relGet;

function relGetUnresolved(rel) {
  return relGet(rel).filter(function(r) { return !r.resolved; });
}
window.relGetUnresolved = relGetUnresolved;

function relCount(rel, kind) {
  return relGet(rel).filter(function(r) { return r.kind === kind; }).length;
}
window.relCount = relCount;

function relResolveLatest(rel, kind) {
  var arr = relGet(rel);
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i].kind === kind && !arr[i].resolved) {
      arr[i].resolved = true;
      return true;
    }
  }
  return false;
}
window.relResolveLatest = relResolveLatest;

/* Yearly echo — unresolved hurts compound into relationship tension */
GameHooks.on('year', function() {
  if (!S) return;
  if (!S.relMemory) return;

  /* Partner: 2+ unresolved hurts over 3 years → bond drop + potential crisis */
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    var hurts = relGetUnresolved(S.marriage.partner).filter(function(r) {
      return r.kind === 'hurt' && gameYear() - r.year < 3;
    });
    if (hurts.length >= 2) {
      S.marriage.partner.bond = Math.max(0, (S.marriage.partner.bond || 70) - 3);
      S.marriage.partner.trust = Math.max(0, (S.marriage.partner.trust || 50) - 4);
      if (hurts.length >= 3 && S.marriage.partner.bond < 30 && !S.marriage.pendingConflict) {
        S.marriage.pendingConflict = 'communication';
      }
    }
    /* Promises kept resolve over time */
    var promises = relGet(S.marriage.partner).filter(function(r) {
      return r.kind === 'promise' && !r.resolved && gameYear() - r.year >= 2;
    });
    if (promises.length >= 2) {
      S.marriage.partner.bond = Math.max(0, (S.marriage.partner.bond || 70) - 2);
    }
  }
});
/* ============================================================
   EXPANDED MARRIAGE LIFE EVENTS
   ============================================================
   Deeply integrated with:
   - S.marriage (partner, bond, trust, stress, motherInLawBond)
   - S.shopping (gold, inventory, jewelry)
   - S.ownedHomes (marital home repairs, upgrades)
   - Voice audio synthesis via characterSay & characterSpeak
   ============================================================ */

const MARRIAGE_EXTENDED_EVENTS = [
  /* 1. Unannounced Mother-in-Law Spare Key */
  {
    id: 'inlaw_spare_key',
    weight: 12,
    condition: (s) => s.marriage && s.marriage.status === 'married' && s.marriage.motherInLawBond < 60,
    trigger: function(s) {
      const p = s.marriage.partner;
      const speech = characterSay(p, 'inlaw_clash');
      s.pending = {
        title: '🔑 The Unannounced Spare Key',
        text: `On a quiet morning, your front door opens. ${p.name}'s mother walks in carrying food containers, inspecting the living room dust.\n\n` +
              `"I have a key to my son's house," she remarks coldly. ${p.name} looks tense.\n\n` +
              `"${speech}"`,
        choices: [
          {
            label: '🔒 Politely ask for the key back & set boundaries',
            effect: function(st) {
              st.marriage.motherInLawBond = Math.max(0, st.marriage.motherInLawBond - 18);
              if (marHasTrait(p, 'mamas_boy')) {
                p.bond = Math.max(0, p.bond - 10);
                p.trust = Math.max(0, p.trust - 8);
                log('😤 You demanded the key back. His mother wept to his relatives. Bond decreased.');
              } else {
                p.bond = Math.min(100, p.bond + 6);
                p.trust = Math.min(100, p.trust + 8);
                log('🛡 You established firm household boundaries. Your spouse quietly respected your backbone.');
              }
              fx({ happiness: 2 });
            }
          },
          {
            label: '🍵 Bite your tongue and accept the food',
            effect: function(st) {
              st.marriage.motherInLawBond = Math.min(100, st.marriage.motherInLawBond + 10);
              st.marriage.stress = Math.min(100, (st.marriage.stress || 20) + 12);
              log('🤐 You smiled through clenched teeth. Her intrusions will continue, but family peace was preserved.');
              fx({ happiness: -5 });
            }
          },
          {
            label: '🚪 Change the door lock quietly next week',
            effect: function(st) {
              const lockCost = typeof marEGP === 'function' ? marEGP(2500) : 2500;
              st.wealth = Math.max(0, st.wealth - lockCost);
              st.marriage.motherInLawBond = Math.max(0, st.marriage.motherInLawBond - 25);
              log(`🔑 You installed a smart lock (${money(lockCost)}). She found out the next week and an uproar erupted.`);
              fx({ happiness: 4 });
            }
          }
        ]
      };
      s.evId = 'spare_key_' + gameYear();
      characterSpeak(speech, p);
    }
  },

  /* 2. Family Loan Request (In-Laws in Need) */
  {
    id: 'inlaw_loan_request',
    weight: 10,
    condition: (s) => s.marriage && s.marriage.status === 'married' && s.wealth > 30000,
    trigger: function(s) {
      const p = s.marriage.partner;
      const loanAmt = typeof marEGP === 'function' ? marEGP(40000) : 40000;
      const speech = characterSay(p, 'money_strain');
      s.pending = {
        title: '💸 Family Financial Request',
        text: `${p.name} sits you down over coffee with a strained expression.\n\n` +
              `"My brother is facing major debts and our parents asked if we can lend them ${money(loanAmt)}. It would mean so much to our standing."\n\n` +
              `"${speech}"`,
        choices: [
          {
            label: `🤝 Agree to lend the ${money(loanAmt)}`,
            effect: function(st) {
              if (st.wealth >= loanAmt) {
                st.wealth -= loanAmt;
                p.bond = Math.min(100, p.bond + 12);
                p.trust = Math.min(100, p.trust + 10);
                st.marriage.motherInLawBond = Math.min(100, st.marriage.motherInLawBond + 20);
                log(`🤝 You lent ${money(loanAmt)} to the in-laws. Their family regards you with deep gratitude.`);
                fx({ happiness: 5, social: 6 });
              } else {
                log('❌ You did not have enough liquid funds.');
              }
            }
          },
          {
            label: '🙅 Refuse — "We must protect our own household first"',
            effect: function(st) {
              p.bond = Math.max(0, p.bond - 12);
              st.marriage.motherInLawBond = Math.max(0, st.marriage.motherInLawBond - 15);
              st.marriage.stress = Math.min(100, (st.marriage.stress || 20) + 10);
              log('🛑 You stood firm against lending household money. The in-laws took it as an insult.');
              fx({ happiness: -4 });
            }
          },
          {
            label: `🎁 Offer half (${money(Math.round(loanAmt / 2))}) as a non-repayable gift`,
            effect: function(st) {
              const giftAmt = Math.round(loanAmt / 2);
              if (st.wealth >= giftAmt) {
                st.wealth -= giftAmt;
                p.bond = Math.min(100, p.bond + 6);
                p.trust = Math.min(100, p.trust + 6);
                st.marriage.motherInLawBond = Math.min(100, st.marriage.motherInLawBond + 8);
                log(`🎁 You offered a dignified compromise of ${money(giftAmt)} as a family gift without debt.`);
                fx({ happiness: 3 });
              }
            }
          }
        ]
      };
      s.evId = 'inlaw_loan_' + gameYear();
      characterSpeak(speech, p);
    }
  },

  /* 3. The Holiday / Eid Location War */
  {
    id: 'eid_holiday_clash',
    weight: 14,
    condition: (s) => s.marriage && s.marriage.status === 'married',
    trigger: function(s) {
      const p = s.marriage.partner;
      const holidayName = ['egy', 'sau', 'uae'].includes(s.country) ? 'The First Day of Eid' : 'The Holiday Season';
      s.pending = {
        title: `🎉 ${holidayName} Dilemma`,
        text: `${holidayName} is approaching, and both families expect you for the first day feast.\n\n` +
              `"My mother will be heartbroken if we aren't there for the morning gathering," ${p.name} insists.\n\n` +
              `Your own parents have already prepared the banquet.`,
        choices: [
          {
            label: `🏠 Spend morning with your family, evening with ${p.name}'s`,
            effect: function(st) {
              p.bond = Math.min(100, p.bond + 4);
              st.marriage.motherInLawBond = Math.min(100, st.marriage.motherInLawBond + 4);
              log('🚗 You split the day evenly. Exhausting driving across town, but both families felt honored.');
              fx({ happiness: 4, social: 6 });
            }
          },
          {
            label: `👵 Give priority to ${p.name}'s family this year`,
            effect: function(st) {
              p.bond = Math.min(100, p.bond + 10);
              st.marriage.motherInLawBond = Math.min(100, st.marriage.motherInLawBond + 15);
              (st.family || []).forEach(f => { if (f.role === 'Mother') f.bond = Math.max(0, f.bond - 6); });
              log(`👵 You prioritized ${p.name}'s family. Your in-laws were beaming with pride.`);
              fx({ happiness: 2 });
            }
          },
          {
            label: '✈️ Book a couples trip and skip both family obligations',
            effect: function(st) {
              const tripCost = typeof marEGP === 'function' ? marEGP(18000) : 18000;
              if (st.wealth >= tripCost) {
                st.wealth -= tripCost;
                p.bond = Math.min(100, p.bond + 12);
                p.chemistry = Math.min(100, (p.chemistry || 40) + 10);
                st.marriage.motherInLawBond = Math.max(0, st.marriage.motherInLawBond - 20);
                log(`✈️ You escaped the family politics on a private romantic holiday (${money(tripCost)}). Both sides gossiped.`);
                fx({ happiness: 12 });
              } else {
                log('❌ Could not afford the holiday getaway.');
              }
            }
          }
        ]
      };
      s.evId = 'holiday_clash_' + gameYear();
    }
  },

  /* 4. Gold / Shabka Dilemma During Inflation */
  {
    id: 'gold_liquidation_choice',
    weight: 9,
    condition: (s) => s.marriage && s.marriage.status === 'married' && s.gender === 'f' && Array.isArray(s.shopping && s.shopping.inventory) && s.shopping.inventory.some(i => i.cat === 'jewelry' && i.grams > 0),
    trigger: function(s) {
      const p = s.marriage.partner;
      const goldItems = s.shopping.inventory.filter(i => i.cat === 'jewelry' && i.grams > 0);
      const targetGold = goldItems[0];
      const goldVal = Math.round(targetGold.currentValue || (targetGold.grams * 4500));

      s.pending = {
        title: '🪙 Shabka Gold Liquidation Debate',
        text: `Gold prices have surged. ${p.name} mentions an investment opportunity or cash crunch.\n\n` +
              `"If we liquidate your ${targetGold.name} (${targetGold.grams}g), we could free up ${money(goldVal)} for investments."\n\n` +
              `In traditional customs, a bride's gold is strictly her personal financial insurance.`,
        choices: [
          {
            label: `💍 Sell the piece to invest together (${money(goldVal)})`,
            effect: function(st) {
              st.wealth += goldVal;
              st.shopping.inventory = st.shopping.inventory.filter(i => i.uid !== targetGold.uid);
              p.bond = Math.min(100, p.bond + 15);
              p.trust = Math.min(100, p.trust + 15);
              log(`🪙 You sold your ${targetGold.name} for ${money(goldVal)} to support household ambitions. ${p.name} is deeply grateful.`);
              fx({ happiness: 6 });
            }
          },
          {
            label: '🛑 Refuse: "My gold is my personal security, as agreed."',
            effect: function(st) {
              p.bond = Math.max(0, p.bond - 6);
              st.marriage.stress = Math.min(100, (st.marriage.stress || 20) + 6);
              log('💪 You held firm to your Shabka. Your personal security remains intact.');
            }
          }
        ]
      };
      s.evId = 'gold_debate_' + gameYear();
    }
  },

  /* 5. Late Night Suspicious Phone Notification */
  {
    id: 'phone_privacy_scare',
    weight: 8,
    condition: (s) => s.marriage && s.marriage.status === 'married' && !s.pending,
    trigger: function(s) {
      const p = s.marriage.partner;
      const speech = characterSay(p, 'jealousy');
      s.pending = {
        title: '📱 Late Night Notification',
        text: `At 11:30 PM, ${p.name}'s phone lights up on the bedside table with an unfamiliar message preview: "Thanks for today... you were amazing."\n\n` +
              `"${speech}"`,
        choices: [
          {
            label: '👀 Pick up the phone and check the full chat',
            effect: function(st) {
              if (marHasTrait(p, 'loyal')) {
                p.trust = Math.max(0, p.trust - 12);
                log('📱 You checked it: it was a colleague thanking them for saving a critical work project. Your spouse caught you and was offended.');
                fx({ happiness: -4 });
              } else if (Math.random() < 0.35) {
                log('💔 You unlocked it and discovered flirtatious messages. Trust is shattered.');
                p.trust = Math.max(0, p.trust - 35);
                p.bond = Math.max(0, p.bond - 25);
                fx({ happiness: -15 });
              } else {
                log('📱 Harmless message from an old schoolmate. You breathed a sigh of relief.');
              }
            }
          },
          {
            label: '💬 Ask them directly with calm maturity',
            effect: function(st) {
              p.trust = Math.min(100, p.trust + 6);
              p.communication = Math.min(100, (p.communication || 40) + 6);
              log(`💬 ${p.name} handed you the phone with a smile. "Work emergency, see?" Open communication strengthened your bond.`);
              fx({ happiness: 4 });
            }
          },
          {
            label: '😶 Ignore it and choose trust',
            effect: function(st) {
              p.trust = Math.min(100, p.trust + 4);
              log('🕊 You chose to trust your partner without letting suspicion fester.');
            }
          }
        ]
      };
      s.evId = 'phone_scare_' + gameYear();
      characterSpeak(speech, p);
    }
  },

  /* 6. Fertility Pressure from Extended Relatives */
  {
    id: 'extended_family_fertility_talk',
    weight: 11,
    condition: (s) => s.marriage && s.marriage.status === 'married' && (!s.childrenList || s.childrenList.length === 0) && (gameYear() - (s.marriage.partner.marriedYear || gameYear())) >= 2,
    trigger: function(s) {
      const p = s.marriage.partner;
      const speech = characterSay(p, 'baby_talk');
      s.pending = {
        title: '👶 The "When Are You Having Children?" Interrogation',
        text: `At a large family gathering, aunts and relatives gather around you both with tea.\n\n` +
              `"Two years married and the nest is still empty? We want to carry your children!"\n\n` +
              `"${speech}"`,
        choices: [
          {
            label: '👶 Decide together that the time has come to try for a baby',
            effect: function(st) {
              st.pregnantMonths = 1;
              p.bond = Math.min(100, p.bond + 12);
              st.marriage.motherInLawBond = Math.min(100, st.marriage.motherInLawBond + 15);
              log('🎉 You announced you are trying! Both families rejoiced.');
              fx({ happiness: 15 });
            }
          },
          {
            label: '🛡 "In God\'s timing. We are focusing on our home right now."',
            effect: function(st) {
              p.bond = Math.min(100, p.bond + 6);
              log('🛡 You gave a dignified, united answer. The relatives backed off gracefully.');
              fx({ happiness: 2 });
            }
          },
          {
            label: '😤 Shut down the intrusive question firmly',
            effect: function(st) {
              st.marriage.motherInLawBond = Math.max(0, st.marriage.motherInLawBond - 12);
              log('🛑 You stated that family planning is strictly private. An awkward silence filled the room.');
              fx({ happiness: -2 });
            }
          }
        ]
      };
      s.evId = 'fertility_pressure_' + gameYear();
      characterSpeak(speech, p);
    }
  },

  /* 7. Career Promotion Abroad / Relocation Offer */
  {
    id: 'spouse_abroad_offer',
    weight: 7,
    condition: (s) => s.marriage && s.marriage.status === 'married' && s.marriage.partner && s.marriage.partner.income > 100000,
    trigger: function(s) {
      const p = s.marriage.partner;
      const newSalary = Math.round(p.income * 1.6);
      s.pending = {
        title: '✈️ The Gulf / Overseas Job Offer',
        text: `${p.name} rushes home holding an official offer letter from a top international firm.\n\n` +
              `"They want me to lead a division abroad! The salary is ${money(newSalary)}/yr — but it means moving away from our families and hometown."`,
        choices: [
          {
            label: '🌍 "Let\'s do it! An adventure for our future."',
            effect: function(st) {
              p.income = newSalary;
              p.bond = Math.min(100, p.bond + 12);
              p.chemistry = Math.min(100, (p.chemistry || 40) + 8);
              log(`🌍 You backed the move! Household income increased to ${money(newSalary)}/year.`);
              fx({ happiness: 10, social: 4 });
            }
          },
          {
            label: '🏠 "Our life and family are here. Please decline."',
            effect: function(st) {
              if (marHasTrait(p, 'ambitious')) {
                p.bond = Math.max(0, p.bond - 14);
                st.marriage.stress = Math.min(100, (st.marriage.stress || 20) + 12);
                log('😞 You asked to stay. Your partner turned down the offer with a lingering sense of resentment.');
              } else {
                p.bond = Math.min(100, p.bond + 4);
                log('🏡 Your partner agreed that family closeness outweighs extra income.');
              }
            }
          }
        ]
      };
      s.evId = 'abroad_offer_' + gameYear();
    }
  },

  /* 8. Discovery of Hidden Personal Savings */
  {
    id: 'secret_savings_revealed',
    weight: 8,
    condition: (s) => s.marriage && s.marriage.status === 'married' && s.marriage.sharedAccountBalance > 0,
    trigger: function(s) {
      const p = s.marriage.partner;
      s.pending = {
        title: '💼 Financial Transparency Discussion',
        text: `While doing the annual tax and paperwork review, the question of separate bank accounts arises.\n\n` +
              `${p.name} notices you keep personal funds independent of the shared household balance.\n\n` +
              `"Are we building one shared life, or keeping one foot out the door?"`,
        choices: [
          {
            label: '🤝 "A separate reserve protects us both in emergencies"',
            effect: function(st) {
              p.trust = Math.min(100, p.trust + 5);
              p.communication = Math.min(100, (p.communication || 40) + 6);
              log('💬 A mature discussion about financial security and emergency independence followed.');
              fx({ happiness: 4 });
            }
          },
          {
            label: '💰 Transfer a significant portion into the Shared Account',
            effect: function(st) {
              const deposit = Math.min(st.wealth, typeof marEGP === 'function' ? marEGP(20000) : 20000);
              if (deposit > 0) {
                st.wealth -= deposit;
                st.marriage.sharedAccountBalance += deposit;
                p.bond = Math.min(100, p.bond + 12);
                p.trust = Math.min(100, p.trust + 10);
                log(`💰 You deposited ${money(deposit)} into the shared account. Your partner feels fully unified.`);
                fx({ happiness: 8 });
              }
            }
          }
        ]
      };
      s.evId = 'secret_savings_' + gameYear();
    }
  },

  /* 9. Critical Appliance Breakdown in the Marital Home */
  {
    id: 'home_appliance_crisis',
    weight: 12,
    condition: (s) => s.marriage && s.marriage.status === 'married' && Array.isArray(s.shopping && s.shopping.inventory) && s.shopping.inventory.some(i => i.cat === 'appliances'),
    trigger: function(s) {
      const p = s.marriage.partner;
      const repairCost = typeof marEGP === 'function' ? marEGP(5000) : 5000;
      s.pending = {
        title: '❄️ Household Breakdown',
        text: `Water is pooling on the kitchen floor! The refrigerator compressor died overnight, spoiling groceries and soaking cabinets.\n\n` +
              `${p.name} is overwhelmed and frustrated with household chores.\n\n` +
              `Emergency repair & replacement cost: ${money(repairCost)}.`,
        choices: [
          {
            label: `💸 Pay immediately for emergency premium technician (${money(repairCost)})`,
            effect: function(st) {
              if (st.wealth >= repairCost) {
                st.wealth -= repairCost;
                p.bond = Math.min(100, p.bond + 6);
                log(`🔧 Fixed with no hassle (${money(repairCost)}). Your fast action turned a nightmare into calm.`);
                fx({ happiness: 4 });
              } else {
                log('❌ Could not afford the repair cost.');
              }
            }
          },
          {
            label: '😤 Complain about costs and argue about who was responsible',
            effect: function(st) {
              p.bond = Math.max(0, p.bond - 8);
              st.marriage.stress = Math.min(100, (st.marriage.stress || 20) + 15);
              log('😞 The repair dispute escalated into a bitter evening of blaming each other.');
              fx({ happiness: -6 });
            }
          }
        ]
      };
      s.evId = 'appliance_crisis_' + gameYear();
    }
  },

  /* 10. Surprise Anniversary Romantic Gesture */
  {
    id: 'surprise_anniversary_date',
    weight: 10,
    condition: (s) => s.marriage && s.marriage.status === 'married' && s.marriage.partner && s.marriage.partner.bond > 60,
    trigger: function(s) {
      const p = s.marriage.partner;
      const speech = characterSay(p, 'affection');
      s.pending = {
        title: '💐 A Surprise from the Heart',
        text: `You arrive home to candlelight, soft music, and your favourite homemade dishes prepared on the dining table.\n\n` +
              `${p.name} embraces you gently.\n\n` +
              `"${speech}"`,
        choices: [
          {
            label: '❤️ Embrace them tightly and express your devotion',
            effect: function(st) {
              p.bond = Math.min(100, p.bond + 12);
              p.chemistry = Math.min(100, (p.chemistry || 40) + 10);
              st.marriage.stress = Math.max(0, (st.marriage.stress || 20) - 15);
              log(`❤️ A magical evening together reminded you both why you fell in love.`);
              fx({ happiness: 15 });
            }
          },
          {
            label: '🎁 Present them with a surprise piece of gold / gift in return',
            effect: function(st) {
              const giftCost = typeof marEGP === 'function' ? marEGP(8000) : 8000;
              if (st.wealth >= giftCost) {
                st.wealth -= giftCost;
                p.bond = 100;
                p.chemistry = Math.min(100, (p.chemistry || 40) + 15);
                st.marriage.stress = Math.max(0, (st.marriage.stress || 20) - 20);
                log(`🎁 You countered with a stunning gift (${money(giftCost)}). An unforgettable milestone.`);
                fx({ happiness: 20 });
              }
            }
          }
        ]
      };
      s.evId = 'anniversary_surprise_' + gameYear();
      characterSpeak(speech, p);
    }
  }
];

/* ============================================================
   INTEGRATION HOOK: RUNS WITH ANNUAL ENGINE TICK
   ============================================================ */
GameHooks.on('year', function() {
  if (!S || !S.marriage || S.marriage.status !== 'married' || S.pending) return;

  // 45% chance to roll one of the extended realistic marriage events each year
  if (Math.random() < 0.45) {
    const eligible = MARRIAGE_EXTENDED_EVENTS.filter(e => !e.condition || e.condition(S));
    if (eligible.length > 0) {
      const totalWeight = eligible.reduce((acc, ev) => acc + ev.weight, 0);
      let roll = Math.random() * totalWeight;
      for (let i = 0; i < eligible.length; i++) {
        roll -= eligible[i].weight;
        if (roll <= 0) {
          eligible[i].trigger(S);
          break;
        }
      }
    }
  }
});
/* ============================================================
   SESSION 8: ECONOMY ENGINE
   ============================================================ */

function econProfile(country) {
  if (typeof ECON_PROFILES === 'undefined') return null;
  return ECON_PROFILES[country] || ECON_PROFILES.egy;
}

/* Cumulative inflation from 2027 reference to target year */
function econCPI(country, year) {
  var prof = econProfile(country);
  if (!prof || !prof.inflationHistory) return 1;
  var target = year || gameYear();
  if (target === 2027) return 1;

  var cumulative = 1;
  var keys = Object.keys(prof.inflationHistory).map(Number).sort(function(a, b) { return a - b; });

  if (target > 2027) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k >= 2027 && k < target) cumulative *= (1 + prof.inflationHistory[k]);
    }
    /* Extrapolate past last known year */
    var lastKey = keys[keys.length - 1];
    if (target > lastKey) {
      var lastRate = prof.inflationHistory[lastKey];
      cumulative *= Math.pow(1 + lastRate, target - lastKey);
    }
  } else if (target < 2027) {
    for (var j = keys.length - 1; j >= 0; j--) {
      var kj = keys[j];
      if (kj < 2027 && kj >= target) cumulative /= (1 + prof.inflationHistory[kj]);
    }
  }
  return cumulative;
}

function econSalary(trackId, level, countryCode, year, sector) {
  if (typeof ECON_TRACK_BASE_USD === 'undefined') return 0;
  year = year || gameYear();
  countryCode = countryCode || (S ? S.country : 'egy');
  level = Math.max(0, Math.min(6, level || 0));
  var baseUSD = ECON_TRACK_BASE_USD[trackId] || ECON_TRACK_BASE_USD.entry;
  var levelMult = ECON_LEVEL_MULT[level] || 1.0;
  var prof = econProfile(countryCode);
  var sectorMult = ECON_SECTOR_MULT[sector || 'private'] || 1.0;
  var cpi = econCPI(countryCode, year);
  var country = COUNTRIES[countryCode];
  var rate = country ? (country.rate || 1) : 1;

  /* Annual local salary */
  var usdAnnual = baseUSD * 12 * levelMult * prof.salaryMult * sectorMult * cpi;
  return Math.round(usdAnnual * rate);
}
window.econSalary = econSalary;

function econPriceMonthly(category, countryCode, year) {
  year = year || gameYear();
  countryCode = countryCode || (S ? S.country : 'egy');
  var baseUSD = { food: 400, phone: 30, transport: 150, internet: 40, utilities: 100, misc: 80 }[category] || 100;
  var prof = econProfile(countryCode);
  var cpi = econCPI(countryCode, year);
  var country = COUNTRIES[countryCode];
  var rate = country ? (country.rate || 1) : 1;
  return Math.round(baseUSD * prof.costMult * cpi * rate);
}
window.econPriceMonthly = econPriceMonthly;

function econRent(tier, countryCode, year) {
  year = year || gameYear();
  countryCode = countryCode || (S ? S.country : 'egy');
  var baseUSD = {
    shared_room: 100, studio: 200, br1: 350, br2: 550,
    br3: 800, furnished: 700, compound: 1200, villa: 3000
  }[tier] || 350;
  var prof = econProfile(countryCode);
  var cpi = econCPI(countryCode, year);
  var country = COUNTRIES[countryCode];
  var rate = country ? (country.rate || 1) : 1;
  var monthlyUSD = baseUSD * prof.rentMult * cpi;
  return Math.round(monthlyUSD * rate * 12);
}
window.econRent = econRent;

function econTax(annualSalary, countryCode, year) {
  var prof = econProfile(countryCode || (S ? S.country : 'egy'));
  if (!prof || !prof.taxBrackets) return 0;
  var rate = COUNTRIES[countryCode || (S ? S.country : 'egy')];
  var cpi = econCPI(countryCode || (S ? S.country : 'egy'), year);
  var rate2 = rate ? (rate.rate || 1) : 1;

  /* Convert brackets to current-year local currency */
  var remaining = annualSalary;
  var prev = 0;
  var tax = 0;
  for (var i = 0; i < prof.taxBrackets.length; i++) {
    var b = prof.taxBrackets[i];
    var upTo = b.upTo === Infinity ? Infinity : b.upTo * cpi * (rate2 / 52.7);
    var taxable = Math.min(remaining, upTo - prev);
    if (taxable <= 0) break;
    tax += taxable * b.rate;
    remaining -= taxable;
    prev = upTo;
    if (remaining <= 0) break;
  }
  return Math.round(tax);
}
window.econTax = econTax;

function econDifficulty(countryCode) {
  var prof = econProfile(countryCode || (S ? S.country : 'egy'));
  return prof ? prof.diff : 5;
}
window.econDifficulty = econDifficulty;

function econStruggles(countryCode) {
  var prof = econProfile(countryCode || (S ? S.country : 'egy'));
  return (prof && prof.struggles) || [];
}
window.econStruggles = econStruggles;

/* ============================================================
   APPLY ECONOMY TO EXISTING CAREER STATE
   ============================================================ */
function econRefreshJobSalary(job) {
  if (!job) return;
  if (!job.track) return;
  var sector = 'private';
  if (job.sector) sector = job.sector;
  else if (job.company) {
    var cname = (job.company || '').toLowerCase();
    if (cname.indexOf('ministry') >= 0 || cname.indexOf('government') >= 0 || cname.indexOf('public') >= 0) sector = 'government';
    else if (cname.indexOf('united nations') >= 0 || cname.indexOf('world bank') >= 0 || cname.indexOf('unicef') >= 0) sector = 'ngo';
  }
  var newSalary = econSalary(job.track, job.level || 0, S.country, gameYear(), sector);
  if (newSalary > 0) {
    job.salary = newSalary;
    job.baseSalaryEGP = newSalary;
    job.sector = sector;
  }
}
window.econRefreshJobSalary = econRefreshJobSalary;

/* Correct spouse salary based on their actual career level */
function econCorrectSpouseSalary() {
  if (!S || !S.marriage || !S.marriage.partner) return;
  var p = S.marriage.partner;
  if (!p.career || !p.career.track || p.career.working === false) {
    if (p.income !== 0) p.income = 0;
    return;
  }
  var expected = econSalary(p.career.track, p.career.level || 0, S.country, gameYear(), 'private');
  if (expected > 0) {
    p.career.salary = expected;
    p.income = expected;
  }
  if (p.career.working === 'part-time') {
    p.income = Math.round(expected * 0.6);
    p.career.salary = p.income;
  }
}
window.econCorrectSpouseSalary = econCorrectSpouseSalary;

/* Run correction on year tick + migrate */
GameHooks.on('year', function() {
  if (!S) return;
  if (typeof econCorrectSpouseSalary === 'function') econCorrectSpouseSalary();
  if (S.career && S.career.job && typeof econRefreshJobSalary === 'function') {
    /* Only refresh base if salary is wildly off (>30%) */
    var expected = econSalary(S.career.job.track, S.career.job.level || 0, S.country, gameYear(), S.career.job.sector || 'private');
    if (expected > 0 && Math.abs(S.career.job.salary - expected) > expected * 0.3) {
      S.career.job.salary = expected;
      S.career.job.baseSalaryEGP = expected;
      log('🔧 Your salary corrected to market rate: ' + money(expected) + '/year.');
    }
  }
});

/* Migrate hook */
var _origMigrateEcon = migrateDualState;
migrateDualState = function() {
  _origMigrateEcon();
  if (!S) return;
  if (typeof econCorrectSpouseSalary === 'function') econCorrectSpouseSalary();
};
window.migrateDualState = migrateDualState;

/* ============================================================
   UPDATE computeHousehold TO USE ECON
   Replace food/rent/phone/transport references
   ============================================================ */
var _origComputeHousehold = computeHousehold;
computeHousehold = function() {
  var h = _origComputeHousehold();
  if (!S) return h;

  var c = C();
  var year = gameYear();

  /* Replace fallback items with econ-priced values */
  var useLifestyle = S.lifestyle && S.lifestyle.active;
  if (!useLifestyle) {
    /* Rebuild base costs from econ */
    var newFood = econPriceMonthly('food', S.country, year) * 12;
    var newPhone = econPriceMonthly('phone', S.country, year) * 12;
    var newTransport = econPriceMonthly('transport', S.country, year) * 12;

    /* Update the fallback expense items */
    h.expenseItems.forEach(function(item) {
      if (item.label === 'Food' || item.label === 'Food & Groceries') item.yearly = newFood;
      if (item.label === 'Phone' || item.label === 'Phone (at parents)') item.yearly = newPhone;
      if (item.label === 'Transport') item.yearly = newTransport;
    });

    /* Recompute totals */
    h.income = h.incomeItems.reduce(function(s, i) { return s + i.yearly; }, 0);
    h.expenses = h.expenseItems.reduce(function(s, i) { return s + i.yearly; }, 0);
    h.net = h.income - h.expenses;
  }

  /* Use econ-based tax */
  var taxIdx = h.expenseItems.findIndex(function(i) { return i.label === 'Income tax'; });
  if (taxIdx >= 0 && S.career && S.career.job) {
    var realTax = econTax(S.career.job.salary, S.country, year);
    if (realTax > 0 || h.expenseItems[taxIdx].yearly > 0) {
      h.expenses -= h.expenseItems[taxIdx].yearly;
      h.expenseItems[taxIdx].yearly = realTax;
      h.expenses += realTax;
      h.net = h.income - h.expenses;
    }
  }

  /* Recalculate stress */
  if (h.income === 0 && h.expenses > 0) h.stress = 'critical';
  else if (h.expenses > h.income) h.stress = 'critical';
  else if (h.expenses > h.income * 0.85) h.stress = 'tight';
  else h.stress = 'healthy';

  return h;
};
window.computeHousehold = computeHousehold;
/* ============================================================
   SESSION 9: MIGRATION FOR EXISTING CAREERS
   If a save has a career that should have specialized already,
   mark it as specialized to prevent forced popup.
   ============================================================ */
var _origMigrateForCareer = migrateDualState;
migrateDualState = function() {
  _origMigrateForCareer();
  if (!S || !S.career || !S.career.job) return;
  if (typeof CAR_BRANCH_OPTIONS === 'undefined') return;
  var job = S.career.job;
  if (job.branchChosen) return;
  var branchDef = CAR_BRANCH_OPTIONS[job.track];
  if (!branchDef) return;
  if ((job.level || 0) < branchDef.branchAtLevel) return;
  job.branchChosen = true;
  job.branchChosenYear = gameYear();
  job.branchChoiceAvailable = false;
};
window.migrateDualState = migrateDualState;
/* ============================================================
   SESSION 10: PEOPLE SYSTEM — 3-generation family tree
   ============================================================ */

/* ---------- NORMALIZE FAMILY ---------- */
function isSiblingOf(m) {
  return !!(m && (m.isSibling || m.relation === 'sibling' || m.role === 'Brother' || m.role === 'Sister'));
}

function normalizeFamilyMembers() {
  if (!S || !Array.isArray(S.family)) return;
  S.family.forEach(function(m) {
    if (!m.id) m.id = 'fam_' + Math.random().toString(36).slice(2, 8);
    if (!m.relation) {
      if (m.role === 'Mother' || m.role === 'Father') m.relation = 'parent';
      else if (isSiblingOf(m)) { m.relation = 'sibling'; m.isSibling = true; }
      else if (m.role === 'Mother-in-law' || m.role === 'Father-in-law' || m.role === 'Brother-in-law' || m.role === 'Sister-in-law') m.relation = 'inlaw';
      else m.relation = 'extended';
    }
    if (typeof m.alive !== 'boolean') m.alive = true;
    if (typeof m.health !== 'number') m.health = 100;
    if (typeof m.bond !== 'number') m.bond = 70;
    if (!Array.isArray(m.traits)) m.traits = m.trait ? [m.trait] : [];
    if (!Array.isArray(m.children)) m.children = [];
  });
}

/* ---------- NAME / TRAIT HELPERS ---------- */
function randPersonName(gender, country) {
  var pool = (typeof MARRIAGE_PARTNER_NAMES !== 'undefined') ? MARRIAGE_PARTNER_NAMES : null;
  var c = (pool && pool[country]) || (pool && pool.egy) || { m: ['Omar', 'Kareem', 'Hassan'], f: ['Sarah', 'Layla', 'Mona'] };
  var list = gender === 'm' ? c.m : c.f;
  return list[Math.floor(Math.random() * list.length)];
}

function randTraitId() {
  return ['kind', 'grumpy', 'romantic', 'ambitious', 'traditional', 'modern', 'religious', 'generous', 'moody', 'funny', 'loyal', 'practical'][Math.floor(Math.random() * 12)];
}

/* ---------- CAREER / MARRIAGE / CHILDREN FOR NPCs ---------- */
function assignCareerToNPC(person) {
  if (!person || !person.age) return;
  if (person.career && person.career.track) return;
  if (typeof carTrackById !== 'function' || typeof carSalaryForLevel !== 'function') return;

  var tracks = ['business', 'engineering', 'tech', 'teaching', 'nursing', 'accounting', 'law', 'media', 'hospitality', 'trades'];
  var track = tracks[Math.floor(Math.random() * tracks.length)];
  var trackDef = carTrackById(track);
  if (!trackDef) return;

  var salary = carSalaryForLevel(track, 0);
  person.career = {
    track: track,
    level: 0,
    title: trackDef.levels[0].title,
    company: 'Local Company',
    salary: salary,
    working: true
  };
  person.income = salary;
}

function marryNPC(person) {
  if (!person || person.spouse) return;
  var spouseGender = person.gender === 'm' ? 'f' : 'm';
  var name = randPersonName(spouseGender, S.country);
  var spAge = Math.max(18, (person.age || 25) + Math.floor(Math.random() * 5) - 2);
  assignCareerToNPC({ age: spAge, gender: spouseGender, career: null });
  var tracks = ['business', 'engineering', 'teaching', 'nursing', 'accounting', 'tech'];
  var tr = tracks[Math.floor(Math.random() * tracks.length)];
  var trackDef = (typeof carTrackById === 'function') ? carTrackById(tr) : null;
  var sal = (typeof carSalaryForLevel === 'function') ? carSalaryForLevel(tr, 0) : 50000;
  person.spouse = {
    id: 'sp_' + Math.random().toString(36).slice(2, 8),
    name: name,
    gender: spouseGender,
    age: spAge,
    career: {
      track: tr,
      level: 0,
      title: trackDef ? trackDef.levels[0].title : 'Worker',
      company: 'Local Firm',
      salary: sal,
      working: true
    },
    income: sal
  };
  person.isMarried = true;
}

function addChildToNPC(person) {
  if (!person) return null;
  if (!Array.isArray(person.children)) person.children = [];
  var gender = Math.random() < 0.5 ? 'm' : 'f';
  var name = randPersonName(gender, S.country);
  var child = {
    id: 'npc_' + Math.random().toString(36).slice(2, 8),
    name: name,
    gender: gender,
    age: 0,
    parentId: person.id || person.name,
    bond: 60
  };
  person.children.push(child);
  return child;
}

/* ---------- CREATE IN-LAWS ON MARRIAGE ---------- */
function createInLaws() {
  if (!S || !S.marriage || !S.marriage.partner) return;
  var p = S.marriage.partner;
  if (!Array.isArray(S.family)) S.family = [];
  if (S.family.some(function(m) { return m.relation === 'inlaw' && m.alive !== false; })) return;

  var spouseGender = p.gender || (S.gender === 'm' ? 'f' : 'm');
  var momGender = spouseGender === 'm' ? 'f' : 'm';
  var dadGender = spouseGender === 'm' ? 'm' : 'f';

  var momAge = (p.age || 28) + 25 + Math.floor(Math.random() * 10);
  var dadAge = (p.age || 28) + 28 + Math.floor(Math.random() * 10);

  var mom = {
    id: 'mil_' + Math.random().toString(36).slice(2, 8),
    name: randPersonName(momGender, S.country),
    role: 'Mother-in-law',
    relation: 'inlaw',
    gender: momGender,
    age: momAge,
    alive: true,
    health: 65 + Math.floor(Math.random() * 25),
    bond: 50,
    traits: [randTraitId()],
    country: p.country || S.country,
    isParentInLaw: true,
    children: []
  };
  var dad = {
    id: 'fil_' + Math.random().toString(36).slice(2, 8),
    name: randPersonName(dadGender, S.country),
    role: 'Father-in-law',
    relation: 'inlaw',
    gender: dadGender,
    age: dadAge,
    alive: true,
    health: 60 + Math.floor(Math.random() * 25),
    bond: 50,
    traits: [randTraitId()],
    country: p.country || S.country,
    isParentInLaw: true,
    children: []
  };
  S.family.push(mom, dad);

  var silCount = Math.floor(Math.random() * 3);
  for (var i = 0; i < silCount; i++) {
    var sg = Math.random() < 0.5 ? 'm' : 'f';
    var sibName = randPersonName(sg, S.country);
    var sibAge = Math.max(18, (p.age || 28) + Math.floor(Math.random() * 12) - 6);
    S.family.push({
      id: 'sil_' + Math.random().toString(36).slice(2, 8),
      name: sibName,
      role: sg === 'm' ? 'Brother-in-law' : 'Sister-in-law',
      relation: 'inlaw',
      gender: sg,
      age: sibAge,
      alive: true,
      health: 90,
      bond: 50,
      traits: [randTraitId()],
      country: p.country || S.country,
      isSiblingInLaw: true,
      children: []
    });
  }

  /* Update mother-in-law bond to marriage tab's value */
  if (S.marriage.motherInLawBond) {
    S.family.filter(function(m) { return m.role === 'Mother-in-law'; }).forEach(function(m) {
      m.bond = S.marriage.motherInLawBond;
    });
  }

  log('👨‍👩‍👧 You gained ' + (S.family.filter(function(m) { return m.relation === 'inlaw'; }).length) + ' new in-laws.');
  if (typeof recordMoment === 'function') {
    recordMoment(
      'The day you met your in-laws',
      mom.name + ' sized you up over tea. ' + dad.name + ' barely spoke. You were terrified.',
      { icon: '👵', key: 'inlaws_met' }
    );
  }
}
window.createInLaws = createInLaws;

/* ---------- EVOLUTION TICK ---------- */
function evolveExtendedFamily() {
  if (!S) return;
  var year = gameYear();

  /* SIBLINGS */
  (S.family || []).forEach(function(m) {
    if (m.alive === false) return;
    if (!isSiblingOf(m)) return;
    m.age = (m.age || 0) + 1;

    if (m.age === 22 && !m.career) {
      assignCareerToNPC(m);
      if (m.bond >= 40) log('💼 Your ' + (m.role || 'sibling') + ' ' + m.name + ' started working as a ' + m.career.title + '.');
    }

    if (m.career && m.career.level < 3 && Math.random() < 0.15) {
      m.career.level = (m.career.level || 0) + 1;
      var trackDef = (typeof carTrackById === 'function') ? carTrackById(m.career.track) : null;
      if (trackDef) m.career.title = trackDef.levels[Math.min(m.career.level, trackDef.levels.length - 1)].title;
      m.career.salary = (typeof carSalaryForLevel === 'function') ? carSalaryForLevel(m.career.track, m.career.level) : m.career.salary;
      m.income = m.career.salary;
    }

    if (!m.spouse && m.age >= 22 && m.age <= 32 && Math.random() < 0.18) {
      marryNPC(m);
      log('💍 Your ' + (m.role || 'sibling') + ' ' + m.name + ' married ' + m.spouse.name + '.');
      fx({ happiness: 5 });
      if (typeof recordMoment === 'function') {
        recordMoment('Your ' + (m.role || 'sibling').toLowerCase() + ' got married',
          m.name + ' married ' + m.spouse.name + '. The family gathered. You were happy for them — and a little nostalgic.',
          { icon: '💍', key: 'sib_wed_' + m.id, weight: 2 });
      }
    }

    if (m.spouse && m.age >= 25 && m.age <= 40 && (m.children || []).length < 3 && Math.random() < 0.20) {
      var nc = addChildToNPC(m);
      if (nc) {
        var relation = m.gender === 'm' ? 'Nephew' : 'Niece';
        log('👶 Your ' + relation.toLowerCase() + ' ' + nc.name + ' was born!');
        fx({ happiness: 8 });
        if (typeof recordMoment === 'function') {
          recordMoment('Your ' + relation.toLowerCase() + ' was born',
            m.name + ' and ' + m.spouse.name + ' welcomed ' + nc.name + ' into the world.',
            { icon: '👶', key: 'niece_' + nc.id, weight: 2 });
        }
      }
    }

    (m.children || []).forEach(function(nc) {
      nc.age = (nc.age || 0) + 1;
      if (nc.age === 18 && !nc.career) assignCareerToNPC(nc);
      if (!nc.spouse && nc.age >= 22 && nc.age <= 32 && Math.random() < 0.15) marryNPC(nc);
      if (nc.spouse && nc.age >= 25 && nc.age <= 38 && (nc.children || []).length < 3 && Math.random() < 0.18) addChildToNPC(nc);
      (nc.children || []).forEach(function(ggc) { ggc.age = (ggc.age || 0) + 1; });
    });

    if (m.age >= 72) {
      var dChance = 0.04 + (m.age - 72) * 0.015;
      if (Math.random() < dChance) {
        m.alive = false;
        m.deathYear = year;
        log('🕊 Your ' + (m.role || 'sibling') + ' ' + m.name + ' passed away at ' + m.age + '.');
        fx({ happiness: -10 });
        if (typeof emitSignal === 'function') emitSignal('siblingDied', { sibling: m });
      }
    }
  });

  /* IN-LAWS */
  (S.family || []).forEach(function(m) {
    if (m.alive === false) return;
    if (m.relation !== 'inlaw') return;
    m.age = (m.age || 0) + 1;

    if (m.age >= 68) {
      var dChance = 0.04 + (m.age - 68) * 0.015;
      if (Math.random() < dChance) {
        m.alive = false;
        m.deathYear = year;
        log('🕊 Your ' + m.role + ' ' + m.name + ' passed away at ' + m.age + '.');
        fx({ happiness: -6 });
        if (S.marriage && S.marriage.partner) {
          S.marriage.partner.bond = Math.min(100, (S.marriage.partner.bond || 70) + 5);
          S.marriage.partner.trust = Math.min(100, (S.marriage.partner.trust || 50) + 3);
          log('💬 ' + S.marriage.partner.name + ' is grieving. You held them through the night.');
        }
      }
    }
  });

  /* CHILDREN (yours) growing up */
  (S.childrenList || []).forEach(function(c) {
    if (c.age === 18 && !c.career) {
      assignCareerToNPC(c);
      if (c.career) log('🎓 Your child ' + c.name + ' started working as a ' + c.career.title + '.');
      if (typeof recordMoment === 'function') {
        recordMoment(c.name + ' became an adult',
          'They turned 18 and started their first job. You watched them become someone.',
          { icon: '🎓', key: 'child_adult_' + c.id, weight: 2 });
      }
    }

    if (c.career && c.career.level < 4 && Math.random() < 0.18) {
      c.career.level = (c.career.level || 0) + 1;
      var trackDef = (typeof carTrackById === 'function') ? carTrackById(c.career.track) : null;
      if (trackDef) c.career.title = trackDef.levels[Math.min(c.career.level, trackDef.levels.length - 1)].title;
      c.career.salary = (typeof carSalaryForLevel === 'function') ? carSalaryForLevel(c.career.track, c.career.level) : c.career.salary;
      c.income = c.career.salary;
    }

    if (!c.spouse && c.age >= 22 && c.age <= 32 && Math.random() < 0.20) {
      marryNPC(c);
      log('💍 Your child ' + c.name + ' married ' + c.spouse.name + '!');
      fx({ happiness: 15 });
      if (typeof recordMoment === 'function') {
        recordMoment(c.name + ' got married',
          'You watched your child say "I do." You cried. They pretended not to notice.',
          { icon: '💍', key: 'child_wed_' + c.id, weight: 3 });
      }
      if (typeof emitSignal === 'function') emitSignal('childMarried', { child: c });
    }

    if (c.spouse && c.age >= 24 && c.age <= 38 && (c.children || []).length < 4 && Math.random() < 0.22) {
      var gc = addChildToNPC(c);
      if (gc) {
        gc.relation = 'grandchild';
        gc.grandparentId = 'player';
        gc.bond = 70;
        log('👶 You became a grandparent! ' + c.name + ' had a baby: ' + gc.name + '.');
        fx({ happiness: 20 });
        if (typeof recordMoment === 'function') {
          recordMoment('The day you became a grandparent',
            c.name + ' placed ' + gc.name + ' in your arms. They have your eyes. You cried in front of everyone.',
            { icon: '👶', key: 'grandchild_' + gc.id, weight: 4 });
        }
        if (typeof emitSignal === 'function') emitSignal('grandchildBorn', { child: c, grandchild: gc });
      }
    }

    (c.children || []).forEach(function(gc) {
      gc.age = (gc.age || 0) + 1;
      if (!Array.isArray(gc.events)) gc.events = [];
      if (gc.age === 5) gc.events.push({ year: year, event: 'Started school' });
      if (gc.age === 13) gc.events.push({ year: year, event: 'Became a teenager' });
      if (gc.age === 18) {
        gc.events.push({ year: year, event: 'Became an adult' });
        if (typeof recordMoment === 'function') {
          recordMoment(gc.name + ' grew up',
            'Your grandchild turned 18. You remember when they fit in your arms.',
            { icon: '🌟', key: 'gc_adult_' + gc.id, weight: 2 });
        }
      }
    });
  });
}
window.evolveExtendedFamily = evolveExtendedFamily;

/* ---------- ACCESS HELPERS ---------- */
function getAllGrandchildren() {
  if (!S || !Array.isArray(S.childrenList)) return [];
  var out = [];
  S.childrenList.forEach(function(c) {
    (c.children || []).forEach(function(gc) {
      out.push(Object.assign({}, gc, { parentName: c.name, parentId: c.id }));
    });
  });
  return out;
}
window.getAllGrandchildren = getAllGrandchildren;

function getAllNiecesNephews() {
  if (!S || !Array.isArray(S.family)) return [];
  var out = [];
  S.family.forEach(function(m) {
    if (!isSiblingOf(m)) return;
    (m.children || []).forEach(function(nc) {
      out.push(Object.assign({}, nc, { parentName: m.name, parentRole: m.role }));
    });
  });
  return out;
}
window.getAllNiecesNephews = getAllNiecesNephews;

function getInLaws() {
  if (!S || !Array.isArray(S.family)) return [];
  return S.family.filter(function(m) { return m.relation === 'inlaw'; });
}
window.getInLaws = getInLaws;

function getSiblingFamilyTree() {
  if (!S || !Array.isArray(S.family)) return [];
  return S.family.filter(isSiblingOf).map(function(sib) {
    return {
      sibling: sib,
      spouse: sib.spouse || null,
      children: sib.children || []
    };
  });
}
window.getSiblingFamilyTree = getSiblingFamilyTree;

/* ---------- YEAR HOOK ---------- */
GameHooks.on('year', function() {
  if (!S) return;
  normalizeFamilyMembers();
  evolveExtendedFamily();
});

/* ---------- MIGRATION ---------- */
var _origMigrateForPeople = migrateDualState;
migrateDualState = function() {
  _origMigrateForPeople();
  normalizeFamilyMembers();
  /* Ensure children have children arrays */
  (S && S.childrenList || []).forEach(function(c) {
    if (!Array.isArray(c.children)) c.children = [];
  });
  /* If married and no in-laws yet, create them */
  if (S && S.marriage && S.marriage.status === 'married' && S.marriage.partner) {
    if (!S.family.some(function(m) { return m.relation === 'inlaw'; })) {
      createInLaws();
    }
  }
};
window.migrateDualState = migrateDualState;
/* ============================================================
   SESSION 11: GENERATIONAL ECHO
   Inherited traits, family patterns, real death, legacy.
   ============================================================ */

/* ---------- INHERITED TRAITS ---------- */
function getPlayerTraitsForInheritance() {
  var traits = [];
  if (!S) return ['kind'];
  if ((S.happiness || 50) > 70) traits.push('kind');
  if (S.career && S.career.job && (S.career.job.performance || 50) > 70) traits.push('ambitious');
  if ((S.social || 50) > 70) traits.push('outgoing');
  if ((S.social || 50) < 40) traits.push('shy');
  if (S.marriage && S.marriage.partner && (S.marriage.partner.bond || 70) > 70) traits.push('romantic');
  if ((S.smarts || 50) > 70) traits.push('curious');
  if (traits.length === 0) traits.push('kind');
  return traits;
}

function inheritTraitsToChild(child) {
  if (!child) return;
  var motherTraits = [];
  var fatherTraits = [];

  if (S.gender === 'f') {
    motherTraits = getPlayerTraitsForInheritance();
    fatherTraits = (S.marriage && S.marriage.partner && Array.isArray(S.marriage.partner.traits))
      ? S.marriage.partner.traits : ['kind'];
  } else {
    fatherTraits = getPlayerTraitsForInheritance();
    motherTraits = (S.marriage && S.marriage.partner && Array.isArray(S.marriage.partner.traits))
      ? S.marriage.partner.traits : ['kind'];
  }

  var inherited = [];
  if (motherTraits.length) inherited.push(motherTraits[Math.floor(Math.random() * motherTraits.length)]);
  if (fatherTraits.length) inherited.push(fatherTraits[Math.floor(Math.random() * fatherTraits.length)]);

  var pool = ['curious', 'shy', 'outgoing', 'ambitious', 'funny', 'romantic', 'stubborn', 'sensitive', 'calm', 'bookish'];
  inherited.push(pool[Math.floor(Math.random() * pool.length)]);

  /* dedupe */
  inherited = inherited.filter(function(t, i) { return inherited.indexOf(t) === i; });

  child.inheritedTraits = inherited;
  if (!Array.isArray(child.traits)) child.traits = [];
  inherited.slice(0, 2).forEach(function(t) {
    if (child.traits.indexOf(t) < 0) child.traits.push(t);
  });
}
window.inheritTraitsToChild = inheritTraitsToChild;

/* ---------- COMPUTE PERSONALITY AT 8 (traits × environment) ---------- */
function computeChildPersonality(child) {
  if (!child) return;
  var inherited = child.inheritedTraits || child.traits || [];
  var envBond = 50;
  if (S) {
    var bs = [];
    bs.push(S.happiness || 50);
    if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
      bs.push(S.marriage.partner.bond || 70);
    }
    envBond = bs.reduce(function(a, b) { return a + b; }, 0) / bs.length;
  }

  var candidates = [];
  if (inherited.indexOf('ambitious') >= 0) candidates.push('ambitious', 'diligent');
  if (inherited.indexOf('kind') >= 0) candidates.push('kind', 'supportive');
  if (inherited.indexOf('shy') >= 0) candidates.push('shy', 'sensitive');
  if (inherited.indexOf('outgoing') >= 0) candidates.push('outgoing', 'charismatic');
  if (inherited.indexOf('curious') >= 0) candidates.push('curious', 'bookish');
  if (inherited.indexOf('romantic') >= 0) candidates.push('sentimental');

  if (envBond > 70) {
    candidates.push('confident', 'kind', 'outgoing');
  } else if (envBond < 40) {
    candidates.push('anxious', 'sensitive', 'stubborn');
  }

  if (S && (S.wealth || 0) < 0) {
    candidates.push('ambitious', 'resourceful');
  } else if (S && (S.wealth || 0) > 500000) {
    candidates.push('calm', 'confident');
  }

  /* Random fallbacks */
  var fallbacks = ['curious', 'bookish', 'sporty', 'artistic', 'sensitive', 'outgoing', 'quiet', 'diligent'];
  fallbacks.forEach(function(f) { candidates.push(f); });

  child.personality = candidates[Math.floor(Math.random() * Math.min(6, candidates.length))];
  if (!Array.isArray(child.traits)) child.traits = [];
  if (child.traits.indexOf(child.personality) < 0) child.traits.push(child.personality);
}
window.computeChildPersonality = computeChildPersonality;

/* ---------- FAMILY PATTERN DETECTION ---------- */
function detectFamilyPatterns() {
  if (!S) return {};

  var parents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false;
  });
  var kids = (S.childrenList || []).filter(function(c) { return !c.movedOut; });

  var avgParentBond = parents.length ? parents.reduce(function(s, p) { return s + (p.bond || 70); }, 0) / parents.length : 70;
  var avgChildBond = kids.length ? kids.reduce(function(s, c) { return s + (c.bond || 55); }, 0) / kids.length : 55;

  var parentsMarried = (S.family || []).filter(function(m) { return m.role === 'Mother' || m.role === 'Father'; }).length >= 2 &&
                       !S.family.some(function(m) { return m.role === 'Mother' && m.alive === false; }) &&
                       !S.family.some(function(m) { return m.role === 'Father' && m.alive === false; });

  var playerMarried = !!(S.marriage && S.marriage.status === 'married' && S.marriage.partner);
  var playerDivorced = !!(S.marriage && S.marriage.status === 'divorced');

  return {
    wasRaisedLovingly: avgParentBond > 65,
    wasRaisedDistant: avgParentBond < 40,
    isLovingParent: avgChildBond > 65,
    isDistantParent: avgChildBond < 40 && kids.length > 0,
    parentsStayedMarried: parentsMarried,
    playerMarriageStrong: playerMarried && (S.marriage.partner.bond || 70) > 65,
    playerMarriedOrDivorced: playerMarried || playerDivorced,
    isPoorFamily: (S.wealth || 0) < 0,
    isWealthyFamily: (S.wealth || 0) > 1000000,
    valuesEducation: kids.some(function(c) { return c.age >= 6 && c.age <= 18 && c.school && ['igcse', 'american', 'ib', 'international', 'language', 'private', 'private_top', 'boarding_elite'].indexOf(c.school) >= 0; }),
    workingParentAbsent: !!((S.career && S.career.job) && (S.career.job.tenure || 0) > 2 && (S.career.job.performance || 50) > 70)
  };
}
window.detectFamilyPatterns = detectFamilyPatterns;

/* ---------- REAL DEATH HANDLER ---------- */
function checkDeath() {
  if (!S) return;
  if (S.alive === false) return;
  if (S._deathScreenShown) return;

  var deathTriggered = false;
  var reason = '';

  if (S.health <= 0) {
    deathTriggered = true;
    reason = 'Your body could not hold on any longer.';
  } else if (S.age >= 100) {
    deathTriggered = true;
    reason = 'You lived a long life. It was enough.';
  }

  if (!deathTriggered) return;

  S.alive = false;
  S.deathYear = gameYear();
  S.deathReason = reason;

  try { save(); } catch (e) {}
  showLegacyScreen();
}
window.checkDeath = checkDeath;

/* ---------- LEGACY SCREEN ---------- */
function buildLegacySummary() {
  var lines = [];
  var patterns = detectFamilyPatterns();

  /* Life summary */
  var j = S.career && S.career.job;
  lines.push('<div class="card" style="border-color:#8b5cf6;margin-top:12px"><h4 style="color:#8b5cf6;font-size:.85rem">Your Life</h4>' +
    '<div class="row"><span>Age at death</span><b>' + S.age + '</b></div>' +
    '<div class="row"><span>Final wealth</span><b>' + money(S.wealth || 0) + '</b></div>' +
    (j ? '<div class="row"><span>Career</span><b>' + j.title + '</b></div>' : '') +
    '<div class="row"><span>Children</span><b>' + (S.childrenList || []).length + '</b></div>' +
    '<div class="row"><span>Grandchildren</span><b>' + (typeof getAllGrandchildren === 'function' ? getAllGrandchildren().length : 0) + '</b></div>' +
    '</div>');

  /* Family patterns */
  var patternLines = [];
  if (patterns.wasRaisedDistant && patterns.isDistantParent) {
    patternLines.push('💔 You grew up with distant parents — and your children grew up distant from you. <b style="color:#fb7185">The cycle continued.</b>');
  } else if (patterns.wasRaisedDistant && patterns.isLovingParent) {
    patternLines.push('💪 You grew up with distant parents — but you raised your children with love. <b style="color:#34d399">You broke the cycle.</b>');
  } else if (patterns.wasRaisedLovingly && patterns.isLovingParent) {
    patternLines.push('❤️ You grew up loved — and you passed that love to your children.');
  } else if (patterns.wasRaisedLovingly && patterns.isDistantParent) {
    patternLines.push('😔 You grew up loved — but your children drifted from you.');
  }

  if (patterns.parentsStayedMarried && patterns.playerMarriageStrong) {
    patternLines.push('💍 Your parents stayed married. So did you. The pattern held.');
  } else if (patterns.parentsStayedMarried && patterns.playerMarriedOrDivorced && !patterns.playerMarriageStrong) {
    patternLines.push('💔 Your parents stayed married. Your marriage did not.');
  } else if (!patterns.parentsStayedMarried && patterns.playerMarriageStrong) {
    patternLines.push('💪 Your parents\' marriage broke. Yours did not. <b style="color:#34d399">You broke the cycle.</b>');
  }

  if (patterns.valuesEducation) {
    patternLines.push('🎓 You invested in your children\'s education. It will echo for generations.');
  }

  if (patternLines.length > 0) {
    lines.push('<div class="card" style="border-color:#fbbf24"><h4 style="color:#fbbf24;font-size:.85rem">Family Patterns</h4>' +
      patternLines.map(function(p) { return '<div style="padding:4px 0;font-size:.78rem;line-height:1.4">' + p + '</div>'; }).join('') +
      '</div>');
  }

  /* Inheritance */
  var children = (S.childrenList || []).filter(function(c) { return c.age >= 18; });
  if (children.length > 0 && (S.wealth || 0) > 0) {
    var perChild = Math.round((S.wealth || 0) / children.length);
    lines.push('<div class="card" style="border-color:#34d399"><h4 style="color:#34d399;font-size:.85rem">Inheritance</h4>' +
      children.map(function(c) {
        return '<div class="row"><span>' + c.name + '</span><b class="good">' + money(perChild) + '</b></div>';
      }).join('') +
      '</div>');
  }

  return lines.join('');
}
window.buildLegacySummary = buildLegacySummary;

function showLegacyScreen() {
  var existing = document.getElementById('legacy-screen');
  if (existing) existing.remove();

  var gcList = (typeof getAllGrandchildren === 'function') ? getAllGrandchildren().filter(function(gc) { return (gc.age || 0) >= 6; }) : [];
  var gcButtons = '';
  if (gcList.length > 0) {
    gcButtons = '<div style="margin-top:16px"><div class="muted small" style="text-align:center;margin-bottom:8px;letter-spacing:.06em;font-weight:700">CONTINUE THE FAMILY LINE</div>';
    gcList.forEach(function(gc) {
      gcButtons += '<button onclick="continueAsGrandchild(\'' + gc.id + '\')" class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.78rem;background:#8b5cf620;border-color:#8b5cf6;border-radius:8px;cursor:pointer">' +
        '<div style="display:flex;justify-content:space-between"><b>Play as ' + gc.name + '</b><span>Age ' + gc.age + '</span></div>' +
        '<div class="muted small" style="margin-top:3px">Your grandchild. Their parent is ' + (gc.parentName || 'your child') + '.</div>' +
        '</button>';
    });
    gcButtons += '</div>';
  }

  var modal = document.createElement('div');
  modal.id = 'legacy-screen';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,0.92);backdrop-filter:blur(8px);z-index:3000;display:flex;align-items:flex-start;justify-content:center;padding:20px;overflow-y:auto';
  modal.innerHTML = '<div style="max-width:450px;width:100%;background:#14141f;border:1px solid #8b5cf6;border-radius:14px;padding:22px;box-shadow:0 10px 40px rgba(139,92,246,0.5);margin:auto">' +
    '<div style="text-align:center;margin-bottom:16px">' +
    '<div style="font-size:2.4rem">🕊</div>' +
    '<div style="font-size:1.4rem;font-weight:900;color:#8b5cf6;margin-top:8px">' + S.name + '</div>' +
    '<div class="muted small" style="margin-top:2px">' + gameYear() + ' · Age ' + S.age + '</div>' +
    '<div class="muted small" style="margin-top:8px;font-style:italic">' + (S.deathReason || 'You passed away.') + '</div>' +
    '</div>' +
    buildLegacySummary() +
    gcButtons +
    '<button onclick="dismissLegacyScreen()" class="opt" style="width:100%;margin-top:14px;text-align:center;background:#25253a;color:#e8e8f2;font-weight:700;padding:12px;border-radius:8px;cursor:pointer;font-size:.85rem">Start a Fresh Life</button>' +
    '</div>';
  document.body.appendChild(modal);
  S._deathScreenShown = true;
}
window.showLegacyScreen = showLegacyScreen;

function dismissLegacyScreen() {
  var el = document.getElementById('legacy-screen');
  if (el) el.remove();
  localStorage.removeItem(SAVE_KEY);
  S = null;
  renderStart();
}
window.dismissLegacyScreen = dismissLegacyScreen;

/* ---------- CONTINUE AS GRANDCHILD ---------- */
function continueAsGrandchild(gcId) {
  if (!S) return false;
  var allGCs = (typeof getAllGrandchildren === 'function') ? getAllGrandchildren() : [];
  var gc = allGCs.find(function(g) { return g.id === gcId; });
  if (!gc) return false;

  var gcParent = (S.childrenList || []).find(function(c) {
    return (c.children || []).some(function(ch) { return ch.id === gcId; });
  });
  if (!gcParent) return false;

  var oldS = S;
  var deathYear = gameYear();
  var oldHomeCountry = oldS.homeCountry || oldS.country;

  /* Build new family from grandchild's POV */
  var newFamily = [];
  if (gcParent) {
    var gpRole = gcParent.gender === 'm' ? 'Father' : 'Mother';
    newFamily.push({
      id: gcParent.id,
      name: gcParent.name,
      role: gpRole,
      relation: 'parent',
      gender: gcParent.gender,
      age: (gcParent.age || 30),
      alive: true,
      bond: 70,
      traits: gcParent.traits || ['kind'],
      isParent: true
    });

    if (gcParent.spouse) {
      var otherRole = gcParent.spouse.gender === 'm' ? 'Father' : 'Mother';
      newFamily.push({
        id: gcParent.spouse.id,
        name: gcParent.spouse.name,
        role: otherRole,
        relation: 'parent',
        gender: gcParent.spouse.gender,
        age: gcParent.spouse.age || 30,
        alive: true,
        bond: 65,
        traits: ['kind'],
        isParent: true
      });
    }

    /* Siblings from the same parent */
    (gcParent.children || []).forEach(function(sib) {
      if (sib.id === gcId) return;
      newFamily.push({
        id: sib.id,
        name: sib.name,
        role: sib.gender === 'm' ? 'Brother' : 'Sister',
        relation: 'sibling',
        gender: sib.gender,
        age: sib.age || 5,
        alive: true,
        bond: 55,
        isSibling: true,
        traits: ['kind']
      });
    });
  }

  /* Deceased grandparent memory (the old player) */
  newFamily.push({
    id: 'gp_mem_' + Math.random().toString(36).slice(2, 6),
    name: oldS.name,
    role: oldS.gender === 'm' ? 'Grandfather' : 'Grandmother',
    relation: 'grandparent',
    gender: oldS.gender,
    age: oldS.age,
    alive: false,
    deathYear: deathYear,
    bond: 70,
    legacyMemory: true
  });

  /* Reset S with grandchild state */
  var newS = {
    name: gc.name,
    gender: gc.gender || 'm',
    country: oldS.country,
    currency: oldS.currency,
    month: 1,
    pacing: oldS.pacing || 'yearly',
    pacingSwitchYear: 0,
    age: Math.max(6, gc.age || 6),
    health: 100,
    happiness: 60,
    smarts: 55,
    social: 55,
    wealth: Math.round((oldS.wealth || 0) * 0.15),
    school: null,
    uni: null,
    degree: null,
    job: null,
    spouse: null,
    children: 0,
    housing: 'parents',
    family: newFamily,
    familyTier: oldS.familyTier,
    parentType: oldS.parentType,
    log: [],
    flags: {},
    pending: null,
    evId: null,
    evtMemory: {},
    pendingQueue: [],
    homeCountry: oldHomeCountry,
    childrenList: [],
    relMemory: {},
    lifeMoments: [],
    reflections: [],
    generation: (oldS.generation || 1) + 1,
    legacies: (oldS.legacies || []).concat([{
      name: oldS.name,
      ageAtDeath: oldS.age,
      year: deathYear,
      finalWealth: oldS.wealth || 0,
      career: (oldS.career && oldS.career.job) ? oldS.career.job.title : null,
      childrenCount: (oldS.childrenList || []).length,
      grandchildrenCount: allGCs.length
    }]),
    _deathScreenShown: false
  };

  S = newS;
  unityPass();
  GameHooks.run('newGame', S);

  log('✨ You are now ' + gc.name + ', age ' + S.age + '. Generation ' + S.generation + '.');
  log('Your grandparent ' + oldS.name + ' passed away in ' + deathYear + '. Their story is now part of yours.');
  if (S.wealth > 0) log('💰 You inherited ' + money(S.wealth) + ' from them.');

  dismissLegacyScreen();
  render();
  return true;
}
window.continueAsGrandchild = continueAsGrandchild;

/* ---------- WIRE DEATH CHECK INTO RENDER ---------- */
GameHooks.on('render', function() {
  if (!S) return;
  if (S.alive === false && !S._deathScreenShown) {
    setTimeout(function() { if (S && S.alive === false && !S._deathScreenShown) showLegacyScreen(); }, 100);
    return;
  }
  if (S.age >= 18) {
    checkDeath();
  }
});
/* ============================================================
   SESSION 12: REALISM ENGINE
   Real difficulty. Real misfortunes. Real consequences.
   ============================================================ */

/* ---------- 1. COUNTRY DIFFICULTY (0-100) ---------- */
function getCountryDifficulty(country) {
  country = country || (S ? S.country : 'egy');
  var base = {
    egy: 82, sau: 58, uae: 55, kwt: 54, qat: 54, omn: 58, bhr: 56,
    usa: 62, gbr: 60, deu: 55, can: 58, aus: 60,
    nld: 58, fra: 65, jpn: 70, ita: 72, sgp: 52,
    bra: 75, ind: 78, tur: 76
  }[country] || 60;
  return base;
}
window.getCountryDifficulty = getCountryDifficulty;

/* ---------- 2. STRESS SYSTEM ---------- */
function computeStress() {
  if (!S) return 0;
  if (S.age < 16) return 0;

  var stress = 0;

  /* Financial */
  if (S.wealth < 0) stress += 25;
  else if (S.household && S.household.net < 0) stress += 15;
  else if (S.household && S.household.net < S.household.expenses * 0.15) stress += 5;

  /* Work */
  if (S.career && S.career.job) {
    var perf = S.career.job.performance || 50;
    if (perf < 40) stress += 15;
    var workMode = S.career.workMode || 'normal';
    if (workMode === 'overtime') stress += 12;
    else if (workMode === 'hard') stress += 6;
  } else if (S.age >= 25 && S.age < 60) {
    stress += 18;
  }

  /* Health */
  if (S.health < 40) stress += 15;
  else if (S.health < 60) stress += 6;

  /* Marriage */
  if (S.marriage && S.marriage.status === 'married' && S.marriage.partner) {
    var bond = S.marriage.partner.bond || 70;
    if (bond < 35) stress += 20;
    else if (bond < 50) stress += 10;
  }
   if (S.marriage && typeof S.marriage.stress === 'number' && typeof S.stress === 'number') {
  var _avgStress = Math.round((S.stress * 0.6) + (S.marriage.stress * 0.4));
  S.marriage.stress = _avgStress;
  S.stress = _avgStress;
}

  /* Children */
  if (S.childrenList && S.childrenList.length > 0) {
    var unhappy = S.childrenList.filter(function(c) { return (c.bond || 55) < 40; }).length;
    stress += unhappy * 6;
    stress += S.childrenList.length * 2;
  }

  /* Parents aging */
  var agingParents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && (m.age || 0) >= 70;
  });
  stress += agingParents.length * 8;

  /* Country modifier */
  stress += getCountryDifficulty(S.country) * 0.15;

  return Math.max(0, Math.min(100, Math.round(stress)));
}
window.computeStress = computeStress;

function applyStressEffects() {
  if (!S) return;
  var stress = computeStress();
  var prev = S._lastStress || stress;
  S._lastStress = stress;
  S.stress = stress;

  /* Record consecutive high-stress years */
  if (stress >= 70) {
    S._stressHighYears = (S._stressHighYears || 0) + 1;
  } else if (stress < 50) {
    S._stressHighYears = 0;
  }

  /* === LONG-TERM STRESS → REAL MEDICAL CONDITIONS === */
  if (S._stressHighYears >= 2 && S.age >= 18 && S.medical && Array.isArray(S.medical.conditions)) {
    var hasAnxiety = S.medical.conditions.some(function(c) { return c.id === 'anxiety'; });
    var hasDepression = S.medical.conditions.some(function(c) { return c.id === 'depression'; });
    var hasHTN = S.medical.conditions.some(function(c) { return c.id === 'hypertension'; });

    if (!hasAnxiety && typeof medAddCondition === 'function') {
      medAddCondition('anxiety');
      log('🏥 Chronic stress has manifested as anxiety. See a doctor in the Medical tab.');
      if (typeof recordMoment === 'function') {
        recordMoment('The year stress broke you',
          'You started waking up at 3 AM with your heart racing. You could not explain why.',
          { icon: '😰', key: 'stress_anxiety_' + gameYear(), weight: 2 });
      }
    }

    if (S._stressHighYears >= 3 && !hasDepression && typeof medAddCondition === 'function') {
      medAddCondition('depression');
      log('🏥 Chronic stress has deepened into depression. Seek treatment.');
      if (typeof emitReflection === 'function') {
        emitReflection('You have not felt joy in months. You cannot remember the last time you laughed.', { mood: 'sad' });
      }
    }

    if (S._stressHighYears >= 4 && S.age >= 30 && !hasHTN && typeof medAddCondition === 'function') {
      medAddCondition('hypertension');
      log('🏥 Years of stress have raised your blood pressure to dangerous levels.');
    }

    /* Ongoing physical damage while under chronic stress */
    S.health = Math.max(0, (S.health || 100) - 2);
    if (typeof addHappiness === 'function') addHappiness(-4);
  }

  /* === EMERGENCY: HIGH STRESS + POOR HEALTH → HEART ATTACK === */
  if (stress >= 85 && S.age > 40 && (S.health || 100) < 60 && Math.random() < 0.04) {
    log('🚨 You collapsed. Emergency hospitalization.');
    S.wealth -= 5000 * ((C().rate || 1) / 52.7);
    S.health = Math.max(0, S.health - 20);
    if (typeof medAddCondition === 'function') medAddCondition('heart_attack');
    if (typeof emitSignal === 'function') emitSignal('healthCritical', { health: S.health, prev: prev });
    if (typeof recordMoment === 'function') {
      recordMoment('The collapse', 'You were in the ambulance before you understood what had happened.', { icon: '🚑', key: 'heart_attack_' + gameYear(), weight: 3 });
    }
  }
}
window.applyStressEffects = applyStressEffects;

/* ---------- 3. RANDOM MISFORTUNE ENGINE ---------- */
const MISFORTUNE_POOL = [
   { id: 'car_accident', weight: 8, minAge: 18, maxAge: 75, health: -12, happiness: -8, special: 'car_damage',
    text: '🚗 Car accident. You were rear-ended at a red light.' },
  { id: 'sudden_illness', weight: 6, minAge: 18, maxAge: 90, cost: 8000, health: -18, happiness: -6,
    text: '🏥 Sudden illness. Food poisoning, or something worse. Hospital visit.' },
  { id: 'theft', weight: 10, minAge: 16, maxAge: 80, cost: 5000, happiness: -10,
    text: '🔓 Break-in. Your home was burglarized. Items stolen.' },
  { id: 'scam', weight: 8, minAge: 18, maxAge: 75, cost: 12000, happiness: -12,
    text: '📞 Phone scam. They got your bank details. Money gone.' },
  { id: 'lawsuit', weight: 3, minAge: 25, maxAge: 70, cost: 25000, happiness: -15,
    text: '⚖️ Someone is suing you. Legal fees piling up.' },
  { id: 'home_damage', weight: 7, minAge: 22, maxAge: 80, cost: 18000, happiness: -8,
    text: '🏠 Home damage. Burst pipe, electrical fire, something broke. Repairs needed.' },
  { id: 'job_loss_random', weight: 5, minAge: 22, maxAge: 60, happiness: -20, health: -3, special: 'job_loss',
    text: '💼 Laid off — restructuring. Nothing personal. Just business.' },
  { id: 'medical_emergency', weight: 4, minAge: 18, maxAge: 90, cost: 40000, health: -30, happiness: -20,
    text: '🚑 Medical emergency. Surgery needed. Life or debt — impossible choice.' },
  { id: 'family_death_unexpected', weight: 3, minAge: 25, maxAge: 80, happiness: -25, special: 'family_death',
    text: '🕊 A family member died unexpectedly. The news hit like a wall.' },
  { id: 'friendship_betrayal', weight: 6, minAge: 20, maxAge: 70, happiness: -10, special: 'friend_betray',
    text: '💔 A close friend betrayed you. Trust broken.' },
  { id: 'inflation_spike', weight: 6, minAge: 18, maxAge: 80, cost: 4000, happiness: -5,
    text: '💸 Prices surged this year. Everything costs more.' },
  { id: 'traffic_fine', weight: 10, minAge: 20, maxAge: 70, cost: 2500, happiness: -3,
    text: '📋 Government fees or traffic fines. Unexplained charges.' }
];
function _applyCarDamageFromAccident() {
  if (!S || !Array.isArray(S.cars)) return;
  var active = S.cars.filter(function(c) { return !c.storedIn && !c.stolen; });
  if (active.length === 0) {
    log('🚗 Fortunately you do not own a car — no vehicle damage.');
    return;
  }
  var car = active[Math.floor(Math.random() * active.length)];
  var cls = (typeof CAR_CLASSES !== 'undefined' && CAR_CLASSES[car.cls]) ? CAR_CLASSES[car.cls] : { maintenance: 500 };
  var rate = (C().rate || 1);
  var baseRepair = Math.round(cls.maintenance * rate * (2.5 + Math.random() * 3));

  /* Insurance offset — comprehensive covers 75%, third-party fire covers 20%, TP covers 0 */
  var insType = car.insurance || 'none';
  var insuranceCovers = insType === 'compreh' || insType === 'compreh_pl' ? 0.75 :
                        insType === 'tp_fire' ? 0.20 : 0;
  var playerPays = Math.round(baseRepair * (1 - insuranceCovers));
  var coverageText = insuranceCovers > 0 ? ' (Insurance covers ' + Math.round(insuranceCovers * 100) + '%)' : ' (No insurance)';

  /* Damage the car */
  car.condition = Math.max(0, (car.condition || 100) - (30 + Math.floor(Math.random() * 25)));
  var severelyDamaged = Math.random() < 0.5 || car.condition < 40;
  if (severelyDamaged) {
    car.broken = true;
    car.repairCost = playerPays;
  }

  log('🚗 Your ' + (car.brand || '') + ' ' + (car.model || 'car') + ' is damaged.' + coverageText);
  log('🔧 Repair cost: ' + money(playerPays) + ' — check Cars tab.');
  if (typeof recordMoment === 'function') {
    recordMoment('The accident', 'A crash on a normal Tuesday. The car was not the only thing shaken.', { icon: '🚗', key: 'car_accident_' + gameYear(), weight: 2 });
  }

  /* Charge: try cash, then credit card, then go negative */
  if (S.wealth >= playerPays) {
    S.wealth -= playerPays;
  } else if (S.bank && Array.isArray(S.bank.creditCards)) {
    var card = S.bank.creditCards.find(function(c) { return (c.limit || 0) - (c.balance || 0) >= playerPays; });
    if (card) {
      card.balance = (card.balance || 0) + playerPays;
      log('💳 Charged ' + money(playerPays) + ' to ' + card.name + '.');
    } else {
      S.wealth -= playerPays;
      log('💸 You went into debt for the repair.');
    }
  } else {
    S.wealth -= playerPays;
  }

  /* Fire insurance claim event if applicable */
  if (insuranceCovers > 0 && typeof emitSignal === 'function') {
    emitSignal('carAccident', { car: car, covered: insuranceCovers });
  }
}
function rollMisfortune() {
  if (!S) return false;
  if (S.age < 16) return false;
  if (S.pending) return false;

  var countryDiff = getCountryDifficulty(S.country);

  /* Base chance: 8% per year, scaled by country difficulty */
  var baseChance = 0.08 + (countryDiff - 50) * 0.002;
  /* Egypt: 0.08 + 0.064 = ~14% chance per year */
  /* USA: 0.08 + 0.024 = ~10% */
  /* Saudi: 0.08 + 0.016 = ~10% */
  baseChance = Math.max(0.03, Math.min(0.22, baseChance));

  /* Wealth buffer: having money reduces some misfortunes (insurance, etc.) */
  if (S.wealth > 500000) baseChance *= 0.7;
  else if (S.wealth > 100000) baseChance *= 0.85;

  if (Math.random() > baseChance) return false;

  /* Pick weighted */
  var eligible = MISFORTUNE_POOL.filter(function(m) {
    return S.age >= m.minAge && S.age <= m.maxAge;
  });
  var total = eligible.reduce(function(s, m) { return s + m.weight; }, 0);
  var roll = Math.random() * total;
  var chosen = eligible[0];
  for (var i = 0; i < eligible.length; i++) {
    roll -= eligible[i].weight;
    if (roll <= 0) { chosen = eligible[i]; break; }
  }

  /* Apply */
  if (typeof log === 'function') log(chosen.text);

  if (chosen.cost && chosen.cost > 0) {
    var costLocal = chosen.cost * ((C().rate || 1) / 52.7);
    /* Try credit card if not enough cash */
    if (S.wealth < costLocal) {
      if (S.bank && Array.isArray(S.bank.creditCards)) {
        var card = S.bank.creditCards.find(function(c) {
          return (c.limit || 0) - (c.balance || 0) >= costLocal;
        });
        if (card) {
          card.balance = (card.balance || 0) + costLocal;
          log('💳 Charged ' + money(costLocal) + ' to ' + card.name + '.');
        } else {
          S.wealth -= costLocal;
        }
      } else {
        S.wealth -= costLocal;
      }
    } else {
      S.wealth -= costLocal;
    }
  }
  if (chosen.health && typeof fx === 'function') fx({ health: chosen.health });
  if (chosen.happiness && typeof addHappiness === 'function') addHappiness(chosen.happiness);
  if (chosen.special === 'car_damage') {
    _applyCarDamageFromAccident();
  }
   if (chosen.id === 'sudden_illness' && typeof medAddCondition === 'function') {
  var _illPool = ['anxiety', 'depression', 'hypertension', 'type2_diabetes'];
  medAddCondition(_illPool[Math.floor(Math.random() * _illPool.length)]);
}

if (chosen.id === 'theft' && S.shopping && Array.isArray(S.shopping.inventory) && S.shopping.inventory.length > 0) {
  var _stolenIdx = Math.floor(Math.random() * S.shopping.inventory.length);
  var _stolenItem = S.shopping.inventory[_stolenIdx];
  S.shopping.inventory.splice(_stolenIdx, 1);
  log('🔓 Stolen: ' + (_stolenItem.brand || '') + ' ' + (_stolenItem.name || 'an item') + '.');
}

if (chosen.id === 'scam' && S.bank) {
  S.bank.score = Math.max(300, (S.bank.score || 680) - 15);
  log('📉 Credit score dropped due to the fraud.');
}

if (chosen.id === 'lawsuit' && S.career && S.career.job) {
  S.career.job.performance = Math.max(0, (S.career.job.performance || 50) - 10);
  log('💼 The lawsuit is distracting you at work.');
}

if (chosen.id === 'home_damage' && S.ownedHomes) {
  var _damagedHome = S.ownedHomes.find(function(h) { return h.status === 'occupied'; });
  if (_damagedHome) {
    _damagedHome.condition = Math.max(0, (_damagedHome.condition || 100) - 20);
    log('🔨 The repair will need to happen eventually. Condition now ' + _damagedHome.condition + '%.');
  }
}

if (chosen.id === 'medical_emergency' && typeof medAddCondition === 'function') {
  medAddCondition(Math.random() < 0.5 ? 'fracture' : 'heart_attack');
}

if (chosen.id === 'inflation_spike' && S.household) {
  S.household._inflationSpike = (S.household._inflationSpike || 0) + 0.08;
  log('💸 Household prices jumped 8% this year.');
}
  if (chosen.special === 'job_loss') {
    if (S.career && S.career.job) {
      if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('random layoff');
    }
  }
  if (chosen.special === 'family_death') {
    var familyCandidates = (S.family || []).filter(function(m) {
      return m.alive !== false && m.role !== 'Spouse' && m.age < 65;
    });
    if (familyCandidates.length > 0) {
      var m = familyCandidates[Math.floor(Math.random() * familyCandidates.length)];
      m.alive = false;
      m.deathYear = gameYear();
      log('🕊 ' + m.name + ' passed away. You were not prepared.');
    }
  }
  if (chosen.special === 'friend_betray') {
    var friends = (S.friends || []).filter(function(f) { return f.alive !== false; });
    if (friends.length > 0) {
      var f = friends[Math.floor(Math.random() * friends.length)];
      f.bond = Math.max(0, (f.bond || 50) - 30);
    }
  }

  /* Record as moment */
  if (typeof recordMoment === 'function') {
    recordMoment('The year things went wrong', chosen.text.replace(/^[^\s]+\s/, ''), { icon: '💥', key: 'misf_' + chosen.id + '_' + gameYear(), weight: 1 });
  }
  return true;
}
window.rollMisfortune = rollMisfortune;

/* ---------- 4. AMBIENT HEALTH DECLINE AFTER 40 ---------- */
function applyAmbientHealthDecline() {
  if (!S) return;
  if (S.age < 40) return;

  var decline = 0;
  if (S.age >= 40 && S.age < 50) decline = 0.5;
  else if (S.age >= 50 && S.age < 60) decline = 1;
  else if (S.age >= 60 && S.age < 70) decline = 1.5;
  else if (S.age >= 70 && S.age < 80) decline = 2.5;
  else if (S.age >= 80) decline = 4;

  /* Accelerators */
  if (S.stress >= 70) decline *= 1.8;
  if (S.happiness < 30) decline *= 1.4;

  var before = S.health || 100;
  S.health = Math.max(0, before - decline);

  /* Threshold warnings */
  if (before > 50 && S.health <= 50 && S.health > 40) {
    if (typeof log === 'function') log('❤️ Your body is slowing down. Health is degrading.');
  }
  if (before > 30 && S.health <= 30) {
    if (typeof log === 'function') log('⚠️ Health critical. See a doctor.');
    if (typeof emitSignal === 'function') emitSignal('healthCritical', { health: S.health, prev: before });
  }
}
window.applyAmbientHealthDecline = applyAmbientHealthDecline;

/* ---------- 5. MARRIAGE CRISIS ROLL ---------- */
function rollMarriageCrisis() {
  if (!S || !S.marriage || S.marriage.status !== 'married' || !S.marriage.partner) return false;
  if (S.marriage.partner.alive === false) return false;
  if (S.pending) return false;

  var p = S.marriage.partner;
  var bond = p.bond || 70;
  var trust = p.trust || 50;
  var countryDiff = getCountryDifficulty(S.country);

  /* Base divorce rate per year (Egypt ~4%, USA ~5%, Western Europe ~3%) */
  var baseRate = countryDiff >= 80 ? 0.04 : countryDiff >= 60 ? 0.05 : 0.03;

  /* Marriage quality modifiers */
  if (bond < 30) baseRate *= 4;
  else if (bond < 45) baseRate *= 2.5;
  else if (bond < 60) baseRate *= 1.5;
  if (trust < 40) baseRate *= 2;

  /* Years married modifier (first 3 years higher, 5-10 lower, 10+ starts rising again) */
  var marriedYears = gameYear() - (p.marriedYear || gameYear());
  if (marriedYears < 3) baseRate *= 1.3;
  else if (marriedYears > 15) baseRate *= 1.2;

  /* Affairs happen */
  var affairChance = 0.03 + (bond < 40 ? 0.04 : 0);
  if (Math.random() < affairChance && !S.pending) {
    var affairs = [
      { label: 'emotional', text: 'You discovered ' + p.name + ' has been confiding in someone else for months. The messages were not romantic yet — but they were heading there.' },
      { label: 'physical', text: 'You found the messages. ' + p.name + ' has been having a physical affair for weeks. You saw everything.' }
    ];
    var chosen = affairs[Math.floor(Math.random() * affairs.length)];
    p.bond = Math.max(0, bond - 25);
    p.trust = Math.max(0, trust - 30);

    /* Fire the real confrontation event — NOT just a log */
    S.pending = {
      title: '💔 You Found Out',
      text: chosen.text + '\n\nYou sit on the couch. Your hands are shaking. You have to decide what to do.',
      choices: [
        {
          label: 'Confront them directly',
          effect: function(s) {
            if (Math.random() < 0.5) {
              p.bond = Math.max(0, p.bond - 20);
              log('😢 ' + p.name + ' broke down and begged for forgiveness. You did not answer.');
            } else {
              p.bond = Math.max(0, p.bond - 40);
              log('😡 ' + p.name + ' denied everything. Then packed a bag.');
            }
            if (typeof addHappiness === 'function') addHappiness(-20);
            s.health = Math.max(0, (s.health || 100) - 3);
            if (typeof recordMoment === 'function') {
              recordMoment('The day you found out', chosen.text, { icon: '💔', key: 'affair_found_' + gameYear(), weight: 3 });
            }
          }
        },
        {
          label: 'File for divorce immediately',
          effect: function(s) {
            if (typeof evtForceDivorce === 'function') {
              evtForceDivorce(s, 'infidelity');
              log('💔 You divorced ' + p.name + ' over infidelity.');
            }
             /* Clear in-laws — they are no longer family */
if (Array.isArray(S.family)) {
  S.family = S.family.filter(function(m) { return m.relation !== 'inlaw'; });
}
            if (typeof recordMoment === 'function') {
              recordMoment('The day you ended it', 'You filed the papers. It was the hardest thing you have done.', { icon: '💔', key: 'divorce_affair_' + gameYear(), weight: 3 });
            }
          }
        },
        {
          label: 'Say nothing — plan your exit quietly',
          effect: function(s) {
            if (typeof evtRemember === 'function') {
              evtRemember('quietExitPlan', true, 3);
              evtRemember('spouseCheated', true, 5);
            }
            if (typeof addHappiness === 'function') addHappiness(-15);
            log('🤫 You said nothing. You started planning.');
          }
        }
      ]
    };
    S.evId = 'affair_discovery_' + gameYear();
    return true;
  }

  /* Divorce roll */
  if (Math.random() < baseRate) {
    /* Small chance of reconciliation attempt */
    if (bond >= 50 && Math.random() < 0.4) {
      if (typeof log === 'function') log('💬 ' + p.name + ' asked for space. Not divorce. Yet.');
      p.bond = Math.max(0, bond - 5);
    } else if (typeof evtForceDivorce === 'function') {
      if (typeof log === 'function') log('💔 ' + p.name + ' asked for a divorce.');
      evtForceDivorce(S, 'irreconcilable differences');
      return true;
    }
  }
  return false;
}
window.rollMarriageCrisis = rollMarriageCrisis;

/* ---------- 6. CLASS TRACKING ---------- */
function getSocialClass() {
  if (!S) return 'middle';
  var w = S.wealth || 0;
  var income = (S.household && S.household.income) || 0;
  var countryDiff = getCountryDifficulty(S.country);

  /* Thresholds scaled by country */
  var poorThreshold = 30000 * (countryDiff / 50);
  var middleThreshold = 500000 * (countryDiff / 50);
  var upperThreshold = 2000000 * (countryDiff / 50);
  var richThreshold = 8000000 * (countryDiff / 50);

  var score = w + income * 2;
  if (score < poorThreshold) return 'poor';
  if (score < middleThreshold) return 'lower-middle';
  if (score < upperThreshold) return 'middle';
  if (score < richThreshold) return 'upper-middle';
  return 'wealthy';
}
window.getSocialClass = getSocialClass;

function checkClassShift() {
  if (!S) return;
  if (S.age < 18) return;
  var current = getSocialClass();
  var prev = S._lastClass;
  S._lastClass = current;

  if (prev && prev !== current) {
    var classes = ['poor', 'lower-middle', 'middle', 'upper-middle', 'wealthy'];
    var prevIdx = classes.indexOf(prev);
    var currIdx = classes.indexOf(current);
    if (currIdx > prevIdx) {
      if (typeof log === 'function') log('⬆️ Your social class rose: ' + prev + ' → ' + current);
    } else if (currIdx < prevIdx) {
      if (typeof log === 'function') log('⬇️ Your social class fell: ' + prev + ' → ' + current);
    }
  }
}
window.checkClassShift = checkClassShift;

/* ---------- 7. CAREER CEILING ---------- */
function getCareerCeiling(trackId) {
  if (!S) return 6;
  var countryDiff = getCountryDifficulty(S.country);
  var bornClass = (S.familyTier || 'middle');
  var currentClass = getSocialClass();

  /* Born poor: harder to reach top */
  if (bornClass === 'poor' && currentClass === 'poor') return countryDiff >= 75 ? 3 : 4;
  if (bornClass === 'poor' && currentClass !== 'poor') return 5;

  /* Middle class can reach level 4-5 */
  if (bornClass === 'middle' || bornClass === 'lower-mid') return 5;

  /* Upper class can reach top */
  if (bornClass === 'upper-mid' || bornClass === 'wealthy' || bornClass === 'ultra') return 6;

  return 5;
}
window.getCareerCeiling = getCareerCeiling;

function checkCareerCeiling() {
  if (!S || !S.career || !S.career.job) return;
  var ceiling = getCareerCeiling(S.career.job.track);
  var level = S.career.job.level || 0;
  if (level >= ceiling && !S._ceilingWarned) {
    S._ceilingWarned = true;
    if (typeof log === 'function') log('🚧 You have reached the practical ceiling for your background. Going further requires breaking through.');
    if (typeof recordMoment === 'function') {
      recordMoment('The ceiling', 'You are as high as your birth allows. Anything more is you breaking the rules.', { icon: '🚧', key: 'ceiling_' + S.career.job.track, weight: 2 });
    }
  }
}
window.checkCareerCeiling = checkCareerCeiling;

/* ---------- 8. WIRE INTO YEAR TICK ---------- */
GameHooks.on('year', function() {
  if (!S) return;
  if (S.age < 16) return;
  if (S.alive === false) return;

  applyStressEffects();
  applyAmbientHealthDecline();
  checkClassShift();
  checkCareerCeiling();

  if (!S.pending) rollMisfortune();
  if (!S.pending) rollMarriageCrisis();
});

/* Initialize migration */
if (typeof migrateDualState === 'function') {
  var _origMigrate12 = migrateDualState;
  migrateDualState = function() {
    _origMigrate12();
    if (S) {
      if (typeof S.stress !== 'number') S.stress = 0;
      if (typeof S._stressHighYears !== 'number') S._stressHighYears = 0;
      if (typeof S._lastClass !== 'string') S._lastClass = getSocialClass();
    }
  };
  window.migrateDualState = migrateDualState;
}
