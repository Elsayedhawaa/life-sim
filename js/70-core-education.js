/* =====================================================================
   70. CORE EDUCATION
   Phase 3.2 consolidation of:
     - 70-education-deep-improvements.js
     - 71-education-life-events.js
   Plus: Life tab cleanup (extended family, social standing should
         not appear there — they belong in Relationships)
   Load AFTER 69-study-abroad-system.js and BEFORE 72-faculty-career-connection.js
   ===================================================================== */

(function p70Core() {
  'use strict';

  /* =================================================================
     PART 1 — STATE (p70 + p71 combined, both migrated)
     ================================================================= */
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
  const _migrate = migrate;
  migrate = function (o) { const r = _migrate(o); p70Init(r); return r; };
  const _newGame = newGame;
  newGame = function () { _newGame.apply(this, arguments); p70Init(S); };

  /* =================================================================
     PART 2 — SMARTS LOCK + GPA FORMULA (from p70)
     ================================================================= */
  const _fx = fx;
  fx = function (o) {
    p70Init(S);
    const r = _fx.apply(this, arguments);
    if (S.p70.smartsLocked) S.smarts = 100;
    if ((Number(S.smarts) || 0) >= 100) S.p70.smartsLocked = true;
    return r;
  };

  function p70ComputeGpa(smarts, effort) {
    const s = Math.max(0, Math.min(100, Number(smarts) || 50));
    const e = effort || (S && S.effort) || 'coast';
    let gpa = 1.85 + (s / 100) * 2.0;
    if (e === 'hard') gpa += 0.3;
    else if (e === 'skip') gpa -= 0.6;
    return Math.max(0, Math.min(4, gpa));
  }
  if (typeof p50ComputeG === 'function') {
    const _p50 = p50ComputeG;
    p50ComputeG = function () {
      const base = p70ComputeGpa(S.smarts, S.effort);
      const noise = Math.random() * 0.3 - 0.15;
      return Math.max(0, Math.min(4, base + noise));
    };
  }

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
      if (Array.isArray(S.logRows)) {
        S.logRows.unshift({ age: S.age, t: '📊 GPA recalculated from ' + old.toFixed(2) + ' to ' + expected.toFixed(2) + ' (current smarts ' + smarts + '%)' });
      }
      if (typeof save === 'function') save();
    }
  }
  setTimeout(p70RecalibrateGpa, 500);
  setTimeout(p70RecalibrateGpa, 2000);

  /* =================================================================
     PART 3 — THANAWEYA AMMA CUTOFFS (from p70)
     ================================================================= */
  const P70_EGY_CUTOFFS = {
    medicine: 91.5, dentistry: 90.8, pharmacy: 89.2, physical_therapy: 85.0,
    veterinary: 85.5, engineering: 83.5, computer_science: 80.0, science: 76.5,
    nursing: 70.0, business: 72.0, commerce: 70.5, economics: 74.0,
    law: 68.5, arts: 65.0, education: 62.5, mass_comm: 72.0,
    agriculture: 63.0
  };
  const P70_MAJOR_TO_CUTOFF = {
    medicine: 'medicine', law: 'law', cs: 'computer_science',
    business: 'business', biology: 'science'
  };

  if (typeof enrollEgyptUniversity === 'function') {
    const _enroll = enrollEgyptUniversity;
    enrollEgyptUniversity = function (uniId, faculty, funder) {
      if (S.country === 'egy') {
        const thana = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || (S.gpa ? S.gpa / 4 * 100 : 0);
        const key = String(faculty || '').toLowerCase().replace(/\s+/g, '_');
        const cutoff = P70_EGY_CUTOFFS[key];
        if (cutoff && thana > 0 && thana < cutoff) {
          if (typeof hint === 'function') hint('❌ Thanaweya Amma cutoff for ' + faculty + ' is ' + cutoff + '%. Your score is ' + thana.toFixed(1) + '%.');
          return;
        }
      }
      return _enroll.apply(this, arguments);
    };
  }

  function p70CutoffsTable() {
    const thana = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || null;
    const rows = Object.keys(P70_EGY_CUTOFFS).sort(function (a, b) { return P70_EGY_CUTOFFS[b] - P70_EGY_CUTOFFS[a]; }).map(function (key) {
      const cutoff = P70_EGY_CUTOFFS[key];
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
      const elig = thana == null ? null : thana >= cutoff;
      const col = elig == null ? 'var(--muted)' : elig ? 'var(--mint)' : 'var(--rose)';
      return '<div class="row" style="padding:4px 0;font-size:.82rem"><span>' + label + '</span><span><b class="mono" style="color:' + col + '">' + cutoff + '%</b>' + (elig != null ? ' <span style="font-size:.7rem;color:' + col + '">' + (elig ? '✓' : '✗') + '</span>' : '') + '</span></div>';
    }).join('');
    return '<section class="card"><h3>📊 Egyptian university cutoffs (Thanaweya Amma)</h3>' +
      '<p class="muted" style="font-size:.82rem">Public universities in Egypt admit by Thanaweya Amma percentage.</p>' +
      (thana != null ? '<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span><b>Your score</b></span><b class="mono" style="color:var(--cyan)">' + thana.toFixed(1) + '%</b></div>' : '<p class="muted" style="font-size:.78rem">Get your Thanaweya result at 18.</p>') +
      rows + '</section>';
  }

  /* =================================================================
     PART 4 — UNIVERSITY ACTIVITIES (from p70)
     ================================================================= */
  const P70_ACTIVITIES = [
    { id: 'debate',       name: 'Debate club',                   egp: 500,  smarts: 1, social: 3, happiness: 2, note: 'Public speaking and confidence.' },
    { id: 'ieee',         name: 'IEEE / engineering student branch', egp: 800, smarts: 2, social: 2, happiness: 1, note: 'Technical community, competitions.' },
    { id: 'model_un',     name: 'Model United Nations',          egp: 700,  smarts: 1, social: 4, happiness: 2, note: 'Diplomacy, strong for CV.' },
    { id: 'theatre',      name: 'Student theatre',               egp: 300,  smarts: 0, social: 3, happiness: 4, note: 'Creative outlet.' },
    { id: 'sports_team',  name: 'University sports team',        egp: 400,  smarts: 0, social: 3, happiness: 3, health: 2, note: 'Physical fitness, teamwork.' },
    { id: 'newspaper',    name: 'Student newspaper',             egp: 0,    smarts: 2, social: 2, happiness: 2, note: 'Writing, editing.' },
    { id: 'volunteering', name: 'Volunteer at local NGO',        egp: 100,  smarts: 1, social: 3, happiness: 3, note: 'Community impact, references.' },
    { id: 'business_club',name: 'Business / entrepreneurship club', egp: 600, smarts: 2, social: 3, happiness: 1, note: 'Case competitions.' }
  ];

  window.p70JoinActivity = function (id) {
    p70Init(S);
    if (!S.uni && !S.localMast && !S.mast) return hint('Enrol first.');
    const a = P70_ACTIVITIES.find(function (x) { return x.id === id; });
    if (!a) return hint('Activity not found.');
    if (S.p70.extracurriculars.indexOf(id) !== -1) return hint('Already a member.');
    const egp = Math.round(a.egp * (typeof prOf === 'function' ? prOf(gameYear(), S) : 1));
    const internal = egp / (typeof rateNow === 'function' ? rateNow() : 52.7);
    if (S.wealth < internal) return hint('Membership costs E£' + egp.toLocaleString() + '.');
    S.wealth -= internal;
    if (internal > 0) { S.expenses = (S.expenses || 0) + internal; S.bill = S.bill || {}; S.bill.extracurricular = (S.bill.extracurricular || 0) + internal; }
    S.p70.extracurriculars.push(id);
    fx({ smarts: a.smarts, social: a.social, happiness: a.happiness, health: a.health });
    log('🎭 Joined ' + a.name + '. ' + a.note);
    render();
  };

  function p70ActivityCard() {
    p70Init(S);
    if (!S.uni && !S.localMast && !S.mast && !S.degree) return '';
    const enrolled = !!(S.uni || S.localMast || S.mast);
    const joined = S.p70.extracurriculars || [];
    let html = '<section class="card"><h3>🎭 Student life & extracurriculars</h3>';
    if (!enrolled) html += '<p class="muted" style="font-size:.82rem">Enrol to join clubs.</p>';
    else {
      html += '<p class="muted" style="font-size:.82rem">Join clubs while you study. They build skills and a CV.</p>';
      P70_ACTIVITIES.forEach(function (a) {
        const inC = joined.indexOf(a.id) !== -1;
        const egp = Math.round(a.egp * (typeof prOf === 'function' ? prOf(gameYear(), S) : 1));
        const canPay = S.wealth >= egp / (typeof rateNow === 'function' ? rateNow() : 52.7);
        html += '<div style="margin-top:10px;padding:10px;border:1px solid ' + (inC ? 'var(--mint)' : 'var(--line)') + ';border-radius:8px">' +
          '<div style="display:flex;justify-content:space-between;gap:8px"><div style="min-width:0;flex:1"><b>' + a.name + '</b><div class="muted" style="font-size:.78rem;margin-top:3px">' + a.note + '</div></div>' +
          '<div style="text-align:right;flex-shrink:0"><div class="mono" style="font-size:.82rem">' + (egp ? 'E£' + egp.toLocaleString() : 'Free') + '</div></div></div>' +
          (inC ? '<p style="color:var(--mint);font-size:.8rem;margin-top:6px">✓ Member</p>'
               : '<button class="btn" style="margin-top:6px;font-size:.8rem;padding:6px" ' + (canPay ? '' : 'disabled') + ' onclick="p70JoinActivity(\'' + a.id + '\')">' + (canPay ? 'Join' : 'Cannot afford') + '</button>') +
          '</div>';
      });
    }
    html += '</section>';
    return html;
  }

  /* =================================================================
     PART 5 — EXCHANGE SEMESTER (from p70)
     ================================================================= */
  function p70ExchangeCard() {
    if (!S || (!S.uni && !S.localMast && !S.mast)) return '';
    p70Init(S);
    if (S.p70.exchangeUsed) return '<section class="card"><h3>✈️ Exchange semester</h3><p style="color:var(--mint);font-size:.85rem">✓ Completed.</p></section>';
    const yearNow = S.uni ? (S.uni.year || 0) : 0;
    if (yearNow < 1 || yearNow > 3) return '<section class="card"><h3>✈️ Exchange semester</h3><p class="muted" style="font-size:.82rem">Available in Year 2 or 3.</p></section>';
    const opts = [
      { id:'deu', name:'🇩🇪 Germany', egp:250000, academic:2, social:4, note:'TUM, RWTH, TU Berlin' },
      { id:'fra', name:'🇫🇷 France',  egp:280000, academic:2, social:4, note:'Sorbonne, Sciences Po' },
      { id:'usa', name:'🇺🇸 USA',     egp:600000, academic:2, social:5, note:'State university partners' },
      { id:'gbr', name:'🇬🇧 UK',      egp:500000, academic:2, social:5, note:'Russell Group' },
      { id:'tur', name:'🇹🇷 Türkiye', egp:80000,  academic:1, social:3, note:'Erasmus partner' },
      { id:'jpn', name:'🇯🇵 Japan',   egp:320000, academic:2, social:4, note:'Tokyo, Kyoto partner' }
    ];
    let html = '<section class="card" style="border-color:var(--cyan)"><h3>✈️ Exchange semester</h3><p class="muted" style="font-size:.82rem">One semester abroad. Boosts CV, network, language.</p>';
    opts.forEach(function (o) {
      const can = S.wealth >= o.egp / (typeof rateNow === 'function' ? rateNow() : 52.7);
      html += '<button class="btn" style="margin-top:8px" ' + (can ? '' : 'disabled') + ' onclick="p70DoExchange(\'' + o.id + '\')">' +
        o.name + ' · E£' + o.egp.toLocaleString() + '<small>' + o.note + ' · +Smarts ' + o.academic + ', +Social ' + o.social + '</small>' +
        (can ? '' : '<small style="color:var(--rose)">Cannot afford</small>') + '</button>';
    });
    html += '</section>';
    return html;
  }

  window.p70DoExchange = function (id) {
    p70Init(S);
    if (S.p70.exchangeUsed) return hint('Already did an exchange.');
    const opts = { deu:250000, fra:280000, usa:600000, gbr:500000, tur:80000, jpn:320000 };
    const egp = opts[id]; if (!egp) return hint('Invalid.');
    const internal = egp / (typeof rateNow === 'function' ? rateNow() : 52.7);
    if (S.wealth < internal) return hint('Not enough cash.');
    if (!confirm('Spend a semester abroad? Cost: E£' + egp.toLocaleString() + '.')) return;
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.exchange = (S.bill.exchange || 0) + internal;
    S.p70.exchangeUsed = true;
    S.p70.achievements.push('Exchange semester: ' + id);
    fx({ smarts: 3, social: 5, happiness: 6 });
    log('✈️ Completed one exchange semester abroad.');
    render();
  };

  /* =================================================================
     PART 6 — FINAL-YEAR INTERNSHIP (from p70)
     ================================================================= */
  function p70InternshipCard() {
    if (!S.uni) return '';
    p70Init(S);
    if (S.p70.internshipDone) return '<section class="card"><h3>💼 Final-year internship</h3><p style="color:var(--mint);font-size:.85rem">✓ Completed.</p></section>';
    const years = S.uni.yearsTotal || 4;
    const yearNow = S.uni.year || 0;
    if (yearNow < years - 1) return '<section class="card"><h3>💼 Final-year internship</h3><p class="muted" style="font-size:.82rem">Available in your last year.</p></section>';
    const opts = [
      { id:'corp', name:'Corporate (bank, telecom)', egp:120000, smarts:3, social:4, note:'Pays well, strong CV.' },
      { id:'startup', name:'Startup', egp:60000, smarts:4, social:2, note:'More responsibility.' },
      { id:'gov', name:'Government', egp:40000, smarts:1, social:3, note:'Stable, less pay.' },
      { id:'ngo', name:'NGO / international', egp:80000, smarts:3, social:3, note:'Purpose-driven.' }
    ];
    let html = '<section class="card" style="border-color:var(--violet)"><h3>💼 Final-year internship</h3><p class="muted" style="font-size:.82rem">Can convert to a full-time offer.</p>';
    opts.forEach(function (o) {
      html += '<button class="btn" style="margin-top:8px" onclick="p70DoInternship(\'' + o.id + '\')">' +
        o.name + ' · ' + Math.round(o.egp * 0.1).toLocaleString() + ' EGP/month<small>' + o.note + '</small></button>';
    });
    html += '</section>';
    return html;
  }

  window.p70DoInternship = function (id) {
    p70Init(S);
    if (S.p70.internshipDone) return hint('Already done.');
    if (!S.uni) return hint('Need to be enrolled.');
    const opts = { corp:{n:'Corporate',e:120000,s:3,so:4}, startup:{n:'Startup',e:60000,s:4,so:2}, gov:{n:'Government',e:40000,s:1,so:3}, ngo:{n:'NGO',e:80000,s:3,so:3} };
    const o = opts[id]; if (!o) return hint('Invalid.');
    const internal = o.e / (typeof rateNow === 'function' ? rateNow() : 52.7);
    S.wealth += internal;
    S.income = (S.income || 0) + internal;
    S.p70.internshipDone = true;
    S.p70.achievements.push('Final-year internship: ' + o.n);
    fx({ smarts: o.s, social: o.so, happiness: 2 });
    log('💼 Final-year internship at ' + o.n + ' — stipend E£' + o.e.toLocaleString() + '.');
    render();
  };

  /* =================================================================
     PART 7 — DEAN'S LIST + ACHIEVEMENTS (from p70)
     ================================================================= */
  function p70DeansListCheck() {
    p70Init(S);
    if (!S.uni) return;
    const gpa = S.gpa || 0;
    if (gpa >= 3.7) {
      S.p70.deansListCount++;
      S.p70.achievements.push("Dean's List — age " + S.age + " (GPA " + gpa.toFixed(2) + ')');
      fx({ happiness: 4, social: 2 });
      log("🏅 Dean's List — GPA " + gpa.toFixed(2) + '.');
    } else if (gpa >= 3.5) {
      S.p70.achievements.push('Academic merit — age ' + S.age + ' (GPA ' + gpa.toFixed(2) + ')');
      fx({ happiness: 2 });
      log('📜 Academic merit — GPA ' + gpa.toFixed(2) + '.');
    }
  }

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
      ach.slice(-6).reverse().forEach(function (a) { html += '<div class="row" style="padding:3px 0;font-size:.78rem"><span>' + a + '</span></div>'; });
    }
    html += '</section>';
    return html;
  }

  /* =================================================================
     PART 8 — PRIVATE LESSONS (from p71)
     ================================================================= */
  function p71LessonsAvailable() {
    if (!S || S.age < 9 || S.age > 18 || !S.school) return false;
    return true;
  }

  function p71LessonsCard() {
    p70Init(S);
    if (!p71LessonsAvailable()) return '';
    const school = S.school || 'national';
    const cost = (school === 'international' ? 8000 : school === 'private' ? 5000 : 3500);
    const taken = S.p71.lastLessonAge === S.age;
    const famPays = S.age < 18 && S.famWealth >= 1;
    let html = '<section class="card" style="border-color:var(--cyan)"><h3>📚 Private lessons (دروس خصوصية)</h3>' +
      '<p class="muted" style="font-size:.82rem">In Egypt almost every serious student takes after-school private lessons.</p>' +
      '<div class="row"><span>Cost</span><b class="mono">E£' + cost.toLocaleString() + '</b></div>' +
      (famPays ? '<p class="muted" style="font-size:.78rem;color:var(--mint)">Your family will pay</p>' : '<p class="muted" style="font-size:.78rem;color:var(--amber)">You will pay from cash</p>');
    if (taken) html += '<p style="color:var(--mint);font-size:.85rem;margin-top:8px">✓ Already took lessons this year</p>';
    else {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px">';
      ['Mathematics','Physics','Chemistry','Biology','English','Arabic','History'].forEach(function (s) {
        html += '<button class="btn" style="margin:0;padding:6px;font-size:.75rem" onclick="p71TakeLesson(\'' + s + '\')">' + s + '</button>';
      });
      html += '</div>';
    }
    html += '</section>';
    return html;
  }

  window.p71TakeLesson = function (subject) {
    p70Init(S);
    if (!p71LessonsAvailable()) return hint('Private lessons are for school-age students.');
    if (S.p71.lastLessonAge === S.age) return hint('Already took lessons this year.');
    const school = S.school || 'national';
    const cost = Math.round((school === 'international' ? 8000 : school === 'private' ? 5000 : 3500) * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1));
    const internal = cost / (typeof rateNow === 'function' ? rateNow() : 52.7);
    let paidBy = 'self';
    if (S.age < 18 && S.famWealth >= 1) paidBy = 'family';
    else if (S.wealth >= internal) { S.wealth -= internal; S.expenses = (S.expenses || 0) + internal; S.bill = S.bill || {}; S.bill.privateLessons = (S.bill.privateLessons || 0) + internal; }
    else return hint('Family cannot afford, and you do not have E£' + cost.toLocaleString() + '.');
    S.p71.lastLessonAge = S.age;
    S.p71.privateLessons.push({ year: gameYear(), subject: subject, paidBy: paidBy });
    const gain = school === 'international' ? 4 : 3;
    fx({ smarts: gain, happiness: -1, health: -1 });
    log('📚 Private lessons in ' + subject + ' (' + cost.toLocaleString() + ' EGP). Smarts +' + gain + '.');
    if (paidBy === 'family') {
      (typeof parents === 'function' ? parents() : []).forEach(function (p) { if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 2); });
    }
    render();
  };

  /* =================================================================
     PART 9 — STUDY GROUP (from p71)
     ================================================================= */
  function p71StudyGroupCard() {
    p70Init(S);
    if (S.age < 14 || S.age > 22) return '';
    if (S.p71.studyGroupActive) return '<section class="card"><h3>👥 Study group</h3><p style="color:var(--mint);font-size:.85rem">✓ Active member.</p></section>';
    return '<section class="card" style="border-color:var(--violet)"><h3>👥 Join a study group</h3>' +
      '<p class="muted" style="font-size:.82rem">Two or three classmates revise together.</p>' +
      '<div class="row"><span>Yearly cost</span><b class="mono">E£600</b></div>' +
      '<button class="btn" onclick="p71JoinGroup()">Join study group · +Smarts 3, +Social 4</button></section>';
  }

  window.p71JoinGroup = function () {
    p70Init(S);
    if (S.age < 14 || S.age > 22) return hint('Not available.');
    if (S.p71.studyGroupActive) return hint('Already in one.');
    const cost = 600 * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1);
    const internal = cost / (typeof rateNow === 'function' ? rateNow() : 52.7);
    if (S.wealth < internal) return hint('Costs E£' + cost.toLocaleString() + '.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.p71.studyGroupActive = true;
    if (typeof addFriend === 'function' && S.friends && S.friends.length < 8 && Math.random() < 0.7) {
      const f = addFriend();
      if (f) log('👥 You met ' + f.name + ' in the study group.');
    }
    fx({ smarts: 3, social: 4, happiness: 2, health: -1 });
    log('👥 Joined a study group.');
    render();
  };

  /* =================================================================
     PART 10 — SCHOOL TRIPS (from p71)
     ================================================================= */
  const P71_TRIPS = [
    { id:'pyramids',   name:'Pyramids & Egyptian Museum', egp:400,  smarts:3, social:2, happiness:3 },
    { id:'alexandria', name:'Alexandria',                 egp:600,  smarts:3, social:2, happiness:3 },
    { id:'luxor',      name:'Luxor & Aswan',              egp:1500, smarts:4, social:3, happiness:4 },
    { id:'fayoum',     name:'Fayoum oasis',               egp:500,  smarts:2, social:3, happiness:4 },
    { id:'sinai',      name:'Saint Catherine / Sinai',    egp:1800, smarts:3, social:3, happiness:5 },
    { id:'red_sea',    name:'Red Sea snorkeling',         egp:2200, smarts:2, social:4, happiness:5 }
  ];

  function p71TripsCard() {
    p70Init(S);
    if (S.age < 10 || S.age > 18) return '';
    let html = '<section class="card"><h3>🚌 School trips</h3><p class="muted" style="font-size:.82rem">Yearly trips across Egypt.</p>';
    P71_TRIPS.forEach(function (t) {
      const done = S.p71.schoolTrips.indexOf(t.id + '-' + gameYear()) !== -1;
      html += '<button class="btn" style="margin-top:8px" ' + (done ? 'disabled' : '') + ' onclick="p71GoTrip(\'' + t.id + '\')">' +
        t.name + ' · E£' + t.egp.toLocaleString() + '<small>+Smarts ' + t.smarts + ', +Social ' + t.social + ', +Happy ' + t.happiness + (done ? ' · ✓ Done' : '') + '</small></button>';
    });
    html += '</section>';
    return html;
  }

  window.p71GoTrip = function (id) {
    p70Init(S);
    if (S.age < 10 || S.age > 18) return hint('Ages 10-18 only.');
    const t = P71_TRIPS.find(function (x) { return x.id === id; });
    if (!t) return hint('Trip not found.');
    if (S.p71.schoolTrips.indexOf(t.id + '-' + gameYear()) !== -1) return hint('Already went this year.');
    const cost = t.egp * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1);
    const internal = cost / (typeof rateNow === 'function' ? rateNow() : 52.7);
    let paidBy = 'self';
    if (S.famWealth >= 1 && Math.random() < 0.75) paidBy = 'family';
    else if (S.wealth >= internal) { S.wealth -= internal; S.expenses = (S.expenses || 0) + internal; }
    else return hint('Trip costs E£' + Math.round(cost).toLocaleString() + '.');
    S.p71.schoolTrips.push(t.id + '-' + gameYear());
    fx({ smarts: t.smarts, social: t.social, happiness: t.happiness });
    log('🚌 Went on: ' + t.name + (paidBy === 'family' ? ' (family paid)' : '') + '.');
    render();
  };

  /* =================================================================
     PART 11 — OLYMPIADS (from p71)
     ================================================================= */
  const P71_OLYMPIADS = {
    math:        { name:'Math Olympiad',        smartsReq:75, reward:5000 },
    physics:     { name:'Physics Olympiad',     smartsReq:78, reward:5000 },
    chemistry:   { name:'Chemistry Olympiad',   smartsReq:76, reward:5000 },
    biology:     { name:'Biology Olympiad',     smartsReq:74, reward:4000 },
    informatics: { name:'Informatics Olympiad', smartsReq:80, reward:6000 }
  };

  function p71OlympiadCard() {
    p70Init(S);
    if (S.age < 12 || S.age > 18) return '';
    let html = '<section class="card" style="border-color:var(--amber)"><h3>🏆 School olympiads</h3><p class="muted" style="font-size:.82rem">National olympiads for talented students.</p>';
    if (S.p71.olympiadWins > 0) html += '<p style="color:var(--mint);font-size:.82rem;margin-top:6px">Wins: ' + S.p71.olympiadWins + '</p>';
    Object.keys(P71_OLYMPIADS).forEach(function (k) {
      const o = P71_OLYMPIADS[k];
      const can = (S.smarts || 0) >= o.smartsReq;
      html += '<button class="btn" style="margin-top:6px" ' + (can ? '' : 'disabled') + ' onclick="p71EnterOlympiad(\'' + k + '\')">' + o.name + ' · Prize E£' + o.reward.toLocaleString() + '<small>' + (can ? 'Enter competition' : 'Needs ' + o.smartsReq + '% Smarts') + '</small></button>';
    });
    html += '</section>';
    return html;
  }

  window.p71EnterOlympiad = function (type) {
    p70Init(S);
    if (S.age < 12 || S.age > 18) return hint('Ages 12-18 only.');
    const o = P71_OLYMPIADS[type];
    if (!o) return hint('Unknown competition.');
    if ((S.smarts || 0) < o.smartsReq) return hint(o.name + ' requires ' + o.smartsReq + '% Smarts.');
    const chance = Math.min(0.65, (S.smarts - o.smartsReq) / 100 + 0.25);
    if (Math.random() < chance) {
      S.p71.olympiadWins++;
      S.wealth += o.reward / (typeof rateNow === 'function' ? rateNow() : 52.7);
      fx({ smarts: 2, social: 3, happiness: 5 });
      log('🥇 Won ' + o.name + '! Prize: E£' + o.reward.toLocaleString() + '.');
    } else {
      fx({ smarts: 1, happiness: -1 });
      log('📝 Competed in ' + o.name + ' but did not win.');
    }
    render();
  };

  /* =================================================================
     PART 12 — THANAWEYA STRESS (from p71)
     ================================================================= */
  function p71StressCard() {
    p70Init(S);
    if (S.age < 16 || S.age > 18 || S.country !== 'egy') return '';
    const stress = S.p71.thanaweyaStress;
    const col = stress >= 7 ? 'var(--rose)' : stress >= 4 ? 'var(--amber)' : 'var(--mint)';
    return '<section class="card"><h3>📖 Thanaweya Amma pressure</h3>' +
      '<div class="row"><span>Stress level</span><b style="color:' + col + '">' + stress + ' / 10</b></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px">' +
      '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'study\')">Study extra<small>+Smarts 3, +Stress 2</small></button>' +
      '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'rest\')">Rest day<small>-Stress 2, +Happy 3</small></button>' +
      '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'family\')">Talk to family<small>-Stress 3</small></button>' +
      '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'ignore\')">Push through<small>+Smarts 2, +Stress 4</small></button>' +
      '</div></section>';
  }

  window.p71HandleStress = function (action) {
    p70Init(S);
    if (action === 'study') { S.p71.thanaweyaStress = Math.min(10, S.p71.thanaweyaStress + 2); fx({ smarts: 3, happiness: -2, health: -1 }); log('📚 Extra study hours.'); }
    else if (action === 'rest') { S.p71.thanaweyaStress = Math.max(0, S.p71.thanaweyaStress - 2); fx({ happiness: 3, smarts: -1 }); log('😌 Rest day.'); }
    else if (action === 'family') { S.p71.thanaweyaStress = Math.max(0, S.p71.thanaweyaStress - 3); (typeof parents === 'function' ? parents() : []).forEach(function (p) { if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 5); }); fx({ happiness: 2 }); log('👨‍👩‍👧 Talked with family.'); }
    else if (action === 'ignore') {
      S.p71.thanaweyaStress = Math.min(10, S.p71.thanaweyaStress + 4);
      fx({ smarts: 2, health: -2 });
      log('😰 Pushed through.');
      if (S.p71.thanaweyaStress >= 8 && Math.random() < 0.3) {
        fx({ happiness: -8, health: -4 });
        log('🚨 Burnout!');
      }
    }
    render();
  };

  /* =================================================================
     PART 13 — UNIVERSITY LIFE EVENTS (from p71)
     ================================================================= */
  function p71UniEventsCard() {
    if (!S.uni) return '';
    p70Init(S);
    const year = (S.uni.year || 0) + 1;
    const options = [];
    if (year === 1) {
      options.push({ id:'orientation', title:'Orientation week', text:'Clubs and hundreds of new faces.', choices:[
        { label:'Attend every event', fx:{ social:5, happiness:3, smarts:1 }, msg:'Met dozens of new people.' },
        { label:'Stay quiet', fx:{ social:1, happiness:-1 }, msg:'Kept to yourself.' }
      ]});
    }
    if (year === 2) {
      options.push({ id:'career_fair', title:'Career fair', text:'Big companies on campus.', choices:[
        { label:'Attend and network', fx:{ social:3, smarts:2 }, msg:'Talked to five recruiters.' },
        { label:'Skip', fx:{}, msg:'Missed it.' }
      ]});
    }
    if (year === 3) {
      options.push({ id:'summer_job', title:'Summer internship opportunity', text:'A company is offering a summer internship.', choices:[
        { label:'Apply for it', fx:{ smarts:3, social:2 }, msg: Math.random()<0.5?'Got the internship.':'Not selected.' },
        { label:'Focus on grades', fx:{ smarts:3 }, msg:'Studied all summer.' }
      ]});
    }
    const isLast = year >= (S.uni.yearsTotal || 4);
    if (isLast) {
      options.push({ id:'grad_project', title:'Graduation project', text:'Final-year project.', choices:[
        { label:'Ambitious topic', fx:{ smarts:5, happiness:-2 }, msg:'Demanding but rewarding.' },
        { label:'Safe topic', fx:{ smarts:2 }, msg:'Passed without drama.' }
      ]});
    }
    if (!options.length) return '';
    const chosen = options[Math.floor(Math.random() * options.length)];
    const already = S.p71.universityEvents.indexOf(chosen.id + '-' + gameYear());
    if (already !== -1) return '';
    return '<section class="card" style="border-color:var(--cyan)"><h3>🎓 ' + chosen.title + '</h3>' +
      '<p class="muted" style="font-size:.84rem">' + chosen.text + '</p>' +
      chosen.choices.map(function (c, i) {
        return '<button class="btn" style="margin-top:6px" onclick="p71ResolveUniEvent(\'' + chosen.id + '\',' + i + ')">' + c.label + '</button>';
      }).join('') + '</section>';
  }

  window.p71ResolveUniEvent = function (eventId, idx) {
    p70Init(S);
    const choices = {
      orientation: [{ fx:{ social:5, happiness:3, smarts:1 }, msg:'Met dozens of new people.' }, { fx:{ social:1, happiness:-1 }, msg:'Kept to yourself.' }],
      career_fair: [{ fx:{ social:3, smarts:2 }, msg:'Talked to five recruiters.' }, { fx:{}, msg:'Missed it.' }],
      summer_job: [{ fx:{ smarts:3, social:2 }, msg:'Got the internship.' }, { fx:{ smarts:3 }, msg:'Studied all summer.' }],
      grad_project: [{ fx:{ smarts:5, happiness:-2 }, msg:'Ambitious project.' }, { fx:{ smarts:2 }, msg:'Safe project.' }]
    };
    const list = choices[eventId];
    if (!list || !list[idx]) return;
    const c = list[idx];
    if (c.fx) fx(c.fx);
    S.p71.universityEvents.push(eventId + '-' + gameYear());
    log('🎓 ' + c.msg);
    render();
  };

  /* =================================================================
     PART 14 — VOCATIONAL SCHOOL (from p71)
     ================================================================= */
  function p71VocationalCard() {
    p70Init(S);
    if (S.age !== 18 || S.degree || S.uni || S.p71.vocationalTrack) return '';
    if (S.country !== 'egy' || !S.diploma) return '';
    return '<section class="card" style="border-color:var(--amber)"><h3>🔧 Vocational / technical school</h3>' +
      '<p class="muted" style="font-size:.82rem">Alternative to university. 2-3 year programs.</p>' +
      '<button class="btn" style="margin-top:8px" onclick="p71ChooseVocational(\'industrial\')">🔩 Industrial (electrician, mechanic)</button>' +
      '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'commercial\')">📊 Commercial (accounting, retail)</button>' +
      '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'nursing\')">🏥 Nursing</button>' +
      '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'agriculture\')">🌾 Agricultural</button>' +
      '</section>';
  }

  window.p71ChooseVocational = function (track) {
    p70Init(S);
    if (S.degree || S.uni) return hint('Already started university.');
    S.p71.vocationalTrack = true;
    S.p71.vocationalType = track;
    fx({ smarts: 2, happiness: 2, social: 2 });
    log('🔧 Enrolled in ' + track + ' vocational school.');
    if (!S.diploma) S.diploma = true;
    render();
  };

  /* =================================================================
     PART 15 — SINGLE viewSchool WRAPPER
     ================================================================= */
  const _viewSchool = viewSchool;
  viewSchool = function () {
    let html = '';
    try { html = _viewSchool.apply(this, arguments); } catch (e) { console.error('[p70] viewSchool chain failed:', e); html = ''; }
    if (!S) return html;

    /* Insert Thanaweya cutoffs for school-age in Egypt */
    if (S.country === 'egy' && S.age >= 16 && S.age <= 22 && !S.degree) {
      html = p70CutoffsTable() + html;
    }

    /* Extracurriculars when enrolled */
    if (S.uni || S.localMast || S.mast) {
      html += p70ActivityCard();
      if (S.uni) {
        html += p70ExchangeCard();
        html += p70InternshipCard();
      }
    }

    /* Achievements summary */
    html += p70AchievementsCard();

    /* Life events (school-age) */
    if (S.age >= 9 && S.age <= 18 && S.school) html += p71LessonsCard();
    if (S.age >= 10 && S.age <= 18) html += p71TripsCard();
    if (S.age >= 12 && S.age <= 18) html += p71OlympiadCard();
    if (S.age >= 14 && S.age <= 22) html += p71StudyGroupCard();
    if (S.age >= 16 && S.age <= 18 && S.country === 'egy') html += p71StressCard();
    html += p71VocationalCard();
    if (S.uni) html += p71UniEventsCard();

    return html;
  };

  /* =================================================================
     PART 16 — SINGLE ageUp WRAPPER
     ================================================================= */
  const _ageUp = ageUp;
  ageUp = function () {
    const a0 = S && S.age;
    const wasStudying = !!(S && S.uni);
    const r = _ageUp.apply(this, arguments);
    if (!S || S.age === a0) return r;

    if (wasStudying) {
      try { p70DeansListCheck(); } catch (e) {}
    }
    if (S.p71 && S.p71.thanaweyaStress >= 6 && S.age >= 16 && S.age <= 18) {
      fx({ health: -2, happiness: -2 });
      log('⚠️ Thanaweya Amma stress is affecting your health.');
    }
    if (S.p71) S.p71.lastLessonAge = -1;
    return r;
  };

  /* =================================================================
     PART 17 — LIFE TAB CLEANUP (extended family / social standing / etc.)
     Uses a 250ms watchdog because other files' wrappers run after ours.
     ================================================================= */
  function p70LifeTabCleanup() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'life') return;
    const view = document.getElementById('view');
    if (!view) return;

    /* Cards that belong in Relationships, not Life */
    const wrongHeadings = [
      '👨‍👩‍👧‍👦 Extended family',
      '⭐ Social Standing',
      '💍 Marriage expectations'
    ];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const h3 = sec.querySelector('h3');
      if (!h3) return;
      const t = (h3.textContent || '').trim();
      for (let i = 0; i < wrongHeadings.length; i++) {
        if (t.indexOf(wrongHeadings[i]) !== -1) { sec.remove(); return; }
      }
      /* Family business card also stripped */
      if (t.indexOf('💼') === 0 && (sec.textContent || '').indexOf('Family ownership') !== -1) sec.remove();
      /* Trust fund also stripped */
      if (t.indexOf('🏦 Family Trust Fund') !== -1) sec.remove();
      /* Household staff also stripped */
      if (t.indexOf('👥 Household staff') !== -1) sec.remove();
    });
  }
  setInterval(p70LifeTabCleanup, 250);

  /* =================================================================
     PART 18 — INIT
     ================================================================= */
  p70Init(S);
  console.log('[p70] Core education (Phase 3.2) loaded');
})();
