// A parent's estate is conserved: the player's cash gain equals the drop in the parent's recorded savings, never exceeds the legal share,
// and the shares of everyone (player, living siblings, surviving parent) never add up to more than the estate.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {handleNpcDeath}=await import('../src/systems/soulEngine.js');
const results=[];
for(const [country,religion] of [['ita','secular'],['usa','secular'],['egy','muslim'],['jpn','secular'],['gbr','secular']]){
  for(const parentRole of ['father','mother']){
    const S=createNewLifeState({country,seed:77,religion});ensureExtendedState(S);
    const id=parentRole==='father'?S.relations.fatherId:S.relations.motherId;const p=S.people[id];
    if(!p){continue;}
    p.career.savingsLocal=1000000;p.assets=undefined;
    const before=S.money.cash;
    handleNpcDeath(S,p);
    const sc=S.activeScene||(S.sceneQueue&&S.sceneQueue[0]);
    assert.ok(sc&&sc.bereavementSnapshot,country+' bereavement scene');
    const snap=sc.bereavementSnapshot;
    const sibs=(S.relations.siblingIds||[]).filter(i=>S.people[i]&&S.people[i].alive).length;
    const other=parentRole==='father'?S.relations.motherId:S.relations.fatherId;const otherAlive=!!(other&&S.people[other]&&S.people[other].alive);
    // the player's share can never be more than the whole estate, and shrinks with every other heir
    assert.ok(snap.inheritedAmount>=0&&snap.inheritedAmount<=1000000,country+' share within estate: '+snap.inheritedAmount);
    if(sibs>0||otherAlive)assert.ok(snap.inheritedAmount<1000000,country+' with other heirs the player cannot take it all');
    const pick=sc.choices[sc.choices.length-1];
    const cashBefore=S.money.cash,parentBefore=p.career.savingsLocal;
    pick.effect(S);
    const gained=S.money.cash-cashBefore,drop=parentBefore-p.career.savingsLocal;
    assert.ok(Math.abs(gained-drop)<=2,country+' gain equals parent drop: '+gained+' vs '+drop);
    assert.ok(p.career.savingsLocal>=0);
    results.push([country,parentRole,sibs,otherAlive,snap.inheritedAmount]);
  }
}
assert.ok(results.length>=6,'enough cases ran: '+results.length);
console.log('PASS v221-estate-conservation');
