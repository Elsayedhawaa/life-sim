#!/usr/bin/env node
/**
 * World Life 2.2 — build script
 *
 * Bundles the game's ES modules (src/main.js + everything it imports)
 * into ONE classic script file, so the game opens by double-clicking
 * index.html (file://) with NO local server. ES module import/export
 * is blocked by the browser on file://, but a single bundled classic
 * script is not.
 *
 * HOW TO REBUILD (one command, from the game folder):
 *     node scripts/build.mjs
 *
 * That command fetches esbuild (pinned version below) via npx the
 * first time it runs, then writes dist/world-life.bundle.js. The
 * bundle is produced from the current src/ files every time — never
 * edit dist/world-life.bundle.js by hand; change src/ and rebuild.
 *
 * What it does:
 *   - entry: src/main.js (28 modules, ~3.2 MB of source)
 *   - output: dist/world-life.bundle.js, format iife (classic script),
 *     minified, no sourcemap (keeps the shipped file small)
 *   - index.html loads it with a plain <script src="..."> tag
 *     (NOT type="module"), so it works over file://
 *
 * CSS, fonts and illustrations stay as separate relative files —
 * they already load fine over file:// and are not bundled.
 *
 * Saves are untouched by this build: the game reads/writes plain
 * browser localStorage (key 'world_life_2_save_v1' in
 * src/core/gameLoop.js), which works from file:// with no server.
 *
 * The old server way still works as a fallback (start-game.command /
 * serve.py), but double-clicking index.html is now the primary way.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ENTRY = join(ROOT, 'src', 'main.js');
const OUT_DIR = join(ROOT, 'dist');
const OUT_FILE = join(OUT_DIR, 'world-life.bundle.js');

// Pinned so every rebuild uses the same bundler version.
const ESBUILD_VERSION = '0.28.2';

if (!existsSync(ENTRY)) {
  console.error(`Entry not found: ${ENTRY}`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

console.log('Bundling src/main.js with esbuild ' + ESBUILD_VERSION + ' ...');
execFileSync(
  'npx',
  [
    '--yes',
    `esbuild@${ESBUILD_VERSION}`,
    ENTRY,
    '--bundle',
    '--format=iife',
    '--minify',
    `--outfile=${OUT_FILE}`,
  ],
  { cwd: ROOT, stdio: 'inherit' }
);

// Change asset URLs with their content so phones do not keep an old game
// bundle after a Pages update. This does not alter the browser save key.
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex').slice(0, 12);
const indexPath = join(ROOT, 'index.html');
const index = readFileSync(indexPath, 'utf8')
  .replace(/styles\/main\.css(?:\?v=[a-f0-9]+)?/g, `styles/main.css?v=${hash(join(ROOT, 'styles', 'main.css'))}`)
  .replace(/dist\/world-life\.bundle\.js(?:\?v=[a-f0-9]+)?/g, `dist/world-life.bundle.js?v=${hash(OUT_FILE)}`);
writeFileSync(indexPath, index);
const size = statSync(OUT_FILE).size;
console.log(`Wrote ${OUT_FILE} (${(size / 1024).toFixed(1)} KB)`);
console.log('Done. Open index.html (double-click) to play — no server needed.');
