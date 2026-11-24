/* v2.17 W3 verify — Hiring in real positions (§4).
   Run from the game root: node tests/v217-w3-verify.mjs
   Proves, each measured:
   - chef / waiter / cashier / driver / marketing / bookkeeper each move
     their real number (reported below, not just asserted);
   - skill 80 vs skill 40 in the same role earns more over 12 months
     (twin lives, same seed, folded P&L month by month);
   - a bad hire hurts a real number (skill-20 chef loses repeat
     customers; a dishonest cashier's theft shows as a cost);
   - training raises skill by the stated +8 and costs half a wage;
   - promoting raises the wage and the effect, and needs skill 60;
   - firing costs severance and shakes survivors' morale -8;
   - every business type hires >= 4 real roles, and every role has a
     named effect (no silent fallback);
   - the staff list render shows role, wage, skill and effect per
     person; hire buttons state the effect before hiring;
   - hire / fire / train / promote stamp biz.monthEffects in the exact
     contract shape (W2's fold reads it). */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { computeBusinessMonth, computeBusinessTax } from '../src/systems/businessEngine.js';
import {
  staffRolesForType, hireBusinessEmployee, fireBusinessEmployee, roleWageLocal
} from '../src/systems/businessStaff.js';
import {
  roleEffects, roleEffectForEmployee, stampMonthEffects, roleHireBlurb,
  trainBusinessEmployee, promoteBusinessEmployee, promotionTargetsFor,
  renderStaffListHtml, ROLE_EFFECTS, TRAIN_SKILL_GAIN
} from '../src/systems/businessRoles.js';
import { getBusinessTypeRow } from '../src/systems/businessStaff.js';
import { V1_BUSINESS_TYPES } from '../src/data/megaCareerEduMedical.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const clamp01 = (x) => Math.max(0, Math.min(1, x));

function adultLife(seed = 777) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkBiz(typeId, name, rev = 200000, cost = 120000, capital = 500000) {
  return {
    id: `biz_${typeId}`, typeId, name, country: 'egy', city: 'Cairo',
    level: 1, maxLevel: 5, volatility: 0.05,
    monthlyRev: rev, monthlyCost: cost, capitalInvested: capital,
    repeatRate: 0.5, mode: 'full_time',
    staff: [],
    premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: [], heirId: null, remote: false, foundedYear: 2024, foundedMonth: 1,
    pricingMode: 'balanced', lastPL: null
  };
}
function emp(id, name, role, skill, extra = {}) {
  return { id, name, role, wageLocal: 10000, morale: 70, skill, hiredYear: 2024, hiredMonth: 1, fit: 'average', dishonest: false, ...extra };
}
function nextMonth(S) { S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; } }
/* The monthEffects fold, written out here the way W2's fold will do it:
   base P&L first, then revenueMult, then additive deltas, tax recomputed
   on the folded profit; repeatRateDelta applied to the business. */
function foldMonthEffects(S, basePl, eff) {
  const pl = { ...basePl };
  if (eff.revenueMult != null) pl.revenue = Math.round(pl.revenue * eff.revenueMult);
  pl.revenue += eff.revenueAdd || 0;
  pl.other = Math.max(0, (pl.other || 0) + (eff.costAdd || 0));
  pl.costs = (pl.costs || 0) + (eff.costAdd || 0);
  pl.profit = pl.revenue - pl.costs;
  pl.tax = computeBusinessTax(S, pl.profit).tax;
  pl.net = pl.profit - pl.tax;
  return pl;
}
function run12Months(S, biz) {
  let totalNet = 0;
  for (let m = 0; m < 12; m++) {
    const base = computeBusinessMonth(S, biz);
    const eff = roleEffects(S, biz);
    const folded = foldMonthEffects(S, base, eff);
    totalNet += folded.net;
    biz.repeatRate = clamp01((Number(biz.repeatRate) || 0.5) + eff.repeatRateDelta);
    nextMonth(S);
  }
  return totalNet;
}

/* ---- 1. Every role moves its real number (measured) ---- */
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Measured Bistro');
  const cases = [
    { role: 'chef', skill: 80, field: 'repeatRateDelta', want: (v) => v > 0, label: 'repeat customers' },
    { role: 'chef', skill: 80, field: 'revenueMult', want: (v) => v > 1, label: 'price tolerance' },
    { role: 'waiter', skill: 80, field: 'revenueAdd', want: (v) => v > 0, label: 'covers / extra sales' },
    { role: 'cashier', skill: 80, field: 'costAdd', want: (v) => v < 0, label: 'theft + till savings' },
    { role: 'driver', skill: 80, field: 'revenueAdd', want: (v) => v > 0, label: 'delivery reach' },
    { role: 'marketing', skill: 80, field: 'revenueAdd', want: (v) => v > 0, label: 'new customers' },
    { role: 'bookkeeper', skill: 80, field: 'costAdd', want: (v) => v < 0, label: 'tax mistakes / late fees' }
  ];
  for (const c of cases) {
    const e = emp(`x_${c.role}`, `Test ${c.role}`, c.role, c.skill);
    const r = roleEffectForEmployee(S, biz, e);
    console.log(`  MEASURE ${c.role} skill-${c.skill}: ${c.field} = ${r[c.field]} (${c.label})`);
    check(`role ${c.role} skill-80 moves ${c.field} ${c.label}`, c.want(r[c.field]), `got ${r[c.field]}`);
  }
  /* Same-role numbers at skill 80, monthlyRev 200000 (EGP): */
  const chef80 = roleEffectForEmployee(S, biz, emp('c80', 'Chef', 'chef', 80));
  check('chef-80 repeatRateDelta is +0.036 (6% of q=0.6)', Math.abs(chef80.repeatRateDelta - 0.036) < 1e-9, `got ${chef80.repeatRateDelta}`);
  const waiter80 = roleEffectForEmployee(S, biz, emp('w80', 'Waiter', 'waiter', 80));
  check('waiter-80 revenueAdd is +20800 (8% of output=1.3 x 200000)', waiter80.revenueAdd === 20800, `got ${waiter80.revenueAdd}`);
  const cashier80 = roleEffectForEmployee(S, biz, emp('k80', 'Cashier', 'cashier', 80));
  check('cashier-80 costAdd is -7800 (saves 3% of output=1.3 x 200000)', cashier80.costAdd === -7800, `got ${cashier80.costAdd}`);
  const driver80 = roleEffectForEmployee(S, biz, emp('d80', 'Driver', 'driver', 80));
  check('driver-80 revenueAdd is +15600 (6% of output=1.3 x 200000)', driver80.revenueAdd === 15600, `got ${driver80.revenueAdd}`);
  const mkt80 = roleEffectForEmployee(S, biz, emp('m80', 'Marketer', 'marketing', 80));
  check('marketing-80 revenueAdd is +20800 (8% of output=1.3 x 200000)', mkt80.revenueAdd === 20800, `got ${mkt80.revenueAdd}`);
  const bk80 = roleEffectForEmployee(S, biz, emp('b80', 'Bookkeeper', 'bookkeeper', 80));
  check('bookkeeper-80 costAdd is -10400 (saves 4% of output=1.3 x 200000)', bk80.costAdd === -10400, `got ${bk80.costAdd}`);
}

/* ---- 2. Skill 80 vs skill 40, same role, 12 months (measured) ---- */
{
  for (const role of ['chef', 'waiter', 'cashier']) {
    const S80 = adultLife(4242); const S40 = adultLife(4242);
    const b80 = mkBiz('restaurant', 'Twin A'); const b40 = mkBiz('restaurant', 'Twin B');
    b80.staff = [emp('t1', 'Twin', role, 80)];
    b40.staff = [emp('t1', 'Twin', role, 40)];
    const net80 = run12Months(S80, b80);
    const net40 = run12Months(S40, b40);
    console.log(`  MEASURE 12-month net, ${role}: skill-80 = ${net80}, skill-40 = ${net40}, gap = ${net80 - net40}`);
    check(`skill-80 ${role} earns more than skill-40 over 12 months`, net80 > net40, `80:${net80} 40:${net40}`);
  }
}

/* ---- 3. A bad hire hurts a real number (measured) ---- */
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Bad Hire Bistro');
  const badChef = roleEffectForEmployee(S, biz, emp('bc', 'Bad Chef', 'chef', 20));
  console.log(`  MEASURE bad chef skill-20: repeatRateDelta = ${badChef.repeatRateDelta}, revenueMult = ${badChef.revenueMult}`);
  check('skill-20 chef LOSES repeat customers', badChef.repeatRateDelta < 0, `got ${badChef.repeatRateDelta}`);
  check('skill-20 chef revenueMult is below 1', badChef.revenueMult < 1, `got ${badChef.revenueMult}`);
  const lazyWaiter = roleEffectForEmployee(S, biz, emp('lw', 'Lazy Waiter', 'waiter', 20));
  console.log(`  MEASURE lazy waiter skill-20: revenueAdd = ${lazyWaiter.revenueAdd}, revenueMult = ${lazyWaiter.revenueMult}`);
  check('lazy waiter (skill 20) loses sales', lazyWaiter.revenueAdd < 0, `got ${lazyWaiter.revenueAdd}`);
  check('lazy waiter revenueMult is below 1', lazyWaiter.revenueMult < 1, `got ${lazyWaiter.revenueMult}`);
  const thief = roleEffectForEmployee(S, biz, emp('th', 'Thief Cashier', 'cashier', 30, { dishonest: true }));
  console.log(`  MEASURE dishonest cashier skill-30: costAdd = ${thief.costAdd} (theft 2% of 200000 = 4000 inside it)`);
  check('dishonest cashier costs money (theft shows as a cost)', thief.costAdd > 0, `got ${thief.costAdd}`);
  check('dishonest cashier theft is at least 4000 (2% of monthlyRev)', thief.costAdd >= 4000, `got ${thief.costAdd}`);
  const honestBad = roleEffectForEmployee(S, biz, emp('hb', 'Slow Cashier', 'cashier', 30, { dishonest: false }));
  check('honest but unskilled cashier still costs money (slow till)', honestBad.costAdd > 0, `got ${honestBad.costAdd}`);
  const eff = roleEffects(S, { ...biz, staff: [emp('bc', 'Bad Chef', 'chef', 20)] });
  check('bad-chef note names the loss in plain words', eff.notes.some(n => /drifting away/.test(n)), JSON.stringify(eff.notes));
  const effThief = roleEffects(S, { ...biz, staff: [emp('th', 'Thief Cashier', 'cashier', 30, { dishonest: true })] });
  check('thief note says the till never adds up', effThief.notes.some(n => /till never adds up/.test(n)), JSON.stringify(effThief.notes));
}

/* ---- 4. Training raises skill by the stated amount ---- */
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Training Bistro');
  biz.staff = [emp('tr1', 'Trainee', 'waiter', 60)];
  const before = biz.staff[0].skill;
  const cashBefore = S.money.cash;
  const res = trainBusinessEmployee(S, biz, 'tr1');
  console.log(`  MEASURE training: skill ${before} -> ${biz.staff[0].skill}, cost ${res.cost} (half the 10000 wage = 5000)`);
  check('training succeeds', res.ok === true, res.msg || '');
  check(`training raises skill by exactly +${TRAIN_SKILL_GAIN}`, biz.staff[0].skill === before + TRAIN_SKILL_GAIN, `got ${biz.staff[0].skill}`);
  check('training costs half a month wage', res.cost === 5000, `got ${res.cost}`);
  check('training charges personal cash', S.money.cash === cashBefore - 5000, `cash ${S.money.cash}`);
  check('training stamps monthEffects', biz.monthEffects && typeof biz.monthEffects.revenueAdd === 'number', JSON.stringify(biz.monthEffects));
  const capped = trainBusinessEmployee(S, { ...biz, staff: [emp('tr2', 'Expert', 'waiter', 95)] }, 'tr2');
  check('training refuses at the skill cap', capped.ok === false, capped.msg || '');
}

/* ---- 5. Promotion: higher role, higher wage, bigger effect ---- */
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Promotion Bistro');
  const waiter = emp('pr1', 'Good Waiter', 'waiter', 70);
  waiter.wageLocal = roleWageLocal(S, 'waiter', 'egy');
  biz.staff = [waiter];
  const targets = promotionTargetsFor(S, biz, waiter);
  check('skilled waiter can be promoted to manager', targets.includes('manager'), JSON.stringify(targets));
  const beforeEff = roleEffects(S, biz);
  const res = promoteBusinessEmployee(S, biz, 'pr1', 'manager');
  const afterEff = roleEffects(S, biz);
  console.log(`  MEASURE promotion: waiter wage ${roleWageLocal(S, 'waiter', 'egy')} -> manager wage ${res.newWage}; revenueMult ${beforeEff.revenueMult} -> ${afterEff.revenueMult}`);
  check('promotion succeeds', res.ok === true, res.msg || '');
  check('promotion changes the role', biz.staff[0].role === 'manager', biz.staff[0].role);
  check('promotion raises the wage', res.newWage > roleWageLocal(S, 'waiter', 'egy'), `got ${res.newWage}`);
  check('promotion lifts morale +10', biz.staff[0].morale === 80, `got ${biz.staff[0].morale}`);
  check('promotion grows the revenue effect', afterEff.revenueMult > beforeEff.revenueMult, `${beforeEff.revenueMult} -> ${afterEff.revenueMult}`);
  check('promotion stamps monthEffects', biz.monthEffects && biz.monthEffects.revenueMult === afterEff.revenueMult, JSON.stringify(biz.monthEffects));
  const weak = emp('pr2', 'Weak Waiter', 'waiter', 40);
  const biz2 = mkBiz('restaurant', 'Weak Bistro'); biz2.staff = [weak];
  const refused = promoteBusinessEmployee(S, biz2, 'pr2', 'manager');
  check('promotion refuses below skill 60', refused.ok === false, refused.msg || '');
}

/* ---- 6. Hiring and firing stamp monthEffects; firing has real costs ---- */
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Hire Bistro');
  biz.staff = [];
  const hired = hireBusinessEmployee(S, biz, 'chef');
  check('hiring a chef succeeds', hired.ok === true, hired.msg || '');
  check('hire stamps monthEffects with the chef effect', biz.monthEffects && biz.monthEffects.repeatRateDelta !== 0, JSON.stringify(biz.monthEffects));
  check('hire message states the role effect', /regulars|food quality/.test(hired.msg), hired.msg);
  const survivor = biz.staff[0];
  const moraleBefore = survivor.morale;
  const second = hireBusinessEmployee(S, biz, 'waiter');
  check('second hire succeeds', second.ok === true, second.msg || '');
  const fired = fireBusinessEmployee(S, biz, second.employee.id);
  check('firing succeeds', fired.ok === true, fired.msg || '');
  check('firing costs severance', fired.severance > 0, `got ${fired.severance}`);
  check('firing shakes survivors morale -8', survivor.morale === moraleBefore - 8, `${moraleBefore} -> ${survivor.morale}`);
  check('fire re-stamps monthEffects (only the chef left)', biz.monthEffects && biz.staff.length === 1, JSON.stringify(biz.monthEffects));
  const badRole = hireBusinessEmployee(S, biz, 'astronaut');
  check('hiring a role the type does not hire is refused', badRole.ok === false, badRole.msg || '');
}

/* ---- 7. Every type hires >= 4 real roles; every role has a named effect ---- */
{
  const typeIds = new Set();
  for (const r of (V1_BUSINESS_TYPES || [])) typeIds.add(r.id);
  let thin = [];
  let missingEffect = new Set();
  for (const id of typeIds) {
    const roles = staffRolesForType(id);
    if (roles.length < 4) thin.push(`${id}(${roles.length})`);
    for (const role of roles) {
      if (!ROLE_EFFECTS[String(role).toLowerCase()]) missingEffect.add(role);
    }
  }
  /* Types only reachable through the industry defaults: */
  for (const id of ['roastery_chain', 'saas_ai_agency', 'software_studio', 'dental_center', 'community_pharmacy', 'prop_brokerage', 'car_rental_fleet', 'cold_logistics']) {
    const roles = staffRolesForType(id);
    if (roles.length < 4) thin.push(`${id}(${roles.length})`);
    for (const role of roles) if (!ROLE_EFFECTS[String(role).toLowerCase()]) missingEffect.add(role);
  }
  console.log(`  MEASURE types checked: ${typeIds.size} V1 + 8 default-only; thin types: ${thin.join(', ') || 'none'}`);
  check('no business type hires fewer than 4 roles', thin.length === 0, thin.join(', '));
  check('every hireable role has a named effect (no silent fallback)', missingEffect.size === 0, [...missingEffect].join(', '));
  for (const role of ['chef', 'waiter', 'cashier', 'driver', 'marketing', 'bookkeeper']) {
    check(`hire blurb for ${role} names the effect in plain words`, /regulars|till|covers|deliver|new customers|books|tax/.test(roleHireBlurb(role)), roleHireBlurb(role));
  }
}

/* ---- 8. Staff list render: role, wage, skill, effect per person ---- */
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Render Bistro');
  biz.staff = [
    emp('r1', 'Amira Chef', 'chef', 80),
    emp('r2', 'Omar Waiter', 'waiter', 40)
  ];
  biz.staff[0].wageLocal = 15000; biz.staff[1].wageLocal = 8000;
  const html = renderStaffListHtml(S, biz);
  const text = strip(html);
  console.log(`  MEASURE staff list text: ${text.slice(0, 300)}...`);
  check('staff list shows the chef role', /Chef/.test(text), text.slice(0, 200));
  check('staff list shows a wage per person', /15,?000/.test(text), text.slice(0, 300));
  check('staff list shows skill per person', /skill 80/.test(text) && /skill 40/.test(text), text.slice(0, 300));
  check('staff list shows what the chef does (regulars)', /regulars coming back/.test(text), text.slice(0, 400));
  check('staff list shows waiter output', /brings in extra sales/.test(text), text.slice(0, 400));
  check('staff list has a Train button stating +8 skill and cost', /Train \(\+8 skill/.test(text), text.slice(0, 500));
  check('staff list has a Promote button', /Promote to/.test(text), text.slice(0, 500));
  check('staff list has a Fire button', /Fire/.test(text), text.slice(0, 500));
  check('hire buttons state the effect before hiring', /Hire Chef.*food quality|Hire Chef.*regulars/.test(text), text.slice(0, 600));
}

/* ---- 9. monthEffects contract shape ---- */
{
  const S = adultLife();
  const biz = mkBiz('restaurant', 'Contract Bistro');
  biz.staff = [];
  const empty = roleEffects(S, biz);
  check('empty staff: revenueMult 1', empty.revenueMult === 1, JSON.stringify(empty));
  check('empty staff: revenueAdd/costAdd/repeatRateDelta/moraleDelta 0', empty.revenueAdd === 0 && empty.costAdd === 0 && empty.repeatRateDelta === 0 && empty.moraleDelta === 0, JSON.stringify(empty));
  check('empty staff: notes []', Array.isArray(empty.notes) && empty.notes.length === 0, JSON.stringify(empty));
  biz.staff = [emp('s1', 'Solo Chef', 'chef', 80)];
  const stamped = stampMonthEffects(S, biz);
  check('stampMonthEffects returns the same object it stores', stamped === biz.monthEffects, '');
  check('stamp is the pure roleEffects result', JSON.stringify(stamped) === JSON.stringify(roleEffects(S, biz)), '');
  check('roleEffects is pure (calling twice gives the same result)', JSON.stringify(roleEffects(S, biz)) === JSON.stringify(roleEffects(S, biz)), '');
}

console.log(`\nW3-VERIFY: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
