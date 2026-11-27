import{careerHours}from'./careerSchedule.js';
/* ============================================================================
   World Life 2.0 — Business Capacity (v2.14 §1, Worker 1)
   The hard 3-business cap is gone. The real limit is TIME and MONEY:

   - A business you run yourself costs your hours (full-time ~40h/week,
     part-time ~18h/week — the same hours the v2.11 workload system
     counts; see businessEngine.js computeWorkload, unchanged).
   - A business with a manager costs the manager's salary and runs
     WITHOUT your hours (biz.manager — the fixed contract; this file
     reads biz.manager only and never invents a second manager field).
   - A business with no manager AND no owner-hours goes UNMANAGED:
     revenue falls and staff morale falls each month it stays unmanaged;
     after 3 unmanaged months it is flagged at risk (biz.atRisk) and the
     player is told in plain words (one journal line, no new channel).

   OWNER HOURS — INTENT vs CAPACITY (read this before touching it):
   - biz.ownerManaged / biz.ownerHoursPerWeek (Worker 2's fields) are the
     INTENT: does the player mean to run this business themselves, and
     for how many hours a week. A manager quitting/fired sets
     ownerManaged = false — nobody runs it until the player takes it
     over again (takeOverBusiness) or hires a new manager.
   - This file computes the CAPACITY reality: one person can work at
     most OWNER_WEEKLY_HOURS_MAX hours a week in total (job + the
     businesses they run themselves). Hours are handed out in portfolio
     order (businesses[0] first — the oldest business gets your time
     first); a business whose full weekly hours do not fit in what is
     left gets NO owner-hours and goes unmanaged.
   - Why 70, not 50: 50 is the STRETCHED line (over 50 hrs/week you are
     strained — stress +5/month, the v2.11 penalty, unchanged). A
     part-time business next to a 48-hour job is 66 hrs/week: strained,
     but genuinely run — v2.11 §11 proves it (stress +5, performance
     -2) and the game treats a side business next to a job as a real,
     supported combination. A hard 50-hour capacity would have called
     that business unmanaged on day one. 70 = 50 normal hours + 20
     stretched hours: the point where there are simply no more hours in
     the week to give. It is a named constant — tune it, do not hard-code
     around it.
   - computeWorkload (businessEngine.js) reads the ALLOCATED hours
     from this file — one allocation walk owns the hours. The header,
     the Stretched penalty and the card all read that one number, so
     used + free always equals the week and the workload is the same
     everywhere it is shown. There is no second, intended-hours
     computation any more: what a business NEEDS but did not get is
     reported separately as uncovered hours (see
     managementCapacityInfo), never folded into the workload.

   UNMANAGED DECAY (owned by this file, called once per settled month
   from applyWorkloadMonth in businessEngine.js — the settlement already
   calls that once a month, after the P&L loop, so the P&L of month N
   uses the unmanaged state of month N-1 and the tick then advances it):
   - unmanagedMonths counts CONSECUTIVE unmanaged months, reset to 0
     the month the business is managed again (manager hired, or taken
     over with hours to spare).
   - Revenue multiplier: 1 - 0.10 per unmanaged month, floored at 0.55.
     Applied read-only in computeBusinessMonth (never a permanent cut
     to biz.monthlyRev — a managed-again business earns normally).
   - Staff morale: -6 per unmanaged month, per employee (clamped 5-100).
     Morale already moves revenue through teamMoraleFactor, so the two
     effects compound honestly.
   - atRisk: true when unmanagedMonths >= 3. One journal line, in plain
     words, the month it flips (unmanagedMonths === 3 exactly — no spam
     in months 4, 5, ...). One journal line when it recovers from atRisk.
   - CALLER CONTRACT: tick once per settled month per business. This
     file does NOT stamp months (a direct call is one month passing);
     calling it twice for the same month would count two months.

   MERGE NOTE FOR THE COORDINATOR (Worker 2 overlap — do not wire both):
   businessManager.js tickManagerMonth ALSO increments unmanagedMonths
   for any business without a manager — including owner-run ones (it
   never checks ownerManaged), and it writes its own 3-month journal
   line. If both ticks run, unmanagedMonths advances twice a month and
   owner-run businesses get flagged. ONE tick must own the counter:
   this file's (it checks manager AND owner-hours AND capacity). Gate
   or remove the unmanaged branch of tickManagerMonth at merge.
   ========================================================================== */

import { clamp } from '../core/rng.js';
import { recordJournal } from '../core/schema.js';
import { contractRuleFor } from '../data/economy.js';

/* Weekly hours a business needs from its owner, by mode — mirrors
   BUSINESS_FULL_TIME_HOURS / BUSINESS_PART_TIME_HOURS in
   businessEngine.js (duplicated, not imported, so this file never
   imports businessEngine and the dependency stays one-way). */
export const OWNER_FULL_TIME_HOURS = 40;
export const OWNER_PART_TIME_HOURS = 18;
/* The Stretched line (v2.11): over this many hours a week you are
   strained. Mirrors BUSINESS_STRETCHED_HOURS. */
export const OWNER_STRETCHED_HOURS = 50;
/* One person can work at most this many hours a week in total (job +
   the businesses they run themselves). 50 normal + 20 stretched. */
export const OWNER_WEEKLY_HOURS_MAX = 70;
/* Unmanaged decay rates. */
export const UNMANAGED_REVENUE_DECAY_PER_MONTH = 0.10;
export const UNMANAGED_REVENUE_FLOOR = 0.55;
export const UNMANAGED_MORALE_DROP_PER_MONTH = 6;
export const UNMANAGED_AT_RISK_MONTHS = 3;

export function hoursNeededForMode(mode) {
  return mode === 'full_time' ? OWNER_FULL_TIME_HOURS : OWNER_PART_TIME_HOURS;
}

/* The player's job hours this week (0 when not employed). Mirrors the
   job-hours rule in computeWorkload exactly. */
export function jobHoursFor(S) {
  if (S?.career?.employed && S?.career?.job) {
    return careerHours(S);
  }
  return 0;
}

function portfolioOf(S) {
  return Array.isArray(S?.career?.businesses) ? S.career.businesses : [];
}

/* Hours the owner MEANS to give this business this week: its full
   mode hours when they run it themselves, 0 when a manager runs it
   or nobody runs it. Intended, not allocated — compare with
   ownerHoursForBusiness to find the hours a business needs but did
   not get (uncovered). */
export function ownerHoursIntended(S, biz) {
  if (!biz || typeof biz !== 'object') return 0;
  if (biz.manager) return 0;
  if (biz.ownerManaged === false) return 0;
  return hoursNeededForMode(biz.mode);
}

/* Hours the owner actually gives this business this week: its full
   mode hours, or 0. 0 when a manager runs it (the manager's salary is
   the cost, not your hours), 0 when nobody runs it (ownerManaged ===
   false — a manager left and the player never took it back), and 0
   when the owner's week is already full: hours are handed out in
   portfolio order against OWNER_WEEKLY_HOURS_MAX, after the job.
   A business not in the portfolio (a preview or a scratch record)
   gets its full hours — there is nothing ahead of it to compete with. */
export function ownerHoursForBusiness(S, biz) {
  if (!biz || typeof biz !== 'object') return 0;
  if (biz.manager) return 0;
  if (biz.ownerManaged === false) return 0;
  const need = hoursNeededForMode(biz.mode);
  const list = portfolioOf(S);
  const idx = list.findIndex(b => b === biz || (b && biz && b.id && b.id === biz.id));
  if (idx < 0) return need;
  /* Hand the hours out in portfolio order, skipping businesses that
     got nothing themselves: an earlier business that did not fit
     costs 0, so it must not eat the hours of the ones behind it. */
  let remaining = OWNER_WEEKLY_HOURS_MAX - jobHoursFor(S);
  for (let i = 0; i < idx; i++) {
    const other = list[i];
    if (!other || other.manager || other.ownerManaged === false) continue;
    const needOther = hoursNeededForMode(other.mode);
    if (needOther <= remaining) remaining -= needOther;
  }
  return need <= remaining ? need : 0;
}

/* Managed = someone is actually running it: a manager, or the owner
   with hours to spare for it. Anything else is unmanaged. */
export function businessIsManaged(S, biz) {
  if (!biz || typeof biz !== 'object') return false;
  if (biz.manager) return true;
  if (biz.ownerManaged === false) return false;
  return ownerHoursForBusiness(S, biz) >= hoursNeededForMode(biz.mode);
}

/* The Ventures header numbers: hours the owner actually gives their
   businesses inside the 70-hour week, hours still free, how many
   businesses are managed vs unmanaged, and the at-risk records.
   ownerHoursUsed is ALLOCATED business hours (job hours are not in it;
   ownerHoursFree = 70 - job hours - ownerHoursUsed). workloadHours is
   the whole week the player works — job + allocated business hours —
   and ownerHoursFree = 70 - workloadHours, so the two always add to
   the week. uncoveredHours is what the businesses NEED but did not
   get (intended minus allocated), with the names in uncoveredNames —
   shown separately, never folded into the workload. atRiskList holds
   the business records themselves (read .id / .name /
   .unmanagedMonths off them). */
export function managementCapacityInfo(S) {
  const list = portfolioOf(S);
  let ownerHoursUsed = 0;
  let uncoveredHours = 0;
  const uncoveredNames = [];
  let managedCount = 0;
  let unmanagedCount = 0;
  const atRiskList = [];
  for (const biz of list) {
    if (!biz || typeof biz !== 'object') continue;
    const allocated = ownerHoursForBusiness(S, biz);
    ownerHoursUsed += allocated;
    const uncovered = ownerHoursIntended(S, biz) - allocated;
    if (uncovered > 0) {
      uncoveredHours += uncovered;
      uncoveredNames.push(biz.name);
    }
    /* v2.20 merge — the header counts match the CARDS: a branch renders
       only as a row inside its parent's card (I1), never as a card of
       its own, so branches are not counted here as managed or
       unmanaged. A branch's need still shows: its hours land in
       uncoveredHours/uncoveredNames above, and its row says who runs
       it (businessBranches.js reads the same allocated figure). */
    if (!biz.isBranch) {
      if (businessIsManaged(S, biz)) managedCount += 1;
      else unmanagedCount += 1;
    }
    if (biz.atRisk) atRiskList.push(biz);
  }
  const jobHours = jobHoursFor(S);
  const workloadHours = jobHours + ownerHoursUsed;
  const ownerHoursFree = Math.max(0, OWNER_WEEKLY_HOURS_MAX - workloadHours);
  return { ownerHoursUsed, ownerHoursFree, jobHours, workloadHours, uncoveredHours, uncoveredNames, managedCount, unmanagedCount, atRiskList };
}

/* Revenue multiplier for the business's current unmanaged state:
   1 while managed, then -10% per unmanaged month, floored at 0.55.
   Read-only — computeBusinessMonth applies it; the tick advances the
   counter. Never a permanent cut to biz.monthlyRev. */
export function unmanagedRevenueMult(biz) {
  const months = Math.max(0, Number(biz?.unmanagedMonths) || 0);
  if (months <= 0) return 1;
  return Math.max(UNMANAGED_REVENUE_FLOOR, 1 - UNMANAGED_REVENUE_DECAY_PER_MONTH * months);
}

/* One month of unmanaged decay, applied to one business. Returns
   { revenueMult, moraleDelta, flagged }:
   - revenueMult: the multiplier computeBusinessMonth should use for
     this business from next month (1 while managed).
   - moraleDelta: the morale change applied per employee this month
     (-6 while unmanaged, 0 when managed or with no staff).
   - flagged: true only in the month the business BECOMES at risk
     (unmanagedMonths hits 3) — the month the player is told.
   Managed again: unmanagedMonths resets to 0, atRisk clears, and a
   business recovering from atRisk gets one plain-words journal line. */
export function applyUnmanagedDecay(S, biz) {
  if (!biz || typeof biz !== 'object') return { revenueMult: 1, moraleDelta: 0, flagged: false };
  if (typeof biz.unmanagedMonths !== 'number') biz.unmanagedMonths = 0;
  const graceUntil = Number(S?.rules?.capacityGraceUntil);
  if (graceUntil > 0 && Number(S.year) * 12 + Number(S.month || 1) <= graceUntil && !businessIsManaged(S, biz)) {
    if (!S.rules.capacityGraceNoted) {
      S.rules.capacityGraceNoted = true;
      recordJournal(S, `Your businesses now need your hours, or a manager. For the next six months nothing slips while you sort it out: hire managers or take them over yourself.`, 'career');
    }
    return { revenueMult: 1, moraleDelta: 0, flagged: false };
  }
  if (businessIsManaged(S, biz)) {
    const wasAtRisk = biz.atRisk === true;
    biz.unmanagedMonths = 0;
    biz.atRisk = false;
    biz.unmanagedSince = null;
    if (wasAtRisk) {
      recordJournal(S, `${biz.name} is being looked after again — it is managed now, and the slide stops here.`, 'career');
    }
    return { revenueMult: 1, moraleDelta: 0, flagged: false };
  }
  biz.unmanagedMonths = (biz.unmanagedMonths || 0) + 1;
  if (!biz.unmanagedSince) biz.unmanagedSince = { year: S.year, month: S.month };
  let moraleDelta = 0;
  const staff = Array.isArray(biz.staff) ? biz.staff : [];
  if (staff.length > 0) {
    for (const emp of staff) {
      emp.morale = clamp((Number(emp.morale) || 0) - UNMANAGED_MORALE_DROP_PER_MONTH, 5, 100);
    }
    moraleDelta = -UNMANAGED_MORALE_DROP_PER_MONTH;
  }
  const revenueMult = unmanagedRevenueMult(biz);
  let flagged = false;
  if (biz.unmanagedMonths >= UNMANAGED_AT_RISK_MONTHS) {
    biz.atRisk = true;
    if (biz.unmanagedMonths === UNMANAGED_AT_RISK_MONTHS) {
      flagged = true;
      recordJournal(S, `${biz.name} has been unmanaged for 3 months — nobody is running it. Revenue and staff morale are falling each month it stays like this. Hire a manager, take it over yourself, or sell it.`, 'money');
    }
  }
  return { revenueMult, moraleDelta, flagged };
}

/* The monthly business tick: one month of decay for every business in
   the portfolio. Called once per settled month from applyWorkloadMonth
   (businessEngine.js). Returns a summary for the caller. */
export function tickBusinessCapacityMonth(S) {
  const list = [...portfolioOf(S)];
  const out = { ticked: 0, managed: 0, unmanaged: 0, newlyAtRisk: [] };
  for (const biz of list) {
    if (!biz || typeof biz !== 'object') continue;
    const r = applyUnmanagedDecay(S, biz);
    out.ticked += 1;
    if (businessIsManaged(S, biz)) out.managed += 1;
    else out.unmanaged += 1;
    if (r.flagged) out.newlyAtRisk.push(biz.name);
  }
  return out;
}
