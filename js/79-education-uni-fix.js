/* =====================================================================
   79. EDUCATION UNIVERSITY FIX
   - Hide the duplicate EDUCATION STATUS card
   - Fix the dead "Choose a university" button (scroll to selection)
   - Add ALL eligible faculties to each university card
   - Wire faculty selection to the career ladders in file 72
   Load AFTER 78-consolidated.js and BEFORE 99-boot.js
   ===================================================================== */

(function p79EducationUniFix() {
  'use strict';

  /* =================================================================
     1. FACULTY CATALOG PER UNIVERSITY
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
  window.p79UniKeyFromName = uniKeyFromName;

  /* =================================================================
     2. ENROLLMENT — one function, reads from a per-card selection
     ================================================================= */
  window.p79UniFacultySelect = {};  /* { uniKey: 'Medicine' } */

  window.p79SelectFaculty = function (uniKey, faculty) {
    window.p79UniFacultySelect[uniKey] = faculty;
    /* Highlight all buttons for this uni */
    document.querySelectorAll('[data-p79-uni="' + uniKey + '"]').forEach(function (b) {
      const isSel = b.getAttribute('data-p79-fac') === faculty;
      b.classList.toggle('sel', isSel);
    });
  };

  window.p79EnrollFaculty = function (uniKey, faculty, funder) {
    if (!S) return;
    /* Try the base Egypt enroll function first */
    if (typeof enrollEgyptUniversity === 'function') {
      enrollEgyptUniversity(uniKey, faculty, funder);
      return;
    }
    if (typeof enrollUni === 'function') {
      enrollUni('public', faculty);
      return;
    }
    /* Fallback — build S.uni manually */
    S.uni = {
      type: 'public',
      universityId: uniKey,
      universityName: (function () {
        const map = { cairo:'Cairo University', alexandria:'Alexandria University', 'ain-shams':'Ain Shams University',
                      auc:'American University in Cairo', guc:'German University in Cairo', bue:'British University in Egypt',
                      aastmt:'Arab Academy for Science & Technology', buc:'Badr University in Cairo',
                      miu:'Misr International University', msa:'Modern Sciences and Arts University',
                      nile:'Nile University', future:'Future University in Egypt', helwan_i:'Heliopolis University' };
        return map[uniKey] || 'Egyptian University';
      })(),
      faculty: faculty,
      year: 0,
      yearsTotal: /Medicine|Dentistry|Pharmacy/.test(faculty) ? 5 : 4,
      pay: funder || 'self',
      scholar: false,
      annualCostEGP: funder === 'self' ? 25000 : 0
    };
    if (typeof log === 'function') log('🎓 Enrolled at ' + S.uni.universityName + ' — ' + faculty + '.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     3. DOM WALKER — add faculty buttons to each university card
     ================================================================= */
  function p79DecorateUniCards() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'school') return;
    const view = document.getElementById('view');
    if (!view) return;

    /* Only for Egyptian players in the "ready for university" state */
    if (S.country !== 'egy') return;
    if (S.uni || S.degree || S.localMast) return;
    if (!S.diploma) return;

    const track = (S.p68 && S.p68.thanaweyaTrack) || 'adabi';
    const eligibleList = ELIGIBLE_BY_TRACK[track] || [];

    view.querySelectorAll('section.card').forEach(function (sec) {
      const h3 = sec.querySelector('h3');
      if (!h3) return;
      const name = (h3.textContent || '').trim();
      const key = uniKeyFromName(name);
      if (!key) return;
      if (sec.dataset.p79FacAdded === '1') return;
      sec.dataset.p79FacAdded = '1';

      const allFacs = UNI_FACULTIES[key] || [];
      const facs = allFacs.filter(function (f) { return eligibleList.indexOf(f) !== -1; });
      if (!facs.length) return;

      /* Build faculty picker block */
      const block = document.createElement('div');
      block.style.cssText = 'margin-top:14px;padding:12px;background:rgba(139,92,246,.06);border-radius:8px;border-left:3px solid var(--violet)';
      block.innerHTML = '<div style="font-size:.72rem;letter-spacing:.06em;font-weight:700;color:var(--violet);margin-bottom:8px">🎯 CHOOSE YOUR FACULTY</div>'
        + '<div style="display:grid;grid-template-columns:1fr;gap:4px">'
        + facs.map(function (f, i) {
            const isFirst = i === 0;
            return '<button class="btn' + (isFirst ? ' sel' : '') + '" data-p79-uni="' + key + '" data-p79-fac="' + f + '" '
              + 'style="margin:0;text-align:left;padding:8px;font-size:.82rem" '
              + 'onclick="p79SelectFaculty(\'' + key + '\', \'' + f + '\'); p79EnrollFaculty(\'' + key + '\', \'' + f + '\', \'self\')">'
              + f
              + '</button>';
          }).join('')
        + '</div>';
      sec.appendChild(block);

      /* Remember the first selection as default */
      if (!window.p79UniFacultySelect[key]) {
        window.p79UniFacultySelect[key] = facs[0];
      }
    });
  }

  /* =================================================================
     4. DEDUPE EDUCATION STATUS CARDS
     ================================================================= */
  function p79DedupeStatus() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'school') return;
    const view = document.getElementById('view');
    if (!view) return;
    const matches = [];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const t = sec.textContent || '';
      if (t.indexOf('EDUCATION STATUS') !== -1 && t.length < 400) matches.push(sec);
    });
    /* Keep the first, remove the rest */
    for (let i = 1; i < matches.length; i++) matches[i].remove();
  }

  /* =================================================================
     5. FIX DEAD "Choose a university" BUTTON
     ================================================================= */
  function p79FixChooseUniButton() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'school') return;
    const view = document.getElementById('view');
    if (!view) return;

    view.querySelectorAll('button').forEach(function (btn) {
      const t = (btn.textContent || '').trim();
      if (t !== '🎓 Choose a university' && t !== 'Choose a university') return;
      if (btn.dataset.p79Fixed === '1') return;
      btn.dataset.p79Fixed = '1';
      /* Replace with scroll-to-first-university behaviour */
      btn.setAttribute('onclick', 'p79ScrollToUniversities()');
    });
  }

  window.p79ScrollToUniversities = function () {
    /* Find the first university card and scroll to it */
    const view = document.getElementById('view');
    if (!view) return;
    const cards = view.querySelectorAll('section.card');
    for (let i = 0; i < cards.length; i++) {
      const h3 = cards[i].querySelector('h3');
      if (!h3) continue;
      const key = uniKeyFromName(h3.textContent);
      if (key) {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
  };

  /* =================================================================
     6. MAIN WRAP — run decorators after every render
     ================================================================= */
  const _render = render;
  render = function () {
    const r = _render.apply(this, arguments);
    /* Synchronous — before the browser paints */
    try {
      p79DedupeStatus();
      p79FixChooseUniButton();
      p79DecorateUniCards();
    } catch (e) { console.error('[p79] uni fix failed:', e); }
    return r;
  };

  /* =================================================================
     7. FACULTY → CAREER LADDER BRIDGE
     Ensures p72 gets the right faculty name on graduation.
     ================================================================= */
  /* p72 already maps faculty names to ladders via P72_FACULTY_TO_DEGREE
     and P72_CAREER_LADDERS. Nothing to do — just confirm the list. */

  window.p79Diag = function () {
    const view = document.getElementById('view');
    const statusCount = view ? view.querySelectorAll('section.card').length : 0;
    const uniCards = [];
    if (view) {
      view.querySelectorAll('section.card').forEach(function (sec) {
        const h3 = sec.querySelector('h3');
        if (h3 && uniKeyFromName(h3.textContent)) uniCards.push(uniKeyFromName(h3.textContent));
      });
    }
    console.log({
      activeTab: (typeof activeTab !== 'undefined') ? activeTab : '?',
      statusCardCount: statusCount,
      uniCardsFound: uniCards,
      hasTrack: !!(S && S.p68 && S.p68.thanaweyaTrack),
      track: S && S.p68 && S.p68.thanaweyaTrack,
      currentUni: S && S.uni,
      degree: S && S.degree
    });
  };

  console.log('[p79] Education university fix loaded');
})();
