import assert from'node:assert/strict';import{createNewLifeState,ensureExtendedState,createPerson}from'../src/core/schema.js';import{playWithChild,teachChild,takeChildOut,helpChildWithHomework,supportChildAfterSeparation}from'../src/systems/marriageFamilyEngine.js';import{monthsSinceContact}from'../src/systems/socialEnergy.js';
function setup(age){const s=createNewLifeState({country:'gbr',seed:120});ensureExtendedState(s);s.player.age=50;s.player.vitals.smarts=80;s.money.cash=100000;s.turn=20;s.year=2040;s.month=6;const ch=createPerson(s,{role:'child',age,nationality:'gbr',residenceCountry:'gbr'});s.people[ch.id]=ch;s.relations.childIds=[ch.id];ch.rel.lastContactYear=2039;ch.rel.lastContactMonth=1;return{s,ch};}
for(const fn of [playWithChild,teachChild,helpChildWithHomework]){const{s,ch}=setup(23),before=JSON.stringify(s);assert(!fn(s,ch.id).ok);assert.equal(JSON.stringify(s),before);}
for(const fn of [playWithChild,teachChild,takeChildOut,helpChildWithHomework,(s,id)=>supportChildAfterSeparation(s,id,'visit')]){const{s,ch}=setup(10);assert(monthsSinceContact(s,ch)>12);assert(fn(s,ch.id).ok);assert.equal(monthsSinceContact(s,ch),0);}
for(const kind of ['gift','education']){const{s,ch}=setup(23);assert(supportChildAfterSeparation(s,ch.id,kind).ok);assert(monthsSinceContact(s,ch)>12);}
{const{s,ch}=setup(23);assert(takeChildOut(s,ch.id).ok);assert.equal(monthsSinceContact(s,ch),0);}
console.log('Adult child-only verbs guarded, adult outing/visit and young-child actions record contact, gift/funding never pretend contact pass');

{const{s,ch}=setup(10);ch.residenceCountry='usa';const before=JSON.stringify(s);assert(!playWithChild(s,ch.id).ok);assert.equal(JSON.stringify(s),before);}
{const{s,ch}=setup(23);s.money.cash=0;assert(!takeChildOut(s,ch.id).ok);s.money.cash=100000;assert(takeChildOut(s,ch.id).ok);}
