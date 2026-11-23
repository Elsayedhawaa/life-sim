/* v2.16 Worker 2 — earnability probe: EVERY achievement in the shipped
   list (30) must be earnable from real state. For each id a probe life
   reaches the granting state (or the grant check is shown to read real
   state: set it → grant fires, unset it → grant does not fire).
   The five v2.13-ungrantable achievements are proved here with both
   directions, plus the real paths that feed them (a real vacation writes
   the `Trip:` ledger line the travel scan reads; a real remittance adds
   to the EGP total; tickWorldEvents writes the crisis history the
   survival scan reads). Run from the game root:
   node tests/v216-w2-achievements.mjs */
import { createNewLifeState, ensureExtendedState, createPerson, recordLedgerEntry } from '../src/core/schema.js';
import { V1_ACHIEVEMENTS } from '../src/data/megaCareerEduMedical.js';
import { evaluateProgress, getProgress, ACHIEVEMENT_XP } from '../src/systems/progressEngine.js';
import { sendInternationalRemittance, takeVacationOrPilgrimage } from '../src/systems/completeLifeSystems.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import { tickWorldEvents } from '../src/systems/worldEvents.js';
import { convertCurrency } from '../src/data/economy.js';

let pass = 0, fail = 0;
const results = [];
const check = (name, cond, extra = '') => {
  results.push({ name, ok: !!cond });
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const has = (S, id) => (S.progress.achievements || []).some(a => a && a.id === id);
const earnedOnce = (S, id) => (S.progress.achievements || []).filter(a => a && a.id === id).length === 1;

function adultLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 35;
  S.money.cash = 5_000_000; S.money.savings = 0;
  S.legal.residency.kind = 'citizen';
  return S;
}
function job(level = 1, monthsInRole = 12) {
  return { title: 'Dentist', employer: 'Cairo Clinic', monthlyGross: 10000, track: 'dentistry', level, startYear: 2025, monthsInRole, performance: 75, workMode: 'normal', bossId: null };
}
function marriedCouple(S, marriedYear = 2015) {
  const w = createPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife', firstName: 'Rana' });
  S.people[w.id] = w; S.relations.spouseIds.push(w.id);
  S.marriage.couples.push({
    stage: 'married', partners: ['player', w.id],
    stageHistory: [{ stage: 'married', year: marriedYear, month: 1 }],
    stageSince: { year: marriedYear, month: 1 }
  });
  return w;
}
function addChild(S, degree = null) {
  const c = createPerson(S, { age: 10, gender: 'm', role: 'child', relationLabel: 'Son', firstName: 'Omar' });
  if (degree) c.education = { ...(c.education || {}), degree };
  S.people[c.id] = c; S.relations.childIds.push(c.id);
  return c;
}

/* --- table shape: still 30, no duplicates, XP sums to 4,350 --- */
check('table has 30 achievements', V1_ACHIEVEMENTS.length === 30, `got ${V1_ACHIEVEMENTS.length}`);
check('no duplicate achievement ids', new Set(V1_ACHIEVEMENTS.map(a => a.id)).size === V1_ACHIEVEMENTS.length);
check('XP of all 30 achievements sums to 4350',
  V1_ACHIEVEMENTS.reduce((s, a) => s + (ACHIEVEMENT_XP[a.id] || 100), 0) === 4350);
check('every achievement has a label and desc',
  V1_ACHIEVEMENTS.every(a => a && a.label && a.desc));

/* --- 1 first_job --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('first_job: not earned with no job', !has(S, 'first_job'));
  S.career.job = job(); evaluateProgress(S);
  check('first_job: earned after hiring', has(S, 'first_job') && earnedOnce(S, 'first_job'));
}

/* --- 2 first_promotion --- */
{
  const S = adultLife(); S.career.job = job(1); evaluateProgress(S);
  check('first_promotion: not earned at level 1', !has(S, 'first_promotion'));
  S.career.job.level = 2; evaluateProgress(S);
  check('first_promotion: earned at level 2', has(S, 'first_promotion'));
}

/* --- 3 first_car --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('first_car: not earned with no car', !has(S, 'first_car'));
  S.cars = [{ make: 'Toyota', model: 'Corolla' }]; evaluateProgress(S);
  check('first_car: earned after buying a car', has(S, 'first_car'));
}

/* --- 4 first_home --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('first_home: not earned with no property', !has(S, 'first_home'));
  S.housing.properties = [{ name: 'Flat', country: 'egy' }]; evaluateProgress(S);
  check('first_home: earned after buying a property', has(S, 'first_home'));
}

/* --- 5 married --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('married: not earned while single', !has(S, 'married'));
  marriedCouple(S); evaluateProgress(S);
  check('married: earned after marrying', has(S, 'married'));
}

/* --- 6 first_child --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('first_child: not earned with no children', !has(S, 'first_child'));
  addChild(S); evaluateProgress(S);
  check('first_child: earned after a child', has(S, 'first_child'));
}

/* --- 7 three_children --- */
{
  const S = adultLife(); addChild(S); addChild(S); evaluateProgress(S);
  check('three_children: not earned with 2 children', !has(S, 'three_children'));
  addChild(S); evaluateProgress(S);
  check('three_children: earned with 3 children', has(S, 'three_children'));
}

/* --- 8 first_million --- */
{
  const S = adultLife(); S.money.cash = 900_000; evaluateProgress(S);
  check('first_million: not earned below 1M EGP', !has(S, 'first_million'));
  S.money.cash = 1_500_000; evaluateProgress(S);
  check('first_million: earned at 1.5M EGP', has(S, 'first_million'));
}

/* --- 9 ten_million --- */
{
  const S = adultLife(); S.money.cash = 9_000_000; evaluateProgress(S);
  check('ten_million: not earned below 10M EGP', !has(S, 'ten_million'));
  S.money.cash = 11_000_000; evaluateProgress(S);
  check('ten_million: earned at 11M EGP', has(S, 'ten_million'));
}

/* --- 10 bought_apartment_egy --- */
{
  const S = adultLife(); S.housing.properties = [{ name: 'Flat', country: 'gbr' }]; evaluateProgress(S);
  check('bought_apartment_egy: not earned for a property abroad', !has(S, 'bought_apartment_egy'));
  S.housing.properties.push({ name: 'Cairo Flat', country: 'egy' }); evaluateProgress(S);
  check('bought_apartment_egy: earned for a property in Egypt', has(S, 'bought_apartment_egy'));
}

/* --- 11 returned_home (v2.16 W2 wired) --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('returned_home: not earned by a life never abroad', !has(S, 'returned_home'));
  S.country = 'uae'; evaluateProgress(S);
  check('returned_home: not earned while still abroad', !has(S, 'returned_home'));
  S.country = 'egy'; evaluateProgress(S);
  check('returned_home: earned after moving back home', has(S, 'returned_home') && earnedOnce(S, 'returned_home'));
}

/* --- 12 gold_stash --- */
{
  const S = adultLife(); S.money.goldGrams21k = 49; evaluateProgress(S);
  check('gold_stash: not earned at 49g', !has(S, 'gold_stash'));
  S.money.goldGrams21k = 50; evaluateProgress(S);
  check('gold_stash: earned at 50g', has(S, 'gold_stash'));
}

/* --- 13 gone_abroad --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('gone_abroad: not earned at home', !has(S, 'gone_abroad'));
  S.country = 'uae'; evaluateProgress(S);
  check('gone_abroad: earned after moving abroad', has(S, 'gone_abroad'));
}

/* --- 14 worked_in_gulf --- */
{
  const S = adultLife(); S.career.job = job(); evaluateProgress(S);
  check('worked_in_gulf: not earned working at home', !has(S, 'worked_in_gulf'));
  S.country = 'uae'; evaluateProgress(S);
  check('worked_in_gulf: earned working in the Gulf', has(S, 'worked_in_gulf'));
}

/* --- 15 second_passport --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('second_passport: not earned on one citizenship', !has(S, 'second_passport'));
  S.legal.citizenships = ['egy', 'gbr']; evaluateProgress(S);
  check('second_passport: earned with two citizenships', has(S, 'second_passport'));
}

/* --- 16 business_owner --- */
{
  const S = adultLife(); S.career.businesses = [{ name: 'Café', monthlyRev: 400, monthlyCost: 500 }]; evaluateProgress(S);
  check('business_owner: not earned while the business loses money', !has(S, 'business_owner'));
  S.career.businesses[0].monthlyRev = 1000; evaluateProgress(S);
  check('business_owner: earned when the business turns a profit', has(S, 'business_owner'));
}

/* --- 17 ten_countries (v2.16 W2 wired) --- */
{
  const S = adultLife();
  const trips = ['Istanbul & Cappadocia', 'Dubai', 'Italy (Rome & Florence)', 'France (Paris)',
    'Japan (Tokyo & Kyoto)', 'New York City', 'Canada (Toronto & Vancouver)', 'Australia (Sydney)', 'Brazil (Rio de Janeiro)'];
  for (const t of trips.slice(0, 8)) recordLedgerEntry(S, -5000, `Trip: ${t}`, 'lifestyle', 'cash', 0);
  evaluateProgress(S);
  check('ten_countries: not earned at 9 countries (home + 8 trips)', !has(S, 'ten_countries') && S.progress._visitedCountries.length === 9, `visited=${S.progress._visitedCountries.length}`);
  recordLedgerEntry(S, -5000, `Trip: ${trips[8]}`, 'lifestyle', 'cash', 0);
  evaluateProgress(S);
  check('ten_countries: earned at 10 countries', has(S, 'ten_countries') && S.progress._visitedCountries.length === 10);
  evaluateProgress(S);
  check('ten_countries: idempotent — still exactly one grant', earnedOnce(S, 'ten_countries'));
}

/* --- 18 helped_family (v2.16 W2 wired) --- */
{
  const S = adultLife(); S.money.remittedHomeEgpTotal = 499_999; evaluateProgress(S);
  check('helped_family: not earned at 499,999 EGP sent home', !has(S, 'helped_family'));
  S.money.remittedHomeEgpTotal = 500_000; evaluateProgress(S);
  check('helped_family: earned at 500,000 EGP sent home', has(S, 'helped_family'));
}

/* --- 19 survived_recession (v2.16 W2 wired) --- */
{
  const crisis = (id, businessRevenue, startYear = 2008, startMonth = 1, endYear = 2009, endMonth = 12) => ({
    eventId: id, name: id, startYear, startMonth, endYear, endMonth,
    firedYear: startYear, firedMonth: startMonth, housePrice: 0.92, businessRevenue, salary: 0.95, rateShift: -0.03
  });
  /* sampled path: employed while the crisis runs, still employed after it ends */
  const S = adultLife(); S.year = 2008; S.month = 6;
  S.worldEvents = { fired: { financial_crisis_2008: { year: 2008, month: 1 } }, history: [crisis('financial_crisis_2008', 0.90)] };
  S.career.job = job(1, 12); evaluateProgress(S);
  check('survived_recession: not earned while the crisis still runs', !has(S, 'survived_recession'));
  S.year = 2010; S.month = 1; S.career.job.monthsInRole = 30; evaluateProgress(S);
  check('survived_recession: earned after keeping the job through the crisis', has(S, 'survived_recession'));
  /* no job during the crisis, job only after: never earned */
  const S2 = adultLife(); S2.year = 2010; S2.month = 1;
  S2.worldEvents = { fired: {}, history: [crisis('financial_crisis_2008', 0.90)] };
  S2.career.job = job(1, 2); evaluateProgress(S2);
  check('survived_recession: not earned by a job that started after the crisis', !has(S2, 'survived_recession'));
  /* tenure path: same job held from before the crisis, no evaluation saw it active */
  const S3 = adultLife(); S3.year = 2010; S3.month = 1;
  S3.worldEvents = { fired: {}, history: [crisis('financial_crisis_2008', 0.90)] };
  S3.career.job = job(1, 60); evaluateProgress(S3);
  check('survived_recession: earned by tenure when the job predates the crisis', has(S3, 'survived_recession'));
  /* jobless at the end: not earned, and not earned by finding work later */
  const S4 = adultLife(); S4.year = 2008; S4.month = 6;
  S4.worldEvents = { fired: {}, history: [crisis('financial_crisis_2008', 0.90)] };
  S4.career.job = job(1, 12); evaluateProgress(S4);
  S4.year = 2010; S4.career.job = null; evaluateProgress(S4);
  check('survived_recession: not earned when jobless at the crisis end', !has(S4, 'survived_recession'));
  S4.career.job = job(1, 2); evaluateProgress(S4);
  check('survived_recession: still not earned after finding work later', !has(S4, 'survived_recession'));
  /* a boom is not a crisis for the player there */
  const S5 = adultLife(); S5.year = 2010; S5.month = 1;
  S5.worldEvents = { fired: {}, history: [crisis('oil_shock_1973', 1.15, 1973, 10, 1974, 12)] };
  S5.career.job = job(1, 400); evaluateProgress(S5);
  check('survived_recession: an oil boom is not a crisis', !has(S5, 'survived_recession'));
}

/* --- 20 paid_off_debt --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('paid_off_debt: not earned by a life that never had debt', !has(S, 'paid_off_debt'));
  S.money.loans = [{ id: 'l1', label: 'Car loan', balance: 50000, monthlyPayment: 2000 }];
  evaluateProgress(S);
  S.money.loans = []; S.money.creditCards = []; S.bnplPlans = [];
  evaluateProgress(S);
  check('paid_off_debt: earned after clearing a real debt', has(S, 'paid_off_debt'));
}

/* --- 21 expat_5_years --- */
{
  const S = adultLife(); S.country = 'uae'; S.legal.residency.yearsInCountryLegally = 4; evaluateProgress(S);
  check('expat_5_years: not earned at 4 years abroad', !has(S, 'expat_5_years'));
  S.legal.residency.yearsInCountryLegally = 5; evaluateProgress(S);
  check('expat_5_years: earned at 5 years abroad', has(S, 'expat_5_years'));
}

/* --- 22 expat_10_years --- */
{
  const S = adultLife(); S.country = 'uae'; S.legal.residency.yearsInCountryLegally = 9; evaluateProgress(S);
  check('expat_10_years: not earned at 9 years abroad', !has(S, 'expat_10_years'));
  S.legal.residency.yearsInCountryLegally = 10; evaluateProgress(S);
  check('expat_10_years: earned at 10 years abroad', has(S, 'expat_10_years'));
}

/* --- 23 bought_gold --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('bought_gold: not earned with no gold', !has(S, 'bought_gold'));
  S.money.goldGrams21k = 1; evaluateProgress(S);
  check('bought_gold: earned after buying gold', has(S, 'bought_gold'));
}

/* --- 24 returned_visit (v2.16 W2 wired) --- */
{
  const S = adultLife(); S.country = 'uae';
  recordLedgerEntry(S, -5000, 'Trip: Dubai', 'lifestyle', 'cash', 0); evaluateProgress(S);
  check('returned_visit: not earned by a trip to a foreign country', !has(S, 'returned_visit'));
  recordLedgerEntry(S, -5000, 'Trip: North Coast (Sahel)', 'lifestyle', 'cash', 0); evaluateProgress(S);
  check('returned_visit: earned by a trip home while living abroad', has(S, 'returned_visit') && earnedOnce(S, 'returned_visit'));
  const S2 = adultLife();
  recordLedgerEntry(S2, -5000, 'Trip: North Coast (Sahel)', 'lifestyle', 'cash', 0); evaluateProgress(S2);
  check('returned_visit: not earned by a trip home while living at home', !has(S2, 'returned_visit'));
}

/* --- 25 career_top --- */
{
  const S = adultLife(); S.career.job = job(1); evaluateProgress(S);
  check('career_top: not earned at the bottom of the track', !has(S, 'career_top'));
  S.career.job.level = 99; evaluateProgress(S);
  check('career_top: earned at the top of the track', has(S, 'career_top'));
}

/* --- 26 first_business --- */
{
  const S = adultLife(); evaluateProgress(S);
  check('first_business: not earned with no business', !has(S, 'first_business'));
  S.career.businesses = [{ id: 'b1', name: 'Test Café', monthlyRev: 0, monthlyCost: 100 }]; evaluateProgress(S);
  check('first_business: earned after starting a business', has(S, 'first_business'));
}

/* --- 27 marriage_10_years --- */
{
  const S = adultLife(); marriedCouple(S, 2017); evaluateProgress(S);
  check('marriage_10_years: not earned at 9 years married', !has(S, 'marriage_10_years'));
  S.marriage.couples[0].stageHistory = [{ stage: 'married', year: 2015, month: 1 }];
  S.marriage.couples[0].stageSince = { year: 2015, month: 1 };
  evaluateProgress(S);
  check('marriage_10_years: earned at 10+ years married', has(S, 'marriage_10_years'));
}

/* --- 28 child_graduating --- */
{
  const S = adultLife(); addChild(S); evaluateProgress(S);
  check('child_graduating: not earned while the child has no degree', !has(S, 'child_graduating'));
  addChild(S, 'medicine'); evaluateProgress(S);
  check('child_graduating: earned when a child holds a degree', has(S, 'child_graduating'));
}

/* --- 29 business_sold_profit --- */
{
  const S = adultLife();
  S.career.businesses = [{ id: 'b1', name: 'Test Café', capitalInvested: 10000, monthlyRev: 1000, monthlyCost: 500 }];
  evaluateProgress(S);
  S.career.businesses = [];
  recordLedgerEntry(S, 5000, 'Exited & sold Test Café', 'business', 'cash', 0);
  evaluateProgress(S);
  check('business_sold_profit: not earned on a sale below capital', !has(S, 'business_sold_profit'));
  const S2 = adultLife();
  S2.career.businesses = [{ id: 'b1', name: 'Test Café', capitalInvested: 10000, monthlyRev: 1000, monthlyCost: 500 }];
  evaluateProgress(S2);
  S2.career.businesses = [];
  recordLedgerEntry(S2, 20000, 'Exited & sold Test Café', 'business', 'cash', 0);
  evaluateProgress(S2);
  check('business_sold_profit: earned on a sale above capital', has(S2, 'business_sold_profit'));
}

/* --- 30 goal_completed --- */
{
  const S = adultLife(); S.goals = [{ id: 'g1', done: true, doneAge: 0 }]; evaluateProgress(S);
  check('goal_completed: not earned for a goal done at age 0', !has(S, 'goal_completed'));
  S.goals = [{ id: 'g1', done: true, doneAge: 25 }]; evaluateProgress(S);
  check('goal_completed: earned for a goal done at 25', has(S, 'goal_completed'));
}

/* --- a newborn earns nothing --- */
{
  const S = createNewLifeState({ seed: 42, country: 'egy', birthYear: 2026, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  evaluateProgress(S);
  check('newborn earns no achievement', (S.progress.achievements || []).length === 0, JSON.stringify(S.progress.achievements));
}

/* --- REAL PATHS: the actions that feed the five wirings --- */
{
  /* Real remittance: a SWIFT wire home adds its EGP value to the total. */
  const S = adultLife(); S.country = 'uae'; S.money.cash = 100_000;
  const before = Number(S.money.remittedHomeEgpTotal) || 0;
  const res = sendInternationalRemittance(S, 'swift_wire', 1000);
  const expected = before + Math.round(convertCurrency(1000, 'uae', 'egy', S.year));
  check('real path: sendInternationalRemittance succeeds', !!res.ok, res.msg || '');
  check('real path: remittance adds its EGP value to the lifetime total',
    Number(S.money.remittedHomeEgpTotal) === expected,
    `total=${S.money.remittedHomeEgpTotal} expected=${expected}`);
  /* A big wire crosses the threshold and grants Family Provider. */
  S.money.cash = 5_000_000;
  sendInternationalRemittance(S, 'swift_wire', 40_000);
  evaluateProgress(S);
  check('real path: a large wire grants helped_family', has(S, 'helped_family'));

  /* Real monthly remittance: one monthly settlement adds one month. */
  const S2 = adultLife(); S2.country = 'uae'; S2.money.cash = 100_000;
  S2.money.remittanceMonthlyLocal = 2000;
  const before2 = Number(S2.money.remittedHomeEgpTotal) || 0;
  settleHouseholdMonth(S2);
  const expected2 = before2 + Math.round(convertCurrency(2000, 'uae', 'egy', S2.year));
  check('real path: settleHouseholdMonth adds one month of remittance in EGP',
    Number(S2.money.remittedHomeEgpTotal) === expected2,
    `total=${S2.money.remittedHomeEgpTotal} expected=${expected2}`);

  /* Real trip: a vacation home from abroad writes the Trip ledger line
     and the next evaluation grants Home for Visit. */
  const S3 = adultLife(); S3.country = 'uae'; S3.money.cash = 500_000;
  S3.legal.passports[0].expiresYear = 2035;
  if (S3.legal.military) S3.legal.military.travelPermitted = true;
  const trip = takeVacationOrPilgrimage(S3, 'north_coast');
  check('real path: vacation home from abroad succeeds', !!trip.ok, trip.msg || '');
  check('real path: the trip wrote a Trip ledger line',
    (S3.ledger || []).some(e => e && String(e.label || '').startsWith('Trip:')));
  evaluateProgress(S3);
  check('real path: the trip home grants returned_visit', has(S3, 'returned_visit'));
  check('real path: the trip country counts toward ten_countries',
    (S3.progress._visitedCountries || []).includes('egy'));

  /* Real world event: tickWorldEvents in 2008 writes the crisis history. */
  const S4 = adultLife(); S4.country = 'egy'; S4.year = 2008; S4.month = 9; S4.player.age = 18;
  S4.career.job = job(1, 12);
  const fired = tickWorldEvents(S4);
  check('real path: tickWorldEvents fires the 2008 crisis in Egypt', (fired || []).includes('financial_crisis_2008'), JSON.stringify(fired));
  const hist = (S4.worldEvents.history || []).find(h => h.eventId === 'financial_crisis_2008');
  check('real path: the crisis history records a business fall', !!(hist && Number(hist.businessRevenue) < 1), JSON.stringify(hist));
  evaluateProgress(S4);
  S4.year = 2010; S4.month = 7; S4.career.job.monthsInRole = 36; evaluateProgress(S4);
  check('real path: the fired crisis grants survived_recession after it ends', has(S4, 'survived_recession'));
}

/* --- every achievement in the table is earnable: full-life sweep --- */
{
  const S = adultLife();
  /* monthsInRole 220: this job started Sep 2007, before the Sep 2008
     crisis — so the tenure proof covers the crisis (see §19). */
  S.career.job = job(99, 220);
  S.cars = [{ make: 'Toyota' }];
  S.housing.properties = [{ name: 'Cairo Flat', country: 'egy' }];
  marriedCouple(S, 2015);
  addChild(S, 'medicine'); addChild(S); addChild(S);
  S.money.cash = 12_000_000; S.money.goldGrams21k = 60;
  S.money.remittedHomeEgpTotal = 600_000;
  S.legal.citizenships = ['egy', 'gbr'];
  S.career.businesses = [{ id: 'b1', name: 'Test Café', capitalInvested: 10000, monthlyRev: 5000, monthlyCost: 1000 }];
  S.country = 'uae'; S.legal.residency.yearsInCountryLegally = 12;
  S.goals = [{ id: 'g1', done: true, doneAge: 30 }];
  S.money.loans = [{ id: 'l1', label: 'Loan', balance: 1000, monthlyPayment: 100 }];
  evaluateProgress(S);
  S.money.loans = []; S.money.creditCards = []; S.bnplPlans = [];
  const trips = ['Istanbul & Cappadocia', 'Dubai', 'Italy (Rome & Florence)', 'France (Paris)',
    'Japan (Tokyo & Kyoto)', 'New York City', 'Canada (Toronto & Vancouver)', 'Australia (Sydney)', 'Brazil (Rio de Janeiro)'];
  for (const t of trips) recordLedgerEntry(S, -5000, `Trip: ${t}`, 'lifestyle', 'cash', 0);
  recordLedgerEntry(S, -5000, 'Trip: North Coast (Sahel)', 'lifestyle', 'cash', 0);
  S.worldEvents = { fired: {}, history: [{ eventId: 'financial_crisis_2008', startYear: 2008, startMonth: 1, endYear: 2009, endMonth: 12, businessRevenue: 0.90 }] };
  evaluateProgress(S);
  /* sell the business at a profit, then move back home */
  S.career.businesses = [];
  recordLedgerEntry(S, 50000, 'Exited & sold Test Café', 'business', 'cash', 0);
  evaluateProgress(S);
  S.country = 'egy'; evaluateProgress(S);
  const missing = V1_ACHIEVEMENTS.filter(a => !has(S, a.id)).map(a => a.id);
  check('sweep: all 30 achievements earned in one full life', missing.length === 0, `missing: ${missing.join(', ')}`);
  const p = getProgress(S);
  check('sweep: panel total is 30 and earned is 30', p.total === 30 && p.earned.length === 30, `total=${p.total} earned=${p.earned.length}`);
  check('sweep: level 10 reached on a full life', p.level === 10 && p.xp === 4350, `level=${p.level} xp=${p.xp}`);
}

console.log(`\nv216-w2-achievements: ${pass} passed, ${fail} failed, ${results.length} checks`);
if (fail > 0) process.exitCode = 1;
