/* ============================================================
   WORLD LIFE — ENGINE (hardened)
   ============================================================
   This file owns: S, GameHooks, helpers, ageUp, render,
   start screen, save/load/reset, event system.

   Defensive: if a data file (js/01-data-*.js etc.) fails to load,
   the game shows a friendly error screen instead of crashing.
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
   DATA GUARD — true if COUNTRIES loaded correctly
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
  return COUNTRIES[S?.country] || COUNTRIES.egy;
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
function isSummer() { return currentSeason() === 'summer'; }
function isSchoolMonth() { return currentMonth() === 9 || currentMonth() === 1; }
function monthsUntil(targetMonth) {
  let diff = (targetMonth - currentMonth() + 12) % 12;
  return diff === 0 ? 12 : diff;
}
function monthlyScale(annual) { return isMonthly() ? (annual || 0) / 12 : (annual || 0); }

/* Islamic calendar approximation — Ramadan drifts ~11 days/year earlier.
   Approximated as: month = 3 for 2024-2027, month = 2 for 2028-2031, etc.
   Good enough for a life sim; real dates vary by region. */
function isRamadanMonth() {
  if (!isMonthly()) return false;
  const y = gameYear();
  const cycle = (y - 2024) % 33; // 33-year Islamic cycle
  const monthShift = Math.floor(cycle / 3); // ~3 years per month shift
  let rm = 3 - monthShift; // 2024 ≈ March
  while (rm < 1) rm += 12;
  while (rm > 12) rm -= 12;
  return currentMonth() === rm;
}
function log(msg) {
  if (!S.log) S.log = [];
  S.log.unshift({ age: S.age, year: gameYear(), month: S.month || null, msg: msg });
  if (S.log.length > 300) S.log.pop();
}
// Apply stat effects. Used by year ticks in views (cars, future systems).
function fx(effects) {
  if (!effects || !S) return;
  ['happiness', 'health', 'smarts', 'social'].forEach(function(k) {
    if (typeof effects[k] === 'number') S[k] = clamp(S[k] + effects[k], 0, 100);
  });
  if (typeof effects.wealth === 'number') S.wealth += effects.wealth;
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
/* ---------- ENGINE YEAR TICK (non-cash annual things) ---------- */
function engineYearTick() {
  if (!S) return;

  /* School smarts growth */
  if (S.age >= 6 && S.age < 18 && S.school) {
    const sch = C().schools.find(x => x.id === S.school);
    if (sch) S.smarts = clamp(S.smarts + sch.smarts, 0, 100);
  }

  /* Thanaweya exam at 18 */
  if (S.age === 18 && S.school && !S.uni && !S.degree) {
    const score = clamp(S.smarts + Math.random() * 20 - 10, 0, 100);
    S.thanaweyaScore = score;
    log(`Thanaweya amma result: ${score.toFixed(1)}%`);
  }

  /* University progress */
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

  /* Health decay after 50 */
  if (S.age > 50) S.health = clamp(S.health - 1, 0, 100);
}

/* ---------- ADVANCE ONE YEAR (yearly mode) ---------- */
function advanceYear() {
  if (S.pending) return;

  S.age++;
  S.family.forEach(m => { if (m.alive) m.age++; });

  engineYearTick();

  /* Salary payment — ONLY in yearly mode (monthly handled by settlement) */
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

  /* Base expenses — ONLY in yearly mode */
  if (S.age >= 18) {
    const c = C();
    if (S.housing === 'parents') {
      const personal = Math.round(c.prices.phone * 0.5 + c.prices.transport * 0.25);
      S.wealth -= personal;
    } else {
      let expenses = c.prices.food + c.prices.phone + c.prices.transport;
      if (S.housing === 'rented') expenses += c.prices.rent;
      S.wealth -= expenses;
    }
  }

  GameHooks.run('year', S);

  ['health', 'happiness', 'smarts', 'social'].forEach(k => { S[k] = clamp(S[k], 0, 100); });

  /* Random event firing */
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

/* ---------- ADVANCE ONE MONTH (monthly mode) ---------- */
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
/* ---------- THE SINGLE BUTTON HANDLER ---------- */
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

function tabs() {
  const sorted = [...GameHooks.tabs].sort((a, b) => a.order - b.order);
  return sorted.map(t => `<button class="${activeTab===t.id?'on':''}" onclick="switchTab('${t.id}')">${t.label}</button>`).join('');
}

function eventCard(e) {
  const text = typeof e.text === 'function' ? e.text(S) : e.text;
  return `<div class="card" style="border-color:#8b5cf6">
    <h3>${e.title}</h3>
    <p class="muted small" style="line-height:1.5;margin-bottom:10px">${text}</p>
    ${e.choices.map((c,i) => `<button class="opt" onclick="chooseEvent(${i})">${c.label}</button>`).join('')}
  </div>`;
}

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
          The <b>COUNTRIES</b> object was never created.
        </p>
        <p class="muted small" style="margin-top:14px;line-height:1.6;color:#fbbf24">
          <b>Most common cause — extra <code>};</code> at the bottom of the file.</b>
        </p>
        <p class="muted small" style="margin-top:8px;line-height:1.6">
          Open <b>js/01-data-countries.js</b> in Notepad and scroll to the very bottom.
          The file must end like this:
        </p>
        <pre style="background:#0a0a12;padding:10px;border-radius:6px;margin:8px 0;font-size:.75rem;overflow-x:auto;color:#34d399">  sau: {
    ...
  },
  /* 👇 ADD NEW COUNTRIES HERE 👇 */
};

window.COUNTRIES = COUNTRIES;</pre>
        <p class="muted small" style="line-height:1.6">
          If you see <b>TWO</b> <code>};</code> lines with a comment between them, delete the extra one.
        </p>
        <p class="muted small" style="margin-top:14px;padding:10px;background:#0a0a12;border-radius:6px;line-height:1.7">
          <b>Not sure what's wrong?</b><br>
          1. Press <b>F12</b> in your browser<br>
          2. Click the <b>Console</b> tab<br>
          3. Look for a <span style="color:#fb7185">red</span> error mentioning <b>01-data-countries.js</b><br>
          4. It will say the exact line number that's broken
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
   WINDOW BINDINGS
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
window.ageUp = ageUp;
window.chooseEvent = chooseEvent;
window.switchTab = (id) => { activeTab = id; render(); };
window.startGame = startGame;
window.setGender = setGender;
window.setCountry = setCountry;
window.loadGame = loadGame;
window.reset = reset;
window.renderStart = renderStart;
window.START = START;
window.dataOK = dataOK;
