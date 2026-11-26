// Event prices written as US dollars are scaled by each country's cost of living, so a cost is the same share of a month's basket everywhere. USA unchanged.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const E=await import('../src/data/economy.js');const {COUNTRIES}=await import('../src/data/countries.js');
const fs=await import('node:fs');
for(const y of [1990,2010,2026,2060])assert.equal(E.eraUsdCost(400,'usa',y),E.eraLocalCost(400,'usa',y),'USA unchanged in '+y);
const basket=c=>{const b=COUNTRIES[c].monthlyBasket2026;return (b.foodAdult+b.utilities+b.transport+b.phoneInternet+b.rentStandard)};
const shareUs=E.eraUsdCost(400,'usa',2026)/basket('usa');
for(const c of Object.keys(COUNTRIES)){
  const share=E.eraUsdCost(400,c,2026)/basket(c);
  assert.ok(Math.abs(share/shareUs-1)<0.02,`${c}: 400 USD event costs ${(share*100).toFixed(2)}% of a month's basket, USA ${(shareUs*100).toFixed(2)}%`);
  const usd=E.eraUsdCost(400,c,2026)/E.usdRate(c,2026);
  assert.ok(usd>=30&&usd<=600,`${c}: a 400 USD event costs ${usd.toFixed(0)} USD-equivalent`);
  assert.ok(E.eraUsdCost(400,c,2050)>E.eraUsdCost(400,c,2030),`${c}: later years cost more`);
}
assert.ok(E.eraUsdCost(400,'jpn',2026)>20000,'a 400 USD event in Japan is tens of thousands of yen');
for(const f of ['data/eventsMoneyHealthCareer.js','data/eventsMemory.js']){
  const t=fs.readFileSync(new URL('../src/'+f,import.meta.url),'utf8');
  assert.ok(!/eraLocalCost\(\d+,/.test(t),f+' still prices a bare number as local currency');}
console.log('PASS v221-event-cost-scaling');
