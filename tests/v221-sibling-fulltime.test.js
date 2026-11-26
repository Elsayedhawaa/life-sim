// A sibling company is run by a paid manager while the sibling keeps their job, so it trades full-time (the owner part-time cut does not apply). Same engine, no profit buff. This does not promise the company succeeds.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const C = await import('../src/systems/siblingCompanies.js');
const { settleNpcCompanyHoldings } = await import('../src/systems/companyEstate.js');
const mk = (tier = 'very_wealthy') => { let S; for (let sd = 1; sd < 120; sd++) { S = createNewLifeState({ seed: sd, country: 'usa', birthYear: 1990, familyTier: tier, gender: 'm' }); ensureExtendedState(S); if (S.relations.siblingIds.length >= 2) break; } S.year = 2025; return S; };
{ const S = mk(); const [a, b] = S.relations.siblingIds; const p = S.people[a]; p.age = 40; p.alive = true; p.career = { title: 'Senior Teacher', employer: 'X LLP', monthlyIncomeLocal: 9000, savingsLocal: 5e6 };
  assert.ok(C.foundSiblingCompany(S, a, 'tutoring_center').ok); const biz = p.ownedBusinesses[0];
  assert.equal(biz.mode, 'full_time'); assert.ok(biz.manager, 'still run by a paid manager'); assert.equal(p.career.title, 'Senior Teacher', 'the sibling keeps their job');
  /* it is not promised to succeed: only that the owner-hours cut is not applied and ownership, manager and job stay as they were */
  for (let i = 0; i < 12; i++) { S.month = (S.month % 12) + 1; if (S.month === 1) S.year++; settleNpcCompanyHoldings(S); }
  assert.equal(p.ownedBusinesses.length, 1); assert.equal(p.career.title, 'Senior Teacher'); assert.ok(Number.isFinite(p.career.savingsLocal) && p.career.savingsLocal >= 0);
}
console.log('PASS v221-sibling-fulltime');
