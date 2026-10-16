/* =====================================================================
   78. FIXES + EXTENSIONS
   - Move extended family → Relationships tab
   - Move household staff → Real Estate tab
   - Move trust fund → Bank tab (with monthly interest)
   - Fix pocket money scaling by age
   - Fix English starting level for rich families
   - Rich families use IGCSE/IB/American Diploma (not Thanaweya)
   - Tansik eligibility from Egyptian education systems
   - Family business: age-gate work, add to Career tab
   - Fix "What to do next" order (track before score)
   - Fix study abroad timing based on pacing
   - Fix syntax error in university application (index-based)
   - Fix Real Estate parents' home display bug
   - Bigger trust fund for ultra-wealthy
   Load AFTER 77-dynasty-class-system.js and BEFORE 99-boot.js
   ===================================================================== */

function p78Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p78Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p78EGP(egp) { return Math.round(egp * p78Idx()); }

/* =================================================================
   1. STATE
   ================================================================= */
function p78Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p78) o.p78 = {};
  const d = o.p78;
  if (typeof d.trustFundWithdrawn !== 'boolean') d.trustFundWithdrawn = false;
  if (typeof d.lastTrustInterestAbsMonth !== 'number') d.lastTrustInterestAbsMonth = -1;
  if (!d.educationSystem) d.educationSystem = null;   /* 'thanaweya' | 'igcse' | 'american' | 'ib' */
  if (typeof d.systemChosen !== 'boolean') d.systemChosen = false;
}
const P78_migrate = migrate;
migrate = function (o) { const r = P78_migrate(o); p78Init(r); return r; };
const P78_newGame = newGame;
newGame = function () {
  P78_newGame.apply(this, arguments);
  p78Init(S);
  p78AssignEducationSystem();
  p78FixStartingEnglish();
  p78FixTrustFundSize();
  p78FixPocketMoney();
};

/* =================================================================
   2. EDUCATION SYSTEM FOR RICH FAMILIES
   ================================================================= */
function p78AssignEducationSystem() {
  if (!S || !S.p76) return;
  p78Init(S);
  const level = Number(S.p76.wealthLevel) || 2;
  /* Ultra + Wealthy → IGCSE, American, or IB (player chooses at age 12) */
  if (level >= 4) {
    S.p78.educationSystem = null;   /* player will choose */
    S.p78.systemChosen = false;
  } else if (level === 3) {
    /* Upper-middle: may choose IGCSE or Thanaweya */
    S.p78.educationSystem = Math.random() < 0.5 ? 'igcse' : 'thanaweya';
    S.p78.systemChosen = true;
  } else {
    S.p78.educationSystem = 'thanaweya';
    S.p78.systemChosen = true;
  }
}

function p78EducationSystemLabel(code) {
  return {
    'thanaweya': 'Thanaweya Amma (National)',
    'igcse': 'IGCSE / A-Levels (British)',
    'american': 'American Diploma (EST + SAT)',
    'ib': 'International Baccalaureate (IB)'
  }[code] || 'Not chosen';
}

function p78ChooseEducationSystem(code) {
  p78Init(S);
  if (S.age < 11 || S.age > 14) return hint('Choose your school system at ages 11-14.');
  if (S.p78.systemChosen) return hint('You already chose your education system.');
  S.p78.educationSystem = code;
  S.p78.systemChosen = true;
  log('🎓 You enrolled in ' + p78EducationSystemLabel(code) + ' at age ' + S.age + '.');
  realismNotice('Education system', 'You are following ' + p78EducationSystemLabel(code) + '. This determines how you apply to university.');
  hint(); render();
}
window.p78ChooseEducationSystem = p78ChooseEducationSystem;

/* =================================================================
   3. FIX STARTING ENGLISH FOR RICH FAMILIES
   ================================================================= */
function p78FixStartingEnglish() {
  if (!S || !S.p76) return;
  const level = Number(S.p76.wealthLevel) || 2;
  /* Base English by tier + education system */
  const tierEnglish = [15, 25, 45, 60, 75, 88][level] || 40;
  const systemBonus = S.p78 && S.p78.educationSystem === 'igcse' ? 8
    : S.p78 && S.p78.educationSystem === 'american' ? 10
    : S.p78 && S.p78.educationSystem === 'ib' ? 12 : 0;
  S.eng = Math.max(Number(S.eng) || 0, tierEnglish + systemBonus);
}

/* Also fix English growth — rich kids learn faster */
const P78_ageUpBeforeEng = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  const r = P78_ageUpBeforeEng.apply(this, arguments);
  if (!S || S.age === ageBefore) return r;
  /* Extra English growth for international education */
  if (S.p78 && ['igcse', 'american', 'ib'].indexOf(S.p78.educationSystem) !== -1 && S.age < 18) {
    fx({ eng: 3 });
  }
  return r;
};

/* =================================================================
   4. FIX POCKET MONEY BY AGE
   ================================================================= */
function p78FixPocketMoney() {
  if (!S || !S.p76) return;
  /* Adjust pocket money base by age of child */
  /* Handled in familyYear wrapper below */
}

/* Override the p76 familyYear pocket money calc */
const P78_familyYearBeforePocket = familyYear;
familyYear = function () {
  const r = P78_familyYearBeforePocket.apply(this, arguments);
  if (!S || !S.p76) return r;
  const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
  if (tier.pocketMoneyBase <= 0) return r;
  if (S.age < 8 || S.age >= 18) return r;

  /* Age-scaled pocket money: children get much less than the adult figure */
  const ageFactor = S.age <= 10 ? 0.05 : S.age <= 13 ? 0.15 : S.age <= 15 ? 0.30 : 0.50;
  const monthly = Math.round(tier.pocketMoneyBase * ageFactor);
  const yearly = monthly * 12;
  /* Remove the previous flawed amount from wealth, replace with correct */
  const oldAmount = tier.pocketMoneyBase * 12 * p78Idx() / p78Rate();   /* what p76 gave */
  const correct = yearly * p78Idx() / p78Rate();
  const delta = correct - oldAmount;
  S.wealth += delta;
  S.income = (S.income || 0) + delta;
  if (delta !== 0) {
    /* silent correction — the previous log already said the number */
  }
  return r;
};

/* =================================================================
   5. FIX TRUST FUND SIZE AND LOCATION
   ================================================================= */
function p78FixTrustFundSize() {
  if (!S || !S.p77) return;
  const level = Number(S.p76 && S.p76.wealthLevel) || 2;
  /* Trust fund should scale with family wealth properly */
  const trustFundEGP = [
    0,              /* poor */
    0,              /* lower-mid */
    0,              /* middle */
    150000,         /* upper-mid */
    2500000,        /* wealthy */
    30000000        /* ultra */
  ][level] || 0;
  if (trustFundEGP > 0 && S.p77.trustFundBalance < trustFundEGP / p78Rate() * 0.5) {
    S.p77.trustFundBalance = trustFundEGP * p78Idx() / p78Rate();
    log('💎 Family trust fund established: E£' + trustFundEGP.toLocaleString() + ' (managed until age ' + (S.p77.trustFundUnlockAge || 21) + ').');
  }
}

/* Monthly trust fund interest in monthly pacing */
const P78_p52TickBeforeTrust = p52MonthlyTick;
p52MonthlyTick = function () {
  P78_p52TickBeforeTrust.apply(this, arguments);
  if (!S || !S.p77) return;
  if (S.p77.trustFundBalance <= 0) return;
  if (S.age >= (S.p77.trustFundUnlockAge || 21)) return;   /* unlocked, no more interest */

  const absMonth = Number(S.pacingAbsoluteMonth) || 0;
  if (S.p78.lastTrustInterestAbsMonth === absMonth) return;
  S.p78.lastTrustInterestAbsMonth = absMonth;

  const monthlyRate = 0.12 / 12;
  const interest = S.p77.trustFundBalance * monthlyRate;
  S.p77.trustFundBalance += interest;
}

/* Yearly interest for yearly pacing */
const P78_ageUpBeforeTrust = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  const r = P78_ageUpBeforeTrust.apply(this, arguments);
  if (!S || S.age === ageBefore) return r;
  if (S.pacing === 'yearly' && S.p77 && S.p77.trustFundBalance > 0 && S.age < (S.p77.trustFundUnlockAge || 21)) {
    const interest = S.p77.trustFundBalance * 0.12;
    S.p77.trustFundBalance += interest;
    log('💎 Trust fund interest this year: +E£' + Math.round(interest * p78Rate()).toLocaleString() + '.');
  }
  return r;
};

/* =================================================================
   6. MOVE CARDS TO CORRECT TABS
   ================================================================= */
/* Extended family → Relationships */
/* Household staff → Real Estate */
/* Trust fund → Bank */
/* Family business → Career (and keep Life for the childhood view) */

/* Remove them from Life tab (P77 added them there) */
const P78_viewLifeBeforeMove = viewLife;
viewLife = function () {
  let html = P78_viewLifeBeforeMove.apply(this, arguments);
  if (!S) return html;

  /* Remove extended family card from Life */
  html = html.replace(/<section class="card"[^>]*>\s*<h3>👨‍👩‍👧‍👦 Extended family<\/h3>[\s\S]*?<\/section>/g, '');
  /* Remove household staff card from Life */
  html = html.replace(/<section class="card"[^>]*>\s*<h3>👥 Household staff<\/h3>[\s\S]*?<\/section>/g, '');
  /* Remove trust fund card from Life */
  html = html.replace(/<section class="card"[^>]*>\s*<h3>🏦 Family Trust Fund<\/h3>[\s\S]*?<\/section>/g, '');
  /* Remove family business card from Life (only keep during childhood <18) */
  if (S.age >= 18) {
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💼 [^<]*<\/h3>[\s\S]*?Family owns and operates this business[\s\S]*?<\/section>/g, '');
  }
  /* Remove marriage expectations card from Life (belongs in Love tab) */
  html = html.replace(/<section class="card"[^>]*>\s*<h3>💍 Marriage expectations<\/h3>[\s\S]*?<\/section>/g, '');
  /* Remove prestige from Life (belongs in Relationships) */
  html = html.replace(/<section class="card"[^>]*>\s*<h3>⭐ Social Standing<\/h3>[\s\S]*?<\/section>/g, '');

  return html;
};

/* Add to Relationships tab */
const P78_viewFamilyBeforeAdd = viewFamily;
viewFamily = function () {
  let html = P78_viewFamilyBeforeAdd.apply(this, arguments);
  if (!S || !S.p77) return html;

  /* Extended family */
  if (typeof p77ExtendedFamilyCard === 'function') {
    html += p77ExtendedFamilyCard();
  }
  /* Prestige */
  if (typeof p77PrestigeCard === 'function') {
    html += p77PrestigeCard();
  }
  /* Marriage expectations */
  if (typeof p77MarriageExpectationCard === 'function') {
    html += p77MarriageExpectationCard();
  }
  return html;
};

/* Add to Real Estate tab */
const P78_viewAssetsBeforeAdd = viewAssets;
viewAssets = function () {
  let html = P78_viewAssetsBeforeAdd.apply(this, arguments);
  if (!S) return html;

  /* Household staff */
  if (typeof p77HouseholdStaffCard === 'function') {
    const staff = p77HouseholdStaffCard();
    if (staff) html += staff;
  }

  /* Fix: if player lives with parents but no home info, generate it */
  if (S.housing === 'parents' && (!S.p60 || !S.p60.parentsHome)) {
    if (typeof p60GenerateParentsHome === 'function') {
      try { p60GenerateParentsHome(); } catch (e) {}
    }
  }
  /* Force parents home panel to appear */
  if (S.housing === 'parents' && typeof p60ParentsHomePanel === 'function') {
    const panel = p60ParentsHomePanel();
    if (panel && html.indexOf('Your parents&#39; home') === -1 && html.indexOf("Your parents' home") === -1) {
      html = panel + html;
    }
  }
  return html;
};

/* Add to Bank tab */
const P78_viewBankBeforeAdd = viewBank;
viewBank = function () {
  let html = P78_viewBankBeforeAdd.apply(this, arguments);
  if (!S || !S.p77) return html;

  /* Trust fund with rich options */
  if (S.p77.trustFundBalance > 0 && !S.p78.trustFundWithdrawn) {
    const rate = p78Rate();
    const balanceEGP = Math.round(S.p77.trustFundBalance * rate);
    const unlockAge = S.p77.trustFundUnlockAge || 21;
    const locked = S.age < unlockAge;
    const monthlyInterestEGP = Math.round(S.p77.trustFundBalance * (0.12 / 12) * rate);

    let card = '<section class="card" style="border-color:var(--amber)"><h3>🏦 Family Trust Fund</h3>' +
      '<p class="muted" style="font-size:.82rem">A trust fund established by your family. Earns 12% APY (1% monthly). Unlocks at age ' + unlockAge + '.</p>' +
      '<div class="row"><span>Balance</span><b class="mono" style="color:var(--mint)">E£' + balanceEGP.toLocaleString() + '</b></div>' +
      '<div class="row"><span>Monthly interest</span><b class="mono">+E£' + monthlyInterestEGP.toLocaleString() + '</b></div>' +
      '<div class="row"><span>Status</span><b>' + (locked ? 'Locked until age ' + unlockAge : 'Unlocked') + '</b></div>';

    if (!locked) {
      card += '<div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
        '<button class="btn" style="margin:0;background:var(--mint);color:#000;font-weight:700" onclick="p78WithdrawTrustFund()">' +
        'Withdraw all' +
        '<small>E£' + balanceEGP.toLocaleString() + ' → checking</small>' +
        '</button>' +
        '<button class="btn" style="margin:0" onclick="p78KeepTrustFund()">' +
        'Keep in fund' +
        '<small>12% APY continues</small>' +
        '</button>' +
        '</div>';
    } else {
      card += '<p class="muted" style="font-size:.78rem;margin-top:8px">Automatically unlocks at age ' + unlockAge + '. Until then, the balance compounds monthly.</p>';
    }
    card += '</section>';
    html += card;
  }

  return html;
};

/* Add to Career tab */
const P78_viewCareerBeforeAdd = viewCareer;
viewCareer = function () {
  let html = P78_viewCareerBeforeAdd.apply(this, arguments);
  if (!S || S.age < 18) return html;
  if (S.p76 && S.p76.familyBusiness && typeof p77FamilyBusinessCard === 'function') {
    html += p77FamilyBusinessCard();
  }
  return html;
};

/* =================================================================
   7. TRUST FUND ACTIONS
   ================================================================= */
function p78WithdrawTrustFund() {
  if (!S || !S.p77) return;
  if (S.age < (S.p77.trustFundUnlockAge || 21)) return hint('Locked until age ' + S.p77.trustFundUnlockAge + '.');
  if (!confirm('Withdraw entire trust fund?\n\nBalance: E£' + Math.round(S.p77.trustFundBalance * p78Rate()).toLocaleString() + '\n\nOnce withdrawn you lose the 12% APY.')) return;
  S.wealth += S.p77.trustFundBalance;
  log('💎 Withdrew E£' + Math.round(S.p77.trustFundBalance * p78Rate()).toLocaleString() + ' from the family trust fund.');
  S.p77.trustFundBalance = 0;
  S.p78.trustFundWithdrawn = true;
  hint(); render();
}
window.p78WithdrawTrustFund = p78WithdrawTrustFund;

function p78KeepTrustFund() {
  log('💼 You chose to keep the trust fund invested. It continues to earn 12% APY.');
  hint(); render();
}
window.p78KeepTrustFund = p78KeepTrustFund;

/* =================================================================
   8. FIX FAMILY BUSINESS AGE GATING
   ================================================================= */
/* Override p77WorkForFamily to properly age-gate */
const P78_p77WorkBefore = p77WorkForFamily;
p77WorkForFamily = function () {
  if (!S) return;
  if (S.age < 18) return hint('You must be 18+ to work at the family business.');
  if (!S.degree && !S.diploma) return hint('You need at least a high school diploma.');
  return P78_p77WorkBefore.apply(this, arguments);
};

/* Override p77FamilyBusinessCard to age-gate the work button */
const P78_p77BizBefore = p77FamilyBusinessCard;
p77FamilyBusinessCard = function () {
  let html = P78_p77BizBefore.apply(this, arguments);
  if (!S || S.age < 18) {
    /* Hide work/manage buttons for minors */
    html = html.replace(/<button[^>]*onclick="p77WorkForFamily\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
    html = html.replace(/<button[^>]*onclick="p77ManageFamilyBusiness\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
    html = html.replace(/<button[^>]*onclick="p77InheritBusiness\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
  }
  return html;
};

/* =================================================================
   9. FIX THANAWEYA FLOW — track before score
   ================================================================= */
/* Override p69ComputeAndShowResult to require track first */
const P78_p69ComputeBefore = p69ComputeAndShowResult;
p69ComputeAndShowResult = function () {
  if (!S) return;
  if (!S.p68 || !S.p68.thanaweyaTrack) {
    return hint('Choose your Thanaweya Amma track first (Adabi / Elmi Riyada / Elmi Olom).');
  }
  return P78_p69ComputeBefore.apply(this, arguments);
};

/* Hide "Get score" button if no track */
const P78_viewSchoolBeforeActions = viewSchool;
viewSchool = function () {
  let html = P78_viewSchoolBeforeActions.apply(this, arguments);
  if (!S) return html;
  /* If no track chosen and score not yet obtained, force track-first flow */
  if (S.country === 'egy' && S.age === 18 && (!S.p68 || !S.p68.thanaweyaTrack) && (!S.p69 || S.p69.thanaweya.score == null)) {
    /* Remove any "Get Thanaweya Amma score" button */
    html = html.replace(/<button[^>]*onclick="p69ComputeAndShowResult\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
  }
  return html;
};

/* =================================================================
   10. FIX "WHAT TO DO NEXT" ORDER
   ================================================================= */
const P78_viewSchoolBeforeNext = viewSchool;
viewSchool = function () {
  let html = P78_viewSchoolBeforeNext.apply(this, arguments);
  if (!S) return html;

  /* Remove the old "What to do next" card and rebuild it */
  html = html.replace(/<section class="card">\s*<h3>✅ What to do next<\/h3>[\s\S]*?<\/section>/g, '');

  if (S.age < 14) return html;

  const actions = [];

  if (S.age < 18) {
    if (S.age >= 11 && S.age <= 14 && !S.p78.systemChosen && S.p76 && S.p76.wealthLevel >= 3) {
      actions.push({ label: '📚 Choose school system (IGCSE / American / IB / Thanaweya)', action: 'activeTab=\'school\';render()' });
    }
    if (S.age >= 16 && S.country === 'egy' && S.p78.educationSystem === 'thanaweya' && (!S.p68 || !S.p68.thanaweyaTrack)) {
      actions.push({ label: '📝 Choose Thanaweya Amma track', action: 'activeTab=\'school\';render()' });
    }
    if (S.age === 18 && S.country === 'egy' && S.p78.educationSystem === 'thanaweya' && S.p68 && S.p68.thanaweyaTrack && (!S.p69 || S.p69.thanaweya.score == null)) {
      actions.push({ label: '📊 Get Thanaweya Amma score', action: 'p69ComputeAndShowResult();' });
    }
  } else if (S.age >= 18 && !S.uni && !S.degree && S.diploma) {
    if (S.country === 'egy' && S.p78.educationSystem === 'thanaweya' && S.p68 && S.p68.thanaweyaTrack && (!S.p69 || S.p69.thanaweya.score == null)) {
      actions.push({ label: '📊 Get Thanaweya Amma score', action: 'p69ComputeAndShowResult();' });
    } else if (S.country === 'egy' && S.p78.educationSystem === 'thanaweya' && S.p69 && S.p69.thanaweya.score != null) {
      actions.push({ label: '🎓 Apply to Egyptian universities (Tansik)', action: 'activeTab=\'school\';render()' });
    } else if (S.p78.educationSystem && ['igcse', 'american', 'ib'].indexOf(S.p78.educationSystem) !== -1) {
      actions.push({ label: '🌍 Apply to universities (international system)', action: 'activeTab=\'school\';render()' });
    } else {
      actions.push({ label: '🎓 Choose a university', action: 'activeTab=\'school\';render()' });
    }
  } else if (S.uni) {
    actions.push({ label: '📖 Adjust effort', action: 'activeTab=\'school\';render()' });
    if (S.p71 && !S.p71.studyGroupActive) {
      actions.push({ label: '👥 Join study group', action: 'p71JoinStudyGroup();' });
    }
  } else if (S.degree) {
    actions.push({ label: '💼 Find a job', action: 'activeTab=\'career\';render()' });
    actions.push({ label: '🎓 Consider master\'s', action: 'activeTab=\'school\';render()' });
  }

  if (!actions.length) return html;

  const card = '<section class="card"><h3>✅ What to do next</h3>' +
    actions.map(function (a) {
      return '<button class="btn" style="text-align:left" onclick="' + a.action + '">' + a.label + '</button>';
    }).join('') +
    '</section>';

  const statusEnd = html.indexOf('</section>');
  if (statusEnd !== -1) {
    return html.slice(0, statusEnd + 10) + card + html.slice(statusEnd + 10);
  }
  return card + html;
};

/* =================================================================
   11. FIX UNIVERSITY APPLICATION SYNTAX ERROR
   ================================================================= */
/* Problem: onclick="p69ApplyToUniversity('gbr','King's College London','bachelor','self')"
   The apostrophe in the name breaks the JS string.
   Fix: use array indexes instead of names. */

const P78_p69ApplyBeforeFix = p69ApplyToUniversity;
p69ApplyToUniversity = function (countryCode, uniNameOrIndex, level, fundingType) {
  /* Accept either name or index */
  let uniName = uniNameOrIndex;
  if (typeof uniNameOrIndex === 'number') {
    const unis = P69_UNIS[countryCode] || [];
    const u = unis[uniNameOrIndex];
    if (!u) return hint('University not found.');
    uniName = u.n;
  }
  return P78_p69ApplyBeforeFix.call(this, countryCode, uniName, level, fundingType);
};

/* Wrap p69AbroadPickerCard to render index-based buttons */
const P78_p69AbroadPickerBefore = p69AbroadPickerCard;
p69AbroadPickerCard = function (canBachelor, canMaster) {
  let html = P78_p69AbroadPickerBefore.apply(this, arguments);
  if (!html) return html;

  /* Replace any onclick with name-based args to index-based */
  /* Pattern: p69ApplyToUniversity('cc','University Name','level','funding') */
  html = html.replace(/p69ApplyToUniversity\('([a-z]+)','([^']+)','([a-z]+)','(self|scholarship|parents)'\)/g,
    function (match, cc, name, level, funding) {
      /* Find index of this uni in the country's list */
      const unis = P69_UNIS[cc] || [];
      const idx = unis.findIndex(function (u) { return u.n === name; });
      if (idx < 0) {
        /* Try with HTML-entity decoded apostrophe */
        const decoded = name.replace(/&#39;/g, "'").replace(/&amp;/g, '&');
        const idx2 = unis.findIndex(function (u) { return u.n === decoded; });
        if (idx2 >= 0) return "p69ApplyToUniversity('" + cc + "'," + idx2 + ",'" + level + "','" + funding + "')";
        return match;
      }
      return "p69ApplyToUniversity('" + cc + "'," + idx + ",'" + level + "','" + funding + "')";
    }
  );
  return html;
};

/* =================================================================
   12. FIX STUDY ABROAD TIMING BASED ON PACING
   ================================================================= */
/* In monthly pacing: decisions resolve in 3 months (was 2)
   In yearly pacing: decisions resolve in 1 year */
const P78_p69ApplyBeforeTiming = p69ApplyToUniversity;
p69ApplyToUniversity = function (countryCode, uniName, level, fundingType) {
  const r = P78_p69ApplyBeforeTiming.apply(this, arguments);
  /* Fix the ready month on the newly-created application */
  if (S && S.p69 && S.p69.applications && S.p69.applications.length) {
    const app = S.p69.applications[S.p69.applications.length - 1];
    if (app) {
      if (S.pacing === 'monthly') {
        app.readyMonth = (S.pacingAbsoluteMonth || 0) + 3;
      } else {
        app.readyMonth = (S.pacingAbsoluteMonth || 0) + 12;
      }
    }
  }
  return r;
};

/* =================================================================
   13. ADD EDUCATION SYSTEM SELECTOR UI
   ================================================================= */
const P78_viewSchoolBeforeEduSystem = viewSchool;
viewSchool = function () {
  let html = P78_viewSchoolBeforeEduSystem.apply(this, arguments);
  if (!S || !S.p76) return html;
  const level = Number(S.p76.wealthLevel) || 2;
  if (level < 3) return html;   /* only for upper-middle and above */
  if (S.p78.systemChosen) return html;
  if (S.age < 11 || S.age > 14) return html;

  const card = '<section class="card" style="border-color:var(--violet)"><h3>🎓 Choose your school system</h3>' +
    '<p class="muted" style="font-size:.82rem">Your family can afford international education. Choose which curriculum you follow until university. This affects how you apply to universities in Egypt and abroad.</p>' +
    '<button class="btn" onclick="p78ChooseEducationSystem(\'igcse\')">' +
    '🇬🇧 IGCSE / A-Levels (British)' +
    '<small>Direct entry to UK universities. Accepted by AUC, GUC, BUE in Egypt.</small>' +
    '</button>' +
    '<button class="btn" onclick="p78ChooseEducationSystem(\'american\')">' +
    '🇺🇸 American Diploma (EST + SAT)' +
    '<small>For US universities and American-style universities in Egypt (AUC).</small>' +
    '</button>' +
    '<button class="btn" onclick="p78ChooseEducationSystem(\'ib\')">' +
    '🌍 International Baccalaureate (IB)' +
    '<small>Widely accepted globally. Very demanding curriculum.</small>' +
    '</button>' +
    '<button class="btn" onclick="p78ChooseEducationSystem(\'thanaweya\')">' +
    '🇪🇬 Thanaweya Amma (National)' +
    '<small>Egyptian public university route. Free / very cheap tuition.</small>' +
    '</button>' +
    '</section>';

  /* Insert at top */
  return card + html;
};

/* =================================================================
   14. HOOK: ENSURE PARENTS' HOME RENDERS IN REAL ESTATE
   ================================================================= */
function p78EnsureParentsHome() {
  if (!S) return false;
  if (S.housing !== 'parents') return false;
  if (S.p60 && S.p60.parentsHome) return false;
  if (typeof p60GenerateParentsHome !== 'function') return false;
  try {
    p60GenerateParentsHome();
    save();
    return true;
  } catch (e) {
    console.error('p78 parents home generation failed:', e);
    return false;
  }
}
setTimeout(p78EnsureParentsHome, 800);
setTimeout(p78EnsureParentsHome, 2500);

if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    if (S && S.housing === 'parents' && (!S.p60 || !S.p60.parentsHome)) {
      if (p78EnsureParentsHome()) render();
    }
  });
}

/* =================================================================
   15. INIT
   ================================================================= */
p78Init(S);
console.log('[p78] Fixes + extensions loaded');
