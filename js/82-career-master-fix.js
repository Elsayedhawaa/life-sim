/* =====================================================================
   82. CAREER RESTORE + MASTER'S FIX + SCHOOL PICKER (v4)
   - Suppress p77's family card on Career so p80's regex finds nothing
   - Advance master's year on ageUp
   - Detect private university
   - Bulletproof school picker at the TOP of Education
   - State sanitizer
   Load AFTER 81-education-life-makeover.js and BEFORE 99-boot.js
   ===================================================================== */

(function p82Fix() {
  'use strict';

  /* =================================================================
     1. CAREER TAB — prevent p80's greedy regex from eating sections
     ================================================================= */
  const P82_originalP77Card = (typeof p77FamilyBusinessCard === 'function')
    ? p77FamilyBusinessCard
    : null;

  if (P82_originalP77Card) {
    p77FamilyBusinessCard = function () {
      if (typeof activeTab !== 'undefined' && activeTab === 'career') return '';
      return P82_originalP77Card.apply(this, arguments);
    };
  }

  /* =================================================================
     2. MASTER'S YEAR ADVANCEMENT
     ================================================================= */
  const P82_ageUpBefore = ageUp;
  ageUp = function () {
    const ageBefore = S && S.age;
    const r = P82_ageUpBefore.apply(this, arguments);
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
     3. PUBLIC / PRIVATE UNIVERSITY DETECTION
     ================================================================= */
  const P82_PRIVATE_UNI = [
    'auc','american university','guc','german university','bue','british university',
    'aastmt','arab academy','miu','misr international','buc','badr university',
    'msa','modern sciences','nile university','future university','heliopolis university',
    'must','misr university for science','o6u','october 6 university','mti','eri','ust'
  ];

  function p82IsPrivateUniversity(nameOrId) {
    if (!nameOrId) return false;
    const s = String(nameOrId).toLowerCase();
    for (let i = 0; i < P82_PRIVATE_UNI.length; i++) {
      if (s.indexOf(P82_PRIVATE_UNI[i]) !== -1) return true;
    }
    return false;
  }
  window.p82IsPrivateUniversity = p82IsPrivateUniversity;

  function p82FixLocalMastKind() {
    if (!S || !S.localMast) return;
    const m = S.localMast;
    const check = (m.universityName || '') + ' ' + (m.universityId || '');
    if (p82IsPrivateUniversity(check)) m.kind = 'private';
    else if (!m.kind || m.kind === 'public') m.kind = 'public';
  }
  setInterval(p82FixLocalMastKind, 700);
  setTimeout(p82FixLocalMastKind, 200);

  /* =================================================================
     4. DUPLICATE FAMILY BUSINESS CARD CLEANUP
     ================================================================= */
  function p82CleanDuplicateBizCards() {
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
  const P82_renderBefore = render;
  render = function () {
    const r = P82_renderBefore.apply(this, arguments);
    try { p82CleanDuplicateBizCards(); } catch (e) {}
    setTimeout(function () { try { p82CleanDuplicateBizCards(); } catch (e) {} }, 30);
    return r;
  };

  /* =================================================================
     5. BULLETPROOF PICK HANDLERS  (with logging)
     ================================================================= */
  window.p82PickSchool = function (k) {
    console.log('[p82] p82PickSchool fired:', k);
    if (!S) { console.log('[p82] No S'); return; }
    if (!SCHOOLS || !SCHOOLS[k]) { console.log('[p82] Unknown school key:', k); return; }
    S.school = k;
    console.log('[p82] S.school =', S.school);
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p82PickEffort = function (k) {
    console.log('[p82] p82PickEffort fired:', k);
    if (!S) return;
    S.effort = k;
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p82ChooseTrack = function (track) {
    console.log('[p82] p82ChooseTrack fired:', track);
    if (!S) return;
    if (S.age < 16 || S.age > 18) { if (typeof hint === 'function') hint('Choose your track between ages 16 and 18.'); return; }
    S.p68 = S.p68 || {};
    S.p68.thanaweyaTrack = track;
    if (typeof log === 'function') {
      const label = { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[track];
      log('📝 You chose the Thanaweya Amma track: ' + label + '.');
    }
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     6. SCHOOL-AGE EDUCATION TAB — picker at the TOP
     ================================================================= */
  const P82_viewSchoolBelow = viewSchool;
  viewSchool = function () {
    let html = '';
    try { html = P82_viewSchoolBelow.apply(this, arguments); }
    catch (e) { console.error('[p82] viewSchool chain failed:', e); html = ''; }
    if (typeof S === 'undefined' || !S) return html;

    /* Not school-age — leave the chain's HTML alone */
    if (S.age >= 18 || S.uni || S.degree || S.localMast || S.age < 6) return html;

    /* Remove the misleading "Pick a school" action button (it only does go('school')) */
    html = html.replace(
      /<button[^>]*onclick="go\('school'\)"[^>]*>[^<]*📚[^<]*Pick a school[^<]*<\/button>/g,
      ''
    );

    /* Remove any leftover p82 picker to avoid stacking */
    html = html.replace(
      /<section class="card"[^>]*id="p82-school-picker"[\s\S]*?<\/section>/g,
      ''
    );

    /* Build the picker at the top */
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
          ' onclick="p82PickSchool(\'' + k + '\')">' +
          s.name + ' · ' + costLabel +
          '<small>' + (why || s.desc) + '</small>' +
          '</button>';
      }).join('');

      const famLabel = (typeof FAMILY !== 'undefined' && FAMILY[S.famWealth]) ? FAMILY[S.famWealth] : 'Modest';
      picker += '<section class="card" style="border-color:var(--cyan)" id="p82-school-picker">' +
        '<h3>📚 Pick a school</h3>' +
        '<p class="muted">Family status: <b>' + famLabel + '</b>. Pick a school before you age up.</p>' +
        rows +
        (S.school && SCHOOLS[S.school]
          ? '<p class="muted" style="font-size:.82rem;margin-top:8px;color:var(--mint)">✓ Currently enrolled: <b>' + SCHOOLS[S.school].name + '</b></p>'
          : '') +
        '</section>';
    }

    /* Effort options */
    if (typeof EFFORT !== 'undefined') {
      const eRows = Object.keys(EFFORT).map(function (k) {
        const e = EFFORT[k];
        return '<button class="btn' + (S.effort === k ? ' sel' : '') + '" onclick="p82PickEffort(\'' + k + '\')">' + e.label + '</button>';
      }).join('');
      picker += '<section class="card"><h3>Effort this year</h3>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">' + eRows + '</div></section>';
    }

    /* Thanaweya Amma track for ages 15-17 in Egypt */
    if (S.age >= 15 && S.age <= 17 && (S.country === 'egy' || !S.country)) {
      const track = (S.p68 && S.p68.thanaweyaTrack) || null;
      if (!track) {
        picker += '<section class="card" style="border-color:var(--amber)"><h3>📝 Choose Thanaweya Amma track</h3>' +
          '<p class="muted" style="font-size:.85rem">Your track determines which university faculties you can apply to.</p>' +
          '<button class="btn" onclick="p82ChooseTrack(\'adabi\')">📖 Adabi (Literary)<small>Law, Business, Arts, Mass Comm</small></button>' +
          '<button class="btn" onclick="p82ChooseTrack(\'elmi-riyada\')">🔬 Elmi Riyada (Science-Math)<small>Engineering, CS, Science, Pharmacy</small></button>' +
          '<button class="btn" onclick="p82ChooseTrack(\'elmi-olom\')">🧬 Elmi Olom (Science-Biology)<small>Medicine, Dentistry, Pharmacy, Science</small></button>' +
          '</section>';
      } else {
        const label = { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[track];
        picker += '<section class="card" style="border-color:var(--mint)"><h3>📝 Track: ' + label + '</h3>' +
          '<p class="muted" style="font-size:.85rem">You will sit the Thanaweya Amma exam at age 18.</p></section>';
      }
    }

    /* Return picker + chain's HTML (picker is first) */
    return picker + html;
  };

  /* =================================================================
     7. STATE SANITIZER
     ================================================================= */
  window.p82HealState = function () {
    if (!S) return;
    let healed = 0;
    ['cars','family','friends','logRows','certificates','ownedHomes','inventory','loans','pacingLog'].forEach(function (k) {
      if (!Array.isArray(S[k])) { S[k] = []; healed++; }
    });
    if (!S.bank || typeof S.bank !== 'object') { S.bank = { installments:{}, cardDebt:{}, activeCards:[], primaryCard:null, score:680, savingsBal:0, loans:[], missedPmts:0 }; healed++; }
    if (!S.bank.installments) { S.bank.installments = {}; healed++; }
    if (!S.bank.cardDebt) { S.bank.cardDebt = {}; healed++; }
    if (!Array.isArray(S.bank.activeCards)) { S.bank.activeCards = []; healed++; }
    if (!S.p79 || typeof S.p79 !== 'object') S.p79 = { appliedUnis: [] };
    if (!Array.isArray(S.p79.appliedUnis)) { S.p79.appliedUnis = []; healed++; }

    ['wealth','health','happiness','smarts','social','eng','loan','income','expenses'].forEach(function (k) {
      if (isNaN(Number(S[k])) || S[k] === null || S[k] === undefined) {
        S[k] = { wealth:0, health:100, happiness:100, smarts:50, social:50, eng:0, loan:0, income:0, expenses:0 }[k] || 0;
        healed++;
      }
    });
    if (isNaN(Number(S.age)) || S.age < 0) { S.age = 6; healed++; }
    if (S.pacing !== 'yearly' && S.pacing !== 'monthly') { S.pacing = 'yearly'; healed++; }
    if (isNaN(Number(S.pacingMonth))) S.pacingMonth = 1;
    if (isNaN(Number(S.pacingAbsoluteMonth))) S.pacingAbsoluteMonth = 0;

    if (S.localMast) {
      if (isNaN(Number(S.localMast.year))) S.localMast.year = 0;
      if (isNaN(Number(S.localMast.yearsTotal)) || !S.localMast.yearsTotal) S.localMast.yearsTotal = 2;
      if (!S.localMast.fieldName || S.localMast.fieldName === 'undefined') S.localMast.fieldName = "Master's programme";
      const check = (S.localMast.universityName || '') + ' ' + (S.localMast.universityId || '');
      if (p82IsPrivateUniversity(check)) S.localMast.kind = 'private';
    }

    if (S.job && S.job.isFamilyBusiness && S.p77 && S.p77.familyBusinessRevenue && (!S.job.salary || isNaN(S.job.salary))) {
      const years = Number(S.p80_familyYearsWorked) || 0;
      S.job.salary = S.p77.familyBusinessRevenue * 0.03;
      S.salary = S.job.salary;
      healed++;
    }
    if (healed > 0) console.log('[p82] Healed ' + healed + ' field(s).');
  };

  setTimeout(window.p82HealState, 200);
  setTimeout(window.p82HealState, 900);

  const P82_newGameBefore = newGame;
  newGame = function () { P82_newGameBefore.apply(this, arguments); setTimeout(window.p82HealState, 200); };

  const P82_loadGameBefore = loadGame;
  loadGame = function () { P82_loadGameBefore.apply(this, arguments); setTimeout(window.p82HealState, 200); };

  window.p82Diag = function () {
    console.log({
      activeTab: (typeof activeTab !== 'undefined') ? activeTab : '?',
      viewSchoolLength: viewSchool().length,
      pickerRendered: viewSchool().indexOf('p82-school-picker') !== -1,
      age: S && S.age,
      school: S && S.school,
      effort: S && S.effort,
      famWealth: S && S.famWealth,
      thanaweyaTrack: S && S.p68 && S.p68.thanaweyaTrack
    });
  };

  console.log('[p82 v4] Career restore + master\'s + bulletproof school picker loaded');
})();
