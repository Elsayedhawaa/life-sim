// Sweep fixes: no "senior junior" NPC title, no zero-euro cost wording, job-hunt scenes stop in later life, Zakat only for Muslim players.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const rd=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
assert.ok(/Junior\|Trainee/.test(rd('systems/soulEngine.js')),'promotion strips Junior/Trainee prefix');
assert.ok(/maxAge: 64/.test(rd('data/eventsLivedLife.js')),'job-hunt scenes capped');
assert.ok(/religion\|\|''\)\.toLowerCase\(\)!=='muslim'/.test(rd('data/eventsMoneyHealthCareer.js')),'zakat event gated');
assert.ok(/amt > 0 \?/.test(rd('data/eventsBusiness.js'))&&/fee > 0 \?/.test(rd('data/eventsBusiness.js')),'zero cost wording handled');
console.log('PASS v221-italy-sweep');
