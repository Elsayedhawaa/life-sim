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
