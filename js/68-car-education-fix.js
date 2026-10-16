/* =====================================================================
   68. CAR CRASH FIX + EDUCATION TAB CLEANUP
   - Fixes "Cannot read properties of undefined (reading '2')" in carStats
   - Removes the repetitive "International master's" section (09-realism)
   - Hides German/Dutch unless you actually need them
   - Keeps: Egypt universities, English courses, P49 study-abroad panel
   Load AFTER 67-debt-truth-fix.js and BEFORE 99-boot.js
   ===================================================================== */

/* =================================================================
   1. CAR STATS CRASH FIX
   Ensure every car has compat fields for the base carStats()
   ================================================================= */
const P68_carStatsBefore = carStats;
carStats = function (c) {
  if (!c) return { hap: 2, soc: 2, saf: 0, insMod: 0, mpg: 30 };
  /* P62 cars use `interior` not `int`. Fill in compat fields. */
  if (c.brand && !c.legacy) {
    if (typeof c.int !== 'number') c.int = 0;
    if (typeof c.intc !== 'number') c.intc = 0;
    if (typeof c.trim !== 'number') c.trim = 0;
    if (typeof c.color !== 'number') c.color = 0;
    if (!Array.isArray(c.opts)) c.opts = [];
    if (!Array.isArray(c.mods)) c.mods = [];
  }
  try {
    return P68_carStatsBefore.apply(this, arguments);
  } catch (err) {
    /* If base still throws, return safe defaults instead of crashing the year */
    console.error('carStats fallback for', c && c.name, err);
    return { hap: c.hap || 2, soc: c.soc || 2, saf: 0, insMod: 0, mpg: 30 };
  }
};

/* Also ensure P62 cars created in future get these fields.
   Patch the purchase function to add them. */
const P68_p65PurchaseBefore = (typeof p65PurchaseCar === 'function') ? p65PurchaseCar : null;
if (P68_p65PurchaseBefore) {
  p65PurchaseCar = function (method) {
    const r = P68_p65PurchaseBefore.apply(this, arguments);
    /* After any P62 purchase, ensure compat fields on all P62 cars */
    (S.cars || []).forEach(function (c) {
      if (c && c.brand && !c.legacy) {
        if (typeof c.int !== 'number') c.int = 0;
        if (typeof c.intc !== 'number') c.intc = 0;
        if (typeof c.trim !== 'number') c.trim = 0;
        if (typeof c.color !== 'number') c.color = 0;
        if (!Array.isArray(c.opts)) c.opts = [];
        if (!Array.isArray(c.mods)) c.mods = [];
      }
    });
    return r;
  };
}

/* Fix any existing P62 cars in the save on load */
function p68FixExistingCars() {
  if (!S || !Array.isArray(S.cars)) return;
  S.cars.forEach(function (c) {
    if (c && c.brand && !c.legacy) {
      if (typeof c.int !== 'number') c.int = 0;
      if (typeof c.intc !== 'number') c.intc = 0;
      if (typeof c.trim !== 'number') c.trim = 0;
      if (typeof c.color !== 'number') c.color = 0;
      if (!Array.isArray(c.opts)) c.opts = [];
      if (!Array.isArray(c.mods)) c.mods = [];
    }
  });
}
setTimeout(p68FixExistingCars, 300);
setTimeout(p68FixExistingCars, 1500);

/* =================================================================
   2. EDUCATION TAB CLEANUP
   Only rebuild the master's / language area. Keep Egypt universities.
   ================================================================= */
const P68_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P68_viewSchoolBefore.apply(this, arguments);
  if (!S) return html;

  /* --- A. Remove the old 09-realism "International master's" section ---
     It shows the same boring template text on every country and duplicates
     the P49 "Study abroad — realistic costs" panel. */
  html = html.replace(
    /<section class="card">[\s\S]*?International master’s · Europe, North America and beyond[\s\S]*?<\/section>/g,
    ''
  );

  /* --- B. Hide German language card unless relevant --- */
  const goingToGermany = (S.studentVisaCase && S.studentVisaCase.dest === 'deu') ||
                          (S.mast && S.mast.dest === 'deu') ||
                          S.country === 'deu';
  if (!goingToGermany) {
    html = html.replace(
      /<section class="card">[\s\S]*?🇩🇪 German[\s\S]*?<\/section>/g,
      ''
    );
  }

  /* --- C. Hide Dutch language card unless relevant --- */
  const goingToNetherlands = (S.studentVisaCase && S.studentVisaCase.dest === 'nld') ||
                              (S.mast && S.mast.dest === 'nld') ||
                              S.country === 'nld';
  if (!goingToNetherlands) {
    html = html.replace(
      /<section class="card">[\s\S]*?🇳🇱 Dutch[\s\S]*?<\/section>/g,
      ''
    );
  }

  /* --- D. Hide the university scholarship hint after graduation --- */
  if (S.degree) {
    html = html.replace(/A GPA of 3\.5 or more earns a 50% scholarship[^<]*/g, '');
  }

  return html;
};

/* =================================================================
   3. HIDE USELESS STUDY-ABROAD COUNTRIES
   The P49 panel shows every country even if the player has no chance.
   Add a filter: show only countries where the player might realistically go,
   OR keep them all but mark the ones that need improvement. We'll keep all
   but add a compact summary at the top.
   ================================================================= */
const P68_viewSchoolForStudyPanel = viewSchool;
viewSchool = function () {
  let html = P68_viewSchoolForStudyPanel.apply(this, arguments);

  /* Add a summary card at the top of the study-abroad panel showing
     the player's actual available cash vs the cheapest destination. */
  const bankEGP = Math.round((Number(S.wealth) || 0) * p68Rate());
  const cheapest = 1298473;   /* Italy year 1, rough */
  const canAffordAny = bankEGP >= cheapest;

  const hint = '<section class="card" style="border-color:var(--cyan)">' +
    '<h3>🌍 Study abroad — overview</h3>' +
    '<div class="row"><span>Your available bank</span><b class="mono">E£' + bankEGP.toLocaleString() + '</b></div>' +
    '<div class="row"><span>Cheapest destination (Italy year 1)</span><b class="mono">E£' + cheapest.toLocaleString() + '</b></div>' +
    (canAffordAny
      ? '<p class="muted" style="font-size:.82rem;margin-top:6px">You have enough for at least one destination. Expand the cards below.</p>'
      : '<p class="muted" style="font-size:.82rem;margin-top:6px;color:var(--rose)">⚠️ You cannot afford any destination right now. Scholarships and family funding are your only routes.</p>') +
    '</section>';

  /* Insert just before the "Study abroad — realistic costs" panel */
  const marker = html.indexOf('🌍 Study abroad — realistic costs');
  if (marker !== -1) {
    const sectionStart = html.lastIndexOf('<section', marker);
    if (sectionStart !== -1) {
      return html.slice(0, sectionStart) + hint + html.slice(sectionStart);
    }
  }
  return html;
};

function p68Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* =================================================================
   4. RUN ON LOAD
   ================================================================= */
p68FixExistingCars();

console.log('[p68] Car crash fix + Education cleanup loaded');
