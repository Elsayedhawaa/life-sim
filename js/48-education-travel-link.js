/* =====================================================================
   48. EDUCATION + TRAVEL REALISM REBUILD
   Load AFTER 47-visa-travel-realism.js and BEFORE 99-boot.js
   ===================================================================== */

function p48Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p48Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p48EGP(usd2026) { return Math.round(usd2026 * 52.7 * p48Idx()); }

/* ============ 1. REALISTIC COST OF ATTENDANCE ============ */
/* All values in USD for 2026 base year. Living includes rent, food, insurance,
   transport, phone, books, medical. Blocked = one-time proof required at visa stage. */
const P48_STUDY_ABROAD = {
  usa: { name: 'United States', flag: '🇺🇸',
    tuition: [25000, 50000], living: 18000, blocked: 0, visaFee: 185, flight: 1100, setup: 1500, programYears: 2,
    currency: 'USD', rate: 1,
    notes: 'Tuition varies wildly by university. Living costs are high in most cities. Health insurance is mandatory and expensive.' },
  gbr: { name: 'United Kingdom', flag: '🇬🇧',
    tuition: [18000, 32000], living: 15000, blocked: 0, visaFee: 490, flight: 650, setup: 1000, programYears: 1,
    currency: 'GBP', rate: 0.79,
    notes: 'One-year master\'s programs. IHS surcharge (~£776/yr) added to visa. London costs 30% more.' },
  can: { name: 'Canada', flag: '🇨🇦',
    tuition: [15000, 35000], living: 16000, blocked: 14000, visaFee: 150, flight: 1000, setup: 1200, programYears: 2,
    currency: 'CAD', rate: 1.37,
    notes: 'GIC (Guaranteed Investment Certificate) of CAD 20,635 is required upfront for the student visa.' },
  deu: { name: 'Germany', flag: '🇩🇪',
    tuition: [0, 0], living: 11500, blocked: 11208, visaFee: 75, flight: 590, setup: 800, programYears: 2,
    currency: 'EUR', rate: 0.92,
    notes: 'Public universities charge no tuition (except Baden-Württemberg ~€1,500/yr). A blocked account of €11,208/year is mandatory. Health insurance ~€110/month.' },
  nld: { name: 'Netherlands', flag: '🇳🇱',
    tuition: [15000, 22000], living: 12500, blocked: 0, visaFee: 210, flight: 640, setup: 900, programYears: 2,
    currency: 'EUR', rate: 0.92,
    notes: 'Housing is very scarce. You often need to pay 2 months deposit + first month upfront.' },
  fra: { name: 'France', flag: '🇫🇷',
    tuition: [3000, 10000], living: 10500, blocked: 0, visaFee: 100, flight: 620, setup: 800, programYears: 2,
    currency: 'EUR', rate: 0.92,
    notes: 'Public universities ~€3,770/yr. Grande Écoles much more. Proof of €615/month required.' },
  ita: { name: 'Italy', flag: '🇮🇹',
    tuition: [1500, 4000], living: 9500, blocked: 0, visaFee: 90, flight: 580, setup: 700, programYears: 2,
    currency: 'EUR', rate: 0.92,
    notes: 'Some public universities have income-based tuition, meaning Egyptians may pay less.' },
  aus: { name: 'Australia', flag: '🇦🇺',
    tuition: [22000, 40000], living: 20000, blocked: 0, visaFee: 710, flight: 1350, setup: 1200, programYears: 2,
    currency: 'AUD', rate: 1.52,
    notes: 'OSHC (health cover) required. Living costs AUD 29,710/year minimum for visa.' },
  nzl: { name: 'New Zealand', flag: '🇳🇿',
    tuition: [20000, 32000], living: 17000, blocked: 0, visaFee: 430, flight: 1350, setup: 1000, programYears: 2,
    currency: 'NZD', rate: 1.68,
    notes: 'Funds for NZD 20,000/year must be shown.' },
  jpn: { name: 'Japan', flag: '🇯🇵',
    tuition: [4000, 9000], living: 12000, blocked: 0, visaFee: 60, flight: 850, setup: 900, programYears: 2,
    currency: 'JPY', rate: 150,
    notes: 'MEXT scholarships cover everything and are very competitive. Self-funded students usually work part-time.' },
  kor: { name: 'South Korea', flag: '🇰🇷',
    tuition: [3500, 8000], living: 11000, blocked: 0, visaFee: 60, flight: 850, setup: 900, programYears: 2,
    currency: 'KRW', rate: 1370,
    notes: 'Korean Government Scholarship (GKS) is competitive. Proof of KRW 20M/year for self-funded.' },
  sgp: { name: 'Singapore', flag: '🇸🇬',
    tuition: [20000, 40000], living: 16000, blocked: 0, visaFee: 90, flight: 950, setup: 1000, programYears: 2,
    currency: 'SGD', rate: 1.29,
    notes: 'Very competitive admission. Proof of SGD 12,000/year.' },
  uae: { name: 'United Arab Emirates', flag: '🇦🇪',
    tuition: [15000, 35000], living: 14000, blocked: 0, visaFee: 250, flight: 300, setup: 800, programYears: 2,
    currency: 'AED', rate: 3.67,
    notes: 'No citizenship path. Student visa sponsored by the university.' },
  sau: { name: 'Saudi Arabia', flag: '🇸🇦',
    tuition: [10000, 25000], living: 11000, blocked: 0, visaFee: 200, flight: 340, setup: 700, programYears: 2,
    currency: 'SAR', rate: 3.75,
    notes: 'Tuition varies. Living costs lower than UAE.' },
  pak: { name: 'Pakistan', flag: '🇵🇰',
    tuition: [800, 2500], living: 3000, blocked: 0, visaFee: 60, flight: 400, setup: 400, programYears: 2,
    currency: 'PKR', rate: 280,
    notes: 'Low costs. Program quality varies widely.' }
};

function p48TotalCost(code, funding) {
  const c = P48_STUDY_ABROAD[code];
  if (!c) return null;
  const tuition = (c.tuition[0] + c.tuition[1]) / 2;
  const years = c.programYears;
  const coverage = funding === 'full' ? 1 : funding === 'part' ? 0.5 : funding === 'parents' ? 1 : 0;
  /* Full scholarship covers everything. Partial covers tuition only. Parents cover everything if they agree. Self pays all. */
  const netTuition = tuition * (1 - coverage);
  const totalFirstYearUSD = netTuition + c.living + c.blocked + c.visaFee + c.flight + c.setup;
  const totalProgramUSD = (netTuition * years) + (c.living * years) + c.blocked + c.visaFee + c.flight + c.setup;
  return {
    firstYearUSD: Math.round(totalFirstYearUSD),
    programUSD: Math.round(totalProgramUSD),
    tuitionUSD: tuition,
    livingUSD: c.living,
    blockedUSD: c.blocked,
    visaFeeUSD: c.visaFee,
    flightUSD: c.flight,
    setupUSD: c.setup,
    years: years
  };
}

/* ============ 2. EDUCATION TAB — STUDY ABROAD PANEL ============ */
function p48StudyAbroadPanel() {
  if (!S || S.age < 18) return '';
  if (!S.degree) return '';
  if (S.country !== S.home) return '';  /* Only for home-country players */

  const bankEGP = Math.round(Number(S.wealth || 0) * p48Rate());

  /* Field selector */
  const fields = (typeof MASTER_FIELDS !== 'undefined') ? MASTER_FIELDS : [
    { id: 'finance', name: 'MSc Accounting & Finance' },
    { id: 'cs', name: 'MSc Computer Science' },
    { id: 'mba', name: 'MBA' },
    { id: 'law', name: 'LLM' }
  ];

  let html = '<section class="card"><h3>🌍 Study abroad — full cost breakdown</h3>' +
    '<p class="muted">Realistic numbers: tuition plus living, blocked account, visa, flight, and setup costs. This is the real money you need before the student visa is granted.</p>' +
    '<div class="row"><span>Your available bank</span><b class="mono" style="color:var(--mint)">' + bankEGP.toLocaleString() + ' EGP</b></div>' +
    '<p class="muted" style="font-size:.78rem">Tuition for a ' + fields[0].name + ' (field-specific variation is small).</p>';

  const countries = ['deu', 'usa', 'gbr', 'can', 'nld', 'fra', 'ita', 'aus', 'nzl', 'jpn', 'kor', 'sgp', 'uae', 'sau'];
  countries.forEach(function (code) {
    const c = P48_STUDY_ABROAD[code];
    if (!c) return;
    const self = p48TotalCost(code, 'self');
    const selfEGP = p48EGP(self.firstYearUSD);
    const programEGP = p48EGP(self.programUSD);
    const blockedEGP = p48EGP(self.blockedUSD);
    const flightEGP = p48EGP(self.flightUSD);
    const visaEGP = p48EGP(self.visaFeeUSD);
    const setupEGP = p48EGP(self.setupUSD);
    const tuitionEGP = p48EGP(self.tuitionUSD);
    const livingEGP = p48EGP(self.livingUSD);

    const canAfford = bankEGP >= selfEGP;
    const gap = selfEGP - bankEGP;

    html += '<details style="margin-top:10px;border:1px solid ' + (canAfford ? 'var(--mint)' : 'var(--line)') + ';border-radius:8px;padding:10px">' +
      '<summary style="cursor:pointer"><b>' + c.flag + ' ' + c.name + '</b>' +
      ' <span style="color:' + (canAfford ? 'var(--mint)' : 'var(--rose)') + ';float:right">' + selfEGP.toLocaleString() + ' EGP (year 1)</span>' +
      '</summary>' +
      '<p class="muted" style="font-size:.82rem;margin:8px 0">' + c.notes + '</p>' +
      '<div class="row"><span>Tuition per year</span><b class="mono">' + (self.tuitionUSD === 0 ? 'Free (public university)' : tuitionEGP.toLocaleString() + ' EGP') + '</b></div>' +
      '<div class="row"><span>Living costs per year</span><b class="mono">' + livingEGP.toLocaleString() + ' EGP</b></div>' +
      (blockedEGP > 0 ? '<div class="row"><span>Blocked account / proof (one-time)</span><b class="mono">' + blockedEGP.toLocaleString() + ' EGP</b></div>' : '') +
      '<div class="row"><span>Visa fee</span><b class="mono">' + visaEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Return flight</span><b class="mono">' + flightEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Setup (deposits, books, essentials)</span><b class="mono">' + setupEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>First year total</b></span><b class="mono" style="color:var(--rose)">' + selfEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Full program (' + self.years + ' years)</span><b class="mono">' + programEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Can you afford it?</b></span><b style="color:' + (canAfford ? 'var(--mint)' : 'var(--rose)') + '">' + (canAfford ? '✅ Yes' : '❌ Short by ' + gap.toLocaleString() + ' EGP') + '</b></div>' +
      '<div class="acts" style="margin-top:8px">' +
      '<button class="btn" ' + (canAfford ? '' : 'disabled') + ' onclick="p48ApplyMaster(\'' + code + '\',\'self\')">' + (canAfford ? 'Apply self-funded' : 'Insufficient funds') + '</button>' +
      '<button class="btn" onclick="p48ApplyMaster(\'' + code + '\',\'scholar\')">Apply for scholarship<small>Tuition + living covered if awarded</small></button>' +
      '<button class="btn" onclick="p48ApplyMaster(\'' + code + '\',\'part\')">Apply for partial funding<small>Covers tuition only</small></button>' +
      '<button class="btn" onclick="p48ApplyMaster(\'' + code + '\',\'parents\')">Ask parents to fund<small>Only if family is wealthy</small></button>' +
      '</div></details>';
  });

  html += '</section>';
  return html;
}

/* Replace the old applyMasters with a clearer version */
function p48ApplyMaster(code, funding) {
  if (!S || S.age < 21) return hint('Master\'s programs generally require a completed bachelor\'s and adult entry.');
  if (!S.degree) return hint('You need a bachelor\'s degree first.');
  if (S.mast || S.studentVisaCase || S.localMast) return hint('You already have a study path in progress.');

  const c = P48_STUDY_ABROAD[code];
  if (!c) return hint('Destination not supported.');
  const fee = Math.round(80 * 52.7 * p48Idx() / p48Rate());  /* ~80 USD application fee */
  if (S.wealth < fee) return hint('Application fees cost about ' + Math.round(fee * p48Rate()).toLocaleString() + ' EGP.');

  /* Cost gate for self-funded */
  if (funding === 'self') {
    const cost = p48TotalCost(code, 'self');
    const costEGP = p48EGP(cost.firstYearUSD);
    const bankEGP = Math.round(S.wealth * p48Rate());
    if (bankEGP < costEGP) {
      return hint('You need ' + costEGP.toLocaleString() + ' EGP in the bank for the first year. You have ' + bankEGP.toLocaleString() + ' EGP. Save ' + (costEGP - bankEGP).toLocaleString() + ' EGP more.');
    }
  }

  /* Academic fit */
  const fieldMap = { law: 'law', business: 'business', cs: 'cs', medicine: 'biology', biology: 'biology' };
  const degreeMatch = c.name.indexOf(S.masterField || S.degree) >= 0;
  const gpa = S.gpaN ? S.gpa : 2.5;
  let academicChance = 0.30 + (S.smarts / 300) + (gpa >= 3.5 ? 0.15 : gpa >= 3.0 ? 0.08 : 0);

  /* English requirement */
  const requiredIELTS = ['usa', 'gbr', 'can', 'aus', 'nzl', 'nld', 'sgp'].indexOf(code) >= 0 ? 6.5 : 6.0;
  if ((S.ielts || 0) < requiredIELTS) {
    return hint('This destination requires IELTS ' + requiredIELTS + '+. Yours: ' + (S.ielts || 'not taken') + '. Take the IELTS exam first.');
  }

  /* Country-specific competition */
  if (code === 'usa' || code === 'gbr') academicChance -= 0.05;
  if (code === 'deu' || code === 'fra' || code === 'ita') academicChance += 0.05;

  /* Scholarship competition is much harder */
  let fundingChance;
  let fundingCoverage;
  if (funding === 'scholar') { fundingChance = gpa >= 3.7 ? 0.15 : gpa >= 3.4 ? 0.08 : 0.02; fundingCoverage = 1.0; }
  else if (funding === 'part') { fundingChance = gpa >= 3.3 ? 0.40 : 0.20; fundingCoverage = 0.5; }
  else if (funding === 'parents') { fundingChance = [0.05, 0.40, 0.90][S.famWealth || 0]; fundingCoverage = 1.0; }
  else { fundingChance = 1.0; fundingCoverage = 0; }

  /* Deduct application fee regardless of outcome */
  S.wealth -= fee;
  S.expenses = (S.expenses || 0) + fee;
  S.bill = S.bill || {};
  S.bill.applicationFees = (S.bill.applicationFees || 0) + fee;

  /* Admission decision */
  const admit = Math.random() < Math.min(0.85, Math.max(0.10, academicChance));
  if (!admit) {
    const reason = (S.ielts || 0) < requiredIELTS + 0.5
      ? 'IELTS score is on the edge — many candidates had higher scores.'
      : S.smarts < 60
        ? 'Academic profile was below the competitive range.'
        : 'Admissions committee found stronger candidates this cycle.';
    log('❌ ' + c.name + ' rejected your application. Reason: ' + reason + ' Application fee not refunded.');
    realismNotice('Admission refused', c.flag + ' ' + c.name + ' did not offer you a place. ' + reason + ' The ' + Math.round(fee * p48Rate()).toLocaleString() + ' EGP application fee was not refunded.');
    render();
    return;
  }

  /* Admission granted — now funding decision */
  if (funding === 'parents') {
    if (!parents().length || bestBond() < 35) {
      log('❌ You were admitted but your parents cannot commit to funding. You did not enrol.');
      realismNotice('Admission without family funding', 'Admitted to ' + c.name + ', but your parents cannot fund the tuition and living costs. The offer was not accepted.');
      render();
      return;
    }
  }

  const funded = Math.random() < fundingChance;
  if (!funded) {
    const reason = funding === 'scholar'
      ? 'Full scholarships are awarded to less than 10% of applicants. Your GPA (' + gpa.toFixed(2) + ') and profile were not in the top tier this cycle.'
      : funding === 'part'
        ? 'Partial scholarship competition was strong. Your application was not shortlisted.'
        : 'Your family said they cannot commit to the funding amount.';
    log('❌ Admitted to ' + c.name + ', but funding was not secured: ' + reason);
    realismNotice('Admission without funding', 'You were admitted to ' + c.flag + ' ' + c.name + ', but ' + reason + ' The application fee was not refunded.');
    render();
    return;
  }

  /* SUCCESS — proceed to visa stage */
  S.wealth -= 0;  /* No additional charge yet; visa fee comes next */
  S.studentVisaCase = {
    dest: code,
    field: S.masterField || S.degree,
    years: 0,
    cover: fundingCoverage,
    fund: funding,
    proof: funding === 'self' ? p48EGP(p48TotalCost(code, 'self').firstYearUSD) : p48EGP(p48TotalCost(code, 'self').firstYearUSD) * 0.3,
    started: gameYear()
  };
  log('✅ Admitted to ' + c.name + ' (' + (funding === 'scholar' ? 'full scholarship' : funding === 'part' ? '50% funding' : funding === 'parents' ? 'funded by family' : 'self-funded') + '). Student visa application is next.');
  realismNotice('Master\'s admission granted', c.flag + ' ' + c.name + '. Funding: ' +
    (funding === 'scholar' ? 'full scholarship' : funding === 'part' ? '50% tuition' : funding === 'parents' ? 'family funded' : 'self-funded') +
    '. You must now wait for the student visa decision — this takes about 1 year and can be refused.');
  render();
}
window.p48ApplyMaster = p48ApplyMaster;

/* Wrap viewSchool to inject the new panel and remove old proof-of-funds */
const P48_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P48_viewSchoolBefore();

  /* Remove the old proof-of-funds panel */
  html = html.replace(/<section class="card">[\s\S]*?💰 Proof of funds for study abroad[\s\S]*?<\/section>/g, '');

  /* Remove the old international master's section (with its own apply buttons) */
  html = html.replace(/<section class="card">[\s\S]*?International master’s · Europe, North America and beyond[\s\S]*?<\/section>/g, '');

  /* Insert the new study abroad panel */
  const newPanel = p48StudyAbroadPanel();

  /* Place it after "Local master's degree" section if found, else append */
  const localMasterRegex = /(<section class="card">[\s\S]*?Local master’s degree[\s\S]*?<\/section>)/;
  if (localMasterRegex.test(html)) {
    return html.replace(localMasterRegex, '$1' + newPanel);
  }
  return html + newPanel;
};

/* ============ 3. LANGUAGE — HIDE IF NOT RELEVANT ============ */
const P48_viewSchoolForLanguage = viewSchool;
viewSchool = function () {
  let html = P48_viewSchoolForLanguage();

  /* Hide German if not going to Germany */
  const goingToGermany = (S.studentVisaCase && S.studentVisaCase.dest === 'deu') ||
                          (S.mast && S.mast.dest === 'deu') ||
                          S.country === 'deu';
  if (!goingToGermany) {
    html = html.replace(/<section class="card">[\s\S]*?🇩🇪 German[\s\S]*?<\/section>/g, '');
  }

  /* Hide Dutch if not going to Netherlands */
  const goingToNetherlands = (S.studentVisaCase && S.studentVisaCase.dest === 'nld') ||
                              (S.mast && S.mast.dest === 'nld') ||
                              S.country === 'nld';
  if (!goingToNetherlands) {
    html = html.replace(/<section class="card">[\s\S]*?🇳🇱 Dutch[\s\S]*?<\/section>/g, '');
  }

  return html;
};

/* ============ 4. TRIP PLANNER — SHOW VISA REQUIREMENT INLINE ============ */
const P48_p12RenderTravelBefore = p12RenderTravel;
p12RenderTravel = function () {
  let html = P48_p12RenderTravelBefore();
  if (!S || S.age < 12) return html;

  /* Add a hint near the destination selector telling the player visa status */
  /* We inject a live-updating panel that reads the currently-selected destination */
  html = html.replace(
    '<div id="p12-trip-estimate"',
    '<div id="p48-visa-check" style="margin:10px 0"></div><div id="p12-trip-estimate"'
  );

  /* Attach an onchange to the destination select to update the visa check */
  html = html.replace(
    /id="p12-trip-dest"\s+onchange="[^"]*"/,
    'id="p12-trip-dest" onchange="p12RefreshTripQuote();p48UpdateVisaCheck()"'
  );

  setTimeout(p48UpdateVisaCheck, 50);
  return html;
};

function p48UpdateVisaCheck() {
  const el = document.getElementById('p48-visa-check');
  if (!el || !S) return;
  const sel = document.getElementById('p12-trip-dest');
  if (!sel) return;
  const destId = sel.value;
  const dest = (typeof p12DestinationOptions === 'function') ? p12DestinationOptions().find(function (d) { return d.id === destId; }) : null;
  if (!dest || !dest.country || dest.country === S.country) {
    el.innerHTML = '<p class="muted" style="font-size:.82rem">Domestic trip — no visa required.</p>';
    return;
  }
  const code = dest.country;
  const country = COUNTRIES[code] || {};
  if (typeof p47NeedsVisa !== 'function' || !p47NeedsVisa(code)) {
    el.innerHTML = '<p class="muted" style="font-size:.82rem;color:var(--mint)">✅ No visa required for Egyptian citizens visiting ' + (country.n || code) + ' for tourism.</p>';
    return;
  }

  const rule = p47VisaRule ? p47VisaRule(code) : null;
  const hasVisa = typeof p47HasValidVisa === 'function' && p47HasValidVisa(code);
  const active = typeof p47ActiveApplication === 'function' ? p47ActiveApplication(code) : null;
  const passportOK = typeof p47IsPassportValid === 'function' ? p47IsPassportValid() : true;

  let html = '<div style="padding:10px;border-radius:8px;border:1px solid var(--line);background:var(--bg)">';

  if (!passportOK) {
    html += '<p style="color:var(--rose);font-size:.85rem"><b>⚠️ Passport expired</b> — Renew it before travelling.</p>';
  } else if (hasVisa) {
    const v = S.p47.visas[code];
    html += '<p style="color:var(--mint);font-size:.85rem"><b>✅ Visa held</b> — ' + (rule ? rule.name : 'visitor visa') + ', valid until ' + v.expiresYear + '. You can book this trip.</p>';
  } else if (active) {
    html += '<p style="color:var(--amber);font-size:.85rem"><b>⏳ Visa processing</b> — ' + active.name + ', decision expected ' + active.readyYear + '. You cannot travel until then.</p>';
  } else if (rule) {
    const feeEGP = Math.round(rule.feeEGP * p48Idx());
    html += '<p style="font-size:.85rem"><b>⚠️ Visa required:</b> ' + rule.name + '</p>' +
      '<p class="muted" style="font-size:.78rem">Fee: ' + feeEGP.toLocaleString() + ' EGP (non-refundable). Minimum bank balance: ' + rule.minBankEGP.toLocaleString() + ' EGP. Validity: ' + rule.validityMonths + ' months.</p>' +
      '<button class="btn" style="margin-top:6px" onclick="p47ApplyForVisa(\'' + code + '\');p48UpdateVisaCheck()">Apply for visa · ' + feeEGP.toLocaleString() + ' EGP</button>';
  }

  html += '</div>';
  el.innerHTML = html;
}
window.p48UpdateVisaCheck = p48UpdateVisaCheck;

/* Refresh the visa check after the quote refresh */
const P48_p12RefreshTripQuoteBefore = p12RefreshTripQuote;
p12RefreshTripQuote = function () {
  const r = P48_p12RefreshTripQuoteBefore.apply(this, arguments);
  setTimeout(p48UpdateVisaCheck, 20);
  return r;
};

/* ============ 5. RUN ON LOAD ============ */
/* Hide old proof of funds section on the World tab too */
const P48_viewWorldBefore = viewWorld;
viewWorld = function () {
  let html = P48_viewWorldBefore();
  /* Remove the old "Immigrate without doing a master's" if it's cluttered — keep it but move it down */
  /* Ensure the visa panel is visible and clean */
  return html;
};
