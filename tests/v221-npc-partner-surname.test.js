import assert from'node:assert/strict';
import fs from'node:fs';
/* Played defect: an NPC's new partner was given the NPC's own family name ("Sherine and Ramy Farouk"). The partner now draws their own surname. */
const src=fs.readFileSync(new URL('../src/systems/soulEngine.js',import.meta.url),'utf8');
const i=src.indexOf('function npcMarry');const j=src.indexOf('npcGiveJob(S, partner)',i);
assert.ok(i>0&&j>i);assert.ok(!/familyName:\s*person\.familyName/.test(src.slice(i,j)),'partner is not handed the NPC family name');
console.log('ok v221 npc partner surname');
