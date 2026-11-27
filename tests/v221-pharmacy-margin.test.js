import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{findVentureRow}from'../src/systems/businessEngine.js';
/* GAME DESIGN: a community pharmacy's modelled profit margin before owner pay stays under 20%, tuned near published retail pharmacy ranges (not source-verified). Was 36%. */
const S=createNewLifeState({country:'usa',seed:1});ensureExtendedState(S);S.year=2026;
const r=findVentureRow(S,'community_pharmacy');const m=(r.monthlyRevUsd2026-r.monthlyCostUsd2026)/r.monthlyRevUsd2026;
assert.ok(m>0.08&&m<0.2,'pharmacy margin '+m.toFixed(2));
console.log('ok v221 pharmacy margin');
