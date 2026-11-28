import {playerDepositValue} from '../systems/playerTenancy.js';
import{ownedCompanyNetValue}from'../systems/companyLiability.js';
import { businessValuation } from '../data/businessValuation.js';
/* ============================================================================
   World Life 2.0 — Canonical State & Unified Person Schema
   ONE Person shape for player, parents, siblings, classmates, friends, boss,
   coworkers, partner/spouse(s), in-laws, and children.
   ========================================================================== */

import { hashSeed, rand, randInt, pick, clamp } from './rng.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { pickFirstName, pickFamilyName } from '../data/names.js';
import { eraSalary, eraLocalCost, goldPricePerGram,convertCurrency } from '../data/economy.js';
import { getSchoolsFor, getBanksFor } from '../data/institutions.js';
import { getMarriageProfile } from '../data/visasAndMarriage.js';

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function nextId(S, prefix = 'id') {
  S.seq = (S.seq || 0) + 1;
  return `${prefix}_${S.seq}`;
}

export function deriveTraitTags(traits) {
  const tags = [];
  if (traits.warmth >= 70) tags.push('Warm');
  else if (traits.warmth <= 32) tags.push('Cold');

  if (traits.pride >= 72) tags.push('Proud');
  if (traits.materialism >= 72) tags.push('Materialistic');
  else if (traits.materialism <= 28) tags.push('Generous');

  if (traits.traditionalism >= 72) tags.push('Traditional');
  else if (traits.traditionalism <= 28) tags.push('Unconventional');

  if (traits.ambition >= 72) tags.push('Driven');
  if (traits.reliability >= 74) tags.push('Dependable');
  else if (traits.reliability <= 30) tags.push('Flaky');

  if (tags.length === 0) tags.push('Grounded', 'Practical');
  return tags.slice(0, 2);
}

export function createPerson(S, opts = {}) {
  const countryId = opts.nationality || S.country || 'egy';
  const cObj = getCountry(countryId);
  const gender = opts.gender || (rand(S) < 0.5 ? 'm' : 'f');
  const firstName = opts.firstName || pickFirstName(countryId, gender, () => rand(S), opts.excludeNames || Object.values(S.people || {}).filter(x => x && x.alive !== false).map(x => x.firstName)); /* a new person does not share a first name with someone alive in this life */
  const familyName = opts.familyName || pickFamilyName(countryId, () => rand(S));
  const age = Math.max(0, Number(opts.age ?? 25));
  const birthYear = opts.birthYear ?? (S.year - age);

  const traits = {
    warmth: clamp(opts.traits?.warmth ?? randInt(S, 22, 88)),
    pride: clamp(opts.traits?.pride ?? randInt(S, 20, 88)),
    materialism: clamp(opts.traits?.materialism ?? randInt(S, 18, 86)),
    traditionalism: clamp(opts.traits?.traditionalism ?? (
      (countryId === 'sau' || countryId === 'egy' || countryId === 'uae' || countryId === 'ind')
        ? randInt(S, 45, 92)
        : randInt(S, 18, 75)
    )),
    ambition: clamp(opts.traits?.ambition ?? randInt(S, 25, 88)),
    reliability: clamp(opts.traits?.reliability ?? randInt(S, 30, 90))
  };

  const religion = opts.religion || cObj.defaultReligion || 'secular';
  const wearsHijab = gender === 'f' && religion === 'muslim'
    ? (opts.wearsHijab ?? (rand(S) < (countryId === 'sau' ? 0.90 : countryId === 'egy' || countryId === 'uae' ? 0.72 : 0.35)))
    : false;
  const wearsGulfAttire = (countryId === 'sau' || countryId === 'uae') && (opts.nationality === countryId || !opts.nationality)
    ? (gender === 'm' ? rand(S) < 0.82 : rand(S) < 0.78)
    : false;

  return {
    id: opts.id || nextId(S, 'p'),
    firstName,
    familyName,
    fullName: `${firstName} ${familyName}`,
    gender,
    age,
    birthYear,
    birthMonth: opts.birthMonth || randInt(S, 1, 12),
    alive: opts.alive !== false,
    deathYear: null,
    deathCause: null,
    role: opts.role || 'friend',          // father | mother | sibling | classmate | friend | colleague | boss | partner | spouse | child | in_law
    relationLabel: opts.relationLabel || 'Acquaintance',
    waliId: opts.waliId || null,          // father/guardian Person id for a partner (set by the marriage engine)
    nationality: countryId,
    citizenships: Array.isArray(opts.citizenships) ? opts.citizenships.slice() : [countryId],
    residenceCountry: opts.residenceCountry || S.country || countryId,
    city: opts.city || S.city || cObj.cities[0],
    religion,
    traits,
    traitTags: deriveTraitTags(traits),
    appearance: {
      seed: randInt(S, 1, 999999),
      skinToneIdx: opts.skinToneIdx ?? defaultSkinToneFor(S, countryId),
      faceShapeIdx: opts.faceShapeIdx ?? 0,
      tailored: !!opts.tailored,
      hairStyleIdx: randInt(S, 0, 5),
      hairColorIdx: defaultHairColorFor(S, countryId),
      glasses: rand(S) < 0.22,
      beard: gender === 'm' && age >= 19 ? rand(S) < 0.48 : false,
      wearsHijab,
      wearsGulfAttire
    },
    vitals: {
      health: clamp(opts.health ?? randInt(S, 72, 98)),
      happiness: clamp(opts.happiness ?? randInt(S, 55, 85)),
      stress: clamp(opts.stress ?? randInt(S, 15, 45)),
      smarts: clamp(opts.smarts ?? randInt(S, 45, 92)),
      looks: clamp(opts.looks ?? randInt(S, 42, 92))
    },
    education: {
      degree: opts.degree || null,
      universityName: opts.universityName || null
    },
    career: {
      title: opts.jobTitle || (
        age < 5 ? 'Infant / Preschool'
        : age < 12 ? 'Primary School Pupil'
        : age < 18 ? 'Secondary Student'
        : age < 22 ? 'University Student'
        : 'Seeking Work'
      ),
      employer: opts.employer || null,
      track: opts.track || null,
      monthlyIncomeLocal: Math.max(0, Number(opts.monthlyIncomeLocal || 0)),
      savingsLocal: Math.max(0, Number(opts.savingsLocal || 0))
    },
    rel: {
      affection: clamp(opts.affection ?? 65),
      respect: clamp(opts.respect ?? 60),
      trust: clamp(opts.trust ?? 65),
      resentment: clamp(opts.resentment ?? 0),
      chemistry: clamp(opts.chemistry ?? randInt(S, 40, 88)),
      lastContactTurn: S.turn || 0,
      lastContactYear: S.year,
      lastContactMonth: S.month,
      memories: [],
      promises: [],
      currentWant: null
    }
  };
}

function defaultSkinToneFor(S, countryId) {
  if (['gbr', 'deu', 'nld', 'fra', 'ita', 'can', 'aus'].includes(countryId)) return pick(S, [0, 0, 1, 1, 2, 4]);
  if (['egy', 'sau', 'uae', 'bra'].includes(countryId)) return pick(S, [1, 2, 2, 3, 3, 4]);
  if (countryId === 'ind') return pick(S, [2, 3, 3, 4, 4]);
  if (countryId === 'jpn' || countryId === 'sgp') return pick(S, [0, 1, 1, 2]);
  return pick(S, [0, 1, 2, 3, 4]);
}

function defaultHairColorFor(S, countryId) {
  if (['egy', 'sau', 'uae', 'ind', 'jpn', 'sgp'].includes(countryId)) return pick(S, [0, 0, 0, 1]); // dark black / espresso
  return pick(S, [0, 1, 1, 2, 3, 4]); // black, brown, chestnut, blonde, auburn
}

export const FAMILY_TIERS = {
  struggling:   { label: 'Working-Poor Household', birth: 'a working-poor household', salaryMult: 0.55, savingsMonths: 1.5, schoolPref: 'state', homeMode: 'rent_modest' },
  working:      { label: 'Modest Working Family', birth: 'a modest working family', salaryMult: 0.85, savingsMonths: 4,   schoolPref: 'state', homeMode: 'rent_modest' },
  middle:       { label: 'Middle-Class Family',   birth: 'a middle-class family', salaryMult: 1.35, savingsMonths: 10,  schoolPref: 'private', homeMode: 'family_owned' },
  upper_middle: { label: 'Affluent Professional', birth: 'an affluent professional family', salaryMult: 2.50, savingsMonths: 24,  schoolPref: 'private', homeMode: 'family_owned_upscale' },
  wealthy:      { label: 'Established Wealthy', birth: 'an established wealthy family',    salaryMult: 5.20, savingsMonths: 60,  schoolPref: 'international', homeMode: 'family_villa' },
  very_wealthy: { label: 'Dynasty Wealth', birth: 'a dynasty-wealth family',         salaryMult: 40,   savingsMonths: 240, schoolPref: 'international', homeMode: 'family_palace' }
};

export const LIFE_AMBITIONS = {
  balanced:        { id: 'balanced',        label: 'A Full, Respected Life',     desc: 'Build strong family roots, financial security, and a name people trust.' },
  global_passport: { id: 'global_passport', label: 'Cross Borders & Rise Abroad', desc: 'Master exams, navigate visas or Gulf offers, and build an international life.' },
  career_wealth:   { id: 'career_wealth',   label: 'Reach the Top of Your Field', desc: 'Climb to executive or specialist ranks and build serious real-estate & gold wealth.' },
  entrepreneur:    { id: 'entrepreneur',    label: 'Build Your Own Enterprise',   desc: 'Save capital, take calculated risks, and grow a thriving independent company.' },
  family_dynasty:  { id: 'family_dynasty',  label: 'Anchor a Multi-Gen Dynasty',  desc: 'Honor parents, build a lasting marriage, and pass real assets to your children.' }
};

export function createNewLifeState(opts = {}) {
  const seedInput = opts.seed ?? 20261118;
  const countryId = opts.country || 'egy';
  const cObj = getCountry(countryId);
  const birthYear = clamp(Number(opts.birthYear || 1998), 1960, 2015);
  const familyTierId = FAMILY_TIERS[opts.familyTier] ? opts.familyTier : 'middle';
  const tier = FAMILY_TIERS[familyTierId];
  const gender = opts.gender === 'f' ? 'f' : 'm';
  const ambition = LIFE_AMBITIONS[opts.ambition] ? opts.ambition : 'balanced';

  const S = {
    version: '2.0.0',
    seed: seedInput,
    rngState: hashSeed(seedInput),
    seq: 0,
    turn: 0,
    year: birthYear,
    month: 1,
    pacing: 'yearly', // Adaptive: 'yearly' ages 0-17, 'monthly' ages 18+
    gameOver: false,
    rules: { creditLimit: true, capacity: true },
    generation: opts.generation || 1,
    dynastyHistory: Array.isArray(opts.dynastyHistory) ? opts.dynastyHistory.slice() : [],

    country: countryId,
    homeCountry: countryId,
    city: opts.city || cObj.cities[0],
    homeCity: opts.city || cObj.cities[0],
    familyTier: familyTierId,
    ambition,

    player: null,
    people: {}, // id -> Person (single canonical directory!)
    relations: {
      fatherId: null,
      motherId: null,
      siblingIds: [],
      partnerId: null,
      spouseIds: [],
      exSpouseIds: [],
      widowedSpouseIds: [],
      childIds: [],
      friendIds: [],
      colleagueIds: [],
      bossId: null,
      inLawIds: []
    },

    money: {
      cash: 0,              // Liquid checking/wallet cash in current S.country currency
      savings: 0,           // Bank savings balance in current S.country currency
      // v2.7 savings provenance: where the savings balance came from, so the
      // player is never left wondering "I don't remember putting money here".
      savingsDepositsTotal: 0,    // Sum of everything ever moved cash -> savings
      savingsWithdrawalsTotal: 0, // Sum of everything ever moved savings -> cash
      savingsInterestTotal: 0,    // Sum of all savings interest ever credited
      bankId: null,
      bankName: null,
      certificates: [],     // { id, bankName, principal, annualRate, maturityYear, maturityMonth, country }
      goldGrams21k: 0,      // Physical 21K gold holdings (Shabka / bullion hedge)
      loans: [],            // { id, label, balance, monthlyPayment, annualRate, remainingMonths, country }
      creditScore: 680,
      missedRentMonths: 0,
      bankruptUntilYear: 0,
      parentalAllowanceActive: true,
      remittanceMonthlyLocal: 0,
      remittedHomeEgpTotal: 0, // Lifetime total sent home to family, in EGP (v2.16 W2: helped_family) — recorded at each send, never backfilled
      lifestyleMode: 'comfortable', // frugal | comfortable | generous | lavish
      lastMonthSummary: { income: 0, tax: 0, housing: 0, living: 0, debt: 0, support: 0, net: 0 }
    },

    housing: {
      mode: 'parents',      // parents | rent | owned | employer_provided
      currentHomeId: null,
      currentHomeName: (familyTierId === 'wealthy' || familyTierId === 'very_wealthy') ? (familyTierId === 'very_wealthy' ? 'Heritage Family Estate' : 'Family Villa')
        : familyTierId === 'upper_middle' ? 'Family Duplex'
        : familyTierId === 'struggling' ? 'Modest Family Flat'
        : 'Family Apartment',
      currentShape: (familyTierId === 'wealthy' || familyTierId === 'very_wealthy') ? 'villa'
        : familyTierId === 'upper_middle' ? 'duplex'
        : familyTierId === 'struggling' ? 'studio'
        : 'apartment',
      monthlyRent: 0,
      landlordStrictness: 50,
      properties: [],       // { id, catalogId, name, shape, finishing, furnishedRooms:{}, upgrades:[], country, city, rooms, areaM2, nativeValue, valueLocal, rentedOut, nativeMonthlyRent, installmentRemaining, nativeInstallmentRemaining, nativeMonthlyInstallment, monthsLeft }
      lands: [],            // { id, catalogId, name, country, city, areaM2, nativeValue, buildProject: null | { typeId, label, shape, finishId, monthsLeft, totalMonths, progressPct } }
      staff: []             // { id, roleKey, name, monthlyCostLocal }
    },

    cars: [],               // { id, catalogId, name, body, colorHex, colorName, trimLabel, mods:[], boughtYear, valueLocal, monthlyUpkeep, condition }
    drivingLicence: {
      valid: false,
      issuedYear: null,
      expiresYear: null
    },
    inventory: [],          // Purchased shopping items & appreciating watches/jewelry/luxury goods
    bnplPlans: [],          // Active ValU / Tabby / Tamara / Klarna installment plans { id, label, monthlyPay, monthsLeft }
    creditCards: [],        // Active credit cards { id, catalogId, name, tier, limit, balance, apr, cashbackRate }
    investments: [],        // Stock / ETF / Sukuk / Bond / Crypto positions { assetId, name, kind, valueLocal, costBasisLocal }
    credentials: {
      licenses: [],         // ['lic_uk_plab', 'lic_sau_scfhs', ...]
      languageCerts: [],    // [{ id, label, lang, expiresYear }]
      hajjCompleted: false,
      umrahCount: 0,
      zakatLastYearPaid: 0
    },

    education: {
      stage: 'infancy',     // infancy (0-5) | primary (6-11) | middle (12-14) | high (15-17) | graduated_high | university | completed
      schoolId: null,
      schoolName: null,
      schoolTier: tier.schoolPref,
      studyEffort: 'normal', // coasting | normal | hard
      privateTutoring: false,
      academicSkill: 55,
      highSchoolScore: null,
      university: null,     // { id, name, country, majorId, majorLabel, yearInProgram, totalYears, annualTuition, scholarshipPct }
      degrees: [],          // ['cs', 'medicine', ...]
      languages: [countryId === 'egy' || countryId === 'sau' || countryId === 'uae' ? 'Arabic' : 'Native', 'English (Basic)']
    },

    career: {
      employed: false,
      job: null,            // { employer, title, track, level, monthlyGross, startYear, monthsInRole, performance, workMode: 'normal'|'overtime'|'coast', bossId }
      yearsExperience: 0,
      trackExperience: {},  // track -> years
      unemployedMonths: 0,
      business: null,       // { id, typeId, name, country, employees, monthlyRev, monthlyCost, capitalInvested, repeatRate }
      businesses: [],       // v2.11: the real list — business above is a live mirror (= businesses[0] or null)
      retired: false,
      monthlyPension: 0
    },

    legal: {
      citizenships: [countryId],
      passports: [
        { country: countryId, issuedYear: birthYear, expiresYear: birthYear + cObj.passportValidityYears }
      ],
      military: {
        applicable: !!(cObj.conscription?.enabled && gender === 'm'),
        status: (cObj.conscription?.enabled && gender === 'm') ? 'deferred_minor' : 'not_applicable',
        // deferred_minor | deferred_student | active_duty | completed | exempt
        monthsRemaining: 0,
        exemptionReason: null,
        travelPermitted: true
      },
      residency: {
        kind: 'citizen',    // citizen | student_visa | post_study_work | work_visa | gulf_iqama | golden_visa | permanent_resident | grace_period | undocumented
        country: countryId,
        permitName: `${cObj.adjective} Citizenship`,
        sponsorName: null,
        sponsorArchetype: null,
        expiresYear: null,
        expiresMonth: null,
        graceMonthsLeft: 0,
        yearsInCountryLegally: 0,
        familySponsored: false
      },
      blockedAccount: null, // { kind: 'Sperrkonto'|'GIC', country, balanceLocal, monthlyReleaseLocal }
      studyAbroadOffer: null,
      gulfOffer: null,
      criminalRecord: false,
      travelBanInCountry: null
    },

    marriage: {
      status: 'single',     // single | dating | engaged | married | divorced | widowed
      stageDetail: null,    // fatiha | shabka | housing_prep | katb_ketab
      engagement: null,     // { partnerId, startedYear, shabkaGrams, mahrPrompt, mahrDeferred, qaimaSigned, qaimaValue, medicalCleared, permitCleared, venueId, housingReady }
      couples: [],          // THE couple record (single source of truth): one entry per
                            // courtship/engagement/marriage; see newCoupleRecord() below.
      contracts: [],        // Compat view of couples[] (one entry per wedding), kept in sync
                            // by syncCoupleToLegacy() for older UI/tests — never written directly.
      householdSplit: 'traditional_provider', // traditional_provider | shared_50_50 | proportional
      tryingForBaby: false,
      pregnancy: null       // { motherId, conceptionTurn, dueMonths, babyCount }
    },

    medical: {
      conditions: [],       // { id, label, severity, sinceYear, managed, annualHealthHit, annualHappinessHit, deathRiskPerYear }
      fertilityScore: 82,
      healthInsurance: false
    },

    activeScene: null,      // Current decision modal/card requiring player choice
    sceneQueue: [],         // Queued follow-up / urgent scenes
    cooldowns: {},          // sceneKey -> turnWhenAvailableAgain
    sceneCounts: {},        // baseSceneId -> lifetime count (prevents repetitive AI/RNG loops!)
    eventFiredTurns: {},    // v2.5 random-event id -> { turn, year, month } it fired (chain delays)
    facts: [],              // Causal world facts emitted for Domino NPC reactions
    ledger: [],             // Audited financial transactions (newest first, capped 400)
    journal: [],            // Clean human story entries (newest first)
    goals: []
  };

  /* Create family name + player + parents + siblings */
  const familySurname = opts.familyName || pickFamilyName(countryId, () => rand(S));
  const playerFirst = opts.firstName || pickFirstName(countryId, gender, () => rand(S));

  const player = createPerson(S, {
    id: 'player',
    firstName: playerFirst,
    familyName: familySurname,
    gender,
    age: 0,
    birthYear,
    role: 'player',
    relationLabel: 'You',
    nationality: countryId,
    citizenships: [countryId],
    residenceCountry: countryId,
    city: S.city,
    health: randInt(S, 84, 99),
    happiness: 85,
    stress: 5,
    smarts: randInt(S, 52, 92),
    looks: randInt(S, 48, 90)
  });
  S.player = player;
  S.people['player'] = player; // The player IS a Person: every "all people" loop sees them.
  // (Save/load is JSON, so a loaded save carries two copies — ensureExtendedState()
  // re-links S.people['player'] to S.player on every load, so the pointer stays single.)

  /* Pre-roll older siblings (0–2, ages 1–6) BEFORE parent ages so Mother is NEVER < 23 at first child's birth! */
  const sibCount = pick(S, [0, 1, 1, 2]);
  const sibSpecs = [];
  let maxOlderSibAge = 0;
  for (let i = 0; i < sibCount; i++) {
    const sGen = rand(S) < 0.5 ? 'm' : 'f';
    const sAge = randInt(S, 1, 6);
    if (sAge > maxOlderSibAge) maxOlderSibAge = sAge;
    sibSpecs.push({ sGen, sAge });
  }

  /* Father & Mother with biologically & culturally realistic ages */
  const minMomAge = Math.max(24, 22 + maxOlderSibAge);
  const momAge = randInt(S, minMomAge, minMomAge + 9);
  const dadAge = momAge + randInt(S, 1, 6);
  const baseMidSalary = eraSalary(cObj.annualSalaryTiers2026.mid / 12, countryId, birthYear);
  const dadMonthly = Math.round(baseMidSalary * tier.salaryMult);
  const momWorks = rand(S) < (countryId === 'sau' && birthYear < 2017 ? 0.25 : 0.58);
  const momMonthly = momWorks ? Math.round(baseMidSalary * tier.salaryMult * 0.72) : 0;

  const father = createPerson(S, {
    firstName: pickFirstName(countryId, 'm', () => rand(S), [playerFirst]),
    familyName: familySurname,
    gender: 'm',
    age: dadAge,
    birthYear: birthYear - dadAge,
    role: 'father',
    relationLabel: 'Father',
    nationality: countryId,
    residenceCountry: countryId,
    city: S.city,
    skinToneIdx: player.appearance.skinToneIdx,
    jobTitle: (familyTierId === 'wealthy' || familyTierId === 'very_wealthy') ? 'Company Director' : familyTierId === 'upper_middle' ? 'Senior Consultant' : familyTierId === 'middle' ? 'Accountant' : 'Technician',
    monthlyIncomeLocal: dadMonthly,
    savingsLocal: Math.round((dadMonthly + momMonthly) * tier.savingsMonths),
    affection: randInt(S, 72, 95),
    respect: 70,
    trust: 80
  });

  const mother = createPerson(S, {
    firstName: pickFirstName(countryId, 'f', () => rand(S), [playerFirst]),
    familyName: pickFamilyName(countryId, () => rand(S)),
    gender: 'f',
    age: momAge,
    birthYear: birthYear - momAge,
    role: 'mother',
    relationLabel: 'Mother',
    nationality: countryId,
    residenceCountry: countryId,
    city: S.city,
    skinToneIdx: player.appearance.skinToneIdx,
    jobTitle: momWorks ? (familyTierId === 'upper_middle' || familyTierId === 'wealthy' || familyTierId === 'very_wealthy' ? 'Specialist Physician' : 'School Teacher') : 'Homemaker',
    monthlyIncomeLocal: momMonthly,
    savingsLocal: Math.round(dadMonthly * (tier.savingsMonths * 0.4)),
    traits: { warmth: randInt(S, 68, 96) },
    affection: randInt(S, 80, 98),
    respect: 72,
    trust: 85
  });

  S.people[father.id] = father;
  S.people[mother.id] = mother;
  S.relations.fatherId = father.id;
  S.relations.motherId = mother.id;

  const usedNames = [playerFirst, father.firstName, mother.firstName];
  for (const sp of sibSpecs) {
    const sFirst = pickFirstName(countryId, sp.sGen, () => rand(S), usedNames);
    usedNames.push(sFirst);
    const sib = createPerson(S, {
      firstName: sFirst,
      familyName: familySurname,
      gender: sp.sGen,
      age: sp.sAge,
      birthYear: birthYear - sp.sAge,
      role: 'sibling',
      relationLabel: sp.sGen === 'm' ? 'Brother' : 'Sister',
      nationality: countryId,
      residenceCountry: countryId,
      city: S.city,
      skinToneIdx: player.appearance.skinToneIdx,
      affection: randInt(S, 60, 88),
      respect: 58,
      trust: 68
    });
    S.people[sib.id] = sib;
    S.relations.siblingIds.push(sib.id);
  }

  /* Assign default primary bank for adulthood */
  const banks = getBanksFor(countryId, birthYear);
  if (banks.length) {
    S.money.bankId = banks[0].id;
    S.money.bankName = banks[0].name;
  }

  /* Assign initial school preference */
  const schools = getSchoolsFor(countryId, birthYear + 6);
  const localSchools = schools.filter(s => String(s.city || '').toLowerCase() === String(S.city || '').toLowerCase());
  const schoolPool = localSchools.length ? localSchools : schools;
  const chosenSchool = schoolPool.find(s => s.tier === tier.schoolPref) || schoolPool[0];
  if (chosenSchool) {
    S.education.schoolId = chosenSchool.id;
    S.education.schoolName = chosenSchool.name;
    S.education.schoolTier = chosenSchool.tier;
  }

  /* Initialize Starter Goals */
  S.goals = buildStarterGoals(S);

  /* Opening Life Journal Entry */
  const sibLine = sibCount === 0
    ? 'an only child'
    : `with ${sibCount === 1 ? `your older ${S.people[S.relations.siblingIds[0]].relationLabel.toLowerCase()} ${S.people[S.relations.siblingIds[0]].firstName}` : `${sibCount} older siblings`}`;

  recordJournal(
    S,
    `Born in ${S.city}, ${cObj.name} in ${birthYear} into ${tier.birth || 'a ' + tier.label.toLowerCase()} — ${father.firstName} (${father.career.title.toLowerCase()}) and ${mother.firstName} (${mother.career.title.toLowerCase()}), ${sibLine}.`,
    'milestone'
  );

  /* If inherited cash/properties from previous generation */
  if (opts.inheritedCash && opts.inheritedCash > 0) {
    walletMove(S, opts.inheritedCash, 'Generational family inheritance', 'inheritance');
  }
  if (Array.isArray(opts.inheritedProperties) && opts.inheritedProperties.length) {
    S.housing.properties.push(...opts.inheritedProperties);
  }

  return S;
}

/* v2.10 — goals are staged quests. Each goal carries `stages`: a label and
   a `check` key. The key is evaluated against live state in views.js
   (goalStageProgress) — the same way goalProgressDetail already reads live
   state — so stages never go stale and refreshGoalsProgress's done-rules
   in gameLoop.js are untouched. */
/* One concrete goal evaluator. Progress is not a judgement of a life. */
export function ambitionProgress(S){
 const kids=(S.relations?.childIds||[]).length,homes=(S.housing?.properties||[]).length;
 if(S.ambition==='family_dynasty')return{pct:(kids?50:0)+(homes?50:0),complete:kids>0&&homes>0,reason:`${kids} children · ${homes} homes owned.`};
 if(S.ambition==='entrepreneur'){const n=S.career?.business?.employees||0;return{pct:Math.min(100,Math.round(n/6*100)),complete:n>=6,reason:`Team: ${n}/6 employees.`};}
 if(S.ambition==='global_passport'){const done=S.country!==S.homeCountry||(S.legal?.citizenships||[]).length>1||S.legal?.residency?.kind==='permanent_resident'&&S.country!==S.homeCountry;return{pct:done?100:0,complete:done,reason:done?'International-life goal reached.':'Live abroad or gain another citizenship.'};}
 if(S.ambition==='balanced'){
 const ids=['g_grad','g_income','g_home','g_family'],done=ids.filter(id=>(S.goals||[]).some(g=>g.id===id&&g.done)).length;
 return{pct:done*25,complete:done===4,reason:`${done}/4 goals reached: education, work, home and a trusted circle. These milestones do not measure fulfilment.`};
 }
 const target=Math.max(1,eraSalary(getCountry(S.country).annualSalaryTiers2026.mid,S.country,S.year)*6),worth=computeNetWorthLocal(S);
 return{pct:Math.max(0,Math.min(100,Math.round(worth/target*100))),complete:worth>=target,reason:`Net worth ${formatMoney(worth,S.country)} / ${formatMoney(target,S.country)}.`};
}

export function buildStarterGoals(S) {
  const ambitionStages = S.ambition === 'global_passport'
    ? [
      { id: 's1', label: 'Hold a valid passport', check: 'has_passport' },
      { id: 's2', label: 'Live abroad', check: 'living_abroad' },
      { id: 's3', label: 'Hold a second passport or permanent residency', check: 'second_passport' }
    ]
    : S.ambition === 'entrepreneur'
    ? [
      { id: 's1', label: 'Save starting capital', check: 'has_savings' },
      { id: 's2', label: 'Launch a business', check: 'has_business' },
      { id: 's3', label: 'Grow the team to 6 employees', check: 'team_of_six' }
    ]
    : S.ambition === 'family_dynasty'
    ? [
      { id: 's1', label: 'Marry', check: 'is_married' },
      { id: 's2', label: 'Have a child', check: 'has_child' },
      { id: 's3', label: 'Own a family home', check: 'owns_home' }
    ]
    : S.ambition==='balanced' ? [
      {id:'s1',label:'Education and work goals',check:'balanced_work'},
      {id:'s2',label:'Home goal',check:'balanced_home'},
      {id:'s3',label:'Trusted circle goal',check:'balanced_circle'}
    ] : [
      { id: 's1', label: 'Build savings of your own', check: 'has_savings' },
      { id: 's2', label: 'Reach 3× the national annual salary in net worth', check: 'worth_3x_salary' },
      { id: 's3', label: 'Reach 6× the national annual salary in net worth', check: 'worth_6x_salary' }
    ];
  return [
    {
      id: 'g_grad', label: 'Complete Secondary Exams & Earn a Qualification', done: false,
      stages: [
        { id: 's1', label: 'Attend school', check: 'in_school' },
        { id: 's2', label: 'Take your secondary exams', check: 'exams_taken' },
        { id: 's3', label: 'Earn a qualification', check: 'has_degree' }
      ]
    },
    {
      id: 'g_income', label: 'Achieve Self-Sustaining Monthly Career or Business Income', done: false,
      stages: [
        { id: 's1', label: 'Find work or start a business', check: 'has_work' },
        { id: 's2', label: 'Earn a first monthly pay', check: 'has_pay' },
        { id: 's3', label: 'Keep it for a full year', check: 'year_in_work' }
      ]
    },
    {
      id: 'g_home', label: 'Secure Your Own Independent Home (Owned or Compound)', done: false,
      stages: [
        { id: 's1', label: 'Save a deposit', check: 'has_savings' },
        { id: 's2', label: 'Live in a home of your own (rented or owned)', check: 'has_own_home' },
        { id: 's3', label: 'Buy a home', check: 'owns_home' },
        { id: 's4', label: 'Furnish a room in it', check: 'home_furnished' }
      ]
    },
    {
      id: 'g_family', label: 'Build a Trusted Inner Circle or Household', done: false,
      stages: [
        { id: 's1', label: 'Build one close bond', check: 'one_close_bond' },
        { id: 's2', label: 'Marry, or build three close bonds', check: 'married_or_three_bonds' },
        { id: 's3', label: 'A married household with three close bonds', check: 'married_and_three_bonds' }
      ]
    },
    {
      id: 'g_ambition',
      label: S.ambition === 'global_passport'
        ? 'Establish Legal Residency or Second Passport Abroad'
        : S.ambition === 'entrepreneur'
        ? 'Launch a Profitable Company Employing a Team'
        : S.ambition === 'family_dynasty'
        ? 'Raise Thriving Children & Build Generational Estate Assets'
        : S.ambition==='balanced'?'Reach Education, Work, Home & Trusted Circle Goals':'Accumulate 6× Annual National Salary in Net Worth',
      done: false,
      stages: ambitionStages
    }
  ];
}

/* v2.12 item 1 — spendable money: cash in hand plus savings. A save goal
   is measured against this live number, never a stored snapshot, so the
   goal can never go stale when the player earns or spends. */
export function liquidFundsLocal(S) {
  if (!S || !S.money) return 0;
  return Math.max(0, (S.money.cash || 0) + (S.money.savings || 0));
}

/* v2.12 item 1 — save-for-this / set-a-goal. A listing the player cannot
   afford is a plan, not a dead row: saving toward it is a staged goal in
   the SAME S.goals array the Timeline renders (the v2.10 staged system —
   no second goal system). `target` is in the player's own currency.
   `deposit` goals save the down payment that unlocks the purchase;
   full goals save the whole listing price. Stages are the v2.10 shape
   (label + check key); goalStageProgress evaluates the check keys
   against live liquid funds, and refreshGoalsProgress marks the goal
   done when the money is saved. */
export function createSaveGoal(S, { kind, refId, label, target, deposit = false } = {}) {
  if (!S || !Array.isArray(S.goals)) return { ok: false, msg: 'Goals are not available yet.' };
  const targetAmt = Math.max(0, Math.round(Number(target) || 0));
  if (targetAmt <= 0) return { ok: false, msg: 'That listing has no price to save toward.' };
  const id = `g_save_${deposit ? 'deposit_' : ''}${kind}_${refId}`;
  const existing = S.goals.find(g => g.id === id);
  if (existing) {
    return { ok: false, msg: existing.done ? `You already saved enough for ${label}.` : `You are already saving for ${label} — track it under Life Goals on the Timeline tab.` };
  }
  const goal = {
    id,
    kind: 'save_property',
    saveKind: kind, // 'compound' | 'land'
    saveRef: refId,
    label: deposit ? `Save the deposit for ${label}` : `Save for ${label}`,
    target: targetAmt,
    done: false,
    stages: [
      { id: 's1', label: `Save a quarter of ${formatMoney(targetAmt, S.country)}`, check: 'save_quarter' },
      { id: 's2', label: `Save half of ${formatMoney(targetAmt, S.country)}`, check: 'save_half' },
      { id: 's3', label: `Save the full ${formatMoney(targetAmt, S.country)}`, check: 'save_full' }
    ]
  };
  S.goals.push(goal);
  recordJournal(S, `Set a goal: save ${formatMoney(targetAmt, S.country)} for ${label}.`, 'money');
  return { ok: true, msg: `Goal set: save ${formatMoney(targetAmt, S.country)} for ${label}. Track it under Life Goals on the Timeline tab.`, goal };
}

/* A named person whose gender the game knows is "he" or "she", never "they". Only fixed phrases about one person are rewritten, and only when exactly one known person (not the player) is named in the line, so a sentence about two people is left alone. */
const PRONOUN_PHRASES = [
  [/\blost their job\b/g, (g) => `lost ${g.pos} job`],
  [/\btheir dream job\b/g, (g) => `${g.pos} dream job`],
  [/\bannounced their engagement\b/g, (g) => `announced ${g.pos} engagement`],
  [/\bthat their marriage\b/g, (g) => `that ${g.pos} marriage`],
  [/\bgodparent to their child\b/g, (g) => `godparent to ${g.pos} child`],
  [/\bleft their parents' home\b/g, (g) => `left ${g.pos} parents' home`],
  [/\bthat they are engaged\b/g, (g) => `that ${g.sub} is engaged`],
  [/\bso they could\b/g, (g) => `so ${g.sub} could`],
  [/\bthey paid\b/g, (g) => `${g.sub} paid`],
  [/\bfriend of theirs\b/g, (g) => `friend of ${g.sub === 'she' ? 'hers' : 'his'}`],
  [/\bhoping they would not mind\b/g, (g) => `hoping ${g.sub} would not mind`],
  [/\bvouch for their work\b/g, (g) => `vouch for ${g.pos} work`],
  [/\bif they are sure\b/g, (g) => `if ${g.sub} is sure`],
  [/\bare they sure\b/g, (g) => `is ${g.sub} sure`],
  [/\bwish they were staying\b/g, (g) => `wish ${g.sub} were staying`],
  [/\bthey stopped calling\b/g, (g) => `${g.sub} stopped calling`],
  [/\bnow they are a stranger\b/g, (g) => `now ${g.sub} is a stranger`],
  [/\band they are good\b/g, (g) => `and ${g.sub} is good`],
  [/\bhas their eye\b/g, (g) => `has ${g.pos} eye`],
  [/\bwelcomed their partner\b/g, (g) => `welcomed ${g.pos} partner`],
  [/\bknocked on their door\b/g, (g) => `knocked on ${g.pos} door`],
  [/\b(helped|thanked|stood by|stood beside|visit|took|asked|embraced|told|congratulated|talked|referred|threw|called) them\b/g, (g, m, v) => `${v} ${g.obj}`]
];
function pronounizeJournal(S, text) {
  if (!/\b(their|them|they)\b/.test(text) || !S?.people) return text;
  let hit = null; const names = new Set(), genders = new Set();
  for (const p of Object.values(S.people)) {
    if (!p || p.id === 'player' || p.role === 'player' || !p.firstName) continue;
    if (!new RegExp(`(^|[^A-Za-z])${p.firstName.replace(/[^A-Za-z]/g, '')}([^A-Za-z]|$)`).test(text)) continue;
    names.add(p.firstName); genders.add(p.gender); hit = p;
  }
  /* two people who share one first name and one gender still name one person in the sentence */
  if (names.size !== 1 || genders.size !== 1 || (hit.gender !== 'f' && hit.gender !== 'm')) return text;
  const g = hit.gender === 'f' ? { sub: 'she', obj: 'her', pos: 'her' } : { sub: 'he', obj: 'him', pos: 'his' };
  let out = text;
  for (const [re, fn] of PRONOUN_PHRASES) out = out.replace(re, (m, ...a) => fn(g, m, ...a));
  return out;
}
export function recordJournal(S, text, category = 'life', meta = {}) {
  if (!S || !text) return;
  const clean = pronounizeJournal(S, String(text).trim());
  if (!clean) return;
  S.journal.unshift({
    id: nextId(S, 'j'),
    turn: S.turn,
    year: S.year,
    month: S.pacing === 'monthly' ? S.month : null,
    age: S.player ? S.player.age : 0,
    category, // milestone | relationship | career | money | visa | health | world
    text: clean,
    ...meta
  });
  if (S.journal.length > 350) S.journal.length = 350;
}

/* v2.12 — journal reactions. A reaction is data on the entry itself
   (entry.reaction), so it survives save/load like the entry does. Only the
   three plain-word reactions exist; anything else is refused, never stored.
   Clicking the same reaction again clears it. */
export const JOURNAL_REACTIONS = ['Cherish', 'Proud', 'Regret'];

export function setJournalReaction(S, entryId, reaction) {
  if (!S || !Array.isArray(S.journal)) return { ok: false, msg: 'No journal to react to.' };
  if (!JOURNAL_REACTIONS.includes(reaction)) return { ok: false, msg: 'That is not a reaction you can leave here.' };
  const entry = S.journal.find(e => e && e.id === entryId);
  if (!entry) return { ok: false, msg: 'That journal moment is no longer there.' };
  if (entry.reaction === reaction) {
    delete entry.reaction;
    return { ok: true, msg: 'Reaction removed.' };
  }
  entry.reaction = reaction;
  return { ok: true, msg: `You marked this moment: ${reaction}.` };
}

/* One audited ledger line for ANY balance change. `account` names whose balance
   moved ('cash' | 'savings' | 'card' | 'bnpl' | 'loan' | 'gold' | 'fx'); `delta`
   is the change in that account's balance. Summing lines with account === 'cash'
   reconciles exactly to the cash movement — other accounts are audit, not cash. */
export function recordLedgerEntry(S, delta, label, category = 'general', account = 'cash', balanceAfter = null) {
  if (!S || !Array.isArray(S.ledger)) return;
  const d = Math.round((Number(delta) || 0) * 100) / 100;
  if (d === 0) return;
  const cObj = getCountry(S.country);
  S.ledger.unshift({
    id: nextId(S, 'tx'),
    year: S.year,
    month: S.month,
    age: S.player ? S.player.age : 0,
    label: String(label || (d > 0 ? 'Income received' : 'Payment')),
    category,
    account,
    delta: d,
    balanceAfter: balanceAfter == null ? S.money.cash : balanceAfter,
    currency: cObj.currency
  });
  if (S.ledger.length > 400) S.ledger.length = 400;
}

/* Move money in ANY account through the ledger — the only function allowed to
   assign S.money.savings (cash still goes through walletMove below). Returns
   the amount actually applied. */
export function moveBalance(S, account, delta, label, category = 'general') {
  if (!S) return 0;
  if (account === 'cash') {
    const before = S.money.cash;
    walletMove(S, delta, label, category);
    return Math.round((S.money.cash - before) * 100) / 100;
  }
  if (account === 'savings') {
    const d = Math.round((Number(delta) || 0) * 100) / 100;
    const before = Number(S.money.savings) || 0;
    let after = Math.round((before + d) * 100) / 100;
    if (after < 0) after = 0; // savings never goes negative; the shortfall is not applied
    S.money.savings = after;
    const applied = Math.round((after - before) * 100) / 100;
    recordLedgerEntry(S, applied, label, category, 'savings', after);
    return applied;
  }
  return 0;
}

/* Single canonical cash movement primitive — minors NEVER go into negative debt! */
export function walletMove(S, deltaLocal, label, category = 'general') {
  if (!S) return false;
  const delta = Math.round((Number(deltaLocal) || 0) * 100) / 100;
  if (delta === 0) return true;

  /* Invariant D1: Under-18 minors cannot accumulate negative adult cash debt */
  const isMinor = (S.player?.age ?? 0) < 18;
  const before = S.money.cash;
  let after = Math.round((before + delta) * 100) / 100;
  if (isMinor && after < 0) {
    after = 0;
  }
  S.money.cash = after;
  const actualDelta = Math.round((after - before) * 100) / 100;
  recordLedgerEntry(S, actualDelta, label, category, 'cash', after);
  return true;
}

export function computeNetWorthLocal(S) {
  if (!S) return 0;
  let total = playerDepositValue(S)+(Number(S.money.cash) || 0) + (Number(S.money.savings) || 0);
  total-=Math.max(0,Number(S.housing?.playerLease?.rentArrears)||0);
  for(const r of S.money.personalReceivables||[])if(r.status==='open'&&S.people[r.personId]?.alive)total+=convertCurrency(r.balance,r.country,S.country,S.year);
  const circle=S.gamiya;if(circle?.active&&Number.isFinite(circle.paidTotal))total+=circle.receivedPot?-(Math.max(0,circle.totalMonths-circle.currentMonth)*circle.monthlyContribution+(circle.arrears||0)):circle.paidTotal;
  const pen=S.career?.market?.pension;if(pen)total+=Math.max(0,Number(pen.pot)||0)+Math.max(0,Number(pen.paidOut?.remaining)||0);
  for (const cd of S.money.certificates) {
    total += Number(cd.principal) || 0;
  }
  for (const inv of (S.investments || [])) {
    total += Math.max(0, Number(inv.valueLocal) || 0);
  }
  if ((S.money.goldGrams21k || 0) > 0) {
    /* v2.9 B10: value gold at the LIVE price — the same computation
       tickMegaSystemsMonthly uses for S.money._lastGoldUnitPrice — so a
       child on the yearly path (which never sets the cache) is valued at
       its real value before their first monthly tick. The cache survives
       only as a fallback for a state whose country/year can't price. */
    const liveGold = goldPricePerGram(S.country, S.year, 21);
    const unitPrice = (Number.isFinite(liveGold) && liveGold > 0)
      ? liveGold
      : Number(S.money._lastGoldUnitPrice || 0);
    total += unitPrice * S.money.goldGrams21k;
  }
  if (S.legal.blockedAccount) {
    const a=S.legal.blockedAccount;total+=convertCurrency(Number(a.balanceLocal)||0,a.country||S.country,S.country,S.year);
  }
  for (const prop of S.housing.properties) {
    /* GAME DESIGN: the unaccrued mark-up of an instalment plan is a future cost paid through the instalments, not a debt today. installmentMarkupShare (set at purchase, 0 on old saves) is its share of the remaining balance. */
    const equity = (Number(prop.valueLocal) || 0) - Math.max(0,Number(prop.installmentRemaining)||0) * (1 - Math.min(0.9, Math.max(0, Number(prop.installmentMarkupShare) || 0)));
    total += equity;
  }
  for (const land of (S.housing.lands || [])) {
    total += Math.max(0, Number(land.valueLocal || land.nativeValue || 0));
  }
  for (const car of S.cars) {
    total += Math.max(0, Number(car.valueLocal) || 0);
  }
  for (const item of (S.inventory || [])) {
    if (item.appreciates) total += Math.max(0, Number(item.valueLocal) || 0);
  }
  for (const loan of S.money.loans) {
    total -= Math.max(0, Number(loan.balance) || 0);
  }
  /* The stake you own in the family company (service shares or inheritance) is yours; siblings' and parents' stakes are not, so nothing is counted twice. */
  { const ff = S.familyFortune; if (ff && ff.own && ff.company && !ff.company.sold) total += Math.max(0, Math.round((Number(ff.companyLocal) || 0) * (Number(ff.own.player) || 0) / 100)); }
  const businesses = S.career?.businesses?.length ? S.career.businesses : S.career?.business ? [S.career.business] : [];
  const seenBusinesses = new Set();
  for (const biz of businesses) {
    if (!biz || seenBusinesses.has(biz.id)) continue;
    seenBusinesses.add(biz.id);
    total += convertCurrency(ownedCompanyNetValue(biz,businessValuation({...biz,equityOwned:100})),biz.figuresCurrency||biz.country||S.country,S.country,S.year);
  }
  for(const t of S.companyTrusts||[]){if(t.status!=='active')continue;const fraction=t.beneficiaries.filter(x=>x.personId==='player').reduce((n,x)=>n+x.fraction,0);total+=convertCurrency((ownedCompanyNetValue(t.company,businessValuation({...t.company,equityOwned:100}))+t.cash-(t.estateDebt||0))*fraction,t.currency,S.country,S.year);}
  for(const order of S.marriage?.divorceOrders||[])if(order.payer==='player')total-=convertCurrency(Math.max(0,order.arrears||0),order.country,S.country,S.year);
  for (const cc of (S.creditCards || [])) {
    total -= Math.max(0, Number(cc.balance) || 0);
  }
  for(const plan of S.bnplPlans||[])total-=Math.max(0,Number(plan.balanceRemaining??plan.monthlyPay*plan.monthsLeft)||0);
  return Math.round(total);
}

/* ============================================================================
   ONE COUPLE RECORD — the single source of truth for courtship, engagement,
   wedding, residence, mahr and divorce. Every other marriage view
   (S.marriage.status / .engagement / .contracts[], S.relations.*Ids) is
   derived from couples[] by syncCoupleToLegacy() and must never be written
   directly by engine code.
   ========================================================================== */

const COUPLE_STAGE_UNIONS = new Set(['dating', 'engagement', 'cohabitation']);
const COUPLE_OWN_PATH_UNIONS = new Set(['remarriage_divorce', 'remarriage_widowhood', 'polygamy']);

function eraBandForYear(year) {
  const y = Number(year) || 2026;
  if (y < 1970) return '1960s';
  if (y < 1980) return '1970s';
  if (y < 1990) return '1980s';
  if (y < 2000) return '1990s';
  if (y < 2010) return '2000s';
  if (y < 2020) return '2010s';
  return '2020s';
}

/* Read a recognised-unions list out of a marriage profile, whatever shape the
   profile is in: the flat table's `recognizedUnions` array, the 7875 leaf
   shape `legal.recognizedUnions.v`, or an era override. Returns null when the
   profile carries no list at all (the data worker is still filling it). */
export function readRecognizedUnions(profile, year) {
  if (!profile || typeof profile !== 'object') return null;
  if (Array.isArray(profile.recognizedUnions)) return profile.recognizedUnions;
  const leaf = profile.legal && profile.legal.recognizedUnions;
  if (Array.isArray(leaf)) return leaf;
  if (leaf && Array.isArray(leaf.v)) return leaf.v;
  const eras = profile.eras;
  if (eras && typeof eras === 'object') {
    const era = eras[eraBandForYear(year)] || {};
    const eLeaf = era.legal && era.legal.recognizedUnions;
    if (Array.isArray(eLeaf)) return eLeaf;
    if (eLeaf && Array.isArray(eLeaf.v)) return eLeaf.v;
    const cLeaf = profile.common && profile.common.legal && profile.common.legal.recognizedUnions;
    if (Array.isArray(cLeaf)) return cLeaf;
    if (cLeaf && Array.isArray(cLeaf.v)) return cLeaf.v;
  }
  return null;
}

function readCivilUnionNonMuslimOnly(profile, year) {
  if (!profile || typeof profile !== 'object') return false;
  if (profile.civilUnionNonMuslimOnly === true) return true;
  const leaf = profile.legal && profile.legal.civilUnionNonMuslimOnly;
  if (leaf === true) return true;
  if (leaf && leaf.v === true) return true;
  const eras = profile.eras;
  if (eras && typeof eras === 'object') {
    const era = eras[eraBandForYear(year)] || {};
    const eLeaf = era.legal && era.legal.civilUnionNonMuslimOnly;
    if (eLeaf === true) return true;
    if (eLeaf && eLeaf.v === true) return true;
  }
  return false;
}

function personFaith(person) {
  const f = String((person && (person.faith || person.religion)) || '').toLowerCase().trim();
  return f;
}

/* Default union type for a new couple when the caller gives none — ported from
   v86.63 `_wlMarriageDefaultUnionType` (js/08j:971). Take the country's own
   profile list of recognised unions, in the profile's own order. Throw out
   stage unions (dating, engagement, cohabitation) and unions that have their
   own paths (remarriage, polygamy). Of what is left, the first one wins —
   with one exception: if "civil" is a candidate and the profile says the
   civil union is only for non-Muslims, civil is skipped when either partner's
   recorded faith is Muslim, and the next candidate wins; if neither partner
   is recorded as Muslim (including faith simply not recorded), civil is
   allowed. A caller-given union type always beats this default. If the
   profile has no list at all, fall back to "civil".
   NO country name appears here — the profile decides.
   INTERIM FALLBACK (until the data worker lands recognizedUnions on the flat
   profiles): build a candidate list from the flat profile's own signals —
   a civil-expat-marriage year means civil exists (and, where the profile
   also records mahr, is the non-Muslim route); mahr/polygamy means a
   religious union exists; otherwise civil. This fallback is profile-driven
   only, and the harness verifies both the list path and this path. */
export function deriveUnionType(profile, pa, pb, year = 2026) {
  let recognised = readRecognizedUnions(profile, year);
  let civilNonMuslimOnly = readCivilUnionNonMuslimOnly(profile, year);
  if (!Array.isArray(recognised) || recognised.length === 0) {
    if (profile && typeof profile === 'object') {
      const cands = [];
      if (profile.civilExpatMarriageFromYear && Number(year) >= Number(profile.civilExpatMarriageFromYear)) {
        cands.push('civil');
        civilNonMuslimOnly = true;
      }
      if (profile.hasMahr || profile.polygamyAllowedForMuslimMen) cands.push('religious');
      recognised = cands.length ? cands : ['civil'];
    } else {
      return 'civil';
    }
  }
  const candidates = [];
  for (const u of recognised) {
    if (COUPLE_STAGE_UNIONS.has(u) || COUPLE_OWN_PATH_UNIONS.has(u)) continue;
    candidates.push(u);
  }
  if (candidates.length === 0) return 'civil';
  if (candidates.includes('civil')) {
    if (civilNonMuslimOnly) {
      const fa = personFaith(pa);
      const fb = personFaith(pb);
      if (fa !== 'muslim' && fa !== 'islam' && fb !== 'muslim' && fb !== 'islam') return 'civil';
    } else {
      return 'civil';
    }
  }
  for (const u of candidates) {
    if (u !== 'civil') return u;
  }
  return 'civil';
}

export function newCoupleRecord(S, playerId, spouseId, opts = {}) {
  const now = { year: S.year, month: S.month };
  return {
    id: opts.id || nextId(S, 'cpl'),
    partners: [playerId, spouseId],
    unionType: opts.unionType || 'civil',
    stage: opts.stage || 'dating', // dating | engaged | married | divorced | widowed
    stageSince: { year: now.year, month: now.month },
    stageHistory: [{ stage: opts.stage || 'dating', year: now.year, month: now.month }],
    contractId: opts.contractId || null,
    country: opts.country || S.country,
    year: S.year,
    geography: {
      a: { country: opts.country || S.country, city: S.city, residency: null, visa: null },
      b: { country: opts.country || S.country, city: S.city, residency: null, visa: null },
      // ONE shared spouse-relocation plan: route -> documents -> visa -> arrival.
      plan: {
        liveCountry: opts.country || S.country,
        liveCity: S.city,
        whoMoves: null,       // 'player_only' | 'household' | 'spouse_to_player'
        when: null,
        status: 'none',       // none | planned | documents | visa_pending | visa_granted | arrived | separated
        route: null,          // study | gulf | skilled | golden | family_reunion | return_home
        documents: [],
        visa: { kind: null, feeCharged: false, granted: false },
        feeCharged: false,    // the relocation fee is charged ONCE per plan
        feeAmount: 0,
        reason: null
      }
    },
    money: {
      regime: opts.regime || null,
      prenupSigned: !!opts.prenupSigned,
      mahrPrompt: opts.mahrPrompt || 0,
      mahrPromptPaid: opts.mahrPromptPaid || 0,
      mahrDeferred: opts.mahrDeferred || 0,
      mahrDeferredPaid: opts.mahrDeferredPaid || 0,
      shabkaGrams: opts.shabkaGrams || 0,
      qaimaSigned: !!opts.qaimaSigned,
      qaimaValueLocal: opts.qaimaValueLocal || 0
    },
    children: [],
    timeline: [],
    polygamy: { allowed: false, existingSpouseLearned: false, reaction: null }
  };
}

export function getActiveCouples(S) {
  if (!S || !S.marriage || !Array.isArray(S.marriage.couples)) return [];
  return S.marriage.couples.filter(c => c && (c.stage === 'dating' || c.stage === 'engaged' || c.stage === 'married'));
}

export function getCoupleForSpouse(S, spouseId) {
  if (!S || !spouseId || !S.marriage || !Array.isArray(S.marriage.couples)) return null;
  return S.marriage.couples.find(c =>
    c && c.partners && c.partners.includes(spouseId) &&
    (c.stage === 'dating' || c.stage === 'engaged' || c.stage === 'married')
  ) || null;
}

export function getCoupleForPartner(S, partnerId) {
  return getCoupleForSpouse(S, partnerId);
}

export function setCoupleStage(S, couple, stage) {
  if (!couple) return;
  couple.stage = stage;
  couple.stageSince = { year: S.year, month: S.month };
  if (!Array.isArray(couple.stageHistory)) couple.stageHistory = [];
  couple.stageHistory.push({ stage, year: S.year, month: S.month });
}

/* Push one couple's truth into the legacy views (status, engagement,
   contracts[], relations.*Ids) so older UI and tests keep reading correct
   values while the couple record stays the only writer. Idempotent. */
export function syncCoupleToLegacy(S, couple) {
  if (!S || !couple) return;
  if (!S.marriage) return;
  if (!Array.isArray(S.marriage.contracts)) S.marriage.contracts = [];
  const spouseId = couple.partners.find(id => id !== 'player') || couple.partners[1];
  const spouse = spouseId ? S.people[spouseId] : null;
  const active = couple.stage === 'married';
  const engaged = couple.stage === 'engaged';
  const dating = couple.stage === 'dating';

  if (active) {
    if (!S.relations.spouseIds.includes(spouseId)) S.relations.spouseIds.push(spouseId);
    S.relations.exSpouseIds = S.relations.exSpouseIds.filter(id => id !== spouseId);
    if (S.relations.widowedSpouseIds) S.relations.widowedSpouseIds = S.relations.widowedSpouseIds.filter(id => id !== spouseId);
    if (S.relations.partnerId === spouseId) S.relations.partnerId = null;
    S.marriage.status = 'married';
    S.marriage.engagement = null;
  } else if (engaged) {
    S.relations.partnerId = spouseId;
    if (S.relations.spouseIds.length === 0) S.marriage.status = 'engaged';
    // Keep the flat engagement view (still read by the marriage tab) in sync.
    const prev = S.marriage.engagement || {};
    S.marriage.engagement = {
      partnerId: spouseId,
      startedYear: prev.startedYear || couple.year || S.year,
      tier: prev.tier || 'standard',
      shabkaGrams: couple.money.shabkaGrams || 0,
      mahrPrompt: couple.money.mahrPrompt || 0,
      mahrDeferred: couple.money.mahrDeferred || 0,
      qaimaSigned: !!couple.money.qaimaSigned,
      qaimaValueLocal: couple.money.qaimaValueLocal || 0,
      prenupSigned: !!couple.money.prenupSigned,
      medicalCleared: prev.medicalCleared !== false,
      permitCleared: prev.permitCleared !== false,
      venueId: prev.venueId || null,
      housingReady: !!prev.housingReady
    };
  } else if (dating) {
    S.relations.partnerId = spouseId;
    if (S.relations.spouseIds.length === 0) S.marriage.status = 'dating';
  }

  if (couple.stage === 'married' || couple.stage === 'divorced' || couple.stage === 'widowed') {
    let contract = S.marriage.contracts.find(c => c.id === couple.contractId) ||
      S.marriage.contracts.find(c => c.spouseId === spouseId && c.active);
    if (!contract) {
      contract = {
        id: couple.contractId || nextId(S, 'mc'),
        spouseId,
        spouseName: spouse ? spouse.fullName : '',
        country: couple.country || S.country,
        year: (couple.stage === 'married' && couple.stageSince?.year) || couple.year || S.year, /* the year of the wedding, not the year you met */
        venueLabel: '',
        mahrPrompt: 0,
        mahrDeferred: 0,
        shabkaGrams: 0,
        qaimaSigned: false,
        qaimaValueLocal: 0,
        prenupSigned: false,
        active: true
      };
      couple.contractId = contract.id;
      S.marriage.contracts.push(contract);
    }
    contract.spouseName = spouse ? spouse.fullName : contract.spouseName;
    contract.country = couple.country || contract.country;
    contract.mahrPrompt = couple.money.mahrPrompt || 0;
    contract.mahrPromptPaid = couple.money.mahrPromptPaid || 0;
    contract.mahrDeferred = couple.money.mahrDeferred || 0;
    contract.mahrDeferredPaid = couple.money.mahrDeferredPaid || 0;
    contract.shabkaGrams = couple.money.shabkaGrams || 0;
    contract.qaimaSigned = !!couple.money.qaimaSigned;
    contract.qaimaValueLocal = couple.money.qaimaValueLocal || 0;
    contract.prenupSigned = !!couple.money.prenupSigned;
    contract.unionType = couple.unionType;
    contract.active = active;
    if (!active) {
      contract.endedYear = S.year;
      contract.endedReason = couple.stage;
    }
  }
}

/* Close a couple (divorce or widowhood): stage, legacy lists, status.
   Divorce/widowhood settle ONLY the owed remainder — callers must have
   already settled mahr via the couple's money fields before calling this. */
export function closeCouple(S, couple, endedReason) {
  if (!S || !couple) return;
  const spouseId = couple.partners.find(id => id !== 'player') || couple.partners[1];
  const spouse = spouseId ? S.people[spouseId] : null;
  setCoupleStage(S, couple, endedReason === 'widowed' ? 'widowed' : 'divorced');
  S.relations.spouseIds = S.relations.spouseIds.filter(id => id !== spouseId);
  if (S.relations.partnerId === spouseId) S.relations.partnerId = null;
  if (endedReason === 'widowed') {
    if (!Array.isArray(S.relations.widowedSpouseIds)) S.relations.widowedSpouseIds = [];
    if (!S.relations.widowedSpouseIds.includes(spouseId)) S.relations.widowedSpouseIds.push(spouseId);
  } else {
    if (!S.relations.exSpouseIds.includes(spouseId)) S.relations.exSpouseIds.push(spouseId);
  }
  if (spouse) {
    spouse.role = endedReason === 'widowed' ? 'widowed_spouse' : 'ex_spouse';
    spouse.relationLabel = endedReason === 'widowed' ? 'Late Spouse' : 'Ex-Spouse';
  }
  if (S.relations.spouseIds.length === 0) {
    S.marriage.status = endedReason === 'widowed' ? 'widowed' : 'divorced';
    S.marriage.tryingForBaby = false;
    if (endedReason === 'widowed') S.marriage.pregnancy = null;
  }
  syncCoupleToLegacy(S, couple);
}

/* Build couple records from the legacy parallel records on load (defensive:
   never duplicates, never drops a marriage, never resurrects an ended one).
   A wrongly-stamped legacy union type is corrected when the profile's
   recognised list does not contain it (same rule as v86.63 load migration). */
export function migrateMarriageToCouples(S) {
  if (!S || !S.marriage) return;
  if (!Array.isArray(S.marriage.couples)) S.marriage.couples = [];
  if (!Array.isArray(S.marriage.contracts)) S.marriage.contracts = [];
  if (!Array.isArray(S.relations.widowedSpouseIds)) S.relations.widowedSpouseIds = [];

  const bySpouse = new Map();
  for (const c of S.marriage.couples) {
    const sid = c && c.partners && (c.partners.find(id => id !== 'player') || c.partners[1]);
    if (sid) bySpouse.set(sid, c);
  }
  const deriveFor = (countryId, year, spouseId) => {
    try {
      const prof = getMarriageProfile(countryId, year);
      const spouse = spouseId ? S.people[spouseId] : null;
      return deriveUnionType(prof, S.player, spouse, year);
    } catch (_) {
      return 'civil';
    }
  };

  // 1. One couple per contract (married, or ended — ended ones stay ended).
  for (const contract of S.marriage.contracts) {
    if (!contract || !contract.spouseId) continue;
    if (bySpouse.has(contract.spouseId)) {
      const existing = bySpouse.get(contract.spouseId);
      existing.contractId = contract.id;
      if (contract.unionType) existing.unionType = contract.unionType;
      continue;
    }
    const ended = contract.active === false;
    const couple = newCoupleRecord(S, 'player', contract.spouseId, {
      id: nextId(S, 'cpl'),
      contractId: contract.id,
      country: contract.country || S.country,
      stage: ended ? (contract.endedReason === 'widowed' ? 'widowed' : 'divorced') : 'married',
      unionType: contract.unionType || deriveFor(contract.country || S.country, contract.year || S.year, contract.spouseId),
      mahrPrompt: contract.mahrPrompt || 0,
      mahrDeferred: contract.mahrDeferred || 0,
      shabkaGrams: contract.shabkaGrams || 0,
      qaimaSigned: !!contract.qaimaSigned,
      qaimaValueLocal: contract.qaimaValueLocal || 0,
      prenupSigned: !!contract.prenupSigned,
      regime: null
    });
    // A legacy stamp the profile does not recognise is corrected, not kept.
    if (!contract.unionType) {
      couple.unionType = deriveFor(contract.country || S.country, contract.year || S.year, contract.spouseId);
    }
    S.marriage.couples.push(couple);
    bySpouse.set(contract.spouseId, couple);
  }

  // 2. One couple per live engagement (no contract yet).
  const eng = S.marriage.engagement;
  if (eng && eng.partnerId && !bySpouse.has(eng.partnerId)) {
    const couple = newCoupleRecord(S, 'player', eng.partnerId, {
      stage: 'engaged',
      unionType: deriveFor(S.country, S.year, eng.partnerId),
      mahrPrompt: eng.mahrPrompt || 0,
      mahrDeferred: eng.mahrDeferred || 0,
      shabkaGrams: eng.shabkaGrams || 0,
      qaimaSigned: !!eng.qaimaSigned,
      qaimaValueLocal: eng.qaimaValueLocal || 0,
      prenupSigned: !!eng.prenupSigned
    });
    S.marriage.couples.push(couple);
    bySpouse.set(eng.partnerId, couple);
  }

  // 3. One couple per live spouse with no contract/engagement (legacy spouse).
  for (const sid of (S.relations.spouseIds || [])) {
    if (!bySpouse.has(sid)) {
      const couple = newCoupleRecord(S, 'player', sid, {
        stage: 'married',
        unionType: deriveFor(S.country, S.year, sid)
      });
      S.marriage.couples.push(couple);
      bySpouse.set(sid, couple);
    }
  }

  // 4. One couple per live dating partner with no record yet.
  const pid = S.relations.partnerId;
  if (pid && S.people[pid] && S.people[pid].alive && !bySpouse.has(pid)) {
    const couple = newCoupleRecord(S, 'player', pid, {
      stage: S.marriage.status === 'engaged' ? 'engaged' : 'dating',
      unionType: deriveFor(S.country, S.year, pid)
    });
    S.marriage.couples.push(couple);
    bySpouse.set(pid, couple);
  }

  // 5. Re-sync the legacy views from the couples (repairs drift, keeps one writer).
  for (const couple of S.marriage.couples) {
    if (couple.stage === 'dating' || couple.stage === 'engaged' || couple.stage === 'married') {
      syncCoupleToLegacy(S, couple);
    }
  }
  // Widowed spouses belong on the widowed list, never the ex list.
  for (const wid of (S.relations.widowedSpouseIds || [])) {
    S.relations.exSpouseIds = S.relations.exSpouseIds.filter(id => id !== wid);
  }
}

/* v2.9 B8(a): S.player.career is a MIRROR of the real job (S.career.job),
   never a record of its own. Nothing reads player.career today (0 reads
   in src/ + tests/), but the player IS in S.people and the person shape is
   uniform, so generic person code assumes .career exists — deleting it
   would risk a crash in an unguarded person.career read/write (e.g.
   soulEngine fulfillPromise / interactWithPerson). The mirror is re-synced
   at every commit point (load, turn end, every save), so it can never go
   stale the way the birth-time "Seeking Work" copy did. */
export function syncPlayerCareerMirror(S) {
  if (!S || !S.player || !S.career) return;
  const pc = S.player.career || (S.player.career = {});
  const job = S.career.job;
  const age = S.player.age || 0;
  if (S.career.employed && job) {
    pc.title = job.title || 'Employed';
    pc.employer = job.employer || null;
    pc.track = job.track || null;
    pc.monthlyIncomeLocal = Math.max(0, Number(job.monthlyGross || 0));
    pc.employed = true;
    pc.job = job;
  } else if (S.career.business) {
    pc.title = 'Business Owner';
    pc.employer = S.career.business.name || null;
    pc.track = null;
    pc.monthlyIncomeLocal = 0; // business profit flows via the ledger, not a salary
    pc.employed = false;
    pc.job = null;
  } else {
    const inUni = !!(S.education && S.education.university);
    pc.title = S.career.retired ? 'Retired'
      : age < 5 ? 'Infant / Preschool'
      : age < 12 ? 'Primary School Pupil'
      : age < 18 ? 'Secondary Student'
      : (inUni || age < 22) ? 'University Student'
      : 'Seeking Work';
    pc.employer = null;
    pc.track = null;
    pc.monthlyIncomeLocal = 0;
    pc.employed = false;
    pc.job = null;
  }
  pc.savingsLocal = Math.max(0, Number((S.money && S.money.savings) || 0));
}

export function ensureExtendedState(S) {
  if (!S) return S;
  /* GAME DESIGN (old-save migration): saves made before owner hours were tracked get six months in which no business slides for lack of hours, so loading never punishes a life that was fine when it was saved. Saves with no business are simply marked. New lives carry the flag from birth. */
  if (!S.rules || typeof S.rules !== 'object') S.rules = {};
  if (S.rules.capacity !== true) {
    S.rules.capacity = true;
    if (Array.isArray(S.career?.businesses) && S.career.businesses.length > 0) S.rules.capacityGraceUntil = Number(S.year) * 12 + Number(S.month || 1) + 6;
  }
  // RNG: repair a missing/corrupt stream from the life's own seed (never silent 0.5).
  if (typeof S.rngState !== 'number') {
    S.rngState = hashSeed(S.seed ?? 'world-life-2');
  }
  /* v2.6 mortality stream: lazily (re)derived from the seed in mortRand(),
     so old saves without it still work; initialise it here when possible. */
  if (typeof S.mortalityRng !== 'number') {
    S.mortalityRng = hashSeed(String(S.seed ?? 'world-life-2') + ':mortality');
  }
  // ONE Person directory: the player pointer and the directory entry are one object.
  if (S.player) {
    if (!S.people) S.people = {};
    S.people['player'] = S.player;
  }
  // Refresh only the selected balanced-goal definition, not earned history.
  if(S.ambition==='balanced'&&Array.isArray(S.goals)){
    const goal=S.goals.find(g=>g.id==='g_ambition');
    if(goal&&!goal.balancedDefinition){const def=buildStarterGoals(S).find(g=>g.id==='g_ambition');goal.label=def.label;goal.stages=def.stages;goal.balancedDefinition=1;}
  }
  syncPlayerCareerMirror(S); // v2.9 B8(a): repair a stale birth-time copy on old saves.
  if (!S.relations) S.relations = {};
  if (!Array.isArray(S.relations.widowedSpouseIds)) S.relations.widowedSpouseIds = [];
  if (S.marriage) {
    if (!Array.isArray(S.marriage.couples)) S.marriage.couples = [];
    migrateMarriageToCouples(S);
  }
  if (!S.housing.lands) S.housing.lands = [];
  /* v2.7 savings provenance (backfill for saves made before it existed):
     a balance with no recorded deposits is shown as "saved before this
     record began" in the Banks tab, never silently relabelled. */
  if (S.money) {
    if (S.money.savingsDepositsTotal === undefined) S.money.savingsDepositsTotal = 0;
    if (S.money.savingsWithdrawalsTotal === undefined) S.money.savingsWithdrawalsTotal = 0;
    if (S.money.savingsInterestTotal === undefined) S.money.savingsInterestTotal = 0;
    /* v2.16 W2 — lifetime remittances sent home (helped_family). Old
       saves start at 0: sends before this round were never tracked, and
       the total is recorded going forward, never guessed. */
    if (S.money.remittedHomeEgpTotal === undefined) S.money.remittedHomeEgpTotal = 0;
  }
  /* v2.5 random-events chains: event id -> { turn, year, month } when it
     fired, so a follow-up can check the delay has passed. */
  if (!S.eventFiredTurns) S.eventFiredTurns = {};
  if (!S.housing.staff) S.housing.staff = [];
  if (!S.housing.currentShape) S.housing.currentShape = 'apartment';
  if (!S.drivingLicence) S.drivingLicence = { valid: false, issuedYear: null, expiresYear: null };
  if (!S.inventory) S.inventory = [];
  if (!S.bnplPlans) S.bnplPlans = [];
  if (!S.shopWishlist) S.shopWishlist = []; // v2.12 W6: saved-for-later shop items { id, catalogId, name, priceLocal, addedYear }
  if (!S.tripPlans) S.tripPlans = []; // v2.12 W6: planned trips { id, destId, name, country, costLocal, days, departYear, departMonth, papers, visaNeeded, visaLabel, status }
  if (S.shopLastCompare === undefined) S.shopLastCompare = null; // v2.12 W6: last shop comparison { a, b, cheaperId, year }
  if (S.tripLastCompare === undefined) S.tripLastCompare = null; // v2.12 W6: last destination comparison { a, b, cheaperId, year }
  if (!S.creditCards) S.creditCards = [];
  if (!S.investments) S.investments = [];
  if (!S.credentials) S.credentials = { licenses: [], languageCerts: [], hajjCompleted: false, umrahCount: 0, zakatLastYearPaid: 0 };
  /* v2.6 mortality model: derived records only — no new tracked habits.
     lastCheckupYear feeds cancer staging; agingDebt accumulates fractional
     fitness-slowed decline; cancerHistory tracks remissions (recurrence). */
  if (!S.medical) S.medical = { conditions: [], fertilityScore: 82, healthInsurance: false };
  if (S.medical.lastCheckupYear === undefined) S.medical.lastCheckupYear = null;
  if (S.medical.lastExerciseYear === undefined) S.medical.lastExerciseYear = null;
  if (S.medical.agingDebt === undefined) S.medical.agingDebt = 0;
  if (!S.medical.agingCooldowns) S.medical.agingCooldowns = {};
  if (!Array.isArray(S.medical.cancerHistory)) S.medical.cancerHistory = [];
  if (S.gamiya === undefined) S.gamiya = null;
  if (!S.syndicate) S.syndicate = { registered: false, name: null, joinedYear: null };
  if (!S.postgrad) S.postgrad = { active: null, completed: [] };
  if (!S.creatorChannel) S.creatorChannel = { niche: null, followers: 0, monthlyIncomeLocal: 0 };
  if (!S.skills) {
    S.skills = { charisma: 45, financialIq: 42, fitness: 50, creativity: 44, wasta: 35 };
  }
  if (S.reputation === undefined) S.reputation = 55;
  if (!S.values) {
    S.values = { integrity: 60, familyDevotion: 65, ambitionDrive: 60 };
  }
  if (!S.pets) S.pets = [];
  if (!S.insurance) {
    S.insurance = { health: false, auto: false, home: false, employerHealth: false };
  }
  /* v2.8 — employer health cover flag (W1 §2e): true when the current job's
     country makes the employer insure you (or the public system covers you).
     Old saves have no such key — backfill it without touching the rest. */
  if (S.insurance.employerHealth === undefined) S.insurance.employerHealth = false;
  if (!S.willPlan) {
    S.willPlan = { charityPct: 0, primaryHeirId: null, draftedYear: null };
  }
  if (!S.timeBudget) {
    S.timeBudget = { focus: 'balanced' }; // balanced | career_surge | wellness_longevity | family_harmony | mastery_iq
  }
  if (!Array.isArray(S.telemetryHistory)) {
    S.telemetryHistory = [];
  }
  if (!Array.isArray(S.legal.touristVisas)) {
    S.legal.touristVisas = [];
  }
  for (const pr of (S.housing.properties || [])) {
    if (pr.conditionPct === undefined) pr.conditionPct = 100;
    if (!pr.tenantMode) pr.tenantMode = 'long_term';
  }
  return S;
}

const MONEY_ASK_SCENE_KEYS = new Set(['ev_money_friend_loan', 'ev_friend_asks_loan', 'ev_money_sibling_loan', 'ev_family_sib_borrows_money', 'ev_family_dad_loan_request', 'ev_back_friend_repays_l2', 'ev_friend_borrows_disappears']);
export function queueScene(S, scene, urgent = false) {
  if (!S || !scene || !scene.title || !Array.isArray(scene.choices) || !scene.choices.length) return false;
  const key = scene.key || scene.id || scene.title;
  const baseSig = scene.baseId || scene.title;
  const maxPerLife = scene.maxPerLife ?? (urgent ? 3 : 2);

  if (!S.sceneCounts) S.sceneCounts = {};
  if (!S.titleCounts) S.titleCounts = {}; // v2.6: title -> times queued (D3 anti-spam)
  /* scene.navigation: a pure browse/back/re-entry menu with no reward, charge or journal line of its own. It is exempt from the per-life and per-title caps so the way forward can never be capped away; the active/queue duplicate guard below still applies. */
  const navigation = scene.navigation === true;
  /* scene.recurring: a scene that the career process itself schedules (the yearly review, a formal warning), keyed per year. The per-life and per-title anti-spam caps do not apply: played defect, the cap dropped every review after the third and the third warning. */
  const recurring = scene.recurring === true;
  if (!navigation && !recurring && (S.sceneCounts[baseSig] || 0) >= maxPerLife) return false;

  /* v2.6 anti-spam invariant (the coherence suite's D3 rule): no single
     TITLE may be queued 4+ times in one life, however many repeatable
     events or job-offer bands share that title. Repeatable random events
     allow up to 99 firings per id, so without this the same card ("A Heavy
     Cold", "A Festival in Your Street", "Headhunter & Network Job Leads")
     can legitimately repeat past the defect threshold once lives routinely
     survive to 52+. Urgent life/death milestones are exempt. */
  if (!urgent && !navigation && !recurring) {
    if (!S.titleCounts) S.titleCounts = {};
    if ((S.titleCounts[scene.title] || 0) >= 3) return false;
  }

  /* GAME DESIGN (tuned, not sourced): one money ask from a friend or relative at a time. After any of these ask scenes is queued, no other ask scene is queued for 9 months, so two people never borrow back to back. */
  if (!urgent && (MONEY_ASK_SCENE_KEYS.has(key) || String(key).startsWith('ask_loan_'))) {
    const nowM = (S.year || 0) * 12 + (S.month || 0);
    if (S.lastMoneyAskMonth != null && nowM - S.lastMoneyAskMonth < 9 && nowM >= S.lastMoneyAskMonth) return false;
    S.lastMoneyAskMonth = nowM;
  }

  /* Prevent duplicate identical card in active slot or queue (Fixes D3/D4 permanently!) */
  if (S.activeScene && (S.activeScene.key === key || S.activeScene.title === scene.title)) return false;
  if (S.sceneQueue.some(q => q.key === key || q.title === scene.title)) return false;

  /* Respect cooldowns unless urgent life/death milestone */
  if (!urgent && S.cooldowns[key] && S.turn < S.cooldowns[key]) return false;

  if (!navigation) S.sceneCounts[baseSig] = (S.sceneCounts[baseSig] || 0) + 1;
  if (!urgent && !navigation) {
    if (!S.titleCounts) S.titleCounts = {};
    S.titleCounts[scene.title] = (S.titleCounts[scene.title] || 0) + 1;
  }

  const prepared = {
    ...scene,
    key,
    baseId: baseSig,
    urgent: !!urgent,
    createdTurn: S.turn,
    createdYear: S.year
  };

  if (!S.activeScene) {
    S.activeScene = prepared;
    return true;
  }
  if (urgent && !S.activeScene.urgent) {
    S.sceneQueue.unshift(S.activeScene);
    S.activeScene = prepared;
    return true;
  }
  if (urgent) S.sceneQueue.unshift(prepared);
  else S.sceneQueue.push(prepared);
  return true;
}
