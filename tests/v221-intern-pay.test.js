import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {internMonthlyPayToLocal,usdMonthlyPayToLocal}=await import('../src/systems/careerEducationEngine.js');
const at=(c,y)=>internMonthlyPayToLocal(c,y,4000);
/* intern pay sits inside published 2025-26 ranges (local currency per month, full-time) */
const band={usa:[3500,4600],gbr:[1700,2300],deu:[1400,2000],fra:[550,900],bra:[1100,1700],egy:[2500,6000],ind:[5000,12000],che:[1800,2600],sgp:[1000,2000],uae:[2000,5000],nld:[300,600]};
for(const [c,[lo,hi]] of Object.entries(band)){const v=at(c,2026);assert.ok(v>=lo&&v<=hi,`${c} intern pay ${v} outside ${lo}..${hi}`);}
assert.equal(at('usa',2026),usdMonthlyPayToLocal('usa',2026,4000),'USA unchanged');
assert.ok(at('egy',2015)<at('egy',2026),'still moves with local wages over time');
console.log('ok v221 intern pay');
