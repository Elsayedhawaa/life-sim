import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{findVentureRow,evaluateBusinessLaunch,ventureViabilityWarningHtml}from'../src/systems/businessEngine.js';
/* The loss-risk warning is calibrated against 5 seeds x 24 months of settled months (manager-run, part-time, from home): ventures that settle profitable stay quiet, ventures that lose warn. */
const S=createNewLifeState({seed:7,country:'usa',birthYear:1990,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=35;S.money.cash=1e15;S.education.degrees=['cs','business','law','medicine','dentistry','pharmacy','engineering','architecture','veterinary','physiotherapy','nursing'];
const warned=id=>{const bp=findVentureRow(S,id);const ev=evaluateBusinessLaunch(S,bp);assert.ok(ev.ok,id);return ventureViabilityWarningHtml(S,bp,ev).length>0;};
for(const id of['software_studio','dental_clinic','law_firm'])assert.equal(warned(id),false,id+' settles profitable, so no loss-risk warning');
/* contracting moved here on purpose (v2.21): its overhead was raised to the sourced 8-11% contractor net margin, and a part-time self-run USA contractor now loses in the 5-seed headless run (-5% pre-tax), so it warns. */
/* logistics moved here on purpose (v2.21): its overhead was raised to the sourced freight margin (trucking net 2.5-8%), and a part-time self-run freight business now loses in the 5-seed headless run (USA -13%, Egypt -16% pre-tax), so it warns. */
/* mobile_shop moved here on purpose: its margin was cut to the sourced electronics-retail range, so it now runs thin and warns. */
/* clinic moved here on purpose (v2.21): its overhead was raised so a manager-run clinic keeps about 11-14% (busy clinics 10-20%, AAFP three-clinic case about 5%), and a part-time self-run clinic now warns. */
for(const id of['logistics','contracting','mobile_shop','tutoring_center','salon','cafe','restaurant','car_wash','gym','bookstore','community_pharmacy','clinic'])assert.equal(warned(id),true,id+' settles at a loss, so it warns');
console.log('ok v221 viability calibration');
