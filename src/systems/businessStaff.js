import{businessProfile}from './businessProfiles.js';
import{benefitsCost}from './businessBenefits.js';
import{employeePerson,tickEmployeeChoice}from './businessPeople.js';
/* ============================================================================
   World Life 2.0 — Business Staff (v2.11 W2, Overnight Round 3)
   Employees are people: names, role-based wages, morale, skill, culture fit.
   ----------------------------------------------------------------------------
   CONTRACT (coordinator's business shape):
   biz.staff = [{ id, name, role, wageLocal, morale, skill, hiredYear,
                  hiredMonth, fit }]
   - Wages are role-based: ROLE_WAGE_FACTOR x the country's monthly MID
     salary (eraSalary(annualSalaryTiers2026.mid / 12, country, year)).
     Factors are calibrated against Verdant's deep-play salary ladder
     (USA mid salary in-game is $82,000/yr = $6,833/mo):
       unskilled 0.50 -> ~$41k/yr  (Verdant Junior Dev ~$40k)
       developer 0.85 -> ~$69.7k/yr (Verdant Senior Dev ~$73k)
       manager   1.00 -> ~$82k/yr  (Verdant Head of Sales ~$78k)
       executive 1.40 -> ~$115k/yr (Verdant CTO ~$110k, CFO ~$125k)
     The brief's example factors (0.7/1.0/1.15/1.25/1.8) would overshoot
     Verdant by ~40% on an $82k mid, so the map below is scaled to the
     ladder instead and the calibration is stated here, not hidden.
   - Morale affects revenue through teamMoraleFactor(biz), a piecewise
     linear curve through (20, 0.70) (40, 0.85) (70, 1.00) (90, 1.10),
     clamped to [0.65, 1.15]. No staff -> 1.00 (owner-run).
     Worker 1's computeBusinessMonth MUST multiply revenue by this.
   - Hiring costs one month's wage to onboard (personal cash, own ledger
     line). Firing costs severance under the country's law via
     noticeAndSeveranceFor (economy.js, the same table v2.8 dismissal
     uses), floored at 1 month's wage, charged to PERSONAL cash as its
     own ledger line "Severance — {name}" (Verdant finding: severance
     comes out of personal cash, $3.6k for a Junior Dev). Firing drops
     the remaining team's morale -8. Unpaid wages (a miss month) drop
     morale -10 (applyUnpaidWagesMorale, called by W1's P&L).
     The staff-bonus run op raises morale +10 (applyStaffBonus, called
     by W1's op handler). A low-morale employee (morale < 25) can quit
     on their own (monthlyStaffTick, called monthly by W1's settlement
     hook; scene + journal line, the player is told).
   - Payroll itself is NOT posted here: wages are part of the business's
     monthly costs in Worker 1's P&L (totalStaffWages(biz) is the number
     W1 reads, broken out in the costs ledger label). Posting them here
     too would double-count.
   - This file works with BOTH shapes: the coordinator's businesses[]
   (staff array) and the pre-W1 single S.career.business (legacy
   `employees` headcount, migrated into staff records on first access).
   ========================================================================== */

import { rand, randInt, clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove, queueScene } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraSalary, noticeAndSeveranceFor, convertCurrency } from '../data/economy.js';
import { pickFirstName, pickFamilyName } from '../data/names.js';
import { BUSINESS_TYPES } from '../data/institutions.js';
import { EXTRA_BUSINESSES, V1_BUSINESS_TYPES } from '../data/megaCareerEduMedical.js';
/* v2.17 W3 §4: role effects live in businessRoles.js; this file stamps
   them (hire/fire/train/quit/seed) and shows the hire blurbs. The
   import is a cycle (businessRoles imports staff helpers from here),
   but both sides only use the imports inside functions, never at
   module-evaluation time, so the cycle is safe. */
import { stampMonthEffects, roleHireBlurb, MONEY_HANDLING_ROLES } from './businessRoles.js';

/* ------------------------------------------------------------------ */
/* Role wage factors (x monthly mid salary). See header for calibration. */
/* ------------------------------------------------------------------ */
export const ROLE_WAGE_FACTOR = {
  /* 0.50 — unskilled / junior */
  security:0.65,cleaner: 0.5, packager: 0.5, dishwasher: 0.5, waiter: 0.5, cashier: 0.5,
  driver: 0.5, worker: 0.5, nanny: 0.5, weaver: 0.5,
  /* 0.65 — junior skilled / front of house */
  barista: 0.65, receptionist: 0.65, assistant: 0.65, sales: 0.65, agent: 0.65,
  marketing: 0.65, typesetter: 0.65,
  /* 0.85 — skilled */
  developer: 0.85, designer: 0.85, nurse: 0.85, teacher: 0.85, trainer: 0.85,
  technician: 0.85, accountant: 0.85, consultant: 0.85, paralegal: 0.85,
  dispatcher: 0.85, stylist: 0.85, pharmacist: 0.85, physio: 0.85,
  bookkeeper: 0.85, baker: 0.85, photographer: 0.85,
  /* 1.00 — senior / professional / manager */
  chef: 1.0, doctor: 1.0, dentist: 1.0, lawyer: 1.0, architect: 1.0, vet: 1.0,
  manager: 1.0,
  /* 1.40 — executive (not in the standard staffRoles, covered if present) */
  director: 1.4, cto: 1.4, cfo: 1.4, executive: 1.4, head: 1.4
};
const DEFAULT_ROLE_FACTOR = 0.7;

export function roleWageFactor(role) {
  return ROLE_WAGE_FACTOR[String(role || '').toLowerCase()] ?? DEFAULT_ROLE_FACTOR;
}

/* Default role lists per industry, for BUSINESS_TYPES / EXTRA rows that
   carry no staffRoles (the V1 rows all have their own). */
export const DEFAULT_ROLES_BY_INDUSTRY = {
  food: ['chef', 'waiter', 'cashier', 'manager', 'cleaner', 'driver'],
  retail: ['cashier', 'sales', 'manager', 'bookkeeper', 'cleaner'],
  tech: ['developer', 'designer', 'marketing', 'manager', 'bookkeeper'],
  services: ['assistant', 'receptionist', 'marketing', 'manager', 'bookkeeper'],
  health: ['nurse', 'receptionist', 'manager', 'bookkeeper', 'cleaner']
};

/* v2.17 W3 §4 — role completions for V1 types whose own staffRoles are
   thin (1–3 roles). A business type must hire a real team, not one or
   two jobs: every type ends up with at least 4 real roles. The V1
   table itself is untouched; this overlay is merged in
   staffRolesForType below (deduplicated, V1 order kept first). */
export const STAFF_ROLE_COMPLETIONS = {
  ecommerce: ['marketing', 'bookkeeper', 'driver'],
  realestate: ['marketing', 'bookkeeper', 'photographer'],
  consulting: ['marketing', 'bookkeeper', 'receptionist'],
  bookstore: ['sales', 'cleaner'],
  car_wash: ['cashier', 'driver'],
  fruit_stall: ['sales', 'driver', 'manager'],
  radio_repair: ['cashier', 'receptionist'],
  video_rental: ['sales', 'cleaner'],
  tutoring_center: ['receptionist', 'cleaner'],
  retail_shop: ['sales', 'bookkeeper'],
  salon: ['receptionist', 'cashier'],
  gym: ['receptionist', 'marketing'],
  pharmacy: ['cleaner', 'bookkeeper'],
  bakery: ['driver'],
  cafe: ['cashier'],
  restaurant: ['driver'],
  logistics: ['packager', 'bookkeeper'],
  software_startup: ['marketing', 'bookkeeper'],
  accounting_firm: ['bookkeeper'],
  travel_agency: ['marketing', 'bookkeeper', 'receptionist'],
  photo_studio: ['receptionist', 'marketing'],
  cyber_cafe: ['cleaner'],
  mobile_shop: ['sales'],
  textile_workshop: ['sales'],
  print_shop: ['sales'],
  pet_grooming: ['receptionist', 'cashier'],
  academy: ['receptionist', 'marketing'],
  physio_clinic: ['cleaner']
};

const TYPE_INDUSTRY_OVERRIDES = {
  cafe: 'food', restaurant: 'food', bakery: 'food', roastery_chain: 'food',
  retail: 'retail', retail_shop: 'retail',
  software_studio: 'tech', software_startup: 'tech', saas_ai_agency: 'tech',
  clinic: 'health', dental_clinic: 'health', dental_center: 'health',
  pharmacy: 'health', community_pharmacy: 'health', vet_clinic: 'health',
  physio_clinic: 'health', diagnostic_lab: 'health',
  contracting: 'services', consulting: 'services', law_firm: 'services',
  law_chambers: 'services', accounting_firm: 'services',
  travel_agency: 'services', wedding_planner: 'services',
  realestate: 'services', prop_brokerage: 'services', logistics: 'services'
};

function industryForType(typeId, label = '') {
  if (TYPE_INDUSTRY_OVERRIDES[typeId]) return TYPE_INDUSTRY_OVERRIDES[typeId];
  const hay = `${typeId} ${label}`.toLowerCase();
  if (/(cafe|restaurant|bakery|food|roastery|coffee)/.test(hay)) return 'food';
  if (/(software|saas|ai|tech|cyber|digital|studio)/.test(hay)) return 'tech';
  if (/(clinic|pharmacy|dental|vet|physio|medical|diagnostic|health)/.test(hay)) return 'health';
  if (/(retail|shop|store|bookstore|ecommerce|market)/.test(hay)) return 'retail';
  return 'services';
}

/* Look a venture type up across all three business tables. */
export function getBusinessTypeRow(typeId) {
  if (!typeId) return null;
  return (BUSINESS_TYPES || []).find(b => b.id === typeId)
    || (EXTRA_BUSINESSES || []).find(b => b.id === typeId)
    || (V1_BUSINESS_TYPES || []).find(b => b.id === typeId)
    || null;
}

/* Roles a business of this type can hire: the V1 staffRoles where they
   exist, otherwise the sensible default list for the industry — plus
   the v2.17 completions, so no type hires only one or two roles. */
export function staffRolesForType(typeId) {
  const profile=businessProfile(typeId);
  let roles = null;
  const row = getBusinessTypeRow(typeId);
  if (row && Array.isArray(row.staffRoles) && row.staffRoles.length > 0) {
    roles = [...row.staffRoles];
  } else {
    /* The V1 table carries the richest role lists (e.g. the café's barista);
       the merged BUSINESS_TYPES row shadows it in the launch list, so check
       the V1 row too before falling back to the industry default. */
    const v1 = (V1_BUSINESS_TYPES || []).find(b => b.id === typeId);
    if (v1 && Array.isArray(v1.staffRoles) && v1.staffRoles.length > 0) {
      roles = [...v1.staffRoles];
    } else {
      roles = [...(DEFAULT_ROLES_BY_INDUSTRY[industryForType(typeId, row?.label || '')] || DEFAULT_ROLES_BY_INDUSTRY.services)];
    }
  }
  if(profile)roles=[...profile.roles];
  for(const support of ['manager','cleaner','security'])if(!roles.includes(support))roles.push(support);
  for (const extra of (STAFF_ROLE_COMPLETIONS[typeId] || [])) {
    if (!roles.includes(extra)) roles.push(extra);
  }
  return roles;
}

/* ------------------------------------------------------------------ */
/* Business list access — works pre- and post-W1.                      */
/* ------------------------------------------------------------------ */
export function getBusinesses(S) {
  if (Array.isArray(S?.career?.businesses) && S.career.businesses.length > 0) {
    return S.career.businesses;
  }
  if (S?.career?.business) return [S.career.business];
  return [];
}

export function findBusiness(S, bizId) {
  if (!bizId) return getBusinesses(S)[0] || null;
  return getBusinesses(S).find(b => b.id === bizId) || null;
}

/* The country's monthly MID salary in local currency, era-adjusted.
   This is the wage base — no invented wage scale. */
export function monthlyMidSalary(S, countryId) {
  const c = getCountry(countryId || S.country);
  return eraSalary((c.annualSalaryTiers2026.mid || 60000) / 12, countryId || S.country, S.year);
}

export function roleWageLocal(S, role, countryId) {
  const base = monthlyMidSalary(S, countryId);
  return Math.max(1, Math.round(base * roleWageFactor(role)));
}

/* ------------------------------------------------------------------ */
/* Staff array — migrate the legacy `employees` headcount once.        */
/* ------------------------------------------------------------------ */
export function ensureStaffArray(S, biz) {
  if (!biz) return [];
  if(Array.isArray(biz.staff)){for(const emp of biz.staff)employeePerson(S,biz,emp);return biz.staff;}
  const count = Math.max(0, Math.round(Number(biz.employees) || 0));
  const roles = staffRolesForType(biz.typeId);
  const staff = [];
  for (let i = 0; i < count; i++) {
    staff.push(makeEmployee(S, biz, roles[i % roles.length]));
  }
  biz.staff = staff;
  biz.employees = staff.length; // keep the legacy headcount in sync
  return staff;
}

function makeEmployee(S, biz, role) {
  const countryId = biz.country || S.country;
  const gender = rand(S) < 0.5 ? 'm' : 'f';
  const first = pickFirstName(countryId, gender, () => rand(S));
  const last = pickFamilyName(countryId, () => rand(S));
  const fitRoll = rand(S);
  const fit = fitRoll < 0.5 ? 'good' : fitRoll < 0.85 ? 'average' : 'poor';
  const morale = clamp(Math.round(55 + rand(S) * 25 + (fit === 'good' ? 10 : fit === 'poor' ? -10 : 0)), 5, 95);
  const skill = randInt(S, 40, 80);
  /* v2.17 W3 §4 — a money-handler can be dishonest, derived from the
     draws already made (no extra rand call, so the global RNG stream
     is unchanged): a poor-fit hire with low skill (skill <= 50) may
     be dishonest — about 4% of money-handlers. A dishonest cashier /
     bookkeeper / accountant steals (businessRoles.js); the player
     sees the till never adding up and can fire them. */
  const dishonest = MONEY_HANDLING_ROLES.includes(String(role || '').toLowerCase())
    && fit === 'poor' && skill <= 50;
  return {
    id: nextId(S, 'emp'),
    name: `${first} ${last}`,
    gender,role,
    wageLocal: roleWageLocal(S, role, countryId),
    morale,
    skill,
    hiredYear: biz.foundedYear ?? S.year,
    hiredMonth: biz.foundedMonth ?? S.month,
    fit,
    dishonest
  };
}

/* v2.20 I3 — the other-costs floor. monthlyCost is OTHER costs only
   (supplies, utilities, marketing — the businessEngine contract);
   wages come from biz.staff and are NEVER subtracted from it. The old
   launch rule subtracted the starter wage bill from the venture row's
   cost lump and floored at 100 — but the lump never contained the
   wage bill, so a fruit stall (cost 7,600, wages 13,613) collapsed to
   100 and every formula reading monthlyCost read a joke number (other
   costs 12, delivery +4, catering +8). Other costs are floored at 25%
   of monthly takings instead: a real number at the business's scale.
   Measured Egypt 2022: 10 of 52 era-open ventures collapse under the
   old rule (fruit_stall, ecommerce, tutoring_center, realestate,
   consulting, bookstore, car_wash, pet_grooming, photo_studio,
   travel_agency); every row's own cost is already >= 25% of its
   takings, so the floor only binds on degenerate data. */
export const OTHER_COSTS_MIN_REV_SHARE = 0.25;

export function otherCostsFloor(monthlyRev) {
  return Math.max(0, Math.round((Number(monthlyRev) || 0) * OTHER_COSTS_MIN_REV_SHARE));
}

/* Split a legacy bundled cost lump into other costs and wages — used
   ONLY when migrating an old save whose lump genuinely bundled wages
   (v2.10 and earlier charged one lump for everything). The wage bill
   comes out of the lump only when the lump actually contains it; a
   lump smaller than the wage bill never contained it, so it is kept
   whole (floored at 25% of takings) instead of collapsing to 100. */
export function splitWagesFromCostLump(lump, wageBill, monthlyRev) {
  const floor = otherCostsFloor(monthlyRev);
  const l = Math.round(Number(lump) || 0);
  const w = Math.round(Number(wageBill) || 0);
  if (l >= w) return Math.max(floor, l - w);
  return Math.max(floor, l);
}

/* Seed the starting team for a FRESH launch (v2.11 merge). The old
   launch rule was "3 employees"; createBusiness left staff: [] and
   ensureStaffArray only seeds from a legacy `employees` number, which
   a fresh launch never set — so a fresh business had nobody: no wages,
   no morale, nothing to quit, and a P&L flattered by the missing wage
   bill. The startup capital covers the initial team (no onboarding
   charge). Roles come from the venture's own staff roles. */
export function seedStartingStaff(S, biz, count = 3) {
  if (!biz || !Array.isArray(biz.staff)) return [];
  if (biz.staff.length > 0) return biz.staff;
  const roles = staffRolesForType(biz.typeId);
  const seeded = [];
  for (let i = 0; i < count; i++) seeded.push(makeEmployee(S, biz, roles[i % roles.length]));
  biz.staff = seeded;
  biz.employees = seeded.length;
  /* v2.20 I3 — monthlyCost is OTHER costs only: the starter team's
     wages are charged from biz.staff by the P&L, never subtracted
     here. The old subtraction collapsed the lump to 100 whenever the
     wage bill exceeded it (10 of 52 ventures). Only the floor applies:
     other costs are never less than 25% of the takings. */
  if (typeof biz.monthlyCost === 'number') {
    biz.monthlyCost = Math.max(otherCostsFloor(biz.monthlyRev), Math.round(biz.monthlyCost));
  }
  stampMonthEffects(S, biz);
  return seeded;
}

export function totalStaffWages(biz) {
  if (!biz || !Array.isArray(biz.staff)) return 0;
  return biz.staff.reduce((sum,e)=>sum+(Number(e.wageLocal)||0),0)+benefitsCost(biz);
}

export function averageMorale(biz) {
  if (!biz || !Array.isArray(biz.staff) || biz.staff.length === 0) return null;
  return biz.staff.reduce((sum, e) => sum + (Number(e.morale) || 0), 0) / biz.staff.length;
}

export function averageSkill(biz) {
  if (!biz || !Array.isArray(biz.staff) || biz.staff.length === 0) return null;
  return biz.staff.reduce((sum, e) => sum + (Number(e.skill) || 0), 0) / biz.staff.length;
}

/* Revenue multiplier from the team's average morale. Piecewise linear
   through (20, 0.70) (40, 0.85) (70, 1.00) (90, 1.10), clamped
   [0.65, 1.15]. No staff -> 1.00 (owner-run). */
const MORALE_ANCHORS = [[20, 0.7], [40, 0.85], [70, 1.0], [90, 1.1]];
export function teamMoraleFactor(biz) {
  const avg = averageMorale(biz);
  if (avg === null) return 1.0;
  if (avg <= MORALE_ANCHORS[0][0]) return 0.7;
  if (avg >= MORALE_ANCHORS[MORALE_ANCHORS.length - 1][0]) return 1.1;
  for (let i = 0; i < MORALE_ANCHORS.length - 1; i++) {
    const [x0, y0] = MORALE_ANCHORS[i];
    const [x1, y1] = MORALE_ANCHORS[i + 1];
    if (avg >= x0 && avg <= x1) {
      return y0 + ((avg - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return 1.0;
}

/* ------------------------------------------------------------------ */
/* Hire / fire                                                         */
/* ------------------------------------------------------------------ */
export const MAX_STAFF_PER_BUSINESS = 12;

export function hireBusinessEmployee(S, biz, roleId) {
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const staff = ensureStaffArray(S, biz);
  const roles = staffRolesForType(biz.typeId);
  if (!roleId || !roles.includes(roleId)) {
    return { ok: false, msg: `This business hires: ${roles.join(', ')}.` };
  }
  if (staff.length >= MAX_STAFF_PER_BUSINESS) {
    return { ok: false, msg: `${biz.name} already has the maximum ${MAX_STAFF_PER_BUSINESS} employees.` };
  }
  const bookCountry=biz.figuresCurrency||biz.country||S.country;
  const wage = Math.round(convertCurrency(roleWageLocal(S,roleId,biz.country||S.country),biz.country||S.country,bookCountry,S.year));
  const charge=Math.round(convertCurrency(wage,bookCountry,S.country,S.year));
  if ((Number(S.money.cash) || 0) < charge) {
    return { ok: false, msg: `Onboarding costs one month's wage (${formatMoney(wage, bookCountry)}) — not enough cash.` };
  }
  const emp = makeEmployee(S, biz, roleId);
  emp.wageLocal=wage;emp.hiredYear=S.year;emp.hiredMonth=S.month;
  staff.push(emp);
  biz.employees = staff.length;
  walletMove(S, -charge, `Onboarding — ${emp.name} (${roleId})`, 'business');
  recordJournal(S, `Hired ${emp.name} as ${roleId} at ${biz.name} (${formatMoney(wage, bookCountry)}/month).`, 'career');
  stampMonthEffects(S, biz);
  return { ok: true, msg: `Hired ${emp.name} (${roleId}) for ${formatMoney(wage, bookCountry)}/month. ${roleHireBlurb(roleId)} — skill ${Math.round(emp.skill)}.`, employee: emp };
}

/* Years of service from the hire date, fractional. */
export function yearsOfService(S, emp) {
  const start = (emp.hiredYear ?? S.year) * 12 + (emp.hiredMonth ?? S.month);
  const now = S.year * 12 + S.month;
  return Math.max(0, (now - start) / 12);
}

/* Severance under the country's law (same table v2.8 dismissal uses),
   floored at 1 month's wage — the plain-rule minimum from the brief. */
export function severanceFor(S, biz, emp) {
  const countryId = biz.country || S.country;
  const { severanceMonths, source, note } = noticeAndSeveranceFor(countryId, yearsOfService(S, emp));
  const months = Math.max(1, severanceMonths);
  return { months, amount: Math.round((Number(emp.wageLocal) || 0) * months), source, note };
}

export function fireBusinessEmployee(S, biz, staffId) {
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const staff = ensureStaffArray(S, biz);
  const idx = staff.findIndex(e => e.id === staffId);
  if (idx < 0) return { ok: false, msg: 'That employee no longer works here.' };
  const emp = staff[idx];
  const sev = severanceFor(S, biz, emp);
  const charge=Math.round(convertCurrency(sev.amount,biz.figuresCurrency||biz.country||S.country,S.country,S.year));
  if ((Number(S.money.cash) || 0) < charge) {
    return { ok: false, msg: `Severance for ${emp.name} is ${formatMoney(charge,S.country)} (${sev.months} month${sev.months === 1 ? '' : 's'} under ${getCountry(biz.country || S.country).name || ''} law) — not enough cash to let them go properly.` };
  }
  staff.splice(idx,1);
  const p=employeePerson(S,biz,emp);p.career.employed=false;p.career.employer=null;
  biz.employees = staff.length;
  /* Verdant finding: severance comes out of PERSONAL cash as its own
     ledger line — never buried inside the business P&L. */
  walletMove(S, -charge, `Severance — ${emp.name}`, 'business');
  for (const other of staff) other.morale = clamp((Number(other.morale) || 0) - 8, 5, 100);
  recordJournal(S, `Let ${emp.name} (${emp.role}) go from ${biz.name}. Severance ${formatMoney(charge,S.country)} came out of your own pocket; the remaining team is shaken (morale −8).`, 'career');
  stampMonthEffects(S, biz);
  return { ok: true, msg: `Fired ${emp.name}. Severance ${formatMoney(charge,S.country)} paid from your cash.`, severance: charge, severanceMonths: sev.months };
}

/* Close-down helper (W4 / failure chain): every employee is let go with
   the same country-law severance. If cash runs out mid-way, the shortfall
   is journalled plainly as owed — the player is not silently let off. */
export function fireAllStaff(S, biz, reason = 'closed') {
  if (!biz) return { ok: false, msg: 'No business selected.', fired: 0, totalSeverance: 0, unpaid: 0 };
  const staff = ensureStaffArray(S, biz);
  const leaving = [...staff];
  let totalSeverance = 0;
  let unpaid = 0;
  for (const emp of leaving) {
    const p=employeePerson(S,biz,emp);p.career.employed=false;p.career.employer=null;
    const sev = severanceFor(S, biz, emp);
    sev.amount=Math.round(convertCurrency(sev.amount,biz.figuresCurrency||biz.country||S.country,S.country,S.year));
    const cash = Math.max(0,Number(S.money.cash) || 0);
    const paid = Math.min(cash, sev.amount);
    if (paid > 0) walletMove(S, -paid, `Severance — ${emp.name}`, 'business');
    if (paid < sev.amount) unpaid += sev.amount - paid;
    totalSeverance += sev.amount;
  }
  if(unpaid>0){
    S.money.loans.push({id:nextId(S,'loan'),label:`Unpaid employee severance: ${biz.name}`,balance:unpaid,monthlyPayment:Math.max(1,Math.ceil(unpaid/12)),annualRate:0,flatMarkup:true,remainingMonths:12,country:S.country,missedMonths:0,purpose:'employee_severance'});
  }
  biz.staff = [];
  biz.employees = 0;
  stampMonthEffects(S, biz);
  recordJournal(S, `${biz.name} ${reason} — ${leaving.length} employee${leaving.length === 1 ? '' : 's'} lost ${leaving.length === 1 ? 'their' : 'their'} job${leaving.length === 1 ? '' : 's'}. Severance paid ${formatMoney(totalSeverance - unpaid,S.country)}${unpaid > 0 ? `; ${formatMoney(unpaid,S.country)} of severance could not be paid and is still owed` : ''}.`, 'career');
  return { ok: true, fired: leaving.length, totalSeverance, unpaid };
}

/* ------------------------------------------------------------------ */
/* Morale hooks — called by Worker 1 (P&L / run ops), never here.      */
/* ------------------------------------------------------------------ */
/* Staff-bonus run op: the whole team feels it. */
export function applyStaffBonus(biz) {
  if (!biz || !Array.isArray(biz.staff)) return 0;
  for (const emp of biz.staff) emp.morale = clamp((Number(emp.morale) || 0) + 10, 0, 100);
  return biz.staff.length;
}

/* A month the business could not pay wages: morale falls across the team. */
export function applyUnpaidWagesMorale(biz) {
  if (!biz || !Array.isArray(biz.staff)) return 0;
  for (const emp of biz.staff) emp.morale = clamp((Number(emp.morale) || 0) - 10, 0, 100);
  return biz.staff.length;
}

/* Monthly tick (called by W1's settlement hook): a low-morale employee
   (morale < 25) may quit on their own — 25% chance per month. The player
   is told with a scene and a journal line. Returns the quitters. */
export function monthlyStaffTick(S, biz) {
  if (!biz) return [];
  const staff = ensureStaffArray(S, biz);
  const quitters = [];
  for (const emp of [...staff]) {
    if(tickEmployeeChoice(S,biz,emp)){
      const idx = staff.findIndex(e => e.id === emp.id);
      if (idx >= 0) staff.splice(idx, 1);
      quitters.push(emp);
      recordJournal(S, `${emp.name} (${emp.role}) quit ${biz.name} — morale had sunk to ${Math.round(emp.morale)} and they walked out.`, 'career');
      queueScene(S, {
        key: `biz_quit_${emp.id}_${S.year}_${S.month}`,
        category: 'career',
        title: `${emp.name} quit`,
        text: `${emp.name}, your ${emp.role} at ${biz.name}, has handed in their notice. Three months of unresolved low morale. Hire a replacement or reduce work.`,
        choices: [{ label: 'Acknowledge', effect: () => {} }]
      });
    }
  }
  biz.employees = staff.length;
  if (quitters.length > 0) stampMonthEffects(S, biz);
  return quitters;
}

/* ------------------------------------------------------------------ */
/* Fit note + render                                                   */
/* ------------------------------------------------------------------ */
export function staffFitNote(emp) {
  const fit = emp.fit || 'average';
  if (fit === 'good') return 'Good fit — learns fast, lifts the team';
  if (fit === 'poor') return 'Poor fit — clashes with the team';
  return 'Settling in — steady so far';
}

function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderBusinessStaffSection(S, biz) {
  if (!biz) return '';
  const staff = ensureStaffArray(S, biz);
  const roles = staffRolesForType(biz.typeId);
  const countryId = biz.figuresCurrency||biz.country || S.country;
  const wages = totalStaffWages(biz);
  const avg = averageMorale(biz);
  const factor = teamMoraleFactor(biz);
  const rows = staff.length === 0
    ? `<div class="muted">No employees yet — it is just you. Hire below; wages come out of the business every month and morale moves revenue.</div>`
    : staff.map(emp => `
      <div class="biz-staff-row" style="display:flex;justify-content:space-between;gap:8px;padding:6px 0;border-bottom:1px solid var(--hatch-widget-border, #ddd);">
        <div>
          <strong>${escHtml(emp.name)}</strong> · ${escHtml(emp.role)}
          <span class="muted"> — ${formatMoney(emp.wageLocal, countryId)}/mo · morale ${Math.round(emp.morale)} · skill ${Math.round(emp.skill)}</span>
          <div class="muted" style="font-size:12px;">${escHtml(staffFitNote(emp))} · since ${emp.hiredMonth}/${emp.hiredYear}</div>
        </div>
        <button class="btn btn-sm" data-action="biz-fire" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}">Fire</button>
      </div>`).join('');
  const hireBtns = roles.map(role => {
    const wage = Math.round(convertCurrency(roleWageLocal(S,role,biz.country||S.country),biz.country||S.country,countryId,S.year));
    return `<button class="btn btn-sm" data-action="biz-hire" data-biz="${escHtml(biz.id)}" data-role="${escHtml(role)}" title="${escHtml(roleHireBlurb(role))} — onboarding costs one month's wage">Hire ${escHtml(role)} (${formatMoney(wage, countryId)}/mo) — ${escHtml(roleHireBlurb(role).split(' — ')[1] || '')}</button>`;
  }).join(' ');
  return `
  <div class="biz-staff-section" style="margin-top:10px;">
    <h4>Staff — ${staff.length} employee${staff.length === 1 ? '' : 's'}</h4>
    <div class="muted" style="margin-bottom:6px;">Payroll ${formatMoney(wages, countryId)}/month${avg === null ? '' : ` · team morale ${Math.round(avg)} (revenue ×${factor.toFixed(2)})`}</div>
    ${rows}
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">${hireBtns}</div>
    <div class="muted" style="font-size:12px;margin-top:4px;">Hiring costs one month's wage to onboard. Firing costs severance under ${escHtml(getCountry(countryId).name || countryId)} law, paid from your own cash — and shakes the team (morale −8). Unhappy staff (morale under 25) may quit on their own.</div>
  </div>`;
}
