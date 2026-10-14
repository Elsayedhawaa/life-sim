/* =====================================================================
   45. MEDICAL ↔ WORK ↔ LOANS INTEGRATION
   - "Where do I live?" banner on Assets tab (fixed injection)
   - Ask employer for medical insurance (they can agree/refuse)
   - Medical events: illness, accidents, surgery → linked to Medical tab
   - Sick leave affects vacation days and pay
   - Pay student loan: partial, custom amount, or full
   Load AFTER 44-flow-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p45Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p45Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* ============ 1. STATE ============ */
function p45Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p45 || typeof o.p45 !== 'object') {
    o.p45 = {
      employerInsuranceAsked: -1,   /* year of last ask */
      employerInsurance: false,     /* true if employer agreed */
      employerInsuranceRefused: [], /* list of years refused */
      pendingMedicalBills: [],      /* [{id,label,egp,severity,requiresSurgery,requiresMeds,createdYear}] */
      sickLeaveUsed: 0,
      unpaidLeaveDays: 0
    };
  }
  if (!Array.isArray(o.p45.pendingMedicalBills)) o.p45.pendingMedicalBills = [];
  if (!Array.isArray(o.p45.employerInsuranceRefused)) o.p45.employerInsuranceRefused = [];
}
const P45_migrate = migrate;
migrate = function (o) { const r = P45_migrate(o); p45Init(r); return r; };
const P45_newGame = newGame;
newGame = function () { P45_newGame.apply(this, arguments); p45Init(S); };

/* ============ 2. WHERE DO I LIVE — fixed banner ============ */
function p45CurrentHomeInfo() {
  if (!S) return { name: 'Unknown', status: 'unknown', color: 'var(--muted)' };
  if (S.housing === 'parents') return { name: "Parents' home", status: 'Living with family', color: 'var(--cyan)' };
  if (!S.housing) return { name: 'No fixed address', status: 'Homeless', color: 'var(--rose)' };
  const own = (S.ownedHomes || []).find(function (h) { return h && h.id === S.housing; });
  if (own) {
    return {
      name: own.name,
      status: 'Living in your own property (' + (own.cond || 100) + '% condition)',
      color: 'var(--mint)'
    };
  }
  if (typeof HOUSING_CATALOG !== 'undefined') {
    const cat = HOUSING_CATALOG.find(function (c) { return c.id === S.housing && c.kind === 'rent'; });
    if (cat) {
      const rent = (typeof rentCost === 'function') ? rentCost(cat) : 0;
      return { name: cat.name, status: 'Renting — ' + money(rent) + '/year', color: 'var(--amber)' };
    }
  }
  return { name: 'Unknown', status: 'housing state missing', color: 'var(--muted)' };
}

function p45HomeBanner() {
  const info = p45CurrentHomeInfo();
  return '<section class="card" style="padding:14px;border:2px solid ' + info.color + ';background:linear-gradient(160deg,rgba(139,92,246,.08),var(--card))">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
    '<div style="min-width:0;flex:1">' +
    '<div style="font-size:.72rem;letter-spacing:.08em;color:var(--muted);font-weight:700">🏠 YOU CURRENTLY LIVE IN</div>' +
    '<div style="font-size:1.15rem;font-weight:700;margin-top:4px;color:' + info.color + '">' + info.name + '</div>' +
    '<div class="muted" style="font-size:.85rem;margin-top:2px">' + info.status + '</div>' +
    '</div></div></section>';
}

/* Override viewAssets to prepend the banner unconditionally */
const P45_viewAssetsBefore = viewAssets;
viewAssets = function () {
  let html = P45_viewAssetsBefore();
  /* Remove any existing (stale) where-do-i-live banner to avoid duplication */
  html = html.replace(/<section class="card"[^>]*>\s*<div[^>]*>\s*<div[^>]*>YOU CURRENTLY LIVE IN[\s\S]*?<\/section>/g, '');
  return p45HomeBanner() + html;
};

/* Also show a compact banner on Life tab */
const P45_viewLifeBefore = viewLife;
viewLife = function () {
  let html = P45_viewLifeBefore();
  html = html.replace(/<section class="card"[^>]*>\s*<div[^>]*>\s*<div[^>]*>YOU CURRENTLY LIVE IN[\s\S]*?<\/section>/g, '');
  return p45HomeBanner() + html;
};

/* ============ 3. ASK EMPLOYER FOR MEDICAL INSURANCE ============ */
function p45AskEmployerInsurance() {
  p45Init();
  if (!S || S.age < 18) return hint('You need a job first.');
  if (!S.job) return hint('You need a full-time job.');
  if (S.p45.employerInsurance) return hint('Your employer already provides medical coverage.');
  if (S.p45.employerInsuranceAsked === gameYear()) return hint('You already asked this year.');

  S.p45.employerInsuranceAsked = gameYear();

  /* Chance depends on company tier, seniority, performance */
  const seniority = Math.max(0, Number(S.job.level) || 0) / 4;
  const perf = Math.max(0, Number(S.job.perf) || 0) / 100;
  const tenure = Math.min(0.2, (Number(S.job.years) || 0) * 0.03);
  const econ = S.econ === 'recession' ? -0.15 : S.econ === 'boom' ? 0.08 : 0;
  const baseChance = 0.25 + seniority * 0.30 + perf * 0.20 + tenure + econ;
  const chance = Math.max(0.05, Math.min(0.85, baseChance));

  if (Math.random() < chance) {
    S.p45.employerInsurance = true;
    if (S.job.benefits) S.job.benefits.medical = true;
    fx({ happiness: 8 });
    log('Your employer approved medical insurance coverage as part of your benefits.');
    if (typeof p24Popup === 'function') {
      p24Popup('Employer approved insurance',
        'HR agreed to add medical coverage to your contract. From now on, medical bills are covered at 75% up to ' + money(150000) + ' per year.');
    }
    realismNotice('Employer medical coverage', 'Your job now includes medical insurance. It covers 75% of medical bills up to 150,000 EGP per year.');
  } else {
    S.p45.employerInsuranceRefused.push(gameYear());
    if (S.job) S.job.perf = Math.max(0, (Number(S.job.perf) || 0) - 2);
    fx({ happiness: -3 });
    const reasons = [
      'HR said medical coverage is only for senior management at this time.',
      'The company has a hiring freeze and cannot add new benefits.',
      'Your manager said the benefits package was fixed at signing.'
    ];
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    log('Your employer refused medical insurance. ' + reason);
    if (typeof p24Popup === 'function') {
      p24Popup('Employer refused', reason + ' You can try again next year, or buy private insurance in the Medical tab.');
    }
  }
  render();
}
window.p45AskEmployerInsurance = p45AskEmployerInsurance;

/* Add the button to Career tab */
const P45_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P45_viewCareerBefore();
  p45Init();
  if (!S || S.age < 18 || !S.job) return html;

  const hasInsurance = S.p45.employerInsurance || (S.job.benefits && S.job.benefits.medical);
  if (hasInsurance) return html;

  const askedThisYear = S.p45.employerInsuranceAsked === gameYear();
  const card = '<section class="card" style="border-color:var(--amber)"><h3>💊 Ask for employer medical insurance</h3>' +
    '<p class="muted">Your current job does not include medical coverage. In Egypt, employer-provided insurance typically covers 75% of medical bills up to 150,000 EGP/year. You can ask your HR or manager once per year.</p>' +
    '<div class="row"><span>Your seniority</span><b>' + ((Number(S.job.level) || 0) + 1) + '/5</b></div>' +
    '<div class="row"><span>Performance</span><b>' + (Number(S.job.perf) || 0) + '%</b></div>' +
    '<div class="row"><span>Tenure</span><b>' + (Number(S.job.years) || 0) + ' year(s)</b></div>' +
    '<p class="muted" style="font-size:.82rem">' + (askedThisYear ? 'You already asked this year.' : 'The chance of approval depends on seniority, performance and the economy.') + '</p>' +
    '<button class="btn" ' + (askedThisYear ? 'disabled' : '') + ' onclick="p45AskEmployerInsurance()">' + (askedThisYear ? 'Already asked' : 'Ask employer for coverage') + '</button>' +
    '</section>';
  return card + html;
};

/* ============ 4. MEDICAL EVENTS — illness, accident, surgery ============ */
function p45InsuranceCoverage() {
  /* Returns { ratio, cap, source } */
  if (S.p45 && S.p45.employerInsurance) return { ratio: 0.75, cap: 150000, source: 'employer' };
  if (S.job && S.job.benefits && S.job.benefits.medical) return { ratio: 0.75, cap: 150000, source: 'employer' };
  if (S.medical && S.medical.hasInsurance) {
    if (S.medical.insuranceTier === 'premium') return { ratio: 0.85, cap: 250000, source: 'private-premium' };
    if (S.medical.insuranceTier === 'basic') return { ratio: 0.60, cap: 100000, source: 'private-basic' };
  }
  return { ratio: 0, cap: 0, source: 'none' };
}

function p45GenerateMedicalEvent() {
  p45Init();
  if (!S || S.age < 18) return;
  if (S.p45.pendingMedicalBills && S.p45.pendingMedicalBills.length >= 2) return;
  /* Probability scales with age, health */
  const ageFactor = S.age >= 40 ? 0.20 : S.age >= 30 ? 0.14 : 0.10;
  const healthFactor = S.health < 40 ? 1.7 : S.health < 60 ? 1.3 : 1.0;
  if (Math.random() > ageFactor * healthFactor) return;

  const events = [
    { id: 'flu',       label: 'Severe flu with complications',  egp: 2500,   days: 4,  sev: 'minor',    surgery: false, meds: true },
    { id: 'foodpois',  label: 'Food poisoning',                 egp: 3500,   days: 3,  sev: 'minor',    surgery: false, meds: true },
    { id: 'back',      label: 'Severe back pain / disc issue',  egp: 18000,  days: 7,  sev: 'moderate', surgery: false, meds: true },
    { id: 'legbreak',  label: 'Broken leg (accident)',          egp: 45000,  days: 30, sev: 'moderate', surgery: true,  meds: true },
    { id: 'append',    label: 'Appendicitis (emergency surgery)', egp: 55000, days: 12, sev: 'serious',  surgery: true,  meds: true },
    { id: 'kidney',    label: 'Kidney stone (needs procedure)', egp: 65000,  days: 14, sev: 'serious',  surgery: true,  meds: true },
    { id: 'heart',     label: 'Cardiac issue (catheterization)',egp: 180000, days: 30, sev: 'critical', surgery: true,  meds: true },
    { id: 'cancer',    label: 'Cancer treatment cycle',         egp: 350000, days: 60, sev: 'critical', surgery: false, meds: true }
  ];

  /* Weight by severity likelihood */
  const weights = { minor: 0.55, moderate: 0.28, serious: 0.12, critical: 0.05 };
  const roll = Math.random();
  let pickedSeverity = 'minor';
  let acc = 0;
  for (const [sev, w] of Object.entries(weights)) {
    acc += w;
    if (roll <= acc) { pickedSeverity = sev; break; }
  }
  const pool = events.filter(function (e) { return e.sev === pickedSeverity; });
  const pick = pool[Math.floor(Math.random() * pool.length)] || events[0];

  const idx = p45Idx();
  const egp = Math.round(pick.egp * idx);
  const insurance = p45InsuranceCoverage();
  const covered = Math.min(egp * insurance.ratio, insurance.cap * idx);
  const outOfPocket = Math.max(0, egp - covered);

  p45Init();
  S.p45.pendingMedicalBills.push({
    id: 'med_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    label: pick.label,
    egp: egp,
    coveredEGP: Math.round(covered),
    outOfPocketEGP: Math.round(outOfPocket),
    severity: pick.sev,
    requiresSurgery: pick.surgery,
    requiresMeds: pick.meds,
    sickDays: pick.days,
    createdYear: gameYear(),
    insuranceSource: insurance.source,
    resolved: false
  });

  /* Immediate health hit */
  const hpLoss = pick.sev === 'critical' ? -20 : pick.sev === 'serious' ? -14 : pick.sev === 'moderate' ? -8 : -4;
  fx({ health: hpLoss, happiness: -4 });

  log('Medical event: ' + pick.label + ' (estimated ' + egp.toLocaleString() + ' EGP, ' + pick.days + ' days recovery). Check the Medical tab.');
  if (typeof realismNotice === 'function') {
    realismNotice('Medical event', pick.label + '. ' +
      (insurance.source === 'none' ? 'You have no insurance. Full cost ' + egp.toLocaleString() + ' EGP.' :
        'Insurance (' + insurance.source.replace('-', ' ') + ') covers ' + Math.round(covered).toLocaleString() + ' EGP; your out-of-pocket is ' + Math.round(outOfPocket).toLocaleString() + ' EGP.'));
  }
}
window.p45GenerateMedicalEvent = p45GenerateMedicalEvent;

/* Hook into yearly cycle (after other events) */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('year', p45GenerateMedicalEvent);
}

/* ============ 5. SICK LEAVE AFFECTS WORK ============ */
function p45ApplySickLeave(bill) {
  p45Init();
  if (!S.job) return;
  const job = S.job;
  const unpaidPolicy = /outsourc|contract|fixed-term/i.test(String(job.benefits && job.benefits.contract || ''));
  const days = Math.min(Number(bill.sickDays) || 0, 90);
  const salary = Number(job.salary) || 0;
  const dailyRate = salary / 260;
  const paidLeave = Math.min(Math.max(0, (job.benefits && job.benefits.leave) || 14), days);
  const unpaidDays = Math.max(0, days - paidLeave);

  if (paidLeave > 0) S.p45.sickLeaveUsed = (S.p45.sickLeaveUsed || 0) + paidLeave;
  if (unpaidDays > 0) {
    const deduction = Math.round(dailyRate * unpaidDays);
    S.wealth -= deduction;
    S.bill = S.bill || {};
    S.bill.sickLeaveDeduction = (S.bill.sickLeaveDeduction || 0) + deduction;
    if (bill) bill.sickLeaveDeduction = (bill.sickLeaveDeduction || 0) + deduction;
    S.expenses = (S.expenses || 0) + deduction;
    log('Sick leave: ' + paidLeave + ' paid day(s), ' + unpaidDays + ' unpaid day(s). Pay deduction: ' + money(deduction) + '.');
  } else {
    log('Sick leave: ' + days + ' day(s), all covered by paid leave.');
  }
  /* Performance dip */
  if (job.perf) job.perf = Math.max(0, job.perf - 3);
}

/* ============ 6. PAY MEDICAL BILLS ============ */
function p45PayMedicalBill(billId, mode) {
  p45Init();
  const bill = (S.p45.pendingMedicalBills || []).find(function (b) { return b.id === billId && !b.resolved; });
  if (!bill) return hint('Bill not found or already paid.');

  if (mode === 'insurance') {
    /* Insurance already applied at bill creation; just resolve */
    bill.resolved = true;
    log('Handled ' + bill.label + ' via insurance. Out-of-pocket: ' + bill.outOfPocketEGP.toLocaleString() + ' EGP covered from cash if affordable.');
    /* Deduct out-of-pocket */
    const internal = bill.outOfPocketEGP / p45Rate();
    if (S.wealth < internal) {
      /* Parents might help if you're young and live with them */
      if (S.housing === 'parents' && S.age < 26 && parents().length && S.famWealth >= 1) {
        log('Your parents covered the out-of-pocket cost.');
      } else if (S.p45.employerInsurance || (S.medical && S.medical.hasInsurance)) {
        log('You could not cover the out-of-pocket portion. Debt or delayed treatment follows.');
        S.wealth -= internal * 0.5;
      } else {
        S.wealth -= internal * 0.5;
      }
    } else {
      S.wealth -= internal;
      S.expenses = (S.expenses || 0) + internal;
      S.bill = S.bill || {};
      S.bill.medicalBill = (S.bill.medicalBill || 0) + internal;
    }
    p45ApplySickLeave(bill);
    render();
    return;
  }

  if (mode === 'parents') {
    if (S.housing !== 'parents' || !parents().length || S.age > 27) {
      return hint('Your parents are not available to help.');
    }
    const couldPay = S.famWealth >= 1;
    if (couldPay && Math.random() < 0.75) {
      bill.resolved = true;
      log('Your parents paid ' + bill.egp.toLocaleString() + ' EGP for ' + bill.label + '.');
      if (typeof p24Popup === 'function') p24Popup('Parents paid the bill', 'Your family covered the medical cost of ' + bill.egp.toLocaleString() + ' EGP.');
      p45ApplySickLeave(bill);
      render();
      return;
    }
    return hint('Your parents could not afford this bill.');
  }

  if (mode === 'cash') {
    const internal = bill.egp / p45Rate();
    if (S.wealth < internal) return hint('You cannot afford ' + bill.egp.toLocaleString() + ' EGP.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.medicalBill = (S.bill.medicalBill || 0) + internal;
    bill.resolved = true;
    log('Paid ' + bill.egp.toLocaleString() + ' EGP for ' + bill.label + '.');
    p45ApplySickLeave(bill);
    render();
    return;
  }

  if (mode === 'skip') {
    bill.resolved = true;
    fx({ health: -8, happiness: -3 });
    log('You skipped or delayed treatment for ' + bill.label + '. Health and happiness suffered.');
    render();
    return;
  }

  if (mode === 'installment') {
    /* Split into 6-month installment without interest (medical) */
    const internal = bill.egp / p45Rate();
    const monthly = internal / 6;
    if (!S.bank) S.bank = { installments: {}, cardDebt: {}, activeCards: [], primaryCard: null, score: 680, savingsBal: 0, loans: [], missedPmts: 0 };
    if (!S.bank.installments) S.bank.installments = {};
    const key = 'medical_' + bill.id;
    S.bank.installments[key] = {
      name: 'Medical: ' + bill.label,
      totalBalance: internal,
      remaining: internal,
      monthlyPayment: monthly,
      monthsTotal: 6,
      monthsLeft: 6,
      fee: 0,
      startedYear: gameYear()
    };
    bill.resolved = true;
    log('Converted ' + bill.egp.toLocaleString() + ' EGP medical bill into a 6-month installment plan.');
    p45ApplySickLeave(bill);
    render();
    return;
  }
}
window.p45PayMedicalBill = p45PayMedicalBill;

/* ============ 7. MEDICAL TAB — show pending bills ============ */
const P45_viewMedicalBefore = (typeof viewMedical === 'function') ? viewMedical : null;
if (P45_viewMedicalBefore) {
  viewMedical = function () {
    p45Init();
    let html = P45_viewMedicalBefore();
    const bills = (S.p45.pendingMedicalBills || []).filter(function (b) { return !b.resolved; });
    if (!bills.length) return html;

    let billsHtml = '<section class="card" style="border-color:var(--rose)"><h3>⚕️ Pending medical bills</h3>';
    bills.forEach(function (b) {
      const sevColor = b.severity === 'critical' ? 'var(--rose)' : b.severity === 'serious' ? 'var(--amber)' : 'var(--muted)';
      billsHtml += '<div style="margin-top:10px;padding:10px;border:1px solid ' + sevColor + ';border-radius:8px">' +
        '<b>' + b.label + '</b> <span style="color:' + sevColor + ';font-size:.78rem">· ' + b.severity + '</span>' +
        '<div class="row"><span>Total cost</span><b class="mono">' + b.egp.toLocaleString() + ' EGP</b></div>' +
        (b.coveredEGP > 0 ? '<div class="row"><span>Insurance covers</span><b class="mono" style="color:var(--mint)">-' + b.coveredEGP.toLocaleString() + ' EGP</b></div>' : '') +
        '<div class="row"><span>Your out-of-pocket</span><b class="mono" style="color:var(--rose)">' + b.outOfPocketEGP.toLocaleString() + ' EGP</b></div>' +
        '<div class="row"><span>Recovery time</span><b>' + b.sickDays + ' day(s) sick leave</b></div>' +
        (b.requiresSurgery ? '<p class="muted" style="font-size:.82rem;color:var(--amber)">Requires surgery.</p>' : '') +
        '<div class="acts" style="margin-top:6px">' +
        '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'cash\')">Pay out-of-pocket in cash</button>' +
        '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'installment\')">Convert to 6-month installment</button>' +
        (S.housing === 'parents' && S.age <= 27 ? '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'parents\')">Ask parents to pay</button>' : '') +
        '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'skip\')">Delay treatment (health hit)</button>' +
        '</div></div>';
    });
    billsHtml += '</section>';
    return billsHtml + html;
  };
}

/* Also show alert on Life tab */
const P45_viewLifeMedical = viewLife;
viewLife = function () {
  let html = P45_viewLifeMedical();
  p45Init();
  const bills = (S.p45.pendingMedicalBills || []).filter(function (b) { return !b.resolved; });
  if (!bills.length) return html;
  const alert = '<section class="card" style="border-color:var(--rose)"><h3>⚕️ Medical attention needed</h3>' +
    '<p class="muted">You have ' + bills.length + ' pending medical bill(s). Check the Medical tab to pay, use insurance, or convert to installments.</p>' +
    '<button class="btn" onclick="activeTab=\'medical\';render();">Open Medical tab</button>' +
    '</section>';
  return alert + html;
};

/* ============ 8. STUDENT LOAN PAYMENTS ============ */
function p45PayStudentLoan(amountEGP) {
  if (!S || S.age < 18) return hint('Available from age 18.');
  const loan = Number(S.loan) || 0;
  if (loan <= 0) return hint('You have no student loan.');
  const rate = p45Rate();
  const egp = Math.round(Number(amountEGP) || 0);
  if (egp <= 0) return hint('Enter a positive amount.');
  const internal = egp / rate;
  const pay = Math.min(internal, loan, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash.');
  S.wealth -= pay;
  S.loan = Math.max(0, loan - pay);
  log('Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP toward your student loan. Remaining: ' + Math.round(S.loan * rate).toLocaleString() + ' EGP.');
  if (S.loan <= 0.5) {
    S.loan = 0;
    log('Your student loan is fully paid off!');
  }
  render();
}
window.p45PayStudentLoan = p45PayStudentLoan;

function p45PayStudentLoanPrompt() {
  const loan = Number(S.loan) || 0;
  if (loan <= 0) return hint('You have no student loan.');
  const egp = Math.round(loan * p45Rate());
  const input = prompt('How much to pay toward your student loan? (Full: ' + egp.toLocaleString() + ' EGP)', String(egp));
  if (input == null) return;
  p45PayStudentLoan(Number(input));
}
window.p45PayStudentLoanPrompt = p45PayStudentLoanPrompt;

/* Enhance the Money tab's actionable debt card with student loan options */
const P45_viewMoneyBefore = viewMoney;
viewMoney = function () {
  let html = P45_viewMoneyBefore();
  if (!S || S.age < 18) return html;
  if (!(Number(S.loan) > 0)) return html;

  const rate = p45Rate();
  const loanEGP = Math.round(Number(S.loan) * rate);

  /* Find the actionable debt section and enrich it */
  const studentLoanRow = '<div class="row"><span>Student loan</span><b class="mono" style="color:var(--rose)">-E£' + loanEGP.toLocaleString() + '</b></div>';
  const enrichedRow = '<div class="row"><span>Student loan <b style="font-size:.85rem">(' + loanEGP.toLocaleString() + ' EGP)</b></span><b class="mono" style="color:var(--rose)">-E£' + loanEGP.toLocaleString() + '</b></div>';
  html = html.replace(studentLoanRow, enrichedRow);

  /* Add payment buttons in the debt card */
  const payButtons = '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
    '<button class="btn" onclick="p45PayStudentLoanPrompt()">Pay custom amount</button>' +
    '<button class="btn" onclick="p45PayStudentLoan(' + loanEGP + ')"' + (Math.round(S.wealth * rate) < loanEGP ? ' disabled' : '') + '>Pay off fully (' + loanEGP.toLocaleString() + ' EGP)</button>' +
    '</div>';

  /* Insert after the student loan row within the actionable card */
  const cardEnd = html.indexOf('</section>', html.indexOf('Total owed'));
  if (cardEnd !== -1) {
    html = html.slice(0, cardEnd) + payButtons + html.slice(cardEnd);
  }
  return html;
};

/* ============ 9. ALSO SHOW PENDING MEDICAL IN LOG ============ */
const P45_logYearBefore = null; /* keep p45GenerateMedicalEvent's log entry as-is */

/* ============ 10. INSURANCE FROM EMPLOYER SETS MEDICAL FLAG ============ */
/* Ensure S.medical.hasInsurance reflects employer coverage */
const P45_renderBeforeSyncInsurance = render;
render = function () {
  if (S && S.p45 && S.p45.employerInsurance) {
    if (!S.medical) S.medical = { hasInsurance: true, insuranceTier: 'employer' };
    else if (S.medical.insuranceTier !== 'employer') {
      S.medical.hasInsurance = true;
      /* Note: keep tier as 'employer' so p40CoverageRatio knows about it */
    }
  }
  return P45_renderBeforeSyncInsurance.apply(this, arguments);
};

/* Adjust p40CoverageRatio to know about employer insurance */
if (typeof p40CoverageRatio === 'function') {
  const P45_p40CoverageBefore = p40CoverageRatio;
  p40CoverageRatio = function () {
    if (S && S.p45 && S.p45.employerInsurance) return 0.75;
    return P45_p40CoverageBefore.apply(this, arguments);
  };
}

/* ============ 11. RUN ON LOAD ============ */
p45Init(S);
