/* =====================================================================
   81. EDUCATION + LIFE TAB MAKEOVER
   Completely replaces viewSchool and viewLife with clean versions.
   Does NOT wrap the previous chain — it produces fresh HTML from S.
   Load AFTER 80-local-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

(function p81Makeover() {

  /* =================================================================
     1. LIFE TAB — rebuild from scratch
     ================================================================= */
  const P81_baseViewLife = viewLife;
  viewLife = function () {
    if (typeof S === 'undefined' || !S) return P81_baseViewLife.apply(this, arguments);

    let html = '';

    /* --- Status banner --- */
    const info = (typeof p45CurrentHomeInfo === 'function')
      ? p45CurrentHomeInfo()
      : { name: S.housing === 'parents' ? "Parents' home" : 'Unknown', status: '', color: 'var(--muted)' };
    html += '<section class="card" style="padding:14px;border-left:3px solid ' + info.color + '">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">YOU CURRENTLY LIVE IN</div>' +
      '<div style="font-size:1.1rem;font-weight:700;margin-top:4px">' + info.name + '</div>' +
      (info.status ? '<div class="muted" style="font-size:.82rem;margin-top:2px">' + info.status + '</div>' : '') +
      '</section>';

    /* --- Current event --- */
    const e = S.ev;
    if (e && e.title) {
      html += '<section class="card"><h3>' + e.title + '</h3>' +
        '<p class="muted">' + ((typeof evText === 'function') ? evText(e) : (e.text || '')) + '</p>' +
        ((e.choices || []).map(function (c, i) {
          const no = (typeof unaffordable === 'function') ? unaffordable(c) : false;
          return '<button class="btn" ' + (no ? 'disabled' : '') + ' onclick="choose(' + i + ')">' +
            c.label + (no ? '<small>Not enough cash</small>' : '') + '</button>';
        }).join('')) +
        '</section>';
    } else {
      html += '<section class="card"><h3>Your story</h3>' +
        '<p class="muted">Press <b>Next month</b> or <b>Age up</b> to continue.</p></section>';
    }

    /* --- Family / household --- */
    const family = (S.family || []).filter(function (m) { return m && m.alive !== false; });
    if (family.length) {
      html += '<section class="card"><h3>Your household</h3>' +
        '<div class="famrow" style="display:flex;flex-wrap:wrap;gap:10px">' +
        '<div><span>' + (typeof myFace === 'function' ? myFace() : '') + '</span> You</div>' +
        family.map(function (m) {
          return '<div><span>' + (typeof memFace === 'function' ? memFace(m) : '') + '</span>' + m.name + '</div>';
        }).join('') +
        '</div></section>';
    }

    /* --- Life log --- */
    const rows = (S.logRows || []).slice(0, 40);
    html += '<section class="card"><h3>Life log</h3>' +
      '<div id="log">' +
      (rows.length
        ? rows.map(function (r) {
            return '<div class="log-row"><b>Age ' + r.age + '</b>' + r.t + '</div>';
          }).join('')
        : '<p class="muted">Nothing logged yet.</p>') +
      '</div></section>';

    return html;
  };

  /* =================================================================
     2. EDUCATION TAB — complete clean rebuild
     ================================================================= */
  viewSchool = function () {
    if (typeof S === 'undefined' || !S) return '';
    if (S.age < 6) {
      return '<section class="card"><h3>📚 Education</h3><p class="muted">Starts at age 6.</p></section>';
    }

    let html = '';

    /* ---- A. Status banner ---- */
    html += p81EducationStatus();

    /* ---- B. Current master's (if any) ---- */
    const localMastCard = p81LocalMastCard();
    if (localMastCard) html += localMastCard;

    /* ---- C. Current bachelor's enrollment (if any) ---- */
    const uniCard = p81CurrentUniversityCard();
    if (uniCard) html += uniCard;

    /* ---- D. University selection (if ready but not enrolled) ---- */
    const uniSelect = p81UniversitySelectionCard();
    if (uniSelect) html += uniSelect;

    /* ---- E. Your degrees / achievements ---- */
    const degCard = p81DegreeCard();
    if (degCard) html += degCard;

    /* ---- F. What to do next ---- */
    const actionsCard = p81ActionsCard();
    if (actionsCard) html += actionsCard;

    /* ---- G. Languages (only useful ones) ---- */
    const langCard = p81LanguagesCard();
    if (langCard) html += langCard;

    /* ---- H. Study abroad invitation at the bottom ---- */
    if (S.country === S.home && S.degree && !S.localMast && !S.mast && !S.studentVisaCase && !S.uni) {
      html += '<section class="card" style="border-color:var(--violet);text-align:center;padding:18px">' +
        '<h3 style="margin:0">🌍 Study abroad</h3>' +
        '<p class="muted" style="font-size:.85rem;margin:8px 0">Master\'s and PhD programmes abroad — UK, USA, Germany, France, Canada and more.</p>' +
        '<button class="btn" style="width:100%;text-align:center;background:var(--violet);color:#fff;font-weight:700" onclick="p81OpenStudyAbroad()">' +
        'Explore destinations' +
        '</button></section>';
    }

    return html;
  };

  /* ---------- A. Status banner ---------- */
  function p81EducationStatus() {
    let title, subtitle, icon, color;
    if (S.localMast) {
      icon = '📖';
      title = 'Postgraduate — ' + (S.localMast.fieldName || 'Master\'s');
      subtitle = (S.localMast.universityName || 'Egyptian university') + ' · Year ' + ((S.localMast.year || 0) + 1) + ' of ' + (S.localMast.yearsTotal || 2);
      color = 'var(--violet)';
    } else if (S.uni) {
      icon = '📖';
      const un = S.uni.universityName || (typeof UNIS !== 'undefined' && UNIS[S.uni.type] ? UNIS[S.uni.type].name : 'University');
      title = 'Enrolled — ' + (S.uni.faculty || (S.uni.major && MAJORS[S.uni.major] ? MAJORS[S.uni.major].name : 'student'));
      subtitle = un + ' · Year ' + ((S.uni.year || 0) + 1) + ' of ' + (S.uni.yearsTotal || 4);
      color = 'var(--violet)';
    } else if (S.degree) {
      icon = '🎓';
      title = 'Graduate';
      const degName = (typeof MAJORS !== 'undefined' && MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree;
      const gradYear = (S.p49 && S.p49.graduationYear) || '';
      subtitle = degName + (gradYear ? ' · graduated ' + gradYear : '');
      color = 'var(--mint)';
    } else if (S.diploma && S.age >= 18) {
      icon = '🎓';
      title = 'Ready for university';
      subtitle = 'Choose a university below';
      color = 'var(--amber)';
    } else if (S.age >= 18) {
      icon = '📕';
      title = 'No diploma';
      subtitle = 'Entry-level work only — Career tab';
      color = 'var(--amber)';
    } else {
      icon = '📚';
      title = (S.age <= 11 ? 'Primary' : S.age <= 14 ? 'Preparatory' : 'Secondary') + ' school';
      subtitle = 'Age ' + S.age + ' · ' + (S.school || 'no school chosen');
      color = 'var(--cyan)';
    }

    let body = '<section class="card" style="padding:14px;border-left:3px solid ' + color + '">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS</div>' +
      '<div style="font-size:1.1rem;font-weight:700;margin-top:4px">' + icon + ' ' + title + '</div>' +
      (subtitle ? '<div class="muted" style="font-size:.82rem;margin-top:2px">' + subtitle + '</div>' : '');

    /* GPA display if applicable */
    if ((S.gpa && S.gpaN) && (S.degree || S.uni || S.localMast)) {
      const gpa = S.gpa;
      const gpaColor = gpa >= 3.7 ? 'var(--mint)' : gpa >= 3.0 ? 'var(--cyan)' : gpa >= 2.0 ? 'var(--amber)' : 'var(--rose)';
      body += '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.03);border-radius:6px;display:flex;justify-content:space-between;align-items:center">' +
        '<div class="muted" style="font-size:.72rem;text-transform:uppercase">GPA</div>' +
        '<div class="mono" style="font-size:1.2rem;font-weight:700;color:' + gpaColor + '">' + gpa.toFixed(2) + ' / 4.0</div>' +
        '</div>';
    }

    body += '</section>';
    return body;
  }

  /* ---------- B. Local Master's in progress ---------- */
  function p81LocalMastCard() {
    if (!S || !S.localMast) return '';
    const m = S.localMast;

    /* Normalize missing fields */
    if (!m.kind) m.kind = 'public';
    if (!m.yearsTotal || isNaN(m.yearsTotal)) m.yearsTotal = 2;
    if (typeof m.year !== 'number' || isNaN(m.year)) m.year = 0;
    if (!m.fieldName || m.fieldName === 'undefined') m.fieldName = 'Master\'s programme';

    const kindLabel = m.kind === 'private' ? 'Private university' : 'Public university';
    const uniLine = m.universityName || 'Egyptian university';
    const progressPct = Math.round(((m.year || 0) / (m.yearsTotal || 2)) * 100);

    return '<section class="card" style="border-color:var(--violet)">' +
      '<h3>📖 Master\'s in progress</h3>' +
      '<div class="row"><span>Programme</span><b>' + m.fieldName + '</b></div>' +
      '<div class="row"><span>University</span><b>' + uniLine + '</b></div>' +
      '<div class="row"><span>Type</span><b>' + kindLabel + '</b></div>' +
      '<div class="row"><span>Year</span><b>' + ((m.year || 0) + 1) + ' of ' + (m.yearsTotal || 2) + '</b></div>' +
      '<div style="height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin:10px 0">' +
      '<div style="height:100%;width:' + progressPct + '%;background:var(--violet)"></div>' +
      '</div>' +
      '<button class="btn" style="border-color:var(--rose);color:var(--rose)" onclick="p81LeaveLocalMast()">Leave master\'s</button>' +
      '</section>';
  }

  window.p81LeaveLocalMast = function () {
    if (!S || !S.localMast) return;
    if (!confirm('Leave your master\'s programme? Tuition paid so far is not refunded.')) return;
    S.localMast = null;
    if (typeof log === 'function') log('You withdrew from your master\'s programme.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* ---------- C. Current university enrollment (Egypt or abroad) ---------- */
  function p81CurrentUniversityCard() {
    if (!S || !S.uni) return '';
    const u = S.uni;
    const years = u.yearsTotal || ((u.major && MAJORS[u.major]) ? MAJORS[u.major].years : 4);
    const yearNow = (u.year || 0);
    const progressPct = Math.round((yearNow / years) * 100);
    const unName = u.universityName || ((typeof UNIS !== 'undefined' && UNIS[u.type]) ? UNIS[u.type].name : 'University');
    const faculty = u.faculty || (u.major && MAJORS[u.major] ? MAJORS[u.major].name : 'your program');
    const payLabel = { 'self': 'You are paying', 'parents': 'Parents pay', 'loan': 'Student loan' }[u.pay] || 'Self-funded';
    const tuition = (typeof tuitionFor === 'function') ? tuitionFor(u) : 0;

    return '<section class="card">' +
      '<h3>📖 Currently enrolled</h3>' +
      '<div class="row"><span>University</span><b>' + unName + '</b></div>' +
      '<div class="row"><span>Faculty / Field</span><b>' + faculty + '</b></div>' +
      '<div class="row"><span>Year</span><b>' + (yearNow + 1) + ' of ' + years + '</b></div>' +
      (tuition ? '<div class="row"><span>Tuition</span><b class="mono">' + (typeof money === 'function' ? money(tuition) : tuition) + '/year</b></div>' : '') +
      '<div class="row"><span>Funding</span><b>' + payLabel + '</b></div>' +
      '<div style="height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin:10px 0">' +
      '<div style="height:100%;width:' + progressPct + '%;background:var(--violet)"></div>' +
      '</div>' +
      (S.effort ? '<h4 style="font-size:.85rem;margin-top:12px">Effort this year</h4>' +
        Object.keys(typeof EFFORT !== 'undefined' ? EFFORT : {}).map(function (k) {
          const e = EFFORT[k];
          return '<button class="btn ' + (S.effort === k ? 'sel' : '') + '" onclick="pickEffort(\'' + k + '\')">' + e.label + '</button>';
        }).join('') : '') +
      '<button class="btn" style="border-color:var(--rose);color:var(--rose)" onclick="dropOut()">Drop out</button>' +
      '</section>';
  }

  /* ---------- D. University selection (ready but not enrolled) ---------- */
  function p81UniversitySelectionCard() {
    if (!S || S.age < 18) return '';
    if (S.uni || S.degree || S.localMast) return '';
    if (!S.diploma) return '';

    /* Egyptian route via Tansik */
    if (S.country === 'egy') {
      /* Check for Thanaweya Amma flow */
      if (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score != null) {
        /* Score obtained — show Egyptian universities if available */
        if (typeof viewEgyptUniversitySelection === 'function') {
          const egyptUI = viewEgyptUniversitySelection();
          if (egyptUI) return egyptUI;
        }
      }
      /* No score yet */
      return '<section class="card"><h3>🎓 Your Egyptian university path</h3>' +
        '<p class="muted">To enter an Egyptian public university, you need your Thanaweya Amma result first.</p>' +
        '<button class="btn" onclick="p81OpenTansik()">Open Tansik (university matching)</button>' +
        '</section>';
    }

    /* Non-Egyptian: local + abroad */
    return '<section class="card"><h3>🎓 Choose your university</h3>' +
      '<p class="muted">Pick a major. Public universities are nearly free; private ones cost 60k–200k EGP/year.</p>' +
      (typeof p81SimpleMajorPanel === 'function' ? p81SimpleMajorPanel() : '') +
      '</section>';
  }

  window.p81OpenTansik = function () {
    /* Try to compute Thanaweya score first */
    if (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score == null) {
      if (typeof p69ComputeAndShowResult === 'function') {
        p69ComputeAndShowResult();
        return;
      }
    }
    /* Already has score — just open the Egypt uni picker */
    if (typeof viewEgyptUniversitySelection === 'function') {
      hint('Scroll to see universities');
    }
  };

  /* ---------- E. Your degrees / achievements summary ---------- */
  function p81DegreeCard() {
    if (!S || !S.degree) return '';
    const degName = (typeof MAJORS !== 'undefined' && MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree;
    const gradYear = (S.p49 && S.p49.graduationYear) || '';
    const gpa = (S.gpa && S.gpaN) ? S.gpa.toFixed(2) : '—';

    return '<section class="card"><h3>🎓 Your degree</h3>' +
      '<div class="row"><span>Degree</span><b>' + degName + '</b></div>' +
      '<div class="row"><span>Graduated</span><b>' + (gradYear || '—') + '</b></div>' +
      '<div class="row"><span>Final GPA</span><b>' + gpa + ' / 4.0</b></div>' +
      (gpa && parseFloat(gpa) >= 3.5 ? '<p class="muted" style="font-size:.78rem;color:var(--mint);margin-top:6px">✓ Eligible for master\'s scholarships</p>' : '') +
      '</section>';
  }

  /* ---------- F. Contextual action buttons ---------- */
  function p81ActionsCard() {
    const actions = [];

    if (S.age < 18) {
      if (!S.school) actions.push({ icon: '📚', label: 'Pick a school', onclick: 'go(\'school\')' });
      if (S.age >= 12) actions.push({ icon: '🌐', label: 'Improve English', onclick: 'go(\'school\')' });
      if (S.age >= 15 && S.country === 'egy' && (!S.p68 || !S.p68.thanaweyaTrack)) {
        actions.push({ icon: '📝', label: 'Choose Thanaweya Amma track', onclick: 'go(\'school\')' });
      }
    } else if (S.uni) {
      actions.push({ icon: '📖', label: 'Adjust study effort', onclick: 'go(\'school\')' });
    } else if (S.localMast) {
      /* Master's in progress — nothing critical */
    } else if (S.degree && !S.localMast) {
      if (S.job) {
        actions.push({ icon: '💼', label: 'Advance your career', onclick: 'go(\'career\')' });
      } else {
        actions.push({ icon: '💼', label: 'Find a job', onclick: 'go(\'career\')' });
      }
      if (S.country === S.home) {
        actions.push({ icon: '🎓', label: 'Consider a local master\'s', onclick: 'p79OpenLocalMaster()' });
      }
    } else if (S.diploma && !S.degree && !S.uni && S.age >= 18) {
      actions.push({ icon: '🎓', label: 'Enrol in university', onclick: 'p81OpenTansik()' });
      if (!S.job) actions.push({ icon: '💼', label: 'Find a job', onclick: 'go(\'career\')' });
    }

    if (!actions.length) return '';

    return '<section class="card"><h3>✅ What to do next</h3>' +
      '<div style="display:flex;flex-direction:column;gap:6px">' +
      actions.slice(0, 4).map(function (a) {
        return '<button class="btn" style="margin:0;text-align:left" onclick="' + a.onclick + '">' +
          a.icon + ' ' + a.label + '</button>';
      }).join('') +
      '</div></section>';
  }

  /* ---------- G. Languages ---------- */
  function p81LanguagesCard() {
    if (S.age < 12) return '';
    /* Show if enrolled or graduate */
    if (!S.uni && !S.degree && !S.localMast) return '';

    let html = '<section class="card"><h3>🌐 Languages & exams</h3>';

    /* English */
    const eng = Number(S.eng) || 0;
    html += '<h4 style="font-size:.85rem;color:var(--cyan);margin-top:4px">🇬🇧 English — ' + eng + '%</h4>' +
      '<div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden;margin:6px 0">' +
      '<div style="height:100%;width:' + eng + '%;background:var(--cyan)"></div></div>';

    if (typeof ENG !== 'undefined' && Array.isArray(ENG) && ENG.length) {
      ENG.forEach(function (c, i) {
        const price = (typeof svc === 'function') ? svc(c[1]) : (c[1] || 0);
        const canPay = S.wealth >= (price / (typeof rateNow === 'function' ? rateNow() : 52.7));
        const cooldown = (typeof p72CanTakeLang === 'function') ? !p72CanTakeLang('english') : false;
        html += '<button class="btn" ' + (canPay && !cooldown ? '' : 'disabled') + ' onclick="takeEng(' + i + ')">' +
          c[0] + ' · ' + (price ? (typeof money === 'function' ? money(price) : price) : 'Free') + ' · +' + c[2] + ' English' +
          (cooldown ? '<small>Cooldown active</small>' : '') +
          '</button>';
      });
    }

    /* IELTS/TOEFL */
    if (S.age >= 16) {
      const ielts = S.ielts || 0;
      const toefl = S.toefl || 0;
      html += '<h4 style="font-size:.85rem;color:var(--cyan);margin-top:12px">📝 IELTS / TOEFL</h4>' +
        '<div class="row" style="padding:4px 0;font-size:.82rem"><span>IELTS</span><b>' + (ielts || 'Not taken') + '</b></div>' +
        '<div class="row" style="padding:4px 0;font-size:.82rem"><span>TOEFL</span><b>' + (toefl ? toefl + ' / 120' : 'Not taken') + '</b></div>';
    }

    html += '</section>';
    return html;
  }

  /* ---------- Study abroad opener ---------- */
  window.p81OpenStudyAbroad = function () {
    if (typeof p79OpenStudyAbroad === 'function') return p79OpenStudyAbroad();
    if (typeof p80ShowPathwayModal === 'function') return p80ShowPathwayModal();
    hint('Study-abroad picker not available.');
  };

  /* =================================================================
     3. GLOBAL DOM CLEANUP — remove cards that leaked into wrong tabs
     ================================================================= */
  function p81CleanupOtherTabs() {
    if (typeof S === 'undefined' || !S) return;
    const view = document.getElementById('view');
    if (!view) return;

    /* Remove any family business card from Life tab */
    if (activeTab === 'life') {
      view.querySelectorAll('section.card').forEach(function (sec) {
        const t = sec.textContent || '';
        if (t.indexOf('Your family owns and operates') !== -1) sec.remove();
        if (t.indexOf('You currently live in') === -1 && t.indexOf('YOU CURRENTLY LIVE IN') === -1) {
          /* Keep the current-home banner if present */
        }
      });
    }

    /* Remove career ladder from Education */
    if (activeTab === 'school') {
      view.querySelectorAll('section.card').forEach(function (sec) {
        const h3 = sec.querySelector('h3');
        if (!h3) return;
        const t = h3.textContent || '';
        if (t.indexOf('career ladder') !== -1) sec.remove();
        if (t.indexOf('Egyptian university cutoffs') !== -1 && (S.degree || S.uni || S.localMast)) sec.remove();
        if (t.indexOf('Thanaweya Amma:') !== -1 && (S.degree || S.uni || S.localMast)) sec.remove();
        if (t.indexOf('Your Thanaweya Amma position') !== -1 && (S.degree || S.uni || S.localMast)) sec.remove();
        if (t.indexOf('Choose Thanaweya Amma track') !== -1 && (S.degree || S.uni || S.localMast)) sec.remove();
        if (t.indexOf('Target destination') !== -1) sec.remove();
        if (t.indexOf('Master\'s abroad — year 1 costs') !== -1) sec.remove();
        if (t.indexOf('Study abroad — realistic costs') !== -1) sec.remove();
      });
    }
  }
  const P81_origRender = render;
  render = function () {
    const r = P81_origRender.apply(this, arguments);
    setTimeout(p81CleanupOtherTabs, 60);
    return r;
  };

  console.log('[p81] Education + Life makeover loaded');
})();
