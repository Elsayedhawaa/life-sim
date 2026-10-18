/* ============================================================
   WORLD LIFE — DATA: FAMILY (v2, expanded)
   ============================================================
   Pure data. No logic, no functions.

   Covers:
   - 6 wealth tiers with parent wealth/income and behavior
   - Parent request templates (retirement, medical, nurse, maid, care, emergency)
   - Sibling request templates (tuition, phone, clothes, wedding, business, downpayment)
   - Remittance costs by country
   - Visit options (classes, hotels)
   - Gift catalog
   - Holidays (bond bonuses)
   ============================================================ */

/* ---------- FAMILY WEALTH TIERS (6) ---------- */
const FAMILY_TIERS = {
  poor: {
    label: 'Poor',
    parentWealth: 0,
    parentIncome: 5000,
    requestChanceMult: 1.5,
    giftToPlayerChance: 0,
    hasHome: true
  },
  'lower-mid': {
    label: 'Lower-middle',
    parentWealth: 5000,
    parentIncome: 12000,
    requestChanceMult: 1.3,
    giftToPlayerChance: 0,
    hasHome: true
  },
  middle: {
    label: 'Middle',
    parentWealth: 80000,
    parentIncome: 25000,
    requestChanceMult: 1.0,
    giftToPlayerChance: 0,
    hasHome: true
  },
  'upper-mid': {
    label: 'Upper-middle',
    parentWealth: 600000,
    parentIncome: 60000,
    requestChanceMult: 0.5,
    giftToPlayerChance: 0.5,
    hasHome: true
  },
  wealthy: {
    label: 'Wealthy',
    parentWealth: 5000000,
    parentIncome: 150000,
    requestChanceMult: 0.15,
    giftToPlayerChance: 1.0,
    hasHome: true
  },
  ultra: {
    label: 'Ultra-wealthy',
    parentWealth: 50000000,
    parentIncome: 500000,
    requestChanceMult: 0.05,
    giftToPlayerChance: 2.0,
    hasHome: true
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

function resolveFamilyTier(tier) {
  return TIER_ALIASES[tier] || 'middle';
}

/* ---------- Parent personality traits ---------- */
const FAMILY_TRAITS = {
  strict:   { label: 'Strict',   bondDecay: 1.3, supportChance: 0.60 },
  balanced: { label: 'Balanced', bondDecay: 1.0, supportChance: 0.85 },
  warm:     { label: 'Warm',     bondDecay: 0.7, supportChance: 0.95 }
};

/* ---------- Sibling names by country ---------- */
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

/* ---------- Death chance per year, by age bracket ---------- */
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

/* ---------- Parent request templates ---------- */
/* { kind, minAge, maxAge, amount:[min,max], perMonth, message, shareable, chance } */
const PARENT_REQUEST_TEMPLATES = [
  {
    kind: 'help', minAge: 45, maxAge: 65,
    amount: [5000, 30000], perMonth: false,
    chance: 0.06,
    shareable: false,
    message: '{name} called asking for help with bills this month.'
  },
  {
    kind: 'retirement', minAge: 60, maxAge: 70,
    amount: [3000, 8000], perMonth: true,
    chance: 0.30,  // one-time retirement event
    oncePerLife: true,
    shareable: true,
    message: '{name} retired. Pension is small. Asks for {amount}/month to survive.'
  },
  {
    kind: 'medical', minAge: 55, maxAge: 80,
    amount: [20000, 100000], perMonth: false,
    chance: 0.15,
    shareable: true,
    reasons: ['a minor surgery', 'dental treatment', 'eye surgery', 'physiotherapy', 'a health checkup', 'cardiology treatment'],
    message: '{name} needs {reason}. Medical bill: {amount}.'
  },
  {
    kind: 'medical_big', minAge: 65, maxAge: 999,
    amount: [150000, 500000], perMonth: false,
    chance: 0.04,
    shareable: true,
    reasons: ['a heart procedure', 'cancer treatment', 'a major surgery', 'a hospital stay'],
    message: 'URGENT: {name} needs {reason}. Cost: {amount}.'
  },
  {
    kind: 'nurse', minAge: 75, maxAge: 999,
    amount: [8000, 18000], perMonth: true,
    chance: 0.10,
    shareable: true,
    message: '{name} can no longer manage alone. Needs a live-in nurse: {amount}/month.'
  },
  {
    kind: 'maid', minAge: 65, maxAge: 999,
    amount: [4000, 9000], perMonth: true,
    chance: 0.08,
    shareable: true,
    message: '{name} needs help around the house. Maid service: {amount}/month.'
  },
  {
    kind: 'care_home', minAge: 80, maxAge: 999,
    amount: [15000, 35000], perMonth: true,
    chance: 0.06,
    shareable: true,
    message: '{name} needs full-time care. Assisted living: {amount}/month.'
  },
  {
    kind: 'emergency', minAge: 45, maxAge: 999,
    amount: [15000, 80000], perMonth: false,
    chance: 0.03,
    shareable: true,
    message: 'URGENT: {name} had an emergency. Needs {amount} immediately.'
  }
];

/* ---------- Sibling request templates ---------- */
const SIBLING_REQUEST_TEMPLATES = [
  {
    kind: 'tuition', minAge: 18, maxAge: 25,
    amount: [30000, 200000], perMonth: false,
    chance: 0.35,
    onlyIfStage: ['uni'],
    message: '{name} needs help with university tuition: {amount}.'
  },
  {
    kind: 'college_misc', minAge: 18, maxAge: 24,
    amount: [5000, 25000], perMonth: true,
    chance: 0.15,
    onlyIfStage: ['uni'],
    message: '{name} needs monthly support for college: {amount}/month.'
  },
  {
    kind: 'phone', minAge: 14, maxAge: 999,
    amount: [8000, 35000], perMonth: false,
    chance: 0.12,
    message: '{name} needs a new phone. Asks for help: {amount}.'
  },
  {
    kind: 'clothes', minAge: 6, maxAge: 999,
    amount: [2000, 15000], perMonth: false,
    chance: 0.10,
    message: '{name} needs help with clothes: {amount}.'
  },
  {
    kind: 'wedding', minAge: 22, maxAge: 40,
    amount: [50000, 300000], perMonth: false,
    chance: 0.40,
    onlyJustMarried: true,
    message: '{name} is getting married. Asks for contribution: {amount}.'
  },
  {
    kind: 'downpayment', minAge: 25, maxAge: 45,
    amount: [200000, 800000], perMonth: false,
    chance: 0.08,
    onlyIfStage: ['married', 'parent'],
    message: '{name} is buying a home. Needs down payment help: {amount}.'
  },
  {
    kind: 'business', minAge: 24, maxAge: 55,
    amount: [50000, 500000], perMonth: false,
    chance: 0.04,
    onlyIfStage: ['working', 'married', 'parent'],
    message: '{name} wants to start a business. Asks for capital: {amount}.'
  },
  {
    kind: 'emergency', minAge: 18, maxAge: 999,
    amount: [20000, 100000], perMonth: false,
    chance: 0.03,
    message: 'URGENT: {name} needs help — {amount}.'
  }
];

/* ---------- Funeral costs ---------- */
const FUNERAL_COSTS = {
  egy: 30000,
  usa: 8000,
  sau: 15000,
  uae: 12000,
  uk: 5000
};

/* ---------- Sibling milestones ---------- */
const SIBLING_MILESTONES = {
  schoolStart: 6,
  uniStart: 18,
  workStart: 22,
  marryMin: 22,
  marryMax: 40,
  childMin: 23,
  childMax: 42
};

const CONTACT_DECAY_THRESHOLD_YEARS = 2;
const CONTACT_DECAY_AMOUNT = 1;

const SIBLING_SUCCESS_EVOLUTION = {
  poor:       { toPoor: 0.60, toMiddle: 0.35, toSuccess: 0.05 },
  middle:     { toPoor: 0.15, toMiddle: 0.70, toSuccess: 0.15 },
  successful: { toPoor: 0.05, toMiddle: 0.35, toSuccess: 0.60 }
};

const SIBLING_WEDDING_CHANCE = 0.12;
const SIBLING_CHILD_CHANCE = 0.20;

/* Sibling contribution chance when sharing a parent's cost */
const SIBLING_CONTRIBUTE_CHANCE = {
  poor: 0.30,
  middle: 0.60,
  successful: 0.90
};

/* ---------- Bond bonuses ---------- */
const FAMILY_BOND_BONUSES = {
  call:          5,
  visit:         10,
  helpMoney:     15,
  shareHelp:     8,
  holidayVisit:  15,
  gift:          10
};

/* ---------- Remittance costs (player abroad, family at home) ---------- */
const REMITTANCE_COSTS = {
  egy: { minMonthly: 5000, maxMonthly: 50000, airfareEconomy: 15000, airfareBusiness: 45000, giftShip: 2000 },
  usa: { minMonthly: 200, maxMonthly: 2000, airfareEconomy: 1200, airfareBusiness: 4500, giftShip: 80 },
  sau: { minMonthly: 500, maxMonthly: 5000, airfareEconomy: 2000, airfareBusiness: 6000, giftShip: 200 },
  uae: { minMonthly: 500, maxMonthly: 5000, airfareEconomy: 1500, airfareBusiness: 4500, giftShip: 150 },
  uk:  { minMonthly: 100, maxMonthly: 1000, airfareEconomy: 500, airfareBusiness: 2000, giftShip: 60 }
};

/* ---------- Visit options ---------- */
const VISIT_CLASSES = [
  { id: 'economy', label: 'Economy class', mult: 1.0 },
  { id: 'premium', label: 'Premium economy', mult: 1.8 },
  { id: 'business', label: 'Business class', mult: 3.5 },
  { id: 'first', label: 'First class', mult: 6.0 }
];

const VISIT_HOTELS = [
  { id: 'family_home', label: 'Stay with family', costPerNight: 0 },
  { id: 'budget_hotel', label: 'Budget hotel', costPerNight: 1200 },
  { id: 'mid_hotel', label: 'Mid-range hotel', costPerNight: 3500 },
  { id: 'luxury_hotel', label: 'Luxury hotel', costPerNight: 12000 }
];

/* Vacation days per visit (days needed) */
const VISIT_DURATIONS = [
  { id: 'short', label: 'Short (5 days)', days: 5 },
  { id: 'medium', label: 'Medium (10 days)', days: 10 },
  { id: 'long', label: 'Long (14 days)', days: 14 }
];

/* ---------- Gift catalog ---------- */
const GIFT_CATALOG = [
  { id: 'phone',   label: 'New phone',         cost: 30000, bond: 8  },
  { id: 'clothes', label: 'New clothes',       cost: 8000,  bond: 5  },
  { id: 'jewelry', label: 'Jewelry',           cost: 50000, bond: 10 },
  { id: 'tech',    label: 'New tech/gadget',   cost: 40000, bond: 8  },
  { id: 'trip',    label: 'Trip',              cost: 100000, bond: 12 },
  { id: 'flowers', label: 'Flowers',           cost: 500,   bond: 3  }
];

/* ---------- Holidays that boost bond when visited ---------- */
const FAMILY_HOLIDAYS = {
  egy: [
    { id: 'eid_fitr',   name: 'Eid al-Fitr',    monthHint: 'Spring' },
    { id: 'eid_adha',   name: 'Eid al-Adha',    monthHint: 'Summer' },
    { id: 'ramadan',    name: 'Ramadan',        monthHint: 'Variable' },
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
   END OF FAMILY DATA
   ============================================================ */
