// The "secondary qualification" goal completes from the recorded exam result and stage (graduated_high), not from turning 19.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { refreshGoalsProgress } = await import('../src/core/gameLoop.js');
const S = createNewLifeState({ seed: 4, country: 'usa', birthYear: 2000, familyTier: 'middle', gender: 'm' }); ensureExtendedState(S);
const g = () => S.goals.find(x => x.id === 'g_grad'); assert.ok(g());
S.player.age = 18; S.education.stage = 'high'; S.education.highSchoolScore = null; refreshGoalsProgress(S); assert.equal(g().done, false, 'before the exam, not done');
S.education.highSchoolScore = 87; S.education.stage = 'high'; refreshGoalsProgress(S); assert.equal(g().done, false, 'a score without the stage change is not completion');
S.education.stage = 'graduated_high'; S.education.university = { name: 'Test University' }; refreshGoalsProgress(S); assert.equal(g().done, true, 'exam passed and enrolled at 18: done at 18');
console.log('PASS v221-school-goal-state');
