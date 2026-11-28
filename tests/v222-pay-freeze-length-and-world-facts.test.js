import assert from 'node:assert/strict';
const store = new Map(); globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const cc = await import('../src/systems/careerConsequences.js');
const we = await import('../src/data/worldEvents.js');
const countries = await import('../src/data/countries.js');
const wes = await import('../src/systems/worldEvents.js');
/* pay freeze: never longer than the warning year plus the next, and one thaw year before another */
const S = { year: 2020, career: { job: { employer: 'X' } } };
assert.equal(cc.setPayFreeze(S, 2022, 'covid'), 2021, 'covid freeze capped at 2021');
assert.equal(S.career.job.payFrozenUntilYear, 2021);
S.year = 2022;
assert.equal(cc.setPayFreeze(S, 2024, 'ukraine'), 0, 'no new freeze in the year after one ended');
assert.equal(S.career.job.payFrozenUntilYear, 2021);
S.year = 2023;
assert.equal(cc.setPayFreeze(S, 2024, 'later'), 2024, 'a later crisis can freeze again');
const S2 = { year: 2009, career: { job: { employer: 'Y' } } };
assert.equal(cc.setPayFreeze(S2, 2009, 'short'), 2009, 'a crisis ending this year freezes only this year');
/* tutoring card: a term lump sum, not a monthly income, and sized to two hours a week */
const ev = (await import('../src/data/eventsMoneyHealthCareer.js'));
/* world facts */
const oil = we.WORLD_EVENTS.find(e => e.id === 'oil_crash_2014');
assert.ok(!/under \$30/.test(oil.headline + oil.headlineElsewhere), 'oil headline does not claim the 2016 low in 2014');
assert.ok(!/cheaper/.test(we.eventHeadline(oil, 'egy') + we.eventMeaning(oil, 'egy')), 'Egypt fuel did not get cheaper in 2014');
assert.ok(/subsid/.test(we.eventHeadline(oil, 'egy')));
assert.ok(/cheaper/.test(we.eventHeadline(oil, 'tur')), 'importers elsewhere still see cheaper fuel');
const covid = we.WORLD_EVENTS.find(e => e.id === 'covid_2020');
assert.ok(!/America|Britain/.test(we.eventMeaning(covid, 'egy')), 'Egypt Covid text has no US/UK housing boom');
assert.ok(/America/.test(we.eventMeaning(covid, 'usa')), 'US keeps the boom sentence');
assert.equal(covid.effects.countries.egy.rate, -0.03, 'CBE cut 300bp in March 2020');
const flt = we.WORLD_EVENTS.find(e => e.id === 'egypt_float_2016');
assert.ok(!/halved against the dollar overnight/.test(flt.headline));
const eh = countries.COUNTRIES.egy.historicalHeadlines;
assert.ok(!/halves the pound overnight/.test(eh[2016]) && /November/.test(eh[2016]));
assert.ok(/spring/.test(eh[2020]) && /late March/.test(eh[2020]));
console.log('ok v222 pay freeze length and world facts');
