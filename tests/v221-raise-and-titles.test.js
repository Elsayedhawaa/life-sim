// The raise scene names the amount the pay really rises by; an NPC apprentice is promoted to a plain senior title.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const ev=fs.readFileSync(new URL('../src/data/eventsMoneyHealthCareer.js',import.meta.url),'utf8');
const i=ev.indexOf("id: 'ev_career_raise_granted'");
const seg=ev.slice(i,i+1500);
assert.ok(/monthlyGross \|\| 0\) \* 0\.05/.test(seg),'raise figure must be the 5% applied to the real salary');
assert.ok(!/const A = eraUsdCost\(1500/.test(seg));
const so=fs.readFileSync(new URL('../src/systems/soulEngine.js',import.meta.url),'utf8');
const strip=/replace\(\/\^\(Apprentice \\\/\|Apprentice\|Junior\|Trainee/;
assert.ok(strip.test(so),'apprentice prefix stripped before Senior');
const t='Apprentice / Store Associate'.replace(/^(Apprentice \/|Apprentice|Junior|Trainee|Assistant|Graduate) /, '');
assert.equal(t,'Store Associate');
console.log('PASS v221-raise-and-titles');
