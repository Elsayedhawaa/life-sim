/* ============================================================================
   World Life 2.0 — v2.18 W1 (§1): Career, Real — the player does the job.
   A pilot flies a real route; a doctor treats a real patient; a teacher
   teaches a real class; a lawyer argues a real case. Every month in a job
   brings one real piece of work — a name, a deadline in months, and the
   skill it uses — with four choices, each stating its trade-off first:
   take the hard assignment, cut a corner, help a colleague, or ask for
   the difficult client. The outcome moves the performance dashboard's
   three parts through the exact fields getPerformanceDashboard reads
   (boss People-record relationship + job.performanceParts.managerView,
   colleagues' relationships, job.performanceParts.quality/attendance and
   job.performance) — no new dashboard fields are invented here.
   Skill grows by doing: a skill used in real work rises; a skill never
   used falls 0.5 a month. Work completions count toward promotion where
   the promotion check reads them: job.actionState.steppedUp (decidePromotion
   and promotionScoreParts both add +3 per entry) and job.performance.
   Visible wins are recorded at S.career.workAchievements as
   { id, label, year, month, trackId } with S.career.workAchievementCount
   kept equal to its length — the headhunter code reads exactly this shape.
   One-directional imports: this file reads careerActions (boss, colleagues,
   action state) and the core — it does NOT import careerEducationEngine,
   so the one hook call in tickCareerMonthly cannot form a cycle.
   RNG: its OWN seeded stream (S.careerWorkRng, derived from the life
   seed exactly like v2.15's careerMarketRng), so a new system never
   shifts the game's main stream.
   The 16 v2.8 actions in careerActions.js stay untouched: they are the
   rhythm around the real work now, not the whole job.
   ========================================================================== */

import { clamp, hashSeed } from '../core/rng.js';
import { recordJournal, ensureExtendedState } from '../core/schema.js';
import { bossOf, colleaguesOf, ensureJobActionState } from './careerActions.js';

/* ------------------------------------------------------------------ */
/* Own RNG stream (see header).                                        */
/* ------------------------------------------------------------------ */

function cwRand(S) {
  if (typeof S.careerWorkRng !== 'number') {
    S.careerWorkRng = hashSeed(String(S.seed ?? 'world-life-2') + ':career-work');
  }
  let t = (S.careerWorkRng = (S.careerWorkRng + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function cwChance(S, p) { return cwRand(S) < p; }
function cwPick(S, list) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.floor(cwRand(S) * list.length)];
}

/* ------------------------------------------------------------------ */
/* State — lazy, so saves made before v2.18 keep working.              */
/* ------------------------------------------------------------------ */

export function ensureCareerWork(S) {
  ensureExtendedState(S);
  if (!S.career) S.career = {};
  if (!S.career.workSkills) S.career.workSkills = {};   // skillId -> { level, lastUsedIdx }
  if (!S.career.workAchievements) S.career.workAchievements = [];
  if (S.career.workAchievementCount === undefined) S.career.workAchievementCount = S.career.workAchievements.length;
  if (S.career.workCompletions === undefined) S.career.workCompletions = 0;
  if (!('currentWork' in S.career)) S.career.currentWork = null;
  if (!('lastWork' in S.career)) S.career.lastWork = null;
  if (!('workHelpOwed' in S.career)) S.career.workHelpOwed = null;
  if (S.career.workSeq === undefined) S.career.workSeq = 0;
  return S.career;
}

function monthIdx(S) { return (S.year || 2026) * 12 + (S.month || 1); }

/* Skill level for a track skill. A new skill starts at 45, plus 2 per
   year already spent in the track (cap 75) — experience counts, but the
   only way up from there is doing the work. */
export function getWorkSkillLevel(S, skillId) {
  ensureCareerWork(S);
  const rec = S.career.workSkills[skillId];
  return rec ? rec.level : null;
}

function skillLevelOrInit(S, skillId, trackId) {
  ensureCareerWork(S);
  let rec = S.career.workSkills[skillId];
  if (!rec) {
    const trackExp = (S.career.trackExperience && S.career.trackExperience[trackId]) || 0;
    rec = { level: clamp(45 + Math.min(30, trackExp * 2), 0, 100), lastUsedIdx: monthIdx(S) };
    S.career.workSkills[skillId] = rec;
  }
  return rec.level;
}

function useSkill(S, skillId, gain) {
  const rec = S.career.workSkills[skillId];
  if (!rec) return;
  rec.level = clamp(rec.level + gain, 0, 100);
  rec.lastUsedIdx = monthIdx(S);
}

/* ------------------------------------------------------------------ */
/* The work itself — one template per track, from the track's real     */
/* duties. Two variants per track so the same month does not repeat   */
/* itself. Aliases map the 61 V1 deep tracks onto these templates;    */
/* anything else gets the generic template built from its own title.  */
/* ------------------------------------------------------------------ */

/* Each variant: the job, what it asks of you, and the visible win it
   becomes if you deliver it. */
export const CAREER_WORK_TEMPLATES = {
  medicine: {
    skillId: 'diagnosis', skillLabel: 'Diagnosis', deadlineMonths: 1,
    variants: [
      { title: 'A patient comes in with chest pain', detail: 'A 58-year-old man arrives at A&E clutching his chest. Rule out a heart attack: the right tests, in the right order, and then the call — admit him, or send him home.', achievement: 'Caught a silent heart attack in A&E and got the patient to treatment in time' },
      { title: 'A child with a high fever that will not break', detail: 'A four-year-old has had 40°C for two days and her parents are frightened. Work out what it is, explain it to them plainly, and decide whether she stays in tonight.', achievement: 'Diagnosed a child\'s fever correctly and kept a frightened family calm' }
    ],
    hardLabel: 'Take the difficult case yourself',
    difficultLabel: 'Ask for the sickest patient on the ward',
    cornerLabel: 'Skip the second set of bloods to clear the queue',
    helpLabel: 'Cover a colleague\'s night shift'
  },
  aviation: {
    skillId: 'flying', skillLabel: 'Flying', deadlineMonths: 1,
    variants: [
      { title: 'Fly Cairo to Dubai, then turn around and fly back', detail: 'A two-sector day: Cairo–Dubai out, Dubai–Cairo back, a tight turnaround in between. Weather over the Gulf is building and the fuel plan is yours to sign.', achievement: 'Flew Cairo–Dubai–Cairo on time through bad Gulf weather' },
      { title: 'A night cargo run with a crosswind landing', detail: 'A freighter leg landing after midnight, crosswind at the limit, and a tired crew. The approach is yours — and so is the decision to go around if it does not feel right.', achievement: 'Brought a night cargo flight in safely in a limit crosswind' }
    ],
    hardLabel: 'Take the two-sector day yourself',
    difficultLabel: 'Ask for the bad-weather roster',
    cornerLabel: 'Sign the fuel plan without re-checking the alternates',
    helpLabel: 'Cover a colleague\'s rostered day off'
  },
  teaching: {
    skillId: 'teaching', skillLabel: 'Teaching', deadlineMonths: 2,
    variants: [
      { title: 'Teach Year 9 maths to a class that has given up', detail: 'Thirty 14-year-olds, half of them behind, and exams in six weeks. Plan the lessons, keep the room with you, and get the ones who have switched off back in.', achievement: 'Turned a switched-off Year 9 class around before their exams' },
      { title: 'Run the end-of-term exams and the marking', detail: 'Two hundred papers, a marking scheme that leaves no room for guessing, and parents who will ask about every grade. Mark them fairly and on time.', achievement: 'Marked two hundred exam papers fairly and on time' }
    ],
    hardLabel: 'Take the hardest class yourself',
    difficultLabel: 'Ask for the exam class nobody wants',
    cornerLabel: 'Mark the papers on gut feeling instead of the scheme',
    helpLabel: 'Cover a colleague\'s lessons while they are ill'
  },
  law: {
    skillId: 'advocacy', skillLabel: 'Advocacy', deadlineMonths: 2,
    variants: [
      { title: 'Argue a tenant\'s eviction defence in court', detail: 'A family faces eviction over three months of unpaid rent after the father lost his job. The landlord\'s papers are in order — your case is the human one, and the judge will want it argued properly.', achievement: 'Won a tenant family time to stay in their home' },
      { title: 'Draft a contract for a client buying their first shop', detail: 'A shopkeeper is buying the premises she has rented for ten years. The seller\'s draft hides two traps in the fine print. Find them before she signs.', achievement: 'Spotted the traps in a shop purchase contract before the client signed' }
    ],
    hardLabel: 'Take the case to a full hearing yourself',
    difficultLabel: 'Ask for the client nobody else will touch',
    cornerLabel: 'File the papers without re-reading the landlord\'s bundle',
    helpLabel: 'Cover a colleague\'s hearing while they are away'
  },
  software: {
    skillId: 'coding', skillLabel: 'Coding', deadlineMonths: 2,
    variants: [
      { title: 'Ship the new checkout, and fix the bug that eats payments', detail: 'The payment page fails one time in twenty and nobody knows why. Find it, fix it, and get the new checkout live before the sale starts — real customers\' money is on the line.', achievement: 'Fixed the checkout bug that was eating payments, and shipped the new page on time' },
      { title: 'Rebuild the search that times out at rush hour', detail: 'Every evening the search slows to a crawl and customers leave. The fix means rewriting the slow query and proving it holds up under load.', achievement: 'Rebuilt the search so it holds up at rush hour' }
    ],
    hardLabel: 'Take the payment bug yourself',
    difficultLabel: 'Ask for the rewrite nobody wants to touch',
    cornerLabel: 'Ship it without the load test and hope rush hour is kind',
    helpLabel: 'Help a teammate debug their service'
  },
  data: {
    /* Data-science, analytics and AI jobs get their own work, not the software team's payment bug. */
    skillId: 'analysis', skillLabel: 'Analysis', deadlineMonths: 2,
    variants: [
      { title: 'Find out why the churn forecast stopped matching reality', detail: 'Last quarter the model said one customer in twelve would leave. One in seven did. Trace the drift to the data or the features, retrain it, and show the managers how far to trust the new number.', achievement: 'Found why the forecast drifted and retrained it on clean data' },
      { title: 'Clean the customer table before the monthly report', detail: 'The same customer appears three times under different spellings and the totals are wrong. Match the duplicates, fix the joins, and check the totals against finance before the report goes out.', achievement: 'Cleaned the customer data so the monthly numbers matched finance' }
    ],
    hardLabel: 'Take the broken forecast yourself',
    difficultLabel: 'Ask for the data clean-up nobody wants to touch',
    cornerLabel: 'Send the report without checking the totals against finance',
    helpLabel: 'Help a teammate debug their pipeline'
  },
  engineering: {
    skillId: 'site', skillLabel: 'Site management', deadlineMonths: 2,
    variants: [
      { title: 'Pour the slab for the new tower block', detail: 'Forty cubic metres of concrete, a night pour, and a crew of twenty. If the mix is wrong or the pour stalls, the whole floor is lost — and so is the week.', achievement: 'Delivered a forty-cubic-metre night pour without a hitch' },
      { title: 'Inspect the steelwork before the client walks the site', detail: 'The client is coming on Thursday and the steel has to be right. Walk every joint, check the drawings against what is actually built, and sign it off — or stop the job.', achievement: 'Signed off the steelwork after catching a bad joint the drawings missed' }
    ],
    hardLabel: 'Run the night pour yourself',
    difficultLabel: 'Ask for the site with the safety record nobody wants',
    cornerLabel: 'Sign the inspection from the drawings without walking the site',
    helpLabel: 'Cover a colleague\'s site while they are on leave'
  },
  finance: {
    skillId: 'analysis', skillLabel: 'Analysis', deadlineMonths: 1,
    variants: [
      { title: 'Close a small business loan file before month-end', detail: 'A bakery needs its loan approved this week or it misses the rent on its new shop. The numbers are close to the line — check them properly and make the call.', achievement: 'Got a small bakery its loan in time to sign the shop lease' },
      { title: 'Audit a branch whose books do not add up', detail: 'One branch is 40,000 short and the manager swears it is a system error. Trace every entry until you know whether it is an error, a mistake, or something worse.', achievement: 'Traced a 40,000 gap in a branch\'s books to its real cause' }
    ],
    hardLabel: 'Take the borderline loan file yourself',
    difficultLabel: 'Ask for the audit nobody wants to open',
    cornerLabel: 'Approve the file on the headline numbers without checking the footnotes',
    helpLabel: 'Cover a colleague\'s month-end close'
  },
  nursing: {
    skillId: 'care', skillLabel: 'Patient care', deadlineMonths: 1,
    variants: [
      { title: 'Run a night shift on a full ward', detail: 'Twenty-two patients, two nurses down, and a new admission at 2 a.m. Keep the ward safe, keep the charts honest, and be there when the frightened ones ring the bell.', achievement: 'Held a full ward safe through a short-staffed night shift' },
      { title: 'Care for an elderly patient after surgery', detail: 'An 81-year-old woman is confused and in pain after her operation, and her daughter is asking questions you cannot dodge. Manage the pain, watch for infection, and tell the family the truth.', achievement: 'Brought an elderly patient safely through the days after surgery' }
    ],
    hardLabel: 'Take the short-staffed night shift yourself',
    difficultLabel: 'Ask for the hardest patient on the ward',
    cornerLabel: 'Chart the observations from memory at the end of the shift',
    helpLabel: 'Cover a colleague\'s shift so they can go home'
  },
  sales: {
    skillId: 'selling', skillLabel: 'Selling', deadlineMonths: 2,
    variants: [
      { title: 'Win back a corporate account that is about to leave', detail: 'A client worth a fifth of your region\'s sales is talking to your rival. They have a real complaint and a deadline: fix it this month, or they walk.', achievement: 'Won back a corporate account that was about to leave' },
      { title: 'Close the quarter with a new account nobody has cracked', detail: 'A chain of pharmacies has said no to every rep for two years. The quarter ends in six weeks. Crack it — or explain to your manager why you did not.', achievement: 'Closed the pharmacy chain no rep had cracked in two years' }
    ],
    hardLabel: 'Take the at-risk account yourself',
    difficultLabel: 'Ask for the account that has said no for two years',
    cornerLabel: 'Promise the client next-week delivery you cannot guarantee',
    helpLabel: 'Cover a colleague\'s territory while they are ill'
  },
  hospitality: {
    skillId: 'service', skillLabel: 'Service', deadlineMonths: 1,
    variants: [
      { title: 'Run a wedding banquet for 300 guests', detail: 'A Saturday wedding, 300 guests, a menu the kitchen has never cooked at this size, and a bride whose family is watching everything. Run the floor so the night feels effortless.', achievement: 'Ran a 300-guest wedding banquet without a hitch' },
      { title: 'Handle a fully booked weekend with half the staff', detail: 'Two waiters called in sick on the busiest weekend of the season and the hotel is full. Rearrange the rota, keep the guests happy, and do not let the kitchen fall behind.', achievement: 'Held a fully booked weekend together with half the staff' }
    ],
    hardLabel: 'Run the big banquet yourself',
    difficultLabel: 'Ask for the weekend with the staff shortage',
    cornerLabel: 'Seat the late guests at the wrong tables to keep the kitchen moving',
    helpLabel: 'Cover a colleague\'s shift on the floor'
  },
  trades: {
    skillId: 'craft', skillLabel: 'Craft', deadlineMonths: 1,
    variants: [
      { title: 'Fix a family\'s boiler in the middle of winter', detail: 'A family with two small children has no heating and the temperature is dropping. Diagnose it properly — a bodged fix on a gas boiler can kill.', achievement: 'Got a family\'s heating back on in a freezing week, done properly' },
      { title: 'Rewire a shop before it opens on Monday', detail: 'A shop owner opens on Monday and the wiring fails its test on Friday. Rewire the fault, test every circuit, and sign it safe — or tell her she cannot open.', achievement: 'Rewired a shop over a weekend and signed it safe for opening day' }
    ],
    hardLabel: 'Take the emergency call-out yourself',
    difficultLabel: 'Ask for the job with the failed safety test',
    cornerLabel: 'Sign the boiler off without the full pressure test',
    helpLabel: 'Help a teammate finish a job that is running late'
  },
  media: {
    skillId: 'reporting', skillLabel: 'Reporting', deadlineMonths: 1,
    variants: [
      { title: 'File a story on the hospital waiting lists', detail: 'Patients are waiting months for operations and the hospital will not comment. Find the people, check the numbers twice, and file a story that is fair and true.', achievement: 'Filed a hospital waiting-list story that was checked, fair and true' },
      { title: 'Cover a local election on the night', detail: 'Results come in fast, the count is disputed, and your editor wants the story before midnight. Get it right first time — a wrong call on election night does not wash off.', achievement: 'Called a disputed local election right, on the night' }
    ],
    hardLabel: 'Take the investigation yourself',
    difficultLabel: 'Ask for the story the hospital will not comment on',
    cornerLabel: 'File the story on one source instead of two',
    helpLabel: 'Help a colleague check their copy before deadline'
  }
};

/* V1 deep tracks and common aliases onto the twelve templates above. */
export const CAREER_WORK_ALIASES = {
  surgery: 'medicine', pediatrics: 'medicine', cardiology: 'medicine', dentistry: 'medicine',
  psychology: 'medicine', veterinary: 'medicine', physiotherapy: 'medicine', pharmacy: 'medicine',
  tech: 'software', web_development: 'software', mobile_app_development: 'software',
  data_science: 'data', analytics: 'data', data_analyst: 'data',
  cybersecurity: 'software', cybersecurity_analyst: 'software', cloud_devops_engineer: 'software',
  qa_engineering: 'software', ai_automation: 'data', product_design: 'software',
  civil_eng: 'engineering', architect: 'engineering', renewable_energy: 'engineering', ev_technician: 'trades',
  accounting: 'finance', investment: 'finance', business: 'finance', consulting: 'finance',
  marketing: 'sales', sales: 'sales', product: 'sales', ecommerce_operations: 'sales',
  hr: 'teaching', academia: 'teaching', education: 'teaching',
  hospitality: 'hospitality', media: 'media', digital_content_creator: 'media',
  social_media_management: 'media', government: 'law', prosecutor: 'law',
  bpo: 'sales', last_mile_delivery_ops: 'trades', entry: 'trades'
};

export const CAREER_WORK_TRACK_IDS = Object.keys(CAREER_WORK_TEMPLATES);

function templateForTrack(trackId) {
  if (CAREER_WORK_TEMPLATES[trackId]) return { key: trackId, t: CAREER_WORK_TEMPLATES[trackId] };
  const alias = CAREER_WORK_ALIASES[trackId];
  if (alias && CAREER_WORK_TEMPLATES[alias]) return { key: alias, t: CAREER_WORK_TEMPLATES[alias] };
  return null;
}

/* A skill id shown to the player as words: a template's own label, else "<Field> work" for a generic craft_<field> id, else the id with spaces. */
export function workSkillLabel(id) {
  for (const t of Object.values(CAREER_WORK_TEMPLATES)) if (t.skillId === id && t.skillLabel) return t.skillLabel;
  const m = /^craft_(.+)$/.exec(String(id)); const raw = m ? m[1] : String(id).replace(/_/g, ' ');
  const w = raw.charAt(0).toUpperCase() + raw.slice(1); return m ? `${w} work` : w;
}
function prettyTrack(trackId) {
  return String(trackId || 'work').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function genericTemplate(S) {
  const job = S.career.job;
  const label = prettyTrack(job.track);
  return {
    skillId: 'craft_' + String(job.track || 'general').replace(/[^a-z0-9]/gi, '').toLowerCase(),
    skillLabel: label + ' work',
    deadlineMonths: 2,
    variants: [
      { title: `${/^[aeiou]/i.test(label) ? 'An' : 'A'} ${label} job lands on your desk`, detail: `A real piece of ${label} work — the kind ${/^[aeiou]/i.test(job.title || 'person') ? 'an' : 'a'} ${job.title || 'person in this job'} does every week — with a deadline and a name attached to it. Do it well and it is noticed; let it slip and it is noticed too.`, achievement: `Delivered a difficult piece of ${label} work on time` },
      { title: `A client asks for your ${label} work by name`, detail: `A client has heard of you and wants you on their job, not just anyone in the team. It is a compliment — and a test, because the client will judge you on the result.`, achievement: `Won a client who asked for you by name` }
    ],
    hardLabel: 'Take the job yourself',
    difficultLabel: 'Ask for the hardest job going',
    cornerLabel: 'Rush it through without the final check',
    helpLabel: 'Cover a colleague\'s work while they are away'
  };
}

/* The four choices, with the trade-off stated first — the same four
   real choices on every piece of work, in the track's own words. */
export function choicesForWork(work) {
  return [
    { id: 'hard', label: work.hardLabel, tradeoff: 'Hard work, real deadline: your evenings for the month. Lands well and your boss notices; slips and your record takes the hit.' },
    { id: 'corner', label: work.cornerLabel, tradeoff: 'Quick gain now: time back and the job looks done. About a 1-in-3 chance someone checks and finds it — and your boss\'s trust takes the hit.' },
    { id: 'help', label: work.helpLabel, tradeoff: 'Costs you time this month and a little of your own output — but the team remembers, and the favour comes back when you need it.' },
    { id: 'difficult', label: work.difficultLabel, tradeoff: 'The hardest job going: the biggest upside if it lands, the biggest fall if it does not.' }
  ];
}

/* ------------------------------------------------------------------ */
/* Assignment — one piece of work a month, at most one open at a time.*/
/* ------------------------------------------------------------------ */

export function assignCareerWork(S) {
  ensureCareerWork(S);
  const job = S.career?.job;
  if (!S.career?.employed || !job) return null;
  if (S.career.currentWork) return S.career.currentWork;
  const found = templateForTrack(job.track);
  const t = found ? found.t : genericTemplate(S);
  const variant = cwPick(S, t.variants) || t.variants[0];
  const skillLevel = skillLevelOrInit(S, t.skillId, job.track);
  S.career.workSeq += 1;
  const work = {
    id: `cw_${S.year}_${S.month}_${job.track}_${S.career.workSeq}`,
    trackId: job.track,
    title: variant.title,
    detail: variant.detail,
    achievement: variant.achievement,
    skillId: t.skillId,
    skillLabel: t.skillLabel,
    skillLevelAtAssign: skillLevel,
    deadlineMonths: t.deadlineMonths,
    monthsLeft: t.deadlineMonths,
    overdue: false,
    assignedYear: S.year,
    assignedMonth: S.month,
    hardLabel: t.hardLabel,
    difficultLabel: t.difficultLabel,
    cornerLabel: t.cornerLabel,
    helpLabel: t.helpLabel,
    status: 'open',
    outcome: null
  };
  work.choices = choicesForWork(work);
  S.career.currentWork = work;
  return work;
}

/* The monthly hook — the ONLY call the engine makes into this file.
   Called at the end of tickCareerMonthly (employed months only).
   1) A skill never used falls 0.5 a month. 2) An open piece of work
   loses a month of deadline. 3) If nothing is open, assign the month's
   work. A deadline that passes does NOT make the work vanish: the piece
   stays on your desk, overdue, until you deal with it — one real hit
   the month it goes overdue, then only your boss's patience wearing
   thin. Handing out a fresh piece every month while the old one sits
   unfinished would let an ignored job drain performance month after
   month until the warning process fired on its own, which is not what
   a missed deadline means. */
export function maybeAssignCareerWork(S) {
  ensureCareerWork(S);
  if (!S.career?.employed || !S.career?.job) return null;
  const idx = monthIdx(S);
  for (const rec of Object.values(S.career.workSkills)) {
    if (rec.lastUsedIdx < idx) rec.level = Math.max(20, rec.level - 0.5);
  }
  const job = S.career.job;
  let work = S.career.currentWork;
  if (work && work.trackId !== job.track) {
    recordJournal(S, `You left "${work.title}" unfinished when you changed jobs — the new role has its own work.`, 'career');
    S.career.currentWork = null;
    work = null;
  }
  if (work && work.status === 'open') {
    if (work.monthsLeft > 0) work.monthsLeft -= 1;
    if (work.monthsLeft <= 0 && !work.overdue) {
      work.overdue = true;
      missWork(S, work);
    } else if (work.overdue) {
      const boss = bossOf(S);
      if (boss?.rel) boss.rel.respect = clamp(boss.rel.respect - 1, 0, 100);
    }
  }
  if (!work) return assignCareerWork(S);
  return work;
}

function missWork(S, work) {
  const job = S.career.job;
  if (!job) return;
  getJobContractParts(S);
  job.performance = clamp((job.performance ?? 65) - 3, 0, 100);
  job.performanceParts.quality = clamp(job.performanceParts.quality - 3, 0, 100);
  job.performanceParts.managerView = clamp(job.performanceParts.managerView - 3, 0, 100);
  const boss = bossOf(S);
  if (boss?.rel) { boss.rel.respect = clamp(boss.rel.respect - 4, 0, 100); boss.rel.trust = clamp(boss.rel.trust - 3, 0, 100); }
  S.player.vitals.stress = clamp((S.player.vitals.stress ?? 50) + 4, 0, 100);
  /* Status stays 'open': the work is overdue, not gone. It is cleared
     only when the player resolves it, or changes jobs. */
  recordJournal(S, `The deadline passed on “${work.title}” — it is still sitting on your desk, overdue, and ${boss ? boss.firstName : 'your manager'} noticed. Performance −3, and your manager's respect slipped. Deal with it to get fresh work.`, 'career');
}

/* ------------------------------------------------------------------ */
/* Resolution — the player chooses, the dashboard moves.               */
/* Every writer below touches only fields getPerformanceDashboard     */
/* reads: boss rel + performanceParts.managerView (boss view),        */
/* colleagues' rel (team view), performanceParts.quality/attendance   */
/* and job.performance (numbers).                                     */
/* ------------------------------------------------------------------ */

function getJobContractParts(S) {
  const job = S.career.job;
  if (!job.performanceParts) {
    const p = clamp(job.performance ?? 65, 0, 100);
    job.performanceParts = { attendance: clamp(p + 2, 0, 100), quality: p, teamwork: clamp(p - 2, 0, 100), managerView: clamp(p, 0, 100) };
  }
  return job.performanceParts;
}

function moveBoss(S, d) {
  const boss = bossOf(S);
  if (!boss?.rel) return boss;
  if (d.respect) boss.rel.respect = clamp(boss.rel.respect + d.respect, 0, 100);
  if (d.trust) boss.rel.trust = clamp(boss.rel.trust + d.trust, 0, 100);
  if (d.affection) boss.rel.affection = clamp(boss.rel.affection + d.affection, 0, 100);
  return boss;
}

function moveColleagues(S, d) {
  const list = colleaguesOf(S);
  for (const c of list) {
    if (!c.rel) continue;
    if (d.affection) c.rel.affection = clamp(c.rel.affection + d.affection, 0, 100);
    if (d.trust) c.rel.trust = clamp(c.rel.trust + d.trust, 0, 100);
    if (d.respect) c.rel.respect = clamp(c.rel.respect + d.respect, 0, 100);
  }
  return list;
}

function moveParts(S, d) {
  const job = S.career.job;
  const parts = getJobContractParts(S);
  if (d.perf) job.performance = clamp((job.performance ?? 65) + d.perf, 0, 100);
  if (d.quality) parts.quality = clamp(parts.quality + d.quality, 0, 100);
  if (d.attendance) parts.attendance = clamp(parts.attendance + d.attendance, 0, 100);
  if (d.teamwork) parts.teamwork = clamp(parts.teamwork + d.teamwork, 0, 100);
  if (d.managerView) parts.managerView = clamp(parts.managerView + d.managerView, 0, 100);
}

function recordAchievement(S, work) {
  ensureCareerWork(S);
  const ach = { id: work.id, label: work.achievement, year: S.year, month: S.month, trackId: work.trackId };
  S.career.workAchievements.push(ach);
  S.career.workAchievementCount = S.career.workAchievements.length;
  return ach;
}

/* A completed piece of work counts toward promotion where the check
   reads it: one steppedUp entry (+3 in decidePromotion and in
   promotionScoreParts) and the performance move itself. */
function countTowardPromotion(S, work, outcomeLabel) {
  const st = ensureJobActionState(S);
  if (st) {
    if (!Array.isArray(st.steppedUp)) st.steppedUp = [];
    st.steppedUp.push({ kind: 'work', label: `${work.title} — ${outcomeLabel}`, year: S.year, month: S.month });
  }
  S.career.workCompletions = (S.career.workCompletions || 0) + 1;
}

function finishWork(S, work, outcome, msg) {
  work.status = 'done';
  work.outcome = outcome;
  S.career.currentWork = null;
  S.career.lastWork = work;
  recordJournal(S, msg, 'career');
  return { ok: true, msg };
}

/* opts.force (tests only): 'success' | 'fail' | 'caught' | 'clean' —
   forces the roll so each branch can be measured exactly. */
export function resolveCareerWork(S, choiceId, opts = {}) {
  ensureCareerWork(S);
  const job = S.career?.job;
  if (!S.career?.employed || !job) return { ok: false, msg: 'You are not currently employed.' };
  const work = S.career.currentWork;
  if (!work || work.status !== 'open') return { ok: false, msg: 'There is no open piece of work to do right now.' };
  const choice = (work.choices || []).find((c) => c.id === choiceId);
  if (!choice) return { ok: false, msg: 'That is not one of the choices for this piece of work.' };
  const skill = skillLevelOrInit(S, work.skillId, work.trackId);
  const boss = bossOf(S);
  const bossName = boss ? boss.firstName : 'your manager';
  const owed = S.career.workHelpOwed;
  const owedValid = owed && !owed.used && (S.turn || 0) <= (owed.untilTurn || 0);
  const owedBoost = owedValid ? 0.15 : 0;

  if (choiceId === 'hard') {
    const p = clamp(0.45 + skill / 200 + owedBoost, 0.1, 0.95);
    const success = opts.force === 'success' ? true : opts.force === 'fail' ? false : cwChance(S, p);
    if (owedValid) { owed.used = true; S.career.workHelpOwed = null; }
    if (success) {
      moveParts(S, { perf: 4, quality: 4, managerView: 4 });
      moveBoss(S, { respect: 5, trust: 2 });
      useSkill(S, work.skillId, 5);
      recordAchievement(S, work);
      countTowardPromotion(S, work, 'delivered');
      S.player.vitals.happiness = clamp((S.player.vitals.happiness ?? 60) + 2, 0, 100);
      S.player.vitals.stress = clamp((S.player.vitals.stress ?? 50) + 2, 0, 100);
      return finishWork(S, work, 'delivered',
        `You delivered “${work.title}” — on time, done properly. ${bossName} noticed: performance +4, and a visible win for your record.`);
    }
    moveParts(S, { perf: -2, quality: -2, managerView: -2 });
    moveBoss(S, { respect: -3 });
    useSkill(S, work.skillId, 2);
    countTowardPromotion(S, work, 'attempted — it slipped');
    S.player.vitals.stress = clamp((S.player.vitals.stress ?? 50) + 4, 0, 100);
    return finishWork(S, work, 'slipped',
      `You took “${work.title}” on and it slipped — the deadline beat you. Performance −2, and ${bossName} noticed. You still learned from doing it.`);
  }

  if (choiceId === 'corner') {
    const caught = opts.force === 'caught' ? true : opts.force === 'clean' ? false : cwChance(S, 0.35);
    if (caught) {
      moveParts(S, { perf: -4, quality: -3, managerView: -6 });
      moveBoss(S, { respect: -8, trust: -10 });
      const st = ensureJobActionState(S);
      if (st) st.warnings = (st.warnings || 0) + 1;
      useSkill(S, work.skillId, 0);
      countTowardPromotion(S, work, 'cut a corner — and got caught');
      return finishWork(S, work, 'caught',
        `Someone checked “${work.title}” and found the shortcut. ${bossName}'s trust fell 10 points, respect fell 8, and it went on your record as a warning. The hour you saved cost you far more.`);
    }
    moveParts(S, { perf: 2, quality: 1 });
    S.player.vitals.stress = clamp((S.player.vitals.stress ?? 50) - 2, 0, 100);
    countTowardPromotion(S, work, 'finished fast');
    return finishWork(S, work, 'finished-fast',
      `You cut the corner on “${work.title}” and nobody checked. It looks done and you got an hour back — but nothing was learned, and the risk is still sitting there.`);
  }

  if (choiceId === 'help') {
    const helped = moveColleagues(S, { affection: 4, trust: 8, respect: 3 });
    moveParts(S, { perf: -1, quality: -1, teamwork: 4 });
    useSkill(S, work.skillId, 1);
    if (helped.length) {
      const first = helped[0];
      S.career.workHelpOwed = { colleagueId: first.id, colleagueName: first.fullName, untilTurn: (S.turn || 0) + 6, used: false };
    }
    countTowardPromotion(S, work, 'helped a colleague');
    return finishWork(S, work, 'helped',
      helped.length
        ? `You put your own work aside and covered for ${helped[0].firstName}. It cost you time — performance −1 — but the team noticed: their trust in you rose 8, and ${helped[0].firstName} owes you one.`
        : `You put your own work aside to help the team. It cost you time — performance −1 — but the team noticed, and the goodwill will come back.`);
  }

  if (choiceId === 'difficult') {
    const p = clamp(0.4 + skill / 250 + owedBoost, 0.1, 0.9);
    const success = opts.force === 'success' ? true : opts.force === 'fail' ? false : cwChance(S, p);
    if (owedValid) { owed.used = true; S.career.workHelpOwed = null; }
    if (success) {
      moveParts(S, { perf: 6, quality: 5, managerView: 6 });
      moveBoss(S, { respect: 7, trust: 3 });
      useSkill(S, work.skillId, 6);
      recordAchievement(S, work);
      countTowardPromotion(S, work, 'won the difficult one');
      S.player.vitals.happiness = clamp((S.player.vitals.happiness ?? 60) + 3, 0, 100);
      return finishWork(S, work, 'won',
        `You asked for the hardest job going — “${work.title}” — and you landed it. Performance +6, ${bossName}'s respect +7, and a visible win for your record.`);
    }
    moveParts(S, { perf: -4, quality: -3, managerView: -4 });
    moveBoss(S, { respect: -5 });
    useSkill(S, work.skillId, 2);
    countTowardPromotion(S, work, 'took the difficult one — it fell through');
    S.player.vitals.stress = clamp((S.player.vitals.stress ?? 50) + 5, 0, 100);
    return finishWork(S, work, 'fell-through',
      `You asked for the hardest job going and “${work.title}” fell through. Performance −4, ${bossName}'s respect −5. A big swing, and this time it missed.`);
  }

  return { ok: false, msg: 'That is not one of the choices for this piece of work.' };
}

/* ------------------------------------------------------------------ */
/* Render — the Current Work card. The coordinator wires this into    */
/* the Career tab; do NOT edit views.js from here. Every choice       */
/* states its trade-off first, then what it is.                        */
/* ------------------------------------------------------------------ */

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderCareerWorkHtml(S) {
  const job = S?.career?.job;
  if (!S.career?.employed || !job) return '';
  ensureCareerWork(S);
  const work = S.career.currentWork;
  const last = S.career.lastWork;
  const skills = Object.entries(S.career.workSkills || {})
    .map(([id, rec]) => ({ id, level: Math.round(rec.level) }))
    .sort((a, b) => b.level - a.level)
    .slice(0, 4);
  const achievements = (S.career.workAchievements || []).slice(-3).reverse();
  const skillLabel = work ? work.skillLabel : null;
  const skillLevel = work ? Math.round(skillLevelOrInit(S, work.skillId, work.trackId)) : null;

  return `
      <div class="card">
        <div class="section-head"><h3>Current Work</h3><span class="hud-pill">${S.career.workCompletions || 0} piece${(S.career.workCompletions || 0) === 1 ? '' : 's'} of work done</span></div>
        ${work ? `
        <div class="item-row"><div class="item-row-main">
          <strong>${esc(work.title)}</strong>
          <span>${esc(work.detail)}</span>
          <span>Deadline: ${work.overdue ? 'overdue — your boss is waiting on this' : `${work.monthsLeft} month${work.monthsLeft === 1 ? '' : 's'} left`} · Skill: ${esc(skillLabel)} (${skillLevel}%) · ${esc(job.title)} at ${esc(job.employer)}</span>
        </div></div>
        <div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">
          ${work.choices.map((c) => `
          <button type="button" class="choice-btn" data-action="career-work" data-choice="${esc(c.id)}" style="text-align:left">
            <span style="display:block;font-size:0.82rem">${esc(c.tradeoff)}</span>
            <strong>${esc(c.label)}</strong>
          </button>`).join('')}
        </div>` : `
        <div class="muted">No open piece of work right now — the next one arrives with the new month.</div>`}
        ${last && last.status === 'done' ? `<div class="muted" style="margin-top:6px">Last finished: ${esc(last.title)} — ${esc(last.outcome)}.</div>` : ''}
        ${achievements.length ? `<div style="margin-top:8px"><strong>Visible wins (${S.career.workAchievementCount}):</strong> ${achievements.map((a) => `<div class="muted">· ${esc(a.label)} (${a.year})</div>`).join('')}</div>` : ''}
        ${skills.length ? `<div class="muted" style="margin-top:6px">Skills that grow by doing: ${skills.map((s) => `${esc(workSkillLabel(s.id))} ${s.level}%`).join(' · ')} — a skill you never use falls a little every month.</div>` : ''}
      </div>`;
}
