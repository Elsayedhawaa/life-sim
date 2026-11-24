import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState,createPerson,newCoupleRecord,syncCoupleToLegacy} from '../src/core/schema.js';
import {personMind,canContactPerson} from '../src/systems/personMind.js';
import {tickSpouseAutonomy,answerSpouseDecision,spouseRequestCost} from '../src/systems/spouseAutonomy.js';
import {tickPeopleAutonomy,answerPeopleDecision} from '../src/systems/peopleAutonomy.js';
import {setTryingForBaby,startPregnancy} from '../src/systems/marriageFamilyEngine.js';
import {callPerson} from '../src/systems/soulEngine.js';
function household(){const s=createNewLifeState({country:'usa',seed:7});ensureExtendedState(s);s.year=2026;s.month=1;s.player.age=30;s.money.cash=100000;s.social={energy:10,max:10};const p=createPerson(s,{age:28,gender:'f',role:'spouse',nationality:'usa'});s.people[p.id]=p;const c=newCoupleRecord(s,'player',p.id,{stage:'married'});s.marriage.couples.push(c);syncCoupleToLegacy(s,c);return[s,p,personMind(s,p)];}
function request(s,p,k){p.mind.pending={kind:k,at:s.year*12+s.month};}
function wait(s,fn,test){for(let i=0;i<120;i++){fn(s);if(test())return;s.month++;if(s.month>12){s.month=1;s.year++;}}throw Error('No event');}
{
 const[s,p,m]=household();const copy=JSON.parse(JSON.stringify(s));assert.deepEqual(personMind(copy,copy.people[p.id]),m);m.wantsChildren=false;assert.equal(setTryingForBaby(s,true).ok,false);assert.equal(startPregnancy(s,p.id).ok,false);
 m.wantsChildren=true;request(s,p,'kids');assert.ok(answerSpouseDecision(s,p.id,true).ok);assert.equal(s.marriage.tryingForBaby,true);
 request(s,p,'spending');let cash=s.money.cash;const cost=spouseRequestCost(s,'spending');assert.ok(answerSpouseDecision(s,p.id,true).ok);assert.equal(s.money.cash,cash-cost);assert.equal(answerSpouseDecision(s,p.id,true).ok,false);
 request(s,p,'budget');answerSpouseDecision(s,p.id,true);assert.equal(s.money.lifestyleMode,'frugal');
 request(s,p,'career');answerSpouseDecision(s,p.id,true);assert.equal(s.marriage.householdSplit,'proportional');
 request(s,p,'boundary');let energy=s.social.energy;answerSpouseDecision(s,p.id,true);assert.equal(s.social.energy,energy-3);
 s.housing.properties.push({id:'second',country:'usa',name:'Second home'});m.moveTargetId='second';request(s,p,'move');assert.ok(answerSpouseDecision(s,p.id,true).ok);assert.equal(s.housing.currentHomeId,'second');
 p.relationshipProgress={stage:'separated'};request(s,p,'reconcile');assert.ok(answerSpouseDecision(s,p.id,true).ok);assert.equal(p.householdWith,'player');assert.equal(p.relationshipProgress.stage,'together');
 request(s,p,'spending');s.money.cash=0;assert.equal(answerSpouseDecision(s,p.id,true).ok,false);assert.ok(m.pending);
}
{
 const[s,p,m]=household();m.ambition=100;m.family=0;m.adventure=0;m.thrift=50;p.career.monthlyIncomeLocal=0;
 wait(s,tickSpouseAutonomy,()=>p.career.monthlyIncomeLocal>0);assert.ok(m.careerActed);
 m.pending=null;m.lastDecision=null;p.rel.trust=10;p.rel.affection=10;m.independence=100;
 wait(s,tickSpouseAutonomy,()=>p.relationshipProgress.stage==='separated');assert.equal(p.householdWith,p.id);
 m.pending=null;m.lastDecision=null;p.rel.trust=80;p.rel.affection=80;
 wait(s,tickSpouseAutonomy,()=>m.pending?.kind==='reconcile');
}
for(const role of ['father','mother','sibling','child','friend','colleague']){
 const[s,,]=household();s.relations.spouseIds=[];const p=createPerson(s,{age:26,role,nationality:'usa'});s.people={[p.id]:p};const m=personMind(s,p);p.rel.trust=80;p.rel.respect=80;
 wait(s,tickPeopleAutonomy,()=>m.pending);const q=JSON.parse(JSON.stringify(m.pending));const reloaded=JSON.parse(JSON.stringify(s));assert.deepEqual(reloaded.people[p.id].mind.pending,q);assert.ok(answerPeopleDecision(s,p.id,true).ok);assert.equal(m.pending,null);
 m.pending={kind:'money',amount:100,country:'usa',at:0};const cash=s.money.cash,balance=p.career.savingsLocal;assert.ok(answerPeopleDecision(s,p.id,true).ok);assert.equal(s.money.cash,cash-100);assert.equal(p.career.savingsLocal,balance+100);
 for(const kind of ['call','help','illness','fallout']){s.social.energy=10;m.pending={kind,at:0};assert.ok(answerPeopleDecision(s,p.id,true).ok);assert.equal(m.pending,null);}
 m.lastDecision=null;p.rel.trust=5;p.rel.respect=5;m.independence=100;
 wait(s,tickPeopleAutonomy,()=>!canContactPerson(s,p));assert.equal(callPerson(s,p.id).ok,false);
 s.year++;assert.equal(canContactPerson(s,p),true);
}
console.log('Shared persistent minds: spouse8requesttypes, career/leave/reconcile initiative; six nonspouse roles: calls/help/money/illness/fallout/no-contact, real cash/energy/relationship effects and reload.');
