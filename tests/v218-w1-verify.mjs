#!/usr/bin/env node
/* v2.18 W1 verify — Career, Real (§1): real work inside the job.
 * Run from the game root:  node tests/v218-w1-verify.mjs
 * Measured, not asserted from notes:
 *  1. At least 10 tracks each have real work with a real choice and a
 *     real consequence (a choice moves a dashboard number).
 *  2. A piece of work moves the performance dashboard, measured per part
 *     (boss / team / numbers) before vs after through the real
 *     getPerformanceDashboard.
 *  3. A skill used in real work rises; an unused skill falls (measured).
 *  4. Work completions count toward promotion (measured where the
 *     promotion check reads: steppedUp + promotionScoreParts).
 *  5. Achievements are written in the exact contract shape
 *     { id, label, year, month, trackId } with count == length.
 *  6. The monthly hook assigns work: a life with a job gets a piece of
 *     work within 2 months (measured through tickCareerMonthly).
 * Exit 0 only when there are no FAILs.
 */
import { readFileSync } from 'node:fs';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: (k) => store.delete(k),
};

const print = (...a) => console.log(...a);
let passes = 0; let failures = 0; const failedNames = [];
function check(name, ok, detail = '') {
  if (ok) { passes++; print(`PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { failures++; failedNames.push(name); print(`FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}
function section(t) { print(`\n--- ${t} ---`); }

const { createNewLifeState, ensureExtendedState } = await import('../src/core/schema.js');
const { tickCareerMonthly } = await import('../src/systems/careerEducationEngine.js');
const { spawnWorkplaceCast } = await import('../src/systems/soulEngine.js');
const { getPerformanceDashboard, promotionScoreParts } = await import('../src/systems/careerMarket.js');
const {
  CAREER_WORK_TRACK_IDS, CAREER_WORK_TEMPLATES,
  assignCareerWork, maybeAssignCareerWork, resolveCareerWork,
  renderCareerWorkHtml, getWorkSkillLevel, ensureCareerWork,
} = await import('../src/systems/careerWork.js');

/* ---------- test-life helpers ---------- */
function employedLife(seed, track, title = 'Specialist') {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'professional' });
  ensureExtendedState(S);
  S.player.age = 34; S.year = 2024; S.month = 6; S.pacing = 'monthly';
  S.money.cash = 2000000; S.money.creditScore = 700;
  S.career.employed = true;
  S.career.job = {
    employer: 'Test Employer', title, track, level: 1, monthlyGross: 30000,
    startYear: 2023, monthsInRole: 8, performance: 70, workMode: 'normal', bossId: null,
  };
  S.career.trackExperience = { [track]: 2 };
  const { boss } = spawnWorkplaceCast(S, 'Test Employer', track, 30000);
  S.career.job.bossId = boss.id;
  return S;
}
const dash = (S) => getPerformanceDashboard(S);

/* ================================================================== */
section('1. At least 10 tracks have real work with a real choice and a real consequence');
const TRACKS = ['medicine', 'aviation', 'teaching', 'law', 'software', 'engineering', 'finance', 'nursing', 'sales', 'hospitality', 'trades', 'media'];
check('template count >= 10', CAREER_WORK_TRACK_IDS.length >= 10, `${CAREER_WORK_TRACK_IDS.length} templates: ${CAREER_WORK_TRACK_IDS.join(', ')}`);
let tracksWithWork = 0; const trackDetails = [];
for (const track of TRACKS) {
  const S = employedLife(1000 + TRACKS.indexOf(track), track);
  const work = assignCareerWork(S);
  const hasTitle = work && work.title && work.title.length > 10;
  const hasDetail = work && work.detail && work.detail.length > 40;
  const hasDeadline = work && work.deadlineMonths >= 1 && work.deadlineMonths <= 3;
  const hasSkill = work && work.skillId && work.skillLabel;
  const choices = work ? work.choices : [];
  const choicesOk = choices.length === 4 && choices.every((c) => c.tradeoff && c.tradeoff.length > 20 && c.label && c.label.length > 5);
  const ids = choices.map((c) => c.id).sort().join(',');
  // Real consequence: resolving the hard choice (forced success) moves performance.
  const before = S.career.job.performance;
  const r = resolveCareerWork(S, 'hard', { force: 'success' });
  const moved = r.ok && S.career.job.performance > before;
  const ok = hasTitle && hasDetail && hasDeadline && hasSkill && choicesOk && ids === 'corner,difficult,hard,help' && moved;
  if (ok) tracksWithWork += 1;
  trackDetails.push(`${track}: ${ok ? 'ok' : `FAIL title=${hasTitle} detail=${hasDetail} deadline=${hasDeadline} skill=${hasSkill} choices=${choicesOk} ids=${ids} moved=${moved} perf ${before}->${S.career.job.performance}`} — "${work ? work.title : 'none'}" (${work ? work.skillLabel : '-'}, ${work ? work.deadlineMonths : '-'}mo)`);
}
check('all 12 named tracks have real work + 4 choices + a consequence', tracksWithWork === TRACKS.length, `${tracksWithWork}/12`);
for (const d of trackDetails) print(`    ${d}`);
// A track with no template still gets generic real work.
{
  const S = employedLife(9999, 'quantum_basket_weaving', 'Quantum Basket Weaver');
  const work = assignCareerWork(S);
  check('unknown track still gets generic real work', !!work && work.choices.length === 4 && !!work.skillId, work ? `"${work.title}"` : 'none');
}

/* ================================================================== */
section('2. A piece of work moves the performance dashboard, per part');
{
  const S = employedLife(4242, 'software', 'Software Engineer');
  assignCareerWork(S);
  const d0 = dash(S);
  const r = resolveCareerWork(S, 'hard', { force: 'success' });
  const d1 = dash(S);
  check('resolve returns ok', r.ok, r.msg);
  check('boss view moves (boss respect + managerView)', d1.bossView.value > d0.bossView.value && d1.bossView.boss.respect > d0.bossView.boss.respect,
    `bossView ${d0.bossView.value} -> ${d1.bossView.value}, boss respect ${d0.bossView.boss.respect} -> ${d1.bossView.boss.respect}`);
  check('numbers move (quality + performance)', d1.numbers.value > d0.numbers.value && d1.numbers.quality > d0.numbers.quality,
    `numbers ${d0.numbers.value} -> ${d1.numbers.value}, quality ${d0.numbers.quality} -> ${d1.numbers.quality}, overall ${d0.overall} -> ${d1.overall}`);
}
{
  const S = employedLife(4243, 'teaching', 'Classroom Subject Teacher');
  assignCareerWork(S);
  const d0 = dash(S);
  const r = resolveCareerWork(S, 'help', {});
  const d1 = dash(S);
  check('help choice moves the team view', r.ok && d1.teamView.value !== null && d1.teamView.value > d0.teamView.value,
    `teamView ${d0.teamView.value} -> ${d1.teamView.value} (colleagues ${d1.teamView.colleagueCount})`);
}
{
  const S = employedLife(4244, 'law', 'Associate Counsel');
  assignCareerWork(S);
  const d0 = dash(S);
  const r = resolveCareerWork(S, 'corner', { force: 'caught' });
  const d1 = dash(S);
  check('cutting a corner and getting caught damages the boss view', r.ok && d1.bossView.boss.trust < d0.bossView.boss.trust && d1.bossView.value < d0.bossView.value,
    `boss trust ${d0.bossView.boss.trust} -> ${d1.bossView.boss.trust}, bossView ${d0.bossView.value} -> ${d1.bossView.value}, warnings now ${S.career.job.actionState.warnings}`);
}
{
  const S = employedLife(4245, 'medicine', 'Resident Physician');
  assignCareerWork(S);
  const d0 = dash(S);
  const r = resolveCareerWork(S, 'difficult', { force: 'success' });
  const d1 = dash(S);
  check('difficult client won moves boss + numbers the most', r.ok && d1.numbers.value - d0.numbers.value >= 2 && d1.numbers.quality - d0.numbers.quality === 5 && d1.bossView.boss.respect - d0.bossView.boss.respect >= 5,
    `numbers +${d1.numbers.value - d0.numbers.value} (quality +${d1.numbers.quality - d0.numbers.quality}, attendance unchanged, so the average moves half), boss respect +${d1.bossView.boss.respect - d0.bossView.boss.respect}`);
}

/* ================================================================== */
section('3. Skill used in real work rises; an unused skill falls');
{
  const S = employedLife(5151, 'aviation', 'First Officer');
  const work = assignCareerWork(S);
  const skillId = work.skillId;
  const before = getWorkSkillLevel(S, skillId);
  resolveCareerWork(S, 'hard', { force: 'success' });
  const afterUse = getWorkSkillLevel(S, skillId);
  check('skill used in real work rises', afterUse > before, `${skillId} ${before} -> ${afterUse} (+${afterUse - before})`);
  // Six months pass with the skill never used again: new work is resolved
  // via a different route (help uses the same skill, so expire it instead:
  // let deadlines lapse, which never calls useSkill on it).
  for (let i = 0; i < 6; i++) {
    S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; }
    // Expire whatever work is open without resolving it, then let the hook assign fresh work.
    if (S.career.currentWork) S.career.currentWork.monthsLeft = 1;
    maybeAssignCareerWork(S);
  }
  const afterIdle = getWorkSkillLevel(S, skillId);
  check('skill never used falls, slowly', afterIdle < afterUse, `${skillId} ${afterUse} -> ${afterIdle} over 6 idle months (floor 20)`);
  check('skill decay is slow, not a cliff', afterUse - afterIdle <= 4, `fell ${afterUse - afterIdle} over 6 months`);
}

/* ================================================================== */
section('4. Work completions count toward promotion');
{
  const S = employedLife(6161, 'engineering', 'Project Engineer');
  const parts0 = promotionScoreParts(S);
  const stepped0 = parts0.steppedUp;
  const comp0 = S.career.workCompletions || 0;
  for (let i = 0; i < 2; i++) {
    assignCareerWork(S);
    resolveCareerWork(S, 'hard', { force: 'success' });
  }
  const parts1 = promotionScoreParts(S);
  check('two completions add two steppedUp entries where the check reads them',
    parts1.steppedUp === stepped0 + 2, `steppedUp ${stepped0} -> ${parts1.steppedUp}`);
  check('promotion score base rises with real work',
    parts1.base > parts0.base, `base ${parts0.base} -> ${parts1.base} (performance ${parts0.performance} -> ${parts1.performance}, steppedUpBonus ${parts0.steppedUpBonus} -> ${parts1.steppedUpBonus})`);
  check('workCompletions counter rises', (S.career.workCompletions || 0) === comp0 + 2, `${comp0} -> ${S.career.workCompletions}`);
}

/* ================================================================== */
section('5. Achievements in the exact contract shape');
{
  const S = employedLife(7171, 'finance', 'Financial Analyst');
  assignCareerWork(S);
  resolveCareerWork(S, 'difficult', { force: 'success' });
  const ach = S.career.workAchievements;
  const a = ach[0];
  const keys = a ? Object.keys(a).sort().join(',') : '';
  check('achievement has exactly {id,label,year,month,trackId}', keys === 'id,label,month,trackId,year',
    a ? JSON.stringify(a) : 'no achievement recorded');
  check('achievement names the visible win', !!a && typeof a.label === 'string' && a.label.length > 10, a ? a.label : '');
  check('achievement track + date match the work', !!a && a.trackId === 'finance' && a.year === S.year && a.month === S.month,
    a ? `${a.trackId} ${a.year}-${a.month}` : '');
  check('workAchievementCount == achievements.length', S.career.workAchievementCount === ach.length,
    `${S.career.workAchievementCount} == ${ach.length}`);
  // A failed corner-cutting is not a visible win: no achievement.
  const S2 = employedLife(7172, 'finance', 'Financial Analyst');
  assignCareerWork(S2);
  resolveCareerWork(S2, 'corner', { force: 'caught' });
  check('no achievement for getting caught cutting a corner', S2.career.workAchievements.length === 0 && S2.career.workAchievementCount === 0,
    `${S2.career.workAchievements.length} achievements`);
}

/* ================================================================== */
section('6. Monthly hook assigns work within 2 months (through tickCareerMonthly)');
{
  const S = employedLife(8181, 'nursing', 'Staff Nurse');
  check('no work before any tick', !S.career.currentWork, 'clean start');
  tickCareerMonthly(S);
  const after1 = !!S.career.currentWork;
  tickCareerMonthly(S);
  const after2 = !!S.career.currentWork;
  check('a life with a job gets work within 2 months', after1 || after2,
    `after 1 tick: ${after1}, after 2 ticks: ${after2} — "${S.career.currentWork ? S.career.currentWork.title : 'none'}"`);
}
{
  // A missed deadline lands once as a real miss, and the work stays on
  // the desk, overdue, until the player deals with it — only then does
  // fresh work arrive. (A monthly re-penalty would drain performance
  // in auto-played lives until the warning process fired on its own.)
  const S = employedLife(8182, 'sales', 'Account Manager');
  tickCareerMonthly(S);
  const first = S.career.currentWork;
  first.monthsLeft = 1;
  const perfBefore = S.career.job.performance;
  tickCareerMonthly(S);
  check('missed deadline costs performance once, work stays overdue on the desk',
    S.career.job.performance < perfBefore && S.career.currentWork && S.career.currentWork.id === first.id && S.career.currentWork.overdue === true,
    `perf ${perfBefore} -> ${S.career.job.performance}, still open + overdue`);
  const perfAfterMiss = S.career.job.performance;
  tickCareerMonthly(S);
  tickCareerMonthly(S);
  check('no further miss drain while the overdue work sits there',
    S.career.job.performance >= perfAfterMiss, `perf ${perfAfterMiss} -> ${S.career.job.performance} (only the normal monthly +0.4, no second miss hit)`);
  const r = resolveCareerWork(S, 'hard', { force: 'success' });
  tickCareerMonthly(S);
  check('resolving the overdue work brings fresh work next month',
    r.ok && !!S.career.currentWork && S.career.currentWork.id !== first.id,
    S.career.currentWork ? `"${S.career.currentWork.title}"` : 'none');
}
{
  // No job, no work.
  const S = createNewLifeState({ seed: 8183, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.player.age = 34; S.year = 2024; S.month = 6;
  tickCareerMonthly(S);
  check('unemployed life gets no work', !S.career.currentWork, 'none assigned');
}

/* ================================================================== */
section('7. Render + help-back-later');
{
  const S = employedLife(9191, 'software', 'Software Engineer');
  assignCareerWork(S);
  const html = renderCareerWorkHtml(S);
  check('render shows the work, the deadline, the skill and all 4 choices',
    html.includes(S.career.currentWork.title) && html.includes('Deadline:') && html.includes('data-action="career-work"') &&
    ['hard', 'corner', 'help', 'difficult'].every((c) => html.includes(`data-choice="${c}"`)),
    `${html.length} chars`);
  check('render states a trade-off before the choice', html.includes('1-in-3 chance') && html.includes('your evenings'),
    'trade-off text present');
  const r = resolveCareerWork(S, 'help', {});
  const html2 = renderCareerWorkHtml(S);
  check('help sets a favour owed that comes back later', r.ok && !!S.career.workHelpOwed && !!S.career.workHelpOwed.colleagueId,
    S.career.workHelpOwed ? `owed by ${S.career.workHelpOwed.colleagueName}` : 'no favour recorded');
  check('render after resolving shows no open work and the last outcome',
    !html2.includes('data-action="career-work"') && html2.includes('Last finished:'), 'resolved state renders');
}

print(`\n${passes} PASS, ${failures} FAIL${failedNames.length ? ' — ' + failedNames.join(', ') : ''}`);
process.exit(failures ? 1 : 0);
