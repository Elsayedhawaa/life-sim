/* ============================================================================
   World Life 2.0 — v2.15 Worker 2: Career — a market, not a ladder.
   The payslip is real (v2.8). The market around it is built here:
   - Headhunters: a good performer is approached by a named recruiter
     with a named company and a real offer — salary through the same
     computePayslip, and a real trade-off (a demanding boss, a
     non-compete, a move to another city). Accept, decline, or use the
     offer to negotiate with the current employer (a real negotiation
     with a real outcome).
   - Performance dashboard: the three views of your work — what the
     boss thinks, what the team thinks, what the numbers say — drawn
     from the real records, with what would move each part.
   - Pension: auto-enrolment under the country's own rule, a real pot
     that grows in the monthly settlement, paid at retirement as a
     monthly top-up on top of the state pension. Opting out (UK / USA
     only) is a real decision with a real consequence.
   - Mentors and rivals: a senior colleague who can become a mentor
     (advice, an introduction, a real boost to promotion) or a rival
     for the same promotion (collaborate, compete, or undermine — each
     with a real consequence for the relationship and the career).
   One-directional imports only: this file reads careerEducationEngine,
   careerActions, soulEngine and the data files — none of them import
   it. The retirement payout is wired in main.js (the only live caller
   of retireFromCareer) and the monthly tick is called from gameLoop.
   RNG: this system has its OWN seeded stream (S.careerMarketRng,
   derived from the life seed exactly like v2.10's npcRng), so a new
   system never shifts the game's main stream: every seeded roll
   downstream lands exactly where it did before this round.
   ========================================================================== */

import { randInt, clamp, hashSeed } from '../core/rng.js';
import { recordJournal, walletMove, ensureExtendedState, createPerson } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { computeMonthlyNetPay, pensionShareFor, EMPLOYER_PENSION_PCT } from '../data/economy.js';
import { getEmployersFor } from '../data/institutions.js';
import {
  PENSION_SCHEMES,
  PENSION_PAYOUT_MONTHS,
  PENSION_GROWTH_ANNUAL,
  HEADHUNTER_MONTHLY_CHANCE,
  HEADHUNTER_MENTORED_MULT,
  HEADHUNTER_OFFER_MONTHS,
  HEADHUNTER_APPROACH_COOLDOWN_TURNS,
  MENTOR_PROMOTION_BONUS,
  MENTOR_AUTO_PROMOTION_BOOST,
  RIVAL_AHEAD_PENALTY,
  RIVAL_BEHIND_BONUS
} from '../data/careerMarketData.js';
import {
  listAvailableJobs,
  getLadderForJob,
  getPerformanceParts,
  getJobContract,
  resignCurrentJob,
  canLegallyWorkInCurrentCountry,
  hireIntoJob
} from './careerEducationEngine.js';
import { colleaguesOf, bossOf, ensureJobActionState } from './careerActions.js';
import { rememberDeed } from './soulEngine.js';
import { crisisInfo, CRISIS_HEADHUNTER_MULT } from './careerConsequences.js';

/* The pay freeze lives on the job record (payFrozenUntilYear, set by
   careerConsequences when a crisis year is warned about). Read the
   field directly here — importing moneyTruth would cycle through
   economyEngine, which imports this file. */
function payFrozenHere(S) {
  const job = S?.career?.job;
  return !!job && (Number(job.payFrozenUntilYear) || 0) >= (Number(S.year) || 0);
}

/* ------------------------------------------------------------------ */
/* The career-market RNG stream (see header).                          */
/* ------------------------------------------------------------------ */

function cmRand(S) {
  if (typeof S.careerMarketRng !== 'number') {
    S.careerMarketRng = hashSeed(String(S.seed ?? 'world-life-2') + ':career-market');
  }
  let t = (S.careerMarketRng = (S.careerMarketRng + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function cmChance(S, p) { return cmRand(S) < p; }
function cmRandInt(S, min, max) {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return lo + Math.floor(cmRand(S) * (hi - lo + 1));
}
function cmPick(S, list) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.floor(cmRand(S) * list.length)];
}
/* Create a person using ONLY the market stream: createPerson draws names,
   traits and vitals from the state it is handed, and takes its ids from
   S.seq — so hand it a stand-in carrying the market stream and write back
   the advanced stream and id counter. The main stream never moves. */
function cmCreatePerson(S, opts = {}) {
  const standIn = { ...S, rngState: (typeof S.careerMarketRng === 'number' ? S.careerMarketRng : hashSeed(String(S.seed ?? 'world-life-2') + ':career-market')) };
  const person = createPerson(standIn, opts);
  S.careerMarketRng = standIn.rngState;
  S.seq = standIn.seq;
  return person;
}

/* ------------------------------------------------------------------ */
/* State — lazy, so saves made before v2.15 keep working.             */
/* ------------------------------------------------------------------ */

export function ensureCareerMarket(S) {
  ensureExtendedState(S);
  if (!S.career) S.career = {};
  if (!S.career.market) {
    S.career.market = {
      pension: null,      // created on the first employed month
      offer: null,        // open headhunter offer, or null
      mentor: null,       // { personId, sinceYear, adviceTurn, introTurn, introductions }
      rival: null,        // { personId, performance, stance, sinceYear }
      lastApproachTurn: null,
      nonCompete: null,   // { employer, untilYear }
      rivalCooldownTurn: 0
    };
  }
  const m = S.career.market;
  if (m.lastApproachTurn === undefined) m.lastApproachTurn = null;
  if (m.rivalCooldownTurn === undefined) m.rivalCooldownTurn = 0;
  return m;
}

export function ensurePension(S) {
  const m = ensureCareerMarket(S);
  if (!m.pension) {
    m.pension = {
      enrolled: true,
      optedOut: false,
      optedOutYear: null,
      pot: 0,
      employeeTotal: 0,
      employerTotal: 0,
      growthTotal: 0,
      monthsContributed: 0,
      history: [],        // { year, month, employee, employer, growth, pot, kind }
      paidOut: null,      // { pot, monthlyTopUp, year, month } once retired
      lastMonth: null
    };
  }
  return m.pension;
}

function trimPensionHistory(pen) {
  if (pen.history.length > 24) pen.history = pen.history.slice(-24);
}

/* ------------------------------------------------------------------ */
/* Pension                                                             */
/* ------------------------------------------------------------------ */

/* The month's pension money from a payslip on the pay that actually
   landed (gross AFTER any world-event pay move, so the pot never
   records money that was not paid). The employee part is the payslip's
   own pension line — the same derivation computePayslip uses (gross −
   income tax − net, × the country's pension share), so in a quiet month
   the pot's employee part IS the payslip line, exactly. The employer
   part is the payslip's employer top-up (UK 3%, Australia 12%).
   USA adds a real 401(k) on top: 6% of gross out of the player's cash
   (cashOut — it really leaves the account in the settlement) with a 3%
   employer match. voluntaryEmployee / voluntaryEmployer is the part an
   opt-out stops: the whole thing in the UK, the 401(k) only in the USA
   (Social Security keeps going in — the law says so). */
export function pensionSlipFor(gross, countryId, year, isCit) {
  const g = Math.max(0, Math.round(Number(gross) || 0));
  const pay = computeMonthlyNetPay(g, countryId, year, isCit);
  const net = Math.round(pay.net);
  const incomeTax = Math.round(pay.incomeTax);
  const socialSecurity = Math.max(0, g - incomeTax - net);
  const share = pensionShareFor(countryId, isCit);
  const pensionContribution = Math.round(socialSecurity * share.share);
  const employerPension = Math.round(g * (EMPLOYER_PENSION_PCT[countryId] || 0));
  let employee = pensionContribution;
  let employer = employerPension;
  let cashOut = 0;
  let voluntaryEmployee = 0;
  let voluntaryEmployer = 0;
  if (countryId === 'usa') {
    const k401 = Math.round(g * 0.06);
    const match = Math.round(g * 0.03);
    employee += k401;
    employer += match;
    cashOut = k401;
    voluntaryEmployee = k401;
    voluntaryEmployer = match;
  } else if (countryId === 'gbr') {
    voluntaryEmployee = pensionContribution;
    voluntaryEmployer = employerPension;
  }
  return {
    gross: g,
    employee,
    employer,
    cashOut,
    voluntaryEmployee,
    voluntaryEmployer,
    pensionContribution,
    employerPension
  };
}

/* What this month's pension looks like on the standard (unadjusted)
   payslip — what the Career tab shows. In a quiet month it is exactly
   what the settlement accrues; in a month a world event moves pay, the
   settlement accrues on the pay that actually landed instead. */
export function pensionMonthPreview(S) {
  const job = S?.career?.job;
  const pen = ensurePension(S);
  const scheme = PENSION_SCHEMES[S.country] || PENSION_SCHEMES.usa;
  if (!job) return { scheme, pen, employee: 0, employer: 0, cashOut: 0, monthlyTopUp: Math.round(pen.pot / PENSION_PAYOUT_MONTHS) };
  const isCit = S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident';
  const amounts = pensionSlipFor(job.monthlyGross, S.country, S.year, isCit);
  return {
    scheme,
    pen,
    employee: pen.optedOut ? amounts.employee - amounts.voluntaryEmployee : amounts.employee,
    employer: pen.optedOut ? amounts.employer - amounts.voluntaryEmployer : amounts.employer,
    cashOut: pen.optedOut ? 0 : amounts.cashOut,
    monthlyTopUp: Math.round(pen.pot / PENSION_PAYOUT_MONTHS)
  };
}

/* The settlement calls this once a month, after the salary has landed
   (economyEngine §1 hands it the amounts for the pay that actually
   arrived). The employee part is money already deducted from pay and
   the employer part is the employer's money — neither moves cash here.
   The USA 401(k) employee part IS real cash out of the account, so it
   moves with its own ledger line, here. Opting out stops the voluntary
   part only; investment growth is applied by the monthly tick. */
export function accruePensionMonth(S, amounts) {
  const job = S?.career?.job;
  if (!job || !amounts) return { ok: false, employee: 0, employer: 0 };
  const pen = ensurePension(S);
  let employee = Math.max(0, Math.round(amounts.employee || 0));
  let employer = Math.max(0, Math.round(amounts.employer || 0));
  let cashOut = Math.max(0, Math.round(amounts.cashOut || 0));
  if (pen.optedOut) {
    employee = Math.max(0, employee - Math.round(amounts.voluntaryEmployee || 0));
    employer = Math.max(0, employer - Math.round(amounts.voluntaryEmployer || 0));
    cashOut = 0;
  }
  pen.pot += employee + employer;
  pen.employeeTotal += employee;
  pen.employerTotal += employer;
  if (employee > 0 || employer > 0) pen.monthsContributed += 1;
  /* A month with nothing in (opted out, or an expat with no pension
     here) leaves no history line — the pot's growth is recorded by the
     monthly tick instead. */
  if (employee > 0 || employer > 0) {
    pen.history.push({ year: S.year, month: S.month, employee, employer, growth: 0, pot: pen.pot, kind: 'contribution' });
    trimPensionHistory(pen);
  }
  pen.lastMonth = { year: S.year, month: S.month, employee, employer, pot: pen.pot };
  if (cashOut > 0) {
    walletMove(S, -cashOut, `401(k) contribution — you ${formatMoney(cashOut, S.country)}, employer matched ${formatMoney(Math.round(amounts.voluntaryEmployer || 0), S.country)} (pension pot now ${formatMoney(pen.pot, S.country)})`, 'monthly_settlement');
  }
  return { ok: true, employee, employer, pot: pen.pot };
}

/* Investment growth on the pot, applied by the monthly tick (every
   month, employed or not — the money stays invested). Kept as its own
   running total, so the pot always equals employee + employer + growth:
   contributions in = pot out, no invented money. */
export function applyPensionGrowth(S) {
  const pen = ensurePension(S);
  if ((pen.pot || 0) <= 0) return 0;
  const growth = Math.round(pen.pot * (PENSION_GROWTH_ANNUAL / 12));
  if (growth <= 0) return 0;
  pen.pot += growth;
  pen.growthTotal += growth;
  pen.history.push({ year: S.year, month: S.month, employee: 0, employer: 0, growth, pot: pen.pot, kind: 'growth' });
  trimPensionHistory(pen);
  return growth;
}

export function optOutPension(S) {
  const job = S?.career?.job;
  if (!job) return { ok: false, msg: 'You are not employed — there is no pension to opt out of.' };
  const scheme = PENSION_SCHEMES[S.country] || PENSION_SCHEMES.usa;
  if (!scheme.canOptOut) {
    return { ok: false, msg: `${scheme.scheme} is part of your social insurance — the law does not let you opt out.` };
  }
  const pen = ensurePension(S);
  if (pen.optedOut) return { ok: false, msg: 'You have already opted out.' };
  const preview = pensionMonthPreview(S);
  pen.optedOut = true;
  pen.enrolled = false;
  pen.optedOutYear = S.year;
  recordJournal(
    S,
    S.country === 'usa'
      ? `You opted out of the 401(k). You keep ${formatMoney(preview.cashOut, S.country)}/month in your pocket, your employer stops matching, and your Social Security share still goes into your pot. The ${formatMoney(pen.pot, S.country)} already in your pot stays yours.`
      : `You opted out of the workplace pension. Your employer stops paying ${formatMoney(preview.employer, S.country)}/month into your pot and you stop paying ${formatMoney(preview.employee, S.country)}/month. The ${formatMoney(pen.pot, S.country)} already in your pot stays yours.`,
    'money'
  );
  return {
    ok: true,
    msg: S.country === 'usa'
      ? `Opted out of the 401(k) — you keep the 6% in your pocket, your employer stops matching 3%, and your Social Security share still goes in. What is already in your pot stays yours.`
      : `Opted out — your employer stops paying ${formatMoney(preview.employer, S.country)}/month and you stop paying ${formatMoney(preview.employee, S.country)}/month. What is already in your pot stays yours, and it keeps earning investment growth.`
  };
}

export function optInPension(S) {
  const job = S?.career?.job;
  if (!job) return { ok: false, msg: 'You are not employed — there is no pension to opt into.' };
  const pen = ensurePension(S);
  if (!pen.optedOut) return { ok: false, msg: 'You are already enrolled.' };
  pen.optedOut = false;
  pen.enrolled = true;
  pen.optedOutYear = null;
  recordJournal(S, `You opted back into the pension — contributions from you and your employer start again next month.`, 'money');
  return { ok: true, msg: 'Opted back in — contributions from you and your employer start again next month.' };
}

/* The pot pays out at retirement: it becomes a monthly top-up on top of
   the state pension (pot / 240 months), and the pot is spent — the
   record of what it was stays on the pension record. Called from
   main.js right after retireFromCareer (the only live retirement path),
   so the top-up lands on the same monthlyPension the settlement pays. */
export function payOutPensionPot(S) {
  const pen = S?.career?.market?.pension;
  if (!pen || (pen.pot || 0) <= 0) return { monthlyTopUp: 0, pot: 0 };
  const pot = pen.pot;
  const monthlyTopUp = Math.max(1, Math.round(pot / PENSION_PAYOUT_MONTHS));
  pen.paidOut = { pot, monthlyTopUp, year: S.year, month: S.month };
  pen.pot = 0;
  recordJournal(S, `Your pension pot of ${formatMoney(pot, S.country)} now pays you ${formatMoney(monthlyTopUp, S.country)} a month on top of your state pension, for as long as you live.`, 'money');
  return { monthlyTopUp, pot };
}

/* ------------------------------------------------------------------ */
/* Performance dashboard                                               */
/* ------------------------------------------------------------------ */

/* The deterministic parts of the promotion-interview score — the same
   arithmetic decidePromotion uses in careerActions.js (the anchor there
   adds the mentor bonus and the rival term to the same sum). No RNG:
   the panel's mood (0–20) is shown as a range, so rendering the
   dashboard never moves the game's RNG. */
export function promotionScoreParts(S) {
  const job = S?.career?.job;
  if (!job) return null;
  const st = ensureJobActionState(S);
  const boss = bossOf(S);
  const m = S.career.market;
  const mentorBonus = m?.mentor ? MENTOR_PROMOTION_BONUS : 0;
  const rivalTerm = rivalPromotionTerm(S);
  const refBonus = st.reference ? Math.min(10, st.reference.strength / 10) : 0;
  const performance = job.performance ?? 65;
  const bossRespect = boss ? boss.rel.respect : 60;
  const steppedUpBonus = (st.steppedUp?.length || 0) * 3;
  const base = performance + bossRespect + steppedUpBonus + refBonus + mentorBonus + rivalTerm;
  return {
    performance: Math.round(performance),
    bossRespect: Math.round(bossRespect),
    steppedUp: st.steppedUp?.length || 0,
    steppedUpBonus,
    refBonus: Math.round(refBonus),
    mentorBonus,
    rivalTerm,
    base,
    min: Math.round(base),
    max: Math.round(base + 20),
    threshold: 150
  };
}

/* The full interview score WITH the panel's mood roll — for tests on a
   cloned state only. Never call this on the live state during render:
   it consumes the main RNG exactly like decidePromotion does. */
export function promotionInterviewScore(S) {
  const parts = promotionScoreParts(S);
  if (!parts) return null;
  const mood = randInt(S, 0, 20);
  return { ...parts, mood, score: parts.base + mood };
}

export function rivalPromotionTerm(S) {
  const r = S?.career?.market?.rival;
  const job = S?.career?.job;
  if (!r || !job) return 0;
  return (r.performance ?? 0) > (job.performance ?? 0) ? RIVAL_AHEAD_PENALTY : RIVAL_BEHIND_BONUS;
}

/* The dashboard: three views of your work, each drawn from the real
   records, each with the one thing that would move it most. */
export function getPerformanceDashboard(S) {
  const job = S?.career?.job;
  if (!job) return null;
  getJobContract(S);
  const parts = getPerformanceParts(S);
  const st = ensureJobActionState(S);
  const boss = bossOf(S);
  const colleagues = colleaguesOf(S);
  const teamAvg = colleagues.length
    ? Math.round(colleagues.reduce((s, p) => s + ((p.rel.affection + p.rel.respect + p.rel.trust) / 3), 0) / colleagues.length)
    : null;
  const steppedUp = st.steppedUp || [];
  const training = st.training || [];

  const bossValue = parts.managerView;
  /* v2.18 purge — with no manager the value line above already says
     "no manager on record"; the lever restated the same absence, so
     it is empty and the render skips it. */
  const bossLever = !boss
    ? ''
    : boss.rel.respect < 60
    ? `${boss.firstName}'s respect for you is ${Math.round(boss.rel.respect)}% — deliver a hard assignment (+5 respect) or praise them, and do not argue with them.`
    : boss.rel.respect < 75
    ? `${boss.firstName} rates you well enough. A hard assignment delivered (+5 respect) or a project taken on (+3) would push it higher.`
    : `${boss.firstName} rates you highly — keep delivering and the next rung is a conversation, not a fight.`;

  const teamValue = teamAvg;
  const teamLever = teamAvg == null
    ? 'No colleagues on record yet — nobody at work knows you well enough to rate you.'
    : teamAvg < 60
    ? `The team rates working with you at ${teamAvg}% — cover someone's shift (+8 trust) or mentor a junior, and they will notice.`
    : `The team thinks well of you (${teamAvg}%). Keep helping when asked and it stays that way.`;

  const numbersValue = Math.round((parts.quality + parts.attendance) / 2);
  const numbersLever = job.workMode === 'coast'
    ? 'You are coasting — quality falls 1.2% a month. Switch your pace to Normal or Overtime and it climbs again.'
    : job.workMode === 'overtime'
    ? 'Overtime is lifting your quality 1.5% a month — at +3 stress a month. A course (+3 performance) would lift it faster.'
    : `Steady routine lifts quality 0.4% a month. A course (+3 performance) or overtime (+1.5% a month) would lift it faster — you have done ${training.length} course(s) so far.`;

  return {
    overall: parts.overall,
    bossView: { value: bossValue, boss: boss ? { name: boss.fullName, affection: Math.round(boss.rel.affection), respect: Math.round(boss.rel.respect), trust: Math.round(boss.rel.trust) } : null, lever: bossLever },
    teamView: { value: teamValue, colleagueCount: colleagues.length, lever: teamLever },
    numbers: { value: numbersValue, quality: parts.quality, attendance: parts.attendance, lever: numbersLever },
    record: { steppedUp: steppedUp.length, training: training.length, workMode: job.workMode },
    promo: promotionScoreParts(S)
  };
}

/* ------------------------------------------------------------------ */
/* Headhunters                                                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Headhunters — the approach rate, as one readable number.            */
/* ------------------------------------------------------------------ */

/* Visible achievements in the job (S.career.workAchievements — an
   array of { id, label, year, month, trackId }, written by the real
   work system). A headhunter call follows real work: each achievement
   is worth +2 percentage points on the approach rate, capped at +10. */
export function workAchievements(S) {
  const list = Array.isArray(S?.career?.workAchievements) ? S.career.workAchievements : [];
  return list
    .filter((a) => a && typeof a.label === 'string' && a.label.trim())
    .sort((a, b) => ((Number(a.year) || 0) * 12 + (Number(a.month) || 0)) - ((Number(b.year) || 0) * 12 + (Number(b.month) || 0)));
}

export function latestWorkAchievement(S) {
  const list = workAchievements(S);
  return list.length ? list[list.length - 1] : null;
}

export function achievementHeadhunterBonus(S) {
  return Math.min(0.10, 0.02 * workAchievements(S).length);
}

/* The monthly chance a headhunter calls, before the roll. Base 8%;
   a mentor doubles it; a crisis year multiplies it down (×0.4 —
   nobody is hiring while the crisis lasts); each visible achievement
   adds 2 points, capped at +10. opts.chance overrides the base (a
   mentor's introduction rolls at 35%) but the crisis multiplier and
   the achievement bonus still apply — a crisis damps even a warm
   introduction. Capped at 90%: a call is never certain. */
export function headhunterApproachRate(S, opts = {}) {
  const m = ensureCareerMarket(S);
  let p = opts.chance ?? HEADHUNTER_MONTHLY_CHANCE;
  if (!opts.chance && m.mentor) p *= HEADHUNTER_MENTORED_MULT;
  if (crisisInfo(S).crisis) p *= CRISIS_HEADHUNTER_MULT;
  p += achievementHeadhunterBonus(S);
  return Math.min(0.9, Math.max(0, p));
}

export function headhunterEligible(S) {
  const job = S?.career?.job;
  if (!S.career.employed || !job) return { ok: false, reason: 'You are not employed.' };
  if ((job.performance ?? 0) < 75) return { ok: false, reason: `your performance is ${Math.round(job.performance ?? 0)}% — headhunters call at 75% and above` };
  if ((job.monthsInRole || 0) < 6) return { ok: false, reason: `you have only ${job.monthsInRole || 0} months in this role — headhunters want 6+` };
  const m = ensureCareerMarket(S);
  if (m.offer) return { ok: false, reason: 'an offer is already open' };
  const st = ensureJobActionState(S);
  if (st.warnings >= 2) return { ok: false, reason: 'you are on a performance plan' };
  if (m.lastApproachTurn != null && S.turn - m.lastApproachTurn < HEADHUNTER_APPROACH_COOLDOWN_TURNS) {
    return { ok: false, reason: 'a recruiter only just called — they will not call again so soon' };
  }
  const auth = canLegallyWorkInCurrentCountry(S);
  if (!auth.allowed || auth.partTimeOnly) return { ok: false, reason: 'your work authorisation does not cover a full-time move right now' };
  return { ok: true };
}

function buildHeadhunterOffer(S) {
  const job = S.career.job;
  const market = listAvailableJobs(S);
  const sameTrack = market.find(j => j.track === job.track);
  /* A real named employer in this track, not the one you work for. */
  const pool = getEmployersFor(S.country, job.track).filter(n => n && n !== job.employer);
  let employer = pool.length ? cmPick(S, pool) : null;
  if (!employer && sameTrack && sameTrack.employer !== job.employer) employer = sameTrack.employer;
  if (!employer) return null;
  const ladder = getLadderForJob(S);
  const nextRung = ladder?.next || null;
  const title = nextRung ? nextRung.title : job.title;
  const level = nextRung ? nextRung.level : job.level;
  const baseGross = sameTrack ? sameTrack.monthlyGross : job.monthlyGross;
  const monthlyGross = Math.round(baseGross * (1.12 + cmRand(S) * 0.18));
  if (monthlyGross <= job.monthlyGross) return null;

  const recruiter = cmCreatePerson(S, {
    role: 'recruiter',
    relationLabel: `Recruiter — ${employer}`,
    residenceCountry: S.country,
    city: S.city,
    jobTitle: 'Recruiter',
    employer,
    track: job.track,
    monthlyIncomeLocal: Math.round(monthlyGross * 0.9),
    affection: 55,
    respect: 55,
    trust: 55
  });
  S.people[recruiter.id] = recruiter;

  const tradeoffs = [];
  if (cmChance(S, 0.55)) {
    tradeoffs.push({
      kind: 'demanding_boss',
      text: 'The manager there is demanding — people who work for them say respect has to be earned, and the first months are hard.'
    });
  }
  if (cmChance(S, 0.5)) {
    tradeoffs.push({
      kind: 'non_compete',
      text: `You would sign a non-compete: no going back to ${job.employer} for 2 years.`
    });
  }
  const cities = (getCountry(S.country).cities || []).filter(c => c !== S.city);
  let moveCity = null;
  if (cities.length && cmChance(S, 0.45)) {
    moveCity = cmPick(S, cities);
    tradeoffs.push({ kind: 'move_city', city: moveCity, text: `The job is in ${moveCity}, not ${S.city} — you would need to move there.` });
  }
  if (!tradeoffs.length) {
    tradeoffs.push({
      kind: 'demanding_boss',
      text: 'The manager there is demanding — people who work for them say respect has to be earned, and the first months are hard.'
    });
  }
  /* v2.18 W2 — the offer names the visible achievement that brought
     the call: a headhunter follows real work, and the player sees
     which piece of work did it. */
  const latest = latestWorkAchievement(S);
  return {
    recruiterId: recruiter.id,
    recruiterName: recruiter.fullName,
    employer,
    title,
    track: job.track,
    level,
    monthlyGross,
    city: moveCity || S.city,
    tradeoffs,
    hasNonCompete: tradeoffs.some(t => t.kind === 'non_compete'),
    bossQuality: tradeoffs.some(t => t.kind === 'demanding_boss') ? 'demanding' : 'fair',
    offeredYear: S.year,
    offeredMonth: S.month,
    expiresTurn: S.turn + HEADHUNTER_OFFER_MONTHS,
    status: 'open',
    achievementId: latest ? (latest.id || null) : null,
    achievementLabel: latest ? latest.label : null
  };
}

/* The monthly approach roll. opts.chance overrides the base rate (a
   mentor's introduction rolls at 35%); opts.force forces an approach
   (tests); opts.ignorePerformance lets a mentor's word open a door
   your performance alone would not. */
export function maybeHeadhunterApproach(S, opts = {}) {
  const m = ensureCareerMarket(S);
  if (!opts.ignorePerformance) {
    const elig = headhunterEligible(S);
    if (!elig.ok) return { ok: false, msg: elig.reason };
  } else {
    const job = S?.career?.job;
    if (!S.career.employed || !job) return { ok: false, msg: 'You are not employed.' };
    if (m.offer) return { ok: false, msg: 'An offer is already open.' };
    if ((job.monthsInRole || 0) < 6) return { ok: false, msg: 'You have less than 6 months in this role.' };
  }
  let p = headhunterApproachRate(S, opts);
  if (opts.force) p = 1;
  if (!cmChance(S, p)) return { ok: false, msg: 'No recruiter called this month.' };
  const offer = buildHeadhunterOffer(S);
  if (!offer) return { ok: false, msg: 'No better job on the market right now.' };
  m.offer = offer;
  m.lastApproachTurn = S.turn;
  recordJournal(
    S,
    `${offer.recruiterName}, a recruiter, called about a ${offer.title} role at ${offer.employer} — ${formatMoney(offer.monthlyGross, S.country)}/month gross, against your ${formatMoney(S.career.job.monthlyGross, S.country)} now.${offer.achievementLabel ? ` They called because of your ${offer.achievementLabel}.` : ''} The offer is on your Career tab.`,
    'career'
  );
  return { ok: true, offer };
}

export function acceptHeadhunterOffer(S) {
  const m = ensureCareerMarket(S);
  const offer = m.offer;
  if (!offer || offer.status !== 'open') return { ok: false, msg: 'There is no open headhunter offer right now.' };
  const job = S.career.job;
  if (!job) return { ok: false, msg: 'You are not employed any more — the offer has lapsed.' };
  const auth = canLegallyWorkInCurrentCountry(S);
  if (!auth.allowed || auth.partTimeOnly) {
    return { ok: false, msg: 'Your work authorisation does not cover this move right now — the offer lapses.' };
  }
  const oldEmployer = job.employer;
  const oldGross = job.monthlyGross;
  const oldCity = S.city;
  const res = resignCurrentJob(S);
  if (!res.ok) return res;
  /* The one hire path (hireIntoJob) at the exact offered gross — the
     offer letter and the pay match, and a sponsored visa transfers
     through the grace window the resignation opened. */
  const hired = hireIntoJob(S, {
    employer: offer.employer,
    title: offer.title,
    track: offer.track,
    level: offer.level,
    monthlyGross: offer.monthlyGross,
    reqDegrees: [],
    qualifiedByDegree: true
  }, auth, { exactGross: offer.monthlyGross });
  if (!hired.ok) {
    m.offer = null;
    return { ok: false, msg: 'The move fell through after you resigned — the new employer withdrew. You are unemployed now.' };
  }
  if (offer.bossQuality === 'demanding') {
    const boss = bossOf(S);
    if (boss) {
      boss.rel.affection = 38;
      boss.rel.respect = 45;
      boss.rel.trust = 42;
      boss.traits.pride = Math.max(boss.traits.pride || 50, 78);
      boss.traits.warmth = Math.min(boss.traits.warmth || 50, 30);
      rememberDeed(S, boss, 'demanding_boss', 'Known as a demanding manager — respect has to be earned.', {});
    }
  }
  if (offer.city && offer.city !== oldCity) S.city = offer.city;
  if (offer.hasNonCompete) m.nonCompete = { employer: oldEmployer, untilYear: S.year + 2 };
  m.offer = null;
  recordJournal(
    S,
    `Accepted ${offer.recruiterName}'s offer: ${offer.title} at ${offer.employer}, ${formatMoney(offer.monthlyGross, S.country)}/month gross (was ${formatMoney(oldGross, S.country)} at ${oldEmployer}).${offer.city && offer.city !== oldCity ? ` You moved to ${offer.city} for the job.` : ''}${offer.hasNonCompete ? ` You signed a non-compete with ${oldEmployer} until ${S.year + 2}.` : ''}`,
    'career'
  );
  return { ok: true, msg: `Hired at ${offer.employer} — ${formatMoney(offer.monthlyGross, S.country)}/month gross.` };
}

export function declineHeadhunterOffer(S) {
  const m = ensureCareerMarket(S);
  const offer = m.offer;
  if (!offer || offer.status !== 'open') return { ok: false, msg: 'There is no open headhunter offer right now.' };
  m.offer = null;
  recordJournal(S, `Turned down ${offer.recruiterName}'s offer from ${offer.employer} — the money was better, but the trade-offs were not worth it.`, 'career');
  return { ok: true, msg: `Declined — ${offer.employer} will hire someone else.` };
}

/* Use the offer as leverage with the current employer. The offer is
   spent either way — you showed your hand. Score: performance and
   boss respect, +12 for a real offer in hand. 80+: they match most of
   the outside offer (90% of it, or an 8% raise, whichever is more).
   68–79: an 8% raise to stay. Below 68: they call your bluff — no
   raise, and your manager knows you were looking (respect −3). */
export function negotiateWithOffer(S) {
  const m = ensureCareerMarket(S);
  const offer = m.offer;
  const job = S?.career?.job;
  if (!offer || offer.status !== 'open') return { ok: false, msg: 'There is no open offer to negotiate with.' };
  if (!job) return { ok: false, msg: 'You are not employed any more — the offer has lapsed.' };
  const boss = bossOf(S);
  const bossRespect = boss ? boss.rel.respect : 60;
  const score = job.performance * 0.6 + bossRespect * 0.4 + 12;
  m.offer = null;
  /* v2.18 W2 — a frozen employer cannot match anything: pay is
     frozen while the crisis lasts, so negotiating with an outside
     offer gets a plain refusal, not a raise. The offer is spent
     either way — you showed your hand. */
  if (payFrozenHere(S)) {
    recordJournal(S, `You showed ${boss ? boss.firstName : 'management'} the ${offer.employer} offer, but pay is frozen while the crisis lasts — they cannot match it or raise you, however good the offer is. The offer is gone now.`, 'career');
    return { ok: false, msg: `Pay is frozen while the crisis lasts — they cannot match the ${offer.employer} offer, and the offer is spent.` };
  }
  if (score >= 80) {
    const matched = Math.round(offer.monthlyGross * 0.9);
    const raised = Math.round(job.monthlyGross * 1.08);
    const next = Math.max(matched, raised);
    const old = job.monthlyGross;
    job.monthlyGross = next;
    if (boss) boss.rel.respect = clamp(boss.rel.respect + 4);
    recordJournal(S, `You showed ${boss ? boss.firstName : 'management'} the ${offer.employer} offer — they matched most of it on the spot: ${formatMoney(old, S.country)} → ${formatMoney(next, S.country)}/month. You stayed.`, 'career');
    return { ok: true, msg: `Counter-offer accepted — your pay rises to ${formatMoney(next, S.country)}/month. You turned ${offer.employer} down.` };
  }
  if (score >= 68) {
    const old = job.monthlyGross;
    job.monthlyGross = Math.round(job.monthlyGross * 1.08);
    if (boss) boss.rel.respect = clamp(boss.rel.respect + 2);
    recordJournal(S, `You showed ${boss ? boss.firstName : 'management'} the ${offer.employer} offer. They would not match it, but they gave you an 8% raise to stay: ${formatMoney(old, S.country)} → ${formatMoney(job.monthlyGross, S.country)}/month.`, 'career');
    return { ok: true, msg: `They would not match ${offer.employer}, but they gave you an 8% raise to stay — now ${formatMoney(job.monthlyGross, S.country)}/month.` };
  }
  if (boss) {
    boss.rel.respect = clamp(boss.rel.respect - 3);
    boss.rel.resentment = clamp((boss.rel.resentment || 0) + 4);
  }
  recordJournal(S, `You showed ${boss ? boss.firstName : 'management'} the ${offer.employer} offer and they called your bluff — no raise, no match. The offer is gone now.`, 'career');
  return { ok: false, msg: `They refused to match it — and the ${offer.employer} offer is spent. Your manager knows you were looking (respect −3).` };
}

/* ------------------------------------------------------------------ */
/* Mentors                                                             */
/* ------------------------------------------------------------------ */

export function seniorColleagueCandidates(S) {
  return colleaguesOf(S).filter(p => p.age >= S.player.age + 5);
}

/* The workplace has more people than the one colleague record the hire
   spawns. If nobody senior is on record, a senior colleague you have
   worked with for years becomes a record — once, then they stay. */
export function ensureSeniorColleague(S) {
  const existing = seniorColleagueCandidates(S);
  if (existing.length) return existing[0];
  const job = S?.career?.job;
  if (!job) return null;
  const senior = cmCreatePerson(S, {
    age: S.player.age + cmRandInt(S, 8, 15),
    role: 'colleague',
    relationLabel: `Senior colleague at ${job.employer}`,
    residenceCountry: S.country,
    city: S.city,
    jobTitle: `Senior ${job.title}`,
    employer: job.employer,
    track: job.track,
    monthlyIncomeLocal: Math.round(job.monthlyGross * 1.6),
    affection: 58,
    respect: 60,
    trust: 58
  });
  S.people[senior.id] = senior;
  if (!S.relations.colleagueIds.includes(senior.id)) {
    S.relations.colleagueIds.unshift(senior.id);
    if (S.relations.colleagueIds.length > 4) S.relations.colleagueIds.length = 4;
  }
  return senior;
}

export function askMentor(S, personId) {
  const m = ensureCareerMarket(S);
  if (m.mentor) return { ok: false, msg: 'You already have a mentor.' };
  const person = personId ? S.people[personId] : null;
  if (!person || !person.alive) return { ok: false, msg: 'That person is not at work any more.' };
  if (person.role !== 'colleague') return { ok: false, msg: 'That person does not work with you.' };
  if (person.age < S.player.age + 5) {
    return { ok: false, msg: `${person.firstName} is not senior enough to mentor you — find someone at least 5 years older.` };
  }
  const missing = [];
  if (person.rel.respect < 60) missing.push(`their respect for you is ${Math.round(person.rel.respect)}% (needs 60%)`);
  if (person.rel.trust < 55) missing.push(`their trust in you is ${Math.round(person.rel.trust)}% (needs 55%)`);
  if (missing.length) {
    return { ok: false, msg: `${person.firstName} will not mentor you yet — ${missing.join(' and ')}. Build the relationship first (praise them, help them, ask for their help).` };
  }
  m.mentor = { personId: person.id, sinceYear: S.year, adviceTurn: 0, introTurn: 0, introductions: 0 };
  rememberDeed(S, person, 'mentor', 'You asked them to mentor you, and they agreed.', { affection: 6, respect: 4, trust: 5 });
  recordJournal(S, `${person.fullName} agreed to mentor you — a senior colleague who has seen how this company really works.`, 'career');
  return { ok: true, msg: `${person.firstName} is your mentor now — ask them for advice, or for an introduction.` };
}

export function askMentorAdvice(S) {
  const m = ensureCareerMarket(S);
  if (!m.mentor) return { ok: false, msg: 'You have no mentor — ask a senior colleague first.' };
  const mentor = S.people[m.mentor.personId];
  if (!mentor || !mentor.alive) {
    m.mentor = null;
    return { ok: false, msg: 'Your mentor is no longer at work.' };
  }
  if (m.mentor.adviceTurn && S.turn - m.mentor.adviceTurn < 3) {
    return { ok: false, msg: 'You asked for advice only recently — give it a few months.' };
  }
  const dash = getPerformanceDashboard(S);
  if (!dash) return { ok: false, msg: 'You are not employed.' };
  const job = S.career.job;
  const parts = [
    { key: 'boss', value: dash.bossView.value, part: 'managerView' },
    { key: 'team', value: dash.teamView.value ?? 60, part: 'teamwork' },
    { key: 'numbers', value: dash.numbers.value, part: 'quality' }
  ];
  const weakest = parts.reduce((a, b) => (b.value < a.value ? b : a));
  const adviceText = {
    boss: `${mentor.firstName} says: your manager's view of you is ${Math.round(dash.bossView.value)}% — the weakest part of your record. Deliver a hard assignment and praise them when they earn it; never argue in front of the team.`,
    team: `${mentor.firstName} says: the team rates working with you at ${Math.round(dash.teamView.value ?? 60)}% — the weakest part of your record. Cover someone's shift this month; the team remembers who helps.`,
    numbers: `${mentor.firstName} says: the work itself is ${Math.round(dash.numbers.value)}% — the weakest part of your record. Take a course, or put in overtime for a month; the numbers move when the work does.`
  }[weakest.key];
  if (job.performanceParts && job.performanceParts[weakest.part] != null) {
    job.performanceParts[weakest.part] = clamp(job.performanceParts[weakest.part] + 2, 0, 100);
  }
  job.performance = clamp(job.performance + 1, 0, 100);
  m.mentor.adviceTurn = S.turn;
  rememberDeed(S, mentor, 'mentor_advice', 'You asked them for advice — they told you plainly what to fix.', { affection: 2, trust: 2 });
  return { ok: true, msg: `${adviceText} You acted on it — that part of your record rose 2 points, performance +1.` };
}

export function askMentorIntroduction(S) {
  const m = ensureCareerMarket(S);
  if (!m.mentor) return { ok: false, msg: 'You have no mentor — ask a senior colleague first.' };
  const mentor = S.people[m.mentor.personId];
  if (!mentor || !mentor.alive) {
    m.mentor = null;
    return { ok: false, msg: 'Your mentor is no longer at work.' };
  }
  if (m.mentor.introTurn && S.turn - m.mentor.introTurn < 6) {
    return { ok: false, msg: 'Your mentor only just put your name forward — give it a few months.' };
  }
  if (m.offer) {
    return { ok: false, msg: 'You already have an open offer — deal with that first, then ask for an introduction.' };
  }
  m.mentor.introductions += 1;
  m.mentor.introTurn = S.turn;
  rememberDeed(S, mentor, 'mentor_intro', `You asked ${mentor.firstName} to introduce you — they put your name forward with hiring managers they know.`, { affection: 2, trust: 3 });
  const approach = maybeHeadhunterApproach(S, { chance: 0.35, ignorePerformance: true });
  if (approach.ok) {
    return { ok: true, msg: `${mentor.firstName} introduced you to ${approach.offer.recruiterName} at ${approach.offer.employer} — an offer is on your Career tab.` };
  }
  return { ok: true, msg: `${mentor.firstName} put your name forward with two hiring managers they know. Nothing came back yet — but headhunters are twice as likely to call while ${mentor.firstName} is in your corner.` };
}

/* ------------------------------------------------------------------ */
/* Rivals                                                              */
/* ------------------------------------------------------------------ */

/* A colleague at your level who wants the same next rung. Spawns in the
   monthly tick once you are in contention (65%+, 6 months in role). */
export function maybeSpawnRival(S, opts = {}) {
  const m = ensureCareerMarket(S);
  const job = S?.career?.job;
  if (!job || m.rival) return null;
  if (!opts.force) {
    if ((job.performance ?? 0) < 65 || (job.monthsInRole || 0) < 6) return null;
    if (!cmChance(S, 0.10)) return null;
  }
  const mentorId = m.mentor?.personId;
  let candidate = colleaguesOf(S).find(p => p.id !== mentorId && p.age >= S.player.age - 2);
  if (!candidate) {
    candidate = cmCreatePerson(S, {
      age: Math.max(21, S.player.age + cmRandInt(S, -2, 4)),
      role: 'colleague',
      relationLabel: `Colleague at ${job.employer}`,
      residenceCountry: S.country,
      city: S.city,
      jobTitle: job.title,
      employer: job.employer,
      track: job.track,
      monthlyIncomeLocal: Math.round(job.monthlyGross * (0.9 + cmRand(S) * 0.2)),
      affection: 52,
      respect: 55,
      trust: 52
    });
    S.people[candidate.id] = candidate;
    if (!S.relations.colleagueIds.includes(candidate.id)) {
      S.relations.colleagueIds.unshift(candidate.id);
      if (S.relations.colleagueIds.length > 4) S.relations.colleagueIds.length = 4;
    }
  }
  m.rival = { personId: candidate.id, performance: cmRandInt(S, 62, 84), stance: 'competitor', sinceYear: S.year };
  recordJournal(S, `${candidate.fullName} has their eye on the same next rung as you — and they are good. The next promotion is a race now.`, 'career');
  return m.rival;
}

export function rivalAction(S, kind) {
  const m = ensureCareerMarket(S);
  const r = m.rival;
  if (!r) return { ok: false, msg: 'You have no rival at work right now.' };
  const rival = S.people[r.personId];
  if (!rival || !rival.alive) {
    m.rival = null;
    return { ok: false, msg: 'Your rival is no longer at work.' };
  }
  const job = S?.career?.job;
  if (!job) return { ok: false, msg: 'You are not employed.' };
  const cdKey = `rival_${kind}`;
  if (S.cooldowns[cdKey] && S.turn < S.cooldowns[cdKey]) {
    return { ok: false, msg: 'You only just did that — give it a few months.' };
  }
  if (kind === 'collaborate') {
    S.cooldowns[cdKey] = S.turn + 3;
    rememberDeed(S, rival, 'rival_collaborate', 'You worked with them instead of against them.', { affection: 6, trust: 8, respect: 3 });
    if (job.performanceParts) job.performanceParts.teamwork = clamp(job.performanceParts.teamwork + 2, 0, 100);
    r.performance = clamp(r.performance + 1, 0, 100);
    r.stance = 'ally';
    recordJournal(S, `You worked with ${rival.firstName} on a shared piece of work instead of competing — the team noticed, and so did they.`, 'career');
    return { ok: true, msg: `${rival.firstName} is an ally now — trust +8, and the team rates you better. If you both go for the promotion, they will not undercut you.` };
  }
  if (kind === 'compete') {
    S.cooldowns[cdKey] = S.turn + 3;
    job.performance = clamp(job.performance + 2, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 3);
    r.performance = clamp(r.performance + 2, 0, 100);
    rememberDeed(S, rival, 'rival_compete', 'You raced them for the same promotion, openly and fairly.', { respect: 3 });
    recordJournal(S, `You pushed harder to stay ahead of ${rival.firstName} — performance +2, stress +3. They pushed back just as hard.`, 'career');
    return { ok: true, msg: `A fair race — your performance +2, stress +3, and ${rival.firstName} pushed back too (their performance +2).` };
  }
  if (kind === 'undermine') {
    S.cooldowns[cdKey] = S.turn + 6;
    const discovered = cmChance(S, 1 / 3);
    if (discovered) {
      const boss = bossOf(S);
      if (boss) rememberDeed(S, boss, 'undermined_colleague', `Word got back that you tried to undercut ${rival.firstName}.`, { respect: -10, trust: -6 });
      rememberDeed(S, rival, 'undermined', 'You tried to undercut them behind their back — and they found out.', { affection: -8, respect: -12, trust: -15 });
      r.performance = clamp(r.performance + 2, 0, 100);
      recordJournal(S, `Word got back to your manager that you tried to undercut ${rival.firstName}. Your manager's respect fell 10 points — and ${rival.firstName} will not forget it.`, 'career');
      return { ok: true, msg: `It backfired — your manager heard about it (respect −10) and ${rival.firstName} knows. Their standing rose, not fell.` };
    }
    rememberDeed(S, rival, 'undermined', 'You quietly undercut them — they never found out it was you.', { affection: -4, trust: -8 });
    r.performance = clamp(r.performance - 5, 0, 100);
    recordJournal(S, `You quietly undercut ${rival.firstName} — a missed credit here, a rumour there. Their standing slipped, and nobody traced it to you.`, 'career');
    return { ok: true, msg: `It worked — ${rival.firstName}'s standing slipped (their performance −5) and nobody traced it to you. Your promotion odds just improved.` };
  }
  return { ok: false, msg: 'Unknown move.' };
}

/* ------------------------------------------------------------------ */
/* Monthly tick — called from gameLoop after tickCareerMonthly.        */
/* ------------------------------------------------------------------ */

export function tickCareerMarketMonth(S) {
  if (!S || (S.player?.age ?? 0) < 18) return;
  const m = ensureCareerMarket(S);
  /* The pot stays invested whether you work or not. */
  applyPensionGrowth(S);
  const job = S.career.job;
  if (!S.career.employed || !job) {
    if (m.offer) m.offer = null;
    return;
  }
  ensurePension(S);
  /* An open offer expires after 3 months — they hire someone else. */
  if (m.offer && S.turn >= m.offer.expiresTurn) {
    const o = m.offer;
    m.offer = null;
    recordJournal(S, `The offer from ${o.employer} expired — ${o.recruiterName} hired someone else.`, 'career');
  }
  if (m.nonCompete && S.year > m.nonCompete.untilYear) m.nonCompete = null;
  /* Teamwork follows the team's live view of you, slowly — the stored
     part drifts 15% a month toward how your colleagues actually rate
     you, so it moves with the real relationships, not a script. */
  const colleagues = colleaguesOf(S);
  if (colleagues.length && job.performanceParts) {
    const avg = colleagues.reduce((s, p) => s + ((p.rel.affection + p.rel.respect + p.rel.trust) / 3), 0) / colleagues.length;
    job.performanceParts.teamwork = clamp(Math.round(job.performanceParts.teamwork + (avg - job.performanceParts.teamwork) * 0.15), 0, 100);
  }
  /* A good performer may be approached. */
  maybeHeadhunterApproach(S);
  /* A rival appears once you are in contention for the next rung. */
  if (!m.rival && S.turn >= (m.rivalCooldownTurn || 0)) maybeSpawnRival(S);
  if (m.rival) {
    const rival = S.people[m.rival.personId];
    if (!rival || !rival.alive) {
      m.rival = null;
      m.rivalCooldownTurn = S.turn + 12;
    } else {
      m.rival.performance = clamp(m.rival.performance + cmRandInt(S, -3, 3), 55, 92);
    }
  }
}
