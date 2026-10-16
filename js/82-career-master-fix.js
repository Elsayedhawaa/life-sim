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
})();
