/* W4 independent verification for v2.8 — written from the spec, not from the
   workers' scripts. Run from the working-copy dir: node tests/v28-verify.mjs
   Every money check goes through the REAL pay function and the REAL ledger. */
import { createNewLifeState, ensureExtendedState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import {
  listAvailableJobs, applyForJob, getMergedCareerTracks, getRequiredForeignBoardForJob,
  describeJobRequirements, jobEligibility, buildJobInterviewScene, resolveJobInterview,
  describeJobOffer, tickCareerMonthly, getJobContract, getLadderForJob
} from '../src/systems/careerEducationEngine.js';
import { settleHouseholdMonth } from '../src/systems/economyEngine.js';
/* v2.15 (coordinator merge fix): world events scale the gross before tax. */
import { worldEventEffects } from '../src/systems/worldEvents.js';
import { computePayslip, computeMonthlyNetPay, convertCurrency } from '../src/data/economy.js';
import { COUNTRY_IDS } from '../src/data/countries.js';
import { SHOP_MEGA_CATALOG } from '../src/data/megaCarsAndShop.js';
import {
  setWorkMode, trainQualify, requestLeave, applyPromotion, promotionEligibility,
  vacationBalance, ensureJobActionState, tickCareerActionsMonthly, requestResign
} from '../src/systems/careerActions.js';
import {
  evaluateGig, takeSideOrStudentGig, takeVacationOrPilgrimage
} from '../src/systems/completeLifeSystems.js';
import { V1_PARTTIME_JOBS } from '../src/data/megaCareerEduMedical.js';
import { canLegallyWorkInCurrentCountry } from '../src/systems/careerEducationEngine.js';
import { renderWorkTabHtml } from '../src/ui/views.js';

const out = [];
const check = (name, cond, detail = '') => {
  out.push(`${cond ? 'PASS' : 'FAIL'} ${name} ${detail}`);
  if (!cond) process.exitCode = 1;
};

function hireAny(S) {
  for (let t = 0; t < 10 && !S.career.employed; t++) {
    const jobs = listAvailableJobs(S).filter(j => j.qualifiedByDegree && !j.missingBoard);
    if (!jobs.length) break;
    applyForJob(S, jobs[0]);
  }
  return S.career.employed;
}
function advanceToAge(S, target) {
  let n = 0;
  while (S.player.age < target && n < 400) {
    advanceSingleTurn(S);
    if (S.activeScene) resolveActiveSceneChoice(S, 0); // shipped pattern: a pending scene blocks the next turn
    n++;
  }
  return S.player.age >= target;
}
/* Test setup only: conscription blocks civilian hiring, so a life still in
   active service is discharged for the career checks below. */
function clearService(S) { if (S.legal?.military?.status === 'active_duty') S.legal.military.status = 'completed'; }
function employedLife(seed, country, birthYear) {
  const S = createNewLifeState({ seed, country, birthYear, familyTier: 'middle', gender: 'm' });
  const ok = advanceToAge(S, 22);
  clearService(S);
  check(`setup life reaches 22 (${country} seed ${seed})`, ok, `age=${S.player.age}`);
  S.player.vitals.smarts = 90; S.skills.charisma = 80;
  hireAny(S);
  return S;
}
function salaryLine(S) {
  return (S.money.lastMonthSummary.incomeParts || []).find(p => String(p.label).startsWith('Salary'));
}

/* ---- (3) PAYSLIP: 3 jobs / 3 countries, real pay fn + real ledger ---- */
function payslipCase(seed, country, birthYear, gross, title, employer, workMode, expectNet) {
  const S = employedLife(seed, country, birthYear);
  check(`payslip ${country} setup employed`, !!S.career.employed, `job=${S.career.job?.title} gross=${S.career.job?.monthlyGross} year=${S.year}`);
  const job = S.career.job;
  job.monthlyGross = gross; job.title = title; job.employer = employer; job.workMode = workMode;
  const ps = computePayslip(gross, country, S.year, true, workMode);
  check(`payslip ${country} adds up (gross-tax-social=net)`, ps.gross - ps.incomeTax - ps.socialSecurity === ps.net,
    `gross=${ps.gross} tax=${ps.incomeTax} social=${ps.socialSecurity} net=${ps.net}`);
  settleHouseholdMonth(S);
  const line = salaryLine(S);
  /* v2.15 (coordinator merge fix): world events scale the GROSS before tax
     (economyEngine §1: gross = (monthlyGross + overtime) × salaryMult), so
     in an event year the ledger credit is the net of the ADJUSTED gross —
     not the payslip net. Egypt 2013 (Euro Debt Crisis + Egyptian Revolution,
     ×0.9108): 6,400 → 5,860. UK/USA 2024 (War in Ukraine, ×0.98): 2,930 →
     2,875 and 5,952 → 5,847. The payslip itself is unchanged (its net is
     still the W1 number) — the event moves the pay, not the payslip. The
     ledger line must also name the event. */
  const eff = worldEventEffects(S, country);
  const expectLedger = Math.round(computeMonthlyNetPay(Math.round(ps.gross * eff.salary), country, S.year, true).net);
  check(`payslip ${country} net == ledger credit`, line && line.amount === expectLedger, `ledger=${line?.amount} expected=${expectLedger} payslip=${ps.net} salaryMult=${eff.salary}`);
  if (eff.salary !== 1) check(`payslip ${country} ledger names the event`, line && eff.activeNames.every(n => line.label.includes(n)), `label=${line?.label}`);
  check(`payslip ${country} net is ${expectNet} (W1 number)`, ps.net === expectNet, `net=${ps.net}`);
  return S;
}
// Egypt Cadet Pilot 9,461 in 2013: old screenshot net 6,800 (28%); real net 6,400
payslipCase(101, 'egy', 1991, 9461, 'Cadet Pilot', 'Nile Air', 'normal', 6400);
// UK Software Engineer II 3,800 in 2024
payslipCase(102, 'gbr', 2002, 3800, 'Software Engineer II', 'Test Employer', 'normal', 2930);
// USA Junior Accountant 6,500 in 2024, overtime mode
payslipCase(103, 'usa', 2002, 6500, 'Junior Accountant', 'Test Employer', 'overtime', 5952);

// Tax-free labelling: only Saudi Arabia and UAE have no personal income tax
const taxFree = COUNTRY_IDS.filter(c => computeMonthlyNetPay(5000, c, 2024, true).taxFree);
check('tax-free only sau+uae', taxFree.length === 2 && taxFree.includes('sau') && taxFree.includes('uae'), `taxFree=${taxFree.join(',')}`);
const egyPay = computeMonthlyNetPay(9461, 'egy', 2013, true);
check('Egypt tax uses real brackets (bands shown)', Array.isArray(egyPay.taxBands) && egyPay.taxBands.length > 0, `bands=${egyPay.taxBands.length} tax=${Math.round(egyPay.incomeTax)}`);

console.error('--- payslip section done ---');
/* ---- (4) ACTIONS on a fresh Egypt life ---- */
const A = employedLife(777, 'egy', 1990);
check('actions setup employed', !!A.career.employed, A.career.job?.title);
A.money.cash = 500000;
const aJob = A.career.job;
// Overtime: pay, stress, performance, ledger exactly
const baseNet = Math.round(computeMonthlyNetPay(aJob.monthlyGross, 'egy', A.year, true).net);
const perf0 = aJob.performance, stress0 = A.player.vitals.stress;
setWorkMode(A, 'overtime');
settleHouseholdMonth(A);
const otLine = salaryLine(A);
const otPay = computePayslip(aJob.monthlyGross, 'egy', A.year, true, 'overtime').overtimePay;
const otNet = Math.round(computeMonthlyNetPay(aJob.monthlyGross + otPay, 'egy', A.year, true).net);
/* v2.15 (coordinator merge fix): same world-event gross scaling — Egypt
   2012 is inside the Euro Debt Crisis + Egyptian Revolution (×0.9108), so
   the overtime month's ledger credit is the net of the adjusted overtime
   gross, not the payslip overtime net. */
const effA = worldEventEffects(A, 'egy');
const otNetEvent = Math.round(computeMonthlyNetPay(Math.round((aJob.monthlyGross + otPay) * effA.salary), 'egy', A.year, true).net);
check('overtime ledger moves by exactly the overtime pay', otLine && otLine.amount === otNetEvent && otLine.amount > baseNet,
  `ledger=${otLine?.amount} expected=${otNetEvent} baseNet=${baseNet} otNet=${otNet}`);
tickCareerMonthly(A); tickCareerActionsMonthly(A);
/* (replacement) The old assertion read perf/stress after settleHouseholdMonth PLUS two more ticks: settle already ticks the career and rolls random life effects, so the delta was never one overtime month. Isolate ONE tickCareerMonthly on a fresh employed life instead, against the balanced-pace baseline in the same tick. */
{ const O = employedLife(777, 'egy', 1990); const N = employedLife(777, 'egy', 1990);
  setWorkMode(O, 'overtime'); N.career.job.workMode = 'normal';
  const o0 = O.career.job.performance, os0 = O.player.vitals.stress, n0 = N.career.job.performance, ns0 = N.player.vitals.stress;
  tickCareerMonthly(O); tickCareerMonthly(N);
  const od = O.career.job.performance - o0, nd = N.career.job.performance - n0;
  check('overtime month: one tick gives performance +1.5 and stress +3 (balanced pace +0.4 and +0 in the same tick)', Math.abs(od - 1.5) < 0.01 && O.player.vitals.stress === os0 + 3 && Math.abs(nd - 0.4) < 0.01 && N.player.vitals.stress === ns0,
    `overtime perf ${o0}->${O.career.job.performance} stress ${os0}->${O.player.vitals.stress}; normal perf ${n0}->${N.career.job.performance}`); }
setWorkMode(A, 'normal');
// Training: costs exactly the recorded fee, recorded on the job
const cash0 = A.money.cash;
const tr = trainQualify(A, 'course');
const stA = ensureJobActionState(A);
check('training costs exactly the recorded fee and is recorded', tr.ok && stA.training.length === 1 && A.money.cash === cash0 - stA.training[0].cost,
  `fee=${stA.training[0]?.cost} cash ${cash0}->${A.money.cash}`);
// Licence renewal on the same id the Education tab shows
A.education.degrees = ['medicine']; aJob.track = 'medicine';
A.credentials.licenses = ['lic_uk_plab'];
const cash1 = A.money.cash;
const tr2 = trainQualify(A, 'certification', 'lic_uk_plab');
const rec = A.credentials.licenceRenewals?.['lic_uk_plab'];
check('licence renewal same id, fee charged, valid 5y', tr2.ok && rec?.validUntilYear === A.year + 5 && A.money.cash < cash1,
  `validUntil=${rec?.validUntilYear} year=${A.year} cash ${cash1}->${A.money.cash}`);
// Leave: 5 days approved, balance moves, answer recorded
aJob.performance = 90;
const bal0 = vacationBalance(A);
let leaveRes = null;
for (let i = 0; i < 5 && !(leaveRes && leaveRes.ok); i++) leaveRes = requestLeave(A, 'vacation5');
const bal1 = vacationBalance(A);
const log0 = ensureJobActionState(A).leaveLog[0];
check('leave 5 days approved: used 0->5 left 21->16, answer recorded', leaveRes?.ok && bal1.used === 5 && bal1.left === 16 && log0?.approved === true,
  `used=${bal1.used} left=${bal1.left} log=${JSON.stringify(log0)}`);
// Trip spends vacation days (Sharm, 5 typical days)
A.money.cash = 500000;
const usedBefore = A.career.job.leave.usedDays;
const trip = takeVacationOrPilgrimage(A, 'sharm');
const usedAfter = A.career.job.leave.usedDays;
check('Sharm trip spends 5 vacation days', trip.ok && usedAfter === usedBefore + 5,
  `used ${usedBefore}->${usedAfter} left=${vacationBalance(A).left} msg=${(trip.msg || '').slice(0, 80)}`);

console.error('--- actions section done ---');
/* ---- (5) PROMOTION ---- */
const P = employedLife(888, 'egy', 1990);
const pJob = P.career.job;
pJob.performance = 50; pJob.monthsInRole = 2; P.career.trackExperience[pJob.track] = 0;
const inelig = promotionEligibility(P);
const ineligRes = applyPromotion(P);
check('promotion ineligible sees what is missing', !inelig.eligible && !ineligRes.ok && /experience|performance|month/i.test(ineligRes.msg),
  ineligRes.msg);
const track = getMergedCareerTracks(P.year)[pJob.track];
const nextRung = track.rungs[pJob.level + 1];
pJob.performance = 88; pJob.monthsInRole = 12;
P.career.trackExperience[pJob.track] = nextRung.minExp;
if (pJob.bossId && P.people[pJob.bossId]) P.people[pJob.bossId].rel.respect = 90;
const elig = promotionEligibility(P);
check('promotion eligible when every requirement met', elig.eligible, `missing=${elig.missing.join(';')}`);
const promRes = applyPromotion(P);
check('promotion apply queues an interview scene', promRes.ok && P.activeScene?.title?.includes('Promotion interview'), `scene=${P.activeScene?.title}`);
resolveActiveSceneChoice(P, 0);
check('promotion interview resolves to a recorded outcome', !!ensureJobActionState(P).promotion || /Promot|Passed over/i.test(P.journal[0]?.text || ''),
  `journal: ${(P.journal[0]?.text || '').slice(0, 100)}`);

console.error('--- promotion section done ---');
/* ---- SECURITY: warnings -> dismissal with severance; resign with notice ---- */
const S2 = employedLife(999, 'egy', 1990);
const j2 = S2.career.job; j2.monthsInRole = 24; j2.performance = 30;
const st2 = ensureJobActionState(S2); st2.warnings = 2; st2.lowPerfMonths = 2;
S2.money.cash = 100000;
const cash2 = S2.money.cash;
tickCareerMonthly(S2); tickCareerActionsMonthly(S2);
const expectedSev = Math.round(j2.monthlyGross * 4); // Egypt: 2 months/yr x 2 yrs
check('3rd warning dismisses with Egypt severance (4 months pay)', !S2.career.employed && S2.money.cash === cash2 + expectedSev,
  `employed=${S2.career.employed} cash ${cash2}->${S2.money.cash} expectedSev=${expectedSev} ref=${JSON.stringify(S2.career.lastReference)}`);
const S3 = employedLife(111, 'egy', 1990);
S3.career.job.performance = 80;
const rr = requestResign(S3);
const noticeMonths = ensureJobActionState(S3).noticeServing?.months;
check('resign starts a notice period (Egypt 2 months)', rr.ok && noticeMonths === 2, rr.msg);
S3.turn = ensureJobActionState(S3).noticeServing.untilTurn;
tickCareerActionsMonthly(S3);
check('notice completes: job ends, reference recorded', !S3.career.employed && !!S3.career.lastReference,
  `ref=${JSON.stringify(S3.career.lastReference)}`);

/* ---- (6) GIGS ---- */
const G = createNewLifeState({ seed: 555, country: 'egy', birthYear: 1998, familyTier: 'middle', gender: 'm' });
check('gig life reaches 15', advanceToAge(G, 15), `age=${G.player.age}`);
G.player.vitals.smarts = 70; G.skills.charisma = 60; G.money.cash = 10000;
const baristaIdx = V1_PARTTIME_JOBS.findIndex(g => /barista/i.test(g.label || ''));
check('gig setup: barista gig exists in data', baristaIdx >= 0, `idx=${baristaIdx}`);
const ev = evaluateGig(G, 'parttime', baristaIdx);
check('gig shows hours, pay, requirements, risks', ev.pay > 0 && ev.hoursPerWeek > 0 && ev.requirements.length >= 3 && ev.risks.length >= 1,
  `pay=${ev.pay} hrs=${ev.hoursPerWeek}/wk reqs=${ev.requirements.length} risks=${ev.risks.length} payer=${ev.payer} when=${ev.when}`);
check('gig requirements each carry a reason', ev.requirements.every(r => r.label && typeof r.met === 'boolean' && r.reason), '');
const gCash0 = G.money.cash, gStress0 = G.player.vitals.stress;
const take = takeSideOrStudentGig(G, 'parttime', baristaIdx);
check('taking a gig moves the ledger by exactly the gig pay', take.ok && G.money.cash === gCash0 + ev.pay,
  `cash ${gCash0}->${G.money.cash} pay=${ev.pay}`);
check('gig costs time: stress rises', G.player.vitals.stress > gStress0, `stress ${gStress0}->${G.player.vitals.stress}`);
// requiresBike gigs: locked, honest reason; no bicycle in the shop catalogue
const bikeIdx = V1_PARTTIME_JOBS.findIndex(g => g.requiresBike);
const bikeEv = evaluateGig(G, 'parttime', bikeIdx);
const bikeRow = bikeEv.requirements.find(r => /Bicycle/.test(r.label));
check('requiresBike gig lists the bicycle requirement with the honest reason', bikeIdx >= 0 && bikeRow && !bikeRow.met && /none is sold in the shops/.test(bikeRow.reason),
  `idx=${bikeIdx} row=${JSON.stringify(bikeRow)}`);
const GB = createNewLifeState({ seed: 556, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
check('adult bike-test life reaches 22', advanceToAge(GB, 22), `age=${GB.player.age}`); clearService(GB);
const bikeEvAdult = evaluateGig(GB, 'parttime', bikeIdx);
check('requiresBike gig locked for an adult by the bicycle, not by age', !bikeEvAdult.available && /bicycle/i.test(bikeEvAdult.lockReason || ''),
  `lock=${bikeEvAdult.lockReason}`);
const bikesInShop = SHOP_MEGA_CATALOG.filter(it => /bicycle/i.test(`${it.catalogId || ''} ${it.name || ''} ${it.label || ''}`));
check('no bicycle in shop catalogue (1,293 count untouched)', bikesInShop.length === 0, `found=${bikesInShop.length}`);
// Student-visa 20h gate (UK)
const V = createNewLifeState({ seed: 666, country: 'gbr', birthYear: 2000, familyTier: 'middle', gender: 'm' });
check('visa life reaches 22', advanceToAge(V, 22), `age=${V.player.age}`);
V.legal.residency.kind = 'student_visa';
const auth = canLegallyWorkInCurrentCountry(V);
check('student visa is part-time-only work auth', auth.allowed === true && auth.partTimeOnly === true, JSON.stringify(auth));
const longIdx = V1_PARTTIME_JOBS.findIndex(g => (Number(g.hoursPerWeek) || 15) > 20);
const longEv = evaluateGig(V, 'parttime', longIdx);
check('30h gig refused on student visa with the 20h reason', longIdx >= 0 && !longEv.available && /20h\/week/.test(longEv.lockReason || ''),
  `idx=${longIdx} hrs=${V1_PARTTIME_JOBS[longIdx]?.hoursPerWeek} lock=${longEv.lockReason}`);
const longTake = takeSideOrStudentGig(V, 'parttime', longIdx);
check('taking the refused gig refuses plainly', !longTake.ok && /20h\/week/.test(longTake.msg || ''), longTake.msg);
const shortIdx = V1_PARTTIME_JOBS.findIndex(g => (Number(g.hoursPerWeek) || 15) <= 20 && !g.requiresCar && !g.requiresBike && !g.requiresDegree);
const shortEv = evaluateGig(V, 'parttime', shortIdx);
check('short gig inside the 20h cap is open on a student visa', shortIdx >= 0 && shortEv.available, `idx=${shortIdx} hrs=${V1_PARTTIME_JOBS[shortIdx]?.hoursPerWeek}`);

console.error('--- gigs section done ---');
/* ---- (7) JOB MARKET ---- */
const M = createNewLifeState({ seed: 444, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
check('market life reaches 22', advanceToAge(M, 22), `age=${M.player.age}`); clearService(M);
M.player.vitals.smarts = 90; M.skills.charisma = 80;
M.education.degrees = ['medicine'];
M.education.university = null; // graduated: the interview test needs a graduate, not a current student
const medJobs = listAvailableJobs(M).filter(j => j.track === 'medicine');
check('market setup: medicine listings exist', medJobs.length > 0, `n=${medJobs.length}`);
const mj = medJobs[0];
const reqs = describeJobRequirements(M, mj);
check('listing shows per-requirement met/not-met with reasons', reqs.length >= 4 && reqs.every(r => typeof r.met === 'boolean' && r.reason && r.reason.length > 5),
  reqs.map(r => `${r.label}:${r.met ? 'met' : 'NOT'} (${r.reason.slice(0, 40)})`).join(' | '));
check('listing degree row met for a medicine graduate', reqs.some(r => /Degree/.test(r.label) && r.met), '');
const eligM = jobEligibility(M, mj);
check('jobEligibility agrees with the requirement rows', typeof eligM.eligible === 'boolean', `eligible=${eligM.eligible}`);
const offer = describeJobOffer(M, mj);
check('listing pay breakdown adds up', offer.pay && (offer.pay.gross - offer.pay.incomeTax - offer.pay.socialSecurity === offer.pay.net),
  `gross=${offer.pay?.gross} tax=${offer.pay?.incomeTax} social=${offer.pay?.socialSecurity} net=${offer.pay?.net}`);
/* v2.18 purge — the benefits array now holds only per-job benefits
   (the pension, whose amounts vary with the salary). Medical cover,
   sick leave and the standard annual-leave days are the same for
   every job in the country and print once above the market, so the
   listing no longer repeats them 35 times. The check below asserts
   the per-job benefit is there AND the header still states the
   country-standard terms where the player can see them. */
check('listing states contract, hours, leave, benefits', /Permanent, full-time/.test(offer.contract) && offer.hoursPerWeek > 0 && offer.benefits.length >= 1,
  `${offer.contract} ${offer.hoursPerWeek}h/wk benefits=${offer.benefits.length}`);
const mJobsHtml = renderWorkTabHtml(M, { workSub: 'jobs' });
check('market header states the standard annual leave and paid sick days once (the old medical-cover sentence is no longer printed)', (mJobsHtml.match(/Annual leave: 21 days · Sick leave: 90 paid days/g) || []).length === 1, 'leave + sick header');
const scene = buildJobInterviewScene(M, mj);
check('applying builds a real interview scene', scene.title.includes('Job Interview') && scene.choices.length === 3, scene.title);
const ires = resolveJobInterview(M, mj, 'preparation');
check('interview resolves to hire or rejection WITH a reason', typeof ires.msg === 'string' && ires.msg.length > 10,
  `hired=${ires.hired} msg=${(ires.msg || '').slice(0, 110)}`);
check('hire is recorded, or a rejection names the score and weakest area', (M.career.employed && /Hired/.test(ires.msg || '')) || /Interview score \d+\/100 \(needed 46\)/.test(ires.msg || ''),
  `employed=${M.career.employed} msg=${(ires.msg || '').slice(0, 120)}`);
// A weak applicant must be rejected WITH the score and weakest area named
const MW = createNewLifeState({ seed: 447, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
check('weak life reaches 22', advanceToAge(MW, 22), `age=${MW.player.age}`); clearService(MW);
/* Pinned: the interview draw is random (+5..32), so the old smarts 45 profile could clear 46 on a lucky draw. At smarts 25 / charisma 30 even the maximum draw falls short, so the rejection path is exercised deterministically. */
MW.player.vitals.smarts = 25; MW.skills.charisma = 30; MW.career.yearsExperience = 0;
MW.education.degrees = ['medicine']; MW.education.university = null;
const weakRes = resolveJobInterview(MW, mj, 'preparation');
check('weak applicant is rejected with score + weakest area', !MW.career.employed && /Interview score \d+\/100 \(needed 46\)\. Your weakest area was \w+/.test(weakRes.msg || ''),
  `msg=${(weakRes.msg || '').slice(0, 140)}`);
const M2 = createNewLifeState({ seed: 445, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
check('market life 2 reaches 22', advanceToAge(M2, 22), `age=${M2.player.age}`); clearService(M2);
M2.education.degrees = [];
const reqs2 = describeJobRequirements(M2, mj);
check('same listing for a no-degree life: degree not-met naming MEDICINE', reqs2.some(r => /Degree/.test(r.label) && !r.met && /MEDICINE/.test(r.reason)),
  reqs2.map(r => `${r.label}:${r.met}`).join(','));
// German board id (W1 fix): foreign-educated doctor in Germany needs the real id
const D = createNewLifeState({ seed: 446, country: 'deu', birthYear: 1990, familyTier: 'middle', gender: 'm' });
check('german life reaches 22', advanceToAge(D, 22), `age=${D.player.age}`); clearService(D);
D.education.degrees = ['medicine']; D.education.degreeCountries = { medicine: 'egy' };
D.legal.citizenships = ['egy'];
const board = getRequiredForeignBoardForJob(D, 'medicine', ['medicine']);
check('German board gate returns the real licence id', board && board.id === 'lic_deu_approbation', `id=${board?.id}`);
D.credentials.licenses = ['lic_deu_approbation'];
check('holding the real licence clears the German board gate', getRequiredForeignBoardForJob(D, 'medicine', ['medicine']) === null, '');

console.error('--- market section done ---');
/* ---- (9) CAREER TAB RENDERS: card, actions, gigs, market ---- */
const html = renderWorkTabHtml(A, { workSub: 'jobs' });
check('career tab shows the payslip breakdown', /payslip/i.test(html) && /Income tax/i.test(html), '');
check('career tab shows contract + ladder + performance + benefits', /Contract/i.test(html) && /Ladder|next rung/i.test(html) && /Performance/i.test(html) && /Insurance|Benefit/i.test(html), '');
check('career tab shows the action set (train, leave, resign)', /Train/i.test(html) && /Take 5 Days|Vacation/i.test(html) && /Resign/i.test(html), '');
check('career tab has no Education stub', !/now live on the Education tab/i.test(html) && !/renderEducationPointerHtml/.test(html), '');
check('career tab has no flat +15% overtime text', !html.includes('+15% Pay'), '');
const gigHtml = renderWorkTabHtml(G, { workSub: 'gigs' });
check('gigs subtab shows hours and risks', /h\/week|hours/i.test(gigHtml) && /risk/i.test(gigHtml), '');
const mHtml = renderWorkTabHtml(M, { workSub: 'jobs' });
check('market listing html shows requirements and pay', /Degree/i.test(mHtml) && /Net|net/i.test(mHtml), '');

console.log(out.join('\n'));
console.log(`TOTAL ${out.filter(l => l.startsWith('PASS')).length}/${out.length} PASS`);
