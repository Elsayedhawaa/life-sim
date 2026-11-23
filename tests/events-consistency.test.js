import assert from 'node:assert/strict';
import { createNewLifeState, createPerson } from '../src/core/schema.js';
import { ALL_RANDOM_LIFE_EVENTS, eventGatePasses, resolveEventCtx, isRandomLifeSceneCurrent, pickRandomLifeEvent } from '../src/systems/eventEngine.js';
import { EVENTS_LIVED_LIFE } from '../src/data/eventsLivedLife.js';
import { resolveActiveSceneChoice } from '../src/core/gameLoop.js';
function state(country = 'egy') {
  const S = createNewLifeState({ country, birthYear: 1998, seed: 72 });
  S.player.age = 25; S.year = 2023; S.month = 6; S.pacing = 'monthly';
  S.education.stage = 'completed'; S.education.degrees = ['business'];
  S.career.employed = false; S.career.job = null;
  for (const [role, list] of [['friend', 'friendIds'], ['spouse', 'spouseIds'], ['sibling', 'siblingIds'], ['child', 'childIds']]) {
    const person = createPerson(S, { role, age: 25 });
    S.people[person.id] = person; S.relations[list] = [person.id];
  }
  return S;
}
let checks = 0;
function ok(value, note) { assert.ok(value, note); checks++; }
const S = state();
const dad = S.people[S.relations.fatherId];
const mom = S.people[S.relations.motherId];
const fatherEvents = ALL_RANDOM_LIFE_EVENTS.filter(e => e.gates?.requiredPeople?.includes('dad'));
ok(fatherEvents.length > 10, 'legacy father events have explicit cast gates');
dad.alive = false;
ok(resolveEventCtx(S).dad === null, 'dead father absent from live context');
for (const e of fatherEvents) ok(!eventGatePasses(e, S), `${e.id} blocked after father death`);
const grief = EVENTS_LIVED_LIFE.find(e => e.id === 'ev_lived_grief_dad');
ok(eventGatePasses(grief, S), 'grief available after father death');
dad.alive = true;
ok(!eventGatePasses(grief, S), 'grief blocked while father alive');
S.relations.siblingIds = [];
for (const e of ALL_RANDOM_LIFE_EVENTS.filter(e => e.gates?.requiredPeople?.includes('sib'))) ok(!eventGatePasses(e, S), `${e.id} blocked for only child`);
S.relations.friendIds = []; S.relations.spouseIds = []; S.relations.partnerId = null;
for (const e of ALL_RANDOM_LIFE_EVENTS.filter(e => e.gates?.requiredPeople?.some(r => ['friend','spouse'].includes(r)))) ok(!eventGatePasses(e, S), `${e.id} blocked without relevant cast`);
const tea = EVENTS_LIVED_LIFE.find(e => e.id === 'ev_lived_mom_tea');
const scene = { ...tea.build(S, resolveEventCtx(S)), eventId: tea.id };
S.sceneCounts[tea.id] = 1;
ok(isRandomLifeSceneCurrent(scene, S), 'already queued scene not rejected merely because seen');
mom.alive = false;
ok(!isRandomLifeSceneCurrent(scene, S), 'queued scene invalidated when mother dies');
S.activeScene = scene;
const affection = mom.rel.affection;
ok(resolveActiveSceneChoice(S, 0).ok === false, 'stale choice cannot execute');
ok(mom.rel.affection === affection, 'stale choice cannot alter dead parent relationship');
const hunt = EVENTS_LIVED_LIFE.find(e => e.id === 'ev_lived_inbox_silence');
ok(eventGatePasses(hunt, S), 'unemployed graduate eligible');
S.career.employed = true; S.career.job = {};
ok(!eventGatePasses(hunt, S), 'employed player not given unemployed scene');
S.career.employed = false; S.career.job = null; S.year = 1980;
ok(!eventGatePasses(hunt, S), 'online job story blocked before its era');
const follow = EVENTS_LIVED_LIFE.find(e => e.id === 'ev_lived_interview_after');
S.year = 2023;
ok(!eventGatePasses(follow, S), 'follow-up requires root');
S.eventFiredTurns.ev_lived_interview_practice = { year: 2023, month: 6, turn: 1 };
ok(!eventGatePasses(follow, S), 'follow-up waits one month');
S.month = 7; ok(eventGatePasses(follow, S), 'follow-up eligible after delay');
for (const country of ['egy','usa','sau','uae','gbr','deu','can','aus','fra','jpn','ita','bra','ind']) {
  for (const source of EVENTS_LIVED_LIFE) {
    const st = state(country);
    if (source.gates.deceasedParent) st.people[st.relations[source.gates.deceasedParent === 'dad' ? 'fatherId' : 'motherId']].alive = false;
    if (source.gates.hasJob) { st.career.employed = true; st.career.job = {}; }
    if (Array.isArray(source.gates.education)) st.education.stage = 'high';
    if (source.gates.abroad) st.homeCountry = country === 'usa' ? 'egy' : 'usa';
    if (source.gates.afterEvent) st.eventFiredTurns[source.gates.afterEvent] = { year: 2022, month: 1, turn: 1 };
    const ctx = resolveEventCtx(st);
    if (!eventGatePasses(source, st)) continue;
    for (let i = 0; i < source.build(st, ctx).choices.length; i++) {
      const fresh = structuredClone(st); const sc = source.build(fresh, resolveEventCtx(fresh));
      ok(sc.title && sc.text && !/undefined|NaN/.test(sc.text), source.id+' valid prose');
      const beforeCash = fresh.money.cash; const beforeEntries = fresh.journal.length;
      sc.choices[i].effect(fresh);
      ok(fresh.journal.length > beforeEntries, source.id+' outcome recorded');
      ok(fresh.money.cash === beforeCash, source.id+' no invented cash');
      ok(Object.values(fresh.player.vitals).filter(v => typeof v === 'number').every(Number.isFinite), source.id+' finite vitals');
    }
  }
}
ok(new Set(ALL_RANDOM_LIFE_EVENTS.map(e=>e.id)).size === ALL_RANDOM_LIFE_EVENTS.length, 'unique event ids');
for (const country of ['egy','usa','sau','uae','gbr','deu','can','aus','fra','jpn','ita','bra','ind']) {
  const st = state(country);
  st.people[st.relations.fatherId].alive = false;
  for (let i=0; i<30; i++) {
    const sc = pickRandomLifeEvent(st);
    ok(sc && sc.choices.length > 0, 'seeded picker returns playable scene');
    ok(!sc.eventParticipantIds?.dad, 'picker does not bind dead father');
    ok(isRandomLifeSceneCurrent(sc, st), 'fresh scene passes validity check');
  }
}
const bound = state();
const original = bound.relations.friendIds[0];
const newer = createPerson(bound, {role:'friend',age:25}); bound.people[newer.id]=newer;
bound.relations.friendIds.push(newer.id);
bound.people[original].alive=false;
ok(!isRandomLifeSceneCurrent({eventId:'ev_lived_friend_walk',eventParticipantIds:{friend:original}},bound),'new friend cannot replace dead scene participant');
console.log(`Passed ${checks} event consistency assertions, including all 13 countries.`);
