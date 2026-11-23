import assert from 'node:assert/strict';
import {createNewLifeState,createPerson} from '../src/core/schema.js';
import {propertyFloorPlans} from '../src/ui/visualEngine3d.js';
import {resolveInkPortraitFile} from '../src/ui/portraits.js';
import {pickDynamicBanner} from '../src/ui/views.js';
import {eventGatePasses,resolveEventCtx} from '../src/systems/eventEngine.js';
import {EVENTS_LIVED_LIFE} from '../src/data/eventsLivedLife.js';
const s=createNewLifeState({country:'uae',seed:23});s.city='Dubai';s.player.age=28;s.year=2026;s.career.employed=false;s.career.job=null;s.housing.mode='rent';const f=createPerson(s,{role:'friend',age:28});s.people[f.id]=f;s.relations.friendIds=[f.id];
assert.equal(pickDynamicBanner(s,'life'),'uae_apartment_home_ink.jpg');assert.equal(pickDynamicBanner(s,'realestate'),'uae_apartment_home_ink.jpg');s.city='Abu Dhabi';assert.ok(!pickDynamicBanner(s,'life').includes('uae_city'));s.city='Dubai';s.year=1998;assert.equal(pickDynamicBanner(s,'life'),'era_vintage_street_ink.jpg');s.year=2026;
assert.equal(resolveInkPortraitFile({age:70,gender:'m',nationality:'uae',appearance:{headwearMode:'ghutra'}}),'p_uae_elder_man.jpg');assert.notEqual(resolveInkPortraitFile({age:70,gender:'m',nationality:'uae',appearance:{headwearMode:'none'}}),'p_uae_elder_man.jpg');
for(const shape of ['studio','apartment','duplex','penthouse','townhouse','twin_house','villa','chalet','mansion']){const ps=propertyFloorPlans(shape,'uae',185,3);assert.equal(Math.round(ps.flatMap(f=>f.rooms).reduce((n,r)=>n+r.m2,0)*10),1850);for(const p of ps)for(const r of p.rooms){assert.ok(r.x>=p.shell.x-.1);assert.ok(r.x+r.w<=p.shell.x+p.shell.w+.1)}}
for(const e of EVENTS_LIVED_LIFE.filter(e=>e.id.startsWith('ev_uae_'))){assert.ok(eventGatePasses(e,s));const cash=s.money.cash;e.build(s,resolveEventCtx(s)).choices[0].effect(s);assert.equal(s.money.cash,cash);s.country='egy';assert.equal(eventGatePasses(e,s),false);s.country='uae';}
console.log('Passed UAE scene/city/year routes, elder appearance, 9 home types and 2 gated local stories.');
