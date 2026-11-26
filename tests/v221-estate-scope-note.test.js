// The estate breakdown says the shares and tax are simplified game rules, UK-only tax, not real-world guidance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { renderEstateRecord } = await import('../src/systems/companyEstate.js');
const NOTE = /Game rule: inheritance shares and estate tax are simplified\. Only the UK has an estate tax in this game; other countries show none\. This is not real-world legal or tax guidance\./;
const html = renderEstateRecord({ estateSettlement: { year: 2043, country: 'usa', gross: 523152, charity: 0, tax: 0, companies: [] }, people: {} });
assert.match(html, NOTE, 'the saved estate record carries the note');
assert.match(fs.readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8'), NOTE, 'the end-of-life screen carries the same note');
console.log('PASS v221-estate-scope-note');
