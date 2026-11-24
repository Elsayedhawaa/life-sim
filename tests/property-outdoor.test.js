import assert from 'node:assert/strict';
import {propertyOutdoorFeatures,renderOutdoorPlanHtml} from '../src/ui/propertyOutdoor.js';
import {renderHome3dAndFloorplanHtml} from '../src/ui/visualEngine3d.js';
assert.deepEqual(propertyOutdoorFeatures({name:'Villa',shape:'mansion'}),{hasPool:false,hasGarden:false});
for(const home of [{name:'Corner Townhouse + Garden'},{hasGarden:true},{name:'Ground Garden Duplex'}])assert.equal(propertyOutdoorFeatures(home).hasGarden,true);
for(const home of [{name:'Twin House w/ Private Pool'},{hasPool:true},{upgrades:['pool']}]){assert.equal(propertyOutdoorFeatures(home).hasPool,true);assert.ok(renderOutdoorPlanHtml(home,'egy').includes('Private pool'));}
assert.equal(renderOutdoorPlanHtml({shape:'villa'},'egy'),'');
assert.ok(renderHome3dAndFloorplanHtml({id:'a',shape:'villa',name:'Garden Villa',upgrades:['pool'],country:'egy'}).includes('Pool '));
console.log('Passed actual garden/pool features, old-save names, upgrades and no automatic mansion pool.');

assert.ok(!/>Pool [0-9]+ m²</.test(renderHome3dAndFloorplanHtml({shape:'villa'})));
assert.ok(!renderHome3dAndFloorplanHtml({shape:'villa',hasGarden:true}).includes('>Private pool<'));
