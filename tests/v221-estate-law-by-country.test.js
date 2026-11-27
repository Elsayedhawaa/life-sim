import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync(new URL('../src/systems/soulEngine.js',import.meta.url),'utf8');
assert.ok(!/\['egy', 'sau', 'uae'\]\.includes\(profCountry\) \|\| S\.player\.religion/.test(s),'estate law is the country\'s, not the player\'s religion');
assert.ok(/\['egy', 'sau', 'uae'\]\.includes\(profCountry\)\) \{/.test(s));
console.log('PASS v221-estate-law-by-country (source-level)');
