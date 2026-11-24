/* v2.14 §1 verify — Worker 1: the cap goes, management capacity replaces it.
   Run from the game root: node tests/v214-w1-verify.mjs
   Covers the task's five checks:
     (a) no BUSINESS_CAP token left in src/systems/ (engine + capacity);
         the only remaining src/ hits must be src/ui/views.js, which the
         coordinator updates at merge (views.js is not this worker's file).
     (b) a 5-business portfolio is launchable and runs (all 5 post a P&L).
     (c) unmanaged decay over 3 months, counted (revenue + morale fall
         month over month; at month 3 atRisk is true and a plain-words
         journal line exists; taking it over again resets it).
     (d) a 5-business portfolio costs real money and real hours, MEASURED
         (total monthly manager wages + total owner hours, both printed).
     (e) a managed business costs 0 owner hours.
   NOTE: this harness deliberately does NOT import src/main.js or
   src/ui/views.js — views.js still imports the deleted cap constant
   (coordinator-owned merge item). Importing main.js here would fail at
   link time until that merge lands, for reasons outside §1. */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import { launchSmallBusiness } from '../src/systems/careerEducationEngine.js';
import {
  listAllBusinessVentures, createBusiness, evaluateBusinessLaunch,
  computeBusinessMonth, computeWorkload, migrateBusinesses
} from '../src/systems/businessEngine.js';
import {
  managementCapacityInfo, ownerHoursForBusiness, businessIsManaged,
  applyUnmanagedDecay, unmanagedRevenueMult, OWNER_WEEKLY_HOURS_MAX
} from '../src/systems/businessCapacity.js';
import { roleWageLocal } from '../src/systems/businessStaff.js';
import { managerShortlist, hireManager } from '../src/systems/businessManager.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};

function adultLife(over = {}) {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.reputation = 80;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  Object.assign(S, over);
  return S;
}
const avgMorale = (biz) => {
  const st = biz.staff || [];
  if (st.length === 0) return null;
  return st.reduce((s, e) => s + (Number(e.morale) || 0), 0) / st.length;
};
const journalHas = (S, re) => (S.journal || []).some(j => j.text && re.test(j.text));

/* ================= (a) the cap token is gone ================= */
console.log('--- (a) cap token ---');
{
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
  const hits = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.js') && readFileSync(p, 'utf8').includes('BUSINESS_CAP')) hits.push(p.replace(root + '/', ''));
    }
  };
  walk(root);
  console.log('BUSINESS_CAP hits in src/:', hits.length === 0 ? '(none)' : hits.join(', '));
  check('no BUSINESS_CAP token in src/systems/ (engine + capacity)', !hits.some(h => h.startsWith('systems/')), hits.join(', '));
  check('remaining src/ hits are views.js only (coordinator merge item)', hits.every(h => h === 'ui/views.js'), hits.join(', '));
}

/* ================= (b) + (d) + (e) 5-business portfolio ================= */
console.log('--- (b/d/e) 5-business portfolio ---');
const mgrWage = roleWageLocal(adultLife(), 'manager', 'egy');
console.log('manager going wage (1.00 x Egypt monthly mid salary):', mgrWage);
const mgr1 = { name: 'Mona Hassan', skill: 80, wage: mgrWage, loyalty: 75, policy: 'safe', hiredYear: 2026, hiredMonth: 1, personId: 'mgr_test_1' };
const mgr2 = { name: 'Omar Adel', skill: 62, wage: Math.round(mgrWage * 1.2), loyalty: 70, policy: 'safe', hiredYear: 2026, hiredMonth: 1, personId: 'mgr_test_2' };
let S5;
{
  S5 = adultLife();
  S5.money.cash = 20_000_000; /* five startups need more than the 5M seed (the clinic alone is ~2.5M EGP) */
  const r1 = launchSmallBusiness(S5, 'cafe', 'Cairo Corner Café', { mode: 'full_time', manager: mgr1 });
  const r2 = launchSmallBusiness(S5, 'retail_shop', 'Downtown Electronics', { mode: 'full_time', manager: mgr2 });
  const r3 = launchSmallBusiness(S5, 'bakery', 'Third Bakery', { mode: 'part_time' });
  const r4 = launchSmallBusiness(S5, 'salon', 'Fourth Salon', { mode: 'part_time' });
  const r5 = launchSmallBusiness(S5, 'clinic', 'Fifth Clinic', { mode: 'part_time' });
  check('launch 1/5 (manager-run café)', r1.ok, r1.msg);
  check('launch 2/5 (manager-run shop)', r2.ok, r2.msg);
  check('launch 3/5 (owner-run bakery)', r3.ok, r3.msg);
  check('launch 4/5 (owner-run salon)', r4.ok, r4.msg);
  check('launch 5/5 (owner-run clinic)', r5.ok, r5.msg);
  check('portfolio holds 5 businesses (old cap was 3)', S5.career.businesses.length === 5, `got ${S5.career.businesses.length}`);
  check('manager records kept on the business (fixed contract)', S5.career.businesses[0].manager?.name === 'Mona Hassan' && S5.career.businesses[1].manager?.name === 'Omar Adel', JSON.stringify(S5.career.businesses.map(b => b.manager?.name || null)));
  /* (b) settle one month via computeBusinessMonth for each — all 5 post a P&L. */
  const pls = S5.career.businesses.map(b => computeBusinessMonth(S5, b));
  console.log('5-business P&L nets:', pls.map(p => `${p.name} net ${p.net}`).join(' | '));
  check('all 5 post a P&L (lastPL + history)', pls.every(p => p && typeof p.revenue === 'number' && typeof p.net === 'number') && S5.career.businesses.every(b => b.lastPL && (b.history || []).length >= 1), '');
  check('new P&L identity holds: costs = rent + wages + other + remote + manager', pls.every(p => p.costs === p.rent + p.wages + p.other + p.remote + p.manager), JSON.stringify(pls.map(p => p.costs - (p.rent + p.wages + p.other + p.remote + p.manager))));
  check('managed businesses charge the manager wage in the P&L', pls[0].manager === mgrWage && pls[1].manager === Math.round(mgrWage * 1.2) && pls[2].manager === 0, `manager lines: ${pls.map(p => p.manager).join(', ')}`);

  /* (e) a managed business costs 0 owner hours. */
  const w = computeWorkload(S5);
  console.log('workload: job', w.jobHours, '+ business', w.businessHours, '= total', w.totalHours, 'hrs/week; managedCount', w.managedCount);
  check('managed business 1 costs 0 owner hours', ownerHoursForBusiness(S5, S5.career.businesses[0]) === 0, `got ${ownerHoursForBusiness(S5, S5.career.businesses[0])}`);
  check('managed business 2 costs 0 owner hours', ownerHoursForBusiness(S5, S5.career.businesses[1]) === 0, `got ${ownerHoursForBusiness(S5, S5.career.businesses[1])}`);
  check('owner-run part-time businesses cost 18h each (3 x 18 = 54)', w.businessHours === 54, `got ${w.businessHours}`);
  const cap = managementCapacityInfo(S5);
  console.log('capacity: ownerHoursUsed', cap.ownerHoursUsed, 'ownerHoursFree', cap.ownerHoursFree, 'managed', cap.managedCount, 'unmanaged', cap.unmanagedCount);
  check('capacity info: 54h used, 16h free (70h week)', cap.ownerHoursUsed === 54 && cap.ownerHoursFree === 16, `used=${cap.ownerHoursUsed} free=${cap.ownerHoursFree}`);
  check('capacity info: 5 managed, 0 unmanaged', cap.managedCount === 5 && cap.unmanagedCount === 0, `managed=${cap.managedCount} unmanaged=${cap.unmanagedCount}`);

  /* (d) real money + real hours, MEASURED through the settlement. */
  const totalManagerWages = S5.career.businesses.filter(b => b.manager).reduce((s, b) => s + (Number(b.manager.wage) || 0), 0);
  const totalOwnerHours = computeWorkload(S5).businessHours;
  console.log('MEASURED monthly manager wages (2 managed businesses):', totalManagerWages);
  console.log('MEASURED weekly owner hours (3 owner-run businesses):', totalOwnerHours);
  check('manager wages are real money (non-zero, measured)', totalManagerWages > 0, `got ${totalManagerWages}`);
  check('owner hours are real hours (non-zero, measured)', totalOwnerHours > 0, `got ${totalOwnerHours}`);
  const cashBefore = S5.money.cash;
  const ledgerBefore = S5.ledger.length;
  S5.month = 1;
  settleHouseholdMonth(S5);
  const monthLines = S5.ledger.slice(0, S5.ledger.length - ledgerBefore);
  const costLines = monthLines.filter(l => l.label && l.label.startsWith('Business costs'));
  console.log('settlement business cost lines:', costLines.length, '| cash', cashBefore, '->', S5.money.cash);
  check('settlement posts a cost line per business (5)', costLines.length === 5, `got ${costLines.length}`);
  check('settled P&L still charges both manager wages', S5.career.businesses[0].lastPL.manager === mgrWage && S5.career.businesses[1].lastPL.manager === Math.round(mgrWage * 1.2), `got ${S5.career.businesses[0].lastPL.manager}, ${S5.career.businesses[1].lastPL.manager}`);
}
/* No-manager control: the same 5 launches with nobody hired — the
   hours do not stretch to cover them all, so some go unmanaged. */
{
  const S0 = adultLife();
  S0.money.cash = 20_000_000; /* five startups need more than the 5M seed */
  launchSmallBusiness(S0, 'cafe', 'Café', { mode: 'full_time' });
  launchSmallBusiness(S0, 'retail_shop', 'Shop', { mode: 'full_time' });
  launchSmallBusiness(S0, 'bakery', 'Bakery', { mode: 'part_time' });
  launchSmallBusiness(S0, 'salon', 'Salon', { mode: 'part_time' });
  launchSmallBusiness(S0, 'clinic', 'Clinic', { mode: 'part_time' });
  const cap0 = managementCapacityInfo(S0);
  console.log('no-manager control: intended workload', computeWorkload(S0).businessHours, 'hrs/week; capacity managed', cap0.managedCount, 'unmanaged', cap0.unmanagedCount, 'ownerHoursUsed', cap0.ownerHoursUsed);
  { const w0 = computeWorkload(S0); check('(replacement) no-manager control: intended load is 134h/week (40+40+18+18+18), split into allocated hours (capped at the owner capacity) plus the uncovered remainder', w0.businessHours + w0.uncoveredHours === 134 && w0.businessHours <= 70 && w0.uncoveredHours > 0, `allocated ${w0.businessHours} + uncovered ${w0.uncoveredHours}`); }
  check('no-manager control: only 2 of 5 fit in the 70h week (café 40 + bakery 18)', cap0.managedCount === 2 && cap0.unmanagedCount === 3, `managed=${cap0.managedCount} unmanaged=${cap0.unmanagedCount}`);
  check('no-manager control: 3rd/4th/5th businesses get 0 owner hours', ownerHoursForBusiness(S0, S0.career.businesses[1]) === 0 && ownerHoursForBusiness(S0, S0.career.businesses[3]) === 0 && ownerHoursForBusiness(S0, S0.career.businesses[4]) === 0, '');
}

/* ================= (c) unmanaged decay over 3 months ================= */
console.log('--- (c) unmanaged decay, 3 months ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Neglected Café', { mode: 'part_time' });
  const biz = S.career.businesses[0];
  biz.volatility = 0.05; /* low swing, so the decay is readable month to month */
  for (const e of (biz.staff || [])) e.morale = 70;
  /* v2.18 W3 — the launch stamps the starting team's role morale lift
     into the first settled month (+1.1 here: the seeded manager "lifts
     the team"), which would offset the unmanaged −6 by +1 in month 1
     only. Neutralise the stamped lift so this test measures the
     unmanaged decay in isolation, as written — the same kind of setup
     normalisation as the morale = 70 above. The lift itself is
     intended behaviour (v2.17 role carry); it is not removed, only
     kept out of this measurement. */
  if (biz.monthEffects) biz.monthEffects.moraleDelta = 0;
  if (biz._lastRoleEffects) biz._lastRoleEffects.moraleDelta = 0;
  /* The exact state a manager quitting/fired leaves: no manager, and
     the player is not running it (ownerManaged false, 0 hours). */
  biz.manager = null;
  biz.ownerManaged = false;
  biz.ownerHoursPerWeek = 0;
  check('test business starts unmanaged (no manager, no owner-hours)', businessIsManaged(S, biz) === false, '');
  check('unmanaged multiplier is 1.00 before any unmanaged month', unmanagedRevenueMult(biz) === 1, `got ${unmanagedRevenueMult(biz)}`);

  /* Seeded measurement: same RNG stream, only the unmanaged counter
     moves — revenue must fall exactly 1.00 -> 0.90 -> 0.80 -> 0.70. */
  const seededRev = (months) => {
    const scratch = { monthlyRev: biz.monthlyRev, monthlyCost: biz.monthlyCost, reputation: 58, volatility: 0.05, mode: 'part_time', ownerManaged: false, manager: null, unmanagedMonths: months, atRisk: false, staff: [{ wageLocal: 5000, morale: 70, skill: 50 }], premises: { kind: 'home', monthlyRentLocal: 0, conditionPct: 90 }, buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 }, history: [], lastPL: null };
    const seed = S.rngState;
    const rev = computeBusinessMonth(S, scratch).revenue;
    S.rngState = seed;
    return rev;
  };
  const seeded = [0, 1, 2, 3].map(seededRev);
  console.log('seeded revenue at unmanagedMonths 0/1/2/3:', seeded.join(' -> '));
  check('seeded revenue falls strictly every unmanaged month', seeded[0] > seeded[1] && seeded[1] > seeded[2] && seeded[2] > seeded[3], seeded.join(' -> '));
  check('seeded revenue falls ~10% per month (0.90 / 0.80 / 0.70)', Math.abs(seeded[1] / seeded[0] - 0.9) < 0.02 && Math.abs(seeded[2] / seeded[0] - 0.8) < 0.02 && Math.abs(seeded[3] / seeded[0] - 0.7) < 0.02, seeded.map(r => (r / seeded[0]).toFixed(3)).join(', '));

  /* Real settled months: revenue + morale, month over month. */
  const revs = [], morales = [], months = [];
  for (let m = 1; m <= 3; m++) {
    S.month = m;
    settleHouseholdMonth(S);
    revs.push(biz.lastPL.revenue);
    morales.push(Math.round(avgMorale(biz)));
    months.push(biz.unmanagedMonths);
    console.log(`month ${m}: revenue ${biz.lastPL.revenue}, avg morale ${Math.round(avgMorale(biz))}, unmanagedMonths ${biz.unmanagedMonths}, atRisk ${biz.atRisk}`);
  }
  check('unmanagedMonths counts 1, 2, 3', months[0] === 1 && months[1] === 2 && months[2] === 3, months.join(', '));
  check('staff morale falls every unmanaged month (70 -> 64 -> 58 -> 52)', morales[0] === 64 && morales[1] === 58 && morales[2] === 52, morales.join(' -> '));
  check('settled revenue falls every unmanaged month', revs[0] > revs[1] && revs[1] > revs[2], revs.join(' -> '));
  check('atRisk is true at month 3', biz.atRisk === true, `atRisk=${biz.atRisk}`);
  const flagLine = (S.journal || []).find(j => j.text && /unmanaged for 3 months/.test(j.text) && j.text.includes('Neglected Café'));
  console.log('at-risk journal line:', flagLine ? flagLine.text : '(none)');
  check('plain-words at-risk journal line exists at month 3', !!flagLine, '');
  check('at-risk line names the way out (manager / run it / sell it)', !!flagLine && /Hire a manager/.test(flagLine.text) && /take it over yourself/.test(flagLine.text) && /sell it/.test(flagLine.text), flagLine ? flagLine.text : '');

  /* Managed again: take it over with hours to spare — counter resets. */
  biz.ownerManaged = true;
  biz.ownerHoursPerWeek = 18;
  S.month = 4;
  settleHouseholdMonth(S);
  console.log(`month 4 (taken over): unmanagedMonths ${biz.unmanagedMonths}, atRisk ${biz.atRisk}`);
  check('taking it over resets unmanagedMonths to 0', biz.unmanagedMonths === 0, `got ${biz.unmanagedMonths}`);
  check('taking it over clears atRisk', biz.atRisk === false, `atRisk=${biz.atRisk}`);
  check('recovery is journalled in plain words', journalHas(S, /being looked after again/), '');
  /* applyUnmanagedDecay directly: one month's decay, counted. */
  const S2 = adultLife();
  launchSmallBusiness(S2, 'cafe', 'Decay Café', { mode: 'part_time' });
  const b2 = S2.career.businesses[0];
  for (const e of (b2.staff || [])) e.morale = 70;
  b2.manager = null; b2.ownerManaged = false; b2.ownerHoursPerWeek = 0;
  const d1 = applyUnmanagedDecay(S2, b2);
  check('applyUnmanagedDecay month 1: revenueMult 0.90, moraleDelta -6, not flagged', d1.revenueMult === 0.9 && d1.moraleDelta === -6 && d1.flagged === false, JSON.stringify(d1));
  applyUnmanagedDecay(S2, b2);
  const d3 = applyUnmanagedDecay(S2, b2);
  check('applyUnmanagedDecay month 3: revenueMult 0.70, flagged true', d3.revenueMult === 0.7 && d3.flagged === true, JSON.stringify(d3));
}

/* ================= launch gating: the real constraint, in words ================= */
console.log('--- launch gating ---');
{
  const S = adultLife();
  const cafeRow = listAllBusinessVentures(S).find(b => b.id === 'cafe');
  const ev0 = evaluateBusinessLaunch(S, cafeRow);
  console.log('fresh state constraint:', ev0.constraintNote);
  check('fresh state: launch ok, no cap lock', ev0.ok && !ev0.locks.some(l => /Portfolio full|most one person/.test(l)), ev0.locks.join(' '));
  check('fresh state: self-run note states the real constraint', ev0.selfRunNote === 'You run this yourself: 40h/week.', ev0.selfRunNote);
  check('fresh state: manager path states the wage', ev0.managerNote.startsWith('Needs a manager:') && /\d/.test(ev0.managerNote) && /month/.test(ev0.managerNote) && ev0.managerWageEstimateLocal > 0, ev0.managerNote);
  check('fresh state: full-time fits in free hours (70 free)', ev0.selfRunFullTimeOk === true && ev0.ownerHoursFree === 70, `free=${ev0.ownerHoursFree}`);
  check('fresh state, mode full_time: selfRunOkForMode true, 40h needed', evaluateBusinessLaunch(S, cafeRow, 'full_time').selfRunOkForMode === true && evaluateBusinessLaunch(S, cafeRow, 'full_time').hoursNeeded === 40, '');

  /* No free hours: a 48h job + one part-time business already fills
     the week (48 + 18 = 66 of 70h) — only 4h/week are free, not
     enough to run even a part-time business yourself. */
  const Sj = adultLife();
  launchSmallBusiness(Sj, 'cafe', 'First Café', { mode: 'part_time' });
  Sj.career.employed = true;
  Sj.career.job = { employer: 'CIB', title: 'Analyst', monthlyGross: 50000, performance: 70, startYear: 2024, monthsInRole: 12, workMode: 'normal' };
  const evJ = evaluateBusinessLaunch(Sj, cafeRow);
  console.log('no-free-hours constraint:', evJ.constraintNote);
  check('no free hours: needsManager is true', evJ.needsManager === true, `free=${evJ.ownerHoursFree}`);
  check('no free hours: only 4h/week free (70 - 48 job - 18 café)', evJ.ownerHoursFree === 4, `free=${evJ.ownerHoursFree}`);
  check('no free hours: constraint note says "Needs a manager"', /Needs a manager/.test(evJ.constraintNote), evJ.constraintNote);
  check('no free hours, mode part_time: selfRunOkForMode false', evaluateBusinessLaunch(Sj, cafeRow, 'part_time').selfRunOkForMode === false, '');
  const rSelf = createBusiness(Sj, 'bakery', 'Self Bakery', { mode: 'part_time', runBy: 'self' });
  check('new-flow self-run launch refused with no free hours', !rSelf.ok && /not enough to run this yourself/.test(rSelf.msg) && /Hire a manager/.test(rSelf.msg), rSelf.msg);
  const rMgrNo = createBusiness(Sj, 'bakery', 'No Manager Bakery', { mode: 'part_time', runBy: 'manager' });
  check('new-flow manager-run launch refused with no manager supplied', !rMgrNo.ok && /hire a manager/i.test(rMgrNo.msg), rMgrNo.msg);
  const rMgr = createBusiness(Sj, 'bakery', 'Managed Bakery', { mode: 'full_time', manager: mgr1, runBy: 'manager' });
  check('manager-run launch succeeds with a manager record', rMgr.ok && rMgr.biz.manager?.name === 'Mona Hassan', rMgr.msg);
  check('manager-run full-time launch keeps the job (no resignation)', Sj.career.employed === true && !!Sj.career.job, '');
  check('manager-run business costs 0 owner hours', ownerHoursForBusiness(Sj, rMgr.biz) === 0, '');
  const rLegacy = createBusiness(Sj, 'salon', 'Legacy Salon', { mode: 'part_time' });
  check('legacy path (no runBy) still launches — decay, not refusal, is the enforcement', rLegacy.ok, rLegacy.msg);
  check('legacy over-capacity launch is unmanaged + journalled plainly', businessIsManaged(Sj, rLegacy.biz) === false && journalHas(Sj, /has nobody with hours to run it/), '');
}

/* ================= integration: Worker 2's real hire path ================= */
console.log('--- integration: hireManager (Worker 2) ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Hired Café', { mode: 'full_time' });
  const biz = S.career.businesses[0];
  const list = managerShortlist(S, biz);
  check('manager shortlist offers at least 2 named candidates', list.length >= 2 && list.every(c => c.name && c.wage > 0 && c.skill > 0), `n=${list.length}`);
  const h = hireManager(S, biz, list[0]);
  check('hiring a manager from the shortlist works', h.ok && biz.manager?.name === list[0].name, h.msg);
  check('hired manager costs 0 owner hours (workload)', computeWorkload(S).businessHours === 0, `got ${computeWorkload(S).businessHours}`);
  const pl = computeBusinessMonth(S, biz);
  check('hired manager wage lands in the P&L (pl.manager === wage)', pl.manager === biz.manager.wage && pl.costs === pl.rent + pl.wages + pl.other + pl.remote + pl.manager, `manager=${pl.manager} wage=${biz.manager.wage}`);
  const cap = managementCapacityInfo(S);
  check('capacity info counts the managed business as managed', cap.managedCount === 1 && cap.unmanagedCount === 0, `managed=${cap.managedCount} unmanaged=${cap.unmanagedCount}`);
}

/* ================= regression: v2.11 workload + P&L behaviour, minus the cap =================
   These are v211-verify §11/§3 assertions replayed without main.js
   (which cannot link until views.js drops the deleted cap import):
   a part-time business next to a 48h job is still Stretched (66h),
   still costs +5 stress and -2 job performance, and two full-time
   businesses still post exact P&L identities. */
console.log('--- regression: v2.11 §11 workload + §3 P&L ---');
{
  const Sj = adultLife();
  Sj.career.employed = true;
  Sj.career.job = { employer: 'CIB', title: 'Analyst', monthlyGross: 50000, performance: 70, startYear: 2024, monthsInRole: 12, workMode: 'normal' };
  const stress0 = Sj.player.vitals.stress, perf0 = Sj.career.job.performance;
  const rj = launchSmallBusiness(Sj, 'cafe', 'Café PT', { mode: 'part_time' });
  check('v211 §11: part-time launch while employed keeps the job', rj.ok && Sj.career.employed, rj.msg);
  const wj = computeWorkload(Sj);
  console.log('v211 §11 workload: job', wj.jobHours, '+ business', wj.businessHours, '=', wj.totalHours, 'hrs/week, stretched', wj.stretched);
  check('v211 §11: workload is still 66h (48 job + 18 part-time)', wj.totalHours === 66 && wj.stretched === true, `got ${wj.totalHours}`);
  settleHouseholdMonth(Sj);
  check('v211 §11: Stretched still costs +5 stress over the month', Sj.player.vitals.stress >= stress0 + 5, `${stress0} -> ${Sj.player.vitals.stress}`);
  check('v211 §11: Stretched still costs -2 job performance', Sj.career.job.performance === perf0 - 2, `${perf0} -> ${Sj.career.job.performance}`);
}
{
  const S = adultLife();
  S.money.cash = 20_000_000;
  launchSmallBusiness(S, 'cafe', 'Café A', { mode: 'full_time' });
  launchSmallBusiness(S, 'retail_shop', 'Shop B', { mode: 'full_time' });
  S.month = 1;
  settleHouseholdMonth(S);
  const [b1, b2] = S.career.businesses;
  check('v211 §3: net = revenue - costs - tax (biz1)', b1.lastPL.net === b1.lastPL.revenue - b1.lastPL.costs - b1.lastPL.tax, JSON.stringify(b1.lastPL));
  check('v211 §3: net = revenue - costs - tax (biz2)', b2.lastPL.net === b2.lastPL.revenue - b2.lastPL.costs - b2.lastPL.tax, JSON.stringify(b2.lastPL));
  check('v211 §3: costs = rent + wages + other + remote + manager (manager 0)', b1.lastPL.costs === b1.lastPL.rent + b1.lastPL.wages + b1.lastPL.other + b1.lastPL.remote + b1.lastPL.manager, JSON.stringify(b1.lastPL));
  const revLines = S.ledger.filter(l => l.label && l.label.startsWith('Business revenue'));
  check('v211 §3: two revenue lines (one per business)', revLines.length === 2, `got ${revLines.length}`);
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
