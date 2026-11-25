// Family offers never stack on top of another open decision: the internship convert, the car and the home wait for a quiet month.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const F = await import('../src/systems/familyFortune.js');
const mk = (tier, age) => { const S = createNewLifeState({ seed: 3, country: 'usa', birthYear: 2000, familyTier: tier, gender: 'm' }); ensureExtendedState(S); F.ensureFamilyFortune(S); S.player.age = age; S.year = 2020; S.month = 6; S.activeScene = null; S.sceneQueue = []; S.career.job = null; S.career.employed = false; if (S.education) S.education.university = null; return S; };
const S = mk('wealthy', 20);
F.offerConnectedInternship(S); F.resolveIntern(S, true);
S.activeScene = null; S.sceneQueue = [];
const f = S.familyFortune;
/* run the internship to its end with another decision already open in the final month */
for (let i = 0; i < 3 && f.intern; i++) { S.month++; F.tickConnectedInternship(S, f); }
assert.ok(f.internConvert, 'the offer is recorded');
assert.equal(f.internConvert.shown, false);
assert.equal((S.sceneQueue || []).length, 0, 'finishing the internship queued nothing by itself');
S.activeScene = { key: 'other', choices: [] };
assert.equal(F.offerInternConvert(S), null, 'an open decision holds it back');
assert.equal(S.sceneQueue.length, 0);
S.activeScene = null;
assert.ok(F.offerInternConvert(S), 'shown in the first quiet month');
assert.equal(S.sceneQueue.length + (S.activeScene ? 1 : 0), 1);
assert.equal(F.offerInternConvert(S), null, 'only once');
/* car and home wait too */
const C = mk('very_wealthy', 18); C.activeScene = { key: 'other', choices: [] };
assert.equal(F.giftBirthdayCar(C), null); assert.ok(!C.familyFortune.carGifted, 'not marked gifted while held back');
C.activeScene = null; assert.ok(F.giftBirthdayCar(C), 'offered once quiet');
const H = mk('very_wealthy', 23); H.sceneQueue = [{ key: 'other' }];
assert.equal(F.offerFirstHome(H), null); assert.ok(!H.familyFortune.homeGifted);
H.sceneQueue = []; assert.ok(F.offerFirstHome(H));
/* a free person who finds a job meanwhile loses the offer, keeps the reference */
const J = mk('wealthy', 20); F.offerConnectedInternship(J); F.resolveIntern(J, true); J.activeScene = null; J.sceneQueue = [];
for (let i = 0; i < 4 && J.familyFortune.intern; i++) { J.month++; F.tickConnectedInternship(J, J.familyFortune); }
J.career.employed = true; J.career.job = { employer: 'X', title: 'Clerk' };
assert.equal(F.offerInternConvert(J), null); assert.equal(J.familyFortune.internConvert, null); assert.ok(J.familyFortune.reference);
console.log('one decision a month OK');
