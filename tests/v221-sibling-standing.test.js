// Rich siblings as people: title, employer and stake follow the real company; no money is created or moved.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const mk = (tier, seed = 2) => { const S = createNewLifeState({ seed, country: 'usa', birthYear: 1990, familyTier: tier, gender: 'm' }); ensureExtendedState(S); S.year = 2025; F.ensureFamilyFortune(S); return S; };
{ let S = mk('very_wealthy'); for (let sd = 3; S.relations.siblingIds.filter(i => S.people[i]?.alive).length < 2 && sd < 200; sd++) S = mk('very_wealthy', sd); const f = S.familyFortune; const ids = S.relations.siblingIds.filter(i => S.people[i]?.alive); assert.ok(ids.length >= 2);
  ids.forEach((id, i) => { const p = S.people[id]; p.age = 35; p.career = { ...(p.career || {}), title: 'Senior Analyst', employer: 'Elsewhere Ltd', monthlyIncomeLocal: 5000, savingsLocal: 123456 }; p.career.familyWorks = i === 0; });
  f.own.siblings[ids[0]] = 5; f.own.siblings[ids[1]] = 5;
  assert.ok(F.syncSiblingStanding(S, f) >= 1);
  const a = S.people[ids[0]], b = S.people[ids[1]];
  assert.equal(a.career.title, 'Senior Analyst', 'their own title and history are kept'); assert.equal(a.career.employer, f.company.name); assert.equal(F.siblingEmployerLine(S, ids[0]), ` at ${f.company.name}`); assert.equal(a.career.monthlyIncomeLocal, 5000); assert.equal(a.career.savingsLocal, 123456, 'no money moved');
  assert.equal(b.career.title, 'Senior Analyst', 'a shareholder who does not work there keeps their real job'); assert.equal(b.career.employer, 'Elsewhere Ltd'); assert.equal(F.siblingEmployerLine(S, ids[1]), '');
  assert.match(F.siblingStakeLine(S, ids[1]), new RegExp(`Owns 5% of ${f.company.name}`), 'shareholding is shown on its own line');
  assert.equal(F.syncSiblingStanding(S, f), 0, 'idempotent'); S.year += 3; assert.equal(F.syncSiblingStanding(S, f), 0);
  /* the ordinary NPC machinery promotes them: nothing here overwrites it */
  a.career.title = 'Lead Senior Analyst'; a.career.monthlyIncomeLocal = 9000; F.syncSiblingStanding(S, f); assert.equal(a.career.title, 'Lead Senior Analyst'); assert.equal(a.career.monthlyIncomeLocal, 9000);
  /* job loss ends the post and is not restored */
  a.career.title = 'Seeking Work'; a.career.monthlyIncomeLocal = 0; F.syncSiblingStanding(S, f); assert.equal(a.career.title, 'Seeking Work'); assert.equal(a.career.monthlyIncomeLocal, 0); assert.equal(a.career.employer, null); assert.equal(F.siblingEmployerLine(S, ids[0]), '');
  a.career.title = 'Analyst'; a.career.monthlyIncomeLocal = 4000; F.syncSiblingStanding(S, f); assert.equal(a.career.employer, null, 'a new job elsewhere is not re-stamped as the family company');
  a.career.title = 'Retired'; F.syncSiblingStanding(S, f); assert.equal(a.career.title, 'Retired'); }
{ /* titles stamped by the first version are put back once */
  let S = mk('very_wealthy'); for (let sd = 3; S.relations.siblingIds.filter(i => S.people[i]?.alive).length < 1 && sd < 200; sd++) S = mk('very_wealthy', sd); const id = S.relations.siblingIds.find(i => S.people[i]?.alive); const p = S.people[id]; p.age = 40; p.career = { ...(p.career || {}), title: 'Director at X', familyStanding: 'post', familyPostSince: 2020, employer: S.familyFortune.company.name, monthlyIncomeLocal: 7000 };
  F.syncSiblingStanding(S, S.familyFortune); assert.equal(p.career.title, 'Operations Coordinator'); assert.equal(p.career.monthlyIncomeLocal, 7000); }
{ const S = mk('middle'); assert.equal(F.syncSiblingStanding(S, S.familyFortune), 0, 'ordinary family untouched'); }
// assets: bought from the sibling's own savings, once, conserved, restored on death
{ let S = mk('very_wealthy'); for (let sd = 3; S.relations.siblingIds.filter(i => S.people[i]?.alive).length < 1 && sd < 200; sd++) S = mk('very_wealthy', sd);
  const id = S.relations.siblingIds.find(i => S.people[i]?.alive), p = S.people[id]; p.age = 40; p.residenceCountry = 'usa'; p.career = { ...(p.career || {}), savingsLocal: 50e6 };
  const { eraLocalCost } = await import('../src/data/economy.js');
  assert.ok(F.syncSiblingAssets(S) >= 1); assert.ok(p.assets.home && p.assets.car, 'a rich sibling owns a home and a car');
  assert.equal(p.career.savingsLocal + p.assets.home.price + p.assets.car.price, 50e6, 'savings fell by exactly what the assets cost: nothing created');
  assert.ok(p.assets.home.price <= 50e6 * 0.25 && p.assets.car.price <= 50e6 * 0.03);
  const snap = JSON.stringify(p.assets); assert.equal(F.syncSiblingAssets(S), 0, 'bought once'); assert.equal(JSON.stringify(p.assets), snap);
  assert.match(F.siblingAssetsLine(S, id), /^Owns an? .* worth .* and drives a /);
  const worth = p.career.savingsLocal + p.assets.home.price + p.assets.car.price; const hp0 = p.assets.home.price; p.residenceCountry = 'jpn'; const { convertCurrency } = await import('../src/data/economy.js'); const worthJ = Math.round(p.career.savingsLocal + convertCurrency(p.assets.home.price, 'usa', 'jpn', S.year) + convertCurrency(p.assets.car.price, 'usa', 'jpn', S.year)); p.career.savingsLocal = Math.round(convertCurrency(p.career.savingsLocal, 'usa', 'jpn', S.year)); p.alive = false; F.syncSiblingAssets(S); assert.ok(Math.abs(p.career.savingsLocal - Math.round(convertCurrency(worth, 'usa', 'jpn', S.year))) <= 3, 'on death the assets return to savings at the same value, in the currency they live in'); assert.equal(F.siblingAssetsLine(S, id), ''); assert.equal(F.syncSiblingAssets(S), 0);
  const q = mk('very_wealthy'); const qid = q.relations.siblingIds.find(i => q.people[i]?.alive); if (qid) { q.people[qid].age = 40; q.people[qid].career = { ...(q.people[qid].career || {}), savingsLocal: 1000 }; F.syncSiblingAssets(q); assert.ok(!q.people[qid].assets?.home, 'modest savings buy no home'); }
  const m = mk('middle'); assert.equal(F.syncSiblingAssets(m), 0, 'ordinary family untouched'); }
{ /* wealth grows: they upgrade, the old home is taken back at its recorded value, nothing is created */
  let S = mk('very_wealthy'); for (let sd = 3; S.relations.siblingIds.filter(i => S.people[i]?.alive).length < 1 && sd < 200; sd++) S = mk('very_wealthy', sd);
  const id = S.relations.siblingIds.find(i => S.people[i]?.alive), p = S.people[id]; p.age = 40; p.residenceCountry = 'usa'; p.career = { ...(p.career || {}), savingsLocal: 3e6 }; F.syncSiblingAssets(S);
  const h0 = p.assets.home?.price || 0, c0 = p.assets.car?.price || 0; assert.ok(h0 > 0);
  p.career.savingsLocal += 200e6; const total0 = p.career.savingsLocal + h0 + c0; F.syncSiblingAssets(S);
  assert.ok(p.assets.home.price > h0 * 2, 'a richer sibling lives in a bigger home'); assert.equal(p.career.savingsLocal + p.assets.home.price + p.assets.car.price, total0, 'net worth unchanged by the move'); const snap = JSON.stringify(p.assets); assert.equal(F.syncSiblingAssets(S), 0); assert.equal(JSON.stringify(p.assets), snap); }
console.log('sibling standing OK');
