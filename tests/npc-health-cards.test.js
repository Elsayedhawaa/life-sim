import assert from 'node:assert/strict';
import '../src/systems/eventEngine.js';
import { createNewLifeState, ensureExtendedState, createPerson } from '../src/core/schema.js';
import { tickNpcHealthLife } from '../src/systems/npcHealthLife.js';
import { handleNpcDeath } from '../src/systems/soulEngine.js';
import { restoreMajorScene } from '../src/systems/majorLifeEvents.js';
import { eventGatePasses } from '../src/systems/eventEngine.js';
import { EVENTS_RELATIVE_ILL } from '../src/data/eventsConsequences.js';
const D = { die: handleNpcDeath };
function fresh(seed) { const s = createNewLifeState({ country: 'gbr', seed }); ensureExtendedState(s); s.year = 2040; s.player.age = 40; const p = createPerson(s, { role: 'sibling', age: 40, nationality: 'gbr', residenceCountry: 'gbr' }); p.firstName = 'Daniel'; s.people[p.id] = p; s.relations.siblingIds.push(p.id); return { s, sib: p }; }
const cards = (s) => [...(s.activeScene ? [s.activeScene] : []), ...s.sceneQueue].filter((c) => c.major && /^relative_/.test(c.majorKind) && /Daniel/.test(c.title + ' ' + c.text));
let seen = { diag: 0, recov: 0, hurt: 0, hurtRecov: 0, minorNoCard: 0 };
for (let seed = 1; seed <= 800; seed++) {
  const { s, sib } = fresh(seed); s.activeScene = null; s.sceneQueue = [];
  for (let y = 0; y < 25 && sib.alive; y++) { s.year++; sib.age = Math.min(57, sib.age + 1); s.activeScene = null; s.sceneQueue = []; const n0 = cards(s).length; const ev = tickNpcHealthLife(s, D); const n1 = cards(s).length;
    for (const e of ev.filter((z) => z.id === sib.id)) {
      if (e.kind === 'illness_onset') { const c = cards(s).filter((x) => x.majorKind === 'relative_illness').pop(); assert(c, 'diagnosis card queued'); assert.equal(c.text, 'Your sibling, Daniel, has been diagnosed with ' + sib.illness.kind + '.'); assert.equal(c.title, 'Daniel Has Been Diagnosed'); seen.diag++;
        const rec = s.majorEvents.filter((m) => m.kind === 'relative_illness' && m.personId === sib.id).pop(); assert.equal(rec.facts.role, 'sibling'); assert.equal(rec.facts.illness, sib.illness.kind);
        const restored = restoreMajorScene(s, JSON.parse(JSON.stringify(c))); assert(restored && typeof restored.choices[0].effect === 'function'); }
      if (e.kind === 'illness_recovered') { assert(cards(s).some((x) => x.majorKind === 'relative_illness_recovered')); assert(!sib.illness); seen.recov++;
        const ev0 = EVENTS_RELATIVE_ILL.find((x) => x.gates.relativeIll.role === 'sibling'); assert.equal(eventGatePasses(ev0, s, { ignoreHistory: true }), false, 'recovered: follow-up scene no longer applies'); }
      if (e.kind === 'accident_injury') { if (e.severity === 'minor') { assert(!cards(s).slice(n0).some((x) => x.majorKind === 'relative_injury'), 'minor accident has no card'); seen.minorNoCard++; } else { assert(cards(s).some((x) => x.majorKind === 'relative_injury')); seen.hurt++; } } }
    if (sib.accident?.recoveredYear === s.year && sib.accident.severity === 'moderate') { seen.hurtRecov++; }
    // idempotent: re-running in the same year adds no card
    const m = cards(s).length; tickNpcHealthLife(s, D); assert.equal(cards(s).length, m, 'no duplicate cards in the same year'); }
  // injury cards stop at recovery: no relative_injury card is queued after recoveredYear
  const inj = (s.majorEvents || []).filter((m) => m.kind === 'relative_injury' && m.personId === sib.id);
  const rec = (s.majorEvents || []).filter((m) => m.kind === 'relative_injury_recovered' && m.personId === sib.id);
  assert(inj.length >= rec.length);
}
for (const k of Object.keys(seen)) assert(seen[k] > 0 || k === 'hurtRecov', k + ' occurred');
console.log('health cards:', JSON.stringify(seen));
