import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
import { readFileSync } from 'node:fs';
const W=new URL('../src/',import.meta.url);
const m=await import(new URL('systems/careerEducationEngine.js',W).href);
const e=await import(new URL('data/economy.js',W).href);
/* braces 18,000 USD: USA unchanged, elsewhere follows wages (not the basket) */
const us=m.usdMonthlyPayToLocal('usa',2026,18000);
assert.equal(us, 18000);
const sgp=m.usdMonthlyPayToLocal('sgp',2026,18000), ind=m.usdMonthlyPayToLocal('ind',2026,18000);
const sgpUsd=sgp/e.convertCurrency(1,'usa','sgp',2026), indUsd=ind/e.convertCurrency(1,'usa','ind',2026);
assert.ok(sgpUsd<18000*0.9, 'SGP braces below the US price, got USD '+Math.round(sgpUsd));
assert.ok(indUsd<18000*0.3, 'IND braces well below US price, got USD '+Math.round(indUsd));
/* source: every category health event, and the named medical ones, use the wage-scale helper, not the goods scale */
const src=readFileSync(new URL('data/eventsMoneyHealthCareer.js',W),'utf8');
const parts=src.split(/\n  \{\n    id: /).slice(1);
for(const p of parts){
  const id=(p.match(/^'([^']+)'/)||[])[1];
  const health=/category: 'health'/.test(p)||id==='ev_money_dentist_bill';
  if(health) assert.ok(!/eraUsdCost\(/.test(p), id+' still prices medical care on the goods scale');
}
console.log('ok v221 health prices wage scale');
