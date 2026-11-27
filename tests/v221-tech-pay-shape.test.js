// Tech pay in Italy, Germany and Japan tracks published figures; the USA and Egypt keep their old shape.
// Sources: payscale.com/research/IT/Job=Junior_Software_Engineer/Salary (IT junior 20-34k EUR, median 25k);
// glassdoor.it junior developer Rome 28-36k; hays.de/jobprofile/softwareentwickler (DE junior 42k); stepstone.de/gehalt/Junior-Software-Developer.html (41.3k);
// tokyodev.com/articles/software-developer-salaries-in-japan (typical developer ~4M yen at 3 years; MHLW average 5.69M);
// sprints.ai/en-us/blog/programmer-salaries-in-egypt-2025 (junior 7-12k EGP/month).
import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const m=await import('../src/systems/careerEducationEngine.js');
const {payShape,payRatio}=await import('../src/systems/payShape.js');
const yr=(c,t,l)=>m.marketMonthlyGross(c,2026,t,l)*12;
// Italy junior tech sits inside the published 25-36k band (a little above is fine: 2026 growth)
assert.ok(yr('ita','tech',0)>=26000&&yr('ita','tech',0)<=40000,'ita junior '+yr('ita','tech',0));
assert.ok(yr('ita','tech',2)<=70000,'ita senior '+yr('ita','tech',2));
assert.ok(yr('ita','tech',4)<=110000,'ita top '+yr('ita','tech',4));
assert.ok(yr('deu','tech',0)>=42000&&yr('deu','tech',0)<=55000,'deu junior '+yr('deu','tech',0));
assert.ok(yr('deu','software',2)<=95000);
assert.ok(yr('jpn','tech',0)>=3.8e6&&yr('jpn','tech',0)<=5.2e6,'jpn junior '+yr('jpn','tech',0));
// UK junior 30-40k GBP, senior 55-65k, CTO 100k+ (embstalent.co.uk); France junior 32-46k EUR (vocaneo.com); Canada junior 47-64k CAD (glassdoor.ca), all-level median about 104k CAD (jobbank.gc.ca)
assert.ok(yr('gbr','tech',0)>=30000&&yr('gbr','tech',0)<=40000,'gbr junior '+yr('gbr','tech',0));
assert.ok(yr('gbr','tech',2)>=50000&&yr('gbr','tech',2)<=70000,'gbr senior '+yr('gbr','tech',2));
assert.ok(yr('gbr','tech',4)<=125000,'gbr top '+yr('gbr','tech',4));
assert.ok(yr('fra','tech',0)>=32000&&yr('fra','tech',0)<=46000,'fra junior '+yr('fra','tech',0));
assert.ok(yr('can','tech',0)>=47000&&yr('can','tech',0)<=70000,'can junior '+yr('can','tech',0));
assert.ok(yr('can','tech',2)<=130000,'can senior '+yr('can','tech',2));
// unchanged where no source was checked
assert.equal(payShape('usa','tech',2,1),2);
assert.equal(payShape('egy','tech',2,7.33),2*7.33);
assert.equal(payShape('ita','teaching',0.88,1),0.88);
assert.equal(payShape('ita','trades',1.5,3),4.5);
// promotion ratio follows the compressed ladder, and a ladder is still monotonic
assert.ok(payRatio('ita','tech',2,1,1.67)<1.67&&payRatio('ita','tech',2,1,1.67)>1);
assert.equal(payRatio('usa','tech',2,1,1.67),1.67);
console.log('PASS v221-tech-pay-shape');
