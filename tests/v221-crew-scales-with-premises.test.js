import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction,COMPANY_SECTORS}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* Bigger premises need a bigger crew: the same crew covers a site at the sector's operating size but not one two sizes up. A company saved before this rule (no crewScaled flag) keeps the old behaviour. */
function run(scaled){const p=COMPANY_SECTORS.farming;const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e10;
const b=createBusiness(s,'enterprise_farming','F',{mode:'full_time'}).biz;assert.ok(companyAction(s,b,'niche',0).ok);if(!scaled)delete b.enterprise.crewScaled;b.enterprise.progress=100;b.enterprise.stage='ready';
for(const r of p.production)assert.ok(hireBusinessEmployee(s,b,r).ok);assert.ok(companyAction(s,b,'premises').ok);s.month=2;assert.ok(companyAction(s,b,'premises').ok);assert.ok(companyAction(s,b,'open').ok);
for(let m=0;m<3;m++){s.month=m+3;settleHouseholdMonth(s);}return b.enterprise.lastTeam;}
const fresh=run(true),old=run(false);
assert.ok(fresh<100,'a new company two premises sizes above operating size with three staff is short of crew: '+fresh);
assert.equal(old,100,'an old save without the flag keeps the old crew rule');
console.log('ok v221 crew scales with premises');
