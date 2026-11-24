import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { buyCompoundOrDistrictUnit } from '../src/systems/completeLifeSystems.js';
import { getPropertyUnits } from '../src/data/megaRealEstate.js';
const fresh = () => { const s = createNewLifeState({ country: 'egy', seed: 8 }); ensureExtendedState(s); s.player.age = 40; s.year = 2026; s.money.cash = 5e9; return s; };
for (const bad of ['villa_s', 'apt_m', '', undefined, null, 'br1 ']) {
  const s = fresh(); const cash = s.money.cash, props = s.housing.properties.length, loans = (s.money.loans || []).length;
  const r = buyCompoundOrDistrictUnit(s, { country: 'egy', devId: 'egy_madinaty', unitId: bad, finishId: 'standard', planId: 'cash' });
  assert.equal(r.ok, false, `unit id ${JSON.stringify(bad)} is refused`);
  assert.equal(s.money.cash, cash, 'no charge'); assert.equal(s.housing.properties.length, props, 'no property'); assert.equal((s.money.loans || []).length, loans, 'no loan');
  assert.match(r.msg, /Nothing was bought/);
}
// The id the market shows by default is valid and buys exactly that unit.
{ const s = fresh(); const shown = getPropertyUnits('egy')[4];
  const r = buyCompoundOrDistrictUnit(s, { country: 'egy', devId: 'egy_madinaty', unitId: shown.id, finishId: 'standard', planId: 'cash' });
  assert.equal(r.ok, true); assert.ok(s.housing.properties[0].name.includes(shown.name), 'bought the unit that was shown'); }
console.log('invalid property ids buy nothing; the shown default buys what is shown');
