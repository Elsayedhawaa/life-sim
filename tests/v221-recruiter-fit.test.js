// A recruiter's lead offer follows the player's own degree, not just the highest pay among open-entry jobs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const E = await import('../src/systems/careerEducationEngine.js');
function lead(major) {
  const S = createNewLifeState({ seed: 5, country: 'tur', birthYear: 2000 }); ensureExtendedState(S);
  S.player.age = 24; S.year = 2024; S.education.stage = 'completed'; S.education.degrees = [major]; S.activeScene = null; S.sceneQueue = [];
  E.presentGraduateOrJobSearchOffers(S);
  const sc = S.activeScene || S.sceneQueue[0];
  assert.ok(sc, `${major}: a recruiter scene is offered`);
  return sc.choices[0].label;
}
assert.ok(/House Officer|Resident/.test(lead('medicine')), 'medical graduate leads with a medical post: ' + lead('medicine'));
assert.ok(/Associate|Trainee/.test(lead('law')), 'law graduate leads with a legal post: ' + lead('law'));
assert.ok(!/Cadet Pilot/.test(lead('medicine')), 'no pilot cadetship as the medical lead');
// No relevant degree: the open-entry roles still lead by pay.
assert.ok(/Cadet Pilot/.test(lead('computer_science')), 'with no matching track the open-entry list still sorts by pay');
console.log('recruiter fit OK');
