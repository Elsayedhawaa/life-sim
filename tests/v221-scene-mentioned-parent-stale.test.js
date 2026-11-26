// A scene that speaks of a parent who is not a required cast member is discarded if that parent dies before it is shown.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {advanceSingleTurn,resolveActiveSceneChoice}=await import('../src/core/gameLoop.js');
const {isRandomLifeSceneCurrent}=await import('../src/systems/eventEngine.js');
let found=null;
outer:for(let seed=1;seed<=40&&!found;seed++){
  const s=createNewLifeState({country:['gbr','usa','jpn'][seed%3],seed:seed*17+3,familyTier:'middle'});ensureExtendedState(s);
  for(let i=0;i<2500&&!s.gameOver;i++){
    if(!s.activeScene){advanceSingleTurn(s);continue}
    const a=s.activeScene;
    if(a.eventMentionedIds&&Object.keys(a.eventMentionedIds).length&&isRandomLifeSceneCurrent(a,s)){found={s,a};break outer}
    try{resolveActiveSceneChoice(s,0)}catch(e){s.activeScene=null}
  }
}
assert.ok(found,'an engine scene that mentions an optional parent exists in the sample');
const {s,a}=found;
for(const [role,id] of Object.entries(a.eventMentionedIds)){
  assert.equal(isRandomLifeSceneCurrent(a,s),true);
  s.people[id].alive=false;
  assert.equal(isRandomLifeSceneCurrent(a,s),false,role+' died: scene is stale');
  s.people[id].alive=true;
}
console.log('PASS v221-scene-mentioned-parent-stale');
