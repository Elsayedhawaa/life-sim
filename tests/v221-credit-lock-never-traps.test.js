import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { discretionaryLock } = await import('../src/core/discretionary.js');
const S = createNewLifeState({ country: 'egy', seed: 3, birthYear: 1990 }); ensureExtendedState(S);
S.rules = { ...(S.rules || {}), creditLimit: true }; S.money.creditCap = 1000; S.money.cash = -1000;
const pay = n => ({ label: 'pay ' + n, effect: st => { st.money.cash -= n; } });
const sc = { key: 'ev_life_lottery_nothing', baseId: 'ev_life_lottery_nothing', title: 't', choices: [pay(20), pay(40)] };
const locks = sc.choices.map(c => discretionaryLock(S, sc, c));
assert.ok(locks.some(l => l === null), 'at least one option is open when every option costs money');
assert.ok(locks.some(l => l), 'the dearer option stays locked');
assert.equal(discretionaryLock(S, sc, sc.choices[0]), null, 'the cheapest is the one left open');
console.log('ok v221 credit lock never traps');
{ const { isDiscretionaryScene } = await import('../src/core/discretionary.js');
  assert.ok(isDiscretionaryScene({ key: 'ev_family_sib_wedding_l2', baseId: 'ev_family_sib_wedding_l2', title: 'x' }), 'a sibling flat deposit is optional spending at the credit limit');
  console.log('ok v221 sibling deposit locked at limit'); }
