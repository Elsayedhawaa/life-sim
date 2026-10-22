/* ============================================================
   VIEW: ASSETS — Housing & Assets overview  (v10 — verified)
   ============================================================
   Rich renovation picker with 28 options across 8 categories.
   Fix: "Help renovate" button now opens picker (was deducting cash directly)
   ============================================================ */

console.log('[World Life] 14-view-assets.js v10 loaded');

/* ---------- GLOBAL HELPER ---------- */
function currentYearlyRent() {
  if (S && S.rentedHome && typeof S.rentedHome.yearlyRent === 'number') return S.rentedHome.yearlyRent;
  return (C().prices && C().prices.rent) || 0;
}
window.currentYearlyRent = currentYearlyRent;

/* ---------- STATE ---------- */
function ensureAssetsState() {
  if (!S) return;
  if (typeof S.parentsHome === 'undefined') S.parentsHome = null;
  if (typeof S.rentedHome === 'undefined') S.rentedHome = null;
  if (typeof S.assetsRenovateHome === 'undefined') S.assetsRenovateHome = null;

  if (S.housing === 'parents' && !S.parentsHome) ensureParentsHome();
  if (S.housing === 'rented' && !S.rentedHome) {
    S.rentedHome = { tierId: 'br2', yearlyRent: (C().prices && C().prices.rent) || 120000, area: 100, condition: 75, rentedYear: gameYear() };
  }

  /* Add contract tracking */
  if (S.rentedHome) {
    if (!S.rentedHome.country) S.rentedHome.country = S.country;
    if (typeof S.rentedHome.contractEndAbs !== 'number') {
      const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
      S.rentedHome.contractEndAbs = currentAbs + 12; /* 1 year lease by default */
    }
  }
}
GameHooks.on('newGame', ensureAssetsState);
GameHooks.on('migrate', ensureAssetsState);

/* ============================================================
   RENOVATION CATALOG — 28 options · 8 categories
   Costs in EGP base · scaled by C().rate / 52.7
   Each repeat costs ×1.30 more (diminishing returns)
   ============================================================ */
const PARENT_RENOVATIONS = [
  /* ---------- BATHROOMS ---------- */
  { id: 'bathroom_basic',   category: 'Bathrooms', label: '🚿 Bathroom Renovation',         baseCost: 25000, cond: 8,  hap: 3, valueAdd: 0.030, desc: 'New fixtures, tiles, shower head, mirror.' },
  { id: 'bathroom_master',  category: 'Bathrooms', label: '🛁 Master Bathroom Upgrade',     baseCost: 45000, cond: 10, hap: 4, valueAdd: 0.050, desc: 'Larger tub, double vanity, premium tiles.' },
  { id: 'bathroom_guest',   category: 'Bathrooms', label: '🚽 Guest Bathroom Refresh',      baseCost: 12000, cond: 5,  hap: 2, valueAdd: 0.020, desc: 'Quick refresh — paint, seal, small fixtures.' },

  /* ---------- KITCHEN ---------- */
  { id: 'kitchen_remodel',  category: 'Kitchen',   label: '🍳 Kitchen Remodel',             baseCost: 40000, cond: 10, hap: 4, valueAdd: 0.050, desc: 'New cabinets, counters, sink, backsplash.' },
  { id: 'kitchen_appliances', category: 'Kitchen', label: '🍽 Built-in Appliance Upgrade',  baseCost: 55000, cond: 8,  hap: 5, valueAdd: 0.055, desc: 'Modern oven, hob, extractor, dishwasher.' },
  { id: 'kitchen_island',   category: 'Kitchen',   label: '🏝 Kitchen Island Addition',     baseCost: 30000, cond: 5,  hap: 4, valueAdd: 0.040, desc: 'Extra prep space, doubles as breakfast bar.' },

  /* ---------- LIVING AREAS ---------- */
  { id: 'living_room',      category: 'Living Areas', label: '🛋 Living Room Refresh',      baseCost: 15000, cond: 4,  hap: 3, valueAdd: 0.015, desc: 'Paint, lighting, minor layout updates.' },
  { id: 'dining_room',      category: 'Living Areas', label: '🍽 Dining Room Update',       baseCost: 10000, cond: 3,  hap: 2, valueAdd: 0.010, desc: 'Fresh paint and lighting for the dining space.' },
  { id: 'balcony',          category: 'Living Areas', label: '🌿 Balcony / Terrace',        baseCost: 14000, cond: 3,  hap: 3, valueAdd: 0.020, desc: 'Tiles, railing, planters, small seating.' },

  /* ---------- BEDROOMS ---------- */
  { id: 'bedroom_master',   category: 'Bedrooms',  label: '🛏 Master Bedroom Update',       baseCost: 20000, cond: 5,  hap: 3, valueAdd: 0.020, desc: 'Paint, new bedding, wardrobe refresh.' },
  { id: 'bedroom_kids',     category: 'Bedrooms',  label: '🧸 Children\'s Room Refresh',    baseCost: 12000, cond: 4,  hap: 3, valueAdd: 0.015, desc: 'Paint, study desk, playful decor.' },

  /* ---------- SYSTEMS ---------- */
  { id: 'ac',               category: 'Systems',   label: '❄️ AC System Upgrade',           baseCost: 35000, cond: 4,  hap: 4, health: 2, valueAdd: 0.040, desc: 'Modern split ACs installed in all rooms.' },
  { id: 'heating',          category: 'Systems',   label: '🔥 Heating System',              baseCost: 28000, cond: 4,  hap: 3, health: 2, valueAdd: 0.035, desc: 'Gas heater or heat pump for cold months.' },
  { id: 'electrical',       category: 'Systems',   label: '⚡ Electrical Rewiring',         baseCost: 30000, cond: 6,  hap: 2, valueAdd: 0.020, desc: 'Safe modern wiring, new outlets.' },
  { id: 'plumbing',         category: 'Systems',   label: '🚰 Plumbing Overhaul',           baseCost: 22000, cond: 6,  hap: 2, valueAdd: 0.020, desc: 'Replace old pipes and fixtures.' },
  { id: 'water_heater',     category: 'Systems',   label: '💧 Water Heater Replacement',    baseCost: 8000,  cond: 3,  hap: 2, valueAdd: 0.010, desc: 'New efficient water heater — reliable hot water.' },
  { id: 'insulation',       category: 'Systems',   label: '🌡 Insulation Upgrade',          baseCost: 18000, cond: 3,  hap: 2, health: 1, valueAdd: 0.025, desc: 'Wall and attic insulation — warmer home.' },
  { id: 'lighting',         category: 'Systems',   label: '💡 Modern Lighting',             baseCost: 10000, cond: 2,  hap: 2, valueAdd: 0.010, desc: 'LED fixtures in all rooms.' },

  /* ---------- COSMETIC ---------- */
  { id: 'walls',            category: 'Cosmetic',  label: '🎨 Walls & Paint',               baseCost: 8000,  cond: 3,  hap: 2, valueAdd: 0.010, desc: 'Fresh paint throughout the home.' },
  { id: 'flooring',         category: 'Cosmetic',  label: '🪵 New Flooring',                baseCost: 20000, cond: 5,  hap: 3, valueAdd: 0.020, desc: 'Replace old tiles or worn carpet.' },
  { id: 'doors',            category: 'Cosmetic',  label: '🚪 New Interior Doors',          baseCost: 12000, cond: 3,  hap: 2, valueAdd: 0.010, desc: 'Replace interior and entry doors.' },
  { id: 'windows',          category: 'Cosmetic',  label: '🪟 Window Replacement',          baseCost: 18000, cond: 3,  hap: 2, valueAdd: 0.020, desc: 'Double-glazed windows, better insulation.' },
  { id: 'exterior_paint',   category: 'Cosmetic',  label: '🧱 Exterior Facade Painting',    baseCost: 32000, cond: 5,  hap: 2, valueAdd: 0.030, desc: 'Repaint building exterior — curb appeal.' },

  /* ---------- STRUCTURAL ---------- */
  { id: 'roof',             category: 'Structural', label: '🏠 Roof Repair',                baseCost: 28000, cond: 7,  hap: 1, valueAdd: 0.030, desc: 'Seal leaks, replace damaged tiles.' },
  { id: 'foundation',       category: 'Structural', label: '🏗 Foundation Check & Repair',   baseCost: 40000, cond: 10, hap: 1, valueAdd: 0.040, desc: 'Structural integrity check + minor repairs.' },

  /* ---------- EXTRAS ---------- */
  { id: 'security',         category: 'Extras',    label: '🔒 Home Security System',        baseCost: 15000, cond: 2,  hap: 4, valueAdd: 0.020, desc: 'Cameras, alarms, smart locks.' },
  { id: 'smart_home',       category: 'Extras',    label: '📱 Smart Home Setup',            baseCost: 25000, cond: 2,  hap: 5, valueAdd: 0.030, desc: 'Smart thermostat, lights, plugs, hub.' },
  { id: 'garden',           category: 'Extras',    label: '🌳 Garden / Landscape',          baseCost: 20000, cond: 3,  hap: 4, valueAdd: 0.025, desc: 'Landscaping, plants, small patio.' }
];
window.PARENT_RENOVATIONS = PARENT_RENOVATIONS;

const RENOVATION_CATEGORIES = ['Bathrooms', 'Kitchen', 'Living Areas', 'Bedrooms', 'Systems', 'Cosmetic', 'Structural', 'Extras'];
const RENTAL_RENOVATION_IDS = ['walls', 'lighting', 'balcony', 'security', 'smart_home'];

/* ---------- PARENTS' HOME GENERATION ---------- */
const PARENTS_HOME_VALUE_EGP = { poor: 800000, 'lower-mid': 1500000, middle: 3000000, 'upper-mid': 6000000, wealthy: 18000000, ultra: 60000000 };
const PARENTS_HOME_AREA = { poor: 60, 'lower-mid': 90, middle: 130, 'upper-mid': 180, wealthy: 400, ultra: 900 };
const PARENTS_HOME_ROOMS = { poor: 2, 'lower-mid': 3, middle: 4, 'upper-mid': 6, wealthy: 10, ultra: 18 };

function ensureParentsHome() {
  if (!S) return;
  if (S.parentsHome) {
    if (!Array.isArray(S.parentsHome.renovationLog)) S.parentsHome.renovationLog = [];
    if (!S.parentsHome.renovationsDone || typeof S.parentsHome.renovationsDone !== 'object') S.parentsHome.renovationsDone = {};
    return;
  }
  const tier = S.familyTier || 'middle';
  const egpValue = PARENTS_HOME_VALUE_EGP[tier] || 3000000;
  const rate = (typeof C === 'function' && C().rate) ? C().rate : 52.7;
  const value = S.country === 'egy' ? egpValue : Math.round(egpValue / 52.7 * rate);

  let ownership = 'both_parents';
  const r = Math.random();
  if (tier === 'poor' || tier === 'lower-mid') {
    if (r < 0.40) ownership = 'joint_with_family';
    else if (r < 0.60) ownership = 'father';
    else if (r < 0.75) ownership = 'mother';
  } else if (tier === 'wealthy' || tier === 'ultra') {
    if (r < 0.50) ownership = 'both_parents';
    else if (r < 0.85) ownership = 'father';
    else ownership = 'mother';
  } else {
    if (r < 0.70) ownership = 'both_parents';
    else if (r < 0.88) ownership = 'father';
    else ownership = 'mother';
  }

  const homeAge = 20 + Math.floor(Math.random() * 25);
  const yearBuilt = Math.max(1950, gameYear() - homeAge - S.age + 6);

  S.parentsHome = {
    value: value,
    area: PARENTS_HOME_AREA[tier] || 130,
    rooms: PARENTS_HOME_ROOMS[tier] || 4,
    condition: 60 + Math.floor(Math.random() * 25),
    ownership: ownership,
    yearBuilt: yearBuilt,
    renovationLevel: 0,
    renovationLog: [],
    renovationsDone: {},
    appliancesBought: []
  };
}
window.ensureParentsHome = ensureParentsHome;

function ownershipLabel(ownership) {
  return {
    both_parents:      'Co-owned by both parents',
    father:            "Registered under your father's name",
    mother:            "Registered under your mother's name",
    joint_with_family: 'Shared with extended family (grandparents / uncles)'
  }[ownership] || 'Ownership unclear';
}
window.ownershipLabel = ownershipLabel;

/* ---------- RENTAL TIERS ---------- */
const RENTAL_TIERS = [
  { id: 'shared_room',  label: 'Shared Room',         yearlyMult: 0.30, area: 15,  cond: 55, desc: 'A room in a shared flat with strangers.' },
  { id: 'studio_small', label: 'Small Studio',        yearlyMult: 0.50, area: 30,  cond: 65, desc: 'Compact studio, basic amenities.' },
  { id: 'studio',       label: 'Studio Apartment',    yearlyMult: 0.70, area: 45,  cond: 70, desc: 'Open-plan studio, private bath.' },
  { id: 'br1',          label: '1-Bedroom Apartment', yearlyMult: 0.85, area: 75,  cond: 72, desc: '1BR flat with separate living room.' },
  { id: 'br2',          label: '2-Bedroom Apartment', yearlyMult: 1.00, area: 110, cond: 75, desc: 'Standard 2BR apartment.' },
  { id: 'br2_l',        label: 'Large 2-Bedroom',     yearlyMult: 1.35, area: 145, cond: 78, desc: 'Spacious 2BR with balcony.' },
  { id: 'br3',          label: '3-Bedroom Apartment', yearlyMult: 1.75, area: 175, cond: 80, desc: 'Family-sized 3BR.' },
  { id: 'furnished',    label: 'Furnished 2-Bedroom', yearlyMult: 1.65, area: 120, cond: 85, desc: 'Fully furnished, move-in ready.' },
  { id: 'compound',     label: 'Compound Flat',       yearlyMult: 2.80, area: 145, cond: 90, desc: 'Gated compound, amenities included.' },
  { id: 'villa',        label: 'Rented Villa',        yearlyMult: 5.50, area: 380, cond: 85, desc: 'Standalone villa with garden.' }
];
window.RENTAL_TIERS = RENTAL_TIERS;

function rentalCostForTier(tier) {
  const base = (C().prices && C().prices.rent) || 120000;
  return Math.round(base * tier.yearlyMult);
}
function rentalTierById(id) { return RENTAL_TIERS.find(function(t) { return t.id === id; }) || null; }

/* ---------- HELPERS ---------- */
function currentHousing() {
  if (!S) return { kind: 'unknown', home: null };
  if (S.housing === 'parents') { ensureParentsHome(); return { kind: 'parents', home: S.parentsHome }; }
  if (S.housing === 'rented') {
    if (!S.rentedHome) S.rentedHome = { tierId: 'br2', yearlyRent: (C().prices && C().prices.rent) || 120000, area: 100, condition: 75, rentedYear: gameYear() };
    return { kind: 'rented', home: S.rentedHome };
  }
  if (S.housing === 'owned') {
    const h = S.ownedHomes.find(function(x) { return x.status === 'occupied'; });
    if (h) {
      return {
        type: 'owned',
        name: h.name + (h.isHusbandOwned ? ' (Husband\'s)' : ''),
        description: (h.city || '') + ' · ' + (h.area || 0) + ' m² · ' + (h.location || ''),
        area: h.area,
        rooms: h.rooms || Math.max(2, Math.floor((h.area || 100) / 30)),
        condition: h.condition,
        value: h.value,
        homeComfort: h.homeComfort || 0,
        shoppingComfort: h.shoppingComfort || 0,
        furnitureValue: h.furnitureValue || 0,
        canManage: true,
        note: h.isHusbandOwned ? "You live in your husband's property. You can decorate and renovate, but the property remains his." : null,
        home: h
      };
    }
  }
  return { kind: 'unknown', home: null };
}

function housingItemsCount(homeId) {
  if (!S.shopping || !Array.isArray(S.shopping.inventory)) return 0;
  return S.shopping.inventory.filter(function(i) { return i.homeId === homeId && (i.cat === 'furniture' || i.cat === 'appliances'); }).length;
}
function housingItemsValue(homeId) {
  if (!S.shopping || !Array.isArray(S.shopping.inventory)) return 0;
  return S.shopping.inventory.filter(function(i) { return i.homeId === homeId && (i.cat === 'furniture' || i.cat === 'appliances'); })
    .reduce(function(sum, i) { return sum + (i.currentValue || 0); }, 0);
}

/* ---------- RENT / MOVE ACTIONS ---------- */
window.assetsRentHome = function(tierId) {
  ensureAssetsState();
  const tier = rentalTierById(tierId);
  if (!tier) return;
  const yearly = rentalCostForTier(tier);

  if (S.housing === 'parents') {
    const moveInCost = Math.round(yearly / 12 * 2);
    if (S.wealth < moveInCost) { log('❌ Need ' + money(moveInCost) + ' to move in (first month + deposit).'); render(); return; }
    if (!confirm('Move out of your parents\' home into a ' + tier.label + '?\n\nRent: ' + money(yearly) + '/year\nMove-in cost: ' + money(moveInCost) + '\n\nProceed?')) return;
    S.wealth -= moveInCost;
    S.housing = 'rented';
    S.rentedHome = {
      tierId: tier.id,
      yearlyRent: yearly,
      area: tier.area,
      condition: tier.cond,
      rentedYear: gameYear(),
      country: S.country,
      contractEndAbs: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) + 12
    };
    S.assetsRenovateHome = null;
    log('🔑 Rented a ' + tier.label + ' for ' + money(yearly) + '/year. You moved out.');
    fx({ happiness: 8 });
    render(); return;
  }
  if (S.housing === 'rented') {
    const oldMonthly = Math.round((S.rentedHome.yearlyRent || 0) / 12);
    const newMonthly = Math.round(yearly / 12);
    const diff = newMonthly - oldMonthly;
    const depositNeeded = Math.max(0, diff * 2);
    if (S.wealth < depositNeeded) { log('❌ Need ' + money(depositNeeded) + ' extra deposit.'); render(); return; }
    if (!confirm('Switch to a ' + tier.label + '?\n\nNew rent: ' + money(yearly) + '/year\n' + (diff > 0 ? 'Extra deposit: ' + money(depositNeeded) : 'No extra deposit required.') + '\n\nProceed?')) return;
    if (depositNeeded > 0) S.wealth -= depositNeeded;
    S.rentedHome = { tierId: tier.id, yearlyRent: yearly, area: tier.area, condition: tier.cond, rentedYear: gameYear() };
    log('🔑 Moved into a ' + tier.label + '. New rent: ' + money(yearly) + '/year.');
    render(); return;
  }
  log('❌ You already own a home. Manage it from the Real Estate tab.');
  render();
};

window.assetsMoveBackToParents = function() {
  if (S.housing !== 'rented') return;
  if (!confirm('Move back in with your parents? Your rental contract will end.')) return;
  S.housing = 'parents';
  S.rentedHome = null;
  S.assetsRenovateHome = null;
  log('🏠 Moved back in with your parents.');
  fx({ happiness: -3 });
  render();
};

window.assetsBuyFurniture = function(homeId, category) {
  if (!S.shopping) { log('❌ Shopping system not available.'); return; }
  S.shopping.tab = category || 'furniture';
  if (typeof ensureShoppingState === 'function') ensureShoppingState();
  if (typeof switchTab === 'function') switchTab('shopping');
  else render();
};

/* ---------- OPEN RENOVATION PICKER (this is the fixed function) ---------- */
window.assetsRenovateHome = function(homeId) {
  S.assetsRenovateHome = homeId || 'parents';
  console.log('[World Life] Opening renovation picker for:', S.assetsRenovateHome);
  render();
};
window.assetsCloseRenovation = function() {
  S.assetsRenovateHome = null;
  render();
};

/* ---------- BUY RENOVATION ---------- */
window.assetsBuyRenovation = function(renovationId) {
  ensureAssetsState();
  const target = S.assetsRenovateHome;
  if (!target) return;

  const reno = PARENT_RENOVATIONS.find(function(r) { return r.id === renovationId; });
  if (!reno) return;

  if (target === 'rented' && RENTAL_RENOVATION_IDS.indexOf(renovationId) < 0) {
    log('❌ Rentals cannot have structural renovations.');
    render(); return;
  }

  const home = target === 'parents' ? S.parentsHome : S.rentedHome;
  if (!home) return;

  if (!home.renovationsDone || typeof home.renovationsDone !== 'object') home.renovationsDone = {};
  if (!Array.isArray(home.renovationLog)) home.renovationLog = [];

  const timesDone = home.renovationsDone[renovationId] || 0;
  const rateRatio = (C().rate || 1) / 52.7;
  const cost = Math.round(reno.baseCost * rateRatio * Math.pow(1.30, timesDone));

  if (S.wealth < cost) { log('❌ Need ' + money(cost) + ' for this renovation.'); render(); return; }

  /* Build the confirm dialog with rich detail */
  const effectLines = [];
  if (reno.cond) effectLines.push('• Condition +' + reno.cond + '%');
  if (reno.hap) effectLines.push('• Happiness +' + reno.hap);
  if (reno.health) effectLines.push('• Health +' + reno.health);
  if (reno.social) effectLines.push('• Social +' + reno.social);
  if (reno.valueAdd && target === 'parents') effectLines.push('• Home value +' + Math.round(reno.valueAdd * 100) + '%');

  const previewAfter = Math.min(100, (home.condition || 0) + reno.cond);
  const valuePreview = target === 'parents' && S.parentsHome
    ? '\n\nHome value: ' + money(S.parentsHome.value) + ' → ' + money(Math.round(S.parentsHome.value * (1 + reno.valueAdd)))
    : '';

  const msg = '🏗 ' + reno.label + '\n\n' + reno.desc + '\n\n' +
    'Cost: ' + money(cost) + (timesDone > 0 ? '  (repeat #' + (timesDone + 1) + ', +30% cost)' : '') + '\n\n' +
    'Effects:\n' + effectLines.join('\n') + '\n\n' +
    'Condition: ' + (home.condition || 0) + '% → ' + previewAfter + '%' + valuePreview + '\n\n' +
    'Proceed?';

  if (!confirm(msg)) return;

  S.wealth -= cost;
  home.condition = Math.min(100, (home.condition || 0) + reno.cond);
  home.renovationLog.push({ year: gameYear(), id: reno.id, label: reno.label, cost: cost });
  home.renovationsDone[renovationId] = timesDone + 1;

  if (target === 'parents' && S.parentsHome) {
    S.parentsHome.value = Math.round(S.parentsHome.value * (1 + reno.valueAdd));
    S.parentsHome.renovationLevel = (S.parentsHome.renovationLevel || 0) + 1;
    (S.family || []).forEach(function(m) {
      if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
        m.bond = Math.min(100, (m.bond || 70) + 3);
      }
    });
  }

  const happyEffects = { happiness: reno.hap || 0 };
  if (reno.health) happyEffects.health = reno.health;
  if (reno.social) happyEffects.social = reno.social;
  fx(happyEffects);

  log('🔧 ' + reno.label + ' completed for ' + money(cost) + '. Condition +' + reno.cond + '%' + (target === 'parents' ? ' · Parents happy (+3 bond each)' : '') + '.');
  render();
};

/* ---------- RENOVATION PICKER VIEW ---------- */
function renderRenovationPicker(target) {
  const home = target === 'parents' ? S.parentsHome : S.rentedHome;
  if (!home) {
    return '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">No home to renovate</h3>' +
      '<button class="opt" style="margin-top:8px" onclick="assetsCloseRenovation()">← Back</button></div>';
  }

  const isRental = target === 'rented';
  const tier = isRental && rentalTierById(home.tierId) ? rentalTierById(home.tierId) : null;
  const title = isRental ? (tier ? tier.label : 'Rented Home') : "Parents' Home";
  const rateRatio = (C().rate || 1) / 52.7;
  const condColor = home.condition > 80 ? '#34d399' : home.condition > 50 ? '#fbbf24' : '#fb7185';

  let html = '<div class="card" style="border-color:#fbbf24">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<h3 style="color:#fbbf24;margin:0">🔧 Renovation Catalog</h3>' +
    '<button class="pill" style="padding:4px 10px;font-size:.72rem" onclick="assetsCloseRenovation()">← Back</button>' +
    '</div>' +
    '<div class="muted small" style="margin-top:6px">' + title + ' · ' + C().name + '</div>' +
    '<div class="row" style="margin-top:8px"><span>Current condition</span><b style="color:' + condColor + '">' + (home.condition || 0) + '%</b></div>' +
    (target === 'parents' ? '<div class="row"><span>Home value</span><b class="mono">' + money(home.value) + '</b></div>' : '') +
    '<div class="row"><span>Your cash</span><b class="mono">' + money(S.wealth) + '</b></div>' +
    '</div>';

  if (isRental) {
    html += '<div class="card" style="border-color:#fb7185;padding:10px"><p class="muted small" style="margin:0">You rent this property — only cosmetic upgrades are available. Structural work belongs in the Real Estate market, not the rental catalog.</p></div>';
  }

  /* Group by category */
  RENOVATION_CATEGORIES.forEach(function(cat) {
    const catRenos = PARENT_RENOVATIONS.filter(function(r) {
      if (r.category !== cat) return false;
      if (isRental && RENTAL_RENOVATION_IDS.indexOf(r.id) < 0) return false;
      return true;
    });
    if (!catRenos.length) return;

    html += '<div class="card"><h4 style="font-size:.85rem;color:#fbbf24;margin:0 0 8px 0;letter-spacing:.06em">' + cat.toUpperCase() + '</h4>';

    catRenos.forEach(function(reno) {
      const timesDone = (home.renovationsDone && home.renovationsDone[reno.id]) || 0;
      const cost = Math.round(reno.baseCost * rateRatio * Math.pow(1.30, timesDone));
      const canAfford = S.wealth >= cost;

      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-weight:700">' + reno.label + (timesDone > 0 ? ' <span class="muted small" style="font-size:.7rem">(done ' + timesDone + '×)</span>' : '') + '</div>' +
        '<div class="muted small" style="margin-top:2px">' + reno.desc + '</div>' +
        '<div class="muted small" style="margin-top:4px;color:#8b5cf6">' +
        'Cond +' + reno.cond + '% · Happy +' + reno.hap +
        (reno.health ? ' · Health +' + reno.health : '') +
        (reno.social ? ' · Social +' + reno.social : '') +
        (reno.valueAdd && target === 'parents' ? ' · Value +' + Math.round(reno.valueAdd * 100) + '%' : '') +
        '</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0"><b class="mono" style="font-size:.85rem">' + money(cost) + '</b></div>' +
        '</div>' +
        '<button class="opt" style="margin-top:8px;width:100%;text-align:center;font-size:.75rem;padding:8px;' +
        (canAfford ? 'background:#34d39920;border-color:#34d399' : 'opacity:.5') + '" ' +
        (canAfford ? '' : 'disabled') +
        ' onclick="assetsBuyRenovation(\'' + reno.id + '\')">' +
        (canAfford ? 'Renovate · ' + money(cost) : 'Cannot afford · ' + money(cost)) +
        '</button>' +
        '</div>';
    });

    html += '</div>';
  });

  if (home.renovationLog && home.renovationLog.length) {
    html += '<div class="card"><h3>📖 Renovation History</h3>';
    home.renovationLog.slice().reverse().forEach(function(entry) {
      html += '<div class="row" style="padding:4px 0;font-size:.78rem">' +
        '<span>' + entry.year + ' · ' + entry.label + '</span>' +
        '<b class="mono">' + money(entry.cost) + '</b>' +
        '</div>';
    });
    html += '</div>';
  }

  return html;
}

/* ---------- MAIN VIEW ---------- */
function assetsView() {
  ensureAssetsState();
  if (S.age < 18) {
    return '<div class="card"><h3>Assets</h3><p class="muted">Available from age 18.</p></div>';
  }

  /* Route to renovation picker if active */
  if (S.assetsRenovateHome) {
    return renderRenovationPicker(S.assetsRenovateHome);
  }

  const housing = currentHousing();
  let html = renderHousingSection(housing);

  const expenses = (function() {
    if (S.housing === 'parents') return Math.round((C().prices.phone || 0) * 0.5 + (C().prices.transport || 0) * 0.25);
    if (S.housing === 'rented') return (C().prices.food || 0) + (C().prices.phone || 0) + (C().prices.transport || 0) + currentYearlyRent();
    return (C().prices.food || 0) + (C().prices.phone || 0) + (C().prices.transport || 0);
  })();
  const income = (S.job ? S.job.salary : 0) + (S.career && S.career.partTime ? S.career.partTime.salary : 0);
  const net = income - expenses;

  html += '<div class="card"><h3>💰 Wealth</h3>' +
    '<div class="row"><span>Cash</span><b class="mono ' + (S.wealth < 0 ? 'bad' : '') + '">' + money(S.wealth) + '</b></div>' +
    '<div class="row"><span>Annual income</span><b class="mono good">' + money(income) + '</b></div>' +
    '<div class="row"><span>Annual expenses</span><b class="mono bad">' + money(expenses) + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Net per year</b><b class="mono ' + (net >= 0 ? 'good' : 'bad') + '">' + money(net) + '</b></div>' +
    '</div>';

  html += '<div class="card"><p class="muted small">For the full property market see the <b>Real Estate</b> tab. For banking, cards, loans and investments see the <b>Bank</b> tab.</p></div>';
  return html;
}

function renderHousingSection(housing) {
  let html = '';

  if (housing.kind === 'parents') {
    const h = housing.home;
    const condColor = h.condition > 80 ? '#34d399' : h.condition > 50 ? '#fbbf24' : '#fb7185';
    const itemsCount = housingItemsCount('parents');
    const itemsValue = housingItemsValue('parents');
    let gehazText = '';
    if (S.marriage && S.marriage.trousseau && S.marriage.trousseau.completed && housing.home && housing.home.id === S.realEstateActiveHomeId) {
      const tierDef = MARRIAGE_TROUSSEAU_TIERS.find(t => t.id === S.marriage.trousseau.tier);
      gehazText = `<div class="row"><span>Gehaz (Trousseau)</span><b class="good">${tierDef.label}</b></div>`;
    }
    const renoCount = Object.keys(h.renovationsDone || {}).reduce(function(s, k) { return s + h.renovationsDone[k]; }, 0);

    html += '<div class="card" style="border-color:#22d3ee">' +
      '<h3 style="color:#22d3ee">📍 Your Current Home</h3>' +
      '<div class="muted small" style="margin-bottom:8px">👨‍👩‍👧 Living with parents</div>' +
      '<div style="font-weight:700;font-size:1.05rem">Parents\' Home</div>' +
      '<div class="muted small" style="margin-bottom:10px">' + C().name + ' · ' + h.area + ' m² · ' + h.rooms + ' rooms · Built ' + h.yearBuilt + '</div>' +
      '<div class="row"><span>Ownership</span><b style="text-align:right;max-width:60%;font-size:.8rem">' + ownershipLabel(h.ownership) + '</b></div>' +
      '<div class="row"><span>Estimated value</span><b class="mono">' + money(h.value) + '</b></div>' +
      '<div class="row"><span>Condition</span><b style="color:' + condColor + '">' + h.condition + '%</b></div>' +
      (renoCount > 0 ? '<div class="row"><span>Renovations made</span><b>' + renoCount + ' upgrade' + (renoCount > 1 ? 's' : '') + '</b></div>' : '') +
      (itemsCount > 0 ? '<div class="row"><span>Your furniture/appliances</span><b>' + itemsCount + ' item' + (itemsCount > 1 ? 's' : '') + ' · ' + money(itemsValue) + '</b></div>' : '') +
      '<p class="muted small" style="margin-top:10px;padding:8px;background:#0f0f1a;border-radius:6px">You live with your parents. They cover utilities and groceries. Buy furniture or appliances for your room or renovate the family home.</p>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">' +
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsBuyFurniture(\'parents\',\'furniture\')">🛋 Buy furniture for this home</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsBuyFurniture(\'parents\',\'appliances\')">🍳 Buy appliances for this home</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem;background:#fbbf2420;border-color:#fbbf24;font-weight:700" onclick="assetsRenovateHome(\'parents\')">🔧 Open Renovation Catalog →</button>' +
      '</div></div>';

    html += '<div class="card"><h3>🏠 Move Out — Rental Options</h3>' +
      '<p class="muted small" style="margin-bottom:8px">You need first month + deposit (2× monthly) to move in.</p>';
    RENTAL_TIERS.forEach(function(tier) {
      const yearly = rentalCostForTier(tier);
      const monthly = Math.round(yearly / 12);
      const moveIn = monthly * 2;
      const canAfford = S.wealth >= moveIn;
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + tier.label + '</b><b class="mono">' + money(yearly) + '/yr</b></div>' +
        '<div class="muted small">' + tier.area + ' m² · ' + money(monthly) + '/mo · Move-in: ' + money(moveIn) + '</div>' +
        '<div class="muted small" style="font-style:italic">' + tier.desc + '</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;' + (canAfford ? 'background:#34d39920;border-color:#34d399' : 'opacity:.5') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="assetsRentHome(\'' + tier.id + '\')">' +
        (canAfford ? 'Move in · ' + money(moveIn) : 'Need ' + money(moveIn)) +
        '</button>' +
        '</div>';
    });
    html += '</div>';
  }

  else if (housing.kind === 'rented') {
    const h = housing.home;
    const tier = rentalTierById(h.tierId) || rentalTierById('br2');
    const condColor = h.condition > 80 ? '#34d399' : h.condition > 50 ? '#fbbf24' : '#fb7185';
    const itemsCount = housingItemsCount('rented');
    const itemsValue = housingItemsValue('rented');

    html += '<div class="card" style="border-color:#22d3ee">' +
      '<h3 style="color:#22d3ee">📍 Your Current Home</h3>' +
      '<div class="muted small" style="margin-bottom:8px">🔑 Renting</div>' +
      '<div style="font-weight:700;font-size:1.05rem">' + (tier ? tier.label : 'Rented Apartment') + '</div>' +
      '<div class="muted small" style="margin-bottom:10px">' + C().name + ' · ' + h.area + ' m² · Rented since ' + (h.rentedYear || gameYear()) + '</div>' +
      '<div class="row"><span>Yearly rent</span><b class="mono bad">-' + money(h.yearlyRent) + '</b></div>' +
      '<div class="row"><span>Monthly rent</span><b class="mono bad">-' + money(Math.round(h.yearlyRent / 12)) + '</b></div>' +
      '<div class="row"><span>Condition</span><b style="color:' + condColor + '">' + h.condition + '%</b></div>' +
      (itemsCount > 0 ? '<div class="row"><span>Your furniture/appliances</span><b>' + itemsCount + ' item' + (itemsCount > 1 ? 's' : '') + ' · ' + money(itemsValue) + '</b></div>' : '') +
      '<p class="muted small" style="margin-top:10px;padding:8px;background:#0f0f1a;border-radius:6px">You can\'t structurally modify a rental. Buy furniture from Shopping to decorate.</p>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">' +
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsBuyFurniture(\'rented\',\'furniture\')">🛋 Buy furniture for this home</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsBuyFurniture(\'rented\',\'appliances\')">🍳 Buy appliances for this home</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem;background:#fbbf2420;border-color:#fbbf24;font-weight:700" onclick="assetsRenovateHome(\'rented\')">🔧 Cosmetic Upgrades →</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem;border-color:#fb7185;color:#fb7185" onclick="assetsMoveBackToParents()">🏠 Move back to parents</button>' +
      '</div></div>';

    html += '<div class="card"><h3>🏠 Change Your Rental</h3>';
    RENTAL_TIERS.forEach(function(t) {
      if (t.id === h.tierId) return;
      const yearly = rentalCostForTier(t);
      const monthly = Math.round(yearly / 12);
      const oldMonthly = Math.round(h.yearlyRent / 12);
      const diff = monthly - oldMonthly;
      const depositNeeded = Math.max(0, diff * 2);
      const canAfford = S.wealth >= depositNeeded;
      const diffLabel = diff > 0 ? '+' + money(depositNeeded) + ' deposit' : diff < 0 ? 'Save ' + money(-diff) + '/mo' : 'Same monthly cost';
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + t.label + '</b><b class="mono">' + money(yearly) + '/yr</b></div>' +
        '<div class="muted small">' + t.area + ' m² · ' + money(monthly) + '/mo · ' + diffLabel + '</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;' + (canAfford ? '' : 'opacity:.5') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="assetsRentHome(\'' + t.id + '\')">' +
        (canAfford ? 'Switch · ' + money(yearly) + '/yr' : 'Need more cash') +
        '</button>' +
        '</div>';
    });
    html += '</div>';
  }

  else if (housing.kind === 'owned') {
    const h = housing.home;
    html += '<div class="card" style="border-color:#34d399">' +
      '<h3 style="color:#34d399">📍 Your Current Home</h3>' +
      '<div class="muted small" style="margin-bottom:8px">🏠 Owned home</div>' +
      '<div style="font-weight:700;font-size:1.05rem">' + h.name + '</div>' +
      '<div class="muted small">' + (h.city || C().name) + ' · ' + h.area + ' m²</div>' +
      '<div class="row"><span>Value</span><b class="mono">' + money(h.value || 0) + '</b></div>' +
      '<div class="row"><span>Condition</span><b>' + (h.condition || 100) + '%</b></div>' +
      '<p class="muted small" style="margin-top:10px">Manage renovations, furniture, staff and bills from <b>Real Estate → My Home &amp; Portfolio</b>.</p>' +
      '</div>';
  }

  return html;
}

/* ---------- YEARLY TICK ---------- */
GameHooks.on('year', function() {
  if (!S) return;
  const appRate = (typeof REAL_ESTATE_CONFIG !== 'undefined' && REAL_ESTATE_CONFIG.appreciationRates && REAL_ESTATE_CONFIG.appreciationRates[S.country]) || 0.05;

  if (S.parentsHome) {
    S.parentsHome.value = Math.round(S.parentsHome.value * (1 + appRate * 0.5));
    S.parentsHome.condition = Math.max(20, S.parentsHome.condition - Math.floor(Math.random() * 2));
  }
  if (S.rentedHome) {
    S.rentedHome.condition = Math.max(30, S.rentedHome.condition - Math.floor(Math.random() * 3));
    if (Math.random() < 0.20) {
      const hike = Math.round(S.rentedHome.yearlyRent * (0.05 + Math.random() * 0.10));
      S.rentedHome.yearlyRent += hike;
      log('⚠️ Your landlord raised the rent by ' + money(hike) + '. New rent: ' + money(S.rentedHome.yearlyRent) + '/year.');
    }
  }
});
/* Auto-terminate lease if you leave the country */
GameHooks.on('render', function() {
  if (!S || !S.rentedHome) return;
  if (S.country === S.rentedHome.country) return;

  const countryName = COUNTRIES[S.rentedHome.country] ? COUNTRIES[S.rentedHome.country].name : S.rentedHome.country;
  const breakFee = Math.round(S.rentedHome.yearlyRent * 0.5); // 6-month penalty for breaking lease

  log('🚪 You left ' + countryName + '. Your lease there was automatically terminated.');
  log('💸 Early termination penalty: ' + money(breakFee));

  if (S.wealth >= breakFee) {
    S.wealth -= breakFee;
  } else {
    S.wealth -= breakFee;
    log('⚠️ You went into debt to pay the lease break fee.');
  }

  S.housing = 'parents';
  S.rentedHome = null;
  S.assetsRenovateHome = null;
  render();
});
/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'assets', label: 'Assets', order: 4, view: assetsView });
