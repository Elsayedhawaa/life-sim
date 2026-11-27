import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const W=new URL('../src/',import.meta.url).href;
const L=await import(W+'systems/propertyLandlord.js');
const {EMPLOYERS}=await import(W+'data/institutions.js');
const {TENANT_JOB_TITLES}=await import(W+'data/propertyLandlordData.js');
for(const t of TENANT_JOB_TITLES) assert.ok(L.TENANT_TITLE_SECTOR[t],'every tenant title has a sector: '+t);
for(const c of ['fra','usa','egy','jpn']){
  const teach=L.tenantEmployersFor(c,'teaching');
  assert.ok(teach.length>0, c+' has teaching employers');
  for(const n of teach) assert.ok(EMPLOYERS[c].teaching.includes(n));
}
assert.ok(!L.tenantEmployersFor('fra','teaching').includes('Decathlon'));
console.log('ok v221 tenant title employer');
