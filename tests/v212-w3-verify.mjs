/* v2.12 Worker 3 verify — Disabled buttons state their reason inline.
   Run from the game root: node tests/v212-w3-verify.mjs
   Method (same as the overnight audit): render all screens for an employed
   adult, married, 30, 2 children, Egypt, cash ~607k, and count disabled
   buttons. A disabled button counts as WITH a visible inline reason when:
     (a) a <span class="lock-reason"> sits right next to it (the v2.12 helper), or
     (b) its own label already states why + what would unlock it
         (e.g. "needs 93% · you scored 82%", "Tracks open at 12–17",
         "✓ Holds MSc/MBA", "✓ In Wallet", "Answer Open Decision Above First"), or
     (c) the same item-row already carries a visible lock pill naming the
         reason (e.g. the Zakat row's "Below Nisab Threshold" line).
   Regions owned by other v2.12 workers are counted separately and excluded
   from the pass/fail count: Compounds/Lands listing rows, the Marriage tab
   prospect buttons, and the Circle/Shop/Appearance/Travel/Children/Cards/
   Pets screens' primary action buttons. */
import { createNewLifeState, createPerson, ensureExtendedState } from '../src/core/schema.js';
import { listAvailableJobs } from '../src/systems/careerEducationEngine.js';
import {
  renderHudHtml, renderLifeTabHtml, renderEducationTabHtml, renderPeopleTabHtml,
  renderWorkTabHtml, renderRealEstateTabHtml, renderFinanceTabHtml,
  renderLifestyleTabHtml, renderWorldTabHtml, renderBottomDockHtml
} from '../src/ui/views.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* Audit baseline (OVERNIGHT-AUDIT.md §2): 206 disabled buttons for an
   employed adult, no reason shown. */
const AUDIT_OLD_WITHOUT_REASON = 206;

function buildMarriedAdult30() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm', ambition: 'family' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 30;
  S.money.cash = 607000; S.money.savings = 50000; S.money.creditScore = 650;
  S.education.stage = 'graduated_high';
  S.education.highSchoolScore = 82;
  S.education.degrees = ['engineering'];
  S.education.schoolId = null;
  // Employed: take a real job listing so payslip/contract/ladder render.
  const jobs = listAvailableJobs(S);
  const j = jobs.find(x => x.title && x.employer) || jobs[0];
  S.career.employed = true;
  S.career.yearsExperience = 5;
  S.career.job = {
    title: j.title, employer: j.employer, trackId: j.trackId,
    monthlyGross: (j.pay && j.pay.gross) || 45000, workMode: 'full_time',
    monthsInRole: 12, startYear: 2025, performance: 70, bossId: null
  };
  // Married + 2 children.
  const spouse = createPerson(S, { age: 29, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id];
  S.marriage.status = 'married';
  for (const age of [8, 5]) {
    const ch = createPerson(S, { age, gender: age === 8 ? 'm' : 'f', role: 'child', relationLabel: age === 8 ? 'Son' : 'Daughter' });
    ch.residenceCountry = 'egy'; ch.city = 'Cairo';
    S.people[ch.id] = ch; S.relations.childIds.push(ch.id);
  }
  return S;
}

const SWEEPS = [
  ['life', (S, u) => renderLifeTabHtml(S)],
  ['education', (S, u) => renderEducationTabHtml(S, u)],
  ['people-circle', (S, u) => renderPeopleTabHtml(S, { ...u, peopleSub: 'circle' })],
  ['people-marriage', (S, u) => renderPeopleTabHtml(S, { ...u, peopleSub: 'marriage' })],
  ['people-children', (S, u) => renderPeopleTabHtml(S, { ...u, peopleSub: 'children' })],
  ['work-jobs', (S, u) => renderWorkTabHtml(S, { ...u, workSub: 'jobs' })],
  ['work-ventures', (S, u) => renderWorkTabHtml(S, { ...u, workSub: 'ventures' })],
  ['work-gigs', (S, u) => renderWorkTabHtml(S, { ...u, workSub: 'gigs' })],
  ['re-myhome', (S, u) => renderRealEstateTabHtml(S, { ...u, reSub: 'myhome' })],
  ['re-compounds', (S, u) => renderRealEstateTabHtml(S, { ...u, reSub: 'compounds' })],
  ['re-lands', (S, u) => renderRealEstateTabHtml(S, { ...u, reSub: 'lands' })],
  ['fin-cashflow', (S, u) => renderFinanceTabHtml(S, { ...u, finSub: 'cashflow' })],
  ['fin-banks', (S, u) => renderFinanceTabHtml(S, { ...u, finSub: 'banks' })],
  ['fin-cards', (S, u) => renderFinanceTabHtml(S, { ...u, finSub: 'cards' })],
  ['fin-markets', (S, u) => renderFinanceTabHtml(S, { ...u, finSub: 'markets' })],
  ['life-cars', (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'cars' })],
  ['life-appearance', (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'appearance' })],
  ['life-shop', (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'shop' })],
  ['life-pets', (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'pets' })],
  ['life-travel', (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'travel' })],
  ['life-medical', (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'medical' })],
  ['life-legal', (S, u) => renderLifestyleTabHtml(S, { ...u, lifeSub: 'legal' })],
  ['world-passports', (S, u) => renderWorldTabHtml(S, { ...u, worldSub: 'passports' })],
  ['world-gulf', (S, u) => renderWorldTabHtml(S, { ...u, worldSub: 'gulf' })],
  ['world-global', (S, u) => renderWorldTabHtml(S, { ...u, worldSub: 'global' })]
];

const S = buildMarriedAdult30();
const uiState = { activeTab: 'life', propMarket: 'local', gulfTarget: 'uae' };
let html = renderHudHtml(S) + renderBottomDockHtml(S);
for (const [name, fn] of SWEEPS) {
  try { html += fn(S, uiState); }
  catch (e) { console.log(`RENDER ERROR ${name}: ${e.message}`); fail++; }
}

/* Disabled buttons owned by other v2.12 workers (skip regions). */
const SKIP_ACTIONS = new Set([
  'buy-compound-unit', 'buy-land',          // Worker 1: Compounds / Lands rows
  'meet-partner',                            // Worker 5: Marriage prospect buttons
  'npc-interact', 'buy-shop-item', 'edit-appearance', 'take-trip',
  'child-program', 'open-card', 'adopt-pet'  // Worker 6: Circle/Shop/Appearance/Travel/Children/Cards/Pets primary actions
]);
/* A button's own label already states why + what unlocks it. */
const LABEL_REASON = /needs|you scored|not taught|degree held|tracks open|launches in|need \d+ more|more point|✓|already|holds |paid|completed|in wallet|in use|starts at|school years over|answer open decision|visa-free|stamped|tutor hired|built|wing added|fulfilled|below .*threshold|not eligible/i;

function countDisabled(html) {
  const btnRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  const r = { total: 0, withReason: 0, without: 0, skipped: 0, skippedWithout: 0, withoutList: [], byAction: {}, buySample: [] };
  let m;
  while ((m = btnRe.exec(html)) !== null) {
    const attrs = m[1], label = strip(m[2]);
    if (!/\bdisabled\b/.test(attrs)) continue;
    r.total++;
    const action = (attrs.match(/data-action="([^"]+)"/) || [])[1] || '(no action)';
    const start = m.index, end = btnRe.lastIndex;
    const after = html.slice(end, end + 500);
    const before = html.slice(Math.max(0, start - 500), start);
    const hasLockSpan = /<span class="lock-reason">/.test(after) || /<span class="lock-reason">/.test(before);
    const labelStatesReason = LABEL_REASON.test(label);
    const ok = hasLockSpan || labelStatesReason;
    const isSkipped = SKIP_ACTIONS.has(action);
    r.byAction[action] = r.byAction[action] || { total: 0, with: 0, without: 0, skipped: 0 };
    r.byAction[action].total++;
    if (isSkipped) {
      r.skipped++; r.byAction[action].skipped++;
      if (!ok) r.skippedWithout++;
    } else if (ok) {
      r.withReason++; r.byAction[action].with++;
    } else {
      r.without++; r.byAction[action].without++;
      if (r.withoutList.length < 25) r.withoutList.push(`${action} :: "${label}"`);
    }
    if (/^buy-/.test(action) && !isSkipped && r.buySample.length < 12) {
      r.buySample.push({ action, label, ok, reason: (after.match(/<span class="lock-reason">([\s\S]*?)<\/span>/) || [])[1] || (labelStatesReason ? '(in label) ' + label : '') });
    }
  }
  return r;
}

function renderAll(S, u) {
  let h = renderHudHtml(S) + renderBottomDockHtml(S);
  for (const [name, fn] of SWEEPS) {
    try { h += fn(S, u); }
    catch (e) { console.log(`RENDER ERROR ${name}: ${e.message}`); fail++; }
  }
  return h;
}

function reportCounts(title, r) {
  console.log(`--- ${title} ---`);
  console.log(`total disabled buttons: ${r.total}`);
  console.log(`with visible inline reason (owned regions): ${r.withReason}`);
  console.log(`WITHOUT visible reason (owned regions): ${r.without}`);
  console.log(`skipped regions (other workers): ${r.skipped} disabled, ${r.skippedWithout} of them without a reason`);
  if (r.withoutList.length) console.log('without reason (owned, first 25):', JSON.stringify(r.withoutList, null, 1));
  console.log('--- per-action breakdown (total / with reason / without / skipped) ---');
  for (const [a, c] of Object.entries(r.byAction).sort((x, y) => y[1].without - x[1].without)) {
    console.log(`  ${a}: ${c.total} / ${c.with} / ${c.without} / ${c.skipped}`);
  }
  return r;
}

const main = reportCounts('disabled-button counts (married adult 30, 2 children, Egypt, cash 607k)', countDisabled(html));
console.log(`audit baseline without reason: ${AUDIT_OLD_WITHOUT_REASON} -> now (all regions): ${main.without + main.skippedWithout}`);
console.log('--- Buy-button sample ---');
for (const b of main.buySample) console.log(`  ${b.ok ? 'WITH-REASON' : 'NO-REASON'} ${b.action} "${b.label}" reason: ${strip(b.reason || '')}`);
const buyWith = main.buySample.filter(b => b.ok).length;
console.log(`Buy buttons in sample with a reason: ${buyWith}/${main.buySample.length}`);

check('no disabled button without a visible reason in owned regions', main.without === 0, `got ${main.without}`);
check('at least 5 Buy buttons state their reason + what would unlock them', buyWith >= 5, `got ${buyWith}`);

/* §3 — probe states that exercise the OTHER disabled branches (age gates,
   year gates, empty savings, 3 loans + bankruptcy, illness + no cash, Gulf
   resident, pre-2024, already-enrolled). Same count, must also be 0 without. */
{
  const P = buildMarriedAdult30();
  P.player.age = 16; P.year = 2010; P.month = 1;
  P.money.cash = 50; P.money.savings = 0; P.money.creditScore = 400;
  P.money.loans = [1, 2, 3].map(i => ({ label: `Loan ${i}`, balance: 1000, monthlyPayment: 100, remainingMonths: 12 }));
  P.money.bankruptUntilYear = 2030; P.money.goldGrams21k = 0;
  P.education.stage = 'high'; P.education.degrees = []; P.education.highSchoolScore = null;
  P.education.university = { name: 'Cairo University', majorLabel: 'Medicine' };
  P.career.employed = false; P.career.job = null;
  P.country = 'uae'; P.homeCountry = 'egy';
  P.medical.conditions = [{ id: 'heart_disease', label: 'Heart Disease', sinceYear: 2009, stage: 1, treatmentStatus: 'untreated', managed: false }];
  const probe = reportCounts('probe state (age 16, year 2010, UAE resident, cash 50, savings 0, 3 loans, bankrupt to 2030, enrolled, heart disease)', countDisabled(renderAll(P, { activeTab: 'life', propMarket: 'local', gulfTarget: 'uae' })));
  check('probe state: no disabled button without a visible reason in owned regions', probe.without === 0, `got ${probe.without}: ${JSON.stringify(probe.withoutList)}`);
  const P2 = buildMarriedAdult30();
  P2.player.age = 30; P2.year = 2026; P2.money.cash = 10; P2.money.savings = 0;
  P2.syndicate = { registered: true, name: 'Doctors Syndicate' };
  P2.postgrad = { completed: [{ tier: 'masters_mba' }, { tier: 'fellowship_phd' }] };
  P2.education.privateTutoring = true;
  const probe2 = reportCounts('probe state 2 (age 30, cash 10, syndicate + postgrad done, tutor hired)', countDisabled(renderAll(P2, uiState)));
  check('probe state 2: no disabled button without a visible reason in owned regions', probe2.without === 0, `got ${probe2.without}: ${JSON.stringify(probe2.withoutList)}`);
  const P3 = buildMarriedAdult30();
  P3.money.loans = [1, 2, 3].map(i => ({ label: `Loan ${i}`, balance: 1000, monthlyPayment: 100, remainingMonths: 12 }));
  P3.money.bankruptUntilYear = 2030;
  const probe3 = countDisabled(renderFinanceTabHtml(P3, { ...uiState, finSub: 'banks' }));
  console.log(`probe state 3 (3 loans, bankrupt to 2030): take-loan total ${probe3.byAction['take-loan']?.total || 0}, without reason ${probe3.byAction['take-loan']?.without || 0}`);
  check('probe state 3: take-loan buttons state their reason', (probe3.byAction['take-loan']?.total || 0) === 3 && (probe3.byAction['take-loan']?.without || 0) === 0, JSON.stringify(probe3.byAction['take-loan']));
}

/* §2 — helper unit checks (imported live). */
try {
  const { lockReason } = await import('../src/ui/lockReason.js');
  {
    const h = lockReason('Not enough cash', 'Need 12,000 EGP more');
    check('lockReason renders a visible inline span', /<span class="lock-reason">/.test(h) && /Not enough cash/.test(h) && /12,000 EGP more/.test(h), h);
    check('lockReason escapes HTML in its inputs', !/<script/.test(lockReason('<script>', '<b>')), '');
    check('lockReason with no inputs renders nothing', lockReason('', '') === '', JSON.stringify(lockReason('', '')));
    const views = await import('../src/ui/views.js');
    check('views.js re-exports lockReason for other workers', typeof views.lockReason === 'function', '');
  }
} catch (e) {
  check('lockReason helper exists and is importable', false, e.message);
}

console.log(`\nTOTAL ${pass} PASS, ${fail} FAIL`);
if (fail) process.exit(1);
