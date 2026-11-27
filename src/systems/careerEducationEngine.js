import { isSeriousCondition } from './mortalityModel.js';
import { payShape, payRatio } from './payShape.js';
import { familyNameInterviewPoints, internshipReferencePoints } from './familyName.js';
import{recordCivilLoss}from'./civilClaims.js';
import{careerHours}from'./careerSchedule.js';
import{usStatePension}from './usRetirement.js';
import {hasCurrentLanguage} from '../data/languageQualifications.js';
import {annualUniversityBudget,universityBudgetRange} from '../data/universityCosts.js';
import {degreeProgramFor,programsForCountry} from '../data/degreePrograms.js';
import {canonicalUniversityId,universitySectorLabel} from '../data/institutions.js';
/* ============================================================================
   World Life 2.0 — Education, National Exams, Conscription, Career & Business
   Strict age-outs, real exam cutoffs (Tansik / UCAS / SAT / Abitur), authentic
   conscription rules, CV-verified job offers, boss politics, and enterprises.
   ========================================================================== */

import { presentAbroadDestinations, studyAbroadOpen, restoreAbroadDecision } from './studyAbroadScenes.js';
import { familyCoversUniversity,chargeFamilyEducation } from './educationFunding.js';
import { rand, randInt, pick, chance, clamp } from '../core/rng.js';
import { nextId, recordJournal, walletMove, moveBalance, queueScene, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraSalary, wageFactor, statutoryMinMonthlyGross, eraLocalCost, convertCurrency, computePayslip, contractRuleFor, vacationEntitlementDays, noticeAndSeveranceFor, eraDepositRates } from '../data/economy.js';
import {
  MAJORS,
  CAREER_TRACKS,
  getSchoolsFor,
  getUniversitiesFor,
  getEmployersFor
} from '../data/institutions.js';
import { SCHOLARSHIPS, INTERNSHIPS, CLUBS, SCHOOL_TRACKS, EGY_TANSIK_REAL, EGY_TANSIK_UNI_DELTA, TRACK_SYSTEM_INFO } from '../data/educationExtras.js';
import {
  PROFESSIONAL_LICENSES,
  V1_CAREER_TRACKS,
  EXTRA_MODERN_TRACKS,
  V1_COMPANIES_BY_COUNTRY,
  EXTRA_REAL_COMPANIES
} from '../data/megaCareerEduMedical.js';
import { emitFact, spawnUniversityPeer, spawnWorkplaceCast, rememberDeed } from './soulEngine.js';
/* v2.18 W1 (§1) — real work inside the job: one piece of work a month,
   resolved by the player's choice. The ONLY call the engine makes in. */
import { maybeAssignCareerWork } from './careerWork.js';
import { transitionResidency,grantGameGraduatePermit } from './visaMigrationEngine.js';
import {
  listAllBusinessVentures,
  createBusiness,
  expandBusiness,
  sellBusiness,
  setBusinessMode as setBusinessModeEngine
} from './businessEngine.js';
/* v2.11 W1 — listAllBusinessVentures now lives in businessEngine.js
   (the one merged, era-filtered catalogue); re-exported here so every
   existing caller keeps working. */
export { listAllBusinessVentures };

function buildHighSchoolStrategyScene(S) {
  const cObj = getCountry(S.country);
    const examName = cObj.examSystem.name;
    const tutorLabel = cObj.examSystem.tutoringLabel;
    const tutorBudget=eraLocalCost((cObj.examSystem.tutoringMonthly2026||0)*3,S.country,S.year);
    const canFamilyAffordTutor=familyCanAffordSchool(S,tutorBudget);

    return {
      key: 'high_school_strategy',
      category: 'career',
      title: 'Secondary school: choose your study routine',
      text: `In this simulation, your school years lead to an admission score at 18. A harder routine improves your prospects but adds stress. You can change your routine in Education.`,
      choices: [
        {
          label: canFamilyAffordTutor
            ? `Study hard + enroll in ${tutorLabel} (Family covers fees; high academic boost, +stress)`
            : `Study relentlessly on your own & library past-papers (+academic score, +stress)`,
          effect: (st) => {
            st.education.studyEffort = 'hard';
            if(canFamilyAffordTutor)hireTutor(st);
            st.player.vitals.stress = clamp(st.player.vitals.stress + 14);
            recordJournal(
              st,
              canFamilyAffordTutor
                ? `You threw yourself into ${examName} prep backed by ${tutorLabel}.`
                : `Without private tutoring money, you committed to disciplined self-study for ${examName}.`,
              'career'
            );
          }
        },
        {
          label: 'Keep a balanced study routine (steady academic growth)',
          effect: (st) => {
            st.education.studyEffort = 'normal';
            recordJournal(st, `You balanced ${examName} coursework with friendships and sleep.`, 'career');
          }
        },
        {
          label: 'Coast through classes and focus on street smarts & hobbies',
          effect: (st) => {
            st.education.studyEffort = 'coasting';
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
            recordJournal(st, `You treated secondary school lightly, saving your energy for life outside the classroom.`, 'career');
          }
        }
      ]
    };
}

export function tickEducationYearly(S) {
  const age = S.player.age;
  const cObj = getCountry(S.country);
  const edu = S.education;

  /* Age 6: Start Primary School */
  if (age === 6 && edu.stage === 'infancy') {
    edu.stage = 'primary';
    const schools = getSchoolsFor(S.country, S.year);
    const chosen = schools.find(s => s.id === edu.schoolId) || schools[0];
    edu.schoolId = chosen.id;
    edu.schoolName = chosen.name;
    edu.schoolTier = chosen.tier;
    if (chosen.tier === 'international' && !edu.languages.includes('English (Fluent)')) {
      edu.languages = edu.languages.filter(l => l !== 'English (Basic)');
      edu.languages.push('English (Fluent)');
    }
    recordJournal(S, `Started primary school at ${edu.schoolName}.`, 'milestone');
  }

  /* Age 12: Middle / Prep School */
  if (age === 12 && edu.stage === 'primary') {
    edu.stage = 'middle';
  }

  /* Age 15: Secondary / High School — Offer Study Effort & Private Tutoring (Dorous Khosousia) */
  if (age === 15 && edu.stage === 'middle') {
    edu.stage = 'high';
    queueScene(S, buildHighSchoolStrategyScene(S));
  }

  if(['primary','middle','high'].includes(edu.stage)&&edu.schoolPaidYear!==S.year){
    const school=getSchoolsFor(S.country,S.year).find(sc=>sc.id===edu.schoolId);const fee=school?schoolAnnualFee(S,school):0;
    if(fee>0){
      if(familyCanAffordSchool(S,fee))chargeFamilyEducation(S,fee);
      else if(S.money.cash>=fee)walletMove(S,-fee,`Annual school fees: ${school.name}`,'education');
      else{const free=getSchoolsFor(S.country,S.year).find(sc=>!(sc.annualTuition2026>0));if(free){edu.schoolId=free.id;edu.schoolName=free.name;edu.schoolTier=free.tier;edu.trackId=null;recordJournal(S,`Fees at ${school.name} could not be renewed. You moved to ${free.name}.`,'career');}}
    }
    edu.schoolPaidYear=S.year;
  }
  // Tutoring is purchased for the current school year, not a lifetime free boost.
  if(edu.privateTutoring&&edu.tutorPaidYear!==S.year){edu.privateTutoring=false;recordJournal(S,'Your paid tutoring period ended. Renew it in Education if needed.','career');}

  /* Annual Academic Skill growth during K-12 */
  if (['primary', 'middle', 'high'].includes(edu.stage)) {
    const schoolBoost = edu.schoolTier === 'international' ? 2.4 : edu.schoolTier === 'private' ? 1.5 : 0.8;
    const effortBoost = edu.studyEffort === 'hard' ? 3.5 : edu.studyEffort === 'normal' ? 1.5 : -1.0;
    const tutorBoost = edu.privateTutoring ? 2.2 : 0;
    edu.academicSkill = clamp(edu.academicSkill + schoolBoost + effortBoost + tutorBoost + (S.player.vitals.smarts - 55) * 0.06, 25, 99);
    if (edu.studyEffort === 'hard') {
      S.player.vitals.smarts = clamp(S.player.vitals.smarts + 2);
      S.player.vitals.stress = clamp(S.player.vitals.stress + 4);
    }
  }

  /* Age 17->18 Transition: Sit National Secondary Exam & Issue Adult ID/Passport! */
  if (age === 18 && edu.stage === 'high') {
    if (S.legal.passports.length > 0) {
      S.legal.passports[0].issuedYear = S.year;
      S.legal.passports[0].expiresYear = S.year + (cObj.passportValidityYears || 7);
    }
    const rawScore = edu.academicSkill * 0.68 + S.player.vitals.smarts * 0.26 + randInt(S, -4, 6);
    const finalScore = clamp(Math.round(rawScore), 42, 99);
    edu.highSchoolScore = finalScore;
    edu.stage = 'graduated_high';

    const dad = S.relations.fatherId ? S.people[S.relations.fatherId] : null;
    if (dad && dad.alive) {
      if (finalScore >= 88) rememberDeed(S, dad, 'proud_moment', `Scored ${finalScore}% in ${cObj.examSystem.name}!`, { affection: 10, respect: 15 });
      else if (finalScore < 58 && dad.traits.pride >= 68) rememberDeed(S, dad, 'disappointed', `Disappointed by ${finalScore}% exam result.`, { respect: -8 });
    }

    /* Realistic Family Coming-of-Age Graduation Seed for Middle / Affluent / Wealthy Households */
    const gradGiftFactors = { struggling: 0, working: 0.12, middle: 0.45, upper_middle: 1.25, wealthy: 3.20, very_wealthy: 3.20 };
    const giftMult = gradGiftFactors[S.familyTier] || 0;
    if (giftMult > 0) {
      const midMo = eraSalary(cObj.annualSalaryTiers2026.mid / 12, S.country, S.year);
      const wantedGift=Math.round(midMo*giftMult);
      const gradSeed=chargeFamilyEducation(S,wantedGift)?wantedGift:0;
      // One gift, split 65% savings / 35% cash (was: 100% to savings PLUS
      // 35% to cash — the family was accidentally gifting 135%).
      moveBalance(S, 'savings', Math.round(gradSeed * 0.65), 'Family coming-of-age graduation gift (savings share)', 'family');
      walletMove(S, Math.round(gradSeed * 0.35), `Family coming-of-age graduation gift`, 'family');
    }

    recordJournal(
      S,
      `Results day: your admission score is ${finalScore}/100. University and career paths are now open.`,
      'milestone'
    );

    presentPostHighSchoolCrossroads(S);
  }

  /* Strict High-School / Tansik Age-Out Invariant (Fixes M2: never a schoolboy at 21+!) */
  if (age >= 21 && edu.stage === 'graduated_high' && !edu.university) {
    edu.stage = 'completed';
    S.money.parentalAllowanceActive = false;
    evaluateConscriptionCheck(S);
  }
}

const CLINICAL_MAJOR_IDS = new Set(['medicine', 'dentistry', 'pharmacy', 'nursing', 'veterinary', 'physiotherapy']);

export function uniSupportsMajor(uniName, majorId) {
  // Clinical coverage is intentionally narrow until named course evidence is checked.
  if (CLINICAL_MAJOR_IDS.has(majorId)) {
    const n=String(uniName||'');
    return (majorId==='medicine' && /^(Cairo University|UCL|NUS|Harvard)$/.test(n)) || (majorId==='dentistry' && n==='NUS');
  }
  const name=String(uniName||'');
  if (name==='Harvard') return ['engineering','cs','psychology','law'].includes(majorId);
  if (/Karolinska/i.test(name)) return CLINICAL_MAJOR_IDS.has(majorId)||majorId==='psychology';
  if (/HEC|Bocconi|Singapore Management|^SMU$|FGV/i.test(name)) return ['business','cs','law','psychology'].includes(majorId);
  if (/Delft|ETH Zurich|EPFL|KTH|Chalmers|KFUPM|King Fahd|Polytechnique|Politecnico|Fictional.*Technology|Middle East Technical|Istanbul Technical/i.test(name)) return ['engineering','architecture','cs'].includes(majorId);
  if (/Sciences Po/i.test(name)) return ['business','law','media','psychology'].includes(majorId);
  if (majorId==='vocational') return false; // University list is not a trade-school directory.
  return true;
}

/* ============================================================================
   v2.7 — EXAM PROJECTION, TANSIK CUTOFFS, LOCK REASONS, AFFORDABILITY,
   TRACK/SCHOOL SYSTEMS. One source of truth: the Education tab, the
   crossroads scenes and the apply actions all read these helpers, so a
   button can never promise what the action refuses.
   ========================================================================== */

/* Deterministic 0..1 hash — stable across renders, so a cutoff never
   changes between two looks at the same year. */
function hash01(str) {
  let h = 7;
  for (let i = 0; i < String(str).length; i++) h = (h * 31 + String(str).charCodeAt(i)) % 997;
  return h / 997;
}

/* The exam projection: what the player would score IF they sat the national
   secondary exam today. Same shape as the real exam formula at age 18
   (academicSkill x 0.68 + smarts x 0.26), plus effort and tutoring — but no
   exam-day luck, because this is a projection, not a result. Studying hard
   raises it, coasting lowers it. */
export function examProjection(S) {
  const edu = S.education;
  const skill = edu.academicSkill || 0;
  const smarts = S.player.vitals.smarts || 55;
  const effortAdj = edu.studyEffort === 'hard' ? 3 : edu.studyEffort === 'coasting' ? -4 : 0;
  const tutorAdj = edu.privateTutoring ? 2 : 0;
  return clamp(Math.round(skill * 0.68 + smarts * 0.26 + effortAdj + tutorAdj), 42, 99);
}

export function hasExamResult(S) {
  return S.education.highSchoolScore != null;
}

/* The score a major needs at ONE university in ONE year. Egypt: the real
   national minimum (2024, or 2023 when the game year is 2023) as the base,
   plus a modelled per-university spread and a small modelled yearly drift —
   so no two public universities ever show the same table. Other countries:
   the major's base bar plus a modelled per-university spread. Private
   universities take 12 points off the bar (the long-standing rule: private
   admission is easier, the fees are the barrier). Returns
   { cutoff, modelled } — modelled is true whenever the base is not a real
   published national figure for that year. */
export function tansikCutoffFor(countryId, uni, majorId, year) {
  const major = MAJORS.find(m => m.id === majorId);
  if (!major) return { cutoff: 60, modelled: true };
  let base = major.minExam;
  let realBase = false;
  if (countryId === 'egy') {
    const table = EGY_TANSIK_REAL[year];
    if (table && table[majorId] != null) {
      base = table[majorId];
      realBase = true;
    } else if (EGY_TANSIK_REAL[2024][majorId] != null) {
      base = EGY_TANSIK_REAL[2024][majorId];
    }
  }
  let delta = 0;
  /* Yearly movement, modelled: one cohort shift per country and year, so
     the whole table moves together (as in real life) and is never identical
     two years running — while the gap between universities keeps its real
     order (Mansoura, Alexandria and Cairo highest, regional lowest). The
     shift steps 0.35 points a year on a 7-year cycle, so adjacent years
     always differ; the small per-country term keeps countries from moving
     in lockstep. */
  const yearShift = (((year % 7) - 3) * 0.35) + ((hash01(countryId) - 0.5) * 0.6);
  if (uni.sector === 'public') {
    if (countryId === 'egy') {
      const name = String(uni.name || '').toLowerCase();
      for (const [key, d] of Object.entries(EGY_TANSIK_UNI_DELTA)) {
        if (name.includes(key)) { delta = d; break; }
      }
    } else {
      delta = (hash01(`${uni.id}|${majorId}`) - 0.5) * 3;
    }
  }
  let cutoff = base + delta + yearShift;
  // Ownership does not imply easier admission. Keep selectivity separate.
  if (countryId !== 'egy') {
    // A labelled game selectivity index, not a percentage from real admissions.
    const offsets={medicine:7,dentistry:6,pharmacy:4,engineering:3,architecture:2,cs:4,psychology:-1,business:0,law:2,media:-4,education:-5};
    cutoff=(uni.cutoff ?? 70)+(offsets[majorId]??0)+yearShift+(hash01(`${uni.id}|${majorId}`)-.5)*2;
  }
  cutoff = clamp(Math.round(cutoff * 10) / 10, 40, 99);
  return { cutoff, modelled: !(countryId === 'egy' && realBase) };
}

export function eligibleMajorsFor(S, uni, score = null) {
  const s = score ?? S.education.highSchoolScore ?? Math.round(S.education.academicSkill || 65);
  return programsForCountry(S.country,uni,S.year).filter(m => (!m.graduateEntry || S.education.degrees.length > 0) && s >= tansikCutoffFor(S.country, uni, m.id, S.year).cutoff && uniSupportsMajor(uni.name, m.id) && !S.education.degrees.includes(m.id));
}

export function presentPostHighSchoolCrossroads(S) {
  const cObj = getCountry(S.country);
  const score = S.education.highSchoolScore || 65;
  const unis = getUniversitiesFor(S.country, S.year);

  /* Full university list: every university in the country is a choice.
     Picking one opens the major picker — the PLAYER picks the major,
     the game never picks it for them. */
  const choices = unis.map(uni => {
    const majors = eligibleMajorsFor(S, uni, score);
    const tuit = annualUniversityBudget(S,uni);
    const range=universityBudgetRange(S,uni,majors);
    const aff = universityAffordability(S, uni);
    return {
      label: `${uni.name} — ${universitySectorLabel(uni)} · ${formatMoney(range.min, S.country)}${range.max!==range.min?` to ${formatMoney(range.max,S.country)}`:''}/yr game budget · ${majors.length} major${majors.length === 1 ? '' : 's'} open to you (score ${score}%) · ${aff.short}`,
      available: st => eligibleMajorsFor(st, uni, score).length > 0,
      lockReason: `No majors meet your current admission score at ${uni.name}.`,
      effect: (st) => {
        presentUniversityMajorPicker(st, uni);
      }
    };
  });

  if (studyAbroadOpen(S)) choices.push({ exit: true, label: 'Study abroad (admission, English and funding rules apply)', effect: st => presentAbroadDestinations(st) });
  choices.push({
    exit: true,
    label: 'Skip university & enter the workforce immediately (check the Education tab anytime)',
    effect: (st) => {
      st.education.stage = 'completed';
      st.money.parentalAllowanceActive = false;
      recordJournal(st, `You chose to enter adult working life directly after ${cObj.examSystem.name}.`, 'career');
      evaluateConscriptionCheck(st);
    }
  });

  queueScene(S, {
    key: 'post_highschool_choice',
    navigation: true,
    category: 'career',
    title: 'After school: university or work?',
    text: `Your admission score is ${score}/100. Browse a university to see eligible majors and funding, or start working. Scores, tuition and courses use simplified game rules, not official admission requirements.${unis.length ? '' : ' No universities are listed for this country and year.'}`,
    choices
  }, true);
}

export function presentUniversityMajorPicker(S, uni) {
  const cObj = getCountry(S.country);
  const score = S.education.highSchoolScore || 65;
  const majors = eligibleMajorsFor(S, uni, score);
  const tuit = annualUniversityBudget(S,uni);
  const aff = universityAffordability(S, uni);

  const choices = majors.map(m => ({
    label: `${m.label} (${m.level}, ${m.years} yrs, ${formatMoney(annualUniversityBudget(S,uni,m.id),S.country)}/yr game budget, entry index ${tansikCutoffFor(S.country, uni, m.id, S.year).cutoff}/100 at ${uni.name} — you scored ${score}%)`,
    available: st => universityAffordability(st, uni,m.id).status !== 'cannot',
    lockReason: universityAffordability(S, uni, m.id).line + ' Options: a scholarship (Education tab), a cheaper university, or work first.',
    effect: (st) => {
      applyToUniversity(st, uni.id, m.id);
    }
  }));
  choices.push({
    exit: true,
    label: 'Choose a different university',
    effect: (st) => {
      presentPostHighSchoolCrossroads(st);
    }
  });
  choices.push({
    exit: true,
    label: 'Decide later — leave university for now',
    effect: (st) => {
      st.education.stage = 'completed';
      st.money.parentalAllowanceActive = false;
      recordJournal(st, `You left ${uni.name} undecided after ${cObj.examSystem.name}.`, 'career');
      evaluateConscriptionCheck(st);
    }
  });

  queueScene(S, {
    key: `pick_major_${uni.id}_${S.year}`,
    navigation: true,
    category: 'career',
    title: `${uni.name} — Pick Your Major`,
    text: `Select a programme to see its annual budget. Each option shows the cost charged by the game. Programme-cost differences are modelled, not institutional quotes. Your admission score is ${score}/100. ${uni.feeBasis || 'Fees are game budgets, not official quotes.'} Course availability and entry scores are simplified. Durations are modelled study pathways, not verified named courses. Clinical programmes require additional supervised training/licensing; a degree alone is not a licence.`,
    choices
  }, true);
}

// Restore only supported, still-valid education decisions. Rebuild on a
// queue-only shadow so loading does not count a second event or change RNG.
export function restoreEducationDecision(S, saved) {
  const key = String(saved?.key || '');
  const shadow = { ...S, activeScene: null, sceneQueue: [], sceneCounts: {}, titleCounts: {}, cooldowns: {} };
  if (key === 'high_school_strategy') {
    if (S.education.stage !== 'high') return null;
    return { ...saved, ...buildHighSchoolStrategyScene(S) };
  } else if (key === 'post_highschool_choice') {
    if (S.education.university || !['graduated_high', 'completed'].includes(S.education.stage)) return null;
    presentPostHighSchoolCrossroads(shadow);
  } else if (key.startsWith('pick_major_')) {
    if (S.education.university) return null;
    const uni = getUniversitiesFor(S.country, S.year).find(u => key === `pick_major_${u.id}_${S.year}`);
    if (!uni) return null;
    presentUniversityMajorPicker(shadow, uni);
  } else if (key.startsWith('abroad_')) {
    const r = restoreAbroadDecision(S); return r ? { ...saved, ...r } : null;
  } else return null;
  return shadow.activeScene ? { ...saved, ...shadow.activeScene } : null;
}

export function enrollInUniversity(S, uniObj, majorId, scholarshipPct = 0) {
  const major = degreeProgramFor(uniObj.country || S.country,majorId,uniObj,S.year);
  if (!major) return {ok:false,msg:'Unknown programme.'};
  if (!uniSupportsMajor(uniObj.name,majorId)) return {ok:false,msg:'Programme not available in this game pathway.'};
  if (major.graduateEntry && !S.education.degrees.length) return {ok:false,msg:'A first degree is required for this professional pathway.'};
  const annualTuition = annualUniversityBudget(S,uniObj,majorId);

  S.education.stage = 'university';
  S.education.university = {
    id: uniObj.id,
    name: uniObj.name,
    country: uniObj.country || S.country,
    majorId: major.id,
    majorLabel: major.label,
    yearInProgram: 1,
    enrolledMonth:S.year*12+S.month,elapsedMonths:0,progressMonth:S.year*12+S.month,
    totalYears: major.years,
    qualificationLevel:major.level,
    pathwayNote:major.note,
    annualTuition,
    scholarshipPct
  };

  if (S.legal.military.applicable && S.legal.military.status === 'deferred_minor') {
    S.legal.military.status = 'deferred_student';
  }



  spawnUniversityPeer(S, uniObj.name, major.label);
  recordJournal(S, `Matriculated at ${uniObj.name} reading ${major.label} (${major.years}-year program).`, 'milestone');
  return { ok: true };
}

/* ============================================================================
   EDUCATION ACTIONS (v2.5) — choose/change school, track, study effort,
   tutor, clubs, named scholarships, internships, university applications.
   Every money move goes through the ledger; every outcome is journaled.
   ========================================================================== */

export function ensureEduExtras(S) {
  const edu = S.education;
  if (edu.trackId === undefined) edu.trackId = null;
  if (!Array.isArray(edu.clubs)) edu.clubs = [];
  if (!Array.isArray(edu.scholarships)) edu.scholarships = [];
  if (!Array.isArray(edu.internships)) edu.internships = [];
  if (edu.awardedScholarship === undefined) edu.awardedScholarship = null;
  return edu;
}

function schoolAnnualFee(S, school) {
  return eraLocalCost(school.annualTuition2026 || 0, S.country, S.year);
}

/* Can the family cover a school fee without the player paying?
   Wealthy and upper-middle families cover any school; middle families
   cover fees up to about six months of a mid-tier salary; working and
   struggling families can only cover a free or near-free state school. */
function familyCanAffordSchool(S,fee){return fee<=0||familyCoversUniversity(S,fee,S.country);}

/* ============================================================================
   v2.7 — LOCK REASONS, AFFORDABILITY, SCHOOL SYSTEMS. The tab shows a
   locked action with its plain reason instead of a live button that leads
   to a refusal; the apply functions below read the same helpers.
   ========================================================================== */

function hasCertifiedLanguage(S, re) {
  return hasCurrentLanguage(S,re);
}
/* IELTS 7 means certified English, not school "English (Basic)". A pass at
   IELTS/TOEFL stores 'English (C1)'; an international school stores
   'English (Fluent)'. Either counts. Exported: the gig system reads the
   same rule (one source of truth, not a second English check). */
export function hasCertifiedEnglish(S) {
  return hasCertifiedLanguage(S, /English \(C1\)|English \(Fluent\)|IELTS/);
}

/* Why this scholarship cannot be applied for yet — null when it can.
   Gates, in order: age, degree, stage, score, language, work, leadership. */
export function scholarshipLockReason(S, sch) {
  const edu = S.education;
  if (S.player.age < 17) return 'Apply from age 17';
  if(sch.level==='postgrad')return 'Postgraduate award funding is not modelled yet';
  if(sch.country!=='eu'&&sch.country!==S.country)return 'Study-country scholarship, not available in your current country';
  if (sch.level === 'postgrad' && edu.degrees.length === 0) return 'Needs a degree';
  if (sch.level === 'undergrad' && edu.degrees.length > 0) return 'For students before their first degree';
  if (sch.level === 'undergrad' && !['graduated_high', 'completed', 'university'].includes(edu.stage)) {
    return 'Needs your secondary exam results first';
  }
  const bestScore = sch.level === 'postgrad'
    ? Math.round(edu.academicSkill || 0)
    : (edu.highSchoolScore ?? Math.round(edu.academicSkill || 0));
  if (bestScore < sch.minScore) return `Needs ${sch.minScore}% (about GPA ${sch.requiresGPA}) — yours is about ${bestScore}%`;
  if (sch.requiresIELTS && !hasCertifiedEnglish(S)) return `Needs IELTS ${sch.requiresIELTS}`;
  if (sch.requiresGerman && !hasCertifiedLanguage(S, /German/)) return 'Needs German (Goethe B2)';
  if (sch.requiresFrench && !hasCertifiedLanguage(S, /French/)) return 'Needs French (TEF/DELF)';
  if (sch.requiresWork && (S.career.yearsExperience || 0) < sch.requiresWork) {
    return `Needs ${sch.requiresWork} years of work`;
  }
  if (sch.requiresLeadership && !edu.clubs.some(c => ['student_union', 'enactus'].includes(c))) {
    return 'Needs a leadership role (Student Union or Enactus)';
  }
  return null;
}

/* Why this internship cannot be applied for yet — null when it can. */
export function internshipLockReason(S, intn) {
  const edu = S.education;
  if (!edu.university) return 'Enrol at university first';
  if(intn.country!==S.country)return 'Available in '+getCountry(intn.country).name+' only';
  if((edu.internships||[]).some(x=>x.status==='active'))return 'Finish the active internship first';
  const auth=canLegallyWorkInCurrentCountry(S);if(!auth.allowed)return 'Valid work authorization required';
  if(auth.partTimeOnly&&careerHours(S)+20>20)return 'Modeled student20hcap already used by existing employment';
  if(careerHours(S)+20>70)return 'Internship20h plus existing employment exceeds70h model limit';
  if (intn.requiresMajor.length && !intn.requiresMajor.includes(edu.university.majorId)) {
    return `For ${intn.requiresMajor.join('/').toUpperCase()} students — you study ${edu.university.majorLabel}`;
  }
  return null;
}

/* Who pays for a school move, and whether it is affordable — so the "Move
   here" button never leads to a dead refusal. */
export function schoolAffordability(S, school) {
  const fee = schoolAnnualFee(S, school);
  const familyPays = familyCanAffordSchool(S, fee);
  const youCanPay = S.money.cash >= fee;
  return { fee, familyPays, youCanPay, affordable: familyPays || youCanPay };
}

function cheapestPublicUniversity(S) {
  const pubs = getUniversitiesFor(S.country, S.year).filter(u => u.sector === 'public');
  if (!pubs.length) return null;
  return pubs.slice().sort((a, b) => (a.annualTuition2026 || 0) - (b.annualTuition2026 || 0))[0];
}

function playerHasFullScholarship(S, uni) {
  const edu = S.education;
  if (!edu.awardedScholarship || edu.awardedScholarship.coverage !== 'full') return null;
  const award=SCHOLARSHIPS.find(x=>x.id===edu.awardedScholarship.schId);if(award?.level==='postgrad')return null;
  if(award&&award.country!=='eu'&&award.country!==uni.country)return null;
  const req = edu.awardedScholarship.reqUni;
  if(req&&!(String(uni.id).includes(req)||(req==='auc'&&/american university in cairo/i.test(uni.name))))return null;
  const sch = SCHOLARSHIPS.find(x => x.id === edu.awardedScholarship.schId);
  return sch || { name: 'Your scholarship' };
}

/* Who pays for this university, and whether it is affordable — shown BEFORE
   the player chooses, never as a refusal after. status: 'covered' (family
   or scholarship pays), 'you-can-start' (you can pay the first year
   yourself, but nobody covers the years after), 'cannot'. */
export function universityAffordability(S, uni,majorId=null) {
  const annualTuition = annualUniversityBudget(S,uni,majorId);
  const cash = S.money.cash || 0;
  const sch = playerHasFullScholarship(S, uni);
  if (sch) {
    return {
      annualTuition, status: 'covered', short: 'scholarship pays it in full',
      line: `Your ${sch.name} pays the tuition in full — you can afford this.`,
      paths: []
    };
  }
  if (annualTuition <= 0) {
    return {
      annualTuition, status: 'covered', short: 'free',
      line: 'No tuition to pay — you can afford this.',
      paths: []
    };
  }
  if (familyCoversUniversity(S, annualTuition, uni.country || S.country)) {
    return {
      annualTuition, status: 'covered', short: 'parents can pay from savings',
      line: `Your family covers the ${formatMoney(annualTuition, S.country)} for one year from their savings. Later years need renewed funding.`,
      paths: []
    };
  }
  const paths = [];
  const cheap = cheapestPublicUniversity(S);
  if (cheap && cheap.id !== uni.id) {
    paths.push(`A cheaper university: ${cheap.name} (public, ${formatMoney(eraLocalCost(cheap.annualTuition2026, S.country, S.year), S.country)}/yr).`);
  }
  paths.push('A full scholarship — see Named Scholarships below; winning one pays tuition in full.');
  paths.push(S.player.age<21?'Personal bank loans open at21in this game; no student-loan product is modelled.':'Finance has ordinary personal loans, subject to credit checks and repayments. No special student loan is modelled.');
  paths.push('Work for a year first, save, then reapply.');
  if (cash >= annualTuition) {
    return {
      annualTuition, status: 'you-can-start', short: 'you can pay the first year yourself',
      line: `Your family cannot cover the ${formatMoney(annualTuition, S.country)} a year, but you hold ${formatMoney(cash, S.country)} in cash — enough for the first year, not for the years after.`,
      paths
    };
  }
  return {
    annualTuition, status: 'cannot', short: 'you cannot afford it yet',
    line: `Your family cannot cover the ${formatMoney(annualTuition, S.country)} a year, and you hold only ${formatMoney(cash, S.country)} in cash.`,
    paths
  };
}

/* ============================================================================
   SCHOOL SYSTEMS (v2.7). The track follows the school. A track whose system
   is not the school's system needs a school that teaches it — the game says
   which school, what it costs and what is lost, before the player chooses.
   ========================================================================== */

/* Home system per country: the system a plain state/private school teaches. */
const HOME_SYSTEM = {
  egy: 'national', sau: 'national', uae: 'national', gbr: 'british', usa: 'american',
  deu: 'german', can: 'national', aus: 'national', nld: 'national', fra: 'french',
  jpn: 'national', ita: 'national', sgp: 'national', bra: 'national', ind: 'national',
  che: 'national', swe: 'national', tur: 'national'
};

const CROSS_SCHOOL_SYSTEMS = new Set(['british', 'american', 'french', 'ib', 'stem']);

/* Which school system a track belongs to. Tracks with no cross-system
   marker belong to the country's home system (e.g. AP/Honours in the USA,
   A-Levels in Britain, Thanaweya Amma in Egypt). */
export function trackSystemFor(track, countryId) {
  const s = `${String(track.id || '')} ${String(track.label || '')}`.toLowerCase();
  if (/igcse|a-level|alevel/.test(s)) return 'british';
  if (/american/.test(s)) return 'american';
  if (/french|baccalaur|coll[eè]ge/.test(s)) return 'french';
  if (/stem/.test(s)) return 'stem';
  if (/\bib\b/.test(s)) return 'ib';
  if (/german|deo|abitur|gymnasium|realschule/.test(s)) return 'german';
  if (/btec|vocational|cte|\bvet\b|tecnico|polytechnic/.test(s)) return 'vocational';
  return HOME_SYSTEM[countryId] || 'national';
}

/* Which school system a school teaches, from its name, then its tier. */
export function schoolSystemFor(school, countryId) {
  if (!school) return HOME_SYSTEM[countryId] || 'national';
  const n = String(school.name || '').toLowerCase();
  if (/stem/.test(n)) return 'stem';
  if (/british|english school|modern english/.test(n)) return 'british';
  if (/american/.test(n)) return 'american';
  if (/french|sainte|st-marc|saint-marc|collège/.test(n)) return 'french';
  if (/german|deo/.test(n)) return 'german';
  if (/\bib\b/.test(n)) return 'ib';
  if (school.tier === 'international') return 'international';
  return HOME_SYSTEM[countryId] || 'national';
}

export function trackSystemInfo(track, countryId) {
  return TRACK_SYSTEM_INFO[trackSystemFor(track, countryId)] || TRACK_SYSTEM_INFO.national;
}

/* Does this track need a different school than the player's current one?
   Only cross-system tracks (British/American/French/IB/STEM) away from home
   need their own school; in-system streams (Science vs Literary, AP vs
   standard, BTEC, Gymnasium vs Realschule) switch freely. */
export function trackNeedsOwnSchool(S, track) {
  const ts = trackSystemFor(track, S.country);
  if (!CROSS_SCHOOL_SYSTEMS.has(ts)) return false;
  if (ts === (HOME_SYSTEM[S.country] || 'national')) return false;
  const mySchool = getSchoolsFor(S.country, S.year).find(x => x.id === S.education.schoolId);
  const mySys = schoolSystemFor(mySchool, S.country);
  if (ts === mySys) return false;
  if (mySys === 'international' && ['british', 'american', 'french', 'ib'].includes(ts)) return false;
  return true;
}

/* Cheapest school teaching a system, for the "what it costs" line. */
export function cheapestSchoolForSystem(S, system) {
  const schools = getSchoolsFor(S.country, S.year)
    .filter(sc => schoolSystemFor(sc, S.country) === system
      || (system === 'ib' && schoolSystemFor(sc, S.country) === 'international'));
  if (!schools.length) return null;
  return schools.slice().sort((a, b) => (a.annualTuition2026 || 0) - (b.annualTuition2026 || 0))[0];
}

export function chooseSchool(S, schoolId) {
  const edu = ensureEduExtras(S);
  if (S.player.age >= 6 && edu.stage !== 'infancy') {
    return { ok: false, msg: 'School is already under way — use Change School instead.' };
  }
  const school = getSchoolsFor(S.country, S.year).find(x => x.id === schoolId);
  if (!school) return { ok: false, msg: 'That school is not in this country.' };
  edu.schoolId = school.id;
  edu.schoolName = school.name;
  edu.schoolTier = school.tier;
  recordJournal(S, `Your family chose ${school.name} (${school.tier}) for your schooling.`, 'milestone');
  return { ok: true, msg: `School set to ${school.name}.` };
}

export function changeSchool(S, schoolId) {
  const edu = ensureEduExtras(S);
  if (S.player.age < 6 || !['primary', 'middle', 'high'].includes(edu.stage)) {
    return { ok: false, msg: 'You can only change school between ages 6 and 17.' };
  }
  const school = getSchoolsFor(S.country, S.year).find(x => x.id === schoolId);
  if (!school) return { ok: false, msg: 'That school is not in this country.' };
  if (school.id === edu.schoolId) return { ok: false, msg: `You already attend ${school.name}.` };
  const fee = schoolAnnualFee(S, school);
  const familyPays = familyCanAffordSchool(S, fee);
  if (!familyPays && S.money.cash < fee) {
    return { ok: false, msg: `${school.name} costs ${formatMoney(fee, S.country)} a year and neither your family nor you can cover it right now.` };
  }
  if(familyPays&&fee>0)chargeFamilyEducation(S,fee);
  if (!familyPays && fee > 0) {walletMove(S, -fee, `First-year fees at ${school.name}`, 'education');}
  edu.schoolPaidYear=S.year;
  const oldName = edu.schoolName;
  const oldSchool = getSchoolsFor(S.country, S.year).find(x => x.id === edu.schoolId);
  const oldSys = schoolSystemFor(oldSchool, S.country);
  edu.schoolId = school.id;
  edu.schoolName = school.name;
  edu.schoolTier = school.tier;
  edu.academicSkill = clamp(edu.academicSkill + (school.tier === 'international' ? 2 : school.tier === 'private' ? 1 : 0));
  /* v2.7 — the track follows the school. Moving to a school that teaches a
     different system switches the track with it (and says so); moving
     inside the same system keeps the track. */
  const newSys = schoolSystemFor(school, S.country);
  let trackNote = '';
  if (oldSys !== newSys) {
    const tracks = SCHOOL_TRACKS[S.country] || [];
    const next = tracks.find(t => trackSystemFor(t, S.country) === newSys)
      || (newSys === 'international'
        ? tracks.find(t => ['ib', 'british', 'american', 'french'].includes(trackSystemFor(t, S.country)))
        : null);
    if (next) {
      edu.trackId = next.id;
      trackNote = ` Your track switches to ${next.label} — that is the track this school teaches.`;
    } else {
      edu.trackId = null;
      trackNote = ' Your old track does not exist at this school — pick a new track below.';
    }
  }
  recordJournal(S, `You moved from ${oldName || 'your old school'} to ${school.name} (${school.tier}${familyPays ? ', family covers the fees' : `, you paid ${formatMoney(fee, S.country)}`}).${trackNote}`, 'milestone');
  return { ok: true, msg: familyPays ? `Moved to ${school.name} — your family covers the fees.${trackNote}` : `Moved to ${school.name} — you paid ${formatMoney(fee, S.country)} for the first year.${trackNote}` };
}

export function setTrack(S, trackId) {
  const edu = ensureEduExtras(S);
  if (S.player.age < 12 || S.player.age > 17 || !['middle', 'high'].includes(edu.stage)) {
    return { ok: false, msg: 'You pick a school track in secondary school, from age 12 to 17.' };
  }
  const tracks = SCHOOL_TRACKS[S.country] || [];
  const track = tracks.find(t => t.id === trackId);
  if (!track) return { ok: false, msg: 'That track is not offered in this country.' };
  if (edu.trackId === trackId) return { ok: false, msg: `You are already on the ${track.label} track.` };
  /* v2.7 — the track follows the school. A cross-system track is not a free
     switch: it needs a school that teaches that system. Say which school,
     what it costs and what is lost — the move itself happens in My School. */
  if (trackNeedsOwnSchool(S, track)) {
    const sys = trackSystemFor(track, S.country);
    const info = TRACK_SYSTEM_INFO[sys] || TRACK_SYSTEM_INFO.national;
    const cheapest = cheapestSchoolForSystem(S, sys);
    const curSys = TRACK_SYSTEM_INFO[schoolSystemFor(getSchoolsFor(S.country, S.year).find(x => x.id === edu.schoolId), S.country)] || TRACK_SYSTEM_INFO.national;
    return {
      ok: false,
      msg: `The ${track.label} track is taught at ${info.schoolNoun}s, not at ${edu.schoolName || 'your school'}. ${cheapest ? `The cheapest here is ${cheapest.name} (${formatMoney(schoolAnnualFee(S, cheapest), S.country)}/yr). ` : `No ${info.schoolNoun} is listed here. `}Move schools first (see My School above) — switching also means leaving the ${curSys.label.toLowerCase()}: you lose your current track and start the new system's exams from scratch.`
    };
  }
  edu.trackId = trackId;
  edu.academicSkill = clamp(edu.academicSkill + 1);
  recordJournal(S, `You chose the ${track.label} track at school.`, 'career');
  return { ok: true, msg: `Now on the ${track.label} track.` };
}

export function setStudyEffort(S, effort) {
  const edu = ensureEduExtras(S);
  if (!['hard', 'normal', 'coasting'].includes(effort)) return { ok: false, msg: 'Unknown study effort.' };
  if (!['primary', 'middle', 'high', 'university'].includes(edu.stage)) {
    return { ok: false, msg: 'You are not in school or university right now.' };
  }
  if (edu.studyEffort === effort) return { ok: false, msg: 'You are already studying that way.' };
  edu.studyEffort = effort;
  if (effort === 'hard') {
    S.player.vitals.stress = clamp(S.player.vitals.stress + 4);
    S.player.vitals.smarts = clamp(S.player.vitals.smarts + 1);
  } else if (effort === 'coasting') {
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + 2);
  }
  recordJournal(S, effort === 'hard' ? 'You committed to studying hard every evening.' : effort === 'normal' ? 'You settled into a steady, balanced study routine.' : 'You decided to coast through classes and enjoy life instead.', 'career');
  return { ok: true, msg: effort === 'hard' ? 'Studying hard now — expect higher scores and more stress.' : effort === 'normal' ? 'Steady, balanced study routine.' : 'Coasting — happier, but scores will slip.' };
}

export function hireTutor(S) {
  const edu = ensureEduExtras(S);
  if (S.player.age < 12 || S.player.age > 17 || !['middle', 'high'].includes(edu.stage)) {
    return { ok: false, msg: 'Private tutoring is for secondary school, ages 12 to 17.' };
  }
  if (edu.privateTutoring) return { ok: false, msg: 'You already have a private tutor.' };
  const cObj = getCountry(S.country);
  const fee = eraLocalCost((cObj.examSystem.tutoringMonthly2026 || 0) * 3, S.country, S.year);
  const familyPays = familyCanAffordSchool(S,fee);
  if (!familyPays && S.money.cash < fee) {
    return { ok: false, msg: `A term of ${cObj.examSystem.tutoringLabel} costs ${formatMoney(fee, S.country)} and you cannot cover it.` };
  }
  if(familyPays&&fee>0)chargeFamilyEducation(S,fee);
  if (!familyPays && fee > 0) {walletMove(S, -fee, `Private tutoring (${cObj.examSystem.tutoringLabel})`, 'education');}
  edu.tutorPaidYear=S.year;
  edu.privateTutoring = true;
  edu.academicSkill = clamp(edu.academicSkill + 4);
  recordJournal(S, `You started ${cObj.examSystem.tutoringLabel}${familyPays ? ' (family covers the fees)' : ` (you paid ${formatMoney(fee, S.country)} for the term)`}.`, 'career');
  return { ok: true, msg: familyPays ? 'Tutor hired — your family covers the fees.' : `Tutor hired — you paid ${formatMoney(fee, S.country)} for the term.` };
}

export function joinClub(S, clubId) {
  const edu = ensureEduExtras(S);
  const club = CLUBS.find(c => c.id === clubId);
  if (!club) return { ok: false, msg: 'That club does not exist.' };
  if (edu.clubs.includes(clubId)) return { ok: false, msg: `You are already in ${club.label}.` };
  if (club.level === 'school') {
    if (S.player.age < 6 || S.player.age > 17 || !['primary', 'middle', 'high'].includes(edu.stage)) {
      return { ok: false, msg: `${club.label} is a school club — join between ages 6 and 17.` };
    }
  } else {
    if (!edu.university) return { ok: false, msg: `${club.label} is a university club — join while you are enrolled at university.` };
  }
  edu.clubs.push(clubId);
  const fx = club.effects || {};
  if (fx.smarts) S.player.vitals.smarts = clamp(S.player.vitals.smarts + fx.smarts);
  if (fx.happiness) S.player.vitals.happiness = clamp(S.player.vitals.happiness + fx.happiness);
  if (fx.health) S.player.vitals.health = clamp(S.player.vitals.health + fx.health);
  recordJournal(S, `You joined ${club.label}.`, 'career');
  return { ok: true, msg: `Joined ${club.label}!` };
}

export function applyScholarship(S, schId) {
  const edu = ensureEduExtras(S);
  const sch = SCHOLARSHIPS.find(x => x.id === schId);
  if (!sch) return { ok: false, msg: 'That scholarship does not exist.' };
  if (edu.scholarships.some(a => a.id === schId && a.status === 'awarded')) {
    return { ok: false, msg: `You already hold the ${sch.name}.` };
  }
  if (edu.scholarships.some(a => a.id === schId && a.year === S.year)) {
    return { ok: false, msg: `You already applied for the ${sch.name} this year.` };
  }
  /* v2.7 — one source of truth with the tab: the same gates the tab locks
     on are the gates the action refuses on, with the same plain reason. */
  const lock = scholarshipLockReason(S, sch);
  if (lock) return { ok: false, msg: `The ${sch.name}: ${lock}.` };
  const won = chance(S, sch.acceptanceRate);
  edu.scholarships.push({ id: schId, status: won ? 'awarded' : 'rejected', year: S.year });
  if (won) {
    edu.awardedScholarship = { schId, coverage: sch.coverage, reqUni: sch.reqUni || null };
    if(edu.university&&sch.level!=='postgrad'&&playerHasFullScholarship(S,edu.university)){edu.university.fundingSource='scholarship';edu.university.scholarshipPct=1;edu.awardedScholarship=null;}
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + 8);
    recordJournal(S, `You WON the ${sch.name} — full funding!`, 'milestone');
    return { ok: true, msg: `You won the ${sch.name}! Full funding secured.` };
  }
  S.player.vitals.happiness = clamp(S.player.vitals.happiness - 2);
  recordJournal(S, `Your ${sch.name} application was turned down.`, 'career');
  return { ok: false, msg: `The ${sch.name} turned you down this year — you can try again next year.` };
}

export function applyInternship(S, intId) {
  const edu = ensureEduExtras(S);
  const intn = INTERNSHIPS.find(x => x.id === intId);
  if (!intn) return { ok: false, msg: 'That internship does not exist.' };
  if(edu.internships.some(a=>a.id===intId&&a.status==='completed'))return{ok:false,msg:'You already completed this internship.'};
  if(edu.internships.some(a=>a.id===intId&&a.year===S.year))return{ok:false,msg:'Already applied for this internship this year.'};
  const lock=internshipLockReason(S,intn);if(lock)return{ok:false,msg:lock};
  const winProb = Math.min(0.95, 0.45 + (edu.academicSkill || 55) / 200);
  const won = chance(S, winProb);
  if (!won) {
    edu.internships.push({ id: intId, status: 'rejected', year: S.year });
    recordJournal(S, `Your application for the ${intn.label} was turned down.`, 'career');
    return { ok: false, msg: `The ${intn.label} went to another candidate.` };
  }
  edu.internships.push({id:intId,status:'active',year:S.year,started:S.year*12+S.month,lastMonth:S.year*12+S.month,completedMonths:0,paidTotal:0,payCountry:S.country,monthlyPay:Math.round(convertCurrency(intn.monthlyPayUsd2026,'usa',S.country,S.year)),hoursPerWeek:20});
  recordJournal(S,'Accepted '+intn.label+'.20h/week; pay and completion arrive through monthly work, not upfront.','career');
  return{ok:true,msg:'Internship accepted.20h/week, monthly pay after worked months. No upfront payment.'};
}

export function applyToUniversity(S, uniId, majorId,funding='auto') {
  const edu = ensureEduExtras(S);
  if(S.postgrad?.active||S.pendingRelocation)return {ok:false,msg:'Finish current postgraduate study or your pending move first.'};
  if (edu.university) return { ok: false, msg: 'You are already enrolled at university — finish or leave first.' };
  if (S.player.age < 18) return { ok: false, msg: 'University opens at 18, after your secondary exam.' };
  if (!['graduated_high', 'completed'].includes(edu.stage)) {
    return { ok: false, msg: 'Finish secondary school and sit the national exam first.' };
  }
  const uni = getUniversitiesFor(S.country, S.year).find(u => u.id === canonicalUniversityId(uniId));
  if (!uni) return { ok: false, msg: 'That university is not in this country.' };
  const major = degreeProgramFor(S.country,majorId,uni,S.year);
  if (!major) return { ok: false, msg: 'That major does not exist.' };
  if (major.graduateEntry && !edu.degrees.length) return {ok:false,msg:'Complete a first degree before this graduate-entry professional pathway.'};
  if (edu.degrees.includes(majorId)) return { ok: false, msg: `You already hold a degree in ${major.label}.` };
  if (!uniSupportsMajor(uni.name, majorId)) {
    return { ok: false, msg: `${major.label} is not available in this game pathway at ${uni.name}.` };
  }
  const score = edu.highSchoolScore ?? Math.round(edu.academicSkill || 65);
  const bar = tansikCutoffFor(S.country, uni, majorId, S.year).cutoff;
  if (score < bar) {
    return { ok: false, msg: `${major.label} at ${uni.name} needs ${bar}% in ${S.year} — you scored ${score}%. Try a programme or university with a lower game admission cutoff.` };
  }
  const annualTuition = annualUniversityBudget(S,uni,majorId);
  const aff = universityAffordability(S, uni,majorId);
  const hasFullScholarship = !!playerHasFullScholarship(S, uni);
  /* Use the same family rule as the admission screen and monthly billing. */
  const familyPaysTuition = !['self','scholarship'].includes(funding)&&familyCoversUniversity(S, annualTuition, uni.country || S.country);
  if(funding==='family'&&!familyPaysTuition)return {ok:false,msg:'Living parents do not have enough savings for the first year.'};
  if(funding==='scholarship'&&!hasFullScholarship)return {ok:false,msg:'Win an eligible undergraduate scholarship first.'};
  const familyCovers = familyPaysTuition;
  if (!familyCovers && !hasFullScholarship && annualTuition > 0 && S.money.cash < annualTuition) {
    /* v2.7 — the refusal names the total and the parts, and offers the real
       paths, like the wedding refusal: never a dead "you need money". */
    const total = annualTuition * major.years;
    return {
      ok: false,
      msg: `${uni.name} costs ${formatMoney(annualTuition, S.country)} a year — ${formatMoney(total, S.country)} over the ${major.years}-year ${major.label} degree. You hold ${formatMoney(S.money.cash, S.country)} in cash and need at least ${formatMoney(annualTuition, S.country)} in hand to start. ${aff.paths.join(' ')}`
    };
  }
  const scholarshipPays=hasFullScholarship&&!['self','family'].includes(funding);
  if(funding==='self'&&S.money.cash<annualTuition)return {ok:false,msg:'You need a first-year cash buffer to self-fund.'};
  const pct = scholarshipPays ? 1.0 : 0;
  if(familyPaysTuition&&!chargeFamilyEducation(S,annualTuition))return {ok:false,msg:'Parent savings changed. Choose another funding route.'};
  if (scholarshipPays) edu.awardedScholarship = null;
  enrollInUniversity(S, uni, majorId, pct);
  edu.university.fundingSource = scholarshipPays ? 'scholarship' : familyPaysTuition ? 'family' : 'self';
  if(familyPaysTuition){edu.university.familyMonthsRemaining=12;edu.university.familyPaidTotal=annualTuition;}
  return { ok: true, msg: `Enrolled at ${uni.name} — ${major.label}${pct === 1.0 ? ' (fully funded)' : ''}!` };
}

/* Progress University & Conscription Monthly when age 18+ */
export function tickInternshipsMonthly(S){const edu=ensureEduExtras(S),now=S.year*12+S.month;for(const a of edu.internships){if(a.status!=='active'||a.lastMonth===now||now<=a.started)continue;const i=INTERNSHIPS.find(x=>x.id===a.id);a.lastMonth=now;if(!i)continue;if(S.country!==i.country){a.status='withdrawn';a.reason='Moved away from placement';continue;}const auth=canLegallyWorkInCurrentCountry(S);if(!auth.allowed||(auth.partTimeOnly&&careerHours(S)+20>20)||careerHours(S)+20>70){a.paused=true;continue;}a.paused=false;const pay=Math.round(convertCurrency(a.monthlyPay,a.payCountry,S.country,S.year));if(pay)walletMove(S,pay,i.label+' monthly worked pay','career');a.paidTotal+=a.monthlyPay;a.completedMonths++;S.player.vitals.stress=clamp(S.player.vitals.stress+2);if(a.completedMonths>=i.months){a.status='completed';edu.academicSkill=clamp((edu.academicSkill||55)+2);S.player.vitals.happiness=clamp(S.player.vitals.happiness+4);recordJournal(S,'Completed '+i.label+' after '+a.completedMonths+' worked months.','milestone');}}}
export function tickUniversityAndConscriptionMonthly(S) {
  tickInternshipsMonthly(S);
  /* 1. University Progression on September / academic year rollover */
  const activeUni=S.education.university,now=S.year*12+S.month;
  if(activeUni){if(activeUni.elapsedMonths==null)activeUni.elapsedMonths=Math.max(0,((activeUni.yearInProgram||1)-1)*12);if(activeUni.progressMonth!==now){activeUni.elapsedMonths++;activeUni.progressMonth=now;}activeUni.yearInProgram=Math.min(activeUni.totalYears,Math.floor(activeUni.elapsedMonths/12)+1);}
  if (activeUni&&activeUni.elapsedMonths>=activeUni.totalYears*12) {
    const u=activeUni;
    if (u.yearInProgram >= u.totalYears) {
      /* GRADUATION! */
      if (!S.education.degrees.includes(u.majorId)) {
        S.education.degrees.push(u.majorId);
      }
      if (!S.education.degreeCountries || typeof S.education.degreeCountries !== 'object') {
        S.education.degreeCountries = {};
      }
      S.education.degreeCountries[u.majorId] = u.country || S.country;
      const gradUniName = u.name;
      const gradMajorLabel = u.majorLabel;
      const gradCountry = u.country;
      S.education.university = null;
      S.education.stage = 'completed';
      S.money.parentalAllowanceActive = false;
      S.player.vitals.smarts = clamp(S.player.vitals.smarts + 5);
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 10);

      emitFact(S, 'GRADUATED_UNI', { uniName: gradUniName, majorLabel: gradMajorLabel });
      recordJournal(S, `Graduated from ${gradUniName} with a degree in ${gradMajorLabel}!`, 'milestone');

      /* Authentic Egyptian Healthcare Pipeline: Imtiyaz Completed -> Medical Syndicate Registration -> Takleef Choice! */
      if (S.country === 'egy' && ['medicine', 'dentistry', 'pharmacy', 'nursing'].includes(u.majorId)) {
        const cObjG = getCountry('egy');
        const takleefPay = eraSalary(cObjG.annualSalaryTiers2026.entry / 12 * 1.05, 'egy', S.year);
        queueScene(S,buildHealthcareGraduateScene(S,{majorId:u.majorId,uniName:gradUniName,pay:takleefPay,year:S.year,country:S.country}));
      }

      /* If studying abroad on a Student Visa, transition automatically to Post-Study Work Visa (PSW / OPT / PGWP / Job-Seeker)! */
      if (S.legal.residency.kind === 'student_visa' && gradCountry === S.country) {
        grantGameGraduatePermit(S,'bachelor',u.majorId);
      }

      evaluateConscriptionCheck(S);
      if (S.legal.military.status !== 'active_duty' && !S.activeScene && S.sceneQueue.length === 0) {
        presentGraduateOrJobSearchOffers(S, `Graduate Recruitment — ${gradUniName}`);
      }
    }
  }

  /* 2. Active Conscription Duty Countdown */
  if (S.legal.military.status === 'active_duty') {
    S.legal.military.monthsRemaining -= 1;
    if (S.legal.military.monthsRemaining <= 0) {
      S.legal.military.status = 'completed';
      S.legal.military.travelPermitted = true;
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 9);
      recordJournal(
        S,
        `Completed mandatory military service and received your Final Completion Certificate — full passport renewal and international travel rights unlocked!`,
        'milestone'
      );
    }
  }
}

/* Authentic Conscription Check (Egypt Male Tagneed, UAE/Singapore National Service) */
export function evaluateConscriptionCheck(S) {
  const mil = S.legal.military;
  if (!mil.applicable) return;
  if (mil.status === 'completed' || mil.status === 'exempt' || mil.status === 'active_duty') return;
  if (S.country !== S.homeCountry) return; // Abroad deferral until return

  const cObj = getCountry(S.homeCountry);
  if (cObj.conscription?.startYear && S.year < cObj.conscription.startYear) {
    mil.status = 'exempt';
    mil.exemptionReason = 'pre_law_cohort';
    return;
  }

  /* Check authentic Egyptian exemption rules: Only male child (Waheed), Dual Citizen, or Medical Myopia/Health */
  const hasBrother = S.relations.siblingIds
    .map(id => S.people[id])
    .some(sb => sb && sb.alive && sb.gender === 'm');

  if (S.homeCountry === 'egy') {
    if (!hasBrother) {
      mil.status = 'exempt';
      mil.exemptionReason = 'Only Son (Waheed Family Exemption)';
      mil.travelPermitted = true;
      recordJournal(S, `Received a Final Military Exemption Certificate (Only-Son Family Exemption) at the mobilization board.`, 'visa');
      return;
    }
    if (S.legal.citizenships.length > 1) {
      mil.status = 'exempt';
      mil.exemptionReason = 'Dual Nationality Security Exemption';
      mil.travelPermitted = true;
      recordJournal(S, `Granted Dual-Nationality Military Exemption.`, 'visa');
      return;
    }
    if (S.player.vitals.health < 65 || chance(S, 0.22)) {
      mil.status = 'exempt';
      mil.exemptionReason = 'Medical / Batch Surplus Exemption';
      mil.travelPermitted = true;
      recordJournal(S, `Granted Medical / Batch Surplus Exemption at the military screening board!`, 'visa');
      return;
    }
  }

  /* Drafted into active service! */
  const hasUniDegree = S.education.degrees.length > 0;
  const durationMos = hasUniDegree ? (cObj.conscription.gradMonths || 12) : (cObj.conscription.nonGradMonths || 24);

  mil.status = 'active_duty';
  mil.monthsRemaining = durationMos;
  mil.travelPermitted = false;
  if (S.career.employed) {
    S.career.employed = false;
    S.career.job = null;
  }
  recordJournal(
    S,
    `Inducted for ${durationMos} months of mandatory national military service (${hasUniDegree ? 'Graduate Reserve Cohort' : 'Standard Conscript Term'}). Overseas travel permits are paused until discharge.`,
    'visa'
  );
}

/* ============================================================================
   JOB MARKET (92+ TRACKS, 582+ COMPANIES), LICENSING BOARDS & 52+ VENTURES
   ========================================================================== */

export function getMergedCareerTracks(year = 2026) {
  const map = {};
  /* 1. Core 10 normalized tracks */
  for (const [id, tr] of Object.entries(CAREER_TRACKS)) {
    map[id] = { ...tr, id };
  }
  /* 2. All 61 V1 deep career tracks (era-aware for legacy vs emerging roles!) */
  for (const vt of (V1_CAREER_TRACKS || [])) {
    if (map[vt.id]) continue;
    const ind = String(vt.industry || '');
    if (vt.availableFrom && year < Number(vt.availableFrom)) continue;
    if (vt.availableUntil && year > Number(vt.availableUntil)) continue;
    if (ind.startsWith('legacy_') && year > 1998) continue;
    if (ind.startsWith('emerging_') && year < 1996) continue;
    if (ind === 'emerging_ai_automation' && year < 2016) continue;
    if (ind === 'emerging_social_media' && year < 2008) continue;

    const lvls = Array.isArray(vt.levels) && vt.levels.length ? vt.levels : [{ level: 0, title: vt.label, baseSalaryEGP: 96000, requirements: {} }];
    const base0 = Math.max(36000, Number(lvls[0].baseSalaryEGP || 84000));
    const isDoctorOrDentist = ['medicine', 'dentistry'].includes(vt.requiresDegree);
    const rawPayMult = Number((base0 / 90000).toFixed(2));
    const payMult = isDoctorOrDentist ? Math.max(1.22, rawPayMult) : clamp(rawPayMult, 0.78, 2.25);
    map[vt.id] = {
      id: vt.id,
      label: vt.label,
      industry: vt.industry || 'business',
      reqDegrees: vt.requiresDegree ? [vt.requiresDegree] : [],
      payMult,
      visaDemand: vt.requiresDegree ? 0.68 : 0.25,
      rungs: lvls.map((lv, idx) => ({
        level: idx,
        title: lv.title || `${vt.label} L${idx + 1}`,
        minExp: Number(lv.requirements?.years || idx * 2),
        /* v2.8 — keep the rung's own one-line description ("what the job
           actually involves") so the market listing can show it. */
        desc: lv.desc || null,
        mult: Number(Math.max(1.0, isDoctorOrDentist && idx >= 2 ? ((lv.baseSalaryEGP || base0) / base0) * 1.18 : (lv.baseSalaryEGP || base0) / base0).toFixed(2))
      }))
    };
  }
  /* 3. All 31 Extra Web-Researched Modern Tracks */
  for (const et of (EXTRA_MODERN_TRACKS || [])) {
    if (map[et.id]) continue;
    if (et.availableFrom && year < et.availableFrom) continue;
    map[et.id] = {
      id: et.id,
      label: et.label,
      industry: et.id.includes('ai') || et.id.includes('cyber') || et.id.includes('cloud') || et.id.includes('devops') ? 'tech' : 'consulting',
      reqDegrees: et.reqDegrees || [],
      payMult: et.payMult || 1.35,
      visaDemand: et.visaDemand || 0.75,
      rungs: extraTrackTitles(et).map((title, level) => ({ level, title, minExp: [0, 2, 5, 9][level], mult: [1.0, 1.55, 2.25, 3.3][level] }))
    };
  }
  return map;
}

/* Titles for the researched modern tracks. A track's field is the label up to its first "&" or comma ("Real Estate Development", not "Real"); a field is never turned into a job by gluing a rank onto it.
   Tracks that name an occupation rather than a field use that occupation's own ranks. */
const EXTRA_TRACK_RANKS = { aviation_pilot: ['Cadet Pilot', 'First Officer', 'Senior First Officer', 'Captain'] };
export function extraTrackField(label) { return String(label || '').split('&')[0].split(',')[0].trim(); }
export function extraTrackTitles(et) {
  if (EXTRA_TRACK_RANKS[et.id]) return EXTRA_TRACK_RANKS[et.id];
  const f = extraTrackField(et.label);
  return [`Junior ${f} Specialist`, `${f} Lead`, `Principal ${f} Specialist`, `Director of ${f}`];
}

const REAL_FALLBACK_COMPANIES = {
  egy: {
    aviation: ['EgyptAir', 'Air Cairo', 'Nesma Airlines'],
    hospitals: ['Dar Al Fouad Hospital', 'As-Salam International Hospital', 'Kasr Al-Ainy Teaching Hospital', 'Saudi German Hospital Cairo'],
    tech: ['Vodafone Intelligent Solutions (_VOIS)', 'Fawry', 'Instabug', 'Valeo Cairo', 'Paymob'],
    engineering: ['Orascom Construction', 'Elsewedy Electric', 'Hassan Allam Holding', 'Arab Contractors'],
    banking: ['CIB (Commercial International Bank)', 'National Bank of Egypt (NBE)', 'EFG Hermes', 'QNB Alahli'],
    default: ['Orascom Group', 'Elsewedy Industrial Group', 'Mansour Group', 'Fawry']
  },
  sau: {
    aviation: ['Saudia', 'Riyadh Air', 'Flynas'],
    hospitals: ['King Faisal Specialist Hospital', 'Dr. Sulaiman Al Habib Medical Group', 'National Guard Health Affairs'],
    tech: ['SDAIA', 'STC Solutions', 'Elm Company', 'Mozn AI'],
    engineering: ['Saudi Aramco', 'SABIC', 'ROSHN Group', 'ACWA Power'],
    banking: ['Al Rajhi Bank', 'Saudi National Bank (SNB)', 'Riyad Bank', 'Jadwa Investment'],
    default: ['Saudi Aramco', 'SABIC', 'STC Group', 'Public Investment Fund (PIF)']
  },
  uae: {
    aviation: ['Emirates Airline', 'Etihad Airways', 'Flydubai', 'Air Arabia'],
    hospitals: ['Cleveland Clinic Abu Dhabi', 'Mediclinic Middle East', 'American Hospital Dubai'],
    tech: ['G42', 'Careem', 'Noon', 'Talabat'],
    engineering: ['ADNOC', 'Emaar Properties', 'Mubadala', 'DP World'],
    banking: ['First Abu Dhabi Bank (FAB)', 'Emirates NBD', 'ADCB'],
    default: ['Mubadala', 'Emaar Group', 'ADNOC', 'Majid Al Futtaim']
  },
  usa: {
    aviation: ['Delta Air Lines', 'United Airlines', 'American Airlines'],
    hospitals: ['Mayo Clinic', 'Johns Hopkins Hospital', 'Cleveland Clinic', 'Mass General Brigham'],
    tech: ['Google', 'Apple', 'Microsoft', 'Stripe', 'OpenAI'],
    default: ['JPMorgan Chase', 'Microsoft', 'General Electric', 'Deloitte US']
  },
  gbr: {
    aviation: ['British Airways', 'Virgin Atlantic', 'easyJet'],
    hospitals: ['Guy’s & St Thomas’ NHS Trust', 'University College London Hospitals', 'Bupa Cromwell Hospital'],
    tech: ['Google DeepMind', 'ARM', 'Revolut', 'Monzo'],
    default: ['Barclays', 'AstraZeneca', 'Rolls-Royce', 'Unilever UK']
  },
  deu: {
    aviation: ['Lufthansa', 'Eurowings', 'Airbus Operations Hamburg'],
    hospitals: ['Charité – Universitätsmedizin Berlin', 'Universitätsklinikum Heidelberg', 'LMU Klinikum Munich'],
    tech: ['SAP', 'Siemens Digital Industries', 'Celonis', 'Infineon'],
    default: ['Siemens AG', 'BMW Group', 'Allianz', 'Bosch']
  },
  che: {
    aviation: ['SWISS (Swiss International Air Lines)', 'Edelweiss Air'],
    hospitals: ['Inselspital Bern', 'Universitätsspital Zürich (USZ)', 'Hôpitaux Universitaires de Genève (HUG)'],
    tech: ['Google Zurich', 'ABB', 'Logitech', 'Sonova'],
    engineering: ['ABB', 'Sika', 'Holcim', 'Stadler Rail'],
    banking: ['UBS', 'Julius Baer', 'Pictet', 'Zürcher Kantonalbank'],
    default: ['Nestlé', 'Novartis', 'Roche', 'Swiss Re']
  },
  swe: {
    aviation: ['SAS (Scandinavian Airlines)', 'Norwegian Air Sweden'],
    hospitals: ['Karolinska Universitetssjukhuset', 'Sahlgrenska Universitetssjukhuset', 'Akademiska sjukhuset'],
    tech: ['Spotify', 'Ericsson', 'Klarna', 'King'],
    engineering: ['Volvo Group', 'ABB Sweden', 'Sandvik', 'Atlas Copco'],
    banking: ['SEB', 'Handelsbanken', 'Swedbank', 'Nordea'],
    default: ['Volvo Group', 'Ericsson', 'H&M Group', 'IKEA']
  },
  tur: {
    aviation: ['Turkish Airlines', 'Pegasus Airlines', 'SunExpress'],
    hospitals: ['Acıbadem Healthcare Group', 'Memorial Hospitals Group', 'Medipol Mega University Hospital'],
    tech: ['Getir', 'Trendyol', 'Turkcell', 'Hepsiburada'],
    engineering: ['Turkish Aerospace Industries (TUSAŞ)', 'Aselsan', 'Rönesans Holding', 'Enka İnşaat'],
    banking: ['Ziraat Bankası', 'Garanti BBVA', 'İşbank', 'Akbank'],
    default: ['Koç Holding', 'Sabancı Holding', 'Turkish Airlines', 'Arçelik']
  }
};

/* A moved / reunited spouse's pay is a REAL job in her field at a real
   company in the new country — never a converted figure (v86.62 correction,
   ported here). Track from the person's own track, else title keywords,
   else degree; rung by age/experience; employer from the real-company pool;
   salary from the era salary table x track pay x rung. Nurses get the
   nursing ladder (Staff Nurse -> Director of Nursing), not doctor titles. */
const NURSING_RUNGS = [
  { level: 0, title: 'Staff Nurse', mult: 0.55 },
  { level: 1, title: 'Senior Staff Nurse', mult: 0.75 },
  { level: 2, title: 'Charge Nurse', mult: 1.05 },
  { level: 3, title: 'Nursing Sister / Matron', mult: 1.45 },
  { level: 4, title: 'Director of Nursing', mult: 2.1 }
];

function trackFromTitle(title) {
  const t = (title || '').toLowerCase();
  if (/nurs/.test(t)) return 'nursing';
  if (/doctor|physician|surgeon|medic|dentist/.test(t)) return 'medicine';
  if (/engineer|architect/.test(t)) return 'engineering';
  if (/software|developer|programmer|data scientist|cyber/.test(t)) return 'software';
  if (/account|financ|bank|invest|audit/.test(t)) return 'finance';
  if (/pharmac/.test(t)) return 'pharma';
  if (/lawyer|attorney|solicitor|advocate/.test(t)) return 'law';
  if (/teacher|lecturer|professor/.test(t)) return 'teaching';
  return null;
}

function trackFromDegree(degree) {
  return { medicine: 'medicine', cs: 'software', engineering: 'engineering', business: 'finance', pharmacy: 'pharma', law: 'law', education: 'teaching' }[degree] || null;
}

export function findRealJobForPerson(S, person, countryId) {
  if (!person || !person.career) return null;
  const oldTitle = person.career.title || '';
  const trackId = (person.career.track && CAREER_TRACKS[person.career.track])
    ? person.career.track
    : trackFromTitle(oldTitle)
    || trackFromDegree((person.education?.degrees || [])[0])
    || 'trades';
  const expYears = person.career.yearsExperience || Math.max(0, (person.age || 25) - 22);
  const rungIdx = Math.min(4, Math.floor(expYears / 4));
  let title, mult, payMult, industry;
  if (trackId === 'nursing') {
    const rung = NURSING_RUNGS[rungIdx];
    title = rung.title;
    mult = rung.mult;
    payMult = (CAREER_TRACKS.medicine?.payMult || 1.52);
    industry = 'medicine';
  } else {
    const track = CAREER_TRACKS[trackId] || CAREER_TRACKS.trades;
    const rung = track.rungs[Math.min(rungIdx, (track.rungs.length || 1) - 1)] || track.rungs[0];
    title = rung?.title || oldTitle || 'Staff';
    mult = rung?.mult || 1;
    payMult = track.payMult || 1;
    industry = track.industry || trackId;
  }
  const employer = pickRealCompanyForTrack(countryId, S.year, trackId === 'nursing' ? 'medicine' : trackId, industry, S);
  if(!employer)return null;
  const baseEntry = eraSalary(getCountry(countryId).annualSalaryTiers2026.entry / 12, countryId, S.year);
  const monthlyGross = Math.round(baseEntry * payShape(countryId, trackId, payMult, mult));
  // NPCs keep the flat career shape (title/employer/track/monthlyIncomeLocal)
  // and also carry a job object for any code that reads career.job.
  person.career.title = title;
  person.career.employer = employer;
  person.career.track = trackId;
  person.career.monthlyIncomeLocal = monthlyGross;
  person.career.employed = true;
  person.career.job = {
    employer, title, track: trackId, level: rungIdx, monthlyGross,
    startYear: S.year, monthsInRole: 0, performance: 65, workMode: 'normal', bossId: null
  };
  person.residenceCountry = countryId;
  return person.career.job;
}

const SLOP_COMPANY_RE = /Continental .* Partners|National Group|Global .* Corp|Generic /i;

export const JOB_EMPLOYER_SECTORS={
 software:'tech',medicine:'hospitals',engineering:'engineering',finance:'banking',pharma:'healthcare',law:'law',teaching:'schools',bpo:'telecom',trades:'retail',
 business:'banking',accounting:'accounting',investment:'banking',marketing:'fmcg',sales:'retail',hr:'fmcg',consulting:'consulting',product:'tech',
 surgery:'hospitals',pediatrics:'hospitals',cardiology:'hospitals',nursing:'hospitals',pharmacy:'hospitals',dentistry:'dental',psychology:'hospitals',veterinary:'veterinary',physiotherapy:'hospitals',prosecutor:'government',architect:'architecture',civil_eng:'engineering',
 petroleum_energy:'oil_gas',renewable_solar:'emerging_renewables',islamic_finance:'banking',sovereign_pe:'banking',urban_masterplan:'architecture',aviation_pilot:'aviation',radiology_imaging:'hospitals',cardiology_surg:'hospitals',biotech_genomics:'healthcare',fintech_product:'tech',supply_chain_ports:'logistics',hospitality_luxury:'hotels',semiconductor_vlsi:'tech',robotics_automation:'manufacturing',quant_risk:'banking',international_arb:'law',diplomacy_policy:'government',media_film:'media',telecom_5g:'telecom',agritech_food:'manufacturing',real_estate_dev:'engineering',edtech_curriculum:'schools',clinical_psych:'hospitals',automotive_ev:'emerging_ev',mining_minerals:'mining',ecommerce_growth:'emerging_ecommerce',aerospace_sat:'engineering',sports_medicine:'hospitals'
};
export function employerCandidates(country,year,trackId,industry){
 const sector=JOB_EMPLOYER_SECTORS[trackId]||industry||trackId;
 const pool=V1_COMPANIES_BY_COUNTRY?.[country]?.[sector]||[];
 // Exact catalog track is usable only when its occupation is the same.
 const direct=Object.hasOwn(CAREER_TRACKS,trackId)?getEmployersFor(country,trackId):[];
 const extra=(EXTRA_REAL_COMPANIES||[]).filter(c=>c.country===country&&(c.industry===sector||c.industry===trackId)&&(!c.founded||c.founded<=year)).map(c=>c.name);
 let names=[...new Set([...direct,...pool.filter(c=>(!c.founded||c.founded<=year)&&(!c.availableFrom||c.availableFrom<=year)).map(c=>c.name),...extra])].filter(n=>n&&!SLOP_COMPANY_RE.test(n)&&!/^Frontier AI Lab/i.test(n));
 if(['engineering','civil_eng','urban_masterplan','real_estate_dev'].includes(trackId))names=names.filter(n=>/construction|bechtel|contract|hassan|orascom|r[oö]nesans|en.?ka|roshn|vinci|bouygues|skanska|aec|arup|tata projects|larsen|obayashi|shimizu|taisei|hyundai.*construct|samsung.*c.?t/i.test(n));
 if(trackId==='prosecutor')names=names.filter(n=>/prosecut|justice|attorney|court/i.test(n));
 return names;
}
/* An employer that dismissed you after formal warnings does not hire you straight back. GAME DESIGN (not a real-world figure): 5 years after a dismissal, 3 after a redundancy (the length of a crisis). */
export function recentlyDismissedFrom(S){return ((S&&S.career&&S.career.dismissedFrom)||[]).filter(d=>S.year-d.year<(d.kind==='redundant'?3:5)).map(d=>d.employer);}
function pickRealCompanyForTrack(country,year,trackId,industry,S){
 let names=employerCandidates(country,year,trackId,industry);
 const barred=recentlyDismissedFrom(S);const open=names.filter(n=>!barred.includes(n));if(open.length)names=open;
 return names.length?names[(year+trackId.length*3)%names.length]:null;
}

export function getRequiredForeignBoardForJob(S, trackId, reqDegrees = []) {
  ensureExtendedState(S);
  const isMedical = trackId === 'medicine' || reqDegrees.includes('medicine') || reqDegrees.includes('dentistry');
  const isEng = trackId === 'engineering' || reqDegrees.includes('engineering');
  const degCountry = S.education.degreeCountries?.[reqDegrees[0]] || S.homeCountry;
  const foreignEducated = degCountry !== S.country; // Nationality does not convert a foreign qualification into a local one.

  if (isMedical && foreignEducated) {
    if (S.country === 'sau' && !S.credentials.licenses.includes('lic_sau_scfhs')) {
      return { id: 'lic_sau_scfhs', label: 'Saudi SCFHS SMLE & DataFlow License' };
    }
    if (S.country === 'uae' && !S.credentials.licenses.includes('lic_uae_dha') && !S.credentials.licenses.includes('lic_uk_plab') && !S.credentials.licenses.includes('lic_us_usmle')) {
      return { id: 'lic_uae_dha', label: 'UAE DHA / MOHAP Medical License (or UK GMC / US USMLE Tier-1 Exemption)' };
    }
    if (S.country === 'gbr' && !S.credentials.licenses.includes('lic_uk_plab')) {
      return { id: 'lic_uk_plab', label: 'UK GMC PLAB / UKMLA Registration' };
    }
    if (S.country === 'usa' && !S.credentials.licenses.includes('lic_us_usmle')) {
      return { id: 'lic_us_usmle', label: 'USMLE Steps 1–3 & ECFMG Certification' };
    }
    if (S.country === 'deu' && !S.credentials.licenses.includes('lic_deu_approbation')) {
      return { id: 'lic_deu_approbation', label: 'German Fachsprachprüfung C1 + Approbation' };
    }
  }
  if (isEng && foreignEducated && S.country === 'sau' && S.year >= 2018 && !S.credentials.licenses.includes('lic_sau_sce')) {
    return { id: 'lic_sau_sce', label: 'Saudi Council of Engineers (SCE) Accreditation' };
  }
  return null;
}

export function matchingLicensePayBoost(S,reqDegrees=[]){
  return PROFESSIONAL_LICENSES.some(l=>reqDegrees.includes(l.reqDegree)&&(S.credentials?.licenses||[]).includes(l.id))?1.14:1;
}

/* The market line for a rung with no licence or postgraduate boost: the country's entry salary tier, that year's wage index, the track's pay multiplier and the rung's. Used to price posts that are written as US-dollar amounts so they sit on the same line as every other job in the country. */
export function marketMonthlyGross(country, year, trackId, level) {
  const tr = getMergedCareerTracks(year)[trackId];
  const rung = tr && (tr.rungs.find(r => r.level === level) || tr.rungs[0]);
  if (!tr || !rung) return 0;
  const base = eraSalary(getCountry(country).annualSalaryTiers2026.entry, country, year);
  return Math.max(Math.round((base / 12) * payShape(country, trackId, tr.payMult, rung.mult)), statutoryMinMonthlyGross(country, year, { month: 6 }));
}
/* A monthly pay written as 2026 US dollars at US wages, in this country's currency: scaled by how this country's market pays the same rung compared with the USA's. The USA is unchanged. */
export function usdMonthlyPayToLocal(country, year, usdMonthly, trackId = 'business', level = 1) {
  const here = marketMonthlyGross(country, year, trackId, level);
  const us = marketMonthlyGross('usa', 2026, trackId, level);
  if (!(here > 0) || !(us > 0)) return Math.round(convertCurrency(usdMonthly, 'usa', country, year));
  return Math.round(usdMonthly * here / us);
}

export function listAvailableJobs(S) {
  const cObj = getCountry(S.country);
  const degrees = S.education.degrees;
  const merged = getMergedCareerTracks(S.year);
  const jobs = [];

  for (const [trackId, track] of Object.entries(merged)) {
    /* A sovereign wealth fund job exists only where a state fund of that name does: Saudi (PIF), UAE (ADIA, Mubadala), Singapore (GIC), Egypt (Sovereign Fund of Egypt). Elsewhere the same degree uses the investment and finance tracks. Jobs already held are untouched. */
    if (trackId === 'sovereign_pe' && !['sau', 'uae', 'sgp', 'egy'].includes(S.country)) continue;
    const qualifiedByDegree = track.reqDegrees.length === 0 || track.reqDegrees.some(d => degrees.includes(d));
    const trackExp = S.career.trackExperience[trackId] || 0;

    let bestRung = track.rungs[0];
    for (const r of track.rungs) {
      if (trackExp >= r.minExp) bestRung = r;
    }

    const employer = pickRealCompanyForTrack(S.country, S.year, trackId, track.industry, S);
    if(!employer)continue;
    const baseAnnual = eraSalary(cObj.annualSalaryTiers2026.entry, S.country, S.year);
    const licBoost = matchingLicensePayBoost(S,track.reqDegrees);
    const pgList = S.postgrad?.completed || [];
    const pgBoost = pgList.some(p => p.tier === 'fellowship_phd') ? 1.42 : pgList.length > 0 ? 1.26 : 1.0;
    const monthlyGross = Math.max(Math.round((baseAnnual / 12) * payShape(S.country, trackId, track.payMult, bestRung.mult) * licBoost * pgBoost), statutoryMinMonthlyGross(S.country, S.year, { month: S.month }));
    const missingBoard = qualifiedByDegree ? getRequiredForeignBoardForJob(S, trackId, track.reqDegrees) : null;

    jobs.push({
      id: `${S.country}_${trackId}_${bestRung.level}`,
      track: trackId,
      trackLabel: track.label,
      industry: track.industry || 'general',
      level: bestRung.level,
      title: bestRung.title,
      employer,
      monthlyGross,
      qualifiedByDegree,
      missingBoard,
      reqDegrees: track.reqDegrees,
      minExp: bestRung.minExp
    });
  }
  return jobs;
}

export function canLegallyWorkInCurrentCountry(S) {
  const res = S.legal.residency.kind;
  if (['citizen', 'permanent_resident', 'work_visa', 'gulf_iqama', 'golden_visa', 'post_study_work'].includes(res)) {
    return { allowed: true };
  }
  if (res === 'student_visa') {
    return { allowed: true, partTimeOnly: true };
  }
  return { allowed: false, reason: 'No valid work authorization in this country (undocumented / expired status).' };
}

/* ============================================================================
   v2.8 — JOB CARD DATA (W1 §2: payslip contract, ladder, performance,
   benefits). One record per thing, and the card reads the same records the
   systems use:
   - Leave balance lives on the job itself: job.leave = { annualDays,
     usedDays, year }. Annual days come from vacationEntitlementDays (the
     country's law + tenure); trips and leave actions spend usedDays; the
     balance resets when the year turns. Nothing else stores leave.
   - Performance parts live on the job: job.performanceParts. The manager's
     view is BLENDED from the boss's live relationship record each time it is
     read, so the relationship moves the review.
   - Employer health cover is a flag, S.insurance.employerHealth, set by
     syncEmployerBenefits from the country's contract rules (mandatory /
     NHS / public = covered; typical / limited = not confirmed, so no
     cover). syncEmployerBenefits also re-derives the ONE cover flag,
     S.medical.healthInsurance (private policy OR employer cover), so
     gaining or losing a job updates cover at once. The treatment-cost
     model discounts private care only for cover actually held — a private
     policy pays about a quarter, an employer plan about 45% off, no
     confirmed cover is charged in full — and the Medical tab says
     exactly that.
   ========================================================================== */

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < String(s).length; i++) h = (h * 31 + String(s).charCodeAt(i)) >>> 0;
  return h;
}

export function employerHealthCover(S) {
  const rule = contractRuleFor(S.country);
  const kind = rule.employerHealth;
  if (kind === 'mandatory') return { covered: true, certain: true, kind, label: 'Health insurance — through your employer (required by law)', detail: rule.note };
  if (kind === 'nhs' || kind === 'public') return { covered: true, certain: true, kind, label: 'Health cover — the public system', detail: rule.note };
  if (kind === 'typical') return { covered: false, certain: false, kind, label: 'Health insurance — not guaranteed with this job', detail: `${rule.note} This employer may or may not offer a plan — the game has no per-employer policy record, so it is shown as unconfirmed rather than assumed.` };
  return { covered: false, certain: false, kind, label: 'No health insurance from this job', detail: rule.note };
}

/* v2.12 — the two employer perks are real systems now, decided here next
   to employerHealthCover so the Work tab, the Bank tab and the Medical
   tab can never disagree about them. Industry comes from the same merged
   tracks the job card reads, so the perk line and the eligibility check
   are the same condition.
   Staff loan (finance / banking jobs): bank staff borrow at the bank's
   own 1-year deposit rate — no markup — while anyone else pays that rate
   + 5.5 points (the same formula takePersonalLoan charges). The rate is
   derived from the country's own deposit rates for this era, never typed
   in. takeStaffLoan in economyEngine.js books the loan at this rate.
   Staff treatment (medicine / nursing jobs): hospital staff get private
   specialist treatment at their own hospital for about a quarter of the
   full bill. treatmentCostLocal in mortalityModel.js charges exactly
   that, so the Medical tab's prices and the charge agree. */
export function staffLoanTerms(S) {
  const job = S.career?.job;
  const industry = job ? (getMergedCareerTracks(S.year)[job.track] || {}).industry || 'general' : 'general';
  const eligible = !!(S.career?.employed && job && (industry === 'finance' || industry === 'banking' || job.track === 'finance'));
  const rates = eraDepositRates(S.country, S.year);
  const staffRate = Number(rates.cd1Yr.toFixed(4));
  const standardRate = Number((rates.cd1Yr + 0.055).toFixed(4));
  return { eligible, staffRate, standardRate };
}

export function staffTreatmentEligible(S) {
  const job = S.career?.job;
  if (!S.career?.employed || !job) return false;
  const industry = (getMergedCareerTracks(S.year)[job.track] || {}).industry || 'general';
  return industry === 'medicine' || industry === 'nursing' || job.track === 'medicine' || job.track === 'nursing';
}

/* v2.9 — ONE health-cover flag: S.medical.healthInsurance is the single
   source of truth for "you currently have health cover". It is DERIVED —
   a private policy you bought (S.insurance.health) OR confirmed cover
   from your current job (S.insurance.employerHealth, set below from the
   country's contract rules). Every writer calls this after changing
   either source, so the three flags can never disagree again: gain a job
   with cover and cover appears; resign and employer cover goes with the
   job unless you hold a private policy; cancelling the private policy
   leaves employer cover alone. */
export function syncHealthCover(S) {
  if (!S.medical) S.medical = { conditions: [], fertilityScore: 82, healthInsurance: false };
  if (!S.insurance) S.insurance = { health: false, auto: false, home: false, employerHealth: false };
  S.medical.healthInsurance = !!(S.insurance.health || S.insurance.employerHealth);
}

export function syncEmployerBenefits(S) {
  ensureExtendedState(S);
  if (!S.insurance) S.insurance = { health: false, auto: false, home: false };
  if (S.insurance.employerHealth === undefined) S.insurance.employerHealth = false;
  S.insurance.employerHealth = !!(S.career?.employed && S.career?.job && employerHealthCover(S).covered);
  /* Resigning (or moving to a job without cover) drops employer cover;
     a private policy, if held, keeps S.medical.healthInsurance true. */
  syncHealthCover(S);
}

/* The contract, the leave balance and the performance breakdown for the
   current job. Backfills old saves (jobs hired before v2.8 have none of
   this) and resets the leave year when the year turns. Called by the
   monthly tick and by the Career tab render — both read the same object. */
var _promotionEligibility; // var: set during a circular module load, before this line runs
export function registerPromotionEligibility(fn) { _promotionEligibility = fn; }
export const SENIOR_RUNG_LEVEL = 3; // game design: rungs at or above this level need an application

export function jobEmploymentFraction(job) {
  return job?.employmentFraction === 0.45 || /^part-time/i.test(job?.title || '') ? 0.45 : 1;
}

export function getJobContract(S) {
  ensureExtendedState(S);
  const job = S.career?.job;
  if (!job) return null;
  const yearsService = Math.floor((job.monthsInRole || 0) / 12);
  const rules = contractRuleFor(S.country);
  const annualDays = vacationEntitlementDays(S.country, yearsService);
  if (!job.leave || job.leave.year !== S.year) {
    job.leave = { annualDays, usedDays: 0, year: S.year, extraDays: 0 };
  } else if (job.leave.annualDays !== annualDays + (job.leave.extraDays || 0)) {
    /* v2.8 §3 (W2): extra days granted by a successful "ask for more"
       live in job.leave.extraDays so they survive this recompute. */
    job.leave.annualDays = annualDays + (job.leave.extraDays || 0);
  }
  if (!job.performanceParts) {
    const p = clamp(job.performance ?? 65, 0, 100);
    job.performanceParts = { attendance: clamp(p + 2, 0, 100), quality: p, teamwork: clamp(p - 2, 0, 100), managerView: clamp(p, 0, 100) };
  }
  const probationMonths = rules.probationMonths;
  const onProbation = (job.monthsInRole || 0) < probationMonths;
  const notice = noticeAndSeveranceFor(S.country, yearsService);
  const isPartTime = jobEmploymentFraction(job) < 1;
  const contractType = isPartTime ? 'Part-time contract' : onProbation ? 'Permanent contract — on probation' : 'Permanent contract';
  const merged = getMergedCareerTracks(S.year);
  const industry = merged[job.track]?.industry || 'general';
  const shift = isPartTime ? 'Part-time roster, about 20 hours a week (game model)' : industry === 'aviation'
    ? 'Rostered flying duties — variable days, nights and layovers (about 75–90 flying hours a month, modelled)'
    : (industry === 'medicine' || industry === 'nursing' || job.track === 'medicine' || job.track === 'nursing')
    ? 'Rotating shifts — days, nights and on-call weekends'
    : job.track === 'teaching'
    ? 'School day, term-time — holidays follow the school calendar'
    : (industry === 'retail' || industry === 'hospitality')
    ? 'Shift work — evenings and weekends included'
    : `Office hours — ${rules.weeklyHours} hours a week`;
  const teamSize = 3 + (hashStr(`${job.employer}|${job.title}`) % 16);
  const isLeadTitle = /manager|lead|chief|captain|head|director|matron|sister|principal|supervisor/i.test(job.title || '');
  const directReports = job.level >= 3 ? 2 + job.level : isLeadTitle ? 2 : 0;
  return {
    rules, yearsService, annualDays,
    leave: job.leave,
    remainingLeave: Math.max(0, job.leave.annualDays - job.leave.usedDays),
    probationMonths, onProbation, contractType, notice, shift, teamSize, directReports,
    location: `${S.city}, ${getCountry(S.country).name}`
  };
}

/* Performance broken into what drives it. The manager's view is blended
   50/50 from the stored part and the boss's LIVE relationship record
   (affection + respect + trust), so a boss who likes you rates you better
   and a boss you have crossed rates you worse. */
export function getPerformanceParts(S) {
  const contract = getJobContract(S);
  if (!contract) return null;
  const job = S.career.job;
  const parts = job.performanceParts;
  const boss = job.bossId ? S.people[job.bossId] : null;
  let managerView = parts.managerView;
  let bossRel = null;
  if (boss?.rel) {
    bossRel = { affection: boss.rel.affection, respect: boss.rel.respect, trust: boss.rel.trust };
    managerView = Math.round((parts.managerView + (boss.rel.affection + boss.rel.respect + boss.rel.trust) / 3) / 2);
  }
  return {
    attendance: Math.round(parts.attendance),
    quality: Math.round(parts.quality),
    teamwork: Math.round(parts.teamwork),
    managerView: Math.round(managerView),
    overall: Math.round(job.performance ?? 65),
    boss: boss ? { name: boss.fullName, rel: bossRel } : null
  };
}

/* The real ladder for the current job's track, era-gated through
   getMergedCareerTracks. Each rung shows its pay (same formula as the job
   market: entry salary × track pay × rung mult × licence/postgrad boosts)
   and its requirements with met / not-met and where you stand. No rung
   without a stated requirement; aviation flight hours are derived from
   years and marked modelled. */
export function getLadderForJob(S) {
  const job = S.career?.job;
  if (!job) return null;
  const merged = getMergedCareerTracks(S.year);
  const track = merged[job.track] || CAREER_TRACKS[job.track];
  if (!track || !Array.isArray(track.rungs)) return null;
  const cObj = getCountry(S.country);
  const degrees = S.education.degrees || [];
  const trackExp = S.career.trackExperience[job.track] || 0;
  const baseAnnual = eraSalary(cObj.annualSalaryTiers2026.entry, S.country, S.year);
  const licBoost = matchingLicensePayBoost(S,track.reqDegrees||[]);
  const pgList = S.postgrad?.completed || [];
  const pgBoost = pgList.some(p => p.tier === 'fellowship_phd') ? 1.42 : pgList.length > 0 ? 1.26 : 1.0;
  const board = getRequiredForeignBoardForJob(S, job.track, track.reqDegrees || []);
  const rungs = track.rungs.map(r => {
    const pay = Math.max(Math.round((baseAnnual / 12) * payShape(S.country, job.track, track.payMult, r.mult) * licBoost * pgBoost * jobEmploymentFraction(job)), Math.round(statutoryMinMonthlyGross(S.country, S.year, { month: S.month }) * jobEmploymentFraction(job)));
    const reqs = [
      { label: `${r.minExp} year${r.minExp === 1 ? '' : 's'} in this track`, met: trackExp >= r.minExp, detail: `you have ${trackExp}` }
    ];
    if ((track.reqDegrees || []).length) {
      const held = track.reqDegrees.some(d => degrees.includes(d));
      reqs.push({ label: `Degree in ${track.reqDegrees.join(' or ').toUpperCase()}`, met: held, detail: held ? `you hold ${degrees.join(', ').toUpperCase()}` : 'not held yet' });
    }
    if (board) reqs.push({ label: board.label, met: false, detail: 'not held yet — sit it on the Education tab' });
    reqs.push({ label: 'Performance 72% or better', met: (job.performance ?? 0) >= 72, detail: `yours is ${Math.round(job.performance ?? 0)}%` });
    if (job.track === 'aviation' && r.minExp > 0) {
      reqs.push({ label: `About ${r.minExp * 750} flying hours`, met: trackExp >= r.minExp, detail: `about ${trackExp * 750} so far`, modelled: true });
    }
    return { level: r.level, title: r.title, pay, current: r.level === job.level, metAll: reqs.every(q => q.met), reqs };
  });
  const next = rungs.find(r => r.level === job.level + 1) || null;
  return { trackLabel: track.label, rungs, next, currentLevel: job.level };
}

/* Projected monthly pension if you retired today — the SAME formula
   retireFromCareer pays (last gross × 0.22 + 1.5% per year of experience,
   capped at 68%, citizens / permanent residents only). */
export function projectedPension(S) {
  const lastGross = S.career.job?.monthlyGross || eraSalary(getCountry(S.country).annualSalaryTiers2026.entry / 12, S.country, S.year);
  const expFactor = Math.min(0.68, 0.22 + (S.career.yearsExperience || 0) * 0.015);
  const citizen = S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident';
  const statePension=S.country==='usa'?usStatePension(S).monthly:citizen&&(S.career.yearsExperience||0)>0?Math.round(lastGross*expFactor):0;
  const potTopUp=S.career.market?.pension?.paidOut?.monthlyTopUp||0;
  return { monthly: statePension+potTopUp, citizen, expFactor };
}

/* Simplified shared game accrual, not a country-specific legal entitlement. */
export function computeEndOfService(S) {
  const job = S.career?.job;
  if (!job) return { eligible: false, amount: 0, yrsServed: 0 };
  const yrsServed = Math.floor((job.monthsInRole || 0) / 12);
  if (!['sau', 'uae', 'egy'].includes(S.country) || yrsServed < 2 || !(job.monthlyGross > 0)) {
    return { eligible: false, amount: 0, yrsServed };
  }
  const basicPay = job.monthlyGross * 0.65;
  const yrsFirst5 = Math.min(5, yrsServed);
  const yrsAfter5 = Math.max(0, yrsServed - 5);
  return { eligible: true, amount: Math.round(basicPay * (yrsFirst5 * (21 / 30) + yrsAfter5 * 1.0)), yrsServed, model: 'shared game rule, not statutory entitlement', basicPayShare: .65 };
}

/* ============================================================================
   v2.8 — JOB MARKET INSIDE INFORMATION + INTERVIEW AS A SCENE (§5)
   One interview rule, used two ways: applyForJob resolves it at once (the
   path the tests and the graduate-offer flow call), while the Apply button
   queues a real interview scene whose choices resolve through the same
   scorer. A rejection always says why — never a silent "no".
   ========================================================================== */

/* The hard gates on any full-time application, in order. The market listing
   and the Apply button read this same function — a job that shows as
   eligible really is one the player can take. */
export function checkJobApplication(S, jobOffer) {
  if (S.player.age < 18) return { ok: false, msg: 'Must be 18+ for full-time employment.' };
  if (S.legal.military.status === 'active_duty') {
    return { ok: false, msg: 'Finish active military service before starting civilian employment.' };
  }
  if (S.education.university && jobOffer.reqDegrees && jobOffer.reqDegrees.length > 0) {
    return { ok: false, msg: 'Finish university before taking a degree-track post (or use Part-Time & Side Gigs!).' };
  }
  const workAuth = canLegallyWorkInCurrentCountry(S);
  if (!workAuth.allowed) {
    return { ok: false, msg: workAuth.reason };
  }
  /* v2.15 W2 — a signed non-compete (from a headhunter move) blocks
     rejoining that employer until it expires. */
  const nc = S.career?.market?.nonCompete;
  if (nc && jobOffer.employer === nc.employer && S.year <= nc.untilYear) {
    return { ok: false, msg: `You signed a non-compete with ${nc.employer} until ${nc.untilYear} — you cannot work for them until then.` };
  }
  if (!jobOffer.qualifiedByDegree) {
    return { ok: false, msg: `Requires a degree in ${(jobOffer.reqDegrees||[]).join(' or ').toUpperCase()}.` };
  }
  /* A flying post needs a current medical certificate (the same rule dutyEligibility.js cites). Game rule: while one of the game's serious conditions is active, no airline will hire you to fly. Not a statement of aviation law. */
  const flying = jobOffer.track === 'aviation' && /pilot|first officer|captain/i.test(jobOffer.title || '');
  const grounding = flying && (S.medical?.conditions || []).find(c => isSeriousCondition(c.id));
  if (grounding) {
    return { ok: false, msg: `${jobOffer.employer} cannot hire you to fly while you are being treated for ${String(grounding.label || grounding.name || grounding.id).replace(/_/g, ' ')}: a pilot needs a current medical certificate.` };
  }
  const missingBoard = getRequiredForeignBoardForJob(S, jobOffer.track, jobOffer.reqDegrees || []);
  if (missingBoard) {
    return { ok: false, msg: `Foreign qualification requires ${missingBoard.label} — sit it on the Education tab (Languages & Licensing Boards)!` };
  }
  return { ok: true, workAuth };
}

/* The interview score — same formula as before (Smarts, experience,
   Charisma, Wasta, tailored attire, one seeded roll). Returns the score, the
   verdict, and the weakest area so a rejection can say WHY. */
export function scoreJobInterview(S, jobOffer) {
  const smarts = S.player.vitals.smarts || 0;
  const expYears = S.career.yearsExperience || 0;
  const charisma = S.skills?.charisma || 45;
  const charismaBonus = (charisma - 45) * 0.30;
  const wastaBonus = ((S.skills?.wasta || 35) - 35) * 0.22;
  const attireBonus = S.player.appearance?.tailored ? 6 : 0;
  /* v2.8 §3 (W2): a strong reference from your manager or a colleague
     counts in the interview — stored by peopleAtWork on the old job. */
  const referenceBonus = S.career.job?.actionState?.reference
    ? Math.min(10, S.career.job.actionState.reference.strength / 10)
    : 0;
  const score = smarts * 0.55 + Math.min(30, expYears * 4) + charismaBonus + wastaBonus + attireBonus + referenceBonus + familyNameInterviewPoints(S) + internshipReferencePoints(S) + randInt(S, 5, 32);
  const parts = [
    { key: 'knowledge', value: smarts },
    { key: 'experience', value: Math.min(100, expYears * 12) },
    { key: 'interview presence', value: charisma }
  ];
  const weakest = parts.reduce((a, b) => (b.value < a.value ? b : a)).key;
  const hired = score >= 46;
  const reason = hired
    ? `Interview score ${Math.round(score)}/100 (needed 46) — ${jobOffer.employer} offered you the job.`
    : `Interview score ${Math.round(score)}/100 (needed 46). Your weakest area was ${weakest}, and ${jobOffer.employer} hired another candidate who was stronger there. Build ${weakest === 'knowledge' ? 'Smarts' : weakest === 'experience' ? 'years of experience' : 'Charisma'} and try again.`;
  return { score, hired, weakest, reason };
}

/* The gross on the offer letter: a student-visa hire is part-time only at
   45% of the listed gross (the visa system's real rule); strong Charisma or
   tailored attire negotiates a little more. */
function offerGross(S, jobOffer, workAuth) {
  const negotiationMult = (S.skills?.charisma || 45) >= 72 ? 1.07 : (S.player.appearance?.tailored ? 1.03 : 1.0);
  return Math.round((workAuth.partTimeOnly ? jobOffer.monthlyGross * 0.45 : jobOffer.monthlyGross) * negotiationMult);
}

/* The hire itself — one place, used by both the immediate path and the
   interview-scene path. Unchanged behaviour: job record, PSW/grace visa
   upgrade with the UK salary threshold, boss spawn, income-surge fact,
   journal line. */
/* v2.15 W2 — exported so a headhunter offer hires through the same one
   path; extra.exactGross hires at the exact offered gross, so the offer
   letter and the pay match. */
export function hireIntoJob(S, jobOffer, workAuth, extra = {}) {
  const gross = extra.exactGross != null ? Math.round(extra.exactGross) : offerGross(S, jobOffer, workAuth);
  const prevGross = S.career.job?.monthlyGross || 0;

  S.career.employed = true;
  S.career.unemployedMonths = 0;
  S.career.retired = false;
  S.career.job = {
    employer: jobOffer.employer,
    title: workAuth.partTimeOnly ? `Part-Time ${jobOffer.title}` : jobOffer.title,
    employmentFraction: workAuth.partTimeOnly ? 0.45 : 1,
    track: jobOffer.track,
    level: jobOffer.level,
    monthlyGross: gross,
    startYear: S.year, payIndexYear: S.year,
    monthsInRole: 0,
    performance: 68,
    workMode: 'normal',
    bossId: null
  };

  /* If on PSW / Chancenkarte / Grace Period in a host country and hired in skilled role, upgrade to Sponsored Work Visa! */
  if (['post_study_work', 'grace_period'].includes(S.legal.residency.kind) && !S.legal.citizenships.includes(S.country)) {
    /* Enforce UK £38,700 / £41,700 Skilled Worker Salary Threshold (with <26 New Entrant & NHS Medicine/Teaching exemptions!) */
    if (S.country === 'gbr' && S.year >= 2024) {
      const annualOffer = gross * 12;
      const discounted = S.player.age < 26 || ['medicine', 'nursing', 'teaching'].includes(jobOffer.track);
      const minThreshold = eraSalary(discounted ? 30960 : (S.year >= 2025 ? 41700 : 38700), 'gbr', S.year);
      if (annualOffer >= minThreshold) {
        transitionResidency(S, 'work_visa', {
          permitName: `UK Skilled Worker Visa (${discounted ? 'New Entrant / Health Scale' : 'Standard Threshold'})`,
          sponsorName: jobOffer.employer,
          expiresYear: S.year + 3,
          graceMonthsLeft: 0,
          force: true
        });
        S.legal.blockedAccount = null;
      }
    } else {
      const newKind = (S.country === 'sau' || S.country === 'uae') ? 'gulf_iqama' : 'work_visa';
      transitionResidency(S, newKind, {
        permitName: (S.country === 'sau') ? 'Saudi Work Iqama' : (S.country === 'uae') ? 'UAE Residence Visa' : (S.country === 'deu' ? 'German EU Blue Card' : `${getCountry(S.country).adjective} Skilled Work Visa`),
        sponsorName: jobOffer.employer,
        sponsorArchetype: 'fair',
        expiresYear: S.year + 2,
        graceMonthsLeft: 0,
        force: true
      });
      S.legal.blockedAccount = null;
    }
  }

  const { boss } = spawnWorkplaceCast(S, jobOffer.employer, jobOffer.track, gross);
  S.career.job.bossId = boss.id;
  /* v2.8 — the contract record (leave balance, performance parts) and the
     employer health flag are set at hire, from the one getJobContract /
     syncEmployerBenefits pair. */
  getJobContract(S);
  syncEmployerBenefits(S);

  if (gross > prevGross * 1.4) {
    emitFact(S, 'INCOME_SURGE', { employer: jobOffer.employer, monthlyGross: gross });
  }
  recordJournal(
    S,
    `Accepted an offer as ${S.career.job.title} at ${jobOffer.employer} (${formatMoney(gross, S.country)}/month gross), reporting to ${boss.fullName}.`,
    'career'
  );
  S.career.lastApplication = {
    employer: jobOffer.employer, title: jobOffer.title, hired: true,
    reason: `Offer accepted — ${S.career.job.title} at ${jobOffer.employer}, ${formatMoney(gross, S.country)}/mo gross${extra.score != null ? ` (interview ${extra.score}/100)` : ''}.`,
    year: S.year, month: S.month
  };
  return { ok: true, msg: `Hired at ${jobOffer.employer}!` };
}

export function applyForJob(S, jobOffer) {
  const pre = checkJobApplication(S, jobOffer);
  if (!pre.ok) return { ok: false, msg: pre.msg };
  const scored = scoreJobInterview(S, jobOffer);
  if (!scored.hired) {
    recordJournal(S, `Interviewed at ${jobOffer.employer} for ${jobOffer.title}, but another candidate edged you out.`, 'career');
    S.career.lastApplication = {
      employer: jobOffer.employer, title: jobOffer.title, hired: false,
      reason: scored.reason, year: S.year, month: S.month
    };
    return { ok: false, msg: scored.reason };
  }
  return hireIntoJob(S, jobOffer, pre.workAuth);
}

/* Resolve an interview scene: the player's approach adds a small modifier
   (at most +8 / at least −6) on top of the one interview score — the base
   score still decides. Records the outcome on S.career.lastApplication so
   the Career tab shows what happened. */
export function resolveJobInterview(S, jobOffer, approach = 'preparation') {
  const pre = checkJobApplication(S, jobOffer);
  if (!pre.ok) {
    S.career.lastApplication = {
      employer: jobOffer.employer, title: jobOffer.title, hired: false,
      reason: pre.msg, year: S.year, month: S.month
    };
    recordJournal(S, `Your application for ${jobOffer.title} at ${jobOffer.employer} could not go ahead: ${pre.msg}`, 'career');
    return { ok: false, hired: false, msg: pre.msg };
  }
  const base = scoreJobInterview(S, jobOffer);
  let mod = 0;
  if (approach === 'experience') mod = Math.max(-6, Math.min(8, (S.career.yearsExperience || 0) * 2));
  else if (approach === 'preparation') mod = Math.max(-6, Math.min(8, Math.round(((S.player.vitals.smarts || 50) - 50) / 5)));
  else if (approach === 'charm') mod = Math.max(-6, Math.min(8, Math.round(((S.skills?.charisma || 45) - 45) / 5)));
  const score = base.score + mod;
  if (score < 46) {
    const reason = `Interview score ${Math.round(score)}/100 (needed 46). Your weakest area was ${base.weakest}, and ${jobOffer.employer} hired another candidate who was stronger there. Build ${base.weakest === 'knowledge' ? 'Smarts' : base.weakest === 'experience' ? 'years of experience' : 'Charisma'} and try again.`;
    recordJournal(S, `Interviewed at ${jobOffer.employer} for ${jobOffer.title}, but another candidate edged you out.`, 'career');
    S.career.lastApplication = {
      employer: jobOffer.employer, title: jobOffer.title, hired: false,
      reason, year: S.year, month: S.month
    };
    return { ok: false, hired: false, msg: reason };
  }
  return hireIntoJob(S, jobOffer, pre.workAuth, { approach, score: Math.round(score) });
}

/* The interview as a scene (same mechanism as every other life scene):
   apply → this scene on the Timeline tab → answer → offer or rejection with
   a reason. The title carries the year so the same employer applied to in
   different years never counts as a repeated card. */
export function buildJobInterviewScene(S, jobOffer) {
  const detail = describeJobOffer(S, jobOffer);
  return {
    key: `job_interview_${S.country}_${jobOffer.track}_${S.year}_${S.month}_${S.turn}`,
    baseId: 'job_interview',
    maxPerLife: 99,
    category: 'career',
    title: `Job Interview — ${jobOffer.title}, ${jobOffer.employer} (${S.year})`,
    text: `The hiring manager at ${jobOffer.employer} in your city interviews you for ${jobOffer.title}. ${detail.involves ? `${detail.involves} ` : ''}They ask about your experience, and why they should pick you over every other candidate. How do you answer?`,
    choices: [
      {
        label: (S.career.yearsExperience || 0) > 0 ? 'Lead with your experience — walk them through what you have actually done' : 'Lead with what you have done so far — school, projects, anything you have built',
        effect: (st) => { resolveJobInterview(st, jobOffer, 'experience'); }
      },
      {
        label: 'Lead with preparation — show you researched the company and the role',
        effect: (st) => { resolveJobInterview(st, jobOffer, 'preparation'); }
      },
      {
        label: 'Lean on charm and connections — win the room, name people you know',
        effect: (st) => { resolveJobInterview(st, jobOffer, 'charm'); }
      }
    ]
  };
}

/* Every requirement on a listing, with met / not-met and the reason in plain
   words. The listing, the "Qualified Only" filter and the Apply button all
   read this — one eligibility rule, not three. */
export function describeJobRequirements(S, job) {
  const rows = [];
  const degrees = S.education.degrees || [];
  if (job.reqDegrees && job.reqDegrees.length) {
    const held = job.reqDegrees.find(d => degrees.includes(d));
    rows.push({
      label: `Degree in ${job.reqDegrees.join(' or ').toUpperCase()}`,
      met: !!held,
      reason: held
        ? `You hold ${held.toUpperCase()}`
        : `Needs ${job.reqDegrees.join(' or ').toUpperCase()} — you hold ${degrees.length ? degrees.map(d => d.toUpperCase()).join(', ') : 'no degree yet'}`
    });
    /* A board is only meaningful once the degree is held (same rule the
       listing used before: missingBoard is only computed when qualified). */
    if (held) {
      const missingBoard = getRequiredForeignBoardForJob(S, job.track, job.reqDegrees || []);
      rows.push({
        label: 'Licence / board',
        met: !missingBoard,
        reason: missingBoard ? `Needs ${missingBoard.label}` : 'Licence held (or none needed here)'
      });
    }
  } else {
    rows.push({ label: 'Degree', met: true, reason: 'No degree needed for this job' });
  }
  const trackExp = S.career.trackExperience[job.track] || 0;
  rows.push({
    label: 'Experience on this track',
    met: trackExp >= (job.minExp || 0),
    reason: `Needs ${job.minExp || 0} years on this track — you have ${trackExp}`
  });
  rows.push({
    label: 'Age 18+',
    met: S.player.age >= 18,
    reason: S.player.age >= 18 ? `You are ${S.player.age}` : `You are ${S.player} — full-time work opens at 18`
  });
  const workAuth = canLegallyWorkInCurrentCountry(S);
  rows.push({
    label: 'Right to work here',
    met: !!workAuth.allowed,
    reason: !workAuth.allowed
      ? workAuth.reason
      : workAuth.partTimeOnly
        ? 'Student visa — part-time only, at 45% of the listed pay'
        : 'You may work here'
  });
  if (S.education.university && job.reqDegrees && job.reqDegrees.length > 0) {
    rows.push({ label: 'Finished university', met: false, reason: 'Finish university before taking a degree-track post' });
  }
  if (S.legal.military.status === 'active_duty') {
    rows.push({ label: 'Military service', met: false, reason: 'Finish active military service first' });
  }
  return rows;
}

export function jobEligibility(S, job) {
  const rows = describeJobRequirements(S, job);
  const blocked = rows.filter(r => !r.met);
  return { eligible: blocked.length === 0, rows, blockedBy: blocked.map(r => r.reason) };
}

/* Plain-words duty lines for tracks whose rung carries no description of its
   own (the core 10 tracks and the modern tracks have titles but no desc;
   the V1 tracks keep their own rung desc). Generic by industry, never a
   made-up company or job title. */
const INDUSTRY_DUTY_LINES = {
  medicine: 'Treating patients, keeping records, and covering on-call shifts.',
  nursing: 'Patient care on the ward, medication rounds, and handover notes.',
  healthcare: 'Patient care, clinical records, and shift handovers.',
  aviation: 'Flying rostered sectors, pre-flight checks, and crew briefings.',
  banking: 'Client accounts, lending files, and end-of-day reconciliation.',
  finance: 'Accounts, reports, and month-end close.',
  tech: 'Building, testing, and shipping software with the team.',
  software: 'Building, testing, and shipping software with the team.',
  education: 'Lessons, marking, and parents’ meetings.',
  teaching: 'Lessons, marking, and parents’ meetings.',
  engineering: 'Drawings, site visits, and calculations that have to be right.',
  law: 'Files, hearings, and client advice.',
  consulting: 'Client work, decks, and deadlines.',
  retail: 'Serving customers, stocking shelves, and the till.',
  hospitality: 'Guests, service, and long shifts on your feet.',
  security: 'Patrols, gate checks, and incident reports.',
  media: 'Stories, deadlines, and edits.',
  business: 'Reports, meetings, and hitting the month’s numbers.'
};

function jobShiftLabel(industry) {
  const ind = String(industry || '');
  if (/medic|nurs|health/.test(ind)) return 'Shift work, including nights and weekends';
  if (/aviation|pilot|airline/.test(ind)) return 'Rostered shifts, including nights and early starts';
  if (/security|hospitality|retail|food/.test(ind)) return 'Shift work, including weekends';
  return 'Weekdays, daytime hours';
}

/* Everything a listing shows beyond title and pay — computed from the real
   systems, never invented: the rung's own description (or the industry line;
   when neither exists the listing says nothing rather than boilerplate),
   the ladder with the next rung and its pay, the contract (with the real
   probation months), the real weekly hours for the country, the shift, the
   location, the pension (its amounts vary per job, so it stays per
   listing), and the gross → net breakdown through W1's computePayslip —
   the same function the job card reads, so the market and the card can
   never disagree. What is the same for every job in the country — medical
   cover, sick leave, the standard annual-leave days — is NOT repeated on
   every listing; it is printed once above the market (see the market
   header in views.js). Only annual leave above the country's standard
   (earned by years on the track) prints per listing, as leaveAboveStandard.
   One remaining gap, stated not hidden: no per-offer contract-type data
   exists, so every offer is the standard permanent full-time offer; only
   the probation months vary by country. */
export function describeJobOffer(S, job) {
  const tracks = getMergedCareerTracks(S.year);
  const track = tracks[job.track] || {};
  const rungs = track.rungs || [];
  const rung = rungs.find(r => r.level === job.level) || rungs[0] || {};
  const trackExp = S.career.trackExperience[job.track] || 0;
  const nextRung = rungs.find(r => r.minExp > trackExp) || null;
  const cObj = getCountry(S.country);
  const baseAnnual = eraSalary(cObj.annualSalaryTiers2026.entry, S.country, S.year);
  const licBoost = matchingLicensePayBoost(S,track.reqDegrees||[]);
  const pgList = S.postgrad?.completed || [];
  const pgBoost = pgList.some(p => p.tier === 'fellowship_phd') ? 1.42 : pgList.length > 0 ? 1.26 : 1.0;
  const nextGross = nextRung ? Math.round((baseAnnual / 12) * payShape(S.country, job.track, track.payMult || 1, nextRung.mult) * licBoost * pgBoost) : null;
  const isCit = S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident';
  /* W1's payslip (landed after this round started): the market reads the
     same function as the job card — one source of truth, not two. */
  const slip = computePayslip(job.monthlyGross, S.country, S.year, isCit);
  const pay = { gross: slip.gross, incomeTax: slip.incomeTax, socialSecurity: slip.socialSecurity, net: slip.net };
  const contract = contractRuleFor(S.country);
  const vacDays = vacationEntitlementDays(S.country, trackExp);
  const baseDays = vacationEntitlementDays(S.country, 0);
  return {
    involves: rung.desc || INDUSTRY_DUTY_LINES[track.industry] || '',
    rung,
    nextRung,
    nextGross,
    trackExp,
    contract: `Permanent, full-time — ${contract.probationMonths} months' probation`,
    hoursPerWeek: contract.weeklyHours,
    shift: jobShiftLabel(track.industry),
    location: `${S.city}, ${cObj.name}`,
    /* v2.18 purge — only the pension stays per listing (its amounts
       vary with the salary). Medical cover, sick leave and the
       standard annual-leave days are the same for every job in the
       country and print once above the market. */
    benefits: [
      S.country==='usa'?'401(k) optional · Social Security separate':`Pension contribution: ${formatMoney(slip.pensionContribution,S.country)}/mo${slip.employerPension>0?` · Employer ${formatMoney(slip.employerPension,S.country)}/mo`:''}`
    ],
    /* Only when this track's experience earns more leave than the
       country's standard — the standard itself is in the market
       header, so a listing that matches it says nothing. */
    leaveAboveStandard: vacDays > baseDays
      ? `Paid annual leave: ${vacDays} days a year — above the ${baseDays}-day standard here, because you have ${trackExp} yrs on this track.`
      : null,
    pay
  };
}


/* 1 when the job needs a degree the player holds, else 0. */
function recruitFit(S, job) {
  const req = job.reqDegrees || [];
  return req.length > 0 && req.some(d => (S.education?.degrees || []).includes(d)) ? 1 : 0;
}

export function presentGraduateOrJobSearchOffers(S, customTitle = null, snapshot=null) {
  const eligible = snapshot?.offers || listAvailableJobs(S)
    .filter(j => j.qualifiedByDegree && !j.missingBoard && checkJobApplication(S,j).ok)
    /* A recruiter leads with the roles your own degree opens, then the open-entry roles, each by pay. Pay alone put a pilot cadetship above a medical or law graduate's own field. */
    .sort((a, b) => (recruitFit(S, b) - recruitFit(S, a)) || (b.monthlyGross - a.monthlyGross));
  /* A wealthy family's graduate is not offered the bottom of the market: roles that pay under 60% of the best offer, and no 'also-ran' third pick, are dropped. Only the offer list is shaped here; an existing job is never touched. */
  const richTier = !snapshot && (S.familyTier === 'wealthy' || S.familyTier === 'very_wealthy');
  if (richTier && eligible.length > 1) {
    const best = eligible[0].monthlyGross;
    for (let i = eligible.length - 1; i > 0; i--) if (eligible[i].monthlyGross < best * 0.6 && recruitFit(S, eligible[i]) === 0) eligible.splice(i, 1);
  }
  if (!eligible.length) return;

  const topOffer = eligible[0];
  const altOffer = snapshot ? eligible[1] : eligible[richTier ? Math.min(1, eligible.length - 1) : Math.min(2, eligible.length - 1)];
  const quotedOffer = (st, offer, auth) => ({
    gross: auth.partTimeOnly ? Math.round(offer.monthlyGross * 0.45) : offer.monthlyGross,
    title: auth.partTimeOnly ? `Part-Time ${offer.title}` : offer.title
  });
  const makeChoice = (offer, steady = false) => {
    const quote = quotedOffer(S, offer, checkJobApplication(S, offer).workAuth);
    return {
      label: `${steady ? 'Take steady role:' : 'Accept'} ${quote.title} at ${offer.employer} (${formatMoney(quote.gross, S.country)}/mo gross${steady ? ', lower pressure' : ''})`,
      effect: (st) => {
        const gate = checkJobApplication(st, offer);
        if (!gate.ok) {
          recordJournal(st, `Job offer no longer available: ${gate.msg}`, 'career');
          return;
        }
        const currentQuote = quotedOffer(st, offer, gate.workAuth);
        hireIntoJob(st, offer, gate.workAuth, { exactGross: currentQuote.gross });
        st.career.job.performance = steady ? 74 : 72;
        st.career.job.workMode = steady ? 'coast' : 'normal';
      }
    };
  };
  const choices = [makeChoice(topOffer)];
  if (altOffer && altOffer.id !== topOffer.id) choices.push(makeChoice(altOffer, true));

  choices.push({
    label: 'Hold out and browse other tracks, visas, or enterprises manually',
    effect: (st) => {
      recordJournal(st, `Turned down initial recruitment offers to chart your own career move.`, 'career');
    }
  });

  /* v2.18 MERGE DEFECT 1 — the job-offers scene fired twice in one
     calendar year: a player made redundant, hired, and made redundant
     again within months hits the 8-unemployed-months trigger twice in
     the same year (life 22, Egypt 2023: Feb and Nov), and the coherence
     suite counts the repeated title as a defect. A recruiter does not
     come back with the same "new openings" list twice in one year.
     The default-title call (job-search, not graduation) fires at most
     once per calendar year; the next trigger waits for the new year. */
  if (!customTitle&&!snapshot) {
    if ((Number(S.career._lastJobOffersYear) || 0) === S.year) return;
    S.career._lastJobOffersYear = S.year;
  }

  const offerScene={
    jobOfferSnapshot:snapshot||{offers:[topOffer,...(altOffer&&altOffer.id!==topOffer.id?[altOffer]:[])],country:S.country,year:S.year},
    key: `job_offers_${S.year}_${S.month}`,
    baseId: `job_offers_${Math.floor(S.player.age / 4)}`,
    maxPerLife: 2,
    category: 'career',
    title: customTitle || `Headhunter & Network Job Leads`,
    text: `Recruiters and industry contacts in your city come back with concrete openings matching your background.`,
    choices
  };
  if(snapshot)return offerScene;
  queueScene(S,offerScene);
}

export function restoreRecruitmentScene(S,saved){
 if(!String(saved?.key||'').startsWith('job_offers_')||!saved.jobOfferSnapshot||saved.jobOfferSnapshot.country!==S.country)return null;
 const current=presentGraduateOrJobSearchOffers(S,saved.title,saved.jobOfferSnapshot);return current?{...saved,choices:current.choices}:null;
}

export function tickCareerMonthly(S) {
  if (S.player.age < 18) return;

  if (!S.career.employed || !S.career.job) {
    if (!S.education.university && S.legal.military.status !== 'active_duty' && !S.career.business && !S.career.retired) {
      S.career.unemployedMonths += 1;
      if (S.career.unemployedMonths === 8 || (S.career.unemployedMonths > 8 && S.career.unemployedMonths % 36 === 0)) {
        presentGraduateOrJobSearchOffers(S);
      }
    }
    return;
  }

  const job = S.career.job;
  job.monthsInRole += 1;

  /* v2.8 — the contract (leave balance, performance parts) is kept current
     every month from the one getJobContract record: it resets the leave year
     when the year turns and backfills old saves. */
  getJobContract(S);
  syncEmployerBenefits(S);

  if (job.workMode === 'overtime') {
    job.performance = clamp(job.performance + 1.5, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 3);
    job.performanceParts.quality = clamp(job.performanceParts.quality + 1.5, 0, 100);
    job.performanceParts.attendance = clamp(job.performanceParts.attendance + 0.5, 0, 100);
    job.performanceParts.managerView = clamp(job.performanceParts.managerView + 1, 0, 100);
  } else if (job.workMode === 'coast') {
    job.performance = clamp(job.performance - 1.2, 0, 100);
    S.player.vitals.stress = clamp(S.player.vitals.stress - 2);
    job.performanceParts.quality = clamp(job.performanceParts.quality - 1.2, 0, 100);
    job.performanceParts.managerView = clamp(job.performanceParts.managerView - 0.5, 0, 100);
  } else {
    job.performance = clamp(job.performance + 0.4, 0, 100);
    job.performanceParts.quality = clamp(job.performanceParts.quality + 0.4, 0, 100);
  }

  /* Annual experience & promotion review every 12 months in role */
  if (job.monthsInRole % 12 === 0) {
    S.career.yearsExperience = (S.career.yearsExperience || 0) + 1;
    S.career.trackExperience[job.track] = (S.career.trackExperience[job.track] || 0) + 1;

    const mergedTracks = getMergedCareerTracks(S.year);
    const track = mergedTracks[job.track] || CAREER_TRACKS[job.track];
    const nextRung = track?.rungs[job.level + 1];
    const trackExp = S.career.trackExperience[job.track];

    /* Automatic Promotion when performance & tenure meet bar.
       v2.15 W2 — a mentor's word counts at review time (+6 effective
       performance); a rival ahead of you takes the one seat instead.
       v2.18 W2 — a frozen job is not promoted this year either: pay
       is frozen, so the gross does not rise however well you do. The
       promotion is re-judged at the next yearly review, once the
       freeze lifts; the merit branch below journals the freeze. */
    const payFrozen = (Number(job.payFrozenUntilYear) || 0) >= S.year;
    const mentorBoost = S.career.market?.mentor ? 6 : 0;
    const rivalRec = S.career.market?.rival;
    const rivalBlocks = !!rivalRec && (rivalRec.performance ?? 0) > job.performance;
    const check=job.actionState?.licence||{};
    const overdue=(check.medicalDueYear!=null&&check.medicalDueYear<S.year)||(check.simDueYear!=null&&check.simDueYear<S.year)||PROFESSIONAL_LICENSES.some(l=>(track?.reqDegrees||[]).includes(l.reqDegree)&&(S.credentials.licenses||[]).includes(l.id)&&(S.credentials.licenceRenewals?.[l.id]?.validUntilYear??Infinity)<S.year);
    const wouldPromote = nextRung && trackExp >= nextRung.minExp && job.performance + mentorBoost >= 72 && !payFrozen && !overdue;
    if(overdue&&nextRung&&trackExp>=nextRung.minExp){const as=job.actionState||(job.actionState={});const fresh=as.promoPauseSeenYear==null||as.promoPauseSeenYear<S.year-1;as.promoPauseSeenYear=S.year;if(fresh)as.promoPauseSinceYear=S.year;if(fresh||S.year-(as.promoPauseNotedYear??-1e9)>=1){as.promoPauseNotedYear=S.year;const held=S.year-(as.promoPauseSinceYear??S.year);recordJournal(S,held>=1?`Promotion still on hold: your licence check has been overdue for ${held} year${held===1?'':'s'} and you have met the bar for the next rung. Nothing moves until you renew it under Train & Licences.`:'Promotion on hold: your licence check is overdue. Renew it under Train & Licences.','career');}}
    /* GAME DESIGN (not a real-world figure): the two senior rungs (level 3 and
       above) are not handed out by a tenure clock. Meeting the bar makes you
       eligible; the player applies under Career (the existing promotion
       interview: performance, boss respect, references, mentor, rival, and a
       chance the company has frozen that grade). Lower rungs stay automatic. */
    const needsApplication = !!nextRung && nextRung.level >= SENIOR_RUNG_LEVEL;
    if (wouldPromote && !rivalBlocks && needsApplication) {
      /* The prompt must match what the Apply button will accept, so it asks the
         one promotion eligibility rule (careerActions registers it; that module
         imports this one, so it cannot be imported here). When Apply would
         refuse, the reason is journalled instead of promising a promotion. */
      const elig = _promotionEligibility ? _promotionEligibility(S) : null;
      if (elig && !elig.eligible) {
        recordJournal(S, `You meet the experience and performance bar for ${nextRung.title} at ${job.employer}, but cannot apply yet: ${elig.missing.join('; ')}.`, 'career');
      } else if (elig) {
        if (job.barNotedLevel !== nextRung.level) { job.barNotedLevel = nextRung.level; recordJournal(S, `You now meet the bar for ${nextRung.title} at ${job.employer}. This rung is not automatic: apply for it under Career, or look for the title at another employer.`, 'career'); }
        if (job.seniorPromptLevel !== nextRung.level) {
          job.seniorPromptLevel = nextRung.level;
          queueScene(S, {
            key: `senior_rung_ready_${job.track}_${nextRung.level}_${S.year}`, baseId: 'senior_rung_ready', category: 'career', urgent: true, maxPerLife: 99,
            title: `You Are Eligible for ${nextRung.title}`,
            text: `You meet the requirements for ${nextRung.title} at ${job.employer}. This step is not automatic: open the Career tab and choose Apply, which opens an interview with your manager. You can also look for the title at another employer.`,
            choices: [{ label: 'Understood', effect: () => {} }],
          }, true);
        }
      }
    }
    if (wouldPromote && !rivalBlocks && !needsApplication) {
      const ratio = payRatio(S.country, job.track, track.payMult, track.rungs[job.level]?.mult || 1, nextRung.mult);
      const promotionFrom={title:job.title,monthlyGross:job.monthlyGross};
      job.level = nextRung.level;
      job.title = jobEmploymentFraction(job) < 1 ? `Part-Time ${nextRung.title}` : nextRung.title;
      job.monthlyGross = Math.round(job.monthlyGross * ratio); job.payIndexYear=S.year;
      S.career.lastPromotion={at:S.year*12+S.month,year:S.year,month:S.month,employer:job.employer,track:job.track,level:job.level,title:job.title,previousTitle:promotionFrom.title,previousGross:promotionFrom.monthlyGross,monthlyGross:job.monthlyGross};
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 8);
      emitFact(S, 'INCOME_SURGE', { employer: job.employer, monthlyGross: job.monthlyGross });
      recordJournal(
        S,
        `Promoted to ${job.title} at ${job.employer}! Monthly pay rose to ${formatMoney(job.monthlyGross, S.country)}.`,
        'milestone'
      );
    } else {
      /* Inflation / merit adjustment — v2.18 W2: a frozen job's gross
         does not rise that year. The freeze is set on the job record
         (payFrozenUntilYear) when a crisis year is warned about, and
         the player is told on the payslip; the rise is skipped here,
         once, with a journal line — not silently. */
      const payFrozen = (Number(job.payFrozenUntilYear) || 0) >= S.year;
      if (payFrozen) {
        if (job.payFreezeNotedYear !== S.year) {
          job.payFreezeNotedYear = S.year;
          recordJournal(S, `No yearly rise this year — pay at ${job.employer} is frozen while the crisis lasts, so your ${formatMoney(job.monthlyGross, S.country)}/month stays exactly where it is.`, 'career');
        }
      } else {
        const previousGross = job.monthlyGross;
        const listed=listAvailableJobs(S).find(j=>j.track===job.track);
        const rung=(track?.rungs||[]).find(r=>r.level===job.level);
        const baseRung=(track?.rungs||[]).find(r=>r.level===listed?.level);
        const market=listed&&rung?Math.round(listed.monthlyGross*payRatio(S.country,job.track,track.payMult,baseRung?.mult||1,rung.mult)*jobEmploymentFraction(job)):previousGross;
        const headroom=job.performance>=65?1.25:1.10;
        const requested=Math.round(previousGross*(job.performance>=65?1.055:1.02));
        // No retrospective pay cut, but no endless above-market compounding.
        /* Pay does not fall behind the market line: the raise is at least the country's own wage-index growth since the last review (a frozen year is caught up when it thaws). In a low-inflation country that is below the usual merit step, so nothing changes there; where wages move 15-25% a year it stops pay sinking to a third of the market reference. Still capped by the merit ceiling below. A save without the field starts from last year, so nothing is paid retroactively. */
        const idxFrom=Number.isFinite(job.payIndexYear)?job.payIndexYear:S.year-1;
        const wageGrowth=Math.max(1,wageFactor(S.country,S.year)/Math.max(1e-9,wageFactor(S.country,idxFrom)));
        const indexed=Math.round(previousGross*wageGrowth);
        job.payIndexYear=S.year;
        job.monthlyGross=Math.max(previousGross,Math.min(Math.max(requested,indexed),Math.round(market*headroom)));
        /* The market reference and ceiling are explained once per job, not on all of a career's reviews. */
        const explain=job.payReviewExplained?'':` The game's market reference for this role is ${formatMoney(market,S.country)} a month; raises stop at ${Math.round(headroom*100)}% of it.`;
        job.payReviewExplained=true;
        const rose=job.monthlyGross>previousGross;
        recordJournal(S,rose?`Annual pay review at ${job.employer}: ${formatMoney(previousGross,S.country)} to ${formatMoney(job.monthlyGross,S.country)} a month gross, up ${Math.max(1,Math.round((job.monthlyGross/previousGross-1)*100))}%.${explain}`:`Annual pay review at ${job.employer}: no rise this year. At ${formatMoney(previousGross,S.country)} a month you already earn more than this role normally tops out at, so your pay is held, not cut.${explain}`,'career');
      }
      if (wouldPromote && rivalBlocks) {
        const rivalPerson = S.people[rivalRec.personId];
        recordJournal(
          S,
          `The ${nextRung.title} promotion went to ${rivalPerson ? rivalPerson.firstName : 'your rival'} this year — their performance is higher than yours. Outperform them and the next seat is yours.`,
          'career'
        );
      }
    }

    /* Check UAE Golden Visa automatic eligibility on high salary! */
    if (
      S.country === 'uae' &&
      S.year >= 2019 &&
      !S.legal.citizenships.includes('uae') &&
      S.legal.residency.kind !== 'golden_visa' &&
      job.monthlyGross >= 30000
    ) {
      transitionResidency(S, 'golden_visa', {
        permitName: '10-Year UAE Golden Visa (Self-Sponsored)',
        expiresYear: S.year + 10,
        force: true
      });
      recordJournal(S, `Crossing 30,000 AED/month qualified you for the self-sponsored 10-Year UAE Golden Visa — your residency no longer depends on an employer!`, 'visa');
    }
  }

  /* v2.18 W1 (§1) — real work inside the job: a new piece of work is
     assigned monthly, a missed deadline lands, and a skill never used
     falls a little. Only employed months reach here. */
  maybeAssignCareerWork(S);
}

export function requestRaiseOrPromotion(S) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'You are not currently employed.' };
  const job = S.career.job;
  const key = `raise_ask_${S.year}`;
  if (S.cooldowns[key] && S.turn < S.cooldowns[key]) {
    return { ok: false, msg: 'Wait at least a year between formal compensation reviews.' };
  }

  /* v2.18 W2 — a frozen job gets no raise, however strong the case:
     pay is frozen while the crisis lasts. Refused before the cooldown
     is spent, so the player can ask again once the freeze lifts. */
  if ((Number(job.payFrozenUntilYear) || 0) >= S.year) {
    return { ok: false, msg: `Pay is frozen while the crisis lasts — ${job.bossId && S.people[job.bossId] ? S.people[job.bossId].firstName : 'management'} cannot give a raise this year, however well you are doing.` };
  }
  S.cooldowns[key] = S.turn + 12;

  const boss = job.bossId ? S.people[job.bossId] : null;
  const bossRespect = boss ? boss.rel.respect : 60;
  const score = job.performance * 0.6 + bossRespect * 0.4;

  if (score >= 68) {
    const bumpPct = score >= 82 ? 0.16 : 0.10;
    job.monthlyGross = Math.round(job.monthlyGross * (1 + bumpPct));
    if (boss) boss.rel.respect = clamp(boss.rel.respect + 4);
    recordJournal(S, `Negotiated a ${Math.round(bumpPct * 100)}% raise with ${boss ? boss.firstName : 'management'} at ${job.employer} — now earning ${formatMoney(job.monthlyGross, S.country)}/mo.`, 'career');
    return { ok: true, msg: `Raise approved (+${Math.round(bumpPct * 100)}%)!` };
  } else {
    if (boss && boss.traits.pride > 70) boss.rel.resentment = clamp(boss.rel.resentment + 6);
    recordJournal(S, `${boss ? boss.fullName : 'Management'} turned down your raise request, citing performance and budget targets.`, 'career');
    return { ok: false, msg: 'Raise declined — raise performance or boss rapport first.' };
  }
}

export function resignCurrentJob(S) {
  if (!S.career.employed || !S.career.job) return { ok: false, msg: 'No active job.' };
  const oldEmp = S.career.job.employer;

  // Settle this actual role's modeled accrual once; no imported statutory promise.
  let gratuityNote = '';
  const eos = computeEndOfService(S);
  if (eos.eligible) {
    const rawGratuity = eos.amount;
    const yrsServed = eos.yrsServed;
    if (S.legal.residency.sponsorArchetype === 'strict' && chance(S, 0.5)) {
      const loss=recordCivilLoss(S,'unpaid_wages',rawGratuity,oldEmp);
      if(loss)loss.evidence={kind:'modeled end-service statement',jobId:S.career.job.id,monthsInRole:S.career.job.monthsInRole,monthlyGross:S.career.job.monthlyGross,model:eos.model};
      gratuityNote = ` Withheld ${formatMoney(rawGratuity,S.country)} under the game accrual rule. Dispute recorded under Lifestyle > Courts; no employer assets are identified, so paid review cannot recover cash yet.`;
    } else {
      walletMove(S, rawGratuity, `End-of-Service Gratuity (${yrsServed} yrs at ${oldEmp})`, 'money');
      gratuityNote = ` Collected ${formatMoney(rawGratuity, S.country)} under the game end-of-service rule.`;
    }
  }

  S.career.employed = false;
  S.career.job = null;
  syncEmployerBenefits(S);

  /* Sponsored Expat Realism: resigning puts you on a 60-day grace countdown unless Citizen / PR / Golden Visa! */
  if (['work_visa', 'gulf_iqama'].includes(S.legal.residency.kind) && !S.legal.citizenships.includes(S.country)) {
    transitionResidency(S, 'grace_period', {
      permitName: `60-Day Visa Grace Period (Ex-${oldEmp})`,
      graceMonthsLeft: 2,
      force: true
    });
    recordJournal(S, `Resigned from ${oldEmp}.${gratuityNote} Your sponsored residency entered a 60-day grace window — secure a new sponsor or return home before it expires.`, 'visa');
  } else {
    recordJournal(S, `Resigned from your position at ${oldEmp}.${gratuityNote}`, 'career');
  }
  return { ok: true, msg: `Left ${oldEmp}.${gratuityNote ? ' ' + gratuityNote.trim() : ''}` };
}

export function retireFromCareer(S) {
  if(S.career.retired)return {ok:false,msg:'You are already retired.'};
  if (S.player.age < 58) return { ok: false, msg: 'Standard retirement starts from age 58+.' };
  /* v2.8 — projectedPension is the one formula: the Benefits card shows
     this same number before you retire. */
  const proj = projectedPension(S);
  S.career.employed = false;
  S.career.job = null;
  S.career.retired = true;
  S.career.retirementCountry=S.country;
  S.career.monthlyPension = proj.monthly;
  S.career.statePensionMonthly=Math.max(0,proj.monthly-(S.career.market?.pension?.paidOut?.monthlyTopUp||0));
  S.career.pensionIndexedYear=S.year; // indexation starts the next January, never in the retirement year
  syncEmployerBenefits(S);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 25);
  recordJournal(
    S,
    S.career.monthlyPension > 0
      ? `Retired after ${S.career.yearsExperience} years of work with a monthly pension of ${formatMoney(S.career.monthlyPension, S.country)}.`
      : `Stepped back into retirement after ${S.career.yearsExperience} working years.`,
    'milestone'
  );
  return { ok: true, msg: 'Retired!' };
}

function isCitizenInCountry(S) {
  return S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident';
}

/* v2.11 W1 — the business core moved to businessEngine.js. These three
   keep their old export names (and old single-argument call shape: no
   bizId = the first business, the old mirror) so other callers do not
   break; they are thin wrappers now. */
export function launchSmallBusiness(S, typeId, customName = '', opts = {}) {
  /* v2.20 I1 — no resignJob is passed any more: a launch never
     resigns the job, silently or otherwise. createBusiness refuses
     a full-time self-run launch while employed, in plain words. */
  return createBusiness(S, typeId, customName, opts);
}

export function expandSmallBusiness(S, bizId) {
  return expandBusiness(S, bizId);
}

export function sellSmallBusiness(S, bizId) {
  return sellBusiness(S, bizId);
}

/* v2.11 W1 — switch a business between full-time and part-time.
   Going full-time while employed never resigns the job silently
   (v2.20 I1): the engine refuses in plain words, with the
   alternatives named. */
export function setBusinessMode(S, bizId, mode) {
  return setBusinessModeEngine(S, bizId, mode, {});
}

export function buildHealthcareGraduateScene(S,q){
 const valid=st=>st.country===q.country&&q.country==='egy'&&(st.education.degrees||[]).includes(q.majorId)&&!st.career.employed&&!st.career.job&&st.legal.military.status!=='active_duty';
 if(!valid(S))return null;const takleefPay=q.pay;const scene={
          key: `egy_takleef_${q.year}`,
          category: 'career',
          title: `Syndicate Registration & Ministry Takleef Assignment`,
          text: `You completed academic study at ${q.uniName}. This simplified game route now offers a Ministry role; real clinical internship and licensing requirements are not simulated. Proposed pay: (${formatMoney(takleefPay, 'egy')}/mo) alongside Syndicate (Niqaba) registration.`,
          choices: [
            {
              label: `Register at the Syndicate & accept Ministry Takleef (${formatMoney(takleefPay, 'egy')}/mo + clinical experience)`,
              effect: (st) => {
                ensureExtendedState(st);
                st.syndicate = { registered: true, name: `Egyptian ${q.majorId === 'medicine' ? 'Medical' : q.majorId === 'dentistry' ? 'Dental' : q.majorId === 'nursing'?'Nursing':'Pharmacists'} Syndicate`, joinedYear: st.year };
                st.career.employed = true;
                st.career.job = {
                  employer: 'Ministry of Health / Kasr Al-Ainy',
                  title: q.majorId === 'medicine' ? 'Resident Physician (Takleef)' : 'Clinical Specialist (Takleef)',
                  track: q.majorId === 'pharmacy' ? 'pharma' : q.majorId,
                  level: 0,
                  monthlyGross: takleefPay,
                  startYear: st.year,
                  monthsInRole: 0,
                  performance: 74,
                  workMode: 'normal',
                  bossId: null
                };
                getJobContract(st);
                syncEmployerBenefits(st);
                recordJournal(st, `Registered at ${st.syndicate.name} and reported for Ministry of Health Takleef clinical duty.`, 'career');
              }
            },
            {
              label: 'Register at the Syndicate only & waive Takleef to prepare for PLAB / USMLE / Gulf boards',
              effect: (st) => {
                ensureExtendedState(st);
                st.syndicate = { registered: true, name: `Egyptian ${q.majorId === 'medicine' ? 'Medical' : 'Healthcare'} Syndicate`, joinedYear: st.year };
                st.player.vitals.smarts = clamp(st.player.vitals.smarts + 3);
                recordJournal(st, `Recorded game Syndicate registration and declined the Ministry job. No foreign board or real practising licence was granted.`, 'career');
              }
            }
          ]
        };
 scene.healthcareGraduateSnapshot=q;
 scene.choices=scene.choices.map(c=>({...c,available:valid,effect:st=>{if(!valid(st))return;st.education.healthcareGraduateReplies??={};const key=q.majorId+'_'+q.year;if(st.education.healthcareGraduateReplies[key])return;c.effect(st);st.education.healthcareGraduateReplies[key]=true;}}));return scene;
}
export function restoreHealthcareGraduateScene(S,saved){return saved?.healthcareGraduateSnapshot?buildHealthcareGraduateScene(S,saved.healthcareGraduateSnapshot):null;}
