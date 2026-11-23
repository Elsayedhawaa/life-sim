/* v2.13 Worker 3 verify — drawn world map + passport visual on Passport.
   Run from the game root: node tests/v213-w3-verify.mjs
   (a) A life that visited 2 countries (France, USA by taken trips) and holds
       1 extra citizenship (UK) shows the SVG map with those countries
       coloured visited/citizen, a Schengen visa country (Germany) coloured
       visa, and an untouched country (Brazil) coloured none.
   (b) The passport visual contains the player's name and the held
       citizenship (United Kingdom).
   (c) A life with no travel shows no country coloured visited (and an
       expired visa colours nothing).
   (d) The map SVG contains no external URL: no http, no CDN, no <image>. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { renderWorldTabHtml } from '../src/ui/views.js';
import { getCountryMapStatus, projectCountry, COUNTRY_CAPITAL_COORDS } from '../src/ui/worldMap.js';
import { COUNTRY_IDS } from '../src/data/countries.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const mapSvgOf = (html) => {
  const i = html.indexOf('<svg class="wl-world-map"');
  if (i < 0) return '';
  return html.slice(i, html.indexOf('</svg>', i) + 6);
};
const dotStatus = (mapSvg, countryId) => {
  const m = mapSvg.match(new RegExp(`<g data-country="${countryId}" data-status="([a-z]+)">`));
  return m ? m[1] : null;
};

function baseLife30() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 30;
  S.country = 'egy';
  return S;
}

/* --- Life A: visited France + USA, UK citizen, valid Schengen visa --- */
const A = baseLife30();
A.legal.citizenships = ['egy', 'gbr'];
A.legal.passports.push({ country: 'gbr', issuedYear: 2020, expiresYear: 2030 });
A.legal.touristVisas = [{ id: 'schengen_c', regionLabel: 'Schengen Area (EU)', issuedYear: 2026, expiresYear: 2028 }];
A.tripPlans = [
  { id: 'tpl1', destId: 'paris', name: 'Paris', country: 'fra', status: 'taken', takenYear: 2026 },
  { id: 'tpl2', destId: 'nyc', name: 'New York', country: 'usa', status: 'taken', takenYear: 2025 }
];
const htmlA = renderWorldTabHtml(A, { worldSub: 'passports' });
const mapA = mapSvgOf(htmlA);
const statusA = getCountryMapStatus(A);

check('(a) Passport tab contains the drawn world-map SVG', mapA.length > 500);
check('(a) map plots all 18 game countries', COUNTRY_IDS.every(id => dotStatus(mapA, id) !== null),
  `missing: ${COUNTRY_IDS.filter(id => dotStatus(mapA, id) === null).join(',')}`);
check('(a) France coloured visited (taken trip)', dotStatus(mapA, 'fra') === 'visited', `got ${dotStatus(mapA, 'fra')}`);
check('(a) USA coloured visited (taken trip)', dotStatus(mapA, 'usa') === 'visited', `got ${dotStatus(mapA, 'usa')}`);
check('(a) UK coloured citizen (citizenship held)', dotStatus(mapA, 'gbr') === 'citizen', `got ${dotStatus(mapA, 'gbr')}`);
check('(a) Egypt coloured home', dotStatus(mapA, 'egy') === 'home', `got ${dotStatus(mapA, 'egy')}`);
check('(a) Germany coloured visa (valid Schengen, not visited)', dotStatus(mapA, 'deu') === 'visa', `got ${dotStatus(mapA, 'deu')}`);
check('(a) Brazil coloured none (never touched)', dotStatus(mapA, 'bra') === 'none', `got ${dotStatus(mapA, 'bra')}`);
check('(a) status fn agrees: visited=2, citizen=1, visa=3 (deu/ita/nld)', 
  Object.values(statusA).filter(s => s === 'visited').length === 2 &&
  Object.values(statusA).filter(s => s === 'citizen').length === 1 &&
  Object.values(statusA).filter(s => s === 'visa').length === 3,
  JSON.stringify(statusA));
check('(a) legend names the visited countries', strip(htmlA).includes('Visited — United States, France'));
check('(a) map is labelled a drawn diagram, not a photo', strip(htmlA).includes('Drawn diagram, not a photograph'));
check('(a) projection: London dot sits in NW Europe (x~360, y~77)',
  (() => { const p = projectCountry('gbr'); return p.x > 350 && p.x < 370 && p.y > 70 && p.y < 85; })(),
  JSON.stringify(projectCountry('gbr')));
check('(a) projection: Tokyo far east, Canberra south of equator',
  (() => { const t = projectCountry('jpn'), c = projectCountry('aus'); return t.x > 600 && c.y > 250; })(),
  `${JSON.stringify(projectCountry('jpn'))} ${JSON.stringify(projectCountry('aus'))}`);
check('(a) all 18 countries have real capital coordinates', COUNTRY_IDS.every(id => COUNTRY_CAPITAL_COORDS[id] && Math.abs(COUNTRY_CAPITAL_COORDS[id].lat) <= 90 && Math.abs(COUNTRY_CAPITAL_COORDS[id].lng) <= 180));

check('(b) passport visual contains the player full name', strip(htmlA).includes(A.player.fullName),
  `name=${A.player.fullName}`);
check('(b) passport visual contains the held citizenship (United Kingdom)', strip(htmlA).includes('United Kingdom'));
check('(b) passport visual lists Egypt as a citizenship too', strip(htmlA).includes('CITIZENSHIPS HELD: Egypt, United Kingdom'));
check('(b) passport visual shows the ink portrait', htmlA.includes('wl-passport-visual') && htmlA.includes('wl-portrait'));
check('(b) passport visual shows issue/expiry years', strip(htmlA).includes('2020 → 2030'));
check('(b) two booklets render for two passports', (htmlA.match(/wl-passport-visual/g) || []).length === 2);
check('(b) no invented passport number on the visual (record has none)', !/PASSPORT NO\.|Passport number/i.test(strip(htmlA).split('Your passport')[1]?.split('GLOBAL MOBILITY')[0] || ''));

/* --- Life B: no travel at all, plus one EXPIRED visa --- */
const B = baseLife30();
B.legal.touristVisas = [{ id: 'schengen_c', regionLabel: 'Schengen Area (EU)', issuedYear: 2018, expiresYear: 2020 }];
const htmlB = renderWorldTabHtml(B, { worldSub: 'passports' });
const mapB = mapSvgOf(htmlB);
const statusB = getCountryMapStatus(B);
check('(c) no-travel life: no country coloured visited', !Object.values(statusB).includes('visited'), JSON.stringify(statusB));
check('(c) no-travel life: no country coloured visa (expired visa counts for nothing)',
  !Object.values(statusB).includes('visa'), JSON.stringify(statusB));
check('(c) no-travel life: home Egypt, other 17 none',
  statusB.egy === 'home' && Object.values(statusB).filter(s => s === 'none').length === 17,
  JSON.stringify(statusB));
check('(c) no-travel life: legend says no citizenship beyond home / no visits',
  strip(htmlB).includes('Citizenship held — none yet') || strip(htmlB).includes('Visited — none yet'));

/* --- (d) map SVG is fully self-contained --- */
for (const [label, map] of [['life A', mapA], ['life B', mapB]]) {
  check(`(d) ${label} map SVG has no http/https URL`, !/https?:\/\//i.test(map));
  check(`(d) ${label} map SVG has no <image> element`, !/<image/i.test(map));
  check(`(d) ${label} map SVG has no CDN / external reference`, !/cdn|src=|href=/i.test(map));
}

console.log(`\nv213-w3: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
