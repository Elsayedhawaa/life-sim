// Ramadan household scenes are built only for Muslim players; divorce wording names the country properly.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const a=fs.readFileSync(new URL('../src/data/eventsMoneyHealthCareer.js',import.meta.url),'utf8');
const b=fs.readFileSync(new URL('../src/data/eventsEverydayFamily.js',import.meta.url),'utf8');
for(const [src,id] of [[a,'ev_money_ramadan_food'],[b,'ev_life_ramadan_prep']]){
  const i=src.indexOf(`id: '${id}'`);const k=src.indexOf('build: (S, ctx) => {',i);
  assert.ok(/religion[^\n]*!== 'muslim'\) return null/.test(src.slice(k,k+260)),id+' needs a Muslim gate');
}
const s=fs.readFileSync(new URL('../src/systems/soulEngine.js',import.meta.url),'utf8');
assert.ok(!/Under \$\{getCountry\([^}]*\)\.name\} civil law/.test(s));
console.log('PASS v221-ramadan-religion');
