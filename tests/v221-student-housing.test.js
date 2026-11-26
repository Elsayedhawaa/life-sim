// A student arriving abroad takes a shared room, not a whole starter flat they cannot pay for.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {executeCountryRelocation}=await import('../src/systems/visaMigrationEngine.js');
const mk=kind=>{const s=createNewLifeState({country:'can',seed:6});ensureExtendedState(s);s.player.age=19;executeCountryRelocation(s,'jpn',{kind,permitName:'x',sponsorName:'y',expiresYear:2030,expiresMonth:1});return s;};
const st=mk('student_visa'),wk=mk('work_visa');
assert.equal(st.housing.currentHomeName,'Shared Bedspace / Room');
assert.ok(st.housing.monthlyRent>0&&st.housing.monthlyRent<wk.housing.monthlyRent*0.7,'shared room costs less: '+st.housing.monthlyRent+' vs '+wk.housing.monthlyRent);
console.log('PASS v221-student-housing');
