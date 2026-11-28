import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { getRandomLifeEventById, eventGatePasses } = await import('../src/systems/eventEngine.js');
const S = createNewLifeState({ country: 'gbr', seed: 9, birthYear: 1990 }); ensureExtendedState(S);
S.year = 2020; S.player.age = 30;
const ev = getRandomLifeEventById('ev_career_night_shift');
assert.ok(ev, 'event exists');
const job = (track) => { S.career.employed = true; S.career.job = { track, employer: 'X', monthlyGross: 3000, level: 1 }; };
job('fintech_product'); assert.equal(eventGatePasses(ev, S, { ignoreHistory: true }), false, 'desk job gets no night-shift offer');
job('software'); assert.equal(eventGatePasses(ev, S, { ignoreHistory: true }), false);
job('nursing'); assert.equal(eventGatePasses(ev, S, { ignoreHistory: true }), true, 'shift-work job still can');
/* appendicitis wording follows the cash left */
const ap = getRandomLifeEventById('ev_health_appendicitis');
const run = (cash) => { const T = createNewLifeState({ country: 'gbr', seed: 9, birthYear: 1990 }); ensureExtendedState(T); T.year = 2020; T.player.age = 30; T.money.cash = cash;
  const sc = ap.build(T, {}); sc.choices[0].effect(T); return JSON.stringify(T.journal || T.log || T).match(/emergency appendix surgery[^"]*/)[0]; };
assert.ok(!/savings/.test(run(900000)), run(900000));
assert.ok(/savings/.test(run(100)), run(100));
console.log('ok v221 night shift gate + surgery text');
