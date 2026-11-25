// The family name (wealth event 8): a few points on existing gates, home country only, adults only, tier-scaled.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const N = await import('../src/systems/familyName.js');
const { personalLoanGates } = await import('../src/systems/economyEngine.js');
const E = await import('../src/systems/careerEducationEngine.js');
const mk = (tier, country = 'usa', seed = 5) => { const S = createNewLifeState({ seed, country, birthYear: 2000, familyTier: tier }); ensureExtendedState(S); S.player.age = 25; S.year = 2025; return S; };
// points scale by tier, none for others
assert.equal(N.familyNameCreditPoints(mk('very_wealthy')), 30); assert.equal(N.familyNameCreditPoints(mk('wealthy')), 15); assert.ok(N.familyNameCreditPoints(mk('upper_middle')) < 15);
assert.equal(N.familyNameCreditPoints(mk('middle')), 0, 'no tier, no lift');
// only where the surname is known, and only for adults
{ const S = mk('very_wealthy'); S.country = 'deu'; assert.equal(N.familyNameCreditPoints(S), 0, 'abroad nobody knows the name'); S.country = S.homeCountry; S.player.age = 17; assert.equal(N.familyNameCreditPoints(S), 0, 'not for minors'); }
// a real gate: a 550 score fails for a middle family but passes for a very wealthy one; a 500 fails for both
{ const a = mk('middle'), b = mk('very_wealthy'), c = mk('very_wealthy');
  for (const S of [a, b]) { S.money.creditScore = 550; S.legal.residency = S.legal.residency || {}; }
  const ga = personalLoanGates(a), gb = personalLoanGates(b);
  assert.ok(ga && /credit score/i.test(ga), 'middle family at 550 is turned down'); assert.ok(!gb || !/credit score/i.test(gb), 'the name lifts a 550 over the 560 gate: ' + gb);
  c.money.creditScore = 500; assert.ok(/credit score/i.test(personalLoanGates(c) || ''), 'a weak record is not rescued'); }
// the interview score gets the same small lift, same seed
{ const pick = (tier) => { const S = mk(tier, 'usa', 9); S.education.degrees = ['business']; return E.scoreJobInterview(S, { employer: 'X', title: 'Y' }).score; };
  const mid = pick('middle'), rich = pick('very_wealthy'); assert.ok(Math.abs(rich - mid - 6) < 1e-6, 'six interview points for the highest tier, nothing more: ' + (rich - mid)); }
console.log('family name OK');
// the proactive bigger-loan offer and the direct loan gate use the same lifted score
{ const BF = await import('../src/systems/businessFate.js'); const mkb = (tier) => { const S = mk(tier); S.money.creditScore = 680; S.money.loans = []; return S; };
  const biz = { typeId: null, capitalInvested: 100000 };
  const B = await import('../src/systems/businessLoans.js');
  for (const tier of ['middle', 'very_wealthy']) { const S = mkb(tier); const t = B.businessLoanTerms(S, Math.round(biz.capitalInvested * 0.5), {}); const offer = BF.biggerLoanOffer(S, biz); assert.equal(!!offer, N.lenderCreditScore(S) >= t.reqScore, tier); assert.equal(!!offer, tier === 'very_wealthy', 'only the lifted score clears 700'); } }
console.log('same-product gates OK');
