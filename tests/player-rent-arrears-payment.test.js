import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{payPlayerRentArrears,closePlayerLease}from'../src/systems/playerTenancy.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
function base(){const s=createNewLifeState({country:'usa',seed:5});ensureExtendedState(s);s.player.age=30;s.year=2026;s.month=3;s.career.employed=false;s.career.job=null;s.money.cash=1000;s.money.savings=0;s.housing.mode='rent';s.housing.currentHomeId='f';s.housing.monthlyRent=100;s.housing.playerLease={id:'l',status:'active',country:'usa',homeId:'f',deposit:1000,landlord:'L',rentArrears:500};return s;}
let s=base();s.money.missedRentMonths=2;assert.equal(payPlayerRentArrears(s).ok,true);assert.equal(s.money.cash,500);assert.equal(s.housing.playerLease.rentArrears,0);assert.equal(s.money.missedRentMonths,0);assert.equal(s.housing.playerLease.arrearsPayments[0].amount,500);assert.equal(payPlayerRentArrears(s).ok,false);assert.equal(s.money.cash,500);closePlayerLease(s);assert.equal(s.money.cash,1500);assert.equal(s.money.loans.length,0);
s=base();s.money.cash=499;assert.equal(payPlayerRentArrears(s).ok,false);assert.equal(s.money.cash,499);assert.equal(s.housing.playerLease.rentArrears,500);
s=base();s.money.cash=Infinity;assert.equal(payPlayerRentArrears(s).ok,false);
s=base();s.housing.playerLease.rentArrears=0;s.money.cash=101;s.money.missedRentMonths=2;settleHouseholdMonth(s);assert.ok(s.money.cash<0,'Other living bills cause cash deficit');assert.equal(s.housing.playerLease.rentHistory[0].unpaid,0);assert.equal(s.housing.mode,'rent');assert.equal(s.money.missedRentMonths,0);assert.ok(s.housing.playerLease);
console.log('Actual arrears cash payment with evidence, no duplicate payment/deposit deduction, insufficient funds and unrelated cash deficit cannot evict a paid explicit lease pass');
