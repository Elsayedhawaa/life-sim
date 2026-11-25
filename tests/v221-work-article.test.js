// Generic work card: "A" / "An" agrees with the track and job title (was "A Aviation Pilot job", "a Associate").
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const W = await import('../src/systems/careerWork.js');
const S = createNewLifeState({ seed: 3, country: 'usa', birthYear: 1990, familyTier: 'middle', gender: 'm' }); ensureExtendedState(S);
S.career.employed = true; S.career.job = { track: 'aviation_unlisted_x', title: 'Associate Cadet', employer: 'X' }; S.career.currentWork = null;
let seen = 0, bad = [];
for (let i = 0; i < 80; i++) { S.career.currentWork = null; S.month = 1 + (i % 12); S.year = 2000 + i; const w = W.assignCareerWork(S); if (!w) continue; if (/job lands/.test(w.title)) { seen++; if (!/^An Aviation/.test(w.title) || /kind a [aeiou]/i.test(w.detail)) bad.push(w.title + ' | ' + w.detail.slice(0, 70)); } }
assert.ok(seen > 0, 'the "job lands" card came up'); assert.deepEqual(bad, [], 'article agrees with the next word');
console.log('PASS v221-work-article');
