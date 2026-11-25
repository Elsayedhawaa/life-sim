import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { familyEducationFunds, familyCoversUniversity, chargeFamilyEducation } from '../src/systems/educationFunding.js';
function life(tier) { const s = createNewLifeState({ country: 'egy', seed: 11, familyTier: tier, birthYear: 1974, age: 0 }); ensureExtendedState(s); s.player.age = 18; s.year = 1992; return s; }
const w = life('wealthy'), m = life('middle');
const fw = familyEducationFunds(w), fm = familyEducationFunds(m);
assert.ok(fw > fm * 5, 'wealthy family ends with far more than a middle one');
assert.equal(familyEducationFunds(w), fw, 'catch-up is applied once, reading twice adds nothing');
assert.ok(familyCoversUniversity(w, 19335, 'egy'), 'wealthy family covers a 19k year at 18');
assert.ok(!familyCoversUniversity(m, 19335, 'egy'), 'middle family still does not (no free money)');
assert.ok(chargeFamilyEducation(w, 10000)); assert.ok(familyEducationFunds(w) < fw - 9000, 'charging still draws the savings down');
// month by month accrual after the catch-up
const before = familyEducationFunds(w); w.month = (w.month || 1); w.year += 1; assert.ok(familyEducationFunds(w) > before, 'savings keep growing with parents income');
console.log('parent-funding OK');
// reserve is finite, drawn down, and unavailable once both parents are dead; no money from opening panels
const d = life('wealthy'); const f0 = familyEducationFunds(d);
for (let i = 0; i < 5; i++) familyCoversUniversity(d, 1, 'egy');
assert.equal(familyEducationFunds(d), f0, 'opening/reading panels creates no money');
assert.ok(!chargeFamilyEducation(d, f0 + 1000), 'cannot charge more than the finite family funds');
for (const id of [d.relations.fatherId, d.relations.motherId]) d.people[id].alive = false;
assert.equal(familyEducationFunds(d), 0, 'dead parents: no income, no reserve');
console.log('parent-funding extra OK');
