/* ============================================================
   VIEW: FAMILY, RELATIONSHIPS & HEALTH (v3 Massive Expansion FIXED)
   ============================================================
   Takes over the old family tab and dramatically expands it to 
   handle deep life simulation mechanics:
   - Relatives: Parents & Siblings with deep traits, drama, inheritance.
   - Dating & Marriage: Salonat, apps, shabka, mahr, wedding tiers, divorce & custody.
   - Children: Fertility, IVF, birth tiers, diapers, schools, sports clubs.
   - Medical: Conditions (mental, chronic, severe), insurance tiers, treatments.
   - Vacations & Visas: Local resorts vs Schengen/USA with visa chances.
   ============================================================ */

/* ---------- STATE MIGRATION ---------- */
function ensureFamilyState() {
  if (!S) return;
  if (!Array.isArray(S.family)) S.family = [];
  if (!S.homeCountry) S.homeCountry = S.country || 'egy';
  if (!S.familySubTab) S.familySubTab = 'relatives';

  const tier = resolveFamilyTier(S.familyTier);
  const tierCfg = FAMILY_TIERS[tier] || FAMILY_TIERS.middle;

  // Init Base Family
  S.family.forEach(function(m) {
    if (!m.id) m.id = 'fam_' + Math.random().toString(36).slice(2, 8);
    if (typeof m.health !== 'number') m.health = 100;
    if (typeof m.alive !== 'boolean') m.alive = true;
    if (typeof m.bond !== 'number') m.bond = 70;
    if (typeof m.age !== 'number') m.age = 30;
    if (typeof m.lastContactYear === 'undefined') m.lastContactYear = null;
    if (typeof m.deathYear === 'undefined') m.deathYear = null;
    
    // Assign Traits
    if (!m.trait) {
      const traits = Object.keys(PERSONALITY_TRAITS);
      m.trait = traits[Math.floor(Math.random() * traits.length)];
    }

    const isParent = (m.role === 'Mother' || m.role === 'Father');
    if (typeof m.wealth !== 'number') m.wealth = isParent ? tierCfg.parentWealth : 0;
    if (typeof m.income !== 'number') m.income = isParent ? tierCfg.parentIncome : 0;
    if (typeof m.retirementRequested !== 'boolean') m.retirementRequested = false;
  });

  if (S.age <= 6 && !S.family.some(function(m) { return m.isSibling === true; })) {
    familyAddSiblings();
  }

  // Init Relationships & Partner
  if (!S.datingStatus) S.datingStatus = 'single';
  if (typeof S.partner === 'undefined') S.partner = null;
  if (!Array.isArray(S.exes)) S.exes = [];
  if (!Array.isArray(S.childrenList)) S.childrenList = [];
  // FIXED BUG: Was === 'number', forced pregnancy to reset constantly
  if (typeof S.pregnantMonths !== 'number') S.pregnantMonths = 0; 

  // Init Medical
  if (!S.medical) S.medical = { insurance: 'none', conditions: [] };

  // Trackers
  if (!Array.isArray(S.familyRequests)) S.familyRequests = [];
  if (!S.parentAllowances || typeof S.parentAllowances !== 'object') S.parentAllowances = {};
  if (typeof S.vacationDays !== 'number') S.vacationDays = 21;
  if (typeof S.vacationDaysUsedThisYear !== 'number') S.vacationDaysUsedThisYear = 0;
  if (typeof S.inheritedFamilyHome === 'undefined') S.inheritedFamilyHome = null;
  if (!Array.isArray(S.familyEventLog)) S.familyEventLog = [];
  
  // Planners
  if (typeof S.weddingPlan === 'undefined') S.weddingPlan = null;
  if (typeof S.vacationPlan === 'undefined') S.vacationPlan = null;
}

function familyAddSiblings() {
  const count = Math.floor(Math.random() * 4);
  if (count === 0) return;
  const pool = SIBLING_NAMES[S.country] || SIBLING_NAMES.egy;
  const usedNames = new Set(S.family.map(function(m) { return m.name; }));
  for (let i = 0; i < count; i++) {
    const gender = Math.random() < 0.5 ? 'm' : 'f';
    const names = pool[gender].filter(function(n) { return !usedNames.has(n); });
    if (!names.length) continue;
    const name = names[Math.floor(Math.random() * names.length)];
    usedNames.add(name);
    const ageOffset = Math.floor(Math.random() * 14) - 5;
    const siblingAge = Math.max(1, S.age + ageOffset);
    
    const traits = Object.keys(PERSONALITY_TRAITS);
    const trait = traits[Math.floor(Math.random() * traits.length)];

    S.family.push({
      id: 'sib_' + Math.random().toString(36).slice(2, 8),
      role: gender === 'm' ? 'Brother' : 'Sister',
      name: name, age: siblingAge,
      bond: 60 + Math.floor(Math.random() * 30),
      trait: trait,
      alive: true, health: 100, gender: gender, isSibling: true,
      lastContactYear: null, wealth: 0, income: 0, deathYear: null,
      lifeStage: siblingAge < 6 ? 'toddler' : siblingAge < 18 ? 'student' : siblingAge < 22 ? 'uni' : 'working',
      successLevel: 'middle', spouse: null, children: 0, justMarried: false
    });
  }
}

GameHooks.on('newGame', ensureFamilyState);
GameHooks.on('migrate', ensureFamilyState);

/* ---------- SUB-TABS ROUTING ---------- */
function familySetTab(tab) {
  S.familySubTab = tab;
  render();
}

/* ---------- HELPERS ---------- */
function familyParents() { return (S.family || []).filter(function(m) { return m.role === 'Mother' || m.role === 'Father'; }); }
function familySiblings() { return (S.family || []).filter(function(m) { return m.isSibling === true && m.alive !== false; }); }
function familyLivingParents() { return familyParents().filter(function(m) { return m.alive !== false; }); }
function familyById(id) { return (S.family || []).find(function(m) { return m.id === id; }); }
function familyHealthColor(v) { return v > 70 ? '#34d399' : v > 40 ? '#fbbf24' : '#fb7185'; }
function familyBondColor(v) { return v > 70 ? '#34d399' : v > 40 ? '#fbbf24' : '#fb7185'; }
function familyPlayerAbroad() { return S.country && S.homeCountry && S.country !== S.homeCountry; }
function familyHomeCountry() { return S.homeCountry || S.country || 'egy'; }
function familyMarkContact(member) { if (member) member.lastContactYear = gameYear(); }
function familyAddBond(member, amount) {
  if (!member) return;
  member.bond = Math.max(0, Math.min(100, (member.bond || 0) + amount));
}
function familyLog(msg) {
  if (!Array.isArray(S.familyEventLog)) S.familyEventLog = [];
  S.familyEventLog.unshift({ year: gameYear(), age: S.age, msg: msg });
  S.familyEventLog = S.familyEventLog.slice(0, 50);
}

function getExchangeRate() { return (C && C() && C().rate) || 1; }

function getMedicalCost(baseCostUSD) {
    const ins = MEDICAL_INSURANCE_TIERS.find(i => i.id === S.medical.insurance) || MEDICAL_INSURANCE_TIERS[0];
    const covered = baseCostUSD * (ins.coveragePct / 100);
    return Math.round((baseCostUSD - covered) * getExchangeRate());
}

/* ============================================================
   VIEW ROUTER
   ============================================================ */
function familyView() {
  ensureFamilyState();
  if (!S) return '';
  if (S.age < 6) return '<div class="card"><h3>Family</h3><p class="muted">You are too young to understand these complexities.</p></div>';

  const wantsCount = (typeof familyDepthGetActiveWants === 'function') ? familyDepthGetActiveWants().length : 0;
  const isAbroad = typeof expatIsAbroad === 'function' && expatIsAbroad();
  const tabs = [
    ['relatives', '👨‍👩‍👧 Relatives'],
    ['partner', '❤️ Partner'],
    ['children', '👶 Children'],
    ['wants', '💭 Wants' + (wantsCount > 0 ? ' (' + wantsCount + ')' : '')],
    ['medical', '🏥 Health']
  ];
  if (isAbroad) tabs.push(['visits', '💸 Expat Support']);

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#fb718515 0%,transparent 100%);border-color:#fb7185">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">LIFE · FAMILY & HEALTH</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">Your Personal Life</div></div>' +
    '<div style="font-size:2rem">❤️</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (S.familySubTab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="familySetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

    if (S.familySubTab === 'relatives') html += renderRelativesTab();
  else if (S.familySubTab === 'partner') html += renderPartnerTab();
  else if (S.familySubTab === 'children') html += renderChildrenTab();
  else if (S.familySubTab === 'wants') html += (typeof familyDepthRenderWantsPanel === 'function' ? familyDepthRenderWantsPanel() : '<div class="card"><p class="muted small">Wants system not loaded.</p></div>');
    else if (S.familySubTab === 'medical') html += renderMedicalTab();
  else if (S.familySubTab === 'visits') html += renderFamilySupportTab();
   /* Show active wants summary at the top */
  if (typeof familyDepthRenderWantsPanel === 'function') {
    const activeWants = (typeof familyDepthGetActiveWants === 'function') ? familyDepthGetActiveWants() : [];
    if (activeWants.length > 0 || S.selfWant) {
      html += '<div class="card" style="border-color:#8b5cf6;padding:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<b style="font-size:.85rem;color:#8b5cf6">💭 ' + (activeWants.length + (S.selfWant ? 1 : 0)) + ' active want' + ((activeWants.length + (S.selfWant ? 1 : 0)) > 1 ? 's' : '') + '</b>' +
        '<button class="pill" style="padding:4px 10px;font-size:.7rem" onclick="familySetTab(\'wants\')">View →</button>' +
        '</div></div>';
    }
  }

  /* Show move-out refusal if pending */
  if (typeof familyDepthRenderMoveOutRefusal === 'function') {
    html += familyDepthRenderMoveOutRefusal();
  }

  return html;
}

/* ============================================================
   TAB 1: RELATIVES (Parents & Siblings)
   ============================================================ */
function renderRelativesTab() {
  let html = '';
  const livingParents = familyLivingParents();
  const deadParents = familyParents().filter(function(m) { return m.alive === false; });
  const siblings = familySiblings(); 
   /* Family Financial Support */
  const parentsAlive = familyLivingParents();
  if (parentsAlive.length > 0) {
    html += '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">💰 Family Financial Support</h3>' +
      '<p class="muted small">Ask your parents for cash or support.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#34d39920;border-color:#34d399;font-size:.78rem" onclick="askFamilyForMoney()">💸 Ask parents for cash</button>' +
      '</div>';
  }
  const pendingReq = S.familyRequests || [];

  if (pendingReq.length) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">Pending Requests</h3>';
    pendingReq.forEach(function(r) {
      const amtLocal = (r.amount || 0) * getExchangeRate();
      const amt = r.perMonth ? (money(amtLocal) + '/mo') : money(amtLocal);
      const canShare = r.shareable && siblings.length > 0;
      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-size:.9rem;margin-bottom:6px">' + r.message + '</div>' +
        '<div class="muted small" style="margin-bottom:8px">Amount: <b style="color:#fbbf24">' + amt + '</b>' +
        (r.perMonth ? ' (' + money(amtLocal * 12) + '/year)' : '') + '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;background:#34d399;color:#000;font-weight:700" onclick="familyPayRequest(\'' + r.id + '\')">Pay full</button>' +
        (canShare ? '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyShareRequest(\'' + r.id + '\')">Split with siblings</button>' : '') +
        '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="familyDeclineRequest(\'' + r.id + '\')">Decline</button>' +
        '</div></div>';
    });
    html += '</div>';
  }

  if (livingParents.length) {
    html += '<div class="card"><h3>Parents</h3>';
    livingParents.forEach(function(p) { html += familyRenderRelative(p); });
    html += '</div>';
  }

  if (siblings.length) {
    html += '<div class="card"><h3>Siblings</h3>';
    siblings.forEach(function(sib) { html += familyRenderRelative(sib); });
    html += '</div>';
  }

  if (familyPlayerAbroad() && livingParents.length) {
      const homeCountry = familyHomeCountry();
      html += '<div class="card"><h3>✈️ Remittance</h3>' +
        '<p class="muted small">You live in ' + (C() ? C().name : 'Abroad') + ' · family in ' + homeCountry.toUpperCase() + '.</p>';
      const totalMonthlyUSD = Object.values(S.parentAllowances || {}).reduce(function(s, v) { return s + v; }, 0);
      if (totalMonthlyUSD > 0) html += '<div class="row"><span>Committed monthly</span><b>' + money(totalMonthlyUSD * getExchangeRate()) + '/mo</b></div>';
      html += '<button class="opt" style="margin-top:8px;text-align:center;background:#3b82f6;color:#fff;font-weight:700" onclick="familySendRemittance()">Send one-time amount</button></div>';
  }

  if (S.inheritedFamilyHome) html += familyRenderInheritance();

  if (deadParents.length) {
    html += '<div class="card" style="border-color:#666"><h3 style="color:#888">In Memoriam</h3>' +
      deadParents.map(function(m) {
        return '<div class="row"><span style="color:#888">' + m.name + ' (' + m.role + ')</span><span class="muted small">' + (m.deathYear || '?') + '</span></div>';
      }).join('') + '</div>';
  }

  return html;
}

function familyRenderRelative(p) {
  const isParent = p.role === 'Mother' || p.role === 'Father';
  const hColor = familyHealthColor(p.health || 100);
  const bColor = familyBondColor(p.bond || 70);
  const lastContact = p.lastContactYear ? ('last contact ' + (gameYear() - p.lastContactYear) + 'y ago') : 'never contacted';
  const traitObj = PERSONALITY_TRAITS[p.trait] || PERSONALITY_TRAITS.balanced;
  
  let extraLabel = '';
  if(isParent) {
      extraLabel = p.age >= 85 ? 'Elderly' : p.age >= 75 ? 'Senior' : p.age >= 65 ? 'Retiring' : p.age >= 50 ? 'Middle-aged' : 'Active';
  } else {
      const stageLabel = { toddler: 'Toddler', student: 'Student', uni: 'University', working: 'Working', married: 'Married', parent: 'Parent' }[p.lifeStage] || 'Unknown';
      const successLabel = { poor: 'Struggling', middle: 'Doing OK', successful: 'Successful' }[p.successLevel] || '';
      extraLabel = stageLabel + ' · ' + successLabel;
  }

  const allowanceUSD = S.parentAllowances[p.id] || 0;

  let html = '<div style="padding:12px 0;border-bottom:1px solid #1a1a2a">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">' +
    '<div><div style="font-weight:700">' + p.name + ' · ' + p.role + '</div>' +
    '<div class="muted small">age ' + p.age + ' · ' + extraLabel + '</div>' +
    '<div class="muted small" style="color:#8b5cf6">Trait: ' + traitObj.label + '</div></div>' +
    '<div class="muted" style="font-size:.7rem;text-align:right">' + lastContact + '</div></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin-bottom:2px"><span>Health</span><span>' + (p.health || 100) + '%</span></div>' +
    '<div style="height:4px;background:#1a1a2a;border-radius:2px;margin-bottom:6px"><div style="height:100%;width:' + (p.health || 100) + '%;background:' + hColor + ';border-radius:2px"></div></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin-bottom:2px"><span>Bond</span><span>' + (p.bond || 70) + '%</span></div>' +
    '<div style="height:4px;background:#1a1a2a;border-radius:2px;margin-bottom:6px"><div style="height:100%;width:' + (p.bond || 70) + '%;background:' + bColor + ';border-radius:2px"></div></div>' +
    (allowanceUSD > 0 ? '<div class="muted small" style="margin-bottom:6px">💰 Allowance: <b>' + money(allowanceUSD * getExchangeRate()) + '/mo</b></div>' : '') +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyCall(\'' + p.id + '\')">📞 Call</button>' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyVisit(\'' + p.id + '\')">☕ Visit</button>' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyHelpPrompt(\'' + p.id + '\', 500)">💵 Help</button>';
    
       if(isParent) html += '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familySetAllowance(\'' + p.id + '\')">💰 Allowance</button>';
    else html += '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyOpenGiftPicker(\'' + p.id + '\')">🎁 Gift</button>';
    
  html += '</div>';

  /* Cut ties / reunion buttons */
  if (typeof familyCutTies === 'function') {
    if (p.estranged) {
      html += '<div style="margin-top:8px;padding:8px;background:#1a0a12;border-radius:6px">' +
        '<div class="small" style="color:#fb7185;font-weight:700">💔 Estranged since ' + (p.estrangedYear || '?') + '</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;background:#fbbf24;color:#000;font-weight:700" onclick="familyReunite(\'' + p.id + '\')">🤝 Try to reunite</button>' +
        '</div>';
    } else {
      html += '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.7rem;border-color:#fb7185;color:#fb7185" onclick="familyCutTies(\'' + p.id + '\')">💔 Cut ties</button>';
    }
  }

  html += '</div>';
  return html;
}

function familyHelpPrompt(memberId, defaultAmountUSD) {
  const localDefault = Math.round(defaultAmountUSD * getExchangeRate());
  const amount = Math.round(Number(prompt('How much to give?\n(You have ' + money(S.wealth) + ')', String(localDefault))));
  if (!amount || amount <= 0) return;
  familyHelpMoney(memberId, amount);
}

function familySetAllowance(memberId) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m) return;
  const currentUSD = S.parentAllowances[memberId] || 0;
  const currentLocal = Math.round(currentUSD * getExchangeRate());
  const input = prompt('Set monthly allowance for ' + m.name + '?\n(Current: ' + money(currentLocal) + '/month)\n(Enter 0 to stop)', String(currentLocal));
  if (input === null) return;
  const amtLocal = Math.max(0, Math.round(Number(input) || 0));
  const amtUSD = Math.round(amtLocal / getExchangeRate());
  
  if (amtUSD === 0) delete S.parentAllowances[memberId];
  else S.parentAllowances[memberId] = amtUSD;
  familyLog('💰 Allowance for ' + m.name + ' set to ' + money(amtLocal) + '/mo');
  log('💰 Allowance for ' + m.name + ': ' + money(amtLocal) + '/month.');
  render();
}

function familySendRemittance() {
  ensureFamilyState();
  const homeCountry = familyHomeCountry();
  const info = REMITTANCE_COSTS[homeCountry] || REMITTANCE_COSTS.egy;
  const minLocal = Math.round(info.minMonthly * getExchangeRate());
  const maxLocal = Math.round(info.maxMonthly * getExchangeRate());
  
  const amt = Math.round(Number(prompt(
    'Send one-time money home.\nSuggested: ' + money(minLocal) + ' - ' + money(maxLocal) + '\nYou have ' + money(S.wealth),
    String(minLocal * 3)
  )));
  if (!amt || amt <= 0) return;
  if (S.wealth < amt) { log('Not enough cash.'); render(); return; }
  S.wealth -= amt;
  const parents = familyLivingParents();
  if (parents.length) {
    parents.forEach(function(p) {
      p.wealth = (p.wealth || 0) + Math.round(amt / parents.length);
      familyAddBond(p, 8);
      familyMarkContact(p);
    });
    familyLog('✈️ Sent ' + money(amt) + ' home');
    log('✈️ Sent ' + money(amt) + ' to family. Bond +8.');
  }
  fx({ happiness: 3 });
  render();
}
function _fdRollWantFor(relation) {
  const pool = WANT_TEMPLATES[relation.kind];
  if (!pool) return null;
  const eligible = pool.filter(function(t) {
    if (t.ageMin && (relation.obj.age || 0) < t.ageMin) return false;
    if (t.ageMax && (relation.obj.age || 999) > t.ageMax) return false;
    
    /* NEW: If player is young (<25) and broke, siblings shouldn't ask for massive things */
    if (S.age < 25 && t.costEGP > (S.wealth + 20000)) {
       if (t.costEGP > 50000) return false; 
    }
    return true;
  });
   
function familyRenderInheritance() {
  const h = S.inheritedFamilyHome;
  if (!h) return '';
  
  // FIXED BUG: Safe fallback for v2 saved files using h.value instead of h.valueUSD
  const baseValue = h.valueUSD || h.value || 0;
  const valLocal = baseValue * getExchangeRate();

  let html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🏠 Family Home</h3>' +
    '<div class="row"><span>Estimated value</span><b>' + money(valLocal) + '</b></div>' +
    '<div class="row"><span>Your share</span><b>' + Math.round(h.myPct * 100) + '% (' + money(valLocal * h.myPct) + ')</b></div>';
  if (h.shares && h.shares.length) {
    html += '<h4 style="font-size:.8rem;color:#fbbf24;margin-top:10px">Sibling shares</h4>';
    h.shares.forEach(function(s) {
      const sib = familyById(s.siblingId);
      if (!sib) return;
      const cost = Math.round(valLocal * s.pct);
      html += '<div class="row"><span>' + sib.name + ' · ' + Math.round(s.pct * 100) + '%</span>' +
        '<button class="opt" style="padding:3px 8px;font-size:.7rem" onclick="familyBuySiblingShare(\'' + s.siblingId + '\')">Buy · ' + money(cost) + '</button></div>';
    });
  }
  html += '<button class="opt" style="margin-top:10px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="familySellMyHomeShare()">Sell my share · ' + money(valLocal * h.myPct) + '</button></div>';
  return html;
}

/* ============================================================
   TAB 2: PARTNER (Dating, Marriage, Divorce)
   ============================================================ */
function renderPartnerTab() {
    let html = '';
    
    if (S.datingStatus === 'single') {
        html += '<div class="card"><h3>Find a Partner</h3><p class="muted small">You are currently single.</p>';
        DATING_SOURCES.forEach(src => {
             const costLocal = 200 * getExchangeRate();
             html += '<div class="row"><span>' + src.label + '</span>' +
                     '<button class="opt" style="padding:4px 8px" onclick="familyDate(\'' + src.id + '\')">Try (' + money(costLocal) + ')</button></div>';
        });
        html += '</div>';
    } 
    else if (S.datingStatus === 'dating') {
        html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">In a Relationship</h3>';
        html += renderPartnerCard();
        html += '<button class="opt" style="margin-top:10px;text-align:center;background:#fb7185;color:#fff" onclick="familyOpenProposal()">Propose Marriage</button>';
        html += '<button class="opt" style="margin-top:6px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="familyBreakup()">Break Up</button>';
        html += '</div>';

        if(S.weddingPlan) html += renderWeddingPlanner();
    }
    else if (S.datingStatus === 'married') {
        html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">Marriage</h3>';
        html += renderPartnerCard();
        html += '<div class="row" style="margin-top:8px"><span>Finance Setup</span><b>' + (S.partner.financeModel || 'Traditional') + '</b></div>';
        
        html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">';
        html += '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyPartnerAction(\'date\')">Romantic Date</button>';
        html += '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyPartnerAction(\'gift\')">Buy Gift</button>';
        html += '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyTryBaby()">Try for Baby</button>';
        html += '</div>';
        
        html += '<button class="opt" style="margin-top:12px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="familyDivorce()">Ask for Divorce</button>';
        html += '</div>';
    }

    if (S.exes && S.exes.length > 0) {
        html += '<div class="card"><h3>Exes</h3>';
        S.exes.forEach(ex => {
            html += '<div class="row"><span>' + ex.name + '</span><span class="muted small">' + ex.reason + '</span></div>';
        });
        html += '</div>';
    }

    return html;
}

function renderPartnerCard() {
    const p = S.partner;
    if(!p) return '';
    const bColor = familyBondColor(p.bond);
    return '<div>' +
           '<div style="font-weight:700;font-size:1.1rem">' + p.name + '</div>' +
           '<div class="muted small">Age ' + p.age + ' · Met via ' + p.source + '</div>' +
           '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin:8px 0 2px"><span>Bond</span><span>' + p.bond + '%</span></div>' +
           '<div style="height:4px;background:#1a1a2a;border-radius:2px;margin-bottom:6px"><div style="height:100%;width:' + p.bond + '%;background:' + bColor + ';border-radius:2px"></div></div>' +
           '</div>';
}

function familyDate(sourceId) {
    const costLocal = 200 * getExchangeRate();
    if (S.wealth < costLocal) { log('Not enough cash for dates.'); render(); return; }
    S.wealth -= costLocal;

    const src = DATING_SOURCES.find(s => s.id === sourceId);
    if(Math.random() > src.matchChance) {
        log('❌ No luck this time on ' + src.label + '.');
        fx({happiness: -2});
        render(); return;
    }

    const names = S.gender === 'm' ? SIBLING_NAMES[S.country || 'egy'].f : SIBLING_NAMES[S.country || 'egy'].m;
    const name = names[Math.floor(Math.random() * names.length)];
    const age = Math.max(18, S.age + Math.floor(Math.random() * 8) - 4);
    
    S.partner = {
        name: name,
        age: age,
        bond: 50 + Math.floor(Math.random() * 30),
        source: src.label,
        familyApproval: src.familyApproval
    };
    S.datingStatus = 'dating';
    log('❤️ You started dating ' + name + ' (Age ' + age + ') via ' + src.label + '.');
    familyLog('Started dating ' + name);
    fx({happiness: 10});
    render();
}

function familyBreakup() {
    if(!confirm('Are you sure you want to break up with ' + S.partner.name + '?')) return;
    S.exes.push({ name: S.partner.name, reason: 'Broke up while dating' });
    log('💔 You broke up with ' + S.partner.name + '.');
    familyLog('Broke up with ' + S.partner.name);
    S.partner = null;
    S.datingStatus = 'single';
    S.weddingPlan = null;
    fx({happiness: -15});
    render();
}

function familyPartnerAction(action) {
    const costLocal = action === 'gift' ? 500 * getExchangeRate() : 100 * getExchangeRate();
    if(S.wealth < costLocal) { log('Not enough cash.'); return; }
    S.wealth -= costLocal;
    const boost = action === 'gift' ? 8 : 4;
    S.partner.bond = Math.min(100, S.partner.bond + boost);
    fx({happiness: 3});
    log('❤️ Spent time/' + action + ' with ' + S.partner.name + '. Bond +' + boost + '.');
    render();
}

function familyOpenProposal() {
    S.weddingPlan = { shabka: 'standard', mahr: 'standard', tier: 'mid_hotel', finance: 'egalitarian_50_50' };
    render();
}
function familyWeddingSet(key, val) {
    if(S.weddingPlan) S.weddingPlan[key] = val;
    render();
}

function renderWeddingPlanner() {
    const plan = S.weddingPlan;
    if(!plan) return '';
    const trad = MARRIAGE_TRADITIONS[S.country] || MARRIAGE_TRADITIONS.egy;
    const isWestern = !trad.mahr;

    let html = '<div class="card" style="border-color:#fb7185;margin-top:10px"><h3 style="color:#fb7185">💍 Plan Proposal & Wedding</h3>';

    if(!isWestern) {
        html += '<h4 style="font-size:.8rem;color:#fb7185;margin-top:10px">Shabka (Gold/Ring)</h4><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">';
        Object.keys(trad.shabka).forEach(k => {
            const item = trad.shabka[k];
            const cLocal = item.cost * getExchangeRate();
            html += '<button class="pill ' + (plan.shabka === k ? 'on' : '') + '" style="padding:6px;font-size:.65rem" onclick="familyWeddingSet(\'shabka\',\'' + k + '\')">' + item.label + '<br>' + money(cLocal) + '</button>';
        });
        html += '</div>';

        html += '<h4 style="font-size:.8rem;color:#fb7185;margin-top:10px">Mahr (Dowry)</h4><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">';
        Object.keys(trad.mahr).forEach(k => {
            const item = trad.mahr[k];
            const cLocal = item.cost * getExchangeRate();
            html += '<button class="pill ' + (plan.mahr === k ? 'on' : '') + '" style="padding:6px;font-size:.65rem" onclick="familyWeddingSet(\'mahr\',\'' + k + '\')">' + item.label + '<br>' + money(cLocal) + '</button>';
        });
        html += '</div>';
    }

    html += '<h4 style="font-size:.8rem;color:#fb7185;margin-top:10px">Wedding Ceremony</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
    WEDDING_TIERS.forEach(t => {
        const cLocal = t.costUSD * getExchangeRate();
        html += '<button class="pill ' + (plan.tier === t.id ? 'on' : '') + '" style="padding:6px;font-size:.65rem" onclick="familyWeddingSet(\'tier\',\'' + t.id + '\')">' + t.label + '<br>' + money(cLocal) + '</button>';
    });
    html += '</div>';

    html += '<h4 style="font-size:.8rem;color:#fb7185;margin-top:10px">Post-Marriage Finance</h4><select onchange="familyWeddingSet(\'finance\', this.value)" style="width:100%;padding:6px;background:#0f0f1a;color:#fff;border:1px solid #25253a">';
    FAMILY_MARRIAGE_FINANCE_MODELS.forEach(m => {
        html += '<option value="' + m.id + '" ' + (plan.finance === m.id ? 'selected' : '') + '>' + m.label + '</option>';
    });
    html += '</select>';

    let totalLocal = 0;
    if(!isWestern) {
        totalLocal += trad.shabka[plan.shabka].cost * getExchangeRate();
        totalLocal += trad.mahr[plan.mahr].cost * getExchangeRate();
    }
    const wedTier = WEDDING_TIERS.find(t=>t.id === plan.tier);
    totalLocal += wedTier.costUSD * getExchangeRate();

    const canAfford = S.wealth >= totalLocal;

    html += '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">';
    html += '<div class="row"><b>Total Wedding Cost</b><b style="color:#fb7185">' + money(totalLocal) + '</b></div>';
    html += '<p class="muted small">As the groom, you typically bear these upfront costs in traditional settings. If playing as a woman, this may represent your family\'s contribution or shared costs.</p>';
    html += '</div>';

    html += '<button class="opt" style="margin-top:10px;text-align:center;background:' + (canAfford ? '#fb7185' : '#25253a') + ';color:' + (canAfford ? '#fff' : '#666') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="familyConfirmWedding(' + totalLocal + ')">Confirm Marriage</button>';

    html += '</div>';
    return html;
}

function familyConfirmWedding(totalCost) {
    if(S.wealth < totalCost) return;
    S.wealth -= totalCost;
    
    const wedTier = WEDDING_TIERS.find(t=>t.id === S.weddingPlan.tier);
    const financeModel = FAMILY_MARRIAGE_FINANCE_MODELS.find(m=>m.id === S.weddingPlan.finance).label;

    S.partner.financeModel = financeModel;
    S.partner.bond = 100;
    S.datingStatus = 'married';
    S.weddingPlan = null;

    fx({happiness: 30, social: wedTier.socialBoost});
    log('💍 You married ' + S.partner.name + ' in a ' + wedTier.label + '!');
    familyLog('Married ' + S.partner.name);
    render();
}

function familyDivorce() {
    const isWestern = S.country === 'usa' || S.country === 'uk' || S.country === 'can' || S.country === 'deu';
    let assetSplit = 0;
    
    if(isWestern) {
        assetSplit = Math.floor(S.wealth / 2);
    } else {
        assetSplit = Math.floor(S.wealth * 0.15); // Nafaqa/Mut'ah approximation
    }

    if(!confirm('Divorcing ' + S.partner.name + ' will cost you approximately ' + money(assetSplit) + ' in legal/settlement fees. Proceed?')) return;

    S.wealth -= assetSplit;
    S.exes.push({ name: S.partner.name, reason: 'Divorced. Cost: ' + money(assetSplit) });
    
    log('💔 You divorced ' + S.partner.name + '. Asset split/alimony cost: ' + money(assetSplit) + '.');
    familyLog('Divorced ' + S.partner.name);
    
    S.partner = null;
    S.datingStatus = 'single';
    fx({happiness: -30});
    render();
}

/* ============================================================
   TAB 3: CHILDREN
   ============================================================ */
function renderChildrenTab() {
    let html = '';

    if (S.datingStatus !== 'married' && S.childrenList.length === 0) {
        return '<div class="card"><h3>Children</h3><p class="muted small">You need a partner to have children traditionally in this simulation.</p></div>';
    }

    if(S.pregnantMonths > 0) {
        html += '<div class="card" style="border-color:#fbbf24;background:#fbbf2415"><h3 style="color:#fbbf24">👶 Expecting!</h3>' +
                '<p>Pregnancy is at ' + S.pregnantMonths + ' months. The baby will arrive soon.</p></div>';
    }

    if (S.childrenList.length > 0) {
        html += '<div class="card"><h3>Your Children</h3>';
        S.childrenList.forEach(c => {
            const schTier = Object.values(CHILD_EXPENSE_TIERS.schooling).find(s => s.label === c.school) || CHILD_EXPENSE_TIERS.schooling.public;
            const costLocal = (schTier.annualUSD || 0) * getExchangeRate();
            
            html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
                    '<div class="row"><b>' + c.name + ' (' + c.gender.toUpperCase() + ')</b><span>Age ' + c.age + '</span></div>' +
                    '<div class="muted small">School: ' + c.school + ' (' + money(costLocal) + '/yr)</div>';
            
            if(c.age >= 4 && c.age <= 18) {
                html += '<select onchange="familyChangeSchool(\'' + c.id + '\', this.value)" style="margin-top:6px;width:100%;padding:4px;background:#0f0f1a;color:#fff;border:1px solid #25253a;font-size:.75rem">';
                Object.keys(CHILD_EXPENSE_TIERS.schooling).forEach(sk => {
                    const st = CHILD_EXPENSE_TIERS.schooling[sk];
                    html += '<option value="' + st.label + '" ' + (c.school === st.label ? 'selected' : '') + '>' + st.label + ' - ' + money(st.annualUSD * getExchangeRate()) + '/yr</option>';
                });
                html += '</select>';
            }
            html += '</div>';
        });
        html += '</div>';
    }

    if (S.datingStatus === 'married' && S.pregnantMonths === 0) {
        html += '<div class="card"><h3>Family Planning</h3>';
        
        const ageToUse = S.gender === 'f' ? S.age : (S.partner ? S.partner.age : S.age);
        const fert = FERTILITY_RATES.find(f => ageToUse >= f.minAge && ageToUse <= f.maxAge) || FERTILITY_RATES[FERTILITY_RATES.length-1];
        
        html += '<div class="row"><span>Estimated Fertility Chance</span><b style="color:' + (fert.baseChance > 0.5 ? '#34d399' : '#fb7185') + '">' + Math.round(fert.baseChance*100) + '%</b></div>';
        html += '<button class="opt" style="margin-top:10px;text-align:center" onclick="familyTryBaby()">Try for Baby (Natural)</button>';
        
        const ivfCostLocal = 8000 * getExchangeRate();
        html += '<button class="opt" style="margin-top:6px;text-align:center" onclick="familyIVF()">IVF Treatment (' + money(ivfCostLocal) + ', ' + Math.round(fert.ivfSuccess*100) + '% chance)</button>';
        html += '</div>';
    }

    return html;
}

function familyTryBaby() {
    if(S.pregnantMonths > 0) { log('Already expecting!'); return; }
    const ageToUse = S.gender === 'f' ? S.age : (S.partner ? S.partner.age : S.age);
    const fert = FERTILITY_RATES.find(f => ageToUse >= f.minAge && ageToUse <= f.maxAge) || FERTILITY_RATES[FERTILITY_RATES.length-1];

    if(Math.random() < fert.baseChance) {
        S.pregnantMonths = 1;
        log('🎉 Success! You and ' + S.partner.name + ' are expecting a baby.');
        familyLog('Partner became pregnant');
        fx({happiness: 20});
    } else {
        log('No luck this month trying for a baby. Try again later.');
        fx({happiness: -2});
    }
    render();
}

function familyIVF() {
    if(S.pregnantMonths > 0) return;
    const ivfCostLocal = 8000 * getExchangeRate();
    if(S.wealth < ivfCostLocal) { log('Not enough cash for IVF.'); return; }
    S.wealth -= ivfCostLocal;

    const ageToUse = S.gender === 'f' ? S.age : (S.partner ? S.partner.age : S.age);
    const fert = FERTILITY_RATES.find(f => ageToUse >= f.minAge && ageToUse <= f.maxAge) || FERTILITY_RATES[FERTILITY_RATES.length-1];

    if(Math.random() < fert.ivfSuccess) {
        S.pregnantMonths = 1;
        log('🎉 The IVF was successful! Expecting a baby.');
        familyLog('Successful IVF');
        fx({happiness: 25});
    } else {
        log('😔 The IVF cycle failed. Cost: ' + money(ivfCostLocal));
        familyLog('Failed IVF');
        fx({happiness: -10});
    }
    render();
}

function familyChangeSchool(childId, schoolLabel) {
    const c = S.childrenList.find(x => x.id === childId);
    if(c) {
        c.school = schoolLabel;
        log('🏫 ' + c.name + ' is now enrolled in ' + schoolLabel + '.');
    }
    render();
}

/* ============================================================
   TAB 4: MEDICAL & HEALTH
   ============================================================ */
function renderMedicalTab() {
  /* Use the same insurance data as the Medical tab — single source of truth */
  const currentIns = (typeof MED_INSURANCE !== 'undefined')
    ? MED_INSURANCE.find(function(i) { return i.id === S.medical.insurance; }) || MED_INSURANCE[0]
    : { label: 'Unknown', coveragePct: 0, premiumAnnualEGP: 0 };

  const conditions = S.medical.conditions || [];
  const monthlyMeds = (S.medical.medications || []).reduce(function(s, md) {
    const def = (typeof MED_MEDICATIONS !== 'undefined') ? MED_MEDICATIONS.find(function(d) { return d.id === md.id; }) : null;
    return s + (def ? (def.monthlyEGP || 0) : 0);
  }, 0);

  let html = '<div class="card" style="border-color:#34d399">' +
    '<h3 style="color:#34d399">🏥 Health & Insurance</h3>' +
    '<div class="row"><span>Current health</span><b class="' + (S.health > 70 ? 'good' : S.health > 40 ? '' : 'bad') + '">' + Math.round(S.health) + '%</b></div>' +
    '<div class="row"><span>Insurance plan</span><b class="' + (currentIns.coveragePct > 0 ? 'good' : 'bad') + '">' + currentIns.label + ' · ' + Math.round((currentIns.coveragePct || 0) * 100) + '% covered</b></div>' +
    (conditions.length ? '<div class="row"><span>Active conditions</span><b>' + conditions.length + '</b></div>' : '<div class="row"><span>Active conditions</span><b class="good">None</b></div>') +
    (monthlyMeds > 0 ? '<div class="row"><span>Medications</span><b>' + (typeof money === 'function' ? money(monthlyMeds * ((C().rate || 1) / 52.7)) : monthlyMeds) + '/mo</b></div>' : '') +
    '</div>';

  if (conditions.length > 0) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#fb7185">Active Conditions</h4>';
    conditions.forEach(function(c) {
      const cond = (typeof medConditionById === 'function') ? medConditionById(c.id) : null;
      if (cond) {
        html += '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + cond.label + '</span><b class="muted small">' + cond.severity + '</b></div>';
      }
    });
    html += '</div>';
  }

  html += '<div class="card"><p class="muted small">All medical management (doctors, tests, treatments, insurance, fertility) is in the dedicated <b>🏥 Medical</b> tab.</p>' +
    '<button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;font-size:.78rem" onclick="switchTab(\'medical\')">Open Medical tab →</button>' +
    '</div>';

  return html;
}

function medicalChangeInsurance(insId) {
  if (!S.medical) return;
  if (typeof MED_INSURANCE === 'undefined') return;
  const ins = MED_INSURANCE.find(function(i) { return i.id === insId; });
  if (!ins) return;
  if (typeof medSwitchInsurance === 'function') {
    medSwitchInsurance(insId);
  } else {
    S.medical.insurance = insId;
    log('🏥 Insurance changed to ' + ins.label + '.');
    render();
  }
}

function medicalTreat(condId, treatmentId) {
    const treat = MEDICAL_TREATMENTS.find(t => t.id === treatmentId);
    if(!treat) return;
    const cost = getMedicalCost(treat.costUSD);
    
    if(S.wealth < cost) { log('Not enough cash to cover the medical bill (' + money(cost) + ').'); return; }
    S.wealth -= cost;
    
    if(treat.effectiveness) {
        if(Math.random() < treat.effectiveness) {
            S.medical.conditions = S.medical.conditions.filter(c => c !== condId);
            log('✅ Treatment successful! You recovered from the condition.');
            fx({health: 20, happiness: 10});
        } else {
            log('Treatment helped, but the condition persists.');
            fx({health: 5});
        }
    } else if (treat.cureChance) {
        if(Math.random() < treat.cureChance) {
            S.medical.conditions = S.medical.conditions.filter(c => c !== condId);
            log('✅ Incredible news! The ' + treat.label + ' worked. You are cured.');
            fx({health: 50, happiness: 50});
        } else {
            log('The treatment extended your life, but the condition remains.');
            fx({health: 10});
        }
    } else {
        log('Received ' + treat.label + '.');
        fx({health: 10});
    }
    render();
}

/* ============================================================
   TAB 5: VACATION
   ============================================================ */
function renderVacationTab() {
    let html = '<div class="card"><h3>✈️ Vacations</h3><p class="muted small">Take a break to reduce stress and increase happiness.</p>';
    html += '<div class="row"><span>Vacation Days Left</span><b>' + (S.vacationDays - S.vacationDaysUsedThisYear) + ' / ' + S.vacationDays + '</b></div>';
    
    const pp = PASSPORT_STRENGTH[S.country] || PASSPORT_STRENGTH.egy;

    html += '<h4 style="font-size:.85rem;color:#3b82f6;margin-top:10px">Local / Easy Access</h4>';
    VACATION_DESTINATIONS.egypt_local.forEach(dest => {
        const costLocal = dest.costPerDayUSD * getExchangeRate();
        html += '<button class="opt" style="margin-top:6px;width:100%;text-align:left" onclick="vacationBook(\'' + dest.id + '\', false, ' + costLocal + ')">' + dest.label + ' - ' + money(costLocal) + '/day</button>';
    });

    html += '<h4 style="font-size:.85rem;color:#3b82f6;margin-top:10px">International</h4>';
    VACATION_DESTINATIONS.abroad.forEach(dest => {
        const costLocal = dest.costPerDayUSD * getExchangeRate();
        const needsVisa = dest.visaRequired && (
            (dest.id === 'europe_schengen' && pp.shengenRequiresVisa) ||
            (dest.id === 'usa' && pp.usRequiresVisa)
        );
        const visaStr = needsVisa ? ' <span style="color:#fb7185">(Visa Req)</span>' : '';
        html += '<button class="opt" style="margin-top:6px;width:100%;text-align:left" onclick="vacationBook(\'' + dest.id + '\', ' + needsVisa + ', ' + costLocal + ')">' + dest.label + visaStr + ' - ' + money(costLocal) + '/day + Flights</button>';
    });

    html += '</div>';
    return html;
}

function vacationBook(destId, needsVisa, costPerDayLocal) {
    const daysStr = prompt('How many days do you want to go for?');
    const days = parseInt(daysStr);
    if(isNaN(days) || days <= 0) return;

    if(S.vacationDaysUsedThisYear + days > S.vacationDays) {
        log('❌ You don\'t have enough vacation days approved by your manager.');
        return;
    }

    let totalCost = days * costPerDayLocal;
    const dest = VACATION_DESTINATIONS.abroad.find(d => d.id === destId);
    if(dest) totalCost += 800 * getExchangeRate();

    if(S.wealth < totalCost) {
        log('❌ Not enough cash. Need ' + money(totalCost) + '.');
        return;
    }

    if(needsVisa) {
        let visaChance = 0.3;
        if(S.wealth > 10000 * getExchangeRate()) visaChance += 0.3;
        if(S.job) visaChance += 0.3;
        
        if(Math.random() > visaChance) {
            log('🛑 Visa Application Denied. You lost the application fees.');
            S.wealth -= 150 * getExchangeRate();
            fx({happiness: -5});
            render();
            return;
        }
        log('🛂 Visa Approved!');
    }

    S.wealth -= totalCost;
    S.vacationDaysUsedThisYear += days;
    
    log('✈️ You took a ' + days + '-day vacation to ' + (dest ? dest.label : destId) + ' for ' + money(totalCost) + '.');
    fx({happiness: days * 3, health: days});
    render();
}
function renderFamilySupportTab() {
  if (!S || !S.family) return '';

  let html = '';

  /* Cross-link to Expat Life */
  html += '<div class="card" style="border-color:#22d3ee;background:#22d3ee10">' +
    '<h3 style="color:#22d3ee;margin:0">💸 Family Support</h3>' +
    '<p class="muted small" style="margin-top:6px">Manage allowances, gifts, and family visit visas from here. For gold savings, hawala, and return planning, see <b>Career → Expat Life</b>.</p>' +
    '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.72rem;background:#22d3ee20;border-color:#22d3ee" onclick="switchTab(\'career\');setTimeout(function(){S.career.tab=\'expat\';render();},50)">📊 Open Expat Life dashboard →</button>' +
    '</div>';

  /* Family visits, gifts, allowances — the existing system from 35-family-visits.js */
  if (typeof familyVisitsRender === 'function') {
    html += familyVisitsRender();
  }

  return html;
}
/* ============================================================
   YEAR TICK LOGIC
   ============================================================ */
GameHooks.on('year', function() {
  ensureFamilyState();
  if (!S) return;
  const year = gameYear();
  const tier = resolveFamilyTier(S.familyTier);
  const tierCfg = FAMILY_TIERS[tier] || FAMILY_TIERS.middle;

  if (S.job) {
    S.vacationDays = 21;
    S.vacationDaysUsedThisYear = 0;
  }

  /* ===== PREGNANCY & CHILDREN ===== */
  if(S.pregnantMonths > 0) {
      S.pregnantMonths += 12; 
      S.pregnantMonths = 0;
      
      const gender = Math.random() < 0.5 ? 'm' : 'f';
      const names = SIBLING_NAMES[S.country || 'egy'][gender];
      const name = names[Math.floor(Math.random() * names.length)];
      
      S.childrenList.push({
          id: 'child_' + Math.random().toString(36).slice(2, 8),
          name: name,
          gender: gender,
          age: 0,
          school: 'Public School'
      });
      
      const hosp = MATERNITY_HOSPITALS[1];
      const cost = getMedicalCost(hosp.costUSD);
      if(S.wealth >= cost) S.wealth -= cost;
      
      log('🍼 Baby ' + name + ' was born! Hospital cost: ' + money(cost));
      familyLog('Baby ' + name + ' born');
      fx({happiness: 30});
  }

  S.childrenList.forEach(c => {
      c.age += 1;
      const schTier = Object.values(CHILD_EXPENSE_TIERS.schooling).find(s => s.label === c.school);
      if(schTier && c.age >= 4 && c.age <= 18) {
          const costLocal = schTier.annualUSD * getExchangeRate();
          if(S.wealth >= costLocal) {
              S.wealth -= costLocal;
          } else {
              log('⚠️ Could not afford school fees for ' + c.name + '. Moved to Public School.');
              c.school = 'Public School';
          }
      }
      
      const livingCostLocal = 200 * 12 * getExchangeRate();
      if(S.wealth >= livingCostLocal) S.wealth -= livingCostLocal;
  });

  /* ===== SPOUSE & DATING ===== */
  if(S.partner) {
      S.partner.bond -= 5;
      if(S.datingStatus === 'married' && S.partner.bond < 20 && Math.random() < 0.1) {
          log('💔 ' + S.partner.name + ' asked for a divorce due to a low relationship bond.');
          familyDivorce();
      }
  }

  /* ===== MEDICAL ===== */
  const ins = MEDICAL_INSURANCE_TIERS.find(i => i.id === S.medical.insurance) || MEDICAL_INSURANCE_TIERS[0];
  if(ins.premiumUSD > 0) {
      const premLocal = ins.premiumUSD * getExchangeRate();
      if(S.wealth >= premLocal) S.wealth -= premLocal;
      else S.medical.insurance = 'none';
  }

  if(S.age > 30 && Math.random() < 0.05) {
      const cond = MEDICAL_CONDITIONS[Math.floor(Math.random() * MEDICAL_CONDITIONS.length)];
      if(!S.medical.conditions.includes(cond.id)) {
          S.medical.conditions.push(cond.id);
          log('🏥 You were diagnosed with ' + cond.label + '. See the Health tab for treatments.');
          fx({health: -(cond.healthDrop || 10), happiness: -20});
      }
  }

  /* ===== EXTENDED RELATIVES (Parents & Siblings) ===== */
  familyParents().forEach(function(p) {
    if (p.alive === false) return;
    const bracket = PARENT_HEALTH_DECAY.find(function(b) { return p.age >= b.minAge && p.age <= b.maxAge; });
    if (bracket && bracket.decay > 0) p.health = Math.max(0, (p.health || 100) - bracket.decay);
    if (p.lastContactYear === null || (year - p.lastContactYear) >= CONTACT_DECAY_THRESHOLD_YEARS) {
      p.bond = Math.max(0, (p.bond || 70) - CONTACT_DECAY_AMOUNT);
    }

    const deathBracket = PARENT_DEATH_CHANCE.find(function(b) { return p.age >= b.minAge && p.age <= b.maxAge; });
    if (deathBracket) {
      let chance = deathBracket.chance;
      if ((p.health || 100) < 30) chance *= 2;
      if (Math.random() < chance) { familyParentDies(p); return; }
    }

    if ((p.bond || 70) < 20) return;

    PARENT_REQUEST_TEMPLATES.forEach(function(tpl) {
      if (p.age < tpl.minAge || p.age > tpl.maxAge) return;
      if (tpl.oncePerLife && tpl.kind === 'retirement' && p.retirementRequested) return;
      if ((S.familyRequests || []).some(function(r) { return r.memberId === p.id; })) return;

      const traitObj = PERSONALITY_TRAITS[p.trait] || PERSONALITY_TRAITS.balanced;
      const demandMult = traitObj.demandMult || 1.0;
      const chance = tpl.chance * tierCfg.requestChanceMult * demandMult;
      
      if (Math.random() >= chance) return;
      if (tpl.oncePerLife && tpl.kind === 'retirement') p.retirementRequested = true;

      const amountUSD = Math.floor(tpl.amountUSD[0] + Math.random() * (tpl.amountUSD[1] - tpl.amountUSD[0]));
      const reason = tpl.reasons ? tpl.reasons[Math.floor(Math.random() * tpl.reasons.length)] : '';
      const message = tpl.message.replace('{name}', p.name).replace('{amount}', money(amountUSD * getExchangeRate())).replace('{reason}', reason);

      S.familyRequests.push({
        id: 'req_' + Math.random().toString(36).slice(2, 8),
        memberId: p.id, memberName: p.name, memberRole: p.role,
        kind: tpl.kind, amount: amountUSD, perMonth: tpl.perMonth === true,
        shareable: tpl.shareable === true, message: message, createdYear: year
      });
      log('📨 ' + message);
    });
  });

  familySiblings().forEach(function(sib) {
    if (sib.lastContactYear === null || (year - sib.lastContactYear) >= CONTACT_DECAY_THRESHOLD_YEARS) {
      sib.bond = Math.max(0, (sib.bond || 70) - CONTACT_DECAY_AMOUNT);
    }
    if (sib.lifeStage === 'toddler' && sib.age >= SIBLING_MILESTONES.schoolStart) sib.lifeStage = 'student';
    if (sib.lifeStage === 'student' && sib.age >= SIBLING_MILESTONES.uniStart) sib.lifeStage = 'uni';
    if (sib.lifeStage === 'uni' && sib.age >= SIBLING_MILESTONES.workStart) { sib.lifeStage = 'working'; }

    sib.justMarried = false;
    if (sib.lifeStage === 'working' && !sib.spouse && sib.age >= SIBLING_MILESTONES.marryMin && sib.age <= SIBLING_MILESTONES.marryMax && Math.random() < SIBLING_WEDDING_CHANCE) {
      const pool = SIBLING_NAMES[S.country] || SIBLING_NAMES.egy;
      const otherGender = sib.gender === 'm' ? 'f' : 'm';
      sib.spouse = { name: pool[otherGender][Math.floor(Math.random() * pool[otherGender].length)] };
      sib.lifeStage = 'married';
      sib.justMarried = true;
    }

    if ((sib.lifeStage === 'married' || sib.lifeStage === 'parent') && sib.age >= SIBLING_MILESTONES.childMin && sib.age <= SIBLING_MILESTONES.childMax && Math.random() < SIBLING_CHILD_CHANCE) {
      sib.children = (sib.children || 0) + 1;
      sib.lifeStage = 'parent';
    }

    if ((sib.bond || 70) < 20) return;
    SIBLING_REQUEST_TEMPLATES.forEach(function(tpl) {
      if (sib.age < tpl.minAge || sib.age > tpl.maxAge) return;
      if (tpl.onlyIfStage && tpl.onlyIfStage.indexOf(sib.lifeStage) < 0) return;
      if (tpl.onlyJustMarried && !sib.justMarried) return;
      if ((S.familyRequests || []).some(function(r) { return r.memberId === sib.id; })) return;
      
      const traitObj = PERSONALITY_TRAITS[sib.trait] || PERSONALITY_TRAITS.balanced;
      const chance = tpl.chance * (traitObj.demandMult || 1.0);
      if (Math.random() >= chance) return;

      const amountUSD = Math.floor(tpl.amountUSD[0] + Math.random() * (tpl.amountUSD[1] - tpl.amountUSD[0]));
      const message = tpl.message.replace('{name}', sib.name).replace('{amount}', money(amountUSD * getExchangeRate()));
      S.familyRequests.push({
        id: 'req_' + Math.random().toString(36).slice(2, 8),
        memberId: sib.id, memberName: sib.name, memberRole: sib.role,
        kind: tpl.kind, amount: amountUSD, perMonth: tpl.perMonth === true,
        shareable: false, message: message, createdYear: year
      });
      log('📨 ' + message);
    });
  });

  if (!(typeof isMonthly === 'function' && isMonthly())) {
    const totalMonthly = Object.values(S.parentAllowances || {}).reduce(function(s, v) { return s + v; }, 0);
    if (totalMonthly > 0) {
      const yearly = totalMonthly * 12;
      if (S.wealth >= yearly) {
        S.wealth -= yearly;
        log('💰 Paid ' + money(yearly) + ' in parent allowances this year.');
      } else {
        log('⚠️ Could not afford parent allowances (' + money(yearly) + '). Bond may suffer.');
        familyLivingParents().forEach(function(p) {
          if (S.parentAllowances[p.id]) familyAddBond(p, -5);
        });
      }
    }
  }
});

function familyParentDies(p) {
  p.alive = false;
  p.deathYear = gameYear();
  p.bond = 0;

  const funeralCost = FUNERAL_COSTS[familyHomeCountry()] || 30000;
  if (S.wealth >= funeralCost) {
    S.wealth -= funeralCost;
    log('🕊 ' + p.name + ' passed away. Funeral cost: ' + money(funeralCost) + '.');
  } else {
    log('🕊 ' + p.name + ' passed away. You could not afford the funeral (' + money(funeralCost) + ').');
  }
  familyLog('🕊 ' + p.name + ' passed away');
  fx({ happiness: -20, health: -5 });

  const children = (S.family || []).filter(function(m) { return m.isSibling === true && m.alive !== false; });
  const totalChildren = 1 + children.length;
  const perChild = Math.floor((p.wealth || 0) / totalChildren);
  if (perChild > 0) {
    S.wealth += perChild;
    log('💰 Inherited ' + money(perChild) + ' from ' + p.name + ' (split with ' + children.length + ' sibling(s)).');
    children.forEach(function(sib) { sib.wealth = (sib.wealth || 0) + perChild; });
  }

  const livingParentsAfter = familyLivingParents();
  if (livingParentsAfter.length === 0 && !S.inheritedFamilyHome) {
    const homeValueUSD = Math.max(50000, (p.wealth || 0) / getExchangeRate() * 3);
    S.inheritedFamilyHome = {
      valueUSD: homeValueUSD,
      myPct: 1 / totalChildren,
      shares: children.map(function(sib) { return { siblingId: sib.id, pct: 1 / totalChildren }; })
    };
    familyLog('🏠 Inherited family home share');
    log('🏠 You inherited ' + Math.round(100 / totalChildren) + '% of the family home.');
  }
}

/* ---------- REQUEST ACTIONS ---------- */
function familyPayRequest(requestId) {
  ensureFamilyState();
  const idx = S.familyRequests.findIndex(function(r) { return r.id === requestId; });
  if (idx < 0) return;
  const r = S.familyRequests[idx];
  const amtLocal = (r.amount || 0) * getExchangeRate();
  const totalAmount = r.perMonth ? amtLocal * 12 : amtLocal;
  
  if (S.wealth < totalAmount) { log('Not enough cash for ' + money(totalAmount) + '.'); render(); return; }
  S.wealth -= totalAmount;

  if (r.perMonth) {
    S.parentAllowances[r.memberId] = (S.parentAllowances[r.memberId] || 0) + r.amount;
    log('💵 You committed ' + money(amtLocal) + '/month to help ' + r.memberName + '.');
  } else {
    log('💵 You paid ' + money(amtLocal) + ' for ' + r.memberName + "'s " + r.kind + '.');
  }

  const m = familyById(r.memberId);
  if (m) { familyAddBond(m, FAMILY_BOND_BONUSES.helpMoney); familyMarkContact(m); }
  fx({ happiness: 3 });
  S.familyRequests.splice(idx, 1);
  render();
}

function familyShareRequest(requestId) {
  ensureFamilyState();
  const idx = S.familyRequests.findIndex(function(r) { return r.id === requestId; });
  if (idx < 0) return;
  const r = S.familyRequests[idx];
  const siblings = familySiblings();
  if (!siblings.length) { familyPayRequest(requestId); return; }

  const amtLocal = (r.amount || 0) * getExchangeRate();
  const totalAmount = r.perMonth ? amtLocal * 12 : amtLocal;
  const totalPeople = 1 + siblings.length;
  const myShare = Math.round(totalAmount / totalPeople);
  
  if (S.wealth < myShare) { log('Not enough cash for your share (' + money(myShare) + ').'); render(); return; }
  S.wealth -= myShare;

  log('💵 Shared cost with siblings. You paid ' + money(myShare) + '.');
  if (r.perMonth) {
    S.parentAllowances[r.memberId] = (S.parentAllowances[r.memberId] || 0) + Math.round(r.amount / totalPeople);
  }

  const m = familyById(r.memberId);
  if (m) { familyAddBond(m, FAMILY_BOND_BONUSES.shareHelp); familyMarkContact(m); }
  S.familyRequests.splice(idx, 1);
  render();
}

function familyDeclineRequest(requestId) {
  ensureFamilyState();
  const idx = S.familyRequests.findIndex(function(r) { return r.id === requestId; });
  if (idx < 0) return;
  const r = S.familyRequests[idx];
  const m = familyById(r.memberId);
  if (m) familyAddBond(m, -10);
  fx({ happiness: -2 });
  log('❌ You declined ' + r.memberName + "'s request.");
  S.familyRequests.splice(idx, 1);
  render();
}

/* ---------- BUY/SELL INHERITED HOME ---------- */
function familyBuySiblingShare(siblingId) {
  if (!S.inheritedFamilyHome) return;
  const share = S.inheritedFamilyHome.shares.find(function(s) { return s.siblingId === siblingId; });
  if (!share) return;
  const baseVal = S.inheritedFamilyHome.valueUSD || S.inheritedFamilyHome.value || 0;
  const cost = Math.round(baseVal * share.pct * getExchangeRate());
  if (S.wealth < cost) { log('Need ' + money(cost) + ' to buy this share.'); render(); return; }
  S.wealth -= cost;
  S.inheritedFamilyHome.myPct += share.pct;
  S.inheritedFamilyHome.shares = S.inheritedFamilyHome.shares.filter(function(s) { return s.siblingId !== siblingId; });
  log('🏠 Bought sibling\'s share of the family home for ' + money(cost) + '.');
  render();
}
function familySellMyHomeShare() {
  if (!S.inheritedFamilyHome) return;
  const baseVal = S.inheritedFamilyHome.valueUSD || S.inheritedFamilyHome.value || 0;
  const myShareValue = Math.round(baseVal * S.inheritedFamilyHome.myPct * getExchangeRate());
  if (!confirm('Sell your share of the family home for ' + money(myShareValue) + '?')) return;
  S.wealth += myShareValue;
  log('🏠 Sold your share of the family home: ' + money(myShareValue) + '.');
  S.inheritedFamilyHome = null;
  if (S.housing === 'parents') S.housing = 'rented';
  render();
}

/* ---------- GIFTS & OLD BUTTONS ---------- */
function familyCall(memberId) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m || m.alive === false) return;
  familyMarkContact(m);
  familyAddBond(m, FAMILY_BOND_BONUSES.call);
  fx({ happiness: 2 });
  log('📞 You called your ' + m.role.toLowerCase() + ', ' + m.name + '.');
  familyLog('📞 Called ' + m.name);
  render();
}

function familyVisit(memberId) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m || m.alive === false) return;

  /* If player is abroad, "visiting" requires travel */
  const isAbroad = S.homeCountry && S.country !== S.homeCountry;
  if (isAbroad) {
    const homeCountryName = COUNTRIES[S.homeCountry] ? COUNTRIES[S.homeCountry].name : S.homeCountry;
    if (confirm('You live in ' + (C().name || S.country) + '.\nVisiting ' + m.name + ' in ' + homeCountryName + ' requires booking a trip.\n\nOpen Vacations to plan your visit?')) {
      if (typeof vacSetTab === 'function' && S.vacation) {
        S.vacation.tab = 'destinations';
        if (typeof switchTab === 'function') switchTab('vacations');
        else render();
      } else render();
    }
    return;
  }

  familyMarkContact(m);
  familyAddBond(m, FAMILY_BOND_BONUSES.visit);
  fx({ happiness: 4 });
  log('☕ You visited ' + m.name + '.');
  familyLog('☕ Visited ' + m.name);
  render();
}
function familyHelpMoney(memberId, amount) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m || m.alive === false) return;
  if (S.wealth < amount) { log('Not enough cash.'); render(); return; }
  S.wealth -= amount;
  m.wealth = (m.wealth || 0) + amount;
  familyMarkContact(m);
  familyAddBond(m, FAMILY_BOND_BONUSES.helpMoney);
  fx({ happiness: 3 });
  familyLog('💵 Helped ' + m.name + ' with ' + money(amount));
  log('💵 Helped ' + m.name + ' with ' + money(amount) + '.');
  render();
}

function familySendGift(memberId, giftId) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m) return;
  const gift = GIFT_CATALOG.find(function(g) { return g.id === giftId; });
  if (!gift) { log('Unknown gift.'); render(); return; }
  
  const costLocal = gift.cost * getExchangeRate();
  const abroad = !!familyPlayerAbroad();
  const shipCostLocal = abroad ? (((REMITTANCE_COSTS[familyHomeCountry()] || REMITTANCE_COSTS.egy).giftShip || 0) * getExchangeRate()) : 0;
  const total = costLocal + shipCostLocal;
  
  if (S.wealth < total) { log('Not enough cash for ' + money(total) + '.'); render(); return; }
  S.wealth -= total;
  familyAddBond(m, gift.bond);
  familyMarkContact(m);
  fx({ happiness: 2 });
  familyLog('🎁 Sent ' + gift.label + ' to ' + m.name);
  log('🎁 Sent ' + m.name + ' a ' + gift.label + ' for ' + money(total) + '. Bond +' + gift.bond + '.');
  render();
}

function familyOpenGiftPicker(memberId) {
  const options = GIFT_CATALOG.map(function(g) { 
      return g.id + ' = ' + g.label + ' (' + money(g.cost * getExchangeRate()) + ')'; 
  }).join('\n');
  const choice = prompt('Which gift to send?\n\n' + options + '\n\nEnter gift id:', 'phone');
  if (!choice) return;
  familySendGift(memberId, choice.trim());
}

/* ---------- REGISTER TAB & WINDOW EXPORTS ---------- */
GameHooks.registerTab({ id: 'family', label: '❤️ Family', order: 3, view: familyView });

// Expose all UI functions to global window for HTML buttons
window.familySetTab = familySetTab;
window.familyCall = familyCall;
window.familyVisit = familyVisit;
window.familyHelpMoney = familyHelpMoney;
window.familyHelpPrompt = familyHelpPrompt;
window.familySetAllowance = familySetAllowance;
window.familySendRemittance = familySendRemittance;
window.familyPayRequest = familyPayRequest;
window.familyShareRequest = familyShareRequest;
window.familyDeclineRequest = familyDeclineRequest;
window.familyBuySiblingShare = familyBuySiblingShare;
window.familySellMyHomeShare = familySellMyHomeShare;
window.familySendGift = familySendGift;
window.familyOpenGiftPicker = familyOpenGiftPicker;
window.familyDate = familyDate;
window.familyBreakup = familyBreakup;
window.familyPartnerAction = familyPartnerAction;
window.familyOpenProposal = familyOpenProposal;
window.familyWeddingSet = familyWeddingSet;
window.familyConfirmWedding = familyConfirmWedding;
window.familyDivorce = familyDivorce;
window.familyTryBaby = familyTryBaby;
window.familyIVF = familyIVF;
window.familyChangeSchool = familyChangeSchool;
window.medicalChangeInsurance = medicalChangeInsurance;
window.medicalTreat = medicalTreat;
window.vacationBook = vacationBook;
