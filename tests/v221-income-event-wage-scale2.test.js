import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src=readFileSync(new URL('../src/data/eventsMoneyHealthCareer.js',import.meta.url),'utf8');
function body(id){const i=src.indexOf("key: '"+id+"'");assert.ok(i>=0,id);return src.slice(Math.max(0,i-900),i+200);}
// GAME DESIGN: pay-like amounts (a bonus, a package, a salary, an internship wage, side-job pay) follow the country's wage scale, not the goods price scale (before, a 5,000 USD "small bonus" was 1.4 months of Egyptian pay and an 11,000 USD "a month" offer was 3 months).
for(const id of['ev_career_client_win','ev_career_restructure','ev_career_award','ev_career_side_business','ev_career_new_job_offer','ev_uni_internship']){const b=body(id);assert.ok(/(usdMonthlyPayToLocal|internMonthlyPayToLocal)\(S\.country, S\.year/.test(b),id+' on wage scale');assert.ok(!/const A = eraUsdCost\(/.test(b),id+' A not goods scale');}
assert.ok(/usdMonthlyPayToLocal\(st\.country, st\.year, 6000\)/.test(src),'side pay on wage scale');
// the quoted salary matches what the choice does
assert.ok(/monthlyGross \* 1\.12\) : usdMonthlyPayToLocal/.test(body('ev_career_new_job_offer')+src.slice(src.indexOf("key: 'ev_career_new_job_offer'")-900,src.indexOf("key: 'ev_career_new_job_offer'"))),'offer quotes gross +12%');
console.log('ok v221 income event wage scale 2');
