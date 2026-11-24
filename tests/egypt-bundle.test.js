import assert from 'node:assert/strict';
import {createNewLifeState} from '../src/core/schema.js';
import {propertyFloorPlans} from '../src/ui/visualEngine3d.js';
import {furnishablePlanRooms} from '../src/ui/planRoomLookup.js';
import {pickDynamicBanner} from '../src/ui/views.js';
import {resolveInkPortraitFile} from '../src/ui/portraits.js';
import {EVENTS_LIVED_LIFE} from '../src/data/eventsLivedLife.js';
import {eventGatePasses,resolveEventCtx} from '../src/systems/eventEngine.js';
for(const totalRooms of [2,3,4]){const p=propertyFloorPlans('apartment','egy',85,totalRooms),rs=p.flatMap(f=>f.rooms);assert.equal(rs.filter(r=>['106','108','109'].includes(r.no)).length,totalRooms-1);assert.equal(Math.round(rs.reduce((n,r)=>n+r.m2,0)*10),850);const controls=furnishablePlanRooms('apartment','egy',totalRooms);assert.ok(!controls.some(r=>!rs.some(x=>x.no===r.no)));}
assert.ok(propertyFloorPlans('apartment','egy',85,2,{'109':'budget'})[0].rooms.some(r=>r.no==='109'));
const s=createNewLifeState({country:'egy',seed:55});s.city='Alexandria';s.player.age=25;s.year=2026;s.career.employed=false;s.career.job=null;s.housing.mode='rent';
// Country-level artwork replaced city routing by user request.
assert.equal(pickDynamicBanner(s,'life'),'egypt_apartment_evening_ink.jpg');s.city='Cairo';assert.ok(!pickDynamicBanner(s,'life').includes('alexandria'));assert.equal(pickDynamicBanner(s,'realestate'),'egypt_apartment_evening_ink.jpg');
assert.equal(resolveInkPortraitFile({age:75,nationality:'egy',gender:'f',appearance:{headwearMode:'none'}}),'p_egypt_elder_woman.jpg');
for(const e of EVENTS_LIVED_LIFE.filter(e=>e.id.startsWith('ev_egy_'))){assert.equal(eventGatePasses(e,s),true,e.id);const cash=s.money.cash;e.build(s,resolveEventCtx(s)).choices[0].effect(s);assert.equal(s.money.cash,cash);s.country='jpn';assert.equal(eventGatePasses(e,s),false);s.country='egy';}
console.log('Passed Egypt city art, portrait, property bedrooms, furnished-save preservation and 3 local event gates.');
for(const shape of ['studio','apartment','duplex','penthouse','townhouse','twin_house','villa','chalet','mansion']){
 const ps=propertyFloorPlans(shape,'egy',245,4),rooms=ps.flatMap(f=>f.rooms);
 assert.equal(Math.round(rooms.reduce((n,r)=>n+r.m2,0)*10),2450);
 for(const p of ps)for(const r of p.rooms){assert.ok(r.x>=p.shell.x);assert.ok(r.y>=p.shell.y);assert.ok(r.x+r.w<=p.shell.x+p.shell.w+0.1);assert.ok(r.y+r.h<=p.shell.y+p.shell.h+0.1)}
}
