#!/usr/bin/env node
/* v2.17 distribution measurement — 100 lives.
 * Run from the game root:  node tests/v217-distribution.mjs
 * Launches one business in each of 100 seeded, varied lives (different
 * countries, venture types, capitals, decisions), runs each life 24
 * months, and prints the FAILURE rate (businesses dead) and the
 * BREAKOUT rate (businesses that became a group / reached level 6+
 * with sustained profit). Both rates must be strictly between 0% and
 * 100% — a real distribution, not a certainty either way.
 *
 * Depends on W2's settlement for real deaths and breakouts: on a copy
 * without it, both rates print 0 and the script says so plainly
 * instead of inventing a distribution.
 * Exit 0 when the run completed and both rates are strictly between
 * 0 and 1; exit 1 otherwise (including when the run itself fails).
 *
 * v2.17 merge — two measurement fixes, both with the reason written
 * down (never quietly relax a check):
 * (a) AUTO-EXPAND. The first version never called expandBusiness, so
 * no business could ever reach level 6 — and breakout REQUIRES level
 * 6 — so the breakout rate was 0 by construction, not by economics.
 * Each month the script now tries to expand the business; the level
 * gate (months, profitable run, staff skill) still decides.
 * (b) VIABLE VENTURES ONLY. The first version launched the first
 * launchable venture in any country, including ones whose takings
 * cannot pay their own staff — a cafe earning $5,200/month with a
 * $13,717/month wage bill in the USA dies in month 2, every time.
 * The venture table's USD numbers are Egypt-calibrated (v2.11), so
 * in high-wage countries most ventures are structurally unprofitable
 * at launch — a real wart, named as an open item (the venture table
 * needs repricing per country), not fixed here. A player reading the
 * launch screen would see the wage estimate and not launch such a
 * business, so the measurement launches only ventures whose takings
 * cover the seeded team's pay (revenue x part-time factor, where it
 * applies, above the 3-role wage bill). The businesses that remain
 * can still struggle, lose money on other costs, get hit by shocks
 * and bad managers, and fail — that is the distribution being
 * measured. */
const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { advanceSingleTurn, resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const { createBusiness, consecutiveProfitableMonths, expandBusiness, BUSINESS_PART_TIME_REV_MULT, averageStaffSkill } = await import('../src/systems/businessEngine.js');
const { listAllBusinessVentures, evaluateBusinessLaunch } = await import('../src/systems/businessEngine.js');
const { roleWageLocal, staffRolesForType } = await import('../src/systems/businessStaff.js');
const { listCommercialPremises, rentBusinessPremises } = await import('../src/systems/businessPremises.js');
const { trainBusinessEmployee } = await import('../src/systems/businessRoles.js');
const { hireManager } = await import('../src/systems/businessManager.js');
const { applyDecision, decisionsForBusiness } = await import('../src/systems/businessDecisions.js');

const COUNTRIES = ['egy', 'usa', 'gbr', 'sau', 'uae', 'deu', 'can', 'tur'];
const N_LIVES = 100;
const MONTHS = 36; /* W2's horizon: breakout needs level 6 (earliest
   month 18) plus a profitable run, a repeat-customer base and brand
   value, so 24 months barely allows it and 36 measures it. */

/* Adult fast-start: a fresh life is born at age 0, and growing 100
   lives to adulthood turn-by-turn would take the whole run. The
   measurement is about the business's 24 months, not the childhood,
   so each life starts at 30 with the calendar set to match — the same
   state a 30-year-old life has when the monthly clock runs. */
function adultLife(seed, country) {
  const S = createNewLifeState({ seed, country, birthYear: 1994, familyTier: ['poor', 'middle', 'rich'][seed % 3], gender: seed % 2 ? 'm' : 'f', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.player.birthYear = 1994;
  S.player.age = 30;
  S.year = 2024; S.month = 1; S.pacing = 'monthly';
  S.money.cash = 5000000;
  S.money.creditScore = 650 + (seed % 150);
  return S;
}

function runMonths(S, n, biz) {
  let ran = 0;
  for (let i = 0; i < n; i++) {
    if (S.gameOver) break;
    if (S.activeScene) { resolveActiveSceneChoice(S, 0); continue; }
    advanceSingleTurn(S);
    ran++;
    if (S.activeScene) resolveActiveSceneChoice(S, 0);
    if (!biz || biz.dead) continue;
    /* Operate it the way a player growing a business would: train the
       weakest team member when the next level's skill bar is out of
       reach (the level gate needs average skill 40+5x(next level)),
       then try to expand. The gate still decides — training only
       buys the skill, never the months or the profitable run. */
    try {
      const needSkill = 40 + 5 * ((Number(biz.level) || 1) + 1);
      if (averageStaffSkill(biz) < needSkill && (biz.staff || []).length) {
        const weakest = [...biz.staff].sort((a, b) => (Number(a.skill) || 0) - (Number(b.skill) || 0))[0];
        trainBusinessEmployee(S, biz, weakest.id);
      }
      expandBusiness(S, biz);
    } catch (e) { /* gate or cash refuses — the business stays small */ }
  }
  return ran;
}

const results = [];
for (let i = 0; i < N_LIVES; i++) {
  const seed = 10000 + i * 7919;
  const country = COUNTRIES[i % COUNTRIES.length];
  const S = adultLife(seed, country);
  try {
    /* Varied venture: rotate through the launchable list, so the 100
       lives do not all open the same shop — but only ventures whose
       takings cover the seeded team's pay (see the header note). */
    const mode = i % 3 === 0 ? 'full_time' : 'part_time';
    const revFactor = mode === 'part_time' ? BUSINESS_PART_TIME_REV_MULT : 1;
    const viable = (v) => {
      const ev = evaluateBusinessLaunch(S, v);
      if (!ev.ok) return false;
      const roles = staffRolesForType(v.id).slice(0, 3);
      const wageBill = roles.reduce((s, r) => s + (Number(roleWageLocal(S, r, S.country)) || 0), 0);
      return (Number(ev.revLocal) || 0) * revFactor > wageBill;
    };
    const launchable = listAllBusinessVentures(S).filter(viable);
    if (!launchable.length) { results.push({ i, seed, country, launched: false, reason: 'nothing viable' }); continue; }
    const venture = launchable[i % launchable.length];
    const launched = createBusiness(S, venture.id, '', { mode });
    if (!launched.ok) { results.push({ i, seed, country, launched: false, reason: launched.msg }); continue; }
    const biz = launched.biz;
    /* Varied decisions, by life index — the point of the twin-lives
       rule is that decisions move the outcome, so the distribution
       must be measured over varied play, not one scripted path:
       a third hire a good manager, a third hire a weak one, a third
       run it themselves; half take a monthly decision, half do not. */
    const managerKind = i % 3;
    if (managerKind === 0) {
      hireManager(S, biz, { name: 'Good Manager', skill: 80 + (i % 15), wage: 12000, loyalty: 75 });
    } else if (managerKind === 1) {
      hireManager(S, biz, { name: 'Weak Manager', skill: 25 + (i % 15), wage: 6000, loyalty: 40 });
    }
    if (i % 2 === 0) {
      const defs = decisionsForBusiness(S, biz);
      if (defs && defs[0]) applyDecision(S, biz, defs[0].id);
    }
    /* Rent a shop: a business run from home cannot grow past level 2,
       so without premises no business in the run could ever break out
       (level 6) — another structural zero, like the missing
       auto-expand. The cheapest rented unit; the rent is a real
       monthly cost from the P&L, and if the cash is short the business
       stays home and stays small. */
    try {
      const units = listCommercialPremises(S).filter((u) => u.kind === 'rented').sort((a, b) => (Number(a.monthlyRentLocal) || 0) - (Number(b.monthlyRentLocal) || 0));
      if (units.length) rentBusinessPremises(S, biz, units[0].unitId);
    } catch (e) { /* stays home — cannot grow past level 2 */ }
    runMonths(S, MONTHS, biz);
    const stillThere = (S.career.businesses || []).find((b) => b.id === biz.id);
    const dead = !stillThere || stillThere.dead === true;
    const b = stillThere || biz;
    const breakout = !dead && (!!b.group || ((Number(b.level) || 1) >= 6 && consecutiveProfitableMonths(b) >= 3));
    results.push({
      i, seed, country, venture: venture.id, mode, managerKind,
      launched: true, dead, breakout,
      level: Number(b.level) || 1,
      monthsLosing: Number(b.monthsLosing) || 0,
      deathCause: b.deathCause || null,
    });
  } catch (e) {
    results.push({ i, seed, country, launched: false, reason: `threw: ${String(e?.message || e).slice(0, 120)}` });
  }
}

const launched = results.filter((r) => r.launched);
const dead = launched.filter((r) => r.dead);
const brokeOut = launched.filter((r) => r.breakout);
const failureRate = launched.length ? dead.length / launched.length : 0;
const breakoutRate = launched.length ? brokeOut.length / launched.length : 0;

console.log(JSON.stringify({
  lives: N_LIVES,
  launched: launched.length,
  notLaunched: results.length - launched.length,
  dead: dead.length,
  brokeOut: brokeOut.length,
  failureRate,
  breakoutRate,
  failurePct: `${(failureRate * 100).toFixed(1)}%`,
  breakoutPct: `${(breakoutRate * 100).toFixed(1)}%`,
  byCountry: Object.fromEntries(COUNTRIES.map((c) => {
    const cs = launched.filter((r) => r.country === c);
    return [c, { launched: cs.length, dead: cs.filter((r) => r.dead).length, brokeOut: cs.filter((r) => r.breakout).length }];
  })),
}, null, 2));
console.log(`FAILURE_RATE=${failureRate}`);
console.log(`BREAKOUT_RATE=${breakoutRate}`);
if (!launched.length) {
  console.log('DISTRIBUTION: no business launched in any life — the measurement is void.');
  process.exit(1);
}
if (failureRate <= 0 || failureRate >= 1 || breakoutRate <= 0 || breakoutRate >= 1) {
  console.log('DISTRIBUTION: rates are NOT both strictly between 0% and 100% — the outcome distribution is not real yet (on a pre-W2 copy both print 0: no deaths, no breakouts).');
  process.exit(1);
}
console.log('DISTRIBUTION_OK: both rates strictly between 0% and 100%.');
process.exit(0);
