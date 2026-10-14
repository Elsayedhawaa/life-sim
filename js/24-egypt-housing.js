/* =====================================================================
   24. EGYPT HOUSING — developer compounds, off-plan units, installment plans
   Connects ONLY through GameHooks (see 90-hooks.js). Nothing here wraps old code.

   How it works
   - Only active when S.country === 'egy' and the player is 18+.
   - A "project" is a unit for sale by a developer (studio .. villa) in a compound.
   - Buying creates a CONTRACT (S.egyDev.contracts). Prices and installments are
     fixed in EGP, so they get cheaper in dollars if the pound falls.
   - Each year: installments are paid, delivery may happen (or be delayed),
     and after delivery the unit appears in ownedHomes with the unpaid part as its balance.
   - Missing 2 payments in a row cancels the contract; the developer keeps 30% of what you paid.
   ===================================================================== */

const EGY_AREAS = [
  {id:'ncairo',  name:'New Cairo',                      ppm:72000, compounds:['Nile Crest Residences','Lotus Park','Sphinx Heights']},
  {id:'zayed',   name:'Sheikh Zayed, Giza',             ppm:62000, compounds:['Green Oasis Compound','Pharos Gardens','Palm Court']},
  {id:'capital', name:'New Administrative Capital',     ppm:52000, compounds:['Skyline Capital Towers','Capital Gate Residences','Crown Views']},
  {id:'alex',    name:'Alexandria (Smouha / Sidi Gaber)', ppm:50000, compounds:['Mediterranean Bay Towers','Smouha Gardens','Corniche Heights']},
  {id:'borg',    name:'Alexandria (Borg El Arab)',      ppm:34000, compounds:['Delta Land Residence','Borg Green Park','Sandstone Village']},
  {id:'alamein', name:'New Alamein, North Coast',       ppm:95000, compounds:['Pearl Alamein','Blue Dunes Resort','Marina Sands']}
];
const EGY_DEVELOPERS = ['Nile Crest Development','Pharos Properties','Delta Land Group','Sandstone Developments','Capital Horizon','Alexandria Urban Co.'];
// typeId must be one of the ids already used by the game's property market (see P12_PROPERTY_TYPES)
const EGY_UNITS = [
  {id:'studio', typeId:'condo',     name:'Studio',        area:55,  f:1.08, w:3},
  {id:'br1',    typeId:'condo',     name:'1-Bedroom',     area:80,  f:1.04, w:3},
  {id:'br2',    typeId:'condo',     name:'2-Bedroom',     area:120, f:1.00, w:4},
  {id:'br3',    typeId:'condo',     name:'3-Bedroom',     area:165, f:0.98, w:3},
  {id:'town',   typeId:'townhouse', name:'Townhouse',     area:240, f:1.12, w:2},
  {id:'villa',  typeId:'villa',     name:'Standalone Villa', area:400, f:1.22, w:1}
];
/* Plans. "markup" multiplies the list price. "rate" is a yearly interest rate on the financed part. */
const EGY_PLANS = [
  {id:'cash', label:'Cash',                        down:1,    years:0,  markup:.88, rate:0,   note:'Cash discount of about 12%'},
  {id:'p5',   label:'5 years, 0% interest',        down:.10,  years:5,  markup:1.00, rate:0,  note:'The price already includes financing'},
  {id:'p8',   label:'8 years, 0% interest',        down:.10,  years:8,  markup:1.28, rate:0,  note:'Longer plan = higher price'},
  {id:'p10',  label:'10 years, low down payment',  down:.05,  years:10, markup:1.50, rate:0,  note:'Lowest installments, highest total'},
  {id:'r7',   label:'7 years + 14% yearly interest', down:.15, years:7, markup:1.00, rate:.14, note:'Interest charged on the unpaid balance'}
];
const EGY_FEES = {maintenance:.08, registration:.025, finishing:.12}; // share of list price paid at delivery

/* ---------- small helpers ---------- */
function egyOn(){ return !!(S && S.country==='egy' && S.age>=18); }
function egyInit(o){
  if (!o) return;
  if (!o.egyDev || typeof o.egyDev!=='object') o.egyDev = {projects:[], year:0, contracts:[], seq:0};
  o.egyDev.projects = Array.isArray(o.egyDev.projects) ? o.egyDev.projects : [];
  o.egyDev.contracts = Array.isArray(o.egyDev.contracts) ? o.egyDev.contracts : [];
  o.egyDev.seq = Number(o.egyDev.seq)||0;
}
function egyRate(year){ return Math.max(.0001, rateForCountry('egy', year||gameYear())); }
function egyToInternal(egp, year){ return (Number(egp)||0) / egyRate(year); }
function egpFmt(n){ return 'E£' + Math.round(Number(n)||0).toLocaleString(); }
function egyPick(list){ return list[Math.floor(Math.random()*list.length)]; }
function egyWeighted(list){ const t=list.reduce((a,x)=>a+x.w,0); let r=Math.random()*t; for(const x of list){ r-=x.w; if(r<=0) return x; } return list[0]; }

/* ---------- projects for sale this year ---------- */
function egyGenerateProjects(){
  const y = gameYear(), idx = p14EgyptPriceIndex(y), out = [];
  for (let i=0; i<6; i++){
    const area = egyPick(EGY_AREAS), unit = egyWeighted(EGY_UNITS);
    const size = Math.round(unit.area * (.9 + Math.random()*.2));
    const ready = Math.random()<.35;                                   // ready-to-move: you can live in it now, at a premium
    const finish = ready ? 'Fully finished' : (Math.random()<.45 ? 'Semi-finished' : 'Fully finished');
    const listEGP = Math.round(size * area.ppm * unit.f * (.85 + Math.random()*.30) * (ready?1.18:1) * idx / 1000) * 1000;
    out.push({
      id:'egyp_'+y+'_'+i+'_'+Math.random().toString(36).slice(2,5),
      developer:egyPick(EGY_DEVELOPERS), compound:egyPick(area.compounds), areaId:area.id, location:area.name,
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

/* ---------- plan maths (all in EGP) ---------- */
function egyQuote(listEGP, plan){
  const price = Math.round(listEGP * plan.markup);
  const down = plan.years===0 ? price : Math.round(price * plan.down);
  const financed = price - down;
  let annual = 0, total = price;
  if (plan.years>0){
    annual = plan.rate>0 ? financed*plan.rate/(1-Math.pow(1+plan.rate,-plan.years)) : financed/plan.years;
    annual = Math.round(annual);
    total = down + annual*plan.years;
  }
  return {price, down, financed, annual, total, extraPct: Math.round((total/(listEGP*.88)-1)*100)};
}

/* ---------- buying ---------- */
function egyBuy(projectId, planId){
  if (!egyOn()) return hint('Developer projects are only available to adults living in Egypt.');
  const proj = egyMarket().find(p=>p.id===projectId), plan = EGY_PLANS.find(p=>p.id===planId);
  if (!proj || !plan) return hint('This offer is no longer available. Check the market again.');
  const q = egyQuote(proj.listEGP, plan), y = gameYear();
  const downInternal = egyToInternal(q.down, y);
  if (S.wealth < downInternal) return hint(`You need ${egpFmt(q.down)} up front for this plan. You have ${egpFmt(S.wealth*egyRate(y))}.`);
  S.wealth -= downInternal;
  egyInit(S);
  const c = {
    id:'egyc_'+(++S.egyDev.seq)+'_'+Math.random().toString(36).slice(2,5),
    projectName:`${proj.unitName} at ${proj.compound}`, developer:proj.developer, location:proj.location,
    typeId:proj.typeId, size:proj.size, finish:proj.finish, planLabel:plan.label, planId:plan.id,
    listEGP:proj.listEGP, boughtYear:y, priceEGP:q.price, downEGP:q.down, annualEGP:q.annual,
    paidEGP:q.down, remainingEGP:q.financed, arrearsEGP:0, missed:0, delays:0,
    deliveryYear:proj.ready ? y : y + 2 + Math.floor(Math.random()*3), ready:!!proj.ready, delivered:false, homeId:null, status:'active', lastBal:0
  };
  S.egyDev.contracts.push(c);
  S.egyDev.projects = S.egyDev.projects.filter(p=>p.id!==projectId);
  if (proj.ready) egyDeliver(c);                                       // keys in hand: it is now one of your homes
  log(`You signed with ${c.developer} for a ${c.projectName} (${c.location}), ${c.size} m², ${c.finish.toLowerCase()}. Plan: ${plan.label}. Down payment ${egpFmt(q.down)}${q.annual?`, then ${egpFmt(q.annual)} a year`:''}. ${proj.ready?'It is ready to move in: find it under your properties.':`Expected delivery around ${c.deliveryYear}.`}`);
  if (typeof realismNotice==='function') realismNotice('Developer contract signed',
    `${c.projectName}. Contract price ${egpFmt(q.price)} (the cash price would be ${egpFmt(proj.listEGP*.88)}). You will pay ${egpFmt(q.total)} in total, ${q.extraPct}% more than cash. Installments are fixed in pounds, so inflation helps you. Off-plan delivery is often late, and at handover expect a maintenance deposit (8%) and registration fees (about 2.5%)${proj.finish==='Semi-finished'?', plus finishing costs because the unit comes semi-finished':''}.`);
  render();
}

/* ---------- yearly processing (runs from the 'year' hook) ---------- */
function egyDeliver(c){
  const y = gameYear(), idx = p14EgyptPriceIndex(y)/Math.max(.0001, p14EgyptPriceIndex(c.boughtYear));
  const valueEGP = c.listEGP * idx, valueInternal = egyToInternal(valueEGP, y);
  const fees = c.listEGP*(EGY_FEES.maintenance+EGY_FEES.registration+(c.finish==='Semi-finished'?EGY_FEES.finishing:0));
  const feeInternal = egyToInternal(fees, y);
  const paidFees = S.wealth >= feeInternal;
  if (paidFees){ S.wealth -= feeInternal; c.paidEGP += fees; }
  else { c.remainingEGP += fees; c.annualEGP += Math.round(fees/3); }     // you could not pay: the developer lets you finance the fees
  const unit = EGY_UNITS.find(u=>u.typeId===c.typeId) || EGY_UNITS[2];
  const listing = {catId:'egydev_'+c.id, typeId:c.typeId, name:c.projectName, priceInternal:Math.round(valueInternal),
    condition:100, features:['Gated compound','24/7 security','Landscaped areas','Club and pool access'], location:c.location};
  const cat = p12EnsureListingCategory(listing);
  const home = {id:'h_egy_'+Math.random().toString(36).slice(2,8), catId:cat.id, name:c.projectName, value:Math.round(valueInternal),
    balance:Math.round(egyToInternal(c.remainingEGP, y)), cond:c.finish==='Semi-finished'?70:100, rentInc:Math.round(valueInternal*.0035*12),
    status:'vacant', pay:1, rate:.0001, features:listing.features.slice(), location:c.location, marketCountry:'egy', typeId:c.typeId,
    furnishedQuality:'Unfurnished', marketRentRate:.0035, p12:true, egyContract:c.id, listingDetails:{...listing}};
  S.ownedHomes.push(home);
  c.delivered = true; c.homeId = home.id; c.lastBal = home.balance;
  log(`${c.developer} delivered your ${c.projectName}! Handover fees of ${egpFmt(fees)} (maintenance deposit, registration${c.finish==='Semi-finished'?', finishing':''})${paidFees?' were paid in cash':' could not be paid in cash, so they were added to your installments'}. Its market value is now about ${egpFmt(valueEGP)}.`);
}
function egyCancel(c, why){
  const refund = egyToInternal(c.paidEGP*.7);
  S.wealth += refund;
  if (c.homeId){ const i=S.ownedHomes.findIndex(h=>h.id===c.homeId); if (i>=0){ if(S.housing===c.homeId) S.housing=(typeof fallbackHome==='function'?fallbackHome():null); S.ownedHomes.splice(i,1); } }
  c.status='cancelled'; c.remainingEGP=0;
  log(`${why} ${c.developer} cancelled your contract for ${c.projectName}, kept 30% of what you paid and refunded ${egpFmt(c.paidEGP*.7)}.`);
}
function egyYear(){
  if (!S || S.dead) return;
  egyInit(S);
  const y = gameYear();
  S.egyDev.contracts.forEach(c=>{
    if (c.status!=='active') return;
    const home = c.homeId ? S.ownedHomes.find(h=>h.id===c.homeId) : null;
    // the home was sold: the sale already cleared its balance, so the contract ends
    if (c.delivered && !home){ c.status='sold'; c.remainingEGP=0; log(`You sold ${c.projectName}. The unpaid contract balance was settled from the sale.`); return; }
    // extra payments made with the normal "pay mortgage" button reduce the contract too
    if (home){
      const extra = c.lastBal - home.balance;
      if (extra > Math.max(5, c.lastBal*.005)) c.remainingEGP = Math.max(0, c.remainingEGP - extra*egyRate(y));
    }
    // 1. installment
    if (c.remainingEGP > 0){
      const due = Math.min(c.annualEGP + c.arrearsEGP, c.remainingEGP + c.arrearsEGP), dueInternal = egyToInternal(due, y);
      if (S.wealth >= dueInternal){
        S.wealth -= dueInternal; S.expenses=(S.expenses||0)+dueInternal;
        const principal = Math.min(c.remainingEGP, due); c.remainingEGP -= principal; c.paidEGP += due; c.arrearsEGP = 0; c.missed = 0;
        if (c.remainingEGP < 1) c.remainingEGP = 0;
        log(`Paid ${egpFmt(due)} to ${c.developer} for ${c.projectName}. ${c.remainingEGP>0?`${egpFmt(c.remainingEGP)} still to pay.`:'Your contract is fully paid!'}`);
      } else {
        c.missed++; c.arrearsEGP = Math.round(due*1.03);
        log(`You could not pay ${egpFmt(due)} to ${c.developer}. A 3% late fee was added.${c.missed>=2?'':' Miss one more and the contract is cancelled.'}`);
        if (c.missed >= 2){ egyCancel(c, 'Two missed installments in a row.'); return; }
      }
    }
    // 2. delivery (can be delayed)
    if (!c.delivered && y >= c.deliveryYear){
      if (c.delays<2 && Math.random()<.25){ c.delays++; c.deliveryYear = y+1; log(`${c.developer} announced a delay: your ${c.projectName} will now be delivered around ${c.deliveryYear}. Delays are common in off-plan projects.`); }
      else egyDeliver(c);
    }
    // 3. keep the home's balance in step with the contract
    const h2 = c.homeId ? S.ownedHomes.find(h=>h.id===c.homeId) : null;
    if (h2){ h2.balance = Math.max(0, Math.round(egyToInternal(c.remainingEGP, y))); c.lastBal = h2.balance; if (!h2.balance) h2.pay = 0; }
    if (c.delivered && c.remainingEGP<=0){ c.status='done'; log(`You own ${c.projectName} outright now. No more installments.`); }
  });
  S.egyDev.projects = [];   // a fresh batch of offers is created when you open the market
}

/* ---------- screen (runs from the 'render' hook, Real Estate tab only) ---------- */
function egyDetailRows(p){
  return EGY_PLANS.map(plan=>{
    const q = egyQuote(p.listEGP, plan);
    const line = plan.years===0
      ? `Pay ${egpFmt(q.down)} now`
      : `Down ${egpFmt(q.down)} · ${egpFmt(q.annual)}/yr for ${plan.years} yrs`;
    const extra = plan.id==='cash' ? 'baseline' : `total ${egpFmt(q.total)} (${q.extraPct>=0?'+':''}${q.extraPct}% vs cash)`;
    return `<button class="btn" style="font-size:.85rem" onclick="egyBuy('${p.id}','${plan.id}')"><b>${plan.label}</b><br><span class="muted">${line}<br>${extra}${plan.note?' · '+plan.note:''}</span></button>`;
  }).join('');
}
function egyContractCard(c){
  const state = c.status==='active' ? (c.delivered?'Delivered, paying off':`Under construction, delivery about ${c.deliveryYear}`) : c.status==='done'?'Fully paid':c.status==='sold'?'Sold':'Cancelled';
  return `<div class="row" style="flex-direction:column;align-items:stretch;border-top:1px solid var(--line);padding-top:8px;margin-top:8px">
    <b>${c.projectName}</b>
    <span class="muted">${c.location} · ${c.size} m² · ${c.finish} · ${c.developer}</span>
    <span class="muted">${c.planLabel} · ${state}</span>
    <span class="muted">Paid ${egpFmt(c.paidEGP)} · Remaining ${egpFmt(c.remainingEGP)}${c.status==='active'&&c.remainingEGP>0?` · Next installment ${egpFmt(c.annualEGP+c.arrearsEGP)}`:''}${c.missed?` · <b>${c.missed} missed</b>`:''}</span>
  </div>`;
}
function egyRenderPanel(){
  const view = $('view'); if (!view || typeof activeTab==='undefined' || activeTab!=='assets' || !egyOn()) return;
  const old = $('egy-dev'); if (old) old.remove();
  const live = S.egyDev.contracts.filter(c=>c.status==='active'), market = egyMarket();
  const sec = document.createElement('section'); sec.className='card'; sec.id='egy-dev';
  sec.innerHTML = `<h3>Egyptian Developer Market</h3>
    <p class="muted">In Egypt most new homes are bought from developers, often years before they are built. Prices and installments are fixed in pounds. Longer plans cost more in total, and delivery is often late. Offers refresh every year. Off-plan units are cheaper but you cannot live in them until delivery. “Ready to move in” units cost about 18% more and become one of your homes immediately: you can move in, rent them out, renovate or sell them from the property list.</p>
    ${live.length?`<h4 style="margin:14px 0 0">Your contracts</h4>${live.map(egyContractCard).join('')}`:''}
    <h4 style="margin:14px 0 4px">Available this year</h4>
    ${market.map(p=>`<details style="border-top:1px solid var(--line);padding:8px 0">
      <summary style="cursor:pointer"><b>${p.unitName}</b>, ${p.size} m² · ${p.compound}<br><span class="muted">${p.location} · ${p.ready?'✅ Ready to move in':p.finish} · ${p.developer} · list price ${egpFmt(p.listEGP)}</span></summary>
      ${egyDetailRows(p)}</details>`).join('')}`;
  view.appendChild(sec);
}

GameHooks.on('migrate', egyInit);
GameHooks.on('newGame', egyInit);
GameHooks.on('year', egyYear);
GameHooks.on('render', egyRenderPanel);
