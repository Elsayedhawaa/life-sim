/* =====================================================================
   52. PACING SYSTEM — Phase 3.7 consolidation
   Replaces: 52-monthly-pacing.js, 53-start-fix.js, 54-pacing-fixes.js
   Load AFTER 51-bpo-injection.js and BEFORE 55-career-graduation-medical-fixes.js
   ===================================================================== */

(function p52PacingSystem() {
  'use strict';

  /* =============================================================
     PART 1 — STATE INIT
     ============================================================= */
  function p52Init(o) {
    o = o || S;
    if (!o) return;
    if (o.pacing !== 'yearly' && o.pacing !== 'monthly') o.pacing = 'yearly';
    if (typeof o.pacingMonth !== 'number') o.pacingMonth = 1;
    if (typeof o.pacingAbsoluteMonth !== 'number') o.pacingAbsoluteMonth = 0;
    if (!Array.isArray(o.pacingLog)) o.pacingLog = [];
    if (!o.p52) o.p52 = {};
    if (typeof o.p52.monthlyTicksThisYear !== 'number') o.p52.monthlyTicksThisYear = 0;
  }
  window.p52Init = p52Init;

  const _migrate = migrate;
  migrate = function (o) { const r = _migrate(o); p52Init(r); return r; };
  const _newGame = newGame;
  newGame = function () { _newGame.apply(this, arguments); p52Init(S); };

  /* =============================================================
     PART 2 — DATE HELPERS
     ============================================================= */
  const P52_MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  window.P52_MONTH_NAMES = P52_MONTH_NAMES;

  function p52CurrentMonth() { p52Init(); return Math.max(1, Math.min(12, S.pacingMonth || 1)); }
  function p52CurrentYear() { return (S.born || 2001) + (S.age || 6); }
  function p52FormatDate() { return P52_MONTH_NAMES[p52CurrentMonth() - 1] + ' ' + p52CurrentYear(); }
  window.p52CurrentMonth = p52CurrentMonth;
  window.p52CurrentYear = p52CurrentYear;
  window.p52FormatDate = p52FormatDate;

  /* =============================================================
     PART 3 — BPO TRACK ENSURE
     ============================================================= */
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
  window.p54EnsureBPOTrack = p54EnsureBPOTrack;
  p54EnsureBPOTrack();

  /* =============================================================
     PART 4 — LIVE INCOME / EXPENSE
     Names kept for compatibility with 66-finance-reality-fix and others
     ============================================================= */
  function p54LiveIncome() {
    if (!S) return 0;
    let income = 0;
    if (S.job && S.job.salary) income += Number(S.job.salary) || 0;
    if (S.part && S.part.pay) income += Number(S.part.pay) || 0;
    if (S.remote && S.remote.usd) income += Number(S.remote.usd) || 0;
    (S.ownedHomes || []).forEach(function (h) {
      if (!h) return;
      if ((h.status === 'p12-rented' || h.status === 'rent') && h.rentInc) {
        income += Number(h.rentInc) || 0;
      }
    });
    if (S.retired && S.pension) income += Number(S.pension) || 0;

    const lastSalary = Number(S.lastSalary) || 0;
    const snapshotIncome = Number(S.income) || 0;
    const otherIncome = Math.max(0, snapshotIncome - lastSalary);
    income += otherIncome;

    (S.certificates || []).forEach(function (c) {
      if (!c || c.matured) return;
      const rs = c.rateSchedule || [];
      const rate = rs[Math.min(c.yearsHeld || 0, rs.length - 1)] || 0;
      const principalEGP = Number(c.principalEGP) || 0;
      const rateNowFn = (typeof rateNow === 'function') ? rateNow() : 52.7;
      income += (principalEGP * rate) / Math.max(0.0001, rateNowFn);
    });
    return Math.max(0, income);
  }
  window.p54LiveIncome = p54LiveIncome;

  function p54LiveExpenses() {
    if (!S) return 0;
    if (S.bill && typeof S.bill === 'object') {
      const total = Object.values(S.bill).reduce(function (a, b) {
        const v = Number(b);
        return a + (isFinite(v) && v > 0 ? v : 0);
      }, 0);
      if (total > 0) return total;
    }
    return Math.max(0, Number(S.expenses) || 0);
  }
  window.p54LiveExpenses = p54LiveExpenses;

  /* =============================================================
     PART 5 — SET PACING MODE
     ============================================================= */
  function p52SetPacing(mode) {
    p52Init();
    if (mode !== 'yearly' && mode !== 'monthly') return hint('Invalid pacing mode.');
    if (S.pacing === mode) return hint('Already in ' + mode + ' mode.');

    const yearNet = (S.income || 0) - (S.expenses || 0);
    const monthsElapsed = Math.max(0, Math.min(12, (S.pacingMonth || 1) - 1));

    if (mode === 'monthly') {
      const remainingFraction = (12 - monthsElapsed) / 12;
      const toRemove = yearNet * remainingFraction;
      if (Math.abs(toRemove) > 0.01) {
        S.wealth -= toRemove;
        log('Switched to MONTHLY. ' + money(toRemove) + ' moved out of wealth and will be paid over the coming months.');
      } else {
        log('Switched to MONTHLY.');
      }
      S.pacingMonth = 1;
      S.p52.monthlyTicksThisYear = 0;
      if (typeof realismNotice === 'function') {
        realismNotice('Monthly pacing enabled', 'Every click pays 1/12 of your yearly income and expenses. Career, family and visa decisions still happen yearly.');
      }
    } else {
      const remainingFraction = (12 - monthsElapsed) / 12;
      const toAdd = yearNet * remainingFraction;
      if (Math.abs(toAdd) > 0.01) {
        S.wealth += toAdd;
        log('Switched to YEARLY. ' + money(toAdd) + ' paid as a lump for the remaining months.');
      } else {
        log('Switched to YEARLY.');
      }
      S.pacingMonth = 1;
    }

    S.pacing = mode;
    hint();
    render();
  }
  window.p52SetPacing = p52SetPacing;

  /* =============================================================
     PART 6 — MONTHLY TICK (uses LIVE values)
     ============================================================= */
  function p52MonthlyTick() {
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
  }
  window.p52MonthlyTick = p52MonthlyTick;

  /* =============================================================
     PART 7 — ADVANCE MONTH
     ============================================================= */
  function p52AdvanceMonth() {
    if (!S) return;
    p52Init();
    if (S.pacing !== 'monthly') return ageUp();
    if (S.pending) return hint('Respond to the event before advancing.');

    if (S.age >= 18) {
      const incomeMonthly = p54LiveIncome() / 12;
      const expensesMonthly = p54LiveExpenses() / 12;
      const net = incomeMonthly - expensesMonthly;
      const dateStr = p52FormatDate();
      S.pacingLog.push({ date: dateStr, income: incomeMonthly, expenses: expensesMonthly, net: net });
      S.pacingLog = S.pacingLog.slice(-24);
      p52MonthlyTick();
    }

    S.pacingMonth = (S.pacingMonth || 1) + 1;
    S.pacingAbsoluteMonth = (S.pacingAbsoluteMonth || 0) + 1;

    if (S.pacingMonth > 12) {
      S.pacingMonth = 1;
      S.p52.monthlyTicksThisYear = 0;
      try { ageUp(); } catch (e) { console.error('Monthly year rollover — ageUp failed:', e); }
      if (S && !S.dead) {
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
  }
  window.p52AdvanceMonth = p52AdvanceMonth;

  /* =============================================================
     PART 8 — PATCH AGE BUTTON + HEADER
     ============================================================= */
  function p52PatchAgeButton() {
    const btn = document.getElementById('age-btn');
    if (!btn || !S) return;
    p52Init();
    if (S.pacing === 'monthly') {
      btn.textContent = 'Next month →  ' + p52FormatDate();
      btn.onclick = p52AdvanceMonth;
    } else {
      btn.textContent = 'Age up';
      btn.onclick = ageUp;
    }
  }

  function p52PatchHeader() {
    if (!S || S.pacing !== 'monthly') {
      const old = document.querySelector('.p52-date');
      if (old) old.remove();
      return;
    }
    const top = document.getElementById('top');
    if (!top) return;
    let el = top.querySelector('.p52-date');
    if (!el) {
      el = document.createElement('div');
      el.className = 'p52-date';
      el.style.cssText = 'font-size:.8rem;color:var(--cyan);text-align:right;margin-top:4px;font-weight:600;letter-spacing:.06em';
      top.appendChild(el);
    }
    el.textContent = '📅 ' + p52FormatDate() + '  ·  month ' + p52CurrentMonth() + '/12';
  }

  /* =============================================================
     PART 9 — VIEW: PACING TAB
     ============================================================= */
  function viewPacing() {
    p52Init();
    if (!S) return '';
    const mode = S.pacing || 'yearly';
    const dateStr = mode === 'monthly' ? p52FormatDate() : 'Age ' + S.age + ' · ' + p52CurrentYear();

    let html = '<section class="card"><h3>⏱ Pacing — how fast does time move?</h3>' +
      '<p class="muted">Choose how the game advances. In yearly mode, one click finishes a whole year. In monthly mode, you advance one month at a time and cash flows gradually.</p>' +
      '<div class="row"><span>Current mode</span><b style="color:var(--cyan)">' + (mode === 'monthly' ? 'Monthly' : 'Yearly') + '</b></div>' +
      '<div class="row"><span>Current date</span><b>' + dateStr + '</b></div>' +
      (mode === 'monthly' ? '<div class="row"><span>Months advanced this year</span><b>' + (S.p52.monthlyTicksThisYear || 0) + ' / 12</b></div>' : '') +
      '</section>';

    html += '<section class="card"><h3>Select pacing mode</h3>' +
      '<button class="btn ' + (mode === 'yearly' ? 'sel' : '') + '" onclick="p52SetPacing(\'yearly\')"><b>📆 Yearly mode' + (mode === 'yearly' ? ' — ACTIVE' : '') + '</b><small>One click = one year. Bills hit as a lump sum at year-end.</small></button>' +
      '<button class="btn ' + (mode === 'monthly' ? 'sel' : '') + '" onclick="p52SetPacing(\'monthly\')"><b>📅 Monthly mode' + (mode === 'monthly' ? ' — ACTIVE' : '') + '</b><small>One click = one month. Bills paid gradually.</small></button>' +
      '</section>';

    if (mode === 'monthly') {
      const incomeMonthly = p54LiveIncome() / 12;
      const expensesMonthly = p54LiveExpenses() / 12;
      const net = incomeMonthly - expensesMonthly;
      const netYearly = (S.income || 0) - (S.expenses || 0);

      html += '<section class="card"><h3>📊 Monthly cashflow (live)</h3>' +
        '<div class="row"><span>Yearly income (live)</span><b class="mono" style="color:var(--mint)">' + money(incomeMonthly * 12) + '</b></div>' +
        '<div class="row"><span>Yearly expenses (live)</span><b class="mono" style="color:var(--rose)">' + money(expensesMonthly * 12) + '</b></div>' +
        '<div class="row"><span><b>Yearly net</b></span><b class="mono" style="color:' + (netYearly >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(netYearly) + '</b></div>' +
        '<hr style="border-color:var(--line);margin:10px 0">' +
        '<div class="row"><span>Monthly income</span><b class="mono" style="color:var(--mint)">' + money(incomeMonthly) + '</b></div>' +
        '<div class="row"><span>Monthly expenses</span><b class="mono" style="color:var(--rose)">' + money(expensesMonthly) + '</b></div>' +
        '<div class="row"><span><b>Net per month</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(net) + '</b></div>' +
        '</section>';

      html += '<section class="card"><button class="btn" style="text-align:center;background:var(--violet);color:#fff;font-weight:700" onclick="p52AdvanceMonth()">Next month → ' + p52FormatDate() + '</button></section>';
    }

    html += '<section class="card"><h3>📜 Recent monthly activity</h3>';
    const logEntries = (S.pacingLog || []).slice(-12).reverse();
    if (!logEntries.length) {
      html += '<p class="muted">No monthly activity recorded yet.</p>';
    } else {
      logEntries.forEach(function (entry) {
        html += '<div class="row"><span>' + entry.date + '</span><b class="mono" style="color:' + (entry.net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (entry.net >= 0 ? '+' : '') + money(entry.net) + '</b></div>';
      });
    }
    html += '</section>';

    html += '<section class="card"><h3>ℹ️ What happens monthly vs yearly</h3>' +
      '<div class="row"><span>Salary received</span><b style="color:' + (mode === 'monthly' ? 'var(--mint)' : 'var(--muted)') + '">' + (mode === 'monthly' ? 'Monthly (1/12)' : 'Yearly (lump)') + '</b></div>' +
      '<div class="row"><span>Rent paid</span><b style="color:' + (mode === 'monthly' ? 'var(--mint)' : 'var(--muted)') + '">' + (mode === 'monthly' ? 'Monthly (1/12)' : 'Yearly (lump)') + '</b></div>' +
      '<div class="row"><span>Groceries, phone, transport</span><b style="color:' + (mode === 'monthly' ? 'var(--mint)' : 'var(--muted)') + '">' + (mode === 'monthly' ? 'Monthly (1/12)' : 'Yearly (lump)') + '</b></div>' +
      '<div class="row"><span>Career changes, promotions</span><b>Yearly</b></div>' +
      '<div class="row"><span>Family milestones, pregnancies</span><b>Yearly</b></div>' +
      '<div class="row"><span>Visa decisions</span><b>Yearly</b></div>' +
      '<div class="row"><span>University year completed</span><b>Yearly</b></div>' +
      '<div class="row"><span>Age increases</span><b>Yearly</b></div>' +
      '</section>';

    return html;
  }
  window.viewPacing = viewPacing;

  /* =============================================================
     PART 10 — TAB INJECTION + RENDER ROUTER
     ============================================================= */
  function injectPacingTab() {
    const nav = document.getElementById('tabs');
    if (!nav || nav.querySelector('[data-tab="pacing"]')) return;
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = 'pacing';
    btn.textContent = '⏱ Pacing';
    btn.onclick = function () { activeTab = 'pacing'; render(); };
    nav.appendChild(btn);
  }

  const _render = render;
  render = function () {
    if (S && activeTab === 'pacing') {
      const saved = activeTab;
      activeTab = 'life';
      _render.apply(this, arguments);
      activeTab = saved;
      const view = document.getElementById('view');
      if (view) view.innerHTML = viewPacing();
      const nav = document.getElementById('tabs');
      if (nav) {
        nav.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('on'); });
        const me = nav.querySelector('[data-tab="pacing"]');
        if (me) me.classList.add('on');
      }
      injectPacingTab();
      p52PatchAgeButton();
      p52PatchHeader();
      if (typeof save === 'function') save();
      return;
    }
    const r = _render.apply(this, arguments);
    injectPacingTab();
    p52PatchAgeButton();
    p52PatchHeader();
    return r;
  };

  if (typeof GameHooks !== 'undefined' && GameHooks.on) {
    GameHooks.on('render', function () {
      if (activeTab !== 'pacing') injectPacingTab();
    });
  }

  /* =============================================================
     PART 11 — BPO PROMOTION FIX
     ============================================================= */
  const _askPromotion = askPromotion;
  askPromotion = function () {
    p54EnsureBPOTrack();
    if (!S || !S.job) return _askPromotion.apply(this, arguments);
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
    return _askPromotion.apply(this, arguments);
  };

  /* =============================================================
     PART 12 — CAREER TAB: MONTHLY INCOME SUMMARY
     ============================================================= */
  const _viewCareer = viewCareer;
  viewCareer = function () {
    let html = _viewCareer.apply(this, arguments);
    if (!S || S.age < 18) return html;
    if (S.pacing !== 'monthly') return html;

    const incomeMonthly = p54LiveIncome() / 12;
    const expensesMonthly = p54LiveExpenses() / 12;
    const net = incomeMonthly - expensesMonthly;

    let card = '<section class="card" style="border-color:var(--cyan)">' +
      '<h3>💰 Monthly view (pacing: monthly)</h3>';
    if (S.job) {
      card += '<div class="row"><span>Your job salary (gross)</span><b class="mono" style="color:var(--mint)">' + money(S.job.salary / 12) + '/month</b></div>';
    }
    card += '<div class="row"><span>All income sources</span><b class="mono" style="color:var(--mint)">' + money(incomeMonthly) + '/month</b></div>' +
      '<div class="row"><span>Recurring expenses</span><b class="mono" style="color:var(--rose)">' + money(expensesMonthly) + '/month</b></div>' +
      '<div class="row"><span><b>Net per month</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(net) + '</b></div>' +
      '<p class="muted" style="font-size:.8rem;margin-top:8px">Every click of "Next month" adds this net to your cash.</p>' +
      '</section>';

    const anchor = html.indexOf('ACTIVE MAIN JOB');
    if (anchor !== -1) {
      const sectionEnd = html.indexOf('</section>', anchor);
      if (sectionEnd !== -1) {
        return html.slice(0, sectionEnd + 10) + card + html.slice(sectionEnd + 10);
      }
    }
    return card + html;
  };

  /* =============================================================
     PART 13 — START/LOAD SAFETY + RESET BUTTON
     ============================================================= */
  const _startGame = startGame;
  startGame = function () {
    try { return _startGame.apply(this, arguments); }
    catch (err) {
      console.error('startGame crashed:', err);
      alert('Could not start a new life.\n\nError: ' + (err && err.message ? err.message : err));
    }
  };

  const _loadGame = loadGame;
  loadGame = function () {
    try { return _loadGame.apply(this, arguments); }
    catch (err) {
      console.error('loadGame crashed:', err);
      alert('Could not load your saved game.\n\nError: ' + (err && err.message ? err.message : err));
    }
  };

  function injectResetButton() {
    const start = document.getElementById('start');
    if (!start) return;
    if (start.querySelector('#p53-reset-btn')) return;
    const refBtn = document.getElementById('cont-btn');
    if (!refBtn) return;
    const btn = document.createElement('button');
    btn.id = 'p53-reset-btn';
    btn.className = 'btn';
    btn.style.cssText = 'text-align:center;margin-top:8px;border-color:var(--rose);color:var(--rose)';
    btn.textContent = 'Reset save (delete and start over)';
    btn.onclick = function () {
      if (!confirm('Delete your saved game permanently?\n\nThis cannot be undone.')) return;
      try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
      location.reload();
    };
    refBtn.parentElement.appendChild(btn);
  }

  window.p53ResetSave = function () {
    if (!confirm('Delete save and reload?')) return;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    location.reload();
  };

  setTimeout(injectResetButton, 100);
  setTimeout(injectResetButton, 500);
  if (typeof GameHooks !== 'undefined' && GameHooks.on) {
    GameHooks.on('render', function () {
      const start = document.getElementById('start');
      if (start && !start.classList.contains('hidden')) injectResetButton();
    });
  }

  /* =============================================================
     PART 14 — INIT
     ============================================================= */
  p52Init(S);
  console.log('[p52] Pacing system (Phase 3.7) loaded');
})();
