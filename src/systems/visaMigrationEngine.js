import {closePlayerLease} from './playerTenancy.js';
import {endTenancy} from './propertyLandlord.js';
import{recordCivilLoss}from './civilClaims.js';
import {studyAbroadQuote,studyAwardKey,abroadLanguageReady} from './studyAbroadPlanning.js';
import {chargeFamilyEducation} from './educationFunding.js';
/* ============================================================================
   World Life 2.0 — Passports, Visas, Study Abroad, Gulf Kafala & Migration
   Enforces passport validity, military travel clearance, debt travel bans,
   Sperrkonto/CAS/I-20/GIC rules, Gulf Iqama sponsorship, spouse consent, & PR.
   ========================================================================== */

import { rand, randInt, pick, chance, clamp } from '../core/rng.js';
import { recordJournal, walletMove, moveBalance, queueScene, createPerson, getCoupleForSpouse, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { convertCurrency, eraSalary, eraLocalCost } from '../data/economy.js';
import { getUniversitiesFor, getEmployersFor, CAREER_TRACKS } from '../data/institutions.js';
import {
  GULF_SPONSOR_ARCHETYPES,
  GULF_ENTRY_CHANNELS,
  STUDY_ABROAD_PIPELINES,
  SKILLED_MIGRATION_RULES
} from '../data/visasAndMarriage.js';
import { convertFinancesOnCountryMove } from './economyEngine.js';
import { enrollInUniversity, findRealJobForPerson } from './careerEducationEngine.js';
import { getBusinesses, buildRelocationBusinessChoices, applyRelocationBusinessDecision, restoreBusinessLocal, convertBusinessFiguresCurrency } from './businessLegacy.js';
import { emitFact, spawnWorkplaceCast, rememberDeed } from './soulEngine.js';

export function hasValidPassport(S) {
  return S.legal.passports.some(p => S.legal.citizenships.includes(p.country)&&p.expiresYear > S.year);
}

export function renewPassport(S, countryId = null) {
  const target = countryId || S.legal.passports[0]?.country || S.homeCountry;
  if (!S.legal.citizenships.includes(target)) return { ok: false, msg: 'Not a citizen of that country.' };

  if (target === 'egy' && !S.legal.military.travelPermitted) {
    return { ok: false, msg: 'Active military conscription blocks full passport renewal until discharge.' };
  }

  const cObj = getCountry(target);
  const feeLocal = Math.round(convertCurrency(145, 'usa', S.country, S.year));
  if (S.money.cash < feeLocal) return { ok: false, msg: `Need ${formatMoney(feeLocal, S.country)} for passport renewal fees.` };

  walletMove(S, -feeLocal, `Renewed ${cObj.adjective} passport`, 'visa');
  const existing = S.legal.passports.find(p => p.country === target);
  const validYrs = cObj.passportValidityYears || 10;
  if (existing) {
    existing.issuedYear = S.year;
    existing.expiresYear = S.year + validYrs;
  } else {
    S.legal.passports.push({ country: target, issuedYear: S.year, expiresYear: S.year + validYrs });
  }

  recordJournal(
    S,
    `Renewed your ${cObj.adjective} passport${S.country !== target ? ` through the ${cObj.adjective} Consulate` : ''}, valid until ${S.year + validYrs}.`,
    'visa'
  );
  return { ok: true, msg: `Passport renewed until ${S.year + validYrs}!` };
}

export function checkCanCrossBorder(S) {
  if(S.pendingRelocation)return {ok:false,reason:'Finish the existing business relocation decisions before starting another departure.'};
  if (S.player.age < 18) return { ok: false, reason: 'Minors cannot migrate independently until age 18.' };
  if (!hasValidPassport(S)) return { ok: false, reason: 'Your passport is expired — renew it on the Passport & World screen first.' };
  if (!S.legal.military.travelPermitted) {
    return { ok: false, reason: 'Military travel clearance is blocked while on active duty.' };
  }
  if (S.legal.travelBanInCountry === S.country) {
    return { ok: false, reason: `Court debt travel ban in ${getCountry(S.country).name} blocks airport departure until arrears are cleared.` };
  }
  if (
    S.country === 'sau' &&
    S.legal.residency.kind === 'gulf_iqama' &&
    S.legal.residency.sponsorArchetype
  ) {
    const arch = GULF_SPONSOR_ARCHETYPES[S.legal.residency.sponsorArchetype];
    if (arch && arch.withholdsPassport && chance(S, 0.35)) {
      return { ok: false, reason: `Your kafeel (${S.legal.residency.sponsorName}) stalled your Exit/Re-Entry permit on Absher.` };
    }
  }
  return { ok: true };
}

/* ============================================================================
   ONE VISA STATE MACHINE (D6/D7/D8): transitionResidency is the ONLY function
   allowed to assign `S.legal.residency.kind`. Every route — work, study,
   golden, family, Chancenkarte, talent — goes through it. It validates the
   move against a transition table, journals it once, and derives the
   Gulf no-PR note from the data (SKILLED_MIGRATION_RULES prYears == null).
   opts: permitName, sponsorName, sponsorArchetype, expiresYear, expiresMonth,
   familySponsored, graceMonthsLeft, resetYears, silent.
   ============================================================================ */
const RESIDENCY_KINDS = ['citizen', 'work_visa', 'student_visa', 'post_study_work', 'gulf_iqama', 'golden_visa', 'permanent_resident', 'grace_period', 'undocumented'];

export function transitionResidency(S, toKind, opts = {}) {
  const res = S.legal.residency;
  if (!RESIDENCY_KINDS.includes(toKind)) return { ok: false, msg: `Unknown residency kind: ${toKind}` };
  const fromKind = res.kind;
  if (fromKind === toKind && !opts.force) return { ok: true, changed: false };
  /* A citizen of country A takes a work visa / iqama in country B — that is
     the whole expat model. The only blocked move is a citizen taking a visa
     permit FOR a country they already hold citizenship of (a Saudi citizen
     does not need a Saudi iqama). The old blanket block refused every
     citizen -> visa move, stranding expats on kind 'citizen' with no
     matching citizenship — and the salary gate then withheld their pay. */
  if (fromKind === 'citizen' && toKind !== 'citizen' && S.legal.citizenships.includes(S.legal.residency.country)) {
    return { ok: false, msg: `You are already a citizen of ${getCountry(S.legal.residency.country).name} — no visa permit applies there.` };
  }
  res.kind = toKind;
  if (opts.permitName !== undefined) res.permitName = opts.permitName;
  if (opts.sponsorName !== undefined) res.sponsorName = opts.sponsorName;
  if (opts.sponsorArchetype !== undefined) res.sponsorArchetype = opts.sponsorArchetype;
  res.expiresYear = opts.expiresYear !== undefined ? opts.expiresYear : null;
  res.expiresMonth = opts.expiresMonth !== undefined ? opts.expiresMonth : null;
  if (opts.familySponsored !== undefined) res.familySponsored = opts.familySponsored;
  res.graceMonthsLeft = opts.graceMonthsLeft !== undefined ? opts.graceMonthsLeft : 0;
  if (opts.resetYears) res.yearsInCountryLegally = 0;
  res.renewalDue = false;
  // Gulf no-PR note, data-driven: the country's skilled-migration rules
  // exist AND offer no PR route at all (prYears == null), so years here can
  // never convert. The game says so on the record itself. (No rules entry
  // at all — e.g. che/swe/tur, whose data has not landed yet — is a data
  // gap, NOT proof of no route, so it sets no note.)
  const rules = SKILLED_MIGRATION_RULES[S.country];
  res.prBlockedReason = (rules && rules.prYears == null) && toKind !== 'citizen'
    ? `No permanent residency route exists for expats in ${getCountry(S.country).name} — legal years here never convert to PR or citizenship.`
    : null;
  if (!opts.silent) {
    recordJournal(S, `Residency status: ${fromKind} → ${toKind}${res.permitName ? ` (${res.permitName})` : ''}.`, 'visa');
  }
  return { ok: true, changed: true, from: fromKind, to: toKind };
}

/* ONE household-move policy (was: a different boolean at every call site):
   study abroad -> household stays; Gulf work -> household follows only with
   a multinational sponsor; skilled / golden / return-home -> follows. */
export function householdMovePolicy(routeKind, sponsorArchetype = null) {
  if (routeKind === 'study') return false;
  if (routeKind === 'gulf') return sponsorArchetype === 'multinational';
  return true; // skilled, golden, return
}

/* Execute an authentic international move (converting wallet, housing, job, and household) */
export function executeCountryRelocation(S, destCountry, residencyObj, moveHousehold = true, opts = {}) {
  const oldCountry = S.country;
  if (oldCountry === destCountry) return;

  const destObj = getCountry(destCountry);

  /* v2.11 W4 — a move NEVER force-liquidates a business any more (the old
     block below sold it for 1.12x capital + 6 months' profit with no
     choice). If the player owns any business and the decisions have not
     been made yet, the move PAUSES here: the pending move is stashed as
     plain data on S.pendingRelocation (so it survives a save) and a
     decision scene opens for the first business — Keep (manage from
     abroad), Sell (real valuation) or Close (salvage, staff lose their
     jobs). Each decision is applied in ORIGIN currency inside the scene
     effect, and only when every business is decided does
     finishPendingRelocation run the move below. Callers that set up a
     job, a university place or a journal line AFTER the move must pass
     that work as opts.after (a plain-data descriptor) — it runs in
     finishPendingRelocation, after the move, never before. */
  if (!opts.businessDecisionsDone && getBusinesses(S).length > 0) {
    if (S.pendingRelocation && S.pendingRelocation.destCountry === destCountry) {
      return { deferred: true };
    }
    S.pendingRelocation = {
      destCountry,
      residencyObj,
      moveHousehold,
      after: opts.after || null,
      remaining: getBusinesses(S).map(b => b.id),
      decided: {}
    };
    queueRelocationBusinessScene(S);
    return { deferred: true };
  }

  // These courses are full-time in-person routes, not portable remote credentials.
  if(S.education.university?.international&&S.education.university.country!==destCountry){
    const u=S.education.university;S.education.history??=[];S.education.history.push({kind:'withdrawn_move',name:u.name,majorLabel:u.majorLabel,year:S.year});S.education.university=null;S.education.stage='completed';recordJournal(S,`Left full-time study at ${u.name} when moving away. Paid tuition is not refunded.`,'education');
  }
  if(S.postgrad?.active?.international&&S.postgrad.active.country!==destCountry){const p=S.postgrad.active;S.postgrad.history??=[];S.postgrad.history.push({...p,status:'withdrawn_move',year:S.year});S.postgrad.active=null;recordJournal(S,`Left ${p.label} when moving away from its study country. Paid tuition is not refunded.`,'education');}
  const escrow=S.legal.blockedAccount;
  if(escrow&&escrow.country!==destCountry){
    const refund=Math.round(convertCurrency(escrow.balanceLocal||0,escrow.country,oldCountry,S.year));
    if(refund>0)walletMove(S,refund,'Released remaining game maintenance escrow on departure','education');
    S.legal.blockedAccount=null;
  }
  closePlayerLease(S);
  convertFinancesOnCountryMove(S, oldCountry, destCountry);

  S.country = destCountry;
  S.city = destObj.cities[0];

  /* End local job unless the caller sets up the new job right after */
  S.career.employed = false;
  S.career.job = null;

  /* Set initial rented apartment in new country (unless citizen returning to family/owned property) */
  const ownedThere = S.housing.properties.find(p => p.country === destCountry);
  if (ownedThere) {
    if(ownedThere.landlord?.tenant)endTenancy(S,ownedThere,'owner returned from abroad');
    ownedThere.rentedOut = false;
    S.housing.mode = 'owned';
    S.housing.currentHomeId = ownedThere.id;
    S.housing.currentHomeName = ownedThere.name;
    S.housing.monthlyRent = 0;
  } else if (destCountry === S.homeCountry && S.player.age < 26 && S.relations.spouseIds.length === 0) {
    S.housing.mode = 'parents';
    S.housing.currentHomeId = null;
    S.housing.currentHomeName = 'Family Home';
    S.housing.monthlyRent = 0;
  } else {
    const rentModest = eraLocalCost(destObj.monthlyBasket2026.rentModest, destCountry, S.year);
    S.housing.mode = 'rent';
    S.housing.currentHomeId = null;
    S.housing.currentHomeName = `${S.city} Starter Apartment`;
    S.housing.monthlyRent = rentModest;
  }

  /* Residency status — the one state machine (D6) */
  S.legal.residency.country = destCountry;
  if (S.legal.citizenships.includes(destCountry)) {
    transitionResidency(S, 'citizen', { permitName: `${destObj.adjective} Citizenship`, sponsorName: null, sponsorArchetype: null, expiresYear: null, expiresMonth: null, familySponsored: true, resetYears: true, silent: true, force: true });
  } else {
    // force: a relocation always installs the NEW permit's details, even
    // when the kind is unchanged (e.g. work visa in a new country).
    transitionResidency(S, residencyObj.kind, { ...residencyObj, resetYears: true, silent: true, force: true });
  }

  /* Spouse & Children Relocation Logic (No silent teleportation without agreement!) */
  const livingSpouses = S.relations.spouseIds.map(id => S.people[id]).filter(p => p && p.alive);
  if (livingSpouses.length > 0) {
    if (moveHousehold) {
      for (const sp of livingSpouses) {
        sp.residenceCountry = destCountry;
        sp.city = S.city;
        /* A moved spouse gets a REAL job in her field at a real company in
           the new country — never a converted figure (v86.62 correction). */
        if (sp.career.monthlyIncomeLocal > 0 || sp.career.employed) {
          findRealJobForPerson(S, sp, destCountry);
        }
        // The couple's shared relocation plan records the arrival.
        const couple = getCoupleForSpouse(S, sp.id);
        if (couple && couple.geography.plan && couple.geography.plan.status === 'planned') {
          couple.geography.plan.status = 'arrived';
          couple.geography.plan.arrivalYear = S.year;
          couple.geography.plan.arrivalMonth = S.month;
          couple.geography.a = S.country;
          couple.geography.b = S.country;
        }
      }
      for (const cid of S.relations.childIds) {
        const ch = S.people[cid];
        if (ch && ch.alive && ch.age < 19) {
          ch.residenceCountry = destCountry;
          ch.city = S.city;
        }
      }
    } else {
      for (const sp of livingSpouses) {
        rememberDeed(S, sp, 'moved_away', `Relocated to ${destObj.name} solo while household stayed in ${getCountry(sp.residenceCountry).name}.`, {
          affection: -4, resentment: 8
        });
      }
    }
  }

  /* Introduce a local expat / community contact in the new country */
  const contact = createPerson(S, {
    age: Math.max(22, S.player.age + randInt(S, -2, 6)),
    role: 'friend',
    relationLabel: destCountry === S.homeCountry ? 'Local Friend' : `Expat Contact in ${S.city}`,
    nationality: chance(S, 0.5) ? S.homeCountry : destCountry,
    residenceCountry: destCountry,
    city: S.city,
    affection: 56,
    trust: 56,
    respect: 58
  });
  S.people[contact.id] = contact;
  S.relations.friendIds.unshift(contact.id);

  emitFact(S, 'MIGRATED', { from: oldCountry, to: destCountry });
}

/* ============================================================================
   v2.11 W4 — RELOCATION BUSINESS DECISIONS (one scene per business)
   Why one scene per business, not one scene listing all three buttons
   each: a scene is a single pick (resolveActiveSceneChoice takes one
   choice index), so three buttons per business cannot live in one scene.
   Chained urgent scenes are the existing pattern (the resolver drains
   the next urgent scene into view the moment a choice is answered), so
   the player answers business 1, business 2 appears at once, and the
   move completes the moment the last one is answered. The first scene is
   set as S.activeScene directly (not queued) so it shows the moment the
   player taps Apply, with no turn advance needed; later scenes queue
   urgent and are drained by the resolver.
   ========================================================================== */

function businessCountWord(S) {
  const n = getBusinesses(S).length;
  return n === 1 ? 'your business' : `your ${n} businesses`;
}

function buildRelocationBusinessScene(S, choice) {
  const pending = S.pendingRelocation;
  const destObj = getCountry(pending.destCountry);
  const originObj = getCountry(choice.country);
  const remaining = pending.remaining.length;
  const total = Object.keys(pending.decided).length + remaining;
  const profitLine = choice.monthlyProfit >= 0
    ? `It makes about ${formatMoney(choice.monthlyProfit, choice.currency)} a month after costs.`
    : `It currently LOSES about ${formatMoney(-choice.monthlyProfit, choice.currency)} a month.`;
  return {
    key: `biz_relocate_${choice.bizId}_${S.year}_${S.month}`,
    baseId: `biz_relocate_${choice.bizId}`,
    relocationBusinessSnapshot:{bizId:choice.bizId,destCountry:pending.destCountry},
    maxPerLife: 99,
    category: 'visa',
    title: `Your business before you move: ${choice.name}`,
    text: `${destObj.name} move waits for ${remaining}/${total} business ${remaining===1?'decision':'decisions'}. ${choice.name} stays in ${originObj.name}. ${profitLine} Keep: 70% revenue, manager ${formatMoney(choice.remoteManagerWage,choice.currency)}/month, reputation slips. Sell or close ends ownership${choice.staffCount>0?`; ${choice.staffCount} staff lose their jobs on closure`:''}.`,
    choices: [
      {
        label: `Keep ${choice.name} — manage it from abroad (70% revenue, ${formatMoney(choice.remoteManagerWage, choice.currency)}/mo manager)`,
        effect: (st) => { recordRelocationBusinessDecision(st, choice.bizId, 'keep'); }
      },
      {
        label: `Sell ${choice.name} for about ${formatMoney(choice.valuation, choice.currency)}`,
        effect: (st) => { recordRelocationBusinessDecision(st, choice.bizId, 'sell'); }
      },
      {
        label: `Close ${choice.name} — ${formatMoney(choice.salvage, choice.currency)} salvage`,
        effect: (st) => { recordRelocationBusinessDecision(st, choice.bizId, 'close'); }
      }
    ]
  };
}

function queueRelocationBusinessScene(S) {
  const pending = S.pendingRelocation;
  if (!pending || !Array.isArray(pending.remaining) || pending.remaining.length === 0) return false;
  /* A business that somehow left the list mid-pending (sold/closed by
     another route) is skipped, not asked about twice. */
  const choices = buildRelocationBusinessChoices(S);
  pending.remaining = pending.remaining.filter(id => choices.some(c => c.bizId === id));
  if (pending.remaining.length === 0) {
    finishPendingRelocation(S);
    return false;
  }
  const choice = choices.find(c => c.bizId === pending.remaining[0]);
  if (!choice) return false;
  const scene = buildRelocationBusinessScene(S, choice);
  if (!S.activeScene) {
    S.activeScene = scene;
    return true;
  }
  return queueScene(S, scene, true);
}

/* Apply one relocation decision for one business, then advance the chain:
   next business's scene, or finish the move. Called from the decision
   scene effects AND from the biz-relocate-* button handlers in main.js —
   same function, same result, so a decision can never be applied twice
   (the business leaves `remaining` the moment it is decided). */
export function recordRelocationBusinessDecision(S, bizId, decision) {
  const pending = S.pendingRelocation;
  if (!pending) return { ok: false, msg: 'No move is waiting on a business decision.' };
  if (!pending.remaining.includes(bizId)) {
    return { ok: false, msg: 'That business has already been decided for this move.' };
  }
  const res = applyRelocationBusinessDecision(S, bizId, decision);
  if (!res || !res.ok) return res;
  pending.decided[bizId] = decision;
  pending.remaining = pending.remaining.filter(id => id !== bizId);
  if (pending.remaining.length > 0) {
    queueRelocationBusinessScene(S);
  } else {
    finishPendingRelocation(S);
  }
  return res;
}

/* Run the stashed move now that every business is decided, then run the
   caller's post-move work (job, university place, journal line) from the
   plain-data descriptor — never before the move. A remote business in
   the destination country stops being remote: the owner is home again. */
export function finishPendingRelocation(S) {
  const pending = S.pendingRelocation;
  if (!pending) return { ok: false, msg: 'No move is waiting.' };
  S.pendingRelocation = null;
  executeCountryRelocation(S, pending.destCountry, pending.residencyObj, pending.moveHousehold, { businessDecisionsDone: true });
  /* v2.11 W4 — a kept business's books are re-denominated into the new
     player currency (its home stays the origin country); a business in
     the destination country stops being remote — the owner is home. */
  for (const biz of getBusinesses(S)) {
    if (biz.remote) convertBusinessFiguresCurrency(S, biz, S.country);
  }
  for (const biz of getBusinesses(S)) {
    if (biz.remote && biz.country === S.country) restoreBusinessLocal(S, biz);
  }
  runRelocationContinuation(S, pending.after);
  return { ok: true };
}

/* The post-move work each apply* function used to do inline, driven by a
   plain-data descriptor (functions cannot be stored on S — saves are
   JSON). Only descriptors this file's own apply* functions write are
   handled; anything else is ignored, never executed. */
export function runRelocationContinuation(S, after) {
  if (!after || typeof after.kind !== 'string') return;
  if (after.kind === 'study') {
    finishStudyAbroad(S,after);
  } else if (after.kind === 'gulf') {
    if (after.sponsorArchId !== 'ghost') {
      const track = CAREER_TRACKS[after.trackId];
      S.career.employed = true;
      S.career.job = {
        employer: after.sponsorEmployer,
        title: (track.rungs[Math.min(3, Math.floor((S.career.yearsExperience || 0) / 3))] || track.rungs[0]).title,
        track: after.trackId,
        level: (track.rungs[Math.min(3, Math.floor((S.career.yearsExperience || 0) / 3))] || track.rungs[0]).level,
        monthlyGross: after.monthlyGross,
        startYear: S.year,
        monthsInRole: 0,
        performance: 70,
        workMode: 'normal',
        bossId: null
      };
      const { boss } = spawnWorkplaceCast(S, after.sponsorEmployer, after.trackId, after.monthlyGross);
      S.career.job.bossId = boss.id;
      emitFact(S, 'INCOME_SURGE', { employer: after.sponsorEmployer, monthlyGross: after.monthlyGross });
      recordJournal(
        S,
        `Landed in ${S.city}, ${getCountry(after.destCountry).name} sponsored by ${after.sponsorEmployer} (${GULF_SPONSOR_ARCHETYPES[after.sponsorArchId].label}) as ${S.career.job.title} at ${formatMoney(after.monthlyGross, after.destCountry)}/mo tax-free!`,
        'visa'
      );
    } else {
      recordJournal(
        S,
        `Arrived in ${S.city}, ${getCountry(after.destCountry).name} on a "Free Visa" under ${after.sponsorEmployer}. No guaranteed salary — find a real legal employer quickly before labor inspections catch up!`,
        'visa'
      );
    }
  } else if (after.kind === 'skilled') {
    const track = CAREER_TRACKS[after.trackId];
    S.career.employed = true;
    S.career.job = {
      employer: after.sponsorEmployer,
      title: (track.rungs[Math.min(2, Math.floor((S.career.yearsExperience || 0) / 3))] || track.rungs[0]).title,
      track: after.trackId,
      level: (track.rungs[Math.min(2, Math.floor((S.career.yearsExperience || 0) / 3))] || track.rungs[0]).level,
      monthlyGross: after.monthlyGross,
      startYear: S.year,
      monthsInRole: 0,
      performance: 72,
      workMode: 'normal',
      bossId: null
    };
    const { boss } = spawnWorkplaceCast(S, after.sponsorEmployer, after.trackId, after.monthlyGross);
    S.career.job.bossId = boss.id;
    recordJournal(
      S,
      `Sponsored by ${after.sponsorEmployer} on a ${after.workVisaName || 'work visa'}! Relocated to ${S.city}, ${getCountry(after.destCountry).name} earning ${formatMoney(after.monthlyGross, after.destCountry)}/mo gross.`,
      'visa'
    );
  } else if (after.kind === 'golden') {
    if (after.journalText) recordJournal(S, after.journalText, 'milestone');
  } else if (after.kind === 'return_home') {
    evaluateReturnHomeGreeting(S);
  } else if (after.kind === 'chancenkarte') {
    const blockedEur = after.blockedEur || 0;
    S.legal.blockedAccount = {
      kind: 'Chancenkarte Sperrkonto',
      country: 'deu',
      balanceLocal: blockedEur,
      balanceInPlayerLocal: blockedEur,
      monthlyReleaseLocal: Math.round(blockedEur / 12)
    };
    recordJournal(S, `Approved for Germany’s Chancenkarte (${after.pts} points)! Arrived in Berlin with 12 months to interview for EU Blue Card roles.`, 'visa');
  }
}

/* ============================================================================
   1. STUDY ABROAD PIPELINE (DEU Sperrkonto / GBR CAS / USA I-20 / CAN GIC)
   ========================================================================== */
export function grantGameGraduatePermit(S,level='bachelor',majorId='cs'){
 if(S.legal.residency.kind!=='student_visa')return;
 const pipe=STUDY_ABROAD_PIPELINES[S.country];
 let months=pipe?.postStudyMonths||12;
 if(S.country==='gbr')months=level==='phd'?36:S.year>=2027?18:24;
 if(S.country==='usa')months=['cs','engineering'].includes(majorId)?36:12;
 const expiry=S.year*12+S.month-1+months;
 transitionResidency(S,'post_study_work',{permitName:`Modelled graduate job-search/work route (${months} months)`,expiresYear:Math.floor(expiry/12),expiresMonth:expiry%12+1,force:true});
 recordJournal(S,'Game graduate route activated. Real eligibility, applications and work restrictions vary; this is not an automatic real-world entitlement.','visa');
}
export function applyOverseasScholarship(S,dest,level='bachelor'){
  if(!['bachelor','masters','phd'].includes(level))return {ok:false,msg:'Choose a study level.'};
  const q=studyAbroadQuote(S,dest,{level});
  if(!q.uni||dest===S.country||S.player.age<18||!['graduated_high','completed'].includes(S.education.stage)||S.education.university||S.postgrad?.active)return {ok:false,msg:'Finish your current school/course and choose a different destination first.'};
  if(level!=='bachelor'&&!S.education.degrees.length)return {ok:false,msg:'A first degree is required.'};
  if(level==='phd'&&!S.postgrad?.completed?.some(p=>p.tier==='masters_mba'))return {ok:false,msg:'A master’s credential is required.'};
  if(!abroadLanguageReady(S))return {ok:false,msg:'A recorded English qualification is required.'};
  if((S.education.highSchoolScore??0)<85||S.player.vitals.smarts<75)return {ok:false,msg:'Game award requires85+secondary marks and75+smarts.'};
  const key=studyAwardKey(S,dest,level);S.education.studyAwards??={};
  if(S.education.studyAwards[key])return {ok:false,msg:'Already reviewed this country/level award this year.'};
  const awarded=chance(S,.35);S.education.studyAwards[key]={awarded,year:S.year,dest,level};
  recordJournal(S,`Overseas game tuition award (${dest}, ${level}): ${awarded?'awarded':'not awarded'}. Living costs and travel are not covered.`,'education');
  return {ok:awarded,msg:awarded?'Full game tuition award won for this destination and level this year. Travel and living costs remain yours.':'Not awarded. You can try again next game year or fund the course yourself.'};
}
function finishStudyAbroad(S,q){
  // Keep pre-upgrade saved business-deferred undergraduate moves recoverable.
  if(!q.dest&&q.destCountry){
    const uni=getUniversitiesFor(q.destCountry,S.year).find(u=>u.id===q.uniId)||getUniversitiesFor(q.destCountry,S.year)[0];
    if(!uni)return;
    enrollInUniversity(S,uni,q.majorId||'cs',q.scholarshipPct||0);
    if(S.education.university)Object.assign(S.education.university,{prepaidMonths:6,international:true,elapsedMonths:0,fundingSource:'self'});
    if(q.blockedDest>0)S.legal.blockedAccount={kind:q.blockedKind||'Legacy study escrow',country:q.destCountry,balanceLocal:q.blockedDest,balanceInPlayerLocal:q.blockedDest,monthlyReleaseLocal:Math.round(q.blockedDest/12)};
    recordJournal(S,'Completed a previously funded study move from an older save. Its original deposit is credited for6months; new international budgets apply to new applications only.','education');return;
  }
  if(q.blockedDest>0)S.legal.blockedAccount={kind:'Study maintenance escrow (game)',country:q.dest,balanceLocal:q.blockedDest,balanceInPlayerLocal:q.blockedDest,monthlyReleaseLocal:Math.round(q.blockedDest/12)};
  if(q.level==='bachelor'){
    const uni=getUniversitiesFor(q.dest,S.year).find(u=>u.id===q.uniId);
    enrollInUniversity(S,uni,q.majorId,q.scholarshipPct);
    Object.assign(S.education.university,{annualTuition:q.annualDest,fundingSource:q.funding==='parents'?'family':q.funding,international:true,prepaidMonths:12,elapsedMonths:0,familyMonthsRemaining:12,scholarshipPct:q.scholarshipPct});
  }else{
    S.postgrad??={active:null,completed:[]};
    S.postgrad.active={tier:q.level==='phd'?'fellowship_phd':'masters_mba',label:`${q.level==='phd'?'PhD':"Master's"} in ${q.majorLabel} · ${q.uniName}`,monthsLeft:q.years*12,totalMonths:q.years*12,feePaid:q.tuitionDest,country:q.dest,international:true,uniId:q.uniId,majorId:q.majorId};
  }
  recordJournal(S,`Started overseas ${q.level} study at ${q.uniName}. International game tuition funded via ${q.funding}; no living stipend. ${q.citizen?'Destination citizenship retained; no student visa required.':'Student residence is temporary, not permanent residency.'}`,'education');
}
export function applyStudyAbroad(S,destCountry,majorId='cs',opts={}){
  const q=studyAbroadQuote(S,destCountry,{...opts,majorId});
  if(!q.ok)return {ok:false,msg:q.reason};
  const border=checkCanCrossBorder(S);if(!border.ok)return {ok:false,msg:border.reason};
  if(q.funding==='parents'){
    if(!chargeFamilyEducation(S,q.totalPlayer))return {ok:false,msg:'Parent savings changed.'};
  }else{
    const pull=Math.max(0,q.totalPlayer-S.money.cash);
    if(pull){moveBalance(S,'savings',-pull,'Study abroad savings withdrawal','bank');walletMove(S,pull,'Study abroad savings withdrawal','bank');}
    walletMove(S,-q.totalPlayer,'International tuition, maintenance escrow and modelled relocation budget','education');
  }
  const after={kind:'study',...q,uniId:q.uni.id,uniName:q.uni.name};delete after.uni;
  const months=q.years*12+3,expiry=S.year*12+S.month-1+months;
  const moved=executeCountryRelocation(S,destCountry,{kind:q.citizen?'citizen':'student_visa',permitName:q.citizen?'Citizenship · no student visa':q.visaName,sponsorName:q.uni.name,expiresYear:Math.floor(expiry/12),expiresMonth:expiry%12+1,familySponsored:false},householdMovePolicy('study'),{after});
  if(moved?.deferred)return {ok:true,deferred:true,msg:'Student route accepted in the game. Resolve your business move before departure; tuition and relocation funds are reserved.'};
  finishStudyAbroad(S,after);
  return {ok:true,msg:`Moved to ${getCountry(destCountry).name} for ${q.level} study. Tuition paid ${q.level==='bachelor'?'for12months':'for the full course'}; living costs continue monthly. This is a simplified game route, not a real visa decision.`};
}

/* ============================================================================
   2. GULF KAFALA / SPONSORSHIP WORK MIGRATION (SAUDI & UAE)
   ========================================================================== */
export function applyGulfWorkChannel(S, destCountry, channelId) {
  const border = checkCanCrossBorder(S);
  if (!border.ok) return { ok: false, msg: border.reason };
  if (!['sau', 'uae'].includes(destCountry)) return { ok: false, msg: 'Invalid Gulf destination.' };
  if (destCountry === S.country) return { ok: false, msg: 'You are already in this country.' };

  const ch = GULF_ENTRY_CHANNELS.find(c => c.id === channelId);
  if (!ch) return { ok: false, msg: 'Channel not found.' };

  if (ch.reqDegree && S.education.degrees.length === 0) {
    return { ok: false, msg: `${ch.label} requires a university degree.` };
  }
  if (ch.reqEmployed && !S.career.employed) {
    return { ok: false, msg: `${ch.label} requires active employment.` };
  }
  if ((S.career.yearsExperience || 0) < (ch.minExpYears || 0)) {
    return { ok: false, msg: `Requires ${ch.minExpYears}+ years of work experience.` };
  }

  const feeLocal = Math.round(convertCurrency(ch.upfrontFeeUsd2026, 'usa', S.country, S.year));
  const flightLocal = Math.round(convertCurrency(480, 'usa', S.country, S.year));
  if (S.money.cash < feeLocal + flightLocal) {
    return { ok: false, msg: `Need ${formatMoney(feeLocal + flightLocal, S.country)} for ${feeLocal > 0 ? 'commission + ' : ''}travel.` };
  }

  if (feeLocal > 0) {
    walletMove(S, -feeLocal, `${ch.label} fee (${getCountry(destCountry).name})`, 'visa');
  }

  /* Agency / Free-Visa Broker Scam Realism! */
  if (ch.scamRisk > 0 && chance(S, ch.scamRisk)) {
    recordCivilLoss(S,'broker_fraud',feeLocal,'visa broker',{traceable:true,defendantName:ch.label});
    S.player.vitals.stress = clamp(S.player.vitals.stress + 18);
    S.player.vitals.happiness = clamp(S.player.vitals.happiness - 14);
    recordJournal(
      S,
      `The ${ch.label.toLowerCase()} disappeared with your ${formatMoney(feeLocal, S.country)} commission — the promised visa number never existed in the ministry portal.`,
      'visa'
    );
    return { ok: false, msg: `Broker scam! Lost ${formatMoney(feeLocal, S.country)} commission.` };
  }

  const skillBonus = (S.education.degrees.length ? 0.12 : 0) + Math.min(0.18, (S.career.yearsExperience || 0) * 0.03);
  if (!chance(S, Math.min(0.92, ch.baseSuccess + skillBonus))) {
    recordJournal(S, `Your ${getCountry(destCountry).name} application via ${ch.label} didn’t result in a contract offer this round.`, 'career');
    return { ok: false, msg: 'No contract offer secured this time.' };
  }

  /* Medical / Engineering Board Check for Direct Specialist Gulf Hiring (2018+) */
  const degCheck = S.education.degrees[0];
  if (degCheck === 'medicine' && S.year >= 2018) {
    if (destCountry === 'sau' && !(S.credentials?.licenses || []).includes('lic_sau_scfhs')) {
      return { ok: false, msg: 'Saudi hospitals require SCFHS SMLE & DataFlow clearance first — sit it on the Education tab (Languages & Licensing Boards)!' };
    }
    if (destCountry === 'uae' && !['lic_uae_dha', 'lic_uk_plab', 'lic_us_usmle'].some(l => (S.credentials?.licenses || []).includes(l))) {
      return { ok: false, msg: 'UAE hospitals require DHA/MOHAP license (or UK GMC / US USMLE Tier-1 exemption) first!' };
    }
  }

  walletMove(S, -flightLocal, `One-way flight & medical attestation to ${getCountry(destCountry).name}`, 'visa');

  const sponsorArchId = pick(S, ch.sponsors);
  const destObj = getCountry(destCountry);
  const deg = S.education.degrees[0];
  const trackId = deg === 'medicine' ? 'medicine' : deg === 'engineering' ? 'engineering' : deg === 'cs' ? 'software' : deg === 'business' ? 'finance' : deg === 'pharmacy' ? 'pharma' : 'trades';
  const track = CAREER_TRACKS[trackId];
  const employers = getEmployersFor(destCountry, trackId);
  const sponsorEmployer = sponsorArchId === 'ghost' ? 'Al-Noor Paper Trading Est.' : pick(S, employers);

  /* Decide whether married household moves immediately or stays until settled */
  const hasSpouse = S.relations.spouseIds.length > 0;
  const moveFamilyNow = hasSpouse && householdMovePolicy('gulf', sponsorArchId);

  /* v2.11 W4: pay is computed BEFORE the move so the 'gulf' continuation
     can set up the same job after a deferred move. */
  const gulfExpLvl = Math.min(3, Math.floor((S.career.yearsExperience || 0) / 3));
  const gulfRung = track.rungs[gulfExpLvl] || track.rungs[0];
  const gulfBaseEntry = eraSalary(destObj.annualSalaryTiers2026.entry / 12, destCountry, S.year);
  const gulfMonthlyGross = Math.round(gulfBaseEntry * track.payMult * gulfRung.mult * ch.salaryMult);

  const moved = executeCountryRelocation(S, destCountry, {
    kind: 'gulf_iqama',
    permitName: destCountry === 'sau' ? 'Saudi Work Iqama' : 'UAE Employment Residence Visa',
    sponsorName: sponsorEmployer,
    sponsorArchetype: sponsorArchId,
    expiresYear: S.year + 2,
    expiresMonth: S.month,
    familySponsored: moveFamilyNow
  }, moveFamilyNow, {
    after: { kind: 'gulf', destCountry, sponsorArchId, sponsorEmployer, trackId, monthlyGross: gulfMonthlyGross }
  });
  if (moved && moved.deferred) {
    return { ok: true, deferred: true, msg: `Your ${getCountry(destCountry).name} contract is ready — but first decide what happens to ${businessCountWord(S)} before you move.` };
  }

  if (sponsorArchId !== 'ghost') {
    const expLvl = gulfExpLvl;
    const rung = gulfRung;
    const baseEntry = gulfBaseEntry;
    const monthlyGross = gulfMonthlyGross;

    S.career.employed = true;
    S.career.job = {
      employer: sponsorEmployer,
      title: rung.title,
      track: trackId,
      level: rung.level,
      monthlyGross,
      startYear: S.year,
      monthsInRole: 0,
      performance: 70,
      workMode: 'normal',
      bossId: null
    };
    const { boss } = spawnWorkplaceCast(S, sponsorEmployer, trackId, monthlyGross);
    S.career.job.bossId = boss.id;
    emitFact(S, 'INCOME_SURGE', { employer: sponsorEmployer, monthlyGross });
    recordJournal(
      S,
      `Landed in ${S.city}, ${destObj.name} sponsored by ${sponsorEmployer} (${GULF_SPONSOR_ARCHETYPES[sponsorArchId].label}) as ${rung.title} at ${formatMoney(monthlyGross, destCountry)}/mo tax-free!`,
      'visa'
    );
  } else {
    recordJournal(
      S,
      `Arrived in ${S.city}, ${destObj.name} on a "Free Visa" under ${sponsorEmployer}. No guaranteed salary — find a real legal employer quickly before labor inspections catch up!`,
      'visa'
    );
  }

  return { ok: true, msg: `Relocated to ${destObj.name}!` };
}

/* ============================================================================
   3. DIRECT SKILLED WORK VISA TO WESTERN / GLOBAL HUBS & RETURN HOME
   ========================================================================== */
export function applyDirectSkilledVisa(S, destCountry) {
  const border = checkCanCrossBorder(S);
  if (!border.ok) return { ok: false, msg: border.reason };
  if (destCountry === S.country) return { ok: false, msg: 'Already residing here.' };
  if (['sau', 'uae'].includes(destCountry)) {
    return applyGulfWorkChannel(S, destCountry, 'direct_portal');
  }

  if (S.education.degrees.length === 0 || (S.career.yearsExperience || 0) < 2) {
    return { ok: false, msg: `Overseas skilled sponsorship to ${getCountry(destCountry).name} requires a university degree + at least 2 years experience.` };
  }

  const feePlayer = Math.round(convertCurrency(1400, 'usa', S.country, S.year));
  const relocationReserve = Math.round(convertCurrency(3500, 'usa', S.country, S.year));
  if (S.money.cash < feePlayer + relocationReserve) {
    return { ok: false, msg: `Need ${formatMoney(feePlayer + relocationReserve, S.country)} for visa fees, flight & initial deposit.` };
  }

  const deg = S.education.degrees[0];
  const trackId = deg === 'medicine' ? 'medicine' : deg === 'engineering' ? 'engineering' : deg === 'cs' ? 'software' : deg === 'business' ? 'finance' : 'pharma';
  const track = CAREER_TRACKS[trackId];

  /* Authentic Foreign Medical Board Gate before Direct Hospital Sponsorship */
  if (trackId === 'medicine') {
    const lics = S.credentials?.licenses || [];
    if (destCountry === 'gbr' && !lics.includes('lic_uk_plab')) {
      return { ok: false, msg: 'UK NHS sponsorship requires passing GMC PLAB / UKMLA first — sit it on the Education tab (Languages & Licensing Boards)!' };
    }
    if (destCountry === 'usa' && !lics.includes('lic_us_usmle')) {
      return { ok: false, msg: 'US hospital residency/sponsorship requires passing USMLE Steps 1–3 first!' };
    }
    if (destCountry === 'deu' && !lics.includes('lic_deu_approbation')) {
      return { ok: false, msg: 'German hospital sponsorship requires Fachsprachprüfung C1 + Approbation first!' };
    }
  }

  /* Enforce UK April 2024 / July 2025 £38,700 -> £41,700 Skilled Worker Threshold! */
  const destObjPre = getCountry(destCountry);
  const expLvlPre = Math.min(2, Math.floor((S.career.yearsExperience || 0) / 3));
  const rungPre = track.rungs[expLvlPre] || track.rungs[0];
  const estAnnualDest = eraSalary(destObjPre.annualSalaryTiers2026.entry, destCountry, S.year) * track.payMult * rungPre.mult;
  if (destCountry === 'gbr' && S.year >= 2024) {
    const discounted = S.player.age < 26 || ['medicine', 'pharma'].includes(trackId);
    const minGbp = eraSalary(discounted ? 30960 : (S.year >= 2025 ? 41700 : 38700), 'gbr', S.year);
    if (estAnnualDest < minGbp) {
      return {
        ok: false,
        msg: `UK Home Office Skilled Worker rule (${S.year}) requires >= ${formatMoney(minGbp, 'gbr')}/yr${discounted ? ' (New Entrant/NHS scale)' : ''} — build more seniority first!`
      };
    }
  }

  const successProb = Math.min(0.78, 0.18 + track.visaDemand * 0.35 + Math.min(0.2, S.career.yearsExperience * 0.03));

  if (!chance(S, successProb)) {
    recordJournal(S, `Applied to overseas sponsors in ${getCountry(destCountry).name}, but employers favored local candidates this cycle.`, 'career');
    return { ok: false, msg: `No overseas visa sponsor matched this month — try again or build seniority.` };
  }

  walletMove(S, -(feePlayer + Math.round(relocationReserve * 0.45)), `Visa & international relocation to ${getCountry(destCountry).name}`, 'visa');
  const destObj = getCountry(destCountry);
  const rules = SKILLED_MIGRATION_RULES[destCountry] || SKILLED_MIGRATION_RULES.gbr;
  const employers = getEmployersFor(destCountry, trackId);
  const sponsorEmployer = pick(S, employers);

  /* v2.11 W4: pay is computed BEFORE the move so the 'skilled'
     continuation can set up the same job after a deferred move. */
  const skilledExpLvl = Math.min(2, Math.floor((S.career.yearsExperience || 0) / 3));
  const skilledRung = track.rungs[skilledExpLvl] || track.rungs[0];
  const skilledBaseEntry = eraSalary(destObj.annualSalaryTiers2026.entry / 12, destCountry, S.year);
  const skilledMonthlyGross = Math.round(skilledBaseEntry * track.payMult * skilledRung.mult);

  const moved = executeCountryRelocation(S, destCountry, {
    kind: 'work_visa',
    permitName: rules.workVisaName,
    sponsorName: sponsorEmployer,
    sponsorArchetype: null,
    expiresYear: S.year + 3,
    expiresMonth: S.month,
    familySponsored: true
  }, householdMovePolicy('skilled'), {
    after: { kind: 'skilled', destCountry, sponsorEmployer, trackId, monthlyGross: skilledMonthlyGross, workVisaName: rules.workVisaName }
  });
  if (moved && moved.deferred) {
    return { ok: true, deferred: true, msg: `Your ${getCountry(destCountry).name} sponsorship is ready — but first decide what happens to ${businessCountWord(S)} before you move.` };
  }

  const expLvl = skilledExpLvl;
  const rung = skilledRung;
  const baseEntry = skilledBaseEntry;
  const monthlyGross = skilledMonthlyGross;

  S.career.employed = true;
  S.career.job = {
    employer: sponsorEmployer,
    title: rung.title,
    track: trackId,
    level: rung.level,
    monthlyGross,
    startYear: S.year,
    monthsInRole: 0,
    performance: 72,
    workMode: 'normal',
    bossId: null
  };
  const { boss } = spawnWorkplaceCast(S, sponsorEmployer, trackId, monthlyGross);
  S.career.job.bossId = boss.id;

  recordJournal(
    S,
    `Sponsored by ${sponsorEmployer} on a ${rules.workVisaName}! Relocated to ${S.city}, ${destObj.name} earning ${formatMoney(monthlyGross, destCountry)}/mo gross.`,
    'visa'
  );
  return { ok: true, msg: `Moved to ${destObj.name} with ${sponsorEmployer}!` };
}

/* 4. DIRECT SAUDI IQAMA MUMAYAZA (800k / 100k SAR) & UAE 2M AED INVESTOR GOLDEN VISA */
export function premiumResidencyQuote(S,destCountry=S.country,tier='permanent'){
 if(S.year<2019||!['sau','uae'].includes(destCountry)||!['annual','permanent'].includes(tier))return{ok:false,msg:'This game residency route is unavailable.'};
 if(S.legal.citizenships.includes(destCountry)||S.legal.residency.kind==='golden_visa'&&S.country===destCountry)return{ok:false,msg:'Already holds this status.'};
 const fee=destCountry==='sau'?Math.round(convertCurrency(eraLocalCost(tier==='annual'?100000:800000,'sau',S.year),'sau',S.country,S.year)):Math.round(convertCurrency(1250,'usa',S.country,S.year));
 const capital=destCountry==='uae'?Math.round(convertCurrency(eraLocalCost(2000000,'uae',S.year),'uae',S.country,S.year)):0;
 return{ok:true,fee,capital,eligible:S.money.cash>=fee&&S.money.cash+S.money.savings-fee>=capital,destCountry,tier};
}
export function applyPremiumOrGoldenResidency(S, destCountry, tier = 'permanent') {
  const quote=premiumResidencyQuote(S,destCountry,tier);if(!quote.ok)return quote;if(!quote.eligible)return{ok:false,msg:'Insufficient fee/capital after fees under game rules.'};
  if (S.year < 2019) return { ok: false, msg: 'Gulf Golden & Premium Residency programs launched in 2019.' };
  if (S.country !== destCountry) {
    const border = checkCanCrossBorder(S);
    if (!border.ok) return { ok: false, msg: border.reason };
  }
  if (S.legal.citizenships.includes(destCountry)) return { ok: false, msg: 'You are already a citizen!' };

  if (destCountry === 'sau') {
    const feeSar = eraLocalCost(tier === 'annual' ? 100000 : 800000, 'sau', S.year);
    const feePlayer = Math.round(convertCurrency(feeSar, 'sau', S.country, S.year));
    if (S.money.cash < feePlayer) {
      return { ok: false, msg: `Need ${formatMoney(feePlayer, S.country)} (${formatMoney(feeSar, 'sau')}) for Saudi Iqama Mumayaza.` };
    }
    walletMove(S, -feePlayer, `Saudi Premium Residency (${tier === 'annual' ? '1-Yr Renewable' : 'Permanent'})`, 'visa');
    const permitLabel = tier === 'annual'
      ? 'Saudi Premium Residency (1-Year Iqama Mumayaza)'
      : 'Permanent Saudi Premium Residency (Iqama Mumayaza)';
    if (S.country !== 'sau') {
      /* v2.11 W4: the journal line below runs only once the move completes
         (inline now, or from the 'golden' continuation). */
      const moved = executeCountryRelocation(S, 'sau', {
        kind: 'golden_visa',
        permitName: permitLabel,
        sponsorName: null,
        expiresYear: tier === 'annual' ? S.year + 1 : null,
        familySponsored: true
      }, householdMovePolicy('golden'), {
        after: { kind: 'golden', journalText: `Granted ${permitLabel} — full freedom to live, own property, run businesses, and sponsor family in Saudi Arabia without a kafeel!` }
      });
      if (moved && moved.deferred) {
        return { ok: true, deferred: true, msg: `Your ${permitLabel} is granted — but first decide what happens to ${businessCountWord(S)} before you move.` };
      }
    } else {
      transitionResidency(S, 'golden_visa', { permitName: permitLabel, sponsorName: null, sponsorArchetype: null, expiresYear: tier === 'annual' ? S.year + 1 : null, familySponsored: true, force: true });
    }
    recordJournal(S, `Granted ${permitLabel} — full freedom to live, own property, run businesses, and sponsor family in Saudi Arabia without a kafeel!`, 'milestone');
    return { ok: true, msg: `Granted ${permitLabel}!` };
  }

  if (destCountry === 'uae') {
    const depAed = eraLocalCost(2000000, 'uae', S.year);
    const depPlayer = Math.round(convertCurrency(depAed, 'uae', S.country, S.year));
    if ((S.money.cash + S.money.savings) < depPlayer) {
      return { ok: false, msg: `UAE Investor 10-Year Golden Visa requires ${formatMoney(depPlayer, S.country)} (${formatMoney(depAed, 'uae')}) in bank deposit/capital (or buy 2M AED real estate!).` };
    }
    const adminFee = Math.round(convertCurrency(1250, 'usa', S.country, S.year));
    if (S.money.cash < adminFee) return { ok: false, msg: `Need ${formatMoney(adminFee, S.country)} for ICP Golden Visa issuance fees.` };
    walletMove(S, -adminFee, 'UAE 10-Year Golden Visa ICP issuance', 'visa');
    if (S.country !== 'uae') {
      const moved = executeCountryRelocation(S, 'uae', {
        kind: 'golden_visa',
        permitName: '10-Year UAE Investor Golden Visa',
        sponsorName: null,
        expiresYear: S.year + 10,
        familySponsored: true
      }, householdMovePolicy('golden'), {
        after: { kind: 'golden', journalText: 'Issued the 10-Year UAE Investor Golden Visa — self-sponsored residency in Dubai & Abu Dhabi!' }
      });
      if (moved && moved.deferred) {
        return { ok: true, deferred: true, msg: `Your 10-Year UAE Investor Golden Visa is granted — but first decide what happens to ${businessCountWord(S)} before you move.` };
      }
    } else {
      transitionResidency(S, 'golden_visa', { permitName: '10-Year UAE Investor Golden Visa', sponsorName: null, sponsorArchetype: null, expiresYear: S.year + 10, familySponsored: true, force: true });
    }
    recordJournal(S, `Issued the 10-Year UAE Investor Golden Visa — self-sponsored residency in Dubai & Abu Dhabi!`, 'milestone');
    return { ok: true, msg: 'Granted 10-Year UAE Golden Visa!' };
  }
  return { ok: false, msg: 'Unsupported Premium Residency jurisdiction.' };
}

export function sponsorFamilyReunification(S) {
  if (S.relations.spouseIds.length === 0) return { ok: false, msg: 'You have no spouse living abroad.' };
  const abroadSpouses = S.relations.spouseIds.map(id => S.people[id]).filter(sp => sp && sp.alive && sp.residenceCountry !== S.country);
  if (!abroadSpouses.length) return { ok: false, msg: 'Your household already lives with you.' };

  const cObj = getCountry(S.country);
  if (S.country === 'sau' && (S.career.job?.monthlyGross || 0) < eraSalary(6000, 'sau', S.year)) {
    return { ok: false, msg: 'Saudi Family Iqama sponsorship requires higher documented monthly salary + Ejar housing.' };
  }
  const visaCost = Math.round(convertCurrency(950, 'usa', S.country, S.year));
  // ONE shared spouse-relocation plan on the couple record: the fee is
  // charged once, ever, for this plan — re-running reunification never
  // re-charges. The plan is also what executeCountryRelocation updates.
  const couple = getCoupleForSpouse(S, abroadSpouses[0].id);
  const plan = couple
    ? (couple.geography.plan || (couple.geography.plan = { liveCountry: S.country, liveCity: S.city, whoMoves: 'spouse', when: 'now', status: 'planned', route: 'family_reunification', documents: [], visa: { kind: S.legal.residency.kind, feeCharged: false, granted: false }, feeCharged: false, feeAmount: 0, reason: '' }))
    : null;
  const alreadyPaid = plan ? plan.feeCharged : false;
  if (!alreadyPaid) {
    if (S.money.cash < visaCost) return { ok: false, msg: `Need ${formatMoney(visaCost, S.country)} for dependent visas & flights.` };
    walletMove(S, -visaCost, 'Family reunification visas & flights', 'visa');
  }
  if (plan) {
    plan.feeCharged = true;
    plan.feeAmount = alreadyPaid ? plan.feeAmount : visaCost;
    plan.visa = { kind: S.legal.residency.kind, feeCharged: true, granted: true };
    plan.status = 'arrived';
    plan.arrivalYear = S.year;
    plan.arrivalMonth = S.month;
    plan.liveCountry = S.country;
    plan.liveCity = S.city;
  }
  for (const sp of abroadSpouses) {
    sp.residenceCountry = S.country;
    sp.city = S.city;
    // A reunited spouse gets a REAL job in her field at a real company
    // here — never a converted figure.
    if (sp.career.monthlyIncomeLocal > 0 || sp.career.employed) findRealJobForPerson(S, sp, S.country);
    rememberDeed(S, sp, 'supported_crisis', `Reunited the household in ${cObj.name}.`, { affection: 14, trust: 12, resentment: -16 });
  }
  for (const cid of S.relations.childIds) {
    const ch = S.people[cid];
    if (ch && ch.alive && ch.age < 19) {
      ch.residenceCountry = S.country;
      ch.city = S.city;
    }
  }
  S.legal.residency.familySponsored = true;
  recordJournal(S, `Your family landed at ${S.city} airport — your household is finally under one roof again in ${cObj.name}!`, 'milestone');
  return { ok: true, msg: 'Household reunited!' };
}

export function returnToHomeCountry(S) {
  if(S.pendingRelocation)return {ok:false,msg:'Finish your pending move first.'};
  if (S.country === S.homeCountry) return { ok: false, msg: 'You are already in your home country.' };
  if (S.legal.travelBanInCountry === S.country) {
    return { ok: false, msg: `Debt travel ban in ${getCountry(S.country).name} prevents departure until debts are settled.` };
  }
  const ticket = Math.round(convertCurrency(450, 'usa', S.country, S.year));
  if (S.money.cash >= ticket) {
    walletMove(S, -ticket, `Return flight to ${getCountry(S.homeCountry).name}`, 'visa');
  } else {
    S.legal.returnTravelAid={year:S.year,month:S.month,country:S.country,amount:ticket,kind:'game emergency repatriation grant'};
    recordJournal(S,'Emergency repatriation travel covered by a game aid grant. No ticket was charged.','visa');
  }
  /* v2.11 W4: the homecoming greeting below runs only once the move
     completes (inline now, or from the 'return_home' continuation). */
  const moved = executeCountryRelocation(S, S.homeCountry, { kind: 'citizen' }, householdMovePolicy('return'), { after: { kind: 'return_home' } });
  if (moved && moved.deferred) {
    return { ok: true, deferred: true, msg: `Your flight home is booked — but first decide what happens to ${businessCountWord(S)} before you move.` };
  }
  evaluateReturnHomeGreeting(S);
  return { ok: true, msg: `Returned home to ${getCountry(S.homeCountry).name}!` };
}

function evaluateReturnHomeGreeting(S) {
  const livingParents = [S.relations.fatherId, S.relations.motherId].map(id => id && S.people[id]).filter(p => p && p.alive);
  for (const p of livingParents) {
    rememberDeed(S, p, 'visited', `Came back home to ${getCountry(S.homeCountry).name}.`, { affection: 12, resentment: -10 });
  }
  recordJournal(S, `Returned permanently to ${S.city}, ${getCountry(S.homeCountry).name}.`, 'milestone');
  /* Check deferred military service if returning young to Egypt */
  if (S.legal.military.applicable && ['deferred_minor', 'deferred_student'].includes(S.legal.military.status) && S.player.age < 30) {
    S.education.stage = 'completed';
  }
}

export function permitRenewalQuote(S){
 const r=S.legal.residency,kind=r.kind;
 const due=r.expiresYear!=null&&(S.year>r.expiresYear||(S.year===r.expiresYear&&S.month>=(r.expiresMonth||12)));
 if(!['work_visa','student_visa','gulf_iqama','golden_visa'].includes(kind)||!due)return{ok:false,msg:'No eligible permit renewal due.'};
 return{ok:true,kind,permitName:r.permitName,fee:Math.round(convertCurrency(250,'usa',S.country,S.year))};
}
export function renewCurrentPermit(st){
 const q=permitRenewalQuote(st);if(!q.ok)return q;if(st.money.cash<q.fee)return{ok:false,msg:'Not enough cash for renewal.'};
  const r2 = st.legal.residency;
  walletMove(st, -q.fee, `Renewed ${q.permitName}`, 'visa');
  if (q.kind === 'gulf_iqama' && r2.sponsorArchetype) {
    const arch = GULF_SPONSOR_ARCHETYPES[r2.sponsorArchetype];
    if (arch && !chance(st, arch.renewsPermitChance)) {
      recordJournal(st, `Your sponsor ${r2.sponsorName || ''} refused to renew your Iqama — you fall into the 60-day grace period.`, 'visa');
      transitionResidency(st, 'grace_period', { permitName: `${q.permitName} — Sponsor Refused Renewal (60-Day Grace)`, graceMonthsLeft: 2 });
      return {ok:false,refused:true};
    }
  }
  if (q.kind === 'student_visa' && st.education.stage !== 'university' && !st.postgrad?.active?.international) {
    recordJournal(st, `Student visa renewal refused — you are no longer enrolled at a university in ${getCountry(st.country).name}.`, 'visa');
    transitionResidency(st, 'grace_period', { permitName: `${q.permitName} Expired (60-Day Grace)`, graceMonthsLeft: 2 });
    return {ok:false,refused:true};
  }
  if (['work_visa','gulf_iqama'].includes(q.kind) && !st.career.employed) {
    recordJournal(st, `Work visa renewal refused — you have no employer sponsoring you in ${getCountry(st.country).name}.`, 'visa');
    transitionResidency(st, 'grace_period', { permitName: `${q.permitName} Expired (60-Day Grace)`, graceMonthsLeft: 2 });
    return {ok:false,refused:true};
  }
  transitionResidency(st, q.kind, { permitName: q.permitName, sponsorName: r2.sponsorName, sponsorArchetype: r2.sponsorArchetype, expiresYear: st.year + 2, expiresMonth: st.month, familySponsored: r2.familySponsored, force: true });
  recordJournal(st, `Renewed your ${q.permitName} for two more years in ${getCountry(st.country).name}.`, 'visa');
 return{ok:true,msg:'Permit renewed.'};
}

/* Monthly Residency, Grace Period, PR & Citizenship Progression */
export function tickVisaAndLegalMonthly(S) {
  const res = S.legal.residency;
  if (S.legal.citizenships.includes(S.country)) {
    if (res.kind !== 'citizen') {
      transitionResidency(S, 'citizen', { permitName: `${getCountry(S.country).adjective} Citizenship`, silent: true });
    }
    return;
  }

  /* Tourist visas expire (D7): prune silently-expired foils, say so once. */
  if (Array.isArray(S.legal.touristVisas) && S.legal.touristVisas.length > 0) {
    const before = S.legal.touristVisas.length;
    S.legal.touristVisas = S.legal.touristVisas.filter(tv => tv.expiresYear > S.year);
    if (S.legal.touristVisas.length < before) {
      recordJournal(S, 'One of your tourist visas expired — re-apply at the Consular Visa Desk before travelling there again.', 'visa');
    }
  }

  /* Grace Period Countdown */
  if (res.kind === 'grace_period') {
    res.graceMonthsLeft -= 1;
    if (res.graceMonthsLeft <= 0) {
      transitionResidency(S, 'undocumented', { permitName: 'Expired Status (Overstay)', silent: true });
      S.player.vitals.stress = clamp(S.player.vitals.stress + 15);
      queueScene(S,buildMonthlyResidencyScene(S,{type:'grace',country:S.country,homeCountry:S.homeCountry,year:S.year,month:S.month}),true);
    }
    return;
  }

  /* Undocumented Raid / Deportation Risk + Small Cash Hustle */
  if (res.kind === 'undocumented') {
    const hustlePay = eraLocalCost(getCountry(S.country).monthlyBasket2026.rentModest * 0.85, S.country, S.year);
    walletMove(S, hustlePay, 'Undocumented informal cash work', 'money');
    if (chance(S, 0.09)) {
      recordJournal(S, `Immigration inspection caught your expired permit in ${getCountry(S.country).name} — fined and deported back to ${getCountry(S.homeCountry).name}.`, 'visa');
      S.player.vitals.happiness = clamp(S.player.vitals.happiness - 18);
      executeCountryRelocation(S, S.homeCountry, { kind: 'citizen' }, true);
    }
    return;
  }

  /* Expiry enforced for ALL visa kinds with an expiry (was: only
     post_study_work was ever checked). First month past expiry the player
     gets ONE renewal scene (res.renewalDue); ignore it a month and the
     permit lapses to grace. PSW cannot be renewed — straight to grace. */
  const EXPIRING_KINDS = ['work_visa', 'student_visa', 'gulf_iqama', 'golden_visa', 'post_study_work'];
  if (res.expiresYear != null && EXPIRING_KINDS.includes(res.kind)) {
    const expired = S.year > res.expiresYear || (S.year === res.expiresYear && S.month >= (res.expiresMonth || 12));
    if (expired) {
      const kindNow = res.kind;
      const permitNow = res.permitName;
      if (kindNow === 'post_study_work') {
        transitionResidency(S, 'grace_period', { permitName: 'Post-Study Permit Expired (60-Day Grace)', graceMonthsLeft: 2 });
        recordJournal(S, `Your post-study work permit in ${getCountry(S.country).name} expired — secure a skilled job offer immediately or return home.`, 'visa');
      } else if (!res.renewalDue) {
        res.renewalDue = true;
        const renewFee = Math.round(convertCurrency(250, 'usa', S.country, S.year));
        const renewalKey = `renewal_${kindNow}_${res.expiresYear}_${res.expiresMonth}`;
        queueScene(S,buildMonthlyResidencyScene(S,{type:'renewal',country:S.country,kind:kindNow,permitName:permitNow,fee:renewFee,expiresYear:res.expiresYear,expiresMonth:res.expiresMonth,key:renewalKey,year:S.year}),true);
      } else {
        // Lapse only once the player has actually had the chance to answer
        // the renewal scene: the scene is queued during this tick and only
        // becomes active at the end of the turn, so lapsing on the very next
        // tick would kill the permit before it was ever seen.
        const renewalKey = `renewal_${kindNow}_${res.expiresYear}_${res.expiresMonth}`;
        const renewalPending = (S.activeScene && S.activeScene.key === renewalKey) || (S.sceneQueue || []).some(q => q.key === renewalKey);
        if (!renewalPending) {
          transitionResidency(S, 'grace_period', { permitName: `${permitNow} Expired (60-Day Grace)`, graceMonthsLeft: 2 });
          recordJournal(S, `Your ${permitNow} lapsed unrenewed — you are in the 60-day grace period in ${getCountry(S.country).name}.`, 'visa');
        }
      }
      return; // an expired month accrues no PR years
    }
  }

  /* Annual legal residency counter for PR & Naturalization */
  if (S.month === 12 && ['work_visa', 'post_study_work', 'permanent_resident', 'gulf_iqama', 'golden_visa'].includes(res.kind)) {
    res.yearsInCountryLegally = (res.yearsInCountryLegally || 0) + 1;
    const rules = SKILLED_MIGRATION_RULES[S.country];

    /* Gulf no-PR note, said plainly once: years here never convert. */
    if (rules && rules.prYears == null && !res._prBlockedNoted) {
      res._prBlockedNoted = true;
      recordJournal(S, `Year ${res.yearsInCountryLegally} of legal residence in ${getCountry(S.country).name} — but there is no permanent residency route for expats here, so these years will never convert to PR or citizenship.`, 'visa');
    }

    if (rules && rules.prYears && res.kind === 'work_visa' && res.yearsInCountryLegally >= rules.prYears && S.career.employed) {
      transitionResidency(S, 'permanent_resident', { permitName: `${getCountry(S.country).adjective} Permanent Residency`, expiresYear: null, force: true });
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 12);
      recordJournal(S, `Granted ${res.permitName} after ${res.yearsInCountryLegally} years of legal skilled residence!`, 'milestone');
    } else if (
      rules &&
      rules.citizenshipNaturalization &&
      res.kind === 'permanent_resident' &&
      res.yearsInCountryLegally >= (rules.citizenshipYears || 6)
    ) {
      /* Citizenship is an APPLICATION the player chooses (was: auto-granted
         silently in December). Germany requires renouncing prior
         citizenships; children gain the new citizenship with the player. */
      const cObj = getCountry(S.country);
      const citFee = Math.round(convertCurrency(1000, 'usa', S.country, S.year));
      queueScene(S,buildMonthlyResidencyScene(S,{type:'citizenship',country:S.country,year:S.year,fee:citFee,legalYears:res.yearsInCountryLegally}),true);
    }
  }
}

/* ============================================================================
   5. CONSULAR TOURIST VISAS (moved here from completeLifeSystems — D7: one
   visa store, owned by the visa engine; the tick above expires them).
   ========================================================================== */
export const CONSULAR_TOURIST_VISAS = [
  { id: 'schengen_c', regionLabel: 'Schengen Area (EU)', covers: ['deu', 'fra', 'ita', 'nld'], feeUsd: 98, validYears: 2, minBankUsd: 3200, ruleCode: 'Schengen Art. 32' },
  { id: 'us_b1b2',    regionLabel: 'USA B1/B2 10-Year',  covers: ['usa'],                     feeUsd: 185, validYears: 10, minBankUsd: 4800, ruleCode: 'INA §214(b)' },
  { id: 'uk_visitor', regionLabel: 'UK Standard Visitor',covers: ['gbr'],                     feeUsd: 145, validYears: 2, minBankUsd: 3800, ruleCode: 'Appendix V 4.2' },
  { id: 'can_trv',    regionLabel: 'Canada Multi-TRV',   covers: ['can'],                     feeUsd: 135, validYears: 5, minBankUsd: 4000, ruleCode: 'IRPR §179(b)' },
  { id: 'jpn_evisa',  regionLabel: 'Japan Tourist eVisa',covers: ['jpn'],                     feeUsd: 45,  validYears: 1, minBankUsd: 2400, ruleCode: 'MOFA Criteria' }
];

const HIGH_MOBILITY_PASSPORTS = new Set(['uae', 'deu', 'fra', 'ita', 'nld', 'gbr', 'usa', 'can', 'aus', 'jpn', 'sgp']);

export function needsTouristVisaFor(S, destCountry) {
  if (!destCountry || destCountry === S.country) return null;
  if (S.legal.citizenships.includes(destCountry)) return null;
  if (S.legal.passports.some(p=>S.legal.citizenships.includes(p.country)&&p.expiresYear>S.year&&HIGH_MOBILITY_PASSPORTS.has(p.country))) return null;
  // Permanent residents / EU / Gulf Golden Visa holders get streamlined regional access, except US/UK/Schengen still require consular foils for EGY/IND passports unless already holding visa
  const reqSpec = CONSULAR_TOURIST_VISAS.find(v => v.covers.includes(destCountry));
  if (!reqSpec) return null;
  const active = (S.legal.touristVisas || []).find(tv => tv.id === reqSpec.id && tv.expiresYear > S.year);
  return active ? null : reqSpec;
}

export function applyConsularTouristVisa(S, visaId) {
  ensureExtendedState(S);
  const spec = CONSULAR_TOURIST_VISAS.find(v => v.id === visaId);
  if (!spec) return { ok: false, msg: 'Visa category not found.' };

  const border = checkCanCrossBorder(S);
  if (!border.ok) return { ok: false, msg: border.reason };
  if (S.legal.criminalRecord) {
    return { ok: false, msg: `Refused (${spec.ruleCode}): Criminal record inadmissibility.` };
  }

  const existing = S.legal.touristVisas.find(tv => tv.id === spec.id && tv.expiresYear > S.year);
  if (existing) {
    return { ok: false, msg: `Already stamped in passport (valid until ${existing.expiresYear}).` };
  }

  const feeLocal = Math.round(convertCurrency(spec.feeUsd, 'usa', S.country, S.year));
  if (S.money.cash < feeLocal) {
    return { ok: false, msg: `Need ${formatMoney(feeLocal, S.country)} non-refundable biometric embassy fee.` };
  }
  walletMove(S, -feeLocal, `Consular biometric fee: ${spec.regionLabel}`, 'visa');

  // Consular Officer Adjudication: Financial Solvency + Home Ties (Job / Uni / Enterprise / Real Estate / Spouse)
  const liquidTotal = Math.max(0, S.money.cash) + Math.max(0, S.money.savings);
  const reqBankLocal = Math.round(convertCurrency(spec.minBankUsd, 'usa', S.country, S.year));
  const hasHomeTies = !!(S.career.employed&&S.career.job) || getBusinesses(S).some(b=>b&&b.status!=='closed'&&!b.closed&&b.country===S.country) || !!S.education.university || S.housing.properties.some(p=>p.country===S.country) || S.relations.spouseIds.some(id=>S.people[id]?.alive&&S.people[id]?.residenceCountry===S.country);

  if (liquidTotal < reqBankLocal || (!hasHomeTies && S.player.age >= 22)) {
    S.player.vitals.stress = clamp(S.player.vitals.stress + 6);
    const why = liquidTotal < reqBankLocal
      ? `bank statement below ${formatMoney(reqBankLocal, S.country)} solvency threshold`
      : `lack of documented employment, university enrollment, or property ties`;
    recordJournal(
      S,
      `Consular refusal for ${spec.regionLabel} under ${spec.ruleCode} (${why}; ${formatMoney(feeLocal, S.country)} fee forfeited).`,
      'visa'
    );
    return { ok: false, msg: `Visa Refused (${spec.ruleCode}): ${why}!` };
  }

  S.legal.touristVisas = S.legal.touristVisas.filter(tv => tv.id !== spec.id);
  S.legal.touristVisas.push({
    id: spec.id,
    regionLabel: spec.regionLabel,
    issuedYear: S.year,
    expiresYear: S.year + spec.validYears
  });
  recordJournal(
    S,
    `Passport stamped! Granted ${spec.validYears}-year multi-entry ${spec.regionLabel} visa after passing consular bank-statement and home-ties vetting.`,
    'visa'
  );
  return { ok: true, msg: `Approved! ${spec.regionLabel} foil stamped in passport (→ ${S.year + spec.validYears}).` };
}

function buildMonthlyGrace(S,q){const res=S.legal.residency;return {
        key: `grace_expired_${q.year}_${q.month}`,
        category: 'visa',
        title: `Visa Grace Period Expired (${q.year})`,
        text: `Your recorded game grace period in ${getCountry(S.country).name} has ended. Passport now records expired status. Game inspection and return risks apply, not a statement of current local law.`,
        choices: [
          {
            label: `Use return-home route to ${getCountry(S.homeCountry).name}`,
            available: st => st.legal.travelBanInCountry!==st.country,
            effect: (st) => {
              returnToHomeCountry(st);
            }
          },
          {
            label: 'Remain for now · status unchanged',
            effect: (st) => {
              recordJournal(st, `Kept the current expired game status in ${getCountry(st.country).name}. No job or permit was granted.`, 'visa');
            }
          }
        ]
      };}
function buildMonthlyRenewal(S,q){const res=S.legal.residency,kindNow=q.kind,permitNow=q.permitName,renewFee=q.fee,renewalKey=q.key;return {
          key: renewalKey,
          category: 'visa',
          // Title carries the year: a renewal every two years is a recurring
          // real event, and each one is a distinct dated event — the
          // per-title repeat cap must not swallow the 4th renewal of a life.
          title: `${permitNow} Renewal (${q.year})`,
          text: `Your ${permitNow} in ${getCountry(S.country).name} has reached its expiry date. Renew it now for ${formatMoney(renewFee, S.country)} (two more years), or let it lapse into the game two-month grace period.${kindNow === 'gulf_iqama' ? ' Renewal depends on your sponsor agreeing to renew the Iqama.' : ''}`,
          choices: [
            {
              label: `Renew for ${formatMoney(renewFee, S.country)}`,
              available: st => st.money.cash >= renewFee,
              effect: (st) => {
                renewCurrentPermit(st);
              }
            },
            {
              label: 'Let it lapse · game two-month grace',
              effect: (st) => {
                transitionResidency(st, 'grace_period', { permitName: `${permitNow} Expired (60-Day Grace)`, graceMonthsLeft: 2 });
              }
            }
          ]
        };}
function buildMonthlyCitizenship(S,q){const res=S.legal.residency,cObj=getCountry(q.country),citFee=q.fee;return {
        key: `citizenship_offer_${q.year}`,
        category: 'visa',
        title: `Apply for ${cObj.adjective} Citizenship? (${q.year})`,
        text: `After ${res.yearsInCountryLegally} years of legal residence you qualify for this game citizenship route. The application fee is ${formatMoney(citFee, S.country)}.${S.country === 'deu' ? (S.year>2024||(S.year===2024&&S.month>=7)?' This post-June2024game route retains held citizenships; other nationality rules are not fully modelled.':' This pre-July2024game route requires renunciation of previous citizenships, with legal exceptions not modelled.') : ''} Co-resident minor children would gain ${cObj.adjective} citizenship with you.`,
        choices: [
          {
            label: `Apply now (${formatMoney(citFee, S.country)})`,
            available: st => st.money.cash >= citFee,
            effect: (st) => {
              walletMove(st, -citFee, `Naturalisation application (${cObj.name})`, 'visa');
              if (st.country === 'deu' && (st.year<2024||(st.year===2024&&st.month<7))) {
                const renounced = st.legal.citizenships.filter(c => c !== 'deu');
                st.legal.citizenships = ['deu'];
                st.legal.passports = st.legal.passports.filter(p => p.country === 'deu');
                if (renounced.length) recordJournal(st, `Renounced ${renounced.map(c => getCountry(c).adjective).join(', ')} citizenship under this historical game route.`, 'visa');
              } else if (!st.legal.citizenships.includes(st.country)) {
                st.legal.citizenships.push(st.country);
              }
              const passport=st.legal.passports.find(p=>p.country===st.country);if(passport)Object.assign(passport,{issuedYear:st.year,expiresYear:st.year+10});else st.legal.passports.push({ country: st.country, issuedYear: st.year, expiresYear: st.year + 10 });
              transitionResidency(st, 'citizen', { permitName: `${cObj.adjective} Citizenship`, force: true });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 16);
              for (const cid of st.relations.childIds) {
                const ch = st.people[cid];
                if (ch && ch.alive && ch.age < 18 && ch.residenceCountry===st.country && !(ch.citizenships||[]).includes(st.country)) {
                  ch.citizenships??=[];
                  ch.citizenships.push(st.country);
                }
              }
              recordJournal(st, `Sworn in as a naturalized ${cObj.adjective} citizen and received your ${cObj.adjective} passport!`, 'milestone');
            }
          },
          {
            label: 'Defer — stay a permanent resident for now',
            effect: (st) => {
              recordJournal(st, 'Deferred the citizenship application — it will be offered again next year.', 'visa');
            }
          }
        ]
      };}
export function buildMonthlyResidencyScene(S,q){
 const valid=st=>{const r=st.legal.residency;if(st.country!==q.country)return false;
 if(q.type==='grace')return r.kind==='undocumented'&&st.homeCountry===q.homeCountry;
 if(q.type==='renewal')return r.kind===q.kind&&r.expiresYear===q.expiresYear&&r.expiresMonth===q.expiresMonth&&permitRenewalQuote(st).ok&&permitRenewalQuote(st).fee===q.fee;
 const rules=SKILLED_MIGRATION_RULES[q.country];return r.kind==='permanent_resident'&&rules?.citizenshipNaturalization&&r.yearsInCountryLegally>=(rules.citizenshipYears||6)&&st.year===q.year&&!st.legal.citizenships.includes(q.country);};
 if(!valid(S))return null;
 const scene=q.type==='grace'?buildMonthlyGrace(S,q):q.type==='renewal'?buildMonthlyRenewal(S,q):buildMonthlyCitizenship(S,q);
 scene.monthlyResidencySnapshot=q;
 scene.choices=scene.choices.map(c=>({...c,available:st=>valid(st)&&(!c.available||c.available(st)),effect:st=>{if(!valid(st)||c.available&&!c.available(st))return;st.legal.residencyReplies??={};if(st.legal.residencyReplies[scene.key])return;const result=c.effect?.(st);if(result?.ok===false&&!result.refused)return result;st.legal.residencyReplies[scene.key]=true;return result;}}));
 return scene;
}
export function restoreMonthlyResidencyScene(S,saved){
 if(saved?.monthlyResidencySnapshot)return buildMonthlyResidencyScene(S,saved.monthlyResidencySnapshot);
 const r=S.legal.residency,key=saved?.key||'';let q;
 if(key===`renewal_${r.kind}_${r.expiresYear}_${r.expiresMonth}`){const price=permitRenewalQuote(S);if(price.ok)q={type:'renewal',country:S.country,kind:r.kind,permitName:r.permitName,fee:price.fee,expiresYear:r.expiresYear,expiresMonth:r.expiresMonth,key,year:S.year};}
 if(key===`citizenship_offer_${S.year}`)q={type:'citizenship',country:S.country,year:S.year,fee:Math.round(convertCurrency(1000,'usa',S.country,S.year)),legalYears:r.yearsInCountryLegally};
 if(key===`grace_expired_${S.year}_${S.month}`)q={type:'grace',country:S.country,homeCountry:S.homeCountry,year:S.year,month:S.month};
 return q?buildMonthlyResidencyScene(S,q):null;
}

export function restoreRelocationBusinessScene(S,saved){
 const pending=S.pendingRelocation;if(!pending)return null;
 const q=saved?.relocationBusinessSnapshot||(saved?.baseId?.startsWith('biz_relocate_')?{bizId:saved.baseId.slice(13),destCountry:pending.destCountry}:null);
 if(!q||q.destCountry!==pending.destCountry||!pending.remaining.includes(q.bizId))return null;
 const choice=buildRelocationBusinessChoices(S).find(c=>c.bizId===q.bizId);return choice?buildRelocationBusinessScene(S,choice):null;
}
