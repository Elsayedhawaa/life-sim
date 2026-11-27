import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const W=new URL('../src/',import.meta.url).href;
const {createNewLifeState,ensureExtendedState}=await import(W+'core/schema.js');
const {advanceSingleTurn,resolveActiveSceneChoice}=await import(W+'core/gameLoop.js');
const m=await import(W+'systems/careerEducationEngine.js');
let r=99;const rnd=()=>(r=(r*1103515245+12345)&0x7fffffff)/0x7fffffff;
const s=createNewLifeState({country:'ind',seed:8337,familyTier:'wealthy'});ensureExtendedState(s);
for(let i=0;i<4000&&!s.gameOver&&s.year<2026;i++){
 if(!s.activeScene){advanceSingleTurn(s);continue}
 try{resolveActiveSceneChoice(s,Math.floor(rnd()*(s.activeScene.choices?.length||1)))}catch(e){s.activeScene=null}
}
const mom=s.people[s.relations.motherId];
const market=m.marketMonthlyGross('ind',2026,'medicine',3);
const inc=mom.career.monthlyIncomeLocal;
assert.ok(inc < market*3, `NPC physician mother ${inc} should stay within 3x the market specialist line ${market}`);
console.log('ok v221 npc no double raise');
