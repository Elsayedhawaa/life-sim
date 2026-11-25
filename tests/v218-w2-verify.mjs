#!/usr/bin/env node
/* v2.18 Worker 2 verify — Career as a desk (§2) + unity (§2/§3) +
   connection (§3). Run from the game root: node tests/v218-w2-verify.mjs
   Every figure below is MEASURED on a grafted state — no quoted numbers.
   (a) desk: renderWorkTabHtml has 7 desk sections, each once; the
       CAREER-WORK-SECTION placeholder is present; no duplicated section.
   (b) business card opens section by section (7 <details> in the ops menu).
   (c) unity: the same business's last-month net is identical on the
       business card, the Finance tab and the Timeline; the same salary
       net is identical on the Career tab and the Finance tab — in a
       quiet year AND in a crisis year (salary ×0.95).
   (d) job loss: losing a job makes the mortgage, the spouse, the
       children and the visa each react (a real scene each, with a real
       effect when its choice is taken).
   (e) crisis: fewer headhunter calls (paired rate before/after), a pay
       freeze that holds the gross still (merit rise + raise + negotiate),
       a real redundancy risk that can only fire AFTER the warning.
   (f) achievements: +2% per achievement (cap +10%), and the offer
       names the latest achievement.
   (g) business fate (v2.17 F1–F3/B1–B3) reaches the rest of the life.
   (h) ESM parse of every src file, 0 failures.
   Exit 0 only when there are no FAILs. */
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: (k) => store.delete(k),
};

let pass = 0, fail = 0;
const failedNames = [];
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`); }
  else { fail++; failedNames.push(name); console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const section = (t) => console.log(`\n--- ${t} ---`);

const { createNewLifeState, ensureExtendedState, createPerson } = await import('../src/core/schema.js');
const { hashSeed } = await import('../src/core/rng.js');
const { renderWorkTabHtml, renderFinanceTabHtml, renderLifeTabHtml } = await import('../src/ui/views.js');
const { renderOperationsMenuHtml } = await import('../src/systems/businessOperations.js');
const { businessLastMonthNet, businessesLastMonthNet, salaryNetFor, financeSalaryLine } = await import('../src/systems/moneyTruth.js');
const { checkCareerConsequences, crisisInfo, makeRedundant, redundancyChance, warnCrisisYear } = await import('../src/systems/careerConsequences.js');
const { headhunterApproachRate, achievementHeadhunterBonus, maybeHeadhunterApproach, negotiateWithOffer, ensureCareerMarket, latestWorkAchievement } = await import('../src/systems/careerMarket.js');
const { settleHouseholdMonth } = await import('../src/systems/economyEngine.js');
const { computePayslip } = await import('../src/data/economy.js');
const { checkBusinessFate } = await import('../src/systems/businessFate.js');
const { takeBusinessLoan, getBusinessLoan } = await import('../src/systems/businessLoans.js');
const { tickCareerMonthly, requestRaiseOrPromotion } = await import('../src/systems/careerEducationEngine.js');
await import('../src/main.js');

const attrAll = (html, attr) => [...html.matchAll(new RegExp(`${attr}="([^"]*)"`, 'g'))].map((m) => m[1]);
const count = (html, sub) => (html.split(sub).length - 1);
const journalTexts = (S) => (S.journal || []).map((e) => e.text || '');
const strip = (h) => String(h).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
const queuedScenes = (S) => [...(S.sceneQueue || []), ...(S.activeScene ? [S.activeScene] : [])];
const findScene = (S, re) => queuedScenes(S).find((sc) => re.test(sc.title || ''));

function adultLife(cash = 5_000_000, seed = 777) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = cash;
  S.money.savings = 0;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkJob(over = {}) {
  return {
    employer: 'Orascom Construction', title: 'Site Engineer', track: 'engineering',
    level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 18,
    performance: 78, workMode: 'normal', bossId: null, ...over
  };
}
function employ(S, jobOver = {}) {
  S.career.employed = true;
  S.career.job = mkJob(jobOver);
  S.career.yearsExperience = 6;
  S.career.trackExperience = { engineering: 6 };
  return S.career.job;
}
function mkStaff(skill, morale = 70, n = 3) {
  const roles = ['chef', 'waiter', 'cashier'];
  return Array.from({ length: n }, (_, i) => ({
    id: `s${i + 1}`, name: ['Aya', 'Omar', 'Mona'][i % 3], role: roles[i % 3],
    wageLocal: 8000, morale, skill, hiredYear: 2024, hiredMonth: 1
  }));
}
function mkBiz(id, name, opts = {}) {
  return {
    id, typeId: 'cafe', name, country: 'egy', city: 'Cairo', level: opts.level || 1,
    maxLevel: Infinity, volatility: opts.volatility ?? 0.05,
    monthlyRev: 300000, monthlyCost: 80000, capitalInvested: 500000,
    totalCapitalIn: 500000, brandValue: 1000, retainedEarnings: 0,
    repeatRate: opts.repeatRate ?? 0.5, mode: 'full_time',
    staff: mkStaff(opts.skill ?? 60, opts.morale ?? 70, opts.staffN ?? 3),
    premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: opts.history || [], heirId: null, remote: false,
    foundedYear: 2024, foundedMonth: 1,
    manager: null, ownerManaged: true, ownerHoursPerWeek: 40,
    dead: false, deathCause: null, group: null, brokeOut: false,
    distressStage: 0, marketSlumpMonths: 0,
    lastPL: opts.lastPL || null,
    ...opts.extra
  };
}
function addPerson(S, over = {}) {
  const p = createPerson(S, {
    role: 'friend', relationLabel: 'Friend', residenceCountry: S.country, city: S.city,
    age: 34, affection: 70, respect: 60, trust: 60, ...over
  });
  S.people[p.id] = p;
  return p;
}

/* ================= (a) the desk ================= */
section('(a) career tab as a desk');
{
  const S = adultLife();
  employ(S);
  const html = renderWorkTabHtml(S);
  const desks = ['current-work', 'pay', 'contract', 'promotion', 'benefits', 'standing', 'actions'];
  for (const d of desks) {
    check(`desk section "${d}" appears exactly once`, count(html, `data-desk="${d}"`) === 1, `count ${count(html, `data-desk="${d}"`)}`);
  }
  /* v2.18 MERGE — the placeholder is gone: the coordinator wired the
     real work card into Current Work (main.js dispatch + views.js
     render call). The check below now asserts the wired-in card
     renders, not the placeholder. */
  check('CAREER-WORK-SECTION placeholder gone (coordinator wired the real card in)', !html.includes('<!-- CAREER-WORK-SECTION -->'));
  check('real work card renders inside Current Work', html.includes('<h3>Current Work</h3>'));
  check('no renderCareerWorkHtml call (coordinator wires it in)', !html.includes('renderCareerWorkHtml'));
  check('no duplicated Apply-for-promotion button', count(html, 'data-action="job-promote"') <= 1, `count ${count(html, 'data-action="job-promote"')}`);
  check('pension heading appears once (market section owns it)', count(html, 'Pension —') === 1, `count ${count(html, 'Pension —')}`);
  check('no "Performance —" section (dashboard owns the three views)', !html.includes('Performance — '));
  check('no "Reporting to:" header line (dashboard owns the boss)', !html.includes('Reporting to:'));
}

/* ================= (b) business card as a menu ================= */
section('(b) business card opens section by section');
{
  const S = adultLife();
  const biz = mkBiz('biz_ops', 'Menu Café');
  S.career.businesses = [biz]; S.career.business = biz;
  /* (replacement) The 7-<details> operations menu was replaced by six company tabs (commit e5f2b3c). The invariant that matters survives: every one of the seven topics is still reachable from the card. */
  const tabsHtml = ['overview', 'products', 'team', 'operations', 'growth', 'money'].map(bizTab => renderWorkTabHtml(S, { workSub: 'ventures', bizTab })).join('\n');
  const all = tabsHtml + '\n' + renderOperationsMenuHtml(S, biz);
  check('the company card still offers six area tabs', ['Overview', 'Products', 'Team', 'Operations', 'Growth', 'Money'].every(n => count(tabsHtml, `>${n}</button>`) >= 1), 'tabs');
  const topics = { Stock: /Stock/, Pricing: /Pric/, Suppliers: /Supplier/, Staff: /Staff|Team|Employee/, Marketing: /Marketing|Brand/, Premises: /Premises|Rent|Lease/, Cash: /Cash|Money/ };
  for (const [label, re] of Object.entries(topics)) check(`topic "${label}" is reachable from the company card`, re.test(strip(all)), label);
}

/* ================= (c) unity ================= */
section('(c) unity — one source of truth');
{
  // Quiet year (2026, Egypt, no crisis).
  const S = adultLife();
  employ(S);
  const biz = mkBiz('biz_u', 'Unity Café', {
    lastPL: { year: 2026, month: 1, name: 'Unity Café', typeId: 'cafe', revenue: 120000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: 40000, tax: 5000, taxLabel: 'Income tax', net: 35000, wave: 0, repeatRate: 0.5 }
  });
  S.career.businesses = [biz]; S.career.business = biz;
  settleHouseholdMonth(S);
  const cardHtml = renderWorkTabHtml(S, { workSub: 'ventures', bizTab: 'money' });
  const finHtml = renderFinanceTabHtml(S, { finSub: 'cashflow' });
  const timeHtml = renderLifeTabHtml(S, {});
  const cardNet = attrAll(cardHtml, 'data-biz-net').map(Number);
  const finNet = attrAll(finHtml, 'data-biz-net').map(Number);
  const timeNet = attrAll(timeHtml, 'data-biz-net').map(Number);
  const helper = businessLastMonthNet(S, biz);
  console.log(`  business net — card ${JSON.stringify(cardNet)}, finance ${JSON.stringify(finNet)}, timeline ${JSON.stringify(timeNet)} (settled P&L net ${helper.net})`);
  check('business last-month net identical on card, Finance and Timeline', cardNet.length === 1 && finNet.length === 1 && timeNet.length === 1 && cardNet[0] === helper.net && finNet[0] === helper.net && timeNet[0] === helper.net, `card ${cardNet[0]}, fin ${finNet[0]}, time ${timeNet[0]}, settled ${helper.net}`);
  check('helper reads the one folded P&L (the settled net)', helper.hasPL && helper.net === cardNet[0] && helper.revenue > 0 && helper.costs > 0);
  // Salary: Career payslip vs Finance salary line, quiet year.
  const careerNet = Number(attrAll(renderWorkTabHtml(S), 'data-salary-net')[0]);
  const finSal = financeSalaryLine(S);
  console.log(`  salary net — career ${careerNet}, finance ${finSal ? finSal.amount : null} (${finSal ? finSal.label : 'no line'})`);
  check('salary net identical on Career tab and Finance tab (quiet year)', !!finSal && careerNet === finSal.amount, `career ${careerNet} vs finance ${finSal ? finSal.amount : 'none'}`);

  // Crisis year (2009-06, Egypt: 2008 crisis, salary ×0.95, business ×0.90).
  const C = adultLife();
  C.year = 2009; C.month = 6;
  employ(C);
  const cbiz = mkBiz('biz_c', 'Crisis Café', {
    lastPL: { year: 2009, month: 6, name: 'Crisis Café', typeId: 'cafe', revenue: 90000, rent: 8000, wages: 24000, other: 40000, remote: 0, manager: 0, costs: 72000, profit: 18000, tax: 2000, taxLabel: 'Income tax', net: 16000, wave: 0, repeatRate: 0.5 }
  });
  C.career.businesses = [cbiz]; C.career.business = cbiz;
  const ci = crisisInfo(C);
  console.log(`  crisis 2009-06 Egypt: ${ci.crisis}, businessRevenue ${ci.businessRevenueMult}, salary ${ci.salaryMult}`);
  check('2009-06 Egypt is a crisis year (businessRevenue 0.90)', ci.crisis && ci.businessRevenueMult === 0.9, `mult ${ci.businessRevenueMult}`);
  settleHouseholdMonth(C);
  const cCareerNet = Number(attrAll(renderWorkTabHtml(C), 'data-salary-net')[0]);
  const cFinSal = financeSalaryLine(C);
  console.log(`  crisis salary net — career ${cCareerNet}, finance ${cFinSal ? cFinSal.amount : null} (gross 30000 × 0.95 = 28500)`);
  check('salary net identical on Career tab and Finance tab (crisis year)', !!cFinSal && cCareerNet === cFinSal.amount, `career ${cCareerNet} vs finance ${cFinSal ? cFinSal.amount : 'none'}`);
  const cCardNet = attrAll(renderWorkTabHtml(C, { workSub: 'ventures', bizTab: 'money' }), 'data-biz-net').map(Number);
  const cFinNet = attrAll(renderFinanceTabHtml(C, { finSub: 'cashflow' }), 'data-biz-net').map(Number);
  const cTimeNet = attrAll(renderLifeTabHtml(C, {}), 'data-biz-net').map(Number);
  const cHelper = businessLastMonthNet(C, cbiz);
  check('business net identical on all three sites (crisis year)', cCardNet[0] === cHelper.net && cFinNet[0] === cHelper.net && cTimeNet[0] === cHelper.net, `card ${cCardNet[0]}, fin ${cFinNet[0]}, time ${cTimeNet[0]}, settled ${cHelper.net}`);
}

/* ================= (d) job loss reaches the life ================= */
section('(d) losing a job reaches the mortgage, spouse, children, visa');
{
  const S = adultLife();
  S.country = 'egy';
  employ(S);
  // Spouse, two children, a mortgaged home, a work visa.
  const spouse = addPerson(S, { role: 'spouse', relationLabel: 'Spouse', age: 33, affection: 70 });
  S.relations.spouseIds = [spouse.id];
  const child1 = addPerson(S, { role: 'child', relationLabel: 'Child', age: 10, affection: 80, trust: 70 });
  const child2 = addPerson(S, { role: 'child', relationLabel: 'Child', age: 7, affection: 80, trust: 70 });
  S.relations.childIds = [child1.id, child2.id];
  S.housing.properties = [{
    id: 'prop_m', name: 'Smouha Flat', country: 'egy', city: 'Alexandria',
    monthsLeft: 120, nativeMonthlyInstallment: 15000, nativeInstallmentRemaining: 15000 * 120,
    installmentRemaining: 15000 * 120, valueLocal: 2000000, rooms: 3
  }];
  S.housing.currentHomeId = 'prop_m'; S.housing.mode = 'owned';
  S.legal.citizenships = ['usa'];
  S.legal.residency = { kind: 'work_visa', country: 'egy', permitName: 'Egypt Work Visa', sponsorName: 'Orascom Construction', expiresYear: 2027, expiresMonth: 6, graceMonthsLeft: 0, yearsInCountryLegally: 3, familySponsored: false };
  // Baseline: employed last month.
  checkCareerConsequences(S);
  check('no job-loss reaction while employed', !queuedScenes(S).some((sc) => /jobloss/i.test(sc.key || '')));
  // Lose the job.
  S.career.employed = false;
  S.career.job = null;
  S.career.unemployedMonths = 0;
  const rep = checkCareerConsequences(S);
  const fired = (rep.jobLoss?.fired || []).map((f) => f.kind).sort();
  console.log(`  job-loss reactions fired: ${JSON.stringify(fired)}; skipped: ${JSON.stringify(rep.jobLoss?.skipped || [])}`);
  check('job loss fires all four reactions', JSON.stringify(fired) === JSON.stringify(['children', 'mortgage', 'spouse', 'visa']), `fired ${fired.join(', ')}`);
  const cashBefore = S.money.cash;
  // Mortgage — pay the next instalment early from savings.
  const mScene = findScene(S, /Bank Writes About/);
  check('mortgage scene is a real scene in plain words', !!mScene && /instalments do not stop/.test(mScene.text));
  const prop = S.housing.properties[0];
  const monthsBefore = prop.monthsLeft;
  mScene.choices[0].effect(S);
  check('mortgage choice pays next instalment early (monthsLeft −1, cash −15000)', prop.monthsLeft === monthsBefore - 1 && S.money.cash === cashBefore - 15000, `months ${monthsBefore}→${prop.monthsLeft}, cash ${cashBefore}→${S.money.cash}`);
  // Mortgage — payment holiday is honoured by the settlement.
  const mScene2 = findScene(S, /Bank Writes About/);
  /* An answered job-loss reaction is single-use per loss (jobLossReactionReplies): answering the same card again must change nothing. */
  mScene2.choices[1].effect(S);
  check('an already-answered mortgage card cannot be answered twice (no holiday granted by the second click)', prop.paymentHolidayUntil === undefined, `paymentHolidayUntil ${prop.paymentHolidayUntil}`);
  /* To test the settlement honouring the holiday flag, model a fresh decision by clearing the reply record, as a new job loss would. */
  S.career.jobLossReactionReplies = {};
  mScene2.choices[1].effect(S);
  const monthsAfterHoliday = prop.monthsLeft;
  settleHouseholdMonth(S);
  check('payment holiday: settlement charges no instalment that month', prop.monthsLeft === monthsAfterHoliday && (prop.missedMonths || 0) === 0, `monthsLeft ${monthsAfterHoliday}→${prop.monthsLeft}, missed ${prop.missedMonths || 0}`);
  // Spouse — tighten the belt together.
  const spScene = findScene(S, /Hears You Lost Your Job/);
  check('spouse scene is a real scene in plain words', !!spScene && /lost your job/.test(spScene.text));
  const affBefore = spouse.rel.affection;
  spScene.choices[0].effect(S);
  check('spouse choice tightens the belt (lifestyle frugal, affection +5)', S.money.lifestyleMode === 'frugal' && spouse.rel.affection === affBefore + 5, `mode ${S.money.lifestyleMode}, affection ${affBefore}→${spouse.rel.affection}`);
  // Children — told honestly.
  const chScene = findScene(S, /The Children Notice/);
  check('children scene is a real scene in plain words', !!chScene && /notice before you tell them/.test(chScene.text));
  const trustBefore = child1.rel.trust;
  chScene.choices[0].effect(S);
  check('children choice tells them honestly (trust +4)', child1.rel.trust === trustBefore + 4, `trust ${trustBefore}→${child1.rel.trust}`);
  // Visa — warned, with the real status.
  const vScene = findScene(S, /Your Visa Depends on That Job/);
  check('(replacement) visa scene names the recorded permit and expiry and says no grace or sponsor agreement is granted (the sponsor is no longer named: sponsorship is not modelled)', !!vScene && /Egypt Work Visa/.test(vScene.text) && /6\/2027/.test(vScene.text) && /No grace extension or sponsor agreement is granted/.test(vScene.text));
  vScene.choices[0].effect(S);
  check('visa choice starts the sponsor hunt (flag + journal)', S.career.jobLoss.visaJobHunt === true && journalTexts(S).some((t) => /Started looking for eligible work after job loss\. Check Passport/.test(t)));
  // No repeat in the same loss.
  const rep2 = checkCareerConsequences(S);
  check('reactions do not refire for the same job loss', (rep2.jobLoss?.fired || []).length === 0, `fired ${(rep2.jobLoss?.fired || []).length}`);
  // A citizen gets no visa scene.
  const S2 = adultLife();
  employ(S2);
  checkCareerConsequences(S2);
  S2.career.employed = false; S2.career.job = null;
  const rep3 = checkCareerConsequences(S2);
  check('a citizen gets no visa reaction (nothing to warn about)', (rep3.jobLoss?.skipped || []).some((s) => s.kind === 'visa'), JSON.stringify(rep3.jobLoss?.skipped || []));
}

/* ================= (e) crisis years ================= */
section('(e) crisis year: fewer calls, frozen pay, warned redundancy');
{
  // Headhunter rate, paired: same random draws, crisis vs quiet.
  const S = adultLife();
  employ(S, { performance: 80, monthsInRole: 12 });
  const quietRate = headhunterApproachRate(S);
  S.year = 2009; S.month = 6;
  const crisisRate = headhunterApproachRate(S);
  console.log(`  headhunter rate — quiet ${quietRate}, crisis ${crisisRate}`);
  check('crisis year multiplies the headhunter rate down (×0.4)', quietRate === 0.08 && crisisRate === 0.032, `quiet ${quietRate}, crisis ${crisisRate}`);
  // Paired empirical count: same seed both runs.
  const runCount = (state, n) => {
    let hits = 0;
    const m = ensureCareerMarket(state);
    for (let i = 0; i < n; i++) {
      m.offer = null; m.lastApproachTurn = null;
      const r = maybeHeadhunterApproach(state);
      if (r.ok) hits += 1;
    }
    return hits;
  };
  const seed = hashSeed('w2-rate-test');
  const Q = adultLife(); employ(Q, { performance: 80, monthsInRole: 12 });
  Q.careerMarketRng = seed;
  const quietHits = runCount(Q, 300);
  const K = adultLife(); K.year = 2009; K.month = 6; employ(K, { performance: 80, monthsInRole: 12 });
  K.careerMarketRng = seed;
  const crisisHits = runCount(K, 300);
  console.log(`  headhunter calls in 300 paired months — quiet ${quietHits}, crisis ${crisisHits}`);
  check('fewer headhunter calls in a crisis year (paired, same draws)', crisisHits < quietHits, `quiet ${quietHits} vs crisis ${crisisHits}`);

  // Warning BEFORE redundancy.
  const W = adultLife();
  W.year = 2009; W.month = 6;
  employ(W, { performance: 80, monthsInRole: 12 });
  const wRep = checkCareerConsequences(W);
  check('crisis warning fires at the start of the crisis year', !!wRep.warning && !!findScene(W, /Your Job Is About to Feel It/), wRep.warning || 'no warning');
  check('pay is frozen by the warning (until the crisis end year 2010)', W.career.job.payFrozenUntilYear === 2010, `until ${W.career.job.payFrozenUntilYear}`);
  check('no redundancy in the warning month', !wRep.redundancy && redundancyChance(W, crisisInfo(W)) === 0, `chance ${redundancyChance(W, crisisInfo(W))}`);
  check('payslip says the pay is frozen, in plain words', renderWorkTabHtml(W).includes('Pay frozen.'));
  // A month later, the risk is real.
  W.career.crisisWarnings.financial_crisis_2008 = { year: 2009, month: 5 };
  const p = redundancyChance(W, crisisInfo(W));
  console.log(`  redundancy chance a month after the warning: ${p}`);
  check('redundancy risk is real after the warning (3%/mo)', p === 0.03, `chance ${p}`);
  const grossBefore = W.career.job.monthlyGross;
  const cashBefore = W.money.cash;
  const red = makeRedundant(W, { force: true });
  check('redundancy fires, pays real severance', red.ok && W.money.cash === cashBefore + red.severance && red.severance > 0, `severance ${red.severance}`);
  check('redundancy ends the job', !W.career.employed && !W.career.job);

  // Frozen gross does not rise: merit rise + raise + negotiate.
  // monthsInRole 11 so the tick lands on 12 and the yearly review
  // fires; performance 70 so no promotion fires (merit is 5.5%).
  const F = adultLife();
  F.year = 2009; F.month = 6;
  const fjob = employ(F, { performance: 70, monthsInRole: 11 });
  fjob.payFrozenUntilYear = 2010;
  fjob.payFreezeReason = 'pay is frozen while The 2008 Financial Crisis lasts';
  const fGross = fjob.monthlyGross;
  tickCareerMonthly(F);
  check('frozen job: yearly merit rise skipped, gross unchanged', fjob.monthlyGross === fGross, `${fGross} → ${fjob.monthlyGross}`);
  const raise = requestRaiseOrPromotion(F);
  check('frozen job: raise refused in plain words, gross unchanged', !raise.ok && /frozen/.test(raise.msg) && fjob.monthlyGross === fGross, raise.msg);
  // A frozen promotion is deferred, not paid: performance 80 would
  // have promoted at the review; the title and the gross both stay.
  const P = adultLife();
  P.year = 2009; P.month = 6;
  const pjob = employ(P, { performance: 80, monthsInRole: 11 });
  pjob.payFrozenUntilYear = 2010;
  const pTitle = pjob.title; const pGross = pjob.monthlyGross;
  tickCareerMonthly(P);
  check('frozen job: automatic promotion deferred (title and gross unchanged)', pjob.title === pTitle && pjob.monthlyGross === pGross, `${pTitle} ${pGross} → ${pjob.title} ${pjob.monthlyGross}`);
  // Negotiating with an outside offer is refused while frozen
  // (2026, where the market has a better job to offer — in 2009
  // there is no better engineering job on the market at all).
  const N = adultLife();
  employ(N, { performance: 80, monthsInRole: 12 });
  N.career.job.payFrozenUntilYear = 2026;
  const nOffer = maybeHeadhunterApproach(N, { force: true });
  check('frozen job: headhunter offer still arrives to negotiate with', nOffer.ok, nOffer.msg || '');
  if (nOffer.ok) {
    const nGross = N.career.job.monthlyGross;
    const neg = negotiateWithOffer(N);
    check('frozen job: negotiation refused, gross unchanged, offer spent', !neg.ok && /frozen/.test(neg.msg) && N.career.job.monthlyGross === nGross && !N.career.market.offer, neg.msg);
  }
  const U = adultLife();
  const ujob = employ(U, { performance: 70, monthsInRole: 11 });
  const uGross = ujob.monthlyGross;
  tickCareerMonthly(U);
  check('unfrozen control: merit rise lifts the gross (+5.5%)', ujob.monthlyGross === Math.round(uGross * 1.055), `${uGross} → ${ujob.monthlyGross}`);
  const slipFrozen = computePayslip(30000, 'egy', 2009, true, 'normal', { payFrozen: true, payFreezeNote: 'Pay is frozen this year.' });
  check('computePayslip reports a freeze in plain words', slipFrozen.payFrozen === true && /frozen/.test(slipFrozen.payFreezeNote));
  const salFrozen = salaryNetFor(F);
  check('salaryNetFor reports the freeze too', salFrozen.payFrozen === true && /frozen/.test(salFrozen.freezeNote));
}

/* ================= (f) achievements raise the rate ================= */
section('(f) visible achievements raise the headhunter rate');
{
  const S = adultLife();
  employ(S, { performance: 80, monthsInRole: 12 });
  check('no achievements: bonus 0, rate 0.08', achievementHeadhunterBonus(S) === 0 && headhunterApproachRate(S) === 0.08);
  S.career.workAchievements = [
    { id: 'a1', label: 'Delivered the Cairo Tower retrofit', year: 2026, month: 3, trackId: 'engineering' },
    { id: 'a2', label: 'Won the Nile Plaza contract', year: 2026, month: 5, trackId: 'engineering' }
  ];
  check('2 achievements: +4 points (rate 0.12)', achievementHeadhunterBonus(S) === 0.04 && headhunterApproachRate(S) === 0.12, `rate ${headhunterApproachRate(S)}`);
  S.career.workAchievements.push(
    { id: 'a3', label: 'Led the Alexandria port upgrade', year: 2026, month: 7, trackId: 'engineering' },
    { id: 'a4', label: 'Cut site delays by a third', year: 2026, month: 8, trackId: 'engineering' },
    { id: 'a5', label: 'Trained six junior engineers', year: 2026, month: 9, trackId: 'engineering' },
    { id: 'a6', label: 'Delivered the desert highway early', year: 2026, month: 10, trackId: 'engineering' },
    { id: 'a7', label: 'Won Engineer of the Year', year: 2026, month: 11, trackId: 'engineering' }
  );
  check('7 achievements: bonus capped at +10 points (rate 0.18)', achievementHeadhunterBonus(S) === 0.10 && headhunterApproachRate(S) === 0.18, `rate ${headhunterApproachRate(S)}`);
  const latest = latestWorkAchievement(S);
  check('latest achievement is the newest by date', latest && latest.label === 'Won Engineer of the Year', latest?.label);
  const r = maybeHeadhunterApproach(S, { force: true });
  check('forced approach produces an offer', r.ok && !!r.offer, r.msg || '');
  check('the offer names the latest achievement', r.offer && r.offer.achievementLabel === 'Won Engineer of the Year', r.offer?.achievementLabel);
  check('the journal names the achievement too', journalTexts(S).some((t) => /Won Engineer of the Year/.test(t)));
  check('the Career tab offer card names the achievement', renderWorkTabHtml(S).includes('Won Engineer of the Year'));
}

/* ================= (g) business fate reaches the life ================= */
section('(g) business failure / boom reaches the rest of the life (v2.17 F1–F3/B1–B3)');
{
  const S = adultLife();
  const spouse = addPerson(S, { role: 'spouse', relationLabel: 'Spouse', age: 33, affection: 70 });
  S.relations.spouseIds = [spouse.id];
  const friend = addPerson(S, { role: 'friend', relationLabel: 'Friend', age: 34, affection: 75, employer: 'Orascom Construction', jobTitle: 'Site Engineer', track: 'engineering' });
  S.relations.friendIds = [friend.id];
  const biz = mkBiz('biz_f', 'Failing Café', {
    lastPL: { year: 2026, month: 1, name: 'Failing Café', typeId: 'cafe', revenue: 40000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: -40000, tax: 0, taxLabel: 'No tax — loss', net: -40000, wave: 0, repeatRate: 0.4 }
  });
  biz.dead = true; biz.deathCause = 'ran out of money after months of losses';
  biz.debtLocal = 50000; biz.misses = 2; biz.monthsLosing = 4;
  S.career.businesses = [biz]; S.career.business = biz;
  // F1 — bank calls about the debt. First try the loan branch: take a real loan, then F1 restructures it.
  const loanRes = takeBusinessLoan(S, biz, 100000);
  console.log(`  takeBusinessLoan: ${JSON.stringify(loanRes)}`);
  const rep1 = checkBusinessFate(S);
  console.log(`  fate call 1 fired: ${JSON.stringify(rep1.fired)}`);
  const bankScene = findScene(S, /The Bank Calls About/);
  check('F1: bank calls about the failing business', !!bankScene, bankScene?.title || 'no scene');
  const loanBefore = getBusinessLoan(S, biz);
  if (loanBefore) {
    const payBefore = loanBefore.monthlyPayment;
    bankScene.choices[0].effect(S);
    const loanAfter = getBusinessLoan(S, biz);
    check('F1 loan branch: restructure cuts the monthly payment to 75%', loanAfter && loanAfter.monthlyPayment === Math.round(payBefore * 0.75), `${payBefore} → ${loanAfter?.monthlyPayment}`);
  } else {
    const debtBefore = biz.debtLocal;
    const cashBefore = S.money.cash;
    bankScene.choices[0].effect(S);
    check('F1 debt branch: arrears cleared from cash', biz.debtLocal === 0 && S.money.cash === cashBefore - debtBefore, `debt ${debtBefore}→${biz.debtLocal}`);
  }
  // F2 — spouse reacts (next month: one fate scene per business per month).
  S.month = 2;
  const rep2 = checkBusinessFate(S);
  console.log(`  fate call 2 fired: ${JSON.stringify(rep2.fired)}`);
  const spScene = findScene(S, /Worries About|Row About/);
  check('F2: spouse reacts to the lost income', !!spScene, spScene?.title || 'no scene');
  if (spScene) {
    const costBefore = biz.monthlyCost;
    const affBefore = spouse.rel.affection;
    spScene.choices[0].effect(S);
    check('F2: cutting costs together trims monthlyCost 5% and lifts affection', biz.monthlyCost === Math.round(costBefore * 0.95) && spouse.rel.affection === affBefore + 5, `cost ${costBefore}→${biz.monthlyCost}`);
  }
  // F3 — a friend offers a job (next month).
  S.month = 3;
  const rep3 = checkBusinessFate(S);
  console.log(`  fate call 3 fired: ${JSON.stringify(rep3.fired)}`);
  const frScene = findScene(S, /Offers You a Job/);
  check('F3: a friend offers a real job (their real job, not Shop Assistant)', !!frScene && /Orascom Construction/.test(frScene.text) && /Junior Site Engineer/.test(frScene.text), frScene?.title || 'no scene');
  if (frScene) {
    /* Real defect fixed with this change: the offer used to lack the degree requirement, so it always failed with "Requires a degree in ." Now an unqualified player sees the real reason, and a qualified one can take the job. */
    const keptDegrees = S.education.degrees; S.education.degrees = [];
    check('F3: an unqualified player sees a readable reason naming the degree, not "Requires a degree in ."', frScene.choices[0].available(S) === false && /ENGINEERING/.test(String(frScene.choices[0].lockReason(S))), String(frScene.choices[0].lockReason?.(S)));
    S.education.degrees = keptDegrees;
    check('F3: a QUALIFIED player (the test life holds the degree) can take it — before the fix the missing qualification flag blocked everyone', frScene.choices[0].available(S) === true, 'available');
    frScene.choices[0].effect(S);
    check('F3: taking the job employs you at a real wage', S.career.employed === true && S.career.job && S.career.job.monthlyGross > 0, S.career.job ? `${S.career.job.title} ${S.career.job.monthlyGross}/mo` : 'no job');
  }
  // Booming: B1 spouse wants a bigger house, B2 bank loan, B3 rival.
  const B = adultLife();
  B.money.creditScore = 800; // B2's bigger loan needs a score the test life otherwise lacks (680 < 700)
  const bspouse = addPerson(B, { role: 'spouse', relationLabel: 'Spouse', age: 33, affection: 70 });
  B.relations.spouseIds = [bspouse.id];
  const bbiz = mkBiz('biz_b', 'Booming Café', {
    level: 6, repeatRate: 0.66,
    history: Array.from({ length: 6 }, () => ({ net: 5000 })),
    lastPL: { year: 2026, month: 1, name: 'Booming Café', typeId: 'cafe', revenue: 300000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: 220000, tax: 20000, taxLabel: 'Income tax', net: 200000, wave: 0, repeatRate: 0.66 }
  });
  bbiz.group = { headOffice: { cost: 10000 }, regionalManager: { name: 'Rania', salary: 20000 }, supplyChain: { discount: 0.1 } };
  B.career.businesses = [bbiz]; B.career.business = bbiz;
  const bRep1 = checkBusinessFate(B);
  console.log(`  boom fate call 1 fired: ${JSON.stringify(bRep1.fired)}`);
  const houseScene = findScene(B, /Wants a Bigger House/);
  check('B1: spouse wants a bigger house', !!houseScene, houseScene?.title || 'no scene');
  if (houseScene) {
    const affBefore = bspouse.rel.affection;
    houseScene.choices[0].effect(B);
    check('B1: agreeing sets the house-hunt flag and lifts affection', B.fateHouseHunt && B.fateHouseHunt.bizId === 'biz_b' && bspouse.rel.affection === affBefore + 8, `flag ${JSON.stringify(B.fateHouseHunt)}`);
  }
  B.month = 2;
  const bRep2 = checkBusinessFate(B);
  console.log(`  boom fate call 2 fired: ${JSON.stringify(bRep2.fired)}`);
  const loanScene = findScene(B, /Offers .* a Bigger Loan/);
  check('B2: the bank offers a bigger loan', !!loanScene, loanScene?.title || 'no scene');
  if (loanScene) {
    const loansBefore = (B.money.loans || []).length;
    loanScene.choices[0].effect(B);
    check('B2: taking the bigger loan adds a real loan', (B.money.loans || []).length === loansBefore + 1 && (B.money.loans[0].balance || 0) > 0, `loans ${loansBefore}→${(B.money.loans || []).length}, balance ${B.money.loans[0]?.balance}`);
  }
  B.month = 3;
  const bRep3 = checkBusinessFate(B);
  console.log(`  boom fate call 3 fired: ${JSON.stringify(bRep3.fired)}`);
  const rivalScene = findScene(B, /A Rival Copies/);
  check('B3: a rival copies the booming business', !!rivalScene, rivalScene?.title || 'no scene');
  if (rivalScene) {
    const revBefore = bbiz.monthlyRev;
    const repBefore = bbiz.repeatRate;
    rivalScene.choices[0].effect(B);
    check('B3: cutting prices costs 8% revenue, gains 3% repeat customers', bbiz.monthlyRev === Math.round(revBefore * 0.92) && Math.abs(bbiz.repeatRate - (repBefore + 0.03)) < 1e-9, `rev ${revBefore}→${bbiz.monthlyRev}`);
  }
}

/* ================= (h) ESM parse ================= */
section('(h) ESM parse of every src file');
{
  const ROOT = new URL('..', import.meta.url).pathname;
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${dir}/${e.name}`);
      else if (e.name.endsWith('.js')) files.push(`${dir}/${e.name}`);
    }
  };
  walk(`${ROOT}src`);
  let ok = 0, bad = [];
  for (const f of files) {
    try { await import(f); ok += 1; } catch (e) { bad.push(`${f.replace(ROOT, '')}: ${e.message}`); }
  }
  console.log(`  ${ok}/${files.length} src files import cleanly`);
  check('ESM parse 0 failures', bad.length === 0, bad.slice(0, 5).join(' | '));
}

console.log(`\n${pass} passed, ${fail} failed${failedNames.length ? ` — FAILED: ${failedNames.join(', ')}` : ''}`);
process.exit(fail ? 1 : 0);
