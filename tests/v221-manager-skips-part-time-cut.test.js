import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{computeBusinessMonth}from'../src/systems/businessEngine.js';
/* Reviewer finding: the part-time cuts (0.6 revenue, 0.75 other costs) are the owner's 18 hours a week. With a manager set they no longer apply. Owner-run part-time keeps them. */
const mk=(mode,manager)=>{const S=createNewLifeState({country:'usa',seed:4});ensureExtendedState(S);S.year=2026;S.month=3;
const biz={id:'b1',typeId:'cafe',name:'Test cafe',country:'usa',figuresCurrency:'usa',mode,monthlyRev:20000,monthlyCost:8000,premises:{kind:'shop',monthlyRentLocal:0,conditionPct:90},staff:[],ownerManaged:false,...(manager?{manager:{personId:null,wageLocal:3000,loyalty:70,skill:60}}:{})};
S.career.businesses=[biz];return[S,biz]};
const rev=(m,mg)=>{const[S,b]=mk(m,mg);const r=computeBusinessMonth(S,b);return r&&(r.revenue!==undefined?r:r.pl||r)};
const pt=rev('part_time',false),ptm=rev('part_time',true),ft=rev('full_time',true);
assert.ok(pt.revenue>0&&ptm.revenue>pt.revenue,`manager-run part-time earns more than owner-run part-time: ${ptm.revenue} vs ${pt.revenue}`);
assert.ok(Math.abs(ptm.revenue-ft.revenue)<=1,`with a manager part-time equals full-time revenue: ${ptm.revenue} vs ${ft.revenue}`);
console.log('ok v221 manager skips part-time cut');
