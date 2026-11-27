import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState,createPerson}from'../src/core/schema.js';
import{continueAsChild,triggerPlayerDeath}from'../src/systems/healthDirectorEngine.js';
import{deadLifeBlocks}from'../src/core/deadLifeGuard.js';
/* Engine-level (not played): a continued life keeps the new-life credit rule, and the dead-life guard leaves continue-as-child open. */
const s=createNewLifeState({country:'egy',seed:12,birthYear:1960});ensureExtendedState(s);s.year=2026;s.month=5;s.player.age=66;s.money.cash=800000;
const c=createPerson(s,{age:34,gender:'m',role:'child',relationLabel:'Son',nationality:'egy',residenceCountry:'egy'});s.people[c.id]=c;s.relations.childIds=[c.id];
triggerPlayerDeath(s,'test');assert.ok(s.gameOver);assert.equal(deadLifeBlocks(s,'continue-as-child'),false);assert.equal(deadLifeBlocks(s,'buy-car'),true);
const next=continueAsChild(s,c.id);assert.ok(next,'child takes over');assert.equal(next.generation,2);assert.ok(next.rules?.creditLimit,'generation 2 keeps the credit-limit rule');assert.equal(next.gameOver,false);
console.log('ok v221 continue child rules');
