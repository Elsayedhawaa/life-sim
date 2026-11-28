import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import*as B from'../src/systems/businessEngine.js';
// GAME DESIGN: the launch screen says plainly when a manager-run venture leaves under 10% of expected sales after all costs (10% is mine, not sourced).
const note=(cc,id)=>{const S=createNewLifeState({seed:7,country:cc,birthYear:1990,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=35;S.money.cash=1e15;S.education.degrees=['cs','business','law','medicine','dentistry','pharmacy','engineering','architecture','veterinary','physiotherapy','nursing','accounting'];const bp=B.findVentureRow(S,id);return B.ventureViabilityWarningHtml(S,bp,B.evaluateBusinessLaunch(S,bp));};
for(const cc of['usa','egy','jpn']){
  for(const id of['cafe','restaurant','bakery','retail_shop','vet_clinic','mobile_shop','pharmacy'])assert.ok(/Thin margin if a manager runs it/.test(note(cc,id)),cc+' '+id+' says manager-run is thin');
  for(const id of['law_firm','accounting_firm','dental_clinic','consulting'])assert.ok(!/Thin margin if a manager/.test(note(cc,id)),cc+' '+id+' stays quiet');
}
assert.ok(/mo leave/.test(note('usa','cafe')));
console.log('ok v221 manager thin note');
