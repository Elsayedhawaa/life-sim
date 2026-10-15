/* =====================================================================
   50. FIXES: graduation popup, parent medical consistency, BPO careers, GPA
   Load AFTER 49-education-additions.js and BEFORE 99-boot.js
   ===================================================================== */

function p50Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p50Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* ============ 1. BPO CAREER TRACK (Call Centers) ============ */
/* Real Egyptian BPO companies and 2026 typical salaries.
   Egypt is a global outsourcing hub — English/German/French accounts pay well. */

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
if (typeof EGY_SALARY_2026 !== 'undefined' && !EGY_SALARY_2026.bpo) {
  /* Annual EGP at 2026 — realistic for Egyptian market */
  EGY_SALARY_2026.bpo = [144000, 216000, 336000, 576000, 1080000];
}
if (typeof BASE_US_SALARIES !== 'undefined' && !BASE_US_SALARIES.bpo) {
  BASE_US_SALARIES.bpo = [28000, 40000, 60000, 95000, 140000];
}
if (typeof CAREER_TITLES !== 'undefined' && !CAREER_TITLES.bpo) {
  CAREER_TITLES.bpo = ['Customer Service Agent', 'Senior Agent', 'Team Leader', 'Operations Manager', 'Site Director'];
}

/* Real BPO employers in Egypt */
const P50_BPO_COMPANIES = [
  { name: 'Sutherland', lang: 'eng', tier: 'premium', baseFactor: 1.15 },
  { name: 'Teleperformance', lang: 'eng', tier: 'standard', baseFactor: 1.00 },
  { name: 'Concentrix', lang: 'eng', tier: 'standard', baseFactor: 1.00 },
  { name: 'Vodafone VOIS', lang: 'eng', tier: 'premium', baseFactor: 1.10 },
  { name: 'Raya CX', lang: 'eng', tier: 'standard', baseFactor: 0.90 },
  { name: 'Xceed (Telecom Egypt)', lang: 'eng', tier: 'standard', baseFactor: 0.95 },
  { name: 'Teleperformance Egypt — German Desk', lang: 'deu', tier: 'premium', baseFactor: 1.45 },
  { name: 'Sutherland — French Desk', lang: 'fra', tier: 'premium', baseFactor: 1.40 },
  { name: 'Alorica', lang: 'eng', tier: 'standard', baseFactor: 0.92 },
  { name: 'Foundever', lang: 'eng', tier: 'standard', baseFactor: 0.95 },
  { name: 'Concentrix — German Team', lang: 'deu', tier: 'premium', baseFactor: 1.50 },
  { name: 'Xceed — French Team', lang: 'fra', tier: 'premium', baseFactor: 1.35 }
];

function p50BPOJobsForYear() {
  if (!S || S.country !== 'egy') return [];
  const year = gameYear();
  const tier = { eng: 40, deu: 70, fra: 65 };
  /* Deterministic seed so the same companies appear all year */
  const seed = year * 7;
  const list = [];
  const count = 3 + (seed % 3);   /* 3-5 listings */
  for (let i = 0; i < count; i++) {
    const c = P50_BPO_COMPANIES[(seed + i * 3) % P50_BPO_COMPANIES.length];
    const hasLang = (typeof S.lang === 'object')
      ? (c.lang === 'eng' ? (S.eng || 0) >= 40 : (S.lang[c.lang === 'deu' ? 'german' : 'french'] || 0) >= 20 || S.eng >= 60)
      : true;
    list.push({
      id: 'p50_bpo_' + year + '_' + i,
      trackId: 'bpo',
      group: 'entry',
      roleTitle: 'Customer Service Agent',
      titles: ['Customer Service Agent', 'Senior Agent / SME', 'Team Leader', 'Operations Manager', 'Site Director'],
      name: c.name,
      factor: c.baseFactor,
      degree: null,
      degrees: null,
      smarts: 20 + Math.round(c.baseFactor * 10),
      eng: tier[c.lang] || 40,
      minExp: 0,
      medical: c.tier === 'premium',
      social: true,
      bonus: 0.02,
      leave: 14,
      remote: 'On-site (call center)',
      hours: 42,
      stress: 5,
      contract: c.lang === 'eng' ? 'Permanent' : 'Permanent · language premium',
      desc: 'Customer support for ' + (c.lang === 'eng' ? 'English' : c.lang === 'deu' ? 'German' : 'French') + ' accounts. Shift work (day/evening/night). Training provided. Attendance and quality metrics affect pay and promotion.',
      isBPO: true,
      sponsorship: false,
      companySize: c.tier === 'premium' ? 'large multinational BPO' : 'large regional BPO'
    });
  }
  return list;
}

/* Override companyListFor to add BPO listings on the Egypt board */
const P50_companyListBefore = companyListFor;
companyListFor = function (country) {
  country = country || (S && S.country);
  let list = P50_companyListBefore(country);
  if (!S) return list;
  if (country !== 'egy') return list;
  /* Only add once per year */
  const yearKey = 'p50BPO_' + gameYear();
  if (S[yearKey] && Array.isArray(S[yearKey])) {
    /* Merge cached BPO jobs with fresh market */
    const ids = new Set(list.map(p => p.id));
    const cached = S[yearKey].filter(p => !ids.has(p.id));
    return list.concat(cached);
  }
  const bpo = p50BPOJobsForYear();
  S[yearKey] = bpo;
  return bpo.concat(list);
};

/* ============ 2. GPA FIX ============ */
/* Base formula: g = smarts/100 * 3.2 + effort + noise. With smarts=50 and
   coast, this gave ~1.6 — impossibly low for a smart student. New formula
   gives smarts=50/coast ≈ 2.8, smarts=100/hard = 4.0. */
function p50ComputeG() {
  if (!S) return 0;
  const base = (S.smarts / 100) * 2.0 + 1.8;        /* smarts 0 → 1.8, smarts 100 → 3.8 */
  const effortAdj = { hard: 0.4, coast: 0, skip: -0.7 }[S.effort] || 0;
  const noise = Math.random() * 0.4 - 0.2;
  return Math.max(0, Math.min(4, base + effortAdj + noise));
}

/* Wrap ageUp to replace the base GPA contribution with the new formula */
const P50_ageUpBefore = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  const gpaBefore = S && S.gpa;
  const gpaNBefore = S && S.gpaN;

  P50_ageUpBefore.apply(this, arguments);

  if (!S) return;

  /* Recompute the newest GPA entry with the new formula */
  if (typeof S.gpaN === 'number' && S.gpaN === gpaNBefore + 1 &&
      ageBefore >= 7 && ageBefore <= 18) {
    const newG = p50ComputeG();
    S.gpa = Math.max(0, Math.min(4, (gpaBefore * gpaNBefore + newG) / S.gpaN));
  }

  /* ============ 3. HIGH SCHOOL GRADUATION ANNOUNCEMENT ============ */
  if (ageBefore === 17 && S.age === 18) {
    const hasDiploma = !!S.diploma;
    setTimeout(function () {
      if (!S) return;
      if (typeof p24Popup === 'function') {
        if (hasDiploma) {
          p24Popup('🎓 High school graduation',
            'You graduated high school! You now have options:\n\n' +
            '• Enrol in a university (Education tab)\n' +
            '• Start working full-time (Career tab)\n' +
            '• Take time to decide\n\n' +
            'Your GPA: ' + (S.gpa ? S.gpa.toFixed(2) : '0.00') + '. A GPA of 3.5+ earns a 50% university scholarship.');
        } else {
          p24Popup('High school ended',
            'You left school without a diploma (' + S.skips + ' skipped years).\n\n' +
            'Entry-level and unskilled jobs are still available in the Career tab. Some careers require a diploma and will stay locked.');
        }
      }
    }, 400);
  }

  /* ============ 4. UNIVERSITY GRADUATION ANNOUNCEMENT ============ */
  if (S.degree && S.p49 && S.p49.graduationYear === gameYear() &&
      !S.p50GradAnnounced) {
    S.p50GradAnnounced = true;
    const degName = (typeof MAJORS !== 'undefined' && MAJORS[S.degree] && MAJORS[S.degree].name) || S.degree;
    setTimeout(function () {
      if (!S || typeof p24Popup !== 'function') return;
      p24Popup('🎓 University graduation',
        'You completed your bachelor\u2019s degree in ' + degName + '.\n\n' +
        'Career options are now open in the Career tab. Master\u2019s programs are available in Education.');
    }, 500);
  }
};

/* ============ 5. PARENT MEDICAL CONSISTENCY ============ */
/* If family is wealthy enough to pay for AUC, they can pay for a surgery.
   New logic: famWealth drives what parents will cover, regardless of housing. */

function p50ParentsWillingToPayMedical(amountEGP) {
  if (!S || !parents().length) return { willPay: false, reason: 'No living parents.' };
  const age = S.age;
  if (age > 35) return { willPay: false, reason: 'You are an independent adult.' };
  const fw = S.famWealth || 0;
  const bond = bestBond();
  if (bond < 20) return { willPay: false, reason: 'Your bond with them is too low.' };

  /* Coverage cap by family wealth */
  const caps = { 0: 30000, 1: 200000, 2: 1500000 };
  const cap = caps[fw];
  if (amountEGP > cap) return { willPay: false, reason: 'The bill (' + Math.round(amountEGP).toLocaleString() + ' EGP) exceeds what your family can cover.' };

  /* Base chance */
  let chance = [0.4, 0.8, 0.98][fw];
  /* If they cover your education they will cover medical */
  if (S.uni && S.uni.pay === 'parents') chance = Math.min(1, chance + 0.15);
  if (S.mast && S.mast.fund === 'parents') chance = 1;

  /* Older parents = less able */
  const oldParents = parents().filter(p => p.age >= 70).length;
  chance -= oldParents * 0.1;

  const roll = Math.random();
  if (roll < chance) return { willPay: true, reason: '', cap: cap };
  return { willPay: false, reason: 'Your parents could not cover this cost right now.' };
}

/* Patch the P45 medical bill payment parent option */
if (typeof p45PayMedicalBill === 'function') {
  const P50_p45PayBefore = p45PayMedicalBill;
  p45PayMedicalBill = function (billId, mode) {
    if (mode !== 'parents') return P50_p45PayBefore.apply(this, arguments);
    const p45 = S && S.p45;
    const bill = p45 && p45.pendingMedicalBills && p45.pendingMedicalBills.find(b => b && b.id === billId && !b.resolved);
    if (!bill) return hint('Bill not found or already paid.');

    const decision = p50ParentsWillingToPayMedical(bill.egp);
    if (!decision.willPay) return hint(decision.reason || 'Your parents could not help.');

    bill.resolved = true;
    log('Your parents paid ' + bill.egp.toLocaleString() + ' EGP for ' + bill.label + '.');
    if (typeof p24Popup === 'function') p24Popup('Parents paid the bill', 'Your family covered the medical cost of ' + bill.egp.toLocaleString() + ' EGP.\n\nThey said: “We are family. This is what family does.”');
    /* Apply sick leave deduction still */
    if (typeof p45ApplySickLeave === 'function') p45ApplySickLeave(bill);
    render();
  };
}

/* Patch the base medical EVENT's parents option too */
(function patchBaseMedicalEventParents() {
  if (typeof EVENTS === 'undefined') return;
  const med = EVENTS.find(e => e.id === 'medical');
  if (!med) return;
  /* Replace existing choices array so the parents option uses new logic */
  med.choices = [
    {
      label: 'Pay for treatment',
      cost: () => (S.insured ? 180 : 900),
      fx: () => { const c = S.insured ? 180 : 900; return { wealth: -c, health: 3, msg: 'You paid ' + money(c) + ' and recovered.' }; }
    },
    {
      label: 'Skip treatment',
      fx: { health: -10, happiness: -3 },
      result: 'You skipped treatment and it hit your health.'
    },
    {
      label: 'Ask parents to pay',
      cost: () => 0,
      fx: () => {
        const idx = p50Idx();
        const egp = Math.round(60000 * idx);
        const decision = p50ParentsWillingToPayMedical(egp);
        if (!decision.willPay) {
          return { msg: 'Your parents could not help: ' + (decision.reason || 'budget is tight.') + ' You handled it as best you could.', health: -3 };
        }
        return { health: 6, happiness: 2, msg: 'Your parents covered the medical treatment (about ' + egp.toLocaleString() + ' EGP). You recovered fully.' };
      }
    }
  ];
})();

/* ============ 6. PART-TIME / WORK STRESS ON GPA ============ */
/* If you work while studying (age 14-18 or uni), GPA is hit.
   Base already applies some via effort, but we make working a real trade-off. */
const P50_ageUpWorkGpa = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  const gpaBefore = S && S.gpa;
  P50_ageUpWorkGpa.apply(this, arguments);
  if (!S) return;
  if (ageBefore < 14 || ageBefore > 22) return;
  /* If a job or part-time job was active during the school year */
  const working = !!(S.part || S.p20TeenJob || (S.job && S.uni));
  if (!working) return;
  if (gpaBefore == null || S.gpa == null) return;
  /* Reduce GPA slightly for the year */
  S.gpa = Math.max(0, Math.min(4, S.gpa - 0.05));
  log('Working while studying took time away from revision. GPA: ' + S.gpa.toFixed(2) + '.');
};

/* ============ 7. RUN ON LOAD ============ */
if (S) {
  /* No immediate action needed */
}
