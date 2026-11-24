import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createNewLifeState,ensureExtendedState,createPerson} from '../src/core/schema.js';
import {introducePartnerProspect,proposeEngagement} from '../src/systems/marriageFamilyEngine.js';
import {courtshipState,courtshipAction,tickCourtship,reconnectCourtship,restoreCourtshipScene} from '../src/systems/courtshipLife.js';
import {tickNpcAutonomyYearly} from '../src/systems/soulEngine.js';
import {loadGameFromStorage,resolveActiveSceneChoice} from '../src/core/gameLoop.js';
function life(gender='f',country='gbr'){
 const s=createNewLifeState({country,gender,seed:801,birthYear:1998});ensureExtendedState(s);s.year=2024;s.month=1;s.player.age=26;s.pacing='monthly';s.activeScene=null;s.sceneQueue=[];s.turn=30;
 const out=introducePartnerProspect(s,'family_intro');assert(out.ok);return[s,out.partner];
}
function move(s,n=3){s.month+=n;while(s.month>12){s.month-=12;s.year++;}s.turn+=n;}
function reload(s){globalThis.localStorage={getItem:()=>JSON.stringify(s),setItem(){}};const loaded=loadGameFromStorage();assert(loaded);return loaded;}
// Both player genders, different countries, and explicit no are valid, not divorce.
for(const gender of ['f','m'])for(const country of ['gbr','egy','usa','sau','uae','deu']){
 const[s,p]=life(gender,country);assert.equal(p.gender,gender==='f'?'m':'f');assert(courtshipAction(s,p.id,'end').ok);assert.equal(s.relations.partnerId,null);assert.equal(p.role,'ex_partner');assert.equal(s.marriage.couples[0].stage,'ended');assert.equal(s.relations.exSpouseIds.length,0);assert.equal(s.marriage.contracts.length,0);const l=reload(s);assert.equal(l.relations.partnerId,null);assert.equal(l.people[p.id].role,'ex_partner');assert.equal(courtshipAction(l,p.id,'time').ok,false);
}
let[s,p]=life();const startHappy=s.player.vitals.happiness;move(s);tickCourtship(s);assert(s.activeScene.courtshipDecision);s=reload(s);p=s.people[p.id];assert.equal(typeof s.activeScene.choices[0].effect,'function');const serial=p.courtship.pending.serial;assert(resolveActiveSceneChoice(s,1).ok);assert.equal(p.courtship.deferrals,1);assert.equal(courtshipAction(s,p.id,'later',serial).ok,false);move(s);tickCourtship(s);assert.equal(p.courtship.pending.kind,'boundary');assert(resolveActiveSceneChoice(s,1).ok);move(s);tickCourtship(s);assert.equal(s.relations.partnerId,null);assert.equal(p.courtship.endedReason,'stopped_waiting');assert.equal(s.player.vitals.happiness,startHappy);assert.equal(p.courtship.history.filter(x=>x.kind==='deferred').length,2);assert.equal(s.marriage.couples[0].stage,'ended');assert(s.activeScene.courtshipEnding);s=reload(s);assert.equal(typeof s.activeScene.choices[0].effect,'function');resolveActiveSceneChoice(s,0);p=s.people[p.id];assert.equal(s.relations.partnerId,null);assert.equal(reconnectCourtship(s,p.id).ok,false);move(s,6);const e=s.socialEnergy?.remaining;const r=reconnectCourtship(s,p.id);assert(r.ok);assert.equal(s.relations.partnerId,null);assert.equal(p.courtship.history.at(-1).kind,'reconnect_declined');
// Kept plans and existing ordinary social contact prevent the neglect arc.
[s,p]=life();for(let i=0;i<8;i++){move(s,2);s.social={energy:10,max:10};assert(courtshipAction(s,p.id,'time').ok);tickCourtship(s);assert.equal(s.relations.partnerId,p.id);assert.equal(s.activeScene,null);}assert.equal(courtshipAction(s,p.id,'time').ok,false);
[s,p]=life();move(s,8);p.rel.lastContactYear=s.year;p.rel.lastContactMonth=s.month;tickCourtship(s);assert.equal(s.activeScene,null);assert.equal(s.relations.partnerId,p.id);
// A warning is a chance to change course; one kept plan is not charged twice.
[s,p]=life();move(s,6);tickCourtship(s);const saved=JSON.parse(JSON.stringify(s.activeScene));const choice=restoreCourtshipScene(s,saved).choices[0];choice.effect(s);const affection=p.rel.affection;choice.effect(s);assert.equal(p.rel.affection,affection);assert.equal(p.courtship.warningAt,null);assert.equal(restoreCourtshipScene(s,saved),null);move(s,3);tickCourtship(s);assert.equal(s.relations.partnerId,p.id);
// A mutual second chance is possible, but not once the other person married.
[s,p]=life();courtshipAction(s,p.id,'end');move(s,6);p.rel.trust=80;p.rel.affection=80;assert(reconnectCourtship(s,p.id).ok);assert.equal(s.relations.partnerId,p.id);assert.equal(s.marriage.couples.length,2);s=reload(s);assert.equal(s.relations.partnerId,p.id);
[s,p]=life();courtshipAction(s,p.id,'end');move(s,18);p.maritalStatus='married';const cash=s.money.cash;assert.equal(reconnectCourtship(s,p.id).ok,false);assert.equal(s.money.cash,cash);assert.equal(s.relations.partnerId,null);
// Save without courtship telemetry does not invent years of neglect.
[s,p]=life();delete p.courtship;move(s,120);tickCourtship(s);assert.equal(s.activeScene,null);assert.equal(s.relations.partnerId,p.id);
// Former partners are no longer exempt from the living NPC world.
let movedOn=false;for(let seed=1;seed<=60&&!movedOn;seed++){let [a,b]=life();a.seed=seed;delete a.npcRng;courtshipAction(a,b.id,'end');for(let y=0;y<25&&b.alive&&!movedOn;y++){a.year++;tickNpcAutonomyYearly(a);if(b.maritalStatus==='married'){movedOn=true;assert(b.spouseIds.some(id=>a.people[id]?.alive));assert.equal(reconnectCourtship(a,b.id).ok,false);}}}assert(movedOn);
// Cohabiting couples and engaged couples are not mistaken for neglected dates.
[s,p]=life();p.relationLabel='Live-In Partner';move(s,15);tickCourtship(s);assert.equal(s.relations.partnerId,p.id);assert.equal(s.activeScene,null);
[s,p]=life();s.marriage.engagement={partnerId:p.id};move(s,15);tickCourtship(s);assert.equal(s.relations.partnerId,p.id);assert.equal(s.activeScene,null);
// Work is a real tradeoff, not a label, and cannot be farmed in one month.
[s,p]=life();s.career.employed=true;s.career.job={performance:40};const stress=s.player.vitals.stress;assert(courtshipAction(s,p.id,'later').ok);assert.equal(s.career.job.performance,42);assert.equal(s.player.vitals.stress,stress+3);courtshipAction(s,p.id,'later');assert.equal(s.career.job.performance,42);
// Named preview fixture, not represented as a natural full-life playthrough.
[s,p]=life();move(s,6);tickCourtship(s);fs.writeFileSync('/downloads/courtship-warning-fixture.json',JSON.stringify(s));
console.log('Courtship: gender/country, choice/history, warning, follow-through, rejection, second chance, married boundary, reload and no forged past pass');
