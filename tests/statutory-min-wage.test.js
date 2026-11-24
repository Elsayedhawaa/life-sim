import assert from 'node:assert/strict';
import { statutoryMinMonthlyGross as F } from '../src/data/economy.js';
assert.equal(F('egy', 2024), 0); assert.equal(F('egy', 2025), 7000); assert.equal(F('egy', 2026), 7000); assert.equal(F('egy', 2027), 8500);
assert(F('egy', 2035) > 8500); assert.equal(F('tur', 2025), 0); assert.equal(F('tur', 2026), 33030);
assert.equal(F('gbr', 2030), 0); assert.equal(F('usa', 2030), 0);
console.log('statutory minimum wage floors pass');
