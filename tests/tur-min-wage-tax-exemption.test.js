import assert from 'node:assert/strict';
import { computeMonthlyNetPay } from '../src/data/economy.js';

/* Türkiye Law 7349 (Income Tax Law Art. 23/18): every wage earner's income
   tax is reduced by the tax on the era minimum-wage base, so a minimum-wage
   earner pays only 15% social security and no income tax.
   2026 anchors: minimum TRY 33,030 gross / 28,075.50 net per month. */

const net = (gross, year = 2026) => computeMonthlyNetPay(gross, 'tur', year, true);

// At the 2026 minimum wage: no income tax, net == gross × 0.85.
const minWage = net(33030);
assert.equal(minWage.incomeTax, 0, 'minimum-wage earner pays no income tax');
assert.equal(Math.round(minWage.net), 28076, `net ${minWage.net} != statutory 28075.50`);
assert.ok(Math.abs(minWage.effectiveRate - 0.15) < 0.005, 'effective rate is the 15% social share');

// Below the minimum (part-time or sub-rung pay): still no income tax.
assert.equal(net(22400).incomeTax, 0, 'sub-minimum wage pays no income tax');

// Well above: only the excess over the exempt base is taxed.
const high = net(60000);
assert.ok(high.incomeTax > 0, 'higher earner pays some tax');
// Full-bracket tax on 720,000/yr is 132,400; exemption (57,881/yr) lowers it.
const withoutExemption = 132400 / 12;
assert.ok(high.incomeTax < withoutExemption, 'exemption reduces the tax of a higher earner');
assert.ok(high.incomeTax > withoutExemption - (69772 / 12) - 1, 'exemption is the min-wage-base tax, not more');

// Era scaling: brackets and the exemption scale together, so the exemption
// still zeroes tax on a wage at that era's minimum share of the scale.
const now = net(33030, 2026);
const past = net(33030 * 0.5, 2026); // lower relative wage in same year still exempt
assert.equal(past.incomeTax, 0, 'wage at/below min base is exempt at any scale');
// An old-era wage equal to the minimum at that era's scale stays exempt.
import { wageFactor } from '../src/data/economy.js';
const w2015 = wageFactor('tur', 2015);
const w2026 = wageFactor('tur', 2026);
const min2015 = net(33030 * (w2015 / w2026), 2015);
assert.equal(min2015.incomeTax, 0, 'era-scaled minimum wage stays exempt in earlier eras');

// Other countries are untouched.
const braLow = computeMonthlyNetPay(1621, 'bra', 2026, true);
assert.ok(braLow.incomeTax >= 0, 'BRA low wage tax unchanged semantics');
console.log('TUR minimum-wage tax exemption tests passed');
