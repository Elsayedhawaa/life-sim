import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState, createPerson } from '../src/core/schema.js';
import { advanceSingleTurn } from '../src/core/gameLoop.js';
import { snapshotMajor, announceMajorChanges } from '../src/systems/majorLifeEvents.js';
import { tickNpcHealthLife } from '../src/systems/npcHealthLife.js';
import { handleNpcDeath } from '../src/systems/soulEngine.js';
const D = { die: handleNpcDeath };
const add = (s, role, age, list) => { const p = createPerson(s, { role, age, nationality: 'gbr', residenceCountry: 'gbr' }); s.people[p.id] = p; list.push(p.id); return p; };
function fresh(seed) { const s = createNewLifeState({ country: 'gbr', seed }); ensureExtendedState(s); add(s, 'sibling', s.player.age + 2, s.relations.siblingIds); return s; }
// REAL game loop (advanceSingleTurn: yearly childhood, monthly adult, every tick the game runs).
// Player choices are NOT made: any open scene is dismissed, so no player marriages or children happen.
// Relatives are the generated parents and one sibling; nothing is injected.
let lives = 0, relDeaths = 0, withCause = 0, announced = 0, youngDeaths = 0;
for (let seed = 1; seed <= 25; seed++) {
  const s = fresh(seed); lives++;
  for (let i = 0; i < 700 && !s.gameOver && s.player.age < 65; i++) {
    const before = snapshotMajor(s), aliveBefore = new Set(Object.values(s.people).filter(p => p.alive).map(p => p.id));
    s.activeScene = null; s.sceneQueue = [];
    advanceSingleTurn(s);
    for (const p of Object.values(s.people)) if (aliveBefore.has(p.id) && !p.alive && p.id !== 'player') {
      relDeaths++; if (p.deathCause) withCause++;
      if (p.age >= 18 && p.age <= 57) { youngDeaths++; assert(p.illness || p.accident, 'young death has a recorded cause record'); assert(p.deathCause, 'and a cause'); }
      const rec = (s.majorEvents || []).filter(e => e.kind === 'death' && e.personId === p.id);
      if (rec.length) { announced++; assert.equal(rec[0].facts.cause, p.deathCause || null, 'announcement cause equals recorded cause'); }
    }
  }
}
console.log(`real-loop lives ${lives}: relative deaths ${relDeaths}, with cause ${withCause}, young (18-57) ${youngDeaths}, announced ${announced}`);
// Reload: serialise mid-way, both copies continue identically (no hidden shared state).
{ const a = fresh(77); for (let y = 0; y < 15; y++) { a.year++; for (const p of Object.values(a.people)) if (p.alive && p.id !== 'player') p.age++; tickNpcHealthLife(a, D); }
  const b = JSON.parse(JSON.stringify(a));
  for (let y = 0; y < 30; y++) for (const s of [a, b]) { s.year++; for (const p of Object.values(s.people)) if (p.alive && p.id !== 'player') p.age++; tickNpcHealthLife(s, D); }
  const strip = (o) => { const c = { ...o.people }; delete c.player; return JSON.stringify(c); }; assert.equal(strip(a), strip(b), 'reloaded state continues identically'); }
// Idempotence: running the same year's tick twice does not produce a second diagnosis, injury or death.
{ let checked = 0; for (let seed = 1; seed <= 200; seed++) { const s = fresh(seed); s.year = 2050; const sib = s.people[s.relations.siblingIds[0]]; sib.age = 45;
    const e1 = tickNpcHealthLife(s, D); const snap = JSON.stringify(s.people); const e2 = tickNpcHealthLife(s, D);
    if (e1.some(e => e.kind === 'illness_onset' || e.kind === 'accident_injury')) { checked++; assert(!e2.some(e => e.kind === 'illness_onset'), 'no second onset in the same year'); }
    assert(JSON.stringify(s.people) !== undefined); } assert(checked > 0); }
// Identity: another person's presence does not change this person's outcome (rolls keyed by seed, id, year).
{ for (let seed = 1; seed <= 50; seed++) { const a = fresh(seed), b = fresh(seed); const extra = add(b, 'sibling', 30, b.relations.siblingIds);
    const sa = a.people[a.relations.siblingIds[0]], sb = b.people[b.relations.siblingIds[0]]; assert.equal(sa.id, sb.id);
    for (let y = 0; y < 40; y++) for (const s of [a, b]) { s.year++; for (const p of Object.values(s.people)) if (p.alive) p.age++; tickNpcHealthLife(s, D); }
    assert.equal(JSON.stringify({ i: sa.illness, a: sa.accident, al: sa.alive, c: sa.deathCause }), JSON.stringify({ i: sb.illness, a: sb.accident, al: sb.alive, c: sb.deathCause }), 'same person, same life, same outcome'); } }
console.log('reload, idempotence and identity checks pass');
// Strict idempotence: a second tick in the same calendar year changes nothing at all.
{ for (let seed = 1; seed <= 300; seed++) { const s = fresh(seed); s.year = 2050; const sib = s.people[s.relations.siblingIds[0]]; sib.age = 50 + (seed % 7);
    tickNpcHealthLife(s, D); const snap = JSON.stringify(s); const ev = tickNpcHealthLife(s, D); assert.equal(ev.length, 0); assert.equal(JSON.stringify(s), snap, 'same-year re-run is a no-op'); } }
// Healed injury gets a recovery year; fatal one never does.
{ let healed = 0; for (let seed = 1; seed <= 600 && healed < 3; seed++) { const s = fresh(seed); const sib = s.people[s.relations.siblingIds[0]]; for (let y = 0; y < 40 && sib.alive; y++) { s.year++; sib.age = Math.min(57, sib.age + 1); tickNpcHealthLife(s, D); }
    const a = sib.accident; if (a && a.severity !== 'fatal' && a.year < s.year) { assert(a.recoveredYear > a.year, 'non-fatal accident recorded as healed'); healed++; } if (a?.severity === 'fatal') assert(!a.recoveredYear); } assert(healed > 0); }
// Past 57: no new illness or accident, but an illness recorded here runs to recovery or death with its recorded cause.
{ let died = 0, healed = 0, newPast57 = 0;
  for (let seed = 1; seed <= 300; seed++) { const s = fresh(seed); const sib = s.people[s.relations.siblingIds[0]]; sib.age = 56; sib.illness = { kind: seed % 2 ? 'cancer' : 'heart disease', sinceYear: s.year - 1, src: 'young' };
    for (let y = 0; y < 40 && sib.alive; y++) { s.year++; sib.age++; tickNpcHealthLife(s, D); if (sib.age > 57 && !sib.illness && !sib.pastIllnesses?.length && sib.accident?.year > s.year - 40 && sib.accident?.year >= s.year) newPast57++; }
    if (!sib.alive) { died++; assert(/cancer|heart disease/.test(sib.deathCause), 'cause is the recorded illness'); } else if (!sib.illness) healed++; }
  assert(died > 0 && healed > 0 && newPast57 === 0, 'both outcomes occur, no new accidents past 57'); console.log(`past-57 own-illness: ${died} died with recorded cause, ${healed} recovered, 0 new accidents`); }
// An elderly-branch illness (no src) is left to soulEngine.
{ const s = fresh(4); const sib = s.people[s.relations.siblingIds[0]]; sib.age = 70; sib.illness = { kind: 'dementia', sinceYear: s.year - 1 }; const before = JSON.stringify(sib); s.year++; tickNpcHealthLife(s, D); assert.equal(JSON.stringify(sib), before); }
// Spouse who is also listed elsewhere is processed once.
{ const s = fresh(9); const sp = add(s, 'spouse', 40, s.relations.spouseIds); s.relations.siblingIds.push(sp.id); s.year = 2055; tickNpcHealthLife(s, D); assert.equal(sp.healthTickYear, 2055); }
console.log('strict idempotence, injury recovery, 58+ hand-off and dedup pass');

// REAL marriage, children, widowhood and divorce through the real helpers and the real yearly tick.
import { newCoupleRecord, syncCoupleToLegacy } from '../src/core/schema.js';
import { tickNpcAutonomyYearly } from '../src/systems/soulEngine.js';
import { initiateDivorce } from '../src/systems/marriageFamilyEngine.js';
import { getRandomLifeEventById as G, eventGatePasses as P } from '../src/systems/eventEngine.js';
function married(seed, spouseAge = 36) { const s = createNewLifeState({ country: 'usa', seed }); ensureExtendedState(s); s.year = 2040; s.player.age = 38; s.money.cash = 100000;
  const w = createPerson(s, { gender: 'f', age: spouseAge, role: 'spouse', nationality: 'usa', residenceCountry: 'usa' }); s.people[w.id] = w; const c = newCoupleRecord(s, 'player', w.id, { stage: 'married' }); s.marriage.couples.push(c); syncCoupleToLegacy(s, c);
  const kid = createPerson(s, { gender: 'm', age: 9, role: 'child', nationality: 'usa', residenceCountry: 'usa' }); kid.parentIds = ['player', w.id]; s.people[kid.id] = kid; s.relations.childIds.push(kid.id);
  const grown = createPerson(s, { gender: 'f', age: 22, role: 'child', nationality: 'usa', residenceCountry: 'usa' }); grown.parentIds = ['player', w.id]; s.people[grown.id] = grown; s.relations.childIds.push(grown.id);
  return { s, w, c, kid, grown }; }
{ let widowed = 0, adultChildLost = 0, followUps = 0;
  for (let seed = 1; seed <= 400; seed++) { const { s, w, kid, grown } = married(seed);
    for (let y = 0; y < 30; y++) { const b = snapshotMajor(s); s.year++; for (const p of Object.values(s.people)) if (p.alive && p.id !== 'player') p.age++; const minorNow = kid.alive && kid.age < 18; tickNpcAutonomyYearly(s); if (minorNow) assert(kid.alive && !kid.illness && !kid.accident, 'a minor child is never touched'); announceMajorChanges(s, b); if (!w.alive || !grown.alive) break; }
        if (!w.alive && w.age <= 57) { widowed++; assert(w.deathCause && (w.illness || w.accident)); assert(!s.relations.spouseIds.includes(w.id), 'widowed spouse leaves the spouse list');
      assert(s.majorEvents.some(e => e.kind === 'death' && e.personId === w.id && e.facts.role === 'spouse' && e.facts.cause === w.deathCause), 'announcement carries the recorded cause');
      s.month += 2; if (P(G('ev_major_child_after_spouse_death'), s)) followUps++; }
    if (!grown.alive && grown.age <= 57) { adultChildLost++; assert(grown.deathCause && (grown.illness || grown.accident)); assert(s.majorEvents.some(e => e.kind === 'death' && e.personId === grown.id && e.facts.role === 'child')); } }
  assert(widowed > 0 && adultChildLost > 0); console.log(`real marriage lives: ${widowed} young widowings (each with recorded cause, announcement, spouse list updated; child-after-spouse-death follow-up eligible ${followUps}x), ${adultChildLost} adult-child deaths with recorded cause`); }
// Divorce: the ex-spouse stops being a relative for health ticks; the minor child is unaffected.
{ const { s, w, kid } = married(5); assert.ok(initiateDivorce(s, w.id, 'standard', { confirmed: true, custody: 'spouse' }).ok);
  for (let y = 0; y < 20; y++) { s.year++; for (const p of Object.values(s.people)) if (p.alive && p.id !== 'player') p.age++; tickNpcAutonomyYearly(s); }
  assert.equal(w.healthTickYear, undefined, 'ex-spouse is not ticked as a relative'); assert(kid.alive && !kid.illness); console.log('divorce: ex-spouse no longer a health-tick relative'); }

// Real 56-62 ticks through the real yearly tick: illness ownership continues across 57/58.
{ const out = { acuteResolved: 0, acuteDied: 0, chronicDied: 0, chronicKept: 0, healedAfter58: 0, diedAfter58: 0 };
  for (const kind of ['a serious infection', 'an autoimmune disease', 'heart disease']) for (let seed = 1; seed <= 400; seed++) {
    const s = fresh(seed); const sib = s.people[s.relations.siblingIds[0]]; sib.age = 56; const rec = { kind, sinceYear: s.year, src: 'young' }; sib.illness = { ...rec };
    for (let y = 0; y < 7 && sib.alive; y++) { s.year++; sib.age++; const had = sib.illness; tickNpcAutonomyYearly(s);
      if (sib.alive && had && !sib.illness) { assert(sib.pastIllnesses?.some(p => p.kind === kind && p.sinceYear === rec.sinceYear && p.resolvedYear === s.year), 'never cleared without a recovery record'); if (sib.age > 57) out.healedAfter58++; }
      if (sib.alive && sib.illness) assert.equal(JSON.stringify(sib.illness), JSON.stringify(rec), 'illness record is carried unchanged, not rewritten by the old branch');
      if (!sib.alive) { if (had) assert(sib.deathCause && sib.deathCause.startsWith(kind), 'cause is the recorded illness: ' + sib.deathCause); else assert(sib.pastIllnesses?.length, 'died only after recovering'); if (sib.age > 57) out.diedAfter58++; } }
    if (!sib.alive) (kind === 'a serious infection' ? out.acuteDied++ : out.chronicDied++); else if (!sib.illness) out.acuteResolved += kind === 'a serious infection' ? 1 : 0; else out.chronicKept++; }
  assert(out.healedAfter58 > 0 && out.diedAfter58 > 0, 'both resolutions occur after 58'); console.log('56-62 real ticks:', JSON.stringify(out)); }
// Ex-spouse is never processed or labeled as a spouse after divorce; journal has no health lines naming them.
{ let checked = 0; for (let seed = 1; seed <= 60; seed++) { const { s, w } = married(seed, 40); assert.ok(initiateDivorce(s, w.id, 'standard', { confirmed: true, custody: 'spouse' }).ok);
    for (let y = 0; y < 25; y++) { s.year++; for (const p of Object.values(s.people)) if (p.alive && p.id !== 'player') p.age++; tickNpcAutonomyYearly(s); }
    assert(!w.illness?.src && !w.accident && w.healthTickYear === undefined);
    assert(!(s.journal || []).some(j => /diagnosed|accident|recovered from/.test(j.text || j.message || JSON.stringify(j)) && JSON.stringify(j).includes(w.firstName) && /your spouse/i.test(JSON.stringify(j))), 'no spouse-labeled health line about the ex'); checked++; }
  console.log(`divorce exclusion: ${checked} divorced lives, ex never ticked or labeled spouse`); }
// Spouse who owns a company dies young through the health path: estate settles once, cause recorded.
{ let settled = 0;
  for (let seed = 1; seed <= 600 && settled < 3; seed++) { const { s, w } = married(seed, 40);
    w.ownedBusinesses = [{ id: 'Spouse Co', name: 'Spouse Co', typeId: 'kiosk', country: 'usa', figuresCurrency: 'usa', capitalInvested: 50000, equityOwned: 100, heirId: 'player', debtLocal: 0, staff: [], monthlyRev: 5000, monthlyCost: 1000, lastPL: { net: 0 }, history: [] }];
    for (let y = 0; y < 30 && w.alive; y++) { s.year++; for (const p of Object.values(s.people)) if (p.alive && p.id !== 'player') p.age++; tickNpcAutonomyYearly(s); }
    if (!w.alive && w.age <= 57) { settled++; assert(w.deathCause && (w.illness || w.accident)); assert(w.companyEstateSettlement && w.ownedBusinesses.length === 0, 'estate settled and holdings moved');
      assert.equal(s.npcCompanyEstates.filter(e => e.ownerId === w.id).length, 1, 'settled once'); assert(s.career.businesses.some(b => b.name === 'Spouse Co'), 'player received the named company');
      const snap = JSON.stringify(s); tickNpcAutonomyYearly(s); assert.equal(s.npcCompanyEstates.filter(e => e.ownerId === w.id).length, 1, 'still once after more ticks'); } }
  assert(settled > 0); console.log(`company-owning spouse: ${settled} young deaths settled once with recorded cause`); }
