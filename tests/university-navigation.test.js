import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { presentPostHighSchoolCrossroads } from '../src/systems/careerEducationEngine.js';
import { resolveActiveSceneChoice } from '../src/core/gameLoop.js';
const S = createNewLifeState({ country: 'ind', seed: 5, birthYear: 1979 }); ensureExtendedState(S);
S.year = 1997; S.month = 9; S.player.age = 18; S.money.cash = 0; S.money.savings = 0; S.education.highSchoolScore = 85;
for (let i = 0; i < 8; i++) {
  presentPostHighSchoolCrossroads(S);
  if (!S.activeScene && S.sceneQueue.length) S.activeScene = S.sceneQueue.shift();
  assert.ok(S.activeScene, `crossroads must reappear on browse ${i}`);
  const idx = S.activeScene.choices.findIndex(c => /^(?!Skip)/.test(c.label) && (typeof c.available !== 'function' || c.available(S)));
  resolveActiveSceneChoice(S, idx);
  if (!S.activeScene && S.sceneQueue.length) S.activeScene = S.sceneQueue.shift();
  if (S.activeScene && /pick_major/.test(S.activeScene.key)) {
    const back = S.activeScene.choices.findIndex(c => /different university/.test(c.label));
    resolveActiveSceneChoice(S, back); if (!S.activeScene && S.sceneQueue.length) S.activeScene = S.sceneQueue.shift();
  }
}
assert.ok(S.activeScene && S.activeScene.key === 'post_highschool_choice', 'still on the crossroads after browsing');
const cash = S.money.cash;
const sk = S.activeScene.choices.findIndex(c => /Skip university/.test(c.label));
assert.ok(resolveActiveSceneChoice(S, sk).ok);
assert.equal(S.education.stage, 'completed'); assert.equal(S.money.cash, cash, 'no charge');
console.log('university navigation ok');
