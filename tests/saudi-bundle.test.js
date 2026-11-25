import assert from 'node:assert/strict';
import {createNewLifeState,createPerson} from '../src/core/schema.js';
import {propertyFloorPlans} from '../src/ui/visualEngine3d.js';
import {resolveInkPortraitFile} from '../src/ui/portraits.js';
import {pickDynamicBanner} from '../src/ui/views.js';
import {eventGatePasses,resolveEventCtx} from '../src/systems/eventEngine.js';
import {EVENTS_LIVED_LIFE} from '../src/data/eventsLivedLife.js';
const s=createNewLifeState({country:'sau',seed:23});s.city='Riyadh';s.player.age=28;s.year=2026;s.career.employed=false;s.career.job=null;const f=createPerson(s,{role:'friend',age:28});s.people[f.id]=f;s.relations.friendIds=[f.id];
// Country-level artwork replaced city routing by user request.
assert.equal(pickDynamicBanner(s,'life'),'saudi_family_home_ink.jpg');assert.equal(pickDynamicBanner(s,'realestate'),'saudi_family_home_ink.jpg');s.city='Jeddah';assert.ok(!pickDynamicBanner(s,'life').includes('riyadh'));s.city='Riyadh';s.year=1998;assert.equal(pickDynamicBanner(s,'life'),'career_enterprise_ink.jpg');s.year=2026;
assert.equal(resolveInkPortraitFile({age:70,gender:'m',nationality:'sau',appearance:{headwearMode:'shemagh'}}),'p_saudi_elder_man.jpg');assert.notEqual(resolveInkPortraitFile({age:70,gender:'m',nationality:'sau',appearance:{headwearMode:'none'}}),'p_saudi_elder_man.jpg');
for(const shape of ['studio','apartment','duplex','penthouse','townhouse','twin_house','villa','chalet','mansion']){const ps=propertyFloorPlans(shape,'sau',185,3);assert.equal(Math.round(ps.flatMap(f=>f.rooms).reduce((n,r)=>n+r.m2,0)*10),1850);for(const p of ps)for(const r of p.rooms){assert.ok(r.x>=p.shell.x-.1);assert.ok(r.x+r.w<=p.shell.x+p.shell.w+.1)}}
for(const e of EVENTS_LIVED_LIFE.filter(e=>e.id.startsWith('ev_sau_'))){assert.ok(eventGatePasses(e,s));const cash=s.money.cash;e.build(s,resolveEventCtx(s)).choices[0].effect(s);assert.equal(s.money.cash,cash);s.country='egy';assert.equal(eventGatePasses(e,s),false);s.country='sau';}
console.log('Passed Saudi scene/city/year routes, elder appearance, 9 home types and 2 gated local stories.');
