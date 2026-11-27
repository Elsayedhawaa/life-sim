import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{introducePartnerProspect,proposeEngagement,celebrateWedding}from'../src/systems/marriageFamilyEngine.js';
import{settleHouseholdMonth}from'../src/systems/economyEngine.js';
/* Played report: no salary line after the wedding. Engine check: marrying does not touch the job or the pay, and the contract carries the wedding year. */
const S=createNewLifeState({country:'egy',gender:'m',seed:9,birthYear:1998});ensureExtendedState(S);
S.year=2024;S.month=1;S.player.age=26;S.activeScene=null;S.sceneQueue=[];S.turn=300;S.money.cash=2e6;
S.career.employed=true;S.career.job={title:'Junior Psychologist',employer:'Cleopatra Hospital',employmentFraction:1,monthlyGross:20000,workMode:'normal',performance:70,startYear:2022};
S.housing.mode='rent';S.housing.monthlyRent=4000;S.legal.military.status='exempt';
assert.ok(introducePartnerProspect(S,'family_intro').ok);assert.ok(proposeEngagement(S,'modest',true).ok);assert.ok(celebrateWedding(S,null).ok);
S.month++;S.turn++;S.ledger=[];settleHouseholdMonth(S);
assert.ok(S.ledger.some(e=>/^Salary — Cleopatra Hospital/.test(e.label)),'salary still paid after the wedding');
assert.equal(S.marriage.contracts.at(-1).year,2024);
console.log('ok v221 marriage keeps salary');
