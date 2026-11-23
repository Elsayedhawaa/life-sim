#!/usr/bin/env node
/* v2.19 Worker 4 verify — Standing at Work split (§0 item 4).
   Run from the game root: node tests/v219-w4-verify.mjs
   The desk's "Your Standing at Work" rendered the v2.15 market block
   as one unit (dashboard: boss, team, numbers as three lines in one
   div). This round splits it into the desk's own sections — boss,
   team, numbers — each once, each with what would move it, INSIDE
   the standing section (the desk stays 7 sections, each once).
   Every figure below is MEASURED on a grafted state — no quoted numbers.
   (a) desk: renderWorkTabHtml still has 7 desk sections, each once.
   (b) split: data-standing="boss" / "team" / "numbers" each exactly
       once, all inside the standing section (between data-desk
       "standing" and data-desk "actions"), each with its own heading
       once, and each with its "What would move it:" line carrying
       the real lever from getPerformanceDashboard.
   (c) nothing lost: the "Performance dashboard" intro, the record
       line and the promotion-interview line each appear once; the
       headhunter offer, pension and mentor & rival sections still
       render (unchanged code paths).
   (d) edge: with no manager the boss block still renders once, says
       "no manager on record" once, and prints no empty mover line
       (the v2.18 purge decision stands).
   (e) market header: the country-standard terms (medical / sick /
       leave) are still stated once above the listings — "What every
       job here comes with" appears exactly once.
   (f) ESM parse of src/ui/careerMarket.js (the only file changed).
   Exit 0 only when there are no FAILs. */
import { readFileSync } from 'node:fs';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: (k) => store.delete(k),
};

let pass = 0, fail = 0;
const failedNames = [];
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${name}${extra ? ' — ' + extra : ''}`); }
  else { fail++; failedNames.push(name); console.log(`FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}
const section = (t) => console.log(`\n--- ${t} ---`);

const { createNewLifeState, ensureExtendedState, createPerson } = await import('../src/core/schema.js');
const { renderWorkTabHtml } = await import('../src/ui/views.js');
const { getPerformanceDashboard } = await import('../src/systems/careerMarket.js');
await import('../src/main.js');

const count = (html, sub) => (html.split(sub).length - 1);
const between = (html, start, end) => {
  const i = html.indexOf(start);
  const j = html.indexOf(end, i);
  return i === -1 || j === -1 ? '' : html.slice(i, j);
};

function adultLife(cash = 5_000_000, seed = 777) {
  const S = createNewLifeState({ seed, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = cash;
  S.money.savings = 0;
  S.education.degrees = ['business', 'cs', 'medicine', 'engineering', 'pharmacy', 'law'];
  S.skills.financialIq = 45; S.skills.creativity = 45;
  S.legal.residency.kind = 'citizen';
  return S;
}
function employ(S, jobOver = {}) {
  S.career.employed = true;
  S.career.job = {
    employer: 'Orascom Construction', title: 'Site Engineer', track: 'engineering',
    level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 18,
    performance: 78, workMode: 'normal', bossId: null, ...jobOver
  };
  S.career.yearsExperience = 6;
  S.career.trackExperience = { engineering: 6 };
  return S.career.job;
}
function addPerson(S, over = {}) {
  const p = createPerson(S, {
    role: 'friend', relationLabel: 'Friend', residenceCountry: S.country, city: S.city,
    age: 34, affection: 70, respect: 60, trust: 60, ...over
  });
  S.people[p.id] = p;
  return p;
}
/* A life with a manager and colleagues, so all three levers exist. */
function staffedLife() {
  const S = adultLife();
  const boss = addPerson(S, { role: 'boss', relationLabel: 'Manager', firstName: 'Sara', age: 45, affection: 65, respect: 55, trust: 60 });
  employ(S, { bossId: boss.id });
  const c1 = addPerson(S, { role: 'colleague', relationLabel: 'Colleague', age: 30, affection: 70, respect: 65, trust: 70 });
  const c2 = addPerson(S, { role: 'colleague', relationLabel: 'Colleague', age: 28, affection: 60, respect: 55, trust: 60 });
  S.relations.colleagueIds = [c1.id, c2.id];
  return { S, boss };
}

/* ================= (a) the desk stays 7 sections ================= */
section('(a) career tab is still a desk: 7 sections, each once');
{
  const { S } = staffedLife();
  const html = renderWorkTabHtml(S);
  const desks = ['current-work', 'pay', 'contract', 'promotion', 'benefits', 'standing', 'actions'];
  for (const d of desks) {
    check(`desk section "${d}" appears exactly once`, count(html, `data-desk="${d}"`) === 1, `count ${count(html, `data-desk="${d}"`)}`);
  }
}

/* ================= (b) the split ================= */
section('(b) Standing at Work is split: boss, team, numbers — each once, each with its mover');
{
  const { S } = staffedLife();
  /* v2.19 W4 — snapshot the dashboard BEFORE rendering: rendering
     the tab grafts a senior colleague (mentor section) on first
     render, which moves the team average a point (63% → 62% on
     this life). The HTML carries the pre-render numbers. */
  const dash = getPerformanceDashboard(S);
  const html = renderWorkTabHtml(S);
  const standing = between(html, 'data-desk="standing"', 'data-desk="actions"');
  check('standing section found before the actions section', standing.length > 0, `${standing.length} chars`);
  for (const part of ['boss', 'team', 'numbers']) {
    check(`standing block "${part}" appears exactly once`, count(html, `data-standing="${part}"`) === 1, `count ${count(html, `data-standing="${part}"`)}`);
    check(`standing block "${part}" lives INSIDE the standing section`, standing.includes(`data-standing="${part}"`));
  }
  check('boss heading appears once', count(html, 'What your manager thinks') === 1, `count ${count(html, 'What your manager thinks')}`);
  check('team heading appears once', count(html, 'What the team thinks') === 1, `count ${count(html, 'What the team thinks')}`);
  check('numbers heading appears once', count(html, 'What the numbers say') === 1, `count ${count(html, 'What the numbers say')}`);
  const movers = count(html, 'What would move it:');
  console.log(`  movers: ${movers} "What would move it:" lines (boss/team/numbers)`);
  check('three "What would move it:" lines (boss, team, numbers)', movers === 3, `${movers} found`);
  check('boss mover line carries the real boss lever', !!dash.bossView.lever && html.includes(dash.bossView.lever), dash.bossView.lever);
  check('team mover line carries the real team lever', !!dash.teamView.lever && html.includes(dash.teamView.lever), dash.teamView.lever);
  check('numbers mover line carries the real numbers lever', !!dash.numbers.lever && html.includes(dash.numbers.lever), dash.numbers.lever);
  /* Each block's mover sits inside its own block, not pooled below. */
  for (const [part, lever] of [['boss', dash.bossView.lever], ['team', dash.teamView.lever], ['numbers', dash.numbers.lever]]) {
    const block = between(html, `data-standing="${part}"`, part === 'boss' ? 'data-standing="team"' : part === 'team' ? 'data-standing="numbers"' : 'On your record:');
    check(`"${part}" mover line sits inside the "${part}" block`, block.includes(lever), block.length ? `${block.length} chars` : 'block not found');
  }
  console.log(`  boss value ${dash.bossView.value}%, team value ${dash.teamView.value}%, numbers value ${dash.numbers.value}%`);
  check('boss block names the manager with affection/respect/trust', html.includes('Sara') && /affection 65, respect 55, trust 60/.test(html));
  check('team block states the colleague count', /2 colleague\(s\) on record/.test(html));
  check('numbers block states quality and attendance', new RegExp(`quality ${dash.numbers.quality}%, attendance ${dash.numbers.attendance}%`).test(html));
}

/* ================= (c) nothing lost ================= */
section('(c) nothing the dashboard used to say is lost');
{
  const { S } = staffedLife();
  const html = renderWorkTabHtml(S);
  check('"Performance dashboard" intro still appears once', count(html, 'Performance dashboard') === 1, `count ${count(html, 'Performance dashboard')}`);
  check('record line appears once', count(html, 'On your record:') === 1, `count ${count(html, 'On your record:')}`);
  check('promotion interview score line appears once', count(html, 'Promotion interview score:') === 1, `count ${count(html, 'Promotion interview score:')}`);
  check('pension heading appears once (market section owns it)', count(html, 'Pension —') === 1, `count ${count(html, 'Pension —')}`);
  check('mentor & rival section still renders', html.includes('Mentor &amp; rival'));
  check('no "Performance —" section (dashboard owns the three views)', !html.includes('Performance — '));
}

/* ================= (d) no-manager edge ================= */
section('(d) no manager on record: boss block once, no empty mover line');
{
  const S = adultLife();
  employ(S); /* bossId null — no manager */
  const c1 = addPerson(S, { role: 'colleague', relationLabel: 'Colleague', age: 30, affection: 70, respect: 65, trust: 70 });
  S.relations.colleagueIds = [c1.id];
  const dash = getPerformanceDashboard(S); /* snapshot before render — see (b) */
  const html = renderWorkTabHtml(S);
  check('boss lever is empty with no manager (v2.18 purge)', dash.bossView.lever === '', JSON.stringify(dash.bossView.lever));
  check('boss block still appears exactly once', count(html, 'data-standing="boss"') === 1, `count ${count(html, 'data-standing="boss"')}`);
  check('"no manager on record" appears once', count(html, 'no manager on record') === 1, `count ${count(html, 'no manager on record')}`);
  check('only two mover lines (team + numbers), no empty boss mover', count(html, 'What would move it:') === 2, `${count(html, 'What would move it:')} found`);
  check('team and numbers blocks still appear once each', count(html, 'data-standing="team"') === 1 && count(html, 'data-standing="numbers"') === 1);
}

/* ================= (e) market header still states the terms once ================= */
section('(e) market header still states the country-standard terms once');
{
  const { S } = staffedLife();
  const html = renderWorkTabHtml(S);
  check('"What every job here comes with" appears exactly once', count(html, 'What every job here comes with') === 1, `count ${count(html, 'What every job here comes with')}`);
  const header = between(html, 'What every job here comes with', '</p>');
  check('header states medical insurance', /medical insurance/.test(header), header.slice(0, 120));
  check('header states annual leave', /Annual leave/.test(header));
  check('header states sick leave', /Sick leave/.test(header));
}

/* ================= (f) ESM parse of the changed file ================= */
section('(f) ESM parse of the changed file');
{
  let ok = false, err = '';
  try { await import('../src/ui/careerMarket.js'); ok = true; } catch (e) { err = e.message; }
  check('src/ui/careerMarket.js imports cleanly', ok, err);
  const src = readFileSync(new URL('../src/ui/careerMarket.js', import.meta.url), 'utf8');
  check('no other render function in careerMarket.js was touched (only renderDashboardHtml carries the split note)', (src.match(/v2\.19 W4/g) || []).length === 1, `${(src.match(/v2\.19 W4/g) || []).length} v2.19 W4 notes`);
}

console.log(`\n${pass} passed, ${fail} failed${failedNames.length ? ` — FAILED: ${failedNames.join(', ')}` : ''}`);
process.exit(fail ? 1 : 0);
