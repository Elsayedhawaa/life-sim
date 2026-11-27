import assert from'node:assert/strict';import fs from'node:fs';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee,fireConfirmPrompt,severanceFor}from'../src/systems/businessStaff.js';
/* Firing was one tap beside Train and Promote. The first tap now names the person and the severance; only a second tap fires. */
const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e8;s.education.degrees=['medicine'];
const b=createBusiness(s,'enterprise_clinic','C',{mode:'full_time'}).biz;companyAction(s,b,'niche',0);hireBusinessEmployee(s,b,'doctor');hireBusinessEmployee(s,b,'receptionist');
const e=b.staff.find(x=>x.role==='receptionist');const n=b.staff.length;
const msg=fireConfirmPrompt(s,b,e.id);
assert.ok(msg.includes(e.name),'names the employee');assert.ok(msg.replace(/[, ]/g,'').includes(String(severanceFor(s,b,e).amount)),'shows the severance amount: '+msg);
assert.equal(b.staff.length,n,'the prompt itself fires nobody');assert.equal(fireConfirmPrompt(s,b,'nobody'),null);
const m=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
assert.ok(/window\.__fireArm/.test(m)&&/Date\.now\(\) - armed\.at < 10000/.test(m),'two-tap guard in the click handler');
console.log('ok v221 fire confirm');
