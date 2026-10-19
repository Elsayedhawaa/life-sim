/* ============================================================
   WORLD LIFE — DATA: EDUCATION (EXPANDED)
   ============================================================
   Pure data. Uses EDU_ prefix to avoid collision.
   All costs EGP base (multiply by C().rate for other countries).
   ============================================================ */

/* ---------- SCHOOL TIERS (Egypt & Global Equiv) ---------- */
/* smartsMult: daily smarts gain multiplier
   englishBonus: annual English skill gain
   socialBonus: annual social gain
   prestige: for CV/university admission later */
const EDU_SCHOOLS = [
  { id: 'national',    label: 'National Public School',     annualEGP: 500,    smartsMult: 1.0, englishBonus: 2,  socialBonus: 1, prestige: 1, desc: 'Free government school. 50-80 students per class. High stress.' },
  { id: 'azhari',      label: 'Al-Azhar Institute',         annualEGP: 800,    smartsMult: 1.0, englishBonus: 1,  socialBonus: 2, prestige: 1, desc: 'Religious & national curriculum combined.' },
  { id: 'language',    label: 'Experimental Language School',annualEGP: 25000,  smartsMult: 1.1, englishBonus: 6,  socialBonus: 2, prestige: 2, desc: 'Egyptian curriculum + better English/Math teaching in English.' },
  { id: 'private',     label: 'Private National School',    annualEGP: 60000,  smartsMult: 1.2, englishBonus: 8,  socialBonus: 3, prestige: 3, desc: 'Good private Egyptian school. Better facilities.' },
  { id: 'private_top', label: 'Top Private National',       annualEGP: 120000, smartsMult: 1.3, englishBonus: 10, socialBonus: 4, prestige: 4, desc: 'Elite Egyptian schools (Collège, Jesuites, etc.).' },
  { id: 'igcse',       label: 'British IGCSE School',       annualEGP: 280000, smartsMult: 1.4, englishBonus: 15, socialBonus: 5, prestige: 5, desc: 'IGCSE curriculum. High-quality English, globally recognized.' },
  { id: 'american',    label: 'American Diploma School',    annualEGP: 320000, smartsMult: 1.4, englishBonus: 15, socialBonus: 5, prestige: 5, desc: 'American diploma. SAT/ACT focus. Relaxed environment.' },
  { id: 'ib',          label: 'IB International School',    annualEGP: 420000, smartsMult: 1.5, englishBonus: 18, socialBonus: 6, prestige: 5, desc: 'IB diploma. Elite worldwide recognition. Heavy workload.' },
  { id: 'boarding',    label: 'European Boarding School',   annualEGP: 1200000,smartsMult: 1.6, englishBonus: 20, socialBonus: 8, prestige: 6, desc: 'Ultra-elite international boarding school (e.g. Le Rosey).' }
];

/* ---------- TRACKS (age 15 choice - High School Path) ---------- */
const EDU_TRACKS = [
  {
    id: 'thanaweya',
    label: 'Thanaweya Amma',
    requiresSchool: ['national', 'azhari', 'language', 'private', 'private_top'],
    annualEGP: 0,
    tutoringCost: 50000, // Thanaweya tutoring is practically mandatory in Egypt
    universityAccess: 'egypt_public_private',
    scoreSystem: 'percent_100',
    thanaweyaBonus: 0,
    desc: 'Egyptian national high school exam. Brutal competition. Percent-based.'
  },
  {
    id: 'stem_school',
    label: 'STEM High School',
    requiresSchool: ['national', 'language'], // Requires passing an entrance exam
    annualEGP: 3000,
    tutoringCost: 0,
    universityAccess: 'egypt_public_private',
    scoreSystem: 'percent_100',
    thanaweyaBonus: 3,
    desc: 'Elite government STEM schools. Project-based learning, highly selective.'
  },
  {
    id: 'alevels',
    label: 'British A-Levels',
    requiresSchool: ['igcse', 'ib'],
    annualEGP: 100000,
    tutoringCost: 80000,
    universityAccess: 'global',
    scoreSystem: 'grades_A_to_E',
    thanaweyaBonus: 5,
    desc: 'UK university entrance. A*-E grades. Requires private tutors in Egypt usually.'
  },
  {
    id: 'ib',
    label: 'IB Diploma',
    requiresSchool: ['ib', 'igcse'],
    annualEGP: 250000,
    tutoringCost: 40000,
    universityAccess: 'global',
    scoreSystem: 'points_45',
    thanaweyaBonus: 8,
    desc: 'International Baccalaureate. 24-45 points. Global university access.'
  },
  {
    id: 'act',
    label: 'American Diploma (ACT/EST)',
    requiresSchool: ['american', 'igcse'],
    annualEGP: 150000,
    tutoringCost: 60000,
    universityAccess: 'usa_egypt_private',
    scoreSystem: 'act_36',
    thanaweyaBonus: 5,
    desc: 'ACT/EST score. US & Egyptian private university entrance.'
  }
];

/* ---------- THANAWEYA CUTOFFS (2026 real, by faculty) ---------- */
const EDU_CUTOFFS = [
  { faculty: 'medicine',        cutoff: 91.5, degree: 'medicine',  label: 'Medicine' },
  { faculty: 'dentistry',       cutoff: 90.8, degree: 'medicine',  label: 'Dentistry' },
  { faculty: 'pharmacy',        cutoff: 89.2, degree: 'medicine',  label: 'Pharmacy' },
  { faculty: 'vet',             cutoff: 85.5, degree: 'medicine',  label: 'Veterinary' },
  { faculty: 'physical_therapy',cutoff: 85.0, degree: 'medicine',  label: 'Physical Therapy' },
  { faculty: 'engineering',     cutoff: 83.5, degree: 'engineering', label: 'Engineering' },
  { faculty: 'architecture',    cutoff: 82.0, degree: 'engineering', label: 'Architecture' },
  { faculty: 'cs',              cutoff: 80.0, degree: 'cs',        label: 'Computer Science' },
  { faculty: 'it',              cutoff: 78.5, degree: 'cs',        label: 'Information Technology' },
  { faculty: 'economics',       cutoff: 74.0, degree: 'business',  label: 'Economics & Political Science' },
  { faculty: 'business',        cutoff: 72.0, degree: 'business',  label: 'Business Administration' },
  { faculty: 'mass_comm',       cutoff: 72.0, degree: 'general',   label: 'Mass Communication' },
  { faculty: 'commerce',        cutoff: 70.5, degree: 'business',  label: 'Commerce / Accounting' },
  { faculty: 'nursing',         cutoff: 70.0, degree: 'medicine',  label: 'Nursing' },
  { faculty: 'law',             cutoff: 68.5, degree: 'law',       label: 'Law' },
  { faculty: 'arts',            cutoff: 65.0, degree: 'general',   label: 'Arts / Literature' },
  { faculty: 'agriculture',     cutoff: 63.0, degree: 'general',   label: 'Agriculture' },
  { faculty: 'education',       cutoff: 62.5, degree: 'general',   label: 'Education' }
];

/* ---------- EGYPTIAN UNIVERSITIES ---------- */
const EDU_UNIVERSITIES = [
  /* Public - High prestige but crowded */
  { id: 'cairo',      name: 'Cairo University',                  type: 'public',  city: 'Giza',       tuitionEGP: 12000, quality: 9,  years: 4 },
  { id: 'alex',       name: 'Alexandria University',             type: 'public',  city: 'Alexandria', tuitionEGP: 12000, quality: 8,  years: 4 },
  { id: 'ain',        name: 'Ain Shams University',              type: 'public',  city: 'Cairo',      tuitionEGP: 12000, quality: 8,  years: 4 },
  { id: 'assiut',     name: 'Assiut University',                 type: 'public',  city: 'Assiut',     tuitionEGP: 12000, quality: 7,  years: 4 },
  { id: 'mansoura',   name: 'Mansoura University',               type: 'public',  city: 'Mansoura',   tuitionEGP: 12000, quality: 8,  years: 4 },
  { id: 'tanta',      name: 'Tanta University',                  type: 'public',  city: 'Tanta',      tuitionEGP: 12000, quality: 7,  years: 4 },
  { id: 'zagazig',    name: 'Zagazig University',                type: 'public',  city: 'Zagazig',    tuitionEGP: 12000, quality: 7,  years: 4 },
  { id: 'helwan',     name: 'Helwan University',                 type: 'public',  city: 'Cairo',      tuitionEGP: 12000, quality: 7,  years: 4 },
  { id: 'benha',      name: 'Benha University',                  type: 'public',  city: 'Benha',      tuitionEGP: 12000, quality: 7,  years: 4 },
  { id: 'menoufia',   name: 'Menoufia University',               type: 'public',  city: 'Menoufia',   tuitionEGP: 12000, quality: 7,  years: 4 },
  
  /* Private - High Cost, Lower Thanaweya Cutoffs */
  { id: 'auc',        name: 'American University in Cairo (AUC)',  type: 'private', city: 'New Cairo',  tuitionEGP: 600000, quality: 10, years: 4, cutoffs: 60 },
  { id: 'guc',        name: 'German University in Cairo (GUC)',    type: 'private', city: 'New Cairo',  tuitionEGP: 350000, quality: 9,  years: 4, cutoffs: 60 },
  { id: 'bue',        name: 'British University in Egypt (BUE)',   type: 'private', city: 'El Sherouk', tuitionEGP: 280000, quality: 8,  years: 4, cutoffs: 58 },
  { id: 'aastmt',     name: 'Arab Academy (AASTMT)',               type: 'private', city: 'Alexandria', tuitionEGP: 200000, quality: 8,  years: 4, cutoffs: 55 },
  { id: 'miu',        name: 'Misr International University (MIU)', type: 'private', city: 'Cairo',      tuitionEGP: 220000, quality: 7,  years: 4, cutoffs: 55 },
  { id: 'msa',        name: 'Modern Sciences & Arts (MSA)',        type: 'private', city: '6th of Oct', tuitionEGP: 150000, quality: 7,  years: 4, cutoffs: 52 },
  { id: 'buc',        name: 'Badr University (BUC)',               type: 'private', city: 'Badr City',  tuitionEGP: 180000, quality: 7,  years: 4, cutoffs: 55 },
  { id: 'nile',       name: 'Nile University',                     type: 'private', city: 'Sheikh Zayed',tuitionEGP: 220000, quality: 7,  years: 4, cutoffs: 55 },
  { id: 'future',     name: 'Future University',                   type: 'private', city: 'New Cairo',  tuitionEGP: 180000, quality: 7,  years: 4, cutoffs: 55 },
  { id: 'ngu',        name: 'New Giza University (NGU)',           type: 'private', city: 'New Giza',   tuitionEGP: 300000, quality: 8,  years: 4, cutoffs: 60 },
  { id: 'eelu',       name: 'Egyptian E-Learning University',      type: 'private', city: 'Online',     tuitionEGP: 50000,  quality: 5,  years: 4, cutoffs: 50 }
];

/* ---------- MAJORS / FACULTIES ---------- */
/* Maps to degree for career system compatibility.
   yearsOverride for 5-7 year majors. */
const EDU_MAJORS = [
  { id: 'medicine',        label: 'Medicine',           degree: 'medicine',    years: 7, cutoffKey: 'medicine',         isSTEM: true,  desc: '5 years study + 2 years Imtyaz (internship).' },
  { id: 'dentistry',       label: 'Dentistry',          degree: 'medicine',    years: 6, cutoffKey: 'dentistry',        isSTEM: true,  desc: '5 years study + 1 year internship.' },
  { id: 'pharmacy',        label: 'Pharmacy (PharmD)',  degree: 'medicine',    years: 6, cutoffKey: 'pharmacy',         isSTEM: true,  desc: '5 years study + 1 year internship.' },
  { id: 'vet',             label: 'Veterinary Medicine',degree: 'medicine',    years: 5, cutoffKey: 'vet',              isSTEM: true,  desc: 'Animal care and medicine.' },
  { id: 'physical_therapy',label: 'Physical Therapy',   degree: 'medicine',    years: 6, cutoffKey: 'physical_therapy', isSTEM: true,  desc: '5 years + 1 year internship.' },
  { id: 'nursing',         label: 'Nursing',            degree: 'medicine',    years: 4, cutoffKey: 'nursing',          isSTEM: true,  desc: 'High demand locally and internationally.' },
  { id: 'engineering',     label: 'Engineering',        degree: 'engineering', years: 5, cutoffKey: 'engineering',      isSTEM: true,  desc: 'Prep year + 4 years specialization.' },
  { id: 'architecture',    label: 'Architecture',       degree: 'engineering', years: 5, cutoffKey: 'architecture',     isSTEM: true,  desc: 'Prep year + 4 years specialization.' },
  { id: 'cs',              label: 'Computer Science',   degree: 'cs',          years: 4, cutoffKey: 'cs',               isSTEM: true,  desc: 'Software engineering & AI.' },
  { id: 'it',              label: 'Information Tech',   degree: 'cs',          years: 4, cutoffKey: 'it',               isSTEM: true,  desc: 'Networking, databases, security.' },
  { id: 'economics',       label: 'Economics & PoliSci',degree: 'business',    years: 4, cutoffKey: 'economics',        isSTEM: false, desc: 'Path to diplomacy and finance.' },
  { id: 'business',        label: 'Business Admin',     degree: 'business',    years: 4, cutoffKey: 'business',         isSTEM: false, desc: 'Management, marketing, HR.' },
  { id: 'finance',         label: 'Finance & Investment',degree: 'business',   years: 4, cutoffKey: 'business',         isSTEM: false, desc: 'Banking, stocks, wealth management.' },
  { id: 'commerce',        label: 'Commerce / Accounting', degree: 'business', years: 4, cutoffKey: 'commerce',         isSTEM: false, desc: 'Traditional accounting and commerce.' },
  { id: 'mass_comm',       label: 'Mass Communication', degree: 'general',     years: 4, cutoffKey: 'mass_comm',        isSTEM: false, desc: 'Journalism, PR, broadcasting.' },
  { id: 'law',             label: 'Law (Huquq)',        degree: 'law',         years: 4, cutoffKey: 'law',              isSTEM: false, desc: 'Path to lawyer, prosecutor, judge.' },
  { id: 'arts',            label: 'Arts (Adab)',        degree: 'general',     years: 4, cutoffKey: 'arts',             isSTEM: false, desc: 'Literature, history, languages.' },
  { id: 'agriculture',     label: 'Agriculture',        degree: 'general',     years: 4, cutoffKey: 'agriculture',      isSTEM: false, desc: 'Farming tech and agribusiness.' },
  { id: 'education',       label: 'Education (Tarbeya)',degree: 'general',     years: 4, cutoffKey: 'education',        isSTEM: false, desc: 'Path to becoming a teacher.' },
  { id: 'fine_arts',       label: 'Fine Arts',          degree: 'general',     years: 5, cutoffKey: 'arts',             isSTEM: false, desc: 'Painting, sculpture, interior design.' }
];

/* ---------- LANGUAGE TESTS ---------- */
const EDU_LANGUAGE_TESTS = [
  { id: 'ielts',   label: 'IELTS Academic',              costUSD: 250, waitMonths: 1, maxScore: 9,   passScore: 6.5, desc: 'Required for UK, Australia, Canada, US universities.' },
  { id: 'toefl',   label: 'TOEFL iBT',                   costUSD: 220, waitMonths: 1, maxScore: 120, passScore: 90,  desc: 'US-focused, widely accepted globally.' },
  { id: 'goethe',  label: 'Goethe-Zertifikat (German)',  costUSD: 200, waitMonths: 2, maxScore: 6,   passScore: 4,   desc: 'German proficiency. B1=3, B2=4 (Req for Univ), C1=5.' },
  { id: 'delf',    label: 'DELF/DALF (French)',          costUSD: 180, waitMonths: 2, maxScore: 6,   passScore: 4,   desc: 'French proficiency. B2=4 (Req for Univ), C1=5.' },
  { id: 'celpip',  label: 'CELPIP (Canada)',             costUSD: 280, waitMonths: 1, maxScore: 12,  passScore: 7,   desc: 'Canadian English test. Mostly for PR/Immigration.' }
];

/* ---------- STUDY ABROAD UNIVERSITIES ---------- */
const EDU_STUDY_ABROAD_UNIS = [
  { id: 'oxford',    country: 'uk',  name: 'University of Oxford',    tuitionUSD: 45000, quality: 10, requiresIELTS: 7.5, requiresGPA: 3.8, reqTrack: ['alevels','ib'] },
  { id: 'cambridge', country: 'uk',  name: 'University of Cambridge', tuitionUSD: 45000, quality: 10, requiresIELTS: 7.5, requiresGPA: 3.8, reqTrack: ['alevels','ib'] },
  { id: 'imperial',  country: 'uk',  name: 'Imperial College London', tuitionUSD: 40000, quality: 10, requiresIELTS: 7.0, requiresGPA: 3.6, reqTrack: ['alevels','ib'] },
  { id: 'ucl',       country: 'uk',  name: 'University College London', tuitionUSD: 35000, quality: 9, requiresIELTS: 6.5, requiresGPA: 3.4, reqTrack: 'any' },
  { id: 'lse',       country: 'uk',  name: 'London School of Economics', tuitionUSD: 35000, quality: 9, requiresIELTS: 7.0, requiresGPA: 3.6, reqTrack: 'any' },
  { id: 'harvard',   country: 'usa', name: 'Harvard University',      tuitionUSD: 60000, quality: 10, requiresTOEFL: 100, requiresGPA: 3.9, reqTrack: 'any' },
  { id: 'mit',       country: 'usa', name: 'MIT',                     tuitionUSD: 62000, quality: 10, requiresTOEFL: 100, requiresGPA: 3.9, reqTrack: 'any' },
  { id: 'stanford',  country: 'usa', name: 'Stanford University',     tuitionUSD: 62000, quality: 10, requiresTOEFL: 100, requiresGPA: 3.9, reqTrack: 'any' },
  { id: 'berkeley',  country: 'usa', name: 'UC Berkeley',             tuitionUSD: 48000, quality: 9,  requiresTOEFL: 90,  requiresGPA: 3.6, reqTrack: 'any' },
  { id: 'tum',       country: 'deu', name: 'Technical University of Munich', tuitionUSD: 500, quality: 10, requiresGerman: 4, requiresGPA: 3.2, reqTrack: 'any' },
  { id: 'hu_berlin', country: 'deu', name: 'Humboldt University of Berlin',  tuitionUSD: 500, quality: 9,  requiresGerman: 4, requiresGPA: 3.0, reqTrack: 'any' },
  { id: 'sorbonne',  country: 'fra', name: 'Sorbonne University',     tuitionUSD: 3500,  quality: 9,  requiresFrench: 4, requiresGPA: 3.2, reqTrack: 'any' },
  { id: 'bocconi',   country: 'ita', name: 'Bocconi University',      tuitionUSD: 16000, quality: 9,  requiresIELTS: 6.5, requiresGPA: 3.4, reqTrack: 'any' },
  { id: 'nus',       country: 'sgp', name: 'National University of Singapore', tuitionUSD: 25000, quality: 10, requiresIELTS: 6.5, requiresGPA: 3.7, reqTrack: 'any' },
  { id: 'toronto',   country: 'can', name: 'University of Toronto',   tuitionUSD: 45000, quality: 9,  requiresIELTS: 6.5, requiresGPA: 3.5, reqTrack: 'any' },
  { id: 'mcgill',    country: 'can', name: 'McGill University',       tuitionUSD: 38000, quality: 9,  requiresIELTS: 6.5, requiresGPA: 3.4, reqTrack: 'any' },
  { id: 'melbourne', country: 'aus', name: 'University of Melbourne', tuitionUSD: 35000, quality: 9,  requiresIELTS: 6.5, requiresGPA: 3.5, reqTrack: 'any' },
  { id: 'sydney',    country: 'aus', name: 'University of Sydney',    tuitionUSD: 33000, quality: 9,  requiresIELTS: 6.5, requiresGPA: 3.4, reqTrack: 'any' }
];

/* ---------- SCHOLARSHIPS ---------- */
const EDU_SCHOLARSHIPS = [
  { id: 'fulbright', name: 'Fulbright Foreign Student Program', country: 'usa', coverage: 'full', requiresGPA: 3.5, requiresIELTS: 7.0, acceptanceRate: 0.08, desc: 'Full tuition + stipend for US study. J-1 Visa (Must return home 2 yrs).' },
  { id: 'chevening', name: 'Chevening Scholarship (UK)',        country: 'uk',  coverage: 'full', requiresGPA: 3.5, requiresIELTS: 7.0, requiresWork: 2, acceptanceRate: 0.05, desc: 'UK government scholarship. Full funding. Must return home 2 yrs.' },
  { id: 'daad',      name: 'DAAD Scholarship (Germany)',        country: 'deu', coverage: 'full', requiresGPA: 3.3, requiresGerman: 3, acceptanceRate: 0.15, desc: 'German academic exchange. Full funding + Monthly Stipend.' },
  { id: 'erasmus',   name: 'Erasmus Mundus (EU)',               country: 'eu',  coverage: 'full', requiresGPA: 3.5, requiresIELTS: 7.0, acceptanceRate: 0.10, desc: 'EU multi-country master program. Very prestigious.' },
  { id: 'mext',      name: 'MEXT (Japan)',                      country: 'jpn', coverage: 'full', requiresGPA: 3.5, acceptanceRate: 0.12, desc: 'Japanese government scholarship. Includes 1 yr language prep.' },
  { id: 'gates',     name: 'Gates Cambridge (UK)',              country: 'uk',  coverage: 'full', requiresGPA: 3.8, acceptanceRate: 0.02, desc: 'Full Cambridge funding. Extremely selective.' },
  { id: 'rhodes',    name: 'Rhodes Scholarship (Oxford)',       country: 'uk',  coverage: 'full', requiresGPA: 3.8, requiresLeadership: true, acceptanceRate: 0.03, desc: 'Oxford full scholarship with leadership focus.' },
  { id: 'eiffel',    name: 'Eiffel Excellence (France)',        country: 'fra', coverage: 'full', requiresGPA: 3.5, requiresFrench: 3, acceptanceRate: 0.10, desc: 'French Gov scholarship for Masters/PhD.' },
  { id: 'vanier',    name: 'Vanier Canada Graduate',            country: 'can', coverage: 'full', requiresGPA: 3.5, acceptanceRate: 0.10, desc: 'Canadian doctoral scholarship.' },
  { id: 'sawiris',   name: 'Sawiris Foundation Scholarship',    country: 'egy', coverage: 'full', requiresGPA: 3.7, reqUni: 'auc', acceptanceRate: 0.05, desc: 'Full ride to AUC/UChicago for outstanding Egyptian students.' }
];

/* ---------- UNIVERSITY ACTIVITIES ---------- */
const EDU_ACTIVITIES = [
  { id: 'student_union',label: 'Student Union',            monthlyEGP: 0,    social: 8, smarts: 2, happiness: 4, leadership: true, cvBoost: true },
  { id: 'debate',       label: 'Debate Team',              monthlyEGP: 300,  social: 5, smarts: 6, happiness: 3, cvBoost: true },
  { id: 'model_un',     label: 'Model UN (MUN)',           monthlyEGP: 500,  social: 7, smarts: 5, happiness: 4, cvBoost: true },
  { id: 'enactus',      label: 'Enactus (Entrepreneurship)',monthlyEGP: 200, social: 6, smarts: 6, happiness: 4, cvBoost: true, leadership: true },
  { id: 'sports_team',  label: 'University Sports Team',   monthlyEGP: 400,  social: 6, health: 6, happiness: 5 },
  { id: 'music_band',   label: 'Music Band',               monthlyEGP: 600,  social: 5, happiness: 6 },
  { id: 'theater',      label: 'Theater Club',             monthlyEGP: 400,  social: 6, happiness: 5 },
  { id: 'student_paper',label: 'Student Newspaper',        monthlyEGP: 200,  social: 4, smarts: 5, happiness: 2 },
  { id: 'coding_club',  label: 'Coding / GDSC Club',       monthlyEGP: 200,  social: 4, smarts: 7, happiness: 2, cvBoost: true },
  { id: 'robotics',     label: 'Robotics Team',            monthlyEGP: 600,  social: 4, smarts: 8, happiness: 3, cvBoost: true },
  { id: 'photography',  label: 'Photography Club',         monthlyEGP: 300,  social: 4, happiness: 4 },
  { id: 'volunteering', label: 'Resala / Volunteering',    monthlyEGP: 100,  social: 5, happiness: 5, cvBoost: true },
  { id: 'chess',        label: 'Chess Club',               monthlyEGP: 100,  smarts: 4, social: 2, happiness: 2 },
  { id: 'language_club',label: 'Language Exchange Club',   monthlyEGP: 300,  smarts: 4, social: 5, happiness: 3 }
];

/* ---------- SCHOOL EVENTS (age 6-17) ---------- */
const EDU_SCHOOL_EVENTS = [
  { id: 'first_day',       minAge: 6,  maxAge: 7,  weight: 6, title: 'First Day of School',      text: 'A big day. You meet your teacher and classmates.' },
  { id: 'best_friend',     minAge: 7,  maxAge: 10, weight: 8, title: 'Made a Best Friend',       text: 'You and a classmate become inseparable.' },
  { id: 'bully',           minAge: 8,  maxAge: 14, weight: 5, title: 'Bullied at School',        text: 'Older kids are picking on you.',                choice: true },
  { id: 'class_president', minAge: 10, maxAge: 14, weight: 4, title: 'Class President Election', text: 'You could run for class president.',            choice: true },
  { id: 'talent_show',     minAge: 10, maxAge: 16, weight: 5, title: 'School Talent Show',       text: 'The talent show is coming up.',                 choice: true },
  { id: 'exam_stress',     minAge: 15, maxAge: 17, weight: 8, title: 'Thanaweya Nightmares',     text: 'Exams are approaching. The pressure from family is crushing.' },
  { id: 'first_crush',     minAge: 12, maxAge: 15, weight: 6, title: 'First Crush',              text: 'You have a crush on a classmate. Butterflies.' },
  { id: 'cheating_caught', minAge: 12, maxAge: 16, weight: 3, title: 'Caught Cheating',          text: 'A teacher caught you cheating on a midterm.',   choice: true },
  { id: 'sports_day',      minAge: 8,  maxAge: 15, weight: 6, title: 'Sports Day',               text: 'Annual sports competition. Team spirit!' },
  { id: 'school_trip',     minAge: 9,  maxAge: 16, weight: 6, title: 'School Trip to Pyramids',  text: 'A chaotic bus trip with your class.' },
  { id: 'honor_roll',      minAge: 10, maxAge: 17, weight: 5, title: 'Top of the Class',         text: 'You made the honor roll this term. Parents are proud.' },
  { id: 'failing_class',   minAge: 12, maxAge: 17, weight: 4, title: 'Failing Math',             text: 'You are failing. Parents threaten to take your phone.', choice: true },
  { id: 'teacher_conflict',minAge: 12, maxAge: 17, weight: 4, title: 'Conflict with Teacher',    text: 'A teacher is targeting you unfairly.',          choice: true },
  { id: 'skip_school',     minAge: 14, maxAge: 17, weight: 5, title: 'Skipping School (Zowagh)', text: 'Friends want to skip school and go to the mall.', choice: true }
];

/* ---------- UNIVERSITY EVENTS (age 18-22) ---------- */
const EDU_UNIVERSITY_EVENTS = [
  { id: 'first_week',      minAge: 18, maxAge: 18, weight: 6,  title: 'Freshman Orientation',    text: 'You are nervous and excited. Campus is huge.' },
  { id: 'midterm_fail',    minAge: 18, maxAge: 22, weight: 5,  title: 'Bombed a Midterm',        text: 'A midterm went disastrously. You need to recover.',       choice: true },
  { id: 'gpa_warning',     minAge: 18, maxAge: 22, weight: 5,  title: 'Academic Probation Warning',text: 'Your GPA dropped below 2.0.',                   choice: true },
  { id: 'uni_love',        minAge: 18, maxAge: 22, weight: 6,  title: 'Campus Romance',          text: 'You met someone special in your lecture hall.' },
  { id: 'hackathon_win',   minAge: 19, maxAge: 22, weight: 3,  title: 'Competition Winner',      text: 'Your team won a major university competition. CV Boost!' },
  { id: 'party_offer',     minAge: 18, maxAge: 22, weight: 8,  title: 'Big Weekend Outing',      text: 'Friends are going to North Coast/Sokhna. Study or go?',   choice: true },
  { id: 'internship_off',  minAge: 20, maxAge: 22, weight: 6,  title: 'Internship Offer',        text: 'A top company wants to hire you as a summer intern.',     choice: true },
  { id: 'professor_mentor',minAge: 19, maxAge: 22, weight: 4,  title: 'Teaching Assistant Offer',text: 'A professor wants you to be a TA for a junior class.',    choice: true },
  { id: 'thesis_crisis',   minAge: 21, maxAge: 22, weight: 5,  title: 'Graduation Project Crisis',text: 'Your team is falling apart right before the deadline.',  choice: true },
  { id: 'job_fair',        minAge: 21, maxAge: 22, weight: 7,  title: 'Employment Fair',         text: 'Big job fair on campus. Time to hand out CVs.' },
  { id: 'change_major',    minAge: 18, maxAge: 20, weight: 4,  title: 'Doubt About Major',       text: 'You hate what you are studying. Want to switch?',         choice: true },
  { id: 'work_and_travel', minAge: 19, maxAge: 21, weight: 3,  title: 'Work & Travel USA',       text: 'Opportunity to spend summer working in the US (J1 Visa).',choice: true }
];

/* ---------- INTERNSHIPS (during uni) ---------- */
const EDU_INTERNSHIPS = [
  { id: 'cib_intern',      label: 'CIB Summer Internship',       company: 'CIB',             paid: true,  monthlyEGP: 7000, months: 3, requiresMajor: ['business', 'economics', 'commerce'] },
  { id: 'ms_intern',       label: 'Microsoft Egypt Intern',      company: 'Microsoft',       paid: true,  monthlyEGP: 12000, months: 3, requiresMajor: ['cs', 'it', 'engineering'] },
  { id: 'pwc_intern',      label: 'PwC Audit Intern',            company: 'PwC',             paid: true,  monthlyEGP: 8000, months: 3, requiresMajor: ['business', 'commerce'] },
  { id: 'vodafone_intern', label: 'Vodafone Marketing Intern',   company: 'Vodafone',        paid: true,  monthlyEGP: 6000, months: 3, requiresMajor: ['business', 'mass_comm'] },
  { id: 'eva_intern',      label: 'Eva Pharma R&D Intern',       company: 'Eva Pharma',      paid: true,  monthlyEGP: 5000, months: 3, requiresMajor: ['pharmacy', 'medicine', 'vet'] },
  { id: 'oracle_intern',   label: 'Oracle Software Intern',      company: 'Oracle Egypt',    paid: true,  monthlyEGP: 10000, months: 3, requiresMajor: ['cs', 'it'] },
  { id: 'un_intern',       label: 'UN Agencies Intern (Cairo)',  company: 'United Nations',  paid: true,  monthlyEGP: 15000, months: 6, requiresMajor: ['economics', 'law', 'arts'] },
  { id: 'mcit_intern',     label: 'MCIT NTI Training',           company: 'Gov MCIT',        paid: true,  monthlyEGP: 3000, months: 3, requiresMajor: ['cs', 'engineering', 'it'] },
  { id: 'unpaid_ngo',      label: 'NGO Volunteer Internship',    company: 'Various NGOs',    paid: false, monthlyEGP: 0,    months: 2, requiresMajor: [] },
  { id: 'law_firm',        label: 'Matouk Bassiouny Law Clerk',  company: 'Law Firm',        paid: true,  monthlyEGP: 5000, months: 3, requiresMajor: ['law'] },
  { id: 'hospital_imtyaz', label: 'Imtyaz (Medical Internship)', company: 'Public Hospital', paid: true,  monthlyEGP: 3500, months: 12, requiresMajor: ['medicine', 'dentistry', 'nursing', 'physical_therapy', 'pharmacy'] } // Mandatory for medical fields
];

/* ============================================================
   END OF EDUCATION DATA
   ============================================================ */
