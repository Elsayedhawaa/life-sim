#!/usr/bin/env node
/* v2.20 coordinator verify — Playtest Fixes (the fruit stall).
 * Run from the game root:  node tests/v220-verify.mjs
 * Proves the seven spec items END TO END on the merged tree, on
 * Elsayed's exact flow (employed, Egypt, June 2022, fruit stall):
 *  (A) one launch makes ONE business; a branch renders only as a
 *      branch row, never as a full card;
 *  (B) full-time + manager keeps the job; full-time self-run while
 *      employed is refused in plain words;
 *  (C) the fruit stall's decisions are fruit-stall decisions, and
 *      every one of the 55 venture types has decisions that fit it;
 *  (D) the prices reconcile — one price per action, stock math,
 *      manager wage scaled to the business, hire-button wage equals
 *      the candidates, portfolio totals exact, debt/warning lines
 *      follow the real state;
 *  (E) the header reconciles — used + free = 70, one workload number,
 *      managed/unmanaged match the cards;
 *  (F) the card is a menu, not a wall;
 *  (G) the purge, measured on the same grafted state W4/I4 used.
 * Depth lives in the four worker scripts (v220-i1..i4-verify, each
 * green on this tree); this script is the coordinator's own proof
 * that the merged game does what Elsayed asked for.
 * Exit 0 only when there are no FAILs. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(String(k), String(v)), removeItem: (k) => store.delete(k) };

let pass = 0, fail = 0;
const failedNames = [];
const check = (name, cond, detail = '') => {
  if (cond) { pass += 1; console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; failedNames.push(name); console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const countOcc = (html, sub) => String(html).split(sub).length - 1;
const countRe = (html, re) => (String(html).match(re) || []).length;

const { createNewLifeState, createPerson, ensureExtendedState } = await import('../src/core/schema.js');
const { listAvailableJobs, launchSmallBusiness } = await import('../src/systems/careerEducationEngine.js');
const { createBusiness, computeWorkload, listAllBusinessVentures, evaluateBusinessLaunch, ventureViabilityWarningHtml } = await import('../src/systems/businessEngine.js');
const { managementCapacityInfo, businessIsManaged, ownerHoursForBusiness } = await import('../src/systems/businessCapacity.js');
const { decisionsForBusiness } = await import('../src/systems/businessDecisions.js');
const { managerShortlist, goingRateForSkill, managerWageForBusiness } = await import('../src/systems/businessManager.js');
const { openBranchOfType } = await import('../src/systems/businessBranches.js');
const { orderStock, renderStockSectionHtml } = await import('../src/systems/businessOperations.js');
const { settleHouseholdMonth, repayBusinessDebt } = await import('../src/systems/economyEngine.js');
const { renderWorkTabHtml } = await import('../src/ui/views.js');
await import('../src/main.js');

/* Elsayed's state: Egypt, employed, June 2022 (his paste). */
async function playtestState() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm', ambition: 'family' });
  ensureExtendedState(S);
  S.year = 2022; S.month = 6; S.player.age = 30;
  S.money.cash = 607000; S.money.savings = 50000; S.money.creditScore = 650;
  S.education.stage = 'graduated_high'; S.education.highSchoolScore = 82;
  S.education.degrees = ['engineering']; S.education.schoolId = null;
  const jobs = listAvailableJobs(S);
  const j = jobs.find(x => x.title && x.employer) || jobs[0];
  S.career.employed = true; S.career.yearsExperience = 5;
  S.career.job = { title: j.title, employer: j.employer, track: j.track, level: j.level, monthlyGross: (j.pay && j.pay.gross) || 45000, workMode: 'full_time', monthsInRole: 12, startYear: 2021, performance: 70, bossId: null };
  const spouse = createPerson(S, { age: 29, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id]; S.marriage.status = 'married';
  for (const age of [8, 5]) {
    const ch = createPerson(S, { age, gender: age === 8 ? 'm' : 'f', role: 'child', relationLabel: age === 8 ? 'Son' : 'Daughter' });
    S.people[ch.id] = ch; S.relations.childIds.push(ch.id);
  }
  return S;
}
function adultLife(year = 2026) {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = year; S.month = 1; S.player.age = 35;
  S.money.cash = 5_000_000; S.money.savings = 0;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function mkBiz(typeId, name, rev = 200000, cost = 120000, capital = 500000) {
  return {
    id: `biz_${typeId}_v220`, typeId, name, country: 'egy', city: 'Cairo',
    level: 1, maxLevel: 5, volatility: 0.05,
    monthlyRev: rev, monthlyCost: cost, capitalInvested: capital,
    repeatRate: 0.5, mode: 'full_time',
    staff: [
      { id: 's1', name: 'Aya', role: 'manager', wageLocal: 15000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 },
      { id: 's2', name: 'Omar', role: 'assistant', wageLocal: 9000, morale: 70, skill: 60, hiredYear: 2024, hiredMonth: 1 }
    ],
    premises: { kind: 'rented', unitId: 'comm_shop', label: 'Small Shop', monthlyRentLocal: 8000, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0,
    buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 },
    lastOpUsed: { rd: -9999, bonus: -9999, pricing: -9999 },
    history: [], heirId: null, remote: false,
    foundedYear: 2022, foundedMonth: 6, pricingMode: 'balanced', lastPL: null
  };
}

/* ================= (A) Elsayed's exact flow: one launch, one business ================= */
console.log('--- (A) one launch, one business; branch is a row, never a card ---');
let S;
{
  S = await playtestState();
  S.money.cash = 3_000_000;
  const employer = S.career.job.employer;
  /* Step 1 — full-time, run it himself, while employed: refused. */
  const ft = createBusiness(S, 'fruit_stall', 'Radwan Fruit', { mode: 'full_time' });
  check('A1 full-time self-run while employed is refused in plain words', ft.ok === false && /manager/i.test(ft.msg || '') && ft.msg.includes(employer), ft.msg || '');
  check('A2 the job is kept after the refusal', S.career.employed === true && !!S.career.job, 'employed still true');
  check('A3 the refusal created no business', (S.career.businesses || []).length === 0, `businesses ${(S.career.businesses || []).length}`);
  /* Step 2 — part-time: ONE business. */
  const pt = createBusiness(S, 'fruit_stall', 'Radwan Fruit', { mode: 'part_time' });
  check('A4 part-time launch succeeds', pt.ok === true, pt.msg || '');
  check('A5 exactly one business exists after the part-time launch', (S.career.businesses || []).length === 1, `businesses ${(S.career.businesses || []).length}`);
  /* Step 3 — clicking part-time again (his second click) is a refusal, not a second business. */
  const again = createBusiness(S, 'fruit_stall', 'Radwan Fruit', { mode: 'part_time' });
  check('A6 a second same-type click is refused (duplicate guard)', again.ok === false && /already own/.test(again.msg || ''), again.msg || '');
  check('A7 still exactly one business', (S.career.businesses || []).length === 1, `businesses ${(S.career.businesses || []).length}`);
  /* Step 4 — the branch: a second record, but no second card. */
  S.year = 2022; S.month = 9;
  const br = openBranchOfType(S, S.career.businesses[0], 'Alexandria', 'kiosk');
  check('A8 Alexandria kiosk branch opens', br.ok === true, br.msg || '');
  const vent = renderWorkTabHtml(S, { activeTab: 'life', workSub: 'ventures' });
  check('A9 the branch renders only as a row — one card, not two', countOcc(vent, '<h3>Radwan Fruit') === 1, `card headings ${countOcc(vent, '<h3>Radwan Fruit')}`);
  check('A10 the branch row names the kiosk inside the parent card', vent.includes('Radwan Fruit — Kiosk Alexandria'), 'branch row present');
  check('A11 the header counts one business (the branch is not a business)', /1 business ·/.test(strip(vent)), strip((vent.match(/<span class="muted">\d+ business[^<]*<\/span>/) || [''])[0]));
  /* Step 5 — full-time + manager keeps the job, on a fresh state. */
  const S2 = await playtestState();
  S2.money.cash = 3_000_000;
  const cands = managerShortlist(S2, { country: 'egy', typeId: 'fruit_stall', mode: 'full_time', staff: [], capitalInvested: 47500, monthlyRev: 30000, monthlyCost: 20000, level: 1 });
  const mgr = cands[0] ? { name: cands[0].name, skill: cands[0].skill, wage: cands[0].wage, loyalty: cands[0].loyalty, policy: 'safe', hiredYear: 2022, hiredMonth: 6, personId: cands[0].personId || null } : null;
  const ftMgr = createBusiness(S2, 'fruit_stall', 'Radwan Fruit', { mode: 'full_time', manager: mgr, runBy: 'manager' });
  check('A12 full-time + manager launches and keeps the job', ftMgr.ok === true && S2.career.employed === true, ftMgr.msg || '');
  check('A13 a manager-run business costs the owner 0 hours', ownerHoursForBusiness(S2, S2.career.businesses[0]) === 0, `hours ${ownerHoursForBusiness(S2, S2.career.businesses[0])}`);
}

/* ================= (B) fruit-stall decisions ================= */
console.log('--- (B) the fruit stall gets fruit-stall decisions; all 55 types fit ---');
{
  const S = adultLife();
  const biz = mkBiz('fruit_stall', 'Radwan Fruit', 20900, 100, 47500);
  const ids = decisionsForBusiness(S, biz).map(d => d.id);
  const want = ['fruit_morning_wholesale', 'fruit_seasonal', 'fruit_better_corner', 'fruit_spoilage', 'fruit_regulars_box', 'fruit_price_board', 'fruit_bicycle_delivery', 'food_train_staff'];
  check('B1 the stall has exactly its 8 decisions', want.every(id => ids.includes(id)) && ids.length === 8, `got ${ids.join(', ')}`);
  const removed = ['food_refresh_menu', 'food_signature_dish', 'food_invite_critic', 'food_cooking_competition', 'food_launch_catering', 'food_launch_delivery'];
  check('B2 no restaurant decisions on the stall (no menu, dish, critic, competition, catering, delivery)', removed.every(id => !ids.includes(id)), `leaked: ${removed.filter(id => ids.includes(id)).join(', ') || 'none'}`);
  const costOf = (id) => decisionsForBusiness(S, biz).find(d => d.id === id)?.cost;
  check('B3 stall decision costs exact at the anchor (2,500 / 1,800 / 4,000 / 1,500 / 1,000 / 500 / 1,800)', costOf('fruit_morning_wholesale') === 2500 && costOf('fruit_seasonal') === 1800 && costOf('fruit_better_corner') === 4000 && costOf('fruit_spoilage') === 1500 && costOf('fruit_regulars_box') === 1000 && costOf('fruit_price_board') === 500 && costOf('fruit_bicycle_delivery') === 1800, `wholesale ${costOf('fruit_morning_wholesale')}, seasonal ${costOf('fruit_seasonal')}, corner ${costOf('fruit_better_corner')}`);
  /* Whole class: every venture type has decisions that fit it. */
  const map = new Map();
  for (const y of [1970, 1985, 2000, 2010, 2026]) {
    const Sx = adultLife(y);
    for (const r of listAllBusinessVentures(Sx)) if (!map.has(r.id)) map.set(r.id, r);
  }
  const TYPES = [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
  let withDecisions = 0;
  const thin = [];
  for (const t of TYPES) {
    const Sx = (t.id === 'radio_repair' || t.id === 'video_rental' || t.id === 'cyber_cafe') ? adultLife(2000) : adultLife(2026);
    const b = mkBiz(t.id, t.label, Math.max(2000, (t.monthlyRevUsd2026 || 2000) * 50), 100, 500000);
    const list = decisionsForBusiness(Sx, b);
    if (list.length >= 3) withDecisions += 1; else thin.push(`${t.id} (${list.length})`);
  }
  check('B4 all 55 venture types have decisions (>=3 each)', TYPES.length === 55 && withDecisions === 55, `types ${TYPES.length}, with decisions ${withDecisions}, thin: ${thin.join(', ') || 'none'}`);
  const bakery = mkBiz('bakery', 'Bakery', 200000, 120000, 500000);
  check('B5 bakery: no food critic, counter not menu', !decisionsForBusiness(adultLife(), bakery).some(d => d.id === 'food_invite_critic') && decisionsForBusiness(adultLife(), bakery).some(d => d.label === 'Refresh the counter — new bakes'), '');
  const studio = mkBiz('software_studio', 'Studio', 200000, 120000, 500000);
  check('B6 software studio: no funding rounds (a consultancy, not a startup)', !decisionsForBusiness(adultLife(), studio).some(d => /funding/.test(d.id)), '');
}

/* ================= (C) prices reconcile ================= */
console.log('--- (C) every price reconciles ---');
{
  const S = await playtestState();
  S.money.cash = 3_000_000;
  const launched = createBusiness(S, 'fruit_stall', 'Radwan Fruit', { mode: 'part_time' });
  const stall = S.career.businesses[0];
  check('C1 monthlyCost stays 7,600 (was collapsed to 100)', stall.monthlyCost === 7600, `got ${stall.monthlyCost}`);
  check('C2 skill-51 manager asks 6,641/mo (was 12,474)', goingRateForSkill(S, stall, 51) === 6641, `got ${goingRateForSkill(S, stall, 51)}`);
  check('C3 launch manager estimate is the shortlist curve at skill 45 (6,394)', managerWageForBusiness(S, stall, 45) === 6394, `got ${managerWageForBusiness(S, stall, 45)}`);
  const stockHtml = renderStockSectionHtml(S, stall);
  const ordered = orderStock(S, stall, 800);
  check('C4 stock: 800 units cost 10,400 (800 x 13 to buy, sells for ~26)', ordered.ok === true && ordered.cost === 10400 && stockHtml.includes('Order 800 units — costs 10,400 EGP'), `cost ${ordered.cost}`);
  /* Portfolio totals: settle a month on two businesses, totals row must equal the sum of the card nets. */
  const S2 = await playtestState();
  S2.money.cash = 20_000_000;
  createBusiness(S2, 'cafe', 'Portfolio Café', { mode: 'part_time' });
  createBusiness(S2, 'retail_shop', 'Portfolio Shop', { mode: 'part_time', allowDuplicate: true });
  settleHouseholdMonth(S2);
  const vent2 = renderWorkTabHtml(S2, { activeTab: 'life', workSub: 'ventures' });
  const cardNets = [...String(vent2).matchAll(/data-biz-net="(-?\d+)"/g)].map(m => Number(m[1]));
  const totalsMatch = String(vent2).match(/Portfolio totals \(last settled month\): income <strong class="mono">([^<]+)<\/strong> · costs <strong class="mono">([^<]+)<\/strong> · tax <strong class="mono">([^<]+)<\/strong> · net <strong class="mono[^"]*">([^<]+)<\/strong>/);
  const parseMoney = (s) => Number(String(s).replace(/[^0-9-]/g, '')) * (String(s).includes('−') || String(s).trim().startsWith('-') ? 1 : 1);
  const totalsNet = totalsMatch ? Number(String(totalsMatch[4]).replace(/[^0-9-]/g, '')) * (String(totalsMatch[4]).includes('−') ? -1 : 1) : null;
  const cardNetSum = cardNets.reduce((a, b) => a + b, 0);
  check('C5 portfolio totals net equals the sum of the card nets', totalsNet !== null && cardNets.length === 2 && Math.abs(totalsNet - cardNetSum) <= 1, `totals net ${totalsNet}, cards ${cardNets.join(' + ')} = ${cardNetSum}`);
  /* Debt line follows the real state; the Repay button is wired. */
  const S3 = await playtestState();
  S3.money.cash = 3_000_000;
  createBusiness(S3, 'fruit_stall', 'Radwan Fruit', { mode: 'part_time' });
  const biz3 = S3.career.businesses[0];
  biz3.debtLocal = 14294; biz3.misses = 1; biz3.debtSinceMonth = 6; biz3.debtSinceYear = 2022;
  const vent3 = renderWorkTabHtml(S3, { activeTab: 'life', workSub: 'ventures' });
  check('C6 debt line names the amount, the missed months and the month it began', vent3.includes('14,294') && /1 missed month/.test(vent3) && /June 2022/.test(vent3), 'debt line rendered');
  check('C7 the debt line has a Repay button, and the handler exists in main.js', vent3.includes('data-action="biz-repay-debt"') && readFileSync(join(ROOT, 'src/main.js'), 'utf8').includes("action === 'biz-repay-debt'"), 'button + handler');
  const cashBefore = S3.money.cash;
  const repaid = repayBusinessDebt(S3, biz3);
  check('C8 repaying the debt clears it from cash', repaid.ok === true && biz3.debtLocal === 0 && S3.money.cash === cashBefore - 14294, `debt ${biz3.debtLocal}, cash moved ${cashBefore - S3.money.cash}`);
  /* Launch warning names the real comparison (2022, Elsayed's year —
     wages are era-priced, so the 2026 figure is higher). */
  const S4 = adultLife(2022);
  const stallBp = listAllBusinessVentures(S4).find(b => b.id === 'fruit_stall');
  const warnHtml = ventureViabilityWarningHtml(S4, stallBp);
  check('C9 launch warning names wages 13,613, takings 9,029, shortfall 10,284', warnHtml.includes('13,613') && warnHtml.includes('9,029') && warnHtml.includes('10,284'), strip(warnHtml).slice(0, 120));
}

/* ================= (D) header reconciles ================= */
console.log('--- (D) the header reconciles ---');
{
  const w = computeWorkload(S);
  const cap = managementCapacityInfo(S);
  check('D1 workload = job + allocated business hours (48 + 18 = 66)', w.totalHours === 66 && w.jobHours === 48 && w.businessHours === 18, `job ${w.jobHours} + businesses ${w.businessHours} = ${w.totalHours}`);
  check('D2 workload + free = 70 (the week)', w.totalHours + w.ownerHoursFree === 70, `${w.totalHours} + ${w.ownerHoursFree} = 70`);
  check('D3 capacity and workload agree on every number', cap.ownerHoursUsed === w.businessHours && cap.workloadHours === w.totalHours && cap.ownerHoursFree === w.ownerHoursFree && cap.managedCount === w.managedCount && cap.unmanagedCount === w.unmanagedCount, '');
  const vent = renderWorkTabHtml(S, { activeTab: 'life', workSub: 'ventures' });
  const hdr = strip((vent.match(/<span class="muted">\d+ business[^<]*<\/span>/) || [''])[0]);
  check('D4 header prints one workload, free hours, managed counts and the uncovered kiosk', /Workload 66 hrs\/week \(job 48 \+ your businesses 18\)/.test(hdr) && /4h\/week free/.test(hdr) && /1 managed · 0 unmanaged/.test(hdr) && /18h\/week uncovered — Radwan Fruit — Kiosk Alexandria has nobody running it/.test(hdr), hdr);
  const managedBadges = countOcc(vent, '<span class="hud-pill">Managed</span>');
  const unmanagedBadges = countOcc(vent, '<span class="hud-pill">Unmanaged — nobody runs it</span>');
  check('D5 card badges match the header counts (1 managed, 0 unmanaged)', managedBadges === 1 && unmanagedBadges === 0, `badges ${managedBadges}/${unmanagedBadges}`);
}

/* ================= (E) the card is a menu ================= */
console.log('--- (E) the card is a menu, not a wall ---');
{
  const vent = renderWorkTabHtml(S, { activeTab: 'life', workSub: 'ventures' });
  const forSaleIdx = vent.indexOf('<div class="biz-for-sale-section"');
  const cardsEnd = forSaleIdx >= 0 ? forSaleIdx : vent.indexOf('Register a Company');
  const cardsHtml = vent.slice(vent.indexOf('Private Enterprise'), cardsEnd);
  const open = String(cardsHtml).replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, '');
  check('E1 no open section remains on the card (only the menu heading h4)', countRe(open, /<h4>/g) === 1 && countOcc(open, 'Run the business — open a section') === 1, `open <h4>: ${countRe(open, /<h4>/g)}`);
  check('E2 the menu still has all 7 sections + Ownership + Decisions', countRe(vent, /<details class="biz-ops-/g) === 7 && countOcc(vent, '<details class="biz-ownership"') === 1 && countOcc(vent, '<details class="biz-decisions"') === 1, '7 + 1 + 1');
  check('E3 "Scale Branch" is gone, "Grow the business" is the level-up, never on a branch', countOcc(vent, 'Scale Branch') === 0 && countOcc(vent, 'Grow the business') === 1, '');
  check('E4 "Exit & Sell" is gone from the bottom row (exits live in Cash)', countOcc(vent, 'Exit &amp; Sell') === 0 && countRe(vent, /data-action="sell-business"/g) === 1, '');
  check('E5 ONE hire path for a manager (no staff-role "Hire Manager")', countOcc(vent, 'Hire Manager') === 0 && countRe(vent, /data-action="biz-hire-manager"/g) > 0, '');
  check('E6 no branch offered in Alexandria (one branch per city)', countRe(vent, /data-action="biz-branch-open"[^>]*data-city="Alexandria"/g) === 0, '');
  check('E7 no wrong-city rent header (Cairo for the Cairo stall, nothing for Alexandria)', countOcc(vent, 'Rent a unit in Cairo:') === 1 && countOcc(vent, 'Rent a unit in Alexandria:') === 0, '');
  check('E8 "Infinity" and "Level cap" never print; the pill states the cap once', countOcc(vent, 'Infinity') === 0 && countOcc(vent, 'Level cap') === 0 && countOcc(vent, 'Level 1/2') === 1, '');
}

/* ================= (F) purge on the same grafted state ================= */
console.log('--- (F) purge, same state W4/I4 measured ---');
{
  const S1 = await playtestState();
  S1.money.cash = 3_000_000;
  createBusiness(S1, 'fruit_stall', 'Radwan Fruit', { mode: 'part_time' });
  S1.money.cash = 607000;
  const biz1 = S1.career.businesses[0];
  biz1.monthsTrading = 3;
  biz1.lastPL = { revenue: 32251, costs: 27353, tax: 0, net: 4898, rent: 0, wages: 18000, other: 9353, franchise: 0, remote: 0, manager: 0, reinvest: 0, harvestOut: 0, taxLabel: 'Tax' };
  biz1.history = [{ year: 2025, month: 12, revenue: 32251, costs: 27353, net: 4898 }];
  const vent1 = renderWorkTabHtml(S1, { activeTab: 'life', workSub: 'ventures' });
  const n1 = countOcc(vent1, 'keeps the place running — average skill, no gain, no loss');
  const n2 = countOcc(vent1, 'cold start');
  const n3titles = (String(vent1).match(/title="[^"]*one month's wage[^"]*"/g) || []).length;
  const n4 = countOcc(vent1, '+0 EGP revenue') + countOcc(vent1, '+0%');
  const n6 = (String(vent1).match(/Level capped at 2/g) || []).length;
  check('F1 NEW-registry dead text is 0 (was 34)', n1 === 0 && n2 === 0 && n3titles === 0 && n4 === 0 && n6 === 0, `N1=${n1} N2=${n2} N3titles=${n3titles} N4=${n4} N6=${n6}`);
  /* Disabled buttons without a visible reason — the v2.12/v2.18 rule:
     a nearby lock-reason span, OR the button's own label stating the
     reason (e.g. "Promote to manager (needs skill 60)"). */
  const LABEL_REASON = /needs|you scored|not taught|degree held|tracks open|launches in|need \d+ more|more point|✓|already|holds |paid|completed|in wallet|in use|starts at|school years over|answer open decision|visa-free|stamped|tutor hired|built|wing added|fulfilled|below .*threshold|not eligible/i;
  const allHtml = vent1;
  const btnRe = /<button\b[^>]*\bdisabled\b[^>]*>([\s\S]*?)<\/button>/g;
  let total = 0, without = 0;
  let m;
  while ((m = btnRe.exec(allHtml))) {
    total += 1;
    const label = strip(m[1] || '');
    const start = m.index, end = btnRe.lastIndex;
    const after = allHtml.slice(end, end + 500);
    const before = allHtml.slice(Math.max(0, start - 500), start);
    const ok = /<span class="lock-reason">/.test(after) || /<span class="lock-reason">/.test(before) || LABEL_REASON.test(label);
    if (!ok) without += 1;
  }
  check('F2 disabled buttons without a reason stay 0', without === 0, `disabled total ${total}, without reason ${without}`);
}

console.log(`\nRESULT: ${pass} PASS, ${fail} FAIL${fail ? ` — FAILED: ${failedNames.join(' | ')}` : ''}`);
process.exit(fail ? 1 : 0);
