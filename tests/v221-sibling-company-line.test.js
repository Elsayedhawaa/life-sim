// The sibling company line states only recorded outcomes: no month yet, then the last settled month net, then bills owed if any.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const C = await import('../src/systems/siblingCompanies.js');
const { settleNpcCompanyHoldings } = await import('../src/systems/companyEstate.js');
const mk = (tier = 'very_wealthy') => { let S; for (let sd = 1; sd < 120; sd++) { S = createNewLifeState({ seed: sd, country: 'usa', birthYear: 1990, familyTier: tier, gender: 'm' }); ensureExtendedState(S); if (S.relations.siblingIds.length >= 2) break; } S.year = 2025; return S; };
{ const S = mk(); const [a, b] = S.relations.siblingIds; const p = S.people[a]; p.age = 40; p.alive = true; p.career = { title: 'Senior Teacher', employer: 'X LLP', monthlyIncomeLocal: 9000, savingsLocal: 5e6 };
  const r = C.foundSiblingCompany(S, a, 'tutoring_center'); assert.ok(r.ok, r.msg); const biz = p.ownedBusinesses[0];
  assert.match(C.siblingCompanyLine(S, a), /No month settled yet\./);
  for (let i = 0; i < 3; i++) { S.month = (S.month % 12) + 1; if (S.month === 1) S.year++; settleNpcCompanyHoldings(S); }
  const acc = biz.npcOwnerAccount; assert.ok(acc, 'a month was recorded');
  const line = C.siblingCompanyLine(S, a); assert.match(line, new RegExp(`Last settled month: ${acc.net >= 0 ? 'profit' : 'loss'} of `)); assert.doesNotMatch(line, /No month settled yet/);
  biz.debtLocal = 0; assert.doesNotMatch(C.siblingCompanyLine(S, a), /Bills owed/); biz.debtLocal = 1234; assert.match(C.siblingCompanyLine(S, a), /Bills owed: /);
  assert.doesNotMatch(line, /grow|trend|value|closed/i, 'nothing implied beyond recorded state');
}
console.log('PASS v221-sibling-company-line');
