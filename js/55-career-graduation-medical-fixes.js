/* =====================================================================
   55. FIXES: career crash, graduation popup, medical credit card
   Load AFTER 54-pacing-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p55Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* ============ 1. GUARANTEE BPO SALARY TABLES ============ */
function p55EnsureBPOSalaries() {
  if (typeof EGY_SALARY_2026 !== 'undefined' && !EGY_SALARY_2026.bpo) {
    /* Annual EGP, 2026 reference: agent → site director */
    EGY_SALARY_2026.bpo = [144000, 216000, 336000, 576000, 1080000];
  }
  if (typeof BASE_US_SALARIES !== 'undefined' && !BASE_US_SALARIES.bpo) {
    /* Equivalent US-market rates, used for non-Egypt calculations */
    BASE_US_SALARIES.bpo = [28000, 40000, 60000, 95000, 140000];
  }
  if (typeof CAREER_TITLES !== 'undefined' && !CAREER_TITLES.bpo) {
    CAREER_TITLES.bpo = ['Customer Service Agent', 'Senior Agent / SME', 'Team Leader', 'Operations Manager', 'Site Director'];
  }
  if (typeof TRACKS !== 'undefined' && !TRACKS.bpo) {
    TRACKS.bpo = {
      name: 'Call Center & BPO',
      degree: null,
      levels: [
        { title: 'Customer Service Agent', salary: 12000, hrs: 42, stress: 5, reqSmarts: 20, diploma: false },
        { title: 'Senior Agent / SME', salary: 18000, hrs: 42, stress: 5, reqSmarts: 35, diploma: false },
        { title: 'Team Leader', salary: 28000, hrs: 45, stress: 6, reqSmarts: 50, diploma: false },
        { title: 'Operations Manager', salary: 48000, hrs: 48, stress: 7, reqSmarts: 60, diploma: false },
        { title: 'Site Director', salary: 90000, hrs: 50, stress: 8, reqSmarts: 70, diploma: false }
      ]
    };
  }
}
p55EnsureBPOSalaries();

/* ============ 2. DEFENSIVE salaryForTrack ============ */
const P55_salaryForTrackBefore = salaryForTrack;
salaryForTrack = function (trackId, level, country, year, factor) {
  country = country || (S && S.country) || 'usa';
  year = year || (typeof gameYear === 'function' ? gameYear() : 2026);
  factor = (typeof factor === 'number' && isFinite(factor)) ? factor : 1;
  const ix = Math.max(0, Math.min(4, Number(level) || 0));

  /* Ensure BPO is always available */
  p55EnsureBPOSalaries();

  /* If the track's table entry is missing, synthesize one */
  if (country === 'egy') {
    if (typeof EGY_SALARY_2026 !== 'undefined' && !EGY_SALARY_2026[trackId]) {
      /* Generic Egyptian fallback: base ~120k EGP/year, +80% per level */
      EGY_SALARY_2026[trackId] = [120000, 180000, 280000, 480000, 900000];
    }
  } else {
    if (typeof BASE_US_SALARIES !== 'undefined' && !BASE_US_SALARIES[trackId]) {
      BASE_US_SALARIES[trackId] = [18000, 28000, 45000, 72000, 120000];
    }
  }

  try {
    return P55_salaryForTrackBefore(trackId, level, country, year, factor);
  } catch (err) {
    console.error('salaryForTrack failed for track ' + trackId + ' level ' + level, err);
    /* Safe fallback in internal units */
    const baseEGP = 120000 * Math.pow(1.5, ix);
    const rate = (typeof rateForCountry === 'function') ? rateForCountry(country, year) : 1;
    return Math.round((baseEGP * factor) / Math.max(0.0001, rate));
  }
};

/* Also guard jobSalaryForPost since it uses the same data */
if (typeof jobSalaryForPost === 'function') {
  const P55_jobSalaryForPostBefore = jobSalaryForPost;
  jobSalaryForPost = function (post, level, country, year) {
    try {
      return P55_jobSalaryForPostBefore(post, level, country, year);
    } catch (err) {
      console.error('jobSalaryForPost failed for post', post, err);
      const trackId = (post && post.trackId) || 'entry';
      return salaryForTrack(trackId, level, country, year, (post && post.factor) || 1);
    }
  };
}

/* ============ 3. GRADUATION POPUP — persistent, reliable ============ */
/* Fires the FIRST time you render at age 18+ without having seen it yet. */
function p55CheckGraduationPopup() {
  if (!S) return;
  if (S.age < 18) return;
  if (S.p55GradSeen) return;
  /* Mark as pending if not shown yet */
  if (!S.diploma) {
    /* No diploma path — still one popup */
    S.p55GradSeen = true;
    setTimeout(function () {
      if (typeof p24Popup !== 'function') return;
      p24Popup('High school ended',
        'You left school without a diploma (' + (S.skips || 0) + ' skipped years).\n\n' +
        '• Entry-level jobs are still available in the Career tab\n' +
        '• Some careers require a diploma and will stay locked\n' +
        '• Some employers do not check');
    }, 400);
    return;
  }
  /* With diploma */
  S.p55GradSeen = true;
  setTimeout(function () {
    if (typeof p24Popup !== 'function') return;
    const gpaStr = (S.gpa && S.gpaN) ? S.gpa.toFixed(2) : '0.00';
    const scholarshipNote = (S.gpa >= 3.5) ? '\n\n🎉 Your GPA of ' + gpaStr + ' qualifies you for a 50% university scholarship!' : '';
    p24Popup('🎓 High school graduation',
      'You graduated from high school!\n\n' +
      'Your options now:\n' +
      '• Enrol in a university (Education tab)\n' +
      '• Start working full-time (Career tab)\n' +
      '• Take time to decide\n\n' +
      'GPA: ' + gpaStr + scholarshipNote);
  }, 400);
}

/* Also verify it happens at the moment of graduation */
const P55_ageUpBeforeGrad = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  P55_ageUpBeforeGrad.apply(this, arguments);
  if (!S) return;
  /* Immediate log entry so it's visible even if popup is delayed */
  if (ageBefore === 17 && S.age === 18) {
    if (S.diploma) {
      log('🎓 HIGH SCHOOL GRADUATION — You finished school! Check the Education tab to enrol in a university.');
    } else {
      log('📕 You left school without a diploma. The Career tab has entry-level jobs.');
    }
  }
};

/* ============ 4. MEDICAL BILLS — PAY WITH CREDIT CARD ============ */
const P55_p45PayMedicalBillBefore = p45PayMedicalBill;
p45PayMedicalBill = function (billId, mode) {
  if (mode !== 'credit') return P55_p45PayMedicalBillBefore.apply(this, arguments);

  /* --- Handle credit card payment --- */
  if (!S) return;
  if (!S.bank) S.bank = { score: 680, savingsBal: 0, activeCards: [], primaryCard: null, cardDebt: {}, loans: [], missedPmts: 0 };
  if (!Array.isArray(S.bank.activeCards) || !S.bank.activeCards.length) {
    return hint('You need an active credit card first. Apply in the Bank tab.');
  }
  const bill = (S.p45 && Array.isArray(S.p45.pendingMedicalBills))
    ? S.p45.pendingMedicalBills.find(function (b) { return b && b.id === billId && !b.resolved; })
    : null;
  if (!bill) return hint('Bill not found or already paid.');

  const rate = p55Rate();
  const internal = bill.egp / rate;

  /* Pick a card with room */
  let cardId = null;
  if (typeof p38PickCard === 'function') {
    cardId = p38PickCard(internal);
  }
  if (!cardId) cardId = S.bank.primaryCard || S.bank.activeCards[0];
  if (!cardId) return hint('No credit card available.');

  const limit = (typeof p38GetLimit === 'function')
    ? p38GetLimit(cardId)
    : Math.max(500, Math.round(((S.job && S.job.salary) || S.income || 0) * 0.25));
  const current = Number(S.bank.cardDebt[cardId]) || 0;
  if (current + internal > limit) {
    return hint('Purchase exceeds credit limit. Limit: ' + money(limit) + ', current balance: ' + money(current) + ', bill: ' + money(internal) + '.');
  }

  /* Charge to card */
  S.bank.cardDebt[cardId] = current + internal;
  bill.resolved = true;
  bill.paidWithCreditCard = true;

  log('Charged ' + bill.egp.toLocaleString() + ' EGP medical bill to credit card. New balance: ' + money(S.bank.cardDebt[cardId]) + '.');
  if (typeof realismNotice === 'function') {
    realismNotice('Charged to credit card', bill.label + ' — ' + bill.egp.toLocaleString() + ' EGP was charged to your credit card. Pay it off or convert to installments in the Bank tab.');
  }

  /* Sick leave still applies */
  if (typeof p45ApplySickLeave === 'function') {
    try { p45ApplySickLeave(bill); } catch (e) {}
  }

  hint();
  render();
};

/* ============ 5. ADD "PAY WITH CREDIT CARD" BUTTON TO MEDICAL BILL UI ============ */
/* We re-render the medical panel adding the button when the player has a credit card */
const P55_viewMedicalBefore = (typeof viewMedical === 'function') ? viewMedical : null;
if (P55_viewMedicalBefore) {
  viewMedical = function () {
    let html = P55_viewMedicalBefore();
    if (!S || S.age < 18) return html;

    /* Only modify if there are pending bills */
    const bills = (S.p45 && Array.isArray(S.p45.pendingMedicalBills))
      ? S.p45.pendingMedicalBills.filter(function (b) { return b && !b.resolved; })
      : [];
    if (!bills.length) return html;

    /* Only offer if player has at least one card with room */
    if (!S.bank || !Array.isArray(S.bank.activeCards) || !S.bank.activeCards.length) return html;

    /* For each pending bill, insert a credit-card button after the existing buttons */
    bills.forEach(function (b) {
      const idEsc = b.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      /* Match the button block for this bill */
      const pattern = new RegExp(
        '(<button class="btn" onclick="p45PayMedicalBill\\(\'' + idEsc + '\',\'installment\'\\)">[\\s\\S]*?<\\/button>)'
      );
      const inject = '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'credit\')">Pay with credit card<small>Charge the full bill, then pay or convert to installments</small></button>';
      if (pattern.test(html)) {
        html = html.replace(pattern, '$1' + inject);
      } else {
        /* Fallback: append after the delay button */
        const delay = new RegExp(
          '(<button class="btn" onclick="p45PayMedicalBill\\(\'' + idEsc + '\',\'skip\'\\)">[\\s\\S]*?<\\/button>)'
        );
        if (delay.test(html)) html = html.replace(delay, '$1' + inject);
      }
    });

    return html;
  };
}

/* ============ 6. ALSO ADD CREDIT CARD AS CHOICE IN MEDICAL EVENT ============ */
(function addMedicalEventCreditChoice() {
  if (typeof EVENTS === 'undefined') return;
  const ev = EVENTS.find(function (e) { return e.id === 'medical'; });
  if (!ev || !Array.isArray(ev.choices)) return;
  /* Only add once */
  if (ev.choices.some(function (c) { return c && c.label === 'Pay with credit card'; })) return;

  ev.choices.push({
    label: 'Pay with credit card',
    cost: function () { return 0; },
    fx: function () {
      if (!S.bank || !Array.isArray(S.bank.activeCards) || !S.bank.activeCards.length) {
        return { msg: 'You need a credit card first. The bill stayed unpaid.', health: -2 };
      }
      const egp = (S.insured ? 5000 : 15000) * ((typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1);
      const internal = egp / p55Rate();

      let cardId = (typeof p38PickCard === 'function') ? p38PickCard(internal) : (S.bank.primaryCard || S.bank.activeCards[0]);
      if (!cardId) return { msg: 'No card with enough room.', health: -2 };
      const limit = (typeof p38GetLimit === 'function') ? p38GetLimit(cardId) : Math.round(((S.job && S.job.salary) || S.income || 0) * 0.25);
      const current = Number(S.bank.cardDebt[cardId]) || 0;
      if (current + internal > limit) {
        return { msg: 'The medical bill exceeds your credit limit. You handled it as best you could.', health: 0 };
      }
      S.bank.cardDebt[cardId] = current + internal;
      return { health: 5, msg: 'Charged ' + egp.toLocaleString() + ' EGP to your credit card. Balance: ' + money(S.bank.cardDebt[cardId]) + '. You recovered.' };
    }
  });
})();

/* ============ 7. HOOKS ============ */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    p55EnsureBPOSalaries();
    p55CheckGraduationPopup();
  });
  GameHooks.on('newGame', function () { p55EnsureBPOSalaries(); });
  GameHooks.on('migrate', function (o) { p55EnsureBPOSalaries(); });
}

/* Run once at load */
p55EnsureBPOSalaries();
setTimeout(p55CheckGraduationPopup, 600);
