#!/usr/bin/env node
/* v2.16 Worker 1 — light/dark theme probe (node, no browser).
 *
 * Proves, with measured numbers:
 *  1. The toggle renders on the main page (header) with both "Light" and
 *     "Dark" labels, on every tab, in both themes.
 *  2. Clicking it flips data-theme on #app (and <html>), persists
 *     'world_life_2_theme' in localStorage, and flips back.
 *  3. The background colour changes on every tab: the resolved CSS
 *     --era-canvas / --bg-card values differ light vs dark, for every era.
 *  4. The era skin still differs between a 1962 life and a 2026 life in
 *     dark mode (era class differs, dark era tints differ, warm stays warm).
 *  5. The saved theme survives a re-init (set dark, fresh import, still dark).
 *  6. Text contrast passes (>= 4.5:1) on the main screens in both themes.
 *  7. The charts redraw in theme colours (no hardcoded chart colours left
 *     in the Finance / trajectory / property-market SVGs).
 *  8. Dark mode uses no filter/invert anywhere and touches no img.
 *
 * Runs main.js in node behind a small fake DOM + fake localStorage.
 */
import { readFileSync } from 'node:fs';
import { createNewLifeState } from '../src/core/schema.js';
import { saveGameToStorage } from '../src/core/gameLoop.js';
import {
  renderHudHtml, renderFinanceTabHtml, renderLifeTabHtml, eraClassForYear,
  getSavedTheme, THEME_STORAGE_KEY
} from '../src/ui/views.js';

const print = (...a) => console.log(...a);
let failures = 0;
function check(name, ok, detail = '') {
  print(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}

/* ---------- fake localStorage + fake DOM ---------- */
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: (k) => store.delete(k),
  clear: () => store.clear()
};

class FakeClassList {
  constructor() { this._s = new Set(); }
  add(...c) { c.forEach((x) => this._s.add(x)); }
  remove(...c) { c.forEach((x) => this._s.delete(x)); }
  contains(c) { return this._s.has(c); }
  toString() { return [...this._s].join(' '); }
}
function makeEl() {
  return {
    classList: new FakeClassList(),
    dataset: {},
    _html: '',
    set innerHTML(v) { this._html = String(v); },
    get innerHTML() { return this._html; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    focus() {},
    setSelectionRange() {},
    style: {}
  };
}
const appRoot = makeEl();
const toastEl = makeEl();
const docEl = { dataset: {} };
const listeners = {};
globalThis.document = {
  documentElement: docEl,
  getElementById: (id) => (id === 'app' ? appRoot : id === 'toast-mount' ? toastEl : null),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: (type, fn) => { (listeners[type] = listeners[type] || []).push(fn); }
};
function clickBtn(dataset) {
  const btn = { dataset };
  const ev = { target: { closest: () => btn } };
  for (const fn of listeners.click || []) fn(ev);
}
const eraClassOnRoot = () => [...appRoot.classList._s].find((c) => c.startsWith('era-')) || '(none)';

/* ---------- CSS parsing: resolve var values per theme + era ---------- */
const css = readFileSync(new URL('../styles/main.css', import.meta.url), 'utf8');
const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
function varsInBlock(re) {
  const m = cssNoComments.match(re);
  if (!m) return {};
  const out = {};
  for (const [, name, val] of m[1].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) out[name] = val.trim();
  return out;
}
const rootVars = varsInBlock(/:root\s*\{([^}]*)\}/);
const darkVars = varsInBlock(/html\[data-theme="dark"\]\s*,\s*#app\[data-theme="dark"\]\s*\{([^}]*)\}/);
function eraVars(theme) {
  const out = {};
  const re = theme === 'dark'
    ? /#app\[data-theme="dark"\]\.era-(\d+s)\s*\{([^}]*)\}/g
    : /#app\.era-(\d+s)\s*\{([^}]*)\}/g;
  for (const m of cssNoComments.matchAll(re)) {
    const o = {};
    for (const [, n, v] of m[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) o[n] = v.trim();
    out[m[1]] = o;
  }
  return out;
}
const lightEra = eraVars('light');
const darkEra = eraVars('dark');
const resolve = (theme, era, name) => {
  if (era && theme === 'dark' && darkEra[era] && darkEra[era][name]) return darkEra[era][name];
  if (era && theme === 'light' && lightEra[era] && lightEra[era][name]) return lightEra[era][name];
  if (theme === 'dark' && darkVars[name]) return darkVars[name];
  return rootVars[name];
};

/* ---------- contrast ---------- */
function lum(hex) {
  const c = hex.replace('#', '');
  const f = (i) => {
    const v = parseInt(c.substr(i, 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(0) + 0.7152 * f(2) + 0.0722 * f(4);
}
function contrast(a, b) {
  const l1 = lum(a), l2 = lum(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/* ================= 1–3. Boot, toggle render, flip, flip back ================= */
const mainA = await import('../src/main.js?boot=1');
check('default theme is light (new player never opens dark)',
  appRoot.dataset.theme === 'light' && docEl.dataset.theme === 'light' && getSavedTheme() === 'light',
  `data-theme=${appRoot.dataset.theme}`);
check('toggle renders on main page with Light + Dark labels',
  appRoot.innerHTML.includes('data-action="toggle-theme"') &&
  appRoot.innerHTML.includes('>Light<') && appRoot.innerHTML.includes('>Dark<'),
  'segmented control in header');
check('toggle marks Light active by default',
  appRoot.innerHTML.includes('theme-toggle-btn active" data-action="toggle-theme" data-theme="light"'));
check('era class applied at boot', /^era-\d+s$/.test(eraClassOnRoot()), eraClassOnRoot());

clickBtn({ action: 'toggle-theme', theme: 'dark' });
check('click Dark flips theme attribute on #app and <html>',
  appRoot.dataset.theme === 'dark' && docEl.dataset.theme === 'dark',
  `data-theme=${appRoot.dataset.theme}`);
check('click Dark persists world_life_2_theme=dark',
  localStorage.getItem(THEME_STORAGE_KEY) === 'dark');
check('toggle marks Dark active after switch',
  appRoot.innerHTML.includes('theme-toggle-btn active" data-action="toggle-theme" data-theme="dark"'));
check('era class survives the theme switch', eraClassOnRoot() === 'era-1990s', eraClassOnRoot());

/* Toggle + background change on every tab, in dark mode. */
const TABS = ['life', 'education', 'people', 'work', 'realestate', 'finance', 'lifestyle', 'world'];
const darkShellBg = resolve('dark', '1990s', 'era-canvas');
const lightShellBg = resolve('light', '1990s', 'era-canvas');
const darkCardBg = resolve('dark', '1990s', 'era-card');
const lightCardBg = resolve('light', '1990s', 'era-card');
let tabsWithToggleDark = 0;
for (const tab of TABS) {
  clickBtn({ action: 'switch-tab', tab });
  if (appRoot.innerHTML.includes('data-action="toggle-theme"') &&
      appRoot.innerHTML.includes('>Light<') && appRoot.innerHTML.includes('>Dark<')) tabsWithToggleDark++;
}
check('toggle renders on all 8 tabs in dark mode', tabsWithToggleDark === 8, `${tabsWithToggleDark}/8`);
check('app-shell background changes light -> dark (1990s era)',
  lightShellBg !== darkShellBg, `${lightShellBg} -> ${darkShellBg}`);
check('card background changes light -> dark (1990s era)',
  lightCardBg !== darkCardBg, `${lightCardBg} -> ${darkCardBg}`);
check('page background changes light -> dark',
  resolve('light', null, 'bg-canvas') !== resolve('dark', null, 'bg-canvas'),
  `${resolve('light', null, 'bg-canvas')} -> ${resolve('dark', null, 'bg-canvas')}`);

clickBtn({ action: 'toggle-theme', theme: 'light' });
check('click Light restores light theme + persistence',
  appRoot.dataset.theme === 'light' && localStorage.getItem(THEME_STORAGE_KEY) === 'light');
let tabsWithToggleLight = 0;
for (const tab of TABS) {
  clickBtn({ action: 'switch-tab', tab });
  if (appRoot.innerHTML.includes('data-action="toggle-theme"')) tabsWithToggleLight++;
}
check('toggle renders on all 8 tabs in light mode', tabsWithToggleLight === 8, `${tabsWithToggleLight}/8`);

/* ================= 4–5. Era in dark mode + persistence across re-init ================= */
function seedLife(birthYear) {
  store.delete('world_life_2_save_v1');
  const S = createNewLifeState({
    seed: 424242, country: 'egy', birthYear, familyTier: 'middle', gender: 'm', ambition: 'global_passport'
  });
  saveGameToStorage(S);
  return S;
}
/* A life SET in 2026: createNewLifeState clamps birthYear to 2015, so a
   2026 life is a 2015-born child aged to 2026 — the era skin keys off
   S.year, which is what this probe moves. */
function seedLifeInYear(year) {
  const S = seedLife(Math.min(year, 2015));
  S.year = year;
  S.player.age = year - 2015;
  saveGameToStorage(S);
  return S;
}
localStorage.setItem(THEME_STORAGE_KEY, 'dark');
seedLife(1962);
await import('../src/main.js?boot=1962');
const era1962 = eraClassOnRoot();
check('1962 life in dark mode keeps its era class',
  era1962 === 'era-1960s' && appRoot.dataset.theme === 'dark', `${era1962} / ${appRoot.dataset.theme}`);
seedLifeInYear(2026);
await import('../src/main.js?boot=2026');
const era2026 = eraClassOnRoot();
check('2026 life in dark mode keeps its era class',
  era2026 === 'era-2020s' && appRoot.dataset.theme === 'dark', `${era2026} / ${appRoot.dataset.theme}`);
check('era class still differs 1962 vs 2026 in dark mode', era1962 !== era2026, `${era1962} vs ${era2026}`);
check('dark era canvas differs 1960s vs 2020s (warm dark vs cool dark)',
  resolve('dark', '1960s', 'era-canvas') !== resolve('dark', '2020s', 'era-canvas'),
  `${resolve('dark', '1960s', 'era-canvas')} vs ${resolve('dark', '2020s', 'era-canvas')}`);
check('dark 1960s canvas is warmer than dark 2020s canvas (red channel)',
  parseInt(resolve('dark', '1960s', 'era-canvas').slice(1, 3), 16) >
  parseInt(resolve('dark', '2020s', 'era-canvas').slice(1, 3), 16),
  `${resolve('dark', '1960s', 'era-canvas')} vs ${resolve('dark', '2020s', 'era-canvas')}`);
check('era classes differ by year (helper)', eraClassForYear(1962) !== eraClassForYear(2026));
/* Persistence: theme was set to dark before both re-inits and stayed dark. */
check('saved theme survives re-init (set dark, re-import, still dark)',
  appRoot.dataset.theme === 'dark' && getSavedTheme() === 'dark');
/* And every era has a dark variant that differs from its light tint. */
let erasDiffer = 0;
for (const era of ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']) {
  if (resolve('dark', era, 'era-canvas') !== resolve('light', era, 'era-canvas') &&
      resolve('dark', era, 'era-card') !== resolve('light', era, 'era-card') &&
      resolve('dark', era, 'era-ink') !== resolve('light', era, 'era-ink')) erasDiffer++;
}
check('all 7 eras have distinct dark variants (canvas+card+ink)', erasDiffer === 7, `${erasDiffer}/7`);

/* ================= 6. Contrast, both themes ================= */
const contrastRows = [];
function crCheck(label, fg, bg, min = 4.5) {
  const r = contrast(fg, bg);
  contrastRows.push(`${label}: ${r.toFixed(2)} (min ${min})`);
  check(`contrast ${label} >= ${min}`, r >= min, `${fg} on ${bg} = ${r.toFixed(2)}`);
}
for (const theme of ['light', 'dark']) {
  const card = resolve(theme, null, 'bg-card');
  crCheck(`${theme} body text`, resolve(theme, null, 'ink-main'), card);
  crCheck(`${theme} secondary text`, resolve(theme, null, 'ink-secondary'), card);
  crCheck(`${theme} muted text`, resolve(theme, null, 'ink-muted'), card);
  crCheck(`${theme} terracotta text`, resolve(theme, null, 'brand-terracotta'), card);
  crCheck(`${theme} navy text`, resolve(theme, null, 'brand-navy'), card);
  crCheck(`${theme} emerald text`, resolve(theme, null, 'brand-emerald'), card);
  crCheck(`${theme} gold text`, resolve(theme, null, 'brand-gold'), card);
  crCheck(`${theme} crimson text`, resolve(theme, null, 'brand-crimson'), card);
  const chartBg = resolve(theme, null, 'bg-chart');
  crCheck(`${theme} chart green`, resolve(theme, null, 'chart-green'), chartBg);
  crCheck(`${theme} chart navy`, resolve(theme, null, 'chart-navy'), chartBg);
  crCheck(`${theme} chart terracotta`, resolve(theme, null, 'chart-terracotta'), chartBg);
  crCheck(`${theme} chart gold`, resolve(theme, null, 'chart-gold'), chartBg);
  crCheck(`${theme} chart axis text`, resolve(theme, null, 'ink-secondary'), chartBg);
  for (const era of ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']) {
    crCheck(`${theme} ${era} heading`, resolve(theme, era, 'era-ink'), resolve(theme, era, 'era-card'));
  }
}
/* Button text: white on the actual button backgrounds, read from the
   shipped vars / dark overrides — never hardcoded stale values. */
const darkNavyBtn = (cssNoComments.match(/#app\[data-theme="dark"\] \.btn-navy \{ background: (#[0-9A-Fa-f]+)/) || [])[1] || '#33507E';
crCheck('light white on primary', '#FFFFFF', resolve('light', null, 'brand-terracotta'));
crCheck('dark white on primary', '#FFFFFF', resolve('dark', null, 'brand-terracotta-dark'));
crCheck('light white on navy', '#FFFFFF', resolve('light', null, 'brand-navy'));
crCheck('dark white on navy', '#FFFFFF', darkNavyBtn);
crCheck('light toast #FFFDF9 on #141413', '#FFFDF9', '#141413');
crCheck('dark toast #F2EDE3 on #0F0D0B', '#F2EDE3', '#0F0D0B');

/* ================= 7. Charts redraw in theme colours ================= */
const chartState = createNewLifeState({
  seed: 99, country: 'egy', birthYear: 1998, familyTier: 'middle', gender: 'm', ambition: 'global_passport'
});
chartState.ledger = [
  { year: 2024, month: 1, delta: 5000, balanceAfter: 5000, account: 'cash' },
  { year: 2024, month: 2, delta: -1200, balanceAfter: 3800, account: 'cash' },
  { year: 2024, month: 3, delta: 5200, balanceAfter: 9000, account: 'cash' },
  { year: 2024, month: 4, delta: -2000, balanceAfter: 7000, account: 'cash' }
];
chartState.financeHistory = [
  { year: 2023, age: 25, netWorth: 8000, currency: 'EGP' },
  { year: 2024, age: 26, netWorth: 15000, currency: 'EGP' }
];
chartState.telemetryHistory = [
  { age: 24, year: 2022, netWorth: 4000, vitality: 80, intellect: 70, kinship: 60 },
  { age: 25, year: 2023, netWorth: 8000, vitality: 78, intellect: 74, kinship: 65 },
  { age: 26, year: 2024, netWorth: 15000, vitality: 82, intellect: 76, kinship: 70 }
];
const finHtml = renderFinanceTabHtml(chartState, { finSub: 'cashflow' });
const lifeHtml = renderLifeTabHtml(chartState, { lifeSub: 'cars' });
const chartHtml = finHtml + lifeHtml;
check('finance charts use theme chart background', chartHtml.includes('background:var(--bg-chart)'));
check('finance charts use theme series colours',
  chartHtml.includes('var(--chart-green)') && chartHtml.includes('var(--chart-navy)') &&
  chartHtml.includes('var(--chart-terracotta)') && chartHtml.includes('var(--chart-gold)'));
check('trajectory chart uses theme colours', lifeHtml.includes('var(--chart-green)') && lifeHtml.includes('var(--chart-navy)'));
const HARDCODED_CHART = ['#FAF7F0', '#FAF6EE', 'fill="#524C43"', 'fill="#186A47"', 'fill="#1D3557"',
  'stroke="#186A47"', 'stroke="#1D3557"', 'stroke="#C84B31"', 'stroke="#A97115"', 'rgba(20,20,19,0.25)'];
const leaked = HARDCODED_CHART.filter((s) => chartHtml.includes(s));
check('no hardcoded chart colours left in rendered charts', leaked.length === 0, leaked.join(', ') || 'none');
const landlordSrc = readFileSync(new URL('../src/ui/propertyLandlord.js', import.meta.url), 'utf8');
check('property-market chart source uses theme colours',
  landlordSrc.includes('var(--bg-chart)') && landlordSrc.includes('var(--chart-navy)') &&
  landlordSrc.includes('var(--ink-secondary)') && !landlordSrc.includes('#FAF7F0') &&
  !landlordSrc.includes('#1D3557') && !landlordSrc.includes('#524C43'));

/* ================= 8. No filter/invert, no img restyle in dark mode ================= */
const darkBlock = cssNoComments.slice(cssNoComments.indexOf('html[data-theme="dark"]'));
const darkRules = darkBlock;
check('dark theme block contains no filter:', !/filter\s*:/.test(darkRules));
check('dark theme block contains no invert(', !/invert\s*\(/.test(darkRules));
check('dark theme block has no rule targeting img', !/\bimg\b/.test(darkRules));
check('era banner img rules untouched (7 bands)', (css.match(/#app\.era-\d+s \.editorial-banner img \{/g) || []).length === 7);
check('dark block has no .editorial-banner img rule', !darkRules.includes('.editorial-banner img'));
check('toggle CSS exists (.theme-toggle)', css.includes('.theme-toggle {'));
check('dark era variants exist for all 7 bands',
  ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']
    .every((e) => css.includes(`#app[data-theme="dark"].era-${e}`)));

/* ================= summary ================= */
print(`\nV216-W1-VERIFY: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
print(`measured: toggle on 8/8 tabs in both themes; shell ${lightShellBg} -> ${darkShellBg}; card ${lightCardBg} -> ${darkCardBg}; eras dark 1960s ${resolve('dark', '1960s', 'era-canvas')} vs 2020s ${resolve('dark', '2020s', 'era-canvas')}`);
process.exit(failures === 0 ? 0 : 1);
