import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import*as B from'../src/systems/businessEngine.js';
import*as M from'../src/systems/businessManager.js';
import{computeBusinessMonthFull}from'../src/systems/businessMonthly.js';
function run(country,id,seed,months){
  const S=createNewLifeState({country,seed,familyTier:'wealthy',birthYear:1995});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=30;S.money.cash=1e12;S.education.degrees.push('law');
  const bp=B.listAllBusinessVentures(S).find(b=>b.id===id);const ev=B.evaluateBusinessLaunch(S,bp);
  const sl=M.managerShortlist(S,{country,monthlyRev:ev.revLocal,capitalInvested:ev.capitalLocal,staffRoles:[]});
  B.createBusiness(S,id,'T',{runBy:'manager',manager:sl[2]||sl[0],mode:'full_time'});const biz=S.career.businesses.at(-1);
  const rows=[];
  for(let m=0;m<months;m++){S.month=(S.month%12)+1;if(S.month===1)S.year++;
    for(const a of [...(biz.managerAsks||[])]){try{M.answerManagerAsk(S,biz,a.id,true)}catch(e){}}
    const pl=computeBusinessMonthFull(S,biz);biz.lastPL=null;if(!pl)break;rows.push(pl);}
  return{biz,rows};
}
// GAME DESIGN: manager-run law firm year-1 pre-tax margin (after the manager's pay) near 30%. Sources: partner profit before owner pay 35-45% https://www.olmsteadassoc.com/blog/what-does-it-cost-to-operate-a-law-firm/ ; solo 25-35% https://www.leanlaw.co/blog/a-guide-to-setting-your-own-salary-as-a-solo-law-firm-owner-the-2025-data-driven-approach/ (blog sources, tuned near sourced ranges, not source-verified).
for(const c of['egy','usa','jpn']){let sum=0,n=0;for(const seed of[1,2,3,5,6]){const{rows}=run(c,'law_firm',seed,12);const r=rows.reduce((a,x)=>a+x.revenue,0),p=rows.reduce((a,x)=>a+x.profit,0);sum+=p/r;n++;}
  const avg=sum/n;assert.ok(avg>=0.22&&avg<=0.36,c+' law year-1 pre-tax '+(avg*100).toFixed(1)+'%');}
console.log('ok v221 law margin');
