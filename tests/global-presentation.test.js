import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {renderLifeTabHtml,renderEducationTabHtml} from '../src/ui/views.js';
import {tickEducationYearly,presentPostHighSchoolCrossroads} from '../src/systems/careerEducationEngine.js';
import {getUniversitiesFor} from '../src/data/institutions.js';
import {COUNTRY_IDS} from '../src/data/countries.js';
for(const country of COUNTRY_IDS){const s=createNewLifeState({country,seed:77});ensureExtendedState(s);s.player.age=18;s.money.cash=1e12;
s.player.religion='secular';assert.ok(!renderLifeTabHtml(s).includes('data-action="pay-zakat"'));s.player.religion='muslim';assert.ok(renderLifeTabHtml(s).includes('data-action="pay-zakat"'));
s.player.age=15;s.education.stage='middle';tickEducationYearly(s);assert.equal(s.activeScene.title,'Secondary school: choose your study routine');assert.ok(s.activeScene.text.includes('simulation'));
s.activeScene=null;s.sceneQueue=[];s.education.stage='graduated_high';s.education.highSchoolScore=90;presentPostHighSchoolCrossroads(s);assert.ok(s.activeScene.text.includes('simplified game rules'));assert.ok(renderEducationTabHtml(s).includes('not official university requirements'));
}
assert.equal(getUniversitiesFor('jpn',2026).find(u=>u.id==='x-uni-osaka').sector,'public');
console.log(`Passed worldwide presentation checks for ${COUNTRY_IDS.length} countries.`);
