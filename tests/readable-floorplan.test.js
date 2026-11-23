import assert from 'node:assert/strict';
import {renderReadableFloorplanHtml,renderHome3dAndFloorplanHtml} from '../src/ui/visualEngine3d.js';
for(const shape of ['studio','apartment','duplex','villa','mansion','townhouse','chalet','commercial','land']){
 for(let floor=0;floor<3;floor++){
 const h=renderReadableFloorplanHtml(shape,{'101':true},floor,'owned-home');
 assert.ok(!h.includes('undefined'));assert.ok(h.includes('<svg'));if(shape!=='land'){assert.ok(h.includes('Room numbers match'));assert.ok(h.includes('data-action="room-info"'));assert.ok(!h.includes('data-action="furnish-room"'));}
 }
 const h=renderHome3dAndFloorplanHtml({id:'owned-home',shape,areaM2:240,furnishedRooms:{}});assert.ok(h.includes('Detailed architectural sheets'));
}
console.log('Passed readable floor plans: 9 shapes, floor bounds and non-spending room actions.');
