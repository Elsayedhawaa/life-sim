import fs from'node:fs';import assert from'node:assert/strict';
/* Played defect: the decision-result card printed "your favourite café in Cairo" and "the dentist in Cairo" for a student in Alexandria, because only the journal list collapsed city names to the country. The story lines on the result card go through the same collapse. */
const src=fs.readFileSync(new URL('../src/ui/turnResult.js',import.meta.url),'utf8');
assert.ok(/trc-story-line">\$\{esc\(countryLevelNarrative\(t, S\)\)\}/.test(src),'story lines are country-level');
console.log('ok v221 result card country level');
