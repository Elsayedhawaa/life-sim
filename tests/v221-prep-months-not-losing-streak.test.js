import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* Played run: a clinic showed "Losing money, 8 months in a row" with 6 of them spent preparing. A company that has not opened has no losing streak. */
const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e8;s.education.degrees=['medicine'];
const b=createBusiness(s,'enterprise_clinic','C',{mode:'full_time'}).biz;companyAction(s,b,'niche',0);
hireBusinessEmployee(s,b,'doctor');
const step=()=>{s.month=(s.month%12)+1;if(s.month===1)s.year++;settleHouseholdMonth(s);};
for(let i=0;i<3;i++)step();
assert.notEqual(b.enterprise.stage,'trading');assert.ok(b.lastPL&&b.lastPL.net<0,'preparing company pays wages: net is negative');
assert.equal(b.monthsLosing||0,0,'preparation months do not build a losing streak');
b.enterprise.progress=100;b.enterprise.stage='ready';step();assert.equal(b.monthsLosing||0,0,'ready but not open: still no streak');
companyAction(s,b,'premises');assert.equal(companyAction(s,b,'open').ok,true);
for(let i=0;i<4;i++)step();
if(b.lastPL.net<0)assert.ok(b.monthsLosing>=1,'a real trading loss still counts');
console.log('ok v221 prep months',b.monthsLosing,b.lastPL.net);
