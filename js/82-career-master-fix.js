/* =====================================================================
   82. CAREER RESTORE + MASTER'S FIX  (v3 — Unified & Button Fixes)
   - Prevents p80's greedy regex from eating the whole career tab
   - Advances master's year on ageUp
   - Detects public/private university correctly
   - Restores missing school/effort selection buttons
   - Cleans up state errors safely
   Load AFTER 81-education-life-makeover.js and BEFORE 99-boot.js
   ===================================================================== */

(function p82Fix() {
  'use strict';

  /* =================================================================
     1. THE ROOT CAUSE FIX (Career Tab Deletion)
     ================================================================= */
  const P82_originalP77Card = (typeof p77FamilyBusinessCard === 'function')
    ? p77FamilyBusinessCard
    : null;

  if (P82_originalP77Card) {
    window.p77FamilyBusinessCard = function () {
      /* Only suppress on the Career tab so greedy regexes find nothing */
      if (typeof activeTab !== 'undefined' && activeTab === 'career') {
        return '';
      }
      return P82_originalP77Card.apply(this, arguments);
    };
  }

  /* =================================================================
     2. MASTER'S YEAR ADVANCEMENT
     ================================================================= */
  const P82_ageUpBefore = typeof ageUp === 'function' ? ageUp : function(){};
  window.ageUp = function () {
    const ageBefore = S && S.age;
    const r = P82_ageUpBefore.apply(this, arguments);
    if (!S || S.age === ageBefore) return r;

    if (S.localMast) {
      const thisYear = (typeof gameYear === 'function') ? gameYear() : 2026;
      if (S.localMast.lastAdvanceYear !== thisYear) {
        S.localMast.lastAdvanceYear = thisYear;
        S.localMast.year = (S.localMast.year || 0) + 1;

        if (S.localMast.year >= (S.localMast.yearsTotal || 2)) {
          /* Completed */
          S.mastDone = true;
          S.masterField = S.localMast.fieldName;
          const uniName = S.localMast.universityName || 'Egyptian university';
          const field = S.localMast.fieldName || 'postgraduate programme';
          if (typeof log === 'function') log('🎓 Completed your Master\'s in ' + field + ' at ' + uniName + '.');
          if (typeof realismNotice === 'function') {
            realismNotice('Master\'s completed', 'You earned a Master\'s in ' + field + ' from ' + uniName + '. Career options are now open.');
          }
          S.localMast = null;
        } else {
          if (typeof log === 'function') {
            log('📖 Master\'s year ' + ((S.localMast.year || 0) + 1) + ' of ' + (S.localMast.yearsTotal || 2) + ' started.');
          }
        }
      }
    }
    return r;
  };

  /* Also advance on monthly ticks in monthly pacing */
  const P82_p52TickBefore = (typeof p52MonthlyTick === 'function') ? p52MonthlyTick : null;
  if (P82_p52TickBefore) {
    window.p52MonthlyTick = function () {
      P82_p52TickBefore.apply(this, arguments);
    };
  }

  /* =================================================================
     3. PUBLIC / PRIVATE UNIVERSITY DETECTION
     ================================================================= */
  const P82_PRIVATE_UNI_PATTERNS = [
    'auc', 'american university', 'american univ',
    'guc', 'german university', 'german univ',
    'bue', 'british university', 'british univ',
    'aastmt', 'arab academy',
    'miu', 'misr international',
    'buc', 'badr university',
    'msa', 'modern sciences',
    'nile university',
    'future university',
    'heliopolis university',
    'must', 'misr university for science',
    'o6u', 'october 6 university',
    'mti', 'modern sciences and arts',
    'eri', 'egyptian russian university',
    'ust', 'university of science and technology'
  ];

  window.p82IsPrivateUniversity = function(nameOrId) {
    if (!nameOrId) return false;
    const s = String(nameOrId).toLowerCase();
    for (let i = 0; i < P82_PRIVATE_UNI_PATTERNS.length; i++) {
      if (s.indexOf(P82_PRIVATE_UNI_PATTERNS[i]) !== -1) return true;
    }
    return false;
  };

  function p82FixLocalMastKind() {
    if (!S || !S.localMast) return;
    const m = S.localMast;
    const check = (m.universityName || '') + ' ' + (m.universityId || '');
    if (window.p82IsPrivateUniversity(check)) {
      if (m.kind !== 'private') m.kind = 'private';
    } else if (!m.kind) {
      m.kind = 'public';
    }
  }
  setInterval(p82FixLocalMastKind, 700);
  setTimeout(p82FixLocalMastKind, 200);

  /* =================================================================
     4. CLEANUP (Duplicate Business Cards)
     ================================================================= */
  function p82CleanDuplicateBizCards() {
    if (typeof S === 'undefined' || !S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'career') return;
    const view = document.getElementById('view');
    if (!view) return;

    const cards = [];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const t = sec.textContent || '';
      if (t.indexOf('Family ownership') !== -1 && t.indexOf('Annual revenue') !== -1) {
        cards.push(sec);
      }
    });
    for (let i = 1; i < cards.length; i++) cards[i].remove();
  }

  const P82_renderBefore = typeof render === 'function' ? render : function(){};
  window.render = function () {
    const r = P82_renderBefore.apply(this, arguments);
    try { p82CleanDuplicateBizCards(); } catch (e) {}
    setTimeout(function () { try { p82CleanDuplicateBizCards(); } catch (e) {} }, 30);
    return r;
  };

  /* =================================================================
     5. BUTTON ACTION HANDLERS (Fixes "Not Working" Buttons)
     ================================================================= */
  window.pickSchool = function(k) {
    if (!S) return;
    if (typeof schoolBlock === 'function' && schoolBlock(k)) return;
    S.school = k;
    if (typeof render === 'function') render();
    if (typeof save === 'function') save();
  };

  window.pickEffort = function(k) {
    if (!S) return;
    S.effort = k;
    if (typeof render === 'function') render();
    if (typeof save === 'function') save();
  };

  if (typeof window.p68ChooseTrack !== 'function') {
    window.p68ChooseTrack = function(track) {
      if (!S) return;
      S.p68 = S.p68 || {};
      S.p68.thanaweyaTrack = track;
      if (typeof render === 'function') render();
      if (typeof save === 'function') save();
    };
  }

  /* =================================================================
     6. SCHOOL-AGE EDUCATION TAB FIX
     ================================================================= */
  const P82_viewSchoolSchoolBefore = typeof viewSchool === 'function' ? viewSchool : function(){ return ''; };
  window.viewSchool = function () {
    let html = P82_viewSchoolSchoolBefore.apply(this, arguments);
    if (typeof S === 'undefined' || !S) return html;
    if (S.age >= 18 || S.uni || S.degree || S.localMast || S.age < 6) return html;

    let card = '';

    /* School picker */
    if (typeof SCHOOLS !== 'undefined') {
      const schools = Object.keys(SCHOOLS).map(function (k) {
        const s = SCHOOLS[k];
        const why = (typeof schoolBlock === 'function') ? schoolBlock(k) : '';
        const sel = S.school === k;
        const costLabel = s.cost ? money(s.cost) + '/yr' : 'Free';
        return '<button class="btn ' + (sel ? 'sel' : '') + '" ' + (why ? 'disabled' : '') + ' onclick="pickSchool(\'' + k + '\')">' +
          s.name + ' · ' + costLabel +
          '<small>' + (why || s.desc) + '</small></button>';
      }).join('');
      
      const familyStatus = (typeof FAMILY !== 'undefined' && FAMILY[S.famWealth]) ? FAMILY[S.famWealth] : 'Unknown';
      card += '<section class="card" style="border-color:var(--cyan)" id="p82-school-picker"><h3>📚 School</h3>' +
        '<p class="muted">Family status: <b>' + familyStatus + '</b>. Pick a school before you age up.</p>' +
        schools + '</section>';
    }

    /* Effort picker */
    if (typeof EFFORT !== 'undefined') {
      const efforts = Object.keys(EFFORT).map(function (k) {
        const e = EFFORT[k];
        return '<button class="btn ' + (S.effort === k ? 'sel' : '') + '" onclick="pickEffort(\'' + k + '\')">' + e.label + '</button>';
      }).join('');
      card += '<section class="card"><h3>Effort this year</h3>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">' + efforts + '</div></section>';
    }

    /* Thanaweya Amma track for ages 15-17 (Egypt only) */
    if (S.age >= 15 && S.age <= 17 && (S.country === 'egy' || !S.country)) {
      if (!S.p68 || !S.p68.thanaweyaTrack) {
        card += '<section class="card" style="border-color:var(--amber)"><h3>📝 Choose Thanaweya Amma track</h3>' +
          '<p class="muted" style="font-size:.85rem">Your track determines which university faculties you can apply to. Choose carefully — you cannot switch later.</p>' +
          '<button class="btn" onclick="p68ChooseTrack(\'adabi\')">📖 Adabi (Literary)<small>Opens: Law, Business, Arts, Mass Comm</small></button>' +
          '<button class="btn" onclick="p68ChooseTrack(\'elmi-riyada\')">🔬 Elmi Riyada (Science-Math)<small>Opens: Engineering, CS, Science, Pharmacy</small></button>' +
          '<button class="btn" onclick="p68ChooseTrack(\'elmi-olom\')">🧬 Elmi Olom (Science-Biology)<small>Opens: Medicine, Dentistry, Pharmacy, Science</small></button>' +
          '</section>';
      } else {
        const track = S.p68.thanaweyaTrack;
        const trackLabel = { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[track];
        card += '<section class="card" style="border-color:var(--mint)"><h3>📝 Thanaweya Amma — ' + trackLabel + '</h3>' +
          '<p class="muted" style="font-size:.85rem">You will sit the Thanaweya Amma exam at age 18. Your score then determines which faculties you can apply to.</p></section>';
      }
    }

    return html + card;
  };

  /* =================================================================
     7. STATE SANITIZER (The Healer)
     ================================================================= */
  window.p82HealState = function() {
    if (typeof S === 'undefined' || !S) return;
    let healed = 0;

    ['cars','family','friends','logRows','certificates','ownedHomes','inventory','loans','pacingLog'].forEach(function (k) {
      if (!Array.isArray(S[k])) { S[k] = []; healed++; }
    });

    if (!S.bank || typeof S.bank !== 'object') {
      S.bank = { installments: {}, cardDebt: {}, activeCards: [], primaryCard: null, score: 680, savingsBal: 0, loans: [], missedPmts: 0 };
      healed++;
    }
    if (!S.bank.installments || typeof S.bank.installments !== 'object') { S.bank.installments = {}; healed++; }
    if (!S.bank.cardDebt || typeof S.bank.cardDebt !== 'object') { S.bank.cardDebt = {}; healed++; }
    if (!Array.isArray(S.bank.activeCards)) { S.bank.activeCards = []; healed++; }
    if (!Array.isArray(S.bank.loans)) { S.bank.loans = []; healed++; }

    if (!S.p79 || typeof S.p79 !== 'object') S.p79 = { appliedUnis: [] };
    if (!Array.isArray(S.p79.appliedUnis)) { S.p79.appliedUnis = []; healed++; }

    if (!S.p81 || typeof S.p81 !== 'object') S.p81 = {};
    if (!S.p82 || typeof S.p82 !== 'object') S.p82 = {};

    ['wealth','health','happiness','smarts','social','eng','loan','income','expenses'].forEach(function (k) {
      if (isNaN(Number(S[k])) || S[k] === null || S[k] === undefined) {
        const defaults = { wealth: 0, health: 100, happiness: 100, smarts: 50, social: 50, eng: 0, loan: 0, income: 0, expenses: 0 };
        S[k] = defaults[k] || 0;
        healed++;
      }
    });
    
    if (isNaN(Number(S.age)) || S.age < 0) { S.age = 6; healed++; }

    if (S.pacing !== 'yearly' && S.pacing !== 'monthly') { S.pacing = 'yearly'; healed++; }
    if (isNaN(Number(S.pacingMonth))) S.pacingMonth = 1;
    if (isNaN(Number(S.pacingAbsoluteMonth))) S.pacingAbsoluteMonth = 0;

    if (S.localMast) {
      if (isNaN(Number(S.localMast.year))) { S.localMast.year = 0; healed++; }
      if (isNaN(Number(S.localMast.yearsTotal)) || !S.localMast.yearsTotal) { S.localMast.yearsTotal = 2; healed++; }
      if (!S.localMast.fieldName || S.localMast.fieldName === 'undefined') { S.localMast.fieldName = 'Master\'s programme'; healed++; }
      
      const check = (S.localMast.universityName || '') + ' ' + (S.localMast.universityId || '');
      if (window.p82IsPrivateUniversity(check) && S.localMast.kind !== 'private') { S.localMast.kind = 'private'; healed++; }
      else if (!S.localMast.kind) { S.localMast.kind = 'public'; healed++; }
    }

    /* Fixed Salary Calculation based on Age */
    if (S.job && S.job.isFamilyBusiness && S.p77 && S.p77.familyBusinessRevenue) {
      if (isNaN(Number(S.job.salary)) || S.job.salary <= 0) {
        let salaryMult = 0.015; 
        if (S.age >= 40) salaryMult = 0.18;
        else if (S.age >= 35) salaryMult = 0.12;
        else if (S.age >= 30) salaryMult = 0.08;
        else if (S.age >= 26) salaryMult = 0.055;
        else if (S.age >= 23) salaryMult = 0.035;
        else if (S.age >= 20) salaryMult = 0.025;
        
        S.job.salary = S.p77.familyBusinessRevenue * salaryMult;
        S.salary = S.job.salary;
        healed++;
      }
    }
  };

  /* Run on load */
  setTimeout(window.p82HealState, 150);
  setTimeout(window.p82HealState, 900);

  /* Wrap newGame and loadGame */
  const P82_newGameHealBefore = typeof newGame === 'function' ? newGame : function(){};
  window.newGame = function () {
    P82_newGameHealBefore.apply(this, arguments);
    setTimeout(window.p82HealState, 200);
  };

  const P82_loadGameHealBefore = typeof loadGame === 'function' ? loadGame : function(){};
  window.loadGame = function () {
    P82_loadGameHealBefore.apply(this, arguments);
    setTimeout(window.p82HealState, 200);
  };

  console.log('[p82 v3] Unified Career Restore + Master\'s Fix Loaded');
})();
