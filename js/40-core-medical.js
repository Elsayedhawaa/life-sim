/* =====================================================================
   40. CORE MEDICAL (Phase 3.3 + Robust Tab Injection)
   Consolidated File:
   - Advanced Medical State, Doctor Visits, Lab Tests
   - Employer Insurance, Private Insurance, Sick Leave
   - Pending Medical Bills & Installment Conversions
   - Student Loans
   - Fertility System (IVF, Try for baby, Births)
   - Home Ownership Banner Integrations
   - Robust Tab Injection & Routing (No disappearing tabs)
   - Job Loss Clarity Notifications
   Load AFTER 39-bank-bug-fix.js and BEFORE 41-family-marriage-gift-fix.js
   ===================================================================== */

(function p40CoreMedical() {
  'use strict';

  /* =================================================================
     PART 1 — STATE
     ================================================================= */
  function p40Init(o) {
    o = o || S;
    if (!o) return;

    if (!o.medical || typeof o.medical !== 'object') o.medical = {};
    const m = o.medical;
    if (typeof m.hasInsurance !== 'boolean') m.hasInsurance = false;
    if (typeof m.insuranceTier !== 'string') m.insuranceTier = 'none';
    if (typeof m.insuranceRenewYear !== 'number') m.insuranceRenewYear = -1;
    if (!Array.isArray(m.conditions)) m.conditions = [];
    if (typeof m.lastCheckupYear !== 'number') m.lastCheckupYear = -1;
    if (!m.fertility || typeof m.fertility !== 'object') {
      m.fertility = { playerFertility: null, wifeFertility: null, lastTryYear: -1, diagnosisDone: false, ivfAttempts: 0, ivfLastYear: -1, pendingResult: null, attempts: 0 };
    }
    if (typeof m.pendingPregnancyTest === 'undefined') m.pendingPregnancyTest = null;
    if (typeof m.pendingPregnancy === 'undefined') m.pendingPregnancy = null;
    if (typeof m.pendingIllness === 'undefined') m.pendingIllness = null;

    if (!o.p45 || typeof o.p45 !== 'object') {
      o.p45 = { employerInsuranceAsked: -1, employerInsurance: false, employerInsuranceRefused: [],
                pendingMedicalBills: [], sickLeaveUsed: 0, unpaidLeaveDays: 0 };
    }
    const p45 = o.p45;
    if (typeof p45.employerInsuranceAsked !== 'number') p45.employerInsuranceAsked = -1;
    if (typeof p45.employerInsurance !== 'boolean') p45.employerInsurance = false;
    if (!Array.isArray(p45.employerInsuranceRefused)) p45.employerInsuranceRefused = [];
    if (!Array.isArray(p45.pendingMedicalBills)) p45.pendingMedicalBills = [];
    if (typeof p45.sickLeaveUsed !== 'number') p45.sickLeaveUsed = 0;
    if (typeof p45.unpaidLeaveDays !== 'number') p45.unpaidLeaveDays = 0;
  }
  const _migrate = migrate;
  migrate = function (o) { const r = _migrate(o); p40Init(r); return r; };
  const _newGame = newGame;
  newGame = function () { _newGame.apply(this, arguments); p40Init(S); };

  function p40Rate() { return (typeof rateNow === 'function') ? rateNow() : 1; }
  function p40Price(egp2026) {
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
    return Math.round(egp2026 * idx);
  }
  function p40Cost(egp) { return Math.round(egp) / p40Rate(); }
  function p40Paid(egp, label) {
    const internal = p40Cost(p40Price(egp));
    if (S.wealth < internal) return false;
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill[label] = (S.bill[label] || 0) + internal;
    return true;
  }

  /* =================================================================
     PART 2 — INSURANCE COVERAGE
     ================================================================= */
  function p40EmployerCoversInsurance() {
    return !!(S && S.job && S.job.benefits && S.job.benefits.medical);
  }
  function p40CoverageRatio() {
    if (S && S.p45 && S.p45.employerInsurance) return 0.75;
    if (p40EmployerCoversInsurance()) return 0.75;
    if (S && S.medical) {
      if (S.medical.insuranceTier === 'premium') return 0.85;
      if (S.medical.insuranceTier === 'basic') return 0.60;
      if (S.medical.insuranceTier === 'employer') return 0.75;
    }
    return 0;
  }
  function p40InsuranceCap() {
    if (S && S.p45 && S.p45.employerInsurance) return 150000;
    if (p40EmployerCoversInsurance()) return 150000;
    if (S && S.medical) {
      if (S.medical.insuranceTier === 'premium') return 250000;
      if (S.medical.insuranceTier === 'basic') return 100000;
    }
    return 0;
  }
  function p45InsuranceCoverage() {
    if (S && S.p45 && S.p45.employerInsurance) return { ratio: 0.75, cap: 150000, source: 'employer' };
    if (p40EmployerCoversInsurance()) return { ratio: 0.75, cap: 150000, source: 'employer' };
    if (S && S.medical) {
      if (S.medical.insuranceTier === 'premium') return { ratio: 0.85, cap: 250000, source: 'private-premium' };
      if (S.medical.insuranceTier === 'basic') return { ratio: 0.60, cap: 100000, source: 'private-basic' };
    }
    return { ratio: 0, cap: 0, source: 'none' };
  }

  window.p40BuyInsurance = function (tier) {
    p40Init(S);
    if (S.age < 18) return hint('Insurance is bought by adults.');
    const prices = { basic: 3500, premium: 5500 };
    const egp = prices[tier];
    if (!egp) return hint('Invalid tier.');
    if (!p40Paid(egp, 'insurance')) return hint('Not enough cash for EGP ' + p40Price(egp).toLocaleString() + ' premium.');
    S.medical.hasInsurance = true;
    S.medical.insuranceTier = tier;
    S.medical.insuranceRenewYear = gameYear();
    log('You bought ' + tier + ' health insurance for EGP ' + p40Price(egp).toLocaleString() + '/year.');
    if (typeof realismNotice === 'function') realismNotice('Health insurance active', tier === 'premium' ? 'Premium plan: 85% coverage, max 250,000 EGP/year.' : 'Basic plan: 60% coverage, max 100,000 EGP/year.');
    render();
  };
  window.p40CancelInsurance = function () {
    p40Init(S);
    if (S.medical.insuranceTier === 'none') return hint('No insurance to cancel.');
    S.medical.hasInsurance = false;
    S.medical.insuranceTier = 'none';
    log('You cancelled your health insurance.');
    render();
  };

  /* =================================================================
     PART 3 — DOCTOR VISITS
     ================================================================= */
  window.p40DoctorVisit = function (level) {
    p40Init(S);
    if (S.age < 18) return hint('Book doctor visits from age 18.');
    const prices = { specialist: 500, consultant: 1000, scan: 300, echo: 500 };
    const egp = prices[level];
    if (!p40Paid(egp, 'medicalVisit')) return hint('You need EGP ' + p40Price(egp).toLocaleString() + ' for the visit.');
    if (Math.random() < 0.15) {
      const c = ['hypertension','type-2 diabetes','high cholesterol','anemia'][Math.floor(Math.random() * 4)];
      if (S.medical.conditions.indexOf(c) === -1) S.medical.conditions.push(c);
      log('Doctor visit: diagnosed with ' + c + '.');
      if (typeof realismNotice === 'function') realismNotice('Diagnosis', 'You were diagnosed with ' + c + '. Take it seriously — ongoing care matters.');
    } else {
      log('Doctor visit: everything normal.');
      fx({ health: 2 });
    }
    render();
  };
  window.p40FullCheckup = function () {
    p40Init(S);
    if (S.age < 18) return hint('Adults only.');
    if (!p40Paid(1450, 'medicalCheckup')) return hint('You need EGP ' + p40Price(1450).toLocaleString() + '.');
    S.medical.lastCheckupYear = gameYear();
    if (Math.random() < 0.20) {
      const c = ['kidney issues','liver concerns','early heart disease','thyroid problem'][Math.floor(Math.random() * 4)];
      if (S.medical.conditions.indexOf(c) === -1) S.medical.conditions.push(c);
      log('Full checkup revealed: ' + c + '.');
      if (typeof realismNotice === 'function') realismNotice('Full checkup', 'Early sign of ' + c + ' found. Book follow-up with a specialist.');
    } else {
      log('Full checkup: all normal.');
      fx({ health: 3, happiness: 2 });
    }
    render();
  };
  window.p40LabTests = function () {
    p40Init(S);
    if (S.age < 18) return;
    if (!p40Paid(510, 'medicalLabs')) return hint('You need EGP ' + p40Price(510).toLocaleString() + '.');
    if (Math.random() < 0.15) {
      const c = Math.random() < 0.5 ? 'vitamin D deficiency' : 'mild anemia';
      if (S.medical.conditions.indexOf(c) === -1) S.medical.conditions.push(c);
      log('Lab tests found ' + c + '.');
    } else { log('Lab tests normal.'); fx({ health: 1 }); }
    render();
  };

  /* =================================================================
     PART 4 — ILLNESS EVENTS 
     ================================================================= */
  function p40IllnessEvent() {
    p40Init(S);
    if (!S || S.age < 18) return;
    if (Math.random() > 0.15) return;
    const types = [
      { id:'flu', label:'a bad flu', egp:800, hp:-3 },
      { id:'stomach', label:'stomach issues', egp:1500, hp:-4 },
      { id:'back', label:'back pain', egp:3000, hp:-5 },
      { id:'kidney', label:'a kidney stone', egp:15000, hp:-10 },
      { id:'heart', label:'chest pain (heart concerns)', egp:45000, hp:-18 },
      { id:'appendix', label:'appendicitis (surgery)', egp:35000, hp:-12 }
    ];
    const weights = [0.4, 0.25, 0.15, 0.10, 0.05, 0.05];
    let r = Math.random(), pick = types[0], acc = 0;
    for (let i = 0; i < types.length; i++) { acc += weights[i]; if (r <= acc) { pick = types[i]; break; } }
    const egpThisYear = p40Price(pick.egp);
    const coverage = p40CoverageRatio();
    const outOfPocket = Math.round(egpThisYear * (1 - coverage));
    log('Medical emergency: ' + pick.label + '. Est cost EGP ' + egpThisYear.toLocaleString() + ' (insurance covers ' + Math.round(coverage * 100) + '%).');
    if (typeof realismNotice === 'function') realismNotice('Medical emergency', 'You got ' + pick.label + '. ' + (coverage > 0 ? 'Insurance will cover part of it. ' : 'No insurance — you pay everything. ') + 'Estimated out-of-pocket: EGP ' + outOfPocket.toLocaleString() + '.');
    S.medical.pendingIllness = { type: pick.id, egp: egpThisYear, hp: pick.hp, label: pick.label };
    fx({ health: pick.hp, happiness: -5 });
  }

  window.p45GenerateMedicalEvent = function () {
    p40Init(S);
    if (!S || S.age < 18) return;
    if (S.p45.pendingMedicalBills.length >= 2) return;
    const ageFactor = S.age >= 40 ? 0.20 : S.age >= 30 ? 0.14 : 0.10;
    const healthFactor = S.health < 40 ? 1.7 : S.health < 60 ? 1.3 : 1.0;
    if (Math.random() > ageFactor * healthFactor) return;

    const events = [
      { id:'flu',      label:'Severe flu with complications',     egp:2500,  days:4,  sev:'minor',    surgery:false, meds:true },
      { id:'foodpois', label:'Food poisoning',                    egp:3500,  days:3,  sev:'minor',    surgery:false, meds:true },
      { id:'back',     label:'Severe back pain / disc issue',     egp:18000, days:7,  sev:'moderate', surgery:false, meds:true },
      { id:'legbreak', label:'Broken leg (accident)',             egp:45000, days:30, sev:'moderate', surgery:true,  meds:true },
      { id:'append',   label:'Appendicitis (emergency surgery)',  egp:55000, days:12, sev:'serious',  surgery:true,  meds:true },
      { id:'kidney',   label:'Kidney stone (needs procedure)',    egp:65000, days:14, sev:'serious',  surgery:true,  meds:true },
      { id:'heart',    label:'Cardiac issue (catheterization)',   egp:180000,days:30, sev:'critical', surgery:true,  meds:true },
      { id:'cancer',   label:'Cancer treatment cycle',            egp:350000,days:60, sev:'critical', surgery:false, meds:true }
    ];
    const weights = { minor:0.55, moderate:0.28, serious:0.12, critical:0.05 };
    const roll = Math.random();
    let picked = 'minor', acc = 0;
    for (const [sev, w] of Object.entries(weights)) { acc += w; if (roll <= acc) { picked = sev; break; } }
    const pool = events.filter(function (e) { return e.sev === picked; });
    const pick = pool[Math.floor(Math.random() * pool.length)] || events[0];

    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
    const egp = Math.round(pick.egp * idx);
    const ins = p45InsuranceCoverage();
    const covered = Math.min(egp * ins.ratio, ins.cap * idx);
    const outOfPocket = Math.max(0, egp - covered);

    S.p45.pendingMedicalBills.push({
      id: 'med_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      label: pick.label, egp: egp,
      coveredEGP: Math.round(covered), outOfPocketEGP: Math.round(outOfPocket),
      severity: pick.sev, requiresSurgery: pick.surgery, requiresMeds: pick.meds,
      sickDays: pick.days, createdYear: gameYear(),
      insuranceSource: ins.source, resolved: false
    });
    const hpLoss = pick.sev === 'critical' ? -20 : pick.sev === 'serious' ? -14 : pick.sev === 'moderate' ? -8 : -4;
    fx({ health: hpLoss, happiness: -4 });
    log('Medical event: ' + pick.label + ' (est EGP ' + egp.toLocaleString() + ', ' + pick.days + ' days recovery). Check Medical tab.');
    if (typeof realismNotice === 'function') realismNotice('Medical Condition', 'You suffered ' + pick.label + '. A medical bill is pending in the Medical tab. Requires ' + pick.days + ' days of recovery.');
  };

  /* =================================================================
     PART 5 — FERTILITY
     ================================================================= */
  function p40InitFertility() {
    p40Init(S);
    const f = S.medical.fertility;
    if (f.playerFertility == null) {
      let base = 85;
      if (S.age >= 30) base -= (S.age - 30) * 1.2;
      if (S.age >= 45) base -= (S.age - 45) * 2;
      f.playerFertility = Math.max(5, Math.min(95, Math.round(base + (Math.random() * 20 - 10))));
    }
    const sp = (typeof partner === 'function') ? partner() : null;
    if (sp && f.wifeFertility == null) {
      let base = 90;
      const a = sp.age || 25;
      if (a >= 30) base -= (a - 30) * 2.2;
      if (a >= 35) base -= (a - 35) * 3.5;
      if (a >= 40) base -= (a - 40) * 4;
      f.wifeFertility = Math.max(2, Math.min(95, Math.round(base + (Math.random() * 15 - 7))));
    }
  }

  window.p40TryForBaby = function () {
    p40Init(S);
    const sp = (typeof partner === 'function') ? partner() : null;
    if (!sp || sp.stage !== 'married') return hint('You need a spouse.');
    const f = S.medical.fertility;
    p40InitFertility();
    if (f.lastTryYear === gameYear()) return hint('You already tried this year.');
    f.lastTryYear = gameYear();
    const pF = f.playerFertility / 100;
    const wF = f.wifeFertility / 100;
    const chance = Math.max(0.02, Math.min(0.55, Math.sqrt(pF * wF) * 0.35));
    if (Math.random() < chance) {
      S.medical.pendingPregnancy = { wifeId: sp.id, year: gameYear(), months: 0 };
      const msg = sp.name + ' is pregnant! Baby arrives next year.';
      log(msg);
      if (typeof realismNotice === 'function') realismNotice('Pregnancy!', msg + ' Prepare for the birth. Costs, childcare and life changes are coming.');
    } else {
      const failed = (f.attempts || 0) + 1;
      f.attempts = failed;
      const msg = sp.name + ' did not become pregnant this year.';
      log(msg);
      if (typeof realismNotice === 'function') realismNotice('Not this year', msg + (failed >= 2 ? ' Consider a fertility consultation in the Medical tab.' : ' Try again next year or consult a doctor.'));
    }
    render();
  };
  window.p40FertilityConsult = function () {
    p40Init(S);
    const sp = (typeof partner === 'function') ? partner() : null;
    if (!sp || sp.stage !== 'married') return hint('You need a spouse.');
    if (!p40Paid(1500, 'fertilityConsult')) return hint('You need EGP ' + p40Price(1500).toLocaleString() + '.');
    p40InitFertility();
    S.medical.fertility.diagnosisDone = true;
    const f = S.medical.fertility;
    let msg = 'Consultant tests: your fertility is ' + f.playerFertility + '%, ' + sp.name + '\'s is ' + f.wifeFertility + '%. ';
    if (f.playerFertility >= 40 && f.wifeFertility >= 40) msg += 'No major issue. Keep trying.';
    else msg += 'IVF (أطفال أنابيب) may be needed due to low fertility.';
    log(msg);
    if (typeof realismNotice === 'function') realismNotice('Fertility diagnosis', msg);
    render();
  };
  window.p40IVF = function () {
    p40Init(S);
    const sp = (typeof partner === 'function') ? partner() : null;
    if (!sp || sp.stage !== 'married') return hint('You need a spouse.');
    const f = S.medical.fertility;
    if (!f.diagnosisDone) return hint('Complete a consultation first.');
    if (f.ivfLastYear === gameYear()) return hint('One IVF per year.');
    const total = p40Price(60000);
    const cov = p40CoverageRatio();
    const outPocket = Math.round(total * (1 - cov * 0.3));
    const internal = p40Cost(outPocket);
    if (S.wealth < internal) return hint('IVF costs EGP ' + outPocket.toLocaleString() + ' out of pocket.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.ivf = (S.bill.ivf || 0) + internal;
    f.ivfLastYear = gameYear();
    f.ivfAttempts = (f.ivfAttempts || 0) + 1;
    const ageF = Math.max(0.15, 1 - Math.max(0, (sp.age - 30) * 0.025));
    const fertF = Math.max(0.2, f.wifeFertility / 100);
    const chance = Math.max(0.10, Math.min(0.55, 0.35 * ageF * fertF));
    if (Math.random() < chance) {
      S.medical.pendingPregnancy = { wifeId: sp.id, year: gameYear(), viaIVF: true };
      log('IVF succeeded! ' + sp.name + ' is pregnant.');
      if (typeof realismNotice === 'function') realismNotice('IVF success', sp.name + ' is pregnant after IVF. The baby arrives next year.');
    } else {
      log('IVF cycle did not succeed. Cost EGP ' + outPocket.toLocaleString() + '.');
      if (typeof realismNotice === 'function') realismNotice('IVF unsuccessful', 'The IVF cycle failed. This happens. You may try again next year — the chance is roughly ' + Math.round(chance * 100) + '%.');
    }
    render();
  };
  function p40BabyBorn() {
    const sp = (typeof partner === 'function') ? partner() : null;
    if (!sp) return;
    const kid = (typeof addMember === 'function') ? addMember('Child', 0, 85) : null;
    if (kid) {
      kid.g = Math.random() < 0.5 ? 'f' : 'm';
      kid.name = (typeof localName === 'function') ? localName(S.country, kid.g) : 'Baby';
      kid.bond = 90;
      log('Your child ' + kid.name + ' was born!');
      if (typeof realismNotice === 'function') realismNotice('A child is born', sp.name + ' gave birth to a healthy baby, ' + kid.name + '. Congratulations.');
    }
    fx({ happiness: 12, health: -2 });
    const birthCost = p40Price(25000);
    const cov = p40CoverageRatio();
    p40Paid(birthCost * (1 - cov) / p40Rate() * p40Rate(), 'birthCost');
    S.medical.pendingPregnancy = null;
  }

  /* =================================================================
     PART 6 — SICK LEAVE + PAY BILLS
     ================================================================= */
  function p45ApplySickLeave(bill) {
    p40Init(S);
    if (!S.job) return;
    const job = S.job;
    const days = Math.min(Number(bill.sickDays) || 0, 90);
    const salary = Number(job.salary) || 0;
    const dailyRate = salary / 260;
    const paidLeave = Math.min(Math.max(0, (job.benefits && job.benefits.leave) || 14), days);
    const unpaidDays = Math.max(0, days - paidLeave);
    if (paidLeave > 0) S.p45.sickLeaveUsed += paidLeave;
    if (unpaidDays > 0) {
      const ded = Math.round(dailyRate * unpaidDays);
      S.wealth -= ded;
      S.bill = S.bill || {};
      S.bill.sickLeaveDeduction = (S.bill.sickLeaveDeduction || 0) + ded;
      if (bill) bill.sickLeaveDeduction = (bill.sickLeaveDeduction || 0) + ded;
      S.expenses = (S.expenses || 0) + ded;
      log('Sick leave: ' + paidLeave + ' paid, ' + unpaidDays + ' unpaid. Deduction EGP ' + Math.round(ded * p40Rate()).toLocaleString() + '.');
    }
    if (job.perf) job.perf = Math.max(0, job.perf - 3);
  }

  window.p45PayMedicalBill = function (billId, mode) {
    p40Init(S);
    const bill = (S.p45.pendingMedicalBills || []).find(function (b) { return b.id === billId && !b.resolved; });
    if (!bill) return hint('Bill not found or already paid.');

    if (mode === 'cash') {
      const internal = bill.egp / p40Rate();
      if (S.wealth < internal) return hint('You cannot afford EGP ' + bill.egp.toLocaleString() + '.');
      S.wealth -= internal;
      S.expenses = (S.expenses || 0) + internal;
      S.bill = S.bill || {};
      S.bill.medicalBill = (S.bill.medicalBill || 0) + internal;
      bill.resolved = true;
      log('Paid EGP ' + bill.egp.toLocaleString() + ' for ' + bill.label + '.');
      p45ApplySickLeave(bill);
      render(); return;
    }
    if (mode === 'parents') {
      if (S.housing !== 'parents' || !parents().length || S.age > 27) return hint('Parents unavailable.');
      if (S.famWealth >= 1 && Math.random() < 0.75) {
        bill.resolved = true;
        log('Parents paid EGP ' + bill.egp.toLocaleString() + ' for ' + bill.label + '.');
        p45ApplySickLeave(bill);
        render(); return;
      }
      return hint('Parents could not afford this.');
    }
    if (mode === 'skip') {
      bill.resolved = true;
      fx({ health: -8, happiness: -3 });
      log('Skipped treatment for ' + bill.label + '.');
      render(); return;
    }
    if (mode === 'installment') {
      const internal = bill.egp / p40Rate();
      const monthly = internal / 6;
      if (!S.bank) S.bank = { installments: {}, cardDebt: {}, activeCards: [], primaryCard: null, score: 680, savingsBal: 0, loans: [], missedPmts: 0 };
      if (!S.bank.installments) S.bank.installments = {};
      const key = 'medical_' + bill.id;
      S.bank.installments[key] = {
        name: 'Medical: ' + bill.label,
        totalBalance: internal, remaining: internal, monthlyPayment: monthly,
        monthsTotal: 6, monthsLeft: 6, fee: 0, startedYear: gameYear()
      };
      bill.resolved = true;
      log('Converted EGP ' + bill.egp.toLocaleString() + ' medical bill into 6-month installment.');
      p45ApplySickLeave(bill);
      render(); return;
    }
    if (mode === 'insurance') {
      const internal = bill.outOfPocketEGP / p40Rate();
      if (S.wealth >= internal) {
        S.wealth -= internal;
        S.expenses = (S.expenses || 0) + internal;
        S.bill = S.bill || {};
        S.bill.medicalBill = (S.bill.medicalBill || 0) + internal;
      }
      bill.resolved = true;
      log('Insurance covered EGP ' + bill.coveredEGP.toLocaleString() + '. You paid EGP ' + bill.outOfPocketEGP.toLocaleString() + '.');
      p45ApplySickLeave(bill);
      render(); return;
    }
  };

  /* =================================================================
     PART 7 — ASK EMPLOYER FOR INSURANCE
     ================================================================= */
  window.p45AskEmployerInsurance = function () {
    p40Init(S);
    if (S.age < 18) return hint('Adults only.');
    if (!S.job) return hint('You need a full-time job.');
    if (S.p45.employerInsurance) return hint('Employer already provides coverage.');
    if (S.p45.employerInsuranceAsked === gameYear()) return hint('Already asked this year.');
    S.p45.employerInsuranceAsked = gameYear();
    const sen = Math.max(0, Number(S.job.level) || 0) / 4;
    const perf = Math.max(0, Number(S.job.perf) || 0) / 100;
    const ten = Math.min(0.2, (Number(S.job.years) || 0) * 0.03);
    const econ = S.econ === 'recession' ? -0.15 : S.econ === 'boom' ? 0.08 : 0;
    const chance = Math.max(0.05, Math.min(0.85, 0.25 + sen * 0.30 + perf * 0.20 + ten + econ));
    if (Math.random() < chance) {
      S.p45.employerInsurance = true;
      if (S.job.benefits) S.job.benefits.medical = true;
      fx({ happiness: 8 });
      log('Employer approved medical coverage.');
      if (typeof realismNotice === 'function') realismNotice('Employer medical coverage', 'Your job now includes medical insurance.');
    } else {
      S.p45.employerInsuranceRefused.push(gameYear());
      if (S.job) S.job.perf = Math.max(0, (Number(S.job.perf) || 0) - 2);
      fx({ happiness: -3 });
      log('Employer refused medical insurance this year.');
    }
    render();
  };

  /* =================================================================
     PART 8 — STUDENT LOANS
     ================================================================= */
  window.p45PayStudentLoan = function (amountEGP) {
    if (!S || S.age < 18) return hint('Adults only.');
    const loan = Number(S.loan) || 0;
    if (loan <= 0) return hint('No student loan.');
    const rate = p40Rate();
    const egp = Math.round(Number(amountEGP) || 0);
    if (egp <= 0) return hint('Enter a positive amount.');
    const internal = egp / rate;
    const pay = Math.min(internal, loan, Math.max(0, S.wealth));
    if (pay <= 0) return hint('Not enough cash.');
    S.wealth -= pay;
    S.loan = Math.max(0, loan - pay);
    log('Paid EGP ' + Math.round(pay * rate).toLocaleString() + ' toward student loan. Remaining EGP ' + Math.round(S.loan * rate).toLocaleString() + '.');
    if (S.loan <= 0.5) { S.loan = 0; log('Student loan fully paid off.'); }
    render();
  };
  window.p45PayStudentLoanPrompt = function () {
    const loan = Number(S.loan) || 0;
    if (loan <= 0) return hint('No student loan.');
    const egp = Math.round(loan * p40Rate());
    const input = prompt('Pay how much? (Full: EGP ' + egp.toLocaleString() + ')', String(egp));
    if (input == null) return;
    p45PayStudentLoan(Number(input));
  };

  /* =================================================================
     PART 9 — "WHERE DO I LIVE" banner
     ================================================================= */
  function p45CurrentHomeInfo() {
    if (!S) return { name: 'Unknown', status: '', color: 'var(--muted)' };
    if (S.housing === 'parents') return { name: "Parents' home", status: 'Living with family', color: 'var(--cyan)' };
    if (!S.housing) return { name: 'No fixed address', status: 'Homeless', color: 'var(--rose)' };
    const own = (S.ownedHomes || []).find(function (h) { return h && h.id === S.housing; });
    if (own) return { name: own.name, status: 'Your own property (' + (own.cond || 100) + '% condition)', color: 'var(--mint)' };
    if (typeof HOUSING_CATALOG !== 'undefined') {
      const cat = HOUSING_CATALOG.find(function (c) { return c.id === S.housing && c.kind === 'rent'; });
      if (cat) {
        const rent = (typeof rentCost === 'function') ? rentCost(cat) : 0;
        return { name: cat.name, status: 'Renting · EGP ' + Math.round(rent).toLocaleString() + '/yr', color: 'var(--amber)' };
      }
    }
    return { name: 'Unknown', status: '', color: 'var(--muted)' };
  }
  function p45HomeBanner() {
    const info = p45CurrentHomeInfo();
    return '<section class="card" style="padding:14px;border:2px solid ' + info.color + '">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">YOU CURRENTLY LIVE IN</div>' +
      '<div style="font-size:1.15rem;font-weight:700;margin-top:4px;color:' + info.color + '">' + info.name + '</div>' +
      (info.status ? '<div class="muted" style="font-size:.85rem;margin-top:2px">' + info.status + '</div>' : '') +
      '</section>';
  }

  /* =================================================================
     PART 10 — viewMedical
     ================================================================= */
  window.viewMedical = function () {
    p40Init(S);
    if (!S || S.age < 18) {
      return '<section class="card"><h3>🏥 Medical</h3><p class="muted">Medical services unlock at age 18.</p></section>';
    }
    const sp = (typeof partner === 'function') ? partner() : null;
    const f = S.medical.fertility;
    const cov = p40CoverageRatio();

    let html = '<section class="card"><h3>🏥 Health dashboard</h3>' +
      '<div class="row"><span>Health</span><b>' + S.health + '%</b></div>';
    let insLabel = 'None — you pay every bill';
    if (S.p45.employerInsurance || p40EmployerCoversInsurance()) insLabel = 'Employer plan (75%, cap EGP 150k/yr)';
    else if (S.medical.insuranceTier === 'premium') insLabel = 'Premium (85%, cap EGP 250k/yr)';
    else if (S.medical.insuranceTier === 'basic') insLabel = 'Basic (60%, cap EGP 100k/yr)';
    html += '<div class="row"><span>Insurance</span><b>' + insLabel + '</b></div>';
    if ((S.medical.conditions || []).length) {
      html += '<div class="row"><span>Chronic conditions</span><b style="color:var(--amber)">' + S.medical.conditions.join(', ') + '</b></div>';
    } else {
      html += '<div class="row"><span>Chronic conditions</span><b style="color:var(--mint)">None</b></div>';
    }
    html += '</section>';

    /* Pending bills */
    const bills = (S.p45.pendingMedicalBills || []).filter(function (b) { return !b.resolved; });
    if (bills.length) {
      html += '<section class="card" style="border-color:var(--rose)"><h3>⚕️ Pending medical bills</h3>';
      bills.forEach(function (b) {
        const sevC = b.severity === 'critical' ? 'var(--rose)' : b.severity === 'serious' ? 'var(--amber)' : 'var(--muted)';
        html += '<div style="margin-top:10px;padding:10px;border:1px solid ' + sevC + ';border-radius:8px">' +
          '<b>' + b.label + '</b> <span style="color:' + sevC + ';font-size:.78rem">· ' + b.severity + '</span>' +
          '<div class="row"><span>Total cost</span><b class="mono">EGP ' + b.egp.toLocaleString() + '</b></div>' +
          (b.coveredEGP > 0 ? '<div class="row"><span>Insurance covers</span><b class="mono" style="color:var(--mint)">-' + b.coveredEGP.toLocaleString() + '</b></div>' : '') +
          '<div class="row"><span>Out-of-pocket</span><b class="mono" style="color:var(--rose)">EGP ' + b.outOfPocketEGP.toLocaleString() + '</b></div>' +
          '<div class="row"><span>Recovery</span><b>' + b.sickDays + ' day(s)</b></div>' +
          (b.requiresSurgery ? '<p class="muted" style="font-size:.82rem;color:var(--amber)">Requires surgery.</p>' : '') +
          '<div class="acts" style="margin-top:6px">' +
          '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'cash\')">Pay cash</button>' +
          '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'installment\')">Convert to 6-month installment</button>' +
          (S.housing === 'parents' && S.age <= 27 ? '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'parents\')">Ask parents</button>' : '') +
          '<button class="btn" onclick="p45PayMedicalBill(\'' + b.id + '\',\'skip\')">Delay treatment</button>' +
          '</div></div>';
      });
      html += '</section>';
    }

    /* Insurance purchase */
    if (!p40EmployerCoversInsurance() && !S.p45.employerInsurance) {
      html += '<section class="card"><h3>💊 Health insurance</h3><p class="muted">Private health insurance in Egypt 2026: EGP 3,500–5,500/yr.</p>';
      if (S.medical.insuranceTier === 'none' || S.medical.insuranceTier === 'employer') {
        html += '<button class="btn" onclick="p40BuyInsurance(\'basic\')">Buy basic · EGP ' + p40Price(3500).toLocaleString() + '/yr<small>60%, cap 100k</small></button>' +
          '<button class="btn" onclick="p40BuyInsurance(\'premium\')">Buy premium · EGP ' + p40Price(5500).toLocaleString() + '/yr<small>85%, cap 250k</small></button>';
      } else {
        html += '<button class="btn" onclick="p40CancelInsurance()">Cancel insurance</button>';
      }
      html += '</section>';
    } else {
      html += '<section class="card"><h3>💊 Health insurance</h3><p class="muted">Employer provides coverage (75%, cap EGP 150k/yr).</p></section>';
    }

    /* Doctor visits */
    html += '<section class="card"><h3>🩺 Doctor visits & tests</h3>' +
      '<button class="btn" onclick="p40DoctorVisit(\'specialist\')">Specialist · EGP ' + p40Price(500).toLocaleString() + '</button>' +
      '<button class="btn" onclick="p40DoctorVisit(\'consultant\')">Consultant · EGP ' + p40Price(1000).toLocaleString() + '</button>' +
      '<button class="btn" onclick="p40LabTests()">Lab tests · EGP ' + p40Price(510).toLocaleString() + '</button>' +
      '<button class="btn" onclick="p40FullCheckup()">Full checkup · EGP ' + p40Price(1450).toLocaleString() + '</button>' +
      '</section>';

    /* Fertility */
    if (sp && sp.stage === 'married') {
      p40InitFertility();
      html += '<section class="card"><h3>👶 Fertility & family planning</h3>';
      if (S.medical.pendingPregnancy) {
        html += '<p class="muted" style="color:var(--mint)"><b>' + sp.name + ' is pregnant.</b> Baby arrives next year.</p>';
      } else {
        const att = f.attempts || 0;
        html += '<div class="row"><span>Natural attempts</span><b>' + att + '</b></div>';
        if (f.diagnosisDone) {
          const pC = f.playerFertility >= 40 ? 'var(--mint)' : 'var(--rose)';
          const wC = f.wifeFertility >= 40 ? 'var(--mint)' : 'var(--rose)';
          html += '<div class="row"><span>Your fertility</span><b style="color:' + pC + '">' + f.playerFertility + '%</b></div>';
          html += '<div class="row"><span>' + sp.name + '\'s fertility</span><b style="color:' + wC + '">' + f.wifeFertility + '%</b></div>';
        }
        if (f.lastTryYear !== gameYear()) html += '<button class="btn" onclick="p40TryForBaby()">Try for a baby this year</button>';
        else html += '<p class="muted" style="font-size:.82rem">Already tried this year.</p>';
        if (!f.diagnosisDone) html += '<button class="btn" onclick="p40FertilityConsult()">Fertility consultation · EGP ' + p40Price(1500).toLocaleString() + '</button>';
        if (f.diagnosisDone && f.ivfLastYear !== gameYear()) {
          const total = p40Price(60000);
          const outPocket = total - Math.round(total * cov * 0.3);
          html += '<button class="btn" onclick="p40IVF()">IVF · EGP ' + outPocket.toLocaleString() + ' out of pocket</button>';
        }
      }
      html += '</section>';
    }
    return html;
  };

  /* =================================================================
     PART 11 — VIEW WRAPPERS
     ================================================================= */
  const _viewAssets = typeof viewAssets === 'function' ? viewAssets : function() { return ''; };
  window.viewAssets = function () {
    let html = _viewAssets.apply(this, arguments);
    html = html.replace(/<section class="card"[^>]*>\s*<div[^>]*>\s*<div[^>]*>YOU CURRENTLY LIVE IN[\s\S]*?<\/section>/g, '');
    return p45HomeBanner() + html;
  };

  const _viewLife = typeof viewLife === 'function' ? viewLife : function() { return ''; };
  window.viewLife = function () {
    let html = _viewLife.apply(this, arguments);
    html = html.replace(/<section class="card"[^>]*>\s*<div[^>]*>\s*<div[^>]*>YOU CURRENTLY LIVE IN[\s\S]*?<\/section>/g, '');
    const out = p45HomeBanner() + html;
    const bills = (S && S.p45 && S.p45.pendingMedicalBills || []).filter(function (b) { return !b.resolved; });
    if (bills.length) {
      return '<section class="card" style="border-color:var(--rose)"><h3>⚕️ Medical attention needed</h3>' +
        '<p class="muted">You have ' + bills.length + ' pending medical bill(s).</p>' +
        '<button class="btn" onclick="activeTab=\'medical\';render();">Open Medical tab</button></section>' + out;
    }
    return out;
  };

  const _viewCareer = typeof viewCareer === 'function' ? viewCareer : function() { return ''; };
  window.viewCareer = function () {
    let html = _viewCareer.apply(this, arguments);
    if (!S || S.age < 18 || !S.job) return html;
    if (S.p45.employerInsurance || (S.job.benefits && S.job.benefits.medical)) return html;
    const asked = S.p45.employerInsuranceAsked === gameYear();
    const card = '<section class="card" style="border-color:var(--amber)"><h3>💊 Ask for employer medical insurance</h3>' +
      '<p class="muted">Your current job does not include medical coverage. Egyptian employers typically cover 75% up to EGP 150k/yr.</p>' +
      '<div class="row"><span>Seniority</span><b>' + ((Number(S.job.level) || 0) + 1) + '/5</b></div>' +
      '<div class="row"><span>Performance</span><b>' + (Number(S.job.perf) || 0) + '%</b></div>' +
      '<button class="btn" ' + (asked ? 'disabled' : '') + ' onclick="p45AskEmployerInsurance()">' + (asked ? 'Already asked this year' : 'Ask employer') + '</button></section>';
    return card + html;
  };

  const _viewMoney = typeof viewMoney === 'function' ? viewMoney : function() { return ''; };
  window.viewMoney = function () {
    let html = _viewMoney.apply(this, arguments);
    if (!S || S.age < 18) return html;
    if (!(Number(S.loan) > 0)) return html;
    const rate = p40Rate();
    const loanEGP = Math.round(S.loan * rate);
    const buttons = '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="btn" onclick="p45PayStudentLoanPrompt()">Pay custom student loan amount</button>' +
      '<button class="btn" onclick="p45PayStudentLoan(' + loanEGP + ')"' + (Math.round(S.wealth * rate) < loanEGP ? ' disabled' : '') + '>Pay off (EGP ' + loanEGP.toLocaleString() + ')</button>' +
      '</div>';
    const cardEnd = html.indexOf('</section>', html.indexOf('Total owed'));
    if (cardEnd !== -1) html = html.slice(0, cardEnd) + buttons + html.slice(cardEnd);
    return html;
  };

  /* =================================================================
     PART 12 — ROBUST TAB INJECTION & ROUTING
     ================================================================= */
  function injectMedicalTab() {
    const nav = document.getElementById('tabs');
    if (!nav) return;
    if (nav.querySelector('[data-tab="medical"]')) return;

    const btn = document.createElement('button');
    btn.className = 'tab';
    btn.dataset.tab = 'medical';
    btn.textContent = 'Medical';
    btn.onclick = function () {
      activeTab = 'medical';
      if (typeof render === 'function') render();
    };

    const pacing = nav.querySelector('[data-tab="pacing"]');
    if (pacing) nav.insertBefore(btn, pacing);
    else nav.appendChild(btn);
  }

  const _render = typeof render === 'function' ? render : function(){};
  window.render = function () {
    /* 1. Sync Insurance State */
    if (S && S.p45 && S.p45.employerInsurance) {
      if (!S.medical) S.medical = { hasInsurance: true, insuranceTier: 'employer' };
      else if (S.medical.insuranceTier !== 'employer') S.medical.hasInsurance = true;
    }

    /* 2. Medical Tab Routing */
    if (typeof activeTab !== 'undefined' && activeTab === 'medical') {
      const saved = activeTab;
      activeTab = 'life'; /* base render needs a valid tab */
      try { _render.apply(this, arguments); } catch (e) { console.error('[p40] base render failed:', e); }
      activeTab = saved;

      const nav = document.getElementById('tabs');
      const view = document.getElementById('view');

      if (nav) {
        nav.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('on'); });
        let btn = nav.querySelector('[data-tab="medical"]');
        if (!btn) { injectMedicalTab(); btn = nav.querySelector('[data-tab="medical"]'); }
        if (btn) btn.classList.add('on');
      }

      if (view) {
        try {
          view.innerHTML = typeof viewMedical === 'function' ? viewMedical() : '<section class="card"><h3>🏥 Medical</h3><p class="muted">Medical view failed to render. Check console.</p></section>';
        } catch (e) {
          console.error('[p40] viewMedical failed:', e);
          view.innerHTML = '<section class="card"><h3>🏥 Medical</h3><p class="muted">Medical view failed to render. Check console.</p></section>';
        }
      }

      if (typeof save === 'function') save();
      return;
    }

    /* 3. Normal Tab Routing */
    const r = _render.apply(this, arguments);
    try { injectMedicalTab(); } catch (e) {}
    return r;
  };

  /* Ensure tab injection runs */
  setTimeout(injectMedicalTab, 100);
  setTimeout(injectMedicalTab, 600);
  if (typeof GameHooks !== 'undefined' && GameHooks.on) {
    GameHooks.on('render', function () {
      try { injectMedicalTab(); } catch (e) {}
    });
  }

  /* =================================================================
     PART 13 — AGE UP / YEARLY LOGIC
     ================================================================= */
  const _ageUp = typeof ageUp === 'function' ? ageUp : function(){};
  window.ageUp = function () {
    const ageBefore = S && S.age;
    const r = _ageUp.apply(this, arguments);
    if (!S || S.age === ageBefore) return r;
    if (S.age < 18) return r;

    /* Legacy illness event */
    if (Math.random() <= 0.15) {
      try { p40IllnessEvent(); } catch (e) {}
    }

    /* New event-based bill generation */
    try { p45GenerateMedicalEvent(); } catch (e) {}

    /* Insurance renewal */
    if (S.medical.hasInsurance && S.medical.insuranceTier !== 'none' && S.medical.insuranceTier !== 'employer') {
      const prices = { basic: 3500, premium: 5500 };
      const egp = prices[S.medical.insuranceTier];
      if (egp && p40Paid(egp, 'insurance')) {
        S.medical.insuranceRenewYear = gameYear();
        log('Health insurance renewed for EGP ' + p40Price(egp).toLocaleString() + '.');
      } else if (egp) {
        log('Could not renew health insurance. Coverage lapsed.');
        S.medical.hasInsurance = false;
      }
    }

    /* Resolve pending pregnancy */
    if (S.medical.pendingPregnancy) {
      p40BabyBorn();
    }

    /* Chronic condition care */
    (S.medical.conditions || []).forEach(function (c) {
      const annual = p40Price(9600);
      if (p40Paid(annual, 'chronicMeds')) {
        log('Chronic care for ' + c + ': EGP ' + Math.round(annual).toLocaleString() + '.');
      } else {
        fx({ health: -3 });
        log('Could not pay for ' + c + ' care.');
      }
    });

    /* Age-related decline */
    if (S.age > 45) fx({ health: -Math.ceil((S.age - 45) / 10) });

    return r;
  };

  /* =================================================================
     PART 14 — JOB LOSS CLARITY
     ================================================================= */
  const _packYear = typeof packYear === 'function' ? packYear : function(){};
  window.packYear = function () {
    const jobBefore = S && S.job ? S.job.title : null;
    const reasonBefore = S && S.job ? (S.job.perf || 0) : 0;
    _packYear.apply(this, arguments);
    if (jobBefore && S && !S.job) {
      const reason = reasonBefore < 25 ? 'Performance fell too low (below 25%).' :
                     S.econ === 'recession' ? 'The economy is in recession and the company cut staff.' :
                     'Management decided to let you go.';
      if (typeof realismNotice === 'function') realismNotice('You lost your job', 'You were released from "' + jobBefore + '". ' + reason + ' Check the Career tab for new openings.');
    }
  };

  /* Init check */
  p40Init(typeof S !== 'undefined' ? S : null);
  console.log('[p40] Core medical (Phase 3.3 + Robust Tab Injection) loaded');
})();
