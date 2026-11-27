import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{driftGapMonths}from'../src/systems/socialEnergy.js';
/* Played defect: an 18-year-old was told "You have not caught up with <classmate> in 132 months", a gap counted from when they were seven. Drift counts from age 17 at most. */
const S=createNewLifeState({country:'egy',seed:3});ensureExtendedState(S);
const p={rel:{lastContactTurn:0,lastContactYear:1999,lastContactMonth:1}};S.year=2016;S.month=1;
S.player.age=18;assert.equal(driftGapMonths(S,p),12,'at 18 the gap is at most a year');
S.player.age=15;assert.equal(driftGapMonths(S,p),0,'no drift gap in childhood');
S.player.age=30;assert.ok(driftGapMonths(S,p)>=12*13-1,'adults keep the real gap');
console.log('ok v221 drift adult only');
import{reachOutToDriftingFriend}from'../src/systems/socialEnergy.js';
{const T=createNewLifeState({country:'egy',seed:4});ensureExtendedState(T);T.player.age=30;T.year=2030;T.month=1;
const id=T.relations.friendIds[0]||'f1';const q={id,fullName:'Test Friend',firstName:'Test',alive:true,rel:{lastContactTurn:0,lastContactYear:2026,lastContactMonth:1,affection:50,trust:50,resentment:0}};T.people[id]=q;
reachOutToDriftingFriend(T,q);assert.ok(T.journal.some(j=>/After about 4 years of silence, you called Test Friend/.test(JSON.stringify(j))),'reach-out line states the real gap');}
console.log('ok v221 drift reach-out span');
