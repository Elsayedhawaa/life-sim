import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState, createPerson } from '../src/core/schema.js';
import { tickNpcHealthLife } from '../src/systems/npcHealthLife.js';
import { handleNpcDeath } from '../src/systems/soulEngine.js';
const D = { die: handleNpcDeath };
function life(seed, age = 20) {
  const s = createNewLifeState({ country: 'gbr', seed }); ensureExtendedState(s); s.year = 2040; s.month = 1; s.player.age = age;
  for (const id of [s.relations.motherId, s.relations.fatherId]) if (s.people[id]) { s.people[id].age = age + 28; }
  for (let i = 0; i < 2; i++) { const p = createPerson(s, { role: 'sibling', age: age + 2 * i - 1, nationality: 'gbr', residenceCountry: 'gbr' }); s.people[p.id] = p; s.relations.siblingIds.push(p.id); }
  return s;
}
let deaths = 0, withCause = 0, onsets = 0, recoveries = 0, accidentsFatal = 0, personYears = 0, famLoss = [], bands = {};
const LIVES = 400;
for (let seed = 1; seed <= LIVES; seed++) {
  const s = life(seed); let lost = 0;
  for (let y = 0; y < 60; y++) {
    s.year++; s.player.age++; for (const p of Object.values(s.people)) if (p.alive) p.age++;
    for (const [id, p] of Object.entries(s.people)) if (p.alive && id !== 'player' && p.age >= 18 && p.age <= 57 && p.role !== 'boss') { personYears++; const b = Math.floor(p.age / 10) * 10; (bands[b] ??= { py: 0, d: 0 }).py++; }
    const before = new Set(Object.values(s.people).filter(p => p.alive).map(p => p.id));
    const ev = tickNpcHealthLife(s, D);
    for (const e of ev) {
      if (e.kind === 'illness_onset') onsets++;
      if (e.kind === 'illness_recovered') recoveries++;
      if (e.kind.endsWith('_death')) {
        const p = s.people[e.id]; deaths++; lost++; assert(!p.alive); assert(p.age >= 18 && p.age <= 57, 'no minors, no elderly path');
        const b = Math.floor(p.age / 10) * 10; bands[b].d++;
        if (e.kind === 'accident_death') { assert.equal(p.deathCause, 'an accident'); assert(p.accident?.severity === 'fatal'); accidentsFatal++; withCause++; }
        else { assert(p.illness && p.illness.sinceYear < s.year, 'illness recorded in an earlier year'); assert(p.deathCause == null || /./.test(p.deathCause)); withCause++; }
      }
    }
    // determinism: same state, same year => no second death from a replay
  }
  famLoss.push(lost);
}
assert.equal(deaths, withCause, 'every young death has a recorded cause');
// minors untouched
{ const s = life(5, 20); const kid = createPerson(s, { role: 'child', age: 10, nationality: 'gbr', residenceCountry: 'gbr' }); s.people[kid.id] = kid; s.relations.childIds.push(kid.id); for (let y = 0; y < 300; y++) { s.year++; tickNpcHealthLife(s, D); } assert(kid.alive && !kid.illness && !kid.accident, 'minor relatives are out of scope'); }
// elderly untouched by this module
{ const s = life(6, 70); for (const id of [s.relations.motherId, s.relations.fatherId]) if (s.people[id]) s.people[id].age = 70; for (let y = 0; y < 200; y++) { s.year++; tickNpcHealthLife(s, D); } const m = s.people[s.relations.motherId]; assert(m.alive && !m.illness); }
// old saves: missing vitals/fields tolerated
{ const s = life(7); const sib = s.people[s.relations.siblingIds[0]]; delete sib.vitals; assert.doesNotThrow(() => { for (let y = 0; y < 50; y++) { s.year++; tickNpcHealthLife(s, D); } }); }
// idempotent roll: same year twice with same state does not double-kill
{ const s = life(8); const a = tickNpcHealthLife(s, D).length; const snap = JSON.stringify(s.people); const s2 = life(8); const b = tickNpcHealthLife(s2, D).length; assert.equal(a, b); assert.equal(snap, JSON.stringify(s2.people)); }
const avg = famLoss.reduce((a, b) => a + b, 0) / LIVES;
console.log(`lives ${LIVES}, tracked person-years ${personYears}, onsets ${onsets}, recoveries ${recoveries}, deaths ${deaths} (fatal accidents ${accidentsFatal}), mean relatives lost to 18-57 deaths per 60-year life ${avg.toFixed(2)}`);
for (const [b, v] of Object.entries(bands)) console.log(`age ${b}s: ${(v.d / v.py * 100).toFixed(3)}%/yr (${v.d}/${v.py})`);
const zero = famLoss.filter(x => x === 0).length; console.log(`lives with no such loss: ${(zero / LIVES * 100).toFixed(0)}%`);
