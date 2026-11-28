// The estate breakdown says the shares and tax are simplified game rules, UK-only tax, not real-world guidance.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const { renderEstateRecord } = await import('../src/systems/companyEstate.js');
const NOTE = /Game rule, simplified: gifts to charity \(up to a third of the estate\) come off first\. Only the UK is charged estate tax here, at 40% of what is left above a fixed allowance of 325,000 pounds scaled to the era, with no spouse or home allowance\. Other countries show no estate tax, though several really do tax inheritances\. Who inherits and in what shares is the game&#39;s own rule, not any country&#39;s succession law\. This is not real-world legal or tax guidance\./;
const html = renderEstateRecord({ estateSettlement: { year: 2043, country: 'usa', gross: 523152, charity: 0, tax: 0, companies: [] }, people: {} });
assert.match(html, NOTE, 'the saved estate record carries the note');
assert.match(fs.readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8'), NOTE, 'the end-of-life screen carries the same note');
console.log('PASS v221-estate-scope-note');
