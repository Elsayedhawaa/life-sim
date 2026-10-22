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

  // Execute text if it's a function
  var prepared = Object.assign({}, e);
  if (typeof prepared.text === 'function') {
    try { prepared.text = prepared.text(S); }
    catch (err) { prepared.text = '...'; }
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
    if (eligible.length && Math.random() < 0.7 && !S.pending) {
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
   EVENT CARD (UI for pending events)
   ============================================================ */
function eventCard(pending) {
  if (!pending) return '';
  let html = '<div class="card" style="border-color:#8b5cf6; background:#14141f;">' +
    '<h3 style="color:#8b5cf6">' + pending.title + '</h3>' +
    '<p class="small" style="white-space:pre-wrap; margin-bottom:12px;">' + pending.text + '</p>' +
    '<div style="display:flex; flex-direction:column; gap:8px;">';
  
  pending.choices.forEach(function(choice, index) {
    html += '<button class="opt" style="text-align:center; background:#25253a; border-color:#8b5cf6; font-weight:bold;" onclick="chooseEvent(' + index + ')">' + choice.label + '</button>';
  });
  
  html += '</div></div>';
  return html;
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

window.characterSay = characterSay;
window.characterSpeak = characterSpeak;


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
