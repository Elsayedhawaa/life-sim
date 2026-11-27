import assert from'node:assert/strict';import fs from'node:fs';
import{deadLifeBlocks,DEAD_LIFE_ALLOWED_ACTIONS}from'../src/core/deadLifeGuard.js';
/* Decision: after death the Career tab let a player launch a business and pay for it. UI actions are gated on gameOver. */
const live={gameOver:false},dead={gameOver:true};
for(const a of['launch-business','apply-job','buy-car','biz-hire','take-loan','sell-asset','bank-withdraw'])assert.ok(deadLifeBlocks(dead,a)&&!deadLifeBlocks(live,a),a+' blocked only when dead');
for(const a of['switch-tab','open-new-life','continue-as-child','toggle-theme','dismiss-turn-result'])assert.ok(!deadLifeBlocks(dead,a),a+' stays open when dead');
assert.ok(DEAD_LIFE_ALLOWED_ACTIONS.has('continue-as-child'));
const m=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.ok(/deadLifeBlocks\(S, action\)/.test(m),'click dispatcher checks the guard before any action');
console.log('ok v221 dead life guard');
const mg=fs.readFileSync(new URL('../src/systems/companyMigration.js',import.meta.url),'utf8');
assert.ok(!/does not support yet/.test(mg)&&/cannot support in this model/.test(mg),'convert refusal no longer implies it will pass later');
/* Interview wording: no work history means no "experience" claim. */
import{createNewLifeState}from'../src/core/schema.js';import{buildJobInterviewScene}from'../src/systems/careerEducationEngine.js';
{const S=createNewLifeState({country:'egy',birthYear:1998});const offer={track:'x',title:'Customer Advisor',employer:'Acme'};
S.career.yearsExperience=0;assert.ok(!/your experience/.test(buildJobInterviewScene(S,offer).choices[0].label),'no history: no experience claim');
S.career.yearsExperience=3;assert.ok(/your experience/.test(buildJobInterviewScene(S,offer).choices[0].label),'with history: experience wording');}
