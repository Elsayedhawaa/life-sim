// Every country has at least 24 first names per gender, so a life of ~20 living relatives and contacts rarely repeats one.
import assert from 'node:assert/strict';
const {NAME_POOLS}=await import('../src/data/names.js');
for(const [c,p] of Object.entries(NAME_POOLS))for(const g of ['male','female']){
  assert.ok(p[g].length>=24,c+' '+g+' has '+p[g].length);
  assert.equal(new Set(p[g]).size,p[g].length,c+' '+g+' has duplicates');
}
console.log('PASS v221-name-pools');
