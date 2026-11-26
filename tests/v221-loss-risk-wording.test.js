// The classic Loss-risk warning says sales may come in higher or lower than the estimate; numbers are unchanged.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {findVentureRow,evaluateBusinessLaunch,ventureViabilityWarningHtml}=await import('../src/systems/businessEngine.js');
const S=createNewLifeState({seed:7,country:'usa',birthYear:1990,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=2025;S.month=3;S.player.age=35;
const bp=findVentureRow(S,'cafe'),html=ventureViabilityWarningHtml(S,bp,evaluateBusinessLaunch(S,bp));
assert.match(html,/Loss risk/);assert.match(html,/sales may come in higher or lower than this estimate/);assert.match(html,/Scenario check: if sales match the assumed/);
console.log('PASS v221-loss-risk-wording');
