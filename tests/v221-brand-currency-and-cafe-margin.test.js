import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import*as B from'../src/systems/businessEngine.js';
import*as M from'../src/systems/businessManager.js';
import{computeBusinessMonthFull}from'../src/systems/businessMonthly.js';
function run(country,id,seed,months){
  const S=createNewLifeState({country,seed,familyTier:'wealthy',birthYear:1995});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=30;S.money.cash=1e12;
  const bp=B.listAllBusinessVentures(S).find(b=>b.id===id);const ev=B.evaluateBusinessLaunch(S,bp);
  const sl=M.managerShortlist(S,{country,monthlyRev:ev.revLocal,capitalInvested:ev.capitalLocal,staffRoles:[]});
  B.createBusiness(S,id,'T',{runBy:'manager',manager:sl[2]||sl[0],mode:'full_time'});const biz=S.career.businesses.at(-1);
  const rows=[];
  for(let m=0;m<months;m++){S.month=(S.month%12)+1;if(S.month===1)S.year++;
    for(const a of [...(biz.managerAsks||[])]){try{M.answerManagerAsk(S,biz,a.id,true)}catch(e){}}
    const pl=computeBusinessMonthFull(S,biz);biz.lastPL=null;if(!pl)break;rows.push(pl);}
  return{biz,rows};
}
/* Brand: after a year the brand value is the same order of size in every country (it used to be 50x larger in Japan). */
const brand={};for(const c of['egy','usa','tur','jpn'])brand[c]=run(c,'cafe',5,12).biz.brandValue;
for(const c of['usa','tur','jpn'])assert.ok(brand[c]>brand.egy*0.5&&brand[c]<brand.egy*2,c+' brand '+brand[c]+' vs egypt '+brand.egy);
/* Egypt itself does not move: its money unit is exactly 1. */
assert.equal(B.ventureWageScale('egy',2025),1);
/* Cafe and restaurant: manager-run year-1 pre-tax margin across seeds averages near the published 5% (0-15% range), not the old 15-21%. */
for(const id of['cafe','restaurant'])for(const c of['egy','usa']){
  let sum=0,n=0;for(const seed of[1,2,3,5,6]){const{rows}=run(c,id,seed,12);const r=rows.reduce((a,x)=>a+x.revenue,0),p=rows.reduce((a,x)=>a+x.profit,0);sum+=p/r;n++;}
  const avg=sum/n;assert.ok(avg>=0.03&&avg<=0.13,id+' '+c+' year-1 pre-tax '+(avg*100).toFixed(1)+'%');
}
console.log('ok v221 brand currency and cafe margin');
