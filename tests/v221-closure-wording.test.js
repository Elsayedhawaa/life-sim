// The at-risk box names the real closure trigger: lost capital for losing businesses, 3 missed payments only when payments were missed.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { computeStakes } = await import('../src/systems/progressEngine.js');
const S = createNewLifeState({ country: 'usa', seed: 3 }); ensureExtendedState(S);
S.career.businesses = [{ id: 'b1', name: 'Losing Co', monthsLosing: 4, misses: 0 }, { id: 'b2', name: 'Late Co', monthsLosing: 2, misses: 2 }];
const st = computeStakes(S).filter(s => s.section === 'Business');
const a = st.find(s => /Losing Co/.test(s.title)), b = st.find(s => /Late Co/.test(s.title));
assert.ok(a && b, 'both stakes exist');
assert.ok(/capital/.test(a.consequence) && !/3 missed payments/.test(a.consequence), a.consequence);
assert.ok(/3 missed payments/.test(b.consequence), b.consequence);
console.log('ok v221 closure wording');
