import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { resolveEventCtx } = await import('../src/systems/eventEngine.js');
const S = createNewLifeState({ country: 'gbr', seed: 9, birthYear: 1990 }); ensureExtendedState(S);
const ids = ['f1', 'f2', 'f3'];
for (const id of ids) S.people[id] = { id, firstName: id, alive: true, age: 30 };
S.relations.friendIds = ids;
const seen = new Set();
for (let m = 1; m <= 12; m++) { S.year = 2030; S.month = m; const a = resolveEventCtx(S).friend, b = resolveEventCtx(S).friend; assert.equal(a.id, b.id, 'stable within a month'); seen.add(a.id); }
assert.equal(seen.size, 3, 'every living friend gets a turn');
S.people.f1.alive = false; S.people.f2.alive = false; assert.equal(resolveEventCtx(S).friend.id, 'f3');
console.log('ok v221 default friend rotates');
