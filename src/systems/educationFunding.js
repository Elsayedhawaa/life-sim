import {convertCurrency,eraLocalCost} from '../data/economy.js';
import {indexNpcIncome} from './npcIncomeIndex.js';
import {recordJournal,walletMove,queueScene,nextId} from '../core/schema.js';
import {narrativeLoanQuote} from './narrativeLoans.js';

export function educationFamilyPayers(S){
 return [S.relations?.fatherId,S.relations?.motherId].map(id=>S.people?.[id]).filter(p=>p?.alive&&p.career);
}
/* FAMILY MONEY MODEL (game rules, not real-world statistics).
   1. Parents' savings used to be a one-time number set at birth: salaries
      never added to it, so even a rich family's pot only shrank with school
      fees. Now each living parent saves a share of their real income, by
      family tier, month by month (never counted twice: a "through" month is
      stored). An existing life gets ONE catch-up over the years lived, using
      the parent's current pay scaled back by the era price index, so it is
      not a flat guess; at most 18 years.
   2. The top tiers also have a family reserve (inherited assets, trusts):
      a number of years of household income, fixed the first time education
      needs it and then drawn down for real. It is finite and recorded.
      wealthy 8 years, upper-middle 3, middle half a year, others none. */
const PARENT_SAVE_RATE={wealthy:.30,upper_middle:.20,middle:.10,working:.05,struggling:.02};
const FAMILY_RESERVE_YEARS={wealthy:8,upper_middle:3,middle:.5,working:0,struggling:0};
function priceIndex(S,year){return eraLocalCost(1000,S.country,year)/1000;}
export function accrueParentalSavings(S){
 if(!S?.education||!S.player)return;
 const now=S.year*12+(S.month||1);
 const acc=S.education.parentSavingsAccrual??(S.education.parentSavingsAccrual={through:null});
 const rate=PARENT_SAVE_RATE[S.familyTier]??.10;
 const payers=educationFamilyPayers(S);
 for(const p of payers)indexNpcIncome(S,p);
 if(acc.through==null){
  /* one-time catch-up: each lived year at that year's price level */
  const lived=Math.min(18,Math.max(0,Math.floor(S.player.age||0)));
  const idxNow=priceIndex(S,S.year)||1;
  let scale=0;for(let i=1;i<=lived;i++){scale+=Math.min(1,(priceIndex(S,S.year-i)||idxNow)/idxNow)*12;}
  for(const p of payers){const m=Math.max(0,Number(p.career.monthlyIncomeLocal)||0);p.career.savingsLocal=(Number(p.career.savingsLocal)||0)+Math.round(m*rate*scale);}
  acc.through=now;acc.catchUp=true;return;
 }
 const months=Math.max(0,Math.min(216,now-acc.through));
 acc.through=now;
 if(months<=0)return;
 for(const p of payers){const m=Math.max(0,Number(p.career.monthlyIncomeLocal)||0);p.career.savingsLocal=(Number(p.career.savingsLocal)||0)+Math.round(m*rate*months);}
}
function reserveIn(S,local){const r=S.education.familyReserve;const c=r?.country||S.country;return c===S.country?local:convertCurrency(local,c,S.country,S.year);}
function familyReserve(S){
 const e=S.education;
 if(e.familyReserve&&!e.familyReserve.eraIndexed){const had=e.familyReserve;for(const p of educationFamilyPayers(S))indexNpcIncome(S,p);if(!had.drawn)e.familyReserve=null;else had.eraIndexed=true;}
 if(!e.familyReserve){
  for(const p of educationFamilyPayers(S))indexNpcIncome(S,p);
  const income=educationFamilyPayers(S).reduce((n,p)=>n+Math.max(0,Number(p.career.monthlyIncomeLocal)||0)*12,0);
  const years=FAMILY_RESERVE_YEARS[S.familyTier]??0;
  e.familyReserve={local:Math.round(income*years),years,setYear:S.year,country:S.homeCountry||S.country,eraIndexed:true};
 }
 return e.familyReserve;
}
export function familyEducationFunds(S){accrueParentalSavings(S);const saved=educationFamilyPayers(S).reduce((n,p)=>n+convertCurrency(Math.max(0,Number(p.career.savingsLocal)||0),p.residenceCountry||S.country,S.country,S.year),0);return saved+(educationFamilyPayers(S).length?reserveIn(S,familyReserve(S).local):0);}
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
 if(left>.01&&educationFamilyPayers(S).length){const r=familyReserve(S);const have=reserveIn(S,r.local);const d=Math.min(left,have);r.local=Math.max(0,r.local-(have>0?r.local*(d/have):0));r.drawn=true;left-=d;}
 return left<=.01;
}
export const SCHOLARSHIP_RENEWAL_MIN_SKILL=60;
/* A scholarship is renewed on results at each academic-year boundary: academic skill must stay at or above the standing. One miss is probation (funding kept, warned). A second miss in a row ends the award and tuition is paid by the student monthly. */
export function reviewScholarshipRenewal(S){
 const u=S.education.university;if(!u||u.fundingSource!=='scholarship'||!(u.scholarshipPct>0))return;
 const el=Number(u.elapsedMonths)||0;if(el<=0||el%12!==0||u.renewalReviewedAt===el)return;u.renewalReviewedAt=el;
 const skill=Math.round(S.education.academicSkill||0);
 if(skill>=SCHOLARSHIP_RENEWAL_MIN_SKILL){u.probation=false;recordJournal(S,`Your scholarship at ${u.name} was renewed: your results (${skill}%) met the ${SCHOLARSHIP_RENEWAL_MIN_SKILL}% standing.`,'career');return;}
 if(!u.probation){u.probation=true;recordJournal(S,`Scholarship probation at ${u.name}: your results (${skill}%) are under the ${SCHOLARSHIP_RENEWAL_MIN_SKILL}% standing. Funding continues for now. Another weak year ends it.`,'career');return;}
 u.fundingSource='scholarship_ended';u.scholarshipPct=0;u.scholarshipLost=true;u.probation=false;
 recordJournal(S,`Your scholarship at ${u.name} ended: results were under the ${SCHOLARSHIP_RENEWAL_MIN_SKILL}% standing two years running (${skill}% now). This is a game renewal rule. Choose how to pay the rest of the degree.`,'money');
 const annual=Math.round(convertCurrency(u.annualTuition,u.country||S.country,S.country,S.year));const yearsLeft=Math.max(1,(u.totalYears||Math.ceil(el/12)+1)-Math.floor(el/12));
 const canFamily=familyCoversUniversity(S,annual,u.country||S.country);
 const canLoan=!(S.money.loans||[]).some(l=>l.narrativeKind==='student')&&S.player.age>=18;
 const choices=[];
 if(canFamily)choices.push({label:`Ask your parents to pay the next year (${annual.toLocaleString('en-US')})`,effect:(st)=>{const x=st.education.university;if(x&&chargeFamilyEducation(st,annual)){x.fundingSource='family';x.familyMonthsRemaining=12;x.familyPaidTotal=(x.familyPaidTotal||0)+annual;recordJournal(st,'Your parents agreed to pay another year of tuition.','money');}else if(x){x.fundingSource='self';recordJournal(st,'Your parents could not cover it after all. You pay tuition monthly yourself.','money');}}});
 if(canLoan)choices.push({label:`Game student loan for the remaining ${yearsLeft} year(s): ${(annual*yearsLeft).toLocaleString('en-US')} at 6%, 60 payments after you finish`,effect:(st)=>{const x=st.education.university;if(!x)return;const q=narrativeLoanQuote(st,'student',annual*yearsLeft);if(!q)return;st.money.loans.push({...q,id:nextId(st,'narrloan'),label:'Game student loan, 6% annual',country:st.country,narrativeKind:'student',missedMonths:0});x.fundingSource='loan';recordJournal(st,'You took a game student loan to cover the rest of your degree. Payments start after you finish.','money');}});
 choices.push({label:`Pay tuition myself, ${Math.round(annual/12).toLocaleString('en-US')} a month`,effect:(st)=>{const x=st.education.university;if(x)x.fundingSource='self';}});
 queueScene(S,{key:`scholarship_lost_${u.name}_${el}`,category:'school',title:'Your scholarship has ended',text:`Your results stayed under the ${SCHOLARSHIP_RENEWAL_MIN_SKILL}% standing for two years running, so the award at ${u.name} ends. (Renewal on results is a game rule, not any real scheme's policy.) Tuition is ${annual.toLocaleString('en-US')} a year. How will you pay for the rest of the degree?`,choices},true);
}
export function settleFamilyUniversityMonth(S){
 reviewScholarshipRenewal(S);
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
 if(u.fundingSource==='family'||u.fundingSource==='loan'||u.fundingSource==='scholarship_ended')return 0;
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

export function childSchoolQuote(S,childId,tier='standard'){
 const ch=S.people[childId];if(!ch?.alive||!S.relations.childIds.includes(childId)||ch.age<6||ch.age>=18||!['standard','international'].includes(tier))return null;
 const country=ch.residenceCountry||S.country,annual=Math.round(convertCurrency(tier==='international'?9000:2400,'usa',country,S.year));
 return{childId,tier,country,annual,cost:Math.round(convertCurrency(annual,country,S.country,S.year)),from:S.year*12+S.month,until:S.year*12+S.month+12};
}
export function enrollChildSchoolYear(S,childId,tier='standard'){
 const q=childSchoolQuote(S,childId,tier);if(!q)return{ok:false,msg:'School years cover living children aged6-17.'};const ch=S.people[childId];
 if(ch.schoolEnrollment?.until>q.from)return{ok:false,msg:'This school year is already paid; no extra charge.'};
 if(S.money.cash<q.cost)return{ok:false,msg:'Not enough cash for the prepaid school year.'};
 walletMove(S,-q.cost,'Prepaid '+tier+' game school year for '+ch.firstName,'education');
 ch.schoolEnrollment={...q,paidLocal:q.cost,paymentCountry:S.country,status:'prepaid',label:tier==='international'?'Game international school':'Game local school'};
 ch.schoolHistory??=[];ch.schoolHistory.push({...ch.schoolEnrollment});
 recordJournal(S,'Prepaid12months at '+ch.schoolEnrollment.label+' for '+ch.firstName+'. No employer subsidy or automatic renewal.','family');
 return{ok:true,msg:'School year recorded and prepaid.'};
}
