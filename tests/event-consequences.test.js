import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState, createPerson } from '../src/core/schema.js';
import { snapshotMajor, announceMajorChanges } from '../src/systems/majorLifeEvents.js';
import { getRandomLifeEventById as G, eventGatePasses as P, restoreRandomLifeScene as R } from '../src/systems/eventEngine.js';
function setup() { const s = createNewLifeState({ country: 'gbr', seed: 411 }); ensureExtendedState(s); s.player.age = 40; s.year = 2040; s.month = 3; s.turn = 200; return s; }
const add = (s, role, age, list) => { const p = createPerson(s, { role, age, nationality: 'gbr', residenceCountry: 'gbr' }); s.people[p.id] = p; list.push(p.id); return p; };
const ids = ['ev_conseq_promotion_spouse','ev_conseq_promotion_workload','ev_conseq_child_after_divorce','ev_conseq_child_after_separation','ev_conseq_sibling_after_mother_death','ev_conseq_sibling_after_father_death','ev_conseq_mom_after_sibling_death','ev_conseq_dad_after_sibling_death','ev_conseq_friend_after_job_loss'];
for (const id of ids) { const s = setup(); assert(G(id), id); assert(!P(G(id), s), id + ' needs a real event'); }
const play = (s, id, i) => { s.activeScene = null; s.sceneQueue = []; const sc = R(s, { eventId: id, eventBuildRngState: s.rngState }); assert(sc, id + ' builds'); sc.choices[i].effect(s); };
// promotion
{ const s = setup(); const sp = add(s, 'spouse', 38, s.relations.spouseIds); s.career.employed = true; s.career.job = { employer: 'Acme', title: 'Analyst', track: 't', level: 1, performance: 50 };
  const b = snapshotMajor(s); s.career.job.level = 2; s.career.job.title = 'Senior'; s.career.lastPromotion = { at: s.year * 12 + s.month, employer: 'Acme', track: 't', level: 2, newTitle: 'Senior', oldTitle: 'Analyst' };
  announceMajorChanges(s, b); assert(P(G('ev_conseq_promotion_spouse'), s)); assert(!P(G('ev_conseq_promotion_workload'), s), 'too soon');
  s.month += 2; assert(P(G('ev_conseq_promotion_workload'), s)); play(s, 'ev_conseq_promotion_workload', 0); assert.equal(s.career.job.performance, 53);
  play(s, 'ev_conseq_promotion_spouse', 0); s.career.job = null; s.career.employed = false; assert(!P(G('ev_conseq_promotion_spouse'), s), 'no job, no promotion scene'); }
// divorce + separation with minor child; adult child excluded
{ const s = setup(); const sp = add(s, 'spouse', 38, s.relations.spouseIds); const ch = add(s, 'child', 9, s.relations.childIds); sp.relationshipProgress = { stage: 'together' };
  let b = snapshotMajor(s); sp.relationshipProgress.stage = 'separated'; announceMajorChanges(s, b); assert(P(G('ev_conseq_child_after_separation'), s));
  play(s, 'ev_conseq_child_after_separation', 0);
  b = snapshotMajor(s); s.relations.spouseIds = []; announceMajorChanges(s, b); s.month += 2; assert(P(G('ev_conseq_child_after_divorce'), s));
  const sc = G('ev_conseq_child_after_divorce').build(s, { child: ch, spouse: sp }); assert(sc.text.includes(sp.firstName));
  ch.age = 25; assert(!P(G('ev_conseq_child_after_divorce'), s)); }
// parent death -> sibling; sibling death -> parent
{ const s = setup(); const sib = add(s, 'sibling', 35, s.relations.siblingIds); let b = snapshotMajor(s); s.people[s.relations.motherId].alive = false; announceMajorChanges(s, b);
  assert(P(G('ev_conseq_sibling_after_mother_death'), s)); assert(!P(G('ev_conseq_sibling_after_father_death'), s)); play(s, 'ev_conseq_sibling_after_mother_death', 0);
  b = snapshotMajor(s); sib.alive = false; announceMajorChanges(s, b); s.month += 2; assert(P(G('ev_conseq_dad_after_sibling_death'), s)); assert(!P(G('ev_conseq_mom_after_sibling_death'), s), 'mother already dead'); play(s, 'ev_conseq_dad_after_sibling_death', 0); }
// job loss -> friend
{ const s = setup(); add(s, 'friend', 38, s.relations.friendIds); s.career.employed = true; s.career.job = { employer: 'Acme', title: 'Analyst' }; const b = snapshotMajor(s);
  s.career.employed = false; s.career.job = null; s.career.jobLoss = { lastJob: { employer: 'Acme', year: s.year, month: s.month, reason: 'redundancy' } }; announceMajorChanges(s, b); s.month += 2;
  assert(P(G('ev_conseq_friend_after_job_loss'), s)); play(s, 'ev_conseq_friend_after_job_loss', 0); s.career.employed = true; s.career.job = { employer: 'N', title: 'x' }; assert(!P(G('ev_conseq_friend_after_job_loss'), s)); }
console.log('linked consequence follow-ups gated on recorded events and real people');
// eviction abroad: real rent, real liability, real payment
{ const s = setup(); s.homeCountry = 'gbr'; s.country = 'uae'; s.housing.mode = 'rent'; s.housing.monthlyRent = 900; s.housing.currentHomeName = 'Shared Bedspace / Room'; s.money.cash = 1000;
  s.money.loans.push({ id: 'rentarrears_x', label: 'Rental liability after deposit', balance: 1000, monthlyPayment: 84, annualRate: 0, remainingMonths: 12, country: 'uae', missedMonths: 0 });
  const ev = G('ev_conseq_eviction_abroad'); assert(!P(ev, s)); const b = snapshotMajor(s); s.housing.lastEviction = { year: s.year, month: s.month, from: 'Flat 2' }; announceMajorChanges(s, b); s.month += 2;
  assert(P(ev, s)); const sc = ev.build(s, {}); assert(/Flat 2/.test(sc.text) && /owe/.test(sc.text) && sc.choices.length === 2);
  const cash = s.money.cash; play(s, 'ev_conseq_eviction_abroad', 0); assert(s.money.cash < cash); assert(s.money.loans[0].balance < 1000);
  const s2 = setup(); s2.homeCountry = 'gbr'; s2.housing.mode = 'parents'; const b2 = snapshotMajor(s2); s2.housing.lastEviction = { year: s2.year, month: s2.month, from: 'F' }; announceMajorChanges(s2, b2); s2.month += 2; assert(!P(ev, s2), 'at home, the parent scene applies instead');
  const s3 = setup(); s3.homeCountry = 'gbr'; s3.country = 'uae'; s3.housing.mode = 'rent'; s3.housing.monthlyRent = 900; s3.housing.currentHomeName = 'Flat 9'; const b3 = snapshotMajor(s3); s3.housing.lastEviction = { year: s3.year, month: s3.month, from: 'F' }; announceMajorChanges(s3, b3); s3.month += 2; const t3 = ev.build(s3, {}); assert.equal(t3.choices.length, 1, 'no liability, no payment choice'); assert(!/shared room/.test(t3.text), 'moved on: no shared-room claim'); }
console.log('eviction abroad follow-up pass');
// crash injury: only after an actual injury; checkup really treats
{ const ev = G('ev_conseq_crash_injury');
  const mk = (injury) => { const s = setup(); s.cars = [{ id: 'c1', name: 'Test Car', valueLocal: 10000, condition: 80 }]; const b = snapshotMajor(s); s.carCrashes = [{ carId: 'c1', carName: 'Test Car', year: s.year, month: s.month, severity: 'moderate', repair: 500, paid: 500, owed: 0, insured: false, injury }]; announceMajorChanges(s, b); s.month += 2; return s; };
  assert(!P(ev, mk(false)), 'no injury, no scene'); const s = mk(true); assert(P(ev, s)); assert(/moderate crash in your Test Car/.test(ev.build(s, {}).text));
  assert(/not had a medical checkup/.test(ev.build(s, {}).text)); s.medical.lastCheckupPeriod = s.year * 12 + s.month + 1; assert(/had a medical checkup since/.test(ev.build(s, {}).text)); s.medical.lastCheckupPeriod = 0;
  s.money.cash = 100000; s.player.vitals.health = 50; play(s, 'ev_conseq_crash_injury', 0); assert(s.player.vitals.health > 50, 'checkup treated'); assert(s.money.cash <= 100000);
  const s2 = mk(true); s2.month += 6; assert(!P(ev, s2), 'window expired'); }
console.log('crash injury follow-up pass');
