import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState,computeNetWorthLocal} from '../src/core/schema.js';
import {sellBusiness,closeBusiness,businessValuation} from '../src/systems/businessEngine.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.money.cash=100000;const b={id:'cash-test',name:'Test',country:'gbr',typeId:'cafe',capitalInvested:10000,monthlyRev:1000,monthlyCost:500,staff:[],equityOwned:50,debtLocal:1000,retainedCash:4000,lastPL:{net:0},history:[]};s.career.businesses=[b];s.career.business=b;return{s,b};}
let{s,b}=setup();assert.equal(businessValuation(b),5500);const base=structuredClone(s);base.career.businesses=[];base.career.business=null;assert.equal(computeNetWorthLocal(s)-computeNetWorthLocal(base),5000);const worth=computeNetWorthLocal(s);sellBusiness(s,b);assert.equal(s.money.cash,105000);assert.equal(computeNetWorthLocal(s),worth);assert.equal(b.retainedCash,0);
({s,b}=setup());closeBusiness(s,b,'test');assert.equal(s.money.cash,104000);assert.equal(b.retainedCash,0);
console.log('Owned venture net worth includes shared valuation, retained cash and unpaid bills; exit preserves retained cash once.');
