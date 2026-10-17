/* =====================================================================
   70. EDUCATION + LIFE EVENTS — Phase 3.2 consolidation
   Replaces: 70-education-deep-improvements.js, 71-education-life-events.js
   Load AFTER 69-study-abroad-system.js and BEFORE 72-faculty-career-connection.js
   ===================================================================== */

(function p70EducationLife() {
  'use strict';

  /* =============================================================
     PART 1 — STATE (both p70 and p71)
     ============================================================= */
  function p70Init(o) {
    o = o || S;
    if (!o) return;
    if (!o.p70) o.p70 = {};
    const d70 = o.p70;
    if (typeof d70.smartsLocked !== 'boolean') d70.smartsLocked = (Number(o.smarts) >= 100);
    if (!Array.isArray(d70.achievements)) d70.achievements = [];
    if (!Array.isArray(d70.extracurriculars)) d70.extracurriculars = [];
    if (typeof d70.exchangeUsed !== 'boolean') d70.exchangeUsed = false;
    if (typeof d70.internshipDone !== 'boolean') d70.internshipDone = false;
    if (typeof d70.deansListCount !== 'number') d70.deansListCount = 0;

    if (!o.p71) o.p71 = {};
    const d71 = o.p71;
    if (!Array.isArray(d71.privateLessons)) d71.privateLessons = [];
    if (typeof d71.studyGroupActive !== 'boolean') d71.studyGroupActive = false;
    if (typeof d71.olympiadWins !== 'number') d71.olympiadWins = 0;
    if (typeof d71.thanaweyaStress !== 'number') d71.thanaweyaStress = 0;
    if (!Array.isArray(d71.schoolTrips)) d71.schoolTrips = [];
    if (typeof d71.cheated !== 'boolean') d71.cheated = false;
    if (!Array.isArray(d71.universityEvents)) d71.universityEvents = [];
    if (typeof d71.vocationalTrack !== 'boolean') d71.vocationalTrack = false;
    if (typeof d71.lastLessonAge !== 'number') d71.lastLessonAge = -1;
  }
  window.p70Init = p70Init;
  const _migrate = migrate;
  migrate = function (o) { const r = _migrate(o); p70Init(r); return r; };
  const _newGame = newGame;
  newGame = function () { _newGame.apply(this, arguments); p70Init(S); };

  /* =============================================================
     PART 2 — fx() WRAPPER: smarts lock at 100
     ============================================================= */
  function p70ComputeGpa(smarts, effort) {
    const s = Math.max(0, Math.min(100, Number(smarts) || 50));
    const e = effort || (S && S.effort) || 'coast';
    let gpa = 1.85 + (s / 100) * 2.0;
    if (e === 'hard') gpa += 0.3;
    else if (e === 'skip') gpa -= 0.6;
    return Math.max(0, Math.min(4, gpa));
  }
  window.p70ComputeGpa = p70ComputeGpa;

  const _fx = fx;
  fx = function (o) {
    p70Init(S);
    const before = Number(S && S.smarts) || 0;
    const result = _fx.apply(this, arguments);
    if (S && S.p70 && S.p70.smartsLocked) S.smarts = 100;
    if (S && (Number(S.smarts) || 0) >= 100) S.p70.smartsLocked = true;
    return result;
  };

  /* Override base GPA calc — used by 50- */
  if (typeof p50ComputeG === 'function') {
    const _p50 = p50ComputeG;
    p50ComputeG = function () {
      const base = p70ComputeGpa(S.smarts, S.effort);
      const noise = Math.random() * 0.3 - 0.15;
      return Math.max(0, Math.min(4, base + noise));
    };
  }

  /* Recalibrate old saves: if smarts high, GPA should follow */
  function p70RecalibrateGpa() {
    if (!S) return;
    p70Init(S);
    if (!S.gpaN || S.gpaN < 1) return;
    const smarts = Number(S.smarts) || 0;
    if (smarts < 95) return;
    const expected = p70ComputeGpa(smarts, 'coast');
    if (S.gpa < expected - 0.4) {
      const old = S.gpa;
      S.gpa = expected;
      if (!Array.isArray(S.logRows)) S.logRows = [];
      S.logRows.unshift({ age: S.age, t: '📊 GPA recalculated: ' + old.toFixed(2) + ' → ' + expected.toFixed(2) + ' (current smarts ' + smarts + '%).' });
      if (typeof save === 'function') save();
    }
  }
  setTimeout(p70RecalibrateGpa, 500);

  /* =============================================================
     PART 3 — THANAWEYA AMMA CUTOFFS
     ============================================================= */
  const P70_EGY_CUTOFFS = {
    medicine: 91.5, dentistry: 90.8, pharmacy: 89.2, physical_therapy: 85.0,
    engineering: 83.5, computer_science: 80.0, science: 76.5, nursing: 70.0,
    business: 72.0, commerce: 70.5, economics: 74.0, law: 68.5, arts: 65.0,
    education: 62.5, mass_comm: 72.0, agriculture: 63.0, veterinary: 85.5
  };
  window.P70_EGY_CUTOFFS = P70_EGY_CUTOFFS;

  const P70_MAJOR_TO_CUTOFF = { medicine: 'medicine', law: 'law', cs: 'computer_science', business: 'business', biology: 'science' };

  /* Block enrollment if Thanaweya below cutoff */
  if (typeof enrollEgyptUniversity === 'function') {
    const _enroll = enrollEgyptUniversity;
    enrollEgyptUniversity = function (uniId, faculty, funder) {
      if (S && S.country === 'egy') {
        const thana = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || (S.gpa ? S.gpa / 4 * 100 : 0);
        const key = (faculty || '').toLowerCase().replace(/\s+/g, '_');
        const cutoff = P70_EGY_CUTOFFS[key];
        if (cutoff && thana > 0 && thana < cutoff) {
          return hint('❌ Thanaweya Amma cutoff for ' + faculty + ' is ' + cutoff + '%. Your score is ' + thana.toFixed(1) + '%.');
        }
      }
      return _enroll.apply(this, arguments);
    };
  }

  function p70CutoffsTable() {
    const thana = (S && S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || null;
    const rows = Object.entries(P70_EGY_CUTOFFS)
      .sort(function (a, b) { return b[1] - a[1]; })
      .map(function (pair) {
        const key = pair[0], cutoff = pair[1];
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        const eligible = thana == null ? null : thana >= cutoff;
        const color = eligible == null ? 'var(--muted)' : eligible ? 'var(--mint)' : 'var(--rose)';
        return '<div class="row" style="padding:4px 0;font-size:.82rem"><span>' + label + '</span>' +
          '<span><b class="mono" style="color:' + color + '">' + cutoff + '%</b>' +
          (eligible != null ? ' <span style="font-size:.7rem;color:' + color + '">' + (eligible ? '✓' : '✗') + '</span>' : '') + '</span></div>';
      }).join('');
    return '<section class="card"><h3>📊 Egyptian university cutoffs (Thanaweya Amma)</h3>' +
      '<p class="muted" style="font-size:.82rem">Public universities admit by Thanaweya Amma percentage.</p>' +
      (thana != null ? '<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span><b>Your score</b></span><b class="mono" style="color:var(--cyan)">' + thana.toFixed(1) + '%</b></div>' : '') +
      rows + '</section>';
  }

  /* =============================================================
     PART 4 — EXTRACURRICULARS
     ============================================================= */
  const P70_ACTIVITIES = [
    { id: 'debate',    name: 'Debate club',              egp: 500, smarts: 1, social: 3, happiness: 2, note: 'Public speaking and confidence.' },
    { id: 'ieee',      name: 'IEEE / engineering branch',egp: 800, smarts: 2, social: 2, happiness: 1, note: 'Technical community, networking.' },
    { id: 'model_un',  name: 'Model United Nations',     egp: 700, smarts: 1, social: 4, happiness: 2, note: 'Diplomacy, world issues.' },
    { id: 'theatre',   name: 'Student theatre',          egp: 300, smarts: 0, social: 3, happiness: 4, note: 'Creative outlet.' },
    { id: 'sports_team', name: 'University sports team', egp: 400, smarts: 0, social: 3, happiness: 3, health: 2, note: 'Teamwork, fitness.' },
    { id: 'newspaper', name: 'Student newspaper',        egp: 0,   smarts: 2, social: 2, happiness: 2, note: 'Writing, editing.' },
    { id: 'volunteering', name: 'Volunteer at local NGO',egp: 100, smarts: 1, social: 3, happiness: 3, note: 'Community impact.' },
    { id: 'business_club', name: 'Business / entrepreneurship club', egp: 600, smarts: 2, social: 3, happiness: 1, note: 'Case competitions, startups.' }
  ];

  function p70JoinActivity(id) {
    p70Init(S);
    if (!S.uni && !S.localMast && !S.mast) return hint('You need to be enrolled first.');
    const a = P70_ACTIVITIES.find(function (x) { return x.id === id; });
    if (!a) return hint('Activity not found.');
    if (S.p70.extracurriculars.indexOf(id) !== -1) return hint('Already in this club.');
    const egp = Math.round(a.egp * (typeof prOf === 'function' ? prOf(gameYear(), S) : 1));
    const internal = egp / ((typeof rateNow === 'function') ? rateNow() : 52.7);
    if (S.wealth < internal) return hint('Membership costs ' + egp.toLocaleString() + ' EGP.');
    S.wealth -= internal;
    if (internal > 0) {
      S.expenses = (S.expenses || 0) + internal;
      S.bill = S.bill || {};
      S.bill.extracurricular = (S.bill.extracurricular || 0) + internal;
    }
    S.p70.extracurriculars.push(id);
    fx({ smarts: a.smarts, social: a.social, happiness: a.happiness, health: a.health });
    log('🎭 Joined ' + a.name + '. ' + a.note);
    realismNotice('Joined ' + a.name, a.note);
    hint(); render();
  }
  window.p70JoinActivity = p70JoinActivity;

  function p70ActivityCard() {
    p70Init(S);
    if (!S.uni && !S.localMast && !S.mast && !S.degree) return '';
    const enrolled = !!(S.uni || S.localMast || S.mast);
    const joined = S.p70.extracurriculars || [];
    let html = '<section class="card"><h3>🎭 Student life & extracurriculars</h3>';
    if (!enrolled && S.degree) {
      html += '<p class="muted" style="font-size:.82rem">Already graduated. Extracurriculars are student-only.</p>';
    } else if (!enrolled) {
      html += '<p class="muted" style="font-size:.82rem">Enrol at a university first to join clubs.</p>';
    } else {
      html += '<p class="muted" style="font-size:.82rem">Join clubs while you study. You can join multiple.</p>';
    }
    if (enrolled) {
      P70_ACTIVITIES.forEach(function (a) {
        const inClub = joined.indexOf(a.id) !== -1;
        const egp = Math.round(a.egp * (typeof prOf === 'function' ? prOf(gameYear(), S) : 1));
        const canPay = S.wealth >= egp / ((typeof rateNow === 'function') ? rateNow() : 52.7);
        html += '<div style="margin-top:10px;padding:10px;border:1px solid ' + (inClub ? 'var(--mint)' : 'var(--line)') + ';border-radius:8px">' +
          '<b>' + a.name + '</b>' +
          '<div class="muted" style="font-size:.78rem;margin-top:3px">' + a.note + '</div>' +
          '<div class="row" style="border:0;padding:3px 0;font-size:.75rem"><span>Cost</span><b>' + (egp ? 'E£' + egp.toLocaleString() : 'Free') + '</b></div>' +
          (inClub
            ? '<p style="color:var(--mint);font-size:.8rem;margin-top:6px">✓ Member</p>'
            : '<button class="btn" style="margin-top:6px;font-size:.8rem;padding:6px" ' + (canPay ? '' : 'disabled') + ' onclick="p70JoinActivity(\'' + a.id + '\')">' + (canPay ? 'Join' : 'Cannot afford') + '</button>') +
          '</div>';
      });
    }
    html += '</section>';
    return html;
  }

  /* =============================================================
     PART 5 — EXCHANGE + INTERNSHIP
     ============================================================= */
  function p70ExchangeCard() {
    if (!S || (!S.uni && !S.localMast && !S.mast)) return '';
    p70Init(S);
    if (S.p70.exchangeUsed) {
      return '<section class="card"><h3>✈️ Exchange semester</h3><p style="color:var(--mint);font-size:.85rem">✓ Completed one exchange semester abroad.</p></section>';
    }
    const yearNow = S.uni ? (S.uni.year || 0) : 0;
    if (yearNow < 1 || yearNow > 3) {
      return '<section class="card"><h3>✈️ Exchange semester</h3><p class="muted" style="font-size:.82rem">Available in Year 2 or 3.</p></section>';
    }
    const opts = [
      { id: 'deu', name: '🇩🇪 Germany', egp: 250000, academic: 2, social: 4, note: 'TUM, RWTH, TU Berlin' },
      { id: 'fra', name: '🇫🇷 France',  egp: 280000, academic: 2, social: 4, note: 'Sorbonne, Sciences Po' },
      { id: 'usa', name: '🇺🇸 USA',     egp: 600000, academic: 2, social: 5, note: 'State university partners' },
      { id: 'gbr', name: '🇬🇧 UK',      egp: 500000, academic: 2, social: 5, note: 'Russell Group' },
      { id: 'tur', name: '🇹🇷 Türkiye', egp: 80000,  academic: 1, social: 3, note: 'Erasmus partner' },
      { id: 'jpn', name: '🇯🇵 Japan',   egp: 320000, academic: 2, social: 4, note: 'Tokyo, Kyoto network' }
    ];
    let html = '<section class="card" style="border-color:var(--cyan)"><h3>✈️ Exchange semester</h3>' +
      '<p class="muted" style="font-size:.82rem">Spend one semester abroad. Tuition covered at host, you pay travel + housing.</p>';
    opts.forEach(function (o) {
      const canPay = S.wealth >= o.egp / ((typeof rateNow === 'function') ? rateNow() : 52.7);
      html += '<button class="btn" style="margin-top:8px" ' + (canPay ? '' : 'disabled') + ' onclick="p70DoExchange(\'' + o.id + '\')">' +
        o.name + ' · E£' + o.egp.toLocaleString() +
        '<small>' + o.note + ' · +Smarts ' + o.academic + ', +Social ' + o.social + '</small>' +
        (canPay ? '' : '<small style="color:var(--rose)">Cannot afford</small>') + '</button>';
    });
    html += '</section>';
    return html;
  }

  function p70DoExchange(id) {
    p70Init(S);
    if (S.p70.exchangeUsed) return hint('Already did an exchange.');
    const opts = { deu: 250000, fra: 280000, usa: 600000, gbr: 500000, tur: 80000, jpn: 320000 };
    const egp = opts[id];
    if (!egp) return hint('Invalid.');
    const internal = egp / ((typeof rateNow === 'function') ? rateNow() : 52.7);
    if (S.wealth < internal) return hint('Not enough cash.');
    if (!confirm('Exchange semester abroad? Cost: E£' + egp.toLocaleString() + '.')) return;
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.exchange = (S.bill.exchange || 0) + internal;
    S.p70.exchangeUsed = true;
    S.p70.achievements.push('Exchange semester: ' + id);
    fx({ smarts: 3, social: 5, happiness: 6 });
    log('✈️ Completed one exchange semester abroad.');
    realismNotice('Exchange completed', 'You spent a semester abroad, boosted CV and network.');
    hint(); render();
  }
  window.p70DoExchange = p70DoExchange;

  function p70InternshipCard() {
    if (!S.uni) return '';
    p70Init(S);
    if (S.p70.internshipDone) {
      return '<section class="card"><h3>💼 Final-year internship</h3><p style="color:var(--mint);font-size:.85rem">✓ Completed.</p></section>';
    }
    const years = S.uni.yearsTotal || 4;
    const yearNow = S.uni.year || 0;
    if (yearNow < years - 1) {
      return '<section class="card"><h3>💼 Final-year internship</h3><p class="muted" style="font-size:.82rem">Available in your last year.</p></section>';
    }
    const opts = [
      { id: 'corp',    name: 'Corporate internship', egp: 120000, smarts: 3, social: 4, note: 'Bank, telecom, consulting.' },
      { id: 'startup', name: 'Startup internship',   egp: 60000,  smarts: 4, social: 2, note: 'More responsibility.' },
      { id: 'gov',     name: 'Government internship', egp: 40000, smarts: 1, social: 3, note: 'Stable, formal.' },
      { id: 'ngo',     name: 'NGO / international',  egp: 80000,  smarts: 3, social: 3, note: 'Purpose-driven.' }
    ];
    let html = '<section class="card" style="border-color:var(--violet)"><h3>💼 Final-year internship</h3>' +
      '<p class="muted" style="font-size:.82rem">Can convert to full-time offer after graduation.</p>';
    opts.forEach(function (o) {
      html += '<button class="btn" style="margin-top:8px" onclick="p70DoInternship(\'' + o.id + '\')">' +
        o.name + ' · ' + Math.round(o.egp * 0.1).toLocaleString() + ' EGP/month' +
        '<small>' + o.note + ' · +Smarts ' + o.smarts + ', +Social ' + o.social + '</small></button>';
    });
    html += '</section>';
    return html;
  }

  function p70DoInternship(id) {
    p70Init(S);
    if (S.p70.internshipDone) return hint('Already done.');
    if (!S.uni) return hint('You need to be enrolled.');
    const opts = {
      corp:    { name: 'Corporate',   egp: 120000, smarts: 3, social: 4 },
      startup: { name: 'Startup',     egp: 60000,  smarts: 4, social: 2 },
      gov:     { name: 'Government',  egp: 40000,  smarts: 1, social: 3 },
      ngo:     { name: 'NGO',         egp: 80000,  smarts: 3, social: 3 }
    };
    const o = opts[id];
    if (!o) return hint('Invalid.');
    const internal = o.egp / ((typeof rateNow === 'function') ? rateNow() : 52.7);
    S.wealth += internal;
    S.income = (S.income || 0) + internal;
    S.p70.internshipDone = true;
    S.p70.achievements.push('Final-year internship: ' + o.name);
    fx({ smarts: o.smarts, social: o.social, happiness: 2 });
    log('💼 Final-year internship at ' + o.name.toLowerCase() + '. Stipend: E£' + o.egp.toLocaleString() + '.');
    realismNotice('Internship completed', 'Final-year internship — strong for job market.');
    hint(); render();
  }
  window.p70DoInternship = p70DoInternship;

  /* =============================================================
     PART 6 — DEAN'S LIST
     ============================================================= */
  function p70DeansListCheck() {
    p70Init(S);
    if (!S.uni) return;
    const gpa = S.gpa || 0;
    if (gpa >= 3.7) {
      S.p70.deansListCount = (S.p70.deansListCount || 0) + 1;
      S.p70.achievements.push("Dean's List — age " + S.age);
      fx({ happiness: 4, social: 2 });
      log("🏅 Dean's List — GPA " + gpa.toFixed(2) + ".");
      realismNotice("Dean's List", 'Academic honors this year.');
    } else if (gpa >= 3.5) {
      S.p70.achievements.push('Academic merit — age ' + S.age);
      fx({ happiness: 2 });
      log('📜 Academic merit — GPA ' + gpa.toFixed(2) + '.');
    }
  }

  /* =============================================================
     PART 7 — ACHIEVEMENTS SUMMARY
     ============================================================= */
  function p70AchievementsCard() {
    p70Init(S);
    const ach = S.p70.achievements || [];
    const ex = S.p70.extracurriculars || [];
    const dean = S.p70.deansListCount || 0;
    if (!ach.length && !ex.length && !S.p70.exchangeUsed && !S.p70.internshipDone) return '';
    let html = '<section class="card"><h3>🏅 Academic achievements</h3>';
    if (S.degree) {
      html += '<div class="row"><span>Degree</span><b>' + ((typeof MAJORS !== 'undefined' && MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree) + '</b></div>';
      if (S.gpa) html += '<div class="row"><span>Final GPA</span><b>' + S.gpa.toFixed(2) + ' / 4.0</b></div>';
    }
    if (dean) html += '<div class="row"><span>Dean\'s List</span><b>' + dean + ' time(s)</b></div>';
    if (S.p70.exchangeUsed) html += '<div class="row"><span>Exchange semester</span><b>✓ Completed</b></div>';
    if (S.p70.internshipDone) html += '<div class="row"><span>Final-year internship</span><b>✓ Completed</b></div>';
    if (ex.length) html += '<div class="row"><span>Student clubs</span><b>' + ex.length + ' joined</b></div>';
    if (ach.length) {
      html += '<p class="muted" style="font-size:.78rem;margin-top:10px">Timeline</p>';
      ach.slice(-6).reverse().forEach(function (a) {
        html += '<div class="row" style="padding:3px 0;font-size:.78rem"><span>' + a + '</span></div>';
      });
    }
    html += '</section>';
    return html;
  }

  /* =============================================================
     PART 8 — LIFE EVENTS (p71)
     ============================================================= */

  /* ---- Private lessons ---- */
  function p71PrivateLessonsAvailable() {
    if (!S) return false;
    return S.age >= 9 && S.age <= 18 && !!S.school;
  }

  function p71TakePrivateLesson(subject) {
    p70Init(S);
    if (!p71PrivateLessonsAvailable()) return hint('Private lessons are for ages 9-18.');
    if (S.p71.lastLessonAge === S.age) return hint('Already took lessons this year.');
    const cost = Math.round((S.school === 'international' ? 8000 : S.school === 'private' ? 5000 : 3500) * ((typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1));
    const internal = cost / ((typeof rateNow === 'function') ? rateNow() : 52.7);
    if (S.wealth < internal && !(S.age < 18 && S.famWealth >= 1)) return hint('Lessons cost ' + cost.toLocaleString() + ' EGP.');
    let paidBy = 'self';
    if (S.age < 18 && S.famWealth >= 1) paidBy = 'family';
    else { S.wealth -= internal; S.expenses = (S.expenses || 0) + internal; S.bill = S.bill || {}; S.bill.privateLessons = (S.bill.privateLessons || 0) + internal; }
    S.p71.lastLessonAge = S.age;
    S.p71.privateLessons.push({ year: gameYear(), subject: subject, paidBy: paidBy });
    const smartsGain = S.school === 'international' ? 4 : 3;
    fx({ smarts: smartsGain, happiness: -1, health: -1 });
    log('📚 Took private lessons in ' + subject + ' (' + cost.toLocaleString() + ' EGP). Smarts +' + smartsGain + '.');
    realismNotice('Private lessons', 'Tutoring in ' + subject + ' — less free time, better grades.');
    if (paidBy === 'family') (typeof parents === 'function' ? parents() : []).forEach(function (p) { if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 2); });
    hint(); render();
  }
  window.p71TakePrivateLesson = p71TakePrivateLesson;

  function p71PrivateLessonsCard() {
    p70Init(S);
    if (!p71PrivateLessonsAvailable()) return '';
    const school = S.school || 'national';
    const cost = Math.round((school === 'international' ? 8000 : school === 'private' ? 5000 : 3500) * ((typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1));
    const taken = S.p71.lastLessonAge === S.age;
    const familyPays = S.age < 18 && S.famWealth >= 1;
    let html = '<section class="card" style="border-color:var(--cyan)"><h3>📚 Private lessons (دروس خصوصية)</h3>' +
      '<p class="muted" style="font-size:.82rem">After-school tutoring. Boosts Thanaweya score.</p>' +
      '<div class="row"><span>Cost this year</span><b class="mono">E£' + cost.toLocaleString() + '</b></div>' +
      (familyPays ? '<p class="muted" style="font-size:.78rem;color:var(--mint)">Family pays</p>' : '<p class="muted" style="font-size:.78rem;color:var(--amber)">You pay from cash</p>');
    if (taken) {
      html += '<p style="color:var(--mint);font-size:.85rem;margin-top:8px">✓ Already took lessons this year</p>';
    } else {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px">';
      ['Mathematics','Physics','Chemistry','Biology','English','Arabic','History'].forEach(function (subj) {
        html += '<button class="btn" style="margin:0;padding:6px;font-size:.75rem" onclick="p71TakePrivateLesson(\'' + subj + '\')">' + subj + '</button>';
      });
      html += '</div>';
    }
    html += '</section>';
    return html;
  }

  /* ---- Study group ---- */
  function p71JoinStudyGroup() {
    p70Init(S);
    if (S.age < 14 || S.age > 22) return hint('Ages 14-22.');
    if (S.p71.studyGroupActive) return hint('Already in a study group.');
    const cost = 600 * ((typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1);
    const internal = cost / ((typeof rateNow === 'function') ? rateNow() : 52.7);
    if (S.wealth < internal) return hint('Costs ' + cost.toLocaleString() + ' EGP.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.studyGroup = (S.bill.studyGroup || 0) + internal;
    S.p71.studyGroupActive = true;
    if (S.friends && S.friends.length < 8 && Math.random() < 0.7 && typeof addFriend === 'function') {
      const f = addFriend();
      if (f) log('👥 Met ' + f.name + ' in the study group.');
    }
    fx({ smarts: 3, social: 4, happiness: 2, health: -1 });
    log('👥 Joined a study group.');
    realismNotice('Study group', 'Classmates share notes; grades improve.');
    hint(); render();
  }
  window.p71JoinStudyGroup = p71JoinStudyGroup;

  function p71StudyGroupCard() {
    p70Init(S);
    if (S.age < 14 || S.age > 22) return '';
    if (S.p71.studyGroupActive) {
      return '<section class="card"><h3>👥 Study group</h3><p style="color:var(--mint);font-size:.85rem">✓ Active group.</p></section>';
    }
    return '<section class="card" style="border-color:var(--violet)"><h3>👥 Join a study group</h3>' +
      '<p class="muted" style="font-size:.82rem">Two or three classmates invite you to revise together.</p>' +
      '<div class="row"><span>Yearly cost</span><b class="mono">E£' + Math.round(600 * ((typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1)).toLocaleString() + '</b></div>' +
      '<button class="btn" onclick="p71JoinStudyGroup()">Join · +Smarts 3, +Social 4</button></section>';
  }

  /* ---- School trips ---- */
  const P71_TRIPS = [
    { id: 'pyramids',    name: 'Pyramids & Egyptian Museum',       egp: 400, smarts: 3, social: 2, happiness: 3 },
    { id: 'alexandria',  name: 'Alexandria — Library & Citadel',   egp: 600, smarts: 3, social: 2, happiness: 3 },
    { id: 'luxor',       name: 'Luxor & Aswan temples',             egp: 1500, smarts: 4, social: 3, happiness: 4 },
    { id: 'fayoum',      name: 'Wadi El Rayan / Fayoum oasis',      egp: 500, smarts: 2, social: 3, happiness: 4 },
    { id: 'sinai',       name: 'Saint Catherine / Sinai mountains', egp: 1800, smarts: 3, social: 3, happiness: 5 },
    { id: 'red_sea',     name: 'Red Sea snorkeling trip',           egp: 2200, smarts: 2, social: 4, happiness: 5 }
  ];

  function p71GoOnTrip(id) {
    p70Init(S);
    if (S.age < 10 || S.age > 18) return hint('Ages 10-18.');
    const t = P71_TRIPS.find(function (x) { return x.id === id; });
    if (!t) return hint('Trip not found.');
    if (S.p71.schoolTrips.indexOf(id + '-' + gameYear()) !== -1) return hint('Already went this year.');
    const cost = Math.round(t.egp * ((typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1));
    const internal = cost / ((typeof rateNow === 'function') ? rateNow() : 52.7);
    if (S.wealth < internal && !(S.famWealth >= 1 && Math.random() < 0.75)) return hint('Costs ' + cost.toLocaleString() + ' EGP.');
    let paidBy = 'self';
    if (S.famWealth >= 1 && Math.random() < 0.75) paidBy = 'family';
    else { S.wealth -= internal; S.expenses = (S.expenses || 0) + internal; }
    S.p71.schoolTrips.push(id + '-' + gameYear());
    fx({ smarts: t.smarts, social: t.social, happiness: t.happiness });
    log('🚌 School trip: ' + t.name + (paidBy === 'family' ? ' (family paid)' : '') + '.');
    realismNotice('School trip', 'You visited ' + t.name + '.');
    hint(); render();
  }
  window.p71GoOnTrip = p71GoOnTrip;

  function p71TripsCard() {
    p70Init(S);
    if (S.age < 10 || S.age > 18) return '';
    let html = '<section class="card"><h3>🚌 School trips</h3>' +
      '<p class="muted" style="font-size:.82rem">Every year your school organizes trips across Egypt.</p>';
    P71_TRIPS.forEach(function (t) {
      const done = S.p71.schoolTrips.indexOf(t.id + '-' + gameYear()) !== -1;
      const cost = Math.round(t.egp * ((typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1));
      html += '<button class="btn" style="margin-top:8px" ' + (done ? 'disabled' : '') + ' onclick="p71GoOnTrip(\'' + t.id + '\')">' +
        t.name + ' · E£' + cost.toLocaleString() +
        '<small>+Smarts ' + t.smarts + ', +Social ' + t.social + ', +Happy ' + t.happiness + (done ? ' · ✓ Done this year' : '') + '</small></button>';
    });
    html += '</section>';
    return html;
  }

  /* ---- Olympiads ---- */
  function p71EnterOlympiad(type) {
    p70Init(S);
    if (S.age < 12 || S.age > 18) return hint('Ages 12-18.');
    const options = {
      math: { name: 'Math Olympiad', smartsReq: 75, reward: 5000 },
      physics: { name: 'Physics Olympiad', smartsReq: 78, reward: 5000 },
      chemistry: { name: 'Chemistry Olympiad', smartsReq: 76, reward: 5000 },
      biology: { name: 'Biology Olympiad', smartsReq: 74, reward: 4000 },
      informatics: { name: 'Informatics Olympiad', smartsReq: 80, reward: 6000 },
      arabic: { name: 'Arabic Language Competition', smartsReq: 65, reward: 2000 },
      english: { name: 'English Language Competition', smartsReq: 70, reward: 3000 }
    };
    const opt = options[type];
    if (!opt) return hint('Unknown.');
    if ((S.smarts || 0) < opt.smartsReq) return hint(opt.name + ' needs ' + opt.smartsReq + '% Smarts.');
    const chance = Math.min(0.65, (S.smarts - opt.smartsReq) / 100 + 0.25);
    if (Math.random() < chance) {
      S.p71.olympiadWins++;
      S.wealth += opt.reward / ((typeof rateNow === 'function') ? rateNow() : 52.7);
      fx({ smarts: 2, social: 3, happiness: 5 });
      log('🥇 Won ' + opt.name + '! Prize: E£' + opt.reward.toLocaleString() + '.');
      realismNotice('Olympiad victory', 'Won ' + opt.name + '.');
    } else {
      fx({ smarts: 1, happiness: -1 });
      log('📝 Competed in ' + opt.name + ' but did not win.');
    }
    hint(); render();
  }
  window.p71EnterOlympiad = p71EnterOlympiad;

  function p71OlympiadCard() {
    p70Init(S);
    if (S.age < 12 || S.age > 18) return '';
    const options = [
      { id: 'math', name: 'Math Olympiad', req: 75, prize: 5000 },
      { id: 'physics', name: 'Physics Olympiad', req: 78, prize: 5000 },
      { id: 'chemistry', name: 'Chemistry Olympiad', req: 76, prize: 5000 },
      { id: 'biology', name: 'Biology Olympiad', req: 74, prize: 4000 },
      { id: 'informatics', name: 'Informatics Olympiad', req: 80, prize: 6000 }
    ];
    let html = '<section class="card" style="border-color:var(--amber)"><h3>🏆 School olympiads</h3>' +
      '<p class="muted" style="font-size:.82rem">Cash prizes, university attention, strong CV.</p>';
    if (S.p71.olympiadWins > 0) html += '<p style="color:var(--mint);font-size:.82rem;margin-top:6px">Wins: ' + S.p71.olympiadWins + '</p>';
    options.forEach(function (o) {
      const canEnter = (S.smarts || 0) >= o.req;
      html += '<button class="btn" style="margin-top:6px" ' + (canEnter ? '' : 'disabled') + ' onclick="p71EnterOlympiad(\'' + o.id + '\')">' +
        o.name + ' · Prize E£' + o.prize.toLocaleString() +
        '<small>' + (canEnter ? 'Enter' : 'Needs ' + o.req + '% Smarts') + '</small></button>';
    });
    html += '</section>';
    return html;
  }

  /* ---- Thanaweya stress ---- */
  function p71ThanaweyaStressCard() {
    p70Init(S);
    if (S.age < 16 || S.age > 18 || S.country !== 'egy') return '';
    const stress = S.p71.thanaweyaStress || 0;
    const sc = stress >= 7 ? 'var(--rose)' : stress >= 4 ? 'var(--amber)' : 'var(--mint)';
    return '<section class="card"><h3>📖 Thanaweya Amma pressure</h3>' +
      '<div class="row"><span>Stress level</span><b style="color:' + sc + '">' + stress + ' / 10</b></div>' +
      '<p class="muted" style="font-size:.82rem">The final high-school year determines faculty admission.</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px">' +
      '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'study\')">Study extra<small>+Smarts 3, +Stress 2</small></button>' +
      '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'rest\')">Rest<small>-Stress 2, +Happy 3</small></button>' +
      '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'family\')">Talk to family<small>-Stress 3, +Bond</small></button>' +
      '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'ignore\')">Push through<small>+Smarts 2, +Stress 4</small></button>' +
      '</div></section>';
  }

  function p71HandleStress(action) {
    p70Init(S);
    if (action === 'study') { S.p71.thanaweyaStress = Math.min(10, S.p71.thanaweyaStress + 2); fx({ smarts: 3, happiness: -2, health: -1 }); log('📚 Studied extra hours for Thanaweya.'); }
    else if (action === 'rest') { S.p71.thanaweyaStress = Math.max(0, S.p71.thanaweyaStress - 2); fx({ happiness: 3, smarts: -1 }); log('😌 Rest day.'); }
    else if (action === 'family') { S.p71.thanaweyaStress = Math.max(0, S.p71.thanaweyaStress - 3); (typeof parents === 'function' ? parents() : []).forEach(function (p) { if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 5); }); fx({ happiness: 2 }); log('👨‍👩‍👧 Talked to family.'); }
    else if (action === 'ignore') {
      S.p71.thanaweyaStress = Math.min(10, S.p71.thanaweyaStress + 4);
      fx({ smarts: 2, health: -2 });
      log('😰 Pushed through without rest.');
      if (S.p71.thanaweyaStress >= 8 && Math.random() < 0.3) {
        fx({ happiness: -8, health: -4 });
        log('🚨 Burnout!');
        realismNotice('Burnout', 'The pressure has become overwhelming.');
      }
    }
    hint(); render();
  }
  window.p71HandleStress = p71HandleStress;

  /* ---- University events ---- */
  function p71UniversityEventsCard() {
    if (!S.uni) return '';
    p70Init(S);
    const year = (S.uni.year || 0) + 1;
    const options = [];
    if (year === 1) {
      options.push({ id: 'orientation', title: 'University orientation week', text: 'Clubs, activities, hundreds of new faces.', choices: [
        { label: 'Attend everything', fx: { social: 5, happiness: 3, smarts: 1 }, msg: 'Met dozens of people, joined two clubs.' },
        { label: 'Stay quiet', fx: { social: 1, happiness: -1 }, msg: 'Kept to yourself first week.' }
      ]});
    }
    if (year === 2) {
      options.push({ id: 'career_fair', title: 'Career fair', text: 'Companies on campus.', choices: [
        { label: 'Attend and network', fx: { social: 3, smarts: 2 }, msg: 'Talked to five recruiters.' },
        { label: 'Skip', fx: {}, msg: 'Did not attend.' }
      ]});
    }
    const isLastYear = year >= (S.uni.yearsTotal || 4);
    if (isLastYear) {
      options.push({ id: 'grad_project', title: 'Graduation project', text: 'Choose ambitious or safe topic.', choices: [
        { label: 'Ambitious', fx: { smarts: 5, happiness: -2 }, msg: 'Demanding but learned more.' },
        { label: 'Safe', fx: { smarts: 2 }, msg: 'Passed without drama.' }
      ]});
    }
    if (!options.length) return '';
    const chosen = options[Math.floor(Math.random() * options.length)];
    const already = S.p71.universityEvents.indexOf(chosen.id + '-' + gameYear());
    if (already !== -1) return '';
    return '<section class="card" style="border-color:var(--cyan)"><h3>🎓 ' + chosen.title + '</h3>' +
      '<p class="muted" style="font-size:.84rem">' + chosen.text + '</p>' +
      chosen.choices.map(function (c, i) {
        return '<button class="btn" style="margin-top:6px" onclick="p71ResolveUniversityEvent(\'' + chosen.id + '\',' + i + ')">' + c.label + '</button>';
      }).join('') + '</section>';
  }

  function p71ResolveUniversityEvent(eventId, choiceIdx) {
    p70Init(S);
    const choices = {
      orientation: [
        { fx: { social: 5, happiness: 3, smarts: 1 }, msg: 'Met dozens of people.' },
        { fx: { social: 1, happiness: -1 }, msg: 'Kept to yourself.' }
      ],
      career_fair: [
        { fx: { social: 3, smarts: 2 }, msg: 'Recruiters talked.' },
        { fx: {}, msg: 'Skipped.' }
      ],
      grad_project: [
        { fx: { smarts: 5, happiness: -2 }, msg: 'Ambitious project.' },
        { fx: { smarts: 2 }, msg: 'Safe project.' }
      ]
    };
    const list = choices[eventId];
    if (!list || !list[choiceIdx]) return;
    const c = list[choiceIdx];
    if (c.fx) fx(c.fx);
    S.p71.universityEvents.push(eventId + '-' + gameYear());
    log('🎓 ' + c.msg);
    realismNotice('University life', c.msg);
    hint(); render();
  }
  window.p71ResolveUniversityEvent = p71ResolveUniversityEvent;

  /* ---- Vocational school ---- */
  function p71VocationalCard() {
    if (S.age !== 18 || S.degree || S.uni || S.p71.vocationalTrack) return '';
    if (S.country !== 'egy' || !S.diploma) return '';
    return '<section class="card" style="border-color:var(--amber)"><h3>🔧 Vocational / technical school</h3>' +
      '<p class="muted" style="font-size:.82rem">Alternative to university. 2-3 years. Skilled trade.</p>' +
      '<button class="btn" style="margin-top:8px" onclick="p71ChooseVocational(\'industrial\')">🔩 Industrial</button>' +
      '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'commercial\')">📊 Commercial</button>' +
      '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'nursing\')">🏥 Nursing</button>' +
      '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'agriculture\')">🌾 Agricultural</button></section>';
  }

  function p71ChooseVocational(track) {
    p70Init(S);
    if (S.degree || S.uni) return hint('Cannot switch after starting university.');
    S.p71.vocationalTrack = true;
    S.p71.vocationalType = track;
    fx({ smarts: 2, happiness: 2, social: 2 });
    log('🔧 Enrolled in ' + track + ' vocational school.');
    realismNotice('Vocational', 'Chose ' + track + ' track.');
    if (!S.diploma) S.diploma = true;
    hint(); render();
  }
  window.p71ChooseVocational = p71ChooseVocational;

  /* =============================================================
     PART 9 — ageUp WRAPPER (deans list + stress effects)
     ============================================================= */
  const _ageUp = ageUp;
  ageUp = function () {
    const ageBefore = S && S.age;
    const wasStudying = !!(S && S.uni);
    const wasSchoolAge = !!(S && S.school);
    const r = _ageUp.apply(this, arguments);
    if (!S || S.age === ageBefore) return r;

    /* Dean's list */
    if (wasStudying) {
      try { p70DeansListCheck(); } catch (e) { console.error('Deans list failed:', e); }
    }
    /* Thanaweya stress effects */
    if (S.p71 && S.p71.thanaweyaStress >= 6 && S.age >= 16 && S.age <= 19) {
      fx({ health: -2, happiness: -2 });
      log('⚠️ Thanaweya Amma stress is affecting health and mood.');
    }
    /* Reset annual lesson flag */
    if (S.p71) S.p71.lastLessonAge = -1;
    return r;
  };

  /* =============================================================
     PART 10 — viewSchool WRAPPER (adds cards from 70 + 71)
     ============================================================= */
  const _viewSchool = viewSchool;
  viewSchool = function () {
    let html = '';
    try { html = _viewSchool.apply(this, arguments); } catch (e) { console.error('[p70] viewSchool failed:', e); html = ''; }
    if (!S || S.age < 6) return html;

    /* --- p70 cards (university-level) --- */
    if (S.country === 'egy' && S.age >= 16 && S.age <= 22 && !S.degree && !S.uni) {
      html = p70CutoffsTable() + html;
    }
    if (S.uni || S.localMast || S.mast) {
      html += p70ActivityCard();
    }
    if (S.uni) {
      html += p70ExchangeCard();
      html += p70InternshipCard();
    }
    html += p70AchievementsCard();

    /* --- p71 cards (school-age events) --- */
    if (S.age >= 9 && S.age <= 18 && S.school) {
      html += p71PrivateLessonsCard();
    }
    if (S.age >= 10 && S.age <= 18) {
      html += p71TripsCard();
    }
    if (S.age >= 12 && S.age <= 18) {
      html += p71OlympiadCard();
    }
    if (S.age >= 14 && S.age <= 22) {
      html += p71StudyGroupCard();
    }
    if (S.age >= 16 && S.age <= 18 && S.country === 'egy') {
      html += p71ThanaweyaStressCard();
    }
    html += p71VocationalCard();
    if (S.uni) {
      html += p71UniversityEventsCard();
    }

    return html;
  };

  /* =============================================================
     PART 11 — INIT
     ============================================================= */
  p70Init(S);
  console.log('[p70] Education + life events (Phase 3.2) loaded');
})();
