/* v2.12 coordinator verify — Dead-Text Purge & Action Density.
   Run from the game root: node tests/v212-verify.mjs
   Independent headline counts (the worker scripts prove their own items in
   depth; this script re-counts the spec's verification list on the MERGED
   tree with the audit's methods). The three shipped tests are NOT run by
   this harness — run them separately. */
import { readFileSync } from 'node:fs';
import { createNewLifeState, createPerson, ensureExtendedState } from '../src/core/schema.js';
import {
  renderLifeTabHtml, renderPeopleTabHtml, renderEducationTabHtml,
  renderWorkTabHtml, renderRealEstateTabHtml, renderFinanceTabHtml,
  renderLifestyleTabHtml, renderWorldTabHtml, renderHudHtml, renderBottomDockHtml
} from '../src/ui/views.js';
import { additionalSpousePath } from '../src/systems/marriageFamilyEngine.js';
import { getMarriageProfile } from '../src/data/visasAndMarriage.js';
import { staffLoanTerms, staffTreatmentEligible } from '../src/systems/careerEducationEngine.js';
import { treatmentCostLocal } from '../src/systems/mortalityModel.js';
import { ALL_RANDOM_LIFE_EVENTS } from '../src/systems/eventEngine.js';
import { countVentureRows } from '../src/systems/businessEngine.js';
import { BUSINESS_EVENTS } from '../src/data/eventsBusiness.js';
import '../src/main.js';

let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/* Audit persona: ordinary employed married adult, 30, 2 children, Egypt, cash 607,000. */
function auditPersona() {
  const S = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 30;
  S.money.cash = 607000; S.money.savings = 0;
  S.career.employed = true;
  S.career.job = { monthlyGross: 32000, employer: 'Nile Care Hospital', title: 'Accountant' };
  const spouse = createPerson(S, { age: 30, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id];
  for (const [age, g] of [[6, 'f'], [4, 'm']]) {
    const ch = createPerson(S, { age, gender: g, role: 'child', relationLabel: g === 'f' ? 'Daughter' : 'Son' });
    S.people[ch.id] = ch; S.relations.childIds.push(ch.id);
  }
  return S;
}

/* ================= §0 counts (unchanged content) ================= */
console.log('--- §0 counts ---');
console.log('event pool:', ALL_RANDOM_LIFE_EVENTS.length, '| venture rows:', countVentureRows(), '| business events:', BUSINESS_EVENTS.length);
check('event pool still 574', ALL_RANDOM_LIFE_EVENTS.length === 574, `got ${ALL_RANDOM_LIFE_EVENTS.length}`); // v2.15 (coordinator merge fix): W5 added 3 memory events, 571 + 3 = 574
check('55 venture types', countVentureRows() === 55, `got ${countVentureRows()}`);
check('14 business events', BUSINESS_EVENTS.length === 14, `got ${BUSINESS_EVENTS.length}`);

/* ================= §1 Compounds / Lands dead listings ================= */
console.log('--- §1 Compounds / Lands ---');
function countDeadListings(html, buyAction) {
  const rows = String(html).split('<div class="item-row">').slice(1);
  const listings = rows.filter(r => r.includes(`data-action="${buyAction}"`));
  let dead = 0;
  for (const r of listings) {
    const btns = [...r.matchAll(/<button[^>]*>/g)].map(m => m[0]);
    const enabled = btns.filter(b => !/disabled/.test(b) && /data-action=/.test(b));
    if (enabled.length === 0) dead++;
  }
  return { total: listings.length, dead, live: listings.length - dead };
}
{
  const S = auditPersona();
  const ui = { activeTab: 'realestate', propMarket: 'local', gulfTarget: 'uae', reUnitId: 'apt_m', reFinishId: 'standard', rePlanId: 'cash', reQuery: '' };
  const comp = countDeadListings(renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds' }), 'buy-compound-unit');
  const lands = countDeadListings(renderRealEstateTabHtml(S, { ...ui, reSub: 'lands' }), 'buy-land');
  console.log('Compounds:', JSON.stringify(comp), '| Lands:', JSON.stringify(lands));
  check('Compounds dead listings 28/28 -> 0', comp.total === 28 && comp.dead === 0, JSON.stringify(comp));
  check('Lands dead listings 24/24 -> 0', lands.total === 24 && lands.dead === 0, JSON.stringify(lands));
  const compHtml = renderRealEstateTabHtml(S, { ...ui, reSub: 'compounds' });
  check('Compounds rows offer Save for this', /Save for this/.test(compHtml));
  check('Compounds rows offer Compare', /data-action="compare-listing"/.test(compHtml));
  check('Compounds rows offer view-cheaper toggle', /View cheaper|only what I can afford/i.test(compHtml));
}

/* ================= §2 Journal controls ================= */
console.log('--- §2 Journal ---');
{
  const S = auditPersona();
  S.journal = [
    { id: 'j1', year: 2024, month: 3, category: 'money', text: 'ZEBRA money moment' },
    { id: 'j2', year: 2023, month: 5, category: 'family', text: 'Family dinner' }
  ];
  const html = renderLifeTabHtml(S, { journalType: 'all', journalQuery: '', journalYear: 'all' });
  check('journal filter row renders (All/Family/Money/Health/Career/Business/World/Other)', /data-action="set-journal-filter"/.test(html) && /Family/.test(html) && /Business/.test(html));
  check('journal search input renders', /data-filter="journalQuery"/.test(html));
  check('journal jump-to-year select renders', /data-filter="journalYear"/.test(html));
  check('journal reaction buttons render', /data-action="journal-react"/.test(html) && /Cherish/.test(html));
  const moneyOnly = renderLifeTabHtml(S, { journalType: 'money', journalQuery: '', journalYear: 'all' });
  check('money filter hides the family entry', /ZEBRA/.test(moneyOnly) && !/Family dinner/.test(moneyOnly));
  const searched = renderLifeTabHtml(S, { journalType: 'all', journalQuery: 'zebra', journalYear: 'all' });
  check('word search finds the zebra entry only', /ZEBRA/.test(searched) && !/Family dinner/.test(searched));
  const y2023 = renderLifeTabHtml(S, { journalType: 'all', journalQuery: '', journalYear: '2023' });
  check('jump-to-year 2023 shows only the 2023 entry', /Family dinner/.test(y2023) && !/ZEBRA/.test(y2023));
}

/* ================= §3 Disabled buttons state their reason ================= */
console.log('--- §3 Disabled buttons ---');
const LABEL_REASON = /needs|you scored|not taught|degree held|tracks open|launches in|need \d+ more|more point|✓|already|holds |paid|completed|in wallet|in use|starts at|school years over|answer open decision|visa-free|stamped|tutor hired|built|wing added|fulfilled|below .*threshold|not eligible/i;
function countDisabled(html) {
  const btnRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let total = 0, without = 0; const withoutList = []; const buySample = [];
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
    if (/^buy-/.test(action) && buySample.length < 12) buySample.push({ action, label, ok });
  }
  return { total, without, withoutList, buySample };
}
{
  const S = auditPersona();
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
  let html = renderHudHtml(S) + renderBottomDockHtml(S);
  for (const [name, fn] of sweeps) { try { html += fn(); } catch (e) { console.log(`RENDER ERROR ${name}: ${e.message}`); fail++; } }
  const r = countDisabled(html);
  console.log(`disabled total: ${r.total} | without a visible reason: ${r.without} (audit baseline 206)`);
  if (r.withoutList.length) console.log('without reason:', JSON.stringify(r.withoutList));
  check('disabled buttons without a visible reason: 206 -> 0', r.without === 0, `got ${r.without}`);
  const buyWith = r.buySample.filter(b => b.ok).length;
  console.log(`Buy-button sample with a reason: ${buyWith}/${r.buySample.length}`);
  check('at least 5 Buy buttons state their reason', buyWith >= 5, `got ${buyWith}`);
}

/* ================= §4 Dead buttons gone ================= */
console.log('--- §4 Dead buttons ---');
{
  const views = readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8');
  const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
  const v3d = readFileSync(new URL('../src/ui/visualEngine3d.js', import.meta.url), 'utf8');
  check('no disabled "School years over"/"Starts at 6" button remains', !/<button[^>]*disabled[^>]*>\s*(Starts at 6|School years over)/.test(views));
  check('school rows are plain text now', /Starts at 6/.test(views) && !/<button[^>]*disabled[^>]*>[^<]*Starts at 6/.test(views));
  check('roomInfoMessage toast is gone', !/roomInfoMessage/.test(main) && !/roomInfoMessage/.test(v3d));
  check('room-info opens a detail record (uiState.roomDetail)', /roomDetail/.test(main) && /renderRoomDetailCardHtml/.test(views));
}

/* ================= §5 Marriage tab honesty ================= */
console.log('--- §5 Marriage tab ---');
{
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', religion: 'muslim' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 35;
  S.marriage.status = 'married';
  const wife = createPerson(S, { age: 33, gender: 'f', role: 'spouse', relationLabel: 'Wife', firstName: 'Rana' });
  S.people[wife.id] = wife; S.relations.spouseIds = [wife.id];
  const html = renderPeopleTabHtml(S, { peopleSub: 'marriage' });
  check('married egy muslim man: "Meet a second wife" label present', /Meet a second wife/.test(html), strip(html).slice(0, 200));
  check('married egy muslim man: first wife + divorce warning stated', /first wife/i.test(html) && /divorce/i.test(html));
  check('engine allows the additional-spouse path for him', additionalSpousePath(S, getMarriageProfile('egy', 2026)).allowed === true);
}

/* ================= §6 Verb diversity ================= */
console.log('--- §6 Verb diversity ---');
function distinctVerbs(html) {
  const found = new Set();
  for (const m of String(html).matchAll(/data-action="([^"]+)"/g)) found.add(m[1]);
  for (const nav of ['switch-subtab', 'switch-tab', 'set-ledger-filter', 'set-journal-filter']) found.delete(nav);
  return [...found].sort();
}
{
  const S = auditPersona();
  // Give the persona people/pets/cards so the screens render their rows.
  const friend = createPerson(S, { age: 30, gender: 'm', role: 'friend', relationLabel: 'Friend' });
  S.people[friend.id] = friend; S.relations.friendIds = [friend.id];
  S.pets = [{ id: 'pet1', kind: 'cat', name: 'Mimi', health: 80, happiness: 75, obedience: 45 }];
  S.creditCards = [{ id: 'cc1', catalogId: 'cib_classic', name: 'CIB Classic Credit Card', tier: 'classic', limit: 50000, balance: 0, apr: 0.38, cashbackRate: 0.01 }];
  S.money.cash = 5000000;
  const uiState = { activeTab: 'life', propMarket: 'local', gulfTarget: 'uae' };
  const screens = [
    ['Circle', renderPeopleTabHtml(S, { ...uiState, peopleSub: 'circle' }), 1],
    ['Children', renderPeopleTabHtml(S, { ...uiState, peopleSub: 'children' }), 1],
    ['Pets', renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'pets' }), 1],
    ['Shop', renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'shop' }), 2],
    ['Appearance', renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'appearance' }), 1],
    ['Travel', renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'travel' }), 1],
    ['Cards', renderFinanceTabHtml(S, { ...uiState, finSub: 'cards' }), 2]
  ];
  for (const [name, html, oldCount] of screens) {
    const verbs = distinctVerbs(html);
    console.log(`${name}: ${verbs.length} distinct verbs — ${verbs.join(', ')}`);
    check(`${name} offers more than one verb (was ${oldCount})`, verbs.length > oldCount, `got ${verbs.length}`);
  }
}

/* ================= §7 Perk strings wired ================= */
console.log('--- §7 Perk strings ---');
{
  const views = readFileSync(new URL('../src/ui/views.js', import.meta.url), 'utf8');
  // Staff loan: a bank-track employee gets a cheaper rate than the standard loan.
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.player.age = 35;
  S.career.employed = true;
  S.career.job = { monthlyGross: 32000, employer: 'National Bank of Egypt', title: 'Bank Teller', track: 'finance' };
  const terms = staffLoanTerms(S);
  console.log('staff loan terms:', JSON.stringify(terms));
  check('staff loan is eligible for a bank-track job', terms.eligible === true, JSON.stringify(terms));
  check('staff loan rate beats the standard rate', typeof terms.staffRate === 'number' && typeof terms.standardRate === 'number' && terms.staffRate < terms.standardRate, JSON.stringify(terms));
  // Staff hospital treatment: a hospital employee pays less than full price.
  const S2 = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S2);
  S2.year = 2026; S2.month = 1; S2.player.age = 35;
  S2.career.employed = true;
  S2.career.job = { monthlyGross: 32000, employer: 'Nile Care Hospital', title: 'Nurse', track: 'medicine' };
  check('staff hospital treatment eligible for a hospital job', staffTreatmentEligible(S2) === true);
  const cond = { id: 'heart_disease', label: 'Heart disease', treatmentUsd2026: 8500 };
  const staff = treatmentCostLocal(S2, cond, 'private');
  S2.career.job.track = 'software';
  const full = treatmentCostLocal(S2, cond, 'private');
  console.log('treatment staff:', staff, '| full:', full);
  check('staff treatment costs about a quarter of the full bill', staff > 0 && Math.abs(staff * 4 - full) <= 2, `staff=${staff} full=${full}`);
}

console.log(`\nTOTAL ${pass} PASS, ${fail} FAIL`);
if (fail > 0) process.exitCode = 1;
