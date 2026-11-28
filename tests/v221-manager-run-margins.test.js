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
assert.ok(m('gym_franchise') < 0.45, 'gym franchise row margin ' + m('gym_franchise').toFixed(2));
assert.ok(m('mobile_shop') < 0.5, 'mobile shop row margin ' + m('mobile_shop').toFixed(2));
assert.ok(m('cold_logistics') < 0.34, 'cold logistics row margin ' + m('cold_logistics').toFixed(2));
// gym: HFA 23.6% median EBITDA, net 8-15% https://www.healthandfitness.org/2025-fitness-industry-benchmarking-report/ and https://vervepulse.io/state-of-gym-operations-2026 ; consumer electronics retail net about -9% to 6% (Damodaran via https://christopholivierconsulting.com/profit-margin-by-industry/)
console.log('ok v221 manager-run margins');
