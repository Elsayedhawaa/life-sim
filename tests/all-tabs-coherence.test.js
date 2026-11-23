import assert from 'node:assert/strict';
import {COUNTRY_IDS} from '../src/data/countries.js';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import * as views from '../src/ui/views.js';
const fs=['renderLifeTabHtml','renderEducationTabHtml','renderPeopleTabHtml','renderWorkTabHtml','renderRealEstateTabHtml','renderFinanceTabHtml','renderLifestyleTabHtml','renderWorldTabHtml'];let total=0;
for(const country of COUNTRY_IDS)for(const age of [5,15,18,30,65]){
 const s=createNewLifeState({country,seed:77,birthYear:2026-age});ensureExtendedState(s);s.player.age=age;s.year=2026;s.education.stage=age<6?'infancy':age<18?'high':'completed';s.education.highSchoolScore=age>=18?85:null;
 for(const f of fs){const h=views[f](s,{});assert.ok(typeof h==='string'&&h.length>30,`${country}/${age}/${f}`);assert.ok(!/\bNaN\b|\[object Object\]/.test(h),`${country}/${age}/${f} invalid display`);assert.ok(!h.includes('undefined'),`${country}/${age}/${f} undefined`);total++;}
}
console.log(`Passed ${total} tab renders across18countries and5life stages; checks missing values and rendering, not every action outcome.`);
