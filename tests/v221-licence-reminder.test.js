// A lapsed licence keeps reminding the player every year, with how long, not once per five years.
import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{tickCareerMonthly}from'../src/systems/careerEducationEngine.js';
const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.player.age=40;s.year=2026;s.career.employed=true;s.career.trackExperience.aviation=10;
s.career.job={title:'Pilot',track:'aviation',level:0,employer:'Test',monthlyGross:5000,monthsInRole:11,performance:90,workMode:'normal',actionState:{licence:{medicalDueYear:2025,simDueYear:2027}}};
for(let y=0;y<4;y++){s.career.job.monthsInRole=11;tickCareerMonthly(s);s.year++;}
const lines=s.journal.filter(j=>/Promotion (still )?on hold/.test(j.text||j.t||JSON.stringify(j)));
assert.ok(lines.length>=3,'reminder repeats yearly, got '+lines.length);
assert.ok(lines.some(j=>/overdue for \d+ year/.test(JSON.stringify(j))),'says how long');
assert.equal(s.career.job.level,0);
console.log('PASS v221-licence-reminder',lines.length);
