import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* Decision: debt cannot grow without end in a new life. Cash floors at 12 months of living costs below zero and the player pays in health. Old saves unchanged. */
const mk=(flag)=>{const S=createNewLifeState({country:'egy',birthYear:1998,seed:5});ensureExtendedState(S);S.player.age=30;S.year=2028;S.month=3;if(!flag)delete S.rules;S.money.cash=-5e6;S.money.savings=0;S.player.vitals.health=80;S.player.vitals.happiness=60;return S;};
const S=mk(true),h0=S.player.vitals.health;settleHouseholdMonth(S);
assert.ok(S.money.cash>-5e6&&S.money.cash<0,'cash pulled back to the limit: '+S.money.cash);
const cap=-S.money.cash;settleHouseholdMonth(S);
assert.ok(-S.money.cash<=cap*1.1,'a second month does not keep deepening the debt past the limit');
assert.ok(S.player.vitals.health<h0,'going without costs health');
assert.ok(S.journal.some(j=>/the most lenders will allow/.test(j.text||j.line||JSON.stringify(j))),'the player is told why');
assert.ok(S.ledger.some(e=>/Credit limit reached/.test(e.label)),'ledger shows the cut');
const O=mk(false);settleHouseholdMonth(O);assert.ok(O.money.cash<-4.9e6,'old save without the flag keeps its debt: '+O.money.cash);
console.log('ok v221 credit limit');
