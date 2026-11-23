import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {COUNTRY_IDS} from '../src/data/countries.js';
import {getUniversitiesFor} from '../src/data/institutions.js';
import {universityAffordability,applyToUniversity,eligibleMajorsFor,presentUniversityMajorPicker} from '../src/systems/careerEducationEngine.js';
import {monthlyUniversityTuition} from '../src/systems/educationFunding.js';
let checks=0;
for(const country of COUNTRY_IDS)for(const tier of ['struggling','working','middle','upper_middle','wealthy'])for(const uni of getUniversitiesFor(country,2026)){
 const s=createNewLifeState({country,seed:55,birthYear:2008});ensureExtendedState(s);s.player.age=18;s.year=2026;s.education.stage='graduated_high';s.education.highSchoolScore=99;s.familyTier=tier;s.money.cash=0;
 const major=eligibleMajorsFor(s,uni)[0];if(!major)continue;
 const aff=universityAffordability(s,uni);const res=applyToUniversity(s,uni.id,major.id);
 assert.equal(res.ok,aff.status==='covered');checks++;
 if(res.ok){assert.equal(monthlyUniversityTuition(s),0);s.player.age=24;assert.equal(monthlyUniversityTuition(s),0);checks+=2;}
 else {assert.equal(s.education.university,null);presentUniversityMajorPicker(s,uni);assert.equal(s.activeScene.choices[0].available(s),false);s.money.cash=aff.annualTuition;assert.equal(universityAffordability(s,uni).status,'you-can-start');assert.equal(applyToUniversity(s,uni.id,major.id).ok,true);assert.equal(monthlyUniversityTuition(s),Math.round(aff.annualTuition/12));checks+=5;}
}
console.log(`Passed ${checks} funding/admission/billing checks across ${COUNTRY_IDS.length} countries.`);
