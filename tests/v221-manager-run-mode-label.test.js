// A manager-run business no longer states owner hours or an owner/founder role; self-run labels are unchanged.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const v=fs.readFileSync(new URL('../src/ui/views.js',import.meta.url),'utf8');
assert.match(v,/Run by \$\{mgrName\} · part-time scale \(revenue ×0\.6\)/);
assert.match(v,/Run by \$\{mgrName\} · full-time scale/);
assert.match(v,/Part-time \(\$\{BUSINESS_PART_TIME_HOURS\} hrs\/week, revenue ×0\.6\)/,'self-run label kept');
assert.match(v,/Full-time \(~\$\{BUSINESS_FULL_TIME_HOURS\} hrs\/week\)/,'self-run label kept');
assert.match(v,/mgrName\?esc\(`Run by \$\{mgrName\}`\):biz\.mode==='full_time'\?'Full-time owner'/);
console.log('PASS v221-manager-run-mode-label');
