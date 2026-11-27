import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{createBusiness}from'../src/systems/businessEngine.js';
import{companyAction}from'../src/systems/companyLifecycle.js';
/* Played-audit: every guesthouse niche lost money (nightly rate 48-178 USD vs a 160 USD US average rate) and eight rooms needed five staff. */
function mk(n){const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=40;s.year=2026;s.month=1;s.money.cash=1e8;const b=createBusiness(s,'enterprise_hospitality','H',{mode:'full_time'}).biz;companyAction(s,b,'niche',n);return b.enterprise;}
const budget=mk(0),boutique=mk(1),hotel=mk(2);
assert.ok(budget.price>=80&&budget.price<=110,'budget night '+budget.price);
assert.ok(hotel.price>=140&&hotel.price<=190,'hotel with breakfast night '+hotel.price);
assert.ok(boutique.price>hotel.price*0.9,'boutique not below the hotel night');
assert.equal(hotel.crewExp,.75,'new hospitality companies scale crew with premises^0.75');
console.log('ok v221 hospitality price crew');
