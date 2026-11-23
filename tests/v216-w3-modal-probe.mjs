// v2.16 Worker 3 — probe: the new-life modal shows the Light/Dark
// control and marks the current theme active, before any life exists.
//
// The modal reads the theme from the theme store only
// (getSavedTheme(): localStorage key 'world_life_2_theme', default
// light) — never from a save, because no life may exist yet. The
// probe stubs localStorage, renders renderNewLifeModalHtml, and checks
// which segment carries the `active` class / aria-pressed="true":
//   1. store = dark  -> Dark active, Light inactive
//   2. store = light -> Light active, Dark inactive
//   3. store empty (new player) -> Light active (default light)
//   4. store = garbage -> Light active (never dark by surprise)
//   5. the control is the SAME control as the header: both segments
//      carry data-action="toggle-theme" and data-theme="light|dark"
//      (the handler in main.js:440 reads btn.dataset.theme).
//
// Usage: node tests/v216-w3-modal-probe.mjs — exit 0 iff all pass.

import { renderNewLifeModalHtml } from '../src/ui/views.js';

let failures = 0;
function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

// Minimal localStorage stub whose stored value the probe controls.
function setStore(value) {
  globalThis.localStorage = {
    _v: value,
    getItem() { return this._v; },
    setItem(_, v) { this._v = v; },
    removeItem() { this._v = null; },
  };
}

function segments(html) {
  const light = html.match(/<button[^>]*data-theme="light"[^>]*>/);
  const dark = html.match(/<button[^>]*data-theme="dark"[^>]*>/);
  const active = (m) => !!m && /\bactive\b/.test(m[0]) && /aria-pressed="true"/.test(m[0]);
  const inactive = (m) => !!m && !/\bactive\b/.test(m[0]) && /aria-pressed="false"/.test(m[0]);
  return { light, dark, lightActive: active(light), darkActive: active(dark), lightInactive: inactive(light), darkInactive: inactive(dark) };
}

for (const [stored, wantDark] of [['dark', true], ['light', false], [null, false], ['banana', false]]) {
  setStore(stored);
  const html = renderNewLifeModalHtml({ country: 'egy', birthYear: 1998, gender: 'm' });
  const s = segments(html);
  const label = stored === null ? 'empty store (new player)' : `store=${JSON.stringify(stored)}`;
  check(`modal renders theme toggle (${label})`, !!s.light && !!s.dark, 'both Light and Dark segments present');
  check(`modal marks ${wantDark ? 'Dark' : 'Light'} active (${label})`,
    wantDark ? (s.darkActive && s.lightInactive) : (s.lightActive && s.darkInactive));
}

// Same control as the header: data-action + data-theme on both sides.
setStore('dark');
{
  const html = renderNewLifeModalHtml({ country: 'egy', birthYear: 1998, gender: 'm' });
  const actions = [...html.matchAll(/data-action="toggle-theme"/g)].length;
  check('modal toggle uses data-action="toggle-theme" on both segments', actions === 2, `found ${actions}`);
  check('modal toggle lives inside the new-life modal', html.includes('id="new-life-modal"'));
  check('modal still renders its life choices', html.includes('Begin a New Life') && html.includes('Start This Life'));
}

// No localStorage at all (bare node, no stub) -> light, no crash.
delete globalThis.localStorage;
{
  let html = '';
  let threw = null;
  try { html = renderNewLifeModalHtml({ country: 'egy', birthYear: 1998, gender: 'm' }); } catch (e) { threw = e; }
  const s = segments(html);
  check('modal renders with no localStorage (default light)', !threw && s.lightActive && s.darkInactive, threw ? String(threw) : '');
}

console.log(failures === 0 ? 'MODAL PROBE PASS' : `MODAL PROBE FAIL — ${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
