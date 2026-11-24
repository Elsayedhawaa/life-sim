import { businessSalvage } from '../data/businessValuation.js';
/* ============================================================================
   World Life 2.0 — Business Growth (v2.17 W2: §3 outcome distribution +
   §6 expansion — a store becomes a chain/group).

   What lives here, and nowhere else:
   - BRAND VALUE (biz.brandValue): a real number. It starts at 1,000 (the
     name alone is worth something, but exactly 1,000 moves NO revenue —
     a new business settles exactly like a v2.16 one, so the old exact
     fold tests still pass). A profitable month adds 50 + 2% of the net;
     a losing month takes 25 + 1% of the loss. Scandals take a chunk
     through brandDamage() (W5 / the coordinator call it when something
     real happens — a bad franchisee, an embezzlement story). Brand
     moves revenue: brandRevenueMult = 1 + clamp(brand above 1,000,
     0, 50,000) / 100,000 — +1% of revenue per 1,000 of brand above the
     start, capped at +50%. Once the business is a group, the brand
     that moves revenue is the GROUP's brand (parent + every branch,
     each counted above its own 1,000 start) — brand compounds across
     the group.
   - BREAKOUT: a business that is good — level 6+, 6 profitable months
     in a row, 65% repeat customers, an average staff skill of 60+,
     brand value 5,000+ — breaks out and becomes a GROUP (formGroup).
     Levels have no ceiling any more (businessEngine.js: the maxLevel 5
     cap is gone as a ceiling; the W1 level gate — months in business +
     consecutive profitable months + average staff skill — still gates
     every single level, it just never stops at 5).
   - THE GROUP (biz.group): a head office (real monthly cost, 2 staff),
     a regional manager (real salary, real effect on EVERY branch), a
     supply chain (buying in bulk cuts the per-unit cost — the base
     other-costs line — for EVERY branch, measured). The parent pays
     the head-office cost and the regional manager's wage as real P&L
     lines; the branches pay nothing for them, they just gain.
   - DISTRESS + DEATH: retainedEarnings += net every settled month, so
     equity = capitalInvested + retainedEarnings is the business's real
     worth, and months of losses eat it. Two losing months in a row put
     the business at risk (stage 1, plain words). Three losing months,
     or equity under a quarter of everything ever put in, is the second
     warning — it names the cause and the way out. Death comes when the
     equity is gone in a losing month, or the debts are bigger than
     everything ever put in. The death is in-place: biz.dead = true,
     biz.deathCause is a plain-words string, staff are let go with
     severance through fireAllStaff, salvage (half the capital left)
     pays the business debt first and the rest lands in personal cash,
     and the journal says what happened in plain words. (The old
     miss-3 closure in the settlement removes the record instead;
     closeBusiness in businessEngine.js stamps the same dead/deathCause
     on that path, so W5 reads one contract either way.)
   - MARKET SHOCKS: the fold rolls once a month (only from the
     business's second settled month — a new business's first month is
     its opening, and the old exact fold tests measure that month).
     The roll is a HASH of (business id, month index), NOT a draw
     from the shared rng stream — a shock must never shift the wave
     sequence other systems measure (that is what broke v214's
     unmanaged-decay check: one extra draw moved every later wave).
     Twin lives with the same business and the same months therefore
     face the same shocks — same luck, different management.
     Under 1.5% a severe month (revenue x0.50, plus something breaks —
     25% of monthlyCost), under 7.5% a market slump starts (3 months at
     revenue x0.75). A losing month also wears the team down (morale
     -3 each, for a business that is actually being run — an unmanaged
     business already loses 6 a month to the unmanaged decay, and the
     fold does not double-count it) — a bad month can cascade: losses
     -> morale falls -> revenue falls -> more losses.
   - monthEffects (the W3/W4 contract): biz.monthEffects is a plain
     object stamped by role/operation actions. The fold reads it,
     applies it and clears it. See readMonthEffects() for the fields
     and defaults; the application order is documented in
     businessMonthly.js step 9.7 (after every other fold, just before
     the final identity) and in the W2 report.

   Render: renderGroupHtml / renderBrandHtml are delivered here (views.js
   is NOT touched — the coordinator wires them in; the exact insertion
   points are in the W2 report and at the bottom of this file).
   ========================================================================== */

import { rand, clamp, hashSeed } from '../core/rng.js';
import { nextId, recordJournal, walletMove, recordLedgerEntry, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { pickFirstName, pickFamilyName } from '../data/names.js';
import { monthsInBusiness, consecutiveProfitableMonths, averageStaffSkill, businessMonthIndex, settleBusinessExitDebt } from './businessEngine.js';
import { fireAllStaff, monthlyMidSalary } from './businessStaff.js';

/* ------------------------------------------------------------------ *
   Constants — every formula in this file is one of these, so a test
   can read the number it is measuring against.
   ------------------------------------------------------------------ */
export const BRAND_START_VALUE = 1000;
export const BRAND_PROFIT_BASE = 50;
export const BRAND_PROFIT_SHARE = 0.02;
export const BRAND_LOSS_BASE = 25;
export const BRAND_LOSS_SHARE = 0.01;
export const BRAND_REVENUE_DIVISOR = 100000; /* +1% revenue per 1,000 brand above the start */
export const BRAND_REVENUE_CAP_ABOVE_START = 50000; /* revenue effect caps at +50% */
export const BREAKOUT_MIN_LEVEL = 6;
export const BREAKOUT_MIN_PROFITABLE_MONTHS = 6;
export const BREAKOUT_MIN_REPEAT_RATE = 0.65;
export const BREAKOUT_MIN_STAFF_SKILL = 60;
export const BREAKOUT_MIN_BRAND_VALUE = 5000;
export const SUPPLY_CHAIN_BASE_DISCOUNT = 0.10;
export const SUPPLY_CHAIN_PER_BRANCH = 0.02;
export const SUPPLY_CHAIN_PER_WAREHOUSE = 0.05;
export const SUPPLY_CHAIN_MAX_DISCOUNT = 0.25;
export const REGIONAL_MANAGER_WAGE_MULT = 1.5; /* x the country's mid monthly salary */
export const REGIONAL_MANAGER_BASE_PCT = 0.05; /* +5% revenue on every branch, before skill */
export const HEAD_OFFICE_REV_SHARE = 0.03; /* head office costs 3% of group monthly revenue... */
export const HEAD_OFFICE_STAFF = 2; /* ...and no less than one mid salary: a manager + an admin */
export const SHOCK_SEVERE_CHANCE = 0.015; /* 1.5% of months: revenue x0.50 + something breaks */
export const SHOCK_SLUMP_CHANCE = 0.075; /* cumulative: under 7.5% a 3-month slump starts */
export const SHOCK_SLUMP_MONTHS = 3; /* slump length, including the month it starts */
export const SHOCK_SEVERE_REV_MULT = 0.5;
export const SHOCK_SLUMP_REV_MULT = 0.75;
export const SHOCK_BREAKDOWN_SHARE = 0.25; /* breakdown costs 25% of monthlyCost */
export const LOSING_MONTH_MORALE_DROP = 3; /* a losing month wears the team down */
export const DISTRESS_STAGE1_LOSING_MONTHS = 2; /* at risk after 2 losing months in a row */
export const DISTRESS_STAGE2_LOSING_MONTHS = 3; /* second warning after 3 */
export const DISTRESS_STAGE2_EQUITY_SHARE = 0.25; /* ...or equity under a quarter of capital put in */

/* ------------------------------------------------------------------ *
   State — one place that makes sure every growth field exists.
   normalizeBusiness (businessEngine.js) sets the same defaults for
   any business that never passes through here.
   ------------------------------------------------------------------ */
export function ensureGrowthState(S, biz) {
  if (!biz || typeof biz !== 'object') return null;
  if (typeof biz.brandValue !== 'number' || Number.isNaN(biz.brandValue)) biz.brandValue = BRAND_START_VALUE;
  biz.brandValue = Math.max(0, Math.round(biz.brandValue));
  if (typeof biz.retainedEarnings !== 'number' || Number.isNaN(biz.retainedEarnings)) biz.retainedEarnings = 0;
  biz.retainedEarnings = Math.round(biz.retainedEarnings);
  if (typeof biz.totalCapitalIn !== 'number' || Number.isNaN(biz.totalCapitalIn)) {
    biz.totalCapitalIn = Math.max(0, Math.round(Number(biz.capitalInvested) || 0));
  }
  if (typeof biz.distressStage !== 'number') biz.distressStage = 0;
  if (typeof biz.marketSlumpMonths !== 'number') biz.marketSlumpMonths = 0;
  if (biz.dead === undefined) biz.dead = false;
  if (biz.deathCause === undefined) biz.deathCause = null;
  if (biz.group === undefined) biz.group = null;
  if (biz.brokeOut === undefined) biz.brokeOut = false;
  if (!biz.isBranch && biz.branchType === undefined) biz.branchType = null;
  if (biz.isBranch && !biz.branchType) biz.branchType = 'shop';
  return biz;
}

/* ------------------------------------------------------------------ *
   The group: parent + branches. A branch never has its own group —
   it belongs to its parent's.
   ------------------------------------------------------------------ */
export function groupParent(S, biz) {
  if (!biz) return null;
  if (!biz.isBranch) return biz;
  const parent = (S.career?.businesses || []).find(b => b && b.id === biz.parentBusinessId);
  return parent || biz;
}

export function groupMembers(S, biz) {
  const parent = groupParent(S, biz);
  if (!parent) return biz ? [biz] : [];
  const branches = (S.career?.businesses || []).filter(b => b && b.isBranch && b.parentBusinessId === parent.id);
  return [parent, ...branches];
}

export function groupMonthlyRevenue(S, biz) {
  return groupMembers(S, biz).reduce((sum, b) => sum + (Number(b.monthlyRev) || 0), 0);
}

/* Brand above the 1,000 start, summed over the whole group — that is
   the number that moves revenue. A single ungrouped business is just
   its own brand above 1,000. */
export function groupBrandAboveStart(S, biz) {
  return groupMembers(S, biz).reduce((sum, b) => {
    const v = Number(b.brandValue ?? BRAND_START_VALUE);
    return sum + Math.max(0, v - BRAND_START_VALUE);
  }, 0);
}

export function groupBrandValue(S, biz) {
  return groupMembers(S, biz).reduce((sum, b) => sum + (Number(b.brandValue ?? BRAND_START_VALUE) || 0), 0);
}

/* Revenue multiplier from brand: 1 + (brand above start, capped at
   50,000) / 100,000. A new business (brand 1,000) gets exactly 1.00. */
export function brandRevenueMult(S, biz) {
  const above = clamp(groupBrandAboveStart(S, biz), 0, BRAND_REVENUE_CAP_ABOVE_START);
  return 1 + above / BRAND_REVENUE_DIVISOR;
}

/* ------------------------------------------------------------------ *
   Regional manager — hired when the group forms. One salary, paid by
   the parent as a real P&L line; the effect lands on EVERY member of
   the group, branches included: revenue x (1 + 0.05 + skill/1000).
   Skill 70 -> +12%; skill 85 -> +13.5%.
   ------------------------------------------------------------------ */
export function regionalManagerOf(S, biz) {
  const parent = groupParent(S, biz);
  return (parent && parent.group && parent.group.regionalManager) || null;
}

export function regionalManagerRevenueMult(S, biz) {
  const rm = regionalManagerOf(S, biz);
  if (!rm) return 1;
  return 1 + REGIONAL_MANAGER_BASE_PCT + (Number(rm.skill) || 0) / 1000;
}

export function regionalManagerWage(S, biz) {
  const rm = regionalManagerOf(S, biz);
  return rm ? Math.max(0, Math.round(Number(rm.wage) || 0)) : 0;
}

/* Head office: max(one mid monthly salary, 3% of the group's monthly
   revenue), 2 staff (an office manager and an admin). Paid by the
   parent as a real P&L line — the branches pay nothing for it. */
export function headOfficeCost(S, biz) {
  const parent = groupParent(S, biz);
  if (!parent || !parent.group) return 0;
  const mid = monthlyMidSalary(S, parent.country || S.country);
  return Math.max(Math.round(mid), Math.round(groupMonthlyRevenue(S, parent) * HEAD_OFFICE_REV_SHARE));
}

/* ------------------------------------------------------------------ *
   Supply chain — buying in bulk cuts the per-unit cost (the base
   other-costs line) for EVERY member of the group:
   discount = 0.10 + 0.02 per branch + 0.05 per warehouse, capped 0.25.
   A group with no branches yet still buys in bulk for the parent
   alone (10%); each branch and each warehouse deepens the discount.
   ------------------------------------------------------------------ */
export function computeBulkDiscount(branchCount, warehouseCount) {
  return Math.min(
    SUPPLY_CHAIN_MAX_DISCOUNT,
    SUPPLY_CHAIN_BASE_DISCOUNT + SUPPLY_CHAIN_PER_BRANCH * branchCount + SUPPLY_CHAIN_PER_WAREHOUSE * warehouseCount
  );
}

export function supplyChainDiscount(S, biz) {
  const parent = groupParent(S, biz);
  if (!parent || !parent.group) return 0;
  const members = groupMembers(S, parent);
  const branches = members.slice(1);
  const warehouses = branches.filter(b => b.branchType === 'warehouse').length;
  return computeBulkDiscount(branches.length, warehouses);
}

/* ------------------------------------------------------------------ *
   Brand: grows with profitable months, falls with bad months.
   Returns the signed change, so the fold can show it on the P&L.
   ------------------------------------------------------------------ */
export function applyBrandMonth(S, biz, pl) {
  const net = Number(pl?.net) || 0;
  let delta = 0;
  if (net > 0) delta = BRAND_PROFIT_BASE + net * BRAND_PROFIT_SHARE;
  else if (net < 0) delta = -(BRAND_LOSS_BASE + Math.abs(net) * BRAND_LOSS_SHARE);
  delta = Math.round(delta);
  biz.brandValue = Math.max(0, Math.round((Number(biz.brandValue ?? BRAND_START_VALUE)) + delta));
  return delta;
}

/* A scandal takes a chunk out of the brand at once — called by W5 /
   the coordinator when something real happens (a bad franchisee, an
   embezzlement story in the news). The fold's monthly rule never
   calls this on its own. */
export function brandDamage(S, biz, amount, reason = 'a scandal') {
  ensureExtendedState(S);
  ensureGrowthState(S, biz);
  const hit = Math.max(0, Math.round(Number(amount) || 0));
  if (hit <= 0) return { ok: false, msg: 'No brand damage.' };
  const before = Number(biz.brandValue ?? BRAND_START_VALUE);
  biz.brandValue = Math.max(0, before - hit);
  recordJournal(S, `${biz.name} took a hit to its name — ${reason} — and its brand value fell from ${formatMoney(before, S.country)} to ${formatMoney(biz.brandValue, S.country)}.`, 'money');
  return { ok: true, before, after: biz.brandValue, hit };
}

/* ------------------------------------------------------------------ *
   Breakout — the five conditions, all real state. Returns the
   checklist so the card can show the player exactly what is missing.
   ------------------------------------------------------------------ */
export function breakoutCheck(S, biz) {
  const level = Number(biz.level) || 1;
  const profitable = consecutiveProfitableMonths(biz);
  const repeatRate = Number(biz.repeatRate ?? 0.5);
  const staffSkill = averageStaffSkill(biz);
  const brandValue = Number(biz.brandValue ?? BRAND_START_VALUE);
  const missing = [];
  if (level < BREAKOUT_MIN_LEVEL) missing.push(`level ${level} — breaking out needs level ${BREAKOUT_MIN_LEVEL}`);
  if (profitable < BREAKOUT_MIN_PROFITABLE_MONTHS) missing.push(`only ${profitable} profitable month${profitable === 1 ? '' : 's'} in a row — breaking out needs ${BREAKOUT_MIN_PROFITABLE_MONTHS}`);
  if (repeatRate < BREAKOUT_MIN_REPEAT_RATE) missing.push(`only ${Math.round(repeatRate * 100)}% repeat customers — breaking out needs ${Math.round(BREAKOUT_MIN_REPEAT_RATE * 100)}%`);
  if (staffSkill < BREAKOUT_MIN_STAFF_SKILL) missing.push(`the team's average skill is ${Math.round(staffSkill)} — breaking out needs ${BREAKOUT_MIN_STAFF_SKILL}`);
  if (brandValue < BREAKOUT_MIN_BRAND_VALUE) missing.push(`brand value ${formatMoney(brandValue, S.country)} — breaking out needs ${formatMoney(BREAKOUT_MIN_BRAND_VALUE, S.country)}`);
  return {
    ok: missing.length === 0,
    level, profitableMonths: profitable, repeatRate, staffSkill, brandValue,
    minLevel: BREAKOUT_MIN_LEVEL, minProfitableMonths: BREAKOUT_MIN_PROFITABLE_MONTHS,
    minRepeatRate: BREAKOUT_MIN_REPEAT_RATE, minStaffSkill: BREAKOUT_MIN_STAFF_SKILL,
    minBrandValue: BREAKOUT_MIN_BRAND_VALUE,
    missing
  };
}

/* Form the group. The parent becomes the flagship of a group with a
   head office, a regional manager (named, skilled 65–85, paid 1.5x
   the mid monthly salary) and a supply chain whose bulk discount is
   computed from the branches it already has. Once only. */
export function formGroup(S, biz) {
  ensureExtendedState(S);
  ensureGrowthState(S, biz);
  if (biz.isBranch) return { ok: false, msg: 'A branch cannot become a group — the parent business breaks out, and the branches belong to it.' };
  if (biz.group) return { ok: false, msg: `${biz.name} is already a group.` };
  const check = breakoutCheck(S, biz);
  if (!check.ok) {
    return { ok: false, check, msg: `${biz.name} is not ready to break out yet: ${check.missing.join('; ')}.` };
  }
  const countryId = biz.country || S.country;
  const gender = rand(S) < 0.5 ? 'f' : 'm';
  const rmName = `${pickFirstName(countryId, gender, () => rand(S))} ${pickFamilyName(countryId, () => rand(S))}`;
  const rmSkill = 65 + Math.floor(rand(S) * 21); /* 65–85 */
  const rmWage = Math.round(monthlyMidSalary(S, countryId) * REGIONAL_MANAGER_WAGE_MULT);
  const members = groupMembers(S, biz);
  const branches = members.slice(1);
  const warehouses = branches.filter(b => b.branchType === 'warehouse').length;
  const bulkDiscount = computeBulkDiscount(branches.length, warehouses);
  biz.group = {
    headOffice: {
      monthlyCostLocal: 0, /* priced on formation below, once the group exists */
      staff: HEAD_OFFICE_STAFF,
      city: biz.city || S.city,
      openedYear: S.year, openedMonth: S.month
    },
    regionalManager: { name: rmName, skill: rmSkill, wage: rmWage, hiredYear: S.year, hiredMonth: S.month },
    supplyChain: { bulkDiscount },
    formedYear: S.year, formedMonth: S.month
  };
  biz.group.headOffice.monthlyCostLocal = headOfficeCost(S, biz);
  biz.brokeOut = true;
  recordJournal(S, `${biz.name} has broken out — it is now a group. A head office opened in ${biz.group.headOffice.city} (${formatMoney(biz.group.headOffice.monthlyCostLocal, S.country)} a month, ${HEAD_OFFICE_STAFF} staff), ${rmName} runs the regions as regional manager (${formatMoney(rmWage, S.country)} a month — every branch earns ${Math.round((regionalManagerRevenueMult(S, biz) - 1) * 100)}% more revenue under them), and buying in bulk now cuts what every branch pays for stock by ${Math.round(bulkDiscount * 100)}%.`, 'milestone');
  return { ok: true, check, group: biz.group, msg: `${biz.name} broke out and is now a group — head office, regional manager ${rmName}, and a supply chain cutting stock costs ${Math.round(bulkDiscount * 100)}% for every branch.` };
}

/* ------------------------------------------------------------------ *
   Distress + death.
   equity = capitalInvested + retainedEarnings: the business's real
   worth. Months of losses eat it; months of profit rebuild it.
   ------------------------------------------------------------------ */
export function losingStreak(biz) {
  const hist = Array.isArray(biz?.history) ? biz.history : [];
  let n = 0;
  for (let i = hist.length - 1; i >= 0; i--) {
    if ((Number(hist[i]?.net) || 0) < 0) n += 1;
    else break;
  }
  return n;
}

export function businessEquity(biz) {
  return Math.round((Number(biz.capitalInvested) || 0) + (Number(biz.retainedEarnings) || 0));
}

/* The cause, in plain words, from the state that is actually true.
   Priority: debts first, then a bad manager, then a decision that
   backfired, then customers leaving, then plain months of losses. */
export function distressCause(S, biz) {
  const totalIn = Number(biz.totalCapitalIn ?? biz.capitalInvested) || 0;
  const debt = Number(biz.debtLocal) || 0;
  if (debt > 0 && debt >= totalIn) {
    return `debts of ${formatMoney(debt, S.country)} the business could not pay`;
  }
  const mgr = biz.manager;
  if (mgr && ((Number(mgr.skill) || 0) < 30 || (Number(mgr.loyalty) || 0) < 25)) {
    return `a manager who ran it into the ground (${escText(mgr.name || 'the manager')}, skill ${mgr.skill ?? '?'}, loyalty ${mgr.loyalty ?? '?'})`;
  }
  if (biz.lastCriticVerdict === 'pan') return 'a decision that backfired — a critic panned it and customers stayed away';
  if (biz.lastSupplierOutcome === 'failed') return 'a decision that backfired — a supplier failed to deliver and the shelves stood empty';
  if (biz.lastCompetitionResult === 'lost') return 'a decision that backfired — a rival won the customers it was chasing';
  if ((Number(biz.repeatRate ?? 0.5)) < 0.25) {
    return `customers stopped coming back — only ${Math.round((Number(biz.repeatRate ?? 0.5)) * 100)}% return`;
  }
  return 'months of losses that ate all its capital';
}

/* One monthly check, called by the fold after the P&L settles (first
   fold of the month only). Warns twice before it kills: stage 1 after
   2 losing months in a row, stage 2 after 3 losing months or equity
   under a quarter of the capital put in. Death when the equity is
   gone in a losing month, or the debts are bigger than everything
   ever put in. A profitable month clears the distress — and says so. */
export function checkDistressAndDeath(S, biz, pl) {
  if (!biz || biz.dead) return { died: false, alreadyDead: !!biz.dead };
  const net = Number(pl?.net) || 0;
  const streak = losingStreak(biz);
  if (net > 0) {
    if ((biz.distressStage || 0) > 0) {
      biz.distressStage = 0;
      recordJournal(S, `${biz.name} made a profit again — the danger has passed for now, but the capital it burned is gone.`, 'money');
    }
    return { died: false, stage: 0, streak };
  }
  if (net === 0) return { died: false, stage: Number(biz.distressStage) || 0, streak };
  /* A losing month. */
  const equity = businessEquity(biz);
  const totalIn = Number(biz.totalCapitalIn ?? biz.capitalInvested) || 0;
  const debt = Number(biz.debtLocal) || 0;
  const debtUnpayable = debt > 0 && debt >= totalIn;
  if ((equity <= 0 || debtUnpayable)) {
    const cause = distressCause(S, biz);
    const killed = killBusiness(S, biz, cause);
    return { died: true, cause, stage: Number(biz.distressStage) || 0, streak, ...killed };
  }
  if (streak >= DISTRESS_STAGE2_LOSING_MONTHS || equity < totalIn * DISTRESS_STAGE2_EQUITY_SHARE) {
    if ((biz.distressStage || 0) < 2) {
      biz.distressStage = 2;
      const cause = distressCause(S, biz);
      recordJournal(S, `${biz.name} is in serious trouble — ${cause}. It has lost money ${streak} month${streak === 1 ? '' : 's'} in a row and only ${formatMoney(Math.max(0, equity), S.country)} of its capital is left. Put more money in, cut costs, sell it, or close it now — if the losses go on, it will close on its own and the staff will lose their jobs.`, 'money');
    }
    return { died: false, stage: 2, streak };
  }
  if (streak >= DISTRESS_STAGE1_LOSING_MONTHS) {
    if ((biz.distressStage || 0) < 1) {
      biz.distressStage = 1;
      recordJournal(S, `${biz.name} has lost money ${streak} months in a row. It is at risk — if the losses go on, the capital will run out and the business will close. Cut costs, change the prices, or put money in.`, 'money');
    }
    return { died: false, stage: 1, streak };
  }
  return { died: false, stage: Number(biz.distressStage) || 0, streak };
}

/* The death itself, in place — the record stays in the portfolio,
   marked dead, so W5 (fate) and the card can read it. Staff go
   through the existing severance path; salvage (half the capital
   left) pays the business debt first, the rest lands in personal
   cash; the journal says what happened in plain words. */
export function killBusiness(S, biz, cause) {
  ensureExtendedState(S);
  const name = biz.name || 'The business';
  biz.dead = true;
  biz.deathCause = cause;
  biz.deadYear = S.year;
  biz.deadMonth = S.month;
  biz.misses = 0; /* the death supersedes the miss chain — it is dead, not late */
  const staffCount = (biz.staff || []).length;
  let severancePaid = 0;
  let severanceUnpaid = 0;
  if (staffCount > 0) {
    try {
      const fired = fireAllStaff(S, biz, `closed — ${cause}`);
      severancePaid = Math.max(0, (fired?.totalSeverance || 0) - (fired?.unpaid || 0));
      severanceUnpaid = fired?.unpaid || 0;
    } catch (_) {
      biz.staff = [];
      biz.employees = 0;
    }
  }
  const salvage = businessSalvage(biz);
  const exit = settleBusinessExitDebt(S, biz, salvage);
  const debtPaid = exit.debtPaid;
  const remainder = exit.proceeds;
  if (remainder > 0) walletMove(S, remainder, `Salvage sale, after bills: ${name} (${cause})`, 'business');
  biz.capitalInvested = 0;
  const debtLeft = exit.shortfall;
  recordJournal(S, `${name} has closed — ${cause}. It was sold off for ${formatMoney(salvage, S.country)} in salvage${debtPaid > 0 ? `, of which ${formatMoney(debtPaid, S.country)} went to pay its debts` : ''}${debtLeft > 0 ? `; ${formatMoney(debtLeft, S.country)} of business debt is still owed` : ''}.${staffCount > 0 ? ` ${staffCount} employee${staffCount > 1 ? 's' : ''} lost their jobs (severance ${formatMoney(severancePaid, S.country)} paid${severanceUnpaid > 0 ? `, ${formatMoney(severanceUnpaid, S.country)} still owed` : ''}).` : ''}`, 'money');
  return { ok: true, salvage, debtPaid, debtLeft, staffCount, severancePaid, severanceUnpaid };
}

/* ------------------------------------------------------------------ *
   Market shocks — ONE hash roll per settled month, from the second
   settled month on (a new business's first month is its opening).
   The roll is hashSeed(business id + month index) / 2^32: deterministic
   per business-month, and it consumes NOTHING from the shared rng
   stream, so a shock never shifts the wave sequence other systems
   measure. Returns { shock: 'none' | 'severe' | 'slump' |
   'slump-ongoing' } and writes the effect onto the P&L (revenue down,
   breakdown cost up).
   ------------------------------------------------------------------ */
export function applyMarketShock(S, biz, pl) {
  const priorSettledMonths = Math.max(0, (Array.isArray(biz.history) ? biz.history.length : 0) - 1);
  if (priorSettledMonths < 1) return { shock: 'none' };
  if ((Number(biz.marketSlumpMonths) || 0) > 0) {
    biz.marketSlumpMonths -= 1;
    pl.revenue = Math.max(0, Math.round(pl.revenue * SHOCK_SLUMP_REV_MULT));
    pl.marketSlump = true;
    return { shock: 'slump-ongoing', monthsLeft: Number(biz.marketSlumpMonths) };
  }
  const r = hashSeed(`${biz.id}:${businessMonthIndex(S)}`) / 4294967296;
  if (r < SHOCK_SEVERE_CHANCE) {
    const breakdown = Math.round((Number(biz.monthlyCost) || 0) * SHOCK_BREAKDOWN_SHARE);
    pl.revenue = Math.max(0, Math.round(pl.revenue * SHOCK_SEVERE_REV_MULT));
    if (breakdown > 0) {
      pl.other = Math.max(0, (Number(pl.other) || 0) + breakdown);
      pl.costs = (Number(pl.costs) || 0) + breakdown;
      pl.breakdownCost = breakdown;
    }
    pl.marketShock = 'severe';
    recordJournal(S, `A bad month at ${biz.name}: takings collapsed and something broke (${formatMoney(breakdown, S.country)} to fix). Bad months happen — but two or three in a row will eat the capital.`, 'money');
    return { shock: 'severe', breakdown };
  }
  if (r < SHOCK_SLUMP_CHANCE) {
    biz.marketSlumpMonths = SHOCK_SLUMP_MONTHS - 1; /* this month counts as the first of three */
    pl.revenue = Math.max(0, Math.round(pl.revenue * SHOCK_SLUMP_REV_MULT));
    pl.marketSlump = true;
    recordJournal(S, `Trade has turned down for ${biz.name} — fewer customers through the door, and it looks like it will last a few months. A short slump is survivable; a long one eats the capital.`, 'money');
    return { shock: 'slump', monthsLeft: Number(biz.marketSlumpMonths) };
  }
  return { shock: 'none' };
}

/* ------------------------------------------------------------------ *
   monthEffects — the W3/W4 contract. A plain object stamped on the
   business by role/operation actions during the month; the fold reads
   it, applies it and clears it. All fields optional.
   ------------------------------------------------------------------ */
export function readMonthEffects(biz) {
  const me = (biz && typeof biz.monthEffects === 'object' && biz.monthEffects) || {};
  return {
    revenueMult: Number(me.revenueMult) || 1,
    revenueAdd: Number(me.revenueAdd) || 0,
    costAdd: Number(me.costAdd) || 0,
    repeatRateDelta: Number(me.repeatRateDelta) || 0,
    moraleDelta: Number(me.moraleDelta) || 0,
    notes: Array.isArray(me.notes) ? me.notes.filter(n => typeof n === 'string' && n) : []
  };
}

/* ------------------------------------------------------------------ *
   Render — delivered here, NOT wired into views.js (the coordinator
   wires them; insertion points are in the W2 report).
   ------------------------------------------------------------------ */
export function escText(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderBrandHtml(S, biz) {
  if (!biz) return '';
  const brand = Number(biz.brandValue ?? BRAND_START_VALUE);
  const mult = brandRevenueMult(S, biz);
  const pct = Math.round((mult - 1) * 100);
  const lastDelta = biz.lastPL && typeof biz.lastPL.brandDelta === 'number' ? biz.lastPL.brandDelta : null;
  const deltaText = lastDelta === null ? ''
    : lastDelta > 0 ? ` (up ${formatMoney(lastDelta, S.country)} last month)`
    : lastDelta < 0 ? ` (down ${formatMoney(Math.abs(lastDelta), S.country)} last month)` : ' (unchanged last month)';
  const check = breakoutCheck(S, biz);
  const rows = [
    [`Level ${biz.level} (needs ${BREAKOUT_MIN_LEVEL})`, biz.level >= BREAKOUT_MIN_LEVEL],
    [`${check.profitableMonths} profitable months in a row (needs ${BREAKOUT_MIN_PROFITABLE_MONTHS})`, check.profitableMonths >= BREAKOUT_MIN_PROFITABLE_MONTHS],
    [`${Math.round((Number(biz.repeatRate ?? 0.5)) * 100)}% repeat customers (needs ${Math.round(BREAKOUT_MIN_REPEAT_RATE * 100)}%)`, (Number(biz.repeatRate ?? 0.5)) >= BREAKOUT_MIN_REPEAT_RATE],
    [`Team skill ${Math.round(check.staffSkill)} (needs ${BREAKOUT_MIN_STAFF_SKILL})`, check.staffSkill >= BREAKOUT_MIN_STAFF_SKILL],
    [`Brand value ${formatMoney(brand, S.country)} (needs ${formatMoney(BREAKOUT_MIN_BRAND_VALUE, S.country)})`, brand >= BREAKOUT_MIN_BRAND_VALUE]
  ].map(([label, met]) => `<div>${met ? '✓' : '·'} ${escText(label)}</div>`).join('');
  const groupNote = biz.group
    ? `<div class="muted">Part of the ${escText(biz.name)} group — the brand that moves revenue is the whole group's (${formatMoney(groupBrandValue(S, biz), S.country)}).</div>`
    : '';
  return `
  <div class="biz-brand-section" style="margin-top:10px;">
    <h4>Brand — ${escText(biz.name)}</h4>
    <div>Brand value: <strong>${escText(formatMoney(brand, S.country))}</strong>${escText(deltaText)} — worth <strong>${pct > 0 ? `+${pct}%` : 'no extra'} revenue</strong>${pct > 0 ? ` (brand above ${formatMoney(BRAND_START_VALUE, S.country)} pays +1% per ${formatMoney(1000, S.country)}, up to +50%)` : ` (brand above ${formatMoney(BRAND_START_VALUE, S.country)} pays +1% revenue per ${formatMoney(1000, S.country)})`}.</div>
    <div class="muted" style="font-size:12px;">A profitable month grows the brand (+${formatMoney(BRAND_PROFIT_BASE, S.country)} + 2% of the profit); a losing month shrinks it.</div>
    ${groupNote}
    <div style="margin-top:6px;"><strong>Breaking out — what it takes:</strong></div>
    ${rows}
    ${biz.group ? '' : `<div class="muted" style="font-size:12px;">Meet all five and ${escText(biz.name)} becomes a group: a head office, a regional manager and a supply chain.</div>`}
  </div>`;
}

export function renderGroupHtml(S, biz) {
  if (!biz || !biz.group) return '';
  const g = biz.group;
  const members = groupMembers(S, biz);
  const branches = members.slice(1);
  const rm = g.regionalManager || {};
  const rmPct = Math.round((regionalManagerRevenueMult(S, biz) - 1) * 100);
  const discount = supplyChainDiscount(S, biz);
  const rows = branches.map(b => {
    const pl = b.lastPL;
    const plText = pl
      ? `last month net ${formatMoney(pl.net, S.country)}`
      : 'no month settled yet';
    return `<div>· <strong>${escText(b.name)}</strong> — ${escText(b.branchType || 'shop')} in ${escText(b.city)} · ${(b.staff || []).length} staff · ${plText}</div>`;
  }).join('');
  return `
  <div class="biz-group-section" style="margin-top:10px;">
    <h4>Group — ${escText(biz.name)} (formed ${escText(String(g.formedMonth || ''))}/${escText(String(g.formedYear || ''))})</h4>
    <div>Head office in ${escText(g.headOffice?.city || biz.city || '')}: <strong>${escText(formatMoney(g.headOffice?.monthlyCostLocal || headOfficeCost(S, biz), S.country))}/month</strong> · ${g.headOffice?.staff ?? HEAD_OFFICE_STAFF} staff (an office manager and an admin).</div>
    <div>Regional manager: <strong>${escText(rm.name || '—')}</strong> (skill ${rm.skill ?? '?'}) — ${escText(formatMoney(rm.wage || 0, S.country))}/month. Every branch earns <strong>+${rmPct}% revenue</strong> under them.</div>
    <div>Supply chain: buying in bulk cuts what every branch pays for stock by <strong>${Math.round(discount * 100)}%</strong> (${branches.length} ${branches.length === 1 ? 'branch' : 'branches'}${branches.some(b => b.branchType === 'warehouse') ? `, including ${branches.filter(b => b.branchType === 'warehouse').length} warehouse${branches.filter(b => b.branchType === 'warehouse').length === 1 ? '' : 's'}` : ''}).</div>
    <div>Group brand value: <strong>${escText(formatMoney(groupBrandValue(S, biz), S.country))}</strong> — worth <strong>+${Math.round((brandRevenueMult(S, biz) - 1) * 100)}% revenue</strong> across the group.</div>
    <div style="margin-top:4px;">${rows || '<div class="muted">No branches yet — open one and it joins the group.</div>'}</div>
  </div>`;
}

/* v2.20 I4 — the group section no longer renders as its own open card
   (the card is a menu now). Its lines live where they belong:
   - the head-office and regional-manager costs are real P&L lines the
     parent pays, so they sit in the menu's Cash section;
   - the bulk-discount line sits in the menu's Suppliers section.
   The member rows duplicate the Branches list and the group brand
   value duplicates the Brand section, so neither is repeated here. */
export function renderGroupCashLinesHtml(S, biz) {
  if (!biz || !biz.group) return '';
  const g = biz.group;
  const rm = g.regionalManager || {};
  const hoCost = headOfficeCost(S, biz);
  const rmWage = regionalManagerWage(S, biz);
  return `
  <div style="margin-top:6px;"><strong>Group costs (paid by ${escText(biz.name)}).</strong>
    <div class="muted">Head office in ${escText(g.headOffice?.city || biz.city || '')}: ${escText(formatMoney(hoCost, S.country))}/month · ${g.headOffice?.staff ?? HEAD_OFFICE_STAFF} staff (an office manager and an admin).</div>
    <div class="muted">Regional manager: ${escText(rm.name || '—')} (skill ${rm.skill ?? '?'}) — ${escText(formatMoney(rmWage, S.country))}/month. Every branch earns +${Math.round((regionalManagerRevenueMult(S, biz) - 1) * 100)}% revenue under them.</div>
  </div>`;
}

export function renderGroupSupplyLineHtml(S, biz) {
  if (!biz || !biz.group) return '';
  const members = groupMembers(S, biz);
  const branches = members.slice(1);
  const discount = supplyChainDiscount(S, biz);
  return `<div class="muted" style="margin-top:6px;">Group supply chain: buying in bulk cuts what every branch pays for stock by <strong>${Math.round(discount * 100)}%</strong> (${branches.length} ${branches.length === 1 ? 'branch' : 'branches'}${branches.some(b => b.branchType === 'warehouse') ? `, including ${branches.filter(b => b.branchType === 'warehouse').length} warehouse${branches.filter(b => b.branchType === 'warehouse').length === 1 ? '' : 's'}` : ''}).</div>`;
}
