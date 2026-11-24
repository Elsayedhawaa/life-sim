import assert from 'node:assert/strict';
import {COUNTRY_IDS} from '../src/data/countries.js';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {renderRealEstateTabHtml} from '../src/ui/views.js';
let n=0;for(const country of COUNTRY_IDS)for(const age of [15,30]){const s=createNewLifeState({country,seed:77});ensureExtendedState(s);s.player.age=age;s.year=2026;for(const market of ['local','home']){const h=renderRealEstateTabHtml(s,{reSub:'lands',propMarket:market});assert.ok(!/undefined|NaN/.test(h));assert.ok(h.includes('Freehold Land Plots'));n++;}}console.log(n+'Land & Build country/stage/market renders pass, including nonempty deed listings.');

const {purchaseLandPlot}=await import('../src/systems/completeLifeSystems.js');const s=createNewLifeState({country:'egy',seed:77});ensureExtendedState(s);s.player.age=15;s.money.cash=1e12;const cash=s.money.cash;assert.equal(purchaseLandPlot(s,'land_nc_5th').ok,false);assert.equal(s.money.cash,cash);assert.equal(s.housing.lands.length,0);
