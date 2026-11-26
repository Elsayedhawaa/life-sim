// A sibling-founded company that runs the owner out of savings says so; an inherited one keeps its inherited wording.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const C = await import('../src/systems/siblingCompanies.js');
const { settleNpcCompanyHoldings } = await import('../src/systems/companyEstate.js');
const mk = (tier = 'very_wealthy') => { let S; for (let sd = 1; sd < 120; sd++) { S = createNewLifeState({ seed: sd, country: 'usa', birthYear: 1990, familyTier: tier, gender: 'm' }); ensureExtendedState(S); if (S.relations.siblingIds.length >= 2) break; } S.year = 2025; return S; };
{ const S = mk(); const [a, b] = S.relations.siblingIds; const p = S.people[a]; p.age = 40; p.alive = true; p.career = { title: 'Senior Teacher', employer: 'X LLP', monthlyIncomeLocal: 9000, savingsLocal: 5e6 };
  assert.ok(C.foundSiblingCompany(S, a, 'tutoring_center').ok); const biz = p.ownedBusinesses[0]; assert.equal(biz.foundedByOwner, true);
  p.career.savingsLocal = 0; for (let i = 0; i < 6 && !biz.dead; i++) { S.month = (S.month % 12) + 1; if (S.month === 1) S.year++; settleNpcCompanyHoldings(S); p.career.savingsLocal = 0; }
  assert.ok(biz.dead, 'it closed'); assert.match(biz.deathCause, /used up the owner's savings/); assert.doesNotMatch(biz.deathCause, /Inherited/);
}
console.log('PASS v221-sibling-death-cause');
