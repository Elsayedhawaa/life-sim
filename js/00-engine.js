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
  on(name, fn) { if (this[name]) this[name].push(fn); },
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
  ['happiness', 'health', 'smarts', 'social'].forEach(k => {
    if (typeof effects[k] === 'number') S[k] = clamp(S[k] + effects[k], 0, 100);
  });
  if (typeof effects.wealth === 'number') S.wealth += effects.wealth;
}

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
  };
  S.family.push({ role: 'Mother', name: 'Mother', age: 30, bond: 70, alive: true });
  S.family.push({ role: 'Father', name: 'Father', age: 32, bond: 70, alive: true });
  log(`Born in ${c.name}, 2007. You are 6 years old.`);
  log(START.gender === 'f' ? 'You are a girl.' : 'You are a boy.');
  log(`Family: ${START.familyTier} · Parents: ${START.parentType}.`);
  if (typeof GLOBAL_EVENTS !== 'undefined' && GLOBAL_EVENTS.length) {
    S.pending = prepareEvent(GLOBAL_EVENTS[0]);
  }
  GameHooks.run('newGame', S);
  save(); render();
}

/* ============================================================
   EVENT PREPARATION
   ============================================================ */
function prepareEvent(e) {
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
  return e;
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

  if (S.age >= 18) {
    const c = C();
    if (S.housing === 'parents') {
      const personal = Math.round(c.prices.phone * 0.5 + c.prices.transport * 0.25);
      S.wealth -= personal;
    } else {
      let expenses = c.prices.food + c.prices.phone + c.prices.transport;
      if (S.housing === 'rented') {
        expenses += (typeof currentYearlyRent === 'function' ? currentYearlyRent() : (c.prices.rent || 0));
      }
      S.wealth -= expenses;
    }
  }

  GameHooks.run('year', S);

  ['health', 'happiness', 'smarts', 'social'].forEach(k => { S[k] = clamp(S[k], 0, 100); });

  const allEvents = [...GLOBAL_EVENTS, ...(C().events || [])];
  const eligible = allEvents.filter(e =>
    S.age >= e.minAge && S.age <= e.maxAge &&
    !S.flags['evt_' + e.id] &&
    (!e.condition || e.condition(S))
  );
  if (eligible.length && Math.random() < 0.7) {
    const e = eligible[Math.floor(Math.random() * eligible.length)];
    S.pending = prepareEvent(e);
    S.evId = e.id;
    log(`📖 ${e.title}`);
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
  }

  GameHooks.run('month', S, { month: S.month, isYearEnd: S.month === 1 });

  if (!silent) { save(); render(); }
}

function ageUp() {
  if (!S) return;
  if (isMonthly()) advanceMonth();
  else advanceYear();
}

function chooseEvent(i) {
  const e = S.pending;
  if (!e || !e.choices[i]) return;
  const choice = e.choices[i];
  if (typeof choice.effect === 'function') choice.effect(S);
  ['health', 'happiness', 'smarts', 'social'].forEach(k => { S[k] = clamp(S[k], 0, 100); });
  if (S.evId) S.flags['evt_' + S.evId] = true;
  log(`→ ${choice.label}`);
  S.pending = null;
  S.evId = null;
  save(); render();
}

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  if (!S) { renderStart(); return; }

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
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch(e) {} }
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { S = JSON.parse(raw); activeTab = 'life'; render(); return true; }
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
