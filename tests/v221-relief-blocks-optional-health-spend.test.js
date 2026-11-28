import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { discretionaryLock, atCreditLimit } = await import('../src/core/discretionary.js');
const { getRandomLifeEventById } = await import('../src/systems/eventEngine.js');
const S = createNewLifeState({ country: 'gbr', seed: 9, birthYear: 1990 }); ensureExtendedState(S);
S.year = 2030; S.player.age = 40; S.money.cash = 0; S.money.bankruptUntilYear = 2035; S.money.creditBlocked = true;
assert.ok(atCreditLimit(S), 'in relief with no cash');
for (const id of ['ev_health_lasik', 'ev_health_hearing_test', 'ev_health_therapy_first', 'ev_health_eye_test', 'ev_money_broken_glasses']) {
  const ev = getRandomLifeEventById(id); assert.ok(ev, id);
  const sc = ev.build(S, {}); sc.baseId = id; sc.key = id;
  const locked = (sc.choices || []).filter(c => typeof c.effect === 'function' && discretionaryLock(S, sc, c));
  assert.ok(locked.length > 0, id + ' has a locked paid option in relief');
}
/* necessary treatment is not optional spending */
const ap = getRandomLifeEventById('ev_health_appendicitis'); const sc = ap.build(S, {}); sc.baseId = 'ev_health_appendicitis';
assert.ok(!(sc.choices || []).some(c => discretionaryLock(S, sc, c)), 'surgery stays open');
console.log('ok v221 relief blocks optional health spending');
