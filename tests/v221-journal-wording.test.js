// Journal wording: long silences read as years; kin words keep proper nouns and do not read "Your sofia's son"; best man / maid of honour follows the player's gender.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {quietSpan}=await import('../src/systems/socialEnergy.js');
assert.equal(quietSpan(9),'9 months');assert.equal(quietSpan(14),'about a year');assert.equal(quietSpan(132),'about 11 years');
const fs=await import('node:fs');
const soul=fs.readFileSync(new URL('../src/systems/soulEngine.js',import.meta.url),'utf8');
assert.ok(!/\(\$\{mother\.relationLabel\}\) had a baby/.test(soul),'baby line must not print the raw role label in brackets');
const ev=fs.readFileSync(new URL('../src/data/eventsEverydayFamily.js',import.meta.url),'utf8');
assert.ok(!/best man \/ maid of honour/.test(ev),'no slash role');
console.log('PASS v221-journal-wording');
{
  const {npcKinWord,npcHaveChild}=await import('../src/systems/soulEngine.js');
  const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
  assert.equal(npcKinWord({role:'friend',relationLabel:'High-School Friend'}),'high-school friend');
  assert.equal(npcKinWord({role:'colleague',relationLabel:'Colleague at Richter Trading'}),'colleague at Richter Trading');
  assert.equal(npcKinWord({role:'friend',relationLabel:"Sofia's Son"}),"friend's son");
  let same=0,babies=0;
  for(let seed=1;seed<=600;seed++){
    const s=createNewLifeState({country:'usa',seed,familyTier:'middle'});ensureExtendedState(s);
    const before=new Set(Object.keys(s.people));
    const ppl=Object.values(s.people);const mother=ppl.find(p=>p.role==='mother'),father=ppl.find(p=>p.role==='father');if(!mother||!father)continue;
    try{npcHaveChild(s,mother,father)}catch(e){continue}
    const baby=Object.values(s.people).find(p=>!before.has(p.id)&&p.age===0);if(!baby)continue;babies++;if(baby.firstName===mother.firstName)same++;
  }
  assert.ok(babies>=300,'enough babies checked ('+babies+')');
  assert.equal(same,0,same+' babies share their mother\'s first name');
  console.log('PASS v221-journal-wording part 2',babies);
}
{
  const {npcKinWord}=await import('../src/systems/soulEngine.js');
  assert.equal(npcKinWord({role:'friend',relationLabel:'Expat contact in Amsterdam'}),'expat contact in Amsterdam');
  const fsx=await import('node:fs');
  const cw=fsx.readFileSync(new URL('../src/systems/careerWork.js',import.meta.url),'utf8');
  assert.ok(!/\$\{work\.title\.toLowerCase\(\)\} unfinished/.test(cw),'task title must be quoted, not lowercased into the sentence');
  const vm=fsx.readFileSync(new URL('../src/systems/visaMigrationEngine.js',import.meta.url),'utf8');
  assert.ok(/Residency status: \$\{String\(fromKind\)\.replace/.test(vm),'residency kinds must not print raw underscores');
  console.log('PASS v221-journal-wording part 3');
}
