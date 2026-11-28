/* ============================================================================
   World Life 2.0 — Canonical 18-Country Profiles, Living Baskets & Era Events
   Tier 1 Hyper-Deep Countries: Egypt, Saudi Arabia, UAE, UK, USA, Germany, Canada
   Tier 2 Full Economic & Legal Countries: Australia, Netherlands, France, Japan,
   Italy, Singapore, Brazil, India, Switzerland, Sweden, Turkey.
   All monetary anchors are 2026 local currency units (scaled by economy.js).
   ========================================================================== */

export const COUNTRIES = {
  egy: {
    id: 'egy',
    name: 'Egypt',
    adjective: 'Egyptian',
    region: 'MENA',
    tier: 1,
    currency: 'EGP',
    currencySymbol: 'EGP',
    flagCode: 'EG',
    defaultReligion: 'muslim',
    passportValidityYears: 7,
    cities: ['Cairo', 'Alexandria', 'New Cairo', 'Sheikh Zayed', 'Mansoura', 'Assiut'],
    examSystem: {
      name: 'Thanaweya Amma',
      code: 'thanaweya',
      tutoringLabel: 'Dorous Khosousia (Private Lessons)',
      tutoringMonthly2026: 4500,
      placementName: 'Tansik (Public University Placement)'
    },
    conscription: {
      enabled: true,
      gender: 'm',
      gradMonths: 12,
      nonGradMonths: 24,
      exemptReasons: ['only_son', 'medical_myopia', 'dual_citizen', 'security_surplus'],
      monthlyStipend2026: 2500
    },
    healthcare: { publicCoveragePct: 0.45, publicQuality: 52, privateQuality: 86, checkup2026: 1800 },
    monthlyBasket2026: {
      foodAdult: 3500,
      foodChild: 2100,
      utilities: 1400,
      transport: 1100,
      phoneInternet: 650,
      rentModest: 5500,
      rentStandard: 11000,
      rentUpscale: 26000
    },
    annualSalaryTiers2026: { entry: 126000, mid: 240000, senior: 480000, lead: 840000, exec: 1500000 },
    historicalHeadlines: {
      1967: 'Six-Day War rattles the region; wartime austerity grips Egyptian households.',
      1973: 'October War & Suez crossing reshape national pride; Gulf oil boom opens new migration doors.',
      1974: 'Infitah (Open Door policy) transforms imports, private business, and Cairo street life.',
      1991: 'Economic reform & float push the pound past 3 EGP to the dollar.',
      2003: 'The pound floats from 3.4 to nearly 6 EGP/USD; imported goods jump overnight.',
      2011: 'January 25th protests fill Tahrir Square; curfews, uncertainty, and fierce debate sweep every home.',
      2016: 'The pound is floated in November and loses about half its value; the big state banks launch 20% certificates of deposit.',
      2020: 'COVID-19 reaches Egypt in the spring; from late March curfews shutter cafes, schools, and airports.',
      2023: 'Steep currency devaluations push families toward gold, real estate installments, and Gulf offers.'
    }
  },

  sau: {
    id: 'sau',
    name: 'Saudi Arabia',
    adjective: 'Saudi',
    region: 'Gulf',
    tier: 1,
    currency: 'SAR',
    currencySymbol: 'SAR',
    flagCode: 'SA',
    defaultReligion: 'muslim',
    passportValidityYears: 10,
    cities: ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca', 'Medina'],
    examSystem: {
      name: 'Tawjihi + Qudurat & Tahsili',
      code: 'qudurat',
      tutoringLabel: 'Qudurat Prep Course',
      tutoringMonthly2026: 900,
      placementName: 'Unified University Admission'
    },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.85, publicQuality: 80, privateQuality: 90, checkup2026: 450 },
    monthlyBasket2026: {
      foodAdult: 1900,
      foodChild: 1100,
      utilities: 650,
      transport: 750,
      phoneInternet: 380,
      rentModest: 2600,
      rentStandard: 4800,
      rentUpscale: 10500
    },
    annualSalaryTiers2026: { entry: 96000, mid: 180000, senior: 312000, lead: 480000, exec: 780000 },
    expatRules: {
      system: 'kafala_qiwa',
      permitName: 'Iqama',
      exitReentryRequired: true,
      dependentFeeMonthlySAR: 400, // In force from July 2017+
      dependentFeeStartYear: 2017,
      minSalaryForFamilySAR: 6000,
      graceDays: 60
    },
    historicalHeadlines: {
      1973: 'Oil boom unleashes historic infrastructure expansion across Riyadh, Jeddah, and the Eastern Province.',
      1990: 'Gulf War brings regional tension before post-war stability returns.',
      2005: 'King Abdullah Scholarship Program sends tens of thousands of young Saudis to top Western universities.',
      2016: 'Vision 2030 launches a sweeping transformation of Saudi work, entertainment, and housing.',
      2017: 'Expat dependent levy (Murafiqeen fee) begins reshaping expat family budgets across the Kingdom.',
      2018: 'Women take the wheel and cinemas reopen across Riyadh and Jeddah for the first time since 1983.',
      2020: 'COVID-19 lockdowns and VAT hike to 15% test household budgets.',
      2022: 'Personal Status Law codifies marriage, mahr, custody, and guardian rules nationwide.'
    }
  },

  uae: {
    id: 'uae',
    name: 'United Arab Emirates',
    adjective: 'Emirati',
    region: 'Gulf',
    tier: 1,
    currency: 'AED',
    currencySymbol: 'AED',
    flagCode: 'AE',
    defaultReligion: 'muslim',
    passportValidityYears: 10,
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain'],
    examSystem: {
      name: 'EmSAT / UAE Ministry Secondary',
      code: 'emsat',
      tutoringLabel: 'EmSAT & IELTS Coaching',
      tutoringMonthly2026: 1200,
      placementName: 'NAPO / University Admission'
    },
    conscription: { enabled: true, gender: 'm', citizenOnly: true, gradMonths: 11, nonGradMonths: 24, monthlyStipend2026: 6000, startYear: 2014 },
    healthcare: { publicCoveragePct: 0.85, publicQuality: 85, privateQuality: 93, checkup2026: 550 },
    monthlyBasket2026: {
      foodAdult: 2600,
      foodChild: 1500,
      utilities: 950,
      transport: 1050,
      phoneInternet: 480,
      rentModest: 4500,
      rentStandard: 7800,
      rentUpscale: 16500
    },
    annualSalaryTiers2026: { entry: 102000, mid: 228000, senior: 408000, lead: 624000, exec: 1020000 },
    expatRules: {
      system: 'emirates_id',
      permitName: 'UAE Residence Visa & Emirates ID',
      exitReentryRequired: false,
      dependentFeeMonthlyAED: 0,
      minSalaryForFamilyAED: 4000,
      goldenVisaMinSalaryAED: 30000,
      goldenVisaMinPropertyAED: 2000000,
      goldenVisaStartYear: 2019,
      graceDays: 60
    },
    historicalHeadlines: {
      1971: 'The seven Emirates unite to form the UAE; ports and cities rise along the Gulf.',
      1999: 'Burj Al Arab opens as Dubai cements its status as a global trade and tourism hub.',
      2002: 'Dubai opens freehold property ownership to foreigners, igniting a massive real-estate boom.',
      2009: 'Global credit crunch hits Dubai construction before Abu Dhabi support and Burj Khalifa opening.',
      2019: 'UAE introduces the 10-year Golden Visa for investors, doctors, engineers, and top talent.',
      2020: 'Expo preparations pause for COVID-19 before rapid vaccination reopens Dubai to the world.',
      2022: 'UAE shifts to a Monday–Friday workweek and overhauls residency and civil family laws.'
    }
  },

  gbr: {
    id: 'gbr',
    name: 'United Kingdom',
    adjective: 'British',
    region: 'Europe',
    tier: 1,
    currency: 'GBP',
    currencySymbol: '£',
    flagCode: 'GB',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Bristol', 'Cambridge'],
    examSystem: {
      name: 'GCSEs & A-Levels',
      code: 'alevels',
      tutoringLabel: 'A-Level Subject Tutoring',
      tutoringMonthly2026: 260,
      placementName: 'UCAS Application'
    },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.92, publicQuality: 78, privateQuality: 92, checkup2026: 180 },
    monthlyBasket2026: {
      foodAdult: 340,
      foodChild: 210,
      utilities: 240,
      transport: 170,
      phoneInternet: 55,
      rentModest: 950,
      rentStandard: 1550,
      rentUpscale: 2900
    },
    annualSalaryTiers2026: { entry: 28000, mid: 46000, senior: 76000, lead: 108000, exec: 165000 },
    historicalHeadlines: {
      1975: 'Inflation tops 24% across Britain amid energy strikes and three-day weeks.',
      1986: 'Big Bang deregulation transforms the City of London into a global finance powerhouse.',
      1997: 'Cool Britannia optimism sweeps London as house prices begin a long climb.',
      2008: 'Northern Rock and RBS bailouts shake British banking and freeze graduate hiring.',
      2016: 'Brexit referendum splits households and drops the pound overnight.',
      2020: 'COVID-19 lockdowns and furlough schemes reshape work across the UK.',
      2022: 'Energy bills and mortgage rates surge across Britain; no-fault divorce law takes effect.'
    }
  },

  usa: {
    id: 'usa',
    name: 'United States',
    adjective: 'American',
    region: 'North America',
    tier: 1,
    currency: 'USD',
    currencySymbol: '$',
    flagCode: 'US',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['New York', 'San Francisco', 'Austin', 'Chicago', 'Boston', 'Houston'],
    examSystem: {
      name: 'High School GPA & SAT',
      code: 'sat',
      tutoringLabel: 'SAT & AP Prep',
      tutoringMonthly2026: 350,
      placementName: 'Common App Admissions'
    },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.25, publicQuality: 70, privateQuality: 95, checkup2026: 320 },
    monthlyBasket2026: {
      foodAdult: 520,
      foodChild: 320,
      utilities: 260,
      transport: 280,
      phoneInternet: 95,
      rentModest: 1350,
      rentStandard: 2150,
      rentUpscale: 3900
    },
    annualSalaryTiers2026: { entry: 48000, mid: 82000, senior: 132000, lead: 185000, exec: 280000 },
    historicalHeadlines: {
      1979: 'Oil lines and Volcker interest-rate hikes push US mortgage rates into double digits.',
      1999: 'Dot-com euphoria mints overnight startups from Silicon Valley to Boston.',
      2001: 'Dot-com bust and 9/11 tighten airport security and US visa background checks.',
      2008: 'Subprime mortgage crash triggers the Great Recession and mass layoffs.',
      2020: 'COVID-19 lockdowns spark remote work and stimulus checks nationwide.',
      2022: 'Inflation spikes to a 40-year high while tech layoffs and H-1B competition intensify.'
    }
  },

  deu: {
    id: 'deu',
    name: 'Germany',
    adjective: 'German',
    region: 'Europe',
    tier: 1,
    currency: 'EUR',
    currencySymbol: '€',
    flagCode: 'DE',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Stuttgart'],
    examSystem: {
      name: 'Abitur',
      code: 'abitur',
      tutoringLabel: 'Nachhilfe (Abitur Prep)',
      tutoringMonthly2026: 220,
      placementName: 'Hochschulstart / Uni Admission'
    },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.90, publicQuality: 88, privateQuality: 94, checkup2026: 120 },
    monthlyBasket2026: {
      foodAdult: 390,
      foodChild: 230,
      utilities: 270,
      transport: 110,
      phoneInternet: 55,
      rentModest: 820,
      rentStandard: 1320,
      rentUpscale: 2350
    },
    annualSalaryTiers2026: { entry: 42000, mid: 62000, senior: 88000, lead: 118000, exec: 170000 },
    historicalHeadlines: {
      1989: 'The Berlin Wall falls, opening a new era across Germany.',
      1990: 'German Reunification merges East and West.',
      2002: 'Euro banknotes and coins replace the Deutsche Mark.',
      2012: 'EU Blue Card opens streamlined residency for skilled non-EU engineers and doctors.',
      2022: 'European energy shock drives up heating bills; Opportunity Card & citizenship reforms advance.'
    }
  },

  can: {
    id: 'can',
    name: 'Canada',
    adjective: 'Canadian',
    region: 'North America',
    tier: 1,
    currency: 'CAD',
    currencySymbol: 'C$',
    flagCode: 'CA',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
    examSystem: {
      name: 'Provincial Secondary Diploma',
      code: 'ossd',
      tutoringLabel: 'Honours Math & Science Prep',
      tutoringMonthly2026: 280,
      placementName: 'OUAC / Provincial University Portal'
    },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.88, publicQuality: 80, privateQuality: 90, checkup2026: 140 },
    monthlyBasket2026: {
      foodAdult: 520,
      foodChild: 310,
      utilities: 230,
      transport: 210,
      phoneInternet: 95,
      rentModest: 1550,
      rentStandard: 2350,
      rentUpscale: 3700
    },
    annualSalaryTiers2026: { entry: 50000, mid: 78000, senior: 115000, lead: 152000, exec: 225000 },
    historicalHeadlines: {
      2015: 'Canada launches Express Entry CRS points system for skilled immigrants.',
      2020: 'Border closures and remote work reshape Toronto and Vancouver.',
      2024: 'Canada caps study permits with Provincial Attestation Letters (PAL) and doubles GIC requirements.'
    }
  },

  aus: {
    id: 'aus',
    name: 'Australia',
    adjective: 'Australian',
    region: 'Oceania',
    tier: 2,
    currency: 'AUD',
    currencySymbol: 'A$',
    flagCode: 'AU',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
    examSystem: { name: 'ATAR / HSC', code: 'atar', tutoringLabel: 'ATAR Coaching', tutoringMonthly2026: 300, placementName: 'UAC / VTAC' },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.88, publicQuality: 85, privateQuality: 92, checkup2026: 130 },
    monthlyBasket2026: { foodAdult: 560, foodChild: 330, utilities: 250, transport: 220, phoneInternet: 85, rentModest: 1750, rentStandard: 2550, rentUpscale: 4100 },
    annualSalaryTiers2026: { entry: 62000, mid: 96000, senior: 140000, lead: 185000, exec: 265000 },
    historicalHeadlines: { 2000: 'Sydney Olympics showcase Australia on the world stage.', 2022: 'Post-pandemic rent and housing squeeze hits Sydney and Melbourne.' }
  },

  nld: {
    id: 'nld',
    name: 'Netherlands',
    adjective: 'Dutch',
    region: 'Europe',
    tier: 2,
    currency: 'EUR',
    currencySymbol: '€',
    flagCode: 'NL',
    defaultReligion: 'secular',
    passportValidityYears: 10,
    cities: ['Amsterdam', 'Rotterdam', 'Eindhoven', 'Utrecht'],
    examSystem: { name: 'VWO Diploma', code: 'vwo', tutoringLabel: 'Bijles Exam Prep', tutoringMonthly2026: 220, placementName: 'Studielink' },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.86, publicQuality: 87, privateQuality: 92, checkup2026: 140 },
    monthlyBasket2026: { foodAdult: 380, foodChild: 220, utilities: 240, transport: 140, phoneInternet: 60, rentModest: 1050, rentStandard: 1650, rentUpscale: 2750 },
    annualSalaryTiers2026: { entry: 40000, mid: 60000, senior: 88000, lead: 120000, exec: 175000 },
    historicalHeadlines: { 2002: 'The Euro replaces the Dutch Guilder.', 2023: 'Housing shortages make Amsterdam rentals fiercely competitive.' }
  },

  fra: {
    id: 'fra',
    name: 'France',
    adjective: 'French',
    region: 'Europe',
    tier: 2,
    currency: 'EUR',
    currencySymbol: '€',
    flagCode: 'FR',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['Paris', 'Lyon', 'Toulouse', 'Marseille'],
    examSystem: { name: 'Baccalauréat', code: 'bac', tutoringLabel: 'Cours Particuliers', tutoringMonthly2026: 210, placementName: 'Parcoursup' },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.90, publicQuality: 88, privateQuality: 93, checkup2026: 110 },
    monthlyBasket2026: { foodAdult: 380, foodChild: 220, utilities: 210, transport: 95, phoneInternet: 50, rentModest: 850, rentStandard: 1400, rentUpscale: 2500 },
    annualSalaryTiers2026: { entry: 34000, mid: 50000, senior: 74000, lead: 102000, exec: 155000 },
    historicalHeadlines: { 2002: 'France adopts the Euro.', 2023: 'Pension-age protests fill French boulevards.' }
  },

  jpn: {
    id: 'jpn',
    name: 'Japan',
    adjective: 'Japanese',
    region: 'Asia',
    tier: 2,
    currency: 'JPY',
    currencySymbol: '¥',
    flagCode: 'JP',
    defaultReligion: 'secular',
    passportValidityYears: 10,
    cities: ['Tokyo', 'Osaka', 'Yokohama', 'Kyoto'],
    examSystem: { name: 'Common University Entrance Exam', code: 'kyotsu', tutoringLabel: 'Juku (Cram School)', tutoringMonthly2026: 38000, placementName: 'National / Private Exam' },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.70, publicQuality: 90, privateQuality: 93, checkup2026: 15000 },
    monthlyBasket2026: { foodAdult: 52000, foodChild: 30000, utilities: 22000, transport: 16000, phoneInternet: 8000, rentModest: 85000, rentStandard: 145000, rentUpscale: 280000 },
    annualSalaryTiers2026: { entry: 3800000, mid: 5800000, senior: 8600000, lead: 12000000, exec: 18500000 },
    historicalHeadlines: { 1991: 'Japan asset bubble bursts, ushering in decades of low inflation.', 2024: 'Bank of Japan ends negative rates as the yen weakens.' }
  },

  ita: {
    id: 'ita',
    name: 'Italy',
    adjective: 'Italian',
    region: 'Europe',
    tier: 2,
    currency: 'EUR',
    currencySymbol: '€',
    flagCode: 'IT',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['Milan', 'Rome', 'Turin', 'Bologna'],
    examSystem: { name: 'Esame di Maturità', code: 'maturita', tutoringLabel: 'Ripetizioni', tutoringMonthly2026: 180, placementName: 'Immatricolazione' },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.88, publicQuality: 82, privateQuality: 90, checkup2026: 110 },
    monthlyBasket2026: { foodAdult: 350, foodChild: 210, utilities: 200, transport: 90, phoneInternet: 45, rentModest: 750, rentStandard: 1250, rentUpscale: 2200 },
    annualSalaryTiers2026: { entry: 28000, mid: 42000, senior: 64000, lead: 90000, exec: 138000 },
    historicalHeadlines: { 2002: 'Euro replaces the Italian Lira.', 2020: 'Northern Italy faces Europe’s earliest COVID-19 lockdown.' }
  },

  sgp: {
    id: 'sgp',
    name: 'Singapore',
    adjective: 'Singaporean',
    region: 'Asia',
    tier: 2,
    currency: 'SGD',
    currencySymbol: 'S$',
    flagCode: 'SG',
    defaultReligion: 'secular',
    passportValidityYears: 10,
    cities: ['Singapore'],
    examSystem: { name: 'Singapore-Cambridge GCE A-Levels', code: 'sg_alevels', tutoringLabel: 'Tuition Centre', tutoringMonthly2026: 450, placementName: 'Joint Admissions' },
    conscription: { enabled: true, gender: 'm', citizenOnly: true, gradMonths: 24, nonGradMonths: 24, monthlyStipend2026: 750 },
    healthcare: { publicCoveragePct: 0.75, publicQuality: 92, privateQuality: 96, checkup2026: 220 },
    monthlyBasket2026: { foodAdult: 650, foodChild: 380, utilities: 240, transport: 180, phoneInternet: 65, rentModest: 2100, rentStandard: 3600, rentUpscale: 6500 },
    annualSalaryTiers2026: { entry: 54000, mid: 88000, senior: 138000, lead: 195000, exec: 310000 },
    historicalHeadlines: { 1965: 'Singapore becomes an independent republic.', 2023: 'Expat Employment Pass COMPASS framework raises salary bars.' }
  },

  bra: {
    id: 'bra',
    name: 'Brazil',
    adjective: 'Brazilian',
    region: 'Americas',
    tier: 2,
    currency: 'BRL',
    currencySymbol: 'R$',
    flagCode: 'BR',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Brasília'],
    examSystem: { name: 'ENEM', code: 'enem', tutoringLabel: 'Cursinho Pré-Vestibular', tutoringMonthly2026: 650, placementName: 'SiSU' },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.65, publicQuality: 60, privateQuality: 88, checkup2026: 420 },
    monthlyBasket2026: { foodAdult: 1100, foodChild: 650, utilities: 450, transport: 380, phoneInternet: 160, rentModest: 1800, rentStandard: 3200, rentUpscale: 6800 },
    annualSalaryTiers2026: { entry: 38000, mid: 72000, senior: 138000, lead: 220000, exec: 380000 },
    historicalHeadlines: { 1994: 'Plano Real tames hyperinflation with a new currency.', 2014: 'Deep recession tests Brazilian households.' }
  },

  ind: {
    id: 'ind',
    name: 'India',
    adjective: 'Indian',
    region: 'Asia',
    tier: 2,
    currency: 'INR',
    currencySymbol: '₹',
    flagCode: 'IN',
    defaultReligion: 'hindu',
    passportValidityYears: 10,
    cities: ['Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune'],
    examSystem: { name: 'CBSE Class XII + JEE/NEET', code: 'cbse', tutoringLabel: 'Coaching Institute', tutoringMonthly2026: 8500, placementName: 'JoSAA / University Counselling' },
    conscription: { enabled: false },
    healthcare: { publicCoveragePct: 0.40, publicQuality: 54, privateQuality: 89, checkup2026: 3500 },
    monthlyBasket2026: { foodAdult: 9500, foodChild: 5500, utilities: 4200, transport: 3800, phoneInternet: 900, rentModest: 15000, rentStandard: 32000, rentUpscale: 75000 },
    annualSalaryTiers2026: { entry: 480000, mid: 1100000, senior: 2400000, lead: 4200000, exec: 7800000 },
    historicalHeadlines: { 1991: 'Economic liberalization opens India’s tech and private sectors.', 2016: 'Demonetization and UPI digital payments transform everyday money.' }
  },

  che: {
    id: 'che',
    name: 'Switzerland',
    adjective: 'Swiss',
    region: 'Europe',
    tier: 2,
    currency: 'CHF',
    currencySymbol: 'CHF',
    flagCode: 'CH',
    defaultReligion: 'christian',
    passportValidityYears: 10,
    cities: ['Zurich', 'Geneva', 'Bern', 'Basel', 'Lausanne'],
    examSystem: {
      name: 'Matura / Maturité',
      code: 'matura',
      tutoringLabel: 'Matura Prep Course',
      tutoringMonthly2026: 350,
      placementName: 'Cantonal Matura & University Admission'
    },
    conscription: {
      enabled: true,
      gender: 'm',
      gradMonths: 6,
      nonGradMonths: 6,
      exemptReasons: ['medical', 'civilian_service'],
      monthlyStipend2026: 1900,
      citizenOnly: true
    },
    healthcare: { publicCoveragePct: 0.99, publicQuality: 90, privateQuality: 94, checkup2026: 250 },
    monthlyBasket2026: {
      foodAdult: 650,
      foodChild: 380,
      utilities: 220,
      transport: 150,
      phoneInternet: 90,
      rentModest: 1400,
      rentStandard: 2200,
      rentUpscale: 4200
    },
    annualSalaryTiers2026: { entry: 65000, mid: 85000, senior: 120000, lead: 160000, exec: 250000 },
    historicalHeadlines: {
      1971: 'Women win the vote in federal elections after decades of cantonal holdouts.',
      1992: 'Voters reject joining the European Economic Area; Switzerland stays outside the EU.',
      2002: 'Switzerland joins the United Nations after a referendum ends decades of staying out.',
      2015: 'The franc unpegs from the euro and soars overnight; exporters and cross-border shoppers reel.',
      2020: 'COVID-19 closes schools and borders; the federal government pays short-time work support.',
      2023: 'Credit Suisse collapses and is taken over by UBS in a state-brokered rescue.'
    }
  },

  swe: {
    id: 'swe',
    name: 'Sweden',
    adjective: 'Swedish',
    region: 'Europe',
    tier: 2,
    currency: 'SEK',
    currencySymbol: 'SEK',
    flagCode: 'SE',
    defaultReligion: 'christian',
    passportValidityYears: 5,
    cities: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Umeå'],
    examSystem: {
      name: 'Gymnasiet & Högskoleprovet',
      code: 'gymnasiet',
      tutoringLabel: 'Högskoleprovet Prep',
      tutoringMonthly2026: 600,
      placementName: 'Antagning.se University Admission'
    },
    conscription: {
      enabled: true,
      gender: 'all',
      gradMonths: 11,
      nonGradMonths: 11,
      exemptReasons: ['medical'],
      monthlyStipend2026: 5500,
      citizenOnly: true,
      startYear: 2017
    },
    healthcare: { publicCoveragePct: 0.99, publicQuality: 88, privateQuality: 90, checkup2026: 300 },
    monthlyBasket2026: {
      foodAdult: 3500,
      foodChild: 2000,
      utilities: 1500,
      transport: 900,
      phoneInternet: 400,
      rentModest: 8000,
      rentStandard: 13000,
      rentUpscale: 25000
    },
    annualSalaryTiers2026: { entry: 360000, mid: 480000, senior: 650000, lead: 850000, exec: 1400000 },
    historicalHeadlines: {
      1975: 'A new constitution strips the king of political power; Sweden becomes a ceremonial monarchy.',
      1986: 'Prime Minister Olof Palme is assassinated on a Stockholm street; the murder is never solved.',
      1995: 'Sweden joins the European Union after a narrow referendum.',
      2003: 'Voters reject the euro; Sweden keeps the krona.',
      2020: 'COVID-19 takes a light-touch path — no lockdowns, but high deaths in care homes.',
      2024: 'Sweden joins NATO, ending two centuries of military non-alignment.'
    }
  },

  tur: {
    id: 'tur',
    name: 'Turkey',
    adjective: 'Turkish',
    region: 'Europe',
    tier: 2,
    currency: 'TRY',
    currencySymbol: 'TRY',
    flagCode: 'TR',
    defaultReligion: 'muslim',
    passportValidityYears: 10,
    cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'],
    examSystem: {
      name: 'YKS (University Entrance Exam)',
      code: 'yks',
      tutoringLabel: 'Dershane / YKS Prep Course',
      tutoringMonthly2026: 8000,
      placementName: 'ÖSYM Placement'
    },
    conscription: {
      enabled: true,
      gender: 'm',
      gradMonths: 6,
      nonGradMonths: 6,
      exemptReasons: ['medical', 'only_son_deferment', 'paid_exemption'],
      monthlyStipend2026: 3000,
      citizenOnly: true
    },
    healthcare: { publicCoveragePct: 0.85, publicQuality: 70, privateQuality: 85, checkup2026: 1500 },
    monthlyBasket2026: {
      foodAdult: 12000,
      foodChild: 7000,
      utilities: 6000,
      transport: 3500,
      phoneInternet: 1200,
      rentModest: 25000,
      rentStandard: 45000,
      rentUpscale: 90000
    },
    annualSalaryTiers2026: { entry: 420000, mid: 720000, senior: 1200000, lead: 1800000, exec: 3600000 },
    historicalHeadlines: {
      1974: 'Turkey intervenes in Cyprus; the island splits and sanctions follow.',
      1980: 'A military coup suspends politics; generals rule until 1983.',
      1999: 'The İzmit earthquake kills over 17,000 and exposes shoddy construction.',
      2001: 'Economic crisis forces the lira to float; a banking collapse wipes out savings.',
      2002: 'The AKP wins power and begins two decades of rule.',
      2016: 'A failed coup attempt triggers mass purges across the army, courts and schools.',
      2023: 'Twin earthquakes in Kahramanmaraş kill over 50,000 across the south-east.'
    }
  }
};

export const COUNTRY_IDS = Object.keys(COUNTRIES);

export function getCountry(countryId) {
  return COUNTRIES[countryId] || COUNTRIES.egy;
}

export function formatMoney(amount, countryIdOrCurrency = 'egy', compact = false) {
  const n = Number(amount) || 0;
  const sign = n < 0 ? '−' : '';
  const abs = Math.abs(n);
  const cObj = COUNTRIES[countryIdOrCurrency];
  const code = cObj ? cObj.currency : String(countryIdOrCurrency || 'USD').toUpperCase();

  if (compact && abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M ${code}`;
  }
  const rounded = abs >= 100 ? Math.round(abs) : Math.round(abs * 100) / 100;
  return `${sign}${rounded.toLocaleString('en-US')} ${code}`;
}
