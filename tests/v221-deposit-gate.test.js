import assert from'node:assert/strict';
import fs from'node:fs';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{halfDepositAmount}from'../src/systems/economyEngine.js';
/* The Banks deposit button used a raw 100 in local units, a different amount in every country. Now any cash that halves to at least 1 unit works. */
const S=createNewLifeState({country:'jpn',seed:3,birthYear:1998});ensureExtendedState(S);
S.money.cash=150;assert.equal(halfDepositAmount(S),75,'150 yen: 75 can be deposited (old gate refused at 100 or less)');
S.money.cash=1;assert.equal(halfDepositAmount(S),0,'1 unit halves to nothing');
S.money.cash=-50;assert.equal(halfDepositAmount(S),0);
const v=fs.readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');
assert.ok(!/S\.money\.cash\s*(>|<=)\s*100\b/.test(v),'no raw 100 gate left in the Banks view');
console.log('ok v221 deposit gate');
