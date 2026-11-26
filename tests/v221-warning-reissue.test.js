// A warning withdrawn on appeal and earned again in the same year is a new warning: its answer must work. The same card still cannot be answered twice.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { buildCareerWarningScene } = await import('../src/systems/careerActions.js');
const S = createNewLifeState({ seed: 4, country: 'gbr' }); ensureExtendedState(S);
const boss = { id: 'boss1', firstName: 'Ann', fullName: 'Ann Lee', alive: true, rel: { memories: [] } }; S.people.boss1 = boss;
S.career.job = { id: 'j1', employer: 'Acme', title: 'Clerk', performance: 40 };
const sc = buildCareerWarningScene(S, { year: S.year, bossId: 'boss1', bossName: 'Ann Lee', employer: 'Acme', jobId: 'j1', warnings: 1 });
assert.ok(sc);
const snap = seq => ({ year: S.year, bossId: 'boss1', bossName: 'Ann Lee', employer: 'Acme', jobId: 'j1', warnings: 1, seq });
const one = buildCareerWarningScene(S, snap(1)), two = buildCareerWarningScene(S, snap(2));
assert.notEqual(one.key, two.key, 'distinct cards');
one.choices[0].effect(S); const p1 = S.career.job.performance;
two.choices[0].effect(S); assert.equal(S.career.job.performance, p1 + 2, 'the new warning can be answered');
two.choices[0].effect(S); assert.equal(S.career.job.performance, p1 + 2, 'but the same card only once');
assert.match(S.journal[0].text, /already answered this at Acme/);
console.log('PASS v221-warning-reissue');
