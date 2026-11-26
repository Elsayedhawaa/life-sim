// A promotion is priced at the current market line, so the wage-index catch-up for earlier years must not be applied on top of it at the next review.
import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{tickCareerMonthly}from'../src/systems/careerEducationEngine.js';
const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.player.age=40;s.year=2030;s.career.employed=true;s.career.trackExperience.aviation=10;
s.career.job={title:'Pilot',track:'aviation',level:0,employer:'Test',monthlyGross:5000,monthsInRole:11,performance:90,workMode:'normal',payIndexYear:2020};
tickCareerMonthly(s);
assert.ok(s.career.job.level>0,'promoted');
assert.equal(s.career.job.payIndexYear,2030,'promotion resets the pay-index year (was '+s.career.job.payIndexYear+')');
console.log('PASS v221-promo-index');
