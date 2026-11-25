import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { openGiftScene, openAskHelpScene } from '../src/systems/soulEngine.js';
import { resolveActiveSceneChoice } from '../src/core/gameLoop.js';
const s = createNewLifeState({ country: 'egy', seed: 4, familyTier: 'middle', birthYear: 1990, age: 0 }); ensureExtendedState(s);
s.player.age = 25; s.year = 2015; s.month = 5; s.activeScene = null; s.sceneQueue = [];
s.money.cash = 5_000_000;
const dad = s.people[s.relations.fatherId]; dad.alive = true;
function gift() {
  s.activeScene = null;
  const r = openGiftScene(s, dad.id); assert.ok(r.ok !== false, JSON.stringify(r));
  const i = s.activeScene.choices.findIndex(c => /^Buy /.test(c.label)); assert.ok(i >= 0, 'has a buy choice');
  const cash0 = s.money.cash, aff0 = dad.rel.affection;
  resolveActiveSceneChoice(s, i);
  return { spent: cash0 - s.money.cash, aff: dad.rel.affection - aff0 };
}
const g1 = gift(), g2 = gift();
assert.ok(g1.spent > 0 && g1.aff > 0, 'first gift is bought and counts');
assert.equal(g2.spent, 0, 'rejected repeat gift charges nothing: ' + g2.spent);
assert.equal(g2.aff, 0, 'rejected repeat gift changes no affection');
console.log('repeat-gift OK', g1.spent, g2.spent);
// Ask-help: a rejected repeat in the same turn changes nothing and spends nothing.
function help() {
  s.activeScene = null;
  const r = openAskHelpScene(s, dad.id); assert.ok(r.ok !== false, JSON.stringify(r));
  const i = s.activeScene.choices.findIndex(c => /help|money|loan|advice/i.test(c.label) && !/never mind|leave|cancel/i.test(c.label)); assert.ok(i >= 0, 'has a help choice');
  const cash0 = s.money.cash, aff0 = dad.rel.affection, favours0 = JSON.stringify(dad.rel.favours ?? null);
  resolveActiveSceneChoice(s, i);
  return { cash: s.money.cash - cash0, aff: dad.rel.affection - aff0, fav: JSON.stringify(dad.rel.favours ?? null) !== favours0 };
}
s.turn += 1;
const h1 = help();
assert.ok(s.cooldowns[`askHelp_${dad.id}`] > s.turn - 0, 'first ask-help was taken (cooldown set)');
const h2 = help();
assert.equal(h2.cash, 0, 'rejected repeat ask-help moves no cash');
assert.equal(h2.aff, 0, 'rejected repeat ask-help changes no affection');
console.log('repeat-help OK');
