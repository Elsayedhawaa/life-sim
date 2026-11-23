#!/usr/bin/env node
/* v2.20 I4 verify — header + card-as-menu + purge.
 * Run from the game root:  node tests/v220-i4-verify.mjs
 * Builds the SAME two grafted states W4 measured the baseline on
 * (seed 777, Egypt, employed adult, spouse + 2 children, cash
 * 607,000, credit 650) and proves, with measured numbers:
 *  (a) the header reconciles — workload = job + ALLOCATED hours,
 *      workload + free = 70, the workload is the same number the
 *      Stretched penalty reads, and the managed/unmanaged counts
 *      match the per-card badges;
 *  (b) the card is a menu — the 11 open sections are gone from the
 *      open card (only the menu heading <h4> sits outside a
 *      <details>), the old sections live inside the 7 menu sections
 *      + Ownership + Decisions;
 *  (c) no branch is offered where one already exists (city rule,
 *      per-player) — the 59-button 3-business state and the API guard;
 *  (d) no wrong-city unit is offered (Alexandria kiosk offers
 *      Alexandria units only);
 *  (e) the level cap is one number, stated once ("no cap", never
 *      "Infinity"), and expandBusiness agrees with it;
 *  (f) the purge on the same 1-business grafted state — dead text
 *      34 -> 0 by this script's count (W4 wrote 33; the extra 1 is a
 *      5th visible "cold start" — 5 ops branch rows, not 4),
 *      disabled-without-reason stays 0, v2.18-registry dead text 0.
 * Exit 0 only when there are no FAILs. Baselines marked BASE were
 * measured on the pre-fix copy (/tmp/i4-base) with this same state
 * builder, before any I4 edit. */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const store = new Map();
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(String(k), String(v)), removeItem: (k) => store.delete(k) };

let pass = 0, fail = 0;
const check = (name, cond, detail = '') => {
  if (cond) { pass += 1; console.log(`PASS ${name}${detail ? ` — ${detail}` : ''}`); }
  else { fail += 1; console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const countOcc = (html, sub) => String(html).split(sub).length - 1;
const countRe = (html, re) => (String(html).match(re) || []).length;
/* HTML with every <details>…</details> block removed: what is left
   is the OPEN card. (No <details> nests inside another here.) */
const stripDetails = (html) => String(html).replace(/<details\b[^>]*>[\s\S]*?<\/details>/g, '');

const { createNewLifeState, createPerson, ensureExtendedState } = await import('../src/core/schema.js');
const { listAvailableJobs } = await import('../src/systems/careerEducationEngine.js');
const { createBusiness, computeWorkload, expandBusiness, applyWorkloadMonth } = await import('../src/systems/businessEngine.js');
const { managementCapacityInfo, businessIsManaged, ownerHoursForBusiness } = await import('../src/systems/businessCapacity.js');
const { isManaged } = await import('../src/systems/businessManager.js');
const { openBranchOfType, hasBranchInCity } = await import('../src/systems/businessBranches.js');
const { managerShortlist } = await import('../src/systems/businessManager.js');
const { businessLevelCap, listCommercialPremises, rentBusinessPremises } = await import('../src/systems/businessPremises.js');
const { renderWorkTabHtml } = await import('../src/ui/views.js');
await import('../src/main.js');

async function baseState() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm', ambition: 'family' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 30;
  S.money.cash = 607000; S.money.savings = 50000; S.money.creditScore = 650;
  S.education.stage = 'graduated_high'; S.education.highSchoolScore = 82;
  S.education.degrees = ['engineering']; S.education.schoolId = null;
  const jobs = listAvailableJobs(S);
  const j = jobs.find(x => x.title && x.employer) || jobs[0];
  S.career.employed = true; S.career.yearsExperience = 5;
  S.career.job = { title: j.title, employer: j.employer, track: j.track, level: j.level, monthlyGross: (j.pay && j.pay.gross) || 45000, workMode: 'full_time', monthsInRole: 12, startYear: 2025, performance: 70, bossId: null };
  const spouse = createPerson(S, { age: 29, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id]; S.marriage.status = 'married';
  for (const age of [8, 5]) {
    const ch = createPerson(S, { age, gender: age === 8 ? 'm' : 'f', role: 'child', relationLabel: age === 8 ? 'Son' : 'Daughter' });
    S.people[ch.id] = ch; S.relations.childIds.push(ch.id);
  }
  return S;
}

/* ---- A. Elsayed-like 3-business state (W4 §A) ---- */
const S3 = await baseState();
S3.money.cash = 3000000;
const cands = managerShortlist(S3, { country: 'egy', typeId: 'fruit_stall', mode: 'full_time', staff: [], capitalInvested: 47500, monthlyRev: 30000, monthlyCost: 20000, level: 1 });
const mgr = cands[0] ? { name: cands[0].name, skill: cands[0].skill, wage: cands[0].wage, loyalty: cands[0].loyalty, policy: 'safe', hiredYear: 2022, hiredMonth: 6, personId: cands[0].personId || null } : null;
S3.year = 2022; S3.month = 6;
createBusiness(S3, 'fruit_stall', 'Radwan Fruit', { mode: 'full_time', manager: mgr, runBy: 'manager' });
/* v2.20 merge — I1's duplicate guard refuses a second same-type launch
   without an explicit confirm, so the second stall is opened through
   the "Open a second one" path (allowDuplicate) to build the same
   3-business state W4 measured. */
createBusiness(S3, 'fruit_stall', 'Radwan Fruit', { mode: 'part_time', allowDuplicate: true });
S3.year = 2022; S3.month = 9;
openBranchOfType(S3, S3.career.businesses[0], 'Alexandria', 'kiosk');
const vent3 = renderWorkTabHtml(S3, { activeTab: 'life', workSub: 'ventures' });
const [ftBiz, ptBiz, kioskBiz] = S3.career.businesses;

console.log('== (a) header reconciles — 3-business state ==');
const w3 = computeWorkload(S3);
const cap3 = managementCapacityInfo(S3);
console.log(`  job=${w3.jobHours} allocated=${w3.businessHours} workload=${w3.totalHours} free=${w3.ownerHoursFree} managed=${w3.managedCount} unmanaged=${w3.unmanagedCount} uncovered=${w3.uncoveredHours} (${w3.uncoveredNames.join(', ')})`);
check('a1 workload = job + allocated business hours', w3.totalHours === w3.jobHours + w3.businessHours, `${w3.jobHours} + ${w3.businessHours} = ${w3.totalHours} (BASE intended 48 + 36 = 84)`);
check('a2 workload + free = 70 (the week)', w3.totalHours + w3.ownerHoursFree === 70, `${w3.totalHours} + ${w3.ownerHoursFree} = 70 (BASE 84 + 4 = 88)`);
check('a3 capacity and workload agree on every number', cap3.ownerHoursUsed === w3.businessHours && cap3.workloadHours === w3.totalHours && cap3.ownerHoursFree === w3.ownerHoursFree && cap3.managedCount === w3.managedCount && cap3.unmanagedCount === w3.unmanagedCount);
check('a4 uncovered is the kiosk hours, shown separately', w3.uncoveredHours === 18 && w3.uncoveredNames.length === 1 && /Kiosk Alexandria/.test(w3.uncoveredNames[0]), `${w3.uncoveredHours}h — ${w3.uncoveredNames.join(', ')}`);
const hdrMatch = vent3.match(/<span class="muted">\d+ business[^<]*<\/span>/);
const hdr = hdrMatch ? hdrMatch[0] : '';
console.log('  HEADER:', strip(hdr));
check('a5 header prints workload 66 (job 48 + businesses 18), free 4', /Workload 66 hrs\/week \(job 48 \+ your businesses 18\)/.test(hdr) && /4h\/week free/.test(hdr), hdr ? strip(hdr) : '(header span not found)');
check('a6 header prints uncovered 18h for the kiosk', /18h\/week uncovered — Radwan Fruit — Kiosk Alexandria has nobody running it/.test(hdr));
check('a7 header managed counts match the one definition', /2 managed · 0 unmanaged/.test(hdr) && businessIsManaged(S3, ftBiz) === true && businessIsManaged(S3, ptBiz) === true && businessIsManaged(S3, kioskBiz) === false, `FT ${businessIsManaged(S3, ftBiz)} PT ${businessIsManaged(S3, ptBiz)} kiosk ${businessIsManaged(S3, kioskBiz)}`);
check('a8 card isManaged() is the same definition as the header', isManaged(S3, ftBiz) === true && isManaged(S3, ptBiz) === true && isManaged(S3, kioskBiz) === false, 'BASE card isManaged was true/true/true (3/0)');
const managedBadges = countOcc(vent3, '<span class="hud-pill">Managed</span>');
const unmanagedBadges = countOcc(vent3, '<span class="hud-pill">Unmanaged — nobody runs it</span>');
check('a9 per-card managed badges match the header count', managedBadges === 2 && unmanagedBadges === 0, `Managed badges ${managedBadges}, Unmanaged badges ${unmanagedBadges} (header 2/0 — the branch is not counted: it has no card, its need is the uncovered line)`);
check('a10 kiosk card reads ALLOCATED hours, not intent', countOcc(vent3, 'you run it yourself (18 hrs/week)') === 1 && countOcc(vent3, 'your week is full — no hours left for it') === 1 && countOcc(vent3, 'you run it yourself (0 hrs/week)') === 0, 'PT card says 18h; kiosk card says the week is full');
const stressBefore = S3.player.vitals.stress || 0;
const wPen = applyWorkloadMonth(S3);
check('a11 Stretched penalty keys off the same workload number', wPen.totalHours === 66 && wPen.stretched === true && (S3.player.vitals.stress || 0) === stressBefore + 5, `penalty workload ${wPen.totalHours}, stretched ${wPen.stretched}, stress ${stressBefore} -> ${S3.player.vitals.stress}`);

console.log('== (b) card is a menu — 3-business state ==');
/* Scope to the Ventures card itself (header + 3 bizCards): the
   for-sale listings below it carry their own <h4>s. */
const forSaleIdx = vent3.indexOf('<div class="biz-for-sale-section"');
const cardsEnd = forSaleIdx >= 0 ? forSaleIdx : vent3.indexOf('Register a Company');
const cardsHtml3 = vent3.slice(vent3.indexOf('Private Enterprise'), cardsEnd);
const open3 = stripDetails(cardsHtml3);
check('b1 no open section remains on the card (only the menu heading h4, one per card)', countRe(open3, /<h4>/g) === 2 && countOcc(open3, 'Run the business — open a section') === 2, `open <h4> after stripping <details>: ${countRe(open3, /<h4>/g)} (BASE 14 h4s on the tab, 8 of them open card sections; 2 cards — the branch renders only as a row, I1)`);
for (const [cls, base] of [['biz-staff-section', 1], ['biz-manager-section', 1], ['biz-branches-section', 1], ['biz-brand-section', 1], ['biz-exits-section', 1], ['biz-loan-section', 1], ['biz-decisions-section', 1]]) {
  check(`b2 .${cls} gone from the open card`, countOcc(open3, cls) === 0, `open-card occurrences ${countOcc(open3, cls)} (BASE ${base} open per card)`);
}
check('b3 menu still has all 7 sections + Ownership + Decisions details', countRe(vent3, /<details class="biz-ops-/g) === 14 && countOcc(vent3, '<details class="biz-ownership"') === 2 && countOcc(vent3, '<details class="biz-decisions"') === 2, '14 ops details (7 x 2 cards) + 2 Ownership + 2 Decisions — the branch has no card (I1)');
check('b4 ops row (R&D / Team Bonus / Pricing) is gone', countOcc(vent3, 'data-action="biz-op"') === 0, 'BASE ops row rendered 3 buttons per card');
check('b5 "Scale Branch" relabelled "Grow the business", never on a branch card', countOcc(vent3, 'Scale Branch') === 0 && countOcc(vent3, 'Grow the business') === 2, '"Grow the business" x2 (the two parent cards); kiosk card has none');
check('b6 bottom-row "Exit & Sell" deduped into Cash', countOcc(vent3, 'Exit &amp; Sell') === 0 && countRe(vent3, /data-action="sell-business"/g) === 2, 'sell-business buttons x2, all inside Cash details (2 cards — the branch has no card, I1)');
check('b7 ONE hire path for a manager (no staff-role "Hire Manager")', countOcc(vent3, 'Hire Manager') === 0 && countRe(vent3, /data-action="biz-hire-manager"/g) > 0, 'staff-role Hire Manager x0; Manager-section candidate buttons present');
check('b8 part-time label is the exact 18, not "15–20"', countOcc(vent3, '15–20 hrs/week') === 0 && countOcc(vent3, '18 hrs/week') >= 2, '"15–20 hrs/week" x0');

console.log('== (c) branch offers — city rule, per-player ==');
const branchBtns3 = countRe(vent3, /data-action="biz-branch-open"/g);
check('c1 3-business branch offers fall 59 -> 32 (16 + 16)', branchBtns3 === 32, `${branchBtns3} buttons (BASE 59; the kiosk card's 20 go away with I1's branch-card filter, leaving 32)`);
check('c2 no branch offered in Alexandria on any parent card', countRe(vent3, /data-action="biz-branch-open"[^>]*data-city="Alexandria"/g) === 0, 'BASE 7 Alexandria buttons (1 kiosk + 2 second-shop + 4 more)');
check('c3 "Second shop in Alexandria" and "Kiosk in Alexandria" are gone', countOcc(vent3, 'Second shop in Alexandria') === 0 && countOcc(vent3, 'Kiosk in Alexandria') === 0, 'BASE 2 + 1');
check('c4 a blocked city says why, once per parent card', countOcc(vent3, 'you already have a branch there (one branch per city)') === 2, 'one muted line per parent card');
check('c5 API guard refuses a second branch in the same city', (() => { const r = openBranchOfType(S3, ftBiz, 'Alexandria', 'shop'); return r.ok === false && /already have a branch in Alexandria/.test(r.msg); })());
check('c6 API guard still allows a branch in a free city', (() => { const r = openBranchOfType(S3, ftBiz, 'Mansoura', 'shop'); return r.ok === true; })(), 'Mansoura shop opened (test state only)');
check('c7 API guard refuses a branch of a branch', (() => { const r = openBranchOfType(S3, kioskBiz, 'Mansoura', 'shop'); return r.ok === false; })());

console.log('== (d) wrong city ==');
check('d1 rent headers name the BUSINESS city, not the player city', countOcc(vent3, 'Rent a unit in Cairo:') === 2 && countOcc(vent3, 'Rent a unit in Alexandria:') === 0, 'BASE "Rent a unit in Cairo:" x3 (incl. the Alexandria kiosk); the kiosk has no card any more (I1) so no Alexandria header renders — its city rule is proven by d2–d4');
const alexUnits = listCommercialPremises(S3, 'Alexandria');
check('d2 every unit offered to Alexandria carries Alexandria', alexUnits.length > 0 && alexUnits.every(u => u.city === 'Alexandria'), `${alexUnits.length} units, all city=Alexandria`);
check('d3 renting a unit for the kiosk works in its own city', (() => { const r = rentBusinessPremises(S3, kioskBiz, 'comm_shop'); return r.ok === true; })());
const S3b = await baseState();
S3b.housing.properties.push({ id: 'prop_cairo_1', name: 'Cairo Flat', country: 'egy', city: 'Cairo', areaM2: 80, valueLocal: 2000000, conditionPct: 90 });
check('d4 an owned Cairo property is not offered to an Alexandria business', !listCommercialPremises(S3b, 'Alexandria').some(u => u.unitId === 'prop:prop_cairo_1') && listCommercialPremises(S3b, 'Cairo').some(u => u.unitId === 'prop:prop_cairo_1'));

console.log('== (e) level cap is one number ==');
check('e1 businessLevelCap: home 2, rented no cap', businessLevelCap(ptBiz) === 2 && businessLevelCap(kioskBiz) === Infinity, `home ${businessLevelCap(ptBiz)}, rented ${businessLevelCap(kioskBiz)}`);
check('e2 card pill states the cap once ("no cap", never "Infinity")', countOcc(vent3, 'Infinity') === 0 && countOcc(vent3, 'Level cap') === 0 && countOcc(vent3, 'Level 1/2') === 2 && countOcc(vent3, 'Level 1 · no cap') === 0, 'home cards "Level 1/2" x2, no "no cap" card — the rented kiosk renders only as a row (I1)');
ptBiz.level = 2;
const capRefuse = expandBusiness(S3, ptBiz);
check('e3 expandBusiness refuses a home business past level 2 with the cap', capRefuse.ok === false && /cannot grow past level 2/.test(capRefuse.msg), capRefuse.msg || '');
/* v2.20 merge — e4 used to expand the kiosk, but a branch cannot
   expand on its own (I1's guard: the parent expands). The cap test
   now uses the part-time stall: rent it a unit (no cap any more),
   give it the same gate-passing setup the kiosk had (traded 8
   months, 2 profitable months, team skill), and it grows. */
ptBiz.level = 1;
const rentPt = rentBusinessPremises(S3, ptBiz, 'comm_office');
ptBiz.foundedYear = 2022; ptBiz.foundedMonth = 1;
ptBiz.history = [{ year: 2022, month: 7, net: 1000 }, { year: 2022, month: 8, net: 1000 }];
if (ptBiz.staff && ptBiz.staff[0]) ptBiz.staff[0].skill = 60;
const growOk = expandBusiness(S3, ptBiz);
check('e4 expandBusiness lets a rented business grow (no cap to hit)', rentPt.ok === true && growOk.ok === true, growOk.msg || rentPt.msg || '');

/* ---- B. Purge baseline: v2.18 grafted state, ONE part-time fruit stall (W4 §B) ---- */
const S1 = await baseState();
S1.money.cash = 3000000;
const res = createBusiness(S1, 'fruit_stall', 'Radwan Fruit', { mode: 'part_time' });
S1.money.cash = 607000;
const biz1 = S1.career.businesses[S1.career.businesses.length - 1];
biz1.monthsTrading = 3;
biz1.lastPL = { revenue: 32251, costs: 27353, tax: 0, net: 4898, rent: 0, wages: 18000, other: 9353, franchise: 0, remote: 0, manager: 0, reinvest: 0, harvestOut: 0, taxLabel: 'Tax' };
biz1.history = [{ year: 2025, month: 12, revenue: 32251, costs: 27353, net: 4898 }];
const vent1 = renderWorkTabHtml(S1, { activeTab: 'life', workSub: 'ventures' });
const uiState = { activeTab: 'life', propMarket: 'local', gulfTarget: 'uae' };

console.log('== (f) purge on the same 1-business grafted state ==');
console.log(`  header: ${strip((vent1.match(/<span class="muted">\d+ business[^<]*<\/span>/) || [''])[0])}`);
const w1 = computeWorkload(S1);
check('f0 header reconciles on the 1-business state too', w1.totalHours === 66 && w1.ownerHoursFree === 4 && w1.managedCount === 1 && w1.unmanagedCount === 0 && w1.uncoveredHours === 0, `workload ${w1.totalHours}, free ${w1.ownerHoursFree}, managed ${w1.managedCount}/${w1.unmanagedCount}, uncovered ${w1.uncoveredHours}`);
const n1 = countOcc(vent1, 'keeps the place running — average skill, no gain, no loss');
const n2 = countOcc(vent1, 'cold start');
const n3titles = (vent1.match(/title="[^"]*one month's wage[^"]*"/g) || []).length;
const n3total = countOcc(vent1, "one month's wage");
const n4 = countOcc(vent1, 'Staff add +0 EGP revenue, save 442 EGP, repeat customers +0%');
const n6 = countOcc(vent1, 'Level capped at 2') + countOcc(vent1, 'Level cap ');
const newDead = n1 + n2 + n3titles + n4 + n6;
console.log(`  N1=${n1} (BASE 2) N2=${n2} (BASE 25: 20 titles + 5 visible) N3titles=${n3titles} (BASE 5) N4=${n4} (BASE 1) N6=${n6} (BASE 1)`);
check('f1 N1 dead staff line 2 -> 0', n1 === 0);
check('f2 N2 "cold start" 25 -> 0', n2 === 0);
check('f3 N3 "one month\'s wage" gone from hire-button titles, rules line stays', n3titles === 0 && n3total === 1, `titles ${n3titles}, total occurrences ${n3total} (the 1 visible staff-rules line)`);
/* The N4 numbers depend on the staff the seed draws in THIS process
   order (W4's probe drew +0/442/+0%; this script's order draws
   +983/147/−0.28% — same staff-formula, different draws), so the
   check is structural, not numeric: the summary names only real,
   non-zero parts, and never prints a "0%" or "+0" part. */
const staffLineMatch = vent1.match(/<div class="muted" style="margin-bottom:6px;">(Staff [^<]*)<\/div>/);
const staffLine = staffLineMatch ? staffLineMatch[1] : '(no staff summary line)';
console.log(`  staff summary line: "${staffLine}"`);
check('f4 N4 zero-effect staff summary 1 -> 0 (only real parts named)', n4 === 0 && !/\+0 EGP| 0 EGP|repeat customers 0%|repeat customers \+0%/.test(staffLine) && /^Staff (add|save|cost)/.test(staffLine), `"${staffLine}" (BASE "Staff add +0 EGP revenue, save 442 EGP, repeat customers +0%")`);
check('f5 N6 level cap stated twice 1 -> 0 (stated once, in the pill)', n6 === 0 && countOcc(vent1, 'Level 1/2') === 1);
check('f6 NEW-registry dead text 34 -> 0', newDead === 0, `measured ${newDead} (BASE 34; W4 wrote 33, missing one visible "cold start")`);
const branchBtns1 = countRe(vent1, /data-action="biz-branch-open"/g);
const opsBranch1 = countRe(vent1, /data-action="biz-ops-branch"/g);
check('f7 branch-offer buttons 25 -> the single deduplicated set (20)', branchBtns1 === 20 && opsBranch1 === 0, `biz-branch-open ${branchBtns1} + biz-ops-branch ${opsBranch1} = ${branchBtns1 + opsBranch1} (BASE 20 + 5 = 25)`);

/* ---- disabled buttons + v2.18 registry, W4 method, all tabs ---- */
const { renderHudHtml, renderLifeTabHtml, renderEducationTabHtml, renderPeopleTabHtml, renderRealEstateTabHtml, renderFinanceTabHtml, renderLifestyleTabHtml, renderWorldTabHtml, renderBottomDockHtml } = await import('../src/ui/views.js');
const sweeps = [
  ['life', () => renderLifeTabHtml(S1)], ['education', () => renderEducationTabHtml(S1, uiState)],
  ['people-circle', () => renderPeopleTabHtml(S1, { ...uiState, peopleSub: 'circle' })],
  ['people-marriage', () => renderPeopleTabHtml(S1, { ...uiState, peopleSub: 'marriage' })],
  ['people-children', () => renderPeopleTabHtml(S1, { ...uiState, peopleSub: 'children' })],
  ['work-jobs', () => renderWorkTabHtml(S1, { ...uiState, workSub: 'jobs' })],
  ['work-ventures', () => renderWorkTabHtml(S1, { ...uiState, workSub: 'ventures' })],
  ['work-gigs', () => renderWorkTabHtml(S1, { ...uiState, workSub: 'gigs' })],
  ['re-myhome', () => renderRealEstateTabHtml(S1, { ...uiState, reSub: 'myhome' })],
  ['re-compounds', () => renderRealEstateTabHtml(S1, { ...uiState, reSub: 'compounds' })],
  ['re-lands', () => renderRealEstateTabHtml(S1, { ...uiState, reSub: 'lands' })],
  ['fin-cashflow', () => renderFinanceTabHtml(S1, { ...uiState, finSub: 'cashflow' })],
  ['fin-banks', () => renderFinanceTabHtml(S1, { ...uiState, finSub: 'banks' })],
  ['fin-cards', () => renderFinanceTabHtml(S1, { ...uiState, finSub: 'cards' })],
  ['fin-markets', () => renderFinanceTabHtml(S1, { ...uiState, finSub: 'markets' })],
  ['life-cars', () => renderLifestyleTabHtml(S1, { ...uiState, lifeSub: 'cars' })],
  ['life-appearance', () => renderLifestyleTabHtml(S1, { ...uiState, lifeSub: 'appearance' })],
  ['life-shop', () => renderLifestyleTabHtml(S1, { ...uiState, lifeSub: 'shop' })],
  ['life-pets', () => renderLifestyleTabHtml(S1, { ...uiState, lifeSub: 'pets' })],
  ['life-travel', () => renderLifestyleTabHtml(S1, { ...uiState, lifeSub: 'travel' })],
  ['life-medical', () => renderLifestyleTabHtml(S1, { ...uiState, lifeSub: 'medical' })],
  ['life-legal', () => renderLifestyleTabHtml(S1, { ...uiState, lifeSub: 'legal' })],
  ['world-passports', () => renderWorldTabHtml(S1, { ...uiState, worldSub: 'passports' })],
  ['world-gulf', () => renderWorldTabHtml(S1, { ...uiState, worldSub: 'gulf' })],
  ['world-global', () => renderWorldTabHtml(S1, { ...uiState, worldSub: 'global' })]
];
let allHtml = renderHudHtml(S1) + renderBottomDockHtml(S1);
const rendered = {};
for (const [name, fn] of sweeps) { try { rendered[name] = fn(); allHtml += rendered[name]; } catch (e) { console.log(`RENDER ERROR ${name}: ${e.message}`); } }
const LABEL_REASON = /needs|you scored|not taught|degree held|tracks open|launches in|need \d+ more|more point|✓|already|holds |paid|completed|in wallet|in use|starts at|school years over|answer open decision|visa-free|stamped|tutor hired|built|wing added|fulfilled|below .*threshold|not eligible/i;
function countDisabled(html) {
  const btnRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let total = 0, without = 0; const list = []; let m;
  while ((m = btnRe.exec(html)) !== null) {
    const attrs = m[1], label = strip(m[2]);
    if (!/\bdisabled\b/.test(attrs)) continue;
    total++;
    const start = m.index, end = btnRe.lastIndex;
    const after = html.slice(end, end + 500);
    const before = html.slice(Math.max(0, start - 500), start);
    const ok = /<span class="lock-reason">/.test(after) || /<span class="lock-reason">/.test(before) || LABEL_REASON.test(label);
    if (!ok) { without++; if (list.length < 10) list.push(`${(attrs.match(/data-action="([^"]+)"/) || [])[1] || '(no action)'} :: "${label}"`); }
  }
  return { total, without, list };
}
const dis = countDisabled(allHtml);
console.log(`  disabled total=${dis.total} without-reason=${dis.without} ${JSON.stringify(dis.list)}`);
check('f8 disabled WITHOUT reason stays 0 (total 182, must not regress)', dis.without === 0 && dis.total === 182, `total ${dis.total} without ${dis.without} (BASE total 182, without 0)`);
const bizReg = [
  ['B1', 'Profit is unknown until the first month settles. The first profit-and-loss lands at the end of this month.', 0],
  ['B2', 'Full-time adds ~40 hrs/week to your job', 1],
  ['B3', 'Needs a manager: ~20,000 EGP/month. You have 4h/week free', 1],
  ['B4', 'Every venture, every lock reason shown', 0],
  ['B6', "hiring costs one month's wage.", 0],
  ['B7a', "Training costs half a month's wage and adds +8 skill.", 0],
  ['B7b', "Promoting needs skill 60 and raises the wage to the new role's pay.", 0],
  ['B8', 'the rent shown is the rent charged every month', 0],
  ['B9', '(now level ', 0],
  ['B10', 'Credit score 650 is below the 700 this loan requires', 1],
  ['B11', 'Last 1 months:', 0],
  ['B12', "The effect lands in next month's profit and loss.", 0],
  ['B13a', "The money leaves your cash now; the extra revenue lands in next month's profit and loss.", 0],
  ['B13b', 'Spending twice on the same channel in one month is worth less the second time.', 0],
  ['B13c', 'First spend on this channel this month — a second spend is worth half as much.', 0],
  ['B14a', '(free to set)', 0],
  ['B14b', 'high prices earn more per sale but lose customers, low prices keep them', 0],
  ['B15a', 'Cheap — but 3 deliveries in 10 never arrive.', 0],
  ['B15b', 'Costs more, delivers 98 times in 100.', 0],
  ['B16', 'rota: overtime costs extra pay and tires people out, a day off costs a little revenue and rests them', 0],
  ['B17a', '— cold start)', 0],
  ['B17b', 'A branch in a city where you have no presence costs 1.5x to set up and earns less at first.', 0],
  ['B18', 'A good name keeps paying — a bad month costs it.', 0],
  ['B19', 'Selling at valuation and closing for salvage work as before.', 0],
  ['B20', '(0.7× capital + 2.8× annual net profit)', 1],
  ['B21', "Without it you buy blind — the seller's numbers may hide debts, bad staff or a lease about to end.", 0],
  ['B22a', '<strong>Open a branch in ', 0],
  /* v2.20 merge — B22b allowed 1, not 0: the one occurrence is I2's
     LIVE fruit-stall decision "Move to a better corner" (cost + effect
     shown, a real decision). A second "Move to" would still flag. */
  ['B22b', '<strong>Move to ', 1],
  ['B23a', '(taxed)', 1],
  ['B23b', "of your own cash (lifts next month's revenue)", 0]
];
let bizDead = 0;
for (const [id, sub, allowed] of bizReg) {
  const occ = countOcc(rendered['work-ventures'], sub);
  bizDead += Math.max(0, occ - allowed);
}
check('f9 v2.18-registry dead text stays 0', bizDead === 0, `dead=${bizDead} (BASE 0)`);

console.log(`\nRESULT: ${pass} PASS, ${fail} FAIL`);
process.exit(fail ? 1 : 0);
