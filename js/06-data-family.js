/* ============================================================
   WORLD LIFE — DATA: FAMILY, RELATIONSHIPS & HEALTH (v3, Massive Expansion)
   ============================================================
   Pure data. No logic, no functions.
   
   Expanded to include:
   - Deep family traits (envious, grumpy, traditional)
   - Dating & Matchmaking (salonat, apps, childhood friends)
   - Marriage mechanics (shabka, mahr, financial splits, wedding tiers)
   - Pregnancy & Children (fertility, IVF, birth tiers, diapers/milk, schools, clubs)
   - Divorce & Custody (prenup, child support, spousal support by legal system)
   - Deep Medical (therapy, chronic illness, cancer, surgeries, insurance tiers)
   - Vacations (Local Egypt resorts, international Schengen/Visa rules)
   - Inter-family drama (sharing parent costs, cutting ties, moving reactions)
   ============================================================ */

/* ---------- FAMILY WEALTH TIERS (6) ---------- */
const FAMILY_TIERS = {
  poor: {
    label: 'Poor',
    parentWealth: 0,
    parentIncome: 5000,
    requestChanceMult: 1.5,
    giftToPlayerChance: 0,
    hasHome: true,
    expectedSupport: 'high'
  },
  'lower-mid': {
    label: 'Lower-middle',
    parentWealth: 5000,
    parentIncome: 12000,
    requestChanceMult: 1.3,
    giftToPlayerChance: 0,
    hasHome: true,
    expectedSupport: 'medium'
  },
  middle: {
    label: 'Middle',
    parentWealth: 80000,
    parentIncome: 25000,
    requestChanceMult: 1.0,
    giftToPlayerChance: 0.1,
    hasHome: true,
    expectedSupport: 'medium'
  },
  'upper-mid': {
    label: 'Upper-middle',
    parentWealth: 600000,
    parentIncome: 60000,
    requestChanceMult: 0.5,
    giftToPlayerChance: 0.5,
    hasHome: true,
    expectedSupport: 'low'
  },
  wealthy: {
    label: 'Wealthy',
    parentWealth: 5000000,
    parentIncome: 150000,
    requestChanceMult: 0.15,
    giftToPlayerChance: 1.0,
    hasHome: true,
    expectedSupport: 'none'
  },
  ultra: {
    label: 'Ultra-wealthy',
    parentWealth: 50000000,
    parentIncome: 500000,
    requestChanceMult: 0.05,
    giftToPlayerChance: 2.0,
    hasHome: true,
    expectedSupport: 'none'
  }
};

const TIER_ALIASES = {
  poor: 'poor', low: 'poor', 'low-income': 'poor',
  'lower-mid': 'lower-mid', 'lower-middle': 'lower-mid', lowmid: 'lower-mid',
  middle: 'middle', mid: 'middle', 'middle-class': 'middle',
  'upper-mid': 'upper-mid', 'upper-middle': 'upper-mid', uppermid: 'upper-mid',
  wealthy: 'wealthy', rich: 'wealthy',
  ultra: 'ultra', 'ultra-wealthy': 'ultra', 'ultra-rich': 'ultra'
};

/* ---------- EXTENDED PERSONALITY TRAITS ---------- */
const PERSONALITY_TRAITS = {
  strict:      { label: 'Strict',      bondDecay: 1.3, supportChance: 0.60, conflictChance: 1.2 },
  balanced:    { label: 'Balanced',    bondDecay: 1.0, supportChance: 0.85, conflictChance: 1.0 },
  warm:        { label: 'Warm',        bondDecay: 0.7, supportChance: 0.95, conflictChance: 0.5 },
  grumpy:      { label: 'Grumpy',      bondDecay: 1.5, supportChance: 0.50, conflictChance: 1.8 },
  envious:     { label: 'Envious',     bondDecay: 1.2, supportChance: 0.40, conflictChance: 2.0, demandMult: 1.5 }, // Wants new iPhone, new car, jealous of player
  traditional: { label: 'Traditional', bondDecay: 1.0, supportChance: 0.80, conflictChance: 1.3, arrangeMarriageBias: true },
  openMinded:  { label: 'Open-Minded', bondDecay: 0.8, supportChance: 0.90, conflictChance: 0.6, arrangeMarriageBias: false }
};

/* ---------- DATING & MATCHMAKING ---------- */
const DATING_SOURCES = [
  { id: 'salonat', label: 'Arranged (Salonat)', matchChance: 0.7, familyApproval: 1.0, romanticStart: 0.3 },
  { id: 'app', label: 'Dating App', matchChance: 0.5, familyApproval: 0.5, romanticStart: 0.8 },
  { id: 'work', label: 'Coworker', matchChance: 0.4, familyApproval: 0.8, romanticStart: 0.7 },
  { id: 'college', label: 'College Sweetheart', matchChance: 0.3, familyApproval: 0.9, romanticStart: 0.9 },
  { id: 'mutuals', label: 'Mutual Friends', matchChance: 0.6, familyApproval: 0.8, romanticStart: 0.7 }
];

/* ---------- ENGAGEMENT & WEDDING COSTS ---------- */
const MARRIAGE_TRADITIONS = {
  egy: {
    shabka: {
      budget: { label: 'Simple Gold Ring', cost: 15000 },
      standard: { label: 'Gold Set (30g)', cost: 120000 },
      elite: { label: 'Diamond Set', cost: 400000 }
    },
    mahr: {
      budget: { label: 'Symbolic Mahr', cost: 10000 },
      standard: { label: 'Standard Mahr', cost: 100000 },
      elite: { label: 'High-class Mahr', cost: 500000 }
    }
  },
  usa: {
    shabka: {
      budget: { label: 'Silver Ring', cost: 500 },
      standard: { label: '1 Carat Diamond', cost: 5000 },
      elite: { label: '3 Carat Designer Ring', cost: 25000 }
    },
    mahr: null // N/A in standard Western
  }
};

const WEDDING_TIERS = [
  { id: 'family_home', label: 'Family House Gathering', costUSD: 500, socialBoost: 2, stress: 2 },
  { id: 'budget_hall', label: 'Budget Wedding Hall', costUSD: 3000, socialBoost: 5, stress: 5 },
  { id: 'mid_hotel', label: '4-Star Hotel Reception', costUSD: 12000, socialBoost: 10, stress: 7 },
  { id: 'elite_5star', label: '5-Star Luxury Wedding', costUSD: 50000, socialBoost: 25, stress: 10 }
];

const MARRIAGE_FINANCE_MODELS = [
  { id: 'traditional_male_provider', label: 'Husband pays all (Wife keeps her income or housewife)' },
  { id: 'egalitarian_50_50', label: 'Split 50/50 (Shared Account)' },
  { id: 'proportional', label: 'Split by Income %' },
  { id: 'princess_treatment', label: 'Husband pays all + gives wife allowance' }
];

/* ---------- PREGNANCY, FERTILITY & BIRTH ---------- */
const FERTILITY_RATES = [
  { minAge: 18, maxAge: 25, baseChance: 0.85, ivfSuccess: 0.60 },
  { minAge: 26, maxAge: 30, baseChance: 0.75, ivfSuccess: 0.55 },
  { minAge: 31, maxAge: 35, baseChance: 0.60, ivfSuccess: 0.50 },
  { minAge: 36, maxAge: 40, baseChance: 0.35, ivfSuccess: 0.35 },
  { minAge: 41, maxAge: 45, baseChance: 0.10, ivfSuccess: 0.15 },
  { minAge: 46, maxAge: 99, baseChance: 0.01, ivfSuccess: 0.02 }
];

const MATERNITY_HOSPITALS = [
  { id: 'public', label: 'Public Hospital', costUSD: 100, healthRiskMult: 1.5, comfort: 2 },
  { id: 'private', label: 'Private Clinic', costUSD: 1500, healthRiskMult: 1.0, comfort: 6 },
  { id: 'elite', label: 'Elite Maternity Hospital', costUSD: 8000, healthRiskMult: 0.8, comfort: 10 }
];

const FERTILITY_TREATMENTS = [
  { id: 'consultation', label: 'Fertility Tests & Consult', costUSD: 500 },
  { id: 'medication', label: 'Fertility Medications', costUSD: 1200 },
  { id: 'ivf_cycle', label: 'IVF Treatment Cycle', costUSD: 8000, stress: 8, relationshipStrain: 5 }
];

/* ---------- CHILD RAISING COSTS ---------- */
const CHILD_EXPENSE_TIERS = {
  infant: {
    budget: { label: 'Basic Diapers & Nursing', monthlyUSD: 150 },
    standard: { label: 'Formula, Brand Diapers, Toys', monthlyUSD: 400 },
    elite: { label: 'Imported Formula, Nanny, Premium Gear', monthlyUSD: 1500 }
  },
  schooling: {
    public: { label: 'Public School', annualUSD: 200, quality: 3 },
    private_national: { label: 'Private National School', annualUSD: 2500, quality: 6 },
    international: { label: 'International School (IGCSE/American)', annualUSD: 12000, quality: 9 },
    elite_boarding: { label: 'Elite Boarding School', annualUSD: 45000, quality: 10 }
  },
  lifestyle_addons: [
    { id: 'sports_club', label: 'Sports Club Membership', annualUSD: 1500, childHappiness: 5 },
    { id: 'private_tutor', label: 'Private Tutoring', annualUSD: 2000, childSmarts: 8 },
    { id: 'summer_camp_abroad', label: 'Summer Camp Abroad', annualUSD: 5000, childHappiness: 10 }
  ]
};

/* ---------- DIVORCE & CUSTODY ---------- */
const DIVORCE_LEGAL_SYSTEMS = {
  egyptian: {
    prenupCommon: false,
    alimonyType: 'Nafaqa (Housing, Child Support, limited Spousal)',
    defaultCustody: 'Mother until age 15, then child chooses',
    assetSplit: 'Keep own assets, husband provides housing for child'
  },
  western: {
    prenupCommon: true,
    alimonyType: 'Spousal Support (duration based on marriage length)',
    defaultCustody: 'Joint 50/50',
    assetSplit: '50/50 Marital Assets (unless prenup)'
  }
};

const DIVORCE_CAUSES = [
  { id: 'infidelity', label: 'Cheating/Fling', relationshipDamage: 100, courtBias: 'against_cheater' },
  { id: 'financial', label: 'Financial Ruin/Debt', relationshipDamage: 50, courtBias: 'neutral' },
  { id: 'boredom', label: 'Fell out of love', relationshipDamage: 30, courtBias: 'neutral' },
  { id: 'inlaws', label: 'In-law interference', relationshipDamage: 40, courtBias: 'neutral' }
];

/* ---------- MEDICAL & HEALTH SYSTEM ---------- */
const MEDICAL_INSURANCE_TIERS = [
  { id: 'none', label: 'Uninsured (Out of Pocket)', premiumUSD: 0, coveragePct: 0 },
  { id: 'basic', label: 'Basic Employer Cover', premiumUSD: 600, coveragePct: 50, limits: 'Low' },
  { id: 'comprehensive', label: 'Comprehensive Private', premiumUSD: 3000, coveragePct: 85, limits: 'High' },
  { id: 'elite_global', label: 'Global Elite Cover', premiumUSD: 12000, coveragePct: 100, limits: 'Unlimited' }
];

const MEDICAL_CONDITIONS = [
  { id: 'anxiety_dep', type: 'mental', label: 'Anxiety & Depression', ongoingCostUSD: 200, happinessCap: 40 },
  { id: 'hypertension', type: 'chronic', label: 'High Blood Pressure', ongoingCostUSD: 100, healthMax: 80 },
  { id: 'heart_disease', type: 'severe', label: 'Heart Disease', ongoingCostUSD: 500, suddenEventChance: 0.05 },
  { id: 'cancer', type: 'critical', label: 'Cancer', suddenEventChance: 0.02, healthDrop: 50 }
];

const MEDICAL_TREATMENTS = [
  { id: 'therapy', condition: 'mental', label: 'Weekly Psychiatry/Therapy', costUSD: 300, effectiveness: 0.6 },
  { id: 'medication', condition: 'mental', label: 'Antidepressants', costUSD: 50, effectiveness: 0.4 },
  { id: 'surgery_heart', condition: 'severe', label: 'Bypass Surgery', costUSD: 40000, recoveryTimeMonths: 3 },
  { id: 'chemotherapy', condition: 'critical', label: 'Chemotherapy Course', costUSD: 80000, healthDrop: 20, cureChance: 0.6 }
];

/* ---------- VACATIONS & VISAS ---------- */
const VACATION_DESTINATIONS = {
  egypt_local: [
    { id: 'north_coast', label: 'North Coast (Sahel)', type: 'summer_resort', costPerDayUSD: 150 },
    { id: 'sharm', label: 'Sharm El Sheikh', type: 'red_sea', costPerDayUSD: 100 },
    { id: 'dahab', label: 'Dahab', type: 'budget_red_sea', costPerDayUSD: 40 },
    { id: 'gouna', label: 'El Gouna', type: 'elite_resort', costPerDayUSD: 300 }
  ],
  abroad: [
    { id: 'europe_schengen', label: 'Europe (Schengen Area)', visaRequired: true, visaDifficulty: 7, costPerDayUSD: 250 },
    { id: 'turkey', label: 'Turkey', visaRequired: true, visaDifficulty: 3, costPerDayUSD: 120 },
    { id: 'maldives', label: 'Maldives', visaRequired: false, visaDifficulty: 0, costPerDayUSD: 600 },
    { id: 'usa', label: 'United States', visaRequired: true, visaDifficulty: 9, costPerDayUSD: 300 }
  ]
};

const PASSPORT_STRENGTH = {
  egy: { visaFreeCountries: 52, shengenRequiresVisa: true, usRequiresVisa: true },
  usa: { visaFreeCountries: 184, shengenRequiresVisa: false, usRequiresVisa: false },
  uk: { visaFreeCountries: 187, shengenRequiresVisa: false, usRequiresVisa: false },
  sau: { visaFreeCountries: 82, shengenRequiresVisa: true, usRequiresVisa: true },
  uae: { visaFreeCountries: 175, shengenRequiresVisa: false, usRequiresVisa: true }
};

/* ---------- REMITTANCES & EXPAT LIFE ---------- */
const REMITTANCE_COSTS = {
  egy: { minMonthly: 5000, maxMonthly: 50000, airfareEconomy: 15000, airfareBusiness: 45000, giftShip: 2000 },
  usa: { minMonthly: 200, maxMonthly: 2000, airfareEconomy: 1200, airfareBusiness: 4500, giftShip: 80 },
  sau: { minMonthly: 500, maxMonthly: 5000, airfareEconomy: 2000, airfareBusiness: 6000, giftShip: 200 },
  uae: { minMonthly: 500, maxMonthly: 5000, airfareEconomy: 1500, airfareBusiness: 4500, giftShip: 150 },
  uk:  { minMonthly: 100, maxMonthly: 1000, airfareEconomy: 500, airfareBusiness: 2000, giftShip: 60 }
};

const VISIT_CLASSES = [
  { id: 'economy', label: 'Economy class', mult: 1.0 },
  { id: 'premium', label: 'Premium economy', mult: 1.8 },
  { id: 'business', label: 'Business class', mult: 3.5 },
  { id: 'first', label: 'First class', mult: 6.0 }
];

const VISIT_HOTELS = [
  { id: 'family_home', label: 'Stay with family', costPerNight: 0 },
  { id: 'budget_hotel', label: 'Budget hotel', costPerNight: 40 },
  { id: 'mid_hotel', label: 'Mid-range hotel', costPerNight: 120 },
  { id: 'luxury_hotel', label: 'Luxury hotel', costPerNight: 400 }
];

/* ---------- EXPANDED PARENT REQUESTS ---------- */
const PARENT_REQUEST_TEMPLATES = [
  {
    kind: 'help', minAge: 45, maxAge: 65,
    amountUSD: [100, 600], perMonth: false,
    chance: 0.06, shareable: false,
    message: '{name} called asking for help with bills this month.'
  },
  {
    kind: 'retirement', minAge: 60, maxAge: 70,
    amountUSD: [100, 300], perMonth: true,
    chance: 0.30, oncePerLife: true, shareable: true,
    message: '{name} retired. Pension is small. Asks for {amount}/month to survive.'
  },
  {
    kind: 'medical', minAge: 55, maxAge: 80,
    amountUSD: [500, 3000], perMonth: false,
    chance: 0.15, shareable: true,
    reasons: ['a minor surgery', 'dental treatment', 'eye surgery', 'physiotherapy'],
    message: '{name} needs {reason}. Medical bill: {amount}.'
  },
  {
    kind: 'medical_big', minAge: 65, maxAge: 999,
    amountUSD: [5000, 20000], perMonth: false,
    chance: 0.04, shareable: true,
    reasons: ['a heart procedure', 'cancer treatment', 'a major surgery', 'a hospital stay'],
    message: 'URGENT: {name} needs {reason}. Cost: {amount}.'
  },
  {
    kind: 'nurse', minAge: 75, maxAge: 999,
    amountUSD: [200, 600], perMonth: true,
    chance: 0.10, shareable: true,
    message: '{name} can no longer manage alone. Needs a live-in nurse: {amount}/month.'
  },
  {
    kind: 'maid', minAge: 65, maxAge: 999,
    amountUSD: [100, 300], perMonth: true,
    chance: 0.08, shareable: true,
    message: '{name} needs help around the house. Maid service: {amount}/month.'
  },
  {
    kind: 'care_home', minAge: 80, maxAge: 999,
    amountUSD: [500, 1500], perMonth: true,
    chance: 0.06, shareable: true,
    message: '{name} needs full-time care. Assisted living: {amount}/month.'
  }
];

/* ---------- EXPANDED SIBLING REQUESTS ---------- */
const SIBLING_REQUEST_TEMPLATES = [
  {
    kind: 'tuition', minAge: 18, maxAge: 25,
    amountUSD: [800, 5000], perMonth: false,
    chance: 0.35, onlyIfStage: ['uni'],
    message: '{name} needs help with university tuition: {amount}.'
  },
  {
    kind: 'phone', minAge: 14, maxAge: 999,
    amountUSD: [200, 1200], perMonth: false,
    chance: 0.15,
    message: '{name} wants the newest iPhone. Asks for help: {amount}.'
  },
  {
    kind: 'wedding', minAge: 22, maxAge: 40,
    amountUSD: [1000, 10000], perMonth: false,
    chance: 0.40, onlyJustMarried: true,
    message: '{name} is getting married. Asks for contribution for the apartment/shabka: {amount}.'
  },
  {
    kind: 'downpayment', minAge: 25, maxAge: 45,
    amountUSD: [5000, 20000], perMonth: false,
    chance: 0.08, onlyIfStage: ['married', 'parent'],
    message: '{name} is buying a home. Needs down payment help: {amount}.'
  },
  {
    kind: 'business', minAge: 24, maxAge: 55,
    amountUSD: [2000, 15000], perMonth: false,
    chance: 0.04, onlyIfStage: ['working'],
    message: '{name} wants to start a business. Asks for capital: {amount}.'
  }
];

/* Sibling contribution chance when sharing a parent's cost */
const SIBLING_CONTRIBUTE_CHANCE = {
  poor: 0.10,
  middle: 0.40,
  successful: 0.85
};

const SIBLING_CONFLICT_REASONS = [
  'Refused to help pay for parents medical bills',
  'Jealous of your success/wealth',
  'Argument over inheritance/estate division',
  'Disapproved of your spouse'
];

/* ---------- FAMILY HOLIDAYS ---------- */
const FAMILY_HOLIDAYS = {
  egy: [
    { id: 'eid_fitr',    name: 'Eid al-Fitr',    monthHint: 'Spring' },
    { id: 'eid_adha',    name: 'Eid al-Adha',    monthHint: 'Summer' },
    { id: 'ramadan',     name: 'Ramadan',        monthHint: 'Variable' },
    { id: 'coptic_xmas', name: 'Coptic Christmas', monthHint: 'January' }
  ],
  usa: [
    { id: 'thanksgiving', name: 'Thanksgiving', monthHint: 'November' },
    { id: 'christmas',    name: 'Christmas',    monthHint: 'December' }
  ],
  sau: [
    { id: 'eid_fitr', name: 'Eid al-Fitr', monthHint: 'Spring' },
    { id: 'eid_adha', name: 'Eid al-Adha', monthHint: 'Summer' }
  ],
  uae: [
    { id: 'eid_fitr', name: 'Eid al-Fitr', monthHint: 'Spring' },
    { id: 'eid_adha', name: 'Eid al-Adha', monthHint: 'Summer' },
    { id: 'national_day', name: 'UAE National Day', monthHint: 'December' }
  ],
  uk: [
    { id: 'christmas', name: 'Christmas', monthHint: 'December' },
    { id: 'easter',    name: 'Easter',    monthHint: 'Spring' }
  ]
};
/* ============================================================
   ADDENDUM — constants used by 19-view-family.js
   (These existed in the old v2 data file but were dropped
    from the v3 expansion. Appending them here — no other
    changes needed.)
   ============================================================ */

/* Tier resolver */
function resolveFamilyTier(tier) {
  return TIER_ALIASES[tier] || 'middle';
}

/* Sibling names by country */
const SIBLING_NAMES = {
  egy: {
    m: ['Ahmed', 'Omar', 'Youssef', 'Karim', 'Hassan', 'Ali', 'Mohamed', 'Mostafa', 'Tarek', 'Bassem', 'Sherif', 'Amr'],
    f: ['Sarah', 'Layla', 'Noor', 'Mariam', 'Hana', 'Salma', 'Yasmin', 'Aya', 'Nada', 'Rana', 'Dina', 'Farida']
  },
  usa: {
    m: ['Michael', 'David', 'James', 'Daniel', 'Ryan', 'Ethan', 'Noah', 'Liam', 'Jacob', 'Matthew'],
    f: ['Emily', 'Sarah', 'Jessica', 'Ashley', 'Olivia', 'Emma', 'Sophia', 'Ava', 'Mia', 'Isabella']
  },
  sau: {
    m: ['Abdullah', 'Faisal', 'Khalid', 'Sultan', 'Fahad', 'Turki', 'Saud', 'Nawaf', 'Bandar', 'Majed'],
    f: ['Noura', 'Reem', 'Hessa', 'Latifa', 'Maha', 'Aisha', 'Fatima', 'Sara', 'Lulwa', 'Dana']
  },
  uae: {
    m: ['Rashid', 'Hamdan', 'Saeed', 'Ahmed', 'Khalifa', 'Majid', 'Saif', 'Ali', 'Omar', 'Yousef'],
    f: ['Fatima', 'Mariam', 'Shaikha', 'Latifa', 'Hind', 'Noura', 'Alia', 'Salama', 'Moza', 'Reem']
  },
  uk: {
    m: ['Oliver', 'Harry', 'Jack', 'Charlie', 'George', 'Jacob', 'Thomas', 'James', 'William', 'Henry'],
    f: ['Olivia', 'Amelia', 'Isla', 'Emily', 'Poppy', 'Ava', 'Isabella', 'Lily', 'Sophie', 'Grace']
  }
};

/* Parent aging & death */
const PARENT_DEATH_CHANCE = [
  { minAge: 0,  maxAge: 49,  chance: 0.001 },
  { minAge: 50, maxAge: 59,  chance: 0.005 },
  { minAge: 60, maxAge: 69,  chance: 0.015 },
  { minAge: 70, maxAge: 79,  chance: 0.040 },
  { minAge: 80, maxAge: 89,  chance: 0.100 },
  { minAge: 90, maxAge: 999, chance: 0.200 }
];

const PARENT_HEALTH_DECAY = [
  { minAge: 0,  maxAge: 49,  decay: 0 },
  { minAge: 50, maxAge: 59,  decay: 1 },
  { minAge: 60, maxAge: 69,  decay: 2 },
  { minAge: 70, maxAge: 79,  decay: 3 },
  { minAge: 80, maxAge: 999, decay: 5 }
];

/* Sibling milestones */
const SIBLING_MILESTONES = {
  schoolStart: 6,
  uniStart: 18,
  workStart: 22,
  marryMin: 22,
  marryMax: 40,
  childMin: 23,
  childMax: 42
};

/* Contact decay */
const CONTACT_DECAY_THRESHOLD_YEARS = 2;
const CONTACT_DECAY_AMOUNT = 1;

/* Sibling success evolution */
const SIBLING_SUCCESS_EVOLUTION = {
  poor:       { toPoor: 0.60, toMiddle: 0.35, toSuccess: 0.05 },
  middle:     { toPoor: 0.15, toMiddle: 0.70, toSuccess: 0.15 },
  successful: { toPoor: 0.05, toMiddle: 0.35, toSuccess: 0.60 }
};

/* Sibling chance events */
const SIBLING_WEDDING_CHANCE = 0.12;
const SIBLING_CHILD_CHANCE = 0.20;

/* Funeral costs (in home-country local currency) */
const FUNERAL_COSTS = {
  egy: 30000,
  usa: 8000,
  sau: 15000,
  uae: 12000,
  uk: 5000
};

/* Bond bonuses */
const FAMILY_BOND_BONUSES = {
  call:          5,
  visit:         10,
  helpMoney:     15,
  shareHelp:     8,
  holidayVisit:  15,
  gift:          10
};

/* Gift catalog */
const GIFT_CATALOG = [
  { id: 'phone',   label: 'New phone',       cost: 30000,  bond: 8  },
  { id: 'clothes', label: 'New clothes',     cost: 8000,   bond: 5  },
  { id: 'jewelry', label: 'Jewelry',         cost: 50000,  bond: 10 },
  { id: 'tech',    label: 'New tech/gadget', cost: 40000,  bond: 8  },
  { id: 'trip',    label: 'Trip',            cost: 100000, bond: 12 },
  { id: 'flowers', label: 'Flowers',         cost: 500,    bond: 3  }
];

/* Visit durations */
const VISIT_DURATIONS = [
  { id: 'short',  label: 'Short (5 days)',   days: 5  },
  { id: 'medium', label: 'Medium (10 days)', days: 10 },
  { id: 'long',   label: 'Long (14 days)',   days: 14 }
];
