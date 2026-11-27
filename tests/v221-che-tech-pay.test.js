// Swiss software pay stays inside the published range: federal wage survey 2024, ICT specialists P90 about CHF 181k a year.
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
import assert from 'node:assert/strict';
const m=await import('../src/systems/careerEducationEngine.js');
const y=l=>m.marketMonthlyGross('che',2026,'software',l)*12;
assert.ok(y(0)>=78000&&y(0)<=110000,'junior below the all-ICT lower quartile (CHF 97k) but not far under it');
assert.ok(y(2)>=140000&&y(2)<=181000,'senior at or below the published P90, got '+y(2));
console.log('PASS v221-che-tech-pay');
