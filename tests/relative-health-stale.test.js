import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState, createPerson, queueScene } from '../src/core/schema.js';
import { resolveEventCtx, eventGatePasses } from '../src/systems/eventEngine.js';
import { advanceSingleTurn } from '../src/core/gameLoop.js';
import { EVENTS_RELATIVE_ILL } from '../src/data/eventsConsequences.js';
import { restoreMajorScene } from '../src/systems/majorLifeEvents.js';

const ev = EVENTS_RELATIVE_ILL.find((e) => e.gates.relativeIll.role === 'sibling');
function setup(seed) {
  const s = createNewLifeState({ country: 'gbr', seed }); ensureExtendedState(s); s.year = 2040; s.month = 3; s.player.age = 40; s.pacing = 'monthly';
  const p = createPerson(s, { role: 'sibling', age: 38, nationality: 'gbr', residenceCountry: 'gbr' }); p.firstName = 'Daniel'; s.people[p.id] = p; s.relations.siblingIds.push(p.id);
  p.illness = { kind: 'cancer', sinceYear: 2039, src: 'young' };
  return { s, p };
}
function queueFollowUp(s, p) {
  const sc = ev.build(s, resolveEventCtx(s, ev)); assert.ok(sc, 'follow-up built'); sc.eventId = ev.id; sc.eventParticipantIds = { sib: p.id }; sc.urgent = true;
  assert.ok(queueScene(s, sc, true)); return sc;
}
const shown = (s) => [s.activeScene, ...s.sceneQueue].filter((x) => x && x.eventId === ev.id);

// Queued follow-up, person dies before view: the next turn never shows it.
{ const { s, p } = setup(1); queueFollowUp(s, p); p.alive = false;
  advanceSingleTurn(s); assert.equal(shown(s).length, 0, 'follow-up for a dead relative is not shown'); }
// Queued follow-up, person recovers (illness cleared) before view: not shown.
{ const { s, p } = setup(2); queueFollowUp(s, p); p.illness = null;
  advanceSingleTurn(s); assert.equal(shown(s).length, 0, 'follow-up for a recovered relative is not shown'); }
// Still ill and alive: gate agrees and the follow-up stays.
{ const { s, p } = setup(3); assert.equal(eventGatePasses(ev, s, { ignoreHistory: true }), true); queueFollowUp(s, p); assert.equal(shown(s).length, 1); }
// A queued diagnosis/injury card is explicit past tense and survives the person's death or recovery without claiming a current state.
for (const [kind, title, text] of [
  ['relative_illness', 'Daniel Has Been Diagnosed', 'Your sibling, Daniel, has been diagnosed with cancer.'],
  ['relative_injury', 'Daniel Was Hurt', 'Your sibling, Daniel, was hurt in an accident.'],
  ['relative_illness_recovered', 'Daniel Has Recovered', 'Your sibling, Daniel, has recovered from cancer.']]) {
  const { s, p } = setup(4); p.alive = false;
  const r = restoreMajorScene(s, JSON.parse(JSON.stringify({ key: 'k_' + kind, title, text, major: true, majorKind: kind })));
  assert.ok(r && r.text === text, kind + ' card keeps its recorded words after reload');
  assert.ok(!/\b(is|are) (ill|sick|unwell|injured|hurt)\b/.test(text), kind + ' makes no present-tense state claim');
}
console.log('relative health follow-ups are dropped when stale; cards stay in the past tense');
