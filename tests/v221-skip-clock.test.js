import assert from 'node:assert/strict';
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, fastForwardTurns } from '../src/core/gameLoop.js';
const s = createNewLifeState({ country: 'egy', seed: 5, familyTier: 'wealthy', birthYear: 1974, age: 0 }); ensureExtendedState(s);
let n = 0; while (s.player.age < 18 && n++ < 30) { advanceSingleTurn(s); s.activeScene = null; }
s.education.stage='university'; s.education.university={id:'asu',name:'Ain Shams University',country:'egy',majorId:'cs',majorLabel:'CS',totalYears:4,yearInProgram:1,elapsedMonths:0,progressMonth:s.year*12+s.month,enrolledMonth:s.year*12+s.month,annualTuition:10000,scholarshipPct:0};
let bad = 0;
for (let i = 0; i < 30; i++) {
  const b = { m: s.year * 12 + s.month, a: s.player.age, e: s.education.university?.elapsedMonths, t: s.turn };
  const res = fastForwardTurns(s, 12); s.activeScene = null;
  const dm = s.year * 12 + s.month - b.m;
  assert.equal(dm, res.stepsRun, 'calendar months == steps');
  assert.equal(s.turn - b.t, res.stepsRun, 'turn counter == steps');
  assert.ok(s.player.age - b.a <= 1 && (s.player.age - b.a === 0 || dm >= 1), 'age moves at most one, only at birthday');
  if (s.education.university && b.e != null) assert.equal(s.education.university.elapsedMonths - b.e, dm, 'degree months == calendar months (skip ' + i + ')');
}
console.log('skip-clock OK');
