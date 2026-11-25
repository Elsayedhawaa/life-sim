/* v2.18 Worker 3 verify — readability purge (§4) + named warts (§5).
   Run from the game root: node tests/v218-w3-verify.mjs
   Grafted state (same for before/after): the v2.12 audit persona — employed
   married adult, 30, 2 children, Egypt, cash 607,000 — plus one real settled
   business launched through createBusiness (cash topped up for the launch
   only, then restored to 607,000) and a real job (track + level set, as every
   real job-creation path sets them). */
import { readFileSync } from 'node:fs';
import { createNewLifeState, createPerson, ensureExtendedState, computeNetWorthLocal } from '../src/core/schema.js';
import { listAvailableJobs } from '../src/systems/careerEducationEngine.js';
import { createBusiness } from '../src/systems/businessEngine.js';
import { tickFriendshipDrift } from '../src/systems/socialEnergy.js';
import { advanceSingleTurn } from '../src/core/gameLoop.js';
import { recordFinanceHistorySnapshot } from '../src/ui/views.js';
import {
  renderHudHtml, renderLifeTabHtml, renderEducationTabHtml, renderPeopleTabHtml,
  renderWorkTabHtml, renderRealEstateTabHtml, renderFinanceTabHtml,
  renderLifestyleTabHtml, renderWorldTabHtml, renderBottomDockHtml
} from '../src/ui/views.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const countOcc = (html, sub) => String(html).split(sub).length - 1;
const countRe = (html, re) => (String(html).match(re) || []).length;

/* ================= grafted state (shared by every count) ================= */
export async function buildGraftedState() {
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
  S.money.cash = 3000000; // topped up for the launch only
  const res = createBusiness(S, 'restaurant', 'Salem Table', { mode: 'part_time' });
  S.money.cash = 607000; // restored: every other tab counts like the v2.12 audit
  if (!res.ok) console.log('BUSINESS LAUNCH FAILED:', res.msg);
  else {
    const biz = S.career.businesses[S.career.businesses.length - 1];
    biz.monthsTrading = 3;
    biz.lastPL = { revenue: 108427, costs: 128803, tax: 0, net: -20376, rent: 20000, wages: 60000, other: 48803, franchise: 0, remote: 0, manager: 0, reinvest: 0, harvestOut: 0, taxLabel: 'Tax' };
    biz.history = [{ year: 2025, month: 12, revenue: 108427, costs: 128803, net: -20376 }];
  }
  return S;
}

/* ================= §4a disabled buttons (v2.12 method) ================= */
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
console.log('--- §4a disabled buttons without a visible reason (v2.12 method, same grafted state) ---');
let allHtml = renderHudHtml(S) + renderBottomDockHtml(S);
for (const [name, fn] of sweeps) {
  try { allHtml += fn(); } catch (e) { console.log(`RENDER ERROR ${name}: ${e.message}`); fail++; }
}
const dis = countDisabled(allHtml);
console.log(`disabled total: ${dis.total} | without a visible reason: ${dis.without} (before: 5)`);
if (dis.withoutList.length) console.log('without reason:', JSON.stringify(dis.withoutList));
check('disabled buttons without a visible reason: 5 -> 0', dis.without === 0, `got ${dis.without}`);

/* ================= §4b dead text: business + education (W3 cuts) ================= */
console.log('--- §4b dead text (business tab + education tab: W3 regions) ---');
const ventHtml = renderWorkTabHtml(S, { ...uiState, workSub: 'ventures' });
const eduHtml = renderEducationTabHtml(S, uiState);
// Each entry: [id, occurrences, allowed-after]. Dead = occurrences - allowed.
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
  ['B22b ops move row title repeats its button', countOcc(ventHtml, '<strong>Move to '), 1], /* v2.20: the 1 is I2's live decision "Move to a better corner" */
  ['B23a cash "(taxed)" on label AND button', countOcc(ventHtml, '(taxed)'), 1],
  ['B23b cash reinvest label repeats the header rule', countOcc(ventHtml, "of your own cash (lifts next month's revenue)"), 0]
];
let bizDead = 0, bizBefore = 222;
for (const [id, occ, allowed] of bizReg) {
  const dead = Math.max(0, occ - allowed);
  bizDead += dead;
  console.log(`  ${id}: occ=${occ} allowed=${allowed} dead=${dead}`);
}
console.log(`business dead text: ${bizDead} (before: ${bizBefore})`);
check('business dead text 222 -> 0', bizDead === 0, `got ${bizDead}`);
const eduReg = [
  ['E1 "If you cannot afford it" on every university row', countOcc(eduHtml, 'If you cannot afford it:'), 0],
  ['E2a track card "Switching to this track means"', countOcc(eduHtml, 'Switching to this track means changing school'), 0],
  ['E2b track card "You would lose your current track"', countOcc(eduHtml, "You would lose your current track and start the new system's exams from scratch."), 0]
];
let eduDead = 0;
for (const [id, occ, allowed] of eduReg) {
  const dead = Math.max(0, occ - allowed);
  eduDead += dead;
  console.log(`  ${id}: occ=${occ} allowed=${allowed} dead=${dead}`);
}
console.log(`education dead text: ${eduDead} (before: 17)`);
check('education dead text 17 -> 0', eduDead === 0, `got ${eduDead}`);

/* ================= §4b career tab: CUT AT MERGE (was counted only) ============
   v2.18 MERGE — the coordinator cut all 154 on the merged tree after
   recounting (W2's desk had already removed C5, the severance/warnings
   double, taking it to 153; the merge cut the remaining 153):
   C1 subheading line removed (section head already shows title+employer);
   C2 pension note printed once (in-body duplicate removed, optOutLine kept);
   C3 boss lever empty when no boss (value line already says so);
   C4 take-leave cross-ref clause removed (contract line already points
   at the Take Leave buttons); C6a/b/c country-standard benefits moved
   to one header above the market (pension stays per listing, its
   amounts vary; annual leave prints per listing only above the
   standard); C7 filler clause removed from the pension line;
   C8 "Day-to-day ..." fallback removed (no duty text prints nothing).
   The registry below now asserts the after-count is 0. */
console.log('--- §4b career tab (cut at merge — was counted only, now 0) ---');
const jobsHtml = renderWorkTabHtml(S, { ...uiState, workSub: 'jobs' });
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
for (const [id, occ, allowed] of carReg) {
  const dead = Math.max(0, occ - allowed);
  carDead += dead;
  console.log(`  ${id}: occ=${occ} allowed=${allowed} dead=${dead}`);
}
console.log(`career dead text (cut at merge): ${carDead} (before: 154 — must be 0 now)`);
check('career dead text 154 -> 0', carDead === 0, `got ${carDead}`);

/* ================= §5a childhood social-energy jump ================= */
console.log('--- §5a childhood drift: warning must come a full turn before the notice ---');
function childState() {
  const C = createNewLifeState({ seed: 99, country: 'egy', birthYear: 2016, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(C);
  C.year = 2026; C.month = 9; C.player.age = 10; C.pacing = 'yearly';
  const f = createPerson(C, { age: 10, gender: 'm', role: 'friend', relationLabel: 'Friend' });
  C.people[f.id] = f; C.relations.friendIds = [f.id];
  f.rel.lastContactTurn = C.turn; f.rel.lastContactUnknown = false; f.rel.driftState = 'none';
  return { C, f };
}
{
  const { C, f } = childState();
  C.turn += 1; C.year += 1; // one yearly turn passes: 12 months of silence
  const driftKey = `drift_${f.id}_`;
  const hasNotice = (st) => (st.activeScene && String(st.activeScene.key || '').startsWith(driftKey))
    || st.sceneQueue.some(s => s.key && String(s.key).startsWith(driftKey));
  const r1 = tickFriendshipDrift(C);
  const warnedFirst = f.rel.driftState === 'drifting' && r1.warned === 1 && r1.noticed === 0;
  const noNoticeScene = !hasNotice(C);
  const warnJournalled = C.journal.some(j => typeof j.text === 'string' && j.text.includes(f.fullName) && /drifting apart/.test(j.text));
  console.log(`after 1 yearly tick (12 months silent): state=${f.rel.driftState} warned=${r1.warned} noticed=${r1.noticed} noticeScene=${!noNoticeScene} warnJournalled=${warnJournalled}`);
  check('year 1 of silence: warning only, no notice scene', warnedFirst && noNoticeScene && warnJournalled, `state=${f.rel.driftState} warned=${r1.warned} noticed=${r1.noticed}`);
  C.turn += 1; C.year += 1; // a second yearly turn: 24 months of silence
  const r2 = tickFriendshipDrift(C);
  const noticedSecond = f.rel.driftState === 'noticed' && r2.noticed === 1;
  const noticeScene = hasNotice(C);
  console.log(`after 2nd yearly tick (24 months silent): state=${f.rel.driftState} noticed=${r2.noticed} noticeScene=${noticeScene}`);
  /* (replacement) Under 18 the notice scene is deliberately never queued (socialEnergy.queueDriftNoticeScene: childhood is already yearly pacing; drift stays visible on the People tab). So a child stays 'drifting' with no scene, and the warning-then-notice sequence is asserted for an adult below. */
  check('year 2 of silence, child: still drifting (visible on People), no notice scene is forced on a child', f.rel.driftState === 'drifting' && r2.noticed === 0 && !noticeScene, `state=${f.rel.driftState} noticed=${r2.noticed} scene=${noticeScene}`);
}
{ /* monthly pacing is unchanged: warn at 6, notice at 12 */
  const A = createNewLifeState({ seed: 99, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(A);
  A.year = 2026; A.month = 1; A.player.age = 30; A.pacing = 'monthly';
  const f = createPerson(A, { age: 30, gender: 'm', role: 'friend', relationLabel: 'Friend' });
  A.people[f.id] = f; A.relations.friendIds = [f.id];
  f.rel.lastContactTurn = A.turn; f.rel.lastContactUnknown = false; f.rel.driftState = 'none';
  /* monthsSinceContact now reads the recorded calendar month of the last contact, so the calendar must move with the turns. */
  A.turn += 6; A.month += 6;
  const r6 = tickFriendshipDrift(A);
  const warn6 = f.rel.driftState === 'drifting' && r6.warned === 1 && r6.noticed === 0;
  A.turn += 6; A.year += 1; A.month -= 6;
  const r12 = tickFriendshipDrift(A);
  const note12 = f.rel.driftState === 'noticed' && r12.noticed === 1;
  console.log(`monthly: 6mo state=${warn6 ? 'drifting' : f.rel.driftState}, 12mo noticed=${note12}`);
  check('monthly pacing unchanged (warn 6, notice 12)', warn6 && note12, `warn6=${warn6} note12=${note12}`);
}
{ /* integration: a real yearly advance never jumps 0 -> notice in one turn */
  const { C, f } = childState();
  C.sceneQueue = [];
  advanceSingleTurn(C);
  const jumped = f.rel.driftState === 'noticed';
  console.log(`after one real yearly advance: driftState=${f.rel.driftState} (must not be 'noticed')`);
  check('one yearly advance never jumps straight to a notice', !jumped, `state=${f.rel.driftState}`);
}

/* ================= §5b remittance backfill: verdict =================
   No safe backfill exists. Proof by construction (see report): a naive sum
   over the old ledger lines counts money a Hawala broker stole (the wallet
   move is written BEFORE the scam check, so the line is indistinguishable
   from a delivered remittance), mixes the Saudi dependent levy into the
   monthly "family support" line, and the ledger itself is capped at 400
   lines so old sends are gone entirely. */
console.log('--- §5b remittance backfill verdict ---');
{
  const R = createNewLifeState({ seed: 5, country: 'sau', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(R);
  R.year = 2026; R.month = 1; R.player.age = 30;
  // True history: 100,000 EGP delivered once; 180,000 EGP monthly support
  // (30,000 x 6); a 400,000 EGP Hawala send the broker stole (true: 0);
  // 120,000 EGP Saudi levy (20,000 x 6) — a government fee, not sent home.
  // True total sent home: 280,000 EGP. A naive ledger sum says 800,000.
  R.ledger = [
    { year: 2025, month: 12, label: 'Remittance via Hawala', category: 'family', account: 'cash', delta: -400000, balanceAfter: 0 },
    { year: 2025, month: 11, label: 'Remittance via Western Union', category: 'family', account: 'cash', delta: -100000, balanceAfter: 0 },
    ...[10, 9, 8, 7, 6, 5].map(m => ({ year: 2025, month: m, label: `Monthly family support (${m}/2025)`, category: 'monthly_settlement', account: 'cash', delta: -50000, balanceAfter: 0 }))
  ];
  const naive = R.ledger.filter(e => /Remittance via/.test(e.label) || /Monthly family support/.test(e.label))
    .reduce((s, e) => s + Math.abs(Number(e.delta) || 0), 0);
  const TRUE_SENT = 280000;
  console.log(`naive ledger sum=${naive} | true sent home=${TRUE_SENT} | overstates by ${naive - TRUE_SENT}`);
  check('naive ledger backfill overstates the truth (400k scam + 120k levy counted)', naive !== TRUE_SENT && naive - TRUE_SENT === 520000, `naive=${naive}`);
  // The ledger is capped at 400 lines: an old life has already lost its sends.
  for (let i = 0; i < 401; i++) R.ledger.unshift({ year: 2020, month: 1, label: 'Filler', category: 'general', account: 'cash', delta: -1, balanceAfter: 0 });
  const { recordLedgerEntry } = await import('../src/core/schema.js');
  recordLedgerEntry(R, -5, 'Filler', 'general', 'cash', 0);
  console.log(`ledger length after 400+ lines: ${R.ledger.length} (cap 400 — old sends are gone)`);
  check('ledger cap 400 drops old lines (no complete history to backfill from)', R.ledger.length === 400, `len=${R.ledger.length}`);
  // Only the two live send paths write the total — no backfill code exists.
  const src = readFileSync(new URL('../src/core/schema.js', import.meta.url), 'utf8');
  const writers = (readFileSync(new URL('../src/systems/completeLifeSystems.js', import.meta.url), 'utf8').match(/remittedHomeEgpTotal\s*=[^=]/g) || []).length
    + (readFileSync(new URL('../src/systems/economyEngine.js', import.meta.url), 'utf8').match(/remittedHomeEgpTotal\s*=[^=]/g) || []).length;
  console.log(`live writers of remittedHomeEgpTotal: ${writers} (the two send paths only)`);
  check('no backfill writer exists (2 live send paths only)', writers === 2, `writers=${writers}`);
  check('remittedHomeEgpTotal left at 0 for the old life (no unsafe backfill applied)', Number(R.money.remittedHomeEgpTotal) === 0, `got ${R.money.remittedHomeEgpTotal}`);
}

/* ================= §5c net-worth snapshot from the yearly advance ================= */
console.log('--- §5c net-worth snapshot recorded by the advance, once per year ---');
{
  const A = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(A);
  A.year = 2026; A.month = 12; A.player.age = 30; A.pacing = 'monthly';
  A.money.cash = 100000; A.financeHistory = [];
  const before = A.financeHistory.length;
  const step = () => { A.activeScene = null; A.sceneQueue = []; advanceSingleTurn(A); };
  step(); // Dec -> Jan: crosses a year, no render call made
  const jan = A.financeHistory.filter(h => h.year === 2027);
  console.log(`after Dec->Jan advance (no render): snapshots=${A.financeHistory.length} for 2027=${jan.length} value=${jan[0] ? jan[0].netWorth : 'none'} liveNW=${computeNetWorthLocal(A)}`);
  check('year-crossing advance records exactly one snapshot, no render needed', A.financeHistory.length === before + 1 && jan.length === 1, `len=${A.financeHistory.length}`);
  check('snapshot value is the same net-worth number Finance reads', jan[0] && jan[0].netWorth === computeNetWorthLocal(A), `snap=${jan[0] && jan[0].netWorth} live=${computeNetWorthLocal(A)}`);
  for (let i = 0; i < 11; i++) step(); // Jan..Nov 2027: no new year
  const stillOne = A.financeHistory.filter(h => h.year === 2027).length;
  check('eleven more months add no second 2027 snapshot', stillOne === 1, `count=${stillOne}`);
  A.month = 12; // force Dec, then cross into 2028
  step();
  const y28 = A.financeHistory.filter(h => h.year === 2028).length;
  check('next year-crossing adds exactly one 2028 snapshot', y28 === 1 && A.financeHistory.length === 2, `y28=${y28} total=${A.financeHistory.length}`);
  // A render after the advance must not duplicate it.
  renderFinanceTabHtml(A, { finSub: 'cashflow' });
  const afterRender = A.financeHistory.filter(h => h.year === 2028).length;
  check('rendering Finance afterwards adds no duplicate', afterRender === 1, `count=${afterRender}`);
  // Childhood yearly advance records too.
  const K = createNewLifeState({ seed: 7, country: 'egy', birthYear: 2016, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(K);
  K.year = 2026; K.month = 9; K.player.age = 10; K.pacing = 'yearly'; K.financeHistory = [];
  advanceSingleTurn(K);
  check('yearly childhood advance records one snapshot', K.financeHistory.length === 1 && K.financeHistory[0].year === 2027, `len=${K.financeHistory.length}`);
}

/* ================= §5d index.html title ================= */
console.log('--- §5d index.html title ---');
{
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const m = html.match(/<title>([^<]*)<\/title>/);
  console.log('title:', m ? m[1] : '(none)');
  check('index.html title says 2.20', !!m && m[1].includes('2.20') && !m[1].includes('2.5'), m ? m[1] : 'none');
}

console.log(`\n==== v218-w3-verify: ${pass} PASS, ${fail} FAIL ====`);
process.exit(fail ? 1 : 0);
