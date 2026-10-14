/* =====================================================================
   54. PACING FIXES
   - Monthly tick uses LIVE income (not the stale S.income snapshot)
   - BPO track is re-verified before promotion
   - Career tab shows monthly cashflow when in monthly mode
   Load AFTER 53-start-fix.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. GUARANTEE TRACKS.bpo EXISTS ============ */
function p54EnsureBPOTrack() {
  if (typeof TRACKS === 'undefined') return;
  if (TRACKS.bpo) return;
  TRACKS.bpo = {
    name: 'Call Center & BPO',
    degree: null,
    levels: [
      { title: 'Customer Service Agent',  salary: 12000, hrs: 42, stress: 5, reqSmarts: 20, diploma: false },
      { title: 'Senior Agent / SME',      salary: 18000, hrs: 42, stress: 5, reqSmarts: 35, diploma: false },
      { title: 'Team Leader',             salary: 28000, hrs: 45, stress: 6, reqSmarts: 50, diploma: false },
      { title: 'Operations Manager',      salary: 48000, hrs: 48, stress: 7, reqSmarts: 60, diploma: false },
      { title: 'Site Director',           salary: 90000, hrs: 50, stress: 8, reqSmarts: 70, diploma: false }
    ]
  };
}
p54EnsureBPOTrack();

/* ============ 2. LIVE INCOME / EXPENSE CALCULATORS ============ */
function p54LiveIncome() {
  if (!S) return 0;
  let income = 0;

  /* Current job salary */
  if (S.job && S.job.salary) income += Number(S.job.salary) || 0;

  /* Part-time job */
  if (S.part && S.part.pay) income += Number(S.part.pay) || 0;

  /* Remote USD job — legacy field */
  if (S.remote && S.remote.usd) income += Number(S.remote.usd) || 0;

  /* Rental income from owned properties */
  (S.ownedHomes || []).forEach(function (h) {
    if (!h) return;
    if (h.status === 'p12-rented' && h.rentInc) {
      income += Number(h.rentInc) || 0;
    } else if (h.status === 'rent' && h.rentInc) {
      income += Number(h.rentInc) || 0;
    }
  });

  /* Retirement pension */
  if (S.retired && S.pension) income += Number(S.pension) || 0;

  /* Other income baked into S.income that isn't this year's salary
     (interest, bonuses, certificates, etc. — anything not from job) */
  const lastSalary = Number(S.lastSalary) || 0;
  const snapshotIncome = Number(S.income) || 0;
  const otherIncome = Math.max(0, snapshotIncome - lastSalary);
  income += otherIncome;

  /* Certificate yearly interest (not yet in S.income for the current year) */
  (S.certificates || []).forEach(function (c) {
    if (!c || c.matured) return;
    const rate = (c.rateSchedule || [])[Math.min(c.yearsHeld || 0, (c.rateSchedule || []).length - 1)] || 0;
    const principalEGP = Number(c.principalEGP) || 0;
    const rateNowFn = (typeof rateNow === 'function') ? rateNow() : 52.7;
    income += (principalEGP * rate) / Math.max(0.0001, rateNowFn);
  });

  return Math.max(0, income);
}

function p54LiveExpenses() {
  if (!S) return 0;
  /* Prefer the itemized bill — it reflects the current recurring costs */
  if (S.bill && typeof S.bill === 'object') {
    const total = Object.values(S.bill).reduce(function (a, b) {
      const v = Number(b);
      return a + (isFinite(v) && v > 0 ? v : 0);
    }, 0);
    if (total > 0) return total;
  }
  /* Fallback: whatever the snapshot says */
  return Math.max(0, Number(S.expenses) || 0);
}

/* ============ 3. OVERRIDE THE MONTHLY TICK ============ */
const P54_p52MonthlyTickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  p52Init();
  if (!S || S.dead) return;
  if (S.age < 18) return;

  const incomeMonthly   = p54LiveIncome() / 12;
  const expensesMonthly = p54LiveExpenses() / 12;
  const net = incomeMonthly - expensesMonthly;

  S.wealth += net;
  S.p52.lastMonthlyIncome   = incomeMonthly;
  S.p52.lastMonthlyExpenses = expensesMonthly;
  S.p52.lastMonthlyNet      = net;
  S.p52.monthlyTicksThisYear = (S.p52.monthlyTicksThisYear || 0) + 1;
};

/* ============ 4. OVERRIDE ADVANCE MONTH (uses live values) ============ */
const P54_p52AdvanceMonthBefore = p52AdvanceMonth;
p52AdvanceMonth = function () {
  if (!S) return;
  p52Init();
  if (S.pacing !== 'monthly') return ageUp();
  if (S.pending) return hint('Respond to the event before advancing.');

  /* Log this month with live values */
  if (S.age >= 18) {
    const incomeMonthly   = p54LiveIncome() / 12;
    const expensesMonthly = p54LiveExpenses() / 12;
    const net             = incomeMonthly - expensesMonthly;
    const dateStr         = p52FormatDate();
    S.pacingLog.push({ date: dateStr, income: incomeMonthly, expenses: expensesMonthly, net: net });
    S.pacingLog = S.pacingLog.slice(-24);
  }

  /* Apply the monthly tick (uses live values) */
  p52MonthlyTick();

  /* Advance month counter */
  S.pacingMonth = (S.pacingMonth || 1) + 1;
  S.pacingAbsoluteMonth = (S.pacingAbsoluteMonth || 0) + 1;

  /* Year rollover? */
  if (S.pacingMonth > 12) {
    S.pacingMonth = 1;
    S.p52.monthlyTicksThisYear = 0;

    try {
      ageUp();
    } catch (e) {
      console.error('Monthly year rollover — ageUp failed:', e);
    }
    if (S && !S.dead) {
      /* Undo the yearly lump — it was already paid monthly */
      const yearlyNet = (S.income || 0) - (S.expenses || 0);
      S.wealth -= yearlyNet;
      log('📅 New year: ' + p52CurrentYear() + '. Yearly cashflow was distributed across the previous 12 months; it is not charged again.');
    }
    save();
    render();
    return;
  }

  save();
  render();
};

/* ============ 5. FIX PROMOTION FOR BPO JOBS ============ */
const P54_askPromotionBefore = askPromotion;
askPromotion = function () {
  p54EnsureBPOTrack();
  if (!S || !S.job) return P54_askPromotionBefore.apply(this, arguments);
  /* If track is still missing for any reason, create a generic one */
  if (!TRACKS[S.job.trackId]) {
    TRACKS[S.job.trackId] = {
      name: (S.job.company || 'Employer') + ' career',
      degree: null,
      levels: [
        { title: S.job.title || 'Employee', salary: S.job.salary || 10000, hrs: 40, stress: 4, reqSmarts: 20, diploma: false },
        { title: 'Senior ' + (S.job.title || 'Employee'), salary: Math.round((S.job.salary || 10000) * 1.4), hrs: 42, stress: 5, reqSmarts: 35, diploma: false },
        { title: 'Team Lead', salary: Math.round((S.job.salary || 10000) * 1.9), hrs: 45, stress: 6, reqSmarts: 50, diploma: false },
        { title: 'Manager', salary: Math.round((S.job.salary || 10000) * 2.6), hrs: 48, stress: 7, reqSmarts: 60, diploma: false },
        { title: 'Director', salary: Math.round((S.job.salary || 10000) * 3.8), hrs: 50, stress: 8, reqSmarts: 70, diploma: false }
      ]
    };
  }
  return P54_askPromotionBefore.apply(this, arguments);
};

/* ============ 6. CAREER VIEW — MONTHLY INCOME SUMMARY ============ */
const P54_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P54_viewCareerBefore();
  if (!S || S.age < 18) return html;
  if (S.pacing !== 'monthly') return html;

  const monthlyIncome   = p54LiveIncome() / 12;
  const monthlyExpenses = p54LiveExpenses() / 12;
  const monthlyNet      = monthlyIncome - monthlyExpenses;

  let card = '<section class="card" style="border-color:var(--cyan)">' +
    '<h3>💰 Monthly view (pacing: monthly)</h3>';

  if (S.job) {
    card += '<div class="row"><span>Your job salary (gross)</span><b class="mono" style="color:var(--mint)">' + money(S.job.salary / 12) + '/month</b></div>';
  }

  card += '<div class="row"><span>All income sources</span><b class="mono" style="color:var(--mint)">' + money(monthlyIncome) + '/month</b></div>' +
    '<div class="row"><span>Recurring expenses</span><b class="mono" style="color:var(--rose)">' + money(monthlyExpenses) + '/month</b></div>' +
    '<div class="row"><span><b>Net per month</b></span><b class="mono" style="color:' + (monthlyNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(monthlyNet) + '</b></div>' +
    '<p class="muted" style="font-size:.8rem;margin-top:8px">Every click of "Next month" adds this net to your cash. Career promotions, medical events, family changes and visa decisions still fire at year-end (December).</p>' +
    '</section>';

  /* Insert after the current job card */
  const anchorIdx = html.indexOf('ACTIVE MAIN JOB');
  if (anchorIdx !== -1) {
    const sectionEnd = html.indexOf('</section>', anchorIdx);
    if (sectionEnd !== -1) {
      return html.slice(0, sectionEnd + 10) + card + html.slice(sectionEnd + 10);
    }
  }
  return card + html;
};

/* ============ 7. PACING TAB — USE LIVE VALUES ============ */
const P54_viewPacingBefore = viewPacing;
viewPacing = function () {
  let html = P54_viewPacingBefore();

  if (S && S.pacing === 'monthly') {
    const monthlyIncome   = p54LiveIncome() / 12;
    const monthlyExpenses = p54LiveExpenses() / 12;
    const monthlyNet      = monthlyIncome - monthlyExpenses;
    const yearlyNet       = monthlyNet * 12;

    /* Replace the entire "Monthly cashflow" card with a live version */
    const liveCard = '<section class="card"><h3>📊 Monthly cashflow (live)</h3>' +
      '<div class="row"><span>Yearly income (live)</span><b class="mono" style="color:var(--mint)">' + money(monthlyIncome * 12) + '</b></div>' +
      '<div class="row"><span>Yearly expenses (live)</span><b class="mono" style="color:var(--rose)">' + money(monthlyExpenses * 12) + '</b></div>' +
      '<div class="row"><span><b>Yearly net</b></span><b class="mono" style="color:' + (yearlyNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(yearlyNet) + '</b></div>' +
      '<hr style="border-color:var(--line);margin:10px 0">' +
      '<div class="row"><span>Monthly income</span><b class="mono" style="color:var(--mint)">' + money(monthlyIncome) + '</b></div>' +
      '<div class="row"><span>Monthly expenses</span><b class="mono" style="color:var(--rose)">' + money(monthlyExpenses) + '</b></div>' +
      '<div class="row"><span><b>Net per month</b></span><b class="mono" style="color:' + (monthlyNet >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(monthlyNet) + '</b></div>' +
      '</section>';

    /* Replace the old monthly card with the live one */
    html = html.replace(/<section class="card"><h3>📊 Monthly cashflow<\/h3>[\s\S]*?<\/section>/, liveCard);
  }

  return html;
};

/* ============ 8. HOOK: make sure track exists after new game / migrate ============ */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('newGame', function () { p54EnsureBPOTrack(); });
  GameHooks.on('migrate', function (o) { p54EnsureBPOTrack(); });
  GameHooks.on('render', function () { p54EnsureBPOTrack(); });
} else {
  setTimeout(p54EnsureBPOTrack, 500);
}

/* ============ 9. RUN NOW ============ */
p54EnsureBPOTrack();
