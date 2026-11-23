import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {openGiftScene,openAskHelpScene,openConversationScene} from '../src/systems/soulEngine.js';
import {saveGameToStorage,loadGameFromStorage,resolveActiveSceneChoice} from '../src/core/gameLoop.js';
import {COUNTRY_IDS} from '../src/data/countries.js';
let store;globalThis.localStorage={setItem:(_,v)=>store=v,getItem:()=>store};let checks=0;
for(const country of COUNTRY_IDS)for(const [builder,index] of [[openGiftScene,-1],[openAskHelpScene,2],[openConversationScene,3]]){
 const s=createNewLifeState({country,seed:55});ensureExtendedState(s);s.player.age=25;s.year=2026;s.money.cash=1e6;const p=s.people[s.relations.motherId];assert.ok(builder(s,p.id).ok);saveGameToStorage(s);const n=loadGameFromStorage();assert.ok(n.activeScene);assert.equal(n.rngState,s.rngState);assert.deepEqual(n.sceneCounts,s.sceneCounts);assert.ok(n.activeScene.choices.every(c=>typeof c.effect==='function'));assert.ok(resolveActiveSceneChoice(n,index<0?n.activeScene.choices.length+index:index).ok);checks+=6;
 s.people[p.id].alive=false;saveGameToStorage(s);assert.equal(loadGameFromStorage().activeScene,null);checks++;
}
console.log(`Passed ${checks} people decision reload and deceased-participant checks.`);
