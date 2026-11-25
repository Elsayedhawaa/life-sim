#!/usr/bin/env node
/* v2.18 top-level verify — Career, Real + the Overall Game.
 * Run from the game root:  node tests/v218-verify.mjs
 * Re-proves the HEADLINE claims of the round (the worker verifies prove
 * each part in depth; this one re-measures the round's promises on the
 * merged tree, including the two merge defects found by re-running the
 * shipped tests after the merge):
 *  §1 real work: 12 tracks, dashboard moves per part, skill by doing,
 *     achievements in the contract shape, promotion from real work.
 *  §2 desk + unity: 7 desk sections once, work card wired in, ops menu
 *     7 sections, one source of truth for the business net and the salary.
 *  §3 connection: job loss reaches mortgage/spouse/children/visa; a
 *     crisis year means fewer headhunter calls and a real redundancy
 *     risk, warned before it happens; MERGE DEFECTS — the job-offers
 *     scene and the job-loss reactions each fire at most once per
 *     calendar year (a second loss in the same year is journalled,
 *     not re-staged).
 *  §4 purge: disabled buttons without a reason 0; dead text business
 *     222 -> 0, education 17 -> 0, career 154 -> 0, on the same
 *     grafted state W3 counted on.
 *  §5 bugs: childhood drift warns before it notices; net-worth
 *     snapshot from the yearly advance; title says 2.18; remittance
 *     total has no safe backfill (two live writers only).
 *  §6 venture repricing: a USA cafe and a UAE cafe both launch and
 *     survive 12 months; the launch warning (v2.20: it tests the
 *     part-time-from-home path, wages + other costs vs expected
 *     takings) fires for the cafes whose from-home path loses money,
 *     naming wages, takings and the shortfall in plain words.
 * Exit 0 only when there are no FAILs. */
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

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
const countRe = (html, re) => (String(html).match(re) || []).length;
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

const { createNewLifeState, ensureExtendedState, createPerson, computeNetWorthLocal } = await import('../src/core/schema.js');
const { hashSeed } = await import('../src/core/rng.js');
const { advanceSingleTurn, resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const { tickCareerMonthly, launchSmallBusiness, listAvailableJobs, requestRaiseOrPromotion, presentGraduateOrJobSearchOffers } = await import('../src/systems/careerEducationEngine.js');
const { createBusiness, listAllBusinessVentures, evaluateBusinessLaunch, ventureViabilityWarningHtml } = await import('../src/systems/businessEngine.js');
const { CAREER_WORK_TRACK_IDS, assignCareerWork, resolveCareerWork, getWorkSkillLevel, maybeAssignCareerWork } = await import('../src/systems/careerWork.js');
const { getPerformanceDashboard, promotionScoreParts, headhunterApproachRate, maybeHeadhunterApproach, ensureCareerMarket } = await import('../src/systems/careerMarket.js');
const { spawnWorkplaceCast } = await import('../src/systems/soulEngine.js');
const { checkCareerConsequences, crisisInfo, makeRedundant, redundancyChance, fireJobLossReactions } = await import('../src/systems/careerConsequences.js');
const { businessLastMonthNet, salaryNetFor, financeSalaryLine } = await import('../src/systems/moneyTruth.js');
const { settleHouseholdMonth } = await import('../src/systems/economyEngine.js');
const { renderOperationsMenuHtml } = await import('../src/systems/businessOperations.js');
const { tickFriendshipDrift } = await import('../src/systems/socialEnergy.js');
const {
  renderHudHtml, renderLifeTabHtml, renderEducationTabHtml, renderPeopleTabHtml,
  renderWorkTabHtml, renderRealEstateTabHtml, renderFinanceTabHtml,
  renderLifestyleTabHtml, renderWorldTabHtml, renderBottomDockHtml
} = await import('../src/ui/views.js');
await import('../src/main.js');

/* ---------- test-life helpers (W1 + W2 shapes) ---------- */
function employedLife(seed, track, title = 'Specialist') {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'professional' });
  ensureExtendedState(S);
  S.player.age = 34; S.year = 2024; S.month = 6; S.pacing = 'monthly';
  S.money.cash = 2000000; S.money.creditScore = 700;
  S.career.employed = true;
  S.career.job = {
    employer: 'Test Employer', title, track, level: 1, monthlyGross: 30000,
    startYear: 2023, monthsInRole: 8, performance: 70, workMode: 'normal', bossId: null,
  };
  S.career.trackExperience = { [track]: 2 };
  const { boss } = spawnWorkplaceCast(S, 'Test Employer', track, 30000);
  S.career.job.bossId = boss.id;
  return S;
}
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
function addPerson(S, over = {}) {
  const p = createPerson(S, {
    role: 'friend', relationLabel: 'Friend', residenceCountry: S.country, city: S.city,
    age: 34, affection: 70, respect: 60, trust: 60, ...over
  });
  S.people[p.id] = p;
  return p;
}
const attrAll = (html, attr) => [...html.matchAll(new RegExp(`${attr}="([^"]*)"`, 'g'))].map((m) => m[1]);
const journalTexts = (S) => (S.journal || []).map((e) => e.text || '');
const queuedScenes = (S) => [...(S.sceneQueue || []), ...(S.activeScene ? [S.activeScene] : [])];
const findScene = (S, re) => queuedScenes(S).find((sc) => re.test(sc.title || ''));

/* ================= §1 real work inside the job ================= */
section('§1 real work — tracks, dashboard, skill, achievements, promotion');
{
  const TRACKS = ['medicine', 'aviation', 'teaching', 'law', 'software', 'engineering', 'finance', 'nursing', 'sales', 'hospitality', 'trades', 'media'];
  check('at least 10 tracks have real work templates', CAREER_WORK_TRACK_IDS.length >= 10, `${CAREER_WORK_TRACK_IDS.length} templates`);
  let okTracks = 0;
  for (const track of TRACKS) {
    const S = employedLife(1000 + TRACKS.indexOf(track), track);
    const work = assignCareerWork(S);
    const before = S.career.job.performance;
    const r = resolveCareerWork(S, 'hard', { force: 'success' });
    const good = work && work.title && work.title.length > 10 && work.detail && work.detail.length > 40
      && work.deadlineMonths >= 1 && work.deadlineMonths <= 3 && work.skillId && work.choices.length === 4
      && work.choices.every((c) => c.tradeoff && c.tradeoff.length > 20)
      && work.choices.map((c) => c.id).sort().join(',') === 'corner,difficult,hard,help'
      && r.ok && S.career.job.performance > before;
    if (good) okTracks += 1;
    else console.log(`    track ${track} FAILED — work=${work ? work.title : 'none'} perf ${before}->${S.career.job.performance}`);
  }
  check('all 12 named tracks have real work + 4 choices + a consequence', okTracks === TRACKS.length, `${okTracks}/12`);
}
{
  const S = employedLife(4242, 'software', 'Software Engineer');
  assignCareerWork(S);
  const d0 = getPerformanceDashboard(S);
  const r = resolveCareerWork(S, 'hard', { force: 'success' });
  const d1 = getPerformanceDashboard(S);
  check('a hard win moves the boss view and the numbers', r.ok && d1.bossView.value > d0.bossView.value && d1.numbers.value > d0.numbers.value && d1.numbers.quality > d0.numbers.quality,
    `bossView ${d0.bossView.value}->${d1.bossView.value}, numbers ${d0.numbers.value}->${d1.numbers.value}, quality ${d0.numbers.quality}->${d1.numbers.quality}`);
}
{
  const S = employedLife(4243, 'teaching', 'Classroom Subject Teacher');
  assignCareerWork(S);
  const d0 = getPerformanceDashboard(S);
  const r = resolveCareerWork(S, 'help', {});
  const d1 = getPerformanceDashboard(S);
  check('helping a colleague moves the team view', r.ok && d1.teamView.value !== null && d1.teamView.value > d0.teamView.value,
    `teamView ${d0.teamView.value}->${d1.teamView.value}`);
}
{
  const S = employedLife(4244, 'law', 'Associate Counsel');
  assignCareerWork(S);
  const d0 = getPerformanceDashboard(S);
  const r = resolveCareerWork(S, 'corner', { force: 'caught' });
  const d1 = getPerformanceDashboard(S);
  check('cutting a corner and getting caught damages the boss trust', r.ok && d1.bossView.boss.trust < d0.bossView.boss.trust && d1.bossView.value < d0.bossView.value,
    `boss trust ${d0.bossView.boss.trust}->${d1.bossView.boss.trust}, bossView ${d0.bossView.value}->${d1.bossView.value}`);
}
{
  const S = employedLife(5151, 'aviation', 'First Officer');
  const work = assignCareerWork(S);
  const before = getWorkSkillLevel(S, work.skillId);
  resolveCareerWork(S, 'hard', { force: 'success' });
  const afterUse = getWorkSkillLevel(S, work.skillId);
  check('a skill used in real work rises', afterUse > before, `${work.skillId} ${before}->${afterUse}`);
  for (let i = 0; i < 6; i++) {
    S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; }
    if (S.career.currentWork) S.career.currentWork.monthsLeft = 1;
    maybeAssignCareerWork(S);
  }
  const afterIdle = getWorkSkillLevel(S, work.skillId);
  check('a skill never used falls, slowly', afterIdle < afterUse && afterUse - afterIdle <= 4, `${work.skillId} ${afterUse}->${afterIdle} over 6 idle months`);
}
{
  const S = employedLife(4242, 'software', 'Software Engineer');
  assignCareerWork(S);
  resolveCareerWork(S, 'hard', { force: 'success' });
  const ach = S.career.workAchievements || [];
  const shape = ach.length > 0 && ach.every((a) => a.id && a.label && a.year && a.month && a.trackId);
  check('a visible win records an achievement in the contract shape', shape && S.career.workAchievementCount === ach.length,
    `${ach.length} achievement(s), count=${S.career.workAchievementCount}`);
}
{
  const S = employedLife(6161, 'engineering', 'Project Engineer');
  const stepped0 = promotionScoreParts(S).steppedUp;
  for (let i = 0; i < 2; i++) { assignCareerWork(S); resolveCareerWork(S, 'hard', { force: 'success' }); }
  check('two completions count toward promotion where the check reads them', promotionScoreParts(S).steppedUp === stepped0 + 2,
    `steppedUp ${stepped0}->${promotionScoreParts(S).steppedUp}`);
}

/* ================= §2 desk + unity ================= */
section('§2 desk and one source of truth');
{
  const S = adultLife();
  employ(S);
  const html = renderWorkTabHtml(S);
  const desks = ['current-work', 'pay', 'contract', 'promotion', 'benefits', 'standing', 'actions'];
  const allOnce = desks.every((d) => countOcc(html, `data-desk="${d}"`) === 1);
  check('career tab is a desk: 7 sections, each once', allOnce, desks.map((d) => `${d}=${countOcc(html, `data-desk="${d}"`)}`).join(' '));
  check('the real work card renders inside Current Work (no placeholder left)', !html.includes('<!-- CAREER-WORK-SECTION -->') && html.includes('<h3>Current Work</h3>'));
  const biz = {
    id: 'biz_ops', typeId: 'cafe', name: 'Menu Café', country: 'egy', city: 'Cairo', level: 1,
    maxLevel: Infinity, volatility: 0.05, monthlyRev: 300000, monthlyCost: 80000, capitalInvested: 500000,
    totalCapitalIn: 500000, brandValue: 1000, retainedEarnings: 0, repeatRate: 0.5, mode: 'full_time',
    staff: [], premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 }, history: [], heirId: null, remote: false,
    foundedYear: 2024, foundedMonth: 1, manager: null, ownerManaged: true, ownerHoursPerWeek: 40,
    dead: false, deathCause: null, group: null, brokeOut: false, distressStage: 0, marketSlumpMonths: 0, lastPL: null
  };
  S.career.businesses = [biz]; S.career.business = biz;
  const opsHtml = renderOperationsMenuHtml(S, biz);
  /* (replacement) the 7-<details> menu became six company tabs; all seven topics stay reachable. */
  const allTabs = ['overview', 'products', 'team', 'operations', 'growth', 'money'].map((bizTab) => strip(renderWorkTabHtml(S, { workSub: 'ventures', bizTab }))).join(' ') + ' ' + strip(opsHtml);
  check('business card: six area tabs, and all seven topics (Stock, Pricing, Suppliers, Staff, Marketing, Premises, Cash) are reachable',
    ['Overview', 'Products', 'Team', 'Operations', 'Growth', 'Money'].every((n) => renderWorkTabHtml(S, { workSub: 'ventures' }).includes(`>${n}</button>`)) && [/Stock/, /Pric/, /Supplier/, /Staff|Team/, /Marketing|Brand/, /Premises|Rent/, /Cash|Money/].every((re) => re.test(allTabs)),
    'tabs + topics');
}
{
  const mkBiz = (id, name, lastPL) => ({
    id, typeId: 'cafe', name, country: 'egy', city: 'Cairo', level: 1, maxLevel: Infinity, volatility: 0.05,
    monthlyRev: 300000, monthlyCost: 80000, capitalInvested: 500000, totalCapitalIn: 500000, brandValue: 1000,
    retainedEarnings: 0, repeatRate: 0.5, mode: 'full_time', staff: [],
    premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 }, history: [], heirId: null, remote: false,
    foundedYear: 2024, foundedMonth: 1, manager: null, ownerManaged: true, ownerHoursPerWeek: 40,
    dead: false, deathCause: null, group: null, brokeOut: false, distressStage: 0, marketSlumpMonths: 0, lastPL
  });
  const S = adultLife();
  employ(S);
  const biz = mkBiz('biz_u', 'Unity Café', { year: 2026, month: 1, name: 'Unity Café', typeId: 'cafe', revenue: 120000, rent: 8000, wages: 24000, other: 48000, remote: 0, manager: 0, costs: 80000, profit: 40000, tax: 5000, taxLabel: 'Income tax', net: 35000, wave: 0, repeatRate: 0.5 });
  S.career.businesses = [biz]; S.career.business = biz;
  settleHouseholdMonth(S);
  const cardNet = attrAll(renderWorkTabHtml(S, { workSub: 'ventures', bizTab: 'money' }), 'data-biz-net').map(Number);
  const finNet = attrAll(renderFinanceTabHtml(S, { finSub: 'cashflow' }), 'data-biz-net').map(Number);
  const timeNet = attrAll(renderLifeTabHtml(S, {}), 'data-biz-net').map(Number);
  const helper = businessLastMonthNet(S, biz);
  check('the same business last-month net is identical on the card, Finance and Timeline',
    cardNet.length === 1 && finNet.length === 1 && timeNet.length === 1 && cardNet[0] === helper.net && finNet[0] === helper.net && timeNet[0] === helper.net,
    `card ${cardNet[0]}, finance ${finNet[0]}, timeline ${timeNet[0]}, settled ${helper.net}`);
  const careerNet = Number(attrAll(renderWorkTabHtml(S), 'data-salary-net')[0]);
  const finSal = financeSalaryLine(S);
  check('the same salary net is identical on the Career tab and the Finance tab (quiet year)',
    !!finSal && careerNet === finSal.amount, `career ${careerNet} vs finance ${finSal ? finSal.amount : 'none'}`);
  const C = adultLife();
  C.year = 2009; C.month = 6;
  employ(C);
  const cbiz = mkBiz('biz_c', 'Crisis Café', { year: 2009, month: 6, name: 'Crisis Café', typeId: 'cafe', revenue: 90000, rent: 8000, wages: 24000, other: 40000, remote: 0, manager: 0, costs: 72000, profit: 18000, tax: 2000, taxLabel: 'Income tax', net: 16000, wave: 0, repeatRate: 0.5 });
  C.career.businesses = [cbiz]; C.career.business = cbiz;
  settleHouseholdMonth(C);
  const cCareerNet = Number(attrAll(renderWorkTabHtml(C), 'data-salary-net')[0]);
  const cFinSal = financeSalaryLine(C);
  check('the same salary net is identical on the Career tab and the Finance tab (crisis year, gross ×0.95)',
    !!cFinSal && cCareerNet === cFinSal.amount, `career ${cCareerNet} vs finance ${cFinSal ? cFinSal.amount : 'none'}`);
}

/* ================= §3 connection ================= */
section('§3 connection — job loss, crisis, and the two merge defects');
function jobLossState() {
  const S = adultLife();
  employ(S);
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
  return { S, spouse, child1, child2 };
}
{
  const { S, spouse, child1 } = jobLossState();
  checkCareerConsequences(S);
  check('no job-loss reaction while employed', !queuedScenes(S).some((sc) => /jobloss/i.test(sc.key || '')));
  S.career.employed = false; S.career.job = null; S.career.unemployedMonths = 0;
  const rep = checkCareerConsequences(S);
  const fired = (rep.jobLoss?.fired || []).map((f) => f.kind).sort();
  check('losing a job fires all four reactions (mortgage, spouse, children, visa)', JSON.stringify(fired) === JSON.stringify(['children', 'mortgage', 'spouse', 'visa']), `fired ${fired.join(', ')}`);
  const prop = S.housing.properties[0];
  const monthsBefore = prop.monthsLeft;
  const cashBefore = S.money.cash;
  const mScene = findScene(S, /Bank Writes About/);
  mScene.choices[0].effect(S);
  check('mortgage choice pays the next instalment early (monthsLeft −1, cash −15,000)', prop.monthsLeft === monthsBefore - 1 && S.money.cash === cashBefore - 15000, `months ${monthsBefore}->${prop.monthsLeft}, cash ${cashBefore}->${S.money.cash}`);
  const spScene = findScene(S, /Hears You Lost Your Job/);
  const affBefore = spouse.rel.affection;
  spScene.choices[0].effect(S);
  check('spouse choice tightens the belt (frugal, affection +5)', S.money.lifestyleMode === 'frugal' && spouse.rel.affection === affBefore + 5, `mode ${S.money.lifestyleMode}, affection ${affBefore}->${spouse.rel.affection}`);
  const chScene = findScene(S, /The Children Notice/);
  const trustBefore = child1.rel.trust;
  chScene.choices[0].effect(S);
  check('children choice tells them honestly (trust +4)', child1.rel.trust === trustBefore + 4, `trust ${trustBefore}->${child1.rel.trust}`);
  const vScene = findScene(S, /Your Visa Depends on That Job/);
  check('(replacement) visa scene names the recorded permit and says no sponsor agreement is granted (sponsorship is not modelled, so the sponsor is not named)', !!vScene && /Egypt Work Visa/.test(vScene.text) && /No grace extension or sponsor agreement is granted/.test(vScene.text));
}
{
  const S = adultLife();
  employ(S, { performance: 80, monthsInRole: 12 });
  const quietRate = headhunterApproachRate(S);
  S.year = 2009; S.month = 6;
  const crisisRate = headhunterApproachRate(S);
  check('a crisis year means fewer headhunter calls (8% -> 3.2%)', quietRate === 0.08 && crisisRate === 0.032, `quiet ${quietRate}, crisis ${crisisRate}`);
  const W = adultLife();
  W.year = 2009; W.month = 6;
  employ(W, { performance: 80, monthsInRole: 12 });
  const wRep = checkCareerConsequences(W);
  check('the game says so before it happens: the crisis warning fires first', !!wRep.warning && !!findScene(W, /Your Job Is About to Feel It/), wRep.warning || 'no warning');
  check('no redundancy in the warning month', !wRep.redundancy && redundancyChance(W, crisisInfo(W)) === 0, `chance ${redundancyChance(W, crisisInfo(W))}`);
  W.career.crisisWarnings.financial_crisis_2008 = { year: 2009, month: 5 };
  check('redundancy risk is real a month after the warning (3%/mo)', redundancyChance(W, crisisInfo(W)) === 0.03, `chance ${redundancyChance(W, crisisInfo(W))}`);
  const cashBefore = W.money.cash;
  const red = makeRedundant(W, { force: true });
  check('redundancy fires and pays real severance', red.ok && W.money.cash === cashBefore + red.severance && red.severance > 0, `severance ${red.severance}`);
}
{
  /* MERGE DEFECT 1 — the job-offers scene fired twice in one calendar
     year (a player made redundant, hired, and made redundant again
     hits the 8-unemployed-months trigger twice in the same year). */
  const S = createNewLifeState({ seed: 1814, country: 'egy', birthYear: 1993, familyTier: 'middle', gender: 'm', ambition: 'global_passport' });
  ensureExtendedState(S);
  S.year = 2023; S.month = 2; S.player.age = 29; S.pacing = 'monthly';
  S.career.employed = false; S.career.job = null; S.career.unemployedMonths = 8;
  S.education.university = null;
  presentGraduateOrJobSearchOffers(S);
  const first = queuedScenes(S).filter((sc) => /Headhunter & Network Job Leads/.test(sc.title || '')).length;
  S.activeScene = null; S.sceneQueue = [];
  S.month = 11; // same year, a later month: the old code fired again here
  presentGraduateOrJobSearchOffers(S);
  const second = queuedScenes(S).filter((sc) => /Headhunter & Network Job Leads/.test(sc.title || '')).length;
  check('MERGE DEFECT 1: the job-offers scene fires at most once per calendar year', first === 1 && second === 0, `first call ${first}, second call same year ${second}`);
}
{
  /* MERGE DEFECT 2 — a second job loss in the same calendar year
     re-fired the identical mortgage/spouse/children/visa scenes. */
  const { S } = jobLossState();
  checkCareerConsequences(S);
  S.career.employed = false; S.career.job = null;
  const rep1 = checkCareerConsequences(S);
  check('first job loss fires the four reactions', (rep1.jobLoss?.fired || []).length === 4, `fired ${(rep1.jobLoss?.fired || []).length}`);
  // A second loss in the same year (new job, lost again) — in a later
  // month, so the loss key differs and the year guard is what applies.
  S.month = 6;
  S.career.employed = true;
  S.career.job = mkJob({ employer: 'Orascom Construction', title: 'Site Engineer' });
  S.career._lastMonthEmployed = true;
  S.career.employed = false; S.career.job = null;
  const rep2 = checkCareerConsequences(S);
  const yearSkipped = (rep2.jobLoss?.skipped || []).filter((s) => s.reason === 'already fired this year').length;
  check('MERGE DEFECT 2: a second job loss in the same year does not re-stage the same scenes',
    (rep2.jobLoss?.fired || []).length === 0 && yearSkipped === 4, `fired ${(rep2.jobLoss?.fired || []).length}, year-skipped ${yearSkipped}`);
  check('the repeat loss is still recorded in plain words', journalTexts(S).some((t) => /Lost your job again this year/.test(t)));
  // The redundancy scene: same employer, same year, second time.
  const R = adultLife();
  R.year = 2009; R.month = 6;
  employ(R, { performance: 80, monthsInRole: 12 });
  R.career.crisisWarnings = { financial_crisis_2008: { year: 2009, month: 5 } };
  makeRedundant(R, { force: true });
  const firstScenes = queuedScenes(R).filter((sc) => /Made Redundant at Orascom/.test(sc.title || '')).length;
  R.activeScene = null; R.sceneQueue = [];
  R.career.employed = true; R.career.job = mkJob({ employer: 'Orascom Construction', title: 'Site Engineer' });
  R.career._lastMonthEmployed = true;
  makeRedundant(R, { force: true });
  const secondScenes = queuedScenes(R).filter((sc) => /Made Redundant at Orascom/.test(sc.title || '')).length;
  check('same employer, same year, second redundancy: no repeated scene', firstScenes === 1 && secondScenes === 0, `first ${firstScenes}, second ${secondScenes}`);
}

/* ================= §4 purge (W3 method, same grafted state) ================= */
section('§4 purge — disabled buttons and dead text, counted before and after');
async function buildGraftedState() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm', ambition: 'family' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 30;
  S.money.cash = 607000; S.money.savings = 50000; S.money.creditScore = 650;
  S.education.stage = 'graduated_high';
  S.education.highSchoolScore = 82;
  S.education.degrees = ['engineering'];
  S.education.schoolId = null;
  const jobs = listAvailableJobs(S);
  const j = jobs.find(x => x.title && x.employer) || jobs[0];
  S.career.employed = true;
  S.career.yearsExperience = 5;
  S.career.job = {
    title: j.title, employer: j.employer, track: j.track, level: j.level,
    monthlyGross: (j.pay && j.pay.gross) || 45000, workMode: 'full_time',
    monthsInRole: 12, startYear: 2025, performance: 70, bossId: null
  };
  const spouse = createPerson(S, { age: 29, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id];
  S.marriage.status = 'married';
  for (const age of [8, 5]) {
    const ch = createPerson(S, { age, gender: age === 8 ? 'm' : 'f', role: 'child', relationLabel: age === 8 ? 'Son' : 'Daughter' });
    S.people[ch.id] = ch; S.relations.childIds.push(ch.id);
  }
  S.money.cash = 3000000;
  const res = createBusiness(S, 'restaurant', 'Salem Table', { mode: 'part_time' });
  S.money.cash = 607000;
  if (res.ok) {
    const biz = S.career.businesses[S.career.businesses.length - 1];
    biz.monthsTrading = 3;
    biz.lastPL = { revenue: 108427, costs: 128803, tax: 0, net: -20376, rent: 20000, wages: 60000, other: 48803, franchise: 0, remote: 0, manager: 0, reinvest: 0, harvestOut: 0, taxLabel: 'Tax' };
    biz.history = [{ year: 2025, month: 12, revenue: 108427, costs: 128803, net: -20376 }];
  }
  return S;
}
const LABEL_REASON = /needs|you scored|not taught|degree held|tracks open|launches in|need \d+ more|more point|✓|already|holds |paid|completed|in wallet|in use|starts at|school years over|answer open decision|visa-free|stamped|tutor hired|built|wing added|fulfilled|below .*threshold|not eligible/i;
function countDisabled(html) {
  const btnRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let total = 0, without = 0; const withoutList = [];
  let m;
  while ((m = btnRe.exec(html)) !== null) {
    const attrs = m[1], label = strip(m[2]);
    if (!/\bdisabled\b/.test(attrs)) continue;
    total++;
    const action = (attrs.match(/data-action="([^"]+)"/) || [])[1] || '(no action)';
    const start = m.index, end = btnRe.lastIndex;
    const after = html.slice(end, end + 500);
    const before = html.slice(Math.max(0, start - 500), start);
    const ok = /<span class="lock-reason">/.test(after) || /<span class="lock-reason">/.test(before) || LABEL_REASON.test(label);
    if (!ok) { without++; if (withoutList.length < 25) withoutList.push(`${action} :: "${label}"`); }
  }
  return { total, without, withoutList };
}
{
  const S = await buildGraftedState();
  const uiState = { activeTab: 'life', propMarket: 'local', gulfTarget: 'uae' };
  const sweeps = [
    ['life', () => renderLifeTabHtml(S)],
    ['education', () => renderEducationTabHtml(S, uiState)],
    ['people-circle', () => renderPeopleTabHtml(S, { ...uiState, peopleSub: 'circle' })],
    ['people-marriage', () => renderPeopleTabHtml(S, { ...uiState, peopleSub: 'marriage' })],
    ['people-children', () => renderPeopleTabHtml(S, { ...uiState, peopleSub: 'children' })],
    ['work-jobs', () => renderWorkTabHtml(S, { ...uiState, workSub: 'jobs' })],
    ['work-ventures', () => renderWorkTabHtml(S, { ...uiState, workSub: 'ventures' })],
    ['work-gigs', () => renderWorkTabHtml(S, { ...uiState, workSub: 'gigs' })],
    ['re-myhome', () => renderRealEstateTabHtml(S, { ...uiState, reSub: 'myhome' })],
    ['re-compounds', () => renderRealEstateTabHtml(S, { ...uiState, reSub: 'compounds' })],
    ['re-lands', () => renderRealEstateTabHtml(S, { ...uiState, reSub: 'lands' })],
    ['fin-cashflow', () => renderFinanceTabHtml(S, { ...uiState, finSub: 'cashflow' })],
    ['fin-banks', () => renderFinanceTabHtml(S, { ...uiState, finSub: 'banks' })],
    ['fin-cards', () => renderFinanceTabHtml(S, { ...uiState, finSub: 'cards' })],
    ['fin-markets', () => renderFinanceTabHtml(S, { ...uiState, finSub: 'markets' })],
    ['life-cars', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'cars' })],
    ['life-appearance', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'appearance' })],
    ['life-shop', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'shop' })],
    ['life-pets', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'pets' })],
    ['life-travel', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'travel' })],
    ['life-medical', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'medical' })],
    ['life-legal', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'legal' })],
    ['world-passports', () => renderWorldTabHtml(S, { ...uiState, worldSub: 'passports' })],
    ['world-gulf', () => renderWorldTabHtml(S, { ...uiState, worldSub: 'gulf' })],
    ['world-global', () => renderWorldTabHtml(S, { ...uiState, worldSub: 'global' })]
  ];
  let allHtml = renderHudHtml(S) + renderBottomDockHtml(S);
  for (const [name, fn] of sweeps) {
    try { allHtml += fn(); } catch (e) { console.log(`RENDER ERROR ${name}: ${e.message}`); fail++; }
  }
  const dis = countDisabled(allHtml);
  check('disabled buttons without a visible reason: 5 -> 0', dis.without === 0, `got ${dis.without} (total disabled ${dis.total})${dis.withoutList.length ? ` — ${JSON.stringify(dis.withoutList)}` : ''}`);
  const ventHtml = renderWorkTabHtml(S, { ...uiState, workSub: 'ventures' });
  const eduHtml = renderEducationTabHtml(S, uiState);
  const jobsHtml = renderWorkTabHtml(S, { ...uiState, workSub: 'jobs' });
  const bizReg = [
    ['B1 two-sentence profit line on every launch row', countOcc(ventHtml, 'Profit is unknown until the first month settles. The first profit-and-loss lands at the end of this month.'), 0],
    ['B2 hours note on every launch row', countOcc(ventHtml, 'Full-time adds ~40 hrs/week to your job'), 1],
    ['B3 manager/hours constraint on every launch row', countOcc(ventHtml, 'Needs a manager: ~20,000 EGP/month. You have 4h/week free'), 1],
    ['B4 "Every venture, every lock reason shown"', countOcc(ventHtml, 'Every venture, every lock reason shown'), 0],
    ['B5 staff effect line repeats name+role', countRe(ventHtml, /\b(Chef|Waiter|Manager|Cashier|Cleaner|Driver) [A-Z][a-z]+ [A-Z][A-Za-z-]+:/g), 0],
    ['B6 candidate "hiring costs one month\'s wage."', countOcc(ventHtml, "hiring costs one month's wage."), 0],
    ['B7a staff rules: training sentence', countOcc(ventHtml, "Training costs half a month's wage and adds +8 skill."), 0],
    ['B7b staff rules: promotion sentence', countOcc(ventHtml, "Promoting needs skill 60 and raises the wage to the new role's pay."), 0],
    ['B8 premises "rent shown is the rent charged"', countOcc(ventHtml, 'the rent shown is the rent charged every month'), 0],
    ['B9 "(now level N)" repeats card header', countOcc(ventHtml, '(now level '), 0],
    ['B10 loan lock text twice', countOcc(ventHtml, 'Credit score 650 is below the 700 this loan requires'), 1],
    ['B11 "Last 1 months:"', countOcc(ventHtml, 'Last 1 months:'), 0],
    ['B12 Decisions header repeats ops header', countOcc(ventHtml, "The effect lands in next month's profit and loss."), 0],
    ['B13a marketing "money leaves your cash now"', countOcc(ventHtml, "The money leaves your cash now; the extra revenue lands in next month's profit and loss."), 0],
    ['B13b marketing "spending twice ... worth less"', countOcc(ventHtml, 'Spending twice on the same channel in one month is worth less the second time.'), 0],
    ['B13c marketing per-channel diminishing note', countOcc(ventHtml, 'First spend on this channel this month — a second spend is worth half as much.'), 0],
    ['B14a pricing "(free to set)" x items', countOcc(ventHtml, '(free to set)'), 0],
    ['B14b pricing header restates the numbers below', countOcc(ventHtml, 'high prices earn more per sale but lose customers, low prices keep them'), 0],
    ['B15a supplier blurb restates 70%', countOcc(ventHtml, 'Cheap — but 3 deliveries in 10 never arrive.'), 0],
    ['B15b supplier blurb restates 98%', countOcc(ventHtml, 'Costs more, delivers 98 times in 100.'), 0],
    ['B16 staff rota header restates the buttons', countOcc(ventHtml, 'rota: overtime costs extra pay and tires people out, a day off costs a little revenue and rests them'), 0],
    ['B17a branch option "(cold start)" x15', countOcc(ventHtml, '— cold start)'), 0],
    ['B17b branches paragraph repeats the 1.5x rule', countOcc(ventHtml, 'A branch in a city where you have no presence costs 1.5x to set up and earns less at first.'), 0],
    ['B18 brand "A good name keeps paying"', countOcc(ventHtml, 'A good name keeps paying — a bad month costs it.'), 0],
    ['B19 exits "work as before"', countOcc(ventHtml, 'Selling at valuation and closing for salvage work as before.'), 0],
    ['B20 valuation formula on every for-sale listing', countOcc(ventHtml, '(0.7× capital + 2.8× annual net profit)'), 1],
    ['B21 for-sale "buy blind" warning on every listing', countOcc(ventHtml, "Without it you buy blind — the seller's numbers may hide debts, bad staff or a lease about to end."), 0],
    ['B22a ops branch row title repeats its button', countOcc(ventHtml, '<strong>Open a branch in '), 0],
    /* v2.20 merge — B22b allowed 1, not 0: the one occurrence is I2's
       LIVE fruit-stall decision "Move to a better corner" (cost +
       effect shown, a real decision). A second "Move to" still flags. */
    ['B22b ops move row title repeats its button', countOcc(ventHtml, '<strong>Move to '), 1],
    ['B23a cash "(taxed)" on label AND button', countOcc(ventHtml, '(taxed)'), 1],
    ['B23b cash reinvest label repeats the header rule', countOcc(ventHtml, "of your own cash (lifts next month's revenue)"), 0]
  ];
  let bizDead = 0;
  for (const [id, occ, allowed] of bizReg) bizDead += Math.max(0, occ - allowed);
  check('business dead text 222 -> 0', bizDead === 0, `got ${bizDead}`);
  const eduReg = [
    ['E1 "If you cannot afford it" on every university row', countOcc(eduHtml, 'If you cannot afford it:'), 0],
    ['E2a track card "Switching to this track means"', countOcc(eduHtml, 'Switching to this track means changing school'), 0],
    ['E2b track card "You would lose your current track"', countOcc(eduHtml, "You would lose your current track and start the new system's exams from scratch."), 0]
  ];
  let eduDead = 0;
  for (const [id, occ, allowed] of eduReg) eduDead += Math.max(0, occ - allowed);
  check('education dead text 17 -> 0', eduDead === 0, `got ${eduDead}`);
  const carReg = [
    ['C1 job subheading repeats title+employer', countOcc(jobsHtml, 'Junior Software Engineer — Elsewedy Industrial Group'), 0],
    ['C2 pension note printed twice verbatim', countOcc(jobsHtml, 'Part of your social insurance — the pension share of what is already deducted from your pay. The law gives you no opt-out.'), 1],
    ['C3 dashboard "No manager on record." repeats the manager view', countOcc(jobsHtml, 'No manager on record.'), 0],
    ['C4 take-leave cross-ref repeats the contract cross-ref', countOcc(jobsHtml, 'this is the same balance your contract shows'), 0],
    ['C5 severance/warnings block printed twice', countRe(jobsHtml, /if you were dismissed today, severance would be/gi), 1],
    ['C6a market listing: medical insurance line x35', countOcc(jobsHtml, 'Medical insurance with this job: Public insurance covers basic care; larger employers often add a private plan.'), 0],
    ['C6b market listing: annual leave line x35', countOcc(jobsHtml, "Paid annual leave: 21 days a year (statutory)."), 0],
    ['C6c market listing: sick leave line x35', countOcc(jobsHtml, 'Sick leave: 90 paid days a year.'), 0],
    ['C7 market listing: "same payslip lines" filler x35', countOcc(jobsHtml, 'the same payslip lines the job card shows'), 0],
    ['C8 market listing: "Day-to-day ..." boilerplate x35', countOcc(jobsHtml, 'Day-to-day '), 0]
  ];
  let carDead = 0;
  for (const [id, occ, allowed] of carReg) carDead += Math.max(0, occ - allowed);
  check('career dead text 154 -> 0', carDead === 0, `got ${carDead}`);
  check('the market header still states the standard leave and sick terms once', /Annual leave: 21 days · Sick leave: 90 paid days/.test(jobsHtml) && countOcc(jobsHtml, 'Annual leave: 21 days · Sick leave: 90 paid days') === 1,
    '(replacement) annual leave and paid sick days live once above the listings, not 35 times');
}

/* ================= §5 bugs — the named warts ================= */
section('§5 bugs — the named warts');
{
  const C = createNewLifeState({ seed: 99, country: 'egy', birthYear: 2016, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(C);
  C.year = 2026; C.month = 9; C.player.age = 10; C.pacing = 'yearly';
  const f = createPerson(C, { age: 10, gender: 'm', role: 'friend', relationLabel: 'Friend' });
  C.people[f.id] = f; C.relations.friendIds = [f.id];
  f.rel.lastContactTurn = C.turn; f.rel.lastContactUnknown = false; f.rel.driftState = 'none';
  C.turn += 1; C.year += 1;
  const r1 = tickFriendshipDrift(C);
  check('childhood drift: 12 silent months warn first, never notice in one turn', f.rel.driftState === 'drifting' && r1.warned === 1 && r1.noticed === 0, `state=${f.rel.driftState} warned=${r1.warned} noticed=${r1.noticed}`);
  C.turn += 1; C.year += 1;
  const r2 = tickFriendshipDrift(C);
  check('(replacement) childhood drift: after the warning a child gets no forced notice scene and stays drifting (queueDriftNoticeScene refuses under 18 by design)', f.rel.driftState === 'drifting' && r2.noticed === 0 && !C.sceneQueue.some(s => String(s.key || '').startsWith('drift_')), `state=${f.rel.driftState} noticed=${r2.noticed}`);
}
{
  const A = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(A);
  A.year = 2026; A.month = 12; A.player.age = 30; A.pacing = 'monthly';
  A.money.cash = 100000; A.financeHistory = [];
  const step = () => { A.activeScene = null; A.sceneQueue = []; advanceSingleTurn(A); };
  step();
  const jan = A.financeHistory.filter(h => h.year === 2027);
  check('net-worth snapshot is recorded by the yearly advance, not the render', A.financeHistory.length === 1 && jan.length === 1 && jan[0].netWorth === computeNetWorthLocal(A),
    `snapshots=${A.financeHistory.length} value=${jan[0] ? jan[0].netWorth : 'none'} live=${computeNetWorthLocal(A)}`);
}
{
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const m = html.match(/<title>([^<]*)<\/title>/);
  // v2.19: the title is now 2.19. This check is version-specific by nature —
  // it asserts the title names the CURRENT version, so it is updated openly
  // with the version, not relaxed. (v2.18 had it as 2.18; the 2.5 it replaced
  // is still asserted gone.)
  check('index.html title says 2.20 (was "World Life 2.5")', !!m && m[1].includes('2.20') && !m[1].includes('2.5'), m ? m[1] : 'none');
}
{
  const writers = (readFileSync(new URL('../src/systems/completeLifeSystems.js', import.meta.url), 'utf8').match(/remittedHomeEgpTotal\s*=[^=]/g) || []).length
    + (readFileSync(new URL('../src/systems/economyEngine.js', import.meta.url), 'utf8').match(/remittedHomeEgpTotal\s*=[^=]/g) || []).length;
  check('remittance total: no safe backfill exists — only the two live send paths write it', writers === 2, `${writers} writers`);
}

/* ================= §6 venture repricing ================= */
section('§6 venture repricing — USA and UAE cafes survive, the warning works');
function adultLifeCountry(seed, country) {
  const S = createNewLifeState({ seed, country, birthYear: 1994, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.player.age = 30; S.year = 2026; S.month = 1; S.pacing = 'monthly';
  S.money.cash = 5000000;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function runMonths(S, n) {
  let ran = 0, guard = 0;
  while (ran < n && guard < n * 4 + 40) {
    guard++;
    if (S.gameOver) break;
    if (S.activeScene) { resolveActiveSceneChoice(S, 0); continue; }
    advanceSingleTurn(S);
    ran++;
    if (S.activeScene) resolveActiveSceneChoice(S, 0);
  }
  return ran;
}
function survive(seed, country, typeId) {
  const S = adultLifeCountry(seed, country);
  const r = launchSmallBusiness(S, typeId, `V218 ${typeId}`, { mode: 'full_time' });
  if (!r.ok) return { launched: false, msg: r.msg };
  const biz = r.biz;
  const months = runMonths(S, 12);
  const still = (S.career.businesses || []).find((b) => b.id === biz.id);
  const nets = (biz.history || []).map((p) => p.net);
  return { launched: true, months, alive: !!still && !still.dead, dead: biz.dead, deathCause: biz.deathCause, cash: S.money.cash, month1Net: nets[0], sumNets: nets.reduce((a, b) => a + b, 0) };
}
{
  const usa = survive(777, 'usa', 'cafe');
  check('a USA cafe launches and survives 12 months with sensible play', usa.launched && usa.months === 12 && usa.alive === true && usa.cash >= 0 && usa.sumNets > 0,
    `launched=${usa.launched} months=${usa.months} alive=${usa.alive} cash=${usa.cash} sumNets=${usa.sumNets} ${usa.msg || ''}`);
  const uae = survive(777, 'uae', 'cafe');
  check('a UAE cafe launches and survives 12 months with sensible play', uae.launched && uae.months === 12 && uae.alive === true && uae.cash >= 0 && uae.sumNets > 0,
    `launched=${uae.launched} months=${uae.months} alive=${uae.alive} cash=${uae.cash} sumNets=${uae.sumNets} ${uae.msg || ''}`);
}
{
  const S = adultLifeCountry(777, 'usa');
  const cafe = listAllBusinessVentures(S).find((b) => b.id === 'cafe');
  const ev = evaluateBusinessLaunch(S, cafe);
  /* v2.20 — the warning is no longer the old blind test (starter wages
     vs full takings). It tests the launch the player is about to make:
     part-time from home, run yourself — wages + other costs against
     the expected part-time-from-home takings. For the USA cafe that
     path loses 23,333 USD a month (staff 14,685 + other 51,478 vs
     takings 42,830); only rented premises make it pay. The warning
     names all four numbers in plain words. */
  const warnText = strip(ventureViabilityWarningHtml(S, cafe, ev));
  check('the launch warning appears when the part-time-from-home path loses money, naming wages, takings and shortfall',
    warnText.includes('14,685') && warnText.includes('42,830') && /Est\. loss 23,333 USD\/mo/.test(warnText) && 14685 + 51478 - 42830 === 23333, warnText); /* (replacement) the old 'you will cover about ... from your salary' sentence is now the 'Est. loss' line plus a cost breakdown; the loss reconciles to wages + other - takings */
  check('warning fires for the post-fix USA cafe (shortfall 23,333)', ventureViabilityWarningHtml(S, cafe, ev).includes('23,333'), strip(ventureViabilityWarningHtml(S, cafe, ev)));
  const Su = adultLifeCountry(777, 'uae');
  const cafeU = listAllBusinessVentures(Su).find((b) => b.id === 'cafe');
  check('warning fires for the post-fix UAE cafe (shortfall 64,908)', strip(ventureViabilityWarningHtml(Su, cafeU)).includes('64,908'), strip(ventureViabilityWarningHtml(Su, cafeU)));
}

/* ================= ESM parse ================= */
section('ESM parse — every src file');
{
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) files.push(p);
    }
  };
  walk(new URL('../src', import.meta.url).pathname);
  let bad = 0;
  for (const f of files) {
    try { execSync(`node --check ${JSON.stringify(f)}`, { stdio: 'pipe' }); }
    catch (e) { bad++; console.log(`  ESM FAIL ${f}`); }
  }
  check('ESM parse: 0 failures', bad === 0, `${files.length} files, ${bad} failures`);
}

console.log(`\n==== v218-verify: ${pass} PASS, ${fail} FAIL ====`);
if (failedNames.length) console.log('failed:', failedNames.join(' | '));
process.exit(fail ? 1 : 0);
