import {restoreSpouseConversation,spouseConversationCurrent} from '../systems/spouseAutonomy.js';
import { discretionaryLock } from './discretionary.js';
import {restoreCourtshipScene,courtshipSceneCurrent} from '../systems/courtshipLife.js';
import{restoreAgingSignScene}from'../systems/mortalityModel.js';
import{restoreScholarshipEndedScene}from'../systems/educationFunding.js';
import{restoreBusinessFateScene}from'../systems/businessFate.js';
import{restoreLandlordScene}from'../systems/propertyLandlord.js';
import{restoreInformationScene}from'../systems/completeLifeSystems.js';
import{restoreRelocationBusinessScene,restoreMonthlyResidencyScene}from'../systems/visaMigrationEngine.js';
import{restoreCareerMobilityScene,restoreCareerReviewScene,restoreCareerWarningScene,restorePromotionInterviewScene}from'../systems/careerActions.js';
import{restoreDiagnosisScene,restoreBurnoutScene,restoreCriticalAdmissionScene}from'../systems/healthDirectorEngine.js';
import{restoreDebtWarningScene,buildInsolvencyScene}from'../systems/economyEngine.js';
import{restoreCrisisWarningScene,restoreRedundancyScene,restoreJobLossReactionScene}from'../systems/careerConsequences.js';
import{restoreNpcWeddingScene,restoreFamilyBackingScene,restoreBereavementScene,restoreParentCareSupportScene,restoreGrownChildGiftScene,restoreNpcBirthScene,restoreNpcFamilyTransitionScene,restorePromiseConfrontationScene}from'../systems/soulEngine.js';
import{restoreHealthcareGraduateScene,restoreRecruitmentScene}from'../systems/careerEducationEngine.js';
import{restoreWorldNewsScene}from'../systems/worldEvents.js';
import{buildWaterDamageScene}from'../systems/homeWaterDamage.js';
import{tickPeopleAutonomy}from '../systems/peopleAutonomy.js';
/* ============================================================================
   World Life 2.0 — Adaptive Clock & Master Turn Orchestrator (gameLoop.js)
   - Ages 0–17: Yearly turns (fast childhood pacing, zero adult money clutter)
   - Ages 18+: Monthly turns (exact paychecks, bills, visas, pregnancy) +
     Smart Fast-Forward ("Advance 1 Year / Until Event") with instant pause!
   ========================================================================== */

import { chance } from './rng.js';
import { recordJournal, queueScene, ambitionProgress, computeNetWorthLocal, ensureExtendedState, syncPlayerCareerMirror, liquidFundsLocal } from './schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraSalary, goldPricePerGram } from '../data/economy.js';
import { restorePeopleDecision, ensureSocialCast, tickNpcAutonomyYearly, maybePickDominoSoulScene } from '../systems/soulEngine.js';
import { restoreKeysScene, restoreHomeScene } from '../systems/familyFortune.js';
import { offerJobRecordRepair, restoreJobRecordRepairScene } from '../systems/jobRecordRepair.js';
import { tickFamilyFortuneYearly, tickFamilyFortuneMonthly } from '../systems/familyFortune.js';
import { settleHouseholdMonth, settleChildAllowanceYear, tickAssetsAnnually } from '../systems/economyEngine.js';
/* v2.15 W3 — social energy: the yearly childhood turn refills the budget
   (childhood has no monthly settlement to do it). */
import { restoreDriftNoticeScene, refillSocialEnergy } from '../systems/socialEnergy.js'; /* v2.15 W3 */
import {
  restoreEducationDecision,
  tickEducationYearly,
  tickUniversityAndConscriptionMonthly,
  tickCareerMonthly
} from '../systems/careerEducationEngine.js';
import { tickVisaAndLegalMonthly } from '../systems/visaMigrationEngine.js';
import { tickCareerActionsMonthly } from '../systems/careerActions.js';
import { tickMarriageAndFamilyMonthly,restoreDivorceDecision } from '../systems/marriageFamilyEngine.js';
import { tickHealthAndMortalityYearly, pickCuratedLifeScene,restoreCuratedLifeScene } from '../systems/healthDirectorEngine.js';
import { getCurrentChapter, noteChapterChange, ambitionStatus, noteAmbitionOutcome } from '../systems/storyLibrary.js';
import { tickMegaSystemsMonthly } from '../systems/completeLifeSystems.js';
import { checkBusinessFate } from '../systems/businessFate.js';
/* v2.18 W2 §3 — job loss reaches the mortgage, spouse, children and visa; crisis years warn, freeze pay and risk redundancy. */
import { checkCareerConsequences } from '../systems/careerConsequences.js';
import { noteRandomLifeEventFired, isRandomLifeSceneCurrent, restoreRandomLifeScene } from '../systems/eventEngine.js';
/* v2.15 W4 — era world events fire on the calendar tick. */
import { tickWorldEvents } from '../systems/worldEvents.js';
/* v2.15 W2 — career market monthly tick (headhunters, rivals, pension
   growth, teamwork drift). Runs on its own seeded stream, never the
   game's main stream. */
import { tickCareerMarketMonth } from '../systems/careerMarket.js';
import { snapshotMajor, announceMajorChanges, tickCarCrashes, restoreMajorScene } from '../systems/majorLifeEvents.js';

const PERSIST_KEY = 'world_life_2_save_v1';

/* A career review or warning is about one job. Once that job is gone it is a no-op that would keep blocking the turn. */
function careerSnapshotSceneStale(S,scene){
  if(scene?.careerReviewSnapshot)return !restoreCareerReviewScene(S,scene);
  if(scene?.careerWarningSnapshot)return !restoreCareerWarningScene(S,scene);
  return false;
}
function discardOutdatedRandomScenes(S) {
  S.sceneQueue = (S.sceneQueue || []).filter(scene => !careerSnapshotSceneStale(S,scene)&&!scene.familyBufferId&&isRandomLifeSceneCurrent(scene, S)&&courtshipSceneCurrent(S,scene)&&spouseConversationCurrent(S,scene));
  if (S.activeScene && (careerSnapshotSceneStale(S,S.activeScene)||S.activeScene.familyBufferId||!isRandomLifeSceneCurrent(S.activeScene, S)||!courtshipSceneCurrent(S,S.activeScene)||!spouseConversationCurrent(S,S.activeScene))) {
    S.activeScene = null;
    recordJournal(S, 'Circumstances changed before that decision could be made. The old situation no longer applies.', 'life');
  }
}


export function saveGameToStorage(S) {
  try {
    /* v2.9 B8(a): the player-career mirror is re-synced at every save, so
       no persisted state ever carries a stale copy. Guarded so a mirror
       fault can never break persistence. */
    try { syncPlayerCareerMirror(S); } catch (_) {}
    if (typeof localStorage !== 'undefined' && S) {
      localStorage.setItem(PERSIST_KEY, JSON.stringify(S));
    }
  } catch (_) {}
}

export function loadGameFromStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.version && parsed.player) {
      ensureExtendedState(parsed);
      const restore = scene => {
        if (!scene || scene.familyBufferId) return null;
        if(!scene.eventId&&scene.key==='formal_bankruptcy_filing')return parsed.money.cash<0&&parsed.year>parsed.money.bankruptUntilYear?buildInsolvencyScene(parsed):null;
        if (!scene.eventId&&scene.key==='st_upstairs_pipe_leak')return buildWaterDamageScene(parsed);
        if (!scene.eventId) return restoreKeysScene(parsed,scene) || restoreHomeScene(parsed,scene) || restoreJobRecordRepairScene(parsed,scene) || restoreScholarshipEndedScene(parsed,scene) || restoreAgingSignScene(parsed,scene) || restorePromotionInterviewScene(parsed,scene) || restoreMajorScene(parsed,scene) || restoreSpouseConversation(parsed,scene) || restoreCourtshipScene(parsed,scene) || restoreBusinessFateScene(parsed,scene) || restoreLandlordScene(parsed,scene) || restoreInformationScene(parsed,scene) || restoreHealthcareGraduateScene(parsed,scene) || restoreRelocationBusinessScene(parsed,scene) || restoreMonthlyResidencyScene(parsed,scene) || restoreDebtWarningScene(parsed,scene) || restoreCareerMobilityScene(parsed,scene) || restoreDiagnosisScene(parsed,scene) || restoreJobLossReactionScene(parsed,scene) || restoreRedundancyScene(parsed,scene) || restorePromiseConfrontationScene(parsed,scene) || restoreNpcFamilyTransitionScene(parsed,scene) || restoreNpcBirthScene(parsed,scene) || restoreGrownChildGiftScene(parsed,scene) || restoreParentCareSupportScene(parsed,scene) || restoreBereavementScene(parsed,scene) || restoreCareerWarningScene(parsed,scene) || restoreCareerReviewScene(parsed,scene) || restoreFamilyBackingScene(parsed,scene) || restoreCriticalAdmissionScene(parsed,scene) || restoreBurnoutScene(parsed,scene) || restoreCrisisWarningScene(parsed,scene) || restoreNpcWeddingScene(parsed,scene) || restoreRecruitmentScene(parsed,scene) || restoreWorldNewsScene(parsed,scene) || restoreCuratedLifeScene(parsed,scene) || restoreDivorceDecision(parsed,scene) || restoreEducationDecision(parsed, scene) || restoreDriftNoticeScene(parsed, scene) || restorePeopleDecision(parsed, scene) || (scene.choices?.every(choice => typeof choice.effect === 'function') ? scene : null);
        return restoreRandomLifeScene(parsed, scene);
      };
      const pending = parsed.activeScene;
      parsed.activeScene = restore(pending);
      parsed.sceneQueue = (parsed.sceneQueue || []).map(restore).filter(Boolean);
      if (pending && !parsed.activeScene) {
        recordJournal(parsed, 'A saved decision no longer matched your current life and was set aside. No choice was made for you.', 'life');
      }
      return parsed;
    }
  } catch (_) {}
  return null;
}

/* v2.13 Worker 4 — REAL net-worth history, going forward only.
   One snapshot per game year, computed with computeNetWorthLocal — the SAME
   function the Finance tab and HUD already use to show net worth, so the
   chart can never disagree with the number on screen. Seeded empty for old
   saves (S.financeHistory is created here on first call); earlier years are
   NEVER backfilled — the chart says plainly where recording started.
   v2.18 W3 — recorded from the yearly advance (advanceSingleTurn), NOT
   from the render. The function is idempotent per year (a second call in
   the same year is a no-op), so the two render call sites (renderApp,
   renderFinanceTabHtml) stay as a safety net for years reached without an
   advance, but the advance is now the one place a new year's snapshot is
   first written — at the end of the turn, after that year's settlement,
   so the value is exactly the number Finance shows. Existing snapshots
   are never rewritten, so chart values cannot change. */
export function recordFinanceHistorySnapshot(S) {
  if (!S) return null;
  if (!Array.isArray(S.financeHistory)) S.financeHistory = [];
  const year = Number(S.year) || 0;
  const existing = S.financeHistory.find(h => h && Number(h.year) === year);
  if (existing) return existing;
  const snap = {
    year,
    age: S.player ? Number(S.player.age) || 0 : 0,
    netWorth: computeNetWorthLocal(S),
    currency: getCountry(S.country).currency
  };
  S.financeHistory.push(snap);
  S.financeHistory.sort((a, b) => Number(a.year) - Number(b.year));
  return snap;
}

/* Evaluate starter & ambition goals cleanly on every turn */
export function refreshGoalsProgress(S) {
  if (!S || !Array.isArray(S.goals)) return;
  const cObj = getCountry(S.country);
  const netWorth = computeNetWorthLocal(S);
  const annualBenchmark = eraSalary(cObj.annualSalaryTiers2026.mid, S.country, S.year);

  for (const g of S.goals) {
    if (g.done) continue;
    if (g.id === 'g_grad' && (S.education.degrees.length > 0 || (S.education.highSchoolScore != null && S.education.stage !== 'high'))) { /* the recorded exam result and the recorded stage change (graduated_high) are what complete school, not an age */
      g.done = true;
    }
    if (g.id === 'g_income' && ((S.career.employed && (S.career.job?.monthlyGross || 0) > 0) || S.career.business)) {
      g.done = true;
    }
    if (g.id === 'g_home' && S.housing.properties.length > 0) {
      g.done = true;
    }
    const closeCircle = Object.values(S.people).filter(p => p && p.alive && p.id !== 'player' && p.rel?.affection >= 75).length;
    if (g.id === 'g_family' && (S.relations.spouseIds.length > 0 || closeCircle >= 3)) {
      g.done = true;
    }
    if (g.id === 'g_ambition') {
      if(ambitionProgress(S).complete)g.done=true;
    }
    /* v2.12 item 1 — a save-for-this goal is done when the money is saved:
       liquid funds (cash + savings) reach the goal's target price. */
    if (g.kind === 'save_property' && !g.done && liquidFundsLocal(S) >= (g.target || 0)) {
      g.done = true;
    }
    /* v2.13 — stamp WHEN a goal completed, on the transition only (goals
       already done keep no stamp, so nothing is ever backdated or guessed).
       The progress system needs the stamp: a goal that completes at age 0
       is birth circumstance (g_family completes on the first advance
       because a newborn's family already counts as a trusted circle), not
       something the player did, and must not earn the Goal Completed
       milestone. */
    if (g.done) { g.doneYear = S.year; g.doneAge = S.player ? S.player.age : 0; }
  }
}

function emitHistoricalHeadlineIfAny(S) {
  const cObj = getCountry(S.country);
  const line = cObj.historicalHeadlines?.[S.year];
  if (line && !S.cooldowns[`hist_${S.country}_${S.year}`]) {
    S.cooldowns[`hist_${S.country}_${S.year}`] = 999999;
    recordJournal(S, `${S.year} in ${cObj.name}: ${line}`, 'world');
  }
}

/* THE one ageing site. Everyone — player and NPCs — ages on their own birth
   month, not in January: age = years since birthYear, minus one until the
   birth month arrives. (Behaviour change, stated plainly: a player born in
   November is still 17 in September of the year they turn 18, and NPC ages
   no longer jump a year early in January either.) */
function ageForBirthYear(S, person) {
  const bm = person.birthMonth || 1;
  return Math.max(0, S.year - person.birthYear - (S.month < bm ? 1 : 0));
}

export function ageAllPeople(S) {
  if (!S) return;
  if (S.player) S.player.age = ageForBirthYear(S, S.player);
  for (const p of Object.values(S.people || {})) {
    if (!p || !p.alive || p.id === 'player') continue;
    p.age = ageForBirthYear(S, p);
  }
}

/* v2.10 — WORLD-ONLY TICK (the freeze fix).
   Plain design: while the player's scene is open, the world keeps living
   but the player does not. Each blocked call adds world time to an
   accumulator, S.worldPendingMonths — 1 month per call while the adult
   clock runs monthly, 12 months per call while the childhood clock runs
   yearly (one blocked childhood call is one year of world time). Every
   time 12 months accumulate, one tickNpcAutonomyYearly(S) runs: NPCs get
   their yearly raises and savings, retire, break overdue promises, and
   die by the mortality inside that tick. Their life events accumulate as
   journal lines and queued scenes behind the player's open scene, so the
   player hears about them when they answer.
   What does NOT happen here: the player's scene is never resolved or
   replaced (S.activeScene untouched, same object); the player's own age,
   year, month and turn never advance; no player salary, bills, visa,
   education, career or health ticks run; no new player scene is rolled.
   Honest limit, stated plainly: NPC numeric ages are derived from the
   shared calendar (ageForBirthYear from S.year), so while the player's
   clock is frozen the NPCs' numeric ages cannot advance either. What
   advances is their LIVES — jobs, savings, marriages, births, moves,
   divorces, deaths — not the number on their card. */
export function tickWorldWhileSceneOpen(S) {
  if (!S || S.gameOver || !S.activeScene) return { pausedForScene: !!S?.activeScene, worldTicked: false, worldYears: 0 };
  if (typeof S.worldPendingMonths !== 'number' || !isFinite(S.worldPendingMonths)) S.worldPendingMonths = 0;
  /* tickNpcAutonomyYearly is a YEARLY tick: running a full year of NPC
     life per blocked call would inflate NPC events twelvefold in monthly
     pacing, so world time is banked and spent one year at a time. */
  S.worldPendingMonths += S.pacing === 'monthly' ? 1 : 12;
  let worldYears = 0;
  while (S.worldPendingMonths >= 12) {
    S.worldPendingMonths -= 12;
    tickNpcAutonomyYearly(S);
    worldYears += 1;
  }
  discardOutdatedRandomScenes(S);
  saveGameToStorage(S);
  return { pausedForScene: !!S.activeScene, worldTicked: worldYears > 0, worldYears };
}

/* Advance a single logical step (1 Year if <18, 1 Month if 18+) */
export function advanceSingleTurn(S) {
  if (!S || S.gameOver) return { pausedForScene: false };
  ensureExtendedState(S);
  discardOutdatedRandomScenes(S);
  /* v2.10 — THE FREEZE FIX (audit §1): the world used to stop entirely
     while a scene stayed open, because this function returned immediately.
     Now a blocked call runs a world-only step instead (below). The player's
     scene is never auto-resolved and the player's own clock never moves. */
  if (S.activeScene) return tickWorldWhileSceneOpen(S);

  S.turn += 1;
  const majorBefore = snapshotMajor(S);

  if (S.player.age < 18) {
    /* ---- YEARLY CHILDHOOD TURN ---- */
    S.pacing = 'yearly';
    S.year += 1;
    S.month = 9; // School year anchor
    ageAllPeople(S);

    emitHistoricalHeadlineIfAny(S);
    /* v2.15 W4 — a world event whose date range covers this year fires
       now (news scene, prices move). */
    tickWorldEvents(S);
    ensureSocialCast(S);
    tickNpcAutonomyYearly(S);
    tickPeopleAutonomy(S);
    refillSocialEnergy(S); /* v2.15 W3 — one year-turn is one refill (see import note above). */
    tickEducationYearly(S);
    tickHealthAndMortalityYearly(S);
    tickFamilyFortuneYearly(S); /* v2.21 — childhood years also revalue the fortune and fund the trust */
    settleChildAllowanceYear(S); // v2.7: named pocket money from parents (ages 6–17)
    /* v2.9 B10: refresh the stored gold price on the yearly path too, so a
       child holding gold never carries a stale/zero cache into adulthood. */
    if (S.money) S.money._lastGoldUnitPrice = goldPricePerGram(S.country, S.year, 21);
    /* v2.18 W3 — the year's net-worth snapshot is recorded here, at the
       end of the yearly turn, after every money tick above. */
    recordFinanceHistorySnapshot(S);

    /* Switch seamlessly to Monthly Adaptive Realism at age 18! */
    if (S.player.age >= 18) {
      S.pacing = 'monthly';
      // Keep September: entering adulthood must not rewind the calendar.
    }

    announceMajorChanges(S, majorBefore);
    /* Deal queued scene or occasional childhood story scene */
    if (!S.activeScene && S.sceneQueue.length > 0) {
      S.activeScene = S.sceneQueue.shift();
    } else if (!S.activeScene && S.player.age >= 7 && chance(S, 0.42)) {
      const sc = pickCuratedLifeScene(S);
      if (sc && queueScene(S, sc)) noteRandomLifeEventFired(S, sc);
    }
  } else {
    /* ---- MONTHLY ADULTHOOD TURN ---- */
    S.pacing = 'monthly';
    S.month += 1;
    let crossedNewYear = false;
    if (S.month > 12) {
      S.month = 1;
      S.year += 1;
      crossedNewYear = true;
    }

    /* Birth-month ageing (one site — see ageAllPeople above) */
    ageAllPeople(S);

    if (crossedNewYear) {
      emitHistoricalHeadlineIfAny(S);
      tickAssetsAnnually(S);
      tickFamilyFortuneYearly(S); /* v2.21 — the family's fortune revalues, its company has a year, trust is funded */
      tickNpcAutonomyYearly(S);
      tickEducationYearly(S); // Enforces strict 21+ Tansik age-out
      tickHealthAndMortalityYearly(S);
    }

    /* v2.15 W4 — fire this month's world events BEFORE the settlement,
       so the month the crisis starts, pay, business revenue and savings
       already feel it. */
    tickWorldEvents(S);

    if (!S.gameOver) {
      /* Visa first: a spouse who becomes undocumented this month must not
         earn a full month's salary in the settlement that follows. */
      tickUniversityAndConscriptionMonthly(S);
      tickCareerMonthly(S);
      tickCareerMarketMonth(S); /* v2.15 W2 — headhunters, rivals, pension growth */
      tickCareerActionsMonthly(S); // v2.8 §3: review, warnings, licence lapse, notice
      tickVisaAndLegalMonthly(S);
      offerJobRecordRepair(S); /* old placeholder job record: the player decides, nothing is rewritten for them */
      tickFamilyFortuneMonthly(S); /* v2.21 — seeds the fortune the first time, releases the trust at 18/21/25 */
      settleHouseholdMonth(S);
      checkBusinessFate(S); /* v2.17 W5 §6 — a failing or booming business reaches the rest of the life (bank, spouse, friends) */
      checkCareerConsequences(S); /* v2.18 W2 §3 — job loss reaches the mortgage, spouse, children and visa; crisis years warn, freeze pay and risk redundancy */
      tickMegaSystemsMonthly(S);
      tickMarriageAndFamilyMonthly(S);
      tickPeopleAutonomy(S);
    }
    /* v2.18 W3 — the new year's net-worth snapshot is recorded here, at
       the end of the year-crossing turn, after the January settlement
       above — the same numbers the Finance chart reads. Idempotent per
       year, so a later render can never duplicate it. */
    if (crossedNewYear) recordFinanceHistorySnapshot(S);

    if (!S.gameOver) { tickCarCrashes(S); announceMajorChanges(S, majorBefore); }
    /* Drain queued urgent/follow-up scenes first, then roll Domino Soul reactions or Curated Life scenes */
    if (!S.activeScene && !S.gameOver) {
      if (S.sceneQueue.length > 0) {
        S.activeScene = S.sceneQueue.shift();
      } else if (chance(S, 0.24)) {
        const domino = maybePickDominoSoulScene(S);
        if (domino) {
          queueScene(S, domino);
        } else {
          const curated = pickCuratedLifeScene(S);
          if (curated && queueScene(S, curated)) noteRandomLifeEventFired(S, curated);
        }
      }
    }
  }

  syncPlayerCareerMirror(S); // v2.9 B8(a): mirror the real job at every turn end.
  refreshGoalsProgress(S);
  /* v2.10 — record chapter/ambition changes at the turn itself, not only
     when the Timeline renders: both helpers are idempotent (first chapter
     is recorded silently, later changes journalled once each; ambition
     outcome logged once per state), so calling them here and in the
     Timeline render can never double-write. */
  try { noteChapterChange(S, getCurrentChapter(S)); } catch (_) {}
  try { noteAmbitionOutcome(S, ambitionStatus(S)); } catch (_) {}
  saveGameToStorage(S);
  return { pausedForScene: !!S.activeScene, gameOver: !!S.gameOver };
}

/* Smart Fast-Forward: runs up to N months (e.g., 12 months = 1 Full Year) and
   immediately stops the moment a decision card or crisis requires the player! */
export function fastForwardTurns(S, maxSteps = 12) {
  if (!S || S.gameOver || S.activeScene) return { stepsRun: 0, pausedForScene: !!S.activeScene };
  if (S.player.age < 18) {
    advanceSingleTurn(S);
    return { stepsRun: 1, pausedForScene: !!S.activeScene };
  }
  let stepsRun = 0;
  for (let i = 0; i < maxSteps; i++) {
    const res = advanceSingleTurn(S);
    stepsRun += 1;
    if (res.pausedForScene || res.gameOver) break;
  }
  return { stepsRun, pausedForScene: !!S.activeScene };
}

/* Resolve the player's choice on an open scene cleanly — NEVER logs raw button labels! */
export function resolveActiveSceneChoice(S, choiceIdx) {
  if (!S || !S.activeScene) return { ok: false };
  discardOutdatedRandomScenes(S);
  if (!S.activeScene) return { ok: false, reason: 'circumstances_changed' };
  const scene = S.activeScene;
  if (/^npc_(gift_|ask_help_|conversation_)/.test(scene.baseId || '') && !S.people[scene.speakerId]?.alive) {
    S.activeScene = null;
    recordJournal(S, 'That conversation is no longer possible. No choice was made.', 'relationship');
    saveGameToStorage(S);
    return { ok: false, reason: 'circumstances_changed' };
  }
  // UI data-idx is the original array index, not the position after filtering.
  if (!Number.isInteger(choiceIdx) || choiceIdx < 0) return { ok: false, reason: 'invalid_choice' };
  const chosen = scene.choices[choiceIdx];
  if (!chosen) return { ok: false, reason: 'invalid_choice' };
  if (typeof chosen.available === 'function' && !chosen.available(S)) return { ok: false, reason: 'unavailable' };
  if (discretionaryLock(S, scene, chosen)) return { ok: false, reason: 'unavailable' };
  if (typeof chosen.effect !== 'function') return { ok: false, reason: 'missing_effect' };

  S.activeScene = null;
  const journalHeadBefore = S.journal[0]?.id; /* newest entry, not length: the journal is capped, so its length stops changing */
  if (typeof chosen.effect === 'function') {
    chosen.effect(S);
  }
  /* Guarantee outcome is always recorded in human words if effect didn't write one */
  if ((S.journal[0]?.id) === journalHeadBefore) {
    const lbl = typeof chosen.label === 'function' ? chosen.label(S) : chosen.label;
    /* a plain sentence, not a card title and a button label glued with a colon */
    const said = String(lbl).replace(/[.!\s]+$/, '');
    const quoted = /^(understood|ok|okay|continue|got it|acknowledge|review expenses without moving money)$/i.test(said);
    recordJournal(S, quoted ? `${scene.title}: you acknowledged it.` : `On "${scene.title}", you chose: ${said}.`, scene.category || 'life');
  }

  /* Drain next urgent scene if one is waiting */
  if (!S.activeScene && S.sceneQueue.length > 0 && S.sceneQueue[0].urgent) {
    S.activeScene = S.sceneQueue.shift();
  }

  refreshGoalsProgress(S);
  saveGameToStorage(S);
  return { ok: true };
}
