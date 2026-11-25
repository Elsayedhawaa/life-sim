import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const SE=await import('../src/systems/soulEngine.js');
const S=createNewLifeState({seed:3,country:'usa',birthYear:1990});ensureExtendedState(S);
const id=S.relations.siblingIds[0];const p=S.people[id];
const fn=Object.entries(SE).find(([k])=>/quote|voice|line/i.test(k)&&typeof SE[k]==='function');
console.log(Object.keys(SE).filter(k=>/quote|voice|line|speak/i.test(k)));
p.residenceCountry='fra';p.alive=true;p.rel.resentment=0;p.rel.memories=[];p.rel.promises=[];p.age=30;
p.city='Lyon';
let q=SE.generateContextualLine(S,p);
assert.match(q,/visiting me in Lyon, France/);assert.match(q,/United States/);
p.city='Chicago';/* stale: not a French city */
q=SE.generateContextualLine(S,p);
assert.doesNotMatch(q,/Chicago/);assert.match(q,/visiting me in France/);
console.log('abroad kin quote OK');
