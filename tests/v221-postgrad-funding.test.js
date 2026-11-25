import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { enrollPostgraduateProgram, postgradParentsCanPay } from '../src/systems/completeLifeSystems.js';
import { familyEducationFunds } from '../src/systems/educationFunding.js';
function life(tier, age) { const s = createNewLifeState({ country: 'egy', seed: 9, familyTier: tier, birthYear: 1990, age: 0 }); ensureExtendedState(s); s.player.age = age; s.year = 1990 + age; s.month = 9; s.education.degrees = ['business']; s.education.university = null; return s; }
const w = life('wealthy', 22); const cash0 = w.money.cash; const f0 = familyEducationFunds(w);
assert.ok(postgradParentsCanPay(w, 'masters_mba'));
const r = enrollPostgraduateProgram(w, 'masters_mba', 'family'); assert.ok(r.ok, r.msg);
assert.equal(w.money.cash, cash0, 'parents paid: your cash untouched'); assert.ok(familyEducationFunds(w) < f0, 'family funds drawn down'); assert.equal(w.postgrad.active.paidBy, 'your parents');
assert.equal(enrollPostgraduateProgram(w, 'masters_mba', 'family').ok, false, 'no double enrol');
const o = life('wealthy', 33); assert.equal(enrollPostgraduateProgram(o, 'masters_mba', 'family').ok, false, 'over 30: parents do not pay'); assert.equal(o.postgrad.active, null);
const p = life('struggling', 22); assert.equal(enrollPostgraduateProgram(p, 'masters_mba', 'family').ok, false, 'poor family cannot'); assert.equal(p.postgrad.active, null);
const d = life('wealthy', 22); for (const id of [d.relations.fatherId, d.relations.motherId]) d.people[id].alive = false; assert.equal(enrollPostgraduateProgram(d, 'masters_mba', 'family').ok, false, 'dead parents cannot pay');
const c = life('wealthy', 22); c.money.cash = 0; assert.equal(enrollPostgraduateProgram(c, 'masters_mba', 'cash').ok, false, 'cash route still needs the cash');
console.log('postgrad-funding OK');
