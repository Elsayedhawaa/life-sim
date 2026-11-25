import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { openConversationScene } from '../src/systems/soulEngine.js';
import { resolveActiveSceneChoice } from '../src/core/gameLoop.js';
const s = createNewLifeState({ country: 'egy', seed: 4, familyTier: 'middle', birthYear: 1990, age: 0 }); ensureExtendedState(s);
s.player.age = 25; s.year = 2015; s.month = 5; s.activeScene = null; s.sceneQueue = [];
const dad = s.people[s.relations.fatherId]; dad.alive = true; dad.rel.resentment = 0;
function talk() { s.activeScene = null; const r = openConversationScene(s, dad.id); assert.ok(r.ok !== false, JSON.stringify(r)); const i = s.activeScene.choices.findIndex(c => /family/i.test(String(c.label))); assert.ok(i >= 0, 'family choice'); const a0 = dad.rel.affection; resolveActiveSceneChoice(s, i); return dad.rel.affection - a0; }
const d1 = talk(), d2 = talk(), d3 = talk();
assert.ok(d1 >= 4, 'first talk gives the full effect: ' + d1);
assert.ok(d2 > 0 && d2 <= 1.5, 'repeat gives a small capped reward: ' + d2);
assert.equal(d3, 0, 'third talk in the month adds nothing');
console.log('repeat-talk OK', d1, d2, d3);
