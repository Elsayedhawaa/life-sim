// A firm that dismissed you after formal warnings is not offered back to you for 5 years.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {listAvailableJobs}=await import('../src/systems/careerEducationEngine.js');
const s=createNewLifeState({country:'can',seed:4});ensureExtendedState(s);s.player.age=30;s.year=2030;
s.education.degrees=['computer_science','business','engineering','medicine','law'];
const jobs=()=>listAvailableJobs(s);
const base=jobs().filter(j=>j.employer);assert.ok(base.length>3);
const emp=base[0].employer;
s.career.dismissedFrom=[{employer:emp,year:2029}];
const after=jobs().filter(j=>j.employer===emp);
assert.equal(after.length,0,'dismissing employer is not listed: '+after.length);
console.log('PASS v221-no-rehire');
