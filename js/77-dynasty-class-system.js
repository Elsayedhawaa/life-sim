/* =====================================================================
   77. DYNASTY, FAMILY BUSINESS, SOCIAL CLASS & P76 FIXES
   Fixes:
   - P76 sibling duplication on newGame
   - P76 setup panel state persistence
   - P76 family requests not filtered in all paths
   - P76 famWealth compatibility with base 0-2 scale
   Adds:
   - Family business (manage, work, inherit, sell)
   - Extended family (uncles, aunts, cousins)
   - Elite connections for job hunting
   - Household staff (driver, cook, maid, nanny)
   - Social class system with reputation uses
   - Marriage expectations by class
   - Trust fund for ultra-wealthy
   - Childhood privilege events
   - Dynasty inheritance chain
   - Prestige system
   - Land/property holdings for wealthy families
   Load AFTER 76-life-customization.js and BEFORE 99-boot.js
   ===================================================================== */

function p77Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p77Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p77EGP(egp) { return Math.round(egp * p77Idx()); }

/* =================================================================
   PART 1 — P76 BUG FIXES
   ================================================================= */

/* ---- Fix 1: Sibling duplication on newGame ---- */
const P77_newGameBefore = newGame;
newGame = function () {
  P77_newGameBefore.apply(this, arguments);
  if (!S) return;
  /* p76's apply function may have created siblings twice. Deduplicate. */
  const seen = {};
  const cleaned = [];
  (S.family || []).forEach(function (m) {
    if (!m) return;
    const key = m.role + '_' + (m.name || '') + '_' + m.age;
    if (m.role === 'Sibling' && seen[key]) return;
    seen[key] = true;
    cleaned.push(m);
  });
  S.family = cleaned;
};

/* ---- Fix 2: Setup panel state persistence ---- */
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('p76_setup_open');
    window.P76_SETUP_OPEN = saved === 'true';
    const savedSetup = localStorage.getItem('p76_setup_cfg');
    if (savedSetup) {
      try {
        window.P76_SETUP = JSON.parse(savedSetup);
      } catch (e) {}
    }
  } catch (e) {}
}
const P77_p76SetTierBefore = (typeof p76SetTier === 'function') ? p76SetTier : null;
if (P77_p76SetTierBefore) {
  p76SetTier = function (id) {
    const r = P77_p76SetTierBefore.apply(this, arguments);
    try { localStorage.setItem('p76_setup_cfg', JSON.stringify(window.P76_SETUP)); } catch (e) {}
    return r;
  };
  p76SetPreset = function (id) {
    if (typeof P77_p76SetTierBefore !== 'undefined') {}
    if (!P76_PARENT_PRESETS[id]) return;
    window.P76_SETUP.parentPreset = id;
    try { localStorage.setItem('p76_setup_cfg', JSON.stringify(window.P76_SETUP)); } catch (e) {}
    if (typeof buildStart === 'function') buildStart();
  };
  p76SetSiblings = function (n) {
    window.P76_SETUP.siblingCount = Math.max(0, Math.min(5, Number(n) || 0));
    try { localStorage.setItem('p76_setup_cfg', JSON.stringify(window.P76_SETUP)); } catch (e) {}
    if (typeof buildStart === 'function') buildStart();
  };
  p76SetOcc = function (id) {
    window.P76_SETUP.occupation = id;
    try { localStorage.setItem('p76_setup_cfg', JSON.stringify(window.P76_SETUP)); } catch (e) {}
    if (typeof buildStart === 'function') buildStart();
  };
  p76ToggleSetup = function () {
    window.P76_SETUP_OPEN = !window.P76_SETUP_OPEN;
    try { localStorage.setItem('p76_setup_open', String(window.P76_SETUP_OPEN)); } catch (e) {}
    if (typeof buildStart === 'function') buildStart();
  };
}

/* ---- Fix 3: famWealth compatibility ---- */
/* Base game uses S.famWealth 0=Modest, 1=Comfortable, 2=Wealthy.
   We map our 6 tiers down to this 3-tier scale for old systems. */
function p77WealthTierToFamWealth(level) {
  if (level <= 1) return 0;
  if (level <= 3) return 1;
  return 2;
}

const P77_ageUpBeforeFamWealth = ageUp;
ageUp = function () {
  const r = P77_ageUpBeforeFamWealth.apply(this, arguments);
  if (S && S.p76 && typeof S.p76.wealthLevel === 'number') {
    S.famWealth = p77WealthTierToFamWealth(S.p76.wealthLevel);
  }
  return r;
};

/* ---- Fix 4: family requests across all generators ---- */
/* Block ALL family money requests for upper tiers */
function p77ShouldBlockFamilyRequest() {
  if (!S || !S.p76) return false;
  const level = Number(S.p76.wealthLevel) || 0;
  return level >= 3;   /* upper_mid and above never ask */
}

/* Wrap p12AnswerParentNeed and p14RespondFamilyNeed to skip if rich */
if (typeof p14ShowParentRequestModal === 'function') {
  const P77_p14ShowBefore = p14ShowParentRequestModal;
  p14ShowParentRequestModal = function () {
    if (p77ShouldBlockFamilyRequest()) {
      if (S) {
        S.parentNeed = null;
        S.familyNeed = null;
      }
      const el = document.getElementById('p14-parent-request-modal');
      if (el) el.remove();
      return;
    }
    return P77_p14ShowBefore.apply(this, arguments);
  };
}

/* Wrap p20 family call event */
if (typeof p20FamilyCallEvent === 'function') {
  const P77_p20CallBefore = p20FamilyCallEvent;
  p20FamilyCallEvent = function () {
    if (p77ShouldBlockFamilyRequest()) return null;
    return P77_p20CallBefore.apply(this, arguments);
  };
}

/* ---- Fix 5: Starting home tier ---- */
/* p76 already does this, but ensure it always runs even on migrated saves */
setTimeout(function () {
  if (S && S.p76 && S.p76.setupDone && S.housing === 'parents') {
    if (typeof p76OverrideParentsHome === 'function') {
      try { p76OverrideParentsHome(); save(); } catch (e) {}
    }
  }
}, 800);

/* =================================================================
   PART 2 — STATE
   ================================================================= */
function p77Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p77) o.p77 = {};
  const d = o.p77;
  if (!Array.isArray(d.extendedFamily)) d.extendedFamily = [];
  if (typeof d.familyBusinessManaged !== 'boolean') d.familyBusinessManaged = false;
  if (typeof d.worksForFamily !== 'boolean') d.worksForFamily = false;
  if (typeof d.familyBusinessRevenue !== 'number') d.familyBusinessRevenue = 0;
  if (typeof d.familyBusinessEmployees !== 'number') d.familyBusinessEmployees = 0;
  if (!Array.isArray(d.householdStaff)) d.householdStaff = [];
  if (typeof d.trustFundBalance !== 'number') d.trustFundBalance = 0;
  if (typeof d.trustFundUnlockAge !== 'number') d.trustFundUnlockAge = 21;
  if (!Array.isArray(d.landHoldings)) d.landHoldings = [];
  if (typeof d.socialClass !== 'string') d.socialClass = 'middle';
  if (typeof d.prestigePoints !== 'number') d.prestigePoints = 0;
  if (!Array.isArray(d.connections)) d.connections = [];
  if (typeof d.eliteNetwork !== 'boolean') d.eliteNetwork = false;
  if (!Array.isArray(d.childhoodPrivileges)) d.childhoodPrivileges = [];
  if (typeof d.dowryOwed !== 'number') d.dowryOwed = 0;
  if (typeof d.mahrOwed !== 'number') d.mahrOwed = 0;
  if (!d.dynasty) d.dynasty = { generation: 1, familyName: null, prestige: 0, holdings: [], ancestors: [] };
}
const P77_migrate = migrate;
migrate = function (o) { const r = P77_migrate(o); p77Init(r); return r; };
const P77_newGameInit = newGame;
newGame = function () {
  P77_newGameInit.apply(this, arguments);
  p77Init(S);
  p77SetupFromTier();
};

/* =================================================================
   PART 3 — SETUP FROM TIER
   ================================================================= */
function p77SetupFromTier() {
  if (!S || !S.p76) return;
  p77Init(S);
  const level = Number(S.p76.wealthLevel) || 2;
  const rate = p77Rate();

  /* Set social class */
  S.p77.socialClass = ['poor', 'poor', 'lower_mid', 'middle', 'upper', 'elite'][level] || 'middle';

  /* Wealthy families have land */
  if (level >= 4) {
    S.p77.landHoldings = [
      { id: 'land_farm', name: 'Family agricultural land', acres: 20 + Math.floor(Math.random() * 100), location: 'Delta', valueInternal: (500000 + Math.random() * 2000000) * p77Idx() / rate }
    ];
    if (level === 5) {
      S.p77.landHoldings.push({ id: 'land_north_coast', name: 'North Coast beach plot', acres: 2 + Math.random() * 5, location: 'Marassi area', valueInternal: (3000000 + Math.random() * 7000000) * p77Idx() / rate });
      S.p77.landHoldings.push({ id: 'land_new_cairo', name: 'New Cairo development plot', acres: 5 + Math.random() * 10, location: 'New Cairo', valueInternal: (5000000 + Math.random() * 10000000) * p77Idx() / rate });
    }
  }

  /* Household staff for wealthy tiers */
  if (level >= 4) {
    S.p77.householdStaff = [
      { id: 'maid', name: 'Housekeeper', monthlyCostEGP: 6500 },
      { id: 'cook', name: 'Cook', monthlyCostEGP: 9000 }
    ];
    if (level === 5) {
      S.p77.householdStaff.push({ id: 'driver', name: 'Chauffeur', monthlyCostEGP: 11000 });
      S.p77.householdStaff.push({ id: 'nanny', name: 'Nanny / governess', monthlyCostEGP: 12000 });
      S.p77.householdStaff.push({ id: 'gardener', name: 'Gardener', monthlyCostEGP: 5500 });
    }
  }

  /* Trust fund for ultra-wealthy */
  if (level === 5) {
    S.p77.trustFundBalance = (2000000 + Math.random() * 8000000) * p77Idx() / rate;
    S.p77.trustFundUnlockAge = 21;
  } else if (level === 4) {
    S.p77.trustFundBalance = (200000 + Math.random() * 500000) * p77Idx() / rate;
    S.p77.trustFundUnlockAge = 25;
  }

  /* Elite network flag */
  S.p77.eliteNetwork = level >= 4;

  /* Generate extended family */
  p77GenerateExtendedFamily();

  /* Family business if the tier allows */
  if (S.p76.familyBusiness) {
    p77InitBusinessFromName(S.p76.familyBusiness, level);
  }
}

function p77GenerateExtendedFamily() {
  if (!S || !S.p76) return;
  const level = Number(S.p76.wealthLevel) || 2;
  /* Wealthy families have more visible extended family */
  const extCount = level >= 4 ? 5 + Math.floor(Math.random() * 4)
    : level >= 2 ? 3 + Math.floor(Math.random() * 3)
    : 1 + Math.floor(Math.random() * 2);

  const roles = ['Uncle', 'Aunt', 'Cousin', 'Cousin', 'Uncle', 'Aunt', 'Grandfather', 'Grandmother', 'Cousin'];
  S.p77.extendedFamily = [];
  for (let i = 0; i < extCount; i++) {
    const role = roles[i % roles.length];
    const name = (typeof localName === 'function') ? localName(S.country, Math.random() < 0.5 ? 'm' : 'f') : 'Family Member';
    const baseAge = role === 'Grandfather' || role === 'Grandmother' ? 68 + Math.floor(Math.random() * 15)
      : role === 'Uncle' || role === 'Aunt' ? (S.age + 25 + Math.floor(Math.random() * 20))
      : (S.age + Math.floor(Math.random() * 15) - 5);
    S.p77.extendedFamily.push({
      id: 'ext_' + i + '_' + Math.random().toString(36).slice(2, 6),
      role: role,
      name: name,
      age: baseAge,
      bond: 40 + Math.floor(Math.random() * 40),
      tier: level,
      alive: true,
      notes: p77ExtendedFamilyNotes(role, level)
    });
  }
}

function p77ExtendedFamilyNotes(role, level) {
  if (role === 'Grandfather' || role === 'Grandmother') {
    return level >= 4 ? 'Owns family land and holds the family name high' : 'Retired, lives modestly';
  }
  if (role === 'Uncle' || role === 'Aunt') {
    return level >= 4 ? 'Has business interests and connections' : 'Regular middle-class life';
  }
  if (role === 'Cousin') {
    return level >= 4 ? 'Studies or works abroad; well-connected' : 'Studies or works locally';
  }
  return 'Family';
}

function p77InitBusinessFromName(name, level) {
  if (!S) return;
  const rate = p77Rate();
  const baseRevenue = level === 5 ? 20000000 : level === 4 ? 3000000 : 500000;
  const baseEmployees = level === 5 ? 200 : level === 4 ? 35 : 8;
  S.p77.familyBusinessRevenue = (baseRevenue + Math.random() * baseRevenue * 0.5) * p77Idx() / rate;
  S.p77.familyBusinessEmployees = baseEmployees + Math.floor(Math.random() * baseEmployees * 0.5);
  S.p77.familyBusinessName = name;
}

/* =================================================================
   PART 4 — FAMILY BUSINESS SYSTEM
   ================================================================= */
function p77FamilyBusinessCard() {
  if (!S || !S.p76 || !S.p76.familyBusiness) return '';
  p77Init(S);
  const rate = p77Rate();
  const bizName = S.p76.familyBusiness;
  const revenueEGP = Math.round(S.p77.familyBusinessRevenue * rate);
  const employees = S.p77.familyBusinessEmployees;
  const canWork = S.age >= 18 && !S.job && !S.p77.worksForFamily;
  const canManage = S.age >= 21 && !S.p77.familyBusinessManaged;

  let html = '<section class="card" style="border-color:var(--mint)"><h3>💼 ' + bizName + '</h3>' +
    '<p class="muted" style="font-size:.82rem">Your family owns and operates this business. Annual revenue is an estimate. You can work here, manage it, or inherit a share.</p>' +
    '<div class="row"><span>Annual revenue</span><b class="mono" style="color:var(--mint)">E£' + revenueEGP.toLocaleString() + '</b></div>' +
    '<div class="row"><span>Employees</span><b>' + employees + '</b></div>' +
    '<div class="row"><span>Family ownership</span><b>100%</b></div>';

  if (S.p77.worksForFamily) {
    const salaryEGP = Math.round(revenueEGP * 0.03);
    html += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span>Your role</span><b>Employee</b></div>' +
      '<div class="row"><span>Your salary</span><b class="mono">E£' + salaryEGP.toLocaleString() + '/yr</b></div>' +
      '<button class="btn" style="border-color:var(--rose);color:var(--rose)" onclick="p77QuitFamilyBusiness()">Leave the family business</button>';
  } else if (canWork) {
    const salaryEGP = Math.round(revenueEGP * 0.03);
    html += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p77WorkForFamily()">' +
      'Work for the family business · E£' + salaryEGP.toLocaleString() + '/year' +
      '<small>Lower than market but stable and safe</small>' +
      '</button>';
  }

  if (canManage && !S.p77.familyBusinessManaged) {
    html += '<button class="btn" onclick="p77ManageFamilyBusiness()">' +
      'Manage the family business' +
      '<small>Requires 8h/week attention · increases revenue by 15–30%/year but lowers personal time</small>' +
      '</button>';
  }

  if (S.p77.familyBusinessManaged) {
    html += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span>You manage</span><b style="color:var(--mint)">Active</b></div>' +
      '<button class="btn" style="border-color:var(--amber)" onclick="p77StopManaging()">Stop managing</button>';
  }

  if (S.age >= 25) {
    const shareValueEGP = Math.round(revenueEGP * 3.5);
    html += '<button class="btn" onclick="p77InheritBusiness()" style="border-color:var(--violet)">' +
      'Request your share of the business' +
      '<small>Estimated value: E£' + shareValueEGP.toLocaleString() + ' (subject to sibling splits and parent approval)</small>' +
      '</button>';
  }

  html += '</section>';
  return html;
}

function p77WorkForFamily() {
  if (!S || !S.p77) return;
  if (S.job) return hint('Quit your current job first.');
  const rate = p77Rate();
  const revenueEGP = Math.round(S.p77.familyBusinessRevenue * rate);
  const salaryEGP = Math.round(revenueEGP * 0.03);
  const salaryInternal = salaryEGP / rate;
  S.p77.worksForFamily = true;
  S.job = {
    trackId: 'entry',
    level: 0,
    title: 'Family Business Associate',
    salary: salaryInternal,
    perf: 60,
    years: 0,
    company: S.p76.familyBusiness,
    companySize: 'family business',
    companyFactor: 1,
    benefits: { medical: true, social: true, bonus: 0.02, leave: 21, remote: 'On-site', hours: 40, pension: true, contract: 'Family employment' },
    stress: 3,
    isFamilyBusiness: true
  };
  log('💼 You started working for the family business (' + S.p76.familyBusiness + ') at E£' + salaryEGP.toLocaleString() + '/year.');
  realismNotice('Working for the family', 'You joined the family business. Pay is lower than the open market but the role is stable and there is room to advance.');
  hint(); render();
}
window.p77WorkForFamily = p77WorkForFamily;

function p77QuitFamilyBusiness() {
  if (!S || !S.p77) return;
  if (!confirm('Leave the family business? Your parents may be disappointed.')) return;
  S.p77.worksForFamily = false;
  if (S.job && S.job.isFamilyBusiness) S.job = null;
  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 8);
  });
  log('You left the family business.');
  hint(); render();
}
window.p77QuitFamilyBusiness = p77QuitFamilyBusiness;

function p77ManageFamilyBusiness() {
  if (!S || !S.p77) return;
  if (S.p77.familyBusinessManaged) return hint('You already manage it.');
  if (S.age < 21) return hint('Managing requires age 21+.');
  S.p77.familyBusinessManaged = true;
  S.p77.familyBusinessRevenue *= 1.20;   /* base bump */
  fx({ happiness: 4, smarts: 2, health: -2 });
  log('💼 You took on a management role at ' + S.p76.familyBusiness + '. Revenue jumped 20% in year 1.');
  realismNotice('Managing the family business', 'You now handle operations, staff, and clients. Revenue grows 15–30% per year but you have less personal time.');
  hint(); render();
}
window.p77ManageFamilyBusiness = p77ManageFamilyBusiness;

function p77StopManaging() {
  if (!S || !S.p77) return;
  S.p77.familyBusinessManaged = false;
  log('You stepped back from managing the family business.');
  hint(); render();
}
window.p77StopManaging = p77StopManaging;

function p77InheritBusiness() {
  if (!S || !S.p76 || !S.p77) return;
  const siblingCount = (S.family || []).filter(function (m) { return m && m.role === 'Sibling' && m.alive !== false; }).length;
  const totalShares = 1 + siblingCount;
  const myShare = 1 / totalShares;
  const rate = p77Rate();
  const bizValueEGP = Math.round(S.p77.familyBusinessRevenue * rate * 3.5);
  const myValueEGP = Math.round(bizValueEGP * myShare);

  if (!confirm('Request your share of ' + S.p76.familyBusiness + '?\n\n' +
    'Total value: E£' + bizValueEGP.toLocaleString() + '\n' +
    'Siblings: ' + siblingCount + ' (total heirs ' + totalShares + ')\n' +
    'Your share: E£' + myValueEGP.toLocaleString() + ' (' + Math.round(myShare * 100) + '%)\n\n' +
    'Your parents may refuse or negotiate.')) return;

  /* Parents decide based on generosity + bond */
  const generosity = (S.p76.parentsTraits && S.p76.parentsTraits.generosity) || 6;
  const aliveParents = (typeof parents === 'function' ? parents() : []).filter(function (p) { return p && p.alive !== false; });
  if (!aliveParents.length) return hint('Your parents are no longer alive. The business goes through inheritance when they pass.');

  const agreeChance = 0.35 + generosity * 0.05 + (bestBond ? bestBond() / 400 : 0);
  if (Math.random() < Math.min(0.9, agreeChance)) {
    /* Business shares transferred */
    S.wealth += myValueEGP / rate * 0.5;   /* they give cash now, shares stay with parents */
    log('💼 Your parents agreed to transfer a portion of business equity to you. Cash advanced: E£' + Math.round(myValueEGP * 0.5).toLocaleString() + '.');
    realismNotice('Business inheritance started', 'Your parents have begun transferring business wealth to you. The remaining shares will be distributed at inheritance.');
    S.p77.familyBusinessManaged = true;
  } else {
    (typeof parents === 'function' ? parents() : []).forEach(function (p) {
      if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 5);
    });
    log('❌ Your parents declined to transfer business shares now.');
  }
  hint(); render();
}
window.p77InheritBusiness = p77InheritBusiness;

/* =================================================================
   PART 5 — HOUSEHOLD STAFF
   ================================================================= */
function p77HouseholdStaffCard() {
  if (!S || !S.p77 || !Array.isArray(S.p77.householdStaff) || !S.p77.householdStaff.length) return '';
  const rate = p77Rate();
  const monthlyCostEGP = S.p77.householdStaff.reduce(function (sum, s) { return sum + (s.monthlyCostEGP || 0); }, 0);
  const annualCostEGP = monthlyCostEGP * 12;

  let html = '<section class="card" style="border-color:var(--violet)"><h3>👥 Household staff</h3>' +
    '<p class="muted" style="font-size:.82rem">Your family employs staff. You benefit from the comfort while living at home.</p>';
  S.p77.householdStaff.forEach(function (s) {
    html += '<div class="row" style="padding:4px 0;font-size:.84rem"><span>' + s.name + '</span><b class="mono">E£' + s.monthlyCostEGP.toLocaleString() + '/month</b></div>';
  });
  html += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Total monthly</b></span><b class="mono" style="color:var(--rose)">E£' + monthlyCostEGP.toLocaleString() + '</b></div>' +
    '<div class="row"><span><b>Total yearly</b></span><b class="mono" style="color:var(--rose)">E£' + annualCostEGP.toLocaleString() + '</b></div>' +
    '<p class="muted" style="font-size:.75rem;margin-top:6px">Your parents cover these costs while you live at home. Moving out means paying for help yourself.</p>' +
    '</section>';
  return html;
}

/* =================================================================
   PART 6 — TRUST FUND
   ================================================================= */
function p77TrustFundCard() {
  if (!S || !S.p77 || S.p77.trustFundBalance <= 0) return '';
  const rate = p77Rate();
  const balanceEGP = Math.round(S.p77.trustFundBalance * rate);
  const unlockAge = S.p77.trustFundUnlockAge || 21;
  const locked = S.age < unlockAge;

  let html = '<section class="card" style="border-color:var(--amber)"><h3>🏦 Family Trust Fund</h3>' +
    '<div class="row"><span>Balance</span><b class="mono" style="color:var(--mint)">E£' + balanceEGP.toLocaleString() + '</b></div>' +
    '<div class="row"><span>Unlocks at age</span><b>' + unlockAge + '</b></div>';
  if (locked) {
    html += '<p class="muted" style="font-size:.82rem;margin-top:8px">The trust fund is managed by your family until age ' + unlockAge + '. It earns 12% APY.</p>';
  } else {
    html += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p77WithdrawTrustFund()">' +
      'Withdraw entire balance' +
      '<small>Transfer E£' + balanceEGP.toLocaleString() + ' to your checking account</small>' +
      '</button>';
  }
  html += '</section>';
  return html;
}

function p77WithdrawTrustFund() {
  if (!S || !S.p77) return;
  if (S.age < S.p77.trustFundUnlockAge) return hint('Trust fund is locked until age ' + S.p77.trustFundUnlockAge + '.');
  if (!confirm('Withdraw entire trust fund? This ends the annual interest. You cannot put it back.')) return;
  S.wealth += S.p77.trustFundBalance;
  log('💎 Withdrew E£' + Math.round(S.p77.trustFundBalance * p77Rate()).toLocaleString() + ' from the family trust fund.');
  S.p77.trustFundBalance = 0;
  hint(); render();
}
window.p77WithdrawTrustFund = p77WithdrawTrustFund;

/* =================================================================
   PART 7 — EXTENDED FAMILY
   ================================================================= */
function p77ExtendedFamilyCard() {
  if (!S || !S.p77 || !Array.isArray(S.p77.extendedFamily) || !S.p77.extendedFamily.length) return '';
  let html = '<section class="card" style="border-color:var(--cyan)"><h3>👨‍👩‍👧‍👦 Extended family</h3>' +
    '<p class="muted" style="font-size:.82rem">Uncles, aunts, cousins, and grandparents. Their tier and connections matter for job offers, marriage prospects, and inheritance.</p>';

  S.p77.extendedFamily.forEach(function (ext) {
    if (!ext.alive) return;
    const bondColor = ext.bond >= 70 ? 'var(--mint)' : ext.bond >= 40 ? 'var(--cyan)' : 'var(--amber)';
    html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div><b>' + ext.name + '</b> <span class="muted" style="font-size:.78rem">· ' + ext.role + ', ' + ext.age + '</span></div>' +
      '<span style="color:' + bondColor + ';font-size:.78rem">Bond ' + ext.bond + '%</span>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:4px">' + (ext.notes || '') + '</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px">' +
      '<button class="btn" style="margin:0;padding:6px;font-size:.75rem" onclick="p77VisitExtended(\'' + ext.id + '\')">Visit</button>' +
      '<button class="btn" style="margin:0;padding:6px;font-size:.75rem" onclick="p77AskExtendedFavor(\'' + ext.id + '\')">Ask favor</button>' +
      '</div></div>';
  });

  html += '</section>';
  return html;
}

function p77VisitExtended(id) {
  const ext = (S.p77.extendedFamily || []).find(function (e) { return e.id === id; });
  if (!ext) return;
  ext.bond = Math.min(100, ext.bond + 6);
  fx({ social: 2, happiness: 2 });
  log('You visited your ' + ext.role.toLowerCase() + ' ' + ext.name + '. The bond improved.');
  hint(); render();
}
window.p77VisitExtended = p77VisitExtended;

function p77AskExtendedFavor(id) {
  const ext = (S.p77.extendedFamily || []).find(function (e) { return e.id === id; });
  if (!ext) return;
  if (ext.bond < 40) return hint('Your bond is too low. Visit more first.');
  const rate = p77Rate();
  /* Rich uncles/aunts can lend money */
  if (ext.tier >= 4) {
    const amt = Math.round((20000 + Math.random() * 80000) * p77Idx());
    if (Math.random() < 0.55) {
      S.wealth += amt / rate;
      log('💵 Your ' + ext.role.toLowerCase() + ' ' + ext.name + ' lent you E£' + amt.toLocaleString() + '.');
    } else {
      log('Your ' + ext.role.toLowerCase() + ' ' + ext.name + ' politely declined.');
    }
  } else {
    log('Your ' + ext.role.toLowerCase() + ' cannot help much financially.');
  }
  hint(); render();
}
window.p77AskExtendedFavor = p77AskExtendedFavor;

/* =================================================================
   PART 8 — CHILDHOOD PRIVILEGES
   ================================================================= */
function p77ApplyChildhoodPrivileges() {
  if (!S || !S.p76 || S.age > 18) return;
  p77Init(S);
  const level = Number(S.p76.wealthLevel) || 2;

  /* Private tutors for wealthy families */
  if (level >= 4 && S.age >= 6 && S.age <= 17) {
    if (S.p77.childhoodPrivileges.indexOf('tutors_' + S.age) === -1) {
      S.p77.childhoodPrivileges.push('tutors_' + S.age);
      fx({ smarts: 3, happiness: 2 });
      log('🎓 Private tutors and enrichment lessons at home.');
    }
  }

  /* International school opportunities */
  if (level >= 3 && S.age >= 6 && S.age <= 17) {
    if (S.p77.childhoodPrivileges.indexOf('intl_school_' + S.age) === -1) {
      S.p77.childhoodPrivileges.push('intl_school_' + S.age);
      fx({ smarts: 2, social: 3 });
      log('🌍 Access to international school events and networks.');
    }
  }

  /* Summer abroad for rich kids */
  if (level >= 4 && S.age >= 10 && S.age <= 17) {
    if (Math.random() < 0.5) {
      S.p77.childhoodPrivileges.push('summer_abroad_' + S.age);
      fx({ smarts: 2, social: 3, happiness: 4 });
      log('✈️ Summer abroad with family — exposure to international culture.');
    }
  }

  /* Riding lessons, music lessons, private sports for wealthy */
  if (level === 5 && S.age >= 6 && S.age <= 17) {
    if (S.p77.childhoodPrivileges.indexOf('elite_hobbies_' + S.age) === -1) {
      S.p77.childhoodPrivileges.push('elite_hobbies_' + S.age);
      fx({ smarts: 1, social: 4, health: 2, happiness: 3 });
      log('🏇 Elite hobbies: riding, tennis, piano — building social capital.');
    }
  }
}

/* =================================================================
   PART 9 — YEARLY TICK
   ================================================================= */
function p77Year() {
  if (!S || !S.p77) return;
  p77Init(S);
  const rate = p77Rate();
  const level = Number(S.p76 && S.p76.wealthLevel) || 2;

  /* Trust fund interest */
  if (S.p77.trustFundBalance > 0 && S.age < (S.p77.trustFundUnlockAge || 21)) {
    const interest = S.p77.trustFundBalance * 0.12;
    S.p77.trustFundBalance += interest;
    log('💎 Trust fund earned E£' + Math.round(interest * rate).toLocaleString() + ' this year (12% APY).');
  }

  /* Family business revenue */
  if (S.p77.familyBusinessRevenue > 0 && S.p76.familyBusiness) {
    /* Revenue grows naturally */
    const growthRate = S.p77.familyBusinessManaged ? 0.20 + Math.random() * 0.15 : 0.05 + Math.random() * 0.08;
    S.p77.familyBusinessRevenue *= (1 + growthRate);

    /* If player works for family, no dividend this year (salary only) */
    if (S.age >= 21 && !S.p77.worksForFamily) {
      const dividendPct = S.p77.familyBusinessManaged ? 0.18 : 0.10;
      const dividend = S.p77.familyBusinessRevenue * dividendPct / Math.max(1, 1 + (S.family || []).filter(function (m) { return m && m.role === 'Sibling'; }).length);
      S.wealth += dividend;
      S.income = (S.income || 0) + dividend;
      log('📈 Family business dividend: E£' + Math.round(dividend * rate).toLocaleString() + '.');
    }
  }

  /* Land holdings appreciate */
  S.p77.landHoldings.forEach(function (land) {
    if (!land) return;
    land.valueInternal = (Number(land.valueInternal) || 0) * (1 + 0.05 + Math.random() * 0.05);
  });

  /* Extended family ages */
  S.p77.extendedFamily.forEach(function (ext) {
    if (!ext || !ext.alive) return;
    ext.age = (ext.age || 0) + 1;
    ext.bond = Math.max(0, (ext.bond || 0) - 3);
    /* Older relatives may pass away */
    if (ext.age >= 75 && Math.random() < 0.10) {
      ext.alive = false;
      log('🕊️ Your ' + ext.role.toLowerCase() + ' ' + ext.name + ' passed away.');
    } else if (ext.age >= 85 && Math.random() < 0.20) {
      ext.alive = false;
      log('🕊️ Your ' + ext.role.toLowerCase() + ' ' + ext.name + ' passed away.');
    }
  });

  /* Childhood privileges for the current age */
  p77ApplyChildhoodPrivileges();
}

const P77_ageUpBeforeYear = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  P77_ageUpBeforeYear.apply(this, arguments);
  if (S && S.age !== ageBefore) {
    try { p77Year(); } catch (e) { console.error('p77 year failed:', e); }
  }
};

/* =================================================================
   PART 10 — ELITE CONNECTIONS FOR JOB HUNTING
   ================================================================= */
const P77_p12EligibilityBefore = (typeof p12Eligibility === 'function') ? p12Eligibility : null;
if (P77_p12EligibilityBefore) {
  p12Eligibility = function (post) {
    if (!S || !S.p77) return P77_p12EligibilityBefore.apply(this, arguments);
    /* Elite family opens otherwise-blocked doors */
    if (S.p77.eliteNetwork && post) {
      const smartsReq = post.smarts || 0;
      const engReq = post.eng || 0;
      /* Reduce requirement by 10% for elite families */
      if ((S.smarts || 0) < smartsReq && (S.smarts || 0) >= smartsReq * 0.9) {
        return '';   /* qualified via connections */
      }
      if ((S.eng || 0) < engReq && (S.eng || 0) >= engReq * 0.9) {
        return '';
      }
    }
    return P77_p12EligibilityBefore.apply(this, arguments);
  };
}

/* =================================================================
   PART 11 — MARRIAGE EXPECTATIONS BY CLASS
   ================================================================= */
function p77MarriageExpectationCard() {
  if (!S || !S.p76 || S.age < 16) return '';
  const level = Number(S.p76.wealthLevel) || 2;
  const traits = S.p76.parentsTraits || {};
  const traditional = traits.traditional || 5;

  if (traditional < 7) return '';

  /* Traditional family expectations */
  const expectedDowry = level >= 4 ? 500000 : level >= 2 ? 100000 : 30000;
  const expectedMahr = level >= 4 ? 200000 : level >= 2 ? 50000 : 15000;

  return '<section class="card" style="border-color:var(--violet)"><h3>💍 Marriage expectations</h3>' +
    '<p class="muted" style="font-size:.82rem">Your family follows traditional Egyptian customs. Wedding costs, dowry (Mahr), and family negotiations matter.</p>' +
    '<div class="row"><span>Expected Mahr (dowry)</span><b class="mono">E£' + Math.round(expectedMahr * p77Idx()).toLocaleString() + '</b></div>' +
    '<div class="row"><span>Expected wedding scale</span><b>' + (level >= 4 ? 'Large (300+ guests)' : level >= 2 ? 'Medium (150 guests)' : 'Modest (50 guests)') + '</b></div>' +
    '<p class="muted" style="font-size:.78rem;margin-top:6px">Traditional families expect proper ceremony, family involvement, and appropriate Mahr.</p>' +
    '</section>';
}

/* =================================================================
   PART 12 — PRESTIGE SYSTEM
   ================================================================= */
function p77PrestigeCard() {
  if (!S || !S.p77) return '';
  p77Init(S);
  const prestige = S.p77.prestigePoints || 0;
  const level = Number(S.p76 && S.p76.wealthLevel) || 2;
  const basePrestige = [10, 20, 40, 60, 80, 100][level] || 40;
  const totalPrestige = basePrestige + prestige;

  const rank = totalPrestige >= 150 ? 'Legendary' :
               totalPrestige >= 120 ? 'Elite' :
               totalPrestige >= 90 ? 'High Society' :
               totalPrestige >= 60 ? 'Upper class' :
               totalPrestige >= 40 ? 'Middle class' :
               'Working class';

  const color = totalPrestige >= 120 ? 'var(--amber)' :
                totalPrestige >= 90 ? 'var(--violet)' :
                totalPrestige >= 60 ? 'var(--cyan)' : 'var(--muted)';

  return '<section class="card"><h3>⭐ Social Standing</h3>' +
    '<div class="row"><span>Rank</span><b style="color:' + color + '">' + rank + '</b></div>' +
    '<div class="row"><span>Prestige</span><b class="mono">' + totalPrestige + '</b></div>' +
    '<p class="muted" style="font-size:.78rem;margin-top:6px">Prestige comes from education, career, marriage, and family name. Higher prestige opens elite social circles.</p>' +
    '</section>';
}

/* =================================================================
   PART 13 — LIFE TAB INTEGRATION
   ================================================================= */
const P77_viewLifeBefore = viewLife;
viewLife = function () {
  let html = P77_viewLifeBefore.apply(this, arguments);
  if (!S || !S.p76 || !S.p76.setupDone) return html;

  /* Insert business card */
  if (S.p76.familyBusiness && S.age >= 16) {
    html += p77FamilyBusinessCard();
  }

  /* Household staff */
  if (S.p77 && S.p77.householdStaff && S.p77.householdStaff.length) {
    html += p77HouseholdStaffCard();
  }

  /* Trust fund */
  if (S.p77 && S.p77.trustFundBalance > 0) {
    html += p77TrustFundCard();
  }

  /* Extended family */
  if (S.p77 && S.p77.extendedFamily && S.p77.extendedFamily.length) {
    html += p77ExtendedFamilyCard();
  }

  /* Prestige */
  html += p77PrestigeCard();

  /* Marriage expectations */
  html += p77MarriageExpectationCard();

  return html;
};

/* =================================================================
   PART 14 — BUSINESS YEARLY WITH MANAGEMENT
   ================================================================= */
/* Management gets periodic investment opportunities */
function p77BusinessOpportunity() {
  if (!S || !S.p77 || !S.p77.familyBusinessManaged) return;
  if (Math.random() > 0.25) return;
  const rate = p77Rate();
  const costEGP = Math.round(S.p77.familyBusinessRevenue * rate * 0.15);
  const internal = costEGP / rate;
  if (S.wealth < internal) return;

  if (!confirm('Business opportunity:\n\n' +
    'Expanding ' + S.p76.familyBusiness + ' would cost E£' + costEGP.toLocaleString() + '.\n\n' +
    'Expected outcome: 60% revenue increase within 2 years, or 30% chance of loss.')) return;

  S.wealth -= internal;
  if (Math.random() < 0.6) {
    S.p77.familyBusinessRevenue *= 1.6;
    log('📈 Family business expanded successfully. Revenue up 60%.');
  } else {
    log('📉 Business expansion failed. Investment lost.');
  }
  hint(); render();
}
const P77_ageUpBeforeOpportunity = ageUp;
ageUp = function () {
  const r = P77_ageUpBeforeOpportunity.apply(this, arguments);
  try { p77BusinessOpportunity(); } catch (e) {}
  return r;
};

/* =================================================================
   PART 15 — INHERITANCE UPGRADE (business + land + trust fund)
   ================================================================= */
const P77_p60HandleDeathBefore = (typeof p60HandleParentDeath === 'function') ? p60HandleParentDeath : null;
if (P77_p60HandleDeathBefore) {
  p60HandleParentDeath = function (parent, cause) {
    const wasLastParent = (S.family || []).filter(function (m) {
      return m && m.alive !== false && m !== parent && (m.role === 'Mother' || m.role === 'Father');
    }).length === 0;

    const result = P77_p60HandleDeathBefore.apply(this, arguments);

    if (wasLastParent && S.p77) {
      const rate = p77Rate();
      /* Business inheritance */
      if (S.p76 && S.p76.familyBusiness) {
        const siblingCount = (S.family || []).filter(function (m) { return m && m.role === 'Sibling' && m.alive !== false; }).length;
        const myShare = 1 / (1 + siblingCount);
        const bizValueEGP = Math.round(S.p77.familyBusinessRevenue * rate * 3.5);
        const myValueEGP = Math.round(bizValueEGP * myShare);
        S.wealth += myValueEGP / rate;
        log('💼 Inherited ' + Math.round(myShare * 100) + '% of ' + S.p76.familyBusiness + ': E£' + myValueEGP.toLocaleString() + '.');
        if (myShare >= 0.5) {
          S.p77.familyBusinessManaged = true;
        }
      }
      /* Land inheritance */
      let landTotal = 0;
      S.p77.landHoldings.forEach(function (land) {
        if (!land) return;
        landTotal += land.valueInternal || 0;
      });
      if (landTotal > 0) {
        const siblingCount = (S.family || []).filter(function (m) { return m && m.role === 'Sibling' && m.alive !== false; }).length;
        const myShare = 1 / (1 + siblingCount);
        const landValue = landTotal * myShare;
        S.wealth += landValue;
        log('🏞️ Inherited land worth E£' + Math.round(landValue * rate).toLocaleString() + '.');
      }
      /* Trust fund unlock */
      if (S.p77.trustFundBalance > 0) {
        S.p77.trustFundUnlockAge = 0;   /* unlock immediately after inheritance */
        log('💎 Trust fund unlocked. Balance: E£' + Math.round(S.p77.trustFundBalance * rate).toLocaleString() + '.');
      }
    }
    return result;
  };
}

/* =================================================================
   PART 16 — STARTUP DEPENDENCIES
   ================================================================= */
setTimeout(function () {
  if (S && S.p76 && S.p76.setupDone && !S.p77.dynasty.familyName) {
    S.p77.dynasty.familyName = (S.name || 'Al') + ' family';
    save();
  }
}, 1000);

/* =================================================================
   PART 17 — INIT
   ================================================================= */
p77Init(S);
console.log('[p77] Dynasty, family business, social class loaded');
