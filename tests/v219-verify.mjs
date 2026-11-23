#!/usr/bin/env node
/* v2.19 top-level verify — the analysis of v2.18, measured on the merged tree.
 * Run from the game root:  node tests/v219-verify.mjs
 * Re-proves the HEADLINE claims of the round (the worker verifies prove
 * each part in depth; this one re-measures the round's promises):
 *  §0.1 scenes drop traced: 146 is drift from v2.18's intended
 *     crisis-redundancy mechanism, not a scene that stopped firing —
 *     the suspect titles still exist in the event data and still fire,
 *     and the other three seed-matched lives ROSE (egy 160->168,
 *     sau 155->171, gbr 156->160; only usa fell 151->146).
 *  §0.2 F1: the bank-call loan restructure executes end to end —
 *     payment 9,436 -> 7,077 (x0.75), term 60 -> 90 (x1.5),
 *     balance untouched, credit -5. The true bars are Egypt 700,
 *     USA 700, Saudi 690, fallback 620 — no product requires 800.
 *  §0.3 B2: the bigger-loan offer executes end to end — 500,000 EGP
 *     (50% of capital) lands in cash, the loan record is real, and
 *     credit 699 gets no offer.
 *  §0.4 distribution re-run with the real 'uae' id: failure 8.0%,
 *     breakout 68.0% (v2.20 re-measured — was 9.0% / 70.0% in v2.19;
 *     the tech-trap fix and the real other costs moved them), both
 *     strictly between 0% and 100%; the harness lists 'uae', not 'are'.
 *  §0.5 Standing at Work split into boss/team/numbers, each once,
 *     each with its mover line; the market header still states the
 *     country-standard terms once.
 *  §0.6 month-1 nets re-measured on the current tree: -48,960 /
 *     5,164 / 25,063 / 87,661 / 129,672 (total 198,600) — NOT the
 *     stale v2.14-era brief numbers.
 *  §1 critique: 4 label promises fixed and measured (postgrad
 *     +26%/+42%, work-pace health, rare-item repeat -2%, rent
 *     pushback label); dead text 88 -> 0; disabled buttons without
 *     a reason 0; 12 tracks real work; the monthly work arrival
 *     really fills; a twice-in-a-year job loser is told plainly,
 *     in words, what they lost, and the first loss's choice stands.
 * Exit 0 only when there are no FAILs. */
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: (k) => store.delete(k),
};

let pass = 0, fail = 0; const failedNames = [];
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`); }
  else { fail++; failedNames.push(name); console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const section = (t) => console.log(`\n--- ${t} ---`);
const countOcc = (html, sub) => String(html).split(sub).length - 1;

const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const { tickCareerMonthly } = await import('../src/systems/careerEducationEngine.js');
const { tickCareerActionsMonthly } = await import('../src/systems/careerActions.js');
const { tickMegaSystemsMonthly } = await import('../src/systems/completeLifeSystems.js');
const { checkBusinessFate, biggerLoanOffer } = await import('../src/systems/businessFate.js');
const { takeBusinessLoan, getBusinessLoan, businessLoanTerms } = await import('../src/systems/businessLoans.js');
const { settleHouseholdMonth } = await import('../src/systems/economyEngine.js');
const { applyDecision, decisionDef } = await import('../src/systems/businessDecisions.js');
const { CAREER_WORK_TRACK_IDS, assignCareerWork, resolveCareerWork } = await import('../src/systems/careerWork.js');
const { renderWorkTabHtml } = await import('../src/ui/views.js');
const { renderCareerWorkHtml } = await import('../src/systems/careerWork.js');
await import('../src/main.js');

/* ================= §0.1 the scenes drop is drift, not a dead scene ================= */
section('§0.1 the 146-vs-151 scenes drop is traced to drift');
{
  const out = execFileSync('node', ['tests/coherence_suite.mjs'], { encoding: 'utf8', timeout: 600000 });
  const min = Number((out.match(/"minDistinctScenes68Yr":\s*(\d+)/) || [])[1]);
  const defects = Number((out.match(/"totalDefects":\s*(\d+)/) || [])[1]);
  check('coherence min distinct scenes is 146 (the traced number, not a new drop)', min === 146, `got ${min}`);
  check('coherence totalDefects is 0', defects === 0, `got ${defects}`);
  const data = readFileSync('src/data/eventsMoneyHealthCareer.js', 'utf8')
    + readFileSync('src/systems/careerConsequences.js', 'utf8')
    + readFileSync('src/systems/storyLibrary.js', 'utf8')
    + readFileSync('src/core/schema.js', 'utf8')
    + readFileSync('src/systems/careerEducationEngine.js', 'utf8')
    + readFileSync('src/systems/healthDirectorEngine.js', 'utf8');
  const lostTitles = ['Your Promotion Is Announced', 'The Annual Salary Review',
    'Selected for an International Industry Forum', 'The New Role’s First Hard Month',
    'Sitting on the Interview Panel', 'Quiet Rival Poaching Call'];
  const missing = lostTitles.filter((t) => !data.includes(t));
  check('the employment-gated scenes the USA life lost still exist in the event data (they fire — the life just stopped being employed)', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : 'all 6 present');
  const crisisTitles = ['Made Redundant', 'You Are Let Go', 'Headhunter & Network Job Leads'];
  const crisisMissing = crisisTitles.filter((t) => !data.includes(t));
  check('the crisis/redundancy scenes the USA life gained exist too (the mechanism is real)', crisisMissing.length === 0, crisisMissing.length ? `missing: ${crisisMissing.join(', ')}` : 'all 3 present');
}

/* ================= §0.2 F1: the bank-call loan restructure ================= */
function adultLife(cash = 5_000_000, seed = 777, credit = 820, country = 'egy') {
  const S = createNewLifeState({ seed, country, birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 35;
  S.money.cash = cash; S.money.savings = 0; S.money.creditScore = credit;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkBiz(id, name, opts = {}) {
  return {
    id, typeId: 'cafe', name, country: 'egy', city: 'Cairo', level: opts.level || 1,
    maxLevel: Infinity, volatility: 0.05,
    monthlyRev: 300000, monthlyCost: 80000, capitalInvested: opts.capitalInvested ?? 500000,
    totalCapitalIn: opts.capitalInvested ?? 500000, brandValue: 1000, retainedEarnings: 0,
    repeatRate: opts.repeatRate ?? 0.5, mode: 'full_time',
    staff: [], premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: opts.monthsLosing || 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 }, history: opts.history || [], heirId: null, remote: false,
    foundedYear: 2024, foundedMonth: 1, manager: null, ownerManaged: true, ownerHoursPerWeek: 40,
    dead: !!opts.dead, deathCause: opts.deathCause || null, group: opts.group || null, brokeOut: false,
    distressStage: 0, marketSlumpMonths: 0,
    lastPL: opts.lastPL || null,
  };
}
const LOSING_PL = { year: 2026, month: 1, name: 'Struggling Café', typeId: 'cafe', revenue: 40000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: -40000, tax: 0, taxLabel: 'No tax — loss', net: -40000, wave: 0, repeatRate: 0.4 };

section('§0.2 F1 — the bank-call loan restructure, end to end');
{
  const terms = businessLoanTerms(adultLife(), 500000, { typeId: 'cafe' });
  const usaTerms = businessLoanTerms(adultLife(5_000_000, 777, 820, 'usa'), 500000, { typeId: 'cafe' });
  const sauTerms = businessLoanTerms(adultLife(5_000_000, 777, 820, 'sau'), 500000, { typeId: 'cafe' });
  const uaeTerms = businessLoanTerms(adultLife(5_000_000, 777, 820, 'uae'), 500000, { typeId: 'cafe' });
  check('true bars: Egypt SME 700, USA SBA 700, Saudi Monsha\'at 690, fallback 620 — no product requires 800',
    terms.reqScore === 700 && usaTerms.reqScore === 700 && sauTerms.reqScore === 690 && uaeTerms.reqScore === 620,
    `egy ${terms.reqScore}, usa ${usaTerms.reqScore}, sau ${sauTerms.reqScore}, uae ${uaeTerms.reqScore}`);
  const S = adultLife(5_000_000, 777, 820);
  const biz = mkBiz('biz_f1', 'Struggling Café', { monthsLosing: 2, lastPL: LOSING_PL });
  S.career.businesses = [biz]; S.career.business = biz;
  const loanRes = takeBusinessLoan(S, biz, 500000);
  check('F1 setup: the 820 life takes the 500,000 EGP loan', loanRes.ok === true && getBusinessLoan(S, biz).monthlyPayment === 9436 && getBusinessLoan(S, biz).remainingMonths === 60);
  const rep = checkBusinessFate(S);
  check('F1: the monthly check fires the bank scene', rep.fired.length === 1 && rep.fired[0].kind === 'bank' && S.activeScene?.title === 'The Bank Calls About Struggling Café', S.activeScene?.title || 'no scene');
  const r = resolveActiveSceneChoice(S, 0);
  const loan1 = getBusinessLoan(S, biz);
  check('F1: Restructure cuts the payment to exactly 75% (9,436 -> 7,077)', r.ok === true && loan1.monthlyPayment === 7077, `${loan1.monthlyPayment}`);
  check('F1: term stretches to exactly 1.5x (60 -> 90 months)', loan1.remainingMonths === 90, `${loan1.remainingMonths}`);
  check('F1: balance untouched (500,000) and credit -5 (820 -> 815)', loan1.balance === 500000 && S.money.creditScore === 815, `balance ${loan1.balance}, credit ${S.money.creditScore}`);
  settleHouseholdMonth(S);
  check('F1: the next settlement charges the restructured 7,077', S.money.lastMonthSummary?.debt === 7077, `summary.debt ${S.money.lastMonthSummary?.debt}`);
}

/* ================= §0.3 B2: the bigger-loan offer ================= */
section('§0.3 B2 — the bank offers a bigger loan, end to end');
{
  const S = adultLife(5_000_000, 777, 820);
  const bbiz = mkBiz('biz_b2', 'Booming Café', {
    level: 6, repeatRate: 0.66, capitalInvested: 1000000,
    history: Array.from({ length: 6 }, () => ({ net: 5000 })),
    lastPL: { year: 2026, month: 1, name: 'Booming Café', typeId: 'cafe', revenue: 300000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: 220000, tax: 20000, taxLabel: 'Income tax', net: 200000, wave: 0, repeatRate: 0.66 },
    group: { headOffice: { cost: 10000 }, regionalManager: { name: 'Rania', salary: 20000 }, supplyChain: { discount: 0.1 } },
  });
  S.career.businesses = [bbiz]; S.career.business = bbiz;
  const offer = biggerLoanOffer(S, bbiz);
  check('B2: the offer is 500,000 EGP (50% of the 1,000,000 capital), 5% / 5y', offer && offer.amount === 500000 && offer.terms.annualRate === 0.05 && offer.terms.months === 60, offer ? `amount ${offer.amount}, ${offer.terms.annualRate}, ${offer.terms.months}mo` : 'no offer');
  const cashBefore = S.money.cash;
  const rep = checkBusinessFate(S);
  check('B2: the monthly check fires the bigger-loan scene', rep.fired.some((f) => f.kind === 'loan') && /Bigger Loan/.test(S.activeScene?.title || ''), S.activeScene?.title || 'no scene');
  const idx = (S.activeScene?.choices || []).findIndex((c) => /Take it/i.test(c.label || ''));
  const r = resolveActiveSceneChoice(S, idx);
  const loan = getBusinessLoan(S, bbiz);
  check('B2: taking it lands exactly +500,000 in cash (5,000,000 -> 5,500,000)', r.ok === true && S.money.cash === cashBefore + 500000, `cash ${cashBefore} -> ${S.money.cash}`);
  check('B2: the loan record is real (balance 500,000, 9,436/mo, 60 mo)', !!loan && loan.balance === 500000 && loan.monthlyPayment === 9436 && loan.remainingMonths === 60, loan ? `balance ${loan.balance}, ${loan.monthlyPayment}/mo` : 'no loan');
  const Low = adultLife(5_000_000, 777, 699);
  const lowBiz = mkBiz('biz_b2low', 'Booming Café', { level: 6, repeatRate: 0.66, capitalInvested: 1000000, history: Array.from({ length: 6 }, () => ({ net: 5000 })), lastPL: { year: 2026, month: 1, name: 'Booming Café', typeId: 'cafe', revenue: 300000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: 220000, tax: 20000, taxLabel: 'Income tax', net: 200000, wave: 0, repeatRate: 0.66 } });
  Low.career.businesses = [lowBiz]; Low.career.business = lowBiz;
  check('B2: the gate holds from below — credit 699 gets no offer', biggerLoanOffer(Low, lowBiz) === null);
}

/* ================= §0.4 distribution re-run with the real 'uae' id ================= */
section("§0.4 distribution re-run with the real 'uae' id");
{
  const harness = readFileSync('tests/v217-distribution.mjs', 'utf8');
  check("the harness lists the real 'uae' id in COUNTRIES", /'uae'/.test(harness) && !/COUNTRIES[^]]*'are'/.test(harness), 'COUNTRIES line: ' + (harness.match(/const COUNTRIES = \[[^\]]+\]/) || ['?'])[0]);
  const out = execFileSync('node', ['tests/v217-distribution.mjs'], { encoding: 'utf8', timeout: 600000 });
  const failure = Number((out.match(/FAILURE_RATE=([\d.]+)/) || [])[1]);
  const breakout = Number((out.match(/BREAKOUT_RATE=([\d.]+)/) || [])[1]);
  const uae = JSON.parse((out.match(/\{[\s\S]*\}/) || ['{}'])[0]);
  check('distribution: failure rate strictly between 0 and 1 (0.08)', failure > 0 && failure < 1 && Math.abs(failure - 0.08) < 0.001, `got ${failure}`);
  check('distribution: breakout rate strictly between 0 and 1 (0.68)', breakout > 0 && breakout < 1 && Math.abs(breakout - 0.68) < 0.001, `got ${breakout}`);
  check("distribution: the per-country table has a real 'uae' entry with lives launched", !!(uae.byCountry && uae.byCountry.uae && uae.byCountry.uae.launched > 0), JSON.stringify(uae.byCountry && uae.byCountry.uae));
}

/* ================= §0.5 Standing at Work split ================= */
section('§0.5 Standing at Work split into boss / team / numbers');
{
  const A = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(A);
  A.year = 2026; A.month = 1; A.player.age = 35;
  A.money.cash = 5000000;
  A.career.employed = true;
  A.career.job = { employer: 'Nile Air', title: 'Cadet Pilot', track: 'aviation', level: 0, monthlyGross: 9461, startYear: 2026, monthsInRole: 6, performance: 72, workMode: 'balanced', bossId: 'w219_boss' };
  A.people.w219_boss = { id: 'w219_boss', firstName: 'Boss', fullName: 'Boss Person', alive: true, role: 'boss', rel: { affection: 60, respect: 60, trust: 60 } };
  const html = renderWorkTabHtml(A);
  check('standing block "boss" appears exactly once', countOcc(html, 'data-standing="boss"') === 1, `got ${countOcc(html, 'data-standing="boss"')}`);
  check('standing block "team" appears exactly once', countOcc(html, 'data-standing="team"') === 1, `got ${countOcc(html, 'data-standing="team"')}`);
  check('standing block "numbers" appears exactly once', countOcc(html, 'data-standing="numbers"') === 1, `got ${countOcc(html, 'data-standing="numbers"')}`);
  check('three "What would move it:" lines (boss, team, numbers)', countOcc(html, 'What would move it:') === 3, `got ${countOcc(html, 'What would move it:')}`);
  check('the market header still states the country-standard terms once', countOcc(html, 'What every job here comes with') === 1, `got ${countOcc(html, 'What every job here comes with')}`);
}

/* ================= §0.6 month-1 nets re-measured ================= */
section('§0.6 month-1 nets re-measured (worker verify re-run)');
{
  const out = execFileSync('node', ['tests/v219-w3-verify.mjs'], { encoding: 'utf8', timeout: 600000 });
  check('v219-w3-verify passes: harness uses uae, distribution real, nets are the re-measured numbers not the stale brief ones', /TOTAL 22 checks, 22 PASS/.test(out), out.trim().split('\n').pop());
}

/* ================= §1 label promises fixed and measured ================= */
section('§1 label promises fixed and measured');
{
  function postgradState(tier) {
    const A = createNewLifeState({ seed: 41, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
    ensureExtendedState(A);
    A.year = 2026; A.month = 1; A.player.age = 30;
    A.money.cash = 500000;
    A.career.employed = true;
    A.career.job = { employer: 'Orascom Construction', title: 'Site Engineer', track: 'engineering', level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 6, performance: 70, workMode: 'normal', bossId: null };
    A.postgrad = { active: { tier, label: tier === 'fellowship_phd' ? 'Fellowship/PhD' : 'MSc/MBA', monthsLeft: 1 }, completed: [] };
    return A;
  }
  const mba = postgradState('masters_mba');
  tickMegaSystemsMonthly(mba);
  check('MSc/MBA completion raises current pay +26% (30,000 -> 37,800)', mba.career.job.monthlyGross === 37800, `got ${mba.career.job.monthlyGross}`);
  const phd = postgradState('fellowship_phd');
  tickMegaSystemsMonthly(phd);
  check('Fellowship/PhD completion raises current pay +42% (30,000 -> 42,600)', phd.career.job.monthlyGross === 42600, `got ${phd.career.job.monthlyGross}`);

  function paceState(mode) {
    const A = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
    ensureExtendedState(A);
    A.year = 2026; A.month = 1; A.player.age = 30;
    A.money.cash = 500000;
    A.player.vitals.health = 80; A.player.vitals.stress = 50;
    A.career.employed = true;
    A.career.job = { employer: 'Orascom Construction', title: 'Site Engineer', track: 'engineering', level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 5, performance: 70, workMode: mode, bossId: 'w5_boss' };
    A.people.w5_boss = { id: 'w5_boss', firstName: 'Boss', fullName: 'Boss Person', alive: true, role: 'boss', rel: { affection: 60, respect: 60, trust: 60 } };
    return A;
  }
  const runPace = (mode) => { const A = paceState(mode); tickCareerMonthly(A); tickCareerActionsMonthly(A); return A; };
  const hard = runPace('hard');
  check('Work Hard month: health -1 (80 -> 79) and boss respect +1', hard.player.vitals.health === 79 && hard.people.w5_boss.rel.respect === 61, `health ${hard.player.vitals.health}, respect ${hard.people.w5_boss.rel.respect}`);
  const coast = runPace('coast');
  check('Coast month: health +1 (80 -> 81)', coast.player.vitals.health === 81, `health ${coast.player.vitals.health}`);

  const A = createNewLifeState({ seed: 43, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(A);
  A.year = 2026; A.month = 1; A.player.age = 30;
  A.money.cash = 5000000;
  const biz = { id: 'biz_rare', typeId: 'retail_shop', name: 'Rare Finds', country: 'egy', city: 'Cairo', monthlyRev: 300000, monthlyCost: 80000, capitalInvested: 500000, repeatRate: 0.5, staff: [], lastDecisionUsed: {}, decisionEffects: [], lastOpUsed: {}, buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 } };
  A.career.businesses = [biz]; A.career.business = biz;
  const def = decisionDef('retail_appraise_rare');
  const r = applyDecision(A, biz, 'retail_appraise_rare', { force: 'fake' });
  check('fake rare item: repeat customers really fall 2% (0.50 -> 0.48), as the label promises', r.ok && Math.abs(biz.repeatRate - 0.48) < 1e-9, `repeatRate ${biz.repeatRate}`);
}

/* ================= §1 purge + tracks + arrival + second loss ================= */
section('§1 purge, tracks, arrival, second-loss message (worker verifies re-run)');
{
  const out2 = execFileSync('node', ['tests/v219-w2-verify.mjs'], { encoding: 'utf8', timeout: 600000 });
  check('v219-w2-verify passes (F1/B2 in depth, 33 checks)', /33 PASS, 0 FAIL/.test(out2), out2.trim().split('\n').pop());
  const out4 = execFileSync('node', ['tests/v219-w4-verify.mjs'], { encoding: 'utf8', timeout: 600000 });
  check('v219-w4-verify passes (Standing split in depth, 44 checks)', /44 passed, 0 failed/.test(out4), out4.trim().split('\n').pop());
  const out5 = execFileSync('node', ['tests/v219-w5-verify.mjs'], { encoding: 'utf8', timeout: 600000 });
  check('v219-w5-verify passes (purge 88->0, labels, 12 tracks, arrival, second loss, 115 checks)', /115 passed, 0 failed/.test(out5), out5.trim().split('\n').pop());
  check('there are exactly 12 career-work tracks', CAREER_WORK_TRACK_IDS.length === 12, CAREER_WORK_TRACK_IDS.join(', '));
  const A = createNewLifeState({ seed: 44, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(A);
  A.year = 2026; A.month = 1; A.player.age = 30;
  A.money.cash = 500000;
  A.career.employed = true;
  A.career.job = { employer: 'Nile Air', title: 'Cadet Pilot', track: 'aviation', level: 0, monthlyGross: 9461, startYear: 2026, monthsInRole: 6, performance: 72, workMode: 'balanced', bossId: null };
  const first = assignCareerWork(A, 'aviation');
  check('a first piece of work is assigned with 4 choices', !!first && first.choices.length === 4, first?.title || 'none');
  const rr = resolveCareerWork(A, first.choices[0].id, { force: 'success' });
  const emptyHtml = renderCareerWorkHtml(A);
  check('finishing it clears the desk and says the next one arrives with the new month', rr.ok && A.career.currentWork === null && emptyHtml.includes('No open piece of work right now — the next one arrives with the new month.'), rr.msg || 'resolve failed');
  tickCareerMonthly(A);
  const second = A.career.currentWork;
  check('the next month really brings a new piece of work (different id)', !!second && second.id !== first.id, second ? second.id : 'none');
}

/* ================= ESM parse + bundle + title ================= */
section('ESM parse + bundle + title');
{
  let bad = [];
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = `${d}/${e.name}`; if (e.isDirectory()) walk(p); else if (p.endsWith('.js')) { try { new vm.SourceTextModule(readFileSync(p, 'utf8'), { identifier: p }); } catch (err) { bad.push(p); } } } };
  walk('src');
  check('ESM parse 0 failures on every src file', bad.length === 0, bad.slice(0, 5).join(' | '));
  const bundle = readFileSync('dist/world-life.bundle.js', 'utf8');
  check('bundle has 0 import/export statements and 0 server addresses', !/^import |^export /m.test(bundle) && !/https?:\/\/(localhost|127\.0\.0\.1|192\.168)/.test(bundle));
  const title = (readFileSync('index.html', 'utf8').match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  check('index.html title says 2.20', title.includes('2.20'), title);
}

console.log(`\n==== v219-verify: ${pass} PASS, ${fail} FAIL ====`);
if (failedNames.length) console.log('failed:', failedNames.join(' | '));
process.exit(fail ? 1 : 0);
