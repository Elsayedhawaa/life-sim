import {computeNetWorthLocal} from '../src/core/schema.js';
import {convertFinancesOnCountryMove} from '../src/systems/economyEngine.js';
import {convertCurrency} from '../src/data/economy.js';
import {settleHouseholdMonth} from '../src/systems/economyEngine.js';
import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState} from '../src/core/schema.js';
import {purchaseShopCatalogItem,payCreditCard,resellInventoryItem} from '../src/systems/completeLifeSystems.js';
const s=createNewLifeState({country:'gbr',seed:77});ensureExtendedState(s);s.player.age=30;s.year=2026;s.money.cash=1e8;
s.creditCards=[{id:'test',name:'Test',limit:10000,balance:3,cashbackRate:.01}];let cash=s.money.cash;assert.ok(payCreditCard(s,'test',false).ok);assert.equal(cash-s.money.cash,3);assert.equal(s.creditCards[0].balance,0);
let count=s.inventory.length;cash=s.money.cash;assert.equal(purchaseShopCatalogItem(s,'sh_10','bogus').ok,false);assert.equal(s.money.cash,cash);assert.equal(s.inventory.length,count);
for(let i=0;i<65;i++)assert.ok(purchaseShopCatalogItem(s,'sh_10','cash').ok);assert.equal(s.inventory.length,count+65);const id=s.inventory[0].id;cash=s.money.cash;assert.ok(resellInventoryItem(s,id).ok);assert.ok(s.money.cash>cash);cash=s.money.cash;assert.equal(resellInventoryItem(s,id).ok,false);assert.equal(s.money.cash,cash);
s.player.age=15;count=s.inventory.length;cash=s.money.cash;assert.equal(purchaseShopCatalogItem(s,'sh_10','card').ok,false);assert.equal(purchaseShopCatalogItem(s,'sh_10','bnpl').ok,false);assert.equal(s.inventory.length,count);assert.equal(s.money.cash,cash);
console.log('Passed small-balance minimum payment, unknown payment/no-free-item,65item ownership, one-time resale and minor credit gates.');

const a=structuredClone(s),b=structuredClone(s);a.player.age=b.player.age=30;a.creditCards[0].balance=3;b.creditCards[0].balance=0;settleHouseholdMonth(a);settleHouseholdMonth(b);assert.equal(b.money.cash-a.money.cash,3);assert.equal(a.creditCards[0].balance,0);console.log('Automatic monthly card settlement also caps payment at actual remaining balance.');

let x=structuredClone(s),y=structuredClone(s);x.player.age=y.player.age=30;x.bnplPlans=[{id:'small',label:'small',monthlyPay:10,monthsLeft:1,balanceRemaining:3}];y.bnplPlans=[];settleHouseholdMonth(x);settleHouseholdMonth(y);assert.equal(y.money.cash-x.money.cash,3);assert.equal(x.bnplPlans.length,0);
x=structuredClone(s);x.player.age=30;x.bnplPlans=[{id:'fees',label:'fees',monthlyPay:10,monthsLeft:1,balanceRemaining:25}];settleHouseholdMonth(x);assert.equal(x.bnplPlans[0].balanceRemaining,15);settleHouseholdMonth(x);assert.equal(x.bnplPlans[0].balanceRemaining,5);settleHouseholdMonth(x);assert.equal(x.bnplPlans.length,0);
x=structuredClone(s);x.player.age=30;x.bnplPlans=[{id:'fx',label:'fx',monthlyPay:100,monthsLeft:3,balanceRemaining:300}];convertFinancesOnCountryMove(x,'gbr','egy');assert.equal(x.bnplPlans[0].balanceRemaining,Math.round(convertCurrency(300,'gbr','egy',x.year)));console.log('BNPL final split is capped, unpaid fees persist, and remaining debt converts with monthly payment on relocation.');

x=structuredClone(s);x.player.age=30;x.money.loans=[{id:'residue',label:'residue',balance:25,monthlyPayment:10,remainingMonths:1,annualRate:0,flatMarkup:true}];settleHouseholdMonth(x);assert.equal(x.money.loans[0].balance,15);settleHouseholdMonth(x);assert.equal(x.money.loans[0].balance,5);settleHouseholdMonth(x);assert.equal(x.money.loans.length,0);console.log('Loan maturity does not erase unpaid residual debt; final payment clears the actual balance.');

x=structuredClone(s);x.bnplPlans=[];const worth=computeNetWorthLocal(x);x.bnplPlans=[{balanceRemaining:300,monthlyPay:100,monthsLeft:3}];assert.equal(computeNetWorthLocal(x),worth-300);console.log('Net worth subtracts the actual outstanding BNPL debt.');

const {payExtraOnBusinessLoan}=await import('../src/systems/businessLoans.js');
x=structuredClone(s);x.player.age=30;const biz={id:'b',name:'Test',loanId:'bloan'};x.money.loans=[{id:'bloan',balance:25,monthlyPayment:10}];cash=x.money.cash;assert.ok(payExtraOnBusinessLoan(x,biz,20).ok);assert.equal(cash-x.money.cash,20);assert.equal(x.money.loans[0].balance,5);assert.ok(payExtraOnBusinessLoan(x,biz,5).cleared);assert.equal(x.money.loans.length,0);
console.log('Extra business-loan payments preserve a5unit residual until paid.');

x=structuredClone(s);x.housing.properties=[];const baseWorth=computeNetWorthLocal(x);x.housing.properties=[{valueLocal:100,installmentRemaining:150}];assert.equal(computeNetWorthLocal(x),baseWorth-50);console.log('Underwater property equity remains negative in net worth instead of hiding the debt.');
