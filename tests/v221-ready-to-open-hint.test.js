import fs from'node:fs';import assert from'node:assert/strict';
/* A staged company that finished preparation must tell the player to open it (a played run bled five months of costs waiting on "Prepare for opening"). */
const v=fs.readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');
assert.ok(/stage==='ready'\?'Ready to open'/.test(v),'Overview names the ready state');
assert.ok(/nothing sells until you press Open for business/.test(v),'Overview says what to do and what it costs');
assert.ok(v.indexOf("'Ready to open'")<v.indexOf("'Prepare for opening':"),'ready is checked before the generic preparing text');
console.log('ok v221 ready to open hint');
