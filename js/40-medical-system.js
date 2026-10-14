/* =====================================================================
   40. MEDICAL & FERTILITY SYSTEM
   Adds a Medical tab with:
   - Health insurance (employer-provided or bought)
   - Doctor visits (specialist / consultant fees)
   - Lab tests, scans, checkups
   - Illness events (heart, kidney, general) with real costs
   - Fertility: try-for-baby with realistic chance per year
   - Fertility diagnosis + IVF (أطفال أنابيب)
   - Pregnancy tests, wife pregnancy announcements
   Load AFTER 39-bank-bug-fix.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. STATE ============ */
function p40Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.medical) {
    o.medical = {
      hasInsurance: false,
      insuranceTier: 'none',         // 'none' | 'basic' | 'premium'
      insuranceRenewYear: -1,
      conditions: [],                 // active conditions (heart, kidney, diabetes...)
      lastCheckupYear: -1,
      fertility: {
        playerFertility: null,        // 0-100, generated on first use
        wifeFertility: null,
        lastTryYear: -1,
        diagnosisDone: false,
        ivfAttempts: 0,
        ivfLastYear: -1,
        pendingResult: null
      },
      pendingPregnancyTest: null
    };
  }
  if (!o.medical.fertility) o.medical.fertility = { playerFertility: null, wifeFertility: null, lastTryYear: -1, diagnosisDone: false, ivfAttempts: 0, ivfLastYear: -1, pendingResult: null };
  if (!Array.isArray(o.medical.conditions)) o.medical.conditions = [];
}
const P40_migrate = migrate;
migrate = function (o) { const r = P40_migrate(o); p40Init(r); return r; };
const P40_newGame = newGame;
newGame = function () { P40_newGame.apply(this, arguments); p40Init(S); };

/* ============ 2. HELPERS ============ */
function p40Rate() { return (typeof rateNow === 'function') ? rateNow() : 1; }
function p40Cost(egp) { return Math.round(egp) / p40Rate(); }
function p40Price(egp2026) {
  const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  return Math.round(egp2026 * idx);
}
function p40Paid(egp, label) {
  const internal = p40Cost(p40Price(egp));
  if (S.wealth < internal) return false;
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill[label] = (S.bill[label] || 0) + internal;
  return true;
}

/* ============ 3. INSURANCE ============ */
function p40EmployerCoversInsurance() {
  return !!(S && S.job && S.job.benefits && S.job.benefits.medical);
}
function p40BuyInsurance(tier) {
  p40Init();
  if (S.age < 18) return hint('Insurance is bought by adults.');
  const prices = { basic: 3500, premium: 5500 };
  const egp = prices[tier];
  if (!egp) return hint('Invalid tier.');
  if (!p40Paid(egp, 'insurance')) return hint('Not enough cash for ' + Math.round(p40Price(egp)).toLocaleString() + ' EGP premium.');
  S.medical.hasInsurance = true;
  S.medical.insuranceTier = tier;
  S.medical.insuranceRenewYear = gameYear();
  log('You bought ' + tier + ' health insurance for ' + Math.round(p40Price(egp)).toLocaleString() + ' EGP/year.');
  realismNotice('Health insurance active', tier === 'premium' ? 'Premium plan: 85% coverage, max 250,000 EGP/year.' : 'Basic plan: 60% coverage, max 100,000 EGP/year.');
  render();
}
function p40CancelInsurance() {
  if (S.medical.insuranceTier === 'none') return hint('No insurance to cancel.');
  S.medical.hasInsurance = false;
  S.medical.insuranceTier = 'none';
  log('You cancelled your health insurance.');
  render();
}
function p40CoverageRatio() {
  if (p40EmployerCoversInsurance()) return 0.75;
  if (S.medical.insuranceTier === 'premium') return 0.85;
  if (S.medical.insuranceTier === 'basic') return 0.60;
  return 0;
}
function p40InsuranceCap() {
  if (p40EmployerCoversInsurance()) return 150000;
  if (S.medical.insuranceTier === 'premium') return 250000;
  if (S.medical.insuranceTier === 'basic') return 100000;
  return 0;
}
function p40PayBill(egp, label) {
  const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  const egpThisYear = egp * idx;
  const coverage = p40CoverageRatio();
  const cap = p40InsuranceCap();
  const covered = Math.min(egpThisYear * coverage, cap);
  const outOfPocket = Math.max(0, egpThisYear - covered);
  if (!p40Paid(outOfPocket, label)) {
    log('You could not cover the medical bill. Debt or unpaid treatment may follow.');
    S.wealth -= p40Cost(outOfPocket * 0.4);
    S.bill = S.bill || {};
    S.bill.medicalDebt = (S.bill.medicalDebt || 0) + p40Cost(outOfPocket * 0.4);
    return false;
  }
  if (covered > 0) log('Insurance covered ' + Math.round(covered).toLocaleString() + ' EGP; you paid ' + Math.round(outOfPocket).toLocaleString() + ' EGP.');
  return true;
}

/* ============ 4. DOCTOR VISITS & CHECKUPS ============ */
function p40DoctorVisit(level) {
  if (S.age < 18) return hint('Book doctor visits from age 18.');
  const prices = { specialist: 500, consultant: 1000, scan: 300, echo: 500 };
  const egp = prices[level];
  if (!p40Paid(egp, 'medicalVisit')) return hint('You need ' + Math.round(p40Price(egp)).toLocaleString() + ' EGP for the visit.');
  const result = Math.random();
  if (result < 0.15) {
    S.medical.conditions = S.medical.conditions || [];
    const conditions = ['hypertension', 'type-2 diabetes', 'high cholesterol', 'anemia'];
    const c = conditions[Math.floor(Math.random() * conditions.length)];
    if (!S.medical.conditions.includes(c)) S.medical.conditions.push(c);
    log('Doctor visit: you were diagnosed with ' + c + '. Treatment and follow-up will be needed.');
    realismNotice('Diagnosis', 'You were diagnosed with ' + c + '. Take it seriously — ongoing care matters.');
  } else {
    log('Doctor visit: everything looked normal. ' + (level === 'consultant' ? 'The consultant' : 'The specialist') + ' gave you advice for a healthier routine.');
    fx({ health: 2 });
  }
  render();
}
function p40FullCheckup() {
  if (S.age < 18) return hint('Full checkups are for adults.');
  const egp = 1450;
  if (!p40Paid(egp, 'medicalCheckup')) return hint('You need ' + Math.round(p40Price(egp)).toLocaleString() + ' EGP for a full checkup.');
  S.medical.lastCheckupYear = gameYear();
  const roll = Math.random();
  if (roll < 0.20) {
    const conditions = ['kidney issues', 'liver concerns', 'early heart disease', 'thyroid problem'];
    const c = conditions[Math.floor(Math.random() * conditions.length)];
    S.medical.conditions = S.medical.conditions || [];
    if (!S.medical.conditions.includes(c)) S.medical.conditions.push(c);
    log('Full checkup revealed: ' + c + '. Early detection helps, but treatment is needed.');
    realismNotice('Full checkup', 'Early sign of ' + c + ' found. Book follow-up with a specialist.');
  } else {
    log('Full checkup: all results normal. You feel reassured.');
    fx({ health: 3, happiness: 2 });
  }
  render();
}
function p40LabTests() {
  if (S.age < 18) return;
  const egp = 510;
  if (!p40Paid(egp, 'medicalLabs')) return hint('You need ' + Math.round(p40Price(egp)).toLocaleString() + ' EGP.');
  if (Math.random() < 0.15) {
    const c = Math.random() < 0.5 ? 'vitamin D deficiency' : 'mild anemia';
    S.medical.conditions = S.medical.conditions || [];
    if (!S.medical.conditions.includes(c)) S.medical.conditions.push(c);
    log('Lab tests found ' + c + '. Supplements and diet changes recommended.');
  } else {
    log('Lab tests all normal.');
    fx({ health: 1 });
  }
  render();
}

/* ============ 5. ILLNESS EVENTS ============ */
function p40IllnessEvent() {
  if (!S || S.age < 18) return;
  if (Math.random() > 0.15) return;

  const types = [
    { id: 'flu',       label: 'a bad flu',                    egp: 800,   hp: -3 },
    { id: 'stomach',   label: 'stomach issues',               egp: 1500,  hp: -4 },
    { id: 'back',      label: 'back pain',                    egp: 3000,  hp: -5 },
    { id: 'kidney',    label: 'a kidney stone',               egp: 15000, hp: -10 },
    { id: 'heart',     label: 'chest pain (heart concerns)',  egp: 45000, hp: -18 },
    { id: 'appendix',  label: 'appendicitis (surgery)',       egp: 35000, hp: -12 }
  ];
  const weights = [0.4, 0.25, 0.15, 0.10, 0.05, 0.05];
  let r = Math.random(), pick = types[0], acc = 0;
  for (let i = 0; i < types.length; i++) {
    acc += weights[i];
    if (r <= acc) { pick = types[i]; break; }
  }
  const egpThisYear = p40Price(pick.egp);
  const coverage = p40CoverageRatio();
  const outOfPocket = Math.round(egpThisYear * (1 - coverage));
  log('Medical emergency: ' + pick.label + '. Estimated cost ' + egpThisYear.toLocaleString() + ' EGP' + (coverage > 0 ? ' (insurance covers ' + Math.round(coverage * 100) + '%)' : '') + '.');
  realismNotice('Medical emergency', 'You got ' + pick.label + '. ' + (coverage > 0 ? 'Insurance will cover part of it. ' : 'No insurance — you pay everything. ') + 'Estimated out-of-pocket: ' + outOfPocket.toLocaleString() + ' EGP.');
  S.medical.pendingIllness = { type: pick.id, egp: egpThisYear, hp: pick.hp, label: pick.label };
  fx({ health: pick.hp, happiness: -5 });
}

/* ============ 6. FERTILITY ============ */
function p40InitFertility() {
  p40Init();
  const f = S.medical.fertility;
  if (f.playerFertility == null) {
    /* Player fertility: 55-95 baseline, drops with age */
    let base = 85;
    if (S.age >= 30) base -= (S.age - 30) * 1.2;
    if (S.age >= 45) base -= (S.age - 45) * 2;
    f.playerFertility = Math.max(5, Math.min(95, Math.round(base + (Math.random() * 20 - 10))));
  }
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (spouse && f.wifeFertility == null) {
    /* Wife fertility drops after 30, steeper after 35 */
    let base = 90;
    const a = spouse.age || 25;
    if (a >= 30) base -= (a - 30) * 2.2;
    if (a >= 35) base -= (a - 35) * 3.5;
    if (a >= 40) base -= (a - 40) * 4;
    f.wifeFertility = Math.max(2, Math.min(95, Math.round(base + (Math.random() * 15 - 7))));
  }
}
function p40TryForBaby() {
  p40Init();
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || spouse.stage !== 'married') return hint('You need a spouse.');
  const f = S.medical.fertility;
  p40InitFertility();
  if (f.lastTryYear === gameYear()) return hint('You already tried this year.');

  f.lastTryYear = gameYear();

  /* Combined chance: sqrt of product of both, divided per year attempt */
  const playerFert = f.playerFertility / 100;
  const wifeFert = f.wifeFertility / 100;
  const baseChance = Math.sqrt(playerFert * wifeFert) * 0.35; /* 35% of max per year */
  const chance = Math.max(0.02, Math.min(0.55, baseChance));

  const success = Math.random() < chance;

  if (success) {
    /* Pregnancy! Delay 1 year for birth */
    S.medical.pendingPregnancy = {
      wifeId: spouse.id,
      year: gameYear(),
      months: 0
    };
    const msg = spouse.name + ' is pregnant! The baby will arrive next year.';
    log(msg);
    realismNotice('Pregnancy!', msg + ' Prepare for the birth. Costs, childcare and life changes are coming.');
  } else {
    /* Higher chance of asking for fertility treatment if repeated failures */
    const failed = (S.medical.fertility.attempts || 0) + 1;
    S.medical.fertility.attempts = failed;
    const msg = spouse.name + ' did not become pregnant this year.';
    log(msg);
    realismNotice('Not this year', msg + (failed >= 2 ? ' Consider a fertility consultation in the Medical tab.' : ' Try again next year or consult a doctor.'));
  }
  render();
}
function p40FertilityConsult() {
  p40Init();
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || spouse.stage !== 'married') return hint('You need a spouse.');
  const egp = 1500; /* consultant visit + tests */
  if (!p40Paid(egp, 'fertilityConsult')) return hint('You need ' + Math.round(p40Price(egp)).toLocaleString() + ' EGP.');
  p40InitFertility();
  S.medical.fertility.diagnosisDone = true;
  const f = S.medical.fertility;
  const playerOK = f.playerFertility >= 40;
  const wifeOK = f.wifeFertility >= 40;
  let msg = 'Consultant tests: your fertility is ' + f.playerFertility + '%, your wife\'s is ' + f.wifeFertility + '%. ';
  if (playerOK && wifeOK) msg += 'No major issue found. Keep trying naturally.';
  else if (!playerOK && !wifeOK) msg += 'Both show low fertility. IVF (أطفال أنابيب) is strongly recommended.';
  else if (!playerOK) msg += 'Your fertility is low. IVF may be needed.';
  else msg += 'Your wife\'s fertility is low. IVF may be needed.';
  log(msg);
  realismNotice('Fertility diagnosis', msg);
  render();
}
function p40IVF() {
  p40Init();
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || spouse.stage !== 'married') return hint('You need a spouse.');
  const f = S.medical.fertility;
  if (!f.diagnosisDone) return hint('Complete a fertility consultation first.');
  if (f.ivfLastYear === gameYear()) return hint('One IVF attempt per year.');

  /* Total cost: procedure 35,000 + drugs 15,000 = 50,000 EGP */
  const procedure = p40Price(45000);
  const drugs = p40Price(15000);
  const total = procedure + drugs;
  const coverage = p40CoverageRatio();
  const outOfPocket = Math.round(total * (1 - coverage * 0.3)); /* IVF rarely covered fully */
  const internal = p40Cost(outOfPocket);
  if (S.wealth < internal) return hint('IVF costs about ' + outOfPocket.toLocaleString() + ' EGP out of pocket. You cannot afford it.');

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.ivf = (S.bill.ivf || 0) + internal;
  f.ivfLastYear = gameYear();
  f.ivfAttempts = (f.ivfAttempts || 0) + 1;

  /* IVF success: depends on wife's age and fertility */
  const ageFactor = Math.max(0.15, 1 - Math.max(0, (spouse.age - 30) * 0.025));
  const fertFactor = Math.max(0.2, f.wifeFertility / 100);
  const chance = Math.max(0.10, Math.min(0.55, 0.35 * ageFactor * fertFactor));

  const success = Math.random() < chance;
  if (success) {
    S.medical.pendingPregnancy = { wifeId: spouse.id, year: gameYear(), viaIVF: true };
    log('IVF cycle succeeded! ' + spouse.name + ' is pregnant.');
    realismNotice('IVF success', spouse.name + ' is pregnant after IVF. The baby arrives next year.');
  } else {
    log('IVF cycle did not succeed this time. Cost ' + outOfPocket.toLocaleString() + ' EGP. Attempt ' + f.ivfAttempts + '.');
    realismNotice('IVF unsuccessful', 'The IVF cycle failed. This happens. You may try again next year — the chance is roughly ' + Math.round(chance * 100) + '%.');
  }
  render();
}
function p40BabyBorn() {
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse) return;
  const kid = (typeof addMember === 'function') ? addMember('Child', 0, 85) : null;
  if (kid) {
    kid.g = Math.random() < 0.5 ? 'f' : 'm';
    kid.name = (typeof localName === 'function') ? localName(S.country, kid.g) : 'Baby';
    kid.bond = 90;
    log('Your child ' + kid.name + ' was born!');
    realismNotice('A child is born', spouse.name + ' gave birth to a healthy baby, ' + kid.name + '. Congratulations.');
  }
  fx({ happiness: 12, health: -2 });
  /* Birth costs */
  const birthCost = p40Price(25000);
  const coverage = p40CoverageRatio();
  const outOfPocket = Math.round(birthCost * (1 - coverage));
  p40Paid(outOfPocket, 'birthCost');
  S.medical.pendingPregnancy = null;
}

/* ============ 7. YEARLY ============ */
function p40Year() {
  p40Init();
  if (!S || S.age < 18) return;

  /* Insurance renewal */
  if (S.medical.hasInsurance && S.medical.insuranceTier !== 'none') {
    const prices = { basic: 3500, premium: 5500 };
    const egp = prices[S.medical.insuranceTier];
    if (p40Paid(egp, 'insurance')) {
      S.medical.insuranceRenewYear = gameYear();
      log('Health insurance renewed for ' + Math.round(p40Price(egp)).toLocaleString() + ' EGP.');
    } else {
      log('You could not renew health insurance. Coverage lapsed.');
      S.medical.hasInsurance = false;
    }
  }

  /* Illness event */
  p40IllnessEvent();

  /* Resolve pending illness if not yet paid */
  if (S.medical.pendingIllness) {
    const ill = S.medical.pendingIllness;
    const coverage = p40CoverageRatio();
    const outOfPocket = Math.round(ill.egp * (1 - coverage));
    if (p40Paid(outOfPocket, 'medicalEmergency')) {
      log('Medical treatment completed for ' + ill.label + '.');
      fx({ health: Math.min(20, -ill.hp / 2) });
    } else {
      log('You could not afford full treatment for ' + ill.label + '. Health remains affected.');
    }
    S.medical.pendingIllness = null;
  }

  /* Pregnancy progress */
  if (S.medical.pendingPregnancy) {
    p40BabyBorn();
  }

  /* Chronic conditions cost */
  (S.medical.conditions || []).forEach(c => {
    const monthlyMed = 800;
    const annual = p40Price(monthlyMed * 12);
    if (p40Paid(annual, 'chronicMeds')) {
      log('Chronic condition care for ' + c + ': ' + Math.round(annual).toLocaleString() + ' EGP this year.');
    } else {
      fx({ health: -3 });
      log('You could not pay for chronic condition care. Your health is affected.');
    }
  });

  /* Age-related health decline */
  if (S.age > 45) fx({ health: -Math.ceil((S.age - 45) / 10) });
}
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('year', p40Year);
}

/* ============ 8. VIEW ============ */
function viewMedical() {
  p40Init();
  if (!S || S.age < 18) {
    return '<section class="card"><h3>🏥 Medical</h3><p class="muted">Medical services unlock at age 18.</p></section>';
  }

  const spouse = (typeof partner === 'function') ? partner() : null;
  const f = S.medical.fertility;
  const coverage = p40CoverageRatio();

  let html = '<section class="card"><h3>🏥 Health dashboard</h3>' +
    '<div class="row"><span>Health</span><b>' + S.health + '%</b></div>';

  let insLabel = 'None — you pay everything';
  if (p40EmployerCoversInsurance()) insLabel = 'Employer plan (75% covered, cap 150,000 EGP/yr)';
  else if (S.medical.insuranceTier === 'premium') insLabel = 'Premium (85% covered, cap 250,000 EGP/yr)';
  else if (S.medical.insuranceTier === 'basic') insLabel = 'Basic (60% covered, cap 100,000 EGP/yr)';

  html += '<div class="row"><span>Insurance</span><b>' + insLabel + '</b></div>';
  if ((S.medical.conditions || []).length) {
    html += '<div class="row"><span>Chronic conditions</span><b style="color:var(--amber)">' + S.medical.conditions.join(', ') + '</b></div>';
  } else {
    html += '<div class="row"><span>Chronic conditions</span><b style="color:var(--mint)">None</b></div>';
  }
  html += '</section>';

  /* Insurance purchase (only if no employer plan) */
  if (!p40EmployerCoversInsurance()) {
    html += '<section class="card"><h3>💊 Health insurance</h3>' +
      '<p class="muted">Egyptian private health insurance in 2026 costs around 3,500–5,500 EGP per year for a family. Without insurance, one hospital stay can wipe out savings.</p>';
    if (S.medical.insuranceTier === 'none') {
      html += '<button class="btn" onclick="p40BuyInsurance(\'basic\')">Buy basic plan · ' + Math.round(p40Price(3500)).toLocaleString() + ' EGP/yr<small>60% coverage, 100,000 EGP cap</small></button>' +
              '<button class="btn" onclick="p40BuyInsurance(\'premium\')">Buy premium plan · ' + Math.round(p40Price(5500)).toLocaleString() + ' EGP/yr<small>85% coverage, 250,000 EGP cap</small></button>';
    } else {
      html += '<button class="btn" onclick="p40CancelInsurance()">Cancel insurance</button>';
    }
    html += '</section>';
  } else {
    html += '<section class="card"><h3>💊 Health insurance</h3><p class="muted">Your employer provides medical coverage. 75% of most bills are covered up to 150,000 EGP/year.</p></section>';
  }

  /* Doctor visits */
  html += '<section class="card"><h3>🩺 Doctor visits & tests</h3>' +
    '<p class="muted">Egyptian 2026 prices: specialist 500 EGP, consultant 1,000 EGP, ultrasound +300, echo/4D +500, full checkup 1,450 EGP.</p>' +
    '<button class="btn" onclick="p40DoctorVisit(\'specialist\')">Specialist visit · ' + Math.round(p40Price(500)).toLocaleString() + ' EGP</button>' +
    '<button class="btn" onclick="p40DoctorVisit(\'consultant\')">Consultant visit · ' + Math.round(p40Price(1000)).toLocaleString() + ' EGP</button>' +
    '<button class="btn" onclick="p40LabTests()">Basic lab tests · ' + Math.round(p40Price(510)).toLocaleString() + ' EGP</button>' +
    '<button class="btn" onclick="p40FullCheckup()">Full checkup · ' + Math.round(p40Price(1450)).toLocaleString() + ' EGP<small>Heart, kidney, liver, diabetes, cholesterol</small></button>' +
    '</section>';

  /* Fertility section */
  if (spouse && spouse.stage === 'married') {
    p40InitFertility();
    html += '<section class="card"><h3>👶 Fertility & family planning</h3>';

    if (S.medical.pendingPregnancy) {
      html += '<p class="muted" style="color:var(--mint)"><b>' + spouse.name + ' is pregnant.</b> The baby will arrive next year.</p>';
    } else {
      /* Show attempts */
      const attempts = f.attempts || 0;
      html += '<div class="row"><span>Natural attempts</span><b>' + attempts + '</b></div>';

      if (f.diagnosisDone) {
        const playerColor = f.playerFertility >= 40 ? 'var(--mint)' : 'var(--rose)';
        const wifeColor = f.wifeFertility >= 40 ? 'var(--mint)' : 'var(--rose)';
        html += '<div class="row"><span>Your fertility</span><b style="color:' + playerColor + '">' + f.playerFertility + '%</b></div>';
        html += '<div class="row"><span>' + spouse.name + '\'s fertility</span><b style="color:' + wifeColor + '">' + f.wifeFertility + '%</b></div>';
        html += '<p class="muted" style="font-size:.82rem">Fertility falls with age, especially after 30 for women and after 35 for men. IVF can help if natural attempts fail.</p>';
      }

      /* Try for baby button */
      if (f.lastTryYear !== gameYear()) {
        html += '<button class="btn" onclick="p40TryForBaby()">Try for a baby this year<small>Natural conception — success depends on both your fertilities</small></button>';
      } else {
        html += '<p class="muted" style="font-size:.82rem">You already tried this year.</p>';
      }

      /* Consultant button */
      if (!f.diagnosisDone) {
        html += '<button class="btn" onclick="p40FertilityConsult()">Book fertility consultation · ' + Math.round(p40Price(1500)).toLocaleString() + ' EGP<small>Doctor visit + lab tests + ultrasound</small></button>';
      }

      /* IVF */
      if (f.diagnosisDone) {
        const ivfTotal = p40Price(60000); /* procedure + drugs */
        const covered = Math.round(ivfTotal * coverage * 0.3);
        const outPocket = ivfTotal - covered;
        if (f.ivfLastYear !== gameYear()) {
          html += '<button class="btn" onclick="p40IVF()">Do IVF (أطفال أنابيب) · ' + outPocket.toLocaleString() + ' EGP out of pocket<small>Procedure ~45,000 + drugs ~15,000 EGP. Success rate 20–50% based on age</small></button>';
        } else {
          html += '<p class="muted" style="font-size:.82rem">One IVF attempt per year.</p>';
        }
      }
    }
    html += '</section>';
  }

  return html;
}

/* Register the tab */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    const nav = document.getElementById('tabs');
    if (!nav || nav.querySelector('[data-tab="medical"]')) return;
    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = 'medical';
    btn.textContent = 'Medical';
    btn.onclick = function () {
      activeTab = 'medical';
      if (typeof render === 'function') render();
    };
    nav.insertBefore(btn, nav.lastElementChild);
  });
}

/* Override the render dispatcher so 'medical' works */
const P40_renderBeforeMedical = render;
render = function () {
  /* Add medical to the dispatcher if not present */
  const origTab = activeTab;
  if (origTab === 'medical') {
    const tabs = document.getElementById('tabs');
    if (tabs) {
      /* Ensure the button is marked active */
      tabs.querySelectorAll('.tab').forEach(b => { b.classList.remove('on'); });
      const me = tabs.querySelector('[data-tab="medical"]');
      if (me) me.classList.add('on');
    }
    const view = document.getElementById('view');
    const top = document.getElementById('top');
    if (view) {
      /* Temporarily point activeTab at 'life' so the render dispatcher runs, then replace */
      activeTab = 'life';
      P40_renderBeforeMedical();
      activeTab = 'medical';
      if (view) view.innerHTML = viewMedical();
      if (tabs) {
        tabs.querySelectorAll('.tab').forEach(b => { b.classList.remove('on'); });
        const me2 = tabs.querySelector('[data-tab="medical"]');
        if (me2) me2.classList.add('on');
      }
      if (typeof save === 'function') save();
      return;
    }
  }
  return P40_renderBeforeMedical.apply(this, arguments);
};
