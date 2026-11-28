import fs from 'node:fs';import assert from 'node:assert/strict';
/* Player-facing wording: no system voice in these scenes and journal lines (facts unchanged, only the phrasing). */
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const bad=[
 ['src/systems/soulEngine.js',/No visit or travel (booked|is assumed)|is assumed\.'|funded (care|gift|baby)|recorded promise|Recorded a one-year|No travel or attendance/],
 ['src/data/eventsMoneyHealthCareer.js',/Your Recorded (Collections|Grace)|Recorded Payroll Tax|and the Recorded Loan/],
 ['src/systems/playerTenancy.js',/Recorded (damage repaired|unpaid rent cleared)/],
 ['src/systems/healthDirectorEngine.js',/game counseling session\. No cure/],
];
for(const [f,re] of bad){const m=read(f).match(re);assert.ok(!m,`${f} still has system-voice text: ${m&&m[0]}`);}
console.log('ok v221 plain prose');
