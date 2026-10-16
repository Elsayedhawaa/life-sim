/* =====================================================================
   72. FACULTY → CAREER CONNECTION (Full Career Ladders)
   - Track-aware university UI (Adabi / Elmi Riyada / Elmi Olom)
   - Real Egyptian career ladders: Intern → Junior → Senior → Manager → Director
   - Salary progression based on researched 2026 Egyptian market data
   - Every Egyptian faculty has its own ladder
   - Faculties show appropriate jobs in Career tab
   - Language courses: 3-month cooldown (not yearly)
   Load AFTER 71-education-life-events.js and BEFORE 99-boot.js
   ===================================================================== */

function p72Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p72Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p72EGP(egp) { return Math.round(egp * p72Idx()); }

/* =================================================================
   1. STATE
   ================================================================= */
function p72Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p72) o.p72 = {};
  const d = o.p72;
  if (typeof d.degreeExtra !== 'string') d.degreeExtra = null;
  if (!d.langCooldown || typeof d.langCooldown !== 'object') d.langCooldown = {};
  if (!d.careerTrack) d.careerTrack = null;
  if (typeof d.careerLevel !== 'number') d.careerLevel = 0;
  if (typeof d.careerYearsInLevel !== 'number') d.careerYearsInLevel = 0;
}
const P72_migrate = migrate;
migrate = function (o) { const r = P72_migrate(o); p72Init(r); return r; };
const P72_newGame = newGame;
newGame = function () { P72_newGame.apply(this, arguments); p72Init(S); };

/* =================================================================
   2. TRACK → FACULTY ELIGIBILITY
   ================================================================= */
const P72_TRACK_FACULTIES = {
  'adabi': ['Law', 'Business', 'Economics', 'Arts', 'Education', 'Mass Comm', 'Media', 'Humanities', 'Languages', 'Social Work', 'Tourism & Hotels', 'Management'],
  'elmi-riyada': ['Engineering', 'Computer Science', 'Computers & IT', 'Science', 'Pharmacy', 'Pharmacy & Biotech', 'Business', 'Economics', 'Management', 'Applied Sciences & Arts', 'Fisheries', 'Logistics', 'Physical Therapy'],
  'elmi-olom': ['Medicine', 'Dentistry', 'Pharmacy', 'Pharmacy & Biotech', 'Physical Therapy', 'Nursing', 'Veterinary', 'Science', 'Agriculture', 'Biotechnology', 'Sciences', 'Applied Sciences & Arts']
};

function p72CanFacultyWithTrack(faculty, track) {
  if (!track) return true;
  const allowed = P72_TRACK_FACULTIES[track] || [];
  return allowed.indexOf(faculty) !== -1;
}
function p72TrackLabel(track) {
  return { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[track] || 'Not chosen';
}
function p72GetTrack() { return (S && S.p68 && S.p68.thanaweyaTrack) || null; }

/* =================================================================
   3. FACULTY → BASE DEGREE MAPPING
   ================================================================= */
const P72_FACULTY_TO_DEGREE = {
  'Medicine': 'medicine', 'Dentistry': 'medicine', 'Nursing': 'medicine', 'Physical Therapy': 'medicine',
  'Veterinary': 'biology', 'Pharmacy': 'biology', 'Pharmacy & Biotech': 'biology', 'Biotechnology': 'biology',
  'Agriculture': 'biology', 'Science': 'biology', 'Sciences': 'biology', 'Fisheries': 'biology',
  'Engineering': 'cs', 'Computer Science': 'cs', 'Computers & IT': 'cs', 'Applied Sciences & Arts': 'cs',
  'Logistics': 'business', 'Business': 'business', 'Economics': 'business', 'Management': 'business',
  'Law': 'law', 'Arts': 'business', 'Education': 'business', 'Humanities': 'business',
  'Mass Comm': 'business', 'Media': 'business', 'Languages': 'business', 'Social Work': 'business',
  'Tourism & Hotels': 'business'
};

/* Assign faculty degree on graduation */
function p72AssignFacultyDegree(faculty) {
  p72Init(S);
  const base = P72_FACULTY_TO_DEGREE[faculty] || 'business';
  S.degree = base;
  S.p72.degreeExtra = faculty;
  return base;
}
window.p72AssignFacultyDegree = p72AssignFacultyDegree;

/* Hook into uniYear graduation */
const P72_uniYearBefore = uniYear;
uniYear = function (notes, bill) {
  const u = S && S.uni;
  const facultyBefore = u && (u.faculty || null);
  const yearsTotal = u && (u.yearsTotal || 4);
  const yearBefore = u && (u.year || 0);

  const result = P72_uniYearBefore.apply(this, arguments);

  if (!S.uni && facultyBefore && (yearBefore + 1) >= yearsTotal) {
    p72AssignFacultyDegree(facultyBefore);
    log('🎓 Degree recorded: ' + facultyBefore + ' → ' + S.degree + ' (extra: ' + facultyBefore + ')');
    realismNotice('Degree recorded', 'You graduated with a ' + facultyBefore + ' degree. Career options tailored to this field are now open in the Career tab.');
  }
  return result;
};

/* =================================================================
   4. COMPLETE CAREER LADDERS
   Each ladder has 5-6 levels: Intern → Junior → Mid → Senior → Lead → Director
   Salaries in 2026 EGP per year (research-backed)
   ================================================================= */
const P72_CAREER_LADDERS = {

  /* ============ ENGINEERING ============ */
  'Engineering': {
    track: 'tech',
    levels: [
      { title: 'Junior Site Engineer',       minExp: 0, salary: 96000,  reqSmarts: 40, reqEng: 25 },
      { title: 'Site Engineer',              minExp: 2, salary: 144000, reqSmarts: 50, reqEng: 30 },
      { title: 'Senior Site Engineer',       minExp: 5, salary: 210000, reqSmarts: 60, reqEng: 40 },
      { title: 'Construction Manager',       minExp: 8, salary: 300000, reqSmarts: 70, reqEng: 50 },
      { title: 'Project Manager',            minExp: 12, salary: 420000, reqSmarts: 78, reqEng: 60 },
      { title: 'Project Director / Engineering Head', minExp: 15, salary: 600000, reqSmarts: 85, reqEng: 70 }
    ],
    companies: ['Orascom Construction', 'Hassan Allam Holding', 'Enppi Engineering', 'Petrojet', 'Dar Al-Handasah', 'Elsewedy Electric', 'Rowad Modern Engineering', 'Misr Italia Properties']
  },

  /* ============ PHARMACY ============ */
  'Pharmacy': {
    track: 'bio',
    levels: [
      { title: 'Pharmacy Intern',                 minExp: 0, salary: 72000,  reqSmarts: 35, reqEng: 25 },
      { title: 'Community Pharmacist',            minExp: 1, salary: 120000, reqSmarts: 45, reqEng: 30 },
      { title: 'Hospital Pharmacist',             minExp: 3, salary: 168000, reqSmarts: 55, reqEng: 40 },
      { title: 'Pharmaceutical QA/QC Officer',    minExp: 5, salary: 216000, reqSmarts: 65, reqEng: 45 },
      { title: 'Pharmacy Branch Manager',         minExp: 7, salary: 300000, reqSmarts: 75, reqEng: 55 },
      { title: 'Pharmaceutical R&D Director',     minExp: 12, salary: 480000, reqSmarts: 85, reqEng: 65 }
    ],
    companies: ['Eva Pharma', 'Ibnsina Pharma', 'El Ezaby Pharmacies', 'Cleopatra Healthcare', 'Pfizer Egypt', 'GSK Egypt', 'Hikma Pharmaceuticals', 'Minapharm']
  },

  /* ============ MEDICINE ============ */
  'Medicine': {
    track: 'medical',
    levels: [
      { title: 'Medical Intern',           minExp: 0, salary: 60000,  reqSmarts: 50, reqEng: 30 },
      { title: 'Resident Doctor',           minExp: 3, salary: 144000, reqSmarts: 65, reqEng: 35 },
      { title: 'Specialist Physician',      minExp: 7, salary: 260000, reqSmarts: 75, reqEng: 40 },
      { title: 'Consultant Physician',      minExp: 12, salary: 420000, reqSmarts: 85, reqEng: 50 },
      { title: 'Department Head / Chief',   minExp: 17, salary: 650000, reqSmarts: 90, reqEng: 55 }
    ],
    companies: ['Cleopatra Healthcare Network', 'NileCare Medical Network', 'Mediterranean Medical Group', 'Cairo University Hospitals', 'Ain Shams Specialized Hospital', 'Dar Al Fouad Hospital']
  },

  /* ============ DENTISTRY ============ */
  'Dentistry': {
    track: 'medical',
    levels: [
      { title: 'Dental Intern',                  minExp: 0, salary: 72000,  reqSmarts: 50, reqEng: 30 },
      { title: 'Associate Dentist',              minExp: 2, salary: 156000, reqSmarts: 60, reqEng: 35 },
      { title: 'Senior Dentist',                 minExp: 5, salary: 240000, reqSmarts: 70, reqEng: 40 },
      { title: 'Specialist (Ortho / Implant)',   minExp: 9, salary: 360000, reqSmarts: 80, reqEng: 45 },
      { title: 'Clinic Owner / Practice Partner', minExp: 12, salary: 600000, reqSmarts: 85, reqEng: 50 }
    ],
    companies: ['Smile Dental Clinics', 'Cairo Dental Group', 'Alexandria Dental Center', 'Cleopatra Healthcare Network', 'Mediterranean Medical Group', 'Private Practice']
  },

  /* ============ NURSING ============ */
  'Nursing': {
    track: 'medical',
    levels: [
      { title: 'Staff Nurse',                  minExp: 0, salary: 84000,  reqSmarts: 35, reqEng: 25 },
      { title: 'Senior Nurse',                 minExp: 3, salary: 132000, reqSmarts: 45, reqEng: 30 },
      { title: 'Head Nurse',                   minExp: 6, salary: 192000, reqSmarts: 55, reqEng: 35 },
      { title: 'Nursing Supervisor',           minExp: 10, salary: 264000, reqSmarts: 65, reqEng: 40 },
      { title: 'Director of Nursing',          minExp: 15, salary: 396000, reqSmarts: 75, reqEng: 50 }
    ],
    companies: ['Cleopatra Healthcare Network', 'NileCare Medical Network', 'Cairo University Hospitals', 'Al-Salam International Hospital', 'Dar Al Fouad Hospital']
  },

  /* ============ ACCOUNTING / FINANCE ============ */
  'Business': {
    track: 'finance',
    levels: [
      { title: 'Junior Accountant',            minExp: 0, salary: 84000,  reqSmarts: 35, reqEng: 25 },
      { title: 'Accountant',                   minExp: 2, salary: 132000, reqSmarts: 45, reqEng: 30 },
      { title: 'Senior Accountant',            minExp: 5, salary: 210000, reqSmarts: 55, reqEng: 40 },
      { title: 'Accounting Manager / Financial Controller', minExp: 8, salary: 324000, reqSmarts: 68, reqEng: 50 },
      { title: 'Finance Director',             minExp: 12, salary: 480000, reqSmarts: 78, reqEng: 60 },
      { title: 'Chief Financial Officer (CFO)', minExp: 15, salary: 720000, reqSmarts: 85, reqEng: 65 }
    ],
    companies: ['Alexandria Commercial Bank', 'Commercial International Bank', 'Delta Audit & Tax', 'PwC Egypt', 'Deloitte Egypt', 'KPMG Egypt', 'FirstGate Capital', 'Cairo Growth Partners']
  },

  /* ============ ECONOMICS ============ */
  'Economics': {
    track: 'finance',
    levels: [
      { title: 'Economic Research Assistant',   minExp: 0, salary: 96000,  reqSmarts: 45, reqEng: 40 },
      { title: 'Economic Analyst',              minExp: 2, salary: 156000, reqSmarts: 55, reqEng: 50 },
      { title: 'Senior Economic Analyst',       minExp: 5, salary: 240000, reqSmarts: 65, reqEng: 55 },
      { title: 'Senior Policy Researcher',       minExp: 8, salary: 324000, reqSmarts: 75, reqEng: 60 },
      { title: 'Chief Economist / Policy Director', minExp: 12, salary: 480000, reqSmarts: 85, reqEng: 65 }
    ],
    companies: ['Central Bank of Egypt', 'Ministry of Finance', 'Egyptian Center for Economic Studies', 'FirstGate Capital', 'Cairo Growth Partners', 'World Bank Egypt Office']
  },

  /* ============ COMPUTER SCIENCE ============ */
  'Computer Science': {
    track: 'tech',
    levels: [
      { title: 'Junior Developer / IT Support',  minExp: 0, salary: 96000,  reqSmarts: 45, reqEng: 40 },
      { title: 'Software Engineer',              minExp: 2, salary: 180000, reqSmarts: 58, reqEng: 50 },
      { title: 'Senior Software Engineer',       minExp: 5, salary: 336000, reqSmarts: 70, reqEng: 60 },
      { title: 'Tech Lead / Engineering Manager', minExp: 8, salary: 480000, reqSmarts: 78, reqEng: 65 },
      { title: 'VP of Engineering / CTO',        minExp: 12, salary: 720000, reqSmarts: 85, reqEng: 75 }
    ],
    companies: ['Pyramid Digital Solutions', 'Nile Data Systems', 'Delta Software Services', 'Alexandria Analytics Lab', 'Vodafone Egypt', 'Microsoft Egypt', 'Google Egypt', 'Fawry Digital Services']
  },

  /* ============ LAW ============ */
  'Law': {
    track: 'law',
    levels: [
      { title: 'Legal Intern / Paralegal',       minExp: 0, salary: 72000,  reqSmarts: 45, reqEng: 35 },
      { title: 'Junior Legal Associate',         minExp: 2, salary: 132000, reqSmarts: 55, reqEng: 40 },
      { title: 'Senior Associate',               minExp: 6, salary: 264000, reqSmarts: 68, reqEng: 50 },
      { title: 'Counsel / Legal Manager',        minExp: 10, salary: 420000, reqSmarts: 78, reqEng: 60 },
      { title: 'Partner',                        minExp: 15, salary: 720000, reqSmarts: 85, reqEng: 65 }
    ],
    companies: ['Sphinx Legal Partners', 'Sharkawy & Sarhan', 'NileBridge Corporate Counsel', 'Delta Contracts & Compliance', 'Cairo Commercial Law Group', 'Nile Employment Law Services', 'Al-Ahram Legal Group']
  },

  /* ============ MASS COMM / MEDIA ============ */
  'Mass Comm': {
    track: 'entry',
    levels: [
      { title: 'Journalism Intern',              minExp: 0, salary: 72000,  reqSmarts: 40, reqEng: 40 },
      { title: 'Reporter / Content Writer',      minExp: 1, salary: 120000, reqSmarts: 50, reqEng: 45 },
      { title: 'Senior Reporter / Editor',       minExp: 4, salary: 192000, reqSmarts: 60, reqEng: 55 },
      { title: 'Managing Editor',                minExp: 8, salary: 300000, reqSmarts: 70, reqEng: 60 },
      { title: 'Editor-in-Chief / Media Director', minExp: 12, salary: 480000, reqSmarts: 80, reqEng: 70 }
    ],
    companies: ['Al-Ahram', 'Al-Masry Al-Youm', 'ON E', 'CBC Egypt', 'Daily News Egypt', 'Nile Media Group', 'Horus Publishing']
  },

  /* ============ ARTS / HUMANITIES ============ */
  'Arts': {
    track: 'entry',
    levels: [
      { title: 'Teacher / Junior Translator',    minExp: 0, salary: 84000,  reqSmarts: 40, reqEng: 45 },
      { title: 'Content Writer / Journalist',    minExp: 2, salary: 132000, reqSmarts: 50, reqEng: 50 },
      { title: 'Senior Translator / Editor',     minExp: 5, salary: 210000, reqSmarts: 60, reqEng: 60 },
      { title: 'Museum Curator / Content Lead',  minExp: 8, salary: 300000, reqSmarts: 70, reqEng: 65 },
      { title: 'Cultural Programs Director',     minExp: 12, salary: 420000, reqSmarts: 80, reqEng: 70 }
    ],
    companies: ['Modern English School', 'Cairo British School', 'Al-Ahram Translation', 'Egyptian Museum', 'Grand Egyptian Museum', 'Bibliotheca Alexandrina', 'Horus Publishing']
  },

  /* ============ EDUCATION ============ */
  'Education': {
    track: 'entry',
    levels: [
      { title: 'Assistant Teacher',              minExp: 0, salary: 60000,  reqSmarts: 35, reqEng: 30 },
      { title: 'Classroom Teacher',              minExp: 2, salary: 96000,  reqSmarts: 45, reqEng: 35 },
      { title: 'Senior Teacher / Head of Department', minExp: 6, salary: 168000, reqSmarts: 58, reqEng: 45 },
      { title: 'Assistant Principal',            minExp: 10, salary: 240000, reqSmarts: 68, reqEng: 55 },
      { title: 'School Principal / Education Director', minExp: 14, salary: 360000, reqSmarts: 78, reqEng: 60 }
    ],
    companies: ['Ministry of Education', 'Modern English School', 'Cairo British School', 'Alexandria International School', 'Nile Education Group']
  },

  /* ============ TOURISM & HOTELS ============ */
  'Tourism & Hotels': {
    track: 'entry',
    levels: [
      { title: 'Hotel Trainee / Tour Guide Assistant', minExp: 0, salary: 72000,  reqSmarts: 35, reqEng: 45 },
      { title: 'Tour Guide / Front Desk Agent',        minExp: 2, salary: 120000, reqSmarts: 45, reqEng: 55 },
      { title: 'Senior Tour Guide / F&B Supervisor',   minExp: 5, salary: 180000, reqSmarts: 55, reqEng: 60 },
      { title: 'Hotel Department Manager',             minExp: 8, salary: 264000, reqSmarts: 65, reqEng: 65 },
      { title: 'Hotel General Manager / Tourism Director', minExp: 14, salary: 480000, reqSmarts: 78, reqEng: 70 }
    ],
    companies: ['Travco Group', 'Four Seasons Cairo', 'Marriott Mena House', 'Ritz-Carlton Cairo', 'Abercrombie & Kent Egypt', 'Steigenberger Hotels']
  },

  /* ============ LOGISTICS ============ */
  'Logistics': {
    track: 'entry',
    levels: [
      { title: 'Logistics Coordinator',          minExp: 0, salary: 84000,  reqSmarts: 35, reqEng: 35 },
      { title: 'Supply Chain Analyst',           minExp: 2, salary: 144000, reqSmarts: 48, reqEng: 45 },
      { title: 'Senior Supply Chain Analyst',    minExp: 5, salary: 216000, reqSmarts: 58, reqEng: 55 },
      { title: 'Logistics Manager',              minExp: 8, salary: 312000, reqSmarts: 68, reqEng: 60 },
      { title: 'Supply Chain Director',          minExp: 12, salary: 480000, reqSmarts: 78, reqEng: 65 }
    ],
    companies: ['Meridian Supply Chain', 'Red Sea Logistics', 'Bosta Logistics', 'Aramex Egypt', 'DHL Egypt', 'Egyptian Post / Postal Services']
  },

  /* ============ SOCIAL WORK ============ */
  'Social Work': {
    track: 'entry',
    levels: [
      { title: 'Social Work Assistant',          minExp: 0, salary: 60000,  reqSmarts: 35, reqEng: 30 },
      { title: 'Social Worker / Family Counselor', minExp: 2, salary: 108000, reqSmarts: 45, reqEng: 40 },
      { title: 'Senior Social Worker',            minExp: 6, salary: 168000, reqSmarts: 58, reqEng: 50 },
      { title: 'Program Manager (NGO)',           minExp: 10, salary: 240000, reqSmarts: 68, reqEng: 55 },
      { title: 'Social Development Director',     minExp: 14, salary: 360000, reqSmarts: 78, reqEng: 60 }
    ],
    companies: ['Ministry of Social Solidarity', 'Save the Children Egypt', 'UNICEF Egypt', 'Caritas Egypt', 'Egyptian Red Crescent']
  },

  /* ============ LANGUAGES ============ */
  'Languages': {
    track: 'entry',
    levels: [
      { title: 'Language Instructor (Part-time)', minExp: 0, salary: 60000,  reqSmarts: 40, reqEng: 65 },
      { title: 'Language Instructor',            minExp: 1, salary: 108000, reqSmarts: 50, reqEng: 75 },
      { title: 'Senior Instructor / Curriculum Developer', minExp: 5, salary: 180000, reqSmarts: 60, reqEng: 80 },
      { title: 'Language Center Manager',        minExp: 8, salary: 264000, reqSmarts: 70, reqEng: 85 },
      { title: 'Education Program Director',     minExp: 12, salary: 420000, reqSmarts: 78, reqEng: 90 }
    ],
    companies: ['Berlitz Egypt', 'British Council', 'Institut Français', 'Goethe Institute', 'AMIDEAST Egypt', 'Al-Ahram Translation']
  }
};

/* =================================================================
   5. FACULTY → CAREER TRACK SELECTOR
   ================================================================= */
function p72GetLadderForFaculty(faculty) {
  if (!faculty) return null;
  /* Direct match */
  if (P72_CAREER_LADDERS[faculty]) return P72_CAREER_LADDERS[faculty];
  /* Sub-faculty fallbacks */
  const fallbacks = {
    'Pharmacy & Biotech': 'Pharmacy',
    'Computers & IT': 'Computer Science',
    'Applied Sciences & Arts': 'Computer Science',
    'Media': 'Mass Comm',
    'Humanities': 'Arts',
    'Management': 'Business',
    'Biotechnology': 'Pharmacy',
    'Sciences': 'Computer Science',
    'Veterinary': 'Medicine',
    'Agriculture': 'Pharmacy',
    'Fisheries': 'Pharmacy',
    'Physical Therapy': 'Medicine'
  };
  if (fallbacks[faculty]) return P72_CAREER_LADDERS[fallbacks[faculty]];
  return null;
}

/* =================================================================
   6. GET CURRENT CAREER LEVEL FOR PLAYER
   ================================================================= */
function p72CurrentCareerLevel() {
  if (!S || !S.p72 || !S.p72.degreeExtra) return 0;
  const ladder = p72GetLadderForFaculty(S.p72.degreeExtra);
  if (!ladder) return 0;
  const totalYears = (typeof allExperience === 'function') ? allExperience() : 0;
  /* Find highest level the player qualifies for */
  let level = 0;
  for (let i = 0; i < ladder.levels.length; i++) {
    if (totalYears >= ladder.levels[i].minExp && (S.smarts || 0) >= ladder.levels[i].reqSmarts) {
      level = i;
    } else break;
  }
  return level;
}
window.p72CurrentCareerLevel = p72CurrentCareerLevel;

/* =================================================================
   7. ADD FACULTY JOBS TO CAREER BOARD (pinned at top)
   ================================================================= */
const P72_companyListBefore = companyListFor;
companyListFor = function (country) {
  country = country || (S && S.country) || 'egy';
  let list = P72_companyListBefore(country);
  if (!S) return list;
  if (country !== 'egy') return list;

  const faculty = (S.p72 && S.p72.degreeExtra) || (S.uni && S.uni.faculty) || null;
  if (!faculty) return list;
  const ladder = p72GetLadderForFaculty(faculty);
  if (!ladder || !ladder.levels) return list;

  const year = gameYear();
  const rate = p72Rate();
  const totalYears = (typeof allExperience === 'function') ? allExperience() : 0;

  const extra = ladder.levels.map(function (lvl, i) {
    /* Can the player apply for this level? */
    const canApply = totalYears >= lvl.minExp && (S.smarts || 0) >= lvl.reqSmarts;
    const company = ladder.companies[i % ladder.companies.length];
    const salaryEGP = p72EGP(lvl.salary);
    const salaryInternal = salaryEGP / rate;
    return {
      id: 'p72_' + faculty.replace(/\W/g, '') + '_lvl' + i + '_' + year,
      trackId: ladder.track,
      name: company,
      title: lvl.title,
      desc: faculty + ' career ladder — Level ' + (i + 1) + ' of ' + ladder.levels.length +
        '. Requires ' + lvl.minExp + '+ years experience, ' + lvl.reqSmarts + '% smarts.',
      factor: 1,
      smarts: lvl.reqSmarts,
      eng: lvl.reqEng,
      minExp: lvl.minExp,
      medical: /Medicine|Pharmacy|Dentistry|Nursing/.test(faculty),
      social: true,
      bonus: 0.03,
      leave: 21,
      remote: 'On-site',
      hours: 42,
      stress: 4,
      contract: 'Permanent',
      sponsorship: false,
      isFacultyJob: true,
      forFaculty: faculty,
      levelInLadder: i,
      baseSalaryInternal: salaryInternal,
      canApply: canApply
    };
  });

  /* Filter to only show levels the player can apply for, plus the next one */
  const playerLevel = p72CurrentCareerLevel();
  const visible = extra.filter(function (j) {
    return j.levelInLadder <= playerLevel + 1;
  });

  /* Put faculty jobs first */
  const ids = new Set(list.map(function (x) { return x.id; }));
  const fresh = visible.filter(function (x) { return !ids.has(x.id); });
  return fresh.concat(list);
};

/* Eligibility check uses ladder level */
const P72_p12EligibilityBefore = (typeof p12Eligibility === 'function') ? p12Eligibility : null;
if (P72_p12EligibilityBefore) {
  p12Eligibility = function (post) {
    if (post && post.isFacultyJob) {
      const faculty = (S.p72 && S.p72.degreeExtra) || (S.uni && S.uni.faculty);
      if (faculty !== post.forFaculty) {
        const ladder = p72GetLadderForFaculty(faculty);
        if (!ladder) return 'Requires a ' + post.forFaculty + ' degree.';
      }
      const totalYears = (typeof allExperience === 'function') ? allExperience() : 0;
      const lvl = post.levelInLadder || 0;
      const reqExp = post.minExp || 0;
      const reqSmarts = post.smarts || 0;
      if (totalYears < reqExp) return 'Requires ' + reqExp + '+ years of experience. You have ' + totalYears + '.';
      if ((S.smarts || 0) < reqSmarts) return 'Requires ' + reqSmarts + '% Smarts. Yours: ' + (S.smarts || 0) + '%.';
      /* Also check: cannot skip levels */
      const playerLevel = p72CurrentCareerLevel();
      if (lvl > playerLevel + 1) {
        return 'You must progress through Level ' + (playerLevel + 1) + ' first.';
      }
    }
    return P72_p12EligibilityBefore.apply(this, arguments);
  };
}

/* =================================================================
   8. TRACK-AWARE UNIVERSITY SELECTION UI
   ================================================================= */
const P72_viewEgyptUniBefore = (typeof viewEgyptUniversitySelection === 'function') ? viewEgyptUniversitySelection : null;
if (P72_viewEgyptUniBefore) {
  viewEgyptUniversitySelection = function () {
    const track = p72GetTrack();
    const trackLabel = p72TrackLabel(track);
    const thanaweya = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || null;

    let html = '<section class="card" style="border-color:var(--amber)">' +
      '<h3>📊 Your Thanaweya Amma position</h3>';

    if (!track) {
      html += '<p class="muted" style="font-size:.82rem">Choose a Thanaweya Amma track first.</p>' +
        '<button class="btn" onclick="p68ChooseTrack(\'adabi\')">📖 Adabi (Literary)</button>' +
        '<button class="btn" onclick="p68ChooseTrack(\'elmi-riyada\')">🔬 Elmi Riyada (Science-Math)</button>' +
        '<button class="btn" onclick="p68ChooseTrack(\'elmi-olom\')">🧬 Elmi Olom (Science-Biology)</button>' +
        '</section>';
      return html;
    }

    html += '<div class="row"><span>Track</span><b>' + trackLabel + '</b></div>' +
      (thanaweya != null
        ? '<div class="row"><span>Your score</span><b class="mono" style="color:var(--cyan)">' + thanaweya.toFixed(1) + '%</b></div>'
        : '<p class="muted" style="font-size:.82rem;margin-top:6px">You will get your Thanaweya score at age 18. Until then, all faculties on your track are visible.</p>');

    html += '<h4 style="font-size:.85rem;margin-top:12px;color:var(--cyan)">Faculties open to your track</h4>';

    const cutoffs = Object.entries(P70_EGY_CUTOFFS || {}).sort(function (a, b) { return b[1] - a[1]; });
    const facultyNames = {
      'medicine': 'Medicine', 'dentistry': 'Dentistry', 'pharmacy': 'Pharmacy',
      'physical_therapy': 'Physical Therapy', 'engineering': 'Engineering',
      'computer_science': 'Computer Science', 'science': 'Science',
      'nursing': 'Nursing', 'business': 'Business', 'commerce': 'Commerce',
      'economics': 'Economics', 'law': 'Law', 'arts': 'Arts',
      'education': 'Education', 'mass_comm': 'Mass Comm',
      'agriculture': 'Agriculture', 'veterinary': 'Veterinary'
    };

    cutoffs.forEach(function (pair) {
      const key = pair[0], cutoff = pair[1];
      const name = facultyNames[key] || key;
      const allowed = p72CanFacultyWithTrack(name, track);
      const eligible = thanaweya != null && thanaweya >= cutoff;
      const color = thanaweya == null ? 'var(--muted)' : eligible ? 'var(--mint)' : 'var(--rose)';
      html += '<div class="row" style="padding:5px 0;font-size:.84rem;opacity:' + (allowed ? '1' : '.4') + '">' +
        '<span>' + (allowed ? '✓ ' : '✗ ') + name + '</span>' +
        '<span><b class="mono" style="color:' + color + '">' + cutoff + '%</b></span>' +
        '</div>';
    });

    html += '<p class="muted" style="font-size:.78rem;margin-top:10px">Only faculties marked ✓ are open to your ' + trackLabel + ' track.</p>' +
      '</section>';

    let base = P72_viewEgyptUniBefore.apply(this, arguments);
    return html + base;
  };
}

/* =================================================================
   9. LANGUAGE COOLDOWN — 3 months
   ================================================================= */
function p72CanTakeLang(lang) {
  p72Init(S);
  const absMonth = S.pacingAbsoluteMonth || 0;
  const cd = S.p72.langCooldown[lang] || { lastMonth: -100 };
  return (absMonth - (cd.lastMonth || -100)) >= 3;
}
function p72MarkLangTaken(lang) {
  p72Init(S);
  S.p72.langCooldown[lang] = { lastMonth: S.pacingAbsoluteMonth || 0 };
}

const P72_takeEngBefore = (typeof takeEng === 'function') ? takeEng : null;
if (P72_takeEngBefore) {
  takeEng = function (i) {
    if (!p72CanTakeLang('english')) return hint('You took an English course recently. Wait 3 months for the next one.');
    const r = P72_takeEngBefore.apply(this, arguments);
    p72MarkLangTaken('english');
    return r;
  };
}

const P72_takeIeltsBefore = (typeof takeIelts === 'function') ? takeIelts : null;
if (P72_takeIeltsBefore) {
  takeIelts = function () {
    if (!p72CanTakeLang('ielts')) return hint('IELTS exam last taken recently. Wait 3 months.');
    const r = P72_takeIeltsBefore.apply(this, arguments);
    p72MarkLangTaken('ielts');
    return r;
  };
}

/* Remove the "once per year" message */
const P72_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P72_viewSchoolBefore.apply(this, arguments);
  html = html.replace(/One language course per year\./g, '');
  html = html.replace(/One English course per year\./g, '');
  return html;
};

/* =================================================================
   10. FACULTY CAREER LADDER CARD (shown after graduation)
   ================================================================= */
function p72FacultyCareerCard() {
  const faculty = (S.p72 && S.p72.degreeExtra) || null;
  if (!faculty) return '';
  const ladder = p72GetLadderForFaculty(faculty);
  if (!ladder) return '';

  const playerLevel = p72CurrentCareerLevel();
  const totalYears = (typeof allExperience === 'function') ? allExperience() : 0;

  let html = '<section class="card" style="border-color:var(--mint)"><h3>💼 Your ' + faculty + ' career ladder</h3>' +
    '<p class="muted" style="font-size:.82rem">Every level requires more experience and skills. You cannot skip levels. Your current position: <b>Level ' + (playerLevel + 1) + ' of ' + ladder.levels.length + '</b> (' + totalYears + ' yrs experience).</p>';

  ladder.levels.forEach(function (lvl, i) {
    const isCurrent = i === playerLevel;
    const isPast = i < playerLevel;
    const isNext = i === playerLevel + 1;
    const canQualify = totalYears >= lvl.minExp && (S.smarts || 0) >= lvl.reqSmarts;
    const color = isPast ? 'var(--muted)' : isCurrent ? 'var(--mint)' : isNext ? 'var(--cyan)' : 'var(--line)';
    const badge = isPast ? '✓ Done' : isCurrent ? '▶ Current' : isNext ? '→ Next' : '🔒 Locked';
    const salaryEGP = p72EGP(lvl.salary);

    html += '<div style="margin-top:10px;padding:10px;border-left:3px solid ' + color + ';background:rgba(255,255,255,.02);border-radius:6px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
      '<div style="min-width:0;flex:1">' +
      '<b style="font-size:.9rem">Level ' + (i + 1) + ' — ' + lvl.title + '</b>' +
      '<div class="muted" style="font-size:.75rem;margin-top:3px">' +
      lvl.minExp + '+ yrs · ' + lvl.reqSmarts + '% Smarts · ' + lvl.reqEng + '% English' +
      '</div>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0">' +
      '<div class="mono" style="font-size:.82rem;font-weight:700">E£' + salaryEGP.toLocaleString() + '</div>' +
      '<div class="muted" style="font-size:.68rem">per year</div>' +
      '<div style="font-size:.7rem;color:' + color + ';margin-top:2px">' + badge + '</div>' +
      '</div></div></div>';
  });

  html += '<button class="btn" style="margin-top:10px;text-align:center" onclick="activeTab=\'career\';render()">Open Career tab to apply</button>' +
    '</section>';
  return html;
}

/* Add card to Education tab after graduation */
const P72_viewSchoolBefore2 = viewSchool;
viewSchool = function () {
  let html = P72_viewSchoolBefore2.apply(this, arguments);
  if (S.degree) {
    html += p72FacultyCareerCard();
  }
  return html;
};

/* =================================================================
   11. INIT
   ================================================================= */
p72Init(S);
console.log('[p72 v2] Full career ladders loaded — ' + Object.keys(P72_CAREER_LADDERS).length + ' faculties');
