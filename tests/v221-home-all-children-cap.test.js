import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const F=await import('../src/systems/familyFortune.js');
function life(sibs){const S=createNewLifeState({seed:5,country:'usa',birthYear:2000,familyTier:'very_wealthy',gender:'m'});ensureExtendedState(S);F.ensureFamilyFortune(S);S.player.age=22;S.activeScene=null;S.sceneQueue=[];
 S.relations.siblingIds=[];for(let i=0;i<sibs;i++){const id='sib'+i;S.people[id]={id,alive:true,role:'sibling'};S.relations.siblingIds.push(id);}
 return S;}
const D=F.FORTUNE_DIALS||{};
const none=life(0),four=life(4);
const c0=F.perChildHomeCapPct(none),c4=F.perChildHomeCapPct(four);
assert.ok(c4<c0,'more children share the combined ceiling');
assert.ok(c4*5<=0.15+1e-9,'all five children together stay within the combined cap');
assert.ok(c0<=0.08+1e-9);
console.log('home all-children cap OK',c0,c4);
for (const S of [none, four]) { const o = F.offerFirstHome(S); if (o) assert.ok(o.price <= S.familyFortune.netWorthLocal * F.perChildHomeCapPct(S) + 1, 'offered home within that child cap'); }
console.log('offer within cap OK');
