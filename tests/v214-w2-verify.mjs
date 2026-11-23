/* v2.14 §2 verify — Business Manager (Worker 2). Run from the game root:
   node tests/v214-w2-verify.mjs
   Covers: shortlist hire, skill 80 vs 40 over 12 months (counted),
   policy Growth vs Safe vs Harvest (counted), embezzlement + false
   accusation + lawsuit, quit -> unmanaged, promote from within. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { hashSeed } from '../src/core/rng.js';
import { computeBusinessMonth } from '../src/systems/businessEngine.js';
import {
  managerShortlist, hireManager, applyManagerEffects, tickManagerMonth,
  setManagerPolicy, generateManagerAsk, answerManagerAsk,
  forceEmbezzlementSkim, embezzlementClues, investigationCost,
  investigateEmbezzlement, sueManagerCost, sueManager,
  managerQuits, fireManager, managerSeveranceFor,
  promoteStaffToManager, listPromotableStaff,
  takeOverBusiness, isUnmanaged, isManaged,
  postManagerSalary, renderManagerSectionHtml,
  businessSizeTier, goingRateForSkill,
  PROMOTE_MIN_SKILL, PROMOTE_MIN_MORALE
} from '../src/systems/businessManager.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};

function adultLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.reputation = 80;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkBiz(id, name, rev, cost, capital) {
  return {
    id, typeId: 'cafe', name, country: 'egy', city: 'Cairo', level: 2, maxLevel: 5, volatility: 0.05,
    monthlyRev: rev, monthlyCost: cost, capitalInvested: capital, reputation: 58, mode: 'full_time',
    staff: [
      { id: 's1', name: 'Aya', role: 'barista', wageLocal: 8000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 },
      { id: 's2', name: 'Omar', role: 'waiter', wageLocal: 7000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 },
      { id: 's3', name: 'Mona', role: 'manager', wageLocal: 12000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 }
    ],
    premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: [], heirId: null, remote: false, foundedYear: 2022, foundedMonth: 3,
    manager: null, ownerManaged: true, ownerHoursPerWeek: 40
  };
}
/* One simulated month the way the coordinator will wire it: the P&L
   revenue times the manager's revenue multiplier, after applying the
   manager's morale effect to the team. The rng is re-seeded per month
   so the two runs being compared face the identical wave. */
function simMonth(S, biz, month) {
  S.month = month;
  const fx = applyManagerEffects(S, biz);
  for (const e of biz.staff) e.morale = Math.max(5, Math.min(100, (Number(e.morale) || 0) + fx.moraleDelta));
  S.rngState = hashSeed(7000 + month);
  const pl = computeBusinessMonth(S, biz);
  return { revenue: Math.round(pl.revenue * fx.revenueMult), fx };
}

/* ================= (a) hire from a shortlist ================= */
console.log('--- (a) hire from a shortlist ---');
{
  const S = adultLife();
  const biz = mkBiz('biz_a', 'Hire Café', 200000, 50000, 500000);
  S.career.businesses = [biz]; S.career.business = biz;
  console.log('business size tier:', businessSizeTier(S, biz));
  const list = managerShortlist(S, biz);
  console.log('shortlist:', list.map(c => `${c.name} (${c.tier}, skill ${c.skill}, wage ${c.wage}, loyalty ${c.loyalty})`).join(' | '));
  check('shortlist has named people with skill/wage/loyalty', list.length >= 2 && list.every(c => c.name && typeof c.skill === 'number' && c.wage > 0 && typeof c.loyalty === 'number'), `n=${list.length}`);
  check('a medium business does not attract a senior CEO', list.every(c => c.tier !== 'senior'), list.map(c => c.tier).join(','));
  const big = mkBiz('biz_big', 'Big Café', 2000000, 500000, 5000000);
  const bigList = managerShortlist(S, big);
  console.log('large-business shortlist tiers:', bigList.map(c => c.tier).join(','));
  check('a large business DOES attract a senior manager', bigList.some(c => c.tier === 'senior'), bigList.map(c => c.tier).join(','));
  const cand = list[0];
  const cashBefore = S.money.cash;
  const h = hireManager(S, biz, cand);
  check('hire ok', h.ok, h.msg);
  check('hiring sets biz.manager with the contract shape', !!biz.manager && biz.manager.name === cand.name && biz.manager.skill === cand.skill && biz.manager.wage === cand.wage && typeof biz.manager.loyalty === 'number' && biz.manager.policy === 'safe' && biz.manager.personId === cand.personId, JSON.stringify(biz.manager));
  check('hiring costs exactly one month wage', S.money.cash === cashBefore - cand.wage, `${cashBefore} -> ${S.money.cash}, wage ${cand.wage}`);
  check('hiring posts its own onboarding ledger line', S.ledger.some(l => l.label && l.label.startsWith(`Onboarding — ${cand.name}`)), '');
  check('hired manager stops owner-hours (owner no longer runs it)', biz.ownerManaged === false && biz.ownerHoursPerWeek === 0, `ownerManaged=${biz.ownerManaged} hrs=${biz.ownerHoursPerWeek}`);
  const h2 = hireManager(S, biz, list[1]);
  check('second hire refused while a manager is in place', !h2.ok, h2.msg);
  /* Salary in the P&L: costDelta IS the wage, and the direct call posts it. */
  const fx = applyManagerEffects(S, biz);
  check('applyManagerEffects returns the wage as costDelta', fx.costDelta === biz.manager.wage, `costDelta=${fx.costDelta} wage=${biz.manager.wage}`);
  const cash2 = S.money.cash;
  const paid = postManagerSalary(S, biz);
  check('direct salary call posts one ledger line for exactly the wage', paid.ok && paid.amount === biz.manager.wage && S.money.cash === cash2 - biz.manager.wage && S.ledger.some(l => l.label && l.label.startsWith(`Manager salary — ${cand.name}`)), JSON.stringify(paid));
  /* Policy + an ask. */
  const pol = setManagerPolicy(S, biz, 'growth');
  check('policy set to growth', pol.ok && biz.manager.policy === 'growth', pol.msg);
  const ask = generateManagerAsk(S, biz, 'raise');
  check('manager ask queued with id/kind/text/cost', !!ask && ask.kind === 'raise' && typeof ask.text === 'string' && biz.managerAsks.length === 1, JSON.stringify(ask));
  const wageBefore = biz.manager.wage, loyBefore = biz.manager.loyalty;
  const ans = answerManagerAsk(S, biz, ask.id, true);
  check('accepting a raise lifts wage 10% and loyalty', ans.ok && biz.manager.wage === Math.round(wageBefore * 1.1) && biz.manager.loyalty > loyBefore, `wage ${wageBefore}->${biz.manager.wage} loyalty ${loyBefore}->${biz.manager.loyalty}`);
  const ask2 = generateManagerAsk(S, biz, 'bonus');
  const loy2 = biz.manager.loyalty;
  const ans2 = answerManagerAsk(S, biz, ask2.id, false);
  check('declining a bonus costs loyalty', ans2.ok && biz.manager.loyalty < loy2, `${loy2} -> ${biz.manager.loyalty}`);
  const html = renderManagerSectionHtml(S, biz);
  check('manager card names the manager, wage, loyalty and policy buttons', html.includes(biz.manager.name) && html.includes('Growth') && html.includes('Fire manager'), '');
}

/* ================= (b) skill 80 vs 40, 12 months, counted ================= */
console.log('--- (b) skill 80 vs 40 over 12 months ---');
{
  const run = (skill) => {
    const S = adultLife();
    const biz = mkBiz('biz_b', 'Skill Café', 200000, 50000, 500000);
    S.career.businesses = [biz]; S.career.business = biz;
    biz.manager = { name: 'Test Manager', skill, wage: 20000, loyalty: 60, policy: 'safe', hiredYear: 2026, hiredMonth: 1, personId: 'mgr_test' };
    biz.ownerManaged = false; biz.ownerHoursPerWeek = 0;
    let total = 0;
    const monthly = [];
    for (let m = 1; m <= 12; m++) {
      const r = simMonth(S, biz, m);
      total += r.revenue;
      monthly.push(r.revenue);
    }
    return { total, monthly, endMorale: biz.staff.map(e => Math.round(e.morale)) };
  };
  const hi = run(80), lo = run(40);
  console.log('skill 80 — 12-month revenue:', hi.total, '| monthly:', hi.monthly.join(', '), '| end staff morale:', hi.endMorale.join(','));
  console.log('skill 40 — 12-month revenue:', lo.total, '| monthly:', lo.monthly.join(', '), '| end staff morale:', lo.endMorale.join(','));
  console.log('margin:', `${((hi.total / lo.total - 1) * 100).toFixed(1)}% more revenue with skill 80`);
  check('skill 80 beats skill 40 by a real margin (>15%)', hi.total > lo.total * 1.15, `${hi.total} vs ${lo.total}`);
  check('skill 80 leaves the team happier than skill 40', hi.endMorale[0] > lo.endMorale[0], `${hi.endMorale} vs ${lo.endMorale}`);
}

/* ================= (c) policy Growth vs Safe vs Harvest, counted ================= */
console.log('--- (c) policy Growth vs Safe vs Harvest over 12 months ---');
{
  const run = (policy) => {
    const S = adultLife();
    const biz = mkBiz('biz_c', 'Policy Café', 200000, 50000, 500000);
    S.career.businesses = [biz]; S.career.business = biz;
    biz.manager = { name: 'Test Manager', skill: 65, wage: 20000, loyalty: 60, policy, hiredYear: 2026, hiredMonth: 1, personId: 'mgr_test' };
    biz.ownerManaged = false; biz.ownerHoursPerWeek = 0;
    let total = 0, harvestOut = 0, reinvest = 0;
    const monthly = [];
    for (let m = 1; m <= 12; m++) {
      S.month = m;
      const fx = applyManagerEffects(S, biz);
      for (const e of biz.staff) e.morale = Math.max(5, Math.min(100, (Number(e.morale) || 0) + fx.moraleDelta));
      S.rngState = hashSeed(7000 + m);
      const pl = computeBusinessMonth(S, biz);
      /* Policy risk: the same uniform draw each month, scaled by the
         policy's own variance — growth swings widest by construction. */
      S.rngState = hashSeed(9000 + m);
      const draw = (() => { let t = (S.rngState = (S.rngState + 0x6D2B79F5) >>> 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; })();
      const wave = 1 + (draw - 0.5) * 2 * fx.revenueVariance;
      const rev = Math.round(pl.revenue * fx.revenueMult * wave);
      total += rev;
      monthly.push(rev);
      harvestOut += fx.harvestCashOut;
      reinvest += fx.reinvestAmount;
    }
    const mean = total / 12;
    const sd = Math.sqrt(monthly.reduce((a, r) => a + (r - mean) ** 2, 0) / 12);
    return { total, monthly, sd: Math.round(sd), harvestOut, reinvest };
  };
  const g = run('growth'), s = run('safe'), h = run('harvest');
  console.log('Growth  — 12-mo revenue:', g.total, '| monthly sd:', g.sd, '| reinvested:', g.reinvest);
  console.log('Safe    — 12-mo revenue:', s.total, '| monthly sd:', s.sd);
  console.log('Harvest — 12-mo revenue:', h.total, '| monthly sd:', h.sd, '| cash taken out:', h.harvestOut);
  check('Growth earns most, Safe middle, Harvest least', g.total > s.total && s.total > h.total, `${g.total} > ${s.total} > ${h.total}`);
  check('Growth beats Harvest by >10%', g.total > h.total * 1.10, `${g.total} vs ${h.total}`);
  check('Growth swings widest (highest monthly sd)', g.sd > s.sd && s.sd >= h.sd, `sd ${g.sd} vs ${s.sd} vs ${h.sd}`);
  check('Harvest takes real cash out (12 x 10% of monthly revenue)', h.harvestOut === 12 * Math.round(200000 * 0.10), `cash out=${h.harvestOut}`);
  check('Growth reinvests real money (12 x 8% of monthly revenue)', g.reinvest === 12 * Math.round(200000 * 0.08), `reinvested=${g.reinvest}`);
  check('Growth costs more than Safe (salary + reinvestment in costDelta)', applyManagerEffects(adultLife(), (() => { const b = mkBiz('x', 'X', 200000, 50000, 500000); b.manager = { name: 'M', skill: 65, wage: 20000, loyalty: 60, policy: 'growth', hiredYear: 2026, hiredMonth: 1, personId: 'm' }; return b; })()).costDelta > 20000, '');
}

/* ================= (d) embezzlement ================= */
console.log('--- (d) embezzlement ---');
{
  const S = adultLife();
  const biz = mkBiz('biz_d', 'Skim Café', 200000, 50000, 500000);
  S.career.businesses = [biz]; S.career.business = biz;
  const cand = managerShortlist(S, biz)[0];
  hireManager(S, biz, cand);
  biz.manager.loyalty = 10; /* disloyal by construction */
  const cashBefore = S.money.cash;
  const s1 = forceEmbezzlementSkim(S, biz, 20000);
  const s2 = forceEmbezzlementSkim(S, biz, 15000);
  const s3 = forceEmbezzlementSkim(S, biz, 10000);
  console.log('skimmed:', s1.skimmed, s2.skimmed, s3.skimmed, '| stolen total:', s3.stolenTotal);
  console.log('clues:', embezzlementClues(S, biz));
  check('three skims total 45,000 stolen', s3.stolenTotal === 45000, `stolen=${s3.stolenTotal}`);
  check('cash fell by exactly the stolen amount', S.money.cash === cashBefore - 45000, `${cashBefore} -> ${S.money.cash}`);
  check('clues appear: books do not add up, then a supplier complains', embezzlementClues(S, biz).length >= 2 && /books.*do not add up/.test(embezzlementClues(S, biz)[0]) && /supplier/i.test(embezzlementClues(S, biz)[1]), embezzlementClues(S, biz).join(' | '));
  const quote = investigationCost(S, biz);
  console.log('investigation quote:', quote.text);
  check('investigation cost and time stated before committing', quote.cost > 0 && quote.timeMonths === 1, quote.text);
  const cashInv = S.money.cash;
  const inv = investigateEmbezzlement(S, biz);
  console.log('investigation:', inv.msg, '| recovered:', inv.recovered, 'of', inv.stolenTotal);
  check('investigation finds the truth', inv.ok && inv.found === true && inv.stolenTotal === 45000, inv.msg);
  check('half the money is recovered (22,500 of 45,000)', inv.recovered === 22500 && inv.recoveryFraction === 0.5, `recovered=${inv.recovered}`);
  check('caught manager is fired with no severance, business unmanaged', biz.manager === null && isUnmanaged(biz) && biz.ownerManaged === false, `manager=${biz.manager} unmanaged=${isUnmanaged(biz)}`);
  check('no severance ledger line for a caught thief', !S.ledger.some(l => l.label && l.label.startsWith(`Severance — ${cand.name}`)), '');
  const cashSue = S.money.cash;
  const sq = sueManagerCost(S, biz);
  console.log('lawsuit quote:', sq.text);
  const sue = sueManager(S, biz);
  console.log('lawsuit:', sue.msg, '| won:', sue.won, '| recovered:', sue.recovered);
  check('lawsuit runs: cost charged, win recovers money, loss recovers nothing', sue.ok && (sue.won ? sue.recovered > 0 : sue.recovered === 0) && S.money.cash === cashSue - sue.cost + sue.recovered, JSON.stringify(sue));
  /* False accusation on a clean manager. */
  const S2 = adultLife();
  const biz2 = mkBiz('biz_d2', 'Clean Café', 200000, 50000, 500000);
  S2.career.businesses = [biz2]; S2.career.business = biz2;
  const cand2 = managerShortlist(S2, biz2)[0];
  hireManager(S2, biz2, cand2);
  biz2.manager.loyalty = 70;
  const inv2 = investigateEmbezzlement(S2, biz2);
  console.log('false accusation: loyalty 70 ->', biz2.manager.loyalty);
  check('false accusation clears the manager and costs 15 loyalty', inv2.ok && inv2.found === false && biz2.manager.loyalty === 55, `loyalty=${biz2.manager.loyalty} ${inv2.msg}`);
  check('falsely accused manager keeps their job', biz2.manager !== null && biz2.manager.name === cand2.name, '');
}

/* ================= (e) manager quits -> unmanaged ================= */
console.log('--- (e) manager quits at low loyalty ---');
{
  const S = adultLife();
  const biz = mkBiz('biz_e', 'Quit Café', 200000, 50000, 500000);
  S.career.businesses = [biz]; S.career.business = biz;
  const cand = managerShortlist(S, biz)[0];
  hireManager(S, biz, cand);
  biz.manager.loyalty = 5;
  const moraleBefore = biz.staff.map(e => e.morale);
  const t = tickManagerMonth(S, biz);
  console.log('tick result:', JSON.stringify({ quit: t.quit, reason: t.reason, loyalty: t.loyalty }));
  check('low-loyalty tick makes the manager quit', t.quit === true && biz.manager === null, JSON.stringify(t));
  check('quit leaves the business unmanaged (no manager, no owner-hours)', isUnmanaged(biz) && biz.ownerManaged === false && biz.ownerHoursPerWeek === 0 && biz.manager === null, `unmanaged=${isUnmanaged(biz)} ownerManaged=${biz.ownerManaged} hrs=${biz.ownerHoursPerWeek}`);
  check('quit shakes the team (morale -5)', biz.staff.every((e, i) => e.morale === moraleBefore[i] - 5), `${moraleBefore} -> ${biz.staff.map(e => e.morale)}`);
  check('quit is journalled and the player is told in a scene', S.journal.some(j => j.text && j.text.includes('quit')) && [S.activeScene, ...(S.sceneQueue || [])].filter(Boolean).some(s => /quit/.test(s.title || '')), '');
  const back = takeOverBusiness(S, biz);
  check('owner can take the business over again (managed, hours back)', back.ok && isManaged(biz) && biz.ownerHoursPerWeek === 40, back.msg);
}

/* ================= (f) promote from within ================= */
console.log('--- (f) promote from within ---');
{
  const S = adultLife();
  const biz = mkBiz('biz_f', 'Promote Café', 200000, 50000, 500000);
  S.career.businesses = [biz]; S.career.business = biz;
  biz.staff = [
    { id: 'p1', name: 'Layla Star', role: 'chef', wageLocal: 10000, morale: 85, skill: 75, hiredYear: 2023, hiredMonth: 1 },
    { id: 'p2', name: 'Omar Plain', role: 'waiter', wageLocal: 7000, morale: 50, skill: 50, hiredYear: 2024, hiredMonth: 1 }
  ];
  biz.employees = 2;
  const outsideWage = goingRateForSkill(S, biz, 75);
  console.log('outside hire for skill 75 would ask:', outsideWage, '/month');
  const cashBefore = S.money.cash;
  const p = promoteStaffToManager(S, biz, 'p1');
  console.log('promoted:', JSON.stringify({ wage: p.wage, loyalty: p.manager?.loyalty, skill: p.manager?.skill, outsideWage: p.outsideWage, hiringFeeSaved: p.hiringFeeSaved }));
  check('promote ok', p.ok, p.msg);
  check('promoted manager is the staff member, now off the team', biz.manager && biz.manager.name === 'Layla Star' && !biz.staff.some(e => e.id === 'p1'), JSON.stringify(biz.manager));
  check('promotion costs no hiring fee (cash untouched)', S.money.cash === cashBefore, `${cashBefore} -> ${S.money.cash}`);
  check('promoted wage is cheaper than hiring outside', p.wage < p.outsideWage, `promoted ${p.wage} vs outside ${p.outsideWage}`);
  check('loyalty starts high (75)', biz.manager.loyalty === 75, `loyalty=${biz.manager.loyalty}`);
  check('skill starts lower than on the tools (75 -> 65)', biz.manager.skill === 65 && biz.manager.skill < 75, `skill=${biz.manager.skill}`);
  check('promotable list finds the qualified staffer', listPromotableStaff(S, (() => { const b = mkBiz('z', 'Z', 200000, 50000, 500000); b.staff = [{ id: 'q1', name: 'Q', role: 'chef', wageLocal: 10000, morale: 85, skill: 75, hiredYear: 2023, hiredMonth: 1 }]; return b; })()).length === 1, '');
  /* Refusal names the requirement. */
  const S2 = adultLife();
  const biz2 = mkBiz('biz_f2', 'Refuse Café', 200000, 50000, 500000);
  S2.career.businesses = [biz2]; S2.career.business = biz2;
  biz2.staff = [{ id: 'r1', name: 'Tired Tom', role: 'waiter', wageLocal: 7000, morale: 50, skill: 50, hiredYear: 2024, hiredMonth: 1 }];
  const r = promoteStaffToManager(S2, biz2, 'r1');
  console.log('refusal:', r.msg);
  check('unqualified staffer refused plainly, naming skill/morale bar', !r.ok && new RegExp(`${PROMOTE_MIN_SKILL}`).test(r.msg) && new RegExp(`${PROMOTE_MIN_MORALE}`).test(r.msg) && r.msg.includes('50'), r.msg);
  check('nobody qualifies: refusal says so', !promoteStaffToManager(S2, biz2, 'nobody').ok, '');
  /* Fire: severance under the country's law, survivors shaken. */
  const S3 = adultLife();
  const biz3 = mkBiz('biz_f3', 'Fire Café', 200000, 50000, 500000);
  S3.career.businesses = [biz3]; S3.career.business = biz3;
  const cand3 = managerShortlist(S3, biz3)[0];
  hireManager(S3, biz3, cand3);
  const sev = managerSeveranceFor(S3, biz3);
  console.log('manager severance (Egypt, hired this month):', sev.months, 'month(s),', sev.amount);
  const morale3 = biz3.staff.map(e => e.morale);
  const cash3 = S3.money.cash;
  const f = fireManager(S3, biz3);
  check('fire ok, severance paid from cash, manager gone, unmanaged', f.ok && f.severance === sev.amount && S3.money.cash === cash3 - sev.amount && biz3.manager === null && isUnmanaged(biz3), f.msg);
  check('firing shakes survivors (morale -8)', biz3.staff.every((e, i) => e.morale === morale3[i] - 8), '');
  check('render with no manager shows candidates + promote controls', renderManagerSectionHtml(S3, biz3).includes('Candidates for') && renderManagerSectionHtml(S3, biz3).includes('Hire'), '');
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
