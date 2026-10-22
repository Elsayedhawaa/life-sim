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
      premaritalHistory: [],
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
  if (!Array.isArray(m.premaritalHistory)) m.premaritalHistory = [];
  if (!m.tab) m.tab = 'overview';

  /* Backwards-compatible defaults for older dating/engagement saves. */
  if (m.partner && (m.status === 'dating' || m.status === 'engaged')) {
    const p = m.partner;
    if (typeof p.bond !== 'number') p.bond = 45;
    if (typeof p.trust !== 'number') p.trust = Math.max(25, Math.min(75, p.bond - 5));
    if (typeof p.communication !== 'number') p.communication = 40;
    if (typeof p.compatibility !== 'number') p.compatibility = 55;
    if (typeof p.exclusive !== 'boolean') p.exclusive = m.status === 'engaged';
    if (typeof p.relationshipStage !== 'string') p.relationshipStage = m.status === 'engaged' ? 'engaged' : 'getting_to_know_you';
    if (!Array.isArray(p.memories)) p.memories = [];
    if (!Array.isArray(p.talkedTopics)) p.talkedTopics = [];
    if (!p.topicCounts || typeof p.topicCounts !== 'object') p.topicCounts = {};
    if (!p.activityCounts || typeof p.activityCounts !== 'object') p.activityCounts = {};
    if (typeof p.dateCount !== 'number') p.dateCount = 0;
    if (typeof p.commitmentTalks !== 'number') p.commitmentTalks = p.talkedTopics.indexOf('marriage') >= 0 ? 1 : 0;
    if (typeof p.familyIntroduced !== 'boolean') p.familyIntroduced = false;
    if (typeof p.exclusiveAttempts !== 'number') p.exclusiveAttempts = 0;
    if (typeof p.lastExclusiveAttemptDateCount !== 'number') p.lastExclusiveAttemptDateCount = -99;
    if (typeof p.proposalAttempts !== 'number') p.proposalAttempts = 0;
    if (typeof p.partnerProposalOffered !== 'boolean') p.partnerProposalOffered = false;
    if (typeof p.pendingPartnerProposal === 'undefined') p.pendingPartnerProposal = null;
    if (!p.preferences || typeof p.preferences !== 'object') p.preferences = marCreatePartnerPreferences(p.traits || ['kind']);
  }

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
var MAR_EGP_BASE_RATE = 52.7;
function marRate() { return C().rate || 1; }
function marEGP(amountEGP) {
  var localRate = C().rate || 1;
  var countryMult = (typeof MARRIAGE_COUNTRY_MULT !== 'undefined' && MARRIAGE_COUNTRY_MULT[S.country]) || 1.0;
  var adjustedEGP = amountEGP * countryMult;

  if (localRate === MAR_EGP_BASE_RATE && countryMult === 1.0) return Math.round(adjustedEGP || 0);
  return Math.round((adjustedEGP || 0) * (localRate / MAR_EGP_BASE_RATE));
}
function marNamePool(gender) {
  const pool = (typeof MARRIAGE_PARTNER_NAMES !== 'undefined' && MARRIAGE_PARTNER_NAMES[S.country]) || MARRIAGE_PARTNER_NAMES.egy;
  return gender === 'm' ? pool.m : pool.f;
}
function marTrait(id) { return MARRIAGE_PARTNER_TRAITS[id] || null; }
function marBondColor(v) { return v > 70 ? '#34d399' : v > 40 ? '#fbbf24' : '#fb7185'; }
function marCountryProfile() {
  return (typeof MARRIAGE_COUNTRY_PROFILES !== 'undefined' && MARRIAGE_COUNTRY_PROFILES[S.country]) || null;
}
function marIsTraditionalWoman() {
  if (S.gender !== 'f') return false;
  const prof = marCountryProfile();
  return prof && prof.traditionalGenderRoles === true;
}
function marRollTraits() {
  const positive = ['kind', 'funny', 'romantic', 'calm', 'ambitious', 'religious', 'generous', 'loyal', 'independent', 'family_oriented', 'patient', 'supportive', 'communicative', 'adventurous', 'homebody', 'mature', 'frugal', 'career_focused', 'shy', 'outgoing', 'private', 'sentimental', 'financially_cautious', 'confident'];
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

function marClamp(value, min, max) {
  const n = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}

function marHasTrait(partner, traitId) {
  return !!(partner && Array.isArray(partner.traits) && partner.traits.indexOf(traitId) >= 0);
}

function marCreatePartnerPreferences(traits) {
  traits = Array.isArray(traits) ? traits : [];
  let preferredActivity = 'cafe';
  if (traits.indexOf('homebody') >= 0) preferredActivity = 'home_cooked_dinner';
  else if (traits.indexOf('adventurous') >= 0) preferredActivity = 'weekend';
  else if (traits.indexOf('family_oriented') >= 0 || traits.indexOf('traditional') >= 0) preferredActivity = 'family_visit';
  else if (traits.indexOf('romantic') >= 0 || traits.indexOf('sentimental') >= 0) preferredActivity = 'gift';
  else if (traits.indexOf('outgoing') >= 0) preferredActivity = 'restaurant';
  else if (traits.indexOf('frugal') >= 0 || traits.indexOf('financially_cautious') >= 0) preferredActivity = 'walk';

  let proposalStyle = 'personal';
  if (traits.indexOf('shy') >= 0 || traits.indexOf('private') >= 0 || traits.indexOf('homebody') >= 0) proposalStyle = 'simple';
  else if (traits.indexOf('traditional') >= 0 || traits.indexOf('family_oriented') >= 0) proposalStyle = 'family';
  else if (traits.indexOf('adventurous') >= 0) proposalStyle = 'trip';
  else if (traits.indexOf('outgoing') >= 0) proposalStyle = 'restaurant';
  else if (traits.indexOf('romantic') >= 0 || traits.indexOf('sentimental') >= 0) proposalStyle = 'personal';

  let weddingStyle = 'local_hall';
  let guestPreference = 'medium';
  if (traits.indexOf('frugal') >= 0 || traits.indexOf('financially_cautious') >= 0 || traits.indexOf('private') >= 0) {
    weddingStyle = 'family_home'; guestPreference = 'small';
  } else if (traits.indexOf('traditional') >= 0 || traits.indexOf('family_oriented') >= 0) {
    weddingStyle = 'traditional'; guestPreference = 'large';
  } else if (traits.indexOf('extravagant') >= 0 || traits.indexOf('outgoing') >= 0) {
    weddingStyle = 'hotel_4star'; guestPreference = 'large';
  } else if (traits.indexOf('adventurous') >= 0) {
    weddingStyle = 'garden'; guestPreference = 'medium';
  }

  return {
    preferredActivity: preferredActivity,
    proposalStyle: proposalStyle,
    weddingVenue: weddingStyle,
    guestCount: guestPreference,
    pace: (traits.indexOf('patient') >= 0 || traits.indexOf('independent') >= 0 || traits.indexOf('shy') >= 0) ? 'slow' : 'steady',
    privateRomanticMoments: traits.indexOf('private') >= 0 || traits.indexOf('shy') >= 0
  };
}

function marRecordMemory(kind, text, importance) {
  if (!S || !S.marriage) return;
  const p = S.marriage.partner;
  const entry = {
    kind: kind || 'interaction',
    text: text || 'An interaction took place.',
    year: typeof gameYear === 'function' ? gameYear() : 0,
    importance: marClamp(importance || 1, 1, 5)
  };
  S.marriage.premaritalHistory.push(entry);
  if (S.marriage.premaritalHistory.length > 60) S.marriage.premaritalHistory.splice(0, S.marriage.premaritalHistory.length - 60);
  if (p && (S.marriage.status === 'dating' || S.marriage.status === 'engaged')) {
    if (!Array.isArray(p.memories)) p.memories = [];
    p.memories.push(entry);
    if (p.memories.length > 40) p.memories.splice(0, p.memories.length - 40);
  }
}

function marPremaritalReadiness(partner) {
  const p = partner || (S && S.marriage && S.marriage.partner);
  if (!p) return { score: 0, ready: false, reasons: ['Meet a partner first.'] };
  const bond = marClamp(p.bond, 0, 100);
  const trust = marClamp(p.trust, 0, 100);
  const communication = marClamp(p.communication, 0, 100);
  const compatibility = marClamp(p.compatibility, 0, 100);
  const commitmentTalks = Number(p.commitmentTalks || 0);
  const score = Math.round(bond * 0.30 + trust * 0.30 + communication * 0.12 + compatibility * 0.18 + Math.min(10, commitmentTalks * 10));
  const reasons = [];
  if (!p.exclusive) reasons.push('Discuss becoming an exclusive couple first.');
  if (bond < 55) reasons.push('Build a stronger bond (55% or higher).');
  if (trust < 50) reasons.push('Build more trust (50% or higher).');
  if (commitmentTalks < 1) reasons.push('Have an honest conversation about marriage readiness.');
  return { score: score, ready: reasons.length === 0, reasons: reasons };
}

function marProposalStyleFit(partner, option) {
  if (!partner || !option) return 0;
  let fit = partner.preferences && partner.preferences.proposalStyle === option.id ? 10 : 0;
  if ((marHasTrait(partner, 'shy') || marHasTrait(partner, 'private') || marHasTrait(partner, 'homebody')) && (option.social || 0) >= 5) fit -= 18;
  if ((marHasTrait(partner, 'traditional') || marHasTrait(partner, 'family_oriented')) && option.id === 'family') fit += 10;
  if (marHasTrait(partner, 'adventurous') && option.id === 'trip') fit += 8;
  if ((marHasTrait(partner, 'romantic') || marHasTrait(partner, 'sentimental')) && (option.id === 'personal' || option.id === 'trip')) fit += 6;
  return fit;
}

function marWeddingCostShare(payer) {
  if (payer === 'split') return 0.50;
  if (payer === 'partner_family') return 0.25;
  if (payer === 'own_family') return 0.50;
  return 1;
}

function marGetWeddingSelection(wedding) {
  const w = wedding || {};
  const pick = function(items, id, fallback) {
    return (items || []).find(function(x) { return x.id === id; }) ||
      (items || []).find(function(x) { return x.id === fallback; }) ||
      (items || [])[0] || { id: id || fallback || 'none', costEGP: 0 };
  };
  const venue = pick(MARRIAGE_WEDDING_VENUES, w.venue, 'local_hall');
  const guests = pick(MARRIAGE_GUEST_COUNTS, w.guests, 'medium');
  const catering = pick(MARRIAGE_CATERING_TIERS, w.catering, 'standard');
  const photo = pick(MARRIAGE_PHOTOGRAPHY_TIERS, w.photography, 'professional');
  const dress = pick(MARRIAGE_DRESS_TIERS, w.dress, 'offrack');
  const decor = pick(MARRIAGE_DECORATION_TIERS, w.decoration, 'flowers');
  const music = pick(MARRIAGE_MUSIC_OPTIONS, w.music, 'dj');
  const honeymoon = pick(MARRIAGE_HONEYMOON_TIERS, w.honeymoon, 'egypt_beach');
  const planner = pick(MARRIAGE_PLANNER_OPTIONS, w.planner, 'day_of');
  const prenup = pick(MARRIAGE_PRENUP_OPTIONS, w.prenup, 'none');
  const baseTotal = Number(venue.baseCostEGP || 0) + (Number(guests.guests || 0) * Number(catering.perGuestEGP || 0)) +
    Number(photo.costEGP || 0) + Number(dress.costEGP || 0) + Number(decor.costEGP || 0) +
    Number(music.costEGP || 0) + Number(honeymoon.costEGP || 0) + Number(planner.costEGP || 0);
  const share = marWeddingCostShare(w.payer);
  const eventCostLocal = marEGP(baseTotal * share);
  const prenupCostLocal = marEGP(Number(prenup.legalCostEGP || 0));
  return {
    venue: venue, guests: guests, catering: catering, photo: photo, dress: dress,
    decor: decor, music: music, honeymoon: honeymoon, planner: planner, prenup: prenup,
    baseTotalEGP: baseTotal, share: share, eventCostLocal: eventCostLocal,
    prenupCostLocal: prenupCostLocal, playerTotalLocal: eventCostLocal + prenupCostLocal,
    fullTotalLocal: marEGP(baseTotal + Number(prenup.legalCostEGP || 0))
  };
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

  /* Premarital relationship progression: intentionally ends at the wedding. */
  if (m.status === 'dating' || m.status === 'engaged') {
    html += marRenderPremaritalPanel();
  }

  /* Relationship activities */
  if (typeof MARRIAGE_RELATIONSHIP_ACTIVITIES !== 'undefined' && m.status !== 'engaged') {
    html += '<div class="card"><h3>💞 Spend Time Together</h3>';
    if (prof && prof.activities) {
      html += '<p class="muted small" style="margin-bottom:8px">In ' + prof.label + ': ' + prof.activities.slice(0, 3).join(' · ') + '</p>';
    }
    (m.status === 'dating' ? MARRIAGE_RELATIONSHIP_ACTIVITIES : MARRIAGE_RELATIONSHIP_ACTIVITIES.slice(0, 8)).forEach(function(act) {
      html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem" onclick="marDoActivity(\'' + act.id + '\')">' +
        '<div style="display:flex;justify-content:space-between"><b>' + act.label + '</b><span>' + money(marEGP(act.costEGP)) + '</span></div>' +
        '<div class="muted small">Bond +' + act.bond + ' · Happiness +' + act.happiness + '</div></button>';
    });
    html += '</div>';
  }

  return html;
}

function marRenderPremaritalPanel() {
  const m = S.marriage;
  const p = m.partner;
  if (!p || (m.status !== 'dating' && m.status !== 'engaged')) return '';
  const readiness = marPremaritalReadiness(p);
  const stageLabels = {
    getting_to_know_you: 'Getting to know each other',
    getting_serious: 'Getting serious',
    exclusive: 'Exclusive couple',
    engaged: 'Engaged'
  };
  const stage = m.status === 'engaged' ? 'engaged' : (p.exclusive ? 'exclusive' : 'getting_to_know_you');
  let html = '<div class="card" style="border-color:#8b5cf6"><h3>💗 Relationship Progress</h3>' +
    '<div class="row"><span>Stage</span><b>' + (stageLabels[stage] || stageLabels.getting_to_know_you) + '</b></div>' +
    '<div class="row"><span>Trust</span><b>' + marClamp(p.trust, 0, 100) + '%</b></div>' +
    '<div class="row"><span>Communication</span><b>' + marClamp(p.communication, 0, 100) + '%</b></div>' +
    '<div class="row"><span>Compatibility</span><b>' + marClamp(p.compatibility, 0, 100) + '%</b></div>' +
    '<div class="row"><span>Marriage readiness</span><b>' + readiness.score + '%</b></div>' +
    '<p class="muted small" style="margin-top:8px">Trust and readiness grow through honest conversations, respecting preferences, and consistent actions—not just expensive dates.</p>';

  if (m.status === 'dating') {
    if (!p.exclusive) {
      const nextAttempt = Number(p.lastExclusiveAttemptDateCount || -99) + 2;
      const cooldown = Number(p.dateCount || 0) < nextAttempt;
      html += '<button class="opt" style="width:100%;margin-top:8px;text-align:center" ' + (cooldown ? 'disabled' : '') + ' onclick="marAskExclusive()">💞 Discuss becoming an exclusive couple</button>';
      if (cooldown) html += '<p class="muted small">Give the relationship more time and share a few more experiences before revisiting exclusivity.</p>';
    } else if (!p.familyIntroduced) {
      html += '<button class="opt" style="width:100%;margin-top:8px;text-align:center" onclick="marIntroduceFamilies()">👨‍👩‍👧 Introduce your families</button>';
    }
    if (readiness.ready) {
      html += '<p class="good small" style="margin-top:8px">You have discussed commitment and may choose a proposal in the Plan tab.</p>';
    } else {
      html += '<div class="muted small" style="margin-top:8px"><b>Before proposing:</b><ul style="margin:4px 0 0 18px">' + readiness.reasons.map(function(r) { return '<li>' + r + '</li>'; }).join('') + '</ul></div>';
    }
  } else {
    if (!p.familyIntroduced) {
      html += '<button class="opt" style="width:100%;margin-top:8px;text-align:center" onclick="marIntroduceFamilies()">👨‍👩‍👧 Arrange a family introduction</button>';
    }
    html += '<p class="muted small" style="margin-top:8px">Use conversations and planning choices to keep the wedding aligned with both partners’ expectations.</p>';
  }
  html += '</div>';

  html += '<div class="card"><h3>💬 Get to Know ' + p.name + '</h3><p class="muted small">Choose a topic. Your partner responds based on personality, previous conversations, and the relationship so far.</p>';
  (MARRIAGE_PREMARITAL_CONVERSATIONS || []).forEach(function(topic) {
    const count = Number((p.topicCounts || {})[topic.id] || 0);
    html += '<button class="opt" style="width:100%;margin-top:5px;text-align:left;padding:8px;font-size:.75rem" onclick="marPremaritalTalk(\'' + topic.id + '\')">' +
      '<b>' + topic.label + '</b>' + (count > 0 ? ' <span class="muted">· discussed ' + count + '×</span>' : '') +
      '<div class="muted small">' + topic.desc + '</div></button>';
  });
  if (p.memories && p.memories.length) {
    const memory = p.memories[p.memories.length - 1];
    html += '<div style="margin-top:10px;padding:8px;background:#0f0f1a;border-radius:8px"><div class="muted small">Recent memory · ' + (memory.year || '?') + '</div><div style="font-size:.75rem">' + memory.text + '</div></div>';
  }
  html += '</div>';
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

  /* A partner can independently bring up engagement after a serious, mutual discussion. */
  if (m.status === 'dating' && p.pendingPartnerProposal) {
    html += '<div class="card" style="border-color:#fbbf24"><h3>💍 ' + p.name + ' Wants to Ask You Something</h3>' +
      '<p class="muted small">After thinking about your conversations, ' + p.name + ' is ready to ask whether you want to become engaged. This is their decision, and you can accept, ask for more time, or decline.</p>' +
      '<button class="opt" style="width:100%;margin-top:5px;text-align:center;background:#34d399;color:#000;font-weight:700" onclick="marRespondToPartnerProposal(\'accept\')">💍 Accept the proposal</button>' +
      '<button class="opt" style="width:100%;margin-top:5px;text-align:center" onclick="marRespondToPartnerProposal(\'time\')">Ask for more time</button>' +
      '<button class="opt" style="width:100%;margin-top:5px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="marRespondToPartnerProposal(\'decline\')">Decline respectfully</button></div>';
  }

  /* Proposal phase */
  if (m.status === 'dating' && !p.pendingPartnerProposal) {
    const readiness = marPremaritalReadiness(p);
    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">💍 Proposal</h3>';
    if (!m.engagement || !m.engagement.proposal) {
      if (!readiness.ready) {
        html += '<p class="muted small">A proposal is a major decision. Your partner needs to feel that the relationship is ready.</p>' +
          '<div class="row"><span>Current readiness</span><b>' + readiness.score + '%</b></div>' +
          '<ul class="muted small" style="margin:6px 0 0 18px">' + readiness.reasons.map(function(r) { return '<li>' + r + '</li>'; }).join('') + '</ul>';
      } else {
        html += '<p class="muted small">Choose a proposal style that reflects your partner’s personality and preferences. Either a male or female player can initiate the proposal.</p>';
        if (typeof MARRIAGE_PROPOSAL_OPTIONS !== 'undefined') {
          MARRIAGE_PROPOSAL_OPTIONS.forEach(function(opt) {
            const fit = marProposalStyleFit(p, opt);
            html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSelectProposal(\'' + opt.id + '\')">' +
              '<div style="display:flex;justify-content:space-between"><b>' + opt.label + '</b><span>' + money(marEGP(opt.costEGP)) + '</span></div>' +
              '<div class="muted small">Romance +' + opt.romance + ' · Social +' + opt.social + ' · ' + opt.desc + (fit > 5 ? ' · Likely to suit your partner' : fit < -5 ? ' · May not suit your partner’s preferences' : '') + '</div></button>';
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

     /* Wedding planner — only available after engagement is finalized */
    if (m.wedding) {
      html += '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">🎉 Wedding Planning</h3>';
      html += marRenderWeddingPlanner();
      html += '</div>';
    } else if (m.engagement && m.engagement.finalized) {
      html += '<div class="card">' +
        '<p class="muted small">Engagement finalized. Now plan the wedding — the biggest expense of the marriage.</p>' +
        '<button class="opt" style="text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="marOpenWeddingPlanner()">Start wedding planning</button>' +
        '</div>';
    } else {
      html += '<div class="card" style="border-color:#666;opacity:.6">' +
        '<p class="muted small">🔒 <b>Locked.</b> Finalize the engagement first (Shabka, Mahr, Party) before planning the wedding.</p>' +
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
  const affordable = !!prop && S.wealth >= marEGP(prop.costEGP);

  return '<div style="margin-top:8px;padding:10px;background:#0f0f1a;border-radius:8px">' +
    '<div style="font-weight:700">' + (prop ? prop.label : e.proposal) + '</div>' +
    '<div class="muted small">' + (prop ? prop.desc : '') + '</div>' +
    '<div class="row" style="margin-top:6px"><span>Cost</span><b>' + money(marEGP(prop ? prop.costEGP : 0)) + '</b></div>' +
    '<button class="opt" style="margin-top:8px;text-align:center;background:' + (affordable ? '#fb7185' : '#25253a') + ';color:' + (affordable ? '#fff' : '#777') + ';font-weight:700" ' + (affordable ? '' : 'disabled') + ' onclick="marConfirmProposal()">' + (affordable ? '💍 Propose now' : 'Not enough money') + '</button>' +
    '<button class="opt" style="margin-top:6px;text-align:center;border-color:#666;color:#888" onclick="marClearProposal()">Change proposal style</button>' +
    '</div>';
}

function marRenderEngagementPlanner() {
  const e = S.marriage.engagement;
  if (!e) return '';
  const isTraditionalWoman = marIsTraditionalWoman();
  
  // Default payer logic for new engagements
  if (typeof e.payer === 'undefined') {
    e.payer = isTraditionalWoman ? 'partner' : 'self';
  }

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
  
  const totalEGP = shabka.costEGP + mahr.costEGP + party.costEGP;
  const totalLocal = marEGP(totalEGP);
  
  let playerShare = 1;
  if (e.payer === 'partner') playerShare = 0;
  else if (e.payer === 'split') playerShare = 0.5;
  
  const playerTotalLocal = Math.round(totalLocal * playerShare);
  const canAfford = S.wealth >= playerTotalLocal;

  let html = '';
  html += picker('Shabka (bride\'s gold)', MARRIAGE_SHABKA_TIERS, 'shabkaTier', e.shabkaTier, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Mahr (deferred dowry)', MARRIAGE_MAHR_TIERS, 'mahrTier', e.mahrTier, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Engagement party', MARRIAGE_ENGAGEMENT_PARTY_TIERS, 'partyTier', e.partyTier, function(t) { return money(marEGP(t.costEGP)); });

  // ADD PAYER SELECTION
  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Who pays for the engagement?</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">';
  html += '<button class="pill ' + (e.payer === 'self' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'self\')">You pay all</button>';
  html += '<button class="pill ' + (e.payer === 'partner' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'partner\')">Partner pays</button>';
  html += '<button class="pill ' + (e.payer === 'split' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'split\')">Split 50/50</button>';
  html += '</div>';

  if (isTraditionalWoman) {
    html += '<p class="muted small" style="margin-top:6px;color:#8b5cf6">💡 Cultural tradition: In your country, the groom and his family traditionally cover these costs.</p>';
  }

  html += '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">' +
    '<div class="row"><span>Shabka</span><b>' + money(marEGP(shabka.costEGP)) + '</b></div>' +
    '<div class="row"><span>Mahr</span><b>' + money(marEGP(mahr.costEGP)) + '</b></div>' +
    '<div class="row"><span>Party</span><b>' + money(marEGP(party.costEGP)) + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total Cost</b><b style="color:#fbbf24">' + money(totalLocal) + '</b></div>' +
    (playerShare < 1 ? '<div class="row"><span>Your share (' + Math.round(playerShare*100) + '%)</span><b style="color:#34d399">' + money(playerTotalLocal) + '</b></div>' : '') +
    '</div>';

  html += '<button class="opt" style="margin-top:10px;text-align:center;background:' + (canAfford ? '#34d399' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + ';font-weight:700" ' + (canAfford ? '' : 'disabled') + ' onclick="marFinalizeEngagement()">' + (canAfford ? 'Confirm engagement · ' + money(playerTotalLocal) : 'Need ' + money(playerTotalLocal)) + '</button>';

  return html;
}

function marRenderWeddingPlanner() {
  const w = S.marriage.wedding;
  if (!w) return '';
  const isTraditionalWoman = marIsTraditionalWoman();

  // Auto-default the payer based on gender/culture
  if (typeof w.payer === 'undefined') {
    w.payer = isTraditionalWoman ? 'partner_family' : 'self';
  }

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

  const selection = marGetWeddingSelection(w);
  const venue = selection.venue;
  const guests = selection.guests;
  const catering = selection.catering;
  const photo = selection.photo;
  const dress = selection.dress;
  const decor = selection.decor;
  const music = selection.music;
  const honey = selection.honeymoon;
  const planner = selection.planner;
  const prenup = selection.prenup;

  const total = selection.baseTotalEGP;
  const totalLocal = marEGP(total);
  const prenupLocal = selection.prenupCostLocal;
  
  // NOTE: If female in traditional country, her dress might be the only thing she pays for
  let share = 1;
  if (w.payer === 'split') share = 0.5;
  else if (w.payer === 'partner_family') share = isTraditionalWoman ? 0.15 : 0.25; // Woman pays ~15% (dress/makeup)
  else if (w.payer === 'own_family') share = 0.5;

  const playerWeddingShare = marEGP(total * share);
  const playerTotal = playerWeddingShare + prenupLocal;
  const canAfford = S.wealth >= playerTotal;

  let html = '';
  html += picker('Venue', MARRIAGE_WEDDING_VENUES, 'venue', w.venue, function(t) { return money(marEGP(t.baseCostEGP)); });
  html += picker('Guests', MARRIAGE_GUEST_COUNTS, 'guests', w.guests, function(t) { return t.guests + ' ppl'; }, 3);
  html += picker('Catering', MARRIAGE_CATERING_TIERS, 'catering', w.catering, function(t) { return money(marEGP(t.perGuestEGP)) + '/g'; });
  html += picker('Photography', MARRIAGE_PHOTOGRAPHY_TIERS, 'photography', w.photography, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Attire', MARRIAGE_DRESS_TIERS, 'dress', w.dress, function(t) { return money(marEGP(t.costEGP)); });
  if (typeof MARRIAGE_DECORATION_TIERS !== 'undefined') html += picker('Decoration & flowers', MARRIAGE_DECORATION_TIERS, 'decoration', w.decoration, function(t) { return money(marEGP(t.costEGP)); });
  if (typeof MARRIAGE_MUSIC_OPTIONS !== 'undefined') html += picker('Music', MARRIAGE_MUSIC_OPTIONS, 'music', w.music, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Honeymoon', MARRIAGE_HONEYMOON_TIERS, 'honeymoon', w.honeymoon, function(t) { return money(marEGP(t.costEGP)); });
  if (typeof MARRIAGE_PLANNER_OPTIONS !== 'undefined') html += picker('Wedding planner', MARRIAGE_PLANNER_OPTIONS, 'planner', w.planner, function(t) { return money(marEGP(t.costEGP)); });

  /* Breakdown */
  html += '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Full wedding cost</b><b style="color:#34d399">' + money(totalLocal) + '</b></div>' +
    (prenup.legalCostEGP > 0 ? '<div class="row"><span>Prenup (' + prenup.label + ')</span><b>' + money(prenupLocal) + '</b></div>' : '') +
    '<div class="row"><span>Your share (' + Math.round(share * 100) + '%)</span><b>' + money(playerWeddingShare) + '</b></div>' +
    '<div class="row"><b>Your total to pay</b><b style="color:' + (canAfford ? '#34d399' : '#fb7185') + '">' + money(playerTotal) + '</b></div>' +
    (w.payer === 'partner_family' ? '<p class="muted small" style="color:#8b5cf6">💡 Cultural tradition: The groom and his family cover the vast majority of the wedding.</p>' : '') +
    '</div>';

  /* Prenup */
  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Prenup</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  MARRIAGE_PRENUP_OPTIONS.forEach(function(o) {
    html += '<button class="pill ' + (w.prenup === o.id ? 'on' : '') + '" style="padding:6px;font-size:.65rem" onclick="marWeddingSet(\'prenup\',\'' + o.id + '\')">' + o.label + (o.legalCostEGP > 0 ? '<br><span class="muted" style="font-size:.6rem">' + money(marEGP(o.legalCostEGP)) + '</span>' : '') + '</button>';
  });
  html += '</div>';

  /* Who pays */
  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Who pays?</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' +
    '<button class="pill ' + (w.payer === 'self' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'self\')">You pay all</button>' +
    '<button class="pill ' + (w.payer === 'split' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'split\')">Split 50/50</button>' +
    '<button class="pill ' + (w.payer === 'partner_family' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'partner_family\')">Partner & his family</button>' +
    '<button class="pill ' + (w.payer === 'own_family' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'own_family\')">Your family helps</button>' +
    '</div>';

  html += '<button class="opt" style="margin-top:12px;text-align:center;background:' + (canAfford ? '#34d399' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + ';font-weight:700" ' + (canAfford ? '' : 'disabled') + ' onclick="marConfirmWedding()">' + (canAfford ? '💒 Hold wedding · pay ' + money(playerTotal) : 'Need ' + money(playerTotal)) + '</button>';
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

  /* Premarital memories */
  const premarital = Array.isArray(m.premaritalHistory) ? m.premaritalHistory.slice(-15).reverse() : [];
  if (premarital.length) {
    html += '<div class="card"><h3>💌 Dating & Wedding Memories</h3>';
    premarital.forEach(function(item) {
      html += '<div style="padding:7px 0;border-bottom:1px solid #1a1a2a"><div class="muted small">' + (item.year || '?') + ' · ' + (item.kind || 'Memory') + '</div><div style="font-size:.78rem">' + item.text + '</div></div>';
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
  ensureMarriageState();
  const m = S.marriage;
  if (m.status !== 'single' && m.status !== 'divorced') {
    log('You can only start meeting partners while single.'); render(); return;
  }
  if (S.age < 16) { log('You must be at least 16 to use the dating system.'); render(); return; }
  const src = (MARRIAGE_DATING_SOURCES || []).find(function(s) { return s.id === sourceId; });
  if (!src) return;
  if (S.age < src.minAge || S.age > src.maxAge) { log('This meeting option is not available at your age.'); render(); return; }
  if (src.requiresEducation && !S.uni && !S.degree) { log('This option requires education.'); render(); return; }
  if (src.requiresJob && !S.job) { log('This option requires a job.'); render(); return; }
  const cost = marEGP(src.cost);
  if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;
  m.datingAttempts++;

  /* Previous failed attempts can modestly improve familiarity, never guarantee a match. */
  const familiarityBonus = Math.min(0.08, Math.max(0, m.datingAttempts - 1) * 0.01);
  if (Math.random() > Math.min(0.95, src.matchChance + familiarityBonus)) {
    log('💔 No promising match came from ' + src.label + ' this time. You can try another route later.');
    fx({ happiness: -1 });
    render(); return;
  }

  const targetGender = S.gender === 'm' ? 'f' : 'm';
  const names = marNamePool(targetGender) || [];
  const name = names.length ? names[Math.floor(Math.random() * names.length)] : (targetGender === 'f' ? 'Alexandra' : 'Alex');
  const age = Math.max(18, S.age + Math.floor(Math.random() * 7) - 3);
  const traits = marRollTraits();
  const compatibility = marClamp(45 + Math.floor(Math.random() * 36) +
    (traits.indexOf('communicative') >= 0 ? 4 : 0) +
    (traits.indexOf('mature') >= 0 ? 4 : 0) -
    (traits.indexOf('stubborn') >= 0 ? 4 : 0), 25, 92);
  m.partner = {
    name: name,
    age: age,
    gender: targetGender,
    bond: 42 + Math.floor(Math.random() * 17),
    trust: 38 + Math.floor(Math.random() * 18),
    communication: 35 + Math.floor(Math.random() * 21),
    compatibility: compatibility,
    traits: traits,
    income: 0,
    source: src.label,
    familyApproval: src.familyApproval,
    metYear: gameYear(),
    relationshipStage: 'getting_to_know_you',
    exclusive: false,
    memories: [],
    talkedTopics: [],
    topicCounts: {},
    activityCounts: {},
    dateCount: 0,
    commitmentTalks: 0,
    familyIntroduced: false,
    exclusiveAttempts: 0,
    lastExclusiveAttemptDateCount: -99,
    proposalAttempts: 0,
    partnerProposalOffered: false,
    pendingPartnerProposal: null,
    preferences: marCreatePartnerPreferences(traits)
  };
  m.status = 'dating';
  m.engagement = null;
  m.wedding = null;
  marRecordMemory('first_meeting', 'You met ' + name + ' through ' + src.label + '.', 2);
  log('💕 You met ' + name + ' (age ' + age + ') via ' + src.label + '. You will need to get to know each other before considering engagement.');
  fx({ happiness: 8 });
  marUnlockAchievement('first_relationship');
  marReachMilestone('first_date');
  render();
};

window.marDoActivity = function(activityId) {
  ensureMarriageState();
  const m = S.marriage;
  const p = m.partner;
  if (!p) return;
  const act = (MARRIAGE_RELATIONSHIP_ACTIVITIES || []).find(function(a) { return a.id === activityId; });
  if (!act) return;
  const cost = marEGP(act.costEGP);
  if (S.wealth < cost) { log('Not enough cash for ' + act.label + ' (' + money(cost) + ').'); render(); return; }
  if (m.status !== 'dating' && m.status !== 'engaged' && m.status !== 'married') {
    log('This activity is not available at the current relationship stage.'); render(); return;
  }
  S.wealth -= cost;

  /* Preserve the existing married-life effect; premarital actions use contextual outcomes. */
  if (m.status === 'married') {
    p.bond = marClamp(Number(p.bond || 0) + Number(act.bond || 0), 0, 100);
    fx({ happiness: Number(act.happiness || 0) });
    log('💞 ' + act.label + ' with ' + p.name + '. Bond +' + act.bond + ', Happiness +' + act.happiness + '.');
    render(); return;
  }

  if (!p.activityCounts || typeof p.activityCounts !== 'object') p.activityCounts = {};
  const count = Number(p.activityCounts[activityId] || 0);
  const isFavourite = p.preferences && p.preferences.preferredActivity === activityId;
  const diminishing = count >= 3 ? 2 : count >= 1 ? 1 : 0;
  let bondChange = Number(act.bond || 0) - diminishing;
  let happinessChange = Number(act.happiness || 0) - diminishing;
  let trustChange = 1;
  let communicationChange = act.time === 'short' ? 1 : 2;
  let message = 'You spent time together.';

  if (isFavourite) {
    bondChange += 3;
    happinessChange += 2;
    trustChange += 1;
    message = p.name + ' especially enjoyed an activity that suits their interests.';
  } else if (count >= 3) {
    message = 'You enjoyed time together, though repeating the same activity is becoming less special.';
  }
  if (marHasTrait(p, 'frugal') || marHasTrait(p, 'financially_cautious')) {
    if (cost === 0 || activityId === 'walk' || activityId === 'financial_talk') trustChange += 1;
    if (cost > marEGP(5000)) trustChange -= 1;
  }
  if (marHasTrait(p, 'romantic') && (activityId === 'gift' || activityId === 'restaurant' || activityId === 'weekend')) bondChange += 1;
  if (marHasTrait(p, 'homebody') && activityId === 'weekend') happinessChange -= 1;
  if (marHasTrait(p, 'adventurous') && (activityId === 'weekend' || activityId === 'shared_hobby')) bondChange += 1;
  if (activityId === 'financial_talk') { trustChange += 2; communicationChange += 2; }

  p.bond = marClamp(Number(p.bond || 0) + bondChange, 0, 100);
  p.trust = marClamp(Number(p.trust || 0) + trustChange, 0, 100);
  p.communication = marClamp(Number(p.communication || 0) + communicationChange, 0, 100);
  p.activityCounts[activityId] = count + 1;
  p.dateCount = Number(p.dateCount || 0) + 1;
  p.relationshipStage = p.exclusive ? 'exclusive' : (p.dateCount >= 2 && p.bond >= 55 ? 'getting_serious' : 'getting_to_know_you');
  fx({ happiness: happinessChange });
  marRecordMemory('date_activity', act.label + ' with ' + p.name + '. ' + message, isFavourite ? 3 : 1);
  log('💞 ' + act.label + ' with ' + p.name + '. Bond ' + (bondChange >= 0 ? '+' : '') + bondChange + ', trust ' + (trustChange >= 0 ? '+' : '') + trustChange + '. ' + message);
  render();
};

window.marPremaritalTalk = function(topicId) {
  ensureMarriageState();
  const m = S.marriage;
  const p = m.partner;
  if (!p || (m.status !== 'dating' && m.status !== 'engaged')) {
    log('These conversations are available while dating or engaged.'); render(); return;
  }
  const topic = (MARRIAGE_PREMARITAL_CONVERSATIONS || []).find(function(t) { return t.id === topicId; });
  if (!topic) return;
  if (!p.topicCounts || typeof p.topicCounts !== 'object') p.topicCounts = {};
  if (!Array.isArray(p.talkedTopics)) p.talkedTopics = [];
  const priorCount = Number(p.topicCounts[topic.id] || 0);
  const repeatPenalty = priorCount > 0 ? Math.min(3, priorCount) : 0;

  let trustChange = Number(topic.trust || 0) - repeatPenalty;
  let bondChange = Number(topic.bond || 0) - Math.min(2, repeatPenalty);
  let communicationChange = Number(topic.communication || 0);
  let compatibilityChange = priorCount === 0 ? Number(topic.compatibility || 0) : 0;
  let response = 'The conversation helped you understand each other a little better.';

  if (marHasTrait(p, 'communicative') || marHasTrait(p, 'mature')) {
    trustChange += 1;
    communicationChange += 1;
  }
  if (marHasTrait(p, 'avoidant') && (topic.id === 'finances' || topic.id === 'children' || topic.id === 'marriage')) {
    trustChange -= 2;
    communicationChange -= 1;
    response = p.name + ' found the subject difficult and would prefer to revisit it gently later.';
  } else if (marHasTrait(p, 'patient') && (topic.id === 'commitment' || topic.id === 'marriage')) {
    trustChange += 1;
    response = p.name + ' appreciated that you discussed commitment without rushing the decision.';
  } else if (topic.id === 'finances' && (marHasTrait(p, 'frugal') || marHasTrait(p, 'financially_cautious'))) {
    trustChange += 2;
    response = p.name + ' appreciated the practical and honest financial conversation.';
  } else if (topic.id === 'family' && (marHasTrait(p, 'family_oriented') || marHasTrait(p, 'traditional'))) {
    response = p.name + ' appreciated that you took family expectations seriously.';
  } else if (topic.id === 'interests' && p.preferences && p.preferences.preferredActivity) {
    response = p.name + ' shared more about what they enjoy and the kinds of experiences that make them happy.';
  }

  p.bond = marClamp(Number(p.bond || 0) + bondChange, 0, 100);
  p.trust = marClamp(Number(p.trust || 0) + trustChange, 0, 100);
  p.communication = marClamp(Number(p.communication || 0) + communicationChange, 0, 100);
  p.compatibility = marClamp(Number(p.compatibility || 0) + compatibilityChange, 0, 100);
  p.topicCounts[topic.id] = priorCount + 1;
  if (p.talkedTopics.indexOf(topic.id) < 0) p.talkedTopics.push(topic.id);
  if (topic.id === 'commitment' || topic.id === 'marriage') p.commitmentTalks = Math.max(1, Number(p.commitmentTalks || 0));
  marRecordMemory('conversation_' + topic.id, 'You discussed ' + topic.topic + ' with ' + p.name + '. ' + response, topic.id === 'marriage' || topic.id === 'finances' ? 3 : 2);
  log('💬 ' + topic.label + ': ' + response + ' Bond ' + (bondChange >= 0 ? '+' : '') + bondChange + ', trust ' + (trustChange >= 0 ? '+' : '') + trustChange + '.');

  /* Partner agency: after a serious conversation, a ready partner may initiate engagement. */
   if ((topic.id === 'marriage' || topic.id === 'commitment') && m.status === 'dating' &&
      p.exclusive && !p.partnerProposalOffered && !p.pendingPartnerProposal &&
      (!m.engagement || !m.engagement.proposal) && Number(p.bond || 0) >= 70 && Number(p.trust || 0) >= 65 &&
      marPremaritalReadiness(p).score >= 75) {
      
      let baseChance = 0.12 + (marPremaritalReadiness(p).score - 75) * 0.012;
      if (marHasTrait(p, 'confident')) baseChance += 0.05;
      if (marHasTrait(p, 'romantic')) baseChance += 0.04;
      
      // BOOST CHANCE IF TRADITIONAL WOMAN
      if (marIsTraditionalWoman()) baseChance += 0.35; 

      const partnerInitiationChance = marClamp(baseChance, 0.12, 0.90);
      
      if (Math.random() < partnerInitiationChance) {
        p.partnerProposalOffered = true;
        p.pendingPartnerProposal = { year: gameYear(), kind: 'engagement' };
        marRecordMemory('partner_proposal', p.name + ' decided to ask whether you would like to become engaged.', 5);
        log('💍 ' + p.name + ' has something important to ask. Open the Plan tab to respond to their proposal.');
      }
    }
  render();
};

window.marRespondToPartnerProposal = function(choice) {
  ensureMarriageState();
  const m = S.marriage;
  const p = m.partner;
  if (m.status !== 'dating' || !p || !p.pendingPartnerProposal) {
    log('There is no pending proposal from your partner.'); render(); return;
  }
  if (choice === 'accept') {
    marRecordMemory('partner_proposal_accepted', 'You accepted ' + p.name + '’s proposal to become engaged.', 5);
    p.pendingPartnerProposal = null;
    p.exclusive = true;
    p.relationshipStage = 'engaged';
    p.bond = marClamp(Number(p.bond || 0) + 6, 0, 100);
    p.trust = marClamp(Number(p.trust || 0) + 5, 0, 100);
    m.engagement = {
      proposal: 'partner_initiated',
      proposalCost: 0,
      proposalRomance: 5,
      shabkaTier: 'standard',
      mahrTier: 'standard',
      partyTier: 'nice_hall',
      initiatedBy: 'partner',
      finalized: false
    };
    m.status = 'engaged';
    log('💍 You accepted ' + p.name + '’s proposal! You are engaged and can begin planning the engagement arrangements.');
    fx({ happiness: 24 });
    marUnlockAchievement('engaged');
    marReachMilestone('proposal');
    marReachMilestone('engagement');
  } else if (choice === 'time') {
    marRecordMemory('partner_proposal_postponed', 'You asked ' + p.name + ' for more time before deciding about engagement.', 3);
    p.pendingPartnerProposal = null;
    p.trust = marClamp(Number(p.trust || 0) + 1, 0, 100);
    log('💬 You asked ' + p.name + ' for more time. They respected your honesty, and the relationship continues.');
  } else if (choice === 'decline') {
    marRecordMemory('partner_proposal_declined', 'You respectfully declined ' + p.name + '’s engagement proposal.', 4);
    p.pendingPartnerProposal = null;
    p.bond = marClamp(Number(p.bond || 0) - 8, 0, 100);
    p.trust = marClamp(Number(p.trust || 0) - 6, 0, 100);
    log('💬 You declined ' + p.name + '’s proposal. The relationship may continue, but they feel hurt and the next conversation will matter.');
    fx({ happiness: -5 });
  } else {
    return;
  }
  render();
};

window.marAskExclusive = function() {
  ensureMarriageState();
  const m = S.marriage;
  const p = m.partner;
  if (m.status !== 'dating' || !p) { log('You need to be dating someone first.'); render(); return; }
  if (p.exclusive) { log('You are already an exclusive couple.'); render(); return; }
  if (Number(p.dateCount || 0) < Number(p.lastExclusiveAttemptDateCount || -99) + 2) {
    log('Give the relationship more time before raising exclusivity again.'); render(); return;
  }
  const chance = marClamp(0.20 + Number(p.bond || 0) * 0.0032 + Number(p.trust || 0) * 0.0025 + Number(p.compatibility || 0) * 0.0012 + (marHasTrait(p, 'patient') ? 0.05 : 0) - (marHasTrait(p, 'avoidant') ? 0.08 : 0), 0.12, 0.92);
  p.exclusiveAttempts = Number(p.exclusiveAttempts || 0) + 1;
  p.lastExclusiveAttemptDateCount = Number(p.dateCount || 0);
  if (Math.random() <= chance) {
    p.exclusive = true;
    p.relationshipStage = 'exclusive';
    p.bond = marClamp(Number(p.bond || 0) + 4, 0, 100);
    p.trust = marClamp(Number(p.trust || 0) + 5, 0, 100);
    marRecordMemory('became_exclusive', 'You and ' + p.name + ' agreed to be an exclusive couple.', 4);
    log('💞 You and ' + p.name + ' agreed to be exclusive. You are taking the relationship seriously together.');
    marReachMilestone('exclusive');
  } else {
    p.bond = marClamp(Number(p.bond || 0) - 2, 0, 100);
    p.trust = marClamp(Number(p.trust || 0) - 2, 0, 100);
    marRecordMemory('exclusivity_discussion', 'You asked ' + p.name + ' about exclusivity, but they were not ready to agree yet.', 2);
    log('💬 ' + p.name + ' is not ready to define the relationship yet. Keep getting to know each other and revisit the subject later.');
  }
  render();
};

window.marIntroduceFamilies = function() {
  ensureMarriageState();
  const m = S.marriage;
  const p = m.partner;
  if ((m.status !== 'dating' && m.status !== 'engaged') || !p || !p.exclusive) { log('Become an exclusive couple before arranging a family introduction.'); render(); return; }
  if (p.familyIntroduced) { log('You have already arranged a family introduction.'); render(); return; }
  const approval = marFamilyApproval(p);
  const chance = marClamp(0.30 + approval * 0.42 + Number(p.bond || 0) * 0.0015 + Number(p.compatibility || 0) * 0.001 - (marHasTrait(p, 'private') ? 0.04 : 0), 0.25, 0.95);
  p.familyIntroduced = true;
  marReachMilestone('meet_family');
  if (Math.random() <= chance) {
    p.familyApproval = marClamp(Number(p.familyApproval || 0.7) + 0.08, 0.1, 1);
    p.trust = marClamp(Number(p.trust || 0) + 3, 0, 100);
    marRecordMemory('family_introduction', 'The family introduction with ' + p.name + ' went well.', 3);
    log('👨‍👩‍👧 The family introduction went well. ' + p.name + ' appreciated how you handled it.');
  } else {
    p.familyApproval = marClamp(Number(p.familyApproval || 0.7) - 0.06, 0.1, 1);
    marRecordMemory('family_introduction', 'The family introduction with ' + p.name + ' was uncomfortable, but it does not decide the relationship by itself.', 3);
    log('👨‍👩‍👧 The family introduction was awkward. It may take time to build understanding, but it does not automatically end the relationship.');
  }
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
  ensureMarriageState();
  const m = S.marriage;
  if (m.status !== 'dating' || !m.partner) { log('You must be dating someone to propose.'); render(); return; }
  const readiness = marPremaritalReadiness(m.partner);
  if (!readiness.ready) { log('Your relationship is not ready for a proposal yet. ' + readiness.reasons.join(' ')); render(); return; }
  const opt = (MARRIAGE_PROPOSAL_OPTIONS || []).find(function(x) { return x.id === optionId; });
  if (!opt) return;
  if (S.wealth < marEGP(opt.costEGP)) { log('Not enough cash for this proposal.'); render(); return; }
  if (!m.engagement || m.status !== 'dating') m.engagement = { shabkaTier: 'standard', mahrTier: 'standard', partyTier: 'nice_hall' };
  m.engagement.proposal = optionId;
  m.engagement.proposalCost = opt.costEGP;
  m.engagement.proposalRomance = opt.romance;
  render();
};

window.marClearProposal = function() {
  if (S.marriage && S.marriage.status === 'dating' && S.marriage.engagement) {
    S.marriage.engagement.proposal = null;
    S.marriage.engagement.proposalCost = 0;
  }
  render();
};

window.marConfirmProposal = function() {
  ensureMarriageState();
  const m = S.marriage;
  const p = m.partner;
  if (m.status !== 'dating' || !p) { log('You must be dating someone to propose.'); render(); return; }
  const readiness = marPremaritalReadiness(p);
  if (!readiness.ready) { log('Your relationship is not ready for a proposal yet. ' + readiness.reasons.join(' ')); render(); return; }
  const e = m.engagement;
  if (!e || !e.proposal) { log('Choose a proposal style first.'); render(); return; }
  const propOpt = (MARRIAGE_PROPOSAL_OPTIONS || []).find(function(x) { return x.id === e.proposal; });
  if (!propOpt) { log('That proposal option is no longer available.'); render(); return; }
  const cost = marEGP(propOpt.costEGP);
  if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }

  const styleFit = marProposalStyleFit(p, propOpt);
  const readinessScore = readiness.score;
  let chance = 0.08 + Number(p.bond || 0) * 0.0022 + Number(p.trust || 0) * 0.0025 +
    Number(p.compatibility || 0) * 0.0013 + Number(p.communication || 0) * 0.0008 +
    readinessScore * 0.0015 + styleFit * 0.004;
  if (marHasTrait(p, 'patient') && p.preferences && p.preferences.pace === 'slow' && readinessScore < 75) chance -= 0.08;
  if (marHasTrait(p, 'confident')) chance += 0.03;
  chance = marClamp(chance, 0.15, 0.95);
  S.wealth -= cost;
  p.proposalAttempts = Number(p.proposalAttempts || 0) + 1;

  if (Math.random() > chance) {
    const asksForTime = readinessScore < 68 || (p.preferences && p.preferences.pace === 'slow' && p.proposalAttempts === 1);
    if (asksForTime) {
      log('💬 ' + p.name + ' cares about you but is not ready to accept yet. They asked for more time rather than ending the relationship.');
      p.bond = marClamp(Number(p.bond || 0) - 2, 0, 100);
      p.trust = marClamp(Number(p.trust || 0) - 1, 0, 100);
      marRecordMemory('proposal_postponed', p.name + ' asked for more time before deciding about marriage.', 4);
    } else {
      log('💔 ' + p.name + ' declined the proposal. The proposal style or timing may not have felt right, but the relationship can continue.');
      p.bond = marClamp(Number(p.bond || 0) - 6, 0, 100);
      p.trust = marClamp(Number(p.trust || 0) - 4, 0, 100);
      marRecordMemory('proposal_declined', p.name + ' declined a proposal. The couple may discuss readiness again later.', 4);
    }
    m.engagement = null;
    fx({ happiness: -8 });
    render(); return;
  }

  p.bond = marClamp(Number(p.bond || 0) + 8, 0, 100);
  p.trust = marClamp(Number(p.trust || 0) + 6, 0, 100);
  p.exclusive = true;
  p.relationshipStage = 'engaged';
  m.status = 'engaged';
  m.engagement.finalized = false;
  marRecordMemory('proposal_accepted', p.name + ' accepted the ' + propOpt.label.toLowerCase() + ' proposal.', 5);
  log('💍 ' + p.name + ' said YES! You are engaged. Now discuss the engagement arrangements and plan a wedding together.');
  fx({ happiness: 22 });
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
  
  const totalEGP = shabka.costEGP + mahr.costEGP + party.costEGP;
  const totalLocal = marEGP(totalEGP);
  
  const payer = e.payer || 'self';
  let playerShare = 1;
  if (payer === 'partner') playerShare = 0;
  else if (payer === 'split') playerShare = 0.5;
  
  const playerTotal = Math.round(totalLocal * playerShare);

  if (S.wealth < playerTotal) { log('Not enough cash.'); render(); return; }
  S.wealth -= playerTotal;
  
  m.engagement = {
    shabkaTier: shabka.id, shabkaCost: shabka.costEGP,
    mahrTier: mahr.id, mahrCost: mahr.costEGP,
    partyTier: party.id, partyCost: party.costEGP,
    proposal: e.proposal,
    payer: payer,
    finalized: true
  };
  m.partner.bond = Math.min(100, m.partner.bond + 10);
  
  if (payer === 'partner') {
    log('💍 Engagement finalized. Your partner and his family covered the ' + money(totalLocal) + ' costs.');
  } else {
    log('💍 Engagement finalized. You paid ' + money(playerTotal) + '.');
  }
  fx({ happiness: 20 });
  
  if (typeof MARRIAGE_ENGAGEMENT_EVENTS !== 'undefined') {
    const ev = MARRIAGE_ENGAGEMENT_EVENTS[Math.floor(Math.random() * MARRIAGE_ENGAGEMENT_EVENTS.length)];
    log('📖 ' + ev.title + ': ' + ev.text);
  }
  render();
};
/* Wedding */
window.marOpenWeddingPlanner = function() {
  ensureMarriageState();
  const m = S.marriage;
  if (m.status !== 'engaged' || !m.partner || !m.engagement || !m.engagement.finalized) {
    log('Finalize the engagement before starting wedding planning.'); render(); return;
  }
  if (!m.wedding) {
    const pref = m.partner.preferences || {};
    m.wedding = {
      venue: pref.weddingVenue || 'local_hall',
      guests: pref.guestCount || 'medium',
      catering: 'standard',
      photography: 'professional',
      dress: 'offrack',
      decoration: 'flowers',
      music: 'dj',
      honeymoon: 'egypt_beach',
      planner: 'day_of',
      payer: 'self',
      prenup: 'none',
      /* Neutral default: never infer financial roles from either partner's gender. */
      financeModel: 'egalitarian'
    };
  }
  render();
};

window.marWeddingSet = function(key, value) {
  const m = S.marriage;
  if (m.status !== 'engaged' || !m.engagement || !m.engagement.finalized || !m.wedding) return;
  const allowed = {
    venue: MARRIAGE_WEDDING_VENUES,
    guests: MARRIAGE_GUEST_COUNTS,
    catering: MARRIAGE_CATERING_TIERS,
    photography: MARRIAGE_PHOTOGRAPHY_TIERS,
    dress: MARRIAGE_DRESS_TIERS,
    decoration: MARRIAGE_DECORATION_TIERS,
    music: MARRIAGE_MUSIC_OPTIONS,
    honeymoon: MARRIAGE_HONEYMOON_TIERS,
    planner: MARRIAGE_PLANNER_OPTIONS,
    prenup: MARRIAGE_PRENUP_OPTIONS,
    financeModel: MARRIAGE_FINANCE_MODELS
  };
  if (key === 'payer') {
    if (['self', 'split', 'partner_family', 'own_family'].indexOf(value) < 0) return;
  } else {
    const list = allowed[key];
    if (!list || !(list || []).some(function(x) { return x.id === value; })) return;
  }
  if (key === 'prenup' && m.wedding.prenup !== value) {
    m.wedding.prenupAccepted = false;
    m.wedding.prenupRejected = false;
  }
  m.wedding[key] = value;
  render();
};

window.marCancelWeddingPlanner = function() {
  if (!S.marriage || S.marriage.status !== 'engaged') return;
  if (!confirm('Discard the current wedding plan? No wedding costs have been charged yet.')) return;
  S.marriage.wedding = null;
  render();
};

window.marConfirmWedding = function() {
  const m = S.marriage;
  const w = m.wedding;
  if (!w) return;
  const isTraditionalWoman = marIsTraditionalWoman();

  const selection = marGetWeddingSelection(w);
  
  let share = 1;
  if (w.payer === 'split') share = 0.5;
  else if (w.payer === 'partner_family') share = isTraditionalWoman ? 0.15 : 0.25;
  else if (w.payer === 'own_family') share = 0.5;

  const playerTotalLocal = marEGP(selection.baseTotalEGP * share) + selection.prenupCostLocal;
  
  if (S.wealth < playerTotalLocal) { log('Not enough cash.'); render(); return; }
  S.wealth -= playerTotalLocal;

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
    totalCost: selection.baseTotalEGP, payer: w.payer
  };
  m.prenup = prenupRecord;
  m.financeModel = w.financeModel;
  m.status = 'married';
  m.partner.bond = 100;
  m.partner.marriedYear = gameYear();

  marUnlockAchievement('married');
  if (selection.baseTotalEGP < 2000000) marUnlockAchievement('budget_wedding');
  if (selection.baseTotalEGP > 8000000) marUnlockAchievement('dream_wedding');
  marUnlockAchievement('financial_planners');
  marReachMilestone('marriage');

  if (typeof MARRIAGE_WEDDING_EVENTS !== 'undefined') {
    const ev = MARRIAGE_WEDDING_EVENTS[Math.floor(Math.random() * MARRIAGE_WEDDING_EVENTS.length)];
    log('💒 ' + ev.title + ': ' + ev.text);
  }

  log('🎉 You married ' + m.partner.name + '! You paid ' + money(playerTotalLocal) + '.');
  fx({ happiness: 30 });

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
