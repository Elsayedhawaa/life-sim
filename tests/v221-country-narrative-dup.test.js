// The country-level rewrite must not print "Turkey, Turkey" when a stored line already named the country after the city.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { countryLevelNarrative } = await import('../src/ui/views.js');
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const S = createNewLifeState({ seed: 1, country: 'tur', birthYear: 2001 }); ensureExtendedState(S);
const cases = [
  ['Born in Istanbul, Turkey in 1998.', 'Born in Turkey in 1998.'],
  ['Ece married in Antalya, Turkey.', 'Ece married in Turkey.'],
  ['You twisted your ankle on a morning run in Istanbul.', 'You twisted your ankle on a morning run in Turkey.'],
  ['You moved from Istanbul to Ankara.', 'You moved from Turkey to Turkey.']
];
for (const [i, e] of cases) assert.equal(countryLevelNarrative(i, S), e, i);
console.log('country narrative dup OK');
