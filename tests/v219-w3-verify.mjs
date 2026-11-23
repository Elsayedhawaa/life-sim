#!/usr/bin/env node
/* v2.19 W3 verify — distribution harness country id + stale month-1 nets.
 * Run from the game root:  node tests/v219-w3-verify.mjs
 *
 * (A) THE 'are' DEFECT. The v2.18 distribution log recorded the harness
 * using 'are' where the real country id is 'uae', so its 0-of-13 UAE
 * figure was Egypt wages with USD takings. The coordinator fixed the
 * harness at the v2.18 merge: the shipped tests/v217-distribution.mjs
 * already lists 'uae' in COUNTRIES (the 'are' typo survives only in
 * the W4 scratch copy and as the unknown-id fallback test below).
 * This script PROVES it, two ways: it reads the harness source and
 * asserts 'uae' is a listed country and 'are' is not, and it RUNS the
 * harness and asserts the run's per-country table has a real 'uae'
 * entry with lives launched. Both distribution rates must be strictly
 * between 0% and 100%.
 *
 * (B) STALE MONTH-1 NETS. The v2.18 brief quotes v2.14-era Egypt
 * portfolio month-1 nets (-41,318 / 7,711 / 25,752 / 87,570 / 116,580).
 * Those do not reproduce on the current tree and were never re-measured
 * here — the game was NOT changed to match them. This script re-measures
 * the same portfolio definition (v2.14 §1: 2 manager-run full-time +
 * 3 owner-run part-time, 54 owner hours of a 70-hour week) on the
 * current tree and asserts the REAL numbers. If the game changes, this
 * check fails loudly and the numbers get re-measured again — never
 * silently re-quoted from an old brief.
 *
 * Exit 0 when every check passes, 1 otherwise.
 */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import { launchSmallBusiness } from '../src/systems/careerEducationEngine.js';
import { ventureWageScale } from '../src/systems/businessEngine.js';
import { managementCapacityInfo } from '../src/systems/businessCapacity.js';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}

/* The real numbers, measured on the current tree 2026-11-22 by running
   the §3 setup below (and independently by tests/v218-w4-verify.mjs §1,
   which prints the same five). v2.20 re-measured them: the real other
   costs are now charged (I3 fix 1), so the nets moved from the v2.19
   figures. The stale v2.14-era brief numbers are listed next to them
   so no future round quotes them again. */
const MEASURED_NETS = [-39328, -14760, 10749, 67731, 143577];
const STALE_BRIEF_NETS = [-41318, 7711, 25752, 87570, 116580];

/* ================= §0 the unknown-id fallback still holds ================= */
console.log('--- §0 unknown-country fallback (kept) ---');
{
  check("unknown country id 'are' still gets scale 1 (no repricing)", ventureWageScale('are', 2026) === 1, `got ${ventureWageScale('are', 2026)}`);
  const uae26 = ventureWageScale('uae', 2026);
  check("real 'uae' id scales (~14.44), not the fallback 1", Math.abs(uae26 - 14.442) < 0.01, `got ${uae26}`);
}

/* ================= §1 the harness source uses 'uae' ================= */
console.log('--- §1 distribution harness source ---');
{
  const src = readFileSync(path.join(ROOT, 'tests', 'v217-distribution.mjs'), 'utf8');
  const m = src.match(/const COUNTRIES = \[([^\]]+)\]/);
  check('harness declares a COUNTRIES list', !!m, 'no COUNTRIES const found');
  const ids = m ? m[1].match(/'([a-z]+)'/g).map((q) => q.slice(1, -1)) : [];
  console.log('harness COUNTRIES:', ids.join(', '));
  check("harness lists the real UAE id 'uae'", ids.includes('uae'), `got [${ids.join(', ')}]`);
  check("harness does NOT list the typo id 'are' as a country", !ids.includes('are'), `got [${ids.join(', ')}]`);
  check('harness still covers 8 countries', ids.length === 8, `got ${ids.length}`);
}

/* ================= §2 run the harness, read the real rates ================= */
console.log('--- §2 distribution run (100 lives, real UAE) ---');
{
  let out = '';
  let exitOk = true;
  try {
    out = execFileSync('node', [path.join(ROOT, 'tests', 'v217-distribution.mjs')], { cwd: ROOT, encoding: 'utf8', timeout: 300000 });
  } catch (e) {
    exitOk = false;
    out = String(e.stdout || '') + String(e.stderr || '');
  }
  check('distribution harness exits 0', exitOk, out.slice(-300));
  const failM = out.match(/FAILURE_RATE=([0-9.]+)/);
  const breakM = out.match(/BREAKOUT_RATE=([0-9.]+)/);
  const failureRate = failM ? Number(failM[1]) : NaN;
  const breakoutRate = breakM ? Number(breakM[1]) : NaN;
  console.log(`distribution rates: failure ${(failureRate * 100).toFixed(1)}%, breakout ${(breakoutRate * 100).toFixed(1)}%`);
  check('failure rate is strictly between 0% and 100%', Number.isFinite(failureRate) && failureRate > 0 && failureRate < 1, `got ${failureRate}`);
  check('breakout rate is strictly between 0% and 100%', Number.isFinite(breakoutRate) && breakoutRate > 0 && breakoutRate < 1, `got ${breakoutRate}`);
  check('harness prints DISTRIBUTION_OK', out.includes('DISTRIBUTION_OK'));
  const jsonM = out.match(/\{[\s\S]*"byCountry"[\s\S]*?\n\}/);
  let byCountry = null;
  try { byCountry = JSON.parse(jsonM ? jsonM[0] : 'null'); } catch (e) { byCountry = null; }
  check('harness output parses and has a per-country table', !!byCountry && !!byCountry.byCountry, 'no JSON table in output');
  const uae = byCountry && byCountry.byCountry ? byCountry.byCountry.uae : null;
  console.log('UAE in the run:', uae ? JSON.stringify(uae) : 'MISSING');
  check("the run's per-country table has a real 'uae' entry", !!uae, 'no uae key in byCountry');
  check('UAE lives actually launched (not 0, not an invalid id)', !!uae && uae.launched > 0, uae ? `launched ${uae.launched}` : 'no uae entry');
  check("the run's per-country table has no 'are' entry", !byCountry.byCountry.are, 'are key present');
  check('all 100 lives launched', !!byCountry && byCountry.launched === 100, byCountry ? `launched ${byCountry.launched}` : 'no JSON');
}

/* ================= §3 Egypt portfolio month-1 nets, re-measured ================= */
console.log('--- §3 Egypt portfolio month-1 nets (re-measured, current tree) ---');
{
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.player.age = 35; S.year = 2026; S.month = 1; S.pacing = 'monthly';
  S.money.cash = 20000000;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  S.reputation = 80;
  /* v2.14 §1 portfolio: 3 owner-run part-time + 2 manager-run full-time. */
  const r1 = launchSmallBusiness(S, 'cafe', 'Portfolio Café', { mode: 'part_time' });
  const r2 = launchSmallBusiness(S, 'retail_shop', 'Portfolio Shop', { mode: 'part_time' });
  const r3 = launchSmallBusiness(S, 'bakery', 'Portfolio Bakery', { mode: 'part_time' });
  const mgrA = { name: 'Salon Manager', skill: 70, wage: 20000, loyalty: 70, personId: null, policy: 'safe' };
  const mgrB = { name: 'Restaurant Manager', skill: 60, wage: 18000, loyalty: 70, personId: null, policy: 'safe' };
  const r4 = launchSmallBusiness(S, 'salon', 'Portfolio Salon', { mode: 'full_time', manager: mgrA, runBy: 'manager' });
  const r5 = launchSmallBusiness(S, 'restaurant', 'Portfolio Restaurant', { mode: 'full_time', manager: mgrB, runBy: 'manager' });
  check('portfolio launches all ok', r1.ok && r2.ok && r3.ok && r4.ok && r5.ok, [r1, r2, r3, r4, r5].map((r) => r.msg).join(' | '));
  /* The hours the definition promises: 3 x 18h part-time = 54 owner
     hours, 16 free of the 70-hour week; the managed two cost 0. */
  const cap = managementCapacityInfo(S);
  console.log(`portfolio hours: used ${cap.ownerHoursUsed}, free ${cap.ownerHoursFree} of 70`);
  check('owner hours are 54 (3 x 18h part-time)', cap.ownerHoursUsed === 54, `got ${cap.ownerHoursUsed}`);
  check('16 owner hours free of the 70-hour week', cap.ownerHoursFree === 16, `got ${cap.ownerHoursFree}`);
  settleHouseholdMonth(S);
  const nets = S.career.businesses.map((b) => b.lastPL.net);
  console.log('Egypt portfolio month-1 nets (re-measured on this tree):', nets.join(', '));
  console.log('stale v2.14-era brief nets (do NOT quote):', STALE_BRIEF_NETS.join(', '));
  check('five nets measured', nets.length === 5, `got ${nets.length}`);
  check('month-1 nets equal the re-measured current-tree numbers', nets.every((n, i) => n === MEASURED_NETS[i]), `got ${nets.join(', ')} vs measured ${MEASURED_NETS.join(', ')}`);
  check('month-1 nets are NOT the stale brief numbers', !nets.every((n, i) => n === STALE_BRIEF_NETS[i]), 'nets still equal the stale brief figures');
  check('month-1 nets total is the measured total (167,969)', nets.reduce((a, b) => a + b, 0) === 167969, `got ${nets.reduce((a, b) => a + b, 0)}`);
}

console.log(`\nTOTAL ${pass + fail} checks, ${pass} PASS, ${fail} FAIL`);
if (fail) { console.log('FAILURES:', failures.join(' | ')); process.exit(1); }
console.log('V219-W3-OK');
process.exit(0);
