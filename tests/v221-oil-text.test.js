// The Gulf budget wording appears only in Gulf lives.
import assert from 'node:assert/strict';
const {WORLD_EVENTS,eventHeadline}=await import('../src/data/worldEvents.js');
const ev=WORLD_EVENTS.find(e=>e.id==='oil_crash_2014');
assert.match(eventHeadline(ev,'sau'),/Gulf budgets/);assert.match(eventHeadline(ev,'uae'),/Gulf budgets/);
for(const c of ['ita','can','aus','egy','usa','jpn'])assert.ok(!/Gulf/.test(eventHeadline(ev,c)),c);
console.log('PASS v221-oil-text');
