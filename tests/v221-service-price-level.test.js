import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{getHaircut,HAIRCUT_STYLES}from'../src/systems/completeLifeSystems.js';
import{convertCurrency,eraUsdCost}from'../src/data/economy.js';
/* A haircut is a local service: its price follows the country's cost of living, not the exchange rate alone (US prices unchanged). */
function paid(c){const s=createNewLifeState({country:c,seed:5});ensureExtendedState(s);s.player.age=30;s.year=2026;s.money.cash=1e7;const before=s.money.cash;const r=getHaircut(s,'executive');assert.ok(r.ok,r.msg);return before-s.money.cash;}
const style=HAIRCUT_STYLES.find(x=>x.id==='executive');
assert.equal(paid('usa'),style.priceUsd,'US price unchanged');
for(const c of['egy','ind']){const fee=paid(c);assert.equal(fee,Math.round(eraUsdCost(style.priceUsd,c,2026)));assert.ok(fee<convertCurrency(style.priceUsd,'usa',c,2026)*.35,c+' haircut is priced for local wages, not the raw exchange rate: '+fee);}
console.log('ok v221 service price level');
