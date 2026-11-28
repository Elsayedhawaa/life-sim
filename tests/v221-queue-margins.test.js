import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import*as B from'../src/systems/businessEngine.js';
// GAME DESIGN: manager-run margin share of expected full-time sales, Egypt 2025, kept inside published small-business ranges (tuned near sourced ranges, not source-verified): independent lab median pre-tax 11.3% (Chi Solutions via CLP 2015); tutoring 12-22%; dog grooming 10-20%; brokerage median EBITDA 1.7%, profitable firms 3.4%; solar contractors 7%; small car rental 12-18%; roasters 8-20%; wedding planning about 14%; childcare 5-15%.
const band={diagnostic_lab:[3,16],exam_academy:[5,25],academy:[5,25],pet_grooming:[5,25],prop_brokerage:[-5,12],solar_epc:[0,14],car_rental_fleet:[5,20],roastery_chain:[5,20],wedding_planner:[5,22],nursery_preschool:[3,18]};
const S=createNewLifeState({seed:5,country:'egy',birthYear:1995,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=35;
const out=[];
for(const[id,[lo,hi]]of Object.entries(band)){const bp=B.findVentureRow(S,id);const e=B.evaluateBusinessLaunch(S,bp);const m=100*(e.expectedRevFullTimeHome-e.monthlyCostManagerRunHome)/e.expectedRevFullTimeHome;out.push(id+' '+m.toFixed(0));assert.ok(m>=lo&&m<=hi,id+' margin '+m.toFixed(1)+' outside '+lo+'..'+hi);}
console.log('ok v221 queue margins',out.join(', '));
