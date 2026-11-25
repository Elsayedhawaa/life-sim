import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { familyEducationFunds } from '../src/systems/educationFunding.js';
import { getUniversitiesFor } from '../src/data/institutions.js';
import { universityAffordability } from '../src/systems/careerEducationEngine.js';
const s = createNewLifeState({ country: 'egy', seed: 11, familyTier: 'wealthy', birthYear: 1974, age: 0 }); ensureExtendedState(s);
s.player.age = 18; s.year = 1992;
const f = s.people[s.relations.fatherId], m = s.people[s.relations.motherId];
// legacy shape: frozen savings from the user's save, no accrual marker, no reserve
f.savings = 2855; m.savings = 6779; delete s.education.parentSavingsAccrual; delete s.education.familyReserve;
const auc = getUniversitiesFor('egy', s.year).find(u => /American/.test(u.name));
const a1 = universityAffordability(s, auc);
const funds1 = familyEducationFunds(s);
assert.ok(funds1 > 9634, 'legacy savings are kept and topped up, not reset');
const a2 = universityAffordability(s, auc), funds2 = familyEducationFunds(s);
assert.equal(funds2, funds1, 'second read adds no money');
assert.equal(a2.status, a1.status);
console.log('legacy AUC', a1.status, Math.round(funds1));
assert.notEqual(a1.status, 'cannot', 'wealthy-tier parents can cover AUC after recovery');
