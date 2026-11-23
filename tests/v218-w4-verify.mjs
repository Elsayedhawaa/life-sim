#!/usr/bin/env node
/* v2.18 W4 verify — venture repricing per country.
 * Run from the game root:  node tests/v218-w4-verify.mjs
 *
 * SENSIBLE PLAY (defined exactly, here and nowhere else): an adult
 * life (age 30, year 2026, middle family, all six degrees so no
 * venture is licence-locked, financial IQ 45, citizen, 5,000,000 in
 * local cash so capital is never the gate) launches ONE venture
 * full-time, self-run, through the game's own launch path
 * (launchSmallBusiness) — no manager, no rented premises, no
 * decisions, no training, no expansion — and then settles 12 months
 * through the real monthly turn (advanceSingleTurn, scenes resolved
 * with choice 0, the distribution script's own pattern). Survival
 * means: 12 months ran, the business is still held and not dead,
 * personal cash never went negative, and the 12 settled nets sum
 * positive (a business kept alive only by the owner's pocket does
 * not count as viable).
 *
 * EGYPT NOTE. The brief quotes the v2.14-era portfolio month-1 nets
 * (-41,318 / 7,711 / 25,752 / 87,570 / 116,580). Those are stale:
 * the PRISTINE v2.17 working copy already prints -48,960 / 5,164 /
 * 25,063 / 87,661 / 129,672 (the v2.15-v2.17 settlement changes moved
 * them — brand, market shocks, morale drift). v2.20 moved them again
 * (I3 fix 1 charges the real other costs): the merged tree prints
 * -39,328 / -14,760 / 10,749 / 67,731 / 143,577. Egypt-unchanged is
 * therefore checked against the v2.20 numbers, measured on the
 * merged tree, and against the pre-fix launch figures recorded in
 * the probe. This script asserts the v2.20 numbers, not the brief's
 * and not the v2.17 ones.
 *
 * Exit 0 when every check passes, 1 otherwise.
 */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import { launchSmallBusiness } from '../src/systems/careerEducationEngine.js';
import {
  listAllBusinessVentures, evaluateBusinessLaunch, ventureWageScale,
  ventureViabilityWarningHtml
} from '../src/systems/businessEngine.js';
import { roleWageLocal, staffRolesForType } from '../src/systems/businessStaff.js';
import { makeForSaleListing } from '../src/systems/businessAcquisitions.js';

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

function adultLife(seed, country, birthYear = 1994, age = 30) {
  const S = createNewLifeState({ seed, country, birthYear, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.player.age = age; S.year = 2026; S.month = 1; S.pacing = 'monthly';
  S.money.cash = 5000000;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function wageBill(S, typeId) {
  return staffRolesForType(typeId).slice(0, 3)
    .reduce((s, r) => s + (Number(roleWageLocal(S, r, S.country)) || 0), 0);
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
  const S = adultLife(seed, country);
  const r = launchSmallBusiness(S, typeId, `W4 ${typeId}`, { mode: 'full_time' });
  if (!r.ok) return { launched: false, msg: r.msg };
  const biz = r.biz;
  const months = runMonths(S, 12);
  const still = (S.career.businesses || []).find((b) => b.id === biz.id);
  const nets = (biz.history || []).map((p) => p.net);
  return {
    launched: true, months, alive: !!still && !still.dead, dead: biz.dead,
    deathCause: biz.deathCause, cash: S.money.cash,
    month1Net: nets[0], sumNets: nets.reduce((a, b) => a + b, 0), nets
  };
}

/* ================= §0 the scale itself ================= */
console.log('--- §0 ventureWageScale ---');
{
  check('Egypt scale is exactly 1 (2026)', ventureWageScale('egy', 2026) === 1, `got ${ventureWageScale('egy', 2026)}`);
  check('Egypt scale is exactly 1 (1990)', ventureWageScale('egy', 1990) === 1, `got ${ventureWageScale('egy', 1990)}`);
  check('Egypt scale is exactly 1 (1960)', ventureWageScale('egy', 1960) === 1, `got ${ventureWageScale('egy', 1960)}`);
  const usa26 = ventureWageScale('usa', 2026);
  check('USA 2026 scale is the mid-salary ratio (~19.07)', Math.abs(usa26 - 19.066) < 0.01, `got ${usa26}`);
  const uae26 = ventureWageScale('uae', 2026);
  check('UAE 2026 scale is the mid-salary ratio (~14.44)', Math.abs(uae26 - 14.442) < 0.01, `got ${uae26}`);
  check('unknown country id gets scale 1 (no repricing)', ventureWageScale('are', 2026) === 1, `got ${ventureWageScale('are', 2026)}`);
  const tur60 = ventureWageScale('tur', 1960);
  check('Turkey 1960 falls back to the 2026 ratio (degenerate old-lira machinery)', Number.isFinite(tur60) && tur60 > 0 && Math.abs(tur60 - ventureWageScale('tur', 2026)) < 0.001, `got ${tur60}`);
  const allOk = ['egy', 'sau', 'uae', 'gbr', 'usa', 'deu', 'can', 'aus', 'nld', 'fra', 'jpn', 'ita', 'sgp', 'bra', 'ind', 'che', 'swe', 'tur'].every((c) => {
    const s = ventureWageScale(c, 2026);
    return Number.isFinite(s) && s >= 0.05 && s <= 50;
  });
  check('all 18 countries have a finite scale inside the [0.05, 50] rail (2026)', allOk);
}

/* ================= §1 Egypt unchanged ================= */
console.log('--- §1 Egypt unchanged ---');
{
  const S = adultLife(777, 'egy');
  const cafe = listAllBusinessVentures(S).find((b) => b.id === 'cafe');
  const ev = evaluateBusinessLaunch(S, cafe);
  console.log(`Egypt cafe launch: rev ${ev.revLocal} cost ${ev.costLocal} capital ${ev.capitalLocal} wages ${ev.wageEstimateLocal} scale ${ev.ventureScale}`);
  check('Egypt cafe takings unchanged (290,316)', ev.revLocal === 290316, `got ${ev.revLocal}`);
  check('Egypt cafe other costs unchanged (200,988)', ev.costLocal === 200988, `got ${ev.costLocal}`);
  check('Egypt cafe capital unchanged (1,004,940)', ev.capitalLocal === 1004940, `got ${ev.capitalLocal}`);
  check('Egypt cafe wage bill unchanged (43,000)', ev.wageEstimateLocal === 43000, `got ${ev.wageEstimateLocal}`);
  /* v2.14 §1 portfolio, exact setup (birthYear 1990 / age 35) — nets
     must equal the v2.20 re-measured numbers (see header note), not
     the brief's v2.14-era ones and not the v2.17 ones. */
  const P = adultLife(777, 'egy', 1990, 35); P.money.cash = 20_000_000; P.reputation = 80;
  const r1 = launchSmallBusiness(P, 'cafe', 'Portfolio Café', { mode: 'part_time' });
  const r2 = launchSmallBusiness(P, 'retail_shop', 'Portfolio Shop', { mode: 'part_time' });
  const r3 = launchSmallBusiness(P, 'bakery', 'Portfolio Bakery', { mode: 'part_time' });
  const mgrA = { name: 'Salon Manager', skill: 70, wage: 20000, loyalty: 70, personId: null, policy: 'safe' };
  const mgrB = { name: 'Restaurant Manager', skill: 60, wage: 18000, loyalty: 70, personId: null, policy: 'safe' };
  const r4 = launchSmallBusiness(P, 'salon', 'Portfolio Salon', { mode: 'full_time', manager: mgrA, runBy: 'manager' });
  const r5 = launchSmallBusiness(P, 'restaurant', 'Portfolio Restaurant', { mode: 'full_time', manager: mgrB, runBy: 'manager' });
  check('portfolio launches all ok', r1.ok && r2.ok && r3.ok && r4.ok && r5.ok, [r1, r2, r3, r4, r5].map((r) => r.msg).join(' | '));
  settleHouseholdMonth(P);
  const nets = P.career.businesses.map((b) => b.lastPL.net);
  console.log('Egypt portfolio month-1 nets:', nets.join(', '));
  /* v2.20 re-measured: I3 fix 1 charges the real other costs (the old
     code subtracted the wage bill from them and collapsed 10 ventures
     to a 100 floor), so the nets moved from the v2.17 figures. The
     v2.17 numbers are kept in the comment so no future round quotes
     them as current: -48,960 / 5,164 / 25,063 / 87,661 / 129,672. */
  const pristine = [-39328, -14760, 10749, 67731, 143577];
  check('Egypt portfolio month-1 nets equal the v2.20 re-measured numbers', nets.length === 5 && nets.every((n, i) => n === pristine[i]), `got ${nets.join(', ')} vs pristine ${pristine.join(', ')}`);
}

/* ================= §2 every venture viable in every country ================= */
console.log('--- §2 takings cover the wage bill, every country ---');
{
  const countries = ['egy', 'sau', 'uae', 'gbr', 'usa', 'deu', 'can', 'aus', 'nld', 'fra', 'jpn', 'ita', 'sgp', 'bra', 'ind', 'che', 'swe', 'tur'];
  let worst = { ratio: 0, where: '' };
  let checked = 0;
  for (const c of countries) {
    const S = adultLife(777, c);
    S.money.cash = 500_000_000; /* capital never the gate for this count */
    for (const v of listAllBusinessVentures(S)) {
      const ev = evaluateBusinessLaunch(S, v);
      if (!ev.ok) continue;
      checked++;
      const w = wageBill(S, v.id);
      const ratio = w / ev.revLocal;
      if (ratio > worst.ratio) worst = { ratio, where: `${c}/${v.id}` };
      if (!(ev.revLocal > w)) console.log(`  NOT VIABLE: ${c}/${v.id} rev ${ev.revLocal} wages ${w}`);
    }
  }
  console.log(`checked ${checked} launchable (country, venture) pairs; worst wage/takings ratio ${worst.ratio.toFixed(3)} at ${worst.where}`);
  check('every launchable venture in all 18 countries has takings above its 3-role wage bill', worst.ratio < 1, `worst ${worst.ratio.toFixed(3)} at ${worst.where}`);
  check('worst wage/takings ratio is the Egypt fruit-stall ratio (~0.54)', worst.ratio < 0.6 && worst.where.endsWith('fruit_stall'), `worst ${worst.ratio.toFixed(3)} at ${worst.where}`);
}

/* ================= §3 USA cafe: before / after + 12-month survival ================= */
console.log('--- §3 USA cafe survives 12 months ---');
{
  const S = adultLife(777, 'usa');
  const cafe = listAllBusinessVentures(S).find((b) => b.id === 'cafe');
  const ev = evaluateBusinessLaunch(S, cafe);
  /* Pre-fix reconstruction: the unscaled FX-only numbers. */
  const preRev = Math.round(ev.revLocal / ev.ventureScale);
  const preWages = ev.wageEstimateLocal; /* wages were never scaled */
  console.log(`USA cafe: pre-fix rev ${preRev} vs wages ${preWages}; post-fix rev ${ev.revLocal} vs wages ${preWages} (scale ${ev.ventureScale.toFixed(3)}, wage/rev ${(preWages / ev.revLocal).toFixed(3)})`);
  check('USA cafe pre-fix takings were $5,200 (the v2.17 measurement)', preRev === 5200, `got ${preRev}`);
  check('USA cafe pre-fix wage bill was $14,685 (2026)', preWages === 14685, `got ${preWages}`);
  check('USA cafe post-fix wage/takings ratio equals Egypt (0.148)', Math.abs(preWages / ev.revLocal - 0.148) < 0.001, `got ${(preWages / ev.revLocal).toFixed(3)}`);
  const res = survive(777, 'usa', 'cafe');
  console.log(`USA cafe 12mo: months=${res.months} alive=${res.alive} cash=${res.cash} month1net=${res.month1Net} sumNets=${res.sumNets} nets=[${(res.nets || []).join(',')}]`);
  check('USA cafe launched', res.launched, res.msg || '');
  check('USA cafe ran 12 months', res.months === 12, `ran ${res.months}`);
  check('USA cafe alive at month 12', res.alive === true, `dead=${res.dead} cause=${res.deathCause}`);
  check('USA cafe cash never negative', typeof res.cash === 'number' && res.cash >= 0, `cash ${res.cash}`);
  check('USA cafe 12 settled nets sum positive (not kept alive by the owner\'s pocket)', res.sumNets > 0, `sum ${res.sumNets}`);
}

/* ================= §4 UAE cafe + UAE restaurant survive 12 months ================= */
console.log('--- §4 UAE ventures survive 12 months ---');
{
  const S = adultLife(777, 'uae');
  const cafe = listAllBusinessVentures(S).find((b) => b.id === 'cafe');
  const ev = evaluateBusinessLaunch(S, cafe);
  console.log(`UAE cafe: pre-fix rev ${Math.round(ev.revLocal / ev.ventureScale)} vs wages ${ev.wageEstimateLocal}; post-fix rev ${ev.revLocal} (scale ${ev.ventureScale.toFixed(3)}, wage/rev ${(ev.wageEstimateLocal / ev.revLocal).toFixed(3)})`);
  check('UAE cafe pre-fix takings were 19,097 AED against 40,850 AED wages', Math.round(ev.revLocal / ev.ventureScale) === 19097 && ev.wageEstimateLocal === 40850, `got rev ${Math.round(ev.revLocal / ev.ventureScale)} wages ${ev.wageEstimateLocal}`);
  const resCafe = survive(777, 'uae', 'cafe');
  console.log(`UAE cafe 12mo: months=${resCafe.months} alive=${resCafe.alive} cash=${resCafe.cash} month1net=${resCafe.month1Net} sumNets=${resCafe.sumNets}`);
  check('UAE cafe launched', resCafe.launched, resCafe.msg || '');
  check('UAE cafe ran 12 months and is alive', resCafe.months === 12 && resCafe.alive === true, `months ${resCafe.months} dead=${resCafe.dead} cause=${resCafe.deathCause}`);
  check('UAE cafe cash never negative', typeof resCafe.cash === 'number' && resCafe.cash >= 0, `cash ${resCafe.cash}`);
  check('UAE cafe 12 settled nets sum positive', resCafe.sumNets > 0, `sum ${resCafe.sumNets}`);
  /* Second UAE venture, from the V1 table (not the modern row): the
     fix must hold for both tables, not just the cafe's modern row. */
  const resRest = survive(777, 'uae', 'restaurant');
  console.log(`UAE restaurant 12mo: months=${resRest.months} alive=${resRest.alive} cash=${resRest.cash} month1net=${resRest.month1Net} sumNets=${resRest.sumNets}`);
  check('UAE restaurant launched', resRest.launched, resRest.msg || '');
  check('UAE restaurant ran 12 months and is alive', resRest.months === 12 && resRest.alive === true, `months ${resRest.months} dead=${resRest.dead} cause=${resRest.deathCause}`);
  check('UAE restaurant 12 settled nets sum positive', resRest.sumNets > 0, `sum ${resRest.sumNets}`);
}

/* ================= §5 the warning ================= */
console.log('--- §5 ventureViabilityWarningHtml ---');
{
  const S = adultLife(777, 'usa');
  const cafe = listAllBusinessVentures(S).find((b) => b.id === 'cafe');
  const ev = evaluateBusinessLaunch(S, cafe);
  /* v2.20 — the warning is no longer the old blind test (starter wages
     vs full takings). It tests the launch the player is about to make:
     part-time from home, run yourself — wages + other costs against
     the expected part-time-from-home takings. For the USA cafe that
     path loses 23,333 USD a month (staff 14,685 + other 51,478 vs
     takings 42,830); only rented premises make it pay. The warning
     names all four numbers in plain words. */
  const warnHtml = ventureViabilityWarningHtml(S, cafe, ev);
  const warnText = strip(warnHtml);
  console.log('warning text:', warnText);
  check('warning appears when the part-time-from-home path loses money', warnHtml.length > 0, 'empty');
  check('warning names the wage bill ($14,685)', warnText.includes('14,685'), warnText);
  check('warning names the expected part-time-home takings (42,830)', warnText.includes('42,830'), warnText);
  check('warning says the shortfall in plain words (23,333 a month from your salary)', warnText.includes('you will cover about 23,333 USD a month from your salary'), warnText);
  /* A synthetic state where wages exceed takings, straight through the helper. */
  const synth = ventureViabilityWarningHtml(S, cafe, { wageEstimateLocal: 20000, costLocal: 0, managerWageEstimateLocal: 0, expectedRevPartTimeHome: 10000, monthlyCostPartTimeHomeSelf: 20000, monthlyCostPartTimeHomeManagerRun: 20000, expectedRevFullTimeHome: 10000, monthlyCostFullTimeHomeSelf: 20000 });
  check('warning appears on a synthetic wages > takings state', strip(synth).includes('20,000') && strip(synth).includes('10,000'), strip(synth));
  /* And it fires (not silent) for the cafes whose from-home paths lose
     money — USA, Egypt and UAE alike. Only rented premises make them
     pay; the warning says so with the measured shortfall. */
  check('warning fires for the post-fix USA cafe (shortfall 23,333)', ventureViabilityWarningHtml(S, cafe, ev).includes('23,333'), strip(ventureViabilityWarningHtml(S, cafe, ev)));
  const Se = adultLife(777, 'egy');
  const cafeE = listAllBusinessVentures(Se).find((b) => b.id === 'cafe');
  check('warning fires for the Egypt cafe (shortfall 68,324)', strip(ventureViabilityWarningHtml(Se, cafeE)).includes('68,324'), strip(ventureViabilityWarningHtml(Se, cafeE)));
  const Su = adultLife(777, 'uae');
  const cafeU = listAllBusinessVentures(Su).find((b) => b.id === 'cafe');
  check('warning fires for the post-fix UAE cafe (shortfall 64,908)', strip(ventureViabilityWarningHtml(Su, cafeU)).includes('64,908'), strip(ventureViabilityWarningHtml(Su, cafeU)));
  check('warning with no args is empty, not a throw', ventureViabilityWarningHtml(null, null) === '');
}

/* ================= §6 a business for sale uses the same repriced table ================= */
console.log('--- §6 for-sale pricing matches launch pricing ---');
{
  const S = adultLife(777, 'usa');
  const cafe = listAllBusinessVentures(S).find((b) => b.id === 'cafe');
  const ev = evaluateBusinessLaunch(S, cafe);
  const listing = makeForSaleListing(S, { typeId: 'cafe', ageYears: 2, repeatRate: 0.6, hidden: {} });
  console.log(`USA for-sale cafe: monthlyRev ${listing.monthlyRev} vs launch revLocal ${ev.revLocal}; monthlyCost ${listing.monthlyCost}`);
  check('USA for-sale cafe takings equal launch takings', listing && listing.monthlyRev === ev.revLocal, `got ${listing && listing.monthlyRev} vs ${ev.revLocal}`);
  const Se = adultLife(777, 'egy');
  const cafeE = listAllBusinessVentures(Se).find((b) => b.id === 'cafe');
  const evE = evaluateBusinessLaunch(Se, cafeE);
  const listingE = makeForSaleListing(Se, { typeId: 'cafe', ageYears: 2, repeatRate: 0.6, hidden: {} });
  check('Egypt for-sale cafe takings equal launch takings (unchanged)', listingE && listingE.monthlyRev === evE.revLocal, `got ${listingE && listingE.monthlyRev} vs ${evE.revLocal}`);
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
if (fail) { console.log('FAILURES:', failures.join(' | ')); process.exit(1); }
console.log('V218-W4-OK');
process.exit(0);
