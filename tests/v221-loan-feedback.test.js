// Paying a loan-shop debt always says what happened: paid, or refused for lack of cash with nothing changed.
import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { bookNarrativeLoan, payNarrativeLoan } = await import('../src/systems/narrativeLoans.js');
const mk = () => { const S = createNewLifeState({ seed: 4, country: 'gbr', birthYear: 2000, familyTier: 'middle', gender: 'm' }); ensureExtendedState(S); S.player.age = 26; S.money.cash = 0; assert.ok(bookNarrativeLoan(S, 'payday', 1000).ok); return S; };
{ const S = mk(); S.money.cash = 10; const l = S.money.loans[0], b = l.balance, j = S.journal.length; const r = payNarrativeLoan(S, l.id, .5); assert.equal(r.ok, false); assert.equal(l.balance, b); assert.equal(S.money.cash, 10); assert.ok(S.journal[0].text.includes('Nothing changed'), S.journal[0].text); assert.ok(S.journal.length > j); }
{ const S = mk(); S.money.cash = 5000; const l = S.money.loans[0], b = l.balance; assert.equal(payNarrativeLoan(S, l.id, .5).ok, true); assert.equal(l.balance, b - Math.ceil(b * .5)); assert.match(S.journal[0].text, /You paid .* still owed/); assert.equal(payNarrativeLoan(S, l.id).ok, true); assert.match(S.journal[0].text, /paid off/); }
console.log('PASS v221-loan-feedback');
