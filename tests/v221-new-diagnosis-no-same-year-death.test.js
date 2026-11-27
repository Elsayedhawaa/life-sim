import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{rollMortality}from'../src/systems/mortalityModel.js';
/* Played defect: a healthy 35-year-old died of appendicitis in the same yearly tick it was diagnosed, with no diagnosis scene or journal line. */
const mk=(seed,since)=>{const S=createNewLifeState({country:'egy',seed,birthYear:1998});ensureExtendedState(S);S.year=2033;S.player.age=35;S.player.vitals.health=100;
S.medical.conditions=[{id:'appendicitis',label:'Appendicitis',severity:'critical',chronic:false,sinceYear:since,managed:false,treatmentStatus:'untreated',annualHealthHit:10,annualHappinessHit:6,deathRiskPerYear:0.05}];return S};
let fresh=0,old=0;for(let seed=1;seed<=4000;seed++){const a=rollMortality(mk(seed,2033));if(a&&/appendicitis/.test(a.cause))fresh++;const b=rollMortality(mk(seed,2031));if(b&&/appendicitis/.test(b.cause))old++;}
assert.equal(fresh,0,'a condition diagnosed this year cannot kill this year: '+fresh);
assert.ok(old>0,'an older untreated condition still can: '+old);
console.log('ok v221 new diagnosis no same-year death');
