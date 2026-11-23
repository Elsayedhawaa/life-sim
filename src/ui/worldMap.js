/* ============================================================================
   World Life 2.13 Worker 3 — Drawn world map for the Passport tab.
   - Inline SVG only: no external tiles, no CDN, no <image>, no network at
     all, so the game still works by double-clicking index.html with no
     server and no internet. The map is a DRAWN diagram, labelled as such.
   - Projection: equirectangular. x = (longitude + 180) / 360 * WIDTH,
     y = (90 - latitude) / 180 * HEIGHT. Straight lines of latitude and
     longitude, so a dot's place on the map follows directly from its real
     coordinates — no hand-tuned positions.
   - Coordinates: approximate CAPITAL-CITY latitude/longitude for the 18
     game countries, from general geographic knowledge (public facts, e.g.
     London ~51.5N 0.1W, Cairo ~30.0N 31.2E, Tokyo ~35.7N 139.7E). There is
     NO lat/lng table in src/data/ (checked 2026-11-20: countries.js has no
     coordinates), so these live here and are labelled approximate.
   - Status is REAL, computed from the player's own records — never
     decoration: a country the player has never touched is coloured "none".
     Priority when several apply: home > citizenship held > visited >
     valid visa held > none.
     * home: S.homeCountry.
     * citizenship: S.legal.citizenships, plus any country the player holds
       a passport for (a passport is citizenship evidence).
     * visited: living in the country now (S.country != home), a non-citizen
       residency in it, Hajj/Umrah (Saudi Arabia), or a trip plan with
       status 'taken' naming it. A visa alone does NOT count as a visit.
     * visa: a tourist visa in S.legal.touristVisas with expiresYear >
       S.year, mapped to its countries through CONSULAR_TOURIST_VISAS
       (the game's own visa table — the single source of truth for which
       countries a visa covers, e.g. Schengen covers deu/fra/ita/nld).
   ========================================================================== */

import { getCountry, COUNTRY_IDS } from '../data/countries.js';
import { CONSULAR_TOURIST_VISAS } from '../systems/visaMigrationEngine.js';

/* Approximate capital-city coordinates (latitude, longitude, decimal
   degrees; north/east positive). Capitals: Cairo, Riyadh, Abu Dhabi,
   London, Washington DC, Berlin, Ottawa, Canberra, Amsterdam, Paris,
   Tokyo, Rome, Singapore, Brasilia, New Delhi, Bern, Stockholm, Ankara. */
export const COUNTRY_CAPITAL_COORDS = {
  egy: { lat: 30.04, lng: 31.24, capital: 'Cairo' },
  sau: { lat: 24.71, lng: 46.68, capital: 'Riyadh' },
  uae: { lat: 24.45, lng: 54.38, capital: 'Abu Dhabi' },
  gbr: { lat: 51.51, lng: -0.13, capital: 'London' },
  usa: { lat: 38.91, lng: -77.04, capital: 'Washington DC' },
  deu: { lat: 52.52, lng: 13.40, capital: 'Berlin' },
  can: { lat: 45.42, lng: -75.70, capital: 'Ottawa' },
  aus: { lat: -35.28, lng: 149.13, capital: 'Canberra' },
  nld: { lat: 52.37, lng: 4.90, capital: 'Amsterdam' },
  fra: { lat: 48.85, lng: 2.35, capital: 'Paris' },
  jpn: { lat: 35.68, lng: 139.69, capital: 'Tokyo' },
  ita: { lat: 41.90, lng: 12.50, capital: 'Rome' },
  sgp: { lat: 1.35, lng: 103.82, capital: 'Singapore' },
  bra: { lat: -15.79, lng: -47.88, capital: 'Brasilia' },
  ind: { lat: 28.61, lng: 77.21, capital: 'New Delhi' },
  che: { lat: 46.95, lng: 7.45, capital: 'Bern' },
  swe: { lat: 59.33, lng: 18.07, capital: 'Stockholm' },
  tur: { lat: 39.93, lng: 32.86, capital: 'Ankara' }
};

export const MAP_WIDTH = 720;
export const MAP_HEIGHT = 360;

/* Equirectangular projection: longitude -> x, latitude -> y. */
export function projectCountry(countryId) {
  const c = COUNTRY_CAPITAL_COORDS[countryId];
  if (!c) return null;
  return {
    x: +(((c.lng + 180) / 360) * MAP_WIDTH).toFixed(1),
    y: +(((90 - c.lat) / 180) * MAP_HEIGHT).toFixed(1)
  };
}

/* Status -> colour + plain-words label. */
export const MAP_STATUS = {
  home: { color: '#B42318', label: 'Home country' },
  citizen: { color: '#1D4ED8', label: 'Citizenship held' },
  visited: { color: '#186A47', label: 'Visited' },
  visa: { color: '#B7791F', label: 'Valid visa held' },
  none: { color: '#C9C4BB', label: 'Not visited yet' }
};

/* The player's real status with every game country. Returns
   { [countryId]: 'home' | 'citizen' | 'visited' | 'visa' | 'none' }. */
export function getCountryMapStatus(S) {
  const legal = S.legal || {};
  const citizenships = new Set(legal.citizenships || []);
  for (const pp of legal.passports || []) {
    if (pp && pp.country) citizenships.add(pp.country);
  }

  const visited = new Set();
  if (S.country && S.country !== S.homeCountry) visited.add(S.country);
  const res = legal.residency || {};
  if (res.country && res.kind && res.kind !== 'citizen') visited.add(res.country);
  if (S.credentials?.hajjCompleted || (S.credentials?.umrahCount || 0) > 0) visited.add('sau');
  for (const p of S.tripPlans || []) {
    if (p && p.status === 'taken' && p.country) visited.add(p.country);
  }

  const visaHeld = new Set();
  for (const tv of legal.touristVisas || []) {
    if (!tv || !(tv.expiresYear > S.year)) continue;
    const spec = (CONSULAR_TOURIST_VISAS || []).find(v => v.id === tv.id);
    for (const c of spec?.covers || []) visaHeld.add(c);
  }

  const status = {};
  for (const id of COUNTRY_IDS) {
    if (id === S.homeCountry) status[id] = 'home';
    else if (citizenships.has(id)) status[id] = 'citizen';
    else if (visited.has(id)) status[id] = 'visited';
    else if (visaHeld.has(id)) status[id] = 'visa';
    else status[id] = 'none';
  }
  return status;
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Drawn world map (inline SVG, no external anything) + plain-words legend. */
export function renderWorldMapHtml(S) {
  const status = getCountryMapStatus(S);
  const byStatus = { home: [], citizen: [], visited: [], visa: [], none: [] };
  for (const id of COUNTRY_IDS) byStatus[status[id]].push(id);
  const nameList = (ids) => ids.map(id => getCountry(id).name).join(', ');

  /* Light graticule: a line every 30 degrees, equator a touch stronger. */
  let grid = '';
  for (let lng = -150; lng <= 150; lng += 30) {
    const x = ((lng + 180) / 360) * MAP_WIDTH;
    grid += `<line x1="${x}" y1="0" x2="${x}" y2="${MAP_HEIGHT}" stroke="rgba(29,53,87,0.08)" stroke-width="1"/>`;
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = ((90 - lat) / 180) * MAP_HEIGHT;
    const strong = lat === 0;
    grid += `<line x1="0" y1="${y}" x2="${MAP_WIDTH}" y2="${y}" stroke="${strong ? 'rgba(29,53,87,0.20)' : 'rgba(29,53,87,0.08)'}" stroke-width="${strong ? 1.4 : 1}"/>`;
  }

  const dots = COUNTRY_IDS.map(id => {
    const pt = projectCountry(id);
    if (!pt) return '';
    const st = status[id];
    const col = MAP_STATUS[st].color;
    const cObj = getCountry(id);
    const r = st === 'none' ? 4.5 : 6.5;
    return `<g data-country="${esc(id)}" data-status="${esc(st)}">
      <title>${esc(cObj.name)} (${esc(COUNTRY_CAPITAL_COORDS[id].capital)}) — ${esc(MAP_STATUS[st].label)}</title>
      <circle cx="${pt.x}" cy="${pt.y}" r="${r}" fill="${col}" stroke="rgba(20,20,19,0.45)" stroke-width="1"/>
      <text x="${pt.x}" y="${pt.y + r + 10}" text-anchor="middle" font-size="9" font-weight="700" fill="#524C43">${esc(cObj.flagCode)}</text>
    </g>`;
  }).join('');

  const legendRow = (st) => {
    const ids = byStatus[st];
    if (st === 'none') {
      return `<div style="display:flex;gap:6px;align-items:baseline"><span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${MAP_STATUS[st].color};border:1px solid rgba(20,20,19,0.45);flex-shrink:0;transform:translateY(1px)"></span><span><strong>${esc(MAP_STATUS[st].label)}</strong> — ${ids.length} ${ids.length === 1 ? 'country' : 'countries'}: <span class="muted">${esc(nameList(ids))}</span></span></div>`;
    }
    return `<div style="display:flex;gap:6px;align-items:baseline"><span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:${MAP_STATUS[st].color};flex-shrink:0;transform:translateY(1px)"></span><span><strong>${esc(MAP_STATUS[st].label)}</strong>${ids.length ? ` — ${esc(nameList(ids))}` : ' — none yet'}</span></div>`;
  };

  return `
    <div class="wl-world-map-wrap" style="margin-bottom:14px" data-map="world">
      <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px;margin-bottom:6px">
        <h3 style="margin:0;font-size:0.95rem">Where you have been — drawn map</h3>
        <span class="muted" style="font-size:0.72rem">Drawn diagram, not a photograph. Each dot sits where that country's capital city really is.</span>
      </div>
      <svg class="wl-world-map" viewBox="0 0 ${MAP_WIDTH} ${MAP_HEIGHT}" width="100%" role="img" aria-label="Drawn world map showing the countries you have been to, hold citizenship of, or hold a valid visa for" style="display:block;background:#EDF2F5;border:1px solid rgba(20,20,19,0.18);border-radius:10px">
        ${grid}
        ${dots}
      </svg>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:4px 16px;margin-top:8px;font-size:0.8rem">
        ${legendRow('home')}
        ${legendRow('citizen')}
        ${legendRow('visited')}
        ${legendRow('visa')}
        ${legendRow('none')}
      </div>
    </div>
  `;
}
