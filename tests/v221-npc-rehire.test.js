// An NPC who loses a job is rehired into the same line of work, not an entry-level analyst post.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {npcJobChange}=await import('../src/systems/soulEngine.js');
const S=createNewLifeState({country:'swe',seed:31});ensureExtendedState(S);
const p=S.people[S.relations.motherId];
p.age=45;p.alive=true;p.career.title='Lead Specialist Physician';p.career.monthlyIncomeLocal=150000;p.career.incomeIndexYear=S.year;delete p.career.businessEmployeeId;
let lost=false,rehired=false;
for(let i=0;i<20000&&!rehired;i++){
  npcJobChange(S,p);
  if(p.career.title==='Seeking Work')lost=true;
  else if(lost){rehired=true;}
  if(!lost&&p.career.title!=='Lead Specialist Physician'){p.career.title='Lead Specialist Physician';p.career.monthlyIncomeLocal=150000;}
}
assert.ok(lost,'the NPC lost the job in the run');
assert.ok(rehired,'the NPC was rehired');
assert.equal(p.career.title,'Lead Specialist Physician','same line of work after rehire');
assert.equal(p.career.monthlyIncomeLocal,150000,'same income after rehire');
console.log("PASS v221-npc-rehire-income");
console.log('PASS v221-npc-rehire');
// the family's own firm never makes its heir redundant
const {redundancyChance}=await import('../src/systems/careerConsequences.js');
const T=createNewLifeState({country:'swe',seed:9});ensureExtendedState(T);
T.familyFortune={company:{name:'Andersson Trading'}};
T.career.employed=true;T.career.job={employer:'Andersson Trading',title:'Management Trainee',monthlyGross:30000,monthsInRole:12};
assert.equal(redundancyChance(T,{crisis:true,events:[]}),0,'family firm never makes the heir redundant');
T.career.job.employer='Some Other Firm';
assert.ok(redundancyChance(T,{crisis:true,events:[]})>=0);
console.log('PASS v221-family-firm-redundancy');
