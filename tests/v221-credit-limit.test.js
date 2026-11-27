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
/* Health floor: the limit's health hit stops at 35 and the player is told why. */
{const F=mk(true);F.player.vitals.health=36;for(let i=0;i<30;i++){F.money.cash=-5e6;F.turn+=1;settleHouseholdMonth(F);}
assert.ok(F.player.vitals.health>=35,'health stops at the floor: '+F.player.vitals.health);
assert.ok(F.journal.some(j=>/Relatives and friends cover the basics/.test(JSON.stringify(j))),'family-help line is written once at the floor');}
console.log('ok v221 credit limit floor');
/* Relief's credit block: no new credit at all while it runs; the cards say so and mention relief. */
{const B=mk(true);B.money.bankruptUntilYear=B.year+3;B.money.cash=-80000;B.turn+=1;settleHouseholdMonth(B);
assert.ok(B.money.cash>-1,'during the relief block the limit is zero: '+B.money.cash);
assert.ok(B.journal.some(j=>/relief is still running, so no lender will give you credit until/.test(JSON.stringify(j))),'journal says why');
const N=mk(true);N.money.cash=-5e6;N.turn+=1;settleHouseholdMonth(N);
assert.ok(N.journal.some(j=>/Game cash relief, when it is offered/.test(JSON.stringify(j))),'normal limit line points at relief and work');
assert.ok(N.money.cash<-1000,'without a block the 12-month limit still applies');}
console.log('ok v221 credit block');
/* The lock reads the relief block live, not only after the next monthly settlement. */
import{atCreditLimit}from'../src/core/discretionary.js';
{const B=mk(true);B.money.creditBlocked=false;B.money.bankruptUntilYear=B.year+2;B.money.cash=0;assert.ok(atCreditLimit(B),'at zero cash inside the relief block, luxuries are locked at once');B.money.cash=500;assert.ok(!atCreditLimit(B),'with cash in hand they are open');}
console.log('ok v221 live block lock');
