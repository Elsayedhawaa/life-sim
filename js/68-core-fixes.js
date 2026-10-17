/* =====================================================================
   68. CORE FIXES — Phase 3.1 consolidation (merge pass 1)
   Replaces: 68-car-education-fix.js, 73-abroad-career-tracking-fix.js,
             74-education-abroad-fix.js, 75-education-parttime-cleanup.js,
             78-consolidated.js, 79-education-uni-fix.js
   Load AFTER 67-debt-truth-fix.js and BEFORE 69-study-abroad-system.js

   Merge pass note:
   - Removed PART 4 (dead p77FamilyBusinessCard override — captured at
     module load before 76 was loaded, so it never executed).
   - Removed the viewCareer, viewFamily, viewAssets, viewBank wrappers.
     Their work (family business card, extended family, household staff,
     trust fund) is now done exclusively in 76-family-dynasty.js, which
     loads after this file and strips+re-adds the same cards anyway.
   ===================================================================== */

(function p68CoreFixes() {
  'use strict';

  /* =================================================================
     PART 1 — COMPAT SHIMS (guards for symbols from later files)
     ================================================================= */
  if (typeof window.companyListFor !== 'function') {
    window.companyListFor = function (country) {
      country = country || (S && S.country) || 'egy';
      if (country === 'egy') {
        return [
          { id: 'shim_egy_1', name: 'Cairo Business Services',     title: 'Customer Support Agent', trackId: 'entry',   factor: 1, smarts: 20, eng: 40 },
          { id: 'shim_egy_2', name: 'Nile Digital Solutions',       title: 'Junior Developer',        trackId: 'tech',    factor: 1, smarts: 50, eng: 50 },
          { id: 'shim_egy_3', name: 'Alexandria Commercial Bank',   title: 'Junior Analyst',          trackId: 'finance', factor: 1, smarts: 45, eng: 40 },
          { id: 'shim_egy_4', name: 'Cleopatra Healthcare Network', title: 'Junior Clinical Role',    trackId: 'medical', factor: 1, smarts: 60, eng: 45 },
          { id: 'shim_egy_5', name: 'Sphinx Legal Partners',        title: 'Junior Legal Associate',  trackId: 'law',     factor: 1, smarts: 55, eng: 45 }
        ];
      }
      return [{ id: 'shim_local_1', name: 'Local Business Services', title: 'Assistant', trackId: 'entry', factor: 1, smarts: 20, eng: 60 }];
    };
  }

  if (typeof window.P12_EGY_BRANDS === 'undefined') {
    window.P12_EGY_BRANDS = [
      'Vodafone Egypt','Vodafone VOIS','Teleperformance Egypt','Concentrix Egypt',
      'Raya CX','Xceed','Alorica Egypt','Foundever Egypt','Sutherland Egypt',
      'Nile Data Systems','Pyramid Digital Solutions','Cairo Business Process Services',
      'Fawry','Commercial International Bank','Alexandria Commercial Bank',
      'National Bank of Egypt','Cleopatra Healthcare Network','NileCare Medical Network',
      'Mediterranean Medical Group','Eva Pharma','Ibnsina Pharma','El Ezaby Pharmacies',
      'Sphinx Legal Partners','Al-Ahram','Al-Masry Al-Youm',
      'Delta Audit & Tax','Mansoura Industrial Group','Orascom Construction'
    ];
  }

  if (typeof COUNTRIES === 'object' && COUNTRIES) {
    const fb = {
      'egy':{ n:'Egypt', f:'🇪🇬', sym:'E£', cur:'EGP' },
      'gbr':{ n:'United Kingdom', f:'🇬🇧', sym:'£', cur:'GBP' },
      'usa':{ n:'United States', f:'🇺🇸', sym:'$', cur:'USD' },
      'deu':{ n:'Germany', f:'🇩🇪', sym:'€', cur:'EUR' },
      'fra':{ n:'France', f:'🇫🇷', sym:'€', cur:'EUR' },
      'ita':{ n:'Italy', f:'🇮🇹', sym:'€', cur:'EUR' },
      'nld':{ n:'Netherlands', f:'🇳🇱', sym:'€', cur:'EUR' },
      'can':{ n:'Canada', f:'🇨🇦', sym:'C$', cur:'CAD' },
      'aus':{ n:'Australia', f:'🇦🇺', sym:'A$', cur:'AUD' },
      'jpn':{ n:'Japan', f:'🇯🇵', sym:'¥', cur:'JPY' },
      'kor':{ n:'South Korea', f:'🇰🇷', sym:'₩', cur:'KRW' },
      'sgp':{ n:'Singapore', f:'🇸🇬', sym:'S$', cur:'SGD' },
      'uae':{ n:'UAE', f:'🇦🇪', sym:'د.إ', cur:'AED' },
      'sau':{ n:'Saudi Arabia', f:'🇸🇦', sym:'﷼', cur:'SAR' },
      'tur':{ n:'Türkiye', f:'🇹🇷', sym:'₺', cur:'TRY' },
      'ind':{ n:'India', f:'🇮🇳', sym:'₹', cur:'INR' },
      'pak':{ n:'Pakistan', f:'🇵🇰', sym:'₨', cur:'PKR' },
      'nga':{ n:'Nigeria', f:'🇳🇬', sym:'₦', cur:'NGN' },
      'bra':{ n:'Brazil', f:'🇧🇷', sym:'R$', cur:'BRL' }
    };
    Object.keys(fb).forEach(function (code) {
      if (!COUNTRIES[code] || !COUNTRIES[code].n) {
        COUNTRIES[code] = Object.assign({}, fb[code], COUNTRIES[code] || {});
      }
    });
  }

  /* Defensive langCard — never throws on missing country */
  if (typeof window.langCard === 'function') {
    const _langCard = window.langCard;
    window.langCard = function (lang, info) {
      try {
        if (!info) return '';
        if (!info.country) info.country = 'egy';
        if (typeof COUNTRIES === 'object' && COUNTRIES && !COUNTRIES[info.country]) {
          COUNTRIES[info.country] = { n: String(info.country).toUpperCase(), f: '🌐', sym: '', cur: '' };
        }
        return _langCard.apply(this, arguments);
      } catch (e) {
        console.error('[p68] langCard failed:', e && e.message);
        return '';
      }
    };
  }

  /* =================================================================
     PART 2 — STATE INITIALIZERS (from 73, 74, 78)
     ================================================================= */
  function p68Init(o) {
    o = o || S;
    if (!o) return;
    if (!o.p73) o.p73 = {};
    if (typeof o.p73.abroadStartedYear !== 'number') o.p73.abroadStartedYear = -1;
    if (typeof o.p73.abroadField !== 'string') o.p73.abroadField = null;
    if (typeof o.p73.studentJob !== 'boolean') o.p73.studentJob = false;
    if (typeof o.p73.overstayWork !== 'boolean') o.p73.overstayWork = false;

    if (!o.p74) o.p74 = {};
    if (typeof o.p74.enrollStartAbsMonth !== 'number') o.p74.enrollStartAbsMonth = -1;
    if (typeof o.p74.enrollTotalMonths !== 'number') o.p74.enrollTotalMonths = 0;
    if (typeof o.p74.enrollField !== 'string') o.p74.enrollField = null;
    if (typeof o.p74.lastAutoJobCheck !== 'number') o.p74.lastAutoJobCheck = -1;
    if (typeof o.p74.jobAutoQuitDone !== 'boolean') o.p74.jobAutoQuitDone = false;

    if (!o.p78) o.p78 = {};
  }
  const _migrate = migrate;
  migrate = function (o) { const r = _migrate(o); p68Init(r); return r; };
  const _newGame = newGame;
  newGame = function () { _newGame.apply(this, arguments); p68Init(S); };

  function p68IsAbroad() { return !!(S && S.country !== S.home); }
  function p68IsAbroadStudent() { return p68IsAbroad() && S && S.p69 && S.p69.enrolled; }
  function p68CurrentAbsMonth() { return Number(S && S.pacingAbsoluteMonth) || 0; }
  function p68EnrollmentMonthsElapsed() {
    p68Init(S);
    if (S.p74.enrollStartAbsMonth < 0) return 0;
    return Math.max(0, p68CurrentAbsMonth() - S.p74.enrollStartAbsMonth);
  }
  function p68EnrollmentMonthsLeft() {
    return Math.max(0, (S.p74.enrollTotalMonths || 0) - p68EnrollmentMonthsElapsed());
  }

  function p68CaptureEnrollment() {
    if (!S || !S.p69 || !S.p69.enrolled) return;
    p68Init(S);
    const e = S.p69.enrolled;
    const duration = e.level === 'bachelor' ? 3 : 2;
    S.p74.enrollStartAbsMonth = p68CurrentAbsMonth();
    S.p74.enrollTotalMonths = duration * 12;
    S.p74.enrollField = (S.p73 && S.p73.abroadField) || e.field || 'General';
  }

  function p68HandleJobOnMove() {
    if (!S || !S.job) return;
    p68Init(S);
    if (S.p74.jobAutoQuitDone) return;
    if (S.country === S.home) return;
    const isStudent = S.p69 && S.p69.enrolled;
    if (isStudent) {
      const title = S.job.title || 'your job';
      const co = S.job.company || 'your employer';
      S.job = null;
      S.p74.jobAutoQuitDone = true;
      if (typeof log === 'function') log('💼 You left ' + title + ' at ' + co + ' when you moved abroad on a student visa.');
      if (S.part) S.part = null;
    }
  }

  function p68CleanApplications() {
    if (!S || !S.p69 || !Array.isArray(S.p69.applications)) return;
    const before = S.p69.applications.length;
    S.p69.applications = S.p69.applications.filter(function (a) { return a && a.stage !== 'completed'; });
    if (S.p69.applications.length !== before) { if (typeof save === 'function') save(); }
  }
  setTimeout(p68CleanApplications, 500);

  /* =================================================================
     PART 3 — STATE HEALER (from 78-consolidated)
     ================================================================= */
  function healState() {
    if (!S) return;
    let n = 0;
    ['cars','family','friends','logRows','certificates','ownedHomes','inventory','loans','pacingLog'].forEach(function (k) {
      if (!Array.isArray(S[k])) { S[k] = []; n++; }
    });
    if (!S.bank || typeof S.bank !== 'object') {
      S.bank = { installments:{}, cardDebt:{}, activeCards:[], primaryCard:null, score:680, savingsBal:0, loans:[], missedPmts:0 }; n++;
    }
    ['installments','cardDebt'].forEach(function (k) { if (!S.bank[k]) { S.bank[k] = {}; n++; } });
    ['activeCards','loans'].forEach(function (k) { if (!Array.isArray(S.bank[k])) { S.bank[k] = []; n++; } });
    if (!S.p79) S.p79 = { appliedUnis: [] };
    if (!Array.isArray(S.p79.appliedUnis)) { S.p79.appliedUnis = []; n++; }
    const dflt = { wealth:0, health:100, happiness:100, smarts:50, social:50, eng:0, loan:0, income:0, expenses:0 };
    Object.keys(dflt).forEach(function (k) {
      if (isNaN(Number(S[k])) || S[k] == null) { S[k] = dflt[k]; n++; }
    });
    if (isNaN(Number(S.age)) || S.age < 0) { S.age = 6; n++; }
    if (S.pacing !== 'yearly' && S.pacing !== 'monthly') { S.pacing = 'yearly'; n++; }
    if (isNaN(Number(S.pacingMonth))) S.pacingMonth = 1;
    if (isNaN(Number(S.pacingAbsoluteMonth))) S.pacingAbsoluteMonth = 0;
    if (S.localMast) {
      if (isNaN(Number(S.localMast.year))) S.localMast.year = 0;
      if (isNaN(Number(S.localMast.yearsTotal)) || !S.localMast.yearsTotal) S.localMast.yearsTotal = 2;
      if (!S.localMast.fieldName || S.localMast.fieldName === 'undefined') S.localMast.fieldName = "Master's programme";
      const s = ((S.localMast.universityName || '') + ' ' + (S.localMast.universityId || '')).toLowerCase();
      const priv = /auc|american university|guc|german university|bue|british university|aastmt|arab academy|miu|misr international|buc|badr university|msa|modern sciences|nile university|future university|heliopolis|must|o6u|mti|eri|ust/.test(s);
      if (priv) S.localMast.kind = 'private';
      else if (!S.localMast.kind) S.localMast.kind = 'public';
    }
    if (n > 0) console.log('[p68] Healed ' + n + ' field(s).');
  }
  window.p68Heal = healState;
  setTimeout(healState, 150);
  setTimeout(healState, 900);

  const _newGame2 = newGame;
  newGame = function () { _newGame2.apply(this, arguments); setTimeout(healState, 200); };
  const _loadGame2 = loadGame;
  loadGame = function () { _loadGame2.apply(this, arguments); setTimeout(healState, 200); };

  /* =================================================================
     PART 5 — MASTER'S YEAR ADVANCEMENT
     ================================================================= */
  const _ageUp1 = ageUp;
  ageUp = function () {
    const a0 = S && S.age;
    const r = _ageUp1.apply(this, arguments);
    if (!S || S.age === a0) return r;
    if (S.localMast) {
      const y = (typeof gameYear === 'function') ? gameYear() : 2026;
      if (S.localMast.lastAdvanceYear !== y) {
        S.localMast.lastAdvanceYear = y;
        S.localMast.year = (S.localMast.year || 0) + 1;
        if (S.localMast.year >= (S.localMast.yearsTotal || 2)) {
          S.mastDone = true;
          S.masterField = S.localMast.fieldName;
          const uni = S.localMast.universityName || 'Egyptian university';
          const fld = S.localMast.fieldName || 'postgraduate programme';
          if (typeof log === 'function') log('🎓 Completed your Master\'s in ' + fld + ' at ' + uni + '.');
          if (typeof realismNotice === 'function') realismNotice('Master\'s completed', 'You earned a Master\'s in ' + fld + ' from ' + uni + '.');
          S.localMast = null;
        } else if (typeof log === 'function') {
          log('📖 Master\'s year ' + ((S.localMast.year || 0) + 1) + ' of ' + (S.localMast.yearsTotal || 2) + ' started.');
        }
      }
    }
    return r;
  };

  /* =================================================================
     PART 6 — UNIVERSITY FACULTY CATALOG (from 79)
     ================================================================= */
  const UNI_FACULTIES = {
    'cairo':     ['Medicine','Dentistry','Pharmacy','Nursing','Veterinary','Physical Therapy','Science','Engineering','Computer Science','Economics','Business','Law','Arts','Mass Comm','Education','Agriculture'],
    'alexandria':['Medicine','Dentistry','Pharmacy','Nursing','Veterinary','Physical Therapy','Science','Engineering','Computer Science','Economics','Business','Law','Arts','Mass Comm','Education','Agriculture'],
    'ain-shams': ['Medicine','Dentistry','Pharmacy','Nursing','Veterinary','Physical Therapy','Science','Engineering','Computer Science','Economics','Business','Law','Arts','Mass Comm','Education','Agriculture'],
    'auc':       ['Business','Economics','Computer Science','Engineering','Mass Comm','Arts','Languages'],
    'guc':       ['Engineering','Computer Science','Pharmacy','Business','Biotechnology'],
    'bue':       ['Dentistry','Engineering','Business','Pharmacy','Mass Comm'],
    'aastmt':    ['Engineering','Computer Science','Business','Logistics'],
    'buc':       ['Medicine','Dentistry','Engineering','Business','Pharmacy'],
    'miu':       ['Business','Pharmacy','Computer Science','Mass Comm','Dentistry'],
    'msa':       ['Business','Mass Comm','Computer Science','Pharmacy'],
    'nile':      ['Engineering','Business','Computer Science'],
    'future':    ['Engineering','Pharmacy','Business','Computer Science'],
    'helwan_i':  ['Business','Engineering']
  };

  const ELIGIBLE_BY_TRACK = {
    'adabi':       ['Law','Business','Economics','Arts','Education','Mass Comm','Languages','Humanities','Social Work','Tourism & Hotels','Management'],
    'elmi-riyada': ['Engineering','Computer Science','Science','Pharmacy','Business','Economics','Management','Applied Sciences','Logistics','Physical Therapy','Agriculture'],
    'elmi-olom':   ['Medicine','Dentistry','Pharmacy','Physical Therapy','Nursing','Veterinary','Science','Agriculture','Business','Applied Sciences','Biotechnology']
  };

  function uniKeyFromName(name) {
    if (!name) return null;
    const n = name.toLowerCase();
    if (n.indexOf('cairo') !== -1 && n.indexOf('american') === -1) return 'cairo';
    if (n.indexOf('alexandria') !== -1) return 'alexandria';
    if (n.indexOf('ain shams') !== -1) return 'ain-shams';
    if (n.indexOf('american university') !== -1) return 'auc';
    if (n.indexOf('german university') !== -1) return 'guc';
    if (n.indexOf('british university') !== -1) return 'bue';
    if (n.indexOf('arab academy') !== -1) return 'aastmt';
    if (n.indexOf('badr university') !== -1) return 'buc';
    if (n.indexOf('misr international') !== -1) return 'miu';
    if (n.indexOf('modern sciences') !== -1) return 'msa';
    if (n.indexOf('nile university') !== -1) return 'nile';
    if (n.indexOf('future university') !== -1) return 'future';
    if (n.indexOf('heliopolis') !== -1) return 'helwan_i';
    return null;
  }
  window.p68UniKeyFromName = uniKeyFromName;

  window.p68SelectFaculty = function (key, fac) {
    window.p68UniFacultySelect = window.p68UniFacultySelect || {};
    window.p68UniFacultySelect[key] = fac;
    document.querySelectorAll('[data-p68-uni="' + key + '"]').forEach(function (b) {
      b.classList.toggle('sel', b.getAttribute('data-p68-fac') === fac);
    });
  };

  window.p68EnrollFaculty = function (key, fac, funder) {
    if (!S) return;
    if (typeof enrollEgyptUniversity === 'function') { enrollEgyptUniversity(key, fac, funder); return; }
    if (typeof enrollUni === 'function') { enrollUni('public', fac); return; }
    const map = {
      cairo:'Cairo University', alexandria:'Alexandria University', 'ain-shams':'Ain Shams University',
      auc:'American University in Cairo', guc:'German University in Cairo', bue:'British University in Egypt',
      aastmt:'Arab Academy for Science & Technology', buc:'Badr University in Cairo',
      miu:'Misr International University', msa:'Modern Sciences and Arts University',
      nile:'Nile University', future:'Future University in Egypt', helwan_i:'Heliopolis University'
    };
    S.uni = {
      type: /auc|guc|bue|aastmt|buc|miu|msa|nile|future|heliopolis/i.test(key) ? 'private' : 'public',
      universityId: key, universityName: map[key] || 'Egyptian University',
      faculty: fac, year: 0,
      yearsTotal: /Medicine|Dentistry|Pharmacy|Engineering/i.test(fac) ? 5 : 4,
      pay: funder || 'self', scholar: false,
      annualCostEGP: funder === 'self' ? (map[key] && /american/i.test(map[key]) ? 500000 : 25000) : 0
    };
    if (typeof log === 'function') log('🎓 Enrolled at ' + S.uni.universityName + ' — ' + fac + '.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     PART 7 — SCHOOL PICKER + EFFORT + TRACK (from 78)
     ================================================================= */
  window.p68PickSchool = function (k) {
    if (!S) return;
    if (typeof SCHOOLS === 'undefined' || !SCHOOLS[k]) return;
    if (typeof schoolBlock === 'function' && schoolBlock(k)) return;
    S.school = k;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };
  window.p68PickEffort = function (k) {
    if (!S) return;
    S.effort = k;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };
  window.p68ChooseTrack = function (track) {
    if (!S) return;
    if (S.age < 15 || S.age > 18) return;
    S.p68 = S.p68 || {};
    S.p68.thanaweyaTrack = track;
    const label = { adabi:'Adabi (Literary)', 'elmi-riyada':'Elmi Riyada (Science-Math)', 'elmi-olom':'Elmi Olom (Science-Biology)' }[track];
    if (typeof log === 'function') log('📝 You chose the Thanaweya Amma track: ' + label + '.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     PART 8 — DOM DECORATORS (run after every render)
     ================================================================= */
  function dedupeStatus() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'school') return;
    const view = document.getElementById('view');
    if (!view) return;
    const matches = [];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const t = sec.textContent || '';
      if (t.indexOf('EDUCATION STATUS') !== -1 && t.length < 400) matches.push(sec);
    });
    for (let i = 1; i < matches.length; i++) matches[i].remove();
  }

  function fixChooseUniButton() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'school') return;
    const view = document.getElementById('view');
    if (!view) return;
    view.querySelectorAll('button').forEach(function (btn) {
      const t = (btn.textContent || '').trim();
      if (t !== '🎓 Choose a university' && t !== 'Choose a university') return;
      if (btn.dataset.p68Fixed === '1') return;
      btn.dataset.p68Fixed = '1';
      btn.setAttribute('onclick', 'p68ScrollToUniversities()');
    });
  }
  window.p68ScrollToUniversities = function () {
    const view = document.getElementById('view');
    if (!view) return;
    const cards = view.querySelectorAll('section.card');
    for (let i = 0; i < cards.length; i++) {
      const h3 = cards[i].querySelector('h3');
      if (h3 && uniKeyFromName(h3.textContent)) {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  };

  function decorateUniCards() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'school') return;
    if (S.country !== 'egy') return;
    if (S.uni || S.degree || S.localMast) return;
    if (!S.diploma) return;
    const view = document.getElementById('view');
    if (!view) return;
    const track = (S.p68 && S.p68.thanaweyaTrack) || 'adabi';
    const elig = ELIGIBLE_BY_TRACK[track] || [];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const h3 = sec.querySelector('h3');
      if (!h3) return;
      const key = uniKeyFromName(h3.textContent);
      if (!key) return;
      if (sec.dataset.p68FacAdded === '1') return;
      sec.dataset.p68FacAdded = '1';
      const all = UNI_FACULTIES[key] || [];
      const facs = all.filter(function (f) { return elig.indexOf(f) !== -1; });
      if (!facs.length) return;
      const block = document.createElement('div');
      block.style.cssText = 'margin-top:14px;padding:12px;background:rgba(139,92,246,.06);border-radius:8px;border-left:3px solid var(--violet)';
      block.innerHTML = '<div style="font-size:.72rem;letter-spacing:.06em;font-weight:700;color:var(--violet);margin-bottom:8px">🎯 CHOOSE YOUR FACULTY</div>' +
        '<div style="display:grid;grid-template-columns:1fr;gap:4px">' +
        facs.map(function (f, i) {
          return '<button class="btn' + (i === 0 ? ' sel' : '') + '" data-p68-uni="' + key + '" data-p68-fac="' + f + '" ' +
            'style="margin:0;text-align:left;padding:8px;font-size:.82rem" ' +
            'onclick="p68SelectFaculty(\'' + key + '\', \'' + f + '\'); p68EnrollFaculty(\'' + key + '\', \'' + f + '\', \'self\')">' + f + '</button>';
        }).join('') +
        '</div>';
      sec.appendChild(block);
    });
  }

  function dedupeFamilyBusiness() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'career') return;
    const view = document.getElementById('view');
    if (!view) return;
    const cards = [];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const t = sec.textContent || '';
      if (t.indexOf('Family ownership') !== -1 && t.indexOf('Annual revenue') !== -1) cards.push(sec);
    });
    for (let i = 1; i < cards.length; i++) cards[i].remove();
  }

  /* =================================================================
     PART 9 — VIEW WRAPPERS
     (viewCareer, viewFamily, viewAssets, viewBank wrappers removed
      during the merge pass — 76-family-dynasty.js now does this work)
     ================================================================= */

  /* ---- viewSchool ---- */
  const _viewSchool = viewSchool;
  viewSchool = function () {
    let html = '';
    try { html = _viewSchool.apply(this, arguments); } catch (e) { console.error('[p68] viewSchool chain failed:', e); html = ''; }
    if (!S) return html;

    /* School-age: school picker at top */
    if (S.age >= 6 && S.age < 18 && !S.uni && !S.degree && !S.localMast) {
      html = html.replace(/<section class="card"[^>]*id="p68-school-picker"[\s\S]*?<\/section>/g, '');
      let picker = '';
      if (typeof SCHOOLS !== 'undefined') {
        const rows = Object.keys(SCHOOLS).map(function (k) {
          const s = SCHOOLS[k];
          const why = (typeof schoolBlock === 'function') ? schoolBlock(k) : '';
          const sel = S.school === k;
          const cost = s.cost ? ((typeof money === 'function' ? money(s.cost) : s.cost) + '/yr') : 'Free';
          return '<button class="btn' + (sel ? ' sel' : '') + '" ' + (why ? 'disabled' : '') + ' onclick="p68PickSchool(\'' + k + '\')">' +
            s.name + ' · ' + cost + '<small>' + (why || s.desc) + '</small></button>';
        }).join('');
        const fam = (typeof FAMILY !== 'undefined' && FAMILY[S.famWealth]) || 'Modest';
        picker += '<section class="card" style="border-color:var(--cyan)" id="p68-school-picker">' +
          '<h3>📚 Pick a school</h3>' +
          '<p class="muted">Family status: <b>' + fam + '</b>.</p>' + rows +
          (S.school && SCHOOLS[S.school] ? '<p class="muted" style="font-size:.82rem;margin-top:8px;color:var(--mint)">✓ Currently enrolled: <b>' + SCHOOLS[S.school].name + '</b></p>' : '') +
          '</section>';
      }
      if (typeof EFFORT !== 'undefined') {
        const eRows = Object.keys(EFFORT).map(function (k) {
          return '<button class="btn' + (S.effort === k ? ' sel' : '') + '" onclick="p68PickEffort(\'' + k + '\')">' + EFFORT[k].label + '</button>';
        }).join('');
        picker += '<section class="card"><h3>Effort this year</h3><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">' + eRows + '</div></section>';
      }
      if (S.age >= 15 && S.age <= 17 && (S.country === 'egy' || !S.country)) {
        const tr = (S.p68 && S.p68.thanaweyaTrack) || null;
        if (!tr) {
          picker += '<section class="card" style="border-color:var(--amber)"><h3>📝 Choose Thanaweya Amma track</h3>' +
            '<button class="btn" onclick="p68ChooseTrack(\'adabi\')">📖 Adabi (Literary)</button>' +
            '<button class="btn" onclick="p68ChooseTrack(\'elmi-riyada\')">🔬 Elmi Riyada (Science-Math)</button>' +
            '<button class="btn" onclick="p68ChooseTrack(\'elmi-olom\')">🧬 Elmi Olom (Science-Biology)</button></section>';
        }
      }
      html = picker + html;
    }

    /* Graduate / enrolled: hide Egyptian school content */
    if (S.degree || S.uni || S.localMast) {
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Your Thanaweya Amma position<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Choose Thanaweya Amma track<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📚 Private lessons[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🚌 School trips[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🏆 School olympiads[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🔧 Vocational \/ technical school[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🎯 Target destination<\/h3>[\s\S]*?<\/section>/g, '');
    }

    return html;
  };

  /* ---- viewLife: strip cards that belong elsewhere ---- */
  const _viewLife = viewLife;
  viewLife = function () {
    let html = '';
    try { html = _viewLife.apply(this, arguments); } catch (e) { console.error('[p68] viewLife chain failed:', e); html = ''; }
    if (!html) return html;
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family ownership[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👨‍👩‍👧‍👦 Extended family<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👥 Household staff<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏦 Family Trust Fund<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💍 Marriage expectations<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>⭐ Social Standing<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g, '');
    return html;
  };

  /* =================================================================
     PART 10 — YEARLY LIFE EVENTS
     ================================================================= */
  function fireYearlyEvent() {
    if (!S) return;
    if (S.pacing === 'monthly') return;
    if (document.getElementById('p57-event-modal')) return;
    if (document.getElementById('p68-event-pending')) return;
    if (S.pending) { setTimeout(fireYearlyEvent, 1500); return; }
    if (S.p57 && S.p57.lastEventYear === gameYear()) return;
    if (typeof p57PickEvent !== 'function' || typeof p57ShowEventModal !== 'function') return;
    const marker = document.createElement('div');
    marker.id = 'p68-event-pending';
    marker.style.display = 'none';
    document.body.appendChild(marker);
    setTimeout(function () {
      if (!S) { marker.remove(); return; }
      if (document.getElementById('p57-event-modal')) { marker.remove(); return; }
      const ev = p57PickEvent();
      if (ev) {
        try {
          p57ShowEventModal(ev);
          if (!S.p57) S.p57 = {};
          S.p57.lastEventYear = gameYear();
          S.p57.eventsThisYear = (S.p57.eventsThisYear || 0) + 1;
        } catch (e) { console.error('[p68] life event failed:', e); }
      }
      marker.remove();
    }, 900);
  }
  const _ageUp2 = ageUp;
  ageUp = function () {
    const a0 = S && S.age;
    const r = _ageUp2.apply(this, arguments);
    if (S && S.age !== a0 && S.pacing !== 'monthly') setTimeout(fireYearlyEvent, 600);
    return r;
  };

  /* =================================================================
     PART 11 — RENDER WRAPPER: run all decorators
     ================================================================= */
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    try {
      dedupeStatus();
      fixChooseUniButton();
      decorateUniCards();
      dedupeFamilyBusiness();
    } catch (e) { console.error('[p68] decorator failed:', e); }
    setTimeout(function () {
      try { dedupeStatus(); dedupeFamilyBusiness(); } catch (e) {}
    }, 30);
    return r;
  };

  /* =================================================================
     PART 12 — CAR OFFER MODAL (bulletproof)
     ================================================================= */
  function closeCarModal() {
    const m = document.getElementById('p62-offer-modal');
    if (m) m.remove();
  }

  window.p62AcceptParentCar = function () {
    try {
      if (!S || !S.p62 || !Array.isArray(S.p62.pendingOffers) || !S.p62.pendingOffers.length) return closeCarModal();
      S.p62.pendingOffers.shift();
      const tier = (S.p76 && S.p76.wealthLevel) || S.famWealth || 0;
      const year = (typeof gameYear === 'function') ? gameYear() : 2019;
      if (typeof P62_MODELS === 'undefined' || typeof P62_BRANDS === 'undefined') return closeCarModal();
      const ok = function (m) { const f = Number(m[8])||0, t = Number(m[9])||9999; return year >= f && year <= t; };
      let pool = [];
      if (tier >= 5) pool = P62_MODELS.filter(function (m) { const b = P62_BRANDS[m[0]]||{}; return ok(m) && b.tier>=3 && ['lux','exec','sport','suv'].indexOf(m[2])>=0; });
      else if (tier === 4) pool = P62_MODELS.filter(function (m) { const b = P62_BRANDS[m[0]]||{}; return ok(m) && (b.tier===3 || ['suv','lux'].indexOf(m[2])>=0) && ['econ','compact'].indexOf(m[2])===-1; });
      else if (tier === 3) pool = P62_MODELS.filter(function (m) { return ok(m) && ['compact','mid','suv'].indexOf(m[2])>=0; });
      else pool = P62_MODELS.filter(function (m) { return ok(m) && ['econ','compact'].indexOf(m[2])>=0; });
      if (!pool.length) pool = P62_MODELS.filter(ok);
      if (!pool.length) return closeCarModal();
      const model = pool[Math.floor(Math.random()*pool.length)];
      const brand = P62_BRANDS[model[0]] || { name: model[0] };
      const base = (typeof p62BasePriceUSD === 'function') ? p62BasePriceUSD(model, year) : (Number(model[3])||20000);
      const carAge = tier >= 4 ? 0 : tier === 3 ? 1 : 3 + Math.floor(Math.random()*4);
      const dep = (typeof p62Depreciation === 'function') ? p62Depreciation(carAge) : 0.7;
      S.cars = S.cars || [];
      S.cars.push({
        uid: 'cg'+Math.random().toString(36).slice(2,8),
        make: brand.name, name: model[1], cls: model[2],
        year: year - carAge, trim:0, color:0, interior:0, opts:[],
        msrp: base, paid:0, insurance:'compreh',
        insuranceExpiry: year+1, registrationExpiry: year+1,
        miles: carAge*12000, cond: tier>=4?98:tier===3?80:65, age: carAge,
        acc:false, broken:false, fix:0, mods:[], modCost:0,
        seller:'parents', brand: model[0],
        fuel: model[11] ? 'e' : (model[10] && year >= model[10] ? 'h' : 'g'),
        life: model[7], value: Math.round(base*dep), int:0, intc:0, hasLoan:false
      });
      S.cars = S.cars.slice(-4);
      if (typeof parents === 'function') parents().forEach(function (p) { if (p && p.alive !== false) p.bond = Math.min(100, (p.bond||50)+8); });
      if (typeof fx === 'function') fx({ happiness: 6, social: tier>=4?5:3 });
      if (typeof log === 'function') log('🎁 Your parents gave you a ' + (year-carAge) + ' ' + brand.name + ' ' + model[1] + (carAge===0?' — brand new':' (used)'));
    } catch (e) { console.error('[p68] accept car failed:', e); }
    finally { closeCarModal(); if (typeof save === 'function') save(); if (typeof render === 'function') render(); }
  };

  window.p62DeclineParentCar = function () {
    try {
      if (S && S.p62 && Array.isArray(S.p62.pendingOffers) && S.p62.pendingOffers.length) S.p62.pendingOffers.shift();
      if (typeof parents === 'function') parents().forEach(function (p) { if (p && p.alive !== false) p.bond = Math.max(0,(p.bond||50)-3); });
      if (typeof log === 'function') log('You politely declined the car offer.');
    } catch (e) {}
    finally { closeCarModal(); if (typeof save === 'function') save(); if (typeof render === 'function') render(); }
  };

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const m = document.getElementById('p62-offer-modal');
    if (m) { if (S && S.p62 && Array.isArray(S.p62.pendingOffers)) S.p62.pendingOffers = []; m.remove(); if (typeof render === 'function') render(); }
  });

  /* =================================================================
     PART 13 — DIAGNOSTICS
     ================================================================= */
  window.p68Diag = function () {
    console.log('=== p68 core fixes diag ===');
    console.log({
      age: S && S.age,
      school: S && S.school,
      effort: S && S.effort,
      country: S && S.country,
      home: S && S.home,
      degree: S && S.degree,
      uni: !!(S && S.uni),
      localMast: S && S.localMast,
      track: S && S.p68 && S.p68.thanaweyaTrack,
      familyBusiness: S && S.p76 && S.p76.familyBusiness,
      worksForFamily: S && S.p77 && S.p77.worksForFamily
    });
    console.log('viewSchool len:', viewSchool().length);
    console.log('viewCareer len:', viewCareer().length);
    console.log('viewLife len:', viewLife().length);
  };

  console.log('[p68] Core fixes (Phase 3.1) loaded');
})();
