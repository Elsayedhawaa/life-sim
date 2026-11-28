import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{findVentureRow}from'../src/systems/businessEngine.js';
/* GAME DESIGN: a community pharmacy's modelled profit margin before owner pay stays under 30%: after staff, a manager's wage and tax a manager-run pharmacy then nets about break-even to a small profit over 24 settled months (5 seeds, mean about +650/mo, like a cafe), where cost 9,800 netted -42k with 91% loss months. Tuned, not source-verified. Was 36%, then 17%. */
const S=createNewLifeState({country:'usa',seed:1});ensureExtendedState(S);S.year=2026;
const r=findVentureRow(S,'community_pharmacy');const m=(r.monthlyRevUsd2026-r.monthlyCostUsd2026)/r.monthlyRevUsd2026;
assert.ok(m>0.25&&m<0.3,'pharmacy margin '+m.toFixed(2));
console.log('ok v221 pharmacy margin');
