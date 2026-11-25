// The connected internship (wealth event 3): a paid summer at a partner company, a reference, optional conversion, decline is free.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const N = await import('../src/systems/familyName.js');
const E = await import('../src/systems/careerEducationEngine.js');
const mk = (tier, age = 20, seed = 3) => { const S = createNewLifeState({ seed, country: 'usa', birthYear: 2000, familyTier: tier, gender: 'm' }); ensureExtendedState(S); S.player.age = age; S.year = 2020; S.month = 6; S.activeScene = null; S.sceneQueue = []; S.career.job = null; S.career.employed = false; if (S.education) S.education.university = null; F.ensureFamilyFortune(S); return S; };
const months = (S, n) => { for (let i = 0; i < n; i++) { S.month++; if (S.month > 12) { S.month = 1; S.year++; } S.activeScene = null; S.sceneQueue = []; F.tickConnectedInternship(S, S.familyFortune); } };
// offered in June to 17-23 wealthy kids at home, not to others
const S = mk('wealthy'); const o = F.offerConnectedInternship(S); assert.ok(o && o.employer && o.pay > 0, 'wealthy 20-year-old is offered one in June');
assert.equal(F.restoreHomeScene(S, { key: 'family_intern' })?.key, 'family_intern', 'survives a reload');
for (const [t, a, m] of [['middle', 20, 6], ['wealthy', 16, 6], ['wealthy', 25, 6], ['wealthy', 20, 3]]) { const T = mk(t, a); T.month = m; assert.equal(F.offerConnectedInternship(T), null, `${t}/${a}/${m}`); }
{ const T = mk('wealthy'); T.country = 'deu'; assert.equal(F.offerConnectedInternship(T), null, 'only where the family is connected'); }
{ const T = mk('wealthy'); T.career.employed = true; T.career.job = { employer: 'Z', title: 'Y' }; assert.equal(F.offerConnectedInternship(T), null, 'not for someone already in a job'); }
assert.ok(F.offerConnectedInternship(mk('upper_middle')), 'the brief gives the internship to every fortune tier, 17-23');
// accept: nothing paid upfront, one month's pay each month, exactly three, then a reference and a conversion offer
const cash0 = S.money.cash; assert.ok(F.resolveIntern(S, true).taken); assert.equal(S.money.cash, cash0, 'no upfront payment');
months(S, 1); assert.equal(Math.round(S.money.cash - cash0), o.pay); months(S, 1); months(S, 1);
assert.equal(Math.round(S.money.cash - cash0), o.pay * 3, 'three months of pay'); const f = S.familyFortune;
assert.ok(f.reference && f.reference.employer === o.employer && !f.intern && f.internDone, 'reference earned');
assert.ok(f.internConvert, 'a free 20-year-old is offered the job'); months(S, 6); assert.equal(S.money.cash - cash0, o.pay * 3, 'no pay after it ends');
assert.equal(N.internshipReferencePoints(S), 4); assert.equal(N.internshipReferencePoints(mk('wealthy')), 0, 'no reference, no points');
// the reference really moves the interview score (same seed, only the reference differs)
{ const A = mk('wealthy', 22, 9), B = mk('wealthy', 22, 9); B.familyFortune.reference = { employer: 'X', year: 2019 }; const sa = E.scoreJobInterview(A, { employer: 'Y', title: 'Z' }).score, sb = E.scoreJobInterview(B, { employer: 'Y', title: 'Z' }).score; assert.ok(Math.abs(sb - sa - 4) < 1e-6, 'reference adds 4: ' + (sb - sa)); }
// convert: a real job at the partner company; walk away keeps the reference
{ const r = F.resolveInternConvert(S, true); assert.ok(r.taken && S.career.job.employer === o.employer && S.career.employed); }
{ const T = mk('wealthy'); F.offerConnectedInternship(T); F.resolveIntern(T, true); months(T, 3); const r = F.resolveInternConvert(T, false); assert.ok(!r.taken && !T.career.job && T.familyFortune.reference); }
// someone already working or at university is not offered a conversion, but still keeps the reference
{ const T = mk('wealthy', 18); F.offerConnectedInternship(T); F.resolveIntern(T, true); months(T, 3); assert.ok(T.familyFortune.reference && !T.familyFortune.internConvert, 'under 19: reference only'); }
// declining is free and final
{ const T = mk('wealthy'); F.offerConnectedInternship(T); const c = T.money.cash; assert.ok(!F.resolveIntern(T, false).taken); assert.equal(T.money.cash, c); assert.equal(F.offerConnectedInternship(T), null); }
console.log('connected internship OK');
