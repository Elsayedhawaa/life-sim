import {hashSeed,clamp} from '../core/rng.js';
import {walletMove,recordJournal} from '../core/schema.js';
import {eraLocalCost,convertCurrency} from '../data/economy.js';
import {getCountry} from '../data/countries.js';
import {personMind,rememberChoice} from './personMind.js';
import {checkSocialEnergy,spendSocialEnergy,noteSocialContact} from './socialEnergy.js';
export const PEOPLE_REQUESTS={call:'Called to catch up.',help:'Could you help me with something?',money:'Could you lend a hand with my bills?',illness:'I am unwell. Can you check in?',fallout:'I need to clear the air with you.'};
export function tickPeopleAutonomy(S){
 const now=S.year*12+S.month;let slots=2-Object.values(S.people).filter(p=>p?.mind?.pending&&p.role!=='spouse').length;
 for(const p of Object.values(S.people)){
  if(!p?.alive||p.id==='player')continue;const m=personMind(S,p);if(p.role==='spouse'||S.relations.spouseIds.includes(p.id)||p.age<4)continue;
  if(m.pending){if(now-m.pending.at>=3){p.rel.affection=clamp(p.rel.affection-3);rememberChoice(S,p,m.pending.kind,'unanswered');m.pending=null;}continue;}
  if(m.noContactUntil&&now<m.noContactUntil)continue;
  if(m.lastDecision!=null&&now-m.lastDecision<6)continue;
  const roll=hashSeed(`${S.seed}|${p.id}|people|${now}`);
  if(roll%12!==0)continue;
  if(p.age>=16&&p.rel.trust<20&&p.rel.respect<25&&m.independence>55){m.noContactUntil=now+6;rememberChoice(S,p,'no_contact','six month boundary');recordJournal(S,`${p.firstName} asked for six months without contact.`,'relationship');continue;}
  if(slots<=0)continue;
  let kind;
  if(p.rel.trust<40||p.rel.respect<35)kind='fallout';
  else if(p.vitals.health<40)kind='illness';
  else {const choices=['call','help'];if(p.age>=18&&S.player.age>=18&&p.career.savingsLocal<(p.career.monthlyIncomeLocal||0)*2&&p.rel.trust>=55&&m.independence<70)choices.push('money');kind=choices[Math.floor(roll/12)%choices.length];}
  const amount=kind==='money'?Math.round(eraLocalCost(getCountry(S.country).monthlyBasket2026.foodAdult*.25,S.country,S.year)):0;
  m.pending={kind,at:now,amount,country:S.country};m.goal=kind;m.lastDecision=now;slots--;
 }
}
export function peopleRequestAmount(S,p){const req=p.mind?.pending;return req?.amount?Math.round(convertCurrency(req.amount,req.country||S.country,S.country,S.year)):0;}
export function answerPeopleDecision(S,id,accept){
 const p=S.people[id];if(!p?.alive||p.role==='spouse')return{ok:false,msg:'Person unavailable.'};const m=personMind(S,p),req=m.pending;if(!req)return{ok:false,msg:'No request waiting.'};
 if(accept){const amount=peopleRequestAmount(S,p),energy=req.kind==='call'?1:2;if(S.money.cash<amount)return{ok:false,msg:'Not enough cash.'};const e=checkSocialEnergy(S,energy);if(!e.ok)return e;spendSocialEnergy(S,energy);
 if(amount){walletMove(S,-amount,`Help for ${p.firstName}`,'family');p.career.savingsLocal+=Math.round(convertCurrency(amount,S.country,p.residenceCountry||S.country,S.year));}
 // A check-in gives support, not an instant cure.
 noteSocialContact(S,p);p.rel.affection=clamp(p.rel.affection+5);p.rel.trust=clamp(p.rel.trust+3);p.rel.respect=clamp(p.rel.respect+(req.kind==='fallout'?4:1));p.vitals.happiness=clamp(p.vitals.happiness+3);
 }else{p.rel.affection=clamp(p.rel.affection-2);if(req.kind==='fallout')p.rel.trust=clamp(p.rel.trust-3);}
 rememberChoice(S,p,req.kind,accept?'helped':'declined');m.pending=null;return{ok:true,msg:accept?'You made time':'Not this time'};
}
