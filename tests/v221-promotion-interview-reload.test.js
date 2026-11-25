// A promotion interview must survive save and reload. Before the fix the scene was dropped, the "interview scheduled" flag stayed, and every later application was refused.
import assert from 'node:assert/strict';
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { getMergedCareerTracks } = await import('../src/systems/careerEducationEngine.js');
const { applyPromotion, ensureJobActionState } = await import('../src/systems/careerActions.js');
const { saveGameToStorage, loadGameFromStorage } = await import('../src/core/gameLoop.js');
const tracks = getMergedCareerTracks(2042); const id = Object.keys(tracks).find((k) => tracks[k].rungs?.length >= 4 && !(tracks[k].reqDegrees || []).length) || 'retail';
const t = tracks[id]; const lvl = 1;
const s = createNewLifeState({ country: 'egy', seed: 9 }); ensureExtendedState(s);
s.year = 2042; s.month = 1; s.player.age = 40; s.career.employed = true; s.career.trackExperience = { [id]: t.rungs[lvl + 1].minExp + 1 };
s.career.job = { employer: 'Acme', title: t.rungs[lvl].title, track: id, level: lvl, monthlyGross: 5000, performance: 85, workMode: 'normal', monthsInRole: 11, startYear: 2030, employmentFraction: 1 };
const res = applyPromotion(s); assert.ok(res.ok, res.msg);
const sc = s.activeScene || s.sceneQueue[0]; assert.match(sc.title, /^Promotion interview/);
if (!s.activeScene) { s.activeScene = s.sceneQueue.shift(); }
saveGameToStorage(s); const r = loadGameFromStorage();
assert.ok(r.activeScene, 'interview still pending after reload'); assert.equal(r.activeScene.title, sc.title); assert.ok(r.activeScene.choices.length >= 3);
// Answer it for real after reload: a decision is recorded and the flag clears.
r.activeScene.choices[0].effect(r);
assert.notEqual(ensureJobActionState(r).promotion?.stage, 'interview', 'interview flag cleared after answering');
console.log('promotion-interview reload OK');
