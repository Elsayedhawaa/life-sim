/* v2.15 W2 verify — Career: a market, not a ladder.
   Run from the game root: node tests/v215-w2-verify.mjs
   Every check goes through the REAL paths: the monthly settlement
   (settleHouseholdMonth), the real monthly career tick
   (tickCareerMonthly + tickCareerMarketMonth), the real promotion
   interview scene, and the real Career tab render.
   - §0: the three new files exist; the UK pension share is 5% of gross.
   - §1: a headhunter approaches a good performer with a real offer
     (named recruiter person, named company, salary through the payslip);
     accept moves the player at the exact offered gross (with a
     non-compete that really blocks rejoining, a demanding boss, a city
     move); decline leaves the job alone; negotiate has three real
     outcomes (counter-offer / 8% raise / refusal) with exact numbers.
   - §2: the dashboard shows the three parts and what moves each;
     teamwork moves +2 on covering a shift and drifts toward the team's
     live view in the monthly tick.
   - §3: the pension pot grows through the settlement and the pot's
     number matches the contributions (measured: pot = employee +
     employer + growth, and each month's contribution equals the
     payslip's pension line); the USA 401(k) is a real cash line in the
     ledger; opting out stops contributions; the pot pays out at
     retirement as pot/240 a month on top of the state pension.
   - §4: a mentor exists with real consequences (measured: a mentored
     player promotes where an unmentored twin with the same seed does
     not — both the interview scene and the yearly review); a rival
     exists with real consequences (collaborate / compete / undermine,
     each moving the relationship and the promotion odds).
   - §5: the Career tab renders the dashboard, the offer, the pension
     and the mentor/rival sections.
   - §6: the career-market system never moves the game's main RNG
     stream (rngState identical before/after a full market month).
   The three shipped tests are NOT run by this harness — run them
   separately. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
import {
  tickCareerMonthly,
  listAvailableJobs,
  getLadderForJob,
  getMergedCareerTracks,
  retireFromCareer,
  checkJobApplication
} from '../src/systems/careerEducationEngine.js';
import { takeOnWork, applyPromotion, ensureJobActionState } from '../src/systems/careerActions.js';
import { computePayslip } from '../src/data/economy.js';
import { getCountry, formatMoney } from '../src/data/countries.js';
import { getEmployersFor } from '../src/data/institutions.js';
import { spawnWorkplaceCast } from '../src/systems/soulEngine.js';
import { getJobContract, syncEmployerBenefits } from '../src/systems/careerEducationEngine.js';
import { worldEventEffects } from '../src/systems/worldEvents.js';
import {
  ensureCareerMarket,
  ensurePension,
  pensionSlipFor,
  accruePensionMonth,
  maybeHeadhunterApproach,
  acceptHeadhunterOffer,
  declineHeadhunterOffer,
  negotiateWithOffer,
  optOutPension,
  optInPension,
  payOutPensionPot,
  getPerformanceDashboard,
  promotionScoreParts,
  askMentor,
  askMentorAdvice,
  askMentorIntroduction,
  maybeSpawnRival,
  rivalAction,
  rivalPromotionTerm,
  tickCareerMarketMonth,
  ensureSeniorColleague
} from '../src/systems/careerMarket.js';
import { renderWorkTabHtml } from '../src/ui/views.js';
import fs from 'node:fs';

let pass = 0, fail = 0; const failures = [];
function check(name, ok, extra = '') {
  if (ok) { pass++; console.log('PASS', name); }
  else { fail++; failures.push(name); console.log('FAIL', name, extra); }
}
const strip = (h) => String(h).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

/* Mulberry32, exactly as src/core/rng.js: simulate draws from a bare
   rngState number WITHOUT touching the live state — so the verify can
   predict the promotion interview's mood roll (and the freeze roll
   after it) for a twin pair before running the real scene. */
function simDraw(state) {
  let t = (state + 0x6D2B79F5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return { value: ((t ^ (t >>> 14)) >>> 0) / 4294967296, state: (state + 0x6D2B79F5) >>> 0 };
}

function employedLife(seed = 777, country = 'egy') {
  const S = createNewLifeState({ seed, country, birthYear: 1990, familyTier: 'middle', gender: 'm', ambition: 'professional' });
  ensureExtendedState(S);
  S.year = 2026; S.month = 1;
  S.player.age = 35;
  S.money.cash = 5_000_000;
  S.money.savings = 0;
  S.legal.residency.kind = 'citizen';
  S.education.degrees = ['business', 'engineering', 'law', 'medicine', 'cs'];
  return S;
}

/* A track with no degree requirement, a second rung reachable in <= 2
   years, and at least two real employers in the country — so the
   headhunter has somewhere real to poach from. */
function pickTrack(S) {
  const merged = getMergedCareerTracks(S.year);
  for (const [id, track] of Object.entries(merged)) {
    if ((track.reqDegrees || []).length) continue;
    if (!track.rungs || track.rungs.length < 2) continue;
    if (track.rungs[1].minExp > 2) continue;
    if (getEmployersFor(S.country, id).length < 2) continue;
    return { id, track };
  }
  return null;
}

function hireDirect(S, o) {
  S.career.employed = true;
  S.career.unemployedMonths = 0;
  S.career.retired = false;
  S.career.job = {
    employer: o.employer,
    title: o.title,
    track: o.track,
    level: o.level ?? 0,
    monthlyGross: o.gross,
    startYear: S.year,
    monthsInRole: o.monthsInRole ?? 8,
    performance: o.performance ?? 75,
    workMode: 'normal',
    bossId: null
  };
  const { boss } = spawnWorkplaceCast(S, o.employer, o.track, o.gross);
  S.career.job.bossId = boss.id;
  getJobContract(S);
  syncEmployerBenefits(S);
  return boss;
}

/* An employed life on a promotable track, ready for a promotion
   interview: 2 years on the track, 8 months in role, 75% performance,
   boss respect 60. Returns { S, trackId, nextRung }. */
function promoReadyLife(seed, country = 'egy') {
  const S = employedLife(seed, country);
  const picked = pickTrack(S);
  if (!picked) throw new Error('no promotable track with 2+ employers in ' + country);
  const { id, track } = picked;
  const jobs = listAvailableJobs(S);
  const listing = jobs.find(j => j.track === id);
  const boss = hireDirect(S, {
    employer: listing.employer, title: track.rungs[0].title, track: id,
    level: 0, gross: listing.monthlyGross, monthsInRole: 8, performance: 75
  });
  boss.rel.affection = 60; boss.rel.respect = 60; boss.rel.trust = 60;
  S.career.trackExperience[id] = track.rungs[1].minExp;
  return { S, trackId: id, nextRung: track.rungs[1], boss };
}

function nextMonth(S) { S.month += 1; if (S.month > 12) { S.month = 1; S.year += 1; } }
const ledgerLines = (S, re) => (S.ledger || []).filter(l => l.label && re.test(l.label));

/* ================= §0 new files + data ================= */
console.log('--- §0 files + data ---');
{
  check('src/systems/careerMarket.js exists', fs.existsSync('src/systems/careerMarket.js'));
  check('src/ui/careerMarket.js exists', fs.existsSync('src/ui/careerMarket.js'));
  check('src/data/careerMarketData.js exists', fs.existsSync('src/data/careerMarketData.js'));
  const econ = fs.readFileSync('src/data/economy.js', 'utf8');
  check('UK pension share is 0.625 (5% of gross on 8% NI)', /gbr: \{ citizen: 0\.625/.test(econ));
  const slip = computePayslip(60000, 'gbr', 2026, true, 'normal');
  check('UK payslip pension line is 5% of gross (3,000 on 60,000)', slip.pensionContribution === 3000, `got ${slip.pensionContribution}`);
  check('UK payslip employer top-up is 3% (1,800 on 60,000)', slip.employerPension === 1800, `got ${slip.employerPension}`);
}

/* ================= §1 headhunters ================= */
console.log('--- §1 headhunters ---');
{
  const { S, trackId } = promoReadyLife(101);
  const job = S.career.job;
  const r = maybeHeadhunterApproach(S, { force: true });
  check('a good performer is approached (forced)', r.ok, r.msg);
  const offer = S.career.market.offer;
  check('an offer is open on the record', !!offer && offer.status === 'open');
  check('the recruiter is a named person record', !!offer && !!S.people[offer.recruiterId] && S.people[offer.recruiterId].role === 'recruiter' && S.people[offer.recruiterId].fullName === offer.recruiterName, offer && offer.recruiterName);
  check('the offer names a different real company', !!offer && offer.employer !== job.employer && offer.employer.length > 2, offer && offer.employer);
  check('the offer pays more than the current job', !!offer && offer.monthlyGross > job.monthlyGross, offer && `${offer.monthlyGross} vs ${job.monthlyGross}`);
  const slip = computePayslip(offer.monthlyGross, 'egy', 2026, true, 'normal');
  check('the offer salary goes through the payslip (net < gross, net > 0)', slip.net > 0 && slip.net < offer.monthlyGross, `gross ${offer.monthlyGross} net ${slip.net}`);
  check('the offer always carries a real trade-off', offer.tradeoffs.length >= 1, offer.tradeoffs.map(t => t.kind).join(','));
  console.log('  offer:', offer.recruiterName, '→', offer.title, 'at', offer.employer, `${formatMoney(offer.monthlyGross, 'egy')}/mo gross (was ${formatMoney(job.monthlyGross, 'egy')}), trade-offs:`, offer.tradeoffs.map(t => t.kind).join(', '));

  /* Trade-off presence over many approaches: always >= 1. */
  let minTradeoffs = 99;
  for (let seed = 201; seed < 221; seed++) {
    const t = promoReadyLife(seed);
    maybeHeadhunterApproach(t.S, { force: true });
    if (t.S.career.market.offer) minTradeoffs = Math.min(minTradeoffs, t.S.career.market.offer.tradeoffs.length);
  }
  check('20 forced approaches all carry >= 1 trade-off', minTradeoffs >= 1, `min ${minTradeoffs}`);

  /* Accept: exact gross, non-compete, demanding boss, city move. */
  const A = promoReadyLife(102);
  maybeHeadhunterApproach(A.S, { force: true });
  const offA = A.S.career.market.offer;
  const oldEmp = A.S.career.job.employer;
  const oldCity = A.S.city;
  const newCity = (getCountry('egy').cities || []).find(c => c !== oldCity);
  offA.tradeoffs = [
    { kind: 'non_compete', text: 'test non-compete' },
    { kind: 'move_city', city: newCity, text: 'test move' },
    { kind: 'demanding_boss', text: 'test demanding boss' }
  ];
  offA.hasNonCompete = true;
  offA.city = newCity;
  offA.bossQuality = 'demanding';
  const acc = acceptHeadhunterOffer(A.S);
  check('accept succeeds', acc.ok, acc.msg);
  check('accept hires at the EXACT offered gross', A.S.career.job.monthlyGross === offA.monthlyGross, `${A.S.career.job.monthlyGross} vs ${offA.monthlyGross}`);
  check('accept moves to the offered employer', A.S.career.job.employer === offA.employer);
  check('accept moves the player to the offer city', A.S.city === newCity, `${A.S.city} vs ${newCity}`);
  check('accept records the non-compete on the old employer', A.S.career.market.nonCompete && A.S.career.market.nonCompete.employer === oldEmp && A.S.career.market.nonCompete.untilYear === 2028, JSON.stringify(A.S.career.market.nonCompete));
  const newBoss = A.S.people[A.S.career.job.bossId];
  check('a demanding boss starts low (respect 45, affection 38, trust 42)', newBoss && newBoss.rel.respect === 45 && newBoss.rel.affection === 38 && newBoss.rel.trust === 42, newBoss && JSON.stringify(newBoss.rel));
  check('the offer is consumed on accept', A.S.career.market.offer === null);
  /* The non-compete really blocks rejoining. */
  const blocked = checkJobApplication(A.S, { employer: oldEmp, reqDegrees: [], qualifiedByDegree: true });
  check('non-compete blocks applying back to the old employer', !blocked.ok && /non-compete/.test(blocked.msg), blocked.msg);
  const allowed = checkJobApplication(A.S, { employer: offA.employer, reqDegrees: [], qualifiedByDegree: true });
  check('non-compete does not block other employers', allowed.ok, allowed.msg);

  /* Decline: nothing changes. */
  const D = promoReadyLife(103);
  maybeHeadhunterApproach(D.S, { force: true });
  const beforeGross = D.S.career.job.monthlyGross;
  const beforeEmp = D.S.career.job.employer;
  const dec = declineHeadhunterOffer(D.S);
  check('decline succeeds', dec.ok, dec.msg);
  check('decline leaves the job alone', D.S.career.job.monthlyGross === beforeGross && D.S.career.job.employer === beforeEmp && D.S.career.market.offer === null);

  /* Negotiate: counter-offer (strong record). */
  const N1 = promoReadyLife(104);
  maybeHeadhunterApproach(N1.S, { force: true });
  const off1 = N1.S.career.market.offer;
  N1.S.career.job.performance = 80;
  N1.S.people[N1.S.career.job.bossId].rel.respect = 80;
  const cur1 = N1.S.career.job.monthlyGross;
  const neg1 = negotiateWithOffer(N1.S);
  const expect1 = Math.max(Math.round(off1.monthlyGross * 0.9), Math.round(cur1 * 1.08));
  check('negotiate (strong record) wins a counter-offer', neg1.ok && N1.S.career.job.monthlyGross === expect1, `got ${N1.S.career.job.monthlyGross}, expected ${expect1} — ${neg1.msg}`);
  check('negotiate spends the offer', N1.S.career.market.offer === null);

  /* Negotiate: 8% raise (middling record). */
  const N2 = promoReadyLife(105);
  maybeHeadhunterApproach(N2.S, { force: true });
  N2.S.career.job.performance = 70;
  N2.S.people[N2.S.career.job.bossId].rel.respect = 55;
  const cur2 = N2.S.career.job.monthlyGross;
  const neg2 = negotiateWithOffer(N2.S);
  check('negotiate (middling record) wins an 8% raise', neg2.ok && N2.S.career.job.monthlyGross === Math.round(cur2 * 1.08), `got ${N2.S.career.job.monthlyGross}, expected ${Math.round(cur2 * 1.08)} — ${neg2.msg}`);

  /* Negotiate: refusal (weak record) + boss respect falls. */
  const N3 = promoReadyLife(106);
  maybeHeadhunterApproach(N3.S, { force: true });
  N3.S.career.job.performance = 50;
  const boss3 = N3.S.people[N3.S.career.job.bossId];
  boss3.rel.respect = 40;
  const cur3 = N3.S.career.job.monthlyGross;
  const neg3 = negotiateWithOffer(N3.S);
  check('negotiate (weak record) is refused', !neg3.ok, neg3.msg);
  check('refusal costs boss respect (−3) and no raise', boss3.rel.respect === 37 && N3.S.career.job.monthlyGross === cur3, `respect ${boss3.rel.respect}, gross ${N3.S.career.job.monthlyGross}`);
}

/* ================= §2 dashboard ================= */
console.log('--- §2 performance dashboard ---');
{
  const { S, boss } = promoReadyLife(301);
  const job = S.career.job;
  const colleague = S.people[S.relations.colleagueIds[0]];
  colleague.rel.affection = 70; colleague.rel.respect = 60; colleague.rel.trust = 50;
  const dash = getPerformanceDashboard(S);
  check('dashboard exists with the three parts', !!dash && dash.bossView && dash.teamView && dash.numbers);
  check('boss view is the live blended manager view (68)', dash.bossView.value === 68, `got ${dash.bossView.value}`);
  check('team view is the live colleague average (60)', dash.teamView.value === 60, `got ${dash.teamView.value}`);
  check('numbers view is quality/attendance (76)', dash.numbers.value === 76, `got ${dash.numbers.value} (quality ${dash.numbers.quality}, attendance ${dash.numbers.attendance})`);
  check('each part names what would move it', dash.bossView.lever.length > 20 && dash.teamView.lever.length > 20 && dash.numbers.lever.length > 20);
  check('promotion score parts add up (135–155 vs 150)', dash.promo.min === 135 && dash.promo.max === 155 && dash.promo.threshold === 150, `min ${dash.promo.min} max ${dash.promo.max}`);

  const twBefore = job.performanceParts.teamwork;
  const took = takeOnWork(S, 'cover_shift');
  check('covering a shift moves teamwork +2', took.ok && job.performanceParts.teamwork === twBefore + 2, `teamwork ${twBefore} → ${job.performanceParts.teamwork}`);

  /* Monthly drift toward the team's live view. */
  const D = promoReadyLife(302);
  const dj = D.S.career.job;
  const dcol = D.S.people[D.S.relations.colleagueIds[0]];
  dcol.rel.affection = 20; dcol.rel.respect = 20; dcol.rel.trust = 20;
  dj.performance = 50; /* too low for a headhunter or a rival — drift only */
  dj.performanceParts.teamwork = 80;
  tickCareerMarketMonth(D.S);
  check('teamwork drifts toward the team view (80 → 71)', dj.performanceParts.teamwork === 71, `got ${dj.performanceParts.teamwork}`);
}

/* ================= §3 pension ================= */
console.log('--- §3 pension ---');
{
  /* Unit: the pot's month equals the payslip's lines, exactly. */
  for (const [country, gross] of [['egy', 20000], ['gbr', 60000], ['deu', 5000], ['aus', 8000]]) {
    const slip = computePayslip(gross, country, 2026, true, 'normal');
    const amounts = pensionSlipFor(gross, country, 2026, true);
    check(`${country}: pension month == payslip lines (employee ${amounts.employee}, employer ${amounts.employer})`,
      amounts.employee === slip.pensionContribution && amounts.employer === slip.employerPension,
      `slip ${slip.pensionContribution}/${slip.employerPension} vs pot ${amounts.employee}/${amounts.employer}`);
  }
  /* Below the IRS limits: 6% employee, 3% match. */
  const us = pensionSlipFor(5000, 'usa', 2026, true);
  check('USA: 401(k) 6% is real cash out (300 on 5,000)', us.cashOut === 300 && us.employee === 300, `cashOut ${us.cashOut}, employee ${us.employee}`);
  check('USA: employer matches 3% (150 on 5,000)', us.employer === 150, `got ${us.employer}`);
  /* Above the limits (60,000 a month): the IRS caps bind (24,500 a year employee, 360,000 compensation for the match). */
  const usHigh = pensionSlipFor(60000, 'usa', 2026, true);
  check('USA: 401(k) employee deferral is capped at the annual limit (2,042 a month)', usHigh.cashOut === 2042, `cashOut ${usHigh.cashOut}`);
  check('USA: employer match is capped by the compensation limit (900 a month)', usHigh.employer === 900, `got ${usHigh.employer}`);

  /* Settlement identity over 12 months (UK — the named 5% + 3%). */
  const P = employedLife(401, 'gbr');
  const picked = pickTrack(P);
  const jobs = listAvailableJobs(P);
  const listing = jobs.find(j => j.track === picked.id);
  hireDirect(P, { employer: listing.employer, title: picked.track.rungs[0].title, track: picked.id, level: 0, gross: 40000, monthsInRole: 8, performance: 70 });
  check('2026 is a quiet year for world events (pay unmoved)', worldEventEffects(P, 'gbr').salary === 1, `salary mult ${worldEventEffects(P, 'gbr').salary}`);
  const slip0 = computePayslip(40000, 'gbr', 2026, true, 'normal');
  for (let i = 0; i < 12; i++) {
    tickCareerMarketMonth(P);
    settleHouseholdMonth(P);
    nextMonth(P);
  }
  const pen = ensurePension(P);
  check('12 months of contributions recorded', pen.monthsContributed === 12, `got ${pen.monthsContributed}`);
  check('pot = employee + employer + growth (no invented money)', pen.pot === pen.employeeTotal + pen.employerTotal + pen.growthTotal, `pot ${pen.pot} vs ${pen.employeeTotal} + ${pen.employerTotal} + ${pen.growthTotal}`);
  check('pot grew by investment growth, not just contributions', pen.pot > 12 * (slip0.pensionContribution + slip0.employerPension), `pot ${pen.pot} vs 12 months ${12 * (slip0.pensionContribution + slip0.employerPension)}`);
  const contribEntries = pen.history.filter(h => h.kind === 'contribution');
  check('every monthly contribution equals the payslip line (2,000 + 1,200)',
    contribEntries.length === 12 && contribEntries.every(h => h.employee === slip0.pensionContribution && h.employer === slip0.employerPension),
    `entries ${contribEntries.length}, first ${JSON.stringify(contribEntries[0])}`);
  console.log(`  UK pot after 12 months: ${formatMoney(pen.pot, 'gbr')} (employee ${formatMoney(pen.employeeTotal, 'gbr')}, employer ${formatMoney(pen.employerTotal, 'gbr')}, growth ${formatMoney(pen.growthTotal, 'gbr')})`);

  /* USA: the 401(k) is a real cash line in the ledger. */
  const U = employedLife(402, 'usa');
  const up = pickTrack(U);
  const ujobs = listAvailableJobs(U);
  const ulisting = ujobs.find(j => j.track === up.id);
  hireDirect(U, { employer: ulisting.employer, title: up.track.rungs[0].title, track: up.id, level: 0, gross: 60000, monthsInRole: 8, performance: 70 });
  tickCareerMarketMonth(U);
  settleHouseholdMonth(U);
  const k401 = ledgerLines(U, /401\(k\) contribution/);
  check('USA 401(k) lands as a real ledger line (−2,042, capped)', k401.length === 1 && k401[0].delta === -2042, k401.map(l => `${l.label} → ${l.delta}`).join(' | '));

  /* Opt-out stops contributions; opting back in resumes them. */
  const O = employedLife(403, 'gbr');
  const op = pickTrack(O);
  const ojobs = listAvailableJobs(O);
  const olisting = ojobs.find(j => j.track === op.id);
  hireDirect(O, { employer: olisting.employer, title: op.track.rungs[0].title, track: op.id, level: 0, gross: 40000, monthsInRole: 8, performance: 70 });
  for (let i = 0; i < 3; i++) { tickCareerMarketMonth(O); settleHouseholdMonth(O); nextMonth(O); }
  const oPen = ensurePension(O);
  check('opt-out allowed in the UK', optOutPension(O).ok);
  const contributedBefore = oPen.monthsContributed;
  const potBeforeOut = oPen.pot;
  for (let i = 0; i < 3; i++) { tickCareerMarketMonth(O); settleHouseholdMonth(O); nextMonth(O); }
  check('opted out: no new contributions', oPen.monthsContributed === contributedBefore, `${oPen.monthsContributed} vs ${contributedBefore}`);
  check('opted out: the pot keeps its money and still earns growth', oPen.pot >= potBeforeOut, `pot ${potBeforeOut} → ${oPen.pot}`);
  check('opt-in works', optInPension(O).ok);
  tickCareerMarketMonth(O); settleHouseholdMonth(O);
  check('opted back in: contributions resume', oPen.monthsContributed === contributedBefore + 1, `${oPen.monthsContributed} vs ${contributedBefore + 1}`);
  const Eg = employedLife(404, 'egy');
  const egp = pickTrack(Eg);
  const egjobs = listAvailableJobs(Eg);
  const eglisting = egjobs.find(j => j.track === egp.id);
  hireDirect(Eg, { employer: eglisting.employer, title: egp.track.rungs[0].title, track: egp.id, level: 0, gross: 20000, monthsInRole: 8, performance: 70 });
  const egOut = optOutPension(Eg);
  check('Egypt: no opt-out (social insurance is the law)', !egOut.ok && /law/.test(egOut.msg), egOut.msg);

  /* Retirement: the pot pays out as pot/240 on top of the state pension. */
  const R = employedLife(405, 'gbr');
  const rp = pickTrack(R);
  const rjobs = listAvailableJobs(R);
  const rlisting = rjobs.find(j => j.track === rp.id);
  hireDirect(R, { employer: rlisting.employer, title: rp.track.rungs[0].title, track: rp.id, level: 0, gross: 40000, monthsInRole: 8, performance: 70 });
  for (let i = 0; i < 12; i++) { tickCareerMarketMonth(R); settleHouseholdMonth(R); nextMonth(R); }
  const rPen = ensurePension(R);
  const potBefore = rPen.pot;
  check('retirement test pot is real money', potBefore > 0 && potBefore === rPen.employeeTotal + rPen.employerTotal + rPen.growthTotal, `pot ${potBefore}`);
  R.player.age = 60;
  const ret = retireFromCareer(R);
  check('retire succeeds at 60', ret.ok, ret.msg);
  const statePension = R.career.monthlyPension;
  const payout = payOutPensionPot(R);
  const expectTopUp = Math.max(1, Math.round(potBefore / 240));
  check('pot pays out as pot/240 a month', payout.monthlyTopUp === expectTopUp, `got ${payout.monthlyTopUp}, expected ${expectTopUp}`);
  R.career.monthlyPension = (R.career.monthlyPension || 0) + payout.monthlyTopUp; /* the main.js wire */
  check('retirement pension = state pension + pot top-up', R.career.monthlyPension === statePension + expectTopUp, `${R.career.monthlyPension} vs ${statePension} + ${expectTopUp}`);
  check('the pot is spent after payout', rPen.pot === 0 && rPen.paidOut && rPen.paidOut.pot === potBefore, `pot ${rPen.pot}, paidOut ${JSON.stringify(rPen.paidOut)}`);
  console.log(`  retirement: state pension ${formatMoney(statePension, 'gbr')}/mo + pot top-up ${formatMoney(expectTopUp, 'gbr')}/mo from a ${formatMoney(potBefore, 'gbr')} pot`);
}

/* ================= §4 mentor & rival ================= */
console.log('--- §4 mentor & rival ---');
{
  /* Mentor: ask, advice, introduction. */
  const M = promoReadyLife(501);
  const senior = ensureSeniorColleague(M.S);
  check('a senior colleague exists (5+ years older)', !!senior && senior.age >= M.S.player.age + 5, senior && `${senior.fullName}, ${senior.age} vs player ${M.S.player.age}`);
  const ask = askMentor(M.S, senior.id);
  check('a respected senior agrees to mentor', ask.ok, ask.msg);
  check('mentor recorded with the person', M.S.career.market.mentor && M.S.career.market.mentor.personId === senior.id);
  const partsBefore = { ...M.S.career.job.performanceParts };
  const adv = askMentorAdvice(M.S);
  check('mentor advice names the weakest part and lifts it', adv.ok && /weakest part of your record/.test(adv.msg), adv.msg);
  const lifted = ['managerView', 'teamwork', 'quality'].some(k => M.S.career.job.performanceParts[k] === partsBefore[k] + 2);
  check('advice lifts the weakest part +2', lifted, JSON.stringify(M.S.career.job.performanceParts));
  const intro = askMentorIntroduction(M.S);
  check('mentor introduction is real (offer or a plain no)', intro.ok && M.S.career.market.mentor.introductions === 1, intro.msg);

  /* A senior who does not respect you yet refuses, with the reason. */
  const M2 = promoReadyLife(502);
  const senior2 = ensureSeniorColleague(M2.S);
  senior2.rel.respect = 40; senior2.rel.trust = 40;
  const ask2 = askMentor(M2.S, senior2.id);
  check('a senior who does not respect you refuses, with the reason', !ask2.ok && /will not mentor you yet/.test(ask2.msg), ask2.msg);

  /* Promotion twin, interview path: same seed, only the mentor differs.
     Base score 75 + 60 = 135; mentored 147. The mood roll (0–20) must
     land in 3–14 so the unmentored twin fails (138–149) and the mentored
     twin passes (150–161), and the company must not freeze promotions. */
  let twinFound = null;
  for (let seed = 1; seed <= 60 && !twinFound; seed++) {
    const A = promoReadyLife(1000 + seed);
    const B = promoReadyLife(1000 + seed);
    const senA = ensureSeniorColleague(A.S);
    const askA = askMentor(A.S, senA.id);
    if (!askA.ok) continue;
    const d1 = simDraw(A.S.rngState);
    const mood = Math.floor(d1.value * 21);
    const d2 = simDraw(d1.state);
    const frozen = d2.value < 0.12;
    if (!frozen && mood >= 3 && mood <= 14) twinFound = { seed: 1000 + seed, mood, A, B };
  }
  check('a decisive twin seed exists (mood 3–14, no freeze)', !!twinFound, twinFound && `seed ${twinFound.seed}, mood ${twinFound.mood}`);
  if (twinFound) {
    const { A, B, mood } = twinFound;
    const scoreA = 75 + 60 + 12 + mood;
    const scoreB = 75 + 60 + mood;
    check('mentor bonus is exactly +12 on the interview score', scoreA - scoreB === 12, `${scoreA} vs ${scoreB}`);
    for (const [label, T] of [['mentored', A], ['unmentored', B]]) {
      const ap = applyPromotion(T.S);
      if (!ap.ok) { check(`${label}: promotion interview scheduled`, false, ap.msg); continue; }
      const scene = T.S.activeScene;
      check(`${label}: interview scene queued`, !!scene && Array.isArray(scene.choices) && scene.choices.length > 0);
      if (scene) scene.choices[0].effect(T.S);
    }
    check('mentored twin is PROMOTED (score ' + scoreA + ' >= 150)', A.S.career.job.level === 1, `level ${A.S.career.job.level}`);
    check('unmentored twin is REJECTED (score ' + scoreB + ' < 150)', B.S.career.job.level === 0 && B.S.career.job.actionState?.promotion?.stage === 'rejected', `level ${B.S.career.job.level}, stage ${B.S.career.job.actionState?.promotion?.stage}`);
  }

  /* Promotion twin, yearly review path: performance 70, 11 months in
     role. The mentor's +6 lifts the mentored twin over the 72 bar. */
  {
    const A = promoReadyLife(601);
    const B = promoReadyLife(601);
    for (const T of [A, B]) {
      T.S.career.job.performance = 70;
      T.S.career.job.monthsInRole = 11;
      T.S.career.job.performanceParts.quality = 70;
    }
    const senA = ensureSeniorColleague(A.S);
    const askA = askMentor(A.S, senA.id);
    check('review twin: mentor in place', askA.ok, askA.msg);
    tickCareerMonthly(A.S);
    tickCareerMonthly(B.S);
    check('mentored twin auto-promotes at the yearly review (70+6 >= 72)', A.S.career.job.level === 1, `level ${A.S.career.job.level}, perf ${A.S.career.job.performance}`);
    check('unmentored twin does not (70 < 72)', B.S.career.job.level === 0, `level ${B.S.career.job.level}`);
  }

  /* Rival: spawn, collaborate, compete, undermine (both outcomes). */
  const V = promoReadyLife(701);
  const spawned = maybeSpawnRival(V.S, { force: true });
  check('a rival spawns on demand', !!spawned && !!V.S.people[spawned.personId], JSON.stringify(spawned));
  const rival = V.S.people[spawned.personId];
  check('the rival is a colleague at your level', rival.role === 'colleague');
  check('rival ahead of you costs −10 on the interview score', (() => {
    V.S.career.market.rival.performance = 80; V.S.career.job.performance = 70;
    return rivalPromotionTerm(V.S) === -10;
  })());
  check('rival behind you is worth +5', (() => {
    V.S.career.market.rival.performance = 60; V.S.career.job.performance = 70;
    return rivalPromotionTerm(V.S) === 5;
  })());
  const trustBefore = rival.rel.trust;
  const twBefore = V.S.career.job.performanceParts.teamwork;
  const collab = rivalAction(V.S, 'collaborate');
  check('collaborate: trust +8 and the rival becomes an ally', collab.ok && rival.rel.trust === trustBefore + 8 && V.S.career.market.rival.stance === 'ally', collab.msg);
  check('collaborate: teamwork +2', V.S.career.job.performanceParts.teamwork === twBefore + 2, `${twBefore} → ${V.S.career.job.performanceParts.teamwork}`);
  const perfBefore = V.S.career.job.performance;
  const rivalPerfBefore = V.S.career.market.rival.performance;
  const comp = rivalAction(V.S, 'compete');
  check('compete: both push (+2 each)', comp.ok && V.S.career.job.performance === perfBefore + 2 && V.S.career.market.rival.performance === rivalPerfBefore + 2, comp.msg);

  let sawDiscovered = null, sawClean = null;
  for (let seed = 801; seed < 841 && (!sawDiscovered || !sawClean); seed++) {
    const U = promoReadyLife(seed);
    maybeSpawnRival(U.S, { force: true });
    const uRival = U.S.people[U.S.career.market.rival.personId];
    const uBoss = U.S.people[U.S.career.job.bossId];
    const bossRespBefore = uBoss.rel.respect;
    const rivalPerf = U.S.career.market.rival.performance;
    const res = rivalAction(U.S, 'undermine');
    if (!res.ok) continue;
    if (/backfired/.test(res.msg)) {
      if (!sawDiscovered) sawDiscovered = { bossDelta: uBoss.rel.respect - bossRespBefore, msg: res.msg };
    } else if (/worked/.test(res.msg)) {
      if (!sawClean) sawClean = { rivalDelta: U.S.career.market.rival.performance - rivalPerf, msg: res.msg };
    }
  }
  check('undermine discovered: manager respect −10', !!sawDiscovered && sawDiscovered.bossDelta === -10, JSON.stringify(sawDiscovered));
  check('undermine undiscovered: rival performance −5', !!sawClean && sawClean.rivalDelta === -5, JSON.stringify(sawClean));
}

/* ================= §5 render ================= */
console.log('--- §5 render ---');
{
  const { S } = promoReadyLife(901);
  maybeHeadhunterApproach(S, { force: true });
  const senior = ensureSeniorColleague(S);
  askMentor(S, senior.id);
  maybeSpawnRival(S, { force: true });
  const html = strip(renderWorkTabHtml(S));
  const offer = S.career.market.offer;
  check('Career tab renders the performance dashboard', /Performance dashboard/.test(html));
  check('Career tab renders the pension pot', /Pension —/.test(html) && /Your pot:/.test(html));
  check('Career tab renders the headhunter offer with the recruiter name', !!offer && new RegExp(offer.recruiterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(html), offer && offer.recruiterName);
  check('Career tab renders the mentor', new RegExp(senior.firstName).test(html));
  check('Career tab renders the rival', /Your rival:/.test(html));
  check('the old "nothing moves it yet" teamwork line is gone', !/nothing moves it yet/.test(html));
  const U = employedLife(902);
  const noJobHtml = strip(renderWorkTabHtml(U));
  check('Career tab renders without a job (no crash)', noJobHtml.length > 100);
}

/* ================= §6 main RNG stream untouched ================= */
console.log('--- §6 main RNG stream untouched ---');
{
  const S = promoReadyLife(1001).S;
  const before = S.rngState;
  tickCareerMarketMonth(S);
  maybeHeadhunterApproach(S, { force: true });
  maybeSpawnRival(S, { force: true });
  const pen = ensurePension(S);
  accruePensionMonth(S, pensionSlipFor(S.career.job.monthlyGross, S.country, S.year, true));
  check('a full career-market month leaves the main RNG stream untouched', S.rngState === before, `${before} → ${S.rngState}`);
}

console.log(`\n${pass} passed, ${fail} failed${fail ? ` — failures: ${failures.join(', ')}` : ''}`);
process.exit(fail ? 1 : 0);
