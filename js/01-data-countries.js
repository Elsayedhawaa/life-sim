/* ============================================================
   DATA: COUNTRIES
   ============================================================
   TO ADD A NEW COUNTRY: copy egy: { ... }, change id/name/flag/currency/rate/salary/prices/schools/universities/jobs/events.
   TO ADD A JOB TO EGYPT: find COUNTRIES.egy.jobs, copy a { ... } block.
   TO ADD A UNIVERSITY: find COUNTRIES.egy.universities, copy a { ... } block.
   ============================================================ */

const COUNTRIES = {
  egy: {
    id: 'egy', name: 'Egypt', flag: '🇪🇬',
    currency: 'EGP', rate: 52.7,
    salary: 84000,
    prices: { food: 54000, phone: 4800, transport: 8000, rent: 120000 },
    salaryTiers: { entry: 84000, mid: 180000, senior: 360000, exec: 700000 },
    schools: [
      { id: 'national', name: 'National School', cost: 0, smarts: 1.0 },
      { id: 'private', name: 'Private School', cost: 25000, smarts: 1.4 },
      { id: 'international', name: 'International School', cost: 280000, smarts: 1.7 },
    ],
    universities: [
      { id: 'cairo', name: 'Cairo University', type: 'public', tuition: 12000, cutoff: 78 },
      { id: 'alex', name: 'Alexandria University', type: 'public', tuition: 12000, cutoff: 75 },
      { id: 'ain', name: 'Ain Shams University', type: 'public', tuition: 12000, cutoff: 72 },
      { id: 'auc', name: 'American University in Cairo', type: 'private', tuition: 600000, cutoff: 60 },
      { id: 'guc', name: 'German University in Cairo', type: 'private', tuition: 300000, cutoff: 60 },
      { id: 'bue', name: 'British University in Egypt', type: 'private', tuition: 250000, cutoff: 58 },
      { id: 'aastmt', name: 'Arab Academy for Science & Tech', type: 'private', tuition: 200000, cutoff: 55 },
      { id: 'miu', name: 'Misr International University', type: 'private', tuition: 200000, cutoff: 55 },
    ],
    jobs: [
      { id: 'egy_bpo_en', title: 'Customer Service (English)', company: 'Vodafone VOIS', salary: 84000, minAge: 18, degree: null },
      { id: 'egy_bpo_de', title: 'Customer Service (German)', company: 'Teleperformance', salary: 180000, minAge: 18, degree: null },
      { id: 'egy_cashier', title: 'Cashier', company: 'Spinneys', salary: 48000, minAge: 18, degree: null },
      { id: 'egy_acct', title: 'Junior Accountant', company: 'CIB', salary: 144000, minAge: 22, degree: 'business' },
      { id: 'egy_dev', title: 'Junior Developer', company: 'Fawry', salary: 216000, minAge: 22, degree: 'cs' },
      { id: 'egy_bank', title: 'Banking Operations', company: 'NBE', salary: 120000, minAge: 22, degree: 'business' },
      { id: 'egy_law', title: 'Junior Legal Associate', company: 'Matouk Bassiouny', salary: 96000, minAge: 22, degree: 'law' },
      { id: 'egy_doc', title: 'Imtyaz Doctor', company: 'Government Hospital', salary: 42000, minAge: 24, degree: 'medicine' },
      { id: 'egy_eng_site', title: 'Site Engineer', company: 'Orascom Construction', salary: 132000, minAge: 22, degree: 'engineering' },
      { id: 'egy_eng_jr', title: 'Junior Engineer', company: 'Hassan Allam', salary: 120000, minAge: 22, degree: 'engineering' },
      { id: 'egy_bio_lab', title: 'Lab Technician', company: 'Eva Pharma', salary: 96000, minAge: 22, degree: 'biology' },
      { id: 'egy_bio_qa', title: 'QA Analyst', company: 'Ibnsina Pharma', salary: 108000, minAge: 22, degree: 'biology' },
    ],
    events: [
      { id: 'egy_blackout', minAge: 20, maxAge: 40,
        title: 'Summer blackout',
        text: 'The power cuts for 4 hours. The AC dies. It is 41°C in Cairo.',
        choices: [
          { label: 'Buy a rechargeable fan (800 EGP)', effect: s => { s.wealth -= 800; s.happiness += 2; } },
          { label: 'Suffer in silence', effect: s => { s.happiness -= 5; s.health -= 2; } },
        ]
      },
      { id: 'egy_egp_crash', minAge: 22, maxAge: 45,
        title: 'The pound slips again',
        text: 'You check an iPhone price. It costs 3 months of your salary.',
        choices: [
          { label: 'Buy gold to protect savings', effect: s => { if (s.wealth > 50000) { s.wealth -= 50000; s.flags.goldHedge = true; s.happiness += 3; } else { s.happiness -= 2; } } },
          { label: 'Keep saving in EGP', effect: s => { s.happiness -= 3; s.flags.egpRisk = true; } },
        ]
      },
    ],
  },

  usa: {
    id: 'usa', name: 'United States', flag: '🇺🇸',
    currency: 'USD', rate: 1,
    salary: 63000,
    prices: { food: 6000, phone: 720, transport: 2400, rent: 18000 },
    salaryTiers: { entry: 45000, mid: 75000, senior: 120000, exec: 200000 },
    schools: [
      { id: 'public', name: 'Public School', cost: 0, smarts: 1.1 },
      { id: 'private', name: 'Private School', cost: 18000, smarts: 1.5 },
    ],
    universities: [
      { id: 'state', name: 'State University', type: 'public', tuition: 22000, cutoff: 60 },
      { id: 'uc_berkeley', name: 'UC Berkeley', type: 'public', tuition: 48000, cutoff: 85 },
      { id: 'harvard', name: 'Harvard', type: 'private', tuition: 60000, cutoff: 90 },
      { id: 'mit', name: 'MIT', type: 'private', tuition: 62000, cutoff: 92 },
      { id: 'stanford', name: 'Stanford', type: 'private', tuition: 62000, cutoff: 90 },
    ],
    jobs: [
      { id: 'usa_retail', title: 'Retail Associate', company: 'Walmart', salary: 35000, minAge: 18, degree: null },
      { id: 'usa_warehouse', title: 'Warehouse Worker', company: 'Amazon', salary: 38000, minAge: 18, degree: null },
      { id: 'usa_dev', title: 'Software Engineer', company: 'Google', salary: 120000, minAge: 22, degree: 'cs' },
      { id: 'usa_bank', title: 'Financial Analyst', company: 'JPMorgan', salary: 95000, minAge: 22, degree: 'business' },
      { id: 'usa_nurse', title: 'Registered Nurse', company: 'Kaiser Permanente', salary: 85000, minAge: 22, degree: 'medicine' },
      { id: 'usa_lawyer', title: 'Associate Attorney', company: 'Skadden', salary: 215000, minAge: 25, degree: 'law' },
      { id: 'usa_eng', title: 'Civil Engineer', company: 'Bechtel', salary: 78000, minAge: 22, degree: 'engineering' },
      { id: 'usa_bio', title: 'Lab Researcher', company: 'Pfizer', salary: 72000, minAge: 22, degree: 'biology' },
    ],
    events: [
      { id: 'usa_student_debt', minAge: 22, maxAge: 26,
        title: 'First student loan bill',
        text: 'You graduated. First payment arrives: $450/month.',
        choices: [
          { label: 'Pay it and live tight', effect: s => { s.wealth -= 5400; s.happiness -= 4; } },
          { label: 'Defer it', effect: s => { s.flags.loanDeferred = true; s.happiness += 2; } },
        ]
      },
      { id: 'usa_health_bill', minAge: 25, maxAge: 45,
        title: 'The hospital bill',
        text: 'Short ER visit. The bill is $3,200 before insurance.',
        choices: [
          { label: 'Pay it', effect: s => { s.wealth -= 3200; } },
          { label: 'Set up a payment plan', effect: s => { s.wealth -= 500; s.flags.medicalDebt = 2700; s.happiness -= 2; } },
        ]
      },
    ],
  },

  sau: {
    id: 'sau', name: 'Saudi Arabia', flag: '🇸🇦',
    currency: 'SAR', rate: 3.75,
    salary: 96000,
    prices: { food: 30000, phone: 2400, transport: 6000, rent: 60000 },
    salaryTiers: { entry: 96000, mid: 180000, senior: 300000, exec: 500000 },
    schools: [
      { id: 'public', name: 'Public School', cost: 0, smarts: 1.0 },
      { id: 'private', name: 'Private School', cost: 40000, smarts: 1.4 },
    ],
    universities: [
      { id: 'ksu', name: 'King Saud University', type: 'public', tuition: 0, cutoff: 75 },
      { id: 'kfupm', name: 'KFUPM', type: 'public', tuition: 0, cutoff: 85 },
      { id: 'kaust', name: 'KAUST', type: 'private', tuition: 80000, cutoff: 90 },
    ],
    jobs: [
      { id: 'sau_aramco', title: 'Engineer', company: 'Aramco', salary: 240000, minAge: 22, degree: 'engineering' },
      { id: 'sau_bank', title: 'Banker', company: 'SNB', salary: 180000, minAge: 22, degree: 'business' },
      { id: 'sau_retail', title: 'Retail Associate', company: 'Al Rajhi', salary: 60000, minAge: 18, degree: null },
      { id: 'sau_dev', title: 'Software Developer', company: 'STC', salary: 216000, minAge: 22, degree: 'cs' },
      { id: 'sau_lawyer', title: 'Legal Advisor', company: 'Saudi Aramco Legal', salary: 264000, minAge: 22, degree: 'law' },
      { id: 'sau_doc', title: 'Physician', company: 'King Faisal Hospital', salary: 300000, minAge: 24, degree: 'medicine' },
    ],
    events: [
      { id: 'sau_iqama', minAge: 22, maxAge: 40,
        title: 'Iqama renewal',
        text: 'Your residence permit is up for renewal. Employer is deciding.',
        choices: [
          { label: 'Wait and hope', effect: s => { s.flags.iqamaRisk = true; } },
          { label: 'Ask employer for sponsorship', effect: s => { s.flags.iqamaSafe = true; s.happiness += 2; } },
        ]
      }
    ]
  },

  uae: {
    id: 'uae', name: 'United Arab Emirates', flag: '🇦🇪',
    currency: 'AED', rate: 3.67,
    salary: 144000,
    prices: { food: 36000, phone: 3000, transport: 9000, rent: 85000 },
    salaryTiers: { entry: 90000, mid: 240000, senior: 420000, exec: 750000 },
    schools: [
      { id: 'public', name: 'Public School (Locals)', cost: 0, smarts: 1.0 },
      { id: 'private', name: 'International School', cost: 45000, smarts: 1.5 },
    ],
    universities: [
      { id: 'uaeu', name: 'UAE University', type: 'public', tuition: 25000, cutoff: 70 },
      { id: 'aus', name: 'American University of Sharjah', type: 'private', tuition: 95000, cutoff: 75 },
      { id: 'nyuad', name: 'NYU Abu Dhabi', type: 'private', tuition: 220000, cutoff: 92 },
    ],
    jobs: [
      { id: 'uae_sales', title: 'Real Estate Broker', company: 'Emaar', salary: 120000, minAge: 20, degree: null },
      { id: 'uae_cab', title: 'Aviation Crew', company: 'Emirates', salary: 140000, minAge: 21, degree: null },
      { id: 'uae_bank', title: 'Financial Consultant', company: 'Emirates NBD', salary: 280000, minAge: 22, degree: 'business' },
      { id: 'uae_dev', title: 'Senior Developer', company: 'Careem', salary: 350000, minAge: 22, degree: 'cs' },
      { id: 'uae_eng', title: 'Petroleum Engineer', company: 'ADNOC', salary: 380000, minAge: 22, degree: 'engineering' },
      { id: 'uae_law', title: 'Corporate Counsel', company: 'Al Tamimi & Co', salary: 400000, minAge: 25, degree: 'law' },
    ],
    events: [
      { id: 'uae_rent_spike', minAge: 22, maxAge: 50,
        title: 'Dubai rent market boom',
        text: 'Your landlord gives you notice. Your annual rent just went up by 20%.',
        choices: [
          { label: 'Pay the increase', effect: s => { s.wealth -= 17000; s.happiness -= 3; } },
          { label: 'Move to Sharjah/Ajman', effect: s => { s.happiness -= 5; s.flags.commuteStress = true; } },
        ]
      }
    ]
  },

  gbr: {
    id: 'gbr', name: 'United Kingdom', flag: '🇬🇧',
    currency: 'GBP', rate: 0.78,
    salary: 35000,
    prices: { food: 3500, phone: 300, transport: 1500, rent: 14000 },
    salaryTiers: { entry: 25000, mid: 45000, senior: 75000, exec: 120000 },
    schools: [
      { id: 'state', name: 'State Comprehensive', cost: 0, smarts: 1.1 },
      { id: 'grammar', name: 'Grammar School', cost: 0, smarts: 1.4 },
      { id: 'public', name: 'Public (Private) School', cost: 18000, smarts: 1.6 },
    ],
    universities: [
      { id: 'ucl', name: 'UCL', type: 'public', tuition: 9250, cutoff: 80 },
      { id: 'imperial', name: 'Imperial College', type: 'public', tuition: 9250, cutoff: 88 },
      { id: 'oxbridge', name: 'Oxford / Cambridge', type: 'public', tuition: 9250, cutoff: 95 },
    ],
    jobs: [
      { id: 'gbr_retail', title: 'Store Assistant', company: 'Tesco', salary: 21000, minAge: 18, degree: null },
      { id: 'gbr_nurse', title: 'Band 5 Nurse', company: 'NHS', salary: 28000, minAge: 21, degree: 'medicine' },
      { id: 'gbr_bank', title: 'Investment Analyst', company: 'Barclays', salary: 55000, minAge: 22, degree: 'business' },
      { id: 'gbr_dev', title: 'Software Engineer', company: 'DeepMind', salary: 85000, minAge: 22, degree: 'cs' },
      { id: 'gbr_eng', title: 'Mechanical Engineer', company: 'Rolls-Royce', salary: 42000, minAge: 22, degree: 'engineering' },
      { id: 'gbr_lawyer', title: 'Solicitor', company: 'Clifford Chance', salary: 90000, minAge: 24, degree: 'law' },
    ],
    events: [
      { id: 'gbr_cost_of_living', minAge: 22, maxAge: 55,
        title: 'Energy bill cap rises',
        text: 'Winter is coming and your gas/electric bills have doubled overnight.',
        choices: [
          { label: 'Turn the heating down and wear jumpers', effect: s => { s.happiness -= 4; s.health -= 2; } },
          { label: 'Pay the massive bills', effect: s => { s.wealth -= 1500; } },
        ]
      }
    ]
  },

  deu: {
    id: 'deu', name: 'Germany', flag: '🇩🇪',
    currency: 'EUR', rate: 0.92,
    salary: 45000,
    prices: { food: 4800, phone: 360, transport: 1200, rent: 13000 },
    salaryTiers: { entry: 35000, mid: 60000, senior: 90000, exec: 140000 },
    schools: [
      { id: 'hauptschule', name: 'Hauptschule / Realschule', cost: 0, smarts: 1.0 },
      { id: 'gymnasium', name: 'Gymnasium', cost: 0, smarts: 1.4 },
    ],
    universities: [
      { id: 'tum', name: 'TU Munich', type: 'public', tuition: 300, cutoff: 80 },
      { id: 'heidelberg', name: 'Heidelberg University', type: 'public', tuition: 300, cutoff: 82 },
      { id: 'lmu', name: 'LMU Munich', type: 'public', tuition: 300, cutoff: 80 },
    ],
    jobs: [
      { id: 'deu_retail', title: 'Supermarket Cashier', company: 'ALDI', salary: 28000, minAge: 18, degree: null },
      { id: 'deu_ausbildung', title: 'Industrial Mechanic', company: 'Siemens', salary: 42000, minAge: 19, degree: null },
      { id: 'deu_dev', title: 'Backend Developer', company: 'SAP', salary: 65000, minAge: 22, degree: 'cs' },
      { id: 'deu_bank', title: 'Financial Associate', company: 'Deutsche Bank', salary: 70000, minAge: 22, degree: 'business' },
      { id: 'deu_eng', title: 'Automotive Engineer', company: 'BMW', salary: 78000, minAge: 22, degree: 'engineering' },
      { id: 'deu_doc', title: 'Assistenzarzt', company: 'Charité', salary: 62000, minAge: 25, degree: 'medicine' },
    ],
    events: [
      { id: 'deu_bureaucracy', minAge: 20, maxAge: 40,
        title: 'The Anmeldung nightmare',
        text: 'You moved apartments. You need an appointment at the Bürgeramt, but there are none for 3 months.',
        choices: [
          { label: 'Check the website every day at 7 AM', effect: s => { s.happiness -= 3; s.smarts += 1; } },
          { label: 'Hire a relocation agency (€300)', effect: s => { s.wealth -= 300; } },
        ]
      }
    ]
  },

  can: {
    id: 'can', name: 'Canada', flag: '🇨🇦',
    currency: 'CAD', rate: 1.35,
    salary: 65000,
    prices: { food: 6000, phone: 900, transport: 1800, rent: 24000 },
    salaryTiers: { entry: 45000, mid: 80000, senior: 120000, exec: 180000 },
    schools: [
      { id: 'public', name: 'Public School', cost: 0, smarts: 1.1 },
      { id: 'private', name: 'Private School', cost: 20000, smarts: 1.4 },
    ],
    universities: [
      { id: 'mcgill', name: 'McGill University', type: 'public', tuition: 8000, cutoff: 80 },
      { id: 'ubc', name: 'UBC', type: 'public', tuition: 7000, cutoff: 82 },
      { id: 'uoft', name: 'University of Toronto', type: 'public', tuition: 8500, cutoff: 85 },
    ],
    jobs: [
      { id: 'can_retail', title: 'Retail Associate', company: 'Loblaws', salary: 35000, minAge: 18, degree: null },
      { id: 'can_trade', title: 'Electrician', company: 'Local Union', salary: 75000, minAge: 20, degree: null },
      { id: 'can_dev', title: 'Software Developer', company: 'Shopify', salary: 95000, minAge: 22, degree: 'cs' },
      { id: 'can_bank', title: 'Commercial Banker', company: 'RBC', salary: 85000, minAge: 22, degree: 'business' },
      { id: 'can_eng', title: 'Mining Engineer', company: 'Teck Resources', salary: 105000, minAge: 22, degree: 'engineering' },
      { id: 'can_law', title: 'Corporate Lawyer', company: 'McCarthy Tétrault', salary: 140000, minAge: 25, degree: 'law' },
    ],
    events: [
      { id: 'can_winter', minAge: 20, maxAge: 60,
        title: 'Harsh Canadian Winter',
        text: 'A massive snowstorm hits. Temperatures drop to -30°C and you need proper winter tires and gear.',
        choices: [
          { label: 'Buy premium winter gear ($1,200)', effect: s => { s.wealth -= 1200; s.health += 2; } },
          { label: 'Brave it in a light jacket', effect: s => { s.happiness -= 5; s.health -= 5; } },
        ]
      }
    ]
  },

  aus: {
    id: 'aus', name: 'Australia', flag: '🇦🇺',
    currency: 'AUD', rate: 1.50,
    salary: 75000,
    prices: { food: 7000, phone: 800, transport: 2000, rent: 30000 },
    salaryTiers: { entry: 55000, mid: 95000, senior: 140000, exec: 220000 },
    schools: [
      { id: 'state', name: 'State School', cost: 0, smarts: 1.1 },
      { id: 'private', name: 'Independent College', cost: 25000, smarts: 1.4 },
    ],
    universities: [
      { id: 'unsw', name: 'UNSW', type: 'public', tuition: 9000, cutoff: 75 },
      { id: 'usyd', name: 'University of Sydney', type: 'public', tuition: 9000, cutoff: 80 },
      { id: 'unimelb', name: 'University of Melbourne', type: 'public', tuition: 9000, cutoff: 82 },
    ],
    jobs: [
      { id: 'aus_barista', title: 'Barista', company: 'Local Cafe', salary: 45000, minAge: 18, degree: null },
      { id: 'aus_mining', title: 'FIFO Worker', company: 'BHP', salary: 120000, minAge: 20, degree: null },
      { id: 'aus_dev', title: 'Full Stack Dev', company: 'Atlassian', salary: 130000, minAge: 22, degree: 'cs' },
      { id: 'aus_bank', title: 'Financial Analyst', company: 'Commonwealth Bank', salary: 90000, minAge: 22, degree: 'business' },
      { id: 'aus_eng', title: 'Civil Engineer', company: 'CIMIC', salary: 100000, minAge: 22, degree: 'engineering' },
      { id: 'aus_doc', title: 'General Practitioner', company: 'Medical Centre', salary: 200000, minAge: 26, degree: 'medicine' },
    ],
    events: [
      { id: 'aus_housing', minAge: 24, maxAge: 40,
        title: 'The Sydney/Melbourne Housing Market',
        text: 'Rent jumps drastically and buying a house seems impossible.',
        choices: [
          { label: 'Accept the rent hike', effect: s => { s.wealth -= 4000; s.happiness -= 2; } },
          { label: 'Move to a regional area', effect: s => { s.happiness -= 3; s.flags.regionalMove = true; } },
        ]
      }
    ]
  },

  nld: {
    id: 'nld', name: 'Netherlands', flag: '🇳🇱',
    currency: 'EUR', rate: 0.92,
    salary: 42000,
    prices: { food: 4500, phone: 300, transport: 800, rent: 15000 },
    salaryTiers: { entry: 32000, mid: 55000, senior: 85000, exec: 130000 },
    schools: [
      { id: 'public', name: 'Openbare School', cost: 0, smarts: 1.1 },
      { id: 'international', name: 'International School', cost: 15000, smarts: 1.4 },
    ],
    universities: [
      { id: 'leiden', name: 'Leiden University', type: 'public', tuition: 2300, cutoff: 75 },
      { id: 'amsterdam', name: 'University of Amsterdam', type: 'public', tuition: 2300, cutoff: 78 },
      { id: 'delft', name: 'TU Delft', type: 'public', tuition: 2300, cutoff: 82 },
    ],
    jobs: [
      { id: 'nld_retail', title: 'Store Employee', company: 'Albert Heijn', salary: 26000, minAge: 18, degree: null },
      { id: 'nld_logistics', title: 'Logistics Planner', company: 'Port of Rotterdam', salary: 45000, minAge: 20, degree: null },
      { id: 'nld_dev', title: 'Data Engineer', company: 'Booking.com', salary: 75000, minAge: 22, degree: 'cs' },
      { id: 'nld_bank', title: 'Risk Analyst', company: 'ING', salary: 65000, minAge: 22, degree: 'business' },
      { id: 'nld_eng', title: 'Hardware Engineer', company: 'ASML', salary: 85000, minAge: 22, degree: 'engineering' },
      { id: 'nld_law', title: 'Legal Counsel', company: 'Shell', salary: 95000, minAge: 24, degree: 'law' },
    ],
    events: [
      { id: 'nld_bike_stolen', minAge: 18, maxAge: 50,
        title: 'Bike stolen!',
        text: 'You walk outside and your reliable daily commuter bike is gone.',
        choices: [
          { label: 'Buy a new proper bike (€400)', effect: s => { s.wealth -= 400; s.happiness -= 2; } },
          { label: 'Buy a cheap sketchy one (€50)', effect: s => { s.wealth -= 50; s.happiness -= 1; s.flags.sketchyBike = true; } },
        ]
      }
    ]
  },

  fra: {
    id: 'fra', name: 'France', flag: '🇫🇷',
    currency: 'EUR', rate: 0.92,
    salary: 39000,
    prices: { food: 4200, phone: 240, transport: 900, rent: 13000 },
    salaryTiers: { entry: 28000, mid: 50000, senior: 75000, exec: 120000 },
    schools: [
      { id: 'ecole_publique', name: 'École Publique', cost: 0, smarts: 1.1 },
      { id: 'ecole_privee', name: 'École Privée', cost: 5000, smarts: 1.3 },
    ],
    universities: [
      { id: 'sorbonne', name: 'Sorbonne Université', type: 'public', tuition: 200, cutoff: 75 },
      { id: 'polytechnique', name: 'École Polytechnique', type: 'public', tuition: 0, cutoff: 92 },
      { id: 'hec', name: 'HEC Paris', type: 'private', tuition: 25000, cutoff: 88 },
    ],
    jobs: [
      { id: 'fra_retail', title: 'Vendeur', company: 'Carrefour', salary: 22000, minAge: 18, degree: null },
      { id: 'fra_luxury', title: 'Boutique Manager', company: 'LVMH', salary: 45000, minAge: 22, degree: 'business' },
      { id: 'fra_dev', title: 'Développeur Full Stack', company: 'Dassault Systèmes', salary: 55000, minAge: 22, degree: 'cs' },
      { id: 'fra_bank', title: 'Analyste Financier', company: 'BNP Paribas', salary: 60000, minAge: 22, degree: 'business' },
      { id: 'fra_eng', title: 'Ingénieur Aéronautique', company: 'Airbus', salary: 65000, minAge: 22, degree: 'engineering' },
      { id: 'fra_doc', title: 'Médecin Généraliste', company: 'Hôpital Public', salary: 75000, minAge: 26, degree: 'medicine' },
    ],
    events: [
      { id: 'fra_greve', minAge: 20, maxAge: 55,
        title: 'Grève Générale (National Strike)',
        text: 'The trains are stopped, protests are in the streets, and you cannot get to work.',
        choices: [
          { label: 'Join the protest!', effect: s => { s.happiness += 5; s.wealth -= 100; } },
          { label: 'Work from home', effect: s => { s.happiness -= 2; } },
        ]
      }
    ]
  },

  jpn: {
    id: 'jpn', name: 'Japan', flag: '🇯🇵',
    currency: 'JPY', rate: 150.0,
    salary: 4500000,
    prices: { food: 600000, phone: 60000, transport: 120000, rent: 1200000 },
    salaryTiers: { entry: 3000000, mid: 6000000, senior: 9000000, exec: 15000000 },
    schools: [
      { id: 'public', name: 'Public School', cost: 0, smarts: 1.2 },
      { id: 'private', name: 'Private Academy', cost: 1000000, smarts: 1.5 },
    ],
    universities: [
      { id: 'tokyo', name: 'University of Tokyo', type: 'public', tuition: 535800, cutoff: 92 },
      { id: 'kyoto', name: 'Kyoto University', type: 'public', tuition: 535800, cutoff: 88 },
      { id: 'waseda', name: 'Waseda University', type: 'private', tuition: 1200000, cutoff: 80 },
    ],
    jobs: [
      { id: 'jpn_konbini', title: 'Konbini Staff', company: 'FamilyMart', salary: 2500000, minAge: 18, degree: null },
      { id: 'jpn_salaryman', title: 'Office Worker', company: 'Mitsubishi', salary: 4000000, minAge: 22, degree: 'business' },
      { id: 'jpn_dev', title: 'Software Engineer', company: 'Rakuten', salary: 6000000, minAge: 22, degree: 'cs' },
      { id: 'jpn_bank', title: 'Banker', company: 'SMBC', salary: 5500000, minAge: 22, degree: 'business' },
      { id: 'jpn_eng', title: 'Mechanical Engineer', company: 'Toyota', salary: 6500000, minAge: 22, degree: 'engineering' },
      { id: 'jpn_doc', title: 'Physician', company: 'Tokyo General', salary: 12000000, minAge: 26, degree: 'medicine' },
    ],
    events: [
      { id: 'jpn_nomikai', minAge: 22, maxAge: 55,
        title: 'Nomikai with the Boss',
        text: 'Your department boss invites the team for mandatory after-work drinks that will last until midnight.',
        choices: [
          { label: 'Go and drink (Cost: ¥5,000)', effect: s => { s.wealth -= 5000; s.health -= 2; s.happiness += 2; } },
          { label: 'Make an excuse to go home', effect: s => { s.happiness -= 3; } },
        ]
      }
    ]
  },

  ita: {
    id: 'ita', name: 'Italy', flag: '🇮🇹',
    currency: 'EUR', rate: 0.92,
    salary: 30000,
    prices: { food: 3600, phone: 240, transport: 600, rent: 10000 },
    salaryTiers: { entry: 22000, mid: 35000, senior: 50000, exec: 80000 },
    schools: [
      { id: 'pubblica', name: 'Scuola Pubblica', cost: 0, smarts: 1.1 },
      { id: 'privata', name: 'Scuola Privata', cost: 6000, smarts: 1.3 },
    ],
    universities: [
      { id: 'sapienza', name: 'Sapienza University', type: 'public', tuition: 1000, cutoff: 75 },
      { id: 'polimi', name: 'Politecnico di Milano', type: 'public', tuition: 3000, cutoff: 82 },
      { id: 'bocconi', name: 'Bocconi University', type: 'private', tuition: 14000, cutoff: 85 },
    ],
    jobs: [
      { id: 'ita_cafe', title: 'Barista', company: 'Local Bar', salary: 18000, minAge: 18, degree: null },
      { id: 'ita_fashion', title: 'Fashion Consultant', company: 'Gucci', salary: 32000, minAge: 20, degree: null },
      { id: 'ita_dev', title: 'Software Developer', company: 'Bending Spoons', salary: 45000, minAge: 22, degree: 'cs' },
      { id: 'ita_bank', title: 'Financial Analyst', company: 'Intesa Sanpaolo', salary: 38000, minAge: 22, degree: 'business' },
      { id: 'ita_eng', title: 'Automotive Engineer', company: 'Ferrari', salary: 50000, minAge: 22, degree: 'engineering' },
      { id: 'ita_doc', title: 'Medico', company: 'Ospedale', salary: 60000, minAge: 26, degree: 'medicine' },
    ],
    events: [
      { id: 'ita_ferragosto', minAge: 18, maxAge: 60,
        title: 'Ferragosto in August',
        text: 'It is mid-August. The entire country shuts down and goes to the beach. The cities are empty and boiling hot.',
        choices: [
          { label: 'Book a trip to the coast (€500)', effect: s => { s.wealth -= 500; s.happiness += 5; } },
          { label: 'Stay in the hot city', effect: s => { s.happiness -= 4; s.health -= 1; } },
        ]
      }
    ]
  },

  sgp: {
    id: 'sgp', name: 'Singapore', flag: '🇸🇬',
    currency: 'SGD', rate: 1.35,
    salary: 70000,
    prices: { food: 6000, phone: 600, transport: 1500, rent: 36000 },
    salaryTiers: { entry: 45000, mid: 80000, senior: 120000, exec: 250000 },
    schools: [
      { id: 'moe', name: 'MOE Public School', cost: 0, smarts: 1.3 },
      { id: 'international', name: 'International School', cost: 35000, smarts: 1.5 },
    ],
    universities: [
      { id: 'nus', name: 'NUS', type: 'public', tuition: 8000, cutoff: 90 },
      { id: 'ntu', name: 'NTU', type: 'public', tuition: 8000, cutoff: 88 },
      { id: 'smu', name: 'SMU', type: 'public', tuition: 11000, cutoff: 85 },
    ],
    jobs: [
      { id: 'sgp_retail', title: 'Retail Staff', company: 'FairPrice', salary: 30000, minAge: 18, degree: null },
      { id: 'sgp_bank', title: 'Investment Banker', company: 'DBS Bank', salary: 110000, minAge: 22, degree: 'business' },
      { id: 'sgp_dev', title: 'Software Engineer', company: 'Grab', salary: 90000, minAge: 22, degree: 'cs' },
      { id: 'sgp_eng', title: 'Marine Engineer', company: 'Keppel', salary: 85000, minAge: 22, degree: 'engineering' },
      { id: 'sgp_lawyer', title: 'Associate Lawyer', company: 'Allen & Gledhill', salary: 120000, minAge: 24, degree: 'law' },
      { id: 'sgp_doc', title: 'Medical Officer', company: 'SGH', salary: 100000, minAge: 25, degree: 'medicine' },
    ],
    events: [
      { id: 'sgp_coe', minAge: 25, maxAge: 50,
        title: 'Buying a Car in Singapore',
        text: 'You want a simple sedan, but the COE (Certificate of Entitlement) bidding just hit a record high.',
        choices: [
          { label: 'Pay the crazy COE ($100,000)', effect: s => { if (s.wealth > 100000) { s.wealth -= 100000; s.happiness += 10; } else { s.happiness -= 2; } } },
          { label: 'Just take the MRT', effect: s => { s.happiness -= 1; s.wealth -= 100; } },
        ]
      }
    ]
  },

  bra: {
    id: 'bra', name: 'Brazil', flag: '🇧🇷',
    currency: 'BRL', rate: 5.0,
    salary: 48000,
    prices: { food: 12000, phone: 1200, transport: 3000, rent: 24000 },
    salaryTiers: { entry: 30000, mid: 60000, senior: 120000, exec: 250000 },
    schools: [
      { id: 'publica', name: 'Escola Pública', cost: 0, smarts: 0.9 },
      { id: 'particular', name: 'Escola Particular', cost: 18000, smarts: 1.4 },
    ],
    universities: [
      { id: 'usp', name: 'USP', type: 'public', tuition: 0, cutoff: 85 },
      { id: 'unicamp', name: 'Unicamp', type: 'public', tuition: 0, cutoff: 82 },
      { id: 'fgv', name: 'FGV', type: 'private', tuition: 40000, cutoff: 80 },
    ],
    jobs: [
      { id: 'bra_sales', title: 'Vendedor', company: 'Magazine Luiza', salary: 24000, minAge: 18, degree: null },
      { id: 'bra_bank', title: 'Analista Financeiro', company: 'Itaú Unibanco', salary: 70000, minAge: 22, degree: 'business' },
      { id: 'bra_dev', title: 'Desenvolvedor', company: 'Nubank', salary: 90000, minAge: 22, degree: 'cs' },
      { id: 'bra_eng', title: 'Engenheiro', company: 'Embraer', salary: 100000, minAge: 22, degree: 'engineering' },
      { id: 'bra_lawyer', title: 'Advogado', company: 'Pinheiro Neto', salary: 110000, minAge: 24, degree: 'law' },
      { id: 'bra_doc', title: 'Médico', company: 'Hospital Sírio-Libanês', salary: 180000, minAge: 26, degree: 'medicine' },
    ],
    events: [
      { id: 'bra_carnaval', minAge: 18, maxAge: 45,
        title: 'Carnaval!',
        text: 'It is Carnaval season! The streets are filled with music and blocos.',
        choices: [
          { label: 'Buy VIP tickets to the Sambódromo (R$2,000)', effect: s => { s.wealth -= 2000; s.happiness += 8; } },
          { label: 'Party for free in the street blocos', effect: s => { s.happiness += 4; s.health -= 1; } },
        ]
      }
    ]
  },

  ind: {
    id: 'ind', name: 'India', flag: '🇮🇳',
    currency: 'INR', rate: 83.0,
    salary: 600000,
    prices: { food: 120000, phone: 5000, transport: 25000, rent: 240000 },
    salaryTiers: { entry: 300000, mid: 1000000, senior: 2500000, exec: 5000000 },
    schools: [
      { id: 'gov', name: 'Government School', cost: 0, smarts: 0.9 },
      { id: 'private', name: 'Private CBSE School', cost: 100000, smarts: 1.4 },
      { id: 'international', name: 'International School', cost: 500000, smarts: 1.6 },
    ],
    universities: [
      { id: 'iit', name: 'IIT', type: 'public', tuition: 200000, cutoff: 95 },
      { id: 'nit', name: 'NIT', type: 'public', tuition: 150000, cutoff: 88 },
      { id: 'private_uni', name: 'Private University', type: 'private', tuition: 400000, cutoff: 60 },
    ],
    jobs: [
      { id: 'ind_bpo', title: 'Customer Support', company: 'TCS BPO', salary: 250000, minAge: 18, degree: null },
      { id: 'ind_dev', title: 'Software Engineer', company: 'Infosys', salary: 450000, minAge: 21, degree: 'cs' },
      { id: 'ind_bank', title: 'Probationary Officer', company: 'SBI', salary: 700000, minAge: 21, degree: 'business' },
      { id: 'ind_pm', title: 'Product Manager', company: 'Flipkart', salary: 1800000, minAge: 24, degree: 'business' },
      { id: 'ind_eng', title: 'Civil Engineer', company: 'L&T', salary: 600000, minAge: 22, degree: 'engineering' },
      { id: 'ind_doc', title: 'Resident Doctor', company: 'AIIMS', salary: 1200000, minAge: 25, degree: 'medicine' },
    ],
    events: [
      { id: 'ind_monsoon', minAge: 18, maxAge: 50,
        title: 'Monsoon Flooding',
        text: 'Heavy monsoon rains have flooded the streets. Auto and cab drivers are charging 5x the normal fare to get to work.',
        choices: [
          { label: 'Pay the surge pricing (₹1,500)', effect: s => { s.wealth -= 1500; s.happiness -= 1; } },
          { label: 'Wade through the flooded streets', effect: s => { s.happiness -= 5; s.health -= 3; } },
        ]
      }
    ]
  }

};
/* ============================================================
   HISTORICAL EXCHANGE RATES (Fix flat currency bug)
   ============================================================ */
const HISTORICAL_RATES = {
  egy: [
    { year: 2001, rate: 3.80 },
    { year: 2011, rate: 5.95 },
    { year: 2015, rate: 7.80 },
    { year: 2016, rate: 18.00 },
    { year: 2020, rate: 15.70 },
    { year: 2022, rate: 19.10 },
    { year: 2023, rate: 30.90 },
    { year: 2024, rate: 48.50 },
    { year: 2025, rate: 52.70 }
  ]
};
/* ============================================================
   SESSION 8: ECONOMY ENGINE DATA
   Real 2027 numbers. Real struggles. Scales 2001-2100.
   ============================================================ */

/* Base monthly salary USD — mid-career worker, US market (level 2 = 1.0×) */
const ECON_TRACK_BASE_USD = {
  tech: 5000, business: 4500, accounting: 4000, investment: 6500,
  marketing: 4000, sales: 3500, hr: 3500, consulting: 5500,
  product: 6000, medicine: 8500, surgery: 11000, pediatrics: 7500,
  cardiology: 9500, nursing: 3500, pharmacy: 4000, dentistry: 6000,
  psychology: 4000, veterinary: 3000, physiotherapy: 3000,
  law: 5500, prosecutor: 4000, engineering: 4500, architect: 4500,
  civil_eng: 4200, data_science: 6000, cybersecurity: 5500,
  product_design: 4500, qa_engineering: 3500, teaching: 3000,
  academia: 3500, bpo: 2000, hospitality: 2200, aviation: 5000,
  media: 3000, government: 2800, trades: 2500, entry: 1800
};

const ECON_LEVEL_MULT = [0.5, 0.8, 1.0, 1.4, 2.0, 2.8, 3.6];
const ECON_SECTOR_MULT = { government: 0.75, private: 1.0, international: 1.35, ngo: 0.85, self: 1.15 };

/* Per-country economic profile — real 2027 reality */
const ECON_PROFILES = {
  egy: {
    diff: 8,
    salaryMult: 0.12,
    rentMult: 0.35,
    costMult: 0.45,
    socialRate: 0.11,
    taxBrackets: [
      { upTo: 40000, rate: 0 },
      { upTo: 55000, rate: 0.10 },
      { upTo: 70000, rate: 0.15 },
      { upTo: 200000, rate: 0.20 },
      { upTo: 400000, rate: 0.225 },
      { upTo: Infinity, rate: 0.25 }
    ],
    inflationHistory: { 2001: 0.03, 2005: 0.05, 2008: 0.18, 2011: 0.12, 2014: 0.10, 2016: 0.10, 2017: 0.30, 2020: 0.05, 2022: 0.14, 2023: 0.34, 2024: 0.28, 2025: 0.22, 2026: 0.18, 2027: 0.15, 2028: 0.12, 2030: 0.10, 2035: 0.08, 2040: 0.07 },
    struggles: [
      { icon: '🏠', text: 'A decent 2BR apartment costs 20+ years of full salary' },
      { icon: '📉', text: 'The EGP has lost 90% of its value since 2010' },
      { icon: '🚗', text: 'A new car = 4-5 years of entire income' },
      { icon: '💍', text: 'Marriage (shabka + apartment + gold) = 500,000+ EGP' },
      { icon: '✈️', text: 'Millions have left for Gulf/Europe to survive' },
      { icon: '🍞', text: 'Food prices double every 2-3 years' },
      { icon: '💊', text: 'Good private healthcare is unaffordable' }
    ]
  },
  usa: {
    diff: 6,
    salaryMult: 1.0,
    rentMult: 1.0,
    costMult: 1.0,
    socialRate: 0.0765,
    taxBrackets: [
      { upTo: 11600, rate: 0.10 },
      { upTo: 47150, rate: 0.12 },
      { upTo: 100525, rate: 0.22 },
      { upTo: 191950, rate: 0.24 },
      { upTo: 243725, rate: 0.32 },
      { upTo: 609350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 }
    ],
    inflationHistory: { 2001: 0.03, 2008: 0.04, 2020: 0.01, 2022: 0.08, 2023: 0.04, 2024: 0.03, 2027: 0.03, 2030: 0.025, 2040: 0.025 },
    struggles: [
      { icon: '🏥', text: 'Medical bankruptcy is the #1 cause of US bankruptcies' },
      { icon: '🎓', text: 'Student loan debt: $30k-100k on average' },
      { icon: '🏠', text: 'Housing crisis: median home = 6× median salary' },
      { icon: '👶', text: 'Daycare costs $1,500-2,500/month per child' },
      { icon: '🚗', text: 'Car-dependent cities require car ownership' },
      { icon: '💼', text: 'At-will employment — fired with no notice' }
    ]
  },
  gbr: {
    diff: 6,
    salaryMult: 0.85,
    rentMult: 1.15,
    costMult: 1.05,
    socialRate: 0.12,
    taxBrackets: [
      { upTo: 12570, rate: 0 },
      { upTo: 50270, rate: 0.20 },
      { upTo: 125140, rate: 0.40 },
      { upTo: Infinity, rate: 0.45 }
    ],
    inflationHistory: { 2001: 0.02, 2008: 0.04, 2011: 0.05, 2020: 0.01, 2022: 0.09, 2023: 0.07, 2024: 0.04, 2027: 0.03, 2030: 0.025, 2040: 0.02 },
    struggles: [
      { icon: '🏠', text: 'London rent eats 50%+ of after-tax income' },
      { icon: '💡', text: 'Energy bills tripled post-2022 crisis' },
      { icon: '🚆', text: 'Commute £200-400/month if you work in London' },
      { icon: '👶', text: 'Nursery costs £1,200-2,000/month per child' },
      { icon: '🏥', text: 'NHS waitlists — 6-12 months for specialists' },
      { icon: '🥶', text: 'You cannot afford to heat your home properly' }
    ]
  },
  deu: {
    diff: 5,
    salaryMult: 0.85,
    rentMult: 0.9,
    costMult: 0.95,
    socialRate: 0.20,
    taxBrackets: [
      { upTo: 11604, rate: 0 },
      { upTo: 17005, rate: 0.14 },
      { upTo: 66760, rate: 0.24 },
      { upTo: 277825, rate: 0.42 },
      { upTo: Infinity, rate: 0.45 }
    ],
    inflationHistory: { 2001: 0.02, 2008: 0.03, 2022: 0.08, 2023: 0.06, 2024: 0.03, 2027: 0.025, 2030: 0.02, 2040: 0.02 },
    struggles: [
      { icon: '💸', text: '42% marginal tax + 20% social insurance' },
      { icon: '🏠', text: 'Housing shortage in Berlin, Munich, Frankfurt' },
      { icon: '📋', text: 'Bureaucracy — Anmeldung, tax returns, paperwork' },
      { icon: '☁️', text: 'Depression from dark winters' },
      { icon: '👶', text: 'Birth rate lowest in Europe — childcare scarce' },
      { icon: '🌧️', text: 'Weather is grey 200+ days per year' }
    ]
  },
  sau: {
    diff: 5,
    salaryMult: 0.90,
    rentMult: 0.65,
    costMult: 0.65,
    socialRate: 0,
    taxBrackets: [{ upTo: Infinity, rate: 0 }],
    inflationHistory: { 2001: 0.02, 2008: 0.09, 2020: 0.03, 2024: 0.02, 2027: 0.02, 2030: 0.025 },
    struggles: [
      { icon: '🪪', text: 'No PR — you are sponsored by ONE employer forever' },
      { icon: '🚫', text: 'Job loss = deportation in 30-90 days' },
      { icon: '👨‍👩‍👧', text: 'Can only sponsor family if salary above threshold' },
      { icon: '🚷', text: 'Kafala system — sponsor controls your travel' },
      { icon: '🌡️', text: '50°C summers, 9 months of brutal heat' },
      { icon: '🏛️', text: 'No political voice, no path to citizenship' }
    ]
  },
  uae: {
    diff: 5,
    salaryMult: 0.92,
    rentMult: 0.95,
    costMult: 0.75,
    socialRate: 0,
    taxBrackets: [{ upTo: Infinity, rate: 0 }],
    inflationHistory: { 2001: 0.02, 2008: 0.12, 2020: 0.02, 2024: 0.02, 2027: 0.025, 2030: 0.025 },
    struggles: [
      { icon: '🪪', text: 'No PR for most — sponsor-dependent forever' },
      { icon: '💸', text: 'Rent doubled in Dubai 2022-2025' },
      { icon: '🚗', text: 'Cost of living now rivals Western cities' },
      { icon: '🕌', text: 'Strict social rules, cultural constraints' },
      { icon: '🌡️', text: 'Six months of unbearable heat' },
      { icon: '🛂', text: 'Golden Visa requires 2M AED property' }
    ]
  },
  can: {
    diff: 5,
    salaryMult: 0.80,
    rentMult: 1.10,
    costMult: 1.0,
    socialRate: 0.08,
    taxBrackets: [
      { upTo: 15705, rate: 0.15 },
      { upTo: 53528, rate: 0.205 },
      { upTo: 100392, rate: 0.26 },
      { upTo: 155625, rate: 0.29 },
      { upTo: Infinity, rate: 0.33 }
    ],
    inflationHistory: { 2001: 0.03, 2008: 0.03, 2020: 0.01, 2022: 0.07, 2024: 0.03, 2027: 0.025, 2030: 0.02 },
    struggles: [
      { icon: '🏠', text: 'Toronto/Vancouver housing: 10-15× median income' },
      { icon: '🥶', text: 'Winters hit -30°C, heating costly' },
      { icon: '🩺', text: 'Family doctor waitlist: years in some provinces' },
      { icon: '🚗', text: 'Cities sprawl — car almost mandatory' },
      { icon: '💸', text: 'High income tax + 13% sales tax (Ontario)' }
    ]
  },
  aus: {
    diff: 5,
    salaryMult: 0.90,
    rentMult: 1.20,
    costMult: 1.05,
    socialRate: 0.10,
    taxBrackets: [
      { upTo: 18200, rate: 0 },
      { upTo: 45000, rate: 0.16 },
      { upTo: 135000, rate: 0.30 },
      { upTo: 190000, rate: 0.37 },
      { upTo: Infinity, rate: 0.45 }
    ],
    inflationHistory: { 2001: 0.03, 2008: 0.04, 2020: 0.01, 2022: 0.07, 2024: 0.03, 2027: 0.025, 2030: 0.025 },
    struggles: [
      { icon: '🏠', text: 'Sydney/Melbourne housing most unaffordable globally' },
      { icon: '🌏', text: 'Everything is 2,000+ km apart' },
      { icon: '🔥', text: 'Bushfire summers, flooding winters' },
      { icon: '🥕', text: 'Groceries 40% more than Europe' },
      { icon: '🐍', text: 'Wildlife everywhere' }
    ]
  },
  nld: {
    diff: 5,
    salaryMult: 0.85,
    rentMult: 1.0,
    costMult: 1.0,
    socialRate: 0.14,
    taxBrackets: [
      { upTo: 37149, rate: 0.09 },
      { upTo: 73031, rate: 0.375 },
      { upTo: Infinity, rate: 0.495 }
    ],
    inflationHistory: { 2001: 0.02, 2008: 0.03, 2022: 0.10, 2023: 0.04, 2024: 0.03, 2027: 0.025 },
    struggles: [
      { icon: '🏠', text: 'Massive housing shortage — 390,000 short' },
      { icon: '🌧️', text: 'Grey and rainy most of the year' },
      { icon: '🚲', text: 'You must cycle in rain and wind' },
      { icon: '💸', text: '49.5% top tax bracket' }
    ]
  },
  fra: {
    diff: 6,
    salaryMult: 0.75,
    rentMult: 1.0,
    costMult: 0.95,
    socialRate: 0.22,
    taxBrackets: [
      { upTo: 11295, rate: 0 },
      { upTo: 28798, rate: 0.11 },
      { upTo: 82342, rate: 0.30 },
      { upTo: 177107, rate: 0.41 },
      { upTo: Infinity, rate: 0.45 }
    ],
    inflationHistory: { 2001: 0.02, 2008: 0.03, 2022: 0.06, 2024: 0.03, 2027: 0.025 },
    struggles: [
      { icon: '🏠', text: 'Paris rent = 40-50% of income' },
      { icon: '💸', text: '45% tax + 22% social charges' },
      { icon: '✊', text: 'Frequent strikes — trains, airports, fuel' },
      { icon: '📋', text: 'Bureaucracy legendary even by European standards' },
      { icon: '😔', text: 'Youth unemployment 17%' }
    ]
  },
  jpn: {
    diff: 6,
    salaryMult: 0.70,
    rentMult: 0.85,
    costMult: 0.9,
    socialRate: 0.15,
    taxBrackets: [
      { upTo: 1950000, rate: 0.05 },
      { upTo: 3300000, rate: 0.10 },
      { upTo: 6950000, rate: 0.20 },
      { upTo: 9000000, rate: 0.23 },
      { upTo: 18000000, rate: 0.33 },
      { upTo: 40000000, rate: 0.40 },
      { upTo: Infinity, rate: 0.45 }
    ],
    inflationHistory: { 2001: -0.005, 2008: 0.01, 2022: 0.02, 2024: 0.025, 2027: 0.02 },
    struggles: [
      { icon: '💼', text: 'Karoshi — death from overwork. 80-hour weeks normal' },
      { icon: '🏠', text: 'Tokyo apartments are 20-40 m² for a family' },
      { icon: '👶', text: 'Lowest birth rate in world — population shrinking' },
      { icon: '🎌', text: 'Foreigners never fully integrate' },
      { icon: '💸', text: 'Seniority system — you earn based on years, not merit' }
    ]
  },
  ita: {
    diff: 7,
    salaryMult: 0.65,
    rentMult: 0.85,
    costMult: 0.9,
    socialRate: 0.30,
    taxBrackets: [
      { upTo: 15000, rate: 0.23 },
      { upTo: 28000, rate: 0.25 },
      { upTo: 50000, rate: 0.35 },
      { upTo: Infinity, rate: 0.43 }
    ],
    inflationHistory: { 2001: 0.025, 2008: 0.035, 2022: 0.08, 2024: 0.02, 2027: 0.02 },
    struggles: [
      { icon: '📉', text: 'Youth unemployment 22% — brain drain to Germany/UK' },
      { icon: '💸', text: '30% social charges + income tax' },
      { icon: '🏚️', text: 'Stagnant economy for 20 years' },
      { icon: '📋', text: 'Bureaucracy brutal — weeks to open bank account' }
    ]
  },
  sgp: {
    diff: 4,
    salaryMult: 1.0,
    rentMult: 1.4,
    costMult: 1.05,
    socialRate: 0.20,
    taxBrackets: [
      { upTo: 20000, rate: 0 },
      { upTo: 30000, rate: 0.02 },
      { upTo: 40000, rate: 0.035 },
      { upTo: 80000, rate: 0.07 },
      { upTo: 120000, rate: 0.115 },
      { upTo: 160000, rate: 0.15 },
      { upTo: 200000, rate: 0.18 },
      { upTo: 240000, rate: 0.19 },
      { upTo: 280000, rate: 0.20 },
      { upTo: 320000, rate: 0.22 },
      { upTo: Infinity, rate: 0.24 }
    ],
    inflationHistory: { 2001: 0.01, 2008: 0.065, 2020: -0.001, 2022: 0.06, 2024: 0.03, 2027: 0.025 },
    struggles: [
      { icon: '🏠', text: 'Rent in private housing: S$3,500-6,000/month' },
      { icon: '🚗', text: 'Car COE alone = S$100,000-150,000' },
      { icon: '😰', text: 'Kiasu culture — extreme academic + career pressure' },
      { icon: '🪪', text: 'HDB (public housing) only for citizens' }
    ]
  },
  bra: {
    diff: 7,
    salaryMult: 0.22,
    rentMult: 0.55,
    costMult: 0.55,
    socialRate: 0.11,
    taxBrackets: [
      { upTo: 24511, rate: 0 },
      { upTo: 33919, rate: 0.075 },
      { upTo: 45012, rate: 0.15 },
      { upTo: 55976, rate: 0.225 },
      { upTo: Infinity, rate: 0.275 }
    ],
    inflationHistory: { 2001: 0.08, 2003: 0.12, 2011: 0.06, 2015: 0.10, 2020: 0.04, 2022: 0.10, 2024: 0.04, 2027: 0.04 },
    struggles: [
      { icon: '🚨', text: 'Violent crime — neighborhoods restricted' },
      { icon: '📉', text: 'Currency devalues 20-40% every few years' },
      { icon: '🏚️', text: 'Inequality gap between rich and poor is enormous' },
      { icon: '🚑', text: 'Good healthcare only via private insurance' }
    ]
  },
  ind: {
    diff: 7,
    salaryMult: 0.14,
    rentMult: 0.35,
    costMult: 0.30,
    socialRate: 0.12,
    taxBrackets: [
      { upTo: 300000, rate: 0 },
      { upTo: 600000, rate: 0.05 },
      { upTo: 900000, rate: 0.10 },
      { upTo: 1200000, rate: 0.15 },
      { upTo: 1500000, rate: 0.20 },
      { upTo: Infinity, rate: 0.30 }
    ],
    inflationHistory: { 2001: 0.04, 2008: 0.08, 2013: 0.11, 2020: 0.05, 2023: 0.06, 2024: 0.05, 2027: 0.04 },
    struggles: [
      { icon: '🏠', text: 'Family often multi-generational under one roof' },
      { icon: '💍', text: 'Arranged marriage + dowry pressure' },
      { icon: '🚨', text: 'Pollution — Delhi AQI above 300 regularly' },
      { icon: '🚗', text: 'Traffic gridlock — 2-hour commutes normal' },
      { icon: '🩺', text: 'Private healthcare needed for anything serious' }
    ]
  }
};

window.ECON_TRACK_BASE_USD = ECON_TRACK_BASE_USD;
window.ECON_LEVEL_MULT = ECON_LEVEL_MULT;
window.ECON_SECTOR_MULT = ECON_SECTOR_MULT;
window.ECON_PROFILES = ECON_PROFILES;

window.HISTORICAL_RATES = HISTORICAL_RATES;
window.COUNTRIES = COUNTRIES;
