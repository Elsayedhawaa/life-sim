/* v2.15 coordinator verify — one headline claim per item, through the real
   functions, on the merged copy. The workers' own scripts (v215-w1..w5)
   carry the full measured suites; this script re-proves the five claims
   the round promised, independently. Run from the working-copy dir:
   node tests/v215-verify.mjs */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth, finalizePropertyPurchase } from '../src/systems/economyEngine.js';
import { findTenant, conditionRentFactor } from '../src/systems/propertyLandlord.js';
import { pensionSlipFor, ensurePension, accruePensionMonth, applyPensionGrowth, maybeHeadhunterApproach } from '../src/systems/careerMarket.js';
import { getMergedCareerTracks, getJobContract, syncEmployerBenefits } from '../src/systems/careerEducationEngine.js';
import { spawnWorkplaceCast } from '../src/systems/soulEngine.js';
import { getEmployersFor } from '../src/data/institutions.js';
import { ensureSocialEnergy, socialEnergy, spendSocialEnergy, requireSocialEnergy, refillSocialEnergy } from '../src/systems/socialEnergy.js';
import { WORLD_EVENTS } from '../src/data/worldEvents.js';
import { worldEventEffects, worldHousePrice } from '../src/systems/worldEvents.js';
import { ALL_RANDOM_LIFE_EVENTS } from '../src/systems/eventEngine.js';
import { buildChainIndex, auditChains, resolveThread, isChainResolved } from '../src/systems/threadResolution.js';
import { recordMemory, pruneMemories, getMemories } from '../src/systems/npcMemory.js';
import '../src/main.js';

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}
function adultLife(seed = 777, country = 'egy') {
  const S = createNewLifeState({ seed, country, birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 35;
  S.money.cash = 5_000_000; S.money.savings = 0; S.legal.residency.kind = 'citizen';
  return S;
}

/* ================= §0 counts ================= */
console.log('--- §0 counts ---');
check('event pool is 574 (571 + 3 memory events)', ALL_RANDOM_LIFE_EVENTS.length === 574, `got ${ALL_RANDOM_LIFE_EVENTS.length}`);
check('at least 15 world events', WORLD_EVENTS.length >= 15, `got ${WORLD_EVENTS.length}`);
check('every world event has a date range and an effect', WORLD_EVENTS.every(e => e.startYear && e.endYear && e.effects), '');

/* ================= §1 property: named tenant pays rent ================= */
console.log('--- §1 property ---');
{
  const S = adultLife(101);
  const r = finalizePropertyPurchase(S, { catalogId: 'test_flat', name: 'Test Flat, Zamalek', shape: 'apartment', country: 'egy', city: 'Cairo', tier: 'standard', rooms: 2, areaM2: 90, nativeValue: 2500000, nativeMonthlyRent: 12000, downInPlayerLocal: 2500000 }, null, { moveIn: false });
  if (!r.ok) throw new Error('buyFlat failed: ' + r.msg);
  const prop = r.prop;
  const found = findTenant(S, prop);
  const t = prop.landlord.tenant;
  check('named tenant is a real person record with a job', found.ok && !!t && !!S.people[t.personId] && !!t.employer && !!t.jobTitle, t && `${t.name}, ${t.jobTitle} at ${t.employer}`);
  t.reliability = 100;
  settleHouseholdMonth(S);
  const rentLines = (S.ledger || []).filter(l => l.label && l.label.startsWith(`Rent from ${prop.name} — paid by ${t.name}`));
  check('settled rent ledger line names the tenant', rentLines.length === 1, rentLines.map(l => l.label).join(' | '));
  check('condition 40 earns less than condition 90 (factor 0.75 vs 1.00)', conditionRentFactor(40) === 0.75 && conditionRentFactor(90) === 1, `40->${conditionRentFactor(40)} 90->${conditionRentFactor(90)}`);
}

/* ================= §2 career: pension identity + headhunter ================= */
console.log('--- §2 career ---');
{
  const slip = pensionSlipFor(40000, 'gbr', 2026, true);
  check('UK pension slip on 40,000/mo: employee 2,000 (5%) + employer 1,200 (3%)', slip.employee === 2000 && slip.employer === 1200, `employee=${slip.employee} employer=${slip.employer}`);
  const S = adultLife(201, 'gbr');
  /* accruePensionMonth guards on a job existing — give the life one. */
  S.career.employed = true;
  S.career.job = { employer: 'Test Employer', title: 'Test Role', track: 'finance', level: 0, monthlyGross: 40000, startYear: S.year, monthsInRole: 12, performance: 80, workMode: 'normal', bossId: null };
  const pen = ensurePension(S);
  for (let i = 0; i < 12; i++) accruePensionMonth(S, pensionSlipFor(40000, 'gbr', 2026, true));
  applyPensionGrowth(S);
  const pot = pen.pot;
  const contributed = 12 * (2000 + 1200);
  check('pension pot after 12 months is contributions + growth (no invented money)', pot > contributed && pot < contributed + 2000 && pot === pen.employeeTotal + pen.employerTotal + pen.growthTotal, `pot=${pot} contributed=${contributed} growth=${pen.growthTotal} employeeTotal=${pen.employeeTotal} employerTotal=${pen.employerTotal}`);
  // Headhunter: employed life on a real track with real employers.
  const H = adultLife(202, 'egy');
  H.education.degrees = ['business', 'engineering', 'law', 'medicine', 'cs'];
  const merged = getMergedCareerTracks(H.year);
  let pick = null;
  for (const [id, track] of Object.entries(merged)) {
    if ((track.reqDegrees || []).length) continue;
    if (!track.rungs || track.rungs.length < 2) continue;
    if (track.rungs[1].minExp > 2) continue;
    if (getEmployersFor(H.country, id).length < 2) continue;
    pick = { id, track }; break;
  }
  if (!pick) throw new Error('no promotable track found for the headhunter check');
  const emp0 = getEmployersFor(H.country, pick.id)[0];
  H.career.employed = true; H.career.unemployedMonths = 0; H.career.retired = false;
  H.career.job = { employer: emp0, title: pick.track.rungs[0].title, track: pick.id, level: 0, monthlyGross: pick.track.rungs[0].monthlyGross || 9000, startYear: H.year, monthsInRole: 8, performance: 80, workMode: 'normal', bossId: null };
  const { boss } = spawnWorkplaceCast(H, emp0, pick.id, H.career.job.monthlyGross);
  H.career.job.bossId = boss.id; getJobContract(H); syncEmployerBenefits(H);
  const hh = maybeHeadhunterApproach(H, { force: true, ignorePerformance: true });
  check('headhunter approaches a good performer with a real offer', hh.ok && !!hh.offer, hh.msg || '');
  check('offer pays more and carries a real trade-off', hh.ok && hh.offer.monthlyGross > H.career.job.monthlyGross && Array.isArray(hh.offer.tradeoffs) && hh.offer.tradeoffs.length >= 1, hh.ok ? `${hh.offer.recruiterName} → ${hh.offer.title} at ${hh.offer.employer}, ${hh.offer.monthlyGross}/mo, trade-offs: ${hh.offer.tradeoffs.join('; ')}` : '');
}

/* ================= §3 social: energy budget ================= */
console.log('--- §3 social ---');
{
  const S = adultLife(301);
  ensureSocialEnergy(S);
  const before = socialEnergy(S);
  check('social energy starts at the monthly max (10)', before.energy === 10 && before.max === 10, `energy=${before.energy} max=${before.max}`);
  check('a call costs exactly 1 energy', spendSocialEnergy(S, 1) === true && socialEnergy(S).energy === 9, `energy=${socialEnergy(S).energy}`);
  const refused = requireSocialEnergy(S, 99);
  check('the game refuses plainly when the energy is gone', refused.ok === false && /social energy/i.test(refused.msg || ''), refused.msg || '');
  refillSocialEnergy(S);
  check('energy refills to the max', socialEnergy(S).energy === 10, `energy=${socialEnergy(S).energy}`);
}

/* ================= §4 world events ================= */
console.log('--- §4 world events ---');
{
  const eff09 = worldEventEffects({ country: 'usa', year: 2009, month: 1 }, 'usa');
  check('2008 crisis: USA house-price factor is exactly 0.75', eff09.housePrice === 0.75, `got ${eff09.housePrice} (${eff09.activeNames.join(', ')})`);
  const p07 = worldHousePrice({ country: 'usa', year: 2007, month: 6 }, 'usa', 200000);
  const p09 = worldHousePrice({ country: 'usa', year: 2009, month: 6 }, 'usa', 200000);
  check('the same house costs less in 2009 than in 2007', p09 < p07, `2007=${p07} 2009=${p09}`);
  const eff65 = worldEventEffects({ country: 'usa', year: 1965, month: 1 }, 'usa');
  check('no world event touches the USA in 1965', eff65.activeNames.length === 0 && eff65.housePrice === 1 && eff65.salary === 1, eff65.activeNames.join(', '));
}

/* ================= §5 threads + memory ================= */
console.log('--- §5 threads + memory ---');
{
  const index = buildChainIndex(ALL_RANDOM_LIFE_EVENTS);
  const audit = auditChains(ALL_RANDOM_LIFE_EVENTS);
  const chains = [...index.chains.keys()];
  check('36 chains, every one with a resolution path', audit.totalChains === 36 && audit.chains.every(a => a.hasResolution), `chains=${audit.totalChains} withoutResolution=${audit.chains.filter(a => !a.hasResolution).length}`);
  const S = adultLife(401);
  const chainId = chains[0];
  resolveThread(S, chainId, { how: 'choice', outcome: 'test ending', lastEventId: 'ev_test' });
  check('a resolved thread is recorded as resolved', isChainResolved(S, chainId) === true, `chain=${chainId}`);
  const person = { rel: { memories: [] } };
  for (let i = 0; i < 7; i++) recordMemory(S, person, 'small_kindness', `Small kindness ${i}`, { weight: 1 });
  pruneMemories(person);
  check('memories cap at 5 (7 small become 5)', getMemories(person).length === 5, `got ${getMemories(person).length}`);
  recordMemory(S, person, 'kept_promise', 'You kept a big promise in 2026', { weight: 3 });
  for (let i = 0; i < 5; i++) recordMemory(S, person, 'small_kindness', `Newer small ${i}`, { weight: 1 });
  pruneMemories(person);
  check('a defining memory survives newer small ones', getMemories(person).some(m => m.kind === 'kept_promise'), getMemories(person).map(m => m.kind).join(', '));
}

console.log(`\nV215 RESULT: ${pass} passed, ${fail} failed${fail ? ' — ' + failures.join('; ') : ''}`);
process.exit(fail ? 1 : 0);
