#!/usr/bin/env node
/* v2.20 I1 verify — launch flow: one launch is one business, a branch
 * never renders as a full card, full-time + manager keeps the job.
 * Run from the game root:  node tests/v220-i1-verify.mjs
 * Proves, with measured numbers:
 *  (a) Elsayed's exact flow (employed player -> FT -> PT) creates
 *      exactly ONE business;
 *  (b) FT + manager launch keeps the job (employed stays true,
 *      manager-run, 0 owner hours);
 *  (c) FT with no manager while employed refuses in plain words
 *      naming reason + alternatives, and does NOT resign;
 *  (d) a branch renders only as a branch row (0 full branch cards,
 *      1 row in the parent);
 *  (e) a duplicate same-type launch is refused/confirmed and the
 *      default name is unique.
 * Also: branch guards on expand / mode-switch, branch-of-branch
 * refusal, the event-driven launch gate, the launch-row wiring
 * (run-by choice + shortlist inline), and the dead launch-biz
 * handler removal. Exit 0 only when there are no FAILs. */
import { readFileSync } from 'node:fs';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { launchSmallBusiness, setBusinessMode } from '../src/systems/careerEducationEngine.js';
import { expandBusiness } from '../src/systems/businessEngine.js';
import { managerShortlist } from '../src/systems/businessManager.js';
import { openBranchOfType, listBranches } from '../src/systems/businessBranches.js';
import { renderWorkTabHtml } from '../src/ui/views.js';

let pass = 0, fail = 0; const failedNames = [];
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`); }
  else { fail++; failedNames.push(name); console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const section = (t) => console.log(`\n--- ${t} ---`);
const countOcc = (html, sub) => String(html).split(sub).length - 1;

/* Employed player, Egypt, June 2022 — Elsayed's playtest position:
   34, working at Orascom Construction, 48h/week job, 22h/week free. */
function employedLife(seed) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.player.age = 34; S.year = 2022; S.month = 6; S.pacing = 'monthly';
  S.money.cash = 2000000; S.money.creditScore = 700;
  S.career.employed = true;
  S.career.job = {
    employer: 'Orascom Construction', title: 'Site Engineer', track: 'engineering',
    level: 1, monthlyGross: 30000, startYear: 2021, monthsInRole: 8,
    performance: 70, workMode: 'normal', bossId: null
  };
  return S;
}
function adultLife(seed) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2022; S.month = 6; S.player.age = 34; S.pacing = 'monthly';
  S.money.cash = 5000000; S.money.savings = 0; S.reputation = 80;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.legal.residency.kind = 'citizen';
  return S;
}

/* ================= (a) Elsayed's exact flow ================= */
section('(a) Elsayed\'s exact flow: employed -> FT -> PT makes ONE business');
{
  const S = employedLife(777);
  const family = S.player.familyName;
  // The v2.19 screen had no run-by choice: a bare FT click. In v2.19
  // that click SUCCEEDED and silently resigned the job.
  const r0 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'full_time' });
  check('bare FT click (v2.19 screen shape) is refused, not a silent resign', !r0.ok, r0.msg);
  check('no business after the refused FT click', S.career.businesses.length === 0, `${S.career.businesses.length} businesses`);
  check('still employed after the refused FT click', S.career.employed === true && S.career.job?.employer === 'Orascom Construction');
  check('FT refusal names the job', /Orascom Construction/.test(r0.msg || ''), r0.msg);
  check('FT refusal names the manager alternative', /manager/i.test(r0.msg || ''), r0.msg);
  check('FT refusal names resigning first as the other alternative', /resign/i.test(r0.msg || ''), r0.msg);
  // The new screen's explicit self-run FT click refuses the same way.
  const r1 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'full_time', runBy: 'self' });
  check('FT self-run click is refused', !r1.ok, r1.msg);
  check('still 0 businesses, still employed', S.career.businesses.length === 0 && S.career.employed === true);
  // Then part-time — the click he made next.
  const r2 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self' });
  check('PT launch succeeds', r2.ok, r2.msg);
  check('exactly ONE business after FT-refused + PT', S.career.businesses.length === 1, `${S.career.businesses.length} businesses`);
  const biz = S.career.businesses[0];
  check('the one business is the part-time fruit stall', biz.typeId === 'fruit_stall' && biz.mode === 'part_time', `${biz.typeId} ${biz.mode}`);
  check('the one business is named for the family', biz.name.startsWith(family), biz.name);
  check('still employed after the PT launch', S.career.employed === true && S.career.job?.employer === 'Orascom Construction');
  check('PT self-run costs owner hours, not the job', biz.ownerHoursPerWeek === 18, `${biz.ownerHoursPerWeek}h/week`);
  // A second PT click (the double-click that made the second card).
  const r3 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self' });
  check('second PT click is refused (no free hours left for it)', !r3.ok, r3.msg);
  check('still exactly ONE business after the second PT click', S.career.businesses.length === 1);
}

/* ================= (b) FT + manager keeps the job ================= */
section('(b) FT + manager launch keeps the job');
{
  const S = employedLife(778);
  const shortlist = managerShortlist(S, { country: 'egy', monthlyRev: 20900, capitalInvested: 47500, staff: [] });
  check('launch shortlist has at least 2 candidates', shortlist.length >= 2, `${shortlist.length} candidates: ${shortlist.map(c => `${c.name} skill ${c.skill} ${c.wage}/mo`).join(' | ')}`);
  const mgr = shortlist[0];
  console.log(`    picked manager: ${mgr.name}, skill ${mgr.skill}, wage ${mgr.wage}/mo`);
  const r = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'full_time', runBy: 'manager', manager: mgr });
  check('FT + manager launch succeeds', r.ok, r.msg);
  check('exactly ONE business', S.career.businesses.length === 1, `${S.career.businesses.length}`);
  const biz = S.career.businesses[0];
  check('still employed (job kept)', S.career.employed === true && S.career.job?.employer === 'Orascom Construction');
  check('business is full-time', biz.mode === 'full_time', biz.mode);
  check('business is manager-run (the picked manager)', biz.manager?.name === mgr.name && biz.manager?.wage === mgr.wage, `${biz.manager?.name} ${biz.manager?.wage}/mo`);
  check('0 owner hours on a manager-run business', biz.ownerHoursPerWeek === 0, `${biz.ownerHoursPerWeek}h/week`);
  // runBy manager with no manager supplied refuses.
  const S2 = employedLife(779);
  const r2 = launchSmallBusiness(S2, 'fruit_stall', '', { mode: 'full_time', runBy: 'manager' });
  check('runBy manager with no manager refuses', !r2.ok, r2.msg);
  check('no business, job kept on that refusal', S2.career.businesses.length === 0 && S2.career.employed === true);
}

/* ================= (c) FT mode-switch refusal ================= */
section('(c) FT mode-switch while employed refuses, never resigns');
{
  const S = employedLife(780);
  const r0 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self' });
  check('PT launch for the switch test succeeds', r0.ok, r0.msg);
  const biz = S.career.businesses[0];
  const r = setBusinessMode(S, biz.id, 'full_time');
  check('switch to FT while employed refuses', !r.ok, r.msg);
  check('switch refusal names the job', /Orascom Construction/.test(r.msg || ''), r.msg);
  check('switch refusal names both alternatives', /manager/i.test(r.msg || '') && /resign/i.test(r.msg || ''), r.msg);
  check('still employed, job untouched', S.career.employed === true && S.career.job?.employer === 'Orascom Construction');
  check('business is still part-time', biz.mode === 'part_time', biz.mode);
  // The same switch on a manager-run business is fine (no job at stake).
  const S2 = employedLife(781);
  const mgr = managerShortlist(S2, { country: 'egy', monthlyRev: 20900, capitalInvested: 47500, staff: [] })[0];
  launchSmallBusiness(S2, 'fruit_stall', '', { mode: 'full_time', runBy: 'manager', manager: mgr });
  const biz2 = S2.career.businesses[0];
  const r2 = setBusinessMode(S2, biz2.id, 'part_time');
  check('manager-run FT -> PT switch succeeds', r2.ok, r2.msg);
  check('manager-run business is part-time after the switch', biz2.mode === 'part_time' && S2.career.employed === true);
}

/* ================= (d) branch renders only as a row ================= */
section('(d) a branch renders only as a branch row');
{
  const S = adultLife(782);
  const r0 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self' });
  check('parent fruit stall launches', r0.ok, r0.msg);
  const parent = S.career.businesses[0];
  const rb = openBranchOfType(S, parent, 'Alexandria', 'kiosk');
  check('kiosk branch opens in Alexandria', rb.ok, rb.msg);
  const branch = rb.branch || S.career.businesses.find(b => b.isBranch);
  console.log(`    branch: ${branch.name} (${branch.branchType}, ${branch.city})`);
  check('branch record is still stored in S.career.businesses (render-only change)', S.career.businesses.length === 2 && S.career.businesses.includes(branch), `${S.career.businesses.length} records`);
  check('listBranches finds the one branch', listBranches(S, parent).length === 1);
  const html = renderWorkTabHtml(S, { workSub: 'ventures',bizTab:'growth' });
  check('0 full branch cards (no <h3> card title for the branch)', countOcc(html, `<h3>${branch.name}`) === 0, `${countOcc(html, `<h3>${branch.name}`)} card titles`);
  check('0 full-card mode-switch buttons for the branch', countOcc(html, `data-biz="${branch.id}" data-mode`) === 0, `${countOcc(html, `data-biz="${branch.id}" data-mode`)} buttons`);
  check('0 full-card expand buttons for the branch', countOcc(html, `data-action="expand-business" data-biz="${branch.id}"`) === 0);
  check('exactly 1 branch row naming the branch', countOcc(html, `<strong>${branch.name}</strong>`) === 1, `${countOcc(html, `<strong>${branch.name}</strong>`)} rows`);
  check('parent card still renders once', countOcc(html, `<h3>${parent.name}`) === 1, `${countOcc(html, `<h3>${parent.name}`)} parent cards`);
  check('header counts 1 business, not 2', html.includes('1 owned ·') && !html.includes('2 businesses'), 'header count');
  check('Branches section names the parent', html.includes(`Branches — ${parent.name} (1)`));
}

/* ================= (e) duplicate guard + unique name ================= */
section('(e) duplicate same-type launch refused/confirmed, name unique');
{
  const S = adultLife(783);
  const r1 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self' });
  check('first fruit stall launches', r1.ok, r1.msg);
  const n1 = S.career.businesses[0].name;
  console.log(`    first stall name: ${n1}`);
  const r2 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self' });
  check('second same-type launch refused', !r2.ok, r2.msg);
  check('refusal names the business already owned', (r2.msg || '').includes(n1) && /already own/.test(r2.msg || ''), r2.msg);
  check('still 1 business after the refused duplicate', S.career.businesses.length === 1);
  const r3 = launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self', allowDuplicate: true });
  check('confirmed second launch (allowDuplicate) succeeds', r3.ok, r3.msg);
  check('2 businesses after the confirmed second launch', S.career.businesses.length === 2);
  const n2 = S.career.businesses[1].name;
  check('second business gets a unique default name', n2 === `${n1} 2` && n2 !== n1, `"${n1}" vs "${n2}"`);
  // Explicit custom name collides too.
  const r4 = launchSmallBusiness(S, 'cafe', 'Cairo Corner Café', { mode: 'full_time' });
  check('named cafe launches', r4.ok, r4.msg);
  const r5 = launchSmallBusiness(S, 'cafe', 'Cairo Corner Café', { mode: 'full_time', allowDuplicate: true });
  check('second cafe with the same explicit name launches once confirmed', r5.ok, r5.msg);
  check('second cafe is renamed, not a silent twin', S.career.businesses[3].name === 'Cairo Corner Café 2', S.career.businesses[3].name);
}

/* ================= branch guards + event gate ================= */
section('branch guards, branch-of-branch, event launch gate');
{
  const S = adultLife(784);
  launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self' });
  const parent = S.career.businesses[0];
  openBranchOfType(S, parent, 'Alexandria', 'kiosk');
  const branch = S.career.businesses.find(b => b.isBranch);
  const re = expandBusiness(S, branch);
  check('expand on a branch refuses', !re.ok && /branch/i.test(re.msg || ''), re.msg);
  const rm = setBusinessMode(S, branch.id, 'full_time');
  check('mode-switch on a branch refuses', !rm.ok && /branch/i.test(rm.msg || ''), rm.msg);
  check('mode-switch refusal names the parent', (rm.msg || '').includes(parent.name), rm.msg);
  const rb = openBranchOfType(S, branch, 'Mansoura', 'kiosk');
  check('a branch cannot have its own branch', !rb.ok && /cannot have its own branch/.test(rb.msg || ''), rb.msg);
  const evSrc = readFileSync('src/data/eventsMoneyHealthCareer.js', 'utf8');
  const evIdx = evSrc.indexOf('createBusiness(st, v.id,');
  const evTail = evIdx >= 0 ? evSrc.slice(evIdx, evIdx + 220) : '';
  check('event-driven launch passes an explicit mode/manager gate', evIdx >= 0 && /mode: 'part_time'/.test(evTail) && /runBy: 'self'/.test(evTail), evTail.trim().split('\n').join(' '));
}

/* ================= launch-row wiring (render) ================= */
section('launch-row wiring: run-by choice + shortlist inline');
{
  const S = employedLife(785);
  const htmlSelf = renderWorkTabHtml(S, { workSub: 'ventures', bizDesk:'start',bizQuery: 'fruit' });
  check('launch row offers "Run it myself"', htmlSelf.includes('Run it myself'));
  check('launch row offers "Hire a manager to run it"', htmlSelf.includes('Hire a manager to run it'));
  check('launch row shows the manager wage estimate', /Hire a manager to run it \(~[^)]+\/mo\)/.test(htmlSelf));
  check('self-run row shows FT + PT launch buttons with run-by', htmlSelf.includes('data-action="launch-business"') && htmlSelf.includes('data-runby="self"'));
  const htmlMgr = renderWorkTabHtml(S, { workSub: 'ventures', bizDesk:'start',bizQuery: 'fruit', bizRunBy_fruit_stall: 'manager' });
  check('manager run-by shows the shortlist inline', htmlMgr.includes('Pick who runs it') && htmlMgr.includes('data-action="biz-launch-pick-manager"'));
  check('manager run-by holds the launch buttons until a manager is picked', htmlMgr.includes('Choose a manager.') && !htmlMgr.includes('data-action="launch-business" data-type="fruit_stall"'));
  const picked = { name: 'Test Manager', skill: 50, wage: 11000, loyalty: 60, personId: 'mgr_1' };
  const htmlPicked = renderWorkTabHtml(S, { workSub: 'ventures', bizDesk:'start',bizQuery: 'fruit', bizRunBy_fruit_stall: 'manager', bizLaunchMgr_fruit_stall: picked });
  check('picked manager is named on the row', htmlPicked.includes('Manager: <strong>Test Manager</strong>'));
  check('launch buttons carry the picked manager record', htmlPicked.includes('data-runby="manager"') && htmlPicked.includes('data-mgr-name="Test Manager"') && htmlPicked.includes('data-mgr-wage="11000"'));
  const htmlDup = renderWorkTabHtml(S, { workSub: 'ventures', bizDesk:'start',bizQuery: 'fruit' });
  check('no duplicate note before any launch', !htmlDup.includes('Open a second one'));
  launchSmallBusiness(S, 'fruit_stall', '', { mode: 'part_time', runBy: 'self' });
  const htmlDup2 = renderWorkTabHtml(S, { workSub: 'ventures', bizDesk:'start',bizQuery: 'fruit' });
  const ownedName = S.career.businesses[0].name;
  check('row names the business already owned, with a confirm', htmlDup2.includes(`You already own a Fruit &amp; vegetable stall (${ownedName}`) && htmlDup2.includes('Open a second one'));
  const htmlDup3 = renderWorkTabHtml(S, { workSub: 'ventures', bizDesk:'start',bizQuery: 'fruit', bizAllowDup_fruit_stall: true });
  check('confirmed duplicate row carries data-allow-dup on the launch buttons', htmlDup3.includes('data-allow-dup="1"'));
  check('time note no longer says full-time means resigning', !htmlSelf.includes('full-time means resigning from your job') && htmlSelf.includes('Running full-time yourself requires leaving your job. Managers use no player hours.'));
}

/* ================= wiring source checks ================= */
section('wiring source checks (handler, toast, dead code)');
{
  const mainSrc = readFileSync('src/main.js', 'utf8');
  check('dead launch-biz handler is gone', !mainSrc.includes('launch-biz'), 'data-action="launch-biz" still present');
  check('launch-business handler passes runBy through', /launch-business[\s\S]{0,900}runBy/.test(mainSrc));
  check('launch-business handler passes the manager record through', /launch-business[\s\S]{0,900}manager/.test(mainSrc));
  check('launch-business handler passes allowDuplicate through', mainSrc.includes('allowDuplicate'));
  check('row-choice handlers exist (runby / pick-manager / clear-manager / dup)', ['biz-launch-runby', 'biz-launch-pick-manager', 'biz-launch-clear-manager', 'biz-launch-dup'].every(a => mainSrc.includes(a)));
  check('toast carries the job consequence when one occurs', mainSrc.includes('res.leftJob'));
  const engSrc = readFileSync('src/systems/businessEngine.js', 'utf8');
  check('no silent resignJob call left in the business engine', !engSrc.includes('opts.resignJob(S)'), 'opts.resignJob(S) still called');
  check('no resignJob passed by the launch wrapper any more', !readFileSync('src/systems/careerEducationEngine.js', 'utf8').includes('resignJob: resignCurrentJob'));
  const viewsSrc = readFileSync('src/ui/views.js', 'utf8');
  check('portfolio (cards / totals / header) reads non-branches only', viewsSrc.includes('portfolioBusinesses = businesses.filter(b => b && !b.isBranch)'));
  check('branch records stay in S.career.businesses (no storage change)', !/S\.career\.businesses = \(S\.career\.businesses \|\| \[\]\)\.filter\(b => !b\.isBranch\)/.test(viewsSrc));
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ` — FAILED: ${failedNames.join(', ')}` : ''}`);
process.exit(fail ? 1 : 0);
