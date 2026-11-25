// A pending aging-sign decision (knees, gym, eyesight, hearing, memory) must survive save and reload.
import assert from 'node:assert/strict';
const store = {}; globalThis.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
const { createNewLifeState, ensureExtendedState, queueScene } = await import('../src/core/schema.js');
const { maybeQueueAgingSign } = await import('../src/systems/mortalityModel.js');
const { saveGameToStorage, loadGameFromStorage } = await import('../src/core/gameLoop.js');
let checked = 0; const seen = new Set();
for (let seed = 1; seed <= 300 && checked < 40; seed++) {
  const s = createNewLifeState({ country: 'usa', seed, familyTier: 'middle', birthYear: 1950, age: 0 }); ensureExtendedState(s);
  s.player.age = 62; s.year = 2012;
  for (let y = 0; y < 15 && !s.activeScene; y++) { s.year++; s.player.age++; maybeQueueAgingSign(s, queueScene); s.activeScene = s.activeScene || s.sceneQueue.shift() || null; }
  if (!s.activeScene || !/^aging_/.test(s.activeScene.baseId || '')) continue;
  const key = s.activeScene.key, title = s.activeScene.title, n = s.activeScene.choices.length;
  saveGameToStorage(s); const r = loadGameFromStorage();
  assert.ok(r.activeScene, 'aging decision pending after reload: ' + key);
  assert.equal(r.activeScene.title, title); assert.equal(r.activeScene.choices.length, n);
  r.activeScene.choices[0].effect(r); seen.add(r.activeScene.baseId); checked++;
}
assert.ok(checked >= 10, 'enough aging scenes exercised: ' + checked);
console.log('aging-sign reload OK', checked, 'scenes,', seen.size, 'kinds');
