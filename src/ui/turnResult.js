/* ============================================================================
   Turn Result Card (src/ui/turnResult.js)
   After every Next Month / Advance Year / Skip Quiet Year / decision choice,
   a dismissible card says out loud what the turn did: money in and out,
   vital changes, and the new story lines. Before this, the game re-rendered
   silently and the player had to hunt the journal for what happened.
   Pure UI: reads the same journal and ledger the game already writes.
   ========================================================================== */

import { MONTH_NAMES } from '../core/schema.js';
import { formatMoney } from '../data/countries.js';
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
    age: num(p.age),
    cash: num(S.money && S.money.cash),
    savings: num(S.money && S.money.savings),
    health: num(v.health),
    happiness: num(v.happiness),
    smarts: num(v.smarts),
    looks: num(v.looks),
    calm: 100 - num(v.stress),
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
    title = 'Your decision — what happened';
  } else if (kind === 'fastforward') {
    title = `${stepsRun} month${stepsRun === 1 ? '' : 's'} later — ${monthLabel(S)}, age ${after.age}`;
  } else if (S.pacing === 'monthly') {
    title = `${monthLabel(S)} · Age ${after.age}`;
  } else {
    title = `A year passes — age ${after.age}, ${S.year}`;
  }

  /* Money: net change plus the movements, grouped by label. */
  const cashDelta = Math.round((after.cash - before.cash) * 100) / 100;
  const savingsDelta = Math.round((after.savings - before.savings) * 100) / 100;
  const moves = new Map();
  for (const e of newEntriesSince(S.ledger, before.ledgerTopId)) {
    if (e.account !== 'cash' && e.account !== 'savings') continue;
    const key = (e.label || 'Payment').replace(e.category === 'monthly_settlement' ? / \(\d{1,2}\/\d{4}\)$/ : /$^/, '');
    moves.set(key, Math.round(((moves.get(key) || 0) + num(e.delta)) * 100) / 100);
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
    vitalDeltas,
    storyLines,
    ageDelta: after.age - before.age,
    sceneWaiting: !!S.activeScene,
    gameOver: !!S.gameOver
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
  if (r.cashDelta !== 0 || r.moneyLines.length > 0) {
    const netCls = r.cashDelta > 0 ? 'text-good' : r.cashDelta < 0 ? 'text-bad' : '';
    const netTxt = r.cashDelta === 0 ? '±0' : signedMoney(r.cashDelta, S.country);
    const shown = r.moneyLines.slice(0, 6);
    const more = r.moneyLines.length - shown.length;
    moneyBits.push(`
      <div class="trc-money">
        <div class="muted">Cash change</div>
        <div class="trc-net mono ${netCls}">${esc(netTxt)}</div>
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

  const storyBit = r.storyLines.length
    ? `<div class="trc-story">${r.storyLines.map(t => `<div class="trc-story-line">${esc(t)}</div>`).join('')}</div>`
    : '';

  const quiet = r.cashDelta === 0 && !r.vitalDeltas.length && !r.storyLines.length && !r.sceneWaiting && !r.gameOver;

  const noteBits = [];
  if (S.player.age >= 18 && num(r.cashBalance) <= 0) {
    noteBits.push(`<div class="trc-note text-bad">${r.cashBalance < 0
      ? `Cash shortfall: ${esc(formatMoney(Math.abs(r.cashBalance), S.country))}. Being overdrawn lowers your credit score and raises stress each month. Cut costs, earn money or sell assets.`
      : 'No cash left. Paid activities need cash; free activities are still available.'}</div>`);
  }
  if (r.moneyLines.some(l => /Monthly (housing|living costs|debt payments|family support)/.test(l.label))) {
    noteBits.push('<div class="trc-note muted">Housing, living costs and other bills above are already paid from your cash. They are not extra charges.</div>');
  }
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
      ${storyBit}
      ${noteBits.join('')}
    </section>`;
}
