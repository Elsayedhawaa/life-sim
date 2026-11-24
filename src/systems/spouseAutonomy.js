import {clamp,hashSeed} from '../core/rng.js';
import {recordJournal,walletMove} from '../core/schema.js';
import {eraSalary,eraLocalCost} from '../data/economy.js';
import {getCountry} from '../data/countries.js';
import {personMind,rememberChoice} from './personMind.js';
import {checkSocialEnergy,spendSocialEnergy,noteSocialContact,monthsSinceContact} from './socialEnergy.js';
import {moveIntoOwnedProperty} from './economyEngine.js';
export const spouseMind=personMind;
export const SPOUSE_DECISIONS={career:'I accepted a job. Can we share the bills?',kids:'I would like a child. Are you ready?',no_kids:'I do not want a child.',budget:'Can we cut our household spending?',move:'Can we move into our other home?',spending:'Can we buy something for the house?',boundary:'I need us to spend time together.',reconcile:'I would like to try again.'};
export function spouseRequestCost(S,kind){return kind==='spending'?Math.round(eraLocalCost(getCountry(S.country).monthlyBasket2026.foodAdult*.5,S.country,S.year)):0;}
export function tickSpouseAutonomy(S){
 const now=S.year*12+S.month;
 for(const id of S.relations.spouseIds||[]){const sp=S.people[id];if(!sp?.alive)continue;const m=personMind(S,sp),r=sp.relationshipProgress??={stage:'together'};
 if(m.pending){if(now-m.pending.at>=3){sp.rel.trust=clamp(sp.rel.trust-4);rememberChoice(S,sp,m.pending.kind,'unanswered');m.pending=null;}continue;}
 if(m.lastDecision!=null&&now-m.lastDecision<6)continue;
 const hash=hashSeed(`${S.seed}|${sp.id}|spouse|${now}`);
 // Spread initiative over time rather than asking every spouse on one date.
 if(hash%6!==0)continue;
 if(r.stage==='separated'){
  if(!r.courtCase&&sp.rel.trust>=65&&sp.rel.affection>=60){m.pending={kind:'reconcile',at:now};m.goal='reconcile';m.lastDecision=now;}
  continue;
 }
 if(sp.rel.trust<25&&sp.rel.affection<30&&m.independence>55){r.stage='separated';r.separatedAt=now;sp.householdWith=sp.id;S.marriage.tryingForBaby=false;rememberChoice(S,sp,'leave','moved out');recordJournal(S,`${sp.firstName} moved out. Trust had broken down.`,'family');continue;}
 let kind;
 if(sp.rel.trust<45||sp.rel.respect<35)kind='boundary';
 else if(!m.wantsChildren&&S.marriage.tryingForBaby){S.marriage.tryingForBaby=false;kind='no_kids';}
 else {
  const options=[];
  if(monthsSinceContact(S,sp)>=3)options.push('boundary');
  if(m.ambition>65&&!m.careerActed&&sp.age>=22&&sp.age<63&&!(sp.career.monthlyIncomeLocal>0))options.push('career');
  const femaleAge=sp.gender==='f'?sp.age:S.player.age;
  if(m.wantsChildren&&m.family>60&&S.relations.childIds.length<2&&femaleAge<43&&sp.gender!==S.player.gender&&!S.marriage.pregnancy&&!S.marriage.tryingForBaby)options.push('kids');
  if(m.thrift>65&&S.money.lifestyleMode!=='frugal')options.push('budget');
  const target=(S.housing.properties||[]).find(p=>p.id!==S.housing.currentHomeId&&p.country===S.country&&!p.pendingSale&&!p.rentedOut);
  if(m.adventure>65&&target)options.push('move');
  if(m.thrift<45&&S.money.cash>spouseRequestCost(S,'spending')*4)options.push('spending');
  if(!options.length)continue;
  kind=options[Math.floor(hash/6)%options.length];
  if(kind==='career'){m.careerActed=true;sp.career.monthlyIncomeLocal=eraSalary(getCountry(sp.residenceCountry||S.country).annualSalaryTiers2026.entry/12,sp.residenceCountry||S.country,S.year);sp.career.title='Operations Coordinator';rememberChoice(S,sp,'career','accepted work');recordJournal(S,`${sp.firstName} accepted a job. Shared income starts next month.`,'family');}
  if(kind==='move')m.moveTargetId=target.id;
 }
 m.goal=kind;m.lastDecision=now;m.pending={kind,at:now};
 }
}
export function answerSpouseDecision(S,id,accept){
 const sp=S.people[id];if(!sp?.alive||!S.relations.spouseIds.includes(id))return{ok:false,msg:'Spouse unavailable.'};const m=personMind(S,sp),p=m.pending;if(!p)return{ok:false,msg:'No request waiting.'};const kind=p.kind;
 if(accept&&['boundary','reconcile'].includes(kind)){
  if(kind==='reconcile'&&(sp.relationshipProgress?.courtCase||sp.relationshipProgress?.stage!=='separated'))return{ok:false,msg:'Reconciliation unavailable.'};
  const e=checkSocialEnergy(S,3);if(!e.ok)return e;spendSocialEnergy(S,3);noteSocialContact(S,sp);
 }
 if(accept&&kind==='spending'){const cost=spouseRequestCost(S,kind);if(S.money.cash<cost)return{ok:false,msg:'Not enough shared cash.'};walletMove(S,-cost,'Agreed household purchase','family');sp.vitals.happiness=clamp(sp.vitals.happiness+5);S.player.vitals.happiness=clamp(S.player.vitals.happiness+2);}
 if(accept&&kind==='kids'){if(!m.wantsChildren||sp.relationshipProgress?.stage==='separated'||S.marriage.pregnancy)return{ok:false,msg:'Family planning unavailable.'};S.marriage.tryingForBaby=true;}
 if(kind==='no_kids')S.marriage.tryingForBaby=false;
 if(accept&&kind==='budget')S.money.lifestyleMode='frugal';
 if(accept&&kind==='career')S.marriage.householdSplit='proportional';
 if(accept&&kind==='boundary')sp.rel.respect=clamp(sp.rel.respect+6);
 if(accept&&kind==='move'){const target=S.housing.properties.find(p=>p.id===m.moveTargetId);if(!target||target.rentedOut||target.pendingSale)return{ok:false,msg:'Home no longer available.'};const out=moveIntoOwnedProperty(S,target.id);if(!out.ok)return out;}
 if(accept&&kind==='reconcile'){sp.relationshipProgress.stage='together';sp.householdWith='player';sp.relationshipProgress.affair=null;}
 sp.rel.affection=clamp(sp.rel.affection+(accept?4:-2));sp.rel.trust=clamp(sp.rel.trust+(accept?3:-1));rememberChoice(S,sp,kind,accept?'agreed':'declined');m.pending=null;
 recordJournal(S,`${sp.firstName}: ${kind.replaceAll('_',' ')} ${accept?'agreed':'not agreed'}.`,'family');return{ok:true,msg:accept?'Agreed':'Not agreed'};
}
