/* ============================================================
   VIEW: EDUCATION (EXPANDED)
   ============================================================
   Owns: S.school, S.uni, S.degree, S.thanaweyaScore,
         S.educationTrack, S.educationEvents, S.educationActivities,
         S.scholarshipApps, S.studyAbroadApps, S.studyAbroad, S.examStress
   Registers tab 'school' at order 1.
   ============================================================ */

/* ---------- STATE ---------- */
function ensureEducationState() {
  if (!S) return;

  /* Migrate old school IDs to new IDs (preserve prices) */
  if (S.school === 'private') S.school = 'language';
  if (S.school === 'international') S.school = 'igcse';

  if (typeof S.educationTrack === 'undefined') S.educationTrack = null;
  if (!Array.isArray(S.educationEvents)) S.educationEvents = [];
  if (!Array.isArray(S.educationActivities)) S.educationActivities = [];
  if (!Array.isArray(S.scholarshipApps)) S.scholarshipApps = [];
  if (!Array.isArray(S.studyAbroadApps)) S.studyAbroadApps = [];
  if (typeof S.studyAbroad === 'undefined') S.studyAbroad = null;
if (typeof S.examStress !== 'number') S.examStress = 0; if (typeof S.studyActionsThisYear !== 'number') S.studyActionsThisYear = 0;
  if (!Array.isArray(S.schoolHistory)) S.schoolHistory = [];
  if (!S.educationTab) S.educationTab = 'overview';
  if (typeof S.tutoring === 'undefined') S.tutoring = false;

  /* Enrich existing S.uni if it exists from old system */
  if (S.uni && typeof S.uni.gpa !== 'number') {
    S.uni.gpa = 3.0;
    S.uni.semestersCompleted = S.uni.year || 0;
    S.uni.city = S.uni.city || 'Cairo';
    S.uni.quality = S.uni.quality || 7;
    S.uni.faculty = S.uni.faculty || S.uni.major || 'general';
    S.uni.credits = 0;
    S.uni.startedYear = S.uni.startedYear || (gameYear() - (S.uni.year || 0));
  }
}
GameHooks.on('newGame', ensureEducationState);
GameHooks.on('migrate', ensureEducationState);

/* ---------- HELPERS ---------- */
const EDU_EGP_BASE_RATE = 52.7;
function eduRate() { return C().rate || 1; }
function eduEGP(n) {
  const localRate = C().rate || 1;
  if (localRate === EDU_EGP_BASE_RATE) return Math.round(n || 0);
  return Math.round((n || 0) * (localRate / EDU_EGP_BASE_RATE));
}
function eduUSD(n) { return Math.round((n || 0) * eduRate()); }
function eduFamilyWealth() {
  const map = {
    'poor': 0,
    'lower-mid': 5000,
    'middle': 80000,
    'upper-mid': 600000,
    'wealthy': 5000000,
    'ultra': 50000000
  };
  return map[S.familyTier] || 0;
}
function eduSetTab(tab) { S.educationTab = tab; render(); }
window.eduSetTab = eduSetTab;

function eduSchoolById(id) { return EDU_SCHOOLS.find(function(s) { return s.id === id; }); }
function eduUniById(id) { return EDU_UNIVERSITIES.find(function(u) { return u.id === id; }); }
function eduMajorById(id) { return EDU_MAJORS.find(function(m) { return m.id === id; }); }
function eduTrackById(id) { return EDU_TRACKS.find(function(t) { return t.id === id; }); }
function eduCutoffFor(faculty) { return (EDU_CUTOFFS.find(function(c) { return c.faculty === faculty; }) || {}).cutoff || 60; }

function eduGetCurrentSchoolFee() {
  const school = eduSchoolById(S.school);
  return school ? eduEGP(school.annualEGP) : 0;
}

function eduGetCurrentUniFee() {
  if (!S.uni) return 0;
  return eduEGP(S.uni.tuition || 0);
}

function eduComputeGPA() {
  return S.uni && typeof S.uni.gpa === 'number' ? S.uni.gpa : 0;
}

function eduHasPassedLanguageTest(testId) {
  if (!S.languageScores) return false;
  const test = EDU_LANGUAGE_TESTS.find(function(t) { return t.id === testId; });
  if (!test) return false;
  return (S.languageScores[testId] || 0) >= test.passScore;
}

/* ---------- DECISION: CHOOSE SCHOOL (age 6) ---------- */
function eduChooseSchool(schoolId) {
  const school = eduSchoolById(schoolId);
  if (!school) return;
  const fee = eduEGP(school.annualEGP);
  
  if (fee > 0) {
    if (S.wealth >= fee) {
      S.wealth -= fee;
    } else {
      /* Family Help Fallback for initial school choice */
      const familyWealth = eduFamilyWealth();
      if (familyWealth >= fee) {
         log('👨‍👩‍👧 Your family paid your school fees.');
      } else {
         log('❌ Cannot afford ' + school.label + ' (' + money(fee) + '/year).');
         render(); return;
      }
    }
  }

  S.school = schoolId;
  S.schoolHistory.push({ year: gameYear(), school: schoolId });
  S.flags.evt_school_choice = true;
  log('🎓 Enrolled in ' + school.label + ' for ' + (fee > 0 ? money(fee) + '/year' : 'free') + '.');
  fx({ happiness: 3, smarts: 2 });
  render();
}
window.eduChooseSchool = eduChooseSchool;

/* ---------- DECISION: CHOOSE TRACK (age 15) ---------- */
function eduChooseTrack(trackId) {
  const track = eduTrackById(trackId);
  if (!track) return;

  if (track.requiresSchool !== 'any' && track.requiresSchool && track.requiresSchool.indexOf(S.school) < 0) {
    log('❌ Your current school does not offer ' + track.label + '.');
    render(); return;
  }

  const fee = eduEGP(track.annualEGP);
  if (fee > 0) {
    if (S.wealth >= fee) {
      S.wealth -= fee;
    } else if (eduFamilyWealth() >= fee) {
      log('👨‍👩‍👧 Your family paid the ' + track.label + ' track fee (' + money(fee) + '/year).');
    } else {
      log('❌ Cannot afford ' + track.label + ' (' + money(fee) + '/year). Neither you nor your family has enough.');
      render(); return;
    }
  }

   S.educationTrack = trackId;
  log('📚 Track: ' + track.label + '. ' + (fee > 0 ? 'Fee: ' + money(fee) + '/year.' : 'Free.'));
  fx({ happiness: 2, smarts: 3 });
  render();
}
window.eduChooseTrack = eduChooseTrack;

/* ---------- PRIVATE TUTORING (Darass Khososy) ---------- */
window.eduHireTutors = function() {
  if (!S.educationTrack || S.tutoring) return;
  const track = eduTrackById(S.educationTrack);
  const cost = eduEGP(track.tutoringCost);

  if (cost === 0) { log('Tutoring not needed for this track.'); return; }

  if (S.wealth >= cost) {
    S.wealth -= cost;
  } else {
     const familyWealth = eduFamilyWealth();
     if (familyWealth >= cost) {
        log('👨‍👩‍👧 Your family paid for your private tutors.');
     } else {
        log('❌ Cannot afford private tutoring (' + money(cost) + '). Thanaweya will be much harder.');
        render(); return;
     }
  }

  S.tutoring = true;
  S.examStress = Math.min(100, S.examStress + 15);
  log('👨‍🏫 Hired private tutors for ' + money(cost) + '. Score potential increased, but stress is up!');
  render();
};

/* ---------- DECISION: APPLY TO UNIVERSITY ---------- */
function eduApplyToUni(uniId, facultyId, paymentMode) {
  const uni = eduUniById(uniId);
  const faculty = eduMajorById(facultyId);
  if (!uni || !faculty) return;

  const score = S.thanaweyaScore || 0;
  const cutoff = eduCutoffFor(faculty.cutoffKey);

  if (uni.type === 'public' && score < cutoff) {
    log('❌ Score ' + score.toFixed(1) + '% is below the ' + cutoff + '% cutoff for ' + faculty.label + ' at ' + uni.name + '.');
    render(); return;
  }
  if (uni.type === 'private' && uni.cutoffs && score < uni.cutoffs) {
    log('❌ Score ' + score.toFixed(1) + '% is below ' + uni.name + "'s minimum of " + uni.cutoffs + '%.');
    render(); return;
  }

  const tuition = eduEGP(uni.tuitionEGP);

  /* Payment handling */
  if (paymentMode === 'self') {
    if (S.wealth < tuition) {
      log('❌ Cannot afford self-pay (' + money(tuition) + '/year).');
      render(); return;
    }
    S.wealth -= tuition;
    log('💸 You paid the first year yourself: ' + money(tuition) + '.');
  } else if (paymentMode === 'family') {
    const famW = eduFamilyWealth();
    if (famW < tuition) {
      log('❌ Your family cannot afford ' + money(tuition) + '/year. (Family wealth tier: ' + S.familyTier + ')');
      render(); return;
    }
    log('👨‍👩‍👧 Your family is paying your tuition: ' + money(tuition) + '/year.');
  } else if (paymentMode === 'loan') {
    if (!S.bank) { log('❌ No banking system available.'); render(); return; }
    if (!Array.isArray(S.bank.loans)) S.bank.loans = [];
    S.bank.loans.push({
      id: 'student_loan_' + Math.random().toString(36).slice(2, 8),
      name: 'Student loan — ' + uni.name,
      principal: tuition * faculty.years,
      remaining: tuition * faculty.years,
      rate: 0.05,
      monthsLeft: 120,
      monthsTotal: 120,
      monthlyPayment: Math.round((tuition * faculty.years) / 120 * 1.15),
      startYear: gameYear(),
      loanType: 'student',
      linkedUni: uni.id
    });
    log('📚 Student loan taken: ' + money(tuition * faculty.years) + ' over 10 years.');
  } else {
    log('❌ Unknown payment mode.'); render(); return;
  }

  S.uni = {
    id: uni.id,
    name: uni.name,
    type: uni.type,
    city: uni.city,
    quality: uni.quality,
    tuition: uni.tuitionEGP,
    year: 0,
    yearsTotal: faculty.years,
    major: faculty.id,
    degree: faculty.degree,
    faculty: faculty.id,
    gpa: 3.0,
    semestersCompleted: 0,
    credits: 0,
    startedYear: gameYear(),
    paymentMode: paymentMode,
    isStudyAbroad: false
  };

  log('🎓 Enrolled in ' + faculty.label + ' at ' + uni.name + ' (' + paymentMode + ').');
  fx({ happiness: 15 });
  S.educationTab = 'studies';
  render();
}

/* ---------- ACTIVITY ENROLLMENT ---------- */
function eduJoinActivity(activityId) {
  const act = EDU_ACTIVITIES.find(function(a) { return a.id === activityId; });
  if (!act) return;
  if (!S.uni && !(S.age >= 6 && S.age <= 18)) {
    log('❌ Activities require school or university.'); render(); return;
  }
  if (S.educationActivities.indexOf(activityId) >= 0) {
    S.educationActivities = S.educationActivities.filter(function(a) { return a !== activityId; });
    log('Left ' + act.label + '.');
  } else {
    const cost = eduEGP(act.monthlyEGP * 12);
    if (S.wealth < cost) { log('❌ Cannot afford ' + act.label + ' (' + money(cost) + '/year).'); render(); return; }
    if (cost > 0) S.wealth -= cost;
    S.educationActivities.push(activityId);
    log('✅ Joined ' + act.label + ' (' + money(cost) + '/year).');
  }
  render();
}
window.eduJoinActivity = eduJoinActivity;

/* ---------- LANGUAGE TESTS ---------- */
function eduTakeLanguageTest(testId) {
  const test = EDU_LANGUAGE_TESTS.find(function(t) { return t.id === testId; });
  if (!test) return;
  const cost = eduUSD(test.costUSD);
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + ' for ' + test.label + '.'); render(); return; }
  S.wealth -= cost;

  /* Score based on smarts + school + random */
  let baseScore = 0.3 + (S.smarts / 200);
  if (S.school === 'igcse' || S.school === 'american' || S.school === 'ib' || S.school === 'boarding') baseScore += 0.20;
  else if (S.school === 'language' || S.school === 'private' || S.school === 'private_top') baseScore += 0.10;
  baseScore += Math.random() * 0.35;

  let score = Math.round(Math.min(1, baseScore) * test.maxScore * 10) / 10;
  
  /* German/French tests use integer scores in data, so round it */
  if (testId === 'goethe' || testId === 'delf') score = Math.round(score);

  if (!S.languageScores) S.languageScores = {};
  S.languageScores[testId] = Math.max(score, (S.languageScores[testId] || 0)); // Keep highest

  if (score >= test.passScore) {
    log('✅ ' + test.label + ': ' + score + ' — PASSED!');
    fx({ happiness: 8 });
  } else {
    log('❌ ' + test.label + ': ' + score + ' — Failed. Need ' + test.passScore + '+.');
    fx({ happiness: -4 });
  }
  render();
}
window.eduTakeLanguageTest = eduTakeLanguageTest;

/* ---------- SCHOLARSHIP APPLICATION ---------- */
function eduApplyScholarship(scholarshipId) {
  const sch = EDU_SCHOLARSHIPS.find(function(s) { return s.id === scholarshipId; });
  if (!sch) return;
  if (!S.uni && !S.degree && S.age < 17) { log('❌ Scholarships require high school completion or university enrollment.'); render(); return; }

  const gpa = eduComputeGPA();
  if (sch.requiresGPA && gpa < sch.requiresGPA && S.uni) {
    log('❌ GPA too low. Need ' + sch.requiresGPA + '+, you have ' + gpa.toFixed(2) + '.');
    render(); return;
  }
  if (sch.requiresIELTS && (S.languageScores?.ielts || 0) < sch.requiresIELTS) {
    log('❌ Need IELTS ' + sch.requiresIELTS + '+. You have ' + (S.languageScores?.ielts || 0) + '.');
    render(); return;
  }
  if (sch.requiresGerman && (S.languageScores?.goethe || 0) < sch.requiresGerman) {
    log('❌ Need German ' + sch.requiresGerman + '+. You have ' + (S.languageScores?.goethe || 0) + '.');
    render(); return;
  }
  if (sch.requiresFrench && (S.languageScores?.delf || 0) < sch.requiresFrench) {
    log('❌ Need French ' + sch.requiresFrench + '+. You have ' + (S.languageScores?.delf || 0) + '.');
    render(); return;
  }

  if (S.scholarshipApps.some(function(a) { return a.scholarshipId === scholarshipId; })) {
    log('❌ Already applied to ' + sch.name + '.');
    render(); return;
  }

  S.scholarshipApps.push({
    id: 'schapp_' + Math.random().toString(36).slice(2, 8),
    scholarshipId: scholarshipId,
    submittedYear: gameYear(),
    decisionYear: gameYear() + 1,
    status: 'pending'
  });
  log('📝 Applied to ' + sch.name + '. Decision in ~1 year.');
  render();
}
window.eduApplyScholarship = eduApplyScholarship;

/* ---------- STUDY ABROAD ---------- */
function eduApplyStudyAbroad(uniId, mode) {
  const uni = EDU_STUDY_ABROAD_UNIS.find(function(u) { return u.id === uniId; });
  if (!uni) return;

  /* Track Eligibility */
  if (uni.reqTrack !== 'any' && uni.reqTrack && uni.reqTrack.indexOf(S.educationTrack) < 0) {
     log('❌ Your high school track (' + S.educationTrack + ') is not accepted by this university.');
     render(); return;
  }

  /* Eligibility */
  if (uni.requiresIELTS && (S.languageScores?.ielts || 0) < uni.requiresIELTS) {
    log('❌ Need IELTS ' + uni.requiresIELTS + '+. You have ' + (S.languageScores?.ielts || 0) + '.');
    render(); return;
  }
  if (uni.requiresTOEFL && (S.languageScores?.toefl || 0) < uni.requiresTOEFL) {
    log('❌ Need TOEFL ' + uni.requiresTOEFL + '+. You have ' + (S.languageScores?.toefl || 0) + '.');
    render(); return;
  }
  if (uni.requiresGerman && (S.languageScores?.goethe || 0) < uni.requiresGerman) {
    log('❌ Need German B2 (Score 4+). You have ' + (S.languageScores?.goethe || 0) + '.');
    render(); return;
  }
  if (uni.requiresGPA && eduComputeGPA() < uni.requiresGPA && S.uni) {
    log('❌ GPA too low. Need ' + uni.requiresGPA + '+, you have ' + eduComputeGPA().toFixed(2) + '.');
    render(); return;
  }

  const appFee = eduUSD(100);
  if (S.wealth < appFee) { log('❌ Need ' + money(appFee) + ' application fee.'); render(); return; }
  S.wealth -= appFee;

  S.studyAbroadApps.push({
    id: 'abroadapp_' + Math.random().toString(36).slice(2, 8),
    uniId: uniId,
    uniName: uni.name,
    country: uni.country,
    mode: mode,  // 'self' | 'scholarship'
    tuitionUSD: uni.tuitionUSD,
    quality: uni.quality,
    submittedYear: gameYear(),
    decisionYear: gameYear() + 1,
    status: 'pending'
  });
  log('📝 Applied to ' + uni.name + ' (' + mode + '-funded). Decision in ~1 year.');
  render();
}
window.eduApplyStudyAbroad = eduApplyStudyAbroad;

/* ---------- INTERNSHIPS ---------- */
function eduApplyInternship(internId) {
  const intern = EDU_INTERNSHIPS.find(function(i) { return i.id === internId; });
  if (!intern) return;
  if (!S.uni && !S.degree) { log('❌ Internships require university enrollment or degree.'); render(); return; }
  if (intern.requiresMajor.length && intern.requiresMajor.indexOf(S.uni?.major || S.majorLabel) < 0) {
    log('❌ Your major is not eligible for this internship.');
    render(); return;
  }

  let chance = 0.40;
  if (eduComputeGPA() > 3.5) chance += 0.20;
  if (S.educationActivities.length > 2) chance += 0.15; // Extracurriculars help

  if (Math.random() < chance) {
    if (intern.paid) S.wealth += eduEGP(intern.monthlyEGP * intern.months);
    if (S.career && S.career.cv) S.career.cv.skill = Math.min(100, S.career.cv.skill + 10);
    log('✅ Got the internship at ' + intern.company + '! ' + (intern.paid ? 'Earned ' + money(eduEGP(intern.monthlyEGP * intern.months)) + '.' : 'Unpaid but great experience.'));
    fx({ happiness: 10 });
  } else {
    log('❌ Internship application rejected at ' + intern.company + '. Better luck next time.');
    fx({ happiness: -3 });
  }
  render();
}
window.eduApplyInternship = eduApplyInternship;

/* ---------- MAIN VIEW ---------- */
function schoolView() {
  ensureEducationState();
  if (!S) return '';

  const tabs = [
    ['overview', '📋 Overview'],
    ['studies', '🎓 Studies'],
    ['activities', '🎯 Activities'],
    ['languages', '🌍 Languages'],
    ['opportunities', '🏆 Opportunities'],
    ['events', '📖 Events']
  ];

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#f59e0b15 0%,transparent 100%);border-color:#f59e0b">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">EDUCATION · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + eduStatusLabel() + '</div></div>' +
    '<div style="font-size:2rem">🎓</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (S.educationTab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="eduSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

  if (S.educationTab === 'overview') html += eduRenderOverview();
  else if (S.educationTab === 'studies') html += eduRenderStudies();
  else if (S.educationTab === 'activities') html += eduRenderActivities();
  else if (S.educationTab === 'languages') html += eduRenderLanguages();
  else if (S.educationTab === 'opportunities') html += eduRenderOpportunities();
  else if (S.educationTab === 'events') html += eduRenderEvents();

  return html;
}

function eduStatusLabel() {
  if (S.degree) return 'Graduated · ' + S.degree;
  if (S.uni) return S.uni.major + ' at ' + S.uni.name + ' · Year ' + (S.uni.year + 1);
  if (S.school) return 'Student · ' + (eduSchoolById(S.school) || {}).label;
  return 'Not enrolled';
}

/* ---------- OVERVIEW ---------- */
function eduRenderOverview() {
  let html = '<div class="card"><h3>📋 Status</h3>' +
    '<div class="row"><span>Age</span><b>' + S.age + '</b></div>' +
    '<div class="row"><span>School</span><b>' + (S.school ? (eduSchoolById(S.school) || {}).label : 'Not enrolled') + '</b></div>' +
    (S.educationTrack ? '<div class="row"><span>Track</span><b>' + (eduTrackById(S.educationTrack) || {}).label + '</b></div>' : '') +
    (S.thanaweyaScore ? '<div class="row"><span>High School Score</span><b class="' + (S.thanaweyaScore >= 80 ? 'good' : S.thanaweyaScore >= 60 ? '' : 'bad') + '">' + S.thanaweyaScore.toFixed(1) + '%</b></div>' : '') +
    (S.uni ? '<div class="row"><span>University</span><b>' + S.uni.name + '</b></div>' : '') +
    (S.uni ? '<div class="row"><span>Major</span><b>' + (eduMajorById(S.uni.major) || {}).label + '</b></div>' : '') +
    (S.uni ? '<div class="row"><span>GPA</span><b>' + S.uni.gpa.toFixed(2) + ' / 4.0</b></div>' : '') +
    (S.degree ? '<div class="row"><span>Degree</span><b>' + S.degree + '</b></div>' : '') +
    '</div>';

  /* Pending decisions */
  if (S.age >= 6 && S.school === null) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">⚠️ Choose a School</h3>' +
      '<p class="muted small">You are 6. Time to enroll in school. Head to Studies tab.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="eduSetTab(\'studies\')">Choose school →</button></div>';
  }
  if (S.age >= 15 && S.school && !S.educationTrack && !S.uni && !S.degree) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">⚠️ Choose a Track</h3>' +
      '<p class="muted small">Time to choose: Thanaweya, A-levels, IB, or ACT. Head to Studies tab.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="eduSetTab(\'studies\')">Choose Track →</button></div>';
  }
  if (S.age >= 18 && !S.uni && !S.degree && S.thanaweyaScore) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">⚠️ University (Tansik)</h3>' +
      '<p class="muted small">Your score: <b>' + S.thanaweyaScore.toFixed(1) + '%</b>. Time to choose a university.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="eduSetTab(\'studies\')">Open tansik →</button></div>';
  }

  return html;
}

/* ---------- STUDIES ---------- */
function eduRenderStudies() {
  const age = S.age;

  /* Phase 1: Pick school (age 6+) */
  if (age >= 6 && age < 18 && !S.school && !S.thanaweyaScore) {
    let html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🏫 Choose Your School</h3>' +
      '<p class="muted small">Your family will pay the annual fees if you can afford them. Free public school or elite private.</p></div>';

    EDU_SCHOOLS.forEach(function(school) {
      const fee = eduEGP(school.annualEGP);
      let canAfford = fee === 0 || S.wealth >= fee;
      if(!canAfford){
          const familyWealth = eduFamilyWealth();
          if(familyWealth >= fee) canAfford = true;
      }
      
      html += '<div class="card" style="padding:10px;' + (canAfford ? '' : 'opacity:.5') + '">' +
        '<div style="display:flex;justify-content:space-between"><b>' + school.label + '</b><b>' + (fee === 0 ? 'Free' : money(fee) + '/yr') + '</b></div>' +
        '<div class="muted small">' + school.desc + '</div>' +
        '<div class="muted small">Smarts ×' + school.smartsMult + ' · English +' + school.englishBonus + '/yr · Social +' + school.socialBonus + '/yr</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:' + (canAfford ? '#fbbf24' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + ';font-weight:700" ' + (canAfford ? '' : 'disabled') + ' onclick="eduChooseSchool(\'' + school.id + '\')">' + (canAfford ? 'Enroll' : 'Cannot afford') + '</button>' +
        '</div>';
    });
    return html;
  }

  /* Phase 2: Track choice (age 15+) */
  if (age >= 15 && S.school && !S.educationTrack && !S.uni && !S.degree) {
    let html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">📚 Choose Your High School Track</h3>' +
      '<p class="muted small">This affects your university access and exam style.</p></div>';

    EDU_TRACKS.forEach(function(track) {
      const eligible = track.requiresSchool === 'any' || !track.requiresSchool || track.requiresSchool.indexOf(S.school) >= 0;
      const fee = eduEGP(track.annualEGP);
      let canAfford = fee === 0 || S.wealth >= fee;
      if(!canAfford){
          const familyWealth = eduFamilyWealth();
          if(familyWealth >= fee) canAfford = true;
      }
      
      const blocked = !eligible || !canAfford;
      let reason = '';
      if (!eligible) reason = 'Your school doesn\'t offer this';
      else if (!canAfford) reason = 'Cannot afford ' + money(fee) + '/yr';

      html += '<div class="card" style="padding:10px;' + (blocked ? 'opacity:.5' : '') + '">' +
        '<div style="display:flex;justify-content:space-between"><b>' + track.label + '</b><b>' + (fee === 0 ? 'Free' : money(fee) + '/yr') + '</b></div>' +
        '<div class="muted small">' + track.desc + '</div>' +
        '<div class="muted small">Base Tutoring Est: ' + money(eduEGP(track.tutoringCost)) + '</div>' +
        (blocked ? '<div class="bad small" style="margin-top:4px">' + reason + '</div>' : '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:#fbbf24;color:#000;font-weight:700" onclick="eduChooseTrack(\'' + track.id + '\')">Choose</button>') +
        '</div>';
    });
    return html;
  }
  
  /* Thanaweya Tutoring (Age 17-18) */
  if (S.educationTrack && !S.uni && !S.degree && !S.thanaweyaScore && !S.tutoring) {
      const track = eduTrackById(S.educationTrack);
      if(track && track.tutoringCost > 0){
          let html = '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">👨‍🏫 Private Tutoring (Darass Khososy)</h3>' +
            '<p class="muted small">High school exams are brutal. You need private tutors to guarantee a top score, but it is expensive and stressful.</p>' +
            '<div class="row"><span>Cost</span><b>' + money(eduEGP(track.tutoringCost)) + '</b></div>' +
            '<button class="opt" style="width:100%;margin-top:8px;font-weight:700" onclick="eduHireTutors()">Hire Private Tutors</button>' +
            '</div>';
          return html;
      }
  }

  /* Phase 3: University (age 18+, no uni yet, has score) */
  if (age >= 18 && !S.uni && !S.degree && S.thanaweyaScore) {
    return eduRenderTansik();
  }

  /* Phase 4: Enrolled in university */
  if (S.uni) {
    return eduRenderCurrentUni();
  }

  /* Phase 5: Graduated */
  if (S.degree) {
    return '<div class="card"><h3>🎓 Graduated</h3>' +
      '<div class="row"><span>Degree</span><b>' + S.degree + '</b></div>' +
      '<div class="row"><span>Major</span><b>' + (S.graduation?.majorLabel || S.majorLabel || '—') + '</b></div>' +
      '<div class="row"><span>University</span><b>' + (S.graduation?.uniName || '—') + '</b></div>' +
      '<div class="row"><span>Final GPA</span><b>' + (S.graduation?.gpa?.toFixed(2) || '—') + '</b></div>' +
      '<p class="muted small" style="margin-top:10px">Career unlocked. Head to Career tab to find work.</p>' +
      '</div>';
  }

  return '<div class="card"><h3>🎓 Studies</h3><p class="muted small">Nothing to do right now. Enjoy your youth.</p></div>';
}

function eduRenderTansik() {
  const score = S.thanaweyaScore || 0;
  let html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🎓 Tansik — University Placement</h3>' +
    '<div class="row"><span>Your high school score</span><b class="' + (score >= 80 ? 'good' : score >= 65 ? '' : 'bad') + '">' + score.toFixed(1) + '%</b></div>' +
    '<div class="row"><span>Track</span><b>' + (S.educationTrack ? (eduTrackById(S.educationTrack) || {}).label : '—') + '</b></div>' +
    '<div class="row"><span>Family wealth tier</span><b>' + S.familyTier + ' (' + money(eduFamilyWealth()) + ')</b></div>' +
    '<div class="row"><span>Your cash</span><b>' + money(S.wealth) + '</b></div>' +
    '</div>';

  /* Faculty selection */
  if (!S.uniPendingFaculty) {
    html += '<div class="card"><h3>Step 1 · Choose your Faculty</h3>' +
      '<p class="muted small">Public cutoffs apply. Private universities accept all majors above their min score.</p>';
    EDU_MAJORS.forEach(function(m) {
      const cutoff = eduCutoffFor(m.cutoffKey);
      const eligible = score >= cutoff;
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem;' + (eligible ? '' : 'opacity:.5') + '" ' + (eligible ? '' : 'disabled') + ' onclick="eduChoosePendingFaculty(\'' + m.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + m.label + '</b><span>' + (eligible ? 'Cutoff ' + cutoff + '% ✓' : 'Needs ' + cutoff + '%') + '</span></div>' +
        '<div class="muted small">' + m.years + ' years · ' + m.desc + '</div></button>';
    });
    html += '</div>';
    return html;
  }

  /* University selection */
  const facultyId = S.uniPendingFaculty;
  const faculty = eduMajorById(facultyId);
  const cutoff = eduCutoffFor(faculty.cutoffKey);

  html += '<div class="card"><h3>Step 2 · Choose your University</h3>' +
    '<div class="muted small">Faculty: <b>' + faculty.label + '</b> · Public cutoff: ' + cutoff + '% · Score: ' + score.toFixed(1) + '%</div>' +
    '<button class="opt" style="margin-top:6px;padding:4px 8px;font-size:.7rem" onclick="S.uniPendingFaculty=null;render()">← Change faculty</button></div>';

  /* ============ PUBLIC UNIVERSITIES ============ */
  const publics = EDU_UNIVERSITIES.filter(function(u) { return u.type === 'public'; });
  const privates = EDU_UNIVERSITIES.filter(function(u) { return u.type === 'private'; });

  html += '<div class="card" style="border-color:#22d3ee"><h3 style="color:#22d3ee">🏛 Public Universities</h3>' +
    '<p class="muted small">Low fees. Strict cutoff. Government-subsidized.</p>';
  publics.forEach(function(uni) {
    const tuition = eduEGP(uni.tuitionEGP);
    const meetsCutoff = score >= cutoff;
    const canPaySelf = S.wealth >= tuition;
    const canFamilyPay = eduFamilyWealth() >= tuition;

    html += '<div class="card" style="padding:10px;' + (meetsCutoff ? '' : 'opacity:.5') + '">' +
      '<div style="display:flex;justify-content:space-between"><b>' + uni.name + '</b><b>' + money(tuition) + '/yr</b></div>' +
      '<div class="muted small">' + uni.city + ' · Quality ' + uni.quality + '/10 · ' + faculty.years + ' years</div>' +
      (!meetsCutoff ? '<div class="bad small" style="margin-top:4px">Needs ' + cutoff + '% (you have ' + score.toFixed(1) + '%)</div>' :
        '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">' +
        (canPaySelf ? '<button class="opt" style="flex:1;padding:6px;font-size:.7rem;background:#34d399;color:#000;font-weight:700" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'self\')">Pay self</button>' :
          '<button class="opt" style="flex:1;padding:6px;font-size:.7rem;opacity:.4" disabled>No self funds</button>') +
        (canFamilyPay ? '<button class="opt" style="flex:1;padding:6px;font-size:.7rem;background:#fbbf24;color:#000;font-weight:700" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'family\')">Family pays</button>' :
          '<button class="opt" style="flex:1;padding:6px;font-size:.7rem;opacity:.4" disabled>Family can\'t afford</button>') +
        '</div>') +
      '</div>';
  });
  html += '</div>';

  /* ============ PRIVATE UNIVERSITIES ============ */
  html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">💼 Private Universities</h3>' +
    '<p class="muted small">High fees. Lower cutoffs (accept most scores above their min).</p>';
  privates.forEach(function(uni) {
    const tuition = eduEGP(uni.tuitionEGP);
    const minScore = uni.cutoffs || 50;
    const meetsMin = score >= minScore;
    const canPaySelf = S.wealth >= tuition;
    const canFamilyPay = eduFamilyWealth() >= tuition;
    const canLoan = true;

    html += '<div class="card" style="padding:10px;' + (meetsMin ? '' : 'opacity:.5') + '">' +
      '<div style="display:flex;justify-content:space-between"><b>' + uni.name + '</b><b>' + money(tuition) + '/yr</b></div>' +
      '<div class="muted small">' + uni.city + ' · Quality ' + uni.quality + '/10 · Min score ' + minScore + '% · ' + faculty.years + ' years</div>' +
      (!meetsMin ? '<div class="bad small" style="margin-top:4px">Needs ' + minScore + '% (you have ' + score.toFixed(1) + '%)</div>' :
        '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">' +
        (canPaySelf ? '<button class="opt" style="flex:1;padding:6px;font-size:.7rem;background:#34d399;color:#000;font-weight:700" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'self\')">Pay self</button>' :
          '<button class="opt" style="flex:1;padding:6px;font-size:.7rem;opacity:.4" disabled>No self funds</button>') +
        (canFamilyPay ? '<button class="opt" style="flex:1;padding:6px;font-size:.7rem;background:#fbbf24;color:#000;font-weight:700" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'family\')">Family pays</button>' :
          '<button class="opt" style="flex:1;padding:6px;font-size:.7rem;opacity:.4" disabled>Family can\'t afford</button>') +
        (canLoan ? '<button class="opt" style="flex:1;padding:6px;font-size:.7rem" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'loan\')">Student loan</button>' : '') +
        '</div>') +
      '</div>';
  });
  html += '</div>';

  return html;
}
window.eduChoosePendingFaculty = function(facultyId) {
  S.uniPendingFaculty = facultyId;
  render();
};

function eduRenderCurrentUni() {
  const u = S.uni;
  const major = eduMajorById(u.major);
  const progress = Math.round((u.year / u.yearsTotal) * 100);
  const gpaColor = u.gpa >= 3.5 ? 'good' : u.gpa >= 2.5 ? '' : 'bad';

  let html = '<div class="card"><h3>🎓 ' + u.name + '</h3>' +
    '<div class="row"><span>Faculty</span><b>' + (major ? major.label : u.major) + '</b></div>' +
    '<div class="row"><span>Year</span><b>' + (u.year + 1) + ' / ' + u.yearsTotal + '</b></div>' +
    '<div class="row"><span>Progress</span><b>' + progress + '%</b></div>' +
    '<div class="row"><span>GPA</span><b class="' + gpaColor + '">' + u.gpa.toFixed(2) + ' / 4.0</b></div>' +
    '<div class="row"><span>Tuition</span><b>' + money(eduEGP(u.tuition)) + '/year</b></div>' +
    '<div class="row"><span>Payment</span><b>' + u.paymentMode + '</b></div>' +
    '<div class="row"><span>Activities</span><b>' + S.educationActivities.length + ' enrolled</b></div>' +
    '</div>';

  /* Study hard button */
  if (S.examStress < 70) {
    html += '<div class="card"><button class="opt" style="width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="eduStudyHard()">📚 Study Hard (+GPA, +Stress)</button></div>';
  } else {
    html += '<div class="card"><p class="bad small" style="text-align:center">Stress too high. You might burn out.</p></div>';
  }

  /* Rest button */
  if (S.examStress > 20) {
    html += '<div class="card"><button class="opt" style="width:100%;text-align:center;border-color:#34d399;color:#34d399" onclick="eduRest()">😴 Hangout / Rest (-Stress, +Happiness)</button></div>';
  }

  return html;
}

window.eduStudyHard = function() {
  if (!S.uni) return;
  if (S.studyActionsThisYear >= 2) { log('⚠️ Already used your study focus twice this year.'); return; }
  S.studyActionsThisYear = (S.studyActionsThisYear || 0) + 1;
  S.examStress = Math.min(100, S.examStress + 20);
  S.uni.gpa = Math.min(4.0, S.uni.gpa + 0.15);
  fx({ happiness: -3, smarts: 2 });
  log('📚 Studied hard. GPA up, stress up.');
  render();
};

window.eduRest = function() {
  if (S.studyActionsThisYear >= 2) { log('⚠️ Already used your rest focus twice this year.'); return; }
  S.studyActionsThisYear = (S.studyActionsThisYear || 0) + 1;
  S.examStress = Math.max(0, S.examStress - 25);
  fx({ happiness: 5 });
  log('😴 Hung out with friends and rested. Stress down, happiness up.');
  render();
};

/* ---------- ACTIVITIES ---------- */
function eduRenderActivities() {
  const inSchool = (S.age >= 6 && S.age <= 25) || S.uni;
  if (!inSchool) {
    return '<div class="card"><h3>🎯 Activities</h3><p class="muted small">Activities available during school or university.</p></div>';
  }

  let html = '<div class="card"><h3>🎯 Clubs & Extra-Curriculars</h3>' +
    '<p class="muted small">Join clubs to boost stats and enhance your CV for future jobs.</p></div>';

  EDU_ACTIVITIES.forEach(function(act) {
    const enrolled = S.educationActivities.indexOf(act.id) >= 0;
    const cost = eduEGP(act.monthlyEGP * 12);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem;' + (enrolled ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="eduJoinActivity(\'' + act.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + act.label + (enrolled ? ' ✓' : '') + '</b><span>' + (cost === 0 ? 'Free' : money(cost) + '/yr') + '</span></div>' +
      '<div class="muted small">Social +' + (act.social || 0) + ' · Smarts +' + (act.smarts || 0) + ' · Happiness +' + (act.happiness || 0) + (act.leadership ? ' · Leadership' : '') + (act.cvBoost ? ' · CV Boost' : '') + '</div></button>';
  });

  return html;
}

/* ---------- LANGUAGES ---------- */
function eduRenderLanguages() {
  let html = '<div class="card"><h3>🌍 Language Certifications</h3>' +
    '<p class="muted small">Required for study abroad, scholarships, and international jobs.</p></div>';

  if (S.languageScores) {
    const anyScores = Object.keys(S.languageScores).filter(function(k) { return typeof S.languageScores[k] === 'number'; });
    if (anyScores.length) {
      html += '<div class="card"><h3>Your Scores</h3>';
      anyScores.forEach(function(testId) {
        const test = EDU_LANGUAGE_TESTS.find(function(t) { return t.id === testId; });
        if (!test) return;
        const score = S.languageScores[testId];
        const passed = score >= test.passScore;
        html += '<div class="row"><span>' + test.label + '</span><b class="' + (passed ? 'good' : 'bad') + '">' + score + ' / ' + test.maxScore + '</b></div>';
      });
      html += '</div>';
    }
  }

  html += '<div class="card"><h3>Register for a Test</h3>';
  EDU_LANGUAGE_TESTS.forEach(function(test) {
    const cost = eduUSD(test.costUSD);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="eduTakeLanguageTest(\'' + test.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + test.label + '</b><span>' + money(cost) + '</span></div>' +
      '<div class="muted small">' + test.desc + ' · Pass: ' + test.passScore + '+' + '</div></button>';
  });
  html += '</div>';

  return html;
}

/* ---------- OPPORTUNITIES ---------- */
function eduRenderOpportunities() {
  let html = '';

  /* Scholarships */
  html += '<div class="card"><h3>🏆 Scholarships & Grants</h3>' +
    '<p class="muted small">Full or partial funding for study abroad. Extremely competitive.</p></div>';
  EDU_SCHOLARSHIPS.forEach(function(sch) {
    const alreadyApplied = S.scholarshipApps.some(function(a) { return a.scholarshipId === sch.id && a.status === 'pending'; });
    const gpaOk = !sch.requiresGPA || eduComputeGPA() >= sch.requiresGPA;
    const ieltsOk = !sch.requiresIELTS || (S.languageScores?.ielts || 0) >= sch.requiresIELTS;
    const germanOk = !sch.requiresGerman || (S.languageScores?.goethe || 0) >= sch.requiresGerman;
    const frenchOk = !sch.requiresFrench || (S.languageScores?.delf || 0) >= sch.requiresFrench;
    const eligible = gpaOk && ieltsOk && germanOk && frenchOk;

    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.72rem;' + (alreadyApplied ? 'opacity:.5' : '') + '" ' + (alreadyApplied || !eligible ? 'disabled' : '') + ' onclick="eduApplyScholarship(\'' + sch.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + sch.name + '</b><span>Acceptance ' + Math.round(sch.acceptanceRate * 100) + '%</span></div>' +
      '<div class="muted small">' + sch.desc + '</div>' +
      (!eligible ? '<div class="bad small">' + (!gpaOk ? 'GPA ' + sch.requiresGPA + '+ required' : 'Language Requirements Not Met') + '</div>' : '') +
      (alreadyApplied ? '<div class="good small">✓ Application Submitted</div>' : '') +
      '</button>';
  });

  /* Study Abroad */
  html += '<div class="card" style="margin-top:12px"><h3>✈️ Study Abroad (Direct Application)</h3>' +
    '<p class="muted small">Apply to foreign universities directly. Requires language tests and heavy self-funding.</p></div>';
  EDU_STUDY_ABROAD_UNIS.forEach(function(uni) {
    const alreadyApplied = S.studyAbroadApps.some(function(a) { return a.uniId === uni.id && a.status === 'pending'; });
    const tuitionLocal = eduUSD(uni.tuitionUSD);
    const ieltsOk = !uni.requiresIELTS || (S.languageScores?.ielts || 0) >= uni.requiresIELTS;
    const toeflOk = !uni.requiresTOEFL || (S.languageScores?.toefl || 0) >= uni.requiresTOEFL;
    const germanOk = !uni.requiresGerman || (S.languageScores?.goethe || 0) >= uni.requiresGerman;
    const frenchOk = !uni.requiresFrench || (S.languageScores?.delf || 0) >= uni.requiresFrench;
    const gpaOk = !uni.requiresGPA || eduComputeGPA() >= uni.requiresGPA;
    const trackOk = uni.reqTrack === 'any' || (S.educationTrack && uni.reqTrack && uni.reqTrack.indexOf(S.educationTrack) >= 0);
    const eligible = ieltsOk && toeflOk && gpaOk && germanOk && frenchOk && trackOk;

    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.72rem;' + (alreadyApplied ? 'opacity:.5' : '') + '" ' + (alreadyApplied || !eligible ? 'disabled' : '') + ' onclick="eduApplyStudyAbroad(\'' + uni.id + '\',\'self\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + uni.name + '</b><span>' + money(tuitionLocal) + '/yr</span></div>' +
      '<div class="muted small">' + uni.country.toUpperCase() + ' · Quality ' + uni.quality + '/10</div>' +
      (!eligible ? '<div class="bad small">' + (!gpaOk ? 'GPA ' + uni.requiresGPA + '+ required' : !trackOk ? 'Invalid High School Track' : 'Language test required') + '</div>' : '') +
      (alreadyApplied ? '<div class="good small">✓ Applied</div>' : '') +
      '</button>';
  });

  /* Internships */
  if (S.uni) {
    html += '<div class="card" style="margin-top:12px"><h3>💼 Internships</h3><p class="muted small">Build your CV while in University.</p></div>';
    EDU_INTERNSHIPS.forEach(function(intern) {
      const eligible = !intern.requiresMajor.length || intern.requiresMajor.indexOf(S.uni.major) >= 0;
      if (!eligible) return;
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.72rem" onclick="eduApplyInternship(\'' + intern.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + intern.company + '</b><span>' + (intern.paid ? money(eduEGP(intern.monthlyEGP)) + '/mo' : 'Unpaid') + '</span></div>' +
        '<div class="muted small">' + intern.label + ' · ' + intern.months + ' months</div></button>';
    });
  }

  return html;
}

/* ---------- EVENTS ---------- */
function eduRenderEvents() {
  const pending = S.educationEvents || [];
  if (!pending.length) {
    return '<div class="card"><h3>📖 Educational Timeline</h3><p class="muted small">No pending events. Events fire randomly through school and university.</p></div>';
  }
  let html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">📖 Recent Events</h3></div>';
  pending.slice(-15).reverse().forEach(function(ev) {
    html += '<div class="card" style="padding:10px; margin-bottom:4px">' +
      '<div style="font-weight:700">' + ev.title + ' <span class="muted small mono float-right">' + (ev.year || '') + '</span></div>' +
      '<div class="muted small" style="margin-top:4px">' + ev.text + '</div>' +
      '</div>';
  });
  return html;
}

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureEducationState();
  if (!S) return;
  const year = gameYear();
  /* Force school enrollment: if age 7+ and still no school, auto-assign by family wealth */
  if (S.age >= 7 && S.age < 18 && !S.school && !S.thanaweyaScore) {
    const famW = eduFamilyWealth();
    let autoSchool = 'national';
    if (famW >= 50000000) autoSchool = 'ib';
    else if (famW >= 5000000) autoSchool = 'igcse';
    else if (famW >= 600000) autoSchool = 'private';
    else if (famW >= 80000) autoSchool = 'language';

    S.school = autoSchool;
    const schDef = eduSchoolById(autoSchool);
    log('📚 Your family enrolled you in ' + (schDef ? schDef.label : autoSchool) + '.');
  }

  /* ===== SCHOOL PHASE (6-18) ===== */
  if (S.school && S.age >= 6 && S.age < 18) {
    /* School annual fee */
    const schoolFee = eduGetCurrentSchoolFee();
    if (schoolFee > 0) {
      if (S.wealth >= schoolFee) {
        S.wealth -= schoolFee;
      } else {
         /* Family Help */
         const familyWealth = eduFamilyWealth();
         if(familyWealth >= schoolFee){
             // Family pays silently
         } else {
             log('⚠️ Could not pay school fees. Moving to National School.');
             S.school = 'national';
         }
      }
    }

    /* Track Fees (if selected early) */
    if (S.educationTrack) {
        const track = eduTrackById(S.educationTrack);
        if(track){
            const trackFee = eduEGP(track.annualEGP);
            if(trackFee > 0){
               if(S.wealth >= trackFee) S.wealth -= trackFee;
               // else family pays or drops (simplified for now)
            }
        }
    }

    /* Smarts & English & Social growth */
    const schoolDef = eduSchoolById(S.school);
    if (schoolDef) {
      S.smarts = Math.min(100, S.smarts + Math.round(schoolDef.smartsMult * 2));
      S.social = Math.min(100, S.social + Math.round(schoolDef.socialBonus * 0.5));
    }
    
    /* Thanaweya Stress (Ages 16-18) */
    if(S.age >= 16 && S.age <= 18) {
        S.examStress = Math.min(100, S.examStress + 10);
        if(S.tutoring) S.smarts = Math.min(100, S.smarts + 5);
    }

    /* Random school events */
    if (Math.random() < 0.35) {
      const eligible = EDU_SCHOOL_EVENTS.filter(function(e) {
        return S.age >= e.minAge && S.age <= e.maxAge;
      });
      if (eligible.length) {
        const totalW = eligible.reduce(function(s, e) { return s + e.weight; }, 0);
        let roll = Math.random() * totalW;
        for (let i = 0; i < eligible.length; i++) {
          roll -= eligible[i].weight;
          if (roll <= 0) {
            log('📖 ' + eligible[i].title + ': ' + eligible[i].text);
            S.educationEvents.push({year: year, title: eligible[i].title, text: eligible[i].text});
            break;
          }
        }
      }
    }
  }
  /* Auto-assign track if age 16 and no track chosen yet */
  if (S.age >= 16 && S.age < 18 && S.school && !S.educationTrack && !S.uni && !S.degree) {
    const famW = eduFamilyWealth();
    let autoTrack = 'thanaweya';
    if (S.school === 'igcse' || S.school === 'ib') {
      autoTrack = famW >= 250000 ? 'ib' : 'alevels';
    } else if (S.school === 'american') {
      autoTrack = 'act';
    } else if (S.school === 'national' || S.school === 'language') {
      autoTrack = (S.smarts >= 85 && famW >= 3000) ? 'stem_school' : 'thanaweya';
    } else if (S.school === 'private' || S.school === 'private_top') {
      autoTrack = 'thanaweya';
    }
    S.educationTrack = autoTrack;
    const tDef = eduTrackById(autoTrack);
    log('📖 Your family placed you in the ' + (tDef ? tDef.label : autoTrack) + ' track.');
  }

  /* ===== THANAWEYA GENERATION (age 18) ===== */
  if (S.age >= 18 && !S.thanaweyaScore) {
      /* Base score on smarts */
      let baseScore = 30 + (S.smarts * 0.5); 
      
      /* Modify by track */
      const track = eduTrackById(S.educationTrack);
      if (track && track.thanaweyaBonus) {
        baseScore += track.thanaweyaBonus;
      }
      
      /* Modify by tutoring */
      if(S.tutoring) baseScore += 12;
      
      /* Random variance */
      baseScore += (Math.random() * 10) - 5;
      
      S.thanaweyaScore = Math.max(50, Math.min(100, baseScore));
      
      log('🎯 High School Exams finished! You scored ' + S.thanaweyaScore.toFixed(1) + '%');
      S.educationEvents.push({year: year, title: 'High School Graduation', text: 'Scored ' + S.thanaweyaScore.toFixed(1) + '%'});
  }

   /* ===== ACTIVITIES (applies during school OR uni) ===== */
  if (S.educationActivities && S.educationActivities.length > 0) {
    S.educationActivities.forEach(function(actId) {
      const act = EDU_ACTIVITIES.find(function(a) { return a.id === actId; });
      if (!act) return;
      if (act.social) S.social = Math.min(100, S.social + Math.round(act.social * 0.3));
      if (act.smarts) S.smarts = Math.min(100, S.smarts + Math.round(act.smarts * 0.3));
      if (act.happiness) fx({ happiness: Math.round(act.happiness * 0.2) });
      if (act.cvBoost && S.career && S.career.cv) S.career.cv.skill = Math.min(100, S.career.cv.skill + 2);
    });
  }

  /* ===== UNIVERSITY PHASE ===== */
  if (S.uni) {
    /* Tuition */
    if (S.uni.paymentMode === 'self' && (S.uni.type === 'private' || S.uni.type === 'study_abroad')) {
      const fee = eduEGP(S.uni.tuition);
      if (S.wealth >= fee) S.wealth -= fee;
      else {
          log('⚠️ Cannot pay University tuition. GPA penalty applied.');
          S.uni.gpa = Math.max(0, S.uni.gpa - 0.5);
      }
    }
    /* Year advances */
    S.uni.year++;
    S.uni.semestersCompleted += 2;

    /* Random GPA change */
    let gpaDelta = (Math.random() - 0.4) * 0.3;
    if (S.examStress > 80) {
        gpaDelta -= 0.3;
        log('⚠️ High stress is severely hurting your academic performance.');
    }
    S.uni.gpa = Math.max(0, Math.min(4.0, S.uni.gpa + gpaDelta));

    /* Random university events */
    if (Math.random() < 0.40) {
      const eligible = EDU_UNIVERSITY_EVENTS.filter(function(e) {
        return S.age >= e.minAge && S.age <= e.maxAge;
      });
      if (eligible.length) {
        const totalW = eligible.reduce(function(s, e) { return s + e.weight; }, 0);
        let roll = Math.random() * totalW;
        for (let i = 0; i < eligible.length; i++) {
          roll -= eligible[i].weight;
          if (roll <= 0) {
            log('📖 ' + eligible[i].title + ': ' + eligible[i].text);
            S.educationEvents.push({year: year, title: eligible[i].title, text: eligible[i].text});
            break;
          }
        }
      }
    }

    /* Graduation */
    if (S.uni.year >= S.uni.yearsTotal) {
      S.degree = S.uni.degree || 'general';
      S.majorLabel = (eduMajorById(S.uni.major) || {}).label || S.uni.major;
      S.majorId = S.uni.major;
      log('🎓 Graduated from ' + S.uni.name + ' with a degree in ' + S.majorLabel + '. Final GPA: ' + S.uni.gpa.toFixed(2) + '.');
      fx({ happiness: 20, smarts: 5 });
      S.educationEvents.push({year: year, title: 'University Graduation', text: 'Graduated from ' + S.uni.name + ' with GPA ' + S.uni.gpa.toFixed(2)});
      S.graduation = {
        uniId: S.uni.id,
        uniName: S.uni.name,
        major: S.uni.major,
        majorLabel: S.majorLabel,
        gpa: S.uni.gpa,
        degree: S.degree,
        year: year,
        isStudyAbroad: S.uni.isStudyAbroad || false
      };
      S.uni = null;
    }
  }
  /* ===== SCHOLARSHIP DECISIONS ===== */
  S.scholarshipApps = S.scholarshipApps.filter(function(app) {
    if (app.decisionYear > year) return true;
    const sch = EDU_SCHOLARSHIPS.find(function(s) { return s.id === app.scholarshipId; });
    if (!sch) return false;
    
    /* Modify acceptance rate based on GPA & Smarts */
    let chance = sch.acceptanceRate;
    if(eduComputeGPA() > 3.8) chance += 0.05;
    if(S.smarts > 90) chance += 0.05;
    if(S.educationActivities.length > 2) chance += 0.05; // Extracurriculars
    
    if (Math.random() < chance) {
      log('🎉 WON ' + sch.name + '! Full scholarship granted.');
      fx({ happiness: 30 });
      S.wealth += eduEGP(200000); // Initial scholarship stipend bonus
      S.educationEvents.push({year: year, title: 'Scholarship Won', text: 'Awarded ' + sch.name});
      
      /* Redirect to study abroad flow if international */
      if (sch.country !== 'egy') {
        log('✈️ You can now use this scholarship to fund Study Abroad. Check the Opportunities tab.');
        // Simplified: auto-flag for study abroad logic if they apply to a uni in that country
      }
    } else {
      log('❌ Not selected for ' + sch.name + '.');
      fx({ happiness: -5 });
    }
    return false;
  });

  /* ===== STUDY ABROAD DECISIONS ===== */
  S.studyAbroadApps = S.studyAbroadApps.filter(function(app) {
    if (app.decisionYear > year) return true;
    const uni = EDU_STUDY_ABROAD_UNIS.find(function(u) { return u.id === app.uniId; });
    if (!uni) return false;
    
    /* Acceptance based on GPA vs required */
    const gpa = eduComputeGPA();
    let chance = 0.4 + (gpa - uni.requiresGPA) * 0.4;
    chance = Math.max(0.05, Math.min(0.95, chance));
    
    if (Math.random() < chance) {
      log('🎉 ADMITTED to ' + uni.name + ' in ' + uni.country.toUpperCase() + '!');
      fx({ happiness: 25 });
      S.educationEvents.push({year: year, title: 'Study Abroad Admission', text: 'Admitted to ' + uni.name});
      
      /* Enroll as study abroad uni */
      S.studyAbroad = {
        country: app.country,
        university: uni.name,
        uniId: uni.id,
        tuitionUSD: uni.tuitionUSD,
        mode: app.mode,
        startedYear: year
      };
      
            /* Do NOT change S.country — immigration system handles formal moves.
         Player is still a citizen of home country, just studying abroad. */
      log('✈️ You are attending ' + uni.name + ' in ' + uni.country.toUpperCase() + ' on a student visa.');
      S.uni = {
        id: uni.id,
        name: uni.name,
        type: 'study_abroad',
        city: app.country.toUpperCase(),
        quality: uni.quality,
        tuition: uni.tuitionUSD * eduRate(),  // store EGP equivalent roughly
        year: 0,
        yearsTotal: 4,
        major: 'general',
        degree: 'general',
        faculty: 'general',
        gpa: 3.0,
        semestersCompleted: 0,
        credits: 0,
        startedYear: year,
        paymentMode: app.mode,
        isStudyAbroad: true
      };
    } else {
      log('❌ Not admitted to ' + uni.name + '. Competition was fierce.');
      fx({ happiness: -8 });
    }
    return false;
  });

   /* ===== EXAM STRESS NATURAL DECAY ===== */
  S.examStress = Math.max(0, S.examStress - 10);

  /* ===== RESET STUDY COOLDOWN ===== */
  S.studyActionsThisYear = 0;
});

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'school', label: '🎓 Education', order: 1, view: schoolView });
