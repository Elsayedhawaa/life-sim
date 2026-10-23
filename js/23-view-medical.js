/* ============================================================
   VIEW: MEDICAL
   ============================================================
   Owns: S.medical (expanded state)
   Registers tab 'medical' at order 11.
   ============================================================ */

/* ---------- STATE ---------- */
function ensureMedicalState() {
  if (!S) return;
  if (!S.medical) S.medical = {};
  const m = S.medical;

  if (!m.insurance || typeof m.insurance !== 'string') m.insurance = 'none';
  if (typeof m.insuranceExpiryYear !== 'number') m.insuranceExpiryYear = 0;

  if (!Array.isArray(m.conditions)) m.conditions = [];
  /* Migrate old string-ID conditions to objects */
  m.conditions = m.conditions.map(function(c) {
    if (typeof c === 'string') {
      return { id: c, diagnosedYear: gameYear(), treated: false, severity: 5 };
    }
    if (!c.diagnosedYear) c.diagnosedYear = gameYear();
    if (typeof c.treated !== 'boolean') c.treated = false;
    if (typeof c.severity !== 'number') c.severity = 5;
    return c;
  });

  if (!Array.isArray(m.medications)) m.medications = [];
  if (!Array.isArray(m.tests)) m.tests = [];
  if (!Array.isArray(m.pendingSurgeries)) m.pendingSurgeries = [];
  if (!Array.isArray(m.records)) m.records = [];
  if (!Array.isArray(m.vaccines)) m.vaccines = [];
  if (typeof m.lastCheckupYear !== 'number') m.lastCheckupYear = 0;
  if (typeof m.lastTherapyYear !== 'number') m.lastTherapyYear = 0;

  if (!m.mentalHealth || typeof m.mentalHealth !== 'object') {
    m.mentalHealth = { therapyActive: false, medicationActive: false, depressionYears: 0, anxietyLevel: 0 };
  }
  if (typeof m.mentalHealth.therapyActive !== 'boolean') m.mentalHealth.therapyActive = false;
  if (typeof m.mentalHealth.medicationActive !== 'boolean') m.mentalHealth.medicationActive = false;
  if (typeof m.mentalHealth.depressionYears !== 'number') m.mentalHealth.depressionYears = 0;

  if (!m.fertility || typeof m.fertility !== 'object') {
    m.fertility = { playerFertility: 100, partnerFertility: 100, playerIssue: null, partnerIssue: null, diagnosed: false, treated: false, consultedYear: 0, lastIVFYear: 0 };
  }
  if (typeof m.fertility.consultedYear !== 'number') m.fertility.consultedYear = 0;
  if (typeof m.fertility.lastIVFYear !== 'number') m.fertility.lastIVFYear = 0;

  if (!m.tab) m.tab = 'overview';
}
GameHooks.on('newGame', ensureMedicalState);
GameHooks.on('migrate', ensureMedicalState);

/* ---------- HELPERS ---------- */
function medRate() { return C().rate || 1; }
function medEGP(n) { return Math.round((n || 0) * medRate()); }
function medSetTab(tab) { S.medical.tab = tab; render(); }
window.medSetTab = medSetTab;
function medConditionById(id) {
  if (typeof MED_CONDITIONS === 'undefined') return null;
  return MED_CONDITIONS.find(function(c) { return c.id === id; }) || null;
}

function medHasCondition(condId) {
  if (!S || !S.medical || !Array.isArray(S.medical.conditions)) return false;
  return S.medical.conditions.some(function(c) { return c.id === condId; });
}

function medAddCondition(condId) {
  if (!S || !S.medical || !Array.isArray(S.medical.conditions)) return;
  if (medHasCondition(condId)) return;
  S.medical.conditions.push({ id: condId, diagnosedYear: gameYear(), treated: false, severity: 5 });
  const cond = medConditionById(condId);
  if (cond) {
    log('🏥 Diagnosed with ' + cond.label + '.');
  }
}

function medRemoveCondition(condId) {
  if (!S || !S.medical || !Array.isArray(S.medical.conditions)) return;
  S.medical.conditions = S.medical.conditions.filter(function(c) { return c.id !== condId; });
}

function medHasMedication(medId) {
  if (!S || !S.medical || !Array.isArray(S.medical.medications)) return false;
  return S.medical.medications.some(function(m) { return m.id === medId; });
}
/* ============================================================
   INSURANCE SYNC — career health benefit ↔ medical insurance
   ============================================================ */
function medBestEmployerTier() {
  if (!S.career || !S.career.job) return null;
  const benefits = S.career.job.benefits || [];
  if (benefits.indexOf('health') < 0) return null;
  return (S.career.job.level >= 2) ? 'employer_premium' : 'employer_basic';
}

function medSyncInsuranceFromJob() {
  if (!S || !S.medical) return;
  const best = medBestEmployerTier();
  const current = S.medical.insurance || 'none';

  /* Auto-upgrade from worse plans if you have employer coverage */
  if (best && (current === 'none' || current === 'public_govt' || current === 'private_basic')) {
    S.medical.insurance = best;
    S.medical.insuranceExpiryYear = gameYear() + 1;
    log('🩺 Your employer health coverage is now active: ' + (best === 'employer_premium' ? 'Premium (80% covered)' : 'Basic (55% covered)'));
  }

  /* Downgrade if you lost mid-level job but still employed */
  if (best === 'employer_basic' && current === 'employer_premium') {
    S.medical.insurance = 'employer_basic';
    log('🩺 Your health coverage downgraded to Basic (job level below mid).');
  }

  /* Clear employer plan if you lost the job */
  if (!best && (current === 'employer_basic' || current === 'employer_premium')) {
    S.medical.insurance = 'public_govt';
    S.medical.insuranceExpiryYear = gameYear() + 1;
    log('🩺 You lost your employer health coverage. Defaulting to Government Health Insurance.');
  }
}
window.medSyncInsuranceFromJob = medSyncInsuranceFromJob;

/* Resolves every treatment path for a given condition */
function medResolveConditionOptions(condId) {
  const cond = MED_CONDITIONS.find(function(c) { return c.id === condId; });
  if (!cond) return null;
  const doctors = MED_DOCTORS.filter(function(d) {
    return d.canDetect.some(function(cat) {
      return cond.category === cat || cond.category.indexOf(cat) === 0;
    });
  });
  const meds = MED_MEDICATIONS.filter(function(m) { return m.treats.indexOf(condId) >= 0; });
  const surgeries = MED_SURGERIES.filter(function(s) { return s.cures.indexOf(condId) >= 0; });
  const tests = MED_TESTS.filter(function(t) { return t.detects.indexOf(condId) >= 0; });
  return { cond: cond, doctors: doctors, meds: meds, surgeries: surgeries, tests: tests };
}

function medInsurance() {
  return MED_INSURANCE.find(function(i) { return i.id === S.medical.insurance; }) || MED_INSURANCE[0];
}

/* Compute how much of a cost the player actually pays after insurance */
function medOutOfPocket(baseCostEGP) {
  const ins = medInsurance();
  const cost = medEGP(baseCostEGP);
  const covered = Math.min(cost * ins.coveragePct, medEGP(ins.capEGP));
  return Math.max(0, cost - covered);
}

/* Try to pay — falls back to credit card if available and wealth insufficient */
function medPay(baseCostEGP, label) {
  const isUSA = S.country === 'usa';
  const countryMult = isUSA ? 50 : (S.country === 'deu' || S.country === 'gbr' || S.country === 'can' ? 10 : 1);
  const adjustedCostEGP = baseCostEGP * countryMult;
  
  const actual = medOutOfPocket(adjustedCostEGP);
  if (actual === 0) { log('💰 ' + (label || 'Procedure') + ' fully covered by insurance.'); return true; }
  
  /* 1. Pay Cash */
  if (S.wealth >= actual) {
    S.wealth -= actual;
    log('💸 Paid ' + money(actual) + ' for ' + (label || 'medical') + '.');
    return true;
  }
  
  /* 2. Try Credit Card */
  if (S.bank && Array.isArray(S.bank.creditCards) && S.bank.creditCards.length > 0) {
    const card = S.bank.creditCards.find(function(c) { return c.balance + actual <= c.limit; });
    if (card) {
      card.balance += actual;
      log('💳 Charged ' + money(actual) + ' to ' + card.name + ' for ' + (label || 'medical') + '.');
      return true;
    }
  }

  /* 3. Hospital forces a Medical Debt Loan */
  if (!S.bank) S.bank = {};
  if (!Array.isArray(S.bank.loans)) S.bank.loans = [];
  
  const rate = 0.12; // 12% Medical Loan
  const years = 3;
  const totalOwed = Math.round(actual * (1 + rate * years));
  const monthlyPayment = Math.ceil(totalOwed / (years * 12));
  
  S.bank.loans.push({
    id: 'med_loan_' + Math.random().toString(36).slice(2, 8),
    name: 'Medical Debt: ' + (label || 'Emergency'),
    loanType: 'medical',
    principal: actual,
    remaining: totalOwed,
    rate: rate,
    monthsLeft: years * 12,
    monthsTotal: years * 12,
    monthlyPayment: monthlyPayment,
    startYear: gameYear(),
    missedPayments: 0
  });
  
  log('🏥 You couldn\'t afford the bill. The hospital forced a Medical Loan of ' + money(actual) + ' (' + money(monthlyPayment) + '/mo).');
  return true; 
}
/* ============================================================
   CONDITION HEALING — curable conditions self-resolve
   ============================================================ */
const MED_HEAL_RULES = {
  /* Self-limiting: heal without treatment */
  fracture:            { naturalMonths: 3 },
  pneumonia:           { naturalMonths: 2 },
  ulcer:               { medsMonths: 4, medIds: ['augmentin'] },
  kidney_stones:       { naturalMonths: 6, medsMonths: 3, surgeryImmediate: true },
  appendicitis:        { surgeryImmediate: true, fatalWithoutSurgery: true },
  gallstones:          { surgeryImmediate: true },
  cataract:            { surgeryImmediate: true },
  head_injury:         { naturalMonths: 2 },
  stroke_recovery:     { naturalMonths: 12 },
  fertility_issues:    { surgeryImmediate: true },
  fert_female_tubes:   { surgeryImmediate: true },
  fert_male_low_sperm: { surgeryImmediate: true },
  fert_endometriosis:  { surgeryImmediate: true },
  pcos:                { surgeryImmediate: true },
  breast_cancer:       { chemoResolves: true },
  lung_cancer:         { chemoResolves: true },
  colon_cancer:        { chemoResolves: true },
  leukemia:            { chemoResolves: true },
  anxiety:             { therapyMonths: 6 },
  depression:          { therapyMonths: 12 },
  panic_disorder:      { therapyMonths: 6 },
  severe_depression:   { therapyMonths: 18 }
};
window.MED_HEAL_RULES = MED_HEAL_RULES;

function _medGetHealRule(cId) { return MED_HEAL_RULES[cId] || null; }
/* ---------- MAIN VIEW ---------- */
function medicalView() {
  ensureMedicalState();
  medSyncInsuranceFromJob();
  if (!S) return '';

  const tabs = [
    ['overview', '📋 Overview'],
    ['doctor', '🩺 Visit Doctor'],
    ['tests', '🧪 Tests'],
    ['treatment', '💊 Treatment'],
    ['mental', '🧠 Mental'],
    ['fertility', '👶 Fertility'],
    ['insurance', '🛡 Insurance']
  ];

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#34d39915 0%,transparent 100%);border-color:#34d399">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">MEDICAL · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">Health ' + Math.round(S.health) + '% · ' + S.medical.conditions.length + ' condition(s)</div></div>' +
    '<div style="font-size:2rem">🏥</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (S.medical.tab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="medSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

  if (S.medical.tab === 'overview') html += medRenderOverview();
  else if (S.medical.tab === 'doctor') html += medRenderDoctor();
  else if (S.medical.tab === 'tests') html += medRenderTests();
  else if (S.medical.tab === 'treatment') html += medRenderTreatment();
  else if (S.medical.tab === 'mental') html += medRenderMental();
  else if (S.medical.tab === 'fertility') html += medRenderFertility();
  else if (S.medical.tab === 'insurance') html += medRenderInsurance();

  return html;
}

/* ---------- OVERVIEW ---------- */
function medRenderOverview() {
  const m = S.medical;
  const ins = medInsurance();
  const currentBestEmployer = medBestEmployerTier();

  let html = '';

  /* ---- Auto-sync notice ---- */
  if (currentBestEmployer && ins.id !== currentBestEmployer) {
    html += '<div class="card" style="border-color:#fbbf24;background:#fbbf2420">' +
      '<b style="color:#fbbf24;font-size:.85rem">💡 Employer health coverage available</b>' +
      '<p class="muted small" style="margin:4px 0">Your job offers ' + (currentBestEmployer === 'employer_premium' ? 'Premium' : 'Basic') + ' health insurance for free. Activate it now?</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;font-size:.75rem;padding:8px" onclick="medSyncInsuranceFromJob();render()">Activate employer coverage</button>' +
      '</div>';
  }

  /* ---- Health summary ---- */
  html += '<div class="card"><h3>🩺 Your Health</h3>' +
    '<div class="row"><span>Current health</span><b class="' + (S.health > 70 ? 'good' : S.health > 40 ? '' : 'bad') + '">' + Math.round(S.health) + '%</b></div>' +
    '<div class="row"><span>Happiness</span><b class="' + (S.happiness > 60 ? 'good' : S.happiness > 30 ? '' : 'bad') + '">' + Math.round(S.happiness) + '%</b></div>' +
    '<div class="row"><span>Insurance plan</span><b class="' + (ins.coveragePct > 0 ? 'good' : 'bad') + '">' + ins.label + ' · ' + Math.round(ins.coveragePct * 100) + '% covered</b></div>' +
    (currentBestEmployer && ins.id === currentBestEmployer ? '<div class="muted small" style="color:#34d399;margin-top:2px">✓ Covered by employer</div>' : '') +
    '</div>';

  /* ---- Active conditions WITH ACTION PANELS ---- */
  if (m.conditions.length) {
    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">⚠️ Your Conditions (' + m.conditions.length + ')</h3>' +
      '<p class="muted small">Tap a condition to see doctors, medications, and surgeries that can help.</p></div>';

    m.conditions.forEach(function(c, idx) {
      const resolved = medResolveConditionOptions(c.id);
      if (!resolved) return;
      const cond = resolved.cond;
      const isOpen = S._medOpenCondition === c.id;
      const severityColor = cond.severity === 'critical' ? '#fb7185' : cond.severity === 'severe' ? '#fbbf24' : cond.severity === 'moderate' ? '#22d3ee' : '#34d399';

      html += '<div class="card" style="border-left:3px solid ' + severityColor + ';padding:12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="flex:1"><b style="font-size:.95rem">' + cond.label + '</b>' +
        '<div class="muted small">' + cond.severity + ' · diagnosed ' + (c.diagnosedYear || gameYear()) + (c.treated ? ' · <span class="good">✓ treated</span>' : '') + '</div>' +
        '<div class="muted small" style="margin-top:2px">' + cond.desc + '</div>' +
        '<div class="muted small" style="margin-top:4px">Untreated: -' + cond.annualHealthHit + ' health/yr, -' + cond.annualHappinessHit + ' happy/yr' +
        (cond.deathRiskPerYear > 0 ? ' · <b class="bad">' + (cond.deathRiskPerYear * 100).toFixed(1) + '% death/yr</b>' : '') + '</div>' +
        '</div></div>' +
        '<button class="opt" style="margin-top:10px;width:100%;text-align:center;font-size:.75rem;padding:8px;background:' + (isOpen ? '#8b5cf6' : '#25253a') + ';color:' + (isOpen ? '#fff' : '#ccc') + '" onclick="S._medOpenCondition=\'' + (isOpen ? '' : c.id) + '\';render()">' + (isOpen ? '✕ Close' : '🩺 Show treatment options') + '</button>';

      if (isOpen) {
        /* Doctors */
        if (resolved.doctors.length) {
          html += '<div style="margin-top:10px;padding:8px;background:#0f0f1a;border-radius:6px">' +
            '<b style="font-size:.75rem;color:#22d3ee">👨‍⚕️ SEE A DOCTOR</b>';
          resolved.doctors.forEach(function(doc) {
            const cost = medOutOfPocket(doc.visitCostEGP);
            html += '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + doc.label + '</span>' +
              '<button class="pill" style="padding:3px 8px;font-size:.68rem" onclick="medVisitDoctor(\'' + doc.id + '\',\'' + c.id + '\')">Visit · ' + money(cost) + '</button></div>';
          });
          html += '</div>';
        }
        /* Medications */
        if (resolved.meds.length) {
          html += '<div style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px">' +
            '<b style="font-size:.75rem;color:#34d399">💊 MEDICATIONS</b>';
          resolved.meds.forEach(function(md) {
            const already = medHasMedication(md.id);
            html += '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + md.label + ' · ' + money(medEGP(md.monthlyEGP)) + '/mo</span>' +
              (already ? '<b class="good small">✓ Taking</b>' :
                '<button class="pill" style="padding:3px 8px;font-size:.68rem" onclick="medStartMed(\'' + md.id + '\')">Start</button>') + '</div>';
          });
          html += '</div>';
        }
        /* Surgeries */
        if (resolved.surgeries.length) {
          html += '<div style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px">' +
            '<b style="font-size:.75rem;color:#fb7185">🔪 SURGERIES</b>';
          resolved.surgeries.forEach(function(sg) {
            const cost = medOutOfPocket(sg.baseCostEGP);
            html += '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + sg.label + '</span>' +
              '<button class="pill" style="padding:3px 8px;font-size:.68rem" onclick="medBookSurgery(\'' + sg.id + '\')">Book · ' + money(cost) + '</button></div>';
          });
          html += '</div>';
        }
        /* Tests */
        if (resolved.tests.length) {
          html += '<div style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px">' +
            '<b style="font-size:.75rem;color:#fbbf24">🧪 CONFIRM WITH TEST</b>';
          resolved.tests.forEach(function(tt) {
            const cost = medOutOfPocket(tt.costEGP);
            html += '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + tt.label + '</span>' +
              '<button class="pill" style="padding:3px 8px;font-size:.68rem" onclick="medOrderTest(\'' + tt.id + '\')">Order · ' + money(cost) + '</button></div>';
          });
          html += '</div>';
        }
      }

      html += '</div>';
    });
  } else {
    html += '<div class="card"><h3>✅ No active conditions</h3><p class="muted small">Stay healthy with regular checkups. Preventive care is cheaper than treatment.</p>' +
      '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.78rem" onclick="medSetTab(\'doctor\')">🩺 Book a general checkup</button></div>';
  }

  /* ---- Active medications ---- */
  if (m.medications.length) {
    let monthlyCost = 0;
    html += '<div class="card"><h3>💊 Taking Now</h3>';
    m.medications.forEach(function(md) {
      const def = MED_MEDICATIONS.find(function(d) { return d.id === md.id; });
      if (!def) return;
      monthlyCost += medEGP(def.monthlyEGP);
      html += '<div class="row"><span>' + def.label + '</span><b>' + money(medEGP(def.monthlyEGP)) + '/mo</b></div>';
    });
    html += '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total monthly</b><b>' + money(monthlyCost) + '</b></div>';
    html += '</div>';
  }

  /* ---- Pending tests ---- */
  if (m.tests.length) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🧪 Pending Tests</h3>';
       m.tests.forEach(function(t) {
      const def = MED_TESTS.find(function(d) { return d.id === t.id; });
      if (!def) return;
      var label = 'Results next year';
      if (t.resultAbsMonth && isMonthly()) {
        var monthsLeft = Math.max(1, t.resultAbsMonth - ((gameYear() - 2001) * 12 + currentMonth()));
        label = monthsLeft + ' month' + (monthsLeft > 1 ? 's' : '') + ' from now';
      } else if (t.resultYear) {
        label = 'Year ' + t.resultYear;
      }
      html += '<div class="row"><span>' + def.label + '</span><b>' + label + '</b></div>';
    });
    html += '</div>';
  }

  /* ---- Preventive care ---- */
  html += '<div class="card"><h3>🛡 Preventive Care</h3>';
  MED_PREVENTIVE.forEach(function(p) {
    const cost = medOutOfPocket(p.costEGP);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem" onclick="medPreventive(\'' + p.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + p.label + '</b><span>' + money(cost) + '</span></div>' +
      '<div class="muted small">' + p.desc + '</div></button>';
  });
  html += '</div>';

  return html;
}

/* ---------- VISIT DOCTOR ---------- */
function medRenderDoctor() {
  let html = '<div class="card"><h3>🩺 Visit a Doctor</h3>' +
    '<p class="muted small">Choose a specialist. They will examine you, order tests, and diagnose what they can.</p></div>';

  MED_DOCTORS.forEach(function(doc) {
    const cost = medEGP(doc.visitCostEGP);
    html += '<div class="card" style="padding:10px">' +
      '<div style="display:flex;justify-content:space-between"><b>' + doc.label + '</b><span>' + money(cost) + '</span></div>' +
      '<div class="muted small">' + doc.desc + '</div>' +
      '<button class="opt" style="margin-top:6px;text-align:center;font-size:.75rem" onclick="medVisitDoctor(\'' + doc.id + '\')">Book appointment</button>' +
      '</div>';
  });

  return html;
}

/* ---------- TESTS ---------- */
function medRenderTests() {
  let html = '<div class="card"><h3>🧪 Order a Test</h3>' +
    '<p class="muted small">Tests cost money and take time. Results are ready the following year.</p></div>';

  /* Pending tests */
  if (S.medical.tests.length) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">⏳ Pending Results</h3>';
    S.medical.tests.forEach(function(t) {
      const def = MED_TESTS.find(function(d) { return d.id === t.id; });
      if (!def) return;
      html += '<div class="row"><span>' + def.label + '</span><b>Ready ' + t.resultYear + '</b></div>';
    });
    html += '</div>';
  }

  html += '<div class="card"><h3>Available Tests</h3>';
  MED_TESTS.forEach(function(t) {
    const cost = medEGP(t.costEGP);
    const wait = t.waitMonths === 0 ? 'Same day' : (t.waitMonths + ' month' + (t.waitMonths > 1 ? 's' : ''));
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="medOrderTest(\'' + t.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + t.label + '</b><span>' + money(cost) + '</span></div>' +
      '<div class="muted small">Wait: ' + wait + ' · Detects: ' + t.detects.join(', ') + '</div></button>';
  });
  html += '</div>';

  return html;
}

/* ---------- TREATMENT ---------- */
function medRenderTreatment() {
  let html = '<div class="card"><h3>💊 Treatment Center</h3></div>';

  /* Medications */
  html += '<div class="card"><h3>💊 Medications</h3>' +
    '<p class="muted small">Buy monthly medications. They help manage conditions but may not cure them.</p>';
  if (S.medical.medications.length) {
    html += '<h4 style="font-size:.78rem;color:#34d399;margin-top:6px">Currently taking:</h4>';
    S.medical.medications.forEach(function(m, idx) {
      const def = MED_MEDICATIONS.find(function(d) { return d.id === m.id; });
      if (!def) return;
      html += '<div class="row"><span>' + def.label + ' · ' + money(medEGP(def.monthlyEGP)) + '/mo</span>' +
        '<button class="opt" style="padding:2px 8px;font-size:.68rem;border-color:#fb7185;color:#fb7185" onclick="medStopMed(\'' + m.id + '\')">Stop</button></div>';
    });
  }
  html += '<h4 style="font-size:.78rem;color:#34d399;margin-top:10px">Available medications:</h4>';
  MED_MEDICATIONS.forEach(function(m) {
    if (medHasMedication(m.id)) return;
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:6px;font-size:.72rem" onclick="medStartMed(\'' + m.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + m.label + '</b><span>' + money(medEGP(m.monthlyEGP)) + '/mo</span></div>' +
      '<div class="muted small">Treats: ' + m.treats.join(', ') + ' · Effect: ' + m.effect + (m.addictive ? ' · ⚠️ addictive' : '') + '</div></button>';
  });
  html += '</div>';

  /* Surgeries */
  html += '<div class="card"><h3>🔪 Surgery</h3>' +
    '<p class="muted small">Surgical options. Choose a hospital tier when booking.</p>';
  MED_SURGERIES.forEach(function(s) {
    const baseCost = medEGP(s.baseCostEGP);
    const pocket = medOutOfPocket(s.baseCostEGP);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="medBookSurgery(\'' + s.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + s.label + '</b><span>' + money(pocket) + ' after insurance</span></div>' +
      '<div class="muted small">Cures: ' + s.cures.join(', ') + ' · Recovery: ' + s.recoveryMonths + 'mo</div></button>';
  });
  html += '</div>';

  /* Other treatments */
  html += '<div class="card"><h3>🩹 Other Treatments</h3>';
  MED_TREATMENTS.forEach(function(t) {
    const cost = medEGP(t.costEGP);
    const pocket = medOutOfPocket(t.costEGP);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="medStartTreatment(\'' + t.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + t.label + '</b><span>' + money(pocket) + (t.perSession ? '/session' : '') + '</span></div>' +
      '<div class="muted small">' + t.desc + ' · Treats: ' + t.treats.join(', ') + '</div></button>';
  });
  html += '</div>';

  return html;
}

/* ---------- MENTAL ---------- */
function medRenderMental() {
  const mh = S.medical.mentalHealth;
  let html = '<div class="card"><h3>🧠 Mental Health</h3>' +
    '<div class="row"><span>Happiness</span><b class="' + (S.happiness > 60 ? 'good' : S.happiness > 30 ? '' : 'bad') + '">' + Math.round(S.happiness) + '%</b></div>' +
    '<div class="row"><span>Therapy active</span><b>' + (mh.therapyActive ? 'Yes' : 'No') + '</b></div>' +
    '<div class="row"><span>Psychiatric meds</span><b>' + (mh.medicationActive ? 'Yes' : 'No') + '</b></div>' +
    (mh.depressionYears > 0 ? '<div class="row"><span>Years with low mood</span><b class="bad">' + mh.depressionYears + '</b></div>' : '') +
    '</div>';

  html += '<div class="card"><h3>Actions</h3>';

  if (!mh.therapyActive) {
    html += '<button class="opt" style="width:100%;margin-top:4px;font-size:.78rem" onclick="medStartTherapy()">' +
      '<div style="display:flex;justify-content:space-between"><b>🧠 Start Psychotherapy</b><span>' + money(medEGP(5000)) + '/session</span></div>' +
      '<div class="muted small">Weekly. Slow but effective. Heals depression and anxiety.</div></button>';
  } else {
    html += '<div class="row"><span>Psychotherapy</span><b class="good">Active</b></div>' +
      '<button class="opt" style="width:100%;margin-top:4px;font-size:.78rem;border-color:#fb7185;color:#fb7185" onclick="medStopTherapy()">Stop therapy</button>';
  }

  html += '<button class="opt" style="width:100%;margin-top:4px;font-size:.78rem" onclick="medPsychEvaluation()">' +
    '<div style="display:flex;justify-content:space-between"><b>🩺 Psychiatric Evaluation</b><span>' + money(medEGP(1500)) + '</span></div>' +
    '<div class="muted small">Full mental health checkup.</div></button>';

  html += '</div>';

  if (mh.depressionYears >= 2) {
    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">⚠️ Long-term low mood</h3>' +
      '<p class="muted small">You have been unhappy for ' + mh.depressionYears + ' years. Your doctor recommends immediate treatment.</p>' +
      '<button class="opt" style="width:100%;margin-top:6px;text-align:center;background:#fb7185;color:#fff;font-weight:700" onclick="medEmergencyPsych()">Book urgent psychiatrist</button></div>';
  }

  return html;
}

/* ---------- FERTILITY ---------- */
function medRenderFertility() {
  const f = S.medical.fertility;
  const partner = (S.marriage && S.marriage.partner) ? S.marriage.partner : null;

  let html = '<div class="card"><h3>👶 Fertility</h3>' +
    '<div class="row"><span>Your fertility</span><b>' + f.playerFertility + '%</b></div>' +
    (partner ? '<div class="row"><span>' + partner.name + ' fertility</span><b>' + f.partnerFertility + '%</b></div>' : '') +
    '<div class="row"><span>Diagnosed</span><b>' + (f.diagnosed ? 'Yes' : 'No') + '</b></div>' +
    (f.playerIssue ? '<div class="row"><span>Your issue</span><b class="bad">' + f.playerIssue + '</b></div>' : '') +
    (f.partnerIssue ? '<div class="row"><span>Partner\'s issue</span><b class="bad">' + f.partnerIssue + '</b></div>' : '') +
    '</div>';

  /* Consult */
  if (!f.diagnosed) {
    html += '<div class="card"><h3>🔬 Get Evaluated</h3>' +
      '<p class="muted small">See a fertility specialist to diagnose what might be blocking conception.</p>' +
      '<button class="opt" style="width:100%;margin-top:6px;text-align:center;background:#34d399;color:#000;font-weight:700" onclick="medFertilityConsult()">Fertility consultation · ' + money(medEGP(1500)) + '</button>' +
      '</div>';
  }

  /* Diagnosed issues — show treatments */
  if (f.diagnosed && (f.playerIssue || f.partnerIssue)) {
    html += '<div class="card"><h3>💉 Treatment Options</h3>';
    if (f.treated) {
      html += '<div class="row"><span>Surgery</span><b class="good">✓ Completed</b></div>';
    } else {
      html += '<p class="muted small">Options: surgery to fix the issue, or assisted reproduction (IUI / IVF / ICSI).</p>';
    }
    MED_FERTILITY_TREATMENTS.forEach(function(t) {
      if (t.id === 'fert_consult') return;
      const cost = medEGP(t.costEGP);
      const pocket = medOutOfPocket(t.costEGP);
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="medFertilityTreatment(\'' + t.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + t.label + '</b><span>' + money(pocket) + '</span></div>' +
        '<div class="muted small">' + t.desc + ' · Success: ' + Math.round(t.successPct * 100) + '%</div></button>';
    });
    if (f.partnerIssue && !f.treated) {
      html += '<button class="opt" style="width:100%;margin-top:8px;text-align:center;background:#22d3ee;color:#000;font-weight:700" onclick="medFertilitySurgery()">Perform corrective surgery · ' + money(medEGP(55000)) + '</button>';
    }
    html += '</div>';
  }

  return html;
}

/* ---------- INSURANCE ---------- */
function medRenderInsurance() {
  const cur = S.medical.insurance;
  let html = '<div class="card"><h3>🛡 Health Insurance</h3>' +
    '<div class="row"><span>Current plan</span><b>' + (MED_INSURANCE.find(function(i) { return i.id === cur; }) || {}).label + '</b></div>' +
    '</div>';

  html += '<div class="card"><h3>Available Plans</h3>';
  MED_INSURANCE.forEach(function(ins) {
    if (ins.id === cur) return;
    const premium = medEGP(ins.premiumAnnualEGP);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="medSwitchInsurance(\'' + ins.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + ins.label + '</b><span>' + (premium > 0 ? money(premium) + '/yr' : 'Free with job') + '</span></div>' +
      '<div class="muted small">' + ins.desc + ' · ' + Math.round(ins.coveragePct * 100) + '% covered' + (ins.capEGP > 0 && ins.capEGP !== Infinity ? ' · Cap ' + money(medEGP(ins.capEGP)) : '') + '</div></button>';
  });
  html += '</div>';

  return html;
}

/* ============================================================
   ACTIONS
   ============================================================ */

window.medVisitDoctor = function(docId, targetConditionId) {
  const doc = MED_DOCTORS.find(function(d) { return d.id === docId; });
  if (!doc) return;
  if (!medPay(doc.visitCostEGP, doc.label)) { render(); return; }

  /* If a specific condition was targeted, confirm it directly */
  if (targetConditionId && medHasCondition(targetConditionId)) {
    const cond = medConditionById(targetConditionId);
    log('🩺 ' + doc.label + ' confirmed your ' + cond.label + '. They recommend the treatments shown in your Overview tab.');
    fx({ happiness: 1 });
    render(); return;
  }

  /* Otherwise, attempt detection */
  const conds = MED_CONDITIONS.filter(function(c) {
    return doc.canDetect.some(function(cat) {
      return c.category === cat || c.category.indexOf(cat) === 0;
    });
  });

  if (!conds.length) {
    log('🩺 ' + doc.label + ' found nothing concerning.');
    render(); return;
  }

  const undetected = conds.filter(function(c) { return !medHasCondition(c.id); });
  if (!undetected.length) {
    log('🩺 ' + doc.label + ' confirms you are already diagnosed.');
    render(); return;
  }

  let detectChance = 0.60;
  if (S.smarts > 70) detectChance += 0.10;
  if (S.health < 50) detectChance += 0.10;
  if (S.age > 50) detectChance += 0.05;

  if (Math.random() < detectChance) {
    const found = undetected[Math.floor(Math.random() * undetected.length)];
    medAddCondition(found.id);
    S.medical.records.unshift({ year: gameYear(), type: 'diagnosis', condition: found.label, doctor: doc.label });
    fx({ happiness: -3 });
    log('🏥 Diagnosed: ' + found.label + '. Check your Overview tab for treatment options.');
  } else {
    log('🩺 ' + doc.label + ' found nothing new. Consider booking a specific checkup.');
  }
  render();
};
window.medOrderTest = function(testId) {
  const test = MED_TESTS.find(function(t) { return t.id === testId; });
  if (!test) return;
  if (!medPay(test.costEGP, test.label)) { render(); return; }

  const currentAbs = (gameYear() - 2001) * 12 + currentMonth();
  const entry = {
    id: testId,
    orderedYear: gameYear(),
    orderedAbsMonth: currentAbs
  };

  if (isMonthly()) {
    entry.resultAbsMonth = currentAbs + Math.max(1, test.waitMonths || 1);
    log('🧪 Ordered: ' + test.label + '. Results in ~' + (test.waitMonths || 1) + ' month' + ((test.waitMonths || 1) > 1 ? 's' : '') + '.');
  } else {
    entry.resultYear = gameYear() + 1;
    log('🧪 Ordered: ' + test.label + '. Results next year.');
  }

  S.medical.tests.push(entry);
  render();
};
window.medStartMed = function(medId) {
  const med = MED_MEDICATIONS.find(function(m) { return m.id === medId; });
  if (!med) return;
  if (medHasMedication(medId)) return;
  S.medical.medications.push({ id: medId, startYear: gameYear() });
  if (med.id === 'zoloft' || med.id === 'prozac' || med.id === 'xanax') {
    S.medical.mentalHealth.medicationActive = true;
  }
  log('💊 Started ' + med.label + ' · ' + money(medEGP(med.monthlyEGP)) + '/month.');
  render();
};

window.medStopMed = function(medId) {
  S.medical.medications = S.medical.medications.filter(function(m) { return m.id !== medId; });
  const still = S.medical.medications.some(function(m) {
    return m.id === 'zoloft' || m.id === 'prozac' || m.id === 'xanax';
  });
  if (!still) S.medical.mentalHealth.medicationActive = false;
  log('💊 Stopped medication.');
  render();
};

window.medBookSurgery = function(surgeryId) {
  const s = MED_SURGERIES.find(function(x) { return x.id === surgeryId; });
  if (!s) return;

  /* Choose hospital tier */
  const tiers = MED_HOSPITALS.filter(function(h) { return !h.cancerOnly; });
  const opts = tiers.map(function(h) { return h.id + ' = ' + h.label + ' (' + money(Math.round(medEGP(s.baseCostEGP) * h.costMult)) + ')'; }).join('\n');
  const pick = prompt('Choose hospital tier:\n\n' + opts + '\n\nEnter tier id:', 'private_std');
  if (!pick) return;
  const hospital = tiers.find(function(h) { return h.id === pick.trim(); });
  if (!hospital) { log('Invalid hospital.'); render(); return; }

  const baseCost = Math.round(s.baseCostEGP * hospital.costMult);
  if (!medPay(baseCost, s.label + ' at ' + hospital.label)) { render(); return; }

  /* Schedule for next year */
  S.medical.pendingSurgeries.push({
    id: s.id,
    scheduledYear: gameYear() + 1,
    hospital: hospital.id
  });
  log('🔪 Scheduled ' + s.label + ' at ' + hospital.label + ' for next year.');
  render();
};

window.medStartTreatment = function(treatId) {
  const t = MED_TREATMENTS.find(function(x) { return x.id === treatId; });
  if (!t) return;
  if (!medPay(t.costEGP, t.label)) { render(); return; }
  if (t.id === 'therapy') {
    S.medical.mentalHealth.therapyActive = true;
    log('🧠 Started psychotherapy.');
  } else if (t.id === 'chemo' || t.id === 'radiation') {
    /* Roll chance to cure a cancer */
    const cancerConds = S.medical.conditions.filter(function(c) {
      const cond = medConditionById(c.id);
      return cond && cond.category === 'cancer';
    });
    if (cancerConds.length === 0) {
      log('⚠️ No cancer detected — treatment unnecessary.');
      render(); return;
    }
    if (Math.random() < 0.55) {
      medRemoveCondition(cancerConds[0].id);
      log('🎉 Cancer in remission after ' + t.label + '!');
      fx({ happiness: 20, health: 10 });
    } else {
      log('Treatment did not fully cure the cancer. Continue monitoring.');
    }
  } else {
    log('Received ' + t.label + '.');
    fx({ health: 2 });
  }
  render();
};

window.medStartTherapy = function() {
  if (!medPay(5000, 'psychotherapy session')) { render(); return; }
  S.medical.mentalHealth.therapyActive = true;
  S.medical.mentalHealth.depressionYears = 0;
  log('🧠 Started psychotherapy. Healing takes time.');
  fx({ happiness: 5 });
  render();
};

window.medStopTherapy = function() {
  S.medical.mentalHealth.therapyActive = false;
  log('Stopped psychotherapy.');
  render();
};

window.medPsychEvaluation = function() {
  if (!medPay(1500, 'psychiatric evaluation')) { render(); return; }
  /* Reveal any undetected mental condition */
  const undetected = MED_CONDITIONS.filter(function(c) {
    return c.category === 'mental' && !medHasCondition(c.id);
  });
  if (undetected.length && Math.random() < 0.6) {
    medAddCondition(undetected[0].id);
  } else {
    log('🩺 Psychiatric evaluation complete. No new diagnosis.');
  }
  render();
};

window.medEmergencyPsych = function() {
  if (!medPay(2500, 'urgent psychiatric care')) { render(); return; }
  medAddCondition('severe_depression');
  S.medical.mentalHealth.depressionYears = 0;
  log('🚨 Emergency psychiatric care given. Prescribed medication.');
  render();
};

window.medPreventive = function(prevId) {
  const p = MED_PREVENTIVE.find(function(x) { return x.id === prevId; });
  if (!p) return;
  if (!medPay(p.costEGP, p.label)) { render(); return; }
  fx({ health: p.healthGain });
  if (p.detectsChance > 0 && Math.random() < p.detectsChance) {
    const undetected = MED_CONDITIONS.filter(function(c) { return !medHasCondition(c.id); });
    if (undetected.length) {
      medAddCondition(undetected[0].id);
      log('🩺 ' + p.label + ' detected an early condition.');
    }
  } else {
    log('🛡 ' + p.label + ' done. Health +' + p.healthGain + '.');
  }
  render();
};

window.medSwitchInsurance = function(insId) {
  const ins = MED_INSURANCE.find(function(i) { return i.id === insId; });
  if (!ins) return;
  const hasJob = !!(S.job || (S.career && S.career.job));
  const jobLevel = (S.career && S.career.job && S.career.job.level) || (S.job && S.job.level) || 0;

  if (ins.id === 'employer_basic' && !hasJob) {
    log('❌ Employer basic requires a job.');
    render(); return;
  }
  if (ins.id === 'employer_premium' && (!hasJob || jobLevel < 2)) {
    log('❌ Employer premium requires a mid-level job (level 2+).');
    render(); return;
  }
  const premium = medEGP(ins.premiumAnnualEGP);
  if (premium > 0) {
    if (S.wealth < premium) { log('Not enough for ' + ins.label + ' (' + money(premium) + ').'); render(); return; }
    S.wealth -= premium;
  }
  S.medical.insurance = insId;
  S.medical.insuranceExpiryYear = gameYear() + 1;
  log('🛡 Switched insurance to: ' + ins.label + '.');
  render();
};

/* ---------- FERTILITY ACTIONS ---------- */
window.medFertilityConsult = function() {
  if (!medPay(1500, 'fertility consultation')) { render(); return; }
  /* Diagnose issue — based on age and existing fertility value */
  const partner = S.marriage && S.marriage.partner;
  if (!partner) { log('❌ Fertility consult needs a partner.'); render(); return; }

  const playerAge = S.gender === 'f' ? S.age : S.age;
  const partnerAge = partner.age;

  /* Roll for diagnosis */
  const playerIssueRoll = Math.random();
  const partnerIssueRoll = Math.random();

  let playerIssue = null, partnerIssue = null;
  const femaleAge = S.gender === 'f' ? S.age : partner.age;
  const maleAge = S.gender === 'm' ? S.age : partner.age;

  if (S.gender === 'f') {
    if (femaleAge > 35 && playerIssueRoll < 0.5) playerIssue = 'Age-related fertility decline';
    else if (playerIssueRoll < 0.2) playerIssue = 'PCOS suspected';
    else if (playerIssueRoll < 0.4) playerIssue = 'Blocked fallopian tubes';
    if (partnerAge > 40 && partnerIssueRoll < 0.35) partnerIssue = 'Low sperm count';
  } else {
    if (maleAge > 40 && playerIssueRoll < 0.35) playerIssue = 'Low sperm count';
    if (femaleAge > 35 && partnerIssueRoll < 0.5) partnerIssue = 'Age-related fertility decline';
    else if (partnerIssueRoll < 0.2) partnerIssue = 'PCOS suspected';
    else if (partnerIssueRoll < 0.4) partnerIssue = 'Blocked fallopian tubes';
  }

  S.medical.fertility.diagnosed = true;
  S.medical.fertility.playerIssue = playerIssue;
  S.medical.fertility.partnerIssue = partnerIssue;
  S.medical.fertility.consultedYear = gameYear();

  if (playerIssue || partnerIssue) {
    log('🔬 Fertility issue diagnosed: ' + (playerIssue || partnerIssue) + '.');
    /* Add the condition */
    if (playerIssue) {
      if (playerIssue.includes('PCOS')) medAddCondition('pcos');
      else if (playerIssue.includes('tubes')) medAddCondition('fert_female_tubes');
    }
    if (partnerIssue && partnerIssue.includes('sperm')) {
      /* Partner issue — track separately */
      if (S.gender === 'm') medAddCondition('fert_male_low_sperm');
    }
    fx({ happiness: -10 });
  } else {
    log('🔬 No fertility issue detected. Keep trying.');
  }
  render();
};

window.medFertilityTreatment = function(treatId) {
  const t = MED_FERTILITY_TREATMENTS.find(function(x) { return x.id === treatId; });
  if (!t) return;
  if (!medPay(t.costEGP, t.label)) { render(); return; }

  /* Roll success based on age */
  const partner = S.marriage && S.marriage.partner;
  if (!partner) { log('❌ Needs a partner.'); render(); return; }
  const motherAge = S.gender === 'f' ? S.age : partner.age;
  let agePenalty = 0;
  if (motherAge > 35) agePenalty = 0.20;
  if (motherAge > 40) agePenalty = 0.40;
  if (motherAge > 45) agePenalty = 0.60;

  const successChance = Math.max(0.02, t.successPct - agePenalty);

  if (Math.random() < successChance) {
    /* Create pregnancy */
    if (S.pregnancy) { log('❌ Already pregnant.'); render(); return; }
    S.pregnancy = {
      active: true, startYear: gameYear(), monthsElapsed: 0, isIVF: true,
      motherIsPlayer: S.gender === 'f', fatherIsPlayer: S.gender === 'm',
      knownGender: null, plannedHospital: 'private', complications: [],
      planningChecklist: { clothes: false, clothesTier: null, nursery: false, nurseryTier: null, name: null },
      eventLog: [{ year: gameYear(), event: 'Conceived via ' + t.label, cost: t.costEGP }]
    };
    S.medical.fertility.lastIVFYear = gameYear();
    log('🎉 SUCCESS! ' + t.label + ' worked. You are pregnant!');
    fx({ happiness: 25 });
  } else {
    log('😔 ' + t.label + ' was not successful this cycle. You can try again next year.');
    fx({ happiness: -8 });
  }
  render();
};

window.medFertilitySurgery = function() {
  if (!medPay(55000, 'fertility surgery')) { render(); return; }
  S.medical.fertility.treated = true;
  log('🔧 Fertility surgery complete. Natural conception more likely now.');
  fx({ happiness: 10 });
  render();
};

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureMedicalState();
  if (!S) return;
  const year = gameYear();
  const m = S.medical;
  medSyncInsuranceFromJob();

  /* Charge insurance premium */
  const ins = medInsurance();
  if (ins.premiumAnnualEGP > 0 && m.insuranceExpiryYear <= year) {
    const cost = medEGP(ins.premiumAnnualEGP);
    if (S.wealth >= cost) {
      S.wealth -= cost;
      m.insuranceExpiryYear = year + 1;
    } else {
      log('⚠️ Could not pay insurance premium. Dropped to Uninsured.');
      m.insurance = 'none';
    }
  }

  /* Employer insurance requires job */
  if ((m.insurance === 'employer_basic' || m.insurance === 'employer_premium') && !S.job) {
    log('⚠️ Lost job — employer insurance ended. Switched to uninsured.');
    m.insurance = 'none';
  }

  /* Medications charge handled by chargeHousehold */
  if (S.wealth < 0 && m.medications.length > 0) {
    log('⚠️ Could not afford medications. Some stopped.');
    m.medications = [];
    m.mentalHealth.medicationActive = false;
  }

  /* Progress active conditions */
  const conditionsToRemove = [];
  m.conditions.forEach(function(c) {
    const cond = medConditionById(c.id);
    if (!cond) return;

    /* Track progress for curable conditions */
    if (!c.progressMonths) c.progressMonths = 0;
    const rule = _medGetHealRule(c.id);

    if (rule) {
      /* Surgery already performed → remove immediately */
      if (c.treated && !rule.naturalMonths && !rule.medsMonths && !rule.therapyMonths && !rule.chemoResolves) {
        conditionsToRemove.push(c.id);
        log('✅ ' + cond.label + ' has been resolved through surgery.');
        return;
      }
      /* Natural healing */
      if (rule.naturalMonths) {
        const progress = isMonthly() ? 1 : 12;
        c.progressMonths += progress;
        if (c.progressMonths >= rule.naturalMonths) {
          conditionsToRemove.push(c.id);
          log('✅ ' + cond.label + ' healed naturally after ' + rule.naturalMonths + ' months.');
          return;
        }
      }
      /* Meds-required healing */
      if (rule.medsMonths) {
        const hasMeds = (rule.medIds || []).some(function(mid) {
          return m.medications.some(function(x) { return x.id === mid; });
        });
        if (hasMeds) {
          const progress = isMonthly() ? 1 : 12;
          c.progressMonths += progress;
          if (c.progressMonths >= rule.medsMonths) {
            conditionsToRemove.push(c.id);
            log('✅ ' + cond.label + ' cured by medication after ' + rule.medsMonths + ' months of treatment.');
            return;
          }
        }
      }
      /* Therapy-required healing */
      if (rule.therapyMonths) {
        const inTherapy = m.mentalHealth && m.mentalHealth.therapyActive;
        if (inTherapy) {
          const progress = isMonthly() ? 1 : 12;
          c.progressMonths += progress;
          if (c.progressMonths >= rule.therapyMonths) {
            conditionsToRemove.push(c.id);
            log('✅ ' + cond.label + ' resolved through therapy.');
            return;
          }
        }
      }
      /* Chemo cures cancer */
      if (rule.chemoResolves) {
        const onChemo = m.treatments && m.treatments.some(function(t) { return t.id === 'chemo'; });
        if (onChemo) {
          const progress = isMonthly() ? 1 : 12;
          c.progressMonths += progress;
          if (c.progressMonths >= 3) {
            conditionsToRemove.push(c.id);
            log('🎉 ' + cond.label + ' in remission after chemotherapy.');
            fx({ happiness: 25, health: 10 });
            return;
          }
        }
      }
    }

    /* Damage (skip if treated) */
    if (c.treated) return;
    S.health = Math.max(0, S.health - cond.annualHealthHit);
    S.happiness = Math.max(0, S.happiness - cond.annualHappinessHit);
    const hasMed = cond.medications.some(function(mid) {
      return m.medications.some(function(x) { return x.id === mid; });
    });
    if (hasMed) {
      S.health = Math.min(100, S.health + Math.round(cond.annualHealthHit * 0.5));
      S.happiness = Math.min(100, S.happiness + Math.round(cond.annualHappinessHit * 0.4));
    }
    if (cond.deathRiskPerYear > 0 && Math.random() < cond.deathRiskPerYear) {
      log('💔 The ' + cond.label + ' has become fatal.');
      if (typeof S.alive === 'undefined') S.alive = false;
    }
  });

  /* Remove healed conditions */
  conditionsToRemove.forEach(function(cid) {
    m.conditions = m.conditions.filter(function(c) { return c.id !== cid; });
  });

  /* Process pending tests (yearly pace or legacy results without resultAbsMonth) */
  m.tests = m.tests.filter(function(t) {
    if (t.resultAbsMonth) return true;  /* handled by month hook */
    if (t.resultYear > year) return true;
    const def = MED_TESTS.find(function(d) { return d.id === t.id; });
    if (!def) return false;
    /* Roll detection */
    const undetected = def.detects.filter(function(cid) { return !medHasCondition(cid); });
    if (undetected.length && Math.random() < 0.5) {
      medAddCondition(undetected[0]);
    } else {
      log('🧪 ' + def.label + ' results: normal.');
    }
    return false;
  });

  /* Process pending surgeries */
  m.pendingSurgeries = m.pendingSurgeries.filter(function(s) {
    if (s.scheduledYear > year) return true;
    const def = MED_SURGERIES.find(function(d) { return d.id === s.id; });
    if (!def) return false;
    const hospital = MED_HOSPITALS.find(function(h) { return h.id === s.hospital; });
    /* Roll complication */
    const complicationChance = hospital ? hospital.complicationRate : 0.1;
    if (Math.random() < complicationChance) {
      log('⚠️ ' + def.label + ' complication occurred. Additional treatment needed.');
      fx({ health: -8 });
    } else {
      def.cures.forEach(function(cid) {
        const c = m.conditions.find(function(x) { return x.id === cid; });
        if (c) c.treated = true;
      });
      log('✅ ' + def.label + ' completed successfully.');
      fx({ health: 10, happiness: 5 });
    }
    m.records.unshift({ year: year, type: 'surgery', label: def.label, hospital: hospital ? hospital.label : '' });
    return false;
  });

  /* Mental health — depression progression */
  if (S.happiness < 30) {
    m.mentalHealth.depressionYears = (m.mentalHealth.depressionYears || 0) + 1;
    if (m.mentalHealth.depressionYears >= 2 && !medHasCondition('depression')) {
      medAddCondition('depression');
    }
    if (m.mentalHealth.depressionYears >= 4 && !medHasCondition('severe_depression')) {
      medAddCondition('severe_depression');
    }
  } else if (S.happiness > 60) {
    m.mentalHealth.depressionYears = Math.max(0, (m.mentalHealth.depressionYears || 0) - 1);
    /* Therapy can cure depression */
    if (m.mentalHealth.therapyActive && medHasCondition('depression') && Math.random() < 0.3) {
      medRemoveCondition('depression');
      log('🎉 Depression resolved through therapy!');
    }
  }

  /* Therapy bonus — restore happiness */
  if (m.mentalHealth.therapyActive) {
    fx({ happiness: 3 });
  }
  /* Psychiatric medication bonus */
  if (m.mentalHealth.medicationActive) {
    fx({ happiness: 2 });
  }

  /* Fertility decline with age */
  const playerIsFemale = S.gender === 'f';
  if (playerIsFemale && S.age > 30) m.fertility.playerFertility = Math.max(0, m.fertility.playerFertility - (S.age > 35 ? 4 : 2));
  if (!playerIsFemale && S.age > 40) m.fertility.playerFertility = Math.max(0, m.fertility.playerFertility - 1);

  /* Random events */
  if (Math.random() < 0.10) {
    const eligible = MED_RANDOM_EVENTS.filter(function(e) {
      if (e.minAge && S.age < e.minAge) return false;
      if (e.requires && e.requires.length) {
        return e.requires.some(function(cid) { return medHasCondition(cid); });
      }
      return true;
    });
    if (eligible.length) {
      const totalW = eligible.reduce(function(s, e) { return s + e.weight; }, 0);
      let roll = Math.random() * totalW;
      for (let i = 0; i < eligible.length; i++) {
        roll -= eligible[i].weight;
        if (roll <= 0) {
          const ev = eligible[i];
          log('🚨 ' + ev.label + ': ' + ev.text);
          if (ev.createsCondition) {
            medAddCondition(ev.createsCondition);
          }
          if (ev.healthHit) {
            S.health = Math.max(0, S.health + ev.healthHit);
          }
          break;
        }
      }
    }
  }

  /* Clamp */
  S.health = Math.max(0, Math.min(100, S.health));
  S.happiness = Math.max(0, Math.min(100, S.happiness));
  S.medical.fertility.playerFertility = Math.max(0, Math.min(100, S.medical.fertility.playerFertility));
});
/* ============================================================
   MONTHLY MEDICAL PROGRESS (monthly pace only)
   ============================================================ */
GameHooks.on('month', function() {
  ensureMedicalState();
  if (!S || !isMonthly()) return;
  const m = S.medical;

  /* Process tests that are due this month */
  const currentAbs = (gameYear() - 2001) * 12 + currentMonth();
  m.tests = m.tests.filter(function(t) {
    if (!t.resultAbsMonth) return true;  /* not pace-tracked — let year tick handle */
    if (currentAbs < t.resultAbsMonth) return true;
    const def = MED_TESTS.find(function(d) { return d.id === t.id; });
    if (!def) return false;
    const undetected = def.detects.filter(function(cid) { return !medHasCondition(cid); });
    if (undetected.length && Math.random() < 0.5) {
      medAddCondition(undetected[0]);
    } else {
      log('🧪 ' + def.label + ' results: normal.');
    }
    return false;
  });

  /* Progress condition healing monthly */
  m.conditions.forEach(function(c) {
    if (!c.progressMonths) c.progressMonths = 0;
    const cond = medConditionById(c.id);
    if (!cond) return;
    const rule = _medGetHealRule(c.id);
    if (!rule) return;

    /* Natural healing */
    if (rule.naturalMonths && !c.treated) {
      c.progressMonths += 1;
      if (c.progressMonths >= rule.naturalMonths) {
        log('✅ ' + cond.label + ' healed naturally.');
        m.conditions = m.conditions.filter(function(x) { return x.id !== c.id; });
        return;
      }
    }
    /* Meds healing */
    if (rule.medsMonths) {
      const hasMeds = (rule.medIds || []).some(function(mid) {
        return m.medications.some(function(x) { return x.id === mid; });
      });
      if (hasMeds) {
        c.progressMonths += 1;
        if (c.progressMonths >= rule.medsMonths) {
          log('✅ ' + cond.label + ' cured by medication.');
          m.conditions = m.conditions.filter(function(x) { return x.id !== c.id; });
        }
      }
    }
  });
});
/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'medical', label: '🏥 Medical', order: 11, view: medicalView });
