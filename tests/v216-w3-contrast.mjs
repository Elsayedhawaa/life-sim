// v2.16 Worker 3 — text-contrast proof for the light/dark themes.
//
// Measures WCAG contrast ratios from the ACTUAL CSS custom-property
// values in styles/main.css (light :root, dark #app[data-theme="dark"],
// and the era bands #app.era-XXXX in both themes), applied to the real
// rendered text colours on the main screens:
//   Timeline, People, Career, Finance, Real Estate, Lifestyle,
//   Passport, Education
// (all eight share the same design system, so each screen is checked
// against the pairs its markup actually uses; Timeline additionally
// checks the scene card, the lock-reason chip, the progress-panel XP
// bar and the new-life modal controls; Passport checks the document
// stamps; every screen checks the nav tabs and the header theme
// toggle.)
//
// Where W1's dark theme overrides a light value with a different
// rendered colour (primary/navy button backgrounds, form-field
// backgrounds, the active subtab-pill text, the scene-card gradient,
// the lock-reason chip, the document stamps, the toast), the pair
// carries that override as fgDark/bgDark so the DARK measurement uses
// the colour the player actually sees, not the light one.
//
// Thresholds (named, never weakened):
//   BODY_TEXT_MIN   = 4.5:1 — WCAG AA for normal/small text
//   BUTTON_TEXT_MIN = 3:1   — WCAG AA for button text and large text
//   UI_MIN          = 3:1   — WCAG non-text contrast for UI components
//                             (the progress-panel XP bar fill vs its card)
//
// Usage: node tests/v216-w3-contrast.mjs
// Exit 0 only when every pair passes in BOTH themes (light + dark) on
// every screen in the 1960s and 2020s era bands (all seven bands are
// also measured and the worst band per pair is reported). Exit 1 when
// anything fails — or when the dark-theme variables are absent from
// styles/main.css (W1 owns the dark theme CSS; without it the dark
// side cannot be measured and the proof cannot pass).
//
// If a pair fails, the fix is a CSS *variable value* in styles/main.css
// (W3 may edit only specific failing variable values; the theme CSS
// structure and the era band definitions belong to W1). Re-run until
// it passes; never lower the thresholds above.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const CSS_PATH = join(HERE, '..', 'styles', 'main.css');
const css = readFileSync(CSS_PATH, 'utf8');

const BODY_TEXT_MIN = 4.5; // WCAG AA, normal/small text
const BUTTON_TEXT_MIN = 3.0; // WCAG AA, button text and large text
const UI_MIN = 3.0; // WCAG non-text contrast, UI components (XP bar)

const ERAS = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const HEADLINE_ERAS = ['1960s', '2020s']; // spec: at least these two bands
const SCREENS = ['Timeline', 'People', 'Career', 'Finance', 'Real Estate', 'Lifestyle', 'Passport', 'Education'];

// ---------------------------------------------------------------- parsing
function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\//g, '');
}

function parseDecls(block) {
  const out = {};
  for (const part of block.split(';')) {
    const m = part.match(/^\s*(--[\w-]+)\s*:\s*(.+?)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const clean = stripComments(css);

function firstBlock(re) {
  const m = clean.match(re);
  return m ? parseDecls(m[1]) : {};
}

// Light base: :root. Dark base: #app[data-theme="dark"] (W1 contract).
const lightBase = firstBlock(/:root\s*\{([^}]*)\}/);
const darkBase = firstBlock(/#app\[data-theme=["']?dark["']?\]\s*\{([^}]*)\}/);

// Era bands, light and dark. Only the variable-definition rules count:
// `#app.era-XXXX { --era-* ... }` and
// `#app[data-theme="dark"].era-XXXX { --era-* ... }` (either attribute
// order). Descendant rules such as `#app.era-1960s .card { ... }` must
// NOT match — they carry no --era-* vars and would overwrite the real
// band values with an empty map.
const eraLight = {};
const eraDark = {};
for (const m of clean.matchAll(/#app(?:\[data-theme=["']?dark["']?\])?\.era-(\d{4}s)(?:\[data-theme=["']?dark["']?\])?\s*\{([^}]*)\}/g)) {
  const isDark = /data-theme\s*=\s*["']?dark/.test(m[0]);
  (isDark ? eraDark : eraLight)[m[1]] = parseDecls(m[2]);
}

// Effective variable map for (theme, era): base overlaid with era vars.
function effectiveVars(theme, era) {
  const base = theme === 'dark' ? { ...lightBase, ...darkBase } : { ...lightBase };
  const eraVars = theme === 'dark'
    ? { ...(eraLight[era] || {}), ...(eraDark[era] || {}) }
    : { ...(eraLight[era] || {}) };
  return { ...base, ...eraVars };
}

// Resolve a raw declaration value: follow var(--x) / var(--x, fallback)
// chains against a var map; literals pass through unchanged.
function resolve(value, vars, depth = 0) {
  if (value == null || depth > 8) return value;
  const m = String(value).trim().match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (!m) return String(value).trim();
  if (Object.prototype.hasOwnProperty.call(vars, m[1])) return resolve(vars[m[1]], vars, depth + 1);
  return m[2] ? resolve(m[2], vars, depth + 1) : null;
}

// Look a '--var' up in a var map and resolve it to a literal colour.
function lookupVar(name, vars) {
  if (!Object.prototype.hasOwnProperty.call(vars, name)) return null;
  return resolve(vars[name], vars);
}

// ---------------------------------------------------------------- colour math
function parseColor(value, overBg) {
  if (value == null) return null;
  const s = String(value).trim();
  let m = s.match(/^#([0-9a-fA-F]{3})$/);
  if (m) {
    const [r, g, b] = [...m[1]].map((c) => parseInt(c + c, 16));
    return [r, g, b];
  }
  m = s.match(/^#([0-9a-fA-F]{6})$/);
  if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/);
  if (m) {
    const a = m[4] == null ? 1 : Number(m[4]);
    if (a >= 1) return [Number(m[1]), Number(m[2]), Number(m[3])];
    if (!overBg) return null; // translucent with nothing to composite over
    return [0, 1, 2].map((i) => Math.round(Number(m[i + 1]) * a + overBg[i] * (1 - a)));
  }
  return null;
}

function luminance([r, g, b]) {
  const f = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// ---------------------------------------------------------------- pairs
// fg/bg are a literal colour (#FFF, #FDF3F2, rgba(...)) or a var name
// ('--ink-main'). fgDark/bgDark override the pair in the dark theme
// (W1 dark overrides — the rendered colour differs from the light one).
// bgOver names the var the background is painted over when bg is a
// translucent rgba() (default '--bg-card'; the doc stamps sit on a
// document whose dark background is '--bg-subtle').
// `min` is the threshold; `kind` names why. `screens` lists the screens
// whose markup actually renders the pair. Era pairs are evaluated per
// era band; the rest per theme (the era card/canvas variants are
// separate pairs so the tint is measured too).
const PAIRS = [
  // -- body / small text (4.5:1) -------------------------------------------
  { name: 'body text on card', fg: '--ink-main', bg: '--bg-card', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS },
  { name: 'body text on era card', fg: '--ink-main', bg: '--era-card', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS, era: true },
  { name: 'body text on canvas', fg: '--ink-main', bg: '--bg-canvas', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS },
  { name: 'body text on era canvas', fg: '--ink-main', bg: '--era-canvas', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS, era: true },
  { name: 'secondary text on card', fg: '--ink-secondary', bg: '--bg-card', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS },
  { name: 'secondary text on era card', fg: '--ink-secondary', bg: '--era-card', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS, era: true },
  { name: 'muted text on card', fg: '--ink-muted', bg: '--bg-card', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS },
  { name: 'muted text on era card', fg: '--ink-muted', bg: '--era-card', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS, era: true },
  { name: 'muted text on canvas', fg: '--ink-muted', bg: '--bg-canvas', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS },
  { name: 'muted text on era canvas', fg: '--ink-muted', bg: '--era-canvas', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS, era: true },
  { name: 'section heading (era ink) on era card', fg: '--era-ink', bg: '--era-card', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS, era: true },
  { name: 'section heading (era ink) on era canvas', fg: '--era-ink', bg: '--era-canvas', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS, era: true },
  { name: 'money good (emerald) on card', fg: '--brand-emerald', bg: '--bg-card', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline', 'Finance', 'Career', 'Real Estate'] },
  { name: 'money good (emerald) on era card', fg: '--brand-emerald', bg: '--era-card', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline', 'Finance', 'Career', 'Real Estate'], era: true },
  { name: 'money bad (crimson) on card', fg: '--brand-crimson', bg: '--bg-card', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline', 'Finance', 'Career', 'Real Estate'] },
  { name: 'money bad (crimson) on era card', fg: '--brand-crimson', bg: '--era-card', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline', 'Finance', 'Career', 'Real Estate'], era: true },
  { name: 'notice gold on card', fg: '--brand-gold', bg: '--bg-card', min: BODY_TEXT_MIN, kind: 'body', screens: ['Career', 'Education'] },
  { name: 'notice gold on era card', fg: '--brand-gold', bg: '--era-card', min: BODY_TEXT_MIN, kind: 'body', screens: ['Career', 'Education'], era: true },
  { name: 'gold pill text on subtle', fg: '--brand-gold', bg: '--bg-subtle', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline'] },
  { name: 'scene kicker (terracotta) on scene card', fg: '--brand-terracotta', bg: '#FAF3E6', bgDark: '#26221D', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline'] },
  // v2.16 coordinator merge fix: the dark override at main.css:1424 sets
  // color: var(--ink-secondary) on the chip, so the dark fg is secondary ink.
  { name: 'lock-reason text (muted) on pink chip', fg: '--ink-muted', fgDark: '--ink-secondary', bg: '#FDF3F2', bgDark: 'rgba(232, 103, 90, 0.14)', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline', 'Career', 'Real Estate', 'Finance', 'Lifestyle'] },
  { name: 'lock-reason text (muted) on chip over era card', fg: '--ink-muted', fgDark: '--ink-secondary', bg: '#FDF3F2', bgDark: 'rgba(232, 103, 90, 0.14)', bgOver: '--era-card', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline', 'Career', 'Real Estate', 'Finance', 'Lifestyle'], era: true },
  { name: 'form label (secondary) on card', fg: '--ink-secondary', bg: '--bg-card', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline'] },
  { name: 'form input text on field', fg: '--ink-main', bg: '#FFFFFF', bgDark: '--bg-canvas', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline'] },
  { name: 'HUD pill text on subtle', fg: '--ink-main', bg: '--bg-subtle', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS },
  { name: 'toast text on toast bg', fg: '#FFFDF9', bg: '--ink-main', fgDark: '--ink-main', bgDark: '#0F0D0B', min: BODY_TEXT_MIN, kind: 'body', screens: SCREENS },
  { name: 'banner caption text on caption bg', fg: '--ink-main', bg: 'rgba(247, 239, 220, 0.94)', bgOver: '--era-canvas', bgDark: 'rgba(38, 34, 29, 0.92)', min: BODY_TEXT_MIN, kind: 'body', screens: ['Timeline'], era: true },
  // v2.16 coordinator merge fix: the dark overrides at main.css:1429/1431 set
  // the stamp text colours explicitly (#6FCB9A / #F08A7D), so the dark fgs
  // are those literals, not the dark --brand-emerald/--brand-crimson vars.
  { name: 'doc stamp good (emerald) on stamp bg', fg: '--brand-emerald', fgDark: '#6FCB9A', bg: '#EAF6F0', bgDark: 'rgba(87, 185, 138, 0.14)', bgOver: '--bg-subtle', min: BODY_TEXT_MIN, kind: 'body', screens: ['Passport'] },
  { name: 'doc stamp warn (gold) on stamp bg', fg: '--brand-gold', bg: '#FEF7E6', bgDark: 'rgba(217, 164, 65, 0.14)', bgOver: '--bg-subtle', min: BODY_TEXT_MIN, kind: 'body', screens: ['Passport'] },
  { name: 'doc stamp bad (crimson) on stamp bg', fg: '--brand-crimson', fgDark: '#F08A7D', bg: '#FDECEB', bgDark: 'rgba(232, 103, 90, 0.14)', bgOver: '--bg-subtle', min: BODY_TEXT_MIN, kind: 'body', screens: ['Passport'] },
  // -- button text (3:1) ---------------------------------------------------
  { name: 'primary button (white on terracotta)', fg: '#FFFFFF', bg: '--brand-terracotta', bgDark: '--brand-terracotta-dark', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  { name: 'primary button hover (white on terracotta-dark)', fg: '#FFFFFF', bg: '--brand-terracotta-dark', bgDark: '#8E2F1B', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  { name: 'advance button (white on terracotta)', fg: '#FFFFFF', bg: '--brand-terracotta', bgDark: '--brand-terracotta-dark', min: BUTTON_TEXT_MIN, kind: 'button', screens: ['Timeline'] },
  { name: 'navy button (white on navy)', fg: '#FFFFFF', bg: '--brand-navy', bgDark: '#33507E', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  { name: 'navy button hover (white on dark navy)', fg: '#FFFFFF', bg: '#152842', bgDark: '#243D61', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  { name: 'default button (ink on card)', fg: '--ink-main', bg: '--bg-card', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  { name: 'default button on era card (ink on era card)', fg: '--ink-main', bg: '--era-card', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS, era: true },
  { name: 'nav tab inactive (secondary on card)', fg: '--ink-secondary', bg: '--bg-card', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  { name: 'nav tab ACTIVE (pale on ink)', fg: '#FFFEFA', bg: '--ink-main', bgDark: '--brand-terracotta-dark', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  { name: 'subtab inactive (secondary on subtle bar)', fg: '--ink-secondary', bg: '--bg-subtle', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  // v2.16 coordinator merge fix: the era active-pill rule (main.css:1266) sets
  // color: #FFFFFF in BOTH themes; in dark mode the later rule at main.css:1366
  // (#app[data-theme="dark"] .subtab-pill.active, same (1,3,0) specificity,
  // later in the file) wins the tie and sets #171512. Light fg is white.
  { name: 'subtab ACTIVE (ink on era accent)', fg: '#FFFFFF', bg: '--era-accent', fgDark: '#171512', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS, era: true },
  { name: 'theme toggle active (card on ink)', fg: '--bg-card', bg: '--ink-main', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  { name: 'theme toggle inactive (secondary on subtle)', fg: '--ink-secondary', bg: '--bg-subtle', min: BUTTON_TEXT_MIN, kind: 'button', screens: SCREENS },
  // -- non-text UI (3:1) ----------------------------------------------------
  { name: 'XP bar fill (emerald) on card', fg: '--brand-emerald', bg: '--bg-card', min: UI_MIN, kind: 'ui', screens: ['Timeline'] },
  { name: 'XP bar fill (emerald) on era card', fg: '--brand-emerald', bg: '--era-card', min: UI_MIN, kind: 'ui', screens: ['Timeline'], era: true },
];

// Resolve one side of a pair to an [r,g,b] triple for (theme, vars).
// `spec` is a literal or a '--var'; `underlayRgb` is what a translucent
// rgba() is painted over (the bg side when resolving the fg, the bgOver
// var when resolving a translucent bg).
function resolveSide(spec, vars, underlayRgb) {
  const raw = spec.startsWith('--') ? lookupVar(spec, vars) : spec;
  if (raw == null) return { raw: null, rgb: null };
  return { raw, rgb: parseColor(raw, underlayRgb) };
}

// ---------------------------------------------------------------- measure
const results = []; // {theme, era, screen, pair, ratio, min, pass, fgRaw, bgRaw}
const missing = [];
if (Object.keys(darkBase).length === 0) {
  missing.push('dark theme: no #app[data-theme="dark"] block in styles/main.css (W1 owns the dark theme CSS — not landed in this copy yet)');
}
for (const era of HEADLINE_ERAS) {
  if (Object.keys(eraDark[era] || {}).length === 0) {
    missing.push(`dark theme: no dark-era vars for the ${era} band (#app[data-theme="dark"].era-${era})`);
  }
}
if (Object.keys(lightBase).length === 0) missing.push('light theme: no :root block found');
for (const era of HEADLINE_ERAS) {
  if (Object.keys(eraLight[era] || {}).length === 0) missing.push(`light theme: no era vars for the ${era} band`);
}

for (const theme of ['light', 'dark']) {
  if (theme === 'dark' && Object.keys(darkBase).length === 0) continue;
  for (const era of ERAS) {
    const vars = effectiveVars(theme, era);
    for (const pair of PAIRS) {
      const fgSpec = theme === 'dark' && pair.fgDark ? pair.fgDark : pair.fg;
      const bgSpec = theme === 'dark' && pair.bgDark ? pair.bgDark : pair.bg;
      // Background first: a translucent bg needs its underlay.
      let bgUnderlay = null;
      if (pair.bgOver) {
        const overRaw = lookupVar(pair.bgOver, vars);
        bgUnderlay = parseColor(overRaw, null);
      } else {
        const cardRaw = lookupVar('--bg-card', vars);
        bgUnderlay = parseColor(cardRaw, null);
      }
      const bg = resolveSide(bgSpec, vars, bgUnderlay);
      if (!bg.rgb) continue; // background var undefined for this theme/era
      const fg = resolveSide(fgSpec, vars, bg.rgb);
      if (!fg.rgb) continue;
      const ratio = contrast(fg.rgb, bg.rgb);
      const show = (spec, side) => (spec.startsWith('--') ? `${spec}=${side.raw}` : side.raw);
      results.push({
        theme, era, pair: pair.name, min: pair.min, kind: pair.kind,
        screens: pair.screens, ratio, pass: ratio >= pair.min,
        fg: show(fgSpec, fg), bg: show(bgSpec, bg),
      });
    }
  }
}

// ---------------------------------------------------------------- report
const fmt = (n) => `${n.toFixed(2)}:1`;
let failures = 0;

console.log('v2.16 W3 contrast proof — styles/main.css');
console.log(`thresholds: body/small text >= ${BODY_TEXT_MIN}:1 (WCAG AA), button/large text >= ${BUTTON_TEXT_MIN}:1, UI components >= ${UI_MIN}:1`);
console.log(`dark base vars present: ${Object.keys(darkBase).length > 0} (${Object.keys(darkBase).length} vars)`);
console.log(`dark era vars present: ${ERAS.filter((e) => Object.keys(eraDark[e] || {}).length > 0).join(', ') || 'none'}`);
console.log('');

for (const theme of ['light', 'dark']) {
  for (const era of HEADLINE_ERAS) {
    for (const screen of SCREENS) {
      const rows = results.filter((r) => r.theme === theme && r.era === era && r.screens.includes(screen));
      if (rows.length === 0) {
        console.log(`${theme} ${era} ${screen}: NOT MEASURED (theme/era vars missing)`);
        failures++;
        continue;
      }
      const bad = rows.filter((r) => !r.pass);
      const worst = rows.reduce((a, b) => (a.ratio < b.ratio ? a : b));
      const status = bad.length === 0 ? 'PASS' : 'FAIL';
      if (bad.length > 0) failures += bad.length;
      console.log(`${theme} ${era} ${screen}: ${status} — ${rows.length} pairs, worst ${fmt(worst.ratio)} (${worst.pair}, needs >= ${worst.min}:1)`);
      for (const b of bad) {
        console.log(`    FAIL ${fmt(b.ratio)} < ${b.min}:1 — ${b.pair} [${b.fg} on ${b.bg}]`);
      }
    }
  }
}

console.log('');
console.log('--- worst band per pair (all 7 eras, both themes) ---');
const byPair = {};
for (const r of results) {
  const key = `${r.theme} :: ${r.pair}`;
  if (!byPair[key] || r.ratio < byPair[key].ratio) byPair[key] = r;
}
for (const key of Object.keys(byPair).sort()) {
  const r = byPair[key];
  console.log(`${r.pass ? 'PASS' : 'FAIL'} ${fmt(r.ratio)} (min ${r.min}:1) ${key} — worst in ${r.era} [${r.fg} on ${r.bg}]`);
}

if (missing.length > 0) {
  console.log('');
  console.log('--- MISSING (cannot measure) ---');
  for (const m of missing) console.log(`MISSING: ${m}`);
}

const failCount = results.filter((r) => !r.pass).length;
console.log('');
if (missing.length > 0 || failCount > 0) {
  console.log(`CONTRAST ${failCount > 0 ? `FAIL — ${failCount} pair(s) below threshold` : 'INCOMPLETE'}${missing.length > 0 ? ` — ${missing.length} missing theme block(s)` : ''}`);
  process.exit(1);
}
console.log('CONTRAST PASS — every pair passes in both themes on all 8 screens (1960s + 2020s bands, worst band checked across all 7 eras)');
