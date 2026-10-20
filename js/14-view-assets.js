/* ============================================================
   VIEW: ASSETS — Housing & Assets overview  (v3)
   ============================================================
   Home Base tab with:
   - Parents' home: value, ownership, DETAILED renovation picker
   - Rental options (10 tiers)
   - Buy furniture/appliances → switches to Shopping tab correctly
   - Cosmetic upgrade picker for rentals
   ============================================================ */

/* ---------- GLOBAL HELPER ---------- */
function currentYearlyRent() {
  if (S && S.rentedHome && typeof S.rentedHome.yearlyRent === 'number') {
    return S.rentedHome.yearlyRent;
  }
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
    S.rentedHome = {
      tierId: 'br2',
      yearlyRent: (C().prices && C().prices.rent) || 120000,
      area: 100,
      condition: 75,
      rentedYear: gameYear()
    };
  }
}
GameHooks.on('newGame', ensureAssetsState);
GameHooks.on('migrate', ensureAssetsState);

/* ---------- RENOVATION CATALOG ---------- */
/* Costs are EGP base — scaled by C().rate / 52.7 at purchase time. */
const PARENT_RENOVATIONS = [
  { id: 'bathroom',    label: '🚿 Bathroom Renovation',    baseCost: 25000, cond: 8,  hap: 3, valueAdd: 0.03,  desc: 'New fixtures, tiles, shower head, mirror.' },
  { id: 'kitchen',     label: '🍳 Kitchen Remodel',        baseCost: 40000, cond: 10, hap: 4, valueAdd: 0.05,  desc: 'New cabinets, counters, sink, backsplash.' },
  { id: 'walls',       label: '🎨 Walls & Paint',          baseCost: 8000,  cond: 3,  hap: 2, valueAdd: 0.01,  desc: 'Fresh paint throughout the home.' },
  { id: 'flooring',    label: '🪵 New Flooring',           baseCost: 20000, cond: 5,  hap: 3, valueAdd: 0.02,  desc: 'Replace old tiles or worn carpet.' },
  { id: 'living_room', label: '🛋 Living Room Refresh',    baseCost: 15000, cond: 4,  hap: 3, valueAdd: 0.015, desc: 'Paint, lighting, minor layout updates.' },
  { id: 'ac',          label: '❄️ AC System Upgrade',      baseCost: 35000, cond: 4,  hap: 4, valueAdd: 0.04,  desc: 'Modern split ACs installed in all rooms.' },
  { id: 'doors',       label: '🚪 New Interior Doors',     baseCost: 12000, cond: 3,  hap: 2, valueAdd: 0.01,  desc: 'Replace interior and entry doors.' },
  { id: 'windows',     label: '🪟 Window Replacement',     baseCost: 18000, cond: 3,  hap: 2, valueAdd: 0.02,  desc: 'Double-glazed windows, better insulation.' },
  { id: 'electrical',  label: '⚡ Electrical Rewiring',    baseCost: 30000, cond: 6,  hap: 2, valueAdd: 0.02,  desc: 'Safe modern wiring, new outlets.' },
  { id: 'plumbing',    label: '🚰 Plumbing Overhaul',      baseCost: 22000, cond: 6,  hap: 2, valueAdd: 0.02,  desc: 'Replace old pipes and fixtures.' },
  { id: 'lighting',    label: '💡 Modern Lighting',        baseCost: 10000, cond: 2,  hap: 2, valueAdd: 0.01,  desc: 'LED fixtures in all rooms.' },
  { id: 'roof',        label: '🏠 Roof Repair',            baseCost: 28000, cond: 7,  hap: 1, valueAdd: 0.03,  desc: 'Seal leaks, replace damaged tiles.' },
  { id: 'exterior',    label: '🧱 Exterior Facade',        baseCost: 32000, cond: 5,  hap: 2, valueAdd: 0.03,  desc: 'Repaint building exterior.' },
  { id: 'balcony',     label: '🌿 Balcony / Terrace',      baseCost: 14000, cond: 3,  hap: 3, valueAdd: 0.02,  desc: 'Tiles, railing, planters.' }
];
window.PARENT_RENOVATIONS = PARENT_RENOVATIONS;

/* Rentals only allow cosmetic upgrades — no structural work */
const RENTAL_RENOVATION_IDS = ['walls', 'lighting', 'balcony'];

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
function rentalTierById(id) {
  return RENTAL_TIERS.find(function(t) { return t.id === id; }) || null;
}

/* ---------- HELPERS ---------- */
function currentHousing() {
  if (!S) return { kind: 'unknown', home: null };
  if (S.housing === 'parents') { ensureParentsHome(); return { kind: 'parents', home: S.parentsHome }; }
  if (S.housing === 'rented') {
    if (!S.rentedHome) {
      S.rentedHome = { tierId: 'br2', yearlyRent: (C().prices && C().prices.rent) || 120000, area: 100, condition: 75, rentedYear: gameYear() };
    }
    return { kind: 'rented', home: S.rentedHome };
  }
  if (S.housing === 'owned') {
    const h = (S.ownedHomes || []).find(function(x) { return x.status === 'occupied'; });
    if (h) return { kind: 'owned', home: h };
  }
  return { kind: 'unknown', home: null };
}

function housingItemsCount(homeId) {
  if (!S.shopping || !Array.isArray(S.shopping.inventory)) return 0;
  return S.shopping.inventory.filter(function(i) {
    return i.homeId === homeId && (i.cat === 'furniture' || i.cat === 'appliances');
  }).length;
}
function housingItemsValue(homeId) {
  if (!S.shopping || !Array.isArray(S.shopping.inventory)) return 0;
  return S.shopping.inventory
    .filter(function(i) { return i.homeId === homeId && (i.cat === 'furniture' || i.cat === 'appliances'); })
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
    S.rentedHome = { tierId: tier.id, yearlyRent: yearly, area: tier.area, condition: tier.cond, rentedYear: gameYear() };
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

/* ---------- FIXED: Route through switchTab (was broken) ---------- */
window.assetsBuyFurniture = function(homeId, category) {
  if (!S.shopping) { log('❌ Shopping system not available.'); return; }
  const tab = category || 'furniture';
  S.shopping.tab = tab;
  if (typeof ensureShoppingState === 'function') ensureShoppingState();
  /* The engine's activeTab is a `let` — must use switchTab, not window.activeTab */
  if (typeof switchTab === 'function') switchTab('shopping');
  else render();
};

/* ---------- OPEN / CLOSE RENOVATION PICKER ---------- */
window.assetsRenovateHome = function(homeId) {
  S.assetsRenovateHome = homeId || 'parents';
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
    log('❌ Rentals cannot have structural renovations. Only walls, lighting or balcony.');
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
  if (!confirm('Renovate: ' + reno.label + '\n\nCost: ' + money(cost) + '\nCondition +' + reno.cond + '% · Happiness +' + reno.hap + '\n\nProceed?')) return;

  S.wealth -= cost;
  home.condition = Math.min(100, (home.condition || 0) + reno.cond);
  home.renovationLog.push({ year: gameYear(), id: reno.id, label: reno.label, cost: cost });
  home.renovationsDone[reno.id] = timesDone + 1;

  if (target === 'parents' && S.parentsHome) {
    S.parentsHome.value = Math.round(S.parentsHome.value * (1 + reno.valueAdd));
    S.parentsHome.renovationLevel = (S.parentsHome.renovationLevel || 0) + 1;
    (S.family || []).forEach(function(m) {
      if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
        m.bond = Math.min(100, (m.bond || 70) + 3);
      }
    });
  }

  fx({ happiness: reno.hap });
  log('🔧 ' + reno.label + ' completed for ' + money(cost) + '. Condition +' + reno.cond + '%.');
  render();
};

/* ---------- RENOVATION PICKER VIEW ---------- */
function renderRenovationPicker(target) {
  const home = target === 'parents' ? S.parentsHome : S.rentedHome;
  if (!home) return '<div class="card"><h3>No home to renovate</h3></div>';

  const isRental = target === 'rented';
  const tier = isRental && rentalTierById(home.tierId) ? rentalTierById(home.tierId) : null;
  const title = isRental ? (tier ? tier.label : 'Rented Home') : "Parents' Home";
  const rateRatio = (C().rate || 1) / 52.7;

  let html = '<div class="card" style="border-color:#fbbf24">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<h3 style="color:#fbbf24;margin:0">🔧 Renovate — ' + title + '</h3>' +
    '<button class="pill" style="padding:4px 10px;font-size:.72rem" onclick="assetsCloseRenovation()">← Back</button>' +
    '</div>' +
    '<div class="row" style="margin-top:8px"><span>Current condition</span><b>' + (home.condition || 0) + '%</b></div>' +
    (target === 'parents' ? '<div class="row"><span>Home value</span><b class="mono">' + money(home.value) + '</b></div>' : '') +
    '<div class="row"><span>Your cash</span><b class="mono">' + money(S.wealth) + '</b></div>' +
    '</div>';

  if (isRental) {
    html += '<div class="card" style="border-color:#fb7185;padding:10px"><p class="muted small" style="margin:0">You don\'t own this property. Only cosmetic upgrades are available (paint, lighting, balcony). Structural work belongs to the landlord.</p></div>';
  }

  html += '<div class="card"><h3>Choose a renovation</h3>';

  const availableList = isRental
    ? PARENT_RENOVATIONS.filter(function(r) { return RENTAL_RENOVATION_IDS.indexOf(r.id) >= 0; })
    : PARENT_RENOVATIONS;

  availableList.forEach(function(reno) {
    const timesDone = (home.renovationsDone && home.renovationsDone[reno.id]) || 0;
    const cost = Math.round(reno.baseCost * rateRatio * Math.pow(1.30, timesDone));
    const canAfford = S.wealth >= cost;

    html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div style="flex:1"><div style="font-weight:700">' + reno.label + (timesDone > 0 ? ' <span class="muted small">(done ' + timesDone + '×)</span>' : '') + '</div>' +
      '<div class="muted small">' + reno.desc + '</div>' +
      '<div class="muted small">Condition +' + reno.cond + '% · Happiness +' + reno.hap + (reno.valueAdd ? ' · Value +' + Math.round(reno.valueAdd * 100) + '%' : '') + '</div></div>' +
      '<div style="text-align:right;flex-shrink:0;margin-left:8px"><b class="mono">' + money(cost) + '</b></div>' +
      '</div>' +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;' + (canAfford ? 'background:#34d39920;border-color:#34d399' : 'opacity:.5') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="assetsBuyRenovation(\'' + reno.id + '\')">' + (canAfford ? 'Renovate' : 'Cannot afford') + '</button>' +
      '</div>';
  });

  html += '</div>';

  if (home.renovationLog && home.renovationLog.length) {
    html += '<div class="card"><h3>📖 Renovation History</h3>';
    home.renovationLog.slice().reverse().forEach(function(entry) {
      html += '<div class="row" style="padding:4px 0;font-size:.78rem"><span>' + entry.year + ' · ' + entry.label + '</span><b class="mono">' + money(entry.cost) + '</b></div>';
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

  /* Safety: clear picker if housing status changed */
  if (S.assetsRenovateHome === 'parents' && S.housing !== 'parents') S.assetsRenovateHome = null;
  if (S.assetsRenovateHome === 'rented' && S.housing !== 'rented') S.assetsRenovateHome = null;

  /* Route to renovation picker if active */
  if (S.assetsRenovateHome) {
    return renderRenovationPicker(S.assetsRenovateHome);
  }

  const housing = currentHousing();
  let html = '';

  html += renderHousingSection(housing);

  const expenses = (function() {
    if (S.housing === 'parents') {
      return Math.round((C().prices.phone || 0) * 0.5 + (C().prices.transport || 0) * 0.25);
    }
    if (S.housing === 'rented') {
      return (C().prices.food || 0) + (C().prices.phone || 0) + (C().prices.transport || 0) + currentYearlyRent();
    }
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

  html += '<div class="card"><p class="muted small">For the full property market (compounds, land, renovations) see the <b>Real Estate</b> tab. For banking, cards, loans and investments see the <b>Bank</b> tab.</p></div>';

  return html;
}

function renderHousingSection(housing) {
  let html = '';

  if (housing.kind === 'parents') {
    const h = housing.home;
    const condColor = h.condition > 80 ? '#34d399' : h.condition > 50 ? '#fbbf24' : '#fb7185';
    const itemsCount = housingItemsCount('parents');
    const itemsValue = housingItemsValue('parents');

    html += '<div class="card" style="border-color:#22d3ee">' +
      '<h3 style="color:#22d3ee">📍 Your Current Home</h3>' +
      '<div class="muted small" style="margin-bottom:8px">👨‍👩‍👧 Living with parents</div>' +
      '<div style="font-weight:700;font-size:1.05rem">Parents\' Home</div>' +
      '<div class="muted small" style="margin-bottom:10px">' + C().name + ' · ' + h.area + ' m² · ' + h.rooms + ' rooms · Built ' + h.yearBuilt + '</div>' +
      '<div class="row"><span>Ownership</span><b style="text-align:right;max-width:60%;font-size:.8rem">' + ownershipLabel(h.ownership) + '</b></div>' +
      '<div class="row"><span>Estimated value</span><b class="mono">' + money(h.value) + '</b></div>' +
      '<div class="row"><span>Condition</span><b style="color:' + condColor + '">' + h.condition + '%</b></div>' +
      (h.renovationLevel > 0 ? '<div class="row"><span>Your renovations</span><b>' + h.renovationLevel + ' upgrade' + (h.renovationLevel > 1 ? 's' : '') + '</b></div>' : '') +
      (itemsCount > 0 ? '<div class="row"><span>Your furniture/appliances</span><b>' + itemsCount + ' item' + (itemsCount > 1 ? 's' : '') + ' · ' + money(itemsValue) + '</b></div>' : '') +
      '<p class="muted small" style="margin-top:10px;padding:8px;background:#0f0f1a;border-radius:6px">You live with your parents. They cover utilities and groceries. Buy furniture or appliances for your room, or help renovate the family home.</p>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">' +
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsBuyFurniture(\'parents\',\'furniture\')">🛋 Buy furniture for this home</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsBuyFurniture(\'parents\',\'appliances\')">🍳 Buy appliances for this home</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem;background:#fbbf2420;border-color:#fbbf24" onclick="assetsRenovateHome(\'parents\')">🔧 Help renovate the family home</button>' +
      '</div></div>';

    html += '<div class="card"><h3>🏠 Move Out — Rental Options</h3>' +
      '<p class="muted small" style="margin-bottom:8px">Choose a place to rent. You need first month + deposit (2× monthly) to move in.</p>';
    RENTAL_TIERS.forEach(function(tier) {
      const yearly = rentalCostForTier(tier);
      const monthly = Math.round(yearly / 12);
      const moveIn = monthly * 2;
      const canAfford = S.wealth >= moveIn;
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + tier.label + '</b><b class="mono">' + money(yearly) + '/yr</b></div>' +
        '<div class="muted small">' + tier.area + ' m² · ' + money(monthly) + '/mo · Move-in: ' + money(moveIn) + '</div>' +
        '<div class="muted small" style="font-style:italic">' + tier.desc + '</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;' + (canAfford ? 'background:#34d39920;border-color:#34d399' : 'opacity:.5') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="assetsRentHome(\'' + tier.id + '\')">' + (canAfford ? 'Rent this' : 'Cannot afford deposit') + '</button>' +
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
      '<p class="muted small" style="margin-top:10px;padding:8px;background:#0f0f1a;border-radius:6px">You can\'t structurally modify a rental. Buy furniture from Shopping to decorate. Move out or buy your own property for full management.</p>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">' +
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsBuyFurniture(\'rented\',\'furniture\')">🛋 Buy furniture for this home</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsBuyFurniture(\'rented\',\'appliances\')">🍳 Buy appliances for this home</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem;background:#fbbf2420;border-color:#fbbf24" onclick="assetsRenovateHome(\'rented\')">🔧 Cosmetic upgrades</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem;border-color:#fb7185;color:#fb7185" onclick="assetsMoveBackToParents()">🏠 Move back to parents</button>' +
      '</div></div>';

    html += '<div class="card"><h3>🏠 Change Your Rental</h3>' +
      '<p class="muted small" style="margin-bottom:8px">Move to a different property. Upgrades may require extra deposit.</p>';
    RENTAL_TIERS.forEach(function(t) {
      if (t.id === h.tierId) return;
      const yearly = rentalCostForTier(t);
      const monthly = Math.round(yearly / 12);
      const oldMonthly = Math.round(h.yearlyRent / 12);
      const diff = monthly - oldMonthly;
      const depositNeeded = Math.max(0, diff * 2);
      const canAfford = S.wealth >= depositNeeded;
      const diffLabel = diff > 0 ? '+' + money(depositNeeded) + ' deposit'
                       : diff < 0 ? 'Save ' + money(-diff) + '/mo'
                       : 'Same monthly cost';
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + t.label + '</b><b class="mono">' + money(yearly) + '/yr</b></div>' +
        '<div class="muted small">' + t.area + ' m² · ' + money(monthly) + '/mo · ' + diffLabel + '</div>' +
        '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem;' + (canAfford ? '' : 'opacity:.5') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="assetsRentHome(\'' + t.id + '\')">' + (canAfford ? 'Move here' : 'Cannot afford deposit') + '</button>' +
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
      '<p class="muted small" style="margin-top:10px">Manage renovations, furniture, staff and bills from the <b>Real Estate</b> tab → <b>My Home &amp; Portfolio</b>.</p>' +
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

/* ---------- REGISTER TAB ---------- */
GameHooks.registerTab({ id: 'assets', label: 'Assets', order: 4, view: assetsView });
