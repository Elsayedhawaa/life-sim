/* =====================================================================
   69. EDUCATION + CAREER CORE  (Phase 3.3a)
   Consolidates: 69-study-abroad-system.js + 72-faculty-career-connection.js
   Load AFTER 68-core-fixes.js and BEFORE 70-core-education.js
   ===================================================================== */

(function p69Core() {
  'use strict';

  /* =================================================================
     STATE
     ================================================================= */
  function p69Init(o) {
    o = o || S;
    if (!o) return;
    if (!o.p69) o.p69 = {};
    const d = o.p69;
    if (!d.thanaweya) d.thanaweya = { score: null, track: null, year: null };
    if (!Array.isArray(d.applications)) d.applications = [];
    if (!d.enrolled) d.enrolled = null;
    if (!d.languageCooldowns || typeof d.languageCooldowns !== 'object') d.languageCooldowns = {};
    if (!d.abroadTarget) d.abroadTarget = null;
    if (!d.abroadLevel) d.abroadLevel = 'master';

    if (!o.p72) o.p72 = {};
    if (typeof o.p72.degreeExtra !== 'string') o.p72.degreeExtra = null;
    if (!o.p72.langCooldown || typeof o.p72.langCooldown !== 'object') o.p72.langCooldown = {};
  }
  const _migrate = migrate;
  migrate = function (o) { const r = _migrate(o); p69Init(r); return r; };
  const _newGame = newGame;
  newGame = function () { _newGame.apply(this, arguments); p69Init(S); };

  /* =================================================================
     UNIVERSITY CATALOG (study abroad)
     ================================================================= */
  const P69_UNIS = {
    gbr: [
      { n:'University of Oxford', tier:1, tu:45000, gpaMin:3.7, ielts:7.5 },
      { n:'University of Cambridge', tier:1, tu:45000, gpaMin:3.7, ielts:7.5 },
      { n:'Imperial College London', tier:1, tu:42000, gpaMin:3.5, ielts:7.0 },
      { n:'University College London', tier:1, tu:38000, gpaMin:3.4, ielts:7.0 },
      { n:'London School of Economics', tier:1, tu:40000, gpaMin:3.5, ielts:7.0 },
      { n:'University of Edinburgh', tier:2, tu:32000, gpaMin:3.2, ielts:6.5 },
      { n:"King's College London", tier:2, tu:34000, gpaMin:3.2, ielts:6.5 },
      { n:'University of Manchester', tier:2, tu:28000, gpaMin:3.0, ielts:6.5 },
      { n:'University of Warwick', tier:2, tu:30000, gpaMin:3.1, ielts:6.5 },
      { n:'University of Bristol', tier:2, tu:29000, gpaMin:3.0, ielts:6.5 }
    ],
    usa: [
      { n:'Massachusetts Institute of Technology', tier:1, tu:55000, gpaMin:3.8, ielts:7.5 },
      { n:'Harvard University', tier:1, tu:55000, gpaMin:3.8, ielts:7.5 },
      { n:'Stanford University', tier:1, tu:55000, gpaMin:3.8, ielts:7.5 },
      { n:'Yale University', tier:1, tu:52000, gpaMin:3.7, ielts:7.0 },
      { n:'Princeton University', tier:1, tu:52000, gpaMin:3.7, ielts:7.0 },
      { n:'University of California Berkeley', tier:1, tu:44000, gpaMin:3.5, ielts:7.0 },
      { n:'University of Chicago', tier:1, tu:52000, gpaMin:3.6, ielts:7.0 },
      { n:'Columbia University', tier:1, tu:55000, gpaMin:3.6, ielts:7.0 },
      { n:'University of California Los Angeles', tier:2, tu:42000, gpaMin:3.4, ielts:7.0 },
      { n:'New York University', tier:2, tu:50000, gpaMin:3.3, ielts:7.0 }
    ],
    deu: [
      { n:'Technical University of Munich', tier:1, tu:0, gpaMin:3.5, ielts:6.5 },
      { n:'Ludwig Maximilian University Munich', tier:1, tu:0, gpaMin:3.4, ielts:6.5 },
      { n:'Heidelberg University', tier:1, tu:0, gpaMin:3.4, ielts:6.5 },
      { n:'RWTH Aachen University', tier:1, tu:0, gpaMin:3.3, ielts:6.5 },
      { n:'Free University of Berlin', tier:2, tu:0, gpaMin:3.0, ielts:6.0 },
      { n:'Humboldt University of Berlin', tier:2, tu:0, gpaMin:3.0, ielts:6.0 }
    ],
    fra: [
      { n:'Sorbonne University', tier:1, tu:3000, gpaMin:3.4, ielts:6.5 },
      { n:'Sciences Po Paris', tier:1, tu:14000, gpaMin:3.5, ielts:7.0 },
      { n:'HEC Paris', tier:1, tu:22000, gpaMin:3.6, ielts:7.0 },
      { n:'École Polytechnique', tier:1, tu:8000, gpaMin:3.6, ielts:6.5 }
    ],
    can: [
      { n:'University of Toronto', tier:1, tu:35000, gpaMin:3.5, ielts:6.5 },
      { n:'McGill University', tier:1, tu:25000, gpaMin:3.4, ielts:6.5 },
      { n:'University of British Columbia', tier:1, tu:32000, gpaMin:3.4, ielts:6.5 },
      { n:'University of Waterloo', tier:1, tu:28000, gpaMin:3.4, ielts:6.5 }
    ],
    nld: [
      { n:'Delft University of Technology', tier:1, tu:18000, gpaMin:3.4, ielts:6.5 },
      { n:'University of Amsterdam', tier:1, tu:16000, gpaMin:3.3, ielts:6.5 },
      { n:'Utrecht University', tier:1, tu:15000, gpaMin:3.2, ielts:6.5 }
    ],
    ita: [
      { n:'University of Bologna', tier:1, tu:3000, gpaMin:3.2, ielts:6.0 },
      { n:'Politecnico di Milano', tier:1, tu:3500, gpaMin:3.3, ielts:6.0 }
    ],
    aus: [
      { n:'University of Melbourne', tier:1, tu:32000, gpaMin:3.4, ielts:6.5 },
      { n:'University of Sydney', tier:1, tu:34000, gpaMin:3.3, ielts:6.5 },
      { n:'Australian National University', tier:1, tu:30000, gpaMin:3.3, ielts:6.5 }
    ],
    jpn: [
      { n:'University of Tokyo', tier:1, tu:5000, gpaMin:3.5, ielts:6.5 },
      { n:'Kyoto University', tier:1, tu:5000, gpaMin:3.4, ielts:6.5 }
    ],
    kor: [
      { n:'Seoul National University', tier:1, tu:6000, gpaMin:3.4, ielts:6.5 },
      { n:'KAIST', tier:1, tu:6000, gpaMin:3.5, ielts:6.5 }
    ],
    sgp: [
      { n:'National University of Singapore', tier:1, tu:30000, gpaMin:3.6, ielts:6.5 }
    ],
    sau: [
      { n:'King Fahd University of Petroleum and Minerals', tier:1, tu:8000, gpaMin:3.2, ielts:6.0 },
      { n:'King Abdullah University of Science and Technology', tier:1, tu:12000, gpaMin:3.5, ielts:6.5 }
    ],
    uae: [
      { n:'NYU Abu Dhabi', tier:1, tu:55000, gpaMin:3.7, ielts:7.0 }
    ]
  };

  const P69_SCHOLARSHIPS = {
    gbr: [
      { id:'chevening', name:'Chevening Scholarship', cover:1.0, gpaMin:3.5, ielts:7.0, chance:0.15, note:'UK government · full tuition + living' },
      { id:'commonwealth', name:'Commonwealth Scholarship', cover:1.0, gpaMin:3.4, ielts:6.5, chance:0.12, note:'Commonwealth countries only' },
      { id:'uni-merit', name:'University merit scholarship', cover:0.5, gpaMin:3.5, ielts:6.5, chance:0.35, note:'Awarded by the university' }
    ],
    usa: [
      { id:'fulbright', name:'Fulbright Foreign Student Program', cover:1.0, gpaMin:3.6, ielts:7.0, chance:0.10, note:'US State Dept · full funding' },
      { id:'uni-full', name:'University full-ride', cover:1.0, gpaMin:3.8, ielts:7.5, chance:0.08, note:'Need-blind elite universities' },
      { id:'uni-partial', name:'University partial scholarship', cover:0.5, gpaMin:3.5, ielts:7.0, chance:0.30, note:'Tuition discount' }
    ],
    deu: [
      { id:'daad', name:'DAAD Scholarship', cover:1.0, gpaMin:3.4, ielts:6.5, chance:0.18, note:'German Academic Exchange' }
    ],
    fra: [
      { id:'eiffel', name:'Eiffel Excellence Scholarship', cover:1.0, gpaMin:3.5, ielts:6.5, chance:0.14, note:'French government · full funding' }
    ],
    can: [
      { id:'uni-partial-can', name:'University entrance scholarship', cover:0.4, gpaMin:3.3, ielts:6.5, chance:0.35, note:'Merit-based' }
    ],
    nld: [
      { id:'ots', name:'Orange Tulip Scholarship', cover:0.6, gpaMin:3.3, ielts:6.5, chance:0.25, note:'For Egypt and others' }
    ],
    ita: [
      { id:'invest', name:'Invest Your Talent in Italy', cover:1.0, gpaMin:3.3, ielts:6.0, chance:0.20, note:'For Egypt' }
    ],
    aus: [
      { id:'australia-awards', name:'Australia Awards', cover:1.0, gpaMin:3.4, ielts:6.5, chance:0.15, note:'Australian government' }
    ],
    jpn: [
      { id:'mext', name:'MEXT Scholarship', cover:1.0, gpaMin:3.4, ielts:6.0, chance:0.15, note:'Japanese government' }
    ],
    kor: [
      { id:'gks', name:'Global Korea Scholarship', cover:1.0, gpaMin:3.3, ielts:6.0, chance:0.18, note:'Korean government' }
    ],
    sgp: [
      { id:'sgs', name:'Singapore Government Scholarship', cover:1.0, gpaMin:3.6, ielts:6.5, chance:0.12, note:'Full funding + bond' }
    ],
    sau: [
      { id:'kaust', name:'KAUST Fellowship', cover:1.0, gpaMin:3.5, ielts:6.5, chance:0.20, note:'Full funding + stipend' }
    ],
    uae: [
      { id:'khalifa', name:'Khalifa University Scholarship', cover:1.0, gpaMin:3.5, ielts:6.5, chance:0.20, note:'Full funding' }
    ]
  };

  /* =================================================================
     CAREER LADDERS PER FACULTY
     ================================================================= */
  const P72_CAREER_LADDERS = {
    'Engineering': { track:'tech', levels:[
      { title:'Junior Site Engineer', minExp:0, salary:96000, reqSmarts:40, reqEng:25 },
      { title:'Site Engineer', minExp:2, salary:144000, reqSmarts:50, reqEng:30 },
      { title:'Senior Site Engineer', minExp:5, salary:210000, reqSmarts:60, reqEng:40 },
      { title:'Construction Manager', minExp:8, salary:300000, reqSmarts:70, reqEng:50 },
      { title:'Project Manager', minExp:12, salary:420000, reqSmarts:78, reqEng:60 },
      { title:'Project Director', minExp:15, salary:600000, reqSmarts:85, reqEng:70 }
    ], companies:['Orascom Construction','Hassan Allam','Enppi Engineering','Petrojet','Dar Al-Handasah','Elsewedy Electric'] },
    'Pharmacy': { track:'bio', levels:[
      { title:'Pharmacy Intern', minExp:0, salary:72000, reqSmarts:35, reqEng:25 },
      { title:'Community Pharmacist', minExp:1, salary:120000, reqSmarts:45, reqEng:30 },
      { title:'Hospital Pharmacist', minExp:3, salary:168000, reqSmarts:55, reqEng:40 },
      { title:'QA/QC Officer', minExp:5, salary:216000, reqSmarts:65, reqEng:45 },
      { title:'Branch Manager', minExp:7, salary:300000, reqSmarts:75, reqEng:55 },
      { title:'Pharma R&D Director', minExp:12, salary:480000, reqSmarts:85, reqEng:65 }
    ], companies:['Eva Pharma','Ibnsina Pharma','El Ezaby','Cleopatra','Pfizer Egypt','GSK Egypt','Hikma','Minapharm'] },
    'Medicine': { track:'medical', levels:[
      { title:'Medical Intern', minExp:0, salary:60000, reqSmarts:50, reqEng:30 },
      { title:'Resident Doctor', minExp:3, salary:144000, reqSmarts:65, reqEng:35 },
      { title:'Specialist Physician', minExp:7, salary:260000, reqSmarts:75, reqEng:40 },
      { title:'Consultant Physician', minExp:12, salary:420000, reqSmarts:85, reqEng:50 },
      { title:'Department Head', minExp:17, salary:650000, reqSmarts:90, reqEng:55 }
    ], companies:['Cleopatra Healthcare','NileCare','Mediterranean Medical','Cairo University Hospitals','Ain Shams Hospital','Dar Al Fouad'] },
    'Dentistry': { track:'medical', levels:[
      { title:'Dental Intern', minExp:0, salary:72000, reqSmarts:50, reqEng:30 },
      { title:'Associate Dentist', minExp:2, salary:156000, reqSmarts:60, reqEng:35 },
      { title:'Senior Dentist', minExp:5, salary:240000, reqSmarts:70, reqEng:40 },
      { title:'Specialist (Ortho/Implant)', minExp:9, salary:360000, reqSmarts:80, reqEng:45 },
      { title:'Clinic Owner', minExp:12, salary:600000, reqSmarts:85, reqEng:50 }
    ], companies:['Smile Dental','Cairo Dental Group','Alexandria Dental','Cleopatra','Mediterranean Medical','Private Practice'] },
    'Nursing': { track:'medical', levels:[
      { title:'Staff Nurse', minExp:0, salary:84000, reqSmarts:35, reqEng:25 },
      { title:'Senior Nurse', minExp:3, salary:132000, reqSmarts:45, reqEng:30 },
      { title:'Head Nurse', minExp:6, salary:192000, reqSmarts:55, reqEng:35 },
      { title:'Nursing Supervisor', minExp:10, salary:264000, reqSmarts:65, reqEng:40 },
      { title:'Director of Nursing', minExp:15, salary:396000, reqSmarts:75, reqEng:50 }
    ], companies:['Cleopatra Healthcare','NileCare','Cairo University Hospitals','Al-Salam Hospital','Dar Al Fouad'] },
    'Business': { track:'finance', levels:[
      { title:'Junior Accountant', minExp:0, salary:84000, reqSmarts:35, reqEng:25 },
      { title:'Accountant', minExp:2, salary:132000, reqSmarts:45, reqEng:30 },
      { title:'Senior Accountant', minExp:5, salary:210000, reqSmarts:55, reqEng:40 },
      { title:'Finance Controller', minExp:8, salary:324000, reqSmarts:68, reqEng:50 },
      { title:'Finance Director', minExp:12, salary:480000, reqSmarts:78, reqEng:60 },
      { title:'CFO', minExp:15, salary:720000, reqSmarts:85, reqEng:65 }
    ], companies:['Alexandria Commercial Bank','CIB','Delta Audit','PwC Egypt','Deloitte','KPMG','FirstGate Capital'] },
    'Economics': { track:'finance', levels:[
      { title:'Economic Research Assistant', minExp:0, salary:96000, reqSmarts:45, reqEng:40 },
      { title:'Economic Analyst', minExp:2, salary:156000, reqSmarts:55, reqEng:50 },
      { title:'Senior Economic Analyst', minExp:5, salary:240000, reqSmarts:65, reqEng:55 },
      { title:'Senior Policy Researcher', minExp:8, salary:324000, reqSmarts:75, reqEng:60 },
      { title:'Chief Economist', minExp:12, salary:480000, reqSmarts:85, reqEng:65 }
    ], companies:['Central Bank of Egypt','Ministry of Finance','ECES','FirstGate Capital','Cairo Growth Partners'] },
    'Computer Science': { track:'tech', levels:[
      { title:'Junior Developer', minExp:0, salary:96000, reqSmarts:45, reqEng:40 },
      { title:'Software Engineer', minExp:2, salary:180000, reqSmarts:58, reqEng:50 },
      { title:'Senior Software Engineer', minExp:5, salary:336000, reqSmarts:70, reqEng:60 },
      { title:'Tech Lead', minExp:8, salary:480000, reqSmarts:78, reqEng:65 },
      { title:'VP / CTO', minExp:12, salary:720000, reqSmarts:85, reqEng:75 }
    ], companies:['Pyramid Digital','Nile Data Systems','Delta Software','Alexandria Analytics','Vodafone Egypt','Microsoft Egypt','Fawry Digital'] },
    'Law': { track:'law', levels:[
      { title:'Legal Intern', minExp:0, salary:72000, reqSmarts:45, reqEng:35 },
      { title:'Junior Associate', minExp:2, salary:132000, reqSmarts:55, reqEng:40 },
      { title:'Senior Associate', minExp:6, salary:264000, reqSmarts:68, reqEng:50 },
      { title:'Counsel', minExp:10, salary:420000, reqSmarts:78, reqEng:60 },
      { title:'Partner', minExp:15, salary:720000, reqSmarts:85, reqEng:65 }
    ], companies:['Sphinx Legal','Sharkawy & Sarhan','NileBridge Counsel','Delta Contracts','Cairo Commercial Law'] },
    'Mass Comm': { track:'entry', levels:[
      { title:'Journalism Intern', minExp:0, salary:72000, reqSmarts:40, reqEng:40 },
      { title:'Reporter / Content Writer', minExp:1, salary:120000, reqSmarts:50, reqEng:45 },
      { title:'Senior Reporter', minExp:4, salary:192000, reqSmarts:60, reqEng:55 },
      { title:'Managing Editor', minExp:8, salary:300000, reqSmarts:70, reqEng:60 },
      { title:'Editor-in-Chief', minExp:12, salary:480000, reqSmarts:80, reqEng:70 }
    ], companies:['Al-Ahram','Al-Masry Al-Youm','ON E','CBC Egypt','Daily News Egypt','Nile Media Group'] },
    'Arts': { track:'entry', levels:[
      { title:'Teacher / Translator', minExp:0, salary:84000, reqSmarts:40, reqEng:45 },
      { title:'Content Writer / Journalist', minExp:2, salary:132000, reqSmarts:50, reqEng:50 },
      { title:'Senior Translator / Editor', minExp:5, salary:210000, reqSmarts:60, reqEng:60 },
      { title:'Museum Curator', minExp:8, salary:300000, reqSmarts:70, reqEng:65 },
      { title:'Cultural Programs Director', minExp:12, salary:420000, reqSmarts:80, reqEng:70 }
    ], companies:['Modern English School','Cairo British School','Al-Ahram Translation','Egyptian Museum','Grand Egyptian Museum','Bibliotheca Alexandrina'] },
    'Education': { track:'entry', levels:[
      { title:'Assistant Teacher', minExp:0, salary:60000, reqSmarts:35, reqEng:30 },
      { title:'Classroom Teacher', minExp:2, salary:96000, reqSmarts:45, reqEng:35 },
      { title:'Head of Department', minExp:6, salary:168000, reqSmarts:58, reqEng:45 },
      { title:'Assistant Principal', minExp:10, salary:240000, reqSmarts:68, reqEng:55 },
      { title:'School Principal', minExp:14, salary:360000, reqSmarts:78, reqEng:60 }
    ], companies:['Ministry of Education','Modern English School','Cairo British School','Alexandria International','Nile Education Group'] },
    'Tourism & Hotels': { track:'entry', levels:[
      { title:'Hotel Trainee', minExp:0, salary:72000, reqSmarts:35, reqEng:45 },
      { title:'Tour Guide / Front Desk', minExp:2, salary:120000, reqSmarts:45, reqEng:55 },
      { title:'Senior Tour Guide', minExp:5, salary:180000, reqSmarts:55, reqEng:60 },
      { title:'Hotel Department Manager', minExp:8, salary:264000, reqSmarts:65, reqEng:65 },
      { title:'Hotel General Manager', minExp:14, salary:480000, reqSmarts:78, reqEng:70 }
    ], companies:['Travco Group','Four Seasons Cairo','Marriott Mena House','Ritz-Carlton Cairo','Abercrombie & Kent Egypt'] },
    'Logistics': { track:'entry', levels:[
      { title:'Logistics Coordinator', minExp:0, salary:84000, reqSmarts:35, reqEng:35 },
      { title:'Supply Chain Analyst', minExp:2, salary:144000, reqSmarts:48, reqEng:45 },
      { title:'Senior Supply Chain Analyst', minExp:5, salary:216000, reqSmarts:58, reqEng:55 },
      { title:'Logistics Manager', minExp:8, salary:312000, reqSmarts:68, reqEng:60 },
      { title:'Supply Chain Director', minExp:12, salary:480000, reqSmarts:78, reqEng:65 }
    ], companies:['Meridian Supply Chain','Red Sea Logistics','Bosta','Aramex Egypt','DHL Egypt'] },
    'Social Work': { track:'entry', levels:[
      { title:'Social Work Assistant', minExp:0, salary:60000, reqSmarts:35, reqEng:30 },
      { title:'Social Worker / Counselor', minExp:2, salary:108000, reqSmarts:45, reqEng:40 },
      { title:'Senior Social Worker', minExp:6, salary:168000, reqSmarts:58, reqEng:50 },
      { title:'Program Manager (NGO)', minExp:10, salary:240000, reqSmarts:68, reqEng:55 },
      { title:'Social Development Director', minExp:14, salary:360000, reqSmarts:78, reqEng:60 }
    ], companies:['Ministry of Social Solidarity','Save the Children Egypt','UNICEF Egypt','Caritas Egypt','Egyptian Red Crescent'] },
    'Languages': { track:'entry', levels:[
      { title:'Language Instructor (Part-time)', minExp:0, salary:60000, reqSmarts:40, reqEng:65 },
      { title:'Language Instructor', minExp:1, salary:108000, reqSmarts:50, reqEng:75 },
      { title:'Senior Instructor', minExp:5, salary:180000, reqSmarts:60, reqEng:80 },
      { title:'Language Center Manager', minExp:8, salary:264000, reqSmarts:70, reqEng:85 },
      { title:'Education Program Director', minExp:12, salary:420000, reqSmarts:78, reqEng:90 }
    ], companies:['Berlitz Egypt','British Council','Institut Français','Goethe Institute','AMIDEAST'] }
  };

  const P72_FACULTY_TO_DEGREE = {
    'Medicine':'medicine','Dentistry':'medicine','Nursing':'medicine','Physical Therapy':'medicine',
    'Veterinary':'biology','Pharmacy':'biology','Pharmacy & Biotech':'biology','Biotechnology':'biology',
    'Agriculture':'biology','Science':'biology','Sciences':'biology','Fisheries':'biology',
    'Engineering':'cs','Computer Science':'cs','Computers & IT':'cs','Applied Sciences & Arts':'cs',
    'Logistics':'business','Business':'business','Economics':'business','Management':'business',
    'Law':'law','Arts':'business','Education':'business','Humanities':'business',
    'Mass Comm':'business','Media':'business','Languages':'business','Social Work':'business',
    'Tourism & Hotels':'business'
  };

  const P72_TRACK_FACULTIES = {
    'adabi': ['Law','Business','Economics','Arts','Education','Mass Comm','Media','Humanities','Languages','Social Work','Tourism & Hotels','Management'],
    'elmi-riyada': ['Engineering','Computer Science','Computers & IT','Science','Pharmacy','Pharmacy & Biotech','Business','Economics','Management','Applied Sciences & Arts','Fisheries','Logistics','Physical Therapy'],
    'elmi-olom': ['Medicine','Dentistry','Pharmacy','Pharmacy & Biotech','Physical Therapy','Nursing','Veterinary','Science','Agriculture','Biotechnology','Sciences','Applied Sciences & Arts']
  };

  function p72GetLadderForFaculty(faculty) {
    if (!faculty) return null;
    if (P72_CAREER_LADDERS[faculty]) return P72_CAREER_LADDERS[faculty];
    const fb = { 'Pharmacy & Biotech':'Pharmacy','Computers & IT':'Computer Science','Applied Sciences & Arts':'Computer Science',
      'Media':'Mass Comm','Humanities':'Arts','Management':'Business','Biotechnology':'Pharmacy','Sciences':'Computer Science',
      'Veterinary':'Medicine','Agriculture':'Pharmacy','Fisheries':'Pharmacy','Physical Therapy':'Medicine' };
    if (fb[faculty]) return P72_CAREER_LADDERS[fb[faculty]];
    return null;
  }
  window.p72GetLadderForFaculty = p72GetLadderForFaculty;

  function p72CurrentCareerLevel() {
    if (!S || !S.p72 || !S.p72.degreeExtra) return 0;
    const ladder = p72GetLadderForFaculty(S.p72.degreeExtra);
    if (!ladder) return 0;
    const yrs = (typeof allExperience === 'function') ? allExperience() : 0;
    let level = 0;
    for (let i = 0; i < ladder.levels.length; i++) {
      if (yrs >= ladder.levels[i].minExp && (S.smarts || 0) >= ladder.levels[i].reqSmarts) level = i;
      else break;
    }
    return level;
  }
  window.p72CurrentCareerLevel = p72CurrentCareerLevel;

  function p72AssignFacultyDegree(faculty) {
    p69Init(S);
    const base = P72_FACULTY_TO_DEGREE[faculty] || 'business';
    S.degree = base;
    S.p72.degreeExtra = faculty;
    return base;
  }
  window.p72AssignFacultyDegree = p72AssignFacultyDegree;

  /* =================================================================
     HOOK uniYear GRADUATION
     ================================================================= */
  const _uniYear = (typeof uniYear === 'function') ? uniYear : null;
  if (_uniYear) {
    uniYear = function (notes, bill) {
      const u = S && S.uni;
      const facBefore = u && (u.faculty || null);
      const yTotal = u && (u.yearsTotal || 4);
      const yBefore = u && (u.year || 0);
      const r = _uniYear.apply(this, arguments);
      if (!S.uni && facBefore && (yBefore + 1) >= yTotal) {
        p72AssignFacultyDegree(facBefore);
        if (typeof log === 'function') log('🎓 Degree recorded: ' + facBefore + ' → ' + S.degree);
      }
      return r;
    };
  }

  /* =================================================================
     CAREER BOARD WRAP
     ================================================================= */
  const _companyListFor = (typeof companyListFor === 'function') ? companyListFor : null;
  if (_companyListFor) {
    companyListFor = function (country) {
      country = country || (S && S.country) || 'egy';
      let list = _companyListFor(country) || [];
      if (!S) return list;
      if (country !== 'egy') return list;
      const faculty = (S.p72 && S.p72.degreeExtra) || (S.uni && S.uni.faculty) || null;
      if (!faculty) return list;
      const ladder = p72GetLadderForFaculty(faculty);
      if (!ladder || !ladder.levels) return list;

      const year = (typeof gameYear === 'function') ? gameYear() : 2019;
      const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
      const yrs = (typeof allExperience === 'function') ? allExperience() : 0;
      const playerLevel = p72CurrentCareerLevel();

      const extra = ladder.levels.map(function (lvl, i) {
        if (i > playerLevel + 1) return null;
        const comp = ladder.companies[i % ladder.companies.length];
        const salaryEGP = Math.round(lvl.salary * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(year) : 1));
        return {
          id: 'p72_' + faculty.replace(/\W/g, '') + '_lvl' + i + '_' + year,
          trackId: ladder.track,
          name: comp,
          title: lvl.title,
          desc: faculty + ' ladder — Level ' + (i + 1) + ' of ' + ladder.levels.length + '. Requires ' + lvl.minExp + '+ yrs, ' + lvl.reqSmarts + '% smarts.',
          factor: 1, smarts: lvl.reqSmarts, eng: lvl.reqEng, minExp: lvl.minExp,
          medical: /Medicine|Pharmacy|Dentistry|Nursing/.test(faculty),
          social: true, bonus: 0.03, leave: 21, remote: 'On-site', hours: 42, stress: 4,
          contract: 'Permanent', sponsorship: false, isFacultyJob: true, forFaculty: faculty,
          levelInLadder: i, baseSalaryInternal: salaryEGP / rate
        };
      }).filter(Boolean);

      const ids = {};
      list.forEach(function (x) { ids[x.id] = true; });
      const fresh = extra.filter(function (x) { return !ids[x.id]; });
      return fresh.concat(list);
    };
  }

  /* Eligibility check for faculty jobs */
  if (typeof p12Eligibility === 'function') {
    const _elig = p12Eligibility;
    p12Eligibility = function (post) {
      if (post && post.isFacultyJob) {
        const fac = (S.p72 && S.p72.degreeExtra) || (S.uni && S.uni.faculty);
        if (fac !== post.forFaculty) return 'Requires a ' + post.forFaculty + ' degree.';
        const yrs = (typeof allExperience === 'function') ? allExperience() : 0;
        if (yrs < (post.minExp || 0)) return 'Requires ' + post.minExp + '+ years of experience.';
        if ((S.smarts || 0) < (post.smarts || 0)) return 'Requires ' + post.smarts + '% Smarts.';
        const pl = p72CurrentCareerLevel();
        if ((post.levelInLadder || 0) > pl + 1) return 'You must progress through Level ' + (pl + 1) + ' first.';
      }
      return _elig.apply(this, arguments);
    };
  }

  /* =================================================================
     LANGUAGE COOLDOWN — 3 months
     ================================================================= */
  function p72CanTakeLang(lang) {
    p69Init(S);
    const abs = S.pacingAbsoluteMonth || 0;
    const cd = S.p72.langCooldown[lang] || { lastMonth: -100 };
    return (abs - (cd.lastMonth || -100)) >= 3;
  }
  function p72MarkLangTaken(lang) {
    p69Init(S);
    S.p72.langCooldown[lang] = { lastMonth: S.pacingAbsoluteMonth || 0 };
  }
  window.p72CanTakeLang = p72CanTakeLang;

  if (typeof takeEng === 'function') {
    const _takeEng = takeEng;
    takeEng = function (i) {
      if (!p72CanTakeLang('english')) return hint('You took an English course recently. Wait 3 months.');
      const r = _takeEng.apply(this, arguments);
      p72MarkLangTaken('english');
      return r;
    };
  }

  /* =================================================================
     STUDY ABROAD — apply / resolve
     ================================================================= */
  function p69ComputeThanaweya() {
    if (!S) return 0;
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
    const smarts = S.smarts || 50;
    const effort = S.effort || 'coast';
    const gpaScore = (gpa / 4) * 100;
    const effBonus = effort === 'hard' ? 6 : effort === 'coast' ? 0 : -10;
    let score = smarts * 0.6 + gpaScore * 0.3 + effBonus + (Math.random() * 6 - 3);
    if (S.p68 && S.p68.thanaweyaTrack === 'elmi-olom') score += 3;
    else if (S.p68 && S.p68.thanaweyaTrack === 'elmi-riyada') score += 2;
    return Math.max(40, Math.min(100, Math.round(score * 10) / 10));
  }

  window.p69ComputeAndShowResult = function () {
    p69Init(S);
    if (!S.p68 || !S.p68.thanaweyaTrack) return hint('Choose your Thanaweya Amma track first.');
    if (S.age < 18) return hint('You will get your Thanaweya Amma score at age 18.');
    const score = p69ComputeThanaweya();
    S.p69.thanaweya.score = score;
    S.p69.thanaweya.year = (typeof gameYear === 'function') ? gameYear() : 2019;
    if (typeof log === 'function') log('📝 Thanaweya Amma result: ' + score + '%');
    if (typeof realismNotice === 'function') realismNotice('Thanaweya Amma result', 'You scored ' + score + '%.');
    if (typeof render === 'function') render();
  };

  window.p69ApplyToUniversity = function (countryCode, uniName, level, funding) {
    p69Init(S);
    if (!S || S.age < 17) return hint('Too young.');
    const country = COUNTRIES[countryCode] || {};
    const uni = (P69_UNIS[countryCode] || []).find(function (u) { return u.n === uniName; });
    if (!uni) return hint('University not found.');

    const isBach = level === 'bachelor';
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
    const ielts = S.ielts || 0;
    const thana = (S.p69.thanaweya && S.p69.thanaweya.score) || 0;

    if (isBach) {
      if (!S.diploma) return hint('You need a high-school diploma.');
      if (thana < 70) return hint('Bachelor abroad needs Thanaweya 70%+. Yours: ' + thana + '%');
    } else {
      if (!S.degree) return hint('You need a bachelor\'s degree first.');
      if (gpa < uni.gpaMin) return hint('GPA too low: needs ' + uni.gpaMin + '+');
    }
    if (ielts < uni.ielts) return hint('IELTS too low: needs ' + uni.ielts + '+');

    const feeEGP = Math.round((uni.tier === 1 ? 120 : uni.tier === 2 ? 90 : 60) * 52.7 * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1));
    const feeInternal = feeEGP / (typeof rateNow === 'function' ? rateNow() : 52.7);
    if (S.wealth < feeInternal) return hint('Application fee: E£' + feeEGP.toLocaleString());

    S.wealth -= feeInternal;
    S.expenses = (S.expenses || 0) + feeInternal;

    S.p69.applications.push({
      id: 'app_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      country: countryCode, uni: uniName, level: level,
      gpaAtApply: gpa, ieltsAtApply: ielts, thanaweyaAtApply: thana,
      funding: funding, stage: 'submitted',
      appliedMonth: S.pacingAbsoluteMonth || 0,
      readyMonth: (S.pacingAbsoluteMonth || 0) + (S.pacing === 'monthly' ? 3 : 12),
      admission: null, awarded: null, visaResult: null
    });

    if (typeof log === 'function') log('📤 Applied to ' + uniName + ' · ' + level + ' · ' + funding + '. Fee: E£' + feeEGP.toLocaleString() + '.');
    if (typeof render === 'function') render();
  };

  function p69TickApplications() {
    p69Init(S);
    if (!S || !Array.isArray(S.p69.applications)) return;
    const abs = S.pacingAbsoluteMonth || 0;
    S.p69.applications.forEach(function (app) {
      if (!app || app.stage === 'completed' || app.stage === 'refused') return;
      if (app.stage === 'submitted' && abs >= app.readyMonth) {
        const uni = (P69_UNIS[app.country] || []).find(function (u) { return u.n === app.uni; });
        if (!uni) { app.stage = 'refused'; return; }
        const gpaD = app.gpaAtApply - uni.gpaMin;
        const ieltsD = app.ieltsAtApply - uni.ielts;
        const thanaB = app.level === 'bachelor' ? (app.thanaweyaAtApply - 70) / 100 : 0;
        let chance = 0.25 + gpaD * 0.6 + ieltsD * 0.1 + thanaB;
        if (app.level === 'bachelor') chance += 0.05;
        if (uni.tier === 1) chance -= 0.15;
        chance = Math.max(0.05, Math.min(0.92, chance));
        if (Math.random() < chance) {
          app.admission = 'admitted'; app.stage = 'admitted';
          if (typeof log === 'function') log('✅ Admitted to ' + app.uni + '!');
        } else {
          app.admission = 'refused'; app.stage = 'refused';
          if (typeof log === 'function') log('❌ ' + app.uni + ' rejected your application.');
        }
        return;
      }
      if (app.stage === 'admitted' && !app.awarded && abs >= app.readyMonth + 1) {
        p69ProcessFunding(app);
        return;
      }
      if (app.stage === 'funding-done' && !app.visaResult && abs >= app.readyMonth + 2) {
        p69ProcessVisa(app);
        return;
      }
    });
  }

  function p69ProcessFunding(app) {
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    if (app.funding === 'self') {
      const y1 = p69Year1Cost(app.country);
      const bank = Math.round(S.wealth * rate);
      if (bank < y1) { app.awarded = { type:'self', cover:0 }; app.stage = 'funding-failed'; return; }
      app.awarded = { type:'self', cover:0 }; app.stage = 'funding-done';
      if (typeof log === 'function') log('💰 Self-funded. Bank: E£' + bank.toLocaleString());
      return;
    }
    if (app.funding === 'parents') {
      const fw = Number(S.famWealth) || 0;
      const agree = fw === 2 ? 0.85 : fw === 1 ? 0.35 : 0.05;
      if (Math.random() < agree) { app.awarded = { type:'parents', cover:1.0 }; app.stage = 'funding-done'; }
      else { app.awarded = { type:'parents', cover:0 }; app.stage = 'funding-failed'; }
      return;
    }
    const pool = P69_SCHOLARSHIPS[app.country] || [];
    const elig = pool.filter(function (s) { return app.gpaAtApply >= s.gpaMin && app.ieltsAtApply >= s.ielts; });
    if (!elig.length) { app.awarded = { type:'none', cover:0 }; app.stage = 'funding-failed'; return; }
    const target = elig.reduce(function (b, s) { return s.cover > (b ? b.cover : 0) ? s : b; }, null);
    const bonus = Math.min(0.15, (app.gpaAtApply - target.gpaMin) * 0.1 + (app.ieltsAtApply - target.ielts) * 0.05);
    if (Math.random() < Math.min(0.9, target.chance + bonus)) {
      app.awarded = { type: target.id, name: target.name, cover: target.cover };
      app.stage = 'funding-done';
      if (typeof log === 'function') log('🏆 Awarded ' + target.name + '!');
    } else { app.awarded = { type:'none', cover:0 }; app.stage = 'funding-failed'; }
  }

  function p69ProcessVisa(app) {
    const base = { gbr:0.75, usa:0.65, can:0.70, deu:0.85, fra:0.78, nld:0.75, ita:0.80, aus:0.72, jpn:0.78, kor:0.75, sgp:0.70, sau:0.72, uae:0.80 }[app.country] || 0.70;
    const funded = app.awarded && (app.awarded.cover >= 1 || app.awarded.type === 'parents');
    const chance = funded ? Math.min(0.95, base + 0.12) : base;
    if (Math.random() < chance) {
      app.visaResult = 'approved'; app.stage = 'visa-approved';
      if (typeof log === 'function') log('✅ Student visa approved for ' + app.uni + '.');
    } else {
      app.visaResult = 'refused'; app.stage = 'visa-refused';
      if (typeof log === 'function') log('❌ Student visa refused for ' + COUNTRIES[app.country].n + '.');
    }
  }

  function p69Year1Cost(code) {
    const c = { ita:2500+9500+90+580+700, fra:5000+10500+100+620+800, jpn:6000+12000+60+850+900,
      kor:5500+11000+60+850+900, deu:0+11500+11208+75+590+800, sau:15000+11000+200+340+700,
      nld:18000+12500+210+640+900, uae:22000+14000+250+300+800, gbr:25000+15000+490+650+1000,
      nzl:24000+17000+430+1350+1000, sgp:28000+16000+90+950+1000, aus:28000+20000+710+1350+1200,
      can:22000+16000+14000+150+1000+1200, usa:35000+18000+185+1100+1500 }[code] || 30000;
    return Math.round(c * 52.7 * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1));
  }

  /* =================================================================
     YEARLY TICK
     ================================================================= */
  const _ageUp = ageUp;
  ageUp = function () {
    const r = _ageUp.apply(this, arguments);
    try { p69TickApplications(); } catch (e) {}
    return r;
  };
  const _p52Tick = (typeof p52MonthlyTick === 'function') ? p52MonthlyTick : null;
  if (_p52Tick) {
    p52MonthlyTick = function () {
      _p52Tick.apply(this, arguments);
      try { p69TickApplications(); } catch (e) {}
    };
  }
  setTimeout(function () { try { p69TickApplications(); } catch (e) {} }, 1500);

  /* =================================================================
     VIEW: education (faculty career card + study tracking + picker)
     ================================================================= */
  const _viewSchool = viewSchool;
  viewSchool = function () {
    let html = '';
    try { html = _viewSchool.apply(this, arguments); } catch (e) { console.error('[p69] viewSchool failed:', e); html = ''; }
    if (!S) return html;

    /* Faculty career ladder card (only shown for graduates) */
    if (S.degree && S.p72 && S.p72.degreeExtra) {
      const fac = S.p72.degreeExtra;
      const ladder = p72GetLadderForFaculty(fac);
      if (ladder) {
        const pl = p72CurrentCareerLevel();
        const yrs = (typeof allExperience === 'function') ? allExperience() : 0;
        let careerCard = '<section class="card" style="border-color:var(--mint)"><h3>💼 Your ' + fac + ' career ladder</h3>' +
          '<p class="muted" style="font-size:.82rem">Level ' + (pl + 1) + ' of ' + ladder.levels.length + ' · ' + yrs + ' yrs experience</p>';
        ladder.levels.forEach(function (lvl, i) {
          const isCur = i === pl;
          const isPast = i < pl;
          const isNext = i === pl + 1;
          const col = isPast ? 'var(--muted)' : isCur ? 'var(--mint)' : isNext ? 'var(--cyan)' : 'var(--line)';
          const badge = isPast ? '✓ Done' : isCur ? '▶ Current' : isNext ? '→ Next' : '🔒 Locked';
          const salaryEGP = Math.round(lvl.salary * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1));
          careerCard += '<div style="margin-top:8px;padding:8px;border-left:3px solid ' + col + ';background:rgba(255,255,255,.02);border-radius:6px">' +
            '<b style="font-size:.85rem">L' + (i + 1) + ' — ' + lvl.title + '</b>' +
            '<div class="muted" style="font-size:.72rem;margin-top:2px">' + lvl.minExp + '+ yrs · ' + lvl.reqSmarts + '% Smarts</div>' +
            '<div style="text-align:right;margin-top:2px"><span class="mono" style="font-size:.8rem">E£' + salaryEGP.toLocaleString() + '</span> <span style="font-size:.72rem;color:' + col + '">' + badge + '</span></div>' +
            '</div>';
        });
        careerCard += '<button class="btn" style="margin-top:8px;text-align:center" onclick="activeTab=\'career\';render()">Open Career tab</button></section>';
        html += careerCard;
      }
    }

    /* Study applications tracking */
    const apps = (S.p69 && Array.isArray(S.p69.applications)) ? S.p69.applications.filter(function (a) {
      return a && a.stage !== 'refused' || (a && a.stage === 'refused' && (S.pacingAbsoluteMonth || 0) - a.readyMonth < 6);
    }) : [];
    if (apps.length) {
      let track = '<section class="card" style="border-color:var(--violet)"><h3>📤 Study applications</h3>';
      apps.forEach(function (app) {
        const cc = COUNTRIES[app.country] || {};
        let status = '', color = 'var(--amber)';
        if (app.stage === 'submitted') status = '⏳ Pending';
        else if (app.stage === 'admitted') status = '✅ Admitted — funding pending';
        else if (app.stage === 'funding-done') status = '✅ Funding secured — visa pending';
        else if (app.stage === 'visa-approved') { status = '🎉 Visa approved — ready to travel'; color = 'var(--mint)'; }
        else if (app.stage === 'visa-refused') { status = '❌ Visa refused'; color = 'var(--rose)'; }
        else if (app.stage === 'funding-failed') { status = '⚠️ Admitted but funding failed'; color = 'var(--rose)'; }
        else if (app.stage === 'refused') { status = '❌ Rejected'; color = 'var(--rose)'; }
        track += '<div style="margin-top:8px;padding:8px;border:1px solid var(--line);border-radius:8px">' +
          '<b>' + app.uni + '</b> <span class="muted" style="font-size:.75rem">· ' + (cc.n || app.country) + '</span>' +
          '<div style="color:' + color + ';font-size:.8rem;margin-top:4px">' + status + '</div>' +
          (app.awarded ? '<div class="muted" style="font-size:.74rem;margin-top:2px">' + (app.awarded.name || app.awarded.type) + ' · ' + Math.round((app.awarded.cover||0)*100) + '%</div>' : '') +
          '</div>';
      });
      track += '</section>';
      html += track;
    }

    return html;
  };

  /* =================================================================
     INIT
     ================================================================= */
  p69Init(S);
  console.log('[p69] Education + Career core (Phase 3.3a) loaded');
})();
