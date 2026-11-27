import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness,listAllBusinessVentures}from'../src/systems/businessEngine.js';
import{companyAction,COMPANY_SECTORS}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
import{SECTOR_STAFF}from'../src/systems/companyWorkforce.js';
/* The cleaning and security contractor: billed service-hours, labour is most of the cost (contract cleaning and guarding run on labour of about 65-80% of revenue, thin net margins). */
const s0=createNewLifeState({country:'gbr',seed:5});ensureExtendedState(s0);
assert.ok(listAllBusinessVentures(s0).some(v=>v.id==='enterprise_facility'),'listed as a venture');
const p=COMPANY_SECTORS.facility;assert.ok(p&&p.unit==='service-hours'&&p.roles.includes('cleaner')&&p.roles.includes('security'));
assert.equal(SECTOR_STAFF.facility.primary,'cleaner');
for(const c of['gbr','usa','egy','deu','ind']){
const s=createNewLifeState({country:c,seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e9;
const b=createBusiness(s,'enterprise_facility','F',{mode:'full_time'}).biz;assert.ok(companyAction(s,b,'niche',2).ok);b.enterprise.progress=100;b.enterprise.stage='ready';b.enterprise.office=1;
for(const r of['cleaner','cleaner','security','bookkeeper'])assert.ok(hireBusinessEmployee(s,b,r).ok);assert.ok(companyAction(s,b,'open').ok);
let last;for(let m=0;m<24;m++){s.month=(m%12)+1;if(m%12==0&&m)s.year++;companyAction(s,b,'order','full');settleHouseholdMonth(s);last=b.lastPL;assert.ok(last.units<=last.capacity+1e-6);}
assert.ok(last.units>0&&last.revenue>0,c+' books service-hours');
const share=last.wages/last.revenue;assert.ok(share>=.55&&share<=.8,c+' labour share '+share.toFixed(2));
assert.ok(last.net>0&&last.net/last.revenue<.2,c+' thin positive margin '+(last.net/last.revenue).toFixed(2));}
console.log('ok v221 facility sector');
