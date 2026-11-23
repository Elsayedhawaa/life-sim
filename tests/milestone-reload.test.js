import assert from 'node:assert/strict';
import {createNewLifeState,createPerson,ensureExtendedState} from '../src/core/schema.js';
import {saveGameToStorage,loadGameFromStorage,resolveActiveSceneChoice} from '../src/core/gameLoop.js';
import {tickEducationYearly,presentPostHighSchoolCrossroads,presentUniversityMajorPicker} from '../src/systems/careerEducationEngine.js';
import {queueDriftNoticeScene} from '../src/systems/socialEnergy.js';
import {getUniversitiesFor} from '../src/data/institutions.js';
import {COUNTRY_IDS} from '../src/data/countries.js';
let store;globalThis.localStorage={setItem:(_,v)=>store=v,getItem:()=>store};
let checks=0;
function roundtrip(s){saveGameToStorage(s);const n=loadGameFromStorage();assert.ok(n.activeScene);assert.equal(n.rngState,s.rngState);assert.deepEqual(n.sceneCounts,s.sceneCounts);assert.equal(n.activeScene.title,s.activeScene.title);assert.ok(n.activeScene.choices.every(c=>typeof c.effect==='function'));checks+=5;return n;}
for(const country of COUNTRY_IDS){let s=createNewLifeState({country,seed:51,birthYear:1998});ensureExtendedState(s);s.year=2016;s.player.age=18;s.education.stage='graduated_high';s.education.highSchoolScore=90;presentPostHighSchoolCrossroads(s);let n=roundtrip(s);const skip=n.activeScene.choices.length-1;assert.ok(resolveActiveSceneChoice(n,skip).ok);assert.equal(n.education.stage,'completed');checks+=2;
s.activeScene=null;s.sceneQueue=[];const uni=getUniversitiesFor(country,2016)[0];if(!uni)continue;presentUniversityMajorPicker(s,uni);n=roundtrip(s);const back=n.activeScene.choices.length-2;assert.ok(resolveActiveSceneChoice(n,back).ok);assert.equal(n.activeScene.key,'post_highschool_choice');checks+=2;}
let s=createNewLifeState({seed:65});ensureExtendedState(s);s.player.age=25;const p=createPerson(s,{age:25,role:'friend'});s.people[p.id]=p;s.relations.friendIds=[p.id];queueDriftNoticeScene(s,p);let n=roundtrip(s);assert.ok(resolveActiveSceneChoice(n,1).ok);assert.equal(n.people[p.id].rel.driftState,'noticed');assert.ok(n.relations.friendIds.includes(p.id));checks+=3;
s=createNewLifeState({country:'jpn',seed:17});ensureExtendedState(s);s.player.age=15;s.education.stage='middle';tickEducationYearly(s);n=roundtrip(s);assert.ok(resolveActiveSceneChoice(n,1).ok);assert.equal(n.education.studyEffort,'normal');checks+=2;
console.log(`Passed ${checks} education/friendship save-reload assertions across ${COUNTRY_IDS.length} countries.`);
