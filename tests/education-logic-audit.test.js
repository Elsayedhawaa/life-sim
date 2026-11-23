import assert from 'node:assert/strict';
import {COUNTRY_IDS} from '../src/data/countries.js';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {renderEducationTabHtml} from '../src/ui/views.js';
import {getSchoolsFor,getUniversitiesFor} from '../src/data/institutions.js';
import {schoolSystemFor,tansikCutoffFor,eligibleMajorsFor} from '../src/systems/careerEducationEngine.js';
assert.equal(schoolSystemFor({name:'Eton College',tier:'private'},'gbr'),'british');
assert.equal(schoolSystemFor({name:'King’s College',tier:'private'},'gbr'),'british');
for(const c of COUNTRY_IDS){
 const unis=getUniversitiesFor(c,2026);const names=unis.map(u=>u.name.toLowerCase());assert.equal(new Set(names).size,names.length,`duplicate names ${c}`);
 for(const age of [5,15,18,25]){
  const s=createNewLifeState({country:c,birthYear:2026-age,seed:77});ensureExtendedState(s);s.player.age=age;s.year=2026;s.education.stage=age<6?'infancy':age<18?'high':'graduated_high';s.education.highSchoolScore=age>=18?90:null;
  const h=renderEducationTabHtml(s);for(const bad of ['undefined','NaN','GRADUATED HIGH','Free Free','no Tansik place','Opens UK universities','College — French'])assert.ok(!h.includes(bad),`${c}/${age}: ${bad}`);
  if(c!=='egy')assert.ok(!h.includes('Niqaba'));
  for(const u of unis){assert.equal(u.country,c);const scores=eligibleMajorsFor({...s,education:{...s.education,highSchoolScore:99}},u).map(m=>tansikCutoffFor(c,u,m.id,2026).cutoff);if(c!=='egy'&&scores.length>3)assert.ok(new Set(scores).size>2,`flattened scores ${u.name}`)}
 }
}
console.log('Passed education coherence audit:72country/age screens, school classification, duplicate names, country scope and non-flat game entry indices.');
