import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction,COMPANY_SECTORS,nicheCapacity}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* Retail and tutoring niches sell at different volumes (a grocery item and an electronics item are not sold at the same rate); a minimal crew in four countries earns a thin, non-losing margin before owner pay. */
for(const id of['retail','education','food','construction','farming','manufacturing','logistics','pharmacy','clinic']){const p=COMPANY_SECTORS[id];
for(const c of['usa','gbr','ind']){for(let n=0;n<p.choices.length;n++){
const s=createNewLifeState({country:c,seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e10;s.education.degrees=['pharmacy','medicine'];
const b=createBusiness(s,'enterprise_'+id,'F',{mode:'full_time'}).biz;assert.ok(companyAction(s,b,'niche',n).ok);
assert.equal(b.enterprise.capacity,Math.round(p.capacity*(p.choices[n][3]||1)),'niche sets its own capacity');assert.equal(nicheCapacity(p,b.enterprise),b.enterprise.capacity);
b.enterprise.progress=100;b.enterprise.stage='ready';let k=0;const fill=()=>{if(b.enterprise.stage==='trading'&&(b.enterprise.lastTeam||100)<100&&k<40){hireBusinessEmployee(s,b,p.production[k%p.production.length]);k++;}for(const r of p.production)if(!b.staff.some(w=>w.role===r))assert.ok(hireBusinessEmployee(s,b,r).ok);};fill();if(p.minPremises)for(let i=0;i<p.minPremises;i++)assert.ok(companyAction(s,b,'premises').ok);assert.ok(companyAction(s,b,'open').ok);
let rev=0,pr=0;for(let m=0;m<36;m++){s.month=(m%12)+1;if(m%12==0&&m)s.year++;fill();if(p.stock&&b.enterprise.stock<b.enterprise.capacity*.5)companyAction(s,b,'order','full');settleHouseholdMonth(s);
if(m>=24){const l=b.lastPL;rev+=l.revenue;pr+=l.revenue-l.wages-l.rent-l.manager-l.fixed-(p.stock?l.units*l.unitCost:l.variableCost);}}
const margin=pr/rev;assert.ok(margin>-.06&&margin<(id==="clinic"&&n===0?.45:.2),`${id}/${n} ${c} margin ${margin.toFixed(2)}`);}}}
console.log('ok v221 niche volume');
