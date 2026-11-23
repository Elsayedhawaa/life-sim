/* v2.10 verification harness — Overnight Round 2: Story / Living World.
   Run: node tests/v210-verify.mjs (exit 0 = all pass).
   Method notes (the same method as the audit wherever the audit named one):
   - NPC autonomy + follow-up completion: 30 instrumented lives, Egypt,
     birthYear 1990, seeds 2000-2029, birth -> age 52, advanceSingleTurn
     with scene choice 0 resolved. NPC state is snapshotted before each
     turn and diffed BEFORE the scene choice is resolved, so every counted
     change is purely autonomous (the audit's method).
   - Chains: depth is counted from the data (gates.afterEvent links);
     level 0 = no parent, level 1 = follows a level-0 event, level 2 =
     follows a level-1 event (a chain reaching a THIRD event).
   - Freeze: a forced-open scene + N blocked advanceSingleTurn calls.
   Sections 1-3 belong to the other v2.10 workers (NPC autonomy, chains,
   chapters/goals). On the unmerged base they fail honestly; the freeze
   section is this worker's own scope and must pass on any copy. */
import { createNewLifeState, ensureExtendedState, queueScene, LIFE_AMBITIONS } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { renderLifeTabHtml, goalStageProgress } from '../src/ui/views.js';
import { getCurrentChapter } from '../src/systems/storyLibrary.js';
import { ALL_RANDOM_LIFE_EVENTS } from '../src/systems/eventEngine.js';

const print = (...a) => console.log(...a);
let pass = 0, fail = 0;
const check = (name, cond, extra = '') => {
  if (cond) { pass++; print(`PASS ${name}`); }
  else { fail++; print(`FAIL ${name} ${extra}`); }
};
const strip = (html) => String(html).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const avg = (n, d) => (d ? (n / d).toFixed(2) : '0.00');

/* ------------------------------------------------------------------ *
 * Chain data: level counts + deepest chain, straight from the data.   *
 * ------------------------------------------------------------------ */
const byId = new Map(ALL_RANDOM_LIFE_EVENTS.map((e) => [e.id, e]));
const followupsByParent = new Map(); // parentId -> Set(followupIds)
for (const ev of ALL_RANDOM_LIFE_EVENTS) {
  if (ev.gates?.afterEvent) {
    if (!followupsByParent.has(ev.gates.afterEvent)) followupsByParent.set(ev.gates.afterEvent, new Set());
    followupsByParent.get(ev.gates.afterEvent).add(ev.id);
  }
}
function chainDepth(id, seen = new Set()) {
  if (seen.has(id)) return 0; // cycle guard: a loop is not a longer chain
  const ev = byId.get(id);
  if (!ev || !ev.gates?.afterEvent) return 0;
  seen.add(id);
  return 1 + chainDepth(ev.gates.afterEvent, seen);
}
const levelCount = { 0: 0, 1: 0, 2: 0, '3+': 0 };
let deepestId = null, deepest = 0;
for (const ev of ALL_RANDOM_LIFE_EVENTS) {
  const d = chainDepth(ev.id);
  if (d >= 3) levelCount['3+']++;
  else levelCount[d]++;
  if (d > deepest) { deepest = d; deepestId = ev.id; }
}
function chainNames(id) {
  const names = [];
  let cur = id;
  const seen = new Set();
  while (cur && !seen.has(cur) && names.length < 6) {
    seen.add(cur);
    names.unshift(cur);
    cur = byId.get(cur)?.gates?.afterEvent || null;
  }
  return names.join(' -> ');
}
print(`--- chains (data): ${ALL_RANDOM_LIFE_EVENTS.length} events, level0=${levelCount[0]} level1=${levelCount[1]} level2=${levelCount[2]} level3+=${levelCount['3+']}, max depth=${deepest}`);
print(`--- deepest chain: ${deepestId ? chainNames(deepestId) : '(none)'}`);
check('at least one chain reaches a third event (level 2)', deepest >= 2, `max depth=${deepest}${deepestId ? ` chain: ${chainNames(deepestId)}` : ''}`);

/* ------------------------------------------------------------------ *
 * NPC snapshot / diff. Structural signals only for the counts; the    *
 * journal + queued-scene text is used for the visibility count.       *
 * ------------------------------------------------------------------ */
function npcSnapshot(S) {
  const people = {};
  for (const [id, p] of Object.entries(S.people || {})) {
    if (!p || p.id === 'player') continue;
    people[id] = {
      alive: !!p.alive, role: p.role || '', city: p.city || '',
      res: p.residenceCountry || '', title: p.career?.title || '',
      income: p.career?.monthlyIncomeLocal || 0,
      savings: p.career?.savingsLocal || 0,
      spouseId: p.spouseId || p.partnerId || p.spouse || null,
      spouses: [...(p.spouseIds || [])],
      leftHome: !!p.leftHome,
      marital: p.maritalStatus || p.marriageStatus || '',
      age: p.age || 0,
    };
  }
  const couples = (S.marriage?.couples || [])
    .map((c) => `${[...(c.partners || [])].sort().join('+')}@${c.stage || c.status || ''}`)
    .sort().join('|');
  return { people, couples, childIds: [...(S.relations?.childIds || [])].sort().join(',') };
}
const VIS_KEYWORDS = {
  birth: /baby|born|birth|new (son|daughter|child|niece|nephew|grandchild|grandson|granddaughter)/i,
  marriage: /marri|wedding|engaged|engagement/i,
  divorce: /divorc/i,
  move: /mov(ed|ing)|relocat|emigrat|moved (to|abroad|away)/i,
  leaving: /leaving home|left .* home and moved|moved out|left for (university|college|work)/i,
  job: /\bjob\b|promot|fired|hired|new work|career/i,
  death: /passed away|\bdied\b|death|funeral/i,
};
function wasVisible(type, personName, newLines, newTitles) {
  const kw = VIS_KEYWORDS[type];
  const text = `${newLines.join(' ')} ${newTitles.join(' ')}`;
  if (personName && text.toLowerCase().includes(personName.toLowerCase())) return true;
  return kw ? kw.test(text) : false;
}
function newJournalLines(S, lenBefore) {
  const added = S.journal.slice(0, Math.max(0, S.journal.length - lenBefore));
  return added.map((e) => e.text || '');
}

function diffNpcs(before, after, S, newLines, newTitles, totals) {
  // Person-level and couple-record signals are counted separately, then
  // merged with max(): the same marriage is often written to both places,
  // and counting both would double it. Two different couples marrying in
  // one turn still counts as two, because both channels then read two.
  let pMarriages = 0, pDivorces = 0;
  for (const [id, a] of Object.entries(after.people)) {
    const b = before.people[id];
    if (!b) {
      // A brand-new person. Role 'child' (age 0) = a birth; other roles
      // (bestie/rival/friend/colleague) are scripted cast, not births.
      if (a.role === 'child' || a.age === 0) {
        totals.births++;
        if (wasVisible('birth', S.people[id]?.firstName, newLines, newTitles)) totals.visible.births++;
      }
      continue;
    }
    if (b.alive && !a.alive) {
      totals.deaths++;
      if (wasVisible('death', S.people[id]?.firstName, newLines, newTitles)) totals.visible.deaths++;
    }
    if (!a.alive) continue;
    /* Leaving home is the feature's own signal: the leftHome flag flips
       for a family-role NPC (child/sibling/nephew/niece/grandchild).
       A city change alone is a move, not a leaving — and a married
       leaver often keeps the same city (spouse's city), so city-change
       detection misses real leavings. */
    if (['sibling', 'child', 'nephew', 'niece', 'grandchild'].includes(b.role) && !b.leftHome && a.leftHome) {
      totals.leaving++;
      if (wasVisible('leaving', S.people[id]?.firstName, newLines, newTitles)) totals.visible.leaving++;
    }
    if ((b.city !== a.city || b.res !== a.res)) {
      totals.moves++;
      if (wasVisible('move', S.people[id]?.firstName, newLines, newTitles)) totals.visible.moves++;
    }
    if (b.title !== a.title && a.age >= 22) {
      totals.jobs++; // adult job change (school-stage labels excluded by age)
      if (wasVisible('job', S.people[id]?.firstName, newLines, newTitles)) totals.visible.jobs++;
    }
    // One divorce per COUPLE per turn: the spouse link cleared to a
    // still-living ex (a spouse dying is widowhood, not divorce).
    // Counted once, by the smaller id of the pair — the marital-status
    // word flips on BOTH partners, so an ungated status signal counts
    // every divorce twice (verified: 42 counted vs 22 couples).
    const lostSpouses = (b.spouses || []).filter((x) => !(a.spouses || []).includes(x));
    const divorcedByLink = lostSpouses.some((id2) => { const ex = after.people[id2]; return ex && ex.alive && id < id2; });
    if (divorcedByLink) pDivorces++;
    // One marriage per COUPLE per turn: a spouse link gained, counted
    // once by the smaller id of the pair (both partners gain the link,
    // so an ungated count doubles every wedding — verified: 136 counted
    // vs 68 couples). Parents are linked to each other once at life
    // start by the tick itself — that linking is not a wedding, so
    // father/mother never count here.
    const gainedSpouses = (a.spouses || []).filter((x) => !(b.spouses || []).includes(x));
    const marriedByLink = gainedSpouses.some((id2) => id < id2);
    if (marriedByLink && b.role !== 'father' && b.role !== 'mother') pMarriages++;
  }
  // Couple-record signals (the marriage engine's own record), keyed by
  // the partner pair so a stage change (married -> divorced) reads as a
  // divorce, not as a new marriage. A pair with no player partner = NPCs.
  const stageOf = (sig) => {
    const m = new Map();
    for (const c of sig ? sig.split('|').filter(Boolean) : []) {
      const [pair, stage] = c.split('@');
      m.set(pair, stage || '');
    }
    return m;
  };
  const cb = stageOf(before.couples), ca = stageOf(after.couples);
  let cMarriages = 0, cDivorces = 0;
  for (const [pair, stage] of ca) {
    if (pair.startsWith('player+') || pair.includes('+player')) continue;
    if (!cb.has(pair)) cMarriages++;
  }
  for (const [pair, stage] of cb) {
    if (pair.startsWith('player+') || pair.includes('+player')) continue;
    if (!ca.has(pair) || (/divorc|ended|closed/i.test(ca.get(pair) || '') && ca.get(pair) !== stage)) cDivorces++;
  }
  const marriages = Math.max(pMarriages, cMarriages);
  const divorces = Math.max(pDivorces, cDivorces);
  totals.marriages += marriages;
  totals.divorces += divorces;
  if (marriages > 0 && wasVisible('marriage', '', newLines, newTitles)) totals.visible.marriages += marriages;
  if (divorces > 0 && wasVisible('divorce', '', newLines, newTitles)) totals.visible.divorces += divorces;
}

/* ------------------------------------------------------------------ *
 * 30 lives birth -> 52 (audit method). One run feeds both the NPC     *
 * autonomy counts and the follow-up completion rate.                  *
 * ------------------------------------------------------------------ */
const LIVES = 30;
const totals = {
  births: 0, marriages: 0, divorces: 0, moves: 0, leaving: 0, jobs: 0, deaths: 0,
  visible: { births: 0, marriages: 0, divorces: 0, moves: 0, leaving: 0, jobs: 0, deaths: 0 },
  scenesSeen: 0, livesFinished: 0,
};
let parentsFiredTotal = 0, parentsCompletedTotal = 0, followupsFiredTotal = 0;
const tiers = ['poor', 'middle', 'middle', 'rich'];
for (let i = 0; i < LIVES; i++) {
  const S = createNewLifeState({
    seed: 2000 + i, country: 'egy', birthYear: 1990,
    familyTier: tiers[i % tiers.length], gender: i % 2 === 0 ? 'm' : 'f',
  });
  ensureExtendedState(S);
  let steps = 0;
  while (S.player.age < 52 && !S.gameOver && steps < 2500) {
    steps++;
    if (S.activeScene) resolveActiveSceneChoice(S, 0);
    const before = npcSnapshot(S);
    const jLen = S.journal.length;
    const titlesBefore = new Set([...S.sceneQueue.map((q) => q.title), S.activeScene?.title].filter(Boolean));
    advanceSingleTurn(S);
    const newLines = newJournalLines(S, jLen);
    const newTitles = [...S.sceneQueue.map((q) => q.title), S.activeScene?.title]
      .filter((t) => t && !titlesBefore.has(t));
    diffNpcs(before, npcSnapshot(S), S, newLines, newTitles, totals);
    if (S.activeScene) totals.scenesSeen++;
  }
  if (S.player.age >= 52) totals.livesFinished++;
  const fired = new Set(Object.keys(S.eventFiredTurns || {}));
  let parents = 0, completed = 0, followups = 0;
  for (const id of fired) {
    if (!followupsByParent.has(id)) continue;
    parents++;
    if ([...followupsByParent.get(id)].some((f) => fired.has(f))) completed++;
  }
  for (const id of fired) if (byId.get(id)?.gates?.afterEvent) followups++;
  parentsFiredTotal += parents;
  parentsCompletedTotal += completed;
  followupsFiredTotal += followups;
}
const completionRate = parentsFiredTotal ? parentsCompletedTotal / parentsFiredTotal : 0;
print(`--- NPC autonomy, ${LIVES} lives birth->52 (${totals.livesFinished} reached 52):`);
print(`    births=${totals.births} (visible ${totals.visible.births}) marriages=${totals.marriages} (visible ${totals.visible.marriages}) divorces=${totals.divorces} (visible ${totals.visible.divorces}) moves=${totals.moves} (visible ${totals.visible.moves}) leaving-home=${totals.leaving} (visible ${totals.visible.leaving}) job-changes=${totals.jobs} (visible ${totals.visible.jobs}) deaths=${totals.deaths} (visible ${totals.visible.deaths})`);
print(`    per life: births=${avg(totals.births, LIVES)} marriages=${avg(totals.marriages, LIVES)} divorces=${avg(totals.divorces, LIVES)} moves=${avg(totals.moves, LIVES)} leaving=${avg(totals.leaving, LIVES)} jobs=${avg(totals.jobs, LIVES)} deaths=${avg(totals.deaths, LIVES)} scenes=${avg(totals.scenesSeen, LIVES)}`);
print(`--- chains in play: parents fired=${parentsFiredTotal} (${avg(parentsFiredTotal, LIVES)}/life), follow-ups fired=${followupsFiredTotal} (${avg(followupsFiredTotal, LIVES)}/life), completion=${(completionRate * 100).toFixed(1)}% (audit baseline 13%)`);
check('NPC births > 0 in 30 lives', totals.births > 0, `births=${totals.births}`);
check('NPC marriages > 0 in 30 lives', totals.marriages > 0, `marriages=${totals.marriages}`);
check('NPC divorces > 0 in 30 lives', totals.divorces > 0, `divorces=${totals.divorces}`);
check('NPC moves > 0 in 30 lives', totals.moves > 0, `moves=${totals.moves}`);
check('NPC children leaving home > 0 in 30 lives', totals.leaving > 0, `leaving=${totals.leaving}`);
check('NPC job changes > 0 in 30 lives', totals.jobs > 0, `jobs=${totals.jobs}`);
check('follow-up completion rate rose above the 13% audit baseline', completionRate > 0.13, `rate=${(completionRate * 100).toFixed(1)}% parents=${parentsFiredTotal} completed=${parentsCompletedTotal}`);

/* ------------------------------------------------------------------ *
 * Chapters / goals / ambitions on the Timeline.                       *
 * ------------------------------------------------------------------ */
{
  const S = createNewLifeState({ seed: 4242, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.player.age = 30; S.year = 2020; S.month = 6; S.pacing = 'monthly';
  const text = strip(renderLifeTabHtml(S));
  print(`--- timeline sample (age 30): ${text.slice(0, 400)}...`);
  check('timeline no longer reads "<Month> Chronicle"', !/Chronicle/.test(text));
  /* v2.10 (W3) renders the chapter as a card headed by its NAME (an h2,
     no "Chapter:" prefix) with beats as ✓/○ lines, the banner label is
     the chapter name too, and the scene kicker reads
     "CHAPTER: <NAME> — A DECISION". Check the live-derived chapter name
     itself, not a label format the render never used. */
  const chapter = getCurrentChapter(S);
  check('timeline shows the named current chapter', text.includes(chapter.name), `chapter="${chapter.name}"`);
  const chapterIdx = text.indexOf(chapter.name);
  const goalsIdx = text.indexOf('Life Goals');
  const chapterRegion = chapterIdx >= 0 && goalsIdx > chapterIdx ? text.slice(chapterIdx, goalsIdx) : '';
  const beatMarks = (chapterRegion.match(/[✓○]/g) || []).length;
  check('named chapter appears with beats', beatMarks >= 2, `beat markers in chapter card=${beatMarks}`);
  const goalLabels = S.goals.map((g) => g.label); // the 5th label depends on ambition
  check('all 5 goal labels shown', goalLabels.every((l) => text.includes(l)), `labels=${JSON.stringify(goalLabels)}`);
  /* v2.10 (W3) renders each goal's stages as ✓/→/○ lines; locked ones
     carry the distinctive suffix "locked until the step before is done".
     Count the rendered stages directly via the exported evaluator too. */
  const stageStates = S.goals.map((g) => goalStageProgress(S, g));
  const stageTotal = stageStates.reduce((n, s) => n + s.length, 0);
  const stageLocks = (text.match(/locked until the step before is done/g) || []).length;
  check('each goal shows stages with live progress', stageTotal >= 15 && stageLocks >= 1, `stages=${stageTotal} locked markers rendered=${stageLocks}`);
  /* v2.10 (W3) renders the ambition as "Your ambition: <goal label> —
     <state> (<pct>%)" — the GOAL label (e.g. "Launch a Profitable
     Company Employing a Team"), not the LIFE_AMBITIONS label. */
  const ambGoal = S.goals.find((g) => g.id === 'g_ambition');
  check('ambition is displayed with progress on the Timeline', /Your ambition:/i.test(text) && !!ambGoal && text.includes(ambGoal.label) && /In progress|Achieved|Ended/.test(text), `ambition label="${ambGoal?.label}"`);
}

/* ------------------------------------------------------------------ *
 * Freeze: the world ticks while a scene stays open; the player does   *
 * not. Deterministic signal: an employed NPC's savings only move      *
 * inside the yearly autonomy tick, so 11 blocked monthly calls must   *
 * move nothing and the 12th must move savings — one NPC year per 12   *
 * blocked calls, never one per call.                                  *
 * ------------------------------------------------------------------ */
function forceSceneOpen(S, key) {
  // queueScene puts the scene straight into S.activeScene when the slot
  // is empty — it only uses the queue when a scene is already open. So
  // the probe IS the active scene after a successful queue; shifting the
  // (empty) queue would clobber it with undefined.
  const ok = queueScene(S, {
    key, title: 'Freeze probe scene', category: 'life',
    text: 'A probe scene that stays open while the world ticks.',
    choices: [{ label: 'Wait it out', effect: () => {} }],
  });
  if (!ok) return null;
  if (S.activeScene && S.activeScene.key === key) return S.activeScene;
  if (!S.activeScene) {
    const found = S.sceneQueue.find((q) => q.key === key);
    if (found) { S.sceneQueue = S.sceneQueue.filter((q) => q !== found); S.activeScene = found; return found; }
  }
  return null;
}
function adultFreezeState(seed) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.player.age = 30; S.year = 2020; S.month = 6; S.pacing = 'monthly';
  // Pin the parents to working age with real income, so the yearly tick
  // has something deterministic to move (raises + savings).
  const dad = S.people[S.relations.fatherId];
  if (dad) { dad.age = 40; dad.birthYear = 1980; dad.career.title = 'Accountant'; dad.career.monthlyIncomeLocal = 20000; dad.career.savingsLocal = 100000; }
  const mom = S.people[S.relations.motherId];
  if (mom) { mom.age = 38; mom.birthYear = 1982; mom.career.title = 'School Teacher'; mom.career.monthlyIncomeLocal = 12000; mom.career.savingsLocal = 50000; }
  return S;
}
{
  const S = adultFreezeState(777);
  const scene = forceSceneOpen(S, 'v210-freeze-probe-adult');
  check('freeze setup: probe scene forced open', !!scene && S.activeScene === scene);
  const age0 = S.player.age, year0 = S.year, month0 = S.month, turn0 = S.turn;
  const dad0 = S.people[S.relations.fatherId].career.savingsLocal;
  const mom0 = S.people[S.relations.motherId].career.savingsLocal;
  const journal0 = S.journal.length;
  let r11;
  for (let i = 0; i < 11; i++) r11 = advanceSingleTurn(S);
  const dad11 = S.people[S.relations.fatherId].career.savingsLocal;
  check('freeze: 11 blocked monthly calls bank world time but tick no NPC year', dad11 === dad0 && S.worldPendingMonths === 11, `dad savings ${dad0}->${dad11} pending=${S.worldPendingMonths}`);
  check('freeze: player clock untouched after 11 blocked calls', S.player.age === age0 && S.year === year0 && S.month === month0 && S.turn === turn0, `age=${S.player.age} year=${S.year} month=${S.month} turn=${S.turn}`);
  check('freeze: same scene still open after 11 blocked calls', S.activeScene === scene);
  check('freeze: blocked call reports paused, no world year yet', r11 && r11.pausedForScene === true && r11.worldTicked === false, JSON.stringify(r11));
  const r12 = advanceSingleTurn(S);
  const dad12 = S.people[S.relations.fatherId].career.savingsLocal;
  const mom12 = S.people[S.relations.motherId].career.savingsLocal;
  check('freeze: 12th blocked call ticks exactly one NPC year', dad12 > dad0 && mom12 > mom0 && S.worldPendingMonths === 0, `dad ${dad0}->${dad12} mom ${mom0}->${mom12} pending=${S.worldPendingMonths}`);
  check('freeze: 12th blocked call reports one world year', r12 && r12.worldTicked === true && r12.worldYears === 1, JSON.stringify(r12));
  for (let i = 0; i < 12; i++) advanceSingleTurn(S); // 24 blocked calls total
  const dad24 = S.people[S.relations.fatherId].career.savingsLocal;
  const queueGrew = S.sceneQueue.length > 0;
  const journalGrew = S.journal.length > journal0;
  print(`--- freeze after 24 blocked calls: dad savings ${dad0}->${dad24} (+${dad24 - dad0} over 2 NPC years), journal ${journal0}->${S.journal.length}, queued scenes=${S.sceneQueue.length}, pending months=${S.worldPendingMonths}`);
  check('freeze: NPC life accumulated over 24 blocked calls (2 NPC years)', dad24 > dad12 && (journalGrew || queueGrew || dad24 > dad0), `dad ${dad0}->${dad24} journal grew=${journalGrew} queue grew=${queueGrew}`);
  check('freeze: player age/year/month/turn still frozen after 24 blocked calls', S.player.age === age0 && S.year === year0 && S.month === month0 && S.turn === turn0, `age=${S.player.age} year=${S.year} month=${S.month} turn=${S.turn}`);
  check('freeze: same scene still open after 24 blocked calls', S.activeScene === scene);
  const resolved = resolveActiveSceneChoice(S, 0);
  check('freeze: open scene still answerable after 24 blocked calls', resolved && resolved.ok === true && S.activeScene !== scene);
  const turnBefore = S.turn, monthBefore = S.month, yearBefore = S.year;
  advanceSingleTurn(S);
  check('freeze: player clock advances again on the next turn after answering', S.turn === turnBefore + 1 && (S.month !== monthBefore || S.year !== yearBefore), `turn ${turnBefore}->${S.turn} month ${monthBefore}->${S.month} year ${yearBefore}->${S.year}`);
}
{
  // Childhood pacing: one blocked yearly call = one full NPC year.
  const S = createNewLifeState({ seed: 778, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  const dad = S.people[S.relations.fatherId];
  if (dad) { dad.age = 30; dad.birthYear = 1960; dad.career.title = 'Accountant'; dad.career.monthlyIncomeLocal = 20000; dad.career.savingsLocal = 100000; }
  const age0 = S.player.age, year0 = S.year;
  const dad0 = dad.career.savingsLocal;
  const scene = forceSceneOpen(S, 'v210-freeze-probe-child');
  const r = advanceSingleTurn(S);
  check('freeze (childhood): one blocked yearly call ticks one NPC year', dad.career.savingsLocal > dad0 && S.worldPendingMonths === 0, `dad ${dad0}->${dad.career.savingsLocal} pending=${S.worldPendingMonths}`);
  check('freeze (childhood): player age/year frozen', S.player.age === age0 && S.year === year0, `age=${S.player.age} year=${S.year}`);
  check('freeze (childhood): scene still open', S.activeScene === scene);
  check('freeze (childhood): blocked call reports one world year', r && r.worldTicked === true && r.worldYears === 1, JSON.stringify(r));
}

/* Regression guards: this harness does not run the shipped tests; the
   coordinator runs them on the fresh unpack. Noted here so the gap is
   visible, not silent. */
print('NOTE regression guards: tests/verify_data.mjs (DATA_OK), tests/verify_ui_renders.mjs (UI_RENDER_OK) and tests/coherence_suite.mjs (0 defects) are NOT run by this harness — run them separately.');

print(`\nTOTAL ${pass}/${pass + fail} PASS`);
if (fail) process.exit(1);
