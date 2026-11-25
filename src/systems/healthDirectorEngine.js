import{registerEstateReview}from'./companyEstateReview.js';
import{estateChargePlan,remapInheritedCompany}from './companyEstate.js';
/* ============================================================================
   World Life 2.0 — Medical Care, Mortality, Legacy & Human Story Director
   Zero minor-billing leaks (D1/D11), real extreme-stat crises (D6), accurate
   medical history (D7), Continue-as-Child dynasty, and crisp human writing.
   ========================================================================== */

import { rand, randInt, pick, chance, clamp } from '../core/rng.js';
import { createNewLifeState, recordJournal, walletMove, queueScene, computeNetWorthLocal, newCoupleRecord, syncCoupleToLegacy } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraLocalCost, convertCurrency, goldPricePerGram } from '../data/economy.js';
import { MEDICAL_CONDITIONS, getHospitalsFor } from '../data/institutions.js';
import { V1_MED_TESTS, V1_MED_MEDICATIONS } from '../data/megaCareerEduMedical.js';
import { buyGold21k, buyBankCertificate } from './economyEngine.js';
import { staffTreatmentEligible } from './careerEducationEngine.js';
import { transferBusinessesOnDeath, deliverInheritedBusinesses, describeBusinessDeathOutcome, convertBusinessFiguresCurrency } from './businessLegacy.js';
import { rememberDeed } from './soulEngine.js';
import { collectExtendedLifeScenes } from './storyLibrary.js';
import { collectRandomLifeEvents, pickRandomLifeEvent } from './eventEngine.js';
import {
  agingYearlyDecline, rollMortality,
  assignStage, isSeriousCondition, treatmentCostLocal,
  treatmentSuccessProb, oddsInWords, runDiseaseTreatment,
  maybeProgressHypertension, progressUntreatedDiseases,
  dementiaOnsetProb, maybeQueueAgingSign, mortChance, mortPickWeighted,
  onsetWeight
} from './mortalityModel.js';

/* ============================================================================
   1. HEALTH, HOSPITALS, EXTREME-STAT CRISES & MORTALITY
   ========================================================================== */

export function visitHospitalCheckup(S, sector = 'public') {
  if(!['public','private'].includes(sector))return {ok:false,msg:'Care type unavailable.'};
  const period=S.year*12+S.month;
  if(S.medical.lastCheckupPeriod===period)return {ok:false,msg:'You already had a checkup this game month.'};
  const cObj = getCountry(S.country);
  const hospitals = getHospitalsFor(S.country, S.year);
  const hosp = hospitals.find(h => h.sector === sector) || hospitals[0];

  const isMinor = S.player.age < 18;
  const baseFee = eraLocalCost(cObj.healthcare.checkup2026, S.country, S.year);
  const cost = isMinor
    ? 0
    : (sector === 'public'
      ? Math.round(baseFee * (1 - cObj.healthcare.publicCoveragePct))
      : Math.round(baseFee * 1.65));

  if (!isMinor && S.money.cash < cost) {
    return { ok: false, msg: `Need ${formatMoney(cost, S.country)} for ${hosp.name}.` };
  }
  if (cost > 0) {
    walletMove(S, -cost, `Medical consultation at ${hosp.name}`, 'medical');
  }

  const heal = sector === 'private' ? 11 : 7;
  S.player.vitals.health = clamp(S.player.vitals.health + heal);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 5);

  /* A checkup is also the early-detection record: regular checkups find a
     serious disease at an earlier stage (mortalityModel.assignStage). */
  if (!S.medical) S.medical = {};
  S.medical.lastCheckupYear = S.year;
  S.medical.lastCheckupPeriod=period;
  S.medical.lastCheckupSector = sector;

  /* Manage or cure one active condition. Serious diseases are NEVER cured
     by a routine checkup — they need a real treatment course (Medical tab
     or the diagnosis scene). Only minor, non-chronic conditions can clear. */
  let curedLabel = null;
  if (S.medical.conditions.length > 0) {
    const cond = S.medical.conditions.find(c => !isSeriousCondition(c.id)) || null;
    if (cond && !cond.chronic && chance(S, sector === 'private' ? 0.85 : 0.62)) {
      curedLabel = cond.label;
      S.medical.conditions = S.medical.conditions.filter(c => c !== cond);
    }
  }

  recordJournal(
    S,
    curedLabel
      ? `Treated at ${hosp.name} — fully recovered from ${curedLabel}!`
      : `Visited ${hosp.name} for a checkup and treatment plan (+${heal} health).`,
    'health'
  );
  return { ok: true, msg: curedLabel ? `Cured ${curedLabel}!` : `Checkup completed at ${hosp.name}.` };
}

export function runDiagnosticTestOrMed(S, kind, id) {
  if(!['test','med'].includes(kind))return {ok:false,msg:'Medical action unavailable.'};
  const item=(kind==='test'?V1_MED_TESTS:V1_MED_MEDICATIONS).find(x=>x.id===id);
  if(!item)return {ok:false,msg:'Medical option unavailable.'};
  const period=S.year*12+S.month;
  const history=S.medical.servicePeriods||{};
  const key=`${kind}_${id}`;
  if(history[key]===period)return {ok:false,msg:'Already completed this game month.'};
  const matches=S.medical.conditions.filter(c=>(kind==='test'?item.detects:item.treats||[]).includes(c.id));
  if(kind==='med'&&!matches.length)return {ok:false,msg:'No matching active condition for this game prescription.'};
  const cost=S.player.age<18?0:Math.max(kind==='test'?8:5,Math.round(convertCurrency(((kind==='test'?item.costEGP:item.monthlyEGP)||450)/50,'usa',S.country,S.year)));
  if(S.money.cash<cost)return {ok:false,msg:`Need ${formatMoney(cost,S.country)} for ${item.label}.`};
  if(cost>0)walletMove(S,-cost,`${kind==='test'?'Diagnostic screening':'Prescription course'}: ${item.label}`,'medical');
  S.medical.servicePeriods={...history,[key]:period};
  if(kind==='test'){
    for(const c of matches)c.lastScreenedPeriod=period;
    recordJournal(S,`Completed ${item.label} screening. ${matches.length?'Matching recorded conditions reviewed.':'No matching recorded condition.'} Screening alone does not treat disease.`,'health');
  }else{
    for(const c of matches){c.managed=true;c.lastPrescriptionPeriod=period;}
    S.player.vitals.health=clamp(S.player.vitals.health+5);
    recordJournal(S,`Filled one game course of ${item.label} prescription for ${matches.map(c=>c.label||c.id).join(', ')}. No automatic refill.`,'health');
  }
  return {ok:true,msg:kind==='test'?'Screening recorded, no treatment effect.':'Prescription course filled for matching conditions.'};
}

export function tickHealthAndMortalityYearly(S) {
  const age = S.player.age;
  const cObj = getCountry(S.country);

  /* Aging: yearly health decline from 50, SLOWED by fitness (mortality
     model — a fit person loses health about half as fast as a sedentary
     one). Youth recovery unchanged. */
  agingYearlyDecline(S);

  /* Active medical condition progression — disease death risk now comes
     from the mortality model (stage + treatment status), not a flat rate. */
  for (const cond of S.medical.conditions) {
    const mult = cond.managed ? 0.35 : 1.0;
    S.player.vitals.health = clamp(S.player.vitals.health - Math.round(cond.annualHealthHit * mult));
    S.player.vitals.happiness = clamp(S.player.vitals.happiness - Math.round(cond.annualHappinessHit * mult));
  }
  /* Gradual disease progression: unmanaged hypertension slowly becomes
     heart disease over years; untreated cancers advance; dementia stages
     move on; a cancer in remission can come back. */
  maybeProgressHypertension(S);
  progressUntreatedDiseases(S);

  /* Dementia has its own age-based onset roll (research note §5 prevalence
     ladder) — it is NOT part of the general onset pool, whose flat 14%
     would make it far too common at 55. */
  if (age >= 65 && S.medical.conditions.length < 2
    && !S.medical.conditions.some(c => c.id === 'dementia')
    && mortChance(S, dementiaOnsetProb(age))) {
    S.medical.conditions.push({
      id: 'dementia', label: "Alzheimer's Disease", severity: 'severe', chronic: true,
      sinceYear: S.year, managed: false, treatmentStatus: 'untreated', stage: 'early',
      ageAtDiagnosis: age, annualHealthHit: 4, annualHappinessHit: 4, deathRiskPerYear: 0.10
    });
    recordJournal(S, `Doctors confirm early Alzheimer's disease after months of worsening forgetfulness. There is no cure — care can only slow it down.`, 'health');
  }

  /* Chance of new age- and gender-appropriate medical condition (Strict clinical logic!) */
  const CHILD_SAFE_IDS = new Set(['asthma', 'myopia', 'eczema', 'appendicitis', 'fracture', 'type1_diabetes']);
  const OLDER_ONSET_IDS = new Set([
    'heart_disease', 'heart_attack', 'stroke_recovery', 'copd', 'osteoporosis',
    'cataract', 'glaucoma', 'ckd', 'colon_cancer', 'lung_cancer', 'prostate_cancer'
  ]);
  const MID_ADULT_IDS = new Set([
    'hypertension', 'high_cholesterol', 'type2_diabetes', 'kidney_stones',
    'gallstones', 'ulcer', 'gerd', 'arthritis', 'hernia', 'breast_cancer', 'cervical_cancer'
  ]);

  const condProb = age < 16 ? 0.025 : age < 35 ? 0.045 : age < 55 ? 0.085 : 0.14;
  if (S.medical.conditions.length < 2 && mortChance(S, condProb)) {
    const pool = MEDICAL_CONDITIONS.filter(m => {
      if (S.medical.conditions.some(ex => ex.id === m.id)) return false;
      /* Dementia has its own age-based onset roll above, not this pool. */
      if (m.id === 'dementia') return false;
      /* Strict Biological Sex Gating */
      if ((m.category === 'fertility_f' || m.id === 'breast_cancer' || m.id === 'cervical_cancer') && S.player.gender !== 'f') return false;
      if (m.id === 'prostate_cancer' && S.player.gender !== 'm') return false;
      if (m.category === 'fertility_m' && S.player.gender !== 'm') return false;
      if ((m.category === 'fertility_f' || m.category === 'fertility_m') && (age < 20 || age > 48)) return false;

      /* Strict Age-of-Onset Clinical Gating */
      if (age < 16) return CHILD_SAFE_IDS.has(m.id);
      if (m.id === 'congenital_heart' && age > 5) return false;
      if (OLDER_ONSET_IDS.has(m.id) && age < 48) return false;
      if (MID_ADULT_IDS.has(m.id) && age < 28) return false;
      return true;
    });
    /* Weighted pick: rare deadly diseases (cancers) must not dominate new
       diagnoses the way a uniform pick over 49 conditions makes them do. */
    const picked = mortPickWeighted(S, pool, (m) => onsetWeight(m, age));
    if (picked) {
      const entry = {
        id: picked.id,
        label: picked.label,
        severity: picked.severity,
        chronic: picked.chronic,
        sinceYear: S.year,
        managed: false,
        treatmentStatus: 'untreated',
        ageAtDiagnosis: age,
        annualHealthHit: picked.annualHealthHit,
        annualHappinessHit: picked.annualHappinessHit,
        deathRiskPerYear: picked.deathRiskPerYear
      };
      /* Serious diseases are staged at diagnosis (cancers I-IV, weighted
         by recent checkups — regular checkups find it earlier). */
      assignStage(S, entry);
      S.medical.conditions.push(entry);

      /* Invariant D11: Minors NEVER receive adult cash/card/loan billing cards! Parents handle childhood care! */
      if (age < 18) {
        entry.managed = true;
        recordJournal(S, `Diagnosed with ${picked.label.toLowerCase()} — your parents took you to the clinic and are handling your care.`, 'health');
      } else {
        queueScene(S,buildDiagnosisScene(S,{conditionId:entry.id,sinceYear:entry.sinceYear,year:S.year,country:S.country}));
      }
    }
  }

  /* EXTREME-STAT CONSEQUENCES (Fixes D6 with 5-year cooldown so recovery NEVER spams annually!) */
  if (age >= 18 && (S.player.vitals.happiness <= 10 || S.player.vitals.stress >= 92)) {
    const onBurnoutCd = S.cooldowns['burnout_any'] && S.turn < S.cooldowns['burnout_any'];
    if (!onBurnoutCd) {
      S.cooldowns['burnout_any'] = S.turn + (S.pacing === 'monthly' ? 60 : 5);
      const burnoutStage = (S.sceneCounts?.['burnout_stage_1'] ? 1 : 0) + (S.sceneCounts?.['burnout_stage_2'] ? 1 : 0);
      const stageId = burnoutStage === 0 ? 'burnout_stage_1' : burnoutStage === 1 ? 'burnout_stage_2' : `burnout_decade_${Math.floor(age / 10)}`;
      const stageTitle = burnoutStage === 0
        ? 'Emotional Exhaustion & Burnout Point'
        : burnoutStage === 1
        ? 'Loved Ones Stage a Quiet Intervention'
        : 'Turning Point After Prolonged Strain';

      queueScene(S,buildBurnoutScene(S,{stageId,stageTitle}),true);
    } else if (S.player.vitals.happiness <= 5 || S.player.vitals.stress >= 95) {
      S.player.vitals.happiness = Math.max(28, S.player.vitals.happiness);
      S.player.vitals.stress = clamp(S.player.vitals.stress - 24);
    }
  }

  if (S.player.vitals.health <= 14 && !S.gameOver) {
    if (age < 18) {
      S.player.vitals.health = 55;
      recordJournal(S, `Emergency pediatric care brought you safely through a frightening health scare.`, 'health');
    } else {
      const admKey = `critical_admission_${S.year}`;
      const queued=queueScene(S,buildCriticalAdmissionScene(S,{key:admKey,year:S.year}),true);
      if (!queued) {
        S.player.vitals.health = 38;
      }
    }
  }

  /* Aging signs as lived events — stairs, gym nudge, memory, knees,
     eyesight, hearing — at most one new sign per year, cooldown-guarded. */
  maybeQueueAgingSign(S, queueScene);

  /* Cause-based mortality (mortality model): SSA life-table baseline by
     country/sex/fitness + disease-specific annual risk by stage and
     treatment status + a small accident baseline. Every death records a
     SPECIFIC cause — never a bare random roll, never the generic
     "following health complications". Mental conditions carry ~0 direct
     death risk, so stress/depression alone can no longer kill at 51. */
  const death = rollMortality(S);
  if (death) {
    triggerPlayerDeath(S, death.cause);
  }
}

export function triggerPlayerDeath(S, causeText = 'peacefully of natural causes') {
  S.gameOver = true;
  S.activeScene = null;
  S.sceneQueue = [];
  S.player.alive = false;
  S.player.deathYear = S.year;
  S.player.deathCause = causeText;
  recordJournal(
    S,
    `${S.player.fullName} passed away ${causeText} in ${S.city}, ${getCountry(S.country).name} at age ${S.player.age} (${S.player.birthYear}–${S.year}).`,
    'milestone'
  );
  /* v2.11 W4 — a business never silently vanishes on death: the journal
     says now what will happen to each one (named heir, or sold to the
     estate). The transfer/sale itself happens in continueAsChild. */
  for (const outcome of describeBusinessDeathOutcome(S)) {
    recordJournal(S, outcome.text, 'milestone');
  }
}

/* v2.9 — the Legacy Score, callable DURING life (not only at death).
   Same formula as the death summary's score, factored out so the Timeline
   can show it live. buildLegacySummary below calls this — the death
   summary path itself is unchanged. */
export function computeLiveLegacyScore(S) {
  const completedGoals = S.goals.filter(g => g.done).length;
  const closeBonds = Object.values(S.people).filter(p => p && p.id !== 'player' && p.rel?.affection >= 75).length;
  return Math.min(
    100,
    Math.round(
      completedGoals * 12 +
      Math.min(25, closeBonds * 5) +
      Math.min(20, Math.floor(S.player.age / 4)) +
      (S.education.degrees.length ? 10 : 4) +
      Math.round(((S.willPlan?.charityPct || 0) >= 10) ? 8 : 0)
    )
  );
}

/* v2.10 — why the Legacy Score stands where it does. The formula itself is
   unchanged; this only names each part of it in plain words, with its
   points, biggest first. A part worth 0 is shown as still open, not hidden,
   so the player can see what would move the score. */
export function legacyScoreReasons(S) {
  const completedGoals = (S.goals || []).filter(g => g.done).length;
  const closeBonds = Object.values(S.people || {}).filter(p => p && p.id !== 'player' && p.rel?.affection >= 75).length;
  const agePts = Math.min(20, Math.floor((S.player?.age || 0) / 4));
  const degreePts = (S.education?.degrees || []).length ? 10 : 4;
  const charityPts = ((S.willPlan?.charityPct || 0) >= 10) ? 8 : 0;
  const reasons = [
    { text: `${completedGoals} of ${(S.goals || []).length} life goals finished`, points: completedGoals * 12, open: completedGoals < (S.goals || []).length },
    { text: `${closeBonds} close ${closeBonds === 1 ? 'bond' : 'bonds'} (people who trust you deeply)`, points: Math.min(25, closeBonds * 5), open: closeBonds < 5 },
    { text: `${S.player?.age || 0} years lived`, points: agePts, open: agePts < 20 },
    { text: (S.education?.degrees || []).length ? 'A degree earned' : 'No degree yet — some schooling done', points: degreePts, open: !(S.education?.degrees || []).length },
    { text: charityPts ? 'Giving 10% or more to charity in your will' : 'No charitable gift in your will yet', points: charityPts, open: !charityPts }
  ];
  reasons.sort((a, b) => b.points - a.points);
  return reasons;
}

export function buildLegacySummary(S) {
  const netWorth = computeNetWorthLocal(S);
  const livingKids = S.relations.childIds.map(id => S.people[id]).filter(c => c && c.alive);
  const completedGoals = S.goals.filter(g => g.done).length;

  const score = computeLiveLegacyScore(S);

  return {
    fullName: S.player.fullName,
    lifespan: `${S.player.birthYear} – ${S.year} (Age ${S.player.age})`,
    cause: S.player.deathCause || 'natural causes',
    finalCountry: getCountry(S.country).name,
    citizenships: S.legal.citizenships.map(c => getCountry(c).name),
    netWorthFormatted: formatMoney(netWorth, S.country),
    netWorthRaw: netWorth,
    completedGoals,
    totalGoals: S.goals.length,
    livingChildren: livingKids,
    generation: S.generation || 1,
    score
  };
}

/* Generational Dynasty Handoff — Continue Playing as Any Living Child! */
export function continueAsChild(S, childId) {
  const child = S.people[childId];
  if (!S.gameOver || S.player.alive!==false || !S.relations.childIds.includes(childId) || !child || !child.alive || S.legacyContinued) return null;

  /* v2.11 W4 — businesses are settled FIRST, before the estate is valued:
     a business with no living heir is sold at its real valuation and the
     proceeds land in the estate cash below; a business with a living
     named heir is taken out of this life and held in bizDeath.inherited
     for delivery into the continuing child's life further down. */
  S.legacyContinued=true;
  const bizDeath = transferBusinessesOnDeath(S, childId);

  const livingKids = S.relations.childIds.map(id => S.people[id]).filter(c => c && c.alive);
  const cashEstate=Math.max(0,computeNetWorthLocal(S));
  const estate=estateChargePlan(S,cashEstate,bizDeath.inherited);
  const grossEstate=estate.gross;
  let distributable=estate.cashPool;
  S.estateSettlement={year:S.year,country:S.country,gross:estate.gross,charity:estate.charity,tax:estate.tax,companies:estate.named.map(x=>({id:x.biz.id,name:x.biz.name,heirId:x.heir.id,heirName:x.heir.fullName||x.heir.firstName,equity:x.biz.equityOwned??100,value:x.value,charge:x.charge}))};

  /* Spouse statutory / Fara'id 1/8th share if surviving spouse exists */
  const hasSurvivingSpouse = (S.relations.spouseIds || []).some(id => S.people[id]?.alive);
  const kidsPool = Math.round(distributable * (hasSurvivingSpouse ? 0.875 : 1.0));

  let perChildCashShare = 0;
  const useFaraid = S.player.religion === 'muslim' && ['egy', 'sau', 'uae', 'tur', 'mys'].includes(S.country);
  if (useFaraid && livingKids.length > 0) {
    const totalUnits = livingKids.reduce((sum, k) => sum + (k.gender === 'm' ? 2 : 1), 0);
    const myUnits = child.gender === 'm' ? 2 : 1;
    perChildCashShare = Math.round((kidsPool * myUnits) / Math.max(1, totalUnits));
  } else {
    perChildCashShare = Math.round(kidsPool / Math.max(1, livingKids.length));
  }
  const netWorth = grossEstate;
  const childCashInDest = Math.round(convertCurrency(perChildCashShare, S.country, child.residenceCountry, S.year));

  const nextGenHistory = [
    ...(S.dynastyHistory || []),
    {
      generation: S.generation || 1,
      name: S.player.fullName,
      years: `${S.player.birthYear}–${S.year}`,
      country: getCountry(S.country).name,
      estate: formatMoney(netWorth, S.country)
    }
  ];

  const nextS = createNewLifeState({
    seed: S.rngState ^ (child.age * 7919),
    country: child.residenceCountry || S.country,
    city: child.city,
    birthYear: child.birthYear,
    gender: child.gender,
    firstName: child.firstName,
    familyName: child.familyName,
    familyTier: netWorth > eraLocalCost(getCountry(S.country).annualSalaryTiers2026.exec * 3, S.country, S.year) ? 'wealthy' : 'middle',
    ambition: S.ambition,
    generation: (S.generation || 1) + 1,
    dynastyHistory: nextGenHistory,
    inheritedCash: childCashInDest
  });

  nextS.year=S.year;nextS.month=S.month;
  // Continue the recorded household, not the constructor's random family.
  const ancestorId=`ancestor_${S.generation||1}_${S.player.birthYear}`;
  const remap=id=>id===childId?'player':id==='player'?ancestorId:id;
  const people={};
  for(const old of Object.values(S.people)){
    if(!old||old.id===childId)continue;
    const person=structuredClone(old);person.id=remap(old.id);
    person.role='acquaintance';person.relationLabel='Family acquaintance';
    if(person.rel){person.rel.promises=[];person.rel.currentWant=null;person.rel.driftState='none';}

    for(const key of ['parentIds','spouseIds'])if(Array.isArray(person[key]))person[key]=person[key].map(remap);
    if(person.spouseId)person.spouseId=remap(person.spouseId);
    people[person.id]=person;
  }
  nextS.seq=(Number(S.seq)||0)+(Number(nextS.seq)||0)+100;
  nextS.player.parentIds=(child.parentIds?.length?child.parentIds:['player',...((S.relations.spouseIds||[]).length===1?S.relations.spouseIds:[])]).map(remap);
  people.player=nextS.player;nextS.people=people;
  nextS.relations={fatherId:null,motherId:null,siblingIds:[],partnerId:null,spouseIds:[],exSpouseIds:[],widowedSpouseIds:[],childIds:[],friendIds:[],colleagueIds:[],bossId:null,inLawIds:[]};
  function kin(id,role,label){const p=people[id];if(p){p.role=role;p.relationLabel=label;}}
  for(const id of nextS.player.parentIds){const p=people[id];if(!p)continue;const key=p.gender==='f'?'motherId':'fatherId';nextS.relations[key]=id;kin(id,p.gender==='f'?'mother':'father',p.gender==='f'?'Mother':'Father');}
  for(const id of S.relations.childIds||[]){if(id===childId)continue;const key=remap(id),p=people[key];if(!p)continue;nextS.relations.siblingIds.push(key);kin(key,'sibling',p.gender==='f'?'Sister':'Brother');}
  for(const p of Object.values(people)){
    if(p.id==='player'||!(p.parentIds||[]).includes('player'))continue;
    nextS.relations.childIds.push(p.id);kin(p.id,'child',p.gender==='f'?'Daughter':'Son');
  }
  nextS.marriage.couples=[];nextS.marriage.contracts=[];
  for(const id of child.spouseIds||[]){const key=remap(id),p=people[key];if(!p)continue;kin(key,'spouse',p.gender==='f'?'Wife':'Husband');
    if(p.alive){const couple=newCoupleRecord(nextS,'player',key,{stage:'married',country:nextS.country});nextS.marriage.couples.push(couple);syncCoupleToLegacy(nextS,couple);}
    else nextS.relations.widowedSpouseIds.push(key);
  }
  nextS.player.spouseIds=[...nextS.relations.spouseIds];
  nextS.marriage.status=nextS.relations.spouseIds.length?'married':nextS.relations.widowedSpouseIds.length?'widowed':'single';
  nextS.journal=[];

  /* Fast-set child's current real age, citizenships & status */
  nextS.year = S.year;nextS.month=S.month;
  nextS.player.age = child.age;
  nextS.player.birthYear = child.birthYear;
  nextS.player.birthMonth = child.birthMonth || 1;
  nextS.player.nationality = child.nationality || child.citizenships?.[0] || nextS.country;
  nextS.homeCountry = nextS.player.nationality;
  nextS.money.savings = Math.max(0,Number(child.career?.savingsLocal)||0);
  if(child.estateDebtLocal>0)nextS.money.loans.push({id:`estate_prior_${child.id}`,label:'Prior inherited company estate note',balance:child.estateDebtLocal,monthlyPayment:Math.max(1,Math.ceil(child.estateDebtLocal/24)),annualRate:0,remainingMonths:24,country:nextS.country,purpose:'estate_charge'});
  nextS.player.vitals={...nextS.player.vitals,...child.vitals};
  nextS.player.traits={...child.traits};nextS.player.traitTags=[...(child.traitTags||[])];
  nextS.player.religion=child.religion||nextS.player.religion;
  if(child.appearance)nextS.player.appearance={...child.appearance};
  nextS.education.stage=child.age<6?'infancy':child.age<12?'primary':child.age<15?'middle':child.age<18?'high':'completed';
  nextS.legal.citizenships = [...new Set(child.citizenships?.length?child.citizenships:[child.nationality||S.country])];
  nextS.player.citizenships=[...nextS.legal.citizenships];
  nextS.legal.passports = nextS.legal.citizenships.map(cid => ({
    country: cid,
    issuedYear: S.year,
    expiresYear: S.year + (getCountry(cid).passportValidityYears || 10)
  }));

  if (child.age >= 18) {
    nextS.pacing = 'monthly';
    nextS.education.stage = 'completed';
    nextS.education.highSchoolScore = clamp(child.vitals.smarts, 65, 95);
    nextS.education.degrees=child.education?.degree?[child.education.degree]:[];
    nextS.money.parentalAllowanceActive = false;
    if(child.career?.job && child.career.monthlyIncomeLocal>0){
      nextS.career.employed=true;
      nextS.career.job={...child.career.job,bossId:null};
    }
  }

  /* v2.11 W4 — deliver the inherited businesses: one whose heir IS this
     child moves into their career.businesses with a journal line, so the
     heir actually runs it; any other heir is journalled so the child is
     told what happened; estate-sale businesses are journalled too. */
  for(const entry of estate.named)entry.namedGift=entry.biz.heirId===childId||S.willPlan?.primaryHeirId===childId;
  deliverInheritedBusinesses(nextS, bizDeath, childId, S.player.gender);
  for(const b of nextS.career.businesses||[])remapInheritedCompany(b,remap);
  for(const p of Object.values(nextS.people))for(const b of p.ownedBusinesses||[])remapInheritedCompany(b,remap);
  nextS.estateSettlement=structuredClone(S.estateSettlement);
  nextS.companyTrusts=structuredClone(S.companyTrusts||[]);for(const entry of estate.named)if(entry.trust){const t=structuredClone(entry.trust);t.estateDebt=Math.round(convertCurrency(entry.charge,S.country,t.currency,S.year));nextS.companyTrusts.push(t);}for(const t of nextS.companyTrusts){t.trusteeId=remap(t.trusteeId);for(const x of t.beneficiaries)x.personId=remap(x.personId);remapInheritedCompany(t.company,remap);}

  for(const kid of livingKids){if(kid.id===childId)continue;const owner=nextS.people[kid.id];if(!owner)continue;const units=useFaraid?(kid.gender==='m'?2:1):1,total=useFaraid?livingKids.reduce((n,k)=>n+(k.gender==='m'?2:1),0):livingKids.length,share=Math.round(kidsPool*units/Math.max(1,total));owner.career??={};owner.career.savingsLocal=(owner.career.savingsLocal||0)+convertCurrency(share,S.country,owner.residenceCountry||S.country,S.year);}
  const spouses=(S.relations.spouseIds||[]).map(id=>nextS.people[id]).filter(p=>p?.alive);for(const sp of spouses){sp.career??={};sp.career.savingsLocal=(sp.career.savingsLocal||0)+convertCurrency(Math.round((distributable-kidsPool)/spouses.length),S.country,sp.residenceCountry||S.country,S.year);}

  for(const entry of estate.named){
    if(entry.trust)continue;
    const charge=Math.round(convertCurrency(entry.charge,S.country,entry.heir.id===childId?nextS.country:entry.heir.residenceCountry||S.country,S.year));
    if(entry.heir.id===childId){registerEstateReview(nextS,entry.biz,entry,{country:S.country,tax:estate.tax,charity:estate.charity,explicit:entry.namedGift,claimantId:livingKids.find(p=>p.id!==childId&&(p.rel?.trust??50)<40)?.id||null});const paid=Math.min(nextS.money.cash,charge);if(paid)walletMove(nextS,-paid,'Inherited company estate charge','inheritance');const left=charge-paid;if(left>0)nextS.money.loans.push({id:`estate_${entry.biz.id}_${S.year}`,label:`Estate charge: ${entry.biz.name}`,balance:left,monthlyPayment:Math.max(1,Math.ceil(left/24)),annualRate:0,remainingMonths:24,country:nextS.country,purpose:'estate_charge',estateCompanyId:entry.biz.id});}
    else{const owner=nextS.people[entry.heir.id];if(owner){owner.career??={};const paid=Math.min(Math.max(0,owner.career.savingsLocal||0),charge);owner.career.savingsLocal=(owner.career.savingsLocal||0)-paid;owner.estateDebtLocal=(owner.estateDebtLocal||0)+charge-paid;}}
  }
  // A minor owns their inherited stake but cannot work it or draw operating profit.
  for(const b of nextS.career.businesses||[])if(child.age<18)b.estateTrust={untilAge:18,paused:true};
  // Existing NPC companies belong to the continuing child too, not to a discarded person record.
  for(const old of child.ownedBusinesses||[]){if(!(nextS.career.businesses||[]).some(b=>b.id===old.id)){const b=structuredClone(old);convertBusinessFiguresCurrency(nextS,b,nextS.country);b.heirId=null;remapInheritedCompany(b,remap);nextS.career.businesses.push(b);}}
  for(const b of nextS.career.businesses){const held=(b.familyCoOwners||[]).filter(c=>c.personId==='player').reduce((n,c)=>n+c.equityPercent,0);b.equityOwned=(b.equityOwned??100)+held;b.familyCoOwners=(b.familyCoOwners||[]).filter(c=>c.personId!=='player');b.staff=(b.staff||[]).filter(e=>e.personId!=='player');if(b.manager?.personId==='player')b.manager=null;if(child.age<18)b.estateTrust={untilAge:18,paused:true};}
  if(nextS.career.businesses.length)nextS.career.business=nextS.career.businesses[0];
  if(child.career?.businessEmployeeId&&nextS.career.businesses.some(b=>b.id===child.career.businessEmployeeId)){nextS.career.employed=false;nextS.career.job=null;}

  for(const biz of nextS.career.businesses||[])if(biz.heirId===childId||biz.heirId==='player')biz.heirId=null;

  recordJournal(
    nextS,
    `Generation ${nextS.generation} begins: Continuing the ${child.familyName} family legacy as ${child.fullName} (age ${child.age}) in ${nextS.city}, ${getCountry(nextS.country).name} with ${formatMoney(childCashInDest, nextS.country)} inherited.`,
    'milestone'
  );
  return nextS;
}

/* ============================================================================
   2. CURATED, HUMAN-AUTHORED SCENE DIRECTOR (ZERO AI SLOP, COOLDOWN GUARDED)
   ========================================================================== */

export function pickCuratedLifeScene(S, restoreBaseId=null) {
  if (!S || (S.activeScene&&!restoreBaseId)) return null;
  const age = S.player.age;
  const cObj = getCountry(S.country);
  const seen = S.sceneCounts || {};
  const candidates = [];
  let restoreBuilder=null;

  function addOnce(baseId, builder) {
    if(restoreBaseId&&baseId!==restoreBaseId)return;
    if (!restoreBaseId&&(seen[baseId] || 0) >= 1) return;
    const build=() => {
      const buildRng=S.rngState;
      const sc = builder();
      if (sc) {
        sc.baseId = baseId;
        sc.curatedBuildRngState=buildRng;
        sc.maxPerLife = 1;
      }
      return sc;
    };
    if(restoreBaseId)restoreBuilder=build;else candidates.push(build);
  }

  const friend = S.relations.friendIds.map(id => S.people[id]).find(p => p && p.alive);
  const dad = S.relations.fatherId ? S.people[S.relations.fatherId] : null;
  const mom = S.relations.motherId ? S.people[S.relations.motherId] : null;
  const sib = S.relations.siblingIds.map(id => S.people[id]).find(p => p && p.alive);
  const spouse = S.relations.spouseIds.map(id => S.people[id]).find(p => p && p.alive);
  const child = S.relations.childIds.map(id => S.people[id]).find(p => p && p.alive && p.age >= 6);

  /* ---- CHILDHOOD SCENES (Ages 7–17 — Zero adult money/debt leaks!) ---- */
  if (age >= 7 && age <= 17) {
    if (friend) {
      addOnce('ch_cheat', () => ({
        key: 'ch_cheat',
        category: 'career',
        speakerId: friend.id,
        title: 'Whispered Answers in the Exam Hall',
        text: `Halfway through a tough math paper at ${S.education.schoolName || 'school'}, ${friend.firstName} taps their shoe twice and gestures helplessly toward question four while the invigilator turns away.`,
        choices: [
          {
            label: `Angle your sheet slightly to help ${friend.firstName} (Risk getting caught)`,
            effect: (st) => {
              if (chance(st, 0.30)) {
                st.education.academicSkill = clamp(st.education.academicSkill - 4);
                rememberDeed(st, friend, 'supported_crisis', 'Took heat together in an exam.', { affection: 10, trust: 8 });
                recordJournal(st, `The invigilator caught you signaling ${friend.firstName} and docked your paper — though ${friend.firstName} never forgot your loyalty.`, 'career');
              } else {
                rememberDeed(st, friend, 'supported_crisis', 'Saved them on a brutal math paper.', { affection: 12, trust: 10 });
                recordJournal(st, `You quietly helped ${friend.firstName} scrape through question four without getting caught.`, 'relationship');
              }
            }
          },
          {
            label: 'Keep your eyes on your own paper and tutor them after class',
            effect: (st) => {
              st.education.academicSkill = clamp(st.education.academicSkill + 3);
              friend.rel.respect = clamp(friend.rel.respect + 5);
              recordJournal(st, `You stayed focused during the exam, then spent two hours walking ${friend.firstName} through the equations afterward.`, 'career');
            }
          }
        ]
      }));

      addOnce('ch_stand_up_bully', () => ({
        key: 'ch_stand_up_bully',
        category: 'relationship',
        speakerId: friend.id,
        title: 'Cornered Behind the School Courtyard',
        text: `Two older students corner ${friend.firstName} after the final bell, mocking their clothes and knocking their schoolbag onto the pavement.`,
        choices: [
          {
            label: `Step right in beside ${friend.firstName} and stand your ground`,
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health - 3);
              rememberDeed(st, friend, 'supported_crisis', 'Stood shoulder to shoulder against school bullies.', { affection: 18, trust: 16, respect: 15 });
              recordJournal(st, `You took a bruised lip standing up for ${friend.firstName}, forging a lifelong bond.`, 'relationship');
            }
          },
          {
            label: 'Fetch the duty teacher before fists fly',
            effect: (st) => {
              rememberDeed(st, friend, 'supported_crisis', 'Got help before a courtyard fight.', { affection: 7, trust: 8 });
              recordJournal(st, `You brought the duty teacher over in seconds, breaking up the confrontation cleanly.`, 'relationship');
            }
          }
        ]
      }));
    }

    if (dad && dad.alive) {
      addOnce('ch_holiday_gift', () => {
        const holidayWord = ['egy', 'sau', 'uae'].includes(S.country) ? 'Eid Eidiya' : 'holiday gift';
        const giftPocket = eraLocalCost(cObj.monthlyBasket2026.phoneInternet * 0.8, S.country, S.year);
        return {
          key: 'ch_holiday_gift',
          category: 'life',
          speakerId: dad.id,
          title: 'Crisp Notes on Holiday Morning',
          text: `After family breakfast, ${dad.firstName} presses crisp ${holidayWord} banknotes (${formatMoney(giftPocket, S.country)}) into your palm with a grin: "Spend it wisely — or don’t come crying by Friday!"`,
          choices: [
            {
              label: `Tuck ${formatMoney(giftPocket, S.country)} away into your savings tin`,
              effect: (st) => {
                walletMove(st, giftPocket, `Saved ${holidayWord} cash`, 'family');
                rememberDeed(st, dad, 'proud_moment', 'Showed discipline saving holiday money.', { respect: 6 });
                recordJournal(st, `You tucked your ${formatMoney(giftPocket, st.country)} ${holidayWord} straight into savings.`, 'money');
              }
            },
            {
              label: 'Spend it all with friends on games & street treats (+happiness)',
              effect: (st) => {
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 9);
                if (friend) friend.rel.affection = clamp(friend.rel.affection + 6);
                recordJournal(st, `You spent your entire ${holidayWord} in one glorious afternoon out with friends.`, 'life');
              }
            }
          ]
        };
      });
    }

    addOnce('ch_window', () => ({
      key: 'ch_window',
      category: 'life',
      title: 'Shattered Glass Downstairs',
      text: `Your afternoon street kickabout goes silent as the ball hooks hard and shatters the ground-floor neighbor’s balcony pane. Everyone scatters except you.`,
      choices: [
        {
          label: 'Ring the neighbor’s bell and own up to it honestly',
          effect: (st) => {
            if (dad && dad.alive) rememberDeed(st, dad, 'proud_moment', 'Owned up honestly to a broken window.', { trust: 10, respect: 8 });
            recordJournal(st, `You rang the bell and admitted breaking the window. You lost weekend privileges, but earned real respect at home.`, 'life');
          }
        },
        {
          label: 'Bolt around the corner with the other kids',
          effect: (st) => {
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
            recordJournal(st, `You sprinted two blocks with pounding lungs and avoided the neighbor’s wrath.`, 'life');
          }
        }
      ]
    }));

    if (age >= 13 && mom && mom.alive) {
      addOnce('ch_kitchen_talk', () => {
        const affluent = ['upper_middle', 'wealthy'].includes(S.familyTier);
        return {
          key: 'ch_kitchen_talk',
          category: 'family',
          speakerId: mom.id,
          title: 'Late-Night Tea in the Kitchen',
          text: affluent
            ? `Unable to sleep before midterms, you find ${mom.firstName} awake in the kitchen with a pot of mint tea. She sets a cup in front of you and asks whether you want to follow the family’s established path or carve out a name entirely your own.`
            : `Unable to sleep before midterms, you find ${mom.firstName} awake at the kitchen table sorting household receipts. She pours you mint tea and asks what kind of adult life you actually dream of.`,
          choices: [
            {
              label: affluent
                ? '"I’ll earn my own credentials from the ground up so nobody says I coasted on our family name"'
                : '"I want to build something lasting so this family never worries about money again"',
              effect: (st) => {
                st.player.vitals.smarts = clamp(st.player.vitals.smarts + 2);
                rememberDeed(st, mom, 'proud_moment', 'Shared mature ambition over late-night tea.', { affection: 10, respect: 8 });
                recordJournal(st, `Over midnight tea with ${mom.firstName}, you resolved to earn real respect through your own discipline.`, 'family');
              }
            },
            {
              label: '"I want to see the world beyond this city and live on my own terms"',
              effect: (st) => {
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
                rememberDeed(st, mom, 'visited', 'Shared honest dreams of seeing the world.', { affection: 8 });
                recordJournal(st, `${mom.firstName} smiled wistfully over tea as you talked about crossing borders one day.`, 'family');
              }
            }
          ]
        };
      });
    }
  }

  /* ---- UNIVERSITY SCENES (Strictly matched to Major & Year in Program!) ---- */
  if (S.education.university) {
    const u = S.education.university;
    const isClinical = ['medicine', 'dentistry', 'nursing', 'pharmacy', 'veterinary', 'physiotherapy'].includes(u.majorId);

    if (!isClinical && u.yearInProgram >= u.totalYears) {
      addOnce('uni_capstone', () => ({
        key: 'uni_capstone',
        category: 'career',
        title: 'Final-Year Graduation Project Defense',
        text: `Two teammates on your final-year ${u.majorLabel} graduation project at ${u.name} vanish the week before defense, leaving half the deliverables unfinished.`,
        choices: [
          {
            label: 'Pull three all-nighters, finish their modules & ace the jury defense (+smarts, +stress)',
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 12);
              recordJournal(st, `You carried the final-year graduation project on your back and earned distinction from the external jury.`, 'career');
            }
          },
          {
            label: 'Present your documented individual work cleanly so the panel grades each member fairly',
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + 3);
              recordJournal(st, `You presented your rigorous individual work to the faculty jury and graduated with strong marks.`, 'career');
            }
          }
        ]
      }));
    }

    if (isClinical && u.yearInProgram >= Math.max(3, u.totalYears - 2)) {
      addOnce('uni_clinical_imtiyaz', () => ({
        key: 'uni_clinical_imtiyaz',
        category: 'career',
        title: '3 A.M. Teaching Hospital Ward Rotation',
        text: `During an exhausting night rotation at ${u.name}’s teaching hospital, a patient’s vitals drop subtly before the senior resident notices.`,
        choices: [
          {
            label: 'Flag the chart findings immediately and assist the senior resident calmly (+smarts)',
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + 5);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              recordJournal(st, `Your sharp 3 a.m. bedside catch earned commendation from the attending consultant on rounds.`, 'career');
            }
          },
          {
            label: 'Stick strictly to student observation protocol and pace your energy',
            effect: (st) => {
              st.player.vitals.smarts = clamp(st.player.vitals.smarts + 2);
              recordJournal(st, `You logged your clinical rotation hours steadily without overstepping protocol.`, 'career');
            }
          }
        ]
      }));
    }
  }

  /* ---- ADULTHOOD SCENES (Ages 19+, each fires AT MOST ONCE per lifetime!) ---- */
  if (age >= 19) {
    if (S.career.employed && S.career.job) {
      const boss = S.career.job.bossId ? S.people[S.career.job.bossId] : null;
      if (boss && boss.alive) {
        addOnce('ad_boss_credit', () => ({
          key: 'ad_boss_credit',
          category: 'career',
          speakerId: boss.id,
          title: `Your Work, ${boss.firstName}’s Name on the Slide`,
          text: `In the quarterly review at ${S.career.job.employer}, ${boss.fullName} presents the turnaround plan you stayed late building — without mentioning your name once to senior leadership.`,
          choices: [
            {
              label: 'Answer the director’s Q&A effortlessly with details only the author knows',
              effect: (st) => {
                if (st.career.job) {
                  st.career.job.performance = clamp(st.career.job.performance + 12);
                  st.career.job.monthlyGross = Math.round(st.career.job.monthlyGross * 1.08);
                }
                boss.rel.respect = clamp(boss.rel.respect + 10);
                recordJournal(st, `You fielded senior leadership’s hardest questions on the spot, winning an immediate 8% merit bump.`, 'career');
              }
            },
            {
              label: `Let ${boss.firstName} shine publicly, then trade the favor privately`,
              effect: (st) => {
                rememberDeed(st, boss, 'supported_crisis', 'Protected their ego in front of leadership.', { trust: 15, affection: 10 });
                if (st.career.job) st.career.job.performance = clamp(st.career.job.performance + 7);
                recordJournal(st, `You protected ${boss.firstName}’s ego in the boardroom and earned strong political cover.`, 'career');
              }
            },
            {
              label: `Call ${boss.firstName} out sharply in the room`,
              effect: (st) => {
                boss.rel.resentment = clamp(boss.rel.resentment + 28);
                recordJournal(st, `You called out ${boss.firstName} in front of senior leadership. Nobody forgot the tension.`, 'career');
              }
            }
          ]
        }));
      }

      addOnce('ad_kickback', () => {
        const envelope = Math.round(S.career.job.monthlyGross * 2.2);
        return {
          key: 'ad_kickback',
          category: 'career',
          title: 'An Unmarked Envelope Over Coffee',
          text: `A supplier bidding on a contract at ${S.career.job.employer} slides an envelope (${formatMoney(envelope, S.country)}) across the café table: "Just make sure our bid lands on top."`,
          choices: [
            {
              label: 'Refuse firmly and score every bid strictly on merit',
              effect: (st) => {
                if (st.career.job) st.career.job.performance = clamp(st.career.job.performance + 8);
                st.player.vitals.stress = clamp(st.player.vitals.stress - 4);
                recordJournal(st, `You pushed the ${formatMoney(envelope, st.country)} bribe back across the table and kept your reputation spotless.`, 'career');
              }
            },
            {
              label: `Pocket ${formatMoney(envelope, S.country)} quietly (Audit & firing risk!)`,
              effect: (st) => {
                if (chance(st, 0.34)) {
                  const emp = st.career.job?.employer || 'your employer';
                  st.career.employed = false;
                  st.career.job = null;
                  st.legal.criminalRecord = true;
                  st.player.vitals.happiness = clamp(st.player.vitals.happiness - 20);
                  recordJournal(st, `Internal audit uncovered the vendor kickback at ${emp} — terminated for cause with a compliance record!`, 'career');
                } else {
                  walletMove(st, envelope, 'Undisclosed vendor commission', 'money');
                  st.player.vitals.stress = clamp(st.player.vitals.stress + 10);
                  recordJournal(st, `You pocketed ${formatMoney(envelope, st.country)} off the books, though every audit memo made your stomach drop.`, 'money');
                }
              }
            }
          ]
        };
      });

      addOnce('ad_headhunter_poach', () => {
        const curGross = S.career.job.monthlyGross;
        const rivalGross = Math.round(curGross * 1.24);
        return {
          key: 'ad_headhunter_poach',
          category: 'career',
          title: 'Quiet Rival Poaching Call',
          text: `A rival firm in ${S.city} quietly approaches you with a 24% jump (${formatMoney(rivalGross, S.country)}/mo), provided you move before next month’s product launch.`,
          choices: [
            {
              label: `Jump to the rival for ${formatMoney(rivalGross, S.country)}/mo`,
              available: () => !(S.country === 'sau' && S.legal.residency.sponsorArchetype === 'strict'),
              effect: (st) => {
                if (st.career.job) {
                  st.career.job.employer = `${st.city} Premier Group`;
                  st.career.job.monthlyGross = rivalGross;
                }
                recordJournal(st, `Accepted a poaching offer across ${st.city}, lifting your monthly salary to ${formatMoney(rivalGross, st.country)}.`, 'career');
              }
            },
            {
              label: 'Use the offer calmly to negotiate a counter-offer where you are',
              effect: (st) => {
                if (st.career.job) st.career.job.monthlyGross = Math.round(curGross * 1.14);
                recordJournal(st, `Leveraged a competing offer into an immediate 14% retention counter-offer.`, 'career');
              }
            }
          ]
        };
      });
    }

    const gPrice = goldPricePerGram(S.country, S.year, 21);
    const tenGramsCost = Math.round(gPrice * 10);
    if (S.money.cash >= tenGramsCost * 1.5) {
      addOnce('ad_gold_hedge', () => ({
        key: 'ad_gold_hedge',
        category: 'money',
        title: 'Everyone Is Talking About Prices & Gold',
        text: `Grocery bills and property prices keep climbing across ${S.city}. Over dinner, everyone argues whether leaving cash idle is foolish when 10g of 21K gold costs ${formatMoney(tenGramsCost, S.country)}.`,
        choices: [
          {
            label: `Buy 10g of physical 21K gold bullion (${formatMoney(tenGramsCost, S.country)})`,
            available: () => S.money.cash >= tenGramsCost,
            effect: (st) => { buyGold21k(st, 10); }
          },
          {
            label: `Lock ${formatMoney(tenGramsCost, S.country)} in a 1-Year Bank Certificate`,
            available: () => S.money.cash >= tenGramsCost,
            effect: (st) => { buyBankCertificate(st, tenGramsCost, 1); }
          },
          {
            label: 'Keep your cash liquid for upcoming moves',
            effect: (st) => {
              recordJournal(st, `You kept your cash liquid rather than locking it into gold or certificates.`, 'money');
            }
          }
        ]
      }));
    }

    if (S.housing.mode === 'rent' && S.housing.monthlyRent > 0) {
      addOnce('ad_landlord', () => {
        const curRent = S.housing.monthlyRent;
        const hiked = Math.round(curRent * 1.25);
        const midRent = Math.round(curRent * 1.08);
        return {
          key: 'ad_landlord',
          category: 'money',
          title: 'Landlord Demands a 25% Lease Jump',
          text: `Your landlord insists renewing ${S.housing.currentHomeName} will rise from ${formatMoney(curRent, S.country)} to ${formatMoney(hiked, S.country)}/month.`,
          choices: [
            {
              /* v2.19 W5 — the old label promised the +8% price as the
                 outcome ("Push back ... at +8% (X/mo)"), but the effect
                 only lands it 72% of the time — 28% of the time the
                 landlord holds at +25%. The label now says it is an ask,
                 not a price. */
              label: `Push back with neighborhood comps — ask for +8% (${formatMoney(midRent, S.country)}/mo), but the landlord may still hold at +25%`,
              effect: (st) => {
                st.housing.monthlyRent = chance(st, 0.72) ? midRent : hiked;
                recordJournal(st, `Negotiated firmly over your lease renewal — settled at ${formatMoney(st.housing.monthlyRent, st.country)}/month.`, 'money');
              }
            },
            {
              label: `Accept ${formatMoney(hiked, S.country)}/mo to avoid moving`,
              effect: (st) => {
                st.housing.monthlyRent = hiked;
                recordJournal(st, `Signed the higher lease at ${formatMoney(hiked, st.country)}/month.`, 'money');
              }
            }
          ]
        };
      });
    }

    /* Expat Life Scenes (Gulf & West!) */
    if (S.country !== S.homeCountry) {
      addOnce('ad_expat_ramadan_holiday', () => {
        const flightBack = Math.round(convertCurrency(620, 'usa', S.country, S.year));
        return {
          key: 'ad_expat_ramadan_holiday',
          category: 'family',
          title: 'The Empty Chair at the Holiday Table',
          text: `Your first major holiday season abroad in ${S.city} arrives. Photos from the family group chat in ${getCountry(S.homeCountry).name} show everyone crowded around the table without you.`,
          choices: [
            {
              label: `Book a surprise 5-day flight home (${formatMoney(flightBack, S.country)})`,
              available: () => S.money.cash >= flightBack && S.legal.military.travelPermitted,
              effect: (st) => {
                walletMove(st, -flightBack, `Holiday visit flight to ${getCountry(st.homeCountry).name}`, 'family');
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 14);
                if (mom && mom.alive) rememberDeed(st, mom, 'visited', 'Surprised the family for the holidays.', { affection: 14 });
                recordJournal(st, `You walked through the front door in ${getCountry(st.homeCountry).name} unannounced — your family erupted in cheers.`, 'relationship');
              }
            },
            {
              label: 'Host fellow expats in your apartment so nobody eats alone',
              effect: (st) => {
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
                recordJournal(st, `You cooked a full spread for fellow expats in ${st.city}, turning homesickness into warm camaraderie.`, 'relationship');
              }
            }
          ]
        };
      });
    }

    /* Married & In-Law Scenes */
    if (spouse) {
      addOnce('ad_inlaw_meddling', () => ({
        key: 'ad_inlaw_meddling',
        category: 'family',
        speakerId: spouse.id,
        title: 'Unsolicited Family Opinions',
        text: `After Friday lunch, relatives offer pointed opinions on how you and ${spouse.firstName} manage your household budget, furniture, and career priorities.`,
        choices: [
          {
            label: `Draw a polite, united boundary alongside ${spouse.firstName}`,
            effect: (st) => {
              rememberDeed(st, spouse, 'supported_crisis', 'Presented a united front with relatives.', { affection: 10, trust: 12, respect: 8 });
              recordJournal(st, `You and ${spouse.firstName} set a calm, respectful boundary — decisions inside your home belong to the two of you.`, 'relationship');
            }
          },
          {
            label: 'Laugh it off to keep extended family peace',
            effect: (st) => {
              spouse.rel.resentment = clamp(spouse.rel.resentment + 5);
              recordJournal(st, `You smiled through the relatives' unsolicited advice, though ${spouse.firstName} wished you had been firmer.`, 'relationship');
            }
          }
        ]
      }));
    }

    /* Parenthood Scene */
    if (child) {
      addOnce('ad_child_talent', () => {
        const clubFee = eraLocalCost(cObj.monthlyBasket2026.foodChild * 1.4, S.country, S.year);
        return {
          key: 'ad_child_talent',
          category: 'family',
          speakerId: child.id,
          title: `${child.firstName}’s Spark`,
          text: `Your ${child.relationLabel.toLowerCase()} ${child.firstName} (age ${child.age}) shows real talent at school — teachers suggest enrolling them in an advanced science & sports club (${formatMoney(clubFee, S.country)}).`,
          choices: [
            {
              label: `Enroll ${child.firstName} and show up at every weekend match (${formatMoney(clubFee, S.country)})`,
              available: () => S.money.cash >= clubFee,
              effect: (st) => {
                walletMove(st, -clubFee, `Youth club & enrichment for ${child.firstName}`, 'family');
                child.vitals.smarts = clamp(child.vitals.smarts + 8);
                rememberDeed(st, child, 'supported_crisis', 'Cheered from the sidelines and backed their talent.', { affection: 14, respect: 10 });
                recordJournal(st, `Backed ${child.firstName}’s talent and cheered from the stands — their confidence soared.`, 'family');
              }
            },
            {
              label: 'Practice with them in the neighborhood park after work for free',
              effect: (st) => {
                child.vitals.smarts = clamp(child.vitals.smarts + 4);
                rememberDeed(st, child, 'visited', 'Practiced together in the park after work.', { affection: 11 });
                recordJournal(st, `Spent evenings coaching ${child.firstName} yourself in the park.`, 'family');
              }
            }
          ]
        };
      });
    }

    /* Sibling / Friend Joint Investment Pitch */
    if (sib || friend) {
      const pitcher = sib || friend;
      const stake = eraLocalCost(cObj.monthlyBasket2026.rentStandard * 3, S.country, S.year);
      if (S.money.cash >= stake) {
        addOnce('ad_side_venture', () => ({
          key: 'ad_side_venture',
          category: 'money',
          speakerId: pitcher.id,
          title: `${pitcher.firstName}’s Side-Deal Proposal`,
          text: `${pitcher.fullName} pitches a fast-moving wholesale shipment deal requiring ${formatMoney(stake, S.country)} each: "Six months and we split a 45% margin."`,
          choices: [
            {
              label: `Put in ${formatMoney(stake, S.country)} with written terms`,
              available: () => S.money.cash >= stake,
              effect: (st) => {
                walletMove(st, -stake, `Joint shipment venture with ${pitcher.firstName}`, 'investment');
                const win = (pitcher.traits.reliability >= 55 && chance(st, 0.68)) || chance(st, 0.42);
                if (win) {
                  const payout = Math.round(stake * 1.44);
                  walletMove(st, payout, `Payout from venture with ${pitcher.firstName}`, 'investment');
                  rememberDeed(st, pitcher, 'proud_moment', 'Split a profitable shipment deal cleanly.', { trust: 12, respect: 10 });
                  recordJournal(st, `The shipment deal with ${pitcher.firstName} cleared customs smoothly, returning ${formatMoney(payout, st.country)}!`, 'money');
                } else {
                  const salvage = Math.round(stake * 0.55);
                  walletMove(st, salvage, `Partial salvage from delayed shipment`, 'investment');
                  recordJournal(st, `Customs delays ate into ${pitcher.firstName}’s shipment deal — you recovered ${formatMoney(salvage, st.country)} of your ${formatMoney(stake, st.country)}.`, 'money');
                }
              }
            },
            {
              label: 'Pass — never mix friendships/family with speculative deals',
              effect: (st) => {
                recordJournal(st, `You passed politely on ${pitcher.firstName}’s wholesale deal, keeping your capital safe.`, 'money');
              }
            }
          ]
        }));
      }
    }

    /* Off-Plan Compound Delivery Delay -> Legal Penalty or Finishing Credit Chain */
    const offPlanProp = (S.housing.properties || []).find(p => (p.monthsLeft || 0) >= 12);
    if (offPlanProp) {
      addOnce('ad_offplan_delay', () => {
        const compCredit = Math.max(500, Math.round((offPlanProp.valueLocal || 50000) * 0.04));
        return {
          key: 'ad_offplan_delay',
          category: 'money',
          title: `Developer Handover Delay Notice`,
          text: `The developer behind ${offPlanProp.name} sends an engineering notice pushing handover back 8 months due to imported material bottlenecks.`,
          choices: [
            {
              label: `Invoke contract penalty clause for ${formatMoney(compCredit, S.country)} cashback / finishing credit`,
              effect: (st) => {
                walletMove(st, compCredit, `Developer delay penalty rebate (${offPlanProp.name})`, 'housing');
                recordJournal(st, `Enforced the delay-penalty clause on ${offPlanProp.name}, collecting ${formatMoney(compCredit, st.country)}.`, 'money');
              }
            },
            {
              label: 'Accept a complimentary finishing-tier upgrade in exchange for waiving penalties',
              effect: (st) => {
                offPlanProp.finishing = 'super_lux';
                offPlanProp.nativeValue = Math.round((offPlanProp.nativeValue || 100000) * 1.09);
                offPlanProp.valueLocal = Math.round((offPlanProp.valueLocal || 100000) * 1.09);
                recordJournal(st, `Negotiated a complimentary Super-Lux finishing upgrade on ${offPlanProp.name} in lieu of handover delay penalties.`, 'money');
              }
            }
          ]
        };
      });
    }

    /* BNPL Installment Stack Warning Chain */
    if ((S.bnplPlans || []).length >= 3) {
      addOnce('ad_bnpl_stack', () => ({
        key: 'ad_bnpl_stack',
        category: 'money',
        title: 'Stacked Split-Payment Alerts',
        text: `Three separate Buy-Now-Pay-Later notifications buzz on your phone in the same morning. Small monthly splits have quietly snowballed into a serious drag on your paycheck.`,
        choices: [
          {
            label: 'Freeze new impulse splits until current plans clear (-stress)',
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress - 8);
              st.money.creditScore = clamp(st.money.creditScore + 10, 300, 850);
              recordJournal(st, `Put a strict freeze on new BNPL split purchases and regained control of your monthly cashflow.`, 'money');
            }
          },
          {
            label: 'Shrug it off — you only live once',
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 6);
              recordJournal(st, `Ignored the stacked installment alerts and kept swiping.`, 'money');
            }
          }
        ]
      }));
    }

    /* Midlife Perspective (Age 40+) */
    if (age >= 40) {
      addOnce('ad_midlife_perspective', () => ({
        key: 'ad_midlife_perspective',
        category: 'life',
        title: 'Forty Candles & Looking Back',
        text: `Turning ${age} brings an unexpectedly quiet evening. Looking back over the years, you weigh what deserves the best of your remaining energy.`,
        choices: [
          {
            label: 'Prioritize health, peace of mind, and the people who truly love you',
            effect: (st) => {
              st.player.vitals.health = clamp(st.player.vitals.health + 6);
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
              st.player.vitals.stress = clamp(st.player.vitals.stress - 12);
              recordJournal(st, `Entering your forties, you consciously slowed the pace to protect your health and closest relationships.`, 'milestone');
            }
          },
          {
            label: 'Double down on building lasting wealth and generational assets',
            effect: (st) => {
              st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
              if (st.career.job) st.career.job.performance = clamp(st.career.job.performance + 8);
              recordJournal(st, st.career.job ? `At ${age}, you put more of yourself into work and into building something to leave behind. It cost you some rest.` : `At ${age}, you decided to put your energy into building something to leave behind. It cost you some rest.`, 'milestone');
            }
          }
        ]
      }));
    }
  }

  /* Collect 30+ extended psychological, workplace, marriage, expat & elder-life scenes */
  collectExtendedLifeScenes(S, addOnce);
  if(restoreBaseId)return restoreBuilder?restoreBuilder():null;

  /* v2.5: the same roll also draws from the new random-events pool.
     Weighted by pool size, so the total pop-up rate does not change —
     the roll already happened, this only chooses which pool it comes
     from. As the once-per-life curated scenes exhaust, random events
     naturally take over and a life keeps getting scenes past 40. */
  const randomPool = collectRandomLifeEvents(S);
  const totalPool = candidates.length + randomPool.length;
  if (!totalPool) return null;
  if (randomPool.length && (!candidates.length || rand(S) < randomPool.length / totalPool)) {
    const randomScene = pickRandomLifeEvent(S);
    if (randomScene) return randomScene;
    if (!candidates.length) return null;
  }

  if (!candidates.length) return null;
  const builder = pick(S, candidates);
  return builder ? builder() : null;
}

export function restoreCuratedLifeScene(S,saved){
 if(!saved?.baseId||saved.eventId)return null;
 const before=S.rngState;
 try{if(saved.curatedBuildRngState!==undefined)S.rngState=saved.curatedBuildRngState;const scene=pickCuratedLifeScene(S,saved.baseId);if(!scene)return null;for(const key of['urgent','createdTurn','createdYear'])if(saved[key]!==undefined)scene[key]=saved[key];return scene;}catch{return null;}finally{S.rngState=before;}
}

export function buildBurnoutScene(S,{stageId,stageTitle,fee:originalFee,country:originalCountry}={}){
 if(!stageId||!stageTitle)return null;
 const fee=originalFee??Math.round(eraLocalCost(getCountry(S.country).healthcare.checkup2026*2,S.country,S.year)),country=originalCountry||S.country;
 return{key:stageId,baseId:stageId,maxPerLife:1,category:'health',title:stageTitle,burnoutSnapshot:{stageId,stageTitle,fee,country},text:'High strain. Reset your work pace or pay for a fictional counseling session. Game mood changes are not a medical outcome.',choices:[{label:'Reset pace · no fee',effect:st=>{if(st.career.job)st.career.job.workMode='normal';st.player.vitals.stress=clamp(st.player.vitals.stress-42);st.player.vitals.happiness=Math.max(38,clamp(st.player.vitals.happiness+34));recordJournal(st,'Reset work pace and accepted practical support.','health');}},{label:'Game counseling · '+formatMoney(fee,country),available:()=>S.country===country&&S.money.cash>=fee,effect:st=>{if(st.country!==country||st.money.cash<fee)return;walletMove(st,-fee,'Fictional counseling session','medical');st.health??={};st.health.counselingSessions??=[];st.health.counselingSessions.push({stageId,year:st.year,month:st.month,fee,country});st.player.vitals.stress=clamp(st.player.vitals.stress-46);st.player.vitals.happiness=Math.max(42,clamp(st.player.vitals.happiness+38));recordJournal(st,'Paid for a game counseling session. No cure or clinical outcome is claimed.','health');}}]};
}
export function restoreBurnoutScene(S,saved){return saved?.burnoutSnapshot?buildBurnoutScene(S,saved.burnoutSnapshot):null;}

export function buildCriticalAdmissionScene(S,snapshot){
 const q=snapshot||{key:'critical_admission_'+S.year,year:S.year};
 return{key:q.key,baseId:q.key,maxPerLife:1,category:'health',title:'Game Emergency Aid ('+q.year+')',criticalAdmissionSnapshot:q,text:'Free fictional emergency aid restores a minimum health level. No cash is charged and existing conditions are not cured or marked managed.',choices:[{label:'Accept game emergency aid · free',effect:st=>{st.medical.emergencyAidHistory??=[];if(st.medical.emergencyAidHistory.some(r=>r.key===q.key))return;st.medical.emergencyAidHistory.push({key:q.key,year:st.year,month:st.month,cost:0});st.player.vitals.health=Math.max(42,st.player.vitals.health);st.player.vitals.stress=clamp(st.player.vitals.stress-15);recordJournal(st,'Received free fictional emergency aid. Existing medical conditions and treatment plans remain.','health');}}]};
}
export function restoreCriticalAdmissionScene(S,saved){return saved?.criticalAdmissionSnapshot?buildCriticalAdmissionScene(S,saved.criticalAdmissionSnapshot):null;}

export function buildDiagnosisScene(S,snapshot){
 const q={...snapshot},entry=S.medical.conditions.find(c=>c.id===q.conditionId&&c.sinceYear===q.sinceYear),picked=MEDICAL_CONDITIONS.find(c=>c.id===q.conditionId);
 if(!entry||!picked||S.country!==q.country)return null;
 const hospitals=getHospitalsFor(S.country,S.year),pub=hospitals.find(h=>h.sector==='public')||hospitals[0],priv=hospitals.find(h=>h.sector==='private')||hospitals.at(-1),serious=isSeriousCondition(entry.id);
 q.costs??={private:treatmentCostLocal(S,entry,'private'),public:treatmentCostLocal(S,entry,'public')};q.hospitals??={private:priv.name,public:pub.name};
 const key='diagnosis_'+q.conditionId+'_'+q.sinceYear;
 const current=st=>st.country===q.country&&st.medical.conditions.find(c=>c.id===q.conditionId&&c.sinceYear===q.sinceYear);
 const answered=st=>st.medical.diagnosisReplies?.[key];
 const record=st=>{st.medical.diagnosisReplies??={};st.medical.diagnosisReplies[key]=true;};
 const choices=['private','public'].map(care=>({label:(care==='private'?'Private':'Public')+' game treatment · '+formatMoney(q.costs[care],q.country),available:st=>{const c=current(st);return !!c&&!answered(st)&&(!c.managed||serious)&&c.treatmentStatus!=='treated'&&c.lastTreatmentPeriod!==st.year*12+st.month&&st.money.cash>=q.costs[care]&&treatmentCostLocal(st,c,care)===q.costs[care];},effect:st=>{const c=current(st);if(!c||answered(st)||c.managed&&!serious||c.treatmentStatus==='treated'||c.lastTreatmentPeriod===st.year*12+st.month||st.money.cash<q.costs[care]||treatmentCostLocal(st,c,care)!==q.costs[care])return;
 if(serious){const r=runDiseaseTreatment(st,c.id,care);if(r.ok)record(st);return;}
 walletMove(st,-q.costs[care],'Game treatment: '+c.label+' at '+q.hospitals[care],'medical');c.lastTreatmentPeriod=st.year*12+st.month;
 if(c.chronic||care==='public'){c.managed=true;c.treatmentStatus='treated';}else{st.medical.conditions=st.medical.conditions.filter(x=>x!==c);st.player.vitals.health=clamp(st.player.vitals.health+8);}
 record(st);recordJournal(st,'Completed game '+care+' care for '+c.label+'.','health');}}));
 choices.push({label:'Leave care unchanged for now',effect:st=>{if(answered(st))return;record(st);recordJournal(st,'Deferred diagnosis-scene care. Current condition and treatment records remain.','health');}});
 return{key:'med_onset_'+entry.id+'_'+q.year,baseId:'Medical Diagnosis: '+picked.label,category:'health',title:'Medical Diagnosis: '+picked.label,diagnosisSnapshot:q,text:q.text||('Recorded '+picked.label+(entry.stage?' · stage '+entry.stage:'')+'. Game care has simplified outcomes. Review Health for ongoing treatment; no family or university cover is assumed.'),choices};
}
export function restoreDiagnosisScene(S,saved){
 if(saved?.diagnosisSnapshot)return buildDiagnosisScene(S,saved.diagnosisSnapshot);
 if(!saved?.key?.startsWith('med_onset_'))return null;
 const entry=S.medical.conditions.find(c=>saved.key==='med_onset_'+c.id+'_'+c.sinceYear);
 return entry?buildDiagnosisScene(S,{conditionId:entry.id,sinceYear:entry.sinceYear,year:entry.sinceYear,country:S.country}):null;
}
