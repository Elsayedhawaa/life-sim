/* ============================================================================
   Turn Result Card (src/ui/turnResult.js)
   After every Next Month / Advance Year / Skip Quiet Year / decision choice,
   a dismissible card says out loud what the turn did: money in and out,
   vital changes, and the new story lines. Before this, the game re-rendered
   silently and the player had to hunt the journal for what happened.
   Pure UI: reads the same journal and ledger the game already writes.
   ========================================================================== */

import { MONTH_NAMES } from '../core/schema.js';
import { formatMoney, getCountry } from '../data/countries.js';
import { convertCurrency } from '../data/economy.js';
import { entryDelta, entryCurrencyIsCurrent } from '../core/ledgerCurrency.js';
import { esc } from './views.js';

function num(v) {
  const n = Number(v);
  return isFinite(n) ? n : 0;
}

/* Capture everything a turn can move. Journal and ledger are newest-first,
   so new entries are the ones before the previous top id. */
export function snapshotTurn(S) {
  const p = S.player || {};
  const v = p.vitals || {};
  return {
    year: S.year,
    month: S.month,
    country: S.country,
    age: num(p.age),
    cash: num(S.money && S.money.cash),
    savings: num(S.money && S.money.savings),
    health: num(v.health),
    happiness: num(v.happiness),
    smarts: num(v.smarts),
    looks: num(v.looks),
    calm: 100 - num(v.stress),
    skills: Object.fromEntries(Object.entries(S.skills || {}).filter(([, v]) => Number.isFinite(v))),
    relationships: Object.fromEntries(Object.entries(S.people || {}).filter(([, person]) => person?.alive).map(([id, person]) => [id, {
      name: person.firstName || person.fullName || 'Someone',
      affection: num(person.rel?.affection), trust: num(person.rel?.trust), respect: num(person.rel?.respect),
    }])),
    journalTopId: S.journal && S.journal[0] ? S.journal[0].id : null,
    ledgerTopId: S.ledger && S.ledger[0] ? S.ledger[0].id : null
  };
}

function newEntriesSince(list, topId) {
  const out = [];
  if (!Array.isArray(list)) return out;
  for (const e of list) {
    if (!e || e.id === topId) break;
    out.push(e);
  }
  return out;
}

function monthLabel(S) {
  return S.pacing === 'monthly'
    ? `${MONTH_NAMES[(S.month - 1) % 12].slice(0, 3)} ${S.year}`
    : `Year ${S.year}`;
}

/* kind: 'month' | 'year' | 'fastforward' | 'choice' */
export function buildTurnResult(S, before, kind, stepsRun = 1) {
  const p = S.player || {};
  const after = snapshotTurn(S);

  let title;
  if (kind === 'choice') {
    title = 'Decision result';
  } else if (kind === 'fastforward') {
    title = `${stepsRun} month${stepsRun === 1 ? '' : 's'} later — ${monthLabel(S)}, age ${after.age}`;
  } else if (S.pacing === 'monthly') {
    title = `${monthLabel(S)} · Age ${after.age}`;
  } else {
    title = `A year passes — age ${after.age}, ${S.year}`;
  }

  /* Money: net change plus the movements, grouped by label. */
  /* A move to another country converts the balances. Old and new amounts are in different currencies, so they are never subtracted from each other:
     the change shown is against the old balance converted at the same rate, and the conversion is its own line (old amount to new amount). */
  const moved = before.country && before.country !== S.country;
  const conv = v => moved ? Math.round(convertCurrency(v, before.country, S.country, S.year) * 100) / 100 : v;
  const cashDelta = Math.round((after.cash - conv(before.cash)) * 100) / 100;
  const savingsDelta = Math.round((after.savings - conv(before.savings)) * 100) / 100;
  const fxLines = [];
  if (moved) {
    if (before.cash) fxLines.push(`Cash: ${formatMoney(before.cash, before.country)} became ${formatMoney(conv(before.cash), S.country)}`);
    if (before.savings) fxLines.push(`Savings: ${formatMoney(before.savings, before.country)} became ${formatMoney(conv(before.savings), S.country)}`);
  }
  const moves = new Map();
  let wentWithout = 0;
  for (const e of newEntriesSince(S.ledger, before.ledgerTopId)) {
    if (e.account !== 'cash' && e.account !== 'savings') continue;
    if (e.category === 'credit_limit') { wentWithout += entryDelta(S, e); continue; } /* costs you went without: not income, shown as its own note */
    if (e.category === 'fx') continue; /* pure currency conversion is not spending or income */
    const key = (e.label || 'Payment').replace(e.category === 'monthly_settlement' ? / \(\d{1,2}\/\d{4}\)$/ : /$^/, '');
    const k2 = entryCurrencyIsCurrent(S, e) ? key : `${key} (paid in ${e.currency}, shown in ${getCountry(S.country).currency})`;
    moves.set(k2, Math.round(((moves.get(k2) || 0) + entryDelta(S, e)) * 100) / 100);
  }
  const moneyLines = [...moves.entries()]
    .map(([label, delta]) => ({ label, delta }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  /* Vitals: only what actually moved. */
  const vitalDeltas = [];
  const pushVital = (label, d) => {
    const r = Math.round(d);
    if (r !== 0) vitalDeltas.push({ label, delta: r });
  };
  pushVital('Health', after.health - before.health);
  pushVital('Happiness', after.happiness - before.happiness);
  pushVital('Smarts', after.smarts - before.smarts);
  pushVital('Looks', after.looks - before.looks);
  pushVital('Peace of Mind', after.calm - before.calm);

  const skillLabels = { charisma: 'Charisma', financialIq: 'Financial skill', fitness: 'Fitness', creativity: 'Creativity', wasta: 'Network' };
  const skillDeltas = Object.entries(after.skills).filter(([key]) => before.skills?.[key] !== undefined)
    .map(([key, value]) => ({ label: skillLabels[key] || key, delta: Math.round(value - before.skills[key]) })).filter(item => item.delta !== 0);
  const relationshipDeltas = [];
  for (const [id, person] of Object.entries(after.relationships)) {
    const old = before.relationships?.[id];
    if (!old) continue;
    for (const key of ['affection', 'trust', 'respect']) {
      const delta = Math.round(person[key] - old[key]);
      if (delta) relationshipDeltas.push({ label: `${person.name}: ${key}`, delta });
    }
  }

  /* Story: the new journal lines, oldest first so it reads in order. */
  const storyLines = newEntriesSince(S.journal, before.journalTopId)
    .map(e => e.text)
    .filter(Boolean)
    .reverse()
    .slice(0, 4);

  return {
    title,
    kind,
    cashDelta,
    cashBalance: after.cash,
    savingsDelta,
    moneyLines,
    fxLines,
    vitalDeltas,
    skillDeltas,
    relationshipDeltas,
    storyLines,
    ageDelta: after.age - before.age,
    sceneWaiting: !!S.activeScene,
    gameOver: !!S.gameOver,
    wentWithout: Math.round(wentWithout)
  };
}

function signedMoney(delta, country) {
  const abs = formatMoney(Math.abs(delta), country, true);
  return `${delta > 0 ? '+' : '−'}${abs}`;
}

export function renderTurnResultCardHtml(S, uiState) {
  const r = uiState && uiState.turnResult;
  if (!r) return '';

  const moneyBits = [];
  if (r.cashDelta !== 0 || r.moneyLines.length > 0 || (r.fxLines || []).length) {
    const netCls = r.cashDelta > 0 ? 'text-good' : r.cashDelta < 0 ? 'text-bad' : '';
    const netTxt = r.cashDelta === 0 ? '±0' : signedMoney(r.cashDelta, S.country);
    const shown = r.moneyLines.slice(0, 6);
    const more = r.moneyLines.length - shown.length;
    moneyBits.push(`
      <div class="trc-money">
        ${(r.fxLines || []).length ? `<div class="muted">Currency conversion (not a cost)</div><ul class="trc-lines">${r.fxLines.map(t => `<li><span>${esc(t)}</span></li>`).join('')}</ul>` : ''}
        ${r.cashDelta !== 0 || r.moneyLines.length || !(r.fxLines || []).length ? `<div class="muted">Cash change</div>
        <div class="trc-net mono ${netCls}">${esc(netTxt)}</div>` : ''}
        ${shown.length ? `<ul class="trc-lines">
          ${shown.map(l => `<li><span>${esc(l.label)}</span><span class="mono ${l.delta >= 0 ? 'text-good' : 'text-bad'}">${esc(signedMoney(l.delta, S.country))}</span></li>`).join('')}
          ${more > 0 ? `<li class="muted">and ${more} more movement${more === 1 ? '' : 's'}</li>` : ''}
        </ul>` : ''}
      </div>`);
  }

  const vitalsBit = r.vitalDeltas.length
    ? `<div class="trc-vitals">${r.vitalDeltas.map(v =>
        `<span class="trc-chip ${v.delta > 0 ? 'text-good' : 'text-bad'}">${esc(v.label)} ${v.delta > 0 ? '+' : '−'}${Math.abs(v.delta)}</span>`).join('')}</div>`
    : '';

  const extraChanges = [...(r.skillDeltas || []), ...(r.relationshipDeltas || [])];
  const extraBit = extraChanges.length
    ? `<details class="trc-details" ${r.kind === 'choice' ? 'open' : ''}><summary>Skills & relationships (${extraChanges.length})</summary><div class="trc-vitals">${extraChanges.map(item => `<span class="trc-chip ${item.delta > 0 ? 'text-good' : 'text-bad'}">${esc(item.label)} ${item.delta > 0 ? '+' : '−'}${Math.abs(item.delta)}</span>`).join('')}</div></details>`
    : '';
  const storyBit = r.storyLines.length
    ? `<div class="trc-story">${r.storyLines.map(t => `<div class="trc-story-line">${esc(t)}</div>`).join('')}</div>`
    : '';

  const quiet = r.cashDelta === 0 && !r.vitalDeltas.length && !r.storyLines.length && !extraChanges.length && !r.sceneWaiting && !r.gameOver;

  const noteBits = [];
  if (S.player.age >= 18 && num(r.cashBalance) <= 0) {
    noteBits.push(`<div class="trc-note text-bad">${r.cashBalance < 0
      ? `Cash shortfall: ${esc(formatMoney(Math.abs(r.cashBalance), S.country))}. Being overdrawn lowers your credit score and raises stress each month. Cut costs, earn money or sell assets.`
      : 'No cash left. Paid activities need cash; free activities are still available.'}</div>`);
  }
  if (r.moneyLines.some(l => /Monthly (housing|living costs|debt payments|family support)/.test(l.label))) {
    noteBits.push('<span title="Bills already deducted." aria-label="Information">ⓘ</span>');
  }
  if (r.wentWithout > 0) noteBits.push(`<div class="trc-note text-bad">You are at your credit limit, so about ${esc(formatMoney(r.wentWithout, S.country))} of this month's costs went unpaid. You went without, and your health, happiness and calm take the hit. This is not added to your debt.</div>`);
  if (r.sceneWaiting) noteBits.push(`<div class="trc-note">A decision is waiting for you below.</div>`);
  if (r.gameOver) noteBits.push(`<div class="trc-note">This life has ended.</div>`);
  if (quiet) noteBits.push(`<div class="trc-note muted">A quiet one. Nothing changed.</div>`);

  return `
    <section class="turn-result-card" role="status" aria-live="polite">
      <div class="trc-head">
        <div class="trc-title">${esc(r.title)}</div>
        <button type="button" class="trc-close" data-action="dismiss-turn-result" aria-label="Dismiss">×</button>
      </div>
      ${moneyBits.join('')}
      ${S.player.age >= 18 ? `<div class="trc-note">Cash left: <strong class="mono ${r.cashBalance < 0 ? 'text-bad' : ''}">${esc(formatMoney(num(r.cashBalance), S.country))}</strong></div>` : ''}
      ${vitalsBit}
      ${extraBit}
      ${storyBit}
      ${noteBits.join('')}
    </section>`;
}
