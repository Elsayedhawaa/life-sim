import assert from 'node:assert/strict';
import {renderHome3dAndFloorplanHtml} from '../src/ui/visualEngine3d.js';
import {renderHomeTypeArt} from '../src/ui/homeTypeArt.js';
const h=renderHome3dAndFloorplanHtml({shape:'villa',country:'egy',hasPool:true,hasGarden:true,areaM2:360});
assert.equal((h.match(/>Private pool(?: [0-9]+ m²)?</g)||[]).length,1);assert.ok(h.includes('Illustrative furnished layout'));assert.ok(!h.includes('class="outdoor-plan"'));assert.ok(h.includes('assets/homes/egypt-villa.jpg'));
const t=renderHome3dAndFloorplanHtml({shape:'townhouse',hasGarden:true});assert.ok(t.includes('scale(1 -1)'));
const icons=['studio','apartment','duplex','penthouse','townhouse','twin_house','villa','chalet','mansion'].map(x=>renderHomeTypeArt(x,'egy'));assert.equal(new Set(icons).size,9);
for(const shape of ['studio','apartment','duplex','penthouse','townhouse','twin_house','villa','chalet','mansion']){const p=renderHome3dAndFloorplanHtml({shape,country:'egy'});assert.ok(!p.includes('undefined'));assert.ok(!/>Private pool(?: [0-9]+ m²)?</.test(p));}
console.log('Passed illustrated plans, integrated feature-only grounds, front/rear placement, and 9 distinct type artworks.');
