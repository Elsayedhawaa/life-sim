import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{tickHealthAndMortalityYearly}from'../src/systems/healthDirectorEngine.js';
/* Appendicitis has its own surgery event. The yearly onset roll must not hand it out as a lasting condition. */
let onsets=0,other=0;
for(let seed=1;seed<=3000;seed++){const S=createNewLifeState({country:'egy',seed,birthYear:1998});ensureExtendedState(S);S.year=2030;S.player.age=30;S.medical.conditions=[];S.activeScene=null;S.sceneQueue=[];
 try{tickHealthAndMortalityYearly(S)}catch(e){continue}
 for(const c of S.medical.conditions){if(c.id==='appendicitis')onsets++;else other++;}}
assert.ok(other>20,'other conditions still start: '+other);
assert.equal(onsets,0,'no passive appendicitis: '+onsets);
console.log('ok v221 no passive appendicitis');
