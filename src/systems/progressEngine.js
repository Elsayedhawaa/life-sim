/* ============================================================================
   v2.13 Worker 1 — Progress system: levels, milestones, achievements.
   Revives the orphaned V1_ACHIEVEMENTS table (src/data/megaCareerEduMedical.js)
   — it is the single list of achievements; this file only decides WHEN one
   is earned, from real state, and how much XP it is worth.

   S.progress = { level, xp, achievements: [{ id, year, month }] }
     plus internal bookkeeping fields (never shown):
       _bizCapital : { [businessId]: { capital, name } } — last-seen capital
                     of each business, so a later sale can be judged
                     profitable or not (sellBusiness records no sale list;
                     it only writes a ledger line, see below).
       _salesSeen  : [ledger entry ids] already checked for a sale.
       _hadDebt    : true once a loan / card balance / BNPL plan has been
                     seen, so "Debt Free" is only earned by someone who
                     actually had debt and cleared it — never by a newborn.
       _livedAbroad: true once the player has been seen living in a
                     country that is not their home country (Returned Home).
       _visitedCountries: [country ids] the player has been in — their
                     home country, every country they lived in, and every
                     trip destination read off the ledger (World Traveler).
       _tripsSeen  : [ledger entry ids] already counted as trips, so a
                     trip is never counted twice (the ledger keeps only
                     its last 400 lines, so a trip that scrolls off must
                     already have been folded into _visitedCountries).
       _visitedHomeWhileAbroad: true once a trip to the home country was
                     seen while the player was living abroad (Home for Visit).
       _crisisEmployed: { [eventId]: true | 'broke' | 'done' } — sampled
                     employment during each world-event crisis (Survived a
                     Recession); see scanCrisisSurvival().

   Rules:
   - An achievement is earned ONLY by a real event/state in the life.
     evaluateProgress(S) is idempotent and safe to call on every advance,
     every scene resolution and every Timeline render.
   - Backfill: on first evaluation of an existing save, achievements whose
     condition is already true are granted with the CURRENT year/month —
     never a fake past date. The panel says the date is when the game
     first noticed the milestone.
   - v2.16 W2 — the five achievements the v2.13 notes listed as
     ungrantable are now wired to real state (nothing removed, still 30):
       returned_home — _livedAbroad (seen living abroad) + back in the
         home country now.
       ten_countries — _visitedCountries (home + every country lived in
         + every trip destination off the `Trip: …` ledger lines).
       helped_family — S.money.remittedHomeEgpTotal, the lifetime total
         sent home in EGP, recorded at the send itself by
         sendInternationalRemittance and by the monthly remittance in
         settleHouseholdMonth, converted through convertCurrency at the
         send date — never a guessed rate, never backfilled from old
         ledger lines (they carry no sender-country record for the
         monthly lines, which mix in the Saudi dependent levy).
       survived_recession — S.worldEvents.history: a fired world event
         that hit the player's country with businesses earning less
         (businessRevenue < 1) is a crisis; surviving it means employed
         while it ran and still employed when it ended (sampled in
         _crisisEmployed, or proved by job tenure — see
         scanCrisisSurvival()).
       returned_visit — a trip to the home country seen in the ledger
         while the player was living abroad.
     Bookkeeping is recorded going forward from real events, like
     _hadDebt: a save from before v2.16 earns these from what happens
     after this round, plus whatever its surviving records already show
     (a trip still in the ledger, a crisis in worldEvents.history, a
     job whose tenure reaches back past a crisis).
   - The Legacy Score is NOT recomputed here. The panel shows the live
     score from computeLiveLegacyScore(S) — the same number the Timeline
     already shows — so the two can never disagree.
   ========================================================================== */

import { V1_ACHIEVEMENTS, ALL_VACATIONS } from '../data/megaCareerEduMedical.js';
import { computeNetWorthLocal, recordJournal } from '../core/schema.js';
import { formatMoney } from '../data/countries.js';
import { convertCurrency } from '../data/economy.js';
import { getMergedCareerTracks } from '../systems/careerEducationEngine.js';

/* XP per achievement. Levels (cumulative XP): L1 0, L2 100, L3 250, L4 450,
   L5 700, L6 1000, L7 1400, L8 1900, L9 2500, L10 3200 (max level 10).
   Earning all 30 achievements pays 4,350 XP (the 29 listed here sum to
   4,250; gold_stash pays the 100 default), so level 10 is reachable
   only by a full life, not by the first few milestones. */
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200];
export const MAX_LEVEL = 10;

export const ACHIEVEMENT_XP = {
  first_job: 100, first_promotion: 100, first_car: 100, first_home: 100,
  married: 100, first_child: 100, bought_gold: 100, gold_stash: 100, gone_abroad: 100,
  paid_off_debt: 100, expat_5_years: 100, business_owner: 100,
  three_children: 150, bought_apartment_egy: 150, second_passport: 150,
  first_million: 150, expat_10_years: 150, worked_in_gulf: 150,
  first_business: 150, child_graduating: 150, goal_completed: 150,
  ten_million: 250, career_top: 250, marriage_10_years: 250,
  business_sold_profit: 250, ten_countries: 250,
  returned_home: 150, helped_family: 150, survived_recession: 150,
  returned_visit: 100
};

const GULF_COUNTRIES = ['sau', 'uae', 'qat', 'kwt', 'bhr', 'omn'];

export function achievementById(id) {
  return (V1_ACHIEVEMENTS || []).find(a => a && a.id === id) || null;
}

export function xpForAchievement(id) {
  return ACHIEVEMENT_XP[id] || 100;
}

export function levelForXp(xp) {
  const x = Math.max(0, Number(xp) || 0);
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (x >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return Math.min(MAX_LEVEL, level);
}

export function xpToNextLevel(xp) {
  const level = levelForXp(xp);
  if (level >= MAX_LEVEL) return null;
  return LEVEL_THRESHOLDS[level] - Math.max(0, Number(xp) || 0);
}

/* --- small state readers (all defensive: a partial/test state must not throw) --- */

function peopleList(S) {
  return Object.values(S?.people || {}).filter(p => p);
}

function childrenOf(S) {
  const ids = S?.relations?.childIds || [];
  return ids.map(id => S?.people?.[id]).filter(p => p);
}

function marriedCouples(S) {
  return (S?.marriage?.couples || []).filter(c => c && c.stage === 'married');
}

function spouseOf(S, couple) {
  if (!couple || !Array.isArray(couple.partners)) return null;
  const id = couple.partners.find(p => p !== 'player');
  return (id && S?.people?.[id]) || null;
}

/* Years since this couple married, from the stage history (the couple
   record's own dates). Falls back to stageSince; null when neither exists. */
function marriedYears(S, couple) {
  const hist = Array.isArray(couple.stageHistory) ? couple.stageHistory : [];
  const entry = [...hist].reverse().find(h => h && h.stage === 'married')
    || (couple.stageSince && couple.stage === 'married' ? couple.stageSince : null);
  if (!entry || entry.year == null) return null;
  const m = Number(entry.month || 1);
  return (Number(S.year) - Number(entry.year)) + ((Number(S.month || 1) - m) / 12);
}

function netWorthInEgp(S) {
  try {
    return convertCurrency(computeNetWorthLocal(S), S.country, 'egy', S.year);
  } catch (_) {
    return computeNetWorthLocal(S);
  }
}

function isTopOfTrack(S) {
  const job = S?.career?.job;
  if (!job || !job.track) return false;
  try {
    const tracks = getMergedCareerTracks(S.year);
    const track = tracks && tracks[job.track];
    if (!track || !Array.isArray(track.rungs) || track.rungs.length === 0) return false;
    const top = Math.max(...track.rungs.map(r => Number(r.level) || 0));
    return (Number(job.level) || 0) >= top;
  } catch (_) {
    return false;
  }
}

function monthIdx(year, month) {
  return Math.floor(Number(year) || 0) * 12 + Math.floor(Number(month) || 1);
}

function isEmployed(S) {
  return !!S?.career?.job;
}

/* Trip ledger lines are the only lasting record of travel: walletMove
   writes `Trip: <destination name>` for every vacation and pilgrimage,
   and ALL_VACATIONS names are unique (102 names, 102 distinct), so a
   name maps back to its country. */
let TRIP_COUNTRY_BY_NAME = null;
function tripCountryByName() {
  if (!TRIP_COUNTRY_BY_NAME) {
    TRIP_COUNTRY_BY_NAME = new Map(
      (ALL_VACATIONS || []).map(v => [v && v.name, v && v.country]).filter(([n, c]) => n && c)
    );
  }
  return TRIP_COUNTRY_BY_NAME;
}

/* Travel bookkeeping (v2.16 W2): every evaluation, fold the trip lines
   still visible in the ledger into the persistent visited list — the
   ledger keeps only its last 400 lines, so a trip that scrolls off
   must already have been counted. Residence counts too: the player has
   been in every country they lived in, starting with the one they were
   born in. A trip to the home country while living abroad is a visit
   home. Runs before the condition loop, so the conditions below read
   fresh state. */
function scanTravel(S, progress) {
  if (S?.homeCountry && !progress._visitedCountries.includes(S.homeCountry)) {
    progress._visitedCountries.push(S.homeCountry);
  }
  if (S?.country && !progress._visitedCountries.includes(S.country)) {
    progress._visitedCountries.push(S.country);
  }
  /* Lived abroad, remembered for Returned Home. */
  if (S?.country && S?.homeCountry && S.country !== S.homeCountry) progress._livedAbroad = true;
  const ledger = Array.isArray(S?.ledger) ? S.ledger : [];
  const byName = tripCountryByName();
  for (const entry of ledger) {
    if (!entry || entry.id == null || progress._tripsSeen.includes(entry.id)) continue;
    const label = String(entry.label || '');
    if (!label.startsWith('Trip: ')) continue;
    progress._tripsSeen.push(entry.id);
    const destCountry = byName.get(label.slice('Trip: '.length));
    if (!destCountry) continue;
    if (!progress._visitedCountries.includes(destCountry)) progress._visitedCountries.push(destCountry);
    if (destCountry === S?.homeCountry && S?.country && S.country !== S.homeCountry) {
      progress._visitedHomeWhileAbroad = true;
    }
  }
}

/* Recession survival (v2.16 W2): a world event is a crisis for the
   player when it hit their country with businesses earning less
   (businessRevenue < 1 in the history entry tickWorldEvents wrote at
   fire time — a boom, e.g. the 1973 oil shock in Saudi/UAE, is not a
   crisis for the player there). Surviving it means being employed
   while it ran and still employed when it ended. Two proofs, either
   is enough:
   (a) sampled: every evaluation while the crisis ran saw the player
       employed (_crisisEmployed[eventId] === true — one observed
       jobless month flips it to 'broke' and it stays broke);
   (b) tenure: the job held now started before the crisis started
       (monthsInRole resets to 0 on every new job, so a tenure that
       reaches back past the crisis start means the same job all
       along). (b) also covers a crisis that fired and ended between
       two evaluations (e.g. inside one 12-month fast-forward), where
       no evaluation ever saw it active.
   Once a crisis has ended the verdict is settled ('done') — a player
   jobless at the end does not earn it by finding work later. */
function scanCrisisSurvival(S, progress) {
  const history = Array.isArray(S?.worldEvents?.history) ? S.worldEvents.history : [];
  const now = monthIdx(S?.year, S?.month);
  const employed = isEmployed(S);
  for (const h of history) {
    if (!h || !h.eventId) continue;
    if (!((Number(h.businessRevenue) || 1) < 1)) continue; /* not a crisis here */
    const start = monthIdx(h.startYear, h.startMonth);
    const end = monthIdx(h.endYear, h.endMonth);
    const mark = progress._crisisEmployed[h.eventId];
    if (now <= end) {
      /* Crisis still running: sample employment. */
      if (employed && mark !== 'broke') progress._crisisEmployed[h.eventId] = true;
      else if (!employed) progress._crisisEmployed[h.eventId] = 'broke';
      continue;
    }
    if (mark === 'done') continue;
    if (employed) {
      const jobStart = now - (Number(S.career.job.monthsInRole) || 0);
      const tenureSpans = jobStart <= start;
      if (mark === true || tenureSpans) grant(S, progress, 'survived_recession');
    }
    progress._crisisEmployed[h.eventId] = 'done';
  }
}

/* --- one condition per achievement id. null = handled by a dedicated
   scan below (business_sold_profit, survived_recession), never by a
   guess. --- */

const CONDITIONS = {
  first_job: S => !!S?.career?.job,
  first_promotion: S => (Number(S?.career?.job?.level) || 1) >= 2,
  first_car: S => (S?.cars || []).length > 0,
  first_home: S => (S?.housing?.properties || []).length > 0,
  married: S => marriedCouples(S).length > 0,
  first_child: S => (S?.relations?.childIds || []).length > 0,
  three_children: S => (S?.relations?.childIds || []).length >= 3,
  first_million: S => netWorthInEgp(S) >= 1000000,
  ten_million: S => netWorthInEgp(S) >= 10000000,
  bought_apartment_egy: S => (S?.housing?.properties || []).some(p => p && p.country === 'egy'),
  /* v2.16 W2 — lived abroad once (tracked in scanTravel) and back home now. */
  returned_home: S => !!S?.progress?._livedAbroad && !!S?.country && !!S?.homeCountry && S.country === S.homeCountry,
  gold_stash: S => (Number(S?.money?.goldGrams21k) || 0) >= 50,
  gone_abroad: S => !!S?.country && !!S?.homeCountry && S.country !== S.homeCountry,
  worked_in_gulf: S => GULF_COUNTRIES.includes(S?.country) && !!S?.career?.job,
  second_passport: S => (S?.legal?.citizenships || []).length > 1,
  business_owner: S => (S?.career?.businesses || []).some(b => b
    && (Number(b.monthlyRev) || 0) > (Number(b.monthlyCost) || 0)),
  /* v2.16 W2 — 10 distinct countries lived in or travelled to (scanTravel). */
  ten_countries: S => (S?.progress?._visitedCountries || []).length >= 10,
  /* v2.16 W2 — 500,000+ EGP sent home to family, lifetime, recorded at
     each send (S.money.remittedHomeEgpTotal). */
  helped_family: S => (Number(S?.money?.remittedHomeEgpTotal) || 0) >= 500000,
  survived_recession: null, /* handled by scanCrisisSurvival() below */
  paid_off_debt: S => !!S?.progress?._hadDebt
    && (S?.money?.loans || []).length === 0
    && (S?.money?.creditCards || []).every(c => (Number(c?.balance) || 0) <= 0)
    && (S?.bnplPlans || []).length === 0,
  expat_5_years: S => S?.country !== S?.homeCountry
    && (Number(S?.legal?.residency?.yearsInCountryLegally) || 0) >= 5,
  expat_10_years: S => S?.country !== S?.homeCountry
    && (Number(S?.legal?.residency?.yearsInCountryLegally) || 0) >= 10,
  bought_gold: S => (Number(S?.money?.goldGrams21k) || 0) > 0,
  /* v2.16 W2 — a trip to the home country while living abroad (scanTravel). */
  returned_visit: S => !!S?.progress?._visitedHomeWhileAbroad,
  career_top: S => isTopOfTrack(S),
  /* v2.13 — the five new achievements (added to the same V1 table). */
  first_business: S => (S?.career?.businesses || []).length > 0,
  marriage_10_years: S => marriedCouples(S).some(c => {
    const y = marriedYears(S, c);
    return y != null && y >= 10;
  }),
  child_graduating: S => childrenOf(S).some(ch => !!(ch.education && ch.education.degree)),
  business_sold_profit: null, /* handled by scanBusinessSales() below */
  goal_completed: S => (S?.goals || []).some(g => g && g.done && g.doneAge != null && g.doneAge >= 1)
  /* A goal completed at age 0 is birth circumstance, not an achievement:
     g_family completes on the first advance because a newborn's family
     already counts as a trusted circle. refreshGoalsProgress stamps
     doneAge on the transition; a goal done with no stamp (old save) is
     never guessed — the milestone stays unearned. */
};

export function achievementConditionMet(S, id) {
  const fn = CONDITIONS[id];
  if (typeof fn !== 'function') return false;
  try {
    return !!fn(S);
  } catch (_) {
    return false;
  }
}

/* --- progress state --- */

export function ensureProgress(S) {
  if (!S) return null;
  if (!S.progress || typeof S.progress !== 'object') {
    S.progress = { level: 1, xp: 0, achievements: [] };
  }
  if (!Array.isArray(S.progress.achievements)) S.progress.achievements = [];
  if (!S.progress._bizCapital || typeof S.progress._bizCapital !== 'object') S.progress._bizCapital = {};
  if (!Array.isArray(S.progress._salesSeen)) S.progress._salesSeen = [];
  if (typeof S.progress._hadDebt !== 'boolean') S.progress._hadDebt = false;
  /* v2.16 W2 travel / crisis bookkeeping (see header). */
  if (typeof S.progress._livedAbroad !== 'boolean') S.progress._livedAbroad = false;
  if (!Array.isArray(S.progress._visitedCountries)) S.progress._visitedCountries = [];
  if (!Array.isArray(S.progress._tripsSeen)) S.progress._tripsSeen = [];
  if (typeof S.progress._visitedHomeWhileAbroad !== 'boolean') S.progress._visitedHomeWhileAbroad = false;
  if (!S.progress._crisisEmployed || typeof S.progress._crisisEmployed !== 'object') S.progress._crisisEmployed = {};
  return S.progress;
}

function totalXp(achievements) {
  return (achievements || []).reduce((sum, a) => sum + xpForAchievement(a && a.id), 0);
}

function grant(S, progress, id) {
  const def = achievementById(id);
  if (!def) return false;
  if (progress.achievements.some(a => a && a.id === id)) return false;
  progress.achievements.push({ id, year: S.year, month: S.month });
  try {
    recordJournal(S, `Milestone — ${def.label}: ${def.desc}`, 'milestone');
  } catch (_) {}
  return true;
}

/* A business sale is recorded by sellBusiness ONLY as a ledger line:
   "Exited & sold <name>", category "business", delta = sale price.
   This scan matches each unprocessed sale line against the capital the
   business had when this engine last saw it alive. If the price beat the
   capital invested, the sale was at a profit. If the business was never
   seen alive by an evaluation before it was sold, its capital is unknown
   and no achievement is granted — never granted on a guess. */
function scanBusinessSales(S, progress) {
  const ledger = Array.isArray(S?.ledger) ? S.ledger : [];
  for (const entry of ledger) {
    if (!entry || entry.id == null || progress._salesSeen.includes(entry.id)) continue;
    const label = String(entry.label || '');
    if (entry.category !== 'business' || !label.startsWith('Exited & sold ')) continue;
    progress._salesSeen.push(entry.id);
    const name = label.slice('Exited & sold '.length).trim();
    /* The sale line may carry a suffix such as ", after unpaid bills": match the business by its name at the start of the line. */
    const seen = Object.values(progress._bizCapital).find(v => v && v.name && (name === v.name || name.startsWith(v.name + ',')));
    const capital = seen ? Number(seen.capital) || 0 : null;
    const price = Number(entry.delta) || 0;
    if (capital != null && price > capital) grant(S, progress, 'business_sold_profit');
  }
}

/* Evaluate every achievement against real state. Idempotent; grants use
   the CURRENT year/month (backfill is dated to when it was first noticed,
   never a fake past date). Returns the progress record. */
export function evaluateProgress(S) {
  if (!S) return null;
  const progress = ensureProgress(S);
  const businesses = S?.career?.businesses || [];

  /* Remember having had debt, before checking "Debt Free". */
  const hasDebtNow = (S?.money?.loans || []).length > 0
    || (S?.money?.creditCards || []).some(c => (Number(c?.balance) || 0) > 0)
    || (S?.bnplPlans || []).length > 0;
  if (hasDebtNow) progress._hadDebt = true;

  /* Snapshot live businesses' capital BEFORE any sale check. */
  for (const biz of businesses) {
    if (biz && biz.id) {
      progress._bizCapital[biz.id] = {
        capital: Number(biz.capitalInvested) || 0,
        name: biz.name || ''
      };
    }
  }

  /* Travel bookkeeping first: the ten-countries / home-visit / return-
     home conditions below read what this scan just recorded. */
  scanTravel(S, progress);

  for (const def of V1_ACHIEVEMENTS) {
    if (!def || !def.id) continue;
    if (progress.achievements.some(a => a && a.id === def.id)) continue;
    if (achievementConditionMet(S, def.id)) grant(S, progress, def.id);
  }
  scanBusinessSales(S, progress);
  scanCrisisSurvival(S, progress);

  progress.xp = totalXp(progress.achievements);
  progress.level = levelForXp(progress.xp);
  return progress;
}

/* Read-only view for the panel: level, XP, progress to next level, the
   nearest unearned achievement (in table order) with what would earn it,
   and the earned list with dates. */
export function getProgress(S) {
  const progress = ensureProgress(S);
  const xp = totalXp(progress.achievements);
  const level = levelForXp(xp);
  const earned = progress.achievements
    .map(a => ({ ...(achievementById(a.id) || { id: a.id, label: a.id, desc: '' }), year: a.year, month: a.month, xp: xpForAchievement(a.id) }))
    .sort((a, b) => (a.year - b.year) || (a.month - b.month));
  const nextDef = (V1_ACHIEVEMENTS || []).find(d => d && d.id
    && !progress.achievements.some(a => a && a.id === d.id));
  return {
    level,
    xp,
    xpToNext: xpToNextLevel(xp),
    levelBase: LEVEL_THRESHOLDS[level - 1],
    nextThreshold: level >= MAX_LEVEL ? null : LEVEL_THRESHOLDS[level],
    earned,
    total: (V1_ACHIEVEMENTS || []).length,
    next: nextDef ? {
      id: nextDef.id, label: nextDef.label, desc: nextDef.desc,
      icon: nextDef.icon || '', xp: xpForAchievement(nextDef.id)
    } : null
  };
}

/* ============================================================================
   Stakes dashboard — REAL stakes only, drawn from the real records.
   Each stake: { section, title, detail, consequence }. Empty list means
   nothing is at risk. Consequence wording comes from the game's real
   rules (debt chain: miss 1 = late fee + credit-score hit, miss 2 =
   warning, miss 3 = repossession / foreclosure / business closure).
   ========================================================================== */

const DEBT_CHAIN = 'Miss one payment and there is a late fee and your credit score drops. Miss twice and the bank warns you. Miss three times and the bank can repossess what the loan bought — or foreclose on a home.';
const BUSINESS_CLOSURE = 'A business that keeps missing payments is closed after 3 missed payments and sold off for half of what you put into it.';

export function computeStakes(S) {
  const stakes = [];
  if (!S) return stakes;
  const moneyFmt = (n) => {
    try { return formatMoney(n, S.country); } catch (_) { return String(n); }
  };

  /* Money: open loans. */
  for (const loan of (S.money?.loans || [])) {
    const balance = Number(loan?.balance) || 0;
    if (!loan || balance <= 0) continue;
    const missed = Number(loan.missedMonths) || 0;
    stakes.push({
      section: 'Money',
      title: `${loan.label || 'Loan'} — ${moneyFmt(balance)} still owed`,
      detail: `Monthly payment ${moneyFmt(Number(loan.monthlyPayment) || 0)}${missed > 0 ? ` — already missed ${missed} payment${missed > 1 ? 's' : ''}` : ''}.`,
      consequence: DEBT_CHAIN
    });
  }

  /* Money: a home still being paid off in instalments (a mortgage). */
  for (const prop of (S.housing?.properties || [])) {
    const left = Number(prop?.installmentRemaining) || 0;
    if (!prop || left <= 0) continue;
    const missed = Number(prop.missedMonths) || 0;
    stakes.push({
      section: 'Money',
      title: `${prop.name || 'Your home'} — ${moneyFmt(left)} left to pay`,
      detail: `Still paying it off in instalments${missed > 0 ? ` — already missed ${missed} payment${missed > 1 ? 's' : ''}` : ''}.`,
      consequence: 'Miss one instalment and there is a late fee. Miss twice and you get a warning. Miss three times and the lender can foreclose — the home is sold and any shortfall becomes a loan you still owe.'
    });
  }

  /* Relationships: a strained marriage (affection/trust live on the
     spouse PERSON — the couple record itself carries no affection). */
  for (const couple of marriedCouples(S)) {
    const spouse = spouseOf(S, couple);
    if (!spouse) continue;
    const aff = Number(spouse.rel?.affection ?? 65);
    const trust = Number(spouse.rel?.trust ?? 65);
    if (aff >= 40 && trust >= 40) continue;
    stakes.push({
      section: 'Relationships',
      title: `Your marriage to ${spouse.firstName} is strained (affection ${aff}/100, trust ${trust}/100)`,
      detail: 'A marriage this strained is close to breaking.',
      consequence: 'Left alone, a strained marriage can end in divorce — and divorce divides the house, the money and the children, and can mean child support and spousal support.'
    });
  }

  /* Relationships: a parent in poor health. */
  for (const p of peopleList(S)) {
    if (!p.alive || (p.role !== 'father' && p.role !== 'mother')) continue;
    const health = Number(p.vitals?.health ?? 100);
    if (health >= 50) continue;
    stakes.push({
      section: 'Relationships',
      title: `${p.firstName} (${p.relationLabel || p.role}) is in poor health (${health}/100)`,
      detail: 'A parent whose health is this low needs attention now.',
      consequence: 'Poor health can turn serious fast — they may need hospital care, someone to look after them, and someone to pay for it.'
    });
  }

  /* Relationships: a child in poor health. */
  for (const ch of childrenOf(S)) {
    if (!ch.alive) continue;
    const health = Number(ch.vitals?.health ?? 100);
    if (health >= 50) continue;
    stakes.push({
      section: 'Relationships',
      title: `${ch.firstName} is in poor health (${health}/100)`,
      detail: 'One of your children needs care now.',
      consequence: 'A small health problem left alone can become a big one — get them seen before it gets worse.'
    });
  }

  /* Health: an untreated condition. */
  for (const cond of (S.medical?.conditions || [])) {
    if (!cond || cond.managed) continue;
    stakes.push({
      section: 'Health',
      title: `${cond.label || 'A health condition'} is untreated`,
      detail: `Severity: ${cond.severity || 'unknown'}${cond.sinceYear ? `, since ${cond.sinceYear}` : ''}.`,
      consequence: 'Left untreated it keeps damaging your health every year and can shorten your life. Treatment costs money — without insurance, a serious illness can wipe out your savings.'
    });
  }

  /* Health: a checkup overdue. The game finds illness early through
     checkups; 5+ years without one (counting from age 18 for someone
     who never had one) means illness would be found late. */
  if ((Number(S.player?.age) || 0) >= 18) {
    const last = S.medical?.lastCheckupYear;
    const sinceYear = last != null ? Number(last) : Number(S.player.birthYear) + 18;
    const gap = Number(S.year) - sinceYear;
    if (gap >= 5) {
      stakes.push({
        section: 'Health',
        title: last == null
          ? `No checkup since you turned 18 (${gap} years ago)`
          : `No checkup in ${gap} years (last one ${last})`,
        detail: 'Routine checkups are how illness gets found early.',
        consequence: 'Illness found late is harder and more expensive to treat — a checkup is how the game finds it early.'
      });
    }
  }

  /* Businesses: losing money, or at risk of closure. */
  for (const biz of (S.career?.businesses || [])) {
    if (!biz) continue;
    const losing = Number(biz.monthsLosing) || 0;
    const misses = Number(biz.misses) || 0;
    if (losing <= 0 && misses <= 0) continue;
    const atRisk = losing >= 2 || misses > 0;
    stakes.push({
      section: 'Business',
      title: losing > 0
        ? `${biz.name} has lost money for ${losing} month${losing > 1 ? 's' : ''}${misses > 0 ? ` and missed ${misses} payment${misses > 1 ? 's' : ''}` : ''}`
        : `${biz.name} has missed ${misses} payment${misses > 1 ? 's' : ''}`,
      detail: atRisk ? 'This business is at risk of closing.' : 'Losing money — watch it before the losses pile up.',
      consequence: atRisk ? BUSINESS_CLOSURE : 'If the losses continue, missed payments pile up — and after 3 missed payments the business is closed.'
    });
  }

  return stakes;
}
