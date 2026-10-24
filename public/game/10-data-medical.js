/* ============================================================
   WORLD LIFE — DATA: MEDICAL
   ============================================================
   Pure data. Uses MED_ prefix to avoid collision with
   MEDICAL_* tables in 09-data-children.js.
   All costs EGP base (multiply by C().rate for other countries).
   ============================================================ */

/* ---------- INSURANCE TIERS ---------- */
const MED_INSURANCE = [
  { id: 'none',             label: 'Uninsured (pay all)',          premiumAnnualEGP: 0,       coveragePct: 0,    capEGP: 0,         minJobTier: null,     desc: 'You pay every bill out of pocket.' },
  { id: 'public_govt',      label: 'Government Health Insurance',  premiumAnnualEGP: 1200,    coveragePct: 0.40, capEGP: 50000,     minJobTier: null,     desc: 'Cheap. Very limited coverage.' },
  { id: 'employer_basic',   label: 'Employer Basic Plan',          premiumAnnualEGP: 0,       coveragePct: 0.55, capEGP: 150000,    minJobTier: 'any',    desc: 'Free with a job. Partial coverage.' },
  { id: 'employer_premium', label: 'Employer Premium Plan',        premiumAnnualEGP: 0,       coveragePct: 0.80, capEGP: 600000,    minJobTier: 'mid',    desc: 'Free with a good job. Strong coverage.' },
  { id: 'private_basic',    label: 'Private Basic',                premiumAnnualEGP: 6000,    coveragePct: 0.60, capEGP: 200000,    minJobTier: null,     desc: 'Self-bought. Moderate coverage.' },
  { id: 'private_std',      label: 'Private Standard',             premiumAnnualEGP: 18000,   coveragePct: 0.80, capEGP: 800000,    minJobTier: null,     desc: 'Good coverage for families.' },
  { id: 'private_prem',     label: 'Private Premium',              premiumAnnualEGP: 45000,   coveragePct: 0.90, capEGP: 3000000,   minJobTier: null,     desc: 'Top private coverage.' },
  { id: 'international',    label: 'International Elite',          premiumAnnualEGP: 120000,  coveragePct: 0.95, capEGP: Infinity,  minJobTier: null,     desc: 'Global coverage, unlimited cap.' }
];

/* ---------- HOSPITAL TIERS ---------- */
const MED_HOSPITALS = [
  { id: 'public_free',      label: 'Free Government Clinic',        costMult: 0.10, complicationRate: 0.25, waitWeeks: 8, comfort: 1 },
  { id: 'public_govt',      label: 'Public Government Hospital',    costMult: 0.30, complicationRate: 0.18, waitWeeks: 4, comfort: 3 },
  { id: 'public_central',   label: 'Public Central Hospital',       costMult: 0.50, complicationRate: 0.12, waitWeeks: 2, comfort: 5 },
  { id: 'private_std',      label: 'Private Hospital',              costMult: 1.00, complicationRate: 0.06, waitWeeks: 1, comfort: 7 },
  { id: 'private_prem',     label: 'Private Premium Hospital',      costMult: 1.80, complicationRate: 0.03, waitWeeks: 0.5, comfort: 9 },
  { id: 'private_elite',    label: 'Elite Hospital (Dar Al Fouad, Saudi German)', costMult: 3.00, complicationRate: 0.01, waitWeeks: 0.2, comfort: 10 },
  { id: 'cancer_center',    label: 'Specialized Cancer Center (57357, NCI)',      costMult: 1.20, complicationRate: 0.04, waitWeeks: 1.5, comfort: 8, cancerOnly: true }
];

/* ---------- DOCTORS (specialists) ---------- */
const MED_DOCTORS = [
  { id: 'gp',             label: 'General Practitioner (GP)',       visitCostEGP: 400,   canDetect: ['basic'],       desc: 'First stop for any health problem.' },
  { id: 'cardiologist',   label: 'Cardiologist',                     visitCostEGP: 900,   canDetect: ['cardio'],      desc: 'Heart and blood vessels.' },
  { id: 'neurologist',    label: 'Neurologist',                      visitCostEGP: 1000,  canDetect: ['neuro'],       desc: 'Brain and nervous system.' },
  { id: 'psychiatrist',   label: 'Psychiatrist',                     visitCostEGP: 1200,  canDetect: ['mental'],      desc: 'Mental health, can prescribe medication.' },
  { id: 'psychologist',   label: 'Psychologist (therapy)',           visitCostEGP: 800,   canDetect: ['mental'],      desc: 'Talk therapy only, no medication.' },
  { id: 'oncologist',     label: 'Oncologist',                       visitCostEGP: 1500,  canDetect: ['cancer'],      desc: 'Cancer specialist.' },
  { id: 'orthopedic',     label: 'Orthopedic Surgeon',               visitCostEGP: 800,   canDetect: ['bone'],        desc: 'Bones, joints, fractures.' },
  { id: 'dermatologist',  label: 'Dermatologist',                    visitCostEGP: 700,   canDetect: ['skin'],        desc: 'Skin conditions.' },
  { id: 'gynecologist',   label: 'Gynecologist',                     visitCostEGP: 800,   canDetect: ['fertility_f', 'pregnancy'], desc: 'Women\'s health and fertility.' },
  { id: 'urologist',      label: 'Urologist',                        visitCostEGP: 900,   canDetect: ['fertility_m', 'kidney'], desc: 'Male fertility, kidney issues.' },
  { id: 'endocrinologist',label: 'Endocrinologist',                  visitCostEGP: 900,   canDetect: ['endocrine'],   desc: 'Hormones, diabetes, thyroid.' },
  { id: 'gastro',         label: 'Gastroenterologist',               visitCostEGP: 900,   canDetect: ['digestive'],   desc: 'Stomach, intestines, liver.' },
  { id: 'pulmonologist',  label: 'Pulmonologist',                    visitCostEGP: 800,   canDetect: ['respiratory'], desc: 'Lungs and breathing.' },
  { id: 'rheumatologist', label: 'Rheumatologist',                   visitCostEGP: 1000,  canDetect: ['autoimmune'],  desc: 'Arthritis, autoimmune diseases.' },
  { id: 'dentist',        label: 'Dentist',                          visitCostEGP: 500,   canDetect: ['dental'],      desc: 'Teeth and gums.' },
  { id: 'ophthalmologist',label: 'Ophthalmologist',                  visitCostEGP: 600,   canDetect: ['eye'],         desc: 'Eyes and vision.' }
];

/* ---------- CONDITIONS (35 total) ---------- */
/* category maps to doctor canDetect tags
   severity: mild, moderate, severe, critical
   annualHealthHit: lost health per year if untreated
   annualHappinessHit: lost happiness per year if untreated
   deathRiskPerYear: 0-1, chance of death per year if untreated
   suggestedTests: array of MED_TESTS ids
   medications: array of MED_MEDICATIONS ids that treat it
   surgeries: array of MED_SURGERIES ids that cure it
*/
const MED_CONDITIONS = [
  /* ===== MENTAL ===== */
  { id: 'anxiety',            label: 'Anxiety Disorder',              category: 'mental',         severity: 'mild',     annualHealthHit: 2,  annualHappinessHit: 5,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: [],                              medications: ['xanax', 'zoloft'],         surgeries: [],                       desc: 'Persistent worry. Manageable with therapy.' },
  { id: 'depression',         label: 'Depression',                    category: 'mental',         severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 8,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: [],                              medications: ['zoloft', 'prozac'],        surgeries: [],                       desc: 'Persistent sadness. Therapy helps greatly.' },
  { id: 'severe_depression',  label: 'Severe Depression',             category: 'mental',         severity: 'severe',   annualHealthHit: 6,  annualHappinessHit: 15, deathRiskPerYear: 0,    treatable: true,  suggestedTests: [],                              medications: ['zoloft', 'prozac'],        surgeries: [],                       desc: 'Deep depression. Urgent treatment needed.' },
  { id: 'panic_disorder',     label: 'Panic Disorder',                category: 'mental',         severity: 'moderate', annualHealthHit: 2,  annualHappinessHit: 6,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: [],                              medications: ['xanax'],                   surgeries: [],                       desc: 'Panic attacks. Manageable with meds.' },
  { id: 'bipolar',            label: 'Bipolar Disorder',              category: 'mental',         severity: 'severe',   annualHealthHit: 4,  annualHappinessHit: 10, deathRiskPerYear: 0.005,treatable: true,  suggestedTests: [],                              medications: [],                          surgeries: [],                       desc: 'Mood swings between mania and depression. Long treatment.' },

  /* ===== CARDIOVASCULAR ===== */
  { id: 'hypertension',       label: 'Hypertension (High BP)',        category: 'cardio',         severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 1,  deathRiskPerYear: 0.01, treatable: true,  suggestedTests: ['bp_check', 'ecg'],             medications: ['concor', 'co_diovan'],     surgeries: [],                       desc: 'Chronic high blood pressure. Often silent.' },
  { id: 'high_cholesterol',   label: 'High Cholesterol',              category: 'cardio',         severity: 'mild',     annualHealthHit: 2,  annualHappinessHit: 0,  deathRiskPerYear: 0.005,treatable: true,  suggestedTests: ['lipid'],                       medications: ['crestor', 'atorvastatin'], surgeries: [],                       desc: 'Elevated LDL. Increases heart risk.' },
  { id: 'heart_disease',      label: 'Coronary Heart Disease',        category: 'cardio',         severity: 'severe',   annualHealthHit: 8,  annualHappinessHit: 5,  deathRiskPerYear: 0.06, treatable: true,  suggestedTests: ['ecg', 'echo', 'stress'],       medications: ['concor', 'plavix'],        surgeries: ['angioplasty', 'cabg'],  desc: 'Blocked arteries. Can be fatal.' },
  { id: 'arrhythmia',         label: 'Cardiac Arrhythmia',            category: 'cardio',         severity: 'moderate', annualHealthHit: 4,  annualHappinessHit: 3,  deathRiskPerYear: 0.02, treatable: true,  suggestedTests: ['ecg', 'holter'],               medications: ['concor'],                  surgeries: ['pacemaker'],            desc: 'Irregular heartbeat. Monitor closely.' },
  { id: 'heart_attack',       label: 'Post Heart Attack',             category: 'cardio',         severity: 'critical', annualHealthHit: 10, annualHappinessHit: 8,  deathRiskPerYear: 0.08, treatable: true,  suggestedTests: [],                              medications: ['plavix', 'crestor'],       surgeries: ['cabg'],                 desc: 'Had a heart attack. High risk of another.' },

  /* ===== RESPIRATORY ===== */
  { id: 'asthma',             label: 'Asthma',                        category: 'respiratory',    severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 2,  deathRiskPerYear: 0.005,treatable: true,  suggestedTests: ['spirometry'],                  medications: ['ventolin'],                surgeries: [],                       desc: 'Breathing difficulty. Manageable.' },
  { id: 'copd',               label: 'COPD',                          category: 'respiratory',    severity: 'severe',   annualHealthHit: 6,  annualHappinessHit: 4,  deathRiskPerYear: 0.03, treatable: false, suggestedTests: ['spirometry', 'xray_chest'],    medications: ['ventolin'],                surgeries: [],                       desc: 'Chronic lung disease. Progressive.' },
  { id: 'pneumonia',          label: 'Pneumonia',                     category: 'respiratory',    severity: 'severe',   annualHealthHit: 5,  annualHappinessHit: 5,  deathRiskPerYear: 0.02, treatable: true,  suggestedTests: ['xray_chest', 'cbc'],           medications: ['augmentin', 'zitromax'],   surgeries: [],                       desc: 'Lung infection. Curable with antibiotics.' },

  /* ===== ENDOCRINE ===== */
  { id: 'type2_diabetes',     label: 'Type 2 Diabetes',               category: 'endocrine',      severity: 'moderate', annualHealthHit: 4,  annualHappinessHit: 1,  deathRiskPerYear: 0.01, treatable: true,  suggestedTests: ['hba1c', 'glucose'],            medications: ['glucophage', 'januvia'],   surgeries: [],                       desc: 'Chronic blood sugar issue. Manageable.' },
  { id: 'type1_diabetes',     label: 'Type 1 Diabetes',               category: 'endocrine',      severity: 'severe',   annualHealthHit: 5,  annualHappinessHit: 2,  deathRiskPerYear: 0.02, treatable: false, suggestedTests: ['hba1c', 'glucose'],            medications: ['lantus', 'novorapid'],     surgeries: [],                       desc: 'Insulin-dependent. Lifelong management.' },
  { id: 'hypothyroid',        label: 'Hypothyroidism',                category: 'endocrine',      severity: 'mild',     annualHealthHit: 2,  annualHappinessHit: 2,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['thyroid'],                     medications: ['eltroxin', 'euthyrox'],    surgeries: [],                       desc: 'Low thyroid. Easy to treat.' },
  { id: 'pcos',               label: 'PCOS (Polycystic Ovary)',       category: 'fertility_f',    severity: 'moderate', annualHealthHit: 2,  annualHappinessHit: 4,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['hormones', 'ultrasound_pelvic'], medications: ['glucophage'],             surgeries: ['ovarian_drill'],        desc: 'Hormonal imbalance. Affects fertility.' },

  /* ===== DIGESTIVE ===== */
  { id: 'ibs',                label: 'Irritable Bowel Syndrome',      category: 'digestive',      severity: 'mild',     annualHealthHit: 1,  annualHappinessHit: 3,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['colonoscopy'],                 medications: ['nexium'],                  surgeries: [],                       desc: 'Chronic stomach discomfort. Diet helps.' },
  { id: 'gerd',               label: 'Severe Acid Reflux (GERD)',     category: 'digestive',      severity: 'mild',     annualHealthHit: 2,  annualHappinessHit: 2,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['endoscopy'],                   medications: ['nexium'],                  surgeries: [],                       desc: 'Acid reflux. Manageable with meds.' },
  { id: 'ulcer',              label: 'Stomach Ulcer',                 category: 'digestive',      severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 4,  deathRiskPerYear: 0.005,treatable: true,  suggestedTests: ['endoscopy', 'h_pylori'],       medications: ['nexium', 'augmentin'],     surgeries: [],                       desc: 'Painful stomach sore. Curable with antibiotics.' },
  { id: 'gallstones',         label: 'Gallstones',                    category: 'digestive',      severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 3,  deathRiskPerYear: 0.01, treatable: true,  suggestedTests: ['ultrasound_abdomen'],          medications: [],                          surgeries: ['gallbladder'],          desc: 'Stones in gallbladder. Often removed.' },
  { id: 'hepatitis_b',        label: 'Hepatitis B',                   category: 'digestive',      severity: 'severe',   annualHealthHit: 5,  annualHappinessHit: 4,  deathRiskPerYear: 0.02, treatable: false, suggestedTests: ['liver'],                       medications: [],                          surgeries: [],                       desc: 'Chronic liver infection. Managed, not cured.' },

  /* ===== BONE / JOINT ===== */
  { id: 'arthritis',          label: 'Rheumatoid Arthritis',          category: 'autoimmune',     severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 4,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['esr'],                         medications: ['cataflam'],                surgeries: [],                       desc: 'Autoimmune joint pain. Manageable.' },
  { id: 'osteoporosis',       label: 'Osteoporosis',                  category: 'bone',           severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 1,  deathRiskPerYear: 0.005,treatable: true,  suggestedTests: ['dexa'],                        medications: ['calcium', 'vitamin_d'],    surgeries: [],                       desc: 'Weak bones. Higher fracture risk.' },

  /* ===== NEUROLOGICAL ===== */
  { id: 'migraine',           label: 'Chronic Migraine',              category: 'neuro',          severity: 'mild',     annualHealthHit: 1,  annualHappinessHit: 5,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: [],                              medications: ['cataflam'],                surgeries: [],                       desc: 'Recurring severe headaches.' },
  { id: 'epilepsy',           label: 'Epilepsy',                      category: 'neuro',          severity: 'severe',   annualHealthHit: 4,  annualHappinessHit: 5,  deathRiskPerYear: 0.015,treatable: true,  suggestedTests: ['eeg', 'mri_brain'],            medications: [],                          surgeries: [],                       desc: 'Seizures. Controllable with medication.' },
  { id: 'stroke_recovery',    label: 'Stroke Recovery',               category: 'neuro',          severity: 'critical', annualHealthHit: 8,  annualHappinessHit: 10, deathRiskPerYear: 0.08, treatable: true,  suggestedTests: ['ct_brain', 'mri_brain'],       medications: ['plavix', 'crestor'],       surgeries: [],                       desc: 'Recovering from stroke. High risk of recurrence.' },

  /* ===== CANCER ===== */
  { id: 'breast_cancer',      label: 'Breast Cancer',                 category: 'cancer',         severity: 'critical', annualHealthHit: 12, annualHappinessHit: 15, deathRiskPerYear: 0.15, treatable: true,  suggestedTests: ['mammogram', 'biopsy'],         medications: ['tamoxifen'],               surgeries: ['mastectomy'],           desc: 'Requires urgent treatment.' },
  { id: 'lung_cancer',        label: 'Lung Cancer',                   category: 'cancer',         severity: 'critical', annualHealthHit: 15, annualHappinessHit: 18, deathRiskPerYear: 0.25, treatable: true,  suggestedTests: ['ct_chest', 'biopsy'],          medications: [],                          surgeries: [],                       desc: 'Aggressive. Treatment essential.' },
  { id: 'colon_cancer',       label: 'Colon Cancer',                  category: 'cancer',         severity: 'critical', annualHealthHit: 12, annualHappinessHit: 15, deathRiskPerYear: 0.18, treatable: true,  suggestedTests: ['colonoscopy', 'biopsy'],       medications: [],                          surgeries: ['tumor_removal'],        desc: 'Treatable if caught early.' },
  { id: 'leukemia',           label: 'Leukemia',                      category: 'cancer',         severity: 'critical', annualHealthHit: 15, annualHappinessHit: 20, deathRiskPerYear: 0.30, treatable: true,  suggestedTests: ['cbc', 'bone_marrow'],          medications: ['imatinib'],                surgeries: [],                       desc: 'Blood cancer. Chemo essential.' },

  /* ===== KIDNEY ===== */
  { id: 'kidney_stones',      label: 'Kidney Stones',                 category: 'kidney',         severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 5,  deathRiskPerYear: 0.005,treatable: true,  suggestedTests: ['ultrasound_abdomen', 'ct_abdomen'], medications: [],                       surgeries: ['kidney_stone'],         desc: 'Painful stones. Often removed.' },
  { id: 'ckd',                label: 'Chronic Kidney Disease',        category: 'kidney',         severity: 'severe',   annualHealthHit: 7,  annualHappinessHit: 6,  deathRiskPerYear: 0.05, treatable: false, suggestedTests: ['kidney'],                      medications: ['co_diovan'],               surgeries: [],                       desc: 'Declining kidney function. Managed.' },

  /* ===== EYE / ENT ===== */
  { id: 'cataract',           label: 'Cataract',                      category: 'eye',            severity: 'moderate', annualHealthHit: 1,  annualHappinessHit: 3,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['eye_exam'],                    medications: [],                          surgeries: ['cataract'],             desc: 'Cloudy lens. Curable with surgery.' },
  { id: 'glaucoma',           label: 'Glaucoma',                      category: 'eye',            severity: 'severe',   annualHealthHit: 2,  annualHappinessHit: 3,  deathRiskPerYear: 0,    treatable: false, suggestedTests: ['eye_exam'],                    medications: [],                          surgeries: [],                       desc: 'Eye pressure. Can cause blindness if untreated.' },

  /* ===== SKIN ===== */
  { id: 'psoriasis',          label: 'Psoriasis',                     category: 'skin',           severity: 'moderate', annualHealthHit: 2,  annualHappinessHit: 5,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: [],                              medications: [],                          surgeries: [],                       desc: 'Chronic skin condition. Manageable.' },
  { id: 'eczema',             label: 'Eczema',                        category: 'skin',           severity: 'mild',     annualHealthHit: 1,  annualHappinessHit: 3,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: [],                              medications: [],                          surgeries: [],                       desc: 'Itchy skin. Managed with creams.' },

  /* ===== FERTILITY ===== */
  { id: 'fert_male_low_sperm', label: 'Male Factor Infertility',      category: 'fertility_m',    severity: 'moderate', annualHealthHit: 0,  annualHappinessHit: 4,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['semen_analysis'],              medications: [],                          surgeries: ['varicocele'],           desc: 'Low sperm count. Surgery or ICSI helps.' },
  { id: 'fert_female_tubes',  label: 'Blocked Fallopian Tubes',       category: 'fertility_f',    severity: 'moderate', annualHealthHit: 0,  annualHappinessHit: 5,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['hsg'],                         medications: [],                          surgeries: ['tube_surgery'],         desc: 'Tubes blocked. Surgery or IVF needed.' },
  { id: 'fert_endometriosis', label: 'Endometriosis',                 category: 'fertility_f',    severity: 'moderate', annualHealthHit: 2,  annualHappinessHit: 4,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['laparoscopy'],                 medications: [],                          surgeries: ['endo_surgery'],         desc: 'Uterine tissue growth. Affects fertility.' },

  /* ===== ACCIDENT ===== */
  { id: 'fracture',           label: 'Bone Fracture',                 category: 'bone',           severity: 'moderate', annualHealthHit: 3,  annualHappinessHit: 3,  deathRiskPerYear: 0,    treatable: true,  suggestedTests: ['xray_bone'],                   medications: ['cataflam'],                surgeries: ['fracture_repair'],      desc: 'Broken bone. Heals in 6-12 weeks.' },
  { id: 'head_injury',        label: 'Head Injury',                   category: 'neuro',          severity: 'severe',   annualHealthHit: 6,  annualHappinessHit: 5,  deathRiskPerYear: 0.05, treatable: true,  suggestedTests: ['ct_brain'],                    medications: [],                          surgeries: [],                       desc: 'Brain trauma. Needs observation.' },

  /* ===== BORN-WITH / CHILDHOOD ===== */
  { id: 'congenital_heart',   label: 'Congenital Heart Defect',       category: 'cardio',         severity: 'severe',   annualHealthHit: 5,  annualHappinessHit: 3,  deathRiskPerYear: 0.03, treatable: true,  suggestedTests: ['echo'],                        medications: ['concor'],                  surgeries: ['cabg'],                 desc: 'Born with it. Surgery can fix.' }
];

/* ---------- MEDICATIONS (real names, Egyptian prices) ---------- */
const MED_MEDICATIONS = [
  { id: 'panadol',       label: 'Panadol (paracetamol)',        monthlyEGP: 60,   treats: ['pain'],                        effect: 'mild' },
  { id: 'cataflam',      label: 'Cataflam (diclofenac)',        monthlyEGP: 120,  treats: ['pain', 'arthritis', 'migraine', 'fracture'], effect: 'mild' },
  { id: 'augmentin',     label: 'Augmentin (amoxicillin)',      monthlyEGP: 280,  treats: ['pneumonia', 'ulcer'],          effect: 'mild' },
  { id: 'zitromax',      label: 'Zitromax (azithromycin)',      monthlyEGP: 220,  treats: ['pneumonia'],                   effect: 'mild' },
  { id: 'concor',        label: 'Concor (bisoprolol)',          monthlyEGP: 180,  treats: ['hypertension', 'heart_disease', 'arrhythmia', 'congenital_heart'], effect: 'moderate' },
  { id: 'co_diovan',     label: 'Co-Diovan (valsartan)',        monthlyEGP: 260,  treats: ['hypertension', 'ckd'],         effect: 'moderate' },
  { id: 'crestor',       label: 'Crestor (rosuvastatin)',       monthlyEGP: 340,  treats: ['high_cholesterol', 'heart_disease', 'stroke_recovery'], effect: 'moderate' },
  { id: 'atorvastatin',  label: 'Atorvastatin (generic)',       monthlyEGP: 180,  treats: ['high_cholesterol'],            effect: 'mild' },
  { id: 'plavix',        label: 'Plavix (clopidogrel)',         monthlyEGP: 380,  treats: ['heart_disease', 'heart_attack', 'stroke_recovery'], effect: 'moderate' },
  { id: 'glucophage',    label: 'Glucophage (metformin)',       monthlyEGP: 100,  treats: ['type2_diabetes', 'pcos'],      effect: 'moderate' },
  { id: 'januvia',       label: 'Januvia (sitagliptin)',        monthlyEGP: 620,  treats: ['type2_diabetes'],              effect: 'strong' },
  { id: 'lantus',        label: 'Lantus (long insulin)',        monthlyEGP: 480,  treats: ['type1_diabetes'],              effect: 'strong' },
  { id: 'novorapid',     label: 'NovoRapid (fast insulin)',     monthlyEGP: 420,  treats: ['type1_diabetes'],              effect: 'strong' },
  { id: 'eltroxin',      label: 'Eltroxin (levothyroxine)',     monthlyEGP: 80,   treats: ['hypothyroid'],                 effect: 'moderate' },
  { id: 'euthyrox',      label: 'Euthyrox (levothyroxine)',     monthlyEGP: 90,   treats: ['hypothyroid'],                 effect: 'moderate' },
  { id: 'zoloft',        label: 'Zoloft (sertraline)',          monthlyEGP: 320,  treats: ['depression', 'anxiety', 'severe_depression'], effect: 'slow' },
  { id: 'prozac',        label: 'Prozac (fluoxetine)',          monthlyEGP: 280,  treats: ['depression', 'severe_depression'], effect: 'slow' },
  { id: 'xanax',         label: 'Xanax (alprazolam)',           monthlyEGP: 240,  treats: ['anxiety', 'panic_disorder'],   effect: 'fast', addictive: true },
  { id: 'nexium',        label: 'Nexium (esomeprazole)',        monthlyEGP: 260,  treats: ['gerd', 'ulcer', 'ibs'],        effect: 'moderate' },
  { id: 'ventolin',      label: 'Ventolin (salbutamol)',        monthlyEGP: 200,  treats: ['asthma', 'copd'],              effect: 'moderate' },
  { id: 'neurobion',     label: 'Neurobion (B vitamins)',       monthlyEGP: 120,  treats: ['neuropathy'],                  effect: 'mild' },
  { id: 'vitamin_d',     label: 'Vitamin D 50000 IU',           monthlyEGP: 90,   treats: ['osteoporosis'],                effect: 'mild' },
  { id: 'calcium',       label: 'Calcium + D3',                 monthlyEGP: 80,   treats: ['osteoporosis'],                effect: 'mild' },
  { id: 'tamoxifen',     label: 'Tamoxifen (breast cancer)',    monthlyEGP: 800,  treats: ['breast_cancer'],               effect: 'strong' },
  { id: 'imatinib',      label: 'Imatinib (leukemia)',          monthlyEGP: 6500, treats: ['leukemia'],                    effect: 'strong' },
  { id: 'clomid',        label: 'Clomid (clomiphene)',          monthlyEGP: 480,  treats: ['pcos', 'fert_female_tubes'],   effect: 'fertility' }
];

/* ---------- TESTS / ANALYSES ---------- */
const MED_TESTS = [
  { id: 'bp_check',           label: 'Blood Pressure Check',    costEGP: 100,   waitMonths: 0,  detects: ['hypertension'] },
  { id: 'cbc',                label: 'Complete Blood Count',    costEGP: 200,   waitMonths: 1,  detects: ['pneumonia', 'leukemia'] },
  { id: 'glucose',            label: 'Blood Glucose',           costEGP: 100,   waitMonths: 1,  detects: ['type2_diabetes', 'type1_diabetes'] },
  { id: 'hba1c',              label: 'HbA1c (3-mo sugar)',      costEGP: 250,   waitMonths: 1,  detects: ['type2_diabetes', 'type1_diabetes'] },
  { id: 'lipid',              label: 'Lipid Profile',           costEGP: 300,   waitMonths: 1,  detects: ['high_cholesterol'] },
  { id: 'thyroid',            label: 'Thyroid Panel (TSH, T3, T4)', costEGP: 350, waitMonths: 1, detects: ['hypothyroid'] },
  { id: 'liver',              label: 'Liver Function',          costEGP: 300,   waitMonths: 1,  detects: ['hepatitis_b'] },
  { id: 'kidney',             label: 'Kidney Function',         costEGP: 300,   waitMonths: 1,  detects: ['ckd'] },
  { id: 'esr',                label: 'ESR (inflammation)',      costEGP: 200,   waitMonths: 1,  detects: ['arthritis'] },
  { id: 'h_pylori',           label: 'H. pylori Test',          costEGP: 350,   waitMonths: 1,  detects: ['ulcer'] },
  { id: 'ecg',                label: 'ECG / EKG',               costEGP: 250,   waitMonths: 0,  detects: ['hypertension', 'heart_disease', 'arrhythmia'] },
  { id: 'echo',               label: 'Echocardiogram',          costEGP: 1800,  waitMonths: 1,  detects: ['heart_disease', 'congenital_heart'] },
  { id: 'stress',             label: 'Stress Test',             costEGP: 2200,  waitMonths: 1,  detects: ['heart_disease'] },
  { id: 'holter',             label: 'Holter Monitor (24h)',    costEGP: 1500,  waitMonths: 1,  detects: ['arrhythmia'] },
  { id: 'xray_chest',         label: 'Chest X-ray',             costEGP: 400,   waitMonths: 1,  detects: ['pneumonia', 'lung_cancer'] },
  { id: 'xray_bone',          label: 'Bone X-ray',              costEGP: 400,   waitMonths: 1,  detects: ['fracture', 'osteoporosis'] },
  { id: 'ct_chest',           label: 'CT Scan (Chest)',         costEGP: 2800,  waitMonths: 1,  detects: ['lung_cancer'] },
  { id: 'ct_brain',           label: 'CT Scan (Brain)',         costEGP: 3000,  waitMonths: 1,  detects: ['head_injury', 'stroke_recovery'] },
  { id: 'ct_abdomen',         label: 'CT Scan (Abdomen)',       costEGP: 2800,  waitMonths: 1,  detects: ['kidney_stones'] },
  { id: 'mri_brain',          label: 'MRI (Brain)',             costEGP: 4500,  waitMonths: 2,  detects: ['epilepsy', 'stroke_recovery'] },
  { id: 'ultrasound_abdomen', label: 'Abdominal Ultrasound',    costEGP: 800,   waitMonths: 1,  detects: ['gallstones', 'kidney_stones'] },
  { id: 'ultrasound_pelvic',  label: 'Pelvic Ultrasound',       costEGP: 900,   waitMonths: 1,  detects: ['pcos', 'fert_endometriosis'] },
  { id: 'endoscopy',          label: 'Endoscopy',               costEGP: 2800,  waitMonths: 1,  detects: ['gerd', 'ulcer'] },
  { id: 'colonoscopy',        label: 'Colonoscopy',             costEGP: 3800,  waitMonths: 2,  detects: ['colon_cancer', 'ibs'] },
  { id: 'biopsy',             label: 'Tissue Biopsy',           costEGP: 2200,  waitMonths: 1,  detects: ['breast_cancer', 'lung_cancer', 'colon_cancer'] },
  { id: 'mammogram',          label: 'Mammogram',               costEGP: 1200,  waitMonths: 1,  detects: ['breast_cancer'] },
  { id: 'pap_smear',          label: 'Pap Smear',               costEGP: 500,   waitMonths: 1,  detects: ['breast_cancer'] },
  { id: 'dexa',               label: 'Bone Density (DEXA)',     costEGP: 1500,  waitMonths: 1,  detects: ['osteoporosis'] },
  { id: 'eye_exam',           label: 'Eye Exam',                costEGP: 500,   waitMonths: 0,  detects: ['cataract', 'glaucoma'] },
  { id: 'spirometry',         label: 'Spirometry (lungs)',      costEGP: 900,   waitMonths: 0,  detects: ['asthma', 'copd'] },
  { id: 'eeg',                label: 'EEG (brain waves)',       costEGP: 2500,  waitMonths: 2,  detects: ['epilepsy'] },
  { id: 'bone_marrow',        label: 'Bone Marrow Biopsy',      costEGP: 5000,  waitMonths: 2,  detects: ['leukemia'] },
  { id: 'semen_analysis',     label: 'Semen Analysis',          costEGP: 500,   waitMonths: 1,  detects: ['fert_male_low_sperm'] },
  { id: 'hsg',                label: 'HSG (tube scan)',         costEGP: 1800,  waitMonths: 1,  detects: ['fert_female_tubes'] },
  { id: 'hormones',           label: 'Hormone Panel',           costEGP: 900,   waitMonths: 1,  detects: ['pcos', 'fert_endometriosis'] },
  { id: 'laparoscopy',        label: 'Diagnostic Laparoscopy',  costEGP: 6500,  waitMonths: 2,  detects: ['fert_endometriosis'] }
];

/* ---------- SURGERIES ---------- */
/* costEGP is base (multiply by hospital tier costMult) */
const MED_SURGERIES = [
  { id: 'appendectomy',    label: 'Appendectomy',                 baseCostEGP: 25000,  recoveryMonths: 1, cures: ['appendicitis'] },
  { id: 'gallbladder',     label: 'Gallbladder Removal',          baseCostEGP: 35000,  recoveryMonths: 2, cures: ['gallstones'] },
  { id: 'hernia_repair',   label: 'Hernia Repair',                baseCostEGP: 20000,  recoveryMonths: 1, cures: ['hernia'] },
  { id: 'cabg',            label: 'Coronary Bypass (CABG)',       baseCostEGP: 250000, recoveryMonths: 6, cures: ['heart_disease', 'congenital_heart'], partial: true },
  { id: 'angioplasty',     label: 'Angioplasty + Stent',          baseCostEGP: 120000, recoveryMonths: 3, cures: ['heart_disease'], partial: true },
  { id: 'pacemaker',       label: 'Pacemaker Implant',            baseCostEGP: 180000, recoveryMonths: 3, cures: ['arrhythmia'], partial: true },
  { id: 'tumor_removal',   label: 'Tumor Removal',                baseCostEGP: 150000, recoveryMonths: 4, cures: ['colon_cancer', 'lung_cancer'], partial: true },
  { id: 'mastectomy',      label: 'Mastectomy',                   baseCostEGP: 80000,  recoveryMonths: 4, cures: ['breast_cancer'], partial: true },
  { id: 'kidney_stone',    label: 'Kidney Stone Removal',         baseCostEGP: 28000,  recoveryMonths: 1, cures: ['kidney_stones'] },
  { id: 'fracture_repair', label: 'Fracture Repair',              baseCostEGP: 18000,  recoveryMonths: 2, cures: ['fracture'] },
  { id: 'cataract',        label: 'Cataract Surgery',             baseCostEGP: 18000,  recoveryMonths: 1, cures: ['cataract'] },
  { id: 'ovarian_drill',   label: 'Ovarian Drilling (PCOS)',      baseCostEGP: 45000,  recoveryMonths: 2, cures: ['pcos'] },
  { id: 'varicocele',      label: 'Varicocele Repair',            baseCostEGP: 30000,  recoveryMonths: 2, cures: ['fert_male_low_sperm'] },
  { id: 'tube_surgery',    label: 'Fallopian Tube Surgery',       baseCostEGP: 55000,  recoveryMonths: 2, cures: ['fert_female_tubes'] },
  { id: 'endo_surgery',    label: 'Endometriosis Excision',       baseCostEGP: 60000,  recoveryMonths: 2, cures: ['fert_endometriosis'] },
  { id: 'lasik',           label: 'LASIK Eye Surgery',            baseCostEGP: 25000,  recoveryMonths: 0.5, cures: ['myopia'] },
  { id: 'rhinoplasty',     label: 'Rhinoplasty (nose)',           baseCostEGP: 55000,  recoveryMonths: 1, cures: [] },
  { id: 'breast_aug',      label: 'Breast Augmentation',          baseCostEGP: 85000,  recoveryMonths: 1, cures: [] }
];

/* ---------- NON-SURGICAL TREATMENTS ---------- */
const MED_TREATMENTS = [
  { id: 'therapy',         label: 'Psychotherapy session',         costEGP: 800,    perSession: true,  treats: ['anxiety', 'depression', 'panic_disorder', 'severe_depression'], desc: 'Talk therapy. Gradual support for anxiety and depression.' },
  { id: 'psych_eval',      label: 'Psychiatric Evaluation',        costEGP: 1500,   perSession: false, treats: [],                                                                       desc: 'Full mental health assessment.' },
  { id: 'chemo',           label: 'Chemotherapy Course',           costEGP: 85000,  perSession: false, treats: ['breast_cancer', 'lung_cancer', 'colon_cancer', 'leukemia'],               desc: 'Kills cancer cells. Rough side effects.' },
  { id: 'radiation',       label: 'Radiation Therapy',             costEGP: 65000,  perSession: false, treats: ['breast_cancer', 'lung_cancer', 'colon_cancer'],                          desc: 'Targeted cancer radiation.' },
  { id: 'dialysis',        label: 'Dialysis Session',              costEGP: 3500,   perSession: true,  treats: ['ckd'],                                                                       desc: 'Kidney filtration. Weekly.' },
  { id: 'physio',          label: 'Physiotherapy',                 costEGP: 800,    perSession: true,  treats: ['fracture', 'arthritis', 'stroke_recovery'],                                  desc: 'Recovery training.' },
  { id: 'iui',             label: 'IUI (Intrauterine Insemination)',costEGP: 8000,  perSession: true,  treats: ['fert_male_low_sperm'],                                                       desc: 'Sperm placed directly in uterus.' }
];

/* ---------- FERTILITY TREATMENTS ---------- */
const MED_FERTILITY_TREATMENTS = [
  { id: 'fert_consult',     label: 'Fertility Consultation',        costEGP: 1500,   successPct: 0,     desc: 'Initial assessment.' },
  { id: 'iui_cycle',        label: 'IUI Cycle',                      costEGP: 8000,   successPct: 0.15,  desc: 'Washed sperm placed in uterus.' },
  { id: 'ivf_cycle',        label: 'IVF Cycle',                      costEGP: 90000,  successPct: 0.35,  desc: 'Eggs fertilized outside, implanted.' },
  { id: 'icsi_cycle',       label: 'ICSI Cycle (advanced IVF)',      costEGP: 140000, successPct: 0.45,  desc: 'Direct sperm injection. Best for male factor.' },
  { id: 'clomid_course',    label: 'Ovulation Induction (Clomid)',   costEGP: 6000,   successPct: 0.20,  desc: 'Stimulates egg release. For PCOS.' }
];

/* ---------- MENTAL HEALTH TRIGGERS ---------- */
const MED_MENTAL_TRIGGERS = [
  { id: 'low_happiness',    label: 'Persistent low happiness',     condition: 'depression',        minYears: 2, happinessBelow: 30 },
  { id: 'divorce',          label: 'Divorce',                     condition: 'depression',        minYears: 0, prob: 0.5 },
  { id: 'job_loss',         label: 'Job loss',                    condition: 'anxiety',           minYears: 0, prob: 0.35 },
  { id: 'death_family',     label: 'Family death',                condition: 'depression',        minYears: 0, prob: 0.4 },
  { id: 'financial_crisis', label: 'Financial crisis',            condition: 'anxiety',           minYears: 0, prob: 0.3 },
  { id: 'isolation',        label: 'Social isolation',            condition: 'depression',        minYears: 1, socialBelow: 25 }
];

/* ---------- RANDOM MEDICAL EVENTS ---------- */
const MED_RANDOM_EVENTS = [
  { id: 'car_accident_minor',    weight: 8,  label: 'Minor car accident',         text: 'Someone rear-ended you. Whiplash.',          createsCondition: 'fracture',           severityRange: [1, 3] },
  { id: 'car_accident_major',    weight: 3,  label: 'Serious car accident',       text: 'Head-on collision. Ambulance rushed you.',   createsCondition: 'fracture',           severityRange: [6, 9] },
  { id: 'fall_slip',             weight: 6,  label: 'Slip and fall',               text: 'You slipped on wet floor.',                  createsCondition: 'fracture',           severityRange: [1, 4] },
  { id: 'sports_injury',         weight: 5,  label: 'Sports injury',               text: 'Twisted your knee playing sports.',          createsCondition: 'fracture',           severityRange: [2, 4] },
  { id: 'food_poisoning',        weight: 8,  label: 'Food poisoning',              text: 'Bad koshary. Throwing up all night.',        createsCondition: 'ibs',                severityRange: [1, 2] },
  { id: 'appendicitis_sudden',   weight: 2,  label: 'Sudden appendicitis',         text: 'Sharp pain in your side. Needs surgery.',    createsCondition: 'appendicitis',       severityRange: [7, 9] },
  { id: 'kidney_stone_attack',   weight: 4,  label: 'Kidney stone attack',         text: 'Most painful thing you ever felt.',          createsCondition: 'kidney_stones',      severityRange: [5, 8] },
  { id: 'heart_attack_sudden',   weight: 2,  label: 'Heart attack',                text: 'Chest pain. Call ambulance immediately.',     createsCondition: 'heart_attack',       severityRange: [8, 10], requires: ['hypertension', 'high_cholesterol', 'heart_disease'], minAge: 40 },
  { id: 'stroke_sudden',         weight: 2,  label: 'Stroke',                      text: 'Face drooping. Arm weakness. Call 123.',     createsCondition: 'stroke_recovery',    severityRange: [7, 10], requires: ['hypertension'], minAge: 50 },
  { id: 'flu_season',            weight: 10, label: 'Seasonal flu',                text: 'You caught the flu. Rest and fluids.',       createsCondition: null,                 healthHit: -3 },
  { id: 'anxiety_attack',        weight: 5,  label: 'Anxiety attack',              text: 'Overwhelming panic in public.',              createsCondition: 'panic_disorder',     severityRange: [2, 4], requires: [] }
];

/* ---------- PREVENTIVE CARE ---------- */
const MED_PREVENTIVE = [
  { id: 'annual_checkup',    label: 'Annual Full Checkup',      costEGP: 2500,  healthGain: 3,  detectsChance: 0.10, desc: 'General physical, blood work. Catches issues early.' },
  { id: 'dental_cleaning',   label: 'Dental Cleaning',          costEGP: 800,   healthGain: 1,  detectsChance: 0.05, desc: 'Prevents decay.' },
  { id: 'eye_exam_prevent',  label: 'Routine Eye Exam',         costEGP: 500,   healthGain: 1,  detectsChance: 0.03, desc: 'Vision check.' },
  { id: 'flu_vaccine',       label: 'Flu Vaccine',              costEGP: 400,   healthGain: 2,  detectsChance: 0,    desc: 'Prevents seasonal flu.' },
  { id: 'covid_vaccine',     label: 'COVID Booster',            costEGP: 600,   healthGain: 2,  detectsChance: 0,    desc: 'Protects against severe variants.' }
];

/* ---------- MEDICAL TOURISM ---------- */
const MED_TOURISM = [
  { id: 'turkey',  label: 'Turkey (medical tourism)',   costMult: 0.55, waitWeeks: 4, qualityMult: 1.1, desc: 'Half the cost. Good quality. Popular for hair, dental, weight loss.' },
  { id: 'germany', label: 'Germany (premium)',          costMult: 3.00, waitWeeks: 8, qualityMult: 1.3, desc: 'World-class. Very expensive. Best for complex cases.' },
  { id: 'uk',      label: 'United Kingdom',             costMult: 2.50, waitWeeks: 10,qualityMult: 1.25,desc: 'High quality. Long waits for public, pricey private.' },
  { id: 'thailand',label: 'Thailand',                   costMult: 0.70, waitWeeks: 6, qualityMult: 1.1, desc: 'Good balance. Popular for cosmetic and dental.' }
];
