// Repeatedly losing the same shared room is told once a year, not every quarter.
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {createNewLifeState,ensureExtendedState}=await import('../src/core/schema.js');
const {advanceSingleTurn}=await import('../src/core/gameLoop.js');
const s=createNewLifeState({country:'jpn',seed:9});ensureExtendedState(s);s.homeCountry='can';s.player.age=20;
s.housing.mode='rent';s.housing.currentHomeName='Shared Bedspace / Room';s.housing.monthlyRent=40000;s.housing.evictionCount=1;
let n=0;const seen=new Set();
for(let i=0;i<48&&!s.gameOver;i++){s.money.cash=Math.min(s.money.cash,-50000);if(s.activeScene)s.activeScene=null;advanceSingleTurn(s);for(const j of s.journal)if(!seen.has(j.id)){seen.add(j.id);if(/Evicted again/.test(j.text))n++;}}
assert.ok(s.housing.evictionCount>=4,'the fixture really produces repeat evictions: '+s.housing.evictionCount);
assert.ok(n<=5,'one "Evicted again" line per year at most, got '+n+' over 4 years');
console.log('PASS v221-eviction-repeat',n,s.housing.evictionCount);
