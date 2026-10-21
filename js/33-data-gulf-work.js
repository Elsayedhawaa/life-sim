/* ============================================================
   DATA: GULF WORK MIGRATION (Expanded)
   ============================================================ */

const GULF_COUNTRIES = ['sau', 'uae', 'kwt', 'qat', 'omn', 'bhr'];
const GULF_COUNTRY_LABELS = {
  sau: 'Saudi Arabia', uae: 'United Arab Emirates', kwt: 'Kuwait',
  qat: 'Qatar', omn: 'Oman', bhr: 'Bahrain'
};

/* ---------- SPONSOR PERSONALITY ---------- */
const GULF_SPONSOR_TYPES = {
  fair:          { label: 'Fair Employer',       control: 0.20, paysOnTime: 0.95, exitVisaGrant: 0.85, nocGrant: 0.50, renewsIqama: 0.95, desc: 'Reasonable. Follows the law.' },
  strict:        { label: 'Strict Employer',     control: 0.50, paysOnTime: 0.85, exitVisaGrant: 0.60, nocGrant: 0.25, renewsIqama: 0.90, desc: 'By the book. Slow on approvals.' },
  exploitative:  { label: 'Exploitative Kafeel', control: 0.85, paysOnTime: 0.55, exitVisaGrant: 0.30, nocGrant: 0.08, renewsIqama: 0.70, desc: 'Known for withheld passports, delayed wages.' },
  generous:      { label: 'Generous Employer',   control: 0.15, paysOnTime: 0.98, exitVisaGrant: 0.95, nocGrant: 0.70, renewsIqama: 1.00, desc: 'Treats workers well, offers bonuses.' },
  family:        { label: 'Family Sponsor',      control: 0.45, paysOnTime: 0.90, exitVisaGrant: 0.90, nocGrant: 0.80, renewsIqama: 0.95, desc: 'A relative. Mixed loyalty and intense social pressure.' },
  agency:        { label: 'Agency-Placed',       control: 0.65, paysOnTime: 0.75, exitVisaGrant: 0.50, nocGrant: 0.20, renewsIqama: 0.80, desc: 'Recruitment agency mediated. Middlemen involved.' },
  multinational: { label: 'Multinational Corp',  control: 0.05, paysOnTime: 1.00, exitVisaGrant: 1.00, nocGrant: 0.95, renewsIqama: 1.00, desc: 'Global standards. Escapes most Kafala drama.' },
  ghost:         { label: 'Ghost Sponsor',       control: 0.05, paysOnTime: 0.00, exitVisaGrant: 0.80, nocGrant: 0.80, renewsIqama: 0.40, desc: 'Sells "Free Visas". You must find illegal freelance work yourself.' }
};
window.GULF_SPONSOR_TYPES = GULF_SPONSOR_TYPES;

/* ---------- JOB SOURCES ---------- */
const GULF_JOB_SOURCES = [
  {
    id: 'friend',
    label: 'Friend Referral',
    desc: 'A friend already working there vouches for you.',
    requiresFriend: true,
    successChance: 0.70,
    commissionCost: 0,
    sponsorBias: ['fair', 'generous'],
    referralBond: 5,
    salaryMult: 1.00,
    story: 'Your friend pulled strings to get your CV on the manager\'s desk.'
  },
  {
    id: 'relative',
    label: 'Family Relative',
    desc: 'A cousin/uncle already there. Mixed blessing.',
    requiresRelative: true,
    successChance: 0.85,
    commissionCost: 0,
    sponsorBias: ['family', 'fair'],
    referralBond: 8,
    salaryMult: 0.90,
    story: 'Your relative got you in. Family loyalty comes with obligations.'
  },
  {
    id: 'agency',
    label: 'Recruitment Agency',
    desc: 'Egyptian agency places you — heavy commissions.',
    requiresNothing: true,
    successChance: 0.60,
    commissionCost: 150000, 
    sponsorBias: ['agency', 'exploitative'],
    referralBond: 0,
    salaryMult: 0.85,
    scamRisk: 0.30,
    story: 'The agency promised everything. You paid the commission in advance.'
  },
  {
    id: 'internal_transfer',
    label: 'Internal Transfer',
    desc: 'Your current company has a Gulf branch. Transfer within.',
    requiresJob: true,
    successChance: 0.55,
    commissionCost: 0,
    sponsorBias: ['fair', 'multinational'],
    referralBond: 3,
    salaryMult: 1.35,
    story: 'Your manager approved an internal transfer to the Gulf office.'
  },
  {
    id: 'linkedin',
    label: 'Headhunted (LinkedIn)',
    desc: 'Directly recruited for your specialized skills.',
    requiresJob: true,
    successChance: 0.25,
    commissionCost: 0,
    sponsorBias: ['multinational', 'generous'],
    referralBond: 0,
    salaryMult: 1.60,
    story: 'A recruiter found your profile and offered a highly competitive package.'
  },
  {
    id: 'free_visa',
    label: '"Free Visa" Broker',
    desc: 'Buy an entry visa, but you must find your own undocumented work.',
    requiresNothing: true,
    successChance: 0.90,
    commissionCost: 250000,
    sponsorBias: ['ghost'],
    referralBond: 0,
    salaryMult: 0, /* No guaranteed salary */
    scamRisk: 0.50,
    story: 'You bought a "Free Visa" from a broker. You are technically employed by them, but you must hustle for your own cash jobs.'
  },
  {
    id: 'direct_apply',
    label: 'Direct Application',
    desc: 'Apply online to Gulf companies yourself.',
    requiresNothing: true,
    successChance: 0.35,
    commissionCost: 0,
    sponsorBias: ['fair', 'strict', 'generous'],
    referralBond: 0,
    salaryMult: 1.10,
    story: 'You applied cold. It worked.'
  }
];
window.GULF_JOB_SOURCES = GULF_JOB_SOURCES;

/* ---------- VISA / IQAMA RULES ---------- */
/* dependentFeeEGP is annual per dependent (wife/children) */
const GULF_IQAMA_RULES = {
  sau: { renewalYears: 1, costEGP: 28000, dependentFeeEGP: 50000, professionRestriction: true, exitVisaRequired: true, nocRequired: true, gracePeriodDays: 60 },
  uae: { renewalYears: 2, costEGP: 35000, dependentFeeEGP: 0, professionRestriction: true, exitVisaRequired: false, nocRequired: false, gracePeriodDays: 30 },
  kwt: { renewalYears: 1, costEGP: 25000, dependentFeeEGP: 15000, professionRestriction: true, exitVisaRequired: false, nocRequired: true, gracePeriodDays: 30 },
  qat: { renewalYears: 1, costEGP: 30000, dependentFeeEGP: 5000, professionRestriction: true, exitVisaRequired: true, nocRequired: true, gracePeriodDays: 90 },
  omn: { renewalYears: 2, costEGP: 22000, dependentFeeEGP: 3000, professionRestriction: true, exitVisaRequired: false, nocRequired: true, gracePeriodDays: 30 },
  bhr: { renewalYears: 1, costEGP: 26000, dependentFeeEGP: 2000, professionRestriction: true, exitVisaRequired: false, nocRequired: true, gracePeriodDays: 30 }
};
window.GULF_IQAMA_RULES = GULF_IQAMA_RULES;

/* ---------- FAMILY VISIT VISA RULES ---------- */
const GULF_FAMILY_VISA_RULES = {
  sau: { minSalaryEGP: 240000, costEGP: 8000, maxDays: 90, requiresAccommodation: true },
  uae: { minSalaryEGP: 200000, costEGP: 6500, maxDays: 90, requiresAccommodation: true },
  kwt: { minSalaryEGP: 220000, costEGP: 7000, maxDays: 60, requiresAccommodation: true },
  qat: { minSalaryEGP: 210000, costEGP: 7500, maxDays: 90, requiresAccommodation: true },
  omn: { minSalaryEGP: 180000, costEGP: 5000, maxDays: 60, requiresAccommodation: true },
  bhr: { minSalaryEGP: 190000, costEGP: 5500, maxDays: 90, requiresAccommodation: true }
};
window.GULF_FAMILY_VISA_RULES = GULF_FAMILY_VISA_RULES;

/* ---------- GIFT CATALOG (sending home from Gulf) ---------- */
const GULF_GIFT_CATALOG = [
  { id: 'phone',       label: 'Smartphone',          basePriceUSD: 450,  customsRisk: 0.15, emotional: 8,  desc: 'Latest model, cheaper in Gulf.' },
  { id: 'laptop',      label: 'Laptop',              basePriceUSD: 800,  customsRisk: 0.20, emotional: 6,  desc: 'Duty-free from Gulf, cheaper.' },
  { id: 'gold',        label: 'Gold jewelry (18K/21K)', basePriceUSD: 900,  customsRisk: 0.35, emotional: 12, desc: 'Traditional Gulf gift for female relatives.' },
  { id: 'perfume',     label: 'Oud & Perfume Set',   basePriceUSD: 150,  customsRisk: 0.05, emotional: 5,  desc: 'Authentic Arabian oud.' },
  { id: 'dates',       label: 'Ajwa Dates & Zamzam', basePriceUSD: 50,   customsRisk: 0.01, emotional: 15, desc: 'Highly sentimental religious items.' },
  { id: 'clothes',     label: 'Clothing bundle',     basePriceUSD: 200,  customsRisk: 0.03, emotional: 4,  desc: 'Brands cheaper in Gulf.' },
  { id: 'watch',       label: 'Designer watch',      basePriceUSD: 1200, customsRisk: 0.25, emotional: 10, desc: 'Brand-name, duty-free.' },
  { id: 'appliances',  label: 'Kitchen Appliances',  basePriceUSD: 300,  customsRisk: 0.40, emotional: 8,  desc: 'Air fryers, mixers, coffee machines.' },
  { id: 'car',         label: 'Imported Car (Tryptique)', basePriceUSD: 15000, customsRisk: 0.85, emotional: 25, desc: 'Massive customs risk, but life-changing gift.' },
  { id: 'cash',        label: 'Cash envelope',       basePriceUSD: 500,  customsRisk: 0.02, emotional: 10, desc: 'Simplest — cash with a traveler returning home.' },
  { id: 'toys',        label: 'Toys for children',   basePriceUSD: 100,  customsRisk: 0.02, emotional: 7,  desc: 'Kids love the treats.' },
  { id: 'electronics', label: 'Small electronics',   basePriceUSD: 250,  customsRisk: 0.10, emotional: 5,  desc: 'Tablets, earbuds, smartwatches.' }
];
window.GULF_GIFT_CATALOG = GULF_GIFT_CATALOG;

/* ---------- GULF DRAMA EVENTS ---------- */
const GULF_DRAMA_EVENTS = [
  {
    id: 'wage_theft',
    weight: 12,
    title: 'Wages Withheld',
    text: 'Your employer hasn\'t paid you in 2 months. Other workers are talking about complaining.',
    choices: [
      { label: 'Complain to the manager', effect: 'complain' },
      { label: 'Report to labor office', effect: 'report' },
      { label: 'Wait and hope', effect: 'wait' }
    ]
  },
  {
    id: 'passport_confiscation',
    weight: 6,
    title: 'Passport Confiscated',
    text: 'Your employer took your passport "for safekeeping." This is common but technically illegal.',
    choices: [
      { label: 'Demand it back', effect: 'demand' },
      { label: 'Let it slide', effect: 'accept' }
    ]
  },
  {
    id: 'noc_refusal',
    weight: 8,
    title: 'NOC Refused',
    text: 'You asked your sponsor for a No-Objection Certificate to change jobs. They said no.',
    requiresAttemptedChange: true,
    choices: [
      { label: 'Accept the refusal', effect: 'accept' },
      { label: 'Try again next year', effect: 'retry' }
    ]
  },
  {
    id: 'family_emergency',
    weight: 10,
    title: 'Family Emergency Back Home',
    text: 'Your mother is sick. You need to go home urgently. But your employer is refusing to issue an exit visa.',
    choices: [
      { label: 'Beg your employer', effect: 'beg' },
      { label: 'Go without permission', effect: 'abscond' },
      { label: 'Send money instead', effect: 'money' }
    ]
  },
  {
    id: 'iqama_profession_mismatch',
    weight: 4,
    title: 'Iqama Inspection',
    text: 'An inspector checked your iqama — it says "laborer" but you work as an engineer. The mismatch is illegal.',
    choices: [
      { label: 'Bribe the inspector', effect: 'bribe' },
      { label: 'Accept the fine', effect: 'fine' },
      { label: 'Flee the site', effect: 'flee' }
    ]
  },
  {
    id: 'nationalization_push',
    weight: 7,
    title: 'Nationalization Quotas (Saudization/Kuwaitization)',
    text: 'The government passed a new law. Your profession is now reserved for citizens only. You will not be able to renew your Iqama.',
    choices: [
      { label: 'Accept it and pack up', effect: 'leave' },
      { label: 'Pay Kafeel to fake your job title', effect: 'bribe_kafeel' }
    ]
  },
  {
    id: 'dependent_fees_hike',
    weight: 6,
    title: 'Dependent Fees Increased',
    text: 'The government just announced a massive tax increase for expats keeping their families in the country.',
    requiresSpouse: true,
    choices: [
      { label: 'Send family back home', effect: 'send_home' },
      { label: 'Pay the crippling fees', effect: 'pay_fees' }
    ]
  },
  {
    id: 'traffic_camera_fines',
    weight: 9,
    title: 'Traffic Camera Nightmare',
    text: 'You got caught by automated traffic cameras (Saher/Salik) multiple times this month. The fines are massive and block your Iqama renewal.',
    choices: [
      { label: 'Pay out of pocket', effect: 'pay' },
      { label: 'Ignore (risks deportation later)', effect: 'ignore' }
    ]
  },
  {
    id: 'bedspace_drama',
    weight: 6,
    title: 'Roommate Conflict',
    text: 'You share a room with 5 other expats. A massive fight broke out over the AC temperature and someone threatened to call the police.',
    choices: [
      { label: 'De-escalate the situation', effect: 'peace' },
      { label: 'Move to a more expensive studio', effect: 'move' }
    ]
  },
  {
    id: 'child_birth_nationality',
    weight: 5,
    title: 'Child Born in Gulf',
    text: 'Your wife gave birth. Your child is NOT eligible for Gulf citizenship — you must register their nationality with your home country embassy.',
    requiresMarried: true,
    choices: [
      { label: 'Register with embassy', effect: 'register' },
      { label: 'Delay paperwork', effect: 'delay' }
    ]
  },
  {
    id: 'illegal_freelance_caught',
    weight: 5,
    title: 'Caught Moonlighting',
    text: 'You were doing freelance work on the side. The labor authorities caught you working for a non-sponsor.',
    choices: [
      { label: 'Beg for mercy', effect: 'beg' },
      { label: 'Pay heavy bribe', effect: 'bribe' },
      { label: 'Accept deportation', effect: 'deport' }
    ]
  },
  {
    id: 'employer_company_failure',
    weight: 5,
    title: 'Company Going Under',
    text: 'Your employer\'s business is failing. They\'re selling assets. You might be laid off soon.',
    choices: [
      { label: 'Look for new job immediately', effect: 'search' },
      { label: 'Wait and see', effect: 'wait' }
    ]
  },
  {
    id: 'sponsor_death',
    weight: 2,
    title: 'Sponsor Died',
    text: 'Your sponsor passed away. His heir must take over your sponsorship — but might not want to.',
    choices: [
      { label: 'Contact the family', effect: 'contact' },
      { label: 'Look for transfer', effect: 'transfer' }
    ]
  },
  {
    id: 'housing_eviction',
    weight: 6,
    title: 'Housing Eviction',
    text: 'The company housing is being closed. You have 30 days to find your own place.',
    choices: [
      { label: 'Rent nearby apartment', effect: 'rent' },
      { label: 'Move to worker camp', effect: 'camp' }
    ]
  },
  {
    id: 'medical_no_insurance',
    weight: 5,
    title: 'Medical Emergency',
    text: 'You had a health crisis. Your employer didn\'t renew your medical insurance. The hospital bill is massive.',
    choices: [
      { label: 'Pay out of pocket', effect: 'pay' },
      { label: 'Refuse treatment', effect: 'refuse' }
    ]
  },
  {
    id: 'sponsor_wants_noc_bribe',
    weight: 5,
    title: 'Sponsor Wants Bribe',
    text: 'Your sponsor said he\'d sign an NOC for you to change jobs, but only if you pay him a "fee".',
    requiresAttemptedChange: true,
    choices: [
      { label: 'Pay the bribe', effect: 'pay_bribe' },
      { label: 'Refuse', effect: 'refuse' }
    ]
  },
  {
    id: 'recruiter_fee_swindle',
    weight: 4,
    title: 'Recruiter Wants More',
    text: 'The agency that placed you says they need another payment or they\'ll "report issues" to your employer.',
    requiresAgencyPlacement: true,
    choices: [
      { label: 'Pay to make it stop', effect: 'pay' },
      { label: 'Report them to authorities', effect: 'report' }
    ]
  },
  {
    id: 'gulf_layoff',
    weight: 6,
    title: 'Mass Layoff',
    text: 'The company is cutting 40% of the workforce. Your name is on the list.',
    choices: [
      { label: 'Accept severance and leave', effect: 'severance' },
      { label: 'Fight the layoff in labor court', effect: 'fight' }
    ]
  },
  {
    id: 'eid_travel_pressure',
    weight: 7,
    title: 'Eid Holidays Approaching',
    text: 'It is Eid soon. Flight tickets to Cairo are 4x the normal price, but your family is begging you to come visit.',
    choices: [
      { label: 'Buy the overpriced tickets', effect: 'buy' },
      { label: 'Stay in the Gulf alone', effect: 'stay' }
    ]
  },
  {
    id: 'wanted_return_home',
    weight: 8,
    title: 'Family Wants You Home',
    text: 'Your family is putting pressure — "Come home, we miss you, you have saved enough."',
    requiresSpouse: false,
    choices: [
      { label: 'Reassure them and stay', effect: 'reassure' },
      { label: 'Send more money to compensate', effect: 'money' },
      { label: 'Start planning to return', effect: 'plan_return' }
    ]
  },
  {
    id: 'document_lost',
    weight: 4,
    title: 'Iqama Lost',
    text: 'You lost your iqama card. You need to file a police report and pay for a replacement immediately.',
    choices: [
      { label: 'Do it properly', effect: 'proper' },
      { label: 'Delay and risk it', effect: 'delay' }
    ]
  },
  {
    id: 'gulf_wage_rise',
    weight: 8,
    title: 'Unexpected Raise',
    text: 'Your manager called you in. Your performance impressed them. 10% salary increase approved.',
    choice: false
  },
  {
    id: 'sponsor_noc_offer',
    weight: 5,
    title: 'Sponsor Offers NOC',
    text: 'Your sponsor is in a good mood. They signed an NOC without being asked.',
    requiresAttemptedChange: false,
    choice: false
  },
  {
    id: 'gulf_housemaid_rights',
    weight: 4,
    title: 'Worker Rights Talk',
    text: 'A co-worker tells you about your actual legal rights. You didn\'t realize you could complain.',
    choice: false
  },
  {
    id: 'saudi_contract_reform',
    weight: 3,
    title: 'Contract Renewal',
    text: 'Your contract is up for renewal. They want to change your profession code — for the worse.',
    choices: [
      { label: 'Sign the new contract', effect: 'sign' },
      { label: 'Refuse and risk termination', effect: 'refuse' }
    ]
  }
];
window.GULF_DRAMA_EVENTS = GULF_DRAMA_EVENTS;

/* ---------- FAMILY VISIT REQUEST TYPES ---------- */
const GULF_FAMILY_VISIT_TYPES = [
  { id: 'parent_visit',    label: 'Parent', costBonusEGP: 0,    emotional: 15, days_typical: 30 },
  { id: 'sibling_visit',   label: 'Sibling',costBonusEGP: 0,    emotional: 10, days_typical: 21 },
  { id: 'spouse_visit',    label: 'Spouse', costBonusEGP: 0,    emotional: 20, days_typical: 60 },
  { id: 'child_visit',     label: 'Child',  costBonusEGP: 0,    emotional: 25, days_typical: 60 },
  { id: 'extended_visit',  label: 'Extended family', costBonusEGP: 5000, emotional: 8, days_typical: 14 }
];
window.GULF_FAMILY_VISIT_TYPES = GULF_FAMILY_VISIT_TYPES;

console.log('[World Life] 33-data-gulf-work.js loaded (Expanded Events & Costs)');
