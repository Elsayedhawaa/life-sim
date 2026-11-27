import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{findVentureRow,evaluateBusinessLaunch,BUSINESS_HOME_REV_MULT,VENTURE_LABOUR_SHARE,VENTURE_MARGIN_BEFORE_OWNER}from'../src/systems/businessEngine.js';
function ev(country,id){const s=createNewLifeState({country,seed:5});ensureExtendedState(s);s.player.age=32;s.year=2026;s.money.cash=1e12;return evaluateBusinessLaunch(s,findVentureRow(s,id),'full_time');}
/* Published labour shares: cafe 28-35%, salon 40-55%, gym payroll median 38.4%. The starter wage bill over takings must sit in each range in every country. */
const ranges={cafe:[.28,.35],restaurant:[.28,.36],salon:[.40,.55],gym:[.34,.43]};
for(const c of['usa','gbr','egy','bra','ind','deu','jpn'])for(const[id,[lo,hi]]of Object.entries(ranges)){const e=ev(c,id);const share=e.wageEstimateLocal/(e.revLocal*BUSINESS_HOME_REV_MULT);assert.ok(share>=lo&&share<=hi,c+' '+id+' labour share '+share.toFixed(3));assert.ok(e.costLocal+e.wageEstimateLocal<e.revLocal*BUSINESS_HOME_REV_MULT,c+' '+id+' a home-start venture covers its costs at expected takings');}
/* US takings now sit inside published monthly ranges (cafe 18-46k with a three-person paid team, gym 15-50k) instead of 99k and 153k */
assert.ok(ev('usa','cafe').revLocal<70000);assert.ok(ev('usa','gym').revLocal<=50000&&ev('usa','gym').revLocal>=15000);
assert.equal(VENTURE_MARGIN_BEFORE_OWNER,.1);assert.ok(VENTURE_LABOUR_SHARE.salon>VENTURE_LABOUR_SHARE.cafe);
console.log('ok v221 venture labour share');
