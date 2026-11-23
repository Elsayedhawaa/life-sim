#!/usr/bin/env node
/* v2.16 Coordinator verify — light/dark toggle + achievements that can be earned.
 * Independent checks (node, no browser). The worker probes stand as the deep
 * proof and are re-run separately:
 *   tests/v216-w1-verify.mjs  (theme mechanics, 80 checks)
 *   tests/v216-w2-achievements.mjs (earnability, 87 checks)
 *   tests/v216-w3-contrast.mjs (contrast, both themes, all 8 screens)
 * This script checks, on the merged tree:
 *  1. Toggle renders on the main page (header) labelled Light/Dark.
 *  2. Toggle renders on the new-life modal, reading the theme store (no life needed).
 *  3. Theme helpers: default light, garbage -> light, save round-trips.
 *  4. Era skin still differs 1962 vs 2026 (era class), and the CSS has dark
 *     variants for all 7 eras; the dark block uses no filter/invert and no img rule.
 *  5. Achievements: table is 30, the 5 once-ungrantable ids are present and each
 *     grants from real constructed state (and does NOT grant without it).
 *  6. A newborn earns nothing. The progress panel shows an earned achievement
 *     with its date and names the next milestone.
 *  7. Renders do not write (v2.13 lesson): rendering the Life tab changes
 *     neither S.seq nor the journal length.
 */
import { readFileSync } from 'node:fs';

// Fake localStorage BEFORE any game import (views.js reads it in helpers only).
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: (k) => store.delete(k),
};

const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { evaluateProgress, getProgress } = await import('../src/systems/progressEngine.js');
const { V1_ACHIEVEMENTS } = await import('../src/data/megaCareerEduMedical.js');
const {
  renderHudHtml, renderLifeTabHtml, renderNewLifeModalHtml, eraClassForYear,
  getSavedTheme, saveTheme, THEME_STORAGE_KEY,
} = await import('../src/ui/views.js');

const print = (...a) => console.log(...a);
let failures = 0;
let total = 0;
function check(name, ok, detail = '') {
  total++;
  print(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) failures++;
}
function freshLife() {
  const S = createNewLifeState({ seed: 4242, country: 'egy', birthYear: 1998, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  return S;
}
function earned(S, id) {
  return (getProgress(S).earned || []).some((a) => a.id === id);
}

/* ---------- 1. Toggle on the main page ---------- */
{
  const S = freshLife();
  const hud = renderHudHtml(S);
  check('1a header toggle has Light label', />Light</.test(hud));
  check('1b header toggle has Dark label', />Dark</.test(hud));
  check('1c header toggle carries data-action="toggle-theme"', /data-action="toggle-theme"/.test(hud));
  check('1d header toggle has both data-theme values', /data-theme="light"/.test(hud) && /data-theme="dark"/.test(hud));
}

/* ---------- 2. Toggle on the new-life modal ---------- */
{
  const modal = renderNewLifeModalHtml({});
  check('2a modal has Light label', />Light</.test(modal));
  check('2b modal has Dark label', />Dark</.test(modal));
  check('2c modal toggle carries data-action="toggle-theme"', /data-action="toggle-theme"/.test(modal));
  check('2d modal still renders its life choices', /country|birth|gender/i.test(modal));
}

/* ---------- 3. Theme helpers ---------- */
{
  store.clear();
  check('3a empty store defaults to light', getSavedTheme() === 'light');
  saveTheme('dark');
  check('3b save dark round-trips', getSavedTheme() === 'dark' && store.get(THEME_STORAGE_KEY) === 'dark');
  saveTheme('garbage-value');
  check('3c garbage value falls back to light (never dark by surprise)', getSavedTheme() === 'light');
  saveTheme('light');
  check('3d save light round-trips', getSavedTheme() === 'light');
}

/* ---------- 4. Era skin + dark CSS ---------- */
{
  check('4a era class 1962 is era-1960s', eraClassForYear(1962) === 'era-1960s', eraClassForYear(1962));
  check('4b era class 2026 is era-2020s', eraClassForYear(2026) === 'era-2020s', eraClassForYear(2026));
  check('4c era class differs 1962 vs 2026', eraClassForYear(1962) !== eraClassForYear(2026));
  const css = readFileSync(new URL('../styles/main.css', import.meta.url), 'utf8');
  check('4d CSS has a dark-theme block', css.includes('#app[data-theme="dark"]'));
  const darkEras = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']
    .filter((e) => css.includes(`#app[data-theme="dark"].era-${e}`));
  check('4e all 7 eras have dark variants', darkEras.length === 7, `${darkEras.length}/7`);
  // No filter/invert and no img selector inside any rule whose selector mentions data-theme="dark".
  // (Comments are stripped first — the dark block's own header comment mentions img.)
  const cssNoComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const darkRules = cssNoComments.split('}').filter((r) => r.includes('data-theme="dark"'));
  const badFilter = darkRules.filter((r) => /filter\s*:|invert\(/.test(r));
  const badImg = darkRules.filter((r) => /(^|[\s,>+~])img[\s.{:#[]/.test(r.split('{')[0] || ''));
  check('4f dark block uses no filter/invert', badFilter.length === 0, badFilter.length ? badFilter[0].slice(0, 80) : '');
  check('4g dark block touches no img', badImg.length === 0, badImg.length ? badImg[0].slice(0, 80) : '');
}

/* ---------- 5. Achievements: 30, the 5 wired ---------- */
{
  check('5a achievements table is 30', V1_ACHIEVEMENTS.length === 30, String(V1_ACHIEVEMENTS.length));
  for (const id of ['returned_home', 'ten_countries', 'helped_family', 'survived_recession', 'returned_visit']) {
    check(`5b table still lists ${id}`, V1_ACHIEVEMENTS.some((a) => a.id === id));
  }
  // returned_home: lived abroad, then back home.
  {
    const S = freshLife();
    evaluateProgress(S); // initialises S.progress (ensureProgress)
    S.progress._livedAbroad = false; S.country = S.homeCountry;
    evaluateProgress(S);
    check('5c returned_home does NOT grant without living abroad', !earned(S, 'returned_home'));
    S.progress._livedAbroad = true;
    evaluateProgress(S);
    check('5d returned_home grants after living abroad and coming home', earned(S, 'returned_home'));
  }
  // ten_countries: 9 vs 10.
  {
    const S = freshLife();
    evaluateProgress(S); // initialises S.progress (ensureProgress)
    S.progress._visitedCountries = ['egy', 'usa', 'gbr', 'fra', 'deu', 'ita', 'esp', 'tur', 'sau'];
    evaluateProgress(S);
    check('5e ten_countries does NOT grant at 9', !earned(S, 'ten_countries'));
    S.progress._visitedCountries.push('are');
    evaluateProgress(S);
    check('5f ten_countries grants at 10', earned(S, 'ten_countries'));
  }
  // helped_family: 499,999 vs 500,000 EGP.
  {
    const S = freshLife();
    S.money.remittedHomeEgpTotal = 499999;
    evaluateProgress(S);
    check('5g helped_family does NOT grant at 499,999 EGP', !earned(S, 'helped_family'));
    S.money.remittedHomeEgpTotal = 500000;
    evaluateProgress(S);
    check('5h helped_family grants at 500,000 EGP', earned(S, 'helped_family'));
  }
  // returned_visit: flag from the ledger scan.
  {
    const S = freshLife();
    evaluateProgress(S); // initialises S.progress (ensureProgress)
    check('5i returned_visit does NOT grant without a visit home from abroad', !earned(S, 'returned_visit'));
    S.progress._visitedHomeWhileAbroad = true;
    evaluateProgress(S);
    check('5j returned_visit grants after a visit home from abroad', earned(S, 'returned_visit'));
  }
  // survived_recession: 2008 crisis in Egypt, ended Jun 2010; player employed
  // since before it started (tenure path) -> grant; job started after -> no grant.
  {
    const crisis = { eventId: 'crisis_2008_test', businessRevenue: 0.75, startYear: 2008, startMonth: 9, endYear: 2010, endMonth: 6 };
    const S = freshLife();
    S.year = 2011; S.month = 1; S.country = 'egy';
    S.worldEvents = S.worldEvents || { fired: {}, history: [] };
    S.worldEvents.history = [crisis];
    S.career.job = { employer: 'Nile Air', title: 'Cadet Pilot', track: 'aviation', level: 0, monthlyGross: 9461, startYear: 2007, monthsInRole: 48, performance: 72, workMode: 'full-time', bossId: null };
    evaluateProgress(S);
    check('5k survived_recession grants when employed through the crisis (tenure path)', earned(S, 'survived_recession'));
    const S2 = freshLife();
    S2.year = 2011; S2.month = 1; S2.country = 'egy';
    S2.worldEvents = S2.worldEvents || { fired: {}, history: [] };
    S2.worldEvents.history = [{ ...crisis }];
    S2.career.job = { employer: 'Nile Air', title: 'Cadet Pilot', track: 'aviation', level: 0, monthlyGross: 9461, startYear: 2010, monthsInRole: 6, performance: 72, workMode: 'full-time', bossId: null };
    evaluateProgress(S2);
    check('5l survived_recession does NOT grant for a job started after the crisis', !earned(S2, 'survived_recession'));
  }
}

/* ---------- 6. Newborn earns nothing; panel shows earned + next ---------- */
{
  const S = freshLife();
  evaluateProgress(S);
  check('6a a newborn earns nothing', getProgress(S).earned.length === 0, `${getProgress(S).earned.length} earned`);
  S.career.job = { employer: 'Nile Air', title: 'Cadet Pilot', track: 'aviation', level: 0, monthlyGross: 9461, startYear: 2026, monthsInRole: 1, performance: 72, workMode: 'full-time', bossId: null };
  evaluateProgress(S);
  check('6b first_job grants with a job', earned(S, 'first_job'));
  const life = renderLifeTabHtml(S, {});
  check('6c panel shows the earned achievement with its date', /First Job — \w+ \d{4}/.test(life), (life.match(/First Job[^\n<]{0,40}/) || ['?'])[0]);
  check('6d panel names the next milestone', /Next milestone:/.test(life));
  check('6e panel shows the level', /Level \d+/.test(life));
}

/* ---------- 7. Renders do not write ---------- */
{
  const S = freshLife();
  const seqBefore = S.seq;
  const journalBefore = (S.journal || []).length;
  renderLifeTabHtml(S, {});
  renderHudHtml(S);
  check('7a rendering the Life tab does not consume S.seq', S.seq === seqBefore, `${seqBefore} -> ${S.seq}`);
  check('7b rendering does not add journal lines', (S.journal || []).length === journalBefore, `${journalBefore} -> ${(S.journal || []).length}`);
}

print(`\nRESULT: ${total - failures} passed, ${failures} failed (of ${total})`);
if (failures > 0) process.exit(1);
