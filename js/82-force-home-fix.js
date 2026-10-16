/* =====================================================================
   82. FORCE HOME COUNTRY — the missing unconditional reset
   Root cause: p81EnsureHome() only detects birth country ONCE and
   then trusts whatever was saved. If a prior session saved
   S.p81.birthCountry = 'gbr', it will keep restoring home='gbr'
   even though the player is Egyptian. Every "am I abroad?" check
   then fails because 'gbr' === 'gbr'.
   Fix: unconditionally force egy, rebuild the passport panel, and
   strip Egyptian-only content that leaked into foreign views.
   ===================================================================== */

(function p82ForceHomeFix() {
  function p82Force() {
    if (typeof S === 'undefined' || !S) return;
    /* Unconditional — do NOT check before setting */
    S.home = 'egy';
    S.p81 = S.p81 || {};
    S.p81.birthCountry = 'egy';
  }

  /* Immediately */
  p82Force();

  /* Every 300ms as a safety net (cheap — just two assignments) */
  setInterval(p82Force, 300);

  /* Also wrap render in case there's a timing race */
  try {
    const origRender = render;
    render = function () {
      const r = origRender.apply(this, arguments);
      p82Force();
      setTimeout(p82FixDom, 60);
      return r;
    };
  } catch (e) {
    console.warn('[p82] render wrap failed:', e);
  }

  function p82FixDom() {
    if (typeof S === 'undefined' || !S) return;
    p82Force();
    const view = document.getElementById('view');
    if (!view) return;

    const isAbroad = S.country !== 'egy';

    /* ---- 1. Passport panel: rebuild if it shows any non-Egyptian country ---- */
    view.querySelectorAll('h3').forEach(function (h3) {
      const txt = (h3.textContent || '');
      if (txt.indexOf('passport') === -1 && txt.indexOf('Passport') === -1) return;
      const sec = h3.closest('section');
      if (!sec) return;
      const secText = sec.textContent || '';
      /* Detect wrong passport */
      const wrong =
        secText.indexOf('United Kingdom passport') !== -1 ||
        secText.indexOf('British passport') !== -1 ||
        secText.indexOf('United States passport') !== -1 ||
        secText.indexOf('German passport') !== -1 ||
        secText.indexOf('Canadian passport') !== -1 ||
        secText.indexOf('is issued by GBR') !== -1 ||
        secText.indexOf('is issued by USA') !== -1;

      /* Also rebuild if abroad and the panel doesn't mention living abroad */
      const missingAbroadNote = isAbroad && secText.indexOf('Currently living in') === -1;

      if (!wrong && !missingAbroadNote && sec.dataset.p82PassportOK === '1') return;
      if (wrong || missingAbroadNote) {
        const cName = isAbroad && COUNTRIES[S.country] ? COUNTRIES[S.country].n : null;
        sec.innerHTML =
          '<h3>🛂 Your passport and your options</h3>' +
          '<div class="row"><span>Your passport</span><b>🇪🇬 Egyptian passport</b></div>' +
          '<div class="row"><span>Visa-free access</span><b>~50 destinations (26%)</b></div>' +
          (isAbroad ? '<div class="row"><span>Currently living in</span><b>' + cName + ' (on visa)</b></div>' : '') +
          '<p class="muted" style="font-size:.78rem;margin-top:8px">Your passport is issued by EGYPT. Living abroad does not change it — naturalization typically requires 5–8 years of permanent residence.</p>' +
          '<p class="muted" style="font-size:.78rem">A visa application costs money, takes weeks, and is not refunded if it is refused.</p>';
        sec.dataset.p82PassportOK = '1';
      }
    });

    /* ---- 2. Parents' home in Real Estate — remove when abroad ---- */
    if (isAbroad && typeof activeTab !== 'undefined' && activeTab === 'assets') {
      view.querySelectorAll('section.card').forEach(function (sec) {
        const t = sec.textContent || '';
        if (t.indexOf('Where you live now') !== -1) return; /* our new card */
        const isParentsHome =
          (t.indexOf("Your parents' home") !== -1 || t.indexOf('Your parents\u2019 home') !== -1 || t.indexOf('YOU CURRENTLY LIVE IN') !== -1) &&
          (t.indexOf('Owned by your father') !== -1 ||
           t.indexOf('Owned by your mother') !== -1 ||
           t.indexOf('Living with family') !== -1 ||
           t.indexOf('Stay with parents') !== -1);
        if (isParentsHome) sec.remove();
      });
    }

    /* ---- 3. Egypt-specific medical insurance text ---- */
    if (isAbroad) {
      const countryName = (COUNTRIES[S.country] || {}).n || 'your country';
      view.innerHTML = view.innerHTML.replace(
        /In Egypt, employer-provided insurance typically covers 75% of medical bills up to 150,000 EGP\/year\./g,
        'In ' + countryName + ', employer-provided insurance is not standard — check with each employer.'
      );
    }

    /* ---- 4. Master's modal buttons — make them scroll, not just close ---- */
    const masterModal = document.getElementById('p81-master-modal');
    if (masterModal) {
      masterModal.querySelectorAll('button').forEach(function (btn) {
        const t = btn.textContent || '';
        if (t.indexOf('Pick subject') !== -1 && !btn.dataset.p82Fixed) {
          btn.dataset.p82Fixed = '1';
          btn.setAttribute('onclick', 'p82GoTo("Local Master")');
        }
        if (t.indexOf('Scroll down to Study Abroad') !== -1 && !btn.dataset.p82Fixed) {
          btn.dataset.p82Fixed = '1';
          btn.setAttribute('onclick', 'p82GoTo("Master")');
        }
      });
    }
  }

  window.p82GoTo = function (headingLike) {
    const m = document.getElementById('p81-master-modal');
    if (m) m.remove();
    if (typeof go === 'function') go('school');
    setTimeout(function () {
      const view = document.getElementById('view');
      if (!view) return;
      const h = Array.from(view.querySelectorAll('h3')).find(function (h3) {
        return (h3.textContent || '').indexOf(headingLike) !== -1;
      });
      if (h) h.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  /* ---- Diagnostics ---- */
  window.p82Diag = function () {
    console.log({
      home: S && S.home,
      birth: S && S.p81 && S.p81.birthCountry,
      country: S && S.country,
      isAbroad: S && S.country !== S.home,
      visa: S && S.p81 && S.p81.visa && S.p81.visa.name
    });
  };

  console.log('[p82] Force home=egy + passport rebuild + parents-home strip loaded');
})();
