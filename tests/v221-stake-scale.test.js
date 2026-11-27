// Business stakes (uncle's shop, friend's business) are sized against wages: the same share of entry pay in every country.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const src=fs.readFileSync(new URL('../src/data/eventsEverydayFamily.js',import.meta.url),'utf8');
for(const id of ['ev_family_uncle_investment','ev_friend_business_invest']){
  const i=src.indexOf(`id: '${id}'`);const k=src.indexOf('const ask =',i);
  assert.ok(src.slice(k,k+30).startsWith('const ask = stakeCost('),id+' uses the wage scale');
}
const m=await import('../src/systems/careerEducationEngine.js');
const share=c=>m.usdMonthlyPayToLocal(c,2026,2500)/m.marketMonthlyGross(c,2026,'business',0);
for(const c of ['egy','tur','bra','ind']) assert.ok(Math.abs(share(c)-share('usa'))<0.2,c+' stake share of entry pay '+share(c));
console.log('PASS v221-stake-scale');
