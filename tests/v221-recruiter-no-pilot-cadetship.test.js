import assert from'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const{createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const{presentGraduateOrJobSearchOffers,listAvailableJobs}=await import('../src/systems/careerEducationEngine.js');
/* Played defect: a Business and Finance graduate's recruiter list included "Cadet Pilot at Air Arabia Egypt". */
for(const seed of[3,4,5,6,7,8]){
const S=createNewLifeState({country:'egy',seed,birthYear:1999});ensureExtendedState(S);S.player.age=22;S.year=2021;S.education.degrees=['business'];S.activeScene=null;S.sceneQueue=[];
assert.ok(listAvailableJobs(S).some(j=>j.track==='aviation'),'the job board still lists aviation');
presentGraduateOrJobSearchOffers(S,'Graduate Recruitment — Test');
const sc=S.activeScene||S.sceneQueue[0];assert.ok(sc,'recruiter scene exists');
assert.ok(!sc.choices.some(c=>/Cadet Pilot/.test(c.label)),'no pilot cadetship for a business graduate: '+sc.choices.map(c=>c.label).join(' | '));}
{const S=createNewLifeState({country:'egy',seed:3,birthYear:1999});ensureExtendedState(S);S.player.age=22;S.year=2021;S.education.degrees=['engineering'];
assert.ok(listAvailableJobs(S).some(j=>j.track==='aviation_pilot'&&j.qualifiedByDegree),'an engineering graduate still qualifies for the pilot track');}
console.log('ok v221 recruiter no pilot cadetship');
