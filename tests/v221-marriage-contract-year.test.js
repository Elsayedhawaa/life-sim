import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState,createPerson,newCoupleRecord,setCoupleStage,syncCoupleToLegacy}from'../src/core/schema.js';
/* Played defect: the wedding contract said 2023 (year they met) for a 2024 wedding. */
const S=createNewLifeState({country:'egy',seed:8,birthYear:1998});ensureExtendedState(S);S.year=2023;S.month=10;S.player.age=25;
const sp=createPerson(S,{age:23,gender:'f',role:'spouse',relationLabel:'Wife',nationality:'egy',residenceCountry:'egy'});S.people[sp.id]=sp;
const couple=newCoupleRecord(S,S.player.id,sp.id,{});S.marriage.couples=S.marriage.couples||[];if(!S.marriage.couples.includes(couple))S.marriage.couples.push(couple);
S.year=2024;S.month=3;setCoupleStage(S,couple,'married');syncCoupleToLegacy(S,couple);
const c=S.marriage.contracts.find(x=>x.spouseId===sp.id);assert.ok(c,'contract created');assert.equal(c.year,2024,'contract carries the wedding year');
console.log('ok v221 marriage contract year');
