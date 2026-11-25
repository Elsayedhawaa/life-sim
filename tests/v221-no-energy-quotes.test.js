import assert from 'node:assert/strict';
import { createNewLifeState } from '../src/core/schema.js';
import { ensureExtendedState } from '../src/core/schema.js';
import { generateContextualLine, callPerson, interactWithPerson } from '../src/systems/soulEngine.js';
import { checkSocialEnergy, spendSocialEnergy } from '../src/systems/socialEnergy.js';
const s = createNewLifeState({ country: 'egy', seed: 5 });
try { ensureExtendedState(s); } catch (e) {}
// energy never blocks and is never spent
assert.equal(checkSocialEnergy(s, 99).ok, true);
assert.equal(spendSocialEnergy(s, 99), true);
const kin = Object.values(s.people).filter(p => p.alive && p.age >= 4);
assert.ok(kin.length > 0);
const k = kin[0];
// no generic filler for children or adults with no real record
k.age = 8; assert.equal(generateContextualLine(s, k), '');
k.age = 40; k.rel.promises = []; k.rel.memories = []; k.rel.resentment = 0; k.residenceCountry = s.country;
assert.equal(generateContextualLine(s, k), '');
// a real open promise still yields a line
k.rel.promises = [{ status: 'open', description: 'visit them', dueYear: 2030 }];
assert.match(generateContextualLine(s, k), /visit them/);
k.rel.promises = [];
// repeat the same visit twice in the same month: second earns nothing
k.age = 40; s.player.age = 30;
const a = interactWithPerson(s, k.id, 'talk_visit');
const b = interactWithPerson(s, k.id, 'talk_visit');
assert.equal(a.ok, true); assert.equal(b.ok, false);
console.log('no-energy + grounded quotes OK');
