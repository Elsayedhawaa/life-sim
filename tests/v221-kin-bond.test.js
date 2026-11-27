// The memory scenes call a bond with a parent or sibling a "relationship", not a "friendship".
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/data/eventsMemory.js',import.meta.url),'utf8');
assert.ok(!/The friendship with \$\{name\} ended/.test(src),'no hard-coded friendship ending for every person');
assert.ok(/\$\{bond\} with \$\{name\} ended/.test(src)&&/\$\{bond\} is worth more than the cash/.test(src));
assert.ok(/if \(p && !kin\) endFriendship\(st, p\)/.test(src),'letting a friend go must end the friendship, not leave them in the circle');
console.log('PASS v221-kin-bond');
const fam=fs.readFileSync(new URL('../src/data/eventsEverydayFamily.js',import.meta.url),'utf8');
const ti=fam.indexOf("id: 'ev_family_sib_tuition'");
assert.ok(/p\.sib\.age\) > 40\) return null/.test(fam.slice(ti,ti+900)),'sibling tuition needs a sibling age limit');
console.log('PASS v221-sib-tuition-age');
