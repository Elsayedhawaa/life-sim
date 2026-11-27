import assert from'node:assert/strict';import fs from'node:fs';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction,companyOpenBlocker}from'../src/systems/companyLifecycle.js';
/* The Overview must name what stops a finished company opening (played run: pharmacy sat 6 months at about -11k/month with a hint that only said "press Open"). */
const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e8;s.education.degrees=['pharmacy'];
const b=createBusiness(s,'enterprise_pharmacy','P',{mode:'full_time'}).biz;companyAction(s,b,'niche',0);
assert.equal(companyOpenBlocker(b),null,'not ready yet: no blocker is reported');
b.enterprise.progress=100;b.enterprise.stage='ready';
const blk=companyOpenBlocker(b);assert.ok(/premises/.test(blk),'premises named first: '+blk);
const r=companyAction(s,b,'open');assert.equal(r.ok,false);
companyAction(s,b,'premises');const blk2=companyOpenBlocker(b);assert.ok(/pharmacist/i.test(blk2),'then the missing role: '+blk2);
assert.equal(companyAction(s,b,'open').ok,false);
const v=fs.readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');assert.ok(/cannot open yet: '\+companyOpenBlocker\(biz\)/.test(v),'Overview shows the blocker');
import{roleHireBlurb}from'../src/systems/businessRoles.js';
assert.ok(!/fixes things/.test(roleHireBlurb('technician')),'technician blurb must fit a pharmacy or lab, not only a repair shop');
console.log('ok v221 open blocker hint');
