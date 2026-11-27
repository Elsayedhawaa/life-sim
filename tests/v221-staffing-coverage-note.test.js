import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction,renderCompany}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* A trading company whose production crew covers less than the work the site needs says so on Operations, and stays silent when covered. */
function run(roles){const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e9;
const b=createBusiness(s,'enterprise_facility','F',{mode:'part_time'}).biz;companyAction(s,b,'niche',2);b.enterprise.progress=100;b.enterprise.stage='ready';
for(const r of roles)assert.ok(hireBusinessEmployee(s,b,r).ok);assert.ok(companyAction(s,b,'open').ok);
for(let m=0;m<3;m++){s.month=m+1;companyAction(s,b,'order','full');settleHouseholdMonth(s);}
return renderCompany(s,b,'operations');}
const thin=run(['bookkeeper']),full=run(['cleaner','security','cleaner']);
assert.ok(/crew covered \d+% of the work this site needs; hire more cleaner or security/.test(thin),'thin crew gets a note');
assert.ok(!/crew covered/.test(full),'covered crew gets no note');
console.log('ok v221 staffing coverage note');
