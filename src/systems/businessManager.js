/* ============================================================================
   World Life 2.0 — Business Manager (v2.14 §2, Worker 2)
   A manager is a person, not a toggle: named, skilled, paid, loyal (or
   not), with a policy brief, asks of their own, and the ability to skim,
   quit, or be fired / promoted from within.

   CONTRACT (fixed — do not change it):
   biz.manager = null | { name, skill 0-100, wage (monthly local),
     loyalty 0-100, policy: 'growth'|'safe'|'harvest', hiredYear,
     hiredMonth, personId }

   MONEY RULES (one rule, no silent money):
   - Hiring a manager costs one month's wage (same as staff hiring),
     posted as its own ledger line "Onboarding — {name} (manager)".
   - The manager's salary is charged in the monthly P&L: applyManagerEffects
     returns it as costDelta, and the COORDINATOR wires costDelta into
     computeBusinessMonth's costs (pl.costs), so the settlement posts it
     in the "Business costs" line like any other wage. This file NEVER
     posts the salary inside applyManagerEffects (it is pure) and NEVER
     posts it inside tickManagerMonth. postManagerSalary() exists only
     as the direct-call helper for the verify test.
   - REMOTE ALIGNMENT (businessLegacy.js): a remote business already
     charges biz.remoteManagerWageLocal in computeBusinessMonth. A hired
     manager REPLACES that figure — the coordinator must charge the
     manager's wage (costDelta) INSTEAD of remoteManagerWageLocal when
     biz.manager exists, never both. This file does not invent a second
     manager-wage concept.
   - Every other money move (hiring fee, bonus, budget, investigation,
     severance, recovered money, lawsuit) posts its own ledger line
     through walletMove at the moment it happens.
   - Skimmed money leaves cash at once (walletMove, "Money missing at
     {biz} — the books do not add up"), so the loss is real and visible
     in the ledger before any investigation. tickManagerMonth is called
     by the coordinator AFTER the settlement's own walletMoves, like
     monthlyStaffTick's hook position — never inside computeBusinessMonth.
   - Severance reuses the same country-law table as staff (v2.8
     noticeAndSeveranceFor, floored at 1 month's wage), via
     managerSeveranceFor — the same pattern as severanceFor in
     businessStaff.js.

   UNMANAGED (§1, Worker 1 owns the decay): a business with no manager
   and no owner-hours is unmanaged. This file sets that state and ONLY
   that state: managerQuits / fireManager set biz.manager = null,
   biz.ownerManaged = false, biz.ownerHoursPerWeek = 0 and stamp
   biz.unmanagedSince. Worker 1's decay reads isUnmanaged(biz).
   takeOverBusiness() is the way back: the owner runs it themselves.
   ========================================================================== */

import { rand, randInt, clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove, queueScene, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { noticeAndSeveranceFor } from '../data/economy.js';
import { pickFirstName, pickFamilyName } from '../data/names.js';
import { monthlyMidSalary } from './businessStaff.js';
/* v2.14 merge: takeOverBusiness checks free hours against the capacity
   rule (businessCapacity.js owns the 70h week). Importing it here is
   cycle-free: businessCapacity imports only core/data, never this file. */
import { managementCapacityInfo, hoursNeededForMode, businessIsManaged, ownerHoursForBusiness, OWNER_FULL_TIME_HOURS, OWNER_PART_TIME_HOURS } from './businessCapacity.js';

export const MANAGER_POLICIES = ['growth', 'safe', 'harvest'];
export const MANAGER_POLICY_TEXT = {
  growth: 'Growth — reinvest, higher risk, higher return',
  safe: 'Safe — steady, lower return, lower risk',
  harvest: 'Harvest — take cash out, the business slowly declines'
};
/* Promote-from-within bar, stated plainly wherever a refusal is shown. */
export const PROMOTE_MIN_SKILL = 65;
export const PROMOTE_MIN_MORALE = 70;
/* Embezzlement: half the stolen money comes back when caught. */
export const EMBEZZLEMENT_RECOVERY_FRACTION = 0.5;
/* A manager quits on their own once loyalty falls this low. */
export const MANAGER_QUIT_LOYALTY = 8;

function monthIndex(S) {
  return (Number(S.year) || 2026) * 12 + (Number(S.month) || 1);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ *
   State shape — every manager function normalises first, so old saves
   and Worker 1's businesses work without a migration step.
   ------------------------------------------------------------------ */
export function normalizeManagerState(S, biz) {
  if (!biz || typeof biz !== 'object') return null;
  if (biz.manager === undefined) biz.manager = null;
  if (!Array.isArray(biz.managerAsks)) biz.managerAsks = [];
  if (!biz.embezzlement || typeof biz.embezzlement !== 'object') {
    biz.embezzlement = { stolenTotal: 0, clues: [], investigated: false, caught: null, lastSkimMonth: null };
  }
  if (!Array.isArray(biz.embezzlement.clues)) biz.embezzlement.clues = [];
  if (typeof biz.embezzlement.stolenTotal !== 'number') biz.embezzlement.stolenTotal = 0;
  if (biz.ownerManaged === undefined) biz.ownerManaged = !biz.manager;
  if (typeof biz.ownerHoursPerWeek !== 'number') {
    biz.ownerHoursPerWeek = biz.ownerManaged ? (biz.mode === 'full_time' ? OWNER_FULL_TIME_HOURS : OWNER_PART_TIME_HOURS) : 0;
  }
  if (typeof biz.unmanagedMonths !== 'number') biz.unmanagedMonths = 0;
  return biz;
}

/* Managed — ONE definition (v2.20 I4), shared by the header count,
   the card badges and this section: a manager runs it, or the owner
   runs it with allocated hours >= the hours its mode needs. Intent
   alone is not enough — a business the owner means to run but has no
   hours left for is unmanaged. Called as isManaged(S, biz); the
   one-argument form isManaged(biz) still works for a standalone
   record, where no week competes for the hours. */
export function isManaged(S, biz) {
  if (biz === undefined) { biz = S; S = null; }
  return businessIsManaged(S, biz);
}

export function isUnmanaged(S, biz) {
  if (biz === undefined) { biz = S; S = null; }
  return !businessIsManaged(S, biz);
}

/* The owner takes a managerless business over themselves (the way out
   of unmanaged). Hours follow the business's mode, as in v2.11. */
export function takeOverBusiness(S, biz) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz) return { ok: false, msg: 'No business found.' };
  if (biz.manager) return { ok: false, msg: `${biz.name} already has a manager (${biz.manager.name}) — fire them first if you want to run it yourself.` };
  if (biz.ownerManaged) return { ok: false, msg: `You already run ${biz.name} yourself.` };
  /* v2.14 merge (W1 blocker 5): taking over needs free hours for the
     mode — taking over a full-time business with a full week leaves it
     unmanaged under the capacity rule, so refuse plainly instead. */
  const needHours = hoursNeededForMode(biz.mode);
  const freeHours = managementCapacityInfo(S).ownerHoursFree;
  if (needHours > freeHours) {
    return { ok: false, msg: `You have ${freeHours}h/week free — not enough to run ${biz.name} yourself (${needHours}h/week ${biz.mode === 'full_time' ? 'full-time' : 'part-time'}). Hire a manager to run it, or free up hours first.` };
  }
  biz.ownerManaged = true;
  biz.ownerHoursPerWeek = biz.mode === 'full_time' ? OWNER_FULL_TIME_HOURS : OWNER_PART_TIME_HOURS;
  biz.unmanagedMonths = 0;
  biz.unmanagedSince = null;
  recordJournal(S, `You took over running ${biz.name} yourself (${biz.ownerHoursPerWeek} hours a week) — it is managed again.`, 'career');
  return { ok: true, msg: `You run ${biz.name} yourself now (${biz.ownerHoursPerWeek} hours a week).`, biz };
}

/* ------------------------------------------------------------------ *
   Size — what kind of manager a business can attract. A corner shop
   does not attract a CEO. Size is monthly revenue measured against the
   local mid salary, with a bump for a big capital base.
   ------------------------------------------------------------------ */
export function businessSizeScore(S, biz) {
  const mid = Math.max(1, monthlyMidSalary(S, biz.country || S.country));
  const revScore = (Number(biz.monthlyRev) || 0) / mid;
  const capScore = (Number(biz.capitalInvested) || 0) / mid;
  return revScore + Math.min(10, capScore * 0.2);
}

export function businessSizeTier(S, biz) {
  const score = businessSizeScore(S, biz);
  if (score >= 25) return 'large';
  if (score >= 8) return 'medium';
  return 'small';
}

const TIER_INDEX = { small: 0, medium: 1, large: 2 };

/* The going monthly rate for a manager of this skill in this country.
   v2.20 I3 — the wage scales to the BUSINESS, not just the country:
   a corner stall cannot pay a big-business wage. The tier that already
   gates which candidates appear (businessSizeTier above) now also sets
   the curve — one curve for the shortlist, the launch estimate, the
   underpaid check and the promotion comparison, so the same job never
   has two wages. Curves are mid-salary multiples:
     small  0.55 + skill/100 × 0.50  (skill 51 → 0.805 × mid)
     medium 0.75 + skill/100 × 0.80
     large  0.90 + skill/100 × 1.20  (the old curve, unchanged)
   Measured Egypt 2022 (mid 8,250): fruit stall (small) skill 51 →
   6,641/mo (was 12,474); kiosk juniors (skill 35–55) → 5,981–6,806/mo
   (was 11,583–12,573). A stall netting 4,401/mo still cannot afford
   its manager — but now the shortlist says so (managerHireWarning)
   instead of quoting a wage three times the takings. */
const MANAGER_WAGE_CURVES = {
  small: { base: 0.55, perSkill: 0.5 },
  medium: { base: 0.75, perSkill: 0.8 },
  large: { base: 0.9, perSkill: 1.2 }
};

export function managerWageCurve(mid, tier, skill) {
  const c = MANAGER_WAGE_CURVES[tier] || MANAGER_WAGE_CURVES.small;
  return Math.max(1, Math.round(Math.max(1, Number(mid) || 1) * (c.base + clamp(Number(skill) || 50, 0, 100) / 100 * c.perSkill)));
}

/* The going rate for a manager of this skill at THIS business. */
export function managerWageForBusiness(S, biz, skill) {
  const mid = Math.max(1, monthlyMidSalary(S, biz.country || S.country));
  return managerWageCurve(mid, businessSizeTier(S, biz), skill);
}

export function goingRateForSkill(S, biz, skill) {
  return managerWageForBusiness(S, biz, skill);
}

/* The skill band the shortlist actually draws from at each tier
   (CANDIDATE_TIERS below): the range the player will really be asked. */
export const MANAGER_SHORTLIST_SKILL_BAND = { small: [35, 55], medium: [35, 75], large: [35, 92] };

export function managerWageRangeForBusiness(S, biz) {
  const tier = businessSizeTier(S, biz);
  const band = MANAGER_SHORTLIST_SKILL_BAND[tier] || MANAGER_SHORTLIST_SKILL_BAND.small;
  return {
    tier,
    lowSkill: band[0],
    highSkill: band[1],
    low: managerWageForBusiness(S, biz, band[0]),
    high: managerWageForBusiness(S, biz, band[1])
  };
}

/* Same range for a venture not launched yet (launch screen): the
   pseudo-business carries the venture's own takings and capital. */
export function managerWageRangeForVenture(S, revLocal, capitalLocal, country) {
  return managerWageRangeForBusiness(S, {
    monthlyRev: Number(revLocal) || 0,
    capitalInvested: Number(capitalLocal) || 0,
    country: country || S.country
  });
}

/* Plain-words affordability check for one hire: null when the wage is
   covered by last settled month's net, otherwise the top-up the player
   pays from their salary every month. Pure — callers format the text. */
export function managerWageVsLastNet(S, biz, wage) {
  if (!biz || !biz.lastPL || typeof biz.lastPL.net !== 'number') return null;
  const lastNet = Math.round(biz.lastPL.net);
  const w = Math.max(0, Math.round(Number(wage) || 0));
  if (w <= lastNet) return null;
  return { lastNet, wage: w, topUp: w - lastNet };
}

/* ------------------------------------------------------------------ *
   Hiring — a real shortlist of named people.
   ------------------------------------------------------------------ */
const CANDIDATE_TIERS = [
  { tier: 'junior', minTier: 'small', skillMin: 35, skillMax: 55, line: 'Keen, cheap, still learning the trade.' },
  { tier: 'junior', minTier: 'small', skillMin: 35, skillMax: 55, line: 'Organised and steady, no big-business experience yet.' },
  { tier: 'experienced', minTier: 'medium', skillMin: 55, skillMax: 75, line: 'Has run a shop like yours before and knows the suppliers.' },
  { tier: 'senior', minTier: 'large', skillMin: 75, skillMax: 92, line: 'A proper operator — has turned around bigger businesses than this.' }
];

function makeCandidate(S, biz, spec) {
  const countryId = biz.country || S.country;
  const gender = rand(S) < 0.5 ? 'm' : 'f';
  const first = pickFirstName(countryId, gender, () => rand(S));
  const last = pickFamilyName(countryId, () => rand(S));
  const skill = randInt(S, spec.skillMin, spec.skillMax);
  return {
    personId: nextId(S, 'mgr'),
    name: `${first} ${last}`,
    skill,
    wage: goingRateForSkill(S, biz, skill),
    loyalty: randInt(S, 45, 85),
    tier: spec.tier,
    minTier: spec.minTier,
    line: spec.line
  };
}

export function managerShortlist(S, biz) {
  normalizeManagerState(S, biz);
  if (!biz) return [];
  const bizTier = TIER_INDEX[businessSizeTier(S, biz)];
  const list = [];
  for (const spec of CANDIDATE_TIERS) {
    if (TIER_INDEX[spec.minTier] <= bizTier) list.push(makeCandidate(S, biz, spec));
  }
  /* A tiny business still gets a choice: at least two juniors. */
  let guard = 0;
  while (list.length < 2 && guard < 4) {
    list.push(makeCandidate(S, biz, CANDIDATE_TIERS[0]));
    guard += 1;
  }
  return list;
}

/* Hiring costs one month's wage, exactly like hiring staff. */
export function hireManager(S, biz, candidate) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz) return { ok: false, msg: 'No business found.' };
  if (biz.manager) return { ok: false, msg: `${biz.name} already has a manager (${biz.manager.name}). Fire them first if you want someone new.` };
  if (!candidate || !candidate.name) return { ok: false, msg: 'Choose a candidate from the shortlist first.' };
  const wage = Math.max(1, Math.round(Number(candidate.wage) || 0));
  if ((Number(S.money?.cash) || 0) < wage) {
    return { ok: false, msg: `Hiring ${candidate.name} costs one month's wage (${formatMoney(wage, biz.country || S.country)}) to onboard — not enough cash.` };
  }
  /* v2.20 I3 — never hire silently into a loss: when the wage is more
     than the business netted last month, say so in plain words with
     both numbers and the monthly top-up from the player's salary. The
     hire still goes through (a manager can turn a business around) —
     but nobody hires one by accident any more. */
  const wageWarning = managerWageVsLastNet(S, biz, wage);
  const wageWarningText = wageWarning
    ? ` Warning: ${candidate.name} asks ${formatMoney(wageWarning.wage, biz.country || S.country)}/month but ${biz.name} netted ${formatMoney(wageWarning.lastNet, biz.country || S.country)} last month — you will pay about ${formatMoney(wageWarning.topUp, biz.country || S.country)}/month from your salary until it earns more.`
    : '';
  walletMove(S, -wage, `Onboarding — ${candidate.name} (manager, ${biz.name})`, 'business');
  biz.manager = {
    name: candidate.name,
    skill: clamp(Math.round(Number(candidate.skill) || 50), 0, 100),
    wage,
    loyalty: clamp(Math.round(Number(candidate.loyalty) || 60), 0, 100),
    policy: 'safe',
    hiredYear: S.year,
    hiredMonth: S.month,
    personId: candidate.personId || nextId(S, 'mgr')
  };
  biz.ownerManaged = false;
  biz.ownerHoursPerWeek = 0;
  biz.unmanagedMonths = 0;
  biz.unmanagedSince = null;
  recordJournal(S, `Hired ${candidate.name} to manage ${biz.name} (${formatMoney(wage, biz.country || S.country)}/month, skill ${biz.manager.skill}, loyalty ${biz.manager.loyalty}). ${candidate.line || ''} You no longer spend your own hours running it.${wageWarning ? ` ${candidate.name} asks ${formatMoney(wageWarning.wage, biz.country || S.country)}/month but ${biz.name} netted ${formatMoney(wageWarning.lastNet, biz.country || S.country)} last month — about ${formatMoney(wageWarning.topUp, biz.country || S.country)}/month comes from your salary until it earns more.` : ''}`, 'career');
  return { ok: true, msg: `${candidate.name} now manages ${biz.name} for ${formatMoney(wage, biz.country || S.country)}/month.${wageWarningText}`, manager: biz.manager, hiringFee: wage, wageWarning };
}

/* ------------------------------------------------------------------ *
   Skill + policy — PURE. Reads state, returns multipliers, never
   writes a ledger line. The coordinator calls this from
   computeBusinessMonth and folds revenueMult into revenue and
   costDelta into costs (so the settlement posts the salary).
   ------------------------------------------------------------------ */
export function applyManagerEffects(S, biz) {
  normalizeManagerState(S, biz);
  const mgr = biz ? biz.manager : null;
  if (!mgr) {
    return {
      revenueMult: 1, moraleDelta: 0, costDelta: 0, revenueVariance: 0,
      harvestCashOut: 0, reinvestAmount: 0,
      notes: ['No manager — the business runs on your hours, or not at all.']
    };
  }
  const now = monthIndex(S);
  const skill = clamp(Number(mgr.skill) || 50, 0, 100);
  const loyalty = clamp(Number(mgr.loyalty) || 50, 0, 100);
  const policy = MANAGER_POLICIES.includes(mgr.policy) ? mgr.policy : 'safe';
  const notes = [];
  let rev = 1 + (skill - 50) * 0.006;
  notes.push(skill >= 70
    ? `${mgr.name} is a strong manager (skill ${skill}) — revenue ×${(1 + (skill - 50) * 0.006).toFixed(2)} from skill alone.`
    : skill >= 50
      ? `${mgr.name} is a competent manager (skill ${skill}).`
      : `${mgr.name} is a weak manager (skill ${skill}) — the business earns less under them.`);
  let revenueVariance = 0.05;
  let reinvestAmount = 0;
  let harvestCashOut = 0;
  if (policy === 'growth') {
    rev += 0.08;
    revenueVariance = 0.15;
    reinvestAmount = Math.round((Number(biz.monthlyRev) || 0) * 0.08);
    notes.push('Policy: growth — reinvesting for a higher return, but results swing more month to month.');
  } else if (policy === 'safe') {
    rev -= 0.03;
    revenueVariance = 0.05;
    notes.push('Policy: safe — steady, a little lower return, few surprises.');
  } else {
    rev -= 0.10;
    revenueVariance = 0.03;
    harvestCashOut = Math.round((Number(biz.monthlyRev) || 0) * 0.10);
    notes.push(`Policy: harvest — taking ${formatMoney(harvestCashOut, biz.country || S.country)} a month out in cash, and the business slowly declines.`);
  }
  let moraleDelta = clamp(Math.round((skill - 50) * 0.12), -6, 6);
  if (loyalty < 30) {
    rev -= 0.05;
    moraleDelta -= 3;
    notes.push(`${mgr.name}'s loyalty is low (${loyalty}) — they are checked out, and the team can tell.`);
  } else if (loyalty > 70) {
    rev += 0.02;
    moraleDelta += 2;
    notes.push(`${mgr.name} is loyal (${loyalty}) — they stay through a bad year and the team trusts them.`);
  }
  moraleDelta = clamp(moraleDelta, -6, 6);
  if (biz.managerOnLeaveUntil && now <= biz.managerOnLeaveUntil) {
    rev *= 0.95;
    notes.push(`${mgr.name} is on leave this month — the business runs at 95% without them.`);
  }
  if (biz.managerBudgetBoostUntil && now <= biz.managerBudgetBoostUntil) {
    rev *= 1.05;
    notes.push('The extra budget you approved is working — revenue ×1.05 this month.');
  }
  const costDelta = Math.max(0, Math.round(Number(mgr.wage) || 0) + reinvestAmount);
  notes.push(`Manager salary ${formatMoney(mgr.wage, biz.country || S.country)}/month is charged in the monthly P&L${reinvestAmount > 0 ? `, plus ${formatMoney(reinvestAmount, biz.country || S.country)} reinvested under the growth policy` : ''}.`);
  return {
    revenueMult: Math.max(0.5, Number(rev.toFixed(3))),
    moraleDelta,
    costDelta,
    revenueVariance,
    harvestCashOut,
    reinvestAmount,
    notes
  };
}

/* Direct-call helper for the verify test (and any caller that posts the
   salary outside the P&L): one ledger line, exactly the wage. The
   settlement path must NOT call this — the coordinator wires costDelta
   into pl.costs instead, or the salary would be charged twice. */
export function postManagerSalary(S, biz) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz || !biz.manager) return { ok: false, msg: 'No manager to pay.' };
  const wage = Math.round(Number(biz.manager.wage) || 0);
  walletMove(S, -wage, `Manager salary — ${biz.manager.name} (${biz.name})`, 'business');
  return { ok: true, amount: wage, msg: `Paid ${biz.manager.name} ${formatMoney(wage, biz.country || S.country)} for managing ${biz.name}.` };
}

/* ------------------------------------------------------------------ *
   Policy
   ------------------------------------------------------------------ */
export function setManagerPolicy(S, biz, policy) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz || !biz.manager) return { ok: false, msg: 'No manager to brief — hire one first.' };
  if (!MANAGER_POLICIES.includes(policy)) return { ok: false, msg: `Unknown policy — choose growth, safe or harvest.` };
  const before = biz.manager.policy;
  biz.manager.policy = policy;
  recordJournal(S, `You briefed ${biz.manager.name} at ${biz.name}: ${MANAGER_POLICY_TEXT[policy]} (was ${before}).`, 'career');
  return { ok: true, msg: `${biz.manager.name} is now on a ${policy} brief — ${MANAGER_POLICY_TEXT[policy]}.`, policy };
}

/* ------------------------------------------------------------------ *
   Asks — the manager wants things. A queue on the business record;
   the coordinator wires it into scenes/UI.
   ------------------------------------------------------------------ */
const ASK_DEFS = {
  raise: { cost: 0, text: 'a pay rise (10% more a month)' },
  bonus: { cost: null, text: 'a one-off bonus (one month\'s wage)' },
  budget: { cost: null, text: 'a bigger budget to grow the business' },
  timeoff: { cost: 0, text: 'a month off to rest' }
};

export function generateManagerAsk(S, biz, kind = null) {
  normalizeManagerState(S, biz);
  if (!biz || !biz.manager) return null;
  const policy = biz.manager.policy || 'safe';
  const pool = kind
    ? [kind]
    : policy === 'growth' ? ['budget', 'budget', 'raise', 'bonus']
    : policy === 'harvest' ? ['bonus', 'raise', 'timeoff']
    : ['raise', 'timeoff', 'bonus', 'budget'];
  const chosen = pool[Math.floor(rand(S) * pool.length)];
  const def = ASK_DEFS[chosen];
  const cost = chosen === 'bonus'
    ? Math.round(Number(biz.manager.wage) || 0)
    : chosen === 'budget'
      ? Math.max(100, Math.round((Number(biz.monthlyRev) || 0) * 0.2))
      : 0;
  const ask = {
    id: nextId(S, 'mask'),
    kind: chosen,
    text: `${biz.manager.name} asks for ${def.text}.`,
    cost,
    createdYear: S.year,
    createdMonth: S.month,
    createdMonthIndex: monthIndex(S)
  };
  biz.managerAsks.push(ask);
  recordJournal(S, `${biz.manager.name} (${biz.name}) asks for ${def.text}${cost > 0 ? ` — ${formatMoney(cost, biz.country || S.country)}` : ''}. Saying yes costs loyalty if you refuse.`, 'career');
  return ask;
}

export function answerManagerAsk(S, biz, askId, accept) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz || !biz.manager) return { ok: false, msg: 'No manager to answer.' };
  const idx = (biz.managerAsks || []).findIndex(a => a.id === askId);
  if (idx < 0) return { ok: false, msg: 'That request is no longer waiting.' };
  const ask = biz.managerAsks[idx];
  const mgr = biz.manager;
  const staff = Array.isArray(biz.staff) ? biz.staff : [];
  const bumpStaffMorale = (d) => { for (const e of staff) e.morale = clamp((Number(e.morale) || 0) + d, 5, 100); };
  biz.managerAsks.splice(idx, 1);
  if (!accept) {
    const loss = ask.kind === 'raise' || ask.kind === 'bonus' ? -8 : -5;
    mgr.loyalty = clamp(mgr.loyalty + loss, 0, 100);
    bumpStaffMorale(-2);
    recordJournal(S, `You turned down ${mgr.name}'s request (${ask.text}). Their loyalty fell to ${mgr.loyalty} and the team noticed.`, 'career');
    return { ok: true, accepted: false, loyalty: mgr.loyalty, msg: `Turned down: ${ask.text} Loyalty is now ${mgr.loyalty}.` };
  }
  if (ask.kind === 'raise') {
    const oldWage = mgr.wage;
    mgr.wage = Math.round(mgr.wage * 1.1);
    mgr.loyalty = clamp(mgr.loyalty + 12, 0, 100);
    bumpStaffMorale(3);
    recordJournal(S, `You gave ${mgr.name} a 10% rise (${formatMoney(oldWage, biz.country || S.country)} → ${formatMoney(mgr.wage, biz.country || S.country)}/month). Loyalty rose to ${mgr.loyalty}.`, 'career');
    return { ok: true, accepted: true, loyalty: mgr.loyalty, newWage: mgr.wage, msg: `Raise given — wage is now ${formatMoney(mgr.wage, biz.country || S.country)}/month, loyalty ${mgr.loyalty}.` };
  }
  if (ask.kind === 'bonus') {
    if ((Number(S.money?.cash) || 0) < ask.cost) {
      biz.managerAsks.splice(idx, 0, ask); /* put it back — not answered */
      return { ok: false, msg: `The bonus is ${formatMoney(ask.cost, biz.country || S.country)} and you do not have it in cash.` };
    }
    walletMove(S, -ask.cost, `Bonus — ${mgr.name} (${biz.name})`, 'business');
    mgr.loyalty = clamp(mgr.loyalty + 8, 0, 100);
    bumpStaffMorale(5);
    recordJournal(S, `You paid ${mgr.name} a ${formatMoney(ask.cost, biz.country || S.country)} bonus. Loyalty rose to ${mgr.loyalty} and the team is buzzing.`, 'career');
    return { ok: true, accepted: true, loyalty: mgr.loyalty, paid: ask.cost, msg: `Bonus paid — loyalty ${mgr.loyalty}.` };
  }
  if (ask.kind === 'budget') {
    if ((Number(S.money?.cash) || 0) < ask.cost) {
      biz.managerAsks.splice(idx, 0, ask);
      return { ok: false, msg: `The extra budget is ${formatMoney(ask.cost, biz.country || S.country)} and you do not have it in cash.` };
    }
    walletMove(S, -ask.cost, `Extra budget — ${biz.name} (manager's plan)`, 'business');
    biz.managerBudgetBoostUntil = monthIndex(S) + 1;
    mgr.loyalty = clamp(mgr.loyalty + 6, 0, 100);
    recordJournal(S, `You approved ${formatMoney(ask.cost, biz.country || S.country)} of extra budget for ${mgr.name}'s plan at ${biz.name} — revenue gets a lift next month.`, 'career');
    return { ok: true, accepted: true, loyalty: mgr.loyalty, paid: ask.cost, msg: `Budget approved — revenue ×1.05 next month, loyalty ${mgr.loyalty}.` };
  }
  /* time off */
  biz.managerOnLeaveUntil = monthIndex(S) + 1;
  mgr.loyalty = clamp(mgr.loyalty + 6, 0, 100);
  bumpStaffMorale(4);
  recordJournal(S, `You gave ${mgr.name} a month off. They come back rested (loyalty ${mgr.loyalty}); the business runs at 95% while they are away.`, 'career');
  return { ok: true, accepted: true, loyalty: mgr.loyalty, msg: `Time off given — loyalty ${mgr.loyalty}, business at 95% next month.` };
}

/* ------------------------------------------------------------------ *
   Embezzlement — clues first, investigation, the law.
   ------------------------------------------------------------------ */
function doSkim(S, biz, amount) {
  normalizeManagerState(S, biz);
  const mgr = biz.manager;
  const amt = Math.max(1, Math.round(amount));
  biz.embezzlement.stolenTotal = Math.round((biz.embezzlement.stolenTotal || 0) + amt);
  biz.embezzlement.lastSkimMonth = monthIndex(S);
  walletMove(S, -amt, `Money missing at ${biz.name} — the books do not add up`, 'business');
  const clues = biz.embezzlement.clues;
  if (clues.length === 0) {
    clues.push(`The books at ${biz.name} do not add up — ${formatMoney(amt, biz.country || S.country)} is missing this month and nobody can explain it.`);
    recordJournal(S, `The books at ${biz.name} do not add up — ${formatMoney(amt, biz.country || S.country)} is missing and nobody can explain it.`, 'money');
  } else if (clues.length === 1) {
    clues.push(`A supplier of ${biz.name} complains they were paid late — twice — even though the money left the account.`);
    recordJournal(S, `A supplier of ${biz.name} complains they were paid late even though the money left the account. Something is wrong with the books.`, 'money');
  } else if (!clues.some(c => c.includes('short every month'))) {
    clues.push(`Cash at ${biz.name} keeps coming up short every month, always by a little, never by a lot.`);
  }
  return amt;
}

/* Deterministic seeding for tests and scenes: force one skim of a
   stated amount right now. The live game reaches the same place
   through tickManagerMonth's loyalty-gated rolls. */
export function forceEmbezzlementSkim(S, biz, amount = null) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz || !biz.manager) return { ok: false, msg: 'No manager to skim.' };
  const amt = amount != null ? amount : Math.max(100, Math.round((Number(biz.monthlyRev) || 0) * 0.05));
  const skimmed = doSkim(S, biz, amt);
  return { ok: true, skimmed, stolenTotal: biz.embezzlement.stolenTotal, clues: [...biz.embezzlement.clues] };
}

export function embezzlementClues(S, biz) {
  normalizeManagerState(S, biz);
  return biz ? [...(biz.embezzlement.clues || [])] : [];
}

/* The cost and time of an investigation, stated BEFORE the player
   commits — the UI shows this, then calls investigateEmbezzlement. */
export function investigationCost(S, biz) {
  normalizeManagerState(S, biz);
  const cost = Math.max(500, Math.round((Number(biz?.monthlyRev) || 0) * 0.1));
  return { cost, timeMonths: 1, text: `A forensic audit of ${biz?.name || 'the business'} costs ${formatMoney(cost, biz?.country || S.country)} and takes a month. It finds the truth — or clears ${biz?.manager ? biz.manager.name : 'your manager'}. A false accusation costs loyalty.` };
}

export function investigateEmbezzlement(S, biz) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz || !biz.manager) return { ok: false, msg: 'No manager to investigate.' };
  const { cost, timeMonths } = investigationCost(S, biz);
  if ((Number(S.money?.cash) || 0) < cost) {
    return { ok: false, msg: `The audit costs ${formatMoney(cost, biz.country || S.country)} — not enough cash.` };
  }
  walletMove(S, -cost, `Audit of ${biz.name} books (embezzlement investigation)`, 'business');
  biz.embezzlement.investigated = true;
  const mgr = biz.manager;
  const stolen = Math.round(biz.embezzlement.stolenTotal || 0);
  if (stolen <= 0) {
    /* False accusation: the books were clean. Loyalty pays for it. */
    const before = mgr.loyalty;
    mgr.loyalty = clamp(mgr.loyalty - 15, 0, 100);
    recordJournal(S, `The audit of ${biz.name} found nothing — the books were clean. ${mgr.name} knows you had them investigated, and it stings (loyalty ${before} → ${mgr.loyalty}).`, 'money');
    return { ok: true, found: false, cost, timeMonths, stolenTotal: 0, recovered: 0, loyalty: mgr.loyalty, msg: `The audit found nothing. ${mgr.name} was innocent — loyalty fell ${before} → ${mgr.loyalty}.` };
  }
  /* Caught: half the money comes back, the manager is fired on the
     spot with NO severance (caught stealing), and the law is an option. */
  const recovered = Math.round(stolen * EMBEZZLEMENT_RECOVERY_FRACTION);
  walletMove(S, recovered, `Recovered from ${mgr.name} — embezzlement at ${biz.name}`, 'business');
  biz.embezzlement.caught = {
    name: mgr.name, personId: mgr.personId, stolenTotal: stolen,
    recovered, unrecovered: stolen - recovered,
    investigatedYear: S.year, investigatedMonth: S.month, sued: null
  };
  biz.embezzlement.stolenTotal = 0;
  const staff = Array.isArray(biz.staff) ? biz.staff : [];
  for (const e of staff) e.morale = clamp((Number(e.morale) || 0) - 8, 5, 100);
  recordJournal(S, `The audit proved it: ${mgr.name} skimmed ${formatMoney(stolen, biz.country || S.country)} from ${biz.name}. ${formatMoney(recovered, biz.country || S.country)} was recovered (half); the rest is gone. ${mgr.name} was fired on the spot with no severance, and the team is shaken (morale −8). You can still take them to court.`, 'money');
  biz.manager = null;
  biz.ownerManaged = false;
  biz.ownerHoursPerWeek = 0;
  biz.unmanagedSince = { year: S.year, month: S.month };
  biz.unmanagedMonths = 0;
  return {
    ok: true, found: true, cost, timeMonths, stolenTotal: stolen,
    recovered, recoveryFraction: EMBEZZLEMENT_RECOVERY_FRACTION,
    unrecovered: stolen - recovered,
    msg: `Caught: ${mgr.name} stole ${formatMoney(stolen, biz.country || S.country)}. ${formatMoney(recovered, biz.country || S.country)} recovered (half). They were fired with no severance.`
  };
}

/* Suing the caught manager, under the country's own law. Cost and
   odds are stated before committing (see sueManagerCost). Win: 60% of
   what is still missing comes back. Lose: the legal cost is gone too. */
export function sueManagerCost(S, biz) {
  normalizeManagerState(S, biz);
  const caught = biz?.embezzlement?.caught;
  if (!caught) return { ok: false, msg: 'Nobody has been caught stealing from this business.' };
  const unrecovered = Math.max(0, Math.round(caught.unrecovered || 0));
  const cost = Math.max(1000, Math.round(unrecovered * 0.1));
  return {
    ok: true, cost, unrecovered, winChance: 0.7,
    text: `Suing ${caught.name} in ${getCountry(biz.country || S.country).name} costs ${formatMoney(cost, biz.country || S.country)} in legal fees. With the audit as evidence you are likely to win (about 7 in 10) — a win recovers 60% of the ${formatMoney(unrecovered, biz.country || S.country)} still missing. A loss costs the fees and recovers nothing.`
  };
}

export function sueManager(S, biz) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  const caught = biz?.embezzlement?.caught;
  if (!caught) return { ok: false, msg: 'Nobody has been caught stealing from this business.' };
  if (caught.sued) return { ok: false, msg: `You already took ${caught.name} to court — the case was ${caught.sued}.` };
  const quote = sueManagerCost(S, biz);
  if (!quote.ok) return quote;
  if ((Number(S.money?.cash) || 0) < quote.cost) {
    return { ok: false, msg: `The lawsuit costs ${formatMoney(quote.cost, biz.country || S.country)} in legal fees — not enough cash.` };
  }
  walletMove(S, -quote.cost, `Legal fees — suing ${caught.name} (embezzlement, ${biz.name})`, 'business');
  const won = rand(S) < quote.winChance;
  if (won) {
    const extra = Math.round(quote.unrecovered * 0.6);
    walletMove(S, extra, `Court award — ${caught.name} ordered to repay (${biz.name})`, 'business');
    caught.sued = 'won';
    caught.courtRecovered = extra;
    recordJournal(S, `You won in court against ${caught.name}: the judge ordered them to repay ${formatMoney(extra, biz.country || S.country)} of the ${formatMoney(quote.unrecovered, biz.country || S.country)} still missing from ${biz.name} (legal fees were ${formatMoney(quote.cost, biz.country || S.country)}).`, 'money');
    return { ok: true, won: true, cost: quote.cost, recovered: extra, msg: `Won in court — ${formatMoney(extra, biz.country || S.country)} recovered (fees ${formatMoney(quote.cost, biz.country || S.country)}).` };
  }
  caught.sued = 'lost';
  recordJournal(S, `You lost the case against ${caught.name} — the court did not order repayment, and the ${formatMoney(quote.cost, biz.country || S.country)} in legal fees is gone too.`, 'money');
  return { ok: true, won: false, cost: quote.cost, recovered: 0, msg: `Lost in court — nothing recovered, ${formatMoney(quote.cost, biz.country || S.country)} in fees gone.` };
}

/* ------------------------------------------------------------------ *
   Quit / fire
   ------------------------------------------------------------------ */
export function managerQuits(S, biz, reason = 'low loyalty') {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz || !biz.manager) return { ok: false, msg: 'No manager to quit.' };
  const mgr = biz.manager;
  const staff = Array.isArray(biz.staff) ? biz.staff : [];
  for (const e of staff) e.morale = clamp((Number(e.morale) || 0) - 5, 5, 100);
  biz.lastManagerQuit = { name: mgr.name, reason, year: S.year, month: S.month };
  recordJournal(S, `${mgr.name} quit as manager of ${biz.name} (${reason}; loyalty had fallen to ${mgr.loyalty}). ${biz.name} is unmanaged now — hire a new manager or run it yourself, or revenue and morale will slide.`, 'career');
  queueScene(S, {
    key: `biz_mgr_quit_${biz.id}_${S.year}_${S.month}`,
    category: 'career',
    title: `${mgr.name} quit`,
    text: `${mgr.name} has left ${biz.name} (${reason}). The business is unmanaged until you hire a new manager or take it over yourself.`,
    choices: [{ label: 'Understood — I need a new manager', effect: () => {} }]
  });
  biz.manager = null;
  biz.ownerManaged = false;
  biz.ownerHoursPerWeek = 0;
  biz.unmanagedSince = { year: S.year, month: S.month };
  biz.unmanagedMonths = 0;
  return { ok: true, msg: `${mgr.name} quit ${biz.name} (${reason}). The business is unmanaged.`, name: mgr.name, reason };
}

/* Severance under the country's law — the same table staff severance
   uses (noticeAndSeveranceFor), floored at 1 month's wage. */
export function managerSeveranceFor(S, biz) {
  normalizeManagerState(S, biz);
  const mgr = biz?.manager;
  if (!mgr) return { months: 0, amount: 0, source: '', note: '' };
  const start = (mgr.hiredYear ?? S.year) * 12 + (mgr.hiredMonth ?? S.month);
  const now = S.year * 12 + S.month;
  const years = Math.max(0, (now - start) / 12);
  const { severanceMonths, source, note } = noticeAndSeveranceFor(biz.country || S.country, years);
  const months = Math.max(1, severanceMonths);
  return { months, amount: Math.round((Number(mgr.wage) || 0) * months), source, note };
}

export function fireManager(S, biz) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz || !biz.manager) return { ok: false, msg: 'No manager to fire.' };
  const mgr = biz.manager;
  const sev = managerSeveranceFor(S, biz);
  if ((Number(S.money?.cash) || 0) < sev.amount) {
    return { ok: false, msg: `Severance for ${mgr.name} is ${formatMoney(sev.amount, biz.country || S.country)} (${sev.months} month${sev.months === 1 ? '' : 's'} under ${getCountry(biz.country || S.country).name} law) — not enough cash to let them go properly.` };
  }
  walletMove(S, -sev.amount, `Severance — ${mgr.name} (manager, ${biz.name})`, 'business');
  const staff = Array.isArray(biz.staff) ? biz.staff : [];
  for (const e of staff) e.morale = clamp((Number(e.morale) || 0) - 8, 5, 100);
  recordJournal(S, `You fired ${mgr.name} as manager of ${biz.name}. Severance ${formatMoney(sev.amount, biz.country || S.country)} came out of your own pocket; the remaining team is shaken (morale −8). ${biz.name} is unmanaged until you hire a replacement or run it yourself.`, 'career');
  biz.manager = null;
  biz.ownerManaged = false;
  biz.ownerHoursPerWeek = 0;
  biz.unmanagedSince = { year: S.year, month: S.month };
  biz.unmanagedMonths = 0;
  return { ok: true, msg: `Fired ${mgr.name}. Severance ${formatMoney(sev.amount, biz.country || S.country)} paid from your cash.`, severance: sev.amount, severanceMonths: sev.months, source: sev.source, note: sev.note };
}

/* ------------------------------------------------------------------ *
   Promote from within
   ------------------------------------------------------------------ */
export function listPromotableStaff(S, biz) {
  normalizeManagerState(S, biz);
  if (!biz || !Array.isArray(biz.staff)) return [];
  return biz.staff.filter(e =>
    (Number(e.skill) || 0) >= PROMOTE_MIN_SKILL && (Number(e.morale) || 0) >= PROMOTE_MIN_MORALE);
}

export function promoteStaffToManager(S, biz, staffId) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz) return { ok: false, msg: 'No business found.' };
  if (biz.manager) return { ok: false, msg: `${biz.name} already has a manager (${biz.manager.name}). Fire them first if you want to promote someone.` };
  const staff = Array.isArray(biz.staff) ? biz.staff : [];
  const idx = staff.findIndex(e => e.id === staffId);
  if (idx < 0) {
    const qualified = listPromotableStaff(S, biz);
    if (qualified.length === 0) {
      return { ok: false, msg: `Nobody on the team can be promoted yet — a manager needs skill ${PROMOTE_MIN_SKILL}+ and morale ${PROMOTE_MIN_MORALE}+. Nobody on the team has both right now.` };
    }
    return { ok: false, msg: 'That person no longer works here.' };
  }
  const emp = staff[idx];
  const skill = Math.round(Number(emp.skill) || 0);
  const morale = Math.round(Number(emp.morale) || 0);
  if (skill < PROMOTE_MIN_SKILL || morale < PROMOTE_MIN_MORALE) {
    return { ok: false, msg: `${emp.name} cannot be promoted yet — a manager needs skill ${PROMOTE_MIN_SKILL}+ and morale ${PROMOTE_MIN_MORALE}+ (they have skill ${skill}, morale ${morale}).` };
  }
  const outsideWage = goingRateForSkill(S, biz, skill);
  const wage = Math.round((Number(emp.wageLocal) || 0) * 1.25);
  const mgrSkill = Math.max(30, skill - 10);
  staff.splice(idx, 1);
  biz.employees = staff.length;
  biz.manager = {
    name: emp.name,
    skill: mgrSkill,
    wage,
    loyalty: 75,
    policy: 'safe',
    hiredYear: S.year,
    hiredMonth: S.month,
    personId: emp.id
  };
  biz.ownerManaged = false;
  biz.ownerHoursPerWeek = 0;
  biz.unmanagedMonths = 0;
  biz.unmanagedSince = null;
  recordJournal(S, `Promoted ${emp.name} from ${emp.role} to manager of ${biz.name} — no hiring fee, ${formatMoney(wage, biz.country || S.country)}/month (cheaper than hiring outside, about ${formatMoney(outsideWage, biz.country || S.country)}/month for this skill). They start loyal (75) but less skilled as a manager than on the tools (skill ${mgrSkill}, was ${skill}).`, 'career');
  return {
    ok: true,
    msg: `${emp.name} is now manager of ${biz.name} — ${formatMoney(wage, biz.country || S.country)}/month, loyalty 75, skill ${mgrSkill}.`,
    manager: biz.manager,
    hiringFeeSaved: outsideWage,
    outsideWage,
    wage
  };
}

/* ------------------------------------------------------------------ *
   Monthly tick — loyalty drift, asks, skimming, quitting. Called by
   the coordinator ONCE a month per business, AFTER the settlement's
   own walletMoves (skim money and bonuses move cash at once, so they
   must not run inside the settlement's netDelta accounting).
   Loyalty moves in small steps, never silent cliffs; a loyal manager
   stays through a bad year (drift is capped at ±4/month).
   ------------------------------------------------------------------ */
export function tickManagerMonth(S, biz) {
  ensureExtendedState(S);
  normalizeManagerState(S, biz);
  if (!biz) return { ok: false, msg: 'No business.' };
  const now = monthIndex(S);
  const mgr = biz.manager;
  if (!mgr) {
    /* v2.14 merge (W1 blocker 2): the unmanaged counter is owned by
       W1's tickBusinessCapacityMonth (via applyWorkloadMonth) — it
       checks manager AND owner-hours AND capacity. This tick must NOT
       advance it, or the counter would move twice a month and
       owner-run businesses would be flagged at risk. */
    return { ok: true, managed: false, unmanagedMonths: biz.unmanagedMonths || 0 };
  }
  biz.unmanagedMonths = 0;
  biz.unmanagedWarned = false;
  const notes = [];
  let drift = 0;
  /* Underpaid: wage below 90% of the going rate for their skill. */
  const going = goingRateForSkill(S, biz, mgr.skill);
  if (mgr.wage < going * 0.9) {
    drift -= 2;
    notes.push(`underpaid (wage ${formatMoney(mgr.wage, biz.country || S.country)} vs going rate ${formatMoney(going, biz.country || S.country)})`);
  } else if (mgr.wage >= going) {
    drift += 1;
    notes.push('paid at the going rate');
  }
  /* Overworked: the business is in trouble. */
  const losing = Number(biz.monthsLosing) || 0;
  if (biz.lastPL && biz.lastPL.net < 0) {
    drift -= 2;
    notes.push('the business lost money this month');
  }
  if (losing >= 3) {
    drift -= 2;
    notes.push(`losing money ${losing} months running`);
  }
  /* Ignored: asks left waiting more than 3 months. */
  const stale = (biz.managerAsks || []).filter(a => now - (a.createdMonthIndex ?? now) > 3);
  if (stale.length > 0) {
    drift -= Math.min(4, stale.length * 2);
    notes.push(`${stale.length} request${stale.length > 1 ? 's' : ''} ignored for over 3 months`);
  }
  /* A loyal manager stays through a bad year: drift is small, and a
     manager above 70 loyalty never drops more than 1 in a bad month. */
  drift = clamp(drift, -4, 2);
  if (mgr.loyalty > 70 && drift < -1) drift = -1;
  const loyaltyBefore = mgr.loyalty;
  mgr.loyalty = clamp(mgr.loyalty + drift, 0, 100);
  if (drift !== 0) notes.push(`loyalty ${loyaltyBefore} → ${mgr.loyalty}`);
  /* Skill moves staff morale through applyManagerEffects' moraleDelta,
     which the coordinator applies in the P&L — this tick deliberately
     does NOT apply it again, or morale would move twice a month. */
  /* A new ask, sometimes — the kind depends on the policy brief. */
  let ask = null;
  if ((biz.managerAsks || []).length < 2 && rand(S) < 0.35) {
    ask = generateManagerAsk(S, biz);
  }
  /* Skimming: only a low-loyalty manager, and only sometimes. */
  let skimmed = 0;
  if (mgr.loyalty < 35 && rand(S) < (35 - mgr.loyalty) * 0.02) {
    skimmed = doSkim(S, biz, Math.max(100, Math.round((Number(biz.monthlyRev) || 0) * (0.03 + rand(S) * 0.05))));
    notes.push(`skimmed ${formatMoney(skimmed, biz.country || S.country)} — see the clues on the business card`);
  }
  /* Quitting: loyalty at the floor, or a better offer elsewhere. */
  if (mgr.loyalty <= MANAGER_QUIT_LOYALTY) {
    const q = managerQuits(S, biz, 'low loyalty');
    return { ok: true, managed: false, quit: true, reason: 'low loyalty', loyalty: mgr.loyalty, notes, quitResult: q };
  }
  if (mgr.loyalty < 30 && rand(S) < 0.08) {
    const rivalWage = Math.round(mgr.wage * 1.3);
    const rival = `${pickFirstName(biz.country || S.country, rand(S) < 0.5 ? 'm' : 'f', () => rand(S))} ${pickFamilyName(biz.country || S.country, () => rand(S))}`;
    biz.lastManagerOffer = { name: mgr.name, wage: rivalWage, from: rival, year: S.year, month: S.month };
    const q = managerQuits(S, biz, `a better offer — ${rival} offered ${formatMoney(rivalWage, biz.country || S.country)}/month`);
    return { ok: true, managed: false, quit: true, reason: 'better offer', offer: biz.lastManagerOffer, loyalty: mgr.loyalty, notes, quitResult: q };
  }
  return { ok: true, managed: true, loyalty: mgr.loyalty, drift, notes, ask, skimmed };
}

/* ------------------------------------------------------------------ *
   Render — the coordinator drops this into views.js (Ventures card).
   ------------------------------------------------------------------ */
export function renderManagerSectionHtml(S, biz) {
  if (!biz) return '';
  normalizeManagerState(S, biz);
  const countryId = biz.country || S.country;
  const mgr = biz.manager;
  const asks = biz.managerAsks || [];
  const clues = biz.embezzlement?.clues || [];
  const caught = biz.embezzlement?.caught;
  const head = `<h4>Manager</h4>`;
  if (!mgr) {
    const shortlist = managerShortlist(S, biz);
    /* v2.20 I3 — one wage source: the range the shortlist really asks
       (same curve, same tier), stated once above the candidates, and a
       plain-words warning on any candidate whose ask is more than the
       business netted last month. */
    const range = managerWageRangeForBusiness(S, biz);
    const rangeLine = `<div class="muted" style="margin-top:6px;">Managers for a ${esc(range.tier)} business like this ask about ${formatMoney(range.low, countryId)}–${formatMoney(range.high, countryId)}/month (skill ${range.lowSkill}–${range.highSkill}).</div>`;
    const cands = shortlist.map(c => {
      const warn = managerWageVsLastNet(S, biz, c.wage);
      const warnLine = warn
        ? `<div style="font-size:12px;color:var(--brand-crimson)">⚠ ${esc(c.name.split(' ')[0])} asks ${formatMoney(warn.wage, countryId)}/month but ${esc(biz.name)} netted ${formatMoney(warn.lastNet, countryId)} last month — you will pay about ${formatMoney(warn.topUp, countryId)}/month from your salary.</div>`
        : '';
      return `
      <div style="padding:6px 0;border-bottom:1px solid var(--hatch-widget-border, #ddd);">
        <strong>${esc(c.name)}</strong> <span class="muted">(${esc(c.tier)} · skill ${c.skill} · loyalty ${c.loyalty})</span>
        <div class="muted" style="font-size:12px;">${esc(c.line)} Asks ${formatMoney(c.wage, countryId)}/month.</div>
        ${warnLine}
        <button class="btn btn-sm" data-action="biz-hire-manager" data-biz="${esc(biz.id)}" data-person="${esc(c.personId)}" data-name="${esc(c.name)}" data-skill="${c.skill}" data-wage="${c.wage}" data-loyalty="${c.loyalty}">Hire ${esc(c.name.split(' ')[0])}</button>
      </div>`;
    }).join('');
    const promotable = listPromotableStaff(S, biz);
    const promo = promotable.length > 0
      ? `<div style="margin-top:6px;">Promote from within (skill ${PROMOTE_MIN_SKILL}+, morale ${PROMOTE_MIN_MORALE}+, no hiring fee): ${promotable.map(e => `<button class="btn btn-sm" data-action="biz-promote-manager" data-biz="${esc(biz.id)}" data-staff="${esc(e.id)}">Promote ${esc(e.name)}</button>`).join(' ')}</div>`
      : `<div class="muted" style="font-size:12px;margin-top:6px;">Promote from within: nobody on the team has skill ${PROMOTE_MIN_SKILL}+ and morale ${PROMOTE_MIN_MORALE}+ right now.</div>`;
    const unmanagedNote = isUnmanaged(S, biz)
      ? `<div style="margin-top:6px;"><strong>Unmanaged${biz.unmanagedMonths > 0 ? ` — ${biz.unmanagedMonths} month${biz.unmanagedMonths > 1 ? 's' : ''}` : ''}.</strong> No manager and no owner-hours. <button class="btn btn-sm" data-action="biz-take-over" data-biz="${esc(biz.id)}">Run it yourself</button></div>`
      : '';
    /* v2.20 I4 — the hours line reads the ALLOCATED figure, not the
       intent: a business the owner means to run but has no hours
       left for says so in plain words instead of claiming 18 hrs/week. */
    const allocatedHours = ownerHoursForBusiness(S, biz);
    const needHours = hoursNeededForMode(biz.mode);
    const selfRunLine = !biz.ownerManaged ? 'nobody is running it.'
      : allocatedHours >= needHours ? `you run it yourself (${allocatedHours} hrs/week).`
      : `you mean to run it yourself, but your week is full — no hours left for it (it needs ${needHours} hrs/week). It is unmanaged until you hire a manager or free up time.`;
    return `<div class="biz-manager-section" style="margin-top:10px;">${head}
      <div class="muted">No manager — ${selfRunLine}</div>
      ${unmanagedNote}
      <div style="margin-top:6px;"><strong>Candidates for ${esc(biz.name)}</strong> (${esc(businessSizeTier(S, biz))} business — better managers want bigger businesses)</div>
      ${rangeLine}
      ${cands}${promo}</div>`;
  }
  const fx = applyManagerEffects(S, biz);
  const inv = investigationCost(S, biz);
  const policyBtns = MANAGER_POLICIES.map(p => `
    <button class="btn btn-sm ${mgr.policy === p ? 'btn-navy' : ''}" data-action="biz-manager-policy" data-biz="${esc(biz.id)}" data-policy="${p}">${mgr.policy === p ? '✓ ' : ''}${p[0].toUpperCase() + p.slice(1)}</button>`).join(' ');
  const askRows = asks.length === 0
    ? `<div class="muted">No requests waiting.</div>`
    : asks.map(a => `
      <div style="padding:6px 0;border-bottom:1px solid var(--hatch-widget-border, #ddd);">
        <div>${esc(a.text)}${a.cost > 0 ? ` — costs ${formatMoney(a.cost, countryId)}` : ' — no cash cost'}</div>
        <button class="btn btn-sm" data-action="biz-manager-ask" data-biz="${esc(biz.id)}" data-ask="${esc(a.id)}" data-accept="yes">Accept</button>
        <button class="btn btn-sm" data-action="biz-manager-ask" data-biz="${esc(biz.id)}" data-ask="${esc(a.id)}" data-accept="no">Decline</button>
      </div>`).join('');
  const clueRows = clues.length === 0 ? '' : `
    <div style="margin-top:8px;"><strong>Something is wrong with the books:</strong>
      ${clues.map(c => `<div class="muted" style="font-size:12px;">• ${esc(c)}</div>`).join('')}
      <div class="muted" style="font-size:12px;margin-top:4px;">${esc(inv.text)}</div>
      <button class="btn btn-sm" data-action="biz-investigate" data-biz="${esc(biz.id)}">Investigate (${formatMoney(inv.cost, countryId)}, ${inv.timeMonths} month)</button>
    </div>`;
  const sueRow = caught && !caught.sued
    ? (() => { const q = sueManagerCost(S, biz); return q.ok ? `
      <div style="margin-top:8px;"><strong>${esc(caught.name)} was caught stealing ${formatMoney(caught.stolenTotal, countryId)} — ${formatMoney(caught.recovered, countryId)} recovered.</strong>
      <div class="muted" style="font-size:12px;">${esc(q.text)}</div>
      <button class="btn btn-sm" data-action="biz-sue-manager" data-biz="${esc(biz.id)}">Take them to court (${formatMoney(q.cost, countryId)})</button></div>` : ''; })()
    : caught ? `<div class="muted" style="font-size:12px;margin-top:8px;">Court case against ${esc(caught.name)}: ${esc(caught.sued)}.</div>` : '';
  return `<div class="biz-manager-section" style="margin-top:10px;">${head}
    <div><strong>${esc(mgr.name)}</strong> <span class="muted">— skill ${mgr.skill} · wage ${formatMoney(mgr.wage, countryId)}/mo · loyalty ${mgr.loyalty} · since ${mgr.hiredMonth}/${mgr.hiredYear}</span></div>
    <div class="muted" style="font-size:12px;">${fx.notes.map(n => esc(n)).join('<br>')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;"><span class="muted">Brief:</span> ${policyBtns}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
      <button class="btn btn-sm" data-action="biz-fire-manager" data-biz="${esc(biz.id)}">Fire manager</button>
      <span class="muted" style="font-size:12px;">Severance under ${esc(getCountry(countryId).name || countryId)} law, from your own cash; the team is shaken (morale −8).</span>
    </div>
    <div style="margin-top:8px;"><strong>Requests</strong>${askRows}</div>
    ${clueRows}${sueRow}</div>`;
}
