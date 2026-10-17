/* =====================================================================
   66. CORE FINANCE — Phase 3.3a consolidation
   Replaces: 66-finance-reality-fix.js, 67-debt-truth-fix.js
   Load AFTER 65-car-ui-fix.js and BEFORE 68-core-fixes.js
   ===================================================================== */

(function p66Core() {
  'use strict';

  function rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

  /* =================================================================
     PART 1 — LIVE INCOME / EXPENSE
     ================================================================= */
  function liveIncome() {
    if (typeof p54LiveIncome === 'function') return p54LiveIncome();
    return Number((typeof S !== 'undefined' && S && S.income) || 0);
  }
  function liveExpenses() {
    if (typeof p54LiveExpenses === 'function') return p54LiveExpenses();
    return Number((typeof S !== 'undefined' && S && S.expenses) || 0);
  }

  /* =================================================================
     PART 2 — DEBT & ASSET CALCULATORS (single source of truth)
     ================================================================= */
  function allDebts() {
    if (!S) return { mortgage: 0, legacyBank: 0, cards: 0, installments: 0, student: 0, total: 0, installmentPlans: [] };
    const mortgage = (S.ownedHomes || []).reduce(function (s, h) {
      return s + Math.max(0, Number(h && h.balance) || 0);
    }, 0);
    const legacyBank = (typeof bankDebt === 'function') ? (bankDebt() || 0) : 0;
    const cards = (S.bank && S.bank.cardDebt) ? Object.values(S.bank.cardDebt).reduce(function (s, v) {
      const n = Number(v); return s + (isFinite(n) && n > 0 ? n : 0);
    }, 0) : 0;
    let installments = 0;
    const plans = [];
    if (S.bank && S.bank.installments) {
      Object.entries(S.bank.installments).forEach(function (pair) {
        const key = pair[0], loan = pair[1];
        if (!loan || Number(loan.remaining) <= 0.5) return;
        installments += Number(loan.remaining);
        plans.push({
          key: key,
          name: loan.name || 'Installment',
          remaining: Number(loan.remaining),
          monthlyPayment: Number(loan.monthlyPayment) || 0,
          monthsLeft: Number(loan.monthsLeft) || 0,
          linkedCarUid: loan.linkedCarUid || null
        });
      });
    }
    const student = Number(S.loan) || 0;
    return { mortgage, legacyBank, cards, installments, student, total: mortgage + legacyBank + cards + installments + student, installmentPlans: plans };
  }

  function allAssets() {
    if (!S) return { cash: 0, savings: 0, invest: 0, nest: 0, usdHold: 0, certs: 0, carValue: 0, property: 0, total: 0 };
    const cash = Number(S.wealth) || 0;
    const savings = Number(S.savings) || 0;
    const invest = Number(S.invest) || 0;
    const nest = Number(S.nest) || 0;
    const usdHold = Number(S.usdHold) || 0;

    let certs = 0;
    (S.certificates || []).forEach(function (c) {
      if (c && !c.matured) certs += Number(c.principalInternal) || ((Number(c.principalEGP) || 0) / rate());
    });
    let carValue = 0;
    (S.cars || []).forEach(function (car) {
      if (!car) return;
      if (typeof p65CarValueInternal === 'function') carValue += p65CarValueInternal(car);
      else carValue += Number(car.value) || Number(car.msrp) || 0;
    });
    const property = (typeof propertyValueTotal === 'function') ? (propertyValueTotal() || 0) : 0;
    return { cash, savings, invest, nest, usdHold, certs, carValue, property, total: cash + savings + invest + nest + usdHold + certs + carValue + property };
  }

  function trueNetWorth() {
    const a = allAssets();
    const d = allDebts();
    return a.total - d.total;
  }
  netWorth = trueNetWorth;
  window.p66AllDebts = allDebts;
  window.p66AllAssets = allAssets;

  /* =================================================================
     PART 3 — ORPHAN LOAN CLEANUP
     ================================================================= */
  function cleanOrphanLoans() {
    if (!S || !S.bank || !S.bank.installments || !Array.isArray(S.cars)) return 0;
    const owned = {};
    S.cars.forEach(function (c) { if (c && c.uid) owned[c.uid] = true; });
    let cleaned = 0;
    Object.keys(S.bank.installments).forEach(function (key) {
      const loan = S.bank.installments[key];
      if (!loan) return;
      if (loan.linkedCarUid && !owned[loan.linkedCarUid]) {
        const name = loan.name || 'Car loan';
        const rem = Math.round((Number(loan.remaining) || 0) * rate());
        if (rem > 100 && typeof log === 'function') {
          log('🧹 Cleaned orphaned loan "' + name + '" — car no longer owned. E£' + rem.toLocaleString() + ' written off.');
        }
        delete S.bank.installments[key];
        cleaned++;
      }
    });
    if (cleaned) { if (typeof save === 'function') save(); }
    return cleaned;
  }
  setTimeout(cleanOrphanLoans, 300);
  setTimeout(cleanOrphanLoans, 1500);

  /* =================================================================
     PART 4 — CAR LOAN DEBT (used by p66 net worth)
     ================================================================= */
  function carLoanDebt() {
    if (!S || !S.bank || !S.bank.installments) return 0;
    let total = 0;
    Object.values(S.bank.installments).forEach(function (l) {
      if (l && l.linkedCarUid && Number(l.remaining) > 0) total += Number(l.remaining);
    });
    return total;
  }

  /* =================================================================
     PART 5 — SELL CAR clears linked loan
     ================================================================= */
  if (typeof p65SellCar === 'function') {
    const _p65 = p65SellCar;
    p65SellCar = function (uid) {
      const car = (S.cars || []).find(function (c) { return c && c.uid === uid; });
      if (!car) return _p65.apply(this, arguments);
      let loanKey = car.loanKey;
      if (!loanKey && S.bank && S.bank.installments) {
        const m = Object.keys(S.bank.installments).find(function (k) {
          return S.bank.installments[k] && S.bank.installments[k].linkedCarUid === uid;
        });
        if (m) loanKey = m;
      }
      const r = _p65.apply(this, arguments);
      if (loanKey && S.bank && S.bank.installments && S.bank.installments[loanKey]) {
        delete S.bank.installments[loanKey];
        if (typeof log === 'function') log('🚗 Cleared car loan for ' + car.make + ' ' + car.name + '.');
      }
      return r;
    };
  }

  /* =================================================================
     PART 6 — CERTIFICATES: yearsHeld advances with absolute months
     ================================================================= */
  function updateCertYears() {
    if (!S || !S.certificates || !S.certificates.length) return;
    const abs = Number(S.pacingAbsoluteMonth) || 0;
    S.certificates.forEach(function (c) {
      if (!c || c.matured) return;
      if (typeof c.startedAbsMonth !== 'number') {
        c.startedAbsMonth = abs;
        c.startedYear = c.startedYear || gameYear();
      }
      const months = Math.max(0, abs - c.startedAbsMonth);
      const computed = Math.floor(months / 12);
      if (computed > (c.yearsHeld || 0)) {
        c.yearsHeld = Math.min(computed, c.yearsTotal || 3);
      }
    });
  }
  if (typeof GameHooks !== 'undefined' && GameHooks.on) {
    GameHooks.on('render', updateCertYears);
  }
  setTimeout(updateCertYears, 500);
  setTimeout(updateCertYears, 2000);

  /* =================================================================
     PART 7 — viewMoney: master Assets vs Liabilities table
     ================================================================= */
  const _viewMoney = viewMoney;
  viewMoney = function () {
    let html = _viewMoney.apply(this, arguments);
    if (!S || S.age < 18) return html;

    const r = rate();
    const a = allAssets();
    const d = allDebts();
    const nw = a.total - d.total;

    /* Remove contradictions */
    html = html.replace(/<p class="muted">You have no outstanding debt\.<\/p>/g, '');
    html = html.replace(/You have no outstanding debt\./g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>Debt breakdown<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>Debt — actionable<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📱 Active installment & card debt<\/h3>[\s\S]*?<\/section>/g, '');

    const master =
      '<section class="card" style="border-color:var(--cyan)">' +
      '<h3>💰 Financial Overview</h3>' +
      '<h4 style="font-size:.78rem;color:var(--cyan);margin:10px 0 4px">ASSETS</h4>' +
      '<div class="row" style="padding:3px 0"><span>Cash</span><b class="mono">E£' + Math.round(a.cash * r).toLocaleString() + '</b></div>' +
      (a.savings > 0 ? '<div class="row" style="padding:3px 0"><span>Savings</span><b class="mono">E£' + Math.round(a.savings * r).toLocaleString() + '</b></div>' : '') +
      (a.invest > 0 ? '<div class="row" style="padding:3px 0"><span>Investments</span><b class="mono">E£' + Math.round(a.invest * r).toLocaleString() + '</b></div>' : '') +
      (a.nest > 0 ? '<div class="row" style="padding:3px 0"><span>Retirement pot</span><b class="mono">E£' + Math.round(a.nest * r).toLocaleString() + '</b></div>' : '') +
      (a.usdHold > 0 ? '<div class="row" style="padding:3px 0"><span>USD held</span><b class="mono">$' + Math.round(a.usdHold).toLocaleString() + '</b></div>' : '') +
      (a.certs > 0 ? '<div class="row" style="padding:3px 0"><span>Deposit certificates</span><b class="mono" style="color:var(--mint)">E£' + Math.round(a.certs * r).toLocaleString() + '</b></div>' : '') +
      (a.carValue > 0 ? '<div class="row" style="padding:3px 0"><span>Cars (market value)</span><b class="mono">E£' + Math.round(a.carValue * r).toLocaleString() + '</b></div>' : '') +
      (a.property > 0 ? '<div class="row" style="padding:3px 0"><span>Property (net equity)</span><b class="mono">E£' + Math.round(a.property * r).toLocaleString() + '</b></div>' : '') +
      '<div class="row" style="padding:4px 0;border-top:1px solid var(--line);margin-top:4px"><span><b>TOTAL ASSETS</b></span><b class="mono" style="color:var(--mint)">E£' + Math.round(a.total * r).toLocaleString() + '</b></div>' +

      '<h4 style="font-size:.78rem;color:var(--rose);margin:14px 0 4px">LIABILITIES</h4>' +
      (d.mortgage > 0 ? '<div class="row" style="padding:3px 0"><span>Home mortgages</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.mortgage * r).toLocaleString() + '</b></div>' : '') +
      (d.legacyBank > 0 ? '<div class="row" style="padding:3px 0"><span>Bank loans</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.legacyBank * r).toLocaleString() + '</b></div>' : '') +
      (d.cards > 0 ? '<div class="row" style="padding:3px 0"><span>Credit cards</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.cards * r).toLocaleString() + '</b></div>' : '') +
      (d.installments > 0 ? '<div class="row" style="padding:3px 0"><span>Installments (incl. car loans)</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.installments * r).toLocaleString() + '</b></div>' : '') +
      (d.student > 0 ? '<div class="row" style="padding:3px 0"><span>Student loan</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.student * r).toLocaleString() + '</b></div>' : '') +
      (d.total > 0
        ? '<div class="row" style="padding:4px 0;border-top:1px solid var(--line);margin-top:4px"><span><b>TOTAL LIABILITIES</b></span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.total * r).toLocaleString() + '</b></div>'
        : '<p class="muted" style="font-size:.8rem;margin-top:6px">No debt.</p>') +
      '<div class="row" style="padding:8px 0;border-top:2px solid var(--line);margin-top:10px"><span><b>NET WORTH</b></span><b class="mono" style="font-size:1.1rem;color:' + (nw >= 0 ? 'var(--mint)' : 'var(--rose)') + '">E£' + Math.round(nw * r).toLocaleString() + '</b></div>' +
      (nw < 0 ? '<p class="muted" style="font-size:.78rem;margin-top:6px;color:var(--rose)">⚠️ You owe more than you own.</p>' : '') +
      '</section>';

    html = html.replace(/<section class="card"[^>]*>\s*<h3>Financial Overview<\/h3>[\s\S]*?<\/section>/g, '');
    return master + html;
  };

  /* =================================================================
     PART 8 — viewCareer: live income + realistic outlook
     ================================================================= */
  const _viewCareer = viewCareer;
  viewCareer = function () {
    let html = _viewCareer.apply(this, arguments);
    if (!S || S.age < 18) return html;
    const r = rate();
    const inc = liveIncome();
    const exp = liveExpenses();
    const net = inc - exp;
    const ratio = exp > 0 ? inc / exp : 1;
    let label, color, advice;
    if (ratio >= 1.25) { label = 'Comfortable — you are saving money'; color = 'var(--mint)'; advice = 'You have a cushion.'; }
    else if (ratio >= 1.0) { label = 'Just enough — no big cushion'; color = 'var(--amber)'; advice = 'Breaking even.'; }
    else { label = 'Not enough — you are losing money each year'; color = 'var(--rose)'; advice = 'Earn more or cut costs.'; }
    const card = '<section class="card"><h3>Does your income cover your life?</h3>' +
      '<div class="row"><span>Yearly income (live)</span><b class="mono" style="color:var(--mint)">E£' + Math.round(inc * r).toLocaleString() + '</b></div>' +
      '<div class="row"><span>Yearly expenses</span><b class="mono" style="color:var(--rose)">E£' + Math.round(exp * r).toLocaleString() + '</b></div>' +
      '<div class="row"><span><b>Net this year</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (net >= 0 ? '+' : '-') + 'E£' + Math.round(Math.abs(net) * r).toLocaleString() + '</b></div>' +
      '<div class="row"><span><b>Status</b></span><b style="color:' + color + '">' + label + '</b></div>' +
      '<p class="muted" style="font-size:.82rem;margin-top:8px">' + advice + '</p></section>';
    html = html.replace(/<section class="card"><h3>Does your income cover your life\?<\/h3>[\s\S]*?<\/section>/, card);
    html = html.replace(/<div class="row"><span>Job-search outlook<\/span><b>[^<]*<\/b><\/div>/, function () {
      const econ = (S.econ === 'recession') ? 'Weak market — hiring is slow' : (S.econ === 'boom') ? 'Strong market' : 'Steady market';
      return '<div class="row"><span>Job-search outlook</span><b>' + econ + '</b></div>';
    });
    return html;
  };

  /* =================================================================
     PART 9 — Hide broken bits
     ================================================================= */
  const _viewFamily = viewFamily;
  viewFamily = function () {
    let html = _viewFamily.apply(this, arguments);
    if (S && S.age > 25) html = html.replace(/<button[^>]*onclick="famAct\([^)]*'money'[^)]*\)"[^>]*>Ask money<\/button>/g, '');
    return html;
  };

  const _viewSchool = viewSchool;
  viewSchool = function () {
    let html = _viewSchool.apply(this, arguments);
    if (S && S.degree) html = html.replace(/<p class="muted" style="font-size:.85rem">A GPA of 3\.5 or more earns a 50% scholarship when you enrol at university\.<\/p>/g, '');
    return html;
  };

  /* =================================================================
     PART 10 — Garage: clean orphan loans on open
     ================================================================= */
  if (typeof viewCars === 'function') {
    const _viewCars = viewCars;
    viewCars = function () {
      try { cleanOrphanLoans(); } catch (e) {}
      return _viewCars.apply(this, arguments);
    };
  }

  /* =================================================================
     PART 11 — Diagnostics
     ================================================================= */
  window.p66Diag = function () {
    const a = allAssets();
    const d = allDebts();
    const r = rate();
    console.log('=== p66 finance diag ===');
    console.log('ASSETS (EGP):');
    Object.keys(a).forEach(function (k) { if (k !== 'total' && a[k] > 0) console.log('  ' + k + ': E£' + Math.round(a[k] * r).toLocaleString()); });
    console.log('  TOTAL: E£' + Math.round(a.total * r).toLocaleString());
    console.log('LIABILITIES (EGP):');
    Object.keys(d).forEach(function (k) { if (k !== 'total' && k !== 'installmentPlans' && d[k] > 0) console.log('  ' + k + ': E£' + Math.round(d[k] * r).toLocaleString()); });
    console.log('  TOTAL: E£' + Math.round(d.total * r).toLocaleString());
    console.log('NET WORTH: E£' + Math.round((a.total - d.total) * r).toLocaleString());
  };

  /* =================================================================
     PART 12 — INIT
     ================================================================= */
  if (S) { try { cleanOrphanLoans(); } catch (e) {} }
  console.log('[p66] Core finance (Phase 3.3a) loaded');
})();
