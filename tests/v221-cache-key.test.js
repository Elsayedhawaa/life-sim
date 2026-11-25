// index.html's ?v= cache keys must equal the hash of the files they point at, so a rebuild can never ship with a stale key.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const h = (p) => createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 12);
const html = readFileSync('index.html', 'utf8');
const js = html.match(/dist\/world-life\.bundle\.js\?v=([a-f0-9]+)/);
const css = html.match(/styles\/main\.css\?v=([a-f0-9]+)/);
assert.ok(js, 'index.html carries a bundle cache key');
assert.equal(js[1], h('dist/world-life.bundle.js'), 'bundle cache key matches dist/world-life.bundle.js');
if (css) assert.equal(css[1], h('styles/main.css'), 'css cache key matches styles/main.css');
console.log('cache keys consistent', js[1]);
