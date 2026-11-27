import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src=readFileSync(new URL('../src/data/eventsMoneyHealthCareer.js',import.meta.url),'utf8');
function body(id){const i=src.indexOf("id: '"+id+"'");assert.ok(i>=0,id);return src.slice(i,i+2600);}
/* Income-like amounts must follow the country's wage scale, not the goods price scale */
for(const id of ['ev_money_investment_tip','ev_money_bank_certificate','ev_money_freelance_gig','ev_money_inheritance_small']){
  const b=body(id);assert.ok(/usdMonthlyPayToLocal\(S\.country/.test(b),id+' uses the wage scale');assert.ok(!/const A = eraUsdCost/.test(b),id+' A not on goods scale');}
const bonus=body('ev_money_bonus');
assert.ok(/S\.career\?\.job\?\.monthlyGross/.test(bonus),'bonus is tied to the job pay');
assert.ok(!/eraUsdCost\(5000/.test(bonus),'bonus is not a flat USD sum');
console.log('ok v221 income event wage scale');
