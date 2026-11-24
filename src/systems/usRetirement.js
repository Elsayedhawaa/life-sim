/* Source-calibrated simplified game model, not an SSA benefit calculation.
   SSA: earliest62,40credits;2026maximum examples2969at62/4152FRA/5181at70.
   https://www.ssa.gov/faqs/en/questions/KA-01897.html
   https://www.ssa.gov/benefits/retirement/planner/credits.html */
import{eraLocalCost,convertCurrency}from'../data/economy.js';
import{recordJournal}from'../core/schema.js';
export function recordUSCoveredEarnings(S,gross){
 if(S.country!=='usa'||!(gross>0))return;
 const rec=S.career.usSocialSecurity??={earningsByYear:{},earnings2026:0};
 const y=rec.earningsByYear[S.year]??={earnings:0,credits:0};
 const factor=eraLocalCost(10000,'usa',S.year)/10000;
 const covered=Math.min(gross/factor,Math.max(0,184500-y.earnings));
 y.earnings+=covered;y.credits=Math.min(4,Math.floor(y.earnings/1890));rec.earnings2026+=covered;rec.earningsByYear[S.year]=y;
}
export function usStatePension(S){
 const rec=S.career.usSocialSecurity;const age=S.player.age;
 const credits=Object.values(rec?.earningsByYear||{}).reduce((n,y)=>n+(y.credits||0),0);
 if(age<62||credits<40)return{monthly:0,credits,eligible:false};
 const claim=rec.claimAge??Math.min(70,Math.max(62,age));
 const cap=claim<67?2969+(4152-2969)*(claim-62)/5:4152+(5181-4152)*Math.min(3,claim-67)/3;
 // 35-year earnings denominator and conservative40%replacement proxy, not an exact PIA formula.
 const real=Math.min(cap,(rec.earnings2026||0)/420*.4*(claim<67?.7+.06*(claim-62):1+.08*(claim-67)));
 const usd=real*eraLocalCost(10000,'usa',S.year)/10000;
 return{monthly:Math.round(convertCurrency(usd,'usa',S.country,S.year)),credits,eligible:true,claimAge:claim};
}
export function settleUSRetirement(S){
 if(!S.career.retired)return null;
 const us=(S.career.retirementCountry||S.country)==='usa';
 if(us&&!S.career.usRetirementMigrationNoted){S.career.usRetirementMigrationNoted=true;recordJournal(S,'US retirement model: state benefit starts at62with40recorded credits. Missing history is not invented. Private savings use a finite balance. Simplified game estimate.','money');}
 const state=us?usStatePension(S):null;if(state?.eligible&&S.career.usSocialSecurity.claimAge==null)S.career.usSocialSecurity.claimAge=state.claimAge;
 /* Non-US state pension keeps pace with prices: like rent and family
    board, it is indexed once each January by the game price basket.
    Without this a pension fixed at retirement silently halves in real
    value over a long retirement while every cost around it rises. The
    US benefit already rescales through eraLocalCost in usStatePension. */
 if(!us&&S.career.statePensionMonthly>0){
  /* Baseline year first: a pension set in year Y (or an old save with no
     record) indexes from the NEXT January, never in its own year. */
  if(S.career.pensionIndexedYear==null)S.career.pensionIndexedYear=S.year;
  else if(S.month===1&&S.career.pensionIndexedYear<S.year){
   const prevYear=S.career.pensionIndexedYear;
   const ratio=eraLocalCost(10000,S.country,S.year)/eraLocalCost(10000,S.country,prevYear);
   S.career.statePensionMonthly=Math.round(S.career.statePensionMonthly*ratio);
   S.career.pensionIndexedYear=S.year;
  }
 }
 const paid=S.career.market?.pension?.paidOut;
 let draw=0;
 if(paid){if(paid.remaining==null){const elapsed=Math.max(0,(S.year-paid.year)*12+(S.month-paid.month));paid.remaining=Math.max(0,(paid.pot||0)-elapsed*(paid.monthlyTopUp||0));}draw=Math.min(paid.remaining,paid.monthlyTopUp||0);paid.remaining-=draw;}
 const stateAmount=us?state.monthly:(S.career.statePensionMonthly??Math.max(0,(S.career.monthlyPension||0)-(paid?.monthlyTopUp||0)));
 S.career.monthlyPension=stateAmount+draw;S.career.statePensionMonthly=stateAmount;S.career.privateDrawdownMonthly=draw;return S.career.monthlyPension;
}

export function retirementIncomePreview(S){
 if((S.career.retirementCountry||S.country)!=='usa'){const p=S.career.market?.pension?.paidOut;const remaining=p?.remaining??Math.max(0,(p?.pot||0)-Math.max(0,(S.year-(p?.year||S.year))*12+S.month-(p?.month||S.month))*(p?.monthlyTopUp||0));const draw=p?Math.min(remaining,p.monthlyTopUp||0):0;const state=S.career.statePensionMonthly??Math.max(0,(S.career.monthlyPension||0)-(p?.monthlyTopUp||0));return{monthly:state+draw,state,private:draw};}
 const state=usStatePension(S).monthly,paid=S.career.market?.pension?.paidOut;let draw=0;
 if(paid){const elapsed=Math.max(0,(S.year-paid.year)*12+(S.month-paid.month));const remaining=paid.remaining??Math.max(0,(paid.pot||0)-elapsed*(paid.monthlyTopUp||0));draw=Math.min(remaining,paid.monthlyTopUp||0);}
 return{monthly:state+draw,state,private:draw};
}
