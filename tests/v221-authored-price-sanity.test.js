import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read=f=>readFileSync(new URL('../src/data/'+f,import.meta.url),'utf8');
const A=read('eventsMoneyHealthCareer.js'), B=read('eventsEverydayFamily.js');
/* US-dollar base figure of the first price call inside an event, with a ceiling a real US price should not pass */
function base(src,id){const i=src.indexOf("id: '"+id+"'");assert.ok(i>=0,id);const m=src.slice(i,i+2500).match(/(?:eraUsdCost|eraHealthCost|cost|healthCost)\((?:S|st)?,? *(\d+)/);assert.ok(m,id+' has a price');return +m[1];}
const caps=[[A,'ev_health_gym_membership',100],[A,'ev_money_internet_bill',100],[A,'ev_health_swimming',100],[A,'ev_health_blood_pressure',80],[A,'ev_money_haircut_price',80],[A,'ev_money_electricity_spike',400],[A,'ev_money_car_insurance',3000],[A,'ev_school_new_uniform',300],[A,'ev_school_tutor_offer',400],[A,'ev_uni_cheating_ring',500],[A,'ev_career_strike_day',400],[B,'ev_life_bad_haircut',80],[B,'ev_life_gym_offer',100]];
for(const [s,id,cap] of caps) assert.ok(base(s,id)<=cap, id+' base '+base(s,id)+' above '+cap);
console.log('ok v221 authored price sanity');
