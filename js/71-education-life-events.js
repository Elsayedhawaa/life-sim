/* =====================================================================
   71. EDUCATION LIFE EVENTS — Real Egyptian school & university culture
   - Private tutoring economy (huge in Egypt)
   - School trips, competitions, olympiads
   - Thanaweya Amma stress & family pressure
   - University social life, study groups, career fairs
   - Vocational/trade school alternative
   - Exam anxiety & mental health
   - Every event connects to family, career, or money
   Load AFTER 70-education-deep-improvements.js and BEFORE 99-boot.js
   ===================================================================== */

function p71Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p71Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p71EGP(egp) { return Math.round(egp * p71Idx()); }

/* =================================================================
   STATE
   ================================================================= */
function p71Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p71) o.p71 = {};
  const d = o.p71;
  if (!Array.isArray(d.privateLessons)) d.privateLessons = [];
  if (typeof d.studyGroupActive !== 'boolean') d.studyGroupActive = false;
  if (typeof d.olympiadWins !== 'number') d.olympiadWins = 0;
  if (typeof d.thanaweyaStress !== 'number') d.thanaweyaStress = 0;
  if (!Array.isArray(d.schoolTrips)) d.schoolTrips = [];
  if (typeof d.cheated !== 'boolean') d.cheated = false;
  if (!Array.isArray(d.universityEvents)) d.universityEvents = [];
  if (typeof d.vocationalTrack !== 'boolean') d.vocationalTrack = false;
  if (typeof d.lastLessonAge !== 'number') d.lastLessonAge = -1;
}
const P71_migrate = migrate;
migrate = function (o) { const r = P71_migrate(o); p71Init(r); return r; };
const P71_newGame = newGame;
newGame = function () { P71_newGame.apply(this, arguments); p71Init(S); };

/* =================================================================
   1. PRIVATE LESSONS SYSTEM (دروس خصوصية) — the Egyptian way
   ================================================================= */
function p71PrivateLessonsAvailable() {
  if (!S) return false;
  if (S.age < 9 || S.age > 18) return false;
  if (!S.school) return false;
  return true;
}

function p71TakePrivateLesson(subject) {
  p71Init(S);
  if (!p71PrivateLessonsAvailable()) return hint('Private lessons are for school-age students.');
  if (S.p71.lastLessonAge === S.age) return hint('You already took private lessons this year.');

  const cost = p71EGP(S.school === 'international' ? 8000 : S.school === 'private' ? 5000 : 3500);
  const internal = cost / p71Rate();
  if (S.wealth < internal && !(S.age < 18 && S.famWealth >= 1)) {
    return hint('Private lessons cost ' + cost.toLocaleString() + ' EGP. Your family cannot afford them.');
  }

  /* Family pays for under-18s with reasonable wealth */
  let paidBy = 'self';
  if (S.age < 18 && S.famWealth >= 1) {
    paidBy = 'family';
  } else {
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.privateLessons = (S.bill.privateLessons || 0) + internal;
  }

  S.p71.lastLessonAge = S.age;
  S.p71.privateLessons.push({ year: gameYear(), subject: subject, paidBy: paidBy });

  const smartsGain = S.school === 'international' ? 4 : 3;
  fx({ smarts: smartsGain, happiness: -1, health: -1 });

  log('📚 Took private lessons in ' + subject + ' (' + cost.toLocaleString() + ' EGP). Smarts +' + smartsGain + '.');
  realismNotice('Private lessons', 'You took after-school tutoring in ' + subject + '. Your grades improve, but you have less free time.');

  /* Family bond may change */
  if (paidBy === 'family') {
    (typeof parents === 'function' ? parents() : []).forEach(function (p) {
      if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 2);
    });
  }

  hint(); render();
}
window.p71TakePrivateLesson = p71TakePrivateLesson;

function p71PrivateLessonsCard() {
  p71Init(S);
  if (!p71PrivateLessonsAvailable()) return '';
  const school = S.school || 'national';
  const cost = p71EGP(school === 'international' ? 8000 : school === 'private' ? 5000 : 3500);
  const taken = S.p71.lastLessonAge === S.age;
  const familyPays = S.age < 18 && S.famWealth >= 1;

  let html = '<section class="card" style="border-color:var(--cyan)"><h3>📚 Private lessons (دروس خصوصية)</h3>' +
    '<p class="muted" style="font-size:.82rem">In Egypt, almost every serious student takes after-school private lessons. They boost your Thanaweya Amma score but cost time and money.</p>' +
    '<div class="row"><span>Cost this year</span><b class="mono">E£' + cost.toLocaleString() + '</b></div>' +
    (familyPays ? '<p class="muted" style="font-size:.78rem;color:var(--mint)">Your family will pay (they can afford it)</p>' : '<p class="muted" style="font-size:.78rem;color:var(--amber)">You will pay from your own cash</p>');

  if (taken) {
    html += '<p style="color:var(--mint);font-size:.85rem;margin-top:8px">✓ Already took lessons this year</p>';
  } else {
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px">';
    ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Arabic', 'History'].forEach(function (subj) {
      html += '<button class="btn" style="margin:0;padding:6px;font-size:.75rem" onclick="p71TakePrivateLesson(\'' + subj + '\')">' + subj + '</button>';
    });
    html += '</div>';
  }

  if (S.p71.privateLessons.length > 1) {
    html += '<p class="muted" style="font-size:.75rem;margin-top:10px">Total lessons taken: ' + S.p71.privateLessons.length + '</p>';
  }

  html += '</section>';
  return html;
}

/* =================================================================
   2. STUDY GROUP — join classmates for shared revision
   ================================================================= */
function p71JoinStudyGroup() {
  p71Init(S);
  if (S.age < 14 || S.age > 22) return hint('Study groups are for high-school and university students.');
  if (S.p71.studyGroupActive) return hint('You are already in a study group.');

  const cost = p71EGP(600);
  const internal = cost / p71Rate();
  if (S.wealth < internal) return hint('Study group snacks and materials cost about ' + cost.toLocaleString() + ' EGP.');

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.studyGroup = (S.bill.studyGroup || 0) + internal;

  S.p71.studyGroupActive = true;

  /* Add a friend or two from the group */
  if (S.friends && S.friends.length < 8 && Math.random() < 0.7) {
    const f = addFriend();
    if (f) log('👥 You met ' + f.name + ' in the study group.');
  }

  fx({ smarts: 3, social: 4, happiness: 2, health: -1 });
  log('👥 Joined a study group. You revise with classmates, share notes, and get through the material together.');
  realismNotice('Study group', 'You joined a small group of students who study together. Grades improve, friendships form, and you see the material from different angles.');
  hint(); render();
}
window.p71JoinStudyGroup = p71JoinStudyGroup;

function p71StudyGroupCard() {
  p71Init(S);
  if (S.age < 14 || S.age > 22) return '';
  if (S.p71.studyGroupActive) {
    return '<section class="card"><h3>👥 Study group</h3>' +
      '<p style="color:var(--mint);font-size:.85rem">✓ You are part of an active study group. Regular shared revision keeps your grades strong.</p>' +
      '</section>';
  }
  return '<section class="card" style="border-color:var(--violet)"><h3>👥 Join a study group</h3>' +
    '<p class="muted" style="font-size:.82rem">Two or three classmates invite you to revise together at someone\'s house or a café. Shared notes and group pressure make studying easier.</p>' +
    '<div class="row"><span>Yearly cost (snacks, materials)</span><b class="mono">E£' + p71EGP(600).toLocaleString() + '</b></div>' +
    '<button class="btn" onclick="p71JoinStudyGroup()">Join study group · +Smarts 3, +Social 4</button>' +
    '</section>';
}

/* =================================================================
   3. SCHOOL TRIPS (real Egyptian school trips)
   ================================================================= */
const P71_TRIPS = [
  { id: 'pyramids',    name: 'Pyramids & Egyptian Museum',       egp: 400, smarts: 3, social: 2, happiness: 3 },
  { id: 'alexandria',  name: 'Alexandria — Library & Citadel',   egp: 600, smarts: 3, social: 2, happiness: 3 },
  { id: 'luxor',       name: 'Luxor & Aswan temples',             egp: 1500, smarts: 4, social: 3, happiness: 4 },
  { id: 'fayoum',      name: 'Wadi El Rayan / Fayoum oasis',      egp: 500, smarts: 2, social: 3, happiness: 4 },
  { id: 'sinai',       name: 'Saint Catherine / Sinai mountains', egp: 1800, smarts: 3, social: 3, happiness: 5 },
  { id: 'red_sea',     name: 'Red Sea snorkeling trip',           egp: 2200, smarts: 2, social: 4, happiness: 5 }
];

function p71GoOnTrip(id) {
  p71Init(S);
  if (S.age < 10 || S.age > 18) return hint('School trips are for ages 10–18.');
  const trip = P71_TRIPS.find(function (t) { return t.id === id; });
  if (!trip) return hint('Trip not found.');
  if (S.p71.schoolTrips.indexOf(id + '-' + gameYear()) !== -1) return hint('You already went on this trip this year.');

  const cost = p71EGP(trip.egp);
  const internal = cost / p71Rate();
  if (S.wealth < internal && !(S.famWealth >= 1 && Math.random() < 0.75)) {
    return hint('Trip costs ' + cost.toLocaleString() + ' EGP. Your family cannot afford it.');
  }

  /* Family pays for most */
  let paidBy = 'self';
  if (S.famWealth >= 1 && Math.random() < 0.75) {
    paidBy = 'family';
  } else {
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
  }

  S.p71.schoolTrips.push(id + '-' + gameYear());
  fx({ smarts: trip.smarts, social: trip.social, happiness: trip.happiness });
  log('🚌 Went on the school trip: ' + trip.name + (paidBy === 'family' ? ' (family paid)' : '') + '.');
  realismNotice('School trip', 'You visited ' + trip.name + '. A memorable break from classrooms and revision.');
  hint(); render();
}
window.p71GoOnTrip = p71GoOnTrip;

function p71TripsCard() {
  p71Init(S);
  if (S.age < 10 || S.age > 18) return '';
  let html = '<section class="card"><h3>🚌 School trips</h3>' +
    '<p class="muted" style="font-size:.82rem">Every year your school organizes trips across Egypt. Your parents often pay, but not always.</p>';
  P71_TRIPS.forEach(function (t) {
    const done = S.p71.schoolTrips.indexOf(t.id + '-' + gameYear()) !== -1;
    const cost = p71EGP(t.egp);
    html += '<button class="btn" style="margin-top:8px" ' + (done ? 'disabled' : '') + ' onclick="p71GoOnTrip(\'' + t.id + '\')">' +
      t.name + ' · E£' + cost.toLocaleString() +
      '<small>+Smarts ' + t.smarts + ', +Social ' + t.social + ', +Happy ' + t.happiness + (done ? ' · ✓ Done this year' : '') + '</small>' +
      '</button>';
  });
  html += '</section>';
  return html;
}

/* =================================================================
   4. OLYMPIADS & COMPETITIONS
   ================================================================= */
function p71EnterOlympiad(type) {
  p71Init(S);
  if (S.age < 12 || S.age > 18) return hint('Olympiads are for ages 12–18.');

  const options = {
    math:     { name: 'Math Olympiad',      smartsReq: 75, reward: 5000 },
    physics:  { name: 'Physics Olympiad',   smartsReq: 78, reward: 5000 },
    chemistry:{ name: 'Chemistry Olympiad', smartsReq: 76, reward: 5000 },
    biology:  { name: 'Biology Olympiad',   smartsReq: 74, reward: 4000 },
    informatics: { name: 'Informatics Olympiad', smartsReq: 80, reward: 6000 },
    arabic:   { name: 'Arabic Language Competition', smartsReq: 65, reward: 2000 },
    english:  { name: 'English Language Competition', smartsReq: 70, reward: 3000 }
  };
  const opt = options[type];
  if (!opt) return hint('Unknown competition.');

  if ((S.smarts || 0) < opt.smartsReq) {
    return hint(opt.name + ' requires ' + opt.smartsReq + '% Smarts. Yours: ' + (S.smarts || 0) + '%.');
  }

  /* Roll for result */
  const chance = Math.min(0.65, (S.smarts - opt.smartsReq) / 100 + 0.25);
  const roll = Math.random();

  if (roll < chance) {
    S.p71.olympiadWins++;
    S.wealth += opt.reward / p71Rate();
    fx({ smarts: 2, social: 3, happiness: 5 });
    log('🥇 Won ' + opt.name + '! Prize: E£' + opt.reward.toLocaleString() + '.');
    realismNotice('Olympiad victory', 'You won ' + opt.name + '. This is a huge achievement for university applications and your CV.');

    /* Prestigious university attention */
    if (S.smarts >= 90) {
      S.p71.achievements = S.p71.achievements || [];
      S.p71.achievements.push(opt.name + ' winner');
    }
  } else {
    fx({ smarts: 1, happiness: -1 });
    log('📝 Competed in ' + opt.name + ' but did not win.');
  }
  hint(); render();
}
window.p71EnterOlympiad = p71EnterOlympiad;

function p71OlympiadCard() {
  p71Init(S);
  if (S.age < 12 || S.age > 18) return '';
  const options = [
    { id: 'math', name: 'Math Olympiad', req: 75, prize: 5000 },
    { id: 'physics', name: 'Physics Olympiad', req: 78, prize: 5000 },
    { id: 'chemistry', name: 'Chemistry Olympiad', req: 76, prize: 5000 },
    { id: 'biology', name: 'Biology Olympiad', req: 74, prize: 4000 },
    { id: 'informatics', name: 'Informatics Olympiad', req: 80, prize: 6000 }
  ];
  let html = '<section class="card" style="border-color:var(--amber)"><h3>🏆 School olympiads</h3>' +
    '<p class="muted" style="font-size:.82rem">Egyptian national olympiads for talented students. Winners get cash prizes, university attention, and a strong CV.</p>';
  if (S.p71.olympiadWins > 0) {
    html += '<p style="color:var(--mint);font-size:.82rem;margin-top:6px">Wins: ' + S.p71.olympiadWins + '</p>';
  }
  options.forEach(function (o) {
    const canEnter = (S.smarts || 0) >= o.req;
    html += '<button class="btn" style="margin-top:6px" ' + (canEnter ? '' : 'disabled') + ' onclick="p71EnterOlympiad(\'' + o.id + '\')">' +
      o.name + ' · Prize E£' + o.prize.toLocaleString() +
      '<small>' + (canEnter ? 'Enter competition' : 'Needs ' + o.req + '% Smarts') + '</small>' +
      '</button>';
  });
  html += '</section>';
  return html;
}

/* =================================================================
   5. THANAWEYA AMMA STRESS (ages 16-18)
   ================================================================= */
function p71ThanaweyaStressCard() {
  p71Init(S);
  if (S.age < 16 || S.age > 18 || S.country !== 'egy') return '';
  const stress = S.p71.thanaweyaStress || 0;
  const stressColor = stress >= 7 ? 'var(--rose)' : stress >= 4 ? 'var(--amber)' : 'var(--mint)';
  let html = '<section class="card"><h3>📖 Thanaweya Amma pressure</h3>' +
    '<div class="row"><span>Your stress level</span><b style="color:' + stressColor + '">' + stress + ' / 10</b></div>' +
    '<p class="muted" style="font-size:.82rem">The final high-school year determines which faculty you can enter. In Egypt, this is often described as "the year that decides your life".</p>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px">' +
    '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'study\')">Study extra hours<small>+Smarts 3, +Stress 2, -Happy 2</small></button>' +
    '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'rest\')">Take a rest day<small>-Stress 2, +Happy 3, -Smarts 1</small></button>' +
    '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'family\')">Talk to your family<small>-Stress 3, +Family bond</small></button>' +
    '<button class="btn" style="margin:0;padding:8px;font-size:.75rem" onclick="p71HandleStress(\'ignore\')">Push through<small>+Smarts 2, +Stress 4</small></button>' +
    '</div></section>';
  return html;
}

function p71HandleStress(action) {
  p71Init(S);
  if (action === 'study') {
    S.p71.thanaweyaStress = Math.min(10, S.p71.thanaweyaStress + 2);
    fx({ smarts: 3, happiness: -2, health: -1 });
    log('📚 You studied extra hours for Thanaweya Amma.');
  } else if (action === 'rest') {
    S.p71.thanaweyaStress = Math.max(0, S.p71.thanaweyaStress - 2);
    fx({ happiness: 3, smarts: -1 });
    log('😌 You took a rest day. Your mind feels clearer.');
  } else if (action === 'family') {
    S.p71.thanaweyaStress = Math.max(0, S.p71.thanaweyaStress - 3);
    (typeof parents === 'function' ? parents() : []).forEach(function (p) {
      if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 5);
    });
    fx({ happiness: 2 });
    log('👨‍👩‍👧 You talked with your family about exam pressure. They listened.');
  } else if (action === 'ignore') {
    S.p71.thanaweyaStress = Math.min(10, S.p71.thanaweyaStress + 4);
    fx({ smarts: 2, health: -2 });
    log('😰 You pushed through without rest. Your health is suffering.');
    if (S.p71.thanaweyaStress >= 8 && Math.random() < 0.3) {
      fx({ happiness: -8, health: -4 });
      log('🚨 Burnout! The pressure has become overwhelming. You need serious rest.');
      realismNotice('Burnout from exam stress', 'You pushed yourself too hard. Take care of your health — mental health matters more than grades.');
    }
  }
  hint(); render();
}
window.p71HandleStress = p71HandleStress;

/* =================================================================
   6. UNIVERSITY LIFE EVENTS
   ================================================================= */
function p71UniversityEventsCard() {
  if (!S.uni) return '';
  p71Init(S);
  const year = (S.uni.year || 0) + 1;
  const options = [];

  /* Year 1 — orientation, friendships */
  if (year === 1) {
    options.push({ id: 'orientation', title: 'University orientation week', text: 'Your first week at university. Clubs, activities, and hundreds of new faces.', choices: [
      { label: 'Attend every event', fx: { social: 5, happiness: 3, smarts: 1 }, msg: 'You met dozens of new people and joined two clubs.' },
      { label: 'Stay quiet and observe', fx: { social: 1, happiness: -1 }, msg: 'You kept to yourself the first week. It felt lonely but manageable.' }
    ]});
    options.push({ id: 'first_exam', title: 'First university exam', text: 'Your first exam at university. The format is different from high school.', choices: [
      { label: 'Study hard', fx: { smarts: 4, happiness: -1 }, msg: 'You studied hard and passed comfortably.' },
      { label: 'Rely on your high-school knowledge', fx: { smarts: 1 }, msg: 'You did okay but realised university is a different challenge.' }
    ]});
  }

  /* Year 2 — networking, career */
  if (year === 2) {
    options.push({ id: 'career_fair', title: 'Career fair', text: 'Big companies are hosting a career fair on campus.', choices: [
      { label: 'Attend and network', fx: { social: 3, smarts: 2 }, msg: 'You talked to five recruiters and got two contact cards.' },
      { label: 'Skip it', fx: {}, msg: 'You did not attend.' }
    ]});
    options.push({ id: 'student_union', title: 'Student union elections', text: 'The student union is holding elections. Running could boost your reputation.', choices: [
      { label: 'Run for a position', fx: { social: 5, happiness: -1 }, msg: Math.random() < 0.4 ? 'You won! You are now a student union representative.' : 'You ran but did not win. The experience was valuable.' },
      { label: 'Just vote', fx: { social: 1 }, msg: 'You voted for a classmate.' },
      { label: 'Ignore politics', fx: {}, msg: 'You stayed out of it.' }
    ]});
  }

  /* Year 3 — specialisation, project */
  if (year === 3) {
    options.push({ id: 'summer_job', title: 'Summer internship opportunity', text: 'A company is offering a summer internship to strong students.', choices: [
      { label: 'Apply for it', fx: { smarts: 3, social: 2 }, msg: Math.random() < 0.5 ? 'You got the internship. It was intense but rewarding.' : 'You applied but were not selected. Still worth trying.' },
      { label: 'Focus on grades', fx: { smarts: 3 }, msg: 'You used the summer to study and prepare for final year.' }
    ]});
  }

  /* Year 4 (or last) — graduation project, job hunt */
  const isLastYear = year >= (S.uni.yearsTotal || 4);
  if (isLastYear) {
    options.push({ id: 'grad_project', title: 'Graduation project', text: 'Your final-year project is due. You can choose a hard but impressive topic, or a safe one.', choices: [
      { label: 'Ambitious topic', fx: { smarts: 5, happiness: -2 }, msg: 'You chose an ambitious project. It was demanding but you learned more than ever.' },
      { label: 'Safe topic', fx: { smarts: 2 }, msg: 'You chose a manageable project. You passed without drama.' }
    ]});
    options.push({ id: 'job_hunt', title: 'Pre-graduation job hunt', text: 'Recruiters are visiting campus. Should you apply now?', choices: [
      { label: 'Apply everywhere', fx: { social: 3, happiness: -1 }, msg: 'You sent out many applications. Interviews are lined up for after graduation.' },
      { label: 'Wait until after graduation', fx: {}, msg: 'You decided to focus on finishing your degree first.' }
    ]});
  }

  if (!options.length) return '';
  const chosen = pick(options);
  const already = S.p71.universityEvents.indexOf(chosen.id + '-' + gameYear());
  if (already !== -1) return '';

  return '<section class="card" style="border-color:var(--cyan)"><h3>🎓 University event: ' + chosen.title + '</h3>' +
    '<p class="muted" style="font-size:.84rem">' + chosen.text + '</p>' +
    chosen.choices.map(function (c, i) {
      return '<button class="btn" style="margin-top:6px" onclick="p71ResolveUniversityEvent(\'' + chosen.id + '\',' + i + ')">' + c.label + '</button>';
    }).join('') +
    '</section>';
}

function p71ResolveUniversityEvent(eventId, choiceIdx) {
  p71Init(S);
  const choices = {
    orientation: [
      { fx: { social: 5, happiness: 3, smarts: 1 }, msg: 'You met dozens of new people and joined two clubs.' },
      { fx: { social: 1, happiness: -1 }, msg: 'You kept to yourself the first week. It felt lonely but manageable.' }
    ],
    first_exam: [
      { fx: { smarts: 4, happiness: -1 }, msg: 'You studied hard and passed comfortably.' },
      { fx: { smarts: 1 }, msg: 'You did okay but realised university is a different challenge.' }
    ],
    career_fair: [
      { fx: { social: 3, smarts: 2 }, msg: 'You talked to recruiters and got contact cards.' },
      { fx: {}, msg: 'You skipped it.' }
    ],
    student_union: [
      { fx: { social: 5, happiness: -1 }, msg: Math.random() < 0.4 ? 'You won!' : 'You ran but did not win.' },
      { fx: { social: 1 }, msg: 'You voted.' },
      { fx: {}, msg: 'You stayed out of it.' }
    ],
    summer_job: [
      { fx: { smarts: 3, social: 2 }, msg: Math.random() < 0.5 ? 'You got the internship.' : 'You applied but were not selected.' },
      { fx: { smarts: 3 }, msg: 'You studied all summer.' }
    ],
    grad_project: [
      { fx: { smarts: 5, happiness: -2 }, msg: 'Ambitious project — impressive but demanding.' },
      { fx: { smarts: 2 }, msg: 'Safe project — passed without drama.' }
    ],
    job_hunt: [
      { fx: { social: 3, happiness: -1 }, msg: 'You applied everywhere. Interviews lined up.' },
      { fx: {}, msg: 'You waited.' }
    ]
  };
  const list = choices[eventId];
  if (!list || !list[choiceIdx]) return;
  const choice = list[choiceIdx];
  if (choice.fx) fx(choice.fx);
  S.p71.universityEvents.push(eventId + '-' + gameYear());
  log('🎓 University: ' + choice.msg);
  realismNotice('University life', choice.msg);
  hint(); render();
}
window.p71ResolveUniversityEvent = p71ResolveUniversityEvent;

/* =================================================================
   7. VOCATIONAL SCHOOL OPTION (مدارس فنية)
   ================================================================= */
function p71VocationalCard() {
  if (S.age !== 18 || S.degree || S.uni || S.p71.vocationalTrack) return '';
  if (S.country !== 'egy') return '';
  if (!S.diploma) return '';
  return '<section class="card" style="border-color:var(--amber)"><h3>🔧 Vocational / technical school</h3>' +
    '<p class="muted" style="font-size:.82rem">Not everyone goes to university. Egyptian industrial, commercial, and technical schools train skilled workers — electricians, mechanics, nurses, accountants — in 2–3 years.</p>' +
    '<div class="row"><span>Cost</span><b class="mono">Free (public)</b></div>' +
    '<div class="row"><span>Duration</span><b>2–3 years</b></div>' +
    '<div class="row"><span>Path after</span><b>Skilled trade job, small business, or transfer to university</b></div>' +
    '<button class="btn" style="margin-top:8px" onclick="p71ChooseVocational(\'industrial\')">🔩 Industrial (electrician, mechanic, welder)</button>' +
    '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'commercial\')">📊 Commercial (accounting, retail management)</button>' +
    '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'nursing\')">🏥 Nursing (hospital or clinic)</button>' +
    '<button class="btn" style="margin-top:6px" onclick="p71ChooseVocational(\'agriculture\')">🌾 Agricultural (farming, agribusiness)</button>' +
    '</section>';
}

function p71ChooseVocational(track) {
  p71Init(S);
  if (S.degree || S.uni) return hint('You cannot switch after starting university.');
  S.p71.vocationalTrack = true;
  S.p71.vocationalType = track;
  fx({ smarts: 2, happiness: 2, social: 2 });
  log('🔧 Enrolled in a ' + track + ' vocational school (2–3 year program).');
  realismNotice('Vocational track', 'You chose a ' + track + ' vocational track. After 2–3 years you will be a skilled worker with practical training.');
  /* Add a marker so career opens the "entry" and "trade" tracks easily */
  if (!S.diploma) S.diploma = true;
  hint(); render();
}
window.p71ChooseVocational = p71ChooseVocational;

/* =================================================================
   8. HOOK INTO AGE-UP FOR STRESS EFFECTS
   ================================================================= */
const P71_ageUpBefore = ageUp;
ageUp = function () {
  const wasStudying = !!(S && (S.school || S.uni));
  const ageBefore = S && S.age;
  const r = P71_ageUpBefore.apply(this, arguments);
  if (!S || S.age === ageBefore) return r;

  /* Thanaweya stress effects on health/happiness */
  if (S.p71 && S.p71.thanaweyaStress >= 6 && S.age >= 16 && S.age <= 18) {
    fx({ health: -2, happiness: -2 });
    log('⚠️ Thanaweya Amma stress is affecting your health and mood.');
  }
  /* Reset annual private lesson flag */
  if (S.p71) S.p71.lastLessonAge = -1;

  return r;
};

/* =================================================================
   9. UI INTEGRATION
   ================================================================= */
const P71_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P71_viewSchoolBefore.apply(this, arguments);
  if (!S || S.age < 6) return html;

  /* Ages 9-18: private lessons */
  if (S.age >= 9 && S.age <= 18 && S.school) {
    html += p71PrivateLessonsCard();
  }

  /* Ages 10-18: school trips */
  if (S.age >= 10 && S.age <= 18) {
    html += p71TripsCard();
  }

  /* Ages 12-18: olympiads */
  if (S.age >= 12 && S.age <= 18) {
    html += p71OlympiadCard();
  }

  /* Ages 14-22: study group */
  if (S.age >= 14 && S.age <= 22) {
    html += p71StudyGroupCard();
  }

  /* Ages 16-18 Egypt: Thanaweya Amma stress */
  if (S.age >= 16 && S.age <= 18 && S.country === 'egy') {
    html += p71ThanaweyaStressCard();
  }

  /* Age 18 Egypt: vocational alternative */
  html += p71VocationalCard();

  /* University events */
  if (S.uni) {
    html += p71UniversityEventsCard();
  }

  return html;
};

/* =================================================================
   10. INIT
   ================================================================= */
p71Init(S);
console.log('[p71] Education life events loaded');
