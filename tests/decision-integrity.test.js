import assert from 'node:assert/strict';
import { createNewLifeState, queueScene } from '../src/core/schema.js';
import { resolveActiveSceneChoice, saveGameToStorage, loadGameFromStorage } from '../src/core/gameLoop.js';
import { pickRandomLifeEvent, restoreRandomLifeScene } from '../src/systems/eventEngine.js';
const state = () => {
 const s=createNewLifeState({country:'usa',seed:123,birthYear:1998});
 s.player.age=25;s.year=2023;s.pacing='monthly';return s;
};
let checks=0;
function check(x,n){assert.ok(x,n);checks++;}
let s=state();
s.activeScene={title:'Index test',choices:[
 {label:'Locked',available:()=>false,effect:st=>st.money.cash=999},
 {label:'Middle',effect:st=>st.money.cash=123},
 {label:'Last',effect:st=>st.money.cash=456},
]};
check(!resolveActiveSceneChoice(s,0).ok,'disabled choice refused');
check(s.activeScene!==null,'refusal keeps decision');
check(!resolveActiveSceneChoice(s,-1).ok,'negative index refused');
check(!resolveActiveSceneChoice(s,1.5).ok,'fractional index refused');
check(!resolveActiveSceneChoice(s,99).ok,'missing index refused');
check(resolveActiveSceneChoice(s,1).ok,'valid choice succeeds');
check(s.money.cash===123,'middle button executes middle, not filtered last');
let store=null;
globalThis.localStorage={setItem:(_,v)=>store=v,getItem:()=>store};
for (const country of ['egy','usa','sau','uae','gbr','deu','can','aus','fra','jpn','ita','bra','ind']) {
 for(let i=0;i<15;i++){
  s=createNewLifeState({country,seed:123+i,birthYear:1998});s.player.age=25;s.year=2023;s.pacing='monthly';
  const sc=pickRandomLifeEvent(s);check(!!sc,'scene picked');
  queueScene(s,sc);saveGameToStorage(s);
  const reloaded=loadGameFromStorage();
  check(!!reloaded.activeScene,'pending random scene restored');
  check(reloaded.rngState===s.rngState,'load consumes no random state');
  check(reloaded.activeScene.title===sc.title,'title preserved');
  check(reloaded.activeScene.text===sc.text,'randomised text preserved');
  check(reloaded.activeScene.choices.every(ch=>typeof ch.effect==='function'),'choice effects restored');
  check(reloaded.activeScene.choices.map(ch=>ch.label).join('|')===sc.choices.map(ch=>ch.label).join('|'),'labels preserved');
 }
}
s=state();s.activeScene={title:'Unknown old card',choices:[{label:'No saved function'}]};saveGameToStorage(s);
const restored=loadGameFromStorage();check(!restored.activeScene,'unrestorable legacy card does not softlock');
check(restored.journal.some(e=>e.text.includes('No choice was made')),'legacy card skip is explained');
console.log(`Passed ${checks} decision and save/reload assertions.`);
