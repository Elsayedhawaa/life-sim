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
      },
    ],
  },
};


  /* 👇 ADD NEW COUNTRIES HERE 👇 */
};

window.COUNTRIES = COUNTRIES;
