/* ============================================================
   VIEW: MARRIAGE (Fully Integrated & Verified)
   ============================================================
   Owns S.marriage with full state including home, achievements,
   milestones, conflicts, family planning, childcare, and in-laws.
   Directly connected to:
   - 08-data-marriage.js (all tables, events, and dialogue)
   - 09-data-realestate.js / 15-view-realestate.js (marital home)
   - 07-data-shopping.js / 16-view-shopping.js (gehaz, furniture, gold)
   - 14-view-assets.js (housing status and current home)
   ============================================================ */

/* ---------- 0. CULTURAL ALIASES & TRAITS INJECTION ---------- */
(function initMarriageDataPatches() {
  if (typeof MARRIAGE_COUNTRY_MULT !== 'undefined' && !MARRIAGE_COUNTRY_MULT.uk) {
    MARRIAGE_COUNTRY_MULT.uk = MARRIAGE_COUNTRY_MULT.gbr;
  }
  if (typeof MARRIAGE_PARTNER_NAMES !== 'undefined' && !MARRIAGE_PARTNER_NAMES.uk) {
    MARRIAGE_PARTNER_NAMES.uk = MARRIAGE_PARTNER_NAMES.gbr;
  }
  if (typeof MARRIAGE_COUNTRY_PROFILES !== 'undefined' && !MARRIAGE_COUNTRY_PROFILES.uk) {
    MARRIAGE_COUNTRY_PROFILES.uk = MARRIAGE_COUNTRY_PROFILES.gbr;
  }
  if (typeof MARRIAGE_DIVORCE_LAWS !== 'undefined' && !MARRIAGE_DIVORCE_LAWS.uk) {
    MARRIAGE_DIVORCE_LAWS.uk = MARRIAGE_DIVORCE_LAWS.gbr;
  }
  if (typeof MARRIAGE_COUNTRY_DATE_IDEAS !== 'undefined' && !MARRIAGE_COUNTRY_DATE_IDEAS.uk) {
    MARRIAGE_COUNTRY_DATE_IDEAS.uk = MARRIAGE_COUNTRY_DATE_IDEAS.gbr;
  }

  /* Safe alias for currency helper used in Real Estate */
  if (typeof window.toPlayerCurrency === 'function' && typeof window.convertToPlayerCurrency !== 'function') {
    window.convertToPlayerCurrency = window.toPlayerCurrency;
  }

  if (typeof MARRIAGE_PARTNER_TRAITS !== 'undefined') {
    const extra = {
      traditional: { label: 'Traditional', bondPerYear: 0 },
      protector:   { label: 'Protective',  bondPerYear: 2 },
      mamas_boy:   { label: "Mama's boy",  bondPerYear: -1 }
    };
    Object.keys(extra).forEach(id => {
      if (!MARRIAGE_PARTNER_TRAITS[id]) MARRIAGE_PARTNER_TRAITS[id] = extra[id];
    });
  }
})();

/* ---------- 1. CONSTANTS & TEXT MAPPINGS ---------- */
var MAR_EGP_BASE_RATE = 52.7;
var MAR_PROPERTY_TEXT = {
  bride_name: "a home registered in his daughter's name",
  his_name: "a fully prepared home in his name, where his daughter will live with full right of residence",
  none: "no property (they will start in a rented home)"
};
var MAR_FURNISH_TEXT = {
  groom_full: "The groom furnishes and equips the home completely before the wedding.",
  shared: "The groom will furnish the home but may ask his bride to share the cost and choose pieces together."
};

/* ---------- 2. STATE MANAGEMENT ---------- */
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
  if (!S.shopping) S.shopping = { inventory: [], gifts: [] };
  if (!Array.isArray(S.shopping.inventory)) S.shopping.inventory = [];
  if (!Array.isArray(S.shopping.gifts)) S.shopping.gifts = [];

  if (m.status === 'single' || m.status === 'divorced') {
    m.husbandHomeProvided = false;
  }
  if (typeof m.husbandHomeProvided !== 'boolean') m.husbandHomeProvided = false;

  if (!m.gehazPayer) {
    const isTradWoman = (S.gender === 'f' && marIsTraditionalWoman());
    if (isTradWoman) m.gehazPayer = 'groom';
    else if (S.gender === 'm') m.gehazPayer = 'self';
    else m.gehazPayer = 'split';
  }

  if (m.partner && (m.status === 'dating' || m.status === 'engaged')) {
    const p = m.partner;
    if (typeof p.bond !== 'number') p.bond = 45;
    if (typeof p.trust !== 'number') p.trust = Math.max(25, Math.min(75, p.bond - 5));
    if (typeof p.communication !== 'number') p.communication = 40;
    if (typeof p.compatibility !== 'number') p.compatibility = 55;
    if (typeof p.chemistry !== 'number') p.chemistry = 45;
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

  if (S.spouse && m.status === 'single' && m.partner === null) {
    m.status = 'married';
    m.partner = {
      name: S.spouse.name, age: S.spouse.age || S.age,
      gender: S.spouse.gender || (S.gender === 'm' ? 'f' : 'm'),
      bond: S.spouse.bond || 70, traits: ['kind'],
      income: S.spouse.income || 0, source: 'legacy',
      familyApproval: 0.8, metYear: gameYear(), marriedYear: gameYear(),
      chemistry: 60
    };
    m.financeModel = 'male_provider';
    m.prenup = null;
  }
}
GameHooks.on('newGame', ensureMarriageState);
GameHooks.on('migrate', ensureMarriageState);

/* ---------- 3. FINANCIAL & REAL-WORLD HELPERS ---------- */
function marRate() { return C().rate || 1; }
function marEgpRatio() { return marEGP(1000000) / 1000000 || 1; }

function marEGP(amountEGP) {
  const localRate = C().rate || 1;
  const countryMult = (typeof MARRIAGE_COUNTRY_MULT !== 'undefined' && MARRIAGE_COUNTRY_MULT[S.country]) || 1.0;
  const adjustedEGP = amountEGP * countryMult;
  if (localRate === MAR_EGP_BASE_RATE && countryMult === 1.0) return Math.round(adjustedEGP || 0);
  return Math.round((adjustedEGP || 0) * (localRate / MAR_EGP_BASE_RATE));
}

function marGoldLocalPerGram(karat) {
  const m = ((typeof SHOP_MULT !== 'undefined' && SHOP_MULT[S.country]) || (SHOP_MULT && SHOP_MULT.egy) || {}).luxury || 1;
  const baseUsdPerGram = (typeof SHOP_GOLD_USD_PER_GRAM !== 'undefined') ? SHOP_GOLD_USD_PER_GRAM : 75;
  return Math.round(baseUsdPerGram * (karat / 24) * m * marRate());
}

function marNamePool(gender) {
  const pool = (typeof MARRIAGE_PARTNER_NAMES !== 'undefined' && MARRIAGE_PARTNER_NAMES[S.country]) || (MARRIAGE_PARTNER_NAMES && MARRIAGE_PARTNER_NAMES.egy) || { m: ['Omar'], f: ['Sarah'] };
  return gender === 'm' ? pool.m : pool.f;
}

function marTrait(id) { return (typeof MARRIAGE_PARTNER_TRAITS !== 'undefined' && MARRIAGE_PARTNER_TRAITS[id]) || null; }
function marBondColor(v) { return v > 70 ? '#34d399' : v > 40 ? '#fbbf24' : '#fb7185'; }
function marCountryProfile() { return (typeof MARRIAGE_COUNTRY_PROFILES !== 'undefined' && MARRIAGE_COUNTRY_PROFILES[S.country]) || null; }
function marIsTraditionalWoman() { return S.gender === 'f' && !!(marCountryProfile() && marCountryProfile().traditionalGenderRoles); }
function marClamp(value, min, max) { const n = Number(value); return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min)); }
function marHasTrait(partner, traitId) { return !!(partner && Array.isArray(partner.traits) && partner.traits.includes(traitId)); }

function marFinanceLabel() {
  const list = (typeof MARRIAGE_FINANCE_MODELS !== 'undefined') ? MARRIAGE_FINANCE_MODELS : [];
  const fm = list.find(x => x.id === S.marriage.financeModel);
  return fm ? fm.label : 'Not set';
}

function marMaritalHome() {
  if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];
  return S.ownedHomes.find(x => x.status === 'occupied') || S.ownedHomes[0] || null;
}

function marMissingGehaz(home) {
  if (!home || typeof MARRIAGE_GEHAZ_CHECKLIST === 'undefined') return [];
  const inv = (S.shopping && S.shopping.inventory) || [];
  return MARRIAGE_GEHAZ_CHECKLIST.filter(item => {
    return !inv.some(i => i.homeId === home.id && i.cat === item.cat && (!item.subcat || i.subcat === item.subcat));
  });
}

function marRollTraits() {
  const positive = ['kind', 'funny', 'romantic', 'calm', 'ambitious', 'religious', 'generous', 'loyal', 'independent', 'family_oriented', 'patient', 'supportive', 'communicative', 'adventurous', 'homebody', 'mature', 'frugal', 'career_focused', 'shy', 'outgoing', 'private', 'sentimental', 'financially_cautious', 'confident', 'traditional', 'protector'];
  const negative = ['grumpy', 'moody', 'pessimistic', 'greedy', 'jealous', 'impulsive', 'extravagant', 'avoidant', 'stubborn', 'insecure', 'stingy'];
  if (S.gender !== 'm') negative.push('mamas_boy');
  const prof = marCountryProfile();
  if (prof && prof.traditionalGenderRoles === true) positive.push('traditional', 'traditional', 'family_oriented', 'religious');

  const clashes = [
    ['frugal', 'extravagant'], ['shy', 'outgoing'], ['homebody', 'adventurous'], ['calm', 'moody'],
    ['kind', 'grumpy'], ['generous', 'greedy'], ['generous', 'stingy'], ['patient', 'impulsive'],
    ['communicative', 'avoidant'], ['confident', 'insecure'], ['independent', 'mamas_boy'],
    ['mature', 'impulsive'], ['private', 'outgoing'], ['optimistic', 'pessimistic'],
    ['loyal', 'jealous'], ['financially_cautious', 'extravagant']
  ];
  const traits = [];
  function allowed(t) {
    if (traits.includes(t)) return false;
    return !clashes.some(c => (c[0] === t && traits.includes(c[1])) || (c[1] === t && traits.includes(c[0])));
  }
  function draw(list, count) {
    let added = 0, tries = 0;
    while (added < count && tries < 40) {
      tries++;
      const t = list[Math.floor(Math.random() * list.length)];
      if (allowed(t)) { traits.push(t); added++; }
    }
  }
  draw(positive, 1 + Math.floor(Math.random() * 2));
  draw(negative, Math.floor(Math.random() * 3));
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
  if (prof) a = 0.7 + (a - 0.7) * (0.6 + prof.familyInfluence);
  return marClamp(a, 0.1, 1.0);
}

function marCreatePartnerPreferences(traits) {
  traits = Array.isArray(traits) ? traits : [];
  let preferredActivity = 'cafe';
  if (traits.includes('homebody')) preferredActivity = 'home_cooked_dinner';
  else if (traits.includes('adventurous')) preferredActivity = 'weekend';
  else if (traits.includes('family_oriented') || traits.includes('traditional')) preferredActivity = 'family_visit';
  else if (traits.includes('romantic') || traits.includes('sentimental')) preferredActivity = 'gift';
  else if (traits.includes('outgoing')) preferredActivity = 'restaurant';
  else if (traits.includes('frugal') || traits.includes('financially_cautious')) preferredActivity = 'walk';

  let proposalStyle = 'personal';
  if (traits.includes('shy') || traits.includes('private') || traits.includes('homebody')) proposalStyle = 'simple';
  else if (traits.includes('traditional') || traits.includes('family_oriented')) proposalStyle = 'family';
  else if (traits.includes('adventurous')) proposalStyle = 'trip';
  else if (traits.includes('outgoing')) proposalStyle = 'restaurant';
  else if (traits.includes('romantic') || traits.includes('sentimental')) proposalStyle = 'personal';

  let weddingStyle = 'local_hall';
  let guestPreference = 'medium';
  if (traits.includes('frugal') || traits.includes('financially_cautious') || traits.includes('private')) {
    weddingStyle = 'family_home'; guestPreference = 'small';
  } else if (traits.includes('traditional') || traits.includes('family_oriented')) {
    weddingStyle = 'traditional'; guestPreference = 'large';
  } else if (traits.includes('extravagant') || traits.includes('outgoing')) {
    weddingStyle = 'hotel_4star'; guestPreference = 'large';
  } else if (traits.includes('adventurous')) {
    weddingStyle = 'garden'; guestPreference = 'medium';
  }

  return {
    preferredActivity, proposalStyle, weddingVenue: weddingStyle, guestCount: guestPreference,
    pace: (traits.includes('patient') || traits.includes('independent') || traits.includes('shy')) ? 'slow' : 'steady',
    privateRomanticMoments: traits.includes('private') || traits.includes('shy')
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
  if (S.marriage.premaritalHistory.length > 60) S.marriage.premaritalHistory.shift();
  if (p && (S.marriage.status === 'dating' || S.marriage.status === 'engaged')) {
    if (!Array.isArray(p.memories)) p.memories = [];
    p.memories.push(entry);
    if (p.memories.length > 40) p.memories.shift();
  }
}

function marEnsureChem(p) {
  if (!p) return 0;
  if (typeof p.chemistry !== 'number') {
    p.chemistry = marClamp(30 + Math.round((p.compatibility || 50) * 0.3) + Math.floor(Math.random() * 15), 0, 100);
  }
  return p.chemistry;
}
function marBumpChem(p, n) { if (p) p.chemistry = marClamp(marEnsureChem(p) + n, 0, 100); }

function marPremaritalReadiness(partner) {
  const p = partner || (S && S.marriage && S.marriage.partner);
  if (!p) return { score: 0, ready: false, reasons: ['Meet a partner first.'] };
  const bond = marClamp(p.bond, 0, 100);
  const trust = marClamp(p.trust, 0, 100);
  const communication = marClamp(p.communication, 0, 100);
  const compatibility = marClamp(p.compatibility, 0, 100);
  const chem = marEnsureChem(p);
  const commitmentTalks = Number(p.commitmentTalks || 0);

  let score = Math.round(bond * 0.28 + trust * 0.28 + communication * 0.12 + compatibility * 0.16 + chem * 0.10 + Math.min(6, commitmentTalks * 6));
  const reasons = [];
  if (!p.exclusive) reasons.push('Discuss becoming an exclusive couple first.');
  if (bond < 55) reasons.push('Build a stronger bond (55% or higher).');
  if (trust < 50) reasons.push('Build more trust (50% or higher).');
  if (chem < 35) reasons.push('The chemistry is not there yet. Spend more quality time together.');
  if (commitmentTalks < 1) reasons.push('Have an honest conversation about marriage readiness.');
  return { score: marClamp(score, 0, 100), ready: reasons.length === 0, reasons };
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
  if (payer === 'partner_family') return marIsTraditionalWoman() ? 0.15 : 0.25;
  if (payer === 'own_family') return 0.50;
  return 1;
}

function marGetWeddingSelection(wedding) {
  const w = wedding || {};
  const pick = (items, id, fallback) => (items || []).find(x => x.id === id) || (items || []).find(x => x.id === fallback) || (items || [])[0] || { id: id || fallback || 'none', costEGP: 0 };
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
    venue, guests, catering, photo, dress, decor, music, honeymoon, planner, prenup,
    baseTotalEGP: baseTotal, share, eventCostLocal, prenupCostLocal,
    playerTotalLocal: eventCostLocal + prenupCostLocal,
    fullTotalLocal: marEGP(baseTotal + Number(prenup.legalCostEGP || 0))
  };
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

/* ---------- 4. JEWELRY & SHABKA HELPERS ---------- */
function marGiveJewelry(it, paidBy, priceLocal) {
  if (typeof ensureShoppingState === 'function') ensureShoppingState();
  if (!S.shopping) S.shopping = { inventory: [], gifts: [] };
  const price = priceLocal || it.priceLocal;
  S.shopping.inventory.push({
    uid: 'i' + (S.uidN++), itemId: it.id, brand: it.brand, name: it.name,
    cat: 'jewelry', subcat: it.subcat, priceUSD: it.priceUSD || 0,
    purchasePrice: price, currentValue: Math.round(price * 0.9),
    purchaseYear: gameYear(), age: 0, life: 9999,
    happiness: it.happiness || 5, social: it.social || 5,
    grams: it.grams, karat: it.karat,
    broken: false, condition: 100, warrantyUntil: 0,
    homeId: null, homeName: null, paidBy: paidBy || 'self'
  });
}

function _marShabkaCatalog() {
  if (typeof shopBuildCatalog === 'function') {
    return shopBuildCatalog('jewelry').filter(i => (i.cat === 'jewelry' || i.cat === 'luxury') && i.grams > 0);
  }
  return [];
}

function marPlayerShare(e) {
  const payer = (e && e.payer) || 'self';
  return payer === 'partner' ? 0 : payer === 'split' ? 0.5 : 1;
}

function marFixEngagementCosts() {
  const m = S.marriage;
  const e = m && m.engagement;
  if (!e) return;
  if (!e.shabkaCost) {
    if (e.salonatShabka) {
      e.shabkaCost = Math.round(e.salonatShabka * 4500);
    } else {
      const t = (MARRIAGE_SHABKA_TIERS || []).find(x => x.id === e.shabkaTier);
      e.shabkaCost = t ? t.costEGP : 0;
    }
  }
  if (!e.mahrCost) {
    if (e.salonatMahr) {
      e.mahrCost = Math.round(e.salonatMahr / marEgpRatio());
    } else {
      const t = (MARRIAGE_MAHR_TIERS || []).find(x => x.id === e.mahrTier);
      e.mahrCost = t ? t.costEGP : 0;
    }
  }
  if (typeof e.partyCost !== 'number') {
    const t = (MARRIAGE_ENGAGEMENT_PARTY_TIERS || []).find(x => x.id === e.partyTier);
    e.partyCost = e.salonatShabka ? 0 : (t ? t.costEGP : 0);
  }
}

function marShabkaBudgetFor(e) {
  if (!e) return 0;
  if (e.salonatShabka) {
    return Math.round(e.salonatShabka * marGoldLocalPerGram(21) * 1.2);
  }
  marFixEngagementCosts();
  return marEGP(e.shabkaCost || 0);
}

/* ---------- 5. FATHER NEGOTIATIONS & DEALS ---------- */
function marTierByFrac(arr, f) {
  const s = arr.slice().sort((a, b) => a.costEGP - b.costEGP);
  return s[Math.min(s.length - 1, Math.max(0, Math.round(f * (s.length - 1))))];
}
function marTierStep(arr, tier, step) {
  const s = arr.slice().sort((a, b) => a.costEGP - b.costEGP);
  const i = s.findIndex(x => x.id === tier.id);
  return s[Math.min(s.length - 1, Math.max(0, i + step))];
}

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

  const generous = traits.includes('generous') || traits.includes('traditional') || traits.includes('family_oriented');
  const furnishing = (lvl === 'rich' || lvl === 'comfortable' || (generous && lvl !== 'modest')) ? 'groom_full' : 'shared';
  return {
    level: lvl,
    shabka: marTierByFrac(MARRIAGE_SHABKA_TIERS, f),
    mahr: marTierByFrac(MARRIAGE_MAHR_TIERS, f),
    property, furnishing
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

/* ---------- 6. GEHAZ & FURNISHING HELPERS ---------- */
function marAddGehazItem(home, item, payer) {
  if (typeof SHOP_ALL === 'undefined') return 0;
  const pool = SHOP_ALL.filter(r => r[2] === item.cat && (!item.subcat || r[3] === item.subcat));
  if (!pool.length) return 0;
  const r = pool[Math.floor(pool.length / 2)];
  const mult = SHOP_MULT[S.country] ? (SHOP_MULT[S.country][item.cat] || 1) : 1;
  const price = Math.round(r[4] * mult * marRate());
  if (!S.shopping) S.shopping = { inventory: [] };
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
  if (typeof ensureShoppingState === 'function') ensureShoppingState();
  const missing = marMissingGehaz(home);
  if (!missing.length) return;
  if (m.gehazModel === 'groom_full') {
    missing.forEach(it => marAddGehazItem(home, it, 'husband'));
    p.bond = Math.min(100, p.bond + 8); marBumpChem(p, 5);
    log('🛋 ' + p.name + ' and his family furnished and equipped the whole home before the wedding (' + missing.length + ' items).');
  } else {
    const half = Math.ceil(missing.length / 2);
    missing.slice(0, half).forEach(it => marAddGehazItem(home, it, 'husband'));
    m.gehazPayer = 'split';
    log('🛋 ' + p.name + ' furnished ' + half + ' items. You will split the rest of the furnishings.');
    marBumpChem(p, 3);
  }
}

/* ---------- 7. ENGAGEMENT PARTY HELPERS ---------- */
function marPartyTier(id) {
  return (MARRIAGE_ENGAGEMENT_PARTY_TIERS || []).find(x => x.id === id) || null;
}
function marPartyIsPaid(e) {
  if (!e) return false;
  if (e.partyPaid === true) return true;
  return (e.partyPaid === undefined && !e.salonatShabka);
}
function marPartyShare(e) {
  const who = e.partyPayer || (marIsTraditionalWoman() ? 'other' : 'self');
  if (who === 'self') return 1;
  if (who === 'split') return 0.5;
  return marIsTraditionalWoman() ? 0 : 0.25;
}

function marPartyEvent(p) {
  const list = (typeof MARRIAGE_ENGAGEMENT_EVENTS !== 'undefined') ? MARRIAGE_ENGAGEMENT_EVENTS : [];
  if (!list.length || S.pending || Math.random() > 0.65) return;
  let r = Math.random() * list.reduce((s, x) => s + x.weight, 0), ev = list[0];
  for (let i = 0; i < list.length; i++) { r -= list[i].weight; if (r <= 0) { ev = list[i]; break; } }
  const m = S.marriage;
  const fee = marEGP(15000);
  const sets = {
    family_disagreement: [
      ['🕊 Calm both sides', () => { m.motherInLawBond = marClamp(m.motherInLawBond + 5, 0, 100); log('🕊 You calmed both families. They respect your maturity.'); }],
      ['🙊 Stay out of it', () => { m.motherInLawBond = marClamp(m.motherInLawBond - 6, 0, 100); log('The argument faded, but feelings were hurt.'); }]
    ],
    budget_overrun: [
      ['💸 Cover the extras (' + money(fee) + ')', () => {
        if (S.wealth >= fee) { S.wealth -= fee; p.bond = marClamp(p.bond + 3, 0, 100); log('💸 You paid the extras. Everyone enjoyed the evening.'); }
        else log('❌ You could not afford the extras and the evening felt tight.');
      }],
      ['✂️ Cut the extras', () => { fx({ happiness: -3 }); log('You trimmed the extras. A few guests noticed.'); }]
    ],
    partner_nervous: [
      ['💬 Reassure ' + p.name, () => { p.trust = marClamp(p.trust + 4, 0, 100); marBumpChem(p, 3); log('💬 You talked it through. ' + p.name + ' felt much calmer.'); }],
      ['😅 Make a joke of it', () => { marBumpChem(p, marHasTrait(p, 'funny') ? 3 : -1); log('😅 The joke landed ' + (marHasTrait(p, 'funny') ? 'well.' : 'a little flat.')); }]
    ],
    guest_list_dispute: [
      ['➕ Invite the extra relatives', () => { m.motherInLawBond = marClamp(m.motherInLawBond + 6, 0, 100); fx({ social: 3 }); log('➕ The relatives were delighted to be included.'); }],
      ['✋ Keep the list small', () => { m.motherInLawBond = marClamp(m.motherInLawBond - 4, 0, 100); p.trust = marClamp(p.trust + 2, 0, 100); log('✋ You stood by your plan. Some relatives sulked.'); }]
    ]
  };
  if (sets[ev.id]) {
    S.pending = {
      title: '📖 ' + ev.title, text: ev.text,
      choices: sets[ev.id].map(c => ({ label: c[0], effect: c[1] }))
    };
    S.evId = 'party_event_' + ev.id + '_' + gameYear();
  } else {
    log('📖 ' + ev.title + ': ' + ev.text);
  }
}

/* ============================================================
   MAIN VIEW ROUTER
   ============================================================ */
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
    tabs.map(t => '<button class="pill ' + (m.tab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="marSetTab(\'' + t[0] + '\')">' + t[1] + '</button>').join('') +
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
   SUB-TAB RENDERING
   ============================================================ */

/* ---------- 1. OVERVIEW ---------- */
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
  const traitsList = (p.traits || []).map(t => { const tt = marTrait(t); return tt ? tt.label : t; });
  const approval = marFamilyApproval(p);

  html += '<div class="card"><h3>Partner</h3>' +
    '<div style="font-weight:700;font-size:1.1rem">' + p.name + '</div>' +
    '<div class="muted small">Age ' + p.age + ' · Met via ' + p.source + (p.metYear ? ' · ' + p.metYear : '') + '</div>' +
    '<div class="muted small" style="color:#8b5cf6;margin-top:4px">' + traitsList.join(' · ') + '</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin-top:10px"><span>Bond</span><span>' + bond + '%</span></div>' +
    '<div style="height:5px;background:#1a1a2a;border-radius:3px;margin-top:3px"><div style="height:100%;width:' + bond + '%;background:' + marBondColor(bond) + ';border-radius:3px"></div></div>' +
    (m.status !== 'married' ? '<div class="row" style="margin-top:8px"><span>Family approval</span><b class="' + (approval >= 0.7 ? 'good' : approval >= 0.4 ? '' : 'bad') + '">' + Math.round(approval * 100) + '%</b></div>' : '') +
        (p.career ? (
      '<div class="row"><span>Career</span><b>' + (p.career.title || 'Homemaker') + '</b></div>' +
      (p.career.company ? '<div class="row"><span>Employer</span><b>' + p.career.company + '</b></div>' : '') +
      '<div class="row"><span>Working status</span><b class="' + (p.career.working === true ? 'good' : p.career.working === 'part-time' ? '' : 'muted') + '">' +
        (p.career.working === true ? 'Full-time' : p.career.working === 'part-time' ? 'Part-time' : 'Not working') + '</b></div>' +
      (p.income > 0 ? '<div class="row"><span>Personal income</span><b class="good">' + money(p.income) + '/yr</b></div>' : '')
    ) : (p.income > 0 ? '<div class="row"><span>Income</span><b>' + money(p.income) + '/yr</b></div>' : '')) +
    '</div>';

  if (m.status === 'dating' || m.status === 'engaged') {
    html += marRenderPremaritalPanel();
  }

  if (typeof MARRIAGE_RELATIONSHIP_ACTIVITIES !== 'undefined' && m.status !== 'engaged') {
    html += '<div class="card"><h3>💞 Spend Time Together</h3>';
    if (prof && prof.activities) {
      html += '<p class="muted small" style="margin-bottom:8px">In ' + prof.label + ': ' + prof.activities.slice(0, 3).join(' · ') + '</p>';
    }
    (m.status === 'dating' ? MARRIAGE_RELATIONSHIP_ACTIVITIES : MARRIAGE_RELATIONSHIP_ACTIVITIES.slice(0, 8)).forEach(act => {
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
  const chem = marEnsureChem(p);
  const chemCol = chem > 70 ? '#34d399' : chem > 40 ? '#fbbf24' : '#fb7185';
  const chemLabel = chem > 80 ? 'Inseparable' : chem > 60 ? 'Strong spark' : chem > 40 ? 'Warming up' : 'Awkward';

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
    '<p class="muted small" style="margin-top:8px">Trust and readiness grow through honest conversations and respecting each other\'s boundaries.</p>';

  if (m.status === 'engaged') {
    const hamaColor = m.motherInLawBond > 70 ? '#34d399' : m.motherInLawBond > 40 ? '#fbbf24' : '#fb7185';
    html += '<div class="card" style="border-color:' + hamaColor + ';margin-top:8px">' +
      '<h3 style="color:' + hamaColor + '">👵 Mother-in-Law</h3>' +
      '<div class="row"><span>Bond</span><b style="color:' + hamaColor + '">' + m.motherInLawBond + '%</b></div>' +
      '<p class="muted small">Your relationship with his mother matters. A low bond will cause drama during the wedding.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="marVisitMotherInLaw()">☕ Visit her for tea · ' + money(marEGP(1500)) + '</button>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="marCheckTrousseau()">🛋 Check Trousseau Status</button>' +
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
      html += '<div class="muted small" style="margin-top:8px"><b>Before proposing:</b><ul style="margin:4px 0 0 18px">' + readiness.reasons.map(r => '<li>' + r + '</li>').join('') + '</ul></div>';
    }
  }
  html += '</div>';

  html += '<div class="card"><div style="display:flex;justify-content:space-between;font-size:.8rem"><b>✨ Chemistry</b><b style="color:' + chemCol + '">' + chem + '% · ' + chemLabel + '</b></div>' +
    '<div style="height:5px;background:#1a1a2a;border-radius:3px;margin-top:4px"><div style="height:100%;width:' + chem + '%;background:' + chemCol + ';border-radius:3px"></div></div>' +
    '<p class="muted small" style="margin-top:6px">Grows with shared activities, honest talks, and thoughtful gifts.</p></div>';

  html += '<div class="card"><h3>💬 Get to Know ' + p.name + '</h3><p class="muted small">Choose a topic to discuss.</p>';
  (MARRIAGE_PREMARITAL_CONVERSATIONS || []).forEach(topic => {
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

/* ---------- 2. FIND ---------- */
function marRenderFind() {
  const m = S.marriage;
  if (m.status !== 'single' && m.status !== 'divorced') {
    return '<div class="card"><h3>💕 Find a Partner</h3><p class="muted small">You are currently ' + m.status + '.</p></div>';
  }

  let html = '';
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
    '<p class="muted small">Ask your parents to arrange a Salonat suitor with clear background and financials.</p>' +
    '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700;font-size:.78rem" onclick="marStartSalonat()">🤝 Request a Salonat' + (marIsTraditionalWoman() ? ' (Free)' : ' (' + money(marEGP(2000)) + ')') + '</button>' +
    '</div>';

  html += '<div class="card"><h3>💕 Other Ways to Meet Someone</h3>' +
    '<p class="muted small">Different sources have different success rates and family approval.</p></div>';

  if (typeof MARRIAGE_DATING_SOURCES !== 'undefined') {
    MARRIAGE_DATING_SOURCES.forEach(src => {
      const blockAge = S.age < src.minAge || S.age > src.maxAge;
      const blockEdu = src.requiresEducation && !S.uni && !S.degree;
      const blockJob = src.requiresJob && !S.job;
      const blocked = blockAge || blockEdu || blockJob;
      const cost = marEGP(src.cost);
      let reason = blockAge ? 'Age ' + src.minAge + '-' + src.maxAge + ' only' : blockEdu ? 'Needs education' : blockJob ? 'Needs a job' : '';

      html += '<div class="card" style="padding:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="flex:1"><div style="font-weight:700">' + src.label + '</div>' +
        '<div class="muted small">' + src.desc + '</div>' +
        '<div class="muted small">Match ' + Math.round(src.matchChance * 100) + '% · Family ' + Math.round(src.familyApproval * 100) + '%</div></div>' +
        '<div style="text-align:right;flex-shrink:0;margin-left:8px"><b>' + money(cost) + '</b></div></div>' +
        (blocked ? '<div class="bad small" style="margin-top:6px">' + reason + '</div>' :
          '<button class="opt" style="margin-top:6px;text-align:center;font-size:.75rem;background:#fb7185;color:#fff;font-weight:700" onclick="marTryDate(\'' + src.id + '\')">Meet someone · ' + money(cost) + '</button>') +
        '</div>';
    });
  }
  return html;
}

/* ---------- 3. PLAN ---------- */
function marRenderPlan() {
  const m = S.marriage;
  if (m.status === 'single') return '<div class="card"><h3>💍 Planning</h3><p class="muted small">Find a partner first.</p></div>';
  if (m.status === 'married') return '<div class="card"><h3>💍 Planning</h3><p class="muted small">You are already married. See the Married Life tab.</p></div>';

  const p = m.partner;
  if (!p) return '';
  const isTraditionalWoman = marIsTraditionalWoman();
  let html = '';

  /* Step: Shabka picker if engaged and finalized but not chosen yet */
  if (m.status === 'engaged' && m.engagement && m.engagement.finalized) {
    marFixEngagementCosts();
    if (!m.shabkaChosen) {
      if (m.shabkaPick && (!m.shabkaPick.budget || m.shabkaPick.budget <= 0)) {
        m.shabkaPick.budget = marShabkaBudgetFor(m.engagement);
      }
      return marRenderShabkaPicker();
    }
    if (!m.engagement.partyHeld) {
      return marRenderPartyCard();
    }
  }

  /* Traditional Ask button for male / non-traditional players */
  if (!isTraditionalWoman && m.status === 'dating' && p.bond >= 60) {
    html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">👨‍👩‍👧 Traditional Ask</h3>' +
      '<p class="muted small">Go to her father with gifts to formally ask for her hand and agree on conditions.</p>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700;font-size:.75rem" onclick="marAskForHand()">🤝 Visit Father to Ask for Hand (' + money(marEGP(5000)) + ')</button>' +
      '</div>';
  }

  /* Partner's pending proposal */
  if (m.status === 'dating' && p.pendingPartnerProposal) {
    html += '<div class="card" style="border-color:#fbbf24"><h3>💍 ' + p.name + ' Wants to Ask You Something</h3>' +
      '<p class="muted small">After reflecting on your time together, ' + p.name + ' wants to formalize the engagement.</p>' +
      '<button class="opt" style="width:100%;margin-top:5px;text-align:center;background:#34d399;color:#000;font-weight:700" onclick="marRespondToPartnerProposal(\'accept\')">💍 Accept the proposal</button>' +
      '<button class="opt" style="width:100%;margin-top:5px;text-align:center" onclick="marRespondToPartnerProposal(\'time\')">Ask for more time</button>' +
      '<button class="opt" style="width:100%;margin-top:5px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="marRespondToPartnerProposal(\'decline\')">Decline respectfully</button></div>';
  }

  /* Dating proposals */
  if (m.status === 'dating' && !p.pendingPartnerProposal) {
    const readiness = marPremaritalReadiness(p);
    if (isTraditionalWoman) {
      html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">💍 Waiting for the Proposal</h3>' +
        '<p class="muted small">In your culture, the groom approaches your father. Keep cultivating chemistry and trust.</p>' +
        '<div class="row"><span>Relationship readiness</span><b>' + readiness.score + '%</b></div>';
      if (!readiness.ready) {
        html += '<div class="muted small" style="margin-top:8px"><b>What he is waiting for:</b><ul style="margin:4px 0 0 18px">' +
          readiness.reasons.map(r => '<li>' + r + '</li>').join('') + '</ul></div>';
      } else {
        html += '<p class="good small" style="margin-top:8px">The relationship feels ready. Hint at your hopes to encourage him.</p>' +
          '<button class="opt" style="margin-top:10px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="marHintAtProposal()">💬 Hint at Marriage</button>';
      }
      html += '</div>';
    } else {
      html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">💍 Proposal</h3>';
      if (!m.engagement || !m.engagement.proposal) {
        if (!readiness.ready) {
          html += '<p class="muted small">Your partner needs to feel that the relationship is ready.</p>' +
            '<div class="row"><span>Current readiness</span><b>' + readiness.score + '%</b></div>' +
            '<ul class="muted small" style="margin:6px 0 0 18px">' + readiness.reasons.map(r => '<li>' + r + '</li>').join('') + '</ul>';
        } else {
          html += '<p class="muted small">Choose a proposal style that reflects your partner\'s personality.</p>';
          if (typeof MARRIAGE_PROPOSAL_OPTIONS !== 'undefined') {
            MARRIAGE_PROPOSAL_OPTIONS.forEach(opt => {
              const fit = marProposalStyleFit(p, opt);
              html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSelectProposal(\'' + opt.id + '\')">' +
                '<div style="display:flex;justify-content:space-between"><b>' + opt.label + '</b><span>' + money(marEGP(opt.costEGP)) + '</span></div>' +
                '<div class="muted small">Romance +' + opt.romance + ' · ' + opt.desc + (fit > 5 ? ' · Fits partner preferences' : '') + '</div></button>';
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
        '<p class="muted small">Engagement finalized. Proceed to plan the wedding celebrations.</p>' +
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
  const prop = (MARRIAGE_PROPOSAL_OPTIONS || []).find(x => x.id === e.proposal);
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

  if (isTraditionalWoman && !e.mahrNegotiationTriggered && e.mahrTier && (e.mahrAdvancedPct || 0.5) > 0.3) {
    e.mahrNegotiationTriggered = true;
    S.pending = {
      title: '💬 Mahr Negotiation',
      text: 'Before finalizing the Mahr, ' + (m.partner.name) + '’s mother pulls you aside.\n\n"Habibti, we are all family now. Perhaps we can lower the upfront Mahr slightly? ' + m.partner.name + ' doesn\'t need to know."',
      choices: [
        { label: '💪 Hold firm on the agreed Mahr', effect: (s) => {
            s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 15);
            s.marriage.partner.bond = Math.min(100, s.marriage.partner.bond + 5);
            log('💪 You held firm. His mother is unhappy, but ' + s.marriage.partner.name + ' respects you for standing your ground.');
            fx({ happiness: 3 });
          }
        },
        { label: '🤝 Compromise — lower it 20%', effect: (s) => {
            s.marriage.engagement.mahrAdvancedPct = 0.4;
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 10);
            log('🤝 You compromised. His mother is pleased.');
          }
        },
        { label: '😔 Lower it substantially', effect: (s) => {
            s.marriage.engagement.mahrAdvancedPct = 0.2;
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 20);
            s.marriage.partner.bond = Math.max(0, s.marriage.partner.bond - 5);
            log('😔 You lowered the upfront Mahr substantially.');
            fx({ happiness: -3 });
          }
        }
      ]
    };
    S.evId = 'mahr_negotiation_' + gameYear();
    render();
    return '';
  }

  if (typeof e.payer === 'undefined') {
    e.payer = isTraditionalWoman ? 'partner' : 'self';
  }

  function picker(label, items, key, selectedId, costFn) {
    const isLocked = e.fatherTerms && (key === 'shabkaTier' || key === 'mahrTier');
    return '<h4 style="font-size:.8rem;color:#fbbf24;margin-top:10px">' + label + (isLocked ? ' <span class="muted small">(Agreed with Father)</span>' : '') + '</h4>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' +
      items.map(item => {
        const cost = costFn ? costFn(item) : '';
        return '<button class="pill ' + (selectedId === item.id ? 'on' : '') + '" style="padding:6px;font-size:.68rem" ' + (isLocked ? 'disabled' : '') + ' onclick="marEngagementSet(\'' + key + '\',\'' + item.id + '\')">' +
          item.label + (cost ? '<br><span class="muted" style="font-size:.62rem">' + cost + '</span>' : '') + '</button>';
      }).join('') + '</div>';
  }

  const shabka = (MARRIAGE_SHABKA_TIERS || []).find(x => x.id === e.shabkaTier) || MARRIAGE_SHABKA_TIERS[0];
  const mahr = (MARRIAGE_MAHR_TIERS || []).find(x => x.id === e.mahrTier) || MARRIAGE_MAHR_TIERS[0];
  const party = (MARRIAGE_ENGAGEMENT_PARTY_TIERS || []).find(x => x.id === e.partyTier) || MARRIAGE_ENGAGEMENT_PARTY_TIERS[0];

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
  html += '<div style="margin-top:10px; padding:10px; background:#0f0f1a; border-radius:6px">' +
    '<b class="small" style="color:#fbbf24">Mahr Structure</b>' +
    '<div class="row small"><span>Muqaddam (Advanced)</span><b>' + money(marEGP(mahrAdv)) + '</b></div>' +
    '<div class="row small"><span>Mu\'akhar (Deferred)</span><b>' + money(marEGP(mahrDef)) + '</b></div>' +
    '<div style="display:flex;gap:4px;margin-top:6px">' +
    '<button class="pill ' + (advancedPct === 1 ? 'on' : '') + '" style="flex:1;font-size:.65rem" onclick="marSetMahrSplit(1)">100% Upfront</button>' +
    '<button class="pill ' + (advancedPct === 0.5 ? 'on' : '') + '" style="flex:1;font-size:.65rem" onclick="marSetMahrSplit(0.5)">50/50 Split</button>' +
    '<button class="pill ' + (advancedPct === 0.1 ? 'on' : '') + '" style="flex:1;font-size:.65rem" onclick="marSetMahrSplit(0.1)">10% Upfront</button>' +
    '</div></div>';

  html += picker('Shabka (bride\'s gold)', MARRIAGE_SHABKA_TIERS, 'shabkaTier', e.shabkaTier, t => money(marEGP(t.costEGP)));
  html += picker('Mahr (deferred dowry)', MARRIAGE_MAHR_TIERS, 'mahrTier', e.mahrTier, t => money(marEGP(t.costEGP)));
  html += picker('Engagement party', MARRIAGE_ENGAGEMENT_PARTY_TIERS, 'partyTier', e.partyTier, t => money(marEGP(t.costEGP)));

  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Who pays for the engagement?</h4>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">';
  html += '<button class="pill ' + (e.payer === 'self' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'self\')">You pay all</button>';
  html += '<button class="pill ' + (e.payer === 'partner' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'partner\')">Partner pays</button>';
  html += '<button class="pill ' + (e.payer === 'split' ? 'on' : '') + '" style="padding:6px;font-size:.7rem" onclick="marEngagementSet(\'payer\',\'split\')">Split 50/50</button>';
  html += '</div>';

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

function marRenderGehazCard() {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (!p) return '';
  const home = marMaritalHome();
  let html = '<div class="card" style="border-color:#22d3ee;margin-top:10px"><h4 style="color:#22d3ee">🛋 Gehaz (Trousseau & Furniture)</h4>';
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
    const note = m.gehazModel === 'shared'
      ? '💡 He furnishes part of the home and asked for your help with the rest. Costs are shared.'
      : '💡 The groom and his family furnish the home completely before the wedding.';
    html += '<p class="muted small" style="margin-top:4px">' + note + '</p>';
  } else {
    const opts = S.gender === 'm'
      ? [['self', 'You pay'], ['groom_family', 'Your family'], ['split', 'Split']]
      : [['partner', 'Partner pays'], ['split', 'Split 50/50']];
    html += '<div style="display:flex;gap:4px;margin-top:4px">';
    opts.forEach(o => {
      html += '<button class="pill ' + (m.gehazPayer === o[0] ? 'on' : '') + '" style="flex:1;font-size:.65rem;padding:4px" onclick="marSetGehazPayer(\'' + o[0] + '\')">' + o[1] + '</button>';
    });
    html += '</div>';
  }
  html += '</div>';

  if (m.status === 'engaged') {
    html += '<button class="opt" style="margin-bottom:8px;width:100%;text-align:center;background:#8b5cf6;color:#fff;font-weight:700;font-size:.75rem;padding:8px" onclick="marDiscussGehaz()">💬 Discuss Gehaz with ' + p.name + '</button>';
  }

  const missing = marMissingGehaz(home);
  const total = (typeof MARRIAGE_GEHAZ_CHECKLIST !== 'undefined') ? MARRIAGE_GEHAZ_CHECKLIST.length : 0;
  if (typeof MARRIAGE_GEHAZ_CHECKLIST !== 'undefined') {
    MARRIAGE_GEHAZ_CHECKLIST.forEach(item => {
      const isMissing = missing.some(x => x === item);
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

function marRenderShabkaPicker() {
  const m = S.marriage, pk = m.shabkaPick;
  if (!pk) {
    return '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🪙 The Shabka</h3>' +
      '<p class="muted small">Go to the gold souk and choose your pieces from your allocated shabka budget.</p>' +
      '<button class="opt" style="width:100%;text-align:center;background:#fbbf24;color:#000;font-weight:700" onclick="marOpenShabkaPicker()">🪙 Visit the gold souk</button></div>';
  }
  const spent = pk.items.reduce((s, x) => s + x.priceLocal, 0);
  const left = pk.budget - spent;
  let html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🪙 Gold Souk</h3>' +
    '<div class="row"><span>Gold budget</span><b>' + money(pk.budget) + '</b></div>' +
    '<div class="row"><span>Selected</span><b>' + money(spent) + '</b></div>' +
    '<div class="row"><span>Remaining</span><b class="' + (left > 0 ? 'good' : 'bad') + '">' + money(left) + '</b></div>';

  if (pk.items.length) {
    html += '<div style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px"><b class="small">Your pieces</b>';
    pk.items.forEach((it, i) => {
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:.75rem"><span>' + it.name + ' · ' + it.grams + 'g ' + it.karat + 'K</span>' +
        '<span>' + money(it.priceLocal) + ' <button class="pill" style="padding:1px 6px;font-size:.65rem" onclick="marShabkaRemove(' + i + ')">✕</button></span></div>';
    });
    html += '</div>';
  }

  const subs = {};
  _marShabkaCatalog().forEach(i => { (subs[i.subcat] = subs[i.subcat] || []).push(i); });
  Object.keys(subs).forEach(sub => {
    html += '<h4 style="font-size:.78rem;color:#fbbf24;margin-top:10px">' + sub.replace(/_/g, ' ').toUpperCase() + '</h4>';
    subs[sub].forEach(it => {
      const ok = it.priceLocal <= left;
      html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-size:.75rem"><b>' + it.brand + ' · ' + it.name + '</b><div class="muted small">' + it.desc + '</div></div>' +
        '<button class="pill" style="padding:3px 8px;font-size:.68rem;' + (ok ? '' : 'opacity:.4') + '" ' + (ok ? '' : 'disabled') + ' onclick="marShabkaAdd(\'' + it.id + '\')">' + money(it.priceLocal) + ' +</button></div>';
    });
  });
  html += '<button class="opt" style="margin-top:12px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700" onclick="marShabkaFinish()">✅ Confirm & Take Shabka Home</button></div>';
  return html;
}

function marRenderPartyCard() {
  const m = S.marriage, e = m.engagement;
  const paid = marPartyIsPaid(e);
  const tier = marPartyTier(e.partyTier) || MARRIAGE_ENGAGEMENT_PARTY_TIERS[0];
  const share = paid ? 0 : marPartyShare(e);
  const mine = Math.round(marEGP(tier.costEGP) * share);
  const can = S.wealth >= mine;
  const payerNow = e.partyPayer || (marIsTraditionalWoman() ? 'other' : 'self');

  let html = '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">🎉 Engagement Party</h3>' +
    '<p class="muted small">The engagement party makes the engagement public and builds family ties. Must be held before wedding planning.</p>';

  if (paid) {
    html += '<div class="row"><span>Booked</span><b>' + tier.label + '</b></div>' +
      '<div class="row"><span>Guests</span><b>' + tier.guests + '</b></div>' +
      '<p class="good small">The cost was already covered during engagement finalization.</p>';
  } else {
    html += '<h4 style="font-size:.8rem;color:#fb7185;margin-top:10px">Style</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
    MARRIAGE_ENGAGEMENT_PARTY_TIERS.forEach(t => {
      html += '<button class="pill ' + (tier.id === t.id ? 'on' : '') + '" style="padding:6px;font-size:.68rem" onclick="marPartySet(\'partyTier\',\'' + t.id + '\')">' +
        t.label + '<br><span class="muted" style="font-size:.62rem">' + money(marEGP(t.costEGP)) + ' · ' + t.guests + ' guests</span></button>';
    });
    html += '</div><h4 style="font-size:.8rem;color:#34d399;margin-top:10px">Who pays?</h4><div style="display:flex;gap:4px">';
    const opts = marIsTraditionalWoman()
      ? [['other', 'His family hosts'], ['split', 'Split 50/50'], ['self', 'I pay']]
      : [['self', 'I pay'], ['split', 'Split 50/50'], ['other', 'Families help']];
    opts.forEach(o => {
      html += '<button class="pill ' + (payerNow === o[0] ? 'on' : '') + '" style="flex:1;padding:6px;font-size:.68rem" onclick="marPartySet(\'partyPayer\',\'' + o[0] + '\')">' + o[1] + '</button>';
    });
    html += '</div><div class="row" style="margin-top:8px"><span>Total cost</span><b>' + money(marEGP(tier.costEGP)) + '</b></div>' +
      '<div class="row"><span>Your share</span><b style="color:' + (can ? '#34d399' : '#fb7185') + '">' + money(mine) + '</b></div>';
  }
  html += '<button class="opt" style="margin-top:10px;width:100%;text-align:center;background:' + (can ? '#fb7185' : '#25253a') + ';color:' + (can ? '#fff' : '#666') + ';font-weight:700" ' +
    (can ? '' : 'disabled') + ' onclick="marHoldEngagementParty()">🎉 Hold the party' + (mine > 0 ? ' · ' + money(mine) : '') + '</button></div>';
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
      items.map(item => {
        const cost = costFn ? costFn(item) : '';
        return '<button class="pill ' + (selectedId === item.id ? 'on' : '') + '" style="padding:5px;font-size:.66rem" onclick="marWeddingSet(\'' + key + '\',\'' + item.id + '\')">' +
          item.label + (cost ? '<br><span class="muted" style="font-size:.6rem">' + cost + '</span>' : '') + '</button>';
      }).join('') + '</div>';
  }

  const selection = marGetWeddingSelection(w);
  const totalLocal = marEGP(selection.baseTotalEGP);
  const prenupLocal = selection.prenupCostLocal;
  const playerWeddingShare = marEGP(selection.baseTotalEGP * selection.share);
  const playerTotal = playerWeddingShare + prenupLocal;
  const canAfford = S.wealth >= playerTotal;

  let html = '';
  html += picker('Venue', MARRIAGE_WEDDING_VENUES, 'venue', w.venue, t => money(marEGP(t.baseCostEGP)));
  html += picker('Guests', MARRIAGE_GUEST_COUNTS, 'guests', w.guests, t => t.guests + ' ppl', 3);
  html += picker('Catering', MARRIAGE_CATERING_TIERS, 'catering', w.catering, t => money(marEGP(t.perGuestEGP)) + '/g');
  html += picker('Photography', MARRIAGE_PHOTOGRAPHY_TIERS, 'photography', w.photography, t => money(marEGP(t.costEGP)));
  html += picker('Attire', MARRIAGE_DRESS_TIERS, 'dress', w.dress, t => money(marEGP(t.costEGP)));
  if (typeof MARRIAGE_DECORATION_TIERS !== 'undefined') html += picker('Decoration & flowers', MARRIAGE_DECORATION_TIERS, 'decoration', w.decoration, t => money(marEGP(t.costEGP)));
  if (typeof MARRIAGE_MUSIC_OPTIONS !== 'undefined') html += picker('Music', MARRIAGE_MUSIC_OPTIONS, 'music', w.music, t => money(marEGP(t.costEGP)));
  html += picker('Honeymoon', MARRIAGE_HONEYMOON_TIERS, 'honeymoon', w.honeymoon, t => money(marEGP(t.costEGP)));
  if (typeof MARRIAGE_PLANNER_OPTIONS !== 'undefined') html += picker('Wedding planner', MARRIAGE_PLANNER_OPTIONS, 'planner', w.planner, t => money(marEGP(t.costEGP)));

  html += '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Full wedding cost</b><b style="color:#34d399">' + money(totalLocal) + '</b></div>' +
    (selection.prenup.legalCostEGP > 0 ? '<div class="row"><span>Prenup (' + selection.prenup.label + ')</span><b>' + money(prenupLocal) + '</b></div>' : '') +
    '<div class="row"><span>Your share (' + Math.round(selection.share * 100) + '%)</span><b>' + money(playerWeddingShare) + '</b></div>' +
    '<div class="row"><b>Your total to pay</b><b style="color:' + (canAfford ? '#34d399' : '#fb7185') + '">' + money(playerTotal) + '</b></div>' +
    '</div>';

  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Prenup</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  MARRIAGE_PRENUP_OPTIONS.forEach(o => {
    html += '<button class="pill ' + (w.prenup === o.id ? 'on' : '') + '" style="padding:6px;font-size:.65rem" onclick="marWeddingSet(\'prenup\',\'' + o.id + '\')">' + o.label + (o.legalCostEGP > 0 ? '<br><span class="muted" style="font-size:.6rem">' + money(marEGP(o.legalCostEGP)) + '</span>' : '') + '</button>';
  });
  html += '</div>';

  html += '<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Who pays?</h4>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">' +
    '<button class="pill ' + (w.payer === 'self' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'self\')">You pay all</button>' +
    '<button class="pill ' + (w.payer === 'split' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'split\')">Split 50/50</button>' +
    '<button class="pill ' + (w.payer === 'partner_family' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'partner_family\')">Partner & family</button>' +
    '<button class="pill ' + (w.payer === 'own_family' ? 'on' : '') + '" style="padding:6px;font-size:.72rem" onclick="marWeddingSet(\'payer\',\'own_family\')">Your family helps</button>' +
    '</div>';

  html += '<button class="opt" style="margin-top:12px;text-align:center;background:' + (canAfford ? '#34d399' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + ';font-weight:700" ' + (canAfford ? '' : 'disabled') + ' onclick="marConfirmWedding()">' + (canAfford ? '💒 Hold wedding · pay ' + money(playerTotal) : 'Need ' + money(playerTotal)) + '</button>';
  html += '<button class="opt" style="margin-top:6px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="marCancelWeddingPlanner()">Cancel planning</button>';

  return html;
}

/* ---------- 4. MARRIED LIFE ---------- */
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
    '<div class="row"><span>Finance model</span><b>' + marFinanceLabel() + '</b></div>' +
    '<div class="row"><span>Prenup</span><b>' + (m.prenup ? m.prenup.type : 'None') + '</b></div>' +
    '<div class="row"><span>Shared account</span><b>' + money(m.sharedAccountBalance) + '</b></div>' +
    '<div class="row"><span>Children</span><b>' + ((S.childrenList || []).length) + '</b></div>' +
    '</div>';
     /* Spouse financial contribution */
  if (p.career || p.income > 0) {
    var fmLabel = marFinanceLabel();
    var contributes = false;
    var contributedAmount = 0;
    var keptAmount = 0;
    var fm = m.financeModel;
    var spouseWorking = !p.career || p.career.working !== false;
    if (spouseWorking && p.income > 0) {
      if (fm === 'egalitarian' || fm === 'proportional' || fm === 'joint_account' || fm === 'shared_savings' || fm === 'custom') {
        contributes = true; contributedAmount = p.income;
      } else if (fm === 'traditional_wife' && S.gender === 'm') {
        contributes = true; contributedAmount = p.income;
      } else if (fm === 'one_earner' && S.gender === 'f') {
        contributes = true; contributedAmount = p.income;
      } else {
        keptAmount = p.income;
      }
    }
    html += '<div class="card" style="border-color:#34d399"><h3 style="color:#34d399">💼 ' + p.name + '\'s Finances</h3>' +
      '<div class="row"><span>Career</span><b>' + (p.career ? (p.career.title || 'Homemaker') : '—') + '</b></div>' +
      (p.career && p.career.company ? '<div class="row"><span>Employer</span><b>' + p.career.company + '</b></div>' : '') +
      (p.income > 0 ? '<div class="row"><span>Income</span><b class="mono good">' + money(p.income) + '/yr</b></div>' : '') +
      '<div class="row"><span>Finance model</span><b>' + fmLabel + '</b></div>' +
      (contributedAmount > 0 ? '<div class="row"><span>Contributes to household</span><b class="good">' + money(contributedAmount) + '/yr</b></div>' : '') +
      (keptAmount > 0 ? '<div class="row"><span>Keeps separate</span><b class="muted">' + money(keptAmount) + '/yr</b></div>' : '') +
      '</div>';
  }

  /* Memory history */
  var mem = relGet(p);
  if (mem.length > 0) {
    var recent = mem.slice(-8).reverse();
    var unresolvedCount = mem.filter(function(r) { return !r.resolved && r.kind === 'hurt'; }).length;
    html += '<div class="card" style="border-color:' + (unresolvedCount > 0 ? '#fb7185' : '#8b5cf6') + '">' +
      '<h3 style="color:' + (unresolvedCount > 0 ? '#fb7185' : '#8b5cf6') + '">📖 Your History Together</h3>';
    if (unresolvedCount > 0) {
      html += '<div class="muted small" style="color:#fb7185;margin-bottom:6px">' + unresolvedCount + ' unresolved hurt' + (unresolvedCount > 1 ? 's' : '') + '. They remember.</div>';
    }
    recent.forEach(function(r) {
      var icon = r.kind === 'hurt' ? '💔' : r.kind === 'gift' ? '🎁' : r.kind === 'promise' ? '🤝' :
                 r.kind === 'decision' ? '✅' : r.kind === 'compromise' ? '🕊' : r.kind === 'date' ? '💞' : '💬';
      var color = r.resolved ? '#888' : (r.kind === 'hurt' ? '#fb7185' : '#fbbf24');
      html += '<div style="padding:4px 0;font-size:.78rem;color:' + color + '">' +
        '<span class="mono muted" style="font-size:.65rem">' + r.year + '</span> ' + icon + ' ' + r.text +
        '</div>';
    });
    html += '</div>';
  }

  const c = Math.round(marEnsureChem(p));
  html += '<div class="card"><div class="row"><span>✨ Chemistry</span><b>' + c + '%</b></div>' +
    '<p class="muted small">High chemistry strengthens your bond each year. Date nights and gifts keep the spark alive.</p></div>';

  const st = Math.round(m.stress || 0);
  const col = st > 70 ? '#fb7185' : st > 40 ? '#fbbf24' : '#34d399';
  const mil = Math.round(m.motherInLawBond || 0);
  html += '<div class="card" style="border-color:' + col + '"><h3 style="color:' + col + '">🌡 Household Pressure</h3>' +
    '<div class="row"><span>Stress</span><b style="color:' + col + '">' + st + '%</b></div>' +
    '<div class="row"><span>Mother-in-law bond</span><b>' + mil + '%</b></div>' +
    '<p class="muted small" style="margin-top:6px">Stress rises with expenses, in-law disputes, and poor housing. Keep it under control.</p>' +
    '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="marReduceStress()">🌿 Take a family break · ' + money(marEGP(8000)) + '</button>' +
    '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="marVisitMotherInLaw()">☕ Visit your mother-in-law · ' + money(marEGP(1500)) + '</button>' +
    '</div>';

  if (typeof MARRIAGE_HOME_OPTIONS !== 'undefined') {
    if (!m.home) {
      html += '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">🏠 Set up your home</h3>' +
        '<p class="muted small">Where will you live? Different homes affect privacy and family support.</p>';
      MARRIAGE_HOME_OPTIONS.forEach(h => {
        html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:8px;font-size:.75rem" onclick="marSetHome(\'' + h.id + '\')">' +
          '<div style="display:flex;justify-content:space-between"><b>' + h.label + '</b><span>' + money(marEGP(h.setupCostEGP)) + ' + ' + money(marEGP(h.monthlyCostEGP)) + '/mo</span></div>' +
          '<div class="muted small">' + h.desc + '</div></button>';
      });
      html += '</div>';
    } else {
      const h = MARRIAGE_HOME_OPTIONS.find(x => x.id === m.home);
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
      '<div class="row"><span>Current plan</span><b>' + ((MARRIAGE_FAMILY_PLANNING_OPTIONS.find(x => x.id === m.familyPlanning) || {}).label || 'Undecided') + '</b></div>';
    MARRIAGE_FAMILY_PLANNING_OPTIONS.forEach(o => {
      if (m.familyPlanning === o.id) return;
      html += '<button class="opt" style="margin-top:4px;width:100%;text-align:left;padding:6px;font-size:.72rem" onclick="marSetFamilyPlanning(\'' + o.id + '\')">' + o.label + '<br><span class="muted" style="font-size:.65rem">' + o.desc + '</span></button>';
    });
    html += '</div>';
  }

  if (typeof MARRIAGE_CHILDCARE_OPTIONS !== 'undefined' && (S.childrenList && S.childrenList.length > 0)) {
    html += '<div class="card"><h3>👶 Childcare</h3>' +
      '<div class="row"><span>Current</span><b>' + ((MARRIAGE_CHILDCARE_OPTIONS.find(x => x.id === m.childcare) || {}).label || 'None chosen') + '</b></div>';
    MARRIAGE_CHILDCARE_OPTIONS.forEach(o => {
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

/* ---------- 5. CONFLICT ---------- */
function marRenderConflict() {
  const m = S.marriage;
  if (m.status !== 'married' && m.status !== 'engaged' && m.status !== 'dating') {
    return '<div class="card"><h3>⚔️ Conflict</h3><p class="muted small">Not in a relationship.</p></div>';
  }

  let html = '';
  if (m.pendingConflict) {
    const topic = (MARRIAGE_CONFLICT_TOPICS || []).find(x => x.id === m.pendingConflict);
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
      '<p class="muted small">No active conflicts. Keep bond strong and stress manageable.</p>' +
      '</div>';
  }

  if (typeof MARRIAGE_SEPARATION_OPTIONS !== 'undefined' && m.status === 'married') {
    html += '<div class="card"><h3>💔 Marital Difficulty</h3>' +
      '<p class="muted small">When things get hard, these are your options.</p>';
    MARRIAGE_SEPARATION_OPTIONS.forEach(o => {
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

/* ---------- 6. RECORDS ---------- */
function marRenderRecords() {
  const m = S.marriage;
  let html = '';

  if (typeof MARRIAGE_ACHIEVEMENTS !== 'undefined') {
    html += '<div class="card"><h3>🏆 Achievements</h3>';
    const earned = m.achievements || [];
    if (!earned.length) html += '<p class="muted small">No achievements yet.</p>';
    else earned.forEach(id => {
      const ach = MARRIAGE_ACHIEVEMENTS.find(a => a.id === id);
      if (ach) html += '<div class="row"><span>' + ach.label + '</span><span class="muted small">' + ach.desc + '</span></div>';
    });
    html += '</div>';
  }

  if (typeof MARRIAGE_MILESTONES !== 'undefined') {
    html += '<div class="card"><h3>🌟 Milestones</h3>';
    const reached = m.milestones || [];
    if (!reached.length) html += '<p class="muted small">No milestones yet.</p>';
    else reached.forEach(id => {
      const mil = MARRIAGE_MILESTONES.find(x => x.id === id);
      if (mil) html += '<div class="row"><span>' + mil.label + '</span><span class="muted small">' + mil.desc + '</span></div>';
    });
    html += '</div>';
  }

  const premarital = Array.isArray(m.premaritalHistory) ? m.premaritalHistory.slice(-15).reverse() : [];
  if (premarital.length) {
    html += '<div class="card"><h3>💌 Dating & Wedding Memories</h3>';
    premarital.forEach(item => {
      html += '<div style="padding:7px 0;border-bottom:1px solid #1a1a2a"><div class="muted small">' + (item.year || '?') + ' · ' + (item.kind || 'Memory') + '</div><div style="font-size:.78rem">' + item.text + '</div></div>';
    });
    html += '</div>';
  }

  if (m.exSpouses && m.exSpouses.length) {
    html += '<div class="card" style="border-color:#666"><h3 style="color:#888">💔 Ex-Partners</h3>';
    m.exSpouses.forEach(ex => {
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-weight:700;color:#888">' + ex.name + '</div>' +
        '<div class="muted small">Married ' + ex.marriedYear + ' · Divorced ' + ex.divorcedYear + ' · ' + ex.reason + '</div>';
      if (ex.support) {
        html += '<div class="muted small">Child support: ' + money(ex.support.amount) + '/yr (' + ex.support.direction + ') until ' + ex.support.untilYear + '</div>';
      }
      if (ex.custody) html += '<div class="muted small">Custody: ' + ex.custody + '</div>';
      html += '</div>';
    });
    html += '</div>';
  }

  if (m.conflictHistory && m.conflictHistory.length) {
    html += '<div class="card"><h3>📖 Conflict History</h3>';
    m.conflictHistory.slice(-10).reverse().forEach(c => {
      html += '<div class="row"><span>' + c.year + ' · ' + c.topic + '</span><span class="muted small">' + c.resolution + '</span></div>';
    });
    html += '</div>';
  }

  return html || '<div class="card"><h3>📜 Records</h3><p class="muted small">No records yet.</p></div>';
}

/* ============================================================
   ACTIONS & LOGIC ENGINE
   ============================================================ */

/* ---------- SALONAT MATCHMAKING ---------- */
window.marStartSalonat = function() {
  if (S.pending) return;
  if (S.gender !== 'f') { log('Arranged Salonat meetings are available for female characters.'); render(); return; }
  ensureMarriageState();
  const m = S.marriage;
  if (m.status !== 'single' && m.status !== 'divorced') {
    log('You must be single to meet a Salonat prospect.'); render(); return;
  }

  const isTradWoman = marIsTraditionalWoman();
  const meetCost = isTradWoman ? 0 : marEGP(2000);
  if (meetCost > 0 && S.wealth < meetCost) { log('Not enough cash for the gathering (' + money(meetCost) + ').'); render(); return; }
  if (meetCost > 0) S.wealth -= meetCost;

  const tier = S.familyTier || 'middle';
  let wealthLevel = (tier === 'poor' || tier === 'lower-mid') ? 'working' : (tier === 'wealthy' || tier === 'ultra') ? 'elite' : 'middle';
  const ages = wealthLevel === 'elite' ? [28, 42] : wealthLevel === 'working' ? [22, 32] : [25, 36];
  const age = Math.floor(Math.random() * (ages[1] - ages[0] + 1)) + ages[0];
  const names = marNamePool('m');
  const name = names[Math.floor(Math.random() * names.length)];

  const jobs = {
    working: [{ title: 'Teacher', salary: 120000 }, { title: 'Accountant', salary: 150000 }, { title: 'Sales Rep', salary: 140000 }],
    middle: [{ title: 'Doctor', salary: 350000 }, { title: 'Engineer', salary: 300000 }, { title: 'Business Owner', salary: 500000 }],
    elite: [{ title: 'Surgeon', salary: 1200000 }, { title: 'CEO', salary: 2500000 }, { title: 'Investor', salary: 3000000 }]
  };
  const job = jobs[wealthLevel][Math.floor(Math.random() * jobs[wealthLevel].length)];
  const mahrEGPVal = wealthLevel === 'elite' ? 500000 : wealthLevel === 'working' ? 50000 : 150000;
  const shabkaGrams = wealthLevel === 'elite' ? 100 : wealthLevel === 'working' ? 25 : 50;
  const houseType = wealthLevel === 'elite' ? 'mansion' : wealthLevel === 'working' ? 'small_apartment' : 'nice_apartment';
  const houseValueEGP = wealthLevel === 'elite' ? 15000000 : wealthLevel === 'working' ? 1500000 : 3500000;

  const giveHouseToBride = Math.random() < (wealthLevel === 'elite' ? 0.4 : 0.2);
  const traits = marRollTraits();

  S.marriage.salonatProspect = {
    name, age, gender: 'm', job, wealthLevel,
    mahrLocal: marEGP(mahrEGPVal), shabkaGrams, houseType,
    houseValueLocal: marEGP(houseValueEGP), giveHouseToBride,
    traits, familyApproval: 1.0
  };
  m.tab = 'find';
  render();
};

window.marAcceptSalonat = function() {
  const p = S.marriage.salonatProspect;
  if (!p) return;

  S.marriage.partner = {
    name: p.name, age: p.age, gender: p.gender,
    bond: 30, trust: 25, communication: 25, compatibility: 50, chemistry: 40,
    traits: p.traits, income: p.job.salary, source: 'Salonat',
    familyApproval: 1.0, metYear: gameYear(),
    relationshipStage: 'engaged', exclusive: true,
    memories: [], talkedTopics: [], topicCounts: {}, activityCounts: {},
    dateCount: 0, commitmentTalks: 1, familyIntroduced: true,
    preferences: marCreatePartnerPreferences(p.traits)
  };

  S.marriage.status = 'engaged';
  S.marriage.gehazPayer = 'groom';
  S.marriage.husbandHomeProvided = true;
  S.marriage.engagement = {
    proposal: 'family', shabkaTier: 'custom', mahrTier: 'custom', partyTier: 'nice_hall',
    payer: 'partner', finalized: true,
    salonatMahr: p.mahrLocal, salonatShabka: p.shabkaGrams,
    partyPaid: false, partyHeld: false
  };

  marFixEngagementCosts();
  S.wealth += p.mahrLocal;

  if (typeof createHome === 'function') {
    if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];
    S.ownedHomes.forEach(old => { if (old.status === 'occupied') old.status = 'vacant'; });
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

  log(`💍 You accepted the proposal from ${p.name}. Received ${money(p.mahrLocal)} Mahr.`);
  fx({ happiness: 15, social: 10 });
  S.marriage.salonatProspect = null;
  S.marriage.tab = 'plan';
  render();
};

window.marRejectSalonat = function() {
  log('❌ You declined the Salonat proposal.');
  S.marriage.salonatProspect = null;
  render();
};

/* ---------- DATING & PREMARITAL ACTIONS ---------- */
window.marTryDate = function(sourceId) {
  ensureMarriageState();
  const m = S.marriage;
  if (m.status !== 'single' && m.status !== 'divorced') { log('You must be single to meet a partner.'); render(); return; }
  if (S.age < 16) { log('Available at age 16+.'); render(); return; }
  const src = (MARRIAGE_DATING_SOURCES || []).find(s => s.id === sourceId);
  if (!src) return;
  const cost = marEGP(src.cost);
  if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;
  m.datingAttempts++;

  const familiarityBonus = Math.min(0.08, Math.max(0, m.datingAttempts - 1) * 0.01);
  if (Math.random() > Math.min(0.95, src.matchChance + familiarityBonus)) {
    log('💔 No match came from ' + src.label + ' this time.');
    fx({ happiness: -1 });
    render(); return;
  }

  const targetGender = S.gender === 'm' ? 'f' : 'm';
  const names = marNamePool(targetGender);
  const name = names.length ? names[Math.floor(Math.random() * names.length)] : 'Alex';
  const age = Math.max(18, S.age + Math.floor(Math.random() * 7) - 3);
  const traits = marRollTraits();

  m.partner = {
    name, age, gender: targetGender,
    bond: 45 + Math.floor(Math.random() * 15),
    trust: 38 + Math.floor(Math.random() * 15),
    communication: 35 + Math.floor(Math.random() * 20),
    compatibility: marClamp(45 + Math.floor(Math.random() * 35), 25, 92),
    chemistry: 40 + Math.floor(Math.random() * 20),
    traits, income: 0, source: src.label,
    familyApproval: src.familyApproval || 0.7,
    metYear: gameYear(), relationshipStage: 'getting_to_know_you', exclusive: false,
    memories: [], talkedTopics: [], topicCounts: {}, activityCounts: {},
    dateCount: 0, commitmentTalks: 0, familyIntroduced: false,
    exclusiveAttempts: 0, lastExclusiveAttemptDateCount: -99,
    proposalAttempts: 0, partnerProposalOffered: false, pendingPartnerProposal: null,
    preferences: marCreatePartnerPreferences(traits)
  };
  m.status = 'dating';
  m.engagement = null;
  m.wedding = null;
  marRecordMemory('first_meeting', 'You met ' + name + ' through ' + src.label + '.', 2);
  log('💕 You met ' + name + ' (age ' + age + ') via ' + src.label + '.');
  fx({ happiness: 8 });
  marUnlockAchievement('first_relationship');
  marReachMilestone('first_date');
  render();
};

window.marDoActivity = function(activityId) {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (!p) return;
  const act = (MARRIAGE_RELATIONSHIP_ACTIVITIES || []).find(a => a.id === activityId);
  if (!act) return;
  const cost = marEGP(act.costEGP);

  if (m.status === 'dating' || m.status === 'engaged') {
    if (marIsTraditionalWoman()) {
      if (S.gender === 'm') {
        if (S.wealth < cost) { log('Not enough cash for ' + act.label + ' (' + money(cost) + ').'); render(); return; }
        S.wealth -= cost;
      } else {
        log('💸 ' + p.name + ' paid for ' + act.label + '.');
      }
    } else {
      const halfCost = Math.round(cost * 0.5);
      if (S.wealth < halfCost) { log('Not enough cash for your share (' + money(halfCost) + ').'); render(); return; }
      S.wealth -= halfCost;
    }
  } else if (m.status === 'married') {
    if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }
    S.wealth -= cost;
    p.bond = marClamp(Number(p.bond || 0) + Number(act.bond || 0), 0, 100);
    marBumpChem(p, 2);
    fx({ happiness: Number(act.happiness || 0) });
      log('💞 ' + act.label + ' with ' + p.name + '.');
  // husband reacts
  var reaction = characterSay(p, p.bond > 75 ? 'affection' : p.bond > 45 ? 'happy' : 'greeting');
  if (reaction) log(p.name + ': "' + reaction + '"');
  render();
};

  if (!p.activityCounts || typeof p.activityCounts !== 'object') p.activityCounts = {};
  const count = Number(p.activityCounts[activityId] || 0);
  const isFav = p.preferences && p.preferences.preferredActivity === activityId;
  const diminishing = count >= 3 ? 2 : count >= 1 ? 1 : 0;
  let bondChange = Number(act.bond || 0) - diminishing;
  let happinessChange = Number(act.happiness || 0) - diminishing;
  let trustChange = 1;
  let commChange = act.time === 'short' ? 1 : 2;

  if (isFav) {
    bondChange += 3; happinessChange += 2; trustChange += 1;
    marBumpChem(p, 4);
  } else {
    marBumpChem(p, 1);
  }

  p.bond = marClamp(Number(p.bond || 0) + bondChange, 0, 100);
  p.trust = marClamp(Number(p.trust || 0) + trustChange, 0, 100);
  p.communication = marClamp(Number(p.communication || 0) + commChange, 0, 100);
  p.activityCounts[activityId] = count + 1;
  p.dateCount = Number(p.dateCount || 0) + 1;
  p.relationshipStage = p.exclusive ? 'exclusive' : (p.dateCount >= 2 && p.bond >= 55 ? 'getting_serious' : 'getting_to_know_you');
  fx({ happiness: happinessChange });
  marRecordMemory('date_activity', act.label + ' with ' + p.name + '.', isFav ? 3 : 1);
     if (typeof relRemember === 'function') relRemember(p, 'date', act.label, true);
  log('💞 ' + act.label + ' with ' + p.name + '.');
  render();
};

window.marPremaritalTalk = function(topicId) {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (!p || (m.status !== 'dating' && m.status !== 'engaged')) return;
  const topic = (MARRIAGE_PREMARITAL_CONVERSATIONS || []).find(t => t.id === topicId);
  if (!topic) return;
  if (!p.topicCounts) p.topicCounts = {};
  if (!Array.isArray(p.talkedTopics)) p.talkedTopics = [];
  const prior = Number(p.topicCounts[topic.id] || 0);
  const repeatPenalty = prior > 0 ? Math.min(3, prior) : 0;

  let trustChange = Number(topic.trust || 0) - repeatPenalty;
  let bondChange = Number(topic.bond || 0) - Math.min(2, repeatPenalty);
  let commChange = Number(topic.communication || 0);
  let compatChange = prior === 0 ? Number(topic.compatibility || 0) : 0;

  p.bond = marClamp(Number(p.bond || 0) + bondChange, 0, 100);
  p.trust = marClamp(Number(p.trust || 0) + trustChange, 0, 100);
  p.communication = marClamp(Number(p.communication || 0) + commChange, 0, 100);
  p.compatibility = marClamp(Number(p.compatibility || 0) + compatChange, 0, 100);
  p.topicCounts[topic.id] = prior + 1;
  marBumpChem(p, marHasTrait(p, 'communicative') ? 3 : 2);

  /* Red Flag Discovery Event */
  if (prior === 0 && Math.random() < 0.15) {
    const negativeTraits = p.traits.filter(t => ['greedy', 'jealous', 'grumpy', 'stubborn', 'extravagant', 'stingy'].includes(t));
    if (negativeTraits.length > 0) {
      const trait = negativeTraits[0];
      const traitObj = marTrait(trait);
      S.pending = {
        title: '🚩 Red Flag Discovered',
        text: 'During your conversation about ' + topic.topic + ', you noticed a troubling side of ' + p.name + '. They revealed they are ' + (traitObj ? traitObj.label.toLowerCase() : trait) + '.\n\n(' + (traitObj ? traitObj.desc : '') + ')',
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
  marRecordMemory('conversation_' + topic.id, 'You discussed ' + topic.topic + ' with ' + p.name + '.', 2);
  log('💬 ' + topic.label + ' with ' + p.name + '.');

  /* Autonomous Partner Proposal */
  if ((topic.id === 'marriage' || topic.id === 'commitment') && m.status === 'dating' &&
      p.exclusive && !p.partnerProposalOffered && !p.pendingPartnerProposal &&
      (!m.engagement || !m.engagement.proposal) && Number(p.bond || 0) >= 70 && Number(p.trust || 0) >= 65 &&
      marPremaritalReadiness(p).score >= 75) {

    let baseChance = 0.15 + (marPremaritalReadiness(p).score - 75) * 0.012;
    if (marHasTrait(p, 'confident')) baseChance += 0.05;
    if (marHasTrait(p, 'romantic')) baseChance += 0.04;
    if (marIsTraditionalWoman()) baseChance += 0.35;

    if (Math.random() < marClamp(baseChance, 0.15, 0.90)) {
      p.partnerProposalOffered = true;
      marRecordMemory('partner_proposal', p.name + ' decided to formally ask for your hand.', 5);
      marTriggerProposalEvent(p);
    }
  }

  render();
};

window.marAskExclusive = function() {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (m.status !== 'dating' || !p || p.exclusive) return;
  const chance = marClamp(0.25 + Number(p.bond || 0) * 0.004 + Number(p.trust || 0) * 0.003, 0.15, 0.95);
  p.exclusiveAttempts = (p.exclusiveAttempts || 0) + 1;
  p.lastExclusiveAttemptDateCount = Number(p.dateCount || 0);

  if (Math.random() <= chance) {
    p.exclusive = true;
    p.relationshipStage = 'exclusive';
    p.bond = marClamp(p.bond + 5, 0, 100);
    p.trust = marClamp(p.trust + 5, 0, 100);
    marRecordMemory('became_exclusive', 'You and ' + p.name + ' agreed to be exclusive.', 4);
    log('💞 You and ' + p.name + ' are now exclusive.');
    marReachMilestone('exclusive');
  } else {
    p.bond = marClamp(p.bond - 2, 0, 100);
    log('💬 ' + p.name + ' is not ready for exclusivity yet.');
  }
  render();
};

window.marIntroduceFamilies = function() {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (!p || p.familyIntroduced) return;
  const approval = marFamilyApproval(p);
  p.familyIntroduced = true;
  marReachMilestone('meet_family');
  if (Math.random() <= approval) {
    p.familyApproval = marClamp((p.familyApproval || 0.7) + 0.1, 0.1, 1);
    p.trust = marClamp(p.trust + 4, 0, 100);
    log('👨‍👩‍👧 The family meeting went very well!');
  } else {
    p.familyApproval = marClamp((p.familyApproval || 0.7) - 0.05, 0.1, 1);
    log('👨‍👩‍👧 The family meeting was a bit awkward.');
  }
  render();
};

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

/* Shortcuts */
window.marDate = () => marDoActivity('restaurant');
window.marGift = () => marDoActivity('gift');
window.marTalk = () => marDoActivity('walk');
window.marVacation = () => marDoActivity('weekend');

/* ---------- PROPOSALS & ENGAGEMENT ARRANGEMENTS ---------- */
window.marSelectProposal = function(optionId) {
  ensureMarriageState();
  const m = S.marriage;
  if (m.status !== 'dating' || !m.partner) return;
  const opt = (MARRIAGE_PROPOSAL_OPTIONS || []).find(x => x.id === optionId);
  if (!opt) return;
  if (S.wealth < marEGP(opt.costEGP)) { log('Not enough cash for this proposal.'); render(); return; }
  if (!m.engagement) m.engagement = { shabkaTier: 'standard', mahrTier: 'standard', partyTier: 'nice_hall' };
  m.engagement.proposal = optionId;
  m.engagement.proposalCost = opt.costEGP;
  render();
};

window.marClearProposal = function() {
  if (S.marriage && S.marriage.engagement) {
    S.marriage.engagement.proposal = null;
    S.marriage.engagement.proposalCost = 0;
  }
  render();
};

window.marConfirmProposal = function() {
  ensureMarriageState();
  const m = S.marriage, p = m.partner, e = m.engagement;
  if (!p || !e || !e.proposal) return;
  const propOpt = (MARRIAGE_PROPOSAL_OPTIONS || []).find(x => x.id === e.proposal);
  if (!propOpt) return;
  const cost = marEGP(propOpt.costEGP);
  if (S.wealth < cost) { log('Not enough cash.'); render(); return; }
  S.wealth -= cost;

  const readiness = marPremaritalReadiness(p);
  const chance = marClamp(0.1 + readiness.score * 0.009, 0.2, 0.95);
  if (Math.random() > chance) {
    log('💬 ' + p.name + ' asked for more time before taking this step.');
    p.bond = marClamp(p.bond - 3, 0, 100);
    m.engagement = null;
    render(); return;
  }

  p.bond = marClamp(p.bond + 8, 0, 100);
  p.trust = marClamp(p.trust + 6, 0, 100);
  p.exclusive = true;
  p.relationshipStage = 'engaged';
  m.status = 'engaged';
  m.engagement.finalized = false;
  marRecordMemory('proposal_accepted', p.name + ' accepted your proposal!', 5);
  log('💍 ' + p.name + ' said YES! You are engaged.');
  fx({ happiness: 22 });
  marUnlockAchievement('engaged');
  marReachMilestone('proposal');
  marReachMilestone('engagement');
  render();
};

window.marAskForHand = function() {
  if (S.pending) return;
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (!p || m.status !== 'dating') return;
  if (marIsTraditionalWoman()) { log('❌ In your culture, he approaches your father.'); render(); return; }
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
    text: 'You sit with her father. He states his conditions:\n\n' + marDemandsText(d),
    choices: [
      { label: '✅ Agree to terms', effect: () => {
          marApplyFatherDeal(p, d);
          log('💍 Agreed. Finalize the engagement in the Plan tab.');
        }
      },
      { label: '🤝 Negotiate property', effect: () => {
          if (Math.random() < 0.40 + p.bond / 300) {
            marApplyFatherDeal(p, Object.assign({}, d, { property: 'his_name', furnishing: 'shared' }));
            log('🤝 Her father agreed to a lighter arrangement.');
          } else {
            p.familyApproval = marClamp((p.familyApproval || 0.7) - 0.05, 0.1, 1);
            log('💬 Her father held firm.');
          }
        }
      },
      { label: '🚪 Walk away', effect: () => { p.bond = Math.max(0, p.bond - 10); log('You left.'); } }
    ]
  };
  S.evId = 'hand_meeting_' + gameYear();
  render();
};

window.marHintAtProposal = function() {
  const m = S.marriage, p = m.partner;
  if (!p || m.status !== 'dating') return;
  const readiness = marPremaritalReadiness(p);
  if (!readiness.ready) { log('Not ready yet. ' + readiness.reasons.join(' ')); return; }
  if (Math.random() < 0.45) {
    marTriggerProposalEvent(p);
  } else {
    log('💬 You dropped subtle hints, but ' + p.name + ' didn\'t take the step yet.');
  }
};

window.marStartFatherMeeting = function(p) {
  if (S.pending) return;
  const father = (S.family || []).find(f => f.role === 'Father' && f.alive !== false);
  const fname = father ? father.name : 'Your father';
  const d = marBuildFatherDemands(Number(p.income || 0) || 250000, S.familyTier, p.traits);
  S.pending = {
    title: '☕ ' + p.name + ' Comes for Your Hand',
    text: p.name + ' arrives with his family. Over tea, ' + fname + ' names his conditions:\n\n' + marDemandsText(d),
    choices: [
      { label: '✅ Accept the terms', effect: () => {
          marApplyFatherDeal(p, d);
          log('💍 The families shook hands. Engagement finalized in Plan tab.');
        }
      },
      { label: '🕊 Ask Baba to be flexible', effect: () => {
          if (Math.random() < 0.4 + p.bond / 250) {
            const soft = Object.assign({}, d, {
              shabka: marTierStep(MARRIAGE_SHABKA_TIERS, d.shabka, -1),
              mahr: marTierStep(MARRIAGE_MAHR_TIERS, d.mahr, -1),
              property: d.property === 'bride_name' ? 'his_name' : d.property
            });
            marApplyFatherDeal(p, soft);
            log('🕊 ' + fname + ' softened his terms out of love for you.');
          } else {
            marApplyFatherDeal(p, d);
            S.marriage.motherInLawBond = Math.max(0, S.marriage.motherInLawBond - 10);
            log('😬 ' + fname + ' held firm.');
          }
        }
      },
      { label: '⏳ Ask for more time', effect: () => { p.trust = Math.max(0, p.trust - 2); log('💬 You asked for time.'); } },
      { label: '❌ Refuse', effect: (s) => { s.marriage.partner = null; s.marriage.status = 'single'; log('💔 Proposal refused.'); } }
    ]
  };
  S.evId = 'father_meeting_' + gameYear();
  render();
};

window.marTriggerProposalEvent = function(p) {
  if (S && S.pending) return;
  if (marIsTraditionalWoman()) return marStartFatherMeeting(p);

  S.pending = {
    title: '💍 ' + p.name + ' Proposed!',
    text: p.name + ' got down on one knee and asked you to marry them.',
    choices: [
      { label: '✅ Say YES!', effect: (s) => {
          s.marriage.partner = p;
          s.marriage.status = 'engaged';
          s.marriage.engagement = { proposal: 'personal', shabkaTier: 'standard', mahrTier: 'standard', partyTier: 'nice_hall', payer: 'split', finalized: false };
          log('💍 You said YES! You are engaged.');
          fx({ happiness: 25 });
        }
      },
      { label: '⏳ Ask for time', effect: () => log('💬 Asked for more time.') },
      { label: '❌ Refuse', effect: (s) => { s.marriage.partner = null; s.marriage.status = 'single'; log('💔 Refused proposal.'); } }
    ]
  };
  S.evId = 'proposal_event_' + gameYear();
  render();
};

window.marRespondToPartnerProposal = function(choice) {
  const p = S.marriage.partner;
  if (choice === 'accept' && p && marIsTraditionalWoman() && S.marriage.status === 'dating') {
    p.pendingPartnerProposal = null;
    return marStartFatherMeeting(p);
  }
  if (choice === 'accept') {
    p.exclusive = true; p.relationshipStage = 'engaged'; S.marriage.status = 'engaged';
    S.marriage.engagement = { proposal: 'partner_initiated', shabkaTier: 'standard', mahrTier: 'standard', partyTier: 'nice_hall', payer: 'split', finalized: false };
    log('💍 Accepted proposal!');
  } else if (choice === 'time') {
    log('Asked for time.');
  } else {
    S.marriage.partner = null; S.marriage.status = 'single'; log('Declined proposal.');
  }
  p.pendingPartnerProposal = null;
  render();
};

window.marEngagementSet = function(key, value) {
  const e = S.marriage.engagement;
  if (!e) return;
  if (e.fatherTerms && (key === 'shabkaTier' || key === 'mahrTier')) {
    log('📜 These terms were set by the families and cannot be changed here.'); render(); return;
  }
  e[key] = value;
  render();
};

window.marSetMahrSplit = function(pct) {
  if (S.marriage.engagement) {
    S.marriage.engagement.mahrAdvancedPct = pct;
    render();
  }
};

window.marFinalizeEngagement = function() {
  const m = S.marriage, e = m.engagement;
  if (!e) return;
  const shabka = (MARRIAGE_SHABKA_TIERS || []).find(x => x.id === e.shabkaTier) || MARRIAGE_SHABKA_TIERS[0];
  const mahr = (MARRIAGE_MAHR_TIERS || []).find(x => x.id === e.mahrTier) || MARRIAGE_MAHR_TIERS[0];
  const party = (MARRIAGE_ENGAGEMENT_PARTY_TIERS || []).find(x => x.id === e.partyTier) || MARRIAGE_ENGAGEMENT_PARTY_TIERS[0];

  const totalMahr = mahr.costEGP;
  const advPct = e.mahrAdvancedPct || 0.5;
  const mahrAdv = Math.round(totalMahr * advPct);
  const mahrDef = totalMahr - mahrAdv;

  const totalEGP = shabka.costEGP + mahrAdv + party.costEGP;
  const totalLocal = marEGP(totalEGP);
  const payer = e.payer || 'self';
  let share = payer === 'partner' ? 0 : payer === 'split' ? 0.5 : 1;
  const playerTotal = Math.round(totalLocal * share);

  if (S.wealth < playerTotal) { log('Not enough cash to finalize engagement.'); render(); return; }
  S.wealth -= playerTotal;

  if (marIsTraditionalWoman()) {
    S.wealth += marEGP(mahrAdv);
    log('💰 Received advanced Mahr: ' + money(marEGP(mahrAdv)));
  }

  m.mahrAdvanced = marEGP(mahrAdv);
  m.mahrDeferred = marEGP(mahrDef);
  e.shabkaTier = shabka.id; e.shabkaCost = shabka.costEGP;
  e.mahrTier = mahr.id; e.mahrCost = mahr.costEGP;
  e.partyTier = party.id; e.partyCost = party.costEGP;
  e.finalized = true;
  e.partyPaid = true;
  e.partyHeld = false;

  m.partner.bond = Math.min(100, m.partner.bond + 10);
  log('💍 Engagement finalized!');
  fx({ happiness: 20 });

  if (marIsTraditionalWoman() && !m.husbandHomeProvided && !S.pending) {
    marHusbandProvidesHome();
  }
  render();
};

window.marCancelEngagement = function() {
  if (!S.marriage.partner) return;
  if (!confirm('Cancel engagement with ' + S.marriage.partner.name + '?')) return;
  S.marriage.status = 'single';
  S.marriage.engagement = null;
  S.marriage.wedding = null;
  S.marriage.partner = null;
  log('💔 Engagement cancelled.');
  fx({ happiness: -20 });
  render();
};

/* ---------- SHABKA SOUK PICKER ---------- */
window.marOpenShabkaPicker = function() {
  const m = S.marriage, e = m.engagement;
  if (!e || !e.finalized) { log('Finalize engagement first.'); render(); return; }
  if (m.shabkaChosen) { log('Already picked Shabka.'); render(); return; }
  m.shabkaPick = { budget: marShabkaBudgetFor(e), items: [] };
  m.tab = 'plan';
  render();
};
window.marShabkaGoldSoukTrip = () => marOpenShabkaPicker();

window.marShabkaAdd = function(id) {
  const pk = S.marriage.shabkaPick; if (!pk) return;
  const it = _marShabkaCatalog().find(i => i.id === id);
  if (!it) return;
  const left = pk.budget - pk.items.reduce((s, x) => s + x.priceLocal, 0);
  if (it.priceLocal > left) { log('❌ Over budget.'); render(); return; }
  pk.items.push(it);
  render();
};

window.marShabkaRemove = function(i) {
  const pk = S.marriage.shabkaPick; if (!pk) return;
  pk.items.splice(i, 1);
  render();
};

window.marShabkaFinish = function() {
  const m = S.marriage, pk = m.shabkaPick, p = m.partner, e = m.engagement;
  if (!pk || !pk.items.length) { log('Choose at least one piece.'); render(); return; }
  const spent = pk.items.reduce((s, x) => s + x.priceLocal, 0);
  const left = pk.budget - spent;
  const toMe = S.gender === 'f';

  pk.items.forEach(it => {
    if (toMe) marGiveJewelry(it, 'groom');
    else S.shopping.gifts.unshift({ year: gameYear(), itemId: it.id, name: it.brand + ' ' + it.name, price: it.priceLocal, to: p.name, toType: 'spouse' });
  });

  if (left > 0) {
    if (toMe) { S.wealth += left; log('💰 Unspent Shabka balance returned in cash: ' + money(left)); }
    else { const back = Math.round(left * marPlayerShare(e)); if (back > 0) { S.wealth += back; log('💰 Unspent Shabka budget refunded: ' + money(back)); } }
  }

  const grams = pk.items.reduce((s, x) => s + x.grams, 0);
  marBumpChem(p, 8);
  p.bond = Math.min(100, p.bond + 6);
  m.motherInLawBond = Math.min(100, (m.motherInLawBond || 50) + (grams >= 40 ? 5 : 0));
  m.shabkaChosen = true; m.shabkaPick = null;
  log('🪙 Shabka completed (' + grams + 'g 21K gold)!');
  fx({ happiness: 10 });
  render();
};

/* ---------- ENGAGEMENT PARTY ---------- */
window.marPartySet = function(key, value) {
  const e = S.marriage.engagement;
  if (!e || e.partyHeld) return;
  e[key] = value;
  render();
};

window.marHoldEngagementParty = function() {
  if (S.pending) return;
  ensureMarriageState();
  const m = S.marriage, p = m.partner, e = m.engagement;
  if (!p || !e || !e.finalized || e.partyHeld) return;
  const tier = marPartyTier(e.partyTier) || MARRIAGE_ENGAGEMENT_PARTY_TIERS[0];
  if (!marPartyIsPaid(e)) {
    const cost = Math.round(marEGP(tier.costEGP) * marPartyShare(e));
    if (S.wealth < cost) { log('Not enough cash for the party (' + money(cost) + ').'); render(); return; }
    S.wealth -= cost;
  }
  e.partyPaid = true; e.partyHeld = true; e.partyCost = tier.costEGP;

  const s = tier.social || 0;
  fx({ happiness: 4 + Math.round(s / 2), social: s });
  p.bond = marClamp(p.bond + 2 + Math.floor(s / 4), 0, 100);
  p.trust = marClamp((p.trust || 50) + 2, 0, 100);
  marBumpChem(p, 2 + Math.floor(s / 6));

  m.motherInLawBond = marClamp((m.motherInLawBond || 50) + (tier.guests >= 150 ? 8 : 4), 0, 100);
  p.familyApproval = marClamp((p.familyApproval || 0.7) + 0.04, 0.1, 1);
  log('🎉 The engagement party was celebrated successfully!');
  marRecordMemory('engagement_party', 'Held engagement party: ' + tier.label, 4);
  marPartyEvent(p);
  render();
};

/* ---------- GEHAZ & MARITAL HOME ---------- */
window.marSetGehazPayer = function(id) {
  S.marriage.gehazPayer = id;
  render();
};

window.marRequestHome = function() {
  ensureMarriageState();
  if (!marIsTraditionalWoman()) return;
  marHusbandProvidesHome();
  render();
};

window.marCheckTrousseau = function() {
  ensureMarriageState();
  const m = S.marriage;
  if (m.status !== 'engaged') return;
  const home = marMaritalHome();
  if (!home) { log('❌ Need a home before checking trousseau.'); render(); return; }
  const missing = marMissingGehaz(home);
  if (missing.length === 0) {
    if (!m.trousseauComplete) {
      m.trousseauComplete = true;
      m.motherInLawBond = marClamp(m.motherInLawBond + 10, 0, 100);
      log('✅ Marital home fully furnished! Mother-in-law is impressed (+10 bond).');
    } else {
      log('✅ The trousseau is already complete.');
    }
  } else {
    log('⚠️ Still missing: ' + missing.map(i => i.label).join(', '));
  }
  render();
};

window.marBuyGehazItem = function(cat, subcat) {
  const m = S.marriage;
  const h = marMaritalHome();
  if (!h) { log('❌ Need a home first.'); return; }
  if (typeof SHOP_ALL === 'undefined') return;

  const pool = SHOP_ALL.filter(item => item[2] === cat && (!subcat || item[3] === subcat));
  if (pool.length === 0) { log('❌ No items found.'); return; }
  const itemData = pool[Math.floor(pool.length / 2)];
  const mult = SHOP_MULT[S.country] ? (SHOP_MULT[S.country][cat] || 1) : 1;
  const priceLocal = Math.round(itemData[4] * mult * marRate());

  let playerCost = 0;
  let payer = 'you';

  if (marIsTraditionalWoman() && m.gehazModel !== 'shared') {
    payer = 'husband';
    playerCost = 0;
  } else if (S.gender === 'm') {
    if (m.gehazPayer === 'groom_family') {
      const famWealth = (typeof eduFamilyWealth === 'function') ? eduFamilyWealth() : 3000000;
      if (famWealth >= priceLocal) { payer = 'your_family'; playerCost = 0; }
      else { payer = 'you'; playerCost = priceLocal; }
    } else if (m.gehazPayer === 'split') {
      payer = 'split'; playerCost = Math.round(priceLocal / 2);
    } else {
      payer = 'you'; playerCost = priceLocal;
    }
  } else {
    if (m.gehazPayer === 'partner' || m.gehazPayer === 'groom') {
      payer = 'husband'; playerCost = 0;
    } else if (m.gehazPayer === 'split') {
      payer = 'split'; playerCost = Math.round(priceLocal / 2);
    } else {
      payer = 'you'; playerCost = priceLocal;
    }
  }

  if (playerCost > 0 && S.wealth < playerCost) {
    log('❌ You need ' + money(playerCost) + ' for your share.');
    return;
  }
  if (playerCost > 0) S.wealth -= playerCost;

  if (!S.shopping) S.shopping = { inventory: [] };
  S.shopping.inventory.push({
    uid: 'i' + (S.uidN++), itemId: itemData[0].toLowerCase() + '_' + itemData[1].toLowerCase().replace(/\W/g, '_'),
    brand: itemData[0], name: itemData[1], cat, subcat: itemData[3],
    priceUSD: itemData[4], purchasePrice: priceLocal, currentValue: priceLocal,
    purchaseYear: gameYear(), age: 0, life: itemData[7],
    happiness: itemData[5], social: itemData[6], broken: false, condition: 100, warrantyUntil: 0,
    homeId: h.id, homeName: h.name, paidBy: payer
  });

  h.furnitureValue = (h.furnitureValue || 0) + priceLocal;
  h.value = (h.value || 0) + priceLocal;
  h.homeComfort = (h.homeComfort || 0) + (itemData[5] * 2);
  h.shoppingComfort = (h.shoppingComfort || 0) + (itemData[5] * 2);

  log('✅ Purchased ' + itemData[1] + ' for the home.');
  render();
};

window.marDiscussGehaz = function() {
  if (S.pending) return;
  const m = S.marriage, p = m.partner;
  if (!p || m.status !== 'engaged') return;
  const h = marMaritalHome();
  if (!h) { log('❌ Need a home first.'); return; }
  const missing = marMissingGehaz(h);
  if (missing.length === 0) {
    log('✅ ' + p.name + ' smiles: "The home is fully furnished. Nothing left to discuss."');
    render(); return;
  }

  S.pending = {
    title: '🛋 Discussing the Gehaz',
    text: 'You sit with ' + p.name + ' over tea to discuss furnishing ' + h.name + '.\nMissing: ' + missing.map(i => i.label).join(', '),
    choices: [
      { label: '💛 "Whatever you and your family think is best"', effect: (s) => {
          const hh = marMaritalHome();
          missing.forEach(it => marAddGehazItem(hh, it, 'husband'));
          log('👨 ' + p.name + ' covered the remaining furnishings.');
          fx({ happiness: 8 });
        }
      },
      { label: '📋 "Let us choose each piece ourselves in the Plan tab"', effect: () => log('🛋 You will select each piece in the Plan tab.') },
      { label: '🤝 "Let\'s split the remaining costs"', effect: (s) => {
          s.marriage.gehazPayer = 'split';
          p.bond = Math.min(100, p.bond + 10);
          log('🤝 Agreed to split costs.');
        }
      }
    ]
  };
  S.evId = 'discuss_gehaz_' + gameYear();
  render();
};

window.marHusbandProvidesHome = function() {
  const m = S.marriage, p = m.partner;
  if (!p || m.husbandHomeProvided) return null;
  if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];

  const existing = S.ownedHomes.find(h => h.status === 'occupied');
  if (existing) {
    m.husbandHomeProvided = true;
    log('🏠 Living in existing home (' + existing.name + ').');
    marApplyGehazModel(existing);
    return existing;
  }
  m.husbandHomeProvided = true;

  const inc = p.income || 0;
  const rateRatio = (C().rate || 1) / MAR_EGP_BASE_RATE;

  let basePpm, area, type, desc;
  if (inc >= 1000000 * rateRatio) { basePpm = 150000; area = 400; type = 'Luxury Villa'; desc = 'a stunning luxury villa'; }
  else if (inc >= 500000 * rateRatio) { basePpm = 80000; area = 250; type = 'Villa'; desc = 'a spacious villa'; }
  else if (inc >= 200000 * rateRatio) { basePpm = 55000; area = 160; type = 'Apartment'; desc = 'a comfortable 3-bedroom apartment'; }
  else if (inc >= 100000 * rateRatio) { basePpm = 35000; area = 120; type = 'Apartment'; desc = 'a cozy 2-bedroom apartment'; }
  else { basePpm = 25000; area = 90; type = 'Modest Apartment'; desc = 'a starter apartment'; }

  const localPpm = Math.round(basePpm * rateRatio);
  const toBride = m.propertyDeal ? m.propertyDeal === 'bride_name' : (marHasTrait(p, 'generous') || marHasTrait(p, 'protector') || p.bond >= 90);
  const value = localPpm * area;
  S.ownedHomes.forEach(o => { if (o.status === 'occupied') o.status = 'vacant'; });

  const homeCity = p.city || (COUNTRIES[S.country] ? COUNTRIES[S.country].capital : 'Cairo');

  const home = (typeof createHome === 'function') ? createHome({
    name: type + (toBride ? ' — In Your Name' : ' — ' + p.name + '\'s Property'),
    city: homeCity, location: 'Family Neighborhood', country: S.country,
    baseValue: value, value: value, area: area, rooms: Math.max(2, Math.floor(area / 30)),
    condition: 85, status: 'occupied', source: 'husband_provided',
    isHusbandOwned: !toBride, husbandName: p.name
  }) : { id: 'h_provided', name: type, isHusbandOwned: !toBride, status: 'occupied', value, area, country: S.country };

  S.ownedHomes.push(home);
  S.realEstateActiveHomeId = home.id;
  S.housing = 'owned';

  let text = p.name + ' takes you to see ' + desc + ' in ' + homeCity + '.\n\n';
  text += toBride ? '"As promised, it is registered under your name."' : '"This is where we will build our life together."';

  S.pending = {
    title: '🏠 Your Marital Home', text: text,
    choices: [{
      label: toBride ? '💍 Accept with tears of joy' : '💍 Accept with happiness',
      effect: () => {
        if (toBride) {
          log('🏠 ' + desc + ' registered in your name (' + money(value) + ').');
          fx({ happiness: 25, social: 8 }); p.bond = Math.min(100, p.bond + 15); marBumpChem(p, 6);
        } else {
          log('🏠 Moving into ' + desc + ' (in his name).');
          fx({ happiness: 12, social: 4 }); p.bond = Math.min(100, p.bond + 8);
        }
        marRecordMemory('home_provided', p.name + ' provided marital home: ' + home.name, 4);
        marApplyGehazModel(home);
      }
    }]
  };
  S.evId = 'husband_home_' + gameYear();
  return home;
};

/* ---------- IN-LAWS & STRESS ---------- */
window.marVisitMotherInLaw = function() {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (!p || (m.status !== 'engaged' && m.status !== 'married')) return;
  const year = gameYear();
  if (m.lastInLawVisitYear === year) {
    log('👵 You already visited her this year.');
    render(); return;
  }
  const cost = marEGP(1500);
  if (S.wealth < cost) { log('Not enough cash for gifts (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;
  m.lastInLawVisitYear = year;

  if (Math.random() < (m.motherInLawBond > 70 ? 0.15 : 0.35)) {
    m.motherInLawBond = marClamp(m.motherInLawBond - 5, 0, 100);
    if (marHasTrait(p, 'mamas_boy')) p.bond = marClamp(p.bond - 3, 0, 100);
    log('👵 Visited with sweets, but she made critical remarks. (' + money(cost) + ')');
    fx({ happiness: -3 });
  } else {
    m.motherInLawBond = marClamp(m.motherInLawBond + 6, 0, 100);
    if (marHasTrait(p, 'mamas_boy')) p.bond = marClamp(p.bond + 3, 0, 100);
    log('👵 Visited with sweets and helped out. She was pleased. (' + money(cost) + ')');
    fx({ happiness: 2 });
  }
  render();
};

window.marReduceStress = function() {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (m.status !== 'married' || !p) return;
  if (m.lastStressReliefYear === gameYear()) { log('Already took a break this year.'); render(); return; }
  const cost = marEGP(8000);
  if (S.wealth < cost) { log('Not enough cash (' + money(cost) + ').'); render(); return; }
  S.wealth -= cost;
  m.lastStressReliefYear = gameYear();
  m.stress = marClamp(m.stress - 20, 0, 100);
  p.bond = marClamp(p.bond + 2, 0, 100);
  log('🌿 Took a short break together. Stress reduced.');
  fx({ happiness: 4 });
  render();
};

/* ---------- WEDDING PLANNING & CEREMONY ---------- */
window.marOpenWeddingPlanner = function() {
  ensureMarriageState();
  const m = S.marriage, e = m.engagement;
  if (m.status !== 'engaged' || !m.partner || !e || !e.finalized) {
    log('Finalize engagement first.'); render(); return;
  }
  if (!e.partyHeld) {
    log('🎉 Hold the engagement party first (Plan tab) before planning the wedding.'); render(); return;
  }
  if (marIsTraditionalWoman() && S.ownedHomes.length === 0 && !m.husbandHomeProvided) {
    marHusbandProvidesHome();
    if (S.pending) return;
  }
  if (!m.wedding) {
    const pref = m.partner.preferences || {};
    m.wedding = {
      venue: pref.weddingVenue || 'local_hall',
      guests: pref.guestCount || 'medium',
      catering: 'standard', photography: 'professional', dress: 'offrack',
      decoration: 'flowers', music: 'dj', honeymoon: 'egypt_beach',
      planner: 'day_of', payer: marIsTraditionalWoman() ? 'partner_family' : 'self',
      prenup: 'none', financeModel: 'egalitarian'
    };
  }
  render();
};

window.marWeddingSet = function(key, value) {
  const m = S.marriage;
  if (m.status !== 'engaged' || !m.wedding) return;
  m.wedding[key] = value;
  render();
};

window.marCancelWeddingPlanner = function() {
  if (!S.marriage || S.marriage.status !== 'engaged') return;
  if (!confirm('Discard current wedding plan?')) return;
  S.marriage.wedding = null;
  render();
};
/* ============================================================
   WEEK 4: SPOUSE CAREER ASSIGNMENT
   Every married partner gets a real job, salary, and history.
   ============================================================ */
function marAssignPartnerCareer() {
  var m = S.marriage;
  if (!m || !m.partner) return;
  var p = m.partner;
  if (p.career && typeof p.career.working !== 'undefined') return;

  if (typeof carTrackById !== 'function' || typeof carCompaniesFor !== 'function') return;

  var isTraditional = Array.isArray(p.traits) && p.traits.indexOf('traditional') >= 0;
  var startsWorking = !isTraditional || Math.random() < 0.35;

  if (!startsWorking) {
    p.career = {
      working: false,
      track: null,
      level: 0,
      company: null,
      title: 'Homemaker',
      salary: 0,
      assignedYear: gameYear()
    };
    p.income = 0;
    log('🏡 ' + p.name + ' stays home to manage the household.');
    return;
  }

  var tracks = ['business', 'engineering', 'tech', 'teaching', 'nursing', 'accounting', 'law', 'marketing', 'hospitality', 'media'];
  var track = tracks[Math.floor(Math.random() * tracks.length)];
  var pAge = p.age || 25;
  var level = pAge >= 32 ? 2 : (pAge >= 26 ? 1 : 0);
  var trackDef = carTrackById(track);
  if (!trackDef) trackDef = carTrackById('business');
  level = Math.min(level, trackDef.levels.length - 1);
  var levelDef = trackDef.levels[level];
  var baseSalEGP = levelDef.baseSalaryEGP;
  var rate = (C().rate || 1) / 52.7;
  var salaryLocal = Math.round(baseSalEGP * rate);

  var pool = carCompaniesFor(trackDef.industry);
  var company = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : { name: 'Local Firm', payMult: 1.0 };
  salaryLocal = Math.round(salaryLocal * (company.payMult || 1.0));

  p.career = {
    track: track,
    level: level,
    company: company.name,
    title: levelDef.title,
    salary: salaryLocal,
    working: true,
    assignedYear: gameYear(),
    gaps: []
  };
  p.income = salaryLocal;
  log('💼 ' + p.name + ' works as a ' + levelDef.title + ' at ' + company.name + ' (' + money(salaryLocal) + '/year).');
}
window.marAssignPartnerCareer = marAssignPartnerCareer;

/* Safety net: ensure career assigned whenever married */
GameHooks.on('render', function() {
  if (S && S.marriage && S.marriage.status === 'married' && S.marriage.partner) {
    if (typeof marAssignPartnerCareer === 'function') marAssignPartnerCareer();
  }
});
window.marConfirmWedding = function() {
  if (S.pending) return;
  const m = S.marriage, w = m.wedding;
  if (!w) return;
  const isTraditionalWoman = marIsTraditionalWoman();

  if (isTraditionalWoman && m.engagement && m.engagement.finalized && !m.shabkaChosen) {
    log('🪙 Choose your shabka at the gold souk before the wedding (Plan tab).'); render(); return;
  }
  if (S.gender === 'm' && m.propertyDeal === 'bride_name' && !m.propertyDelivered) {
    const h = (S.ownedHomes || []).find(x => !x.isHusbandOwned);
    if (!h) { log('🏠 Her father requires a home registered in her name. Buy one first.'); render(); return; }
  }

  const h = marMaritalHome();
  if (!h) { log('🚨 Cancelled: You have no marital home.'); return; }
  const missing = marMissingGehaz(h);
  if (missing.length > 0) {
    log('⚠️ Marital home not fully furnished yet. Missing: ' + missing.map(i => i.label).join(', '));
       if (typeof marAssignPartnerCareer === 'function') marAssignPartnerCareer();
    render(); return;
  }

  /* Mother-in-law pre-wedding drama */
  if (isTraditionalWoman && m.motherInLawBond < 35 && !m.weddingDramaTriggered) {
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
            (s.family || []).forEach(function(fm) { if (fm.alive !== false) fm.bond = Math.max(0, fm.bond - 15); });
            log('😔 Your family was seated at the back. They were hurt, but the wedding proceeded.');
            fx({ happiness: -8 });
          }
        },
        { label: '📞 Call your father to intervene', effect: function(s) {
            log('📞 Your father called his family. A tense negotiation followed, and a compromise was reached.');
            s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 5);
            fx({ happiness: 3 });
          }
        }
      ]
    };
    S.evId = 'wedding_drama_' + gameYear();
    render();
    return;
  }

  const selection = marGetWeddingSelection(w);

  /* Mother-in-law extra guest interference */
  if (m.motherInLawBond < 30 && Math.random() < 0.5) {
    log('🚨 Your mother-in-law interfered! She added 50 unwanted guests to the wedding list.');
    selection.baseTotalEGP += 250000;
    fx({ happiness: -10 });
  }

  const playerTotalLocal = marEGP(selection.baseTotalEGP * selection.share) + selection.prenupCostLocal;
  if (S.wealth < playerTotalLocal) { log('Not enough cash to pay wedding share.'); render(); return; }

  S.wealth -= selection.prenupCostLocal;
  let prenupRecord = null;
  if (w.prenup !== 'none') {
    const prenupDef = MARRIAGE_PRENUP_OPTIONS.find(o => o.id === w.prenup);
    if (Math.random() < (w.prenup === 'full' ? 0.50 : 0.30)) {
      log('💔 ' + m.partner.name + ' refused the prenup. Wedding postponed.');
      m.partner.bond = Math.max(0, m.partner.bond - 20);
      m.wedding = null;
      render(); return;
    }
    prenupRecord = { type: prenupDef.label, signedYear: gameYear() };
  }

  S.wealth -= (playerTotalLocal - selection.prenupCostLocal);
  m.wealthAtMarriage = Math.max(0, S.wealth);
  m.prenup = prenupRecord;
  m.financeModel = w.financeModel;
  m.status = 'married';
  m.partner.bond = 100;
  m.partner.marriedYear = gameYear();

  if (S.gender === 'm' && m.propertyDeal === 'bride_name' && !m.propertyDelivered) {
    const idx = (S.ownedHomes || []).findIndex(x => !x.isHusbandOwned);
    if (idx >= 0) {
      const deliveredHome = S.ownedHomes[idx];
      m.propertyDelivered = true;
      S.ownedHomes.splice(idx, 1);
      m.homeInWifeName = deliveredHome.name;
      log('🏠 Registered ' + deliveredHome.name + ' under wife\'s name.');
    }
  }

  S.spouse = {
    name: m.partner.name, age: m.partner.age, gender: m.partner.gender,
    bond: m.partner.bond, income: m.partner.income, works: m.partner.income > 0
  };

  marUnlockAchievement('married');
  if (selection.baseTotalEGP < 2000000) marUnlockAchievement('budget_wedding');
  if (selection.baseTotalEGP > 8000000) marUnlockAchievement('dream_wedding');
  marReachMilestone('marriage');

  log('🎉 You married ' + m.partner.name + '! Cost paid: ' + money(playerTotalLocal));
  fx({ happiness: 30 });
     /* SOUL PASS — record the moment */
  if (typeof recordMoment === 'function') {
    recordMoment(
      'The day you married ' + m.partner.name,
      'You stood in front of everyone who mattered to you and said yes. The cake was too sweet. Someone cried.',
      { icon: '💍', key: 'wedding', weight: 3 }
    );
  }
  if (typeof emitReflection === 'function') {
    emitReflection('You are married now. It does not feel as different as you thought it would. It feels like a door closing, gently, behind you.', { mood: 'tender' });
  }

  /* Wedding Day Interactive Event Trigger */
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
      { label: '💸 Pay the extra ' + money(marEGP(3000)), effect: function(s) { if (s.wealth >= marEGP(3000)) { s.wealth -= marEGP(3000); log('You paid. Celebrations continue.'); } else log('❌ Cannot afford.'); } },
      { label: '❌ Decline the extra service', effect: function(s) { log('You declined. The wedding continued without it.'); } }
    ]
  };

  const weddingEventsList = (typeof MARRIAGE_WEDDING_EVENTS !== 'undefined') ? MARRIAGE_WEDDING_EVENTS : [];
  if (weddingEventsList.length > 0) {
    const ev = weddingEventsList[Math.floor(Math.random() * weddingEventsList.length)];
    if (ev.choice && weddingEventChoices[ev.id]) {
      S.pending = {
        title: '💒 ' + ev.title,
        text: ev.text,
        choices: weddingEventChoices[ev.id]
      };
      S.evId = 'wedding_day_' + ev.id + '_' + gameYear();
    } else {
      log('💒 ' + ev.title + ': ' + ev.text);
    }
  }

  render();
};

/* ---------- MARRIED LIFE CONTROLS ---------- */
window.marSetHome = function(homeId) {
  const m = S.marriage;
  const h = MARRIAGE_HOME_OPTIONS.find(x => x.id === homeId);
  if (!h) return;
  const setup = marEGP(h.setupCostEGP);
  if (S.wealth < setup) { log('Need ' + money(setup) + ' for setup.'); render(); return; }
  S.wealth -= setup;
  m.home = homeId;
  m.homeSetupPaid = true;
  log('🏠 Home set: ' + h.label);
  render();
};

window.marSetFamilyPlanning = function(id) {
  S.marriage.familyPlanning = id;
  log('👶 Family planning updated.');
  render();
};

window.marSetChildcare = function(id) {
  S.marriage.childcare = id;
  log('👶 Childcare plan updated.');
  render();
};

window.marDepositShared = function() {
  const amt = Math.round(Number(prompt('Deposit how much?\nYou have ' + money(S.wealth), '10000')));
  if (!amt || amt <= 0 || S.wealth < amt) return;
  S.wealth -= amt;
  S.marriage.sharedAccountBalance += amt;
  log('💰 Deposited ' + money(amt));
  render();
};

window.marWithdrawShared = function() {
  const amt = Math.round(Number(prompt('Withdraw how much?\nAvailable ' + money(S.marriage.sharedAccountBalance), '10000')));
  if (!amt || amt <= 0 || S.marriage.sharedAccountBalance < amt) return;
  S.marriage.sharedAccountBalance -= amt;
  S.wealth += amt;
  log('💰 Withdrew ' + money(amt));
  render();
};

window.marTryForBaby = function() {
  if (!S.marriage.partner || S.pregnantMonths > 0) return;
  const ageToUse = S.gender === 'f' ? S.age : S.marriage.partner.age;
  const chance = ageToUse > 40 ? 0.15 : ageToUse > 35 ? 0.35 : ageToUse > 30 ? 0.55 : 0.75;
  if (Math.random() < chance) {
    S.pregnantMonths = 1;
    S.marriage.partner.bond = Math.min(100, S.marriage.partner.bond + 10);
    S.pending = {
      title: '🎉 Expecting a Baby!',
      text: 'You and ' + S.marriage.partner.name + ' are expecting a baby!',
      choices: [
        { label: '💐 Share with families', effect: (s) => {
            (s.family || []).forEach(f => { if (f.alive !== false) f.bond = Math.min(100, f.bond + 10); });
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 10);
            fx({ happiness: 15 });
          }
        },
        { label: '🤫 Keep private for now', effect: () => fx({ happiness: 8 }) }
      ]
    };
    S.evId = 'pregnancy_' + gameYear();
  } else {
    log('Not this time. Keep trying.');
    fx({ happiness: -2 });
  }
  render();
};

/* ---------- CONFLICTS & DIVORCE ---------- */
window.marResolveConflict = function(mode) {
  const m = S.marriage;
  if (!m.pendingConflict || !m.partner) return;
  const topic = (MARRIAGE_CONFLICT_TOPICS || []).find(x => x.id === m.pendingConflict);

  if (mode === 'discuss') {
    if (Math.random() < 0.6 + (m.partner.bond / 500)) {
      m.partner.bond = Math.min(100, m.partner.bond + 8);
      log('💬 Resolved calmly. Bond +8.');
    } else {
      m.partner.bond = Math.max(0, m.partner.bond - 5);
      log('😞 Conversation was difficult. Bond -5.');
    }
  } else if (mode === 'counsel') {
    const cost = marEGP(5000);
    if (S.wealth < cost) { log('Not enough cash for counselling.'); render(); return; }
    S.wealth -= cost;
    m.partner.bond = Math.min(100, m.partner.bond + 12);
    log('🧠 Counselling helped. Bond +12.');
  } else {
    m.partner.bond = Math.max(0, m.partner.bond - 10);
    log('😶 Issue ignored. Bond -10.');
  }

  m.conflictHistory.push({ year: gameYear(), topic: topic ? topic.label : m.pendingConflict, resolution: mode });
  m.pendingConflict = null;
  render();
};

window.marSeparationOption = function(optionId) {
  const opt = (MARRIAGE_SEPARATION_OPTIONS || []).find(x => x.id === optionId);
  if (!opt) return;
  const cost = marEGP(opt.costEGP);
  if (S.wealth < cost) { log('Not enough cash.'); render(); return; }
  S.wealth -= cost;
  const p = S.marriage.partner;
  p.bond = marClamp(p.bond + (opt.bondEffect || 0), 0, 100);
  log('💬 ' + opt.label + '. ' + opt.desc);
  render();
};

window.marAskForDivorce = function() {
  ensureMarriageState();
  const m = S.marriage, p = m.partner;
  if (!p || m.status !== 'married') return;

  const causes = MARRIAGE_DIVORCE_CAUSES.map(c => c.id + ' = ' + c.label).join('\n');
  const choice = prompt('Why divorce?\n\n' + causes + '\n\nEnter cause id:', 'boredom');
  if (!choice) return;
  const cause = MARRIAGE_DIVORCE_CAUSES.find(c => c.id === choice.trim());
  if (!cause) { log('Unknown cause.'); return; }

  const law = MARRIAGE_DIVORCE_LAWS[S.country] || MARRIAGE_DIVORCE_LAWS.egy;
  const courtFee = marEGP(law.courtFeeEGP);
  const trad = marIsTraditionalWoman();
  const fullPrenup = !!(m.prenup && m.prenup.type === 'Comprehensive Financial Agreement');
  const myInc = S.job ? Number(S.job.salary || 0) : 0;
  const herInc = Number(p.income || 0);
  const lines = [];
  let net = 0;

  const sharedBack = Math.round((m.sharedAccountBalance || 0) * 0.5);

  if (law.assetSplit === '50_50' && !fullPrenup) {
    const base = (typeof m.wealthAtMarriage === 'number') ? m.wealthAtMarriage : Math.round(S.wealth * 0.5);
    const gained = Math.max(0, S.wealth - base);
    const split = Math.floor(gained * 0.5);
    if (split > 0) { net += split; lines.push('Asset split: ' + money(split)); }
  }

  const mahrDef = Number(m.mahrDeferred || 0);
  if (mahrDef > 0) {
    if (S.gender === 'm') { net += mahrDef; lines.push('Deferred mahr you owe: ' + money(mahrDef)); }
    else { net -= mahrDef; lines.push('Deferred mahr you receive: ' + money(mahrDef)); }
  }

  const years = typeof law.alimonyYears === 'number' ? law.alimonyYears : 0;
  if (years > 0) {
    const iPay = trad ? (S.gender === 'm') : (myInc > herInc);
    const payerInc = iPay ? myInc : herInc;
    const alimony = Math.round(payerInc * 0.15 * years);
    if (alimony > 0) {
      net += iPay ? alimony : -alimony;
      lines.push((iPay ? 'Alimony you pay: ' : 'Alimony you receive: ') + money(alimony));
    }
  }

  const children = S.childrenList || [];
  let custody = null, support = null;
  if (children.length > 0) {
    const joint = law.custody === 'joint';
    const iHaveCustody = S.gender === 'f';
    custody = joint ? 'Joint custody' : (iHaveCustody ? 'You have primary custody' : p.name + ' has primary custody');
    const youngest = Math.min(...children.map(c => Number(c.age) || 0));
    const untilYear = gameYear() + Math.max(1, 18 - youngest);
    const pct = Math.min(0.5, Number(law.childSupportPct || 0.15) * children.length);

    let amount = 0, direction = 'receive';
    if (!joint) {
      if (iHaveCustody) { amount = Math.round(herInc * pct); direction = 'receive'; }
      else { amount = Math.round(myInc * pct); direction = 'pay'; }
    } else {
      const diff = myInc - herInc;
      amount = Math.round(Math.abs(diff) * pct);
      direction = diff > 0 ? 'pay' : 'receive';
    }
    if (amount > 0) {
      support = { direction, amount, untilYear, arrears: 0 };
      lines.push('Child support (' + direction + '): ' + money(amount) + '/yr until ' + untilYear);
    }
  }

  const upfront = courtFee + net - sharedBack;
  const msg = 'Divorce under ' + law.label + ':\n\nCourt fee: ' + money(courtFee) + '\n' +
    (lines.length ? lines.join('\n') + '\n' : '') +
    (sharedBack > 0 ? 'Half shared account: +' + money(sharedBack) + '\n' : '') +
    'Custody: ' + (custody || 'N/A') + '\n\nNet upfront: ' + money(Math.abs(upfront)) + '\n\nProceed?';

  if (!confirm(msg)) return;
  if (upfront > 0 && S.wealth < upfront) { log('Not enough cash for divorce (' + money(upfront) + ').'); render(); return; }
  S.wealth -= upfront;

  m.exSpouses.push({
    name: p.name, marriedYear: p.marriedYear || gameYear(), divorcedYear: gameYear(),
    reason: cause.label, support, custody, remarried: false
  });

  m.partner = null; m.status = 'divorced'; m.wedding = null; m.engagement = null;
  m.financeModel = null; m.sharedAccountBalance = 0; m.home = null; m.homeSetupPaid = false;
  m.prenup = null; m.pendingConflict = null; m.trousseauComplete = false;
  m.motherInLawBond = 50; m.stress = 20; m.mahrAdvanced = 0; m.mahrDeferred = 0;
  delete m.wealthAtMarriage;
  m.tab = 'overview';
  S.spouse = null;

  /* Clean up husband-owned property */
  const lost = (S.ownedHomes || []).filter(h => h.isHusbandOwned);
  if (lost.length) {
    S.ownedHomes = S.ownedHomes.filter(h => !h.isHusbandOwned);
    if (!S.ownedHomes.some(h => h.status === 'occupied')) S.housing = 'parents';
    log('🏠 Moved out of home in his name.');
  }

  log('💔 Divorced ' + p.name + '.');
  fx({ happiness: -25 });
     if (typeof recordMoment === 'function') {
    recordMoment(
      'The day you divorced ' + p.name,
      'The paperwork was surprisingly fast. You walked out into a normal day. Nothing dramatic. That was the strange part.',
      { icon: '💔', key: 'divorce', weight: 3 }
    );
  }
  if (typeof checkReflectionTriggers === 'function') {
    checkReflectionTriggers('divorce', { ex: p.name });
  }
  render();
};

/* Special Events */
window.marFamilyIntervention = function() {
  if (S.pending) return;
  const p = S.marriage.partner;
  if (!p || S.marriage.status !== 'dating') return;
  if (marFamilyApproval(p) >= 0.50 || S.marriage.flags_familyWarning) return;
  S.marriage.flags_familyWarning = true;

  S.pending = {
    title: '👨‍👩‍👧 Family Intervention',
    text: 'Your family urges you to end the relationship with ' + p.name + '.',
    choices: [
      { label: 'Break up to please family', effect: (s) => {
          s.marriage.partner = null; s.marriage.status = 'single';
          log('💔 Ended relationship.'); fx({ happiness: -20 });
        }
      },
      { label: 'Fight for the relationship', effect: () => {
          p.bond = Math.min(100, p.bond + 15);
          log('⚔️ You stood by your partner.');
        }
      }
    ]
  };
  S.evId = 'family_intervention';
  render();
};

window.marCheatingDiscovery = function() {
  if (S.pending) return;
  const p = S.marriage.partner;
  if (!p) return;
  S.pending = {
    title: '💔 Betrayal',
    text: 'You found messages showing ' + p.name + ' was seeing someone else.',
    choices: [
      { label: 'Forgive and rebuild trust', effect: () => {
          p.bond = Math.max(0, p.bond - 15);
          p.trust = Math.max(0, p.trust - 30);
          log('Forgiven, but trust is fractured.');
        }
      },
      { label: 'Demand divorce', effect: (s) => {
          marAskForDivorce();
        }
      }
    ]
  };
  S.evId = 'cheating_' + gameYear();
  render();
};

window.marExAppears = function(exName) {
  if (S.pending) return;
  const p = S.marriage.partner;
  if (!p) return;
  S.pending = {
    title: '💔 His Ex Reappears',
    text: exName + ' texted ' + p.name + ' wanting to meet.',
    choices: [
      { label: 'Trust him to handle it', effect: () => {
          p.trust = Math.min(100, p.trust + 5);
          log('Handled with maturity.');
        }
      },
      { label: 'Demand he block her', effect: () => {
          p.bond = Math.max(0, p.bond - 5);
          log('Number blocked after tension.');
        }
      }
    ]
  };
  S.evId = 'ex_appears_' + gameYear();
  render();
};

window.marPolygamyThreat = function() {
  if (S.pending) return;
  const p = S.marriage.partner;
  if (!p) return;
  S.pending = {
    title: '💍 Difficult Conversation',
    text: p.name + ' mentions family pressure regarding taking a second wife.',
    choices: [
      { label: '"If you marry again, I will leave."', effect: () => {
          p.bond = Math.min(100, p.bond + 15);
          log('He reassured you that it will never happen.');
        }
      },
      { label: 'Stay silent', effect: () => {
          p.bond = Math.max(0, p.bond - 10);
        }
      }
    ]
  };
  S.evId = 'polygamy_threat_' + gameYear();
  render();
};

/* ---------- ANNUAL EVENT DISPATCHER ---------- */
function marFireYearEvent(evt) {
  const p = S.marriage.partner;
  if (!p || !evt) return;

  /* ---------- Flavor / automated events ---------- */
  if (evt.id === 'partner_promotion') {
    p.income = Math.round((p.income || 50000) * 1.15);
    log('🎉 ' + p.name + ' got promoted. Income now ' + money(p.income) + '/yr.');
    log(p.name + ': "I got the promotion! We should celebrate this weekend."');
    p.bond = Math.min(100, p.bond + 5);
    fx({ happiness: 5 });
    return;
  }

  if (evt.id === 'partner_lost_job') {
    p.income = 0;
    log('😔 ' + p.name + ' lost their job.');
    log(p.name + ': "I do not know what to say. They just let me go."');
    p.bond = Math.max(0, p.bond - 5);
    fx({ happiness: -5 });
    return;
  }

  if (evt.id === 'unexpected_bill') {
    const cost = marEGP(20000);
    if (S.wealth >= cost) {
      S.wealth -= cost;
      log('💸 Unexpected household bill: ' + money(cost) + '.');
      log(p.name + ': "Of course it happened this month. Just our luck."');
    }
    return;
  }

  if (evt.id === 'home_upgrade') {
    log('🏠 ' + p.name + ' wants more space. "We should look at bigger places."');
    return;
  }

  if (evt.id === 'career_move') {
    log('💼 ' + p.name + ' received a career offer in another city.');
    log(p.name + ': "It is a big opportunity. But it means we would have to move."');
    return;
  }

  if (evt.id === 'family_pressure') {
    log('👵 Relatives are asking questions about your private plans.');
    log(p.name + ': "My mother called again. She wants to know everything."');
    return;
  }

  if (evt.id === 'forgotten_anniversary') {
    if (p.bond > 30) {
      p.bond = Math.max(0, p.bond - 5);
      log('😞 You forgot an important date. ' + p.name + ': "I guess it did not matter."');
      fx({ happiness: -4 });
    }
    return;
  }

  if (evt.id === 'shared_goal') {
    log('🎯 ' + p.name + ': "I have been thinking about saving toward something real. Together."');
    return;
  }

  if (evt.id === 'partner_study') {
    log('📚 ' + p.name + ': "I want to go back and study. Would you support that?"');
    return;
  }

  if (evt.id === 'holiday_planning') {
    log('🎉 You and ' + p.name + ' planned the upcoming holidays together.');
    return;
  }

  if (evt.id === 'household_chores') {
    if (p.bond > 25) {
      p.bond = Math.max(0, p.bond - 2);
      log('🧹 ' + p.name + ': "Can you help more around the house? I am exhausted."');
      fx({ happiness: -2 });
    }
    return;
  }

  if (evt.id === 'old_friend') {
    log('👥 An old friend contacted ' + p.name + '. He seemed happy about it.');
    return;
  }

  if (evt.id === 'financial_review') {
    log('💰 You and ' + p.name + ' sat down for an annual financial review.');
    return;
  }

  if (evt.id === 'relationship_milestone') {
    log('💞 ' + p.name + ': "You know... we have come a long way. I am glad it is you."');
    p.bond = Math.min(100, p.bond + 2);
    return;
  }

  /* ---------- INTERACTIVE events with husband dialogue ---------- */
  if (S.pending) return;

  if (evt.id === 'anniversary') {
    S.pending = {
      title: '💍 Your Anniversary with ' + p.name,
      text: p.name + ' has been hinting at this day for weeks.\n\n' + p.name + ': "So... do you remember what today is?"',
      choices: [
        { label: 'Buy a gift + take him somewhere special (' + money(marEGP(8000)) + ')', effect: function(s) {
            if (s.wealth >= marEGP(8000)) {
              s.wealth -= marEGP(8000);
              p.bond = Math.min(100, p.bond + 15);
              fx({ happiness: 10 });
              log(p.name + ': "You remembered. I love you so much."');
            } else {
              log(p.name + ': "You forgot? And you cannot even make it up to me?"');
              p.bond = Math.max(0, p.bond - 8);
            }
          }
        },
        { label: 'Homemade dinner + handwritten card (' + money(marEGP(500)) + ')', effect: function(s) {
            if (s.wealth >= marEGP(500)) {
              s.wealth -= marEGP(500);
              p.bond = Math.min(100, p.bond + 8);
              fx({ happiness: 4 });
              log(p.name + ': "This is so sweet. Thank you."');
            }
          }
        },
        { label: 'Admit you forgot', effect: function(s) {
            p.bond = Math.max(0, p.bond - 18);
            fx({ happiness: -6 });
            log(p.name + ': "I cannot believe you forgot our anniversary."');
          }
        }
      ]
    };
    return;
  }

  if (evt.id === 'partner_bond_warning') {
    S.pending = {
      title: '💬 ' + p.name + ' Seems Distant',
      text: 'Conversations have been short lately. He is quieter than usual.\n\n' + p.name + ': "I am fine." (He is clearly not fine.)',
      choices: [
        { label: 'Sit down and really listen', effect: function(s) {
            p.bond = Math.min(100, p.bond + 10);
            p.trust = Math.min(100, (p.trust || 50) + 5);
            fx({ happiness: 4 });
            log(p.name + ': "Thank you for listening. I feel lighter."');
          }
        },
        { label: 'Give him space', effect: function(s) {
            p.bond = Math.max(0, p.bond - 4);
            log(p.name + ': "I just need to be alone for a bit."');
          }
        },
        { label: 'Push him to talk now', effect: function(s) {
            p.bond = Math.max(0, p.bond - 8);
            fx({ happiness: -3 });
            log(p.name + ': "Not everything has to be a conversation. Give me a minute!"');
          }
        }
      ]
    };
    return;
  }

  if (evt.id === 'partner_wants_gift') {
    S.pending = {
      title: '🎁 ' + p.name + ' Hints at a Gift',
      text: p.name + ': "I saw this thing at the mall... it is not that expensive. What do you think?"',
      choices: [
        { label: 'Buy it (' + money(marEGP(15000)) + ')', effect: function(s) {
            if (s.wealth >= marEGP(15000)) {
              s.wealth -= marEGP(15000);
              p.bond = Math.min(100, p.bond + 12);
              fx({ happiness: 6 });
              log(p.name + ': "You got it! You are the best."');
            } else {
              log(p.name + ': "You cannot afford it? I see."');
              p.bond = Math.max(0, p.bond - 3);
            }
          }
        },
        { label: 'Acknowledge the hint but defer', effect: function(s) {
            p.bond = Math.max(0, p.bond - 2);
            log(p.name + ': "Maybe next time."');
          }
        },
        { label: 'Ignore the hint', effect: function(s) {
            p.bond = Math.max(0, p.bond - 6);
            log(p.name + ': "Never mind. Forget I said anything."');
          }
        }
      ]
    };
    return;
  }

  if (evt.id === 'partner_wants_trip') {
    S.pending = {
      title: '✈️ ' + p.name + ' Wants a Vacation',
      text: p.name + ': "We never go anywhere. Just us, a weekend away somewhere. Please?"',
      choices: [
        { label: 'Book a weekend trip (' + money(marEGP(20000)) + ')', effect: function(s) {
            if (s.wealth >= marEGP(20000)) {
              s.wealth -= marEGP(20000);
              p.bond = Math.min(100, p.bond + 14);
              p.chemistry = Math.min(100, (p.chemistry || 50) + 8);
              fx({ happiness: 10 });
              log(p.name + ': "Best weekend ever. I feel so close to you."');
            } else {
              log(p.name + ': "Okay. Someday, I guess."');
            }
          }
        },
        { label: 'Suggest a staycation', effect: function(s) {
            p.bond = Math.min(100, p.bond + 4);
            log(p.name + ': "I suppose a staycation works. For now."');
          }
        },
        { label: 'Say no, we cannot afford it', effect: function(s) {
            p.bond = Math.max(0, p.bond - 7);
            log(p.name + ': "Fine. Forget I asked."');
          }
        }
      ]
    };
    return;
  }

  if (evt.id === 'partner_wants_child') {
    S.pending = {
      title: '👶 ' + p.name + ' Wants a Child',
      text: p.name + ': "I have been thinking about this for a while. Maybe we are ready? A baby."',
      choices: [
        { label: 'Yes — let us try', effect: function(s) {
            p.bond = Math.min(100, p.bond + 12);
            fx({ happiness: 8 });
            log(p.name + ': "You have made me the happiest man alive."');
            log('💡 Try for a baby from the Children tab.');
          }
        },
        { label: 'Not yet — but soon', effect: function(s) {
            p.bond = Math.max(0, p.bond - 4);
            log(p.name + ': "I understand. But please, do not make me wait forever."');
          }
        },
        { label: 'I do not want children', effect: function(s) {
            p.bond = Math.max(0, p.bond - 20);
            s.marriage.pendingConflict = 'children';
            fx({ happiness: -6 });
            log(p.name + ': "Then maybe we are not the right fit. I need time to think."');
          }
        }
      ]
    };
    return;
  }

  if (evt.id === 'inlaws_visit') {
    S.pending = {
      title: '👵 In-Laws Visit',
      text: 'Your mother-in-law announces she is coming to stay for a week.\n\n' + p.name + ': "It is only a week. She misses us."',
      choices: [
        { label: '🏠 Host her graciously', effect: function(s) {
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 15);
            s.wealth -= marEGP(3000);
            log('👵 You hosted her with patience. Bond +15.');
            fx({ happiness: -2 });
          }
        },
        { label: '😤 Push back on her comments', effect: function(s) {
            s.marriage.motherInLawBond = Math.max(0, s.marriage.motherInLawBond - 20);
            p.bond = Math.min(100, p.bond + 5);
            log(p.name + ': "Thank you for defending us. I know she can be a lot."');
            fx({ happiness: 3 });
          }
        },
        { label: '🤐 Stay silent, keep the peace', effect: function(s) {
            s.marriage.motherInLawBond = Math.min(100, s.marriage.motherInLawBond + 5);
            p.bond = Math.max(0, p.bond - 2);
            log(p.name + ': "You barely said anything. It is fine, I guess."');
            fx({ happiness: -3 });
          }
        }
      ]
    };
    return;
  }
}

/* ============================================================
   SINGLE CONSOLIDATED ANNUAL TICK
   ============================================================ */
GameHooks.on('year', function() {
  ensureMarriageState();
  if (!S || !S.marriage) return;
  const m = S.marriage;
  const p = m.partner;

  /* 1. Child support settlements */
  (m.exSpouses || []).forEach(ex => {
    const s = ex.support;
    if (!s || !s.amount) return;
    if (gameYear() > s.untilYear) {
      log('✅ Child support for ' + ex.name + '\'s children has concluded (children reached adulthood).');
      ex.support = null; return;
    }
    if (s.direction === 'receive') {
      S.wealth += s.amount;
      log('💸 Received child support from ' + ex.name + ': +' + money(s.amount));
    } else {
      const due = s.amount + (s.arrears || 0);
      if (S.wealth >= due) {
        S.wealth -= due; s.arrears = 0;
        log('💸 Paid child support to ' + ex.name + ': -' + money(due));
      } else {
        s.arrears = due;
        log('⚠️ Overdue child support to ' + ex.name + ': ' + money(due));
        fx({ happiness: -4 });
      }
    }
  });

  if (!p) return;
  p.age++;

  /* 2. Bond and Income */
  let bondDelta = -2;
  (p.traits || []).forEach(tid => {
    const t = marTrait(tid);
    if (t) bondDelta += (t.bondPerYear || 0);
  });
  p.bond = marClamp(p.bond + bondDelta, 0, 100);

  if (p.income > 0) {
    const ambitious = marHasTrait(p, 'ambitious') || marHasTrait(p, 'career_focused');
    p.income = Math.round(p.income * (ambitious ? 1.06 : 1.03));
  }

  /* 3. Housing costs */
  if (m.home) {
    const h = (MARRIAGE_HOME_OPTIONS || []).find(x => x.id === m.home);
    if (h) {
      const yearly = marEGP(h.monthlyCostEGP * 12);
      if (S.wealth >= yearly) S.wealth -= yearly;
      else log('⚠️ Could not pay home maintenance costs (' + money(yearly) + ').');
    }
  }

  /* 4. Chemistry yearly drift */
  const c = marEnsureChem(p);
  marBumpChem(p, p.bond > 70 ? 1 : -2);
  if (c > 75) p.bond = marClamp(p.bond + 2, 0, 100);
  else if (c < 25) p.bond = marClamp(p.bond - 2, 0, 100);

  /* 5. Dating interventions and proposals */
  if (m.status === 'dating') {
    if (Math.random() < 0.25) marFamilyIntervention();
    if (marIsTraditionalWoman() && p.bond >= 65 && p.trust >= 60 && !p.pendingPartnerProposal && Math.random() < 0.25) {
      marTriggerProposalEvent(p);
      return;
    }
  }

  /* 6. Married Life: Stress and Low Bond Divorce */
  if (m.status === 'married') {
    const kids = (S.childrenList || []).length;
    const totalIncome = (S.job ? Number(S.job.salary || 0) : 0) + Number(p.income || 0);
    let stressDelta = -3;
    if (totalIncome <= 0) stressDelta += 15;
    stressDelta += 2 * Math.min(kids, 4);
    if (m.motherInLawBond < 35) stressDelta += 4;
    if (!marMaritalHome() && !m.home) stressDelta += 4;
    if (p.bond > 75) stressDelta -= 5;
    m.stress = marClamp(m.stress + stressDelta, 0, 100);

    if (m.stress > 70) {
      p.bond = marClamp(p.bond - 3, 0, 100);
      if (!m.pendingConflict && Math.random() < 0.25 && typeof MARRIAGE_CONFLICT_TOPICS !== 'undefined') {
        const topic = MARRIAGE_CONFLICT_TOPICS[Math.floor(Math.random() * MARRIAGE_CONFLICT_TOPICS.length)];
        m.pendingConflict = topic.id;
        log('⚔️ Pressure led to a dispute: ' + topic.label);
      }
    }

    if (p.bond < 20 && Math.random() < 0.25) {
      log('💔 ' + p.name + ' filed for divorce due to low bond.');
      marAskForDivorce();
      return;
    }

    if (!S.pending && p.trust < 40 && Math.random() < 0.1) {
      if (marHasTrait(p, 'jealous') || marHasTrait(p, 'impulsive')) {
        marCheatingDiscovery();
        return;
      }
    }

    if (marIsTraditionalWoman() && p.marriedYear && (gameYear() - p.marriedYear >= 3) && m.motherInLawBond < 40 && Math.random() < 0.08) {
      marPolygamyThreat();
      return;
    }

    /* Partner's Ex Reappears */
    if (!S.pending && p.trust < 70 && Math.random() < 0.05) {
      const exNames = ['Layla', 'Sara', 'Nadia', 'Dina', 'Rania', 'Mona', 'Huda', 'Yasmin'];
      const exName = exNames[Math.floor(Math.random() * exNames.length)];
      marExAppears(exName);
      return;
    }

    /* Annual Marriage Random Events */
    if (typeof MARRIAGE_YEAR_EVENTS !== 'undefined' && Math.random() < 0.50 && !S.pending) {
      const eligible = MARRIAGE_YEAR_EVENTS.filter(e => {
        if (e.requiresNoChildren && (S.childrenList && S.childrenList.length > 0)) return false;
        return true;
      });
      const totalWeight = eligible.reduce((s, e) => s + e.weight, 0);
      if (totalWeight > 0) {
        let roll = Math.random() * totalWeight;
        for (let i = 0; i < eligible.length; i++) {
          roll -= eligible[i].weight;
          if (roll <= 0) { marFireYearEvent(eligible[i]); break; }
        }
      }
    }

    /* Anniversaries & Milestones */
    if (p.marriedYear) {
      const yrs = gameYear() - p.marriedYear;
      if (yrs >= 1) marReachMilestone('first_anniversary');
      if (yrs >= 5) { marReachMilestone('five_years'); marUnlockAchievement('anniversary_5'); }
      if (yrs >= 10) { marReachMilestone('ten_years'); marUnlockAchievement('anniversary_10'); }
      if (yrs >= 25) { marReachMilestone('twenty_five_years'); marUnlockAchievement('anniversary_25'); }
    }
  }
});

/* ---------- 8. REGISTER TAB ---------- */
GameHooks.registerTab({ id: 'marriage', label: '💍 Marriage', order: 9, view: marriageView });
