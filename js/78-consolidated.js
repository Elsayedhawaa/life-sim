/* =====================================================================
   78. CONSOLIDATED — replaces 78-reality-fix, 79-consistency-fix,
       80-local-fixes, 81-education-life-makeover, 82-career-master-fix
   All fixes in one file. No wrappers on top of wrappers.
   Load AFTER 77-dynasty-class-system.js and BEFORE 99-boot.js
   ===================================================================== */

(function p78Consolidated() {
  'use strict';

  /* =================================================================
     PART 1 — STATE SANITIZER (runs on load)
     ================================================================= */
  function healState() {
    if (typeof S === 'undefined' || !S) return;
    let healed = 0;

    /* Arrays */
    ['cars','family','friends','logRows','certificates','ownedHomes',
     'inventory','loans','pacingLog','applications','visaApplications'
    ].forEach(function (k) {
      if (!Array.isArray(S[k])) { S[k] = []; healed++; }
    });

    /* Nested objects */
    if (!S.bank || typeof S.bank !== 'object') {
      S.bank = { installments: {}, cardDebt: {}, activeCards: [], primaryCard: null,
                 score: 680, savingsBal: 0, loans: [], missedPmts: 0 };
      healed++;
    }
    ['installments', 'cardDebt'].forEach(function (k) {
      if (!S.bank[k] || typeof S.bank[k] !== 'object') { S.bank[k] = {}; healed++; }
    });
    ['activeCards', 'loans'].forEach(function (k) {
      if (!Array.isArray(S.bank[k])) { S.bank[k] = []; healed++; }
    });
    if (!S.p79 || typeof S.p79 !== 'object') S.p79 = { appliedUnis: [] };
    if (!Array.isArray(S.p79.appliedUnis)) { S.p79.appliedUnis = []; healed++; }

    /* Numeric fields */
    const defaults = { wealth: 0, health: 100, happiness: 100, smarts: 50,
                       social: 50, eng: 0, loan: 0, income: 0, expenses: 0 };
    Object.keys(defaults).forEach(function (k) {
      if (isNaN(Number(S[k])) || S[k] === null || S[k] === undefined) {
        S[k] = defaults[k]; healed++;
      }
    });
    if (isNaN(Number(S.age)) || S.age < 0) { S.age = 6; healed++; }

    /* Pacing */
    if (S.pacing !== 'yearly' && S.pacing !== 'monthly') { S.pacing = 'yearly'; healed++; }
    if (isNaN(Number(S.pacingMonth))) S.pacingMonth = 1;
    if (isNaN(Number(S.pacingAbsoluteMonth))) S.pacingAbsoluteMonth = 0;

    /* Local master's */
    if (S.localMast) {
      if (isNaN(Number(S.localMast.year))) { S.localMast.year = 0; healed++; }
      if (isNaN(Number(S.localMast.yearsTotal)) || !S.localMast.yearsTotal) {
        S.localMast.yearsTotal = 2; healed++;
      }
      if (!S.localMast.fieldName || S.localMast.fieldName === 'undefined') {
        S.localMast.fieldName = "Master's programme"; healed++;
      }
      const check = ((S.localMast.universityName || '') + ' ' + (S.localMast.universityId || '')).toLowerCase();
      const isPrivate = /auc|american university|guc|german university|bue|british university|aastmt|arab academy|miu|misr international|buc|badr university|msa|modern sciences|nile university|future university|heliopolis|must|o6u|mti|eri|ust/.test(check);
      if (isPrivate) S.localMast.kind = 'private';
      else if (!S.localMast.kind) S.localMast.kind = 'public';
    }

    if (healed > 0) console.log('[p78] Healed ' + healed + ' field(s).');
  }
  window.p78Heal = healState;

  /* Run heal on load and after new game / load */
  setTimeout(healState, 150);
  setTimeout(healState, 900);

  const _newGame = newGame;
  newGame = function () {
    _newGame.apply(this, arguments);
    setTimeout(healState, 200);
  };
  const _loadGame = loadGame;
  loadGame = function () {
    _loadGame.apply(this, arguments);
    setTimeout(healState, 200);
  };

  /* =================================================================
     PART 2 — CAREER TAB: prevent p80-style greedy regex damage
     ================================================================= */
  /* Note: 80-local-fixes is being deleted. But if a similar pattern exists
     anywhere else, suppressing p77's card on the career tab is safe. */
  const _origP77Card = (typeof p77FamilyBusinessCard === 'function')
    ? p77FamilyBusinessCard
    : null;
  if (_origP77Card) {
    p77FamilyBusinessCard = function () {
      if (typeof activeTab !== 'undefined' && activeTab === 'career') return '';
      return _origP77Card.apply(this, arguments);
    };
  }

  /* =================================================================
     PART 3 — MASTER'S YEAR ADVANCEMENT + PUBLIC/PRIVATE DETECTION
     ================================================================= */
  const _ageUp = ageUp;
  ageUp = function () {
    const ageBefore = S && S.age;
    const r = _ageUp.apply(this, arguments);
    if (!S || S.age === ageBefore) return r;

    if (S.localMast) {
      const thisYear = (typeof gameYear === 'function') ? gameYear() : 2026;
      if (S.localMast.lastAdvanceYear !== thisYear) {
        S.localMast.lastAdvanceYear = thisYear;
        S.localMast.year = (S.localMast.year || 0) + 1;

        if (S.localMast.year >= (S.localMast.yearsTotal || 2)) {
          S.mastDone = true;
          S.masterField = S.localMast.fieldName;
          const uniName = S.localMast.universityName || 'Egyptian university';
          const field = S.localMast.fieldName || 'postgraduate programme';
          if (typeof log === 'function') log('🎓 Completed your Master\'s in ' + field + ' at ' + uniName + '.');
          if (typeof realismNotice === 'function') {
            realismNotice('Master\'s completed', 'You earned a Master\'s in ' + field + ' from ' + uniName + '.');
          }
          S.localMast = null;
        } else if (typeof log === 'function') {
          log('📖 Master\'s year ' + ((S.localMast.year || 0) + 1) + ' of ' + (S.localMast.yearsTotal || 2) + ' started.');
        }
      }
    }
    return r;
  };

  /* =================================================================
     PART 4 — BULLETPROOF SCHOOL PICKER (at TOP of Education for ages 6-17)
     ================================================================= */
  window.p78PickSchool = function (k) {
    if (!S) return;
    if (typeof SCHOOLS === 'undefined' || !SCHOOLS[k]) return;
    if (typeof schoolBlock === 'function' && schoolBlock(k)) return;
    S.school = k;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p78PickEffort = function (k) {
    if (!S) return;
    S.effort = k;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p78ChooseTrack = function (track) {
    if (!S) return;
    if (S.age < 15 || S.age > 18) return;
    S.p68 = S.p68 || {};
    S.p68.thanaweyaTrack = track;
    const label = { 'adabi': 'Adabi (Literary)',
                    'elmi-riyada': 'Elmi Riyada (Science-Math)',
                    'elmi-olom': 'Elmi Olom (Science-Biology)' }[track];
    if (typeof log === 'function') log('📝 You chose the Thanaweya Amma track: ' + label + '.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     PART 5 — EDUCATION TAB WRAPPER (adds school picker at top + hides Egypt content when appropriate)
     ================================================================= */
  const _viewSchool = viewSchool;
  viewSchool = function () {
    let html = '';
    try { html = _viewSchool.apply(this, arguments); } catch (e) { console.error('[p78] viewSchool failed:', e); html = ''; }
    if (typeof S === 'undefined' || !S) return html;

    /* --- 5a. School-age: insert picker at TOP --- */
    if (S.age >= 6 && S.age < 18 && !S.uni && !S.degree && !S.localMast) {
      /* Remove any previous p78 picker */
      html = html.replace(/<section class="card"[^>]*id="p78-school-picker"[\s\S]*?<\/section>/g, '');

      let picker = '';

      /* School options */
      if (typeof SCHOOLS !== 'undefined') {
        const rows = Object.keys(SCHOOLS).map(function (k) {
          const s = SCHOOLS[k];
          const why = (typeof schoolBlock === 'function') ? schoolBlock(k) : '';
          const sel = S.school === k;
          const costLabel = s.cost ? ((typeof money === 'function' ? money(s.cost) : s.cost) + '/yr') : 'Free';
          return '<button class="btn' + (sel ? ' sel' : '') + '" ' +
            (why ? 'disabled' : '') +
            ' onclick="p78PickSchool(\'' + k + '\')">' +
            s.name + ' · ' + costLabel +
            '<small>' + (why || s.desc) + '</small></button>';
        }).join('');
        const famLabel = (typeof FAMILY !== 'undefined' && FAMILY[S.famWealth]) || 'Modest';
        picker += '<section class="card" style="border-color:var(--cyan)" id="p78-school-picker">' +
          '<h3>📚 Pick a school</h3>' +
          '<p class="muted">Family status: <b>' + famLabel + '</b>. Pick a school before you age up.</p>' +
          rows +
          (S.school && SCHOOLS[S.school]
            ? '<p class="muted" style="font-size:.82rem;margin-top:8px;color:var(--mint)">✓ Currently enrolled: <b>' + SCHOOLS[S.school].name + '</b></p>'
            : '') +
          '</section>';
      }

      /* Effort picker */
      if (typeof EFFORT !== 'undefined') {
        const eRows = Object.keys(EFFORT).map(function (k) {
          const e = EFFORT[k];
          return '<button class="btn' + (S.effort === k ? ' sel' : '') + '" onclick="p78PickEffort(\'' + k + '\')">' + e.label + '</button>';
        }).join('');
        picker += '<section class="card"><h3>Effort this year</h3>' +
          '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">' + eRows + '</div></section>';
      }

      /* Thanaweya Amma track (ages 15-17, Egypt) */
      if (S.age >= 15 && S.age <= 17 && (S.country === 'egy' || !S.country)) {
        const track = (S.p68 && S.p68.thanaweyaTrack) || null;
        if (!track) {
          picker += '<section class="card" style="border-color:var(--amber)"><h3>📝 Choose Thanaweya Amma track</h3>' +
            '<p class="muted" style="font-size:.85rem">Your track determines which university faculties you can apply to.</p>' +
            '<button class="btn" onclick="p78ChooseTrack(\'adabi\')">📖 Adabi (Literary)<small>Law, Business, Arts, Mass Comm</small></button>' +
            '<button class="btn" onclick="p78ChooseTrack(\'elmi-riyada\')">🔬 Elmi Riyada (Science-Math)<small>Engineering, CS, Science, Pharmacy</small></button>' +
            '<button class="btn" onclick="p78ChooseTrack(\'elmi-olom\')">🧬 Elmi Olom (Science-Biology)<small>Medicine, Dentistry, Pharmacy, Science</small></button>' +
            '</section>';
        } else {
          const label = { 'adabi': 'Adabi (Literary)',
                          'elmi-riyada': 'Elmi Riyada (Science-Math)',
                          'elmi-olom': 'Elmi Olom (Science-Biology)' }[track];
          picker += '<section class="card" style="border-color:var(--mint)"><h3>📝 Track: ' + label + '</h3>' +
            '<p class="muted" style="font-size:.85rem">You will sit the Thanaweya Amma exam at age 18.</p></section>';
        }
      }

      html = picker + html;
    }

    /* --- 5b. If graduate or enrolled, strip Egypt school content --- */
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

    /* --- 5c. Remove dead cards --- */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🌍 Master's abroad — year 1 costs<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🌍 Study abroad — realistic costs<\/h3>[\s\S]*?<\/section>/g, '');

    return html;
  };

  /* =================================================================
     PART 6 — LIFE TAB: remove cards that belong elsewhere
     ================================================================= */
  const _viewLife = viewLife;
  viewLife = function () {
    let html = '';
    try { html = _viewLife.apply(this, arguments); } catch (e) { console.error('[p78] viewLife failed:', e); html = ''; }
    if (!html) return html;

    /* Remove family business card from Life */
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family ownership[\s\S]*?<\/section>/g, '');
    /* Remove extended family from Life */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👨‍👩‍👧‍👦 Extended family<\/h3>[\s\S]*?<\/section>/g, '');
    /* Remove household staff from Life */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👥 Household staff<\/h3>[\s\S]*?<\/section>/g, '');
    /* Remove trust fund from Life */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏦 Family Trust Fund<\/h3>[\s\S]*?<\/section>/g, '');
    /* Remove marriage expectations from Life */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💍 Marriage expectations<\/h3>[\s\S]*?<\/section>/g, '');
    /* Remove prestige from Life */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>⭐ Social Standing<\/h3>[\s\S]*?<\/section>/g, '');
    /* Remove passport from Life */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g, '');

    return html;
  };

  /* =================================================================
     PART 7 — CAREER TAB: add family business card if it exists
     ================================================================= */
  const _viewCareer = viewCareer;
  viewCareer = function () {
    let html = '';
    try { html = _viewCareer.apply(this, arguments); } catch (e) { console.error('[p78] viewCareer failed:', e); html = ''; }
    if (!html || !S) return html;

    /* Only add family business card if player is home, adult, and has one */
    if (S.country !== S.home) return html;
    if (S.age < 18) return html;
    if (!S.p76 || !S.p76.familyBusiness) return html;

    /* Remove any duplicate */
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family ownership[\s\S]*?<\/section>/g, '');

    /* Build a clean family business card */
    if (typeof p77FamilyBusinessCard === 'function') {
      /* Temporarily flip activeTab so p77's card renders */
      const saved = activeTab;
      activeTab = 'life';
      let card = '';
      try { card = p77FamilyBusinessCard(); } catch (e) {}
      activeTab = saved;
      if (card) html = card + html;
    }

    return html;
  };

  /* =================================================================
     PART 8 — RELATIONSHIPS: add extended family + prestige
     ================================================================= */
  const _viewFamily = viewFamily;
  viewFamily = function () {
    let html = _viewFamily.apply(this, arguments);
    if (!S || !S.p77) return html;
    if (typeof p77ExtendedFamilyCard === 'function') {
      const c = p77ExtendedFamilyCard();
      if (c) html += c;
    }
    if (typeof p77PrestigeCard === 'function') {
      const c = p77PrestigeCard();
      if (c) html += c;
    }
    if (typeof p77MarriageExpectationCard === 'function') {
      const c = p77MarriageExpectationCard();
      if (c) html += c;
    }
    return html;
  };

  /* =================================================================
     PART 9 — REAL ESTATE: add household staff
     ================================================================= */
  const _viewAssets = viewAssets;
  viewAssets = function () {
    let html = _viewAssets.apply(this, arguments);
    if (!S || !S.p77) return html;
    if (S.country !== S.home) return html;
    if (typeof p77HouseholdStaffCard === 'function') {
      const c = p77HouseholdStaffCard();
      if (c) html += c;
    }
    return html;
  };

  /* =================================================================
     PART 10 — BANK: add trust fund card
     ================================================================= */
  const _viewBank = viewBank;
  viewBank = function () {
    let html = _viewBank.apply(this, arguments);
    if (!S || !S.p77 || S.p77.trustFundBalance <= 0) return html;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const balEGP = Math.round(S.p77.trustFundBalance * rate);
    const unlockAge = S.p77.trustFundUnlockAge || 21;
    const locked = S.age < unlockAge;
    let card = '<section class="card" style="border-color:var(--amber)"><h3>🏦 Family Trust Fund</h3>' +
      '<div class="row"><span>Balance</span><b class="mono" style="color:var(--mint)">E£' + balEGP.toLocaleString() + '</b></div>' +
      '<div class="row"><span>Unlocks at age</span><b>' + unlockAge + '</b></div>' +
      (locked
        ? '<p class="muted" style="font-size:.82rem;margin-top:8px">Managed by your family until age ' + unlockAge + '. Earns 12% APY.</p>'
        : '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p77WithdrawTrustFund()">Withdraw entire balance</button>') +
      '</section>';
    return html + card;
  };

  /* =================================================================
     PART 11 — LIFE EVENTS in yearly mode
     ================================================================= */
  function fireYearlyEvent() {
    if (!S) return;
    if (S.pacing === 'monthly') return;
    if (document.getElementById('p57-event-modal')) return;
    if (document.getElementById('p78-event-pending')) return;
    if (S.pending) { setTimeout(fireYearlyEvent, 1500); return; }
    if (S.p57 && S.p57.lastEventYear === gameYear()) return;
    if (typeof p57PickEvent !== 'function' || typeof p57ShowEventModal !== 'function') return;

    const marker = document.createElement('div');
    marker.id = 'p78-event-pending';
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
        } catch (e) { console.error('[p78] life event failed:', e); }
      }
      marker.remove();
    }, 900);
  }

  const _ageUpForEvents = ageUp;
  ageUp = function () {
    const before = S && S.age;
    const r = _ageUpForEvents.apply(this, arguments);
    if (!S || S.age === before) return r;
    if (S.pacing === 'monthly') return r;
    setTimeout(fireYearlyEvent, 600);
    return r;
  };

  /* =================================================================
     PART 12 — DUPLICATE CLEANUP (family business, one per tab)
     ================================================================= */
  function cleanDuplicates() {
    if (!S) return;
    const view = document.getElementById('view');
    if (!view) return;
    /* Family business cards with the family ownership text */
    const cards = [];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const t = sec.textContent || '';
      if (t.indexOf('Family ownership') !== -1 && t.indexOf('Annual revenue') !== -1) cards.push(sec);
    });
    for (let i = 1; i < cards.length; i++) cards[i].remove();
  }
  const _renderForCleanup = render;
  render = function () {
    const r = _renderForCleanup.apply(this, arguments);
    try { cleanDuplicates(); } catch (e) {}
    setTimeout(function () { try { cleanDuplicates(); } catch (e) {} }, 30);
    return r;
  };

  /* =================================================================
     PART 13 — DIAGNOSTICS
     ================================================================= */
  window.p78Diag = function () {
    console.log('=== p78 consolidated diag ===');
    console.log({
      age: S && S.age,
      school: S && S.school,
      effort: S && S.effort,
      country: S && S.country,
      home: S && S.home,
      degree: S && S.degree,
      uni: !!(S && S.uni),
      localMast: S && S.localMast,
      familyBusiness: S && S.p76 && S.p76.familyBusiness,
      worksForFamily: S && S.p77 && S.p77.worksForFamily,
      thanaweyaTrack: S && S.p68 && S.p68.thanaweyaTrack
    });
    console.log('viewSchool length:', viewSchool().length);
    console.log('viewCareer length:', viewCareer().length);
    console.log('viewLife length:', viewLife().length);
  };

  console.log('[p78] Consolidated file loaded');
})();
