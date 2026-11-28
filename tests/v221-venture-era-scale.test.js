import assert from'node:assert/strict';
import{createNewLifeState,ensureExtendedState}from'../src/core/schema.js';
import{eraSalary}from'../src/data/economy.js';
import{getCountry}from'../src/data/countries.js';
import*as B from'../src/systems/businessEngine.js';
// GAME DESIGN: venture takings and capital follow local pay across eras, not the exchange rate. Takings over Egypt's mid salary stay in a narrow band from 1990 to 2040 (before, it swung about 5x).
const r=[];
for(const y of[1990,1995,2005,2010,2016,2025,2033,2040]){
  const S=createNewLifeState({seed:3,country:'egy',birthYear:y-30,familyTier:'wealthy',gender:'m'});ensureExtendedState(S);S.year=y;
  const bp=B.findVentureRow(S,'accounting_firm');const e=B.evaluateBusinessLaunch(S,bp);
  r.push(e.capitalLocal/eraSalary(getCountry('egy').annualSalaryTiers2026.mid/12,'egy',y));
}
const mx=Math.max(...r),mn=Math.min(...r);assert.ok(mx/mn<1.35,'capital follows pay: '+r.map(x=>x.toFixed(1)).join(','));
assert.equal(B.ventureEraFactor(2025),1);
console.log('ok v221 venture era scale');
