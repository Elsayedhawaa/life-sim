/* =====================================================================
   56. CRITICAL FIXES
   - REPLACES salaryForTrack entirely (no more career crash)
   - Fixes uniYear crash from missing args
   - Reliable high school graduation popup
   - Shows installment debt clearly in Money view
   - Adds monthly property view in Real Estate
   Load AFTER 55-career-graduation-medical-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p56Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p56Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* ============ 1. COMPLETE REPLACEMENT — salaryForTrack ============ */
/* Does not call the original. Cannot crash regardless of what tables exist. */
salaryForTrack = function (trackId, level, country, year, factor) {
  country = country || (S && S.country) || 'egy';
  year = year || (typeof gameYear === 'function' ? gameYear() : 2026);
  factor = (typeof factor === 'number' && isFinite(factor) && factor > 0) ? factor : 1;
  const ix = Math.max(0, Math.min(4, Number(level) || 0));

  let table = null;
  if (country === 'egy') {
    table = (typeof EGY_SALARY_2026 !== 'undefined') ? EGY_SALARY_2026 : null;
  } else {
    table = (typeof BASE_US_SALARIES !== 'undefined') ? BASE_US_SALARIES : null;
  }

  const fallbackEgypt = [120000, 180000, 280000, 480000, 900000];
  const fallbackGlobal = [18000, 28000, 45000, 72000, 120000];
  let baseArr = table && table[trackId];
  if (!Array.isArray(baseArr) || baseArr.length < 5) {
    baseArr = (country === 'egy') ? fallbackEgypt : fallbackGlobal;
  }
  const base = Number(baseArr[ix]) || Number(baseArr[0]) || 100000;

  /* Egypt branch */
  if (country === 'egy') {
    const wIdx = (typeof egyptWageIndex === 'function') ? egyptWageIndex(year) : 1;
    const rate = (typeof rateForCountry === 'function') ? rateForCountry('egy', year) : 52.7;
    return Math.round((base * wIdx * factor) / Math.max(0.0001, rate));
  }

  /* Global branch */
  const c = (typeof COUNTRIES !== 'undefined' && COUNTRIES[country]) ? COUNTRIES[country] : { w: 1, rate: 1 };
  const hist = (typeof prOf === 'function') ? prOf(year, S) : 1;
  const rate = (typeof rateForCountry === 'function') ? rateForCountry(country, year) : 1;
  return Math.round((base * (c.w || 1) * (c.rate || 1) * hist * factor) / Math.max(0.0001, rate));
};

/* Also replace jobSalaryForPost entirely to be safe */
jobSalaryForPost = function (post, level, country, year) {
  if (!post) return 0;
  country = country || (S && S.country) || 'egy';
  year = year || (typeof gameYear === 'function' ? gameYear() : 2026);
  const trackId = post.trackId || 'entry';
  const factor = (typeof post.factor === 'number' && isFinite(post.factor)) ? post.factor : 1;
  let f = factor;
  if (S && (S.masterField || S.mastDone)) f *= 1.06;
  return salaryForTrack(trackId, level, country, year, f);
};

/* ============ 2. PRE-POPULATE ALL SALARY TABLES ============ */
function p56Prepopulate() {
  if (typeof EGY_SALARY_2026 !== 'undefined' && typeof TRACKS !== 'undefined') {
    const fb = [120000, 180000, 280000, 480000, 900000];
    Object.keys(TRACKS).forEach(function (id) {
      if (!Array.isArray(EGY_SALARY_2026[id]) || EGY_SALARY_2026[id].length < 5) {
        EGY_SALARY_2026[id] = fb.slice();
      }
    });
    if (!Array.isArray(EGY_SALARY_2026.bpo)) EGY_SALARY_2026.bpo = [144000, 216000, 336000, 576000, 1080000];
  }
  if (typeof BASE_US_SALARIES !== 'undefined' && typeof TRACKS !== 'undefined') {
    const fb = [18000, 28000, 45000, 72000, 120000];
    Object.keys(TRACKS).forEach(function (id) {
      if (!Array.isArray(BASE_US_SALARIES[id]) || BASE_US_SALARIES[id].length < 5) {
        BASE_US_SALARIES[id] = fb.slice();
      }
    });
    if (!Array.isArray(BASE_US_SALARIES.bpo)) BASE_US_SALARIES.bpo = [28000, 40000, 60000, 95000, 140000];
  }
  if (typeof CAREER_TITLES !== 'undefined' && typeof TRACKS !== 'undefined') {
    Object.keys(TRACKS).forEach(function (id) {
      if (!Array.isArray(CAREER_TITLES[id])) {
        CAREER_TITLES[id] = TRACKS[id].levels.map(function (l) { return l.title; });
      }
    });
  }
}
p56Prepopulate();

/* ============ 3. FIX uniYear — defensive args ============ */
const P56_uniYearBefore = (typeof uniYear === 'function') ? uniYear : null;
if (P56_uniYearBefore) {
  uniYear = function (notes, bill) {
    if (!Array.isArray(notes)) notes = [];
    if (!bill || typeof bill !== 'object') bill = {};
    try {
      return P56_uniYearBefore.call(this, notes, bill);
    } catch (err) {
      console.error('uniYear failed — year update skipped safely:', err);
      /* Still increment the year so the player progresses */
      try {
        if (S && S.uni) S.uni.year = (S.uni.year || 0) + 1;
      } catch (e) {}
      return;
    }
  };
}

/* ============ 4. HIGH SCHOOL GRADUATION POPUP — bulletproof ============ */
function p56CheckGraduation() {
  if (!S) return;
  if (S.age < 18) return;
  if (S.p56GradShown) return;
  S.p56GradShown = true;

  const gpaStr = (S.gpa && S.gpaN) ? S.gpa.toFixed(2) : '0.00';
  let title, body;

  if (!S.diploma) {
    title = '📕 School ended';
    body = 'You left school without a diploma (' + (S.skips || 0) + ' skipped years).\n\n' +
      '• Entry-level jobs still work (Career tab)\n' +
      '• Some careers will stay locked\n' +
      '• You can still build a life';
  } else {
    title = '🎓 High school graduation';
    const scholarship = (S.gpa >= 3.5) ? '\n\n🎉 GPA ' + gpaStr + ' qualifies you for a 50% university scholarship.' : '';
    body = 'You graduated from high school!\n\n' +
      'Your options now:\n' +
      '• Enrol in university (Education tab)\n' +
      '• Start working full-time (Career tab)\n' +
      '• Take time to decide\n\n' +
      'GPA: ' + gpaStr + scholarship;
  }

  /* Log a visible line */
  log('🎓 ' + title + ' — Check Education and Career tabs.');

  /* Popup */
  setTimeout(function () {
    if (typeof p24Popup === 'function') p24Popup(title, body);
  }, 300);
}

/* ============ 5. MONEY VIEW — explicit installment debt ============ */
const P56_viewMoneyBefore = viewMoney;
viewMoney = function () {
  let html = P56_viewMoneyBefore();
  if (!S || S.age < 18) return html;

  /* Compute installment total */
  let instTotal = 0;
  let cardTotal = 0;
  if (S.bank) {
    Object.values(S.bank.installments || {}).forEach(function (i) {
      if (i && Number(i.remaining) > 0) instTotal += Number(i.remaining);
    });
    Object.values(S.bank.cardDebt || {}).forEach(function (v) {
      if (isFinite(v) && v > 0) cardTotal += Number(v);
    });
  }
  if (instTotal <= 0.01 && cardTotal <= 0.01) return html;

  const rate = p56Rate();
  let card = '<section class="card" style="border-color:var(--amber)"><h3>📱 Active installment & card debt</h3>';
  if (cardTotal > 0) {
    card += '<div class="row"><span>Credit cards total</span><b class="mono" style="color:var(--rose)">' + money(cardTotal) + '</b></div>';
  }
  if (instTotal > 0) {
    card += '<div class="row"><span>Installments total</span><b class="mono" style="color:var(--rose)">' + money(instTotal) + '</b></div>';
  }
  card += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Total owed</b></span><b class="mono" style="color:var(--rose)">' + money(cardTotal + instTotal) + '</b></div>';

  /* Show each installment's monthly equivalent */
  const insts = Object.entries(S.bank.installments || {});
  if (insts.length) {
    card += '<h4 style="margin-top:12px;font-size:.85rem">Installment plans</h4>';
    insts.forEach(function (entry) {
      const i = entry[1];
      if (!i || Number(i.remaining) <= 0) return;
      const monthlyAmt = Number(i.monthlyPayment) || 0;
      card += '<div class="row" style="padding:4px 0"><span>' + (i.name || 'Installment') + '</span><b class="mono">' + money(monthlyAmt) + '/month</b></div>';
    });
  }

  card += '<button class="btn" style="margin-top:8px" onclick="go(\'bank\')">Manage in Bank tab</button></section>';

  /* Insert after first section */
  const firstEnd = html.indexOf('</section>');
  if (firstEnd !== -1) {
    return html.slice(0, firstEnd + 10) + card + html.slice(firstEnd + 10);
  }
  return card + html;
};

/* ============ 6. REAL ESTATE — monthly view ============ */
const P56_viewAssetsBefore = viewAssets;
viewAssets = function () {
  let html = P56_viewAssetsBefore();
  if (!S) return html;

  /* Only show monthly breakdown when pacing is monthly */
  if (S.pacing !== 'monthly') return html;

  /* Compute monthly totals */
  let mortgageMonthly = 0;
  let rentMonthly = 0;
  let maintMonthly = 0;

  (S.ownedHomes || []).forEach(function (h) {
    if (!h) return;
    if (h.balance > 0 && h.pay) mortgageMonthly += Number(h.pay) / 12;
    if (h.status === 'p12-rented' && h.rentAmount) rentMonthly += Number(h.rentAmount);
    maintMonthly += (Number(h.value) || 0) * 0.01 / 12;
  });

  /* Housing store contracts (compound installments) */
  let installMonthly = 0;
  if (S.housingStore && Array.isArray(S.housingStore.contracts)) {
    S.housingStore.contracts.forEach(function (c) {
      if (!c || Number(c.remainingAmt) <= 0) return;
      installMonthly += (Number(c.annualAmt) || 0) / 12;
    });
  }

  const utilitiesMonthly = (S.bill && S.bill.utilities) ? Number(S.bill.utilities) / 12 : 0;
  const netMonthly = rentMonthly - mortgageMonthly - maintMonthly - installMonthly - utilitiesMonthly;

  const summary = '<section class="card" style="border-color:var(--cyan)">' +
    '<h3>📅 Monthly property view (pacing: monthly)</h3>' +
    '<div class="row"><span>Rental income (from tenants)</span><b class="mono" style="color:var(--mint)">' + money(rentMonthly) + '/month</b></div>' +
    '<div class="row"><span>Mortgage payments</span><b class="mono" style="color:var(--rose)">' + money(mortgageMonthly) + '/month</b></div>' +
    (installMonthly > 0 ? '<div class="row"><span>Compound installments</span><b class="mono" style="color:var(--rose)">' + money(installMonthly) + '/month</b></div>' : '') +
    '<div class="row"><span>Maintenance (1% of value/year)</span><b class="mono" style="color:var(--rose)">' + money(maintMonthly) + '/month</b></div>' +
    (utilitiesMonthly > 0 ? '<div class="row"><span>Utilities</span><b class="mono" style="color:var(--rose)">' + money(utilitiesMonthly) + '/month</b></div>' : '') +
    '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Net property cashflow</b></span><b class="mono" style="color:' + (netMonthly >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(netMonthly) + '/month</b></div>' +
    '<p class="muted" style="font-size:.8rem;margin-top:6px">Every click of "Next month" applies these costs to your cash. Mortgage and installments still total the same per year.</p>' +
    '</section>';

  /* Insert before the "Property dashboard" heading */
  const idx = html.indexOf('Property dashboard');
  if (idx !== -1) {
    const sectionStart = html.lastIndexOf('<section', idx);
    if (sectionStart !== -1) {
      return html.slice(0, sectionStart) + summary + html.slice(sectionStart);
    }
  }
  return summary + html;
};

/* ============ 7. MOUNT POINTS ============ */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    p56Prepopulate();
    p56CheckGraduation();
  });
  GameHooks.on('migrate', function () { p56Prepopulate(); });
  GameHooks.on('newGame', function () { p56Prepopulate(); });
}

/* Run at load */
p56Prepopulate();
setTimeout(p56CheckGraduation, 700);
setTimeout(p56CheckGraduation, 2000);
