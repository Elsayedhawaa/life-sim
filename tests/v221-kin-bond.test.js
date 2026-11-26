// The memory scenes call a bond with a parent or sibling a "relationship", not a "friendship".
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/data/eventsMemory.js',import.meta.url),'utf8');
assert.ok(!/The friendship with \$\{name\} ended/.test(src),'no hard-coded friendship ending for every person');
assert.ok(/\$\{bond\} with \$\{name\} ended/.test(src)&&/\$\{bond\} is worth more than the cash/.test(src));
console.log('PASS v221-kin-bond');
