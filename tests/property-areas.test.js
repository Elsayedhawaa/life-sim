import assert from 'node:assert/strict';
import {propertyAreas,pricedPropertyArea,outdoorAnnualBudget} from '../src/data/propertyAreas.js';
import {LOCAL_PROPERTY_STYLES} from '../src/data/localPropertyStyles.js';
import {createNewLifeState} from '../src/core/schema.js';
import {buyCompoundOrDistrictUnit} from '../src/systems/completeLifeSystems.js';
import {settleHouseholdMonth} from '../src/systems/economyEngine.js';
for(const st of LOCAL_PROPERTY_STYLES){let a=propertyAreas(st);assert.equal(a.indoorM2,st.area);assert.equal(a.outdoorM2,a.gardenM2+a.poolM2+a.terraceM2+a.courtyardM2+a.parkingM2);assert.ok(a.poolM2<=40);if(a.plotM2)assert.ok(a.plotM2>=a.footprintM2+a.gardenM2+a.poolM2+a.courtyardM2+a.parkingM2);assert.ok(pricedPropertyArea(st)>=st.area);if(a.outdoorM2)assert.ok(outdoorAnnualBudget(st,1000)>0);
 const s=createNewLifeState({country:st.country,seed:77});s.year=2026;s.player.age=30;s.money.cash=1e12;const r=buyCompoundOrDistrictUnit(s,{country:st.country,unitId:st.id});assert.ok(r.ok);assert.equal(r.prop.gardenM2,a.gardenM2);assert.equal(r.prop.poolM2,a.poolM2);assert.equal(r.prop.plotM2,a.plotM2);const clone=structuredClone(s);clone.housing.properties[0].outdoorAnnualNative=0;settleHouseholdMonth(s);settleHouseholdMonth(clone);assert.equal(Math.round(clone.money.cash-s.money.cash),Math.round(r.prop.outdoorAnnualNative/12));}
console.log('Passed222outdoor area/purchase/price-weight/upkeep-ledger checks. Areas are fictional game deed allocations.');
