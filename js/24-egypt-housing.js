/* =====================================================================
   24. EGYPT HOUSING — Global Diaspora Market, Cross-Border Payments
   Connects ONLY through GameHooks (see 90-hooks.js).
   ===================================================================== */

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
  { dev: 'Orascom', name: 'El Gouna Diaspora Enclave', loc: 'Red Sea', ppm: 145000, hap: 5, hp: 2, tag: 'A Global Community on the Red Sea' },
  { dev: 'City Edge', name: 'Alamein Diaspora Towers', loc: 'North Coast', ppm: 130000, hap: 4, hp: 2, tag: 'Mediterranean Horizon' }
];

const EGY_UNITS = [
  {id:'studio', typeId:'condo',     name:'Studio',          area:60,  f:1.08, w:3},
  {id:'br1',    typeId:'condo',     name:'1-Bedroom',       area:85,  f:1.04, w:3},
  {id:'br2',    typeId:'condo',     name:'2-Bedroom',       area:130, f:1.00, w:4},
  {id:'br3',    typeId:'condo',     name:'3-Bedroom',       area:175, f:0.98, w:3},
  {id:'town',   typeId:'townhouse', name:'Townhouse',       area:250, f:1.12, w:2},
  {id:'villa',  typeId:'villa',     name:'Standalone Villa', area:450, f:1.25, w:1}
];

const EGY_PLANS = [
  {id:'cash', label:'Cash',                        down:1,    years:0,  markup:.85, rate:0,   note:'15% Cash Discount applied'},
  {id:'p5',   label:'5 years, 0% interest',        down:.10,  years:5,  markup:1.00, rate:0,   note:'Standard developer plan'},
  {id:'p8',   label:'8 years, equal installments', down:.05,  years:8,  markup:1.25, rate:0,   note:'Extended payment plan'},
  {id:'p10',  label:'10 years, low down payment',  down:.05,  years:10, markup:1.45, rate:0,   note:'Highest total cost, lowest yearly burden'}
];
const EGY_FEES = {maintenance:.08, registration:.025, finishing:.12};

/* ---------- cross-border maths ---------- */
function egyOn(){ return !!(S && S.age>=18); }
function egyInit(o){
  if (!o) return;
  if (!o.egyDev || typeof o.egyDev!=='object') o.egyDev = {projects:[], year:0, contracts:[], seq:0};
  o.egyDev.projects = Array.isArray(o.egyDev.projects) ? o.egyDev.projects : [];
  o.egyDev.contracts = Array.isArray(o.egyDev.contracts) ? o.egyDev.contracts : [];
  o.egyDev.seq = Number(o.egyDev.seq)||0;
}
function egyRate(year){ return Math.max(.0001, rateForCountry('egy', year||gameYear())); }
function localRate(year){ return Math.max(.0001, rateForCountry(S.country, year||gameYear())); }
function egyToInternal(egp, year){ return (Number(egp)||0) / egyRate(year); }
function egpToLocal(egp, year){ return egyToInternal(egp, year) * localRate(year); }
function egpFmt(n){ return 'E£' + Math.round(Number(n)||0).toLocaleString(); }

function displayCost(egp, year){
  if (S.country === 'egy') return egpFmt(egp);
  const localCost = Math.round(egpToLocal(egp, year));
  return `${typeof money === 'function' ? money(localCost) : localCost} (${egpFmt(egp)})`;
}

function egyPick(list){ return list[Math.floor(Math.random()*list.length)]; }
function egyWeighted(list){ const t=list.reduce((a,x)=>a+x.w,0); let r=Math.random()*t; for(const x of list){ r-=x.w; if(r<=0) return x; } return list[0]; }

/* ---------- projects for sale this year ---------- */
function egyGenerateProjects(){
  const y = gameYear(), idx = p14EgyptPriceIndex(y), out = [];
  const rosterSource = S.country === 'egy' ? EGY_PROJECT_ROSTER : EGY_EXPAT_ROSTER;
  
  for (let i=0; i<4; i++){ 
    const roster = egyPick(rosterSource), unit = egyWeighted(EGY_UNITS);
    const size = Math.round(unit.area * (.9 + Math.random()*.2));
    const ready = Math.random()<.30; 
    const finish = ready ? 'Fully finished' : (Math.random()<.50 ? 'Core & Shell (Unfinished)' : 'Fully finished');
    const listEGP = Math.round(size * roster.ppm * unit.f * (.85 + Math.random()*.25) * (ready?1.20:1) * idx / 1000) * 1000;
    out.push({
      id:'egyp_'+y+'_'+i+'_'+Math.random().toString(36).slice(2,5),
      developer:roster.dev, compound:roster.name, location:roster.loc, tag:roster.tag,
      hap:roster.hap, hp:roster.hp,
      unitId:unit.id, unitName:unit.name, typeId:unit.typeId, size, finish, ready, listEGP, year:y
    });
  }
  return out;
}
function egyMarket(){
  egyInit(S);
  if (S.egyDev.year !== gameYear() || !S.egyDev.projects.length){
    S.egyDev.projects = egyGenerateProjects(); S.egyDev.year = gameYear();
  }
  return S.egyDev.projects;
}

/* ---------- plan maths ---------- */
function egyQuote(listEGP, plan){
  const price = Math.round(listEGP * plan.markup);
  const down = plan.years===0 ? price : Math.round(price * plan.down);
  const financed = price - down;
  let annual = 0, total = price;
  if (plan.years>0){
    annual = Math.round(financed/plan.years);
    total = down + annual*plan.years;
  }
  return {price, down, financed, annual, total, extraPct: Math.round((total/(listEGP*.85)-1)*100)};
}

/* ---------- buying ---------- */
function egyBuy(projectId, planId){
  if (!egyOn()) return hint('Developer projects are only available to adults.');
  const proj = egyMarket().find(p=>p.id===projectId), plan = EGY_PLANS.find(p=>p.id===planId);
  if (!proj || !plan) return hint('This offer has expired. The algorithm will show new ads soon.');
  
  const q = egyQuote(proj.listEGP, plan), y = gameYear();
  const downLocal = Math.round(egpToLocal(q.down, y));
  
  if (S.wealth < downLocal) return hint(`You need ${displayCost(q.down, y)} up front. You only have ${typeof money === 'function' ? money(S.wealth) : S.wealth}.`);
  S.wealth -= downLocal;
  
  egyInit(S);
  const c = {
    id:'egyc_'+(++S.egyDev.seq)+'_'+Math.random().toString(36).slice(2,5),
    projectName:`${proj.unitName} at ${proj.compound}`, developer:proj.developer, location:proj.location,
    typeId:proj.typeId, size:proj.size, finish:proj.finish, planLabel:plan.label, planId:plan.id,
    hap:proj.hap, hp:proj.hp,
    listEGP:proj.listEGP, boughtYear:y, priceEGP:q.price, downEGP:q.down, annualEGP:q.annual,
    paidEGP:q.down, remainingEGP:q.financed, arrearsEGP:0, missed:0, delays:0,
    deliveryYear:proj.ready ? y : y + 2 + Math.floor(Math.random()*4), ready:!!proj.ready, delivered:false, homeId:null, status:'active', lastBal:0
  };
  S.egyDev.contracts.push(c);
  S.egyDev.projects = S.egyDev.projects.filter(p=>p.id!==projectId);
  if (proj.ready) egyDeliver(c);
  
  log(`Signed contract with ${c.developer} for ${c.projectName}. Paid ${displayCost(q.down, y)} down.`);
  if (typeof realismNotice==='function') realismNotice('Compound Investment', 
    `You secured a unit in ${proj.compound}. Your installments are fixed in Egyptian Pounds, meaning currency fluctuations may affect the actual value you pay from abroad. Expect an 8% maintenance deposit upon delivery.`);
  render();
}

/* ---------- yearly processing & delivery ---------- */
function egyDeliver(c){
  const y = gameYear(), idx = p14EgyptPriceIndex(y)/Math.max(.0001, p14EgyptPriceIndex(c.boughtYear));
  const valueEGP = c.listEGP * idx, valueInternal = egyToInternal(valueEGP, y);
  const feesEGP = c.listEGP*(EGY_FEES.maintenance+EGY_FEES.registration+(c.finish.includes('Unfinished')?EGY_FEES.finishing:0));
  const feesLocal = Math.round(egpToLocal(feesEGP, y));
  
  const paidFees = S.wealth >= feesLocal;
  if (paidFees){ S.wealth -= feesLocal; c.paidEGP += feesEGP; }
  else { c.remainingEGP += feesEGP; c.annualEGP += Math.round(feesEGP/3); }
  
  const listing = {catId:'egydev_'+c.id, typeId:c.typeId, name:c.projectName, priceInternal:Math.round(valueInternal),
    condition:100, features:['Gated Community', 'Clubhouse Access', '24/7 Security'], location:c.location, hap:c.hap, hp:c.hp};
  const cat = p12EnsureListingCategory(listing);
  
  const home = {id:'h_egy_'+Math.random().toString(36).slice(2,8), catId:cat.id, name:c.projectName, value:Math.round(valueInternal),
    balance:Math.round(egyToInternal(c.remainingEGP, y)), cond:c.finish.includes('Unfinished')?70:100, rentInc:Math.round(valueInternal*.0045*12),
    status:'vacant', pay:1, rate:.0001, features:listing.features.slice(), location:c.location, marketCountry:'egy', typeId:c.typeId,
    furnishedQuality:'Unfurnished', marketRentRate:.0045, p12:true, egyContract:c.id, listingDetails:{...listing}};
    
  S.ownedHomes.push(home);
  c.delivered = true; c.homeId = home.id; c.lastBal = home.balance;
  log(`${c.developer} handed over the keys to your ${c.projectName}! Handover fees of ${displayCost(feesEGP, y)} were charged.`);
}

function egyCancel(c, why){
  const refundLocal = Math.round(egpToLocal(c.paidEGP*.7, gameYear()));
  S.wealth += refundLocal;
  if (c.homeId){ const i=S.ownedHomes.findIndex(h=>h.id===c.homeId); if (i>=0){ if(S.housing===c.homeId) S.housing=(typeof fallbackHome==='function'?fallbackHome():null); S.ownedHomes.splice(i,1); } }
  c.status='cancelled'; c.remainingEGP=0;
  log(`${why} ${c.developer} cancelled the contract for ${c.projectName}, keeping 30% of paid funds.`);
}

function egyYear(){
  if (!S || S.dead) return;
  egyInit(S);
  const y = gameYear();
  S.egyDev.contracts.forEach(c=>{
    if (c.status!=='active') return;
    const home = c.homeId ? S.ownedHomes.find(h=>h.id===c.homeId) : null;
    if (c.delivered && !home){ c.status='sold'; c.remainingEGP=0; return; }
    
    if (home){
      const extraInternal = c.lastBal - home.balance;
      if (extraInternal > Math.max(5, c.lastBal*.005)) c.remainingEGP = Math.max(0, c.remainingEGP - extraInternal*egyRate(y));
    }
    
    if (c.remainingEGP > 0){
      const dueEGP = Math.min(c.annualEGP + c.arrearsEGP, c.remainingEGP + c.arrearsEGP);
      const dueLocal = Math.round(egpToLocal(dueEGP, y));
      
      if (S.wealth >= dueLocal){
        S.wealth -= dueLocal; S.expenses=(S.expenses||0)+dueLocal;
        const principal = Math.min(c.remainingEGP, dueEGP); c.remainingEGP -= principal; c.paidEGP += dueEGP; c.arrearsEGP = 0; c.missed = 0;
        if (c.remainingEGP < 1) c.remainingEGP = 0;
      } else {
        c.missed++; c.arrearsEGP = Math.round(dueEGP*1.03);
        if (c.missed >= 2){ egyCancel(c, 'Two missed installments.'); return; }
      }
    }
    
    if (!c.delivered && y >= c.deliveryYear){
      if (c.delays<2 && Math.random()<.30){ c.delays++; c.deliveryYear = y+1; log(`Construction delay at ${c.compound}: Delivery pushed to ${c.deliveryYear}.`); }
      else egyDeliver(c);
    }
    
    const h2 = c.homeId ? S.ownedHomes.find(h=>h.id===c.homeId) : null;
    if (h2){ h2.balance = Math.max(0, Math.round(egyToInternal(c.remainingEGP, y))); c.lastBal = h2.balance; if (!h2.balance) h2.pay = 0; }
    if (c.delivered && c.remainingEGP<=0){ c.status='done'; }
  });
  S.egyDev.projects = []; 
}

/* ---------- Social Media Ad UI Rendering ---------- */
function egyDetailRows(p){
  return EGY_PLANS.map(plan=>{
    const q = egyQuote(p.listEGP, plan);
    const line = plan.years===0 ? `Cash Offer: ${displayCost(q.down, p.year)}` : `Down ${displayCost(q.down, p.year)} · ${displayCost(q.annual, p.year)}/yr for ${plan.years} yrs`;
    const extra = plan.id==='cash' ? 'Best value' : `Total contract: ${displayCost(q.total, p.year)}`;
    return `<button class="btn" style="font-size:.85rem; background:var(--bg); border: 1px solid var(--line);" onclick="egyBuy('${p.id}','${plan.id}')"><b>${plan.label}</b><br><span class="muted">${line}<br>${extra}</span></button>`;
  }).join('');
}

function egyRenderPanel(){
  const view = $('view'); if (!view || typeof activeTab==='undefined' || activeTab!=='assets' || !egyOn()) return;
  const old = $('egy-dev'); if (old) old.remove();
  const live = S.egyDev.contracts.filter(c=>c.status==='active'), market = egyMarket();
  const sec = document.createElement('section'); sec.className='card'; sec.id='egy-dev';
  const isExpat = S.country !== 'egy';
  
  let html = `<h3>${isExpat ? 'Invest in Egypt: Real Estate' : 'Developer Contracts'}</h3>`;
  if (live.length) {
    html += live.map(c => `<div class="row" style="flex-direction:column;align-items:stretch;border-top:1px solid var(--line);padding-top:8px;margin-top:8px">
      <b>${c.projectName}</b><span class="muted">${c.location} · ${c.developer}</span>
      <span class="muted">${c.delivered ? 'Delivered & Paying off' : `Under construction, expected ${c.deliveryYear}`}</span>
      <span class="muted" style="color:var(--mint)">Remaining: ${displayCost(c.remainingEGP, gameYear())}</span>
    </div>`).join('');
  } else {
    html += `<p class="muted">You have no active developer contracts in Egypt.</p>`;
  }

  html += `<h4 style="margin:24px 0 8px; display:flex; align-items:center; gap:6px;">
            <span style="background:var(--amber); color:#000; font-size:0.7rem; padding:2px 6px; border-radius:4px; font-weight:bold;">SPONSORED</span> 
            ${isExpat ? 'Featured Diaspora Investment Offers' : 'Featured Developer Offers'}
          </h4>
          <p class="muted" style="font-size:0.85rem">${isExpat ? 'Secure a property back home. Contracts are fixed in Egyptian Pounds, meaning your installments will adjust against your current foreign income based on real-time exchange rates.' : 'Targeted properties from top Egyptian developers. Upgrading to a gated community improves Happiness and Health.'}</p>`;
  
  html += market.map(p=>`
    <div style="border: 1px solid var(--line); border-radius: 8px; margin-bottom: 12px; overflow: hidden;">
      <div style="background: var(--line); padding: 12px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <b style="font-size:1.1rem">${p.compound} by ${p.developer}</b>
        </div>
        <div style="font-size:0.85rem; color:var(--text); margin-top:4px;"><i>"${p.tag}"</i></div>
      </div>
      <div style="padding: 12px;">
        <div style="margin-bottom: 12px; font-size:0.9rem;">
          <b>${p.unitName} (${p.size} m²)</b> in ${p.location}<br>
          <span class="muted">Status: ${p.ready ? '✅ Ready to Move' : p.finish}</span><br>
          <span class="muted" style="color:var(--cyan)">Amenities: Happiness +${p.hap}, Health +${p.hp}</span><br>
          <b>Contract Value: ${displayCost(p.listEGP, p.year)}</b>
        </div>
        <details>
          <summary style="cursor:pointer; color:var(--cyan); font-weight:bold; margin-bottom:8px;">View Payment Plans</summary>
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:8px;">
            ${egyDetailRows(p)}
          </div>
        </details>
      </div>
    </div>`).join('');

  sec.innerHTML = html;
  view.appendChild(sec);
}

GameHooks.on('migrate', egyInit);
GameHooks.on('newGame', egyInit);
GameHooks.on('year', egyYear);
GameHooks.on('render', egyRenderPanel);
