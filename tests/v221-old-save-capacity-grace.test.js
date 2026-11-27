import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{tickBusinessCapacityMonth}from'../src/systems/businessCapacity.js';
/* Old saves have no rules.capacity flag. With businesses over the 70-hour week they get a six-month grace; new lives and no-business saves do not. */
const mk=()=>{const S=createNewLifeState({country:'usa',seed:9});ensureExtendedState(S);S.year=2030;S.month=1;
S.career.businesses=[1,2,3].map(i=>({id:'b'+i,typeId:'cafe',name:'Cafe '+i,mode:'full_time',staff:[]}));return S};
const old=mk();delete old.rules.capacity;delete old.rules.capacityGraceUntil;ensureExtendedState(old);
assert.ok(old.rules.capacityGraceUntil>0,'grace stamped on an old save with businesses');
for(let i=0;i<6;i++){old.month=(old.month%12)+1;tickBusinessCapacityMonth(old);}
assert.ok(old.career.businesses.every(b=>!b.unmanagedMonths),'nothing slides during grace');
assert.ok(old.journal.filter(j=>/now need your hours, or a manager/.test(JSON.stringify(j))).length===1,'told once');
old.year=2031;old.month=3;for(let i=0;i<3;i++)tickBusinessCapacityMonth(old);
assert.ok(old.career.businesses.some(b=>b.unmanagedMonths>=3),'after grace the normal rule applies');
const fresh=mk();assert.equal(fresh.rules.capacityGraceUntil,undefined,'new lives get no grace');
const none=createNewLifeState({country:'usa',seed:2});delete none.rules.capacity;ensureExtendedState(none);assert.equal(none.rules.capacityGraceUntil,undefined);assert.equal(none.rules.capacity,true);
console.log('ok v221 old save capacity grace');
