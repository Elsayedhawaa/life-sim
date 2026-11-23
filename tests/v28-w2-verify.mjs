/* W2 §3 verification — run through the REAL functions, counted numbers only.
   Usage: node /tmp/v28-w2-verify.mjs   (from the working-copy dir) */
import { createNewLifeState, ensureExtendedState } from './src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from './src/core/gameLoop.js';
import { listAvailableJobs, applyForJob, getMergedCareerTracks } from './src/systems/careerEducationEngine.js';
import { settleHouseholdMonth } from './src/systems/economyEngine.js';
import { computeMonthlyNetPay, computeOvertimePay, convertCurrency } from './src/data/economy.js';
import {
  setWorkMode, takeOnWork, trainQualify, askForMore, requestLeave, applyPromotion,
  promotionEligibility, peopleAtWork, requestResign, walkOut, vacationBalance,
  licenceStatus, tickCareerActionsMonthly, securitySummary, ensureJobActionState,
  overtimePreview, actionPreviews
} from './src/systems/careerActions.js';
import { tickCareerMonthly } from './src/systems/careerEducationEngine.js';
import { renderWorkTabHtml } from './src/ui/views.js';

const out = [];
const check = (name, cond, detail = '') => { out.push(`${cond ? 'PASS' : 'FAIL'} ${name} ${detail}`); if (!cond) process.exitCode = 1; };

// --- Build an employed adult life (same shape as coherence_suite) ---
const S = createNewLifeState({ seed: 4242, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
while (S.player.age < 22) advanceSingleTurn(S);
S.player.vitals.smarts = 90;
S.skills.charisma = 80;
let hired = false;
for (let tries = 0; tries < 8 && !hired; tries++) {
  const jobs = listAvailableJobs(S).filter(j => j.qualifiedByDegree && !j.missingBoard);
  if (!jobs.length) break;
  const r = applyForJob(S, jobs[0]);
  hired = r.ok;
}
check('(setup) employed at 22', hired && S.career.employed, `job=${S.career.job?.title} @ ${S.career.job?.employer} gross=${S.career.job?.monthlyGross}`);
const job = S.career.job;
const boss = job.bossId ? S.people[job.bossId] : null;
check('(setup) boss is a real person', !!boss, boss?.fullName || 'none');
S.money.cash = 500000;

// --- (a) OVERTIME: pay, stress, performance, ledger exactly ---
const ot = overtimePreview(S);
check('(a) overtime preview is Egypt 1.35x law rate', ot.mult === 1.35 && ot.source === 'law', `mult=${ot.mult} otGross=${ot.otGross} netExtra=${ot.netExtra}`);
const gross = job.monthlyGross;
const expectedOtGross = computeOvertimePay(job, 'egy');
const expectedNetOt = Math.round(computeMonthlyNetPay(gross + expectedOtGross, 'egy', S.year, true).net - computeMonthlyNetPay(gross, 'egy', S.year, true).net);
check('(a) overtime gross = 20h x gross/160 x 1.35', expectedOtGross === Math.round(20 * (gross / 160) * 1.35), `otGross=${expectedOtGross}`);
const perf0 = job.performance, stress0 = S.player.vitals.stress;
setWorkMode(S, 'overtime');
settleHouseholdMonth(S);
const salaryPart = (S.money.lastMonthSummary.incomeParts || []).find(p => String(p.label).startsWith('Salary'));
const expectedNet = Math.round(computeMonthlyNetPay(gross + expectedOtGross, 'egy', S.year, true).net);
check('(a) ledger salary = net WITH real overtime pay', salaryPart && salaryPart.amount === expectedNet, `ledger=${salaryPart?.amount} expected=${expectedNet} (base net=${Math.round(computeMonthlyNetPay(gross, 'egy', S.year, true).net)})`);
tickCareerMonthly(S); tickCareerActionsMonthly(S);
check('(a) overtime month: perf +1.5, stress +3', Math.abs(job.performance - (perf0 + 1.5)) < 0.01 && S.player.vitals.stress === stress0 + 3, `perf ${perf0}->${job.performance} stress ${stress0}->${S.player.vitals.stress}`);
setWorkMode(S, 'normal');

// --- (b) TRAINING: costs money, recorded on the licence ---
const cashBefore = S.money.cash;
const courseFee = Math.round(convertCurrency(400, 'usa', 'egy', S.year));
const tr = trainQualify(S, 'course');
const st = ensureJobActionState(S);
check('(b) course costs exactly the fee and is recorded', tr.ok && S.money.cash === cashBefore - courseFee && st.training.length === 1 && st.training[0].cost === courseFee, `fee=${courseFee} cash ${cashBefore}->${S.money.cash} perf=${Math.round(job.performance)}`);
// Licence renewal on the SAME licence id the Education tab shows
S.education.degrees = ['medicine'];
job.track = 'medicine';
S.credentials.licenses = ['lic_uk_plab'];
const cashBefore2 = S.money.cash;
const renewFee = Math.round(convertCurrency(Math.max(60, 1950 * 0.2), 'usa', 'egy', S.year));
const tr2 = trainQualify(S, 'certification', 'lic_uk_plab');
const rec = S.credentials.licenceRenewals?.['lic_uk_plab'];
check('(b) licence renewal: same id, fee charged, valid 5y', tr2.ok && S.money.cash === cashBefore2 - renewFee && rec?.validUntilYear === S.year + 5, `fee=${renewFee} validUntil=${rec?.validUntilYear} cash ${cashBefore2}->${S.money.cash}`);
job.track = S.career.job.track; // keep medicine for promotion licence checks

// --- (c) LEAVE: spends days from the ONE balance, answer recorded ---
const bal0 = vacationBalance(S);
check('(c) Egypt entitlement 21 days (0y service)', bal0.entitlement === 21, `entitlement=${bal0.entitlement} left=${bal0.left}`);
job.performance = 90; if (boss) boss.rel.respect = 90;
let leaveRes = null;
for (let i = 0; i < 5 && !(leaveRes && leaveRes.ok); i++) leaveRes = requestLeave(S, 'vacation5');
const bal1 = vacationBalance(S);
const log0 = ensureJobActionState(S).leaveLog[0];
check('(c) 5 days approved: used 0->5, left 21->16, log says approved', leaveRes?.ok && bal1.used === 5 && bal1.left === 16 && log0?.approved === true && /Approved by/.test(log0?.reason || ''), `res=${leaveRes?.msg} used=${bal1.used} left=${bal1.left} log=${JSON.stringify(log0)}`);
check('(c) contract balance agrees (same store)', S.career.job.leave.usedDays === 5 && S.career.job.leave.annualDays === 21, `job.leave=${JSON.stringify(S.career.job.leave)}`);

// --- (d) PROMOTION: ineligible sees what's missing; eligible gets a scene ---
job.performance = 50; job.monthsInRole = 2; S.career.trackExperience.medicine = 0;
const inelig = promotionEligibility(S);
const ineligRes = applyPromotion(S);
check('(d) ineligible: missing list names experience + performance', !inelig.eligible && !ineligRes.ok && /experience/.test(ineligRes.msg) && /performance/.test(ineligRes.msg), ineligRes.msg);
const track = getMergedCareerTracks(S.year).medicine;
const nextRung = track.rungs[job.level + 1];
job.performance = 88; job.monthsInRole = 12;
S.career.trackExperience.medicine = nextRung.minExp;
if (boss) boss.rel.respect = 90;
const elig = promotionEligibility(S);
check('(d) eligible when every requirement met', elig.eligible && elig.nextRung.title === nextRung.title, `next=${elig.nextRung?.title} missing=${elig.missing.join(';')}`);
const promRes = applyPromotion(S);
check('(d) apply queues a real interview scene', promRes.ok && S.activeScene?.title?.includes('Promotion interview'), `scene=${S.activeScene?.title}`);
const sceneTitle = S.activeScene?.title;
const beforeTitle = job.title;
resolveActiveSceneChoice(S, 0);
check('(d) interview resolves to a recorded outcome', S.journal[0]?.text?.includes(nextRung.title) || S.journal[0]?.text?.includes('Promoted') || S.journal[0]?.text?.includes('Passed over'), `journal: ${S.journal[0]?.text?.slice(0, 120)}`);
out.push(`INFO (d) interview outcome: title ${beforeTitle} -> ${job.title}; promotion record=${JSON.stringify(ensureJobActionState(S).promotion)}`);

// --- People at work: records move ---
const bossRespect0 = boss.rel.respect, bossAff0 = boss.rel.affection;
const pr = peopleAtWork(S, 'praise', boss.id);
check('(8) praising the boss moves their People record', pr.ok && boss.rel.affection === bossAff0 + 5 && boss.rel.respect === bossRespect0 + 3, `aff ${bossAff0}->${boss.rel.affection} resp ${bossRespect0}->${boss.rel.respect}`);

// --- Take on work: recorded on the job ---
const stepped0 = ensureJobActionState(S).steppedUp.length;
const tw = takeOnWork(S, 'project');
check('(2) taking on a project is recorded', tw.ok && ensureJobActionState(S).steppedUp.length === stepped0 + 1, tw.msg);

// --- Ask for more: bonus with a reason path (run once; either outcome must name a reason) ---
const askRes = askForMore(S, 'bonus');
check('(4) bonus ask returns a clear yes/no', typeof askRes.msg === 'string' && askRes.msg.length > 5, askRes.msg);

// --- Security: warnings -> dismissal with country-law severance ---
const S2 = createNewLifeState({ seed: 99, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
while (S2.player.age < 22) advanceSingleTurn(S2);
S2.player.vitals.smarts = 90; S2.skills.charisma = 80;
for (let t = 0; t < 8 && !S2.career.employed; t++) { const js = listAvailableJobs(S2).filter(j => j.qualifiedByDegree && !j.missingBoard); if (js.length) applyForJob(S2, js[0]); }
const j2 = S2.career.job; j2.monthsInRole = 24; j2.performance = 30;
const st2 = ensureJobActionState(S2); st2.warnings = 2; st2.lowPerfMonths = 2;
S2.money.cash = 100000;
const cash2 = S2.money.cash;
tickCareerMonthly(S2); tickCareerActionsMonthly(S2);
const expectedSev = Math.round(j2.monthlyGross * 4); // Egypt: 2 months/yr x 2 yrs
check('(9) 3rd warning dismisses with Egypt severance 4 months pay', !S2.career.employed && S2.money.cash === cash2 + expectedSev, `employed=${S2.career.employed} cash ${cash2}->${S2.money.cash} expectedSev=${expectedSev} ref=${JSON.stringify(S2.career.lastReference)}`);

// --- Resign with notice: served, then completes through the real resign ---
const S3 = createNewLifeState({ seed: 7, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
while (S3.player.age < 22) advanceSingleTurn(S3);
S3.player.vitals.smarts = 90; S3.skills.charisma = 80;
for (let t = 0; t < 8 && !S3.career.employed; t++) { const js = listAvailableJobs(S3).filter(j => j.qualifiedByDegree && !j.missingBoard); if (js.length) applyForJob(S3, js[0]); }
S3.career.job.performance = 80;
const rr = requestResign(S3);
const noticeMonths = ensureJobActionState(S3).noticeServing?.months;
check('(9) resign starts a notice period (Egypt 2 months)', rr.ok && noticeMonths === 2, rr.msg);
S3.turn = ensureJobActionState(S3).noticeServing.untilTurn;
tickCareerActionsMonthly(S3);
check('(9) notice completes: job ends, reference recorded', !S3.career.employed && !!S3.career.lastReference, `ref=${JSON.stringify(S3.career.lastReference)}`);

// --- Review scene fires at the 12-month mark ---
const S4 = createNewLifeState({ seed: 55, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
while (S4.player.age < 22) advanceSingleTurn(S4);
S4.player.vitals.smarts = 90; S4.skills.charisma = 80;
for (let t = 0; t < 8 && !S4.career.employed; t++) { const js = listAvailableJobs(S4).filter(j => j.qualifiedByDegree && !j.missingBoard); if (js.length) applyForJob(S4, js[0]); }
S4.career.job.monthsInRole = 11; S4.career.job.performance = 70;
tickCareerMonthly(S4); tickCareerActionsMonthly(S4);
check('(10) yearly review is a real scene at month 12', S4.activeScene?.title?.includes('annual review') || (S4.sceneQueue || []).some(s => s.title?.includes('annual review')), `active=${S4.activeScene?.title} queue=${(S4.sceneQueue || []).map(s => s.title).join('|')}`);

// --- Career tab renders the new actions, no flat +15% text ---
const html = renderWorkTabHtml(S, { workSub: 'jobs' });
check('(ui) Career tab shows the new action set', html.includes('Take 5 Days') && html.includes('Ask for a Reference') && html.includes('Resign (Serve') && html.includes('Train &amp; licences') && html.includes('Step up'), 'buttons present');
check('(ui) flat +15% overtime text is gone', !html.includes('+15% Pay'), 'no +15%');
check('(ui) previews state costs before committing', html.includes('Your pace') && html.includes('Needs your manager'), 'preview text present');

console.log(out.join('\n'));
