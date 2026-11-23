/* ============================================================================
   World Life 2.0 — v2.15 Worker 4: World & Markets panel (UI)
   Renders the world-event state inside the Finance tab: the property
   market state (Stable / Rising / Falling), the country's real central
   bank rate for the era, what is happening right now, and the history of
   world events this life has lived through. Plain words everywhere, no
   code in the UI. All numbers come from getMarketState() in
   src/systems/worldEvents.js — this file draws, it never computes.
   ========================================================================== */

import { getCountry } from '../data/countries.js';
import { getMarketState, worldSummaryLine } from '../systems/worldEvents.js';
import { WORLD_EVENTS } from '../data/worldEvents.js';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pct(mult) {
  const d = Math.round((Number(mult) - 1) * 100);
  if (d === 0) return 'no change';
  return d > 0 ? `+${d}%` : `${d}%`;
}

/* The panel dropped into the Finance tab (cashflow sub-tab). */
export function renderWorldMarketPanelHtml(S) {
  const st = getMarketState(S, S.country);
  const cObj = getCountry(S.country);
  const stateWord = st.state === 'Rising'
    ? 'Rising — house prices are being pushed up'
    : st.state === 'Falling'
    ? 'Falling — house prices are being pushed down'
    : 'Stable — nothing in the world is pushing house prices either way';
  const active = st.activeEvents;
  const history = st.history || [];

  const activeHtml = active.length === 0
    ? `<p class="muted">No world event is touching ${esc(cObj.name)} this month.</p>`
    : active.map((e) => {
      const ev = WORLD_EVENTS.find((w) => w.id === e.id);
      return `
        <div class="item-row">
          <div class="item-row-main">
            <strong>${esc(e.name)}</strong>
            <span>${esc(ev ? ev.headline : '')}</span>
            <span class="muted">House prices ${pct(e.housePrice)} · Businesses ${pct(e.businessRevenue)} · Pay ${pct(e.salary)}${e.rateShift ? ` · Interest rates ${e.rateShift > 0 ? '+' : ''}${(e.rateShift * 100).toFixed(0)} points` : ''} · Runs ${e.startYear}–${e.endYear}</span>
          </div>
        </div>`;
    }).join('');

  const historyHtml = history.length === 0
    ? `<p class="muted">No world event has touched your life yet — the first one arrives when the calendar reaches it.</p>`
    : `<div style="display:flex;flex-wrap:wrap;gap:6px">${history.map((h) => `
        <span class="hud-pill" title="${esc(h.name)} — house prices ${pct(h.housePrice)}, businesses ${pct(h.businessRevenue)}">${esc(h.name)} (${h.startYear}–${h.endYear})</span>
      `).join('')}</div>`;

  return `
    <div class="card" data-world-market-panel="1">
      <div class="section-head">
        <h3>The World &amp; Your Money (${esc(cObj.name)}, ${S.year})</h3>
        <span class="hud-pill">Property market: ${esc(st.state)}</span>
      </div>
      <p class="muted" style="margin-bottom:8px">${esc(worldSummaryLine(S, S.country))}</p>
      <div class="item-row">
        <div class="item-row-main">
          <strong>Property market: ${esc(stateWord)}</strong>
          <span>House prices ${pct(st.housePriceMult)} vs their era price · Businesses ${pct(st.businessRevenueMult)} · Pay ${pct(st.salaryMult)}</span>
          <span class="muted">Central bank rate: <strong class="mono">${(st.policyRate * 100).toFixed(1)}%</strong> · A mortgage here now costs about <strong class="mono">${(st.mortgageRate * 100).toFixed(1)}%/yr</strong> · Savings earn about <strong class="mono">${(st.savingsRate * 100).toFixed(1)}%/yr</strong>${st.rateShift ? ` · World events are moving rates by ${st.rateShift > 0 ? '+' : ''}${(st.rateShift * 100).toFixed(0)} points right now` : ''}</span>
        </div>
      </div>
      ${activeHtml}
      <div style="margin-top:10px">
        <strong style="font-size:0.9rem">World events you have lived through</strong>
        <div style="margin-top:6px">${historyHtml}</div>
      </div>
    </div>
  `;
}

/* One-line market state for anywhere else that wants it (property tab
   reads this through getMarketState; this is only the words). */
export function renderMarketStateLineHtml(S, countryId) {
  const st = getMarketState(S, countryId || S.country);
  return `<span>Property market: <strong>${esc(st.state)}</strong> (house prices ${pct(st.housePriceMult)})</span>`;
}
