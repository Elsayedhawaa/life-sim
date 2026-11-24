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
