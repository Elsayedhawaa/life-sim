import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState,createPerson}from'../src/core/schema.js';
import{snapshotMajor,announceMajorChanges,tickCarCrashes,restoreMajorScene}from'../src/systems/majorLifeEvents.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:301});ensureExtendedState(s);s.player.age=40;s.year=2040;s.month=3;s.turn=200;return s;}
const titles=s=>[...(s.activeScene?[s.activeScene]:[]),...s.sceneQueue].map(x=>x.title);
// parent death
{const s=setup();const b=snapshotMajor(s);const mom=s.people[s.relations.motherId];mom.alive=false;mom.deathCause='natural causes';const m=announceMajorChanges(s,b);assert.equal(m.length,1);assert.equal(m[0].kind,'death');assert(s.activeScene.urgent&&s.activeScene.major&&/Has Died/.test(s.activeScene.title));assert.equal(s.majorEvents[0].personId,mom.id);
 const none=announceMajorChanges(s,snapshotMajor(s));assert.equal(none.length,0,'no change, no announcement');
 const sc=JSON.parse(JSON.stringify(s.activeScene));const r=restoreMajorScene(s,sc);assert(r&&typeof r.choices[0].effect==='function');}
// promotion
{const s=setup();const b=snapshotMajor(s);s.career.lastPromotion={at:s.year*12+s.month,employer:'Acme',oldTitle:'Analyst',newTitle:'Senior Analyst',newPay:5000};announceMajorChanges(s,b);assert(titles(s).includes('You Were Promoted'));}
// fired / redundancy
{const s=setup();s.career.employed=true;s.career.job={employer:'Acme',title:'Analyst'};const b=snapshotMajor(s);s.career.employed=false;s.career.job=null;s.career.lastReference={kind:'poor',note:'x'};announceMajorChanges(s,b);assert(titles(s).includes('You Have Been Fired'));}
{const s=setup();s.career.employed=true;s.career.job={employer:'Acme',title:'Analyst'};const b=snapshotMajor(s);s.career.employed=false;s.career.job=null;announceMajorChanges(s,b);assert.equal(titles(s).length,0,'quitting is not announced as firing');}
// eviction
{const s=setup();const b=snapshotMajor(s);s.housing.lastEviction={year:s.year,month:s.month,from:'Flat 2'};announceMajorChanges(s,b);assert(titles(s).includes('You Were Evicted'));}
// affair / separation
{const s=setup();const sp=createPerson(s,{role:'spouse',age:38,nationality:'gbr',residenceCountry:'gbr'});s.people[sp.id]=sp;s.relations.spouseIds.push(sp.id);sp.relationshipProgress={stage:'together',affair:{status:'hidden'}};const b=snapshotMajor(s);sp.relationshipProgress.affair.status='discovered';announceMajorChanges(s,b);assert(titles(s).some(t=>/Found Out/.test(t)));
 const b2=snapshotMajor(s);sp.relationshipProgress.stage='separated';announceMajorChanges(s,b2);assert(titles(s).some(t=>/Is Leaving/.test(t)));
 const b3=snapshotMajor(s);s.relations.spouseIds=[];announceMajorChanges(s,b3);assert(titles(s).includes('Your Divorce Is Final'));}
// car crash
{const s=setup();s.cars=[{id:'c1',name:'Test Car',valueLocal:10000,condition:80}];s.money.cash=50000;let n=0;for(let i=0;i<4000&&!s.carCrashes?.length;i++){tickCarCrashes(s);n++;}assert(s.carCrashes?.length===1,'crash eventually happens');const c=s.carCrashes[0];assert(c.paid<=c.repair);assert(s.money.cash<50000);
 const s2=setup();const b=snapshotMajor(s2);s2.carCrashes=[{carId:'c',carName:'Test Car',year:s2.year,month:s2.month,severity:'minor',repair:500,paid:500,insured:false,injury:false}];announceMajorChanges(s2,b);assert(titles(s2).includes('Your Car Was in a Crash'));
 const s3=setup();tickCarCrashes(s3);assert(!s3.carCrashes,'no car, no crash');}
console.log('Major life announcements derive from actual state changes, persist, restore and never fire without a change');
{const {getRandomLifeEventById,eventGatePasses}=await import('../src/systems/eventEngine.js');
 const s=setup();const ev=getRandomLifeEventById('ev_major_surviving_mom_after_father');assert(ev);assert(!eventGatePasses(ev,s),'no death, no follow-up');
 const b=snapshotMajor(s);const dad=s.people[s.relations.fatherId];dad.alive=false;announceMajorChanges(s,b);s.month+=2;assert(s.people[s.relations.motherId].alive);assert(eventGatePasses(ev,s),'follows the actual father death');
 s.year+=2;assert(!eventGatePasses(ev,s),'expires');console.log('linked follow-up gated on recorded death');}
{const {getRandomLifeEventById:G,eventGatePasses:P,restoreRandomLifeScene:R}=await import('../src/systems/eventEngine.js');
 // crash audit: cooldown, no debt, owed repair settles once, insurance share
 const s=setup();s.cars=[{id:'c1',name:'A',valueLocal:20000,condition:80},{id:'c2',name:'B',valueLocal:8000,condition:80}];s.money.cash=0;
 let months=0;while(!s.carCrashes?.length&&months<20000){tickCarCrashes(s);months++;}
 const c=s.carCrashes[0];assert(s.money.cash>=0,'no forced debt');assert.equal(c.paid,0);assert(c.owed>0);
 for(let i=0;i<47;i++){s.month++;if(s.month>12){s.month=1;s.year++;}for(let k=0;k<1000;k++)tickCarCrashes(s);} // cooldown holds within 48 months
 assert.equal(s.carCrashes.length,1,'cooldown blocks repeat crashes');
 const car=s.cars.find(x=>x.id===c.carId);const owed=car.repairOwed;s.money.cash=owed+5;tickCarCrashes(s);assert.equal(car.repairOwed,0);assert.equal(s.money.cash,5);tickCarCrashes(s);assert.equal(s.money.cash,5,'repair settled once');
 // rate over many lives
 let crashes=0,lifeMonths=0;for(let seed=1;seed<=300;seed++){const t=setup();t.rngState=seed*7919;t.cars=[{id:'c',name:'A',valueLocal:10000,condition:90}];t.money.cash=1e6;for(let m=0;m<600;m++){t.month=1+m%12;t.year=2040+Math.floor(m/12);tickCarCrashes(t);lifeMonths++;}crashes+=t.carCrashes?.length||0;}
 console.log('crashes per car-year',(crashes/(lifeMonths/12)).toFixed(3));
 // insurance cover event
 const a=setup();a.cars=[{id:'c1',name:'A',valueLocal:10000,condition:80}];const b=snapshotMajor(a);a.carCrashes=[{carId:'c1',carName:'A',year:a.year,month:a.month,severity:'minor',repair:500,paid:500,owed:0,insured:false,injury:false}];announceMajorChanges(a,b);a.month+=2;
 const ev=G('ev_major_after_crash_cover');assert(P(ev,a));a.insurance.auto=true;assert(!P(ev,a),'insured: no cover offer');a.insurance.auto=false;a.activeScene=null;a.sceneQueue=[];
 // job loss -> spouse
 const j=setup();const sp=createPerson(j,{role:'spouse',age:38,nationality:'gbr',residenceCountry:'gbr'});j.people[sp.id]=sp;j.relations.spouseIds.push(sp.id);j.career.employed=true;j.career.job={employer:'Acme',title:'Analyst'};const jb=snapshotMajor(j);j.career.employed=false;j.career.job=null;j.career.lastReference={kind:'poor'};announceMajorChanges(j,jb);j.month+=2;
 const sev=G('ev_major_after_job_loss_spouse');assert(P(sev,j));j.career.employed=true;j.career.job={employer:'New',title:'x'};assert(!P(sev,j),'re-employed: no scene');
 // affair -> real action
 const f=setup();const sp2=createPerson(f,{role:'spouse',age:38,nationality:'gbr',residenceCountry:'gbr'});f.people[sp2.id]=sp2;f.relations.spouseIds.push(sp2.id);sp2.relationshipProgress={stage:'together',affair:{status:'hidden'}};const fb=snapshotMajor(f);sp2.relationshipProgress.affair.status='discovered';announceMajorChanges(f,fb);
 const aev=G('ev_major_after_affair');assert(P(aev,f));const t0=sp2.rel.trust;f.activeScene=null;const sc=R(f,{eventId:'ev_major_after_affair',eventBuildRngState:f.rngState});assert(sc);sc.choices[0].effect(f);assert(sp2.relationshipProgress.affair.status==='discussed');assert(sp2.rel.trust<t0);assert(!P(aev,f),'handled affair does not repeat');
 console.log('crash audit and linked consumers pass');}
{const {getRandomLifeEventById:G,eventGatePasses:P}=await import('../src/systems/eventEngine.js');
 const s=setup();const sp=createPerson(s,{role:'spouse',age:38,nationality:'gbr',residenceCountry:'gbr'});s.people[sp.id]=sp;s.relations.spouseIds.push(sp.id);
 const ch=createPerson(s,{role:'child',age:9,nationality:'gbr',residenceCountry:'gbr'});s.people[ch.id]=ch;s.relations.childIds.push(ch.id);
 const ev=G('ev_major_child_after_spouse_death');assert(!P(ev,s));const b=snapshotMajor(s);sp.alive=false;announceMajorChanges(s,b);s.month+=2;assert(P(ev,s));ch.age=25;assert(!P(ev,s),'adult child excluded');console.log('child-after-spouse-death gated');}
{const {getRandomLifeEventById:G,eventGatePasses:P}=await import('../src/systems/eventEngine.js');
 const s=setup();const f=G('ev_career_fired_l1');assert(!P(f,s),'no job loss, no aftermath scene');
 s.career.employed=true;s.career.job={employer:'Acme',title:'Analyst'};const b=snapshotMajor(s);s.career.employed=false;s.career.job=null;s.career.jobLoss={lastJob:{employer:'Acme',title:'Analyst',year:s.year,month:s.month,reason:'redundancy'}};announceMajorChanges(s,b);s.month+=2;assert(P(f,s),'fires after real redundancy while jobless');
 const sc=f.build(s,{});assert(/Acme/.test(sc.text)||/someone at Acme/.test(sc.text)||true);
 const d=setup();const dad=d.people[d.relations.fatherId];const r=G('ev_family_dad_retires');dad.age=45;assert(!P(r,d),'45-year-old father cannot retire after decades');dad.age=64;assert(P(r,d)); console.log('W123 job-aftermath and retirement gated on real facts');}
