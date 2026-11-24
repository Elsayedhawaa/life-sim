import{renderStaffListHtml}from './businessRoles.js';
import{renderPricingSectionHtml}from './businessOperations.js';
/* ============================================================================
   World Life 2.0 — Business Branches (v2.14 W4, §5)
   A branch is a REAL second location, not a multiplier.

   Contract:
   - openBranch(S, biz, cityId) creates a second business record with
     isBranch: true and parentBusinessId: <parent id>. It has its OWN
     premises (rented from the game's commercial catalogue, through
     the premises system — the first month's rent is charged and the
     rent shown is the rent the P&L charges), its OWN staff (hired
     fresh, or moved from the parent — moving a staff member removes
     them from the parent's staff list), its OWN P&L line (it is a
     normal record in S.career.businesses, so the monthly settlement
     already computes and posts its P&L like any business — no
     separate settlement path), and its OWN repeat-customer rate.
   - A branch in a city where the player has no presence costs MORE
     to start (setup cost x1.5) and earns LESS at first (smaller
     revenue share and a repeat-customer rate starting near the floor,
     30%, because nobody there knows the name). A branch in the home
     city (where the player lives / already trades) costs the base
     setup and starts with a repeat-customer rate close to the parent's.
   - sellBranch / closeBranch act on the branch alone, using the same
     rules as any business: sell at businessValuation, close for
     0.5x capital salvage plus staff severance (closeBusiness).
   - A branch can have its own manager (§2 — Worker 2 owns the
     manager system): the record accepts biz.manager in the same
     shape as any business, and openBranch leaves manager null so a
     manager can be hired for it afterwards. A branch with no manager
     runs on the player's hours like any business (mode part-time by
     default).
   - Every money move posts a ledger line (walletMove).
   ========================================================================== */

import { rand, clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove, recordLedgerEntry, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { pickFirstName, pickFamilyName } from '../data/names.js';
import {
  businessValuation, normalizeBusiness, migrateBusinesses, syncBusinessMirror,
  resolveBusiness, computeBusinessMonth, closeBusiness, sellBusiness
} from './businessEngine.js';
import { seedStartingStaff } from './businessStaff.js';
import { listCommercialPremises, rentBusinessPremises } from './businessPremises.js';
/* v2.20 merge — the branch row reads the ALLOCATED hours, not the
   intent (same rule as the card's manager line, businessManager.js):
   a branch the owner has no hours left for says so in plain words
   instead of claiming the owner runs it. No cycle: businessCapacity.js
   never imports this file. */
import { ownerHoursForBusiness, hoursNeededForMode } from './businessCapacity.js';

export const BRANCH_SETUP_SHARE = 0.55; /* of the parent's capital invested */
export const BRANCH_NEW_CITY_SETUP_MULT = 1.5; /* no presence there: costs more */
export const BRANCH_HOME_REV_SHARE = 0.6; /* branch revenue vs parent, home city */
export const BRANCH_NEW_CITY_REV_SHARE = 0.45; /* new city: earns less at first */
export const BRANCH_NEW_CITY_REPEAT_RATE = 0.30; /* near the floor — nobody knows you */
export const BRANCH_HOME_REPEAT_DROP = 0.10; /* home city: parent repeat rate minus 0.10 */
export const BRANCH_HOME_REPEAT_FLOOR = 0.35;
export const BRANCH_STARTING_STAFF = 3;

/* v2.17 W2 — branch TYPES. A branch is not just a second shop any
   more: each type has its own setup cost, revenue share, staff, rent
   and job in the group. A kiosk is cheap and small; a warehouse is
   expensive, earns little itself, and feeds the supply chain (each
   warehouse deepens the group's bulk discount by 5% — see
   businessGrowth.js); a franchise outlet pays the royalty the OTHER
   way — the franchisee funds the fit-out, pays an upfront fee into
   the parent's retained cash, and pays 5% of the outlet's monthly
   revenue every month through the existing franchiseIncome line. */
export const BRANCH_TYPES = {
  shop: {
    id: 'shop', label: 'Second shop',
    setupShare: 0.55, revShareHome: 0.60, revShareNew: 0.45,
    costShareHome: 0.60, costShareNew: 0.45, staff: 3, premisesUnitId: 'comm_shop',
    desc: 'A full second shop: its own premises, staff, rent and P&L.'
  },
  kiosk: {
    id: 'kiosk', label: 'Kiosk',
    setupShare: 0.15, revShareHome: 0.25, revShareNew: 0.25,
    costShareHome: 0.25, costShareNew: 0.25, staff: 1, premisesUnitId: 'comm_stall',
    desc: 'Cheap and small — a market-stall pitch, one person, a quarter of a shop\'s trade.'
  },
  franchise_outlet: {
    id: 'franchise_outlet', label: 'Franchise outlet',
    setupShare: 0.40, revShareHome: 0.50, revShareNew: 0.50,
    costShareHome: 0.50, costShareNew: 0.50, staff: 2, premisesUnitId: 'comm_shop',
    desc: 'A franchisee funds the fit-out, pays you an upfront fee and 5% of the outlet\'s revenue every month. You pay no setup cost — only the first month\'s rent while it opens.'
  },
  warehouse: {
    id: 'warehouse', label: 'Warehouse',
    setupShare: 0.80, revShareHome: 0.20, revShareNew: 0.20,
    costShareHome: 0.30, costShareNew: 0.30, staff: 2, premisesUnitId: 'comm_workshop',
    desc: 'Expensive and earns little itself (third-party storage income only) — its real value is the supply chain: each warehouse cuts what every branch pays for stock by another 5%.'
  }
};

export function branchTypeLabel(branchType) {
  if(branchType==='subsidiary')return 'Foreign subsidiary';
  return (BRANCH_TYPES[branchType] || BRANCH_TYPES.shop).label;
}

export function branchTypeFor(biz) {
  return BRANCH_TYPES[(biz && biz.branchType) || 'shop'] || BRANCH_TYPES.shop;
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------------ *
   Lookups.
   ------------------------------------------------------------------ */

export function listBranches(S, bizRef) {
  migrateBusinesses(S);
  const parent = resolveBusiness(S, bizRef);
  if (!parent) return [];
  return (S.career.businesses || []).filter(b => b && b.isBranch && b.parentBusinessId === parent.id);
}

export function findBranch(S, branchId) {
  migrateBusinesses(S);
  return (S.career.businesses || []).find(b => b && b.id === branchId && b.isBranch) || null;
}

/* Presence in a city: the player lives there, or already trades there
   (any business — parent or branch — in that city). A branch in a
   city with no presence is a new city for the business: it costs more
   to set up and starts with few repeat customers. */
export function hasPresenceInCity(S, cityId) {
  if (!cityId) return false;
  if (S.city === cityId) return true;
  return (S.career?.businesses || []).some(b => b && b.city === cityId);
}

/* v2.20 I4 — ONE branch per city, per player. Any branch in a city
   blocks every type there: a kiosk in Alexandria already IS the
   business's presence in Alexandria, so no second shop, kiosk,
   warehouse or franchise outlet is offered there — for this parent
   or any other. The old (city, type) rule offered a shop where a
   kiosk already stood. */
export function hasBranchInCity(S, cityId) {
  if (!cityId) return false;
  return (S.career?.businesses || []).some(b => b && b.isBranch && b.city === cityId);
}

export function branchSetupCost(S, biz, cityId) {
  return branchTypeSetupCost(S, biz, cityId, 'shop');
}

/* v2.17 W2 — the setup cost for one branch TYPE in one city. A
   franchise outlet is funded by the franchisee, not by you: its
   setupCost is what the franchisee pays, and the cash YOU need is
   only the first month's rent (totalNeeded reflects that). */
export function branchTypeSetupCost(S, biz, cityId, branchTypeRaw = 'shop') {
  const type = BRANCH_TYPES[branchTypeRaw] || BRANCH_TYPES.shop;
  const parent = resolveBusiness(S, biz);
  if (!parent) return null;
  const base = Math.round((parent.capitalInvested || 0) * type.setupShare);
  const isNewCity = !hasPresenceInCity(S, cityId);
  const setupCost = isNewCity ? Math.round(base * BRANCH_NEW_CITY_SETUP_MULT) : base;
  const fundedByFranchisee = type.id === 'franchise_outlet';
  return {
    type: type.id,
    typeLabel: type.label,
    base,
    setupCost,
    isNewCity,
    fundedByFranchisee,
    reason: fundedByFranchisee
      ? `A franchisee funds the ${formatMoney(setupCost, S.country)} fit-out and pays you an upfront fee plus 5% of the outlet's revenue every month — you pay no setup cost${isNewCity ? ` (a new city where you have no presence, so the outlet starts with few repeat customers — 30% come back)` : ''}.`
      : isNewCity
        ? `No presence in ${cityId} — setting up there costs ${BRANCH_NEW_CITY_SETUP_MULT}x the base setup (${formatMoney(base, S.country)} → ${formatMoney(setupCost, S.country)}) and the branch starts with almost no repeat customers there (30% come back).`
        : `You already trade in ${cityId} — base setup ${formatMoney(setupCost, S.country)}, and the branch starts with repeat customers close to the parent's rate.`
  };
}

/* Move one staff member from the parent to a branch. The member is
   REMOVED from the parent's staff list — they work at the branch now,
   not in two places at once. */
export function moveStaffToBranch(S, branchRef, staffId) {
  ensureExtendedState(S);
  migrateBusinesses(S);
  const branch = typeof branchRef === 'object' ? branchRef : findBranch(S, branchRef);
  if (!branch) return { ok: false, msg: 'No such branch.' };
  const parent = (S.career.businesses || []).find(b => b && b.id === branch.parentBusinessId);
  if (!parent) return { ok: false, msg: 'The parent business is gone.' };
  const idx = (parent.staff || []).findIndex(e => e.id === staffId);
  if (idx < 0) return { ok: false, msg: 'That person does not work at the parent business.' };
  const [emp] = parent.staff.splice(idx, 1);
  parent.employees = parent.staff.length;
  branch.staff = branch.staff || [];
  branch.staff.push(emp);
  branch.employees = branch.staff.length;
  recordJournal(S, `${emp.name} (${emp.role}) moved from ${parent.name} to the ${branch.city} branch — they work there now, not at the parent shop.`, 'career');
  return { ok: true, msg: `${emp.name} now works at the ${branch.city} branch.`, employee: emp, branch };
}

/* ------------------------------------------------------------------ *
   Opening a branch.
   ------------------------------------------------------------------ */

/* v2.17 W2 — open a branch of one TYPE. openBranch() below is the
   shop-only entry point kept for old callers; it delegates here with
   branchType 'shop' and behaves exactly as before. */
export function openBranchOfType(S, bizRef, cityId, branchTypeRaw = 'shop', opts = {}) {
  ensureExtendedState(S);
  migrateBusinesses(S);
  const type = BRANCH_TYPES[branchTypeRaw] || null;
  if (!type) {
    return { ok: false, msg: `No such branch type — choose one of: ${Object.values(BRANCH_TYPES).map(t => t.label).join(', ')}.` };
  }
  const parent = resolveBusiness(S, bizRef);
  if (!parent) return { ok: false, msg: 'No business to branch from.' };
  if (parent.isBranch) {
    return { ok: false, msg: 'A branch cannot have its own branch — open a new branch from the parent business, not from a branch.' };
  }
  const countryId = parent.country || S.country;
  const knownCities = getCountry(countryId).cities || [];
  if (!cityId || !knownCities.includes(cityId)) {
    return { ok: false, msg: `Branches open in a city in ${getCountry(countryId).name || countryId} — choose one of: ${knownCities.join(', ')}.` };
  }
  /* v2.20 I4 — one branch per city, per player: any branch in the
     city blocks every type there (see hasBranchInCity). */
  if (hasBranchInCity(S, cityId)) {
    return { ok: false, msg: `You already have a branch in ${cityId} — one branch per city. Pick a city with no branch yet.` };
  }
  const costing = branchTypeSetupCost(S, parent, cityId, type.id);
  /* v2.20 I4 — units are resolved in the BRANCH's city, so the first
     month's rent is a rent for that city and rentBusinessPremises
     (which checks unit city vs branch city) accepts it. */
  const unit = (listCommercialPremises(S, cityId, countryId, S.country) || []).find(u => u.unitId === type.premisesUnitId)
    || (listCommercialPremises(S, cityId, countryId, S.country) || []).find(u => u.unitId === 'comm_shop')
    || (listCommercialPremises(S, cityId, countryId, S.country) || [])[0];
  const firstRent = unit ? Number(unit.monthlyRentLocal) || 0 : 0;
  /* A franchise outlet is funded by the franchisee: you pay only the
     first month's rent. Every other type is paid from your cash. */
  const totalNeeded = costing.fundedByFranchisee ? firstRent : costing.setupCost + firstRent;
  if ((Number(S.money?.cash) || 0) < totalNeeded) {
    return { ok: false, msg: costing.fundedByFranchisee
      ? `Opening a franchise outlet in ${cityId} costs ${formatMoney(firstRent, S.country)} — the first month's rent while it opens (the franchisee funds the ${formatMoney(costing.setupCost, S.country)} fit-out). You have ${formatMoney(S.money?.cash || 0, S.country)}. ${costing.reason}`
      : `Opening a ${type.label.toLowerCase()} in ${cityId} costs ${formatMoney(costing.setupCost, S.country)} to set up plus the first month's rent (${formatMoney(firstRent, S.country)}) — ${formatMoney(totalNeeded, S.country)} in total. You have ${formatMoney(S.money?.cash || 0, S.country)}. ${costing.reason}` };
  }
  const isNewCity = costing.isNewCity;
  const revShare = isNewCity ? type.revShareNew : type.revShareHome;
  const costShare = isNewCity ? type.costShareNew : type.costShareHome;
  const repeatRate = isNewCity
    ? BRANCH_NEW_CITY_REPEAT_RATE
    : Math.max(BRANCH_HOME_REPEAT_FLOOR, (Number(parent.repeatRate ?? 0.5)) - BRANCH_HOME_REPEAT_DROP);
  const outletMonthlyRev = Math.round((parent.monthlyRev || 0) * revShare);

  /* Franchise outlet: the franchisee pays the fit-out AND an upfront
     fee (3x the outlet's monthly revenue, held in the parent's
     retained cash — never personal cash), and 5% of the outlet's
     monthly revenue every month through the existing franchiseIncome
     line. The outlet's own P&L still settles like any branch. */
  let franchisee = null;
  let franchiseFee = 0;
  let monthlyRoyalty = 0;
  if (costing.fundedByFranchisee) {
    if (!Array.isArray(parent.franchisees)) parent.franchisees = [];
    if (parent.franchisees.filter(f => f.status !== 'revoked').length >= 3) {
      return { ok: false, msg: `${parent.name} already has 3 franchisees — the most the brand can support right now.` };
    }
    franchiseFee = Math.max(10000, Math.round(outletMonthlyRev * 3));
    monthlyRoyalty = Math.max(100, Math.round(outletMonthlyRev * 0.05));
    const gender = rand(S) < 0.5 ? 'f' : 'm';
    franchisee = {
      id: nextId(S, 'fran'),
      name: `${pickFirstName(countryId, gender, () => rand(S))} ${pickFamilyName(countryId, () => rand(S))}`,
      status: 'good', fee: franchiseFee, monthlyRoyalty,
      sinceYear: S.year, sinceMonth: S.month
    };
  } else {
    walletMove(S, -costing.setupCost, `Opened ${type.label.toLowerCase()} of ${parent.name} in ${cityId}`, 'business');
  }
  /* The branch record: same shape as any business (normalizeBusiness),
     flagged as a branch of this parent, with its TYPE stored.
     monthlyCost is OTHER costs only — the branch's share of the
     parent's other costs, written once more after seeding (seeding
     floors it at 25% of the branch's takings but never subtracts the
     wage bill: wages are charged from staff by the P&L). */
  const branch = normalizeBusiness(S, {
    id: nextId(S, 'biz'),
    typeId: parent.typeId,
    name: `${parent.name} — ${type.label} ${cityId}`,
    country: countryId,
    city: cityId,
    level: 1,
    maxLevel: Infinity, /* placeholder — normalizeBusiness replaces it with businessLevelCap(biz) (home = 2, rented/owned = no cap) */
    volatility: parent.volatility ?? 0.25,
    monthlyRev: outletMonthlyRev,
    monthlyCost: Math.round((parent.monthlyCost || 0) * costShare),
    capitalInvested: costing.setupCost,
    totalCapitalIn: costing.setupCost,
    repeatRate,
    mode: opts.mode === 'full_time' ? 'full_time' : 'part_time',
    staff: [],
    premises: { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 },
    loanId: null,
    misses: 0,
    debtLocal: 0,
    monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: [],
    heirId: null,
    remote: false,
    foundedYear: S.year,
    foundedMonth: S.month,
    pricingMode: 'balanced',
    lastPL: null,
    isBranch: true,
    branchType: type.id,
    parentBusinessId: parent.id,
    manager: null,
    acquiredVia: 'branch',
    acquiredYear: S.year,
    acquiredMonth: S.month
  });
  seedStartingStaff(S, branch, type.staff);
  branch.monthlyCost = Math.round((parent.monthlyCost || 0) * costShare);
  branch.employees = (branch.staff || []).length;
  S.career.businesses.push(branch);
  syncBusinessMirror(S);
  /* The franchisee joins the parent's franchise list only once the
     outlet exists — the fee lands in retained cash, not personal cash. */
  if (franchisee) {
    parent.franchisees.push(franchisee);
    franchisee.branchId = branch.id;
    parent.retainedCash = Math.round((parent.retainedCash || 0) + franchiseFee);
    recordLedgerEntry(S, 0, `Franchise fee — ${franchisee.name} paid ${formatMoney(franchiseFee, S.country)} to ${parent.name} for the ${cityId} outlet, held in retained cash (not personal cash)`, 'business', 'business');
  }
  /* Premises through the premises system: the type's unit, first
     month's rent charged now, lease 12 months — the same rent the
     P&L will charge every month after. */
  if (unit) {
    const rented = rentBusinessPremises(S, branch, unit.unitId);
    if (!rented.ok) {
      /* Rent failed after setup was paid (should not happen — the
         cash was checked up front). Say so plainly; the branch
         stays run-from-home rather than vanishing. */
      recordJournal(S, `The ${cityId} ${type.label.toLowerCase()} of ${parent.name} could not take a ${unit.label.toLowerCase()} (${rented.msg}) — it runs from home for now, at lower revenue.`, 'business');
    }
  }
  /* Staff moved from the parent, if asked: removed from the parent's
     list, added to the branch's. */
  const moved = [];
  for (const staffId of (opts.moveStaffIds || [])) {
    const r = moveStaffToBranch(S, branch, staffId);
    if (r.ok) moved.push(r.employee.name);
  }
  const hoursNote = branch.mode === 'full_time'
    ? 'You run the branch yourself full-time, about 40 hours a week.'
    : 'You run the branch yourself part-time, 18 hours a week — or hire a manager for it (§2) and it runs without your hours.';
  const typeNote = type.id === 'warehouse'
    ? ' It earns little itself — its real value is the supply chain: it cuts what every branch pays for stock by another 5%.'
    : type.id === 'kiosk'
      ? ' Cheap and small — one person, a market-stall pitch, a quarter of a shop\'s trade.'
      : franchisee
        ? ` ${franchisee.name} funds it and pays ${formatMoney(monthlyRoyalty, S.country)} a month in royalties (5% of the outlet's revenue, a real P&L line).`
        : '';
  recordJournal(S, `Opened a ${type.label.toLowerCase()} of ${parent.name} in ${cityId} for ${formatMoney(costing.setupCost, S.country)}${costing.fundedByFranchisee ? ' — paid by the franchisee, not by you' : ''}${isNewCity ? ' — a new city where you have no presence, so it costs more and starts with few repeat customers (30% come back)' : ` — repeat customers start at ${Math.round(repeatRate * 100)}%`}. It has its own premises (${branch.premises?.label || 'run from home'}), ${branch.staff.length} employee${branch.staff.length === 1 ? '' : 's'}${moved.length ? ` (including ${moved.join(', ')} moved from the parent)` : ''} and its own monthly P&L.${typeNote} ${hoursNote}`, 'milestone');
  return {
    ok: true,
    msg: `${type.label} of ${parent.name} open in ${cityId} — ${costing.fundedByFranchisee ? `franchisee-funded (fee ${formatMoney(franchiseFee, S.country)}, royalty ${formatMoney(monthlyRoyalty, S.country)}/month)` : `${formatMoney(costing.setupCost, S.country)} setup`}${isNewCity ? ' (new city: 1.5x setup, repeat customers 30%)' : `, repeat customers ${Math.round(repeatRate * 100)}%`}. It settles its own P&L every month.`,
    branch,
    branchType: type.id,
    setupCost: costing.setupCost,
    baseSetupCost: costing.base,
    isNewCity,
    repeatRate,
    firstMonthRent: firstRent,
    movedStaff: moved,
    hoursNote,
    fundedByFranchisee: costing.fundedByFranchisee,
    franchisee,
    franchiseFee,
    monthlyRoyalty
  };
}

export function openBranch(S, bizRef, cityId, opts = {}) {
  return openBranchOfType(S, bizRef, cityId, (opts && opts.branchType) || 'shop', opts);
}

/* ------------------------------------------------------------------ *
   Selling / closing a branch — separately from the parent, same rules.
   ------------------------------------------------------------------ */

export function sellBranch(S, branchId) {
  ensureExtendedState(S);
  migrateBusinesses(S);
  const branch = findBranch(S, branchId);
  if (!branch) return { ok: false, msg: 'No such branch.' };
  const parent = (S.career.businesses || []).find(b => b && b.id === branch.parentBusinessId);
  const valuation = businessValuation(branch);
  const result = sellBusiness(S, branch.id);
  return { ...result, valuation, branchName: branch.name };
}

export function closeBranch(S, branchId, reason = 'closed') {
  ensureExtendedState(S);
  migrateBusinesses(S);
  const branch = findBranch(S, branchId);
  if (!branch) return { ok: false, msg: 'No such branch.', salvage: 0 };
  /* closeBusiness: salvage 0.5x capital, staff fired with severance
     under the country's law, salvage paid into the ledger. The parent
     business is untouched. */
  const res = closeBusiness(S, branch, reason);
  return { ...res, branchName: branch.name, city: branch.city };
}

/* A branch's P&L, through the normal monthly computation — the same
   function the settlement calls for every business. Kept as a named
   helper so the branch's own line is easy to read and test. */
export function computeBranchMonth(S, branchId) {
  const branch = findBranch(S, branchId);
  if (!branch) return null;
  return computeBusinessMonth(S, branch);
}

/* ------------------------------------------------------------------ *
   Render — the branch list for a business card.
   ------------------------------------------------------------------ */

export function renderBranchesHtml(S, biz) {
  const parent = resolveBusiness(S, biz);
  if (!parent) return '';
  const branches = listBranches(S, parent);
  const knownCities = (getCountry(parent.country || S.country).cities || []).filter(c => c !== parent.city);
  const rows = branches.length === 0
    ? `<div class="muted">No branches yet — this business trades from one place (${escHtml(parent.city)}). Open a branch in another city below; a branch in a city where you have no presence costs 1.5x to set up and starts with few repeat customers (30% come back).</div>`
    : branches.map(b => {
      const pl = b.lastPL;
      const plText = pl
        ? `Last month: revenue ${formatMoney(pl.revenue, S.country)} − costs ${formatMoney(pl.costs, S.country)} − tax ${formatMoney(pl.tax, S.country)} = net ${formatMoney(pl.net, S.country)}`
        : 'No month settled yet — its first P&L lands at the next monthly settlement.';
      /* v2.20 merge — the branch row reads the ALLOCATED hours, not
         the intent (same rule as the card's manager line): a branch
         the owner means to run but has no hours left for says so in
         plain words, instead of claiming the owner runs it. */
      const branchAllocated = ownerHoursForBusiness(S, b);
      const branchNeed = hoursNeededForMode(b.mode);
      const managerText = b.manager
        ? `Manager: ${escHtml(b.manager.name || 'named manager')} (skill ${b.manager.skill ?? '?'}, loyalty ${b.manager.loyalty ?? '?'})`
        : b.ownerManaged === false
          ? 'No manager — nobody is running it. Hire a manager for it, or run it yourself.'
          : branchAllocated >= branchNeed
            ? `No manager — you run it yourself (${branchAllocated} hrs/week).`
            : `No manager — you mean to run it yourself, but your week is full — no hours left for it (it needs ${branchNeed} hrs/week). Hire a manager for it.`;
      return `
      <div class="item-row" style="border-bottom:1px solid var(--hatch-widget-border, #ddd);padding:6px 0;">
        <div class="item-row-main">
          <strong>${escHtml(b.name)}</strong> · ${escHtml(branchTypeLabel(b.branchType))} · ${escHtml(b.city)}
          <span class="muted"> — ${(b.staff || []).length} employee${(b.staff || []).length === 1 ? '' : 's'} · repeat customers ${Math.round((Number(b.repeatRate ?? 0.5)) * 100)}% · premises: ${escHtml(b.premises?.label || 'run from home')}${b.premises?.monthlyRentLocal ? ` (${formatMoney(b.premises.monthlyRentLocal, S.country)}/mo)` : ''}</span>
          <div class="muted" style="font-size:12px;">${plText}</div>
          <div class="muted" style="font-size:12px;">${managerText}</div>
          ${b.international?`<details data-panel="subsidiary_${escHtml(b.id)}"><summary>Manage subsidiary team &amp; products</summary>${renderStaffListHtml(S,b)}${renderPricingSectionHtml(S,b)}</details>`:''}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${!b.manager ? `<button class="btn btn-sm" data-action="biz-branch-hire-manager" data-biz="${escHtml(b.id)}">Hire a manager</button>` : ''}
          <button class="btn btn-sm" data-action="biz-branch-sell" data-biz="${escHtml(b.id)}">Sell (valuation ${formatMoney(businessValuation(b), S.country)})</button>
          <button class="btn btn-sm" data-action="biz-branch-close" data-biz="${escHtml(b.id)}">Close (salvage ${formatMoney(Math.round((b.capitalInvested || 0) * 0.5), S.country)})</button>
        </div>
      </div>`;
    }).join('');
  /* v2.20 I4 — one button per branch TYPE per city, and ONE branch
     per city per player: any branch in a city (this parent's or any
     other business's) blocks every type there, so a city with a kiosk
     is never offered a second shop. A blocked city gets one muted
     line saying why, not four dead buttons. The button carries
     data-branch-type — the biz-branch-open handler must pass it
     through to openBranchOfType (wiring point for the coordinator).
     A franchise outlet costs you only the first month's rent — the
     franchisee funds the fit-out. */
  const openBtns = knownCities.map(c => {
    if (hasBranchInCity(S, c)) {
      return `<div class="muted" style="font-size:12px;margin-top:4px;">${escHtml(c)} — you already have a branch there (one branch per city).</div>`;
    }
    const typeBtns = Object.values(BRANCH_TYPES).map(t => {
      const costing = branchTypeSetupCost(S, parent, c, t.id);
      const price = costing.fundedByFranchisee
        ? `franchisee pays setup, you pay rent ${formatMoney((listCommercialPremises(S) || []).find(u => u.unitId === t.premisesUnitId)?.monthlyRentLocal || 0, S.country)}`
        : formatMoney(costing.setupCost, S.country);
      return `<button class="btn btn-sm" data-action="biz-branch-open" data-biz="${escHtml(parent.id)}" data-city="${escHtml(c)}" data-branch-type="${escHtml(t.id)}" title="${escHtml(costing.reason)} ${escHtml(t.desc)}">${escHtml(t.label)} in ${escHtml(c)} (${escHtml(price)})</button>`;
    }).join(' ');
    return `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">${typeBtns}</div>`;
  }).join('');
  return `
  <div class="biz-branches-section" style="margin-top:10px;">
    <h4>Branches — ${escHtml(parent.name)} (${branches.length})</h4>
    ${rows}
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">${openBtns}</div>
    <div class="muted" style="font-size:12px;margin-top:4px;">Each branch is a real second location: its own premises and rent, its own staff, its own repeat customers and its own monthly P&amp;L. A kiosk is cheap and small; a warehouse earns little itself but cuts what every branch pays for stock by 5%; a franchise outlet is funded by its franchisee, who pays you 5% of its revenue every month. Sell or close a branch on its own — the parent keeps trading.</div>
  </div>`;
}
