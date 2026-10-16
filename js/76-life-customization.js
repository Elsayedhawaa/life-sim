/* =====================================================================
   76. LIFE CUSTOMIZATION — Family wealth, parents, siblings, business
   - 6 wealth tiers from Poor to Ultra-Wealthy
   - Parent personality traits affecting the whole game
   - Family business / reputation / occupation
   - Sibling count and ages
   - Everything connects: education, housing, gifts, career, marriage
   - Rich families give money, poor families ask for money
   Load AFTER 75-education-parttime-cleanup.js and BEFORE 99-boot.js
   ===================================================================== */

function p76Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p76Idx()  { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p76EGP(egp) { return Math.round(egp * p76Idx()); }

/* =================================================================
   1. WEALTH TIER DEFINITIONS
   ================================================================= */
const P76_TIERS = {
  poor: {
    id: 'poor', order: 0,
    name: 'Poor', label: 'Poor (فقير)',
    icon: '🛖',
    desc: 'Your family struggles to cover basics. Government school only, no pocket money, and every expense is a decision.',
    startWealthEGP: 0,
    homeType: 'crowded',
    homeDesc: 'Small shared flat, sometimes with extended family',
    pocketMoneyBase: 0,
    schoolTier: 'national',
    giftChance: 0.05,
    giftScale: 0.3,
    carGift: 'never',
    apartmentGift: 'never',
    tuitionSupport: 0.05,
    businessChance: 0,
    requestFrequency: 'high',
    requestScale: 1.3,
    reputation: 20
  },
  lower_mid: {
    id: 'lower_mid', order: 1,
    name: 'Lower-middle', label: 'Lower-middle (متوسط بسيط)',
    icon: '🏚️',
    desc: 'You have the basics but no extras. National school. Some pocket money. Hard work expected.',
    startWealthEGP: 500,
    homeType: 'small_flat',
    homeDesc: 'Small 2-bedroom older flat',
    pocketMoneyBase: 80,
    schoolTier: 'national',
    giftChance: 0.15,
    giftScale: 0.5,
    carGift: 'never',
    apartmentGift: 'never',
    tuitionSupport: 0.3,
    businessChance: 0.05,
    requestFrequency: 'medium',
    requestScale: 1.0,
    reputation: 35
  },
  middle: {
    id: 'middle', order: 2,
    name: 'Middle class', label: 'Middle class (متوسط)',
    icon: '🏢',
    desc: 'A comfortable apartment, private school possible, modest allowance. Parents help with tuition if you earn it.',
    startWealthEGP: 8000,
    homeType: 'apartment',
    homeDesc: '3-bedroom apartment in a decent neighbourhood',
    pocketMoneyBase: 300,
    schoolTier: 'private',
    giftChance: 0.40,
    giftScale: 1.0,
    carGift: 'used_possible',
    apartmentGift: 'partial',
    tuitionSupport: 0.7,
    businessChance: 0.15,
    requestFrequency: 'low',
    requestScale: 0.7,
    reputation: 55
  },
  upper_mid: {
    id: 'upper_mid', order: 3,
    name: 'Upper-middle', label: 'Upper-middle class (متوسط مرتفع)',
    icon: '🏘️',
    desc: 'Compound living, private schooling, generous allowance. Used car at 18. Family supports your ambitions.',
    startWealthEGP: 60000,
    homeType: 'compound_flat',
    homeDesc: 'Modern compound apartment or small villa',
    pocketMoneyBase: 1500,
    schoolTier: 'private',
    giftChance: 0.65,
    giftScale: 1.8,
    carGift: 'used_likely',
    apartmentGift: 'full',
    tuitionSupport: 0.95,
    businessChance: 0.35,
    requestFrequency: 'never',
    requestScale: 0,
    reputation: 72
  },
  wealthy: {
    id: 'wealthy', order: 4,
    name: 'Wealthy', label: 'Wealthy (غني)',
    icon: '🏰',
    desc: 'A villa in a gated compound, international school, private tutors. New car at 18. Family has a business and connections.',
    startWealthEGP: 500000,
    homeType: 'villa',
    homeDesc: 'Family villa with garden, pool, and staff',
    pocketMoneyBase: 5000,
    schoolTier: 'international',
    giftChance: 0.85,
    giftScale: 3.5,
    carGift: 'new_likely',
    apartmentGift: 'full_plus',
    tuitionSupport: 1.0,
    businessChance: 0.65,
    requestFrequency: 'never',
    requestScale: 0,
    reputation: 88
  },
  ultra: {
    id: 'ultra', order: 5,
    name: 'Ultra-wealthy', label: 'Ultra-wealthy (ثري جداً)',
    icon: '🏛️',
    desc: 'An estate or mansion, chauffeured cars, staff, overseas properties. Your family name opens doors across Egypt. Inheritance will be very significant.',
    startWealthEGP: 5000000,
    homeType: 'mansion',
    homeDesc: 'Mansion or gated estate with multiple staff',
    pocketMoneyBase: 25000,
    schoolTier: 'international',
    giftChance: 0.95,
    giftScale: 8.0,
    carGift: 'luxury',
    apartmentGift: 'luxury',
    tuitionSupport: 1.0,
    businessChance: 0.9,
    requestFrequency: 'never',
    requestScale: 0,
    reputation: 98
  }
};

/* =================================================================
   2. PARENT PERSONALITY TRAITS
   ================================================================= */
const P76_PARENT_PRESETS = {
  balanced: {
    id: 'balanced', label: 'Balanced & supportive',
    icon: '⚖️',
    desc: 'Parents who balance warmth with expectations. Reasonable on most things.',
    strictness: 5, warmth: 7, generosity: 6, ambitionFocus: 'balanced', traditional: 5, religious: 5
  },
  strict: {
    id: 'strict', label: 'Strict & demanding',
    icon: '👨‍🏫',
    desc: 'High expectations on grades and behaviour. Rules are rules.',
    strictness: 9, warmth: 4, generosity: 4, ambitionFocus: 'academic', traditional: 7, religious: 7
  },
  warm: {
    id: 'warm', label: 'Warm & lenient',
    icon: '🤗',
    desc: 'Affectionate and forgiving. More likely to say yes to requests.',
    strictness: 3, warmth: 9, generosity: 8, ambitionFocus: 'balanced', traditional: 4, religious: 4
  },
  traditional: {
    id: 'traditional', label: 'Traditional & religious',
    icon: '🕌',
    desc: 'Strong family values, respect for elders, religious practice. Marriage expectations.',
    strictness: 7, warmth: 7, generosity: 6, ambitionFocus: 'balanced', traditional: 9, religious: 9
  },
  business: {
    id: 'business', label: 'Business-focused',
    icon: '💼',
    desc: 'Success-oriented. Connections matter. Money is discussed openly.',
    strictness: 6, warmth: 5, generosity: 7, ambitionFocus: 'business', traditional: 5, religious: 3
  },
  artistic: {
    id: 'artistic', label: 'Artistic & modern',
    icon: '🎨',
    desc: 'Creative freedom encouraged. Less pressure on traditional milestones.',
    strictness: 3, warmth: 8, generosity: 5, ambitionFocus: 'artistic', traditional: 2, religious: 2
  },
  absent: {
    id: 'absent', label: 'Distant & hands-off',
    icon: '🌫️',
    desc: 'Parents present but emotionally distant. Financial support varies.',
    strictness: 4, warmth: 2, generosity: 3, ambitionFocus: 'balanced', traditional: 4, religious: 3
  }
};

/* =================================================================
   3. FAMILY OCCUPATION (affects environment + career help)
   ================================================================= */
const P76_OCCUPATIONS = [
  { id: 'none',       name: 'Not applicable (poor / no steady work)', minTier: 0, connections: 0 },
  { id: 'gov',        name: 'Government employee',                     minTier: 1, connections: 15, desc: 'Modest salary but stable. Knows people in the ministries.' },
  { id: 'teacher',    name: 'Teacher / academic',                      minTier: 1, connections: 20, desc: 'Education is deeply valued. Knows professors.' },
  { id: 'doctor',     name: 'Doctor',                                  minTier: 2, connections: 40, desc: 'Respected profession. Medical network.' },
  { id: 'engineer',   name: 'Engineer',                                minTier: 2, connections: 35, desc: 'Technical background. Construction contacts.' },
  { id: 'army',       name: 'Military / police officer',               minTier: 2, connections: 45, desc: 'Discipline. State connections.' },
  { id: 'business',   name: 'Business owner (SME)',                    minTier: 3, connections: 55, desc: 'Owns a small-to-mid company.' },
  { id: 'importer',   name: 'Importer / trader',                       minTier: 3, connections: 50, desc: 'Trade networks in Egypt and abroad.' },
  { id: 'landowner',  name: 'Large landowner / farming',               minTier: 4, connections: 65, desc: 'Agricultural estates and old money.' },
  { id: 'bigbusiness',name: 'Big business / industrialist',            minTier: 4, connections: 85, desc: 'Conglomerate or manufacturing empire.' },
  { id: 'oldmoney',   name: 'Old family wealth',                       minTier: 5, connections: 95, desc: 'Generations of wealth. Elite connections.' }
];

/* =================================================================
   4. STATE
   ================================================================= */
function p76Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p76) o.p76 = {};
  const d = o.p76;
  if (typeof d.wealthTier !== 'string') d.wealthTier = 'middle';
  if (typeof d.wealthLevel !== 'number') d.wealthLevel = 2;
  if (!d.parentsTraits || typeof d.parentsTraits !== 'object') {
    d.parentsTraits = { preset: 'balanced', strictness: 5, warmth: 7, generosity: 6, ambitionFocus: 'balanced', traditional: 5, religious: 5 };
  }
  if (typeof d.siblingCount !== 'number') d.siblingCount = 1;
  if (typeof d.familyOccupation !== 'string') d.familyOccupation = 'none';
  if (typeof d.familyBusiness !== 'string') d.familyBusiness = null;
  if (typeof d.reputation !== 'number') d.reputation = 50;
  if (typeof d.setupDone !== 'boolean') d.setupDone = false;
  if (typeof d.giftMemory !== 'object') d.giftMemory = {};
}
const P76_migrate = migrate;
migrate = function (o) { const r = P76_migrate(o); p76Init(r); return r; };
const P76_newGame = newGame;
newGame = function () {
  P76_newGame.apply(this, arguments);
  p76Init(S);
  p76ApplySetupToState();
};

/* =================================================================
   5. GLOBAL SETUP STATE (used during new-game screen)
   ================================================================= */
if (typeof window !== 'undefined') {
  window.P76_SETUP = window.P76_SETUP || {
    tier: 'middle',
    parentPreset: 'balanced',
    siblingCount: 1,
    occupation: 'gov'
  };
}

/* =================================================================
   6. APPLY SETUP TO GAME STATE
   ================================================================= */
function p76ApplySetupToState() {
  if (!S) return;
  p76Init(S);
  const cfg = window.P76_SETUP || {};
  const tier = P76_TIERS[cfg.tier] || P76_TIERS.middle;
  const preset = P76_PARENT_PRESETS[cfg.parentPreset] || P76_PARENT_PRESETS.balanced;

  /* Save tier */
  S.p76.wealthTier = tier.id;
  S.p76.wealthLevel = tier.order;
  S.p76.parentsTraits = {
    preset: preset.id,
    strictness: preset.strictness,
    warmth: preset.warmth,
    generosity: preset.generosity,
    ambitionFocus: preset.ambitionFocus,
    traditional: preset.traditional,
    religious: preset.religious
  };
  S.p76.reputation = tier.reputation;
  S.p76.siblingCount = Math.max(0, Math.min(5, Number(cfg.siblingCount) || 0));
  S.p76.setupDone = true;

  /* Apply family wealth in old 0-2 scale for back-compat */
  const oldWealth = tier.order <= 1 ? 0 : tier.order <= 3 ? 1 : 2;
  S.famWealth = oldWealth;

  /* Starting wealth */
  const startEGP = tier.startWealthEGP * p76Idx();
  S.wealth = startEGP / p76Rate();

  /* Siblings — reset and recreate */
  S.family = (S.family || []).filter(function (m) { return m && (m.role === 'Mother' || m.role === 'Father'); });
  for (let i = 0; i < S.p76.siblingCount; i++) {
    const age = Math.max(1, S.age + Math.floor(Math.random() * 12) - 4);
    const sib = (typeof addMember === 'function') ? addMember('Sibling', age, 55 + Math.floor(Math.random() * 20)) : null;
    if (sib) {
      sib.p76SiblingTrait = ['studious', 'ambitious', 'artistic', 'rebellious', 'quiet', 'protective'][Math.floor(Math.random() * 6)];
    }
  }

  /* Family occupation */
  const occ = P76_OCCUPATIONS.find(function (o) { return o.id === cfg.occupation; });
  const validOcc = occ && occ.minTier <= tier.order ? occ : null;
  S.p76.familyOccupation = validOcc ? validOcc.id : 'none';
  S.p76.connections = validOcc ? validOcc.connections : 0;

  /* Family business for wealthy tiers */
  if (tier.businessChance > 0 && Math.random() < tier.businessChance) {
    const bizNames = {
      egy: ['Nile Trading Company', 'Delta Textiles', 'Pyramid Foods', 'Cairo Medical Supplies', 'Alexandria Shipping Co.', 'Nile Valley Real Estate'],
      usa: ['Northstar Holdings', 'Sunrise Industries', 'Liberty Trade Co.'],
      gbr: ['Thames Trading Ltd', 'Westbridge Holdings', 'Crown Industries'],
      deu: ['Rhein Werke GmbH', 'Alpen Handel GmbH', 'Nordstern Industrie'],
      default: ['Family Holdings', 'Regional Trading Co.', 'Local Industries Ltd']
    };
    const names = bizNames[S.country] || bizNames.default;
    S.p76.familyBusiness = names[Math.floor(Math.random() * names.length)];
  }

  /* Assign parent personality to mother/father */
  (S.family || []).forEach(function (m) {
    if (!m) return;
    if (m.role === 'Mother' || m.role === 'Father') {
      m.p76Strictness = preset.strictness;
      m.p76Warmth = preset.warmth;
      m.p76Generosity = preset.generosity;
      m.p76Traditional = preset.traditional;
      m.p76Religious = preset.religious;
      m.p76AmbitionFocus = preset.ambitionFocus;
    }
  });

  /* Update parents home to match tier */
  try {
    if (typeof p60GenerateParentsHome === 'function') {
      p60GenerateParentsHome();
      p76OverrideParentsHome();
    }
  } catch (e) { console.error('p76 parents home override failed:', e); }

  /* Log the setup */
  log('🏠 Family background: ' + tier.label + ' · Parents: ' + preset.label);
  if (S.p76.familyBusiness) log('💼 Family business: ' + S.p76.familyBusiness);
  if (S.p76.siblingCount > 0) log('👥 ' + S.p76.siblingCount + ' sibling(s)');
}

/* Override parents' home with tier-appropriate type */
function p76OverrideParentsHome() {
  if (!S || !S.p60 || !S.p60.parentsHome) return;
  const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
  const h = S.p60.parentsHome;
  const y = gameYear();

  const homeProfiles = {
    crowded:     { type: 'shared flat',         area: 55 + Math.floor(Math.random() * 25), rooms: 2, cond: 40, valueMult: 0.5 },
    small_flat:  { type: 'older flat',           area: 85 + Math.floor(Math.random() * 30), rooms: 2, cond: 55, valueMult: 0.7 },
    apartment:   { type: 'apartment',            area: 130 + Math.floor(Math.random() * 40), rooms: 3, cond: 70, valueMult: 1.0 },
    compound_flat:{ type: 'compound apartment',  area: 160 + Math.floor(Math.random() * 50), rooms: 3, cond: 85, valueMult: 1.8 },
    villa:       { type: 'villa',                area: 320 + Math.floor(Math.random() * 120), rooms: 5, cond: 90, valueMult: 3.5 },
    mansion:     { type: 'mansion',              area: 700 + Math.floor(Math.random() * 400), rooms: 8, cond: 95, valueMult: 8.0 }
  };

  const profile = homeProfiles[tier.homeType] || homeProfiles.apartment;
  h.type = profile.type;
  h.area = profile.area;
  h.rooms = profile.rooms;
  h.condition = profile.cond;
  h.value = Math.round((Number(h.value) || 500000) * profile.valueMult);

  /* Neighborhoods by tier */
  const neighborhoods = {
    0: ['Shubra', 'Bulaq', 'Ain Shams', 'Imbaba', 'Old Cairo'],
    1: ['Smouha', 'Sidi Gaber', 'Nasr City', 'Faisal', 'Agouza'],
    2: ['Heliopolis', 'Maadi', 'Miami', 'Dokki', 'Mohandessin'],
    3: ['New Cairo', 'Sheikh Zayed', 'Rehab', 'Madinaty', 'Palm Hills'],
    4: ['Mivida', 'Villette', 'Sodic East', 'Marassi', 'Uptown Cairo'],
    5: ['Katameya Heights', 'SODIC Estates', 'Marassi', 'Gouna', 'Diplomatic Quarter']
  };
  const hoods = neighborhoods[S.p76.wealthLevel] || neighborhoods[2];
  h.neighbourhood = hoods[Math.floor(Math.random() * hoods.length)];

  /* Features based on tier */
  const featureBase = ['Balcony', 'Parking', 'Air conditioning'];
  const featureMid = featureBase.concat(['Elevator', 'Modern kitchen', 'Storage']);
  const featureHigh = featureMid.concat(['Private garden', 'Pool', 'Security gate', 'Staff quarters', 'Central AC']);
  h.features = S.p76.wealthLevel <= 1 ? featureBase.slice(0, 2)
    : S.p76.wealthLevel === 2 ? featureMid.slice(0, 4)
    : S.p76.wealthLevel === 3 ? featureMid
    : featureHigh;

  h.address = h.neighbourhood + ', ' + (h.city || 'Cairo');
}

/* =================================================================
   7. UI — START SCREEN CUSTOMIZATION PANEL
   ================================================================= */
function p76BuildStartCustomization() {
  const setup = window.P76_SETUP;
  const tier = P76_TIERS[setup.tier] || P76_TIERS.middle;
  const preset = P76_PARENT_PRESETS[setup.parentPreset] || P76_PARENT_PRESETS.balanced;
  const occ = P76_OCCUPATIONS.find(function (o) { return o.id === setup.occupation; });

  let html = '<div style="margin-top:14px;border:1px solid var(--line);border-radius:10px;padding:12px;background:rgba(139,92,246,.04)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<b style="font-size:.9rem">🏠 Customize your family</b>' +
    '<button class="menu-btn" style="font-size:.7rem;padding:3px 8px" onclick="p76ToggleSetup()">' + (window.P76_SETUP_OPEN ? 'Hide' : 'Show') + '</button>' +
    '</div>';

  if (!window.P76_SETUP_OPEN) {
    html += '<p class="muted" style="font-size:.75rem;margin-top:6px">Current: <b>' + tier.icon + ' ' + tier.name + '</b> · ' + preset.icon + ' ' + preset.label + ' · ' + setup.siblingCount + ' sibling(s)</p>' +
      '</div>';
    return html;
  }

  /* Wealth tier selector */
  html += '<p class="muted" style="font-size:.75rem;margin-top:10px;margin-bottom:6px">Family wealth</p>';
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  ['poor', 'lower_mid', 'middle', 'upper_mid', 'wealthy', 'ultra'].forEach(function (id) {
    const t = P76_TIERS[id];
    const sel = setup.tier === id;
    html += '<button class="btn ' + (sel ? 'sel' : '') + '" style="margin:0;padding:8px 10px;font-size:.76rem;text-align:left" onclick="p76SetTier(\'' + id + '\')">' +
      t.icon + ' ' + t.name + '</button>';
  });
  html += '</div>';

  /* Tier description */
  html += '<p class="muted" style="font-size:.74rem;margin-top:8px;font-style:italic">' + tier.desc + '</p>';

  /* Preview box */
  const startW = Math.round(tier.startWealthEGP * 0.9);
  html += '<div style="margin-top:10px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px;font-size:.78rem">' +
    '<div class="row" style="border:0;padding:2px 0"><span>Starting wealth</span><b class="mono">' + (startW === 0 ? 'Nothing' : '≈ ' + startW.toLocaleString() + ' EGP') + '</b></div>' +
    '<div class="row" style="border:0;padding:2px 0"><span>Home</span><b>' + tier.homeDesc + '</b></div>' +
    '<div class="row" style="border:0;padding:2px 0"><span>School tier</span><b>' + tier.schoolTier + '</b></div>' +
    '<div class="row" style="border:0;padding:2px 0"><span>Pocket money</span><b>' + (tier.pocketMoneyBase === 0 ? 'None' : '≈ ' + tier.pocketMoneyBase + '/month') + '</b></div>' +
    '<div class="row" style="border:0;padding:2px 0"><span>Car gift</span><b>' + tier.carGift.replace('_', ' ') + '</b></div>' +
    '<div class="row" style="border:0;padding:2px 0"><span>Family requests</span><b>' + tier.requestFrequency + '</b></div>' +
    '</div>';

  /* Parents' personality */
  html += '<p class="muted" style="font-size:.75rem;margin-top:12px;margin-bottom:6px">Parents\' personality</p>';
  html += '<div style="display:grid;grid-template-columns:1fr;gap:4px">';
  ['balanced', 'warm', 'strict', 'traditional', 'business', 'artistic', 'absent'].forEach(function (id) {
    const p = P76_PARENT_PRESETS[id];
    const sel = setup.parentPreset === id;
    html += '<button class="btn ' + (sel ? 'sel' : '') + '" style="margin:0;padding:6px 10px;font-size:.74rem;text-align:left" onclick="p76SetPreset(\'' + id + '\')">' +
      p.icon + ' <b>' + p.label + '</b><small style="font-size:.7rem">' + p.desc + '</small></button>';
  });
  html += '</div>';

  /* Sibling count */
  html += '<p class="muted" style="font-size:.75rem;margin-top:12px;margin-bottom:6px">Siblings</p>';
  html += '<div style="display:flex;gap:4px;flex-wrap:wrap">';
  [0, 1, 2, 3, 4].forEach(function (n) {
    const sel = setup.siblingCount === n;
    html += '<button class="btn ' + (sel ? 'sel' : '') + '" style="margin:0;padding:6px 12px;font-size:.78rem" onclick="p76SetSiblings(' + n + ')">' + n + '</button>';
  });
  html += '</div>';

  /* Family occupation */
  html += '<p class="muted" style="font-size:.75rem;margin-top:12px;margin-bottom:6px">Family occupation</p>';
  html += '<select id="p76-occ" style="width:100%;padding:6px;font-size:.78rem" onchange="p76SetOcc(this.value)">';
  P76_OCCUPATIONS.filter(function (o) { return o.minTier <= tier.order; }).forEach(function (o) {
    const sel = setup.occupation === o.id;
    html += '<option value="' + o.id + '"' + (sel ? ' selected' : '') + '>' + o.name + (o.connections ? ' (connections: ' + o.connections + ')' : '') + '</option>';
  });
  html += '</select>';

  html += '</div>';
  return html;
}

/* Toggle setup panel */
function p76ToggleSetup() {
  window.P76_SETUP_OPEN = !window.P76_SETUP_OPEN;
  if (typeof buildStart === 'function') buildStart();
}
window.p76ToggleSetup = p76ToggleSetup;

function p76SetTier(id) {
  if (!P76_TIERS[id]) return;
  window.P76_SETUP.tier = id;
  /* Auto-adjust occupation if not valid for tier */
  const occ = P76_OCCUPATIONS.find(function (o) { return o.id === window.P76_SETUP.occupation; });
  if (occ && occ.minTier > P76_TIERS[id].order) {
    const valid = P76_OCCUPATIONS.filter(function (o) { return o.minTier <= P76_TIERS[id].order; });
    window.P76_SETUP.occupation = valid.length ? valid[valid.length - 1].id : 'none';
  }
  if (typeof buildStart === 'function') buildStart();
}
window.p76SetTier = p76SetTier;

function p76SetPreset(id) {
  if (!P76_PARENT_PRESETS[id]) return;
  window.P76_SETUP.parentPreset = id;
  if (typeof buildStart === 'function') buildStart();
}
window.p76SetPreset = p76SetPreset;

function p76SetSiblings(n) {
  window.P76_SETUP.siblingCount = Math.max(0, Math.min(5, Number(n) || 0));
  if (typeof buildStart === 'function') buildStart();
}
window.p76SetSiblings = p76SetSiblings;

function p76SetOcc(id) {
  window.P76_SETUP.occupation = id;
  if (typeof buildStart === 'function') buildStart();
}
window.p76SetOcc = p76SetOcc;

/* =================================================================
   8. INJECT INTO START SCREEN
   ================================================================= */
const P76_buildStartBefore = (typeof buildStart === 'function') ? buildStart : null;
if (P76_buildStartBefore) {
  buildStart = function () {
    const r = P76_buildStartBefore.apply(this, arguments);
    const start = document.getElementById('start');
    if (!start) return r;
    /* Remove existing p76 panel */
    const old = document.getElementById('p76-setup-panel');
    if (old) old.remove();
    /* Insert before the start button */
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      const div = document.createElement('div');
      div.id = 'p76-setup-panel';
      div.innerHTML = p76BuildStartCustomization();
      startBtn.parentElement.insertBefore(div, startBtn);
    }
    return r;
  };
}

/* =================================================================
   9. FAMILY YEAR — money flows based on tier
   ================================================================= */
const P76_familyYearBefore = familyYear;
familyYear = function () {
  const r = P76_familyYearBefore.apply(this, arguments);
  if (!S || !S.p76) return r;
  const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
  const rate = p76Rate();

  /* Pocket money for children (age 8-17) */
  if (S.age >= 8 && S.age < 18 && tier.pocketMoneyBase > 0) {
    const monthly = tier.pocketMoneyBase;
    const annual = monthly * 12;
    const internal = annual / rate * p76Idx();
    S.wealth += internal;
    S.income = (S.income || 0) + internal;
    log('💰 Received ' + annual.toLocaleString() + ' EGP in pocket money from your parents.');
  }

  /* Gifts for older kids (18-25) — rich families keep giving */
  if (S.age >= 18 && S.age <= 25 && tier.giftChance > 0) {
    if (Math.random() < tier.giftChance) {
      const baseAmt = 30000 * tier.giftScale;
      const amt = Math.round(baseAmt * p76Idx());
      const internal = amt / rate;
      S.wealth += internal;
      S.income = (S.income || 0) + internal;
      log('🎁 Your parents gave you ' + amt.toLocaleString() + ' EGP as a gift.');
    }
  }

  /* Ultra-wealthy family: parents fund ventures / holidays / purchases */
  if (S.p76.wealthLevel >= 4 && S.age >= 18 && S.age <= 35) {
    if (Math.random() < 0.4) {
      const amt = Math.round((100000 + Math.random() * 500000) * p76Idx());
      const internal = amt / rate;
      S.wealth += internal;
      S.income = (S.income || 0) + internal;
      log('💎 Family support: ' + amt.toLocaleString() + ' EGP from your parents.');
    }
  }

  /* Wealthy family business pays dividends to heirs */
  if (S.p76.familyBusiness && S.p76.wealthLevel >= 4 && S.age >= 21) {
    const dividend = Math.round((50000 + Math.random() * 150000) * p76Idx() * (S.p76.wealthLevel - 3));
    const internal = dividend / rate;
    S.wealth += internal;
    S.income = (S.income || 0) + internal;
    log('📈 ' + S.p76.familyBusiness + ' paid you ' + dividend.toLocaleString() + ' EGP in dividends.');
  }

  return r;
};

/* =================================================================
   10. INVERT FAMILY REQUESTS FOR RICH TIERS
   ================================================================= */
const P76_p14RequestBefore = (typeof p14RequestState === 'function') ? p14RequestState : null;
const P76_p12GenerateBefore = (typeof p12GenerateFamilyNeed === 'function') ? p12GenerateFamilyNeed : null;
if (P76_p12GenerateBefore) {
  p12GenerateFamilyNeed = function () {
    if (!S || !S.p76) return P76_p12GenerateBefore.apply(this, arguments);
    const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
    /* Rich families never ask for money */
    if (tier.requestFrequency === 'never') return;
    /* Adjust frequency */
    const roll = Math.random();
    const threshold = tier.requestFrequency === 'high' ? 0.35 : tier.requestFrequency === 'medium' ? 0.18 : 0.08;
    if (roll > threshold) return;
    return P76_p12GenerateBefore.apply(this, arguments);
  };
}

/* =================================================================
   11. PARENTS AGREE TO MORE (rich family) / LESS (poor family)
   ================================================================= */
const P76_parentsAgreeBefore = (typeof parentsAgree === 'function') ? parentsAgree : null;
if (P76_parentsAgreeBefore) {
  parentsAgree = function (type) {
    if (!S || !S.p76) return P76_parentsAgreeBefore.apply(this, arguments);
    const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
    const generosity = S.p76.parentsTraits ? S.p76.parentsTraits.generosity : 6;
    const baseChance = P76_parentsAgreeBefore.apply(this, arguments);
    /* Multiply by tier + generosity */
    const tierMult = 0.5 + tier.giftChance * 1.2;
    const genMult = 0.6 + generosity / 10;
    const result = Math.random() < Math.min(0.98, (baseChance || 0.5) * tierMult * genMult);
    return result;
  };
}

/* =================================================================
   12. CAR GIFT FROM PARENTS — tier aware
   ================================================================= */
const P76_p62ParentCarBefore = (typeof p62ParentCarOffer === 'function') ? p62ParentCarOffer : null;
if (P76_p62ParentCarBefore) {
  p62ParentCarOffer = function () {
    if (!S || !S.p76) return P76_p62ParentCarBefore.apply(this, arguments);
    const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
    if (tier.carGift === 'never') return;
    /* Higher tiers offer more often */
    const offerChance = { used_possible: 0.15, used_likely: 0.35, new_likely: 0.55, luxury: 0.75 }[tier.carGift] || 0;
    if (Math.random() < offerChance) {
      return P76_p62ParentCarBefore.apply(this, arguments);
    }
  };
}

/* =================================================================
   13. GPA — parents' strictness affects effort pressure
   ================================================================= */
/* Higher strictness + academic ambition → parents push grades, GPA +0.1 */
const P76_ageUpBeforeGpa = ageUp;
ageUp = function () {
  const r = P76_ageUpBeforeGpa.apply(this, arguments);
  if (!S || !S.p76 || !S.p76.parentsTraits) return r;
  const traits = S.p76.parentsTraits;
  if (S.age >= 7 && S.age <= 18 && S.gpaN > 0) {
    const strictBonus = (traits.strictness - 5) * 0.02;
    const ambitionBonus = traits.ambitionFocus === 'academic' ? 0.05 : 0;
    if (strictBonus + ambitionBonus > 0) {
      S.gpa = Math.min(4, S.gpa + strictBonus + ambitionBonus);
    }
  }
  return r;
};

/* =================================================================
   14. MARRIAGE / LOVE — reputation affects partner pool
   ================================================================= */
const P76_genPoolBefore = (typeof genPool === 'function') ? genPool : null;
if (P76_genPoolBefore) {
  genPool = function () {
    const r = P76_genPoolBefore.apply(this, arguments);
    if (!S || !S.p76 || !Array.isArray(S.pool)) return r;
    const rep = S.p76.reputation || 50;
    /* Higher reputation brings higher tier matches */
    S.pool.forEach(function (candidate) {
      if (!candidate) return;
      /* Add reputation bonus to candidate tier */
      candidate.reputationBonus = Math.round((rep - 50) / 20);
      if (candidate.reputationBonus > 0) {
        candidate.tier = Math.min(3, (candidate.tier || 0) + candidate.reputationBonus);
      }
    });
    return r;
  };
}

/* =================================================================
   15. INHERITANCE — scaled to family wealth
   ================================================================= */
const P76_familyYearForInherit = familyYear;
familyYear = function () {
  const r = P76_familyYearForInherit.apply(this, arguments);
  if (!S || !S.p76) return r;
  /* Set parent estateInternal based on tier */
  (S.family || []).forEach(function (m) {
    if (!m || m.alive === false) return;
    if (m.role !== 'Mother' && m.role !== 'Father') return;
    if (typeof m.estateInternal === 'number' && m.estateInternal > 0) return;
    /* Set initial estate based on tier */
    const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
    const baseEstates = {
      0: 15000, 1: 80000, 2: 400000, 3: 2000000, 4: 15000000, 5: 80000000
    };
    m.estateInternal = (baseEstates[S.p76.wealthLevel] || 400000) * p76Idx() / p76Rate();
    m.estateProperty = S.p76.wealthLevel >= 3;
    m.estateSeedScale = p76Idx();
  });
  return r;
};

/* =================================================================
   16. UI CARD ON LIFE TAB — shows family background
   ================================================================= */
const P76_viewLifeBefore = viewLife;
viewLife = function () {
  let html = P76_viewLifeBefore.apply(this, arguments);
  if (!S || !S.p76 || !S.p76.setupDone) return html;

  const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
  const preset = P76_PARENT_PRESETS[S.p76.parentsTraits ? S.p76.parentsTraits.preset : 'balanced'] || P76_PARENT_PRESETS.balanced;
  const occ = P76_OCCUPATIONS.find(function (o) { return o.id === S.p76.familyOccupation; });

  const card = '<section class="card" style="padding:12px;border-left:3px solid ' + (S.p76.wealthLevel >= 4 ? 'var(--mint)' : S.p76.wealthLevel >= 2 ? 'var(--cyan)' : 'var(--amber)') + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div>' +
    '<div class="muted" style="font-size:.68rem;letter-spacing:.06em;font-weight:700">FAMILY BACKGROUND</div>' +
    '<div style="font-size:1rem;font-weight:700;margin-top:4px">' + tier.icon + ' ' + tier.name + '</div>' +
    '<div class="muted" style="font-size:.75rem;margin-top:2px">' + preset.icon + ' ' + preset.label +
    (occ && occ.id !== 'none' ? ' · ' + occ.name : '') +
    (S.p76.siblingCount > 0 ? ' · ' + S.p76.siblingCount + ' sibling(s)' : '') +
    '</div>' +
    '</div>' +
    '<div style="text-align:right"><div class="mono" style="font-size:.85rem;color:var(--mint)">Rep ' + S.p76.reputation + '</div><div class="muted" style="font-size:.65rem">family reputation</div></div>' +
    '</div>' +
    (S.p76.familyBusiness ? '<div class="row" style="margin-top:8px;border:0;padding:3px 0;font-size:.78rem"><span>Family business</span><b>' + S.p76.familyBusiness + '</b></div>' : '') +
    (S.p76.connections > 0 ? '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Family connections</span><b>' + S.p76.connections + '/100</b></div>' : '') +
    '</section>';

  /* Insert at top of life tab */
  return card + html;
};

/* =================================================================
   17. INIT
   ================================================================= */
p76Init(S);
console.log('[p76] Life customization system loaded');
