// Journal wording: long silences read as years; kin words keep proper nouns and do not read "Your sofia's son"; best man / maid of honour follows the player's gender.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {quietSpan}=await import('../src/systems/socialEnergy.js');
assert.equal(quietSpan(9),'9 months');assert.equal(quietSpan(14),'about a year');assert.equal(quietSpan(132),'about 11 years');
const fs=await import('node:fs');
const soul=fs.readFileSync(new URL('../src/systems/soulEngine.js',import.meta.url),'utf8');
assert.ok(!/\(\$\{mother\.relationLabel\}\) had a baby/.test(soul),'baby line must not print the raw role label in brackets');
assert.ok(!/toLowerCase\(\);\n\}\n\n\/\* Make sure the NPC-side/.test(soul),'kin word must not lowercase whole labels');
const ev=fs.readFileSync(new URL('../src/data/eventsEverydayFamily.js',import.meta.url),'utf8');
assert.ok(!/best man \/ maid of honour/.test(ev),'no slash role');
console.log('PASS v221-journal-wording');
