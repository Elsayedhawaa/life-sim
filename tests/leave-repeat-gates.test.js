import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {requestLeave} from '../src/systems/careerActions.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.player.age=30;s.year=2026;s.month=5;s.career.employed=true;s.career.job={title:'Test',track:'software',employer:'Test',monthlyGross:3000,performance:80,monthsInRole:12};s.money.cash=100000;return s;}
const s=setup();assert.ok(requestLeave(s,'sick').ok);const vitals=JSON.stringify(s.player.vitals);assert.equal(requestLeave(s,'sick').ok,false);assert.equal(JSON.stringify(s.player.vitals),vitals);s.month++;assert.ok(requestLeave(s,'sick').ok);
const x=setup();x.marriage.pregnancy={motherId:'player',dueMonths:4};assert.ok(requestLeave(x,'parental').ok);let cash=x.money.cash;assert.equal(requestLeave(x,'parental').ok,false);assert.equal(x.money.cash,cash);x.month++;assert.equal(requestLeave(x,'parental').ok,false);assert.equal(x.money.cash,cash);console.log('Sick leave cannot be clicked repeatedly for health; parental leave cannot re-charge/reward in the same modeled year.');
