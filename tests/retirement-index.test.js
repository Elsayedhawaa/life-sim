import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { projectedPension, retireFromCareer } from '../src/systems/careerEducationEngine.js';
import { settleUSRetirement } from '../src/systems/usRetirement.js';
import { eraSalary, eraLocalCost } from '../src/data/economy.js';
import { getCountry } from '../src/data/countries.js';

/* A state pension fixed at retirement erodes while every cost rises. The
   non-US state pension is indexed once each January by the game price
   basket (eraLocalCost), the same mechanism as rent and family board. */

// 4. Non-US state pension is indexed once per January, in step with the
//    price basket, and never twice in the same year.
{
  const s = createNewLifeState({ country: 'gbr', seed: 5 }); ensureExtendedState(s);
  s.year = 2074; s.month = 12; s.player.age = 66;
  s.career.retired = true; s.career.retirementCountry = 'gbr';
  s.career.statePensionMonthly = 5000; s.career.monthlyPension = 5000;
  settleUSRetirement(s); // December: no indexation yet
  assert.equal(s.career.statePensionMonthly, 5000);
  s.month = 1; s.year = 2075;
  const expected = Math.round(5000 * eraLocalCost(10000, 'gbr', 2075) / eraLocalCost(10000, 'gbr', 2074));
  settleUSRetirement(s);
  assert.equal(s.career.statePensionMonthly, expected);
  assert.equal(s.career.monthlyPension, expected);
  settleUSRetirement(s);
  assert.equal(s.career.statePensionMonthly, expected, 'second call same January must not double-index');
  s.month = 2;
  settleUSRetirement(s);
  assert.equal(s.career.statePensionMonthly, expected, 'no indexation outside January');
}

