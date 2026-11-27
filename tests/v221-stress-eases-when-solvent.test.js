import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* Played defect: stress stayed at 85-89% for years after the money trouble ended. */
const mk=(cash)=>{const S=createNewLifeState({country:'egy',birthYear:1998,seed:5});ensureExtendedState(S);S.player.age=30;S.year=2028;S.month=3;S.money.cash=cash;S.money.savings=0;S.player.vitals.stress=90;return S};
const A=mk(2e6);for(let i=0;i<12;i++){A.turn++;A.month=(A.month%12)+1;settleHouseholdMonth(A);}
assert.ok(A.player.vitals.stress<=70,'solvent: stress eases over a year: '+A.player.vitals.stress);
const F=mk(2e6);for(let i=0;i<40;i++){F.turn++;F.month=(F.month%12)+1;F.player.vitals.stress=Math.min(F.player.vitals.stress,45);settleHouseholdMonth(F);}
assert.ok(F.player.vitals.stress>=40,'it rests at 40, not zero: '+F.player.vitals.stress);
const D=mk(-3e5);D.turn++;settleHouseholdMonth(D);assert.ok(D.player.vitals.stress>=90,'in debt it does not ease: '+D.player.vitals.stress);
console.log('ok v221 stress eases when solvent');
