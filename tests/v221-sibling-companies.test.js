// Sibling-owned companies: founded from the sibling's own savings through the real business model, conserved, run monthly by the existing NPC settlement.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const C = await import('../src/systems/siblingCompanies.js');
const { settleNpcCompanyHoldings } = await import('../src/systems/companyEstate.js');
const mk = (tier = 'very_wealthy') => { let S; for (let sd = 1; sd < 120; sd++) { S = createNewLifeState({ seed: sd, country: 'usa', birthYear: 1990, familyTier: tier, gender: 'm' }); ensureExtendedState(S); if (S.relations.siblingIds.length >= 2) break; } S.year = 2025; return S; };
assert.equal(C.siblingFieldFor('Senior Accountant'), 'accounting_firm'); assert.equal(C.siblingFieldFor('Senior Teacher'), 'tutoring_center'); assert.equal(C.siblingFieldFor('Operations Coordinator'), null, 'a vague title names no field'); assert.equal(C.siblingFieldFor('Nurse'), null);
{ const S = mk(); const [a, b] = S.relations.siblingIds; const p = S.people[a]; p.age = 40; p.alive = true; p.career = { title: 'Senior Teacher', employer: 'X LLP', monthlyIncomeLocal: 9000, savingsLocal: 5e6 };
  const before = p.career.savingsLocal, nid0 = JSON.stringify(S.ids || {}); const r = C.foundSiblingCompany(S, a, 'tutoring_center'); assert.ok(r.ok, r.msg);
  assert.equal(p.ownedBusinesses.length, 1); const biz = p.ownedBusinesses[0]; assert.ok(biz.manager, 'a paid manager runs it'); assert.equal(p.career.title, 'Senior Teacher', 'they keep their job'); assert.equal(p.career.employer, 'X LLP');
  assert.equal(Math.round(before - p.career.savingsLocal), Math.round(r.spent), 'savings fell by exactly the launch cost'); assert.ok(r.spent <= before * 0.15 + 2 * 0, 'within the cap');
  assert.match(C.siblingCompanyLine(S, a), /^Owns .*, run by a paid manager\. No month settled yet\.$/);
  const other = Object.values(S.people).filter(x => x.ownedBusinesses?.length).length; assert.equal(other, 1, 'nobody else gained one');
  assert.ok(!(S.career.businesses || []).some(x => x.id === biz.id), "the player's own book is untouched");
  S.month = 4; let m = 0; for (let i = 0; i < 24; i++) { S.month = (S.month % 12) + 1; if (S.month === 1) S.year++; settleNpcCompanyHoldings(S); m++; } assert.ok(Number.isFinite(p.career.savingsLocal), 'monthly settlement runs on it'); assert.ok(biz.history || biz.lastNpcEstateMonth, 'it was ticked');
  /* repeat: once only */ assert.equal(C.syncSiblingCompanies(S), 0); }
{ /* a licensed field is not waived: no degree record, no company */ const S = mk(); const a = S.relations.siblingIds[0]; const p = S.people[a]; p.age = 40; p.career = { title: 'Senior Accountant', employer: 'X', monthlyIncomeLocal: 9000, savingsLocal: 5e6 }; const r = C.foundSiblingCompany(S, a, 'accounting_firm'); assert.equal(r.ok, false); assert.match(r.msg, /qualification/i); assert.equal(p.career.savingsLocal, 5e6); }
{ const S = mk(); const a = S.relations.siblingIds[0]; const p = S.people[a]; p.age = 40; p.career = { title: 'Senior Teacher', employer: 'X', monthlyIncomeLocal: 9000, savingsLocal: 1000 }; assert.equal(C.foundSiblingCompany(S, a, 'tutoring_center').ok, false, 'modest savings found nothing'); assert.equal(p.career.savingsLocal, 1000); assert.ok(!p.ownedBusinesses?.length); }
{ const S = mk('middle'); S.month = 3; assert.equal(C.syncSiblingCompanies(S), 0, 'ordinary family untouched'); }
{ /* the yearly look founds it for an eligible accountant sometime, and only once */
  const S = mk(); const a = S.relations.siblingIds[0]; const p = S.people[a]; p.age = 40; p.alive = true; p.career = { title: 'Senior Teacher', employer: 'X', monthlyIncomeLocal: 9000, savingsLocal: 5e6 }; (await import('../src/systems/familyFortune.js')).ensureFamilyFortune(S); S.month = 3; let founded = 0;
  for (let y = 0; y < 60 && !founded; y++) { S.year = 2025 + y; p.age = 40; founded += C.syncSiblingCompanies(S); } assert.equal(founded, 1, 'founded within the years'); assert.equal(p.ownedBusinesses.length, 1);
  for (let y = 0; y < 30; y++) { S.year += 1; C.syncSiblingCompanies(S); } assert.equal(p.ownedBusinesses.length, 1, 'once only');
  const { inheritNpcCompanies } = await import('../src/systems/companyEstate.js'); const sav = p.career.savingsLocal; p.alive = false; let threw = false; try { inheritNpcCompanies(S, p); } catch (e) { threw = e; } assert.equal(threw, false, String(threw)); assert.deepEqual(p.ownedBusinesses, [], 'the company went through the existing estate settlement'); }
console.log('sibling companies OK');
{ /* an open decision (functions in its choices) must not break the monthly company run: this crashed the month before the copy skipped open decisions */
  const S = mk(); const a = S.relations.siblingIds[0]; const p = S.people[a]; p.age = 40; p.alive = true; p.career = { title: 'Senior Teacher', employer: 'X', monthlyIncomeLocal: 9000, savingsLocal: 5e6 };
  assert.ok(C.foundSiblingCompany(S, a, 'tutoring_center').ok); S.activeScene = { key: 'x', title: 'x', choices: [{ label: 'go', effect: st => st }] }; S.sceneQueue = [{ key: 'y', choices: [{ label: 'z', effect: () => 1 }] }];
  S.month = 5; assert.doesNotThrow(() => settleNpcCompanyHoldings(S)); assert.equal(S.activeScene.key, 'x', 'the open decision is untouched'); }
console.log('sibling companies OK');
