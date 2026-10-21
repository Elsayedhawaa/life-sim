/* ============================================================
   VIEW: CHILDREN (EXPANDED & ENHANCED)
   ============================================================
   Owns: S.pregnancy, S.childrenList (extended), S.children
   OVERRIDES: window.marTryForBaby → uses new pregnancy system
   Registers tab 'children' at order 10.

   CRITICAL: children appear in S.childrenList ONLY at birth.
   During pregnancy, child does NOT exist in any list.
   ============================================================ */

/* ---------- STATE ---------- */
function ensureChildrenState() {
  if (!S) return;
  if (!Array.isArray(S.childrenList)) S.childrenList = [];
  if (typeof S.children !== 'number') S.children = S.childrenList.length;

  /* Migrate legacy S.pregnantMonths → S.pregnancy */
  if (S.pregnantMonths && S.pregnantMonths > 0 && !S.pregnancy) {
    S.pregnancy = {
      active: true,
      startYear: gameYear(),
      monthsElapsed: 0,
      isIVF: false,
      motherIsPlayer: S.gender === 'f',
      fatherIsPlayer: S.gender === 'm',
      knownGender: null,
      plannedHospital: 'private',
      complications: [],
      planningChecklist: { clothes: false, clothesTier: null, nursery: false, nurseryTier: null, name: null },
      eventLog: []
    };
    S.pregnantMonths = 0;
  }
  if (typeof S.pregnancy === 'undefined') S.pregnancy = null;
  if (S.pregnancy && typeof S.pregnancy.monthsElapsed !== 'number') S.pregnancy.monthsElapsed = 0;

  /* Enrich existing children with new fields */
  S.childrenList.forEach(function(c) {
    if (!c.id) c.id = 'child_' + Math.random().toString(36).slice(2, 8);
    if (typeof c.birthYear === 'undefined') c.birthYear = gameYear() - (c.age || 0);
    if (typeof c.bond !== 'number') c.bond = 60;
    if (typeof c.happiness !== 'number') c.happiness = 70;
    if (typeof c.smarts !== 'number') c.smarts = 50;
    if (typeof c.health !== 'number') c.health = 100;
    if (typeof c.social !== 'number') c.social = 50;
    if (typeof c.lifestyle === 'undefined') c.lifestyle = 'standard';
    if (!Array.isArray(c.activities)) c.activities = [];
    if (!Array.isArray(c.milestones)) c.milestones = [];
    if (!Array.isArray(c.events)) c.events = [];
    if (!Array.isArray(c.traits)) c.traits = [];
    if (typeof c.collegeHelp === 'undefined') c.collegeHelp = null;
    if (typeof c.movedOut === 'boolean') {} else c.movedOut = false;
    if (!c.school) c.school = c.age >= 6 && c.age <= 18 ? 'Public School' : null;
  });

  if (!S.childrenTab) S.childrenTab = 'list';
}
GameHooks.on('newGame', ensureChildrenState);
GameHooks.on('migrate', ensureChildrenState);

/* ---------- HELPERS ---------- */
function chRate() { return C().rate || 1; }
function chEGP(n) { return Math.round((n || 0) * chRate()); }
function chNamePool(gender) {
  const pool = CHILDREN_BABY_NAMES[S.country] || CHILDREN_BABY_NAMES.egy;
  return gender === 'm' ? pool.m : pool.f;
}
function chBabyAgeCategory(age) {
  if (age <= 2) return 'infant';
  if (age <= 5) return 'toddler';
  if (age <= 12) return 'child';
  return 'teen';
}
function chBySchoolLabel(label) {
  return CHILDREN_SCHOOLS.find(function(s) { return s.label === label; });
}
function chBySchoolId(id) {
  return CHILDREN_SCHOOLS.find(function(s) { return s.id === id; });
}
function chChild(id) {
  return S.childrenList.find(function(c) { return c.id === id; });
}
function chSetTab(tab) { S.childrenTab = tab; render(); }
window.chSetTab = chSetTab;

/* ---------- TRY FOR BABY (OVERRIDES marriage version) ---------- */
function chTryForBaby() {
  ensureChildrenState();
  if (S.pregnancy && S.pregnancy.active) {
    log('Already expecting. Wait for the current pregnancy.');
    render(); return;
  }
  if (!S.marriage || !S.marriage.partner) {
    log('You need a partner to conceive (traditionally).');
    render(); return;
  }
  const ageToUse = S.gender === 'f' ? S.age : S.marriage.partner.age;
  let chance = 0.70;
  if (ageToUse > 30) chance = 0.50;
  if (ageToUse > 35) chance = 0.30;
  if (ageToUse > 40) chance = 0.10;
  if (ageToUse > 45) chance = 0.03;

  if (Math.random() < chance) {
    S.pregnancy = {
      active: true,
      startYear: gameYear(),
      monthsElapsed: 0,
      isIVF: false,
      motherIsPlayer: S.gender === 'f',
      fatherIsPlayer: S.gender === 'm',
      knownGender: null,
      plannedHospital: 'private',
      complications: [],
      planningChecklist: { clothes: false, clothesTier: null, nursery: false, nurseryTier: null, name: null },
      eventLog: []
    };
    S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + 10);
    log('🎉 You and ' + S.marriage.partner.name + ' are expecting! Pregnancy will complete in ~9 months.');
    fx({ happiness: 20 });
    /* Roll initial complications */
    CHILDREN_PREGNANCY_COMPLICATIONS.forEach(function(comp) {
      if (Math.random() < comp.chance) {
        S.pregnancy.complications.push(comp.id);
        S.pregnancy.eventLog.push({ year: gameYear(), event: 'Complication: ' + comp.desc, cost: comp.costEGP });
        log('⚠️ Pregnancy complication: ' + comp.desc);
        fx({ health: -comp.motherHealthHit });
        const cost = chEGP(comp.costEGP);
        if (S.wealth >= cost) S.wealth -= cost;
      }
    });
  } else {
    log('Not this month. Try again.');
    fx({ happiness: -2 });
  }
  render();
}
/* Override marriage's version */
window.marTryForBaby = chTryForBaby;

/* ---------- IVF CONCEPTION OPTION ---------- */
window.chStartIVF = function() {
  ensureChildrenState();
  if (S.pregnancy && S.pregnancy.active) {
    log('Already expecting. Wait for current pregnancy.');
    render(); return;
  }
  if (!S.marriage || !S.marriage.partner) {
    if (!confirm('You have no partner. Single-parent IVF is possible but harder.\n\nProceed?')) return;
  }
  const ivfCost = chEGP(120000);
  if (S.wealth < ivfCost) {
    log('Not enough cash for IVF treatment (' + money(ivfCost) + ').');
    render(); return;
  }
  S.wealth -= ivfCost;

  /* IVF success rate based on player/mother age */
  const ageToUse = S.gender === 'f' ? S.age : (S.marriage && S.marriage.partner ? S.marriage.partner.age : S.age);
  let successChance = 0.50;
  if (ageToUse > 35) successChance = 0.35;
  if (ageToUse > 40) successChance = 0.20;
  if (ageToUse > 45) successChance = 0.08;

  if (Math.random() > successChance) {
    log('😔 IVF cycle failed. Cost: ' + money(ivfCost) + '. You can try again.');
    fx({ happiness: -8 });
    render(); return;
  }

  S.pregnancy = {
    active: true,
    startYear: gameYear(),
    monthsElapsed: 0,
    isIVF: true,
    motherIsPlayer: S.gender === 'f',
    fatherIsPlayer: S.gender === 'm',
    knownGender: null,
    plannedHospital: 'private',
    complications: [],
    planningChecklist: { clothes: false, clothesTier: null, nursery: false, nurseryTier: null, name: null },
    eventLog: [{ year: gameYear(), event: 'IVF implantation cycle successful', cost: 120000 }]
  };
  log('🧬 IVF procedure successful! Expecting baby in ~9 months.');
  fx({ happiness: 20 });
  if (S.marriage && S.marriage.partner) {
    S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + 10);
  }
  render();
};

/* ---------- BIRTH LOGIC ---------- */
function chDoBirth() {
  const preg = S.pregnancy;
  if (!preg || !preg.active) return;

  const hospital = CHILDREN_MATERNITY_HOSPITALS.find(function(h) { return h.id === preg.plannedHospital; }) || CHILDREN_MATERNITY_HOSPITALS[2];
  let hospitalCost = chEGP(hospital.costEGP);
  if (S.wealth < hospitalCost) {
    log('⚠️ Cannot afford ' + hospital.label + '. Forced to public hospital.');
    hospitalCost = chEGP(CHILDREN_MATERNITY_HOSPITALS[1].costEGP);
  }
  S.wealth -= hospitalCost;

  /* Roll birth outcome */
  const roll = Math.random();
  let accumulated = 0;
  let outcome = CHILDREN_BIRTH_OUTCOMES[0];
  for (let i = 0; i < CHILDREN_BIRTH_OUTCOMES.length; i++) {
    accumulated += CHILDREN_BIRTH_OUTCOMES[i].chance;
    if (roll < accumulated) { outcome = CHILDREN_BIRTH_OUTCOMES[i]; break; }
  }
  const extraCost = chEGP(outcome.extraCostEGP);
  if (S.wealth >= extraCost) S.wealth -= extraCost;

  /* Number of babies */
  let babyCount = 1;
  if (outcome.id === 'twins') babyCount = 2;
  if (outcome.id === 'triplets') babyCount = 3;

  /* Baby health */
  let babyHealth = 100 + outcome.healthImpact;
  if (preg.complications.indexOf('premature_labor') >= 0) babyHealth -= 15;
  if (hospital.healthRisk > 0.10) babyHealth -= 5;

  /* Build children */
  const babies = [];
  for (let b = 0; b < babyCount; b++) {
    const gender = preg.knownGender || (Math.random() < 0.5 ? 'm' : 'f');
    const pool = chNamePool(gender);
    const name = (preg.planningChecklist.name && b === 0) ? preg.planningChecklist.name : pool[Math.floor(Math.random() * pool.length)];

    /* Random trait selection */
    const trait1 = CHILDREN_TRAITS[Math.floor(Math.random() * CHILDREN_TRAITS.length)];
    const trait2 = CHILDREN_TRAITS[Math.floor(Math.random() * CHILDREN_TRAITS.length)];
    const traitsList = [trait1.id];
    if (trait2.id !== trait1.id && Math.random() < 0.4) traitsList.push(trait2.id);

    const child = {
      id: 'child_' + Math.random().toString(36).slice(2, 8),
      name: name,
      gender: gender,
      age: 0,
      birthYear: gameYear(),
      school: null,
      bond: 55 + (preg.planningChecklist.nursery ? 10 : 0) + (preg.planningChecklist.clothes ? 5 : 0),
      happiness: 60 + (preg.planningChecklist.clothesTier ? 5 : 0) + (preg.planningChecklist.nurseryTier ? 5 : 0),
      smarts: 50 + Math.floor(Math.random() * 20),
      health: Math.max(30, babyHealth),
      social: 40 + Math.floor(Math.random() * 20),
      lifestyle: 'standard',
      activities: [],
      milestones: ['first_smile'],
      events: [{ year: gameYear(), event: 'Born via ' + outcome.desc + ' at ' + hospital.label }],
      traits: traitsList,
      collegeHelp: null,
      movedOut: false
    };
    babies.push(child);
    S.childrenList.push(child);
  }
  S.children = S.childrenList.length;

  const countLabel = babyCount === 3 ? 'TRIPLETS!' : babyCount === 2 ? 'TWINS!' : 'A ' + (babies[0].gender === 'm' ? 'boy' : 'girl') + '!';
  log('🍼 ' + countLabel + ' ' + babies.map(function(b) { return b.name; }).join(' & ') + ' born safely. Outcome: ' + outcome.desc + '. Total Cost: ' + money(hospitalCost + extraCost) + '.');
  fx({ happiness: 35 });
  S.pregnancy = null;
  S.childrenTab = 'list';
}

/* ---------- PREGNANCY ACTIONS ---------- */
window.chRevealGender = function() {
  if (!S.pregnancy || !S.pregnancy.active) return;
  if (S.pregnancy.knownGender) { log('Gender already revealed.'); return; }
  const cost = chEGP(3000);
  if (S.wealth < cost) { log('Not enough for ultrasound (' + money(cost) + ').'); return; }
  S.wealth -= cost;
  S.pregnancy.knownGender = Math.random() < 0.5 ? 'm' : 'f';
  log('🩺 Gender revealed: it\'s a ' + (S.pregnancy.knownGender === 'm' ? 'boy' : 'girl') + '!');
  render();
};

window.chBuyClothes = function(tierId) {
  if (!S.pregnancy || !S.pregnancy.active) return;
  const tier = CHILDREN_CLOTHES_TIERS.find(function(t) { return t.id === tierId; });
  if (!tier) return;
  const cost = chEGP(tier.costEGP);
  if (S.wealth < cost) { log('Not enough (' + money(cost) + ').'); return; }
  S.wealth -= cost;
  S.pregnancy.planningChecklist.clothes = true;
  S.pregnancy.planningChecklist.clothesTier = tier.id;
  log('👕 Bought ' + tier.label + ' for the baby · ' + money(cost) + '.');
  render();
};

window.chBuyNursery = function(tierId) {
  if (!S.pregnancy || !S.pregnancy.active) return;
  const tier = CHILDREN_NURSERY_TIERS.find(function(t) { return t.id === tierId; });
  if (!tier) return;
  const cost = chEGP(tier.costEGP);
  if (S.wealth < cost) { log('Not enough (' + money(cost) + ').'); return; }
  S.wealth -= cost;
  S.pregnancy.planningChecklist.nursery = true;
  S.pregnancy.planningChecklist.nurseryTier = tier.id;
  log('🛏 ' + tier.label + ' ready · ' + money(cost) + '.');
  render();
};

window.chSetHospital = function(hospitalId) {
  if (!S.pregnancy || !S.pregnancy.active) return;
  S.pregnancy.plannedHospital = hospitalId;
  const h = CHILDREN_MATERNITY_HOSPITALS.find(function(x) { return x.id === hospitalId; });
  log('🏥 Birth hospital chosen: ' + (h ? h.label : hospitalId) + '.');
  render();
};

window.chSetBabyName = function() {
  if (!S.pregnancy || !S.pregnancy.active) return;
  const name = prompt('Name the baby:', S.pregnancy.planningChecklist.name || '');
  if (!name) return;
  S.pregnancy.planningChecklist.name = name.trim();
  log('📛 Baby will be named ' + S.pregnancy.planningChecklist.name + '.');
  render();
};

/* ---------- CHILD ACTIONS ---------- */
window.chSpendTime = function(childId) {
  const c = chChild(childId);
  if (!c) return;
  c.bond = Math.min(100, c.bond + 8);
  c.happiness = Math.min(100, c.happiness + 5);
  fx({ happiness: 2 });
  log('👨‍👧 Spent quality time with ' + c.name + '. Bond +8, Happiness +5.');
  render();
};

window.chGiveGift = function(childId) {
  const c = chChild(childId);
  if (!c) return;
  const cost = chEGP(5000);
  if (S.wealth < cost) { log('Not enough cash.'); return; }
  S.wealth -= cost;
  c.bond = Math.min(100, c.bond + 6);
  c.happiness = Math.min(100, c.happiness + 8);
  log('🎁 Bought ' + c.name + ' a gift for ' + money(cost) + '. Bond +6, Happiness +8.');
  render();
};

window.chDiscipline = function(childId) {
  const c = chChild(childId);
  if (!c) return;
  c.bond = Math.max(0, c.bond - 6);
  c.smarts = Math.min(100, c.smarts + 4);
  log('⚖️ Disciplined ' + c.name + '. Bond -6, Smarts +4.');
  render();
};

window.chPraise = function(childId) {
  const c = chChild(childId);
  if (!c) return;
  c.bond = Math.min(100, c.bond + 5);
  c.happiness = Math.min(100, c.happiness + 6);
  log('⭐ Praised ' + c.name + '. Bond +5, Happiness +6.');
  render();
};

window.chSetLifestyle = function(childId, tierId) {
  const c = chChild(childId);
  if (!c) return;
  if (!CHILDREN_EXPENSE_TIERS.standard[tierId]) return;
  c.lifestyle = tierId;
  log('💎 ' + c.name + ' lifestyle set to ' + tierId + '.');
  render();
};

window.chEnrollActivity = function(childId, activityId) {
  const c = chChild(childId);
  if (!c) return;
  const act = CHILDREN_ACTIVITIES.find(function(a) { return a.id === activityId; });
  if (!act) return;
  if (c.activities.indexOf(activityId) >= 0) {
    c.activities = c.activities.filter(function(a) { return a !== activityId; });
    log('Unenrolled ' + c.name + ' from ' + act.label + '.');
  } else {
    const cost = act.monthlyEGP ? chEGP(act.monthlyEGP * 12) : chEGP(act.annualEGP);
    if (S.wealth < cost) { log('Not enough (' + money(cost) + '/year).'); render(); return; }
    c.activities.push(activityId);
    log('🎨 Enrolled ' + c.name + ' in ' + act.label + ' (' + money(cost) + '/year).');
  }
  render();
};

window.chChangeSchool = function(childId, schoolId) {
  const c = chChild(childId);
  if (!c) return;
  if (c.age < 4 || c.age > 18) { log('School changes only for ages 4-18.'); return; }
  const school = chBySchoolId(schoolId);
  if (!school) return;
  c.school = school.label;
  if (!c.schoolHistory) c.schoolHistory = [];
  c.schoolHistory.push({ year: gameYear(), school: school.label });
  log('🏫 ' + c.name + ' enrolled in ' + school.label + ' (' + money(chEGP(school.annualEGP)) + '/year).');
  render();
};

window.chHelpCollege = function(childId, mode) {
  const c = chChild(childId);
  if (!c) return;
  if (c.age < 17 || c.age > 20) { log('College help only for ages 17-20.'); return; }
  c.collegeHelp = mode;
  if (mode === 'full') log('🎓 You committed to pay full college tuition for ' + c.name + '.');
  else if (mode === 'half') log('🎓 You will pay half of ' + c.name + "'s college tuition.");
  else log('🎓 ' + c.name + ' will fund their own college.');
  render();
};

window.chKickOut = function(childId) {
  const c = chChild(childId);
  if (!c) return;
  if (c.age < 18) { log('Cannot ask a minor to move out.'); return; }
  if (!confirm('Ask ' + c.name + ' to move out of the house?')) return;
  c.movedOut = true;
  c.bond = Math.max(0, c.bond - 20);
  log('🚪 ' + c.name + ' moved out. Bond -20.');
  render();
};

/* ---------- MAIN VIEW ---------- */
function childrenView() {
  ensureChildrenState();
  if (!S) return '';
  if (S.age < 18 && !S.childrenList.length && !S.pregnancy) {
    return '<div class="card"><h3>👶 Children</h3><p class="muted">Available once you are an adult or have children.</p></div>';
  }

  const tabs = [['list', '👨‍👩‍👧 Children (' + S.childrenList.length + ')']];
  if (S.pregnancy && S.pregnancy.active) tabs.unshift(['pregnancy', '🤰 Pregnancy']);
  if (S.childrenList.some(function(c) { return c.events && c.events.length > 0; })) {
    tabs.push(['events', '📖 Events']);
  }

  const currentTab = S.childrenTab === 'pregnancy' && !(S.pregnancy && S.pregnancy.active) ? 'list' :
    (S.childrenTab === 'events') ? 'events' :
    (S.childrenTab === 'pregnancy') ? 'pregnancy' :
    'list';
  if (S.childrenTab !== currentTab) S.childrenTab = currentTab;

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#22d3ee15 0%,transparent 100%);border-color:#22d3ee">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">CHILDREN · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + (S.pregnancy && S.pregnancy.active ? '🤰 Expecting' : S.childrenList.length + ' child(ren)') + '</div></div>' +
    '<div style="font-size:2rem">👶</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (currentTab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="chSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

  if (currentTab === 'pregnancy') html += chRenderPregnancy();
  else if (currentTab === 'events') html += chRenderAllEvents();
  else {
    html += chRenderChildrenList();
    if (S.childrenList.length === 0 && !(S.pregnancy && S.pregnancy.active)) {
      html += '<div class="card"><h3>💡 Family Planning Options</h3>' +
        '<p class="muted small">Conceive via marriage or try high-tech fertility treatments.</p>' +
        '<button class="opt" style="width:100%;margin-top:8px" onclick="chStartIVF()">🧬 Undergo IVF Treatment (' + money(chEGP(120000)) + ')</button>' +
        '</div>';
    }
  }
  return html;
}

function chRenderPregnancy() {
  const p = S.pregnancy;
  if (!p || !p.active) return '';
  const months = p.monthsElapsed;
  const hospital = CHILDREN_MATERNITY_HOSPITALS.find(function(h) { return h.id === p.plannedHospital; }) || CHILDREN_MATERNITY_HOSPITALS[2];
  const genderText = p.knownGender ? (p.knownGender === 'm' ? '👦 Boy' : '👧 Girl') : '❓ Unknown';

  let html = '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">🤰 Pregnancy · Month ' + months + ' of 9</h3>' +
    '<div class="row"><span>Started</span><b>' + p.startYear + '</b></div>' +
    '<div class="row"><span>Type</span><b>' + (p.isIVF ? 'IVF' : 'Natural') + '</b></div>' +
    '<div class="row"><span>Gender</span><b>' + genderText + '</b></div>' +
    '<div class="row"><span>Planned hospital</span><b>' + hospital.label + ' (' + money(chEGP(hospital.costEGP)) + ')</b></div>' +
    (p.complications.length ? '<div class="row"><span>Complications</span><b class="bad">' + p.complications.length + '</b></div>' : '<div class="row"><span>Complications</span><b class="good">None</b></div>') +
    '</div>';

  /* Actions */
  html += '<div class="card"><h3>🩺 Pregnancy Care</h3>';
  if (!p.knownGender) {
    html += '<button class="opt" style="width:100%;margin-top:4px;font-size:.78rem" onclick="chRevealGender()">🩺 Ultrasound — reveal gender · ' + money(chEGP(3000)) + '</button>';
  }
  if (!p.planningChecklist.name) {
    html += '<button class="opt" style="width:100%;margin-top:4px;font-size:.78rem" onclick="chSetBabyName()">📛 Choose baby name</button>';
  } else {
    html += '<div class="row"><span>Chosen name</span><b>' + p.planningChecklist.name + '</b></div>' +
      '<button class="opt" style="width:100%;margin-top:4px;font-size:.78rem" onclick="chSetBabyName()">📛 Change name</button>';
  }
  html += '</div>';

  /* Clothes */
  if (!p.planningChecklist.clothes) {
    html += '<div class="card"><h3>👕 Baby clothes</h3>';
    CHILDREN_CLOTHES_TIERS.forEach(function(t) {
      html += '<button class="opt" style="width:100%;margin-top:4px;font-size:.75rem" onclick="chBuyClothes(\'' + t.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + t.label + '</b><span>' + money(chEGP(t.costEGP)) + '</span></div></button>';
    });
    html += '</div>';
  } else {
    html += '<div class="card"><h3>👕 Baby clothes</h3><div class="row"><span>Ready</span><b class="good">✓</b></div></div>';
  }

  /* Nursery */
  if (!p.planningChecklist.nursery) {
    html += '<div class="card"><h3>🛏 Nursery</h3>';
    CHILDREN_NURSERY_TIERS.forEach(function(t) {
      html += '<button class="opt" style="width:100%;margin-top:4px;font-size:.75rem" onclick="chBuyNursery(\'' + t.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + t.label + '</b><span>' + money(chEGP(t.costEGP)) + '</span></div></button>';
    });
    html += '</div>';
  } else {
    html += '<div class="card"><h3>🛏 Nursery</h3><div class="row"><span>Ready</span><b class="good">✓</b></div></div>';
  }

  /* Hospital */
  html += '<div class="card"><h3>🏥 Birth hospital</h3>';
  CHILDREN_MATERNITY_HOSPITALS.forEach(function(h) {
    const selected = p.plannedHospital === h.id;
    html += '<button class="opt" style="width:100%;margin-top:4px;font-size:.75rem;' + (selected ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="chSetHospital(\'' + h.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + h.label + (selected ? ' ✓' : '') + '</b><span>' + money(chEGP(h.costEGP)) + '</span></div>' +
      '<div class="muted small">' + h.desc + ' Health risk: ' + Math.round(h.healthRisk * 100) + '%</div></button>';
  });
  html += '</div>';

  /* Event log */
  if (p.eventLog && p.eventLog.length) {
    html += '<div class="card"><h3>📖 Pregnancy Events</h3>';
    p.eventLog.forEach(function(ev) {
      html += '<div class="row" style="font-size:.82rem"><span>' + ev.year + ' · ' + ev.event + '</span>' + (ev.cost > 0 ? '<b class="bad">-' + money(chEGP(ev.cost)) + '</b>' : '') + '</div>';
    });
    html += '</div>';
  }

  return html;
}

function chRenderChildrenList() {
  let html = '';
  if (S.childrenList.length === 0) return html;
  
  S.childrenList.forEach(function(c) {
    const school = c.school ? chBySchoolLabel(c.school) : null;
    const traitLabels = (c.traits || []).map(function(tid) {
  const tr = CHILDREN_TRAITS.find(function(x) { return x.id === tid; });
  return tr ? tr.label : tid;
});
    html += '<div class="card" style="border-left:3px solid ' + (c.bond > 60 ? '#34d399' : c.bond > 40 ? '#fbbf24' : '#fb7185') + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div><div style="font-weight:700;font-size:1.05rem">' + c.name + (c.movedOut ? ' 🏠' : '') + '</div>' +
      '<div class="muted small">Age ' + c.age + ' · ' + (c.gender === 'm' ? '👦 Boy' : '👧 Girl') +  (traitLabels.length ? ' · ' + traitLabels.join(' · ') : '') + '</div>' +
      (school ? '<div class="muted small">' + school.label + '</div>' : '') +
      '</div><div style="text-align:right">' +
      '<div style="font-size:1.4rem">' + (c.age < 3 ? '👶' : c.age < 13 ? '🧒' : c.age < 18 ? '👦' : '🧑') + '</div></div></div>';

    /* Stats bars */
    html += chStatBar('Bond', c.bond, '#8b5cf6');
    html += chStatBar('Happiness', c.happiness, '#fbbf24');
    html += chStatBar('Smarts', c.smarts, '#22d3ee');
    html += chStatBar('Health', c.health, '#34d399');

    /* Actions */
    html += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">' +
      '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="chSpendTime(\'' + c.id + '\')">⏰ Time</button>' +
      '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="chGiveGift(\'' + c.id + '\')">🎁 Gift</button>' +
      '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="chPraise(\'' + c.id + '\')">⭐ Praise</button>' +
      '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="chDiscipline(\'' + c.id + '\')">⚖️ Discipline</button>' +
      '</div>' +
      '<button class="opt" style="width:100%;margin-top:4px;font-size:.72rem" onclick="chOpenDetail(\'' + c.id + '\')">Open details →</button>' +
      '</div>';
  });

  if (S.childrenList.length > 0) {
    html += '<div class="card"><button class="opt" style="width:100%;text-align:center" onclick="chStartIVF()">🧬 Try for another child via IVF (' + money(chEGP(120000)) + ')</button></div>';
  }

  return html;
}

function chStatBar(label, value, color) {
  return '<div style="display:flex;justify-content:space-between;font-size:.7rem;color:#888;margin-top:6px"><span>' + label + '</span><span>' + Math.round(value) + '%</span></div>' +
    '<div style="height:4px;background:#1a1a2a;border-radius:2px;margin-top:2px"><div style="height:100%;width:' + value + '%;background:' + color + ';border-radius:2px"></div></div>';
}

window.chOpenDetail = function(childId) {
  S.childrenTab = childId;
  render();
};

/* Detail view when a child is selected */
function chRenderChildDetail(childId) {
  const c = chChild(childId);
  if (!c) return chRenderChildrenList();

  let html = '<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<div><div style="font-weight:700;font-size:1.1rem">' + c.name + '</div>' +
    '<div class="muted small">Age ' + c.age + ' · Born ' + c.birthYear + ' · ' + (c.gender === 'm' ? 'Boy' : 'Girl') + '</div>' +
    (c.traits.length ? '<div class="muted small" style="color:#8b5cf6">Traits: ' + c.traits.map(function(t) { const tr = CHILDREN_TRAITS.find(function(x) { return x.id === t; }); return tr ? tr.label : t; }).join(', ') + '</div>' : '') +
    '</div>' +
    '<button class="opt" style="padding:4px 8px;font-size:.7rem" onclick="chSetTab(\'list\')">← Back</button></div></div>';

  /* Stats */
  html += '<div class="card"><h3>Stats</h3>' +
    chStatBar('Bond with you', c.bond, '#8b5cf6') +
    chStatBar('Happiness', c.happiness, '#fbbf24') +
    chStatBar('Smarts', c.smarts, '#22d3ee') +
    chStatBar('Health', c.health, '#34d399') +
    chStatBar('Social', c.social, '#fb7185') +
    '</div>';

  /* School */
  if (c.age >= 4 && c.age <= 18) {
    html += '<div class="card"><h3>🏫 School</h3>' +
      '<div class="row"><span>Current</span><b>' + (c.school || 'Not enrolled') + '</b></div>';
    if (c.school) {
      const s = chBySchoolLabel(c.school);
      if (s) html += '<div class="row"><span>Annual fee</span><b>' + money(chEGP(s.annualEGP)) + '</b></div>';
    }
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px">';
    const schoolsToRender = CHILDREN_SCHOOLS.slice();
    if (S.country === 'usa') {
       schoolsToRender.length = 0; // Clear Egyptian schools
       schoolsToRender.push({ id: 'us_public', label: 'US Public School', annualEGP: 0, quality: 5 });
       schoolsToRender.push({ id: 'us_private', label: 'US Private School', annualEGP: 1200000, quality: 8 });
       schoolsToRender.push({ id: 'us_ivy_prep', label: 'Ivy Prep Academy', annualEGP: 3000000, quality: 10 });
    } else if (S.country === 'gbr' || S.country === 'deu') {
       schoolsToRender.length = 0;
       schoolsToRender.push({ id: 'eu_public', label: 'State School', annualEGP: 0, quality: 5 });
       schoolsToRender.push({ id: 'eu_private', label: 'Private International', annualEGP: 1800000, quality: 8 });
       schoolsToRender.push({ id: 'eu_boarding', label: 'Elite Boarding School', annualEGP: 4000000, quality: 10 });
    }
    
    schoolsToRender.forEach(function(s) {      if (c.school === s.label) return;
      html += '<button class="pill" style="padding:5px;font-size:.66rem" onclick="chChangeSchool(\'' + c.id + '\',\'' + s.id + '\')">' + s.label + '<br><span class="muted" style="font-size:.6rem">' + money(chEGP(s.annualEGP)) + '/yr</span></button>';
    });
    html += '</div></div>';
  }

  /* Activities */
  html += '<div class="card"><h3>🎨 Activities</h3>';
  if (c.activities.length) {
    c.activities.forEach(function(aid) {
      const act = CHILDREN_ACTIVITIES.find(function(a) { return a.id === aid; });
      if (act) html += '<div class="row"><span>' + act.label + '</span><b class="good">✓ Enrolled</b></div>';
    });
  } else {
    html += '<p class="muted small">No activities yet.</p>';
  }
  html += '<div style="display:grid;grid-template-columns:1fr;gap:4px;margin-top:8px">';
  CHILDREN_ACTIVITIES.forEach(function(a) {
    const enrolled = c.activities.indexOf(a.id) >= 0;
    const cost = a.monthlyEGP ? chEGP(a.monthlyEGP * 12) : chEGP(a.annualEGP);
    html += '<button class="opt" style="padding:6px;font-size:.72rem;text-align:left" onclick="chEnrollActivity(\'' + c.id + '\',\'' + a.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + a.label + (enrolled ? ' ✓' : '') + '</b><span>' + money(cost) + '/yr</span></div>' +
      '<div class="muted small">' + a.category + '</div></button>';
  });
  html += '</div></div>';

  /* Lifestyle */
  html += '<div class="card"><h3>💎 Lifestyle tier</h3>' +
    '<div class="row"><span>Current</span><b>' + c.lifestyle + '</b></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px">' +
    ['basic', 'standard', 'premium', 'luxury', 'elite'].map(function(t) {
      return '<button class="pill ' + (c.lifestyle === t ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="chSetLifestyle(\'' + c.id + '\',\'' + t + '\')">' + t + '</button>';
    }).join('') + '</div></div>';

  /* College */
  if (c.age >= 17 && c.age <= 20) {
    html += '<div class="card"><h3>🎓 College</h3>' +
      '<div class="row"><span>Your help</span><b>' + (c.collegeHelp || 'Not decided') + '</b></div>' +
      '<div style="display:flex;gap:4px;margin-top:6px">' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.7rem" onclick="chHelpCollege(\'' + c.id + '\',\'full\')">Pay full</button>' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.7rem" onclick="chHelpCollege(\'' + c.id + '\',\'half\')">Pay half</button>' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.7rem" onclick="chHelpCollege(\'' + c.id + '\',\'none\')">Nothing</button>' +
      '</div></div>';
  }

  /* Move out */
  if (c.age >= 18 && !c.movedOut) {
    html += '<div class="card"><button class="opt" style="width:100%;text-align:center;border-color:#fb7185;color:#fb7185" onclick="chKickOut(\'' + c.id + '\')">🚪 Ask ' + c.name + ' to move out</button></div>';
  }

  /* Events history */
  if (c.events && c.events.length) {
    html += '<div class="card"><h3>📖 Events</h3>';
    c.events.slice(-15).reverse().forEach(function(ev) {
      html += '<div style="padding:4px 0;border-bottom:1px solid #1a1a2a;font-size:.8rem"><span class="muted mono">' + ev.year + '</span> · ' + ev.event + '</div>';
    });
    html += '</div>';
  }

  /* Milestones */
  if (c.milestones && c.milestones.length) {
    html += '<div class="card"><h3>🌟 Milestones</h3>';
    c.milestones.forEach(function(mid) {
      const m = CHILDREN_MILESTONES.find(function(x) { return x.id === mid; });
      if (m) html += '<div class="row"><span>' + m.desc + '</span><span class="muted small">age ' + m.ageYears + '</span></div>';
    });
    html += '</div>';
  }

  return html;
}

function chRenderAllEvents() {
  const allEvents = [];
  S.childrenList.forEach(function(c) {
    (c.events || []).forEach(function(ev) {
      allEvents.push({ year: ev.year, child: c.name, event: ev.event });
    });
  });
  allEvents.sort(function(a, b) { return b.year - a.year; });

  if (!allEvents.length) return '<div class="card"><p class="muted small">No events yet.</p></div>';
  let html = '<div class="card"><h3>📖 All Children Events</h3>';
  allEvents.slice(0, 50).forEach(function(ev) {
    html += '<div style="padding:4px 0;border-bottom:1px solid #1a1a2a;font-size:.8rem"><span class="muted mono">' + ev.year + '</span> · <b>' + ev.child + '</b> · ' + ev.event + '</div>';
  });
  html += '</div>';
  return html;
}

/* Override main view dispatch to handle child detail */
const _childrenViewBase = childrenView;
childrenView = function() {
  ensureChildrenState();
  if (S.childrenTab && S.childrenTab !== 'list' && S.childrenTab !== 'pregnancy' && S.childrenTab !== 'events') {
    const c = chChild(S.childrenTab);
    if (c) {
      let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#22d3ee15 0%,transparent 100%);border-color:#22d3ee">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">CHILD DETAIL</div>' +
        '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + c.name + '</div></div>' +
        '<div style="font-size:2rem">' + (c.age < 3 ? '👶' : c.age < 13 ? '🧒' : c.age < 18 ? '👦' : '🧑') + '</div></div></div>';
      html += chRenderChildDetail(c.id);
      return html;
    }
    S.childrenTab = 'list';
  }
  return _childrenViewBase();
};

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureChildrenState();
  if (!S) return;
  const year = gameYear();

  /* 1. Advance pregnancy */
  if (S.pregnancy && S.pregnancy.active) {
    S.pregnancy.monthsElapsed += 12;
    if (S.pregnancy.monthsElapsed >= 9) {
      chDoBirth();
    }
  }

  /* 2. Age children & charge costs */
  S.childrenList.forEach(function(c) {
    c.age++;
    c.birthYear = year - c.age;

    /* School fees */
        /* School fees (SKIPPED in monthly — settlement spreads it) */
    if (!(typeof isMonthly === 'function' && isMonthly())) {
      if (c.school && c.age >= 4 && c.age <= 18) {
        const s = chBySchoolLabel(c.school);
        if (s) {
          const fee = chEGP(s.annualEGP);
          if (S.wealth >= fee) {
            S.wealth -= fee;
          } else {
            log('⚠️ Could not afford ' + c.name + "'s school fees. Moved to Public School.");
            c.school = 'Public School';
            c.smarts = Math.max(0, c.smarts - 5);
          }
        }
      }
    }

        /* Lifestyle monthly cost (SKIPPED in monthly — settlement spreads it) */
    if (!(typeof isMonthly === 'function' && isMonthly())) {
      const ageGroup = chBabyAgeCategory(c.age);
      const tier = CHILDREN_EXPENSE_TIERS[ageGroup][c.lifestyle] || CHILDREN_EXPENSE_TIERS[ageGroup].standard;
      const monthlyCost = chEGP(tier.monthlyEGP * 12);
      if (S.wealth >= monthlyCost) {
        S.wealth -= monthlyCost;
      } else {
        log('⚠️ Cannot afford ' + c.name + "'s lifestyle. Downgraded.");
        c.lifestyle = 'basic';
        c.happiness = Math.max(0, c.happiness - 10);
      }
    }
        /* Activity effects — cash charge SKIPPED in monthly; stat gains stay annual */
    c.activities.forEach(function(aid) {
      const act = CHILDREN_ACTIVITIES.find(function(a) { return a.id === aid; });
      if (!act) return;
      const cost = act.monthlyEGP ? chEGP(act.monthlyEGP * 12) : chEGP(act.annualEGP);
      if (typeof isMonthly === 'function' && isMonthly()) {
        c.smarts = Math.min(100, c.smarts + (act.smarts || 0));
        c.social = Math.min(100, c.social + (act.social || 0));
        c.health = Math.min(100, c.health + (act.health || 0));
        c.happiness = Math.min(100, c.happiness + (act.happiness || 0));
      } else if (S.wealth >= cost) {
        S.wealth -= cost;
        c.smarts = Math.min(100, c.smarts + (act.smarts || 0));
        c.social = Math.min(100, c.social + (act.social || 0));
        c.health = Math.min(100, c.health + (act.health || 0));
        c.happiness = Math.min(100, c.happiness + (act.happiness || 0));
      }
    });

    /* Bond decay (if player doesn't spend time) */
    if (c.bond > 20) c.bond = Math.max(0, c.bond - 2);

    /* Milestones */
    CHILDREN_MILESTONES.forEach(function(m) {
      if (c.age === m.ageYears && c.milestones.indexOf(m.id) < 0) {
        c.milestones.push(m.id);
        c.events.push({ year: year, event: 'Milestone: ' + m.desc });
        log('🌟 ' + c.name + ': ' + m.desc);
      }
    });

    /* Auto-enroll in KG at age 4 if no school */
    if (c.age === 4 && !c.school) {
      c.school = 'Public School';
      c.events.push({ year: year, event: 'Auto-enrolled in Public School' });
      log('🏫 ' + c.name + ' auto-enrolled in Public School.');
    }

    /* Random events */
    if (Math.random() < 0.35) {
      const eligible = CHILDREN_EVENTS.filter(function(ev) {
        return c.age >= ev.ageMin && c.age <= ev.ageMax;
      });
      if (eligible.length) {
        const totalW = eligible.reduce(function(s, e) { return s + e.weight; }, 0);
        let roll = Math.random() * totalW;
        for (let i = 0; i < eligible.length; i++) {
          roll -= eligible[i].weight;
          if (roll <= 0) {
            const ev = eligible[i];
            const title = ev.title.replace('{name}', c.name);
            const text = ev.text.replace('{name}', c.name);
            c.events.push({ year: year, event: title + ' — ' + text });
            if (ev.happiness) c.happiness = Math.max(0, Math.min(100, c.happiness + ev.happiness));
            if (ev.smarts) c.smarts = Math.max(0, Math.min(100, c.smarts + ev.smarts));
            if (ev.social) c.social = Math.max(0, Math.min(100, c.social + ev.social));
            if (ev.bond) c.bond = Math.max(0, Math.min(100, c.bond + ev.bond));
            log('📖 ' + title + ' — ' + text);
            break;
          }
        }
      }
    }

    /* Age 18 → college decision */
    if (c.age === 18 && !c.collegeHelp) {
      c.events.push({ year: year, event: 'Turned 18 — college decision time' });
    }

    /* Age 22 → might move out */
    if (c.age === 22 && !c.movedOut && Math.random() < 0.5) {
      c.movedOut = true;
      c.events.push({ year: year, event: 'Moved out of the family home' });
      log('🚪 ' + c.name + ' moved out.');
    }

    /* Clamp stats */
    c.bond = Math.max(0, Math.min(100, c.bond));
    c.happiness = Math.max(0, Math.min(100, c.happiness));
    c.smarts = Math.max(0, Math.min(100, c.smarts));
    c.health = Math.max(0, Math.min(100, c.health));
    c.social = Math.max(0, Math.min(100, c.social));
  });

  /* Sync count */
  S.children = S.childrenList.length;
});

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'children', label: '👶 Children', order: 10, view: childrenView });
