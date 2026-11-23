#!/usr/bin/env node
/* v2.19 Worker 5 verify — third-person critique pass + purge (§1).
   Run from the game root: node tests/v219-w5-verify.mjs
   Every figure below is MEASURED on the v2.12/v2.18 grafted state
   (same state, same counting method as v218-w3-verify) — no quoted
   numbers. Before = v2.18 shipped counts, after = this tree.
   (a) label promises vs effects: postgrad +26%/+42%, work-pace health,
       rare-item fake −2%, rent pushback +8%.
   (b) repeats merged: gig risk lines, education system lines, Legacy
       reasons on the Life tab.
   (c) dead text the v2.18 purge missed: the registry below.
   (d) disabled buttons without a reason, v2.12 method, same state.
   Plus: all 12 career tracks have real work with real choices; a
   piece of work really arrives the next month after the last one is
   done; a second job loss in one year is told PLAINLY on the Career
   tab (not just journalled) and the first loss's choice still stands.
   Exit 0 only when there are no FAILs. */
import { readFileSync, readdirSync } from 'node:fs';

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
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const countOcc = (html, sub) => String(html).split(sub).length - 1;

const { createNewLifeState, createPerson, ensureExtendedState } = await import('../src/core/schema.js');
const { listAvailableJobs, tickCareerMonthly } = await import('../src/systems/careerEducationEngine.js');
const { createBusiness } = await import('../src/systems/businessEngine.js');
const { tickCareerActionsMonthly } = await import('../src/systems/careerActions.js');
const { tickMegaSystemsMonthly } = await import('../src/systems/completeLifeSystems.js');
const { pickCuratedLifeScene } = await import('../src/systems/healthDirectorEngine.js');
const { CAREER_WORK_TRACK_IDS, assignCareerWork, resolveCareerWork } = await import('../src/systems/careerWork.js');
const { checkCareerConsequences } = await import('../src/systems/careerConsequences.js');
const { applyDecision, decisionDef } = await import('../src/systems/businessDecisions.js');
const {
  renderHudHtml, renderLifeTabHtml, renderEducationTabHtml, renderPeopleTabHtml,
  renderWorkTabHtml, renderRealEstateTabHtml, renderFinanceTabHtml,
  renderLifestyleTabHtml, renderWorldTabHtml, renderBottomDockHtml
} = await import('../src/ui/views.js');
const { renderCareerWorkHtml } = await import('../src/systems/careerWork.js');
await import('../src/main.js');

/* ================= grafted state (v218-w3, unchanged) ================= */
async function buildGraftedState() {
  const S = createNewLifeState({ seed: 777, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm', ambition: 'family' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 30;
  S.money.cash = 607000; S.money.savings = 50000; S.money.creditScore = 650;
  S.education.stage = 'graduated_high';
  S.education.highSchoolScore = 82;
  S.education.degrees = ['engineering'];
  S.education.schoolId = null;
  const jobs = listAvailableJobs(S);
  const j = jobs.find(x => x.title && x.employer) || jobs[0];
  S.career.employed = true;
  S.career.yearsExperience = 5;
  S.career.job = {
    title: j.title, employer: j.employer, track: j.track, level: j.level,
    monthlyGross: (j.pay && j.pay.gross) || 45000, workMode: 'full_time',
    monthsInRole: 12, startYear: 2025, performance: 70, bossId: null
  };
  const spouse = createPerson(S, { age: 29, gender: 'f', role: 'spouse', relationLabel: 'Wife' });
  S.people[spouse.id] = spouse; S.relations.spouseIds = [spouse.id];
  S.marriage.status = 'married';
  for (const age of [8, 5]) {
    const ch = createPerson(S, { age, gender: age === 8 ? 'm' : 'f', role: 'child', relationLabel: age === 8 ? 'Son' : 'Daughter' });
    S.people[ch.id] = ch; S.relations.childIds.push(ch.id);
  }
  S.money.cash = 3000000; // topped up for the launch only
  const res = createBusiness(S, 'restaurant', 'Salem Table', { mode: 'part_time' });
  S.money.cash = 607000; // restored: every other tab counts like the v2.12 audit
  if (!res.ok) console.log('BUSINESS LAUNCH FAILED:', res.msg);
  else {
    const biz = S.career.businesses[S.career.businesses.length - 1];
    biz.monthsTrading = 3;
    biz.lastPL = { revenue: 108427, costs: 128803, tax: 0, net: -20376, rent: 20000, wages: 60000, other: 48803, franchise: 0, remote: 0, manager: 0, reinvest: 0, harvestOut: 0, taxLabel: 'Tax' };
    biz.history = [{ year: 2025, month: 12, revenue: 108427, costs: 128803, net: -20376 }];
  }
  return S;
}

const S = await buildGraftedState();
const uiState = { activeTab: 'life', propMarket: 'local', gulfTarget: 'uae' };
const sweeps = [
  ['life', () => renderLifeTabHtml(S)],
  ['education', () => renderEducationTabHtml(S, uiState)],
  ['people-circle', () => renderPeopleTabHtml(S, { ...uiState, peopleSub: 'circle' })],
  ['people-marriage', () => renderPeopleTabHtml(S, { ...uiState, peopleSub: 'marriage' })],
  ['people-children', () => renderPeopleTabHtml(S, { ...uiState, peopleSub: 'children' })],
  ['work-jobs', () => renderWorkTabHtml(S, { ...uiState, workSub: 'jobs' })],
  ['work-ventures', () => renderWorkTabHtml(S, { ...uiState, workSub: 'ventures' })],
  ['work-gigs', () => renderWorkTabHtml(S, { ...uiState, workSub: 'gigs' })],
  ['re-myhome', () => renderRealEstateTabHtml(S, { ...uiState, reSub: 'myhome' })],
  ['re-compounds', () => renderRealEstateTabHtml(S, { ...uiState, reSub: 'compounds' })],
  ['re-lands', () => renderRealEstateTabHtml(S, { ...uiState, reSub: 'lands' })],
  ['fin-cashflow', () => renderFinanceTabHtml(S, { ...uiState, finSub: 'cashflow' })],
  ['fin-banks', () => renderFinanceTabHtml(S, { ...uiState, finSub: 'banks' })],
  ['fin-cards', () => renderFinanceTabHtml(S, { ...uiState, finSub: 'cards' })],
  ['fin-markets', () => renderFinanceTabHtml(S, { ...uiState, finSub: 'markets' })],
  ['life-cars', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'cars' })],
  ['life-appearance', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'appearance' })],
  ['life-shop', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'shop' })],
  ['life-pets', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'pets' })],
  ['life-travel', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'travel' })],
  ['life-medical', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'medical' })],
  ['life-legal', () => renderLifestyleTabHtml(S, { ...uiState, lifeSub: 'legal' })],
  ['world-passports', () => renderWorldTabHtml(S, { ...uiState, worldSub: 'passports' })],
  ['world-gulf', () => renderWorldTabHtml(S, { ...uiState, worldSub: 'gulf' })],
  ['world-global', () => renderWorldTabHtml(S, { ...uiState, worldSub: 'global' })]
];
let allHtml = renderHudHtml(S) + renderBottomDockHtml(S);
const rendered = {};
for (const [name, fn] of sweeps) {
  try { rendered[name] = fn(); allHtml += rendered[name]; } catch (e) { console.log(`RENDER ERROR ${name}: ${e.message}`); fail++; }
}

/* ================= (d) disabled buttons, v2.12 method ================= */
section('(d) disabled buttons without a visible reason (v2.12 method, same grafted state)');
{
  const LABEL_REASON = /needs|you scored|not taught|degree held|tracks open|launches in|need \d+ more|more point|✓|already|holds |paid|completed|in wallet|in use|starts at|school years over|answer open decision|visa-free|stamped|tutor hired|built|wing added|fulfilled|below .*threshold|not eligible/i;
  const btnRe = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let total = 0, without = 0; const withoutList = []; let m;
  while ((m = btnRe.exec(allHtml)) !== null) {
    const attrs = m[1], label = strip(m[2]);
    if (!/\bdisabled\b/.test(attrs)) continue;
    total++;
    const action = (attrs.match(/data-action="([^"]+)"/) || [])[1] || '(no action)';
    const start = m.index, end = btnRe.lastIndex;
    const after = allHtml.slice(end, end + 500);
    const before = allHtml.slice(Math.max(0, start - 500), start);
    const ok = /<span class="lock-reason">/.test(after) || /<span class="lock-reason">/.test(before) || LABEL_REASON.test(label);
    if (!ok) { without++; if (withoutList.length < 25) withoutList.push(`${action} :: "${label}"`); }
  }
  console.log(`disabled total: ${total} (v2.19 shipped: 186; v2.20 removed the 5 second-branch-UI buttons) | without a visible reason: ${without} (before: 0)`);
  if (withoutList.length) console.log('without reason:', JSON.stringify(withoutList));
  check('disabled buttons without a visible reason: 0 -> 0', without === 0, `got ${without}`);
  check('disabled total is 181 (v2.20 removed the 5 second-branch-UI buttons, all disabled on this state)', total === 181, `got ${total}`);
}

/* ================= (b/c) dead text + repeats, new cuts ================= */
section('(b/c) dead text the v2.18 purge missed — every cut named');
{
  const gigsHtml = rendered['work-gigs'];
  // G1 — gig risk lines: same warning on every row. Before counts are
  // measured on the v2.18 tree (probe dump); after, each line appears
  // once per card at most (header, named with its gigs) or once per gig
  // where it genuinely belongs to that gig alone.
  const gigReg = [
    ['G1a manager warning ("Your manager may hear...")', countOcc(gigsHtml, 'Your manager may hear you are working a second job'), 47, 2],
    ['G1b 60+ hour weeks warning', countOcc(gigsHtml, '60+ hour weeks will hurt your health and your job performance.'), 11, 1],
    ['G1c "expect a fine" cash warning', countOcc(gigsHtml, 'If the authorities catch undeclared cash work, expect a fine.'), 14, 1],
    ['G1d "Off the books" cash warning', countOcc(gigsHtml, 'Off the books: no contract, no sick pay, and if you are hurt nobody pays.'), 8, 1],
    ['G1e "High risk: undeclared" cash warning', countOcc(gigsHtml, 'High risk: undeclared work, no safety net, and the police do check.'), 4, 1],
    ['G1f "Heavy lifting" warning', countOcc(gigsHtml, 'Heavy lifting with no safety net — a bad back or a fall is on you.'), 4, 1],
    ['G1g night-shift warning', countOcc(gigsHtml, 'Night shifts: tired days, worse sleep, worse health over time.'), 3, 2],
    ['G1h bicycle-delivery warning', countOcc(gigsHtml, 'Delivery on a bicycle in traffic — a fall is on you.'), 3, 1]
  ];
  let gigDeadBefore = 0, gigDeadAfter = 0;
  for (const [id, occ, before, allowed] of gigReg) {
    const deadBefore = Math.max(0, before - allowed);
    const deadAfter = Math.max(0, occ - allowed);
    gigDeadBefore += deadBefore; gigDeadAfter += deadAfter;
    console.log(`  ${id}: before ${before} -> now ${occ} (allowed ${allowed}, dead ${deadBefore} -> ${deadAfter})`);
    check(`${id}: ${before} -> ${allowed} or fewer`, occ <= allowed, `got ${occ}`);
  }
  console.log(`gig risk-line dead text: ${gigDeadBefore} -> ${gigDeadAfter}`);
  check('gig risk-line dead text 84 -> 0', gigDeadAfter === 0, `got ${gigDeadAfter}`);
  check('every gig warning still shown somewhere (header "Applies to every gig here" x2)', countOcc(gigsHtml, 'Applies to every gig here') === 2, `got ${countOcc(gigsHtml, 'Applies to every gig here')}`);
  check('subset warnings still name their gigs ("— on:")', countOcc(gigsHtml, '— on:') >= 1, `got ${countOcc(gigsHtml, '— on:')}`);

  // G2 — education: the national system's Opens/Cost/Risk printed on
  // BOTH national tracks (Science and Literary). Now once per system.
  const eduHtml = rendered.education;
  const eduReg = [
    ['G2a national benefit line', countOcc(eduHtml, 'The national exam and placement system (Tansik in Egypt). Opens every public university in your country at public fees, and every local employer.'), 2, 1],
    ['G2b national cost line', countOcc(eduHtml, 'Nothing extra at a state school; private national schools charge fees.'), 2, 1],
    ['G2c national risk line', countOcc(eduHtml, 'One exam decides your university — your score is everything.'), 2, 1]
  ];
  let eduDeadAfter = 0;
  for (const [id, occ, before, allowed] of eduReg) {
    eduDeadAfter += Math.max(0, occ - allowed);
    console.log(`  ${id}: before ${before} -> now ${occ} (allowed ${allowed})`);
    check(`${id}: ${before} -> ${allowed}`, occ === allowed, `got ${occ}`);
  }
  check('education system-line dead text 3 -> 0', eduDeadAfter === 0, `got ${eduDeadAfter}`);
  check('each system still states its lines once (5 systems on the tab)', countOcc(eduHtml, 'Opens:') === 5, `got ${countOcc(eduHtml, 'Opens:')}`);

  // G3 — Life tab: "Why your Legacy Score is" printed twice, word for
  // word (Life Goals card AND Progress panel). Now once.
  const lifeHtml = rendered.life;
  const legacyOcc = countOcc(lifeHtml, 'Why your Legacy Score is');
  console.log(`  G3 legacy reasons heading: before 2 -> now ${legacyOcc} (allowed 1)`);
  check('legacy reasons heading 2 -> 1', legacyOcc === 1, `got ${legacyOcc}`);
  check('progress panel still shows the live score in its header', /Legacy Score: \d+\/100/.test(lifeHtml), 'no score pill found');
  check('progress panel points at the goals card instead of repeating', lifeHtml.includes('see Life Goals above'), 'pointer line missing');
}

/* ================= (a) label promises vs effects ================= */
section('(a) choices whose label promises a number the effect must deliver');
{
  // A1 — postgrad: the enrol buttons promise +26% (MSc/MBA) and +42%
  // (Fellowship/PhD). The completion raise used x1.22 / x1.32.
  function postgradState(tier) {
    const A = createNewLifeState({ seed: 41, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
    ensureExtendedState(A);
    A.year = 2026; A.month = 1; A.player.age = 30;
    A.money.cash = 500000;
    A.career.employed = true;
    A.career.job = { employer: 'Orascom Construction', title: 'Site Engineer', track: 'engineering', level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 6, performance: 70, workMode: 'normal', bossId: null };
    A.postgrad = { active: { tier, label: tier === 'fellowship_phd' ? 'Fellowship/PhD' : 'MSc/MBA', monthsLeft: 1 }, completed: [] };
    return A;
  }
  const mba = postgradState('masters_mba');
  tickMegaSystemsMonthly(mba);
  console.log(`  MSc/MBA completion: gross 30000 -> ${mba.career.job.monthlyGross} (promised +26% = 37800)`);
  check('MSc/MBA completion raises current pay +26% (30000 -> 37800)', mba.career.job.monthlyGross === 37800, `got ${mba.career.job.monthlyGross}`);
  const phd = postgradState('fellowship_phd');
  tickMegaSystemsMonthly(phd);
  console.log(`  Fellowship/PhD completion: gross 30000 -> ${phd.career.job.monthlyGross} (promised +42% = 42600)`);
  check('Fellowship/PhD completion raises current pay +42% (30000 -> 42600)', phd.career.job.monthlyGross === 42600, `got ${phd.career.job.monthlyGross}`);

  // A2 — work pace: the preview promises Health -1/mo (hard, overtime)
  // and +1/mo (coast), and boss (+respect) for overtime. No tick ever
  // applied the health move.
  function paceState(mode) {
    const A = createNewLifeState({ seed: 42, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
    ensureExtendedState(A);
    A.year = 2026; A.month = 1; A.player.age = 30;
    A.money.cash = 500000;
    A.player.vitals.health = 80; A.player.vitals.stress = 50;
    A.career.employed = true;
    A.career.job = { employer: 'Orascom Construction', title: 'Site Engineer', track: 'engineering', level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 5, performance: 70, workMode: mode, bossId: 'w5_boss' };
    A.people.w5_boss = { id: 'w5_boss', firstName: 'Boss', fullName: 'Boss Person', alive: true, role: 'boss', rel: { affection: 60, respect: 60, trust: 60 } };
    return A;
  }
  const runPace = (mode) => {
    const A = paceState(mode);
    tickCareerMonthly(A);
    tickCareerActionsMonthly(A);
    return A;
  };
  const hard = runPace('hard');
  console.log(`  hard month: health 80->${hard.player.vitals.health}, stress 50->${hard.player.vitals.stress}, perf 70->${hard.career.job.performance}, boss respect 60->${hard.people.w5_boss.rel.respect}`);
  check('Work Hard month: health -1, stress +2, performance +1.2, boss respect +1', hard.player.vitals.health === 79 && hard.player.vitals.stress === 52 && Math.abs(hard.career.job.performance - 71.2) < 0.01 && hard.people.w5_boss.rel.respect === 61, `health ${hard.player.vitals.health}, stress ${hard.player.vitals.stress}, perf ${hard.career.job.performance}, respect ${hard.people.w5_boss.rel.respect}`);
  const over = runPace('overtime');
  console.log(`  overtime month: health 80->${over.player.vitals.health}, stress 50->${over.player.vitals.stress}, perf 70->${over.career.job.performance}, boss respect 60->${over.people.w5_boss.rel.respect}`);
  check('Overtime month: health -1, stress +3, performance +1.5, boss respect +1', over.player.vitals.health === 79 && over.player.vitals.stress === 53 && Math.abs(over.career.job.performance - 71.5) < 0.01 && over.people.w5_boss.rel.respect === 61, `health ${over.player.vitals.health}, stress ${over.player.vitals.stress}, perf ${over.career.job.performance}, respect ${over.people.w5_boss.rel.respect}`);
  const coast = runPace('coast');
  console.log(`  coast month: health 80->${coast.player.vitals.health}, stress 50->${coast.player.vitals.stress}, perf 70->${coast.career.job.performance}, boss respect 60->${coast.people.w5_boss.rel.respect}`);
  check('Coast month: health +1, stress -2, performance -1.2, boss respect -1', coast.player.vitals.health === 81 && coast.player.vitals.stress === 48 && Math.abs(coast.career.job.performance - 68.8) < 0.01 && coast.people.w5_boss.rel.respect === 59, `health ${coast.player.vitals.health}, stress ${coast.player.vitals.stress}, perf ${coast.career.job.performance}, respect ${coast.people.w5_boss.rel.respect}`);
  const normal = runPace('normal');
  check('Balanced month: health unchanged, performance +0.4', normal.player.vitals.health === 80 && Math.abs(normal.career.job.performance - 70.4) < 0.01, `health ${normal.player.vitals.health}, perf ${normal.career.job.performance}`);

  // A3 — rare item, fake branch: label/msg promise repeat customers -2%;
  // nothing ever moved biz.repeatRate.
  {
    const A = createNewLifeState({ seed: 43, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
    ensureExtendedState(A);
    A.year = 2026; A.month = 1; A.player.age = 30;
    A.money.cash = 5000000;
    const biz = {
      id: 'biz_rare', typeId: 'retail_shop', name: 'Rare Finds', country: 'egy', city: 'Cairo',
      monthlyRev: 300000, monthlyCost: 80000, capitalInvested: 500000, repeatRate: 0.5,
      staff: [], lastDecisionUsed: {}, decisionEffects: [], lastOpUsed: {},
      buffs: { rdUntil: 0, bonusUntil: 0, pricingUntil: 0, pricingDir: 0 }
    };
    A.career.businesses = [biz]; A.career.business = biz;
    const def = decisionDef('retail_appraise_rare');
    check('rare-item decision exists and promises -2% repeat on a fake', !!def && /repeat customers −2%/.test(def.effectText(A, biz)), def ? def.effectText(A, biz).slice(0, 80) : 'no def');
    const r = applyDecision(A, biz, 'retail_appraise_rare', { force: 'fake' });
    console.log(`  fake appraisal: ${r.msg} | repeatRate 0.5 -> ${biz.repeatRate}`);
    check('fake rare item: repeat customers really fall 2% (0.5 -> 0.48)', r.ok && Math.abs(biz.repeatRate - 0.48) < 1e-9, `repeatRate ${biz.repeatRate}`);
  }

  // A4 — rent pushback: the label promised +8% as the outcome; the
  // effect only lands it 72% of the time (28% the landlord holds +25%).
  // The label must now say it is an ask, and the gamble must still be
  // a real gamble (both outcomes reachable).
  {
    let scene = null;
    for (let seed = 1; seed <= 200 && !scene; seed++) {
      const A = createNewLifeState({ seed: 1000 + seed, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
      ensureExtendedState(A);
      A.year = 2026; A.month = 1; A.player.age = 30;
      A.housing.mode = 'rent'; A.housing.monthlyRent = 10000; A.housing.currentHomeName = 'Rented Flat';
      A.money.cash = 500000;
      const sc = pickCuratedLifeScene(A);
      if (sc && sc.title === 'Landlord Demands a 25% Lease Jump') scene = sc;
    }
    check('landlord scene found (rent pushback label is reachable)', !!scene, scene ? '' : 'not found in 200 seeds');
    if (scene) {
      const push = scene.choices[0];
      console.log(`  pushback label: ${push.label}`);
      check('pushback label says it is an ask, not a price ("ask for +8%", "may still hold at +25%")', /ask for \+8%/.test(push.label) && /may still hold at \+25%/.test(push.label), push.label);
      // The gamble is still real: run the effect on fresh states.
      let mid = 0, hiked = 0;
      for (let seed = 1; seed <= 200; seed++) {
        const A = createNewLifeState({ seed: 5000 + seed, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
        ensureExtendedState(A);
        A.year = 2026; A.month = 1; A.player.age = 30;
        A.housing.mode = 'rent'; A.housing.monthlyRent = 10000;
        A.money.cash = 500000;
        push.effect(A);
        if (A.housing.monthlyRent === 10800) mid++;
        else if (A.housing.monthlyRent === 12500) hiked++;
      }
      console.log(`  pushback gamble over 200 states: +8% ${mid}x, +25% ${hiked}x`);
      check('pushback is still a real gamble (both outcomes occur)', mid > 0 && hiked > 0, `mid ${mid}, hiked ${hiked}`);
    }
  }
}

/* ================= 12 tracks: real work, real choices ================= */
section('12 career tracks still have real work with real choices');
{
  check('there are exactly 12 work tracks', CAREER_WORK_TRACK_IDS.length === 12, CAREER_WORK_TRACK_IDS.join(', '));
  function workState(trackId) {
    const A = createNewLifeState({ seed: 77, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
    ensureExtendedState(A);
    A.year = 2026; A.month = 1; A.player.age = 30;
    A.money.cash = 500000;
    A.career.employed = true;
    A.career.job = { employer: 'Test Employer', title: `Test ${trackId}`, track: trackId, level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 6, performance: 70, workMode: 'normal', bossId: 'w5_boss', performanceParts: { attendance: 72, quality: 70, teamwork: 68, managerView: 70 } };
    A.people.w5_boss = { id: 'w5_boss', firstName: 'Boss', fullName: 'Boss Person', alive: true, role: 'boss', rel: { affection: 60, respect: 60, trust: 60 } };
    A.people.w5_col = { id: 'w5_col', firstName: 'Colleague', fullName: 'Colleague Person', alive: true, role: 'colleague', rel: { affection: 60, respect: 60, trust: 60 } };
    A.relations.colleagueIds = ['w5_col'];
    return A;
  }
  for (const trackId of CAREER_WORK_TRACK_IDS) {
    const A = workState(trackId);
    const work = assignCareerWork(A);
    const okShape = !!work && !!work.title && !!work.detail && !!work.achievement && Array.isArray(work.choices) && work.choices.length === 4
      && work.choices.every((c) => c.label && c.tradeoff) && new Set(work.choices.map((c) => c.id)).size === 4;
    check(`track "${trackId}": one real piece of work, 4 real choices`, okShape, work ? `${work.title} / ${work.choices.map((c) => c.id).join(',')}` : 'no work assigned');
    // Each choice, on a fresh state, resolves and moves the numbers it claims.
    const cases = [
      ['hard', 'success', (st) => st.career.job.performance === 74],
      ['corner', 'caught', (st) => st.career.job.performance === 66 && st.people.w5_boss.rel.trust === 50],
      ['help', null, (st) => st.career.job.performance === 69 && st.people.w5_col.rel.trust === 68],
      ['difficult', 'success', (st) => st.career.job.performance === 76]
    ];
    for (const [choiceId, force, expect] of cases) {
      const B = workState(trackId);
      assignCareerWork(B);
      const r = resolveCareerWork(B, choiceId, force ? { force } : {});
      check(`track "${trackId}" choice "${choiceId}" resolves with its real effect`, r.ok && expect(B) && B.career.currentWork === null, r.msg || 'resolve failed');
    }
  }
}

/* ================= monthly work arrival (not a placeholder) ================= */
section('the "next one arrives with the new month" state really fills');
{
  const A = createNewLifeState({ seed: 78, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm' });
  ensureExtendedState(A);
  A.year = 2026; A.month = 1; A.player.age = 30;
  A.money.cash = 500000;
  A.career.employed = true;
  A.career.job = { employer: 'Orascom Construction', title: 'Site Engineer', track: 'engineering', level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 5, performance: 70, workMode: 'normal', bossId: null };
  const first = assignCareerWork(A);
  check('a first piece of work is assigned', !!first && !!first.title, first?.title || 'none');
  const r = resolveCareerWork(A, 'hard', { force: 'success' });
  check('finishing it clears the desk', r.ok && A.career.currentWork === null, r.msg);
  const emptyHtml = renderCareerWorkHtml(A);
  check('empty desk says the next one arrives with the new month', emptyHtml.includes('No open piece of work right now — the next one arrives with the new month.'), 'line missing');
  check('empty desk shows the work done count (1 piece)', emptyHtml.includes('1 piece of work done'), 'count missing');
  tickCareerMonthly(A); // the real monthly hook, not a test-only call
  const second = A.career.currentWork;
  console.log(`  after one real monthly tick: currentWork = ${second ? `"${second.title}" (${second.id})` : 'none'}`);
  check('the next month really brings a new piece of work (different id)', !!second && second.id !== first.id, second ? second.id : 'none');
  const filledHtml = renderCareerWorkHtml(A);
  check('the new work renders on the desk with its 4 choices', filledHtml.includes(second.title) && (filledHtml.match(/data-action="career-work"/g) || []).length === 4, `choices found ${(filledHtml.match(/data-action="career-work"/g) || []).length}`);
}

/* ================= second job loss: told plainly, first choice stands ================= */
section('second job loss in one year: told plainly on the Career tab, first choice stands');
{
  function lossState() {
    const A = createNewLifeState({ seed: 79, country: 'egy', birthYear: 1996, familyTier: 'middle', gender: 'm', ambition: 'family' });
    ensureExtendedState(A);
    A.year = 2026; A.month = 1; A.player.age = 35;
    A.money.cash = 5000000; A.money.savings = 0;
    A.education.degrees = ['business', 'engineering'];
    A.legal.residency.kind = 'citizen';
    const spouse = createPerson(A, { role: 'spouse', relationLabel: 'Spouse', age: 33, affection: 70 });
    A.people[spouse.id] = spouse; A.relations.spouseIds = [spouse.id];
    const child1 = createPerson(A, { role: 'child', relationLabel: 'Child', age: 10, affection: 80, trust: 70 });
    const child2 = createPerson(A, { role: 'child', relationLabel: 'Child', age: 7, affection: 80, trust: 70 });
    A.people[child1.id] = child1; A.people[child2.id] = child2;
    A.relations.childIds = [child1.id, child2.id];
    A.housing.properties = [{
      id: 'prop_m', name: 'Smouha Flat', country: 'egy', city: 'Alexandria',
      monthsLeft: 120, nativeMonthlyInstallment: 15000, nativeInstallmentRemaining: 15000 * 120,
      installmentRemaining: 15000 * 120, valueLocal: 2000000, rooms: 3
    }];
    A.housing.currentHomeId = 'prop_m'; A.housing.mode = 'owned';
    A.legal.citizenships = ['usa'];
    A.legal.residency = { kind: 'work_visa', country: 'egy', permitName: 'Egypt Work Visa', sponsorName: 'Orascom Construction', expiresYear: 2027, expiresMonth: 6, graceMonthsLeft: 0, yearsInCountryLegally: 3, familySponsored: false };
    return A;
  }
  function employ(A, employer) {
    A.career.employed = true;
    A.career.job = { employer, title: 'Site Engineer', track: 'engineering', level: 2, monthlyGross: 30000, startYear: 2024, monthsInRole: 18, performance: 78, workMode: 'normal', bossId: null };
    A.career.yearsExperience = 6;
    A.career.trackExperience = { engineering: 6 };
  }
  const queuedScenes = (A) => [...(A.sceneQueue || []), ...(A.activeScene ? [A.activeScene] : [])];
  const findScene = (A, re) => queuedScenes(A).find((sc) => re.test(sc.title || ''));

  const A = lossState();
  employ(A, 'Orascom Construction');
  checkCareerConsequences(A); // baseline: employed
  check('no job-loss reaction while employed', !queuedScenes(A).some((sc) => /jobloss/i.test(sc.key || '')));
  // First loss, month 2.
  A.month = 2;
  A.career.employed = false; A.career.job = null; A.career.unemployedMonths = 0;
  const rep1 = checkCareerConsequences(A);
  const fired1 = (rep1.jobLoss?.fired || []).map((f) => f.kind).sort();
  console.log(`  first loss fired: ${JSON.stringify(fired1)}`);
  check('first loss fires all four reactions', JSON.stringify(fired1) === JSON.stringify(['children', 'mortgage', 'spouse', 'visa']), `fired ${fired1.join(', ')}`);
  // Take the mortgage choice: the 3-month payment holiday.
  const mScene = findScene(A, /Bank Writes About/);
  check('first loss mortgage scene is a real scene', !!mScene, mScene?.title || 'no scene');
  mScene.choices[1].effect(A);
  const prop = A.housing.properties[0];
  check('first loss mortgage choice taken: payment holiday is on the property', typeof prop.paymentHolidayUntil === 'number' && prop.paymentHolidayUntil > 0, `holidayUntil ${prop.paymentHolidayUntil}`);
  check('first loss mortgage choice is remembered', A.career.jobLoss.mortgageChoiceTaken === 'took the 3-month payment holiday', A.career.jobLoss.mortgageChoiceTaken);
  // Re-hired at a different employer, month 3, then lost again, month 4.
  A.month = 3;
  employ(A, 'Elsewedy Electric');
  checkCareerConsequences(A); // employed again: resets the last-month flag
  A.month = 4;
  A.career.employed = false; A.career.job = null; A.career.unemployedMonths = 0;
  const rep2 = checkCareerConsequences(A);
  const fired2 = (rep2.jobLoss?.fired || []).map((f) => f.kind);
  const skipped2 = (rep2.jobLoss?.skipped || []).filter((s) => s.reason === 'already fired this year').map((s) => s.kind).sort();
  console.log(`  second loss fired: ${JSON.stringify(fired2)}; suppressed this year: ${JSON.stringify(skipped2)}`);
  check('second loss in the same year fires no repeat reaction', fired2.length === 0, `fired ${fired2.join(', ')}`);
  check('second loss suppresses all four kinds for the year', JSON.stringify(skipped2) === JSON.stringify(['children', 'mortgage', 'spouse', 'visa']), `suppressed ${skipped2.join(', ')}`);
  const note = A.career.jobLoss.secondLossNote;
  check('second loss is recorded as a note (not journal-only)', !!note && note.year === 2026 && JSON.stringify([...note.kinds].sort()) === JSON.stringify(['children', 'mortgage', 'spouse', 'visa']), JSON.stringify(note));
  const journal = (A.journal || []).map((e) => e.text || '').join(' ');
  check('journal names what was lost (no second payment holiday)', /no second payment holiday/.test(journal), 'journal line missing the holiday');
  const careerHtml = renderWorkTabHtml(A);
  check('Career tab says plainly the player lost the job twice this year', careerHtml.includes('You Lost Your Job Twice This Year'), 'note heading missing');
  check('Career tab names the lost payment holiday', careerHtml.includes('no second payment holiday'), 'holiday not named on the tab');
  check('Career tab names the first loss mortgage choice (still stands)', careerHtml.includes('took the 3-month payment holiday') && careerHtml.includes('still stands'), 'first choice not named on the tab');
  check('Career tab names the lost spouse/children/visa conversations too', careerHtml.includes('no second conversation') && careerHtml.includes('no second talk with them') && careerHtml.includes('no second warning'), 'some reactions not named on the tab');
  check('the first loss payment holiday is still on the property (choice stands, visibly)', typeof prop.paymentHolidayUntil === 'number' && prop.paymentHolidayUntil > 0, `holidayUntil ${prop.paymentHolidayUntil}`);
  // Next year the guards reset: the note stops showing.
  A.year = 2027;
  check('next year the second-loss note no longer shows', !renderWorkTabHtml(A).includes('You Lost Your Job Twice This Year'), 'note still showing in 2027');
}

/* ================= ESM parse ================= */
section('ESM parse of every src file');
{
  const ROOT = new URL('..', import.meta.url).pathname;
  const files = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) walk(`${dir}/${e.name}`);
      else if (e.name.endsWith('.js')) files.push(`${dir}/${e.name}`);
    }
  };
  walk(`${ROOT}src`);
  let ok = 0, bad = [];
  for (const f of files) {
    try { await import(f); ok += 1; } catch (e) { bad.push(`${f.replace(ROOT, '')}: ${e.message}`); }
  }
  console.log(`  ${ok}/${files.length} src files import cleanly`);
  check('ESM parse 0 failures', bad.length === 0, bad.slice(0, 5).join(' | '));
}

console.log(`\n${pass} passed, ${fail} failed${failedNames.length ? ` — FAILED: ${failedNames.join(', ')}` : ''}`);
process.exit(fail ? 1 : 0);
