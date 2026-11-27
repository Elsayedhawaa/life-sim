import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{findVentureRow,evaluateBusinessLaunch,ventureViabilityWarningHtml}from'../src/systems/businessEngine.js';
/* The loss-risk warning is calibrated against 5 seeds x 24 months of settled months (manager-run, part-time, from home): ventures that settle profitable stay quiet, ventures that lose warn. */
const S=createNewLifeState({seed:7,country:'usa',birthYear:1990,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=35;S.money.cash=1e15;S.education.degrees=['cs','business','law','medicine','dentistry','pharmacy','engineering','architecture','veterinary','physiotherapy','nursing'];
const warned=id=>{const bp=findVentureRow(S,id);const ev=evaluateBusinessLaunch(S,bp);assert.ok(ev.ok,id);return ventureViabilityWarningHtml(S,bp,ev).length>0;};
for(const id of['mobile_shop','software_studio','clinic','dental_clinic','law_firm','logistics'])assert.equal(warned(id),false,id+' settles profitable, so no loss-risk warning');
for(const id of['tutoring_center','salon','cafe','restaurant','car_wash','gym','bookstore','contracting','community_pharmacy'])assert.equal(warned(id),true,id+' settles at a loss, so it warns');
console.log('ok v221 viability calibration');
