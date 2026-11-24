import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState,createPerson} from '../src/core/schema.js';
import {tickMarriageAndFamilyMonthly} from '../src/systems/marriageFamilyEngine.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.player.age=30;s.player.gender='m';const p=createPerson(s,{age:30,gender:'f',role:'spouse',nationality:'gbr',residenceCountry:'gbr'});s.people[p.id]=p;s.relations.spouseIds=[p.id];s.marriage.tryingForBaby=true;return {s,p};}
let {s,p}=setup();s.marriage.pregnancy={motherId:p.id,dueMonths:1};p.alive=false;const kids=s.relations.childIds.length;tickMarriageAndFamilyMonthly(s);assert.equal(s.marriage.pregnancy,null);assert.equal(s.relations.childIds.length,kids);assert.equal(s.marriage.tryingForBaby,false);
({s,p}=setup());p.gender='m';for(let i=0;i<100;i++)tickMarriageAndFamilyMonthly(s);assert.equal(s.marriage.pregnancy,null);assert.equal(s.relations.childIds.length,0);console.log('Pregnancy cannot deliver after recorded maternal death; same-sex couple does not enter the unmodeled natural-conception route.');

({s,p}=setup());s.marriage.pregnancy={motherId:p.id,dueMonths:1};s.marriage.tryingForBaby=false;tickMarriageAndFamilyMonthly(s);const baby=s.people[s.relations.childIds.at(-1)];assert.ok(baby);assert.deepEqual(baby.parentIds,['player',p.id]);console.log('Newborn records both actual parents for later dynasty continuation.');
