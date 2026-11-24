import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {purchaseLandPlot,startCustomConstructionOnLand,tickMegaSystemsMonthly} from '../src/systems/completeLifeSystems.js';
import {propertyAreas} from '../src/data/propertyAreas.js';
const s=createNewLifeState({country:'egy',seed:55});ensureExtendedState(s);s.year=2026;s.player.age=30;s.money.cash=1e12;assert.ok(purchaseLandPlot(s,'land_nc_5th').ok);const land=s.housing.lands[0],plot=land.areaM2;assert.ok(startCustomConstructionOnLand(s,land.id).ok);for(let i=0;i<30&&s.housing.lands.length;i++)tickMegaSystemsMonthly(s);const p=s.housing.properties[0];assert.ok(p);const a=propertyAreas(p);assert.equal(a.plotM2,plot);assert.equal(a.footprintM2+a.gardenM2,plot);assert.ok(a.gardenM2>0);assert.ok(p.outdoorAnnualNative>0);assert.equal(s.housing.lands.length,0);console.log('Custom construction conserves purchased plot into building footprint and garden with upkeep.');
