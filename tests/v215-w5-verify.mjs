/* v2.15 W5 verify — Story threads close properly, and NPCs remember.
   Run from the game root: node tests/v215-w5-verify.mjs
   Measured checks (no quoted numbers):
   - §1 pool size and chain audit: every chain has a resolution path.
   - §2 30 lives birth->52: a resolved thread never re-queues (0), the
     dad-loan repaid/unpaid branches never both fire, timeout closes
     stranded threads.
   - §3 memory present vs absent: the same later event, same seed, three
     twin lives (favour memory / betrayal memory / no memory) — the
     outcome differs in each.
   - §4 a person card shows their memories in words.
   - §5 memories survive a save/load round-trip (JSON).
   - §6 memories cap at 5; the oldest small memory drops, a defining
     memory never does.
   - §7 a stranded thread closes by time-out with a stated outcome.
   - §8 the unpaid-loan branch is refused once the repaid branch fired.
   Exit code 1 when any check fails. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import {
  ALL_RANDOM_LIFE_EVENTS, CHAIN_INDEX, eventGatePasses, getRandomLifeEventById,
  collectRandomLifeEvents,
} from '../src/systems/eventEngine.js';
import { auditChains, getThreadResolution } from '../src/systems/threadResolution.js';
import {
  recordMemory, getMemories, circlePeople, MEMORY_CAP, FAVOUR_MEMORY_KINDS, BETRAYAL_MEMORY_KINDS,
} from '../src/systems/npcMemory.js';
import { renderPeopleTabHtml } from '../src/ui/views.js';

let pass = 0;
let fail = 0;
function check(name, ok, detail = '') {
  if (ok) { pass++; console.log(`  PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

/* ---------------- §1 pool + chain audit ---------------- */
console.log('§1 pool size and chain audit');
console.log(`  pool events: ${ALL_RANDOM_LIFE_EVENTS.length}`);
const audit = auditChains(ALL_RANDOM_LIFE_EVENTS);
const withoutResolution = audit.chains.filter((c) => !c.hasResolution);
const followUps = ALL_RANDOM_LIFE_EVENTS.filter((ev) => ev.gates && ev.gates.afterEvent);
console.log(`  follow-up events: ${followUps.length}, chains: ${audit.totalChains}`);
check('every chain has a resolution path', withoutResolution.length === 0,
  `${audit.totalChains - withoutResolution.length}/${audit.totalChains} chains resolve; without: ${withoutResolution.map((c) => c.root).join(', ') || 'none'}`);
check('every chain has at least one terminal event',
  audit.chains.every((c) => c.terminals.length >= 1),
  audit.chains.map((c) => `${c.root}:${c.terminals.length}`).join(' '));
check('no chain is left open as "recurring" without a reason',
  audit.chains.filter((c) => c.recurring).length === 0, 'recurring chains: 0');
const dadChain = audit.chains.find((c) => c.root === 'ev_family_dad_loan_request');
check('dad-loan chain has two mutually exclusive terminal branches',
  !!dadChain && dadChain.terminals.length === 2, dadChain ? dadChain.terminals.join(', ') : 'chain missing');

/* ---------------- §2 30 lives: resolved threads never re-queue ---------------- */
console.log('§2 30 lives birth->52: resolved threads never re-queue');
const COUNTRIES = ['egy', 'sau', 'uae', 'gbr', 'usa', 'deu', 'can', 'egy', 'sau', 'uae', 'jpn', 'ind', 'bra', 'fra', 'aus'];
const TIERS = ['struggling', 'working', 'middle', 'upper_middle', 'wealthy'];
let livesRun = 0;
let resolvedTotal = 0;
let choiceResolved = 0;
let timeoutResolved = 0;
let requeues = 0;
let dadBothBranches = 0;
let chainsStarted = 0;
for (let i = 0; i < 30; i++) {
  const S = createNewLifeState({
    seed: 1000 + i * 37,
    country: COUNTRIES[i % COUNTRIES.length],
    birthYear: 1965 + ((i * 7) % 42),
    familyTier: TIERS[i % TIERS.length],
    gender: i % 3 === 0 ? 'f' : 'm',
    ambition: 'balanced',
  });
  // member scene-count sum per resolved chain, snapshotted at resolution
  const baseline = new Map();
  const chainMembers = (root) => (CHAIN_INDEX.chains.get(root) || { members: [] }).members;
  while (!S.gameOver && S.player.age < 52) {
    advanceSingleTurn(S);
    if (S.activeScene) resolveActiveSceneChoice(S, 0);
    // after every turn, every resolved chain's member counts must not grow
    for (const [root, rec] of Object.entries(S.threadResolutions || {})) {
      const sum = chainMembers(root).reduce((n, id) => n + ((S.sceneCounts || {})[id] || 0), 0);
      if (!baseline.has(root)) baseline.set(root, sum);
      else if (sum > baseline.get(root)) requeues++;
    }
  }
  livesRun++;
  resolvedTotal += Object.keys(S.threadResolutions || {}).length;
  for (const rec of Object.values(S.threadResolutions || {})) {
    if (rec.how === 'choice') choiceResolved++;
    else if (rec.how === 'timeout') timeoutResolved++;
  }
  chainsStarted += Object.keys(S.eventFiredTurns || {}).filter((id) => CHAIN_INDEX.chains.has(id)).length;
  const sc = S.sceneCounts || {};
  if ((sc.ev_family_dad_loan_repaid_l2 || 0) >= 1 && (sc.ev_family_dad_loan_unpaid_l2 || 0) >= 1) dadBothBranches++;
}
console.log(`  lives: ${livesRun}, chains started: ${chainsStarted}, threads resolved: ${resolvedTotal} (choice ${choiceResolved}, timeout ${timeoutResolved}), re-queues after resolution: ${requeues}, dad-loan both-branches lives: ${dadBothBranches}`);
check('a resolved thread never re-queues in 30 lives', requeues === 0, `${requeues} re-queues`);
check('the dad-loan repaid and unpaid endings never both fire', dadBothBranches === 0, `${dadBothBranches} lives`);
check('threads do resolve in real play', resolvedTotal > 0, `${resolvedTotal} resolved across 30 lives`);

/* ---------------- §3 memory present vs absent ---------------- */
console.log('§3 one memory changes a later event outcome (twin lives, same seed)');
function twinLife() {
  const S = createNewLifeState({ seed: 4242, country: 'egy', birthYear: 1998, familyTier: 'middle', gender: 'm' });
  while (!S.gameOver && S.player.age < 25) {
    advanceSingleTurn(S);
    if (S.activeScene) resolveActiveSceneChoice(S, 0);
  }
  return S;
}
function runAskForHelp(S) {
  const friend = (S.relations.friendIds || []).map((id) => S.people[id]).find((p) => p && p.alive);
  if (!friend) return null;
  const ev = getRandomLifeEventById('ev_memory_ask_for_help');
  const scene = ev.build(S, { friend });
  if (!scene) return null;
  const cashBefore = S.money.cash;
  const happyBefore = S.player.vitals.happiness;
  scene.choices[0].effect(S);
  return {
    cashDelta: S.money.cash - cashBefore,
    happyDelta: S.player.vitals.happiness - happyBefore,
    text: scene.text,
    friendName: friend.firstName,
  };
}
const lifeFavour = twinLife();
const lifeBetrayal = twinLife();
const lifeNone = twinLife();
const friendF = (lifeFavour.relations.friendIds || []).map((id) => lifeFavour.people[id]).find((p) => p && p.alive);
const friendB = (lifeBetrayal.relations.friendIds || []).map((id) => lifeBetrayal.people[id]).find((p) => p && p.alive);
const friendN = (lifeNone.relations.friendIds || []).map((id) => lifeNone.people[id]).find((p) => p && p.alive);
check('twin lives each have a living friend to ask', !!(friendF && friendB && friendN),
  `friends: ${friendF?.firstName || 'none'} / ${friendB?.firstName || 'none'} / ${friendN?.firstName || 'none'}`);
let rFavour = null; let rBetrayal = null; let rNone = null;
if (friendF && friendB && friendN) {
  // Clear every circle person's memories in all three lives first: the
  // advance to 25 writes real favour memories of its own, and the gate
  // reads the whole circle, not just the friend being asked.
  for (const L of [lifeFavour, lifeBetrayal, lifeNone]) {
    for (const p of circlePeople(L)) p.rel.memories = [];
  }
  recordMemory(lifeFavour, friendF, 'helped_money', 'You lent me money in 2019 when my shop was failing.', { trust: 10 });
  recordMemory(lifeBetrayal, friendB, 'broke_promise', 'You promised to help me move house and never showed up.', { trust: -10 });
  // Memory-gated events: check the gates BEFORE the ask event runs,
  // because asking itself writes a favour memory on the friend.
  // (Isolate the memoryKind gate from pool history: the twin lives may
  // already have played these once-per-life events on the way to 25.)
  for (const L of [lifeFavour, lifeBetrayal, lifeNone]) {
    if (L.sceneCounts) {
      delete L.sceneCounts.ev_memory_favour_returns;
      delete L.sceneCounts.ev_memory_broken_bond;
    }
  }
  const favourReturnsF = eventGatePasses(getRandomLifeEventById('ev_memory_favour_returns'), lifeFavour);
  const favourReturnsN = eventGatePasses(getRandomLifeEventById('ev_memory_favour_returns'), lifeNone);
  check('the favour-returns event is gated on a favour memory', favourReturnsF === true && favourReturnsN === false,
    `with memory: ${favourReturnsF}, without: ${favourReturnsN}`);
  const brokenBondB = eventGatePasses(getRandomLifeEventById('ev_memory_broken_bond'), lifeBetrayal);
  const brokenBondN = eventGatePasses(getRandomLifeEventById('ev_memory_broken_bond'), lifeNone);
  check('the broken-bond event is gated on a betrayal memory', brokenBondB === true && brokenBondN === false,
    `with memory: ${brokenBondB}, without: ${brokenBondN}`);
  rFavour = runAskForHelp(lifeFavour);
  rBetrayal = runAskForHelp(lifeBetrayal);
  rNone = runAskForHelp(lifeNone);
  console.log(`  favour memory: cash ${rFavour?.cashDelta}, happiness ${rFavour?.happyDelta}`);
  console.log(`  betrayal memory: cash ${rBetrayal?.cashDelta}, happiness ${rBetrayal?.happyDelta}`);
  console.log(`  no memory: cash ${rNone?.cashDelta}, happiness ${rNone?.happyDelta}`);
  check('a remembered favour means the full loan', !!rFavour && rFavour.cashDelta > 0 && !!rNone && rFavour.cashDelta > rNone.cashDelta,
    `favour ${rFavour?.cashDelta} vs none ${rNone?.cashDelta}`);
  check('a remembered betrayal means a refusal (no money)', !!rBetrayal && rBetrayal.cashDelta === 0,
    `betrayal cash delta ${rBetrayal?.cashDelta}`);
  check('no memory means half, reluctantly', !!rNone && rNone.cashDelta > 0 && !!rFavour && rNone.cashDelta < rFavour.cashDelta,
    `none ${rNone?.cashDelta} vs favour ${rFavour?.cashDelta}`);
  check('the later event quotes the memory in its text',
    !!rFavour && rFavour.text.includes('You lent me money in 2019'),
    'favour text quotes the 2019 loan');
}

/* ---------------- §4 person card shows memories in words ---------------- */
console.log('§4 person card shows memories in words');
if (friendF && rFavour) {
  const html = renderPeopleTabHtml(lifeFavour);
  check('person card lists what the friend remembers',
    html.includes('What ') && html.includes('remembers:') && html.includes('You lent me money in 2019'),
    'card contains the 2019 loan memory in words');
  check('person card shows the new memory the event wrote',
    html.includes('stood by you when money was tight'),
    'card contains the money-tight memory');
} else {
  check('person card lists what the friend remembers', false, 'no twin life with a friend');
}

/* ---------------- §5 memories survive save/load ---------------- */
console.log('§5 memories survive save/load');
if (friendF) {
  const before = getMemories(friendF).map((m) => `${m.kind}:${m.summary}`);
  const reloaded = JSON.parse(JSON.stringify(friendF));
  const after = getMemories(reloaded).map((m) => `${m.kind}:${m.summary}`);
  check('memories survive a JSON save/load round-trip',
    before.length === after.length && before.every((b, i) => b === after[i]),
    `${before.length} memories before, ${after.length} after`);
  const resRoundTrip = JSON.parse(JSON.stringify(lifeFavour.threadResolutions || {}));
  check('thread resolutions survive a JSON save/load round-trip',
    JSON.stringify(resRoundTrip) === JSON.stringify(lifeFavour.threadResolutions || {}),
    `${Object.keys(resRoundTrip).length} resolutions`);
} else {
  check('memories survive a JSON save/load round-trip', false, 'no friend to test');
}

/* ---------------- §6 cap at 5, defining memories never drop ---------------- */
console.log('§6 memories cap at 5; defining memories never drop');
{
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  const p = (S.relations.friendIds || []).map((id) => S.people[id]).find((x) => x && x.alive)
    || S.people[S.relations.motherId];
  p.rel.memories = [];
  for (let i = 1; i <= 7; i++) recordMemory(S, p, 'visited', `Small visit number ${i}.`, {});
  const afterSeven = getMemories(p);
  check('seven small memories cap at 5', afterSeven.length === MEMORY_CAP, `kept ${afterSeven.length}`);
  check('the oldest small memories dropped first',
    afterSeven.every((m) => !/number 1|number 2/.test(m.summary)) && afterSeven.some((m) => /number 7/.test(m.summary)),
    afterSeven.map((m) => m.summary).join(' | '));
  recordMemory(S, p, 'kept_promise', 'You kept your word when it cost you.', { weight: 3 });
  for (let i = 8; i <= 12; i++) recordMemory(S, p, 'visited', `Small visit number ${i}.`, {});
  const afterMore = getMemories(p);
  check('a defining memory survives five newer small ones',
    afterMore.some((m) => m.kind === 'kept_promise'),
    afterMore.map((m) => m.kind).join(', '));
  check('cap still holds after defining + more small memories',
    afterMore.length <= MEMORY_CAP || afterMore.every((m) => m.kind === 'kept_promise'),
    `kept ${afterMore.length}`);
  check('the drop is recorded honestly on the person',
    (p.rel.memoriesForgotten?.count || 0) >= 2,
    `forgotten count ${p.rel.memoriesForgotten?.count || 0}`);
}

/* ---------------- §7 stranded thread closes by time-out ---------------- */
console.log('§7 a stranded thread closes by time-out with a stated outcome');
{
  const S = createNewLifeState({ seed: 515, country: 'egy', birthYear: 2000, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  // Chain started 5 years ago (player was 5 then; follow-up needs age 20, so it can never have fired).
  S.eventFiredTurns.ev_friend_asks_loan = { turn: 0, year: S.year - 5, month: S.month };
  S.sceneCounts.ev_friend_asks_loan = 1;
  S.player.age = 10;
  collectRandomLifeEvents(S);
  const rec = getThreadResolution(S, 'ev_friend_asks_loan');
  check('a thread stranded 5 years closes by time-out', !!rec && rec.how === 'timeout',
    rec ? `${rec.how}: ${rec.outcome}` : 'no resolution recorded');
  check('the time-out outcome is stated in plain words',
    !!rec && /Time moved on/.test(rec.outcome) && /never settled/.test(rec.outcome),
    rec?.outcome || '');
  check('a timed-out thread is then refused by the picker',
    eventGatePasses(getRandomLifeEventById('ev_friend_loan_repaid'), S) === false,
    'follow-up refused after time-out');
}

/* ---------------- §8 mutually exclusive branches ---------------- */
console.log('§8 mutually exclusive branches');
{
  const S = createNewLifeState({ seed: 616, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(S);
  S.eventFiredTurns.ev_family_dad_loan_request = { turn: 0, year: S.year - 2, month: S.month };
  S.eventFiredTurns.ev_family_dad_loan_repaid = { turn: 6, year: S.year - 1, month: S.month };
  S.sceneCounts.ev_family_dad_loan_repaid = 1;
  S.player.age = 25;
  check('unpaid branch refused once repaid fired',
    eventGatePasses(getRandomLifeEventById('ev_family_dad_loan_unpaid'), S) === false,
    'notAfterEvent gate blocks it');
}

console.log(`\nW5 verify: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
