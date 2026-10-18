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
  const availableTabs = RealEstateTabs.filter(t => !t.requiresHome || S.ownedHomes.length > 0);
  const currentTab = availableTabs.find(t => t.id === S.realEstateTab) || availableTabs[0];
  if (currentTab && S.realEstateTab !== currentTab.id) S.realEstateTab = currentTab.id;

  const trendIcon = S.marketTrend.state === 'boom' ? '🚀' : S.marketTrend.state === 'crash' ? '📉' : '⚖️';
  const trendColor = S.marketTrend.state === 'boom' ? '#34d399' : S.marketTrend.state === 'crash' ? '#fb7185' : '#e8e8f2';

  let html = `<div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h3>Real Estate · ${C().name}</h3>
      <div class="small" style="color:${trendColor}">${trendIcon} Market: ${S.marketTrend.state.toUpperCase()}</div>
    </div>
    <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
      ${availableTabs.map(t => `<button class="pill ${S.realEstateTab === t.id ? 'on' : ''}" style="padding:6px 10px;font-size:.75rem" onclick="S.realEstateTab='${t.id}';render()">${t.label}</button>`).join('')}
    </div>
  </div>`;

  if (currentTab) html += currentTab.render();
  return html;
}

/* ---------- Market sections ---------- */
function compoundsSection() {
  const list = COMPOUNDS[S.country];
  if (!list || !list.length) return `<div class="card"><h3>No compounds yet</h3></div>`;
  
  return list.map(c => {
    // Apply market trend to prices
    const curPpmLow = Math.round(c.ppmLow * S.marketTrend.multiplier);
    const curPpmHigh = Math.round(c.ppmHigh * S.marketTrend.multiplier);
    const cheapest = PROPERTY_UNITS.reduce((min, u) => Math.min(min, Math.round(u.area * curPpmLow * u.priceMult)), Infinity);
    
    return `<div class="card">
      <h3>${c.name}</h3>
      <p class="muted small">${c.loc} · ${c.developer} · ${c.delivery === 'ready' ? 'Ready' : 'Delivery ' + c.delivery}</p>
      <p class="small" style="margin:6px 0">${c.tag}</p>
      <div class="row"><span>Current Price / m²</span><b class="mono">${curPpmLow.toLocaleString()}–${curPpmHigh.toLocaleString()} ${C().currency}</b></div>
      <div class="row"><span>Entry price</span><b class="mono">${cheapest.toLocaleString()} ${C().currency}</b></div>
      <div class="row"><span>Est. ROI</span><b class="good">${((c.rentalYieldAnnPct || 0.07)*100).toFixed(1)}% Annually</b></div>
      <div class="row"><span>Amenities</span><b class="small" style="text-align:right">${c.amenities.join(', ')}</b></div>
      <button class="opt" style="margin-top:8px" onclick="S.pendingBuy={kind:'compound',sourceId:'${c.id}'};render()">Browse units & plans</button>
    </div>`;
  }).join('');
}

function localSection() {
  const list = LOCAL_MARKET[S.country];
  if (!list || !list.length) return `<div class="card"><h3>No local properties yet</h3></div>`;
  
  return list.map(c => {
    const curPpm = Math.round(c.ppm * S.marketTrend.multiplier);
    const cheapest = PROPERTY_UNITS.reduce((min, u) => Math.min(min, Math.round(u.area * curPpm * u.priceMult)), Infinity);
    return `<div class="card">
      <h3>${c.name}</h3>
      <p class="muted small">${c.loc}, ${c.city} · <b class="bad">CASH ONLY</b></p>
      <p class="small" style="margin:6px 0">${c.tag}</p>
      <div class="row"><span>Price / m²</span><b class="mono">${curPpm.toLocaleString()} ${C().currency}</b></div>
      <div class="row"><span>Entry price</span><b class="mono">${cheapest.toLocaleString()} ${C().currency}</b></div>
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
  const list = ctx.kind === 'compound' ? (COMPOUNDS[S.country] || []) : (LOCAL_MARKET[S.country] || []);
  const prop = list.find(c => c.id === ctx.sourceId);
  if (!prop) { S.pendingBuy = null; return ''; }

  const plans = ctx.kind === 'compound' ? PAYMENT_PLANS : [PAYMENT_PLANS.find(p => p.id === 'cash')];
  // Calculate player's debt-to-income limit (can't spend more than 40% of salary on installments)
  const maxMonthlyInstallment = S.job ? Math.round((S.job.salary / 12) * 0.40) : 0;
  const currentPpm = ctx.kind === 'compound' ? Math.round(prop.ppm * S.marketTrend.multiplier) : Math.round(prop.ppm * S.marketTrend.multiplier);

  let html = `<div class="card" style="border-color:#8b5cf6">
    <h3>${prop.name} - Purchase Hub</h3>
    <p class="muted small">Banks require your monthly installment to be under 40% of your income. Your limit: <b class="good">${maxMonthlyInstallment.toLocaleString()}/mo</b>.</p>
    <p class="muted small">Closing costs (Broker, Registry, Maintenance Dep.) apply upon purchase.</p>
    <button class="pill" style="padding:4px 8px;font-size:.75rem;margin-top:6px" onclick="S.pendingBuy=null;render()">✕ Cancel</button>
  </div>`;

  PROPERTY_UNITS.forEach(u => {
    const basePrice = Math.round(u.area * currentPpm * u.priceMult);
    html += `<div class="card" style="padding:10px">
      <b>${u.name}</b> <span class="muted small">· ${u.area} m²</span>
      <div class="row"><span>Base price</span><b class="mono">${basePrice.toLocaleString()} ${C().currency}</b></div>
      <div style="display:flex;flex-direction:column;gap:4px;margin-top:4px">
        ${plans.map(p => {
          const finalPrice = Math.round(basePrice * p.totalMarkup);
          const down = Math.round(finalPrice * p.downPct);
          const maintDep = Math.round(basePrice * 0.08); // 8% maintenance
          const brokerFee = Math.round(finalPrice * (ctx.kind === 'local' ? 0.025 : 0.015)); 
          const totalCashNeeded = down + maintDep + brokerFee;
          
          const moPay = p.years > 0 ? Math.round((finalPrice - down) / (p.years * 12)) : 0;
          const hasCash = S.wealth >= totalCashNeeded;
          const bankApproves = p.years === 0 || moPay <= maxMonthlyInstallment;
          
          let btnState = ''; let failReason = '';
          if (!hasCash) { btnState = 'disabled;opacity:.5'; failReason = `Need ${money(totalCashNeeded)}`; }
          else if (!bankApproves) { btnState = 'disabled;opacity:.5'; failReason = `Bank Denied (Income too low)`; }

          return `<button class="pill" style="padding:6px 8px;font-size:.72rem;text-align:left;${btnState}" onclick="buyProperty('${ctx.kind}','${prop.id}','${u.id}','${p.id}', ${totalCashNeeded},${maintDep})">
            ${p.label} <br>
            <span class="muted small">Cash to close: ${totalCashNeeded.toLocaleString()} (Down:${down} + Fees/Dep: ${maintDep+brokerFee})</span>${p.years > 0 ? `<br><span class="${bankApproves?'good':'bad'}">Monthly: ${moPay.toLocaleString()} ${C().currency}</span>` : ''}
            ${failReason ? `<br><b class="bad">${failReason}</b>` : ''}
          </button>`;
        }).join('')}
      </div>
    </div>`;
  });
  return html;
}

window.buyProperty = function(kind, sourceId, unitId, planId, totalCashNeeded, maintDep) {
  ensureRealEstateState();
  const list = kind === 'compound' ? (COMPOUNDS[S.country] || []) : (LOCAL_MARKET[S.country] || []);
  const prop = list.find(c => c.id === sourceId);
  const unit = PROPERTY_UNITS.find(u => u.id === unitId);
  const plan = PAYMENT_PLANS.find(p => p.id === planId) || PAYMENT_PLANS[0];
  
  if (S.wealth < totalCashNeeded) return;
  S.wealth -= totalCashNeeded;
  
  const currentPpm = kind === 'compound' ? Math.round(prop.ppm * S.marketTrend.multiplier) : Math.round(prop.ppm * S.marketTrend.multiplier);
  const basePrice = Math.round(unit.area * currentPpm * unit.priceMult);
  const finalPrice = Math.round(basePrice * plan.totalMarkup);
  const down = Math.round(finalPrice * plan.downPct);

  const home = createHome({
    name: `${unit.name} · ${prop.name}`,
    city: prop.city || 'Unknown', location: prop.loc || prop.city,
    baseValue: basePrice, value: basePrice, // Installment markup is debt, not property value
    monthlyRent: Math.round(basePrice * (prop.rentalYieldAnnPct || 0.07) / 12),
    hoaFee: Math.round(basePrice * 0.005), // Annual HOA estimate
    hap: prop.hap || 0, hp: prop.hp || 0, area: unit.area,
    unitId: unit.id, source: kind, compoundId: kind === 'compound' ? prop.id : null,
  });
  
  S.ownedHomes.push(home);
  if (plan.years > 0) {
    S.realestateContracts.push({
      homeId: home.id, name: home.name,
      remaining: finalPrice - down, yearsTotal: plan.years, yearsLeft: plan.years,
      annualPayment: Math.round((finalPrice - down) / plan.years),
    });
  }
  
  log(`Signed contract for ${home.name}. Paid ${money(totalCashNeeded)} in closing costs.`);
  S.pendingBuy = null;
  S.realEstateTab = 'mine';
  render();
}

/* ---------- Land & Deep Construction Flow ---------- */
function landsSection() {
  const list = LANDS.filter(l => l.country === S.country);
  if (!list.length) return `<div class="card"><h3>No land available</h3></div>`;
  
  let html = list.map(l => {
    const curPpm = Math.round(l.ppm * S.marketTrend.multiplier);
    const minPrice = l.minSize * curPpm;
    return `<div class="card">
      <h3>${l.name}</h3>
      <p class="muted small">${l.city} · Zoning: ${l.zoning.toUpperCase()}</p>
      <div class="row"><span>Price / m²</span><b class="mono">${curPpm.toLocaleString()} ${C().currency}</b></div>
      <div class="row"><span>Cost range</span><b class="mono">${minPrice.toLocaleString()} - ${(l.maxSize*curPpm).toLocaleString()}</b></div>
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
  
  const marketRate = Math.round(h.value * (h.rentalYieldAnnPct || 0.06) / 12);
  const ask = prompt(`Set monthly asking rent:\n(Market rate is approx ${money(marketRate)}/mo)`, marketRate);
  const parsedAsk = parseInt(ask, 10);
  
  if (!parsedAsk || parsedAsk <= 0) return;
  if (h.status === 'occupied') S.housing = 'parents';
  h.status = 'listed';
  h.listedRent = parsedAsk;
  h.monthsVacant = 0;
  log(`${h.name} listed for rent at ${money(parsedAsk)}/mo. Looking for tenants...`);
  render();
}

window.evictTenant = function(homeId) {
  const h = S.ownedHomes.find(x => x.id === homeId);
  if (!h || !h.tenant) return;
  
  const legalFees = Math.round(h.monthlyRent * 2);
  if (!confirm(`Eviction requires lawyers and courts. Cost: ${money(legalFees)}. Proceed?`)) return;
  
  if (S.wealth >= legalFees) S.wealth -= legalFees;
  h.status = 'vacant';
  h.tenant = null;
  log(`Evicted tenant from ${h.name}. Paid ${money(legalFees)} in legal fees.`);
  render();
}

function mineSection() {
  if (!S.ownedHomes.length) return `<div class="card"><h3>No properties owned</h3></div>`;
  
  return `<div class="card">
    <h3>Your Real Estate Portfolio</h3>
    ${S.ownedHomes.map(h => {
      const contract = S.realestateContracts.find(c => c.homeId === h.id);
      let statusHtml = '';
      if (h.status === 'occupied') statusHtml = '🏠 <b>You live here</b>';
      else if (h.status === 'listed') statusHtml = `⏳ <b>Listed: ${money(h.listedRent)}/mo</b> (Vacant${h.monthsVacant}mo)`;
      else if (h.status === 'rented' && h.tenant) {
        statusHtml = `✅ <b>Rented: ${money(h.monthlyRent)}/mo</b><br>
        <span class="small muted">Tenant: ${h.tenant.name} (${h.tenant.reliability} credit score)</span>`;
      } else statusHtml = '<b>Vacant</b>';
      
      const netEquity = h.value - (contract ? contract.remaining : 0);
      
      return `<div style="padding:15px 0;border-bottom:1px solid #1a1a2a">
        <b>${h.name}</b> <span class="muted small">${h.area}m²</span>
        <div class="row"><span>Market Value</span><b class="mono">${h.value.toLocaleString()}</b></div>${contract ? `<div class="row"><span>Bank Loan</span><b class="mono bad">-${contract.remaining.toLocaleString()} (${contract.yearsLeft}y)</b></div>` : ''}
        <div class="row"><span>Net Equity</span><b class="mono good">${netEquity.toLocaleString()}</b></div>
        <div class="row" style="align-items:flex-start"><span>Status</span><div style="text-align:right">${statusHtml}</div></div>
        
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">
          ${h.status !== 'occupied' && h.status !== 'rented' ? `<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="moveIntoHome('${h.id}')">Move in</button>` : ''}
          ${h.status === 'vacant' ? `<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="setHomeForRent('${h.id}')">List for Rent</button>` : ''}
          ${h.status === 'listed' ? `<button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="stopRenting('${h.id}')">Unlist</button>` : ''}
          ${h.status === 'rented' ? `<button class="pill" style="padding:4px 8px;font-size:.72rem;color:#fb7185;border-color:#fb7185" onclick="evictTenant('${h.id}')">Evict Tenant</button>` : ''}
          <button class="pill" style="padding:4px 8px;font-size:.72rem" onclick="sellHome('${h.id}')">Sell Property</button>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

/* ---------- Selling with Agent Fees ---------- */
window.sellHome = function(homeId) {
  ensureRealEstateState();
  const idx = S.ownedHomes.findIndex(x => x.id === homeId);
  const h = S.ownedHomes[idx];
  const contract = S.realestateContracts.find(c => c.homeId === homeId);
  
  const brokerFee = Math.round(h.value * 0.025); // 2.5% to agent
  const netProceeds = h.value - brokerFee - (contract ? contract.remaining : 0);
  
  if (!confirm(`Sell ${h.name} for ${money(h.value)}?\n- Broker Fee: ${money(brokerFee)}\n${contract ? `- Loan Payoff: ${money(contract.remaining)}\n` : ''}= Net to you: ${money(netProceeds)}\nProceed?`)) return;
  
  if (netProceeds < 0) { log('Cannot sell: Under water on mortgage.'); return; }
  
  S.wealth += netProceeds;
  if (contract) S.realestateContracts = S.realestateContracts.filter(c => c.homeId !== homeId);
  log(`Sold ${h.name}. Walked away with ${money(netProceeds)} cash.`);
  S.ownedHomes.splice(idx, 1);
  if (S.housing === 'owned' && h.status === 'occupied') S.housing = 'parents';
  render();
}
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
    h.value = Math.round(h.baseValue * S.marketTrend.multiplier);
    h.condition = Math.max(10, h.condition - Math.floor(Math.random() * 4) - 1); // Degradation

    // Mandatory HOA / Maintenance
    const hoa = Math.round(h.value * 0.005);
    if (hoa > 0 && S.wealth >= hoa) { S.wealth -= hoa; }
    else if (hoa > 0) { log(`Failed to pay HOA for ${h.name}. Condition worsened.`); h.condition -= 5; }

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
        // Bad event: Damage or missed rent
        const dmg = Math.round(h.monthlyRent * 3);
        log(`URGENT: ${h.tenant.name} damaged ${h.name}. Repairs cost ${money(dmg)}.`);
        S.wealth -= dmg;
        h.condition -= 10;
        if (Math.random() < 0.3) { h.status = 'vacant'; h.tenant = null; log(`Tenant fled ${h.name}.`); }
      } else {
        // Good event: Pays rent
        const annRent = h.monthlyRent * 12;
        S.wealth += annRent;
      }
    }
  });

  // 3. Process Mortgages / Contracts
  S.realestateContracts.forEach(c => {
    if (c.yearsLeft <= 0) return;
    const payment = Math.min(c.remaining, c.annualPayment);
    if (S.wealth < payment) {
      c.remaining = Math.round(c.remaining * 1.05); // Penalty
      log(`Missed bank installment on ${c.name}. Debt grew to ${money(c.remaining)}.`);
    } else {
      S.wealth -= payment;
      c.remaining -= payment;
      c.yearsLeft--;
    }
  });
  S.realestateContracts = S.realestateContracts.filter(c => c.yearsLeft > 0 && c.remaining > 0);

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
registerRealEstateTab({ id: 'mine', label: 'Portfolio', order: 3, requiresHome: false, render: mineSection });

GameHooks.registerTab({ id: 'realestate', label: '🏠 Real Estate', order: 5, view: realEstateView });
