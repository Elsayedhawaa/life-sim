/* ============================================================================
   World Life 2.0 — Landlord UI (v2.15 Worker 1)
   The Real Estate tab's landlord cards: the named tenant, the deposit,
   the lease, the damage list, the market state and its history.
   Pure read + buttons: every button states its cost and effect before
   the player commits, and no button here moves money on render.
   ========================================================================== */

import { getCountry, formatMoney } from '../data/countries.js';
import { MONTH_NAMES } from '../core/schema.js';
import {
  landlordSummary, marketStateFor, voidMonthCostLocal
} from '../systems/propertyLandlord.js';

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* A line chart of the rent index, drawn from the real recorded
   history — the same honest-chart rule as the Finance charts. */
function marketHistorySvg(S, history) {
  const pts = history.slice(-36);
  const W = 760, H = 170, padL = 10, padR = 10, padT = 28, padB = 24;
  const vals = pts.map(p => Number(p.rentIndex) || 1);
  const minV = Math.min(...vals, 0.85), maxV = Math.max(...vals, 1.15);
  const span = (maxV - minV) || 1;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const xFor = i => (padL + (pts.length === 1 ? plotW / 2 : (i / (pts.length - 1)) * plotW)).toFixed(1);
  const yFor = v => (padT + plotH - ((v - minV) / span) * plotH).toFixed(1);
  const points = pts.map((p, i) => `${xFor(i)},${yFor(p.rentIndex)}`).join(' ');
  const dots = pts.map((p, i) => `<circle cx="${xFor(i)}" cy="${yFor(p.rentIndex)}" r="3" style="fill:var(--chart-navy)" data-point-label="${esc(`${MONTH_NAMES[(p.month - 1) % 12].slice(0, 3)} ${p.year} — ${p.state}`)}" data-point-value="${p.rentIndex}"/>`).join('');
  const first = pts[0], last = pts[pts.length - 1];
  return `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="160" role="img" aria-label="Property market rent index over time" style="background:var(--bg-chart);border:1px solid var(--line-soft);border-radius:8px;display:block">
      <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" style="stroke:var(--chart-grid)"/>
      <polyline fill="none" style="stroke:var(--chart-navy)" stroke-width="2.2" points="${points}"/>
      ${dots}
      <text x="${xFor(0)}" y="${(Number(yFor(first.rentIndex)) - 8).toFixed(1)}" font-size="9" style="fill:var(--ink-secondary)">${esc(`${MONTH_NAMES[(first.month - 1) % 12].slice(0, 3)} ${first.year}`)}: ×${first.rentIndex}</text>
      <text x="${xFor(pts.length - 1)}" y="${(Number(yFor(last.rentIndex)) - 8).toFixed(1)}" font-size="9" style="fill:var(--ink-secondary)" text-anchor="end">${esc(`${MONTH_NAMES[(last.month - 1) % 12].slice(0, 3)} ${last.year}`)}: ×${last.rentIndex}</text>
      <text x="${padL}" y="${H - 7}" font-size="9" style="fill:var(--ink-secondary)">Rent index 1.00 = stable · above 1.00 rents are up · below 1.00 rents are down</text>
    </svg>`;
}

function renderMarketCardHtml(S) {
  const countries = [...new Set((S.housing?.properties || []).map(p => p.country).filter(Boolean))];
  if (!countries.length) return '';
  const cards = countries.map(cid => {
    const market = marketStateFor(S, cid);
    const hist = market.history || [];
    const stateWord = market.state === 'rising' ? 'Rising' : market.state === 'falling' ? 'Falling' : 'Stable';
    return `
      <div style="border-top:1px solid var(--line-soft);padding-top:10px;margin-top:10px">
        <strong>${esc(getCountry(cid).name)} property market: ${esc(stateWord)}</strong>
        <span class="muted"> — ${esc(market.line || '')} Rent index ×${market.rentIndex} · Prices ×${market.priceIndex}${market.shockLabel ? ` · ${esc(market.shockLabel)}` : ''}</span>
        ${hist.length >= 2 ? `
          <div data-chart="property-market" data-country="${esc(cid)}" data-state="${esc(market.state)}" data-points="${hist.length}" style="margin-top:8px">
            ${marketHistorySvg(S, hist)}
            <div class="muted" style="font-size:0.82rem;margin-top:6px">${hist.length} months of market history, recorded as the years passed — not made up.</div>
          </div>` : `<p class="muted" style="margin:6px 0 0">The market history starts recording now — come back after a few months and the chart will draw itself from the real record.</p>`}
      </div>`;
  }).join('');
  return `
    <div class="card">
      <div class="section-head">
        <h3>Property Market</h3>
        <span class="muted">Rising, stable or falling — by country, by era</span>
      </div>
      ${cards}
    </div>`;
}

function renderTenantCardHtml(S, prop) {
  const sum = landlordSummary(S, prop);
  const t = sum.tenant;
  const law = sum.law;
  const openDamage = sum.damage;
  const st = sum.depositSettlement;

  let tenantLine = '';
  if (t) {
    const person = S.people?.[t.personId];
    const relWord = t.relationship >= 75 ? 'a good relationship' : t.relationship >= 50 ? 'an okay relationship' : t.relationship >= 30 ? 'a strained relationship' : 'a bad relationship';
    tenantLine = `
      <div style="margin:6px 0">
        <strong>Tenant: ${esc(t.name)}</strong> — ${esc(t.jobTitle)} at ${esc(t.employer)}, earning <strong class="mono">${esc(formatMoney(t.monthlyIncomeLocal, S.country))}/mo</strong> · Reliability ${t.reliability}/100 · ${esc(relWord)} (${t.relationship}/100)
        <br><span class="muted">There ${t.monthsHere} month${t.monthsHere === 1 ? '' : 's'} · ${t.lateMonths} late payment${t.lateMonths === 1 ? '' : 's'} · Owes <strong class="mono">${esc(formatMoney(t.arrearsLocal || 0, S.country))}</strong>${t.jobLost ? ' · <strong class="text-bad">Out of work</strong>' : ''}${t.eviction ? ` · <strong class="text-bad">Eviction running — ${t.eviction.monthsLeft} month${t.eviction.monthsLeft === 1 ? '' : 's'} left at ${esc(t.eviction.court)}</strong>` : ''}${t.graceMonthsLeft > 0 ? ` · You gave them ${t.graceMonthsLeft} month${t.graceMonthsLeft === 1 ? '' : 's'} to find work` : ''}</span>
        ${person ? `<br><span class="muted">A real person in your world — find them under People.</span>` : ''}
      </div>`;
  } else {
    tenantLine = `
      <div style="margin:6px 0">
        <strong>No tenant right now.</strong>
        <span class="muted"> Empty ${sum.voidMonths} month${sum.voidMonths === 1 ? '' : 's'} — no rent coming in, and the empty flat still costs <strong class="mono">${esc(formatMoney(voidMonthCostLocal(S, prop), S.country))}/mo</strong> in bills. A new tenant is found automatically most months.</span>
      </div>`;
  }

  const depositLine = sum.deposit.held ? `
    <div style="margin:6px 0"><strong>Deposit held: ${esc(formatMoney(sum.deposit.amountLocal, S.country))}</strong> <span class="muted">(${sum.deposit.months} months' rent · Game deposit, not a local legal limit)</span></div>`
    : (st ? `<div style="margin:6px 0"><strong>Deposit dispute waiting:</strong> <span class="muted">${esc(st.tenantName)} left — damage ${esc(formatMoney(st.totalLocal, S.country))} against a ${esc(formatMoney(st.depositLocal, S.country))} deposit. Decide below.</span></div>`
    : `<div style="margin:6px 0"><span class="muted">No deposit held on this property.</span></div>`);

  const leaseLine = t ? `
    <div style="margin:6px 0"><strong>Lease: ${sum.lease.monthsLeft} month${sum.lease.monthsLeft === 1 ? '' : 's'} left</strong> <span class="muted">of a 12-month lease at <strong class="mono">${esc(formatMoney(sum.rentLocal, S.country))}/mo</strong> (condition ${Math.round(sum.conditionPct)}% and the ${esc(sum.market.label.toLowerCase())} market are already in that rent).</span></div>` : '';

  const damageHtml = openDamage.length ? `
    <div style="margin:6px 0">
      <strong>Damage waiting:</strong>
      ${openDamage.map(d => `
        <div class="item-row" style="padding:6px 0">
          <div class="item-row-main">
            <strong>${esc(d.label)}</strong>
            <span>${d.status === 'cheap-fixed' ? 'Cheap fix — may break again · ' : ''}Proper fix: <strong class="mono">${esc(formatMoney(d.costLocal, S.country))}</strong> · Cheap fix: <strong class="mono">${esc(formatMoney(Math.round(d.costLocal * 0.4), S.country))}</strong>${d.tenantCaused ? ' · Tenant-caused — comes out of the deposit at the end' : ''}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            <button class="btn btn-sm" data-action="landlord-fix-damage" data-id="${esc(prop.id)}" data-damage="${esc(d.id)}" data-mode="full">Fix properly (${esc(formatMoney(d.costLocal, S.country))})</button>
            <button class="btn btn-sm" data-action="landlord-fix-damage" data-id="${esc(prop.id)}" data-damage="${esc(d.id)}" data-mode="cheap">Fix cheaply (${esc(formatMoney(Math.round(d.costLocal * 0.4), S.country))})</button>
            <button class="btn btn-sm" data-action="landlord-fix-damage" data-id="${esc(prop.id)}" data-damage="${esc(d.id)}" data-mode="ignore">Ignore it</button>
          </div>
        </div>`).join('')}
    </div>` : '';

  const maintainCost = Math.max(250, Math.round((Number(prop.valueLocal) || 0) * 0.008));
  const actions = [];
  if (!t) {
    actions.push(`<button class="btn btn-sm" data-action="landlord-find-tenant" data-id="${esc(prop.id)}"${st?.status==='pending'?' disabled':''}>Find a tenant now</button>`);
  }
  if (t && t.jobLost && !t.eviction) {
    actions.push(`<button class="btn btn-sm" data-action="landlord-give-time" data-id="${esc(prop.id)}">Give them 3 months to find work</button>`);
    actions.push(`<button class="btn btn-sm" data-action="landlord-evict" data-id="${esc(prop.id)}">Start eviction (${esc(formatMoney(Math.round(sum.rentLocal * law.costRentMonths), S.country))}, ${law.noticeMonths + law.courtMonths} months)</button>`);
  }
  if (t && sum.lease.monthsLeft <= 0) {
    actions.push(`<button class="btn btn-sm" data-action="landlord-renew" data-id="${esc(prop.id)}" data-mode="same">Renew — same rent (${esc(formatMoney(sum.rentLocal, S.country))}/mo)</button>`);
    actions.push(`<button class="btn btn-sm" data-action="landlord-renew" data-id="${esc(prop.id)}" data-mode="raise">Raise rent 5% (they may refuse)</button>`);
    actions.push(`<button class="btn btn-sm" data-action="landlord-renew" data-id="${esc(prop.id)}" data-mode="sell">Sell with tenant in place</button>`);
  }
  if (t) {
    actions.push(`<button class="btn btn-sm" data-action="landlord-end-tenancy" data-id="${esc(prop.id)}">End tenancy</button>`);
  }
  if ((prop.conditionPct ?? 100) < 98) {
    actions.push(`<button class="btn btn-sm" data-action="landlord-maintain" data-id="${esc(prop.id)}">Maintain (${esc(formatMoney(maintainCost, S.country))} — condition +10)</button>`);
  }
  if (st && st.status === 'pending') {
    actions.push(`<button class="btn btn-sm" data-action="landlord-deposit" data-id="${esc(prop.id)}" data-choice="keep">Keep ${esc(formatMoney(st.totalLocal, S.country))} for damage</button>`);
    actions.push(`<button class="btn btn-sm" data-action="landlord-deposit" data-id="${esc(prop.id)}" data-choice="return">Return full deposit (${esc(formatMoney(st.depositLocal, S.country))})</button>`);
    actions.push('<span class="muted" title="No evidence or collection process is modeled. No filing fee charged.">Court review unavailable ⓘ</span>');
  }

  return `
    <div style="border-top:1px solid var(--line-soft);padding-top:10px;margin-top:10px">
      <strong>${esc(prop.name)} (${esc(getCountry(prop.country).name)})</strong>
      <span class="muted"> · Condition <strong>${Math.round(sum.conditionPct)}%</strong> · Rent <strong class="mono">${esc(formatMoney(sum.rentLocal, S.country))}/mo</strong> · Market ${esc(sum.market.label)} (×${sum.market.rentIndex})</span>
      ${tenantLine}
      ${depositLine}
      ${leaseLine}
      ${damageHtml}
      ${actions.length ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:8px">${actions.join('')}</div>` : ''}
    </div>`;
}

/* The landlord section on the Real Estate tab: one card per rented-out
   long-term property, plus the market card. Properties the player
   lives in, holiday lets and empty owned homes are not landlord
   properties — they have no tenant to show. */
export function renderLandlordSectionHtml(S) {
  const props = (S.housing?.properties || []).filter(p =>
    p && p.rentedOut && p.id !== S.housing?.currentHomeId && p.tenantMode !== 'short_term');
  const marketHtml = renderMarketCardHtml(S);
  if (!props.length && !marketHtml) return '';
  if (!props.length) return marketHtml;
  return `
    <div class="card">
      <div class="section-head">
        <h3>Being a Landlord (${props.length})</h3>
        <span class="muted">Rent · Deposits · Damage</span>
      </div>
      ${props.map(p => renderTenantCardHtml(S, p)).join('')}
    </div>
    ${marketHtml}`;
}

/* Kept for the verify script: the maintenance price the button shows,
   so the UI and the action can never disagree. */
export function maintainCostLocal(S, prop) {
  return Math.max(250, Math.round((Number(prop?.valueLocal) || 0) * 0.008));
}
