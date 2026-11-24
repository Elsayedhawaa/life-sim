import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { ALL_RANDOM_LIFE_EVENTS, eventGatePasses, resolveEventCtx } from '../src/systems/eventEngine.js';
const find=id=>ALL_RANDOM_LIFE_EVENTS.find(e=>e.id===id);
function state(country='egy'){
 const s=createNewLifeState({country,seed:31,birthYear:1998});ensureExtendedState(s);
 s.player.age=35;s.year=2026;s.pacing='monthly';s.money.cash=10000;return s;
}
let checks=0;
const ok=(x,n)=>{assert.ok(x,n);checks++};
for(const country of ['egy','usa','sau','uae','gbr','deu','can','aus','fra','jpn','ita','bra','ind']){
 let s=state(country),ev=find('ev_money_rent_rise');
 ok(!eventGatePasses(ev,s),'parents home cannot get landlord rise');
 s.housing.mode='owned';ok(!eventGatePasses(ev,s),'owner cannot get rent rise');
 s.housing.mode='rent';s.housing.monthlyRent=1000;ok(eventGatePasses(ev,s),'tenant eligible');
 const before=s.money.cash;ev.build(s).choices[0].effect(s);
 ok(s.housing.monthlyRent===1080,'rent rises from actual current rent');
 ok(s.money.cash===before,'no duplicate cash rent charge at decision time');
 ev=find('ev_money_rent_deposit_new');s=state(country);
 const old=JSON.stringify(s.housing),cash=s.money.cash;ev.build(s).choices[0].effect(s);
 ok(s.money.cash===cash,'viewing/budget scene cannot charge a phantom deposit');
 ok(JSON.stringify(s.housing)===old,'viewing scene cannot invent a move');
 ev=find('ev_money_inheritance_small');s=state(country);s.money.loans=[{label:'Test loan',balance:500,monthlyPayment:100}];
 const cashBefore=s.money.cash;ev.build(s,resolveEventCtx(s)).choices[1].effect(s);
 ok(s.money.loans.length===0,'inheritance actually repays loan');
 ok(s.ledger.some(e=>e.delta===-500),'repayment is ledgered');
 ok(s.money.cash>cashBefore,'surplus stays as cash');
 for(const event of ALL_RANDOM_LIFE_EVENTS){
  if(!eventGatePasses(event,s))continue;
  try {
   const sc=event.build(s,resolveEventCtx(s));
   if(!sc)continue;
   const text=[sc.title,sc.text,...sc.choices.map(c=>typeof c.label==='function'?c.label(s):c.label)].join(' ');
   ok(!/\$(mom|dad|spouse|friend|sib|child|boss|fr|sp|childName)\b/.test(text),'no role placeholder in '+event.id);
  }catch(error){throw new Error(event.id+': '+error.message)}
 }
}
console.log(`Passed ${checks} financial-event and placeholder checks across 13 countries.`);
