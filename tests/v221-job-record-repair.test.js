// An old placeholder job record ("Junior University Student" at "the firm where X works") is never rewritten by the game: the player chooses.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const R = await import('../src/systems/jobRecordRepair.js');
const { resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const mk = () => { const S = createNewLifeState({ seed: 6, country: 'egy', birthYear: 1975, familyTier: 'middle', gender: 'm' }); ensureExtendedState(S); S.year = 1997; S.month = 3; S.player.age = 22; S.sceneQueue = []; S.activeScene = null;
  S.career.employed = true; S.career.job = { employer: 'the firm where Ramy Ibrahim works', title: 'Junior University Student', employmentFraction: 1, track: 'general', level: 0, monthlyGross: 4200, startYear: 1996, monthsInRole: 3, performance: 68, workMode: 'normal', bossId: null }; return S; };
const open = S => { if (!S.activeScene && S.sceneQueue.length) S.activeScene = S.sceneQueue.shift(); return S.activeScene; };
const idx = (S, re) => { const i = S.activeScene.choices.findIndex(c => re.test(c.label)); assert.ok(i >= 0, String(re)); return i; };
{ /* detected, nothing touched until the player chooses */
  const S = mk(); assert.ok(R.brokenJobRecord(S)); const snap = JSON.stringify(S.career.job); assert.ok(R.offerJobRecordRepair(S)); assert.ok(open(S)); assert.equal(JSON.stringify(S.career.job), snap, 'the offer itself changes nothing'); assert.match(S.activeScene.text, /will not guess/);
  const r = R.restoreJobRecordRepairScene(S, { key: 'job_record_repair' }); assert.ok(r, 'restores after reload');
  /* keep: unchanged, never asked again */
  resolveActiveSceneChoice(S, idx(S, /^Keep it/)); assert.equal(JSON.stringify(S.career.job), snap); S.activeScene = null; assert.equal(R.offerJobRecordRepair(S), false, 'asked once'); }
{ /* remove: the record ends, the pay stops, nothing else is invented */
  const S = mk(); R.offerJobRecordRepair(S); open(S); resolveActiveSceneChoice(S, idx(S, /^Remove this job record/)); assert.equal(S.career.job, null); assert.equal(S.career.employed, false); }
{ /* choose a real kind of work: track and title are the chosen track's own, pay and employer text stay as recorded */
  const S = mk(); R.offerJobRecordRepair(S); open(S); resolveActiveSceneChoice(S, idx(S, /^Say what kind of work/)); open(S); assert.match(S.activeScene.key, /job_record_repair_pick/); const n = S.activeScene.choices.length; assert.ok(n > 2, 'real tracks are offered');
  assert.ok(!S.activeScene.choices.some(c => /University Student/i.test(c.label)), 'no placeholder is offered');
  const { getMergedCareerTracks } = await import('../src/systems/careerEducationEngine.js'); const tracks = getMergedCareerTracks(S.year);
  resolveActiveSceneChoice(S, 0); const j = S.career.job; assert.ok(tracks[j.track], 'the track now has a ladder'); assert.equal(j.title, tracks[j.track].rungs[0].title); assert.equal(j.monthlyGross, 4200); assert.match(j.employer, /^Employer not recorded \(you were referred by Ramy Ibrahim\)$/); assert.ok(!/firm where/i.test(j.employer)); assert.equal(j.startYear, 1996); assert.equal(j.monthsInRole, 3); assert.equal(j.level, 0); assert.equal(S.career.employed, true); assert.equal(R.brokenJobRecord(S), false, 'repaired record is healthy');
  /* era: nothing that did not exist in 1997 is offered */
  const O = mk(); R.offerJobRecordRepair(O); open(O); resolveActiveSceneChoice(O, idx(O, /^Say what kind of work/)); open(O); assert.ok(!O.activeScene.choices.some(c => /Cloud|DevOps|Social Media|AI |Data Science|Data Analy/i.test(c.label)), 'no anachronistic tracks in 1997');
  const N = mk(); N.year = 2020; R.offerJobRecordRepair(N); open(N); resolveActiveSceneChoice(N, idx(N, /^Say what kind of work/)); open(N); assert.ok(N.activeScene.choices.some(c => /Cloud/i.test(c.label)), 'the same track is offered once it exists'); }
{ /* healthy records are never flagged */
  const S = mk(); S.career.job = { ...S.career.job, employer: 'Misr Insurance', title: 'Junior Accountant', track: Object.keys((await import('../src/systems/careerEducationEngine.js')).getMergedCareerTracks(S.year))[0] }; assert.equal(R.brokenJobRecord(S), false); assert.equal(R.offerJobRecordRepair(S), false);
  const T = mk(); T.career.employed = false; assert.equal(R.brokenJobRecord(T), false, 'no job, nothing to repair'); }
console.log('PASS v221-job-record-repair');
