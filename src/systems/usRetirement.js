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
 if(!S.career.retired||(S.career.retirementCountry||S.country)!=='usa')return null;
 if(!S.career.usRetirementMigrationNoted){S.career.usRetirementMigrationNoted=true;recordJournal(S,'US retirement model corrected: state benefit cannot begin before 62 and requires 40 recorded credits. Old saves have no verified US earnings history, so missing credits are not invented. Existing cash is unchanged. Private retirement savings now pay from a finite balance, not forever. This is a simplified game estimate.','money');}
 const state=usStatePension(S);if(state.eligible&&S.career.usSocialSecurity.claimAge==null)S.career.usSocialSecurity.claimAge=state.claimAge;
 const paid=S.career.market?.pension?.paidOut;let draw=0;
 if(paid){if(paid.remaining==null){const elapsed=Math.max(0,(S.year-paid.year)*12+(S.month-paid.month));paid.remaining=Math.max(0,(paid.pot||0)-elapsed*(paid.monthlyTopUp||0));}draw=Math.min(paid.remaining,paid.monthlyTopUp||0);paid.remaining-=draw;}
 S.career.monthlyPension=state.monthly+draw;S.career.statePensionMonthly=state.monthly;S.career.privateDrawdownMonthly=draw;return state.monthly+draw;
}

export function retirementIncomePreview(S){
 if((S.career.retirementCountry||S.country)!=='usa')return{monthly:S.career.monthlyPension||0,state:S.career.statePensionMonthly||0,private:S.career.privateDrawdownMonthly||0};
 const state=usStatePension(S).monthly,paid=S.career.market?.pension?.paidOut;let draw=0;
 if(paid){const elapsed=Math.max(0,(S.year-paid.year)*12+(S.month-paid.month));const remaining=paid.remaining??Math.max(0,(paid.pot||0)-elapsed*(paid.monthlyTopUp||0));draw=Math.min(remaining,paid.monthlyTopUp||0);}
 return{monthly:state+draw,state,private:draw};
}
