import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const m=await import(new URL('../src/systems/careerEducationEngine.js',import.meta.url).href);
const n=m.marketMonthlyGross('bra',2026,'nursing',0)*12, t=m.marketMonthlyGross('bra',2026,'teaching',1)*12;
assert.ok(n>=4750*12, 'BRA staff nurse at or above the national floor, got '+n);
assert.ok(t>=5130*12*0.95, 'BRA teacher near the public floor, got '+t);
assert.ok(n<4750*13*1.15 && t<5130.63*13*1.15, 'and not far above it');
console.log('ok v221 bra floors');
