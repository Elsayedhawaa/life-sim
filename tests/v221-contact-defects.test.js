// Contact defects: the drift notice states the real months, and the forgotten-birthday choices stamp last contact.
import assert from 'node:assert/strict';
import {createNewLifeState,ensureExtendedState,createPerson} from '../src/core/schema.js';
import {noteSocialContact,tickFriendshipDrift} from '../src/systems/socialEnergy.js';
import {EVENTS_EVERYDAY_FAMILY} from '../src/data/eventsEverydayFamily.js';

/* R9-2: the drift notice journal must state the actual elapsed months, not a hardcoded "a year". */
{
  const s=createNewLifeState({country:'gbr',seed:7});ensureExtendedState(s);
  s.player.age=25;s.pacing='monthly';
  const p=createPerson(s,{age:25,role:'friend',relationLabel:'Friend',nationality:'gbr',residenceCountry:'gbr'});
  s.people[p.id]=p;s.relations.friendIds=[p.id];
  noteSocialContact(s,p);
  s.year=2021;s.month=9;s.turn=100;p.rel.lastContactYear=2021;p.rel.lastContactMonth=9;p.rel.lastContactTurn=100;
  s.year=2026;s.month=1;s.turn=152;let r=tickFriendshipDrift(s);assert.equal(r.warned,1,'warning stage first');
  s.month=2;s.turn=153;r=tickFriendshipDrift(s);assert.equal(r.noticed,1,'notice stage second month');
  const j=(s.journal||[]).find(x=>/(have not spoken to|since you and)/.test(x.text||''));
  assert.ok(j,'notice journal recorded');
  assert.ok(!/in a year/.test(j.text),`journal must not say "in a year" for 53 months, got: ${j.text}`);
  assert.ok(/about 4 years/.test(j.text),`journal must state the real span (53 months = about 4 years), got: ${j.text}`);
  console.log('R9-2 notice journal states actual months:', JSON.stringify(j.text.slice(0,90)));
}

/* R9-1: an event choice that is real contact (apology call + dinner, or a sent message) must stamp last-contact like every other contact path. */
{
  const ev=EVENTS_EVERYDAY_FAMILY.find(e=>e.id==='ev_friend_birthday_forgot');
  assert.ok(ev,'event exists');
  for (const [idx,label] of [[0,'apology call + dinner'],[1,'sent message']]) {
    const s=createNewLifeState({country:'gbr',seed:8});ensureExtendedState(s);
    s.player.age=25;s.pacing='monthly';s.year=2026;s.month=6;s.turn=300;
    s.money.cash=50000;
    const f=createPerson(s,{age:25,role:'friend',relationLabel:'Friend',nationality:'gbr',residenceCountry:'gbr'});
    s.people[f.id]=f;s.relations.friendIds=[f.id];
    noteSocialContact(s,f);
    f.rel.lastContactYear=2025;f.rel.lastContactMonth=1;f.rel.lastContactTurn=100;f.rel.driftState='drifting';
    const scene=ev.build(s,{});
    scene.choices[idx].effect(s);
    assert.equal(f.rel.lastContactYear,2026,`${label}: lastContactYear must update to now`);
    assert.equal(f.rel.lastContactMonth,6,`${label}: lastContactMonth must update to now`);
    assert.equal(f.rel.driftState,'none',`${label}: contact clears drift`);
    console.log(`R9-1 ${label}: contact stamped, drift cleared`);
  }
}
console.log('PASS r9-contact-defects');
