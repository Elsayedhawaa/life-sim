/* ============================================================================
   World Life 2.0 — v2.15 W5 NPC Memory (npcMemory.js)
   One memory store, on the person record: person.rel.memories (created by
   createPerson in src/core/schema.js). Nothing here invents a second store.

   A memory is a real record, not flavour: later events and dialogue read
   this array (see src/data/eventsMemory.js and generateContextualLine in
   soulEngine.js). A person keeps at most 5 memories. When a sixth arrives
   the oldest SMALL memory is forgotten — a defining memory (a broken or
   kept promise, a betrayal, someone standing by you in a crisis) is never
   dropped, however old it is. The drop is honest: the count and the last
   forgotten summary are kept on person.rel.memoriesForgotten, and the
   person card says so in plain words.
   ========================================================================== */

import { nextId } from '../core/schema.js';

export const MEMORY_CAP = 5;

/* Defining memories are never forgotten. A memory also counts as defining
   when it carries weight 3 or more (a kept promise weighs 3). */
export const DEFINING_MEMORY_KINDS = new Set([
  'broke_promise',
  'kept_promise',
  'betrayed',
  'supported_crisis',
]);

/* Kinds a later event treats as "this person remembers a favour". */
export const FAVOUR_MEMORY_KINDS = ['helped_money', 'gift', 'supported_crisis', 'kept_promise'];
/* Kinds a later event treats as "this person remembers being let down". */
export const BETRAYAL_MEMORY_KINDS = ['refused_help', 'broke_promise', 'betrayed', 'insulted'];

function clampNum(v, lo = 0, hi = 100) {
  const n = Number(v);
  if (!Number.isFinite(n)) return lo;
  return Math.max(lo, Math.min(hi, n));
}

/* The one memory list, wherever it lives on the record. */
export function getMemories(person) {
  if (!person) return [];
  if (Array.isArray(person.rel?.memories)) return person.rel.memories;
  if (Array.isArray(person.memories)) return person.memories;
  return [];
}

export function isDefiningMemory(mem) {
  if (!mem) return false;
  if (DEFINING_MEMORY_KINDS.has(mem.kind)) return true;
  return (Number(mem.weight) || 1) >= 3;
}

/* Trim a person's memories to MEMORY_CAP, dropping the oldest non-defining
   memory first. Defining memories are never dropped. Returns the dropped
   memories (oldest first); the drop is recorded on the record so the
   person card can say, honestly, that small things were forgotten. */
export function pruneMemories(person) {
  const mems = getMemories(person);
  if (!person || !person.rel || mems.length <= MEMORY_CAP) return [];
  const dropped = [];
  while (mems.length > MEMORY_CAP) {
    /* Memories are stored newest-first, so the oldest small memory is
       the LAST non-defining entry — never the newest, never a defining
       one. */
    let idx = -1;
    for (let i = mems.length - 1; i >= 0; i--) {
      if (!isDefiningMemory(mems[i])) { idx = i; break; }
    }
    if (idx === -1) break; // every memory left is defining: keep them all
    dropped.push(mems.splice(idx, 1)[0]);
  }
  if (dropped.length) {
    const forgotten = person.rel.memoriesForgotten || { count: 0, lastSummary: '' };
    forgotten.count += dropped.length;
    forgotten.lastSummary = dropped[dropped.length - 1].summary || '';
    person.rel.memoriesForgotten = forgotten;
  }
  return dropped;
}

/* Write a memory the way rememberDeed does (same record shape), then cap
   it at 5. Returns the memory written, or null when there is no person. */
export function recordMemory(S, person, kind, summary, impact = {}) {
  if (!person || !person.rel) return null;
  if (!Array.isArray(person.rel.memories)) person.rel.memories = [];
  const mem = {
    id: nextId(S, 'mem'),
    year: S.year,
    month: S.month,
    turn: S.turn,
    kind,
    summary,
    weight: impact.weight || 1,
  };
  person.rel.memories.unshift(mem);
  if (impact.affection) person.rel.affection = clampNum(person.rel.affection + impact.affection);
  if (impact.respect) person.rel.respect = clampNum(person.rel.respect + impact.respect);
  if (impact.trust) person.rel.trust = clampNum(person.rel.trust + impact.trust);
  if (impact.resentment != null) person.rel.resentment = clampNum(person.rel.resentment + impact.resentment);
  pruneMemories(person);
  return mem;
}

export function hasMemoryKind(person, kinds) {
  const list = Array.isArray(kinds) ? kinds : [kinds];
  return getMemories(person).some((m) => list.includes(m.kind));
}

export function findMemory(person, kinds) {
  const list = Array.isArray(kinds) ? kinds : [kinds];
  return getMemories(person).find((m) => list.includes(m.kind)) || null;
}

/* Every living person in the player's circle, in the order the game
   lists them (spouse, partner, children, parents, siblings, friends). */
export function circlePeople(S) {
  if (!S || !S.people) return [];
  const rel = S.relations || {};
  const ids = [
    ...(rel.spouseIds || []),
    ...(rel.partnerId ? [rel.partnerId] : []),
    ...(rel.childIds || []),
    ...(rel.fatherId ? [rel.fatherId] : []),
    ...(rel.motherId ? [rel.motherId] : []),
    ...(rel.siblingIds || []),
    ...(rel.friendIds || []),
  ];
  const seen = new Set();
  const out = [];
  for (const id of ids) {
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const p = S.people[id];
    if (p && p.alive) out.push(p);
  }
  return out;
}

export function findPeopleWithMemory(S, kinds) {
  return circlePeople(S).filter((p) => hasMemoryKind(p, kinds));
}

/* Plain-words reason a relationship is breaking, naming the memory or
   the neglect — never just a number going down. */
export function breakReason(S, person) {
  if (!person) return 'The relationship faded and neither of you said why.';
  const betrayal = findMemory(person, BETRAYAL_MEMORY_KINDS);
  if (betrayal) {
    return `${person.firstName} still remembers: ${betrayal.summary} That is why the trust is gone.`;
  }
  const lastContact = Number(person.rel?.lastContactTurn ?? S.turn);
  const monthsQuiet = Math.max(0, Math.round(S.turn - lastContact));
  if (monthsQuiet >= 12) {
    return `You have not spoken to ${person.firstName} in ${monthsQuiet} months. The silence did the damage, not one row.`;
  }
  if ((person.rel?.resentment || 0) >= 40) {
    return `${person.firstName} has been carrying resentment for a long time, and it finally outweighed the good years.`;
  }
  return `${person.firstName} drifted away, and neither of you reached out in time.`;
}
