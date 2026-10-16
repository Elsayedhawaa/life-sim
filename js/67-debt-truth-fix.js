/* =====================================================================
   67. DEBT TRUTH FIX
   - Rebuilds ALL debt displays from one source
   - Auto-cleans orphaned car loans (linked car no longer owned)
   - Adds "Assets vs Liabilities" table
   - Replaces any surviving "no outstanding debt" that contradicts reality
   Load AFTER 66-finance-reality-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p67Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* ============ 1. SINGLE DEBT CALCULATOR ============ */
function p67AllDebts() {
  if (!S) return { mortgage: 0, legacyBank: 0, cards: 0, installments: 0, student: 0, total: 0, installmentPlans: [] };

  const mortgage = (S.ownedHomes || []).reduce(function (s, h) {
    return s + Math.max(0, Number(h && h.balance) || 0);
  }, 0);

  const legacyBank = (typeof bankDebt === 'function') ? (bankDebt() || 0) : 0;

  const cards = (S.bank && S.bank.cardDebt) ? Object.values(S.bank.cardDebt).reduce(function (s, v) {
    const n = Number(v);
    return s + (isFinite(n) && n > 0 ? n : 0);
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

  const total = mortgage + legacyBank + cards + installments + student;
  return {
    mortgage: mortgage,
    legacyBank: legacyBank,
    cards: cards,
    installments: installments,
    student: student,
    total: total,
    installmentPlans: plans
  };
}
window.p67AllDebts = p67AllDebts;

/* ============ 2. ASSET CALCULATOR ============ */
function p67AllAssets() {
  if (!S) return { cash: 0, savings: 0, invest: 0, nest: 0, usdHold: 0, certs: 0, carValue: 0, property: 0, total: 0 };

  const cash = Number(S.wealth) || 0;
  const savings = Number(S.savings) || 0;
  const invest = Number(S.invest) || 0;
  const nest = Number(S.nest) || 0;
  const usdHold = Number(S.usdHold) || 0;

  let certs = 0;
  (S.certificates || []).forEach(function (c) {
    if (c && !c.matured) certs += Number(c.principalInternal) || ((Number(c.principalEGP) || 0) / p67Rate());
  });

  let carValue = 0;
  (S.cars || []).forEach(function (car) {
    if (!car) return;
    if (typeof p65CarValueInternal === 'function') carValue += p65CarValueInternal(car);
    else carValue += Number(car.value) || Number(car.msrp) || 0;
  });

  const property = (typeof propertyValueTotal === 'function') ? (propertyValueTotal() || 0) : 0;

  const total = cash + savings + invest + nest + usdHold + certs + carValue + property;
  return { cash, savings, invest, nest, usdHold, certs, carValue, property, total };
}

/* ============ 3. TRUE NET WORTH ============ */
function p67TrueNetWorth() {
  const a = p67AllAssets();
  const d = p67AllDebts();
  return a.total - d.total;
}
netWorth = p67TrueNetWorth;

/* ============ 4. ORPHAN LOAN CLEANUP ============ */
function p67CleanOrphanLoans() {
  if (!S || !S.bank || !S.bank.installments || !Array.isArray(S.cars)) return 0;
  const ownedUids = {};
  S.cars.forEach(function (c) { if (c && c.uid) ownedUids[c.uid] = true; });

  let cleaned = 0;
  Object.keys(S.bank.installments).forEach(function (key) {
    const loan = S.bank.installments[key];
    if (!loan) return;
    /* Only care about car-linked loans */
    if (loan.linkedCarUid && !ownedUids[loan.linkedCarUid]) {
      const name = loan.name || 'Car loan';
      const remainingEGP = Math.round((Number(loan.remaining) || 0) * p67Rate());
      if (remainingEGP > 100) {
        log('🧹 Cleaned orphaned loan "' + name + '" — car no longer owned. Remaining ' + remainingEGP.toLocaleString() + ' EGP was written off.');
      } else {
        log('🧹 Cleaned orphaned loan "' + name + '" — car no longer owned.');
      }
      delete S.bank.installments[key];
      cleaned++;
    }
  });
  if (cleaned) save();
  return cleaned;
}
/* Run on load and after every render */
setTimeout(p67CleanOrphanLoans, 300);
setTimeout(p67CleanOrphanLoans, 1500);

/* ============ 5. REBUILD viewMoney — Assets vs Liabilities ============ */
const P67_viewMoneyBefore = viewMoney;
viewMoney = function () {
  let html = P67_viewMoneyBefore.apply(this, arguments);
  if (!S || S.age < 18) return html;

  const rate = p67Rate();
  const a = p67AllAssets();
  const d = p67AllDebts();
  const nw = a.total - d.total;

  /* --- 1. Kill any surviving "You have no outstanding debt" text --- */
  html = html.replace(/<p class="muted">You have no outstanding debt\.<\/p>/g, '');
  html = html.replace(/You have no outstanding debt\./g, '');

  /* --- 2. Kill any "Debt breakdown" card with E£0 --- */
  html = html.replace(
    /<section class="card"[^>]*>\s*<h3>Debt breakdown<\/h3>[\s\S]*?<\/section>/g,
    ''
  );
  html = html.replace(
    /<section class="card"[^>]*>\s*<h3>Debt — actionable<\/h3>[\s\S]*?<\/section>/g,
    ''
  );

  /* --- 3. Build the master Financial Overview --- */
  const masterOverview =
    '<section class="card" style="border-color:var(--cyan)">' +
    '<h3>💰 Financial Overview</h3>' +

    '<h4 style="font-size:.78rem;color:var(--cyan);margin:10px 0 4px">ASSETS</h4>' +
    '<div class="row" style="padding:3px 0"><span>Cash</span><b class="mono">E£' + Math.round(a.cash * rate).toLocaleString() + '</b></div>' +
    (a.savings > 0 ? '<div class="row" style="padding:3px 0"><span>Savings</span><b class="mono">E£' + Math.round(a.savings * rate).toLocaleString() + '</b></div>' : '') +
    (a.invest > 0 ? '<div class="row" style="padding:3px 0"><span>Investments</span><b class="mono">E£' + Math.round(a.invest * rate).toLocaleString() + '</b></div>' : '') +
    (a.nest > 0 ? '<div class="row" style="padding:3px 0"><span>Retirement pot</span><b class="mono">E£' + Math.round(a.nest * rate).toLocaleString() + '</b></div>' : '') +
    (a.usdHold > 0 ? '<div class="row" style="padding:3px 0"><span>USD held</span><b class="mono">$' + Math.round(a.usdHold).toLocaleString() + '</b></div>' : '') +
    (a.certs > 0 ? '<div class="row" style="padding:3px 0"><span>Deposit certificates (principal)</span><b class="mono" style="color:var(--mint)">E£' + Math.round(a.certs * rate).toLocaleString() + '</b></div>' : '') +
    (a.carValue > 0 ? '<div class="row" style="padding:3px 0"><span>Cars (market value)</span><b class="mono">E£' + Math.round(a.carValue * rate).toLocaleString() + '</b></div>' : '') +
    (a.property > 0 ? '<div class="row" style="padding:3px 0"><span>Property (net equity)</span><b class="mono">E£' + Math.round(a.property * rate).toLocaleString() + '</b></div>' : '') +
    '<div class="row" style="padding:4px 0;border-top:1px solid var(--line);margin-top:4px"><span><b>TOTAL ASSETS</b></span><b class="mono" style="color:var(--mint)">E£' + Math.round(a.total * rate).toLocaleString() + '</b></div>' +

    '<h4 style="font-size:.78rem;color:var(--rose);margin:14px 0 4px">LIABILITIES</h4>' +
    (d.mortgage > 0 ? '<div class="row" style="padding:3px 0"><span>Home mortgages</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.mortgage * rate).toLocaleString() + '</b></div>' : '') +
    (d.legacyBank > 0 ? '<div class="row" style="padding:3px 0"><span>Bank loans</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.legacyBank * rate).toLocaleString() + '</b></div>' : '') +
    (d.cards > 0 ? '<div class="row" style="padding:3px 0"><span>Credit cards</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.cards * rate).toLocaleString() + '</b></div>' : '') +
    (d.installments > 0 ? '<div class="row" style="padding:3px 0"><span>Installments (incl. car loans)</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.installments * rate).toLocaleString() + '</b></div>' : '') +
    (d.student > 0 ? '<div class="row" style="padding:3px 0"><span>Student loan</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.student * rate).toLocaleString() + '</b></div>' : '') +
    (d.total > 0
      ? '<div class="row" style="padding:4px 0;border-top:1px solid var(--line);margin-top:4px"><span><b>TOTAL LIABILITIES</b></span><b class="mono" style="color:var(--rose)">-E£' + Math.round(d.total * rate).toLocaleString() + '</b></div>'
      : '<p class="muted" style="font-size:.8rem;margin-top:6px">No debt.</p>'
    ) +

    '<div class="row" style="padding:8px 0;border-top:2px solid var(--line);margin-top:10px"><span><b>NET WORTH</b></span><b class="mono" style="font-size:1.1rem;color:' + (nw >= 0 ? 'var(--mint)' : 'var(--rose)') + '">E£' + Math.round(nw * rate).toLocaleString() + '</b></div>' +

    (nw < 0 ? '<p class="muted" style="font-size:.78rem;margin-top:6px;color:var(--rose)">⚠️ You owe more than you own. Pay down debt or sell assets.</p>' : '') +
    '</section>';

  /* --- 4. Remove the old Financial Overview card (if any) and put ours on top --- */
  html = html.replace(
    /<section class="card"[^>]*>\s*<h3>Financial Overview<\/h3>[\s\S]*?<\/section>/g,
    ''
  );

  /* --- 5. Remove old installment card (P37's) so it doesn't duplicate --- */
  html = html.replace(
    /<section class="card"[^>]*>\s*<h3>📱 Active installment & card debt<\/h3>[\s\S]*?<\/section>/g,
    ''
  );

  /* --- 6. Insert our master card at the top --- */
  return masterOverview + html;
};

/* ============ 6. GARAGE — clear orphan, alert if loan without car ============ */
const P67_viewCarsBefore = viewCars;
viewCars = function () {
  /* Clean orphan loans every time the Cars tab opens */
  try { p67CleanOrphanLoans(); } catch (e) {}
  return P67_viewCarsBefore.apply(this, arguments);
};

/* ============ 7. AUTO-CHECK ON RENDER ============ */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    if (S && S.bank && S.bank.installments) {
      p67CleanOrphanLoans();
    }
  });
}

/* ============ 8. DEBUG HELPER ============ */
window.p67Debug = function () {
  console.log('=== P67 Debt Debug ===');
  const a = p67AllAssets();
  const d = p67AllDebts();
  const rate = p67Rate();
  console.log('ASSETS (EGP):');
  Object.keys(a).forEach(function (k) {
    if (k === 'total') return;
    if (a[k] > 0) console.log('  ' + k + ': E£' + Math.round(a[k] * rate).toLocaleString());
  });
  console.log('  TOTAL: E£' + Math.round(a.total * rate).toLocaleString());
  console.log('LIABILITIES (EGP):');
  Object.keys(d).forEach(function (k) {
    if (k === 'total' || k === 'installmentPlans') return;
    if (d[k] > 0) console.log('  ' + k + ': E£' + Math.round(d[k] * rate).toLocaleString());
  });
  console.log('  TOTAL: E£' + Math.round(d.total * rate).toLocaleString());
  console.log('NET WORTH: E£' + Math.round((a.total - d.total) * rate).toLocaleString());
  console.log('');
  console.log('INSTALLMENT PLANS:');
  d.installmentPlans.forEach(function (p) {
    console.log('  ' + p.name + ' — Remaining E£' + Math.round(p.remaining * rate).toLocaleString() +
      ', Monthly E£' + Math.round(p.monthlyPayment * rate).toLocaleString() +
      ', MonthsLeft ' + p.monthsLeft +
      ', LinkedCar: ' + (p.linkedCarUid || 'none'));
  });
  console.log('');
  console.log('YOUR CARS:');
  (S.cars || []).forEach(function (c) {
    console.log('  ' + c.year + ' ' + c.make + ' ' + c.name + ' (uid: ' + c.uid + ')');
  });
};

console.log('[p67] Debt truth fix loaded');
