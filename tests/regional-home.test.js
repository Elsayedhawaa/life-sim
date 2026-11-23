import assert from 'node:assert/strict';
import {propertyFloorPlans,renderHome3dAndFloorplanHtml} from '../src/ui/visualEngine3d.js';
import {furnishablePlanRooms,roomInfoMessage} from '../src/ui/planRoomLookup.js';
for(const shape of ['studio','apartment','duplex','penthouse','townhouse','twin_house','villa','chalet','mansion','commercial'])for(const country of ['jpn','egy','usa','sau']){
 const plans=propertyFloorPlans(shape,country,137.5),rooms=plans.flatMap(p=>p.rooms);
 assert.equal(Math.round(rooms.reduce((n,r)=>n+r.m2,0)*10),1375);
 assert.equal(new Set(rooms.map(r=>r.no)).size,rooms.length);
 if(country==='jpn')assert.ok(!rooms.some(r=>/majlis|royal|grease|hammam|diwan/i.test(r.name)));
 const lookup=furnishablePlanRooms(shape,country);for(const r of lookup)assert.equal(r.name.toLowerCase(),rooms.find(x=>x.no===r.no).name.toLowerCase());
 const html=renderHome3dAndFloorplanHtml({id:'chosen-home',shape,country,areaM2:137.5});assert.ok(!html.includes('undefined'));assert.ok(!html.includes('NaN'));
 for(const floor of plans)for(const r of floor.rooms){assert.ok(r.x>=floor.shell.x);assert.ok(r.y>=floor.shell.y);assert.ok(r.x+r.w<=floor.shell.x+floor.shell.w+1);assert.ok(r.y+r.h<=floor.shell.y+floor.shell.h+1)}
}
for(const shape of ['apartment','villa'])assert.notEqual(JSON.stringify(propertyFloorPlans(shape,'jpn').map(f=>f.rooms.map(r=>[r.x,r.y,r.w,r.h]))),JSON.stringify(propertyFloorPlans(shape,'egy').map(f=>f.rooms.map(r=>[r.x,r.y,r.w,r.h]))));
assert.ok(roomInfoMessage('living','105').includes('can be furnished'));
console.log('Passed country names, Japan geometry, stable room IDs and deed-area allocation across 40 home/country pairs.');
