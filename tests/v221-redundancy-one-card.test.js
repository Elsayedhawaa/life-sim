// One job loss shows one card: when the detailed redundancy scene is queued, the generic announcement card is not, but the record (which follow-up events need) is kept.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { snapshotMajor, announceMajorChanges, majorEventRecent } = await import('../src/systems/majorLifeEvents.js');
const { buildRedundancyScene } = await import('../src/systems/careerConsequences.js');
const mk = () => { const S = createNewLifeState({ seed: 9, country: 'gbr', birthYear: 1990, gender: 'm' }); ensureExtendedState(S); S.year = 2020; S.month = 5; S.player.age = 30; S.sceneQueue = []; S.activeScene = null; S.career.employed = true; S.career.job = { employer: 'Acme Ltd', title: 'Analyst', monthlyGross: 3000, track: 'finance', level: 0 }; return S; };
const lose = S => { const b = snapshotMajor(S); S.career.employed = false; S.career.job = null; S.career.jobLoss = S.career.jobLoss || {}; S.career.jobLoss.lastJob = { employer: 'Acme Ltd', title: 'Analyst', monthlyGross: 3000, year: S.year, month: S.month, reason: 'redundancy' }; return b; };
const cards = S => [S.activeScene, ...S.sceneQueue].filter(Boolean).filter(x => /redundan/i.test(x.title || ''));
{ const S = mk(); const b = lose(S); S.sceneQueue.push(buildRedundancyScene(S, { employer: 'Acme Ltd', title: 'Analyst', severance: 3000, severanceMonths: 1, country: 'gbr', year: S.year, month: S.month })); announceMajorChanges(S, b);
  assert.equal(cards(S).length, 1, 'one card for one loss'); assert.match(cards(S)[0].title, /^Made Redundant at/); assert.ok(majorEventRecent(S, 'job_lost_redundancy'), 'the record is kept for follow-ups'); }
{ const S = mk(); const b = lose(S); announceMajorChanges(S, b); assert.equal(cards(S).length, 1, 'with no detailed scene the announcement still shows'); assert.match(cards(S)[0].title, /Made Redundant/); }
console.log('PASS v221-redundancy-one-card');
