// "Sovereign Wealth" jobs are listed only in countries with a state fund of that name.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const m=await import('../src/systems/careerEducationEngine.js');
const {createNewLifeState}=await import('../src/core/schema.js');
const mk=c=>{const S=createNewLifeState({country:c});S.country=c;S.year=2030;S.education.degrees=['business'];S.career.trackExperience={sovereign_pe:10};return S;};
const has=c=>m.listAvailableJobs(mk(c)).some(j=>j.track==='sovereign_pe');
assert.equal(has('jpn'),false);assert.equal(has('ita'),false);assert.equal(has('usa'),false);
assert.equal(has('sau'),true);assert.equal(has('sgp'),true);
console.log('PASS v221-sovereign-gate');
