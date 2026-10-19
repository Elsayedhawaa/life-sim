 /* ============================================================
   WORLD LIFE — DATA: IMMIGRATION
   ============================================================
   Pure data. No logic, no functions.

   Currently supported destinations (full country pack required):
   - usa, sau
   When you add uk/deu/can packs to 01-data-countries.js, also
   append them to SUPPORTED_DESTINATIONS below.

   All fees are in USD internally. The view converts via C().rate.
   ============================================================ */

/* ---------- 1. WHICH DESTINATIONS THE PLAYER CAN ACTUALLY MOVE TO ---------- */
/* Add 'uk', 'deu', 'can' etc once their country packs exist. */
const SUPPORTED_DESTINATIONS = ['usa', 'sau'];

/* ---------- 2. PASSPORTS ---------- */
/* For each passport, categorize destinations by entry difficulty.
   'visa_free'      — no visa, walk in
   'visa_on_arrival' — pay at airport
   'evisa'          — apply online, fast
   'visa_required'  — full embassy application, interview, wait
   'visa_hard'      — very difficult, low approval, sometimes banned
*/
const PASSPORT_DATA = {
  egy: {
    label: 'Egyptian',
    color: '#CE1126',
    strengthScore: 50,
    visa_free:      ['egy', 'jor', 'lbn', 'mar', 'tun', 'sud', 'ken', 'uga', 'eth'],
    visa_on_arrival:['tur', 'ind', 'tha', 'mly', 'idn', 'irq', 'lka', 'mvd'],
    evisa:          ['uae', 'sau', 'omn', 'qat', 'jpn', 'kor', 'sau'],
    visa_required:  ['usa', 'uk', 'can', 'deu', 'fra', 'ita', 'esp', 'gbr', 'aus', 'nzl', 'jpn'],
    visa_hard:      ['usa', 'uk', 'can']
  },
  usa: {
    label: 'American',
    color: '#3C3B6E',
    strengthScore: 188,
    visa_free:      ['uk', 'deu', 'fra', 'ita', 'esp', 'jpn', 'kor', 'sgp', 'can', 'mex', 'bra', 'aus', 'nzl', 'uae', 'qat', 'sau', 'tur', 'egy', 'mar', 'tun', 'ind'],
    visa_on_arrival:['idn', 'tha', 'mly', 'mvd', 'jord', 'lbn', 'ken'],
    evisa:          ['ind', 'vnm', 'sau', 'omn'],
    visa_required:  ['chn', 'rus', 'irn', 'prk', 'cub'],
    visa_hard:      ['irn', 'prk', 'cub']
  },
  sau: {
    label: 'Saudi',
    color: '#006C35',
    strengthScore: 88,
    visa_free:      ['sau', 'bhr', 'kwt', 'omn', 'qat', 'uae', 'jor', 'egy', 'mar', 'tun'],
    visa_on_arrival:['tur', 'mly', 'tha', 'idn', 'lka', 'mvd'],
    evisa:          ['uk', 'deu', 'fra', 'usa', 'jpn', 'kor', 'sgp'],
    visa_required:  ['usa', 'uk', 'can', 'aus', 'nzl', 'ind', 'chn'],
    visa_hard:      ['usa', 'can']
  }
};

/* ---------- 3. VISA TYPES ---------- */
const VISA_TYPES = {
  tourist: {
    label: 'Tourist visa',
    durationYears: 0.25,            // 90 days
    workRights: 'none',
    renewable: false,
    desc: 'Short visit. Cannot work legally. Overstaying = banned for years.'
  },
  student: {
    label: 'Student visa',
    durationYears: 4,               // until end of studies
    workRights: '20h/week',
    renewable: true,
    desc: 'For enrolled students. Limited work rights. Transition to work visa possible.'
  },
  work: {
    label: 'Work visa',
    durationYears: 3,               // 1-3 years typically
    workRights: 'full',
    renewable: true,
    desc: 'Sponsored by employer. If job ends, 30-90 days to find new sponsor or leave.'
  },
  pr: {
    label: 'Permanent residency',
    durationYears: null,            // permanent
    workRights: 'full',
    renewable: false,
    desc: 'Permanent. Full work rights. Cannot be easily deported.'
  },
  citizen: {
    label: 'Citizen',
    durationYears: null,
    workRights: 'full',
    renewable: false,
    desc: 'Full citizen. Vote, get passport, never deported.'
  },
  asylum: {
    label: 'Asylum pending',
    durationYears: null,            // depends on case
    workRights: 'limited',
    renewable: true,
    desc: 'Case under review. Cannot leave destination. Limited work rights.'
  },
  undocumented: {
    label: 'Undocumented',
    durationYears: null,
    workRights: 'none',
    renewable: false,
    desc: 'Overstayed or entered illegally. Cash jobs only. Deportation risk.'
  }
};

/* ---------- 4. VISA FEES (USD, approximate 2026) ---------- */
/* These are per-destination. If destination not listed, defaults used. */
const VISA_FEES = {
  usa: {
    tourist: { fee: 185, wait: 0.25, sevis: 0 },
    student: { fee: 185, wait: 0.25, sevis: 350 },
    work:    { fee: 780, wait: 0.75, sevis: 0 },  // H-1B lottery fee
    lawyer: 2500
  },
  uk: {
    tourist: { fee: 145, wait: 0.1, sevis: 0 },
    student: { fee: 620, wait: 0.1, sevis: 976 },  // IHS per year
    work:    { fee: 900, wait: 0.2, sevis: 976 },  // Skilled worker
    lawyer: 1500
  },
  sau: {
    tourist: { fee: 140, wait: 0.05, sevis: 0 },
    student: { fee: 300, wait: 0.25, sevis: 0 },
    work:    { fee: 530, wait: 0.15, sevis: 0 },  // iqama
    lawyer: 800
  },
  uae: {
    tourist: { fee: 90, wait: 0.05, sevis: 0 },
    student: { fee: 400, wait: 0.2, sevis: 0 },
    work:    { fee: 820, wait: 0.15, sevis: 0 },
    lawyer: 800
  },
  deu: {
    tourist: { fee: 90, wait: 0.2, sevis: 0 },
    student: { fee: 80, wait: 0.3, sevis: 11208 },  // blocked account
    work:    { fee: 90, wait: 0.3, sevis: 0 },
    lawyer: 2000
  },
  can: {
    tourist: { fee: 75, wait: 0.1, sevis: 0 },
    student: { fee: 110, wait: 0.2, sevis: 15000 },  // funds proof
    work:    { fee: 115, wait: 0.3, sevis: 0 },
    lawyer: 2000
  }
};

/* ---------- 5. VISA APPROVAL RATES ---------- */
const VISA_APPROVAL = {
  usa: {
    tourist: { baseChance: 0.45, requiresFunds: 5000, requiresTies: true },
    student: { baseChance: 0.72, requiresFunds: 30000, requiresAcceptance: true, requiresIELTS: 6.5 },
    work:    { baseChance: 0.15, requiresJobOffer: true, requiresDegree: true, lottery: true }  // H-1B
  },
  uk: {
    tourist: { baseChance: 0.75, requiresFunds: 1500, requiresTies: false },
    student: { baseChance: 0.82, requiresFunds: 12000, requiresAcceptance: true, requiresIELTS: 6.0 },
    work:    { baseChance: 0.55, requiresJobOffer: true, requiresSalary: 38700, requiresDegree: false }
  },
  sau: {
    tourist: { baseChance: 0.85, requiresFunds: 1000, requiresTies: false },
    student: { baseChance: 0.88, requiresFunds: 8000, requiresAcceptance: true, requiresIELTS: 0 },
    work:    { baseChance: 0.75, requiresJobOffer: true, requiresDegree: false }
  },
  uae: {
    tourist: { baseChance: 0.92, requiresFunds: 1000, requiresTies: false },
    student: { baseChance: 0.85, requiresFunds: 10000, requiresAcceptance: true, requiresIELTS: 0 },
    work:    { baseChance: 0.80, requiresJobOffer: true, requiresDegree: false }
  },
  deu: {
    tourist: { baseChance: 0.70, requiresFunds: 3000, requiresTies: false },
    student: { baseChance: 0.88, requiresFunds: 11208, requiresAcceptance: true, requiresIELTS: 6.0 },
    work:    { baseChance: 0.65, requiresJobOffer: true, requiresSalary: 45300, requiresDegree: true }
  },
  can: {
    tourist: { baseChance: 0.65, requiresFunds: 3000, requiresTies: true },
    student: { baseChance: 0.72, requiresFunds: 15000, requiresAcceptance: true, requiresIELTS: 6.0 },
    work:    { baseChance: 0.50, requiresJobOffer: true, requiresDegree: true, pointsBased: true }
  }
};

/* ---------- 6. PR REQUIREMENTS ---------- */
const PR_REQUIREMENTS = {
  usa: { years: 5, fee: 1440, requiresJob: true, requiresTax: true, requiresCleanRecord: true },
  uk:  { years: 5, fee: 2885, requiresJob: true, requiresTax: true, requiresLifeTest: true },
  sau: { years: null, note: 'No PR available. Iqama forever or Golden Visa (10 yr renewable, AED/SAR 2M investment).' },
  uae: { years: null, note: 'No PR for most. Golden Visa (10 yr) for AED 2M investment or elite talent.' },
  deu: { years: 5, fee: 300, requiresJob: true, requiresB1German: true },
  can: { years: 3, fee: 500, requiresJob: true, requiresTax: true }
};

/* ---------- 7. CITIZENSHIP REQUIREMENTS ---------- */
const CITIZENSHIP_REQUIREMENTS = {
  usa: { yearsOnPR: 5, fee: 725, requiresEnglishTest: true, requiresCivicTest: true, allowsDual: true },
  uk:  { yearsOnPR: 1, fee: 1580, requiresEnglishTest: true, requiresLifeInUK: true, allowsDual: true },
  sau: { yearsOnPR: null, note: 'Rarely granted to foreigners. King\'s decree only.' },
  uae: { yearsOnPR: null, note: 'Extremely rare. Cabinet approval required.' },
  deu: { yearsOnPR: 5, fee: 255, requiresGermanB1: true, requiresCivicTest: true, allowsDual: false },
  can: { yearsOnPR: 2, fee: 630, requiresEnglishTest: true, requiresCivicTest: true, allowsDual: true }
};

/* ---------- 8. ASYLUM INFO ---------- */
const ASYLUM_INFO = {
  usa: { approvalChance: 0.30, waitYears: 2, canWorkAfterMonths: 6, notes: 'Approval depends on country of origin and case strength.' },
  uk:  { approvalChance: 0.40, waitYears: 1.5, canWorkAfterMonths: 12, notes: 'Strict, but backlog means long limbo.' },
  deu: { approvalChance: 0.50, waitYears: 1, canWorkAfterMonths: 3, notes: 'Most welcoming to Syrians, Afghans, Egyptians with valid claim.' },
  can: { approvalChance: 0.55, waitYears: 1.5, canWorkAfterMonths: 0, notes: 'Can work immediately while case pending.' },
  sau: { approvalChance: 0.0, waitYears: 99, canWorkAfterMonths: 99, notes: 'Not a signatory. No asylum path.' },
  uae: { approvalChance: 0.0, waitYears: 99, canWorkAfterMonths: 99, notes: 'Not a signatory. No asylum path.' }
};

/* Asylum grounds — the "reason" you're seeking asylum */
const ASYLUM_GROUNDS = [
  { id: 'political', label: 'Political persecution',          baseChanceBonus: 0.15, risky: true },
  { id: 'religious', label: 'Religious persecution',          baseChanceBonus: 0.20, risky: true },
  { id: 'lgbtq',     label: 'LGBTQ+ persecution',              baseChanceBonus: 0.25, risky: true },
  { id: 'war',       label: 'War / armed conflict',            baseChanceBonus: 0.30, risky: true },
  { id: 'ethnic',    label: 'Ethnic / minority persecution',   baseChanceBonus: 0.20, risky: true },
  { id: 'false',     label: 'Economic migrant (false claim)',  baseChanceBonus: -0.30, risky: true }
];

/* ---------- 9. LANGUAGE TESTS ---------- */
const LANGUAGE_TESTS = [
  { id: 'ielts',    label: 'IELTS Academic', cost: 250, duration: 0.1, forCountries: ['uk', 'aus', 'can', 'usa', 'nzl'] },
  { id: 'toefl',    label: 'TOEFL iBT',      cost: 220, duration: 0.1, forCountries: ['usa', 'can'] },
  { id: 'goethe',   label: 'Goethe-Zertifikat B1/B2', cost: 200, duration: 0.15, forCountries: ['deu'] },
  { id: 'delf',     label: 'DELF B2',         cost: 180, duration: 0.15, forCountries: ['fra'] },
  { id: 'celpip',   label: 'CELPIP (Canada)', cost: 280, duration: 0.1, forCountries: ['can'] }
];

/* Store your scores on S.languageScores = { ielts: 6.5, toefl: 95, ... } */
const LANGUAGE_SCORE_RANGES = {
  ielts: { min: 0, max: 9, passScore: 6.0 },
  toefl: { min: 0, max: 120, passScore: 90 },
  goethe: { min: 0, max: 6, passScore: 3 },  // A1=1, A2=2, B1=3, B2=4, C1=5, C2=6
  delf:  { min: 0, max: 6, passScore: 4 },
  celpip: { min: 0, max: 12, passScore: 7 }
};

/* ---------- 10. REAL SCHOLARSHIPS ---------- */
const SCHOLARSHIPS = [
  { id: 'fulbright',    name: 'Fulbright Foreign Student Program', country: 'usa', coverage: 'full', requires: { gpa: 3.5, ielts: 7.0 }, acceptanceRate: 0.08 },
  { id: 'chevening',    name: 'Chevening (UK)',                    country: 'uk',  coverage: 'full', requires: { gpa: 3.5, ielts: 7.0, workYears: 2 }, acceptanceRate: 0.05 },
  { id: 'daad',         name: 'DAAD (Germany)',                    country: 'deu', coverage: 'full', requires: { gpa: 3.3, germanB1: true }, acceptanceRate: 0.15 },
  { id: 'erasmus',      name: 'Erasmus Mundus (EU)',               country: 'eu',  coverage: 'full', requires: { gpa: 3.5, ielts: 7.0 }, acceptanceRate: 0.10 },
  { id: 'mext',         name: 'MEXT (Japan)',                      country: 'jpn', coverage: 'full', requires: { gpa: 3.5 }, acceptanceRate: 0.12 },
  { id: 'gates',        name: 'Gates Cambridge (UK)',              country: 'uk',  coverage: 'full', requires: { gpa: 3.8 }, acceptanceRate: 0.02 },
  { id: 'rhodes',       name: 'Rhodes Scholarship (Oxford)',       country: 'uk',  coverage: 'full', requires: { gpa: 3.8, leadership: true }, acceptanceRate: 0.03 },
  { id: 'vanier',       name: 'Vanier Canada Graduate',            country: 'can', coverage: 'full', requires: { gpa: 3.5 }, acceptanceRate: 0.10 },
  { id: 'commonwealth', name: 'Commonwealth Scholarship (UK)',     country: 'uk',  coverage: 'full', requires: { gpa: 3.5, developingCountry: true }, acceptanceRate: 0.12 },
  { id: 'australia_awards', name: 'Australia Awards',              country: 'aus', coverage: 'full', requires: { gpa: 3.5 }, acceptanceRate: 0.10 }
];

/* ---------- 11. STUDY DESTINATIONS ---------- */
/* Use these for the study-abroad picker. Actual country pack NOT required
   for study — the study abroads give you a degree + temporary status. */
const STUDY_DESTINATIONS = [
  { id: 'usa', country: 'usa', label: 'United States',     universities: ['Harvard', 'MIT', 'Stanford', 'UC Berkeley', 'NYU'] },
  { id: 'uk',  country: 'uk',  label: 'United Kingdom',    universities: ['Oxford', 'Cambridge', 'Imperial', 'UCL', 'LSE'] },
  { id: 'deu', country: 'deu', label: 'Germany',           universities: ['TUM', 'LMU Munich', 'Heidelberg', 'RWTH Aachen'] },
  { id: 'can', country: 'can', label: 'Canada',            universities: ['University of Toronto', 'UBC', 'McGill', 'Waterloo'] },
  { id: 'aus', country: 'aus', label: 'Australia',         universities: ['University of Melbourne', 'ANU', 'Sydney', 'UNSW'] }
];

/* ---------- 12. RELOCATION COSTS (once approved) ---------- */
/* Flights + shipping + first month of housing */
const RELOCATION_COSTS = {
  usa:  { flight: 900,  shipping: 600,  deposit: 3000 },
  uk:   { flight: 500,  shipping: 400,  deposit: 2000 },
  deu:  { flight: 400,  shipping: 350,  deposit: 1500 },
  can:  { flight: 1000, shipping: 600,  deposit: 2500 },
  aus:  { flight: 1200, shipping: 700,  deposit: 2500 },
  sau:  { flight: 350,  shipping: 200,  deposit: 1500 },
  uae:  { flight: 250,  shipping: 150,  deposit: 1200 }
};

/* ---------- 13. IQAMA RENEWAL (Gulf only) ---------- */
const IQAMA_RULES = {
  sau: { renewalYears: 1, cost: 530, gracePeriodDays: 90, requiresEmployer: true },
  uae: { renewalYears: 2, cost: 820, gracePeriodDays: 30, requiresEmployer: true }
};

/* ============================================================
   END OF IMMIGRATION DATA
   ============================================================ */
