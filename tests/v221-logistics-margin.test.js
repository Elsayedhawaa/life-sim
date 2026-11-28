import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import*as B from'../src/systems/businessEngine.js';
import*as M from'../src/systems/businessManager.js';
import{computeBusinessMonthFull}from'../src/systems/businessMonthly.js';
function run(country,id,seed,months){
  const S=createNewLifeState({country,seed,familyTier:'wealthy',birthYear:1995});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=30;S.money.cash=1e13;
  const bp=B.listAllBusinessVentures(S).find(b=>b.id===id);const dg=bp.reqMajor||bp.requiresDegree;if(dg)S.education.degrees.push(dg);const ev=B.evaluateBusinessLaunch(S,bp);
  const sl=M.managerShortlist(S,{country,monthlyRev:ev.revLocal,capitalInvested:ev.capitalLocal,staffRoles:[]});
  B.createBusiness(S,id,'T',{runBy:'manager',manager:sl[2]||sl[0],mode:'full_time'});const biz=S.career.businesses.at(-1);
  const rows=[];
  for(let m=0;m<months;m++){S.month=(S.month%12)+1;if(S.month===1)S.year++;
    for(const a of [...(biz.managerAsks||[])]){try{M.answerManagerAsk(S,biz,a.id,true)}catch(e){}}
    const pl=computeBusinessMonthFull(S,biz);biz.lastPL=null;if(!pl)break;rows.push(pl);}
  return{biz,rows};
}
// GAME DESIGN: manager-run freight year-1 pre-tax margin near 8%. Tuned near sourced ranges, not source-verified: trucking net 2.5-8% https://www.fintruck.io/blog/is-trucking-business-profitable-what-the-numbers-look-like-in-2026 ; owner-operators 5-15% https://truckingcalc.com/blog/owner-operator-profit-margin/ ; forwarders 3-6% https://blog.mmlogistix.com/2026/04/15/the-leaky-funnel-freight-forwarding-margins-where-the-money-is-really-made-and-lost/ ; a listed reefer carrier netted 2.0% in 2025 https://tickermode.com/stock/MRTN
for(const id of['logistics','cold_logistics'])for(const c of['egy','usa']){let sum=0,n=0;for(const seed of[1,2,3,5,6]){const{rows}=run(c,id,seed,12);const r=rows.reduce((a,x)=>a+x.revenue,0),p=rows.reduce((a,x)=>a+x.profit,0);if(r>0){sum+=100*p/r;n++;}}
  const avg=sum/n;assert.ok(avg>=3&&avg<=13,id+' '+c+' year-1 pre-tax '+avg.toFixed(1)+'%');}
console.log('ok v221 logistics margin');
