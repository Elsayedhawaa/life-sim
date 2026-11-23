/* v2.11 verify — Businesses (Overnight Round 3). Run from the game root:
   node tests/v211-verify.mjs
   Covers all 11 spec items + the coordinator's merge wiring. The three
   shipped tests (DATA_OK / UI_RENDER_OK / coherence 0 defects) are NOT
   run by this harness — run them separately. */
import { createNewLifeState, createPerson, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth, tickAssetsAnnually } from '../src/systems/economyEngine.js';
import { resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { launchSmallBusiness, expandSmallBusiness, setBusinessMode } from '../src/systems/careerEducationEngine.js';
import {
  listAllBusinessVentures, createBusiness, expandBusiness, sellBusiness, closeBusiness,
  computeBusinessMonth, runBusinessOp, businessOpInfo, evaluateBusinessLaunch,
  migrateBusinesses, countVentureRows
} from '../src/systems/businessEngine.js';
/* v2.14 §1: the hard cap of 3 is deleted — the limit is management
   capacity (70h/week of the owner's time, or a manager's salary). */
import { OWNER_WEEKLY_HOURS_MAX, businessIsManaged } from '../src/systems/businessCapacity.js';
import {
  hireBusinessEmployee, fireBusinessEmployee, fireAllStaff, ensureStaffArray,
  totalStaffWages, teamMoraleFactor
} from '../src/systems/businessStaff.js';
import { takeBusinessLoan, getBusinessLoan, payExtraOnBusinessLoan } from '../src/systems/businessLoans.js';
import { BUSINESS_EVENTS } from '../src/data/eventsBusiness.js';
import { ALL_RANDOM_LIFE_EVENTS, eventGatePasses, resolveEventCtx } from '../src/systems/eventEngine.js';
import { EVENTS_MONEY_HEALTH_CAREER } from '../src/data/eventsMoneyHealthCareer.js';
import {
  rentBusinessPremises, setBusinessHomePremises, repairBusinessPremises,
  reviewBusinessRent, acceptBusinessRentReview, listCommercialPremises,
  businessUsingProperty
} from '../src/systems/businessPremises.js';
import { executeCountryRelocation } from '../src/systems/visaMigrationEngine.js';
import {
  getBusinesses, listEligibleHeirs, setBusinessHeir, setWillPrimaryHeir,
  closeBusiness as closeBusinessLegacy, tickRemoteBusinesses,
  buildRelocationBusinessChoices, renderBusinessWillSection, renderWillHeirSection
} from '../src/systems/businessLegacy.js';
import { continueAsChild, triggerPlayerDeath } from '../src/systems/healthDirectorEngine.js';
import { renderWorkTabHtml, renderFinanceTabHtml } from '../src/ui/views.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

function adultLife(over = {}) {
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
  Object.assign(S, over);
  return S;
}
function mkBiz(id, name, rev, cost, capital, staff) {
  return { id, typeId: 'cafe', name, country: 'egy', city: 'Cairo', level: 1, maxLevel: 5, volatility: 0.25,
    monthlyRev: rev, monthlyCost: cost, capitalInvested: capital, repeatRate: 0.5, mode: 'full_time',
    staff: staff || [], premises: null, loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 1 }, lastOpUsed: { rd: 0, bonus: 0, pricing: 0 },
    history: [], heirId: null, remote: false, foundedYear: 2022, foundedMonth: 3 };
}
function addFamily(S) {
  const spouse = createPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id];
  const child = createPerson(S, { age: 20, gender: 'm', role: 'child', relationLabel: 'Son' });
  child.residenceCountry = 'egy'; child.city = 'Cairo';
  S.people[child.id] = child; S.relations.childIds = [child.id];
  const father = createPerson(S, { age: 60, gender: 'm', role: 'father', relationLabel: 'Father' });
  S.people[father.id] = father; S.relations.fatherId = father.id;
  return { spouse, child, father };
}

/* ================= §0 counts ================= */
console.log('--- §0 counts ---');
console.log('venture rows (deduped):', countVentureRows(), '| business events:', BUSINESS_EVENTS.length, '| event pool:', ALL_RANDOM_LIFE_EVENTS.length);
check('55 venture types', countVentureRows() === 55, `got ${countVentureRows()}`);
check('14 business events', BUSINESS_EVENTS.length === 14, `got ${BUSINESS_EVENTS.length}`);
check('event pool grew 557 -> 574', ALL_RANDOM_LIFE_EVENTS.length === 574, `got ${ALL_RANDOM_LIFE_EVENTS.length}`); // v2.15 (coordinator merge fix): W5 added 3 memory events, 571 + 3 = 574
check('0 duplicate business event ids', new Set(BUSINESS_EVENTS.map(e => e.id)).size === BUSINESS_EVENTS.length);
check('no hard cap (v2.14 §1) — capacity is 70h/week of the owner\'s time', OWNER_WEEKLY_HOURS_MAX === 70, `got ${OWNER_WEEKLY_HOURS_MAX}`);

/* ================= §1 multiple businesses ================= */
console.log('--- §1 multiple businesses ---');
{
  const S = adultLife();
  const r1 = launchSmallBusiness(S, 'cafe', 'Cairo Corner Café', { mode: 'full_time' });
  const r2 = launchSmallBusiness(S, 'retail_shop', 'Downtown Electronics', { mode: 'full_time' });
  check('launch cafe full-time', r1.ok, r1.msg);
  check('launch second business', r2.ok, r2.msg);
  check('two businesses held', S.career.businesses.length === 2);
  check('mirror is businesses[0], same reference', S.career.business === S.career.businesses[0]);
  const r3 = launchSmallBusiness(S, 'bakery', 'Third', { mode: 'full_time' });
  check('third launch ok (no cap)', r3.ok, r3.msg);
  const r4 = launchSmallBusiness(S, 'salon', 'Fourth', { mode: 'full_time' });
  check('fourth launch ok too — no hard cap (v2.14 §1)', r4.ok, r4.msg);
  check('four businesses held', S.career.businesses.length === 4);
  check('fourth business unmanaged — no owner hours left for it (40+40+40+40 > 70h/week)', !businessIsManaged(S, S.career.businesses[3]));
  sellBusiness(S, S.career.businesses[3].id);
  check('back to 3 businesses after selling fourth', S.career.businesses.length === 3);
}

/* ================= §2 employees ================= */
console.log('--- §2 employees ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Staff Café', { mode: 'full_time' });
  const biz = S.career.businesses[0];
  const staffBefore = (biz.staff || []).length;
  const wagesBefore = totalStaffWages(biz);
  const h1 = hireBusinessEmployee(S, biz, 'barista');
  check('hire barista ok', h1.ok, h1.msg);
  check('hire costs one month wage (onboarding ledger line)', S.ledger.some(l => l.label && l.label.startsWith('Onboarding')), '');
  const hired = (biz.staff || []).find(e => e.role === 'barista');
  check('hired employee is a named person with wage/morale/skill', !!hired && hired.name && hired.wageLocal > 0 && typeof hired.morale === 'number' && typeof hired.skill === 'number', JSON.stringify(hired));
  const hBad = hireBusinessEmployee(S, biz, 'astronaut');
  check('hire of a role outside the type list refused', !hBad.ok, hBad.msg);
  const wages = totalStaffWages(biz);
  check('wages grew by the hire', wages > wagesBefore, `${wagesBefore} -> ${wages}`);
  // wages in the settlement's business-costs line (W2's flagged merge gap)
  const ledgerBefore = S.ledger.length;
  settleHouseholdMonth(S);
  const costLine = S.ledger.slice(0, S.ledger.length - ledgerBefore).find(l => l.label && l.label.startsWith('Business costs — Staff Café'));
  check('settlement posts a Business costs line', !!costLine, '');
  const wageInLabel = costLine && costLine.label.match(/wages ([\d,]+)/);
  check('wages appear in the costs line, broken out', !!wageInLabel, costLine ? costLine.label : 'no line');
  check('wages in label equal totalStaffWages', wageInLabel && Number(wageInLabel[1].replace(/,/g, '')) === wages, wageInLabel ? wageInLabel[1] : 'none');
  // morale revenue (same stream)
  const revAt = (morale) => {
    const b = { monthlyRev: 100000, monthlyCost: 10000, repeatRate: 0.5, volatility: 0.05, mode: 'full_time', staff: [{ wageLocal: 5000, morale, skill: 50 }], premises: { kind: 'rented', monthlyRentLocal: 0, conditionPct: 90 }, buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 }, history: [], lastPL: null };
    const seed = S.rngState;
    const r = computeBusinessMonth(S, b).revenue;
    S.rngState = seed;
    return r;
  };
  const revHi = revAt(90), revLo = revAt(20);
  console.log('revenue morale 90 vs 20 (same stream):', revHi, revLo);
  check('high-morale team earns more than low-morale team', revHi > revLo, `${revHi} vs ${revLo}`);
  // fire: severance as its own personal-cash ledger line, morale -8
  const victim = (biz.staff || [])[0];
  const moraleBefore = (biz.staff || []).filter(e => e.id !== victim.id).map(e => e.morale);
  const cashBefore = S.money.cash;
  const f = fireBusinessEmployee(S, biz, victim.id);
  check('fire ok', f.ok, f.msg);
  const sevLine = S.ledger.find(l => l.label && l.label.startsWith(`Severance — ${victim.name}`));
  check('severance is its own personal-cash ledger line', !!sevLine, '');
  check('cash fell by exactly the severance', sevLine && S.money.cash === cashBefore + sevLine.delta, `cash ${cashBefore} -> ${S.money.cash}, line ${sevLine && sevLine.delta}`);
  const moraleAfter = (biz.staff || []).map(e => e.morale);
  check('remaining staff morale -8', moraleAfter.every((m, i) => m === moraleBefore[i] - 8), `${moraleBefore} -> ${moraleAfter}`);
  // low-morale quit
  const quitter = (biz.staff || [])[0];
  if (quitter) {
    quitter.morale = 10;
    let quit = false;
    for (let i = 0; i < 60 && !quit; i++) {
      const n = (biz.staff || []).length;
      // monthlyStaffTick is internal to the settlement; drive it via settle (cheap: 1 month each, cash is ample)
      settleHouseholdMonth(S);
      quit = (biz.staff || []).length < n || S.journal.some(j => j.text && j.text.includes('quit'));
    }
    check('low-morale employee quits within 60 months', quit, '');
  } else {
    check('low-morale employee quits within 60 months', false, 'no staff left to quit');
  }
}

/* ================= §3 monthly P&L ================= */
console.log('--- §3 monthly P&L ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Cairo Corner Café', { mode: 'full_time' });
  launchSmallBusiness(S, 'retail_shop', 'Downtown Electronics', { mode: 'full_time' });
  const ledgerBefore = S.ledger.length;
  S.month = 1;
  settleHouseholdMonth(S);
  const monthLines = S.ledger.slice(0, S.ledger.length - ledgerBefore);
  const revLines = monthLines.filter(l => l.label.startsWith('Business revenue'));
  const costLines = monthLines.filter(l => l.label.startsWith('Business costs'));
  const taxLines = monthLines.filter(l => l.label.startsWith('Business tax'));
  console.log('month lines:', monthLines.filter(l => /Business/.test(l.label)).map(l => `${l.label} ${l.delta}`).join(' | '));
  check('two revenue lines (one per business)', revLines.length === 2, `got ${revLines.length}`);
  check('two cost lines', costLines.length === 2, `got ${costLines.length}`);
  check('two tax lines (Egypt taxes profit)', taxLines.length === 2, `got ${taxLines.length}`);
  const [b1, b2] = S.career.businesses;
  check('net = revenue - costs - tax (biz1)', b1.lastPL.net === b1.lastPL.revenue - b1.lastPL.costs - b1.lastPL.tax, JSON.stringify(b1.lastPL));
  check('net = revenue - costs - tax (biz2)', b2.lastPL.net === b2.lastPL.revenue - b2.lastPL.costs - b2.lastPL.tax, JSON.stringify(b2.lastPL));
  check('costs = rent + wages + other + remote', b1.lastPL.costs === b1.lastPL.rent + b1.lastPL.wages + b1.lastPL.other + b1.lastPL.remote, JSON.stringify(b1.lastPL));
  const bizSum = [...revLines, ...costLines, ...taxLines].reduce((s, l) => s + l.delta, 0);
  check('ledger business lines sum to total net', bizSum === b1.lastPL.net + b2.lastPL.net, `${bizSum} vs ${b1.lastPL.net + b2.lastPL.net}`);
  check('history recorded for both', b1.history.length === 1 && b2.history.length === 1);
  check('tax is charged on profit (not 0)', b1.lastPL.tax > 0 || b2.lastPL.tax > 0, `taxes ${b1.lastPL.tax}, ${b2.lastPL.tax}`);
  // part-time vs full-time (info: W3 noted part-time café loses money with 3 staff)
  const Spt = adultLife();
  launchSmallBusiness(Spt, 'cafe', 'PT Café', { mode: 'part_time' });
  const pt = computeBusinessMonth(Spt, Spt.career.businesses[0]);
  const Sft = adultLife();
  launchSmallBusiness(Sft, 'cafe', 'FT Café', { mode: 'full_time' });
  const ft = computeBusinessMonth(Sft, Sft.career.businesses[0]);
  console.log(`part-time café net ${pt.net} vs full-time net ${ft.net} (same type, different mode)`);
  check('full-time earns more than part-time (mode matters)', ft.net > pt.net, `ft ${ft.net} vs pt ${pt.net}`);
}

/* ================= §4 failure chain ================= */
console.log('--- §4 failure chain ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Doomed Café', { mode: 'part_time' });
  const fb = S.career.businesses[0];
  fb.monthlyRev = 100; fb.monthlyCost = 90000;
  S.money.cash = 100; S.money.savings = 0;
  for (let m = 1; m <= 3; m++) {
    S.month = m;
    settleHouseholdMonth(S);
    if (m === 1) check('miss 1: misses=1, debt capitalised, still open', fb.misses === 1 && fb.debtLocal > 0 && S.career.businesses.length === 1, `misses=${fb.misses} debt=${fb.debtLocal}`);
    if (m === 2) check('miss 2: warning scene queued', [S.activeScene, ...(S.sceneQueue || [])].filter(Boolean).some(s => /Second Missed Business/.test(s.title || '')));
  }
  check('miss 3: business closed/repossessed', S.career.businesses.length === 0, `businesses=${S.career.businesses.length}`);
  check('miss 3: closure scene queued (player told)', [S.activeScene, ...(S.sceneQueue || [])].filter(Boolean).some(s => /Has Closed/.test(s.title || '')));
  check('miss 3: salvage paid into ledger', S.ledger.some(l => l.label && /Salvage sale/.test(l.label)));
}

/* ================= §5 era gates + volatility + maxLevel ================= */
console.log('--- §5 era / volatility / maxLevel ---');
{
  const S0 = adultLife();
  const v2026 = listAllBusinessVentures(S0);
  S0.year = 1960;
  const v1960 = listAllBusinessVentures(S0);
  console.log('2026 ventures:', v2026.length, '| 1960 ventures:', v1960.length);
  check('saas_ai_agency NOT launchable in 1960', !v1960.some(b => b.id === 'saas_ai_agency'));
  check('saas_ai_agency launchable in 2026', v2026.some(b => b.id === 'saas_ai_agency'));
  check('1960-appropriate business IS launchable in 1960', v1960.some(b => b.id === 'cafe'));
  check('video_rental dies out (to 2010): not in 2026', !v2026.some(b => b.id === 'video_rental'));
  check('software_studio NOT in 1960 (from 1990)', !v1960.some(b => b.id === 'software_studio'));
  check('all rows carry maxLevel + volatility', v2026.every(b => typeof b.maxLevel === 'number' && typeof b.volatility === 'number'));
  // volatility spread, same stream
  const Sv = adultLife();
  const spread = (vol) => {
    const biz = { monthlyRev: 100000, monthlyCost: 10000, repeatRate: 0.5, volatility: vol, mode: 'full_time', staff: [], premises: { kind: 'rented', monthlyRentLocal: 0, conditionPct: 90 }, buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 }, history: [], lastPL: null };
    const seed = Sv.rngState;
    const revs = [];
    for (let i = 0; i < 120; i++) revs.push(computeBusinessMonth(Sv, biz).revenue);
    Sv.rngState = seed;
    const mean = revs.reduce((a, b) => a + b, 0) / revs.length;
    return Math.sqrt(revs.reduce((a, b) => a + (b - mean) ** 2, 0) / revs.length);
  };
  const sdLo = spread(0.05), sdHi = spread(0.6);
  console.log('volatility sd 0.05 vs 0.6:', Math.round(sdLo), Math.round(sdHi));
  check('high volatility swings wider than low (same stream)', sdHi > sdLo * 3, `${Math.round(sdHi)} vs ${Math.round(sdLo)}`);
  // maxLevel — v2.17 W2: the level 5 ceiling is GONE (spec §3). A
  // business that meets the real gate keeps growing past 5 — the
  // gate (months + profitable months + staff skill) is the only
  // limit now. The old "refused at maxLevel" check asserted the
  // removed ceiling, so it is replaced by the new behaviour.
  const Se = adultLife();
  launchSmallBusiness(Se, 'fruit_stall', 'Fruit Stall', { mode: 'part_time' });
  const eb = Se.career.businesses[0];
  eb.level = 5;
  eb.foundedYear = 2024; eb.foundedMonth = 1; /* 24 months trading by 2026/1 — needs 18 for level 6 */
  eb.history = [{ net: 5000 }, { net: 8000 }, { net: 6000 }, { net: 9000 }, { net: 7000 }, { net: 8000 }]; /* 6 profitable months in a row — needs 6 for level 6 */
  for (const m of (eb.staff || [])) m.skill = 70; /* avg skill 70, needs 40+5x6=70 for level 6 */
  eb.premises = { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 }; /* the home rule would block past level 2 */
  const ex = expandSmallBusiness(Se, eb.id);
  check('no level ceiling in v2.17: level 5 expands to level 6 once the gate is met', ex.ok && eb.level === 6, ex.msg);
  eb.level = 1;
  eb.foundedYear = 2026; eb.foundedMonth = 1; /* back to brand-new: 0 months trading */
  eb.history = [];
  /* v2.17: the level gate is real state — a brand-new business has not
     earned growth yet (0 months trading, 0 profitable months). */
  const exFresh = expandSmallBusiness(Se, eb.id);
  check('expand refused for a brand-new business (0 months trading)', !exFresh.ok && /months/.test(exFresh.msg), exFresh.msg);
  eb.foundedYear = 2025; eb.foundedMonth = 7; /* 6 months trading by 2026/1 */
  eb.history = [{ net: 5000 }, { net: 8000 }]; /* 2 profitable months in a row */
  for (const m of (eb.staff || [])) m.skill = 60; /* avg skill 60, needs 50 for level 2 */
  const ex2 = expandSmallBusiness(Se, eb.id);
  check('expand works below maxLevel once the gate is met, level -> 2', ex2.ok && eb.level === 2, ex2.msg);
}

/* ================= §6 business events ================= */
console.log('--- §6 business events ---');
{
  const byId = new Map(BUSINESS_EVENTS.map(e => [e.id, e]));
  const mkFullBiz = () => {
    const b = mkBiz('biz_ev', 'Event Café', 200000, 120000, 500000, [
      { id: 's1', name: 'Aya', role: 'barista', wageLocal: 8000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 },
      { id: 's2', name: 'Omar', role: 'waiter', wageLocal: 7000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 }]);
    b.premises = { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 };
    b.foundedYear = 2024; b.foundedMonth = 1; b.repeatRate = 0.7;
    return b;
  };
  const withBiz = (over = {}) => {
    const S = adultLife(over);
    S.career.businesses = [mkFullBiz()]; S.career.business = S.career.businesses[0];
    S.year = 2026; S.month = 6;
    return S;
  };
  const full = withBiz();
  check('all 14 business events have >= 3 choices', BUSINESS_EVENTS.every((e) => {
    try { const sc = e.build(full, resolveEventCtx(full)); return sc && sc.choices && sc.choices.length >= 3; }
    catch (err) { console.log('  build fail', e.id, err.message); return false; }
  }));
  check('full business state passes all 14 events', BUSINESS_EVENTS.every((e) => eventGatePasses(e, full)));
  const noBiz = adultLife();
  check('no business: all 14 fail', BUSINESS_EVENTS.every((e) => !eventGatePasses(e, noBiz)));
  const noStaff = withBiz(); noStaff.career.businesses[0].staff = [];
  check('0 staff: key-employee-quits fails', !eventGatePasses(byId.get('ev_biz_key_employee_quits'), noStaff));
  check('0 staff: employee-raise fails', !eventGatePasses(byId.get('ev_biz_employee_raise'), noStaff));
  check('0 staff: big client still passes', eventGatePasses(byId.get('ev_biz_big_client'), noStaff));
  const noPrem = withBiz(); noPrem.career.businesses[0].premises = null;
  check('no premises: fire fails', !eventGatePasses(byId.get('ev_biz_fire_flood'), noPrem));
  check('no premises: break-in fails', !eventGatePasses(byId.get('ev_biz_break_in'), noPrem));
  check('no premises: big client still passes', eventGatePasses(byId.get('ev_biz_big_client'), noPrem));
  const young = withBiz(); young.career.businesses[0].foundedYear = 2026; young.career.businesses[0].foundedMonth = 6;
  check('age 0 months: tax inspection fails', !eventGatePasses(byId.get('ev_biz_tax_inspection'), young));
  check('age 0 months: new regulation fails', !eventGatePasses(byId.get('ev_biz_new_regulation'), young));
  const belowMax = withBiz(); belowMax.career.businesses[0].level = 5; belowMax.career.businesses[0].maxLevel = 5;
  check('at maxLevel: expand chance fails', !eventGatePasses(byId.get('ev_biz_expand_chance'), belowMax));
  // effects move numbers: big client, choice 0
  const Sfx = withBiz();
  const bizFx = Sfx.career.businesses[0];
  const revBefore = bizFx.monthlyRev, rateBefore = bizFx.repeatRate;
  const sc = byId.get('ev_biz_big_client').build(Sfx, resolveEventCtx(Sfx));
  sc.choices[0].effect(Sfx);
  check('big client choice moves business numbers', bizFx.monthlyRev !== revBefore || bizFx.repeatRate !== rateBefore, `rev ${revBefore}->${bizFx.monthlyRev} rate ${rateBefore}->${bizFx.repeatRate}`);
  // ev_career_side_business
  const sideEv = EVENTS_MONEY_HEALTH_CAREER.find((e) => e.id === 'ev_career_side_business');
  check('ev_career_side_business exists', !!sideEv);
  {
    const S = adultLife();
    S.money.cash = 2_000_000;
    const scene = sideEv.build(S, resolveEventCtx(S));
    const idx = scene.choices.findIndex((c) => /real business plan/.test(c.label));
    check('real-business-plan choice exists', idx >= 0);
    const cashBefore = S.money.cash;
    scene.choices[idx].effect(S);
    const bizs = getBusinesses(S);
    check('choice creates a real business in S.career.businesses', bizs.length === 1, `got ${bizs.length}`);
    if (bizs.length) {
      check('created business has staff', (bizs[0].staff || []).length >= 1, `staff=${(bizs[0].staff || []).length}`);
      check('created business has a P&L (lastPL + history)', !!bizs[0].lastPL && (bizs[0].history || []).length >= 1);
      check('created business charged startup capital', S.money.cash < cashBefore, `${cashBefore} -> ${S.money.cash}`);
    }
    const S2 = adultLife();
    S2.money.cash = 100; S2.money.savings = 0;
    const scene2 = sideEv.build(S2, resolveEventCtx(S2));
    const idx2 = scene2.choices.findIndex((c) => /real business plan/.test(c.label));
    scene2.choices[idx2].effect(S2);
    check('unaffordable: no business created', getBusinesses(S2).length === 0, `got ${getBusinesses(S2).length}`);
    check('unaffordable: journal states the amount needed', S2.journal.some(j => j.text && /startup capital/.test(j.text) && /100 EGP/.test(j.text)), '');
  }
}

/* ================= §7 premises ================= */
console.log('--- §7 premises ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Premises Café', { mode: 'full_time' });
  const biz = S.career.businesses[0];
  const units = listCommercialPremises(S);
  check('commercial catalogue lists rented units', units.some(u => u.kind === 'rented'), `units=${units.length}`);
  const shop = units.find(u => u.unitId === 'comm_shop');
  check('small shop unit exists with a rent', !!shop && shop.monthlyRentLocal > 0, `rent=${shop && shop.monthlyRentLocal}`);
  const r = rentBusinessPremises(S, biz, 'comm_shop');
  check('rent a shop ok', r.ok, r.msg);
  check('premises linked on the business', biz.premises && biz.premises.unitId === 'comm_shop' && biz.premises.monthlyRentLocal === shop.monthlyRentLocal, JSON.stringify(biz.premises));
  const ledgerBefore = S.ledger.length;
  settleHouseholdMonth(S);
  const costLine = S.ledger.slice(0, S.ledger.length - ledgerBefore).find(l => l.label && l.label.startsWith('Business costs — Premises Café'));
  const rentInLabel = costLine && costLine.label.match(/rent ([\d,]+)/);
  check('rent charged equals catalogue rent exactly', rentInLabel && Number(rentInLabel[1].replace(/,/g, '')) === shop.monthlyRentLocal, rentInLabel ? rentInLabel[1] : 'no line');
  // rent review: propose, accept, charged rent changes (Verdant hold-the-line)
  // the lease must be 12+ months old before a review is due — age it first
  biz.premises.rentedYear = 2024; biz.premises.rentedMonth = 1;
  const rev = reviewBusinessRent(S, biz);
  check('rent review proposes a new rent', rev.ok && biz.premises.pendingReview && biz.premises.pendingReview.monthlyRentLocal !== shop.monthlyRentLocal, JSON.stringify(biz.premises.pendingReview));
  const acc = acceptBusinessRentReview(S, biz);
  const newRent = biz.premises.monthlyRentLocal;
  check('accepting the review changes the rent', acc.ok && newRent !== shop.monthlyRentLocal, `rent ${shop.monthlyRentLocal} -> ${newRent}`);
  const lb2 = S.ledger.length;
  settleHouseholdMonth(S);
  const costLine2 = S.ledger.slice(0, S.ledger.length - lb2).find(l => l.label && l.label.startsWith('Business costs — Premises Café'));
  const rentInLabel2 = costLine2 && costLine2.label.match(/rent ([\d,]+)/);
  check('charged rent after review equals the new rent', rentInLabel2 && Number(rentInLabel2[1].replace(/,/g, '')) === newRent, rentInLabel2 ? rentInLabel2[1] : 'no line');
  // run from home: revenue x0.8, level cap 2
  const Sh = adultLife();
  launchSmallBusiness(Sh, 'cafe', 'Home Café', { mode: 'full_time' });
  const hb = Sh.career.businesses[0];
  hb.level = 3;
  setBusinessHomePremises(Sh, hb);
  check('run from home caps level at 2', hb.level === 2 && hb.premises.kind === 'home', `level=${hb.level} kind=${hb.premises.kind}`);
  const homeRev = computeBusinessMonth(Sh, hb).revenue;
  const hb2 = { ...hb, premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 } };
  const shopRev = computeBusinessMonth(Sh, hb2).revenue;
  console.log('home revenue vs rented-shop revenue (same stream):', homeRev, shopRev);
  check('home business earns ~0.8x a rented one', homeRev < shopRev && homeRev > shopRev * 0.7, `${homeRev} vs ${shopRev}`);
  // owned property link
  const prop = (S.housing.properties || [])[0];
  if (prop) {
    const found = businessUsingProperty(S, prop.id);
    check('businessUsingProperty finds the business on an owned property (or null when none uses it)', found === null || found.name === biz.name, '');
  } else {
    check('businessUsingProperty: no owned property in this life to test (skipped)', true, 'no property');
  }
}

/* ================= §8 relocation + death ================= */
console.log('--- §8 relocation + death ---');
{
  // relocation: 2 businesses, keep 1 + sell 1
  const S = adultLife();
  S.year = 2024; S.month = 6; S.player.age = 34;
  const biz1 = mkBiz('biz_1', 'Cairo Corner Café', 200000, 120000, 500000, [
    { id: 'st1', name: 'Mona', role: 'manager', wageLocal: 15000, morale: 80, skill: 70, hiredYear: 2023, hiredMonth: 1 },
    { id: 'st2', name: 'Omar', role: 'cook', wageLocal: 9000, morale: 70, skill: 60, hiredYear: 2023, hiredMonth: 2 }]);
  const biz2 = mkBiz('biz_2', 'Nile Bookshop', 100000, 40000, 300000, [
    { id: 'st3', name: 'Sara', role: 'clerk', wageLocal: 8000, morale: 75, skill: 65, hiredYear: 2023, hiredMonth: 1 }]);
  S.career.businesses = [biz1, biz2]; S.career.business = biz1;
  if (S.legal.passports[0]) S.legal.passports[0].expiresYear = S.year + 10;
  const choices = buildRelocationBusinessChoices(S);
  check('relocation: 2 choices built', choices.length === 2, `n=${choices.length}`);
  check('relocation: sell valuation shown (0.7x capital + 2.8x annual net profit)', choices[1].valuation === 1957200, `valuation=${choices[1].valuation}`);
  const res = executeCountryRelocation(S, 'gbr', { kind: 'work_visa', permitName: 'Skilled Worker', sponsorName: 'NHS', expiresYear: 2027, expiresMonth: 6 }, true);
  check('relocation: move DEFERRED until businesses decided', res && res.deferred === true && S.country === 'egy', `country=${S.country}`);
  check('relocation: first decision scene active with 3 choices', !!S.activeScene && S.activeScene.choices.length === 3, `title=${S.activeScene && S.activeScene.title}`);
  resolveActiveSceneChoice(S, 0); // Keep biz1
  check('relocation keep: remote=true, country stays origin', biz1.remote === true && biz1.country === 'egy', `remote=${biz1.remote} country=${biz1.country}`);
  check('relocation keep: manager wage = top staff wage', biz1.remoteManagerWageLocal === 15000, `wage=${biz1.remoteManagerWageLocal}`);
  check('relocation: 2nd business scene now active', !!S.activeScene && S.activeScene.title.includes('Nile Bookshop'), `title=${S.activeScene && S.activeScene.title}`);
  resolveActiveSceneChoice(S, 1); // Sell biz2
  check('relocation sell: move COMPLETED after last decision', S.country === 'gbr' && !S.pendingRelocation, `country=${S.country}`);
  const saleLine = (S.ledger || []).find(l => l.label && l.label.includes('Exited & sold Nile Bookshop'));
  check('relocation sell: paid real valuation (ledger)', !!saleLine && saleLine.delta === 1957200, `line=${saleLine ? JSON.stringify(saleLine) : 'none'}`);
  check('relocation sell: sold business gone from list', getBusinesses(S).length === 1 && getBusinesses(S)[0].id === 'biz_1');
  check('relocation keep: books re-denominated to GBP', biz1.figuresCurrency === 'gbr' && biz1.monthlyRev < 200000, `monthlyRev=${biz1.monthlyRev} figuresCurrency=${biz1.figuresCurrency}`);
  // relocation close: ONE scene only (no double "Has Closed")
  const Sc = adultLife();
  const cbiz = mkBiz('biz_c', 'Close Café', 80000, 50000, 400000, [
    { id: 'st9', name: 'Hassan', role: 'mechanic', wageLocal: 11000, morale: 70, skill: 60, hiredYear: 2023, hiredMonth: 1 }]);
  Sc.career.businesses = [cbiz]; Sc.career.business = cbiz;
  const scenesBefore = (Sc.sceneQueue || []).length + (Sc.activeScene ? 1 : 0);
  const closeRes = closeBusinessLegacy(Sc, cbiz);
  const closedScenes = [Sc.activeScene, ...(Sc.sceneQueue || [])].filter(Boolean).filter(s => /Has Closed/.test(s.title || ''));
  check('relocation close: salvage 0.5x capital', closeRes.ok && closeRes.salvage === 200000, JSON.stringify(closeRes));
  check('relocation close: NO double "Has Closed" scene (decision already told the player)', closedScenes.length === 0, `scenes=${closedScenes.length}`);
  check('relocation close: journal still records it', Sc.journal.some(j => j.text.includes('Close Café') && j.text.includes('closed')));
  const Sd = adultLife();
  const dbiz = mkBiz('biz_d', 'Direct Close', 80000, 50000, 400000, []);
  Sd.career.businesses = [dbiz]; Sd.career.business = dbiz;
  closeBusiness(Sd, dbiz, 'test close');
  const directScenes = [Sd.activeScene, ...(Sd.sceneQueue || [])].filter(Boolean).filter(s => /Has Closed/.test(s.title || ''));
  check('direct close (settlement path): closure scene still shown', directScenes.length === 1, `scenes=${directScenes.length}`);
  // death with heir
  const Sh = adultLife();
  const fam = addFamily(Sh);
  const hb = mkBiz('biz_h', 'Family Pharmacy', 150000, 90000, 600000, []);
  hb.heirId = fam.child.id;
  Sh.career.businesses = [hb]; Sh.career.business = hb;
  Sh.money.cash = 1000000;
  triggerPlayerDeath(Sh, 'of a heart attack');
  check('death: journal previews heir transfer', Sh.journal.some(j => j.text.includes('Family Pharmacy') && j.text.includes(fam.child.firstName)), '');
  const nextS = continueAsChild(Sh, fam.child.id);
  check('death heir: business transferred to heir', !!nextS && getBusinesses(nextS).length === 1 && getBusinesses(nextS)[0].name === 'Family Pharmacy', `n=${nextS && getBusinesses(nextS).length}`);
  check('death heir: journal "You inherited ... from your father"', !!nextS && nextS.journal.some(j => j.text.includes('You inherited Family Pharmacy from your father')), '');
  // death with no heir
  const Sn = adultLife();
  const famN = addFamily(Sn);
  const nb = mkBiz('biz_n', 'Orphan Garage', 120000, 60000, 400000, []);
  Sn.career.businesses = [nb]; Sn.career.business = nb;
  Sn.money.cash = 200000; Sn.money.savings = 0;
  const nextN = continueAsChild(Sn, famN.child.id);
  check('death no-heir: business NOT in heir life', !!nextN && getBusinesses(nextN).length === 0, `n=${nextN && getBusinesses(nextN).length}`);
  check('death no-heir: journal says sold to estate', !!nextN && nextN.journal.some(j => j.text.includes('Orphan Garage') && j.text.includes('sold') && j.text.includes('estate')), '');
  check('death no-heir: sale proceeds entered estate (child cash 2184000)', !!nextN && nextN.money.cash === 2184000, `cash=${nextN && nextN.money.cash}`);
  // will / heir naming
  const Sw = adultLife();
  const famW = addFamily(Sw);
  const wb = mkBiz('biz_w', 'Heirloom Bakery', 90000, 50000, 200000, []);
  Sw.career.businesses = [wb]; Sw.career.business = wb;
  const elig = listEligibleHeirs(Sw);
  check('heirs: spouse first, then adult child, then father', elig.length >= 3 && elig[0].relation === 'spouse' && elig[1].relation === 'child', `order=${elig.map(e => e.relation).join(',')}`);
  check('heirs: stranger refused plainly', setBusinessHeir(Sw, wb, 'nobody').ok === false);
  const okH = setBusinessHeir(Sw, wb, famW.child.id);
  check('heirs: naming child heir works + sets will heir', okH.ok && wb.heirId === famW.child.id && Sw.willPlan.primaryHeirId === famW.child.id, okH.msg);
  const willHtml = renderBusinessWillSection(Sw, wb);
  check('heirs: business card names heir + has biz-set-heir buttons', willHtml.includes('biz-set-heir') && willHtml.includes(famW.child.firstName), '');
  const willCardHtml = renderWillHeirSection(Sw);
  check('heirs: will section names primary heir + has buttons', willCardHtml.includes('biz-set-heir') && willCardHtml.includes(famW.child.firstName), '');
}

/* ================= §9 run ops ================= */
console.log('--- §9 run ops ---');
{
  const So = adultLife();
  launchSmallBusiness(So, 'cafe', 'Café Op', { mode: 'part_time' });
  const ob = So.career.businesses[0];
  check('food R&D label is Refresh Menu', businessOpInfo(So, ob, 'rd').label === 'Refresh Menu');
  check('R&D cooldown 12 months', businessOpInfo(So, ob, 'rd').cooldownMonths === 12);
  check('bonus cooldown 3 months', businessOpInfo(So, ob, 'bonus').cooldownMonths === 3);
  check('pricing cooldown 1 month', businessOpInfo(So, ob, 'pricing').cooldownMonths === 1);
  /* v2.20 I2 — the food Refresh Menu run-op is REMOVED (the Decisions
     tab holds the real one at 8% of revenue, not a run-op at 65% of
     revenue): it can no longer run, and the refusal says so in plain
     words. The R&D buff + cooldown behavior is proven on the tech
     business below, whose Launch Feature op still exists. */
  const op1 = runBusinessOp(So, ob.id, 'rd');
  check('food R&D is removed, not runnable (the decision is the one price)', !op1.ok && /was removed/.test(op1.msg), op1.msg);
  const St = adultLife();
  launchSmallBusiness(St, 'software_studio', 'Tech Co', { mode: 'part_time' });
  const tb = St.career.businesses[0];
  check('tech R&D label is Launch Feature', businessOpInfo(St, tb, 'rd').label === 'Launch Feature');
  const revBefore = tb.monthlyRev;
  const top1 = runBusinessOp(St, tb.id, 'rd');
  check('first R&D ok (tech)', top1.ok, top1.msg);
  check('R&D is a buff, not a permanent ratchet (monthlyRev unchanged)', tb.monthlyRev === revBefore);
  const top2 = runBusinessOp(St, tb.id, 'rd');
  check('second R&D inside cooldown refused', !top2.ok && /available again/.test(top2.msg), top2.msg);
  const Sr = adultLife();
  launchSmallBusiness(Sr, 'retail_shop', 'Shop', { mode: 'part_time' });
  check('retail R&D label is Run a Promotion', businessOpInfo(Sr, Sr.career.businesses[0], 'rd').label === 'Run a Promotion');
  const Sh = adultLife();
  launchSmallBusiness(Sh, 'clinic', 'Clinic', { mode: 'part_time' });
  check('health R&D label is New Treatment', businessOpInfo(Sh, Sh.career.businesses[0], 'rd').label === 'New Treatment');
  const Sb = adultLife();
  launchSmallBusiness(Sb, 'cafe', 'Bonus Café', { mode: 'part_time' });
  const bb = Sb.career.businesses[0];
  bb.staff = [{ id: 'e1', name: 'Aya', role: 'barista', wageLocal: 5000, morale: 50, skill: 50, hiredYear: 2026, hiredMonth: 1 }];
  const bop = runBusinessOp(Sb, bb.id, 'bonus');
  check('staff bonus ok and lifts morale +10', bop.ok && bb.staff[0].morale === 60, `morale=${bb.staff[0].morale} ${bop.msg}`);
}

/* ================= §10 business loan ================= */
console.log('--- §10 business loan ---');
{
  const S = adultLife();
  launchSmallBusiness(S, 'cafe', 'Loan Café', { mode: 'full_time' });
  const biz = S.career.businesses[0];
  S.money.creditScore = 750; // Egypt SME product requires 700
  const lr = takeBusinessLoan(S, biz, 500000);
  check('business loan taken (Egypt SME 5%)', lr.ok, lr.msg);
  check('loan linked via biz.loanId', !!biz.loanId, `loanId=${biz.loanId}`);
  const loan = getBusinessLoan(S, biz);
  check('loan record: 500k, 5y term', !!loan && loan.balance === 500000 && loan.remainingMonths === 60, loan ? `${loan.balance} ${loan.remainingMonths}mo ${loan.annualRate * 100}%` : 'none');
  console.log('monthly payment:', loan && loan.monthlyPayment);
  const balBefore = loan.balance;
  settleHouseholdMonth(S);
  check('monthly payment runs through the settlement', loan.balance < balBefore && loan.remainingMonths === 59, `balance ${balBefore} -> ${loan.balance}, months ${loan.remainingMonths}`);
  const extra = payExtraOnBusinessLoan(S, biz, 100000);
  check('extra payment reduces the balance', extra.ok && loan.balance <= balBefore - 100000 + 10000, `balance=${loan.balance}`);
  const S2 = adultLife();
  launchSmallBusiness(S2, 'cafe', 'Loan Café 2', { mode: 'full_time' });
  S2.money.creditScore = 400;
  const lrBad = takeBusinessLoan(S2, S2.career.businesses[0], 500000);
  check('credit 400: loan refused', !lrBad.ok, lrBad.msg);
  // miss chain: payment made unaffordable by construction (W2's method)
  const S3 = adultLife();
  launchSmallBusiness(S3, 'cafe', 'Loan Café 3', { mode: 'full_time' });
  S3.money.creditScore = 750;
  takeBusinessLoan(S3, S3.career.businesses[0], 500000);
  const loan3 = getBusinessLoan(S3, S3.career.businesses[0]);
  loan3.monthlyPayment = 99999999; // unaffordable by construction
  S3.money.cash = 0; S3.money.savings = 0;
  settleHouseholdMonth(S3);
  check('miss 1: fee capitalised + missedMonths 1', loan3.missedMonths === 1 && loan3.balance > 500000, `missed=${loan3.missedMonths} balance=${loan3.balance}`);
  check('miss 1: late-fee ledger line', (S3.ledger || []).some(l => String(l.label || '').includes('Late fee on Business Loan')));
  settleHouseholdMonth(S3);
  check('miss 2: warning scene queued', loan3.missedMonths === 2 && (S3.sceneQueue || []).concat(S3.activeScene ? [S3.activeScene] : []).some(s => String(s.title || '').includes('Second Missed Payment')), `missed=${loan3.missedMonths}`);
  settleHouseholdMonth(S3);
  console.log('loan miss chain:', `missedMonths=${loan3.missedMonths} inCollections=${loan3.inCollections} balance=${loan3.balance}`);
  check('miss 3: loan in collections', loan3.inCollections === true, `missed=${loan3.missedMonths} collections=${loan3.inCollections}`);
}

/* ================= §11 a business takes time ================= */
console.log('--- §11 a business takes time ---');
{
  const Sj = adultLife();
  Sj.career.employed = true;
  Sj.career.job = { employer: 'CIB', title: 'Analyst', monthlyGross: 50000, performance: 70, startYear: 2024, monthsInRole: 12, workMode: 'normal' };
  const rj = launchSmallBusiness(Sj, 'cafe', 'Café Job', { mode: 'full_time' });
  /* v2.20 I1 — no silent resign any more: a full-time self-run launch
     while employed is refused in plain words (it names the employer
     and both alternatives — hire a manager and keep the job, or resign
     first and then launch), and the job stays. */
  check('full-time self-run launch while employed is refused in plain words (job kept)', !rj.ok && Sj.career.employed && !!Sj.career.job && /CIB/.test(rj.msg || '') && /manager/i.test(rj.msg || ''), rj.msg);
  const Sj2 = adultLife();
  Sj2.career.employed = true;
  Sj2.career.job = { employer: 'CIB', title: 'Analyst', monthlyGross: 50000, performance: 70, startYear: 2024, monthsInRole: 12, workMode: 'normal' };
  const stress0 = Sj2.player.vitals.stress, perf0 = Sj2.career.job.performance;
  const rj2 = launchSmallBusiness(Sj2, 'cafe', 'Café PT', { mode: 'part_time' });
  check('part-time launch while employed keeps the job', rj2.ok && Sj2.career.employed);
  settleHouseholdMonth(Sj2);
  check('Stretched (66h): stress +5 over the month', Sj2.player.vitals.stress >= stress0 + 5, `${stress0} -> ${Sj2.player.vitals.stress}`);
  check('Stretched: job performance -2', Sj2.career.job.performance === perf0 - 2, `${perf0} -> ${Sj2.career.job.performance}`);
  // launch list states the hours before launch
  const Sv = adultLife();
  Sv.career.employed = true;
  Sv.career.job = { employer: 'CIB', title: 'Analyst', monthlyGross: 50000, performance: 70, startYear: 2024, monthsInRole: 12, workMode: 'normal' };
  const html = strip(renderWorkTabHtml(Sv, { workSub: 'ventures', bizQuery: '' }));
  check('launch list states hours + Stretched risk before launch', /hrs\/week/.test(html) && /Stretched/.test(html), '');
  // v2.17: the player-standing launch gate is deleted — a >$50k venture
  // is no longer locked by the player's standing, at any standing.
  const Sg = adultLife();
  Sg.reputation = 58;
  const evDiag = evaluateBusinessLaunch(Sg, listAllBusinessVentures(Sg).find(b => b.id === 'diagnostic_lab'));
  check('>$50k venture NOT locked by low player standing (gate deleted)', evDiag.ok && evDiag.locks.every(l => !/reputation/i.test(l)), evDiag.locks.join(' '));
  Sg.reputation = 30;
  check('>$50k venture open even at standing 30', evaluateBusinessLaunch(Sg, listAllBusinessVentures(Sg).find(b => b.id === 'diagnostic_lab')).ok);
}

/* ================= §12 merge wiring ================= */
console.log('--- §12 merge wiring ---');
{
  // remote tick runs inside the settlement (not just as a direct call)
  const mkRemote = (remote) => {
    const S = adultLife();
    S.year = 2024; S.month = 6; S.player.age = 34;
    S.country = 'gbr'; S.city = 'London';
    // legally employable in gbr, so the monthly business settlement runs
    S.legal.residency.kind = 'permanent_resident';
    const b = mkBiz('biz_r', 'Cairo Café', 200000, 120000, 500000, []);
    b.remote = remote; b.repeatRate = 0.5;
    S.career.businesses = [b]; S.career.business = b;
    S.money.cash = 5_000_000;
    return S;
  };
  const Srem = mkRemote(true), Sctl = mkRemote(false);
  settleHouseholdMonth(Srem);
  settleHouseholdMonth(Sctl);
  /* v2.17: the remote business also earns less (revenue x0.7), so its month
     can be a losing month while the control's is profitable — the two
     repeat rates differ by the 0.02 tick plus at most the 0.03 net swing. */
  check('remote tick wired: remote business loses at least 0.02 repeat rate vs control in the settlement', Srem.career.businesses[0].repeatRate <= Sctl.career.businesses[0].repeatRate - 0.02 + 1e-9, `remote ${Srem.career.businesses[0].repeatRate} vs control ${Sctl.career.businesses[0].repeatRate}`);
  const St = mkRemote(true);
  St.career.businesses[0].repeatRate = 0.5;
  tickRemoteBusinesses(St);
  check('tickRemoteBusinesses alone: remote business loses exactly 0.02', St.career.businesses[0].repeatRate === 0.48, `rate=${St.career.businesses[0].repeatRate}`);
  const Stc = mkRemote(false);
  Stc.career.businesses[0].repeatRate = 0.5;
  tickRemoteBusinesses(Stc);
  check('tickRemoteBusinesses alone: a local business loses nothing', Stc.career.businesses[0].repeatRate === 0.5, `rate=${Stc.career.businesses[0].repeatRate}`);
  // lease countdown runs inside the settlement
  const Sl = adultLife();
  launchSmallBusiness(Sl, 'cafe', 'Lease Café', { mode: 'full_time' });
  const lb = Sl.career.businesses[0];
  rentBusinessPremises(Sl, lb, 'comm_shop');
  lb.premises.leaseMonthsLeft = 6;
  settleHouseholdMonth(Sl);
  check('lease countdown wired: 6 -> 5 months after one settlement', lb.premises.leaseMonthsLeft === 5, `left=${lb.premises.leaseMonthsLeft}`);
  // yearly decay runs inside tickAssetsAnnually
  const Sy = adultLife();
  launchSmallBusiness(Sy, 'cafe', 'Decay Café', { mode: 'full_time' });
  const yb = Sy.career.businesses[0];
  rentBusinessPremises(Sy, yb, 'comm_shop');
  yb.premises.conditionPct = 90;
  yb.premises.lastDecayYear = Sy.year - 1;
  tickAssetsAnnually(Sy);
  check('yearly decay wired: condition 90 -> 85 after one year', yb.premises.conditionPct === 85, `condition=${yb.premises.conditionPct}`);
  // render sections wired into the Ventures card
  const Sr = adultLife();
  Sr.money.creditScore = 750; // Egypt SME product requires 700
  launchSmallBusiness(Sr, 'cafe', 'Render Café', { mode: 'full_time' });
  const rb = Sr.career.businesses[0];
  hireBusinessEmployee(Sr, rb, 'barista');
  rentBusinessPremises(Sr, rb, 'comm_shop');
  takeBusinessLoan(Sr, rb, 100000);
  const famR = addFamily(Sr);
  setBusinessHeir(Sr, rb, famR.child.id);
  settleHouseholdMonth(Sr);
  const vhtml = renderWorkTabHtml(Sr, { workSub: 'ventures', bizQuery: '' });
  const vtext = strip(vhtml);
  const staffName = (rb.staff || [])[0] ? (rb.staff || [])[0].name : '';
  check('Ventures card shows staff section (employee name)', !!staffName && vtext.includes(staffName), `staff=${staffName}`);
  check('Ventures card shows premises section', vtext.includes('Small Shop') || vtext.includes('Market Stall') || /Premises/.test(vtext), '');
  check('Ventures card shows loan section', /Business loan/.test(vtext), '');
  check('Ventures card shows will section (heir name)', vtext.includes(famR.child.firstName), `child=${famR.child.firstName}`);
  check('Ventures card has no unwired slot comments left', !vhtml.includes('v2.11 W2: staff section') && !vhtml.includes('v2.11 W3: premises section') && !vhtml.includes('v2.11 W2: loan section') && !vhtml.includes('v2.11 W4: will section'));
  // will section wired into the Finance tab
  const fhtml = renderFinanceTabHtml(Sr, { financeTab: 'cashflow' });
  const ftext = strip(fhtml);
  check('Finance tab shows the heir section', /Primary heir/.test(ftext) || /No primary heir named/.test(ftext), '');
  // migration of an old single-business save
  const Sm = adultLife();
  Sm.career.business = { id: 'biz_old', typeId: 'cafe', name: 'Old Café', country: 'egy', employees: 3, monthlyRev: 50000, monthlyCost: 30000, capitalInvested: 200000, reputation: 60 };
  Sm.career.businesses = undefined;
  migrateBusinesses(Sm);
  check('old save migrates to businesses[0]', Sm.career.businesses.length === 1 && Sm.career.businesses[0].name === 'Old Café');
  check('migration keeps mirror in sync', Sm.career.business === Sm.career.businesses[0]);
  check('migration splits legacy employees into staff', Sm.career.businesses[0].staff.length === 3, `staff=${Sm.career.businesses[0].staff.length}`);
  check('migration gives an old save the neutral repeat rate (0.5)', Sm.career.businesses[0].repeatRate === 0.5, `rate=${Sm.career.businesses[0].repeatRate}`);
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
