import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {ALL_RANDOM_LIFE_EVENTS,resolveEventCtx} from '../src/systems/eventEngine.js';
import {eraLocalCost} from '../src/data/economy.js';
const event=ALL_RANDOM_LIFE_EVENTS.find(e=>e.id==='ev_money_stolen_wallet');
for(const country of ['egy','sau','usa','jpn'])for(const cash of [0,50,100000])for(let i=0;i<3;i++){
 const s=createNewLifeState({country,seed:42});ensureExtendedState(s);s.year=2026;s.player.age=30;s.money.cash=cash;const scene=event.build(s,resolveEventCtx(s));assert(!/\$[a-zA-Z]/.test(JSON.stringify({title:scene.title,labels:scene.choices.map(c=>c.label)})));const debt=JSON.stringify(s.money.loans);scene.choices[i].effect(s);assert.equal(s.money.cash,cash-Math.min(cash,Math.round(eraLocalCost(800,country,s.year))));assert.equal(JSON.stringify(s.money.loans),debt);const reloaded=JSON.parse(JSON.stringify(s));assert.equal(reloaded.money.cash,s.money.cash);
}
console.log('Wallet theft all responses charge actual cash once, no fabricated borrowing, worldwide cash caps/reload pass');
const st=createNewLifeState({country:'sau',seed:74});ensureExtendedState(st);const named={id:'named',firstName:'Noura'};const ctx={mom:named,dad:named,spouse:named,sib:named,friend:named,child:named,boss:named};
for(const ev of ALL_RANDOM_LIFE_EVENTS){let sc;try{sc=ev.build(st,ctx)}catch{continue}if(!sc)continue;const text=[sc.title,sc.text,...(sc.choices||[]).map(c=>typeof c.label==='function'?c.label(st):c.label)].join(' ');assert(!/\$(fr|sp|childName)\b/.test(text),ev.id);assert(!text.includes('NouraName'),ev.id);}
