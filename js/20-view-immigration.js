/* ============================================================
   VIEW: IMMIGRATION
   ============================================================
   Sub-tabs: Status · Study · Work · Residency · Citizenship · Asylum

   Owns: S.passports, S.immigration, S.languageScores, S.immigrationTab
   Data: 07-data-immigration.js (PASSPORT_DATA, VISA_TYPES, VISA_FEES,
         VISA_APPROVAL, PR_REQUIREMENTS, CITIZENSHIP_REQUIREMENTS,
         ASYLUM_INFO, ASYLUM_GROUNDS, LANGUAGE_TESTS, LANGUAGE_SCORE_RANGES,
         SCHOLARSHIPS, STUDY_DESTINATIONS, RELOCATION_COSTS, IQAMA_RULES,
         SUPPORTED_DESTINATIONS)

   Year tick: visa expiry, iqama renewal, PR/citizenship counters,
              pending application resolution, asylum case progression.

   Registers tab 'immigration' at order 8.
   ============================================================ */

/* ---------- STATE ---------- */
function ensureImmigrationState() {
  if (!S) return;
  if (!Array.isArray(S.passports)) S.passports = [S.country || 'egy'];
  if (!S.homeCountry) S.homeCountry = S.country || 'egy';
  if (!S.immigration) {
    S.immigration = {
      status: 'citizen_home',
      destination: null,
      visaType: null,
      sponsor: null,
      expiresYear: null,
      workRights: 'full',
      iqamaRenewalYear: null,
      statusSince: gameYear(),
      applications: [],
      history: [],
      prYearsCount: 0,
      citizenshipYearsCount: 0,
      asylumCase: null,
      overstayYears: 0
    };
  }
  const im = S.immigration;
  if (!Array.isArray(im.applications)) im.applications = [];
  if (!Array.isArray(im.history)) im.history = [];
  if (typeof im.prYearsCount !== 'number') im.prYearsCount = 0;
  if (typeof im.citizenshipYearsCount !== 'number') im.citizenshipYearsCount = 0;
  if (typeof im.overstayYears !== 'number') im.overstayYears = 0;
  if (typeof im.asylumCase === 'undefined') im.asylumCase = null;
  if (!S.languageScores) S.languageScores = {};
  if (!S.immigrationTab) S.immigrationTab = 'status';
}

GameHooks.on('newGame', ensureImmigrationState);
GameHooks.on('migrate', ensureImmigrationState);

/* ---------- HELPERS ---------- */
function immPassport() {
  if (!S.passports || !S.passports.length) return S.country || 'egy';
  let best = S.passports[0];
  let bestScore = (PASSPORT_DATA[best] || {}).strengthScore || 0;
  for (let i = 1; i < S.passports.length; i++) {
    const p = S.passports[i];
    const s = (PASSPORT_DATA[p] || {}).strengthScore || 0;
    if (s > bestScore) { best = p; bestScore = s; }
  }
  return best;
}
function immPassportData() { return PASSPORT_DATA[immPassport()] || PASSPORT_DATA.egy; }
function immDestination() { return S.immigration.destination || null; }
function immAtHome() { return !S.immigration.destination || S.immigration.destination === S.homeCountry; }
function immSupportedDest(code) { return SUPPORTED_DESTINATIONS.indexOf(code) >= 0; }
function immFeesFor(dest, type) {
  const d = VISA_FEES[dest] || {};
  return d[type] || { fee: 200, wait: 0.25, sevis: 0 };
}
function immApprovalFor(dest, type) {
  const d = VISA_APPROVAL[dest] || {};
  return d[type] || { baseChance: 0.50 };
}
function immBestLanguageScore() {
  const s = S.languageScores || {};
  return { ielts: s.ielts || 0, toefl: s.toefl || 0, goethe: s.goethe || 0, delf: s.delf || 0, celpip: s.celpip || 0 };
}
function immCanEnter(destCode) {
  const pd = immPassportData();
  if (pd.visa_free.indexOf(destCode) >= 0) return 'visa_free';
  if (pd.visa_on_arrival.indexOf(destCode) >= 0) return 'visa_on_arrival';
  if (pd.evisa.indexOf(destCode) >= 0) return 'evisa';
  if (pd.visa_hard.indexOf(destCode) >= 0) return 'visa_hard';
  if (pd.visa_required.indexOf(destCode) >= 0) return 'visa_required';
  return 'unknown';
}
function immCountryName(code) {
  const c = (typeof COUNTRIES !== 'undefined' && COUNTRIES[code]) || null;
  if (c) return c.name;
  const names = { 
    uk: 'United Kingdom', gbr: 'United Kingdom', deu: 'Germany', can: 'Canada', 
    aus: 'Australia', uae: 'UAE', jpn: 'Japan', ind: 'India', eu: 'European Union',
    nld: 'Netherlands', fra: 'France', ita: 'Italy', sgp: 'Singapore', bra: 'Brazil'
  };
  return names[code] || code.toUpperCase();
}
function immCountryRate(code) {
  const c = (typeof COUNTRIES !== 'undefined' && COUNTRIES[code]) || null;
  return c ? (c.rate || 1) : 1;
}

function immAddApplication(type, dest, extras) {
  const fees = immFeesFor(dest, type);
  const app = Object.assign({
    id: 'app_' + Math.random().toString(36).slice(2, 8),
    type: type,
    destination: dest,
    status: 'pending',
    submittedYear: gameYear(),
    decisionYear: gameYear() + Math.max(1, Math.ceil((fees.wait || 0.25) * 12 / 12)),
    reason: null
  }, extras || {});
  S.immigration.applications.push(app);
  S.immigration.history.push({ year: gameYear(), event: 'Applied for ' + type + ' visa to ' + dest, status: 'pending' });
  return app;
}

function immSetTab(tab) { S.immigrationTab = tab; render(); }
window.immSetTab = immSetTab;

function immStatusLabel() {
  const im = S.immigration;
  const pd = immPassportData();
  if (im.status === 'citizen_home') return pd.label + ' citizen · at home';
  if (im.status === 'undocumented') return '⚠️ Undocumented in ' + immCountryName(im.destination);
  return (VISA_TYPES[im.visaType] ? VISA_TYPES[im.visaType].label : im.status) + ' · ' + immCountryName(im.destination);
}

/* ---------- MAIN VIEW ---------- */
function immigrationView() {
  ensureImmigrationState();
  if (!S) return '';
  if (S.age < 16) return '<div class="card"><h3>🌍 Immigration</h3><p class="muted">Available from age 16+.</p></div>';

  const sub = S.immigrationTab;
  const hasMarriageVisa = (S.marriageVisa && (S.marriageVisa.status === 'pending' || (S.marriage && S.marriage.partner && typeof _mvIsCitizen === 'function' && _mvIsCitizen(S.marriage.partner) && isUndocumented())));
  const tabs = [
    ['status', '📋 Status'],
    ['study', '🎓 Study'],
    ['work', '💼 Work'],
    ['pr', '🏠 Residency'],
    ['citizenship', '🌐 Citizenship'],
    ['asylum', '🕊 Asylum']
  ];
  if (hasMarriageVisa) tabs.push(['marriage_visa', '💍 Marriage']);

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#22d3ee15 0%,transparent 100%);border-color:#22d3ee">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">IMMIGRATION · PASSPORT</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + immStatusLabel() + '</div></div>' +
    '<div style="font-size:2rem">🌍</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (sub === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="immSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

if (sub === 'status') html += immRenderStatus();
  else if (sub === 'study') html += immRenderStudy();
  else if (sub === 'work') html += immRenderWork();
  else if (sub === 'pr') html += immRenderPR();
  else if (sub === 'citizenship') html += immRenderCitizenship();
  else if (sub === 'asylum') html += immRenderAsylum();
  else if (sub === 'marriage_visa') html += (typeof marryVisaRender === 'function' ? marryVisaRender() : '<div class="card"><p class="muted small">Marriage visa system not loaded.</p></div>');

  return html;
}

/* ---------- TAB: STATUS ---------- */
function immRenderStatus() {
  const im = S.immigration;
  let html = '<div class="card"><h3>📋 Your Status</h3>';

  html += '<div class="row"><span>Passport(s)</span><b>' + S.passports.map(function(p) { return immCountryName(p); }).join(' + ') + '</b></div>';
  html += '<div class="row"><span>Strength</span><b>' + immPassportData().strengthScore + ' / 200</b></div>';
  html += '<div class="row"><span>Current location</span><b>' + immCountryName(S.country) + '</b></div>';

  if (im.status === 'citizen_home') {
    html += '<div class="row"><span>Immigration status</span><b style="color:#34d399">Citizen by birth</b></div>';
    html += '<p class="muted small" style="margin-top:10px">You have full rights in ' + immCountryName(S.homeCountry) + '. Use the other tabs to explore leaving.</p>';
  } else if (im.status === 'undocumented') {
    html += '<div class="row"><span>Status</span><b style="color:#fb7185">Undocumented in ' + immCountryName(im.destination) + '</b></div>';
    html += '<div class="row"><span>Years overstayed</span><b style="color:#fb7185">' + im.overstayYears + '</b></div>';
    html += '<div style="margin-top:10px;padding:8px;background:#fb718520;border-left:3px solid #fb7185;border-radius:6px">' +
      '<b style="color:#fb7185;font-size:.85rem">⚠️ Deportation risk</b>' +
      '<p class="muted small" style="margin:4px 0">You cannot work legally. Any day police could deport you. Only cash jobs available.</p>' +
      '<button class="opt" style="margin-top:6px;background:#fb7185;color:#fff" onclick="immVoluntaryReturn()">Voluntary return to ' + immCountryName(S.homeCountry) + '</button>' +
      '</div>';
  } else if (im.visaType) {
    const vt = VISA_TYPES[im.visaType] || { label: im.visaType, workRights: 'unknown' };
    html += '<div class="row"><span>Visa type</span><b>' + vt.label + '</b></div>';
    html += '<div class="row"><span>Destination</span><b>' + immCountryName(im.destination) + '</b></div>';
    html += '<div class="row"><span>Work rights</span><b>' + vt.workRights + '</b></div>';
    html += '<div class="row"><span>Sponsor</span><b>' + (im.sponsor || '—') + '</b></div>';
    if (im.expiresYear) html += '<div class="row"><span>Expires</span><b class="' + (im.expiresYear <= gameYear() + 1 ? 'bad' : 'good') + '">' + im.expiresYear + '</b></div>';
    if (im.iqamaRenewalYear) html += '<div class="row"><span>Iqama renewal</span><b>' + im.iqamaRenewalYear + '</b></div>';

    html += '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">';
    if (im.visaType === 'work' && im.expiresYear && im.expiresYear - gameYear() <= 1) {
      html += '<button class="opt" style="flex:1;padding:8px;font-size:.75rem;background:#22d3ee;color:#000;font-weight:700" onclick="immRenewVisa()">🔄 Renew visa</button>';
    }
    if (im.iqamaRenewalYear && im.iqamaRenewalYear <= gameYear() + 1) {
      html += '<button class="opt" style="flex:1;padding:8px;font-size:.75rem;background:#fbbf24;color:#000;font-weight:700" onclick="immRenewIqama()">📋 Renew iqama</button>';
    }
    html += '</div>';
    if (im.visaType === 'student') {
      html += '<p class="muted small" style="margin-top:10px">After graduation, you have 6-24 months to find a sponsored job. Else return home.</p>';
      html += '<button class="opt" style="margin-top:6px;text-align:center;border-color:#22d3ee;color:#22d3ee" onclick="immConvertStudentToWork()">Try to convert to work visa</button>';
    }
  }

  html += '</div>';

  const pending = im.applications.filter(function(a) { return a.status === 'pending'; });
  if (pending.length) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">Pending Applications</h3>';
    pending.forEach(function(a) {
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div><b>' + (VISA_TYPES[a.type] ? VISA_TYPES[a.type].label : a.type) + '</b> → ' + immCountryName(a.destination) + '</div>' +
        '<div class="muted small">Submitted ' + a.submittedYear + ' · Decision expected ' + a.decisionYear + '</div>' +
        '</div>';
    });
    html += '</div>';
  }

  const hist = (im.history || []).slice(-10).reverse();
  if (hist.length) {
    html += '<div class="card"><h3>Recent Immigration Events</h3>';
    hist.forEach(function(h) {
      html += '<div style="padding:5px 0;border-bottom:1px solid #1a1a2a;font-size:.82rem"><span class="muted mono" style="font-size:.7rem">' + h.year + '</span> · ' + h.event + '</div>';
    });
    html += '</div>';
  }

  return html;
}

/* ---------- TAB: STUDY ---------- */
function immRenderStudy() {
  let html = '<div class="card"><h3>🎓 Study Abroad</h3>' +
    '<p class="muted small">Full degree abroad. Requires language test, funds proof, and acceptance at a university.</p></div>';

  const s = S.languageScores;
  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">Language Scores</h4>';
  Object.keys(LANGUAGE_SCORE_RANGES).forEach(function(testId) {
    const test = LANGUAGE_TESTS.find(function(t) { return t.id === testId; });
    if (!test) return;
    const score = s[testId] || 0;
    const range = LANGUAGE_SCORE_RANGES[testId];
    const pass = score >= range.passScore;
    html += '<div class="row"><span>' + test.label + '</span>' +
      '<b class="' + (score > 0 ? (pass ? 'good' : 'bad') : 'muted') + '">' + (score > 0 ? score : 'not taken') + '</b></div>';
  });
  html += '<button class="opt" style="margin-top:8px;text-align:center" onclick="immOpenLanguageTestPicker()">📝 Book a language test</button></div>';

  html += '<div class="card"><h4 style="font-size:.85rem;color:#22d3ee">Study Destinations</h4>';
  STUDY_DESTINATIONS.forEach(function(dest) {
    const approval = immApprovalFor(dest.country, 'student');
    const fees = immFeesFor(dest.country, 'student');
    const totalFee = fees.fee + (fees.sevis || 0);
    const lawyerFee = (VISA_FEES[dest.country] && VISA_FEES[dest.country].lawyer) || 1500;

    html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div><div style="font-weight:700">' + dest.label + '</div>' +
      '<div class="muted small">' + dest.universities.slice(0, 3).join(' · ') + '</div></div>' +
      '<div style="text-align:right"><b>' + money((totalFee + lawyerFee) * (C().rate || 1)) + '</b><div class="muted" style="font-size:.7rem">total fees</div></div></div>' +
      '<div class="muted small" style="margin-top:4px">Approval base: ' + Math.round((approval.baseChance || 0) * 100) + '% · IELTS/Equiv ' + (approval.requiresIELTS || 0) + '+</div>' +
      '<button class="opt" style="margin-top:6px;text-align:center;font-size:.75rem" onclick="immApplyStudent(\'' + dest.country + '\')">Apply for student visa</button>' +
      '</div>';
  });
  html += '</div>';

  html += '<div class="card"><h4 style="font-size:.85rem;color:#fbbf24">🏆 Scholarships (full tuition + stipend)</h4>';
  SCHOLARSHIPS.forEach(function(sch) {
    html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
      '<div style="font-weight:700">' + sch.name + '</div>' +
      '<div class="muted small">' + immCountryName(sch.country) + ' · Acceptance ' + Math.round(sch.acceptanceRate * 100) + '%</div>' +
      '<button class="opt" style="margin-top:4px;padding:4px 8px;font-size:.72rem" onclick="immApplyScholarship(\'' + sch.id + '\')">Apply</button>' +
      '</div>';
  });
  html += '</div>';

  return html;
}

/* ---------- TAB: WORK ---------- */
function immRenderWork() {
  let html = '<div class="card"><h3>💼 Work Abroad</h3>' +
    '<p class="muted small">Requires employer sponsorship. Work visas are hard — USA is a lottery, UK needs £38,700+ salary, Germany needs skilled worker status.</p></div>';

  if (!SUPPORTED_DESTINATIONS.length) {
    html += '<div class="card"><p class="muted">No supported destinations installed.</p></div>';
    return html;
  }

  SUPPORTED_DESTINATIONS.forEach(function(dest) {
    const approval = immApprovalFor(dest, 'work');
    const fees = immFeesFor(dest, 'work');
    const destName = immCountryName(dest);

    html += '<div class="card">' +
      '<h4 style="font-size:.9rem;color:#22d3ee">' + destName + '</h4>' +
      '<div class="row"><span>Visa fee</span><b>' + money(fees.fee * (C().rate || 1)) + '</b></div>' +
      '<div class="row"><span>Lawyer fees</span><b>' + money(((VISA_FEES[dest] && VISA_FEES[dest].lawyer) || 1500) * (C().rate || 1)) + '</b></div>' +
      '<div class="row"><span>Approval base</span><b>' + Math.round(approval.baseChance * 100) + '%' + (approval.lottery ? ' (lottery)' : '') + '</b></div>';
    if (approval.requiresSalary) html += '<div class="row"><span>Min salary</span><b>' + money(approval.requiresSalary * (C().rate || 1)) + '/yr</b></div>';
    if (approval.requiresJobOffer) html += '<div class="row"><span>Requires job offer</span><b>Yes</b></div>';
    if (approval.requiresDegree) html += '<div class="row"><span>Requires degree</span><b>Yes</b></div>';

    html += '<button class="opt" style="margin-top:8px;text-align:center;background:#22d3ee;color:#000;font-weight:700" onclick="immStartWorkApplication(\'' + dest + '\')">Start work visa application</button>' +
      '</div>';
  });

  return html;
}

/* ---------- TAB: PR ---------- */
function immRenderPR() {
  const im = S.immigration;
  let html = '<div class="card"><h3>🏠 Permanent Residency</h3>';

  if (!im.destination || im.status === 'citizen_home' || im.status === 'undocumented') {
    html += '<p class="muted small">You must be on a long-term visa abroad first.</p></div>';
    return html;
  }

  const req = PR_REQUIREMENTS[im.destination];
  if (!req) {
    html += '<p class="muted small">No PR available for ' + immCountryName(im.destination) + '.</p></div>';
    return html;
  }
  if (req.years === null) {
    html += '<p class="muted small">' + (req.note || 'No PR path in this country.') + '</p></div>';
    return html;
  }

  html += '<div class="row"><span>Years on visa required</span><b>' + req.years + '</b></div>' +
    '<div class="row"><span>Your years</span><b>' + (im.prYearsCount || 0) + ' / ' + req.years + '</b></div>' +
    '<div class="row"><span>Application fee</span><b>' + money(req.fee * (C().rate || 1)) + '</b></div>';

  if (req.requiresJob) html += '<div class="row"><span>Requires active job</span><b>Yes</b></div>';
  if (req.requiresTax) html += '<div class="row"><span>Requires tax records</span><b>Yes</b></div>';
  if (req.requiresLifeTest) html += '<div class="row"><span>Life Test required</span><b>Yes</b></div>';
  if (req.requiresCleanRecord) html += '<div class="row"><span>Clean criminal record</span><b>Yes</b></div>';
  if (req.requiresB1German) html += '<div class="row"><span>German B1 required</span><b>Yes</b></div>';

  const canApply = im.prYearsCount >= req.years && im.visaType === 'work';
  html += '<button class="opt" style="margin-top:10px;text-align:center;background:' + (canApply ? '#22d3ee' : '#25253a') + ';color:' + (canApply ? '#000' : '#666') + ';font-weight:700" ' + (canApply ? '' : 'disabled') + ' onclick="immApplyPR()">' + (canApply ? 'Apply for PR' : 'Not eligible yet') + '</button>';

  html += '</div>';
  return html;
}

/* ---------- TAB: CITIZENSHIP ---------- */
function immRenderCitizenship() {
  const im = S.immigration;
  let html = '<div class="card"><h3>🌐 Citizenship</h3>';

  if (im.status !== 'pr' && im.visaType !== 'pr') {
    html += '<p class="muted small">You need permanent residency first.</p></div>';
    return html;
  }

  const req = CITIZENSHIP_REQUIREMENTS[im.destination];
  if (!req || req.yearsOnPR === null || req.yearsOnPR === undefined) {
    html += '<p class="muted small">' + (req ? req.note : 'Citizenship not typically available.') + '</p></div>';
    return html;
  }

  html += '<div class="row"><span>Years on PR required</span><b>' + req.yearsOnPR + '</b></div>' +
    '<div class="row"><span>Your years</span><b>' + (im.citizenshipYearsCount || 0) + ' / ' + req.yearsOnPR + '</b></div>' +
    '<div class="row"><span>Application fee</span><b>' + money(req.fee * (C().rate || 1)) + '</b></div>';
    
  if (req.requiresEnglishTest) html += '<div class="row"><span>English test required</span><b>Yes</b></div>';
  if (req.requiresLifeInUK) html += '<div class="row"><span>Life in UK test</span><b>Yes</b></div>';
  if (req.requiresCivicTest) html += '<div class="row"><span>Civic test required</span><b>Yes</b></div>';
  if (req.requiresGermanB1) html += '<div class="row"><span>German B1 required</span><b>Yes</b></div>';
  if (req.requiresDutchA2) html += '<div class="row"><span>Dutch A2 required</span><b>Yes</b></div>';
  if (req.requiresFrenchB1) html += '<div class="row"><span>French B1 required</span><b>Yes</b></div>';
  if (req.requiresJapaneseBasic) html += '<div class="row"><span>Basic Japanese required</span><b>Yes</b></div>';
  if (req.requiresItalianB1) html += '<div class="row"><span>Italian B1 required</span><b>Yes</b></div>';
  if (req.requiresPortugueseBasic) html += '<div class="row"><span>Basic Portuguese required</span><b>Yes</b></div>';
  
  if (req.allowsDual) html += '<div class="row"><span>Dual citizenship</span><b class="good">Allowed</b></div>';
  else if (req.allowsDual === false) html += '<div class="row"><span>Dual citizenship</span><b class="bad">Not allowed — must renounce</b></div>';

  const canApply = (im.citizenshipYearsCount || 0) >= req.yearsOnPR;
  html += '<button class="opt" style="margin-top:10px;text-align:center;background:' + (canApply ? '#22d3ee' : '#25253a') + ';color:' + (canApply ? '#000' : '#666') + ';font-weight:700" ' + (canApply ? '' : 'disabled') + ' onclick="immApplyCitizenship()">' + (canApply ? 'Apply for citizenship' : 'Not eligible yet') + '</button>';

  html += '</div>';
  return html;
}

/* ---------- TAB: ASYLUM ---------- */
function immRenderAsylum() {
  const im = S.immigration;
  let html = '<div class="card"><h3>🕊 Asylum</h3>' +
    '<p class="muted small">Claim persecution in your home country. Risky — if denied, you\'re deported. Cannot leave destination while case pending.</p></div>';

  if (im.asylumCase) {
    const ac = im.asylumCase;
    html += '<div class="card" style="border-color:#fbbf24">' +
      '<h3 style="color:#fbbf24">Your Asylum Case</h3>' +
      '<div class="row"><span>Country</span><b>' + immCountryName(ac.country) + '</b></div>' +
      '<div class="row"><span>Ground</span><b>' + ac.ground + '</b></div>' +
      '<div class="row"><span>Filed year</span><b>' + ac.filedYear + '</b></div>' +
      '<div class="row"><span>Status</span><b style="color:#fbbf24">Pending</b></div>' +
      '<div class="row"><span>Years in limbo</span><b>' + (gameYear() - ac.filedYear) + '</b></div>' +
      '<p class="muted small" style="margin-top:10px">You cannot leave ' + immCountryName(ac.country) + ' until a decision is made. Work rights limited.</p>' +
      '</div>';
    return html;
  }

  if (!immAtHome()) {
    html += '<div class="card"><p class="muted small">You must be at home to file asylum — you are currently in ' + immCountryName(S.country) + '.</p></div>';
    return html;
  }

  Object.keys(ASYLUM_INFO).forEach(function(dest) {
    const info = ASYLUM_INFO[dest];
    if (info.approvalChance === 0) return;
    html += '<div class="card">' +
      '<h4 style="font-size:.9rem;color:#22d3ee">' + immCountryName(dest) + '</h4>' +
      '<div class="row"><span>Approval rate</span><b>' + Math.round(info.approvalChance * 100) + '%</b></div>' +
      '<div class="row"><span>Wait time</span><b>' + info.waitYears + ' yrs</b></div>' +
      '<div class="row"><span>Work allowed after</span><b>' + (info.canWorkAfterMonths === 0 ? 'immediately' : info.canWorkAfterMonths + ' months') + '</b></div>' +
      '<p class="muted small" style="margin:6px 0">' + info.notes + '</p>' +
      '<button class="opt" style="text-align:center;border-color:#fb7185;color:#fb7185" onclick="immStartAsylum(\'' + dest + '\')">File asylum claim</button>' +
      '</div>';
  });

  return html;
}

/* ---------- ACTIONS ---------- */

window.immOpenLanguageTestPicker = function() {
  const opts = LANGUAGE_TESTS.map(function(t) { return t.id + ' = ' + t.label + ' (' + money(t.cost * (C().rate || 1)) + ')'; }).join('\n');
  const choice = prompt('Which test to book?\n\n' + opts + '\n\nEnter test id:', 'ielts');
  if (!choice) return;
  const test = LANGUAGE_TESTS.find(function(t) { return t.id === choice.trim(); });
  if (!test) { log('Unknown test.'); render(); return; }
  if (S.wealth < test.cost * (C().rate || 1)) { log('Not enough cash (' + money(test.cost * (C().rate || 1)) + ').'); render(); return; }
  S.wealth -= test.cost * (C().rate || 1);
  const range = LANGUAGE_SCORE_RANGES[test.id];
  const score = range.min + Math.random() * (range.max - range.min);
  const rounded = Math.round(score * 10) / 10;
  S.languageScores[test.id] = rounded;
  if (rounded >= range.passScore) {
    log('📝 ' + test.label + ' score: ' + rounded + ' — PASSED!');
    fx({ happiness: 5 });
  } else {
    log('📝 ' + test.label + ' score: ' + rounded + ' — Failed. Retake possible.');
    fx({ happiness: -3 });
  }
  render();
};

window.immApplyStudent = function(dest) {
  const approval = immApprovalFor(dest, 'student');
  const fees = immFeesFor(dest, 'student');
  const totalFee = fees.fee + (fees.sevis || 0);
  const lawyerFee = (VISA_FEES[dest] && VISA_FEES[dest].lawyer) || 1500;
  const totalCost = (totalFee + lawyerFee) * (C().rate || 1);

  if (S.wealth < totalCost) {
    log('Not enough cash. Need ' + money(totalCost) + '.');
    render(); return;
  }

  let engScore = S.languageScores.ielts || 0;
  if ((S.languageScores.toefl || 0) >= 90) engScore = Math.max(engScore, 6.5);
  else if ((S.languageScores.toefl || 0) >= 70) engScore = Math.max(engScore, 6.0);
  if ((S.languageScores.celpip || 0) >= 9) engScore = Math.max(engScore, 7.0);
  else if ((S.languageScores.celpip || 0) >= 7) engScore = Math.max(engScore, 6.0);

  if (approval.requiresIELTS && engScore < approval.requiresIELTS) {
    log('❌ Need IELTS ' + approval.requiresIELTS + ' (or equivalent TOEFL/CELPIP).');
    render(); return;
  }
  if (approval.requiresFunds && S.wealth < approval.requiresFunds * (C().rate || 1)) {
    log('❌ Need ' + money(approval.requiresFunds * (C().rate || 1)) + ' proof of funds.');
    render(); return;
  }

  S.wealth -= totalCost;
  const destObj = STUDY_DESTINATIONS.find(function(d) { return d.country === dest; });
  const university = destObj ? destObj.universities[0] : 'University';
  immAddApplication('student', dest, { university: university });
  log('📝 Applied for student visa to ' + immCountryName(dest) + '. Decision in ~' + Math.max(1, Math.ceil((fees.wait || 0.25) * 12 / 12)) + ' year(s).');
  render();
};

window.immStartWorkApplication = function(dest) {
  if (!immSupportedDest(dest)) {
    log('❌ Cannot move to ' + immCountryName(dest) + ' yet — country pack not installed.');
    render(); return;
  }
  const approval = immApprovalFor(dest, 'work');
  const fees = immFeesFor(dest, 'work');
  const lawyerFee = (VISA_FEES[dest] && VISA_FEES[dest].lawyer) || 1500;
  const totalCost = (fees.fee + lawyerFee) * (C().rate || 1);

  if (approval.requiresJobOffer && !S.job) {
    log('❌ Need a job offer first. Get a job in the Career tab.');
    render(); return;
  }
  if (approval.requiresSalary && S.job && S.job.salary < approval.requiresSalary * (C().rate || 1)) {
    log('❌ Job salary (' + money(S.job.salary) + ') is below the required ' + money(approval.requiresSalary * (C().rate || 1)) + '.');
    render(); return;
  }
  if (approval.requiresDegree && !S.degree) {
    log('❌ This visa requires a university degree.');
    render(); return;
  }
  if (S.wealth < totalCost) {
    log('Not enough cash for fees (' + money(totalCost) + ').');
    render(); return;
  }

  S.wealth -= totalCost;
  immAddApplication('work', dest, { employer: S.job ? S.job.company : 'Sponsor' });
  log('📝 Applied for work visa to ' + immCountryName(dest) + '. Decision in ~' + Math.max(1, Math.ceil((fees.wait || 0.25) * 12 / 12)) + ' year(s).');
  render();
};

window.immApplyScholarship = function(schId) {
  const sch = SCHOLARSHIPS.find(function(s) { return s.id === schId; });
  if (!sch) return;
  
  let langMeets = true;
  if (sch.requires.ielts) {
    let engScore = S.languageScores.ielts || 0;
    if ((S.languageScores.toefl || 0) >= 90) engScore = Math.max(engScore, 6.5);
    if ((S.languageScores.toefl || 0) >= 100) engScore = Math.max(engScore, 7.5);
    if ((S.languageScores.celpip || 0) >= 7) engScore = Math.max(engScore, 6.0);
    if ((S.languageScores.celpip || 0) >= 9) engScore = Math.max(engScore, 7.0);
    if (engScore < sch.requires.ielts) langMeets = false;
  }
  if (sch.requires.germanB1 && (S.languageScores.goethe || 0) < 3) langMeets = false;

  const meets = langMeets && (!sch.requires.gpa || (S.smarts || 0) >= (sch.requires.gpa * 20));
  
  if (!meets) {
    log('❌ Do not meet minimum requirements for ' + sch.name + '. Check GPA and language requirements.');
    render(); return;
  }
  const fee = 100 * (C().rate || 1);
  if (S.wealth < fee) { log('Need application fee.'); render(); return; }
  S.wealth -= fee;
  if (Math.random() < sch.acceptanceRate) {
    log('🎉 WON ' + sch.name + '! Full tuition + stipend.');
    immAddApplication('student', sch.country, { scholarship: sch.id, university: 'Funded' });
    fx({ happiness: 20 });
  } else {
    log('❌ Not selected for ' + sch.name + '.');
    fx({ happiness: -2 });
  }
  render();
};

window.immRenewVisa = function() {
  const im = S.immigration;
  if (!im.destination || !im.visaType) return;
  const fees = immFeesFor(im.destination, im.visaType);
  const cost = fees.fee * (C().rate || 1);
  if (S.wealth < cost) {
    log('Not enough cash for renewal (' + money(cost) + ').');
    render(); return;
  }
  S.wealth -= cost;
  const vt = VISA_TYPES[im.visaType];
  im.expiresYear = gameYear() + (vt && vt.durationYears ? vt.durationYears : 1);
  im.history.push({ year: gameYear(), event: 'Renewed ' + im.visaType + ' visa. New expiry ' + im.expiresYear });
  log('🔄 Visa renewed. New expiry: ' + im.expiresYear + '.');
  render();
};

window.immRenewIqama = function() {
  const im = S.immigration;
  const rules = IQAMA_RULES[im.destination];
  if (!rules) { log('No iqama for this destination.'); render(); return; }
  const cost = rules.cost * (C().rate || 1);
  if (S.wealth < cost) { log('Not enough (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;
  im.iqamaRenewalYear = gameYear() + rules.renewalYears;
  im.history.push({ year: gameYear(), event: 'Renewed iqama until ' + im.iqamaRenewalYear });
  log('📋 Iqama renewed until ' + im.iqamaRenewalYear + '.');
  render();
};

window.immConvertStudentToWork = function() {
  const im = S.immigration;
  if (im.visaType !== 'student') return;
  if (!S.degree) { log('❌ Need a degree first.'); render(); return; }
  if (!S.job) { log('❌ Need a job offer first.'); render(); return; }
  immAddApplication('work', im.destination, { employer: S.job.company });
  log('📝 Applied to convert to work visa.');
  render();
};

window.immApplyPR = function() {
  const im = S.immigration;
  const req = PR_REQUIREMENTS[im.destination];
  if (!req || !req.years) { log('PR not available here.'); render(); return; }
  if (im.prYearsCount < req.years) { log('Not eligible yet.'); render(); return; }
  if (req.requiresJob && !S.job) { log('❌ You need an active job to apply for PR.'); render(); return; }
  if (req.requiresB1German && (S.languageScores.goethe || 0) < 3) { log('❌ You need German B1 (Goethe certificate).'); render(); return; }
  
  const fee = req.fee * (C().rate || 1);
  if (S.wealth < fee) { log('Need ' + money(fee) + '.'); render(); return; }
  S.wealth -= fee;
  im.visaType = 'pr';
  im.status = 'pr';
  im.expiresYear = null;
  im.iqamaRenewalYear = null;
  im.history.push({ year: gameYear(), event: 'Granted PR in ' + im.destination });
  log('🏠 Granted PR in ' + immCountryName(im.destination) + '! You can now work without sponsor.');
  fx({ happiness: 15 });
  render();
};

window.immApplyCitizenship = function() {
  const im = S.immigration;
  const req = CITIZENSHIP_REQUIREMENTS[im.destination];
  if (!req || !req.yearsOnPR) { log('Not available.'); render(); return; }
  if (im.citizenshipYearsCount < req.yearsOnPR) { log('Not eligible yet.'); render(); return; }
  
  const fee = req.fee * (C().rate || 1);
  if (S.wealth < fee) { log('Need ' + money(fee) + '.'); render(); return; }
  S.wealth -= fee;

  let engScore = S.languageScores.ielts || 0;
  if ((S.languageScores.toefl || 0) >= 70) engScore = Math.max(engScore, 6.0);
  if ((S.languageScores.celpip || 0) >= 7) engScore = Math.max(engScore, 6.0);

  const langOK = !req.requiresEnglishTest || engScore >= 6.0;
  const germanOK = !req.requiresGermanB1 || (S.languageScores.goethe || 0) >= 3;
  const frenchOK = !req.requiresFrenchB1 || (S.languageScores.delf || 0) >= 3;

  if (!langOK || !germanOK || !frenchOK) {
    log('❌ Failed language requirement. Study more, retake the test, and try again.');
    fx({ happiness: -3 });
    render(); return;
  }
  
  if (Math.random() < 0.85) {
    if (!S.passports.includes(im.destination)) S.passports.push(im.destination);
    im.visaType = 'citizen';
    im.status = 'citizen';
    im.history.push({ year: gameYear(), event: 'Naturalized as citizen of ' + im.destination });
    log('🌐 Congratulations! You are now a citizen of ' + immCountryName(im.destination) + '!');
    fx({ happiness: 25 });
  } else {
    log('❌ Citizenship application denied. Try again next year.');
    fx({ happiness: -5 });
  }
  render();
};

window.immStartAsylum = function(dest) {
  const info = ASYLUM_INFO[dest];
  if (!info || info.approvalChance === 0) { log('Asylum not available for ' + immCountryName(dest) + '.'); render(); return; }
  const grounds = ASYLUM_GROUNDS.map(function(g) { return g.id; }).join(', ');
  const choice = prompt('Select asylum ground:\n' + grounds + '\n\n(False claims are risky)', 'political');
  if (!choice) return;
  const ground = ASYLUM_GROUNDS.find(function(g) { return g.id === choice.trim(); });
  if (!ground) { log('Unknown ground.'); return; }

  const travelCost = (RELOCATION_COSTS[dest] ? RELOCATION_COSTS[dest].flight : 500) * (C().rate || 1);
  if (S.wealth < travelCost) { log('Cannot afford travel to ' + immCountryName(dest) + ' (' + money(travelCost) + ').'); render(); return; }
  S.wealth -= travelCost;

  S.immigration.asylumCase = {
    country: dest,
    ground: ground.label,
    groundId: ground.id,
    filedYear: gameYear(),
    status: 'pending',
    baseChance: info.approvalChance + ground.baseChanceBonus
  };
  S.immigration.destination = dest;
  S.immigration.visaType = 'asylum';
  S.immigration.status = 'asylum';
  S.immigration.workRights = 'limited';
  S.immigration.history.push({ year: gameYear(), event: 'Filed asylum in ' + dest + ' (' + ground.label + ')' });
  log('🕊 Filed asylum claim in ' + immCountryName(dest) + '. Cannot leave. Wait for decision.');
  render();
};

window.immVoluntaryReturn = function() {
  if (!confirm('Return to ' + immCountryName(S.homeCountry) + '?\n\nYou will lose your illegal status here.')) return;
  S.immigration.destination = null;
  S.immigration.visaType = null;
  S.immigration.status = 'citizen_home';
  S.immigration.expiresYear = null;
  S.immigration.overstayYears = 0;
  S.immigration.iqamaRenewalYear = null;
  S.country = S.homeCountry;
  S.immigration.history.push({ year: gameYear(), event: 'Voluntary return to ' + S.homeCountry });
  log('🏠 Returned voluntarily to ' + immCountryName(S.homeCountry) + '.');
  render();
};

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureImmigrationState();
  if (!S) return;
  const im = S.immigration;
  const year = gameYear();

  /* PR & citizenship progress */
  if (im.visaType === 'work' && im.destination) {
    im.prYearsCount = (im.prYearsCount || 0) + 1;
  }
  if (im.visaType === 'pr') {
    im.citizenshipYearsCount = (im.citizenshipYearsCount || 0) + 1;
  }

  /* Process pending applications */
  im.applications = im.applications.filter(function(app) {
    if (app.status !== 'pending') return false;
    if (year < app.decisionYear) return true;

    const approval = immApprovalFor(app.destination, app.type);
    let chance = approval.baseChance || 0.5;
    if (app.scholarship) chance = 0.95;

    const scores = immBestLanguageScore();
    let engScore = scores.ielts;
    if (scores.toefl >= 100) engScore = Math.max(engScore, 7.5);
    else if (scores.toefl >= 90) engScore = Math.max(engScore, 6.5);
    if (scores.celpip >= 9) engScore = Math.max(engScore, 7.5);
    else if (scores.celpip >= 7) engScore = Math.max(engScore, 6.5);

    if (engScore >= 7.5) chance += 0.10;
    else if (engScore >= 6.5) chance += 0.05;

    if (scores.goethe >= 4 || scores.delf >= 4) chance += 0.10;
    else if (scores.goethe >= 3 || scores.delf >= 3) chance += 0.05;

    if (S.smarts > 70) chance += 0.10;
    else if (S.smarts > 50) chance += 0.05;

    if (Math.random() < chance) {
      /* APPROVED */
      if (app.type === 'work') {
        im.status = 'visa_work';
        im.visaType = 'work';
        im.destination = app.destination;
        im.sponsor = 'employer';
        im.workRights = 'full';
        im.expiresYear = year + (VISA_TYPES.work.durationYears || 3);
        im.statusSince = year;
        if (IQAMA_RULES[app.destination]) im.iqamaRenewalYear = year + IQAMA_RULES[app.destination].renewalYears;

        if (immSupportedDest(app.destination)) {
          // Convert wealth and salary to new currency
          const oldRate = (typeof COUNTRIES !== 'undefined' && COUNTRIES[S.country] && COUNTRIES[S.country].rate) || 1;
          S.country = app.destination;
          const newRate = (typeof COUNTRIES !== 'undefined' && COUNTRIES[S.country] && COUNTRIES[S.country].rate) || 1;
          if (oldRate !== newRate) {
            if (typeof S.wealth === 'number') S.wealth = Math.round(S.wealth / oldRate * newRate);
            if (S.job && typeof S.job.salary === 'number') S.job.salary = Math.round(S.job.salary / oldRate * newRate);
          }
          log('✈️ MOVED to ' + immCountryName(app.destination) + ' on a work visa!');
          fx({ happiness: 20 });
        } else {
          log('🎉 Work visa approved for ' + immCountryName(app.destination) + '! (Country pack not installed.)');
        }
      } else if (app.type === 'student') {
        im.status = 'visa_student';
        im.visaType = 'student';
        im.destination = app.destination;
        im.sponsor = 'university';
        im.workRights = '20h/week';
        im.expiresYear = year + 4;
        im.statusSince = year;
        log('🎓 Student visa approved for ' + immCountryName(app.destination) + '!');
        fx({ happiness: 15 });
      }
      im.history.push({ year: year, event: app.type + ' visa to ' + app.destination + ' APPROVED' });
      return false;
    } else {
      /* DENIED */
      im.history.push({ year: year, event: app.type + ' visa to ' + app.destination + ' DENIED' });
      log('❌ ' + app.type + ' visa to ' + immCountryName(app.destination) + ' DENIED.');
      fx({ happiness: -5 });
      return false;
    }
  });

  /* Visa expiry */
  if (im.expiresYear && im.expiresYear <= year + 1 && im.visaType !== 'pr' && im.visaType !== 'citizen') {
    log('⚠️ Your ' + im.visaType + ' visa expires ' + im.expiresYear + '. Renew or face undocumented status.');
  }
  if (im.expiresYear && im.expiresYear <= year && im.visaType !== 'pr' && im.visaType !== 'citizen') {
    log('🚨 Your visa EXPIRED. You are now undocumented in ' + immCountryName(im.destination) + '.');
    im.visaType = 'undocumented';
    im.status = 'undocumented';
    im.workRights = 'none';
  }
  if (im.visaType === 'undocumented') im.overstayYears = (im.overstayYears || 0) + 1;

  /* Iqama reminder */
  if (im.iqamaRenewalYear && im.iqamaRenewalYear <= year) {
    log('⚠️ Iqama renewal overdue in ' + immCountryName(im.destination) + '.');
    if (im.iqamaRenewalYear < year - 1) {
      log('🚨 Iqama expired over a year — deportation risk high.');
    }
  }

  /* Asylum case */
  if (im.asylumCase && im.asylumCase.status === 'pending') {
    const info = ASYLUM_INFO[im.asylumCase.country];
    const yearsIn = year - im.asylumCase.filedYear;
    if (yearsIn >= info.waitYears) {
      if (Math.random() < im.asylumCase.baseChance) {
        im.asylumCase.status = 'approved';
        im.visaType = 'pr';
        im.status = 'pr';
        im.workRights = 'full';
        im.expiresYear = null;
        im.prYearsCount = 0;
        im.history.push({ year: year, event: 'Asylum APPROVED in ' + im.asylumCase.country });
        log('🎉 Asylum GRANTED! You now have PR in ' + immCountryName(im.asylumCase.country) + '.');
        fx({ happiness: 25 });
        if (immSupportedDest(im.asylumCase.country)) S.country = im.asylumCase.country;
      } else {
        im.history.push({ year: year, event: 'Asylum DENIED in ' + im.asylumCase.country });
        log('🚨 Asylum DENIED. You will be deported to ' + immCountryName(S.homeCountry) + '.');
        im.asylumCase.status = 'denied';
        im.destination = null;
        im.visaType = null;
        im.status = 'citizen_home';
        im.workRights = 'full';
        S.country = S.homeCountry;
        im.asylumCase = null;
      }
    }
  }
});

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'immigration', label: '🌍 Immigration', order: 8, view: immigrationView });
