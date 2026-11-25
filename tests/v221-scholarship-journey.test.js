import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { monthlyUniversityTuition } from '../src/systems/educationFunding.js';
const s = createNewLifeState({ country: 'egy', seed: 5, familyTier: 'middle', birthYear: 1974, age: 0 }); ensureExtendedState(s);
let n = 0; while (s.player.age < 18 && n++ < 30) { advanceSingleTurn(s); s.activeScene = null; }
s.sceneQueue = []; s.education.stage = 'university'; s.education.academicSkill = 30;
s.education.university = { id: 'asu', name: 'Ain Shams University', country: 'egy', majorId: 'cs', majorLabel: 'CS', totalYears: 4, yearInProgram: 1, elapsedMonths: 0, progressMonth: s.year * 12 + s.month, enrolledMonth: s.year * 12 + s.month, annualTuition: 10000, scholarshipPct: 1, fundingSource: 'scholarship' };
const states = []; let found = null;
for (let i = 0; i < 40 && !found; i++) {
  advanceSingleTurn(s); const u = s.education.university; if (!u) break;
  s.education.academicSkill = 30;
  if (u.fundingSource === 'scholarship_ended') {
    assert.equal(monthlyUniversityTuition(s), 0, 'no charge before the choice');
    assert.equal(s.activeScene?.title, 'Your scholarship has ended', 'decision is presented in the same month, not queued behind');
    found = i;
  } else { states.push(u.probation ? 'probation' : u.fundingSource); s.activeScene = null; s.sceneQueue = []; }
}
assert.notEqual(found, null, 'loss reached via real monthly turns');
assert.ok(states.includes('probation'), 'probation came first: ' + states.filter((x, i, a) => a.indexOf(x) === i).join(','));
const u = s.education.university; assert.ok(u.elapsedMonths >= 24 && u.elapsedMonths <= 26, 'loss at the second year boundary: ' + u.elapsedMonths);
assert.ok(states.indexOf('probation') >= 11, 'probation not before the first year boundary');
console.log('scholarship-journey OK elapsed', u.elapsedMonths);
const r = resolveActiveSceneChoice(s, s.activeScene.choices.length - 1); assert.ok(r.ok !== false);
assert.equal(s.education.university.fundingSource, 'self'); assert.ok(monthlyUniversityTuition(s) > 0, 'charged only after the informed choice');
console.log('choice applied OK');
