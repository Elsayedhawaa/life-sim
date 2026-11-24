import{renderPortraitSvg}from '../ui/portraits.js';
import{STAFF_BENEFITS,employeeBenefitsCost,benefitsCost}from './businessBenefits.js';
import{staffPreference,fulfillEmployeeRequest,staffActionQuote,employeePerson}from './businessPeople.js';
/* ============================================================================
   World Life 2.0 — Business Roles, Real (v2.17 W3, §4)
   Hiring in real positions with real titles and real effects.
   ----------------------------------------------------------------------------
   MODEL — every role moves a REAL number in the next month's P&L:
   - Quality q = (effectiveSkill - 50) / 50, in [-1, +1]. Skill 50 is
     break-even: an average worker keeps the place running and adds
     nothing. Skill 80 helps, skill 40 hurts a little, skill 20 hurts
     a lot. Fit shifts effective skill: good fit +5, poor fit -5.
   - Money channels (revenueAdd / costAdd) are fractions of the
     business's monthlyRev, so a role's effect scales with the size of
     the business instead of being a made-up flat figure. A chef in a
     kiosk moves less money than a chef in a big restaurant — same
     skill, same percentages, real scale.
   - revenueMult channels multiply together across staff; every other
     channel adds. repeatRateDelta moves the share of customers who
     come back (0..1); moraleDelta moves the team's morale.
   - A dishonest money-handler (cashier / bookkeeper / accountant with
     emp.dishonest === true) STEALS: costAdd up 2% of monthlyRev.
     makeEmployee derives dishonesty at hire from the draws already
     made (poor fit + low skill, businessStaff.js); the player sees
     it as a till that never adds up, in the staff list and in the
     P&L notes — and firing the thief stops it.
   CONTRACT (W2's fold reads this, this file only stamps it):
   - roleEffects(S, biz) -> { revenueMult, revenueAdd, costAdd,
       repeatRateDelta, moraleDelta, notes } — PURE: reads the current
       staff, returns what the staff does this month, mutates nothing.
       Defaults: revenueMult 1, revenueAdd 0, costAdd 0,
       repeatRateDelta 0, moraleDelta 0, notes [].
   - stampMonthEffects(S, biz) -> the same object, stored on
       biz.monthEffects. Action functions below stamp after every
       change (hire / fire / train / promote / quit / seed). NEVER
       write the P&L directly here; never touch the settlement.
   - Notes are plain words for the P&L breakdown, one per person
       whose effect is big enough to matter (|q| >= 0.1 or dishonest):
       "Chef Amira: regulars coming back (+4%), prices hold (+3%)".
   TRAINING: +8 skill, costs half a month's wage, skill caps at 95.
   PROMOTION: needs skill >= 60, target role must be one this business
   type hires; wage rises to the new role's wage, morale +10 (a
   promotion feels good), effect grows because the role is bigger.
   ========================================================================== */

import { clamp } from '../core/rng.js';
import { recordJournal, walletMove } from '../core/schema.js';
import {convertCurrency} from '../data/economy.js';
import { formatMoney } from '../data/countries.js';
import {
  ensureStaffArray, staffRolesForType, roleWageLocal
} from './businessStaff.js';

/* ------------------------------------------------------------------ */
/* Effect table — one row per role. Coefficients are per unit q.       */
/* Money coefficients are fractions of biz.monthlyRev.                */
/* ------------------------------------------------------------------ */
/* Channels: repeatRate (0..1), revenueMult (multiplier delta),
   revenueAdd (fraction of monthlyRev), costAdd (fraction of
   monthlyRev; negative = saves money), moraleDelta (morale points). */
export const ROLE_EFFECTS = {
  /* Food — the chef is the food: regulars and price tolerance. */
  chef:      { repeatRate: 0.06, revenueMult: 0.03, revenueAdd: 0,    costAdd: 0,     moraleDelta: 0, verb: 'cooks — food quality brings regulars back and lets prices hold' },
  baker:     { repeatRate: 0.04, revenueMult: 0.02, revenueAdd: 0.02, costAdd: 0,     moraleDelta: 0, verb: 'bakes — fresh goods bring regulars back' },
  barista:   { repeatRate: 0.03, revenueMult: 0.01, revenueAdd: 0.03, costAdd: 0,     moraleDelta: 0, verb: 'makes the coffee — regulars come back for a good cup' },
  waiter:    { repeatRate: 0,    revenueMult: 0.02, revenueAdd: 0.08, costAdd: 0,     moraleDelta: 0, verb: 'serves tables — more covers a night, faster service' },
  /* Money-handling — the till, the books. */
  cashier:   { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.02, costAdd: -0.03, moraleDelta: 0, verb: 'runs the till — a tight till stops theft and keeps the queue moving' },
  bookkeeper:{ repeatRate: 0,    revenueMult: 0,    revenueAdd: 0,    costAdd: -0.04, moraleDelta: 0, verb: 'keeps the books — fewer tax mistakes and late fees' },
  accountant:{ repeatRate: 0,    revenueMult: 0,    revenueAdd: 0,    costAdd: -0.04, moraleDelta: 0, verb: 'does the accounts — fewer tax mistakes and late fees' },
  /* Reach and customers. */
  driver:    { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'drives deliveries — further reach, more orders' },
  marketing: { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.08, costAdd: 0,     moraleDelta: 0, verb: 'brings in new customers — word gets out' },
  sales:     { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.08, costAdd: 0,     moraleDelta: 0, verb: 'sells — more customers walk out with something' },
  agent:     { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.08, costAdd: 0,     moraleDelta: 0, verb: 'brings in clients — more deals closed' },
  /* The place itself. */
  security:{repeatRate:0,revenueMult:0,revenueAdd:0,costAdd:0,moraleDelta:0,verb:'protects the premises, reduces robbery losses'},
  cleaner:   { repeatRate: 0.02, revenueMult: 0.01, revenueAdd: 0,    costAdd: 0,     moraleDelta: 0, verb: 'keeps the place clean — customers notice, and come back' },
  manager:   { repeatRate: 0,    revenueMult: 0.04, revenueAdd: 0,    costAdd: 0,     moraleDelta: 5, verb: 'runs the team — better service and a steadier crew' },
  /* Front of house. */
  receptionist: { repeatRate: 0.02, revenueMult: 0, revenueAdd: 0.02, costAdd: 0,     moraleDelta: 0, verb: 'greets customers — a good first minute brings them back' },
  /* Skilled work — the work itself is the product. */
  developer: { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.07, costAdd: 0,     moraleDelta: 0, verb: 'builds the product — better work, more paying customers' },
  designer:  { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'designs — better work wins more clients' },
  teacher:   { repeatRate: 0.02, revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'teaches — students stay and tell their friends' },
  stylist:   { repeatRate: 0.02, revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'cuts and styles — happy clients rebook' },
  trainer:   { repeatRate: 0.02, revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'trains clients — members renew' },
  pharmacist:{ repeatRate: 0.01, revenueMult: 0,    revenueAdd: 0.05, costAdd: 0,     moraleDelta: 0, verb: 'serves patients — trusted advice brings them back' },
  doctor:    { repeatRate: 0.02, revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'treats patients — good care brings them back' },
  dentist:   { repeatRate: 0.02, revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'treats patients — good care brings them back' },
  vet:       { repeatRate: 0.02, revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'treats animals — owners come back' },
  physio:    { repeatRate: 0.02, revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'treats patients — good care brings them back' },
  nurse:     { repeatRate: 0.02, revenueMult: 0,    revenueAdd: 0.04, costAdd: 0,     moraleDelta: 0, verb: 'looks after patients — good care brings them back' },
  lawyer:    { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.07, costAdd: 0,     moraleDelta: 0, verb: 'wins cases — clients pay and recommend' },
  paralegal: { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.04, costAdd: -0.01, moraleDelta: 0, verb: 'does the casework — fewer mistakes, faster files' },
  architect: { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'designs — better plans win more projects' },
  consultant:{ repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.07, costAdd: 0,     moraleDelta: 0, verb: 'advises clients — good advice brings repeat work' },
  technician:{ repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.05, costAdd: -0.01, moraleDelta: 0, verb: 'fixes things — jobs done right, fewer callbacks' },
  dispatcher:{ repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.04, costAdd: -0.01, moraleDelta: 0, verb: 'runs the routes — vans on time, fewer wasted trips' },
  packager:  { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.03, costAdd: -0.01, moraleDelta: 0, verb: 'packs orders — fewer mistakes, faster dispatch' },
  assistant: { repeatRate: 0.01, revenueMult: 0,    revenueAdd: 0.04, costAdd: 0,     moraleDelta: 0, verb: 'helps out — errands, paperwork, whatever the day needs' },
  worker:    { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.04, costAdd: 0,     moraleDelta: 0, verb: 'does the shift work — the day runs because they are there' },
  dishwasher:{ repeatRate: 0.01, revenueMult: 0,    revenueAdd: 0.01, costAdd: 0,     moraleDelta: 0, verb: 'keeps the dishes moving — a backed-up kitchen loses tables' },
  nanny:     { repeatRate: 0.01, revenueMult: 0,    revenueAdd: 0.04, costAdd: 0,     moraleDelta: 0, verb: 'looks after the children — parents trust the place' },
  director:  { repeatRate: 0,    revenueMult: 0.04, revenueAdd: 0,    costAdd: 0,     moraleDelta: 5, verb: 'runs the business — better decisions, steadier crew' },
  executive: { repeatRate: 0,    revenueMult: 0.04, revenueAdd: 0,    costAdd: 0,     moraleDelta: 5, verb: 'runs the business — better decisions, steadier crew' },
  head:      { repeatRate: 0,    revenueMult: 0.04, revenueAdd: 0,    costAdd: 0,     moraleDelta: 5, verb: 'runs the business — better decisions, steadier crew' },
  cto:       { repeatRate: 0,    revenueMult: 0.04, revenueAdd: 0,    costAdd: 0,     moraleDelta: 5, verb: 'runs the technology — better product, steadier crew' },
  cfo:       { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0,    costAdd: -0.04, moraleDelta: 5, verb: 'runs the money — fewer mistakes, steadier crew' },
  weaver:    { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.05, costAdd: 0,     moraleDelta: 0, verb: 'weaves — better cloth sells for more' },
  typesetter:{ repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.04, costAdd: 0,     moraleDelta: 0, verb: 'sets the print — clean work, happy customers' },
  photographer: { repeatRate: 0, revenueMult: 0,   revenueAdd: 0.06, costAdd: 0,     moraleDelta: 0, verb: 'takes the photos — good shots bring clients back' },
  /* Anything else a type hires: the work itself is the product. */
  _generic:  { repeatRate: 0,    revenueMult: 0,    revenueAdd: 0.05, costAdd: 0,     moraleDelta: 0, verb: 'does the work — good work brings more business' }
};

export const MONEY_HANDLING_ROLES = ['cashier', 'bookkeeper', 'accountant'];
/* A dishonest money-handler steals 2% of monthly revenue a month. */
export const THEFT_FRACTION = 0.02;

export function roleEffectSpec(role) {
  return ROLE_EFFECTS[String(role || '').toLowerCase()] || ROLE_EFFECTS._generic;
}

/* Plain-words hire blurb for a role — what the button says BEFORE the
   player hires. Used by the staff section in businessStaff.js. */
export function roleHireBlurb(role) {
  const spec = roleEffectSpec(role);
  const label = roleLabel(role);
  return `${label} — ${spec.verb}`;
}

export function roleLabel(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'marketing') return 'Marketing person';
  if (r === 'bookkeeper') return 'Bookkeeper';
  return r.charAt(0).toUpperCase() + r.slice(1);
}

/* Effective skill: fit moves it a little (good fit +5, poor fit -5). */
export function effectiveSkill(emp) {
  const base = Number(emp?.skill) || 0;
  const fit = emp?.fit || 'average';
  return clamp(base + (fit === 'good' ? 5 : fit === 'poor' ? -5 : 0), 0, 100);
}

/* Quality: -1 (skill 0) .. 0 (skill 50, break-even) .. +1 (skill 100). */
export function roleQuality(emp) {
  return (effectiveSkill(emp) - 50) / 50;
}

function pctStr(x) {
  const n = Math.round(x * 100);
  return `${n > 0 ? '+' : ''}${n}%`;
}

/* One employee's contribution this month. Pure.
   v2.20 I3 — the MONEY channels scale on ABSOLUTE skill, not on
   deviation from 50: the old q = (skill − 50) / 50 made an average
   worker contribute ~nothing (a skill-51 cashier added +9 EGP to a
   stall taking 20,900). A worker doing the job produces output; skill
   scales how much: s = 0.5 + skill/100 (0.5 at skill 0, 1.0 at skill
   50, 1.5 at skill 100), so the same skill-51 cashier now adds
   1.01 × 0.02 × 20,900 ≈ 422 EGP and saves 1.01 × 0.03 × 20,900 ≈
   633 EGP on the till. The STATE channels (repeat rate, morale) stay
   on deviation-from-50 on purpose: they land EVERY month, so an
   absolute scale would ratchet them — an average chef would add
   regulars every month until the rate pinned at 1.0, an average
   manager would lift morale every month until it pinned at 100.
   Average stays neutral there; skill moves the money. */
export function roleEffectForEmployee(S, biz, emp) {
  const spec = roleEffectSpec(emp?.role);
  const q = roleQuality(emp);
  const skill=effectiveSkill(emp);
  const s=skill<35?(skill-35)/35:0.5+skill/100;
  const base = Math.max(0, Number(biz?.monthlyRev) || 0);
  const revenueMult = 1 + s * (spec.revenueMult || 0);
  const revenueAdd = Math.round(s * (spec.revenueAdd || 0) * base);
  let costAdd = Math.round(s * (spec.costAdd || 0) * base);
  const repeatRateDelta = q * (spec.repeatRate || 0);
  const moraleDelta = q * (spec.moraleDelta || 0);
  const dishonest = emp?.dishonest === true && MONEY_HANDLING_ROLES.includes(String(emp.role || '').toLowerCase());
  if(dishonest)costAdd=Math.max(0,costAdd)+Math.round(THEFT_FRACTION*base);
  return {
    revenueMult, revenueAdd, costAdd, repeatRateDelta, moraleDelta,
    dishonest, quality: q, note: personEffectText(S, biz, emp, { revenueMult, revenueAdd, costAdd, repeatRateDelta, moraleDelta, dishonest, quality: q })
  };
}

/* Plain-words line for one person: what they do for the business.
   Used by the staff list and by the P&L notes (same words, one source). */
export function personEffectText(S, biz, emp, precomputed) {
  const c = precomputed || roleEffectForEmployee(S, biz, emp);
  const name = emp?.name || 'This employee';
  const label = roleLabel(emp?.role);
  const base = Math.max(0, Number(biz?.monthlyRev) || 0);
  const parts = [];
  if (Math.abs(c.repeatRateDelta) >= 0.005) {
    parts.push(c.repeatRateDelta > 0
      ? `regulars coming back (${pctStr(c.repeatRateDelta)})`
      : `regulars drifting away (${pctStr(c.repeatRateDelta)})`);
  }
  if (Math.abs(c.revenueMult - 1) >= 0.005) {
    parts.push(c.revenueMult > 1
      ? `customers pay a little more (${pctStr(c.revenueMult - 1)})`
      : `customers put off by the service (${pctStr(c.revenueMult - 1)})`);
  }
  if (base > 0 && Math.abs(c.revenueAdd) >= Math.max(1, base * 0.005)) {
    parts.push(c.revenueAdd > 0
      ? `brings in extra sales (${pctStr(c.revenueAdd / base)})`
      : `loses sales (${pctStr(c.revenueAdd / base)})`);
  }
  if (base > 0 && Math.abs(c.costAdd) >= Math.max(1, base * 0.005)) {
    parts.push(c.costAdd < 0
      ? `saves on costs (${pctStr(c.costAdd / base)})`
      : `costs extra (${pctStr(c.costAdd / base)})`);
  }
  if (Math.abs(c.moraleDelta) >= 1) {
    parts.push(c.moraleDelta > 0 ? 'lifts the team' : 'drags the team down');
  }
  if (c.dishonest) {
    parts.push('the till never adds up — money is going missing');
  }
  /* v2.20 I4 — an average worker adds nothing, and the row already
     shows their name, role, wage, skill and morale: a line that says
     "no gain, no loss" is dead text, so nothing is printed for them
     (the staff list skips the empty line). */
  if (parts.length === 0) {
    return '';
  }
  return `${label} ${name}: ${parts.join(', ')}.`;
}

/* The monthEffects object for the business's CURRENT staff. PURE —
   reads staff and monthlyRev, mutates nothing. revenueMults multiply
   together, everything else adds. */
export function roleEffects(S, biz) {
  const staff = Array.isArray(biz?.staff) ? biz.staff : [];
  const out = { revenueMult: 1, revenueAdd: 0, costAdd: 0, repeatRateDelta: 0, moraleDelta: 0, notes: [] };
  for (const emp of staff) {
    const c = roleEffectForEmployee(S, biz, emp);
    out.revenueMult *= c.revenueMult;
    out.revenueAdd += c.revenueAdd;
    out.costAdd += c.costAdd;
    out.repeatRateDelta += c.repeatRateDelta;
    out.moraleDelta += c.moraleDelta;
    if (Math.abs(c.quality) >= 0.1 || c.dishonest) {
      /* v2.20 I4 — never push an empty note into the P&L notes. */
      if (c.note) out.notes.push(c.note);
    }
  }
  out.revenueMult = Number(out.revenueMult.toFixed(4));
  out.revenueAdd = Math.round(out.revenueAdd);
  out.costAdd = Math.round(out.costAdd);
  out.repeatRateDelta = Number(out.repeatRateDelta.toFixed(4));
  out.moraleDelta = Number(out.moraleDelta.toFixed(1));
  return out;
}

/* Stamp the current staff effect onto the business for W2's fold to
   read at settlement. Call after every staff change.
   v2.17 merge fix — a plain replace would wipe any operations effect
   the player already stamped this month (marketing, overtime), so the
   stamp is a DELTA: it removes the role contribution stamped last
   time and adds the fresh one, leaving everything else in the object
   alone. biz._lastRoleEffects is cleared by the settlement fold when
   it clears monthEffects, so a stale previous month can never be
   subtracted from a fresh month. */
export function stampMonthEffects(S, biz) {
  if (!biz) return null;
  const fresh = roleEffects(S, biz);
  const prev = (biz._lastRoleEffects && typeof biz._lastRoleEffects === 'object') ? biz._lastRoleEffects : null;
  const me = (biz.monthEffects && typeof biz.monthEffects === 'object')
    ? biz.monthEffects
    : { revenueMult: 1, revenueAdd: 0, costAdd: 0, repeatRateDelta: 0, moraleDelta: 0, notes: [] };
  if (prev && biz.monthEffects) {
    /* Remove the old role contribution, add the fresh one. */
    me.revenueMult = ((Number(me.revenueMult) || 1) / (Number(prev.revenueMult) || 1)) * fresh.revenueMult;
    me.revenueAdd = (Number(me.revenueAdd) || 0) - (Number(prev.revenueAdd) || 0) + fresh.revenueAdd;
    me.costAdd = (Number(me.costAdd) || 0) - (Number(prev.costAdd) || 0) + fresh.costAdd;
    me.repeatRateDelta = (Number(me.repeatRateDelta) || 0) - (Number(prev.repeatRateDelta) || 0) + fresh.repeatRateDelta;
    me.moraleDelta = (Number(me.moraleDelta) || 0) - (Number(prev.moraleDelta) || 0) + fresh.moraleDelta;
    const prevNames = Array.isArray(prev.staffNames) ? prev.staffNames : [];
    me.notes = (me.notes || []).filter(n =>
      !(prev.notes || []).includes(n) &&
      !prevNames.some(nm => typeof n === 'string' && n.includes(' ' + nm + ':')));
    me.notes.push(...(fresh.notes || []));
  } else {
    /* Fresh slate (first stamp, or a new month): merge the fresh role
       effects in, keeping any operations effects already stamped. */
    me.revenueMult = (Number(me.revenueMult) || 1) * fresh.revenueMult;
    me.revenueAdd = (Number(me.revenueAdd) || 0) + fresh.revenueAdd;
    me.costAdd = (Number(me.costAdd) || 0) + fresh.costAdd;
    me.repeatRateDelta = (Number(me.repeatRateDelta) || 0) + fresh.repeatRateDelta;
    me.moraleDelta = (Number(me.moraleDelta) || 0) + fresh.moraleDelta;
    me.notes.push(...(fresh.notes || []));
  }
  biz.monthEffects = me;
  biz._lastRoleEffects = {
    revenueMult: fresh.revenueMult, revenueAdd: fresh.revenueAdd, costAdd: fresh.costAdd,
    repeatRateDelta: fresh.repeatRateDelta, moraleDelta: fresh.moraleDelta,
    notes: [...(fresh.notes || [])],
    staffNames: (Array.isArray(biz.staff) ? biz.staff : []).map(e => e.name).filter(Boolean)
  };
  return biz.monthEffects;
}

/* ------------------------------------------------------------------ */
/* Training — costs money, raises skill by a real, stated amount.      */
/* ------------------------------------------------------------------ */
export const TRAIN_SKILL_GAIN = 8;
export const TRAIN_COST_FACTOR = 0.5; /* half a month's wage */
export const TRAIN_MAX_SKILL = 95;

export function trainingCostFor(emp) {
  return Math.max(1, Math.round((Number(emp?.wageLocal) || 0) * TRAIN_COST_FACTOR));
}

export function trainBusinessEmployee(S, biz, staffId) {
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const staff = ensureStaffArray(S, biz);
  const emp = staff.find(e => e.id === staffId);
  if (!emp) return { ok: false, msg: 'That employee no longer works here.' };
  if ((Number(emp.skill) || 0) >= TRAIN_MAX_SKILL) {
    return { ok: false, msg: `${emp.name} is already as good as training can make them (skill ${Math.round(emp.skill)}).` };
  }
  const cost = Math.round(convertCurrency(trainingCostFor(emp),biz.figuresCurrency||biz.country||S.country,S.country,S.year));
  if ((Number(S.money.cash) || 0) < cost) {
    return { ok: false, msg: `Training ${emp.name} costs ${formatMoney(cost,S.country)} — not enough cash.` };
  }
  const before = Math.round(Number(emp.skill) || 0);
  walletMove(S, -cost, `Training — ${emp.name} (${emp.role})`, 'business');
  emp.skill = clamp((Number(emp.skill) || 0) + TRAIN_SKILL_GAIN, 0, TRAIN_MAX_SKILL);
  const after = Math.round(emp.skill);
  fulfillEmployeeRequest(S,biz,emp,'training');
  recordJournal(S, `Sent ${emp.name} (${emp.role}) on a training course at ${biz.name} for ${formatMoney(cost,S.country)}. Skill ${before} → ${after}.`, 'career');
  stampMonthEffects(S, biz);
  return { ok: true, msg: `Trained ${emp.name}: skill ${before} → ${after} (+${TRAIN_SKILL_GAIN}) for ${formatMoney(cost,S.country)}.`, cost, skillGain: TRAIN_SKILL_GAIN, newSkill: after, employee: emp };
}

/* ------------------------------------------------------------------ */
/* Promotion — into a higher role, with a higher wage and a bigger     */
/* effect. Needs skill 60+ and the target role must be one this        */
/* business type hires.                                                */
/* ------------------------------------------------------------------ */
export const PROMOTION_MIN_SKILL = 60;
export const PROMOTION_MORALE_GAIN = 10;

export const PROMOTION_TARGETS = {
  waiter: ['manager'], cashier: ['manager', 'bookkeeper'], cleaner: ['waiter', 'cashier'],
  barista: ['manager'], sales: ['manager'], packager: ['dispatcher', 'manager'],
  receptionist: ['manager'], teacher: ['manager'], stylist: ['manager'],
  trainer: ['manager'], nurse: ['manager'], paralegal: ['manager'],
  technician: ['manager'], driver: ['dispatcher', 'manager'],
  developer: ['manager'], designer: ['manager'], agent: ['manager'],
  assistant: ['manager'], baker: ['manager', 'chef'], weaver: ['manager'],
  typesetter: ['manager'], photographer: ['manager'], pharmacist: ['manager'],
  bookkeeper: ['accountant', 'manager'], marketing: ['manager'],
  dispatcher: ['manager'], chef: ['manager']
};

export function promotionTargetsFor(S, biz, emp) {
  if (!emp) return [];
  const roles = staffRolesForType(biz?.typeId);
  const wanted = PROMOTION_TARGETS[String(emp.role || '').toLowerCase()] || ['manager'];
  return wanted.filter(t => t !== emp.role && roles.includes(t));
}

export function promoteBusinessEmployee(S, biz, staffId, newRole) {
  if (!biz) return { ok: false, msg: 'No business selected.' };
  const staff = ensureStaffArray(S, biz);
  const emp = staff.find(e => e.id === staffId);
  if (!emp) return { ok: false, msg: 'That employee no longer works here.' };
  const targets = promotionTargetsFor(S, biz, emp);
  if (!newRole || !targets.includes(newRole)) {
    return { ok: false, msg: `${emp.name} (${emp.role}) cannot move into that role here — this business hires: ${staffRolesForType(biz.typeId).join(', ')}.` };
  }
  if ((Number(emp.skill) || 0) < PROMOTION_MIN_SKILL) {
    return { ok: false, msg: `${emp.name} needs skill ${PROMOTION_MIN_SKILL} to be promoted (now ${Math.round(emp.skill)}). Train them first.` };
  }
  const oldRole = emp.role;
  const oldWage = Number(emp.wageLocal) || 0;
  const newWage = Math.round(convertCurrency(roleWageLocal(S,newRole,biz.country||S.country),biz.country||S.country,biz.figuresCurrency||biz.country||S.country,S.year));
  emp.role = newRole;
  emp.wageLocal = newWage;
  emp.morale = clamp((Number(emp.morale) || 0) + PROMOTION_MORALE_GAIN, 0, 100);
  emp.promotedFrom = oldRole;
  recordJournal(S, `Promoted ${emp.name} from ${oldRole} to ${newRole} at ${biz.name}. Wage ${formatMoney(oldWage,biz.figuresCurrency||biz.country||S.country)} → ${formatMoney(newWage,biz.figuresCurrency||biz.country||S.country)}/month; they are proud of it (morale +${PROMOTION_MORALE_GAIN}).`, 'career');
  stampMonthEffects(S, biz);
  return { ok: true, msg: `Promoted ${emp.name}: ${oldRole} → ${newRole}, wage ${formatMoney(newWage,biz.figuresCurrency||biz.country||S.country)}/month.`, oldRole, newRole, newWage, employee: emp };
}

/* ------------------------------------------------------------------ */
/* Render — the staff list: role, wage, skill and what each person    */
/* does for the business, plus hire / train / promote / fire.          */
/* Delivered for the coordinator to wire into views.js (see           */
/* INSERTION POINT below).                                             */
/* ------------------------------------------------------------------ */
/* INSERTION POINT (coordinator): src/ui/views.js, line 2229, inside
   the business card template — REPLACE the anchor line
     ${renderBusinessStaffSection(S, biz)}
   with
     ${renderStaffListHtml(S, biz)}
   and add to the views.js imports (next to the existing
   renderBusinessStaffSection import, line 106):
     import { renderStaffListHtml } from '../systems/businessRoles.js';
   renderBusinessStaffSection stays as the fallback until wired; both
   render the same staff and the same hire actions (biz-hire /
   biz-fire). Train and promote need the two main.js branches
   (biz-train, biz-promote) next to the biz-hire branch. */
function escHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderStaffListHtml(S, biz, selectedId=null) {
  if (!biz) return '';
  const staff = ensureStaffArray(S, biz);
  const roles = staffRolesForType(biz.typeId);
  const countryId = biz.figuresCurrency||biz.country || S.country;
  const wages=staff.reduce((sum,e)=>sum+(Number(e.wageLocal)||0),0)+benefitsCost(biz);
  const avgMorale = staff.length ? staff.reduce((s, e) => s + (Number(e.morale) || 0), 0) / staff.length : null;
  const avgSkill = staff.length ? staff.reduce((s, e) => s + (Number(e.skill) || 0), 0) / staff.length : null;
  const eff = roleEffects(S, biz);
  /* v2.20 I4 — the staff summary names only the parts that are real.
     A line of zeroes ("add +0 revenue, repeat +0%") is dead text:
     when nothing moves, no line is printed at all. */
  const effectParts = [];
  if (eff.revenueAdd !== 0) effectParts.push(`add ${eff.revenueAdd >= 0 ? '+' : ''}${formatMoney(eff.revenueAdd, countryId)} revenue`);
  if (eff.costAdd !== 0) effectParts.push(eff.costAdd <= 0 ? `save ${formatMoney(Math.abs(eff.costAdd), countryId)}` : `cost ${formatMoney(eff.costAdd, countryId)} extra`);
  /* A repeat-rate move that rounds to 0% is no move at all — naming it
     ("repeat customers 0%") is the same dead text as the zeroes above. */
  if (Math.round(eff.repeatRateDelta * 100) !== 0) effectParts.push(`repeat customers ${eff.repeatRateDelta > 0 ? '+' : ''}${Math.round(eff.repeatRateDelta * 100)}%`);
  const effectSummary = biz.enterprise?'Core roles add operating capacity. All hires add recurring payroll.':biz.tech?'Engineers build the product; sales bring users; support reduces churn.':staff.length === 0
    ? 'No staff yet — it is just you.'
    : effectParts.length ? `Staff ${effectParts.join(', ')} this month.` : '';
  const rows = staff.length === 0
    ? `<div class="muted">No employees yet — it is just you. Hire below; wages come out of the business every month and morale moves revenue.</div>`
    : staff.filter(emp=>emp.id===(staff.find(e=>e.id===selectedId)||staff[0])?.id).map(emp => {
        const effectLine = biz.enterprise?'Contributes to the operating team. Wage is charged every month.':biz.tech?({developer:'Builds prototypes, ships features and improves quality.',designer:'Improves development speed and product quality.',sales:'Acquires new users after release.',marketing:'Acquires new users after release.',support:'Reduces customer churn.',cto:'Builds products with the engineering team.',bookkeeper:'Administration, charged as payroll.'}[emp.role]||'Support role, charged as payroll.'):personEffectText(S, biz, emp);
        /* v2.18 W3 — the row above already names the person and their
           role, so the effect line drops its "Role Name: " prefix here.
           personEffectText keeps the prefix: the P&L notes use the same
           words with no name line next to them, so they still need it. */
        const effectPrefix = `${roleLabel(emp.role)} ${emp.name}: `;
        /* v2.18 W3 — the effect fragment keeps its lowercase start, as
           it had after the colon: the row above already names the
           person and their role. */
        const effectShown = effectLine.startsWith(effectPrefix)
          ? effectLine.slice(effectPrefix.length)
          : effectLine;
        const targets = promotionTargetsFor(S, biz, emp);
        const canPromote = targets.length > 0 && (Number(emp.skill) || 0) >= PROMOTION_MIN_SKILL;
        const trainCost = trainingCostFor(emp);
        const promoteBtns = targets.map(t => {
          const wage = Math.round(convertCurrency(roleWageLocal(S,t,biz.country||S.country),biz.country||S.country,countryId,S.year));
          const disabled = (Number(emp.skill) || 0) < PROMOTION_MIN_SKILL;
          return `<button class="btn btn-sm" data-action="biz-promote" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}" data-role="${escHtml(t)}" ${disabled ? 'disabled' : ''} title="${disabled ? `Needs skill ${PROMOTION_MIN_SKILL} (now ${Math.round(emp.skill)})` : `Promote to ${escHtml(t)} — wage ${formatMoney(wage, countryId)}/month, bigger effect`}">${disabled ? `Promote to ${escHtml(t)} (needs skill ${PROMOTION_MIN_SKILL})` : `Promote to ${escHtml(t)} (${formatMoney(wage, countryId)}/mo)`}</button>`;
        }).join(' ');
        return `
      <div class="biz-staff-row" style="padding:6px 0;border-bottom:1px solid var(--hatch-widget-border, #ddd);">
        <div>
          <span style="float:left;margin-right:8px">${renderPortraitSvg(employeePerson(S,biz,emp),44)}</span><strong>${escHtml(emp.name)}</strong> · ${escHtml(roleLabel(emp.role))}
          <span class="muted"> — ${formatMoney(emp.wageLocal, countryId)}/mo · skill ${Math.round(emp.skill)} · morale ${Math.round(emp.morale)}</span>
          <div class="muted">${escHtml(staffPreference(S,biz,emp))}${emp.request?` · Wants ${emp.request.kind==='raise'?'pay review':emp.request.kind==='rest'?'time off':'training'}`:''}</div>
          ${emp.request?.kind==='raise'?`<button class="btn btn-sm" data-action="biz-staff-request" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}" data-accept="yes">Raise 10% · ${formatMoney(Math.round(emp.wageLocal*1.1),countryId)}/mo</button>`:''}
          ${emp.request?`<button class="btn btn-sm" data-action="biz-staff-request" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}" data-accept="no">Decline request</button>`:''}
          <section class="biz-person-section"><h5>Pay &amp; conduct</h5><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
          ${[['raise','Raise 10% · '+formatMoney(staffActionQuote(S,biz,emp,'raise').wage,countryId)+'/mo'],['cut','Offer 10% pay cut'],['bonus','Bonus · '+formatMoney(staffActionQuote(S,biz,emp,'bonus').cost,countryId)],['warn','Give warning']].map(([kind,label])=>`<button class="btn btn-sm" data-action="biz-staff-action" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}" data-kind="${kind}">${escHtml(label)}</button>`).join('')}</div><div class="muted">Pay cuts require agreement. Warnings reduce trust.</div></section>
          <section class="biz-person-section"><h5>Benefits · ${formatMoney(employeeBenefitsCost(emp),countryId)}/mo</h5><div class="muted">Optional game packages, not statutory coverage. Recurring payroll costs.</div>${Object.entries(STAFF_BENEFITS).map(([id,b])=>`<button class="btn btn-sm" data-action="biz-benefit" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}" data-benefit="${id}">${emp.benefits?.[id]?'✓ Remove':'Add'} ${b.label} · ${formatMoney(Math.round(emp.wageLocal*b.rate),countryId)}/mo</button>`).join('')}</section>
          ${effectShown ? `<div style="font-size:12px;">${escHtml(effectShown)}</div>` : ''}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">
          <button class="btn btn-sm" data-action="biz-train" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}" title="Training course: +${TRAIN_SKILL_GAIN} skill, costs ${formatMoney(trainCost, countryId)}">Train · ${formatMoney(trainCost, countryId)}</button>
          ${promoteBtns}
          <button class="btn btn-sm btn-danger" data-action="biz-fire" data-biz="${escHtml(biz.id)}" data-staff="${escHtml(emp.id)}">Fire</button>
        </div>
      </div>`;
      }).join('');
  /* v2.20 I4 — ONE hire path for a manager: the Manager section's
     candidate list. The staff-role "Hire Manager" button is removed
     (a manager is not a staff role to hire off this list — the Manager
     section shows real candidates with their asking wage). The
     onboarding cost is stated once, in the rules line below — not
     repeated in every button's tooltip. */
  const hireBtns = roles.filter(role => String(role).toLowerCase() !== 'manager').map(role => {
    const wage = Math.round(convertCurrency(roleWageLocal(S,role,biz.country||S.country),biz.country||S.country,countryId,S.year));
    return `<button class="btn btn-sm" data-action="biz-hire" data-biz="${escHtml(biz.id)}" data-role="${escHtml(role)}" title="${escHtml(roleHireBlurb(role))}">Hire ${escHtml(roleLabel(role))}</button><span class="biz-hire-quote">${formatMoney(wage,countryId)}/mo · ${escHtml(roleEffectSpec(role).verb)}</span>`;
  }).map(h=>`<div class="biz-hire-row">${h}</div>`).join('');
  return `
  <div class="biz-staff-section" style="margin-top:10px;">

    <div class="muted" style="margin-bottom:6px;">Payroll + benefits ${formatMoney(wages, countryId)}/mo${avgMorale === null ? '' : ` · team morale ${Math.round(avgMorale)} · average skill ${Math.round(avgSkill)}`}</div>
    ${effectSummary ? `<div class="muted" style="margin-bottom:6px;">${escHtml(effectSummary)}</div>` : ''}
    <div class="biz-roster">${staff.map(emp=>`<button data-action="biz-employee" data-staff="${escHtml(emp.id)}" class="${emp.id===(staff.find(e=>e.id===selectedId)||staff[0])?.id?'active':''}">${renderPortraitSvg(employeePerson(S,biz,emp),32)}<span><strong>${escHtml(emp.name)}</strong><small>${escHtml(roleLabel(emp.role))}</small></span><span class="biz-roster-score">${Math.round(emp.morale)}<small>morale</small></span></button>`).join('')}</div>
    ${rows}
    <details class="biz-hiring"><summary>Hire an employee</summary>${hireBtns}</details>
    <details class="biz-employment-rules"><summary>Employment costs &amp; rules</summary><div class="muted" style="font-size:12px;margin-top:4px;">Hiring costs one month's wage to onboard. Firing costs game severance based on the country table, paid from your own cash — and shakes the team (morale −8). Persistent distress can lead to resignation. A bad hire hurts: low skill loses customers and sales, and a dishonest cashier steals from the till.</div></details>
  </div>`;
}
