import assert from'node:assert/strict';import fs from'node:fs';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction,companyOutOfStock}from'../src/systems/companyLifecycle.js';
/* Played run: a pharmacy sold its one half-capacity order in a month, then sat at zero sales for four months with the card saying "Review your costs". */
function mk(id,deg){const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e8;s.education.degrees=[deg];const b=createBusiness(s,'enterprise_'+id,'P',{mode:'full_time'}).biz;companyAction(s,b,'niche',0);return[s,b];}
const[s,b]=mk('pharmacy','pharmacy');
assert.equal(companyOutOfStock(b),false,'not trading yet');
b.enterprise.stage='trading';b.enterprise.stock=0;assert.equal(companyOutOfStock(b),true,'trading with 0 stock');
b.enterprise.stock=10;assert.equal(companyOutOfStock(b),false,'stock on hand');
const[s2,c]=mk('clinic','medicine');c.enterprise.stage='trading';c.enterprise.stock=0;assert.equal(companyOutOfStock(c),false,'a clinic holds no stock');
const v=fs.readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');assert.ok(/companyOutOfStock\(biz\)\?'Out of stock'/.test(v));
console.log('ok v221 out of stock hint');
