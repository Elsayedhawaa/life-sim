import assert from 'node:assert/strict';
import {createNewLifeState} from '../src/core/schema.js';
import {buyCompoundOrDistrictUnit,installPropertyUpgrade,expandPropertyFootprint} from '../src/systems/completeLifeSystems.js';
import {propertyAreas} from '../src/data/propertyAreas.js';
const s=createNewLifeState({country:'nld',seed:77});s.year=2026;s.player.age=30;s.money.cash=1e12;
let r=buyCompoundOrDistrictUnit(s,{country:'nld',unitId:'nld_garden_villa'});assert.ok(r.ok);let p=r.prop,a=propertyAreas(p),upkeep=p.outdoorAnnualNative;assert.ok(installPropertyUpgrade(s,p.id,'pool').ok);assert.equal(p.poolM2,24);assert.equal(p.gardenM2,a.gardenM2-24);assert.equal(propertyAreas(p).plotM2,a.plotM2);assert.ok(p.outdoorAnnualNative>upkeep);let cash=s.money.cash;assert.equal(installPropertyUpgrade(s,p.id,'pool').ok,false);assert.equal(installPropertyUpgrade(s,p.id,'bogus').ok,false);assert.equal(s.money.cash,cash);
a=propertyAreas(p);assert.ok(expandPropertyFootprint(s,p.id).ok);assert.equal(propertyAreas(p).indoorM2,a.indoorM2+45);assert.equal(p.gardenM2,a.gardenM2-45);assert.equal(p.footprintM2,a.footprintM2+45);assert.equal(propertyAreas(p).plotM2,a.plotM2);assert.ok(p.outdoorAnnualNative>0);cash=s.money.cash;assert.equal(expandPropertyFootprint(s,p.id).ok,false);assert.equal(s.money.cash,cash);
for(const id of ['nld_balcony_flat','nld_studio','nld_penthouse']){r=buyCompoundOrDistrictUnit(s,{country:'nld',unitId:id});assert.ok(r.ok);cash=s.money.cash;assert.equal(installPropertyUpgrade(s,r.prop.id,'pool').ok,false);assert.equal(expandPropertyFootprint(s,r.prop.id).ok,false);assert.equal(s.money.cash,cash);}
r=buyCompoundOrDistrictUnit(s,{country:'nld',unitId:'nld_pool_villa'});cash=s.money.cash;assert.equal(installPropertyUpgrade(s,r.prop.id,'pool').ok,false);assert.equal(s.money.cash,cash);
console.log('Passed pool/wing area conservation, upkeep increase, apartment refusal, existing pool and duplicate/no-charge guards.');
