import assert from 'node:assert/strict';
import {createNewLifeState} from '../src/core/schema.js';
import {COUNTRIES,COUNTRY_IDS} from '../src/data/countries.js';
import {renderHudHtml,renderLifeTabHtml,pickDynamicBanner,countryLevelNarrative} from '../src/ui/views.js';
for(const country of COUNTRY_IDS){const s=createNewLifeState({country,seed:23});s.year=2026;const h=renderHudHtml(s);assert.ok(!h.includes(s.city+','));const art=pickDynamicBanner(s,'life');s.city='Unspecified district';assert.equal(pickDynamicBanner(s,'life'),art);assert.ok(!renderLifeTabHtml(s).includes('Unspecified district'),country+': '+renderLifeTabHtml(s).split('Unspecified district')[0].slice(-180));}
const s=createNewLifeState({country:'usa',seed:12});assert.equal(countryLevelNarrative('A day in Chicago',s),'A day in United States');
console.log('Passed country-only HUD/narrative/banner routes across 18 countries.');
