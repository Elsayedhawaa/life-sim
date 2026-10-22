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
      status: 'single', partner: null, engagement: null, wedding: null,
      financeModel: null, sharedAccountBalance: 0, prenup: null, exSpouses: [],
      datingAttempts: 0, lastDateYear: 0, home: null, homeSetupPaid: false,
      familyPlanning: 'undecided', childcare: null, achievements: [], milestones: [],
      conflictHistory: [], pendingConflict: null, premaritalHistory: [], tab: 'overview',
      husbandHomeProvided: false
    };
  }
  const m = S.marriage;
  if (!Array.isArray(m.exSpouses)) m.exSpouses = [];
  if (typeof m.sharedAccountBalance !== 'number') m.sharedAccountBalance = 0;
  if (!m.trousseau) m.trousseau = { tier: null, payer: null, cost: 0, completed: false };
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
  if (typeof m.motherInLawBond !== 'number') m.motherInLawBond = 50;
  if (typeof m.mahrAdvanced !== 'number') m.mahrAdvanced = 0;
  if (typeof m.mahrDeferred !== 'number') m.mahrDeferred = 0;
  if (typeof m.trousseauComplete !== 'boolean') m.trousseauComplete = false;
  if (typeof m.stress !== 'number') m.stress = 20;
  if (typeof m.lastInLawVisitYear !== 'number') m.lastInLawVisitYear = 0;
  if (typeof m.lastStressReliefYear !== 'number') m.lastStressReliefYear = 0;
  if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];
  if (!S.shopping) S.shopping = { inventory: [] };
  if (!Array.isArray(S.shopping.inventory)) S.shopping.inventory = [];
  /* Reset husbandHomeProvided if not currently engaged/married (fresh start after divorce/breakup) */
  if (m.status === 'single' || m.status === 'divorced') {
    m.husbandHomeProvided = false;
  }
  if (typeof m.husbandHomeProvided !== 'boolean') m.husbandHomeProvided = false;

  /* Default gehazPayer based on culture */
  if (!m.gehazPayer) {
    const isTradWoman = (S.gender === 'f' && MARRIAGE_COUNTRY_PROFILES && MARRIAGE_COUNTRY_PROFILES[S.country] && MARRIAGE_COUNTRY_PROFILES[S.country].traditionalGenderRoles === true);
    if (isTradWoman) m.gehazPayer = 'groom';
    else if (S.gender === 'm') m.gehazPayer = 'self';
    else m.gehazPayer = 'split';
  }

  /* Backwards-compatible defaults for older dating/engagement saves */
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
      name: S.spouse.name, age: S.spouse.age || S.age,
      gender: S.spouse.gender || (S.gender === 'm' ? 'f' : 'm'),
      bond: S.spouse.bond || 70, traits: ['kind'],
      income: S.spouse.income || 0, source: 'legacy',
      familyApproval: 0.8, metYear: gameYear(), marriedYear: gameYear()
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
  if (typeof m.motherInLawBond !== 'number') m.motherInLawBond = 50;
  if (typeof m.mahrAdvanced !== 'number') m.mahrAdvanced = 0;
  if (typeof m.mahrDeferred !== 'number') m.mahrDeferred = 0;
  if (typeof m.trousseauComplete !== 'boolean') m.trousseauComplete = false;
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
const bond = (typeof p.bond === 'number') ? p.bond : 70;
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

  if (m.status === 'dating' || m.status === 'engaged') {
    html += marRenderPremaritalPanel();
  }

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
  const isArranged = p.source && p.source.indexOf('Salonat') >= 0;
  if (isArranged && m.status === 'dating') {
    html += '<div class="card" style="border-color:#fbbf24;background:#fbbf2410">' +
      '<b style="color:#fbbf24;font-size:.85rem">💍 Arranged Introduction (Salonat)</b>' +
      '<p class="muted small" style="margin-top:4px">Your families arranged this match. You are expected to marry soon, but you barely know each other. Building trust and communication is critical before the wedding.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700;font-size:.75rem" onclick="marSetTab(\'plan\')">Proceed to Engagement →</button>' +
      '</div>';
  }
  if (m.status === 'engaged') {
    const hamaColor = m.motherInLawBond > 70 ? '#34d399' : m.motherInLawBond > 40 ? '#fbbf24' : '#fb7185';
    html += '<div class="card" style="border-color:' + hamaColor + '">' +
      '<h3 style="color:' + hamaColor + '">👵 Mother-in-Law</h3>' +
      '<div class="row"><span>Bond</span><b style="color:' + hamaColor + '">' + m.motherInLawBond + '%</b></div>' +
      '<p class="muted small">Your relationship with his mother matters. A low bond will cause drama during the wedding.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="marVisitMotherInLaw()">☕ Visit her for tea</button>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="marCheckTrousseau()">🛋 Check Trousseau (Gehaz) Status</button>' +
      '</div>';
  }
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
window.marVisitMotherInLaw = function() {
  const m = S.marriage;
  if (!m.partner) return;
  
  const traits = m.partner.traits || [];
  let change = 5;
  
  if (traits.includes('mamas_boy')) {
    change += 5;
  }
  if (marHasTrait(m.partner, 'protector')) {
    change += 3;
  }

  if (Math.random() < 0.3) {
    log('👵 You visited your mother-in-law. She criticized your outfit.');
    change = -5;
    fx({ happiness: -3 });
  } else {
    log('👵 You visited your mother-in-law. You helped her with chores. She appreciated it.');
    fx({ happiness: 2 });
  }
  
  m.motherInLawBond = Math.max(0, Math.min(100, m.motherInLawBond + change));
  render();
};
window.marAskForHand = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p || m.status !== 'dating') return;

  /* In traditional cultures, the man asks the woman's father. She must wait for his proposal. */
  if (marIsTraditionalWoman()) {
    log('❌ In your culture, the man and his family approach your father. You must wait for him to propose.');
    return;
  }

  const fatherApproval = marFamilyApproval(p);

  if (fatherApproval < 0.6) {
    log('❌ The father refused. "You are not ready to take care of my daughter/son." (Need 60% family approval).');
    return;
  }

  if (!confirm('Ask for the hand in marriage?\n\nThis is the traditional step before the engagement. Proceed?')) return;

  log('🎉 The father said yes! You are officially permitted to proceed with the engagement.');
  m.engagement = {
    proposal: 'family',
    shabkaTier: 'standard',
    mahrTier: 'standard',
    partyTier: 'nice_hall',
    payer: 'self'
  };
  m.status = 'engaged';
  render();
};
/* Hint at marriage (traditional woman only — encourages HIM to propose) */
window.marHintAtProposal = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p || m.status !== 'dating') return;

  const readiness = marPremaritalReadiness(p);
  if (!readiness.ready) {
    log('The relationship is not ready yet. ' + readiness.reasons.join(' '));
    return;
  }

  let chance = 0.25 + Math.max(0, readiness.score - 75) * 0.01;
  if (marHasTrait(p, 'confident')) chance += 0.05;
  if (marHasTrait(p, 'romantic')) chance += 0.05;
  if (marHasTrait(p, 'traditional')) chance += 0.10;
  if (marHasTrait(p, 'family_oriented')) chance += 0.05;
  chance = Math.max(0.15, Math.min(0.90, chance));

  if (Math.random() < chance) {
    // Trigger the popup immediately instead of waiting for the Plan tab
    marTriggerProposalEvent(p);
  } else {
    log('💬 You hinted at marriage, but ' + p.name + ' did not pick up on it yet. Keep building the relationship.');
    p.bond = Math.max(0, p.bond - 1);
    render();
  }
};
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
  if (m.salonatProspect) {
    const p = m.salonatProspect;
    html += '<div class="card" style="border-color:#fbbf24;background:#fbbf2410">' +
      '<h3 style="color:#fbbf24">💍 The Salonat Meeting</h3>' +
      '<p class="muted small">Your parents introduced you to ' + p.name + '. Here is what they bring to the table:</p>' +
      '<div class="row"><span>Age</span><b>' + p.age + '</b></div>' +
      '<div class="row"><span>Job</span><b>' + p.job.title + '</b></div>' +
      '<div class="row"><span>Income</span><b>' + money(p.job.salary) + '/yr</b></div>' +
      '<div class="row"><span>Mahr (Dowry)</span><b>' + money(p.mahrLocal) + '</b></div>' +
      '<div class="row"><span>Shabka (Gold)</span><b>' + p.shabkaGrams + 'g (21K)</b></div>' +
      '<div class="row"><span>Housing</span><b>' + (p.houseType === 'mansion' ? 'Mansion' : 'Apartment') + ' (' + money(p.houseValueLocal) + ')</b></div>' +
      '<div class="row"><span>House Ownership</span><b>' + (p.giveHouseToBride ? 'Written under YOUR name' : 'Remains under his name') + '</b></div>' +
      '<div class="muted small" style="margin-top:8px">Traits: ' + p.traits.map(t => marTrait(t) ? marTrait(t).label : t).join(', ') + '</div>' +
      '<div style="display:flex;gap:6px;margin-top:12px">' +
      '<button class="opt" style="flex:1;text-align:center;background:#34d399;color:#000;font-weight:700;padding:10px" onclick="marAcceptSalonat()">✅ Accept & Engage</button>' +
      '<button class="opt" style="flex:1;text-align:center;border-color:#fb7185;color:#fb7185;padding:10px" onclick="marRejectSalonat()">❌ Reject</button>' +
      '</div></div>';
    return html;
  }

  html += '<div class="card" style="border-color:#fbbf24">' +
    '<h3 style="color:#fbbf24">🏛 Traditional Arranged Meeting</h3>' +
    '<p class="muted small">Ask your parents to arrange a Salonat. The suitor will come with his family, and you will see his job, wealth, and property before deciding.</p>' +
    '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700;font-size:.78rem" onclick="marStartSalonat()">🤝 Request a Salonat (Cost: ' + money(marEGP(2000)) + ')</button>' +
    '</div>';

  html += '<div class="card"><h3>💕 Other Ways to Meet Someone</h3>' +
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
  const isTraditionalWoman = marIsTraditionalWoman();
  let html = '';

  /* Traditional Ask — MAN asks HER father. Hidden from women in traditional cultures. */
  if (!isTraditionalWoman && m.status === 'dating' && p.bond >= 60) {
    html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">👨‍👩‍👧 Traditional Ask</h3>' +
      '<p class="muted small">Go directly to the family to ask for their blessing to get engaged.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700;font-size:.75rem" onclick="marAskForHand()">🤝 Ask for Hand in Marriage</button>' +
      '</div>';
  }

  /* Partner's pending proposal (mostly fires for traditional women, but available to all) */
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

    if (isTraditionalWoman) {
      /* WOMAN in traditional culture: HE proposes, SHE waits + can hint */
      html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">💍 Waiting for the Proposal</h3>' +
        '<p class="muted small">In your culture, the man proposes to the woman. He will ask for your hand when the relationship feels ready — keep building trust, communication, and compatibility.</p>' +
        '<div class="row"><span>Relationship readiness</span><b>' + readiness.score + '%</b></div>';

      if (!readiness.ready) {
        html += '<div class="muted small" style="margin-top:8px"><b>What he is still waiting for:</b><ul style="margin:4px 0 0 18px">' +
          readiness.reasons.map(function(r) { return '<li>' + r + '</li>'; }).join('') + '</ul></div>';
      } else {
        html += '<p class="good small" style="margin-top:8px">The relationship feels ready — he may propose soon. Hint at your hopes to encourage him.</p>' +
          '<button class="opt" style="margin-top:10px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="marHintAtProposal()">💬 Hint at Marriage</button>';
      }
      html += '</div>';
    } else {
      /* MAN (or woman in non-traditional culture): chooses proposal style */
      html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">💍 Proposal</h3>';
      if (!m.engagement || !m.engagement.proposal) {
        if (!readiness.ready) {
          html += '<p class="muted small">A proposal is a major decision. Your partner needs to feel that the relationship is ready.</p>' +
            '<div class="row"><span>Current readiness</span><b>' + readiness.score + '%</b></div>' +
            '<ul class="muted small" style="margin:6px 0 0 18px">' + readiness.reasons.map(function(r) { return '<li>' + r + '</li>'; }).join('') + '</ul>';
        } else {
          html += '<p class="muted small">Choose a proposal style that reflects your partner\'s personality and preferences.</p>';
          if (typeof MARRIAGE_PROPOSAL_OPTIONS !== 'undefined') {
            MARRIAGE_PROPOSAL_OPTIONS.forEach(function(opt) {
              const fit = marProposalStyleFit(p, opt);
              html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSelectProposal(\'' + opt.id + '\')">' +
                '<div style="display:flex;justify-content:space-between"><b>' + opt.label + '</b><span>' + money(marEGP(opt.costEGP)) + '</span></div>' +
                '<div class="muted small">Romance +' + opt.romance + ' · Social +' + opt.social + ' · ' + opt.desc + (fit > 5 ? ' · Likely to suit your partner' : fit < -5 ? ' · May not suit your partner\'s preferences' : '') + '</div></button>';
            });
          }
        }
      } else {
        html += marRenderProposalReview();
      }
      html += '</div>';
    }
  }

  /* Engagement phase */
  if (m.status === 'engaged') {
    if (!m.engagement || !m.engagement.finalized) {
      html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">💍 Engagement Planning</h3>';
      html += marRenderEngagementPlanner();
      html += '</div>';
    } else {
            html += marRenderGehazCard();
      html += '<div class="card"><h3>💍 Engagement Review</h3>' +
        '<div class="row"><span>Shabka</span><b>' + money(marEGP(m.engagement.shabkaCost)) + '</b></div>' +
        '<div class="row"><span>Mahr</span><b>' + money(marEGP(m.engagement.mahrCost)) + '</b></div>' +
        '<div class="row"><span>Party</span><b>' + money(marEGP(m.engagement.partyCost)) + '</b></div>' +
        '</div>';
    }

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
  const m = S.marriage;
  const e = S.marriage.engagement;
   
  if (!e) return '';
  const isTraditionalWoman = marIsTraditionalWoman();
     /* Mother-in-law mahr negotiation (traditional only, once per engagement) */
  if (isTraditionalWoman && !e.mahrNegotiationTriggered && e.mahrTier && e.mahrAdvancedPct > 0.3) {
    e.mahrNegotiationTriggered = true;
    S.pending = {
      title: '💬 Mahr Negotiation',
      text: 'Before finalizing the Mahr, ' + (S.marriage.partner.name) + '’s mother pulls you aside.\n\n"Habibti, we are all family now. Perhaps we can lower the Mahr slightly? ' + S.marriage.partner.name + ' doesn\'t need to know."',
      choices: [
        { label: '💪 Hold firm on the agreed Mahr', effect: function(s) {
            s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 15);
            s.marriage.partner.bond = Math.min(100, s.marriage.partner.bond + 5);
            log('💪 You refused to lower the Mahr. His mother is unhappy, but ' + s.marriage.partner.name + ' respects you more for it.');
            fx({ happiness: 3 });
          }
        },
        { label: '🤝 Compromise — lower it 20%', effect: function(s) {
            s.marriage.engagement.mahrAdvancedPct = 0.4;
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 10);
            log('🤝 You accepted a compromise. His mother is pleased, but you will receive less in the Mahr.');
          }
        },
        { label: '😔 Lower it substantially to be safe', effect: function(s) {
            s.marriage.engagement.mahrAdvancedPct = 0.2;
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 20);
            s.marriage.partner.bond = Math.max(0, s.marriage.partner.bond - 5);
            log('😔 You lowered the Mahr substantially. His family is relieved, but you wonder if you lost respect.');
            fx({ happiness: -3 });
          }
        }
      ]
    };
    S.evId = 'mahr_negotiation_' + gameYear();
    render();
    return ''; // Skip normal rendering until negotiation is resolved
  }

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

  const totalMahr = mahr.costEGP;
  const advancedPct = (e.mahrAdvancedPct || 0.5);
  const mahrAdv = Math.round(totalMahr * advancedPct);
  const mahrDef = Math.round(totalMahr * (1 - advancedPct));

  const totalEGP = shabka.costEGP + mahrAdv + party.costEGP;
  const totalLocal = marEGP(totalEGP);

  let playerShare = 1;
  if (e.payer === 'partner') playerShare = 0;
  else if (e.payer === 'split') playerShare = 0.5;

  const playerTotalLocal = Math.round(totalLocal * playerShare);
  const canAfford = S.wealth >= playerTotalLocal;

  let html = '';
  html += marRenderGehazCard();
  if (false) {
  html += '<div class="card" style="border-color:#22d3ee;margin-top:10px"><h4 style="color:#22d3ee">🛋 Gehaz (Trousseau & Furniture)</h4>';
  
  const maritalHome = S.ownedHomes.find(x => x.status === 'occupied') || S.ownedHomes[0];
  
  if (!maritalHome) {
    html += '<p class="bad small">⚠️ You need a home first! Go to Real Estate to buy or rent.</p>';
  } else {
    /* Who pays selector */
    html += '<div style="margin-bottom:10px;padding:8px;background:#0f0f1a;border-radius:6px">' +
      '<b class="small" style="color:#fbbf24">Who pays for the Gehaz?</b>';
    
    if (marIsTraditionalWoman()) {
      html += '<p class="muted small" style="margin-top:4px">💡 In your culture, the groom and his family provide the furniture. You do not pay.</p>';
      html += '<button class="pill on" style="padding:6px;font-size:.7rem;width:100%;margin-top:4px">👨 ' + m.partner.name + ' pays</button>';
    } else if (S.gender === 'm') {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:4px">';
      ['self', 'groom_family', 'split'].forEach(p => {
        const labels = { self: 'You pay', groom_family: 'Your family', split: 'Split with her' };
        html += `<button class="pill ${S.marriage.gehazPayer === p ? 'on' : ''}" style="font-size:.65rem;padding:4px" onclick="S.marriage.gehazPayer='${p}';render()">${labels[p]}</button>`;
      });
      html += '</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px">';
      ['partner', 'split'].forEach(p => {
        const labels = { partner: 'He pays', split: 'Split 50/50' };
        html += `<button class="pill ${S.marriage.gehazPayer === p ? 'on' : ''}" style="font-size:.65rem;padding:4px" onclick="S.marriage.gehazPayer='${p}';render()">${labels[p]}</button>`;
      });
      html += '</div>';
    }
    html += '</div>';
    
    /* Discuss button */
    html += '<button class="opt" style="margin-bottom:8px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700;font-size:.75rem;padding:8px" onclick="marDiscussGehaz()">💬 Discuss Gehaz with ' + m.partner.name + '</button>';
    
    /* Checklist */
    let allDone = true;
    MARRIAGE_GEHAZ_CHECKLIST.forEach(item => {
      const hasItem = S.shopping.inventory.some(i => i.homeId === maritalHome.id && i.cat === item.cat && (!item.subcat || i.subcat === item.subcat));
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1a1a2a">' +
        '<span style="font-size:.8rem">' + (hasItem ? '✅' : '❌') + ' ' + item.label + '</span>';
      if (!hasItem) {
        allDone = false;
        html += `<button class="pill" style="padding:2px 8px;font-size:.65rem" onclick="marBuyGehazItem('${item.cat}', '${item.subcat || ''}')">Buy Now</button>`;
      }
      html += '</div>';
    });
    
    if (allDone) {
      html += '<p class="good small" style="margin-top:8px">✅ The marital home is fully furnished!</p>';
    } else {
      html += '<p class="bad small" style="margin-top:8px">⚠️ The wedding cannot happen until every item is bought.</p>';
    }
  }
  html += '</div>';
  
 } /* end of old Gehaz block (switched off) */
  /* Mahr Structure */
  html += '<div style="margin-top:10px; padding:10px; background:#0f0f1a; border-radius:6px">' +
    '<b class="small" style="color:#fbbf24">Mahr Structure</b>' +
    '<div class="row small"><span>Muqaddam (Advanced)</span><b>' + money(marEGP(mahrAdv)) + '</b></div>' +
    '<div class="row small"><span>Mu\'akhar (Deferred)</span><b>' + money(marEGP(mahrDef)) + '</b></div>' +
    '<div style="display:flex;gap:4px;margin-top:6px">' +
    '<button class="pill ' + (advancedPct === 1 ? 'on' : '') + '" style="flex:1;font-size:.65rem" onclick="marSetMahrSplit(1)">100% Upfront</button>' +
    '<button class="pill ' + (advancedPct === 0.5 ? 'on' : '') + '" style="flex:1;font-size:.65rem" onclick="marSetMahrSplit(0.5)">50/50 Split</button>' +
    '<button class="pill ' + (advancedPct === 0.1 ? 'on' : '') + '" style="flex:1;font-size:.65rem" onclick="marSetMahrSplit(0.1)">10% Upfront (Traditional)</button>' +
    '</div></div>';
  html += picker('Shabka (bride\'s gold)', MARRIAGE_SHABKA_TIERS, 'shabkaTier', e.shabkaTier, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Mahr (deferred dowry)', MARRIAGE_MAHR_TIERS, 'mahrTier', e.mahrTier, function(t) { return money(marEGP(t.costEGP)); });
  html += picker('Engagement party', MARRIAGE_ENGAGEMENT_PARTY_TIERS, 'partyTier', e.partyTier, function(t) { return money(marEGP(t.costEGP)); });

  /* Payer for engagement */
  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Who pays for the engagement?</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">';
  html += '<button class="pill ' + (e.payer === 'self' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'self\')">You pay all</button>';
  html += '<button class="pill ' + (e.payer === 'partner' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'partner\')">Partner pays</button>';
  html += '<button class="pill ' + (e.payer === 'split' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'split\')">Split 50/50</button>';
  html += '</div>';

  if (isTraditionalWoman) {
    html += '<p class="muted small" style="margin-top:6px;color:#8b5cf6">💡 Cultural tradition: The groom and his family traditionally cover these costs.</p>';
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
  
  let share = 1;
  if (w.payer === 'split') share = 0.5;
  else if (w.payer === 'partner_family') share = isTraditionalWoman ? 0.15 : 0.25;
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

  html += '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Full wedding cost</b><b style="color:#34d399">' + money(totalLocal) + '</b></div>' +
    (prenup.legalCostEGP > 0 ? '<div class="row"><span>Prenup (' + prenup.label + ')</span><b>' + money(prenupLocal) + '</b></div>' : '') +
    '<div class="row"><span>Your share (' + Math.round(share * 100) + '%)</span><b>' + money(playerWeddingShare) + '</b></div>' +
    '<div class="row"><b>Your total to pay</b><b style="color:' + (canAfford ? '#34d399' : '#fb7185') + '">' + money(playerTotal) + '</b></div>' +
    (w.payer === 'partner_family' ? '<p class="muted small" style="color:#8b5cf6">💡 Cultural tradition: The groom and his family cover the vast majority of the wedding.</p>' : '') +
    '</div>';

  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Prenup</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  MARRIAGE_PRENUP_OPTIONS.forEach(function(o) {
    html += '<button class="pill ' + (w.prenup === o.id ? 'on' : '') + '" style="padding:6px;font-size:.65rem" onclick="marWeddingSet(\'prenup\',\'' + o.id + '\')">' + o.label + (o.legalCostEGP > 0 ? '<br><span class="muted" style="font-size:.6rem">' + money(marEGP(o.legalCostEGP)) + '</span>' : '') + '</button>';
  });
  html += '</div>';

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
    '<div class="row"><span>Finance model</span><b>' + marFinanceLabel() + '</b></div>' +    '<div class="row"><span>Prenup</span><b>' + (m.prenup ? m.prenup.type : 'None') + '</b></div>' +
    '<div class="row"><span>Shared account</span><b>' + money(m.sharedAccountBalance) + '</b></div>' +
    '<div class="row"><span>Children</span><b>' + ((S.childrenList || []).length) + '</b></div>' +
    '</div>';

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

  if (typeof MARRIAGE_FAMILY_PLANNING_OPTIONS !== 'undefined') {
    html += '<div class="card"><h3>👶 Family Planning</h3>' +
      '<div class="row"><span>Current plan</span><b>' + ((MARRIAGE_FAMILY_PLANNING_OPTIONS.find(function(x) { return x.id === m.familyPlanning; }) || {}).label || 'Undecided') + '</b></div>';
    MARRIAGE_FAMILY_PLANNING_OPTIONS.forEach(function(o) {
      if (m.familyPlanning === o.id) return;
      html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:6px;font-size:.72rem" onclick="marSetFamilyPlanning(\'' + o.id + '\')">' + o.label + '<br><span class="muted" style="font-size:.65rem">' + o.desc + '</span></button>';
    });
    html += '</div>';
  }

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

  html += '<div class="card"><h3>💰 Shared Account</h3>' +
    '<div class="row"><span>Balance</span><b>' + money(m.sharedAccountBalance) + '</b></div>' +
    '<button class="opt" style="margin-top:6px;width:50%;font-size:.75rem;padding:6px" onclick="marDepositShared()">Deposit</button>' +
    '<button class="opt" style="margin-top:6px;width:50%;font-size:.75rem;padding:6px" onclick="marWithdrawShared()">Withdraw</button>' +
    '</div>';

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

  const premarital = Array.isArray(m.premaritalHistory) ? m.premaritalHistory.slice(-15).reverse() : [];
  if (premarital.length) {
    html += '<div class="card"><h3>💌 Dating & Wedding Memories</h3>';
    premarital.forEach(function(item) {
      html += '<div style="padding:7px 0;border-bottom:1px solid #1a1a2a"><div class="muted small">' + (item.year || '?') + ' · ' + (item.kind || 'Memory') + '</div><div style="font-size:.78rem">' + item.text + '</div></div>';
    });
    html += '</div>';
  }

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
   SALONAT (ARRANGED MARRIAGE) SYSTEM
   ============================================================ */

window.marStartSalonat = function() {
  if (S.gender !== 'f') { log('Arranged Salonat meetings are only available for female characters. Use the other ways to meet someone.'); render(); return; }
  ensureMarriageState();
  const m = S.marriage;
  if (m.status !== 'single' && m.status !== 'divorced') {
    log('You must be single to meet a Salonat prospect.'); render(); return;
  }

  const isTraditionalWoman = marIsTraditionalWoman();
  
  // Women in traditional cultures do not pay for the Salonat; the man's family hosts it.
  const meetCost = isTraditionalWoman ? 0 : marEGP(2000);
  
  if (meetCost > 0 && S.wealth < meetCost) { 
    log('Not enough cash for the family gathering (' + money(meetCost) + ').'); render(); return; 
  }
  if (meetCost > 0) S.wealth -= meetCost;

  const tier = S.familyTier || 'middle';
  let wealthLevel = 'middle';
  if (tier === 'poor' || tier === 'lower-mid') wealthLevel = 'working';
  else if (tier === 'wealthy' || tier === 'ultra') wealthLevel = 'elite';

  const ages = wealthLevel === 'elite' ? [28, 42] : wealthLevel === 'working' ? [22, 32] : [25, 36];
  const age = Math.floor(Math.random() * (ages[1] - ages[0] + 1)) + ages[0];
  const gender = S.gender === 'm' ? 'f' : 'm';
  const names = marNamePool(gender) || (gender === 'm' ? ['Omar'] : ['Sarah']);
  const name = names[Math.floor(Math.random() * names.length)];
  
  const jobs = {
    working: [ { title: 'Teacher', salary: 120000 }, { title: 'Accountant', salary: 150000 }, { title: 'Sales Rep', salary: 140000 } ],
    middle: [ { title: 'Doctor', salary: 350000 }, { title: 'Engineer', salary: 300000 }, { title: 'Business Owner', salary: 500000 } ],
    elite: [ { title: 'Surgeon', salary: 1200000 }, { title: 'CEO', salary: 2500000 }, { title: 'Investor', salary: 3000000 } ]
  };
  const job = jobs[wealthLevel][Math.floor(Math.random() * jobs[wealthLevel].length)];
  
  const mahrEGP = wealthLevel === 'elite' ? 500000 : wealthLevel === 'working' ? 50000 : 150000;
  const shabkaGrams = wealthLevel === 'elite' ? 100 : wealthLevel === 'working' ? 25 : 50;
  
  const houseType = wealthLevel === 'elite' ? 'mansion' : wealthLevel === 'working' ? 'small_apartment' : 'nice_apartment';
  const houseValueEGP = wealthLevel === 'elite' ? 15000000 : wealthLevel === 'working' ? 1500000 : 3500000;
  
  // FIX: If the PLAYER is male, the bride does NOT give him the house (he provides it).
  // If the PLAYER is female, the male prospect MIGHT give her the house.
  let giveHouseToBride = false;
  if (gender === 'm' && Math.random() < (wealthLevel === 'elite' ? 0.4 : 0.2)) {
    giveHouseToBride = true; // He puts it in her (the player's) name
  }

  const traits = marRollTraits();
  
  S.marriage.salonatProspect = {
    name, age, gender, job,
    wealthLevel,
    mahrLocal: marEGP(mahrEGP),
    shabkaGrams,
    houseType,
    houseValueLocal: marEGP(houseValueEGP),
    giveHouseToBride,
    traits,
    familyApproval: 1.0
  };
  
  m.tab = 'find';
  render();
};
window.marCheckTrousseau = function() {
  const m = S.marriage;
  if (m.status !== 'engaged') return;
  
  const h = (S.ownedHomes || []).find(function(x) { return x.status === 'occupied' || x.source === 'salonat'; });
  
  if (!h) {
    log('❌ You don\'t have a house yet! You must secure a home before the wedding.');
    return;
  }

  const furnItems = (S.shopping && Array.isArray(S.shopping.inventory))
    ? S.shopping.inventory.filter(i => i.homeId === h.id && (i.cat === 'furniture' || i.cat === 'appliances'))
    : [];

  if (furnItems.length >= 3) {
    m.trousseauComplete = true;
    m.motherInLawBond = Math.min(100, m.motherInLawBond + 10);
    log('✅ The marital home is fully furnished! Your mother-in-law is impressed (+10 Bond).');
  } else {
    log('⚠️ The home needs furniture. Buy at least ' + (3 - furnItems.length) + ' more items from the Shopping tab and place them in the home.');
    m.motherInLawBond = Math.max(0, m.motherInLawBond - 5);
  }
  render();
};

window.marAcceptSalonat = function() {
  const p = S.marriage.salonatProspect;
  if (!p) return;

  S.marriage.partner = {
    name: p.name, age: p.age, gender: p.gender,
    bond: 30, trust: 25, communication: 25, compatibility: 50,
    traits: p.traits, income: p.job.salary, source: 'Salonat',
    familyApproval: 1.0, metYear: gameYear(),
    relationshipStage: 'engaged', exclusive: true,
    memories: [], talkedTopics: [], topicCounts: {}, activityCounts: {},
    dateCount: 0, commitmentTalks: 1, familyIntroduced: true,
    preferences: marCreatePartnerPreferences(p.traits)
  };

  S.marriage.status = 'engaged';
  S.marriage.gehazPayer = 'groom'; /* Husband pays for Gehaz */
  S.marriage.husbandHomeProvided = true; /* His family provides the home */
  S.marriage.engagement = {
    proposal: 'family', shabkaTier: 'custom', mahrTier: 'custom', partyTier: 'nice_hall',
    payer: p.gender === 'm' ? 'partner' : 'self',
    finalized: true,
    salonatMahr: p.mahrLocal, salonatShabka: p.shabkaGrams
  };

  /* Give gold to player */
  if (!S.expat) S.expat = { goldStash: [] };
  if (!Array.isArray(S.expat.goldStash)) S.expat.goldStash = [];
 marGrantShabkaJewelry(p.shabkaGrams, 21);

  S.wealth += p.mahrLocal;

  /* Clear any existing occupied homes */
  if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];
  S.ownedHomes.forEach(old => { if (old.status === 'occupied') old.status = 'vacant'; });

  if (typeof createHome === 'function') {
    const h = createHome({
      name: p.houseType === 'mansion' ? 'Family Mansion' : 'Marital Apartment',
      country: S.country, city: 'Cairo', location: 'Family Neighborhood',
      baseValue: p.houseValueLocal, value: p.houseValueLocal,
      area: p.houseType === 'mansion' ? 400 : p.houseType === 'nice_apartment' ? 140 : 90,
      condition: 100, status: 'occupied', source: 'salonat',
      isHusbandOwned: !p.giveHouseToBride
    });
    S.ownedHomes.push(h);
    S.housing = 'owned';
    S.realEstateActiveHomeId = h.id;
  }

  log(`💍 You accepted the proposal from ${p.name}.${money(p.mahrLocal)} Mahr.`);
  if (p.giveHouseToBride) {
    log(`🏠 The house (${p.houseType}) was put under YOUR name. Check the Real Estate tab.`);
  } else {
    log(`🏠 You will live in his ${p.houseType}, but it remains under HIS name.`);
  }

  fx({ happiness: 15, social: 10 });
  S.marriage.salonatProspect = null;
  S.marriage.tab = 'plan';
  render();
};

window.marSetMahrSplit = function(pct) {
  if (!S.marriage.engagement) return;
  S.marriage.engagement.mahrAdvancedPct = pct;
  render();
};

window.marBuyGehazItem = function(cat, subcat) {
  const m = S.marriage;
  const h = S.ownedHomes.find(x => x.status === 'occupied') || S.ownedHomes[0];
  if (!h) { log('❌ You need a house first.'); return; }

  /* Find a good mid-tier item in the category */
  let pool = SHOP_ALL.filter(item => item[2] === cat && (!subcat || item[3] === subcat));
  if (pool.length === 0) { log('❌ No items found in this category.'); return; }
  const itemData = pool[Math.floor(pool.length / 2)];
  const brand = itemData[0];
  const name = itemData[1];
  const priceUSD = itemData[4];
  const itemSubcat = itemData[3];

  const shopMultVal = SHOP_MULT[S.country] ? (SHOP_MULT[S.country][cat] || 1) : 1;
  const priceLocal = Math.round(priceUSD * shopMultVal * (C().rate || 1));

  /* WHO PAYS? */
  let playerCost = 0;
  let payer = 'you';

  if (marIsTraditionalWoman()) {
    /* Traditional bride: HUSBAND pays everything */
    payer = 'husband';
    playerCost = 0;
  } else if (S.gender === 'm') {
    /* Male player (groom) */
    if (m.gehazPayer === 'groom_family') {
      const famWealth = (typeof eduFamilyWealth === 'function') ? eduFamilyWealth() : 3000000;
      if (famWealth >= priceLocal) {
        payer = 'your_family';
        playerCost = 0;
      } else {
        payer = 'you'; playerCost = priceLocal;
      }
    } else if (m.gehazPayer === 'split') {
      payer = 'split'; playerCost = priceLocal / 2;
    } else {
      payer = 'you'; playerCost = priceLocal;
    }
  } else {
    /* Non-traditional woman */
    if (m.gehazPayer === 'partner' || m.gehazPayer === 'groom') {
      payer = 'husband'; playerCost = 0;
    } else if (m.gehazPayer === 'split') {
      payer = 'split'; playerCost = priceLocal / 2;
    } else {
      payer = 'you'; playerCost = priceLocal;
    }
  }

  if (playerCost > 0 && S.wealth < playerCost) {
    log('❌ You need ' + money(playerCost) + ' for your share.');
    return;
  }

  if (playerCost > 0) S.wealth -= playerCost;

  if (payer === 'husband') log('👨 ' + m.partner.name + ' paid ' + money(priceLocal) + ' for the ' + name + '.');
  else if (payer === 'your_family') log('👨‍👩‍👧 Your family paid ' + money(priceLocal) + ' for the ' + name + '.');
  else if (payer === 'split') log('🤝 You split the cost. You paid ' + money(playerCost) + '.');
  else log('💵 You paid ' + money(playerCost) + ' for the ' + name + '.');

  /* Add to inventory */
  if (!S.shopping.inventory) S.shopping.inventory = [];
  const uid = 'i' + (S.uidN++);
  S.shopping.inventory.push({
    uid: uid,
    itemId: itemData[0].toLowerCase() + '_' + itemData[1].toLowerCase().replace(/\W/g, '_'),
    brand: brand, name: name, cat: cat, subcat: itemSubcat,
    priceUSD: priceUSD, purchasePrice: priceLocal, currentValue: priceLocal,
    purchaseYear: gameYear(), age: 0, life: itemData[7],
    happiness: itemData[5], social: itemData[6],
    broken: false, condition: 100, warrantyUntil: 0,
    homeId: h.id, homeName: h.name,
    paidBy: payer
  });

  /* Update home */
  h.furnitureValue = (h.furnitureValue || 0) + priceLocal;
  h.value = (h.value || 0) + priceLocal;
  h.homeComfort = (h.homeComfort || 0) + (itemData[5] * 2);
  h.shoppingComfort = (h.shoppingComfort || 0) + (itemData[5] * 2);

  log('✅ Placed ' + brand + ' ' + name + ' in the marital home.');
  render();
};
window.marDiscussGehaz = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p || m.status !== 'engaged') return;
  
  const h = S.ownedHomes.find(x => x.status === 'occupied') || S.ownedHomes[0];
  if (!h) {
    log('❌ You need a home first.');
    return;
  }
  
  const missing = [];
  if (typeof MARRIAGE_GEHAZ_CHECKLIST !== 'undefined') {
    MARRIAGE_GEHAZ_CHECKLIST.forEach(item => {
      const hasItem = S.shopping.inventory.some(i => i.homeId === h.id && i.cat === item.cat && (!item.subcat || i.subcat === item.subcat));
      if (!hasItem) missing.push(item);
    });
  }
  
  if (missing.length === 0) {
    log('✅ ' + p.name + ' smiles. "The home is fully furnished. We are ready."');
    return;
  }
  
  S.pending = {
    title: '🛋 Discussing the Gehaz',
    text: 'You sit with ' + p.name + ' and his mother over tea.\n\n"What do you want for our home?" he asks, smiling.\n\nHis mother pulls out a list: ' + missing.map(i => i.label).join(', ') + '.',
    choices: [
      { label: '💛 "Whatever you think is best, habibti"',
        effect: function(s) {
          const hh = s.ownedHomes.find(x => x.status === 'occupied') || s.ownedHomes[0];
          missing.forEach(item => {
            let pool = SHOP_ALL.filter(i => i[2] === item.cat && (!item.subcat || i[3] === item.subcat));
            if (pool.length === 0) return;
            const itemData = pool[Math.floor(pool.length / 2)];
            const priceUSD = itemData[4];
            const shopMultVal = SHOP_MULT[s.country] ? (SHOP_MULT[s.country][item.cat] || 1) : 1;
            const priceLocal = Math.round(priceUSD * shopMultVal * (C().rate || 1));
            if (!s.shopping.inventory) s.shopping.inventory = [];
            s.shopping.inventory.push({
              uid: 'i' + (s.uidN++),
              itemId: itemData[0].toLowerCase() + '_' + itemData[1].toLowerCase().replace(/\W/g, '_'),
              brand: itemData[0], name: itemData[1], cat: item.cat, subcat: itemData[3],
              priceUSD: priceUSD, purchasePrice: priceLocal, currentValue: priceLocal,
              purchaseYear: gameYear(), age: 0, life: itemData[7],
              happiness: itemData[5], social: itemData[6],
              broken: false, condition: 100, warrantyUntil: 0,
              homeId: hh.id, homeName: hh.name, paidBy: 'husband'
            });
            hh.furnitureValue = (hh.furnitureValue || 0) + priceLocal;
            hh.value = (hh.value || 0) + priceLocal;
            hh.homeComfort = (hh.homeComfort || 0) + (itemData[5] * 2);
            hh.shoppingComfort = (hh.shoppingComfort || 0) + (itemData[5] * 2);
          });
          log('👨 ' + p.name + ' and his family arranged the entire Gehaz. They paid for everything.');
          fx({ happiness: 8 });
        }
      },
      { label: '📋 "Let me choose each piece myself"',
        effect: function(s) {
          log('🛋 You will pick each piece together. Use the buy buttons in the Plan tab.');
        }
      },
      { label: '💰 "Let\'s split the cost to save your family money"',
        effect: function(s) {
          s.marriage.gehazPayer = 'split';
          log('🤝 ' + p.name + ' was surprised but grateful. You will split the Gehaz cost.');
          p.bond = Math.min(100, p.bond + 10);
        }
      }
    ]
  };
  S.evId = 'discuss_gehaz_' + gameYear();
  render();
};
/* ============================================================
   HUSBAND PROVIDES MARITAL HOME (traditional cultures only)
   ============================================================
   In Egypt/Gulf/India, the man and his family provide the
   marital home. The bride never has to buy it.
   ============================================================ */
window.marHusbandProvidesHome = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p) return null;
  
  if (m.husbandHomeProvided) return null;
  if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];
  
  /* Check if player already has an occupied home */
  const existingOccupied = S.ownedHomes.find(h => h.status === 'occupied');
  if (existingOccupied) {
    m.husbandHomeProvided = true;
    log('🏠 You already have a home (' + existingOccupied.name + '). ' + p.name + ' will live there with you.');
    return existingOccupied;
  }
  
  m.husbandHomeProvided = true;
  
  const husbandIncome = p.income || 0;
  
  let ppm, area, homeType, homeDesc;
  if (husbandIncome >= 1000000) {
    ppm = 150000; area = 400; homeType = 'Luxury Villa';
    homeDesc = 'a stunning luxury villa with private gardens and a pool';
  } else if (husbandIncome >= 500000) {
    ppm = 80000; area = 250; homeType = 'Villa';
    homeDesc = 'a spacious villa in a quiet neighborhood';
  } else if (husbandIncome >= 200000) {
    ppm = 55000; area = 160; homeType = 'Apartment';
    homeDesc = 'a comfortable 3-bedroom apartment in a good neighborhood';
  } else if (husbandIncome >= 100000) {
    ppm = 35000; area = 120; homeType = 'Apartment';
    homeDesc = 'a cozy 2-bedroom apartment';
  } else {
    ppm = 25000; area = 90; homeType = 'Modest Apartment';
    homeDesc = 'a modest starter apartment';
  }
  
  let familyContribution = false;
  if (marHasTrait(p, 'family_oriented') || marHasTrait(p, 'traditional')) {
    if (Math.random() < 0.6) familyContribution = true;
  }
  
  let giveHouseToBride = false;
  if (marHasTrait(p, 'generous') || marHasTrait(p, 'protector')) giveHouseToBride = true;
  if (marHasTrait(p, 'traditional') || marHasTrait(p, 'family_oriented')) {
    if (Math.random() < 0.35) giveHouseToBride = true;
  }
  if (p.bond >= 90 && Math.random() < 0.6) giveHouseToBride = true;
  const homeValue = ppm * area;
  if ((p.wealth || husbandIncome * 5) >= homeValue * 3 && Math.random() < 0.5) giveHouseToBride = true;
  
  /* Clear any other occupied homes */
  S.ownedHomes.forEach(old => { if (old.status === 'occupied') old.status = 'vacant'; });
  
  const homeName = homeType + (giveHouseToBride ? ' — Your Name' : ' — His Name');
  
  const newHome = createHome({
    name: homeName,
    city: p.city || 'Cairo',
    location: 'Family Neighborhood',
    country: S.country,
    baseValue: homeValue,
    value: homeValue,
    area: area,
    rooms: Math.max(2, Math.floor(area / 30)),
    condition: 85,
    status: 'occupied',
    source: 'husband_provided',
    isHusbandOwned: !giveHouseToBride
  });
  
  S.ownedHomes.push(newHome);
  S.realEstateActiveHomeId = newHome.id;
  S.housing = 'owned';
  
  let text = p.name + ' takes your hand one evening. "Come, I have something to show you."\n\nHe drives you to ' + homeDesc + ' in ' + (p.city || 'Cairo') + '.';
  if (familyContribution) text += '\n\nHis family helped him prepare it — as is tradition in your country.';
  if (giveHouseToBride) {
    text += '\n\n"I put it in your name," he says quietly. "Whatever happens, you will always have a home of your own."';
  } else {
    text += '\n\n"This is where we will build our life together," he says. The home remains in his name, but it is yours to make your own.';
  }
  
  S.pending = {
    title: '🏠 Your Marital Home',
    text: text,
    choices: [{
      label: giveHouseToBride ? '💍 Accept with tears in your eyes' : '💍 Accept with joy',
      effect: function(s) {
        if (giveHouseToBride) {
          log('🏠 ' + p.name + ' gave you ' + homeDesc + ' under YOUR name — worth ' + money(homeValue) + '.');
          fx({ happiness: 25, social: 8 });
          s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 20);
          p.bond = Math.min(100, p.bond + 15);
        } else {
          log('🏠 You and ' + p.name + ' will live in ' + homeDesc + ' (his property).');
          fx({ happiness: 12, social: 4 });
          s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 8);
          p.bond = Math.min(100, p.bond + 8);
        }
        marRecordMemory('home_provided', p.name + ' provided the marital home: ' + homeName + ' worth ' + money(homeValue) + '.', 4);
      }
    }]
  };
  S.evId = 'husband_home_' + gameYear();
  return newHome;
};
window.marRejectSalonat = function() {
  log('❌ You declined the Salonat proposal. Your family is disappointed.');
  S.marriage.salonatProspect = null;
  render();
};

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
  const isArranged = src.id === 'salonat';
  
  const initialBond = isArranged ? 25 : (42 + Math.floor(Math.random() * 17));
  const initialTrust = isArranged ? 20 : (38 + Math.floor(Math.random() * 18));
  const initialFamilyApproval = isArranged ? 1.0 : src.familyApproval;
  
  const compatibility = marClamp(45 + Math.floor(Math.random() * 36) +
    (traits.indexOf('communicative') >= 0 ? 4 : 0) +
    (traits.indexOf('mature') >= 0 ? 4 : 0) -
    (traits.indexOf('stubborn') >= 0 ? 4 : 0), 25, 92);
    
  m.partner = {
    name: name,
    age: age,
    gender: targetGender,
    bond: initialBond,
    trust: initialTrust,
    communication: 35 + Math.floor(Math.random() * 21),
    compatibility: compatibility,
    traits: traits,
    income: 0,
    source: src.label,
    familyApproval: initialFamilyApproval,
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
  
  if (m.status !== 'dating' && m.status !== 'engaged' && m.status !== 'married') {
    log('This activity is not available at the current relationship stage.'); render(); return;
  }

  // --- DATING FINANCE LOGIC ---
  if (m.status === 'dating' || m.status === 'engaged') {
    if (marIsTraditionalWoman()) {
      // Traditional culture: Man pays. If the player is the man, deduct wealth.
      // If the player is the woman, he pays (no wealth deduction).
      if (S.gender === 'm') {
        if (S.wealth < cost) { log('Not enough cash for ' + act.label + ' (' + money(cost) + ').'); render(); return; }
        S.wealth -= cost;
      } else {
        log('💸 ' + p.name + ' paid for ' + act.label + '.');
      }
    } else {
      // Modern culture: Split 50/50
      const halfCost = Math.round(cost * 0.5);
      if (S.wealth < halfCost) { log('Not enough cash for your share (' + money(halfCost) + ').'); render(); return; }
      S.wealth -= halfCost;
    }
  } else {
    // Married - shared finances
    if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }
    S.wealth -= cost;
  }

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
  
  if (priorCount === 0 && Math.random() < 0.15) {
    const negativeTraits = p.traits.filter(t => ['greedy', 'jealous', 'grumpy', 'stubborn', 'extravagant'].includes(t));
    if (negativeTraits.length > 0) {
      const trait = negativeTraits[0];
      S.pending = {
        title: '🚩 Red Flag Discovered',
        text: 'During your conversation about ' + topic.topic + ', you noticed a troubling side of ' + p.name + '. They revealed they are extremely ' + trait + '.',
        choices: [
          { label: 'This is a dealbreaker. Break up.', effect: function(s) {
              log('💔 You ended the relationship over the red flag.');
              s.marriage.partner = null;
              s.marriage.status = 'single';
              fx({ happiness: -10 });
            }},
          { label: 'I can live with this.', effect: function(s) {
              log('You decided to look past it.');
              p.compatibility = Math.max(0, p.compatibility - 10);
            }}
        ]
      };
      S.evId = 'red_flag_' + trait;
    }
  }
  if (p.talkedTopics.indexOf(topic.id) < 0) p.talkedTopics.push(topic.id);
  if (topic.id === 'commitment' || topic.id === 'marriage') p.commitmentTalks = Math.max(1, Number(p.commitmentTalks || 0));
  marRecordMemory('conversation_' + topic.id, 'You discussed ' + topic.topic + ' with ' + p.name + '. ' + response, topic.id === 'marriage' || topic.id === 'finances' ? 3 : 2);
  log('💬 ' + topic.label + ': ' + response + ' Bond ' + (bondChange >= 0 ? '+' : '') + bondChange + ', trust ' + (trustChange >= 0 ? '+' : '') + trustChange + '.');

  if ((topic.id === 'marriage' || topic.id === 'commitment') && m.status === 'dating' &&
      p.exclusive && !p.partnerProposalOffered && !p.pendingPartnerProposal &&
      (!m.engagement || !m.engagement.proposal) && Number(p.bond || 0) >= 70 && Number(p.trust || 0) >= 65 &&
      marPremaritalReadiness(p).score >= 75) {
      
      let baseChance = 0.12 + (marPremaritalReadiness(p).score - 75) * 0.012;
      if (marHasTrait(p, 'confident')) baseChance += 0.05;
      if (marHasTrait(p, 'romantic')) baseChance += 0.04;
      
      if (marIsTraditionalWoman()) baseChance += 0.35; 

      const partnerInitiationChance = marClamp(baseChance, 0.12, 0.90);
      
      if (Math.random() < partnerInitiationChance) {
        p.partnerProposalOffered = true;
        marRecordMemory('partner_proposal', p.name + ' decided to ask whether you would like to become engaged.', 5);
        marTriggerProposalEvent(p);
      }
  }
  render();
};

window.marFamilyIntervention = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p || m.status !== 'dating') return;
  
  const approval = marFamilyApproval(p);
  if (approval >= 0.50) return;
  
  if (S.marriage.flags_familyWarning) return;
  S.marriage.flags_familyWarning = true;
  
  S.pending = {
    title: '👨‍👩‍👧 Family Intervention',
    text: 'Your parents sat you down. "We don\'t approve of ' + p.name + '. They are not the right fit for our family. We want you to end this relationship."',
    choices: [
      { label: 'I will break up with them', effect: function(s) {
          log('💔 You broke up with ' + p.name + ' to please your family.');
          s.marriage.partner = null;
          s.marriage.status = 'single';
          s.marriage.flags_familyWarning = false;
          fx({ happiness: -20 });
        }},
      { label: 'I will fight for them', effect: function(s) {
          log('⚔️ You refused. Your parents are furious.');
          p.bond = Math.min(100, p.bond + 15);
          (s.family || []).forEach(function(fm) {
            if (fm.role === 'Mother' || fm.role === 'Father') fm.bond = Math.max(0, fm.bond - 25);
          });
          fx({ happiness: -10 });
        }}
    ]
  };
  S.evId = 'family_intervention';
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
/* Trigger a popup when the partner proposes */
window.marTriggerProposalEvent = function(p) {
  const m = S.marriage;
  const isTraditional = marIsTraditionalWoman();
  
  if (isTraditional) {
    // In traditional cultures, he asks the father first
    S.pending = {
      title: '💍 A Proposal from ' + p.name,
      text: p.name + ' and his family have formally approached your father to ask for your hand in marriage.\n\nYour father has reviewed his financials, background, and reputation. He gives his blessing and asks for your decision.',
      choices: [
        { label: '✅ Accept the proposal', effect: function(s) {
            s.marriage.partner = p;
            s.marriage.status = 'engaged';
            s.marriage.engagement = {
              proposal: 'family', shabkaTier: 'standard', mahrTier: 'standard',
              partyTier: 'nice_hall', payer: 'partner', finalized: false
            };
            s.marriage.pendingPartnerProposal = null;
            log('💍 You accepted ' + p.name + '’s proposal! Your families are arranging the engagement.');
            fx({ happiness: 25 });
          }
        },
        { label: '⏳ Ask for more time', effect: function(s) {
            s.marriage.pendingPartnerProposal = null;
            p.trust = Math.max(0, p.trust - 2);
            log('💬 You asked ' + p.name + ' for more time. He respected your decision, but his family is anxious.');
            fx({ happiness: -2 });
          }
        },
        { label: '❌ Refuse the proposal', effect: function(s) {
            s.marriage.partner = null;
            s.marriage.status = 'single';
            s.marriage.pendingPartnerProposal = null;
            log('💔 You refused the proposal from ' + p.name + '. The families are disappointed.');
            fx({ happiness: -10 });
          }
        }
      ]
    };
  } else {
    // Modern cultures, he proposes directly
    S.pending = {
      title: '💍 ' + p.name + ' Proposed!',
      text: p.name + ' got down on one knee and asked you to marry him.',
      choices: [
        { label: '✅ Say YES!', effect: function(s) {
            s.marriage.partner = p;
            s.marriage.status = 'engaged';
            s.marriage.engagement = {
              proposal: 'personal', shabkaTier: 'standard', mahrTier: 'standard',
              partyTier: 'nice_hall', payer: 'split', finalized: false
            };
            s.marriage.pendingPartnerProposal = null;
            log('💍 You said YES! You are engaged.');
            fx({ happiness: 25 });
          }
        },
        { label: '⏳ Ask for more time', effect: function(s) {
            s.marriage.pendingPartnerProposal = null;
            log('💬 You asked for more time. ' + p.name + ' is a bit hurt but agrees.');
            fx({ happiness: -2 });
          }
        },
        { label: '❌ Refuse', effect: function(s) {
            s.marriage.partner = null;
            s.marriage.status = 'single';
            s.marriage.pendingPartnerProposal = null;
            log('💔 You refused ' + p.name + '’s proposal.');
            fx({ happiness: -10 });
          }
        }
      ]
    };
  }
  S.evId = 'proposal_event_' + gameYear();
  render();
};
/* ============================================================
   SHABKA GOLD SOUK TRIP
   ============================================================ */
window.marShabkaGoldSoukTrip = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p || m.status !== 'engaged') return;
  
  S.pending = {
    title: '🪙 The Gold Souk',
    text: 'You and your mother visit the gold souk to pick your Shabka with ' + p.name + ' and his family.\n\nThe jeweler displays three beautiful sets. ' + p.name + ' watches your reaction nervously.',
    choices: [
      { label: '💍 Classic Set (25g) — ' + money(marEGP(120000)), effect: function(s) {
          if (!s.expat) s.expat = { goldStash: [] };
          if (!Array.isArray(s.expat.goldStash)) s.expat.goldStash = [];
          s.expat.goldStash.push({
            id: 'gold_shabka_' + Math.random().toString(36).slice(2, 6),
            karat: '21K', grams: 25, buyPricePerGram: 4500, buyLocal: marEGP(120000),
            buyYear: gameYear(), buyCountry: s.country
          });
          s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 5);
          log('💍 You picked the classic set. His mother seems relieved.');
          fx({ happiness: 10 });
        }
      },
      { label: '👑 Luxury Set (80g) — ' + money(marEGP(450000)), effect: function(s) {
          if (s.wealth >= marEGP(450000) || s.marriage.engagement.payer === 'partner') {
            if (!s.expat) s.expat = { goldStash: [] };
            if (!Array.isArray(s.expat.goldStash)) s.expat.goldStash = [];
            s.expat.goldStash.push({
              id: 'gold_shabka_' + Math.random().toString(36).slice(2, 6),
              karat: '21K', grams: 80, buyPricePerGram: 4500, buyLocal: marEGP(450000),
              buyYear: gameYear(), buyCountry: s.country
            });
            // If player is woman, this can strain the relationship
            if (marIsTraditionalWoman()) {
              s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 10);
              log('👑 You picked the luxury set. His mother\'s smile stiffened. She will remember this.');
            } else {
              log('👑 Luxury set chosen.');
            }
            fx({ happiness: 20 });
          } else {
            log('❌ They cannot afford this set.');
          }
        }
      },
      { label: '💛 Modest Set (8g) — ' + money(marEGP(40000)), effect: function(s) {
          if (!s.expat) s.expat = { goldStash: [] };
          if (!Array.isArray(s.expat.goldStash)) s.expat.goldStash = [];
          s.expat.goldStash.push({
            id: 'gold_shabka_' + Math.random().toString(36).slice(2, 6),
            karat: '21K', grams: 8, buyPricePerGram: 4500, buyLocal: marEGP(40000),
            buyYear: gameYear(), buyCountry: s.country
          });
          // Choosing modest shows maturity
          s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 15);
          p.bond = Math.min(100, p.bond + 10);
          log('💛 You picked the modest set out of respect. His mother is touched by your thoughtfulness. +15 Mother-in-law bond.');
          fx({ happiness: 12 });
        }
      }
    ]
  };
  S.evId = 'shabka_souk_' + gameYear();
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

  const totalMahr = mahr.costEGP;
  const advancedPct = e.mahrAdvancedPct || 0.5;
  const mahrAdvCost = Math.round(totalMahr * advancedPct);
  const mahrDefCost = totalMahr - mahrAdvCost;

  const totalEGP = shabka.costEGP + mahrAdvCost + party.costEGP;
  const totalLocal = marEGP(totalEGP);

  const payer = e.payer || 'self';
  let playerShare = 1;
  if (payer === 'partner') playerShare = 0;
  else if (payer === 'split') playerShare = 0.5;

  const playerTotal = Math.round(totalLocal * playerShare);

  if (S.wealth < playerTotal) { log('Not enough cash.'); render(); return; }
  S.wealth -= playerTotal;
     // If the PLAYER is the woman in a traditional culture, she receives the gold
if (marIsTraditionalWoman()) {
    S.wealth += marEGP(mahrAdvCost);
    log('💰 You received the advanced Mahr: ' + money(marEGP(mahrAdvCost)) + '.');
  }
  if (false && marIsTraditionalWoman() && e.payer === 'partner') {
    if (!S.expat) S.expat = { goldStash: [] };
    if (!Array.isArray(S.expat.goldStash)) S.expat.goldStash = [];
    S.expat.goldStash.push({
      id: 'gold_shabka_' + Math.random().toString(36).slice(2, 6),
      karat: '21K',
      grams: shabka.grams || 25,
      buyPricePerGram: 4500,
      buyLocal: 0,
      buyYear: gameYear(),
      buyCountry: S.country
    });
    log('🪙 You received your Shabka: ' + (shabka.grams || 25) + 'g of 21K gold.');
  }

  m.mahrAdvanced = marEGP(mahrAdvCost);
  m.mahrDeferred = marEGP(mahrDefCost);
  
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
     /* Traditional women go to the gold souk to pick their Shabka */
  if (marIsTraditionalWoman() && m.partner && m.status === 'engaged') {
    setTimeout(function() { marShabkaGoldSoukTrip(); }, 100);
    return;
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
  
  // HUSBAND PROVIDES HOME for traditional women without any property
  if (marIsTraditionalWoman() && S.ownedHomes.length === 0 && !m.husbandHomeProvided) {
    marHusbandProvidesHome();
    if (S.pending) return; // Wait for player to acknowledge the reveal
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

  /* If traditional woman and no occupied home yet, husband provides one */
  if (isTraditionalWoman && m.partner && !S.ownedHomes.some(x => x.status === 'occupied') && !m.husbandHomeProvided) {
    marHusbandProvidesHome();
    if (S.pending) return; /* Wait for player to see the home reveal */
  }

  const h = S.ownedHomes.find(x => x.status === 'occupied') || S.ownedHomes[0];
  if (!h) {
    log('🚨 The wedding is cancelled! You have no home.');
    return;
  }

  let missing = [];
  MARRIAGE_GEHAZ_CHECKLIST.forEach(item => {
    const hasItem = S.shopping.inventory.some(i => i.homeId === h.id && i.cat === item.cat && (!item.subcat || i.subcat === item.subcat));
    if (!hasItem) missing.push(item.label);
  });
     /* Mother-in-law pre-wedding drama (traditional only) */
  if (marIsTraditionalWoman() && m.motherInLawBond < 35 && !m.weddingDramaTriggered) {
    m.weddingDramaTriggered = true;
    S.pending = {
      title: '👵 Wedding Day Drama',
      text: 'The morning of the wedding, ' + m.partner.name + '’s mother arrives at your home.\n\n"My son deserves a bride who listens to her elders. I have changed the seating arrangement — your family will now sit at the back."',
      choices: [
        { label: '🔥 "You will NOT disrespect my family."', effect: function(s) {
            s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 25);
            s.marriage.partner.bond = Math.min(100, s.marriage.partner.bond + 8);
            log('🔥 You stood your ground. His mother was stunned. Your husband quietly thanked you.');
            fx({ happiness: 5 });
          }
        },
        { label: '😔 Give in to keep the peace', effect: function(s) {
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 10);
            (s.family || []).forEach(function(m) { if (m.alive !== false) m.bond = Math.max(0, m.bond - 15); });
            log('😔 Your family was seated at the back. They were hurt, but the wedding proceeded.');
            fx({ happiness: -8 });
          }
        },
        { label: '📞 Call your father to intervene', effect: function(s) {
            if (S.gender === 'f') {
              log('📞 Your father called his family. A tense negotiation followed, and a compromise was reached.');
              s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 5);
              fx({ happiness: 3 });
            } else {
              log('You don\'t have a father to call in this scenario.');
            }
          }
        }
      ]
    };
    S.evId = 'wedding_drama_' + gameYear();
    render();
    return; // Wait for resolution
  }

  if (missing.length > 0) {
       log('⚠️ The wedding cannot go ahead yet. Still missing in the marital home: ' + missing.join(', ') + '. Finish the Gehaz in the Plan tab first.');
    render();
    return;
    fx({ happiness: -15 });
    return;
  }

  const selection = marGetWeddingSelection(w);
  
  let share = 1;
  if (w.payer === 'split') share = 0.5;
  else if (w.payer === 'partner_family') share = isTraditionalWoman ? 0.15 : 0.25;
  else if (w.payer === 'own_family') share = 0.5;

  if (S.marriage.motherInLawBond < 30 && Math.random() < 0.5) {
    log('🚨 Your mother-in-law interfered! She added 50 unwanted guests to the wedding list.');
    selection.baseTotalEGP += 250000;
    fx({ happiness: -10 });
  }

  const playerTotalLocal = marEGP(selection.baseTotalEGP * share) + selection.prenupCostLocal;
  
  if (S.wealth < playerTotalLocal) { log('Not enough cash.'); render(); return; }
S.wealth -= selection.prenupCostLocal; /* the lawyer fee is non-refundable */

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
 S.wealth -= (playerTotalLocal - selection.prenupCostLocal);
  m.wealthAtMarriage = Math.max(0, S.wealth);
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

 /* Complete the marriage records BEFORE any pop-up appears */
  log('🎉 You married ' + m.partner.name + '! Your share of the cost was ' + money(playerTotalLocal) + '.');
  fx({ happiness: 30 });
  S.spouse = {
    name: m.partner.name, age: m.partner.age, gender: m.partner.gender,
    bond: m.partner.bond, income: m.partner.income, works: m.partner.income > 0
  };
  /* Trigger a wedding-day popup event */
  const weddingEventChoices = {
    vendor_late: [
      { label: '😌 Wait calmly (guest patience +)', effect: function(s) { log('You waited calmly. Guests appreciated your grace.'); s.marriage.partner.bond = Math.min(100, s.marriage.partner.bond + 3); } },
      { label: '😤 Demand refund from vendor', effect: function(s) { s.wealth += marEGP(5000); log('You demanded a partial refund. Vendor refunded you ' + money(marEGP(5000)) + '.'); } }
    ],
    weather_change: [
      { label: '🌧 Improvise — guests dance in the rain', effect: function(s) { log('Everyone danced in the rain. It became the most memorable wedding moment.'); s.marriage.partner.bond = Math.min(100, s.marriage.partner.bond + 8); fx({ happiness: 10 }); } },
      { label: '💸 Pay for emergency tent — ' + money(marEGP(15000)), effect: function(s) { if (s.wealth >= marEGP(15000)) { s.wealth -= marEGP(15000); log('You paid for an emergency tent. Guests stayed dry.'); } else { log('❌ Could not afford it. Wedding soaked.'); fx({ happiness: -5 }); } } }
    ],
    guest_conflict: [
      { label: '🕊 Calmly separate them', effect: function(s) { log('You calmed the argument. Guests praised your maturity.'); fx({ happiness: 5 }); } },
      { label: '🚪 Ask them both to leave', effect: function(s) { log('You asked them to leave. It caused a stir but ended the drama.'); fx({ happiness: 2 }); s.marriage.partner.bond = Math.max(0, s.marriage.partner.bond - 3); } }
    ],
    budget_surprise: [
      { label: '💸 Pay the extra ' + money(marEGP(3000)), effect: function(s) { if (s.wealth >= marEGP(3000)) { s.wealth -= marEGP(3000); log('You paid. Keep the celebration going.'); } else log('❌ Cannot afford.'); } },
      { label: '❌ Decline the extra service', effect: function(s) { log('You declined. The wedding continued without it.'); } }
    ]
  };

  const ev = MARRIAGE_WEDDING_EVENTS[Math.floor(Math.random() * MARRIAGE_WEDDING_EVENTS.length)];
  if (ev.choice && weddingEventChoices[ev.id]) {
    S.pending = {
      title: '💒 ' + ev.title,
      text: ev.text,
      choices: weddingEventChoices[ev.id]
    };
    S.evId = 'wedding_day_' + ev.id + '_' + gameYear();
    render();
    return;
  } else {
    log('💒 ' + ev.title + ': ' + ev.text);
  }

    /* (marriage completion now happens above) */
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
    S.pending = {
      title: '🎉 You\'re Pregnant!',
      text: 'You and ' + S.marriage.partner.name + ' just found out — you are expecting a baby!\n\nHe hugged you tightly, eyes shining. The news is spreading to family.',
      choices: [
        { label: '💐 Share the news with both families', effect: function(s) {
            (s.family || []).forEach(function(m) { if (m.alive !== false) m.bond = Math.min(100, m.bond + 10); });
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 10);
            log('💐 Both families rejoiced. Gifts and congratulations poured in.');
            fx({ happiness: 15, social: 10 });
          }
        },
        { label: '🤫 Keep it private for now', effect: function(s) {
            log('🤫 You kept it just between you and ' + s.marriage.partner.name + ' for a few weeks.');
            fx({ happiness: 8 });
          }
        }
      ]
    };
    S.evId = 'pregnancy_announce_' + gameYear();
  } else {
    log('Not this month. Try again later.');
    fx({ happiness: -2 });
  }
  render();
};

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
window.marCheatingDiscovery = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p) return;
  
  S.pending = {
    title: '💔 You Found Out',
    text: 'You discover messages on ' + p.name + '’s phone. He has been seeing someone else. When you confront him, he breaks down.\n\nHe says it was "a moment of weakness" and begs you not to leave.',
    choices: [
      { label: '💪 Forgive him — a second chance', effect: function(s) {
          p.bond = Math.max(0, p.bond - 15);
          p.trust = Math.max(0, p.trust - 30);
          p.cheatedBefore = true;
          log('💪 You forgave him. But the trust will take years to rebuild.');
          fx({ happiness: -15 });
        }
      },
      { label: '💔 Demand a divorce', effect: function(s) {
          log('💔 You walked out. His betrayal was unforgivable.');
          fx({ happiness: -20 });
          // Trigger divorce flow
          s.marriage.partner = null;
          s.marriage.status = 'divorced';
          s.marriage.wedding = null;
          s.marriage.engagement = null;
          s.marriage.financeModel = null;
          s.marriage.sharedAccountBalance = 0;
          s.marriage.home = null;
          s.spouse = null;
          s.marriage.exSpouses.push({
            name: p.name, marriedYear: p.marriedYear || gameYear(), divorcedYear: gameYear(),
            reason: 'Cheating', childSupportAnnual: 0, custody: null, remarried: false
          });
        }
      },
      { label: '😶 Stay silent, say nothing', effect: function(s) {
          p.bond = Math.max(0, p.bond - 5);
          log('😶 You stayed silent. The question hangs in the air between you.');
          fx({ happiness: -10 });
        }
      }
    ]
  };
  S.evId = 'cheating_' + gameYear();
  render();
};
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

  // Alimony/Settlement Logic
  if (law.assetSplit === '50_50' && (!S.marriage.prenup || S.marriage.prenup.type !== 'Comprehensive Financial Agreement')) {
    settlement = Math.floor(S.wealth * 0.5);
  }
  // Only men pay alimony in this traditional sim, but in Western countries, it should be income based. 
  // Keeping it traditional for now, but fixing the custody bug below.
  if (S.job && law.alimonyYears > 0 && S.gender === 'm') {
    const years = typeof law.alimonyYears === 'number' ? law.alimonyYears : 1;
    settlement += Math.round(S.job.salary * 0.15 * years);
  }

  const children = S.childrenList || [];
  const playerGetsCustody = S.gender === 'f' || law.custody === 'joint'; // Female or joint = you get custody
  
  if (children.length > 0) {
    custody = S.gender === 'f' ? 'You have primary custody' : (law.custody === 'joint' ? 'Joint custody' : 'She has primary custody');
    
    // FIX: Only calculate child support if the PARTNER gets custody (or joint, in which case neither pays the other)
    if (!playerGetsCustody && p.income) {
      childSupportAnnual = Math.round(p.income * law.childSupportPct * children.length);
    }
  }

  const totalCost = courtFee + settlement;
  if (!confirm('Divorce under ' + law.label + ':\n\nCourt fee: ' + money(courtFee) + '\nSettlement: ' + money(settlement) + '\nChild support: ' + (childSupportAnnual > 0 ? money(childSupportAnnual) + '/yr (You receive)' : 'None') + '\nCustody: ' + (custody || 'N/A') + '\n\nTotal upfront: ' + money(totalCost) + '\n\nProceed?')) return;

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

  p.age++;

  let bondChange = -2;
  (p.traits || []).forEach(function(tid) {
    const t = marTrait(tid);
    if (t) bondChange += (t.bondPerYear || 0);
  });
  p.bond = Math.max(0, Math.min(100, p.bond + bondChange));

  if (p.income > 0) {
    const ambitious = (p.traits || []).indexOf('ambitious') >= 0 || (p.traits || []).indexOf('career_focused') >= 0;
    p.income = Math.round(p.income * (ambitious ? 1.06 : 1.03));
  }

  if (m.home) {
    const h = (MARRIAGE_HOME_OPTIONS || []).find(function(x) { return x.id === m.home; });
    if (h) {
      const yearly = marEGP(h.monthlyCostEGP * 12);
      if (S.wealth >= yearly) S.wealth -= yearly;
      else log('⚠️ Could not pay home costs (' + money(yearly) + ').');
    }
  }

  if (m.status === 'dating' && Math.random() < 0.30) {
    marFamilyIntervention();
  }

  /* Traditional women wait to be proposed to. If ready, the man may propose. */
  if (m.status === 'dating' && marIsTraditionalWoman() && p.bond >= 65 && p.trust >= 60 && p.commitmentTalks >= 1 && !p.pendingPartnerProposal) {
    if (Math.random() < 0.20) {
      marTriggerProposalEvent(p);
      return;
    }
  }

  /* Cheating discovery (when trust is low and traits match) */
  if (m.status === 'married' && !S.pending && p.trust < 40 && Math.random() < 0.10) {
    if (marHasTrait(p, 'jealous') || marHasTrait(p, 'impulsive') || marHasTrait(p, 'moody')) {
      marCheatingDiscovery();
      return;
    }
  }

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

  if (m.status === 'married' && !m.pendingConflict && p.bond < 50 && Math.random() < 0.20 && typeof MARRIAGE_CONFLICT_TOPICS !== 'undefined') {
    const topic = MARRIAGE_CONFLICT_TOPICS[Math.floor(Math.random() * MARRIAGE_CONFLICT_TOPICS.length)];
    m.pendingConflict = topic.id;
    log('⚔️ Conflict arose: ' + topic.label + '.');
  }

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

  /* Polygamy threat (traditional cultures only, after 3+ years married) */
  if (m.status === 'married' && marIsTraditionalWoman() && p.marriedYear && (gameYear() - p.marriedYear) >= 3) {
    if (!m.pendingSecondWife && m.motherInLawBond < 40 && Math.random() < 0.08) {
      marPolygamyThreat();
      return;
    }
  }

  /* Partner's ex reappears (rare drama) */
  if (m.status === 'married' && !S.pending && p.trust < 70 && Math.random() < 0.05) {
    const exNames = ['Layla', 'Sara', 'Nadia', 'Dina', 'Rania', 'Mona', 'Huda', 'Yasmin'];
    const exName = exNames[Math.floor(Math.random() * exNames.length)];
    marExAppears(exName);
    return;
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

  /* Child support from exes — woman RECEIVES, man PAYS */
  m.exSpouses.forEach(function(ex) {
    if (ex.childSupportAnnual > 0) {
      const annual = ex.childSupportAnnual;
      if (S.gender === 'f') {
        S.wealth += annual;
        log('💸 Received child support from ' + ex.name + ': +' + money(annual) + '.');
      } else {
        if (S.wealth >= annual) {
          S.wealth -= annual;
          log('💸 Child support paid to ' + ex.name + ': -' + money(annual) + '.');
        } else {
          log('⚠️ Could not pay child support to ' + ex.name + '.');
        }
      }
    }
  });
});
window.marExAppears = function(exName) {
  const m = S.marriage;
  const p = m.partner;
  if (!p) return;
  
  S.pending = {
    title: '💔 His Ex Reappears',
    text: exName + ', ' + p.name + '’s ex, suddenly texts him asking to "just talk". He shows you the message, waiting for your reaction.',
    choices: [
      { label: '😌 Trust him — "Do what you think is right"', effect: function(s) {
          if (marHasTrait(p, 'loyal')) {
            p.bond = Math.min(100, p.bond + 15);
            p.trust = Math.min(100, p.trust + 10);
            log('💚 ' + p.name + ' appreciated your trust. He replied with a polite "no." Your bond grew stronger.');
            fx({ happiness: 10 });
          } else {
            p.bond = Math.min(100, p.bond + 5);
            log('You gave him space. He handled it well, but a small doubt lingers.');
            fx({ happiness: 2 });
          }
        }
      },
      { label: '🚫 Demand he block her number', effect: function(s) {
          if (marHasTrait(p, 'independent') || marHasTrait(p, 'stubborn')) {
            p.bond = Math.max(0, p.bond - 15);
            p.trust = Math.max(0, p.trust - 5);
            log('😤 ' + p.name + ' was annoyed. "You don\'t control me." He blocked her but the argument lingers.');
            fx({ happiness: -8 });
          } else {
            p.bond = Math.min(100, p.bond + 5);
            log('He blocked her number to reassure you. He seemed a bit surprised at the request.');
            fx({ happiness: 3 });
          }
        }
      },
      { label: '😤 Ask him why she still has his number', effect: function(s) {
          p.bond = Math.max(0, p.bond - 10);
          log('😞 The argument escalated. He feels you don\'t trust him. Bond -10.');
          fx({ happiness: -5 });
        }
      }
    ]
  };
  S.evId = 'ex_appears_' + gameYear();
  render();
};
window.marPolygamyThreat = function() {
  const m = S.marriage;
  const p = m.partner;
  if (!p || m.status !== 'married') return;
  
  S.pending = {
    title: '💍 A Difficult Conversation',
    text: 'Your husband ' + p.name + ' sits you down nervously.\n\n"My mother has been pressuring me to consider a second wife. She says it would help our family status. I don\'t want this — but I need to know what you think."',
    choices: [
      { label: '💪 "If you marry again, I\'m gone."', effect: function(s) {
          if (marHasTrait(p, 'protector') || marHasTrait(p, 'loyal')) {
            p.bond = Math.min(100, p.bond + 20);
            log('💪 He hugged you. "Then it will never happen." His respect for you deepened.');
            s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 20);
            fx({ happiness: 8 });
          } else {
            p.bond = Math.max(0, p.bond - 20);
            log('😔 He went quiet. You are not sure where this is going.');
            fx({ happiness: -10 });
          }
        }
      },
      { label: '🤝 "It\'s your choice, but I\'ll be hurt."', effect: function(s) {
          if (marHasTrait(p, 'traditional') || marHasTrait(p, 'family_oriented')) {
            p.bond = Math.max(0, p.bond - 10);
            s.marriage.pendingSecondWife = true;
            log('😞 He nodded slowly. Something has changed between you.');
          } else {
            p.bond = Math.min(100, p.bond + 5);
            log('He promised to resist his mother\'s pressure.');
          }
        }
      },
      { label: '😢 Say nothing, look away', effect: function(s) {
          p.bond = Math.max(0, p.bond - 15);
          log('The silence said enough. He walked away.');
          fx({ happiness: -8 });
        }
      }
    ]
  };
  S.evId = 'polygamy_threat_' + gameYear();
  render();
};
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
    S.pending = {
      title: '👵 In-Laws Visit',
      text: 'Your mother-in-law announces she is coming to stay with you for a week. She has opinions about everything.',
      choices: [
        { label: '🏠 Host her graciously', effect: function(s) {
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 15);
            s.wealth -= marEGP(3000);
            log('👵 You hosted her with patience. She was impressed by your hospitality. Bond +15, but you spent ' + money(marEGP(3000)) + '.');
            fx({ happiness: -2 });
          }
        },
        { label: '😤 Push back on her comments', effect: function(s) {
            s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 20);
            p.bond = Math.min(100, p.bond + 5);
            log('😤 You pushed back on her criticism. Your husband was secretly proud, but his mother is furious.');
            fx({ happiness: 3 });
          }
        },
        { label: '🤐 Stay silent, keep the peace', effect: function(s) {
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 5);
            fx({ happiness: -5 });
            log('🤐 You bit your tongue. The week was exhausting but peaceful.');
          }
        }
      ]
    };
    S.evId = 'inlaws_visit_' + gameYear();
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
/* ===================== PATCH BLOCK START ===================== */

/* ---------- Small helpers ---------- */
function marFinanceLabel() {
  var list = (typeof MARRIAGE_FINANCE_MODELS !== 'undefined') ? MARRIAGE_FINANCE_MODELS : [];
  var fm = list.find(function(x) { return x.id === S.marriage.financeModel; });
  return fm ? fm.label : 'Not set';
}

function marMaritalHome() {
  if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];
  return S.ownedHomes.find(function(x) { return x.status === 'occupied'; }) || S.ownedHomes[0] || null;
}

function marMissingGehaz(home) {
  var missing = [];
  if (!home || typeof MARRIAGE_GEHAZ_CHECKLIST === 'undefined') return missing;
  var inv = (S.shopping && S.shopping.inventory) || [];
  MARRIAGE_GEHAZ_CHECKLIST.forEach(function(item) {
    var has = inv.some(function(i) {
      return i.homeId === home.id && i.cat === item.cat && (!item.subcat || i.subcat === item.subcat);
    });
    if (!has) missing.push(item);
  });
  return missing;
}

/* ---------- Traits: the game checks for these but never created them ---------- */
(function() {
  if (typeof MARRIAGE_PARTNER_TRAITS === 'undefined') return;
  var extra = {
    traditional: { label: 'Traditional', bondPerYear: 0 },
    protector:   { label: 'Protective',  bondPerYear: 1 },
    mamas_boy:   { label: "Mama's boy",  bondPerYear: -1 }
  };
  Object.keys(extra).forEach(function(id) {
    if (!MARRIAGE_PARTNER_TRAITS[id]) MARRIAGE_PARTNER_TRAITS[id] = extra[id];
  });
})();

/* New trait roller: adds the missing traits and stops contradictions
   (for example "frugal" and "extravagant" on the same person). */
function marRollTraits() {
  var positive = ['kind', 'funny', 'romantic', 'calm', 'ambitious', 'religious', 'generous', 'loyal', 'independent', 'family_oriented', 'patient', 'supportive', 'communicative', 'adventurous', 'homebody', 'mature', 'frugal', 'career_focused', 'shy', 'outgoing', 'private', 'sentimental', 'financially_cautious', 'confident', 'traditional', 'protector'];
  var negative = ['grumpy', 'moody', 'pessimistic', 'greedy', 'jealous', 'impulsive', 'extravagant', 'avoidant', 'stubborn', 'insecure'];
  if (S.gender !== 'm') negative.push('mamas_boy'); /* partner is male */
  var prof = marCountryProfile();
  if (prof && prof.traditionalGenderRoles === true) positive.push('traditional', 'traditional', 'family_oriented', 'religious');
  var clashes = [['frugal', 'extravagant'], ['shy', 'outgoing'], ['homebody', 'adventurous'], ['calm', 'moody'], ['kind', 'grumpy'], ['generous', 'greedy'], ['patient', 'impulsive'], ['communicative', 'avoidant'], ['confident', 'insecure'], ['independent', 'mamas_boy'], ['mature', 'impulsive'], ['private', 'outgoing'], ['optimistic', 'pessimistic'], ['loyal', 'jealous'], ['financially_cautious', 'extravagant']];
  var traits = [];
  function allowed(t) {
    if (traits.indexOf(t) >= 0) return false;
    return !clashes.some(function(c) {
      return (c[0] === t && traits.indexOf(c[1]) >= 0) || (c[1] === t && traits.indexOf(c[0]) >= 0);
    });
  }
  function draw(list, count) {
    var added = 0, tries = 0;
    while (added < count && tries < 40) {
      tries++;
      var t = list[Math.floor(Math.random() * list.length)];
      if (allowed(t)) { traits.push(t); added++; }
    }
  }
  draw(positive, 1 + Math.floor(Math.random() * 2));
  draw(negative, Math.floor(Math.random() * 3));
  if (!traits.length) traits.push('kind');
  return traits;
}

/* ---------- Family approval: the old version cancelled itself out ----------
   Now the country's family influence makes the factors (job, degree, age gap)
   matter MORE in family-centred countries and less elsewhere. */
function marFamilyApproval(partner) {
  var a = partner.familyApproval || 0.7;
  if (S.job && S.job.salary > 200000) a += 0.15;
  else if (!S.job) a -= 0.30;
  if (S.degree) a += 0.10;
  if (Math.abs(S.age - partner.age) > 10) a -= 0.15;
  var prof = marCountryProfile();
  if (prof) a = 0.7 + (a - 0.7) * (0.6 + prof.familyInfluence);
  return Math.max(0.1, Math.min(1.0, a));
}

/* ---------- Mother-in-law visit: now costs money, once per year ---------- */
window.marVisitMotherInLaw = function() {
  ensureMarriageState();
  var m = S.marriage, p = m.partner;
  if (!p || (m.status !== 'engaged' && m.status !== 'married')) return;
  var year = gameYear();
  if (m.lastInLawVisitYear === year) {
    log('👵 You already visited her this year. Going again so soon would feel forced.');
    render(); return;
  }
  var cost = marEGP(1500);
  if (S.wealth < cost) { log('Not enough cash for a proper visit (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;
  m.lastInLawVisitYear = year;
  var badChance = m.motherInLawBond > 70 ? 0.15 : 0.30;
  if (Math.random() < badChance) {
    m.motherInLawBond = marClamp(m.motherInLawBond - 5, 0, 100);
    if (marHasTrait(p, 'mamas_boy')) p.bond = marClamp(p.bond - 3, 0, 100);
    log('👵 You brought sweets and visited. She criticized your outfit and the visit felt tense. (' + money(cost) + ')');
    fx({ happiness: -3 });
  } else {
    var gain = 5 + (marHasTrait(p, 'family_oriented') ? 2 : 0);
    m.motherInLawBond = marClamp(m.motherInLawBond + gain, 0, 100);
    if (marHasTrait(p, 'mamas_boy')) p.bond = marClamp(p.bond + 2, 0, 100);
    log('👵 You brought sweets and helped with chores. She appreciated it. (' + money(cost) + ')');
    fx({ happiness: 2 });
  }
  render();
};

/* ---------- Trousseau check: uses the SAME checklist as the wedding ---------- */
window.marCheckTrousseau = function() {
  ensureMarriageState();
  var m = S.marriage;
  if (m.status !== 'engaged') return;
  var home = marMaritalHome();
  if (!home) { log('❌ You need a home before the trousseau can be checked.'); render(); return; }
  var missing = marMissingGehaz(home);
  if (missing.length === 0) {
    if (!m.trousseauComplete) {
      m.trousseauComplete = true;
      m.motherInLawBond = marClamp(m.motherInLawBond + 10, 0, 100);
      log('✅ The marital home is fully furnished! Your mother-in-law is impressed (+10 bond).');
    } else {
      log('✅ The trousseau is already complete.');
    }
  } else {
    log('⚠️ Still missing: ' + missing.map(function(i) { return i.label; }).join(', ') + '.');
  }
  render();
};

/* ---------- Ask for the hand: now needs readiness, costs money, can fail ---------- */
window.marAskForHand = function() {
  ensureMarriageState();
  var m = S.marriage, p = m.partner;
  if (!p || m.status !== 'dating') return;
  if (marIsTraditionalWoman()) {
    log('❌ In your culture, the man and his family approach your father. You must wait for him to propose.');
    render(); return;
  }
  var readiness = marPremaritalReadiness(p);
  if (!readiness.ready) { log('Your partner is not ready for this step. ' + readiness.reasons.join(' ')); render(); return; }
  var approval = marFamilyApproval(p);
  if (approval < 0.6) {
    log('❌ The family refused for now. They want to see more stability (need 60% family approval).');
    render(); return;
  }
  var cost = marEGP(5000);
  if (S.wealth < cost) { log('Not enough cash for the family visit (' + money(cost) + ').'); render(); return; }
  if (!confirm('Visit the family to ask for the hand in marriage?\n\nCost: ' + money(cost) + '\nThey may still say no.')) return;
  S.wealth -= cost;
  var chance = marClamp(approval * 0.9 + (p.familyIntroduced ? 0.08 : -0.10), 0.20, 0.95);
  if (Math.random() > chance) {
    p.familyApproval = marClamp((p.familyApproval || 0.7) - 0.05, 0.1, 1);
    marRecordMemory('family_refusal', 'The family asked for more time before agreeing to an engagement with ' + p.name + '.', 3);
    log('💬 The family asked for more time. Building their trust may help (introduce the families first).');
    fx({ happiness: -4 });
    render(); return;
  }
  p.exclusive = true;
  p.relationshipStage = 'engaged';
  p.bond = marClamp(p.bond + 5, 0, 100);
  p.trust = marClamp(p.trust + 5, 0, 100);
  m.engagement = { proposal: 'family', shabkaTier: 'standard', mahrTier: 'standard', partyTier: 'nice_hall', payer: 'self', finalized: false };
  m.status = 'engaged';
  marRecordMemory('family_blessing', 'The family blessed the engagement with ' + p.name + '.', 5);
  marUnlockAchievement('engaged');
  marReachMilestone('proposal');
  marReachMilestone('engagement');
  log('🎉 The family said yes! You are engaged. Now plan the engagement in the Plan tab.');
  fx({ happiness: 18 });
  render();
};

/* ---------- Gehaz card (shown during AND after engagement planning) ---------- */
window.marSetGehazPayer = function(id) {
  S.marriage.gehazPayer = id;
  render();
};

window.marRequestHome = function() {
  ensureMarriageState();
  if (!marIsTraditionalWoman()) return;
  if (typeof createHome !== 'function') { log('Home system not available.'); render(); return; }
  marHusbandProvidesHome();
  render();
};

function marRenderGehazCard() {
  ensureMarriageState();
  var m = S.marriage, p = m.partner;
  if (!p) return '';
  var home = marMaritalHome();
  var html = '<div class="card" style="border-color:#22d3ee;margin-top:10px"><h4 style="color:#22d3ee">🛋 Gehaz (Trousseau & Furniture)</h4>';
  if (!home) {
    html += '<p class="bad small">⚠️ No marital home yet.</p>';
    if (marIsTraditionalWoman() && !m.husbandHomeProvided) {
      html += '<p class="muted small">In your culture the groom provides the home. Ask ' + p.name + ' and his family about it.</p>' +
        '<button class="opt" style="width:100%;text-align:center;font-size:.75rem" onclick="marRequestHome()">🏠 Ask about the marital home</button>';
    } else {
      html += '<p class="muted small">Buy or rent a home in the Real Estate tab, then come back here.</p>';
    }
    return html + '</div>';
  }
  html += '<div class="muted small">Home: <b>' + home.name + '</b></div>';
  html += '<div style="margin:8px 0;padding:8px;background:#0f0f1a;border-radius:6px"><b class="small" style="color:#fbbf24">Who pays for the Gehaz?</b>';
  if (marIsTraditionalWoman()) {
    html += '<p class="muted small" style="margin-top:4px">💡 In your culture the groom and his family provide the furniture.</p>';
  } else {
    var opts = S.gender === 'm'
      ? [['self', 'You pay'], ['groom_family', 'Your family'], ['split', 'Split']]
      : [['partner', 'Partner pays'], ['split', 'Split 50/50']];
    html += '<div style="display:flex;gap:4px;margin-top:4px">';
    opts.forEach(function(o) {
      html += '<button class="pill ' + (m.gehazPayer === o[0] ? 'on' : '') + '" style="flex:1;font-size:.65rem;padding:4px" onclick="marSetGehazPayer(\'' + o[0] + '\')">' + o[1] + '</button>';
    });
    html += '</div>';
  }
  html += '</div>';
  if (m.status === 'engaged') {
    html += '<button class="opt" style="margin-bottom:8px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700;font-size:.75rem;padding:8px" onclick="marDiscussGehaz()">💬 Discuss Gehaz with ' + p.name + '</button>';
  }
  var missing = marMissingGehaz(home);
  var total = (typeof MARRIAGE_GEHAZ_CHECKLIST !== 'undefined') ? MARRIAGE_GEHAZ_CHECKLIST.length : 0;
  if (typeof MARRIAGE_GEHAZ_CHECKLIST !== 'undefined') {
    MARRIAGE_GEHAZ_CHECKLIST.forEach(function(item) {
      var isMissing = missing.some(function(x) { return x === item; });
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1a1a2a"><span style="font-size:.8rem">' + (isMissing ? '❌' : '✅') + ' ' + item.label + '</span>';
      if (isMissing) html += '<button class="pill" style="padding:2px 8px;font-size:.65rem" onclick="marBuyGehazItem(\'' + item.cat + '\',\'' + (item.subcat || '') + '\')">Buy now</button>';
      html += '</div>';
    });
  }
  html += '<div class="row" style="margin-top:8px"><span>Progress</span><b>' + (total - missing.length) + ' / ' + total + '</b></div>';
  html += missing.length === 0
    ? '<p class="good small">✅ The marital home is fully furnished.</p>'
    : '<p class="bad small">⚠️ The wedding cannot go ahead until every item is in place.</p>';
  return html + '</div>';
}

/* ---------- Divorce: realistic settlement, custody and child support ---------- */
window.marAskForDivorce = function() {
  ensureMarriageState();
  var m = S.marriage, p = m.partner;
  if (!p || m.status !== 'married') return;
  var causes = MARRIAGE_DIVORCE_CAUSES.map(function(c) { return c.id + ' = ' + c.label; }).join('\n');
  var choice = prompt('Why divorce?\n\n' + causes + '\n\nEnter cause id:', 'boredom');
  if (!choice) return;
  var cause = MARRIAGE_DIVORCE_CAUSES.find(function(c) { return c.id === choice.trim(); });
  if (!cause) { log('Unknown cause.'); return; }

  var law = MARRIAGE_DIVORCE_LAWS[S.country] || MARRIAGE_DIVORCE_LAWS.egy;
  var courtFee = marEGP(law.courtFeeEGP);
  var prof = marCountryProfile();
  var trad = !!(prof && prof.traditionalGenderRoles);
  var fullPrenup = !!(m.prenup && m.prenup.type === 'Comprehensive Financial Agreement');
  var myInc = S.job ? Number(S.job.salary || 0) : 0;
  var herInc = Number(p.income || 0);
  var lines = [];
  var net = 0; /* positive = you pay, negative = you receive */

  /* 1. Shared account is split in half */
  var sharedBack = Math.round((m.sharedAccountBalance || 0) * 0.5);

  /* 2. Assets gained during the marriage (not everything you own) */
  if (law.assetSplit === '50_50' && !fullPrenup) {
    var base = (typeof m.wealthAtMarriage === 'number') ? m.wealthAtMarriage : Math.round(S.wealth * 0.5);
    var gained = Math.max(0, S.wealth - base);
    var split = Math.floor(gained * 0.5);
    if (split > 0) { net += split; lines.push('Asset split: ' + money(split)); }
  }

  /* 3. Deferred mahr: the husband owes it, the wife receives it */
  var mahrDef = Number(m.mahrDeferred || 0);
  if (mahrDef > 0) {
    if (S.gender === 'm') { net += mahrDef; lines.push('Deferred mahr you owe: ' + money(mahrDef)); }
    else { net -= mahrDef; lines.push('Deferred mahr you receive: ' + money(mahrDef)); }
  }

  /* 4. Alimony: traditional countries = husband pays, otherwise the higher earner pays */
  var years = typeof law.alimonyYears === 'number' ? law.alimonyYears : 0;
  if (years > 0) {
    var iPay = trad ? (S.gender === 'm') : (myInc > herInc);
    var payerInc = iPay ? myInc : herInc;
    var otherInc = iPay ? herInc : myInc;
    if (trad || payerInc > otherInc) {
      var alimony = Math.round(payerInc * 0.15 * years);
      if (alimony > 0) {
        net += iPay ? alimony : -alimony;
        lines.push((iPay ? 'Alimony you pay: ' : 'Alimony you receive: ') + money(alimony));
      }
    }
  }

  /* 5. Custody and child support (ends when the youngest child turns 18) */
  var children = S.childrenList || [];
  var custody = null, support = null;
  if (children.length > 0) {
    var joint = law.custody === 'joint';
    var iHaveCustody = S.gender === 'f';
    custody = joint ? 'Joint custody' : (iHaveCustody ? 'You have primary custody' : p.name + ' has primary custody');
    var youngest = Math.min.apply(null, children.map(function(c) { return Number(c.age) || 0; }));
    var untilYear = gameYear() + Math.max(1, 18 - youngest);
    var pct = Math.min(0.5, Number(law.childSupportPct || 0.15) * children.length);
    var amount = 0, direction = 'receive';
    if (!joint) {
      if (iHaveCustody) { amount = Math.round(herInc * pct); direction = 'receive'; }
      else { amount = Math.round(myInc * pct); direction = 'pay'; }
    } else {
      var diff = myInc - herInc;
      amount = Math.round(Math.abs(diff) * pct);
      direction = diff > 0 ? 'pay' : 'receive';
    }
    if (amount > 0) {
      support = { direction: direction, amount: amount, untilYear: untilYear, arrears: 0 };
      lines.push('Child support you ' + direction + ': ' + money(amount) + '/yr until ' + untilYear);
    }
  }

  var upfront = courtFee + net - sharedBack;
  var msg = 'Divorce under ' + law.label + ':\n\nCourt fee: ' + money(courtFee) + '\n' +
    (lines.length ? lines.join('\n') + '\n' : '') +
    (sharedBack > 0 ? 'Your half of the shared account: +' + money(sharedBack) + '\n' : '') +
    'Custody: ' + (custody || 'N/A') + '\n\nNet upfront ' + (upfront >= 0 ? 'cost' : 'gain') + ': ' + money(Math.abs(upfront)) + '\n\nProceed?';
  if (!confirm(msg)) return;
  if (upfront > 0 && S.wealth < upfront) { log('Not enough cash for the divorce (' + money(upfront) + ').'); render(); return; }
  S.wealth -= upfront;

  m.exSpouses.push({
    name: p.name, marriedYear: p.marriedYear || gameYear(), divorcedYear: gameYear(),
    reason: cause.label, childSupportAnnual: 0, support: support, custody: custody, remarried: false
  });
  m.partner = null; m.status = 'divorced'; m.wedding = null; m.engagement = null;
  m.financeModel = null; m.sharedAccountBalance = 0; m.home = null; m.homeSetupPaid = false;
  m.prenup = null; m.pendingConflict = null; m.trousseauComplete = false;
  m.motherInLawBond = 50; m.stress = 20; m.mahrAdvanced = 0; m.mahrDeferred = 0;
  delete m.wealthAtMarriage;
  m.tab = 'overview';
  S.spouse = null;
  log('💔 Divorced ' + p.name + '. Reason: ' + cause.label + '. Net upfront ' + (upfront >= 0 ? 'cost ' : 'gain ') + money(Math.abs(upfront)) + '.');
  fx({ happiness: -25 });
  render();
};

/* ---------- Yearly rules: child support + marital stress ---------- */
GameHooks.on('year', function() {
  ensureMarriageState();
  if (!S || !S.marriage) return;
  var m = S.marriage;

  /* Child support (ends at 18, unpaid amounts carry over as arrears) */
  (m.exSpouses || []).forEach(function(ex) {
    var s = ex.support;
    if (!s || !s.amount) return;
    if (gameYear() > s.untilYear) {
      log('✅ Child support involving ' + ex.name + ' has ended. The children are now adults.');
      ex.support = null; return;
    }
    if (s.direction === 'receive') {
      S.wealth += s.amount;
      log('💸 Received child support from ' + ex.name + ': +' + money(s.amount) + '.');
    } else {
      var due = s.amount + (s.arrears || 0);
      if (S.wealth >= due) {
        S.wealth -= due; s.arrears = 0;
        log('💸 Child support paid to ' + ex.name + ': -' + money(due) + '.');
      } else {
        s.arrears = due;
        log('⚠️ Could not pay child support to ' + ex.name + '. ' + money(due) + ' is now overdue.');
        fx({ happiness: -4 });
      }
    }
  });

  /* Marital stress */
  var p = m.partner;
  if (m.status !== 'married' || !p) return;
  var kids = (S.childrenList || []).length;
  var income = (S.job ? Number(S.job.salary || 0) : 0) + Number(p.income || 0);
  var delta = -3;
  if (income <= 0) delta += 15;
  delta += 2 * Math.min(kids, 4);
  if (m.motherInLawBond < 35) delta += 4;
  if (!marMaritalHome() && !m.home) delta += 4;
  if (p.bond > 75) delta -= 5;
  m.stress = marClamp((m.stress || 20) + delta, 0, 100);
  if (m.stress > 70) {
    p.bond = marClamp(p.bond - 3, 0, 100);
    if (!m.pendingConflict && Math.random() < 0.20 && typeof MARRIAGE_CONFLICT_TOPICS !== 'undefined' && MARRIAGE_CONFLICT_TOPICS.length) {
      var topic = MARRIAGE_CONFLICT_TOPICS[Math.floor(Math.random() * MARRIAGE_CONFLICT_TOPICS.length)];
      m.pendingConflict = topic.id;
      log('⚔️ The pressure at home led to a conflict: ' + topic.label + '.');
    }
  }
});

window.marReduceStress = function() {
  ensureMarriageState();
  var m = S.marriage, p = m.partner;
  if (m.status !== 'married' || !p) return;
  if (m.lastStressReliefYear === gameYear()) { log('You already took a family break this year.'); render(); return; }
  var cost = marEGP(8000);
  if (S.wealth < cost) { log('Not enough cash for a family break (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;
  m.lastStressReliefYear = gameYear();
  m.stress = marClamp(m.stress - 20, 0, 100);
  p.bond = marClamp(p.bond + 2, 0, 100);
  log('🌿 You took a short family break with ' + p.name + '. Stress is lower. (' + money(cost) + ')');
  fx({ happiness: 4 });
  render();
};

/* Add a stress + in-laws card to the Married Life tab */
var _marRenderLifeBase = marRenderLife;
marRenderLife = function() {
  var html = _marRenderLifeBase();
  var m = S.marriage;
  if (m.status !== 'married' || !m.partner) return html;
  var st = Math.round(m.stress || 0);
  var col = st > 70 ? '#fb7185' : st > 40 ? '#fbbf24' : '#34d399';
  var mil = Math.round(m.motherInLawBond || 0);
  html += '<div class="card" style="border-color:' + col + '"><h3 style="color:' + col + '">🌡 Household Pressure</h3>' +
    '<div class="row"><span>Stress</span><b style="color:' + col + '">' + st + '%</b></div>' +
    '<div class="row"><span>Mother-in-law bond</span><b>' + mil + '%</b></div>' +
    '<p class="muted small" style="margin-top:6px">Stress rises with no income, children, a poor in-law relationship and no home. Above 70% it hurts your bond and triggers conflicts.</p>' +
    '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="marReduceStress()">🌿 Take a family break · ' + money(marEGP(8000)) + '</button>' +
    '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="marVisitMotherInLaw()">☕ Visit your mother-in-law · ' + money(marEGP(1500)) + '</button>' +
    '</div>';
  return html;
};

/* ---------- Only one pop-up at a time ---------- */
['marFamilyIntervention', 'marTriggerProposalEvent', 'marExAppears', 'marPolygamyThreat', 'marCheatingDiscovery'].forEach(function(name) {
  var orig = window[name];
  if (typeof orig !== 'function') return;
  window[name] = function() {
    if (S && S.pending) return;
    return orig.apply(this, arguments);
  };
});
var _marFireYearEventBase = marFireYearEvent;
marFireYearEvent = function(evt) {
  if (S && S.pending && evt && evt.id === 'inlaws_visit') return;
  return _marFireYearEventBase(evt);
};

/* ===================== PATCH BLOCK END ===================== */
/* ============================================================
   PATCH 2: Father negotiation · property deals · gold shabka ·
   groom furnishing · chemistry
   ============================================================ */

/* ---------- Gold helpers ---------- */
function marGoldLocalPerGram(karat) {
  const m = ((typeof SHOP_MULT !== 'undefined' && SHOP_MULT[S.country]) || SHOP_MULT.egy).luxury || 1;
  return Math.round(SHOP_GOLD_USD_PER_GRAM * (karat / 24) * m * (C().rate || 1));
}

function marGiveJewelry(it, paidBy, priceLocal) {
  if (typeof ensureShoppingState === 'function') ensureShoppingState();
  const price = priceLocal || it.priceLocal;
  S.shopping.inventory.push({
    uid: 'i' + (S.uidN++), itemId: it.id, brand: it.brand, name: it.name,
    cat: 'jewelry', subcat: it.subcat, priceUSD: it.priceUSD || 0,
    purchasePrice: price, currentValue: Math.round(price * 0.9),
    purchaseYear: gameYear(), age: 0, life: 9999,
    happiness: it.happiness || 5, social: it.social || 5,
    grams: it.grams, karat: it.karat,
    broken: false, condition: 100,
    warrantyUntil: 0, extendedWarranty: false, extendedWarrantyUntil: 0,
    homeId: null, homeName: null, returnableUntil: 0, cardUsed: null,
    paidBy: paidBy || 'self'
  });
}

/* Salonat / fallback: turn raw grams into real jewelry pieces */
function marGrantShabkaJewelry(totalGrams, karat) {
  karat = karat || 21;
  const per = marGoldLocalPerGram(karat);
  const parts = [
    ['Bridal Necklace Set', 'necklace', 0.40, 0.25],
    ['Gold Bangles (Ghawayesh)', 'bracelet', 0.25, 0.15],
    ['Big Bridal Ring', 'ring', 0.20, 0.25],
    ['Gold Earrings', 'earrings', 0.15, 0.20]
  ];
  parts.forEach(function(p) {
    const g = Math.max(1, Math.round(totalGrams * p[2]));
    const price = Math.round(g * per * (1 + p[3]));
    marGiveJewelry({
      id: 'shabka_' + p[1] + '_' + Math.random().toString(36).slice(2, 6),
      brand: 'Shabka', name: p[0], subcat: p[1], priceUSD: 0,
      happiness: 6, social: 6, grams: g, karat: karat
    }, 'groom', price);
  });
  log('💍 Your shabka (' + totalGrams + 'g of ' + karat + 'K gold) was made into jewelry. Check My Items.');
}

/* ---------- Shabka picker (choose pieces from the gold budget) ---------- */
function marPlayerShare(e) {
  const payer = (e && e.payer) || 'self';
  return payer === 'partner' ? 0 : payer === 'split' ? 0.5 : 1;
}

window.marOpenShabkaPicker = function() {
  const m = S.marriage, e = m.engagement;
  if (!e || !e.finalized) { log('Finalize the engagement first.'); render(); return; }
  if (m.shabkaChosen) { log('You already chose your shabka.'); render(); return; }
  m.shabkaPick = { budget: marEGP(e.shabkaCost || 0), items: [] };
  m.tab = 'plan';
  render();
};
/* the old gold-souk popup now opens the picker instead */
window.marShabkaGoldSoukTrip = function() { marOpenShabkaPicker(); };

function _marShabkaCatalog() {
  return shopBuildCatalog('jewelry').filter(function(i) { return i.cat === 'jewelry' && i.grams > 0; });
}

window.marShabkaAdd = function(id) {
  const pk = S.marriage.shabkaPick; if (!pk) return;
  const it = _marShabkaCatalog().find(function(i) { return i.id === id; });
  if (!it) return;
  const left = pk.budget - pk.items.reduce(function(s, x) { return s + x.priceLocal; }, 0);
  if (it.priceLocal > left) { log('❌ That piece is over your remaining gold budget.'); render(); return; }
  pk.items.push(it);
  render();
};
window.marShabkaRemove = function(i) {
  const pk = S.marriage.shabkaPick; if (!pk) return;
  pk.items.splice(i, 1); render();
};

window.marShabkaFinish = function() {
  const m = S.marriage, pk = m.shabkaPick, p = m.partner, e = m.engagement;
  if (!pk || !pk.items.length) { log('Choose at least one piece.'); render(); return; }
  ensureShoppingState();
  const spent = pk.items.reduce(function(s, x) { return s + x.priceLocal; }, 0);
  const left = pk.budget - spent;
  const toMe = S.gender === 'f';
  pk.items.forEach(function(it) {
    if (toMe) marGiveJewelry(it, 'groom');
    else S.shopping.gifts.unshift({ year: gameYear(), itemId: it.id, name: it.brand + ' ' + it.name, price: it.priceLocal, to: p.name, toType: 'spouse' });
  });
  if (left > 0) {
    if (toMe) { S.wealth += left; log('💰 The unspent gold budget (' + money(left) + ') was given to you in cash.'); }
    else { const back = Math.round(left * marPlayerShare(e)); if (back > 0) { S.wealth += back; log('💰 Unspent gold budget refunded: ' + money(back) + '.'); } }
  }
  const grams = pk.items.reduce(function(s, x) { return s + x.grams; }, 0);
  p.chemistry = Math.min(100, (p.chemistry || 40) + 8);
  p.bond = Math.min(100, p.bond + 6);
  m.motherInLawBond = Math.min(100, (m.motherInLawBond || 50) + (grams >= 40 ? 5 : 0));
  m.shabkaChosen = true; m.shabkaPick = null;
  log(toMe
    ? '🪙 You chose your shabka: ' + pk.items.map(function(i) { return i.name; }).join(', ') + ' (' + grams + 'g of gold). It is in My Items and keeps its value.'
    : '🪙 You gave ' + p.name + ' the shabka (' + grams + 'g of gold). It appears in the Gift Registry.');
  fx({ happiness: 10 });
  render();
};

function marRenderShabkaPicker() {
  const m = S.marriage, pk = m.shabkaPick;
  if (!pk) {
    return '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🪙 The Shabka</h3>' +
      '<p class="muted small">Go to the gold souk and choose your pieces (rings, a big ring, necklaces, bangles, earrings, sets) from the shabka budget. They become real gold items that keep their value.</p>' +
      '<button class="opt" style="width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="marOpenShabkaPicker()">🪙 Visit the gold souk</button></div>';
  }
  const spent = pk.items.reduce(function(s, x) { return s + x.priceLocal; }, 0);
  const left = pk.budget - spent;
  let html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🪙 Gold Souk</h3>' +
    '<div class="row"><span>Gold budget</span><b>' + money(pk.budget) + '</b></div>' +
    '<div class="row"><span>Selected</span><b>' + money(spent) + '</b></div>' +
    '<div class="row"><span>Remaining</span><b class="' + (left > 0 ? 'good' : 'bad') + '">' + money(left) + '</b></div>';
  if (pk.items.length) {
    html += '<div style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px"><b class="small">Your pieces</b>';
    pk.items.forEach(function(it, i) {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:.75rem"><span>' + it.name + ' · ' + it.grams + 'g ' + it.karat + 'K</span>' +
        '<span>' + money(it.priceLocal) + ' <button class="pill" style="padding:1px 6px;font-size:.65rem" onclick="marShabkaRemove(' + i + ')">✕</button></span></div>';
    });
    html += '</div>';
  }
  const subs = {};
  _marShabkaCatalog().forEach(function(i) { (subs[i.subcat] = subs[i.subcat] || []).push(i); });
  Object.keys(subs).forEach(function(sub) {
    html += '<h4 style="font-size:.78rem;color:#fbbf24;margin-top:10px">' + sub.replace(/_/g, ' ').toUpperCase() + '</h4>';
    subs[sub].forEach(function(it) {
      const ok = it.priceLocal <= left;
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-size:.75rem"><b>' + it.brand + ' · ' + it.name + '</b><div class="muted small">' + it.desc + '</div></div>' +
        '<button class="pill" style="padding:3px 8px;font-size:.68rem;' + (ok ? '' : 'opacity:.4') + '" ' + (ok ? '' : 'disabled') + ' onclick="marShabkaAdd(\'' + it.id + '\')">' + money(it.priceLocal) + ' +</button></div>';
    });
  });
  html += '<button class="opt" style="margin-top:12px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700" onclick="marShabkaFinish()">✅ Take the shabka home</button></div>';
  return html;
}

var _marRenderPlanBase2 = marRenderPlan;
marRenderPlan = function() {
  let html = _marRenderPlanBase2();
  const m = S.marriage;
  if (m.status === 'engaged' && m.engagement && m.engagement.finalized && !m.shabkaChosen) {
    html = marRenderShabkaPicker() + html;
  }
  return html;
};

/* ---------- Chemistry ---------- */
function marEnsureChem(p) {
  if (!p) return 0;
  if (typeof p.chemistry !== 'number') {
    p.chemistry = marClamp(30 + Math.round((p.compatibility || 50) * 0.3) + Math.floor(Math.random() * 15), 0, 100);
  }
  return p.chemistry;
}
function marBumpChem(p, n) { if (p) p.chemistry = marClamp(marEnsureChem(p) + n, 0, 100); }

var _marDoActivityBase = window.marDoActivity;
window.marDoActivity = function(id) {
  const p = S.marriage && S.marriage.partner;
  const before = p ? (p.dateCount || 0) : 0;
  _marDoActivityBase(id);
  if (p && S.marriage.partner === p && (p.dateCount || 0) > before) {
    marBumpChem(p, (p.preferences && p.preferences.preferredActivity === id) ? 4 : 1);
    if (marHasTrait(p, 'romantic') && (id === 'gift' || id === 'restaurant')) marBumpChem(p, 1);
    render();
  }
};
var _marTalkBase = window.marPremaritalTalk;
window.marPremaritalTalk = function(id) {
  const p = S.marriage && S.marriage.partner;
  const before = p ? Object.keys(p.topicCounts || {}).reduce(function(s, k) { return s + p.topicCounts[k]; }, 0) : 0;
  _marTalkBase(id);
  if (p && S.marriage.partner === p) {
    const after = Object.keys(p.topicCounts || {}).reduce(function(s, k) { return s + p.topicCounts[k]; }, 0);
    if (after > before) { marBumpChem(p, marHasTrait(p, 'communicative') ? 3 : 2); render(); }
  }
};

var _marReadinessBase = marPremaritalReadiness;
marPremaritalReadiness = function(partner) {
  const r = _marReadinessBase(partner);
  const p = partner || (S && S.marriage && S.marriage.partner);
  if (!p) return r;
  const chem = marEnsureChem(p);
  r.score = Math.round(r.score * 0.9 + chem * 0.1);
  if (chem < 35) { r.reasons.push('The chemistry is not there yet. Spend more quality time together.'); r.ready = false; }
  return r;
};

var _marPremaritalPanelBase = marRenderPremaritalPanel;
marRenderPremaritalPanel = function() {
  const base = _marPremaritalPanelBase();
  const p = S.marriage.partner; if (!p) return base;
  const c = marEnsureChem(p);
  const col = c > 70 ? '#34d399' : c > 40 ? '#fbbf24' : '#fb7185';
  const label = c > 80 ? 'Inseparable' : c > 60 ? 'Strong spark' : c > 40 ? 'Warming up' : 'Awkward';
  return base + '<div class="card"><div style="display:flex;justify-content:space-between;font-size:.8rem"><b>✨ Chemistry</b><b style="color:' + col + '">' + c + '% · ' + label + '</b></div>' +
    '<div style="height:5px;background:#1a1a2a;border-radius:3px;margin-top:4px"><div style="height:100%;width:' + c + '%;background:' + col + ';border-radius:3px"></div></div>' +
    '<p class="muted small" style="margin-top:6px">Grows with shared activities, honest talks, their favourite things and thoughtful gifts (especially gold).</p></div>';
};

var _marRenderLifeBase2 = marRenderLife;
marRenderLife = function() {
  let html = _marRenderLifeBase2();
  const p = S.marriage.partner;
  if (S.marriage.status === 'married' && p) {
    const c = Math.round(marEnsureChem(p));
    html += '<div class="card"><div class="row"><span>✨ Chemistry</span><b>' + c + '%</b></div>' +
      '<p class="muted small">High chemistry strengthens the bond each year; low chemistry wears it down. Date nights and gifts help.</p></div>';
  }
  return html;
};

GameHooks.on('year', function() {
  if (!S || !S.marriage || !S.marriage.partner) return;
  const m = S.marriage, p = m.partner;
  if (m.status !== 'married') return;
  const c = marEnsureChem(p);
  marBumpChem(p, p.bond > 70 ? 1 : -2);
  if (c > 75) p.bond = marClamp(p.bond + 2, 0, 100);
  else if (c < 25) p.bond = marClamp(p.bond - 2, 0, 100);
});

/* ---------- Father negotiation ---------- */
function marTierByFrac(arr, f) {
  const s = arr.slice().sort(function(a, b) { return a.costEGP - b.costEGP; });
  return s[Math.min(s.length - 1, Math.max(0, Math.round(f * (s.length - 1))))];
}
function marTierStep(arr, tier, step) {
  const s = arr.slice().sort(function(a, b) { return a.costEGP - b.costEGP; });
  const i = s.findIndex(function(x) { return x.id === tier.id; });
  return s[Math.min(s.length - 1, Math.max(0, i + step))];
}
var MAR_PROPERTY_TEXT = {
  bride_name: 'a home registered in his daughter\'s name',
  his_name: 'a fully prepared home in his name, where his daughter will live with full right of residence',
  none: 'no property (they will start in a rented home)'
};
var MAR_FURNISH_TEXT = {
  groom_full: 'The groom furnishes and equips the home completely before the wedding.',
  shared: 'The groom will furnish the home but may ask his bride to share the cost and choose pieces together.'
};

/* income = groom's yearly income, famTier = bride's family wealth tier */
function marBuildFatherDemands(income, famTier, traits) {
  traits = traits || [];
  const lvl = income >= 1000000 ? 'rich' : income >= 400000 ? 'comfortable' : income >= 150000 ? 'middle' : 'modest';
  const base = { modest: 0.15, middle: 0.4, comfortable: 0.65, rich: 0.9 }[lvl];
  const fam = { poor: -0.1, 'lower-mid': -0.05, middle: 0, 'upper-mid': 0.1, wealthy: 0.2, ultra: 0.3 }[famTier || 'middle'] || 0;
  const f = Math.max(0, Math.min(1, base + fam + (Math.random() * 0.1 - 0.05)));
  let property = 'his_name';
  if (lvl === 'rich') property = Math.random() < 0.7 ? 'bride_name' : 'his_name';
  else if (lvl === 'comfortable') property = (f > 0.7 || Math.random() < 0.4) ? 'bride_name' : 'his_name';
  else if ((famTier === 'wealthy' || famTier === 'ultra') && lvl === 'middle' && Math.random() < 0.35) property = 'bride_name';
  const generous = traits.indexOf('generous') >= 0 || traits.indexOf('traditional') >= 0 || traits.indexOf('family_oriented') >= 0;
  const furnishing = (lvl === 'rich' || lvl === 'comfortable' || (generous && lvl !== 'modest')) ? 'groom_full' : 'shared';
  return {
    level: lvl,
    shabka: marTierByFrac(MARRIAGE_SHABKA_TIERS, f),
    mahr: marTierByFrac(MARRIAGE_MAHR_TIERS, f),
    property: property, furnishing: furnishing
  };
}

function marApplyFatherDeal(p, d) {
  const m = S.marriage;
  m.partner = p; m.status = 'engaged';
  p.exclusive = true; p.relationshipStage = 'engaged'; p.pendingPartnerProposal = null;
  p.bond = Math.min(100, p.bond + 5); marBumpChem(p, 5);
  m.fatherDemands = d; m.propertyDeal = d.property; m.gehazModel = d.furnishing;
  m.gehazPayer = d.furnishing === 'groom_full' ? 'groom' : 'split';
  m.engagement = {
    proposal: 'family', shabkaTier: d.shabka.id, mahrTier: d.mahr.id, partyTier: 'nice_hall',
    payer: S.gender === 'f' ? 'partner' : 'self', mahrAdvancedPct: 0.5, fatherTerms: true, finalized: false
  };
  marRecordMemory('family_blessing', 'The fathers agreed on the terms: ' + d.shabka.label + ' shabka, ' + d.mahr.label + ' mahr, ' + (MAR_PROPERTY_TEXT[d.property]) + '.', 5);
  marUnlockAchievement('engaged'); marReachMilestone('proposal'); marReachMilestone('engagement');
  fx({ happiness: 22 });
}

function marDemandsText(d) {
  return '• Shabka: ' + d.shabka.label + '\n• Mahr: ' + d.mahr.label + '\n• Property: ' + MAR_PROPERTY_TEXT[d.property] + '\n• ' + MAR_FURNISH_TEXT[d.furnishing];
}

/* Woman (traditional): he comes with his family and sits with your father */
window.marStartFatherMeeting = function(p) {
  if (S.pending) return;
  const father = (S.family || []).find(function(f) { return f.role === 'Father' && f.alive !== false; });
  const fname = father ? father.name : 'Your father';
  const d = marBuildFatherDemands(Number(p.income || 0) || 250000, S.familyTier, p.traits);
  S.pending = {
    title: '☕ ' + p.name + ' Comes for Your Hand',
    text: p.name + ' arrives with his family. Over tea, ' + fname + ' listens, then names his conditions for his daughter\'s security:\n\n' + marDemandsText(d) +
      '\n\nThe room goes quiet. ' + p.name + ' looks at you.',
    choices: [
      { label: '✅ Accept the terms', effect: function() {
          marApplyFatherDeal(p, d);
          log('💍 The families shook hands. Engagement terms were set by ' + fname + '. Finalize them in the Plan tab.');
        } },
      { label: '🕊 Ask Baba to be a little flexible', effect: function() {
          if (Math.random() < 0.35 + p.bond / 250) {
            const soft = Object.assign({}, d, {
              shabka: marTierStep(MARRIAGE_SHABKA_TIERS, d.shabka, -1),
              mahr: marTierStep(MARRIAGE_MAHR_TIERS, d.mahr, -1),
              property: d.property === 'bride_name' ? 'his_name' : d.property
            });
            marApplyFatherDeal(p, soft);
            log('🕊 ' + fname + ' softened his terms out of love for you. ' + p.name + ' was grateful.');
          } else {
            marApplyFatherDeal(p, d);
            S.marriage.motherInLawBond = Math.max(0, S.marriage.motherInLawBond - 10);
            log('😬 ' + fname + ' refused to bend. His family felt pressured. The terms stand.');
          }
        } },
      { label: '⏳ Ask for more time', effect: function() {
          p.trust = Math.max(0, p.trust - 2);
          log('💬 You asked for time. The families left politely.');
        } },
      { label: '❌ Refuse', effect: function(s) {
          s.marriage.partner = null; s.marriage.status = 'single';
          log('💔 You refused the proposal.'); fx({ happiness: -10 });
        } }
    ]
  };
  S.evId = 'father_meeting_' + gameYear();
  render();
};

var _marTriggerProposalOrig = window.marTriggerProposalEvent;
window.marTriggerProposalEvent = function(p) {
  if (S && S.pending) return;
  if (marIsTraditionalWoman()) return marStartFatherMeeting(p);
  return _marTriggerProposalOrig.apply(this, arguments);
};
var _marRespondOrig = window.marRespondToPartnerProposal;
window.marRespondToPartnerProposal = function(choice) {
  const p = S.marriage.partner;
  if (choice === 'accept' && p && marIsTraditionalWoman() && S.marriage.status === 'dating' && p.pendingPartnerProposal) {
    p.pendingPartnerProposal = null;
    return marStartFatherMeeting(p);
  }
  return _marRespondOrig(choice);
};

/* Man (or non-traditional): YOU go to HER father and he sets conditions for you */
window.marAskForHand = function() {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (!p || m.status !== 'dating' || S.pending) return;
  if (marIsTraditionalWoman()) { log('❌ In your culture, he and his family approach your father.'); render(); return; }
  const r = marPremaritalReadiness(p);
  if (!r.ready) { log('Not ready yet. ' + r.reasons.join(' ')); render(); return; }
  const approval = marFamilyApproval(p);
  if (approval < 0.6) { log('❌ The family wants more stability first (need 60% approval).'); render(); return; }
  const cost = marEGP(5000);
  if (S.wealth < cost) { log('Not enough cash for the family visit (' + money(cost) + ').'); render(); return; }
  const income = (S.job ? Number(S.job.salary || 0) : 0) + Math.round(S.wealth / 10);
  const d = marBuildFatherDemands(income, 'middle', p.traits);
  S.wealth -= cost;
  S.pending = {
    title: '☕ You Visit ' + p.name + '\'s Father',
    text: 'You sit with her father and her family. After questions about your work and plans, he names his conditions:\n\n' + marDemandsText(d) +
      '\n\nYou will have to provide these before the wedding.',
    choices: [
      { label: '✅ Agree to the terms', effect: function() {
          marApplyFatherDeal(p, d);
          log('💍 Agreed. Finalize the engagement in the Plan tab. ' + (d.property === 'bride_name' ? 'You must own a home to put in her name before the wedding.' : ''));
        } },
      { label: '🤝 Negotiate (property in your name instead)', effect: function() {
          if (Math.random() < 0.40 + p.bond / 300) {
            marApplyFatherDeal(p, Object.assign({}, d, { property: 'his_name', furnishing: 'shared' }));
            log('🤝 Her father agreed to a lighter arrangement.');
          } else {
            p.familyApproval = marClamp((p.familyApproval || 0.7) - 0.05, 0.1, 1);
            log('💬 Her father held firm and asked you to come back when you are ready.');
          }
        } },
      { label: '🚪 Walk away', effect: function() { p.bond = Math.max(0, p.bond - 10); log('You left the meeting. ' + p.name + ' is hurt.'); } }
    ]
  };
  S.evId = 'hand_meeting_' + gameYear();
  render();
};

/* Father's terms are fixed in the engagement planner */
var _marEngagementSetBase = window.marEngagementSet;
window.marEngagementSet = function(key, value) {
  const e = S.marriage.engagement;
  if (e && e.fatherTerms && (key === 'shabkaTier' || key === 'mahrTier')) {
    log('📜 These terms were set by the fathers and cannot be changed here.'); render(); return;
  }
  return _marEngagementSetBase(key, value);
};

/* ---------- Home + furnishing before marriage ---------- */
function marAddGehazItem(home, item, payer) {
  const pool = SHOP_ALL.filter(function(r) { return r[2] === item.cat && (!item.subcat || r[3] === item.subcat); });
  if (!pool.length) return 0;
  const r = pool[Math.floor(pool.length / 2)];
  const mult = SHOP_MULT[S.country] ? (SHOP_MULT[S.country][item.cat] || 1) : 1;
  const price = Math.round(r[4] * mult * (C().rate || 1));
  S.shopping.inventory.push({
    uid: 'i' + (S.uidN++), itemId: r[0].toLowerCase() + '_' + r[1].toLowerCase().replace(/\W/g, '_'),
    brand: r[0], name: r[1], cat: item.cat, subcat: r[3], priceUSD: r[4],
    purchasePrice: price, currentValue: price, purchaseYear: gameYear(), age: 0, life: r[7],
    happiness: r[5], social: r[6], broken: false, condition: 100, warrantyUntil: 0,
    homeId: home.id, homeName: home.name, paidBy: payer
  });
  home.furnitureValue = (home.furnitureValue || 0) + price;
  home.value = (home.value || 0) + price;
  home.homeComfort = (home.homeComfort || 0) + r[5] * 2;
  home.shoppingComfort = (home.shoppingComfort || 0) + r[5] * 2;
  return price;
}

function marApplyGehazModel(home) {
  const m = S.marriage, p = m.partner;
  if (!home || !p) return;
  ensureShoppingState();
  const missing = marMissingGehaz(home);
  if (!missing.length) return;
  if (m.gehazModel === 'groom_full') {
    missing.forEach(function(it) { marAddGehazItem(home, it, 'husband'); });
    p.bond = Math.min(100, p.bond + 8); marBumpChem(p, 5);
    log('🛋 ' + p.name + ' and his family furnished and equipped the whole home before the wedding (' + missing.length + ' items). You only need to enjoy it.');
  } else {
    const half = Math.ceil(missing.length / 2);
    missing.slice(0, half).forEach(function(it) { marAddGehazItem(home, it, 'husband'); });
    m.gehazPayer = 'split';
    log('🛋 ' + p.name + ' furnished ' + half + ' items and asked for your help with the rest: "Let us finish our home together." Use the Buy now buttons in the Plan tab (cost is shared).');
    marBumpChem(p, 3);
  }
}

window.marHusbandProvidesHome = function() {
  const m = S.marriage, p = m.partner;
  if (!p || m.husbandHomeProvided) return null;
  if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];
  const existing = S.ownedHomes.find(function(h) { return h.status === 'occupied'; });
  if (existing) { m.husbandHomeProvided = true; log('🏠 You will live in your existing home (' + existing.name + ').'); marApplyGehazModel(existing); return existing; }
  m.husbandHomeProvided = true;

  const inc = p.income || 0;
  let ppm, area, type, desc;
  if (inc >= 1000000) { ppm = 150000; area = 400; type = 'Luxury Villa'; desc = 'a stunning luxury villa with private gardens and a pool'; }
  else if (inc >= 500000) { ppm = 80000; area = 250; type = 'Villa'; desc = 'a spacious villa in a quiet neighborhood'; }
  else if (inc >= 200000) { ppm = 55000; area = 160; type = 'Apartment'; desc = 'a comfortable 3-bedroom apartment'; }
  else if (inc >= 100000) { ppm = 35000; area = 120; type = 'Apartment'; desc = 'a cozy 2-bedroom apartment'; }
  else { ppm = 25000; area = 90; type = 'Modest Apartment'; desc = 'a modest starter apartment'; }

  const toBride = m.propertyDeal ? m.propertyDeal === 'bride_name' : (marHasTrait(p, 'generous') || marHasTrait(p, 'protector') || p.bond >= 90);
  const value = ppm * area;
  S.ownedHomes.forEach(function(o) { if (o.status === 'occupied') o.status = 'vacant'; });
  const home = createHome({
    name: type + (toBride ? ' — In Your Name' : ' — ' + p.name + '\'s Property'),
    city: p.city || 'Cairo', location: 'Family Neighborhood', country: S.country,
    baseValue: value, value: value, area: area, rooms: Math.max(2, Math.floor(area / 30)),
    condition: 85, status: 'occupied', source: 'husband_provided',
    isHusbandOwned: !toBride, husbandName: p.name
  });
  S.ownedHomes.push(home);
  S.realEstateActiveHomeId = home.id; S.housing = 'owned';

  let text = p.name + ' takes you to see ' + desc + '.';
  text += toBride
    ? '\n\n"As your father asked, and as I wanted: it is registered in your name. Whatever happens, this home is yours."'
    : '\n\n"This is where we will build our life. It is in my name, but it is your home, and no one can ever make you leave."';
  S.pending = {
    title: '🏠 Your Marital Home', text: text,
    choices: [{
      label: toBride ? '💍 Accept with tears in your eyes' : '💍 Accept with joy',
      effect: function(s) {
        if (toBride) { log('🏠 ' + desc + ' is registered in YOUR name, worth ' + money(value) + '. It appears in your assets and is yours to keep or sell.'); fx({ happiness: 25, social: 8 }); p.bond = Math.min(100, p.bond + 15); marBumpChem(p, 6); }
        else { log('🏠 You will live in ' + desc + '. It stays in ' + p.name + '\'s name: it shows in your assets but you cannot sell it.'); fx({ happiness: 12, social: 4 }); p.bond = Math.min(100, p.bond + 8); }
        marRecordMemory('home_provided', p.name + ' provided the marital home worth ' + money(value) + '.', 4);
        marApplyGehazModel(home);
      }
    }]
  };
  S.evId = 'husband_home_' + gameYear();
  return home;
};

/* Home is provided as soon as the engagement is finalized (not at the wedding) */
var _marFinalizeBase = window.marFinalizeEngagement;
window.marFinalizeEngagement = function() {
  const wasFinal = S.marriage.engagement && S.marriage.engagement.finalized;
  _marFinalizeBase();
  const m = S.marriage;
  if (!wasFinal && m.engagement && m.engagement.finalized && marIsTraditionalWoman() && !m.husbandHomeProvided && !S.pending) {
    marHusbandProvidesHome();
  }
  render();
};

/* Traditional bride: respect the "shared" model when buying gehaz pieces.
   In marBuyGehazItem change:  if (marIsTraditionalWoman()) {
   to:                         if (marIsTraditionalWoman() && m.gehazModel !== 'shared') {  */

var _marGehazCardBase = marRenderGehazCard;
marRenderGehazCard = function() {
  let html = _marGehazCardBase();
  const m = S.marriage;
  const note = m.gehazModel === 'shared'
    ? '💡 He furnishes part of the home and asked for your help with the rest. Costs are shared.'
    : '💡 The groom and his family furnish the home completely before the wedding.';
  if (m.gehazModel) html = html.replace('💡 In your culture the groom and his family provide the furniture.', note);
  return html;
};

/* ---------- Wedding gates + property transfer (male player) ---------- */
var _marConfirmWeddingBase = window.marConfirmWedding;
window.marConfirmWedding = function() {
  const m = S.marriage;
  if (S.pending) return;
  if (marIsTraditionalWoman() && m.engagement && m.engagement.finalized && !m.shabkaChosen) {
    log('🪙 Choose your shabka at the gold souk before the wedding (Plan tab).'); render(); return;
  }
  if (S.gender === 'm' && m.propertyDeal === 'bride_name' && !m.propertyDelivered) {
    const h = (S.ownedHomes || []).find(function(x) { return !x.isHusbandOwned; });
    if (!h) { log('🏠 Her father requires a home in her name. Buy one first (Real Estate tab).'); render(); return; }
  }
  _marConfirmWeddingBase();
  if (m.status === 'married' && S.gender === 'm' && m.propertyDeal === 'bride_name' && !m.propertyDelivered) {
    const idx = (S.ownedHomes || []).findIndex(function(x) { return !x.isHusbandOwned; });
    if (idx >= 0) {
      const h = S.ownedHomes[idx];
      m.propertyDelivered = true;
      S.ownedHomes.splice(idx, 1);
      if (h.status === 'occupied') S.housing = 'parents';
      m.homeInWifeName = h.name;
      log('🏠 As agreed, ' + h.name + ' was registered in your wife\'s name. It is no longer in your assets, but you live there together.');
    }
  }
};

/* ---------- Divorce: his-name house is not yours to keep ---------- */
var _marDivorceBase = window.marAskForDivorce;
window.marAskForDivorce = function() {
  _marDivorceBase();
  if (S.marriage.status === 'divorced') {
    const lost = (S.ownedHomes || []).filter(function(h) { return h.isHusbandOwned; });
    if (lost.length) {
      S.ownedHomes = S.ownedHomes.filter(function(h) { return !h.isHusbandOwned; });
      if (!S.ownedHomes.some(function(h) { return h.status === 'occupied'; })) S.housing = 'parents';
      log('🏠 You moved out of the home that was in his name. Your shabka and any property in your name stay yours.');
      render();
    }
  }
};
/* ============================================================
   PATCH 3: fix zero shabka budget / zero engagement review
   ============================================================ */

/* Money values are stored in EGP and converted with marEGP().
   This works out the conversion ratio for the current country. */
function marEgpRatio() {
  return marEGP(1000000) / 1000000 || 1;
}

/* Fill in the missing prices on an engagement (Salonat and older saves) */
function marFixEngagementCosts() {
  const m = S.marriage;
  const e = m && m.engagement;
  if (!e) return;

  /* Shabka */
  if (!e.shabkaCost) {
    if (e.salonatShabka) {
      e.shabkaCost = Math.round(e.salonatShabka * 4500);
    } else {
      const t = (MARRIAGE_SHABKA_TIERS || []).find(function(x) { return x.id === e.shabkaTier; });
      e.shabkaCost = t ? t.costEGP : 0;
    }
  }
  /* Mahr */
  if (!e.mahrCost) {
    if (e.salonatMahr) {
      e.mahrCost = Math.round(e.salonatMahr / marEgpRatio());
    } else {
      const t = (MARRIAGE_MAHR_TIERS || []).find(function(x) { return x.id === e.mahrTier; });
      e.mahrCost = t ? t.costEGP : 0;
    }
  }
  /* Party (the groom's family hosts it in a Salonat match) */
  if (typeof e.partyCost !== 'number') {
    const t = (MARRIAGE_ENGAGEMENT_PARTY_TIERS || []).find(function(x) { return x.id === e.partyTier; });
    e.partyCost = e.salonatShabka ? 0 : (t ? t.costEGP : 0);
  }
}

/* Gold budget for the souk */
function marShabkaBudgetFor(e) {
  if (!e) return 0;
  if (e.salonatShabka) {
    /* Salonat: you were promised this many grams, so budget = grams x gold price */
    return Math.round(e.salonatShabka * marGoldLocalPerGram(21) * 1.2);
  }
  marFixEngagementCosts();
  return marEGP(e.shabkaCost || 0);
}

/* Opening the souk now uses the correct budget */
window.marOpenShabkaPicker = function() {
  const m = S.marriage, e = m.engagement;
  if (!e || !e.finalized) { log('Finalize the engagement first.'); render(); return; }
  if (m.shabkaChosen) { log('You already chose your shabka.'); render(); return; }
  m.shabkaPick = { budget: marShabkaBudgetFor(e), items: [] };
  m.tab = 'plan';
  render();
};
window.marShabkaGoldSoukTrip = function() { marOpenShabkaPicker(); };

/* New Salonat acceptances get correct prices straight away */
var _marAcceptSalonatBase3 = window.marAcceptSalonat;
window.marAcceptSalonat = function() {
  _marAcceptSalonatBase3();
  marFixEngagementCosts();
  render();
};

/* Repairs an ALREADY-open souk and your current save every time the Plan tab draws */
var _marRenderPlanBase3 = marRenderPlan;
marRenderPlan = function() {
  const m = S.marriage;
  if (m && m.engagement && m.engagement.finalized) {
    marFixEngagementCosts();
    if (m.shabkaPick && (!m.shabkaPick.budget || m.shabkaPick.budget <= 0)) {
      m.shabkaPick.budget = marShabkaBudgetFor(m.engagement);
    }
  }
  return _marRenderPlanBase3();
};
