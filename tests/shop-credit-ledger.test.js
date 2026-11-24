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
