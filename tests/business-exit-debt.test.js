import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {sellBusiness,closeBusiness} from '../src/systems/businessEngine.js';
import {killBusiness} from '../src/systems/businessGrowth.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.money.cash=100000;const b={id:'debt-test',name:'Test',country:'gbr',typeId:'cafe',capitalInvested:10000,monthlyRev:1000,monthlyCost:500,staff:[],equityOwned:100,debtLocal:20000,lastPL:{net:0}};s.career.businesses=[b];s.career.business=b;return{s,b};}
for(const mode of ['sale','close','death']){const{s,b}=setup();const before=s.money.cash;const out=mode==='sale'?sellBusiness(s,b):mode==='close'?closeBusiness(s,b,'test'):killBusiness(s,b,'test');assert.ok(out.ok);assert.equal(s.money.cash,before);assert.equal(s.money.loans.filter(l=>l.purpose==='business_exit').reduce((a,l)=>a+l.balance,0),mode==='sale'?13000:15000);assert.equal(b.debtLocal,0);if(mode==='sale'){assert.equal(sellBusiness(s,b).ok,false);assert.equal(sellBusiness(s,{...b,id:'fake'}).ok,false);}}
console.log('Business sale, closure and distress pay debt before owner; shortfall persists, sale replay refuses.');
