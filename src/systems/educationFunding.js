import {convertCurrency} from '../data/economy.js';
import {recordJournal} from '../core/schema.js';

export function educationFamilyPayers(S){
 return [S.relations?.fatherId,S.relations?.motherId].map(id=>S.people?.[id]).filter(p=>p?.alive&&p.career);
}
export function familyEducationFunds(S){return educationFamilyPayers(S).reduce((n,p)=>n+convertCurrency(Math.max(0,Number(p.career.savingsLocal)||0),p.residenceCountry||S.country,S.country,S.year),0);}
export function familyCoversUniversity(S,annualTuition,country=S.country){
 if(annualTuition<=0)return false;
 return country===S.homeCountry&&country===S.country&&familyEducationFunds(S)>=annualTuition;
}
export function chargeFamilyEducation(S,amount){
 if(amount<=0)return true;
 if(familyEducationFunds(S)+.01<amount)return false;
 let left=amount;
 for(const p of educationFamilyPayers(S)){
  const country=p.residenceCountry||S.country;const available=convertCurrency(Math.max(0,Number(p.career.savingsLocal)||0),country,S.country,S.year);const debit=Math.min(left,available);
  p.career.savingsLocal=Math.max(0,(Number(p.career.savingsLocal)||0)-convertCurrency(debit,S.country,country,S.year));left-=debit;if(left<=.01)break;
 }
 return left<=.01;
}
export function settleFamilyUniversityMonth(S){
 const u=S.education.university;if(!u)return;if(u.prepaidMonths>0){u.prepaidMonths--;u._tuitionPrepaidThisMonth=true;if(u.fundingSource==='family')u.familyMonthsRemaining=Math.max(0,(u.familyMonthsRemaining||0)-1);return;}u._tuitionPrepaidThisMonth=false;if(u.fundingSource!=='family')return;
 if(!(u.familyMonthsRemaining>0)){
  // No retroactive free family funding in legacy saves; renew against real funds.
  const renewal=Math.round(convertCurrency(u.annualTuition,u.country||S.country,S.country,S.year));
  if(chargeFamilyEducation(S,renewal)){u.familyMonthsRemaining=12;u.familyPaidTotal=(u.familyPaidTotal||0)+u.annualTuition;recordJournal(S,`Your parents paid another year of tuition at ${u.name}.`,'money');}
  else{u.fundingSource='self';u.scholarshipPct=0;recordJournal(S,`Your parents cannot renew tuition at ${u.name}. You now pay monthly tuition yourself.`,'money');return;}
 }
 u.familyMonthsRemaining--;
}
export function monthlyUniversityTuition(S){
 const u=S.education.university;if(!u||u._tuitionPrepaidThisMonth||u.prepaidMonths>0)return 0;
 if(u.fundingSource==='family')return 0;
 return Math.round(convertCurrency(u.annualTuition,u.country||S.country,S.country,S.year)*(1-(u.scholarshipPct||0))/12);
}

/* Opt-in fictional four-year local course. Not every adult child attends.
   Fund is restricted education money, not a gift back to the parent. */
export function childCourseQuote(S,childId){
 const ch=S.people[childId];if(!ch?.alive||!S.relations.childIds.includes(childId)||ch.age<18||ch.age>30)return null;
 const annual=convertCurrency(6000,'usa',ch.residenceCountry||S.country,S.year);
 return{annual:Math.round(annual),monthly:Math.round(annual/12),country:ch.residenceCountry||S.country};
}
export function enrollChildCourse(S,childId){
 const ch=S.people[childId],q=childCourseQuote(S,childId);if(!q)return{ok:false,msg:'This game course is available for your living children aged 18 to 30.'};
 if(ch.parentFundedCourse)return{ok:false,msg:'A course is already active or completed.'};
 const fund=convertCurrency(ch.educationFund?.balance||0,ch.educationFund?.country||q.country,S.country,S.year);
 const bill=convertCurrency(q.monthly,q.country,S.country,S.year);
 if(fund+Math.max(0,S.money.cash)<bill)return{ok:false,msg:'The education fund and cash cannot cover the first month.'};
 ch.parentFundedCourse={monthsRemaining:48,monthlyTuition:q.monthly,country:q.country,paid:0,paused:false};return{ok:true,msg:'Enrolled in the fictional four-year course. Education fund pays first, then your cash; unpaid tuition pauses study.'};
}
export function settleChildCourses(S){
 let cashCost=0;
 for(const id of S.relations.childIds||[]){const ch=S.people[id],c=ch?.parentFundedCourse;if(!ch?.alive||!c||c.monthsRemaining<=0)continue;
 const due=convertCurrency(c.monthlyTuition,c.country,S.country,S.year);const fund=ch.educationFund;const fundCountry=fund?.country||S.country;const available=convertCurrency(fund?.balance||0,fundCountry,S.country,S.year);const fromFund=Math.min(due,available);const fromCash=due-fromFund;
 if(Math.max(0,S.money.cash-cashCost)<fromCash){c.paused=true;continue;}
 if(fund)fund.balance=Math.max(0,fund.balance-convertCurrency(fromFund,S.country,fundCountry,S.year));cashCost+=fromCash;c.paused=false;c.monthsRemaining--;c.paid+=c.monthlyTuition;
 if(c.monthsRemaining===0){c.completed=true;ch.education??={};ch.education.degree='Game undergraduate course';recordJournal(S,`${ch.firstName} completed the funded four-year course. Tuition came from their education fund and your actual cash.`,'family');}
 }
 return Math.round(cashCost);
}
