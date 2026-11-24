import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {acceptTradeSale,managementBuyout,ipoBusiness} from '../src/systems/businessExits.js';
function setup(){const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.year=2035;s.month=6;s.money.cash=1000000;const b={id:'t',name:'Test',country:'gbr',typeId:'cafe',capitalInvested:10000,monthlyRev:500000,monthlyCost:500,staff:[],equityOwned:100,debtLocal:20000,lastPL:{net:0},history:[],foundedYear:2026,foundedMonth:1};s.career.businesses=[b];s.career.business=b;return{s,b};}
let{s,b}=setup();let r=acceptTradeSale(s,b,7000);assert.ok(r.ok);assert.equal(r.amount,0);assert.equal(s.money.loans[0].balance,13000);assert.equal(acceptTradeSale(s,b,7000).ok,false);
({s,b}=setup());b.manager={name:'Manager',wage:10000,hiredYear:2026,hiredMonth:1};r=managementBuyout(s,b);assert.ok(r.ok);assert.equal(r.proceeds,0);assert.ok(s.money.loans[0].balance>0);assert.equal(managementBuyout(s,b).ok,false);
({s,b}=setup());r=ipoBusiness(s,b,{force:'success'});assert.ok(r.success);assert.equal(b.equityOwned,75);const cash=s.money.cash;assert.equal(ipoBusiness(s,b,{force:'success'}).ok,false);assert.equal(s.money.cash,cash);
console.log('Alternate exits retain debt; IPO reduces ownership and cannot repeat its payout.');

({s,b}=setup());b.equityOwned=80;r=ipoBusiness(s,b,{force:"success"});assert.equal(b.equityOwned,55);assert.ok(r.payout>0);

({s,b}=setup());s.money.cash=200;const before=s.money.cash;r=ipoBusiness(s,b,{force:"success"});assert.equal(r.ok,false);assert.equal(s.money.cash,before);

({s,b}=setup());s.money.cash=700;r=ipoBusiness(s,b,{force:"success"});assert.equal(r.ok,false);assert.equal(s.money.cash,700);
