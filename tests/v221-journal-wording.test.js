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
{
  /* Source-level checks: these lines sit inside events that need a long played scene to reach. */
  const fsy=await import('node:fs');
  const rd=f=>fsy.readFileSync(new URL('../src/'+f,import.meta.url),'utf8');
  const hd=rd('systems/healthDirectorEngine.js');
  assert.ok(!/Entering your forties/.test(hd),'the midlife line can fire at any age 40+, so it must name the age, not "your forties"');
  assert.ok(/title: age < 50 \? 'Forty Candles & Looking Back' : 'Looking Back'/.test(hd),'a "Forty Candles" title must not show at 55');
  assert.ok(!/bought a smaller shop/.test(rd('data/eventsMoneyHealthCareer.js')),'"bought a smaller shop" reads as buying a store');
  assert.ok(!/lost their job as \$\{withArticle/.test(rd('systems/soulEngine.js')),'a named person lost her/his job, not "their"');
  console.log('PASS v221-journal-wording part 4');
}
{
  const {resolveThread}=await import('../src/systems/threadResolution.js');
  const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
  const s=createNewLifeState({country:'usa',seed:3});ensureExtendedState(s);
  const n0=s.journal.length;
  resolveThread(s,'ev_probe_a',{how:'choice',outcome:'You chose: Walk with him every week from now on.'});
  assert.ok(s.threadResolutions.ev_probe_a,'the thread record is still kept');
  assert.ok(!s.journal.slice(0,s.journal.length-n0+3).some(j=>/loose thread closed: You chose/.test(j.text)),'a choice label is not journaled a second time');
  resolveThread(s,'ev_probe_b',{how:'time',outcome:'The friendship faded without a word.'});
  assert.ok(s.journal.some(j=>/A loose thread closed: The friendship faded/.test(j.text)),'other outcomes still read as before');
  const fsz=await import('node:fs');const rdz=f=>fsz.readFileSync(new URL('../src/systems/'+f,import.meta.url),'utf8');
  assert.ok(/again \? `Evicted again, from/.test(rdz('economyEngine.js'))&&/e\.again \? 'Evicted Again'/.test(rdz('majorLifeEvents.js')),'a repeat eviction reads as a repeat');
  assert.ok(/Math\.round\(stakeEach \* 10\) \/ 10/.test(rdz('familyFortune.js')),'estate stake percent is rounded');
  console.log('PASS v221-journal-wording part 5');
}
{
  const {recordJournal}=await import('../src/core/schema.js');
  const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
  const s=createNewLifeState({country:'egy',seed:4});ensureExtendedState(s);
  const says=t=>{recordJournal(s,t,'friends');return s.journal[0].text};
  assert.equal(says('Sherif landed their dream job; you congratulated them warmly over the phone.'),'Sherif landed his dream job; you congratulated him warmly over the phone.');
  assert.equal(says('Sara told you in confidence that their marriage is over; you kept the secret and stood by them.'),'Sara told you in confidence that her marriage is over; you kept the secret and stood by her.');
  assert.equal(says('Sherif told you first that they are engaged, and you asked if they are sure.'),'Sherif told you first that he is engaged, and you asked if he is sure.');
  assert.equal(says('Sherif and Sara announced their engagement.'),'Sherif and Sara announced their engagement.','two people named: left alone');
  assert.equal(says('Someone moved and they left.'),'Someone moved and they left.','no named person: left alone');
  s.people.p_x={id:'p_x',firstName:'Sherif',gender:'m',role:'friend'};
  assert.equal(says('Sherif asked you to be godparent to their child, and you accepted.'),'Sherif asked you to be godparent to his child, and you accepted.','a second person with the same first name and gender is still one person');
  console.log('PASS v221-journal-wording part 6');
}
{
  const fsq=await import('node:fs');
  const gl=fsq.readFileSync(new URL('../src/core/gameLoop.js',import.meta.url),'utf8');
  assert.ok(!/recordJournal\(S, `\$\{scene\.title\}: \$\{lbl\}\.`/.test(gl),'fallback journal line must not glue the card title and the button label with a colon');
  assert.ok(/You went with "\$\{String\(lbl\)/.test(gl));
  console.log('PASS v221-journal-wording part 7');
}
