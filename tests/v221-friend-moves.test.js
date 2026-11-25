import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState, createPerson } from '../src/core/schema.js';
import { getRandomLifeEventById, eventGatePasses, resolveEventCtx } from '../src/systems/eventEngine.js';
import { ensureSocialCast } from '../src/systems/soulEngine.js';
import { monthsSinceContact } from '../src/systems/socialEnergy.js';
const ev = getRandomLifeEventById('ev_school_friend_moves');
assert.ok(ev, 'event exists');
function life() {
  const s = createNewLifeState({ country: 'egy', seed: 31 });
  ensureExtendedState(s);
  s.player.age = 7; ensureSocialCast(s);
  for (const id of s.relations.friendIds) s.people[id].age += 5;
  s.player.age = 12;
  s.education = s.education || {}; s.education.stage = 'middle';
  return s;
}
const s = life();
const friends = (s.relations.friendIds || []).map(id => s.people[id]).filter(Boolean);
// Make one eligible best friend and one adult friend; the adult must never be cast.
const near = friends.find(p => p.rel.affection >= 70);
const adult = createPerson(s, { role: 'friend', age: 41, nationality: s.country, residenceCountry: s.country, city: s.city, affection: 99 });
s.people[adult.id] = adult; s.relations.friendIds.push(adult.id);
near.age = 12; near.alive = true; near.residenceCountry = s.country; near.rel.affection = 80; near.city = s.city;
const ctx = resolveEventCtx(s, ev);
assert.equal(ctx.friend?.id, near.id, 'casts the close same-age friend, not the adult');
const scene = ev.build(s, ctx);
assert.ok(scene.title.includes(near.firstName) && scene.text.includes(near.firstName), 'names the real friend');
const before = near.city;
scene.choices[1].effect(s);
assert.notEqual(s.people[near.id].city, before, 'friend really moved to another city');
assert.ok(s.people[near.id].rel.memories.length > 0, 'a memory is recorded on that person');
assert.equal(monthsSinceContact(s, s.people[near.id]), 0, 'last week together counts as real contact');
const rt = JSON.parse(JSON.stringify(s));
assert.equal(rt.people[near.id].city, s.people[near.id].city, 'move persists in the save');
// No eligible friend: no event.
const s2 = life();
for (const id of s2.relations.friendIds || []) { s2.people[id].age = 40; }
assert.equal(resolveEventCtx(s2, ev).friend, null);
assert.equal(ev.build(s2, resolveEventCtx(s2, ev)), null, 'does not invent a best friend');
console.log('friend-moves OK');
