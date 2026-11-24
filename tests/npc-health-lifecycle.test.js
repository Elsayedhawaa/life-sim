import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState, createPerson } from '../src/core/schema.js';
import { advanceSingleTurn } from '../src/core/gameLoop.js';
import { snapshotMajor, announceMajorChanges } from '../src/systems/majorLifeEvents.js';
import { tickNpcHealthLife } from '../src/systems/npcHealthLife.js';
import { handleNpcDeath } from '../src/systems/soulEngine.js';
const D = { die: handleNpcDeath };
const add = (s, role, age, list) => { const p = createPerson(s, { role, age, nationality: 'gbr', residenceCountry: 'gbr' }); s.people[p.id] = p; list.push(p.id); return p; };
function fresh(seed) { const s = createNewLifeState({ country: 'gbr', seed }); ensureExtendedState(s); add(s, 'sibling', s.player.age + 2, s.relations.siblingIds); return s; }
// REAL game loop (advanceSingleTurn: yearly childhood, monthly adult, every tick the game runs).
// Player choices are NOT made: any open scene is dismissed, so no player marriages or children happen.
// Relatives are the generated parents and one sibling; nothing is injected.
let lives = 0, relDeaths = 0, withCause = 0, announced = 0, youngDeaths = 0;
for (let seed = 1; seed <= 25; seed++) {
  const s = fresh(seed); lives++;
  for (let i = 0; i < 700 && !s.gameOver && s.player.age < 65; i++) {
    const before = snapshotMajor(s), aliveBefore = new Set(Object.values(s.people).filter(p => p.alive).map(p => p.id));
    s.activeScene = null; s.sceneQueue = [];
    advanceSingleTurn(s);
    for (const p of Object.values(s.people)) if (aliveBefore.has(p.id) && !p.alive && p.id !== 'player') {
      relDeaths++; if (p.deathCause) withCause++;
      if (p.age >= 18 && p.age <= 57) { youngDeaths++; assert(p.illness || p.accident, 'young death has a recorded cause record'); assert(p.deathCause, 'and a cause'); }
      const rec = (s.majorEvents || []).filter(e => e.kind === 'death' && e.personId === p.id);
      if (rec.length) { announced++; assert.equal(rec[0].facts.cause, p.deathCause || null, 'announcement cause equals recorded cause'); }
    }
  }
}
console.log(`real-loop lives ${lives}: relative deaths ${relDeaths}, with cause ${withCause}, young (18-57) ${youngDeaths}, announced ${announced}`);
// Reload: serialise mid-way, both copies continue identically (no hidden shared state).
{ const a = fresh(77); for (let y = 0; y < 15; y++) { a.year++; for (const p of Object.values(a.people)) if (p.alive && p.id !== 'player') p.age++; tickNpcHealthLife(a, D); }
  const b = JSON.parse(JSON.stringify(a));
  for (let y = 0; y < 30; y++) for (const s of [a, b]) { s.year++; for (const p of Object.values(s.people)) if (p.alive && p.id !== 'player') p.age++; tickNpcHealthLife(s, D); }
  const strip = (o) => { const c = { ...o.people }; delete c.player; return JSON.stringify(c); }; assert.equal(strip(a), strip(b), 'reloaded state continues identically'); }
// Idempotence: running the same year's tick twice does not produce a second diagnosis, injury or death.
{ let checked = 0; for (let seed = 1; seed <= 200; seed++) { const s = fresh(seed); s.year = 2050; const sib = s.people[s.relations.siblingIds[0]]; sib.age = 45;
    const e1 = tickNpcHealthLife(s, D); const snap = JSON.stringify(s.people); const e2 = tickNpcHealthLife(s, D);
    if (e1.some(e => e.kind === 'illness_onset' || e.kind === 'accident_injury')) { checked++; assert(!e2.some(e => e.kind === 'illness_onset'), 'no second onset in the same year'); }
    assert(JSON.stringify(s.people) !== undefined); } assert(checked > 0); }
// Identity: another person's presence does not change this person's outcome (rolls keyed by seed, id, year).
{ for (let seed = 1; seed <= 50; seed++) { const a = fresh(seed), b = fresh(seed); const extra = add(b, 'sibling', 30, b.relations.siblingIds);
    const sa = a.people[a.relations.siblingIds[0]], sb = b.people[b.relations.siblingIds[0]]; assert.equal(sa.id, sb.id);
    for (let y = 0; y < 40; y++) for (const s of [a, b]) { s.year++; for (const p of Object.values(s.people)) if (p.alive) p.age++; tickNpcHealthLife(s, D); }
    assert.equal(JSON.stringify({ i: sa.illness, a: sa.accident, al: sa.alive, c: sa.deathCause }), JSON.stringify({ i: sb.illness, a: sb.accident, al: sb.alive, c: sb.deathCause }), 'same person, same life, same outcome'); } }
console.log('reload, idempotence and identity checks pass');
// Strict idempotence: a second tick in the same calendar year changes nothing at all.
{ for (let seed = 1; seed <= 300; seed++) { const s = fresh(seed); s.year = 2050; const sib = s.people[s.relations.siblingIds[0]]; sib.age = 50 + (seed % 7);
    tickNpcHealthLife(s, D); const snap = JSON.stringify(s); const ev = tickNpcHealthLife(s, D); assert.equal(ev.length, 0); assert.equal(JSON.stringify(s), snap, 'same-year re-run is a no-op'); } }
// Healed injury gets a recovery year; fatal one never does.
{ let healed = 0; for (let seed = 1; seed <= 600 && healed < 3; seed++) { const s = fresh(seed); const sib = s.people[s.relations.siblingIds[0]]; for (let y = 0; y < 40 && sib.alive; y++) { s.year++; sib.age = Math.min(57, sib.age + 1); tickNpcHealthLife(s, D); }
    const a = sib.accident; if (a && a.severity !== 'fatal' && a.year < s.year) { assert(a.recoveredYear > a.year, 'non-fatal accident recorded as healed'); healed++; } if (a?.severity === 'fatal') assert(!a.recoveredYear); } assert(healed > 0); }
// Hand-off at 58: an illness recorded at 57 stays; this module stops rolling for the person.
{ const s = fresh(3); const sib = s.people[s.relations.siblingIds[0]]; sib.age = 58; sib.illness = { kind: 'cancer', sinceYear: s.year - 1 }; const before = JSON.stringify(sib); s.year++; assert.equal(tickNpcHealthLife(s, D).length, 0); assert.equal(JSON.stringify(sib), before, 'no health tick for 58+'); }
// Spouse who is also listed elsewhere is processed once.
{ const s = fresh(9); const sp = add(s, 'spouse', 40, s.relations.spouseIds); s.relations.siblingIds.push(sp.id); s.year = 2055; tickNpcHealthLife(s, D); assert.equal(sp.healthTickYear, 2055); }
console.log('strict idempotence, injury recovery, 58+ hand-off and dedup pass');
