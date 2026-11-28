import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import*as B from'../src/systems/businessEngine.js';
// GAME DESIGN: the launch screen warns when cash and savings left after the startup capital cover under three bad months (a bad month = sales at half of expected, the game's severe-month rule). The three months are mine, not sourced.
function mk(cc,mult,id='accounting_firm'){const S=createNewLifeState({seed:7,country:cc,birthYear:1990,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=35;S.education.degrees=['accounting','business','cs','law'];const bp=B.findVentureRow(S,id);const e0=B.evaluateBusinessLaunch(S,bp);S.money.cash=Math.round(e0.capitalLocal*mult);S.money.savings=0;return{S,bp,e:B.evaluateBusinessLaunch(S,bp)};}
for(const cc of['usa','egy','jpn']){
  let{S,bp,e}=mk(cc,1.02);assert.ok(/Low cash buffer/.test(B.ventureViabilityWarningHtml(S,bp,e)),cc+' low cash warns');
  ({S,bp,e}=mk(cc,4));assert.ok(!/Low cash buffer/.test(B.ventureViabilityWarningHtml(S,bp,e)),cc+' enough cash is quiet');
}
// the capital really leaves cash at launch, so the note's arithmetic matches what happens
{const{S,bp,e}=mk('usa',2);const before=S.money.cash;B.createBusiness(S,'accounting_firm','T',{mode:'part_time'});assert.ok(S.money.cash<=before-Math.round(e.capitalLocal)*0.99,'capital leaves cash');}
// savings count
{const{S,bp,e}=mk('usa',1.02);S.money.savings=e.capitalLocal*3;assert.ok(!/Low cash buffer/.test(B.ventureViabilityWarningHtml(S,bp,B.evaluateBusinessLaunch(S,bp))),'savings count');}
// cash below the capital is the lock's job: no buffer note saying 0
{const{S,bp,e}=mk('egy',0.5);assert.ok(!/Low cash buffer/.test(B.ventureViabilityWarningHtml(S,bp,e)),'no note under capital');}
console.log('ok v221 low cash note');
