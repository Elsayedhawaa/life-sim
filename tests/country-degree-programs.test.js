import assert from 'node:assert/strict';
import {COUNTRY_IDS} from '../src/data/countries.js';
import {getUniversitiesFor,canonicalUniversityId,UNIVERSITIES} from '../src/data/institutions.js';
import {degreeProgramFor,programsForCountry} from '../src/data/degreePrograms.js';
import {annualUniversityBudget} from '../src/data/universityCosts.js';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {applyToUniversity,eligibleMajorsFor,universityAffordability,presentUniversityMajorPicker,uniSupportsMajor} from '../src/systems/careerEducationEngine.js';
import {monthlyUniversityTuition} from '../src/systems/educationFunding.js';
let count=0;
for(const country of COUNTRY_IDS){
 const list=getUniversitiesFor(country,2026);assert.equal(new Set(list.map(u=>u.id)).size,list.length);
 assert.ok(list.every(u=>u.undergraduate!==false));
 for(const uni of list){
  const s=createNewLifeState({country,seed:14,birthYear:2008});ensureExtendedState(s);s.player.age=18;s.year=2026;s.education.stage='graduated_high';s.education.highSchoolScore=99;s.familyTier='struggling';s.money.cash=1e10;
  for(const m of eligibleMajorsFor(s,uni)){
   const t=structuredClone(s);const res=applyToUniversity(t,uni.id,m.id);assert.ok(res.ok,`${country} ${uni.name} ${m.id}: ${res.msg}`);
   assert.equal(t.education.university.totalYears,m.years);assert.equal(t.education.university.majorLabel,m.label);
   const fee=annualUniversityBudget(s,uni,m.id);assert.equal(t.education.university.annualTuition,fee);assert.equal(universityAffordability(s,uni,m.id).annualTuition,fee);
   assert.equal(monthlyUniversityTuition(t),t.education.university.fundingSource==='family'?0:Math.round(fee/12));count+=5;
  }
  presentUniversityMajorPicker(s,uni);for(const m of eligibleMajorsFor(s,uni))assert.ok(s.activeScene.choices.some(c=>c.label.includes(m.label)&&c.label.includes(`${m.years} yrs`)));count++;
 }
}
assert.equal(canonicalUniversityId('x-uni-lmu'),'deu_lmu');assert.equal(canonicalUniversityId('x-uni-ubc'),'can_ubc');
assert.equal(getUniversitiesFor('sau',2026).some(u=>u.id==='sau_kaust'),false);
assert.equal(degreeProgramFor('gbr','business').years,3);assert.equal(degreeProgramFor('usa','business').years,4);assert.equal(degreeProgramFor('ind','engineering').years,4);assert.equal(degreeProgramFor('jpn','dentistry').years,6);assert.equal(degreeProgramFor('tur','pharmacy').years,5);assert.equal(degreeProgramFor('sgp','medicine').years,5);assert.equal(degreeProgramFor('sgp','dentistry').years,4);
assert.equal(uniSupportsMajor('TU Delft','medicine'),false);assert.equal(uniSupportsMajor('Karolinska Institutet','business'),false);
let s=createNewLifeState({country:'usa',seed:14,birthYear:2008});ensureExtendedState(s);s.player.age=18;s.year=2026;s.education.stage='graduated_high';s.education.highSchoolScore=99;s.money.cash=1e9;
assert.equal(applyToUniversity(s,'usa_harvard','medicine').ok,false);assert.equal(s.education.university,null);s.education.degrees=['cs'];assert.equal(applyToUniversity(s,'usa_harvard','medicine').ok,true);assert.equal(s.education.university.totalYears,4);
// Existing enrolled saves keep their contracted duration and annual charge.
const old={...s.education.university,totalYears:6,annualTuition:12345,fundingSource:'self',scholarshipPct:0,prepaidMonths:0};s.education.university=old;assert.equal(monthlyUniversityTuition(s),Math.round(12345/12));assert.equal(s.education.university.totalYears,6);
assert.equal(degreeProgramFor('gbr','medicine',{id:'gbr_ucl'}).years,6);
assert.equal(degreeProgramFor('egy','medicine',null,2017).years,6);assert.equal(degreeProgramFor('egy','medicine',null,2018).years,5);
assert.equal(uniSupportsMajor('UCL','veterinary'),false);assert.equal(uniSupportsMajor('NUS','veterinary'),false);assert.equal(uniSupportsMajor('Harvard','pharmacy'),false);
assert.equal(getUniversitiesFor('fra',2026).find(u=>u.name==='Sciences Po').sectorLabel,'Public institute / private foundation');
console.log(`Passed ${count} country programme, price-preview/enrolment/billing and legacy-ID checks across ${COUNTRY_IDS.length} countries.`);
