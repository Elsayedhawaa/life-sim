import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { businessIsOperating, operatingBusinessesOf } = await import('../src/systems/businessPremises.js');
const S = createNewLifeState({ country: 'gbr', seed: 9, birthYear: 1985 }); ensureExtendedState(S);
const mk = stage => ({ id: 'b' + stage, name: 'Test Café', premises: { kind: 'home' }, staff: [], enterprise: stage ? { stage } : undefined });
for (const st of ['planning', 'preparing', 'ready']) assert.equal(businessIsOperating(mk(st)), false, st);
for (const st of ['trading', 'live', undefined]) assert.equal(businessIsOperating(mk(st)), true, String(st));
S.career.businesses = [mk('planning')]; S.career.business = S.career.businesses[0];
assert.equal(operatingBusinessesOf(S).length, 0, 'an unopened company is not a business for fire/theft/inspection events');
S.career.businesses = [mk('planning'), mk('trading')];
assert.equal(operatingBusinessesOf(S).length, 1);
console.log('ok v221 business events need a trading company');
/* the preparation-complete journal line */
{
  const { companyOpenBlocker } = await import('../src/systems/companyLifecycle.js');
  assert.equal(typeof companyOpenBlocker, 'function');
}
