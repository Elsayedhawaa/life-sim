import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness,listAllBusinessVentures}from'../src/systems/businessEngine.js';
import{companyAction,COMPANY_SECTORS}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
import{SECTOR_STAFF}from'../src/systems/companyWorkforce.js';
/* The guesthouse/small hotel sector: room-nights, housekeeping, front desk and night security, occupancy capped below 100% (US hotels averaged 63.0% occupancy in 2024, STR via costar.com). */
const s0=createNewLifeState({country:'gbr',seed:5});ensureExtendedState(s0);
assert.ok(listAllBusinessVentures(s0).some(v=>v.id==='enterprise_hospitality'),'listed as a venture');
const p=COMPANY_SECTORS.hospitality;assert.ok(p&&p.unit==='room-nights'&&p.roles.includes('security')&&p.roles.includes('receptionist')&&p.roles.includes('cleaner'));
assert.equal(SECTOR_STAFF.hospitality.primary,'cleaner');
const occ=p.capacity/(3*30);assert.ok(occ>=.6&&occ<=.8,'sellable nights are 60-80% of 3 rooms: '+occ);
for(const c of['gbr','usa','egy','ind']){
const s=createNewLifeState({country:c,seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e9;
const b=createBusiness(s,'enterprise_hospitality','H',{mode:'full_time'}).biz;assert.ok(companyAction(s,b,'niche',1).ok);b.enterprise.progress=100;b.enterprise.stage='ready';
assert.ok(hireBusinessEmployee(s,b,'cleaner').ok);assert.ok(hireBusinessEmployee(s,b,'security').ok);assert.ok(companyAction(s,b,'open').ok);
let last;for(let m=0;m<30;m++){s.month=(m%12)+1;if(m%12==0&&m)s.year++;settleHouseholdMonth(s);last=b.lastPL;assert.ok(last.units<=last.capacity+1e-6);}
assert.ok(last.units>0&&last.revenue>0,c+' books room-nights');}
console.log('ok v221 hospitality sector');
