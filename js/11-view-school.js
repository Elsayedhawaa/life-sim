/* ============================================================
   VIEW: EDUCATION (clean rewrite, all fixes applied)
   ============================================================
   Registers tab 'school' at order 1.
   Data required: js/13-data-education.js (EDU_* arrays)
   ============================================================ */

/* ---------- STATE ---------- */
function ensureEducationState() {
  if (!S) return;
  if (S.school === 'private' && !EDU_SCHOOLS.some(function(s) { return s.id === 'private'; })) S.school = 'language';
  if (S.school === 'international') S.school = 'igcse';

  if (typeof S.educationTrack === 'undefined') S.educationTrack = null;
  if (!Array.isArray(S.educationEvents)) S.educationEvents = [];
  if (!Array.isArray(S.educationActivities)) S.educationActivities = [];
  if (!Array.isArray(S.scholarshipApps)) S.scholarshipApps = [];
  if (!Array.isArray(S.studyAbroadApps)) S.studyAbroadApps = [];
  if (typeof S.studyAbroad === 'undefined') S.studyAbroad = null;
  if (typeof S.examStress !== 'number') S.examStress = 0;
  if (typeof S.studyActionsThisYear !== 'number') S.studyActionsThisYear = 0;
  if (!Array.isArray(S.schoolHistory)) S.schoolHistory = [];
  if (!S.educationTab) S.educationTab = 'overview';
  if (typeof S.tutoring === 'undefined') S.tutoring = false;
  if (typeof S.graduation === 'undefined') S.graduation = null;
  if (!S.languageScores) S.languageScores = {};

  if (S.uni && typeof S.uni.gpa !== 'number') {
    S.uni.gpa = 3.0;
    S.uni.semestersCompleted = S.uni.year || 0;
    S.uni.city = S.uni.city || 'Cairo';
    S.uni.quality = S.uni.quality || 7;
    S.uni.faculty = S.uni.faculty || S.uni.major || 'general';
    S.uni.credits = 0;
    S.uni.startedYear = S.uni.startedYear || (gameYear() - (S.uni.year || 0));
  }

  /* Reconstruct graduation data for old saves that finished university */
  if (S.degree && !S.graduation) {
    var reconstructed = {
      uniName: (S.uni && S.uni.name) || S.graduatedFrom || 'Unknown University',
      majorLabel: S.majorLabel || S.majorId || (S.degree.charAt(0).toUpperCase() + S.degree.slice(1)),
      gpa: (S.uni && S.uni.gpa) || (typeof S.finalGpa === 'number' ? S.finalGpa : 0),
      degree: S.degree,
      year: (S.uni && S.uni.startedYear ? S.uni.startedYear + (S.uni.yearsTotal || 4) : gameYear() - 1),
      isStudyAbroad: false
    };
    if (S.uni) {
      reconstructed.uniName = S.uni.name || 'Unknown University';
      reconstructed.gpa = S.uni.gpa || 0;
      reconstructed.majorLabel = (typeof eduMajorById === 'function' && S.uni.major)
        ? ((eduMajorById(S.uni.major) || {}).label || S.uni.major)
        : (S.uni.major || S.degree);
      S.uni = null;
    }
    S.graduation = reconstructed;
  }
}
GameHooks.on('newGame', ensureEducationState);
GameHooks.on('migrate', ensureEducationState);

/* ---------- HELPERS ---------- */
var EDU_EGP_BASE_RATE = 52.7;

function eduRate() { return C().rate || 1; }

function eduEGP(n) {
  var localRate = C().rate || 1;
  if (localRate === EDU_EGP_BASE_RATE) return Math.round(n || 0);
  return Math.round((n || 0) * (localRate / EDU_EGP_BASE_RATE));
}

function eduUSD(n) { return Math.round((n || 0) * eduRate()); }

function eduFamilyWealth() {
  var map = {
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
  var school = eduSchoolById(S.school);
  return school ? eduEGP(school.annualEGP) : 0;
}

function eduComputeGPA() { 
  if (S.uni && typeof S.uni.gpa === 'number') return S.uni.gpa;
  if (S.degree && S.graduation && S.graduation.gpa) return S.graduation.gpa;
  // Convert Thanaweya/IB score to 4.0 scale for high school applicants
  if (S.thanaweyaScore) return (S.thanaweyaScore / 100) * 4.0;
  return 0; 
}
function eduTrackEligible(track) {
  if (!track || !track.requiresSchool) return true;
  if (!S.school) return false;
  return track.requiresSchool.indexOf(S.school) >= 0;
}

/* ---------- SCHOOL ACTIONS ---------- */
function eduChooseSchool(schoolId) {
  var school = eduSchoolById(schoolId);
  if (!school) return;
  var fee = eduEGP(school.annualEGP);
  if (fee > 0) {
    if (S.wealth >= fee) {
      S.wealth -= fee;
    } else if (eduFamilyWealth() >= fee) {
      log('👨‍👩‍👧 Your family paid your school fees (' + money(fee) + '/year).');
    } else {
      log('❌ Cannot afford ' + school.label + ' (' + money(fee) + '/year).');
      render(); return;
    }
  }
  S.school = schoolId;
  S.schoolHistory.push({ year: gameYear(), school: schoolId });
  S.flags.evt_school_choice = true;
  log('🎓 Enrolled in ' + school.label + ' (' + (fee > 0 ? money(fee) + '/year' : 'free') + ').');
  fx({ happiness: 3, smarts: 2 });
  render();
}
window.eduChooseSchool = eduChooseSchool;

function eduChooseTrack(trackId) {
  var track = eduTrackById(trackId);
  if (!track) return;
  if (!eduTrackEligible(track)) {
    log('❌ Your current school does not offer ' + track.label + '.');
    render(); return;
  }
  var fee = eduEGP(track.annualEGP);
  if (fee > 0) {
    if (S.wealth >= fee) {
      S.wealth -= fee;
    } else if (eduFamilyWealth() >= fee) {
      log('👨‍👩‍👧 Your family paid the ' + track.label + ' fee (' + money(fee) + '/year).');
    } else {
      log('❌ Cannot afford ' + track.label + ' (' + money(fee) + '/year).');
      render(); return;
    }
  }
  S.educationTrack = trackId;
  log('📚 Track: ' + track.label + (fee > 0 ? ' · ' + money(fee) + '/year' : ' (free)') + '.');
  fx({ happiness: 2, smarts: 3 });
  render();
}
window.eduChooseTrack = eduChooseTrack;

window.eduHireTutors = function() {
  if (!S.educationTrack || S.tutoring) return;
  var track = eduTrackById(S.educationTrack);
  if (!track) return;
  var cost = eduEGP(track.tutoringCost);
  if (cost === 0) { log('Tutoring not needed for this track.'); return; }
  if (S.wealth >= cost) {
    S.wealth -= cost;
  } else if (eduFamilyWealth() >= cost) {
    log('👨‍👩‍👧 Your family paid for private tutors.');
  } else {
    log('❌ Cannot afford private tutoring (' + money(cost) + ').');
    render(); return;
  }
  S.tutoring = true;
  S.examStress = Math.min(100, S.examStress + 15);
  log('👨‍🏫 Hired private tutors for ' + money(cost) + '.');
  render();
};

/* ---------- UNIVERSITY ACTIONS ---------- */
function eduApplyToUni(uniId, facultyId, paymentMode) {
  var uni = eduUniById(uniId);
  var faculty = eduMajorById(facultyId);
  if (!uni || !faculty) return;

  var score = S.thanaweyaScore || 0;
  var cutoff = eduCutoffFor(faculty.cutoffKey);

  if (uni.type === 'public' && score < cutoff) {
    log('❌ Score ' + score.toFixed(1) + '% is below the ' + cutoff + '% cutoff.');
    render(); return;
  }
  if (uni.type === 'private' && uni.cutoffs && score < uni.cutoffs) {
    log('❌ Score below ' + uni.name + "'s minimum of " + uni.cutoffs + '%.');
    render(); return;
  }

  var tuition = eduEGP(uni.tuitionEGP);

  if (paymentMode === 'self') {
    if (S.wealth < tuition) { log('❌ Cannot afford ' + money(tuition) + '/year.'); render(); return; }
    S.wealth -= tuition;
    log('💸 Paid ' + money(tuition) + ' first year tuition.');
  } else if (paymentMode === 'family') {
    if (eduFamilyWealth() < tuition) {
      log('❌ Family cannot afford ' + money(tuition) + '/year (tier: ' + S.familyTier + ').');
      render(); return;
    }
    log('👨‍👩‍👧 Family paying ' + money(tuition) + '/year.');
    // The family pays directly, S.wealth is not deducted
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
    log('📚 Student loan: ' + money(tuition * faculty.years) + ' over 10 years.');
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
  S.uniPendingFaculty = null;

  log('🎓 Enrolled in ' + faculty.label + ' at ' + uni.name + ' (' + paymentMode + ').');
  fx({ happiness: 15 });
  S.educationTab = 'studies';
  render();
}
window.eduApplyToUni = eduApplyToUni;

window.eduChoosePendingFaculty = function(facultyId) {
  S.uniPendingFaculty = facultyId;
  render();
};

/* ---------- ACTIVITIES ---------- */
function eduJoinActivity(activityId) {
  var act = EDU_ACTIVITIES.find(function(a) { return a.id === activityId; });
  if (!act) return;
  if (!S.uni && !(S.age >= 6 && S.age <= 18)) {
    log('❌ Activities require school or university.'); render(); return;
  }
  if (S.educationActivities.indexOf(activityId) >= 0) {
    S.educationActivities = S.educationActivities.filter(function(a) { return a !== activityId; });
    log('Left ' + act.label + '.');
  } else {
    var cost = eduEGP(act.monthlyEGP * 12);
    if (S.wealth < cost) { log('❌ Cannot afford ' + act.label + ' (' + money(cost) + '/year).'); render(); return; }
    if (cost > 0) S.wealth -= cost;
    S.educationActivities.push(activityId);
    log('✅ Joined ' + act.label + (cost > 0 ? ' (' + money(cost) + '/year)' : '') + '.');
  }
  render();
}
window.eduJoinActivity = eduJoinActivity;

/* ---------- LANGUAGE TESTS ---------- */
function eduTakeLanguageTest(testId) {
  var test = EDU_LANGUAGE_TESTS.find(function(t) { return t.id === testId; });
  if (!test) return;
  var cost = eduUSD(test.costUSD);
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + '.'); render(); return; }
  S.wealth -= cost;

  var baseScore = 0.3 + (S.smarts / 200);
  if (S.school === 'igcse' || S.school === 'american' || S.school === 'ib' || S.school === 'boarding') baseScore += 0.20;
  else if (S.school === 'language' || S.school === 'private' || S.school === 'private_top') baseScore += 0.10;
  baseScore += Math.random() * 0.35;

  var score = Math.round(Math.min(1, baseScore) * test.maxScore * 10) / 10;
  if (testId === 'goethe' || testId === 'delf') score = Math.round(score);

  S.languageScores[testId] = Math.max(score, (S.languageScores[testId] || 0));
  if (score >= test.passScore) {
    log('✅ ' + test.label + ': ' + score + ' — PASSED!');
    fx({ happiness: 8 });
  } else {
    log('❌ ' + test.label + ': ' + score + ' — Failed (need ' + test.passScore + '+).');
    fx({ happiness: -4 });
  }
  render();
}
window.eduTakeLanguageTest = function(testId) {
  var test = EDU_LANGUAGE_TESTS.find(function(t) { return t.id === testId; });
  if (!test) return;
  var cost = eduUSD(test.costUSD);
  var paidByFamily = false;

  if (S.wealth < cost) {
    var famWealth = typeof getFamilyWealthEGP === 'function' ? getFamilyWealthEGP() : 3000000;
    var costEGP = cost * 52.7;
    if (famWealth > costEGP * 2) {
       if (confirm('You don\'t have enough cash. Your family will pay the ' + money(cost) + ' for the test. Proceed?')) {
         paidByFamily = true;
       } else { render(); return; }
    } else {
       log('❌ Need ' + money(cost) + '.'); render(); return;
    }
  } else {
    S.wealth -= cost;
  }

  var baseScore = 0.3 + (S.smarts / 200);
  if (S.school === 'igcse' || S.school === 'american' || S.school === 'ib' || S.school === 'boarding') baseScore += 0.20;
  else if (S.school === 'language' || S.school === 'private' || S.school === 'private_top') baseScore += 0.10;
  baseScore += Math.random() * 0.35;

  var score = Math.round(Math.min(1, baseScore) * test.maxScore * 10) / 10;
  if (testId === 'goethe' || testId === 'delf') score = Math.round(score);

  S.languageScores[testId] = Math.max(score, (S.languageScores[testId] || 0));
  if (paidByFamily) log('👨‍👩‍👧 Your family paid the ' + test.label + ' fee.');
  if (score >= test.passScore) {
    log('✅ ' + test.label + ': ' + score + ' — PASSED!');
    fx({ happiness: 8 });
  } else {
    log('❌ ' + test.label + ': ' + score + ' — Failed (need ' + test.passScore + '+).');
    fx({ happiness: -4 });
  }
  render();
};

/* ---------- SCHOLARSHIP ---------- */
function eduApplyScholarship(scholarshipId) {
  var sch = EDU_SCHOLARSHIPS.find(function(s) { return s.id === scholarshipId; });
  if (!sch) return;
  if (!S.uni && !S.degree && S.age < 17) { log('❌ Need high school completion or university.'); render(); return; }

  var gpa = eduComputeGPA();
  if (sch.requiresGPA && gpa < sch.requiresGPA && S.uni) {
    log('❌ GPA too low (need ' + sch.requiresGPA + '+).'); render(); return;
  }
  if (sch.requiresIELTS && (S.languageScores.ielts || 0) < sch.requiresIELTS) {
    log('❌ Need IELTS ' + sch.requiresIELTS + '+.'); render(); return;
  }
  if (sch.requiresGerman && (S.languageScores.goethe || 0) < sch.requiresGerman) {
    log('❌ Need German B' + sch.requiresGerman + '+.'); render(); return;
  }
  if (sch.requiresFrench && (S.languageScores.delf || 0) < sch.requiresFrench) {
    log('❌ Need French B' + sch.requiresFrench + '+.'); render(); return;
  }
  if (S.scholarshipApps.some(function(a) { return a.scholarshipId === scholarshipId; })) {
    log('❌ Already applied.'); render(); return;
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
  var uni = EDU_STUDY_ABROAD_UNIS.find(function(u) { return u.id === uniId; });
  if (!uni) return;

  if (uni.reqTrack && uni.reqTrack !== 'any') {
    if (Array.isArray(uni.reqTrack) && uni.reqTrack.indexOf(S.educationTrack) < 0) {
      log('❌ Your track (' + S.educationTrack + ') not accepted.'); render(); return;
    }
  }
  if (uni.requiresIELTS && (S.languageScores.ielts || 0) < uni.requiresIELTS) {
    log('❌ Need IELTS ' + uni.requiresIELTS + '+.'); render(); return;
  }
  if (uni.requiresTOEFL && (S.languageScores.toefl || 0) < uni.requiresTOEFL) {
    log('❌ Need TOEFL ' + uni.requiresTOEFL + '+.'); render(); return;
  }
  if (uni.requiresGerman && (S.languageScores.goethe || 0) < uni.requiresGerman) {
    log('❌ Need German B' + uni.requiresGerman + '+.'); render(); return;
  }
  if (uni.requiresFrench && (S.languageScores.delf || 0) < uni.requiresFrench) {
    log('❌ Need French B' + uni.requiresFrench + '+.'); render(); return;
  }
  if (uni.requiresGPA && eduComputeGPA() < uni.requiresGPA && S.uni) {
    log('❌ GPA too low (need ' + uni.requiresGPA + '+).'); render(); return;
   }
     if (typeof isBannedFrom === 'function') {
    var _ban = isBannedFrom(uni.country);
    if (_ban) {
      log('🚫 You are banned from ' + (COUNTRIES[uni.country] ? COUNTRIES[uni.country].name : uni.country) + ' for another ' + _ban.yearsLeft + ' year' + (_ban.yearsLeft > 1 ? 's' : '') + '.');
      render(); 
       return;
    }
  }

  var appFee = eduUSD(100);
   
  if (S.wealth < appFee) { log('❌ Need ' + money(appFee) + ' application fee.'); render(); return; }
  S.wealth -= appFee;

  /* Pick a major */
  var majorOpts = (typeof STUDY_ABROAD_MAJORS !== 'undefined') ? STUDY_ABROAD_MAJORS : ['cs','engineering','business','medicine','law','economics','finance','architecture','psychology','nursing'];
  var majorList = majorOpts.map(function(mid, i) {
    var m = (typeof EDU_MAJORS !== 'undefined') ? EDU_MAJORS.find(function(x) { return x.id === mid; }) : null;
    return (i + 1) + '. ' + (m ? m.label : mid);
  }).join('\n');
  var pickMajor = prompt('Choose your major:\n\n' + majorList + '\n\nEnter number:', '1');
  if (!pickMajor) { render(); return; }
  var majorIdx = parseInt(pickMajor, 10) - 1;
  if (majorIdx < 0 || majorIdx >= majorOpts.length) { log('❌ Invalid major.'); render(); return; }
  var chosenMajor = majorOpts[majorIdx];

  S.studyAbroadApps.push({
    id: 'abroadapp_' + Math.random().toString(36).slice(2, 8),
    uniId: uniId,
    uniName: uni.name,
    country: uni.country,
    mode: mode,
    major: chosenMajor,
    tuitionUSD: uni.tuitionUSD,
    quality: uni.quality,
    submittedYear: gameYear(),
    decisionYear: gameYear() + 1,
    status: 'pending'
  });
  log('📝 Applied to ' + uni.name + '. Decision in ~1 year.');
  render();
}
window.eduApplyStudyAbroad = function(uniId, mode) {
  var uni = EDU_STUDY_ABROAD_UNIS.find(function(u) { return u.id === uniId; });
  if (!uni) return;

  if (uni.reqTrack && uni.reqTrack !== 'any') {
    if (Array.isArray(uni.reqTrack) && uni.reqTrack.indexOf(S.educationTrack) < 0) {
      log('❌ Your track (' + S.educationTrack + ') not accepted.'); render(); return;
    }
  }
  if (uni.requiresIELTS && (S.languageScores.ielts || 0) < uni.requiresIELTS) {
    log('❌ Need IELTS ' + uni.requiresIELTS + '+.'); render(); return;
  }
  if (uni.requiresTOEFL && (S.languageScores.toefl || 0) < uni.requiresTOEFL) {
    log('❌ Need TOEFL ' + uni.requiresTOEFL + '+.'); render(); return;
  }
  if (uni.requiresGerman && (S.languageScores.goethe || 0) < uni.requiresGerman) {
    log('❌ Need German B' + uni.requiresGerman + '+.'); render(); return;
  }
  if (uni.requiresFrench && (S.languageScores.delf || 0) < uni.requiresFrench) {
    log('❌ Need French B' + uni.requiresFrench + '+.'); render(); return;
  }
  if (uni.requiresGPA && eduComputeGPA() < uni.requiresGPA && S.uni) {
    log('❌ GPA too low (need ' + uni.requiresGPA + '+).'); render(); return;
  }

  var appFee = eduUSD(100);
  if (S.wealth < appFee) {
    // Check if family is paying
    if (typeof eduFamilyWealth === 'function' && eduFamilyWealth() > appFee * 52.7 * 2) {
       log('👨‍👩‍👧 Your family paid the $100 application fee.');
    } else {
       log('❌ Need ' + money(appFee) + ' application fee.'); render(); return;
    }
  } else {
    S.wealth -= appFee;
  }

  var majorOpts = (typeof STUDY_ABROAD_MAJORS !== 'undefined') ? STUDY_ABROAD_MAJORS : ['cs','engineering','business','medicine','law','economics','finance','architecture','psychology','nursing'];
  var majorList = majorOpts.map(function(mid, i) {
    var m = (typeof EDU_MAJORS !== 'undefined') ? EDU_MAJORS.find(function(x) { return x.id === mid; }) : null;
    return (i + 1) + '. ' + (m ? m.label : mid);
  }).join('\n');
  var pickMajor = prompt('Choose your major:\n\n' + majorList + '\n\nEnter number:', '1');
  if (!pickMajor) { render(); return; }
  var majorIdx = parseInt(pickMajor, 10) - 1;
  if (majorIdx < 0 || majorIdx >= majorOpts.length) { log('❌ Invalid major.'); render(); return; }
  var chosenMajor = majorOpts[majorIdx];

  S.studyAbroadApps.push({
    id: 'abroadapp_' + Math.random().toString(36).slice(2, 8),
    uniId: uniId,
    uniName: uni.name,
    country: uni.country,
    mode: mode,
    major: chosenMajor,
    tuitionUSD: uni.tuitionUSD,
    quality: uni.quality,
    submittedYear: gameYear(),
    decisionYear: gameYear() + 1,
    status: 'pending'
  });
  log('📝 Applied to ' + uni.name + '. Decision in ~1 year.');
  render();
};

/* ---------- INTERNSHIPS ---------- */
function eduApplyInternship(internId) {
  var intern = EDU_INTERNSHIPS.find(function(i) { return i.id === internId; });
  if (!intern) return;
  if (!S.uni && !S.degree) { log('❌ Need university or degree.'); render(); return; }
  var appFee = eduUSD(100);
  if (S.wealth < appFee) {
    var famWealth = typeof getFamilyWealthEGP === 'function' ? getFamilyWealthEGP() : 3000000;
    if (famWealth > appFee * 52.7 * 2) {
      if (confirm('Your family will pay the $100 application fee. Proceed?')) {
        // Paid by family
      } else { render(); return; }
    } else {
      log('❌ Need ' + money(appFee) + ' application fee.'); render(); return;
    }
  } else {
    S.wealth -= appFee;
  }
  var myMajor = S.uni ? S.uni.major : (S.majorId || 'general');
  if (intern.requiresMajor.length && intern.requiresMajor.indexOf(myMajor) < 0) {
    log('❌ Your major is not eligible.'); render(); return;
  }

  var chance = 0.40;
  if (eduComputeGPA() > 3.5) chance += 0.20;
  if (S.educationActivities.length > 2) chance += 0.15;

  if (Math.random() < chance) {
    if (intern.paid) S.wealth += eduEGP(intern.monthlyEGP * intern.months);
    if (S.career && S.career.cv) S.career.cv.skill = Math.min(100, S.career.cv.skill + 10);
    log('✅ Got internship at ' + intern.company + '!' + (intern.paid ? ' Earned ' + money(eduEGP(intern.monthlyEGP * intern.months)) + '.' : ''));
    fx({ happiness: 10 });
  } else {
    log('❌ Internship rejected at ' + intern.company + '.');
    fx({ happiness: -3 });
  }
  render();
}
window.eduApplyInternship = eduApplyInternship;

/* ---------- STUDY / REST (capped per year) ---------- */
window.eduStudyHard = function() {
  if (!S.uni) return;
  if (S.studyActionsThisYear >= 2) { log('⚠️ Already used both study focuses this year.'); return; }
  S.studyActionsThisYear = (S.studyActionsThisYear || 0) + 1;
  S.examStress = Math.min(100, S.examStress + 20);
  S.uni.gpa = Math.min(4.0, S.uni.gpa + 0.15);
  fx({ happiness: -3, smarts: 2 });
  log('📚 Studied hard. GPA +0.15, stress +20.');
  render();
};

window.eduRest = function() {
  if (S.studyActionsThisYear >= 2) { log('⚠️ Already used both rest focuses this year.'); return; }
  S.studyActionsThisYear = (S.studyActionsThisYear || 0) + 1;
  S.examStress = Math.max(0, S.examStress - 25);
  fx({ happiness: 5 });
  log('😴 Rested. Stress -25, happiness +5.');
  render();
};

/* ---------- MAIN VIEW ---------- */
function schoolView() {
  ensureEducationState();
  if (!S) return '';
  if (typeof EDU_SCHOOLS === 'undefined') {
    return '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">⚠️ Education data not loaded</h3>' +
      '<p class="muted small">Check that <b>js/13-data-education.js</b> is loaded in index.html before <b>js/11-view-school.js</b>.</p></div>';
  }

  var tabs = [
    ['overview', '📋 Overview'],
    ['studies', '🎓 Studies'],
    ['activities', '🎯 Activities'],
    ['languages', '🌍 Languages'],
    ['opportunities', '🏆 Opportunities'],
    ['events', '📖 Events']
  ];
  
  if (S.studyAbroad) {
    var saLabels = { studying: '🌍 Abroad', job_search: '🌍 Abroad ⏳', illegal: '🌍 Abroad 🚨', working_abroad: '🌍 Abroad ✓', married_citizen: '🌍 Abroad 💍', returned: '🌍 Abroad' };
    tabs.splice(2, 0, ['abroad', saLabels[S.studyAbroad.status] || '🌍 Abroad']);
  }

  var html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#f59e0b15 0%,transparent 100%);border-color:#f59e0b">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">EDUCATION · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + eduStatusLabel() + '</div></div>' +
    '<div style="font-size:2rem">🎓</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) {
      return '<button class="pill ' + (S.educationTab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="eduSetTab(\'' + t[0] + '\')">' + t[1] + '</button>';
    }).join('') +
    '</div></div>';

  if (S.educationTab === 'overview') html += eduRenderOverview();
  else if (S.educationTab === 'studies') html += eduRenderStudies();
  else if (S.educationTab === 'abroad') html += (typeof studyAbroadRender === 'function' ? studyAbroadRender() : '<div class="card"><p class="muted small">Abroad system not loaded.</p></div>');
  else if (S.educationTab === 'activities') html += eduRenderActivities();
  else if (S.educationTab === 'languages') html += eduRenderLanguages();
  else if (S.educationTab === 'opportunities') html += eduRenderOpportunities();
  else if (S.educationTab === 'events') html += eduRenderEvents();

  return html;
}

function eduStatusLabel() {
  if (S.degree) return 'Graduated · ' + S.degree;
  if (S.uni) return (eduMajorById(S.uni.major) || {}).label + ' at ' + S.uni.name + ' · Year ' + (S.uni.year + 1);
  if (S.school) return 'Student · ' + ((eduSchoolById(S.school) || {}).label || S.school);
  return 'Not enrolled';
}

/* ---------- TAB: OVERVIEW ---------- */
function eduRenderOverview() {
  var html = '<div class="card"><h3>📋 Status</h3>' +
    '<div class="row"><span>Age</span><b>' + S.age + '</b></div>';

  if (S.degree) {
    /* Graduated */
    html += '<div class="row"><span>Status</span><b class="good">🎓 Graduated</b></div>' +
      '<div class="row"><span>Degree</span><b class="good">' + S.degree + '</b></div>';
    if (S.graduation) {
      html += '<div class="row"><span>Major</span><b>' + (S.graduation.majorLabel || '—') + '</b></div>' +
        '<div class="row"><span>University</span><b>' + (S.graduation.uniName || '—') + '</b></div>' +
        '<div class="row"><span>Final GPA</span><b>' + (S.graduation.gpa ? S.graduation.gpa.toFixed(2) : '—') + '</b></div>' +
        '<div class="row"><span>Graduated</span><b>' + (S.graduation.year || '—') + '</b></div>';
    }
  } else {
    /* Currently in school or uni */
    html += '<div class="row"><span>School</span><b>' + (S.school ? ((eduSchoolById(S.school) || {}).label || S.school) : 'Not enrolled') + '</b></div>';
    if (S.educationTrack) {
      html += '<div class="row"><span>Track</span><b>' + ((eduTrackById(S.educationTrack) || {}).label || S.educationTrack) + '</b></div>';
    }
    if (S.thanaweyaScore) {
      html += '<div class="row"><span>Exam Score</span><b class="' + (S.thanaweyaScore >= 80 ? 'good' : S.thanaweyaScore >= 60 ? '' : 'bad') + '">' + S.thanaweyaScore.toFixed(1) + '%</b></div>';
    }
    if (S.uni) {
      html += '<div class="row"><span>University</span><b>' + S.uni.name + '</b></div>' +
        '<div class="row"><span>Major</span><b>' + ((eduMajorById(S.uni.major) || {}).label || S.uni.major) + '</b></div>' +
        '<div class="row"><span>GPA</span><b>' + S.uni.gpa.toFixed(2) + ' / 4.0</b></div>';
    }
    if (S.examStress > 0) {
      html += '<div class="row"><span>Exam stress</span><b class="' + (S.examStress > 70 ? 'bad' : '') + '">' + S.examStress + '/100</b></div>';
    }
  }

  html += '</div>';

  if (S.age >= 6 && S.age < 18 && !S.school) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">⚠️ Choose a School</h3>' +
      '<p class="muted small">Time to enroll. Head to Studies tab. (If you skip, family will auto-enroll you at 7.)</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="eduSetTab(\'studies\')">Choose School →</button></div>';
  }
  if (S.age >= 15 && S.age < 18 && S.school && !S.educationTrack && !S.uni) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">⚠️ Choose a Track</h3>' +
      '<p class="muted small">Thanaweya, STEM, A-Levels, IB, or ACT.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="eduSetTab(\'studies\')">Choose Track →</button></div>';
  }
  if (S.age >= 18 && !S.uni && !S.degree && S.thanaweyaScore) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">⚠️ University Tansik</h3>' +
      '<p class="muted small">Your score: <b>' + S.thanaweyaScore.toFixed(1) + '%</b>.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="eduSetTab(\'studies\')">Open Tansik →</button></div>';
  }
  return html;
}

/* ---------- TAB: STUDIES ---------- */
function eduRenderStudies() {
  var age = S.age;

  /* School picker */
  if (age >= 6 && age < 18 && !S.school && !S.thanaweyaScore) {
    var html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🏫 Choose Your School</h3>' +
      '<p class="muted small">Family pays if you can\'t. Only shows affordable options.</p></div>';
    EDU_SCHOOLS.forEach(function(school) {
      var fee = eduEGP(school.annualEGP);
      var canAfford = fee === 0 || S.wealth >= fee || eduFamilyWealth() >= fee;
      html += '<div class="card" style="padding:10px;' + (canAfford ? '' : 'opacity:.5') + '">' +
        '<div style="display:flex;justify-content:space-between"><b>' + school.label + '</b><b>' + (fee === 0 ? 'Free' : money(fee) + '/yr') + '</b></div>' +
        '<div class="muted small">' + school.desc + '</div>' +
        '<div class="muted small">Smarts ×' + school.smartsMult + ' · English +' + school.englishBonus + '/yr · Social +' + school.socialBonus + '/yr</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:' + (canAfford ? '#fbbf24' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + ';font-weight:700" ' + (canAfford ? '' : 'disabled') + ' onclick="eduChooseSchool(\'' + school.id + '\')">' + (canAfford ? 'Enroll' : 'Cannot afford') + '</button>' +
        '</div>';
    });
    return html;
  }

  /* Track picker */
  if (age >= 15 && age < 18 && S.school && !S.educationTrack && !S.uni) {
    var html2 = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">📚 Choose Track</h3></div>';
    EDU_TRACKS.forEach(function(track) {
      var eligible = eduTrackEligible(track);
      var fee = eduEGP(track.annualEGP);
      var canAfford = fee === 0 || S.wealth >= fee || eduFamilyWealth() >= fee;
      var blocked = !eligible || !canAfford;
      var reason = !eligible ? 'Your school doesn\'t offer this' : !canAfford ? 'Cannot afford ' + money(fee) + '/yr' : '';
      html2 += '<div class="card" style="padding:10px;' + (blocked ? 'opacity:.5' : '') + '">' +
        '<div style="display:flex;justify-content:space-between"><b>' + track.label + '</b><b>' + (fee === 0 ? 'Free' : money(fee) + '/yr') + '</b></div>' +
        '<div class="muted small">' + track.desc + '</div>' +
        (track.tutoringCost ? '<div class="muted small">Tutoring est: ' + money(eduEGP(track.tutoringCost)) + '</div>' : '') +
        (blocked ? '<div class="bad small" style="margin-top:4px">' + reason + '</div>' : '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:#fbbf24;color:#000;font-weight:700" onclick="eduChooseTrack(\'' + track.id + '\')">Choose</button>') +
        '</div>';
    });
    return html2;
  }

  /* Tutoring offer (17-18) */
  if (S.educationTrack && !S.uni && !S.degree && !S.thanaweyaScore && !S.tutoring) {
    var track = eduTrackById(S.educationTrack);
    if (track && track.tutoringCost > 0) {
      return '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">👨‍🏫 Private Tutoring</h3>' +
        '<p class="muted small">High school exams are brutal. Tutors cost a lot but boost your score.</p>' +
        '<div class="row"><span>Cost</span><b>' + money(eduEGP(track.tutoringCost)) + '</b></div>' +
        '<button class="opt" style="width:100%;margin-top:8px;font-weight:700" onclick="eduHireTutors()">Hire Tutors</button></div>';
    }
  }

  /* Tansik */
  if (age >= 18 && !S.uni && !S.degree && S.thanaweyaScore) {
    return eduRenderTansik();
  }

  /* Current uni */
  if (S.uni) return eduRenderCurrentUni();

  /* Graduated */
  if (S.degree) {
    return '<div class="card"><h3>🎓 Graduated</h3>' +
      '<div class="row"><span>Degree</span><b>' + S.degree + '</b></div>' +
      '<div class="row"><span>Major</span><b>' + ((S.graduation && S.graduation.majorLabel) || S.majorLabel || '—') + '</b></div>' +
      '<div class="row"><span>University</span><b>' + ((S.graduation && S.graduation.uniName) || '—') + '</b></div>' +
      '<div class="row"><span>Final GPA</span><b>' + ((S.graduation && S.graduation.gpa) ? S.graduation.gpa.toFixed(2) : '—') + '</b></div>' +
      '<p class="muted small" style="margin-top:10px">Career unlocked. See Career tab.</p></div>';
  }

  return '<div class="card"><h3>🎓 Studies</h3><p class="muted small">Nothing to do right now.</p></div>';
}

/* ---------- TANSIK ---------- */
function eduRenderTansik() {
  var score = S.thanaweyaScore || 0;
  var html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🎓 Tansik</h3>' +
    '<div class="row"><span>Score</span><b class="' + (score >= 80 ? 'good' : score >= 65 ? '' : 'bad') + '">' + score.toFixed(1) + '%</b></div>' +
    '<div class="row"><span>Track</span><b>' + ((eduTrackById(S.educationTrack) || {}).label || '—') + '</b></div>' +
    '<div class="row"><span>Family</span><b>' + S.familyTier + ' (' + money(eduFamilyWealth()) + ')</b></div>' +
    '<div class="row"><span>Your cash</span><b>' + money(S.wealth) + '</b></div></div>';

  if (!S.uniPendingFaculty) {
    html += '<div class="card"><h3>Step 1 · Choose Faculty</h3>';
    EDU_MAJORS.forEach(function(m) {
      var cutoff = eduCutoffFor(m.cutoffKey);
      var eligible = score >= cutoff;
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem;' + (eligible ? '' : 'opacity:.5') + '" ' + (eligible ? '' : 'disabled') + ' onclick="eduChoosePendingFaculty(\'' + m.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + m.label + '</b><span>' + (eligible ? '✓ Cutoff ' + cutoff + '%' : 'Needs ' + cutoff + '%') + '</span></div>' +
        '<div class="muted small">' + m.years + ' years</div></button>';
    });
    return html + '</div>';
  }

  var facultyId = S.uniPendingFaculty;
  var faculty = eduMajorById(facultyId);
  var cutoff = eduCutoffFor(faculty.cutoffKey);

  html += '<div class="card"><h3>Step 2 · Choose University</h3>' +
    '<div class="muted small">' + faculty.label + ' · Public cutoff ' + cutoff + '%</div>' +
    '<button class="opt" style="margin-top:6px;padding:4px 8px;font-size:.7rem" onclick="S.uniPendingFaculty=null;render()">← Change faculty</button></div>';

  /* Public */
  html += '<div class="card" style="border-color:#22d3ee"><h3 style="color:#22d3ee">🏛 Public Universities</h3>';
  EDU_UNIVERSITIES.filter(function(u) { return u.type === 'public'; }).forEach(function(uni) {
    var tuition = eduEGP(uni.tuitionEGP);
    var meets = score >= cutoff;
    var canSelf = S.wealth >= tuition;
    var canFam = eduFamilyWealth() >= tuition;
    html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a;' + (meets ? '' : 'opacity:.5') + '">' +
      '<div style="display:flex;justify-content:space-between"><b>' + uni.name + '</b><b>' + money(tuition) + '/yr</b></div>' +
      '<div class="muted small">' + uni.city + ' · Q' + uni.quality + '/10 · ' + faculty.years + ' yrs</div>' +
      (!meets ? '<div class="bad small">Needs ' + cutoff + '%</div>' :
        '<div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">' +
        (canSelf ? '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#34d399;color:#000;font-weight:700" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'self\')">Pay self</button>' : '') +
        (canFam ? '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#fbbf24;color:#000;font-weight:700" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'family\')">Family pays</button>' : '') +
        (!canSelf && !canFam ? '<span class="bad small">Cannot afford</span>' : '') +
        '</div>') +
      '</div>';
  });
  html += '</div>';

  /* Private */
  html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">💼 Private Universities</h3>';
  EDU_UNIVERSITIES.filter(function(u) { return u.type === 'private'; }).forEach(function(uni) {
    var tuition = eduEGP(uni.tuitionEGP);
    var minScore = uni.cutoffs || 50;
    var meets = score >= minScore;
    var canSelf = S.wealth >= tuition;
    var canFam = eduFamilyWealth() >= tuition;
    html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a;' + (meets ? '' : 'opacity:.5') + '">' +
      '<div style="display:flex;justify-content:space-between"><b>' + uni.name + '</b><b>' + money(tuition) + '/yr</b></div>' +
      '<div class="muted small">' + uni.city + ' · Q' + uni.quality + '/10 · Min ' + minScore + '% · ' + faculty.years + ' yrs</div>' +
      (!meets ? '<div class="bad small">Needs ' + minScore + '%</div>' :
        '<div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap">' +
        (canSelf ? '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#34d399;color:#000;font-weight:700" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'self\')">Pay self</button>' : '') +
        (canFam ? '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#fbbf24;color:#000;font-weight:700" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'family\')">Family pays</button>' : '') +
        '<button class="opt" style="flex:1;padding:4px;font-size:.7rem" onclick="eduApplyToUni(\'' + uni.id + '\',\'' + facultyId + '\',\'loan\')">Loan</button>' +
        '</div>') +
      '</div>';
  });
  html += '</div>';
     html += '<div class="card" style="border-color:#8b5cf6;margin-top:10px">' +
    '<p class="muted small">Want to study abroad instead of an Egyptian university?</p>' +
    '<button class="opt" style="width:100%;text-align:center;background:#8b5cf620;border-color:#8b5cf6;font-size:.78rem" onclick="switchTab(\'immigration\');S.immigrationTab=\'study\';render()">✈️ Go to Study Abroad</button>' +
    '</div>';
  return html;
}

/* ---------- CURRENT UNI ---------- */
function eduRenderCurrentUni() {
  var u = S.uni;
  var major = eduMajorById(u.major);
  var progress = Math.round((u.year / u.yearsTotal) * 100);
  var gpaColor = u.gpa >= 3.5 ? 'good' : u.gpa >= 2.5 ? '' : 'bad';

  var html = '<div class="card"><h3>🎓 ' + u.name + '</h3>' +
    '<div class="row"><span>Faculty</span><b>' + (major ? major.label : u.major) + '</b></div>' +
    '<div class="row"><span>Year</span><b>' + (u.year + 1) + ' / ' + u.yearsTotal + '</b></div>' +
    '<div class="row"><span>Progress</span><b>' + progress + '%</b></div>' +
    '<div class="row"><span>GPA</span><b class="' + gpaColor + '">' + u.gpa.toFixed(2) + ' / 4.0</b></div>' +
    '<div class="row"><span>Tuition</span><b>' + money(eduEGP(u.tuition)) + '/year</b></div>' +
    '<div class="row"><span>Payment</span><b>' + u.paymentMode + '</b></div>' +
    '</div>';

  if (S.examStress < 70) {
    html += '<div class="card"><button class="opt" style="width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="eduStudyHard()">📚 Study Hard</button></div>';
  }
  if (S.examStress > 20) {
    html += '<div class="card"><button class="opt" style="width:100%;text-align:center;border-color:#34d399;color:#34d399" onclick="eduRest()">😴 Rest</button></div>';
  }
  return html;
}

/* ---------- ACTIVITIES ---------- */
function eduRenderActivities() {
  if (S.degree) {
    return '<div class="card"><h3>🎯 Activities</h3><p class="muted small">Activities are only available during school or university. You have graduated — focus on your career.</p></div>';
  }
  var inSchool = S.school || S.uni;
  if (!inSchool) return '<div class="card"><h3>🎯 Activities</h3><p class="muted small">Available during school or university.</p></div>';

  var html = '<div class="card"><h3>🎯 Clubs & Activities</h3></div>';
  EDU_ACTIVITIES.forEach(function(act) {
    var enrolled = S.educationActivities.indexOf(act.id) >= 0;
    var cost = eduEGP(act.monthlyEGP * 12);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem;' + (enrolled ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="eduJoinActivity(\'' + act.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + act.label + (enrolled ? ' ✓' : '') + '</b><span>' + (cost === 0 ? 'Free' : money(cost) + '/yr') + '</span></div>' +
      '<div class="muted small">Social +' + (act.social || 0) + ' · Smarts +' + (act.smarts || 0) + ' · Happy +' + (act.happiness || 0) + (act.cvBoost ? ' · CV' : '') + '</div></button>';
  });
  return html;
}

/* ---------- LANGUAGES ---------- */
function eduRenderLanguages() {
  var html = '<div class="card"><h3>🌍 Language Tests</h3></div>';
  Object.keys(S.languageScores).forEach(function(k) {
    if (typeof S.languageScores[k] !== 'number') return;
    var test = EDU_LANGUAGE_TESTS.find(function(t) { return t.id === k; });
    if (!test) return;
    var passed = S.languageScores[k] >= test.passScore;
    html += '<div class="row"><span>' + test.label + '</span><b class="' + (passed ? 'good' : 'bad') + '">' + S.languageScores[k] + ' / ' + test.maxScore + '</b></div>';
  });
  html += '<div class="card"><h3>Register</h3>';
  EDU_LANGUAGE_TESTS.forEach(function(test) {
    var cost = eduUSD(test.costUSD);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="eduTakeLanguageTest(\'' + test.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + test.label + '</b><span>' + money(cost) + '</span></div>' +
      '<div class="muted small">Pass: ' + test.passScore + '+ · ' + test.desc + '</div></button>';
  });
  return html + '</div>';
}

/* ---------- OPPORTUNITIES ---------- */
function eduRenderOpportunities() {
  var html = '<div class="card"><h3>🏆 Scholarships</h3></div>';
  EDU_SCHOLARSHIPS.forEach(function(sch) {
    var applied = S.scholarshipApps.some(function(a) { return a.scholarshipId === sch.id; });
    var gpaOk = !sch.requiresGPA || eduComputeGPA() >= sch.requiresGPA;
    var ieltsOk = !sch.requiresIELTS || (S.languageScores.ielts || 0) >= sch.requiresIELTS;
    var gerOk = !sch.requiresGerman || (S.languageScores.goethe || 0) >= sch.requiresGerman;
    var frOk = !sch.requiresFrench || (S.languageScores.delf || 0) >= sch.requiresFrench;
    var eligible = gpaOk && ieltsOk && gerOk && frOk;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.72rem;' + (applied ? 'opacity:.5' : '') + '" ' + (applied || !eligible ? 'disabled' : '') + ' onclick="eduApplyScholarship(\'' + sch.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + sch.name + '</b><span>' + Math.round(sch.acceptanceRate * 100) + '%</span></div>' +
      '<div class="muted small">' + sch.desc + '</div>' +
      (!eligible ? '<div class="bad small">GPA/language reqs not met</div>' : '') +
      (applied ? '<div class="good small">✓ Applied</div>' : '') +
      '</button>';
  });

  html += '<div class="card" style="margin-top:12px"><h3>✈️ Study Abroad</h3></div>';
  EDU_STUDY_ABROAD_UNIS.forEach(function(uni) {
    var applied = S.studyAbroadApps.some(function(a) { return a.uniId === uni.id; });
    var tuition = eduUSD(uni.tuitionUSD);
    var ieltsOk = !uni.requiresIELTS || (S.languageScores.ielts || 0) >= uni.requiresIELTS;
    var toeflOk = !uni.requiresTOEFL || (S.languageScores.toefl || 0) >= uni.requiresTOEFL;
    var gerOk = !uni.requiresGerman || (S.languageScores.goethe || 0) >= uni.requiresGerman;
    var frOk = !uni.requiresFrench || (S.languageScores.delf || 0) >= uni.requiresFrench;
    var gpaOk = !uni.requiresGPA || eduComputeGPA() >= uni.requiresGPA;
    var trackOk = !uni.reqTrack || uni.reqTrack === 'any' || (Array.isArray(uni.reqTrack) && uni.reqTrack.indexOf(S.educationTrack) >= 0);
    var eligible = ieltsOk && toeflOk && gerOk && frOk && gpaOk && trackOk;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.72rem;' + (applied ? 'opacity:.5' : '') + '" ' + (applied || !eligible ? 'disabled' : '') + ' onclick="eduApplyStudyAbroad(\'' + uni.id + '\',\'self\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + uni.name + '</b><span>' + money(tuition) + '/yr</span></div>' +
      '<div class="muted small">' + (uni.country || '').toUpperCase() + ' · Q' + uni.quality + '/10</div>' +
      (!eligible ? '<div class="bad small">Requirements not met</div>' : '') +
      (applied ? '<div class="good small">✓ Applied</div>' : '') +
      '</button>';
  });

  if (S.uni) {
    html += '<div class="card" style="margin-top:12px"><h3>💼 Internships</h3></div>';
    EDU_INTERNSHIPS.forEach(function(intern) {
      var eligible = !intern.requiresMajor.length || intern.requiresMajor.indexOf(S.uni.major) >= 0;
      if (!eligible) return;
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.72rem" onclick="eduApplyInternship(\'' + intern.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + intern.company + '</b><span>' + (intern.paid ? money(eduEGP(intern.monthlyEGP)) + '/mo' : 'Unpaid') + '</span></div>' +
        '<div class="muted small">' + intern.label + ' · ' + intern.months + 'mo</div></button>';
    });
  }
  return html;
}

/* ---------- EVENTS ---------- */
function eduRenderEvents() {
  if (!S.educationEvents || !S.educationEvents.length) {
    return '<div class="card"><h3>📖 Timeline</h3><p class="muted small">Events fire during school and university.</p></div>';
  }
  var html = '<div class="card"><h3>📖 Recent Events</h3></div>';
  S.educationEvents.slice(-15).reverse().forEach(function(ev) {
    html += '<div class="card" style="padding:10px;margin-bottom:4px">' +
      '<div style="font-weight:700">' + ev.title + ' <span class="muted small mono float-right">' + (ev.year || '') + '</span></div>' +
      '<div class="muted small" style="margin-top:4px">' + ev.text + '</div></div>';
  });
  return html;
}

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureEducationState();
  if (!S) return;
  var year = gameYear();
  /* Parent education planning at age 14 */
  if (S.age === 14 && !S.educationTrack && !S.flags.parent_plan_done) {
    S.flags.parent_plan_done = true;
    const tier = S.familyTier || 'middle';
    let recTrack = 'thanaweya';
    let recSchool = 'national';
    
    if (tier === 'wealthy' || tier === 'ultra') { recTrack = 'ib'; recSchool = 'ib'; }
    else if (tier === 'upper-mid') { recTrack = 'alevels'; recSchool = 'igcse'; }
    else if (tier === 'middle') { recTrack = 'thanaweya'; recSchool = 'private'; }

    S.pending = {
      title: '👨‍👩‍👧 Family Meeting',
      text: 'Your parents sit you down to discuss your future.\n\n"Based on our situation, we think you should study ' + recTrack.toUpperCase() + ' at ' + recSchool.toUpperCase() + '."',
      choices: [
        { label: 'Accept their plan', effect: function(s) {
           s.educationTrack = recTrack;
           s.school = recSchool;
           log('You agreed to study ' + recTrack + ' at ' + recSchool + '.');
        }},
        { label: 'I want to choose my own path', effect: function(s) {
           log('You decided to choose your own path.');
           s.educationTab = 'studies';
        }}
      ]
    };
    S.evId = 'parent_plan_14';
    render();
    return; /* Wait for player choice */
  }
  /* Auto-assign school */
  if (S.age >= 7 && S.age < 18 && !S.school && !S.thanaweyaScore) {
    var famW = eduFamilyWealth();
    var autoSchool = 'national';
    if (famW >= 50000000) autoSchool = 'ib';
    else if (famW >= 5000000) autoSchool = 'igcse';
    else if (famW >= 600000) autoSchool = 'private';
    else if (famW >= 80000) autoSchool = 'language';
    S.school = autoSchool;
    var schDef = eduSchoolById(autoSchool);
    log('📚 Your family enrolled you in ' + (schDef ? schDef.label : autoSchool) + '.');
  }

  /* School phase */
  if (S.school && S.age >= 6 && S.age < 18) {
    var schoolFee = eduGetCurrentSchoolFee();
    if (schoolFee > 0) {
      if (S.wealth >= schoolFee) S.wealth -= schoolFee;
      else if (eduFamilyWealth() < schoolFee) {
        log('⚠️ Cannot afford school. Moved to National.');
        S.school = 'national';
      }
    }
    if (S.educationTrack) {
      var t = eduTrackById(S.educationTrack);
      if (t) {
        var tFee = eduEGP(t.annualEGP);
        if (tFee > 0 && S.wealth >= tFee) S.wealth -= tFee;
      }
    }
    var schoolDef = eduSchoolById(S.school);
    if (schoolDef) {
      S.smarts = Math.min(100, S.smarts + Math.round(schoolDef.smartsMult * 2));
      S.social = Math.min(100, S.social + Math.round(schoolDef.socialBonus * 0.5));
    }
    if (S.age >= 16 && S.age <= 18) {
      S.examStress = Math.min(100, S.examStress + 10);
      if (S.tutoring) S.smarts = Math.min(100, S.smarts + 5);
    }
    if (Math.random() < 0.35) {
      var eligibleEvts = EDU_SCHOOL_EVENTS.filter(function(e) {
        return S.age >= e.minAge && S.age <= e.maxAge;
      });
      if (eligibleEvts.length) {
        var totalW = eligibleEvts.reduce(function(s, e) { return s + e.weight; }, 0);
        var roll = Math.random() * totalW;
        for (var i = 0; i < eligibleEvts.length; i++) {
          roll -= eligibleEvts[i].weight;
          if (roll <= 0) {
            log('📖 ' + eligibleEvts[i].title + ': ' + eligibleEvts[i].text);
            S.educationEvents.push({ year: year, title: eligibleEvts[i].title, text: eligibleEvts[i].text });
            break;
          }
        }
      }
    }
  }

  /* Auto-assign track */
  if (S.age >= 16 && S.age < 18 && S.school && !S.educationTrack && !S.uni && !S.degree) {
    var famW2 = eduFamilyWealth();
    var autoTrack = 'thanaweya';
    if (S.school === 'igcse' || S.school === 'ib') autoTrack = famW2 >= 250000 ? 'ib' : 'alevels';
    else if (S.school === 'american') autoTrack = 'act';
    else if (S.school === 'national' || S.school === 'language') autoTrack = (S.smarts >= 85 && famW2 >= 3000) ? 'stem_school' : 'thanaweya';
    S.educationTrack = autoTrack;
    var tDef = eduTrackById(autoTrack);
    log('📖 Your family placed you in ' + (tDef ? tDef.label : autoTrack) + '.');
  }

  /* Thanaweya score */
  if (S.age >= 18 && !S.thanaweyaScore) {
    var base = 30 + (S.smarts * 0.5);
    var tr = eduTrackById(S.educationTrack);
    if (tr && tr.thanaweyaBonus) base += tr.thanaweyaBonus;
    if (S.tutoring) base += 12;
    base += (Math.random() * 10) - 5;
    S.thanaweyaScore = Math.max(50, Math.min(100, base));
    log('🎯 High School Exams: ' + S.thanaweyaScore.toFixed(1) + '%');
    S.educationEvents.push({ year: year, title: 'High School Graduation', text: 'Scored ' + S.thanaweyaScore.toFixed(1) + '%' });
  }

  /* Activities effects (school OR uni) */
  if (S.educationActivities && S.educationActivities.length) {
    S.educationActivities.forEach(function(actId) {
      var act = EDU_ACTIVITIES.find(function(a) { return a.id === actId; });
      if (!act) return;
      if (act.social) S.social = Math.min(100, S.social + Math.round(act.social * 0.3));
      if (act.smarts) S.smarts = Math.min(100, S.smarts + Math.round(act.smarts * 0.3));
      if (act.happiness) fx({ happiness: Math.round(act.happiness * 0.2) });
      if (act.cvBoost && S.career && S.career.cv) S.career.cv.skill = Math.min(100, S.career.cv.skill + 2);
    });
  }

  /* University phase */
  if (S.uni) {
    if (S.uni.paymentMode === 'self' && (S.uni.type === 'private' || S.uni.type === 'study_abroad')) {
      var fee = eduEGP(S.uni.tuition);
      if (S.wealth >= fee) S.wealth -= fee;
      else {
        log('⚠️ Cannot pay tuition. GPA penalty.');
        S.uni.gpa = Math.max(0, S.uni.gpa - 0.5);
      }
    }
    S.uni.year++;
    S.uni.semestersCompleted = (S.uni.semestersCompleted || 0) + 2;
    var gpaDelta = (Math.random() - 0.4) * 0.3;
    if (S.examStress > 80) {
      gpaDelta -= 0.3;
      log('⚠️ High stress hurting grades.');
    }
    S.uni.gpa = Math.max(0, Math.min(4.0, S.uni.gpa + gpaDelta));

    if (Math.random() < 0.40) {
      var eligUni = EDU_UNIVERSITY_EVENTS.filter(function(e) {
        return S.age >= e.minAge && S.age <= e.maxAge;
      });
      if (eligUni.length) {
        var totalW2 = eligUni.reduce(function(s, e) { return s + e.weight; }, 0);
        var roll2 = Math.random() * totalW2;
        for (var j = 0; j < eligUni.length; j++) {
          roll2 -= eligUni[j].weight;
          if (roll2 <= 0) {
            log('📖 ' + eligUni[j].title + ': ' + eligUni[j].text);
            S.educationEvents.push({ year: year, title: eligUni[j].title, text: eligUni[j].text });
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
      log('🎓 Graduated from ' + S.uni.name + ' · ' + S.majorLabel + ' · GPA ' + S.uni.gpa.toFixed(2));
      fx({ happiness: 20, smarts: 5 });
      S.educationEvents.push({ year: year, title: 'Graduation', text: 'Graduated from ' + S.uni.name + ' with GPA ' + S.uni.gpa.toFixed(2) });
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

  /* Scholarship decisions */
  S.scholarshipApps = S.scholarshipApps.filter(function(app) {
    if (app.decisionYear > year) return true;
    var sch = EDU_SCHOLARSHIPS.find(function(s) { return s.id === app.scholarshipId; });
    if (!sch) return false;
    var chance = sch.acceptanceRate;
    if (eduComputeGPA() > 3.8) chance += 0.05;
    if (S.smarts > 90) chance += 0.05;
    if (S.educationActivities.length > 2) chance += 0.05;
    if (Math.random() < chance) {
      log('🎉 WON ' + sch.name + '!');
      fx({ happiness: 30 });
      S.wealth += eduEGP(200000);
      S.educationEvents.push({ year: year, title: 'Scholarship Won', text: 'Awarded ' + sch.name });
    } else {
      log('❌ Not selected for ' + sch.name + '.');
      fx({ happiness: -5 });
    }
    return false;
  });

  /* Study abroad decisions */
  S.studyAbroadApps = S.studyAbroadApps.filter(function(app) {
    if (app.decisionYear > year) return true;
    var uni = EDU_STUDY_ABROAD_UNIS.find(function(u) { return u.id === app.uniId; });
    if (!uni) return false;
    var gpa = eduComputeGPA();
    var chance = 0.4 + (gpa - (uni.requiresGPA || 0)) * 0.4;
    chance = Math.max(0.05, Math.min(0.95, chance));
    
    if (Math.random() < chance) {
      log('🎉 ADMITTED to ' + uni.name + ' in ' + (uni.country || '').toUpperCase() + '!');
      fx({ happiness: 25 });
      S.educationEvents.push({ year: year, title: 'Study Abroad Admission', text: 'Admitted to ' + uni.name });
      if (typeof studyAbroadArrive === 'function') {
        studyAbroadArrive(app, uni);
      } else {
        /* Fallback if 30-study-abroad.js did not load */
        S.studyAbroad = {
          country: app.country, university: uni.name, uniId: uni.id,
          tuitionUSD: uni.tuitionUSD, mode: app.mode, startedYear: year
        };
        S.uni = {
          id: uni.id, name: uni.name, type: 'study_abroad',
          city: (uni.country || '').toUpperCase(), quality: uni.quality,
          tuition: Math.round(uni.tuitionUSD * 52.7),
          year: 0, yearsTotal: 4, major: app.major || 'general',
          degree: app.major || 'general', faculty: app.major || 'general',
          gpa: 3.0, semestersCompleted: 0, credits: 0,
          startedYear: year, paymentMode: app.mode, isStudyAbroad: true
        };
      }
    } else {
      log('❌ Not admitted to ' + uni.name + '.');
      fx({ happiness: -8 });
    }
    return false;
  });

  /* Stress decay */
  S.examStress = Math.max(0, S.examStress - 10);

  /* Reset study cooldown */
  S.studyActionsThisYear = 0;
});

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'school', label: '🎓 Education', order: 1, view: schoolView });
