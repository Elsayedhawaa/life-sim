import assert from 'node:assert/strict';
import {LOCAL_PROPERTY_STYLES} from '../src/data/localPropertyStyles.js';
import {propertyFloorPlans,renderHome3dAndFloorplanHtml} from '../src/ui/visualEngine3d.js';
import {planCirculation,sharedPlanEdge} from '../src/ui/planCirculation.js';
import {renderHomeTypeArt} from '../src/ui/homeTypeArt.js';
let floors=0;
for(const style of LOCAL_PROPERTY_STYLES)for(const [idx,f] of propertyFloorPlans(style.shape,style.country,style.area,style.rooms).entries()){
 const p=planCirculation(f,idx);assert.ok(p.connected,`${style.id}/${idx}: ${p.unreachable}`);for(const d of p.doors)assert.ok(sharedPlanEdge(p.nodes[d.a],p.nodes[d.b]));const art=renderHomeTypeArt(style.shape,style.country,84,style.id);assert.ok(art.includes(style.art));floors++;
}
console.log(`Passed connected shared-wall door graphs and per-style icon art for${LOCAL_PROPERTY_STYLES.length}styles/${floors}floors.`);
