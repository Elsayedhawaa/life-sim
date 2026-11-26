// A formal warning or review answered once cannot be answered again for a reward, and the repeat says so instead of a generic line.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { buildCareerWarningScene } = await import('../src/systems/careerActions.js');
const S = createNewLifeState({ seed: 4, country: 'gbr' }); ensureExtendedState(S);
const boss = { id: 'boss1', firstName: 'Ann', fullName: 'Ann Lee', alive: true, rel: { memories: [] } }; S.people.boss1 = boss;
S.career.job = { id: 'j1', employer: 'Acme', title: 'Clerk', performance: 40 };
const sc = buildCareerWarningScene(S, { year: S.year, bossId: 'boss1', bossName: 'Ann Lee', employer: 'Acme', jobId: 'j1', warnings: 1 });
assert.ok(sc);
sc.choices[0].effect(S); const perf = S.career.job.performance; const n = S.journal.length;
sc.choices[0].effect(S);
assert.equal(S.career.job.performance, perf, 'no second reward');
assert.match(S.journal[0].text, /already answered this at Acme/);
console.log('PASS v221-warning-repeat-feedback');
