import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createNewLifeState,ensureExtendedState,createPerson} from '../src/core/schema.js';
import {interactWithPerson} from '../src/systems/soulEngine.js';
import {loadGameFromStorage,advanceSingleTurn} from '../src/core/gameLoop.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:110,birthYear:1970});ensureExtendedState(s);s.year=2026;s.month=4;s.player.age=56;s.pacing='monthly';s.activeScene=null;s.sceneQueue=[];s.money.cash=500;s.money.savings=200;s.money.lastMonthSummary={income:1600,housing:900,living:600,debt:200,support:0,net:-100};s.social={energy:10,max:10};const p=createPerson(s,{nationality:'gbr',gender:'f',age:25,role:'child',firstName:'Alice',affection:95,trust:95});p.leftHome=true;p.rel.resentment=0;p.traits.warmth=90;p.traits.materialism=5;p.schoolHistory=[{paidLocal:12000,paymentCountry:'gbr'}];p.parentFundedCourse={paid:24000,country:'gbr'};p.career.savingsLocal=10000;s.people[p.id]=p;s.relations.childIds.push(p.id);return[s,p];}
function reload(s){globalThis.localStorage={getItem:()=>JSON.stringify(s),setItem(){}};return loadGameFromStorage();}
for(const cash of [500,100000])for(const health of [30,95]){const[s,p]=setup();s.money.cash=cash;s.player.vitals.health=health;s.activeScene={key:'family_buffer_'+p.id,familyBufferId:p.id,title:'Old scripted scene',choices:[{label:'Ask for help'}]};s.sceneQueue=[s.activeScene];const loaded=reload(s);assert.equal(loaded.activeScene,null);assert(!loaded.sceneQueue.some(sc=>sc.familyBufferId));assert.equal(loaded.money.cash,cash);assert.equal(loaded.player.vitals.health,health);assert.equal(loaded.people[p.id].career.savingsLocal,10000);advanceSingleTurn(loaded);assert(!loaded.activeScene?.familyBufferId);assert(!loaded.sceneQueue.some(sc=>sc.familyBufferId));}
// Optional help still depends on actual funds and the relationship, not a forced story.
let[s,p]=setup();assert(interactWithPerson(s,p.id,'ask_for_help').ok);assert(s.money.cash>500);assert(p.career.savingsLocal<10000);
[s,p]=setup();p.career.savingsLocal=0;assert.equal(interactWithPerson(s,p.id,'ask_for_help').ok,false);assert.equal(s.money.cash,500);
[s,p]=setup();p.rel.affection=5;p.rel.trust=5;p.rel.resentment=90;assert.equal(interactWithPerson(s,p.id,'ask_for_help').ok,false);assert.equal(s.money.cash,500);
[s,p]=setup();s.activeScene={familyBufferId:p.id,title:'Old scripted scene',choices:[{label:'Ask'}]};fs.writeFileSync('/downloads/family-buffer-withdrawn-fixture.json',JSON.stringify(s));
console.log('Withdrawn scripted parent need: healthy/ill, poor/rich pending scenes retire with no assumed action; actual optional child support/refusal remains');
