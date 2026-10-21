/* ============================================================
   VIEW: REAL ESTATE — Deep Market & Management
   ============================================================
   Expanded mechanics include:
   - Dynamic Market Trends (Boom, Crash, Stagnant)
   - Strict Bank Approval (Debt-to-Income ratios for installments)
   - Closing Costs (Agent commissions, registration fees, taxes)
   - Deep Landlord System (Tenant screening, vacancy, damages, eviction)
   - Raw Land Development (Zoning laws, architects, multi-year construction)
   ============================================================ */
/* ---------- CURRENCY HELPER ---------- */
function _reViewCurrency() {
  const vc = (S && S._reViewCountry) || (S && S.country) || 'egy';
  return (typeof COUNTRIES !== 'undefined' && COUNTRIES[vc] && COUNTRIES[vc].currency) || (typeof C === 'function' && C().currency) || 'EGP';
}
function _reViewCountryRate() {
  const vc = (S && S._reViewCountry) || (S && S.country) || 'egy';
  return (typeof COUNTRIES !== 'undefined' && COUNTRIES[vc] && COUNTRIES[vc].rate) || 1;
}
/* Currency-aware money formatter — displays in the property's own currency */
function moneyIn(amount, countryCode) {
  const c = COUNTRIES[countryCode];
  if (!c) return Math.round(amount || 0).toLocaleString();
  return Math.round(amount || 0).toLocaleString() + ' ' + c.currency;
}
window.moneyIn = moneyIn;
/* ---------- Sub-tab registry ---------- */
const RealEstateTabs = [];
function registerRealEstateTab(tab) {
  const existing = RealEstateTabs.findIndex(t => t.id === tab.id);
  if (existing >= 0) RealEstateTabs[existing] = tab;
  else RealEstateTabs.push(tab);
  RealEstateTabs.sort((a, b) => a.order - b.order);
}
window.registerRealEstateTab = registerRealEstateTab;

/* ---------- State init / migration ---------- */
function ensureRealEstateState() {
  if (!S) return;
  if (!Array.isArray(S.ownedHomes)) S.ownedHomes = [];
  if (!Array.isArray(S.land)) S.land = [];
  if (!Array.isArray(S.realestateContracts)) S.realestateContracts = [];
  if (!S.realEstateTab) S.realEstateTab = 'compounds';
  if (S.housing === undefined) S.housing = 'parents';
  if (!S.marketTrend) S.marketTrend = { state: 'normal', multiplier: 1.0, yearsLeft: 0 };

  S.ownedHomes.forEach(h => {
    if (typeof h.id !== 'string') h.id = 'h_' + Math.random().toString(36).slice(2, 8);
    if (typeof h.condition !== 'number') h.condition = 100;
    if (typeof h.status !== 'string') h.status = 'vacant'; // vacant, listed, rented, occupied, under_construction
    if (typeof h.value !== 'number') h.value = 0;
    if (typeof h.baseValue !== 'number') h.baseValue = h.value; // Pre-market fluctuation value
    if (typeof h.monthlyRent !== 'number') h.monthlyRent = Math.round(h.value * 0.0035);
    if (typeof h.listedRent !== 'number') h.listedRent = 0; // The price player is asking
    
    // Advanced Management Stats
    if (typeof h.hoaFee !== 'number') h.hoaFee = 0;
    if (typeof h.insurance !== 'boolean') h.insurance = false;
    if (typeof h.propertyTax !== 'number') h.propertyTax = 0;
    if (!h.tenant) h.tenant = null; // { name, reliability, monthsBehind, leaseEnds }
    if (typeof h.monthsVacant !== 'number') h.monthsVacant = 0;

    if (typeof h.hap !== 'number') h.hap = 0;
    if (typeof h.hp !== 'number') h.hp = 0;
    if (typeof h.area !== 'number') h.area = 130;
    if (typeof h.finishing !== 'string') h.finishing = 'core_shell';
    if (!Array.isArray(h.upgrades)) h.upgrades = [];
    if (!h.furniture || typeof h.furniture !== 'object') h.furniture = {};
    if (!Array.isArray(h.staff)) h.staff = [];
    if (typeof h.homeComfort !== 'number') h.homeComfort = 0;
    if (typeof h.style !== 'string') h.style = null;
    if (typeof h.unitId !== 'string') h.unitId = null;
    if (typeof h.source !== 'string') h.source = 'compound';
    if (typeof h.compoundId !== 'string') h.compoundId = null;
    if (typeof h.purchasedYear !== 'number') h.purchasedYear = gameYear();
  });

  if (!S.ownedHomes.find(h => h.id === S.realEstateActiveHomeId)) {
    S.realEstateActiveHomeId = S.ownedHomes[0]?.id || null;
  }
}
GameHooks.on('newGame', ensureRealEstateState);

/* ---------- Create a home (fully initialized) ---------- */
function createHome(base) {
  return Object.assign({
    id: 'h_' + Math.random().toString(36).slice(2, 8),
    name: 'Home', country: S?.country || 'egy', city: 'Unknown', location: 'Unknown',
    value: 0, baseValue: 0, condition: 100, status: 'vacant',
    monthlyRent: 0, listedRent: 0,
    hoaFee: 0, insurance: false, propertyTax: 0, tenant: null, monthsVacant: 0,
    hap: 0, hp: 0, area: 130, finishing: 'core_shell',
    upgrades: [], furniture: {}, staff: [], homeComfort: 0,
    style: null, unitId: null, source: 'compound', compoundId: null,
    purchasedYear: gameYear(),
  }, base);
}
window.createHome = createHome;

/* ---------- Main tab & Market Header ---------- */
function realEstateView() {
  ensureRealEstateState();

  /* Market country — lets you browse your home country from abroad */
  if (!S._reViewCountry || !COMPOUNDS[S._reViewCountry]) S._reViewCountry = S.country;
  const viewCountry = S._reViewCountry;
  const isViewingHome = viewCountry !== S.country;

  const availableTabs = RealEstateTabs.filter(t => !t.requiresHome || S.ownedHomes.length > 0);
  const currentTab = availableTabs.find(t => t.id === S.realEstateTab) || availableTabs[0];
  if (currentTab && S.realEstateTab !== currentTab.id) S.realEstateTab = currentTab.id;

  const trendIcon = S.marketTrend.state === 'boom' ? '🚀' : S.marketTrend.state === 'crash' ? '📉' : '⚖️';
  const trendColor = S.marketTrend.state === 'boom' ? '#34d399' : S.marketTrend.state === 'crash' ? '#fb7185' : '#e8e8f2';

  const homeCountry = S.homeCountry || S.country;
  const canViewHome = homeCountry !== S.country && COMPOUNDS[homeCountry];

  let html = `<div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3>Real Estate · ${viewCountry === S.country ? C().name : (COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].name : viewCountry)}</h3>
      <div class="small" style="color:${trendColor}">${trendIcon} ${S.marketTrend.state.toUpperCase()}</div>
    </div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
      ${availableTabs.map(t => `<button class="pill ${S.realEstateTab === t.id ? 'on' : ''}" style="padding:6px 10px;font-size:.75rem" onclick="S.realEstateTab='${t.id}';render()">${t.label}</button>`).join('')}
    </div>
    ${canViewHome ? `
      <div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">
        <button class="pill ${viewCountry === S.country ? 'on' : ''}" style="padding:5px 10px;font-size:.72rem" onclick="S._reViewCountry='${S.country}';render()">${COUNTRIES[S.country] ? COUNTRIES[S.country].flag : '📍'} Current market</button>
        <button class="pill ${viewCountry === homeCountry ? 'on' : ''}" style="padding:5px 10px;font-size:.72rem" onclick="S._reViewCountry='${homeCountry}';render()">${COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].flag : '🏠'} Home market</button>
      </div>
    ` : ''}
    ${isViewingHome ? `
      <div class="muted small" style="margin-top:6px;padding:8px;background:#0f0f1a;border-radius:6px">
        💡 Browsing ${COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].name : viewCountry} market from abroad. Prices in ${COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'local'} — will be converted at checkout.
      </div>
    ` : ''}
  </div>`;

  if (currentTab) html += currentTab.render();
  return html;
}

/* ---------- Market sections ---------- */
function compoundsSection() {
  const viewCountry = S._reViewCountry || S.country;
  const list = COMPOUNDS[viewCountry];
  if (!list || !list.length) return '<div class="card"><h3>No compounds yet</h3></div>';

  /* Filter state, resetting when country changes */
  if (!S._reFilters || S._reFilters.country !== S.country) {
    S._reFilters = { country: S.country, city: null, developer: null };
  }
  const f = S._reFilters;

  const cities = [];
  list.forEach(function(c) { if (cities.indexOf(c.city) < 0) cities.push(c.city); });
  cities.sort();

  const developers = [];
  list.forEach(function(c) { if (c.developer && developers.indexOf(c.developer) < 0) developers.push(c.developer); });
  developers.sort();

  const filtered = list.filter(function(c) {
    if (f.city && c.city !== f.city) return false;
    if (f.developer && c.developer !== f.developer) return false;
    return true;
  });

  let html = '<div class="card"><h3>🏘 Compounds (' + filtered.length + (filtered.length !== list.length ? ' / ' + list.length : '') + ')</h3>';

  /* City pills */
  html += '<div style="margin-top:8px"><div class="muted small" style="margin-bottom:4px;letter-spacing:.06em;font-weight:700">CITY</div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px">' +
    '<button class="pill ' + (!f.city ? 'on' : '') + '" style="padding:4px 10px;font-size:.7rem;white-space:nowrap" onclick="S._reFilters.city=null;render()">All</button>';
  cities.forEach(function(city) {
    const safe = city.replace(/'/g, "\\'");
    html += '<button class="pill ' + (f.city === city ? 'on' : '') + '" style="padding:4px 10px;font-size:.7rem;white-space:nowrap" onclick="S._reFilters.city=\'' + safe + '\';render()">' + city + '</button>';
  });
  html += '</div></div>';

  /* Developer pills */
  html += '<div style="margin-top:8px"><div class="muted small" style="margin-bottom:4px;letter-spacing:.06em;font-weight:700">DEVELOPER</div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px">' +
    '<button class="pill ' + (!f.developer ? 'on' : '') + '" style="padding:4px 10px;font-size:.7rem;white-space:nowrap" onclick="S._reFilters.developer=null;render()">All</button>';
  developers.forEach(function(dev) {
    const safe = dev.replace(/'/g, "\\'");
    html += '<button class="pill ' + (f.developer === dev ? 'on' : '') + '" style="padding:4px 10px;font-size:.7rem;white-space:nowrap" onclick="S._reFilters.developer=\'' + safe + '\';render()">' + dev + '</button>';
  });
  html += '</div></div>';

  /* Clear filters */
  if (f.city || f.developer) {
    html += '<button class="opt" style="margin-top:10px;width:100%;text-align:center;font-size:.72rem;padding:6px;border-color:#fb7185;color:#fb7185" onclick="S._reFilters.city=null;S._reFilters.developer=null;render()">✕ Clear filters</button>';
  }
  html += '</div>';

  if (!filtered.length) {
    return html + '<div class="card"><p class="muted small" style="text-align:center">No compounds match these filters.</p></div>';
  }

  /* Existing compound card renderer (unchanged logic, iterates filtered) */
  html += filtered.map(function(c) {
    const curPpmLow = Math.round(c.ppmLow * S.marketTrend.multiplier);
    const curPpmHigh = Math.round(c.ppmHigh * S.marketTrend.multiplier);
    const cheapest = PROPERTY_UNITS.reduce(function(min, u) {
      return Math.min(min, Math.round(u.area * curPpmLow * u.priceMult));
    }, Infinity);

    return '<div class="card">' +
      '<h3>' + c.name + '</h3>' +
      '<p class="muted small">' + c.loc + ' · ' + c.developer + ' · ' + (c.delivery === 'ready' ? 'Ready' : 'Delivery ' + c.delivery) + '</p>' +
      '<p class="small" style="margin:6px 0">' + c.tag + '</p>' +
        '<div class="row"><span>Current Price / m²</span><b class="mono">' + curPpmLow.toLocaleString() + '–' + curPpmHigh.toLocaleString() + ' ' + _reViewCurrency() + '</b></div>' +
      '<div class="row"><span>Entry price</span><b class="mono">' + cheapest.toLocaleString() + ' ' + _reViewCurrency() + '</b></div>' +
      '<div class="row"><span>Est. ROI</span><b class="good">' + ((c.rentalYieldAnnPct || 0.07) * 100).toFixed(1) + '% Annually</b></div>' +
      '<div class="row"><span>Amenities</span><b class="small" style="text-align:right">' + c.amenities.join(', ') + '</b></div>' +
      '<button class="opt" style="margin-top:8px" onclick="S.pendingBuy={kind:\'compound\',sourceId:\'' + c.id + '\'};render()">Browse units &amp; plans</button>' +
      '</div>';
  }).join('');

  return html;
}

function localSection() {
   const viewCountry = S._reViewCountry || S.country;
  const list = LOCAL_MARKET[viewCountry];
  if (!list || !list.length) return `<div class="card"><h3>No local properties yet</h3></div>`;
  
  return list.map(c => {
    const curPpm = Math.round(c.ppm * S.marketTrend.multiplier);
    const cheapest = PROPERTY_UNITS.reduce((min, u) => Math.min(min, Math.round(u.area * curPpm * u.priceMult)), Infinity);
    return `<div class="card">
      <h3>${c.name}</h3>
      <p class="muted small">${c.loc}, ${c.city} · <b class="bad">CASH ONLY</b></p>
      <p class="small" style="margin:6px 0">${c.tag}</p>
          '<div class="row"><span>Price / m²</span><b class="mono">' + curPpm.toLocaleString() + ' ' + _reViewCurrency() + '</b></div>' +
      '<div class="row"><span>Entry price</span><b class="mono">' + cheapest.toLocaleString() + ' ' + _reViewCurrency() + '</b></div>' +
      <div class="row"><span>Legal Fees / Broker</span><b class="mono bad">4.5% at closing</b></div>
      <button class="opt" style="margin-top:8px" onclick="S.pendingBuy={kind:'local',sourceId:'${c.id}'};render()">Browse units (Cash)</button>
    </div>`;
  }).join('');
}

/* ---------- Detailed Purchase Flow ---------- */
const _baseRealEstateView = realEstateView;
realEstateView = function() {
  ensureRealEstateState();
  let html = _baseRealEstateView();
  if (S.pendingBuy) html = unitPicker(S.pendingBuy) + html;
  return html;
};

function unitPicker(ctx) {
  const viewCountry = S._reViewCountry || S.country;
  const list = ctx.kind === 'compound'
    ? (COMPOUNDS[viewCountry] || [])
    : (LOCAL_MARKET[viewCountry] || []);
  const prop = list.find(c => c.id === ctx.sourceId);
  if (!prop) {
    log('❌ Property not found in ' + viewCountry + ' market. Switch markets and try again.');
    S.pendingBuy = null;
    return '';
  }

  const plans = ctx.kind === 'compound' ? PAYMENT_PLANS : [PAYMENT_PLANS.find(p => p.id === 'cash')];
  const maxMonthlyInstallment = S.job ? Math.round((S.job.salary / 12) * 0.40) : (S.career && S.career.job ? Math.round((S.career.job.salary / 12) * 0.40) : 0);
  const currentPpm = Math.round(prop.ppm * S.marketTrend.multiplier);
  const currency = COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'EGP';

  /* Convert to player currency for display */
  const propRate = (COUNTRIES[viewCountry] && COUNTRIES[viewCountry].rate) || 1;
  const playerRate = C().rate || 1;
  const needsConversion = Math.abs(propRate - playerRate) > 0.01;
  const rateRatio = needsConversion ? (playerRate / propRate) : 1;

  let html = '<div class="card" style="border-color:#8b5cf6">' +
    '<h3>' + prop.name + ' - Purchase Hub</h3>' +
    (needsConversion ? '<div class="muted small" style="margin-bottom:6px;padding:6px;background:#0f0f1a;border-radius:4px">💱 Prices in ' + currency + '. Will convert to ' + C().currency + ' at checkout.</div>' : '') +
    '<p class="muted small">Banks require monthly installment under 40% of income. Your limit: <b class="good">' + maxMonthlyInstallment.toLocaleString() + ' ' + currency + '/mo</b>.</p>' +
    '<p class="muted small">Closing costs (Broker, Registry, Maintenance Dep.) apply upon purchase.</p>' +
    '<button class="pill" style="padding:4px 8px;font-size:.75rem;margin-top:6px" onclick="S.pendingBuy=null;render()">✕ Cancel</button>' +
    '</div>';

  PROPERTY_UNITS.forEach(u => {
    const basePrice = Math.round(u.area * currentPpm * u.priceMult);
    html += '<div class="card" style="padding:10px">' +
      '<b>' + u.name + '</b> <span class="muted small">· ' + u.area + ' m²</span>' +
      '<div class="row"><span>Base price</span><b class="mono">' + basePrice.toLocaleString() + ' ' + currency + '</b></div>' +
      '<div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">';

    plans.forEach(p => {
      const finalPrice = Math.round(basePrice * p.totalMarkup);
      const down = Math.round(finalPrice * p.downPct);
      const maintDep = Math.round(basePrice * 0.08);
      const brokerFee = Math.round(finalPrice * (ctx.kind === 'local' ? 0.025 : 0.015));
      const totalCashNeeded = down + maintDep + brokerFee;
      const totalInPlayerCurrency = Math.round(totalCashNeeded * rateRatio);

      const moPay = p.years > 0 ? Math.round((finalPrice - down) / (p.years * 12)) : 0;
      const hasCash = S.wealth >= totalInPlayerCurrency;
      const bankApproves = p.years === 0 || moPay <= maxMonthlyInstallment;

      let btnState = '';
      let failReason = '';
      if (!hasCash) {
        btnState = 'disabled;opacity:.5';
        failReason = needsConversion
          ? 'Need ' + money(totalInPlayerCurrency) + ' (' + totalCashNeeded.toLocaleString() + ' ' + currency + ')'
          : 'Need ' + money(totalCashNeeded);
      } else if (!bankApproves) {
        btnState = 'disabled;opacity:.5';
        failReason = 'Bank denied (income too low)';
      }

      html += '<button class="pill" style="padding:6px 8px;font-size:.72rem;text-align:left;' + btnState + '" onclick="buyProperty(\'' + ctx.kind + '\',\'' + prop.id + '\',\'' + u.id + '\',\'' + p.id + '\', ' + totalCashNeeded + ',' + maintDep + ')">' +
        p.label + '<br>' +
        '<span class="muted small">Cash to close: ' + totalCashNeeded.toLocaleString() + ' ' + currency +
        (needsConversion ? ' (≈ ' + money(totalInPlayerCurrency) + ')' : '') +
        ' (Down:' + down.toLocaleString() + ' + Fees: ' + (maintDep + brokerFee).toLocaleString() + ')</span>' +
        (p.years > 0 ? '<br><span class="' + (bankApproves ? 'good' : 'bad') + '">Monthly: ' + moPay.toLocaleString() + ' ' + currency + '</span>' : '') +
        (failReason ? '<br><b class="bad">' + failReason + '</b>' : '') +
        '</button>';
    });

    html += '</div></div>';
  });
  return html;
}

window.buyProperty = function(kind, sourceId, unitId, planId, totalCashNeeded, maintDep) {
  ensureRealEstateState();
  const viewCountry = S._reViewCountry || S.country;
  const list = kind === 'compound' ? (COMPOUNDS[viewCountry] || []) : (LOCAL_MARKET[viewCountry] || []);
  const prop = list.find(c => c.id === sourceId);
  if (!prop) { log('❌ Property not found.'); S.pendingBuy = null; render(); return; }
  const unit = PROPERTY_UNITS.find(u => u.id === unitId);
  if (!unit) { log('❌ Invalid unit.'); render(); return; }
  const plan = PAYMENT_PLANS.find(p => p.id === planId) || PAYMENT_PLANS[0];

  /* Currency conversion: property country rate vs player country rate */
  const propRate = (COUNTRIES[viewCountry] && COUNTRIES[viewCountry].rate) || 1;
  const playerRate = C().rate || 1;
  const rateRatio = (Math.abs(propRate - playerRate) > 0.01) ? (playerRate / propRate) : 1;
  const totalInPlayerCurrency = Math.round(totalCashNeeded * rateRatio);
  const currency = COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'EGP';

  if (S.wealth < totalInPlayerCurrency) {
    log('❌ Need ' + money(totalInPlayerCurrency) +
      (rateRatio !== 1 ? ' (property costs ' + totalCashNeeded.toLocaleString() + ' ' + currency + ')' : '') + '.');
    render(); return;
  }
  S.wealth -= totalInPlayerCurrency;

  const currentPpm = Math.round(prop.ppm * S.marketTrend.multiplier);
  const basePrice = Math.round(unit.area * currentPpm * unit.priceMult);
  const finalPrice = Math.round(basePrice * plan.totalMarkup);
  const down = Math.round(finalPrice * plan.downPct);

  const home = createHome({
    name: unit.name + ' · ' + prop.name,
    city: prop.city || 'Unknown',
    location: prop.loc || prop.city,
    country: viewCountry,  /* ← store the property's real country */
    baseValue: basePrice,
    value: basePrice,
    monthlyRent: Math.round(basePrice * (prop.rentalYieldAnnPct || 0.07) / 12),
    hoaFee: Math.round(basePrice * 0.005),
    hap: prop.hap || 0,
    hp: prop.hp || 0,
    area: unit.area,
    unitId: unit.id,
    source: kind,
    compoundId: kind === 'compound' ? prop.id : null,
    currency: currency
  });

  S.ownedHomes.push(home);
  if (plan.years > 0) {
    S.realestateContracts.push({
      homeId: home.id,
      name: home.name,
      remaining: finalPrice - down,
      yearsTotal: plan.years,
      yearsLeft: plan.years,
      annualPayment: Math.round((finalPrice - down) / plan.years),
      currency: currency  /* ← loan denominated in property currency */
    });
  }

  log('Signed contract for ' + home.name + '. Paid ' + money(totalInPlayerCurrency) +
    (rateRatio !== 1 ? ' (' + totalCashNeeded.toLocaleString() + ' ' + currency + ')' : '') + ' in closing costs.');
  S.pendingBuy = null;
  S.realEstateTab = 'mine';
  render();
};
/* ---------- Land & Deep Construction Flow ---------- */
function landsSection() {
  const viewCountry = S._reViewCountry || S.country;
  const list = LANDS.filter(l => l.country === viewCountry);
  if (!list.length) return `<div class="card"><h3>No land available</h3></div>`;
  
  let html = list.map(l => {
    const curPpm = Math.round(l.ppm * S.marketTrend.multiplier);
    const minPrice = l.minSize * curPpm;
    return `<div class="card">
      <h3>${l.name}</h3>
      <p class="muted small">${l.city} · Zoning: ${l.zoning.toUpperCase()}</p>
       <div class="row"><span>Price / m²</span><b class="mono">${curPpm.toLocaleString()} ${_reViewCurrency()}</b></div>
      <div class="row"><span>Cost range</span><b class="mono">${minPrice.toLocaleString()} - ${(l.maxSize*curPpm).toLocaleString()} ${_reViewCurrency()}</b></div>
      <button class="opt" style="margin-top:8px" onclick="promptBuyLand('${l.id}')">Acquire Land</button>
    </div>`;
  }).join('');

  if (S.land.length) {
    html += `<div class="card"><h3>Your Land Portfolio</h3>
      ${S.land.map(l => {
        let actionBtn = l.status === 'empty' 
          ? `<button class="opt" style="padding:4px 8px;font-size:.72rem" onclick="promptBuildOnLand('${l.id}')">Hire Architect</button>`
          : l.status === 'building' 
            ? `<b class="gold">Building (${l.buildYearsLeft}yr left)</b>` 
            : '<b class="good">Built</b>';
            
        return `<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">
          <b>${l.name}</b> <span class="small muted">(${l.size} m²)</span>
          <div class="row"><span>Current Value</span><b class="mono">${l.value.toLocaleString()}</b></div>
          <div class="row"><span>Status</span>${actionBtn}</div>
        </div>`;
      }).join('')}
    </div>`;
  }
  return html;
}

window.promptBuyLand = function(landId) {
  const land = LANDS.find(l => l.id === landId);
  const sizeInput = prompt(`How many m²? (${land.minSize}–${land.maxSize})`, land.minSize);
  const size = parseInt(sizeInput, 10);
  if (!size || size < land.minSize || size > land.maxSize) return;
  
  const price = size * Math.round(land.ppm * S.marketTrend.multiplier);
  const closingCosts = Math.round(price * 0.05); // Taxes + Surveyors
  const total = price + closingCosts;
  
  if (S.wealth < total) { log(`Need ${money(total)} (incl. 5% closing).`); render(); return; }
  S.wealth -= total;
  S.land.push({
    id: 'land_' + Math.random().toString(36).slice(2, 8),
    name: land.name, city: land.city, zoning: land.zoning, size: size,
    value: price, status: 'empty', buildYearsLeft: 0
  });
  log(`Acquired ${size}m² in ${land.city} for ${money(total)}.`);
  render();
}

window.promptBuildOnLand = function(landId) {
  const land = S.land.find(l => l.id === landId);
  if (!land || land.status !== 'empty') return;
  
  // Real build costs depend on country
  const costPerM2 = (BUILD_COST_PER_M2 || {egy:18000, usa:2500, sau:4500})[S.country] || 15000;
  // Can only build on a percentage of the land (e.g., 40% footprint)
  const buildableArea = Math.round(land.size * 0.45); 
  const totalBuildCost = buildableArea * costPerM2;
  
  if (!confirm(`Architect Proposal: Build a ${buildableArea}m² Villa.\nContractor Cost: ${money(totalBuildCost)} cash.\nTime: 2 Years.\nProceed?`)) return;
  if (S.wealth < totalBuildCost) { log(`Insufficient funds to build. You need ${money(totalBuildCost)}.`); return; }
  
  S.wealth -= totalBuildCost;
  land.status = 'building';
  land.buildYearsLeft = 2;
  land.buildArea = buildableArea;
  land.investedBuildCost = totalBuildCost;
  log(`Broke ground on ${land.name}. Construction will take 2 years.`);
  render();
}

/* ---------- Advanced Landlord & Mine Section ---------- */
window.setHomeForRent = function(homeId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  if (!h || h.status === 'rented') return;
  const homeCountry = h.country || 'egy';

  const marketRate = Math.round(h.value * (h.rentalYieldAnnPct || 0.06) / 12);
  const ask = prompt(
    'Set monthly asking rent:\n\nMarket rate: ' + moneyIn(marketRate, homeCountry) + '/mo\n\nEnter amount in ' + (COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].currency : 'local') + ':',
    String(marketRate)
  );
  const parsedAsk = parseInt(ask, 10);

  if (!parsedAsk || parsedAsk <= 0) return;
  if (h.status === 'occupied') S.housing = 'parents';
  h.status = 'listed';
  h.listedRent = parsedAsk;
  h.monthsVacant = 0;
  log(h.name + ' listed for rent at ' + moneyIn(parsedAsk, homeCountry) + '/mo. Looking for tenants...');
  render();
};
/* ---------- Current Home Info & Card ---------- */
function renderCurrentHomeCard(info) {
  const condColor = info.condition > 70 ? '#34d399' : info.condition > 40 ? '#fbbf24' : '#fb7185';
  const typeLabels = {
    parents: { icon: '👨‍👩‍👧', text: 'Living with parents' },
    rented:  { icon: '🔑', text: 'Renting' },
    owned:   { icon: '🏠', text: 'Owned home' }
  };
  const tl = typeLabels[info.type] || { icon: '📍', text: 'Home' };

  let html = '<div class="card" style="border-color:#22d3ee"><h3 style="color:#22d3ee">📍 Your Current Home</h3>' +
    '<div class="muted small" style="margin-bottom:8px">' + tl.icon + ' ' + tl.text + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem">' + info.name + '</div>' +
    '<div class="muted small" style="margin-bottom:8px">' + info.description + '</div>' +
    '<div class="row"><span>Area</span><b>' + info.area + ' m²</b></div>' +
    '<div class="row"><span>Rooms</span><b>' + info.rooms + '</b></div>' +
    '<div class="row"><span>Condition</span><b style="color:' + condColor + '">' + info.condition + '%</b></div>';

  if (info.type === 'parents' && info.ownershipLabel) {
    html += '<div class="row"><span>Ownership</span><b class="small" style="text-align:right;max-width:65%">' + info.ownershipLabel + '</b></div>';
  }
  if (info.yearBuilt) {
    html += '<div class="row"><span>Year built</span><b>' + info.yearBuilt + '</b></div>';
  }

  if (info.value > 0) {
    html += '<div class="row"><span>Market value</span><b class="mono">' + money(info.value) + '</b></div>';
  }
  if (info.rentYearly > 0) {
    html += '<div class="row"><span>Rent/year</span><b class="mono bad">-' + money(info.rentYearly) + '</b></div>';
  }
  if (info.homeComfort > 0 || info.shoppingComfort > 0) {
    const total = (info.homeComfort || 0) + (info.shoppingComfort || 0);
    html += '<div class="row"><span>Home comfort</span><b class="good">+' + total + '</b></div>';
  }

  const homeId = info.type === 'parents' ? 'parents' : info.type === 'rented' ? 'rented' : (info.home ? info.home.id : null);
  if (homeId) {
    const furnItems = (S.shopping && Array.isArray(S.shopping.inventory))
      ? S.shopping.inventory.filter(function(i) { return i.homeId === homeId && (i.cat === 'furniture' || i.cat === 'appliances'); })
      : [];
    if (furnItems.length > 0) {
      const totalFurnValue = furnItems.reduce(function(s, i) { return s + (i.currentValue || 0); }, 0);
      html += '<div style="margin-top:10px;padding:8px;background:#0f0f1a;border-radius:6px">' +
        '<b style="font-size:.78rem;color:#8b5cf6">🛋 Furniture you added (' + furnItems.length + ' · ' + money(totalFurnValue) + ')</b>';
      furnItems.slice(0, 6).forEach(function(i) {
        html += '<div class="muted small" style="margin-top:2px">· ' + i.brand + ' ' + i.name + ' · ' + money(i.currentValue) + '</div>';
      });
      if (furnItems.length > 6) html += '<div class="muted small" style="margin-top:2px">…and ' + (furnItems.length - 6) + ' more</div>';
      html += '</div>';
    }
  }

  if (info.note) {
    html += '<p class="muted small" style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px">' + info.note + '</p>';
  }

  html += '</div>';
  return html;
}

function renderCurrentHomeCard(info) {
  const condColor = info.condition > 70 ? '#34d399' : info.condition > 40 ? '#fbbf24' : '#fb7185';
  const typeLabels = {
    parents: { icon: '👨‍👩‍👧', text: 'Living with parents' },
    rented:  { icon: '🔑', text: 'Renting' },
    owned:   { icon: '🏠', text: 'Owned home' }
  };
  const tl = typeLabels[info.type] || { icon: '📍', text: 'Home' };

  let html = '<div class="card" style="border-color:#22d3ee"><h3 style="color:#22d3ee">📍 Your Current Home</h3>' +
    '<div class="muted small" style="margin-bottom:8px">' + tl.icon + ' ' + tl.text + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem">' + info.name + '</div>' +
    '<div class="muted small" style="margin-bottom:8px">' + info.description + '</div>' +
    '<div class="row"><span>Area</span><b>' + info.area + ' m²</b></div>' +
    '<div class="row"><span>Rooms</span><b>' + info.rooms + '</b></div>' +
    '<div class="row"><span>Condition</span><b style="color:' + condColor + '">' + info.condition + '%</b></div>';

  if (info.value > 0) {
    html += '<div class="row"><span>Market value</span><b class="mono">' + money(info.value) + '</b></div>';
  }
  if (info.rentYearly > 0) {
    html += '<div class="row"><span>Rent/year</span><b class="mono bad">-' + money(info.rentYearly) + '</b></div>';
  }
  if (info.homeComfort > 0 || info.shoppingComfort > 0) {
    const total = (info.homeComfort || 0) + (info.shoppingComfort || 0);
    html += '<div class="row"><span>Home comfort</span><b class="good">+' + total + '</b></div>';
  }

  /* Furniture bought from shopping assigned to this home */
  const homeId = info.type === 'parents' ? 'parents' : info.type === 'rented' ? 'rented' : (info.home ? info.home.id : null);
  if (homeId) {
    const furnItems = (S.shopping && Array.isArray(S.shopping.inventory))
      ? S.shopping.inventory.filter(i => i.homeId === homeId && (i.cat === 'furniture' || i.cat === 'appliances'))
      : [];
    if (furnItems.length > 0) {
      const totalFurnValue = furnItems.reduce((s, i) => s + (i.currentValue || 0), 0);
      html += '<div style="margin-top:10px;padding:8px;background:#0f0f1a;border-radius:6px">' +
        '<b style="font-size:.78rem;color:#8b5cf6">🛋 Furniture you added (' + furnItems.length + ' · ' + money(totalFurnValue) + ')</b>';
      furnItems.slice(0, 6).forEach(i => {
        html += '<div class="muted small" style="margin-top:2px">· ' + i.brand + ' ' + i.name + ' · ' + money(i.currentValue) + '</div>';
      });
      if (furnItems.length > 6) html += '<div class="muted small" style="margin-top:2px">…and ' + (furnItems.length - 6) + ' more</div>';
      html += '</div>';
    }
  }

  if (info.note) {
    html += '<p class="muted small" style="margin-top:8px;padding:8px;background:#0f0f1a;border-radius:6px">' + info.note + '</p>';
  }

  html += '</div>';
  return html;
}

function mineSection() {
  const info = getCurrentHomeInfo();
  let html = '';

  if (info) html += renderCurrentHomeCard(info);

  if (!S.ownedHomes.length) {
    html += '<div class="card"><h3>🏘 Your Property Portfolio</h3>' +
      '<p class="muted small">You don\'t own any properties yet. Browse <b>Compounds</b> or <b>Local</b> tabs to buy your first home.</p>' +
      (info && info.type !== 'owned' ? '<p class="muted small" style="margin-top:6px">Tip: Once you buy a place, it will show here. Use the "Move in" button to live in it.</p>' : '') +
      '</div>';
    return html;
  }

  html += '<div class="card"><h3>🏘 Your Property Portfolio (' + S.ownedHomes.length + ')</h3></div>';

  html += S.ownedHomes.map(h => {
    const contract = S.realestateContracts.find(c => c.homeId === h.id);
    const homeCountry = h.country || 'egy';
    const currency = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].currency) || 'EGP';

    /* Show conversion if property is abroad from player's current country */
    const homeRate = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].rate) || 1;
    const playerRate = C().rate || 1;
    const isForeign = Math.abs(homeRate - playerRate) > 0.01;
    const valueInPlayerCurrency = isForeign ? Math.round(h.value * (playerRate / homeRate)) : null;

    let statusHtml = '';
    if (h.status === 'occupied') statusHtml = '🏠 <b>You live here</b>';
    else if (h.status === 'listed') statusHtml = '⏳ <b>Listed: ' + moneyIn(h.listedRent, homeCountry) + '/mo</b> (Vacant ' + h.monthsVacant + 'mo)';
    else if (h.status === 'rented' && h.tenant) {
      statusHtml = '✅ <b>Rented: ' + moneyIn(h.monthlyRent, homeCountry) + '/mo</b><br>' +
        '<span class="small muted">Tenant: ' + h.tenant.name + '</span>';
    } else statusHtml = '<b>Vacant</b>';

    const netEquity = h.value - (contract ? contract.remaining : 0);
    const furnItems = (S.shopping && Array.isArray(S.shopping.inventory))
      ? S.shopping.inventory.filter(i => i.homeId === h.id && (i.cat === 'furniture' || i.cat === 'appliances'))
      : [];
    const furnValue = furnItems.reduce((s, i) => s + (i.currentValue || 0), 0);

    return '<div class="card" style="padding:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div><b style="font-size:1rem">' + h.name + '</b> <span class="muted small">' + h.area + 'm² · ' + (h.city || '') + ' · ' + (COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].flag : '') + ' ' + (COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].name : homeCountry) + '</span></div>' +
      (h.status === 'occupied' ? '<span style="color:#34d399;font-size:1.2rem">🏠</span>' : '') +
      '</div>' +
      '<div class="row"><span>Market value</span><b class="mono">' + moneyIn(h.value, homeCountry) + '</b></div>' +
      (isForeign ? '<div class="muted small" style="padding-left:8px;margin-top:-2px">≈ ' + money(valueInPlayerCurrency) + ' at current rate</div>' : '') +
      (furnValue > 0 ? '<div class="row"><span>Incl. furniture</span><b class="mono">' + moneyIn(furnValue, homeCountry) + '</b></div>' : '') +
      (contract ? '<div class="row"><span>Bank loan</span><b class="mono bad">-' + moneyIn(contract.remaining, homeCountry) + ' (' + contract.yearsLeft + 'y)</b></div>' : '') +
      '<div class="row"><span>Net equity</span><b class="mono good">' + moneyIn(netEquity, homeCountry) + '</b></div>' +
      '<div class="row"><span>Condition</span><b>' + (h.condition || 100) + '%</b></div>' +
      '<div class="row"><span>Furniture items</span><b>' + furnItems.length + '</b></div>' +
      '<div class="row" style="align-items:flex-start"><span>Status</span><div style="text-align:right">' + statusHtml + '</div></div>' +
      '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">' +
      (h.status !== 'occupied' && h.status !== 'rented' ? '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="moveIntoHome(\'' + h.id + '\')">Move in</button>' : '') +
      (h.status === 'vacant' ? '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="setHomeForRent(\'' + h.id + '\')">List for Rent</button>' : '') +
      (h.status === 'listed' ? '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="stopRenting(\'' + h.id + '\')">Unlist</button>' : '') +
      (h.status === 'rented' ? '<button class="pill" style="padding:4px 8px;font-size:.72rem;color:#fb7185;border-color:#fb7185" onclick="evictTenant(\'' + h.id + '\')">Evict</button>' : '') +
      '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="sellHome(\'' + h.id + '\')">Sell</button>' +
      '</div></div>';
  }).join('');

  return html;
}
/* ---------- Selling with Agent Fees ---------- */
window.sellHome = function(homeId) {
  ensureRealEstateState();
  const idx = S.ownedHomes.findIndex(x => x.id === homeId);
  if (idx < 0) return;
  const h = S.ownedHomes[idx];
  const contract = S.realestateContracts.find(c => c.homeId === homeId);
  const homeCountry = h.country || 'egy';
  const homeCurrency = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].currency) || 'EGP';

  const brokerFee = Math.round(h.value * 0.025);
  const netProceedsInHome = h.value - brokerFee - (contract ? contract.remaining : 0);

  /* Convert from home currency to player's currency */
  const homeRate = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].rate) || 1;
  const playerRate = C().rate || 1;
  const rateRatio = (Math.abs(homeRate - playerRate) > 0.01) ? (playerRate / homeRate) : 1;
  const netProceedsInPlayer = Math.round(netProceedsInHome * rateRatio);

  const msg = 'Sell ' + h.name + ' for ' + moneyIn(h.value, homeCountry) + '?\n\n' +
    '- Broker Fee: ' + moneyIn(brokerFee, homeCountry) + '\n' +
    (contract ? '- Loan Payoff: ' + moneyIn(contract.remaining, homeCountry) + '\n' : '') +
    '= Net to you: ' + moneyIn(netProceedsInHome, homeCountry) + '\n' +
    (rateRatio !== 1 ? '≈ ' + money(netProceedsInPlayer) + ' at current rate\n' : '') +
    '\nProceed?';

  if (!confirm(msg)) return;

  if (netProceedsInHome < 0) { log('❌ Cannot sell: Under water on mortgage.'); return; }

  S.wealth += netProceedsInPlayer;
  if (contract) S.realestateContracts = S.realestateContracts.filter(c => c.homeId !== homeId);
  log('Sold ' + h.name + '. Walked away with ' + money(netProceedsInPlayer) + ' cash' +
    (rateRatio !== 1 ? ' (converted from ' + netProceedsInHome.toLocaleString() + ' ' + homeCurrency + ')' : '') + '.');
  S.ownedHomes.splice(idx, 1);
  if (S.housing === 'owned' && h.status === 'occupied') S.housing = 'parents';
  render();
};
window.stopRenting = function(id) { const h=S.ownedHomes.find(x=>x.id===id); if(h){h.status='vacant'; h.listedRent=0; render();} }
window.moveIntoHome = function(id) {
  const h = S.ownedHomes.find(x=>x.id===id);
  if(h){
    S.ownedHomes.forEach(x => { if (x.status === 'occupied') x.status = 'vacant'; });
    h.status = 'occupied'; h.tenant = null; h.listedRent = 0; S.housing = 'owned';
    log(`Moved into ${h.name}.`); render();
  }
}

/* ---------- Extensive Yearly Simulation Tick ---------- */
function realEstateYear() {
  if (!S || S.age < 18) return;
  ensureRealEstateState();

  // 1. Roll Macro Market Trend
  const r = Math.random();
  if (S.marketTrend.yearsLeft <= 0) {
    if (r > 0.85) S.marketTrend = { state: 'boom', multiplier: 1.25, yearsLeft: 2 + Math.floor(Math.random()*3) };
    else if (r < 0.15) S.marketTrend = { state: 'crash', multiplier: 0.75, yearsLeft: 1 + Math.floor(Math.random()*2) };
    else S.marketTrend = { state: 'normal', multiplier: 1.0, yearsLeft: 3 };
    log(`Market update: Real Estate enters a ${S.marketTrend.state.toUpperCase()} period.`);
  } else {
    S.marketTrend.yearsLeft--;
  }

  const baseAppreciation = (REAL_ESTATE_CONFIG.appreciationRates[S.country] || 0.05);

  // 2. Process Homes
  S.ownedHomes.forEach(h => {
    // Value adjustments (Base appreciation * trend)
        h.baseValue = Math.round(h.baseValue * (1 + baseAppreciation));

    /* Furniture contribution from shopping */
    const _furnItems = (S.shopping && Array.isArray(S.shopping.inventory))
      ? S.shopping.inventory.filter(i => i.homeId === h.id && (i.cat === 'furniture' || i.cat === 'appliances'))
      : [];
    h.furnitureValue = _furnItems.reduce((s, i) => s + (i.currentValue || 0), 0);
    h.shoppingComfort = _furnItems.reduce((s, i) => s + ((i.happiness || 0) * 2), 0);

    h.value = Math.round(h.baseValue * S.marketTrend.multiplier) + h.furnitureValue;
    h.condition = Math.max(10, h.condition - Math.floor(Math.random() * 4) - 1); // Degradation

    /* Shopping furniture comfort for occupied homes */
    if (h.status === 'occupied' && h.shoppingComfort > 0) {
      fx({ happiness: Math.min(10, h.shoppingComfort) });
    }

        // Mandatory HOA / Maintenance (SKIPPED in monthly — settlement handles)
    if (!(typeof isMonthly === 'function' && isMonthly())) {
      const hoa = Math.round(h.value * 0.005);
      if (hoa > 0 && S.wealth >= hoa) { S.wealth -= hoa; }
      else if (hoa > 0) { log(`Failed to pay HOA for ${h.name}. Condition worsened.`); h.condition -= 5; }
    }

    // Rental Logic
    if (h.status === 'listed') {
      const fairRent = Math.round(h.value * 0.06 / 12);
      const ratio = h.listedRent / fairRent; 
      // If asking too much, low chance. If cheap, high chance.
      let rentChance = 0.5 - ((ratio - 1) * 2); 
      if (S.marketTrend.state === 'crash') rentChance -= 0.2;
      
      if (Math.random() < rentChance) {
        h.status = 'rented';
        h.monthlyRent = h.listedRent;
        h.tenant = { name: 'Tenant ' + Math.floor(Math.random()*999), reliability: 500 + Math.floor(Math.random()*350), leaseEnds: S.age + 1 };
        log(`Leased ${h.name} to ${h.tenant.name} for ${money(h.monthlyRent)}/mo.`);
      } else {
        h.monthsVacant += 12;
      }
    }

        if (h.status === 'rented' && h.tenant) {
      // Tenant behavior based on reliability score (500-850)
      if (Math.random() > (h.tenant.reliability / 1000)) {
        const dmg = Math.round(h.monthlyRent * 3);
        log(`URGENT: ${h.tenant.name} damaged ${h.name}. Repairs cost ${money(dmg)}.`);
        S.wealth -= dmg;
        h.condition -= 10;
        if (Math.random() < 0.3) { h.status = 'vacant'; h.tenant = null; log(`Tenant fled ${h.name}.`); }
      } else if (!(typeof isMonthly === 'function' && isMonthly())) {
        // Rent income — SKIPPED in monthly (settlement handles)
        const annRent = h.monthlyRent * 12;
        S.wealth += annRent;
      }
    }
  });
  // 3. Process Mortgages / Contracts (with repossession after 3 consecutive misses)
  S.realestateContracts.forEach(c => {
    if (c.yearsLeft <= 0) return;
    if (typeof c.missedPayments !== 'number') c.missedPayments = 0;

    /* Payment + repossession SKIPPED in monthly — settlement handles */
    if (typeof isMonthly === 'function' && isMonthly()) return;

    const payment = Math.min(c.remaining, c.annualPayment);
    if (S.wealth < payment) {
      c.remaining = Math.round(c.remaining * 1.05);
      c.missedPayments += 1;
      log(`Missed bank installment on ${c.name} (${c.missedPayments}/3). Debt grew to ${money(c.remaining)}.`);

      /* REPOSSESSION after 3 consecutive missed payments */
      if (c.missedPayments >= 3) {
        const home = S.ownedHomes.find(h => h.id === c.homeId);
        if (home) {
          const currentValue = home.value || 0;
          const equity = Math.max(0, currentValue - c.remaining);
          log(`🚨 BANK REPOSSESSED ${home.name} after 3 missed payments.`);
          log(`   Bank kept the property to satisfy the ${money(c.remaining)} mortgage.`);

          /* If home value > debt, bank refunds equity to player */
          if (equity > 0) {
            /* Refund equity minus 10% bank processing fee */
            const equityAfterFee = Math.round(equity * 0.90);
            S.wealth += equityAfterFee;
            log(`💰 Equity returned: ${money(equityAfterFee)} (after 10% bank processing fee).`);
            if (home.status === 'occupied') S.housing = 'parents';
            log(`   You must find new housing. You are now living with parents.`);
          } else {
            /* Home underwater — bank takes it, no equity, debt forgiveness on shortfall (or not) */
            log(`❌ Home was underwater. Bank absorbed the loss. You walk away with nothing.`);
            if (home.status === 'occupied') S.housing = 'parents';
          }

          /* Remove home from portfolio + remove contract */
          S.ownedHomes = S.ownedHomes.filter(h => h.id !== c.homeId);
          c._repo = true;
        }
      }
    } else {
      S.wealth -= payment;
      c.remaining -= payment;
      c.yearsLeft--;
      c.missedPayments = 0;
    }
  });
  S.realestateContracts = S.realestateContracts.filter(c => !c._repo && c.yearsLeft > 0 && c.remaining > 0);

  // 4. Process Land Construction
  S.land.forEach(l => {
    if (l.status === 'building') {
      l.buildYearsLeft--;
      if (l.buildYearsLeft <= 0) {
        l.status = 'built';
        l.value += Math.round(l.investedBuildCost * 1.5); // Instant equity for self-building
        log(`Construction finished! ${l.name} is now a built property.`);
        // Transfer from land to ownedHomes
        S.ownedHomes.push(createHome({
          name: `Custom Villa on ${l.name}`, city: l.city, location: l.city,
          baseValue: l.value, value: l.value, area: l.buildArea, finishing: 'standard', source: 'custom_build'
        }));
        l.transferred = true;
      }
    } else if (l.status === 'empty') {
      l.value = Math.round(l.value * (1 + (baseAppreciation * 0.8))); // Land appreciates slightly slower than homes
    }
  });
  S.land = S.land.filter(l => !l.transferred);

}
GameHooks.on('year', realEstateYear);

/* ---------- Register sub-tabs ---------- */
registerRealEstateTab({ id: 'compounds', label: 'Compounds', order: 0, requiresHome: false, render: compoundsSection });
registerRealEstateTab({ id: 'local', label: 'Local', order: 1, requiresHome: false, render: localSection });
registerRealEstateTab({ id: 'lands', label: 'Lands & Build', order: 2, requiresHome: false, render: landsSection });
registerRealEstateTab({ id: 'mine', label: 'My Home & Portfolio', order: 3, requiresHome: false, render: mineSection });

GameHooks.registerTab({ id: 'realestate', label: '🏠 Real Estate', order: 5, view: realEstateView });
