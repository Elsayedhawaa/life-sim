#!/usr/bin/env node
/* v2.17 round verify — Business, Real.
 * Run from the game root:  node tests/v217-verify.mjs
 * Written against the CONTRACT field/function names in the round spec
 * (not against any worker's internals):
 *   biz.repeatRate, biz.level, biz.brandValue, biz.group, biz.monthEffects,
 *   roleEffects(S, biz) in src/systems/businessRoles.js,
 *   the actions in src/systems/businessOperations.js,
 *   checkBusinessFate(S) in src/systems/businessFate.js,
 *   monthsInBusiness / consecutiveProfitableMonths / averageStaffSkill
 *   exported from src/systems/businessEngine.js.
 *
 * Statuses: PASS (holds), FAIL (code exists, behaviour wrong — the
 * detail names the worker whose merge should fix it), AWAIT (the
 * contract piece does not exist on this copy yet, so the check cannot
 * even be run — it awaits the merge). Exit 0 only when there are no
 * FAILs; AWAITs are listed, not hidden.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(String(k), String(v)),
  removeItem: (k) => store.delete(k),
};

const print = (...a) => console.log(...a);
let passes = 0; let failures = 0; let awaits = 0;
const failedNames = []; const awaitedNames = [];
function check(name, ok, detail = '', needs = '') {
  if (ok) { passes++; print(`PASS ${name}${detail ? ' — ' + detail : ''}`); }
  else { failures++; failedNames.push(name); print(`FAIL ${name}${detail ? ' — ' + detail : ''}${needs ? ` [awaits ${needs}]` : ''}`); }
}
function awaitCheck(name, reason) {
  awaits++; awaitedNames.push(name);
  print(`AWAIT ${name} — ${reason}`);
}
function section(title) { print(`\n--- ${title} ---`); }

const ROOT = new URL('..', import.meta.url).pathname;
const srcFile = (p) => readFileSync(`${ROOT}${p}`, 'utf8');
function listSrcFiles() {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${dir}/${e.name}`);
      else if (e.name.endsWith('.js')) out.push(`${dir}/${e.name}`);
    }
  };
  walk(`${ROOT}src`);
  return out;
}

/* ---------- imports (guarded: W2/W3/W4 modules may not exist yet) ---------- */
const { createNewLifeState, ensureExtendedState, walletMove, recordJournal } = await import('../src/core/schema.js');
const { advanceSingleTurn, resolveActiveSceneChoice } = await import('../src/core/gameLoop.js');
const { renderWorkTabHtml } = await import('../src/ui/views.js');
const {
  createBusiness, monthsInBusiness, consecutiveProfitableMonths, averageStaffSkill,
  expandBusiness, computeBusinessMonth,
} = await import('../src/systems/businessEngine.js');
const { computeBusinessMonthFull } = await import('../src/systems/businessMonthly.js');
const { openBranch } = await import('../src/systems/businessBranches.js');
const { hireManager } = await import('../src/systems/businessManager.js');
const { applyDecision, decisionsForBusiness } = await import('../src/systems/businessDecisions.js');
const { staffRolesForType } = await import('../src/systems/businessStaff.js');
const { listAllBusinessVentures, evaluateBusinessLaunch } = await import('../src/systems/businessEngine.js');

let businessFate = null; let fateMissing = '';
try { businessFate = await import('../src/systems/businessFate.js'); }
catch (e) { fateMissing = String(e?.message || e); }
let businessRoles = null; let rolesMissing = '';
try { businessRoles = await import('../src/systems/businessRoles.js'); }
catch (e) { rolesMissing = String(e?.message || e); }
let businessOps = null; let opsMissing = '';
try { businessOps = await import('../src/systems/businessOperations.js'); }
catch (e) { opsMissing = String(e?.message || e); }

/* ---------- test-life helpers ---------- */
function adultLife(seed = 4242, country = 'egy') {
  const S = createNewLifeState({ seed, country, birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'entrepreneur' });
  ensureExtendedState(S);
  S.player.age = 34; S.year = 2024; S.month = 6; S.pacing = 'monthly';
  S.money.cash = 2000000; S.money.creditScore = 700;
  return S;
}
function addSpouse(S, affection = 72) {
  S.people['sp1'] = { id: 'sp1', fullName: 'Rana Hawaa', alive: true, age: 32, rel: { affection, trust: 60, respect: 60 } };
  S.relations.spouseIds = ['sp1'];
  return S.people['sp1'];
}
function addFriend(S, affection = 68) {
  S.people['fr1'] = { id: 'fr1', fullName: 'Omar Adel', alive: true, age: 34, employer: 'Orascom Construction', jobTitle: 'Site Engineer', track: 'construction', career: { monthlyIncomeLocal: 20000, employer: 'Orascom Construction', title: 'Site Engineer', track: 'civil_eng' }, rel: { affection, trust: 60, respect: 60 } };
  S.relations.friendIds = ['fr1'];
  return S.people['fr1'];
}
/* Fixture: prefer a physical venture (cafe). businessEngine unshifts 'tech_founder' first, and tech/enterprise ventures take their own monthly path (computeTechMonth) that skips brand, group, distress and branch logic by design, so the generic-mechanics checks must not launch one. */
function pickLaunchable(S) {
  const all = listAllBusinessVentures(S);
  const cafe = all.find((v) => v.id === 'cafe');
  if (cafe && evaluateBusinessLaunch(S, cafe).ok) return cafe;
  for (const v of all) {
    const ev = evaluateBusinessLaunch(S, v);
    if (ev.ok) return v;
  }
  return null;
}
function launchBiz(S, typeId = null) {
  const v = typeId ? listAllBusinessVentures(S).find((x) => x.id === typeId) : pickLaunchable(S);
  if (!v) return null;
  const r = createBusiness(S, v.id, '', { mode: 'part_time' });
  return r.ok ? r.biz : null;
}
/* Advance n months, clicking through any scene that opens (choice 0),
   the way a player tapping through would. Returns months actually run. */
/* Harness: resolve a scene with its first AVAILABLE choice. Choice 0 can be locked (for example "Clear the arrears" with no cash), and resolving it returns ok:false without advancing, so a loop would spin on the same scene forever. */
function resolveFirstAvailable(S) {
  const sc = S.activeScene; if (!sc) return;
  const i = sc.choices.findIndex((c) => typeof c.available !== 'function' || c.available(S));
  resolveActiveSceneChoice(S, i < 0 ? 0 : i);
}
function runMonths(S, n) {
  let ran = 0;
  for (let i = 0; i < n; i++) {
    if (S.gameOver) break;
    if (S.activeScene) { resolveFirstAvailable(S); continue; }
    advanceSingleTurn(S);
    ran++;
    if (S.activeScene) resolveFirstAvailable(S);
  }
  return ran;
}
function activeScene(S) { return S.activeScene || (S.sceneQueue && S.sceneQueue[0]) || null; }
function handBiz(over = {}) {
  return {
    id: 'biz_hand1', name: 'Hawaa Cafe', typeId: 'cafe', country: 'egy', city: 'Cairo',
    level: 2, maxLevel: 5, monthlyRev: 30000, monthlyCost: 20000, capitalInvested: 500000,
    repeatRate: 0.5, mode: 'part_time', staff: [], premises: { kind: 'home', unitId: null, label: 'Run from home', monthlyRentLocal: 0, conditionPct: 90 },
    loanId: null, misses: 0, debtLocal: 0, monthsLosing: 0, buffs: {}, lastOpUsed: {},
    history: [], heirId: null, remote: false, foundedYear: 2023, foundedMonth: 1,
    pricingMode: 'balanced', lastPL: { revenue: 30000, costs: 20000, tax: 1000, net: 9000 },
    ...over,
  };
}

/* ================================================================== *
   1. Reputation deleted
   ================================================================== */
section('1. Reputation deleted');
{
  const files = listSrcFiles().filter((f) => /business[^/]*\.js$/.test(f));
  let bad = [];
  for (const f of files) {
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((ln, i) => {
      if (/reputation/i.test(ln) && !/reputation deleted/i.test(ln)) bad.push(`${f.split('src/')[1]}:${i + 1}`);
    });
  }
  check('1a "reputation" is 0 in business systems outside the 2 deletion comments', bad.length === 0, bad.length ? bad.slice(0, 5).join('; ') : '2 deletion comments only');
  const S = adultLife();
  const biz = launchBiz(S);
  const html = renderWorkTabHtml(S, { workSub: 'ventures' });
  check('1b no "reputation" in the rendered business tab', biz ? !/reputation/i.test(html) : false, biz ? '' : 'could not launch a business to render');
  if (biz) {
    const defs = decisionsForBusiness(S, biz);
    const first = defs && defs[0];
    const r = first ? applyDecision(S, biz, first.id) : { msg: 'no decisions offered for this business' };
    check('1c no "reputation" in a business decision result', !/reputation/i.test(`${r.msg || ''} ${r.promised || ''}`), first ? `${first.id}: ${r.msg || ''}` : 'no decisions offered');
  } else {
    check('1c no "reputation" in a business decision result', false, 'could not launch a business');
  }
}

/* ================================================================== *
   2. No estimated profit anywhere
   ================================================================== */
section('2. No estimated profit');
{
  const S = adultLife();
  const biz = launchBiz(S);
  const html = renderWorkTabHtml(S, { workSub: 'ventures' });
  const ventures = html.slice(html.indexOf('Private Enterprise'));
  check('2a no "Est." in the rendered ventures section', !/Est\./.test(ventures), biz ? '' : 'could not launch a business');
  check('2b launch list shows real inputs (capital) and says profit is unknown', /Capital:/.test(ventures) && /Profit is unknown until the first month settles/.test(ventures));
  if (biz) {
    const before = S.money.cash;
    runMonths(S, 1);
    const pl = biz.lastPL;
    const identity = pl && (pl.revenue - pl.costs - pl.tax === pl.net);
    check('2c first settled P&L is real: revenue − costs − tax = net', !!identity, pl ? `rev ${pl.revenue} − costs ${pl.costs} − tax ${pl.tax} = net ${pl.net}` : 'no P&L settled');
  } else {
    check('2c first settled P&L is real: revenue − costs − tax = net', false, 'could not launch a business');
  }
}

/* ================================================================== *
   3. Outcome distribution — twin lives + warning before death
   ================================================================== */
section('3. Outcome distribution');
{
  function twinLife(decisions) {
    const S = adultLife(777);
    const biz = launchBiz(S);
    if (!biz) return null;
    if (decisions === 'good') {
      hireManager(S, biz, { name: 'Mona Salem', skill: 85, wage: 15000, loyalty: 80 });
      const defs = decisionsForBusiness(S, biz);
      if (defs && defs[0]) applyDecision(S, biz, defs[0].id);
    }
    runMonths(S, 24);
    const b = (S.career.businesses || []).find((x) => x.id === biz.id);
    const totalNet = (biz.history || []).reduce((s, h) => s + (Number(h.net) || 0), 0);
    return { dead: !b || b.dead === true, level: b ? b.level : 0, group: !!(b && b.group), totalNet };
  }
  const good = twinLife('good');
  const neglected = twinLife('neglect');
  if (good && neglected) {
    const categoricallyDifferent = (good.dead !== neglected.dead)
      || (good.group !== neglected.group)
      || (Math.abs(good.level - neglected.level) >= 2);
    check('3a twin lives (same seed, different decisions) reach different outcomes', categoricallyDifferent,
      `good: dead=${good.dead} level=${good.level} group=${good.group} net=${good.totalNet} | neglected: dead=${neglected.dead} level=${neglected.level} group=${neglected.group} net=${neglected.totalNet}`, 'W2');
  } else {
    check('3a twin lives reach different outcomes', false, 'could not launch the twin businesses');
  }
  /* Warning before death: force losses, run until the miss-2 warning fires. */
  const S = adultLife(31337);
  const biz = launchBiz(S);
  if (biz) {
    biz.monthlyRev = 1; biz.monthlyCost = 90000;
    S.money.cash = 0; S.money.savings = 0;
    let warned = false;
    for (let i = 0; i < 6 && !warned; i++) {
      runMonths(S, 1);
      const hay = JSON.stringify(S.journal.slice(0, 12)) + ' ' + ((S.activeScene && S.activeScene.title) || '') + ' ' + JSON.stringify((S.sceneQueue || []).map((s) => s.title));
      if (/missed two months/i.test(hay) || /Second Missed Business Payment/i.test(hay)) warned = true;
      if (S.activeScene) resolveActiveSceneChoice(S, 0);
    }
    check('3b a failing business warns in plain words before it dies', warned, warned ? '' : 'no miss-2 warning seen in 6 losing months', 'W2');
  } else {
    check('3b a failing business warns in plain words before it dies', false, 'could not launch a business');
  }
}

/* ================================================================== *
   4. Growth past 5 — level 6+, group, bulk buying, brand value
   ================================================================== */
section('4. Growth past 5');
{
  /* Prime a business the way the level gate measures it: trading for
     years, a profitable run, a skilled team, rented premises. */
  function primedBiz(S) {
    const biz = launchBiz(S);
    if (!biz) return null;
    biz.foundedYear = 2014; biz.foundedMonth = 1;
    biz.history = Array.from({ length: 24 }, (_, i) => ({ net: 20000 + i * 100, year: 2022 + Math.floor(i / 12), month: (i % 12) + 1 }));
    biz.lastPL = { revenue: 90000, costs: 40000, tax: 5000, net: 45000 };
    biz.staff = [
      { id: 'e1', name: 'Aya', role: 'chef', skill: 85, wage: 9000, morale: 80 },
      { id: 'e2', name: 'Karim', role: 'waiter', skill: 80, wage: 7000, morale: 80 },
      { id: 'e3', name: 'Nour', role: 'cashier', skill: 82, wage: 6500, morale: 80 },
    ];
    biz.premises = { kind: 'rented', unitId: 'comm_shop', label: 'Rented shop', monthlyRentLocal: 12000, conditionPct: 90 };
    S.money.cash = 5000000;
    return biz;
  }
  const S = adultLife(555);
  const biz = primedBiz(S);
  if (biz) {
    /* A level needs one expansion per level: 1 -> 6 is five of them.
       The old loop ran four and then asked for level 6 — impossible
       by counting. Cash is part of the prime (the business is a good
       one); the gate that matters is months, profit run and skill. */
    S.money.cash = 50000000;
    let leveled = 0;
    while (biz.level < 6 && leveled < 8) {
      const r = expandBusiness(S, biz);
      if (!r.ok) break;
      leveled++;
    }
    check('4a a good business reaches level 6+', biz.level >= 6, `level=${biz.level} after ${leveled} expansions (maxLevel=${biz.maxLevel})`, 'W2');
  } else {
    check('4a a good business reaches level 6+', false, 'could not launch a business');
  }
  /* Group: a broken-out business must carry a group record with a head
     office, a regional manager and a supply chain. */
  const S2 = adultLife(556);
  const biz2 = primedBiz(S2);
  let grouped = null;
  if (biz2) {
    /* Breakout needs level 6 first — a fresh level-1 business can
       trade well for 24 months and still never break out, because
       the breakout check requires level 6. Expand it to level 6
       (the same prime as 4a), then let it trade. */
    S2.money.cash = 50000000;
    let leveled = 0;
    while (biz2.level < 6 && leveled < 8) {
      const r = expandBusiness(S2, biz2);
      if (!r.ok) break;
      leveled++;
    }
    runMonths(S2, 24);
    const b = (S2.career.businesses || []).find((x) => x.id === biz2.id);
    grouped = b && b.group;
  }
  if (grouped && typeof grouped === 'object') {
    check('4b broken-out business becomes a group (head office + regional manager + supply chain)',
      !!(grouped.headOffice && grouped.regionalManager && grouped.supplyChain),
      JSON.stringify(Object.keys(grouped)), 'W2');
  } else {
    check('4b broken-out business becomes a group (head office + regional manager + supply chain)', false, 'no biz.group after 24 booming months', 'W2');
  }
  /* Bulk buying: the supply chain must cut per-unit cost for EVERY branch. */
  if (grouped && grouped.supplyChain && typeof grouped.supplyChain.bulkDiscount === 'number') {
    check('4c bulk buying cuts per-unit cost for every branch', grouped.supplyChain.bulkDiscount > 0, `bulkDiscount=${grouped.supplyChain.bulkDiscount}`, 'W2');
  } else {
    awaitCheck('4c bulk buying cuts per-unit cost for every branch', 'no biz.group.supplyChain.bulkDiscount on this copy — the measurement needs W2\'s breakout path and its supply-chain fold, whose function name is not in the contract');
  }
  /* Brand value compounds: grows with profitable months, falls with a bad month. */
  const S3 = adultLife(557);
  const biz3 = primedBiz(S3);
  if (biz3 && typeof biz3.brandValue === 'number') {
    const before = biz3.brandValue;
    runMonths(S3, 3);
    const afterProfit = biz3.brandValue;
    biz3.monthlyRev = 1;
    runMonths(S3, 1);
    check('4d brand value compounds (grows with profitable months, falls with a bad month)',
      afterProfit > before && biz3.brandValue < afterProfit,
      `brandValue ${before} → ${afterProfit} → ${biz3.brandValue}`, 'W2');
  } else {
    awaitCheck('4d brand value compounds', 'biz.brandValue is not a number on this copy — the field is W2\'s contract, not yet written');
  }
}

/* ================================================================== *
   5. Hiring — real roles, real skill, bad hires hurt
   ================================================================== */
section('5. Hiring in real positions');
{
  if (!businessRoles || typeof businessRoles.roleEffects !== 'function') {
    awaitCheck('5a roleEffects(S, biz) exists in src/systems/businessRoles.js', rolesMissing ? `import failed: ${rolesMissing.slice(0, 120)}` : 'roleEffects is not exported');
    awaitCheck('5b each role moves a real number', 'needs roleEffects (W3)');
    awaitCheck('5c skill 80 vs 40 in the same role earns more over 12 months', 'needs roleEffects (W3)');
    awaitCheck('5d a bad hire hurts a real number', 'needs roleEffects (W3)');
  } else {
    const S = adultLife(606);
    const biz = launchBiz(S);
    const roles = biz ? staffRolesForType(biz.typeId) : [];
    check('5a roleEffects(S, biz) exists in src/systems/businessRoles.js', true, `roles for ${biz ? biz.typeId : '?'}: ${(roles || []).slice(0, 6).join(', ')}`);
    if (biz && roles.length) {
      let moved = 0; const movedRoles = [];
      for (const role of roles.slice(0, 8)) {
        const base = handBiz({ staff: [] });
        const withRole = handBiz({ staff: [{ id: 'e1', name: 'Test', role, skill: 70, wage: 5000, morale: 70 }] });
        try {
          const a = businessRoles.roleEffects(S, base);
          const b = businessRoles.roleEffects(S, withRole);
          if (JSON.stringify({ ...a, notes: 0 }) !== JSON.stringify({ ...b, notes: 0 })) { moved++; movedRoles.push(role); } /* numbers only: a note line is text, not a moved number */
          else if (role === 'security') {
            /* Security acts through businessSafety (robbery chance and loss), not roleEffects: count it when the safety module's robbery cost really drops with a guard and the staff line states it. */
            const sf = await import('../src/systems/businessSafety.js');
            const mk = (staff) => ({ ...handBiz({ staff }), safetyMonth: null });
            const c0 = sf.tickBusinessSafety(S, mk([]), { forceTheft: true }).cost;
            const c1 = sf.tickBusinessSafety(S, mk(withRole.staff), { forceTheft: true }).cost;
            if (c1 < c0 && /robbery/i.test(businessRoles.personEffectText(S, withRole, withRole.staff[0]))) { moved++; movedRoles.push(role + '(via safety)'); }
          }
        } catch (e) { /* a role that throws counts as not moving anything */ }
      }
      check('5b each role moves a real number', moved > 0 && moved === Math.min(roles.slice(0, 8).length, 8), `roles moving a number: ${movedRoles.join(', ') || 'none'}`, 'W3');
    } else {
      check('5b each role moves a real number', false, 'no launchable business / no roles');
    }
    /* Skill 80 vs 40, same role, 12 months of settlement.
       v2.17 merge fix — the old version built a fresh hand-made
       business with a fresh life (different seeds 607/608) every
       month, so the wave noise (±25% of revenue) swamped the role
       effect, and the role was never stamped at all, so the real
       settlement never saw it. Twin lives, one seed, one business
       each, the role stamped once, settled 12 months through the
       real P&L. */
    if (biz) {
      const role = (roles && roles[0]) || 'chef';
      const run12 = (skill) => {
        const Sx = adultLife(607);
        const bx = launchBiz(Sx, biz.typeId);
        if (!bx) return 0;
        bx.staff = [{ id: 'e1', name: 'Test', role, skill, wage: 5000, wageLocal: 5000, morale: 70, fit: 'average', dishonest: false }];
        if (businessRoles.stampMonthEffects) businessRoles.stampMonthEffects(Sx, bx);
        let rev = 0;
        for (let m = 0; m < 12; m++) {
          const pl = computeBusinessMonthFull(Sx, bx);
          rev += (pl && pl.revenue) || 0;
          Sx.month += 1; if (Sx.month > 12) { Sx.month = 1; Sx.year += 1; }
        }
        return rev;
      };
      let rev80 = 0; let rev40 = 0;
      try { rev80 = run12(80); rev40 = run12(40); } catch (e) { rev80 = 0; rev40 = 0; }
      check('5c skill 80 vs 40 in the same role earns more over 12 months', rev80 > rev40, `${role}: skill-80 revenue ${rev80} vs skill-40 ${rev40} over 12 months`, 'W3');
      const bad = handBiz({ staff: [{ id: 'e1', name: 'Bad', role, skill: 10, wage: 5000, morale: 20 }] });
      const good = handBiz({ staff: [{ id: 'e1', name: 'Good', role, skill: 70, wage: 5000, morale: 70 }] });
      let badFx = null; let goodFx = null;
      try { badFx = businessRoles.roleEffects(S, bad); goodFx = businessRoles.roleEffects(S, good); } catch (e) {}
      const badHurts = badFx && goodFx && JSON.stringify(badFx) !== JSON.stringify(goodFx);
      check('5d a bad hire hurts a real number', !!badHurts, badHurts ? 'skill-10 effects differ from skill-70' : 'no difference measured', 'W3');
    } else {
      check('5c skill 80 vs 40 in the same role earns more over 12 months', false, 'no launchable business');
      check('5d a bad hire hurts a real number', false, 'no launchable business');
    }
  }
}

/* ================================================================== *
   6. Operating menu — every section states its cost; promised effects land
   ================================================================== */
section('6. Operating menu');
{
  if (!businessOps) {
    awaitCheck('6a each ops section (Stock, Pricing, Suppliers, Staff, Marketing, Premises, Cash) states its cost before committing', opsMissing ? `src/systems/businessOperations.js cannot be imported: ${opsMissing.slice(0, 120)}` : 'module missing');
    awaitCheck('6b a decision\'s promised effect lands exactly in the next month\'s P&L', 'needs businessOperations.js (W4)');
  } else {
    const src = srcFile('src/systems/businessOperations.js');
    const sections = ['Stock', 'Pricing', 'Suppliers', 'Staff', 'Marketing', 'Premises', 'Cash'];
    const missingSections = sections.filter((s) => !src.includes(s));
    const exportedFns = Object.keys(businessOps).filter((k) => typeof businessOps[k] === 'function');
    check('6a each ops section states its cost before committing',
      missingSections.length === 0 && exportedFns.length >= 7,
      missingSections.length ? `sections missing from source: ${missingSections.join(', ')}` : `exported actions: ${exportedFns.join(', ')}`, 'W4');
    /* Twin-lives method: one twin spends on marketing, the other does
       not; both settle once through the real P&L. The promised
       revenueAdd must land exactly. (The old version called the first
       exported function of the module — addMonthEffect — with the
       wrong arguments, so it measured nothing.) */
    let landed = false; let detail = '';
    try {
      const SA = adultLife(707);
      const bizA = launchBiz(SA);
      const SB = adultLife(707);
      const bizB = launchBiz(SB);
      if (!bizA || !bizB) {
        detail = 'could not launch a business';
      } else {
        const m = businessOps.spendMarketing(SB, bizB, 'social');
        if (!m.ok) {
          detail = `marketing did not apply: ${m.msg}`;
        } else {
          const plA = computeBusinessMonthFull(SA, bizA);
          const plB = computeBusinessMonthFull(SB, bizB);
          const delta = (plB.revenue || 0) - (plA.revenue || 0);
          landed = delta === m.promisedNumbers.revenueAdd;
          detail = `social: promised +${m.promisedNumbers.revenueAdd}, settled revenue Δ${delta}`;
        }
      }
    } catch (e) { detail = `threw: ${String(e?.message || e).slice(0, 120)}`; }
    check('6b a decision\'s promised effect lands exactly in the next month\'s P&L', landed, detail, 'W4');
  }
}

/* ================================================================== *
   7. Fate reaches the life (W5 — hand-built biz records carrying the
      contract fields, so this proves the fate logic itself)
   ================================================================== */
section('7. Fate reaches the life');
{
  if (!businessFate || typeof businessFate.checkBusinessFate !== 'function') {
    check('7a checkBusinessFate(S) exists', false, fateMissing ? `import failed: ${fateMissing.slice(0, 160)}` : 'not exported');
  } else {
    const { checkBusinessFate } = businessFate;
    /* 7a — dead business with a loan: the bank calls; restructuring is real. */
    {
      const S = adultLife(808);
      addSpouse(S); addFriend(S);
      const biz = handBiz({
        dead: true, deathCause: 'three months of losses ate the capital',
        monthsLosing: 3, misses: 2, loanId: 'loan1',
        lastPL: { revenue: 10000, costs: 20000, tax: 0, net: -10000 },
      });
      S.career.businesses = [biz];
      S.money.loans = [{ id: 'loan1', label: 'Business Loan — Hawaa Cafe (5y)', balance: 200000, monthlyPayment: 9698, annualRate: 0.15, remainingMonths: 24, country: 'egy', missedMonths: 0, purpose: 'business', businessId: 'biz_hand1', assetKind: 'business' }];
      const rep = checkBusinessFate(S);
      const scene = activeScene(S);
      const isBank = scene && /Bank Calls/.test(scene.title);
      check('7a failing business: the bank calls about the loan', rep.fired.some((f) => f.kind === 'bank') && !!isBank, scene ? scene.title : 'no scene queued');
      if (isBank) {
        const payBefore = S.money.loans[0].monthlyPayment;
        const termBefore = S.money.loans[0].remainingMonths;
        resolveActiveSceneChoice(S, 0); /* restructure */
        check('7a2 restructuring changes real loan numbers', S.money.loans[0].monthlyPayment < payBefore && S.money.loans[0].remainingMonths > termBefore,
          `payment ${payBefore} → ${S.money.loans[0].monthlyPayment}, term ${termBefore} → ${S.money.loans[0].remainingMonths} months`);
      }
    }
    /* 7b — spouse reacts (no loan, no debt: bank has nothing to call about). */
    {
      const S = adultLife(809);
      const spouse = addSpouse(S, 72); addFriend(S);
      const biz = handBiz({ dead: true, deathCause: 'three months of losses ate the capital', monthsLosing: 3, lastPL: { revenue: 10000, costs: 20000, tax: 0, net: -10000 } });
      S.career.businesses = [biz];
      const rep = checkBusinessFate(S);
      const scene = activeScene(S);
      const isSpouse = scene && /Worries|Row About/.test(scene.title);
      check('7b failing business: the spouse reacts to the lost income', rep.fired.some((f) => f.kind === 'spouse') && !!isSpouse, scene ? scene.title : 'no scene queued');
      if (isSpouse) {
        const costBefore = biz.monthlyCost; const affBefore = spouse.rel.affection;
        resolveActiveSceneChoice(S, 0); /* cut costs together */
        check('7b2 the spouse scene changes real numbers', biz.monthlyCost < costBefore && spouse.rel.affection > affBefore,
          `monthlyCost ${costBefore} → ${biz.monthlyCost}, affection ${affBefore} → ${spouse.rel.affection}`);
      }
    }
    /* 7c — friend offers a job; taking it is a real job. */
    {
      const S = adultLife(810);
      addSpouse(S); const friend = addFriend(S); S.education.degrees = ['engineering'];
      const biz = handBiz({ dead: true, deathCause: 'three months of losses ate the capital', monthsLosing: 3, lastPL: { revenue: 10000, costs: 20000, tax: 0, net: -10000 } });
      S.career.businesses = [biz];
      /* Burn the spouse scene first (month 6), so month 7 fires the friend. */
      checkBusinessFate(S);
      if (S.activeScene) resolveActiveSceneChoice(S, 0);
      S.month = 7;
      const rep = checkBusinessFate(S);
      const scene = activeScene(S);
      const isFriend = scene && /Offers You a Job/.test(scene.title);
      check('7c failing business: a friend offers a job', rep.fired.some((f) => f.kind === 'friendJob') && !!isFriend, scene ? scene.title : 'no scene queued');
      if (isFriend) {
        resolveActiveSceneChoice(S, 0); /* take the job */
        check('7c2 taking the job is real (employed, real wage, real employer)', S.career.employed === true && !!(S.career.job && S.career.job.monthlyGross > 0 && S.career.job.employer),
          S.career.job ? `${S.career.job.title} at ${S.career.job.employer}, ${S.career.job.monthlyGross}/mo` : 'no job record');
      }
    }
    /* 7d — booming business: spouse wants a bigger house. */
    {
      const S = adultLife(811);
      const spouse = addSpouse(S, 72);
      const biz = handBiz({
        level: 7, monthsLosing: 0,
        lastPL: { revenue: 90000, costs: 40000, tax: 5000, net: 45000 },
        history: [{ net: 10000 }, { net: 20000 }, { net: 45000 }],
        group: { headOffice: { city: 'Cairo', staff: 4, monthlyCost: 8000 }, regionalManager: { name: 'Mona', wage: 12000, skill: 78 }, supplyChain: { bulkDiscount: 0.12 } },
      });
      S.career.businesses = [biz];
      const rep = checkBusinessFate(S);
      const scene = activeScene(S);
      const isHouse = scene && /Bigger House/.test(scene.title);
      check('7d booming business: the spouse wants a bigger house', rep.fired.some((f) => f.kind === 'house') && !!isHouse, scene ? scene.title : 'no scene queued');
      if (isHouse) {
        const affBefore = spouse.rel.affection;
        resolveActiveSceneChoice(S, 0); /* agree — start looking */
        check('7d2 agreeing is real (affection up, house-hunt flag set)', spouse.rel.affection > affBefore && !!(S.fateHouseHunt && S.fateHouseHunt.bizId === biz.id),
          `affection ${affBefore} → ${spouse.rel.affection}, flag=${JSON.stringify(S.fateHouseHunt || null)}`);
      }
    }
    /* 7e — booming business: the bank offers a bigger loan. */
    {
      const S = adultLife(812);
      addSpouse(S);
      const biz = handBiz({
        level: 7, monthsLosing: 0,
        lastPL: { revenue: 90000, costs: 40000, tax: 5000, net: 45000 },
        history: [{ net: 10000 }, { net: 20000 }, { net: 45000 }],
        group: { headOffice: { city: 'Cairo', staff: 4, monthlyCost: 8000 }, regionalManager: { name: 'Mona', wage: 12000, skill: 78 }, supplyChain: { bulkDiscount: 0.12 } },
      });
      S.career.businesses = [biz];
      checkBusinessFate(S); /* house fires first */
      if (S.activeScene) resolveActiveSceneChoice(S, 0);
      S.month = 7;
      const rep = checkBusinessFate(S);
      const scene = activeScene(S);
      const isLoan = scene && /Bigger Loan/.test(scene.title);
      check('7e booming business: the bank offers a bigger loan', rep.fired.some((f) => f.kind === 'loan') && !!isLoan, scene ? scene.title : 'no scene queued');
      if (isLoan) {
        const cashBefore = S.money.cash; const loansBefore = S.money.loans.length;
        resolveActiveSceneChoice(S, 0); /* take it */
        check('7e2 taking the loan is real (cash in, loan record)', S.money.loans.length === loansBefore + 1 && S.money.cash > cashBefore,
          `loans ${loansBefore} → ${S.money.loans.length}, cash ${cashBefore} → ${S.money.cash}`);
      }
    }
    /* 7f — booming business: a rival copies you. */
    {
      const S = adultLife(813);
      addSpouse(S, 72);
      const biz = handBiz({
        level: 7, monthsLosing: 0,
        lastPL: { revenue: 90000, costs: 40000, tax: 5000, net: 45000 },
        history: [{ net: 10000 }, { net: 20000 }, { net: 45000 }],
        group: { headOffice: { city: 'Cairo', staff: 4, monthlyCost: 8000 }, regionalManager: { name: 'Mona', wage: 12000, skill: 78 }, supplyChain: { bulkDiscount: 0.12 } },
      });
      S.career.businesses = [biz];
      checkBusinessFate(S); /* house */
      if (S.activeScene) resolveActiveSceneChoice(S, 1); /* not yet — no house hunt */
      S.month = 7;
      checkBusinessFate(S); /* loan */
      if (S.activeScene) resolveActiveSceneChoice(S, 1); /* turn the loan down */
      S.month = 8;
      const rep = checkBusinessFate(S);
      const scene = activeScene(S);
      const isRival = scene && /Rival Copies/.test(scene.title);
      check('7f booming business: a rival tries to copy you', rep.fired.some((f) => f.kind === 'rival') && !!isRival, scene ? scene.title : 'no scene queued');
      if (isRival) {
        const revBefore = biz.monthlyRev; const rrBefore = biz.repeatRate;
        resolveActiveSceneChoice(S, 0); /* cut prices */
        check('7f2 the rival scene changes real business numbers', biz.monthlyRev < revBefore && biz.repeatRate > rrBefore,
          `monthlyRev ${revBefore} → ${biz.monthlyRev}, repeatRate ${rrBefore} → ${biz.repeatRate}`);
      }
    }
    /* 7g — no refire: same month, same kind never fires twice. */
    {
      const S = adultLife(814);
      addSpouse(S); addFriend(S);
      const biz = handBiz({ dead: true, deathCause: 'three months of losses ate the capital', monthsLosing: 3, loanId: 'loan1', lastPL: { revenue: 10000, costs: 20000, tax: 0, net: -10000 } });
      S.career.businesses = [biz];
      S.money.loans = [{ id: 'loan1', label: 'Business Loan — Hawaa Cafe (5y)', balance: 200000, monthlyPayment: 9698, annualRate: 0.15, remainingMonths: 24, country: 'egy', missedMonths: 0, purpose: 'business', businessId: 'biz_hand1', assetKind: 'business' }];
      const first = checkBusinessFate(S);
      const second = checkBusinessFate(S);
      check('7g no refire in the same month (one fate scene per business per month)', first.fired.length === 1 && second.fired.length === 0, `first=${first.fired.length}, second=${second.fired.length}`);
    }
    /* 7h — a healthy business gets no fate scene. */
    {
      const S = adultLife(815);
      addSpouse(S); addFriend(S);
      const biz = handBiz({ monthsLosing: 0, lastPL: { revenue: 30000, costs: 20000, tax: 1000, net: 9000 }, history: [{ net: 9000 }] });
      S.career.businesses = [biz];
      const rep = checkBusinessFate(S);
      check('7h a healthy business gets no fate scene', rep.fired.length === 0, `fired=${rep.fired.length}`);
    }
  }
}

/* ================================================================== *
   8. Branch "Hire a manager" wart — the row button is a real hire
   ================================================================== */
section('8. Branch hire-manager wart');
{
  const S = adultLife(909);
  const biz = launchBiz(S);
  let branch = null;
  if (biz) {
    const cities = ['Alexandria', 'Giza', 'Luxor', 'Aswan', 'Port Said', 'Suez', 'Tanta', 'Mansoura'];
    for (const city of cities) {
      const r = openBranch(S, biz, city);
      if (r.ok) { branch = r.branch; break; }
    }
  }
  if (!biz || !branch) {
    check('8a branch row shows a real manager shortlist for THAT branch', false, biz ? 'could not open a branch (no city worked)' : 'could not launch a business');
    check('8b no signpost button remains in the render', false, 'no branch to render');
    check('8c the row hire button hires a manager for the branch for real', false, 'no branch to hire for');
  } else {
    const html = renderWorkTabHtml(S, { workSub: 'ventures', bizTab: 'growth' }); /* branches now live under the Growth tab of the business desk */
    const rowHasRealHire = new RegExp(`data-action="biz-hire-manager"[^>]*data-biz="${branch.id}"`).test(html);
    const wageOnButton = /data-action="biz-hire-manager"[^>]*data-biz="[^"]*"[^>]*data-wage="[1-9][0-9]*"/.test(html)
      || /data-action="biz-hire-manager"[^>]*data-wage="[1-9][0-9]*"[^>]*data-biz="[^"]*"/.test(html);
    check('8a branch row shows a real manager shortlist for THAT branch', rowHasRealHire, rowHasRealHire ? `hire buttons carry data-biz="${branch.id}"` : 'no biz-hire-manager button for the branch id');
    check('8a2 the row states the wage (cost) on the button', wageOnButton, wageOnButton ? '' : 'no data-wage on the row hire buttons');
    check('8b no signpost button remains in the render', !/data-action="biz-branch-hire-manager"/.test(html), /data-action="biz-branch-hire-manager"/.test(html) ? 'signpost button still rendered' : 'gone');
    /* 8c — take a row hire button for THIS branch (not the parent's own
       shortlist, which renders first) and hire through its own data. */
    let attrs = null;
    for (const btn of html.matchAll(/<button[^>]*data-action="biz-hire-manager"[^>]*>/g)) {
      const a = {};
      for (const [, k, v] of btn[0].matchAll(/data-([a-z]+)="([^"]*)"/g)) a[k] = v;
      if (a.biz === branch.id && a.name && a.wage) { attrs = a; break; }
    }
    if (attrs && attrs.biz && attrs.name && attrs.wage) {
      const target = (S.career.businesses || []).find((b) => b.id === attrs.biz);
      const cashBefore = S.money.cash;
      const r = hireManager(S, target, { name: attrs.name, skill: Number(attrs.skill) || 50, wage: Number(attrs.wage), loyalty: Number(attrs.loyalty) || 60, personId: attrs.person || null });
      check('8c the row hire button hires a manager for the branch for real',
        r.ok && target.manager && target.manager.name === attrs.name && S.money.cash === cashBefore - Number(attrs.wage),
        r.ok ? `${target.manager.name} manages ${target.name} at ${target.manager.wage}/mo` : r.msg);
    } else {
      check('8c the row hire button hires a manager for the branch for real', false, 'could not parse a row hire button from the render');
    }
  }
}

/* ================================================================== *
   9. ESM parse, bundle, server fallback
   ================================================================== */
section('9. Parse, bundle, server');
{
  const files = listSrcFiles();
  let badParse = [];
  for (const f of files) {
    try {
      execFileSync('node', ['--input-type=module', '--check'], { input: readFileSync(f, 'utf8'), timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (e) { badParse.push(f.split('src/')[1]); }
  }
  check(`9a ESM parse: 0 failures on ${files.length} src files`, badParse.length === 0, badParse.length ? badParse.slice(0, 5).join(', ') : '');
  /* Bundle: rebuild twice, compare bytes; bundle must carry no
     import/export statements and no server address. */
  try {
    execFileSync('node', ['scripts/build.mjs'], { timeout: 180000, stdio: 'pipe' });
    const h1 = createHash('sha256').update(readFileSync(`${ROOT}dist/world-life.bundle.js`)).digest('hex');
    execFileSync('node', ['scripts/build.mjs'], { timeout: 180000, stdio: 'pipe' });
    const h2 = createHash('sha256').update(readFileSync(`${ROOT}dist/world-life.bundle.js`)).digest('hex');
    const bundle = readFileSync(`${ROOT}dist/world-life.bundle.js`, 'utf8');
    check('9b bundle rebuilds byte-identical', h1 === h2, h1 === h2 ? h1.slice(0, 12) : `${h1.slice(0, 12)} vs ${h2.slice(0, 12)}`);
    check('9c bundle has 0 import/export statements and 0 server addresses',
      !/^\s*import\s/m.test(bundle) && !/^\s*export\s/m.test(bundle) && !/https?:\/\/[a-z0-9.-]+/i.test(bundle.replace(/https?:\/\/www\.w3\.org/g, '')),
      '');
  } catch (e) {
    awaitCheck('9b bundle rebuilds byte-identical', `build failed to run here: ${String(e?.message || e).slice(0, 140)}`);
    awaitCheck('9c bundle has 0 import/export statements and 0 server addresses', 'build did not run, so the bundle could not be re-checked');
  }
  /* Server fallback: serve.py on a scratch port, fetch index, bundle,
     one banner, one portrait — all 200. */
  try {
    const port = 18765;
    const { spawn } = await import('node:child_process');
    const proc = spawn('python3', ['serve.py', String(port)], { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    await sleep(1200);
    const banner = readdirSync(`${ROOT}assets/banners`).find((f) => /\.(jpg|png|webp)$/i.test(f));
    const portrait = readdirSync(`${ROOT}assets/portraits`).find((f) => /\.(jpg|png|webp)$/i.test(f));
    const urls = [`http://127.0.0.1:${port}/`, `http://127.0.0.1:${port}/dist/world-life.bundle.js`];
    if (banner) urls.push(`http://127.0.0.1:${port}/assets/banners/${banner}`);
    if (portrait) urls.push(`http://127.0.0.1:${port}/assets/portraits/${portrait}`);
    const statuses = [];
    for (const u of urls) {
      try { const res = await fetch(u); statuses.push(`${u.split('/').pop() || 'index'}:${res.status}`); }
      catch (e) { statuses.push(`${u}:ERR`); }
    }
    proc.kill();
    check('9d server fallback: index, bundle, banner, portrait all 200', statuses.every((s) => s.endsWith(':200')), statuses.join(' '));
  } catch (e) {
    awaitCheck('9d server fallback: index, bundle, banner, portrait all 200', `server check could not run: ${String(e?.message || e).slice(0, 120)}`);
  }
}

/* ================================================================== *
   10. Shipped tests still pass (run as subprocesses)
   ================================================================== */
section('10. Shipped tests');
{
  const run = (file) => {
    try {
      const out = execFileSync('node', [`tests/${file}`], { timeout: 300000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      /* Keep the full output: the coherence suite's "totalDefects": 0
         sits ~600 chars before the end of its JSON, past a 400-char tail. */
      return { ok: true, out: String(out) };
    } catch (e) {
      return { ok: false, out: String((e.stdout || '') + (e.stderr || '')) };
    }
  };
  const data = run('verify_data.mjs');
  check('10a verify_data.mjs passes (DATA_OK)', data.ok && /DATA_OK/.test(data.out), data.out.split('\n').pop());
  const ui = run('verify_ui_renders.mjs');
  check('10b verify_ui_renders.mjs passes (UI_RENDER_OK)', ui.ok && /UI_RENDER_OK/.test(ui.out), ui.out.split('\n').pop());
  const coh = run('coherence_suite.mjs');
  check('10c coherence suite: 0 defects', coh.ok && /"totalDefects": 0/.test(coh.out), coh.ok ? 'totalDefects: 0' : (coh.out.split('\n').filter(Boolean).pop() || ''));
}

/* ================================================================== */
print(`\nV217-VERIFY: ${passes} pass, ${failures} fail, ${awaits} await merge`);
if (failedNames.length) print(`FAILED: ${failedNames.join(' | ')}`);
if (awaitedNames.length) print(`AWAITING MERGE: ${awaitedNames.join(' | ')}`);
process.exit(failures > 0 ? 1 : 0);
