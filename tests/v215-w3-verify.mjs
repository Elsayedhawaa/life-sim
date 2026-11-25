/* v2.15 W3 verify — Social energy + friendship decay.
   Run from the game root: node tests/v215-w3-verify.mjs
   Every check goes through the REAL verbs, the REAL monthly settlement
   (settleHouseholdMonth), the REAL yearly NPC tick
   (tickNpcAutonomyYearly) and the REAL People render
   (renderPeopleTabHtml) — no direct calls to the new modules' internals
   except where the spec's contract says so (refill idempotence is
   proved through the settlement, not by calling refill twice).
   - §1: social energy is a real budget (an action costs energy, the
     number falls by exactly the stated cost; when it is gone the game
     refuses plainly; the record survives a save/load round-trip).
   - §2: energy refills monthly through the settlement (measured, and
     twice in the same month refills nothing); a childhood year-turn
     refills it too (childhood has no monthly settlement).
   - §3: a friend ignored for 7 months is warned BEFORE anything breaks
     (drifting state, warning on the card naming what stops the drift,
     still a friend, no notice scene yet).
   - §4: a friend ignored for a year is warned first, then gets the
     notice on the next tick ("You have not spoken to X in a year", in
     words, with the name) — v2.18 W3: the notice never fires on a
     friendship that was never warned, because one yearly tick is twelve
     months of silence. Then the choice: reach out costs exactly 1
     energy and restores the friendship.
   - §5: let it go ends it (leaves the circle, the record changes, and
     a best friend lost is journalled as a real loss).
   - §6: last contact is backfilled honestly from the journal; a person
     with no journal evidence never drifts on a guess.
   - §7: all six v2.12 npc verbs still work, each costing exactly its
     stated energy (call 1, visit 3, gift 2, ask-help 4, talk 2,
     npc-interact talk_visit 3); the ask-help money path charges once,
     not twice; "never mind" costs nothing.
   - §8: the People tab states the budget and every button states its cost.
   - §9: the warning, then the notice, fire through the real yearly NPC tick.
   The three shipped tests are NOT run by this harness — run them separately. */
import { createNewLifeState, ensureExtendedState, createPerson, recordJournal } from '../src/core/schema.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { callPerson, visitPerson, openGiftScene, openAskHelpScene, openConversationScene, interactWithPerson, tickNpcAutonomyYearly } from '../src/systems/soulEngine.js';
import { socialEnergy, tickFriendshipDrift } from '../src/systems/socialEnergy.js';
import { renderPeopleTabHtml } from '../src/ui/views.js';
import fs from 'node:fs';

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

function adultLife() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm', ambition: 'balanced' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1; S.pacing = 'monthly'; S.turn = 100;
  S.player.age = 30;
  S.money.cash = 500_000;
  S.legal.residency.kind = 'citizen';
  return S;
}
function childLife() {
  const S = createNewLifeState({ seed: 778, country: 'egy', birthYear: 2016, familyTier: 'middle', gender: 'm', ambition: 'balanced' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 9; S.pacing = 'yearly'; S.turn = 5;
  S.player.age = 10;
  S.money.cash = 10_000;
  return S;
}
function makeFriend(S, { affection = 70, age = 25, savingsLocal = 0, warmth = 80, materialism = 20 } = {}) {
  const used = Object.values(S.people).map(p => p.firstName);
  const f = createPerson(S, {
    gender: 'f', age, role: 'friend', relationLabel: 'Friend',
    nationality: S.country, residenceCountry: S.country, city: S.city,
    excludeNames: used, affection, trust: 70, respect: 60,
    savingsLocal, traits: { warmth, materialism }
  });
  S.people[f.id] = f;
  S.relations.friendIds.push(f.id);
  return f;
}
/* queueScene puts a scene straight into activeScene when none is open,
   else into the queue — look in both places. */
function activateScene(S, baseId) {
  if (S.activeScene && S.activeScene.baseId === baseId) return S.activeScene;
  const idx = (S.sceneQueue || []).findIndex(q => q.baseId === baseId);
  if (idx < 0) return null;
  S.activeScene = S.sceneQueue.splice(idx, 1)[0];
  return S.activeScene;
}
function findScene(S, baseId) {
  if (S.activeScene && S.activeScene.baseId === baseId) return S.activeScene;
  return (S.sceneQueue || []).find(q => q.baseId === baseId) || null;
}

/* §1 and §2 (social-energy budget and monthly refill) retired: the user removed energy from the game, so those assertions are stale. Repeat contact is now capped per person per month (tests/v221-repeat-talk.test.js). */

/* ================= §3 — warned before it breaks ================= */
{
  const S = adultLife();
  const f = makeFriend(S, { affection: 70 });
  f.rel.lastContactTurn = S.turn - 7; delete f.rel.lastContactYear; delete f.rel.lastContactMonth; // 7 months of silence, monthly pacing
  const res = tickFriendshipDrift(S);
  check('§3 7 months silent: drift tick warns (1 warned)', res.warned === 1 && res.noticed === 0, JSON.stringify(res));
  check('§3 friend is drifting, not yet noticed', f.rel.driftState === 'drifting');
  check('§3 drifting thins affection a little (70 -> 67)', f.rel.affection === 67, String(f.rel.affection));
  check('§3 no notice scene yet at 7 months', !findScene(S, `drift_notice_${f.id}`));
  check('§3 friend is still in the circle', S.relations.friendIds.includes(f.id));
  const html = strip(renderPeopleTabHtml(S));
  check('§3 card warns in plain words, naming them', html.includes('Drifting apart') && html.includes(f.firstName), html.slice(0, 400));
  check('§3 warning names what stops the drift', html.includes('A call or a visit would stop the drift'));
  check('§3 journal says it plainly too', S.journal.some(j => j.text.includes(f.fullName) && j.text.includes('drifting apart')));
}

/* ================= §4 — a year of silence: warned first, then notice, then reach out ================= */
{
  const S = adultLife();
  const f = makeFriend(S, { affection: 70 });
  f.rel.lastContactTurn = S.turn - 13; delete f.rel.lastContactYear; delete f.rel.lastContactMonth;
  /* v2.18 W3 — the notice never fires on a friendship that was never
     warned: the first tick warns (a year of silence in one check), the
     next tick notices. */
  const first = tickFriendshipDrift(S);
  check('§4 13 months silent, first tick: warning only, no notice', first.warned === 1 && first.noticed === 0 && f.rel.driftState === 'drifting', JSON.stringify(first));
  check('§4 no notice scene yet after the warning', !findScene(S, `drift_notice_${f.id}`));
  const res = tickFriendshipDrift(S);
  check('§4 13 months silent, second tick: notice fires (1 noticed)', res.noticed === 1, JSON.stringify(res));
  check('§4 state is noticed, still alive', f.rel.driftState === 'noticed' && f.alive === true);
  const scene = findScene(S, `drift_notice_${f.id}`);
  check('§4 notice scene exists', !!scene);
  check('§4 notice title names the friend (current wording: It has been a while)',
    !!scene && scene.title === `It has been a while: ${f.firstName}`, scene ? scene.title : 'none');
  check('§4 notice text names them in full', !!scene && scene.text.includes(f.fullName), scene ? scene.text : 'none');
  check('§4 notice offers reach out, keep the door open, let go (3 choices, since 6362cef)',
    !!scene && scene.choices.length === 3 && /Reach out now/.test(scene.choices[0].label) && /Keep the door open/.test(scene.choices[1].label) && /Let it go/.test(scene.choices[2].label),
    scene ? scene.choices.map(c => c.label).join(' | ') : 'none');
  /* retired: energy removed */
  check('§4 journal carries the notice in plain words',
    S.journal.some(j => j.text.includes(f.fullName) && j.text.includes('in a year')));
  /* Reach out: costs exactly 1, restores the friendship. */
  activateScene(S, `drift_notice_${f.id}`);
  const eBefore = socialEnergy(S).energy;
  const affBefore = f.rel.affection;
  const r = resolveActiveSceneChoice(S, 0);
  check('§4 reach-out resolves', r.ok === true);
  /* retired: energy removed */
  check('§4 reach-out restores affection (70 -> 82)', f.rel.affection === affBefore + 12,
    `${affBefore} -> ${f.rel.affection}`);
  check('§4 reach-out clears the drift', f.rel.driftState === 'none');
  check('§4 reach-out stamps a real contact', f.rel.lastContactTurn === S.turn);
  check('§4 reach-out keeps them a friend', S.relations.friendIds.includes(f.id));
  check('§4 reach-out is journalled as alive again',
    S.journal.some(j => j.text.includes(f.fullName) && j.text.includes('friendship is alive again')));
  /* Reach out with no energy left: plain refusal, friendship still hanging. */
  const S2 = adultLife();
  const g = makeFriend(S2, { affection: 70 });
  g.rel.lastContactTurn = S2.turn - 13;
  tickFriendshipDrift(S2); // warning first (v2.18 W3)
  tickFriendshipDrift(S2); // then the notice
  socialEnergy(S2); // initialise the budget record, then drain it
  S2.social.energy = 0;
  activateScene(S2, `drift_notice_${g.id}`);
  resolveActiveSceneChoice(S2, 0);
  /* retired: energy removed */
  check('§4 no energy: still a friend, can try again next month', S2.relations.friendIds.includes(g.id));
  /* retired: energy removed */
}

/* ================= §5 — let it go ends it ================= */
{
  const S = adultLife();
  const f = makeFriend(S, { affection: 85 }); // a best friend
  f.rel.lastContactTurn = S.turn - 14; delete f.rel.lastContactYear; delete f.rel.lastContactMonth;
  tickFriendshipDrift(S); // warning first (v2.18 W3)
  tickFriendshipDrift(S); // then the notice
  activateScene(S, `drift_notice_${f.id}`);
  const r = resolveActiveSceneChoice(S, 2); // Let it go (third choice since 6362cef)
  check('§5 let-go resolves', r.ok === true);
  check('§5 let-go removes them from the circle', !S.relations.friendIds.includes(f.id));
  check('§5 let-go changes the record (drifted, driftedAway, year)',
    f.rel.driftState === 'drifted' && f.rel.driftedAway === true && f.rel.driftedYear === S.year,
    JSON.stringify({ state: f.rel.driftState, away: f.rel.driftedAway, year: f.rel.driftedYear }));
  check('§5 let-go collapses affection (85 -> 8)', f.rel.affection === 8, String(f.rel.affection));
  check('§5 a best friend lost is journalled as a real loss',
    S.journal.some(j => j.text.includes(f.fullName) && j.text.includes('closest friends') && j.text.includes('real loss')),
    (S.journal[0] || {}).text || '');
  /* The drift tick never re-fires for someone already drifted. */
  const res = tickFriendshipDrift(S);
  check('§5 drifted friend is never noticed again', res.noticed === 0 && !findScene(S, `drift_notice_${f.id}`));
}

/* ================= §6 — honest backfill ================= */
{
  const S = adultLife();
  const f = makeFriend(S, { affection: 70 });
  recordJournal(S, `You called ${f.fullName} to catch up properly.`, 'relationship');
  S.journal[0].turn = S.turn - 13; delete S.journal[0].year; delete S.journal[0].month; // the journal says the call was 13 months ago
  delete f.rel.lastContactTurn; delete f.rel.lastContactYear; delete f.rel.lastContactMonth; // an old record with no last-contact field
  tickFriendshipDrift(S);
  check('§6 backfill uses the journal turn, not an invented one (13 months ago)',
    f.rel.lastContactTurn === S.turn - 13, String(f.rel.lastContactTurn));
  check('§6 backfilled silence warns first (v2.18 W3), no notice yet', f.rel.driftState === 'drifting' && !findScene(S, `drift_notice_${f.id}`));
  tickFriendshipDrift(S);
  check('§6 backfilled silence fires the notice on the next tick', f.rel.driftState === 'noticed');
  /* No journal evidence at all: never drift on a guess. */
  const S2 = adultLife();
  const g = makeFriend(S2, { affection: 70 });
  delete g.rel.lastContactTurn; delete g.rel.lastContactYear; delete g.rel.lastContactMonth;
  const res2 = tickFriendshipDrift(S2);
  check('§6 no evidence: marked unknown, never drifted', g.rel.lastContactUnknown === true && g.rel.driftState !== 'noticed' && g.rel.driftState !== 'drifting',
    JSON.stringify({ unknown: g.rel.lastContactUnknown, state: g.rel.driftState }));
  check('§6 no evidence: no notice scene', !findScene(S2, `drift_notice_${g.id}`) && res2.noticed === 0);
}

/* ================= §7 — all six verbs still work, at the stated cost ================= */
{
  const S = adultLife();
  const f = makeFriend(S, { affection: 75, savingsLocal: 1_000_000 });
  const e = () => socialEnergy(S).energy;
  check('§7 verbs start at 10', e() === 10);
  const rCall = callPerson(S, f.id);
  check('§7 npc-call works', rCall.ok === true, rCall.msg || '');
  /* retired: energy removed */
  const rVisit = visitPerson(S, f.id);
  check('§7 npc-visit works', rVisit.ok === true, rVisit.msg || '');
  /* retired: energy removed */
  const rGift = openGiftScene(S, f.id);
  check('§7 npc-gift opens', rGift.ok === true, rGift.msg || '');
  /* retired: energy removed */
  resolveActiveSceneChoice(S, 0);
  /* retired: energy removed */
  const rHelp = openAskHelpScene(S, f.id);
  check('§7 npc-ask-help opens', rHelp.ok === true, rHelp.msg || '');
  resolveActiveSceneChoice(S, 1); // advice, not money
  /* retired: energy removed */
  const rTalk = openConversationScene(S, f.id);
  /* retired: energy removed */
  /* The money path charges once, not twice (scene 4 + inner call 0). */
  const S2 = adultLife();
  const g = makeFriend(S2, { affection: 75, savingsLocal: 1_000_000 });
  openAskHelpScene(S2, g.id);
  resolveActiveSceneChoice(S2, 0); // ask for money
  /* retired: energy removed */
  /* "Never mind" costs nothing. */
  const S3 = adultLife();
  const h = makeFriend(S3, { affection: 75, savingsLocal: 1_000_000 });
  openAskHelpScene(S3, h.id);
  resolveActiveSceneChoice(S3, 2); // never mind
  check('§7 ask-help "never mind" costs 0 (stays 10)', socialEnergy(S3).energy === 10,
    String(socialEnergy(S3).energy));
  /* Refill, then talk + the old npc-interact verb. */
  S.month = 2;
  settleHouseholdMonth(S);
  check('§7 refill after the verbs (0 -> 10)', e() === 10, String(e()));
  const rTalk2 = openConversationScene(S, f.id);
  /* retired: energy removed */
  resolveActiveSceneChoice(S, 0); // share news
  /* retired: energy removed */
  const rInteract = interactWithPerson(S, f.id, 'talk_visit');
  check('§7 npc-interact talk_visit works', rInteract.ok === true, rInteract.msg || '');
  /* retired: energy removed */
  /* Any contact stops a drift. */
  const S4 = adultLife();
  const k = makeFriend(S4, { affection: 70 });
  k.rel.lastContactTurn = S4.turn - 7; delete k.rel.lastContactYear; delete k.rel.lastContactMonth;
  tickFriendshipDrift(S4);
  check('§7 contact test: drifting first', k.rel.driftState === 'drifting');
  callPerson(S4, k.id);
  check('§7 a call stops the drift', k.rel.driftState === 'none' && k.rel.lastContactTurn === S4.turn);
}

/* ================= §8 — the screen states it ================= */
{
  const S = adultLife();
  makeFriend(S);
  const html = strip(renderPeopleTabHtml(S));
  /* retired: energy removed */
  /* retired: energy removed */
  /* retired: energy removed */
  /* retired: energy removed */
  /* retired: energy removed */
  /* retired: energy removed */
  /* retired: energy removed */
  /* retired: energy removed */
}

/* ================= §9 — wired into the real yearly tick ================= */
{
  const S = adultLife();
  const f = makeFriend(S, { affection: 70 });
  f.rel.lastContactTurn = S.turn - 13; delete f.rel.lastContactYear; delete f.rel.lastContactMonth;
  tickNpcAutonomyYearly(S);
  check('§9 yearly NPC tick warns first (v2.18 W3), no notice yet', f.rel.driftState === 'drifting' && !findScene(S, `drift_notice_${f.id}`));
  tickNpcAutonomyYearly(S);
  check('§9 yearly NPC tick fires the drift notice on the next tick', !!findScene(S, `drift_notice_${f.id}`));
  check('§9 yearly NPC tick marks them noticed', f.rel.driftState === 'noticed');
  /* And the new files exist, with the anchor markers on every shared edit. */
  check('§9 new system file exists', fs.existsSync('src/systems/socialEnergy.js'));
  check('§9 new UI file exists', fs.existsSync('src/ui/socialEnergy.js'));
  for (const file of ['src/systems/soulEngine.js', 'src/systems/economyEngine.js', 'src/core/gameLoop.js', 'src/ui/views.js']) {
    const src = fs.readFileSync(file, 'utf8');
    check(`§9 marker /* v2.15 W3 */ present in ${file}`, src.includes('/* v2.15 W3 */'));
  }
  check('§9 no business file touched', (() => {
    const touched = ['src/systems/businessEngine.js', 'src/systems/businessManager.js', 'src/systems/businessDecisions.js',
      'src/systems/businessMonthly.js', 'src/systems/businessCapacity.js', 'src/systems/businessExits.js',
      'src/systems/businessAcquisitions.js', 'src/systems/businessBranches.js', 'src/systems/businessStaff.js',
      'src/systems/businessLoans.js', 'src/systems/businessPremises.js', 'src/systems/businessLegacy.js'];
    return touched.every(f => !fs.readFileSync(f, 'utf8').includes('v2.15 W3'));
  })());
}

console.log(`\n==== v215-w3-verify: ${pass} passed, ${fail} failed ====`);
if (fail) { console.log('FAILURES:', failures.join(', ')); process.exit(1); }
