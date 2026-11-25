import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { familyEducationFunds, chargeFamilyEducation } from '../src/systems/educationFunding.js';
import { indexNpcIncome } from '../src/systems/npcIncomeIndex.js';
import { getUniversitiesFor } from '../src/data/institutions.js';
import { annualUniversityBudget } from '../src/data/universityCosts.js';
function life(by, tier = 'wealthy') { const s = createNewLifeState({ country: 'egy', seed: 5, familyTier: tier, birthYear: by, age: 0 }); ensureExtendedState(s); s.player.age = 18; s.year = by + 18; s.month = 9; return s; }
// 1) idempotent: same year twice changes nothing
const a = life(1974); const dad = a.people[a.relations.fatherId];
assert.equal(indexNpcIncome(a, dad), true); const inc = dad.career.monthlyIncomeLocal;
assert.equal(indexNpcIncome(a, dad), false); assert.equal(dad.career.monthlyIncomeLocal, inc, 'second index in the same year is a no-op');
// 2) retired / dead / jobless are never revived
const r = life(1974); const rd = r.people[r.relations.fatherId]; rd.career.title = 'Retired'; rd.career.retiredYear = 1990; const before = rd.career.monthlyIncomeLocal;
indexNpcIncome(r, rd); assert.equal(rd.career.monthlyIncomeLocal, before, 'retired income untouched');
const d = life(1974); const dd = d.people[d.relations.fatherId]; dd.alive = false; indexNpcIncome(d, dd);
const j = life(1974); const jm = j.people[j.relations.motherId]; jm.career.monthlyIncomeLocal = 0; indexNpcIncome(j, jm); assert.equal(jm.career.monthlyIncomeLocal, 0, 'no income revived');
// 3) graduation test: the family covers all four AUC years in every era (tuition rises each year), reads are idempotent
for (const by of [1960, 1974, 1980, 1998, 2005]) {
  const s = life(by); const auc = getUniversitiesFor('egy', s.year).find(u => /American/.test(u.name));
  const f0 = familyEducationFunds(s); assert.equal(familyEducationFunds(s), f0, 'repeat read adds nothing');
  for (let y = 0; y < 4; y++) { s.year = by + 18 + y; const t = annualUniversityBudget(s, auc); assert.ok(chargeFamilyEducation(s, t), 'year ' + (y + 1) + ' of AUC paid, born ' + by); }
}
// 4) legacy save: user's real parents' savings are retained and added to, never reset
const l = life(1974); const f = l.people[l.relations.fatherId], m = l.people[l.relations.motherId];
f.career.savingsLocal = 2855; m.career.savingsLocal = 6779; f.career.monthlyIncomeLocal = 549; m.career.monthlyIncomeLocal = 397;
delete l.education.parentSavingsAccrual; delete l.education.familyReserve; delete f.career.incomeIndexYear; delete m.career.incomeIndexYear;
const lf = familyEducationFunds(l); assert.ok(lf > 9634, 'old 9,634 kept plus additive catch-up'); assert.equal(familyEducationFunds(l), lf);
assert.ok(f.career.savingsLocal >= 2855 && m.career.savingsLocal >= 6779, 'each parent keeps the original savings');
console.log('income-index OK');
