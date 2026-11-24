import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState, createPerson } from '../src/core/schema.js';
import '../src/systems/eventEngine.js';
import { EVENTS_RELATIVE_ILL, EVENTS_CONSEQUENCES, illRelative } from '../src/data/eventsConsequences.js';
function setup() { const s = createNewLifeState({ country: 'gbr', seed: 612 }); ensureExtendedState(s); s.year = 2040; s.month = 3; s.player.age = 40; return s; }
const add = (s, role, age, list) => { const p = createPerson(s, { role, age, nationality: 'gbr', residenceCountry: 'gbr' }); s.people[p.id] = p; list.push(p.id); return p; };
assert.equal(EVENTS_RELATIVE_ILL.length, 5);
for (const ev of EVENTS_RELATIVE_ILL) { assert(ev.gates.relativeIll && ev.gates.relativeIll.role && ev.gates.relativeIll.minMonths === 1, ev.id + ' declares the agreed gate'); assert(!EVENTS_CONSEQUENCES.includes(ev), 'not registered until the gate exists'); }
const by = Object.fromEntries(EVENTS_RELATIVE_ILL.map((e) => [e.gates.relativeIll.role, e]));
// Recorded illness, earlier year: "has been living with ... since", never "diagnosed this year".
{ const s = setup(); const sib = add(s, 'sibling', 33, s.relations.siblingIds); sib.illness = { kind: 'cancer', sinceYear: 2038, src: 'young' };
  const sc = by.sibling.build(s, {}); assert(/Your sibling, .+, has been living with cancer since 2038\./.test(sc.text)); assert(!/diagnosed/.test(sc.text)); assert.equal(sc.eventParticipantIds.sib, sib.id);
  assert.equal(sc.choices.length, 3);
  const aff = sib.rel.affection; sc.choices[0].effect(s); assert.notEqual(sib.rel.affection, aff, 'visiting changes the relationship'); assert(s.journal.some((j) => /spent time with your sibling/.test(JSON.stringify(j))));
  const t = sib.rel.trust; sc.choices[2].effect(s); assert(sib.rel.trust < t); }
// Diagnosed this year says so, from the record.
{ const s = setup(); const p = s.people[s.relations.motherId]; p.illness = { kind: 'heart disease', sinceYear: s.year, src: 'young' }; assert(/Your mother, .+, was diagnosed with heart disease this year\./.test(by.mother.build(s, {}).text)); }
// Uses the cast participant, not just the first listed relative.
{ const s = setup(); const a = add(s, 'sibling', 30, s.relations.siblingIds), b = add(s, 'sibling', 31, s.relations.siblingIds); b.illness = { kind: 'a stroke', sinceYear: 2039 };
  assert.equal(illRelative(s, 'sibling', { sib: b }).id, b.id); assert.equal(illRelative(s, 'sibling', {}).id, b.id); assert.notEqual(by.sibling.build(s, { sib: b }).eventParticipantIds.sib, a.id); }
// No ill relative, a dead one, or none of that role: no scene is built.
{ const s = setup(); assert.equal(by.father.build(s, {}), null); const f = s.people[s.relations.fatherId]; f.illness = { kind: 'cancer', sinceYear: 2039 }; f.alive = false; assert.equal(by.father.build(s, {}), null); assert.equal(by.spouse.build(s, {}), null); }
// Choice on a person who has since died does nothing and does not throw.
{ const s = setup(); const c = add(s, 'child', 25, s.relations.childIds); c.illness = { kind: 'cancer', sinceYear: 2039 }; const sc = by.child.build(s, {}); c.alive = false; assert.doesNotThrow(() => sc.choices[0].effect(s)); }
console.log('relative illness scenes read the recorded illness and participant, and are not registered until the gate exists');
