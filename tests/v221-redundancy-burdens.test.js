// The redundancy line names only the burdens this life really has.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {redundancyBurdens}=await import('../src/systems/careerConsequences.js');
const s=createNewLifeState({country:'aus',seed:2});ensureExtendedState(s);s.homeCountry='aus';s.money.loans=[];s.relations.spouseIds=[];s.relations.childIds=[];
assert.ok(!/mortgage|visa|family/i.test(redundancyBurdens(s)),redundancyBurdens(s));
s.homeCountry='can';s.relations.childIds=['x'];s.money.loans=[{kind:'mortgage'}];
const t=redundancyBurdens(s);assert.ok(/mortgage/.test(t)&&/family/.test(t)&&/visa/.test(t),t);
console.log('PASS v221-redundancy-burdens');
