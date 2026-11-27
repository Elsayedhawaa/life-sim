import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* A GP sees about 29-31 consultations a working day (gov.ie supply-demand analysis; Pulse GP workload report): about 580 a month. A one-doctor clinic must book a doctor's real workload, and not lose money on it. */
for(const c of['gbr','usa','egy','deu']){
const s=createNewLifeState({country:c,seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e9;s.education.degrees=['medicine'];
const b=createBusiness(s,'enterprise_clinic','C',{mode:'full_time'}).biz;companyAction(s,b,'niche',0);b.enterprise.progress=100;b.enterprise.stage='ready';b.enterprise.office=1;
hireBusinessEmployee(s,b,'doctor');assert.ok(companyAction(s,b,'open').ok);
let net=0,units=0;for(let m=0;m<6;m++){s.month=m+1;settleHouseholdMonth(s);if(m>=3){net+=b.lastPL.net;units+=b.lastPL.units;}}
assert.ok(units/3>=380&&units/3<=620,c+' consultations a month '+units/3);assert.ok(net/3>0,c+' a one-doctor clinic is profitable');}
console.log('ok v221 clinic gp capacity');
