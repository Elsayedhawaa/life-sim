import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LOCAL_PROPERTY_STYLES} from '../src/data/localPropertyStyles.js';
import {getPropertyUnits} from '../src/data/megaRealEstate.js';
import {propertyFloorPlans,renderHome3dAndFloorplanHtml} from '../src/ui/visualEngine3d.js';
import {furnishablePlanRooms} from '../src/ui/planRoomLookup.js';
import {createNewLifeState} from '../src/core/schema.js';
import {buyCompoundOrDistrictUnit} from '../src/systems/completeLifeSystems.js';
for(const style of LOCAL_PROPERTY_STYLES){
 assert.ok(fs.existsSync('assets/homes/'+style.art),'Missing art '+style.id);
 assert.ok(getPropertyUnits(style.country).some(x=>x.id===style.id));assert.ok(!getPropertyUnits(style.country==='usa'?'egy':'usa').some(x=>x.id===style.id));
 const plans=propertyFloorPlans(style.shape,style.country,style.area,style.rooms);const rooms=plans.flatMap(f=>f.rooms);
 assert.equal(Math.round(rooms.reduce((n,r)=>n+r.m2,0)*10),style.area*10);
 for(const f of plans)for(const r of f.rooms){assert.ok(r.x>=f.shell.x&&r.y>=f.shell.y&&r.x+r.w<=f.shell.x+f.shell.w&&r.y+r.h<=f.shell.y+f.shell.h);}
 const ids=rooms.map(r=>r.no);assert.equal(new Set(ids).size,ids.length);
 for(const r of furnishablePlanRooms(style.shape,style.country,style.rooms))assert.ok(ids.includes(r.no));
 const h=renderHome3dAndFloorplanHtml({...style,styleId:style.id,areaM2:style.area});assert.ok(h.includes(style.art));assert.ok(!h.includes('undefined'));assert.equal(h.includes('>Private pool<'),style.hasPool===true);if(style.shape.startsWith('courtyard'))assert.ok(!h.includes('>Garden<'));
 const s=createNewLifeState({country:style.country,seed:23});s.player.age=30;s.year=2026;s.money.cash=1e12;const res=buyCompoundOrDistrictUnit(s,{country:style.country,unitId:style.id});assert.ok(res.ok,res.msg);assert.equal(res.prop.styleId,style.id);assert.equal(res.prop.shape,style.shape);assert.equal(res.prop.hasPool,style.hasPool===true);assert.equal(res.prop.hasGarden,style.hasGarden===true||/garden/i.test(style.name));
}
assert.equal(propertyFloorPlans('courtyard_single','egy').length,1);assert.equal(propertyFloorPlans('courtyard_double','egy').length,2);assert.equal(propertyFloorPlans('modern_villa','egy').length,2);
console.log('Passed local property styles: separate art, country scope, purchase persistence, area and room identity, single/two-storey plans.');
