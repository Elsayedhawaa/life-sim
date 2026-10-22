/* ============================================================
   VIEW: MARRIAGE (Core Logic, Negotiation & Life)
   ============================================================ */

/* ---------- STATE ---------- */
function ensureMarriageState() {
  if (!S) return;
  if (!S.marriage) {
    S.marriage = {
      status: 'single', partner: null, engagement: null, wedding: null,
      financeModel: null, sharedAccountBalance: 0, prenup: null, exSpouses: [],
      datingAttempts: 0, lastDateYear: 0, home: null, homeSetupPaid: false,
      familyPlanning: 'undecided', childcare: null, achievements: [], milestones: [],
      conflictHistory: [], pendingConflict: null, tab: 'overview',
      negotiation: null, eloped: false
    };
  }
  const m = S.marriage;
  if (!Array.isArray(m.exSpouses)) m.exSpouses = [];
  if (!Array.isArray(m.achievements)) m.achievements = [];
  if (!Array.isArray(m.milestones)) m.milestones = [];
  if (!Array.isArray(m.conflictHistory)) m.conflictHistory = [];
  if (!m.tab) m.tab = 'overview';

  /* Migrate legacy */
  if (S.spouse && m.status === 'single' && m.partner === null) {
    m.status = 'married';
    m.partner = { name: S.spouse.name, age: S.spouse.age || S.age, gender: S.spouse.gender || (S.gender === 'm' ? 'f' : 'm'), bond: S.spouse.bond || 70, traits: ['kind'], income: S.spouse.income || 0, source: 'legacy', familyApproval: 0.8, metYear: gameYear(), marriedYear: gameYear() };
    m.financeModel = 'male_provider';
  }
}
GameHooks.on('newGame', ensureMarriageState);
GameHooks.on('migrate', ensureMarriageState);

/* ---------- HELPERS ---------- */
function marRate() { return C().rate || 1; }
function marEGP(amountEGP) {
  var localRate = C().rate || 1;
  var countryMult = (typeof MARRIAGE_COUNTRY_MULT !== 'undefined' && MARRIAGE_COUNTRY_MULT[S.country]) || 1.0;
  var adjustedEGP = amountEGP * countryMult;
  if (localRate === 52.7 && countryMult === 1.0) return Math.round(adjustedEGP || 0);
  return Math.round((adjustedEGP || 0) * (localRate / 52.7));
}
function marNamePool(gender) {
  const pool = (typeof MARRIAGE_PARTNER_NAMES !== 'undefined' && MARRIAGE_PARTNER_NAMES[S.country]) || MARRIAGE_PARTNER_NAMES.egy;
  return gender === 'm' ? pool.m : pool.f;
}
function marTrait(id) { return MARRIAGE_PARTNER_TRAITS[id] || null; }
function marBondColor(v) { return v > 70 ? '#34d399' : v > 40 ? '#fbbf24' : '#fb7185'; }
function marCountryProfile() { return (typeof MARRIAGE_COUNTRY_PROFILES !== 'undefined' && MARRIAGE_COUNTRY_PROFILES[S.country]) || null; }

function _marIsArabCulture() { return ['egy', 'sau', 'uae', 'jor', 'lbn'].indexOf(S.country) >= 0; }
function _marSocialTier() { return S.familyTier || 'middle'; }
function _marCheckApartment() { return (S.ownedHomes && S.ownedHomes.some(h => h.status !== 'sold' && h.status !== 'rented')) || S.housing === 'owned'; }
function _marPartnerFamilyStatus() {
  if (!S.marriage.partner.familyWealth) {
    const tiers = ['lower-mid', 'middle', 'upper-mid', 'wealthy'];
    S.marriage.partner.familyWealth = tiers[Math.floor(Math.random() * tiers.length)];
  }
  return S.marriage.partner.familyWealth;
}

function marRollTraits() {
  const positive = ['kind', 'funny', 'romantic', 'calm', 'ambitious', 'religious', 'generous', 'loyal', 'independent', 'family_oriented', 'patient', 'supportive', 'communicative', 'adventurous', 'homebody', 'mature', 'frugal', 'career_focused'];
  const negative = ['grumpy', 'moody', 'pessimistic', 'greedy', 'jealous', 'impulsive', 'extravagant', 'avoidant', 'stubborn', 'insecure'];
  const traits = [];
  for (let i = 0; i < 1 + Math.floor(Math.random() * 2); i++) { const pick = positive[Math.floor(Math.random() * positive.length)]; if (!traits.includes(pick)) traits.push(pick); }
  for (let i = 0; i < Math.floor(Math.random() * 3); i++) { const pick = negative[Math.floor(Math.random() * negative.length)]; if (!traits.includes(pick)) traits.push(pick); }
  if (!traits.length) traits.push('kind');
  return traits;
}

function marFamilyApproval(partner) {
  let a = partner.familyApproval || 0.7;
  if (S.job && S.job.salary > 200000) a += 0.15; else if (!S.job) a -= 0.30;
  if (S.degree) a += 0.10;
  if (Math.abs(S.age - partner.age) > 10) a -= 0.15;
  const prof = marCountryProfile();
  if (prof) a = a * prof.familyInfluence + a * (1 - prof.familyInfluence);
  return Math.max(0.1, Math.min(1.0, a));
}

function marUnlockAchievement(id) {
  const m = S.marriage;
  if (m.achievements.includes(id)) return;
  m.achievements.push(id);
  const ach = (typeof MARRIAGE_ACHIEVEMENTS !== 'undefined') ? MARRIAGE_ACHIEVEMENTS.find(a => a.id === id) : null;
  if (ach) log('🏆 Achievement unlocked: ' + ach.label);
}
function marReachMilestone(id) {
  const m = S.marriage;
  if (m.milestones.includes(id)) return;
  m.milestones.push(id);
  const mil = (typeof MARRIAGE_MILESTONES !== 'undefined') ? MARRIAGE_MILESTONES.find(x => x.id === id) : null;
  if (mil) log('🌟 Milestone: ' + mil.label);
}
function marSetTab(tab) { S.marriage.tab = tab; render(); }
window.marSetTab = marSetTab;

/* ---------- MAIN VIEW ---------- */
function marriageView() {
  ensureMarriageState();
  if (!S || S.age < 16) return '<div class="card"><h3>💍 Marriage</h3><p class="muted">Available from age 16+.</p></div>';

  const m = S.marriage;
  const tabs = [['overview', '📋 Overview'], ['find', '💕 Find'], ['plan', '💍 Plan'], ['life', '🏠 Life'], ['conflict', '⚔️ Conflict'], ['records', '📜 Records']];

  let html = `<div class="card" style="padding:12px;background:linear-gradient(180deg,#fb718515 0%,transparent 100%);border-color:#fb7185">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="muted small" style="letter-spacing:.06em;font-weight:700">MARRIAGE · ${C().name.toUpperCase()}</div>
      <div style="font-weight:700;font-size:1.05rem;margin-top:2px">${marStatusLabel()}</div></div>
      <div style="font-size:2rem">💍</div></div>
    <div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">
      ${tabs.map(t => `<button class="pill ${m.tab === t[0] ? 'on' : ''}" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="marSetTab('${t[0]}')">${t[1]}</button>`).join('')}
    </div></div>`;

  if (m.tab === 'overview') html += marRenderOverview();
  else if (m.tab === 'find') html += marRenderFind();
  else if (m.tab === 'plan') html += marRenderPlan();
  else if (m.tab === 'life') html += marRenderLife();
  else if (m.tab === 'conflict') html += marRenderConflict();
  else if (m.tab === 'records') html += marRenderRecords();
  return html;
}

function marStatusLabel() {
  const m = S.marriage;
  if (m.status === 'single') return 'Single';
  if (m.status === 'dating') return 'Dating ' + (m.partner ? m.partner.name : '');
  if (m.status === 'engaged') return 'Engaged to ' + (m.partner ? m.partner.name : '');
  if (m.status === 'married') return 'Married to ' + (m.partner ? m.partner.name : '');
  if (m.status === 'divorced') return 'Divorced';
  return 'Single';
}

/* ============================================================
   OVERVIEW
   ============================================================ */
function marRenderOverview() {
  const m = S.marriage;
  const prof = marCountryProfile();
  let html = '';

  if (prof) {
    html += `<div class="card" style="border-color:#8b5cf6">
      <div class="muted small" style="letter-spacing:.06em;font-weight:700;color:#8b5cf6">COUNTRY PROFILE · ${prof.label}</div>
      <div class="row" style="margin-top:6px"><span>Family influence</span><b>${Math.round(prof.familyInfluence * 100)}%</b></div>
      <div class="row"><span>Wedding pressure</span><b>${Math.round(prof.weddingPressure * 100)}%</b></div>
      <div class="row"><span>Housing pressure</span><b>${Math.round(prof.housingPressure * 100)}%</b></div>
      <p class="muted small" style="margin-top:8px">${prof.notes}</p>
      <div class="muted small" style="margin-top:6px">Typical concerns: ${prof.typicalConcerns.join(' · ')}</div></div>`;
  }

  if (m.status === 'single') {
    return html + `<div class="card"><h3>💕 You are single</h3><p class="muted small">Head to the Find tab to meet someone.</p>
      <button class="opt" style="margin-top:8px;text-align:center;background:#fb7185;color:#fff;font-weight:700" onclick="marSetTab('find')">Find a partner</button></div>`;
  }

  const p = m.partner;
  if (!p) return html;
  const bond = p.bond || 70;
  const traitsList = (p.traits || []).map(t => { const tt = marTrait(t); return tt ? tt.label : t; });
  const approval = marFamilyApproval(p);

  html += `<div class="card"><h3>Partner</h3>
    <div style="font-weight:700;font-size:1.1rem">${p.name}</div>
    <div class="muted small">Age ${p.age} · Met via ${p.source} ${p.metYear ? '· ' + p.metYear : ''}</div>
    <div class="muted small" style="color:#8b5cf6;margin-top:4px">${traitsList.join(' · ')}</div>
    <div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin-top:10px"><span>Bond</span><span>${bond}%</span></div>
    <div style="height:5px;background:#1a1a2a;border-radius:3px;margin-top:3px"><div style="height:100%;width:${bond}%;background:${marBondColor(bond)};border-radius:3px"></div></div>
    ${m.status !== 'married' ? `<div class="row" style="margin-top:8px"><span>Family approval</span><b class="${approval >= 0.7 ? 'good' : approval >= 0.4 ? '' : 'bad'}">${Math.round(approval * 100)}%</b></div>` : ''}
    ${p.income > 0 ? `<div class="row"><span>Income</span><b>${money(p.income)}/yr</b></div>` : ''}
  </div>`;

  if (S.gender === 'f' && m.status === 'dating' && (gameYear() - p.metYear) >= 2) {
    html += `<div class="card" style="border-color:#fbbf24;background:#fbbf2415">
      <h3 style="color:#fbbf24">⏳ Time is passing...</h3>
      <p class="muted small">You have been dating ${p.name} for ${gameYear() - p.metYear} years. He hasn't proposed yet.</p>
      <button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="marAskWhatAreWe()">💬 Ask him: "What are we?"</button></div>`;
  }

  if (typeof MARRIAGE_RELATIONSHIP_ACTIVITIES !== 'undefined') {
    html += `<div class="card"><h3>💞 Spend Time Together</h3>`;
    if (prof && prof.activities) html += `<p class="muted small" style="margin-bottom:8px">In ${prof.label}: ${prof.activities.slice(0, 3).join(' · ')}</p>`;
    MARRIAGE_RELATIONSHIP_ACTIVITIES.slice(0, 8).forEach(act => {
      html += `<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="marDoActivity('${act.id}')">
        <div style="display:flex;justify-content:space-between"><b>${act.label}</b><span>${money(marEGP(act.costEGP))}</span></div>
        <div class="muted small">Bond +${act.bond} · Happiness +${act.happiness}</div></button>`;
    });
    html += `</div>`;
  }
  return html;
}

window.marAskWhatAreWe = function() {
  const p = S.marriage.partner;
  if (!p) return;
  if (Math.random() < 0.6) {
    log('💍 You confronted ' + p.name + ' about your future. He realized he was taking you for granted and proposed on the spot!');
    S.marriage.status = 'engaged';
    S.marriage.engagement = { proposal: 'a_private', finalized: false };
    fx({ happiness: 15 });
    marStartFatherNegotiation(); 
  } else {
    log('😔 You asked ' + p.name + ' where this is going. He panicked and said he "needs space".');
    p.bond = Math.max(0, p.bond - 15);
    fx({ happiness: -10 });
    if (p.bond < 20) { log('💔 He broke up with you.'); S.marriage.partner = null; S.marriage.status = 'single'; }
  }
  render();
};

/* ============================================================
   FIND
   ============================================================ */
function marRenderFind() {
  const m = S.marriage;
  if (m.status !== 'single' && m.status !== 'divorced') return `<div class="card"><h3>💕 Find a Partner</h3><p class="muted small">You are currently ${m.status}.</p></div>`;
  let html = `<div class="card"><h3>💕 Where to meet someone</h3><p class="muted small">Different sources have different success rates and family approval.</p></div>`;

  MARRIAGE_DATING_SOURCES.forEach(src => {
    const blocked = (S.age < src.minAge || S.age > src.maxAge) || (src.requiresEducation && !S.uni && !S.degree) || (src.requiresJob && !S.job);
    const cost = marEGP(src.cost);
    let reason = (S.age < src.minAge || S.age > src.maxAge) ? 'Age block' : (src.requiresEducation && !S.uni && !S.degree) ? 'Needs education' : (src.requiresJob && !S.job) ? 'Needs a job' : '';

    html += `<div class="card" style="padding:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
      <div style="flex:1"><div style="font-weight:700">${src.label}</div>
      <div class="muted small">${src.desc}</div>
      <div class="muted small">Match ${Math.round(src.matchChance * 100)}% · Family ${Math.round(src.familyApproval * 100)}% · Romance ${Math.round((src.romantic || 0.7) * 100)}%</div></div>
      <div style="text-align:right;flex-shrink:0;margin-left:8px"><b>${money(cost)}</b></div></div>
      ${blocked ? `<div class="bad small" style="margin-top:6px">${reason}</div>` :
        `<button class="opt" style="margin-top:6px;text-align:center;font-size:.75rem;background:#fb7185;color:#fff;font-weight:700" onclick="marTryDate('${src.id}')">Meet someone · ${money(cost)}</button>`}
      </div>`;
  });
  return html;
}

/* ============================================================
   PLAN (Proposal, Negotiation, Wedding Link)
   ============================================================ */
function marRenderPlan() {
  const m = S.marriage;
  if (m.status === 'single') return `<div class="card"><h3>💍 Planning</h3><p class="muted small">Find a partner first.</p></div>`;
  if (m.status === 'married') return `<div class="card"><h3>💍 Planning</h3><p class="muted small">You are already married. See the Married Life tab.</p></div>`;

  const p = m.partner;
  if (!p) return '';
  let html = '';

  if (m.status === 'dating') {
    const bond = p.bond || 0;
    const canPropose = bond >= 40;

    if (S.gender === 'm' || !_marIsArabCulture()) {
      html += `<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">💍 Proposal</h3>`;
      if (!m.engagement) {
        if (!canPropose) html += `<p class="muted small">Bond needs 40%+ before proposing. Currently ${bond}%.</p>`;
        else {
          html += `<p class="muted small">Choose how you want to propose.</p>`;
          const isArab = _marIsArabCulture();
          const props = isArab ? MARRIAGE_CULTURAL_PROPOSALS.arab : MARRIAGE_CULTURAL_PROPOSALS.western;
          props.forEach(opt => {
            html += `<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSelectProposal('${opt.id}')">
              <div style="display:flex;justify-content:space-between"><b>${opt.label}</b><span>${money(marEGP(opt.costEGP))}</span></div>
              <div class="muted small">Romance +${opt.romance} · ${opt.desc}</div></button>`;
          });
        }
      } else {
        html += marRenderNegotiationUI();
      }
      html += `</div>`;
    } else {
      // Arab Female
      html += `<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">💍 Waiting for Proposal</h3>
        <p class="muted small">In your culture, the man initiates the engagement. You must wait for him to propose. If he takes too long, ask him "What are we?" from the Overview tab.</p>
        <button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="marForceMaleProposal()">⏩ Wait for next year (Hope he proposes)</button></div>`;
    }
  }

  if (m.status === 'engaged') {
    if (!m.engagement.finalized) {
      html += `<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">💍 Engagement Negotiation</h3>`;
      html += marRenderNegotiationUI();
      html += `</div>`;
    } else {
      // Once finalized, show the Engagement Review using the new separate file
      if (typeof marRenderEngagementReview === 'function') {
        html += marRenderEngagementReview();
      } else {
        html += `<div class="card"><h3>💍 Engagement Finalized</h3><p class="muted small">Ready for wedding planning.</p></div>`;
      }
    }

    if (m.wedding) {
      html += `<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">🎉 Wedding Planning</h3>`;
      html += (typeof marRenderWeddingPlanner === 'function') ? marRenderWeddingPlanner() : '<p class="muted small">Wedding planner loading...</p>';
      html += `</div>`;
    } else if (m.engagement && m.engagement.finalized) {
      html += `<div class="card"><p class="muted small">Engagement finalized. Now plan the wedding.</p>
        <button class="opt" style="text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="marOpenWeddingPlanner()">Start wedding planning</button></div>`;
    }
    html += `<div class="card"><button class="opt" style="text-align:center;border-color:#fb7185;color:#fb7185" onclick="marCancelEngagement()">Cancel engagement</button></div>`;
  }
  return html;
}

/* ============================================================
   NEGOTIATION LOGIC
   ============================================================ */
function marStartFatherNegotiation() {
  const m = S.marriage;
  const p = m.partner;
  const partnerClass = _marPartnerFamilyStatus();
  const playerClass = _marSocialTier();
  let demands = [];
  let willRefuse = false;
  let refusalReason = '';

  const classTiers = ['poor', 'lower-mid', 'middle', 'upper-mid', 'wealthy', 'ultra'];
  const pClassIdx = classTiers.indexOf(partnerClass);
  const myClassIdx = classTiers.indexOf(playerClass);

  if (pClassIdx - myClassIdx >= 2) {
    willRefuse = true;
    refusalReason = 'Your family is not in the same social class as ours.';
  }

  if (!_marCheckApartment()) {
    demands.push(MARRIAGE_NEGOTIATION_DEMANDS.find(d => d.id === 'apartment'));
  } else if (Math.random() < 0.5) {
    demands.push(MARRIAGE_NEGOTIATION_DEMANDS.find(d => d.id === 'furniture'));
  }

  if (p.traits.includes('traditional') || p.traits.includes('ambitious')) {
    if (Math.random() < 0.6) demands.push(MARRIAGE_NEGOTIATION_DEMANDS.find(d => d.id === 'gold_upgrade'));
    if (Math.random() < 0.4) demands.push(MARRIAGE_NEGOTIATION_DEMANDS.find(d => d.id === 'mahr_upgrade'));
  }

  m.negotiation = { demands, willRefuse, refusalReason };

  if (willRefuse) {
    S.pending = {
      title: '🚫 Proposal Refused by Father',
      text: `You sit down with ${p.name}'s father. He looks at you with disappointment.\n\n"${refusalReason}"\n\nHe refuses the engagement.`,
      choices: [
        { label: 'Try to convince him (Charisma)', effect: function() { marNegotiateConvince(); } },
        { label: 'Elope with ' + p.name, effect: function() { marElope(); } },
        { label: 'Accept the refusal and leave', effect: function() { marBreakupFromRefusal(); } }
      ]
    };
    S.evId = 'mar_refusal_drama';
    return;
  }

  if (demands.length > 0) {
    let demandText = demands.map(d => '• ' + d.desc).join('\n');
    S.pending = {
      title: '🤝 Family Negotiation',
      text: `${p.name}'s father sits you down.\n\n"If you want to marry my daughter, you must meet these conditions:\n\n${demandText}"`,
      choices: [
        { label: 'Agree to the demands', effect: function() { marAcceptDemands(); } },
        { label: 'Negotiate / Refuse', effect: function() { marNegotiateDemands(); } }
      ]
    };
    S.evId = 'mar_negotiation';
  } else {
    log('🤝 The family approves.');
    marFinalizeEngagementCosts();
  }
}

function marNegotiateConvince() {
  if (Math.random() < 0.3) {
    log('🗣 You made an impassioned speech about love and hard work. He was moved.');
    marStartFatherNegotiation();
  } else {
    log('❌ He remained unconvinced. The engagement is off.');
    marBreakupFromRefusal();
  }
}

function marNegotiateDemands() {
  const m = S.marriage;
  if (Math.random() < 0.5) {
    log('🗣 You reasoned with him. He agreed to drop some demands.');
    m.negotiation.demands.pop();
    marStartFatherNegotiation();
  } else {
    log('❌ "My daughter deserves the best! How dare you negotiate her worth?"');
    m.partner.bond = Math.max(0, m.partner.bond - 20);
    marBreakupFromRefusal();
  }
}

function marAcceptDemands() {
  log('🤝 You agreed to all conditions.');
  marFinalizeEngagementCosts();
}

window.marElope = function() {
  const m = S.marriage;
  log('🏃 You and ' + m.partner.name + ' decided to elope!');
  log('💔 Her family is furious. They have cut ties with her.');
  m.partner.familyApproval = 0;
  m.partner.familyCutTies = true;
  m.status = 'engaged';
  m.engagement = { proposal: 'eloped', finalized: true, totalPaid: 0 };
  m.eloped = true;
  fx({ happiness: 10, social: -15 });
  m.partner.bond = Math.min(100, m.partner.bond + 20);
  render();
};

window.marBreakupFromRefusal = function() {
  log('💔 The engagement was called off.');
  S.marriage.partner = null;
  S.marriage.status = 'single';
  S.marriage.engagement = null;
  render();
};

function marFinalizeEngagementCosts() {
  const m = S.marriage;
  m.engagement.finalized = true;
  let totalCostEGP = 0;
  m.negotiation.demands.forEach(d => { totalCostEGP += d.costEGP; });
  
  if (_marIsArabCulture()) {
    totalCostEGP += 30000; // Base Shabka
    totalCostEGP += 20000; // Base Mahr
  }

  const costLocal = marEGP(totalCostEGP);
  m.engagement.totalPaid = totalCostEGP;
  
  if (S.gender === 'm') {
    if (S.wealth < costLocal) { log('❌ You agreed to pay ' + money(costLocal) + ' but you do not have the money!'); S.wealth -= costLocal; }
    else S.wealth -= costLocal;
    log('💸 Paid ' + money(costLocal) + ' for Shabka, Mahr, and family demands.');
  } else {
    log('👑 As the bride, the Shabka and Mahr are provided to you.');
    S.wealth += marEGP(30000);
  }
  log('🎉 Engagement finalized! Check the Plan tab for wedding details.');
}

function marRenderNegotiationUI() {
  return `<p class="muted small">Negotiation in progress. Check your pending events.</p>`;
}

window.marCancelEngagement = function() {
  if (!S.marriage.partner) return;
  if (!confirm('Cancel engagement with ' + S.marriage.partner.name + '?')) return;
  S.marriage.status = 'single'; S.marriage.engagement = null; S.marriage.wedding = null;
  log('💔 Cancelled engagement with ' + S.marriage.partner.name + '.');
  S.marriage.partner = null; fx({ happiness: -20 });
  render();
};

/* ============================================================
   MARRIED LIFE
   ============================================================ */
function marRenderLife() {
  const m = S.marriage;
  if (m.status !== 'married') return `<div class="card"><h3>🏠 Married Life</h3><p class="muted small">Available after you get married.</p></div>`;
  const p = m.partner;
  if (!p) return '';

  let html = `<div class="card"><h3>❤️ Married to ${p.name}</h3>
    <div class="muted small">Age ${p.age} · Married ${p.marriedYear || '?'}</div>
    ${p.income > 0 ? `<div class="row"><span>Partner income</span><b>${money(p.income)}/yr</b></div>` : `<div class="row"><span>Partner income</span><b class="muted">None (home)</b></div>`}
    <div class="row"><span>Finance model</span><b>${(MARRIAGE_FINANCE_MODELS.find(x => x.id === m.financeModel) || {}).label || '—'}</b></div>
    <div class="row"><span>Prenup</span><b>${m.prenup ? m.prenup.type : 'None'}</b></div>
    <div class="row"><span>Shared account</span><b>${money(m.sharedAccountBalance)}</b></div>
    <div class="row"><span>Children</span><b>${(S.childrenList || []).length}</b></div></div>`;

  if (MARRIAGE_HOME_OPTIONS) {
    if (!m.home) {
      html += `<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">🏠 Set up your home</h3><p class="muted small">Where will you live?</p>`;
      MARRIAGE_HOME_OPTIONS.forEach(h => {
        html += `<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSetHome('${h.id}')">
          <div style="display:flex;justify-content:space-between"><b>${h.label}</b><span>${money(marEGP(h.setupCostEGP))} + ${money(marEGP(h.monthlyCostEGP))}/mo</span></div>
          <div class="muted small">${h.desc}</div></button>`;
      });
      html += `</div>`;
    } else {
      const h = MARRIAGE_HOME_OPTIONS.find(x => x.id === m.home);
      html += `<div class="card"><h3>🏠 Home</h3>
        <div class="row"><span>Type</span><b>${h ? h.label : m.home}</b></div>
        <div class="row"><span>Monthly cost</span><b>${money(marEGP(h ? h.monthlyCostEGP : 0))}/mo</b></div>
        <div class="row"><span>Privacy</span><b>${h ? h.privacy + '/10' : '—'}</b></div>
        <div class="row"><span>Family support</span><b>${h ? h.familySupport + '/10' : '—'}</b></div></div>`;
    }
  }

  if (MARRIAGE_FAMILY_PLANNING_OPTIONS) {
    html += `<div class="card"><h3>👶 Family Planning</h3>
      <div class="row"><span>Current plan</span><b>${(MARRIAGE_FAMILY_PLANNING_OPTIONS.find(x => x.id === m.familyPlanning) || {}).label || 'Undecided'}</b></div>`;
    MARRIAGE_FAMILY_PLANNING_OPTIONS.forEach(o => {
      if (m.familyPlanning === o.id) return;
      html += `<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:6px;font-size:.72rem" onclick="marSetFamilyPlanning('${o.id}')">${o.label}<br><span class="muted" style="font-size:.65rem">${o.desc}</span></button>`;
    });
    html += `</div>`;
  }

  if (MARRIAGE_CHILDCARE_OPTIONS && (S.childrenList && S.childrenList.length > 0)) {
    html += `<div class="card"><h3>👶 Childcare</h3>
      <div class="row"><span>Current</span><b>${(MARRIAGE_CHILDCARE_OPTIONS.find(x => x.id === m.childcare) || {}).label || 'None chosen'}</b></div>`;
    MARRIAGE_CHILDCARE_OPTIONS.forEach(o => {
      if (m.childcare === o.id) return;
      html += `<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:6px;font-size:.72rem" onclick="marSetChildcare('${o.id}')">${o.label} · ${money(marEGP(o.monthlyCostEGP))}/mo<br><span class="muted" style="font-size:.65rem">Convenience ${o.convenience}/10</span></button>`;
    });
    html += `</div>`;
  }

  html += `<div class="card"><h3>💰 Shared Account</h3>
    <div class="row"><span>Balance</span><b>${money(m.sharedAccountBalance)}</b></div>
    <button class="opt" style="margin-top:6px;width:50%;font-size:.75rem;padding:6px" onclick="marDepositShared()">Deposit</button>
    <button class="opt" style="margin-top:6px;width:50%;font-size:.75rem;padding:6px" onclick="marWithdrawShared()">Withdraw</button></div>`;

  if ((S.childrenList || []).length === 0 || m.familyPlanning !== 'wait') {
    html += `<div class="card"><button class="opt" style="width:100%;text-align:center;background:#fb7185;color:#fff;font-weight:700;padding:10px" onclick="marTryForBaby()">👶 Try for baby</button></div>`;
  }
  return html;
}

/* ============================================================
   CONFLICT & RECORDS
   ============================================================ */
function marRenderConflict() {
  const m = S.marriage;
  if (m.status !== 'married' && m.status !== 'engaged' && m.status !== 'dating') return `<div class="card"><h3>⚔️ Conflict</h3><p class="muted small">Not in a relationship.</p></div>`;
  let html = '';

  if (m.pendingConflict) {
    const topic = (MARRIAGE_CONFLICT_TOPICS || []).find(x => x.id === m.pendingConflict);
    if (topic) {
      html += `<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">⚠️ Conflict: ${topic.label}</h3>
        <div class="row"><span>Severity</span><b>${topic.severity}/5</b></div>
        <p class="muted small" style="margin:8px 0">${topic.resolution}</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="opt" style="flex:1;padding:8px;font-size:.75rem;background:#34d399;color:#000;font-weight:700" onclick="marResolveConflict('discuss')">Discuss calmly</button>
        <button class="opt" style="flex:1;padding:8px;font-size:.75rem;background:#22d3ee;color:#000;font-weight:700" onclick="marResolveConflict('counsel')">Counsel · ${money(marEGP(5000))}</button>
        <button class="opt" style="flex:1;padding:8px;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="marResolveConflict('ignore')">Ignore</button>
        </div></div>`;
    }
  } else {
    html += `<div class="card"><h3>⚔️ Conflict</h3><p class="muted small">No active conflicts. Conflicts arise when bond is low or stress is high.</p></div>`;
  }

  if (MARRIAGE_SEPARATION_OPTIONS && m.status === 'married') {
    html += `<div class="card"><h3>💔 Marital Difficulty</h3><p class="muted small">When things get hard, these are your options.</p>`;
    MARRIAGE_SEPARATION_OPTIONS.forEach(o => {
      if (o.id === 'divorce') {
        html += `<button class="opt" style="margin-top:6px;width:100%;text-align:left;padding:8px;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="marAskForDivorce()">${o.label} · ${money(marEGP(o.costEGP))}</button>`;
      } else {
        html += `<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSeparationOption('${o.id}')">${o.label} ${o.costEGP > 0 ? '· ' + money(marEGP(o.costEGP)) : ''}<br><span class="muted" style="font-size:.65rem">${o.desc}</span></button>`;
      }
    });
    html += `</div>`;
  }
  return html;
}

function marRenderRecords() {
  const m = S.marriage;
  let html = '';
  if (MARRIAGE_ACHIEVEMENTS) {
    html += `<div class="card"><h3>🏆 Achievements</h3>`;
    if (!m.achievements.length) html += `<p class="muted small">No achievements yet.</p>`;
    else m.achievements.forEach(id => { const ach = MARRIAGE_ACHIEVEMENTS.find(a => a.id === id); if (ach) html += `<div class="row"><span>${ach.label}</span><span class="muted small">${ach.desc}</span></div>`; });
    html += `</div>`;
  }
  if (MARRIAGE_MILESTONES) {
    html += `<div class="card"><h3>🌟 Milestones</h3>`;
    if (!m.milestones.length) html += `<p class="muted small">No milestones yet.</p>`;
    else m.milestones.forEach(id => { const mil = MARRIAGE_MILESTONES.find(x => x.id === id); if (mil) html += `<div class="row"><span>${mil.label}</span><span class="muted small">${mil.desc}</span></div>`; });
    html += `</div>`;
  }
  if (m.exSpouses && m.exSpouses.length) {
    html += `<div class="card" style="border-color:#666"><h3 style="color:#888">💔 Ex-Partners</h3>`;
    m.exSpouses.forEach(ex => {
      html += `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a"><div style="font-weight:700;color:#888">${ex.name}</div>
        <div class="muted small">Married ${ex.marriedYear} · Divorced ${ex.divorcedYear} · ${ex.reason}</div>
        ${ex.childSupportAnnual > 0 ? `<div class="muted small">Pays child support: ${money(ex.childSupportAnnual)}/yr</div>` : ''}
        ${ex.custody ? `<div class="muted small">Custody: ${ex.custody}</div>` : ''}</div>`;
    });
    html += `</div>`;
  }
  if (m.conflictHistory && m.conflictHistory.length) {
    html += `<div class="card"><h3>📖 Conflict History</h3>`;
    m.conflictHistory.slice(-10).reverse().forEach(c => { html += `<div class="row"><span>${c.year} · ${c.topic}</span><span class="muted small">${c.resolution}</span></div>`; });
    html += `</div>`;
  }
  return html || `<div class="card"><h3>📜 Records</h3><p class="muted small">No records yet.</p></div>`;
}

/* ============================================================
   ACTIONS
   ============================================================ */
window.marTryDate = function(sourceId) {
  const src = MARRIAGE_DATING_SOURCES.find(s => s.id === sourceId);
  if (!src) return;
  const cost = marEGP(src.cost);
  if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost; S.marriage.datingAttempts++;

  if (Math.random() > src.matchChance) { log('💔 No luck through ' + src.label + '. Try again.'); fx({ happiness: -2 }); render(); return; }

  const targetGender = S.gender === 'm' ? 'f' : 'm';
  const names = marNamePool(targetGender);
  const name = names[Math.floor(Math.random() * names.length)];
  const age = Math.max(18, S.age + Math.floor(Math.random() * 8) - 4);
  const traits = marRollTraits();
  S.marriage.partner = { name, age, gender: targetGender, bond: 40 + Math.floor(Math.random() * 20), traits, income: 0, source: src.label, familyApproval: src.familyApproval, metYear: gameYear() };
  S.marriage.status = 'dating';
  log('💕 You started dating ' + name + ' (age ' + age + ') via ' + src.label + '.');
  fx({ happiness: 10 }); marUnlockAchievement('first_relationship'); marReachMilestone('first_date'); render();
};

window.marDoActivity = function(activityId) {
  if (!S.marriage.partner) return;
  const act = (MARRIAGE_RELATIONSHIP_ACTIVITIES || []).find(a => a.id === activityId);
  if (!act) return;
  const cost = marEGP(act.costEGP);
  if (S.wealth < cost) { log('Not enough cash.'); render(); return; }
  S.wealth -= cost; S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + act.bond);
  fx({ happiness: act.happiness }); log('💞 ' + act.label + ' with ' + S.marriage.partner.name + '. Bond +' + act.bond + ', Happiness +' + act.happiness + '.'); render();
};

window.marBreakup = function() {
  if (!S.marriage.partner) return;
  if (!confirm('Break up with ' + S.marriage.partner.name + '?')) return;
  log('💔 Broke up with ' + S.marriage.partner.name + '.');
  S.marriage.partner = null; S.marriage.status = 'single'; S.marriage.engagement = null; S.marriage.wedding = null; fx({ happiness: -12 }); render();
};

window.marSetHome = function(homeId) {
  const h = MARRIAGE_HOME_OPTIONS.find(x => x.id === homeId);
  if (!h) return;
  const setup = marEGP(h.setupCostEGP);
  if (S.wealth < setup) { log('Need ' + money(setup) + ' for setup costs.'); render(); return; }
  S.wealth -= setup; S.marriage.home = homeId; S.marriage.homeSetupPaid = true;
  log('🏠 You set up home: ' + h.label + '. Setup cost ' + money(setup) + '. Monthly ' + money(marEGP(h.monthlyCostEGP)) + '.');
  if (h.id !== 'family_home') marUnlockAchievement('homeowners'); render();
};

window.marSetFamilyPlanning = function(optionId) {
  S.marriage.familyPlanning = optionId;
  const opt = MARRIAGE_FAMILY_PLANNING_OPTIONS.find(x => x.id === optionId);
  log('👶 Family plan set: ' + (opt ? opt.label : optionId) + '.'); marUnlockAchievement('family_planner'); render();
};

window.marSetChildcare = function(optionId) {
  S.marriage.childcare = optionId;
  const opt = MARRIAGE_CHILDCARE_OPTIONS.find(x => x.id === optionId);
  log('👶 Childcare set: ' + (opt ? opt.label : optionId) + '.'); render();
};

window.marDepositShared = function() {
  const amt = Math.round(Number(prompt('Deposit how much?\nYou have ' + money(S.wealth), '10000')));
  if (!amt || amt <= 0) return;
  if (S.wealth < amt) { log('Not enough.'); render(); return; }
  S.wealth -= amt; S.marriage.sharedAccountBalance += amt;
  log('💰 Deposited ' + money(amt) + ' into shared account.'); render();
};

window.marWithdrawShared = function() {
  const amt = Math.round(Number(prompt('Withdraw how much?\nAvailable ' + money(S.marriage.sharedAccountBalance), '10000')));
  if (!amt || amt <= 0) return;
  if (S.marriage.sharedAccountBalance < amt) { log('Not enough in shared account.'); render(); return; }
  S.marriage.sharedAccountBalance -= amt; S.wealth += amt;
  log('💰 Withdrew ' + money(amt) + ' from shared account.'); render();
};

window.marTryForBaby = function() {
  if (!S.marriage.partner) return;
  if (S.pregnantMonths > 0) { log('Already expecting!'); render(); return; }
  const ageToUse = S.gender === 'f' ? S.age : S.marriage.partner.age;
  let chance = 0.70; if (ageToUse > 30) chance = 0.50; if (ageToUse > 35) chance = 0.30; if (ageToUse > 40) chance = 0.10;
  if (Math.random() < chance) { S.pregnantMonths = 1; S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + 10); log('🎉 You and ' + S.marriage.partner.name + ' are expecting a baby!'); fx({ happiness: 20 }); }
  else { log('Not this month. Try again later.'); fx({ happiness: -2 }); }
  render();
};

window.marResolveConflict = function(mode) {
  const m = S.marriage;
  if (!m.pendingConflict || !m.partner) return;
  const topic = MARRIAGE_CONFLICT_TOPICS.find(x => x.id === m.pendingConflict);
  if (mode === 'discuss') {
    const success = Math.random() < 0.60 + (m.partner.bond / 500);
    if (success) { m.partner.bond = Math.min(100, m.partner.bond + 8); log('💬 You discussed it calmly. Bond +8.'); marUnlockAchievement('conflict_resolved'); }
    else { m.partner.bond = Math.max(0, m.partner.bond - 5); log('😞 The conversation went badly. Bond -5.'); }
  } else if (mode === 'counsel') {
    const cost = marEGP(5000); if (S.wealth < cost) { log('Not enough for counselling.'); render(); return; }
    S.wealth -= cost; m.partner.bond = Math.min(100, m.partner.bond + 12); log('🧠 Counselling helped. Bond +12.'); marUnlockAchievement('conflict_resolved');
  } else if (mode === 'ignore') { m.partner.bond = Math.max(0, m.partner.bond - 10); log('😶 You ignored the issue. Bond -10.'); }
  m.conflictHistory.push({ year: gameYear(), topic: topic ? topic.label : m.pendingConflict, resolution: mode }); m.pendingConflict = null; render();
};

window.marSeparationOption = function(optionId) {
  const opt = MARRIAGE_SEPARATION_OPTIONS.find(x => x.id === optionId);
  if (!opt) return;
  const cost = marEGP(opt.costEGP); if (S.wealth < cost) { log('Not enough cash.'); render(); return; }
  S.wealth -= cost;
  const p = S.marriage.partner;
  if (opt.bondEffect > 0) p.bond = Math.min(100, p.bond + opt.bondEffect);
  else if (opt.bondEffect < 0) p.bond = Math.max(0, p.bond + opt.bondEffect);
  log('💬 ' + opt.label + '. ' + opt.desc); render();
};

window.marAskForDivorce = function() {
  if (!S.marriage.partner) return;
  const p = S.marriage.partner;
  const causes = MARRIAGE_DIVORCE_CAUSES.map(c => c.id + ' = ' + c.label).join('\n');
  const choice = prompt('Why divorce?\n\n' + causes + '\n\nEnter cause id:', 'boredom');
  if (!choice) return;
  const cause = MARRIAGE_DIVORCE_CAUSES.find(c => c.id === choice.trim());
  if (!cause) { log('Unknown cause.'); return; }
  const law = MARRIAGE_DIVORCE_LAWS[S.country] || MARRIAGE_DIVORCE_LAWS.egy;
  const courtFee = marEGP(law.courtFeeEGP);
  let settlement = 0; let childSupportAnnual = 0; let custody = null;
  if (law.assetSplit === '50_50' && (!S.marriage.prenup || S.marriage.prenup.type !== 'Comprehensive Financial Agreement')) settlement = Math.floor(S.wealth * 0.5);
  if (S.job && law.alimonyYears > 0 && S.gender === 'm') { const years = typeof law.alimonyYears === 'number' ? law.alimonyYears : 1; settlement += Math.round(S.job.salary * 0.15 * years); }
  const children = S.childrenList || [];
  if (children.length > 0) { if (S.job) childSupportAnnual = Math.round(S.job.salary * law.childSupportPct * children.length); custody = S.gender === 'f' ? 'You have primary custody' : (law.custody === 'joint' ? 'Joint custody' : 'She has primary custody'); }
  const totalCost = courtFee + settlement;
  if (!confirm('Divorce under ' + law.label + ':\n\nCourt fee: ' + money(courtFee) + '\nSettlement: ' + money(settlement) + '\nChild support: ' + (childSupportAnnual > 0 ? money(childSupportAnnual) + '/yr' : 'None') + '\nCustody: ' + (custody || 'N/A') + '\n\nTotal upfront: ' + money(totalCost) + '\n\nProceed?')) return;
  if (S.wealth < totalCost) { log('Not enough for divorce (' + money(totalCost) + ').'); render(); return; }
  S.wealth -= totalCost;
  S.marriage.exSpouses.push({ name: p.name, marriedYear: p.marriedYear || gameYear(), divorcedYear: gameYear(), reason: cause.label, childSupportAnnual, custody, remarried: false });
  S.marriage.partner = null; S.marriage.status = 'divorced'; S.marriage.wedding = null; S.marriage.engagement = null; S.marriage.financeModel = null; S.marriage.sharedAccountBalance = 0; S.marriage.home = null; S.marriage.homeSetupPaid = false; S.marriage.tab = 'overview'; S.spouse = null;
  log('💔 Divorced ' + p.name + '. Reason: ' + cause.label + '. Cost: ' + money(totalCost) + '.');
  fx({ happiness: -25 }); render();
};

/* ============================================================
   YEAR TICK
   ============================================================ */
GameHooks.on('year', function() {
  ensureMarriageState();
  if (!S) return;
  const m = S.marriage;
  const p = m.partner;
  if (!p) return;
  p.age++;
  let bondChange = -2;
  (p.traits || []).forEach(tid => { const t = marTrait(tid); if (t) bondChange += (t.bondPerYear || 0); });
  p.bond = Math.max(0, Math.min(100, p.bond + bondChange));
  if (p.income > 0) { const ambitious = (p.traits || []).includes('ambitious') || (p.traits || []).includes('career_focused'); p.income = Math.round(p.income * (ambitious ? 1.06 : 1.03)); }
  if (m.home) { const h = (MARRIAGE_HOME_OPTIONS || []).find(x => x.id === m.home); if (h) { const yearly = marEGP(h.monthlyCostEGP * 12); if (S.wealth >= yearly) S.wealth -= yearly; else log('⚠️ Could not pay home costs (' + money(yearly) + ').'); } }
  if (m.childcare) { const cc = (MARRIAGE_CHILDCARE_OPTIONS || []).find(x => x.id === m.childcare); if (cc) { const yearly = marEGP(cc.monthlyCostEGP * 12); if (S.wealth >= yearly) S.wealth -= yearly; } }
  if (MARRIAGE_YEAR_EVENTS && Math.random() < 0.55) {
    const eligible = MARRIAGE_YEAR_EVENTS.filter(e => { if (e.requiresNoChildren && (S.childrenList && S.childrenList.length > 0)) return false; return true; });
    const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
    if (totalWeight > 0) { let roll = Math.random() * totalWeight; for (let i = 0; i < eligible.length; i++) { roll -= eligible[i].weight; if (roll <= 0) { marFireYearEvent(eligible[i]); break; } } }
  }
  if (m.status === 'married' && !m.pendingConflict && p.bond < 50 && Math.random() < 0.20 && MARRIAGE_CONFLICT_TOPICS) { const topic = MARRIAGE_CONFLICT_TOPICS[Math.floor(Math.random() * MARRIAGE_CONFLICT_TOPICS.length)]; m.pendingConflict = topic.id; log('⚔️ Conflict arose: ' + topic.label + '.'); }
  if (m.status === 'married' && p.bond < 20 && Math.random() < 0.20) {
    log('💔 ' + p.name + ' asked for a divorce. Bond was too low.');
    const law = MARRIAGE_DIVORCE_LAWS[S.country] || MARRIAGE_DIVORCE_LAWS.egy;
    const courtFee = marEGP(law.courtFeeEGP);
    let settlement = 0; if (law.assetSplit === '50_50' && (!m.prenup || m.prenup.type !== 'Comprehensive Financial Agreement')) settlement = Math.floor(S.wealth * 0.5);
    if (S.wealth >= courtFee + settlement) S.wealth -= (courtFee + settlement);
    m.exSpouses.push({ name: p.name, marriedYear: p.marriedYear || gameYear(), divorcedYear: gameYear(), reason: 'Mutual — bond too low', childSupportAnnual: 0, custody: null, remarried: false });
    m.partner = null; m.status = 'divorced'; m.wedding = null; m.engagement = null; m.financeModel = null; m.sharedAccountBalance = 0; m.home = null; S.spouse = null; fx({ happiness: -25 }); return;
  }
  if (m.status === 'married' && p.marriedYear) {
    const years = gameYear() - p.marriedYear;
    if (years >= 1) marReachMilestone('first_anniversary');
    if (years >= 5) marUnlockAchievement('anniversary_5');
    if (years >= 10) marUnlockAchievement('anniversary_10');
    if (years >= 25) marUnlockAchievement('anniversary_25');
    if (years >= 5) marReachMilestone('five_years');
    if (years >= 10) marReachMilestone('ten_years');
    if (years >= 25) marReachMilestone('twenty_five_years');
  }
  m.exSpouses.forEach(ex => { if (ex.childSupportAnnual > 0) { const annual = ex.childSupportAnnual; if (S.wealth >= annual) { S.wealth -= annual; log('💸 Child support paid to ' + ex.name + ': ' + money(annual) + '.'); } else log('⚠️ Could not pay child support to ' + ex.name + '.'); } });
});

function marFireYearEvent(evt) {
  const p = S.marriage.partner;
  if (!p) return;
  if (evt.id === 'partner_promotion') { p.income = Math.round((p.income || 50000) * 1.15); log('🎉 ' + p.name + ' got promoted. Income now ' + money(p.income) + '/yr.'); p.bond = Math.min(100, p.bond + 5); }
  else if (evt.id === 'partner_lost_job') { p.income = 0; log('😔 ' + p.name + ' lost their job. Money will be tight.'); p.bond = Math.max(0, p.bond - 5); }
  else if (evt.id === 'anniversary') log('💍 It is your anniversary with ' + p.name + '. Consider a gift or date.');
  else if (evt.id === 'inlaws_visit') log('👵 Your in-laws are visiting. Bond and money matter this week.');
  else if (evt.id === 'partner_bond_warning') log('💬 ' + p.name + ' seems distant. Spend time together.');
  else if (evt.id === 'partner_wants_gift') log('🎁 ' + p.name + ' hints at wanting a gift.');
  else if (evt.id === 'partner_wants_trip') log('✈️ ' + p.name + ' wants to plan a trip together.');
  else if (evt.id === 'partner_wants_child') log('👶 ' + p.name + ' brings up having a baby.');
  else if (evt.id === 'unexpected_bill') { const cost = marEGP(20000); if (S.wealth >= cost) { S.wealth -= cost; log('💸 Unexpected bill: ' + money(cost) + '.'); } }
  else if (evt.id === 'home_upgrade') log('🏠 You discuss moving to a larger home.');
  else if (evt.id === 'career_move') log('💼 Your partner received a career offer in another city.');
  else if (evt.id === 'family_pressure') log('👵 Relatives are asking questions about your private plans.');
  else if (evt.id === 'forgotten_anniversary') { if (p.bond > 30) { p.bond = Math.max(0, p.bond - 5); log('😞 You forgot an important date. Bond -5.'); } }
  else if (evt.id === 'shared_goal') log('🎯 Your partner wants to work toward a shared goal.');
  else if (evt.id === 'partner_study') log('📚 Your partner wants to study or take a course.');
  else if (evt.id === 'holiday_planning') log('🎉 You plan holiday arrangements together.');
  else if (evt.id === 'household_chores') { if (p.bond > 25) { p.bond = Math.max(0, p.bond - 2); log('🧹 Chore distribution felt unfair. Bond -2.'); } }
  else if (evt.id === 'old_friend') log('👥 An old friend contacted ' + p.name + '.');
  else if (evt.id === 'financial_review') log('💰 Annual financial review. You discussed savings and spending.');
  else if (evt.id === 'relationship_milestone') log('💞 A milestone. You appreciate how far you have come.');
}

GameHooks.registerTab({ id: 'marriage', label: '💍 Marriage', order: 9, view: marriageView });
