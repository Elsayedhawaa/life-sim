import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { tickCareerMonthly } from '../src/systems/careerEducationEngine.js';
function run(years) {
  const s = createNewLifeState({ country: 'gbr', seed: 7 }); ensureExtendedState(s);
  s.year = 2030; s.month = 1; s.player.age = 22; s.career.employed = true; s.career.trackExperience = { software: 0 };
  s.career.job = { employer: 'Acme', title: 'Junior Software Engineer', track: 'software', level: 0, monthlyGross: 3000, performance: 72, workMode: 'normal', monthsInRole: 0, startYear: 2030, employmentFraction: 1 };
  for (let m = 1; m <= 12 * years; m++) { s.month++; if (s.month > 12) { s.month = 1; s.year++; } tickCareerMonthly(s); }
  return s;
}
const s = run(30);
assert.equal(s.career.job.level, 2, 'lower rungs stay automatic; senior rungs wait for an application');
assert(s.journal?.some?.((j) => /not automatic: apply for it/.test(JSON.stringify(j))), 'reason is shown');
const prompts=[...(s.activeScene?[s.activeScene]:[]),...s.sceneQueue].filter((x)=>/^senior_rung_ready/.test(x.key||''));
assert(prompts.length>=1,'eligibility is surfaced as a scene, not only a journal line');
assert(/Career tab/.test(prompts[0].text));
assert.equal(s.career.job.seniorPromptLevel,3,'prompt is once per rung');
console.log('senior promotion needs an application; reason journalled');
