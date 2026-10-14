/* =====================================================================
   52. MONTHLY / YEARLY PACING SYSTEM  (v2 — mid-year switch fix)
   Lets the player advance one month or one year at a time.
   In monthly mode, income/expenses are paid 1/12 per month.
   The yearly tick still fires every 12 months (career, family, events).
   Load AFTER 51-bpo-injection.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. STATE ============ */
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
const P52_migrate = migrate;
migrate = function (o) { const r = P52_migrate(o); p52Init(r); return r; };
const P52_newGame = newGame;
newGame = function () { P52_newGame.apply(this, arguments); p52Init(S); };

/* ============ 2. DATE HELPERS ============ */
const P52_MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function p52CurrentMonth() { p52Init(); return Math.max(1, Math.min(12, S.pacingMonth || 1)); }
function p52CurrentYear()  { return (S.born || 2001) + (S.age || 6); }
function p52FormatDate()   { return P52_MONTH_NAMES[p52CurrentMonth() - 1] + ' ' + p52CurrentYear(); }

/* ============ 3. SET MODE (with mid-year switch handling) ============ */
function p52SetPacing(mode) {
  p52Init();
  if (mode !== 'yearly' && mode !== 'monthly') return hint('Invalid pacing mode.');
  if (S.pacing === mode) return hint('Already in ' + mode + ' mode.');

  const yearNet = (S.income || 0) - (S.expenses || 0);
  const monthsElapsed = Math.max(0, Math.min(12, (S.pacingMonth || 1) - 1));

  if (mode === 'monthly') {
    /* Currently yearly. Player has the whole year's net in wealth as a lump.
       Remove the unused portion so it can be paid monthly instead. */
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
      realismNotice('Monthly pacing enabled',
        'Every click pays 1/12 of your yearly income and expenses. Career, family and visa decisions still happen yearly at the 12th month.');
    }
  } else {
    /* Currently monthly. Player has been paid for monthsElapsed months.
       Pay the remaining months as a lump to restore the yearly pattern. */
    const remainingFraction = (12 - monthsElapsed) / 12;
    const toAdd = yearNet * remainingFraction;
    if (Math.abs(toAdd) > 0.01) {
      S.wealth += toAdd;
      log('Switched to YEARLY. ' + money(toAdd) + ' paid as a lump for the remaining months of the year.');
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

/* ============ 4. MONTHLY TICK ============ */
function p52MonthlyTick() {
  p52Init();
  if (!S || S.dead) return;
  if (S.age < 18) return;   /* children have no cashflow */

  const incomeMonthly   = (S.income   || 0) / 12;
  const expensesMonthly = (S.expenses || 0) / 12;
  const net = incomeMonthly - expensesMonthly;

  S.wealth += net;
  S.p52.lastMonthlyIncome   = incomeMonthly;
  S.p52.lastMonthlyExpenses = expensesMonthly;
  S.p52.lastMonthlyNet      = net;
  S.p52.monthlyTicksThisYear = (S.p52.monthlyTicksThisYear || 0) + 1;
}

/* ============ 5. MAIN ENTRY — ADVANCE MONTH ============ */
function p52AdvanceMonth() {
  if (!S) return;
  p52Init();
  if (S.pacing !== 'monthly') return ageUp();
  if (S.pending) return hint('Respond to the event before advancing.');

  /* Apply monthly cashflow + log — only for adults */
  if (S.age >= 18) {
    const incomeMonthly   = (S.income   || 0) / 12;
    const expensesMonthly = (S.expenses || 0) / 12;
    const net             = incomeMonthly - expensesMonthly;

    const dateStr = p52FormatDate();
    S.pacingLog.push({ date: dateStr, income: incomeMonthly, expenses: expensesMonthly, net: net });
    S.pacingLog = S.pacingLog.slice(-24);

    p52MonthlyTick();
  }

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
      /* ageUp applies S.wealth += S.income - S.expenses for the NEW year.
         Undo it because the yearly net was already paid month-by-month. */
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

/* ============ 6. PATCH THE AGE-UP BUTTON ============ */
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

/* ============ 7. HEADER MONTH INDICATOR ============ */
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

/* ============ 8. PACING TAB VIEW ============ */
function viewPacing() {
  p52Init();
  if (!S) return '';
  const mode = S.pacing || 'yearly';
  const dateStr = mode === 'monthly' ? p52FormatDate() : 'Age ' + S.age + ' · ' + p52CurrentYear();

  let html = '<section class="card"><h3>⏱ Pacing — how fast does time move?</h3>' +
    '<p class="muted">Choose how the game advances. In yearly mode, one click finishes a whole year. In monthly mode, you advance one month at a time and cash flows gradually. Your choice applies to <b>everything</b>: rent, salary, food, phone, insurance, mortgage, family support, taxes, retirement contributions, savings, certificates — all split into 12 equal monthly payments.</p>' +
    '<div class="row"><span>Current mode</span><b style="color:var(--cyan)">' + (mode === 'monthly' ? 'Monthly' : 'Yearly') + '</b></div>' +
    '<div class="row"><span>Current date</span><b>' + dateStr + '</b></div>' +
    (mode === 'monthly' ? '<div class="row"><span>Months advanced this year</span><b>' + (S.p52.monthlyTicksThisYear || 0) + ' / 12</b></div>' : '') +
    '</section>';

  html += '<section class="card"><h3>Select pacing mode</h3>' +
    '<button class="btn ' + (mode === 'yearly' ? 'sel' : '') + '" onclick="p52SetPacing(\'yearly\')"><b>📆 Yearly mode' + (mode === 'yearly' ? ' — ACTIVE' : '') + '</b><small>One click = one year. Bills hit as a lump sum at year-end. Fastest play.</small></button>' +
    '<button class="btn ' + (mode === 'monthly' ? 'sel' : '') + '" onclick="p52SetPacing(\'monthly\')"><b>📅 Monthly mode' + (mode === 'monthly' ? ' — ACTIVE' : '') + '</b><small>One click = one month. Bills paid gradually. See each month pass.</small></button>' +
    '</section>';

  if (mode === 'monthly') {
    const incomeMonthly   = (S.income   || 0) / 12;
    const expensesMonthly = (S.expenses || 0) / 12;
    const net             = incomeMonthly - expensesMonthly;
    const netYearly       = (S.income || 0) - (S.expenses || 0);

    html += '<section class="card"><h3>📊 Monthly cashflow</h3>' +
      '<div class="row"><span>Yearly income</span><b class="mono" style="color:var(--mint)">' + money(S.income || 0) + '</b></div>' +
      '<div class="row"><span>Yearly expenses</span><b class="mono" style="color:var(--rose)">' + money(S.expenses || 0) + '</b></div>' +
      '<div class="row"><span><b>Yearly net</b></span><b class="mono" style="color:' + (netYearly >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(netYearly) + '</b></div>' +
      '<hr style="border-color:var(--line);margin:10px 0">' +
      '<div class="row"><span>Monthly income (1/12)</span><b class="mono" style="color:var(--mint)">' + money(incomeMonthly) + '</b></div>' +
      '<div class="row"><span>Monthly expenses (1/12)</span><b class="mono" style="color:var(--rose)">' + money(expensesMonthly) + '</b></div>' +
      '<div class="row"><span><b>Net per month</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(net) + '</b></div>' +
      '<p class="muted" style="font-size:.82rem;margin-top:8px">Every click adds (or subtracts) this monthly amount. Career events, family milestones, pregnancy, visa decisions and promotions still happen once a year at the 12th month.</p>' +
      '</section>';

    /* In-tab advance button */
    html += '<section class="card"><button class="btn" style="text-align:center;background:var(--violet);color:#fff;font-weight:700" onclick="p52AdvanceMonth()">Next month → ' + p52FormatDate() + '</button></section>';
  }

  html += '<section class="card"><h3>📜 Recent monthly activity</h3>';
  const log = (S.pacingLog || []).slice(-12).reverse();
  if (!log.length) {
    html += '<p class="muted">No monthly activity recorded yet.</p>';
  } else {
    log.forEach(function (entry) {
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

/* ============ 9. INJECT THE TAB BUTTON ============ */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    const nav = document.getElementById('tabs');
    if (!nav || nav.querySelector('[data-tab="pacing"]')) return;
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = 'pacing';
    btn.textContent = '⏱ Pacing';
    btn.onclick = function () { activeTab = 'pacing'; render(); };
    nav.appendChild(btn);
  });
}

/* ============ 10. ROUTE THE TAB + PATCH BUTTON/HEADER ============ */
const P52_renderBefore = render;
render = function () {
  if (S && activeTab === 'pacing') {
    const saved = activeTab;
    activeTab = 'life';
    P52_renderBefore.apply(this, arguments);
    activeTab = saved;
    const view = document.getElementById('view');
    if (view) view.innerHTML = viewPacing();
    const nav = document.getElementById('tabs');
    if (nav) {
      nav.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('on'); });
      const me = nav.querySelector('[data-tab="pacing"]');
      if (me) me.classList.add('on');
    }
    p52PatchAgeButton();
    p52PatchHeader();
    if (typeof save === 'function') save();
    return;
  }
  const r = P52_renderBefore.apply(this, arguments);
  p52PatchAgeButton();
  p52PatchHeader();
  return r;
};

/* ============ 11. INIT ============ */
p52Init(S);
