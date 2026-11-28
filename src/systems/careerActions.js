import{careerHours,partTimeJob}from'./careerSchedule.js';
/* ============================================================================
   World Life 2.0 — Career actions (v2.8 §3)
   Everything the player DOES inside a job: pace, stepping up, training,
   asking for more, transfers, leave, promotion, people at work, security,
   and the yearly review. Every action states its cost and consequence
   BEFORE the player takes it (the preview helpers at the bottom are what
   the Career tab prints under each button) and every consequence lands in
   the game's real systems: the ledger, the People-tab relationship records,
   the licence records the Education tab shows, the visa system, and the
   single vacation balance in src/data/economy.js.
   One-directional imports only: this file reads careerEducationEngine,
   visaMigrationEngine and completeLifeSystems, none of which import it.
   ========================================================================== */

import { payRatio } from './payShape.js';
import { rand, randInt, chance, clamp } from '../core/rng.js';
import { recordJournal, walletMove, queueScene, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import {
  convertCurrency,
  eraUsdCost,
  computeMonthlyNetPay,
  computeOvertimePay,
  overtimeRuleFor,
  vacationEntitlementDays,
  vacationRuleFor,
  noticeAndSeveranceFor
} from '../data/economy.js';
import {
  getMergedCareerTracks,
  registerPromotionEligibility,
  getRequiredForeignBoardForJob,
  getJobContract,
  jobEmploymentFraction,
  requestRaiseOrPromotion,
  resignCurrentJob
} from './careerEducationEngine.js';
import { applyDirectSkilledVisa } from './visaMigrationEngine.js';
import { rememberDeed } from './soulEngine.js';
import { sitExamOrLicensingBoard } from './completeLifeSystems.js';
import { PROFESSIONAL_LICENSES } from '../data/megaCareerEduMedical.js';

/* ------------------------------------------------------------------ */
/* Job action state — lazy, so saves made before v2.8 keep working.   */
/* ------------------------------------------------------------------ */

export function ensureJobActionState(S) {
  const job = S?.career?.job;
  if (!job) return null;
  if (!job.actionState) {
    const title = String(job.title || '');
    const regulated = /pilot|doctor|physician|surgeon|nurse|dentist/i.test(title) ||
      ['medicine', 'nursing', 'aviation'].includes(job.track);
    job.actionState = {
      warnings: 0,
      lowPerfMonths: 0,
      performancePlan: false,
      steppedUp: [],       // { kind, label, year, month }
      leaveLog: [],        // { kind, days, approved, reason, year, month }
      reviewLastYear: null,
      licence: {
        medicalDueYear: regulated ? (job.startYear || S.year) + 1 : null,
        simDueYear: (/pilot|first officer/i.test(title) || (job.track === 'aviation' && /^captain$/i.test(title.trim()))) ? (job.startYear || S.year) + 1 : null,
        lapsed: false,
        lapsedNoted: false
      },
      training: [],        // { kind, label, year, cost }
      noticeServing: null, // { untilTurn, months }
      promotion: null,     // { rungTitle, stage, appliedYear }
      reference: null,     // { fromId, fromName, strength }
      lastAskYear: {}      // kind -> year
    };
  }
  if (!job.actionState.licence) {
    job.actionState.licence = { medicalDueYear: null, simDueYear: null, lapsed: false, lapsedNoted: false };
  }
  return job.actionState;
}

export function yearsService(S) {
  const job = S?.career?.job;
  if (!job) return 0;
  return Math.floor((job.monthsInRole || 0) / 12);
}

export function bossOf(S) {
  const job = S?.career?.job;
  if (!job || !job.bossId) return null;
  return S.people[job.bossId] || null;
}

export function colleaguesOf(S) {
  return (S.relations.colleagueIds || [])
    .map(id => S.people[id])
    .filter(p => p && p.alive && p.role === 'colleague');
}

function bossScore(S) {
  const job = S.career.job;
  const boss = bossOf(S);
  const bossRespect = boss ? boss.rel.respect : 60;
  return { boss, bossRespect, score: job.performance * 0.6 + bossRespect * 0.4 };
}

/* ------------------------------------------------------------------ */
/* Vacation — the ONE balance. Every reader uses this helper.         */
/* ------------------------------------------------------------------ */

/* The leave balance lives in ONE place: job.leave = { annualDays,
   usedDays, year, extraDays }, owned by getJobContract (W1 §2b). This
   helper only READS it — nothing in §3 stores leave anywhere else. */
export function vacationBalance(S) {
  const job = S?.career?.job;
  if (!job) return { entitlement: 0, used: 0, left: 0, extra: 0, rule: null };
  const contract = getJobContract(S);
  const leave = (contract && contract.leave) || job.leave || { annualDays: vacationEntitlementDays(S.country, yearsService(S)), usedDays: 0, extraDays: 0 };
  return {
    entitlement: leave.annualDays,
    used: leave.usedDays,
    left: Math.max(0, leave.annualDays - leave.usedDays),
    extra: leave.extraDays || 0,
    rule: vacationRuleFor(S.country)
  };
}

/* ------------------------------------------------------------------ */
/* 1. Work pace — real hours, real pay, real stress/health.            */
/* ------------------------------------------------------------------ */

export const WORK_MODES = {
  normal: { label: 'Balanced Pace', hoursPerWeek: 40, stressPerMonth: 0, healthPerMonth: 0, perfPerMonth: 0.4 },
  hard: { label: 'Work Hard', hoursPerWeek: 50, stressPerMonth: 2, healthPerMonth: -1, perfPerMonth: 1.2 },
  overtime: { label: 'Overtime', hoursPerWeek: 60, stressPerMonth: 3, healthPerMonth: -1, perfPerMonth: 1.5 },
  coast: { label: 'Coast', hoursPerWeek: 32, stressPerMonth: -2, healthPerMonth: 1, perfPerMonth: -1.2 }
};

export function overtimePreview(S) {
  const job = S.career.job;
  if (!job) return null;
  const otGross = computeOvertimePay(job, S.country);
  const netWith = computeMonthlyNetPay(job.monthlyGross + otGross, S.country, S.year, true).net;
  const netWithout = computeMonthlyNetPay(job.monthlyGross, S.country, S.year, true).net;
  const rule = overtimeRuleFor(S.country);
  return {
    otGross,
    netExtra: Math.round(netWith - netWithout),
    mult: rule.mult,
    source: rule.source,
    note: rule.note
  };
}

export function workModePreview(S) {
  const job = S.career.job;
  if (!job) return [];
  const ot = overtimePreview(S);
  const fmt = (m) => {
    const pay = m === 'overtime'
      ? `Pay +${formatMoney(ot.otGross, S.country)}/mo gross (+${formatMoney(ot.netExtra, S.country)} net, ${ot.mult}× overtime${ot.source === 'modelled' ? ', modelled rate' : ''})`
      : m === 'hard'
      ? 'Pay unchanged (salaried — the extra hours are unpaid)'
      : 'Pay unchanged';
    const stress = WORK_MODES[m].stressPerMonth > 0 ? `Stress +${WORK_MODES[m].stressPerMonth}/mo`
      : WORK_MODES[m].stressPerMonth < 0 ? `Stress ${WORK_MODES[m].stressPerMonth}/mo` : 'Stress unchanged';
    const health = WORK_MODES[m].healthPerMonth > 0 ? 'Health +1/mo'
      : WORK_MODES[m].healthPerMonth < 0 ? 'Health −1/mo' : 'Health unchanged';
    const perf = WORK_MODES[m].perfPerMonth > 0 ? `Performance +${WORK_MODES[m].perfPerMonth}/mo`
      : WORK_MODES[m].perfPerMonth < 0 ? `Performance ${WORK_MODES[m].perfPerMonth}/mo` : 'Performance +0.4/mo';
    const boss = m === 'hard' ? 'Your manager notices the extra effort (+respect).'
      : m === 'coast' ? 'Your manager notices you easing off (−respect).'
      : m === 'overtime' ? 'Your manager sees the extra hours (+respect).' : 'Your manager sees steady work.';
    return `${careerHours(S,m)}h/week · ${pay} · ${stress} · ${health} · ${perf} · ${boss}`;
  };
  return Object.keys(WORK_MODES).filter(m=>!partTimeJob(job)||!['hard','overtime'].includes(m)).map(m => ({ mode: m, label: WORK_MODES[m].label, preview: fmt(m) }));
}

export function setWorkMode(S, mode) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  if (!WORK_MODES[mode]) return { ok: false, msg: 'Unknown work pace.' };
  if(partTimeJob(S.career.job)&&['hard','overtime'].includes(mode))return{ok:false,msg:'This part-time contract is capped at20h/week. Change contract before adding full-time hours.'};
  const st = ensureJobActionState(S);
  if (mode === 'overtime' && st.licence.lapsed) {
    return { ok: false, msg: 'Your licence check is overdue — renew it before taking overtime shifts (see Train & Licences).' };
  }
  S.career.job.workMode = mode;
  recordJournal(S, `Switched to ${WORK_MODES[mode].label.toLowerCase()} at ${S.career.job.employer} (${careerHours(S,mode)}h/week).`, 'career');
  return { ok: true, msg: `${WORK_MODES[mode].label}: ${careerHours(S,mode)}h/week.` };
}

/* ------------------------------------------------------------------ */
/* 2. Take on work — recorded, and the manager remembers.             */
/* ------------------------------------------------------------------ */

export const TAKE_ON_WORK = {
  hard_assignment: {
    label: 'Volunteer for the hard assignment',
    preview: 'Risk: 1-in-4 it goes wrong (−3 performance, +5 stress). Reward: +4 performance, +5 manager respect, and your manager remembers you stepped up.'
  },
  project: {
    label: 'Take on a project',
    preview: 'Reward: +3 performance, +3 manager respect. Cost: +4 stress this month. Recorded on your file.'
  },
  mentor: {
    label: 'Mentor a junior colleague',
    preview: 'Reward: +1 performance, +3 manager respect, and the junior thinks well of you. Cost: +2 stress.'
  },
  cover_shift: {
    label: 'Cover a colleague’s shift',
    preview: 'Reward: +2 performance, and the colleague owes you one (+8 trust). Cost: +3 stress, −1 health.'
  }
};

export function takeOnWork(S, kind) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  const def = TAKE_ON_WORK[kind];
  if (!def) return { ok: false, msg: 'Unknown assignment.' };
  const job = S.career.job;
  const st = ensureJobActionState(S);
  const cdKey = `takeon_${kind}`;
  if (S.cooldowns[cdKey] && S.turn < S.cooldowns[cdKey]) {
    return { ok: false, msg: 'You only just did that — give it a few months before volunteering again.' };
  }
  S.cooldowns[cdKey] = S.turn + 3;
  const boss = bossOf(S);

  if (kind === 'hard_assignment') {
    const failed = chance(S, 0.25);
    if (failed) {
      job.performance = clamp(job.performance - 3, 0, 100);
      S.player.vitals.stress = clamp(S.player.vitals.stress + 5);
      st.steppedUp.push({ kind, label: def.label + ' (went wrong)', year: S.year, month: S.month });
      if (boss) rememberDeed(S, boss, 'stepped_up_failed', 'You volunteered for the hard assignment and it went wrong.', { respect: -2, resentment: 2 });
      recordJournal(S, `Volunteered for the hardest assignment at ${job.employer} — and it went wrong. Your manager saw you try, and saw it fail.`, 'career');
      return { ok: true, msg: 'The hard assignment went wrong — performance −3, stress +5. Your manager remembers you tried.' };
    }
    job.performance = clamp(job.performance + 4, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 2);
    /* v2.15 W2 — the team sees who steps up: teamwork moves with the
       real work, not just the headline performance. */
    if (job.performanceParts) job.performanceParts.teamwork = clamp(job.performanceParts.teamwork + 1, 0, 100);
    st.steppedUp.push({ kind, label: def.label, year: S.year, month: S.month });
    if (boss) rememberDeed(S, boss, 'stepped_up', 'You volunteered for the hard assignment and delivered.', { respect: 5, affection: 2 });
    recordJournal(S, `Volunteered for the hardest assignment at ${job.employer} and delivered. ${boss ? boss.firstName : 'Your manager'} noticed.`, 'career');
    return { ok: true, msg: 'Delivered the hard assignment — performance +4, manager respect +5.' };
  }
  if (kind === 'project') {
    job.performance = clamp(job.performance + 3, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 4);
    /* v2.15 W2 — the team sees who steps up. */
    if (job.performanceParts) job.performanceParts.teamwork = clamp(job.performanceParts.teamwork + 1, 0, 100);
    st.steppedUp.push({ kind, label: def.label, year: S.year, month: S.month });
    if (boss) rememberDeed(S, boss, 'stepped_up', 'You took on a project without being asked.', { respect: 3 });
    recordJournal(S, `Took on a project at ${job.employer} without being asked.`, 'career');
    return { ok: true, msg: 'Project taken on — performance +3, manager respect +3, stress +4.' };
  }
  if (kind === 'mentor') {
    job.performance = clamp(job.performance + 1, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 2);
    /* v2.15 W2 — mentoring a junior is the fastest way the team warms to you. */
    if (job.performanceParts) job.performanceParts.teamwork = clamp(job.performanceParts.teamwork + 2, 0, 100);
    st.steppedUp.push({ kind, label: def.label, year: S.year, month: S.month });
    const junior = colleaguesOf(S)[0];
    if (junior) rememberDeed(S, junior, 'mentored', 'You mentored them when they were struggling.', { affection: 6, respect: 4, trust: 4 });
    if (boss) rememberDeed(S, boss, 'stepped_up', 'You mentored a junior colleague.', { respect: 3 });
    recordJournal(S, `Started mentoring a junior colleague at ${job.employer}.`, 'career');
    return { ok: true, msg: 'Mentoring a junior — performance +1, manager respect +3, stress +2.' };
  }
  /* cover_shift */
  job.performance = clamp(job.performance + 2, 0, 100);
  S.player.vitals.stress = clamp(S.player.vitals.stress + 3);
  S.player.vitals.health = clamp(S.player.vitals.health - 1);
  /* v2.15 W2 — covering a shift is the fastest way the team warms to you. */
  if (job.performanceParts) job.performanceParts.teamwork = clamp(job.performanceParts.teamwork + 2, 0, 100);
  st.steppedUp.push({ kind, label: def.label, year: S.year, month: S.month });
  const colleague = colleaguesOf(S)[0];
  if (colleague) rememberDeed(S, colleague, 'covered_shift', 'You covered their shift when they needed it.', { affection: 5, trust: 8 });
  recordJournal(S, `Covered a colleague’s shift at ${job.employer}.`, 'career');
  return { ok: true, msg: 'Shift covered — performance +2, colleague trust +8, stress +3.' };
}

/* ------------------------------------------------------------------ */
/* 3. Train & qualify — the SAME licences the Education tab shows.    */
/*    Licence renewals are recorded on the licence id itself, so the   */
/*    Education tab and the Career tab can never disagree. An overdue  */
/*    medical / simulator check blocks promotion and overtime, plainly.*/
/* ------------------------------------------------------------------ */

function licenceRenewals(S) {
  if (!S.credentials) S.credentials = { licenses: [], languageCerts: [] };
  if (!S.credentials.licenceRenewals) S.credentials.licenceRenewals = {};
  return S.credentials.licenceRenewals;
}

export function licenceStatus(S) {
  const job = S?.career?.job;
  if (!job) return { required: null, held: false, lapsed: false, medicalDue: null, simDue: null };
  const st = ensureJobActionState(S);
  const track = (getMergedCareerTracks(S.year)[job.track] || {});
  /* NOTE: getRequiredForeignBoardForJob returns the MISSING board, or null
     when nothing is missing — so a non-null return means "not held". */
  const required = getRequiredForeignBoardForJob(S, job.track, track.reqDegrees || []);
  const heldCert = (PROFESSIONAL_LICENSES || []).find(l =>
    (l.country===S.country||l.country==='local') && (track.reqDegrees || []).includes(l.reqDegree) && (S.credentials.licenses || []).includes(l.id));
  const renewals = licenceRenewals(S);
  let renewalLapsed = false;
  if (heldCert) {
    const rec = renewals[heldCert.id];
    if (rec && rec.validUntilYear < S.year) renewalLapsed = true;
  }
  const medicalOverdue = st.licence.medicalDueYear != null && st.licence.medicalDueYear < S.year;
  const simOverdue = st.licence.simDueYear != null && st.licence.simDueYear < S.year;
  return {
    required,
    held: !required,
    lapsed: renewalLapsed || medicalOverdue || simOverdue,
    medicalDue: st.licence.medicalDueYear,
    simDue: st.licence.simDueYear,
    medicalOverdue,
    simOverdue,
    renewalLapsed
  };
}

export function trainOptions(S) {
  const job = S?.career?.job;
  if (!job) return [];
  const opts = [];
  const courseFee = Math.round(eraUsdCost(400, S.country, S.year));
  opts.push({
    kind: 'course', id: null,
    label: 'Short professional course',
    preview: `Costs ${formatMoney(courseFee, S.country)} and a month of evenings. One course per game month. +3 performance, +2 manager respect. Counts toward your next rung.`
  });
  const track = (getMergedCareerTracks(S.year)[job.track] || {});
  const cert = (PROFESSIONAL_LICENSES || []).find(l => (l.country===S.country||l.country==='local') && (track.reqDegrees || []).includes(l.reqDegree));
  if (cert) {
    const held = (S.credentials.licenses || []).includes(cert.id);
    const renewals = licenceRenewals(S);
    const rec = renewals[cert.id];
    if (held) {
      const renewFee = Math.round(convertCurrency(Math.max(60, cert.feeUsd * 0.2), 'usa', S.country, S.year));
      opts.push({
        kind: 'certification', id: cert.id,
        label: `Renew ${cert.label}`,
        preview: `You hold this licence${rec ? ` (current until ${rec.validUntilYear})` : ' (renewal not yet tracked)'}. Renewal costs ${formatMoney(renewFee, S.country)} and keeps it current for 5 years — the same licence the Education tab shows.`
      });
    } else {
      const fee = Math.round(convertCurrency(cert.feeUsd, 'usa', S.country, S.year));
      opts.push({
        kind: 'certification', id: cert.id,
        label: `Sit ${cert.label}`,
        preview: `Costs ${formatMoney(fee, S.country)} to sit. Passing it is the same board exam the Education tab shows — and it unlocks the next rung.`
      });
    }
  }
  const ls = licenceStatus(S);
  if (ls.medicalDue != null) {
    const fee = Math.round(eraUsdCost(150, S.country, S.year));
    opts.push({
      kind: 'medical', id: null,
      label: 'Annual fitness medical check',
      preview: `Costs ${formatMoney(fee, S.country)}. Your fitness check is due ${ls.medicalOverdue ? 'NOW — it is overdue, and promotion and overtime are blocked until you renew it' : `in ${ls.medicalDue}`}. Renewing keeps you cleared to practise for another year.`
    });
  }
  if (ls.simDue != null) {
    const fee = Math.round(eraUsdCost(600, S.country, S.year));
    opts.push({
      kind: 'sim', id: null,
      label: 'Simulator proficiency session',
      preview: `Costs ${formatMoney(fee, S.country)}. Your simulator check is due ${ls.simOverdue ? 'NOW — it is overdue, and promotion and overtime are blocked until you renew it' : `in ${ls.simDue}`}. Renewing keeps you cleared to fly for another year.`
    });
  }
  return opts.map(o=>({...o,locked:trainingLock(S,o.kind,o.id)}));
}

export function trainingLock(S,kind,id=null){
 const st=ensureJobActionState(S);if(!st)return 'No job.';
 if(kind==='course'&&(st.training||[]).some(t=>t.kind==='course'&&t.year===S.year&&t.month===S.month))return 'One short course per game month.';
 if(kind==='medical'&&st.licence.medicalDueYear>S.year)return 'Fitness check current until '+st.licence.medicalDueYear+'.';
 if(kind==='sim'&&st.licence.simDueYear>S.year)return 'Simulator check current until '+st.licence.simDueYear+'.';
 if(kind==='certification'&&id&&S.credentials.licenses.includes(id)&&licenceRenewals(S)[id]?.validUntilYear>S.year)return 'Licence current until '+licenceRenewals(S)[id].validUntilYear+'.';
 return null;
}

export function trainQualify(S, kind, licId = null) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  const job = S.career.job;
  const st = ensureJobActionState(S);
  const boss = bossOf(S);

  const lock=trainingLock(S,kind,licId);if(lock)return {ok:false,msg:lock};
  if (kind === 'course') {
    const fee = Math.round(eraUsdCost(400, S.country, S.year));
    if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for the course fee.` };
    walletMove(S, -fee, 'Professional short course', 'career');
    job.performance = clamp(job.performance + 3, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 2);
    st.training.push({ kind, label: 'Short professional course', year: S.year, month:S.month, cost: fee });
    if (boss) rememberDeed(S, boss, 'stepped_up', 'You paid for a professional course in your own time.', { respect: 2 });
    recordJournal(S, `Completed a short professional course (${formatMoney(fee, S.country)}) — new skills for the next rung.`, 'career');
    return { ok: true, msg: 'Course completed — performance +3, manager respect +2.' };
  }

  if (kind === 'certification' && licId) {
    const cert = PROFESSIONAL_LICENSES.find(l => l.id === licId);
    if (!cert) return { ok: false, msg: 'Licence not found.' };
    if ((S.credentials.licenses || []).includes(licId)) {
      /* Renewal of a licence already held — same id, same record. */
      const fee = Math.round(convertCurrency(Math.max(60, cert.feeUsd * 0.2), 'usa', S.country, S.year));
      if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for the renewal fee.` };
      walletMove(S, -fee, `${cert.label} renewal`, 'career');
      licenceRenewals(S)[licId] = { lastRenewedYear: S.year, validUntilYear: S.year + 5 };
      st.training.push({ kind, label: `Renewed ${cert.label}`, year: S.year, cost: fee });
      recordJournal(S, `Renewed ${cert.label} (${formatMoney(fee, S.country)}) — current until ${S.year + 5}.`, 'career');
      return { ok: true, msg: `${cert.label} renewed until ${S.year + 5}.` };
    }
    /* First sitting — the real board exam, same as the Education tab. */
    const res = sitExamOrLicensingBoard(S, 'board', licId);
    if (res.ok) {
      licenceRenewals(S)[licId] = { lastRenewedYear: S.year, validUntilYear: S.year + 5 };
      st.training.push({ kind, label: `Passed ${cert.label}`, year: S.year, cost: Math.round(convertCurrency(cert.feeUsd, 'usa', S.country, S.year)) });
    }
    return res;
  }

  if (kind === 'medical') {
    const ls = licenceStatus(S);
    if (ls.medicalDue == null) return { ok: false, msg: 'Your role has no annual fitness medical check.' };
    const fee = Math.round(eraUsdCost(150, S.country, S.year));
    if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for the medical check.` };
    walletMove(S, -fee, 'Annual fitness medical check', 'career');
    st.licence.medicalDueYear = S.year + 1;
    st.licence.lapsed = false;
    st.training.push({ kind, label: 'Annual fitness medical check', year: S.year, cost: fee });
    recordJournal(S, `Passed the annual fitness medical check (${formatMoney(fee, S.country)}) — cleared to practise until ${S.year + 1}.`, 'career');
    return { ok: true, msg: `Medical check passed — cleared until ${S.year + 1}.` };
  }

  if (kind === 'sim') {
    const ls = licenceStatus(S);
    if (ls.simDue == null) return { ok: false, msg: 'Your role has no simulator check.' };
    const fee = Math.round(eraUsdCost(600, S.country, S.year));
    if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for the simulator session.` };
    walletMove(S, -fee, 'Simulator proficiency session', 'career');
    st.licence.simDueYear = S.year + 1;
    st.licence.lapsed = false;
    job.performance = clamp(job.performance + 2, 0, 100);
    st.training.push({ kind, label: 'Simulator proficiency session', year: S.year, cost: fee });
    recordJournal(S, `Passed the simulator proficiency session (${formatMoney(fee, S.country)}) — cleared to fly until ${S.year + 1}.`, 'career');
    return { ok: true, msg: `Simulator check passed — cleared to fly until ${S.year + 1}.` };
  }

  return { ok: false, msg: 'Unknown training.' };
}

/* ------------------------------------------------------------------ */
/* 4. Ask for more — raise, shift, vacation days, bonus. A refusal    */
/*    always names the reason.                                         */
/* ------------------------------------------------------------------ */

export const ASK_KINDS = {
  shift: {
    label: 'Ask for a better shift',
    preview: 'A daytime shift instead of nights: −3 stress, +3 happiness if they agree. Needs your manager to rate you (performance + respect).'
  },
  vacation: {
    label: 'Ask for 3 extra vacation days',
    preview: 'Three more paid days off a year, added to your real balance. Needs a good year behind you — your manager can say no.'
  },
  bonus: {
    label: 'Ask for a bonus',
    preview: 'A one-off payment of half a month’s pay if they agree. Needs strong performance and a manager who rates you — and the company has to be able to afford it.'
  }
};

export function askForMore(S, kind) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  if (kind === 'raise') return requestRaiseOrPromotion(S);
  const def = ASK_KINDS[kind];
  if (!def) return { ok: false, msg: 'Unknown request.' };
  const job = S.career.job;
  const st = ensureJobActionState(S);
  if (st.lastAskYear[kind] === S.year) {
    return { ok: false, msg: 'You already asked about that this year — asking again now would only annoy your manager.' };
  }
  st.lastAskYear[kind] = S.year;
  const { boss, bossRespect, score } = bossScore(S);
  const bossName = boss ? boss.firstName : 'Management';

  const refuseReason = () => {
    if (job.performance < 60) return `your performance is ${Math.round(job.performance)}% — they want it higher before they agree to anything extra`;
    if (bossRespect < 55) return `${bossName} does not rate you highly enough yet (their respect for you is ${Math.round(bossRespect)}%)`;
    return 'the company is tight on money this year, so nothing extra is being approved';
  };

  if (kind === 'shift') {
    if (score >= 60 && chance(S, 0.45 + score / 200)) {
      S.player.vitals.stress = clamp(S.player.vitals.stress - 3);
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 3);
      if (boss) rememberDeed(S, boss, 'ask_granted', 'You asked for a better shift and they arranged it.', { affection: 3 });
      recordJournal(S, `${bossName} moved you onto a better shift at ${job.employer} — no more nights for now.`, 'career');
      return { ok: true, msg: 'Better shift agreed — stress −3, happiness +3.' };
    }
    recordJournal(S, `Asked ${bossName} for a better shift — refused, because ${refuseReason()}.`, 'career');
    return { ok: false, msg: `Shift request refused — ${refuseReason()}.` };
  }
  if (kind === 'vacation') {
    if (score >= 62 && chance(S, 0.4 + score / 200)) {
      /* Extra days live on the ONE balance: job.leave.extraDays, and
         annualDays is raised with them (getJobContract preserves them). */
      const contract = getJobContract(S);
      const leave = (contract && contract.leave) || job.leave;
      if (leave) {
        leave.extraDays = (leave.extraDays || 0) + 3;
        leave.annualDays += 3;
      }
      if (boss) rememberDeed(S, boss, 'ask_granted', 'You asked for extra vacation days and they agreed.', { affection: 3 });
      recordJournal(S, `${bossName} added 3 extra vacation days to your yearly balance at ${job.employer}.`, 'career');
      return { ok: true, msg: '3 extra vacation days added to your yearly balance.' };
    }
    recordJournal(S, `Asked ${bossName} for extra vacation days — refused, because ${refuseReason()}.`, 'career');
    return { ok: false, msg: `Extra vacation days refused — ${refuseReason()}.` };
  }
  /* bonus */
  if (score >= 75 && chance(S, 0.35 + score / 220)) {
    const bonus = Math.round(job.monthlyGross * 0.5);
    walletMove(S, bonus, `Performance bonus — ${job.employer}`, 'career');
    if (boss) rememberDeed(S, boss, 'ask_granted', 'You asked for a bonus and they paid one.', { affection: 4, respect: 2 });
    recordJournal(S, `${bossName} approved a ${formatMoney(bonus, S.country)} bonus at ${job.employer}.`, 'career');
    return { ok: true, msg: `Bonus approved — ${formatMoney(bonus, S.country)} paid into your account.` };
  }
  recordJournal(S, `Asked ${bossName} for a bonus — refused, because ${refuseReason()}.`, 'career');
  return { ok: false, msg: `Bonus refused — ${refuseReason()}.` };
}

/* ------------------------------------------------------------------ */
/* 5. Move inside the company — a REAL transfer through the visa and  */
/*    move systems, not a label change.                                */
/* ------------------------------------------------------------------ */

export const TRANSFER_DESTINATIONS = ['gbr', 'usa', 'deu', 'can', 'aus', 'sau', 'uae'];

export function requestTransfer(S) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  const queued=queueScene(S,buildCareerMobilityScene(S));
  if (!queued) return { ok: false, msg: 'A transfer conversation is already open.' };
  return { ok: true, msg: 'Transfer request opened — pick a destination.' };
}

export function buildCareerMobilityScene(S,snapshot){
 const job=S.career.job;if(!job||!S.career.employed)return null;
 const q=snapshot||{employer:job.employer,title:job.title,track:job.track,country:S.country,year:S.year};
 const valid=st=>st.career.employed&&st.career.job?.employer===q.employer&&st.career.job?.title===q.title&&st.career.job?.track===q.track&&st.country===q.country;
 if(!valid(S))return null;
 return{key:'transfer_'+q.year,baseId:'job_transfer',category:'career',careerMobilitySnapshot:q,title:'Look for Sponsored Work Abroad',text:'A new-employer search, not an internal transfer from '+q.employer+'. Passport eligibility, fees and relocation checks apply. A match may require a household and business move decision.',choices:TRANSFER_DESTINATIONS.filter(d=>d!==q.country).map(d=>({label:getCountry(d).name+' · search',available:valid,effect:st=>{if(valid(st))doTransfer(st,d);}})).concat([{label:'Stay where I am',effect:st=>recordJournal(st,'Kept the current job and location.','career')}])};
}
export function restoreCareerMobilityScene(S,saved){return saved?.careerMobilitySnapshot?buildCareerMobilityScene(S,saved.careerMobilitySnapshot):null;}

function doTransfer(S, destCountry) {
  const job = S.career.job;
  if (!job) return;
  const oldCountry = S.country;
  const destName = getCountry(destCountry).name;
  const spouseId = (S.relations.spouseIds || [])[0];
  const spouse = spouseId ? S.people[spouseId] : null;
  if (spouse && spouse.alive && spouse.rel.affection < 45) {
    recordJournal(S, `You asked ${spouse.firstName} about moving the family to ${destName} for a transfer — they refused. “I am not leaving my life here.” The transfer is off until your marriage is stronger.`, 'career');
    return;
  }
  const children = (S.relations.childIds || []).map(id => S.people[id]).filter(p => p && p.alive);
  const res = applyDirectSkilledVisa(S, destCountry);
  if (!res.ok) {
    recordJournal(S, `Your transfer to ${destName} fell through: ${res.msg}`, 'career');
    return;
  }
  if(res.deferred){recordJournal(S,'Sponsored-work match awaits the separate business and relocation decision. No completed move is claimed.','career');return;}
  /* The visa system moved the household. The spouse's old job does not
     survive the move — that is a real consequence, on their own record. */
  if (spouse && spouse.alive && spouse.career && spouse.career.employer) {
    const oldJob = `${spouse.career.title} at ${spouse.career.employer}`;
    spouse.career.title = 'Seeking Work';
    spouse.career.employer = null;
    spouse.career.monthlyIncomeLocal = 0;
    recordJournal(S, `${spouse.firstName} left ${oldJob} in ${getCountry(oldCountry).name} for the move to ${destName} — they will need to find work there.`, 'career');
  }
  if (children.length) {
    recordJournal(S, `The children (${children.map(c => c.firstName).join(', ')}) will need new schools in ${destName}.`, 'career');
  }
  recordJournal(S, `Moved to ${destName} through a new sponsored role. Review Passport and household records for the new status.`, 'career');
}

/* ------------------------------------------------------------------ */
/* 6. Take leave — vacation from the REAL balance, with approval.     */
/* ------------------------------------------------------------------ */

export const LEAVE_KINDS = {
  vacation5: { kind: 'vacation', days: 5, label: 'Take 5 days’ vacation' },
  vacation10: { kind: 'vacation', days: 10, label: 'Take 10 days’ vacation' },
  sick: { kind: 'sick', days: 3, label: 'Take sick leave (3 days)' },
  parental: { kind: 'parental', days: 30, label: 'Take parental leave (30 days)' },
  unpaid: { kind: 'unpaid', days: 5, label: 'Take unpaid leave (5 days)' }
};

export function leavePreview(S) {
  const bal = vacationBalance(S);
  const net = S.career.job ? computeMonthlyNetPay(S.career.job.monthlyGross, S.country, S.year, true).net : 0;
  const dailyNet = Math.round(net / 30);
  return {
    balance: bal,
    vacation5: `Needs your manager’s approval. Approved: ${bal.left} → ${Math.max(0, bal.left - 5)} days left, stress −5, happiness +5. Refused: nothing spent, but your manager remembers you asked.`,
    vacation10: `Needs your manager’s approval and ${bal.left >= 10 ? 'you have the days' : 'you do NOT have 10 days left — it will be refused'}. Approved: stress −10, happiness +10.`,
    sick: `Paid, 3 days, once per month in this game, no vacation days spent. Performance −1 (you were away), stress −4, health +2.`,
    parental: `30 days at half pay — about ${formatMoney(Math.round(net * 0.5), S.country)} less in your pocket. Once per 12 months in this game, only during pregnancy or with a baby under one. Performance −2, happiness +4.`,
    unpaid: `One 5-day block per month in this game with no pay, about ${formatMoney(dailyNet * 5, S.country)} less. Performance −2, stress −3. Your manager can say no.`
  };
}

export function requestLeave(S, kindKey) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  const def = LEAVE_KINDS[kindKey];
  if (!def) return { ok: false, msg: 'Unknown leave.' };
  const job = S.career.job;
  const st = ensureJobActionState(S);
  const period=S.year*12+S.month;
  if(def.kind==='sick'&&st.sickLeavePeriod===period)return {ok:false,msg:'You already took the modeled sick-leave allowance this month.'};
  if(def.kind==='unpaid'&&st.unpaidLeavePeriod===period)return {ok:false,msg:'You already took this unpaid-leave block this month.'};
  if(def.kind==='parental'&&st.parentalLeavePeriod!=null&&period-st.parentalLeavePeriod<12)return {ok:false,msg:'You already took parental leave within the last 12 months.'};
  const { boss, bossRespect, score } = bossScore(S);
  const bossName = boss ? boss.firstName : 'Management';
  const log = (approved, reason) => {
    st.leaveLog.unshift({ kind: def.kind, days: def.days, approved, reason, year: S.year, month: S.month });
    if (st.leaveLog.length > 24) st.leaveLog.length = 24;
  };

  if (def.kind === 'vacation') {
    const bal = vacationBalance(S);
    if (bal.left < def.days) {
      log(false, `Only ${bal.left} of ${bal.entitlement} vacation days left this year.`);
      return { ok: false, msg: `You only have ${bal.left} of your ${bal.entitlement} vacation days left this year — not enough for ${def.days} days.` };
    }
    if (score < 55 || !chance(S, 0.5 + score / 200)) {
      const reason = score < 55
        ? 'your performance is low and the team cannot spare you right now'
        : 'the team is short-staffed this month';
      log(false, `Manager refused: ${reason}.`);
      if (boss) rememberDeed(S, boss, 'leave_refused', 'You asked for vacation and they said no.', { resentment: 2 });
      recordJournal(S, `Asked ${bossName} for ${def.days} days’ vacation — refused, because ${reason}. The days stay in your balance.`, 'career');
      return { ok: false, msg: `Vacation refused — ${reason}. No days spent.` };
    }
    /* Spend from the ONE balance: job.leave.usedDays. */
    const contract = getJobContract(S);
    if (contract && contract.leave) contract.leave.usedDays += def.days;
    else if (job.leave) job.leave.usedDays += def.days;
    S.player.vitals.stress = clamp(S.player.vitals.stress - def.days);
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + def.days);
    log(true, `Approved by ${bossName}.`);
    recordJournal(S, `${bossName} approved ${def.days} days’ vacation — ${bal.left - def.days} of your ${bal.entitlement} days left this year.`, 'career');
    return { ok: true, msg: `${def.days} days’ vacation approved — ${bal.left - def.days} days left this year.` };
  }

  if (def.kind === 'sick') {
    st.sickLeavePeriod=period;
    job.performance = clamp(job.performance - 1, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress - 4);
    S.player.vitals.health = clamp(S.player.vitals.health + 2);
    log(true, 'Paid sick leave.');
    recordJournal(S, `Took 3 days’ paid sick leave to recover.`, 'career');
    return { ok: true, msg: 'Sick leave approved (paid) — stress −4, health +2, performance −1.' };
  }

  if (def.kind === 'parental') {
    const hasBaby = S.marriage.pregnancy ||
      (S.relations.childIds || []).some(id => { const c = S.people[id]; return c && c.alive && c.age < 1; });
    if (!hasBaby) {
      return { ok: false, msg: 'Parental leave is for a new baby — your partner is not pregnant and you have no baby under one.' };
    }
    st.parentalLeavePeriod=period;
    const net = computeMonthlyNetPay(job.monthlyGross, S.country, S.year, true).net;
    const deduction = Math.round(net * 0.5);
    walletMove(S, -deduction, 'Parental leave — 30 days at half pay', 'career');
    job.performance = clamp(job.performance - 2, 0, 100);
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + 4);
    log(true, 'Half pay for 30 days.');
    recordJournal(S, `Took 30 days’ parental leave at half pay (${formatMoney(deduction, S.country)} less this month) to be with the baby.`, 'career');
    return { ok: true, msg: `Parental leave approved — 30 days at half pay (${formatMoney(deduction, S.country)} less).` };
  }

  /* unpaid */
  if (score < 50 || !chance(S, 0.55 + score / 220)) {
    const reason = score < 50 ? 'your performance is too low for time off without pay' : 'your manager needs you in the office this month';
    log(false, `Manager refused: ${reason}.`);
    recordJournal(S, `Asked ${bossName} for 5 days’ unpaid leave — refused, because ${reason}.`, 'career');
    return { ok: false, msg: `Unpaid leave refused — ${reason}.` };
  }
  st.unpaidLeavePeriod=period;
  const net = computeMonthlyNetPay(job.monthlyGross, S.country, S.year, true).net;
  const deduction = Math.round((net / 30) * def.days);
  walletMove(S, -deduction, `Unpaid leave — ${def.days} days without pay`, 'career');
  job.performance = clamp(job.performance - 2, 0, 100);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 3);
  log(true, `Unpaid: ${formatMoney(deduction, S.country)} deducted.`);
  recordJournal(S, `Took ${def.days} days’ unpaid leave (${formatMoney(deduction, S.country)} less this month).`, 'career');
  return { ok: true, msg: `Unpaid leave approved — ${formatMoney(deduction, S.country)} less this month, stress −3.` };
}

/* ------------------------------------------------------------------ */
/* 7. Promotion — apply → interview scene → offer / rejection with a   */
/*    real reason. A player who does not qualify sees what is missing. */
/* ------------------------------------------------------------------ */

export function promotionEligibility(S) {
  const job = S?.career?.job;
  if (!job) return { nextRung: null, missing: ['You are not currently employed.'], eligible: false };
  const track = getMergedCareerTracks(S.year)[job.track];
  const nextRung = track?.rungs?.[job.level + 1] || null;
  if (!nextRung) return { nextRung: null, missing: ['You are already at the top rung of this track.'], eligible: false };
  const missing = [];
  const trackExp = S.career.trackExperience[job.track] || 0;
  if (trackExp < nextRung.minExp) missing.push(`needs ${nextRung.minExp} years’ experience in this track — you have ${trackExp}`);
  if ((job.monthsInRole || 0) < 6) missing.push(`needs at least 6 months in your current role — you have ${job.monthsInRole || 0}`);
  if (job.performance < 72) missing.push(`needs performance of 72% — yours is ${Math.round(job.performance)}%`);
  const ls = licenceStatus(S);
  if (ls.required && !ls.held) missing.push(`needs ${ls.required.label} — you do not hold it (see Train & Licences)`);
  if (ls.lapsed) missing.push('your licence check is overdue — renew it under Train & Licences');
  const st = ensureJobActionState(S);
  if (st.warnings >= 2) missing.push('you are on a performance plan after warnings — clear it first');
  return { nextRung, missing, eligible: missing.length === 0 };
}

registerPromotionEligibility(promotionEligibility);
function buildPromotionInterviewScene(S, nextRung) {
  const job = S.career.job;
  const boss = bossOf(S);
  const bossName = boss ? boss.fullName : 'your manager';
  const track = getMergedCareerTracks(S.year)[job.track];
  const currentRung = track?.rungs?.[job.level];
  const st = ensureJobActionState(S);
  return {
    key: `promotion_${nextRung.title}_${S.year}`,
    baseId: 'promotion_interview',
    title: `Promotion interview — ${nextRung.title}`,
    category: 'career',
    text: `${bossName} sits you down about the ${nextRung.title} opening. “We have one seat and three names on the list. Yours is on it — but I need to hear why it should be you.” Your performance is ${Math.round(job.performance)}%, you have ${st.steppedUp.length} time(s) on record stepping up for the team, and ${boss ? `${boss.firstName}’s respect for you is ${Math.round(boss.rel.respect)}%` : 'management is watching'}. What do you say?`,
    choices: [
      {
        label: 'Talk through the numbers — what you delivered this year',
        effect: (stt) => decidePromotion(stt, 'numbers')
      },
      {
        label: 'Ask what the role really needs, and listen',
        effect: (stt) => {
          const j = stt.career.job;
          if (!j) return;
          j.performance = clamp(j.performance + 1, 0, 100);
          recordJournal(stt, `In the promotion interview you asked what the ${nextRung.title} role really needs — ${bossName} was impressed you listened, and told you exactly what to build. The application stays open.`, 'career');
        }
      },
      {
        label: 'Withdraw the application',
        effect: (stt) => {
          const ast = ensureJobActionState(stt);
          if (ast) ast.promotion = null;
          recordJournal(stt, `Withdrew your application for ${nextRung.title} — the timing did not feel right.`, 'career');
        }
      }
    ]
  };
}

/* A pending promotion interview is rebuilt from state after a reload. If it cannot be (job gone or changed), the stuck "interview scheduled" flag is cleared instead of blocking every later application. */
export function restorePromotionInterviewScene(S, saved) {
  if (!saved || !/^promotion_/.test(saved.key || '')) return null;
  const st = ensureJobActionState(S);
  const pend = st?.promotion;
  const job = S.career?.job;
  if (!pend || pend.stage !== 'interview' || !job) { if (pend && pend.stage === 'interview') st.promotion = null; return null; }
  const track = getMergedCareerTracks(S.year)[job.track];
  const nextRung = track?.rungs?.[job.level + 1];
  if (!nextRung || nextRung.title !== pend.rungTitle) { st.promotion = null; return null; }
  return { ...buildPromotionInterviewScene(S, nextRung), key: saved.key };
}

export function applyPromotion(S) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  const job = S.career.job;
  const { nextRung, missing, eligible } = promotionEligibility(S);
  if (!eligible) {
    return { ok: false, msg: `Not yet ready for ${nextRung ? nextRung.title : 'the next rung'}: ${missing.join('; ')}.` };
  }
  const st = ensureJobActionState(S);
  if (st.promotion && st.promotion.stage === 'interview') {
    return { ok: false, msg: 'Your promotion interview is already scheduled — check your scenes.' };
  }
  const boss = bossOf(S);
  const bossName = boss ? boss.fullName : 'your manager';
  const track = getMergedCareerTracks(S.year)[job.track];
  const currentRung = track?.rungs?.[job.level];
  st.promotion = { rungTitle: nextRung.title, stage: 'interview', appliedYear: S.year };

  const queued = queueScene(S, buildPromotionInterviewScene(S, nextRung));
  if (!queued) return { ok: false, msg: 'The interview could not be scheduled right now — another scene is waiting.' };
  return { ok: true, msg: `Promotion interview scheduled with ${bossName} — check the scene and answer it.` };
}

function decidePromotion(S, approach) {
  const job = S.career.job;
  if (!job) return;
  const st = ensureJobActionState(S);
  const { nextRung } = promotionEligibility(S);
  const rung = nextRung || (getMergedCareerTracks(S.year)[job.track]?.rungs?.[job.level + 1]);
  if (!rung) return;
  const boss = bossOf(S);
  const steppedUp = st.steppedUp.length;
  const refBonus = st.reference ? Math.min(10, st.reference.strength / 10) : 0;
  /* v2.15 W2 — a mentor's word in the room (+12) and a rival for the
     same seat (−10 if they are ahead of you, +5 if you are ahead).
     promotionScoreParts in careerMarket.js mirrors this sum exactly. */
  const mentorBonus = S.career.market?.mentor ? 12 : 0;
  const rivalRec = S.career.market?.rival;
  const rivalTerm = !rivalRec ? 0 : (rivalRec.performance ?? 0) > job.performance ? -10 : 5;
  const rivalPerson = rivalRec ? S.people[rivalRec.personId] : null;
  const score = job.performance + (boss ? boss.rel.respect : 60) + steppedUp * 3 + refBonus + mentorBonus + rivalTerm + randInt(S, 0, 20);
  const frozen = chance(S, 0.12);
  if (frozen) {
    st.promotion = { rungTitle: rung.title, stage: 'rejected', appliedYear: S.year };
    recordJournal(S, `Your promotion interview for ${rung.title} went well — but the company froze promotions above your grade this cycle. Nothing about you: there is simply no seat to fill.`, 'career');
    return;
  }
  if (score >= 150) {
    const track = getMergedCareerTracks(S.year)[job.track];
    const ratio = payRatio(S.country, job.track, track.payMult, track.rungs[job.level]?.mult || 1, rung.mult);
    job.level = rung.level;
    job.title = jobEmploymentFraction(job) < 1 ? `Part-Time ${rung.title}` : rung.title;
    job.monthlyGross = Math.round(job.monthlyGross * ratio); job.payIndexYear = S.year;
    job.monthsInRole = 0;
    job.performance = clamp(job.performance + 3, 0, 100);
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + 8);
    st.promotion = { rungTitle: rung.title, stage: 'offer', appliedYear: S.year };
    recordJournal(S, `Promoted to ${rung.title} at ${job.employer}! Monthly pay rose to ${formatMoney(job.monthlyGross, S.country)}.${rivalPerson ? ` You beat ${rivalPerson.firstName} to the seat.` : ''}`, 'milestone');
    return;
  }
  st.promotion = { rungTitle: rung.title, stage: 'rejected', appliedYear: S.year };
  let reason;
  if (rivalRec && rivalTerm < 0) reason = `${rivalPerson ? rivalPerson.firstName : 'Your rival'} had the panel's ear this time — their performance is ${Math.round(rivalRec.performance)}% against your ${Math.round(job.performance)}%`;
  else if (job.performance < 78) reason = `your performance (${Math.round(job.performance)}%) dipped below what the panel wanted this year`;
  else if (steppedUp === 0) reason = 'the other candidate had led more projects and stepped up more visibly than you';
  else if (boss && boss.rel.respect < 70) reason = `${boss.firstName} could not argue your case strongly enough in the room — their respect for you is ${Math.round(boss.rel.respect)}%`;
  else reason = 'the other candidate had more years in the grade than you';
  recordJournal(S, `Passed over for ${rung.title} at ${job.employer}: ${reason}. The application stays on your record — fix it and apply again.`, 'career');
}

/* ------------------------------------------------------------------ */
/* 8. People at work — the manager and colleagues are real people.    */
/* ------------------------------------------------------------------ */

export function peopleAtWork(S, action, personId) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  const person = personId ? S.people[personId] : null;
  if (!person || !person.alive) return { ok: false, msg: 'That person is not at work any more.' };
  const isBoss = person.id === S.career.job.bossId;
  const isColleague = person.role === 'colleague';
  if (!isBoss && !isColleague) return { ok: false, msg: 'That person does not work with you.' };
  const job = S.career.job;
  const st = ensureJobActionState(S);

  if (action === 'praise') {
    rememberDeed(S, person, 'praised', `You praised ${person.firstName} in front of the team.`, { affection: 5, respect: 3 });
    if (isBoss) recordJournal(S, `You told ${person.firstName} — your manager — that their leadership this quarter was genuinely good. They remembered it.`, 'career');
    else recordJournal(S, `You praised ${person.firstName} in front of the team.`, 'career');
    return { ok: true, msg: `${person.firstName} appreciated it — affection +5, respect +3.` };
  }

  if (action === 'ask_help') {
    const cdKey = `help_${person.id}`;
    if (S.cooldowns[cdKey] && S.turn < S.cooldowns[cdKey]) {
      return { ok: false, msg: `You asked ${person.firstName} for help only recently — do not lean on them again yet.` };
    }
    S.cooldowns[cdKey] = S.turn + 6;
    rememberDeed(S, person, 'helped', `You asked ${person.firstName} for help and they gave it.`, { affection: 3, trust: 4 });
    job.performance = clamp(job.performance + 2, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress - 3);
    recordJournal(S, `${person.firstName} helped you through a hard week at ${job.employer} — you owe them one.`, 'career');
    return { ok: true, msg: `${person.firstName} helped — performance +2, stress −3, trust +4.` };
  }

  if (action === 'ask_reference') {
    if (person.rel.respect < 65 || person.rel.trust < 60) {
      const missing = [];
      if (person.rel.respect < 65) missing.push(`their respect for you is ${Math.round(person.rel.respect)}% (needs 65%)`);
      if (person.rel.trust < 60) missing.push(`their trust in you is ${Math.round(person.rel.trust)}% (needs 60%)`);
      return { ok: false, msg: `${person.firstName} will not write you a reference yet — ${missing.join(' and ')}. Build the relationship first.` };
    }
    st.reference = { fromId: person.id, fromName: person.fullName, strength: Math.round(person.rel.respect) };
    rememberDeed(S, person, 'reference', `You asked ${person.firstName} for a reference and they agreed to write a strong one.`, { affection: 3, respect: 2 });
    recordJournal(S, `${person.firstName} agreed to write you a strong reference — it will help your next promotion interview and your next job application.`, 'career');
    return { ok: true, msg: `${person.firstName} will write you a strong reference (strength ${st.reference.strength}%).` };
  }

  if (action === 'argue') {
    rememberDeed(S, person, 'argued', `You argued with ${person.firstName} at work.`, { affection: -8, respect: -5, resentment: 10 });
    recordJournal(S, `You argued with ${person.firstName} at ${job.employer} — voices raised, in front of people. It reached the rest of the team.`, 'career');
    if (isBoss) {
      const boss = person;
      if (boss.rel.respect < 40 && st.warnings < 3) {
        st.warnings += 1;
        recordJournal(S, `${boss.firstName} put a formal warning on your file after the argument — warning ${st.warnings} of 3. One more process and you are on a performance plan.`, 'career');
        return { ok: true, msg: `The argument reached your manager — and earned you a formal warning (${st.warnings} of 3).` };
      }
      return { ok: true, msg: `You argued with your manager — respect −5, resentment +10 on their record.` };
    }
    return { ok: true, msg: `You argued with ${person.firstName} — affection −8, respect −5, resentment +10 on their record.` };
  }

  return { ok: false, msg: 'Unknown interaction.' };
}

/* ------------------------------------------------------------------ */
/* 9. Security — warnings first, then a plan, then dismissal.         */
/*    Resigning serves a notice period; the reference depends on how   */
/*    you left. Redundancy/dismissal pays the country's severance.    */
/* ------------------------------------------------------------------ */

export function securitySummary(S) {
  const job = S?.career?.job;
  if (!job) return null;
  const st = ensureJobActionState(S);
  const { noticeMonths, severanceMonths, source, note } = noticeAndSeveranceFor(S.country, yearsService(S));
  return {
    warnings: st.warnings,
    performancePlan: st.performancePlan,
    noticeServing: st.noticeServing,
    noticeMonths: Math.max(1, Math.ceil(noticeMonths)),
    severanceMonths,
    severanceAmount: Math.round(job.monthlyGross * severanceMonths),
    severanceSource: source,
    severanceNote: note,
    reference: S.career.lastReference || null
  };
}

export function requestResign(S) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'No active job.' };
  const st = ensureJobActionState(S);
  if (st.noticeServing) {
    const left = Math.max(0, st.noticeServing.untilTurn - S.turn);
    return { ok: false, msg: `Your notice is already being served — ${left} month(s) left. Walking out now is still possible, but it costs you the reference.` };
  }
  const { noticeMonths } = noticeAndSeveranceFor(S.country, yearsService(S));
  const months = Math.max(1, Math.ceil(noticeMonths));
  st.noticeServing = { untilTurn: S.turn + months, months };
  recordJournal(S, `You handed in your notice at ${S.career.job.employer} — ${months} month(s) to work before you leave. Your reference depends on how you leave: work the notice well and it is a good one.`, 'career');
  return { ok: true, msg: `Notice handed in — ${months} month(s) to serve. You keep working (and being paid) until then.` };
}

export function walkOut(S) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'No active job.' };
  const boss = bossOf(S);
  const employer = S.career.job.employer;
  S.career.lastReference = { kind: 'poor', from: boss ? boss.fullName : 'Management', note: 'Walked out without serving notice.' };
  const res = resignCurrentJob(S);
  recordJournal(S, `You walked out of ${employer} without serving notice — no handover, no goodbye. Your reference from ${boss ? boss.fullName : 'management'} will say so.`, 'career');
  return { ok: res.ok, msg: `${res.msg} You walked out — your reference is now poor.` };
}

function completeNoticeResignation(S) {
  const job = S.career.job;
  if (!job) return;
  const st = ensureJobActionState(S);
  const boss = bossOf(S);
  const good = job.performance >= 60 && st.warnings === 0;
  S.career.lastReference = {
    kind: good ? 'good' : 'mixed',
    from: boss ? boss.fullName : 'Management',
    note: good ? 'Served the full notice period in good standing.' : 'Served notice, but with warnings on file.'
  };
  st.noticeServing = null;
  const res = resignCurrentJob(S);
  recordJournal(S, `Your notice period ended at ${job.employer}. Reference: ${S.career.lastReference.kind} — ${S.career.lastReference.note}`, 'career');
}

function dismissForCause(S) {
  const job = S.career.job;
  if (!job) return;
  const { severanceMonths, source } = noticeAndSeveranceFor(S.country, yearsService(S));
  const severance = Math.round(job.monthlyGross * severanceMonths);
  const boss = bossOf(S);
  const employer = job.employer;
  S.career.employed = false;
  S.career.job = null;
  S.career.lastReference = { kind: 'poor', from: boss ? boss.fullName : 'Management', note: 'Dismissed after three warnings.' };
  (S.career.dismissedFrom ||= []).push({ employer, year: S.year });
  if (severance > 0) {
    walletMove(S, severance, `Severance after dismissal — ${employer}`, 'career');
  }
  recordJournal(S, `Dismissed from ${employer} after three formal warnings${severance > 0 ? ` — ${formatMoney(severance, S.country)} severance paid (${source === 'law' ? 'by law' : 'modelled practice'})` : ' — no severance is owed under local rules'}. Your reference will say you were dismissed.`, 'career');
}

/* ------------------------------------------------------------------ */
/* 10. The yearly review — a real scene with the manager, with words. */
/* ------------------------------------------------------------------ */

function queueReviewScene(S) {
  const job = S.career.job;
  const boss = bossOf(S);
  if (!boss) return;
  const perf = Math.round(job.performance);
  const band = perf >= 85 ? 'outstanding'
    : perf >= 72 ? 'strong'
    : perf >= 60 ? 'solid but unremarkable'
    : perf >= 45 ? 'below where it needs to be' : 'poor';
  const steppedUp = ensureJobActionState(S).steppedUp.length;
  queueScene(S,buildCareerReviewScene(S,{year:S.year,bossId:boss.id,bossName:boss.firstName,employer:job.employer,jobId:job.id,perf,band,steppedUp}));
}

function queueWarningScene(S) {
  const job = S.career.job;
  const boss = bossOf(S);
  if (!boss) return;
  const st = ensureJobActionState(S);
  /* each issued warning is its own event: a warning withdrawn on appeal and earned again later in the same year is a new one, so its answer is not blocked by the earlier one */
  st.warningSeq = (st.warningSeq || 0) + 1;
  queueScene(S,buildCareerWarningScene(S,{year:S.year,bossId:boss.id,bossName:boss.firstName,employer:job.employer,jobId:job.id,warnings:st.warnings,seq:st.warningSeq}));
}

/* Monthly tick — called from the game loop after tickCareerMonthly. */
export function tickCareerActionsMonthly(S) {
  if (!S.career.employed || !S.career.job) return;
  ensureExtendedState(S);
  const job = S.career.job;
  if(partTimeJob(job)&&['hard','overtime'].includes(job.workMode))job.workMode='normal';
  const st = ensureJobActionState(S);
  if (!st) return;

  /* Leave-year rollover is owned by getJobContract (called by the monthly
     tick and by vacationBalance) — nothing here stores leave. */

  /* Work-hard effects (the base tick only handles overtime/coast). */
  if (job.workMode === 'hard') {
    job.performance = clamp(job.performance + 0.8, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 2);
    const boss = bossOf(S);
    if (boss) boss.rel.respect = clamp(boss.rel.respect + 1);
  }
  if (job.workMode === 'coast') {
    const boss = bossOf(S);
    if (boss) boss.rel.respect = clamp(boss.rel.respect - 1);
  }
  /* v2.19 W5 — the work-pace preview promises a health move (hard −1,
     overtime −1, coast +1 a month) but no tick ever applied
     WORK_MODES.healthPerMonth, and the overtime preview's "(+respect)"
     had no boss-respect move behind it (only managerView +1 in the base
     tick). Both now land here, from the same table the preview reads. */
  const wm = WORK_MODES[job.workMode];
  if (wm && wm.healthPerMonth) S.player.vitals.health = clamp(S.player.vitals.health + wm.healthPerMonth);
  if (job.workMode === 'overtime') {
    const boss = bossOf(S);
    if (boss) boss.rel.respect = clamp(boss.rel.respect + 1);
  }

  /* Licence lapse: an overdue medical / simulator check blocks promotion
     and overtime until renewed — the player is told plainly, in the tab. */
  const ls = licenceStatus(S);
  if (ls.lapsed && !st.licence.lapsedNoted) {
    st.licence.lapsed = true;
    st.licence.lapsedNoted = true;
    recordJournal(S, `Your licence check is overdue (${ls.medicalOverdue ? 'fitness medical' : ''}${ls.medicalOverdue && ls.simOverdue ? ' and ' : ''}${ls.simOverdue ? 'simulator' : ''}${ls.renewalLapsed ? 'board renewal' : ''}) — renew it under Train & Licences. Flying duty is suspended for pilots with overdue medical/simulator checks; the game assigns 50% base-pay ground duty. Promotion and overtime are blocked until renewed.`, 'career');
  } else if (!ls.lapsed) {
    st.licence.lapsed = false;
    st.licence.lapsedNoted = false;
  }

  /* Warning process: three months under 45% performance earns a warning;
     three warnings earn dismissal — never a random firing. */
  if (job.performance < 45) st.lowPerfMonths += 1;
  else st.lowPerfMonths = 0;
  let justWarned = false;
  if (st.lowPerfMonths >= 3 && st.warnings < 3) {
    justWarned = true;
    st.warnings += 1;
    st.lowPerfMonths = 0;
    st.performancePlan = st.warnings >= 2;
    queueWarningScene(S);
  }
  /* Played defect: the third warning and the dismissal landed in the same month, so the player met two warning scenes and the journal said three. The third is now delivered, and dismissal follows on the next monthly tick. */
  if (st.warnings >= 3 && !justWarned) {
    dismissForCause(S);
    return;
  }

  /* Yearly review scene, on the 12-month marks of the role. */
  if ((job.monthsInRole || 0) > 0 && (job.monthsInRole % 12 === 0) && st.reviewLastYear !== S.year) {
    st.reviewLastYear = S.year;
    queueReviewScene(S);
  }

  /* Notice period served: the resignation completes through the real
     resign function (gratuity and visa grace preserved). */
  if (st.noticeServing && S.turn >= st.noticeServing.untilTurn) {
    completeNoticeResignation(S);
  }
}

/* ------------------------------------------------------------------ */
/* Preview helpers for the Career tab (what the player sees BEFORE     */
/* committing). Every button prints its cost and consequence.          */
/* ------------------------------------------------------------------ */

export function peopleOptions(S) {
  const out = [];
  const boss = bossOf(S);
  if (boss) {
    out.push({
      id: boss.id, name: boss.fullName, role: 'Manager',
      rel: `Affection ${Math.round(boss.rel.affection)} · Respect ${Math.round(boss.rel.respect)} · Trust ${Math.round(boss.rel.trust)}`
    });
  }
  for (const c of colleaguesOf(S)) {
    out.push({
      id: c.id, name: c.fullName, role: 'Colleague',
      rel: `Affection ${Math.round(c.rel.affection)} · Respect ${Math.round(c.rel.respect)} · Trust ${Math.round(c.rel.trust)}`
    });
  }
  return out;
}

export function actionPreviews(S) {
  if (!S.career.employed || !S.career.job) return null;
  const job = S.career.job;
  const st = ensureJobActionState(S);
  const promo = promotionEligibility(S);
  const sec = securitySummary(S);
  const ls = licenceStatus(S);
  return {
    workModes: workModePreview(S),
    takeOn: Object.entries(TAKE_ON_WORK).map(([kind, d]) => ({ kind, label: d.label, preview: d.preview })),
    train: trainOptions(S),
    ask: Object.entries(ASK_KINDS).map(([kind, d]) => ({ kind, label: d.label, preview: d.preview })),
    leave: leavePreview(S),
    promotion: promo,
    people: peopleOptions(S),
    security: sec,
    licence: ls,
    steppedUpCount: st.steppedUp.length,
    leaveLog: st.leaveLog.slice(0, 5),
    reference: st.reference
  };
}

export function buildCareerReviewScene(S,snapshot){
 const{year,bossId,bossName,employer,jobId,perf,band,steppedUp}=snapshot;
 const boss=S.people[bossId];if(!boss?.alive||!S.career.job||S.career.job.employer!==employer||(jobId&&S.career.job.id!==jobId))return null;
  return {
    key: `review_${year}`,
    baseId: 'annual_review',
    recurring: true, /* the review is yearly for the whole career; the anti-spam caps dropped every one after the third */
    title: `Your annual review with ${boss.firstName}`,
    category: 'career',
    text: `${employer} · ${year}. ${bossName} rates you ${perf}% (${band}). Times you took on extra work for the team: ${steppedUp}. Ask for feedback, check current promotion requirements, or contest the rating.`,
    careerReviewSnapshot:snapshot,
    choices: [
      {
        label: 'Thank them, and ask what to improve',
        effect: (stt) => {
          if(!stt.career.job||stt.career.job.employer!==employer||(jobId&&stt.career.job.id!==jobId)||!stt.people[bossId]?.alive)return;
          stt.career.reviewReplies??={};const replyKey=(snapshot.warnings!==undefined?'warning_'+warnings+(snapshot.seq?'#'+snapshot.seq:''):'review')+'_'+employer+'_'+year;if(stt.career.reviewReplies[replyKey]){recordJournal(stt,`You had already answered this at ${employer} in ${year}. Nothing changed.`,'career');return;}stt.career.reviewReplies[replyKey]=true;
          const b = stt.people[bossId];
          if (b) rememberDeed(stt, b, 'review_good', 'You took the review well and asked how to improve.', { affection: 3, respect: 4 });
          if (stt.career.job) stt.career.job.performance = clamp(stt.career.job.performance + 2, 0, 100);
          recordJournal(stt, `Your annual review with ${boss.firstName}: ${perf}% — you thanked them and asked what to improve. Performance +2.`, 'career');
        }
      },
      {
        label: 'Ask directly about promotion',
        effect: (stt) => {
          if(!stt.career.job||stt.career.job.employer!==employer||(jobId&&stt.career.job.id!==jobId)||!stt.people[bossId]?.alive)return;
          stt.career.reviewReplies??={};const replyKey=(snapshot.warnings!==undefined?'warning_'+warnings+(snapshot.seq?'#'+snapshot.seq:''):'review')+'_'+employer+'_'+year;if(stt.career.reviewReplies[replyKey]){recordJournal(stt,`You had already answered this at ${employer} in ${year}. Nothing changed.`,'career');return;}stt.career.reviewReplies[replyKey]=true;
          recordJournal(stt, `At your review you asked ${boss.firstName} directly about promotion.`, 'career');
          const res = applyPromotion(stt);
          if (!res.ok) recordJournal(stt, `${boss.firstName}’s answer: ${res.msg}`, 'career');
        }
      },
      {
        label: 'Push back — the rating is unfair',
        effect: (stt) => {
          if(!stt.career.job||stt.career.job.employer!==employer||(jobId&&stt.career.job.id!==jobId)||!stt.people[bossId]?.alive)return;
          stt.career.reviewReplies??={};const replyKey=(snapshot.warnings!==undefined?'warning_'+warnings+(snapshot.seq?'#'+snapshot.seq:''):'review')+'_'+employer+'_'+year;if(stt.career.reviewReplies[replyKey]){recordJournal(stt,`You had already answered this at ${employer} in ${year}. Nothing changed.`,'career');return;}stt.career.reviewReplies[replyKey]=true;
          const b = stt.people[bossId];
          if (!b) return;
          if (chance(stt, 0.4)) {
            rememberDeed(stt, b, 'review_pushback', 'You pushed back on your review rating and made a fair case.', { respect: 2 });
            recordJournal(stt, `You pushed back on your review rating — and ${boss.firstName} admitted the year had been harder than the file showed.`, 'career');
          } else {
            rememberDeed(stt, b, 'review_pushback_bad', 'You pushed back on your review rating and it went badly.', { respect: -5, resentment: 6 });
            recordJournal(stt, `You pushed back on your review rating and ${boss.firstName} did not take it well — respect −5 on their record.`, 'career');
          }
        }
      }
    ]
  };
}
export function restoreCareerReviewScene(S,saved){return saved?.careerReviewSnapshot?buildCareerReviewScene(S,saved.careerReviewSnapshot):null;}

export function buildCareerWarningScene(S,snapshot){
 const{year,bossId,bossName,employer,jobId,warnings}=snapshot;
 const boss=S.people[bossId],st={warnings};if(!boss?.alive||!S.career.job||S.career.job.employer!==employer||(jobId&&S.career.job.id!==jobId))return null;
  return {
    key: `warning_${st.warnings}_${year}${snapshot.seq?'_'+snapshot.seq:''}`,
    baseId: 'formal_warning',
    recurring: true, /* played defect: the anti-spam caps silently dropped the third warning, and later warnings in any later job */
    title: `A formal warning from ${boss.firstName}`,
    category: 'career',
    text: `${boss.firstName} calls you in. “Your performance has been under 45% for three months now. This is formal warning ${st.warnings} of 3. ${st.warnings >= 3 ? 'That is the last warning. The next step is dismissal.' : st.warnings >= 2 ? 'You are now on a performance plan — improve, or the next step is dismissal.' : 'Two more warnings and you are on a performance plan. After that, dismissal.'}” What do you do?`,
    careerWarningSnapshot:snapshot,
    choices: [
      {
        label: 'Accept it and commit to improving',
        effect: (stt) => {
          if(!stt.career.job||stt.career.job.employer!==employer||(jobId&&stt.career.job.id!==jobId)||!stt.people[bossId]?.alive)return;
          stt.career.reviewReplies??={};const replyKey=(snapshot.warnings!==undefined?'warning_'+warnings+(snapshot.seq?'#'+snapshot.seq:''):'review')+'_'+employer+'_'+year;if(stt.career.reviewReplies[replyKey]){recordJournal(stt,`You had already answered this at ${employer} in ${year}. Nothing changed.`,'career');return;}stt.career.reviewReplies[replyKey]=true;
          const b = stt.people[bossId];
          if (b) rememberDeed(stt, b, 'warning_accepted', 'You accepted a formal warning and committed to improving.', { respect: 2 });
          if (stt.career.job) stt.career.job.performance = clamp(stt.career.job.performance + 2, 0, 100);
          recordJournal(stt, `You accepted the formal warning from ${boss.firstName} and committed to improving.`, 'career');
        }
      },
      {
        label: 'Appeal it — the targets were impossible',
        effect: (stt) => {
          if(!stt.career.job||stt.career.job.employer!==employer||(jobId&&stt.career.job.id!==jobId)||!stt.people[bossId]?.alive)return;
          stt.career.reviewReplies??={};const replyKey=(snapshot.warnings!==undefined?'warning_'+warnings+(snapshot.seq?'#'+snapshot.seq:''):'review')+'_'+employer+'_'+year;if(stt.career.reviewReplies[replyKey]){recordJournal(stt,`You had already answered this at ${employer} in ${year}. Nothing changed.`,'career');return;}stt.career.reviewReplies[replyKey]=true;
          const b = stt.people[bossId];
          if (!b) return;
          if (chance(stt, 0.35)) {
            const ast = ensureJobActionState(stt);
            if (ast && ast.warnings > 0) ast.warnings -= 1;
            rememberDeed(stt, b, 'warning_appealed', 'You appealed a warning and it was withdrawn.', { respect: 2 });
            recordJournal(stt, `You appealed the warning — ${boss.firstName} checked the targets and withdrew it.`, 'career');
          } else {
            rememberDeed(stt, b, 'warning_appeal_failed', 'You appealed a warning and it was refused.', { respect: -3, resentment: 4 });
            recordJournal(stt, `You appealed the warning and ${boss.firstName} refused — the warning stands.`, 'career');
          }
        }
      }
    ]
  };
}
export function restoreCareerWarningScene(S,saved){return saved?.careerWarningSnapshot?buildCareerWarningScene(S,saved.careerWarningSnapshot):null;}
