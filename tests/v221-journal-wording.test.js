import assert from 'node:assert/strict';
import {driftWarnText,driftNoticeText,reconnectText} from '../src/systems/socialEnergy.js';
const seen={w:new Set(),n:new Set(),r:new Set()};
for(let y=1990;y<2030;y++)for(const id of ['p1','p2','p3','p4']){
 const S={year:y},p={id,fullName:'Ann Lee',firstName:'Ann'};
 const w=driftWarnText(S,p,13);assert.match(w,/drifting apart/);assert.match(w,/Ann/);seen.w.add(w);
 const n=driftNoticeText(S,p,30);assert.match(n,/2 years/);assert.match(n,/reconnect/);seen.n.add(n);
 const r=reconnectText(S,p,'about 2 years');assert.match(r,/alive again/);seen.r.add(r);
}
assert.ok(seen.w.size>=3&&seen.n.size>=2&&seen.r.size>=3,'variants should all be used');
console.log('ok v221 journal wording');
