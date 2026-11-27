// Data analyst and data science are priced like the other tech-family tracks outside the USA: Japan junior data analyst was 6.6M JPY a year (1.75x the 3.8M entry tier) against a typical 4M.
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
import assert from 'node:assert/strict';
const m=await import('../src/systems/careerEducationEngine.js');
const y=(c,t,l)=>m.marketMonthlyGross(c,2026,t,l)*12;
assert.ok(y('jpn','data_analyst',0)<=4800000,'JP junior data analyst near entry pay, got '+y('jpn','data_analyst',0));
console.log('PASS v221-data-tracks-pay-shape');
const {payShape}=await import('../src/systems/payShape.js');
assert.equal(payShape('usa','data_analyst',2.25,1.5),2.25*1.5,'USA keeps the raw product');
console.log('PASS v221-data-tracks-usa-unchanged');
