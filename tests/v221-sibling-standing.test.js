// Rich siblings as people: title, employer and stake follow the real company; no money is created or moved.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const mk = (tier, seed = 2) => { const S = createNewLifeState({ seed, country: 'usa', birthYear: 1990, familyTier: tier, gender: 'm' }); ensureExtendedState(S); S.year = 2025; F.ensureFamilyFortune(S); return S; };
{ let S = mk('very_wealthy'); for (let sd = 3; S.relations.siblingIds.filter(i => S.people[i]?.alive).length < 2 && sd < 200; sd++) S = mk('very_wealthy', sd); const f = S.familyFortune; const ids = S.relations.siblingIds.filter(i => S.people[i]?.alive); assert.ok(ids.length >= 2);
  ids.forEach((id, i) => { const p = S.people[id]; p.age = 35; p.career = { ...(p.career || {}), title: 'Operations Coordinator', monthlyIncomeLocal: 5000, savingsLocal: 123456 }; if (i === 0) p.career.familyWorks = true; if (i === 1) p.career.familyWorks = false; });
  f.own.siblings[ids[0]] = 5; if (ids[1]) f.own.siblings[ids[1]] = 5;
  const n = F.syncSiblingStanding(S, f); assert.ok(n >= 1);
  const a = S.people[ids[0]]; assert.equal(a.career.title, `Director at ${f.company.name}`); assert.equal(a.career.employer, f.company.name);
  if (ids[1]) assert.equal(S.people[ids[1]].career.title, 'Shareholder and private investor');
  assert.equal(a.career.monthlyIncomeLocal, 5000); assert.equal(a.career.savingsLocal, 123456, 'no money moved');
  assert.equal(F.syncSiblingStanding(S, f), 0, 'idempotent'); S.year++; assert.equal(F.syncSiblingStanding(S, f), 0, 'does not flip next year');
  assert.match(F.siblingStakeLine(S, ids[0]), new RegExp(`Owns 5% of ${f.company.name}`));
  a.age = 50; F.syncSiblingStanding(S, f); assert.equal(a.career.title, `Managing Director at ${f.company.name}`, 'rank follows age');
  a.career.title = 'Retired'; F.syncSiblingStanding(S, f); assert.equal(a.career.title, 'Retired', 'retired is left alone');
  f.company.sold = true; a.career.title = 'x'; a.career.familyStanding = 'post'; F.syncSiblingStanding(S, f); assert.equal(a.career.title, 'Private investor'); assert.equal(a.career.employer, null); assert.equal(F.siblingStakeLine(S, ids[0]), ''); }
{ const S = mk('middle'); assert.equal(F.syncSiblingStanding(S, S.familyFortune), 0, 'ordinary family untouched'); }
console.log('sibling standing OK');
