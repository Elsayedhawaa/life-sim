/* ============================================================
   VIEW: REAL ESTATE — v4 (complete, currency-safe)
   ============================================================
   Fixes:
   - Restores missing getCurrentHomeInfo / renderCurrentHomeCard
   - All currency conversions on buy, sell, rent, mortgage, HOA,
     land purchase, land build, eviction fees, tenant damage
   - Market country selector works everywhere
   - Browse button routes correctly from any market
   ============================================================ */

/* ---------- SUB-TAB REGISTRY ---------- */
const RealEstateTabs = [];
function registerRealEstateTab(tab) {
  const existing = RealEstateTabs.findIndex(t => t.id === tab.id);
  if (existing >= 0) RealEstateTabs[existing] = tab;
  else RealEstateTabs.push(tab);
  RealEstateTabs.sort((a, b) => a.order - b.order);
}
window.registerRealEstateTab = registerRealEstateTab;

/* ---------- CURRENCY HELPERS ---------- */
function moneyIn(amount, countryCode) {
  const c = COUNTRIES[countryCode];
  if (!c) return Math.round(amount || 0).toLocaleString();
  return Math.round(amount || 0).toLocaleString() + ' ' + c.currency;
}
window.moneyIn = moneyIn;

function toPlayerCurrency(amount, fromCountryCode) {
  if (!S) return amount;
  const fromRate = (COUNTRIES[fromCountryCode] && COUNTRIES[fromCountryCode].rate) || 1;
  const playerRate = C().rate || 1;
  if (Math.abs(fromRate - playerRate) < 0.01) return Math.round(amount || 0);
  return Math.round((amount || 0) * playerRate / fromRate);
}
window.toPlayerCurrency = toPlayerCurrency;

function fromPlayerCurrency(amount, toCountryCode) {
  if (!S) return amount;
  const toRate = (COUNTRIES[toCountryCode] && COUNTRIES[toCountryCode].rate) || 1;
  const playerRate = C().rate || 1;
  if (Math.abs(toRate - playerRate) < 0.01) return Math.round(amount || 0);
  return Math.round((amount || 0) * toRate / playerRate);
}
window.fromPlayerCurrency = fromPlayerCurrency;

function homeCountry(h) { return (h && h.country) || 'egy'; }

/* ---------- VIEW COUNTRY ---------- */
function getViewCountry() {
  if (!S) return 'egy';
  if (!S._reViewCountry || !COMPOUNDS[S._reViewCountry]) S._reViewCountry = S.country;
  return S._reViewCountry;
}
function setViewCountry(code) {
  if (!S) return;
  if (!COMPOUNDS[code]) return;
  S._reViewCountry = code;
  render();
}
window.setViewCountry = setViewCountry;

/* ---------- STATE ---------- */
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
    if (typeof h.status !== 'string') h.status = 'vacant';
    if (typeof h.value !== 'number') h.value = 0;
    if (typeof h.baseValue !== 'number') h.baseValue = h.value;
    if (typeof h.monthlyRent !== 'number') h.monthlyRent = Math.round(h.value * 0.0035);
    if (typeof h.listedRent !== 'number') h.listedRent = 0;
    if (typeof h.hoaFee !== 'number') h.hoaFee = 0;
    if (typeof h.insurance !== 'boolean') h.insurance = false;
    if (typeof h.propertyTax !== 'number') h.propertyTax = 0;
    if (!h.tenant) h.tenant = null;
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
    if (!h.country) h.country = 'egy';
  });

  if (!S.ownedHomes.find(h => h.id === S.realEstateActiveHomeId)) {
    S.realEstateActiveHomeId = S.ownedHomes[0] ? S.ownedHomes[0].id : null;
  }
}
GameHooks.on('newGame', ensureRealEstateState);
GameHooks.on('migrate', ensureRealEstateState);

/* ---------- CREATE HOME ---------- */
function createHome(base) {
  return Object.assign({
    id: 'h_' + Math.random().toString(36).slice(2, 8),
    name: 'Home', country: S ? S.country : 'egy', city: 'Unknown', location: 'Unknown',
    value: 0, baseValue: 0, condition: 100, status: 'vacant',
    monthlyRent: 0, listedRent: 0,
    hoaFee: 0, insurance: false, propertyTax: 0, tenant: null, monthsVacant: 0,
    hap: 0, hp: 0, area: 130, finishing: 'core_shell',
    upgrades: [], furniture: {}, staff: [], homeComfort: 0,
    style: null, unitId: null, source: 'compound', compoundId: null,
    purchasedYear: gameYear()
  }, base);
}
window.createHome = createHome;

/* ============================================================
   MAIN VIEW
   ============================================================ */
function realEstateView() {
  ensureRealEstateState();
  const viewCountry = getViewCountry();
  const isViewingHome = viewCountry !== S.country;

  const availableTabs = RealEstateTabs.filter(t => !t.requiresHome || S.ownedHomes.length > 0);
  const currentTab = availableTabs.find(t => t.id === S.realEstateTab) || availableTabs[0];
  if (currentTab && S.realEstateTab !== currentTab.id) S.realEstateTab = currentTab.id;

  const trendIcon = S.marketTrend.state === 'boom' ? '🚀' : S.marketTrend.state === 'crash' ? '📉' : '⚖️';
  const trendColor = S.marketTrend.state === 'boom' ? '#34d399' : S.marketTrend.state === 'crash' ? '#fb7185' : '#e8e8f2';

  const homeCountryCode = S.homeCountry || S.country;
  const canViewHome = homeCountryCode !== S.country && COMPOUNDS[homeCountryCode];

  const viewCountryName = COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].name : viewCountry;

  let html = '<div class="card">' +
    '<div style="display:flex; justify-content:space-between; align-items:center;">' +
    '<h3>Real Estate · ' + viewCountryName + '</h3>' +
    '<div class="small" style="color:' + trendColor + '">' + trendIcon + ' ' + S.marketTrend.state.toUpperCase() + '</div>' +
    '</div>' +
    '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">' +
    availableTabs.map(t => '<button class="pill ' + (S.realEstateTab === t.id ? 'on' : '') + '" style="padding:6px 10px;font-size:.75rem" onclick="S.realEstateTab=\'' + t.id + '\';render()">' + t.label + '</button>').join('') +
    '</div>';

  if (canViewHome) {
    html += '<div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap">' +
      '<button class="pill ' + (viewCountry === S.country ? 'on' : '') + '" style="padding:5px 10px;font-size:.72rem" onclick="setViewCountry(\'' + S.country + '\')">' +
      (COUNTRIES[S.country] ? COUNTRIES[S.country].flag : '📍') + ' Current market</button>' +
      '<button class="pill ' + (viewCountry === homeCountryCode ? 'on' : '') + '" style="padding:5px 10px;font-size:.72rem" onclick="setViewCountry(\'' + homeCountryCode + '\')">' +
      (COUNTRIES[homeCountryCode] ? COUNTRIES[homeCountryCode].flag : '🏠') + ' Home market</button>' +
      '</div>';
  }

  if (isViewingHome) {
    html += '<div class="muted small" style="margin-top:6px;padding:8px;background:#0f0f1a;border-radius:6px">' +
      '💡 Browsing ' + viewCountryName + ' market from abroad. Prices in ' +
      (COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'local') +
      ' — will convert at checkout.' +
      '</div>';
  }

  html += '</div>';

  /* Pending purchase picker (shown at top) */
  if (S.pendingBuy) {
    html = unitPicker(S.pendingBuy) + html;
  }

  if (currentTab) html += currentTab.render();
  return html;
}
window.realEstateView = realEstateView;

/* ============================================================
   COMPOUNDS SECTION
   ============================================================ */
function compoundsSection() {
  const viewCountry = getViewCountry();
  const list = COMPOUNDS[viewCountry];
  if (!list || !list.length) return '<div class="card"><h3>No compounds in this market</h3></div>';

  if (!S._reFilters || S._reFilters.country !== viewCountry) {
    S._reFilters = { country: viewCountry, city: null, developer: null };
  }
  const f = S._reFilters;

  const cities = [];
  list.forEach(c => { if (cities.indexOf(c.city) < 0) cities.push(c.city); });
  cities.sort();

  const developers = [];
  list.forEach(c => { if (c.developer && developers.indexOf(c.developer) < 0) developers.push(c.developer); });
  developers.sort();

  const filtered = list.filter(c => {
    if (f.city && c.city !== f.city) return false;
    if (f.developer && c.developer !== f.developer) return false;
    return true;
  });

  let html = '<div class="card"><h3>🏘 Compounds (' + filtered.length + (filtered.length !== list.length ? ' / ' + list.length : '') + ')</h3>';

  html += '<div style="margin-top:8px"><div class="muted small" style="margin-bottom:4px;letter-spacing:.06em;font-weight:700">CITY</div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px">' +
    '<button class="pill ' + (!f.city ? 'on' : '') + '" style="padding:4px 10px;font-size:.7rem;white-space:nowrap" onclick="S._reFilters.city=null;render()">All</button>';
  cities.forEach(city => {
    const safe = city.replace(/'/g, "\\'");
    html += '<button class="pill ' + (f.city === city ? 'on' : '') + '" style="padding:4px 10px;font-size:.7rem;white-space:nowrap" onclick="S._reFilters.city=\'' + safe + '\';render()">' + city + '</button>';
  });
  html += '</div></div>';

  html += '<div style="margin-top:8px"><div class="muted small" style="margin-bottom:4px;letter-spacing:.06em;font-weight:700">DEVELOPER</div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px">' +
    '<button class="pill ' + (!f.developer ? 'on' : '') + '" style="padding:4px 10px;font-size:.7rem;white-space:nowrap" onclick="S._reFilters.developer=null;render()">All</button>';
  developers.forEach(dev => {
    const safe = dev.replace(/'/g, "\\'");
    html += '<button class="pill ' + (f.developer === dev ? 'on' : '') + '" style="padding:4px 10px;font-size:.7rem;white-space:nowrap" onclick="S._reFilters.developer=\'' + safe + '\';render()">' + dev + '</button>';
  });
  html += '</div></div>';

  if (f.city || f.developer) {
    html += '<button class="opt" style="margin-top:10px;width:100%;text-align:center;font-size:.72rem;padding:6px;border-color:#fb7185;color:#fb7185" onclick="S._reFilters.city=null;S._reFilters.developer=null;render()">✕ Clear filters</button>';
  }
  html += '</div>';

  if (!filtered.length) {
    return html + '<div class="card"><p class="muted small" style="text-align:center">No compounds match these filters.</p></div>';
  }

  const currency = COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'EGP';

  html += filtered.map(c => {
    const curPpmLow = Math.round(c.ppmLow * S.marketTrend.multiplier);
    const curPpmHigh = Math.round(c.ppmHigh * S.marketTrend.multiplier);
    const cheapest = PROPERTY_UNITS.reduce((min, u) => Math.min(min, Math.round(u.area * curPpmLow * u.priceMult)), Infinity);

    return '<div class="card">' +
      '<h3>' + c.name + '</h3>' +
      '<p class="muted small">' + c.loc + ' · ' + c.developer + ' · ' + (c.delivery === 'ready' ? 'Ready' : 'Delivery ' + c.delivery) + '</p>' +
      '<p class="small" style="margin:6px 0">' + c.tag + '</p>' +
      '<div class="row"><span>Current Price / m²</span><b class="mono">' + curPpmLow.toLocaleString() + '–' + curPpmHigh.toLocaleString() + ' ' + currency + '</b></div>' +
      '<div class="row"><span>Entry price</span><b class="mono">' + cheapest.toLocaleString() + ' ' + currency + '</b></div>' +
      '<div class="row"><span>Est. ROI</span><b class="good">' + ((c.rentalYieldAnnPct || 0.07) * 100).toFixed(1) + '% Annually</b></div>' +
      '<div class="row"><span>Amenities</span><b class="small" style="text-align:right">' + c.amenities.join(', ') + '</b></div>' +
      '<button class="opt" style="margin-top:8px" onclick="S.pendingBuy={kind:\'compound\',sourceId:\'' + c.id + '\'};render()">Browse units &amp; plans</button>' +
      '</div>';
  }).join('');

  return html;
}

/* ============================================================
   LOCAL MARKET SECTION
   ============================================================ */
function localSection() {
  const viewCountry = getViewCountry();
  const list = LOCAL_MARKET[viewCountry];
  if (!list || !list.length) return '<div class="card"><h3>No local properties in this market</h3></div>';
  const currency = COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'EGP';

  return list.map(c => {
    const curPpm = Math.round(c.ppm * S.marketTrend.multiplier);
    const cheapest = PROPERTY_UNITS.reduce((min, u) => Math.min(min, Math.round(u.area * curPpm * u.priceMult)), Infinity);
    return '<div class="card">' +
      '<h3>' + c.name + '</h3>' +
      '<p class="muted small">' + c.loc + ', ' + c.city + ' · <b class="bad">CASH ONLY</b></p>' +
      '<p class="small" style="margin:6px 0">' + c.tag + '</p>' +
      '<div class="row"><span>Price / m²</span><b class="mono">' + curPpm.toLocaleString() + ' ' + currency + '</b></div>' +
      '<div class="row"><span>Entry price</span><b class="mono">' + cheapest.toLocaleString() + ' ' + currency + '</b></div>' +
      '<div class="row"><span>Legal Fees / Broker</span><b class="mono bad">4.5% at closing</b></div>' +
      '<button class="opt" style="margin-top:8px" onclick="S.pendingBuy={kind:\'local\',sourceId:\'' + c.id + '\'};render()">Browse units (Cash)</button>' +
      '</div>';
  }).join('');
}

/* ============================================================
   UNIT PICKER
   ============================================================ */
function unitPicker(ctx) {
  const viewCountry = getViewCountry();
  const list = ctx.kind === 'compound' ? (COMPOUNDS[viewCountry] || []) : (LOCAL_MARKET[viewCountry] || []);
  const prop = list.find(c => c.id === ctx.sourceId);
  if (!prop) {
    log('❌ Property not found in ' + viewCountry + ' market. Switch markets and try again.');
    S.pendingBuy = null;
    return '';
  }

  const plans = ctx.kind === 'compound' ? PAYMENT_PLANS : [PAYMENT_PLANS.find(p => p.id === 'cash')];

  /* Player monthly income in PLAYER currency */
  const monthlyIncome = ((S.job ? S.job.salary : 0) + (S.career && S.career.job ? S.career.job.salary : 0)) / 12;
  /* Convert to PROPERTY currency for the approval check */
  const maxMonthlyInPropCurrency = fromPlayerCurrency(monthlyIncome * 0.40, viewCountry);

  const currentPpm = Math.round(prop.ppm * S.marketTrend.multiplier);
  const currency = COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'EGP';
  const propRate = (COUNTRIES[viewCountry] && COUNTRIES[viewCountry].rate) || 1;
  const playerRate = C().rate || 1;
  const needsConversion = Math.abs(propRate - playerRate) > 0.01;

  let html = '<div class="card" style="border-color:#8b5cf6">' +
    '<h3>' + prop.name + ' — Purchase Hub</h3>' +
    (needsConversion ? '<div class="muted small" style="margin-bottom:6px;padding:6px;background:#0f0f1a;border-radius:4px">💱 Prices in ' + currency + '. Will convert to ' + C().currency + ' at checkout.</div>' : '') +
    '<p class="muted small">Banks require monthly installment under 40% of income. Your limit: <b class="good">' + maxMonthlyInPropCurrency.toLocaleString() + ' ' + currency + '/mo</b>' + (needsConversion ? ' (≈ ' + money(Math.round(monthlyIncome * 0.40)) + ')' : '') + '.</p>' +
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
      const totalInPlayerCurrency = toPlayerCurrency(totalCashNeeded, viewCountry);

      const moPay = p.years > 0 ? Math.round((finalPrice - down) / (p.years * 12)) : 0;
      const hasCash = S.wealth >= totalInPlayerCurrency;
      const bankApproves = p.years === 0 || moPay <= maxMonthlyInPropCurrency;

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

      html += '<button class="pill" style="padding:6px 8px;font-size:.72rem;text-align:left;' + btnState + '" onclick="buyProperty(\'' + ctx.kind + '\',\'' + prop.id + '\',\'' + u.id + '\',\'' + p.id + '\',' + totalCashNeeded + ',' + maintDep + ')">' +
        p.label + '<br>' +
        '<span class="muted small">Cash to close: ' + totalCashNeeded.toLocaleString() + ' ' + currency +
        (needsConversion ? ' (≈ ' + money(totalInPlayerCurrency) + ')' : '') +
        '</span>' +
        (p.years > 0 ? '<br><span class="' + (bankApproves ? 'good' : 'bad') + '">Monthly: ' + moPay.toLocaleString() + ' ' + currency + '</span>' : '') +
        (failReason ? '<br><b class="bad">' + failReason + '</b>' : '') +
        '</button>';
    });

    html += '</div></div>';
  });
  return html;
}

/* ============================================================
   BUY PROPERTY
   ============================================================ */
window.buyProperty = function(kind, sourceId, unitId, planId, totalCashNeeded, maintDep) {
  ensureRealEstateState();
  const viewCountry = getViewCountry();
  const list = kind === 'compound' ? (COMPOUNDS[viewCountry] || []) : (LOCAL_MARKET[viewCountry] || []);
  const prop = list.find(c => c.id === sourceId);
  if (!prop) { log('❌ Property not found.'); S.pendingBuy = null; render(); return; }
  const unit = PROPERTY_UNITS.find(u => u.id === unitId);
  if (!unit) { log('❌ Invalid unit.'); render(); return; }
  const plan = PAYMENT_PLANS.find(p => p.id === planId) || PAYMENT_PLANS[0];

  const totalInPlayerCurrency = toPlayerCurrency(totalCashNeeded, viewCountry);
  const currency = COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'EGP';

  if (S.wealth < totalInPlayerCurrency) {
    log('❌ Need ' + money(totalInPlayerCurrency) + ' (property costs ' + totalCashNeeded.toLocaleString() + ' ' + currency + ').');
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
    country: viewCountry,
    baseValue: basePrice,
    value: basePrice,
    monthlyRent: Math.round(basePrice * (prop.rentalYieldAnnPct || 0.07) / 12),
    hoaFee: Math.round(basePrice * 0.005),
    hap: prop.hap || 0,
    hp: prop.hp || 0,
    area: unit.area,
    unitId: unit.id,
    source: kind,
    compoundId: kind === 'compound' ? prop.id : null
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
      currency: currency
    });
  }

  log('Signed contract for ' + home.name + '. Paid ' + money(totalInPlayerCurrency) +
    (Math.abs(C().rate - (COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].rate : 1)) > 0.01
      ? ' (' + totalCashNeeded.toLocaleString() + ' ' + currency + ')'
      : '') + ' in closing costs.');
  S.pendingBuy = null;
  S.realEstateTab = 'mine';
  render();
};

/* ============================================================
   LANDS
   ============================================================ */
function landsSection() {
  const viewCountry = getViewCountry();
  const list = LANDS.filter(l => l.country === viewCountry);
  if (!list.length) return '<div class="card"><h3>No land in this market</h3></div>';
  const currency = COUNTRIES[viewCountry] ? COUNTRIES[viewCountry].currency : 'EGP';

  let html = list.map(l => {
    const curPpm = Math.round(l.ppm * S.marketTrend.multiplier);
    const minPrice = l.minSize * curPpm;
    return '<div class="card">' +
      '<h3>' + l.name + '</h3>' +
      '<p class="muted small">' + l.city + ' · Zoning: ' + l.zoning.toUpperCase() + '</p>' +
      '<div class="row"><span>Price / m²</span><b class="mono">' + curPpm.toLocaleString() + ' ' + currency + '</b></div>' +
      '<div class="row"><span>Cost range</span><b class="mono">' + minPrice.toLocaleString() + ' – ' + (l.maxSize * curPpm).toLocaleString() + ' ' + currency + '</b></div>' +
      '<button class="opt" style="margin-top:8px" onclick="promptBuyLand(\'' + l.id + '\')">Acquire Land</button>' +
      '</div>';
  }).join('');

  /* Player's land portfolio */
  if (S.land.length) {
    html += '<div class="card"><h3>Your Land Portfolio</h3>';
    S.land.forEach(l => {
      const lc = l.country || 'egy';
      let actionBtn = l.status === 'empty'
        ? '<button class="opt" style="padding:4px 8px;font-size:.72rem" onclick="promptBuildOnLand(\'' + l.id + '\')">Hire Architect</button>'
        : l.status === 'building'
          ? '<b class="gold">Building (' + l.buildYearsLeft + 'yr left)</b>'
          : '<b class="good">Built</b>';
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<b>' + l.name + '</b> <span class="small muted">(' + l.size + ' m² · ' + (COUNTRIES[lc] ? COUNTRIES[lc].flag : '') + ' ' + (COUNTRIES[lc] ? COUNTRIES[lc].name : lc) + ')</span>' +
        '<div class="row"><span>Current Value</span><b class="mono">' + moneyIn(l.value, lc) + '</b></div>' +
        '<div class="row"><span>Status</span>' + actionBtn + '</div>' +
        '</div>';
    });
    html += '</div>';
  }
  return html;
}

window.promptBuyLand = function(landId) {
  const land = LANDS.find(l => l.id === landId);
  if (!land) return;
  const lc = land.country;
  const currency = COUNTRIES[lc] ? COUNTRIES[lc].currency : 'EGP';
  const sizeInput = prompt('How many m²? (' + land.minSize + '–' + land.maxSize + ')', land.minSize);
  const size = parseInt(sizeInput, 10);
  if (!size || size < land.minSize || size > land.maxSize) return;

  const price = size * Math.round(land.ppm * S.marketTrend.multiplier);
  const closingCosts = Math.round(price * 0.05);
  const total = price + closingCosts;
  const totalPlayer = toPlayerCurrency(total, lc);

  if (S.wealth < totalPlayer) {
    log('❌ Need ' + money(totalPlayer) + ' (' + total.toLocaleString() + ' ' + currency + ' incl. 5% closing).');
    render(); return;
  }
  S.wealth -= totalPlayer;
  S.land.push({
    id: 'land_' + Math.random().toString(36).slice(2, 8),
    name: land.name,
    city: land.city,
    country: lc,
    zoning: land.zoning,
    size: size,
    value: price,
    status: 'empty',
    buildYearsLeft: 0
  });
  log('Acquired ' + size + 'm² in ' + land.city + ' for ' + money(totalPlayer) + '.');
  render();
};

window.promptBuildOnLand = function(landId) {
  const land = S.land.find(l => l.id === landId);
  if (!land || land.status !== 'empty') return;
  const lc = land.country || 'egy';
  const currency = COUNTRIES[lc] ? COUNTRIES[lc].currency : 'EGP';

  /* Build cost per country — use the LAND's country, not player's */
  const costPerM2 = (REAL_ESTATE_CONFIG && REAL_ESTATE_CONFIG.buildCostPerM2 && REAL_ESTATE_CONFIG.buildCostPerM2[lc]) || 15000;
  const buildableArea = Math.round(land.size * 0.45);
  const totalBuildCost = buildableArea * costPerM2;
  const totalPlayer = toPlayerCurrency(totalBuildCost, lc);

  if (!confirm('Architect Proposal: Build a ' + buildableArea + 'm² Villa.\n\nContractor cost: ' + money(totalPlayer) +
    (Math.abs(C().rate - (COUNTRIES[lc] ? COUNTRIES[lc].rate : 1)) > 0.01
      ? ' (' + totalBuildCost.toLocaleString() + ' ' + currency + ')'
      : '') +
    '\nTime: 2 years.\n\nProceed?')) return;

  if (S.wealth < totalPlayer) { log('❌ Need ' + money(totalPlayer) + '.'); return; }
  S.wealth -= totalPlayer;
  land.status = 'building';
  land.buildYearsLeft = 2;
  land.buildArea = buildableArea;
  land.investedBuildCost = totalBuildCost;
  log('Broke ground on ' + land.name + '. Construction will take 2 years.');
  render();
};

/* ============================================================
   LANDLORD ACTIONS
   ============================================================ */
window.setHomeForRent = function(homeId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  if (!h || h.status === 'rented') return;
  const hc = homeCountry(h);
  const marketRate = Math.round(h.value * (h.rentalYieldAnnPct || 0.06) / 12);
  const currency = COUNTRIES[hc] ? COUNTRIES[hc].currency : 'EGP';
  const ask = prompt('Set monthly asking rent:\n\nMarket rate: ' + marketRate.toLocaleString() + ' ' + currency + '/mo\n\nEnter amount in ' + currency + ':', String(marketRate));
  const parsedAsk = parseInt(ask, 10);
  if (!parsedAsk || parsedAsk <= 0) return;
  if (h.status === 'occupied') S.housing = 'parents';
  h.status = 'listed';
  h.listedRent = parsedAsk;
  h.monthsVacant = 0;
  log(h.name + ' listed for rent at ' + moneyIn(parsedAsk, hc) + '/mo.');
  render();
};

window.evictTenant = function(homeId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  if (!h || !h.tenant) return;
  const legalFees = Math.round(h.monthlyRent * 2);
  S._evictTarget = homeId;
  S.pending = {
    title: '⚖️ Evict Tenant',
    text: 'You want to evict ' + h.tenant.name + ' from ' + h.name + '.\n\nEviction requires lawyers and courts.\n\nCost: ' + money(legalFees),
    choices: [
      { label: 'Proceed with eviction', effect: function(s) {
        if (s.wealth >= legalFees) s.wealth -= legalFees;
        h.status = 'vacant';
        h.tenant = null;
        log('🚪 Evicted tenant from ' + h.name + '. Paid ' + money(legalFees) + ' in legal fees.');
      }},
      { label: 'Cancel', effect: function(s) {
        log('Eviction cancelled.');
      }}
    ]
  };
  S.evId = 'evict_tenant';
  render();
};

window.stopRenting = function(id) {
  const h = S.ownedHomes.find(x => x.id === id);
  if (h) { h.status = 'vacant'; h.listedRent = 0; render(); }
};

window.moveIntoHome = function(id) {
  const h = S.ownedHomes.find(x => x.id === id);
  if (h) {
    S.ownedHomes.forEach(x => { if (x.status === 'occupied') x.status = 'vacant'; });
    h.status = 'occupied';
    h.tenant = null;
    h.listedRent = 0;
    S.housing = 'owned';
    log('Moved into ' + h.name + ' in ' + (COUNTRIES[homeCountry(h)] ? COUNTRIES[homeCountry(h)].name : homeCountry(h)) + '.');
    render();
  }
};

/* ============================================================
   CURRENT HOME INFO
   ============================================================ */
function getCurrentHomeInfo() {
  if (S.housing === 'parents') {
    if (!S.parentsHome && typeof ensureParentsHome === 'function') ensureParentsHome();
    if (S.parentsHome) {
      const p = S.parentsHome;
      const ownerLabel = (typeof ownershipLabel === 'function') ? ownershipLabel(p.ownership) : 'Co-owned by both parents';
      return {
        type: 'parents',
        name: "Parents' Home",
        description: ownerLabel + ' · ' + C().name + ' · Built ' + p.yearBuilt,
        area: p.area,
        rooms: p.rooms,
        condition: p.condition,
        value: p.value,
        yearBuilt: p.yearBuilt,
        ownership: p.ownership,
        ownershipLabel: ownerLabel,
        homeComfort: 0,
        shoppingComfort: 0,
        canManage: false,
        country: S.homeCountry || S.country,
        note: "You live with your parents. They cover utilities and groceries. Buy furniture for your room from the Shopping tab, or save for your own place."
      };
    }
    const tier = S.familyTier || 'middle';
    const tierInfo = {
      poor: { area: 55, rooms: 2, condition: 60, location: 'Modest family flat' },
      'lower-mid': { area: 85, rooms: 3, condition: 70, location: 'Family flat' },
      middle: { area: 130, rooms: 4, condition: 80, location: 'Family apartment' },
      'upper-mid': { area: 160, rooms: 5, condition: 85, location: 'Family compound flat' },
      wealthy: { area: 320, rooms: 8, condition: 90, location: 'Family villa' },
      ultra: { area: 700, rooms: 15, condition: 95, location: 'Family mansion' }
    }[tier] || { area: 130, rooms: 4, condition: 80, location: 'Family apartment' };
    return {
      type: 'parents',
      name: "Parents' Home",
      description: tierInfo.location + ' · ' + C().name,
      area: tierInfo.area,
      rooms: tierInfo.rooms,
      condition: tierInfo.condition,
      value: 0,
      homeComfort: 0,
      shoppingComfort: 0,
      canManage: false,
      country: S.homeCountry || S.country,
      note: "You live with your parents. They cover utilities and groceries."
    };
  }

  if (S.housing === 'rented') {
    const rh = S.rentedHome || { yearlyRent: (C().prices && C().prices.rent) || 0, area: 100, condition: 75 };
    const tierDef = (typeof rentalTierById === 'function') ? rentalTierById(rh.tierId || 'br2') : null;
    const name = tierDef ? tierDef.label : 'Rented Apartment';
    return {
      type: 'rented',
      name: name,
      description: C().name + ' · ' + money(Math.round(rh.yearlyRent / 12)) + '/month',
      area: rh.area || 100,
      rooms: Math.max(2, Math.floor((rh.area || 100) / 30)),
      condition: rh.condition || 75,
      value: 0,
      rentYearly: rh.yearlyRent,
      homeComfort: 0,
      shoppingComfort: 0,
      canManage: false,
      country: S.country,
      note: "You can't structurally modify a rental. Buy furniture from the Shopping tab to decorate."
    };
  }

  if (S.housing === 'owned') {
    const h = S.ownedHomes.find(x => x.status === 'occupied');
    if (h) {
      const hc = homeCountry(h);
      const countryName = COUNTRIES[hc] ? COUNTRIES[hc].name : hc;
      return {
        type: 'owned',
        name: h.name,
        description: (h.city || '') + ' · ' + (h.area || 0) + ' m² · ' + countryName,
        area: h.area,
        rooms: h.rooms || Math.max(2, Math.floor((h.area || 100) / 30)),
        condition: h.condition,
        value: h.value,
        homeComfort: h.homeComfort || 0,
        shoppingComfort: h.shoppingComfort || 0,
        furnitureValue: h.furnitureValue || 0,
        canManage: true,
        country: hc,
        home: h
      };
    }
  }
  return null;
}
window.getCurrentHomeInfo = getCurrentHomeInfo;

/* ============================================================
   RENDER CURRENT HOME CARD
   ============================================================ */
function renderCurrentHomeCard(info) {
  const condColor = info.condition > 70 ? '#34d399' : info.condition > 40 ? '#fbbf24' : '#fb7185';
  const typeLabels = {
    parents: { icon: '👨‍👩‍👧', text: 'Living with parents' },
    rented:  { icon: '🔑', text: 'Renting' },
    owned:   { icon: '🏠', text: 'Owned home' }
  };
  const tl = typeLabels[info.type] || { icon: '📍', text: 'Home' };
  const hc = info.country || 'egy';
  const currency = COUNTRIES[hc] ? COUNTRIES[hc].currency : 'EGP';

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
    html += '<div class="row"><span>Market value</span><b class="mono">' + moneyIn(info.value, hc) + '</b></div>';
    if (hc !== S.country) {
      const inPlayer = toPlayerCurrency(info.value, hc);
      html += '<div class="muted small" style="padding-left:8px;margin-top:-2px">≈ ' + money(inPlayer) + ' at current rate</div>';
    }
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
window.renderCurrentHomeCard = renderCurrentHomeCard;

/* ============================================================
   MINE SECTION
   ============================================================ */
function mineSection() {
  const info = (typeof getCurrentHomeInfo === 'function') ? getCurrentHomeInfo() : null;
  let html = '';

  if (info) html += (typeof renderCurrentHomeCard === 'function') ? renderCurrentHomeCard(info) : '';

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
    const hc = homeCountry(h);
    const currency = COUNTRIES[hc] ? COUNTRIES[hc].currency : 'EGP';
    const flag = COUNTRIES[hc] ? COUNTRIES[hc].flag : '';
    const countryName = COUNTRIES[hc] ? COUNTRIES[hc].name : hc;

    const isForeign = hc !== S.country;
    const valueInPlayer = isForeign ? toPlayerCurrency(h.value, hc) : null;

    let statusHtml = '';
    if (h.status === 'occupied') statusHtml = '🏠 <b>You live here</b>';
    else if (h.status === 'listed') statusHtml = '⏳ <b>Listed: ' + moneyIn(h.listedRent, hc) + '/mo</b> (Vacant ' + h.monthsVacant + 'mo)';
    else if (h.status === 'rented' && h.tenant) {
      statusHtml = '✅ <b>Rented: ' + moneyIn(h.monthlyRent, hc) + '/mo</b><br>' +
        '<span class="small muted">Tenant: ' + h.tenant.name + '</span>';
    } else statusHtml = '<b>Vacant</b>';

    const netEquity = h.value - (contract ? contract.remaining : 0);
    const furnItems = (S.shopping && Array.isArray(S.shopping.inventory))
      ? S.shopping.inventory.filter(i => i.homeId === h.id && (i.cat === 'furniture' || i.cat === 'appliances'))
      : [];
    const furnValue = furnItems.reduce((s, i) => s + (i.currentValue || 0), 0);

    return '<div class="card" style="padding:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
      '<div><b style="font-size:1rem">' + h.name + '</b> <span class="muted small">' + h.area + 'm² · ' + (h.city || '') + ' · ' + flag + ' ' + countryName + '</span></div>' +
      (h.status === 'occupied' ? '<span style="color:#34d399;font-size:1.2rem">🏠</span>' : '') +
      '</div>' +
      '<div class="row"><span>Market value</span><b class="mono">' + moneyIn(h.value, hc) + '</b></div>' +
      (isForeign ? '<div class="muted small" style="padding-left:8px;margin-top:-2px">≈ ' + money(valueInPlayer) + ' at current rate</div>' : '') +
      (furnValue > 0 ? '<div class="row"><span>Incl. furniture</span><b class="mono">' + moneyIn(furnValue, hc) + '</b></div>' : '') +
      (contract ? '<div class="row"><span>Bank loan</span><b class="mono bad">-' + moneyIn(contract.remaining, hc) + ' (' + contract.yearsLeft + 'y)</b></div>' : '') +
      '<div class="row"><span>Net equity</span><b class="mono good">' + moneyIn(netEquity, hc) + '</b></div>' +
      '<div class="row"><span>Condition</span><b>' + (h.condition || 100) + '%</b></div>' +
      '<div class="row"><span>Furniture items</span><b>' + furnItems.length + '</b></div>' +
      '<div class="row" style="align-items:flex-start"><span>Status</span><div style="text-align:right">' + statusHtml + '</div></div>' +
           '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">' +
      (contract ? `<button class="pill" style="padding:4px 8px;font-size:.72rem;background:#34d39920;border-color:#34d399;color:#34d399" onclick="payMortgageExtra('${h.id}')">Pay Mortgage Extra</button>` : '') +
      (h.status !== 'occupied' && h.status !== 'rented' ? '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="moveIntoHome(\'' + h.id + '\')">Move in</button>' : '') +
      (h.status === 'vacant' ? '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="setHomeForRent(\'' + h.id + '\')">List for Rent</button>' : '') +
      (h.status === 'listed' ? '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="stopRenting(\'' + h.id + '\')">Unlist</button>' : '') +
      (h.status === 'rented' ? '<button class="pill" style="padding:4px 8px;font-size:.72rem;color:#fb7185;border-color:#fb7185" onclick="evictTenant(\'' + h.id + '\')">Evict</button>' : '') +
      '<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="sellHome(\'' + h.id + '\')">Sell</button>' +
      '</div></div>';
  }).join('');

  return html;
}

/* ============================================================
   SELL HOME
   ============================================================ */
window.sellHome = function(homeId) {
  ensureRealEstateState();
  const idx = S.ownedHomes.findIndex(x => x.id === homeId);
  if (idx < 0) return;
  const h = S.ownedHomes[idx];
  const contract = S.realestateContracts.find(c => c.homeId === homeId);
  const hc = homeCountry(h);
  const currency = COUNTRIES[hc] ? COUNTRIES[hc].currency : 'EGP';

  const brokerFee = Math.round(h.value * 0.025);
  const netProceedsInHome = h.value - brokerFee - (contract ? contract.remaining : 0);
  const netProceedsInPlayer = toPlayerCurrency(netProceedsInHome, hc);

  const msg = 'Sell ' + h.name + ' for ' + moneyIn(h.value, hc) + '?\n\n' +
    '- Broker Fee: ' + moneyIn(brokerFee, hc) + '\n' +
    (contract ? '- Loan Payoff: ' + moneyIn(contract.remaining, hc) + '\n' : '') +
    '= Net to you: ' + moneyIn(netProceedsInHome, hc) + '\n' +
    (hc !== S.country ? '≈ ' + money(netProceedsInPlayer) + ' at current rate\n' : '') +
    '\nProceed?';
  if (!confirm(msg)) return;

  if (netProceedsInHome < 0) { log('❌ Cannot sell: Under water on mortgage.'); return; }

  S.wealth += netProceedsInPlayer;
  if (contract) S.realestateContracts = S.realestateContracts.filter(c => c.homeId !== homeId);
  log('Sold ' + h.name + '. Walked away with ' + money(netProceedsInPlayer) + ' cash' +
    (hc !== S.country ? ' (converted from ' + netProceedsInHome.toLocaleString() + ' ' + currency + ')' : '') + '.');
  S.ownedHomes.splice(idx, 1);
  if (S.housing === 'owned' && h.status === 'occupied') S.housing = 'parents';
  render();
};
window.payMortgageExtra = function(homeId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  const contract = S.realestateContracts.find(c => c.homeId === homeId);
  if (!contract || !h) return;

  const currentCountryRate = C().rate || 1;
  const propertyCountryRate = (COUNTRIES[h.country] && COUNTRIES[h.country].rate) || 1;
  const rateRatio = currentCountryRate / propertyCountryRate;

  const input = prompt(`Current remaining loan: ${money(contract.remaining)}\n\nHow much extra do you want to pay? (Enter in ${C().currency})`, String(Math.round(contract.remaining * 0.1)));
  if (!input) return;
  
  const payLocal = Math.round(Number(input));
  if (payLocal <= 0 || S.wealth < payLocal) {
    log('❌ Not enough cash.');
    render();
    return;
  }

  // Convert payment to property's currency
  const payPropertyCurrency = Math.round(payLocal / rateRatio);
  const actualPay = Math.min(contract.remaining, payPropertyCurrency);

  if (actualPay <= 0) return;
  if (!confirm(`Pay ${money(actualPay)} toward ${h.name} mortgage?`)) return;

  S.wealth -= Math.round(actualPay * rateRatio);
  contract.remaining -= actualPay;

  if (contract.remaining <= 0) {
    S.realestateContracts = S.realestateContracts.filter(c => c.homeId !== homeId);
    log(`🎉 Mortgage fully paid off! ${h.name} is now 100% yours.`);
    fx({ happiness: 15 });
  } else {
    log(`💸 Extra payment made: ${money(actualPay)}. Remaining: ${money(contract.remaining)}.`);
  }
  render();
};
/* ============================================================
   YEAR TICK — with FULL currency conversion
   ============================================================ */
function realEstateYear() {
  if (!S || S.age < 18) return;
  ensureRealEstateState();

  /* Market trend */
  const r = Math.random();
  if (S.marketTrend.yearsLeft <= 0) {
    if (r > 0.85) S.marketTrend = { state: 'boom', multiplier: 1.25, yearsLeft: 2 + Math.floor(Math.random() * 3) };
    else if (r < 0.15) S.marketTrend = { state: 'crash', multiplier: 0.75, yearsLeft: 1 + Math.floor(Math.random() * 2) };
    else S.marketTrend = { state: 'normal', multiplier: 1.0, yearsLeft: 3 };
    log('Market update: Real Estate enters a ' + S.marketTrend.state.toUpperCase() + ' period.');
  } else {
    S.marketTrend.yearsLeft--;
  }

  /* Per-country appreciation */
  S.ownedHomes.forEach(h => {
    const hc = homeCountry(h);
    const baseAppreciation = (REAL_ESTATE_CONFIG.appreciationRates && REAL_ESTATE_CONFIG.appreciationRates[hc]) || 0.05;
    h.baseValue = Math.round(h.baseValue * (1 + baseAppreciation));

    const _furnItems = (S.shopping && Array.isArray(S.shopping.inventory))
      ? S.shopping.inventory.filter(i => i.homeId === h.id && (i.cat === 'furniture' || i.cat === 'appliances'))
      : [];
    h.furnitureValue = _furnItems.reduce((s, i) => s + (i.currentValue || 0), 0);
    h.shoppingComfort = _furnItems.reduce((s, i) => s + ((i.happiness || 0) * 2), 0);

    h.value = Math.round(h.baseValue * S.marketTrend.multiplier) + h.furnitureValue;
    h.condition = Math.max(10, h.condition - Math.floor(Math.random() * 4) - 1);

    if (h.status === 'occupied' && h.shoppingComfort > 0) {
      fx({ happiness: Math.min(10, h.shoppingComfort) });
    }

    /* HOA — in home currency, converted to player currency for deduction */
    if (!(typeof isMonthly === 'function' && isMonthly())) {
      const hoaInHome = Math.round(h.value * 0.005);
      if (hoaInHome > 0) {
        const hoaInPlayer = toPlayerCurrency(hoaInHome, hc);
        if (S.wealth >= hoaInPlayer) {
          S.wealth -= hoaInPlayer;
        } else {
          log('Failed to pay HOA for ' + h.name + ' (' + money(hoaInPlayer) + '). Condition worsened.');
          h.condition -= 5;
        }
      }
    }

    /* Rental logic */
    if (h.status === 'listed') {
      const fairRent = Math.round(h.value * 0.06 / 12);
      const ratio = h.listedRent / fairRent;
      let rentChance = 0.5 - ((ratio - 1) * 2);
      if (S.marketTrend.state === 'crash') rentChance -= 0.2;

      if (Math.random() < rentChance) {
        h.status = 'rented';
        h.monthlyRent = h.listedRent;
        h.tenant = { name: 'Tenant ' + Math.floor(Math.random() * 999), reliability: 500 + Math.floor(Math.random() * 350), leaseEnds: S.age + 1 };
        log('Leased ' + h.name + ' to ' + h.tenant.name + ' for ' + moneyIn(h.monthlyRent, hc) + '/mo.');
      } else {
        h.monthsVacant += 12;
      }
    }

    if (h.status === 'rented' && h.tenant) {
      if (Math.random() > (h.tenant.reliability / 1000)) {
        const dmgInHome = Math.round(h.monthlyRent * 3);
        const dmgInPlayer = toPlayerCurrency(dmgInHome, hc);
        log('URGENT: ' + h.tenant.name + ' damaged ' + h.name + '. Repairs cost ' + money(dmgInPlayer) + '.');
        S.wealth -= dmgInPlayer;
        h.condition -= 10;
        if (Math.random() < 0.3) { h.status = 'vacant'; h.tenant = null; log('Tenant fled ' + h.name + '.'); }
      } else if (!(typeof isMonthly === 'function' && isMonthly())) {
        /* Rental income — convert from property currency to player currency */
        const annRentInHome = h.monthlyRent * 12;
        const annRentInPlayer = toPlayerCurrency(annRentInHome, hc);
        S.wealth += annRentInPlayer;
      }
    }
  });

  /* Mortgages — remaining stays in property currency, payments convert to player currency */
  S.realestateContracts.forEach(c => {
    if (c.yearsLeft <= 0) return;
    if (typeof c.missedPayments !== 'number') c.missedPayments = 0;
    if (typeof isMonthly === 'function' && isMonthly()) return;

    const home = S.ownedHomes.find(h => h.id === c.homeId);
    const hc = home ? homeCountry(home) : 'egy';
    const paymentInHome = Math.min(c.remaining, c.annualPayment);
    const paymentInPlayer = toPlayerCurrency(paymentInHome, hc);

    if (S.wealth < paymentInPlayer) {
      c.remaining = Math.round(c.remaining * 1.05);
      c.missedPayments += 1;
      log('Missed bank installment on ' + c.name + ' (' + c.missedPayments + '/3). Debt grew to ' + moneyIn(c.remaining, hc) + '.');

      if (c.missedPayments >= 3) {
        if (home) {
          const equityInHome = Math.max(0, home.value - c.remaining);
          const equityInPlayer = toPlayerCurrency(equityInHome, hc);
          log('🚨 BANK REPOSSESSED ' + home.name + ' after 3 missed payments.');

          if (equityInPlayer > 0) {
            const refund = Math.round(equityInPlayer * 0.90);
            S.wealth += refund;
            log('💰 Equity returned: ' + money(refund) + ' (after 10% bank fee).');
            if (home.status === 'occupied') S.housing = 'parents';
            log('   You must find new housing. You are now living with parents.');
          } else {
            log('❌ Home was underwater. Bank absorbed the loss.');
            if (home.status === 'occupied') S.housing = 'parents';
          }
          S.ownedHomes = S.ownedHomes.filter(h => h.id !== c.homeId);
          c._repo = true;
        }
      }
    } else {
      S.wealth -= paymentInPlayer;
      c.remaining -= paymentInHome;
      c.yearsLeft--;
      c.missedPayments = 0;
    }
  });
  S.realestateContracts = S.realestateContracts.filter(c => !c._repo && c.yearsLeft > 0 && c.remaining > 0);

  /* Land construction */
  S.land.forEach(l => {
    const lc = l.country || 'egy';
    const baseAppreciation = (REAL_ESTATE_CONFIG.appreciationRates && REAL_ESTATE_CONFIG.appreciationRates[lc]) || 0.05;

    if (l.status === 'building') {
      l.buildYearsLeft--;
      if (l.buildYearsLeft <= 0) {
        l.status = 'built';
        l.value += Math.round(l.investedBuildCost * 1.5);
        log('Construction finished! ' + l.name + ' is now a built property.');
        S.ownedHomes.push(createHome({
          name: 'Custom Villa on ' + l.name,
          city: l.city,
          location: l.city,
          country: lc,
          baseValue: l.value,
          value: l.value,
          area: l.buildArea,
          finishing: 'standard',
          source: 'custom_build'
        }));
        l.transferred = true;
      }
    } else if (l.status === 'empty') {
      l.value = Math.round(l.value * (1 + (baseAppreciation * 0.8)));
    }
  });
  S.land = S.land.filter(l => !l.transferred);
}
GameHooks.on('year', realEstateYear);

/* ============================================================
   SUB-TAB REGISTRATION
   ============================================================ */
registerRealEstateTab({ id: 'compounds', label: 'Compounds', order: 0, requiresHome: false, render: compoundsSection });
registerRealEstateTab({ id: 'local', label: 'Local', order: 1, requiresHome: false, render: localSection });
registerRealEstateTab({ id: 'lands', label: 'Lands & Build', order: 2, requiresHome: false, render: landsSection });
registerRealEstateTab({ id: 'mine', label: 'My Home & Portfolio', order: 3, requiresHome: false, render: mineSection });

GameHooks.registerTab({ id: 'realestate', label: '🏠 Real Estate', order: 5, view: realEstateView });

console.log('[World Life] 15-view-realestate.js v4 loaded — currency-safe');
