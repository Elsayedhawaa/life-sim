import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {rentalMoveInQuote,rentHousingUnit} from '../src/systems/economyEngine.js';
import {getHousingFor} from '../src/data/institutions.js';
import {COUNTRY_IDS} from '../src/data/countries.js';
let checks=0;
for(const country of COUNTRY_IDS){const s=createNewLifeState({country,seed:55});ensureExtendedState(s);s.year=2026;s.player.age=25;const h=getHousingFor(country,2026)[0];if(!h)continue;const q=rentalMoveInQuote(s,h);s.money.cash=q.cashRequired-1;assert.equal(rentHousingUnit(s,h.id).ok,false);assert.equal(s.money.cash,q.cashRequired-1);s.money.cash=q.cashRequired;assert.equal(rentHousingUnit(s,h.id).ok,true);assert.equal(s.money.cash,q.cashRequired-q.moveInFee);assert.equal(s.housing.monthlyRent,q.monthlyRent);assert.ok(s.ledger[0].label?.includes('Non-refundable')||JSON.stringify(s.ledger[0]).includes('Non-refundable'));checks+=6;}
console.log(`Passed ${checks} rental quote/charge checks across ${COUNTRY_IDS.length} countries.`);
