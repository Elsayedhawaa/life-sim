/* ============================================================================
   World Life 2.6 — Mortality / Aging / Disease Model (mortalityModel.js)
   Single source of truth for: baseline mortality, fitness-slowed aging,
   cancer staging, probabilistic treatment, dementia, and cause of death.

   NUMBERS: every sourced figure comes from v26-RESEARCH-MORTALITY.md
   (SSA 2023 life table, ACS/SEER cancer survival, AHA heart data, BMJ 2025
   dementia survival, Ekelund/Paluch exercise data). Anything the note
   labels "judgment call" is marked JUDGMENT CALL in a comment below, with
   the reason — no invented number is presented as measured.
   ========================================================================== */

import { hashSeed, clamp } from '../core/rng.js';
import { recordJournal, walletMove } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { convertCurrency } from '../data/economy.js';
import { MEDICAL_CONDITIONS } from '../data/institutions.js';
import { staffTreatmentEligible } from './careerEducationEngine.js';

/* Mortality has its OWN seeded RNG stream (S.mortalityRng, derived from the
   life's seed). Every mortality roll — staging, treatment, disease death,
   baseline death, aging signs — draws from it, never from the main stream.
   That way tuning mortality never reshuffles story events, job offers or
   random scenes, which all draw from the main stream. Same seed -> same
   life, exactly as before. */
export function mortRand(S) {
  if (!S) throw new Error('mortRand() called without a game state.');
  if (typeof S.mortalityRng !== 'number') {
    S.mortalityRng = hashSeed(String(S.seed ?? 'world-life-2') + ':mortality');
  }
  let t = (S.mortalityRng = (S.mortalityRng + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
/* Onset weighting — JUDGMENT CALL correcting a distortion in a uniform
   pick: the 49-condition pool treats every condition as equally likely,
   but in real life cancers are a small share of NEW chronic diagnoses at
   40-55 (hypertension, cholesterol, arthritis and diabetes dominate new
   diagnoses), while cancer incidence rises steeply with age. A uniform
   pick therefore makes deadly cancers far too common in young lives.
   Weights below are relative likelihoods, not measured incidence rates. */
export function onsetWeight(cond, age) {
  if (isCancer(cond.id)) {
    if (cond.id === 'leukemia') return 0.4;
    return age < 50 ? 0.3 : age < 65 ? 0.6 : 1.0;
  }
  if (cond.id === 'heart_attack' || cond.id === 'stroke_recovery') return age < 55 ? 0.6 : 1.0;
  if (cond.id === 'dementia') return 0.3;
  /* GAME DESIGN: the pick used to be uniform over every condition, so hepatitis B, type 1 diabetes in an adult
     and epilepsy turned up as often as asthma or short sight, in roughly one life in six. These weights make the
     rare ones rare. The numbers are my judgment of relative frequency, not sourced incidence figures. */
  const RARE = { hepatitis_b: 0.1, type1_diabetes: 0.1, epilepsy: 0.3, bipolar: 0.3, head_injury: 0.5, pneumonia: 0.6 };
  if (RARE[cond.id] !== undefined) return age < 16 && cond.id === 'type1_diabetes' ? 0.3 : RARE[cond.id];
  return 1.0;
}
export function mortPickWeighted(S, list, weightFn) {
  if (!Array.isArray(list) || list.length === 0) return null;
  let total = 0;
  for (const item of list) total += weightFn(item);
  let r = mortRand(S) * total;
  for (const item of list) {
    r -= weightFn(item);
    if (r <= 0) return item;
  }
  return list[list.length - 1];
}

export function mortChance(S, probability) { return mortRand(S) < probability; }
export function mortPick(S, list) {
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[Math.floor(mortRand(S) * list.length)];
}

/* --------------------------------------------------------------------------
   1. SERIOUS DISEASES — the ones that get staging + probabilistic treatment.
   Minor conditions (cold, fracture, myopia, ...) keep the old simple cure.
   -------------------------------------------------------------------------- */
export const SERIOUS_CONDITION_IDS = new Set([
  'breast_cancer', 'lung_cancer', 'colon_cancer', 'cervical_cancer',
  'prostate_cancer', 'leukemia',
  'heart_disease', 'heart_attack', 'stroke_recovery', 'copd', 'ckd',
  'dementia'
]);
export const CANCER_IDS = new Set([
  'breast_cancer', 'lung_cancer', 'colon_cancer', 'cervical_cancer',
  'prostate_cancer', 'leukemia'
]);
export function isSeriousCondition(id) { return SERIOUS_CONDITION_IDS.has(id); }
export function isCancer(id) { return CANCER_IDS.has(id); }

/* --------------------------------------------------------------------------
   2. BASELINE MORTALITY — SSA 2023 period life table (research note §4),
   sex-averaged qx, interpolated log-linearly between anchor ages.
   -------------------------------------------------------------------------- */
const SSA_QX_ANCHORS = [
  [0, 0.0055], [1, 0.0004], [5, 0.00015], [10, 0.00012], [15, 0.0004],
  [20, 0.0009], [25, 0.0010], [30, 0.0012], [35, 0.0016], [40, 0.0022],
  [45, 0.0030], [50, 0.0040], [55, 0.0060], [60, 0.0091], [65, 0.0134],
  [70, 0.0189], [75, 0.0288], [80, 0.0484], [85, 0.0823], [90, 0.144],
  [95, 0.240], [100, 0.350], [105, 0.450]
];
function interpQx(age) {
  if (age <= SSA_QX_ANCHORS[0][0]) return SSA_QX_ANCHORS[0][1];
  for (let i = 1; i < SSA_QX_ANCHORS.length; i++) {
    const [a0, q0] = SSA_QX_ANCHORS[i - 1];
    const [a1, q1] = SSA_QX_ANCHORS[i];
    if (age <= a1) {
      const t = (age - a0) / (a1 - a0);
      return Math.exp(Math.log(q0) + t * (Math.log(q1) - Math.log(q0)));
    }
  }
  return 0.5;
}
/* Country multiplier — research note §4 MODEL PARAMETERS table.
   UK x0.85 (sourced direction, judgment-call size); Egypt 1.6 at 50-60,
   1.4 at 70, 1.25 at 80+ (anchored on UN WPP 1.6% vs 0.59% at 60,
   10.9% vs 4.32% at 80). Every other country x1.0 — JUDGMENT CALL:
   no country table was sourced for them, so no invented gap is applied. */
export function countryMortalityMultiplier(country, age) {
  /* GAME DESIGN calibration (adult years 15-60), anchored on the WHO adult mortality rate (probability of dying
     between 15 and 60, both sexes, per 1000): Egypt 114, UK 74, USA 113, Turkiye 108, Germany 64, Japan 50
     (WHO Global Health Observatory indicator WHOSIS_000004; figures read from a mirror of the 2023 table, see
     https://www.who.int/data/gho/data/indicators/indicator-details/GHO/adult-mortality-rate-(probability-of-dying-between-15-and-60-years-per-1000-population)
     and https://azenha.ai/bulldozer/dataset/who-adult-mortality/). The factor is each country's figure over what the
     US-table baseline gives for the same ages (111 per 1000, both sexes). The size of each factor is my fit, not a
     published multiplier. From 60 to 70 it blends into the older-age factors below, which are unchanged. */
  const ADULT = { gbr: 0.67, egy: 1.03, usa: 1.0, tur: 0.97, deu: 0.58, jpn: 0.45 };
  const OLD = (a) => {
    if (country === 'gbr') return 0.85;
    if (country === 'egy') return a < 70 ? 1.5 : a < 80 ? 1.4 : 1.25;
    return 1.0;
  };
  const adult = ADULT[country];
  if (adult === undefined) {
    if (country === 'gbr') return 0.85;
    return OLD(age);
  }
  if (age < 60) return adult;
  if (age >= 70) return OLD(age);
  const t = (age - 60) / 10;
  return adult + (OLD(age) - adult) * t;
}
/* Sex: SSA 2023 male qx runs ~1.2x the sex average, female ~0.8x
   (e.g. age 50: male 0.51% vs female 0.30%). JUDGMENT CALL simplification. */
function sexMultiplier(gender) { return gender === 'm' ? 1.2 : gender === 'f' ? 0.8 : 1.0; }
/* Era: the research note (§7 gaps) found NO era-specific survival table and
   forbids inventing a precise era curve. The small factors below are an
   explicit JUDGMENT CALL: medicine before 1990 was plainly worse, but the
   size of the gap is a modelling choice, not a measurement. */
function eraMultiplier(year) {
  if (year < 1970) return 1.3;
  if (year < 1990) return 1.15;
  return 1.0;
}

/* Fitness -> baseline death multiplier. Research note §8: regularly active
   0.65x (HR 0.59-0.70 sourced), sedentary 1.15x. The middle bands are a
   JUDGMENT CALL interpolation on the game's 0-100 fitness score. */
export function fitnessDeathMultiplier(fitness) {
  const f = fitness == null ? 50 : fitness;
  if (f >= 70) return 0.65;
  if (f >= 55) return 0.8;
  if (f >= 40) return 1.0;
  if (f >= 25) return 1.15;
  return 1.25;
}
export function fitnessBand(fitness) {
  const f = fitness == null ? 50 : fitness;
  if (f >= 70) return 'fit';
  if (f >= 55) return 'active';
  if (f >= 40) return 'average';
  if (f >= 25) return 'sedentary';
  return 'frail';
}

export function baselineAnnualDeathProb(S) {
  const age = S.player.age;
  let q = interpQx(age)
    * sexMultiplier(S.player.gender)
    * countryMortalityMultiplier(S.country, age)
    * eraMultiplier(S.year)
    * fitnessDeathMultiplier(S.skills?.fitness);
  /* Type 2 diabetes with no complications yet: baseline x1.3 — JUDGMENT CALL
     from the sourced 6-year life-expectancy loss (research note §6). Once
     heart/kidney complications exist, those rows carry the risk instead. */
  const conds = S.medical?.conditions || [];
  const hasT2 = conds.some(c => c.id === 'type2_diabetes');
  const hasComplication = conds.some(c => ['heart_disease', 'heart_attack', 'stroke_recovery', 'ckd'].includes(c.id));
  if (hasT2 && !hasComplication) q *= 1.3;
  return Math.min(0.6, q);
}

/* --------------------------------------------------------------------------
   3. AGING — yearly health decline from 50, SLOWED by fitness.
   Research note §8: fit people decline later and slower; the 0.6-0.7x
   mortality guide is applied to the DECLINE RATE, not as a magic shield.
   Fractional decline accumulates in S.medical.agingDebt so a fit 55-year-old
   really does lose ~6 health over 10 years vs ~12 for a sedentary peer.
   Fitness itself fades ~2/yr after 50 if the player stops moving — the
   research note says the exercise benefit is gone within ~1-2 years of
   stopping (JUDGMENT CALL on the exact fade speed).
   -------------------------------------------------------------------------- */
export function agingYearlyDecline(S) {
  const age = S.player.age;
  if (!S.medical) S.medical = {};
  if (S.medical.agingDebt == null) S.medical.agingDebt = 0;
  /* Youth: gentle recovery while healthy and condition-free (unchanged). */
  if (age < 38 && (S.medical.conditions || []).length === 0 && S.player.vitals.health < 92) {
    S.player.vitals.health = clamp(S.player.vitals.health + 2);
    return 0;
  }
  if (age < 50) return 0;
  const fitness = S.skills?.fitness ?? 50;
  const band = fitnessBand(fitness);
  /* Decline-rate multiplier from fitness (JUDGMENT CALL anchored on the
     sourced 0.65x active / 1.15x sedentary mortality range). */
  const slowMult = band === 'fit' ? 0.6 : band === 'active' ? 0.75 : band === 'average' ? 1.0 : band === 'sedentary' ? 1.25 : 1.4;
  const base = age < 60 ? 1 : age < 70 ? 2 : age < 80 ? 3 : 4;
  const raw = base * slowMult;
  S.medical.agingDebt += raw;
  const whole = Math.floor(S.medical.agingDebt);
  S.medical.agingDebt -= whole;
  if (whole > 0) S.player.vitals.health = clamp(S.player.vitals.health - whole);
  /* Fitness fades if nobody is moving: not on the wellness focus and no
     gym/run/swim in the last year. The wellness focus itself already adds
     fitness every month, so it counts as active here. */
  const activeNow = S.timeBudget?.focus === 'wellness_longevity'
    || (S.medical.lastExerciseYear != null && S.year - S.medical.lastExerciseYear <= 1);
  if (!activeNow && S.skills) {
    S.skills.fitness = clamp((S.skills.fitness ?? 50) - 2);
  }
  return whole;
}

/* --------------------------------------------------------------------------
   4. CANCER — 5-year survival by stage (research note §1, sourced) and the
   annual death probability derived from it as q = 1 - S^(1/5).
   -------------------------------------------------------------------------- */
export const CANCER_5YR_SURVIVAL = {
  breast_cancer: { I: 0.99, II: 0.93, III: 0.72, IV: 0.30 },
  lung_cancer: { I: 0.80, II: 0.56, III: 0.25, IV: 0.10 },
  colon_cancer: { I: 0.90, II: 0.85, III: 0.65, IV: 0.10 },
  cervical_cancer: { I: 0.92, II: 0.68, III: 0.40, IV: 0.21 },
  prostate_cancer: { I: 1.0, II: 1.0, III: 0.95, IV: 0.35 },
  /* Leukemia: no stage table in the research note — 0.55 is a JUDGMENT CALL. */
  leukemia: { I: 0.55, II: 0.55, III: 0.55, IV: 0.55 }
};
export const CANCER_TREATED_ANNUAL = {
  breast_cancer: { I: 0.002, II: 0.015, III: 0.06, IV: 0.20 },
  lung_cancer: { I: 0.04, II: 0.11, III: 0.24, IV: 0.37 },
  colon_cancer: { I: 0.02, II: 0.03, III: 0.08, IV: 0.37 },
  cervical_cancer: { I: 0.02, II: 0.08, III: 0.15, IV: 0.28 },
  prostate_cancer: { I: 0.002, II: 0.002, III: 0.01, IV: 0.19 },
  leukemia: { I: 0.20, II: 0.20, III: 0.20, IV: 0.20 }
};
/* Untreated cancer: no published by-stage table exists (research note gaps).
   JUDGMENT CALL from the note's MODEL PARAMETERS: treated x3 for stages
   I-II, x1.5 for III-IV, capped at 60%/yr. */
function untreatedCancerAnnual(id, stage) {
  const t = (CANCER_TREATED_ANNUAL[id] || CANCER_TREATED_ANNUAL.leukemia)[stage] ?? 0.2;
  const mult = (stage === 'I' || stage === 'II') ? 3 : 1.5;
  return Math.min(0.6, t * mult);
}

/* Staging at diagnosis. The research mechanism (§7): wealth/access does NOT
   buy survival directly — it buys EARLIER diagnosis, and stage does the work.
   The game's observable proxy for that is recent checkups: a checkup in the
   last 2 years finds it early; no checkup in 5+ years finds it late. The
   weights are a JUDGMENT CALL. */
export function assignStage(S, cond) {
  if (!isCancer(cond.id)) {
    if (cond.id === 'dementia') cond.stage = 'early';
    else if (cond.id === 'copd') cond.stage = 'GOLD 2';
    else if (cond.id === 'ckd') cond.stage = 'stage 3';
    else if (cond.id === 'heart_disease') cond.stage = 'stable';
    else cond.stage = null;
    return cond.stage;
  }
  const last = S.medical?.lastCheckupYear;
  const gap = last == null ? 99 : S.year - last;
  let w;
  if (gap <= 2) w = [0.45, 0.30, 0.18, 0.07];
  else if (gap <= 5) w = [0.30, 0.30, 0.25, 0.15];
  else w = [0.15, 0.25, 0.35, 0.25];
  const r = mortRand(S);
  let acc = 0;
  const stages = ['I', 'II', 'III', 'IV'];
  let stage = 'IV';
  for (let i = 0; i < 4; i++) { acc += w[i]; if (r < acc) { stage = stages[i]; break; } }
  cond.stage = stage;
  return stage;
}

/* --------------------------------------------------------------------------
   5. TREATMENT — one function, used by the diagnosis scene AND the Medical
   tab. Success = 5-year survival for the cancer/stage, adjusted for age
   (research note §2: the age penalty hits hardest in year 1), frailty
   (fitness, not age alone — research note §7), care route and era.
   Private vs public: the note found NO study showing a private building
   beats a public one for the same patient. The modelled difference is
   small and explicit: public care is far cheaper but slower / less complete
   (x0.95 success — JUDGMENT CALL, deprivation-gap mechanism), private is
   immediate and full. Insurance cuts the private bill.
   -------------------------------------------------------------------------- */
export function treatmentCostLocal(S, cond, care) {
  const baseUsd = cond.treatmentUsd2026 ?? MEDICAL_CONDITIONS.find(c=>c.id===cond.id)?.treatmentUsd2026 ?? 8500;
  let usd = baseUsd;
  if (care === 'public') {
    const cObj = getCountry(S.country);
    usd = baseUsd * 0.22 * (1 - (cObj.healthcare?.publicCoveragePct || 0) * 0.7);
  } else {
    /* v2.9 — the charge follows the cover you actually hold, and the
       Medical tab states exactly this rule: a private policy
       (S.insurance.health) pays about a quarter of the private bill; any
       other confirmed cover — an employer plan or the public system
       (S.medical.healthInsurance, the ONE cover flag) — pays about 45%
       off; with no confirmed cover (typical cover in the USA, limited
       cover in Egypt, or unemployed) the bill is charged IN FULL. Being
       merely employed gives no discount.
       v2.12 — hospital staff are the one exception to "merely employed
       gives no discount": staff treatment at your own hospital
       (staffTreatmentEligible — medicine / nursing jobs) cuts your own
       private bill to about a quarter, the same depth as a private
       policy, and it is checked before the employer-plan rate so staff
       are never charged the worse rate. The Medical tab states this too,
       and the diagnosis scene charges the same factor. */
    if (S.insurance?.health) usd *= 0.25;
    else if (staffTreatmentEligible(S)) usd *= 0.25;
    else if (S.medical?.healthInsurance) usd *= 0.55;
  }
  return Math.max(0, Math.round(convertCurrency(usd, 'usa', S.country, S.year)));
}

export function treatmentSuccessProb(S, cond, care) {
  const age = S.player.age;
  const fitness = S.skills?.fitness ?? 50;
  const band = fitnessBand(fitness);
  /* Frailty factor — JUDGMENT CALL anchored on sourced chemo completion
     (95% under 70, 90% at 70-79, 74% at 80+): fit x1.0, active x0.95,
     average x0.85, sedentary x0.75, frail x0.6. */
  const frailMult = band === 'fit' ? 1.0 : band === 'active' ? 0.95 : band === 'average' ? 0.85 : band === 'sedentary' ? 0.75 : 0.6;
  /* Era: modern survival figures overstate 1960s-80s treatment — JUDGMENT
     CALL (research note gap 3: no historical stage table was found). */
  const eraMult = S.year < 1970 ? 0.6 : S.year < 1990 ? 0.75 : S.year < 2010 ? 0.9 : 1.0;
  const careMult = care === 'public' ? 0.95 : 1.0;
  if (isCancer(cond.id)) {
    const stage = cond.stage || 'II';
    let p = (CANCER_5YR_SURVIVAL[cond.id] || CANCER_5YR_SURVIVAL.leukemia)[stage] ?? 0.5;
    /* First-year age penalty (sourced direction, §2): breast/prostate ~2pts
       at 75-84, colon 6pts localised / 27pts distant, lung ~10-15pts. */
    if (age >= 75) {
      const pen = cond.id === 'breast_cancer' || cond.id === 'prostate_cancer' ? 0.02
        : cond.id === 'colon_cancer' ? (stage === 'IV' ? 0.27 : stage === 'I' ? 0.06 : 0.15)
        : 0.12;
      p = Math.max(0.02, p - pen);
    } else if (age >= 65) {
      p = Math.max(0.02, p - 0.03);
    }
    return clamp(p * frailMult * eraMult * careMult, 0.02, 0.99);
  }
  if (cond.id === 'dementia') {
    /* No cure exists for dementia. "Success" here means management that
       slows the decline. 0.55 is a JUDGMENT CALL. */
    return clamp(0.55 * frailMult * careMult, 0.05, 0.8);
  }
  /* Heart disease / post heart attack / stroke / COPD / CKD: a course of
     treatment that gets the condition properly controlled. Base rates are
     JUDGMENT CALLS anchored on the sourced annual risks in §3/§6. */
  const base = { heart_disease: 0.78, heart_attack: 0.72, stroke_recovery: 0.65, copd: 0.7, ckd: 0.6 }[cond.id] ?? 0.65;
  return clamp(base * frailMult * eraMult * careMult, 0.05, 0.95);
}

export function treatmentOptions(S, cond) {
  return ['private', 'public'].map(care => ({
    care,
    cost: treatmentCostLocal(S, cond, care),
    successProb: treatmentSuccessProb(S, cond, care)
  }));
}
export function oddsInWords(p) {
  const n = Math.round(p * 10);
  return `about ${n} in 10 people in your situation recover with this treatment`;
}

/* Advance a cancer one stage (used on failed treatment / long neglect). */
function advanceStage(cond) {
  if (!isCancer(cond.id)) return;
  const order = ['I', 'II', 'III', 'IV'];
  const i = order.indexOf(cond.stage || 'II');
  cond.stage = order[Math.min(3, i + 1)];
}

/* Run one treatment course. Returns { ok, outcome, msg }. The outcome is
   rolled from the research numbers — chemotherapy can work or not, and both
   outcomes genuinely happen. Outcomes: remission | treated | partial | failed. */
export function runDiseaseTreatment(S, condId, care, opts = {}) {
  const cond = (S.medical?.conditions || []).find(c => c.id === condId);
  if (!cond) return { ok: false, msg: 'That condition is no longer active.' };
  if (!isSeriousCondition(cond.id)) return { ok: false, msg: 'That condition does not need a specialist course.' };
  if(!['private','public'].includes(care))return {ok:false,msg:'Choose public hospital or private specialist care.'};
  if(cond.treatmentStatus==='treated')return {ok:false,msg:'This condition is controlled. Continue the ongoing care, no repeat course needed now.'};
  if(cond.lastTreatmentPeriod===S.year*12+S.month)return {ok:false,msg:'This treatment course is already recorded this month. Review another course next month.'};
  const cost = opts.free ? 0 : treatmentCostLocal(S, cond, care);
  if (cost > 0 && S.money.cash < cost) {
    return { ok: false, msg: `Need ${formatMoney(cost, S.country)} for this treatment.` };
  }
  if (cost > 0) {
    walletMove(S, -cost, `${care === 'private' ? 'Private specialist' : 'Public hospital'} treatment: ${cond.label}`, 'medical');
  }
  cond.lastTreatmentPeriod=S.year*12+S.month;
  const p = treatmentSuccessProb(S, cond, care);
  const label = cond.label;
  const stageTxt = cond.stage ? ` (stage ${cond.stage})` : '';
  const chemoWord = isCancer(cond.id) ? 'The chemotherapy course' : 'The treatment course';
  const roll = mortRand(S);
  if (roll < p) {
    if (isCancer(cond.id)) {
      S.medical.conditions = S.medical.conditions.filter(c => c.id !== cond.id);
      if (!S.medical.cancerHistory) S.medical.cancerHistory = [];
      S.medical.cancerHistory.push({ id: cond.id, label, stage: cond.stage, year: S.year, outcome: 'remission' });
      S.player.vitals.health = clamp(S.player.vitals.health + 10);
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 6);
      recordJournal(S, `${chemoWord} worked. After months of treatment your ${label.toLowerCase()}${stageTxt} is in remission — the scans are clear. You will need checkups for years, because it can come back.`, 'health');
      return { ok: true, outcome: 'remission', msg: `${chemoWord} worked — ${label} is in remission.` };
    }
    cond.treatmentStatus = 'treated';
    cond.managed = true;
    cond.yearsTreated = 0;
    S.player.vitals.health = clamp(S.player.vitals.health + 6);
    recordJournal(S, `${chemoWord} worked. Your ${label.toLowerCase()}${stageTxt} is now properly controlled with ongoing care.`, 'health');
    return { ok: true, outcome: 'treated', msg: `${chemoWord} worked — ${label} is now controlled.` };
  }
  /* Failed the success roll: partial response vs outright failure. */
  if (mortChance(S, 0.5)) {
    cond.treatmentStatus = 'partial';
    cond.managed = true;
    S.player.vitals.health = clamp(S.player.vitals.health + 2);
    recordJournal(S, `${chemoWord} helped, but did not clear your ${label.toLowerCase()}${stageTxt}. It is held back for now — you will need another round later.`, 'health');
    return { ok: true, outcome: 'partial', msg: `${chemoWord} helped only partly — ${label} is held back, not cleared.` };
  }
  advanceStage(cond);
  cond.treatmentStatus = 'failed';
  cond.managed = false;
  S.player.vitals.health = clamp(S.player.vitals.health - 6);
  recordJournal(S, `${chemoWord} did not work. Your ${label.toLowerCase()}${cond.stage ? ` has advanced to stage ${cond.stage}` : ' has worsened'} — the doctors want to try a different course if you can pay for it.`, 'health');
  return { ok: true, outcome: 'failed', msg: `${chemoWord} did not work — ${label} has worsened.` };
}

/* --------------------------------------------------------------------------
   6. DISEASE DEATH PROBABILITY (annual, per condition).
   Mental conditions: ~0 direct death risk — stress/depression alone must
   never kill at 51. Hypertension progresses gradually (see
   maybeProgressHypertension), it is not a fast track to a fatal heart attack.
   -------------------------------------------------------------------------- */
export function diseaseAnnualDeathProb(S, cond) {
  const age = S.player.age;
  const status = cond.treatmentStatus || (cond.managed ? 'treated' : 'untreated');
  const treated = status === 'treated';
  const partial = status === 'partial';
  if (['anxiety', 'depression', 'severe_depression', 'panic_disorder', 'bipolar'].includes(cond.id)) return 0;
  if (cond.id === 'hypertension') return treated ? 0.002 : partial ? 0.005 : 0.008;
  if (isCancer(cond.id)) {
    const stage = cond.stage || 'II';
    const t = (CANCER_TREATED_ANNUAL[cond.id] || CANCER_TREATED_ANNUAL.leukemia)[stage] ?? 0.2;
    if (treated) return t;
    if (partial) return Math.min(0.6, (t + untreatedCancerAnnual(cond.id, stage)) / 2);
    return untreatedCancerAnnual(cond.id, stage);
  }
  if (cond.id === 'heart_disease') return treated ? 0.015 : partial ? 0.025 : 0.04;
  if (cond.id === 'heart_attack') {
    /* Sourced §3: ~5-10% die in year 1 with prompt care, ~3%/yr after. */
    const firstYear = S.year - (cond.sinceYear || S.year) <= 0;
    if (treated) return firstYear ? 0.08 : 0.03;
    if (partial) return firstYear ? 0.12 : 0.05;
    return firstYear ? 0.2 : 0.08;
  }
  if (cond.id === 'stroke_recovery') {
    /* Sourced §3: ~20% die in the first year, then baseline x~1.5. */
    const firstYear = S.year - (cond.sinceYear || S.year) <= 0;
    if (firstYear) return treated ? 0.18 : 0.22;
    return treated ? 0.02 : 0.035;
  }
  if (cond.id === 'copd') return treated ? 0.02 : partial ? 0.03 : 0.045;
  if (cond.id === 'ckd') return treated ? 0.04 : partial ? 0.06 : 0.09;
  if (cond.id === 'dementia') {
    /* Sourced §5: median survival after diagnosis is an ALL-CAUSE figure
       (women 8.9yr at 60, 8.0 at 65, ~5.4 at 80, 4.5 at 85; men 6.5, 5.7,
       ~3.0, 2.2). So the dementia rate below is the TOTAL annual rate for a
       patient, and the disease roll must only carry the EXCESS over the
       baseline — otherwise baseline deaths get double-counted and dementia
       wins far more death races than it should. */
    const a = cond.ageAtDiagnosis != null ? cond.ageAtDiagnosis : age;
    const female = S.player.gender === 'f';
    let total;
    if (a >= 85) total = female ? 0.143 : 0.27;
    else if (a >= 80) total = female ? 0.12 : 0.206;
    else if (a >= 70) total = female ? 0.083 : 0.114;
    else total = female ? 0.075 : 0.101;
    return Math.max(0.02, total - baselineAnnualDeathProb(S));
  }
  /* Non-chronic (acute) conditions: the data file's flat rate is an acute
     risk, not a lifetime one. A childhood appendicitis or a hernia that was
     never removed from the record must not keep killing at 5%/yr for
     decades — after 2 years it has resolved or been dealt with, and the
     residual risk is tiny. JUDGMENT CALL. */
  if (!cond.chronic && cond.sinceYear != null && (S.year - cond.sinceYear) >= 2) {
    const base = (cond.deathRiskPerYear || 0) * (cond.managed ? 0.35 : 1.0);
    return base > 0 ? 0.001 : 0;
  }
  /* Everything else: keep the data file's flat rate, halved-ish when managed
     (the old 0.35 multiplier), as before. */
  const flat = (cond.deathRiskPerYear || 0) * (cond.managed ? 0.35 : 1.0);
  /* GAME DESIGN: a lasting condition on the generic flat rate adds at most twice the ordinary death risk for the
     age (about three times in total). The flat figures (1 to 2 percent a year for diabetes, epilepsy, an
     arrhythmia) were added on top of the baseline at every age, which killed people in their 30s and 40s at
     many times the real excess. Serious diseases with their own staged rows are unchanged. */
  if (cond.chronic) return Math.min(flat, 2 * baselineAnnualDeathProb(S));
  return flat;
}

/* Hypertension, left unmanaged for years, slowly becomes heart disease —
   over YEARS, not months. Managed hypertension never progresses. */
export function maybeProgressHypertension(S) {
  const conds = S.medical?.conditions || [];
  const hyp = conds.find(c => c.id === 'hypertension');
  if (!hyp) return;
  if (hyp.managed || hyp.treatmentStatus === 'treated') { hyp.yearsUnmanaged = 0; return; }
  hyp.yearsUnmanaged = (hyp.yearsUnmanaged || 0) + 1;
  if (hyp.yearsUnmanaged >= 5 && mortChance(S, 0.06)) {
    S.medical.conditions = conds.filter(c => c.id !== 'hypertension');
    S.medical.conditions.push({
      id: 'heart_disease', label: 'Coronary Heart Disease', severity: 'severe',
      chronic: false, sinceYear: S.year, managed: false, treatmentStatus: 'untreated',
      stage: 'stable', annualHealthHit: 8, annualHappinessHit: 5, deathRiskPerYear: 0.06
    });
    recordJournal(S, `Years of untreated high blood pressure have worn down your heart — doctors now diagnose coronary heart disease.`, 'health');
  }
}

/* Untreated cancers advance a stage in roughly 1 year in 4 — JUDGMENT CALL.
   Remission can recur: ~2%/yr for a cancer in remission — JUDGMENT CALL. */
export function progressUntreatedDiseases(S) {
  for (const cond of [...(S.medical?.conditions || [])]) {
    const status = cond.treatmentStatus || (cond.managed ? 'treated' : 'untreated');
    if (isCancer(cond.id) && status === 'untreated' && mortChance(S, 0.25)) {
      advanceStage(cond);
      recordJournal(S, `Without treatment, your ${cond.label.toLowerCase()} has advanced to stage ${cond.stage}.`, 'health');
    }
    if (cond.id === 'dementia') {
      const yrs = S.year - (cond.sinceYear || S.year);
      cond.stage = yrs >= 6 ? 'advanced' : yrs >= 3 ? 'moderate' : 'early';
    }
    if (cond.treatmentStatus === 'treated') cond.yearsTreated = (cond.yearsTreated || 0) + 1;
  }
  for (const h of [...(S.medical?.cancerHistory || [])]) {
    if (h.outcome === 'remission' && mortChance(S, 0.02)) {
      S.medical.cancerHistory = S.medical.cancerHistory.filter(x => x !== h);
      S.medical.conditions.push({
        id: h.id, label: h.label, severity: 'severe', chronic: false,
        sinceYear: S.year, managed: false, treatmentStatus: 'untreated',
        stage: h.stage || 'II', annualHealthHit: 8, annualHappinessHit: 6, deathRiskPerYear: 0.15
      });
      recordJournal(S, `At a routine checkup the doctors find your ${h.label.toLowerCase()} has come back.`, 'health');
    }
  }
}

/* Dementia onset probability per year — JUDGMENT CALL anchored on the
   prevalence ladder in research note §5 (~1 in 3 over-85s have it). */
export function dementiaOnsetProb(age) {
  if (age < 65) return 0;
  if (age < 70) return 0.003;
  if (age < 75) return 0.006;
  if (age < 80) return 0.012;
  if (age < 85) return 0.025;
  if (age < 90) return 0.05;
  return 0.08;
}

/* --------------------------------------------------------------------------
   7. CAUSE-BASED MORTALITY ROLL.
   Components are rolled in order — accident, then the worst disease, then
   baseline old age — so every death carries a SPECIFIC cause on
   S.player.deathCause. The generic "following health complications" is gone;
   "old age" is used only when nothing else applies at a high age.
   Health at 2 or below adds a 10% annual risk (JUDGMENT CALL — the old
   +45% had no source) with the worst condition, or organ failure, as cause.
   -------------------------------------------------------------------------- */
const ACCIDENT_ANNUAL_PROB = 0.0006; /* JUDGMENT CALL: small accident baseline. */

export function rollMortality(S) {
  const age = S.player.age;
  if (age < 20 || S.gameOver) return null;
  const conds = S.medical?.conditions || [];
  /* Accident first — rare, specific cause. */
  if (mortChance(S, ACCIDENT_ANNUAL_PROB)) {
    return { died: true, cause: 'in a car accident' };
  }
  /* Disease: each condition rolls independently; the worst one that hits
     is the cause. (Independent rolls, highest-risk first.) */
  /* GAME DESIGN: a condition diagnosed this same year cannot kill this year. The diagnosis scene is only just queued, so the player must get a turn to respond first. */
  const ranked = [...conds]
    .filter(c => c.sinceYear !== S.year)
    .map(c => ({ cond: c, p: diseaseAnnualDeathProb(S, c) }))
    .filter(x => x.p > 0)
    .sort((a, b) => b.p - a.p);
  for (const { cond, p } of ranked) {
    if (mortChance(S, p)) {
      const stageTxt = cond.stage ? ` (stage ${cond.stage})` : '';
      const cause = cond.id === 'heart_attack' ? 'of a heart attack'
        : cond.id === 'stroke_recovery' ? 'of a stroke'
        : `of ${cond.label.toLowerCase()}${stageTxt}`;
      return { died: true, cause };
    }
  }
  /* Critical health: the body gives out — worst condition or organ failure.
     Only a condition carrying a real risk (>=1%/yr) is named as the cause;
     a 0.1% residual risk (e.g. an old hernia) must never be blamed. */
  if (S.player.vitals.health <= 2) {
    if (mortChance(S, 0.10)) {
      const real = ranked.filter(x => x.p >= 0.01);
      if (real.length) {
        const c = real[0].cond;
        const stageTxt = c.stage ? ` (stage ${c.stage})` : '';
        return { died: true, cause: `of ${c.label.toLowerCase()}${stageTxt} after years of failing health` };
      }
      return { died: true, cause: 'of organ failure after years of failing health' };
    }
  }
  /* Baseline old age, from the real life table. */
  if (mortChance(S, baselineAnnualDeathProb(S))) {
    if (age >= 85) return { died: true, cause: 'peacefully of old age' };
    const real = ranked.filter(x => x.p >= 0.01);
    if (real.length) {
      const c = real[0].cond;
      return { died: true, cause: `of ${c.label.toLowerCase()}${c.stage ? ` (stage ${c.stage})` : ''}` };
    }
    return { died: true, cause: age >= 75 ? 'peacefully of old age' : 'of a sudden illness' };
  }
  return null;
}

/* --------------------------------------------------------------------------
   8. AGING SIGNS AS LIVED EVENTS — one per year at most, cooldown-guarded
   (5 years between repeats of the same sign, max 3 times per life), all
   randomness through the seeded RNG. Bands from research note §8:
   stairs late 50s-60s (sedentary) / late 60s-70s (active); memory lapses
   50s-60s occasional, 70s-80s frequent; joint pain late 40s-50s first,
   60s-70s daily. Each choice has a REAL effect.
   -------------------------------------------------------------------------- */
const AGING_SIGNS = [
  {
    id: 'aging_stairs', title: 'The Stairs Feel Heavy',
    minAge: 55,
    prob: (S) => {
      const age = S.player.age;
      const base = age < 65 ? 0.10 : age < 75 ? 0.20 : 0.30;
      const f = S.skills?.fitness ?? 50;
      return base * (f >= 70 ? 0.5 : f < 40 ? 1.5 : 1.0);
    },
    text: (S) => `Climbing the stairs to your flat leaves you winded in a way it never used to. You stop on the landing, hand on the rail, catching your breath — and realise your legs are not what they were.`,
    choices: () => ([
      {
        label: 'Start taking the stairs every day and walk more (+fitness)',
        effect: (st) => {
          st.skills.fitness = clamp((st.skills?.fitness ?? 50) + 5);
          st.player.vitals.health = clamp(st.player.vitals.health + 2);
          if (!st.medical) st.medical = {};
          st.medical.lastExerciseYear = st.year;
          recordJournal(st, `You started taking the stairs on purpose every day. Your legs complained for a fortnight, then stopped complaining.`, 'health');
        }
      },
      {
        label: 'See a doctor about the breathlessness',
        effect: (st) => {
          if (!st.medical) st.medical = {};
          st.medical.lastCheckupYear = st.year;
          st.player.vitals.health = clamp(st.player.vitals.health + 3);
          recordJournal(st, `A doctor checked your heart and lungs after the stairs left you winded — nothing urgent, but a warning to move more.`, 'health');
        }
      },
      {
        label: 'Ignore it — you are just having a tired week',
        effect: (st) => {
          st.player.vitals.health = clamp(st.player.vitals.health - 2);
          recordJournal(st, `You told yourself the heavy stairs were just a tired week. They were not.`, 'health');
        }
      }
    ])
  },
  {
    id: 'aging_gym_nudge', title: 'You Need to Hit the Gym',
    minAge: 50,
    prob: (S) => ((S.skills?.fitness ?? 50) < 55 ? 0.12 : 0),
    text: (S) => `A friend your age who started lifting last year looks a decade younger than you feel. Your back aches getting out of a chair, and you catch yourself thinking: if I do not start moving now, when?`,
    choices: () => ([
      {
        label: 'Join a gym and make it a weekly habit (+fitness, slower aging)',
        effect: (st) => {
          st.skills.fitness = clamp((st.skills?.fitness ?? 50) + 6);
          st.player.vitals.health = clamp(st.player.vitals.health + 3);
          st.timeBudget = st.timeBudget || {};
          st.timeBudget.focus = 'wellness_longevity';
          if (!st.medical) st.medical = {};
          st.medical.lastExerciseYear = st.year;
          recordJournal(st, `You joined a gym and set your weekly rhythm around training, sleep and proper food. Your body noticed within weeks.`, 'health');
        }
      },
      {
        label: 'Start with daily walks instead — free, and you will actually do it',
        effect: (st) => {
          st.skills.fitness = clamp((st.skills?.fitness ?? 50) + 3);
          st.player.vitals.health = clamp(st.player.vitals.health + 1);
          if (!st.medical) st.medical = {};
          st.medical.lastExerciseYear = st.year;
          recordJournal(st, `You started walking every day after dinner. Small, but your knees and your sleep both improved.`, 'health');
        }
      },
      {
        label: 'Put it off — the gym can wait another year',
        effect: (st) => {
          st.skills.fitness = clamp((st.skills?.fitness ?? 50) - 2);
          st.player.vitals.health = clamp(st.player.vitals.health - 1);
          recordJournal(st, `You put the gym off for another year. Your body kept the receipt.`, 'health');
        }
      }
    ])
  },
  {
    id: 'aging_memory', title: 'Forgetting Names',
    minAge: 65,
    prob: (S) => {
      const age = S.player.age;
      const base = age < 75 ? 0.08 : age < 85 ? 0.14 : 0.20;
      return base * (S.player.vitals.health < 50 ? 1.5 : 1.0);
    },
    text: (S) => {
      const hasDem = (S.medical?.conditions || []).some(c => c.id === 'dementia');
      return hasDem
        ? `You walk into a room and stand there, blank, with no idea why you came in. It is happening more often now, and the names of people you have known for years sometimes slip away mid-sentence.`
        : `You walk into a room and stand there, blank, with no idea why you came in. A neighbour's name — someone you have known for years — slips away mid-sentence. It frightens you more than you admit.`;
    },
    choices: () => ([
      {
        label: 'See a doctor and get your memory properly checked',
        effect: (st) => {
          if (!st.medical) st.medical = {};
          st.medical.lastCheckupYear = st.year;
          st.player.vitals.health = clamp(st.player.vitals.health + 2);
          const hasDem = (st.medical.conditions || []).some(c => c.id === 'dementia');
          if (!hasDem && st.player.age >= 68 && mortChance(st, 0.30)) {
            st.medical.conditions.push({
              id: 'dementia', label: "Alzheimer's Disease", severity: 'severe', chronic: true,
              sinceYear: st.year, managed: true, treatmentStatus: 'treated', stage: 'early',
              ageAtDiagnosis: st.player.age, annualHealthHit: 4, annualHappinessHit: 4, deathRiskPerYear: 0.10
            });
            recordJournal(st, `The memory clinic confirmed early Alzheimer's disease. There is no cure, but treatment and routine can slow it down.`, 'health');
          } else {
            recordJournal(st, `A doctor ran memory tests — normal age-related lapses for now, but they told you to come back the moment it gets worse.`, 'health');
          }
        }
      },
      {
        label: 'Start doing crosswords and memory exercises every morning',
        effect: (st) => {
          st.player.vitals.smarts = clamp(st.player.vitals.smarts + 2);
          st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
          recordJournal(st, `You started a morning routine of crosswords and memory exercises. The lapses did not vanish, but they stopped getting worse so fast.`, 'health');
        }
      },
      {
        label: 'Laugh it off — everyone forgets things at your age',
        effect: (st) => {
          st.player.vitals.stress = clamp(st.player.vitals.stress + 3);
          recordJournal(st, `You laughed the forgotten names off. Some nights, alone, you do not find it funny.`, 'health');
        }
      }
    ])
  },
  {
    id: 'aging_knees', title: 'Your Knees Ache Every Morning',
    minAge: 48,
    prob: (S) => {
      const age = S.player.age;
      const base = age < 60 ? 0.10 : 0.18;
      const f = S.skills?.fitness ?? 50;
      return base * (f < 40 ? 1.5 : 1.0);
    },
    text: (S) => `Your knees have started aching every morning, stiff for the first half hour, and going down stairs hurts more than going up. The cold weather makes it worse.`,
    choices: () => ([
      {
        label: 'Start physiotherapy and gentle strength work (+health, +fitness)',
        effect: (st) => {
          st.player.vitals.health = clamp(st.player.vitals.health + 3);
          st.skills.fitness = clamp((st.skills?.fitness ?? 50) + 2);
          recordJournal(st, `Physiotherapy and gentle strength work loosened your knees up — mornings are easier now.`, 'health');
        }
      },
      {
        label: 'Take painkillers when it flares up',
        effect: (st) => {
          st.player.vitals.health = clamp(st.player.vitals.health + 1);
          st.player.vitals.stress = clamp(st.player.vitals.stress - 2);
          recordJournal(st, `You keep painkillers in the cupboard for bad knee days. They help the pain, not the cause.`, 'health');
        }
      },
      {
        label: 'Just live with it',
        effect: (st) => {
          st.player.vitals.health = clamp(st.player.vitals.health - 2);
          st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
          recordJournal(st, `You decided to just live with the aching knees. Some mornings that decision feels heavier than others.`, 'health');
        }
      }
    ])
  },
  {
    id: 'aging_eyesight', title: 'Your Eyesight Is Fading',
    minAge: 60,
    prob: () => 0.10,
    text: (S) => `Reading a menu in a dim restaurant has become a performance: arm stretched out, phone torch on, squinting. Small print swims, and driving at night feels less safe than it used to.`,
    choices: () => ([
      {
        label: 'Get your eyes tested and buy proper glasses',
        effect: (st) => {
          st.player.vitals.health = clamp(st.player.vitals.health + 2);
          st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
          recordJournal(st, `New glasses. The world came back into focus — you had forgotten how sharp it used to look.`, 'health');
        }
      },
      {
        label: 'Buy cheap reading glasses from the pharmacy',
        effect: (st) => {
          st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
          recordJournal(st, `Cheap reading glasses from the pharmacy — good enough for menus, not for night driving.`, 'health');
        }
      },
      {
        label: 'Squint and carry on',
        effect: (st) => {
          st.player.vitals.happiness = clamp(st.player.vitals.happiness - 3);
          recordJournal(st, `You keep squinting at menus and road signs, pretending your eyes are fine.`, 'health');
        }
      }
    ])
  },
  {
    id: 'aging_hearing', title: 'You Keep Asking People to Repeat Themselves',
    minAge: 70,
    prob: () => 0.10,
    text: (S) => `In a busy room you catch half of what people say. Your grandchildren mumble, apparently. The television volume creeps up a notch every few months, and your family has started noticing.`,
    choices: () => ([
      {
        label: 'Get a hearing test and try a hearing aid',
        effect: (st) => {
          st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
          st.player.vitals.health = clamp(st.player.vitals.health + 1);
          recordJournal(st, `A hearing test and a small hearing aid — suddenly the grandchildren do not mumble any more.`, 'health');
        }
      },
      {
        label: 'Ask everyone to speak up and sit closer',
        effect: (st) => {
          st.player.vitals.happiness = clamp(st.player.vitals.happiness + 1);
          recordJournal(st, `You ask people to speak up and take the chair nearest the speaker. It works, mostly.`, 'health');
        }
      },
      {
        label: 'Nod along and pretend you heard',
        effect: (st) => {
          st.player.vitals.happiness = clamp(st.player.vitals.happiness - 2);
          recordJournal(st, `You nod along to conversations you only half heard, and hope nobody asks your opinion.`, 'health');
        }
      }
    ])
  }
];

/* A pending aging-sign decision is rebuilt from its saved key, base id and text after a reload, so a saved game keeps the decision (the per-life count and cooldown were already spent when it was queued). */
export function restoreAgingSignScene(S, saved) {
  const sign = saved && /^aging_/.test(saved.baseId || '') ? AGING_SIGNS.find(x => x.id === saved.baseId) : null;
  if (!sign || !S || S.gameOver || !saved.key) return null;
  return { key: saved.key, baseId: sign.id, maxPerLife: 3, category: 'health', title: sign.title, text: saved.text || sign.text(S), choices: sign.choices() };
}

export function maybeQueueAgingSign(S, queueScene) {
  if (!S || S.gameOver) return false;
  const age = S.player.age;
  if (age < 48) return false;
  if (!S.medical) S.medical = {};
  if (!S.medical.agingCooldowns) S.medical.agingCooldowns = {};
  if (!S.sceneCounts) S.sceneCounts = {};
  for (const sign of AGING_SIGNS) {
    if (age < sign.minAge) continue;
    if ((S.sceneCounts[sign.id] || 0) >= 3) continue;
    if ((S.medical.agingCooldowns[sign.id] || 0) > S.year) continue;
    if (!mortChance(S, sign.prob(S))) continue;
    const scene = {
      key: `${sign.id}_${S.year}`,
      baseId: sign.id,
      maxPerLife: 3,
      category: 'health',
      title: sign.title,
      text: sign.text(S),
      choices: sign.choices()
    };
    const queued = queueScene(S, scene);
    if (queued) {
      S.medical.agingCooldowns[sign.id] = S.year + 5;
      return true;
    }
  }
  return false;
}
