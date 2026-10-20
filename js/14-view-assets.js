/* ============================================================
   VIEW: ASSETS — Housing & Assets overview  (v2 overhaul)
   ============================================================
   Becomes your "Home Base" tab:
   - Current housing (parents / rented / owned) with rich details
   - Parents' home: value, ownership, condition, renovation
   - Rental options: multiple tiers aligned to game economy
   - Buy furniture/appliances for your current home
   - Wealth summary
   For the full property market, see the Real Estate tab.
   ============================================================ */

/* ---------- GLOBAL HELPER (used by engine, settlement, lifestyle) ---------- */
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

  if (S.housing === 'parents' && !S.parentsHome) ensureParentsHome();
  if (S.housing === 'rented' && !S.rentedHome) {
    // Migrate legacy rented save — matches old behavior (C().prices.rent)
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

/* ---------- PARENTS' HOME GENERATION ---------- */
const PARENTS_HOME_VALUE_EGP = {
  poor: 800000,
  'lower-mid': 1500000,
  middle: 3000000,
  'upper-mid': 6000000,
  wealthy: 18000000,
  ultra: 60000000
};
const PARENTS_HOME_AREA = {
  poor: 60, 'lower-mid': 90, middle: 130,
  'upper-mid': 180, wealthy: 400, ultra: 900
};
const PARENTS_HOME_ROOMS = {
  poor: 2, 'lower-mid': 3, middle: 4,
  'upper-mid': 6, wealthy: 10, ultra: 18
};

function ensureParentsHome() {
  if (!S) return;
  if (S.parentsHome) return;
  const tier = S.familyTier || 'middle';
  const egpValue = PARENTS_HOME_VALUE_EGP[tier] || 3000000;
  const rate = (typeof C === 'function' && C().rate) ? C().rate : 52.7;
  const value = S.country === 'egy' ? egpValue : Math.round(egpValue / 52.7 * rate);

  /* Ownership pattern — depends on family tier */
  let ownership = 'both_parents';
  const r = Math.random();
  if (tier === 'poor' || tier === 'lower-mid') {
    if (r < 0.40) ownership = 'joint_with_family';
    else if (r < 0.60) ownership = 'father';
    else if (r < 0.75) ownership = 'mother';
    else ownership = 'both_parents';
  } else if (tier === 'wealthy' || tier === 'ultra') {
    if (r < 0.50) ownership = 'both_parents';
    else if (r < 0.85) ownership = 'father';
    else ownership = 'mother';
  } else {
    if (r < 0.70) ownership = 'both_parents';
    else if (r < 0.88) ownership = 'father';
    else ownership = 'mother';
  }

  /* Year built — parents bought/built it well before the player was born */
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
  if (S.housing === 'parents') {
    ensureParentsHome();
    return { kind: 'parents', home: S.parentsHome };
  }
  if (S.housing === 'rented') {
    if (!S.rentedHome) {
      S.rentedHome = {
        tierId: 'br2',
        yearlyRent: (C().prices && C().prices.rent) || 120000,
        area: 100,
        condition: 75,
        rentedYear: gameYear()
      };
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

/* ---------- ACTIONS ---------- */
window.assetsRentHome = function(tierId) {
  ensureAssetsState();
  const tier = rentalTierById(tierId);
  if (!tier) return;
  const yearly = rentalCostForTier(tier);

  /* Moving out of parents' home */
  if (S.housing === 'parents') {
    const moveInCost = Math.round(yearly / 12 * 2);
    if (S.wealth < moveInCost) {
      log('❌ Need ' + money(moveInCost) + ' to move in (first month + deposit).');
      render(); return;
    }
    if (!confirm('Move out of your parents\' home into a ' + tier.label + '?\n\nRent: ' + money(yearly) + '/year\nMove-in cost: ' + money(moveInCost) + '\n\nProceed?')) return;
    S.wealth -= moveInCost;
    S.housing = 'rented';
    S.rentedHome = {
      tierId: tier.id,
      yearlyRent: yearly,
      area: tier.area,
      condition: tier.cond,
      rentedYear: gameYear()
    };
    log('🔑 Rented a ' + tier.label + ' for ' + money(yearly) + '/year. You moved out.');
    fx({ happiness: 8 });
    render(); return;
  }

  /* Changing rental */
  if (S.housing === 'rented') {
    const oldMonthly = Math.round((S.rentedHome.yearlyRent || 0) / 12);
    const newMonthly = Math.round(yearly / 12);
    const diff = newMonthly - oldMonthly;
    const depositNeeded = Math.max(0, diff * 2);
    if (S.wealth < depositNeeded) {
      log('❌ Need ' + money(depositNeeded) + ' extra deposit.');
      render(); return;
    }
    if (!confirm('Switch to a ' + tier.label + '?\n\nNew rent: ' + money(yearly) + '/year\n' + (diff > 0 ? 'Extra deposit: ' + money(depositNeeded) : 'No extra deposit required.') + '\n\nProceed?')) return;
    if (depositNeeded > 0) S.wealth -= depositNeeded;
    S.rentedHome = {
      tierId: tier.id,
      yearlyRent: yearly,
      area: tier.area,
      condition: tier.cond,
      rentedYear: gameYear()
    };
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
  log('🏠 Moved back in with your parents.');
  fx({ happiness: -3 });
  render();
};

window.assetsRenovateHome = function(homeId) {
  const rateRatio = (C().rate || 1) / 52.7;
  const cost = Math.round((homeId === 'parents' ? 30000 : 20000) * rateRatio);

  if (S.wealth < cost) { log('❌ Need ' + money(cost) + ' for renovation.'); render(); return; }
  if (!confirm('Renovate this home for ' + money(cost) + '?\n\nImproves condition and comfort.')) return;

  S.wealth -= cost;
  if (homeId === 'parents' && S.parentsHome) {
    S.parentsHome.condition = Math.min(100, S.parentsHome.condition + 10);
    S.parentsHome.renovationLevel = (S.parentsHome.renovationLevel || 0) + 1;
    (S.family || []).forEach(function(m) {
      if ((m.role === 'Mother' || m.role === 'Father') && m.alive !== false) {
        m.bond = Math.min(100, (m.bond || 70) + 3);
      }
    });
    log('🔧 Renovated the family home for ' + money(cost) + '. Condition +10. Parents appreciate it.');
  } else if (homeId === 'rented' && S.rentedHome) {
    S.rentedHome.condition = Math.min(100, S.rentedHome.condition + 10);
    log('🔧 Renovated your rental for ' + money(cost) + '. Condition +10.');
  }
  fx({ happiness: 3 });
  render();
};

window.assetsBuyFurniture = function(homeId, category) {
  if (typeof ensureShoppingState === 'function') ensureShoppingState();
  if (!S.shopping) {
    log('❌ Shopping system not available.');
    return;
  }

  /* Set the shop sub-tab BEFORE switching */
  S.shopping.tab = category || 'furniture';

  /* Log a hint so the player knows the destination */
  const homeLabel = homeId === 'parents' ? "your parents' home"
                  : homeId === 'rented'  ? 'your rental'
                  : 'your home';
  log('🛍 Opening shopping — items you buy will be placed in ' + homeLabel + '.');

  /* THIS is the actual fix: use switchTab(), not window.activeTab */
  if (typeof switchTab === 'function') {
    switchTab('shopping');
  } else {
    render();
  }
};

/* ---------- MAIN VIEW ---------- */
function assetsView() {
  ensureAssetsState();
  if (S.age < 18) {
    return '<div class="card"><h3>Assets</h3><p class="muted">Available from age 18.</p></div>';
  }

  const housing = currentHousing();
  let html = '';

  html += renderHousingSection(housing);

  /* Wealth summary */
  const expenses = (function() {
    if (S.housing === 'parents') {
      return Math.round((C().prices.phone || 0) * 0.5 + (C().prices.transport || 0) * 0.25);
    }
    if (S.housing === 'rented') {
      return (C().prices.food || 0) + (C().prices.phone || 0) + (C().prices.transport || 0) + currentYearlyRent();
    }
    return (C().prices.food || 0) + (C().prices.phone || 0) + (C().prices.transport || 0);
  })();
  const income = (S.job ? S.job.salary : 0) +
                 (S.career && S.career.partTime ? S.career.partTime.salary : 0);
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

  /* ---------- LIVING WITH PARENTS ---------- */
  if (housing.kind === 'parents') {
    const h = housing.home;
    const condColor = h.condition > 80 ? '#34d399' : h.condition > 50 ? '#fbbf24' : '#fb7185';
    const itemsCount = housingItemsCount('parents');
    const itemsValue = housingItemsValue('parents');
    const renovCost = Math.round(30000 * ((C().rate || 1) / 52.7));

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
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsRenovateHome(\'parents\')">🔧 Help renovate the family home (' + money(renovCost) + ')</button>' +
      '</div></div>';

    /* Move out — rental picker */
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

  /* ---------- RENTED ---------- */
  else if (housing.kind === 'rented') {
    const h = housing.home;
    const tier = rentalTierById(h.tierId) || rentalTierById('br2');
    const condColor = h.condition > 80 ? '#34d399' : h.condition > 50 ? '#fbbf24' : '#fb7185';
    const itemsCount = housingItemsCount('rented');
    const itemsValue = housingItemsValue('rented');
    const renovCost = Math.round(20000 * ((C().rate || 1) / 52.7));

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
      '<button class="opt" style="text-align:center;font-size:.78rem" onclick="assetsRenovateHome(\'rented\')">🔧 Improve condition (' + money(renovCost) + ')</button>' +
      '<button class="opt" style="text-align:center;font-size:.78rem;border-color:#fb7185;color:#fb7185" onclick="assetsMoveBackToParents()">🏠 Move back to parents</button>' +
      '</div></div>';

    /* Change rental */
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

  /* ---------- OWNED ---------- */
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

/* ---------- YEARLY TICK — parents' home and rented home drift ---------- */
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
      // Landlord raises rent yearly
      const hike = Math.round(S.rentedHome.yearlyRent * (0.05 + Math.random() * 0.10));
      S.rentedHome.yearlyRent += hike;
      log('⚠️ Your landlord raised the rent by ' + money(hike) + '. New rent: ' + money(S.rentedHome.yearlyRent) + '/year.');
    }
  }
});

/* ---------- REGISTER TAB (unchanged order) ---------- */
GameHooks.registerTab({ id: 'assets', label: 'Assets', order: 4, view: assetsView });
