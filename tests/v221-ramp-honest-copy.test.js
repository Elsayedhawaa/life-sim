import assert from'node:assert/strict';import fs from'node:fs';
/* Decision: a 1-2 year loss while demand builds is realistic, so the launch card and the losing banner must say so. */
const v=fs.readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8'),b=fs.readFileSync(new URL('../src/systems/businessEngine.js',import.meta.url),'utf8');
assert.ok(/Still building customers[^`]*year or two/.test(v)&&/reach\)\|\|0\)<1\.2/.test(v),'losing banner explains the demand ramp for young trading companies');
assert.ok(/demand usually takes a year or two to build, so early losses are normal/.test(b),'launch card says early losses are normal');
console.log('ok v221 ramp honest copy');
