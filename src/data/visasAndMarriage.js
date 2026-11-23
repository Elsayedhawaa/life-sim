/* ============================================================================
   World Life 2.0 — Authentic Bureaucracy, Visas, Gulf Kafala & Marriage Laws
   Covers Student Pipelines (Sperrkonto, CAS, I-20/OPT/H-1B, GIC/PGWP), Gulf
   Sponsorship, Citizenship Rules, and 15-Country Era-Gated Marriage Profiles.
   ========================================================================== */

/* The rich 7875 marriage table lives in megaCareerEduMedical.js; it has no
   imports of its own, so this import cannot cycle. */
import { FULL_MARRIAGE_PROFILES_7875 } from './megaCareerEduMedical.js';

export const GULF_COUNTRIES = ['sau', 'uae'];

export const GULF_SPONSOR_ARCHETYPES = {
  multinational: {
    id: 'multinational',
    label: 'Multinational Regional HQ',
    paysOnTimeChance: 0.99,
    renewsPermitChance: 0.98,
    grantsTransferNocChance: 0.94,
    grantsExitReentryChance: 0.99,
    withholdsPassport: false,
    desc: 'Global HR compliance, medical insurance for dependents, and clean mobility.'
  },
  generous: {
    id: 'generous',
    label: 'Reputable Local Conglomerate',
    paysOnTimeChance: 0.96,
    renewsPermitChance: 0.95,
    grantsTransferNocChance: 0.78,
    grantsExitReentryChance: 0.95,
    withholdsPassport: false,
    desc: 'Respects contracts, pays annual flights, and rewards loyalty.'
  },
  fair: {
    id: 'fair',
    label: 'Standard Private Employer',
    paysOnTimeChance: 0.90,
    renewsPermitChance: 0.90,
    grantsTransferNocChance: 0.60,
    grantsExitReentryChance: 0.86,
    withholdsPassport: false,
    desc: 'Follows labor law reasonably, though paperwork moves slowly.'
  },
  strict: {
    id: 'strict',
    label: 'Strict Traditional Kafeel',
    paysOnTimeChance: 0.84,
    renewsPermitChance: 0.86,
    grantsTransferNocChance: 0.28,
    grantsExitReentryChance: 0.62,
    withholdsPassport: false,
    desc: 'Demands long hours and resists early contract transfers.'
  },
  exploitative: {
    id: 'exploitative',
    label: 'Exploitative Contracting Sponsor',
    paysOnTimeChance: 0.56,
    renewsPermitChance: 0.68,
    grantsTransferNocChance: 0.10,
    grantsExitReentryChance: 0.35,
    withholdsPassport: true,
    desc: 'Delayed wages, contract bait-and-switch risk, and blocked transfers.'
  },
  family_sponsor: {
    id: 'family_sponsor',
    label: 'Relative’s Establishment',
    paysOnTimeChance: 0.88,
    renewsPermitChance: 0.94,
    grantsTransferNocChance: 0.75,
    grantsExitReentryChance: 0.90,
    withholdsPassport: false,
    desc: 'Safe legal cover, mixed with heavy family expectations and blurred boundaries.'
  },
  ghost: {
    id: 'ghost',
    label: '"Free Visa" Paper Sponsor',
    paysOnTimeChance: 0.0,
    renewsPermitChance: 0.45,
    grantsTransferNocChance: 0.70,
    grantsExitReentryChance: 0.75,
    withholdsPassport: false,
    desc: 'Illegal paper sponsorship: no salary paid—you hustle freelance cash work under inspection risk.'
  }
};

export const GULF_ENTRY_CHANNELS = [
  {
    id: 'headhunt',
    label: 'Direct Multinational Headhunt',
    reqDegree: true,
    minExpYears: 3,
    upfrontFeeUsd2026: 0,
    scamRisk: 0.0,
    baseSuccess: 0.34,
    salaryMult: 1.38,
    sponsors: ['multinational', 'generous']
  },
  {
    id: 'internal_transfer',
    label: 'Regional Office Transfer',
    reqEmployed: true,
    minExpYears: 2,
    upfrontFeeUsd2026: 0,
    scamRisk: 0.0,
    baseSuccess: 0.48,
    salaryMult: 1.28,
    sponsors: ['multinational', 'fair']
  },
  {
    id: 'friend_wasta',
    label: 'Expat Friend Referral (Wasta)',
    reqExpatContact: true,
    minExpYears: 0,
    upfrontFeeUsd2026: 0,
    scamRisk: 0.0,
    baseSuccess: 0.68,
    salaryMult: 1.05,
    sponsors: ['fair', 'generous']
  },
  {
    id: 'direct_portal',
    label: 'Direct Online Application',
    reqDegree: false,
    minExpYears: 1,
    upfrontFeeUsd2026: 0,
    scamRisk: 0.02,
    baseSuccess: 0.30,
    salaryMult: 1.00,
    sponsors: ['fair', 'strict', 'generous']
  },
  {
    id: 'agency',
    label: 'Manpower Recruitment Agency',
    reqDegree: false,
    minExpYears: 0,
    upfrontFeeUsd2026: 2600,
    scamRisk: 0.22,
    baseSuccess: 0.64,
    salaryMult: 0.82,
    sponsors: ['strict', 'exploitative', 'fair']
  },
  {
    id: 'free_visa',
    label: '"Free Visa" Broker (High Risk)',
    reqDegree: false,
    minExpYears: 0,
    upfrontFeeUsd2026: 4200,
    scamRisk: 0.35,
    baseSuccess: 0.82,
    salaryMult: 0.0,
    sponsors: ['ghost']
  }
];

export const STUDY_ABROAD_PIPELINES = {
  deu: {
    country: 'deu',
    visaName: 'German National Student Visa (§16b)',
    requirementLabel: 'Sperrkonto (Blocked Account)',
    blockedAccountKind: 'Sperrkonto',
    blockedAmountLocal2026: 11208, // EUR
    monthlyReleaseLocal2026: 934,
    visaFeeUsd2026: 90,
    partTimeWorkAllowed: true,
    postStudyVisaName: '18-Month Job-Seeker Permit',
    postStudyMonths: 18,
    skilledVisaName: 'EU Blue Card / Skilled Worker',
    prYears: 4,
    citizenshipYears: 5
  },
  gbr: {
    country: 'gbr',
    visaName: 'UK Student Route Visa (CAS)',
    requirementLabel: 'CAS + 28-Day Maintenance Funds + IHS',
    blockedAmountLocal2026: 0, // Must hold proof in account, not locked by state, but IHS + visa fee charged
    requiredProofLocal2026: 12006, // GBP
    visaFeeUsd2026: 1650, // Includes IHS healthcare surcharge
    partTimeWorkAllowed: true,
    postStudyVisaName: '2-Year Graduate Route (PSW)',
    postStudyMonths: 24,
    skilledVisaName: 'Skilled Worker Visa (CoS)',
    prYears: 5, // ILR
    citizenshipYears: 6
  },
  usa: {
    country: 'usa',
    visaName: 'US F-1 Student Visa (I-20 & SEVIS)',
    requirementLabel: 'Form I-20 Proof of Funds + 214(b) Embassy Interview',
    blockedAmountLocal2026: 0,
    requiredProofLocal2026: 28000, // USD
    visaFeeUsd2026: 535, // SEVIS $350 + MRV $185
    partTimeWorkAllowed: false, // On-campus only until CPT/OPT
    postStudyVisaName: 'F-1 OPT / STEM OPT',
    postStudyMonths: 12,
    stemPostStudyMonths: 36,
    skilledVisaName: 'H-1B Specialty Occupation (Lottery)',
    h1bLotteryChance: 0.34,
    prYears: 5, // Employer Green Card
    citizenshipYears: 10
  },
  can: {
    country: 'can',
    visaName: 'Canadian Study Permit (LOA + PAL + GIC)',
    requirementLabel: 'Guaranteed Investment Certificate (GIC)',
    blockedAccountKind: 'Canadian GIC',
    blockedAmountLocal2026: 20635, // CAD locked, released over 12 months
    monthlyReleaseLocal2026: 1720,
    visaFeeUsd2026: 210,
    partTimeWorkAllowed: true,
    postStudyVisaName: '3-Year Post-Graduation Work Permit (PGWP)',
    postStudyMonths: 36,
    skilledVisaName: 'Express Entry CRS Skilled Worker',
    prYears: 3,
    citizenshipYears: 6
  },
  che: {
    country: 'che',
    visaName: 'Swiss National Visa D + Residence Permit B (Education)',
    requirementLabel: 'Proof of Funds CHF 21,000/yr (canton-set)',
    blockedAmountLocal2026: 0, // Proof in a Swiss bank account in the student's name, not locked by the state (Zurich/St. Gallen require a Swiss bank)
    requiredProofLocal2026: 21000, // CHF per academic year (Zurich 21,000; Geneva ~24,000; FNIA art. 27 / SEM)
    monthlyReleaseLocal2026: 1750,
    visaFeeUsd2026: 90, // National Visa D fee EUR 90 (Swiss Embassy fee schedule, 1 Apr 2026); VFS notes student applications are generally free of charge for some nationalities
    partTimeWorkAllowed: true, // Max 15 h/week during term, only after 6 months of study; full-time in breaks (SEM)
    postStudyVisaName: '6-Month Job-Seeker Extension (FNIA art. 21(3))',
    postStudyMonths: 6,
    skilledVisaName: 'Swiss Work Permit B (employer-sponsored, quota)',
    prYears: 10, // C settlement permit after 10 years (early C after 5 for well-integrated, FNIA art. 34(4))
    citizenshipYears: 10 // Ordinary naturalisation, Swiss Citizenship Act art. 9; C permit required; dual citizenship allowed
  },
  swe: {
    country: 'swe',
    visaName: 'Swedish Residence Permit for Studies (Migrationsverket)',
    requirementLabel: 'Maintenance Funds SEK 10,656/mo (2026)',
    blockedAmountLocal2026: 0, // Show bank assets / scholarship / sponsor; no locked blocked account (Migrationsverket)
    requiredProofLocal2026: 106560, // SEK 10,656/mo x 10 months (Migrationsverket, applications in 2026)
    monthlyReleaseLocal2026: 10656,
    visaFeeUsd2026: 158, // SEK 1,500 adult application fee (Migrationsverket, 2026) at 9.50 SEK/USD
    partTimeWorkAllowed: true, // Max 15 h/week in term for permits granted on/after 11 Jun 2026; no limit in Jun-Aug
    postStudyVisaName: '12-Month Job-Seeking Residence Permit',
    postStudyMonths: 12, // Up to 12 months after bachelor's/master's; 12-18 months after a PhD
    skilledVisaName: 'Swedish Work Permit (Migrationsverket)',
    prYears: 4, // Permanent residence after 4 years of work permits within 7 years
    citizenshipYears: 8 // From 6 Jun 2026 (Govt Bill 2025/26:175); was 5 before
  },
  tur: {
    country: 'tur',
    visaName: 'Turkish Student Entry Visa + Student Residence Permit',
    requirementLabel: 'Proof of Funds ~$500/mo (bank statement)',
    blockedAmountLocal2026: 0, // No fixed blocked amount; bank statement / scholarship / sponsor letter (Göç İdaresi)
    requiredProofLocal2026: 258000, // TRY: ~$6,000/yr ($500/mo) at 43 TRY/USD (game FX 2026); consulates cite $5,000-7,000/yr
    monthlyReleaseLocal2026: 21500,
    visaFeeUsd2026: 60, // Single-entry student visa $60 (Turkish consulates 2026; $185 for US citizens); residence permit card fee 964 TL on arrival
    partTimeWorkAllowed: true, // Undergraduates after the first year, max 24 h/week with a work permit (Law 6735); postgraduates from year one
    postStudyVisaName: '12-Month Job-Seeking Short-Term Residence Permit',
    postStudyMonths: 12, // One-year permit for graduates of Turkish universities (METU); extendable a further year
    skilledVisaName: 'Turkish Work Permit (Çalışma İzni, employer-sponsored)',
    prYears: 8, // Long-term residence permit after 8 years continuous (Law 6458 art. 42-43; student years count at half)
    citizenshipYears: 5 // Ordinary naturalisation, Law 5901 art. 11; 3 years if married to a Turkish citizen
  }
};

export const SKILLED_MIGRATION_RULES = {
  egy: { prYears: 10, citizenshipNaturalization: false, workVisaName: 'Egyptian Work Permit' },
  sau: { prYears: null, citizenshipNaturalization: false, workVisaName: 'Saudi Work Iqama', premiumResidency2026: 800000 },
  uae: { prYears: null, citizenshipNaturalization: false, workVisaName: 'UAE Employment Residence Visa', goldenVisaStartYear: 2019 },
  gbr: { prYears: 5, citizenshipYears: 6, citizenshipNaturalization: true, workVisaName: 'UK Skilled Worker Visa' },
  usa: { prYears: 5, citizenshipYears: 10, citizenshipNaturalization: true, workVisaName: 'US H-1B / L-1 Visa' },
  deu: { prYears: 4, citizenshipYears: 5, citizenshipNaturalization: true, workVisaName: 'EU Blue Card (Germany)' },
  can: { prYears: 3, citizenshipYears: 6, citizenshipNaturalization: true, workVisaName: 'Canadian Work Permit / Express Entry' },
  aus: { prYears: 4, citizenshipYears: 5, citizenshipNaturalization: true, workVisaName: 'Subclass 482 / 189 Skilled Visa' },
  nld: { prYears: 5, citizenshipYears: 5, citizenshipNaturalization: true, workVisaName: 'Dutch Highly Skilled Migrant (HSM)' },
  fra: { prYears: 5, citizenshipYears: 5, citizenshipNaturalization: true, workVisaName: 'Passeport Talent' },
  jpn: { prYears: 8, citizenshipYears: 10, citizenshipNaturalization: true, workVisaName: 'Engineer / Highly Skilled Professional Visa' },
  ita: { prYears: 5, citizenshipYears: 10, citizenshipNaturalization: true, workVisaName: 'Nulla Osta Lavoro / EU Blue Card' },
  sgp: { prYears: 4, citizenshipYears: 8, citizenshipNaturalization: true, workVisaName: 'Singapore Employment Pass (EP)' },
  bra: { prYears: 4, citizenshipYears: 5, citizenshipNaturalization: true, workVisaName: 'VITEM V Work Visa' },
  ind: { prYears: 7, citizenshipYears: 12, citizenshipNaturalization: true, workVisaName: 'Indian Employment Visa' },
  che: { prYears: 10, citizenshipYears: 10, citizenshipNaturalization: true, workVisaName: 'Swiss Work Permit B (quota, employer-sponsored)' }, // C permit after 10 years (early C after 5 for well-integrated, FNIA art. 34(4)); citizenship 10 years, SCA art. 9
  swe: { prYears: 4, citizenshipYears: 8, citizenshipNaturalization: true, workVisaName: 'Swedish Work Permit (Migrationsverket)' }, // PR after 4 years of work permits within 7; citizenship 8 years from 6 Jun 2026 (Govt Bill 2025/26:175; was 5)
  tur: { prYears: 8, citizenshipYears: 5, citizenshipNaturalization: true, workVisaName: 'Turkish Work Permit (Çalışma İzni, employer-sponsored)' } // Long-term residence after 8 years (Law 6458 art. 42); citizenship 5 years (Law 5901 art. 11; 3 if married to a Turkish citizen)
};

/* ============================================================================
   15-COUNTRY ERA-GATED MARRIAGE, FAMILY & INHERITANCE PROFILES
   ========================================================================== */
export const MARRIAGE_PROFILES = {
  egy: {
    country: 'egy',
    minAgeYearGate: { default: 18, before2008Female: 16 },
    cohabitationLegal: false,
    polygamyAllowedForMuslimMen: true,
    guardianRole: 'traditional_wali_fatiha',
    requiresPremaritalMedical: true,
    medicalScreeningStartYear: 2008,
    mixedMarriagePermitRequired: false,
    hasShabkaGold: true,
    shabkaGramsTiers: { modest: 22, standard: 48, generous: 95 },
    hasMahr: true,
    mahrPrompt2026: { modest: 25000, standard: 75000, generous: 200000 },
    mahrDeferred2026: { modest: 60000, standard: 150000, generous: 400000 },
    hasQaimaList: true, // قائمة المنقولات الزوجية — Bride's furnishings contract enforceable in court
    gehazBrideSharePct: 0.40,
    housingExpectation: 'owned_or_long_lease',
    khulaAvailableFromYear: 2000, // Law No. 1 of 2000
    propertyRegime: 'separate_property_with_qaima',
    inheritanceModel: 'sharia_faraid',
    venues2026: [
      { id: 'family_home', label: 'Family Home Katb Ketab & Dinner', cost: 35000, prestige: 3 },
      { id: 'open_club', label: 'Armed Forces / Sporting Club Open Garden', cost: 145000, prestige: 6 },
      { id: 'nile_ballroom', label: '5-Star Nile Hotel Ballroom', cost: 520000, prestige: 9 }
    ]
  },

  sau: {
    country: 'sau',
    minAgeYearGate: { default: 18, before2019: 16 },
    cohabitationLegal: false,
    polygamyAllowedForMuslimMen: true,
    guardianRole: 'statutory_wali_and_bride_consent', // Codified Royal Decree M/73 (2022)
    requiresPremaritalMedical: true, // Mandatory Saudi premarital genetic/infectious screening (2004+)
    medicalScreeningStartYear: 2004,
    mixedMarriagePermitRequired: true, // Tasreeh Zawaj required for Saudi + non-Saudi
    mixedMarriageMinCitizenAge: 25,
    hasShabkaGold: true,
    shabkaGramsTiers: { modest: 20, standard: 45, generous: 90 },
    hasMahr: true,
    mahrPrompt2026: { modest: 35000, standard: 65000, generous: 130000 }, // SAR
    mahrDeferred2026: { modest: 10000, standard: 25000, generous: 60000 },
    hasQaimaList: false,
    gehazBrideSharePct: 0.0, // Groom furnishes marital home in Saudi custom
    housingExpectation: 'independent_marital_home',
    khulaAvailableFromYear: 1960,
    propertyRegime: 'separate_property',
    inheritanceModel: 'sharia_faraid',
    venues2026: [
      { id: 'family_majlis', label: 'Family Majlis & Istiraha Reception', cost: 28000, prestige: 4 },
      { id: 'qasr_afrah', label: 'Qasr Al-Afrah Wedding Hall (Men & Women Halls)', cost: 85000, prestige: 7 },
      { id: 'riyadh_hotel', label: '5-Star Riyadh / Jeddah Luxury Ballroom', cost: 240000, prestige: 10 }
    ]
  },

  uae: {
    country: 'uae',
    minAgeYearGate: { default: 18 },
    cohabitationLegal: false, // Decriminalized late 2020, civil marriage for non-Muslims from 2022
    cohabitationDecriminalizedYear: 2021,
    civilExpatMarriageFromYear: 2022,
    polygamyAllowedForMuslimMen: true,
    guardianRole: 'statutory_wali_or_civil_expat',
    requiresPremaritalMedical: true,
    medicalScreeningStartYear: 2005,
    mixedMarriagePermitRequired: true, // Emirati marrying foreigner requires court/official approval
    mixedMarriageMinCitizenAge: 23,
    hasShabkaGold: true,
    shabkaGramsTiers: { modest: 20, standard: 50, generous: 100 },
    hasMahr: true,
    mahrPrompt2026: { modest: 20000, standard: 50000, generous: 100000 }, // AED (UAE law caps statutory prompt/deferred ceilings for nationals, though gifts vary)
    mahrDeferred2026: { modest: 30000, standard: 50000, generous: 100000 },
    hasQaimaList: false,
    gehazBrideSharePct: 0.0,
    housingExpectation: 'independent_marital_home',
    khulaAvailableFromYear: 2005,
    propertyRegime: 'separate_property',
    inheritanceModel: 'sharia_or_registered_expat_will',
    venues2026: [
      { id: 'majlis_civil', label: 'Family Majlis / Abu Dhabi Civil Court Ceremony', cost: 18000, prestige: 4 },
      { id: 'marina_hall', label: ' Creek / Corniche Banquet Hall', cost: 95000, prestige: 7 },
      { id: 'palm_ballroom', label: '5-Star Jumeirah / Saadiyat Resort Ballroom', cost: 290000, prestige: 10 }
    ]
  },

  gbr: {
    country: 'gbr',
    minAgeYearGate: { default: 18, before2023WithConsent: 16 },
    cohabitationLegal: true,
    polygamyAllowedForMuslimMen: false,
    guardianRole: 'none',
    requiresPremaritalMedical: false,
    mixedMarriagePermitRequired: false,
    hasShabkaGold: false,
    hasMahr: false,
    hasQaimaList: false,
    prenupEnforceability: 'persuasive_post_2010',
    noFaultDivorceFromYear: 2022, // Divorce, Dissolution and Separation Act 2020 in force 6 Apr 2022
    propertyRegime: 'equitable_needs_sharing',
    inheritanceModel: 'civil_statutory',
    venues2026: [
      { id: 'registry', label: 'Town Hall Registry Office & Pub Dinner', cost: 2800, prestige: 3 },
      { id: 'country_barn', label: 'Countryside Manor / Barn Reception', cost: 19500, prestige: 7 },
      { id: 'mayfair_hotel', label: 'Luxury London / Estate Wedding', cost: 52000, prestige: 9 }
    ]
  },

  usa: {
    country: 'usa',
    minAgeYearGate: { default: 18 },
    cohabitationLegal: true,
    polygamyAllowedForMuslimMen: false,
    guardianRole: 'none',
    requiresPremaritalMedical: false,
    mixedMarriagePermitRequired: false,
    hasShabkaGold: false,
    hasMahr: false,
    hasQaimaList: false,
    prenupEnforceability: 'strong_written_contract',
    noFaultDivorceFromYear: 1970,
    propertyRegime: 'marital_equitable_50_50',
    inheritanceModel: 'civil_statutory',
    venues2026: [
      { id: 'courthouse', label: 'City Courthouse & Intimate Dinner', cost: 3200, prestige: 3 },
      { id: 'garden_venue', label: 'Botanical Garden / Vineyard Venue', cost: 28000, prestige: 7 },
      { id: 'plaza_gala', label: 'Grand Hotel Black-Tie Reception', cost: 78000, prestige: 9 }
    ]
  },

  deu: {
    country: 'deu',
    minAgeYearGate: { default: 18 },
    cohabitationLegal: true,
    polygamyAllowedForMuslimMen: false,
    guardianRole: 'none',
    requiresPremaritalMedical: false,
    mixedMarriagePermitRequired: false,
    hasShabkaGold: false,
    hasMahr: false,
    hasQaimaList: false,
    prenupEnforceability: 'strong_notarized', // Ehevertrag
    noFaultDivorceFromYear: 1977,
    separationMonthsRequired: 12, // Trennungsjahr
    propertyRegime: 'zugewinngemeinschaft', // Community of accrued gains
    inheritanceModel: 'civil_statutory',
    venues2026: [
      { id: 'standesamt', label: 'Standesamt Civil Ceremony & Café', cost: 2600, prestige: 3 },
      { id: 'landgut', label: 'Schloss / Countryside Feier', cost: 18000, prestige: 7 },
      { id: 'grand_schloss', label: 'Historic Castle Weekend Celebration', cost: 45000, prestige: 9 }
    ]
  },

  can: {
    country: 'can',
    minAgeYearGate: { default: 18 },
    cohabitationLegal: true,
    polygamyAllowedForMuslimMen: false,
    guardianRole: 'none',
    requiresPremaritalMedical: false,
    mixedMarriagePermitRequired: false,
    hasShabkaGold: false,
    hasMahr: false,
    hasQaimaList: false,
    prenupEnforceability: 'strong_domestic_contract',
    noFaultDivorceFromYear: 1968,
    propertyRegime: 'marital_equitable_50_50',
    inheritanceModel: 'civil_statutory',
    venues2026: [
      { id: 'city_hall', label: 'City Hall Ceremony & Bistro', cost: 3500, prestige: 3 },
      { id: 'lakeside', label: 'Lakeside Lodge Reception', cost: 26000, prestige: 7 },
      { id: 'fairmont', label: 'Château / Luxury Hotel Gala', cost: 65000, prestige: 9 }
    ]
  }
};

/* ============================================================================
   Merged marriage profiles (World Life 2.1)
   The flat MARRIAGE_PROFILES table above is the engine's own shape (7
   explicit countries). The rich 7875 table in megaCareerEduMedical.js
   carries every country and era, including the recognised-union lists,
   mahr/shabka/gehaz customs, venues and costs. getMarriageProfile returns
   ONE merged profile: the flat fields the engine reads, plus the
   era-resolved recognisedUnions and civilUnionNonMuslimOnly that the
   union-type derivation reads (schema.js readRecognizedUnions /
   readCivilUnionNonMuslimOnly check the flat fields first), plus the merged
   7875 leaves as `fullProfile` (common + era override, leaf objects
   intact). The 7 explicit flat entries are kept verbatim as the base —
   nothing the engine already relies on changes value. Countries with no
   explicit flat entry are derived from their 7875 leaves instead of the
   old generic fx fallback.
   ========================================================================== */

/* Era band for a year, clamped to the seven bands the 7875 profiles carry. */
function wlMarriageEraBand(year) {
  const y = Number(year) || 2026;
  if (y < 1970) return '1960s';
  if (y < 1980) return '1970s';
  if (y < 1990) return '1980s';
  if (y < 2000) return '1990s';
  if (y < 2010) return '2000s';
  if (y < 2020) return '2010s';
  return '2020s';
}

/* Merge a 7875 profile's common leaves with one era's overrides. Leaf
   objects stay intact ({v, src, modelled}); the era wins where it carries
   the leaf. Sub-objects (e.g. costs.venues) are taken whole from the era
   when present, otherwise from common. */
function wlMergeFullProfile(entry, band) {
  const merged = {};
  const era = (entry.eras && entry.eras[band]) || {};
  const sections = new Set([...Object.keys(entry.common || {}), ...Object.keys(era)]);
  for (const sec of sections) {
    merged[sec] = {};
    const cSec = (entry.common && entry.common[sec]) || {};
    const eSec = era[sec] || {};
    for (const key of new Set([...Object.keys(cSec), ...Object.keys(eSec)])) {
      merged[sec][key] = eSec[key] !== undefined ? eSec[key] : cSec[key];
    }
  }
  return merged;
}

function wlLeafValue(merged, section, key) {
  const leaf = merged && merged[section] && merged[section][key];
  return leaf && typeof leaf === 'object' && 'v' in leaf ? leaf.v : undefined;
}

/* No-fault (unilateral) divorce statutes, per country. 1960 is the old
   fallback value, kept where no firm year is established. */
const WL_NO_FAULT_DIVORCE_YEAR = {
  aus: 1975, // Family Law Act 1975
  nld: 1971, // irretrievable breakdown, 1971
  fra: 1975, // divorce by mutual consent, 1975
  jpn: 1960, // fallback — Japan has no unilateral no-fault court divorce; divorce by mutual agreement is the norm
  ita: 1970, // Divorce Act (Legge 898/1970)
  sgp: 2022, // no-fault by mutual agreement, 2022
  bra: 1977, // Divorce Act (Lei 6.515/1977)
  ind: 1976, // mutual-consent divorce, Hindu Marriage Act amendment 1976
  che: 2000, // new divorce law, 2000
  swe: 1974, // Marriage Code 1973, in force 1974 — divorce on either spouse's request, no fault
  tur: 2002 // Civil Code art. 166 (Law 4721, 2002) — irretrievable breakdown
};

/* The three explicit flat entries that predate the no-fault field. Egypt and
   Saudi Arabia have no unilateral no-fault divorce (fault grounds + khula),
   so there is no year — null, not a made-up one. The UAE introduced
   no-fault divorce for non-Muslims with Federal Decree-Law 41/2022. */
const WL_NO_FAULT_DIVORCE_YEAR_EXPLICIT = { egy: null, sau: null, uae: 2022 };

/* Derive the flat engine fields for a country that has no explicit flat
   entry, from its era-resolved 7875 leaves. */
function wlDeriveFlatProfile(countryId, year, merged) {
  const legal = (k) => wlLeafValue(merged, 'legal', k);
  const customs = (k) => wlLeafValue(merged, 'customs', k);
  const money = (k) => wlLeafValue(merged, 'money', k);
  const venueLeaves = (merged.costs && merged.costs.venues) || {};
  const venuePrice = (id) => {
    const leaf = venueLeaves[id];
    return leaf && typeof leaf.v === 'number' ? leaf.v : undefined;
  };
  const minAgeMale = legal('minAgeMale');
  const guardianText = String(legal('guardianApproval') || '');
  const polygamy = legal('polygamy') || {};
  const mahr = customs('mahr');
  const shabka = customs('shabka');
  const religiousLaw = String(legal('religiousLawApplies') || '');
  const hasMahr = !!(mahr && mahr.exists !== false);
  const hasShabkaGold = !!(shabka && shabka.exists !== false);
  const flat = {
    country: countryId,
    minAgeYearGate: { default: typeof minAgeMale === 'number' ? minAgeMale : 18 },
    cohabitationLegal: legal('cohabitationRecognised') === true,
    polygamyAllowedForMuslimMen: polygamy.allowed === true,
    guardianRole: /wali/i.test(guardianText) ? 'statutory_wali' : 'none',
    requiresPremaritalMedical: wlLeafValue(merged, 'procedure', 'medicalExamRequired') === true,
    mixedMarriagePermitRequired: false,
    hasShabkaGold,
    hasMahr,
    hasQaimaList: false,
    prenupEnforceability: money('prenupEnforceability'),
    noFaultDivorceFromYear: WL_NO_FAULT_DIVORCE_YEAR[countryId] ?? 1960,
    propertyRegime: money('propertyRegime'),
    inheritanceModel: /sharia/i.test(religiousLaw) ? 'sharia_faraid' : 'civil_statutory',
    venues2026: [
      { id: 'family_home', label: 'Family Home Celebration', cost: venuePrice('family_home') ?? 3000, prestige: 3 },
      { id: 'hotel_4star', label: 'Four-Star Hotel Reception', cost: venuePrice('hotel_4star') ?? venuePrice('local_hall') ?? 18000, prestige: 7 },
      { id: 'hotel_5star', label: 'Luxury Hotel Gala', cost: venuePrice('hotel_5star') ?? 48000, prestige: 9 }
    ]
  };
  if (hasShabkaGold) flat.shabkaGramsTiers = { modest: 16, standard: 40, generous: 85 };
  if (hasMahr && mahr && typeof mahr.rangeLow === 'number' && typeof mahr.rangeHigh === 'number') {
    const low = mahr.rangeLow, high = mahr.rangeHigh;
    flat.mahrPrompt2026 = { modest: low, standard: Math.round((low + high) / 2), generous: high };
    flat.mahrDeferred2026 = { modest: Math.round(low / 2), standard: Math.round((low + high) / 4), generous: Math.round(high / 2) };
  }
  flat.cohabitationAllowedNow = flat.cohabitationLegal;
  flat.medicalRequiredNow = !!(flat.requiresPremaritalMedical && year >= 1960);
  return flat;
}

export function getMarriageProfile(countryId, year = 2026) {
  const band = wlMarriageEraBand(year);
  const full = FULL_MARRIAGE_PROFILES_7875 && FULL_MARRIAGE_PROFILES_7875[countryId];
  const merged = full ? wlMergeFullProfile(full, band) : null;
  const recognisedUnions = merged ? wlLeafValue(merged, 'legal', 'recognizedUnions') : undefined;
  const civilUnionNonMuslimOnly = merged ? wlLeafValue(merged, 'legal', 'civilUnionNonMuslimOnly') : undefined;
  const fullProfile = merged ? { country: countryId, label: full.label, era: band, ...merged } : undefined;
  const unionFields = {
    ...(Array.isArray(recognisedUnions) ? { recognizedUnions: recognisedUnions } : {}),
    ...(typeof civilUnionNonMuslimOnly === 'boolean' ? { civilUnionNonMuslimOnly } : {}),
    ...(fullProfile ? { fullProfile } : {})
  };

  if (MARRIAGE_PROFILES[countryId]) {
    const p = MARRIAGE_PROFILES[countryId];
    return {
      ...p,
      ...unionFields,
      // The egy/sau/uae flat entries predate these two fields; fill them
      // from the 7875 leaves / the statute year instead of leaving them
      // undefined. The gbr/usa/deu/can values are untouched (?? keeps them).
      prenupEnforceability: p.prenupEnforceability ?? wlLeafValue(merged, 'money', 'prenupEnforceability'),
      noFaultDivorceFromYear: p.noFaultDivorceFromYear ?? WL_NO_FAULT_DIVORCE_YEAR_EXPLICIT[countryId] ?? null,
      // (was `false || undefined` = undefined for egy/sau; coerce to a real boolean — same falsy meaning)
      cohabitationAllowedNow: !!(p.cohabitationLegal || (p.cohabitationDecriminalizedYear && year >= p.cohabitationDecriminalizedYear)),
      medicalRequiredNow: !!(p.requiresPremaritalMedical && year >= (p.medicalScreeningStartYear || 1960))
    };
  }
  if (full) {
    return { ...wlDeriveFlatProfile(countryId, year, merged), ...unionFields };
  }
  // Unknown country id — keep the old conservative fallback.
  const conservative = countryId === 'ind' || countryId === 'sgp';
  const fxApprox = {
    aus: 1.5, nld: 0.92, fra: 0.92, jpn: 150, ita: 0.92, sgp: 1.35, bra: 5.05, ind: 83.5
  }[countryId] || 1.0;

  return {
    country: countryId,
    minAgeYearGate: { default: 18 },
    cohabitationLegal: !conservative,
    cohabitationAllowedNow: !conservative,
    polygamyAllowedForMuslimMen: false,
    guardianRole: conservative ? 'family_blessing_customary' : 'none',
    requiresPremaritalMedical: false,
    medicalRequiredNow: false,
    mixedMarriagePermitRequired: false,
    hasShabkaGold: countryId === 'ind',
    shabkaGramsTiers: { modest: 16, standard: 40, generous: 85 },
    hasMahr: false,
    hasQaimaList: false,
    prenupEnforceability: 'standard',
    noFaultDivorceFromYear: countryId === 'ita' ? 1970 : 1960,
    propertyRegime: 'marital_equitable_50_50',
    inheritanceModel: 'civil_statutory',
    venues2026: [
      { id: 'civil', label: 'Civil Registry & Family Dinner', cost: Math.round(2800 * fxApprox), prestige: 3 },
      { id: 'classic', label: 'Traditional Banquet & Reception', cost: Math.round(18000 * fxApprox), prestige: 7 },
      { id: 'grand', label: 'Grand Luxury Hotel Wedding', cost: Math.round(48000 * fxApprox), prestige: 9 }
    ]
  };
}
