// The tech startup launch screen states that it has no sales until release and that release does not guarantee users;
// it shows estimated recurring costs (self-run and with manager), not the launch placeholder sales.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {findVentureRow,evaluateBusinessLaunch,ventureViabilityWarningHtml}=await import('../src/systems/businessEngine.js');
for(const country of ['usa','egy','deu']){
  const S=createNewLifeState({seed:7,country,birthYear:1990,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=35;
  const bp=findVentureRow(S,'tech_founder'),ev=evaluateBusinessLaunch(S,bp);
  const html=ventureViabilityWarningHtml(S,bp,ev);
  assert.match(html,/No sales at launch/);assert.match(html,/does not guarantee paying users/);assert.match(html,/with a paid manager/);
  assert.doesNotMatch(html,/Scenario check/,'no placeholder-sales scenario');
  const bakery=findVentureRow(S,'bakery');if(bakery){const h=ventureViabilityWarningHtml(S,bakery,evaluateBusinessLaunch(S,bakery));assert.doesNotMatch(h,/No sales at launch/);}
}
console.log('PASS v221-tech-prerevenue-warning');
