// GAME DESIGN: a clinic and a logistics firm no longer clear a manager-run margin far above sourced ranges.
// Sources: Census QSS physician offices 8.2% net (2025), https://www.datadrivendoctor.com/blog/physician-office-profit-margin-census-2025 ;
// trucking 3.8% net / 15.6% EBITDA, https://www.insytesbi.com/benchmarks/trucking/ ; Damodaran trucking 6.9% operating, hospitals 13.4% operating.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { findVentureRow } = await import('../src/systems/businessEngine.js');
const S = createNewLifeState({ country: 'usa', seed: 1 }); ensureExtendedState(S); S.year = 2026;
const m = id => { const r = findVentureRow(S, id); return (r.monthlyRevUsd2026 - r.monthlyCostUsd2026) / r.monthlyRevUsd2026; };
assert.ok(m('clinic') < 0.4, 'clinic row margin ' + m('clinic').toFixed(2));
assert.ok(m('logistics') < 0.4, 'logistics row margin ' + m('logistics').toFixed(2));
console.log('ok v221 manager-run margins');
