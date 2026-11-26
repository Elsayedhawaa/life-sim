// New recruiters, colleagues and in-laws do not reuse the first name of someone alive in the same life.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState,createPerson}=await import('../src/core/schema.js');
const s=createNewLifeState({country:'ita',seed:3});ensureExtendedState(s);
let clash=0;
for(let i=0;i<4;i++){const p=createPerson(s,{role:'recruiter',gender:i%2?'m':'f',age:35});
  if(Object.values(s.people).some(x=>x!==p&&x.alive!==false&&x.firstName===p.firstName))clash++;
  s.people[p.id]=p;}
assert.equal(clash,0,'new people reuse a living first name '+clash+' times');
console.log('PASS v221-name-collision');
