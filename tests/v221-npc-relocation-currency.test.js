import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const W=new URL('../src/',import.meta.url).href;
const {createNewLifeState,ensureExtendedState}=await import(W+'core/schema.js');
const se=await import(W+'systems/soulEngine.js');
assert.equal(typeof se.npcRelocateMoney,'function','relocation helper exists');
const s=createNewLifeState({country:'deu',seed:5,familyTier:'middle'});ensureExtendedState(s);
const p=s.people[s.relations.fatherId];
p.residenceCountry='deu';p.career.monthlyIncomeLocal=5000;p.career.incomeIndexYear=s.year;p.career.savingsLocal=20000;
se.npcRelocateMoney(s,p,'deu','jpn');
assert.ok(p.career.monthlyIncomeLocal>200000,'5,000 EUR a month becomes hundreds of thousands of JPY, got '+p.career.monthlyIncomeLocal);
assert.ok(p.career.savingsLocal>1000000,'savings converted too, got '+p.career.savingsLocal);
/* health-event leisure prices: monthly gym, yoga, pool, internet and pills are realistic US-dollar figures */
import { readFileSync } from 'node:fs';
const src=readFileSync(new URL('../src/data/eventsMoneyHealthCareer.js',import.meta.url),'utf8');
for(const bad of [/ev_health_gym_membership[\s\S]{0,900}?eraUsdCost\(700/, /ev_money_internet_bill[\s\S]{0,900}?eraUsdCost\(600/, /ev_health_swimming[\s\S]{0,900}?eraHealthCost\(600/])assert.ok(!bad.test(src),'old inflated monthly price returned');
console.log('ok v221 npc relocation currency');
