/* =====================================================================
   75. EDUCATION TAB CLEANUP + PART-TIME FIX
   - Hide Thanaweya Amma cutoffs AFTER enrolling in university
   - Hide study-abroad panel while already enrolled locally
   - Show GPA prominently with progress bar
   - Add "What to do next" action buttons
   - Enable Part-time tab for ALL university students
   - Collapse repetitive language content into a single card
   - Remove duplicate passport panel
   Load AFTER 74-education-abroad-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p75Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* =================================================================
   1. STATE
   ================================================================= */
function p75Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p75) o.p75 = {};
  if (typeof o.p75.showAdvancedLang !== 'boolean') o.p75.showAdvancedLang = false;
  if (typeof o.p75.showStudyAbroad !== 'boolean') o.p75.showStudyAbroad = false;
}
const P75_migrate = migrate;
migrate = function (o) { const r = P75_migrate(o); p75Init(r); return r; };
const P75_newGame = newGame;
newGame = function () { P75_newGame.apply(this, arguments); p75Init(S); };

function p75IsEnrolled() {
  return !!(S && S.uni);
}
function p75IsEnrolledAbroad() {
  return p75IsEnrolled() && S.country !== S.home;
}
function p75IsEnrolledEgypt() {
  return p75IsEnrolled() && S.country === S.home;
}
function p75HasGraduated() {
  return !!(S && S.degree);
}

/* =================================================================
   2. FIX PART-TIME TAB — enable for ALL university students
   ================================================================= */
/* The base tab logic uses `studying()` which returns S.age<18 || !!S.uni.
   The Part-time tab becomes disabled after high-school graduation until
   the player enrolls in a university. That's wrong — a high-school graduate
   should still be able to take part-time work while job hunting.
   Also when enrolled, it should be enabled. */

const P75_renderBefore = render;
render = function () {
  const r = P75_renderBefore.apply(this, arguments);
  if (!S) return r;

  /* Force-enable the Part-time tab when:
     - Player is enrolled in ANY university (Egypt or abroad), OR
     - Player is 14+ and not currently working full-time */
  const shouldEnablePart = S.age >= 14 && (!S.job || p75IsEnrolled());
  if (shouldEnablePart) {
    const nav = document.getElementById('tabs');
    if (nav) {
      const buttons = nav.querySelectorAll('button');
      buttons.forEach(function (btn) {
        if (btn.textContent && btn.textContent.indexOf('Part-time') !== -1) {
          btn.disabled = false;
          btn.removeAttribute('title');
        }
      });
    }
  }
  return r;
};

/* =================================================================
   3. CLEAN viewSchool — hide Thanaweya + Study Abroad when enrolled
   ================================================================= */
const P75_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P75_viewSchoolBefore.apply(this, arguments);
  if (!S) return html;
  p75Init(S);

  /* ---- A. If enrolled in a local university, hide: ---- */
  if (p75IsEnrolledEgypt()) {
    /* Hide Thanaweya Amma cutoff table */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g,
      ''
    );
    /* Hide Thanaweya Amma result card */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g,
      ''
    );
    /* Hide study abroad panel */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🌍 Study abroad[\s\S]*?<\/section>/g,
      ''
    );
    /* Hide "Master's abroad" table */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🌍 Master's abroad[\s\S]*?<\/section>/g,
      ''
    );
    /* Hide study abroad overview */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🌍 Study abroad — your position[\s\S]*?<\/section>/g,
      ''
    );
    /* Hide vocational school option */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🔧 Vocational[\s\S]*?<\/section>/g,
      ''
    );
    /* Hide private lessons, trips, olympiads (school-age stuff) */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📚 Private lessons[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🚌 School trips[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏆 School olympiads[\s\S]*?<\/section>/g, '');
  }

  /* ---- B. If abroad enrolled, hide all Egypt content ---- */
  if (p75IsEnrolledAbroad()) {
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🎓 Local Master's in Egypt[\s\S]*?<\/section>/g, '');
  }

  /* ---- C. If graduated, hide study-abroad "Bachelor's" option text ---- */
  if (p75HasGraduated()) {
    /* Hide the bachelor option mention only */
    html = html.replace(/Requires Thanaweya Amma ≥ 70%/g, '');
  }

  /* ---- D. Remove duplicate passport panels — keep only the last one ---- */
  const passportMatches = html.match(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g);
  if (passportMatches && passportMatches.length > 1) {
    /* Remove all but the last */
    let removed = 0;
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g,
      function (match) {
        removed++;
        return removed < passportMatches.length ? '' : match;
      }
    );
  }

  /* ---- E. Remove duplicate TOEFL iBT card ---- */
  const toeflMatches = html.match(/<section class="card"[^>]*>[\s\S]*?Take TOEFL iBT[\s\S]*?<\/section>/g);
  if (toeflMatches && toeflMatches.length > 1) {
    let removed = 0;
    html = html.replace(
      /<section class="card"[^>]*>[\s\S]*?Take TOEFL iBT[\s\S]*?<\/section>/g,
      function (match) {
        removed++;
        return removed < toeflMatches.length ? '' : match;
      }
    );
  }

  /* ---- F. Remove duplicate German/Dutch cards ---- */
  ['🇩🇪 German', '🇳🇱 Dutch'].forEach(function (marker) {
    const matches = html.match(new RegExp('<section class="card"[^>]*>[\\s\\S]*?' + marker + '[\\s\\S]*?<\\/section>', 'g'));
    if (matches && matches.length > 1) {
      let removed = 0;
      html = html.replace(
        new RegExp('<section class="card"[^>]*>[\\s\\S]*?' + marker + '[\\s\\S]*?<\\/section>', 'g'),
        function (match) {
          removed++;
          return removed < matches.length ? '' : match;
        }
      );
    }
  });

  return html;
};

/* =================================================================
   4. ENHANCED EDUCATION HEADER — GPA + status + next actions
   ================================================================= */
const P75_viewSchoolForHeader = viewSchool;
viewSchool = function () {
  let html = P75_viewSchoolForHeader.apply(this, arguments);
  if (!S || S.age < 6) return html;

  /* Build a header card */
  const rate = p75Rate();
  let statusCard = '';

  /* ---- A. Enrolled student (anywhere) ---- */
  if (p75IsEnrolled()) {
    const u = S.uni;
    const yearsTotal = u.yearsTotal || ((u.major && MAJORS[u.major]) ? MAJORS[u.major].years : 4);
    const yearNow = (u.year || 0);
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const gpaColor = gpa >= 3.7 ? 'var(--mint)' : gpa >= 3.0 ? 'var(--cyan)' : gpa >= 2.0 ? 'var(--amber)' : 'var(--rose)';
    const pct = Math.round((yearNow / yearsTotal) * 100);
    const unName = u.universityName || ((typeof UNIS !== 'undefined' && UNIS[u.type] && UNIS[u.type].name) || 'University');
    const faculty = u.faculty || (u.major && MAJORS[u.major] && MAJORS[u.major].name) || 'your field';

    statusCard = '<section class="card" style="padding:14px;border-left:3px solid var(--violet)">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS</div>' +
      '<div style="font-size:1.15rem;font-weight:700;margin-top:4px">📖 ' + unName + '</div>' +
      '<div class="muted" style="font-size:.82rem;margin-top:2px">' + faculty + ' · Year ' + (yearNow + 1) + ' of ' + yearsTotal + '</div>' +
      '<div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
      '<div class="muted" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">GPA</div>' +
      '<div class="mono" style="font-size:1.1rem;font-weight:700;margin-top:3px;color:' + gpaColor + '">' + gpa.toFixed(2) + '</div>' +
      '<div class="muted" style="font-size:.68rem;margin-top:1px">out of 4.0</div>' +
      '</div>' +
      '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
      '<div class="muted" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">Progress</div>' +
      '<div class="mono" style="font-size:1.1rem;font-weight:700;margin-top:3px">' + pct + '%</div>' +
      '<div class="muted" style="font-size:.68rem;margin-top:1px">degree complete</div>' +
      '</div>' +
      '</div>' +
      '</section>';
  }
  /* ---- B. Graduate ---- */
  else if (p75HasGraduated()) {
    const degName = (MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree;
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const gpaColor = gpa >= 3.7 ? 'var(--mint)' : gpa >= 3.0 ? 'var(--cyan)' : gpa >= 2.0 ? 'var(--amber)' : 'var(--rose)';
    const gradYear = (S.p49 && S.p49.graduationYear) || '';
    statusCard = '<section class="card" style="padding:14px;border-left:3px solid var(--mint)">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS</div>' +
      '<div style="font-size:1.15rem;font-weight:700;margin-top:4px">🎓 Graduate</div>' +
      '<div class="muted" style="font-size:.82rem;margin-top:2px">' + degName + (gradYear ? ' · graduated ' + gradYear : '') + '</div>' +
      '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.03);border-radius:6px">' +
      '<div class="muted" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">Final GPA</div>' +
      '<div class="mono" style="font-size:1.4rem;font-weight:700;margin-top:3px;color:' + gpaColor + '">' + gpa.toFixed(2) + ' / 4.0</div>' +
      (gpa >= 3.5 ? '<div class="muted" style="font-size:.72rem;margin-top:4px;color:var(--mint)">✓ Eligible for master\'s scholarships</div>' : '') +
      '</div>' +
      '</section>';
  }
  /* ---- C. Ready for university ---- */
  else if (S.diploma && S.age >= 18) {
    statusCard = '<section class="card" style="padding:14px;border-left:3px solid var(--amber)">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS</div>' +
      '<div style="font-size:1.15rem;font-weight:700;margin-top:4px">🎓 Ready for university</div>' +
      '<div class="muted" style="font-size:.82rem;margin-top:2px">Choose a faculty below to enrol</div>' +
      '</section>';
  }
  /* ---- D. School-age ---- */
  else if (S.age < 18) {
    statusCard = '<section class="card" style="padding:14px;border-left:3px solid var(--cyan)">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS</div>' +
      '<div style="font-size:1.15rem;font-weight:700;margin-top:4px">📚 ' + (S.age <= 11 ? 'Primary' : S.age <= 14 ? 'Preparatory' : 'Secondary') + ' school</div>' +
      '<div class="muted" style="font-size:.82rem;margin-top:2px">Age ' + S.age + ' · ' + (S.school || 'no school selected') + '</div>' +
      '</section>';
  }

  return statusCard + html;
};

/* =================================================================
   5. NEXT-ACTIONS CARD — clear "what to do" guidance
   ================================================================= */
const P75_viewSchoolForActions = viewSchool;
viewSchool = function () {
  let html = P75_viewSchoolForActions.apply(this, arguments);
  if (!S || S.age < 14) return html;

  let actions = [];

  /* School-age actions */
  if (S.age < 18) {
    if (!S.school) actions.push({ label: '📚 Pick a school', action: 'activeTab=\'school\';render()' });
    if (S.age >= 9 && S.age <= 18) actions.push({ label: '📖 Private lessons', action: 'activeTab=\'school\';render()' });
    if (S.age >= 12) actions.push({ label: '🌐 Improve English', action: 'activeTab=\'school\';render()' });
  }
  /* Ready for university */
  else if (S.diploma && S.age >= 18 && !S.uni && !S.degree) {
    if (S.country === 'egy' && !(S.p68 && S.p68.thanaweyaTrack)) {
      actions.push({ label: '📝 Choose Thanaweya Amma track', action: 'activeTab=\'school\';render()' });
    } else {
      actions.push({ label: '🎓 Choose a university', action: 'activeTab=\'school\';render()' });
    }
    if (S.country === 'egy' && (!S.p69 || !S.p69.thanaweya || S.p69.thanaweya.score == null)) {
      actions.push({ label: '📊 Get Thanaweya Amma score', action: 'p69ComputeAndShowResult();' });
    }
  }
  /* Enrolled — study-related actions */
  else if (S.uni) {
    actions.push({ label: '📚 Improve grades (adjust effort)', action: 'activeTab=\'school\';render()' });
    if (S.p71 && !S.p71.studyGroupActive && S.age >= 14 && S.age <= 22) {
      actions.push({ label: '👥 Join a study group', action: 'p71JoinStudyGroup();' });
    }
    actions.push({ label: '🎭 Student activities', action: 'activeTab=\'school\';render()' });
  }
  /* Graduate — next steps */
  else if (S.degree) {
    actions.push({ label: '💼 Open Career tab', action: 'activeTab=\'career\';render()' });
    actions.push({ label: '🎓 Consider local master\'s', action: 'activeTab=\'school\';render()' });
    if (S.country === S.home && !S.mast && !S.studentVisaCase) {
      actions.push({ label: '🌍 Study abroad', action: 'p75ToggleStudyAbroad();' });
    }
  }

  if (!actions.length) return html;

  const actionsCard = '<section class="card"><h3>✅ What to do next</h3>' +
    '<div style="display:flex;flex-direction:column;gap:6px">' +
    actions.map(function (a) {
      return '<button class="btn" style="margin:0;text-align:left" onclick="' + a.action + '">' + a.label + '</button>';
    }).join('') +
    '</div></section>';

  /* Insert after the status card at the top */
  const statusEnd = html.indexOf('</section>');
  if (statusEnd !== -1) {
    return html.slice(0, statusEnd + 10) + actionsCard + html.slice(statusEnd + 10);
  }
  return actionsCard + html;
};

/* Toggle study abroad visibility */
function p75ToggleStudyAbroad() {
  p75Init(S);
  S.p75.showStudyAbroad = !S.p75.showStudyAbroad;
  render();
}
window.p75ToggleStudyAbroad = p75ToggleStudyAbroad;

/* =================================================================
   6. ENHANCED PART-TIME TAB — real jobs for students
   ================================================================= */
const P75_viewPartBefore = viewPart;
viewPart = function () {
  let html = P75_viewPartBefore.apply(this, arguments);
  if (!S) return html;

  /* Add a contextual header */
  let context = '';
  if (p75IsEnrolled()) {
    const u = S.uni;
    const un = u.universityName || ((typeof UNIS !== 'undefined' && UNIS[u.type] && UNIS[u.type].name) || 'your university');
    context = '<section class="card" style="padding:12px;border-left:3px solid var(--mint)">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">PART-TIME WORK</div>' +
      '<div style="font-size:.95rem;margin-top:4px">You are enrolled at <b>' + un + '</b>. Part-time work is allowed alongside your studies.</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:6px">A part-time job adds income but can reduce study time. Balance is important.</p>' +
      '</section>';
  } else if (S.age >= 18 && !S.degree && !S.job) {
    context = '<section class="card" style="padding:12px;border-left:3px solid var(--amber)">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">PART-TIME WORK</div>' +
      '<div style="font-size:.95rem;margin-top:4px">You are job hunting. Part-time work helps pay the bills while you look for a full-time role.</div>' +
      '</section>';
  }
  return context + html;
};

/* =================================================================
   7. INCOME SCALING FOR LOCAL JOBS — use local currency
   ================================================================= */
/* Part-time job pay is defined in base game as small internal units.
   When player lives abroad, the pay should reflect the local market. */
const P75_viewPartForLocal = viewPart;
viewPart = function () {
  let html = P75_viewPartForLocal.apply(this, arguments);
  if (!S || S.country === S.home) return html;

  /* Rewrite the $ pay to local currency */
  const c = COUNTRIES[S.country] || {};
  const rate = p75Rate();
  /* Part-time jobs typically pay local minimum wage * 20h/week */
  const localHourly = { gbr: 11, usa: 15, deu: 13, fra: 12, can: 16, aus: 23, jpn: 1100, kor: 9600 }[S.country] || 10;
  const yearlyLocal = localHourly * 20 * 44;
  const yearlyEGP = Math.round(yearlyLocal * 52.7);
  if (c.cur && c.cur !== 'EGP') {
    html = html.replace(
      /Side job for students\./g,
      'Side job for students in ' + c.n + ' · local part-time wage ≈ ' + c.sym + yearlyLocal.toLocaleString() + '/year'
    );
  }
  return html;
};

/* =================================================================
   8. INIT
   ================================================================= */
p75Init(S);
console.log('[p75] Education cleanup + part-time fix loaded');
