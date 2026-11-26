// Car market rule: models are not offered in countries where the brand is not sold, but remain in the catalogue.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {CARS_MEGA_CATALOG:C,carSoldInCountry:ok}=await import('../src/data/megaCarsAndShop.js');
const {showroomCarQuote}=await import('../src/systems/completeLifeSystems.js');
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const by=(b)=>C.find(c=>c.brand===b&&c.yearFrom<=2030&&c.yearTo>=2030);
assert.equal(ok(by('dodge'),'jpn'),false);assert.equal(ok(by('dodge'),'usa'),true);
assert.equal(ok(by('byd'),'usa'),false);assert.equal(ok(by('byd'),'egy'),true);
assert.equal(ok(by('tata'),'deu'),false);assert.equal(ok(by('tata'),'ind'),true);
assert.equal(ok(by('toyota'),'jpn'),true);
const s=createNewLifeState({country:'jpn',seed:3});ensureExtendedState(s);s.year=2030;
assert.equal(showroomCarQuote(s,by('dodge').id).ok,false);
assert.equal(showroomCarQuote(s,by('toyota').id).ok,true);
console.log('PASS v221-car-market');
