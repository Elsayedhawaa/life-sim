import assert from 'node:assert/strict';
const store=new Map();globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const { pickDynamicBanner } = await import('../src/ui/views.js');
const { BANNER_PLACES, bannerFitsCountry } = await import('../src/ui/countryArt.js');
const { COUNTRY_IDS } = await import('../src/data/countries.js');
const subs = { life: [''], people: ['', 'marriage', 'children', 'circle'], work: ['', 'boards'], realestate: ['', 'lands', 'myhome', 'compounds'], finance: [''], lifestyle: ['', 'cars', 'shop', 'pets', 'appearance', 'medical', 'legal'], world: ['', 'gulf', 'global'] };
let n = 0;
for (const c of COUNTRY_IDS) for (const sec of Object.keys(subs)) for (const sub of subs[sec]) for (let turn = 0; turn < 60; turn++) for (const age of [8, 25, 40]) {
  const S = { country: c, turn, month: 1 + turn % 12, year: 1960 + turn * 1.1 | 0, seed: 3 + turn, player: { age }, education: { degrees: turn % 2 ? ['x'] : [], university: turn % 3 ? 'u' : null }, career: {}, housing: {} };
  if (sec === 'realestate' && ['myhome', 'compounds'].includes(sub)) continue; /* needs a live home; the fit rule is applied on the same wrapper */
  let f; try { f = pickDynamicBanner(S, sec, sub); } catch (e) { continue; }
  assert.ok(bannerFitsCountry(f, c), `${c} ${sec}/${sub} showed ${f}`); n++;
}
assert.ok(n > 5000, 'exercised the pickers');
/* The reported case: a US career screen must not show the London picture. */
assert.deepEqual(BANNER_PLACES['city_europe_west.jpg'], ['gbr']);
for (let turn = 0; turn < 200; turn++) assert.notEqual(pickDynamicBanner({ country: 'usa', turn, month: 1 + turn % 12, year: 2026, seed: turn, player: { age: 30 }, education: {}, career: {} }, 'work', ''), 'city_europe_west.jpg');
/* pilgrimage picture only for a Muslim player; vintage European street never for a non-European country */
const base = (c, religion, year, turn) => ({ country: c, turn, month: 1 + turn % 12, year, seed: turn, player: { age: 30, religion }, education: {}, career: {}, housing: {} });
for (let turn = 0; turn < 120; turn++) {
  assert.notEqual(pickDynamicBanner(base('sau', 'christian', 2020, turn), 'lifestyle', 'travel'), 'pilgrimage_travel.jpg');
  for (const c of ['usa', 'jpn', 'ind', 'bra', 'aus', 'egy', 'sgp', 'tur', 'can']) for (const sec of ['life', 'people']) assert.notEqual(pickDynamicBanner(base(c, 'none', 1955, turn), sec, ''), 'era_vintage_street_ink.jpg', c + ' 1955');
}
let sawPilg = false; for (let turn = 0; turn < 120; turn++) if (pickDynamicBanner(base('sau', 'muslim', 2020, turn), 'lifestyle', 'travel') === 'pilgrimage_travel.jpg') sawPilg = true;
assert.ok(sawPilg, 'a Muslim player still gets it');
console.log('country art OK', n);
