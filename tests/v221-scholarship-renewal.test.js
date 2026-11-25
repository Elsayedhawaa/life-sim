import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { reviewScholarshipRenewal, monthlyUniversityTuition } from '../src/systems/educationFunding.js';
function life(skill) { const s = createNewLifeState({ country: 'egy', seed: 3, familyTier: 'middle', birthYear: 2000, age: 0 }); ensureExtendedState(s); s.player.age = 19; s.year = 2019; s.education.academicSkill = skill; s.education.university = { name: 'Test U', fundingSource: 'scholarship', scholarshipPct: 1, annualTuition: 120000, country: 'egy', elapsedMonths: 12 }; return s; }
const g = life(80); reviewScholarshipRenewal(g); assert.equal(g.education.university.fundingSource, 'scholarship'); assert.equal(g.education.university.probation, false);
const b = life(40); reviewScholarshipRenewal(b); assert.equal(b.education.university.fundingSource, 'scholarship', 'first miss: probation'); assert.equal(b.education.university.probation, true);
reviewScholarshipRenewal(b); assert.equal(b.education.university.scholarshipLost, undefined, 'same boundary is not reviewed twice');
b.education.university.elapsedMonths = 24; reviewScholarshipRenewal(b);
assert.equal(b.education.university.fundingSource, 'scholarship_ended'); assert.equal(b.education.university.scholarshipPct, 0); assert.equal(monthlyUniversityTuition(b), 0, 'no silent billing before a choice');
assert.ok(b.activeScene || b.sceneQueue.length, 'a decision scene is queued'); const sc = b.activeScene || b.sceneQueue[0]; assert.ok(sc.choices.length >= 2);
const selfC = sc.choices.find(c => /myself/.test(c.label)); selfC.effect(b); assert.equal(b.education.university.fundingSource, 'self'); assert.ok(monthlyUniversityTuition(b) > 0, 'billed monthly only after choosing');
const ln = sc.choices.find(c => /loan/.test(c.label)); const b2 = life(40); b2.education.university.totalYears = 4; reviewScholarshipRenewal(b2); b2.education.university.elapsedMonths = 24; reviewScholarshipRenewal(b2); const sc2 = b2.activeScene || b2.sceneQueue[0]; sc2.choices.find(c => /loan/.test(c.label)).effect(b2); assert.ok(b2.money.loans.some(l => l.narrativeKind === 'student')); assert.equal(b2.education.university.fundingSource, 'loan'); assert.equal(monthlyUniversityTuition(b2), 0);
const r = life(40); reviewScholarshipRenewal(r); r.education.academicSkill = 75; r.education.university.elapsedMonths = 24; reviewScholarshipRenewal(r); assert.equal(r.education.university.fundingSource, 'scholarship'); assert.equal(r.education.university.probation, false, 'recovery clears probation');
console.log('scholarship-renewal OK');
