/* ============================================================================
   World Life 2.6 — Mortality Probe (NEW test, does not touch the 3 shipped
   tests). Runs full lives the same way the coherence suite does and prints:
   median death age, share reaching 90, top causes of death, share of deaths
   with a SPECIFIC (non-generic) cause — plus scripted cancer/heart
   treatment cases proving BOTH success and failure happen, a staging
   check, and the aging-sign + fitness proofs.
   Run: node tests/mortality_probe.mjs
   ========================================================================== */

import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import {
  runDiseaseTreatment, treatmentSuccessProb, assignStage,
  agingYearlyDecline
} from '../src/systems/mortalityModel.js';
import { mortRand } from '../src/systems/mortalityModel.js';

const print = (...a) => console.log(...a);
const GENERIC = /following health complications|natural causes/i;

/* ------------------------------------------------------------------ */
/* 1. FULL LIVES — egy / gbr / usa, several seeds each                 */
/* ------------------------------------------------------------------ */
function runOneLife(seed, country, gender) {
  const S = createNewLifeState({ seed, country, birthYear: 1960, familyTier: 'middle', gender });
  let steps = 0;
  while (!S.gameOver && S.player.age < 100 && steps < 1600) {
    advanceSingleTurn(S);
    if (S.activeScene) resolveActiveSceneChoice(S, 0);
    steps++;
  }
  return S;
}

const lives = [];
for (const country of ['egy', 'gbr', 'usa']) {
  for (let i = 0; i < 20; i++) {
    const seed = 5000 + i * 101 + (country === 'egy' ? 0 : country === 'gbr' ? 17 : 31);
    lives.push({ country, seed, S: runOneLife(seed, country, i % 2 === 0 ? 'm' : 'f') });
  }
}
const deaths = lives.filter(l => l.S.gameOver);
const deathAges = deaths.map(l => l.S.player.age).sort((a, b) => a - b);
const median = deathAges.length ? deathAges[Math.floor(deathAges.length / 2)] : null;
const reached90 = lives.filter(l => l.S.player.age >= 90).length;
const causeCounts = {};
for (const l of deaths) {
  const c = l.S.player.deathCause || '(no cause recorded)';
  causeCounts[c] = (causeCounts[c] || 0) + 1;
}
const specific = deaths.filter(l => l.S.player.deathCause && !GENERIC.test(l.S.player.deathCause)).length;
const perCountry = {};
for (const c of ['egy', 'gbr', 'usa']) {
  const a = lives.filter(l => l.country === c && l.S.gameOver).map(l => l.S.player.age).sort((x, y) => x - y);
  perCountry[c] = { medianDeathAge: a.length ? a[Math.floor(a.length / 2)] : null, deaths: a.length, reached90: lives.filter(l => l.country === c && l.S.player.age >= 90).length };
}
print('MORTALITY_PROBE_FULL_LIVES: ' + JSON.stringify({
  livesRun: lives.length,
  deaths: deaths.length,
  survivedTo100: lives.length - deaths.length,
  medianDeathAge: median,
  deathAges,
  shareReaching90: `${reached90}/${lives.length} (${Math.round(100 * reached90 / lives.length)}%)`,
  perCountry,
  topCauses: Object.entries(causeCounts).sort((a, b) => b[1] - a[1]),
  specificCauseShare: deaths.length ? `${specific}/${deaths.length} (${Math.round(100 * specific / deaths.length)}%)` : 'n/a'
}, null, 2));
for (const l of lives) {
  print(`  LIFE ${l.country} seed=${l.seed} gender=${l.S.player.gender}: ${l.S.gameOver ? `died age ${l.S.player.age} — ${l.S.player.deathCause}` : `alive at ${l.S.player.age}`}`);
}

/* ------------------------------------------------------------------ */
/* 2. SCRIPTED TREATMENT CASES — both outcomes must occur             */
/* ------------------------------------------------------------------ */
function scriptedTreatmentCase(label, condId, gender, stage, n = 200) {
  const outcomes = {};
  let totalCost = 0;
  for (let i = 0; i < n; i++) {
    const S = createNewLifeState({ seed: 90000 + i * 13, country: 'gbr', birthYear: 1960, familyTier: 'middle', gender });
    ensureExtendedState(S);
    /* Warm up the RNG: mulberry32's first draws from a fresh hashSeed are
       skewed low, which would bias a treatment roll made on a new state. */
    for (let w = 0; w < 10; w++) mortRand(S);
    S.player.age = 60;
    S.year = 2020;
    S.money.cash = 10000000;
    S.skills.fitness = 55;
    const cond = {
      id: condId, label: condId, severity: 'severe', chronic: false,
      sinceYear: 2020, managed: false, treatmentStatus: 'untreated',
      stage, annualHealthHit: 8, annualHappinessHit: 5, deathRiskPerYear: 0.15,
      treatmentUsd2026: 8500
    };
    S.medical.conditions = [cond];
    const p = treatmentSuccessProb(S, cond, 'private');
    const r = runDiseaseTreatment(S, condId, 'private');
    outcomes[r.outcome || (r.ok ? 'unknown' : 'blocked')] = (outcomes[r.outcome || 'blocked'] || 0) + 1;
    if (i === 0) totalCost = 10000000 - S.money.cash;
    if (i === 0) print(`  ${label}: successProb=${p.toFixed(2)} first-course cost=${totalCost}`);
  }
  print(`TREATMENT_CASE ${label}: ` + JSON.stringify(outcomes));
  return outcomes;
}
print('--- scripted treatment cases (200 seeds each, age 60, private care) ---');
const breast = scriptedTreatmentCase('breast cancer stage II (female)', 'breast_cancer', 'f', 'II');
const lung = scriptedTreatmentCase('lung cancer stage IV (male)', 'lung_cancer', 'm', 'IV');
const heart = scriptedTreatmentCase('coronary heart disease (male)', 'heart_disease', 'm', 'stable');
for (const [name, o] of [['breast', breast], ['lung', lung], ['heart', heart]]) {
  const wins = (o.remission || 0) + (o.treated || 0);
  const fails = (o.failed || 0) + (o.partial || 0);
  if (wins === 0 || fails === 0) {
    throw new Error(`TREATMENT CASE ${name}: only one outcome occurred (wins=${wins} fails=${fails}) — treatment must be genuinely probabilistic!`);
  }
}
print('TREATMENT_BOTH_OUTCOMES_OK: success and failure both occur in all three scripted cases.');

/* ------------------------------------------------------------------ */
/* 3. STAGING — recent checkups find cancer earlier                    */
/* ------------------------------------------------------------------ */
function stagingCheck(withCheckup) {
  const counts = { I: 0, II: 0, III: 0, IV: 0 };
  for (let i = 0; i < 200; i++) {
    const S = createNewLifeState({ seed: 77000 + i * 7, country: 'gbr', birthYear: 1960, familyTier: 'middle', gender: 'f' });
    ensureExtendedState(S);
    for (let w = 0; w < 10; w++) mortRand(S);
    S.player.age = 60;
    S.year = 2020;
    S.medical.lastCheckupYear = withCheckup ? 2020 : null;
    const cond = { id: 'breast_cancer' };
    assignStage(S, cond);
    counts[cond.stage]++;
  }
  return counts;
}
print('STAGING_CHECK: ' + JSON.stringify({
  recentCheckup: stagingCheck(true),
  noCheckupEver: stagingCheck(false)
}));

/* ------------------------------------------------------------------ */
/* 4. AGING SIGN — build a 60-year-old directly (no 60-year fast-forward:
   a life can die of disease before 60, which is realistic but would make
   this proof seed-fragile), low fitness, advance years.                */
/* ------------------------------------------------------------------ */
const AGING_TITLES = ['The Stairs Feel Heavy', 'You Need to Hit the Gym', 'Forgetting Names', 'Your Knees Ache Every Morning', 'Your Eyesight Is Fading', 'You Keep Asking People to Repeat Themselves'];
{
  const S = createNewLifeState({ seed: 31337, country: 'gbr', birthYear: 1960, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.player.age = 60;
  S.year = 2020;
  S.month = 1;
  S.pacing = 'monthly';
  S.skills.fitness = 30;
  S.player.vitals.health = 75;
  S.medical.lastExerciseYear = null;
  S.timeBudget.focus = 'balanced';
  S.medical.conditions = [];
  let seen = null;
  let guard = 0;
  while (!seen && S.player.age < 75 && guard++ < 400) {
    advanceSingleTurn(S);
    const t = S.activeScene?.title;
    if (t && AGING_TITLES.includes(t)) seen = { age: S.player.age, title: t };
    if (S.activeScene) resolveActiveSceneChoice(S, 0);
  }
  print('AGING_SIGN_PROOF: ' + JSON.stringify(seen || { fired: false, note: 'no aging sign queued by age 75 in this seed' }));
  if (!seen) throw new Error('AGING SIGN FAILED: no aging sign fired for a 60-year-old with fitness 30 by age 75.');
}

/* ------------------------------------------------------------------ */
/* 5. FITNESS SLOWS DECLINE — same age, high vs low fitness, 10 years */
/* ------------------------------------------------------------------ */
function tenYearDecline(fitness, focus) {
  const S = createNewLifeState({ seed: 4242, country: 'gbr', birthYear: 1960, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.player.age = 60;
  S.year = 2020;
  S.player.vitals.health = 80;
  S.skills.fitness = fitness;
  S.timeBudget.focus = focus;
  S.medical.lastExerciseYear = focus === 'wellness_longevity' ? 2020 : null;
  S.medical.conditions = [];
  for (let y = 0; y < 10; y++) agingYearlyDecline(S);
  return { healthAfter10Years: S.player.vitals.health, fitnessAfter10Years: Math.round(S.skills.fitness) };
}
const fitDecline = tenYearDecline(85, 'wellness_longevity');
const unfitDecline = tenYearDecline(25, 'balanced');
print('FITNESS_DECLINE_PROOF (age 60, health 80, 10 scripted years): ' + JSON.stringify({
  fit85_wellnessFocus: fitDecline,
  unfit25_balanced: unfitDecline
}));
if (!(fitDecline.healthAfter10Years > unfitDecline.healthAfter10Years)) {
  throw new Error('FITNESS PROOF FAILED: fit life did not lose less health than unfit life.');
}
/* ------------------------------------------------------------------ */
/* 6. PURE BASELINE — no diseases, fixed fitness 50: the model's own
   expectation for the country gap (the 60 full lives above are noisy:
   fitness, jobs and diseases vary). 2000 simulated lives per group,
   rolling only baselineAnnualDeathProb. */
/* ------------------------------------------------------------------ */
import { baselineAnnualDeathProb } from '../src/systems/mortalityModel.js';
{
  const rows = {};
  for (const country of ['egy', 'gbr', 'usa']) {
    for (const gender of ['m', 'f']) {
      const ages = [];
      for (let i = 0; i < 2000; i++) {
        const S = createNewLifeState({ seed: 100000 + i * 37, country, birthYear: 1960, familyTier: 'middle', gender });
        ensureExtendedState(S);
        S.skills.fitness = 50;
        S.medical.conditions = [];
        let diedAt = 104;
        for (let a = 20; a < 105; a++) {
          S.player.age = a; S.year = 1960 + a;
          if (mortRand(S) < baselineAnnualDeathProb(S)) { diedAt = a; break; }
        }
        ages.push(diedAt);
      }
      ages.sort((a, b) => a - b);
      rows[`${country}_${gender}`] = {
        medianDeathAge: ages[1000],
        reach90: `${Math.round(100 * ages.filter(a => a >= 90).length / 2000)}%`
      };
    }
  }
  print('PURE_BASELINE (no disease, fitness 50, 2000 lives each): ' + JSON.stringify(rows));
}
print('MORTALITY_PROBE_DONE');
