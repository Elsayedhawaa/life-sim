/* =====================================================================
   82. CAREER RESTORE + MASTER'S FIX  (v2 — fixes the blanking bug)
   - Prevents p80's greedy regex from eating the whole career tab
   - Advances master's year on ageUp
   - Detects public/private university correctly
   Load AFTER 81-education-life-makeover.js and BEFORE 99-boot.js
   ===================================================================== */

(function p82Fix() {

  /* =================================================================
     1. THE ROOT CAUSE FIX
     --------------------------------------------------------------
     p80 runs this greedy regex against the FULL career html:

       /<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>
          [\s\S]*?Your family owns and operates this business
          [\s\S]*?<\/section>/g

     Because [\s\S]*? is lazy but section-agnostic, it starts at the
     FIRST <section class="card"> (finances) and extends across every
     section until it reaches the family business text (which p78
     appended at the END). Result: finances + current job + job
     market + the family biz card are ALL deleted. p80 then adds its
     own family biz card at the top — and only that card remains.

     The fix: make p77FamilyBusinessCard() return '' during career
     rendering. Without the trigger text, p80's regex never matches,
     nothing gets deleted, and p80's own card is added cleanly on top.
     ================================================================= */

  const P82_originalP77Card = (typeof p77FamilyBusinessCard === 'function')
    ? p77FamilyBusinessCard
    : null;

  if (P82_originalP77Card) {
    p77FamilyBusinessCard = function () {
      /* Only suppress on the Career tab so p80's regex finds nothing */
      if (typeof activeTab !== 'undefined' && activeTab === 'career') {
        return '';
      }
      /* Otherwise call the original (Life tab, etc.) */
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
    p52MonthlyTick = function () {
      P82_p52TickBefore.apply(this, arguments);
      /* Year-advance for master's is handled by the ageUp wrapper,
         so nothing additional here. */
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

  function p82IsPrivateUniversity(nameOrId) {
    if (!nameOrId) return false;
    const s = String(nameOrId).toLowerCase();
    for (let i = 0; i < P82_PRIVATE_UNI_PATTERNS.length; i++) {
      if (s.indexOf(P82_PRIVATE_UNI_PATTERNS[i]) !== -1) return true;
    }
    return false;
  }
  window.p82IsPrivateUniversity = p82IsPrivateUniversity;

  function p82FixLocalMastKind() {
    if (!S || !S.localMast) return;
    const m = S.localMast;
    const check = (m.universityName || '') + ' ' + (m.universityId || '');
    if (p82IsPrivateUniversity(check)) {
      if (m.kind !== 'private') m.kind = 'private';
    } else if (!m.kind) {
      m.kind = 'public';
    }
  }
  setInterval(p82FixLocalMastKind, 700);
  setTimeout(p82FixLocalMastKind, 200);

  /* =================================================================
     4. CLEANUP: remove duplicate p80 biz card if p82's suppression
        didn't catch a stale render from a previous session.
     ================================================================= */
  function p82CleanDuplicateBizCards() {
    if (typeof S === 'undefined' || !S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'career') return;
    const view = document.getElementById('view');
    if (!view) return;

    /* Collect all sections whose h3 starts with 💼 and that talk about
       "Family ownership" — those are family business cards. */
    const cards = [];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const t = sec.textContent || '';
      if (t.indexOf('Family ownership') === -1) return;
      if (t.indexOf('Annual revenue') === -1) return;
      cards.push(sec);
    });
    /* Keep only the first; remove the rest. */
    for (let i = 1; i < cards.length; i++) cards[i].remove();
  }

  const P82_renderBefore = render;
  render = function () {
    const r = P82_renderBefore.apply(this, arguments);
    /* Run synchronously after the base render, before paint if possible */
    try { p82CleanDuplicateBizCards(); } catch (e) {}
    /* One more pass deferred, in case some other wrapper appends late */
    setTimeout(function () { try { p82CleanDuplicateBizCards(); } catch (e) {} }, 30);
    return r;
  };

  /* =================================================================
     5. DIAGNOSTICS
     ================================================================= */
  window.p82Diag = function () {
    console.log({
      activeTab: (typeof activeTab !== 'undefined') ? activeTab : '?',
      careerHtmlLength: (typeof viewCareer === 'function') ? viewCareer().length : 0,
      hasP77Card: typeof p77FamilyBusinessCard === 'function',
      degree: S && S.degree,
      localMast: S && S.localMast,
      localMastKind: S && S.localMast && S.localMast.kind,
      familyBusiness: S && S.p76 && S.p76.familyBusiness
    });
  };

  console.log('[p82 v2] Career restore + master\'s year advancement loaded');
})()
/* =================================================================
   PART 6 — SCHOOL-AGE EDUCATION TAB FIX
   The p81 makeover removed the school picker. Restore it so a
   new-life player can actually choose a school.
   ================================================================= */

const P82_viewSchoolSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P82_viewSchoolSchoolBefore.apply(this, arguments);
  if (typeof S === 'undefined' || !S) return html;
  if (S.age >= 18) return html;                          /* p81 handles adults */
  if (S.uni || S.degree || S.localMast) return html;     /* not a child anymore */
  if (S.age < 6) return html;

  let card = '';

  /* School picker */
  if (typeof SCHOOLS !== 'undefined') {
    const schools = Object.entries(SCHOOLS).map(function (pair) {
      const k = pair[0], s = pair[1];
      const why = (typeof schoolBlock === 'function') ? schoolBlock(k) : '';
      const sel = S.school === k;
      const costLabel = s.cost ? money(s.cost) + '/yr (parents pay)' : 'Free';
      return '<button class="btn ' + (sel ? 'sel' : '') + '" ' + (why ? 'disabled' : '') + ' onclick="pickSchool(\'' + k + '\')">' +
        s.name + ' · ' + costLabel +
        '<small>' + (why || s.desc) + '</small></button>';
    }).join('');
    card += '<section class="card" style="border-color:var(--cyan)" id="p82-school-picker"><h3>📚 School</h3>' +
      '<p class="muted">Family status: <b>' + FAMILY[S.famWealth] + '</b>. Pick a school before you age up.</p>' +
      schools + '</section>';
  }

  /* Effort picker */
  if (typeof EFFORT !== 'undefined') {
    const efforts = Object.entries(EFFORT).map(function (pair) {
      const k = pair[0], e = pair[1];
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
   PART 7 — STATE SANITIZER
   Runs on new game and on load to repair NaN / missing fields.
   This is the "S healer" — safe to run any time.
   ================================================================= */
function p82HealState() {
  if (typeof S === 'undefined' || !S) return;
  let healed = 0;

  /* Arrays */
  ['cars','family','friends','logRows','certificates','ownedHomes','inventory','loans','pacingLog'].forEach(function (k) {
    if (!Array.isArray(S[k])) { S[k] = []; healed++; }
  });

  /* Nested bank */
  if (!S.bank || typeof S.bank !== 'object') {
    S.bank = { installments: {}, cardDebt: {}, activeCards: [], primaryCard: null, score: 680, savingsBal: 0, loans: [], missedPmts: 0 };
    healed++;
  }
  if (!S.bank.installments || typeof S.bank.installments !== 'object') { S.bank.installments = {}; healed++; }
  if (!S.bank.cardDebt || typeof S.bank.cardDebt !== 'object') { S.bank.cardDebt = {}; healed++; }
  if (!Array.isArray(S.bank.activeCards)) { S.bank.activeCards = []; healed++; }
  if (!Array.isArray(S.bank.loans)) { S.bank.loans = []; healed++; }

  /* p79 (study abroad applications) */
  if (!S.p79 || typeof S.p79 !== 'object') S.p79 = { appliedUnis: [] };
  if (!Array.isArray(S.p79.appliedUnis)) { S.p79.appliedUnis = []; healed++; }

  /* p81 / p82 namespaces */
  if (!S.p81 || typeof S.p81 !== 'object') S.p81 = {};
  if (!S.p82 || typeof S.p82 !== 'object') S.p82 = {};

  /* Numbers */
  ['wealth','health','happiness','smarts','social','eng','loan','income','expenses'].forEach(function (k) {
    if (isNaN(Number(S[k])) || S[k] === null || S[k] === undefined) {
      const defaults = { wealth: 0, health: 100, happiness: 100, smarts: 50, social: 50, eng: 0, loan: 0, income: 0, expenses: 0 };
      S[k] = defaults[k] || 0;
      healed++;
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
    if (isNaN(Number(S.localMast.yearsTotal)) || !S.localMast.yearsTotal) { S.localMast.yearsTotal = 2; healed++; }
    if (!S.localMast.fieldName || S.localMast.fieldName === 'undefined') { S.localMast.fieldName = 'Master\'s programme'; healed++; }
    /* Fix wrong kind */
    const check = (S.localMast.universityName || '') + ' ' + (S.localMast.universityId || '');
    if (p82IsPrivateUniversity(check) && S.localMast.kind !== 'private') { S.localMast.kind = 'private'; healed++; }
    else if (!S.localMast.kind) { S.localMast.kind = 'public'; healed++; }
  }

  /* Family business job salary */
  if (S.job && S.job.isFamilyBusiness && S.p77 && S.p77.familyBusinessRevenue) {
    if (isNaN(Number(S.job.salary)) || S.job.salary <= 0) {
      const years = Number(S.p80_familyYearsWorked) || 0;
      const role = p82FamilyRoleFor(years, S.age);
      S.job.salary = S.p77.familyBusinessRevenue * role.salary;
      S.salary = S.job.salary;
      healed++;
    }
  }

  if (healed > 0) console.log('[p82] Healed ' + healed + ' field(s).');
  else console.log('[p82] State OK.');
}
window.p82HealState = p82HealState;

/* Run on load */
setTimeout(p82HealState, 150);
setTimeout(p82HealState, 900);

/* Wrap newGame */
const P82_newGameHealBefore = newGame;
newGame = function () {
  P82_newGameHealBefore.apply(this, arguments);
  setTimeout(p82HealState, 200);
};

/* Wrap loadGame */
const P82_loadGameHealBefore = loadGame;
loadGame = function () {
  P82_loadGameHealBefore.apply(this, arguments);
  setTimeout(p82HealState, 200);
};
