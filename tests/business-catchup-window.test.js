import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {settleHouseholdMonth} from '../src/systems/economyEngine.js';
import {buildBankCallScene} from '../src/systems/businessFate.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:177});ensureExtendedState(s);s.year=2026;s.month=1;s.player.age=40;s.money.cash=0;s.money.savings=0;s.money.parentalAllowanceActive=false;const b={id:'catchup',name:'Catchup Cafe',typeId:'cafe',country:'gbr',capitalInvested:100000000,monthlyRev:1,monthlyCost:100000,staff:[],equityOwned:100,debtLocal:500,misses:2,history:[]};s.career.businesses=[b];s.career.business=b;return{s,b};}
const {s,b}=setup();buildBankCallScene(s,b).choices[1].effect(s);assert.equal(b.fate.bankCatchUpUntil,2026*12+4);const saved=JSON.parse(JSON.stringify(s)),bb=saved.career.businesses[0];saved.month=4;settleHouseholdMonth(saved);assert(!bb.dead);assert(bb.misses>=3);assert(bb.debtLocal>500);saved.month=5;settleHouseholdMonth(saved);assert(bb.dead||!saved.career.businesses.some(x=>x.id===bb.id));
const no=setup();settleHouseholdMonth(no.s);assert(no.b.dead||!no.s.career.businesses.some(x=>x.id===no.b.id));console.log('Actual unpaid-bill settlement honors catch-up expiry after save/reload, accrues debt, closes afterward, ordinary closure unchanged');
