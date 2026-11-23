import assert from 'node:assert/strict';
import {createNewLifeState} from '../src/core/schema.js';
import {pickDynamicBanner} from '../src/ui/views.js';
import {resolveInkPortraitFile} from '../src/ui/portraits.js';
const s=createNewLifeState({country:'jpn',seed:55});
for(let turn=0;turn<48;turn++){s.turn=turn;s.month=turn%12+1;assert.equal(pickDynamicBanner(s,'life'),'japan_neighborhood_ink.jpg');assert.equal(pickDynamicBanner(s,'realestate'),'tokyo_apartment_evening_ink.jpg');}
assert.equal(resolveInkPortraitFile({age:78,gender:'m',nationality:'jpn',appearance:{}}),'p_east_asian_elder.jpg');assert.notEqual(resolveInkPortraitFile({age:78,gender:'m',nationality:'egy',appearance:{}}),'p_east_asian_elder.jpg');
console.log('Passed regional scene and older portrait routing checks.');
