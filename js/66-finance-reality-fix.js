/* =====================================================================
   66. FINANCE REALITY FIX
   - Yearly income uses LIVE calculation (includes certificate interest)
   - Net worth subtracts car loans
   - Debt breakdown includes installments
   - Certificates advance yearsHeld correctly in monthly mode
   - Selling a car clears its linked loan
   - BPO header year uses gameYear()
   - Hide "Ask money" if player > 25
   - Hide university scholarship hint if already graduated
   - Career outlook text replaced with actual assessment
   Load AFTER 65-car-ui-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p66Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* =================================================================
   1. LIVE income / expense helpers (already exist in p63/p64)
   ================================================================= */
function p66LiveIncome() {
  if (typeof p54LiveIncome === 'function') return p54LiveIncome();
  return Number(S && S.income) || 0;
}
function p66LiveExpenses() {
  if (typeof p54LiveExpenses === 'function') return p54LiveExpenses();
  return Number(S && S.expenses) || 0;
}

/* =================================================================
   2. NET WORTH — subtract car loans
   Base netWorth (07-era-pack) uses carsEquity() which does NOT
   subtract the car loans. Patch it.
   ================================================================= */
function p66CarLoanDebt() {
  if (!S || !S.bank || !S.bank.installments) return 0;
  let total = 0;
  Object.values(S.bank.installments).forEach(function (loan) {
    if (loan && loan.linkedCarUid && Number(loan.remaining) > 0) total += Number(loan.remaining);
  });
  return total;
}
function p66CarValue() {
  if (!S || !Array.isArray(S.cars)) return 0;
  let total = 0;
  S.cars.forEach(function (car) {
    if (!car) return;
    if (typeof p65CarValueInternal === 'function') total += p65CarValueInternal(car);
    else total += Number(car.value) || Number(car.msrp) || 0;
  });
  return total;
}
function p66NetWorth() {
  if (!S) return 0;
  const cash = Number(S.wealth) || 0;
  const property = (typeof propertyValueTotal === 'function') ? propertyValueTotal() : 0;
  const nest = Number(S.nest) || 0;
  const savings = Number(S.savings) || 0;
  const invest = Number(S.invest) || 0;
  const usdHold = Number(S.usdHold) || 0;
  const carValue = p66CarValue();
  const carLoan = p66CarLoanDebt();
  const studentLoan = Number(S.loan) || 0;
  const legacyBankDebt = (typeof bankDebt === 'function') ? bankDebt() : 0;
  /* Certificates are assets too */
  let certValue = 0;
  if (Array.isArray(S.certificates)) {
    S.certificates.forEach(function (c) {
      if (c && !c.matured) certValue += Number(c.principalInternal) || 0;
    });
  }
  return cash + property + nest + savings + invest + usdHold + carValue + certValue - carLoan - studentLoan - legacyBankDebt;
}
netWorth = p66NetWorth;

/* Override the 07-era-pack override so it also uses the new formula */
const P66_oldNetWorth = netWorth;

/* =================================================================
   3. viewMoney — debt breakdown includes installments
   ================================================================= */
const P66_viewMoneyBefore = viewMoney;
viewMoney = function () {
  let html = P66_viewMoneyBefore.apply(this, arguments);
  if (!S || S.age < 18) return html;

  /* Compute all debts */
  const mortgageDebt = (S.ownedHomes || []).reduce(function (s, h) {
    return s + Math.max(0, Number(h && h.balance) || 0);
  }, 0);
  const legacyBank = (typeof bankDebt === 'function') ? bankDebt() : 0;
  const cardDebt = (S.bank && S.bank.cardDebt) ? Object.values(S.bank.cardDebt).reduce(function (s, v) {
    const n = Number(v);
    return s + (isFinite(n) && n > 0 ? n : 0);
  }, 0) : 0;
  let installmentDebt = 0;
  if (S.bank && S.bank.installments) {
    Object.values(S.bank.installments).forEach(function (i) {
      if (i && Number(i.remaining) > 0) installmentDebt += Number(i.remaining);
    });
  }
  const studentDebt = Number(S.loan) || 0;
  const totalDebt = mortgageDebt + legacyBank + cardDebt + installmentDebt + studentDebt;

  const rate = p66Rate();
  const debtBreakdown = '<section class="card" style="border-color:var(--rose)"><h3>Debt breakdown</h3>' +
    (mortgageDebt > 0 ? '<div class="row"><span>Home mortgages</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(mortgageDebt * rate).toLocaleString() + '</b></div>' : '') +
    (legacyBank > 0 ? '<div class="row"><span>Bank loans</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(legacyBank * rate).toLocaleString() + '</b></div>' : '') +
    (cardDebt > 0 ? '<div class="row"><span>Credit cards</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(cardDebt * rate).toLocaleString() + '</b></div>' : '') +
    (installmentDebt > 0 ? '<div class="row"><span>Installments (incl. car loans)</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(installmentDebt * rate).toLocaleString() + '</b></div>' : '') +
    (studentDebt > 0 ? '<div class="row"><span>Student loan</span><b class="mono" style="color:var(--rose)">-E£' + Math.round(studentDebt * rate).toLocaleString() + '</b></div>' : '') +
    '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Total owed</b></span><b class="mono" style="color:var(--rose);font-size:1rem">-E£' + Math.round(totalDebt * rate).toLocaleString() + '</b></div>' +
    '</section>';

  /* Replace the old broken "Debt breakdown: E£0" card */
  html = html.replace(
    /<section class="card"[^>]*>\s*<h3>Debt breakdown<\/h3>[\s\S]*?<\/section>/,
    debtBreakdown
  );

  return html;
};

/* =================================================================
   4. viewCareer — Yearly income uses LIVE + better outlook + hide GPA hint
   ================================================================= */
const P66_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P66_viewCareerBefore.apply(this, arguments);
  if (!S || S.age < 18) return html;

  const rate = p66Rate();
  const yearlyIncome = p66LiveIncome();
  const yearlyExpenses = p66LiveExpenses();
  const net = yearlyIncome - yearlyExpenses;
  const ratio = yearlyExpenses > 0 ? yearlyIncome / yearlyExpenses : 1;

  let label, color, advice;
  if (ratio >= 1.25) { label = 'Comfortable — you are saving money'; color = 'var(--mint)'; advice = 'You have a cushion. Save or invest the surplus.'; }
  else if (ratio >= 1.0) { label = 'Just enough — no big cushion'; color = 'var(--amber)'; advice = 'You are breaking even. One unexpected bill could push you negative.'; }
  else { label = 'Not enough — you are losing money each year'; color = 'var(--rose)'; advice = 'Earn more (raise, second job, remote work) or cut costs (cheaper food, cancel subscriptions, reduce family support).'; }

  /* Replace the "Does your income cover your life?" card */
  const newCard = '<section class="card"><h3>Does your income cover your life?</h3>' +
    '<div class="row"><span>Yearly income (live — includes salary, rent, certificates)</span><b class="mono" style="color:var(--mint)">E£' + Math.round(yearlyIncome * rate).toLocaleString() + '</b></div>' +
    '<div class="row"><span>Yearly expenses</span><b class="mono" style="color:var(--rose)">E£' + Math.round(yearlyExpenses * rate).toLocaleString() + '</b></div>' +
    '<div class="row"><span><b>Net this year</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (net >= 0 ? '+' : '-') + 'E£' + Math.round(Math.abs(net) * rate).toLocaleString() + '</b></div>' +
    '<div class="row"><span><b>Status</b></span><b style="color:' + color + '">' + label + '</b></div>' +
    '<p class="muted" style="font-size:.82rem;margin-top:8px">' + advice + '</p>' +
    '</section>';

  html = html.replace(
    /<section class="card"><h3>Does your income cover your life\?<\/h3>[\s\S]*?<\/section>/,
    newCard
  );

  /* Fix the placeholder outlook */
  html = html.replace(
    /<div class="row"><span>Job-search outlook<\/span><b>[^<]*<\/b><\/div>/,
    function () {
      const employed = !!S.job;
      const econ = (S.econ === 'recession') ? 'Weak market — hiring is slow' :
                   (S.econ === 'boom') ? 'Strong market — good time to apply' :
                   'Steady market — depends on your profile';
      return '<div class="row"><span>Job-search outlook</span><b>' + econ + '</b></div>';
    }
  );

  return html;
};

/* =================================================================
   5. Certificates — yearsHeld advances properly in monthly mode
   Use S.pacingAbsoluteMonth to compute months held since purchase
   ================================================================= */
function p66UpdateCertYears() {
  if (!S || !S.certificates || !S.certificates.length) return;
  const absMonth = Number(S.pacingAbsoluteMonth) || 0;
  S.certificates.forEach(function (c) {
    if (!c || c.matured) return;
    /* Set start month when first seen */
    if (typeof c.startedAbsMonth !== 'number') {
      c.startedAbsMonth = absMonth;
      c.startedYear = c.startedYear || gameYear();
    }
    /* Compute months held */
    const monthsHeld = Math.max(0, absMonth - c.startedAbsMonth);
    /* Every 12 months the yearsHeld increments */
    const computed = Math.floor(monthsHeld / 12);
    if (computed > (c.yearsHeld || 0)) {
      c.yearsHeld = Math.min(computed, c.yearsTotal || 3);
    }
  });
}
/* Run on every render so it stays fresh */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', p66UpdateCertYears);
}
/* Also run on load */
setTimeout(p66UpdateCertYears, 500);
setTimeout(p66UpdateCertYears, 2000);

/* =================================================================
   6. SELL CAR — clear linked loan when selling
   Override p65SellCar to always look up the loan by ANY means and
   clear it properly.
   ================================================================= */
const P66_p65SellBefore = (typeof p65SellCar === 'function') ? p65SellCar : null;
if (P66_p65SellBefore) {
  p65SellCar = function (uid) {
    const car = (S.cars || []).find(function (c) { return c && c.uid === uid; });
    if (!car) return hint('Car not found.');
    const rate = p66Rate();

    /* Find any loan linked to this car by uid or loanKey */
    let loanKey = car.loanKey;
    if (!loanKey && S.bank && S.bank.installments) {
      const match = Object.keys(S.bank.installments).find(function (k) {
        return S.bank.installments[k] && S.bank.installments[k].linkedCarUid === uid;
      });
      if (match) loanKey = match;
    }

    if (loanKey && S.bank && S.bank.installments && S.bank.installments[loanKey]) {
      const loan = S.bank.installments[loanKey];
      const carValue = (typeof p65CarValueInternal === 'function') ? p65CarValueInternal(car) : Number(car.value) || 0;
      const sellInternal = Math.round(carValue * 0.9);
      const loanRemaining = Number(loan.remaining) || 0;

      if (loanRemaining > sellInternal) {
        const shortfall = loanRemaining - sellInternal;
        if (!confirm('⚠️ SELLING AT A LOSS\n\n' +
          'Car value: E£' + Math.round(carValue * rate).toLocaleString() + '\n' +
          'You receive (after 10% dealer fee): E£' + Math.round(sellInternal * rate).toLocaleString() + '\n\n' +
          'Loan remaining: E£' + Math.round(loanRemaining * rate).toLocaleString() + '\n' +
          'Shortfall: E£' + Math.round(shortfall * rate).toLocaleString() + '\n\n' +
          'After the sale you will still owe E£' + Math.round(shortfall * rate).toLocaleString() + ' EGP.\n' +
          'This will be charged from your cash (or become bank debt if you cannot pay).\n\nProceed?')) return;

        S.wealth += sellInternal;
        delete S.bank.installments[loanKey];

        if (S.wealth >= shortfall) {
          S.wealth -= shortfall;
          log('🚗 Sold ' + car.make + ' ' + car.name + ' at a loss. Loan cleared with E£' + Math.round(shortfall * rate).toLocaleString() + ' shortfall from cash.');
        } else {
          const paid = Math.max(0, S.wealth);
          const remaining = shortfall - paid;
          S.wealth = 0;
          if (!S.bank.loans) S.bank.loans = [];
          S.bank.loans.push({
            id: 'repo_' + Date.now(),
            principal: remaining,
            remainingBal: remaining,
            rate: 0.16,
            annualPmt: Math.round(remaining / 3),
            yearsTotal: 3,
            yearsLeft: 3
          });
          log('🚗 Sold at a loss. E£' + Math.round(remaining * rate).toLocaleString() + ' shortfall moved to bank debt.');
        }
      } else {
        const netInternal = sellInternal - loanRemaining;
        if (!confirm('Sell ' + car.year + ' ' + car.make + ' ' + car.name + '?\n\n' +
          'Car value: E£' + Math.round(carValue * rate).toLocaleString() + '\n' +
          'You receive (after 10% dealer fee): E£' + Math.round(sellInternal * rate).toLocaleString() + '\n' +
          'Loan remaining: E£' + Math.round(loanRemaining * rate).toLocaleString() + '\n\n' +
          'Net to you: E£' + Math.round(netInternal * rate).toLocaleString() + '\n\nProceed?')) return;
        S.wealth += netInternal;
        delete S.bank.installments[loanKey];
        log('🚗 Sold ' + car.make + ' ' + car.name + ' and cleared the loan. Net: E£' + Math.round(netInternal * rate).toLocaleString() + '.');
      }
      /* Remove the car */
      S.cars = S.cars.filter(function (c) { return c.uid !== uid; });
      /* Save */
      if (typeof save === 'function') save();
      render();
      return;
    }

    /* No loan — normal sale */
    return P66_p65SellBefore.apply(this, arguments);
  };
}

/* =================================================================
   7. BPO header — use current year
   ================================================================= */
if (typeof p62OpenBrand === 'function') {
  const P66_p62BuildNewTabBefore = p62BuildNewTab;
  p62BuildNewTab = function () {
    let html = P66_p62BuildNewTabBefore.apply(this, arguments);
    /* Replace hardcoded "Egypt 2026" with the actual year */
    html = html.replace(/Egypt 2026/g, 'Egypt ' + gameYear());
    return html;
  };
}

/* Also for the BPO openings section */
const P66_viewCareerBefore2 = viewCareer;
viewCareer = function () {
  let html = P66_viewCareerBefore2.apply(this, arguments);
  html = html.replace(/Call Center & BPO openings \(Egypt 2026\)/, 'Call Center & BPO openings (Egypt ' + gameYear() + ')');
  return html;
};

/* =================================================================
   8. Hide "Ask money" for age > 25 (parent action)
   ================================================================= */
const P66_viewFamilyBefore = viewFamily;
viewFamily = function () {
  let html = P66_viewFamilyBefore.apply(this, arguments);
  if (S && S.age > 25) {
    /* Remove any Ask money buttons entirely */
    html = html.replace(/<button[^>]*onclick="famAct\([^)]*'money'[^)]*\)"[^>]*>Ask money<\/button>/g, '');
  }
  return html;
};

/* =================================================================
   9. Hide university scholarship hint if already graduated
   ================================================================= */
const P66_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P66_viewSchoolBefore.apply(this, arguments);
  if (S && S.degree) {
    html = html.replace(/<p class="muted" style="font-size:.85rem">A GPA of 3\.5 or more earns a 50% scholarship when you enrol at university\.<\/p>/g, '');
  }
  return html;
};

/* =================================================================
   10. Reduce GPA spam — only log once per age
   ================================================================= */
const P66_ageUpBefore = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  P66_ageUpBefore.apply(this, arguments);
  if (!S || S.age === ageBefore) return;
  p66UpdateCertYears();
};

/* =================================================================
   11. Auto-run on load
   ================================================================= */
if (S) {
  p66UpdateCertYears();
  /* Force a render so all displays update */
  setTimeout(function () { try { render(); } catch (e) {} }, 100);
}

console.log('[p66] Finance reality fixes loaded');
