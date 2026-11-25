// The "scholarship ended" decision must survive a save and reload; before the fix it was dropped and tuition stayed unbilled.
import assert from 'node:assert/strict';
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { reviewScholarshipRenewal, monthlyUniversityTuition } = await import('../src/systems/educationFunding.js');
const { saveGameToStorage, loadGameFromStorage } = await import('../src/core/gameLoop.js');
const s = createNewLifeState({ country: 'egy', seed: 3, familyTier: 'middle', birthYear: 2000, age: 0 }); ensureExtendedState(s);
s.player.age = 19; s.year = 2019; s.education.academicSkill = 40; s.education.stage = 'university';
s.education.university = { name: 'Test U', fundingSource: 'scholarship', scholarshipPct: 1, annualTuition: 120000, country: 'egy', elapsedMonths: 12 };
reviewScholarshipRenewal(s); s.education.university.elapsedMonths = 24; reviewScholarshipRenewal(s);
assert.equal(s.activeScene.title, 'Your scholarship has ended');
saveGameToStorage(s); const r = loadGameFromStorage();
assert.ok(r.activeScene, 'decision is still pending after reload');
assert.equal(r.activeScene.title, 'Your scholarship has ended'); assert.ok(r.activeScene.choices.length >= 2);
assert.equal(r.education.university.fundingSource, 'scholarship_ended'); assert.equal(monthlyUniversityTuition(r), 0, 'nothing billed before the choice');
const pick = r.activeScene.choices.find((c) => /myself/.test(c.label)); pick.effect(r);
assert.equal(r.education.university.fundingSource, 'self'); assert.ok(monthlyUniversityTuition(r) > 0);
console.log('scholarship-ended reload OK');
// Currency: amounts carry the player's actual currency, not a bare number.
for (const [c, cur] of [['egy', /EGP/], ['usa', /USD|\$/], ['gbr', /GBP|£/]]) {
  const t = createNewLifeState({ country: c, seed: 3, familyTier: 'middle', birthYear: 2000, age: 0 }); ensureExtendedState(t);
  t.player.age = 19; t.year = 2019; t.education.academicSkill = 40; t.education.stage = 'university';
  t.education.university = { name: 'Test U', fundingSource: 'scholarship', scholarshipPct: 1, annualTuition: 12000, country: c, elapsedMonths: 12 };
  reviewScholarshipRenewal(t); t.education.university.elapsedMonths = 24; reviewScholarshipRenewal(t);
  const sc = t.activeScene; assert.match(sc.text, cur, c + ' text has currency'); for (const ch of sc.choices) assert.match(ch.label, cur, c + ' choice has currency: ' + ch.label);
}
console.log('scholarship-ended currency OK');
