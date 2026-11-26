// Enterprise launch cards state no sales until opening, no guaranteed customers, and estimated costs with and without a manager.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {findVentureRow,evaluateBusinessLaunch,ventureViabilityWarningHtml}=await import('../src/systems/businessEngine.js');
let n=0;
for(const country of ['usa','egy']){
  const S=createNewLifeState({seed:7,country,birthYear:1990,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=35;
  for(const id of ['enterprise_'+'cafe','enterprise_'+'retail']){
    const bp=findVentureRow(S,id);if(!bp)continue;n++;
    const html=ventureViabilityWarningHtml(S,bp,evaluateBusinessLaunch(S,bp));
    assert.match(html,/No sales at launch/);assert.match(html,/does not guarantee customers/);assert.match(html,/with a paid manager/);assert.doesNotMatch(html,/Scenario check/);
  }
}
assert.ok(n>0,'at least one enterprise row checked');
const v=fs.readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');
assert.match(v,/bp\.id\.startsWith\('enterprise_'\)\?ventureViabilityWarningHtml\(S,bp,ev\)/);
console.log('PASS v221-enterprise-prerevenue-warning');
