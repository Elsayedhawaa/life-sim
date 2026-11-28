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
// GAME DESIGN: manager-run year-1 pre-tax margin (after the manager's pay), Egypt, mean of 5 seeds. Tuned near sourced ranges, not source-verified (blog and survey summaries):
// pharmacy 3-12% (NCPA pharmacy figures via https://www.pccacompounding.com/resources/the-profitability-of-a-compounding-pharmacy/); CPA firm 35-40% before partner pay https://christopholivierconsulting.com/accounting-firm-average-revenue/ ;
// law 35-45% before owner pay https://www.olmsteadassoc.com/blog/what-does-it-cost-to-operate-a-law-firm/ ; architecture 13-20% https://scalearc.io/research/architecture-firm-benchmarks ; consulting 7.7% pre-tax IRS (https://vantainsights.com/insights/consulting-firm-profit-margins), small firms higher;
// dental 30-40% https://porterkinney.com/tax-articles/how-does-your-dental-practice-compare-benchmarking-key-financial-metrics/ ; vet net operating 8-15% https://revenuerounds.com/veterinary-practice-benchmarks/ ; physio 19-36% https://clinicmarketingos.com/benchmarks/physical-therapy-clinic-profit-margin ;
// software agency 11-13% net, top decile 30-35% https://agencypro.app/statistics/agency-profitability-statistics ; contractor 8-11% https://buildern.com/resources/blog/construction-financial-benchmarks/
const want={pharmacy:[5,15],accounting_firm:[23,34],audit_tax_firm:[23,34],law_chambers:[24,36],architecture_studio:[12,24],interior_arch:[12,24],consulting:[14,26],dental_clinic:[22,34],dental_center:[22,34],vet_clinic:[10,20],physio_clinic:[16,28],software_studio:[14,26],saas_ai_agency:[19,31],contracting:[7,17]};
for(const[id,[lo,hi]]of Object.entries(want)){let sum=0,n=0;for(const seed of[1,2,3,5,6]){const{rows}=run('egy',id,seed,12);const r=rows.reduce((a,x)=>a+x.revenue,0),p=rows.reduce((a,x)=>a+x.profit,0);if(r>0){sum+=100*p/r;n++;}}
  const avg=sum/n;assert.ok(avg>=lo&&avg<=hi,id+' year-1 pre-tax '+avg.toFixed(1)+'% outside '+lo+'-'+hi);}
console.log('ok v221 professional margins');
