import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction}from'../src/systems/companyLifecycle.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
import{companyDemandSwing,DEMAND_SWING_SIGMA}from'../src/systems/companyDemandSwing.js';
const S=createNewLifeState({country:'usa',seed:801});ensureExtendedState(S);S.year=2026;
/* deterministic, bounded, centred near 1, and different from month to month */
const b={id:'biz-1',enterprise:{sector:'farming'}},vals=[];
for(let m=1;m<=240;m++){S.year=2000+Math.floor((m-1)/12);S.month=((m-1)%12)+1;const v=companyDemandSwing(S,b);assert.equal(v,companyDemandSwing(S,b),'same month, same value');assert.ok(v>=.55&&v<=1.45);vals.push(v);}
const mean=vals.reduce((a,x)=>a+x,0)/vals.length,sd=Math.sqrt(vals.reduce((a,x)=>a+(x-mean)**2,0)/vals.length);
assert.ok(Math.abs(mean-1)<.05,'mean '+mean);assert.ok(sd>.08&&sd<.3,'farming sd '+sd);
assert.ok(new Set(vals).size>150,'varies');
const calm={id:'biz-1',enterprise:{sector:'clinic'}};let sd2=0;const cv=[];for(let m=1;m<=240;m++){S.year=2000+Math.floor((m-1)/12);S.month=((m-1)%12)+1;cv.push(companyDemandSwing(S,calm));}
const cm=cv.reduce((a,x)=>a+x,0)/cv.length;sd2=Math.sqrt(cv.reduce((a,x)=>a+(x-cm)**2,0)/cv.length);assert.ok(sd2<sd/2,'clinic steadier than farm');
assert.equal(companyDemandSwing(S,{id:'x'}),1,'legacy companies untouched');
assert.ok(DEMAND_SWING_SIGMA.farming>DEMAND_SWING_SIGMA.clinic);
/* through the real monthly settlement: two identical schools, different ids, book different revenue in the same months */
function school(id){const s=createNewLifeState({country:'usa',seed:801});ensureExtendedState(s);s.player.age=30;s.year=2026;s.month=1;s.money.cash=1e7;
const c=createBusiness(s,'enterprise_education','Co',{mode:'full_time'}).biz;c.id=id;companyAction(s,c,'niche','0');c.enterprise.stage='trading';c.enterprise.capacity=1000;c.enterprise.office=3;
c.staff=[{id:'t',name:'T',role:'teacher',wageLocal:1000,skill:80,morale:70,hiredYear:2026,hiredMonth:1}];
const r=[];for(let m=0;m<5;m++){s.month=m+1;settleHouseholdMonth(s);r.push(Math.round(c.lastPL.revenue));}return r;}
const a=school('biz-a'),d=school('biz-b'),a2=school('biz-a');
assert.deepEqual(a,a2,'same company, same months, same books');
assert.notDeepEqual(a,d,'different companies see different demand: '+a+' vs '+d);
console.log('ok v221 company demand swing');
