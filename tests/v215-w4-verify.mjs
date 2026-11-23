/* v2.15 Worker 4 verify — Era world events move markets, prices & rates.
   Run from the game root: node tests/v215-w4-verify.mjs
   Every check goes through the REAL paths: the event table, the real
   monthly tick (advanceSingleTurn), the real settlement
   (settleHouseholdMonth), the real property purchase (buyProperty) and
   the real Finance render. Counts are printed, not quoted. */

import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { settleHouseholdMonth, buyProperty } from '../src/systems/economyEngine.js';
import { launchSmallBusiness } from '../src/systems/careerEducationEngine.js';
import { computeBusinessMonthFull } from '../src/systems/businessMonthly.js';
import {
  WORLD_EVENTS, eraPolicyRate, eraLoanRates, monthlyMortgagePayment,
  worldEventEffects, worldHousePrice, activeWorldEvents, eventIsActive,
  getMarketState, tickWorldEvents, buildWorldEventScene,
} from '../src/systems/worldEvents.js';
import { renderFinanceTabHtml } from '../src/ui/views.js';
import { renderWorldMarketPanelHtml } from '../src/ui/worldEvents.js';
import { priceFactor, eraDepositRates } from '../src/data/economy.js';
import { getHousingFor } from '../src/data/institutions.js';

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

function adultLife(country = 'egy', year = 2026, seed = 777) {
  const S = createNewLifeState({ seed, country, birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = year; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.reputation = 80;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}

/* ================= §1 the event table: >= 15 real events ================= */
console.log('--- §1 event table ---');
{
  console.log(`events in table: ${WORLD_EVENTS.length}`);
  check('at least 15 era-locked world events', WORLD_EVENTS.length >= 15, `got ${WORLD_EVENTS.length}`);
  let bad = [];
  for (const ev of WORLD_EVENTS) {
    const start = ev.startYear * 12 + ev.startMonth;
    const end = ev.endYear * 12 + ev.endMonth;
    if (!(start < end)) bad.push(`${ev.id}: bad range`);
    if (ev.startYear < 1960 || ev.endYear > 2026) bad.push(`${ev.id}: year out of 1960-2026`);
    if (!ev.name || !ev.headline || !ev.whatItMeans) bad.push(`${ev.id}: missing words`);
    const fx = ev.effects || {};
    const blocks = [...Object.values(fx.countries || {}), ...(fx.all ? [fx.all] : [])];
    if (!blocks.length) bad.push(`${ev.id}: no effect block`);
    for (const b of blocks) {
      const keys = ['house', 'business', 'salary', 'rate'].filter((k) => b[k] !== undefined);
      if (!keys.length) bad.push(`${ev.id}: effect block with no effect`);
      if (b.house !== undefined && (b.house < 0.5 || b.house > 1.6)) bad.push(`${ev.id}: house ${b.house}`);
      if (b.business !== undefined && (b.business < 0.5 || b.business > 1.6)) bad.push(`${ev.id}: business ${b.business}`);
      if (b.salary !== undefined && (b.salary < 0.5 || b.salary > 1.6)) bad.push(`${ev.id}: salary ${b.salary}`);
      if (b.rate !== undefined && (b.rate < -0.1 || b.rate > 0.1)) bad.push(`${ev.id}: rate ${b.rate}`);
    }
  }
  check('every event has a real date range and a real effect', bad.length === 0, bad.join('; '));
  const ids = WORLD_EVENTS.map((e) => e.id);
  check('event ids are unique', new Set(ids).size === ids.length);
  console.log('events:', WORLD_EVENTS.map((e) => `${e.id} ${e.startYear}-${String(e.startMonth).padStart(2, '0')}..${e.endYear}-${String(e.endMonth).padStart(2, '0')}`).join(' | '));
}

/* ================= §2 the 2008 crisis moves a house price ================= */
console.log('--- §2 2008 crisis moves a house price (measured) ---');
{
  const before = adultLife('usa', 2007);
  const during = adultLife('usa', 2009);
  before.month = 6; during.month = 6;
  const item = getHousingFor('usa', 2007)[0];
  const priceBefore = worldHousePrice(before, 'usa', item.price2026);
  const priceDuring = worldHousePrice(during, 'usa', item.price2026);
  console.log(`same house (USA ${item.name}): 2007 ${priceBefore} vs 2009 ${priceDuring} (era price ${priceFactor('usa', 2007).toFixed(4)} vs ${priceFactor('usa', 2009).toFixed(4)})`);
  check('2008 crisis cuts the house price (helper)', priceDuring < priceBefore * 0.85, `${priceDuring} vs ${priceBefore}`);
  check('2008 crisis house multiplier is 0.75 in the USA', Math.abs(worldEventEffects(during, 'usa').housePrice - 0.75) < 0.001, `got ${worldEventEffects(during, 'usa').housePrice}`);

  // Through the REAL purchase: same house, same seed, cash buy.
  const buyA = adultLife('usa', 2007); buyA.money.cash = 1e12;
  const buyB = adultLife('usa', 2009); buyB.money.cash = 1e12;
  const rA = buyProperty(buyA, item.id, 'usa', false);
  const rB = buyProperty(buyB, item.id, 'usa', false);
  const vA = buyA.housing.properties[0]?.nativeValue;
  const vB = buyB.housing.properties[0]?.nativeValue;
  console.log(`bought ${item.name}: 2007 nativeValue ${vA} vs 2009 nativeValue ${vB}`);
  check('buyProperty succeeds in both years', rA.ok && rB.ok, `${rA.msg} / ${rB.msg}`);
  // Normalise out plain inflation so the crisis itself is what is measured.
  const normA = vA / priceFactor('usa', 2007);
  const normB = vB / priceFactor('usa', 2009);
  console.log(`inflation-normalised values: 2007 ${Math.round(normA)} vs 2009 ${Math.round(normB)} (ratio ${(normB / normA).toFixed(3)})`);
  check('bought house is ~25% cheaper in 2009 after inflation is removed', normB < normA * 0.8 && normB > normA * 0.7, `ratio ${(normB / normA).toFixed(3)}`);
}

/* ================= §3 rates follow the era: mortgage ================= */
console.log('--- §3 interest rates follow the era (measured) ---');
{
  const r1981 = eraLoanRates('usa', 1981);
  const r2009 = eraLoanRates('usa', 2009);
  console.log(`USA policy rate: 1981 ${(r1981.policyRate * 100).toFixed(1)}% vs 2009 ${(r2009.policyRate * 100).toFixed(1)}%; mortgage: ${(r1981.mortgageRate * 100).toFixed(1)}% vs ${(r2009.mortgageRate * 100).toFixed(1)}%`);
  check('USA policy rate is far higher in 1981 than 2009', r1981.policyRate > 0.15 && r2009.policyRate < 0.01, `${r1981.policyRate} vs ${r2009.policyRate}`);
  const pay1981 = monthlyMortgagePayment(1_000_000, 15, r1981.mortgageRate);
  const pay2009 = monthlyMortgagePayment(1_000_000, 15, r2009.mortgageRate);
  console.log(`same 1,000,000 mortgage, 15 years: 1981 ${pay1981}/mo vs 2009 ${pay2009}/mo`);
  check('same mortgage costs more per month in a high-rate year', pay1981 > pay2009 * 2, `${pay1981} vs ${pay2009}`);
  const eg2024 = eraPolicyRate('egy', 2024);
  console.log(`Egypt policy rate 2024: ${(eg2024 * 100).toFixed(1)}%`);
  check('Egypt 2024 rate reflects the float (above 20%)', eg2024 > 0.20, `${eg2024}`);

  // Through the REAL purchase: instalments on the same house, same seed.
  const item = getHousingFor('usa', 1981)[0];
  const mA = adultLife('usa', 1981); mA.money.cash = 1e12;
  const mB = adultLife('usa', 2009); mB.money.cash = 1e12;
  const okA = buyProperty(mA, item.id, 'usa', true);
  const okB = buyProperty(mB, item.id, 'usa', true);
  const instA = mA.housing.properties[0]?.nativeMonthlyInstallment;
  const instB = mB.housing.properties[0]?.nativeMonthlyInstallment;
  const finA = (mA.housing.properties[0]?.nativeValue || 0) * 0.8;
  const finB = (mB.housing.properties[0]?.nativeValue || 0) * 0.8;
  console.log(`bought ${item.name} on mortgage: 1981 ${instA}/mo vs 2009 ${instB}/mo — per unit borrowed: ${(instA / finA).toFixed(5)} vs ${(instB / finB).toFixed(5)}`);
  check('mortgage instalments succeed in both years', okA.ok && okB.ok, `${okA.msg} / ${okB.msg}`);
  // The 1981 house is far cheaper in nominal pounds/dollars (era prices),
  // so the rate effect is measured per unit borrowed, not in raw cash.
  check('mortgage costs far more per unit borrowed in the high-rate year', (instA / finA) > (instB / finB) * 2, `${(instA / finA).toFixed(5)} vs ${(instB / finB).toFixed(5)}`);
}

/* ================= §4 an event fires a news scene ================= */
console.log('--- §4 2008 crisis fires a news scene (not silent) ---');
{
  const S = createNewLifeState({ seed: 4242, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  const seenTitles = [];
  let crisisScene = null;
  let guard = 0;
  while ((S.year < 2008 || (S.year === 2008 && S.month < 12)) && !S.gameOver && guard++ < 400) {
    advanceSingleTurn(S);
    if (S.activeScene) {
      seenTitles.push(S.activeScene.title);
      if (S.activeScene.title === 'The 2008 Financial Crisis') crisisScene = S.activeScene;
      resolveActiveSceneChoice(S, 0);
    }
    for (const q of (S.sceneQueue || [])) {
      if (q.title === 'The 2008 Financial Crisis' && !crisisScene) crisisScene = q;
    }
  }
  const hist = (S.worldEvents?.history || []).map((h) => h.eventId);
  console.log(`reached ${S.year}-${S.month} age ${S.player.age}; history: ${hist.join(', ')}`);
  check('2008 crisis is in the life history', hist.includes('financial_crisis_2008'), hist.join(', '));
  check('journal names the 2008 crisis', S.journal.some((j) => /2008 Financial Crisis/.test(j.text)), 'no journal line');
  check('the player is shown a news scene for the crisis', !!crisisScene, `titles seen: ${[...new Set(seenTitles)].join(' | ')}`);
  if (crisisScene) {
    console.log(`scene text: ${crisisScene.text}`);
    check('news scene names the event and what it means', /2008 Financial Crisis|Lehman/.test(crisisScene.text) && /house prices/i.test(crisisScene.text), crisisScene.text.slice(0, 120));
    check('news scene has real choices (not a bare notice)', Array.isArray(crisisScene.choices) && crisisScene.choices.length >= 2, `choices ${crisisScene.choices?.length}`);
  }
}

/* ================= §5 an event cannot fire outside its era ================= */
console.log('--- §5 era gating (measured) ---');
{
  check('2008 crisis is not active in 1965', !eventIsActive(WORLD_EVENTS.find((e) => e.id === 'financial_crisis_2008'), 1965, 6));
  check('2008 crisis is active in 2009', eventIsActive(WORLD_EVENTS.find((e) => e.id === 'financial_crisis_2008'), 2009, 6));
  const S65 = adultLife('usa', 1965);
  S65.month = 6;
  check('no world events touch the USA in 1965', activeWorldEvents(S65, 'usa').length === 0, activeWorldEvents(S65, 'usa').map((a) => a.event.id).join(', '));
  check('house-price effect is exactly 1 in a quiet year', worldEventEffects(S65, 'usa').housePrice === 1);
  tickWorldEvents(S65);
  check('ticking 1965 records no 2008 crisis', !(S65.worldEvents.history || []).some((h) => h.eventId === 'financial_crisis_2008'));
  const st65 = getMarketState(S65, 'usa');
  check('market state is Stable in a quiet year', st65.state === 'Stable', st65.state);
  // A life lived through 1965 never sees the crisis in its history.
  const S = createNewLifeState({ seed: 11, country: 'usa', birthYear: 1960, familyTier: 'middle', gender: 'm' });
  for (let i = 0; i < 5 && !S.gameOver; i++) { advanceSingleTurn(S); if (S.activeScene) resolveActiveSceneChoice(S, 0); }
  check('a 1960s life has no 2008 crisis in history', !(S.worldEvents?.history || []).some((h) => h.eventId === 'financial_crisis_2008'), `year ${S.year}`);
}

/* ================= §6 getMarketState (Worker 1 contract) ================= */
console.log('--- §6 getMarketState export ---');
{
  const eg12 = adultLife('egy', 2012); eg12.month = 6;
  const eg17 = adultLife('egy', 2017); eg17.month = 6;
  const us09 = adultLife('usa', 2009); us09.month = 6;
  const us26 = adultLife('usa', 2026); us26.month = 6;
  const s12 = getMarketState(eg12, 'egy');
  const s17 = getMarketState(eg17, 'egy');
  const s09 = getMarketState(us09, 'usa');
  const s26 = getMarketState(us26, 'usa');
  console.log(`Egypt 2012: ${s12.state} (house ${s12.housePriceMult}); Egypt 2017: ${s17.state} (house ${s17.housePriceMult}); USA 2009: ${s09.state}; USA 2026: ${s26.state}`);
  check('Egypt 2012 (revolution) is Falling', s12.state === 'Falling', s12.state);
  check('Egypt 2017 (pound float) is Rising', s17.state === 'Rising', s17.state);
  check('USA 2009 (crisis) is Falling', s09.state === 'Falling', s09.state);
  check('USA 2026 (quiet) is Stable', s26.state === 'Stable', s26.state);
  check('market state carries rates and history', typeof s09.policyRate === 'number' && typeof s09.mortgageRate === 'number' && Array.isArray(s09.history) && Array.isArray(s09.activeEvents), JSON.stringify(Object.keys(s09)));
  check('active events list names the crisis', s09.activeEvents.some((e) => e.id === 'financial_crisis_2008'));
}

/* ================= §7 the wires move real money ================= */
console.log('--- §7 salary, savings and business wires (measured) ---');
{
  // Salary: the same job pays less in a crisis year, through settleHouseholdMonth.
  const mkJob = (year) => {
    const S = adultLife('egy', year);
    S.career.employed = true;
    S.career.job = { monthlyGross: 100000, employer: 'Test Bank', title: 'Clerk', workMode: 'standard' };
    return S;
  };
  const j07 = mkJob(2007); settleHouseholdMonth(j07);
  const j09 = mkJob(2009); settleHouseholdMonth(j09);
  const sal07 = (j07.ledger || []).find((l) => /Salary — Test Bank/.test(l.label || ''));
  const sal09 = (j09.ledger || []).find((l) => /Salary — Test Bank/.test(l.label || ''));
  console.log(`salary ledger: 2007 ${sal07?.delta} vs 2009 ${sal09?.delta} — ${sal09?.label}`);
  check('salary lands in the ledger both years', !!sal07 && !!sal09);
  check('crisis-year pay is lower than the quiet year', sal09.delta < sal07.delta, `${sal09?.delta} vs ${sal07?.delta}`);
  check('crisis-year pay line names the event', /2008 Financial Crisis/.test(sal09?.label || ''), sal09?.label || '');

  // Savings: the 2008 rate cut lowers the interest a saver earns. The
  // base deposit rate itself is inflation-driven and moves year to year,
  // so the shift is measured exactly: interest must equal the base rate
  // for 2009 plus the crisis shift of -1 point, and be lower than the
  // same year without the shift.
  const sv07 = adultLife('egy', 2007); sv07.money.savings = 1_000_000; sv07.money.cash = 0;
  const sv09 = adultLife('egy', 2009); sv09.money.savings = 1_000_000; sv09.money.cash = 0;
  settleHouseholdMonth(sv07); settleHouseholdMonth(sv09);
  const int09 = sv09.money.savingsInterestTotal || 0;
  const base09 = eraDepositRates('egy', 2009).savings;
  const expected09 = Math.round((1_000_000 * (Math.max(0.001, base09 - 0.01) / 12)) * 100) / 100;
  const noShift09 = Math.round((1_000_000 * (base09 / 12)) * 100) / 100;
  console.log(`one month savings interest on 1,000,000 in 2009: actual ${int09}, expected with crisis shift ${expected09}, without shift ${noShift09} (base rate ${(base09 * 100).toFixed(2)}%)`);
  check('savings interest equals the era rate plus the crisis shift', Math.abs(int09 - expected09) < 0.02, `${int09} vs ${expected09}`);
  check('the crisis shift itself lowers savings interest', int09 < noShift09, `${int09} vs ${noShift09}`);

  // Business: the multiplier input moves revenue exactly, and the P&L identity holds.
  const bA = adultLife('egy', 2009); bA.money.cash = 5_000_000;
  const bB = adultLife('egy', 2009); bB.money.cash = 5_000_000;
  launchSmallBusiness(bA, 'cafe', 'Twin Café', { mode: 'part_time' });
  launchSmallBusiness(bB, 'cafe', 'Twin Café', { mode: 'part_time' });
  const pl1 = computeBusinessMonthFull(bA, bA.career.businesses[0], { worldRevenueMult: 1 });
  const pl085 = computeBusinessMonthFull(bB, bB.career.businesses[0], { worldRevenueMult: 0.85 });
  console.log(`twin café revenue: mult 1.0 -> ${pl1.revenue}, mult 0.85 -> ${pl085.revenue} (ratio ${(pl085.revenue / pl1.revenue).toFixed(3)})`);
  check('business revenue factor scales revenue', Math.abs(pl085.revenue / pl1.revenue - 0.85) < 0.01, `ratio ${(pl085.revenue / pl1.revenue).toFixed(3)}`);
  check('P&L identity holds with the factor (profit = revenue - costs, net = profit - tax)', pl085.profit === pl085.revenue - pl085.costs && pl085.net === pl085.profit - pl085.tax, `profit ${pl085.profit} net ${pl085.net}`);

  // Through the real settlement: the 2009 crisis (business 0.90) settles
  // lower than 2007 (no event) once plain inflation is removed.
  const sA = adultLife('egy', 2007); sA.money.cash = 5_000_000;
  const sB = adultLife('egy', 2009); sB.money.cash = 5_000_000;
  launchSmallBusiness(sA, 'cafe', 'Settle Café', { mode: 'part_time' });
  launchSmallBusiness(sB, 'cafe', 'Settle Café', { mode: 'part_time' });
  settleHouseholdMonth(sA); settleHouseholdMonth(sB);
  const revA = (sA.ledger || []).find((l) => /Business revenue — Settle Café/.test(l.label || ''))?.delta || 0;
  const revB = (sB.ledger || []).find((l) => /Business revenue — Settle Café/.test(l.label || ''))?.delta || 0;
  // The café's base revenue is near-flat in nominal terms across years
  // (measured: base 11,610 in 2007 vs 11,480 in 2009), so the raw ratio
  // IS the crisis factor — no inflation normalisation.
  const ratio = revB / revA;
  console.log(`settled café revenue: 2007 ${revA} vs 2009 ${revB} (ratio ${ratio.toFixed(3)}, crisis factor 0.90)`);
  check('settled business revenue is lower in the crisis year', ratio < 0.96 && ratio > 0.84, `ratio ${ratio.toFixed(3)}`);
}

/* ================= §8 the panel renders ================= */
console.log('--- §8 world panel renders ---');
{
  const S = adultLife('usa', 2009); S.month = 6;
  tickWorldEvents(S);
  const panel = strip(renderWorldMarketPanelHtml(S));
  console.log(`panel: ${panel.slice(0, 220)}…`);
  check('panel names the 2008 crisis', /2008 Financial Crisis/.test(panel), panel.slice(0, 200));
  check('panel shows the Falling market state', /Falling/.test(panel), panel.slice(0, 200));
  check('panel shows the era mortgage rate', /mortgage here now costs about/.test(panel), panel.slice(0, 300));
  const fin = strip(renderFinanceTabHtml(S, {}));
  check('Finance tab includes the world panel', /data-world-market-panel/.test(renderFinanceTabHtml(S, {})) || /The World/.test(fin), 'panel missing from Finance tab');
  check('panel has no code leaks', !/undefined|NaN|object Object/.test(panel), panel.slice(0, 200));
}

/* ================= §9 the scene builder is honest ================= */
console.log('--- §9 scene builder ---');
{
  const S = adultLife('usa', 2009);
  const ev = WORLD_EVENTS.find((e) => e.id === 'financial_crisis_2008');
  const scene = buildWorldEventScene(S, ev, { house: 0.75, business: 0.85, salary: 0.95, rate: -0.04 });
  check('scene title is the event name', scene.title === 'The 2008 Financial Crisis', scene.title);
  check('scene text names the event and the effect on the player', /Lehman/.test(scene.text) && /house prices in .*United States fall about 25%/.test(scene.text), scene.text.slice(0, 200));
  check('scene choices are plain words, no code', scene.choices.every((c) => !/[{}();]/.test(c.label) || /—/.test(c.label)), scene.choices.map((c) => c.label).join(' | '));
}

/* ================= §10 Worker 1 bridge (marketShock record) ================= */
console.log('--- §10 Worker 1 marketShock bridge ---');
{
  const S = adultLife('usa', 2009); S.month = 6;
  tickWorldEvents(S);
  console.log(`marketShock in 2009: ${JSON.stringify(S.worldEvents.marketShock)}`);
  check('tick writes the marketShock Worker 1 reads', !!S.worldEvents.marketShock && S.worldEvents.marketShock.priceMult === 0.75, JSON.stringify(S.worldEvents.marketShock));
  check('marketShock names the event and expires at its end year', S.worldEvents.marketShock.label === 'The 2008 Financial Crisis' && S.worldEvents.marketShock.untilYear === 2010, JSON.stringify(S.worldEvents.marketShock));
  S.year = 2026; S.month = 6;
  tickWorldEvents(S);
  check('marketShock clears in a quiet year', !S.worldEvents.marketShock, JSON.stringify(S.worldEvents.marketShock));
  // The getter still agrees with the shock record.
  const st = getMarketState(S, 'usa');
  check('getMarketState is Stable once the shock clears', st.state === 'Stable', st.state);
}

console.log(`\nW4 RESULT: ${pass} passed, ${fail} failed${fail ? ` — FAILED: ${failures.join('; ')}` : ''}`);
if (fail) process.exit(1);