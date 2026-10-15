/* =====================================================================
   61. INHERITANCE MIGRATE FIX + REAL ESTATE MAKEOVER
   - Migration: generate parents' home on old saves
   - Fix: compound installments showed 20× inflated values
   - Makeover: full Real Estate UI rewrite with sub-tabs and cards
   - New renovation modal with detailed tiers and prices
   - New compound browser modal
   Load AFTER 60-family-home-inheritance.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. MIGRATION FIX ============ */
const P61_migrateBefore = migrate;
migrate = function (o) {
  const r = P61_migrateBefore(o);
  if (!r) return r;
  if (r.housing === 'parents' && (!r.p60 || !r.p60.parentsHome)) {
    const prevS = (typeof S !== 'undefined') ? S : undefined;
    try {
      if (typeof S !== 'undefined') S = r;
      if (typeof p60GenerateParentsHome === 'function') p60GenerateParentsHome();
    } catch (e) {
      console.error('p61: parents home generation failed:', e);
    } finally {
      if (typeof S !== 'undefined' && prevS !== undefined) S = prevS;
    }
  }
  if (!r.p61) r.p61 = { subTab: 'portfolio' };
  return r;
};

function p61EnsureParentsHome() {
  if (!S) return false;
  if (typeof p60Init === 'function') p60Init(S);
  if (S.housing !== 'parents') return false;
  if (S.p60 && S.p60.parentsHome) return false;
  if (typeof p60GenerateParentsHome !== 'function') return false;
  try {
    p60GenerateParentsHome();
    if (typeof save === 'function') save();
    return true;
  } catch (e) {
    console.error('p61: parents home generation failed at runtime:', e);
    return false;
  }
}
setTimeout(p61EnsureParentsHome, 800);
setTimeout(p61EnsureParentsHome, 2000);

/* ============ 2. STATE ============ */
function p61Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p61) o.p61 = {};
  if (!o.p61.subTab) o.p61.subTab = 'portfolio';
  if (!o.p61.expandedHome) o.p61.expandedHome = null;
  if (typeof o.p61.compoundSel === 'undefined') o.p61.compoundSel = null;
}

/* ============ 3. HELPERS ============ */
function p61Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p61Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p61EGP(egp2026) { return Math.round(egp2026 * p61Idx()); }
function p61RateLabel(rate) { return ((Number(rate) || 0) * 100).toFixed(0) + '%'; }

function p61OwnedProperties() {
  return (S && Array.isArray(S.ownedHomes)) ? S.ownedHomes.slice() : [];
}
function p61RentedProperties() {
  return p61OwnedProperties().filter(function (h) {
    return h && (h.status === 'p12-rented' || h.status === 'rent') && h.tenant;
  });
}
function p61VacantProperties() {
  return p61OwnedProperties().filter(function (h) {
    return h && S.housing !== h.id && h.status !== 'p12-rented' && h.status !== 'rent';
  });
}
function p61PlayerSharedProperties() {
  return p61OwnedProperties().filter(function (h) { return h && h.coOwnedWith; });
}

/* Property condition color */
function p61CondColor(c) {
  if (c < 40) return 'var(--rose)';
  if (c < 65) return 'var(--amber)';
  return 'var(--mint)';
}

/* Home icon by type */
function p61HomeIcon(type) {
  const t = String(type || '').toLowerCase();
  if (t.indexOf('villa') >= 0) return '🏰';
  if (t.indexOf('duplex') >= 0) return '🏘️';
  if (t.indexOf('penthouse') >= 0) return '🌆';
  if (t.indexOf('studio') >= 0) return '🛋️';
  if (t.indexOf('townhouse') >= 0) return '🏡';
  if (t.indexOf('mansion') >= 0) return '🏛️';
  if (t.indexOf('condo') >= 0) return '🏢';
  return '🏠';
}

/* ============ 4. RENOVATION CATALOG (DETAILED WITH PRICES) ============ */
/* Each renovation returns: label, description, costEGP, condBoost, valueBoost, features */
const P61_RENOVATIONS = {
  paint: {
    icon: '🎨',
    label: 'Paint & finish',
    desc: 'Refresh the walls, ceiling, and trim.',
    tiers: [
      { tier: 'basic', name: 'Basic refresh',          egp: 12000, cond: 6,  value: 0.03, details: 'Patch, sand, and repaint in white or cream.' },
      { tier: 'std',   name: 'Quality paint',          egp: 28000, cond: 10, value: 0.05, details: 'Two coats of premium paint, accent wall options.' },
      { tier: 'prem',  name: 'Designer finish',        egp: 65000, cond: 15, value: 0.09, details: 'Decorative plaster, wall panels, designer colour palette.' }
    ]
  },
  kitchen: {
    icon: '🍳',
    label: 'Kitchen',
    desc: 'Cabinets, counters, sink, and fixtures.',
    tiers: [
      { tier: 'basic', name: 'Cosmetic refresh',       egp: 40000,  cond: 10, value: 0.06, details: 'Repaint cabinets, new handles, reseal tiles.' },
      { tier: 'std',   name: 'Mid-range remodel',      egp: 85000,  cond: 18, value: 0.12, details: 'Replace cabinet doors, granite countertop, new sink, faucet.' },
      { tier: 'prem',  name: 'Premium kitchen',        egp: 220000, cond: 26, value: 0.20, details: 'Custom wood cabinets, quartz counters, premium appliances, under-cabinet lighting.' }
    ]
  },
  bath: {
    icon: '🚿',
    label: 'Bathroom',
    desc: 'Tiles, fixtures, water heater, and vanity.',
    tiers: [
      { tier: 'basic', name: 'Plumbing repair',        egp: 18000, cond: 8,  value: 0.04, details: 'Fix leaks, replace faucets, deep clean tiles.' },
      { tier: 'std',   name: 'Modern bathroom',        egp: 55000, cond: 15, value: 0.09, details: 'New tiles, modern toilet, basin vanity, water heater.' },
      { tier: 'prem',  name: 'Marble & jacuzzi',       egp: 145000, cond: 24, value: 0.16, details: 'Marble finish, walk-in shower, jacuzzi tub, premium fixtures.' }
    ]
  },
  floors: {
    icon: '🪵',
    label: 'Flooring',
    desc: 'Replace worn floors with new material.',
    tiers: [
      { tier: 'basic', name: 'Vinyl or tile',          egp: 22000,  cond: 8,  value: 0.04, details: 'Durable vinyl or ceramic tile throughout.' },
      { tier: 'std',   name: 'Laminate or parquet',    egp: 48000,  cond: 14, value: 0.07, details: 'Wood-look laminate or engineered parquet.' },
      { tier: 'prem',  name: 'Hardwood or marble',     egp: 130000, cond: 22, value: 0.14, details: 'Solid hardwood or Italian marble throughout.' }
    ]
  },
  electrical: {
    icon: '💡',
    label: 'Electrical & lighting',
    desc: 'Wiring, distribution board, and light fixtures.',
    tiers: [
      { tier: 'basic', name: 'Safety upgrade',         egp: 15000, cond: 5,  value: 0.03, details: 'Replace old wiring, install safety breakers.' },
      { tier: 'std',   name: 'Full rewire + lighting', egp: 45000, cond: 10, value: 0.06, details: 'Modern wiring, new panel, LED lighting fixtures throughout.' },
      { tier: 'prem',  name: 'Smart home system',      egp: 125000, cond: 15, value: 0.11, details: 'Smart switches, RGB lighting, voice control, network cabling.' }
    ]
  },
  ac: {
    icon: '❄️',
    label: 'Air conditioning',
    desc: 'Install or upgrade AC units.',
    tiers: [
      { tier: 'basic', name: 'One split AC',           egp: 25000,  cond: 4,  value: 0.03, details: 'One basic split unit for the main room.' },
      { tier: 'std',   name: 'Multi-room inverter',    egp: 75000,  cond: 8,  value: 0.06, details: 'Inverter ACs for 3-4 rooms, energy-efficient.' },
      { tier: 'prem',  name: 'Full climate system',    egp: 180000, cond: 12, value: 0.10, details: 'Central ducted system, smart thermostats, whole-home coverage.' }
    ]
  }
};

/* ============ 5. WHO YOU LIVE WITH — HERO CARD ============ */
function p61BuildLiveHero() {
  if (!S) return '';

  /* Case 1: homeless */
  if (!S.housing) {
    return '<section class="card" style="padding:16px;border-color:var(--rose);background:linear-gradient(160deg,rgba(251,113,133,.08),var(--card))">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div><div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">YOU CURRENTLY LIVE</div>' +
      '<div style="font-size:1.3rem;font-weight:700;color:var(--rose);margin-top:4px">No fixed address</div>' +
      '<div class="muted" style="font-size:.85rem;margin-top:2px">You need a home — rent or buy in the tabs below.</div></div>' +
      '<span style="font-size:2.2rem">🏚️</span></div></section>';
  }

  /* Case 2: parents' home */
  if (S.housing === 'parents') {
    const h = S.p60 && S.p60.parentsHome;
    if (!h) {
      return '<section class="card" style="padding:16px;border-color:var(--cyan)">' +
        '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">YOU CURRENTLY LIVE</div>' +
        '<div style="font-size:1.2rem;font-weight:600;margin-top:4px">Parents\' home</div>' +
        '<div class="muted" style="font-size:.85rem">Living with family</div>' +
        '<button class="btn" style="margin-top:10px" onclick="p61EnsureParentsHome();render()">Generate parents home details</button>' +
        '</section>';
    }
    const rate = p61Rate();
    const valueEGP = Math.round(Number(h.value) * rate);
    const icon = p61HomeIcon(h.type);
    const condColor = p61CondColor(h.condition);
    const ownerLabel = h.owner === 'both' ? 'Jointly owned by parents'
      : h.owner === 'mother' ? 'Owned by your mother'
      : h.owner === 'father' ? 'Owned by your father'
      : 'Owned by your parents';

    return '<section class="card" style="padding:16px;border-color:var(--cyan);background:linear-gradient(160deg,rgba(34,211,238,.08),var(--card))">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
      '<div style="min-width:0;flex:1">' +
      '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">YOU CURRENTLY LIVE IN</div>' +
      '<div style="font-size:1.2rem;font-weight:700;margin-top:4px">Parents\' home</div>' +
      '<div class="muted" style="font-size:.85rem;margin-top:2px">Living with family · No rent</div>' +
      '</div>' +
      '<span style="font-size:2.4rem">' + icon + '</span></div>' +
      '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)">' +
      '<div class="row"><span>Address</span><b>' + h.address + '</b></div>' +
      '<div class="row"><span>Type</span><b>' + h.type + ' · ' + h.rooms + ' rooms · ' + h.area + ' m²</b></div>' +
      '<div class="row"><span>Built</span><b>' + h.builtYear + ' (' + (gameYear() - h.builtYear) + ' yrs old)</b></div>' +
      '<div class="row"><span>Ownership</span><b>' + ownerLabel + '</b></div>' +
      '<div class="row"><span>Condition</span><b style="color:' + condColor + '">' + Math.round(h.condition) + '%</b></div>' +
      '<div class="row"><span>Market value</span><b class="mono">' + valueEGP.toLocaleString() + ' EGP</b></div>' +
      ((h.features || []).length ? '<div class="row"><span>Features</span><b style="font-size:.78rem">' + h.features.join(' · ') + '</b></div>' : '') +
      ((h.renovations || []).length ? '<div class="row"><span>Renovations</span><b style="font-size:.78rem">' + h.renovations.join(', ') + '</b></div>' : '') +
      '</div>' +
      '<div class="acts" style="margin-top:12px">' +
      '<button class="btn" onclick="p61OpenParentsHomeModal()">🏠 Manage home</button>' +
      '<button class="btn" onclick="p61OpenRenovateModal(\'parents\')">🔧 Renovate</button>' +
      '</div>' +
      '</section>';
  }

  /* Case 3: owned home */
  const own = (S.ownedHomes || []).find(function (h) { return h && h.id === S.housing; });
  if (own) return p61BuildOwnedHomeHero(own);

  /* Case 4: rented flat from base catalog */
  const cat = (typeof HOUSING_CATALOG !== 'undefined')
    ? HOUSING_CATALOG.find(function (c) { return c && c.id === S.housing && c.kind === 'rent'; })
    : null;
  if (cat) {
    const rent = (typeof rentCost === 'function') ? rentCost(cat) : 0;
    const util = (S.country === 'egy' && typeof p14EgyptUtilityCost === 'function')
      ? p14EgyptUtilityCost(cat)
      : (Number(cat.util) || 0);
    const rate = p61Rate();
    return '<section class="card" style="padding:16px;border-color:var(--amber);background:linear-gradient(160deg,rgba(251,191,36,.08),var(--card))">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
      '<div><div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">YOU CURRENTLY LIVE IN</div>' +
      '<div style="font-size:1.2rem;font-weight:700;margin-top:4px">' + cat.name + '</div>' +
      '<div class="muted" style="font-size:.85rem;margin-top:2px">Renting</div></div>' +
      '<span style="font-size:2.4rem">🏢</span></div>' +
      '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)">' +
      '<div class="row"><span>Monthly rent</span><b class="mono">' + money(rent / 12) + '</b></div>' +
      '<div class="row"><span>Yearly rent</span><b class="mono">' + money(rent) + '</b></div>' +
      '<div class="row"><span>Utilities (yearly)</span><b class="mono">' + money(util) + '</b></div>' +
      '<div class="row"><span>Happiness</span><b>' + (cat.hap >= 0 ? '+' : '') + cat.hap + '</b></div>' +
      '<div class="row"><span>Health</span><b>' + (cat.hp >= 0 ? '+' : '') + cat.hp + '</b></div>' +
      '</div>' +
      '<button class="btn" style="margin-top:10px" onclick="furnishHome(\'' + cat.id + '\')">🛋 Furnish this home</button>' +
      '</section>';
  }

  return '';
}

function p61BuildOwnedHomeHero(home) {
  const rate = p61Rate();
  const valueEGP = Math.round((Number(home.value) || 0) * rate);
  const balEGP = Math.round((Number(home.balance) || 0) * rate);
  const equityEGP = valueEGP - balEGP;
  const condColor = p61CondColor(home.cond || 100);
  const icon = p61HomeIcon(home.name || home.typeId);

  return '<section class="card" style="padding:16px;border-color:var(--mint);background:linear-gradient(160deg,rgba(52,211,153,.08),var(--card))">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="min-width:0;flex:1">' +
    '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">YOU CURRENTLY LIVE IN</div>' +
    '<div style="font-size:1.2rem;font-weight:700;margin-top:4px">' + (home.name || 'Your home') + '</div>' +
    '<div class="muted" style="font-size:.85rem;margin-top:2px">' + (home.location || 'Owned property') + '</div>' +
    '</div>' +
    '<span style="font-size:2.4rem">' + icon + '</span></div>' +
    '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line)">' +
    '<div class="row"><span>Condition</span><b style="color:' + condColor + '">' + Math.round(home.cond || 100) + '%</b></div>' +
    '<div class="row"><span>Market value</span><b class="mono">' + valueEGP.toLocaleString() + ' EGP</b></div>' +
    (balEGP > 0 ? '<div class="row"><span>Mortgage balance</span><b class="mono" style="color:var(--rose)">' + balEGP.toLocaleString() + ' EGP</b></div>' : '') +
    '<div class="row"><span>Net equity</span><b class="mono" style="color:var(--mint)">' + equityEGP.toLocaleString() + ' EGP</b></div>' +
    '</div>' +
    '<div class="acts" style="margin-top:12px">' +
    '<button class="btn" onclick="p61OpenHomeDetailModal(\'' + home.id + '\')">📋 Manage</button>' +
    '<button class="btn" onclick="p61OpenRenovateModal(\'' + home.id + '\')">🔧 Renovate</button>' +
    '</div>' +
    '</section>';
}

/* ============ 6. SUB-TABS ============ */
function p61BuildSubTabs() {
  p61Init();
  const own = p61OwnedProperties().length;
  const rented = p61RentedProperties().length;
  const vacant = p61VacantProperties().length;
  const active = S.p61.subTab || 'portfolio';

  function tab(id, label, count) {
    const on = active === id;
    const countBadge = (count != null) ? ' <span style="opacity:.7">(' + count + ')</span>' : '';
    return '<button class="sub-tab' + (on ? ' on' : '') + '" onclick="p61SetSubTab(\'' + id + '\')" style="padding:8px 12px;font-size:.82rem">' +
      label + countBadge + '</button>';
  }

  return '<div style="display:flex;gap:6px;overflow-x:auto;margin-bottom:12px;padding-bottom:2px;scrollbar-width:none">' +
    tab('portfolio', '📊 Portfolio', own) +
    tab('rentals', '🏠 Rentals', rented + vacant) +
    tab('buy', '🛒 Buy') +
    tab('compounds', '🏗 Compounds') +
    '</div>';
}

function p61SetSubTab(id) {
  p61Init();
  S.p61.subTab = id;
  S.p61.expandedHome = null;
  render();
}
window.p61SetSubTab = p61SetSubTab;

/* ============ 7. PORTFOLIO TAB ============ */
function p61BuildPortfolioTab() {
  const props = p61OwnedProperties();
  if (!props.length) {
    return '<section class="card" style="text-align:center;padding:32px 16px">' +
      '<div style="font-size:3rem;opacity:.4">🏘️</div>' +
      '<h3 style="margin-top:12px">No properties owned</h3>' +
      '<p class="muted">Start by browsing the Buy or Compounds tabs above.</p>' +
      '</section>';
  }

  return props.map(p61BuildPropertyCard).join('');
}

function p61BuildPropertyCard(home) {
  if (!home) return '';
  const rate = p61Rate();
  const valueEGP = Math.round((Number(home.value) || 0) * rate);
  const balEGP = Math.round((Number(home.balance) || 0) * rate);
  const equityEGP = valueEGP - balEGP;
  const condColor = p61CondColor(home.cond || 100);
  const icon = p61HomeIcon(home.name || home.typeId);
  const isLive = S.housing === home.id;
  const isRented = (home.status === 'p12-rented' || home.status === 'rent') && home.tenant;
  const isListed = home.status === 'p12-listed';
  const isVacant = !isLive && !isRented && !isListed;

  /* Monthly cashflow */
  let rentMonthlyEGP = 0;
  if (isRented) {
    rentMonthlyEGP = home.rentLocalAmount || ((Number(home.rentAmount) || 0) * rate);
  }
  let mortgageMonthlyEGP = 0;
  if ((Number(home.balance) || 0) > 0 && home.pay) {
    mortgageMonthlyEGP = (Number(home.pay) * rate) / 12;
  }
  const maintMonthlyEGP = ((Number(home.value) || 0) * rate * 0.01) / 12;
  const netMonthlyEGP = rentMonthlyEGP - mortgageMonthlyEGP - maintMonthlyEGP;

  /* Status ribbon */
  let statusBadge;
  let statusColor;
  if (isLive) { statusBadge = '🏠 You live here'; statusColor = 'var(--mint)'; }
  else if (isRented) { statusBadge = '✅ Rented · ' + Math.round(rentMonthlyEGP).toLocaleString() + ' EGP/mo'; statusColor = 'var(--mint)'; }
  else if (isListed) { statusBadge = '⏳ Listed for rent'; statusColor = 'var(--amber)'; }
  else if (isVacant) { statusBadge = '⚠️ Vacant'; statusColor = 'var(--rose)'; }
  else { statusBadge = 'Vacant'; statusColor = 'var(--muted)'; }

  const expanded = S.p61.expandedHome === home.id;

  let html = '<section class="card" style="padding:0;overflow:hidden;border-left:3px solid ' + statusColor + '">';

  /* Header */
  html += '<div style="padding:14px 16px;background:linear-gradient(160deg,rgba(255,255,255,.03),transparent)">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="min-width:0;flex:1">' +
    '<div style="display:flex;align-items:center;gap:8px">' +
    '<span style="font-size:1.6rem">' + icon + '</span>' +
    '<b style="font-size:1.05rem">' + (home.name || 'Property') + '</b>' +
    '</div>' +
    '<div class="muted" style="font-size:.82rem;margin-top:4px">' + (home.location || 'Unknown') + '</div>' +
    '</div>' +
    '<div style="text-align:right;flex-shrink:0">' +
    '<div style="font-size:.78rem;font-weight:600;color:' + statusColor + '">' + statusBadge + '</div>' +
    '<div class="muted" style="font-size:.72rem;margin-top:2px">' + Math.round(home.cond || 100) + '% condition</div>' +
    '</div>' +
    '</div>';

  /* Key stats row */
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px">' +
    '<div style="text-align:center;padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
    '<div class="muted" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">Value</div>' +
    '<div class="mono" style="font-size:.85rem;margin-top:3px;color:var(--text)">E£' + (valueEGP / 1000000).toFixed(1) + 'M</div>' +
    '</div>' +
    '<div style="text-align:center;padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
    '<div class="muted" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">Equity</div>' +
    '<div class="mono" style="font-size:.85rem;margin-top:3px;color:var(--mint)">E£' + (equityEGP / 1000000).toFixed(1) + 'M</div>' +
    '</div>' +
    '<div style="text-align:center;padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
    '<div class="muted" style="font-size:.68rem;text-transform:uppercase;letter-spacing:.04em">Monthly</div>' +
    '<div class="mono" style="font-size:.85rem;margin-top:3px;color:' + (netMonthlyEGP >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' +
    (netMonthlyEGP >= 0 ? '+' : '') + 'E£' + Math.round(netMonthlyEGP / 1000) + 'k</div>' +
    '</div>' +
    '</div>';

  /* Condition bar */
  html += '<div style="margin-top:12px">' +
    '<div style="height:5px;background:var(--line);border-radius:3px;overflow:hidden">' +
    '<div style="height:100%;width:' + Math.min(100, home.cond || 100) + '%;background:' + condColor + ';transition:width .3s"></div>' +
    '</div>' +
    '</div>';

  html += '</div>';

  /* Main actions */
  html += '<div style="padding:0 16px 14px;display:grid;grid-template-columns:1fr 1fr;gap:6px">' +
    '<button class="btn" style="margin:0;padding:9px;font-size:.82rem" onclick="p61ToggleExpand(\'' + home.id + '\')">' +
    (expanded ? '▲ Less' : '▼ Details') + '</button>' +
    '<button class="btn" style="margin:0;padding:9px;font-size:.82rem" onclick="p61OpenRenovateModal(\'' + home.id + '\')">🔧 Renovate</button>' +
    '</div>';

  /* Expanded details */
  if (expanded) {
    html += '<div style="padding:0 16px 16px;border-top:1px solid var(--line);margin-top:4px">';

    html += '<h4 style="font-size:.85rem;margin:12px 0 6px;color:var(--cyan)">💰 Financials</h4>' +
      '<div class="row"><span>Estimated value</span><b class="mono">' + valueEGP.toLocaleString() + ' EGP</b></div>' +
      (balEGP > 0 ? '<div class="row"><span>Mortgage balance</span><b class="mono" style="color:var(--rose)">' + balEGP.toLocaleString() + ' EGP</b></div>' : '') +
      (balEGP > 0 ? '<div class="row"><span>Annual payment</span><b class="mono">' + Math.round((Number(home.pay) || 0) * rate).toLocaleString() + ' EGP/yr</b></div>' : '') +
      '<div class="row"><span>Net equity</span><b class="mono" style="color:var(--mint)">' + equityEGP.toLocaleString() + ' EGP</b></div>';

    if (isRented) {
      html += '<h4 style="font-size:.85rem;margin:12px 0 6px;color:var(--cyan)">📝 Tenant contract</h4>' +
        '<div class="row"><span>Monthly rent collected</span><b class="mono">' + Math.round(rentMonthlyEGP).toLocaleString() + ' EGP</b></div>' +
        '<div class="row"><span>Tenant since</span><b>' + (home.tenantStartYear || gameYear()) + '</b></div>' +
        '<div class="row"><span>Contract annual increase</span><b>' + (Number(home.rentStepPct) || 0) + '%</b></div>';
    } else if (isVacant || isListed) {
      html += '<div style="margin-top:12px;padding:10px;background:rgba(251,113,133,.08);border-left:3px solid var(--rose);border-radius:6px">' +
        '<b style="font-size:.82rem;color:var(--rose)">⚠️ Vacant — losing money</b>' +
        '<p class="muted" style="font-size:.78rem;margin-top:4px">Taxes, maintenance and any mortgage still apply. List for rent or move in.</p>' +
        '</div>';
    }

    /* Mortgage early payment */
    if (balEGP > 0) {
      html += '<h4 style="font-size:.85rem;margin:14px 0 6px;color:var(--cyan)">💸 Pay mortgage early</h4>' +
        '<div class="acts" style="margin-top:6px">' +
        '<button class="btn" onclick="p59PayMortgageCustom(\'' + home.id + '\')">Pay custom amount</button>' +
        '<button class="btn" ' + (balEGP <= Math.round(S.wealth * rate) ? '' : 'disabled') + ' onclick="p59PayMortgageFull(\'' + home.id + '\')">Pay off fully</button>' +
        '</div>';
    }

    /* Actions */
    html += '<h4 style="font-size:.85rem;margin:14px 0 6px;color:var(--cyan)">⚙️ Actions</h4>' +
      '<div class="acts" style="margin-top:6px">' +
      (!isLive ? '<button class="btn" onclick="setLiveProperty(' + S.ownedHomes.indexOf(home) + ')">🏠 Move in</button>' : '') +
      (!isRented && !isListed && !isLive ? '<button class="btn" onclick="p30AutoRentProperty(\'' + home.id + '\')">📌 Rent out now</button>' : '') +
      (isRented && !isLive ? '<button class="btn" onclick="p61EndTenancy(\'' + home.id + '\')">🚪 End tenancy</button>' : '') +
      '<button class="btn" onclick="p61SellProperty(\'' + home.id + '\')">💵 Sell property</button>' +
      '</div>';

    html += '</div>';
  }

  html += '</section>';
  return html;
}

function p61ToggleExpand(id) {
  p61Init();
  S.p61.expandedHome = S.p61.expandedHome === id ? null : id;
  render();
}
window.p61ToggleExpand = p61ToggleExpand;

function p61EndTenancy(homeId) {
  if (!S) return;
  const home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
  if (!home) return;
  if (!confirm('End the tenancy on ' + (home.name || 'this property') + '? The tenant will move out.')) return;
  home.status = 'vacant';
  home.tenant = false;
  home.tenantStartYear = null;
  log('🚪 Ended the tenancy on ' + (home.name || 'property') + '. The property is now vacant.');
  render();
}
window.p61EndTenancy = p61EndTenancy;

function p61SellProperty(homeId) {
  if (!S) return;
  const idx = (S.ownedHomes || []).findIndex(function (h) { return h && h.id === homeId; });
  if (idx === -1) return;
  const home = S.ownedHomes[idx];
  const rate = p61Rate();
  const valueEGP = Math.round((Number(home.value) || 0) * rate);
  const balEGP = Math.round((Number(home.balance) || 0) * rate);
  const equityEGP = valueEGP - balEGP;
  if (!confirm('Sell ' + (home.name || 'property') + '?\n\nEstimated net equity: ' + equityEGP.toLocaleString() + ' EGP\n\n(Mortgage of ' + balEGP.toLocaleString() + ' EGP will be cleared first)')) return;
  if (S.housing === home.id) S.housing = 'parents';
  S.wealth += (Number(home.value) || 0) - (Number(home.balance) || 0);
  S.ownedHomes.splice(idx, 1);
  log('💵 Sold ' + (home.name || 'property') + ' for ' + equityEGP.toLocaleString() + ' EGP net equity.');
  render();
}
window.p61SellProperty = p61SellProperty;

/* ============ 8. RENTALS TAB ============ */
function p61BuildRentalsTab() {
  const rate = p61Rate();
  const rented = p61RentedProperties();
  const vacant = p61VacantProperties();

  let html = '';

  if (rented.length) {
    html += '<section class="card"><h3>📌 Active tenancies (' + rented.length + ')</h3>' +
      rented.map(function (h) {
        const monthlyEGP = h.rentLocalAmount || ((Number(h.rentAmount) || 0) * rate);
        return '<div class="row"><span>' + (h.name || 'Property') + '</span>' +
          '<b class="mono" style="color:var(--mint)">+' + Math.round(monthlyEGP).toLocaleString() + ' EGP/mo</b></div>';
      }).join('') +
      '</section>';
  }

  if (vacant.length) {
    html += '<section class="card" style="border-color:var(--amber)"><h3>⚠️ Vacant — needs tenants (' + vacant.length + ')</h3>' +
      '<p class="muted" style="font-size:.82rem">Empty properties lose money. Find tenants now at market rate.</p>' +
      vacant.map(function (h) {
        const valEGP = Math.round((Number(h.value) || 0) * rate);
        const yieldRate = Number(h.marketRentRate) || 0.0035;
        const estMonthly = Math.round(valEGP * yieldRate);
        return '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
          '<b>' + (h.name || 'Property') + '</b>' +
          '<div class="row"><span>Estimated market rent</span><b class="mono">' + estMonthly.toLocaleString() + ' EGP/mo</b></div>' +
          '<div class="row"><span>Annual income potential</span><b class="mono">' + (estMonthly * 12).toLocaleString() + ' EGP/yr</b></div>' +
          '<button class="btn" style="margin-top:6px" onclick="p30AutoRentProperty(\'' + h.id + '\')">📌 Find tenant at market rent</button>' +
          '</div>';
      }).join('') +
      '</section>';
  }

  /* Lower-cost rentals */
  const rentalCatalog = (typeof HOUSING_CATALOG !== 'undefined')
    ? HOUSING_CATALOG.filter(function (h) { return h && h.kind === 'rent'; })
    : [];

  if (rentalCatalog.length) {
    html += '<section class="card"><h3>🔑 Available rentals</h3>' +
      '<p class="muted" style="font-size:.82rem">Rent a lower-cost place to live. Rent is charged monthly in real life; the game keeps an annual cost ledger.</p>' +
      rentalCatalog.map(function (h) {
        const rent = (typeof rentCost === 'function') ? rentCost(h) : (h.cost || 0);
        const util = (S.country === 'egy' && typeof p14EgyptUtilityCost === 'function')
          ? p14EgyptUtilityCost(h)
          : (h.util || 0);
        const isCurrent = S.housing === h.id;
        const canAfford = h.id === 'room' || S.wealth >= Math.round(rent / 12);
        return '<div style="margin-top:10px;padding:12px;border:1px solid ' + (isCurrent ? 'var(--mint)' : 'var(--line)') + ';border-radius:10px">' +
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
          '<b>' + h.name + '</b>' +
          '<span style="font-size:.8rem;color:' + (isCurrent ? 'var(--mint)' : 'var(--muted)') + '">' + (isCurrent ? '✅ Current' : '') + '</span>' +
          '</div>' +
          '<p class="muted" style="font-size:.8rem;margin-top:4px">' + (h.desc || '') + '</p>' +
          '<div class="row"><span>Yearly rent</span><b class="mono">' + money(rent) + '</b></div>' +
          '<div class="row"><span>Monthly rent</span><b class="mono">' + money(rent / 12) + '</b></div>' +
          '<div class="row"><span>Yearly utilities</span><b class="mono">' + money(util) + '</b></div>' +
          '<div class="row"><span>Comfort</span><b>' +
          'Happiness ' + (h.hap >= 0 ? '+' : '') + h.hap + ' · Health ' + (h.hp >= 0 ? '+' : '') + h.hp +
          '</b></div>' +
          (!isCurrent ? '<button class="btn" style="margin-top:8px" ' + (canAfford ? '' : 'disabled') + ' onclick="rentHome(\'' + h.id + '\')">' +
            (canAfford ? 'Rent this apartment' : 'Need first month in cash') + '</button>' : '') +
          '</div>';
      }).join('') +
      '</section>';
  }

  return html || '<section class="card" style="text-align:center;padding:32px 16px"><div style="font-size:3rem;opacity:.4">🔑</div><h3 style="margin-top:12px">No rentals available</h3></section>';
}

/* ============ 9. BUY TAB ============ */
function p61BuildBuyTab() {
  if (typeof p12PropertyMarket !== 'function') {
    return '<section class="card"><p class="muted">Market not available.</p></section>';
  }
  const market = p12PropertyMarket();
  if (!market || !market.length) {
    return '<section class="card" style="text-align:center;padding:32px 16px"><div style="font-size:3rem;opacity:.4">🛒</div><h3 style="margin-top:12px">No listings this year</h3><p class="muted">New properties appear each game year.</p></section>';
  }

  const rate = p61Rate();
  const wealthEGP = Math.round(S.wealth * rate);

  return '<section class="card"><h3>🛒 Market listings (' + market.length + ')</h3>' +
    '<p class="muted" style="font-size:.82rem">Each property has its own condition, location, and features. Prices are game examples, not live data.</p>' +
    market.map(function (l) {
      const priceInternal = Number(l.priceInternal) || 0;
      const priceEGP = Math.round(priceInternal * rate);
      const deposit20 = Math.round(priceEGP * 0.20);
      const condColor = p61CondColor(l.condition || 100);
      const canCash = wealthEGP >= priceEGP;
      const canMortgage = wealthEGP >= deposit20;
      const icon = p61HomeIcon(l.typeId || l.name);

      return '<div style="margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
        '<div style="min-width:0;flex:1">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="font-size:1.5rem">' + icon + '</span>' +
        '<b>' + l.name + '</b>' +
        '</div>' +
        '<div class="muted" style="font-size:.78rem;margin-top:4px">' + (l.location || '') + '</div>' +
        '</div>' +
        '<div style="text-align:right">' +
        '<div class="mono" style="font-size:.95rem;font-weight:700">E£' + (priceEGP / 1000000).toFixed(2) + 'M</div>' +
        '<div class="muted" style="font-size:.72rem">' + (l.condition || 100) + '% cond</div>' +
        '</div>' +
        '</div>' +
        '<div style="margin-top:8px;height:4px;background:var(--line);border-radius:2px;overflow:hidden">' +
        '<div style="height:100%;width:' + (l.condition || 100) + '%;background:' + condColor + '"></div>' +
        '</div>' +
        (l.features && l.features.length ? '<p class="muted" style="font-size:.76rem;margin-top:6px">' + l.features.join(' · ') + '</p>' : '') +
        '<div class="row"><span>Cash price</span><b class="mono">' + priceEGP.toLocaleString() + ' EGP</b></div>' +
        '<div class="row"><span>Mortgage deposit (20%)</span><b class="mono">' + deposit20.toLocaleString() + ' EGP</b></div>' +
        '<div class="acts" style="margin-top:8px">' +
        '<button class="btn" ' + (canCash ? '' : 'disabled') + ' onclick="p12BuyListing(\'' + l.id + '\',\'cash\')">' +
        (canCash ? '💵 Buy cash' : 'Not enough cash') + '</button>' +
        '<button class="btn" ' + (canMortgage ? '' : 'disabled') + ' onclick="p12BuyListing(\'' + l.id + '\',\'mortgage\')">' +
        (canMortgage ? '🏦 Mortgage 20%' : 'Need deposit') + '</button>' +
        '</div>' +
        '</div>';
    }).join('') +
    '</section>';
}

/* ============ 10. COMPOUNDS TAB ============ */
function p61BuildCompoundsTab() {
  if (typeof COMPOUND_ROSTER === 'undefined') {
    return '<section class="card"><p class="muted">Compound market not available.</p></section>';
  }
  const country = S.country || 'egy';
  const compounds = COMPOUND_ROSTER[country] || COMPOUND_ROSTER.egy || [];

  let html = '<section class="card"><h3>🏗 Gated compounds</h3>' +
    '<p class="muted" style="font-size:.82rem">Premium gated communities with security, amenities, and developer payment plans. Prices per m², with flexible installments.</p>';

  compounds.forEach(function (c) {
    const icon = '🏙️';
    html += '<details style="margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:10px">' +
      '<summary style="cursor:pointer">' +
      '<span style="font-size:1.2rem">' + icon + '</span> <b>' + c.name + '</b>' +
      (c.dev ? ' <span class="muted" style="font-size:.78rem">by ' + c.dev + '</span>' : '') +
      '<div class="muted" style="font-size:.78rem;margin-top:2px">' + c.loc + ' · ' + c.tag + '</div>' +
      '</summary>' +
      '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">' +
      '<div class="row"><span>Happiness</span><b>+' + c.hap + '</b></div>' +
      '<div class="row"><span>Health</span><b>+' + c.hp + '</b></div>' +
      '<div class="row"><span>Price per m² (base)</span><b class="mono">' + Math.round(c.ppm * p61Idx()).toLocaleString() + ' EGP</b></div>' +
      '<button class="btn" style="margin-top:8px" onclick="p61OpenCompoundModal(\'' + c.id + '\')">Browse units & plans</button>' +
      '</div>' +
      '</details>';
  });

  html += '</section>';

  /* Local standalone market */
  if (typeof LOCAL_MARKET_ROSTER !== 'undefined') {
    const locals = LOCAL_MARKET_ROSTER[country] || LOCAL_MARKET_ROSTER.egy || [];
    if (locals.length) {
      html += '<section class="card"><h3>🏘 Local standalone areas</h3>' +
        '<p class="muted" style="font-size:.82rem">30-50% cheaper than compounds. Immediate move-in, no compound fees, cash upfront.</p>';
      locals.forEach(function (c) {
        html += '<details style="margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:10px">' +
          '<summary style="cursor:pointer"><b>' + c.name + '</b>' +
          '<div class="muted" style="font-size:.78rem;margin-top:2px">' + c.loc + ' · ' + c.tag + '</div>' +
          '</summary>' +
          '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line)">' +
          '<div class="row"><span>Price per m² (base)</span><b class="mono">' + Math.round(c.ppm * p61Idx()).toLocaleString() + ' EGP</b></div>' +
          '<div class="row"><span>Payment</span><b>Cash upfront only</b></div>' +
          '<button class="btn" style="margin-top:8px" onclick="p61OpenCompoundModal(\'' + c.id + '\',true)">Browse units</button>' +
          '</div>' +
          '</details>';
      });
      html += '</section>';
    }
  }

  return html;
}

/* ============ 11. PARENTS HOME MODAL ============ */
function p61OpenParentsHomeModal() {
  const h = S.p60 && S.p60.parentsHome;
  if (!h) return hint('No parents home details.');
  const rate = p61Rate();
  const valueEGP = Math.round((Number(h.value) || 0) * rate);

  const maidOptions = [
    { id: 'cleaner', label: 'Weekly cleaner',   egpMonthly: 3500, desc: 'Comes twice a week to clean common areas.' },
    { id: 'maid',    label: 'Full-time helper', egpMonthly: 8000, desc: 'Lives or comes daily. Handles cooking, cleaning, errands.' }
  ];

  const renoOptions = Object.keys(P61_RENOVATIONS).map(function (k) {
    const r = P61_RENOVATIONS[k];
    const basicTier = r.tiers[0];
    return '<button class="btn" style="text-align:left;display:block" onclick="p61OpenRenovateModal(\'parents\',\'' + k + '\')">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div>' +
      '<b>' + r.icon + ' ' + r.label + '</b>' +
      '<div class="muted" style="font-size:.75rem;margin-top:2px">' + r.desc + '</div>' +
      '</div>' +
      '<div style="text-align:right;font-size:.78rem">' +
      '<div class="mono">from ' + p61EGP(basicTier.egp).toLocaleString() + ' EGP</div>' +
      '</div>' +
      '</div>' +
      '</button>';
  }).join('');

  const ownerLabel = h.owner === 'both' ? 'Joint'
    : h.owner === 'mother' ? 'Mother' : h.owner === 'father' ? 'Father' : 'Parents';

  const modal = document.createElement('div');
  modal.id = 'p61-parents-modal';
  modal.className = 'p24-modal-backdrop';
  modal.innerHTML = '<div class="p24-modal" style="max-width:480px;max-height:88vh;overflow-y:auto">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<div>' +
    '<div class="p24-pill">🏠 Parents home</div>' +
    '<h2 style="margin-top:8px">' + h.address + '</h2>' +
    '</div>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p61-parents-modal\').remove()">✕</button>' +
    '</div>' +
    '<div style="margin-top:12px">' +
    '<div class="row"><span>Type</span><b>' + h.type + ' · ' + h.rooms + ' rooms · ' + h.area + ' m²</b></div>' +
    '<div class="row"><span>Built</span><b>' + h.builtYear + ' (' + (gameYear() - h.builtYear) + ' yrs)</b></div>' +
    '<div class="row"><span>Owner</span><b>' + ownerLabel + '</b></div>' +
    '<div class="row"><span>Condition</span><b style="color:' + p61CondColor(h.condition) + '">' + Math.round(h.condition) + '%</b></div>' +
    '<div class="row"><span>Value</span><b class="mono">' + valueEGP.toLocaleString() + ' EGP</b></div>' +
    ((h.features || []).length ? '<div class="row"><span>Features</span><b style="font-size:.78rem">' + h.features.join(' · ') + '</b></div>' : '') +
    '</div>' +
    '<h3 style="margin-top:20px;font-size:.95rem">👥 Household help</h3>' +
    (S.p60.homeMaid
      ? '<div class="row"><span>Current</span><b>' + (S.p60.homeMaid === 'cleaner' ? 'Weekly cleaner' : 'Full-time helper') + '</b></div>' +
        '<button class="btn" onclick="p60CancelMaid();document.getElementById(\'p61-parents-modal\').remove()">Cancel help</button>'
      : maidOptions.map(function (m) {
          const egp = p61EGP(m.egpMonthly);
          const canAfford = S.wealth >= egp / rate;
          return '<button class="btn" ' + (canAfford ? '' : 'disabled') + ' onclick="p60HireMaid(\'' + m.id + '\');document.getElementById(\'p61-parents-modal\').remove()">' +
            m.label + ' · ' + egp.toLocaleString() + ' EGP/month' +
            '<div class="muted" style="font-size:.75rem;margin-top:2px">' + m.desc + '</div>' +
            (canAfford ? '' : '<small>Not enough cash</small>') +
            '</button>';
        }).join('')
    ) +
    '<h3 style="margin-top:20px;font-size:.95rem">🔧 Renovations</h3>' +
    renoOptions +
    ((h.renovations || []).length ? '<p class="muted" style="font-size:.78rem;margin-top:10px">Completed: ' + h.renovations.join(', ') + '</p>' : '') +
    '</div>';
  document.body.appendChild(modal);
}
window.p61OpenParentsHomeModal = p61OpenParentsHomeModal;

/* ============ 12. RENOVATION MODAL ============ */
function p61OpenRenovateModal(homeId, category) {
  if (!S) return;
  /* Get the property or parents home */
  let home = null;
  let isParents = false;
  if (homeId === 'parents') {
    isParents = true;
    home = S.p60 && S.p60.parentsHome;
  } else {
    home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
  }
  if (!home) return hint('Property not found.');

  if (!category) {
    /* Show category chooser */
    p61ShowRenovateCategoryChooser(homeId, isParents);
    return;
  }

  const cat = P61_RENOVATIONS[category];
  if (!cat) return hint('Unknown renovation.');

  const rate = p61Rate();
  const currentCond = Number(home.condition || home.cond || 60);
  const currentValueEGP = Math.round((Number(home.value) || 0) * rate);

  const tierHtml = cat.tiers.map(function (t) {
    const egp = p61EGP(t.egp);
    const internal = egp / rate;
    const canAfford = S.wealth >= internal;
    const newCond = Math.min(100, currentCond + t.cond);
    const newValueEGP = Math.round((Number(home.value) || 0) * (1 + t.value) * rate);

    return '<div style="margin-top:12px;padding:12px;border:1px solid ' + (t.tier === 'std' ? 'var(--cyan)' : 'var(--line)') + ';border-radius:10px;' +
      (t.tier === 'std' ? 'background:rgba(34,211,238,.06)' : '') + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
      '<div><b>' + t.name + '</b>' +
      (t.tier === 'std' ? ' <span style="font-size:.7rem;color:var(--cyan);padding:2px 6px;background:rgba(34,211,238,.15);border-radius:4px">⭐ RECOMMENDED</span>' : '') +
      '</div>' +
      '<div class="mono" style="font-size:.95rem;font-weight:700">' + egp.toLocaleString() + ' EGP</div>' +
      '</div>' +
      '<p class="muted" style="font-size:.82rem;margin-top:6px">' + t.details + '</p>' +
      '<div class="row" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--line)">' +
      '<span>Condition</span>' +
      '<b>' + currentCond + '% → <span style="color:var(--mint)">' + newCond + '%</span></b>' +
      '</div>' +
      '<div class="row" style="border:0">' +
      '<span>Value</span>' +
      '<b>E£' + (currentValueEGP / 1000000).toFixed(2) + 'M → <span style="color:var(--mint)">E£' + (newValueEGP / 1000000).toFixed(2) + 'M</span></b>' +
      '</div>' +
      '<button class="btn" style="margin-top:8px" ' + (canAfford ? '' : 'disabled') + ' onclick="p61DoRenovation(\'' + homeId + '\',\'' + category + '\',\'' + t.tier + '\')">' +
      (canAfford ? 'Select ' + t.name + ' · ' + egp.toLocaleString() + ' EGP' : 'Not enough cash') +
      '</button>' +
      '</div>';
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'p61-reno-modal';
  modal.className = 'p24-modal-backdrop';
  modal.innerHTML = '<div class="p24-modal" style="max-width:480px;max-height:88vh;overflow-y:auto">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<div>' +
    '<div class="p24-pill">' + cat.icon + ' Renovation</div>' +
    '<h2 style="margin-top:8px">' + cat.label + '</h2>' +
    '<p class="muted" style="font-size:.82rem;margin-top:4px">' + cat.desc + '</p>' +
    '</div>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p61-reno-modal\').remove()">✕</button>' +
    '</div>' +
    '<div style="margin-top:14px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
    '<div class="row" style="border:0"><span><b>Current condition</b></span><b>' + currentCond + '%</b></div>' +
    '<div class="row" style="border:0"><span><b>Current value</b></span><b class="mono">' + currentValueEGP.toLocaleString() + ' EGP</b></div>' +
    '</div>' +
    tierHtml +
    '<button class="btn" style="margin-top:16px" onclick="document.getElementById(\'p61-reno-modal\').remove();p61OpenRenovateModal(\'' + homeId + '\')">← Back to categories</button>' +
    '</div>';
  document.body.appendChild(modal);
}
window.p61OpenRenovateModal = p61OpenRenovateModal;

function p61ShowRenovateCategoryChooser(homeId, isParents) {
  const rate = p61Rate();
  let home;
  if (homeId === 'parents') home = S.p60 && S.p60.parentsHome;
  else home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
  if (!home) return hint('Property not found.');

  const currentCond = Number(home.condition || home.cond || 60);
  const valueEGP = Math.round((Number(home.value) || 0) * rate);

  const catsHtml = Object.keys(P61_RENOVATIONS).map(function (k) {
    const r = P61_RENOVATIONS[k];
    const basic = r.tiers[0];
    return '<button class="btn" style="text-align:left;padding:14px" onclick="p61OpenRenovateModal(\'' + homeId + '\',\'' + k + '\')">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
      '<div>' +
      '<b style="font-size:.95rem">' + r.icon + ' ' + r.label + '</b>' +
      '<div class="muted" style="font-size:.75rem;margin-top:3px">' + r.desc + '</div>' +
      '</div>' +
      '<div style="text-align:right;flex-shrink:0">' +
      '<div class="mono" style="font-size:.82rem">from ' + p61EGP(basic.egp).toLocaleString() + '</div>' +
      '<div class="muted" style="font-size:.7rem">EGP</div>' +
      '</div>' +
      '</div>' +
      '</button>';
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'p61-reno-modal';
  modal.className = 'p24-modal-backdrop';
  modal.innerHTML = '<div class="p24-modal" style="max-width:480px;max-height:88vh;overflow-y:auto">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<div>' +
    '<div class="p24-pill">🔧 Renovation</div>' +
    '<h2 style="margin-top:8px">' + (home.name || home.address || 'Property') + '</h2>' +
    '<p class="muted" style="font-size:.82rem;margin-top:4px">Choose a category. Each has three quality tiers with different costs and results.</p>' +
    '</div>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p61-reno-modal\').remove()">✕</button>' +
    '</div>' +
    '<div style="margin-top:14px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
    '<div class="row" style="border:0"><span><b>Condition</b></span><b style="color:' + p61CondColor(currentCond) + '">' + currentCond + '%</b></div>' +
    '<div class="row" style="border:0"><span><b>Value</b></span><b class="mono">' + valueEGP.toLocaleString() + ' EGP</b></div>' +
    '</div>' +
    '<div style="margin-top:14px">' + catsHtml + '</div>' +
    '</div>';
  document.body.appendChild(modal);
}
window.p61ShowRenovateCategoryChooser = p61ShowRenovateCategoryChooser;

function p61DoRenovation(homeId, category, tierKey) {
  let home;
  let isParents = homeId === 'parents';
  if (isParents) home = S.p60 && S.p60.parentsHome;
  else home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
  if (!home) return hint('Property not found.');

  const cat = P61_RENOVATIONS[category];
  if (!cat) return hint('Category not found.');
  const tier = cat.tiers.find(function (t) { return t.tier === tierKey; });
  if (!tier) return hint('Tier not found.');

  const egp = p61EGP(tier.egp);
  const rate = p61Rate();
  const internal = egp / rate;
  if (S.wealth < internal) return hint('You need ' + egp.toLocaleString() + ' EGP.');

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.renovations = (S.bill.renovations || 0) + internal;

  home.condition = Math.min(100, (Number(home.condition) || Number(home.cond) || 60) + tier.cond);
  if (typeof home.cond !== 'undefined') home.cond = home.condition;
  home.value = Math.round((Number(home.value) || 0) * (1 + tier.value));
  home.renovations = home.renovations || [];
  home.renovations.push(tier.name + ' — ' + cat.label);

  /* If parents home, boost bond */
  if (isParents) {
    (S.family || []).filter(function (m) { return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); })
      .forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 6); });
  }

  fx({ happiness: 3 });
  log('🔧 Renovation complete: ' + tier.name + ' — ' + cat.label + ' at ' + (home.name || home.address || 'property') + ' (' + egp.toLocaleString() + ' EGP).');
  if (typeof realismNotice === 'function') {
    realismNotice('Renovation completed', tier.name + ' — ' + cat.label + '. ' + tier.details + ' Cost: ' + egp.toLocaleString() + ' EGP.');
  }
  /* Close modal */
  const modal = document.getElementById('p61-reno-modal');
  if (modal) modal.remove();
  render();
}
window.p61DoRenovation = p61DoRenovation;

/* ============ 13. HOME DETAIL MODAL ============ */
function p61OpenHomeDetailModal(homeId) {
  const home = (S.ownedHomes || []).find(function (h) { return h && h.id === homeId; });
  if (!home) return hint('Property not found.');
  const rate = p61Rate();
  const valueEGP = Math.round((Number(home.value) || 0) * rate);
  const balEGP = Math.round((Number(home.balance) || 0) * rate);

  const modal = document.createElement('div');
  modal.id = 'p61-home-modal';
  modal.className = 'p24-modal-backdrop';
  modal.innerHTML = '<div class="p24-modal" style="max-width:480px;max-height:88vh;overflow-y:auto">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<div><div class="p24-pill">🏠 Property</div><h2 style="margin-top:8px">' + (home.name || 'Property') + '</h2>' +
    '<p class="muted" style="font-size:.82rem;margin-top:4px">' + (home.location || '') + '</p></div>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p61-home-modal\').remove()">✕</button>' +
    '</div>' +
    '<div style="margin-top:14px">' +
    '<div class="row"><span>Value</span><b class="mono">' + valueEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row"><span>Mortgage balance</span><b class="mono" style="color:var(--rose)">' + balEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row"><span>Net equity</span><b class="mono" style="color:var(--mint)">' + (valueEGP - balEGP).toLocaleString() + ' EGP</b></div>' +
    '<div class="row"><span>Condition</span><b style="color:' + p61CondColor(home.cond || 100) + '">' + Math.round(home.cond || 100) + '%</b></div>' +
    '</div>' +
    '<div class="acts" style="margin-top:14px">' +
    '<button class="btn" onclick="p61OpenRenovateModal(\'' + homeId + '\');document.getElementById(\'p61-home-modal\').remove()">🔧 Renovate</button>' +
    '<button class="btn" onclick="p61SellProperty(\'' + homeId + '\');document.getElementById(\'p61-home-modal\').remove()">💵 Sell</button>' +
    '</div>' +
    '</div>';
  document.body.appendChild(modal);
}
window.p61OpenHomeDetailModal = p61OpenHomeDetailModal;

/* ============ 14. COMPOUND MODAL ============ */
function p61OpenCompoundModal(compoundId, isLocal) {
  if (typeof COMPOUND_ROSTER === 'undefined') return;
  const country = S.country || 'egy';
  const catalog = isLocal
    ? (typeof LOCAL_MARKET_ROSTER !== 'undefined' ? (LOCAL_MARKET_ROSTER[country] || LOCAL_MARKET_ROSTER.egy) : [])
    : (COMPOUND_ROSTER[country] || COMPOUND_ROSTER.egy || []);
  const prop = catalog.find(function (c) { return c.id === compoundId; });
  if (!prop) return hint('Compound not found.');

  const rate = p61Rate();
  const idx = p61Idx();
  const plans = isLocal ? [{ id: 'cash', label: 'Cash purchase', downPct: 1, years: 0, markup: 1.0 }] : (typeof COMPOUND_PLANS !== 'undefined' ? COMPOUND_PLANS : []);
  const units = (typeof PROPERTY_UNITS !== 'undefined') ? PROPERTY_UNITS : [];

  const unitsHtml = units.map(function (u) {
    const rawPrice = u.area * prop.ppm * u.mult * idx;
    const basePrice = Math.round(rawPrice / 1000) * 1000;
    return '<div style="margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div><b>' + u.name + '</b><div class="muted" style="font-size:.78rem">' + u.area + ' m²</div></div>' +
      '<div style="text-align:right"><div class="muted" style="font-size:.72rem">Base cash price</div>' +
      '<div class="mono" style="font-size:.95rem;font-weight:700">' + basePrice.toLocaleString() + ' EGP</div></div>' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' +
      plans.map(function (p) {
        const finalAmt = Math.round(basePrice * p.markup);
        const downAmt = Math.round(finalAmt * p.downPct);
        const canAfford = S.wealth >= (downAmt / rate);
        return '<button class="btn" style="flex:1;min-width:140px;margin:0;padding:9px;font-size:.78rem;text-align:left" ' +
          (canAfford ? '' : 'disabled') +
          ' onclick="purchaseProperty(\'' + prop.id + '\',\'' + u.id + '\',\'' + p.id + '\',' + (!isLocal) + ',' + (country === 'egy') + ');document.getElementById(\'p61-compound-modal\').remove()">' +
          '<b>' + p.label + '</b>' +
          '<div class="muted" style="font-size:.72rem;margin-top:3px">Down: ' + downAmt.toLocaleString() + ' EGP</div>' +
          (canAfford ? '' : '<small>Not enough cash</small>') +
          '</button>';
      }).join('') +
      '</div>' +
      '</div>';
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'p61-compound-modal';
  modal.className = 'p24-modal-backdrop';
  modal.innerHTML = '<div class="p24-modal" style="max-width:520px;max-height:88vh;overflow-y:auto">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
    '<div><div class="p24-pill">' + (isLocal ? '🏘 Local market' : '🏗 Compound') + '</div>' +
    '<h2 style="margin-top:8px">' + prop.name + '</h2>' +
    '<p class="muted" style="font-size:.82rem;margin-top:4px">' + prop.loc + ' · ' + prop.tag + '</p></div>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p61-compound-modal\').remove()">✕</button>' +
    '</div>' +
    '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
    '<div class="row" style="border:0"><span>Happiness</span><b>+' + prop.hap + '</b></div>' +
    '<div class="row" style="border:0"><span>Health</span><b>+' + prop.hp + '</b></div>' +
    (prop.dev ? '<div class="row" style="border:0"><span>Developer</span><b>' + prop.dev + '</b></div>' : '') +
    '</div>' +
    unitsHtml +
    '</div>';
  document.body.appendChild(modal);
}
window.p61OpenCompoundModal = p61OpenCompoundModal;

/* ============ 15. MAIN viewAssets REPLACEMENT ============ */
const P61_viewAssetsBefore = viewAssets;
viewAssets = function () {
  /* Preserve any early-exit checks */
  if (!S) return P61_viewAssetsBefore();
  if (S.age < 18) return P61_viewAssetsBefore();

  p61Init();

  /* Ensure parents home exists */
  if (S.housing === 'parents' && (!S.p60 || !S.p60.parentsHome)) {
    p61EnsureParentsHome();
  }

  /* Build from scratch — no old sections */
  let html = p61BuildLiveHero();
  html += '<div style="margin-top:12px">' + p61BuildSubTabs() + '</div>';

  const subTab = S.p61.subTab || 'portfolio';
  if (subTab === 'portfolio') html += p61BuildPortfolioTab();
  else if (subTab === 'rentals') html += p61BuildRentalsTab();
  else if (subTab === 'buy') html += p61BuildBuyTab();
  else if (subTab === 'compounds') html += p61BuildCompoundsTab();

  return html;
};

/* ============ 16. DEBUG HELPER ============ */
window.p61Debug = function () {
  if (!S) return console.log('No S.');
  console.log('housing:', S.housing);
  console.log('p60 parentsHome:', S.p60 && S.p60.parentsHome);
  console.log('p61 subTab:', S.p61 && S.p61.subTab);
  console.log('ownedHomes:', (S.ownedHomes || []).length);
  (S.ownedHomes || []).forEach(function (h, i) {
    const rate = p61Rate();
    console.log('  #' + i, h.name, '| status:', h.status, '| value EGP:', Math.round((h.value || 0) * rate).toLocaleString(), '| balance EGP:', Math.round((h.balance || 0) * rate).toLocaleString());
  });
  console.log('contracts:', S.housingStore && S.housingStore.contracts);
};

/* ============ 17. HOOKS + INIT ============ */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    if (S && S.housing === 'parents' && (!S.p60 || !S.p60.parentsHome)) {
      if (p61EnsureParentsHome()) render();
    }
  });
}

p61EnsureParentsHome();
p61Init(S);
