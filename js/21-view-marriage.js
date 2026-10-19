/* ============================================================
   VIEW: MARRIAGE (fully expanded)
   ============================================================
   Uses all tables from 08-data-marriage.js.
   Owns S.marriage with full state including home, achievements,
   milestones, conflicts, family planning, childcare.

   Sub-tabs: Overview · Find · Plan · Married Life · Conflict · Records
   Registers tab 'marriage' at order 9.
   ============================================================ */

/* ---------- STATE ---------- */
function ensureMarriageState() {
  if (!S) return;
  if (!S.marriage) {
    S.marriage = {
      status: 'single',
      partner: null,
      engagement: null,
      wedding: null,
      financeModel: null,
      sharedAccountBalance: 0,
      prenup: null,
      exSpouses: [],
      datingAttempts: 0,
      lastDateYear: 0,
      home: null,
      homeSetupPaid: false,
      familyPlanning: 'undecided',
      childcare: null,
      achievements: [],
      milestones: [],
      conflictHistory: [],
      pendingConflict: null,
      tab: 'overview'
    };
  }
  const m = S.marriage;
  if (!Array.isArray(m.exSpouses)) m.exSpouses = [];
  if (typeof m.sharedAccountBalance !== 'number') m.sharedAccountBalance = 0;
  if (typeof m.datingAttempts !== 'number') m.datingAttempts = 0;
  if (typeof m.lastDateYear !== 'number') m.lastDateYear = 0;
  if (typeof m.home === 'undefined') m.home = null;
  if (typeof m.homeSetupPaid !== 'boolean') m.homeSetupPaid = false;
  if (typeof m.familyPlanning !== 'string') m.familyPlanning = 'undecided';
  if (typeof m.childcare === 'undefined') m.childcare = null;
  if (!Array.isArray(m.achievements)) m.achievements = [];
  if (!Array.isArray(m.milestones)) m.milestones = [];
  if (!Array.isArray(m.conflictHistory)) m.conflictHistory = [];
  if (typeof m.pendingConflict === 'undefined') m.pendingConflict = null;
  if (!m.tab) m.tab = 'overview';

  /* Migrate legacy S.spouse */
  if (S.spouse && m.status === 'single' && m.partner === null) {
    m.status = 'married';
    m.partner = {
      name: S.spouse.name,
      age: S.spouse.age || S.age,
      gender: S.spouse.gender || (S.gender === 'm' ? 'f' : 'm'),
      bond: S.spouse.bond || 70,
      traits: ['kind'],
      income: S.spouse.income || 0,
      source: 'legacy',
      familyApproval: 0.8,
      metYear: gameYear(),
      marriedYear: gameYear()
    };
    m.financeModel = 'male_provider';
    m.prenup = null;
  }
}
GameHooks.on('newGame', ensureMarriageState);
GameHooks.on('migrate', ensureMarriageState);

/* ---------- HELPERS ---------- */
function marRate() { return C().rate || 1; }
function marEGP(amountEGP) { return Math.round((amountEGP || 0) * marRate()); }
function marNamePool(gender) {
  const pool = (typeof MARRIAGE_PARTNER_NAMES !== 'undefined' && MARRIAGE_PARTNER_NAMES[S.country]) || MARRIAGE_PARTNER_NAMES.egy;
  return gender === 'm' ? pool.m : pool.f;
}
function marTrait(id) { return MARRIAGE_PARTNER_TRAITS[id] || null; }
function marBondColor(v) { return v > 70 ? '#34d399' : v > 40 ? '#fbbf24' : '#fb7185'; }
function marCountryProfile() {
  return (typeof MARRIAGE_COUNTRY_PROFILES !== 'undefined' && MARRIAGE_COUNTRY_PROFILES[S.country]) || null;
}

function marRollTraits() {
  const positive = ['kind', 'funny', 'romantic', 'calm', 'ambitious', 'religious', 'generous', 'loyal', 'independent', 'family_oriented', 'patient', 'supportive', 'communicative', 'adventurous', 'homebody', 'mature', 'frugal', 'career_focused'];
  const negative = ['grumpy', 'moody', 'pessimistic', 'greedy', 'jealous', 'impulsive', 'extravagant', 'avoidant', 'stubborn', 'insecure'];
  const traits = [];
  const pCount = 1 + Math.floor(Math.random() * 2);
  const nCount = Math.floor(Math.random() * 3);
  for (let i = 0; i < pCount; i++) {
    const pick = positive[Math.floor(Math.random() * positive.length)];
    if (traits.indexOf(pick) < 0) traits.push(pick);
  }
  for (let i = 0; i < nCount; i++) {
    const pick = negative[Math.floor(Math.random() * negative.length)];
    if (traits.indexOf(pick) < 0) traits.push(pick);
  }
  if (!traits.length) traits.push('kind');
  return traits;
}

function marFamilyApproval(partner) {
  let a = partner.familyApproval || 0.7;
  if (S.job && S.job.salary > 200000) a += 0.15;
  else if (!S.job) a -= 0.30;
  if (S.degree) a += 0.10;
  if (Math.abs(S.age - partner.age) > 10) a -= 0.15;
  const prof = marCountryProfile();
  if (prof) a = a * prof.familyInfluence + a * (1 - prof.familyInfluence);
  return Math.max(0.1, Math.min(1.0, a));
}

function marUnlockAchievement(id) {
  const m = S.marriage;
  if (m.achievements.indexOf(id) >= 0) return;
  m.achievements.push(id);
  const ach = (typeof MARRIAGE_ACHIEVEMENTS !== 'undefined') ? MARRIAGE_ACHIEVEMENTS.find(function(a) { return a.id === id; }) : null;
  if (ach) log('🏆 Achievement unlocked: ' + ach.label);
}

function marReachMilestone(id) {
  const m = S.marriage;
  if (m.milestones.indexOf(id) >= 0) return;
  m.milestones.push(id);
  const mil = (typeof MARRIAGE_MILESTONES !== 'undefined') ? MARRIAGE_MILESTONES.find(function(x) { return x.id === id; }) : null;
  if (mil) log('🌟 Milestone: ' + mil.label);
}

function marSetTab(tab) { S.marriage.tab = tab; render(); }
window.marSetTab = marSetTab;

/* ---------- MAIN VIEW ---------- */
function marriageView() {
  ensureMarriageState();
  if (!S) return '';
  if (S.age < 16) return '<div class="card"><h3>💍 Marriage</h3><p class="muted">Available from age 16+.</p></div>';

  const m = S.marriage;
  const tabs = [
    ['overview', '📋 Overview'],
    ['find', '💕 Find'],
    ['plan', '💍 Plan'],
    ['life', '🏠 Life'],
    ['conflict', '⚔️ Conflict'],
    ['records', '📜 Records']
  ];

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#fb718515 0%,transparent 100%);border-color:#fb7185">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">MARRIAGE · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + marStatusLabel() + '</div></div>' +
    '<div style="font-size:2rem">💍</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (m.tab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="marSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

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
   OVERVIEW TAB
   ============================================================ */
function marRenderOverview() {
  const m = S.marriage;
  const prof = marCountryProfile();

  let html = '';
  if (prof) {
    html += '<div class="card" style="border-color:#8b5cf6">' +
      '<div class="muted small" style="letter-spacing:.06em;font-weight:700;color:#8b5cf6">COUNTRY PROFILE · ' + prof.label + '</div>' +
      '<div class="row" style="margin-top:6px"><span>Family influence</span><b>' + Math.round(prof.familyInfluence * 100) + '%</b></div>' +
      '<div class="row"><span>Wedding pressure</span><b>' + Math.round(prof.weddingPressure * 100) + '%</b></div>' +
      '<div class="row"><span>Housing pressure</span><b>' + Math.round(prof.housingPressure * 100) + '%</b></div>' +
      '<p class="muted small" style="margin-top:8px">' + prof.notes + '</p>' +
      '<div class="muted small" style="margin-top:6px">Typical concerns: ' + prof.typicalConcerns.join(' · ') + '</div>' +
      '</div>';
  }

  if (m.status === 'single') {
    html += '<div class="card"><h3>💕 You are single</h3>' +
      '<p class="muted small">Head to the Find tab to meet someone.</p>' +
      '<button class="opt" style="margin-top:8px;text-align:center;background:#fb7185;color:#fff;font-weight:700" onclick="marSetTab(\'find\')">Find a partner</button></div>';
    return html;
  }

  const p = m.partner;
  if (!p) return html;
  const bond = p.bond || 70;
  const traitsList = (p.traits || []).map(function(t) { const tt = marTrait(t); return tt ? tt.label : t; });
  const approval = marFamilyApproval(p);

  html += '<div class="card"><h3>Partner</h3>' +
    '<div style="font-weight:700;font-size:1.1rem">' + p.name + '</div>' +
    '<div class="muted small">Age ' + p.age + ' · Met via ' + p.source + (p.metYear ? ' · ' + p.metYear : '') + '</div>' +
    '<div class="muted small" style="color:#8b5cf6;margin-top:4px">' + traitsList.join(' · ') + '</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin-top:10px"><span>Bond</span><span>' + bond + '%</span></div>' +
    '<div style="height:5px;background:#1a1a2a;border-radius:3px;margin-top:3px"><div style="height:100%;width:' + bond + '%;background:' + marBondColor(bond) + ';border-radius:3px"></div></div>' +
    (m.status !== 'married' ? '<div class="row" style="margin-top:8px"><span>Family approval</span><b class="' + (approval >= 0.7 ? 'good' : approval >= 0.4 ? '' : 'bad') + '">' + Math.round(approval * 100) + '%</b></div>' : '') +
    (p.income > 0 ? '<div class="row"><span>Income</span><b>' + money(p.income) + '/yr</b></div>' : '') +
    '</div>';

  /* Relationship activities */
  if (typeof MARRIAGE_RELATIONSHIP_ACTIVITIES !== 'undefined') {
    html += '<div class="card"><h3>💞 Spend Time Together</h3>';
    if (prof && prof.activities) {
      html += '<p class="muted small" style="margin-bottom:8px">In ' + prof.label + ': ' + prof.activities.slice(0, 3).join(' · ') + '</p>';
    }
    MARRIAGE_RELATIONSHIP_ACTIVITIES.slice(0, 8).forEach(function(act) {
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="marDoActivity(\'' + act.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + act.label + '</b><span>' + money(marEGP(act.costEGP)) + '</span></div>' +
        '<div class="muted small">Bond +' + act.bond + ' · Happiness +' + act.happiness + '</div></button>';
    });
    html += '</div>';
  }

  return html;
}

/* ============================================================
   FIND TAB
   ============================================================ */
function marRenderFind() {
  const m = S.marriage;
  if (m.status !== 'single' && m.status !== 'divorced') {
    return '<div class="card"><h3>💕 Find a Partner</h3><p class="muted small">You are currently ' + m.status + '.</p></div>';
  }

  let html = '<div class="card"><h3>💕 Where to meet someone</h3>' +
    '<p class="muted small">Different sources have different success rates and family approval.</p></div>';

  if (typeof MARRIAGE_DATING_SOURCES === 'undefined') {
    return html + '<div class="card"><p class="muted small">Data not loaded.</p></div>';
  }

  MARRIAGE_DATING_SOURCES.forEach(function(src) {
    const blockAge = S.age < src.minAge || S.age > src.maxAge;
    const blockEdu = src.requiresEducation && !S.uni && !S.degree;
    const blockJob = src.requiresJob && !S.job;
    const blocked = blockAge || blockEdu || blockJob;
    const cost = marEGP(src.cost);
    let reason = '';
    if (blockAge) reason = 'Age ' + src.minAge + '-' + src.maxAge + ' only';
    else if (blockEdu) reason = 'Needs education';
    else if (blockJob) reason = 'Needs a job';

    html += '<div class="card" style="padding:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div style="flex:1"><div style="font-weight:700">' + src.label + '</div>' +
      '<div class="muted small">' + src.desc + '</div>' +
      '<div class="muted small">Match ' + Math.round(src.matchChance * 100) + '% · Family ' + Math.round(src.familyApproval * 100) + '% · Romance ' + Math.round((src.romantic || 0.7) * 100) + '%</div></div>' +
      '<div style="text-align:right;flex-shrink:0;margin-left:8px"><b>' + money(cost) + '</b></div></div>' +
      (blocked ? '<div class="bad small" style="margin-top:6px">' + reason + '</div>' :
        '<button class="opt" style="margin-top:6px;text-align:center;font-size:.75rem;background:#fb7185;color:#fff;font-weight:700" onclick="marTryDate(\'' + src.id + '\')">Meet someone · ' + money(cost) + '</button>') +
      '</div>';
  });

  return html;
}

/* ============================================================
   PLAN TAB (Proposal · Engagement · Wedding)
   ============================================================ */
function marRenderPlan() {
  const m = S.marriage;
  if (m.status === 'single') {
    return '<div class="card"><h3>💍 Planning</h3><p class="muted small">Find a partner first.</p></div>';
  }
  if (m.status === 'married') {
    return '<div class="card"><h3>💍 Planning</h3><p class="muted small">You are already married. See the Married Life tab.</p></div>';
  }

  const p = m.partner;
  if (!p) return '';
  let html = '';

  /* Proposal phase */
  if (m.status === 'dating') {
    const bond = p.bond || 0;
    const canPropose = bond >= 40;

    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">💍 Proposal</h3>';
    if (!m.engagement) {
      if (!canPropose) {
        html += '<p class="muted small">Bond needs 40%+ before proposing. Currently ' + bond + '%.</p>';
      } else {
        html += '<p class="muted small">Choose how you want to propose. The style affects her answer and family reaction.</p>';
        if (typeof MARRIAGE_PROPOSAL_OPTIONS !== 'undefined') {
          MARRIAGE_PROPOSAL_OPTIONS.forEach(function(opt) {
            html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSelectProposal(\'' + opt.id + '\')">' +
              '<div style="display:flex;justify-content:space-between"><b>' + opt.label + '</b><span>' + money(marEGP(opt.costEGP)) + '</span></div>' +
              '<div class="muted small">Romance +' + opt.romance + ' · Social +' + opt.social + ' · ' + opt.desc + '</div></button>';
          });
        }
      }
    } else {
      html += marRenderProposalReview();
    }
    html += '</div>';
  }

  /* Engagement phase */
  if (m.status === 'engaged') {
    if (!m.engagement || !m.engagement.finalized) {
      html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">💍 Engagement Planning</h3>';
      html += marRenderEngagementPlanner();
      html += '</div>';
    } else {
      html += '<div class="card"><h3>💍 Engagement Review</h3>' +
        '<div class="row"><span>Shabka</span><b>' + money(marEGP(m.engagement.shabkaCost)) + '</b></div>' +
        '<div class="row"><span>Mahr</span><b>' + money(marEGP(m.engagement.mahrCost)) + '</b></div>' +
        '<div class="row"><span>Party</span><b>' + money(marEGP(m.engagement.partyCost)) + '</b></div>' +
        '</div>';
    }

    /* Wedding planner */
    if (m.wedding) {
      html += '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">🎉 Wedding Planning</h3>';
      html += marRenderWeddingPlanner();
      html += '</div>';
    } else {
      html += '<div class="card">' +
        '<p class="muted small">Ready to plan the wedding? This is the biggest expense of the marriage.</p>' +
        '<button class="opt" style="text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="marOpenWeddingPlanner()">Start wedding planning</button>' +
        '</div>';
    }

    html += '<div class="card"><button class="opt" style="text-align:center;border-color:#fb7185;color:#fb7185" onclick="marCancelEngagement()">Cancel engagement</button></div>';
  }

  return html;
}

function marRenderProposalReview() {
  const e = S.marriage.engagement;
  if (!e || !e.proposal) return '';
  const prop = (MARRIAGE_PROPOSAL_OPTIONS || []).find(function(x) { return x.id === e.proposal; });
  return '<div style="margin-top:8px;padding:10px;background:#0f0f1a;border-radius:8px">' +
    '<div style="font-weight:700">' + (prop ? prop.label : e.proposal) + '</div>' +
    '<div class="muted small">' + (prop ? prop.desc : '') + '</div>' +
    '<div class="row" style="margin-top:6px"><span>Cost</span><b>' + money(marEGP(prop ? prop.costEGP : 0)) + '</b></div>' +
    '<button class="opt" style="margin-top:8px;text-align:center;background:#fb7185;color:#fff;font-weight:700" onclick="marConfirmProposal()">💍 Propose now</button>' +
    '<button class="opt" style="margin-top:6px;text-align:center;border-color:#666;color:#888" onclick="marClearProposal()">Change proposal style</button>' +
    '</div>';
}

function marRenderEngagementPlanner() {
  const e = S.marriage.engagement;
  if (!e) return '';

  function picker(label, items, key, selectedId, costFn) {
    return '<h4 style="font-size:.8rem;color:#fbbf24;margin-top:10px">' + label + '</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' +
      items.map(function(item) {
        const cost = costFn ? costFn(item) : '';
        return '<button class="pill ' + (selectedId === item.id ? 'on' : '') + '" style="padding:6px;font-size:.68rem" onclick="marEngagementSet(\'' + key + '\',\'' + item.id + '\')">' +
          item.label + (cost ? '<br><span class="muted" style="font-size:.62rem">' + cost + '</span>' : '') + '</button>';
      }).join('') + '</div>';
  }

  const shabka = MARRIAGE_SHABKA_TIERS.find(function(x) { return x.id === e.shabkaTier; }) || MARRIAGE_SHABKA_TIERS[0];
  const mahr = MARRIAGE_MAHR_TIERS.find(function(x) { return x.id === e.mahrTier; }) || MARRIAGE_MAHR_TIERS[0];
  const party = MARRIAGE_ENGAGEMENT_PARTY_TIERS.find(function(x) { return x.id === e.partyTier; }) || MARRIAGE_ENGAGEMENT_PARTY_TIERS[0];
  const total = shabka.costEGP + mahr.costEGP + party.costEGP;
  const totalLocal = marEGP(total);
  const canAfford = S.wealth >= totalLocal;

  let html = '';
  html += picker('Shabka (bride\'s gold)', MARRIAGE_SHABKA_TIERS, 'shabkaTier', e.shabkaTier, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Mahr (deferred dowry)', MARRIAGE_MAHR_TIERS, 'mahrTier', e.mahrTier, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Engagement party', MARRIAGE_ENGAGEMENT_PARTY_TIERS, 'partyTier', e.partyTier, function(t) { return money(marEGP(t.costEGP)); });

  html += '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">' +
    '<div class="row"><span>Shabka</span><b>' + money(marEGP(shabka.costEGP)) + '</b></div>' +
    '<div class="row"><span>Mahr</span><b>' + money(marEGP(mahr.costEGP)) + '</b></div>' +
    '<div class="row"><span>Party</span><b>' + money(marEGP(party.costEGP)) + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total</b><b style="color:#fbbf24">' + money(totalLocal) + '</b></div>' +
    '</div>';

  html += '<button class="opt" style="margin-top:10px;text-align:center;background:' + (canAfford ? '#34d399' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + ';font-weight:700" ' + (canAfford ? '' : 'disabled') + ' onclick="marFinalizeEngagement()">' + (canAfford ? 'Confirm engagement · ' + money(totalLocal) : 'Need ' + money(totalLocal)) + '</button>';

  return html;
}

function marRenderWeddingPlanner() {
  const w = S.marriage.wedding;
  if (!w) return '';

  function picker(label, items, key, selectedId, costFn, cols) {
    const c = cols || 2;
    return '<h4 style="font-size:.8rem;color:#34d399;margin-top:10px">' + label + '</h4>' +
      '<div style="display:grid;grid-template-columns:repeat(' + c + ',1fr);gap:4px">' +
      items.map(function(item) {
        const cost = costFn ? costFn(item) : '';
        return '<button class="pill ' + (selectedId === item.id ? 'on' : '') + '" style="padding:5px;font-size:.66rem" onclick="marWeddingSet(\'' + key + '\',\'' + item.id + '\')">' +
          item.label + (cost ? '<br><span class="muted" style="font-size:.6rem">' + cost + '</span>' : '') + '</button>';
      }).join('') + '</div>';
  }

  const venue = MARRIAGE_WEDDING_VENUES.find(function(x) { return x.id === w.venue; }) || MARRIAGE_WEDDING_VENUES[0];
  const guests = MARRIAGE_GUEST_COUNTS.find(function(x) { return x.id === w.guests; }) || MARRIAGE_GUEST_COUNTS[0];
  const catering = MARRIAGE_CATERING_TIERS.find(function(x) { return x.id === w.catering; }) || MARRIAGE_CATERING_TIERS[0];
  const photo = MARRIAGE_PHOTOGRAPHY_TIERS.find(function(x) { return x.id === w.photography; }) || MARRIAGE_PHOTOGRAPHY_TIERS[0];
  const dress = MARRIAGE_DRESS_TIERS.find(function(x) { return x.id === w.dress; }) || MARRIAGE_DRESS_TIERS[0];
  const decor = (MARRIAGE_DECORATION_TIERS || []).find(function(x) { return x.id === w.decoration; }) || (MARRIAGE_DECORATION_TIERS || [])[0] || { costEGP: 0 };
  const music = (MARRIAGE_MUSIC_OPTIONS || []).find(function(x) { return x.id === w.music; }) || (MARRIAGE_MUSIC_OPTIONS || [])[0] || { costEGP: 0 };
  const honey = MARRIAGE_HONEYMOON_TIERS.find(function(x) { return x.id === w.honeymoon; }) || MARRIAGE_HONEYMOON_TIERS[0];
  const planner = (MARRIAGE_PLANNER_OPTIONS || []).find(function(x) { return x.id === w.planner; }) || (MARRIAGE_PLANNER_OPTIONS || [])[0] || { costEGP: 0 };
  const prenup = MARRIAGE_PRENUP_OPTIONS.find(function(x) { return x.id === w.prenup; }) || MARRIAGE_PRENUP_OPTIONS[0];

  const total = venue.baseCostEGP + (guests.guests * catering.perGuestEGP) + photo.costEGP + dress.costEGP + (decor.costEGP || 0) + (music.costEGP || 0) + honey.costEGP + (planner.costEGP || 0);
  const totalLocal = marEGP(total);
  const prenupLocal = marEGP(prenup.legalCostEGP);
  const canAfford = S.wealth >= totalLocal + prenupLocal;

  let html = '';
  html += picker('Venue', MARRIAGE_WEDDING_VENUES, 'venue', w.venue, function(t) { return money(marEGP(t.baseCostEGP)); });
  html += picker('Guests', MARRIAGE_GUEST_COUNTS, 'guests', w.guests, function(t) { return t.guests + ' ppl'; }, 3);
  html += picker('Catering', MARRIAGE_CATERING_TIERS, 'catering', w.catering, function(t) { return money(marEGP(t.perGuestEGP)) + '/g'; });
  html += picker('Photography', MARRIAGE_PHOTOGRAPHY_TIERS, 'photography', w.photography, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Attire', MARRIAGE_DRESS_TIERS, 'dress', w.dress, function(t) { return money(marEGP(t.costEGP)); });
  if (typeof MARRIAGE_DECORATION_TIERS !== 'undefined') {
    html += picker('Decoration & flowers', MARRIAGE_DECORATION_TIERS, 'decoration', w.decoration, function(t) { return money(marEGP(t.costEGP)); });
  }
  if (typeof MARRIAGE_MUSIC_OPTIONS !== 'undefined') {
    html += picker('Music', MARRIAGE_MUSIC_OPTIONS, 'music', w.music, function(t) { return money(marEGP(t.costEGP)); });
  }
  html += picker('Honeymoon', MARRIAGE_HONEYMOON_TIERS, 'honeymoon', w.honeymoon, function(t) { return money(marEGP(t.costEGP)); });
  if (typeof MARRIAGE_PLANNER_OPTIONS !== 'undefined') {
    html += picker('Wedding planner service', MARRIAGE_PLANNER_OPTIONS, 'planner', w.planner, function(t) { return money(marEGP(t.costEGP)); });
  }

  /* Breakdown */
  html += '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">' +
    '<div class="row"><span>Venue</span><b>' + money(marEGP(venue.baseCostEGP)) + '</b></div>' +
    '<div class="row"><span>Catering (' + guests.guests + '×' + money(marEGP(catering.perGuestEGP)) + ')</span><b>' + money(marEGP(guests.guests * catering.perGuestEGP)) + '</b></div>' +
    '<div class="row"><span>Photography</span><b>' + money(marEGP(photo.costEGP)) + '</b></div>' +
    '<div class="row"><span>Attire</span><b>' + money(marEGP(dress.costEGP)) + '</b></div>' +
    (decor.costEGP > 0 ? '<div class="row"><span>Decoration</span><b>' + money(marEGP(decor.costEGP)) + '</b></div>' : '') +
    (music.costEGP > 0 ? '<div class="row"><span>Music</span><b>' + money(marEGP(music.costEGP)) + '</b></div>' : '') +
    '<div class="row"><span>Honeymoon</span><b>' + money(marEGP(honey.costEGP)) + '</b></div>' +
    (planner.costEGP > 0 ? '<div class="row"><span>Planner</span><b>' + money(marEGP(planner.costEGP)) + '</b></div>' : '') +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Wedding total</b><b style="color:#34d399">' + money(totalLocal) + '</b></div>' +
    (prenup.legalCostEGP > 0 ? '<div class="row"><span>Prenup (' + prenup.label + ')</span><b>' + money(prenupLocal) + '</b></div>' : '') +
    '</div>';

  /* Prenup */
  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Prenup</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  MARRIAGE_PRENUP_OPTIONS.forEach(function(o) {
    html += '<button class="pill ' + (w.prenup === o.id ? 'on' : '') + '" style="padding:6px;font-size:.65rem" onclick="marWeddingSet(\'prenup\',\'' + o.id + '\')">' +
      o.label + (o.legalCostEGP > 0 ? '<br><span class="muted" style="font-size:.6rem">' + money(marEGP(o.legalCostEGP)) + '</span>' : '') + '</button>';
  });
  html += '</div>';

  /* Finance model */
  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Marriage finance model</h4>' +
    '<div style="display:grid;grid-template-columns:1fr;gap:4px">';
  MARRIAGE_FINANCE_MODELS.forEach(function(fm) {
    html += '<button class="pill ' + (w.financeModel === fm.id ? 'on' : '') + '" style="padding:6px;font-size:.7rem;text-align:left" onclick="marWeddingSet(\'financeModel\',\'' + fm.id + '\')">' +
      fm.label + '<br><span class="muted" style="font-size:.62rem">' + fm.desc + '</span></button>';
  });
  html += '</div>';

  /* Who pays */
  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Who pays?</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' +
    '<button class="pill ' + (w.payer === 'self' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'self\')">You pay all</button>' +
    '<button class="pill ' + (w.payer === 'split' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'split\')">Split 50/50</button>' +
    '<button class="pill ' + (w.payer === 'partner_family' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'partner_family\')">Partner\'s family</button>' +
    '<button class="pill ' + (w.payer === 'own_family' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'own_family\')">Your family helps</button>' +
    '</div>';

  /* Confirm */
  const grand = totalLocal + prenupLocal;
  html += '<button class="opt" style="margin-top:12px;text-align:center;background:' + (canAfford ? '#34d399' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + ';font-weight:700" ' + (canAfford ? '' : 'disabled') + ' onclick="marConfirmWedding(' + total + ',' + prenup.legalCostEGP + ')">' + (canAfford ? '🎉 Confirm wedding · ' + money(grand) : 'Need ' + money(grand)) + '</button>';
  html += '<button class="opt" style="margin-top:6px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="marCancelWeddingPlanner()">Cancel planning</button>';

  return html;
}

/* ============================================================
   MARRIED LIFE TAB
   ============================================================ */
function marRenderLife() {
  const m = S.marriage;
  if (m.status !== 'married') {
    return '<div class="card"><h3>🏠 Married Life</h3><p class="muted small">Available after you get married.</p></div>';
  }

  const p = m.partner;
  if (!p) return '';

  let html = '<div class="card"><h3>❤️ Married to ' + p.name + '</h3>' +
    '<div class="muted small">Age ' + p.age + ' · Married ' + (p.marriedYear || '?') + '</div>' +
    (p.income > 0 ? '<div class="row"><span>Partner income</span><b>' + money(p.income) + '/yr</b></div>' : '<div class="row"><span>Partner income</span><b class="muted">None (home)</b></div>') +
    '<div class="row"><span>Finance model</span><b>' + (MARRIAGE_FINANCE_MODELS.find(function(x) { return x.id === m.financeModel; }) || {}).label || '—' + '</b></div>' +
    '<div class="row"><span>Prenup</span><b>' + (m.prenup ? m.prenup.type : 'None') + '</b></div>' +
    '<div class="row"><span>Shared account</span><b>' + money(m.sharedAccountBalance) + '</b></div>' +
    '<div class="row"><span>Children</span><b>' + ((S.childrenList || []).length) + '</b></div>' +
    '</div>';

  /* Home selection */
  if (typeof MARRIAGE_HOME_OPTIONS !== 'undefined') {
    if (!m.home) {
      html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">🏠 Set up your home</h3>' +
        '<p class="muted small">Where will you live? Different homes affect privacy, family support, and monthly cost.</p>';
      MARRIAGE_HOME_OPTIONS.forEach(function(h) {
        html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSetHome(\'' + h.id + '\')">' +
          '<div style="display:flex;justify-content:space-between"><b>' + h.label + '</b><span>' + money(marEGP(h.setupCostEGP)) + ' + ' + money(marEGP(h.monthlyCostEGP)) + '/mo</span></div>' +
          '<div class="muted small">' + h.desc + '</div></button>';
      });
      html += '</div>';
    } else {
      const h = MARRIAGE_HOME_OPTIONS.find(function(x) { return x.id === m.home; });
      html += '<div class="card"><h3>🏠 Home</h3>' +
        '<div class="row"><span>Type</span><b>' + (h ? h.label : m.home) + '</b></div>' +
        '<div class="row"><span>Monthly cost</span><b>' + money(marEGP(h ? h.monthlyCostEGP : 0)) + '/mo</b></div>' +
        '<div class="row"><span>Privacy</span><b>' + (h ? h.privacy + '/10' : '—') + '</b></div>' +
        '<div class="row"><span>Family support</span><b>' + (h ? h.familySupport + '/10' : '—') + '</b></div>' +
        '</div>';
    }
  }

  /* Family planning */
  if (typeof MARRIAGE_FAMILY_PLANNING_OPTIONS !== 'undefined') {
    html += '<div class="card"><h3>👶 Family Planning</h3>' +
      '<div class="row"><span>Current plan</span><b>' + ((MARRIAGE_FAMILY_PLANNING_OPTIONS.find(function(x) { return x.id === m.familyPlanning; }) || {}).label || 'Undecided') + '</b></div>';
    MARRIAGE_FAMILY_PLANNING_OPTIONS.forEach(function(o) {
      if (m.familyPlanning === o.id) return;
      html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:6px;font-size:.72rem" onclick="marSetFamilyPlanning(\'' + o.id + '\')">' + o.label + '<br><span class="muted" style="font-size:.65rem">' + o.desc + '</span></button>';
    });
    html += '</div>';
  }

  /* Childcare */
  if (typeof MARRIAGE_CHILDCARE_OPTIONS !== 'undefined' && (S.childrenList && S.childrenList.length > 0)) {
    html += '<div class="card"><h3>👶 Childcare</h3>' +
      '<div class="row"><span>Current</span><b>' + ((MARRIAGE_CHILDCARE_OPTIONS.find(function(x) { return x.id === m.childcare; }) || {}).label || 'None chosen') + '</b></div>';
    MARRIAGE_CHILDCARE_OPTIONS.forEach(function(o) {
      if (m.childcare === o.id) return;
      html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:6px;font-size:.72rem" onclick="marSetChildcare(\'' + o.id + '\')">' +
        o.label + ' · ' + money(marEGP(o.monthlyCostEGP)) + '/mo' + '<br><span class="muted" style="font-size:.65rem">Convenience ' + o.convenience + '/10</span></button>';
    });
    html += '</div>';
  }

  /* Shared account */
  html += '<div class="card"><h3>💰 Shared Account</h3>' +
    '<div class="row"><span>Balance</span><b>' + money(m.sharedAccountBalance) + '</b></div>' +
    '<button class="opt" style="margin-top:6px;width:50%;font-size:.75rem;padding:6px" onclick="marDepositShared()">Deposit</button>' +
    '<button class="opt" style="margin-top:6px;width:50%;font-size:.75rem;padding:6px" onclick="marWithdrawShared()">Withdraw</button>' +
    '</div>';

  /* Try for baby */
  if ((S.childrenList || []).length === 0 || m.familyPlanning !== 'wait') {
    html += '<div class="card"><button class="opt" style="width:100%;text-align:center;background:#fb7185;color:#fff;font-weight:700;padding:10px" onclick="marTryForBaby()">👶 Try for baby</button></div>';
  }

  return html;
}

/* ============================================================
   CONFLICT TAB
   ============================================================ */
function marRenderConflict() {
  const m = S.marriage;
  if (m.status !== 'married' && m.status !== 'engaged' && m.status !== 'dating') {
    return '<div class="card"><h3>⚔️ Conflict</h3><p class="muted small">Not in a relationship.</p></div>';
  }

  let html = '';

  /* Current pending conflict */
  if (m.pendingConflict) {
    const topic = (MARRIAGE_CONFLICT_TOPICS || []).find(function(x) { return x.id === m.pendingConflict; });
    if (topic) {
      html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">⚠️ Conflict: ' + topic.label + '</h3>' +
        '<div class="row"><span>Severity</span><b>' + topic.severity + '/5</b></div>' +
        '<p class="muted small" style="margin:8px 0">' + topic.resolution + '</p>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="opt" style="flex:1;padding:8px;font-size:.75rem;background:#34d399;color:#000;font-weight:700" onclick="marResolveConflict(\'discuss\')">Discuss calmly</button>' +
        '<button class="opt" style="flex:1;padding:8px;font-size:.75rem;background:#22d3ee;color:#000;font-weight:700" onclick="marResolveConflict(\'counsel\')">Counsel · ' + money(marEGP(5000)) + '</button>' +
        '<button class="opt" style="flex:1;padding:8px;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="marResolveConflict(\'ignore\')">Ignore</button>' +
        '</div></div>';
    }
  } else {
    html += '<div class="card"><h3>⚔️ Conflict</h3>' +
      '<p class="muted small">No active conflicts. Conflicts arise when bond is low or stress is high.</p>' +
      (typeof MARRIAGE_CONFLICT_TOPICS !== 'undefined' ? '<p class="muted small" style="margin-top:8px">Common topics you may face: ' + MARRIAGE_CONFLICT_TOPICS.slice(0, 5).map(function(t) { return t.label; }).join(' · ') + '</p>' : '') +
      '</div>';
  }

  /* Separation options */
  if (typeof MARRIAGE_SEPARATION_OPTIONS !== 'undefined' && m.status === 'married') {
    html += '<div class="card"><h3>💔 Marital Difficulty</h3>' +
      '<p class="muted small">When things get hard, these are your options.</p>';
    MARRIAGE_SEPARATION_OPTIONS.forEach(function(o) {
      if (o.id === 'divorce') {
        html += '<button class="opt" style="margin-top:6px;width:100%;text-align:left;padding:8px;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="marAskForDivorce()">' + o.label + ' · ' + money(marEGP(o.costEGP)) + '</button>';
      } else {
        html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSeparationOption(\'' + o.id + '\')">' +
          o.label + (o.costEGP > 0 ? ' · ' + money(marEGP(o.costEGP)) : '') +
          '<br><span class="muted" style="font-size:.65rem">' + o.desc + '</span></button>';
      }
    });
    html += '</div>';
  }

  return html;
}

/* ============================================================
   RECORDS TAB
   ============================================================ */
function marRenderRecords() {
  const m = S.marriage;
  let html = '';

  /* Achievements */
  if (typeof MARRIAGE_ACHIEVEMENTS !== 'undefined') {
    html += '<div class="card"><h3>🏆 Achievements</h3>';
    const earned = m.achievements || [];
    if (!earned.length) html += '<p class="muted small">No achievements yet.</p>';
    else earned.forEach(function(id) {
      const ach = MARRIAGE_ACHIEVEMENTS.find(function(a) { return a.id === id; });
      if (ach) html += '<div class="row"><span>' + ach.label + '</span><span class="muted small">' + ach.desc + '</span></div>';
    });
    html += '</div>';
  }

  /* Milestones */
  if (typeof MARRIAGE_MILESTONES !== 'undefined') {
    html += '<div class="card"><h3>🌟 Milestones</h3>';
    const reached = m.milestones || [];
    if (!reached.length) html += '<p class="muted small">No milestones yet.</p>';
    else reached.forEach(function(id) {
      const mil = MARRIAGE_MILESTONES.find(function(x) { return x.id === id; });
      if (mil) html += '<div class="row"><span>' + mil.label + '</span><span class="muted small">' + mil.desc + '</span></div>';
    });
    html += '</div>';
  }

  /* Ex-spouses */
  if (m.exSpouses && m.exSpouses.length) {
    html += '<div class="card" style="border-color:#666"><h3 style="color:#888">💔 Ex-Partners</h3>';
    m.exSpouses.forEach(function(ex) {
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-weight:700;color:#888">' + ex.name + '</div>' +
        '<div class="muted small">Married ' + ex.marriedYear + ' · Divorced ' + ex.divorcedYear + ' · ' + ex.reason + '</div>';
      if (ex.childSupportAnnual > 0) html += '<div class="muted small">Pays child support: ' + money(ex.childSupportAnnual) + '/yr</div>';
      if (ex.custody) html += '<div class="muted small">Custody: ' + ex.custody + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  /* Conflict history */
  if (m.conflictHistory && m.conflictHistory.length) {
    html += '<div class="card"><h3>📖 Conflict History</h3>';
    m.conflictHistory.slice(-10).reverse().forEach(function(c) {
      html += '<div class="row"><span>' + c.year + ' · ' + c.topic + '</span><span class="muted small">' + c.resolution + '</span></div>';
    });
    html += '</div>';
  }

  return html || '<div class="card"><h3>📜 Records</h3><p class="muted small">No records yet.</p></div>';
}

/* ============================================================
   ACTIONS
   ============================================================ */

window.marTryDate = function(sourceId) {
  const src = MARRIAGE_DATING_SOURCES.find(function(s) { return s.id === sourceId; });
  if (!src) return;
  const cost = marEGP(src.cost);
  if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;
  S.marriage.datingAttempts++;

  if (Math.random() > src.matchChance) {
    log('💔 No luck through ' + src.label + '. Try again.');
    fx({ happiness: -2 });
    render(); return;
  }

  const targetGender = S.gender === 'm' ? 'f' : 'm';
  const names = marNamePool(targetGender);
  const name = names[Math.floor(Math.random() * names.length)];
  const age = Math.max(18, S.age + Math.floor(Math.random() * 8) - 4);
  const traits = marRollTraits();
  S.marriage.partner = {
    name: name,
    age: age,
    gender: targetGender,
    bond: 40 + Math.floor(Math.random() * 20),
    traits: traits,
    income: 0,
    source: src.label,
    familyApproval: src.familyApproval,
    metYear: gameYear()
  };
  S.marriage.status = 'dating';
  log('💕 You started dating ' + name + ' (age ' + age + ') via ' + src.label + '.');
  fx({ happiness: 10 });
  marUnlockAchievement('first_relationship');
  marReachMilestone('first_date');
  render();
};

window.marDoActivity = function(activityId) {
  if (!S.marriage.partner) return;
  const act = (MARRIAGE_RELATIONSHIP_ACTIVITIES || []).find(function(a) { return a.id === activityId; });
  if (!act) return;
  const cost = marEGP(act.costEGP);
  if (S.wealth < cost) { log('Not enough cash.'); render(); return; }
  S.wealth -= cost;
  S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + act.bond);
  fx({ happiness: act.happiness });
  log('💞 ' + act.label + ' with ' + S.marriage.partner.name + '. Bond +' + act.bond + ', Happiness +' + act.happiness + '.');
  render();
};

/* Backwards-compatible quick interactions */
window.marDate = function() { marDoActivity('restaurant'); };
window.marGift = function() { marDoActivity('gift'); };
window.marTalk = function() { marDoActivity('walk'); };
window.marVacation = function() { marDoActivity('weekend'); };

window.marBreakup = function() {
  if (!S.marriage.partner) return;
  if (!confirm('Break up with ' + S.marriage.partner.name + '?')) return;
  log('💔 Broke up with ' + S.marriage.partner.name + '.');
  S.marriage.partner = null;
  S.marriage.status = 'single';
  S.marriage.engagement = null;
  S.marriage.wedding = null;
  fx({ happiness: -12 });
  render();
};

/* Proposal */
window.marSelectProposal = function(optionId) {
  if (!S.marriage.partner) return;
  const opt = MARRIAGE_PROPOSAL_OPTIONS.find(function(x) { return x.id === optionId; });
  if (!opt) return;
  if (!S.marriage.engagement) S.marriage.engagement = { shabkaTier: 'standard', mahrTier: 'standard', partyTier: 'nice_hall' };
  S.marriage.engagement.proposal = optionId;
  S.marriage.engagement.proposalCost = opt.costEGP;
  S.marriage.engagement.proposalRomance = opt.romance;
  render();
};

window.marClearProposal = function() {
  if (S.marriage.engagement) S.marriage.engagement.proposal = null;
  render();
};

window.marConfirmProposal = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p) return;
  const e = m.engagement;
  if (!e || !e.proposal) { log('Pick a proposal style first.'); render(); return; }
  const propOpt = MARRIAGE_PROPOSAL_OPTIONS.find(function(x) { return x.id === e.proposal; });
  const cost = marEGP(propOpt.costEGP);
  if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;

  /* Acceptance chance based on bond + proposal romance */
  let chance = 0.35 + (p.bond / 200) + ((propOpt.romance || 0) / 30);
  chance = Math.max(0.1, Math.min(0.95, chance));

  if (Math.random() > chance) {
    log('💔 ' + p.name + ' said no. The timing was not right.');
    p.bond = Math.max(0, p.bond - 15);
    m.engagement = null;
    fx({ happiness: -15 });
    render(); return;
  }

  p.bond = Math.min(100, p.bond + 15);
  m.status = 'engaged';
  m.engagement.finalized = false;
  log('💍 ' + p.name + ' said YES! You are engaged.');
  fx({ happiness: 25 });
  marUnlockAchievement('engaged');
  marReachMilestone('proposal');
  marReachMilestone('engagement');
  render();
};

window.marEngagementSet = function(key, value) {
  if (!S.marriage.engagement) return;
  S.marriage.engagement[key] = value;
  render();
};

window.marFinalizeEngagement = function() {
  const m = S.marriage;
  const e = m.engagement;
  if (!e || !e.proposal) return;
  const shabka = MARRIAGE_SHABKA_TIERS.find(function(x) { return x.id === e.shabkaTier; });
  const mahr = MARRIAGE_MAHR_TIERS.find(function(x) { return x.id === e.mahrTier; });
  const party = MARRIAGE_ENGAGEMENT_PARTY_TIERS.find(function(x) { return x.id === e.partyTier; });
  if (!shabka || !mahr || !party) return;
  const total = shabka.costEGP + mahr.costEGP + party.costEGP;
  const totalLocal = marEGP(total);
  if (S.wealth < totalLocal) { log('Not enough cash.'); render(); return; }
  S.wealth -= totalLocal;
  m.engagement = {
    shabkaTier: shabka.id, shabkaCost: shabka.costEGP,
    mahrTier: mahr.id, mahrCost: mahr.costEGP,
    partyTier: party.id, partyCost: party.costEGP,
    proposal: e.proposal,
    finalized: true
  };
  m.partner.bond = Math.min(100, m.partner.bond + 10);
  log('💍 Engagement finalized. Shabka, mahr, and party organized. Total ' + money(totalLocal) + '.');
  fx({ happiness: 20 });
  /* Fire a random engagement event */
  if (typeof MARRIAGE_ENGAGEMENT_EVENTS !== 'undefined') {
    const ev = MARRIAGE_ENGAGEMENT_EVENTS[Math.floor(Math.random() * MARRIAGE_ENGAGEMENT_EVENTS.length)];
    log('📖 ' + ev.title + ': ' + ev.text);
  }
  render();
};

/* Wedding */
window.marOpenWeddingPlanner = function() {
  S.marriage.wedding = {
    venue: 'local_hall',
    guests: 'medium',
    catering: 'standard',
    photography: 'professional',
    dress: 'offrack',
    decoration: 'flowers',
    music: 'dj',
    honeymoon: 'egypt_beach',
    planner: 'day_of',
    payer: 'self',
    prenup: 'none',
    financeModel: 'male_provider'
  };
  render();
};

window.marWeddingSet = function(key, value) {
  if (!S.marriage.wedding) return;
  S.marriage.wedding[key] = value;
  render();
};

window.marCancelWeddingPlanner = function() {
  S.marriage.wedding = null;
  render();
};

window.marConfirmWedding = function(total, prenupCostEGP) {
  const m = S.marriage;
  const w = m.wedding;
  if (!w) return;
  const totalLocal = marEGP(total + prenupCostEGP);
  if (S.wealth < totalLocal) { log('Not enough cash.'); render(); return; }
  S.wealth -= totalLocal;

  /* Prenup refusal chance */
  let prenupRecord = null;
  if (w.prenup !== 'none') {
    const prenupDef = MARRIAGE_PRENUP_OPTIONS.find(function(o) { return o.id === w.prenup; });
    const refusalChance = w.prenup === 'full' ? 0.50 : 0.30;
    if (Math.random() < refusalChance) {
      log('💔 ' + m.partner.name + ' refused the prenup. Wedding cancelled.');
      m.partner.bond = Math.max(0, m.partner.bond - 25);
      m.wedding = null;
      render(); return;
    }
    prenupRecord = { type: prenupDef.label, signedYear: gameYear() };
  }

  m.wedding = {
    venue: w.venue, guests: w.guests, catering: w.catering,
    photography: w.photography, dress: w.dress, decoration: w.decoration, music: w.music,
    honeymoon: w.honeymoon, planner: w.planner,
    totalCost: total, payer: w.payer
  };
  m.prenup = prenupRecord;
  m.financeModel = w.financeModel;
  m.status = 'married';
  m.partner.bond = 100;
  m.partner.marriedYear = gameYear();

  /* Achievements */
  marUnlockAchievement('married');
  if (total < 2000000) marUnlockAchievement('budget_wedding');
  if (total > 8000000) marUnlockAchievement('dream_wedding');
  marUnlockAchievement('financial_planners');
  marReachMilestone('marriage');

  /* Fire wedding-day event */
  if (typeof MARRIAGE_WEDDING_EVENTS !== 'undefined') {
    const ev = MARRIAGE_WEDDING_EVENTS[Math.floor(Math.random() * MARRIAGE_WEDDING_EVENTS.length)];
    log('💒 ' + ev.title + ': ' + ev.text);
  }

  log('🎉 You married ' + m.partner.name + '! Total cost: ' + money(totalLocal) + '.');
  fx({ happiness: 30 });

  /* Sync to S.spouse for backwards compat with old family tab */
  S.spouse = {
    name: m.partner.name,
    age: m.partner.age,
    gender: m.partner.gender,
    bond: m.partner.bond,
    income: m.partner.income,
    works: m.partner.income > 0
  };

  render();
};

/* Home */
window.marSetHome = function(homeId) {
  const m = S.marriage;
  const h = MARRIAGE_HOME_OPTIONS.find(function(x) { return x.id === homeId; });
  if (!h) return;
  const setup = marEGP(h.setupCostEGP);
  if (S.wealth < setup) { log('Need ' + money(setup) + ' for setup costs.'); render(); return; }
  S.wealth -= setup;
  m.home = homeId;
  m.homeSetupPaid = true;
  log('🏠 You set up home: ' + h.label + '. Setup cost ' + money(setup) + '. Monthly ' + money(marEGP(h.monthlyCostEGP)) + '.');
  if (h.id !== 'family_home') marUnlockAchievement('homeowners');
  render();
};

/* Family planning */
window.marSetFamilyPlanning = function(optionId) {
  S.marriage.familyPlanning = optionId;
  const opt = MARRIAGE_FAMILY_PLANNING_OPTIONS.find(function(x) { return x.id === optionId; });
  log('👶 Family plan set: ' + (opt ? opt.label : optionId) + '.');
  marUnlockAchievement('family_planner');
  render();
};

window.marSetChildcare = function(optionId) {
  S.marriage.childcare = optionId;
  const opt = MARRIAGE_CHILDCARE_OPTIONS.find(function(x) { return x.id === optionId; });
  log('👶 Childcare set: ' + (opt ? opt.label : optionId) + '.');
  render();
};

/* Shared account */
window.marDepositShared = function() {
  const amt = Math.round(Number(prompt('Deposit how much?\nYou have ' + money(S.wealth), '10000')));
  if (!amt || amt <= 0) return;
  if (S.wealth < amt) { log('Not enough.'); render(); return; }
  S.wealth -= amt;
  S.marriage.sharedAccountBalance += amt;
  log('💰 Deposited ' + money(amt) + ' into shared account.');
  render();
};

window.marWithdrawShared = function() {
  const amt = Math.round(Number(prompt('Withdraw how much?\nAvailable ' + money(S.marriage.sharedAccountBalance), '10000')));
  if (!amt || amt <= 0) return;
  if (S.marriage.sharedAccountBalance < amt) { log('Not enough in shared account.'); render(); return; }
  S.marriage.sharedAccountBalance -= amt;
  S.wealth += amt;
  log('💰 Withdrew ' + money(amt) + ' from shared account.');
  render();
};

/* Try for baby */
window.marTryForBaby = function() {
  if (!S.marriage.partner) return;
  if (S.pregnantMonths > 0) { log('Already expecting!'); render(); return; }
  const ageToUse = S.gender === 'f' ? S.age : S.marriage.partner.age;
  let chance = 0.70;
  if (ageToUse > 30) chance = 0.50;
  if (ageToUse > 35) chance = 0.30;
  if (ageToUse > 40) chance = 0.10;
  if (Math.random() < chance) {
    S.pregnantMonths = 1;
    S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + 10);
    log('🎉 You and ' + S.marriage.partner.name + ' are expecting a baby!');
    fx({ happiness: 20 });
  } else {
    log('Not this month. Try again later.');
    fx({ happiness: -2 });
  }
  render();
};

/* Conflict resolution */
window.marResolveConflict = function(mode) {
  const m = S.marriage;
  if (!m.pendingConflict || !m.partner) return;
  const topic = MARRIAGE_CONFLICT_TOPICS.find(function(x) { return x.id === m.pendingConflict; });

  if (mode === 'discuss') {
    const success = Math.random() < 0.60 + (m.partner.bond / 500);
    if (success) {
      m.partner.bond = Math.min(100, m.partner.bond + 8);
      log('💬 You discussed it calmly. Bond +8.');
      marUnlockAchievement('conflict_resolved');
    } else {
      m.partner.bond = Math.max(0, m.partner.bond - 5);
      log('😞 The conversation went badly. Bond -5.');
    }
  } else if (mode === 'counsel') {
    const cost = marEGP(5000);
    if (S.wealth < cost) { log('Not enough for counselling.'); render(); return; }
    S.wealth -= cost;
    m.partner.bond = Math.min(100, m.partner.bond + 12);
    log('🧠 Counselling helped. Bond +12.');
    marUnlockAchievement('conflict_resolved');
  } else if (mode === 'ignore') {
    m.partner.bond = Math.max(0, m.partner.bond - 10);
    log('😶 You ignored the issue. Bond -10.');
  }

  m.conflictHistory.push({ year: gameYear(), topic: topic ? topic.label : m.pendingConflict, resolution: mode });
  m.pendingConflict = null;
  render();
};

/* Separation options */
window.marSeparationOption = function(optionId) {
  const opt = MARRIAGE_SEPARATION_OPTIONS.find(function(x) { return x.id === optionId; });
  if (!opt) return;
  const cost = marEGP(opt.costEGP);
  if (S.wealth < cost) { log('Not enough cash.'); render(); return; }
  S.wealth -= cost;
  const p = S.marriage.partner;
  if (opt.bondEffect > 0) p.bond = Math.min(100, p.bond + opt.bondEffect);
  else if (opt.bondEffect < 0) p.bond = Math.max(0, p.bond + opt.bondEffect);
  log('💬 ' + opt.label + '. ' + opt.desc);
  render();
};

/* Divorce */
window.marAskForDivorce = function() {
  if (!S.marriage.partner) return;
  const p = S.marriage.partner;
  const causes = MARRIAGE_DIVORCE_CAUSES.map(function(c) { return c.id + ' = ' + c.label; }).join('\n');
  const choice = prompt('Why divorce?\n\n' + causes + '\n\nEnter cause id:', 'boredom');
  if (!choice) return;
  const cause = MARRIAGE_DIVORCE_CAUSES.find(function(c) { return c.id === choice.trim(); });
  if (!cause) { log('Unknown cause.'); return; }

  const law = MARRIAGE_DIVORCE_LAWS[S.country] || MARRIAGE_DIVORCE_LAWS.egy;
  const courtFee = marEGP(law.courtFeeEGP);
  let settlement = 0;
  let childSupportAnnual = 0;
  let custody = null;

  if (law.assetSplit === '50_50' && (!S.marriage.prenup || S.marriage.prenup.type !== 'Comprehensive Financial Agreement')) {
    settlement = Math.floor(S.wealth * 0.5);
  }
  if (S.job && law.alimonyYears > 0 && S.gender === 'm') {
    const years = typeof law.alimonyYears === 'number' ? law.alimonyYears : 1;
    settlement += Math.round(S.job.salary * 0.15 * years);
  }

  const children = S.childrenList || [];
  if (children.length > 0) {
    if (S.job) childSupportAnnual = Math.round(S.job.salary * law.childSupportPct * children.length);
    custody = S.gender === 'f' ? 'You have primary custody' : (law.custody === 'joint' ? 'Joint custody' : 'She has primary custody');
  }

  const totalCost = courtFee + settlement;
  if (!confirm('Divorce under ' + law.label + ':\n\nCourt fee: ' + money(courtFee) + '\nSettlement: ' + money(settlement) + '\nChild support: ' + (childSupportAnnual > 0 ? money(childSupportAnnual) + '/yr' : 'None') + '\nCustody: ' + (custody || 'N/A') + '\n\nTotal upfront: ' + money(totalCost) + '\n\nProceed?')) return;

  if (S.wealth < totalCost) { log('Not enough for divorce (' + money(totalCost) + ').'); render(); return; }
  S.wealth -= totalCost;

  S.marriage.exSpouses.push({
    name: p.name,
    marriedYear: p.marriedYear || gameYear(),
    divorcedYear: gameYear(),
    reason: cause.label,
    childSupportAnnual: childSupportAnnual,
    custody: custody,
    remarried: false
  });
  S.marriage.partner = null;
  S.marriage.status = 'divorced';
  S.marriage.wedding = null;
  S.marriage.engagement = null;
  S.marriage.financeModel = null;
  S.marriage.sharedAccountBalance = 0;
  S.marriage.home = null;
  S.marriage.homeSetupPaid = false;
  S.marriage.tab = 'overview';
  S.spouse = null;

  log('💔 Divorced ' + p.name + '. Reason: ' + cause.label + '. Cost: ' + money(totalCost) + '.');
  fx({ happiness: -25 });
  render();
};

window.marCancelEngagement = function() {
  if (!S.marriage.partner) return;
  if (!confirm('Cancel engagement with ' + S.marriage.partner.name + '?')) return;
  S.marriage.status = 'single';
  S.marriage.engagement = null;
  S.marriage.wedding = null;
  log('💔 Cancelled engagement with ' + S.marriage.partner.name + '.');
  S.marriage.partner = null;
  fx({ happiness: -20 });
  render();
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

  /* Partner aging */
  p.age++;

  /* Bond decay + trait effects */
  let bondChange = -2;
  (p.traits || []).forEach(function(tid) {
    const t = marTrait(tid);
    if (t) bondChange += (t.bondPerYear || 0);
  });
  p.bond = Math.max(0, Math.min(100, p.bond + bondChange));

  /* Partner income growth */
  if (p.income > 0) {
    const ambitious = (p.traits || []).indexOf('ambitious') >= 0 || (p.traits || []).indexOf('career_focused') >= 0;
    p.income = Math.round(p.income * (ambitious ? 1.06 : 1.03));
  }

  /* Home cost */
  if (m.home) {
    const h = (MARRIAGE_HOME_OPTIONS || []).find(function(x) { return x.id === m.home; });
    if (h) {
      const yearly = marEGP(h.monthlyCostEGP * 12);
      if (S.wealth >= yearly) S.wealth -= yearly;
      else log('⚠️ Could not pay home costs (' + money(yearly) + ').');
    }
  }

  /* Childcare cost */
  if (m.childcare) {
    const cc = (MARRIAGE_CHILDCARE_OPTIONS || []).find(function(x) { return x.id === m.childcare; });
    if (cc) {
      const yearly = marEGP(cc.monthlyCostEGP * 12);
      if (S.wealth >= yearly) S.wealth -= yearly;
    }
  }

  /* Random year events */
  if (typeof MARRIAGE_YEAR_EVENTS !== 'undefined' && Math.random() < 0.55) {
    const eligible = MARRIAGE_YEAR_EVENTS.filter(function(e) {
      if (e.requiresNoChildren && (S.childrenList && S.childrenList.length > 0)) return false;
      return true;
    });
    const totalWeight = eligible.reduce(function(s, e) { return s + e.weight; }, 0);
    if (totalWeight > 0) {
      let roll = Math.random() * totalWeight;
      for (let i = 0; i < eligible.length; i++) {
        roll -= eligible[i].weight;
        if (roll <= 0) { marFireYearEvent(eligible[i]); break; }
      }
    }
  }

  /* Spontaneous conflicts when bond low */
  if (m.status === 'married' && !m.pendingConflict && p.bond < 50 && Math.random() < 0.20 && typeof MARRIAGE_CONFLICT_TOPICS !== 'undefined') {
    const topic = MARRIAGE_CONFLICT_TOPICS[Math.floor(Math.random() * MARRIAGE_CONFLICT_TOPICS.length)];
    m.pendingConflict = topic.id;
    log('⚔️ Conflict arose: ' + topic.label + '.');
  }

  /* Partner divorce threat */
  if (m.status === 'married' && p.bond < 20 && Math.random() < 0.20) {
    log('💔 ' + p.name + ' asked for a divorce. Bond was too low.');
    const law = MARRIAGE_DIVORCE_LAWS[S.country] || MARRIAGE_DIVORCE_LAWS.egy;
    const courtFee = marEGP(law.courtFeeEGP);
    let settlement = 0;
    if (law.assetSplit === '50_50' && (!m.prenup || m.prenup.type !== 'Comprehensive Financial Agreement')) settlement = Math.floor(S.wealth * 0.5);
    if (S.wealth >= courtFee + settlement) S.wealth -= (courtFee + settlement);
    m.exSpouses.push({
      name: p.name,
      marriedYear: p.marriedYear || gameYear(),
      divorcedYear: gameYear(),
      reason: 'Mutual — bond too low',
      childSupportAnnual: 0,
      custody: null,
      remarried: false
    });
    m.partner = null;
    m.status = 'divorced';
    m.wedding = null;
    m.engagement = null;
    m.financeModel = null;
    m.sharedAccountBalance = 0;
    m.home = null;
    S.spouse = null;
    fx({ happiness: -25 });
    return;
  }

  /* Milestones by years married */
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

  /* Child support from exes */
  m.exSpouses.forEach(function(ex) {
    if (ex.childSupportAnnual > 0) {
      const annual = ex.childSupportAnnual;
      if (S.wealth >= annual) {
        S.wealth -= annual;
        log('💸 Child support paid to ' + ex.name + ': ' + money(annual) + '.');
      } else {
        log('⚠️ Could not pay child support to ' + ex.name + '.');
      }
    }
  });
});

function marFireYearEvent(evt) {
  const p = S.marriage.partner;
  if (!p) return;
  if (evt.id === 'partner_promotion') {
    p.income = Math.round((p.income || 50000) * 1.15);
    log('🎉 ' + p.name + ' got promoted. Income now ' + money(p.income) + '/yr.');
    p.bond = Math.min(100, p.bond + 5);
  } else if (evt.id === 'partner_lost_job') {
    p.income = 0;
    log('😔 ' + p.name + ' lost their job. Money will be tight.');
    p.bond = Math.max(0, p.bond - 5);
  } else if (evt.id === 'anniversary') {
    log('💍 It is your anniversary with ' + p.name + '. Consider a gift or date.');
  } else if (evt.id === 'inlaws_visit') {
    log('👵 Your in-laws are visiting. Bond and money matter this week.');
  } else if (evt.id === 'partner_bond_warning') {
    log('💬 ' + p.name + ' seems distant. Spend time together.');
  } else if (evt.id === 'partner_wants_gift') {
    log('🎁 ' + p.name + ' hints at wanting a gift.');
  } else if (evt.id === 'partner_wants_trip') {
    log('✈️ ' + p.name + ' wants to plan a trip together.');
  } else if (evt.id === 'partner_wants_child') {
    log('👶 ' + p.name + ' brings up having a baby.');
  } else if (evt.id === 'unexpected_bill') {
    const cost = marEGP(20000);
    if (S.wealth >= cost) { S.wealth -= cost; log('💸 Unexpected bill: ' + money(cost) + '.'); }
  } else if (evt.id === 'home_upgrade') {
    log('🏠 You discuss moving to a larger home.');
  } else if (evt.id === 'career_move') {
    log('💼 Your partner received a career offer in another city.');
  } else if (evt.id === 'family_pressure') {
    log('👵 Relatives are asking questions about your private plans.');
  } else if (evt.id === 'forgotten_anniversary') {
    if (p.bond > 30) { p.bond = Math.max(0, p.bond - 5); log('😞 You forgot an important date. Bond -5.'); }
  } else if (evt.id === 'shared_goal') {
    log('🎯 Your partner wants to work toward a shared goal.');
  } else if (evt.id === 'partner_study') {
    log('📚 Your partner wants to study or take a course.');
  } else if (evt.id === 'holiday_planning') {
    log('🎉 You plan holiday arrangements together.');
  } else if (evt.id === 'household_chores') {
    if (p.bond > 25) { p.bond = Math.max(0, p.bond - 2); log('🧹 Chore distribution felt unfair. Bond -2.'); }
  } else if (evt.id === 'old_friend') {
    log('👥 An old friend contacted ' + p.name + '.');
  } else if (evt.id === 'financial_review') {
    log('💰 Annual financial review. You discussed savings and spending.');
  } else if (evt.id === 'relationship_milestone') {
    log('💞 A milestone. You appreciate how far you have come.');
  }
}

/* ============================================================
   REGISTER
   ============================================================ */
GameHooks.registerTab({ id: 'marriage', label: '💍 Marriage', order: 9, view: marriageView });
