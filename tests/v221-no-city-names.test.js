import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { ALL_RANDOM_LIFE_EVENTS, resolveEventCtx } from '../src/systems/eventEngine.js';
// Scenes stay country-level (user rule, phonemsg-01M85697S482XSSFE498FFW8DC): no city name in any event card.
const MARK = 'Zxqville';
let built = 0; const leaks = [];
for (const country of ['egy', 'usa', 'gbr']) {
  for (const age of [9, 15, 22, 40]) {
    const s = createNewLifeState({ country, seed: 11, familyTier: 'middle', birthYear: 1990, age: 0 }); ensureExtendedState(s);
    s.player.age = age; s.year = 1990 + age; s.city = MARK;
    for (const ev of ALL_RANDOM_LIFE_EVENTS) {
      let sc = null;
      try { sc = ev.build ? ev.build(s, resolveEventCtx(s, ev)) : null; } catch (e) { sc = null; }
      if (!sc) continue; built++;
      const txt = [sc.title, sc.text, ...(sc.choices || []).map(c => c.label)].join(' | ');
      if (txt.includes(MARK)) leaks.push(`${ev.id}`);
    }
  }
}
assert.ok(built > 200, 'enough event cards were built to mean something: ' + built);
assert.deepEqual([...new Set(leaks)], [], 'events naming the city: ' + [...new Set(leaks)].join(', '));
console.log('no-city-names OK, cards built', built);
