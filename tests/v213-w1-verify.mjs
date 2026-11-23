/* v2.13 Worker 1 verify — Progress system (item 1) + Stakes dashboard (item 7).
   Run from the game root: node tests/v213-w1-verify.mjs
   The three shipped tests (DATA_OK / UI_RENDER_OK / coherence 0 defects)
   are NOT run by this harness — run them separately. */
import { createNewLifeState, createPerson, ensureExtendedState, newCoupleRecord } from '../src/core/schema.js';
import { renderLifeTabHtml } from '../src/ui/views.js';
import { computeLiveLegacyScore } from '../src/systems/healthDirectorEngine.js';
import { sellBusiness } from '../src/systems/businessEngine.js';
import { V1_ACHIEVEMENTS } from '../src/data/megaCareerEduMedical.js';
import {
  evaluateProgress, getProgress, levelForXp, xpToNextLevel,
  LEVEL_THRESHOLDS, computeStakes
} from '../src/systems/progressEngine.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const hasAch = (S, id) => (S.progress?.achievements || []).some(a => a && a.id === id);
const achDate = (S, id) => (S.progress?.achievements || []).find(a => a && a.id === id);

/* Adult persona: 30, Egypt, March 2026, recent checkup (so no checkup
   stake), no job, no home, no business, no loans — a clean slate. */
function adultPersona() {
  const S = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 3; S.player.age = 30;
  S.medical.lastCheckupYear = 2026;
  return S;
}

function marry(S, yearsAgo, affection = 80, trust = 80) {
  const spouse = createPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife', affection, trust });
  S.people[spouse.id] = spouse;
  S.relations.spouseIds = [spouse.id];
  S.marriage.status = 'married';
  const couple = newCoupleRecord(S, 'player', spouse.id, { stage: 'married' });
  couple.stageHistory = [{ stage: 'married', year: S.year - yearsAgo, month: S.month }];
  couple.stageSince = { year: S.year - yearsAgo, month: S.month };
  S.marriage.couples.push(couple);
  return spouse;
}

function makeBusiness(S, capital, monthlyRev, monthlyCost) {
  const biz = {
    id: `biz_${S.career.businesses.length + 1}`, name: 'Test Shop', typeId: 'shop',
    country: 'egy', city: S.city, employees: 0, staff: [],
    monthlyRev, monthlyCost, capitalInvested: capital, reputation: 60,
    premises: { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0 },
    misses: 0, monthsLosing: 0, foundedYear: S.year, foundedMonth: S.month
  };
  S.career.businesses.push(biz);
  S.career.business = biz;
  return biz;
}

console.log('--- §0 table: 25 old + 5 new = 30, same table ---');
check('V1_ACHIEVEMENTS has 30 entries', V1_ACHIEVEMENTS.length === 30, `got ${V1_ACHIEVEMENTS.length}`);
for (const id of ['first_business', 'marriage_10_years', 'child_graduating', 'business_sold_profit', 'goal_completed']) {
  check(`new achievement ${id} in the same table`, V1_ACHIEVEMENTS.some(a => a.id === id));
}
check('no duplicate achievement ids', new Set(V1_ACHIEVEMENTS.map(a => a.id)).size === V1_ACHIEVEMENTS.length);

console.log('--- §1a an achievement appears AFTER its event, NOT before ---');
{
  const S = adultPersona();
  evaluateProgress(S);
  check('no first_job before any job', !hasAch(S, 'first_job'));
  check('no first_home before any property', !hasAch(S, 'first_home'));
  check('no first_business before any business', !hasAch(S, 'first_business'));
  check('no goal_completed before any goal is done', !hasAch(S, 'goal_completed'));
  S.career.job = { employer: 'Nile Care Hospital', title: 'Accountant', track: 'finance', level: 1, monthlyGross: 32000, startYear: 2026, monthsInRole: 1 };
  S.career.employed = true;
  evaluateProgress(S);
  check('first_job appears after hiring', hasAch(S, 'first_job'));
  const d = achDate(S, 'first_job');
  check('first_job dated to the current year/month, not a fake past date', d && d.year === 2026 && d.month === 3, JSON.stringify(d));
  S.housing.properties.push({ id: 'p1', name: 'Test Flat', country: 'egy', installmentRemaining: 0 });
  evaluateProgress(S);
  check('first_home appears after buying', hasAch(S, 'first_home'));
  makeBusiness(S, 100000, 50000, 10000);
  evaluateProgress(S);
  check('first_business appears after starting a business', hasAch(S, 'first_business'));
  S.goals.push({ id: 'g0', label: 'Born into it', done: true, doneAge: 0, doneYear: 1996, stages: [] });
  evaluateProgress(S);
  check('a goal completed at age 0 (born into it) does NOT earn the milestone', !hasAch(S, 'goal_completed'));
  S.goals.push({ id: 'g1', label: 'Test goal', done: true, doneAge: 30, doneYear: 2026, stages: [] });
  evaluateProgress(S);
  check('goal_completed appears after a goal is done', hasAch(S, 'goal_completed'));
  check('no duplicate grant on re-evaluation', S.progress.achievements.filter(a => a.id === 'first_job').length === 1);
}

console.log('--- §1b backfill on an existing save uses the CURRENT date ---');
{
  const S = adultPersona();
  S.career.job = { employer: 'Nile Care Hospital', title: 'Accountant', track: 'finance', level: 1, monthlyGross: 32000, startYear: 2020, monthsInRole: 60 };
  S.career.employed = true;
  evaluateProgress(S); /* first evaluation ever: the job predates the panel */
  const d = achDate(S, 'first_job');
  check('backfilled first_job dated to now (2026/3), not the 2020 start', d && d.year === 2026 && d.month === 3, JSON.stringify(d));
}

console.log('--- §1c marriage 10 years + child graduating ---');
{
  const S = adultPersona();
  marry(S, 3);
  evaluateProgress(S);
  check('married earned after wedding', hasAch(S, 'married'));
  check('no marriage_10_years after only 3 years', !hasAch(S, 'marriage_10_years'));
  const S2 = adultPersona();
  marry(S2, 10);
  evaluateProgress(S2);
  check('marriage_10_years earned at 10 years married', hasAch(S2, 'marriage_10_years'));
  const ch = createPerson(S2, { age: 24, gender: 'f', role: 'child', relationLabel: 'Daughter', degree: 'medicine', universityName: 'Cairo University' });
  S2.people[ch.id] = ch; S2.relations.childIds.push(ch.id);
  evaluateProgress(S2);
  check('child_graduating earned when a child holds a degree', hasAch(S2, 'child_graduating'));
  check('first_child earned too', hasAch(S2, 'first_child'));
}

console.log('--- §1d business sold at a profit (and NOT at a loss) ---');
{
  const S = adultPersona();
  const biz = makeBusiness(S, 100000, 50000, 10000); /* profitable: valuation beats capital */
  evaluateProgress(S); /* snapshot the capital while the business is alive */
  const res = sellBusiness(S, biz.id);
  check('profitable business sells', res.ok, res.msg || '');
  evaluateProgress(S);
  check('business_sold_profit earned on a profitable sale', hasAch(S, 'business_sold_profit'));

  const S2 = adultPersona();
  const biz2 = makeBusiness(S2, 100000, 1000, 5000); /* losing: valuation 70k < 100k capital */
  evaluateProgress(S2);
  const res2 = sellBusiness(S2, biz2.id);
  check('losing business sells', res2.ok, res2.msg || '');
  evaluateProgress(S2);
  check('business_sold_profit NOT earned on a loss-making sale', !hasAch(S2, 'business_sold_profit'));

  const S3 = adultPersona();
  const biz3 = makeBusiness(S3, 100000, 50000, 10000);
  /* never evaluated while alive: capital unknown, so no grant — never guessed */
  sellBusiness(S3, biz3.id);
  evaluateProgress(S3);
  check('no profit achievement when the business was never seen alive', !hasAch(S3, 'business_sold_profit'));
}

console.log('--- §1e levels / XP thresholds ---');
check('level 1 at 0 XP', levelForXp(0) === 1);
check('level 1 at 99 XP', levelForXp(99) === 1);
check('level 2 at 100 XP', levelForXp(100) === 2);
check('level 3 at 250 XP', levelForXp(250) === 3);
check('level 10 at 3200 XP', levelForXp(3200) === 10);
check('level caps at 10', levelForXp(99999) === 10);
check('100 XP to next level from 0', xpToNextLevel(0) === 100);
check('no next level at max', xpToNextLevel(3200) === null);
check('thresholds are 0,100,250,450,700,1000,1400,1900,2500,3200',
  JSON.stringify(LEVEL_THRESHOLDS) === JSON.stringify([0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200]));
{
  const S = adultPersona();
  S.career.job = { employer: 'X', title: 'T', track: 'finance', level: 1, monthlyGross: 1000, startYear: 2026, monthsInRole: 1 };
  evaluateProgress(S);
  const p = getProgress(S);
  check('XP sums from earned achievements (first_job = 100)', p.xp === 100 && p.level === 2, `xp=${p.xp} level=${p.level}`);
  check('next milestone named with what earns it', p.next && p.next.label && p.next.desc, JSON.stringify(p.next));
}

console.log('--- §2 panel renders level + next milestone + earned dates ---');
{
  const S = adultPersona();
  S.career.job = { employer: 'Nile Care Hospital', title: 'Accountant', track: 'finance', level: 1, monthlyGross: 32000, startYear: 2026, monthsInRole: 1 };
  S.career.employed = true;
  S.housing.properties.push({ id: 'p1', name: 'Test Flat', country: 'egy', installmentRemaining: 0 });
  /* v2.13 coordinator fix — the render is read-only now (see views.js):
     progress must be evaluated by the action first, exactly as the game
     does it on every action/advance. A render that evaluated progress
     would write journal lines and consume S.seq, shifting later person
     ids and changing NPC outcomes. */
  evaluateProgress(S);
  const html = renderLifeTabHtml(S, {});
  check('panel title renders', /Your Progress/.test(html));
  check('panel shows the level', /Level 3/.test(html)); /* 350 XP: first_job 100 + first_home 100 + bought_apartment_egy 150 */
  check('panel shows XP progress to next level', /XP to Level 4/.test(html));
  check('panel shows the next milestone', /Next milestone:/.test(html));
  check('panel shows an earned achievement with its date', /First Job — March 2026/.test(html));
  check('panel shows the earned count', /Milestones earned \(3\/30\)/.test(html));
  const score = computeLiveLegacyScore(S);
  const shown = [...html.matchAll(/Legacy Score: (\d+)\/100/g)].map(m => Number(m[1]));
  check('panel Legacy Score equals computeLiveLegacyScore(S)', shown.length >= 2 && shown.every(n => n === score),
    `shown=${JSON.stringify(shown)} computed=${score}`);
  check('panel shows the same Legacy reasons', /Why your Legacy Score is/.test(html));
  check('stakes card title renders', /What Is At Stake Right Now/.test(html));
}

console.log('--- §3a stakes: a loan AND a strained marriage BOTH show ---');
{
  const S = adultPersona();
  S.money.loans.push({ id: 'l1', label: 'Personal Loan', balance: 50000, monthlyPayment: 2000, annualRate: 0.18, remainingMonths: 24, country: 'egy', missedMonths: 0 });
  const spouse = marry(S, 2, 30, 35);
  const stakes = computeStakes(S);
  check('loan stake found', stakes.some(s => s.section === 'Money' && /Personal Loan/.test(s.title)));
  check('strained-marriage stake found', stakes.some(s => s.section === 'Relationships' && /strained/.test(s.title)));
  check('loan stake names the balance', stakes.some(s => /50,000/.test(s.title)));
  check('marriage stake names the spouse', stakes.some(s => s.title.includes(spouse.firstName)));
  check('stakes name the consequence (debt chain)', stakes.some(s => /Miss three times/.test(s.consequence)));
  const html = renderLifeTabHtml(S, {});
  check('dashboard shows the loan', /Personal Loan/.test(html));
  check('dashboard shows the strained marriage', /is strained/.test(html));
  check('dashboard does NOT say nothing is at risk', !/Nothing is at risk right now/.test(html));
}

console.log('--- §3b stakes: a clean life shows the nothing-at-risk line ---');
{
  const S = adultPersona();
  marry(S, 2, 80, 85);
  const stakes = computeStakes(S);
  check('clean life has zero stakes', stakes.length === 0, JSON.stringify(stakes.map(s => s.title)));
  const html = renderLifeTabHtml(S, {});
  check('clean life shows "Nothing is at risk right now"', /Nothing is at risk right now/.test(html));
}

console.log('--- §3c stakes: other real records ---');
{
  const S = adultPersona();
  S.medical.conditions.push({ id: 'c1', label: 'High blood pressure', severity: 'moderate', sinceYear: 2025, managed: false });
  let stakes = computeStakes(S);
  check('untreated condition is a stake', stakes.some(s => s.section === 'Health' && /untreated/.test(s.title)));
  const S2 = adultPersona();
  makeBusiness(S2, 100000, 1000, 5000);
  S2.career.businesses[0].monthsLosing = 3; S2.career.businesses[0].misses = 1;
  stakes = computeStakes(S2);
  check('business at risk of closure is a stake', stakes.some(s => s.section === 'Business' && /at risk of closing/.test(s.detail)));
  const S3 = adultPersona();
  S3.housing.properties.push({ id: 'p1', name: 'Test Flat', country: 'egy', installmentRemaining: 120000 });
  stakes = computeStakes(S3);
  check('mortgage balance is a stake', stakes.some(s => s.section === 'Money' && /left to pay/.test(s.title)));
  const S4 = adultPersona();
  S4.medical.lastCheckupYear = 2019;
  stakes = computeStakes(S4);
  check('checkup overdue (7 years) is a stake', stakes.some(s => s.section === 'Health' && /checkup/i.test(s.title)));
  const S5 = adultPersona();
  const father = Object.values(S5.people).find(p => p.role === 'father');
  father.vitals.health = 30;
  stakes = computeStakes(S5);
  check('parent in poor health is a stake', stakes.some(s => s.section === 'Relationships' && /poor health/.test(s.title) && s.title.includes(father.firstName)));
}

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
