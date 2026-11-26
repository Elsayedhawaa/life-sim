// NPC job titles: no vague "Graduate Specialist" ladder, and no career change that drops an established professional to entry pay.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const so=await import('../src/systems/soulEngine.js');
const fs=await import('node:fs');
assert.ok(!/Graduate Specialist/.test(fs.readFileSync(new URL('../src/systems/soulEngine.js',import.meta.url),'utf8')));
const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;
const p=Object.values(s.people).find(x=>x.role==='mother');p.age=42;p.alive=true;
const before='Physician';let changed=0;
for(let i=0;i<6000;i++){p.career.title=before;p.career.monthlyIncomeLocal=19000;p.career.employed=true;so.npcJobChange(s,p);if(!p.career.title.includes(before)&&p.career.title!=='Seeking Work')changed++;}
assert.equal(changed,0,'a physician earning far above entry pay never becomes a driver or shop manager');
let low=0;for(let i=0;i<6000;i++){p.career.title='Driver';p.career.monthlyIncomeLocal=2000;so.npcJobChange(s,p);if(p.career.title!=='Driver')low++;}
assert.ok(low>0,'someone near entry pay can still change careers');
console.log('PASS v221-npc-titles');
