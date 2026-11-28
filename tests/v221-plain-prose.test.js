import fs from 'node:fs';import assert from 'node:assert/strict';
/* Player-facing wording: no system voice in these scenes and journal lines (facts unchanged, only the phrasing). */
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const bad=[
 ['src/systems/soulEngine.js',/No visit or travel (booked|is assumed)|is assumed\.'|funded (care|gift|baby)|recorded promise|Recorded a one-year|Recorded funeral contribution|Broke a recorded support promise|No travel or attendance/],
 ['src/data/eventsMoneyHealthCareer.js',/Your Recorded (Collections|Grace)|Recorded Payroll Tax|and the Recorded Loan/],
 ['src/systems/playerTenancy.js',/Recorded (damage repaired|unpaid rent cleared)|No recorded (rental damage|unpaid rent)|recorded rental arrears/],
 ['src/ui/views.js',/Recorded damage ·|No recorded dispute/],
 ['src/systems/recordedDebtPayments.js',/Recorded debt payment/],
 ['src/systems/healthDirectorEngine.js',/game counseling session\. No cure/],
];
for(const [f,re] of bad){const m=read(f).match(re);assert.ok(!m,`${f} still has system-voice text: ${m&&m[0]}`);}
console.log('ok v221 plain prose');
