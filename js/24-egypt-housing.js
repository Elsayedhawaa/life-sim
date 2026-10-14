/* =====================================================================
   24. GLOBAL & EGYPT REAL ESTATE ENGINE — Structured Market & Management
   Connects ONLY through GameHooks (see 90-hooks.js).
   ===================================================================== */

/* ---------- 1. DATA CATALOGS ---------- */
const COMPOUND_ROSTER = {
  egy: [
    { id: 'madinaty', dev: 'TMG', name: 'Madinaty', loc: 'New Cairo', ppm: 65000, hap: 3, hp: 1, tag: 'Fully serviced mega-city' },
    { id: 'villette', dev: 'SODIC', name: 'Villette', loc: 'New Cairo', ppm: 105000, hap: 4, hp: 2, tag: 'Ultra-luxury green compound' },
    { id: 'palmhills', dev: 'Palm Hills', name: 'Palm Hills New Cairo', loc: 'New Cairo', ppm: 95000, hap: 3, hp: 2, tag: 'Signature golf & residential community' },
    { id: 'mivida', dev: 'Emaar Misr', name: 'Mivida', loc: 'New Cairo', ppm: 115000, hap: 4, hp: 2, tag: 'California-style eco community' },
    { id: 'marassi', dev: 'Emaar Misr', name: 'Marassi', loc: 'North Coast', ppm: 150000, hap: 5, hp: 3, tag: 'Mediterranean coastal luxury resort' },
    { id: 'sawary', dev: 'SED', name: 'Sawary', loc: 'Alexandria (Lake Mariout)', ppm: 60000, hap: 3, hp: 2, tag: 'Modern waterfront gated district' },
    { id: 'alexwest', dev: 'Baron', name: 'Alex West', loc: 'Alexandria', ppm: 55000, hap: 2, hp: 2, tag: 'Gated community near King Mariout' },
    { id: 'gouna', dev: 'Orascom', name: 'El Gouna Enclave', loc: 'Red Sea', ppm: 140000, hap: 5, hp: 2, tag: 'Red Sea private lagoon living' }
  ],
  deu: [
    { id: 'bavaria_park', dev: 'Instone Real Estate', name: 'Bavaria Park Quartier', loc: 'Munich', ppm: 11500, hap: 3, hp: 2, tag: 'Sustainable gated park living' },
    { id: 'heidestrasse', dev: 'Vonovia', name: 'Heidestrasse Terrassen', loc: 'Berlin', ppm: 8500, hap: 2, hp: 1, tag: 'Modern city center residences' },
    { id: 'frankfurt_sky', dev: 'CG Elementum', name: 'Frankfurt Central Heights', loc: 'Frankfurt', ppm: 9800, hap: 3, hp: 2, tag: 'Financial district luxury tower' }
  ],
  usa: [
    { id: 'austin_estates', dev: 'Toll Brothers', name: 'The Estates at Westwood', loc: 'Austin, Texas', ppm: 4200, hap: 3, hp: 2, tag: 'Suburban gated golf community' },
    { id: 'sunnyvale_ridge', dev: 'Lennar Homes', name: 'Innovation Ridge', loc: 'California', ppm: 9500, hap: 4, hp: 2, tag: 'Silicon Valley smart residences' },
    { id: 'brickell_towers', dev: 'Related Group', name: 'Brickell Financial Towers', loc: 'Miami, Florida', ppm: 7800, hap: 4, hp: 3, tag: 'Waterfront high-rise luxury' }
  ],
  gbr: [
    { id: 'nine_elms', dev: 'Berkeley Group', name: 'Nine Elms Park', loc: 'London', ppm: 11000, hap: 4, hp: 2, tag: 'Prime Thames-side park compound' },
    { id: 'deansgate', dev: 'Barratt Developments', name: 'Deansgate Square', loc: 'Manchester', ppm: 5400, hap: 3, hp: 1, tag: 'High-rise modern urban living' }
  ],
  uae: [
    { id: 'downtown_heights', dev: 'Emaar Properties', name: 'Downtown Heights', loc: 'Dubai', ppm: 6800, hap: 5, hp: 3, tag: 'Iconic Boulevard tower' },
    { id: 'damac_lagoons', dev: 'DAMAC', name: 'Damac Lagoons', loc: 'Dubai', ppm: 5200, hap: 4, hp: 3, tag: 'Mediterranean villa community' }
  ]
};

const LOCAL_MARKET_ROSTER = {
  egy: [
    { id: 'smouha_local', name: 'Smouha Private Apartment', loc: 'Alexandria (Smouha)', ppm: 38000, hap: 1, hp: 0, tag: 'Central Alex, vibrant street life' },
    { id: 'loran_local', name: 'Loran High-Floor Flat', loc: 'Alexandria (Loran)', ppm: 42000, hap: 1, hp: 0, tag: 'Close to Tram & Corniche' },
    { id: 'gleem_local', name: 'Gleem Sea-View Unit', loc: 'Alexandria (Gleem)', ppm: 48000, hap: 2, hp: 1, tag: 'Direct sea view flat' },
    { id: 'nasrcity_local', name: 'Nasr City Apartment', loc: 'Cairo (Nasr City)', ppm: 32000, hap: 1, hp: 0, tag: 'Established Cairo neighborhood' },
    { id: 'maadi_local', name: 'Degla Maadi Low-Rise', loc: 'Cairo (Maadi)', ppm: 45000, hap: 2, hp: 1, tag: 'Quiet, green street flat' }
  ],
  deu: [
    { id: 'berlin_altbau', name: 'Classic Altbau Flat', loc: 'Berlin (Neukölln)', ppm: 5800, hap: 1, hp: 0, tag: 'Traditional high-ceiling apartment' }
  ],
  usa: [
    { id: 'suburban_house', name: 'Suburban Single-Family Home', loc: 'Houston, Texas', ppm: 2800, hap: 2, hp: 1, tag: 'Traditional local residential neighborhood' }
  ]
};

const PROPERTY_UNITS = [
  { id: 'studio', name: 'Studio', area: 60, mult: 1.08 },
  { id: 'br1', name: '1-Bedroom Apartment', area: 85, mult: 1.04 },
  { id: 'br2', name: '2-Bedroom Apartment', area: 130, mult: 1.00 },
  { id: 'br3', name: '3-Bedroom Apartment', area: 175, mult: 0.98 },
  { id: 'townhouse', name: 'Townhouse', area: 250, mult: 1.15 },
  { id: 'villa', name: 'Standalone Villa', area: 450, mult: 1.30 }
];

const COMPOUND_PLANS = [
  { id: 'cash', label: 'Cash Purchase', downPct: 1.0, years: 0, markup: 0.85, note: '15% Cash Discount' },
  { id: 'p5', label: '5-Year Installments (0% Interest)', downPct: 0.10, years: 5, markup: 1.00, note: 'Standard Developer Plan' },
  { id: 'p8', label: '8-Year Extended Installments', downPct: 0.05, years: 8, markup: 1.25, note: 'Lower annual burden' },
  { id: 'p10', label: '10-Year Long Term Plan', downPct: 0.05, years: 10, markup: 1.45, note: 'Lowest yearly payment' }
];

/* ---------- 2. HELPERS & STATE INIT ---------- */
function housingOn() { return !!(S && S.age >= 18); }

function housingInit(o) {
  if (!o) return;
  if (!o.housingStore || typeof o.housingStore !== 'object') {
    o.housingStore = { selectedTab: 'compounds', selectedLoc: 'all', contracts: [] };
  }
}

function egyRate(year) { return Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry('egy', year || gameYear()) : 1); }
function localRate(year) { return Math.max(0.0001, typeof rateForCountry === 'function' ? rateForCountry(S.country, year || gameYear()) : 1); }
function egpToLocal(egp, year) { return (Number(egp) || 0) / egyRate(year) * localRate(year); }
function egpFmt(n) { return 'E£' + Math.round(Number(n) || 0).toLocaleString(); }

function displayCurrency(amountEGP, isEgypt) {
  const y = gameYear();
  if (isEgypt && S.country === 'egy') return egpFmt(amountEGP);
  if (isEgypt && S.country !== 'egy') {
    const localVal = Math.round(egpToLocal(amountEGP, y));
    return `${typeof money === 'function' ? money(localVal) : localVal} (${egpFmt(amountEGP)})`;
  }
  return typeof money === 'function' ? money(amountEGP) : '$' + Math.round(amountEGP).toLocaleString();
}

/* ---------- 3. PURCHASE & PAYMENT LOGIC ---------- */
function purchaseProperty(rosterId, unitId, planId, isCompound, isEgypt) {
  housingInit(S);
  const y = gameYear();
  const catalog = isCompound 
    ? (COMPOUND_ROSTER[isEgypt ? 'egy' : S.country] || COMPOUND_ROSTER.egy)
    : (LOCAL_MARKET_ROSTER[isEgypt ? 'egy' : S.country] || LOCAL_MARKET_ROSTER.egy);

  const prop = catalog.find(p => p.id === rosterId);
  const unit = PROPERTY_UNITS.find(u => u.id === unitId);
  const plan = isCompound ? COMPOUND_PLANS.find(p => p.id === planId) : { downPct: 1.0, years: 0, markup: 1.0 };

  if (!prop || !unit) return hint('Selected property or unit is no longer available.');

  // Calculate Base Price (properly restoring the * 1000 multiplier to prevent micro-pricing)
  const idx = (isEgypt && typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(y) : 1;
  const rawPrice = unit.area * prop.ppm * unit.mult * idx;
  const basePrice = Math.round(rawPrice / 1000) * 1000;
  const finalPrice = Math.round(basePrice * plan.markup);
  const downPaymentEGP = Math.round(finalPrice * plan.downPct);

  // Convert required values to player's wallet currency
  const localFinalPrice = (isEgypt && S.country !== 'egy') ? Math.round(egpToLocal(finalPrice, y)) : finalPrice;
  const localDown = (isEgypt && S.country !== 'egy') ? Math.round(egpToLocal(downPaymentEGP, y)) : downPaymentEGP;

  // STRICT CASH CHECK
  if (S.wealth < localDown) {
    alert(`INSUFFICIENT FUNDS!\n\nRequired Down Payment: ${displayCurrency(downPaymentEGP, isEgypt)}\nYour Checking Balance: ${typeof money === 'function' ? money(S.wealth) : S.wealth}\n\nYou need ${displayCurrency((isEgypt && S.country !== 'egy' ? downPaymentEGP : localDown) - (isEgypt && S.country !== 'egy' ? (S.wealth / localRate(y) * egyRate(y)) : S.wealth), isEgypt)} more to complete this transaction.`);
    return hint(`Insufficient cash balance for down payment.`);
  }

  S.wealth -= localDown;
  const homeId = 'h_' + Math.random().toString(36).slice(2, 8);

  // Generate internal game currency value so the inventory renders the local equivalent properly
  const internalValue = isEgypt ? finalPrice / egyRate(y) : finalPrice / localRate(y);
  const internalRemaining = isEgypt ? (finalPrice - downPaymentEGP) / egyRate(y) : (finalPrice - downPaymentEGP) / localRate(y);

  const newHome = {
    id: homeId,
    name: `${unit.name} - ${prop.name}`,
    catId: 'custom_' + prop.id,
    value: Math.round(internalValue), 
    balance: isCompound && plan.years > 0 ? Math.round(internalRemaining) : 0,
    cond: 100,
    rentInc: Math.round(internalValue * (isCompound ? 0.0045 : 0.0035) * 12),
    status: 'vacant',
    pay: 1,
    rate: 0.0001,
    features: isCompound ? ['24/7 Gated Security', 'Clubhouse & Pool', 'Private Parking', 'Landscaped Gardens'] : ['Local Neighborhood Access', 'Private Meter'],
    location: prop.loc,
    marketCountry: isEgypt ? 'egy' : S.country,
    typeId: unit.id,
    p12: true,
    hapBuff: prop.hap,
    hpBuff: prop.hp
  };

  S.ownedHomes = S.ownedHomes || [];
  S.ownedHomes.push(newHome);

  if (isCompound && plan.years > 0) {
    const annualInstallmentEGP = Math.round((finalPrice - downPaymentEGP) / plan.years);
    S.housingStore.contracts.push({
      id: 'c_' + homeId,
      homeId: homeId,
      name: newHome.name,
      totalEGP: finalPrice,
      remainingEGP: finalPrice - downPaymentEGP,
      annualEGP: annualInstallmentEGP,
      yearsLeft: plan.years,
      isEgypt: isEgypt
    });
  }

  log(`Successfully purchased ${newHome.name} in ${prop.loc}! Paid ${displayCurrency(downPaymentEGP, isEgypt)} down.`);
  if (typeof realismNotice === 'function') {
    realismNotice('Property Purchased', `You acquired ${newHome.name}. The market valuation has been permanently corrected to its true multi-million figure.`);
  }
  render();
}

/* ---------- 4. YEARLY CONTRACT PROCESSOR ---------- */
function housingYear() {
  if (!S || S.dead || S.age < 18) return;
  housingInit(S);
  const y = gameYear();

  S.housingStore.contracts.forEach(c => {
    if (c.remainingEGP <= 0) return;

    const dueEGP = Math.min(c.annualEGP, c.remainingEGP);
    const duePlayer = (c.isEgypt && S.country !== 'egy') ? Math.round(egpToLocal(dueEGP, y)) : dueEGP;

    if (S.wealth >= duePlayer) {
      S.wealth -= duePlayer;
      S.expenses = (S.expenses || 0) + duePlayer;
      c.remainingEGP -= dueEGP;
      c.yearsLeft--;

      const home = S.ownedHomes.find(h => h.id === c.homeId);
      if (home) {
        home.balance = Math.max(0, Math.round(c.isEgypt ? c.remainingEGP / egyRate(y) : c.remainingEGP / localRate(y)));
      }
      log(`Installment Paid: ${displayCurrency(dueEGP, c.isEgypt)} for ${c.name}. Remaining: ${displayCurrency(c.remainingEGP, c.isEgypt)}.`);
    } else {
      log(`MISSED INSTALLMENT on ${c.name}! Late fees applied.`);
      c.remainingEGP = Math.round(c.remainingEGP * 1.05);
      if (typeof fx === 'function') fx({ happiness: -5 });
    }
  });
}

/* ---------- 5. INSTANT RENT OVERRIDE ---------- */
const P24_setRentProperty = typeof setRentProperty === 'function' ? setRentProperty : function(){};
setRentProperty = function(idx) {
    const h = S.ownedHomes[idx];
    if (h && h.p12 && h.status !== 'rent' && h.status !== 'p12-rented') {
        const pct = prompt(`Enter annual rent increase percentage (e.g. 10 for 10%):`, "10");
        if (pct !== null) {
            P24_setRentProperty(idx);
            
            const country = h.marketCountry || S.country;
            const rate = Math.max(.0001, typeof rateForCountry==='function' ? rateForCountry(country, gameYear()) : 1);
            const yieldRate = Math.max(.001, Number(h.marketRentRate || .0045));
            
            // Fixed to convert internal base value into properly scaled local currency
            const localMonthly = Math.max(1, Math.round((Number(h.value)||1000) * yieldRate * rate));
            
            h.rentLocalAmount = localMonthly;
            h.rentAmount = localMonthly / rate;
            h.rentInc = h.rentAmount * 12;
            h.rentStepPct = Number(pct) || 0;
            h.rentContractYears = 0;
            h.p23AutoMarketRent = false;
            h.tenant = true;
            h.status = 'p12-rented';
            h.tenantStartYear = gameYear();
            
            log(`You immediately rented out ${h.name} for ${localMonthly.toLocaleString()} per month with a ${h.rentStepPct}% annual increase.`);
            if (typeof render === 'function') render();
            return;
        }
    }
    P24_setRentProperty(idx);
};

/* ---------- 6. UI PANEL RENDER ENGINE ---------- */
function renderHousingUI() {
  const view = $('view'); if (!view || typeof activeTab === 'undefined' || activeTab !== 'assets' || !housingOn()) return;
  const old = $('housing-custom-panel'); if (old) old.remove();

  housingInit(S);
  const sec = document.createElement('section'); sec.className = 'card'; sec.id = 'housing-custom-panel';

  const isExpat = S.country !== 'egy';
  const currentTab = S.housingStore.selectedTab || 'compounds';

  let html = `
    <h3>Primary Real Estate Market</h3>
    
    <div style="background:var(--line); padding:12px; border-radius:8px; margin-bottom:14px; font-size:0.85rem;">
      <b>Market Comparison & Guide:</b>
      <div style="display:flex; gap:12px; margin-top:6px;">
        <div style="flex:1;">
          <b style="color:var(--cyan)">Gated Compounds</b>
          <ul style="margin:4px 0; padding-left:16px;" class="muted">
            <li>24/7 Security & High Privacy</li>
            <li>Landscaped gardens, club, pool</li>
            <li>Happiness (+2 to +5) & Health buffs</li>
            <li>Flexible 5–10 yr installment plans</li>
          </ul>
        </div>
        <div style="flex:1;">
          <b style="color:var(--mint)">Local Standalone Area</b>
          <ul style="margin:4px 0; padding-left:16px;" class="muted">
            <li>30% - 50% cheaper per m²</li>
            <li>Immediate move-in (No delivery delays)</li>
            <li>Zero monthly compound fees</li>
            <li>Full cash upfront required</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="sub-tabs" style="margin-bottom:12px;">
      <button class="sub-tab ${currentTab === 'compounds' ? 'on' : ''}" onclick="S.housingStore.selectedTab='compounds'; render();">Gated Compounds</button>
      <button class="sub-tab ${currentTab === 'local' ? 'on' : ''}" onclick="S.housingStore.selectedTab='local'; render();">Local Standalone Areas</button>
      ${isExpat ? `<button class="sub-tab ${currentTab === 'egy_diaspora' ? 'on' : ''}" onclick="S.housingStore.selectedTab='egy_diaspora'; render();">Egypt Diaspora Investments</button>` : ''}
    </div>
  `;

  let isEgyptData = (currentTab === 'egy_diaspora') || (S.country === 'egy');
  let activeCatalog = [];

  if (currentTab === 'compounds' || currentTab === 'egy_diaspora') {
    activeCatalog = COMPOUND_ROSTER[isEgyptData ? 'egy' : S.country] || COMPOUND_ROSTER.egy;
  } else {
    activeCatalog = LOCAL_MARKET_ROSTER[isEgyptData ? 'egy' : S.country] || LOCAL_MARKET_ROSTER.egy;
  }

  html += `<div style="display:flex; flex-direction:column; gap:12px;">`;

  activeCatalog.forEach(prop => {
    html += `
      <div style="border:1px solid var(--line); border-radius:8px; padding:12px; background:var(--bg);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="font-size:1.05rem;">${prop.name} ${prop.dev ? 'by ' + prop.dev : ''}</b>
          <span style="font-size:0.8rem; background:var(--line); padding:2px 8px; border-radius:4px;">${prop.loc}</span>
        </div>
        <p class="muted" style="font-size:0.85rem; margin:4px 0 8px;"><i>"${prop.tag}"</i> · Happiness +${prop.hap}, Health +${prop.hp}</p>

        <details>
          <summary style="cursor:pointer; color:var(--cyan); font-weight:bold;">Select Unit Type & Payment Terms</summary>
          <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--line);">
            ${PROPERTY_UNITS.map(unit => {
              
              // Base price fix directly applied to the UI component to restore proper scaling
              const idx = (isEgyptData && typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
              const rawPrice = unit.area * prop.ppm * unit.mult * idx;
              const baseEGP = Math.round(rawPrice / 1000) * 1000;
              
              return `
                <div style="border:1px solid var(--line); border-radius:6px; padding:8px; margin-bottom:8px;">
                  <b>${unit.name} (${unit.area} m²)</b><br>
                  <span class="muted" style="font-size:0.85rem">Base Cash Price: ${displayCurrency(Math.round(baseEGP * 0.85), isEgyptData)}</span>
                  
                  <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;">
                    ${(currentTab === 'local' ? [{ id: 'cash', label: 'Cash Full Payment', downPct: 1.0, markup: 1.0 }] : COMPOUND_PLANS).map(plan => {
                      const finalEGP = Math.round(baseEGP * plan.markup);
                      const downEGP = Math.round(finalEGP * plan.downPct);
                      return `
                        <button class="btn" style="font-size:0.75rem; flex:1; min-width:140px; text-align:left;" onclick="purchaseProperty('${prop.id}', '${unit.id}', '${plan.id}', ${currentTab !== 'local'}, ${isEgyptData})">
                          <b>${plan.label}</b><br>
                          Down: ${displayCurrency(downEGP, isEgyptData)}
                        </button>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </details>
      </div>
    `;
  });

  html += `</div>`;
  sec.innerHTML = html;
  view.appendChild(sec);
}

/* ---------- 7. HOOK REGISTER ---------- */
GameHooks.on('migrate', housingInit);
GameHooks.on('newGame', housingInit);
GameHooks.on('year', housingYear);
GameHooks.on('render', renderHousingUI);
