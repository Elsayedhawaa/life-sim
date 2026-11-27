import assert from'node:assert/strict';
import fs from'node:fs';
/* Played defect: a friend who made you best man was later called someone you have "no real history of standing by", and the silence clock ignored the conversation. Source-level checks. */
const fam=fs.readFileSync(new URL('../src/data/eventsEverydayFamily.js',import.meta.url),'utf8');
const mem=fs.readFileSync(new URL('../src/data/eventsMemory.js',import.meta.url),'utf8');
assert.equal((fam.match(/noteSocialContact\(st, p\.friend\);\s*\n\s*if \(p\.friend\) rememberDeed\(st, p\.friend, 'proud_moment'/g)||[]).length,2,'both best-man answers count as contact');
assert.ok(/findMemory\(friend, \['proud_moment', 'visited', 'kept_promise'\]\)/.test(mem),'a shared proud moment is remembered in the ask-for-help text');
console.log('ok v221 best man memory');
