/* ============================================================
   WORLD LIFE — ENGINE
   ============================================================
   This file owns: S, GameHooks, helpers, ageUp, render,
   start screen, save/load/reset, event system.

   It knows NOTHING about specific views. Views register themselves
   via GameHooks.registerTab({...}) at the bottom of their own file.

   DO NOT ADD FEATURES HERE. This file should never grow past ~400 lines.
   ============================================================ */

const SAVE_KEY = 'world_life_v5';
let S = null;
let activeTab = 'life';
let START = { name: '', gender: 'm', country: 'egy', familyTier: 'middle', parentType: 'balanced' };

/* ============================================================
   GAMEHOOKS — the connection between engine and every system
   ============================================================ */
const GameHooks = {
  year: [], render: [], newGame: [], migrate: [],
  tabs: [],
  on(name, fn) { if (this[name]) this[name].push(fn); },
  run(name, ...args) { if (this[name]) this[name].forEach(fn => { try { fn(...args); } catch(e) { console.error(e); } }); },
  registerTab(tab) { this.tabs.push(tab); },
};

/* ============================================================
   HELPERS
   ============================================================ */
function C() { return COUNTRIES[S?.country] || COUNTRIES.egy; }
function gameYear() { return 2001 + (S?.age || 6); }
function money(n) { const c = C(); return Math.round(n).toLocaleString() + ' ' + c.currency; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, Math.round(v))); }
function log(msg) { if (!S.log) S.log = []; S.log.unshift({ age: S.age, year: gameYear(), msg }); if (S.log.length > 200) S.log.pop(); }
// Apply stat effects. Used by year ticks in views (16, 17, etc).
// Example: fx({ happiness: -5, social: +2 })
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
  const c = COUNTRIES[START.country];
  S = {
    name: START.name || 'You',
    gender: START.gender,
    country: START.country,
    currency: c.currency,
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
  S.pending = prepareEvent(GLOBAL_EVENTS[0]);
  GameHooks.run('newGame', S);
  save(); render();
}

/* ============================================================
   EVENT PREPARATION — for events with dynamic choice lists
   ============================================================ */
function prepareEvent(e) {
  if (e.dynamic === 'school') {
    const c = C();
    return {
      title: e.title,
      text: e.text,
      choices: c.schools.map(sch => ({
        label: `${sch.name}${sch.cost > 0 ? ' (' + sch.cost.toLocaleString() + ' ' + c.currency + '/yr, family pays)' : ' (free)'}`,
        effect: s => { s.school = sch.id; }
      }))
    };
  }
  return e;
}

/* ============================================================
   AGE UP — the ONE year tick
   ============================================================ */
function ageUp() {
  if (S.pending) return;
  S.age++;

  S.family.forEach(m => { if (m.alive) m.age++; });

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
      if (S.housing === 'rented') expenses += c.prices.rent;
      S.wealth -= expenses;
    }
  }

  if (S.age > 50) S.health = clamp(S.health - 1, 0, 100);

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
   RENDER — dispatches to the registered tab view
   ============================================================ */
function render() {
  if (!S) { renderStart(); return; }
  document.getElementById('header').innerHTML = header();
  document.getElementById('tabs').innerHTML = tabs();
  const viewFn = getViewFn(activeTab);
  document.getElementById('view').innerHTML =
    (S.pending ? eventCard(S.pending) : '') +
    viewFn();
  const b = document.getElementById('bottom');
  if (S.pending) b.innerHTML = `<button disabled>Choose an option above</button>`;
  else if (S.age >= 100) b.innerHTML = `<button onclick="reset()">Life complete — Start over</button>`;
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
        <div class="muted" style="font-size:.7rem;letter-spacing:.06em">AGE ${S.age} · ${gameYear()} · ${C().flag} ${C().name}</div>
        <div style="font-size:1.15rem;font-weight:bold;margin-top:2px">${S.name} ${S.gender==='f'?'♀':'♂'}</div>
      </div>
      <div style="text-align:right">
        <div class="muted" style="font-size:.7rem">WEALTH</div>
        <div class="mono ${S.wealth < 0 ? 'bad' : 'good'}" style="font-weight:bold">${money(S.wealth)}</div>
        <button onclick="reset()" style="background:none;border:none;color:#666;font-size:.65rem;cursor:pointer;text-decoration:underline;margin-top:4px;padding:0">restart</button>
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
      <h3>Family wealth</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:6px">
        <button class="pill ${START.familyTier==='poor'?'on':''}" onclick="START.familyTier='poor';renderStart()">Poor</button>
        <button class="pill ${START.familyTier==='middle'?'on':''}" onclick="START.familyTier='middle';renderStart()">Middle</button>
        <button class="pill ${START.familyTier==='wealthy'?'on':''}" onclick="START.familyTier='wealthy';renderStart()">Wealthy</button>
      </div>
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
function startGame() { newLife(); activeTab = 'life'; render(); }

/* ============================================================
   SAVE / LOAD / RESET
   ============================================================ */
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch(e) {} }
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { S = JSON.parse(raw); activeTab = 'life'; render(); return true; }
  } catch(e) {}
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
   WINDOW BINDINGS — engine globals
   ============================================================ */
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
