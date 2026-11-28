import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { assignCareerWork } from '../src/systems/careerWork.js';
import { givePersonalMoney, lendPersonalMoney } from '../src/systems/personalReceivables.js';
import { doDailyActivity } from '../src/systems/completeLifeSystems.js';
import { npcJobChange } from '../src/systems/soulEngine.js';
const mk = (seed) => { const s = createNewLifeState({ country: 'egy', seed, familyTier: 'middle', birthYear: 1990, age: 30 }); ensureExtendedState(s); return s; };

// 1. money sent resets friend drift
for (const fn of [givePersonalMoney, lendPersonalMoney]) {
  const s = mk(5); s.money.cash = 100000;
  s.people.f1 = { id: 'f1', alive: true, role: 'friend', firstName: 'Omar', age: 30, rel: { affection: 70, driftState: 'drifting', lastContactYear: 2005 }, career: {} };
  fn(s, 'f1', 1000);
  assert.equal(s.people.f1.rel.driftState, 'none', fn.name + ' counts as contact');
  assert.equal(s.people.f1.rel.lastContactYear, s.year);
}

// 2. data job gets no payment-bug card
for (const track of ['data_science', 'analytics', 'ai_automation']) {
  for (let seed = 1; seed < 8; seed++) {
    const s = mk(seed); s.career.employed = true; s.career.job = { track, title: 'Data Scientist' }; s.career.currentWork = null;
    const w = assignCareerWork(s);
    assert.ok(w && !/payment|checkout/i.test(w.title + w.detail), track + ' must not get the checkout bug: ' + w?.title);
  }
}

// 3. a father rehired is not laid off again at once, and the second loss reads differently
const s = mk(9);
const dad = { id: 'd', alive: true, role: 'father', firstName: 'Nabil', gender: 'm', age: 45, city: 'Cairo', residenceCountry: 'egy', traits: { reliability: 10, ambition: 10 }, career: { title: 'Accountant', monthlyIncomeLocal: 9000, rehiredYear: s.year } };
s.people.d = dad;
for (let i = 0; i < 400; i++) npcJobChange(s, dad);
assert.equal(dad.career.jobLosses || 0, 0, 'no layoff within three years of rehire');
delete dad.career.rehiredYear;
const lines = [];
for (let i = 0; i < 3000 && lines.length < 2; i++) {
  dad.career = { title: 'Accountant', monthlyIncomeLocal: 9000, jobLosses: lines.length };
  const n = s.journal.length; npcJobChange(s, dad);
  if (dad.career.title === 'Seeking Work') lines.push(s.journal[s.journal.length - 1]?.text || s.journal[0]?.text);
}
// 4. the reading habit does not repeat one sentence
const h = mk(11); h.player.age = 30; h.money.cash = 10000000; const seen = new Set();
for (let i = 0; i < 4; i++) { h.habitUse = {}; h.habitUse.read = { year: 0, month: 1, count: 1, total: i }; const r = doDailyActivity(h, 'read'); assert.ok(r.ok !== false, JSON.stringify(r)); seen.add(h.journal.find(e => /read|book|pages|evenings/i.test(e.text))?.text); h.journal.length = 0; }
assert.ok(seen.size >= 3, 'read habit rotates lines: ' + [...seen].join(' / '));
console.log('batch-b OK');
