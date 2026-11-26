// Parents and siblings no longer all pick the single dearest eligible car: the pick is a per-person seeded choice among the top three.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {syncParentAssets,syncSiblingAssets}=await import('../src/systems/familyFortune.js');
let differ=0,lives=0,withCars=0;
for(let seed=1;seed<=30;seed++){
  const s=createNewLifeState({country:['egy','usa','gbr'][seed%3],seed:seed*13+1,familyTier:'wealthy'});ensureExtendedState(s);s.year=2030;s.player.age=30;
  const mom=s.people[s.relations.motherId],dad=s.people[s.relations.fatherId];if(!mom||!dad)continue;
  for(const p of [mom,dad]){p.alive=true;p.career??={};p.career.savingsLocal=5e9;p.assets??={};p.assets.car=null;}
  try{syncParentAssets(s);syncSiblingAssets(s);}catch(e){assert.fail('sync threw '+e.message)}
  lives++;if(mom.assets.car&&dad.assets.car){withCars++;if(mom.assets.car.id!==dad.assets.car.id)differ++;}
}
assert.ok(withCars>=10,'enough lives gave both parents a car ('+withCars+')');
assert.ok(differ>0,'at least one life where the two parents drive different cars ('+differ+' of '+withCars+')');
console.log('PASS v221-parent-car-variety');
