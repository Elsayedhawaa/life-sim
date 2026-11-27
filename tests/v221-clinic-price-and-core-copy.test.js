import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction,renderCompany,COMPANY_SECTORS}from'../src/systems/companyLifecycle.js';
import{hireBusinessEmployee}from'../src/systems/businessStaff.js';
/* Played run: a staffed GP clinic charged ~43 USD a visit (public self-pay and Medicare-level fees are ~90-170) and Operations still said a doctor was required. */
const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e8;s.education.degrees=['medicine'];
const b=createBusiness(s,'enterprise_clinic','C',{mode:'full_time'}).biz;companyAction(s,b,'niche',0);
assert.ok(b.enterprise.price>=60&&b.enterprise.price<=90,"US GP visit price in the 60-90 USD band, got "+b.enterprise.price);
assert.ok(/is required/.test(renderCompany(s,b,'operations')),'no doctor yet');
hireBusinessEmployee(s,b,'doctor');
const h=renderCompany(s,b,'operations');
assert.ok(/A doctor is on the team/.test(h)&&!/A doctor is required/.test(h),'staffed clinic must not say required');
console.log('ok v221 clinic price and core copy');
