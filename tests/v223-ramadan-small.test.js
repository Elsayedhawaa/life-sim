import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ramadanStartMonth, ramadanBeginsNow } from '../src/data/ramadanDates.js';
// real Umm al-Qura starts: 13 Apr 2021, 18 Feb 2026, 4 Oct 2005, 28 Mar 1990
assert.equal(ramadanStartMonth(2021), 4); assert.equal(ramadanStartMonth(2026), 2);
assert.equal(ramadanStartMonth(2005), 10); assert.equal(ramadanStartMonth(1990), 3);
assert.equal(ramadanBeginsNow({ pacing: 'monthly', year: 2021, month: 3 }), false, 'March 2021 is not the Ramadan month');
assert.equal(ramadanBeginsNow({ pacing: 'monthly', year: 2021, month: 4 }), true);
assert.equal(ramadanBeginsNow({ pacing: 'yearly', year: 2021, month: 1 }), true);
const a = fs.readFileSync('src/data/eventsMoneyHealthCareer.js', 'utf8') + fs.readFileSync('src/data/eventsEverydayFamily.js', 'utf8');
assert.ok(!/has ached for years/.test(a), 'yoga card must not assert an unexplained back history');
assert.ok(!/days away in your city/.test(a));
assert.equal((a.match(/ramadanBeginsNow\(S\)/g) || []).length, 3, 'all three Ramadan events are date-gated');
console.log('ramadan-small OK');
