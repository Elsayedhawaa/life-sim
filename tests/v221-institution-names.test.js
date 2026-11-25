// Institution names that contain a city stay whole; the city is still rewritten where it is a place. Birth line grammar for every tier.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { countryLevelNarrative } = await import('../src/ui/views.js');
const { createNewLifeState, ensureExtendedState, FAMILY_TIERS } = await import('../src/core/schema.js');
const S = createNewLifeState({ seed: 1, country: 'egy', birthYear: 2001 }); ensureExtendedState(S);
const cases = [
  ['Matriculated at Cairo University reading Engineering.', 'Matriculated at Cairo University reading Engineering.'],
  ['American University in Cairo', 'American University in Cairo'],
  ['German University in Cairo', 'German University in Cairo'],
  ['moved to Cairo for work', 'moved to Egypt for work']
];
for (const [i, e] of cases) assert.equal(countryLevelNarrative(i, S), e, i);
for (const [k, t] of Object.entries(FAMILY_TIERS)) assert.match(t.birth || '', /^(a|an) [a-z-]+( [a-z-]+)* (household|family)$/, k);
assert.equal(FAMILY_TIERS.very_wealthy.birth, 'a dynasty-wealth family');
assert.equal(FAMILY_TIERS.upper_middle.birth, 'an affluent professional family');
console.log('institution names OK');
