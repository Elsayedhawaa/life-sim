import {monthsSinceContact} from './socialEnergy.js';
import {EVENTS_EMPLOYMENT_DISPUTE} from '../data/eventsEmploymentDispute.js';
/* ============================================================================
   World Life 2.0 — v2.5 Random Events Engine (eventEngine.js)
   Gate evaluator + candidate collector + picker for the ~500 new random
   events in src/data/eventsEverydayFamily.js and
   src/data/eventsMoneyHealthCareer.js.

   THE "APPROPRIATE" RULE: an event is only ever offered when it fits the
   player's actual life right now. Every event declares its conditions
   (gates) and this file is the one place that reads them — no hand-checking
   anywhere else. A single life gets no marriage events, a rich life gets
   no bill-struggle events, a graduated adult gets no school events, and
   so on, because the gates say so and the collector enforces them.

   WEALTH BANDS (one formula, used everywhere a wealth gate appears):
   net worth is compared with the country's ANNUAL MID SALARY for the
   current year — eraSalary(annualSalaryTiers2026.mid, country, year),
   the same benchmark refreshGoalsProgress uses for goals. Bands:
     poor   : net worth < 0.5x annual mid salary
     middle : 0.5x – 3x
     rich   : 3x – 15x
     ultra  : > 15x
   The data files also use family-tier words for wealth; they are
   normalised here so both vocabularies work: 'struggling' -> poor,
   'upper_middle' -> rich, 'wealthy' -> ultra. Bill-struggle events gate
   to poor/middle only, so a rich or ultra life can never draw one.

   CHAINS: a follow-up event carries gates.afterEvent (the parent event
   id) and gates.afterEventMinTurns. The delay is measured in CALENDAR
   MONTHS since the parent fired — the data writes delays as months
   (3 = a season later, 12 = a year later), and months stay correct
   across the childhood yearly / adult monthly pacing switch, where a
   bare turn count would turn a 12-month school follow-up into 12 years
   and make it unreachable. Firing positions are recorded in
   S.eventFiredTurns (event id -> { turn, year, month }), created by
   ensureExtendedState in schema.js. A parent that fired before this
   record existed (an older save, visible only in S.sceneCounts) is
   treated as long enough ago — the delay is assumed passed.

   REPEATABLE + COOLDOWNS: a once-per-life event is blocked forever once
   S.sceneCounts holds it (queueScene counts it when it is queued).
   A repeatable event may come back only after its cooldownYears have
   passed; the cooldown is written into S.cooldowns when the event fires
   (see noteRandomLifeEventFired), in turns — 12 turns per year while
   the adult clock runs monthly, 1 turn per year in childhood.

   FREQUENCY: this engine adds NO new roll. The game already rolls once
   per turn (42%/year in childhood, 24%/month in adulthood) inside
   pickCuratedLifeScene; the new pool is drawn from inside that same
   roll, weighted by pool size, so a life still sees roughly 1–3
   pop-ups a year and the total never doubles.

   "Voice" here is living TEXT dialogue, never audio.
   ========================================================================== */

import { chance, rand } from '../core/rng.js';
import { getCountry } from '../data/countries.js';
import { eraSalary } from '../data/economy.js';
import { computeNetWorthLocal, ensureExtendedState } from '../core/schema.js';
import { EVENTS_EVERYDAY_FAMILY } from '../data/eventsEverydayFamily.js';
import { EVENTS_MONEY_HEALTH_CAREER } from '../data/eventsMoneyHealthCareer.js';
import { BUSINESS_EVENTS } from '../data/eventsBusiness.js';
/* v2.11 W3 — business state readers (shared with businessPremises.js,
   the single source of truth; work with the v2.10 single-business
   shape and the v2.11 businesses[] shape alike). */
import { businessesOf, bizStaffCount, bizAgeMonths } from '../systems/businessPremises.js';
/* v2.15 W5 — memory events, thread resolution, NPC memory readers. */
import { EVENTS_LIVED_LIFE } from '../data/eventsLivedLife.js';
import { EVENTS_MEMORY } from '../data/eventsMemory.js';
import {
  buildChainIndex, isChainResolved, resolveThread, closeStaleThreads,
  RECURRING_CHAINS,
} from '../systems/threadResolution.js';
import { EVENTS_MAJOR_FOLLOWUPS } from '../data/eventsMajorFollowups.js';
import { EVENTS_CONSEQUENCES } from '../data/eventsConsequences.js';
import { loanOutstanding } from '../systems/familyLoans.js';
import { findPeopleWithMemory } from '../systems/npcMemory.js';

export const ALL_RANDOM_LIFE_EVENTS = [...EVENTS_EMPLOYMENT_DISPUTE,...EVENTS_EVERYDAY_FAMILY, ...EVENTS_MONEY_HEALTH_CAREER, ...BUSINESS_EVENTS, ...EVENTS_MEMORY, ...EVENTS_LIVED_LIFE, ...EVENTS_MAJOR_FOLLOWUPS, ...EVENTS_CONSEQUENCES];

/* v2.15 W5 — the chain graph for the whole pool: event id -> root id,
   and root id -> { members, terminals }. A resolved chain refuses every
   member (see eventGatePasses). */
export const CHAIN_INDEX = buildChainIndex(ALL_RANDOM_LIFE_EVENTS);

const EVENT_BY_ID = new Map(ALL_RANDOM_LIFE_EVENTS.map((ev) => [ev.id, ev]));

/* The one burnout-titled random event. It is once-per-life, but the
   coherence suite caps burnout-titled scenes at 5 per 68-year life, so
   it is held back once a life has already seen 4 burnout scenes. */
const BURNOUT_EVENT_IDS = ['ev_career_burnout'];
const MAX_BURNOUT_SCENES_PER_LIFE = 4;

/* Family-tier words the data files use for wealth, normalised to bands. */
const WEALTH_WORDS = {
  poor: 'poor',
  middle: 'middle',
  rich: 'rich',
  ultra: 'ultra',
  struggling: 'poor',
  upper_middle: 'rich',
  wealthy: 'ultra',
};

/* --------------------------------------------------------------------------
   Live state derivations — every gate reads live state, never a stale copy.
   -------------------------------------------------------------------------- */

export function wealthBand(S) {
  const cObj = getCountry(S.country);
  const benchmark = eraSalary(cObj.annualSalaryTiers2026.mid, S.country, S.year) || 1;
  const netWorth = computeNetWorthLocal(S);
  const ratio = netWorth / benchmark;
  const band = ratio < 0.5 ? 'poor' : ratio < 3 ? 'middle' : ratio <= 15 ? 'rich' : 'ultra';
  return { band, netWorth, benchmark, ratio };
}

export function relationshipStatus(S) {
  if (S.marriage && typeof S.marriage.status === 'string' && S.marriage.status) {
    return S.marriage.status;
  }
  if ((S.relations.spouseIds || []).length > 0) return 'married';
  if (S.relations.partnerId) return 'dating';
  return 'single';
}

/* School stage in the event files' words: inSchool (primary/middle/high),
   inUni (enrolled at a university), graduated (left school with a
   qualification or a degree), none (too young for school yet). */
export function educationStage(S) {
  const ed = S.education || {};
  if (ed.university || ed.stage === 'university') return 'inUni';
  if (ed.stage === 'primary' || ed.stage === 'middle' || ed.stage === 'high') return 'inSchool';
  if (ed.stage === 'graduated_high' || ed.stage === 'completed' || (ed.degrees || []).length > 0) {
    return 'graduated';
  }
  return 'none';
}

function aliveChildren(S) {
  return (S.relations.childIds || [])
    .map((id) => S.people[id])
    .filter((p) => p && p.alive);
}

function asList(value) {
  if (value === undefined || value === null) return null;
  return Array.isArray(value) ? value : [value];
}

// Declarative cast constraints are shared by selection, stale checks and reload.
// They describe saved facts, not labels guessed from prose.
function personFitsEvent(S,p,rules={}){
 if(!p?.alive)return false;
 if(rules.minAge!==undefined&&p.age<rules.minAge)return false;
 if(rules.maxAge!==undefined&&p.age>rules.maxAge)return false;
 if(rules.sameCountry!==undefined&&(p.residenceCountry===S.country)!==rules.sameCountry)return false;
 if(rules.minMonthsApart!==undefined&&(p.rel?.lastContactUnknown||!Number.isFinite(p.rel?.lastContactYear)||!Number.isFinite(p.rel?.lastContactMonth)||monthsSinceContact(S,p)<rules.minMonthsApart))return false;
 if(rules.retiredWithinYears!==undefined&&!(Number.isFinite(p.career?.retiredYear)&&S.year-p.career.retiredYear>=0&&S.year-p.career.retiredYear<=rules.retiredWithinYears))return false;
 if(rules.maxHealth!==undefined&&(p.vitals?.health??100)>rules.maxHealth)return false;
 return true;
}

/* People for the event text, resolved from live relations exactly the way
   storyLibrary.js does it, so a missing person never crashes the text. */
export function resolveEventCtx(S, event=null) {
  const byId = (id) => (id && S.people[id]) || null;
  const firstAlive = (ids) => (Array.isArray(ids) ? ids.map(byId).find((p) => p && p.alive) : null) || null;
  const kids = aliveChildren(S);
  const ctx = {
    spouse: firstAlive(S.relations.spouseIds) || firstAlive([S.relations.partnerId]),
    mom: firstAlive([S.relations.motherId]),
    dad: firstAlive([S.relations.fatherId]),
    sib: firstAlive(S.relations.siblingIds),
    friend: firstAlive(S.relations.friendIds),
    child: kids[0] || null,
    youngChild: kids.find((p) => p.age <= 8) || null,
    teen: kids.find((p) => p.age >= 13 && p.age <= 19) || null,
    adultChild: kids.find((p) => p.age >= 20) || null,
    boss: (S.career.job && S.career.job.bossId ? byId(S.career.job.bossId) : null),
  };
  const roleIds={spouse:[...(S.relations.spouseIds||[]),S.relations.partnerId],mom:[S.relations.motherId],dad:[S.relations.fatherId],sib:S.relations.siblingIds,friend:S.relations.friendIds,child:S.relations.childIds,youngChild:S.relations.childIds,teen:S.relations.childIds,adultChild:S.relations.childIds,boss:[S.career.job?.bossId]};
  for(const [role,rules]of Object.entries(event?.gates?.people||{}))ctx[role]=(roleIds[role]||[]).map(byId).find(p=>personFitsEvent(S,p,rules))||null;
  const major=event?.gates?.afterMajor;
  if(major?.castRole){const now=S.year*12+S.month;const rec=[...(S.majorEvents||[])].reverse().find(e=>asList(major.kind).includes(e.kind)&&e.personId&&(!major.role||e.facts?.role===major.role)&&now-(e.year*12+e.month)<=(major.maxMonths??999));if(rec)ctx[major.castRole]=byId(rec.personId)?.alive?byId(rec.personId):null;}
  // A continuation belongs to the people in the resolved earlier event,
  // never to whichever sibling/child happens to be first in today's list.
  const parent=event?.gates?.afterEvent;
  const participants=parent&&(S.eventOutcomes?.[parent]?.participants||S.eventPending?.[parent]?.participants);
  if(participants)for(const [role,id]of Object.entries(participants))ctx[role]=byId(id)?.alive?byId(id):null;
  return ctx;
}

/* --------------------------------------------------------------------------
   Gate evaluator — one function, every gate key the data files use.
   -------------------------------------------------------------------------- */

export function eventGatePasses(ev, S, { ignoreHistory = false } = {}) {
  if (!ev || !S) return false;
  const g = ev.gates || {};
  if(g.housingMode&&S.housing?.mode!==g.housingMode)return false;
  if(g.civilLossKind&&!(S.legal?.civilLosses||[]).some(x=>x.kind===g.civilLossKind&&x.status==='open'&&x.country===S.country))return false;

  // Explicit cast requirements apply to roots and follow-ups alike.
  const cast = resolveEventCtx(S,ev);
  if(Object.entries(g.people||{}).some(([role,rules])=>!personFitsEvent(S,cast[role],rules)))return false;
  if ((g.requiredPeople || []).some(role => !cast[role] || !cast[role].alive)) return false;
  if(g.adultChildHome){const child=cast.adultChild;const away=!!child?.leftHome;if(!child||(g.adultChildHome==='away'?!away:away))return false;}
  if (g.hasLivingParent !== undefined) {
    if (!!(cast.mom || cast.dad) !== !!g.hasLivingParent) return false;
  }
  if (g.deceasedParent) {
    const ids = g.deceasedParent === 'dad' ? [S.relations.fatherId]
      : g.deceasedParent === 'mom' ? [S.relations.motherId]
      : [S.relations.fatherId, S.relations.motherId];
    if (!ids.some(id => S.people[id]?.alive === false)) return false;
  }

  const age = S.player.age;
  if (g.minAge !== undefined && age < g.minAge) return false;
  if (g.maxAge !== undefined && age > g.maxAge) return false;

  if (g.minYear !== undefined && S.year < g.minYear) return false;
  if (g.maxYear !== undefined && S.year > g.maxYear) return false;

  const countries = asList(g.countries);
  if (countries && !countries.includes(S.country)) return false;
  const excludeCountries = asList(g.excludeCountries);
  if (excludeCountries && excludeCountries.includes(S.country)) return false;

  if (g.wealth !== undefined) {
    const allowed = asList(g.wealth).map((w) => WEALTH_WORDS[w] || w);
    if (!allowed.includes(wealthBand(S).band)) return false;
  }

  const rel = asList(g.relationship);
  if (rel && !rel.includes(relationshipStatus(S))) return false;

  if (g.hasChildren !== undefined) {
    const has = aliveChildren(S).length > 0;
    if (has !== !!g.hasChildren) return false;
  }
  if (g.minChildren !== undefined && aliveChildren(S).length < g.minChildren) return false;

  if (g.hasJob !== undefined) {
    const has = !!(S.career.employed && S.career.job);
    if (has !== !!g.hasJob) return false;
  }
  if(g.recentPromotionMonths!==undefined){const q=S.career.lastPromotion,j=S.career.job,elapsed=q?S.year*12+S.month-q.at:Infinity;if(!q||elapsed<0||elapsed>g.recentPromotionMonths||!j||q.employer!==j.employer||q.track!==j.track||q.level!==j.level)return false;}
  if(g.minJobPerformance!==undefined&&(!S.career.job||(S.career.job.performance||0)<g.minJobPerformance))return false;
  if (g.hasCar !== undefined) {
    const has = (S.cars || []).length > 0;
    if (has !== !!g.hasCar) return false;
  }
  if (g.housingModes && !g.housingModes.includes(S.housing.mode)) return false;
  if (g.minRent !== undefined && !(Number(S.housing.monthlyRent) >= g.minRent)) return false;
  if (g.hasHome !== undefined) {
    const has = (S.housing.properties || []).length > 0
      || ['rent', 'owned', 'employer_provided'].includes(S.housing.mode);
    if (has !== !!g.hasHome) return false;
  }

  /* v2.11 W3 — business gates. Every one reads the business's ACTUAL
     state right now: a business with no employees cannot lose a key
     employee; a business with no premises cannot have a fire there; a
     tax inspection needs a business old enough to have filed; an
     expansion chance needs a business below its max level. "Max"
     across the player's businesses is used, so any qualifying business
     makes the event eligible — the event itself then picks that one. */
  if (g.hasBusiness !== undefined) {
    const has = businessesOf(S).length > 0;
    if (has !== !!g.hasBusiness) return false;
  }
  if (g.minEmployees !== undefined) {
    const maxStaff = Math.max(0, ...businessesOf(S).map((b) => bizStaffCount(b)));
    if (maxStaff < g.minEmployees) return false;
  }
  if (g.hasPremises !== undefined) {
    const has = businessesOf(S).some((b) => !!b.premises);
    if (has !== !!g.hasPremises) return false;
  }
  if (g.minBusinessAgeMonths !== undefined) {
    const maxAge = Math.max(0, ...businessesOf(S).map((b) => bizAgeMonths(S, b)));
    if (maxAge < g.minBusinessAgeMonths) return false;
  }
  if (g.minRepeatRate !== undefined) {
    const maxRepeat = Math.max(0, ...businessesOf(S).map((b) => Number(b.repeatRate ?? 0)));
    if (maxRepeat < g.minRepeatRate) return false;
  }
  if (g.belowMaxLevel !== undefined) {
    const anyBelow = businessesOf(S).some((b) => (Number(b.level || 1)) < (Number(b.maxLevel || 5)));
    if (anyBelow !== !!g.belowMaxLevel) return false;
  }

  if (g.education !== undefined) {
    const allowed = asList(g.education);
    if (!allowed.includes(educationStage(S))) return false;
  }

  if (g.abroad !== undefined) {
    const abroad = S.country !== S.homeCountry;
    if (abroad !== !!g.abroad) return false;
  }

  if (g.gender !== undefined) {
    const allowed = asList(g.gender);
    if (!allowed.includes(S.player.gender)) return false;
  }

  if (g.autoInsured !== undefined && !!S.insurance?.auto !== !!g.autoInsured) return false;
  if (g.affairStatus) { const sp = cast.spouse, st = sp?.relationshipProgress; if (!st || st.affair?.status !== g.affairStatus || st.stage === 'separated') return false; }
  if (g.afterMajor) {
    const now = S.year * 12 + S.month, m = g.afterMajor;
    const hit = (S.majorEvents || []).some((e) => asList(m.kind).includes(e.kind) && (!m.role || e.facts?.role === m.role) && Object.entries(m.facts || {}).every(([k, v]) => e.facts?.[k] === v) && now - (e.year * 12 + e.month) >= (m.minMonths || 0) && now - (e.year * 12 + e.month) <= (m.maxMonths ?? 999));
    if (!hit) return false;
  }
  if (g.loanOutstanding && !loanOutstanding(S, g.loanOutstanding.event, g.loanOutstanding.minMonths || 0)) return false;

  /* Chains: the parent must have fired, and the delay (in calendar
     months — see the header note) must have passed. */
  if (g.afterEvent) {
    // New events cannot grow a continuation merely from being queued.
    if(S.eventPending?.[g.afterEvent])return false;
    const outcome=S.eventOutcomes?.[g.afterEvent];
    if(g.afterChoices&&(!outcome||!g.afterChoices.includes(outcome.choiceIndex)))return false;
    const fired = outcome || (S.eventFiredTurns || {})[g.afterEvent];
    if (!fired) {
      /* No firing record: an older save may still show the parent in
         sceneCounts, which means it fired long enough ago. Otherwise
         the follow-up is not offered yet. */
      if (!((S.sceneCounts || {})[g.afterEvent] >= 1)) return false;
    } else {
      const firedYear = typeof fired === 'number' ? null : fired.year;
      const firedMonth = typeof fired === 'number' ? null : fired.month;
      let elapsedMonths;
      if (firedYear === null || firedYear === undefined) {
        /* Turn-only record (should not happen for new fires): turns are
           months while the adult clock runs monthly. */
        elapsedMonths = S.turn - fired.turn;
      } else {
        elapsedMonths = (S.year - firedYear) * 12 + (S.month - firedMonth);
      }
      if (elapsedMonths < (g.afterEventMinTurns || 0)) return false;
    }
  }

  /* v2.15 W5 — a resolved thread never re-queues: every member of a
     resolved chain is refused, including the root (so a finished story
     cannot start over) and the other branch of a forked chain. */
  const chainId = CHAIN_INDEX.chainOf.get(ev.id);
  if (chainId && !RECURRING_CHAINS.includes(chainId) && isChainResolved(S, chainId)) return false;

  /* v2.15 W5 — notAfterEvent: mutually exclusive branches. A follow-up
     is refused when the named event already fired (the dad-loan chain:
     the "unpaid" branch cannot fire after the "repaid" branch did). */
  if (g.notAfterEvent) {
    if ((S.eventFiredTurns || {})[g.notAfterEvent]) return false;
    if ((S.sceneCounts || {})[g.notAfterEvent] >= 1) return false;
  }

  /* v2.15 W5 — memory gates: the event is offered only when someone in
     the player's circle remembers something of the named kind. */
  if (g.memoryKind !== undefined) {
    const kinds = Array.isArray(g.memoryKind) ? g.memoryKind : [g.memoryKind];
    if (findPeopleWithMemory(S, kinds).length === 0) return false;
  }

  /* v2.15 W5 — a living friend in the player's circle. */
  if (g.hasFriend !== undefined) {
    const has = (S.relations.friendIds || []).some((id) => S.people[id] && S.people[id].alive);
    if (has !== !!g.hasFriend) return false;
  }

  if (ignoreHistory) return true;

  /* Repeatability: once-per-life events never repeat; repeatable ones
     wait out their cooldown in S.cooldowns. */
  const seen = (S.sceneCounts || {})[ev.id] || 0;
  if (!ev.repeatable && seen >= 1) return false;
  if (ev.repeatable && S.cooldowns && S.cooldowns[ev.id] && S.turn < S.cooldowns[ev.id]) return false;

  /* Burnout spam guard (coherence cap: at most 5 burnout-titled scenes
     in a 68-year life; the random pool holds one, once per life). */
  if (BURNOUT_EVENT_IDS.includes(ev.id)) {
    let burnoutSeen = 0;
    for (const [key, count] of Object.entries(S.sceneCounts || {})) {
      if (/burnout/i.test(key)) burnoutSeen += count;
    }
    if (burnoutSeen >= MAX_BURNOUT_SCENES_PER_LIFE) return false;
  }

  return true;
}

/* --------------------------------------------------------------------------
   Collector + picker.
   -------------------------------------------------------------------------- */

export function collectRandomLifeEvents(S) {
  if (!S) return [];
  ensureExtendedState(S);
  /* v2.15 W5 — close threads whose follow-up was due but never became
     playable for 36 months, so no chain hangs open forever with no
     ending. Runs before the pool is filtered, so a thread closed here
     is already refused below. */
  try {
    closeStaleThreads(S, CHAIN_INDEX, (id) => {
      const ev = EVENT_BY_ID.get(id);
      return ev ? eventGatePasses(ev, S) : false;
    });
  } catch (_) {}
  return ALL_RANDOM_LIFE_EVENTS.filter((ev) => eventGatePasses(ev, S));
}

export function getRandomLifeEventById(id) {
  return EVENT_BY_ID.get(id) || null;
}

// An inspectable calculation, not a language-model guess from scene words.
export function eventRelevance(S,ev){
 const g=ev.gates||{},evidence=[];let score=1;
 const outcome=g.afterEvent&&S.eventOutcomes?.[g.afterEvent];
 if(outcome){score+=16;evidence.push({kind:'resolved_event',eventId:g.afterEvent,choiceIndex:outcome.choiceIndex,year:outcome.year,month:outcome.month,participants:outcome.participants});}
 if(g.afterMajor){score+=16;evidence.push({kind:'major_event',major:g.afterMajor.kind});}
 if(g.memoryKind){score+=6;evidence.push({kind:'memory',kinds:asList(g.memoryKind)});}
 const facts=['civilLossKind','adultChildHome','housingMode','deceasedParent','hasDebt','hasBusiness','hasCar','abroad','employment','education','people','recentPromotionMonths','minJobPerformance','loanOutstanding','afterMajor','autoInsured','affairStatus'].filter(k=>g[k]!==undefined);
 if(facts.length){score+=Math.min(6,facts.length*2);evidence.push({kind:'current_state',gates:Object.fromEntries(facts.map(k=>[k,g[k]]))});}
 const recent=(S.eventHistory||[]).slice(-4);const same=recent.filter(r=>EVENT_BY_ID.get(r.eventId)?.category===ev.category).length;
 score/=1+same*1.5;
 return{score,evidence};
}

/* Build one eligible event into a playable scene (the shape queueScene
   expects). Returns null if nothing is eligible or the build fails. */
export function pickRandomLifeEvent(S) {
  const eligible = collectRandomLifeEvents(S);
  if (!eligible.length) return null;
  // Rank by recorded cause before catalogue volume. Broad demographic fit
  // remains background variety, not evidence that something happened.
  const ranked=eligible.map(ev=>({ev,...eventRelevance(S,ev)}));
  const causal=ranked.filter(x=>x.evidence.some(e=>e.kind==='resolved_event'||e.kind==='major_event'));
  const pools=causal.length&&chance(S,.85)?[causal,ranked.filter(x=>!causal.includes(x))]:[ranked];
  /* A build reads live people and era prices; if one event's build
     throws, try a few others rather than losing the whole roll. */
  for (const pool of pools) {
    const remaining = [...pool];
    for (let attempt = 0; attempt < 5 && remaining.length; attempt++) {
      const total=remaining.reduce((n,x)=>n+x.score,0);let draw=rand(S)*total;
      let candidate=remaining[remaining.length-1];for(const item of remaining){draw-=item.score;if(draw<0){candidate=item;break;}}
      const ev=candidate.ev;remaining.splice(remaining.indexOf(candidate),1);
      let scene = null;
      const buildRngState = S.rngState;
      try {
        scene = ev.build(S, resolveEventCtx(S,ev));
      } catch (_) {
        scene = null;
      }
      if (!scene || !scene.title || !Array.isArray(scene.choices) || !scene.choices.length) continue;
      return prepareRandomLifeScene(S, ev, scene, resolveEventCtx(S,ev), buildRngState);
    }
  }
  return null;
}

/* Call after queueScene accepts a scene this engine picked: records the
   firing (so chains can follow it) and starts a repeatable event's
   cooldown. Turns are months on the adult clock and years in childhood,
   so cooldownYears converts by pacing. */
export function noteRandomLifeEventFired(S, scene) {
  if (!S || !scene || !scene.eventId) return;
  ensureExtendedState(S);
  S.eventPending??={};S.eventPending[scene.eventId]={participants:{...scene.eventParticipantIds},at:S.year*12+S.month};
  S.eventFiredTurns[scene.eventId] = { turn: S.turn, year: S.year, month: S.month };
  const ev = EVENT_BY_ID.get(scene.eventId);
  if (ev && ev.repeatable) {
    const years = Number(ev.cooldownYears) || 3;
    const turnsPerYear = S.pacing === 'monthly' ? 12 : 1;
    S.cooldowns[scene.eventId] = S.turn + years * turnsPerYear;
  }
  /* v2.15 W5 — a firing can strand an older thread (its follow-up's
     gates may now never pass), so sweep for threads that have faded. */
  try {
    closeStaleThreads(S, CHAIN_INDEX, (id) => {
      const e2 = EVENT_BY_ID.get(id);
      return e2 ? eventGatePasses(e2, S) : false;
    });
  } catch (_) {}
}

// Queued scenes can outlive their cast while the world keeps ticking.
export function isRandomLifeSceneCurrent(scene, S) {
  const event = scene?.eventId ? EVENT_BY_ID.get(scene.eventId) : null;
  if (!event) return true;
  const current = resolveEventCtx(S,event);
  if (Object.entries(scene.eventParticipantIds || {}).some(([role, id]) =>
    !S.people[id]?.alive || current[role]?.id !== id)) return false;
  return eventGatePasses(event, S, { ignoreHistory: true });
}

function prepareRandomLifeScene(S, ev, scene, ctx, buildRngState, savedResolutionKey=null) {
      scene.key = ev.id;
      scene.baseId = ev.id;
      scene.people = scenePeopleLabels(scene, ctx);
      scene.eventId = ev.id;
      scene.eventBuildRngState = buildRngState;
      scene.eventRelevance=eventRelevance(S,ev);
      scene.eventParticipantIds = Object.fromEntries(
        (ev.gates?.requiredPeople || []).map(role => [role, ctx[role]?.id]).filter(([, id]) => id)
      );
      /* v2.15 W5 — thread bookkeeping on the scene. A terminal event
         (one with no follow-up of its own) closes its chain the moment
         the player picks a choice: the choice label is the ending, in
         plain words. The chain's person is the first circle person in
         the scene context, so the resolution record names who it was
         about. */
      const evChainId = CHAIN_INDEX.chainOf.get(ev.id);
      if (evChainId) {
        scene.chainId = evChainId;
        const chainPerson = (ev.gates?.requiredPeople||[]).map(role=>ctx[role]).find(Boolean)||null;
        scene.chainPersonId = chainPerson ? chainPerson.id : null;
        const isTerminal = !(CHAIN_INDEX.children.get(ev.id) || []).length;
        if (isTerminal) {
          scene.choices = scene.choices.map((ch) => {
            const origEffect = ch.effect;
            return {
              ...ch,
              effect: (st) => {
                if (typeof origEffect === 'function') origEffect(st);
                const lbl = typeof ch.label === 'function' ? ch.label(st) : ch.label;
                resolveThread(st, evChainId, {
                  how: 'choice',
                  outcome: `You chose: ${lbl}.`,
                  lastEventId: ev.id,
                  personId: scene.chainPersonId,
                });
              },
            };
          });
        }
      }
      const resolutionKey=savedResolutionKey||`${ev.id}:${S.year}:${S.month}:${S.turn}:${buildRngState}`;
      scene.eventResolutionKey=resolutionKey;
      scene.choices=scene.choices.map((choice,choiceIndex)=>{
        const effect=choice.effect;
        return {...choice,effect:st=>{
          if(st.eventOutcomes?.[ev.id]?.resolutionKey===resolutionKey)return;
          const available=choice.available;
          if(typeof available==='function'&&!available(st))return;
          const before=Number(st.money?.cash)||0;
          const result=typeof effect==='function'?effect(st):undefined;
          if(result?.ok===false)return result;
          const label=typeof choice.label==='function'?choice.label(st):choice.label;
          const record={eventId:ev.id,resolutionKey,year:st.year,month:st.month,turn:st.turn,choiceIndex,choiceLabel:label,participants:{...scene.eventParticipantIds},cashDelta:(Number(st.money?.cash)||0)-before};
          st.eventOutcomes??={};st.eventOutcomes[ev.id]=record;
          st.eventHistory??=[];st.eventHistory.push(record);if(st.eventHistory.length>240)st.eventHistory.splice(0,st.eventHistory.length-240);
          if(st.eventPending)delete st.eventPending[ev.id];
          return result;
        }};
      });
      /* queueScene defaults to 2 per life; repeatable events need room
         to come back after their cooldown, once-per-life events need 1. */
      scene.maxPerLife = ev.repeatable ? 99 : 1;
      return scene;
}

// JSON saves cannot store effect functions. Restore from trusted game code,
// never evaluate text from a save, and do not consume a fresh random draw.
export function restoreRandomLifeScene(S, saved) {
  const ev = saved?.eventId ? EVENT_BY_ID.get(saved.eventId) : null;
  if (!ev || !isRandomLifeSceneCurrent(saved, S)) return null;
  const rngNow = S.rngState;
  try {
    if (saved.eventBuildRngState !== undefined) S.rngState = saved.eventBuildRngState;
    const ctx = resolveEventCtx(S,ev);
    const scene = ev.build(S, ctx);
    if (!scene?.choices?.length) return null;
    const restored = prepareRandomLifeScene(S, ev, scene, ctx, saved.eventBuildRngState,saved.eventResolutionKey);
    for (const key of ['urgent', 'createdTurn', 'createdYear', 'eventParticipantIds']) {
      if (saved[key] !== undefined) restored[key] = saved[key];
    }
    return restored;
  } catch (_) { return null; }
  finally { S.rngState = rngNow; }
}


/* Who is who. Names in event text are real people from the character's
   circle; this lists each one that the scene names with their relationship
   so the player never has to guess. Built from the resolved cast only. */
const CAST_LABEL = {
  mom: () => 'your mother', dad: () => 'your father',
  sib: (p) => (p.gender === 'f' ? 'your sister' : p.gender === 'm' ? 'your brother' : 'your sibling'),
  spouse: (p) => (p.gender === 'f' ? 'your wife' : p.gender === 'm' ? 'your husband' : 'your spouse'),
  child: (p) => (p.gender === 'f' ? 'your daughter' : p.gender === 'm' ? 'your son' : 'your child'),
  youngChild: (p) => (p.gender === 'f' ? 'your daughter' : 'your son'),
  teen: (p) => (p.gender === 'f' ? 'your daughter' : 'your son'),
  adultChild: (p) => (p.gender === 'f' ? 'your daughter' : 'your son'),
  friend: () => 'your friend', boss: () => 'your boss',
};
export function scenePeopleLabels(scene, ctx) {
  const text = `${scene?.title || ''} ${scene?.text || ''}`;
  const out = [], seen = new Set();
  for (const [role, label] of Object.entries(CAST_LABEL)) {
    const p = ctx?.[role];
    if (!p || !p.firstName || seen.has(p.id)) continue;
    const esc = p.firstName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (!new RegExp(`(^|[^\\p{L}])${esc}([^\\p{L}]|$)`, 'u').test(text)) continue;
    seen.add(p.id);
    out.push({ name: p.firstName, label: label(p) });
  }
  return out;
}
