// Nurse and teacher starting pay follow published public pay scales (sources in src/systems/payShape.js).
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
import assert from 'node:assert/strict';
const m=await import('../src/systems/careerEducationEngine.js');
const y=(c,t,l)=>m.marketMonthlyGross(c,2026,t,l)*12;
const near=(a,b,tol,msg)=>assert.ok(Math.abs(a/b-1)<=tol,msg+' got '+Math.round(a)+' want about '+b);
near(y('usa','nursing',0),66030,0.03,'US staff nurse = BLS P10');
near(y('gbr','nursing',0),31049,0.03,'UK band 5 entry');
near(y('deu','nursing',0),40976,0.03,'DE TVoeD P7');
near(y('gbr','teaching',1),32916,0.03,'England teacher minimum');
near(y('aus','teaching',1),90177,0.03,'NSW graduate teacher');
assert.ok(y('usa','nursing',3)<=150000*1.02,'top of ladder not inflated');
assert.ok(y('gbr','nursing',2)<60000,'UK nurse manager stays near band 7-8a');
near(y('egy','nursing',0),98280,0.02,'unchecked country unchanged');
console.log('PASS v221-start-anchor');
