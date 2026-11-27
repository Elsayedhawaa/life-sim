import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
const s=createNewLifeState({country:'fra',seed:5});ensureExtendedState(s);
s.homeCountry='sau';s.player.age=20;s.year=2018;s.career.employed=false;s.career.job=null;s.money.savings=0;s.housing.mode='rent';s.housing.currentHomeId='f';s.housing.monthlyRent=300;s.housing.currentHomeName='Shared Bedspace / Room';s.housing.evictionCount=2;s.housing.playerLease=null;
const quiet=[];
for(let m=1;m<=12;m++){s.month=m;s.money.cash=-5000;s.housing.mode='rent';s.money.missedRentMonths=2;settleHouseholdMonth(s);if(s.housing.lastEviction&&s.housing.lastEviction.month===m)quiet.push(!!s.housing.lastEviction.quiet);}
assert.ok(quiet.length>=3,'repeat evictions happen: '+quiet.length);
assert.equal(quiet.filter(q=>!q).length,1,'only the first repeat in a year is told');
console.log('v221-repeat-eviction-quiet ok');
