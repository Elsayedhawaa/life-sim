/* ============================================================================
   World Life 2.0 — v2.18 Worker 2: Career consequences (spec §3).
   A career failure reaches the rest of the life, and the world reaches
   the career — in plain words, through the real systems, never as a
   silent number change.

   JOB LOSS (checkCareerConsequences, called once a month AFTER the
   settlement — the coordinator wires it next to checkBusinessFate in
   gameLoop advanceSingleTurn; see the insertion point at the bottom
   of this file). The transition is detected here: employed last
   month, not employed now (S.career._lastMonthEmployed, kept on the
   career record). Retirement is not a job loss. Each reaction is a
   real scene in the event engine's own shape, queued with queueScene:
     - mortgage: the bank writes about the home loan / instalments.
       A property with monthsLeft > 0 is the mortgage: pay the next
       instalment early from savings (real walletMove, real monthsLeft
       −1), or ask the bank for a 3-month payment holiday (real flag
       prop.paymentHolidayUntil, which the settlement honours — see
       economyEngine §D3 instalment block), or do nothing.
     - spouse: reacts to the lost income — tighten the belt together
       (real: lifestyleMode becomes frugal, the system the Finance
       tab already reads) or carry on as normal.
     - children: notice, and are told honestly or shielded — the
       relationship records move, in the open, on the scene.
     - visa: only where the permit depends on employment (work_visa,
       gulf_iqama, post_study_work). The scene states the real status
       — kind, sponsor, expiry, grace months left — and warns that a
       new sponsor is the only fix. Citizens and permanent residents
       get no visa scene: their status does not depend on the job.

   CRISIS YEARS (a crisis = a world event hitting the player's
   country with businessRevenue < 1, read from worldEvents.js):
     - a warning scene fires at the START of the crisis year, BEFORE
       anything bad happens: headhunters call less, pay is frozen,
       redundancies are coming. The pay freeze is real: the job
       record carries payFrozenUntilYear (to the crisis's end year)
       and the yearly merit rise / raise negotiation refuse while it
       lasts (careerEducationEngine, careerMarket).
     - redundancy is a real monthly risk DURING the crisis, but only
       after the warning has fired in an earlier month — the player
       is never made redundant by a crisis they were not warned
       about. Redundancy pays real severance (noticeAndSeveranceFor,
       the same table the dismissal path uses) and the job-loss
       reactions above fire for it in the same monthly check.

   RNG: this system has its OWN seeded stream (S.careerConsequencesRng,
   derived from the life seed like v2.15's career-market stream), so
   the redundancy roll never shifts the game's main stream.
   ========================================================================== */

import { clamp, hashSeed } from '../core/rng.js';
import { recordJournal, walletMove, queueScene, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { convertCurrency, noticeAndSeveranceFor } from '../data/economy.js';
import { activeWorldEvents, worldEventEffects } from './worldEvents.js';
import { spouseOf } from './businessFate.js';

/* ------------------------------------------------------------------ */
/* Own RNG stream (see header).                                        */
/* ------------------------------------------------------------------ */

function ccRand(S) {
  if (typeof S.careerConsequencesRng !== 'number') {
    S.careerConsequencesRng = hashSeed(String(S.seed ?? 'world-life-2') + ':career-consequences');
  }
  let t = (S.careerConsequencesRng = (S.careerConsequencesRng + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function ccChance(S, p) { return ccRand(S) < p; }

function monthIndex(S) {
  return (Number(S.year) || 0) * 12 + (Number(S.month) || 1);
}

function shiftAffection(p, delta) {
  if (!p) return;
  if (!p.rel || typeof p.rel !== 'object') p.rel = {};
  p.rel.affection = clamp(Math.round((Number(p.rel.affection) || 50) + delta), 0, 100);
}
function shiftTrust(p, delta) {
  if (!p) return;
  if (!p.rel || typeof p.rel !== 'object') p.rel = {};
  p.rel.trust = clamp(Math.round((Number(p.rel.trust) || 50) + delta), 0, 100);
}
function shiftVitals(S, { stress = 0, happiness = 0 } = {}) {
  if (!S.player || !S.player.vitals) return;
  if (stress) S.player.vitals.stress = clamp(Math.round((Number(S.player.vitals.stress) || 0) + stress));
  if (happiness) S.player.vitals.happiness = clamp(Math.round((Number(S.player.vitals.happiness) || 0) + happiness));
}
function personName(p, fallback) {
  return (p && (p.fullName || p.name)) || fallback;
}

/* ------------------------------------------------------------------ */
/* Crisis years — read from the v2.15 world-events system.             */
/* ------------------------------------------------------------------ */

/* A crisis is an event hitting the player's country with
   businessRevenue < 1. Returns the events and the combined
   multipliers, so the headhunter rate and the payslip read the same
   crisis this function sees. */
/* What the redundancy line may say still has to be faced: only things this life actually has. */
export function redundancyBurdens(S) {
  const parts = [];
  if ((S.money?.loans || []).some(l => /mortgage/i.test(String(l.kind || l.type || l.name || l.label || '')))) parts.push('the mortgage');
  if ((S.relations?.spouseIds || []).length || (S.relations?.childIds || []).length) parts.push('the family');
  if (S.homeCountry && S.country && S.homeCountry !== S.country) parts.push('the visa');
  if (!parts.length) return ' The search starts now.';
  const joined = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1];
  return ` ${joined.charAt(0).toUpperCase() + joined.slice(1)} ${parts.length === 1 ? 'has' : 'have'} to be faced now.`;
}

export function crisisInfo(S) {
  const active = activeWorldEvents(S, S.country);
  const crisisEvents = active.filter(({ effect }) => (effect.business !== undefined ? effect.business : 1) < 1);
  if (!crisisEvents.length) return { crisis: false, events: [], businessRevenueMult: 1, salaryMult: 1 };
  const eff = worldEventEffects(S, S.country);
  return {
    crisis: true,
    events: crisisEvents.map(({ event, effect }) => ({
      id: event.id,
      name: event.name,
      endYear: event.endYear,
      endMonth: event.endMonth,
      businessRevenue: effect.business !== undefined ? effect.business : 1,
      salary: effect.salary !== undefined ? effect.salary : 1
    })),
    businessRevenueMult: eff.businessRevenue,
    salaryMult: eff.salary
  };
}

export function isCrisisYear(S) {
  return crisisInfo(S).crisis;
}

/* Headhunter calls in a crisis year: far fewer — the multiplier the
   headhunter rate in careerMarket.js applies. */
export const CRISIS_HEADHUNTER_MULT = 0.4;

/* ------------------------------------------------------------------ */
/* Pay freeze — the record lives on the job, so every reader (the     */
/* payslip, the merit rise, the raise negotiation) sees the same one.  */
/* ------------------------------------------------------------------ */

export function setPayFreeze(S, untilYear, reason) {
  const job = S?.career?.job;
  if (!job) return false;
  job.payFrozenUntilYear = Math.max(Number(job.payFrozenUntilYear) || 0, Number(untilYear) || 0);
  job.payFreezeReason = reason || 'pay is frozen while the crisis lasts';
  return true;
}

export function clearPayFreeze(S) {
  const job = S?.career?.job;
  if (!job) return;
  delete job.payFrozenUntilYear;
  delete job.payFreezeReason;
}

/* ------------------------------------------------------------------ */
/* State — lazy, so saves made before v2.18 keep working.              */
/* ------------------------------------------------------------------ */

export function ensureCareerConsequenceState(S) {
  ensureExtendedState(S);
  if (!S.career) S.career = {};
  if (S.career._lastMonthEmployed === undefined) {
    S.career._lastMonthEmployed = !!S.career.employed;
  }
  if (!S.career.crisisWarnings || typeof S.career.crisisWarnings !== 'object') {
    S.career.crisisWarnings = {}; // eventId -> { year, month }
  }
  if (!S.career.jobLoss || typeof S.career.jobLoss !== 'object') {
    S.career.jobLoss = {}; // fired: { lossKey_kind: true }, lastJob: {...}
  }
  if (!S.career.jobLoss.fired || typeof S.career.jobLoss.fired !== 'object') {
    S.career.jobLoss.fired = {};
  }
  /* v2.18 MERGE DEFECT 2 — a player can lose their job twice in one
     calendar year in a crisis (made redundant, re-hired, made
     redundant again). The four reactions and the redundancy scene
     each carry a fixed title, so the second loss re-fired the
     identical scene in the same year and the coherence suite counted
     it (life 1, Saudi 2009: redundant + spouse + children, twice).
     Each kind fires at most once per calendar year; a repeat loss
     in the same year is journalled in plain words instead. */
  if (!S.career.jobLoss.yearFired || typeof S.career.jobLoss.yearFired !== 'object') {
    S.career.jobLoss.yearFired = {}; // kind_year -> true
  }
  /* v2.19 W5 — the second-loss note the Career tab shows in plain words
     (which reactions were already used up this year, and what the first
     loss's mortgage choice was). Null until a second loss in a year
     actually suppresses something. */
  if (!('secondLossNote' in S.career.jobLoss)) S.career.jobLoss.secondLossNote = null;
  if (!('mortgageChoiceTaken' in S.career.jobLoss)) S.career.jobLoss.mortgageChoiceTaken = null;
  if (!S.career._redundantEmployerYear || typeof S.career._redundantEmployerYear !== 'object') {
    S.career._redundantEmployerYear = {}; // employer_year -> true
  }
  return S.career;
}

/* ------------------------------------------------------------------ */
/* The crisis warning — BEFORE anything bad happens.                   */
/* ------------------------------------------------------------------ */

export function warnCrisisYear(S, info) {
  const c = ensureCareerConsequenceState(S);
  const job = S.career.job;
  if (!job) return { ok: false, msg: 'You are not employed.' };
  const unwarned = info.events.filter((e) => !c.crisisWarnings[e.id]);
  if (!unwarned.length) return { ok: false, msg: 'Already warned for this crisis.' };
  const names = unwarned.map((e) => e.name).join(', ');
  const untilYear = Math.max(...info.events.map((e) => e.endYear || S.year));
  setPayFreeze(S, untilYear, `pay is frozen while ${names} lasts — no rises until ${untilYear}`);
  for (const e of unwarned) c.crisisWarnings[e.id] = { year: S.year, month: S.month };
  const scene = buildCrisisWarningScene(S,{names,untilYear,employer:job.employer,key:`crisis_warn_${unwarned.map(e=>e.id).join('_')}_${S.year}`});
  const queued = queueScene(S, scene, true);
  if (queued) {
    recordJournal(S, `${names}: headhunters are calling less, your pay at ${job.employer} is frozen until ${untilYear}, and redundancies are a real risk while the crisis lasts.`, 'career');
  }
  return { ok: queued, msg: queued ? `Warned about ${names} — pay frozen until ${untilYear}.` : 'Warning could not be queued.' };
}

/* ------------------------------------------------------------------ */
/* Redundancy — only after the warning, only in a crisis year.        */
/* ------------------------------------------------------------------ */

export function redundancyChance(S, info) {
  if (!S?.career?.employed || !S.career.job) return 0;
  if (!info || !info.crisis) return 0;
  /* The family's own firm does not make its owner's child redundant in a downturn: that is the family cutting itself. */
  const famFirm = S.familyFortune && S.familyFortune.company && S.familyFortune.company.name;
  if (famFirm && S.career.job.employer === famFirm) return 0;
  /* Hospital and school posts are not cut in a market crisis (the Covid and Ukraine-war shocks raised demand for clinical staff or left schools staffed). GAME DESIGN rule: medicine, nursing, teaching and clinical psychology tracks are exempt. */
  if (['medicine', 'nursing', 'teaching', 'clinical_psych'].includes(S.career.job.track)) return 0;
  const c = ensureCareerConsequenceState(S);
  /* Every active crisis event must have been warned about, in an
     earlier month — never a redundancy in the same month as the
     warning, and never without a warning at all. */
  const warnedEarlier = info.events.every((e) => {
    const w = c.crisisWarnings[e.id];
    return w && (w.year * 12 + w.month) < monthIndex(S);
  });
  if (!warnedEarlier) return 0;
  const perf = Number(S.career.job.performance) || 65;
  let p = 0.03;
  if (perf < 60) p += 0.02;
  if (perf < 45) p += 0.02;
  return Math.min(0.08, p);
}

export function makeRedundant(S, opts = {}) {
  const job = S?.career?.job;
  if (!S?.career?.employed || !job) return { ok: false, msg: 'You are not employed.' };
  const info = crisisInfo(S);
  const p = redundancyChance(S, info);
  if (!opts.force && p <= 0) return { ok: false, msg: 'No redundancy risk right now — no crisis, or no warning yet.' };
  if (!opts.force && !ccChance(S, p)) return { ok: false, msg: 'No redundancy this month.' };
  const employer = job.employer;
  const title = job.title;
  const gross = Number(job.monthlyGross) || 0;
  const years = Math.floor((Number(job.monthsInRole) || 0) / 12);
  const { severanceMonths, source } = noticeAndSeveranceFor(S.country, years);
  const severance = Math.round(gross * severanceMonths);
  S.career.jobLoss.lastJob = { employer, title, monthlyGross: gross, year: S.year, month: S.month, reason: 'redundancy' };
  (S.career.dismissedFrom ||= []).push({ employer, year: S.year, kind: 'redundant' });
  S.career.employed = false;
  S.career.job = null;
  S.career.unemployedMonths = 0;
  if (severance > 0) walletMove(S, severance, `Severance after redundancy — ${employer} (${severanceMonths} months' pay, ${source === 'law' ? 'by law' : 'modelled practice'})`, 'career');
  shiftVitals(S, { stress: 10, happiness: -8 });
  recordJournal(S, `Made redundant from ${employer} (${title}) in the crisis — ${severance > 0 ? `${formatMoney(severance, S.country)} severance paid (${severanceMonths} months' pay).` : 'no severance is owed under local rules.'}${redundancyBurdens(S)}`, 'career');
  const scene=buildRedundancyScene(S,{employer,title,severance,severanceMonths,country:S.country,year:S.year,month:S.month});
  /* Same employer, same year, second redundancy: the scene has a
     fixed title ("Made Redundant at X"), so a second queue would
     repeat it in the same year. The severance and the journal line
     above still land — only the repeated scene is held back. A
     redundancy at a different employer keeps its own scene. */
  const redKey = `${employer}_${S.year}`;
  ensureCareerConsequenceState(S);
  if (!S.career._redundantEmployerYear[redKey]) {
    queueScene(S, scene, true);
    S.career._redundantEmployerYear[redKey] = true;
  } else {
    recordJournal(S, `Made redundant from ${employer} again this year — the second time in ${S.year}. The severance and the journal above are the record; there is no second redundancy scene.`, 'career');
  }
  return { ok: true, msg: `Made redundant from ${employer}.`, severance, employer, title };
}

/* ------------------------------------------------------------------ */
/* Job loss — the four reactions. Each fires once per job loss.        */
/* ------------------------------------------------------------------ */

function mortgageOf(S) {
  const props = S?.housing?.properties || [];
  const withPlan = props.filter((p) => p && (Number(p.monthsLeft) || 0) > 0 && (Number(p.nativeMonthlyInstallment) || 0) > 0);
  if (!withPlan.length) return null;
  const home = withPlan.find((p) => p.id === S.housing?.currentHomeId) || withPlan[0];
  const instLocal = Math.round(convertCurrency(home.nativeMonthlyInstallment, home.country, S.country, S.year));
  return { prop: home, instLocal, remainingLocal: Math.round(Number(home.installmentRemaining) || 0) };
}

function buildMortgageScene(S, lossKey, lastJob, propertyId=null) {
  const selected=propertyId&&(S.housing.properties||[]).find(p=>p.id===propertyId);
  const m = propertyId?(selected&&selected.monthsLeft>0?{prop:selected,instLocal:Math.round(convertCurrency(selected.nativeMonthlyInstallment,selected.country,S.country,S.year)),remainingLocal:selected.installmentRemaining}:null):mortgageOf(S);
  if (!m) return null;
  const { prop, instLocal, remainingLocal } = m;
  const canPayEarly = (Number(S.money?.cash) || 0) >= instLocal;
  const untilIdx = monthIndex(S) + 3;
  return {
    key: `jobloss_mortgage_${lossKey}`,
    baseId: 'jobloss_mortgage',
    maxPerLife: 3,
    category: 'money',
    title: `The Bank Writes About ${prop.name}`,
    text: `A letter from the bank, not a phone call. You lost your job${lastJob ? ` at ${lastJob.employer}` : ''}, and the ${prop.name} instalments do not stop with it: ${formatMoney(instLocal, S.country)} a month, ${formatMoney(remainingLocal, S.country)} still owed, ${prop.monthsLeft} months left. Miss three and they foreclose. What do you do?`,
    choices: [
      {
        label: `Pay next month's instalment early from savings — ${formatMoney(instLocal, S.country)}`,
        available: (st) => (Number(st.money?.cash) || 0) >= Math.round(convertCurrency(prop.nativeMonthlyInstallment, prop.country, st.country, st.year)),
        effect: (st) => {
          const amt = Math.round(convertCurrency(prop.nativeMonthlyInstallment, prop.country, st.country, st.year));
          if ((Number(st.money?.cash) || 0) < amt) return;
          walletMove(st, -amt, `Paid next month's ${prop.name} instalment early, from savings, after losing your job`, 'housing');
          prop.monthsLeft = Math.max(0, (Number(prop.monthsLeft) || 0) - 1);
          prop.nativeInstallmentRemaining = Math.max(0, (Number(prop.nativeInstallmentRemaining) || 0) - (Number(prop.nativeMonthlyInstallment) || 0));
          prop.installmentRemaining = Math.round(convertCurrency(prop.nativeInstallmentRemaining, prop.country, st.country, st.year));
          /* v2.19 W5 — remembered so a second job loss in the same year
             can be told, in plain words, what the first loss's choice
             was and that it still stands. */
          st.career.jobLoss.mortgageChoiceTaken = 'paid the next instalment early from savings';
          recordJournal(st, `Paid next month's ${prop.name} instalment (${formatMoney(amt, st.country)}) early from savings after losing your job — ${prop.monthsLeft} months left on it now.`, 'money');
        }
      },
      {
        label: 'Use game payment holiday · three months',
        effect: (st) => {
          prop.paymentHolidayUntil = untilIdx;
          shiftVitals(st, { stress: -3 });
          st.career.jobLoss.mortgageChoiceTaken = 'took the 3-month payment holiday';
          recordJournal(st, `Game payment holiday: three months on ${prop.name} after you lost your job — no instalment is due and no missed payment is recorded while it lasts. The months are added at the end; the debt does not shrink.`, 'money');
        }
      },
      {
        label: 'Do nothing — hope work comes back first',
        effect: (st) => {
          shiftVitals(st, { stress: 5 });
          st.career.jobLoss.mortgageChoiceTaken = 'did nothing about the instalments';
          recordJournal(st, `Did nothing about the ${prop.name} instalments after losing your job — the next one falls due with no salary behind it.`, 'money');
        }
      }
    ]
  };
}

function buildSpouseScene(S, lossKey, spouse, lastJob) {
  if (!spouse) return null;
  const name = personName(spouse, 'Your spouse');
  const first = name.split(' ')[0];
  const affection = Number(spouse?.rel?.affection) || 50;
  const supportive = affection >= 55;
  return {
    key: `jobloss_spouse_${lossKey}`,
    baseId: 'jobloss_spouse',
    maxPerLife: 3,
    category: 'relationship',
    title: `${first} Hears You Lost Your Job`,
    text: supportive
      ? `You tell ${first} you lost your job${lastJob ? ` at ${lastJob.employer}` : ''}. They put the kettle on. "We will manage. I will cover what I can, and we cut back until you are working again — together, not apart."`
      : `You tell ${first} you lost your job${lastJob ? ` at ${lastJob.employer}` : ''}. The silence lasts too long. "And the bills? Who pays them while you look? I need to know there is a plan — not just hope."`,
    choices: [
      {
        label: 'Tighten the belt together — live frugally until work comes back',
        effect: (st) => {
          st.money.lifestyleMode = 'frugal';
          shiftAffection(spouse, 5);
          shiftVitals(st, { stress: -3 });
          recordJournal(st, `After losing your job, you and ${first} agreed to live frugally until work comes back — the household spends less, and you faced it together.`, 'relationship');
        }
      },
      {
        label: "Say you'll find work fast and carry on as normal",
        effect: (st) => {
          shiftAffection(spouse, -3);
          shiftVitals(st, { stress: 3 });
          recordJournal(st, `Told ${first} you would find work fast and carry on as normal after losing your job — they are not convinced, and the bills are still coming.`, 'relationship');
        }
      }
    ]
  };
}

function buildChildrenScene(S, lossKey, children, lastJob) {
  const alive = children.filter((c) => c && c.alive);
  if (!alive.length) return null;
  const names = alive.map((c) => personName(c, 'your child')).join(', ');
  const oldest = alive[0];
  return {
    key: `jobloss_children_${lossKey}`,
    baseId: 'jobloss_children',
    maxPerLife: 3,
    category: 'family',
    title: `The Children Notice`,
    text: `Children notice before you tell them — the quiet at dinner, the phone calls behind closed doors. ${names} ${alive.length === 1 ? 'asks' : 'ask'} what is happening${lastJob ? ` since you left ${lastJob.employer}` : ''}. What do you say?`,
    choices: [
      {
        label: 'Tell them honestly — money is tight until you find work',
        effect: (st) => {
          for (const c of alive) { shiftAffection(c, 2); shiftTrust(c, 4); }
          shiftVitals(st, { stress: -2 });
          recordJournal(st, `Told the children honestly that money is tight until you find work — ${names} took it better for being told straight.`, 'family');
        }
      },
      {
        label: 'Keep it from them — they are too young to worry',
        effect: (st) => {
          shiftVitals(st, { stress: 2 });
          recordJournal(st, `Kept the job loss from the children — they are too young to worry, you told yourself. They noticed anyway.`, 'family');
        }
      }
    ]
  };
}

const VISA_DEPENDS_ON_JOB = ['work_visa', 'gulf_iqama', 'post_study_work'];

function buildVisaScene(S, lossKey) {
  const res = S?.legal?.residency;
  if (!res || !VISA_DEPENDS_ON_JOB.includes(res.kind)) return null;
  const cObj = getCountry(S.country);
  return {
    key: `jobloss_visa_${lossKey}`,
    baseId: 'jobloss_visa',
    maxPerLife: 3,
    category: 'visa',
    title: `Your Visa Depends on That Job`,
    text: `Job loss may affect your recorded ${res.permitName||res.kind} in ${cObj.name}. Expiry: ${res.expiresMonth||'?'}/${res.expiresYear||'?'}. Check Passport for current game status and work authorization. No grace extension or sponsor agreement is granted here.`,
    choices: [
      {
        label: 'Start looking for eligible work',
        effect: (st) => {
          st.career.jobLoss.visaJobHunt = true;
          recordJournal(st, `Started looking for eligible work after job loss. Check Passport for current game permit status in ${getCountry(st.country).name}.`, 'visa');
        }
      },
      {
        label: 'Record a sponsor follow-up',
        effect: (st) => {
          recordJournal(st, `You marked a sponsor follow-up to do${st.legal?.residency?.sponsorName ? ` (${st.legal.residency.sponsorName})` : ''}. No message was sent and no permit extension was granted.`, 'visa');
        }
      }
    ]
  };
}

/* The four reactions, once per job loss. Returns which fired, which
   were skipped and why — the verify script reads this, not the
   journal. */
export function fireJobLossReactions(S, lossKey) {
  const report = { fired: [], skipped: [] };
  const c = ensureCareerConsequenceState(S);
  const lastJob = S.career.jobLoss.lastJob || null;
  let yearSuppressed = 0;
  const yearSuppressedKinds = [];
  const tryFire = (kind, scene) => {
    if (c.jobLoss.fired[`${lossKey}_${kind}`]) { report.skipped.push({ kind, reason: 'already fired for this job loss' }); return; }
    if (!scene) { report.skipped.push({ kind, reason: 'nothing to react to' }); return; }
    /* Same kind already fired this calendar year (a second job loss
       in the same year): the scene's title is fixed, so a second
       queue would repeat it in the same year. Hold the scene back;
       the journal line below is the record instead. */
    if (c.jobLoss.yearFired[`${kind}_${S.year}`]) { yearSuppressed += 1; yearSuppressedKinds.push(kind); report.skipped.push({ kind, reason: 'already fired this year' }); return; }
    scene=decorateJobLossScene(S,scene,{kind,lossKey,lastJob,personId:kind==='spouse'?spouseOf(S)?.id:null,childIds:kind==='children'?[...(S.relations.childIds||[])]:[],propertyId:kind==='mortgage'?mortgageOf(S)?.prop.id:null,country:S.country,residencyKind:S.legal.residency.kind});
    if (queueScene(S, scene, true)) {
      c.jobLoss.fired[`${lossKey}_${kind}`] = true;
      c.jobLoss.yearFired[`${kind}_${S.year}`] = true;
      report.fired.push({ kind, sceneKey: scene.key, title: scene.title });
    } else {
      report.skipped.push({ kind, reason: 'queue refused (already queued, or cap)' });
    }
  };

  /* Mortgage — only when there is a home loan / instalment plan. */
  if (!mortgageOf(S)) report.skipped.push({ kind: 'mortgage', reason: 'no mortgage or instalment plan on any property' });
  else tryFire('mortgage', buildMortgageScene(S, lossKey, lastJob));

  /* Spouse. */
  const spouse = spouseOf(S);
  if (!spouse) report.skipped.push({ kind: 'spouse', reason: 'no spouse' });
  else tryFire('spouse', buildSpouseScene(S, lossKey, spouse, lastJob));

  /* Children. */
  const children = (S.relations?.childIds || []).map((id) => S.people && S.people[id]).filter(Boolean);
  if (!children.filter((p) => p.alive).length) report.skipped.push({ kind: 'children', reason: 'no living children' });
  else tryFire('children', buildChildrenScene(S, lossKey, children, lastJob));

  /* Visa — only where the permit depends on employment. */
  const res = S?.legal?.residency;
  if (!res || !VISA_DEPENDS_ON_JOB.includes(res.kind)) {
    report.skipped.push({ kind: 'visa', reason: `residency is ${res?.kind || 'none'} — the permit does not depend on the job` });
  } else {
    tryFire('visa', buildVisaScene(S, lossKey));
  }
  if (yearSuppressed > 0) {
    /* v2.19 W5 — the second loss in a year used to be journalled only,
       in one generic line ("the family and the bank already heard it
       once"). A player who only reads the Career tab never saw what
       they lost. The note below is the record the Career tab renders
       in plain words, naming each reaction already used up this year
       and what the first loss's mortgage choice was — the guard itself
       is unchanged: nothing re-fires, and the first choice still stands. */
    c.jobLoss.secondLossNote = {
      year: S.year,
      month: S.month,
      kinds: [...yearSuppressedKinds],
      mortgageChoice: c.jobLoss.mortgageChoiceTaken || null
    };
    recordJournal(S, `Lost your job again this year — ${secondLossJournalBits(yearSuppressedKinds)} The choice you made the first time still stands.`, 'career');
  }
  return report;
}

/* Plain-words fragments for the second-loss note and journal: what each
   already-fired reaction means the player does NOT get a second time. */
export const SECOND_LOSS_KIND_WORDS = {
  mortgage: 'the bank already wrote to you once this year, so there is no second letter and no second payment holiday to ask for',
  spouse: 'your spouse already heard it once this year, so there is no second conversation',
  children: 'the children already heard it once this year, so there is no second talk with them',
  visa: 'the visa warning already came once this year, so there is no second warning'
};
export function secondLossJournalBits(kinds) {
  return (kinds || []).map((k) => SECOND_LOSS_KIND_WORDS[k] || `the ${k} reaction already fired this year`).join('; ') + '.';
}

/* ------------------------------------------------------------------ */
/* The monthly check — the coordinator's insertion point is below.     */
/* ------------------------------------------------------------------ */

export function checkCareerConsequences(S) {
  const report = { warning: null, redundancy: null, jobLoss: null, skipped: [] };
  if (!S || S.gameOver) return report;
  if ((S.player?.age ?? 0) < 18) return report;
  const c = ensureCareerConsequenceState(S);
  const wasEmployed = !!c._lastMonthEmployed;

  /* 1. Crisis warning — at the start of the crisis year, before
     anything bad happens. */
  const info = crisisInfo(S);
  if (S.career.employed && S.career.job && info.crisis) {
    const w = warnCrisisYear(S, info);
    if (w.ok) report.warning = w.msg;
  }

  /* 2. Redundancy — only in a crisis, only after the warning. */
  if (S.career.employed && S.career.job && info.crisis) {
    const r = makeRedundant(S);
    if (r.ok) report.redundancy = r;
  }

  /* 3. Job loss — employed last month, not employed now. Retirement
     is not a job loss. */
  if (wasEmployed && !S.career.employed && !S.career.retired) {
    const lossKey = `loss_${S.year}_${S.month}`;
    report.jobLoss = fireJobLossReactions(S, lossKey);
  } else if (wasEmployed && !S.career.employed && S.career.retired) {
    report.skipped.push('retired — not a job loss');
  }

  c._lastMonthEmployed = !!S.career.employed;
  return report;
}

/* ============================================================================
   COORDINATOR INSERTION POINT (gameLoop.js — DO NOT edit it from here):
   in advanceSingleTurn, monthly adulthood branch, AFTER settleHouseholdMonth,
   next to the checkBusinessFate call:

       settleHouseholdMonth(S);
       checkBusinessFate(S); // v2.17 W5 §6 — ...
       checkCareerConsequences(S); // v2.18 W2 §3 — job loss reaches the
       // mortgage, spouse, children and visa; crisis years warn, freeze
       // pay and risk redundancy. Import at the top of gameLoop.js:
       //   import { checkCareerConsequences } from '../systems/careerConsequences.js';

   It must run after the settlement (so a redundancy this month is
   detected next month from the _lastMonthEmployed flag, and the
   mortgage scene reads the post-settlement instalment balance) and
   before the scene-queue drain at the end of advanceSingleTurn (so
   its scenes can become the active scene this turn).
   ========================================================================== */

export function buildCrisisWarningScene(S,{names,untilYear,employer,key}){
 const job={employer};
  return {
    key,
    baseId: 'crisis_career_warning',
    maxPerLife: 3,
    category: 'career',
    title: `${names} — Your Job Is About to Feel It`,
    text: `${job.employer} · ${names}. Game effects: pay frozen until ${untilYear}, fewer job leads, higher layoff risk.`,
    crisisWarningSnapshot:{names,untilYear,employer:job.employer,key},
    choices: [
      {
        label: 'Tighten the belt and keep your head down',
        effect: (st) => {
          shiftVitals(st, { stress: 2 });
          recordJournal(st, `With ${names} in the news, you decided to keep your head down at ${job.employer} — pay frozen, hiring frozen, and redundancies coming.`, 'career');
        }
      },
      {
        label: 'Start looking now, before the cuts come',
        effect: (st) => {
          ensureCareerConsequenceState(st).jobLoss.lookingEarly = true;
          recordJournal(st, `With ${names} in the news, you started looking for work before the cuts came — pay is frozen at ${job.employer} until ${untilYear}.`, 'career');
        }
      }
    ]
  };
}
export function restoreCrisisWarningScene(S,saved){return saved?.crisisWarningSnapshot?buildCrisisWarningScene(S,saved.crisisWarningSnapshot):null;}

export function buildRedundancyScene(S,q){
 const{employer,title,severance,severanceMonths,country,year,month}=q;
  return {
    key: `redundant_${year}_${month}`,
    baseId: 'made_redundant',
    maxPerLife: 3,
    category: 'career',
    title: `Made Redundant at ${employer}`,
    text: `${employer} called you in today. The crisis has cut their work, and your role is gone — ${title}, finished at the end of the month.${severance > 0 ? ` They pay ${formatMoney(severance, country)} severance (${severanceMonths} months' pay).` : ' There is no severance under local rules.'} Your pay stops now, but the mortgage, the family and the visa do not.`,
    redundancySnapshot:q,
    choices: [
      {
        label: 'Start looking for work today',
        effect: (st) => {
          if(st.career.job)return;st.career.redundancyReplies??={};const key=employer+'_'+year+'_'+month;if(st.career.redundancyReplies[key])return;st.career.redundancyReplies[key]=true;
          ensureCareerConsequenceState(st).jobLoss.lookingEarly = true;
          recordJournal(st, `Made redundant — you started looking for work the same day.`, 'career');
        }
      },
      {
        label: 'Ask for a reference before you go',
        effect: (st) => {
          if(st.career.job)return;st.career.redundancyReplies??={};const key=employer+'_'+year+'_'+month;if(st.career.redundancyReplies[key])return;st.career.redundancyReplies[key]=true;
          st.career.lastReference = { kind: 'good', from: 'Management', note: 'Made redundant in the crisis — not dismissed for cause.' };
          recordJournal(st, `Made redundant — you left with a good reference: cut in the crisis, not dismissed for cause.`, 'career');
        }
      }
    ]
  };
}
export function restoreRedundancyScene(S,saved){return saved?.redundancySnapshot?buildRedundancyScene(S,saved.redundancySnapshot):null;}

function decorateJobLossScene(S,scene,snapshot){if(!scene)return null;scene.jobLossReactionSnapshot=snapshot;scene.choices=scene.choices.map(choice=>({...choice,effect:st=>{if(st.career.job||typeof choice.available==='function'&&!choice.available(st))return;ensureCareerConsequenceState(st);st.career.jobLossReactionReplies??={};const key=snapshot.lossKey+'_'+snapshot.kind;if(st.career.jobLossReactionReplies[key])return;const result=choice.effect?.(st);st.career.jobLossReactionReplies[key]=true;return result;}}));return scene;}
export function restoreJobLossReactionScene(S,saved){const q=saved?.jobLossReactionSnapshot;if(!q||S.career.job)return null;ensureCareerConsequenceState(S);let scene=null;
 if(q.kind==='mortgage')scene=buildMortgageScene(S,q.lossKey,q.lastJob,q.propertyId);
 if(q.kind==='spouse'){const spouse=S.people[q.personId];if(spouse?.alive&&spouseOf(S)?.id===spouse.id)scene=buildSpouseScene(S,q.lossKey,spouse,q.lastJob);}
 if(q.kind==='children')scene=buildChildrenScene(S,q.lossKey,(q.childIds||[]).filter(id=>S.relations.childIds.includes(id)).map(id=>S.people[id]).filter(Boolean),q.lastJob);
 if(q.kind==='visa'&&S.country===q.country&&S.legal.residency.kind===q.residencyKind)scene=buildVisaScene(S,q.lossKey);
 if(!scene)return null;scene.title=saved.title;scene.text=saved.text;return decorateJobLossScene(S,scene,q);}
