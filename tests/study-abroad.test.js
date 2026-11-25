import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {COUNTRY_IDS} from '../src/data/countries.js';
import {convertCurrency} from '../src/data/economy.js';
import {studyAbroadQuote,studyAwardKey} from '../src/systems/studyAbroadPlanning.js';
import {applyStudyAbroad,applyOverseasScholarship,finishPendingRelocation} from '../src/systems/visaMigrationEngine.js';
import {familyEducationFunds,monthlyUniversityTuition,settleFamilyUniversityMonth} from '../src/systems/educationFunding.js';
import {tickUniversityAndConscriptionMonthly} from '../src/systems/careerEducationEngine.js';
import {tickMegaSystemsMonthly} from '../src/systems/completeLifeSystems.js';
function base(seed=55){const s=createNewLifeState({country:'egy',seed,birthYear:2008});ensureExtendedState(s);s.year=2026;s.month=2;s.player.age=18;s.education.stage='graduated_high';s.education.highSchoolScore=99;s.education.languages=['English (IELTS 8.0)'];s.player.vitals.smarts=95;s.money.cash=1e9;s.money.savings=0;s.legal.military.travelPermitted=true;s.legal.passports[0].expiresYear=2036;return s;}
let checks=0;
for(const dest of COUNTRY_IDS.filter(c=>c!=='egy'))for(const level of ['bachelor','masters','phd'])for(const funding of ['self','parents','scholarship']){
 const s=base();if(level!=='bachelor'){s.education.degrees=['cs'];s.education.stage='completed';}if(level==='phd')s.postgrad.completed=[{tier:'masters_mba'}];
 for(const id of [s.relations.fatherId,s.relations.motherId]){s.people[id].alive=true;s.people[id].career.savingsLocal=1e10;s.people[id].residenceCountry='egy';}
 if(funding==='scholarship'){s.education.studyAwards={[studyAwardKey(s,dest,level)]:{awarded:true}};}
 const q=studyAbroadQuote(s,dest,{level,funding});if(!q.ok){console.log(dest,level,funding,q.reason);continue;}
 const cash=s.money.cash,parents=familyEducationFunds(s),r=applyStudyAbroad(s,dest,'cs',{level,funding});assert.ok(r.ok,r.msg);assert.equal(s.country,dest);assert.equal(s.legal.residency.kind,'student_visa');
 if(funding==='parents'){assert.equal(Math.round(s.money.cash),Math.round(convertCurrency(cash,'egy',dest,2026)));assert.ok(Math.abs(parents-convertCurrency(familyEducationFunds(s),dest,'egy',2026)-q.totalPlayer)<2,[dest,level,parents,familyEducationFunds(s),q.totalPlayer].join(' '));}
 else assert.ok(Math.abs(s.money.cash-convertCurrency(cash-q.totalPlayer,'egy',dest,2026))<2);
 if(level==='bachelor'){
 assert.equal(s.education.university.annualTuition,q.annualDest);assert.equal(monthlyUniversityTuition(s),0);
 for(let i=0;i<12;i++){settleFamilyUniversityMonth(s);assert.equal(monthlyUniversityTuition(s),0);}
 settleFamilyUniversityMonth(s);assert.equal(monthlyUniversityTuition(s),funding==='self'?Math.round(q.annualDest/12):0);
 s.education.university.elapsedMonths=q.years*12-1;s.month++;tickUniversityAndConscriptionMonthly(s);assert.equal(s.education.university,null);assert.ok(s.education.degrees.includes('cs'));assert.equal(s.legal.residency.kind,'post_study_work');
 }else{assert.ok(s.postgrad.active);assert.equal(s.postgrad.active.feePaid,q.tuitionDest);s.postgrad.active.monthsLeft=1;tickMegaSystemsMonthly(s);assert.equal(s.postgrad.active,null);assert.equal(s.legal.residency.kind,'post_study_work');}
 checks++;
}
let s=base();const snap=JSON.stringify(s);assert.equal(applyStudyAbroad(s,'gbr','cs',{level:'phd'}).ok,false);assert.equal(JSON.stringify(s),snap);
s=base();s.education.languages=[];assert.equal(studyAbroadQuote(s,'gbr').ok,false);assert.equal(applyStudyAbroad(s,'gbr').ok,false);
s=base();s.education.studyAwards={};assert.equal(applyStudyAbroad(s,'gbr','cs',{funding:'scholarship'}).ok,false);
s=base();s.pendingRelocation={destCountry:'usa'};assert.equal(studyAbroadQuote(s,'gbr').ok,false);
s=base();s.legal.passports[0].expiresYear=2025;const cash=s.money.cash;assert.equal(applyStudyAbroad(s,'gbr').ok,false);assert.equal(s.money.cash,cash);
s=base();s.money.savings=s.money.cash;s.money.cash=0;let q=studyAbroadQuote(s,'gbr');assert.ok(applyStudyAbroad(s,'gbr').ok);assert.ok(s.money.savings>0);assert.ok(s.money.cash>=0);
let won=0,lost=0;for(let i=1;i<70;i++){s=base(i);const r=applyOverseasScholarship(s,'gbr');r.ok?won++:lost++;assert.equal(applyOverseasScholarship(s,'gbr').ok,false);}assert.ok(won&&lost);
console.log(`Passed${checks}overseas country/level/funding transactions, tuition prepayment, parent debit/currency, completion/permit transitions and gate/no-side-effect/savings/award checks (${won}/${lost}).`);

s=base();s.career.businesses=[{id:'test_biz',name:'Test shop',country:'egy',monthlyRev:10000,monthlyCost:5000,capital:100000,staff:[]}];s.career.business=s.career.businesses[0];let r=applyStudyAbroad(s,'gbr');assert.ok(r.deferred);assert.equal(s.country,'egy');assert.equal(s.education.university,null);const charged=s.money.cash;assert.equal(applyStudyAbroad(s,'gbr').ok,false);assert.equal(s.money.cash,charged);s=JSON.parse(JSON.stringify(s));s.pendingRelocation.remaining=[];finishPendingRelocation(s);assert.equal(s.country,'gbr');assert.equal(s.education.university.international,true);assert.equal(s.education.university.prepaidMonths,12);console.log('Passed saved/deferred business move continuation and duplicate debit guard.');
