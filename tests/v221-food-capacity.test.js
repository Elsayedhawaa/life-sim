import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* A small cafe team of three serves on the order of 100+ orders a day, not 25. The old 700 orders a month made every staged cafe lose money at any wage level (hosted US play: 652 orders, 9.1k sales, 21k costs). */
for(const c of['usa','gbr','egy','deu']){
const s=createNewLifeState({country:c,seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e9;
const b=createBusiness(s,'enterprise_food','C',{mode:'full_time'}).biz;companyAction(s,b,'niche',1);b.enterprise.progress=100;b.enterprise.stage='ready';b.enterprise.office=1;
for(const r of['barista','chef','waiter'])hireBusinessEmployee(s,b,r);assert.ok(companyAction(s,b,'open').ok);
let net=0,units=0,sales=0;for(let m=0;m<14;m++){s.month=(m%12)+1;if(m===12)s.year++;companyAction(s,b,'order','full');settleHouseholdMonth(s);if(m>=11){net+=b.lastPL.net;units+=b.lastPL.units;}}
assert.ok(units/2>=1200,c+' orders a month '+units/2);assert.ok(net/2>0,c+' a staffed cafe is profitable at maturity: '+net/2);}
console.log('ok v221 food capacity');
