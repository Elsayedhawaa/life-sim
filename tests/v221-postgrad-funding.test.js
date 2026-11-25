import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { enrollPostgraduateProgram, postgradParentsCanPay, postgradFee } from '../src/systems/completeLifeSystems.js';
import { familyEducationFunds } from '../src/systems/educationFunding.js';
function life(tier, age) { const s = createNewLifeState({ country: 'egy', seed: 9, familyTier: tier, birthYear: 1990, age: 0 }); ensureExtendedState(s); s.player.age = age; s.year = 1990 + age; s.month = 9; s.education.degrees = ['business']; s.education.university = null; return s; }
const w = life('wealthy', 22); const cash0 = w.money.cash; const f0 = familyEducationFunds(w);
assert.ok(postgradParentsCanPay(w, 'masters_mba'));
const r = enrollPostgraduateProgram(w, 'masters_mba', 'family'); assert.ok(r.ok, r.msg);
assert.equal(w.money.cash, cash0, 'parents paid: your cash untouched'); assert.ok(familyEducationFunds(w) < f0, 'family funds drawn down'); assert.equal(w.postgrad.active.paidBy, 'your parents');
assert.equal(enrollPostgraduateProgram(w, 'masters_mba', 'family').ok, false, 'no double enrol');
const o = life('wealthy', 33); assert.equal(enrollPostgraduateProgram(o, 'masters_mba', 'family').ok, false, 'over 30: parents do not pay'); assert.equal(o.postgrad.active, null);
const p = life('struggling', 22); assert.equal(enrollPostgraduateProgram(p, 'masters_mba', 'family').ok, false, 'poor family cannot'); assert.equal(p.postgrad.active, null);
const d = life('wealthy', 22); for (const id of [d.relations.fatherId, d.relations.motherId]) d.people[id].alive = false; assert.equal(enrollPostgraduateProgram(d, 'masters_mba', 'family').ok, false, 'dead parents cannot pay');
const c = life('wealthy', 22); c.money.cash = 0; assert.equal(enrollPostgraduateProgram(c, 'masters_mba', 'cash').ok, false, 'cash route still needs the cash');
console.log('postgrad-funding OK');
{
  const l = life('struggling', 24); l.money.cash = 0; const fee = postgradFee(l, 'masters_mba');
  const r = enrollPostgraduateProgram(l, 'masters_mba', 'loan'); assert.ok(r.ok, r.msg);
  assert.equal(l.money.cash, 0, 'loan pays the university: cash untouched');
  const ln = l.money.loans.find(x => x.narrativeKind === 'student'); assert.ok(ln); assert.equal(ln.balance, fee); assert.equal(ln.annualRate, 0.06); assert.equal(ln.remainingMonths, 60); assert.ok(ln.monthlyPayment * 60 > fee, 'interest is real');
  assert.equal(l.postgrad.active.paidBy, 'a student loan');
  const l2 = life('struggling', 24); l2.money.loans.push({ narrativeKind: 'student', balance: 5 }); assert.equal(enrollPostgraduateProgram(l2, 'masters_mba', 'loan').ok, false, 'one student loan at a time');
  console.log('postgrad-loan OK');
}
{
  const { settleHouseholdMonth } = await import('../src/systems/economyEngine.js');
  const l = life('struggling', 24); l.money.cash = 50000; enrollPostgraduateProgram(l, 'masters_mba', 'loan');
  const ln = l.money.loans.find(x => x.narrativeKind === 'student'); const b0 = ln.balance, m0 = ln.remainingMonths;
  settleHouseholdMonth(l); assert.equal(ln.balance, b0, 'no payment or interest while studying'); assert.equal(ln.remainingMonths, m0);
  l.postgrad.active = null; settleHouseholdMonth(l);
  const after = l.money.loans.find(x => x.narrativeKind === 'student'); assert.ok(after && after.balance !== b0, 'repayment starts after study: balance moves');
  console.log('postgrad-loan-deferral OK');
}
