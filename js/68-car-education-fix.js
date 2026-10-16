/* =====================================================================
   68. EDUCATION TAB — Realistic Egyptian Makeover
   - Full redesign of the education view for real-life Egypt
   - Thanaweya Amma track system (Adabi / Elmi Riyada / Elmi Olom)
   - Compact master's abroad table (no template bug)
   - Languages shown ONLY when you're targeting that country
   - Car crash fix retained
   Load AFTER 67-debt-truth-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p68Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p68Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p68EGP(egp) { return Math.round(egp * p68Idx()); }

/* =================================================================
   PART 1 — CAR CRASH FIX (unchanged)
   ================================================================= */
const P68_carStatsBefore = carStats;
carStats = function (c) {
  if (!c) return { hap: 2, soc: 2, saf: 0, insMod: 0, mpg: 30 };
  if (c.brand && !c.legacy) {
    if (typeof c.int !== 'number') c.int = 0;
    if (typeof c.intc !== 'number') c.intc = 0;
    if (typeof c.trim !== 'number') c.trim = 0;
    if (typeof c.color !== 'number') c.color = 0;
    if (!Array.isArray(c.opts)) c.opts = [];
    if (!Array.isArray(c.mods)) c.mods = [];
  }
  try { return P68_carStatsBefore.apply(this, arguments); }
  catch (err) {
    console.error('carStats fallback for', c && c.name, err);
    return { hap: c.hap || 2, soc: c.soc || 2, saf: 0, insMod: 0, mpg: 30 };
  }
};
function p68FixExistingCars() {
  if (!S || !Array.isArray(S.cars)) return;
  S.cars.forEach(function (c) {
    if (c && c.brand && !c.legacy) {
      if (typeof c.int !== 'number') c.int = 0;
      if (typeof c.intc !== 'number') c.intc = 0;
      if (typeof c.trim !== 'number') c.trim = 0;
      if (typeof c.color !== 'number') c.color = 0;
      if (!Array.isArray(c.opts)) c.opts = [];
      if (!Array.isArray(c.mods)) c.mods = [];
    }
  });
}
setTimeout(p68FixExistingCars, 300);

/* =================================================================
   PART 2 — STATE for Thanaweya Amma + abroad target
   ================================================================= */
function p68InitState(o) {
  o = o || S;
  if (!o) return;
  if (!o.p68) o.p68 = {};
  if (!o.p68.thanaweyaTrack) o.p68.thanaweyaTrack = null;  /* 'adabi' | 'elmi-riyada' | 'elmi-olom' */
  if (typeof o.p68.thanaweyaScore !== 'number') o.p68.thanaweyaScore = null;
  if (!o.p68.abroadTarget) o.p68.abroadTarget = null;  /* 'deu' | 'fra' | 'nld' | 'usa' | 'gbr' | ... */
}
const P68_migrate = migrate;
migrate = function (o) { const r = P68_migrate(o); p68InitState(r); return r; };
const P68_newGame = newGame;
newGame = function () { P68_newGame.apply(this, arguments); p68InitState(S); };

/* =================================================================
   PART 3 — HELPERS
   ================================================================= */
function p68NeedsGerman() {
  if (!S) return false;
  if (S.country === 'deu') return true;
  if (S.p68 && S.p68.abroadTarget === 'deu') return true;
  if (S.mast && S.mast.dest === 'deu') return true;
  if (S.studentVisaCase && S.studentVisaCase.dest === 'deu') return true;
  if (S.lang && S.lang.german > 0) return true;
  return false;
}
function p68NeedsFrench() {
  if (!S) return false;
  if (S.country === 'fra') return true;
  if (S.p68 && S.p68.abroadTarget === 'fra') return true;
  if (S.mast && S.mast.dest === 'fra') return true;
  if (S.studentVisaCase && S.studentVisaCase.dest === 'fra') return true;
  if (S.lang && S.lang.french > 0) return true;
  return false;
}
function p68NeedsDutch() {
  if (!S) return false;
  if (S.country === 'nld') return true;
  if (S.p68 && S.p68.abroadTarget === 'nld') return true;
  if (S.mast && S.mast.dest === 'nld') return true;
  if (S.studentVisaCase && S.studentVisaCase.dest === 'nld') return true;
  if (S.lang && S.lang.dutch > 0) return true;
  return false;
}

/* =================================================================
   PART 4 — CARDS
   ================================================================= */

/* ---- Status card ---- */
function p68StatusCard() {
  const rate = p68Rate();
  let status = 'In school';
  let icon = '📚';
  let detail = '';
  if (S.degree) {
    status = 'Graduate';
    icon = '🎓';
    const degName = (MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree;
    detail = degName + ' · graduated ' + (S.p49 && S.p49.graduationYear ? S.p49.graduationYear : '');
  } else if (S.uni) {
    status = 'Enrolled';
    icon = '📖';
    const un = S.uni.universityName || (UNIS[S.uni.type] && UNIS[S.uni.type].name) || 'University';
    detail = un + ' · Year ' + (S.uni.year + 1) + ' of ' + (S.uni.yearsTotal || 4);
  } else if (S.diploma && S.age >= 18) {
    status = 'Ready for university';
    icon = '🎓';
    detail = 'Choose a university below';
  } else if (S.age < 18) {
    detail = 'Age ' + S.age + ' · School phase';
  }
  return '<section class="card" style="padding:14px;border-left:3px solid var(--violet)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
    '<div style="min-width:0;flex:1">' +
    '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS</div>' +
    '<div style="font-size:1.1rem;font-weight:700;margin-top:4px">' + icon + ' ' + status + '</div>' +
    (detail ? '<div class="muted" style="font-size:.82rem;margin-top:2px">' + detail + '</div>' : '') +
    '</div></div></section>';
}

/* ---- School phase (age 6-17) ---- */
function p68SchoolPhase() {
  const efforts = Object.entries(EFFORT).map(function (pair) {
    const k = pair[0], e = pair[1];
    return '<button class="btn ' + (S.effort === k ? 'sel' : '') + '" onclick="pickEffort(\'' + k + '\')">' + e.label + '</button>';
  }).join('');

  let html = '<section class="card"><h3>📚 School</h3>' +
    '<p class="muted" style="font-size:.85rem">Family status: <b>' + FAMILY[S.famWealth] + '</b>. Effort applied when you age up. Years skipped: ' + (S.skips || 0) + '.</p>' +
    '<div style="display:grid;grid-template-columns:1fr;gap:6px;margin-top:10px">';

  Object.entries(SCHOOLS).forEach(function (pair) {
    const k = pair[0], s = pair[1];
    const why = (typeof schoolBlock === 'function') ? schoolBlock(k) : '';
    const costLabel = s.cost ? money(s.cost) + '/yr (parents pay)' : 'Free';
    html += '<button class="btn ' + (S.school === k ? 'sel' : '') + '" ' + (why ? 'disabled' : '') + ' onclick="pickSchool(\'' + k + '\')">' +
      s.name + ' · ' + costLabel +
      '<small>' + (why || s.desc) + '</small></button>';
  });

  html += '</div></section>';

  html += '<section class="card"><h3>Effort this year</h3>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">' + efforts + '</div></section>';

  /* Thanaweya Amma track (ages 16-18) */
  if (S.age >= 16 && S.age <= 18 && S.country === 'egy') {
    html += p68ThanaweyaCard();
  }

  return html;
}

/* ---- Thanaweya Amma track selection ---- */
function p68ThanaweyaCard() {
  p68InitState(S);
  const track = S.p68.thanaweyaTrack;

  if (track) {
    const label = { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[track];
    return '<section class="card" style="border-color:var(--mint)"><h3>📝 Thanaweya Amma — ' + label + '</h3>' +
      '<p class="muted" style="font-size:.85rem">Your track opens the following university paths:</p>' +
      (track === 'adabi' ? '<ul class="muted" style="font-size:.82rem;padding-left:20px"><li>Law</li><li>Business / Commerce</li><li>Arts / Humanities</li><li>Mass Communication</li><li>Economics & Political Science</li></ul>' : '') +
      (track === 'elmi-riyada' ? '<ul class="muted" style="font-size:.82rem;padding-left:20px"><li>Engineering</li><li>Computer Science</li><li>Science (Math/Physics)</li><li>Pharmacy</li><li>Business (some faculties)</li></ul>' : '') +
      (track === 'elmi-olom' ? '<ul class="muted" style="font-size:.82rem;padding-left:20px"><li>Medicine</li><li>Dentistry</li><li>Pharmacy</li><li>Science (Biology/Chemistry)</li><li>Physical Therapy</li><li>Nursing</li></ul>' : '') +
      '</section>';
  }

  return '<section class="card" style="border-color:var(--amber)"><h3>📝 Choose Thanaweya Amma track</h3>' +
    '<p class="muted" style="font-size:.85rem">In Egypt, your Thanaweya Amma track determines which university faculties you can apply to. Choose carefully — you cannot switch later.</p>' +
    '<button class="btn" onclick="p68ChooseTrack(\'adabi\')">📖 Adabi (Literary)<small>Opens: Law, Business, Arts, Mass Comm, Economics</small></button>' +
    '<button class="btn" onclick="p68ChooseTrack(\'elmi-riyada\')">🔬 Elmi Riyada (Science-Math)<small>Opens: Engineering, CS, Science, Pharmacy</small></button>' +
    '<button class="btn" onclick="p68ChooseTrack(\'elmi-olom\')">🧬 Elmi Olom (Science-Biology)<small>Opens: Medicine, Dentistry, Pharmacy, Science</small></button>' +
    '</section>';
}

function p68ChooseTrack(t) {
  p68InitState(S);
  S.p68.thanaweyaTrack = t;
  const label = { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[t];
  log('📝 You chose the Thanaweya Amma track: ' + label + '.');
  realismNotice('Thanaweya Amma track chosen', 'You are now on the ' + label + ' track. This determines which university faculties you can apply to.');
  render();
}
window.p68ChooseTrack = p68ChooseTrack;

/* ---- Current enrollment ---- */
function p68EnrollmentCard() {
  const u = S.uni;
  if (!u) return '';
  const rate = p68Rate();
  const years = u.yearsTotal || ((u.major && MAJORS[u.major]) ? MAJORS[u.major].years : 4);
  const un = u.universityName || ((UNIS[u.type] && UNIS[u.type].name) || 'University');
  const faculty = u.faculty || (u.major && MAJORS[u.major] && MAJORS[u.major].name) || 'your program';
  const paidBy = { 'self': 'You are paying', 'parents': 'Parents pay', 'loan': 'Student loan' }[u.pay] || 'Self-funded';
  const tuition = (typeof tuitionFor === 'function') ? tuitionFor(u) : 0;

  return '<section class="card"><h3>📖 Currently enrolled</h3>' +
    '<div class="row"><span>University</span><b>' + un + '</b></div>' +
    '<div class="row"><span>Faculty / Field</span><b>' + faculty + '</b></div>' +
    '<div class="row"><span>Year</span><b>' + (u.year + 1) + ' of ' + years + '</b></div>' +
    '<div class="row"><span>Tuition</span><b class="mono">' + money(tuition) + '/year</b></div>' +
    '<div class="row"><span>Funding</span><b>' + paidBy + '</b></div>' +
    '<button class="btn" style="border-color:var(--rose);color:var(--rose)" onclick="dropOut()">Drop out</button>' +
    '</section>';
}

/* ---- University selection (18+, diploma, no uni yet) ---- */
function p68UniversitySelectionCard() {
  /* Use file 29's Egyptian university UI if it exists */
  if (typeof viewEgyptUniversitySelection === 'function' && S.country === 'egy') {
    const egyptUI = viewEgyptUniversitySelection();
    if (egyptUI) return egyptUI;
  }
  /* Otherwise show the base majors panel */
  const payBtns = Object.entries(PAYERS).map(function (pair) {
    const k = pair[0], p = pair[1];
    return '<button class="btn ' + (S.payPref === k ? 'sel' : '') + '" onclick="setPay(\'' + k + '\')">' + p.label + '<small>' + p.desc + '</small></button>';
  }).join('');
  const majors = Object.entries(MAJORS).map(function (pair) {
    const k = pair[0], m = pair[1];
    return '<div style="margin-top:12px"><b>' + m.name + '</b> <span class="muted">· ' + m.years + ' yrs · Req Smarts ' + m.min + '%</span>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">' +
      '<button class="btn" onclick="enrollUni(\'national\',\'' + k + '\')">National</button>' +
      '<button class="btn" onclick="enrollUni(\'private\',\'' + k + '\')">Private</button>' +
      '</div></div>';
  }).join('');
  return '<section class="card"><h3>🎓 Choose your university</h3>' +
    '<p class="muted" style="font-size:.85rem">Pick a major. Public universities are nearly free; private ones cost 60k–200k EGP/year.</p>' +
    majors + '</section>' +
    '<section class="card"><h3>Who pays tuition?</h3>' + payBtns + '</section>';
}

/* ---- Graduate card ---- */
function p68GraduateCard() {
  const degName = (MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree;
  const gradYear = (S.p49 && S.p49.graduationYear) ? S.p49.graduationYear : '';
  const gpa = (S.gpa && S.gpaN) ? S.gpa.toFixed(2) : '—';

  return '<section class="card" style="border-color:var(--mint)"><h3>🎓 Your degree</h3>' +
    '<div class="row"><span>Degree</span><b>' + degName + '</b></div>' +
    '<div class="row"><span>Graduated</span><b>' + gradYear + '</b></div>' +
    '<div class="row"><span>GPA</span><b>' + gpa + ' / 4.0</b></div>' +
    (S.masterField ? '<div class="row"><span>Master\'s</span><b>' + S.masterField + '</b></div>' : '') +
    '</section>';
}

/* ---- English language card ---- */
function p68EnglishCard() {
  const lvl = S.eng || 0;
  const engCourses = (typeof ENG !== 'undefined') ? ENG : [];
  const coursesHtml = engCourses.map(function (c, i) {
    const price = (typeof svc === 'function') ? svc(c[1]) : 0;
    const canPay = S.wealth >= price;
    return '<button class="btn" ' + (canPay ? '' : 'disabled') + ' onclick="takeEng(' + i + ')">' +
      c[0] + ' · ' + (price ? money(price) : 'Free') + ' · +' + c[2] + ' English' +
      '</button>';
  }).join('');
  return '<section class="card"><h3>🇬🇧 English language — Level ' + lvl + '%</h3>' +
    '<div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin:8px 0">' +
    '<div style="height:100%;width:' + lvl + '%;background:var(--cyan)"></div></div>' +
    '<p class="muted" style="font-size:.82rem">English is universal — needed for international master\'s, remote work, and many professional roles in Egypt.</p>' +
    coursesHtml +
    '</section>';
}

/* ---- IELTS/TOEFL card ---- */
function p68IELTSCard() {
  const ielts = S.ielts || 0;
  const toefl = S.toefl || 0;
  const fee = (typeof imp === 'function') ? imp(250) : 0;
  return '<section class="card"><h3>📝 IELTS / TOEFL</h3>' +
    '<div class="row"><span>IELTS Band</span><b>' + (ielts || 'Not taken') + '</b></div>' +
    '<div class="row"><span>TOEFL iBT</span><b>' + (toefl || 'Not taken') + ' / 120</b></div>' +
    '<p class="muted" style="font-size:.82rem">Required for most master\'s programs abroad. IELTS minimum is typically 6.0–7.0 depending on destination.</p>' +
    '<button class="btn" ' + (S.wealth < fee ? 'disabled' : '') + ' onclick="takeIelts()">Take IELTS exam · ' + money(fee) + '</button>' +
    '<button class="btn" ' + (S.wealth < fee ? 'disabled' : '') + ' onclick="takeToefl()">Take TOEFL exam · ' + money(fee) + '</button>' +
    '</section>';
}

/* ---- Other language card (generic) ---- */
function p68LangCard(lang, info) {
  if (!info) return '';
  if (!S.lang) S.lang = {};
  const lvl = Number(S.lang[lang]) || 0;
  const lvlName = lvl >= 80 ? 'C1' : lvl >= 60 ? 'B2' : lvl >= 45 ? 'B1' : lvl >= 30 ? 'A2' : lvl >= 15 ? 'A1' : 'No skill';
  const courses = [
    ['Self-study (apps and videos)', 0, 3],
    ['Online course', 250, 6],
    ['Language institute', 900, 10],
    ['Private tutor + speaking club', 2200, 14]
  ];
  const rows = courses.map(function (c, i) {
    const price = (typeof svc === 'function') ? svc(c[1]) : 0;
    const done = S.langDone === S.age;
    const canPay = price <= S.wealth;
    return '<button class="btn" ' + (done || !canPay ? 'disabled' : '') + ' onclick="p68TakeLang(\'' + lang + '\',' + i + ')">' +
      c[0] + ' · ' + (price ? money(price) : 'Free') + ' · +' + c[2] + ' ' + info.name +
      '</button>';
  }).join('');
  const certs = (info.exams || []).map(function (ex, i) {
    const key = lang + ex[0];
    const have = S.certs && S.certs[key];
    return '<button class="btn" ' + (have ? 'disabled' : '') + ' onclick="p68TakeLangExam(\'' + lang + '\',' + i + ')">' +
      (have ? ex[1] + ' · Passed ✓' : 'Take ' + ex[1] + ' · ' + money((typeof imp === 'function') ? imp(180) : 0)) +
      '<small>' + ex[3] + '</small></button>';
  }).join('');
  return '<section class="card" style="border-color:var(--violet)"><h3>' + info.flag + ' ' + info.name + ' — ' + lvlName + ' (' + lvl + '%)</h3>' +
    '<div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin:8px 0">' +
    '<div style="height:100%;width:' + lvl + '%;background:var(--violet)"></div></div>' +
    '<p class="muted" style="font-size:.82rem">Shown because you are targeting ' + (COUNTRIES[info.country] ? COUNTRIES[info.country].n : info.country) + '.</p>' +
    rows + certs +
    '</section>';
}

function p68TakeLang(lang, idx) {
  p68InitState(S);
  if (S.langDone === S.age) return hint('One language course per year.');
  const courses = [
    { name: 'Self-study', cost: 0, gain: 3 },
    { name: 'Online course', cost: 250, gain: 6 },
    { name: 'Language institute', cost: 900, gain: 10 },
    { name: 'Private tutor', cost: 2200, gain: 14 }
  ];
  const c = courses[idx];
  if (!c) return;
  const price = (typeof svc === 'function') ? svc(c.cost) : c.cost;
  const internal = price / p68Rate();
  if (S.wealth < internal) return hint('Not enough cash.');
  if (internal > 0) { S.wealth -= internal; S.expenses = (S.expenses || 0) + internal; }
  S.langDone = S.age;
  if (!S.lang) S.lang = {};
  S.lang[lang] = Math.min(100, (Number(S.lang[lang]) || 0) + c.gain);
  fx({ smarts: 1 });
  log('📖 ' + c.name + ' (' + lang + '): now ' + S.lang[lang] + '%.');
  hint(); render();
}
window.p68TakeLang = p68TakeLang;

function p68TakeLangExam(lang, idx) {
  const info = (typeof LANG_INFO !== 'undefined') ? LANG_INFO[lang] : null;
  if (!info) return;
  const ex = info.exams[idx];
  if (!ex) return;
  if (!S.certs) S.certs = {};
  const key = lang + ex[0];
  if (S.certs[key]) return hint('Already passed.');
  const fee = (typeof imp === 'function') ? imp(180) : 0;
  const internal = fee / p68Rate();
  if (S.wealth < internal) return hint('Not enough cash for exam fee.');
  S.wealth -= internal;
  const lvl = Number(S.lang && S.lang[lang]) || 0;
  const pass = Math.random() < Math.max(0.05, Math.min(0.95, (lvl - ex[2] + 8) / 16));
  if (pass) { S.certs[key] = true; fx({ happiness: 4 }); log('✅ Passed ' + ex[1] + '.'); }
  else { fx({ happiness: -2 }); log('❌ Failed ' + ex[1] + '. Fee not refunded.'); }
  hint(); render();
}
window.p68TakeLangExam = p68TakeLangExam;

/* ---- Local Master's card ---- */
function p68LocalMasterCard() {
  if (!S.degree) return '';
  if (S.localMast) {
    const m = S.localMast;
    return '<section class="card"><h3>📖 Local master\'s in progress</h3>' +
      '<div class="row"><span>Programme</span><b>' + m.fieldName + '</b></div>' +
      '<div class="row"><span>Type</span><b>' + m.kind + '</b></div>' +
      '<div class="row"><span>Year</span><b>' + (m.year + 1) + ' of ' + (m.year + m.left) + '</b></div>' +
      '<button class="btn" style="border-color:var(--rose);color:var(--rose)" onclick="leaveLocalMasters()">Leave master\'s</button>' +
      '</section>';
  }
  if (typeof MASTER_FIELDS === 'undefined') return '';
  const fieldOpts = MASTER_FIELDS.map(function (f) {
    return '<option value="' + f.id + '">' + f.name + '</option>';
  }).join('');
  return '<section class="card"><h3>🎓 Local Master\'s in Egypt</h3>' +
    '<p class="muted" style="font-size:.82rem">Public universities: 25k–70k EGP/year. Private universities: 85k–200k EGP/year. Duration 1–2 years. Scholarship available for high GPA.</p>' +
    '<label class="muted" style="font-size:.8rem">Subject</label>' +
    '<select id="p68-local-master-field" style="width:100%;margin:6px 0">' + fieldOpts + '</select>' +
    '<label class="muted" style="font-size:.8rem">University type</label>' +
    '<select id="p68-local-master-type" style="width:100%;margin:6px 0">' +
    '<option value="public">Public university</option>' +
    '<option value="private">Private university</option>' +
    '</select>' +
    '<label class="muted" style="font-size:.8rem">Funding</label>' +
    '<select id="p68-local-master-fund" style="width:100%;margin:6px 0">' +
    '<option value="self">Pay myself</option>' +
    '<option value="parents">Ask parents</option>' +
    '<option value="partial">Compete for 50% scholarship</option>' +
    '<option value="scholar">Compete for full scholarship</option>' +
    '</select>' +
    '<button class="btn" onclick="p68ApplyLocalMaster()">Apply for local master\'s</button>' +
    '</section>';
}
function p68ApplyLocalMaster() {
  const field = document.getElementById('p68-local-master-field')?.value;
  const type = document.getElementById('p68-local-master-type')?.value;
  const fund = document.getElementById('p68-local-master-fund')?.value;
  if (typeof applyLocalMasters === 'function') applyLocalMasters(field, type, fund);
}
window.p68ApplyLocalMaster = p68ApplyLocalMaster;

/* ---- Abroad Master's — compact table ---- */
function p68AbroadMasterCard() {
  if (!S.degree) return '';
  if (S.mast || S.studentVisaCase) {
    return '<section class="card"><h3>🌍 Master\'s abroad — in progress</h3>' +
      '<p class="muted">You already have a study-abroad application or enrollment in progress. Check the World tab for details.</p></section>';
  }
  const rate = p68Rate();
  const bankEGP = Math.round(S.wealth * rate);

  /* Compact destination table */
  const destinations = [
    { code: 'ita', name: 'Italy',      flag: '🇮🇹', tuition: 2500, living: 9500,  blocked: 0,     visa: 90,  flight: 580,  setup: 700 },
    { code: 'fra', name: 'France',     flag: '🇫🇷', tuition: 5000, living: 10500, blocked: 0,     visa: 100, flight: 620,  setup: 800 },
    { code: 'jpn', name: 'Japan',      flag: '🇯🇵', tuition: 6000, living: 12000, blocked: 0,     visa: 60,  flight: 850,  setup: 900 },
    { code: 'kor', name: 'South Korea', flag: '🇰🇷', tuition: 5500, living: 11000, blocked: 0,     visa: 60,  flight: 850,  setup: 900 },
    { code: 'deu', name: 'Germany',    flag: '🇩🇪', tuition: 0,    living: 11500, blocked: 11208, visa: 75,  flight: 590,  setup: 800 },
    { code: 'sau', name: 'Saudi Arabia', flag: '🇸🇦', tuition: 15000, living: 11000, blocked: 0,  visa: 200, flight: 340,  setup: 700 },
    { code: 'nld', name: 'Netherlands', flag: '🇳🇱', tuition: 18000, living: 12500, blocked: 0,    visa: 210, flight: 640,  setup: 900 },
    { code: 'uae', name: 'UAE',        flag: '🇦🇪', tuition: 22000, living: 14000, blocked: 0,     visa: 250, flight: 300,  setup: 800 },
    { code: 'gbr', name: 'United Kingdom', flag: '🇬🇧', tuition: 25000, living: 15000, blocked: 0, visa: 490, flight: 650, setup: 1000 },
    { code: 'nzl', name: 'New Zealand', flag: '🇳🇿', tuition: 24000, living: 17000, blocked: 0,   visa: 430, flight: 1350, setup: 1000 },
    { code: 'sgp', name: 'Singapore',  flag: '🇸🇬', tuition: 28000, living: 16000, blocked: 0,    visa: 90,  flight: 950,  setup: 1000 },
    { code: 'aus', name: 'Australia',  flag: '🇦🇺', tuition: 28000, living: 20000, blocked: 0,    visa: 710, flight: 1350, setup: 1200 },
    { code: 'can', name: 'Canada',     flag: '🇨🇦', tuition: 22000, living: 16000, blocked: 14000, visa: 150, flight: 1000, setup: 1200 },
    { code: 'usa', name: 'United States', flag: '🇺🇸', tuition: 35000, living: 18000, blocked: 0, visa: 185, flight: 1100, setup: 1500 }
  ];

  /* Compute year-1 totals and sort ascending */
  destinations.forEach(function (d) {
    const usd = d.tuition + d.living + d.blocked + d.visa + d.flight + d.setup;
    const egp = Math.round(usd * 52.7 * p68Idx());
    d.year1EGP = egp;
    d.affordable = bankEGP >= egp;
    d.short = Math.max(0, egp - bankEGP);
  });
  destinations.sort(function (a, b) { return a.year1EGP - b.year1EGP; });

  /* Table rows */
  const rows = destinations.map(function (d) {
    return '<div class="row" style="padding:8px 0;align-items:center">' +
      '<span>' + d.flag + ' <b>' + d.name + '</b>' + (d.blocked ? ' <span class="muted" style="font-size:.7rem">(blocked account)</span>' : '') + '</span>' +
      '<span style="text-align:right">' +
      '<b class="mono">' + d.year1EGP.toLocaleString() + ' EGP</b><br>' +
      (d.affordable
        ? '<span style="font-size:.72rem;color:var(--mint)">✓ Affordable</span>'
        : '<span style="font-size:.72rem;color:var(--rose)">short ' + d.short.toLocaleString() + '</span>') +
      '</span>' +
      '</div>';
  }).join('');

  /* Target destination selector (drives which language cards show) */
  const target = (S.p68 && S.p68.abroadTarget) || '';
  const targetOpts = [
    ['', 'Not targeting abroad'],
    ['deu', '🇩🇪 Germany'], ['fra', '🇫🇷 France'], ['nld', '🇳🇱 Netherlands'],
    ['usa', '🇺🇸 United States'], ['gbr', '🇬🇧 United Kingdom'],
    ['can', '🇨🇦 Canada'], ['aus', '🇦🇺 Australia'],
    ['jpn', '🇯🇵 Japan'], ['kor', '🇰🇷 South Korea'],
    ['ita', '🇮🇹 Italy'], ['sgp', '🇸🇬 Singapore']
  ].map(function (pair) {
    return '<option value="' + pair[0] + '"' + (target === pair[0] ? ' selected' : '') + '>' + pair[1] + '</option>';
  }).join('');

  return '<section class="card"><h3>🌍 Master\'s abroad — year 1 costs</h3>' +
    '<p class="muted" style="font-size:.82rem">Sorted cheapest first. Full cost = tuition + living + blocked account + visa + flight + setup.</p>' +
    '<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)">' +
    '<span class="muted" style="font-size:.78rem">Your bank</span>' +
    '<b class="mono">' + bankEGP.toLocaleString() + ' EGP</b></div>' +
    rows +
    '</section>' +
    '<section class="card"><h3>🎯 Target destination</h3>' +
    '<p class="muted" style="font-size:.82rem">Select where you want to study. This shows the relevant language course (German for Germany, French for France, etc.).</p>' +
    '<select id="p68-abroad-target" style="width:100%;margin:6px 0" onchange="p68SetTarget(this.value)">' + targetOpts + '</select>' +
    '</section>';
}
function p68SetTarget(code) {
  p68InitState(S);
  S.p68.abroadTarget = code || null;
  if (code) log('🎯 Study-abroad target set: ' + (COUNTRIES[code] ? COUNTRIES[code].n : code) + '.');
  render();
}
window.p68SetTarget = p68SetTarget;

/* =================================================================
   PART 5 — MAIN viewSchool OVERRIDE
   ================================================================= */
const P68_viewSchoolBefore = viewSchool;
viewSchool = function () {
  if (!S) return P68_viewSchoolBefore.apply(this, arguments);

  let html = '';
  html += p68StatusCard();

  /* School phase (under 18) */
  if (S.age < 18) {
    html += p68SchoolPhase();
  }

  /* Enrolled in university */
  if (S.age >= 18 && S.uni) {
    html += p68EnrollmentCard();
  }

  /* 18+, has diploma, not enrolled, no degree yet */
  if (S.age >= 18 && !S.uni && !S.degree && S.diploma) {
    html += p68UniversitySelectionCard();
  }

  /* No diploma, adult */
  if (S.age >= 18 && !S.diploma && !S.degree && !S.uni) {
    html += '<section class="card"><h3>No diploma</h3><p class="muted">You left school without a diploma. Entry-level jobs are still available in the Career tab.</p></section>';
  }

  /* Graduated */
  if (S.degree) {
    html += p68GraduateCard();
  }

  /* English — always */
  if (S.age >= 12) html += p68EnglishCard();

  /* IELTS / TOEFL */
  if (S.age >= 16) html += p68IELTSCard();

  /* Other languages — only if targeting */
  if (S.age >= 12 && typeof LANG_INFO !== 'undefined') {
    if (p68NeedsGerman() && LANG_INFO.german) html += p68LangCard('german', LANG_INFO.german);
    if (p68NeedsFrench() && LANG_INFO.french) html += p68LangCard('french', LANG_INFO.french);
    if (p68NeedsDutch() && LANG_INFO.dutch) html += p68LangCard('dutch', LANG_INFO.dutch);
  }

  /* Local master's */
  if (S.degree && S.age >= 21 && !S.localMast && !S.mast && !S.studentVisaCase) {
    html += p68LocalMasterCard();
  } else if (S.localMast) {
    html += p68LocalMasterCard();
  }

  /* Abroad master's */
  if (S.degree && S.age >= 21) {
    html += p68AbroadMasterCard();
  }

  /* Passport panel (from 25-languages-passport.js) */
  if (S.age >= 16 && typeof passportCard === 'function') {
    html += passportCard();
  }

  return html;
};

/* =================================================================
   PART 6 — INIT
   ================================================================= */
p68InitState(S);
setTimeout(p68FixExistingCars, 300);
console.log('[p68 v3] Education tab realistic makeover loaded');
