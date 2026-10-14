/* =====================================================================
   24. GLOBAL & EGYPT HOUSING — Local & Expat Developer Compounds
   Connects ONLY through GameHooks (see 90-hooks.js).
   ===================================================================== */

/* ---------- 1. INTERNATIONAL DEVELOPER ROSTERS ---------- */
const INTL_DEVELOPER_ROSTERS = {
  deu: [
    { dev: 'Instone Real Estate', name: 'Bavaria Park Quartier', loc: 'Munich', ppm: 11500, hap: 3, hp: 2, tag: 'Modern Sustainable Living in Munich' },
    { dev: 'Vonovia', name: 'Heidestrasse Terrassen', loc: 'Berlin', ppm: 8500, hap: 2, hp: 1, tag: 'Urban Comfort in the Heart of Berlin' },
    { dev: 'CG Elementum', name: 'Frankfurt Central Heights', loc: 'Frankfurt', ppm: 9800, hap: 3, hp: 2, tag: 'Skyline Residences & Financial Hub' },
    { dev: 'BUWOG', name: 'HafenCity Promenade', loc: 'Hamburg', ppm: 10200, hap: 4, hp: 2, tag: 'Waterfront Modern Apartments' }
  ],
  usa: [
    { dev: 'Toll Brothers', name: 'The Estates at Westwood', loc: 'Texas / Austin', ppm: 4200, hap: 3, hp: 2, tag: 'Luxury Suburban Living' },
    { dev: 'Lennar Homes', name: 'Sunnyvale Innovation Ridge', loc: 'California', ppm: 9500, hap: 4, hp: 2, tag: 'Silicon Valley Smart Homes' },
    { dev: 'Related Group', name: 'Brickell Financial Towers', loc: 'Miami / Florida', ppm: 7800, hap: 4, hp: 3, tag: 'Coastal High-Rise Luxury' },
    { dev: 'KB Home', name: 'Cedar Park Residences', loc: 'Seattle / WA', ppm: 6200, hap: 3, hp: 1, tag: 'Eco-Friendly Pacific Living' }
  ],
  gbr: [
    { dev: 'Berkeley Group', name: 'Nine Elms Park', loc: 'London', ppm: 11000, hap: 4, hp: 2, tag: 'Prime Thames-Side Residences' },
    { dev: 'Barratt Developments', name: 'Deansgate Square', loc: 'Manchester', ppm: 5400, hap: 3, hp: 1, tag: 'Modern High-Rise City Center' },
    { dev: 'Ballymore', name: 'Canal Quays', loc: 'Birmingham', ppm: 4200, hap: 2, hp: 1, tag: 'Revitalized Waterfront Living' }
  ],
  uae: [
    { dev: 'Emaar Properties', name: 'Downtown Dubai Heights', loc: 'Dubai', ppm: 6800, hap: 5, hp: 3, tag: 'Iconic Boulevard Residences' },
    { dev: 'DAMAC', name: 'Damac Lagoons', loc: 'Dubai', ppm: 5200, hap: 4, hp: 3, tag: 'Mediterranean-Inspired Waterfront Villas' },
    { dev: 'Nakheel', name: 'Palm Jumeirah Villas', loc: 'Dubai', ppm: 9200, hap: 5, hp: 4, tag: 'World-Famous Luxury Waterfront' },
    { dev: 'Aldar Properties', name: 'Yas Island Enclave', loc: 'Abu Dhabi', ppm: 5800, hap: 4, hp: 2, tag: 'Entertainment & Coastal Hub' }
  ]
};

/* ---------- 2. EGYPT DEVELOPER ROSTERS ---------- */
const EGY_PROJECT_ROSTER = [
  { dev: 'TMG', name: 'Madinaty', loc: 'New Cairo', ppm: 65000, hap: 2, hp: 1, tag: 'City of International Standards' },
  { dev: 'SODIC', name: 'Villette', loc: 'New Cairo', ppm: 105000, hap: 4, hp: 2, tag: 'Signature Luxury Living' },
  { dev: 'Palm Hills', name: 'Palm Hills New Cairo', loc: 'New Cairo', ppm: 95000, hap: 3, hp: 2, tag: 'Harmony of Nature and Architecture' },
  { dev: 'Emaar Misr', name: 'Mivida', loc: 'New Cairo', ppm: 115000, hap: 4, hp: 2, tag: 'Eco-Friendly Luxury' },
  { dev: 'Emaar Misr', name: 'Marassi', loc: 'North Coast', ppm: 150000, hap: 5, hp: 3, tag: 'World-Class Coastal Destination' },
  { dev: 'SED', name: 'Sawary', loc: 'Alexandria', ppm: 60000, hap: 2, hp: 1, tag: 'New Alexandria Waterfront' },
  { dev: 'Baron', name: 'Alex West', loc: 'Alexandria', ppm: 55000, hap: 2, hp: 2, tag: 'Where Alexandria Meets the Future' }
];

const EGY_EXPAT_ROSTER = [
  { dev: 'TMG', name: 'Madinaty (Expat Phase)', loc: 'New Cairo', ppm: 72000, hap: 2, hp: 1, tag: 'Your Home Back Home' },
  { dev: 'SODIC', name: 'Villette Global Residences', loc: 'New Cairo', ppm: 115000, hap: 4, hp: 2, tag: 'Premium Investment for the Diaspora' },
  { dev: 'Emaar Misr', name: 'Marassi International', loc: 'North Coast', ppm: 160000, hap: 5, hp: 3, tag: 'World-Class Summer Destination' },
  { dev: 'Palm Hills', name: 'Palm Hills Global', loc: 'Sheikh Zayed', ppm: 105000, hap: 3, hp: 2, tag: 'Elevated Homecoming' },
  { dev: 'Orascom', name: 'El Gouna Diaspora Enclave', loc: 'Red Sea', ppm: 145000, hap: 5, hp: 2, tag: 'Global Community on the Red Sea' }
];

const DEV_UNITS = [
  {id:'studio', typeId:'condo',     name:'Studio',          area:60,  f:1.08, w:3},
  {id:'br1',    typeId:'condo',     name:'1-Bedroom',       area:85,  f:1.04, w:3},
  {id:'br2',    typeId:'condo',     name:'2-Bedroom',       area:130, f:1.00, w:4},
  {id:'br3',    typeId:'condo',     name:'3-Bedroom',       area:175, f:0.98, w:3},
  {id:'town',   typeId:'townhouse', name:'Townhouse',       area:250, f:1.12, w:2},
  {id:'villa',  typeId:'villa',     name:'Standalone Villa', area:450, f:1.25, w:1}
];

const DEV_PLANS = [
  {id:'cash', label:'Cash',                        down:1,    years:0,  markup:.85, note:'15% Cash Discount applied'},
  {id:'p5',   label:'5 years, 0% interest',        down:.10,  years:5,  markup:1.00, note:'Standard developer plan'},
  {id:'p8',   label:'8 years, equal installments', down:.05,  years:8,  markup:1.25, note:'Extended payment plan'},
  {id:'p10',  label:'10 years, low down payment',  down:.05,  years:10, markup:1.45, note:'Highest total cost, lowest yearly burden'}
];

/* ---------- HELPERS ---------- */
function devOn(){ return !!(S && S.age >= 18); }
function devInit(o){
  if (!o) return;
  if (!o.egyDev || typeof o.egyDev !== 'object') o.egyDev = {projects:[], year:0, contracts:[], seq:0};
  if (!o.intlDev || typeof o.intlDev !== 'object') o.intlDev = {projects:[], year:0, contracts:[], seq:0};
  o.egyDev.projects = Array.isArray(o.egyDev.projects) ? o.egyDev.projects : [];
  o.egyDev.contracts = Array.isArray(o.egyDev.contracts) ? o.egyDev.contracts : [];
  o.intlDev.projects = Array.isArray(o.intlDev.projects) ? o.intlDev.projects : [];
  o.intlDev.contracts = Array.isArray(o.intlDev.contracts) ? o.intlDev.contracts : [];
}

function egyRate(year){ return Math.max(.0001, rateForCountry('egy', year || gameYear())); }
function localRate(year){ return Math.max(.0001, rateForCountry(S.country, year || gameYear())); }
function egpToLocal(egp, year){ return (Number(egp) || 0) / egyRate(year) * localRate(year); }
function egpFmt(n){ return 'E£' + Math.round(Number(n) || 0).toLocaleString(); }

function displayCost(egp, year){
  if (S.country === 'egy') return egpFmt(egp);
  const localCost = Math.round(egpToLocal(egp, year));
  return `${typeof money === 'function' ? money(localCost) : localCost} (${egpFmt(egp)})`;
}

function devPick(list){ return list[Math.floor(Math.random() * list.length)]; }
function devWeighted(list){ const t=list.reduce((a,x)=>a+x.w,0); let r=Math.random()*t; for(const x of list){ r-=x.w; if(r<=0) return x; } return list[0]; }

/* ---------- GENERATION ---------- */
function devGenerateProjects(isEgypt){
  const y = gameYear(), out = [];
  if (isEgypt) {
    const idx = p14EgyptPriceIndex ? p14EgyptPriceIndex(y) : 1000;
    const rosterSource = S.country === 'egy' ? EGY_PROJECT_ROSTER : EGY_EXPAT_ROSTER;
    for (let i = 0; i < 4; i++){ 
      const roster = devPick(rosterSource), unit = devWeighted(DEV_UNITS);
      const size = Math.round(unit.area * (.9 + Math.random() * .2));
      const ready = Math.random() < .30;
      const listEGP = Math.round(size * roster.ppm * unit.f * (.85 + Math.random() * .25) * (ready ? 1.20 : 1) * idx / 1000) * 1000;
      out.push({
        id: 'egyp_' + y + '_' + i + '_' + Math.random().toString(36).slice(2,5),
        developer: roster.dev, compound: roster.name, location: roster.loc, tag: roster.tag,
        hap: roster.hap, hp: roster.hp, unitId: unit.id, unitName: unit.name, typeId: unit.typeId,
        size, ready, listEGP, year: y, isEgypt: true
      });
    }
  } else {
    const rosterSource = INTL_DEVELOPER_ROSTERS[S.country] || [
      { dev: 'Global Zenith Properties', name: 'Metropolitan Residences', loc: 'City Center', ppm: 7000, hap: 3, hp: 2, tag: 'Modern Living' }
    ];
    for (let i = 0; i < 3; i++){
      const roster = devPick(rosterSource), unit = devWeighted(DEV_UNITS);
      const size = Math.round(unit.area * (.9 + Math.random() * .2));
      const ready = Math.random() < .35;
      const listLocal = Math.round(size * roster.ppm * unit.f * (.9 + Math.random() * .2));
      out.push({
        id: 'intlp_' + y + '_' + i + '_' + Math.random().toString(36).slice(2,5),
        developer: roster.dev, compound: roster.name, location: roster.loc, tag: roster.tag,
        hap: roster.hap, hp: roster.hp, unitId: unit.id, unitName: unit.name, typeId: unit.typeId,
        size, ready, listLocal, year: y, isEgypt: false
      });
    }
  }
  return out;
}

function devMarket(isEgypt){
  devInit(S);
  const targetObj = isEgypt ? S.egyDev : S.intlDev;
  if (targetObj.year !== gameYear() || !targetObj.projects.length){
    targetObj.projects = devGenerateProjects(isEgypt);
    targetObj.year = gameYear();
  }
  return targetObj.projects;
}

/* ---------- BUYING LOGIC ---------- */
function devBuy(projectId, planId, isEgypt){
  devInit(S);
  const market = devMarket(isEgypt);
  const proj = market.find(p => p.id === projectId), plan = DEV_PLANS.find(p => p.id === planId);
  if (!proj || !plan) return hint('This offer has expired.');

  const y = gameYear();
  let price, down, annual, downPlayer;

  if (isEgypt) {
    price = Math.round(proj.listEGP * plan.markup);
    down = plan.years === 0 ? price : Math.round(price * plan.down);
    annual = plan.years > 0 ? Math.round((price - down) / plan.years) : 0;
    downPlayer = Math.round(egpToLocal(down, y));
  } else {
    price = Math.round(proj.listLocal * plan.markup);
    down = plan.years === 0 ? price : Math.round(price * plan.down);
    annual = plan.years > 0 ? Math.round((price - down) / plan.years) : 0;
    downPlayer = down;
  }

  if (S.wealth < downPlayer) return hint(`You need ${isEgypt ? displayCost(down, y) : money(down)} down payment.`);
  S.wealth -= downPlayer;

  const targetObj = isEgypt ? S.egyDev : S.intlDev;
  const c = {
    id: (isEgypt ? 'egyc_' : 'intlc_') + (++targetObj.seq) + '_' + Math.random().toString(36).slice(2,5),
    projectName: `${proj.unitName} at ${proj.compound}`, developer: proj.developer, location: proj.location,
    typeId: proj.typeId, size: proj.size, planLabel: plan.label, hap: proj.hap, hp: proj.hp,
    boughtYear: y, price, down, annual, paid: down, remaining: price - down, missed: 0,
    deliveryYear: proj.ready ? y : y + 2 + Math.floor(Math.random() * 3), ready: !!proj.ready, delivered: false, homeId: null, status: 'active', isEgypt
  };

  targetObj.contracts.push(c);
  targetObj.projects = targetObj.projects.filter(p => p.id !== projectId);
  
  if (proj.ready) devDeliver(c);
  
  log(`Signed contract with ${c.developer} for ${c.projectName}. Paid ${isEgypt ? displayCost(down, y) : money(down)} down.`);
  render();
}

function devDeliver(c){
  const y = gameYear();
  const valueInternal = c.isEgypt ? (c.price / egyRate(y)) : (c.price / localRate(y));
  
  const listing = {
    catId: (c.isEgypt ? 'egydev_' : 'intldev_') + c.id, typeId: c.typeId, name: c.projectName,
    priceInternal: Math.round(valueInternal), condition: 100, features: ['Gated Community', '24/7 Security'], location: c.location, hap: c.hap, hp: c.hp
  };
  const cat = typeof p12EnsureListingCategory === 'function' ? p12EnsureListingCategory(listing) : { id: listing.catId };
  
  const home = {
    id: 'h_dev_' + Math.random().toString(36).slice(2,8), catId: cat.id, name: c.projectName,
    value: Math.round(valueInternal), balance: Math.round(c.isEgypt ? c.remaining / egyRate(y) : c.remaining / localRate(y)),
    cond: 100, rentInc: Math.round(valueInternal * .004 * 12), status: 'vacant', pay: 1, rate: .0001,
    features: listing.features, location: c.location, marketCountry: c.isEgypt ? 'egy' : S.country, typeId: c.typeId, p12: true, devContract: c.id
  };
  
  S.ownedHomes.push(home);
  c.delivered = true; c.homeId = home.id;
  log(`Key Handover! You now own ${c.projectName} in ${c.location}. It has been added to your properties.`);
}

function devYear(){
  if (!S || S.dead) return;
  devInit(S);
  const y = gameYear();
  
  [...S.egyDev.contracts, ...S.intlDev.contracts].forEach(c => {
    if (c.status !== 'active') return;
    if (c.remaining > 0){
      const due = Math.min(c.annual, c.remaining);
      const duePlayer = c.isEgypt ? Math.round(egpToLocal(due, y)) : due;
      
      if (S.wealth >= duePlayer){
        S.wealth -= duePlayer;
        c.remaining -= due; c.paid += due; c.missed = 0;
      } else {
        c.missed++;
        if (c.missed >= 2){
          c.status = 'cancelled';
          log(`Contract Cancelled: Missed 2 installments for ${c.projectName}.`);
          return;
        }
      }
    }
    if (!c.delivered && y >= c.deliveryYear) devDeliver(c);
    if (c.delivered && c.remaining <= 0) c.status = 'done';
  });
  
  S.egyDev.projects = [];
  S.intlDev.projects = [];
}

/* ---------- UI PANEL RENDER ---------- */
function devRenderPanel(){
  const view = $('view'); if (!view || typeof activeTab === 'undefined' || activeTab !== 'assets' || !devOn()) return;
  const old = $('dev-panel'); if (old) old.remove();
  
  devInit(S);
  const sec = document.createElement('section'); sec.className = 'card'; sec.id = 'dev-panel';
  let html = `<h3>Developer Real Estate Markets</h3>`;

  // 1. LOCAL DEVELOPER MARKET (Germany, USA, UK, UAE, Egypt)
  if (S.country !== 'egy' && INTL_DEVELOPER_ROSTERS[S.country]) {
    const localMarket = devMarket(false);
    html += `<h4 style="margin:16px 0 8px; color:var(--cyan);">Local Developers (${(COUNTRIES[S.country]||{}).name || S.country.toUpperCase()})</h4>
             <p class="muted" style="font-size:0.85rem">New off-plan and ready-to-move compounds from local developers in your current country.</p>`;
    html += renderMarketCards(localMarket, false);
  }

  // 2. EGYPTIAN DEVELOPER MARKET (Accessible locally or as Diaspora)
  const egyMarketData = devMarket(true);
  html += `<h4 style="margin:24px 0 8px; color:var(--amber);">${S.country === 'egy' ? 'Egyptian Developer Compounds' : 'Egyptian Diaspora Investment Market'}</h4>
           <p class="muted" style="font-size:0.85rem">${S.country === 'egy' ? 'Top compounds in New Cairo, Zayed, Alexandria & North Coast.' : 'Invest in real estate back home in Egypt. Contracts are locked in EGP.'}</p>`;
  html += renderMarketCards(egyMarketData, true);

  sec.innerHTML = html;
  view.appendChild(sec);
}

function renderMarketCards(market, isEgypt){
  return market.map(p => {
    const y = gameYear();
    return `
    <div style="border: 1px solid var(--line); border-radius: 8px; margin-bottom: 12px; padding: 12px; background: var(--bg);">
      <b style="font-size:1.05rem">${p.compound} by ${p.developer}</b><br>
      <span class="muted" style="font-size:0.85rem"><i>"${p.tag}"</i></span><br>
      <div style="margin: 8px 0; font-size:0.9rem;">
        ${p.unitName} (${p.size} m²) in ${p.location}<br>
        <span style="color:var(--mint)">Amenities: Happiness +${p.hap}, Health +${p.hp}</span><br>
        <b>Base Cost: ${isEgypt ? displayCost(p.listEGP, y) : money(p.listLocal)}</b>
      </div>
      <details>
        <summary style="cursor:pointer; color:var(--cyan); font-weight:bold;">View Installment Plans</summary>
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
          ${DEV_PLANS.map(plan => {
            const price = Math.round((isEgypt ? p.listEGP : p.listLocal) * plan.markup);
            const down = plan.years === 0 ? price : Math.round(price * plan.down);
            const ann = plan.years > 0 ? Math.round((price - down) / plan.years) : 0;
            return `<button class="btn" style="font-size:0.8rem; text-align:left;" onclick="devBuy('${p.id}', '${plan.id}',${isEgypt})">
              <b>${plan.label}</b> — Down: ${isEgypt ? displayCost(down, y) : money(down)}${ann ? ' · ' + (isEgypt ? displayCost(ann, y) : money(ann)) + '/yr' : ''}
            </button>`;
          }).join('')}
        </div>
      </details>
    </div>`;
  }).join('');
}

GameHooks.on('migrate', devInit);
GameHooks.on('newGame', devInit);
GameHooks.on('year', devYear);
GameHooks.on('render', devRenderPanel);
