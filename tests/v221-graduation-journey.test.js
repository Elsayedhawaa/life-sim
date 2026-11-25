import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn } from '../src/core/gameLoop.js';
import { applyToUniversity } from '../src/systems/careerEducationEngine.js';
import { enrollPostgraduateProgram } from '../src/systems/completeLifeSystems.js';
const s = createNewLifeState({ country: 'egy', seed: 8, familyTier: 'wealthy', birthYear: 1990, age: 0 }); ensureExtendedState(s);
let n = 0; while (s.player.age < 18 && n++ < 30) { advanceSingleTurn(s); s.activeScene = null; s.sceneQueue = []; }
s.education.highSchoolScore = 98; s.education.stage = 'completed'; s.education.degrees = []; s.money.cash = 3_000_000;
const ap = applyToUniversity(s, 'egy_cairo', 'engineering', 'family');
assert.ok(ap.ok !== false, JSON.stringify(ap));
assert.ok(s.education.university, 'enrolled through the real apply path');
const years = s.education.university.totalYears;
let turns = 0;
while (s.education.university && turns++ < years * 14) { advanceSingleTurn(s); s.activeScene = null; s.sceneQueue = []; s.education.academicSkill = Math.max(s.education.academicSkill, 70); }
assert.equal(s.education.university, null, 'enrolment ended by real turns, turns=' + turns);
assert.ok(s.education.degrees.length >= 1, 'degree earned through play: ' + JSON.stringify(s.education.degrees));
assert.ok(turns >= years * 11 && turns <= years * 13, 'took about ' + years + ' years of monthly turns: ' + turns);
console.log('graduated after', turns, 'turns; stage', s.education.stage, 'age', s.player.age);
const ps = enrollPostgraduateProgram(s, 'masters_mba', 'cash');
assert.ok(ps.ok !== false, JSON.stringify(ps));
assert.ok(s.postgrad.active, 'master active');
let m = 0; while (s.postgrad.active && m++ < 40) { advanceSingleTurn(s); s.activeScene = null; s.sceneQueue = []; }
assert.ok(!s.postgrad.active && s.postgrad.completed.some(p => p.tier === 'masters_mba'), 'master completed via real turns, months=' + m);
console.log('master completed after', m, 'turns');
const pd = enrollPostgraduateProgram(s, 'fellowship_phd', 'cash');
assert.ok(pd.ok !== false, JSON.stringify(pd));
let q = 0; while (s.postgrad.active && q++ < 50) { advanceSingleTurn(s); s.activeScene = null; s.sceneQueue = []; }
assert.ok(s.postgrad.completed.some(p => p.tier === 'fellowship_phd'), 'PhD completed via real turns, months=' + q);
assert.ok(q >= 34 && q <= 38, 'about 36 monthly turns: ' + q);
console.log('phd completed after', q, 'turns; age', s.player.age);
