/* ================================================================
   COMBINED LIFELINE PATCH BUNDLE — P14 → P25
   Concatenated from 12-p14-realism.js through 23-p25-tab-lock.js
   Order preserved. All wrappers, const names and call sites kept
   intact so the wrapped function chains resolve correctly.
   ================================================================ */

/* ==================== P14 REALISM PATCH ====================
   Death-free mode, historical USD/EGP, separate Egyptian inflation and
   wages, parent money-request modal, degree-matched jobs, and precarious
   post-study survival path. All figures are gameplay estimates. */

/* 1) Death mechanics are off: keep the life playable indefinitely. */
checkDeath = function(){ if(S) S.dead=false; };
const P14_migrateBeforeNoDeath = migrate;
migrate = function(o){
  const x=P14_migrateBeforeNoDeath(o);
  if(!x) return x;
  x.dead=false;
  if(Array.isArray(x.family)) x.family.forEach(m=>{ if(m && ['Mother','Father','Sibling','Child','Partner','Spouse'].includes(m.role)) m.alive=true; });
  x.funeralNotice=null;
  x.familyEstatePool=0; x.familyEstatePropertyPool=false; x.familyEstatePoolYear=0;
  return x;
};
/* Rebuild yearly family ageing without mortality or inheritance. */
familyYear = function(){
  if(!S) return 0;
  (S.family||[]).forEach(m=>{ if(!m) return; m.alive=true; m.age=(Number(m.age)||0)+1; m.done=false; m.bond=clamp((m.bond||0)-2); });
  if(S.age>=18 && S.housing==='parents' && !parents().length){ S.housing=null; log('You no longer have access to the family home. Choose housing in Real Estate.'); }
  const count=(S.family||[]).filter(k=>k.role==='Child'&&k.alive&&k.age<18).length;
  const y=gameYear(), country=S.country||'usa';
  const perChild=country==='egy' ? localCurrencyInternal(50000*p14EgyptPriceIndex(y),'egy',y) : localCurrencyInternal(((COUNTRIES[country]||COUNTRIES.usa).childCostLocal||8000)*(typeof prOf==='function'?prOf(y,S):1),country,y);
  return count*perChild;
};

/* 2) Historical exchange-rate references. The 2007 reference is near EGP 5.6/USD,
   supported by annual historical data; future rates are scenarios, not promises. */
const P14_EGP_USD_HISTORY = {
  2007:5.635, 2008:5.433, 2009:5.545, 2010:5.605, 2011:5.939,
  2012:6.068, 2013:6.872, 2014:7.079, 2015:7.690, 2016:10.03,
  2017:17.78, 2018:17.75, 2019:16.77, 2020:15.76, 2021:15.70,
  2022:19.16, 2023:30.90, 2024:49.50, 2025:50.60, 2026:52.70
};
const P14_EGY_INFLATION = {
  2007:10.9,2008:11.7,2009:16.2,2010:11.7,2011:11.1,2012:8.7,2013:6.9,
  2014:10.1,2015:11.0,2016:10.2,2017:23.5,2018:20.9,2019:13.9,2020:5.7,
  2021:4.5,2022:8.5,2023:24.4,2024:33.3,2025:20.4,2026:11.8,
  2027:9.6,2028:6.7,2029:5.5,2030:5.3
};
const P14_EGY_PRICE_INDEX = {
  2007:.0873,2008:.0975,2009:.1133,2010:.1265,2011:.1405,2012:.1527,
  2013:.1633,2014:.1798,2015:.1995,2016:.2199,2017:.2716,2018:.3283,
  2019:.3738,2020:.3951,2021:.4129,2022:.4480,2023:.5573,2024:.7428,
  2025:.8945,2026:1.0
};
function p14EgyptPriceIndex(year){
  const y=Number(year)||2007;
  if(y<=2007) return P14_EGY_PRICE_INDEX[2007];
  if(y<=2026) {
    if(P14_EGY_PRICE_INDEX[y]!=null) return P14_EGY_PRICE_INDEX[y];
    const lo=Math.floor(y), a=P14_EGY_PRICE_INDEX[lo]||.0873, b=P14_EGY_PRICE_INDEX[lo+1]||1;
    return a+(b-a)*(y-lo);
  }
  let v=1;
  for(let yr=2027;yr<=y;yr++) v*=1+(P14_EGY_INFLATION[yr]??6.0)/100;
  return v;
}
const P14_egyptWageIndexBeforeForecast=egyptWageIndex;
egyptWageIndex = function(year){
  const y=Number(year)||2007;
  if(y<=2026) return P14_egyptWageIndexBeforeForecast(y);
  /* Nominal wages grow more slowly than prices in this simplified stress scenario. */
  return Math.pow(1.075,y-2026);
};
p12ScaleForYear = function(country,y){
  if(country==='egy') return p14EgyptPriceIndex(y)*(rateForCountry('egy',2026)/Math.max(.0001,rateForCountry('egy',y)));
  return typeof prOf==='function'?prOf(y,S):(S&&S.prEra)||1;
};
COUNTRIES.egy.hist = y => {
  const yr=Number(y)||2007;
  if(P14_EGP_USD_HISTORY[yr]!=null) return P14_EGP_USD_HISTORY[yr];
  if(yr<2007) return 5.635*Math.pow(1.025,2007-yr);
  return P14_EGP_USD_HISTORY[2026]*Math.pow(1.055,yr-2026);
};
COUNTRIES.egy.rate=52.70;
rateForCountry = function(country,year){
  const c=COUNTRIES[country]||COUNTRIES.usa, y=Number(year)||gameYear();
  if(country==='egy') return COUNTRIES.egy.hist(y);
  if(c.hist&&y<2026) return c.hist(y);
  return c.rate||1;
};
rateNow = function(){
  const c=C(), y=gameYear();
  return rateForCountry(S&&S.country||'usa',y)*((S&&S.cf&&S.cf.mul)||1);
};
/* Historical Egypt prices use CPI inflation; salaries use a separate wage index.
   Keep the local-school and local-university tables tied to prices, not wages. */
if(typeof EGY_SCHOOL_LOCAL!=='undefined') Object.entries(SCHOOLS).forEach(([k,school])=>{
  const d=Object.getOwnPropertyDescriptor(school,'cost');
  const old=d&&d.get?d.get.bind(school):()=>d&&d.value||0;
  Object.defineProperty(school,'cost',{configurable:true,enumerable:true,get(){
    if(S&&S.country==='egy'&&EGY_SCHOOL_LOCAL[k]) return localCurrencyInternal(EGY_SCHOOL_LOCAL[k]*p14EgyptPriceIndex(gameYear()),'egy',gameYear());
    return old();
  }});
});
if(typeof EGY_UNI_LOCAL!=='undefined') Object.entries(UNIS).forEach(([k,uni])=>{
  const d=Object.getOwnPropertyDescriptor(uni,'tuition');
  const old=d&&d.get?d.get.bind(uni):()=>d&&d.value||0;
  Object.defineProperty(uni,'tuition',{configurable:true,enumerable:true,get(){
    if(S&&S.country==='egy'&&EGY_UNI_LOCAL[k]) return localCurrencyInternal(EGY_UNI_LOCAL[k]*p14EgyptPriceIndex(gameYear()),'egy',gameYear());
    return old();
  }});
});

function p14RateForYear(year){
  const target=Number(year)||gameYear(), now=gameYear();
  if(target<=now) return rateForCountry('egy',target);
  const base=rateForCountry('egy',now);
  return base*Math.pow(1.055,target-now);
}
function p14RateOutlook(){
  const y=gameYear(), rate=p14RateForYear(y), next=p14RateForYear(y+1), adultYear=(S.born||2001)+18, adultRate=p14RateForYear(adultYear);
  const nextRange=`${(next*.93).toFixed(1)}–${(next*1.07).toFixed(1)}`;
  const adultRange=adultYear>y?`${(rate*Math.pow(1.03,adultYear-y)).toFixed(1)}–${(rate*Math.pow(1.08,adultYear-y)).toFixed(1)}`:null;
  const basis=y<2026?'historical annual reference':y===2026?'current-year reference':'model forecast';
  const adultBasis=adultYear<=y?'current / historical in-game reference':'forecast from the current in-game year';
  return {year:y,rate,next,nextRange,adultYear,adultRate,adultRange,basis,adultBasis};
}
function p14RatePanel(){
  if(!S||S.home!=='egy') return '';
  const o=p14RateOutlook(), current=o.rate.toFixed(2), next=o.next.toFixed(2), adult=o.adultRate.toFixed(2);
  return `<div id="p14-fx-panel" class="card" style="padding:10px 12px;border-color:#34344a"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:.82rem">USD / EGP · ${o.year}</b><b class="mono" style="color:var(--cyan)">$1 ≈ EGP ${current}</b></div><p class="muted" style="font-size:.76rem;margin-top:4px">${o.basis==='historical annual reference'?'Historical annual reference':o.basis==='current-year reference'?'Current-year reference':'Model forecast'} · not an exact daily bank rate.</p><div style="font-size:.8rem;margin-top:7px">Next year (${o.year+1}): <b>EGP ${next}/$</b> <span class="muted">(scenario range ${o.nextRange})</span></div><div style="font-size:.8rem;margin-top:4px">When you turn 18 (${o.adultYear}): <b>EGP ${adult}/$</b> <span class="muted">(${o.adultBasis}${o.adultRange?`; broad scenario range EGP ${o.adultRange}`:''})</span></div><details style="margin-top:7px"><summary>Why the exchange rate changes</summary><p class="muted" style="font-size:.78rem">Imported goods can become more expensive when the pound weakens. Local prices also rise with Egyptian inflation; salaries do not always catch up. From 2027 onward, the game uses a 5.5% annual base-case depreciation assumption, a ±7% next-year band, and a wider 3%–8% annual range for longer forecasts. It is an educational scenario, not financial advice or a guaranteed forecast.</p></details></div>`;
}
const P14_renderBeforeRatePanel=render;
render=function(){
  const r=P14_renderBeforeRatePanel();
  if(S){const top=$('top');if(top&&S.home==='egy')top.insertAdjacentHTML('beforeend',p14RatePanel());}
  try{p14ShowParentRequestModal();}catch(e){/* UI may not be mounted yet */}
  return r;
};
const P14_viewWorldBeforeRatePanel=viewWorld;
viewWorld=function(){
  let html=P14_viewWorldBeforeRatePanel();
  if(S&&S.home==='egy'){
    const rows=Object.keys(P14_EGP_USD_HISTORY).filter(y=>Number(y)<=Math.min(2026,gameYear())).map(y=>ROW(String(y),`EGP ${P14_EGP_USD_HISTORY[y].toFixed(2)} per $1`)).join('');
    html+=SEC('Egyptian pound history and outlook',PR('The 2007 reference was about EGP 5.6 per US dollar. Historical values below are annual reference rates, not the exact rate available at every bank or exchange office. From 2027, the game switches to an uncertain scenario forecast.')+rows+ROW(`Next year · ${gameYear()+1}`,`EGP ${p14RateOutlook().next.toFixed(2)} per $1`)+ROW('Estimated price level vs 2026',`${Math.round(p14EgyptPriceIndex(gameYear())*100)}%`));
  }
  return html;
};

/* 3) Parent requests: one clear request, exact purpose and amount, with the
   player free to send less, send the full request, or decline. */
function p14SuggestedFamilyNeed(reason, familyTier, year, country='egy'){
  const r=String(reason||'').toLowerCase(), t=Math.max(0,Math.min(2,Number(familyTier)||0));
  const egp = r.includes('hospital')||r.includes('treatment')||r.includes('medical')||r.includes('medication')||r.includes('medicine') ? [4500,18000,55000][t]
    : r.includes('grocery')||r.includes('food') ? [1800,5500,15000][t]
    : r.includes('school')||r.includes('education')||r.includes('fees') ? [2500,10000,45000][t]
    : r.includes('wedding')||r.includes('event') ? [7000,30000,100000][t]
    : r.includes('repair')||r.includes('plumbing')||r.includes('roof') ? [3000,12000,45000][t]
    : r.includes('rent')||r.includes('bill')||r.includes('utility')||r.includes('electric')||r.includes('gas') ? [2500,8000,24000][t]
    : [2500,8500,25000][t];
  if(country==='egy') return Math.max(1,Math.round(egp*p14EgyptPriceIndex(year)));
  const usdBase=(r.includes('hospital')||r.includes('medical')? [300,1500,5000][t] : r.includes('grocery')||r.includes('food') ? [80,240,600][t] : [100,350,1000][t]);
  return Math.max(1,Math.round(usdBase*(COUNTRIES[country]?.rate||1)*(typeof prOf==='function'?prOf(year,S):1)));
}
function p14RequestState(){
  if(!S)return null;
  if(S.parentNeed){
    const n=S.parentNeed, m=S.family.find(x=>x.id===n.id), home=S.home||'egy';
    if(!Number.isFinite(n.amountInternal)||n.amountInternal<=0){
      n.amountHomeLocal=p14SuggestedFamilyNeed(n.reason,S.famWealth,gameYear(),home);
      n.amountHomeCurrency=(COUNTRIES[home]||COUNTRIES.egy).cur;
      n.amountInternal=localCurrencyInternal(n.amountHomeLocal,home,gameYear());
    }
    return {kind:'parent',n,m,reason:n.reason||'household bills',amountInternal:n.amountInternal,amountPlayer:Math.max(0,n.amountInternal*rateNow()),name:m?.name||'Your parent'};
  }
  if(S.familyNeed){
    const n=S.familyNeed, m=S.family.find(x=>x.id===n.id), home=S.home||S.country||'egy';
    if(!Number.isFinite(n.amountInternal)||n.amountInternal<=0){n.amountHomeLocal=p14SuggestedFamilyNeed(n.reason,S.famWealth,gameYear(),home);n.amountInternal=localCurrencyInternal(n.amountHomeLocal,home,gameYear());}
    return {kind:'family',n,m,reason:n.reason||'family expenses',amountInternal:n.amountInternal,amountPlayer:Math.max(0,n.amountInternal*rateNow()),name:m?.name||'Your family member'};
  }
  return null;
}
p12GenerateFamilyNeed=function(){
  if(!S||S.age<18||S.p12NeedAge===S.age||S.familyNeed||S.parentNeed)return;
  const ps=parents(); if(!ps.length)return;
  S.p12NeedAge=S.age;
  /* Requests happen periodically, not every year; household pressure rises for older parents and low-income families. */
  const senior=ps.filter(m=>m.age>=55).length, chance=Math.min(.27,(S.famWealth===0?.17:S.famWealth===1?.11:.06)+senior*.035);
  if(Math.random()>chance)return;
  const m=pick(ps);
  const reason=pick(m.age>=60?['monthly groceries','electricity and gas bills','blood tests and medication','hospital treatment','urgent plumbing repair','rent and household bills']:['monthly groceries','electricity and gas bills','helping a younger sibling with school fees','a hospital or clinic bill','medication','a family wedding expense','urgent home repair','temporary loss of income']);
  const local=p14SuggestedFamilyNeed(reason,S.famWealth,gameYear(),S.home||'egy');
  S.parentNeed={id:m.id,reason,amountHomeLocal:local,amountHomeCurrency:(COUNTRIES[S.home||'egy']||COUNTRIES.egy).cur,amountInternal:localCurrencyInternal(local,S.home||'egy',gameYear()),year:gameYear()};
  log(`${m.name} (your ${m.role.toLowerCase()}) asked for help with ${reason}. They explained the amount and you can choose how much to send or decline.`);
  realismNotice('A parent asks for help',`${m.name} needs help with ${reason}. You will see the requested amount, but you control the amount you send. Refusing may hurt trust; helping may delay your own goals.`);
};
function p14RespondFamilyNeed(send){
  const r=p14RequestState(); if(!r)return;
  if(send){
    const value=Number($('p14-family-request-amount')?.value);
    if(!Number.isFinite(value)||value<0)return hint('Enter a valid amount of zero or more.');
    const transfer=localCurrencyInternal(value,S.country,gameYear());
    const fee=S.country!==(S.home||S.country)?transfer*.025:0;
    const total=transfer+fee;
    if(total>S.wealth)return hint(`You cannot afford ${money(total)} including ${fee? 'the estimated transfer fee':''}. Choose a smaller amount or decline.`);
    S.wealth-=total;S.expenses=(S.expenses||0)+total;S.bill=S.bill||{};S.bill.familySupport=(S.bill.familySupport||0)+total;
    if(S.yearPopup)S.yearPopup.expenses=(S.yearPopup.expenses||0)+total;
    if(r.m){
      const ratio=r.amountInternal>0?transfer/r.amountInternal:0;
      r.m.bond=clamp(r.m.bond+(ratio>=.9?9:ratio>=.35?5:ratio>0?2:-3));
    }
    if(transfer>0){fx({happiness:Math.min(3,Math.round(transfer/Math.max(1,r.amountInternal)*2))});log(`You sent ${money(transfer)} to ${r.name} for ${r.reason}${fee?`; the international transfer fee was ${money(fee)}`:''}. Their need was ${money(r.amountInternal)}; you chose the amount that fit your budget.`);}
    else {fx({happiness:-2});log(`You offered no money to ${r.name} for ${r.reason}. They understood your budget was tight, but felt disappointed.`);}
  } else {
    if(r.m)r.m.bond=clamp(r.m.bond-7);fx({happiness:-3});log(`You declined ${r.name}'s request for ${r.reason}. They were disappointed, but you protected your own limited savings.`);
  }
  if(r.kind==='parent')S.parentNeed=null;else S.familyNeed=null;
  const el=document.getElementById('p14-parent-request-modal');if(el)el.remove();hint();render();
}
function p14ShowParentRequestModal(){
  if(!S||S.pending||S.yearPopup)return;
  const r=p14RequestState(),existing=document.getElementById('p14-parent-request-modal');
  if(!r){if(existing)existing.remove();return;}
  let el=existing;
  if(!el){el=document.createElement('div');el.id='p14-parent-request-modal';el.style.cssText='position:fixed;inset:0;z-index:10001;background:rgba(2,2,10,.82);display:flex;align-items:center;justify-content:center;padding:16px;';document.body.appendChild(el);}
  const cur=C().cur, value=Math.round(r.amountPlayer);
  el.innerHTML=`<div style="background:#14141f;color:#e8e8f2;border:1px solid #51416e;border-radius:16px;padding:20px;max-width:480px;width:100%;max-height:86vh;overflow:auto;box-shadow:0 18px 60px #0009"><div style="font-size:.75rem;letter-spacing:.08em;color:#22d3ee;font-weight:700">FAMILY MESSAGE · ${gameYear()}</div><h2 style="font-size:1.45rem;margin:8px 0">${r.name} asks for your help</h2><p style="line-height:1.5;margin-bottom:10px">They need help with <b>${r.reason}</b>. The requested amount is about <b>${money(r.amountInternal)}</b> in your current currency. Family needs can be real, but you also have bills and goals of your own.</p><label for="p14-family-request-amount" class="muted">Amount you choose to send (${cur})</label><input id="p14-family-request-amount" type="number" min="0" value="${value}" style="width:100%;margin:8px 0 12px;padding:12px;background:#0b0b12;color:#e8e8f2;border:1px solid #35354b;border-radius:10px;font:inherit"><p class="muted" style="font-size:.8rem">You may send the full amount, a smaller amount, or nothing. If you are abroad, an estimated 2.5% transfer fee is added. You cannot age up until you respond.</p><div class="acts"><button class="btn" style="text-align:center;background:#8b5cf6" onclick="p14RespondFamilyNeed(true)">Send chosen amount</button><button class="btn" style="text-align:center" onclick="p14RespondFamilyNeed(false)">Decline for now</button></div></div>`;
}
const P14_viewLifeBeforeParentModal=viewLife;
viewLife=function(){return P14_viewLifeBeforeParentModal();};
const P14_ageUpBeforeRequestGate=ageUp;
ageUp=function(){
  if(S&&(S.parentNeed||S.familyNeed)){hint('Please respond to the family money request first. You may send any amount or decline.');p14ShowParentRequestModal();return;}
  const oldAge=S&&S.age;P14_ageUpBeforeRequestGate();
  if(S&&oldAge!==S.age&&S.yearPopup&&S.home==='egy'&&S.fxNoteYear!==gameYear()){
    const o=p14RateOutlook();S.fxNoteYear=gameYear();
    S.yearPopup.note=(S.yearPopup.note||'')+`\n\nUSD/EGP context: the ${gameYear()} reference is EGP ${o.rate.toFixed(2)} per $1. The next-year baseline scenario is EGP ${o.next.toFixed(2)} (uncertainty band ${o.nextRange}); by age 18 (${o.adultYear}), the game reference is EGP ${o.adultRate.toFixed(2)} per $1${o.adultRange?` (long-range scenario band EGP ${o.adultRange})`:''}. Forecasts are uncertain.`;
    render();
  }
};

/* 4) Career boards show roles linked to the degree / master specialization first. */
const P14_companyListBeforeDegreeSort=companyListFor;
companyListFor=function(country=S.country){
  const list=P14_companyListBeforeDegreeSort(country).slice();
  if(!S)return list;
  const trackForDegree={cs:'tech',business:'finance',law:'law',medicine:'medical',biology:'bio'};
  const preferred=trackForDegree[S.degree]||trackForDegree[S.masterField]||null;
  const masterTrack={finance:'finance',accounting:'finance',data:'tech',computer:'tech',law:'law',health:'medical',biology:'bio',engineering:'tech'};
  const preferredMaster=masterTrack[String(S.masterField||'').toLowerCase()]||null;
  return list.sort((a,b)=>{
    const score=p=>((preferred&&p.trackId===preferred)?0:3)+((p.degree&&p.degree===S.degree)?0:1)+((preferredMaster&&p.trackId===preferredMaster)?0:1);
    return score(a)-score(b);
  });
};

/* Add degree-relevant pre-birthday workplace and family-drama decisions. */
const P14_preAgeEventsBeforeDrama=p12PreAgeEvent;
p12PreAgeEvent=function(){
  const list=P14_preAgeEventsBeforeDrama();
  if(S.age>=18&&parents().length&&Math.random()<.22){
    const m=pick(parents()), topic=pick(['Your parents disagree about the household budget','A sibling compares your progress with a cousin abroad','Your family expects you to send more money home']);
    list.push({id:'p14-family-drama-'+S.age,title:topic,text:`${m.name} says the family has been tense about money and your future. You are trying to build a life of your own, but their worries are real too.`,choices:[
      {label:'Listen and agree on a realistic budget',fx:()=>{parents().forEach(p=>p.bond=clamp(p.bond+4));fx({happiness:1});return {msg:'You listened without promising money you do not have. The disagreement cooled, although the budget is still tight.'};}},
      {label:'Set a firm boundary about money',fx:()=>{parents().forEach(p=>p.bond=clamp(p.bond-3));fx({happiness:2});return {msg:'You explained that you cannot fund every household need. It was uncomfortable, but the boundary was clear.'};}},
      {label:'Argue and leave the conversation',fx:()=>{parents().forEach(p=>p.bond=clamp(p.bond-9));fx({happiness:-3,social:-1});return {msg:'The argument escalated. Everyone went away frustrated.'};}}
    ]});
  }
  if(S.age>=18&&S.job&&S.degree&&Math.random()<.28){
    const d=S.degree, cfg={business:['Month-end reconciliation deadline','A customer balance does not agree with the ledger',['Reconcile the records and document the difference','Ask a senior colleague for a second review','Ignore it and hope nobody notices']],cs:['A production bug reaches the team','A release needs testing before the deadline',['Reproduce the issue and document the fix','Ask a teammate to pair with you','Push a rushed fix without full testing']],law:['A client deadline moves forward','A supervisor asks for a quick legal research note',['Review the evidence and cite the source','Ask for a short deadline extension','Send an incomplete note']],medicine:['A demanding clinical rotation','A patient handover is missing details',['Follow the handover process carefully','Ask the supervisor to verify the details','Rush to finish without checking']],biology:['A lab result looks inconsistent','Your research team needs a quality check',['Repeat the check and record the result','Ask a researcher to verify your method','Report the result without checking']]};
    const q=cfg[d]||cfg.business, choice=pick([0,1,2]);
    list.push({id:'p14-degree-job-'+S.age,title:q[0],text:`At work, ${q[1].toLowerCase()}. This is a chance to build trust—or create a problem that follows you into your next review.`,choices:[
      {label:q[2][0],fx:()=>{if(S.job){S.job.perf=clamp(S.job.perf+7);S.job.yearsWorkedWell=(S.job.yearsWorkedWell||0)+1;}fx({happiness:-1,smarts:2});return {msg:'You handled the task carefully. Your work record improved, but it took time and attention.'};}},
      {label:q[2][1],fx:()=>{if(S.job)S.job.perf=clamp(S.job.perf+3);fx({happiness:1,social:1});return {msg:'You asked for a review. The result was slower, but the risk of a preventable mistake fell.'};}},
      {label:q[2][2],fx:()=>{if(S.job)S.job.perf=clamp(S.job.perf-12);fx({happiness:1});return {msg:'You rushed it. Nothing may happen immediately, but you increased the risk of an error and weaker performance.'};}}
    ]});
  }
  if(S.age>=18&&S.job&&Math.random()<.17){
    list.push({id:'p14-degree-training-'+S.age,title:'A training course at work',text:`Your manager mentions a short certification related to ${MAJORS[S.degree]?.name||'your role'}. It costs money and time, and the benefit is not guaranteed.`,choices:[
      {label:'Pay for the course',cost:()=>Math.round(svc(450)),fx:()=>({wealth:-Math.round(svc(450)),smarts:3,happiness:-1,msg:'You completed the course. It strengthened your skills, although a promotion is not guaranteed.'})},
      {label:'Ask if the employer will sponsor it',fx:()=>{if(Math.random()<.45){fx({smarts:3,happiness:2});return {msg:'The employer covered the fee. You still need to apply the skills on the job.'};}return {happiness:-1,msg:'The company declined to fund the training this year.'};}},
      {label:'Postpone it',fx:{happiness:1},result:'You kept your money for bills and will reconsider when finances improve.'}
    ]});
  }
  return list;
};

/* 5) Post-study options: after legal permission runs out, returning home is
   one route; staying without status is a risky, non-guaranteed game path. */
function p14TriggerExpiryChoice(reason){
  if(!S||S.pending)return;
  S.evId='p14-overstay-choice';S.pending=true;activeTab='life';
  S.ev={title:'Your permission to stay has expired',text:`${reason} You have no confirmed legal route to remain right now. You can return voluntarily or choose to remain without valid immigration status. Remaining can mean exploitation, wage theft, restricted access to services, detention / removal risk and future visa problems; it is not a safe or reliable route.`,choices:[
    {label:'Return home and regroup',fx:()=>({happiness:-5,msg:'You chose to return before the situation became more precarious.'})},
    {label:'Stay without valid status',fx:()=>{S.undocumented=true;S.undocumentedYears=0;S.undocumentedWork=null;S.imm={stage:'irregular',left:0,yrs:0,tries:0};S.futureVisaPenalty=(S.futureVisaPenalty||0)+1;return {happiness:-8,msg:'You remained without valid status. You may seek cash-in-hand work, but your situation carries significant legal, financial and safety risks.'};}}
  ]};
  log('Your current immigration permission ended without a confirmed next status. You must choose how to respond before continuing.');render();
}
const P14_chooseBeforeStatusChoice=choose;
choose=function(i){
  const id=S&&S.evId;
  P14_chooseBeforeStatusChoice(i);
  if(!S||id!=='p14-overstay-choice')return;
  if(i===0){S.undocumented=false;leaveAbroad('You returned home after your legal stay ended. You avoided a prolonged overstay, but the study / migration attempt cost money and time.');}
  else {S.undocumented=true;if(S.imm)S.imm.stage='irregular';realismNotice('No valid immigration status','You chose to stay despite not having valid permission. The simulation will model precarious income, exploitation and removal risks; informal work does not make your stay lawful.');render();}
};
const P14_immYearBeforeIrregular=immYear;
immYear=function(){
  if(!S||S.country===S.home||!S.imm)return;
  if(S.pendingJobOffer&&['post','visa','work'].includes(S.imm.stage)){S.pendingJobOffer.years=(S.pendingJobOffer.years||0)+1;return;}
  const im=S.imm,c=C();
  if(im.stage==='irregular'||S.undocumented){
    S.undocumented=true;im.stage='irregular';im.yrs=(im.yrs||0)+1;S.undocumentedYears=(S.undocumentedYears||0)+1;
    const years=S.undocumentedYears;
    fx({happiness:-4,social:-2});
    if(S.undocumentedWork&&Math.random()<.18){S.undocumentedWageTheft=(S.undocumentedWageTheft||0)+1;log('The informal employer withheld some pay. Without a normal contract, recovering the money was difficult.');fx({happiness:-3});}
    if(Math.random()<.09){const cost=imp(250+rnd(650));S.wealth-=cost;S.expenses=(S.expenses||0)+cost;fx({health:-6,happiness:-3});log(`A workplace or housing problem caused an unexpected expense of ${money(cost)}. Your lack of stable status and employer protection made it harder to resolve.`);}
    const enforcementChance=Math.min(.28,.10+Math.max(0,years-1)*.035+(c.tier===1?.02:0));
    if(Math.random()<enforcementChance){
      log('An immigration-status check created a serious risk of removal. You did not have a valid permission to stay.');
      if(Math.random()<.48){S.undocumented=false;S.futureVisaPenalty=(S.futureVisaPenalty||0)+Math.max(1,years);leaveAbroad('Authorities required you to leave after an immigration-status check. The overstay may make future visas harder, and the informal work did not create legal residence.');return;}
      else{fx({happiness:-9});realismNotice('Immigration check','You were allowed to leave the immediate encounter, but your status remained unresolved. This does not legalise your stay; future checks and visa applications remain risky.');}
    }
    if(!S.undocumentedWork)log('You have no regular income while staying without valid status. Basic living costs still accumulate.');
    return;
  }
  if(im.stage==='post'&&!S.job){
    im.left=Math.max(0,(im.left||0)-1);
    if(im.left<=0){p14TriggerExpiryChoice(`You did not secure a qualifying job with a valid visa route in ${c.n} before your post-study window ended.`);}
    else if(im.left===1)log(`Your post-study permission has about one year left in ${c.n}. Start applications early; an offer and sponsorship process can take time.`);
    return;
  }
  if(im.stage==='visa'&&!S.job){
    im.nojob=(im.nojob||0)+1;
    if(im.nojob>=1)p14TriggerExpiryChoice(`The employer-sponsored work route did not proceed in ${c.n}.`);
    return;
  }
  if(im.stage==='gc'&&!S.job){
    im.nojob=(im.nojob||0)+1;
    if(im.nojob>=2){p14TriggerExpiryChoice(`You lost the job connected to your residence process in ${c.n}.`);return;}
  } else if(im.stage==='gc'&&S.job) im.nojob=0;
  if(im.stage==='visa'&&S.job){
    if(Math.random()<c.v){if(c.gc){im.stage='gc';im.left=c.gc+rnd(4);log(`Your work visa was approved. A residence process begins (${im.left} year(s) in this scenario).`);}else{im.stage='pr';im.left=c.nat;log(`You received permanent residence in ${c.n}. Citizenship eligibility is ${c.nat} years away in this simplified model.`);}fx({happiness:10});}
    else{im.tries=(im.tries||0)+1;fx({happiness:-6});log(`${c.n==='United States'?'Your visa lottery/application did not succeed':'Your work-visa application was refused'}. Employer willingness did not guarantee approval.`);if(im.tries>=(c.n==='United States'?3:2))p14TriggerExpiryChoice(`You ran out of work-visa attempts in ${c.n}.`);}
    return;
  }
  if(im.stage==='pr'&&im.left>0){im.left--;if(im.left===0)log('You may now check the current citizenship application requirements. Permanent residence is not citizenship.');return;}
  if(im.stage==='gc'){im.left=Math.max(0,(im.left||0)-1);if(im.left===0){im.stage='pr';im.left=c.nat;fx({happiness:12});log('Your residence process reached permanent-residence stage in this simplified scenario.');}return;}
  if(im.stage==='work'&&S.job){im.yrs=(im.yrs||0)+1;return;}
  if(im.stage==='student'){
    if(S.mast)return;
    if(S.mastDone){im.stage='post';im.left=c.win||2;return;}
  }
  return P14_immYearBeforeIrregular();
};
const P14_informalJobs={
  dish:{name:'Dishwashing / kitchen porter',base:14500,stress:4,desc:'Low-paid shifts, often unstable hours and limited protection.'},
  clean:{name:'Cleaning / warehouse shifts',base:15500,stress:4,desc:'Physically tiring shifts; pay and hours can vary.'},
  build:{name:'Construction labourer',base:18500,stress:6,desc:'Higher possible cash earnings but physical injury and wage-theft risks.'}
};
function p14ChooseInformalWork(id){
  if(!S||!S.undocumented||!S.imm||S.imm.stage!=='irregular')return hint('This survival-work option is only shown in the undocumented-status game path.');
  const role=P14_informalJobs[id];if(!role)return;
  S.undocumentedWork=id;S.job=null;S.remote=null;S.insured=false;
  log(`You took informal work as ${role.name}. Estimated cash income is low and unstable; there is no normal employer medical plan, paid leave, reliable contract or visa sponsorship.`);
  realismNotice('Informal survival work',`${role.desc} It may help with part of your basic costs, but it does not legalise your stay and can expose you to underpayment, injury and removal risks.`);hint();render();
}
function p14InformalWorkSection(){
  if(!S||!S.undocumented)return '';
  const c=C();
  const current=S.undocumentedWork?P14_informalJobs[S.undocumentedWork]:null;
  let workRows='';
  if(current){
    workRows = ROW('Current work',current.name)
      + ROW('Estimated gross cash income',money(Math.round(current.base*(.62+.38*(c.w||1))))+'/year')
      + ROW('Employer benefits','No reliable healthcare, paid leave, social insurance or visa sponsorship')
      + B('Stop informal work','You lose this unstable income; living costs continue.','p14ChooseInformalWorkStop()');
  } else {
    workRows = Object.entries(P14_informalJobs).map(([id,j])=>B(
      j.name,
      `${j.desc} Estimated gross cash income ${money(Math.round(j.base*(.62+.38*(c.w||1))))}/year before any short-pay, injury or unpaid shifts.`,
      `p14ChooseInformalWork('${id}')`
    )).join('');
  }
  let html=SEC(
    'Precarious survival work — no valid work status',
    PR('These are simplified, low-paid cash-work scenarios, not lawful immigration routes. Informal employers may underpay you; injury, housing insecurity, removal and future visa refusal remain possible.')
      + workRows
  );
  html += SEC(
    'Ways to reduce harm',
    PR('Consider legal aid, a qualified immigration adviser, your university international office or your consulate. Do not assume a cash job creates a lawful right to stay. You can choose to return voluntarily at any time.')
      + B('Return home voluntarily','You stop the overstay and restart your plans at home.','goHome()')
  );
  return html;
}
function p14ChooseInformalWorkStop(){S.undocumentedWork=null;log('You stopped informal work. Income ended, but your immigration status remains unresolved.');render();}
const P14_p10YearBeforeInformalPay=p10Year;
p10Year=function(){
  P14_p10YearBeforeInformalPay();
  if(!S||!S.undocumented||!S.imm||S.imm.stage!=='irregular'||!S.undocumentedWork)return;
  const job=P14_informalJobs[S.undocumentedWork];if(!job)return;
  const c=C(),base=Math.round(job.base*(.62+.38*(c.w||1)));
  const reliability=Math.random()<.16?.68:Math.random()<.08?0:1;
  const pay=Math.round(base*reliability);
  S.income=(S.income||0)+pay;S.wealth+=pay;S.expenses=S.expenses||0;
  if(reliability<1){fx({happiness:-2});log(reliability===0?`${job.name}: the employer failed to pay this year's cash wages.`:`${job.name}: you received only part of the expected cash wages.`);}
  else log(`${job.name}: you earned ${money(pay)} before basic costs. There was no formal benefit package or visa sponsorship.`);
};
const P14_statusViewBefore=viewWorld;
viewWorld=function(){
  let html=P14_statusViewBefore();
  if(S&&S.undocumented&&S.imm&&S.imm.stage==='irregular') html+=p14InformalWorkSection();
  return html;
};

/* Add explicit exchange-rate context to each completed-year popup and top HUD.
   Keep a single rendered panel if other wrappers re-render the header. */
const P14_renderBeforeFinalPanel=render;
render=function(){
  if(S){ S.dead=false; S.funeralNotice=null; if(Array.isArray(S.family)) S.family.forEach(m=>{if(m)m.alive=true;}); }
  const out=P14_renderBeforeFinalPanel();
  if(S&&S.home==='egy'){
    const top=$('top');if(top&&!top.querySelector('#p14-fx-panel'))top.insertAdjacentHTML('beforeend',p14RatePanel());
  }
  try{p14ShowParentRequestModal();}catch(e){}
  return out;
};

/* The final render wrapper above guards the modal; ensure dismissal redraws it. */
const P14_dismissPopupOriginal=p12DismissYearPopup;
p12DismissYearPopup=function(){P14_dismissPopupOriginal();render();};



/* 6) Keep all Egypt-local prices in nominal EGP before converting to the
   game's USD-equivalent ledger. This avoids multiplying local prices by the
   exchange rate twice, and keeps Egyptian wages separate from inflation. */
function p14EgyptLocalToInternal(localBase2026, year=gameYear()){
  return localCurrencyInternal(Math.max(0,Number(localBase2026)||0)*p14EgyptPriceIndex(year),'egy',year);
}
function p14EgyptUtilityLocal2026(input){
  const h=input||{}, own=h.own||null, cat=h.cat||h;
  const id=String(own?.typeId||own?.catId||cat?.id||h?.id||'').toLowerCase();
  const name=String(own?.name||cat?.name||h?.name||'').toLowerCase();
  if(id==='room'||name.includes('shared room')) return 9000;
  if(id==='studio'||name.includes('studio')) return 14000;
  if(id==='apt2'||name.includes('2-bedroom')) return 24000;
  if(id==='oldflat') return 20000;
  if(id==='modernflat') return 28000;
  if(id==='condo') return 36000;
  if(id==='townhouse') return 42000;
  if(id==='villa'||name.includes('villa')) return 72000;
  if(id==='penthouse'||name.includes('penthouse')) return 50000;
  if(id==='mansion'||name.includes('mansion')) return 110000;
  if(own&&own.p12){
    const type=String(own.typeId||'').toLowerCase();
    if(type==='villa') return 72000;
    if(type==='penthouse') return 50000;
    if(type==='mansion') return 110000;
    if(type==='townhouse') return 42000;
    if(type==='condo') return 36000;
    if(type==='modernflat') return 28000;
    if(type==='oldflat') return 20000;
    return 36000;
  }
  return 24000;
}
function p14EgyptUtilityCost(input){return p14EgyptLocalToInternal(p14EgyptUtilityLocal2026(input));}
const P14_rentCostBeforeNominalEGP=rentCost;
rentCost=function(h){
  if(S&&S.country==='egy'&&h&&['room','studio','apt2'].includes(h.id)){
    const base={room:30000,studio:54000,apt2:96000}[h.id];
    return p14EgyptLocalToInternal(base);
  }
  return P14_rentCostBeforeNominalEGP(h);
};
function p14ReconcileEgyptAdultCosts(){
  if(!S||S.country!=='egy'||S.age<18||!S.bill||typeof S.bill!=='object')return false;
  const y=gameYear(), f=S.housing==='parents'?.4:1, food={cheap:24000,mid:54000,lux:120000}[S.food||'mid']||54000;
  const replacements={
    groceries:p14EgyptLocalToInternal(food*f,y),
    phone:p14EgyptLocalToInternal(4800,y),
    transport:p14EgyptLocalToInternal(S.transport==='car'?100000:8000,y),
    insurance:S.insured?p14EgyptLocalToInternal(30000,y):null,
    familyContribution:S.housing==='parents'&&S.famWealth<1?p14EgyptLocalToInternal(18000,y):null
  };
  const hi=homeInfo();
  if(hi&&Object.prototype.hasOwnProperty.call(S.bill,'utilities'))replacements.utilities=p14EgyptUtilityCost(hi);
  let delta=0;
  for(const [key,value] of Object.entries(replacements)){
    if(value==null||!Object.prototype.hasOwnProperty.call(S.bill,key))continue;
    const old=Number(S.bill[key])||0, next=Math.round(value);
    delta+=next-old;S.bill[key]=next;
  }
  if(delta){
    S.expenses=Math.max(0,(Number(S.expenses)||0)+delta);
    S.wealth-=delta;
    if(S.yearPopup)S.yearPopup.expenses=Math.max(0,(Number(S.yearPopup.expenses)||0)+delta);
    if(S.yearPopup)S.yearPopup.note=(S.yearPopup.note||'')+'\n\nEgypt household costs were restated using local EGP consumer-price estimates for '+y+'; salary growth is modelled separately and may not keep pace with prices.';
    log(`Egypt household costs were recalculated using the ${y} local price level. Food, phone, transport, utilities and insurance do not rise at the same rate as wages.`);
    return true;
  }
  return false;
}
const P14_ageUpBeforeEgyptLedger=ageUp;
ageUp=function(){
  const priorAge=S&&S.age;
  P14_ageUpBeforeEgyptLedger();
  if(S&&priorAge!==S.age&&p14ReconcileEgyptAdultCosts())render();
};

/* ================= PHASE 15 — MERGED USER JOB-MARKET IDEAS =================
   Adds degree-specific career options inspired by the attached version's
   employer roster and dynamic vacancy plan. Remote offers now replace the
   main employment record; no second full-time salary is stacked on top. */

/* Employer-name ideas from the supplied version, mixed into the existing
   rotating fictional market. The vacancies remain simulated, not live ads.
   EXPANDED: real Egyptian conglomerates, banks, telecoms, law firms and
   professional-services employers added from public market data. */
const P15_EGY_EMPLOYERS = [
  'Vodafone Egypt Shared Services','Commercial International Bank','National Bank of Egypt',
  'Dar Al-Handasah Project Services','Cleopatra Healthcare Network','Mansour Retail & Automotive',
  'Bosta Logistics Technology','Eva Pharma Operations','Orascom Project Services',
  'Delta Contracts & Compliance','NileBridge Legal Research','Sphinx Legal Partners',
  'Fawry Digital Services','Pyramid Data Solutions','Canal Audit & Tax Services',
  /* Expanded real Egyptian employers */
  'Orascom Construction','Hassan Allam Holding','Emaar Misr','Talaat Moustafa Group',
  'Suez Canal Authority','Egyptian Electricity Holding Company','Egyptian General Petroleum Corporation',
  'Egyptian National Railways','Orange Egypt','Etisalat Egypt','Telecom Egypt',
  'Raya Information Technology','Mansour Group','Egyptian Petrochemicals Company (EPCC)',
  'Abou Kir Fertilizers','Alexandria Pharmaceuticals','Ibnsina Pharma','Delta Construction & Rebuilding',
  'Global Telecom Holding','Al Baraka Bank Egypt','Abu Dhabi Islamic Bank Egypt',
  'QNB Egypt','Faisal Islamic Bank of Egypt','Arab Banking Corporation Egypt',
  'Banque Misr','Banque du Caire','Export Development Bank of Egypt',
  'Matouk Bassiouny & Hennawy','Shalakany Law Office','Zulficar & Partners',
  'Sharkawy & Sarhan','Baker McKenzie Cairo','Zaki Hashem & Partners',
  'Helmy Hamza & Partners (Baker McKenzie Egypt)','Al Kamel Law','Sarie-Eldin & Partners',
  'Ibrachy Legal Consultancy','ADSERO – Ragy Soliman & Partners','Shahid Law Firm',
  'Mazghouny & Co','MHR & Partners in association with White & Case','Kosheri, Rashed & Riad',
  'Deloitte Egypt','PwC Egypt','EY Egypt','KPMG Egypt','Grant Thornton Egypt',
  'Dentons Egypt','Clyde & Co Egypt','Al Tamimi & Company Egypt',
  'Allianz Egypt','AXA Egypt','MetLife Egypt','Misr Insurance',
  'Dell Technologies Egypt','Oracle Egypt','Siemens Egypt','Schneider Electric Egypt',
  'Valeo Egypt','Motorola Solutions Egypt','Procter & Gamble Egypt','Unilever Egypt',
  'Nestlé Egypt','PepsiCo Egypt','Coca-Cola Egypt','Heineken Egypt',
  'Noon Egypt','Amazon Egypt','Jumia Egypt','Talabat Egypt',
  'Thndr','Paymob','MNT-Halan','Fawry',
  'EFG Hermes','CI Capital','Beltone Financial','HC Securities',
  'Elsewedy Electric','Elsewedy Industrial Development','SODIC','Palm Hills Developments',
  'Orascom Development Egypt','Madinet Nasr Housing','Heliopolis Housing'
];
P15_EGY_EMPLOYERS.forEach(n=>{if(typeof P12_EGY_BRANDS!=='undefined'&&!P12_EGY_BRANDS.includes(n))P12_EGY_BRANDS.push(n);});
const P15_GLOBAL_PREFIX={usa:'Northstar',gbr:'Westbridge',can:'Maple',deu:'Rhein',fra:'Lumière',ita:'Milano',nld:'Canal',aus:'Southern Cross',nzl:'Koru',uae:'Gulf Crescent',sau:'Riyadh',ind:'Deccan',pak:'Indus',nga:'Atlantic',bra:'Verde',tur:'Anatolia',jpn:'Sakura',kor:'Han River',sgp:'Lion City',egy:'NileBridge'};

/* Real law-firm names for Egypt, organised by practice group. Expanded from
   public legal-directory rankings (Chambers, IFLR1000, ZoomInfo). */
const P15_EGY_LAW_FIRMS = {
  corporate:['Matouk Bassiouny & Hennawy','Shalakany Law Office','Zulficar & Partners','Sharkawy & Sarhan','Baker McKenzie Cairo','Zaki Hashem & Partners','Helmy Hamza & Partners (Baker McKenzie Egypt)','Al Kamel Law','Sarie-Eldin & Partners','Ibrachy Legal Consultancy','ADSERO – Ragy Soliman & Partners','Shahid Law Firm','Mazghouny & Co','MHR & Partners in association with White & Case','Kosheri, Rashed & Riad','Dentons Egypt','Clyde & Co Egypt','Al Tamimi & Company Egypt','Almogy Law Firm','TK Law Firm','Alliance Law Firm','Barakat Law Firm','GLA & Company','Riad & Riad Law Firm'],
  projects:['Matouk Bassiouny & Hennawy','Sharkawy & Sarhan','Baker McKenzie Cairo','Zaki Hashem & Partners','Mazghouny & Co','MHR & Partners in association with White & Case','ADSERO – Ragy Soliman & Partners','Shalakany Law Office','Zulficar & Partners'],
  finance:['Matouk Bassiouny & Hennawy','Sharkawy & Sarhan','Zulficar & Partners','Shalakany Law Office','Baker McKenzie Cairo','Helmy Hamza & Partners (Baker McKenzie Egypt)','Al Kamel Law','MHR & Partners in association with White & Case'],
  disputes:['Shalakany Law Office','Matouk Bassiouny & Hennawy','Zulficar & Partners','Sharkawy & Sarhan','Baker McKenzie Cairo','ADSERO – Ragy Soliman & Partners','Shahid Law Firm','Ibrachy Legal Consultancy']
};

function p15LocalEmployer(country,suffix,index){
  if(country==='egy'){
    const egyptNames={
      legal:P15_EGY_LAW_FIRMS.corporate,
      finance:['Delta Audit & Tax','Alexandria Commercial Bank','Crescent KYC & Regulatory','Nile Finance Operations','Canal Insurance Claims','Commercial International Bank','National Bank of Egypt','QNB Egypt','Banque Misr','Banque du Caire','EFG Hermes','CI Capital','Beltone Financial','HC Securities','Deloitte Egypt','PwC Egypt','EY Egypt','KPMG Egypt','Grant Thornton Egypt'],
      tech:['Pyramid Digital Solutions','Nile Data Systems','Delta Software Services','Alexandria Analytics Lab','Fawry Digital Services','Raya Information Technology','Thndr','Paymob','MNT-Halan','Vodafone Egypt Shared Services','Orange Egypt','Etisalat Egypt','Telecom Egypt'],
      medical:['Nile Clinical Services','Cleopatra Healthcare Network','Mediterranean Medical Group','Allianz Egypt','AXA Egypt','MetLife Egypt','Misr Insurance'],
      bio:['Eva Pharma Quality Labs','Delta Clinical Research','Nile Scientific Services','Alexandria Pharmaceuticals','Ibnsina Pharma','Egyptian Petrochemicals Company (EPCC)','Abou Kir Fertilizers']
    };
    const arr=egyptNames[suffix]||egyptNames.legal;return arr[index%arr.length];
  }
  if(country==='uae'){
    const uaeNames={
      legal:['A&O Shearman UAE','White & Case UAE','Clyde & Co Abu Dhabi','Al Tamimi & Company UAE','Stephenson Harwood Dubai','Pinsent Masons Dubai','Covington & Burling Dubai','Akin UAE','Freshfields Bruckhaus Deringer UAE'],
      finance:['Emirates NBD','First Abu Dhabi Bank','Abu Dhabi Commercial Bank','Dubai Islamic Bank','Mashreq Bank','HSBC UAE','Standard Chartered UAE','Citi UAE','JLL UAE','Al-Futtaim Group','ALEC Holdings'],
      tech:['Careem','Talabat','Noon UAE','Property Finder','Bayut','Dubizzle','Yalla Group','Anghami'],
      medical:['NMC Healthcare','Aster DM Healthcare','Mediclinic Middle East','Pure Health','Abu Dhabi Health Services (SEHA)'],
      bio:['Julphar','Hikma Pharmaceuticals UAE','Neopharma','Gulf Pharmaceutical Industries']
    };
    const arr=uaeNames[suffix]||uaeNames.legal;return arr[index%arr.length];
  }
  if(country==='sau'){
    const sauNames={
      legal:['Freshfields Bruckhaus Deringer Riyadh','White & Case Riyadh','Latham & Watkins Riyadh','Clifford Chance Riyadh','Baker McKenzie Riyadh','Al Tamimi & Company Riyadh','GLA & Company KSA','Riyan Almogbel & Partners','Abdulaziz Bin Ali Law Firm','Binali Lawfirm','Kosheri, Rashed & Riad KSA'],
      finance:['Al Rajhi Bank','Saudi National Bank','Riyad Bank','SABB','Banque Saudi Fransi','Arab National Bank','Tamara','STC Pay','Saudi Awwal Bank','Lucid Motors Middle East','Nahdi Medical Co.','Bupa Arabia'],
      tech:['Tamara','STC','Mobily','Zain KSA','Jahez','HungerStation','Nana','Careem KSA','Noon KSA'],
      medical:['Bupa Arabia','Nahdi Medical Co.','Dr. Sulaiman Al Habib','Mouwasat Medical Services','Al Hammadi Holding'],
      bio:['Jamjoom Pharma','Tabuk Pharmaceuticals','SPIMACO','Saudi Pharmaceutical Industries']
    };
    const arr=sauNames[suffix]||sauNames.legal;return arr[index%arr.length];
  }
  const prefix=P15_GLOBAL_PREFIX[country]||'Meridian';
  return `${prefix} ${suffix}`;
}

/* EXPANDED degree-specific job boards.
   New law, business, CS, medicine and biology titles are appended after the
   original 12 / 9 / 6 / 4 / 5 entries. Each new job uses a unique id, keeps the
   same factor / smarts / eng / leave / remote schema, and declares degrees so
   the joint-eligibility logic in P15/P18/P19 works without changes. */
const P15_DEGREE_JOBS={
 law:[
  /* Original 12 law roles — unchanged */
  {id:'law-trainee',trackId:'law',group:'legal',roleTitle:'Graduate Legal Trainee',titles:['Graduate Legal Trainee','Junior Legal Associate','Legal Associate','Senior Legal Associate','Legal Team Lead'],factor:.66,degree:'law',smarts:38,eng:22,minExp:0,medical:false,social:true,bonus:0,leave:14,remote:'On-site',hours:44,stress:4,contract:'Paid trainee / entry-level contract',desc:'Research, document preparation, case files and supervised legal work. Newly qualified graduates normally start with supervised tasks.',sponsorChance:.15},
  {id:'law-assistant',trackId:'law',group:'legal',roleTitle:'Legal Assistant / Paralegal',titles:['Legal Assistant','Paralegal','Senior Paralegal','Paralegal Team Lead','Legal Operations Manager'],factor:.72,degree:'law',smarts:38,eng:25,minExp:0,medical:false,social:true,bonus:.01,leave:14,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent or 1-year contract',desc:'File preparation, court schedules, document checks, client follow-up and research support.',sponsorChance:.16},
  {id:'law-litigation',trackId:'law',group:'legal',roleTitle:'Litigation & Disputes Assistant',titles:['Disputes Assistant','Junior Litigation Associate','Litigation Associate','Senior Disputes Associate','Disputes Team Lead'],factor:.78,degree:'law',smarts:42,eng:28,minExp:0,medical:false,social:true,bonus:.02,leave:15,remote:'On-site / hybrid by team',hours:45,stress:5,contract:'Permanent; court deadlines can require overtime',desc:'Prepare case bundles, track hearings, organise evidence and assist lawyers with litigation deadlines.',sponsorChance:.15},
  {id:'law-research',trackId:'law',group:'legal',roleTitle:'Legal Researcher',titles:['Junior Legal Researcher','Legal Researcher','Senior Legal Researcher','Research Lead','Legal Knowledge Manager'],factor:.81,degree:'law',smarts:48,eng:35,minExp:0,medical:false,social:true,bonus:.02,leave:18,remote:'Hybrid where available',hours:40,stress:4,contract:'Permanent or project-funded',desc:'Research statutes, regulations and case law; summarise findings for lawyers and business teams.',sponsorChance:.20},
  {id:'law-contracts',trackId:'law',group:'legal',roleTitle:'Contracts Administrator',titles:['Contracts Assistant','Contracts Administrator','Senior Contracts Specialist','Contracts Manager','Head of Commercial Contracts'],factor:.90,degree:'law',degrees:['law','business'],smarts:44,eng:34,minExp:0,medical:true,social:true,bonus:.03,leave:18,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Review standard clauses, manage renewals, track signatures and flag issues for legal review. Law or business graduates may qualify.',sponsorChance:.24},
  {id:'law-compliance',trackId:'finance',group:'finance',roleTitle:'Compliance Analyst',titles:['Compliance Assistant','Compliance Analyst','Senior Compliance Analyst','Compliance Manager','Head of Compliance'],factor:.88,degree:'law',degrees:['law','business'],smarts:48,eng:38,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent; regulated-sector controls',desc:'Support policy controls, regulatory checks, audit evidence and compliance reporting. A law degree is relevant, but employers also hire suitable business graduates.',sponsorChance:.30},
  {id:'law-aml',trackId:'finance',group:'finance',roleTitle:'KYC / AML Analyst',titles:['KYC Associate','AML / KYC Analyst','Senior AML Analyst','Financial Crime Team Lead','Financial Crime Manager'],factor:.91,degree:'law',degrees:['law','business'],smarts:46,eng:40,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid by employer',hours:42,stress:5,contract:'Bank / fintech employment',desc:'Review customer files, identify missing documents, escalate suspicious patterns and maintain regulatory records.',sponsorChance:.34},
  {id:'law-insurance',trackId:'law',group:'legal',roleTitle:'Insurance Claims & Policy Specialist',titles:['Claims Assistant','Claims & Policy Specialist','Senior Claims Specialist','Claims Team Lead','Claims Operations Manager'],factor:.86,degree:'law',degrees:['law','business'],smarts:40,eng:30,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'Hybrid / office',hours:42,stress:4,contract:'Permanent',desc:'Interpret policy wording, organise claim evidence and coordinate disputes with customers and insurers.',sponsorChance:.20},
  {id:'law-inhouse',trackId:'law',group:'legal',roleTitle:'Junior In-house Legal Associate',titles:['Junior Legal Associate','Corporate Legal Associate','Senior Corporate Counsel','Legal Manager','General Counsel'],factor:1.05,degree:'law',smarts:58,eng:48,minExp:1,medical:true,social:true,bonus:.07,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent corporate role',desc:'Support commercial contracts, legal risk registers, internal advice and business stakeholders. Usually more competitive than trainee positions.',sponsorChance:.30},
  {id:'law-public',trackId:'law',group:'legal',roleTitle:'Public-Sector Legal Research Clerk',titles:['Legal Administration Clerk','Legal Research Clerk','Senior Legal Research Officer','Legal Section Supervisor','Legal Administration Manager'],factor:.70,degree:'law',smarts:40,eng:18,minExp:0,medical:false,social:true,bonus:0,leave:21,remote:'On-site',hours:40,stress:3,contract:'Public-sector exam / fixed recruitment cycle',desc:'Administrative legal support and records. Recruitment may require a public examination, local eligibility or a long hiring cycle.',sponsorChance:.01},
  {id:'law-legalops',trackId:'law',group:'legal',roleTitle:'Legal Operations & Document Review Analyst',titles:['Document Review Assistant','Legal Operations Analyst','Senior Document Review Analyst','Legal Operations Lead','Legal Operations Manager'],factor:.93,degree:'law',smarts:48,eng:52,minExp:0,medical:true,social:true,bonus:.04,leave:20,remote:'Hybrid; remote by project',hours:40,stress:4,contract:'Permanent or project contract',desc:'Organise contract repositories, review document sets, maintain legal trackers and support process improvement.',sponsorChance:.28},
  {id:'law-ip',trackId:'law',group:'legal',roleTitle:'Intellectual Property Assistant',titles:['IP Assistant','Trademark / IP Associate','Senior IP Associate','IP Portfolio Manager','IP Practice Lead'],factor:.95,degree:'law',smarts:50,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent; specialist training helpful',desc:'Support trademark filings, brand protection, licensing and intellectual-property documentation.',sponsorChance:.23},
  /* Expanded real-role additions */
  {id:'law-corporate-ma',trackId:'law',group:'legal',roleTitle:'Corporate / M&A Junior Associate',titles:['M&A Trainee','Corporate Associate','Senior Corporate Associate','M&A Counsel','Head of Corporate'],factor:.96,degree:'law',degrees:['law','business'],smarts:56,eng:48,minExp:0,medical:true,social:true,bonus:.06,leave:21,remote:'Hybrid',hours:44,stress:5,contract:'Permanent; deal cycles can require overtime',desc:'Support due diligence, transaction documents, completion mechanics and corporate approvals. Firms such as Matouk Bassiouny, Zulficar & Partners and Sharkawy & Sarhan hire junior corporate associates from strong LLB programmes.',sponsorChance:.26},
  {id:'law-project-finance',trackId:'law',group:'legal',roleTitle:'Project Finance / Energy Associate',titles:['Projects Trainee','Project Finance Associate','Senior Projects Associate','Projects Counsel','Head of Projects'],factor:1.02,degree:'law',smarts:58,eng:50,minExp:0,medical:true,social:true,bonus:.06,leave:21,remote:'Hybrid',hours:44,stress:5,contract:'Permanent; infrastructure and energy mandates',desc:'Review facility agreements, security packages, EPC contracts and regulatory approvals. Energy and infrastructure practices at Baker McKenzie Cairo, Matouk Bassiouny and Sharkawy & Sarhan regularly recruit junior lawyers.',sponsorChance:.24},
  {id:'law-international-arbitration',trackId:'law',group:'legal',roleTitle:'International Arbitration Assistant',titles:['Arbitration Assistant','Junior Arbitration Associate','Arbitration Associate','Senior Arbitration Counsel','Head of Arbitration'],factor:1.00,degree:'law',degrees:['law','business'],smarts:60,eng:55,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:44,stress:5,contract:'Permanent; bilingual drafting expected',desc:'Prepare submissions, chronologies, exhibit bundles and hearing logistics for commercial and investment arbitrations. Cairo and Dubai practices frequently recruit bilingual junior lawyers.',sponsorChance:.28},
  {id:'law-banking-finance',trackId:'law',group:'legal',roleTitle:'Banking & Finance Junior Associate',titles:['Finance Trainee','Banking & Finance Associate','Senior Finance Associate','Finance Counsel','Head of Finance Legal'],factor:.98,degree:'law',degrees:['law','business'],smarts:54,eng:46,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:44,stress:5,contract:'Permanent; lender-side and borrower-side work',desc:'Support secured lending, syndicated facilities, security registrations and regulatory filings. Egyptian banks and international firms with Cairo desks regularly hire junior finance lawyers.',sponsorChance:.27},
  {id:'law-employment',trackId:'law',group:'legal',roleTitle:'Employment & Labour Law Associate',titles:['Employment Trainee','Employment Associate','Senior Employment Associate','Employment Counsel','Head of Employment'],factor:.90,degree:'law',smarts:48,eng:40,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:42,stress:4,contract:'Permanent; advisory and disputes mix',desc:'Advise on hiring, termination, social insurance, workplace investigations and labour disputes. Demand is steady across Egyptian and multinational employers.',sponsorChance:.22},
  {id:'law-data-privacy',trackId:'law',group:'legal',roleTitle:'Data Protection & Privacy Analyst',titles:['Privacy Assistant','Data Protection Analyst','Senior Privacy Analyst','Privacy Counsel','Head of Privacy'],factor:.94,degree:'law',degrees:['law','business','cs'],smarts:52,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid / remote by employer',hours:40,stress:4,contract:'Permanent; regulatory-compliance focus',desc:'Map data flows, review consent language, respond to subject-access requests and support Egypt Personal Data Protection Law compliance. Growing demand at banks, fintechs and multinationals.',sponsorChance:.30},
  {id:'law-competition',trackId:'law',group:'legal',roleTitle:'Competition / Antitrust Analyst',titles:['Competition Assistant','Competition Analyst','Senior Competition Analyst','Competition Counsel','Head of Competition'],factor:.96,degree:'law',degrees:['law','business'],smarts:56,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent; merger-control and compliance work',desc:'Support merger notifications, market investigations, cartel-compliance training and regulatory submissions to the Egyptian Competition Authority.',sponsorChance:.23},
  {id:'law-real-estate',trackId:'law',group:'legal',roleTitle:'Real Estate & Construction Lawyer',titles:['Real Estate Trainee','Real Estate Associate','Senior Real Estate Associate','Real Estate Counsel','Head of Real Estate Legal'],factor:.94,degree:'law',degrees:['law','business'],smarts:50,eng:40,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid / site visits',hours:42,stress:4,contract:'Permanent; developers and contractors',desc:'Review sale agreements, construction contracts, title documents and landlord-tenant matters. Employers include Talaat Moustafa Group, Emaar Misr, SODIC and their external counsel.',sponsorChance:.22},
  {id:'law-white-collar',trackId:'law',group:'legal',roleTitle:'White-Collar / Investigations Associate',titles:['Investigations Assistant','White-Collar Associate','Senior Investigations Associate','Investigations Counsel','Head of Investigations'],factor:1.01,degree:'law',degrees:['law','business'],smarts:58,eng:52,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:44,stress:6,contract:'Permanent; sensitive and deadline-driven',desc:'Support internal investigations, compliance reviews and regulatory responses. Firms with disputes and regulatory practices hire junior lawyers with strong research and writing skills.',sponsorChance:.24},
  {id:'law-maritime',trackId:'law',group:'legal',roleTitle:'Maritime & Shipping Legal Assistant',titles:['Shipping Assistant','Maritime Associate','Senior Maritime Associate','Maritime Counsel','Head of Maritime'],factor:.92,degree:'law',degrees:['law','business'],smarts:46,eng:42,minExp:0,medical:true,social:true,bonus:.03,leave:20,remote:'On-site / hybrid',hours:42,stress:4,contract:'Permanent; Suez Canal and port matters',desc:'Support cargo claims, charterparty disputes, vessel arrests and port regulatory issues. Egypt’s Suez Canal and Mediterranean ports create steady demand for maritime legal support.',sponsorChance:.18}
 ],
 business:[
  /* Original 9 business roles — unchanged */
  {id:'biz-junior-accountant',trackId:'finance',group:'finance',roleTitle:'Junior Accountant',titles:['Junior Accountant','Accountant','Senior Accountant','Accounting Supervisor','Accounting Manager'],factor:.82,degree:'business',smarts:34,eng:20,minExp:0,medical:false,social:true,bonus:.02,leave:14,remote:'On-site',hours:42,stress:4,contract:'Permanent / probation period',desc:'Invoices, journal entries, account reconciliations, receivables and month-end support.',sponsorChance:.12},
  {id:'biz-audit',trackId:'finance',group:'finance',roleTitle:'Audit Associate',titles:['Audit Trainee','Audit Associate','Senior Auditor','Audit Manager','Audit Partner'],factor:.93,degree:'business',smarts:48,eng:38,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Office / client site',hours:48,stress:6,contract:'Permanent; busy-season overtime',desc:'Testing, workpapers, financial statements and client evidence. Busy season can mean long days.',sponsorChance:.22},
  {id:'biz-ap-ar',trackId:'finance',group:'finance',roleTitle:'Accounts Payable / Receivable Specialist',titles:['AR/AP Assistant','AR/AP Accountant','Senior AR/AP Accountant','Receivables Manager','Finance Operations Lead'],factor:.86,degree:'business',smarts:36,eng:24,minExp:0,medical:false,social:true,bonus:.02,leave:14,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent or 1-year contract',desc:'Customer/vendor balances, invoice matching, payment allocation and overdue follow-up.',sponsorChance:.14},
  {id:'biz-banking',trackId:'finance',group:'finance',roleTitle:'Banking Operations Officer',titles:['Operations Assistant','Banking Operations Officer','Senior Operations Officer','Operations Manager','Branch Operations Head'],factor:1.00,degree:'business',smarts:42,eng:35,minExp:0,medical:true,social:true,bonus:.07,leave:21,remote:'On-site',hours:40,stress:4,contract:'Permanent; screening and references',desc:'Account servicing, documents, transaction controls and operational-risk checks.',sponsorChance:.24},
  {id:'biz-tax',trackId:'finance',group:'finance',roleTitle:'Tax & Payroll Assistant',titles:['Tax Assistant','Tax / Payroll Accountant','Senior Tax Analyst','Tax Manager','Head of Tax'],factor:.88,degree:'business',smarts:44,eng:32,minExp:0,medical:false,social:true,bonus:.03,leave:15,remote:'Hybrid by employer',hours:42,stress:5,contract:'Permanent; deadlines around filings',desc:'Payroll records, tax workpapers, supporting schedules and returns under supervision.',sponsorChance:.18},
  {id:'biz-finops',trackId:'finance',group:'finance',roleTitle:'Finance Operations Analyst',titles:['Finance Operations Assistant','Finance Operations Analyst','Senior Finance Analyst','Finance Operations Manager','Finance Director'],factor:.94,degree:'business',smarts:45,eng:35,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'Hybrid',hours:42,stress:4,contract:'Permanent',desc:'Reconciliations, payment exceptions, expense reviews, monthly reporting and control checks.',sponsorChance:.22},
  {id:'biz-fpa',trackId:'finance',group:'finance',roleTitle:'FP&A / Budget Analyst',titles:['Budget Assistant','FP&A Analyst','Senior FP&A Analyst','FP&A Manager','Head of Planning'],factor:1.13,degree:'business',smarts:57,eng:48,minExp:1,medical:true,social:true,bonus:.08,leave:21,remote:'Hybrid',hours:43,stress:5,contract:'Permanent; forecast cycles',desc:'Budgeting, variance analysis, forecasts and management reporting. Usually expects strong Excel and some experience.',sponsorChance:.28},
  {id:'biz-risk',trackId:'finance',group:'finance',roleTitle:'Risk / Internal Controls Analyst',titles:['Controls Assistant','Risk & Controls Analyst','Senior Risk Analyst','Risk Manager','Head of Risk'],factor:1.02,degree:'business',smarts:52,eng:42,minExp:0,medical:true,social:true,bonus:.06,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent; control-heavy work',desc:'Test controls, investigate exceptions, update risk registers and prepare evidence for audit.',sponsorChance:.28},
  {id:'biz-procurement',trackId:'entry',group:'finance',roleTitle:'Procurement & Vendor Analyst',titles:['Procurement Assistant','Vendor Analyst','Senior Procurement Analyst','Procurement Manager','Supply Chain Director'],factor:.91,degree:'business',smarts:40,eng:30,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'On-site / hybrid',hours:42,stress:4,contract:'Permanent',desc:'Compare vendor quotations, verify purchase orders and track delivery and payment terms.',sponsorChance:.20},
  /* Expanded business roles */
  {id:'biz-investment-banking-analyst',trackId:'finance',group:'finance',roleTitle:'Investment Banking Analyst',titles:['IB Analyst','Investment Banking Analyst','Senior IB Analyst','VP Investment Banking','Managing Director'],factor:1.35,degree:'business',degrees:['business','law'],smarts:65,eng:55,minExp:0,medical:true,social:true,bonus:.12,leave:21,remote:'On-site',hours:65,stress:8,contract:'Permanent; deal-cycle intensity',desc:'Build models, prepare pitch books, conduct due diligence and support live transactions. Employers include EFG Hermes, CI Capital, Beltone Financial and regional banks.',sponsorChance:.30},
  {id:'biz-private-equity-analyst',trackId:'finance',group:'finance',roleTitle:'Private Equity / Investment Analyst',titles:['PE Analyst','Investment Analyst','Senior Investment Analyst','Investment Manager','Partner'],factor:1.28,degree:'business',degrees:['business','law'],smarts:62,eng:50,minExp:0,medical:true,social:true,bonus:.10,leave:21,remote:'Hybrid',hours:55,stress:7,contract:'Permanent; portfolio and deal work',desc:'Screen opportunities, build valuation models, support due diligence and monitor portfolio companies. Regional PE and VC funds recruit strong finance graduates.',sponsorChance:.28},
  {id:'biz-credit-analyst',trackId:'finance',group:'finance',roleTitle:'Credit Analyst',titles:['Credit Assistant','Credit Analyst','Senior Credit Analyst','Credit Manager','Head of Credit'],factor:.98,degree:'business',smarts:50,eng:38,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid / on-site',hours:42,stress:4,contract:'Permanent; bank credit function',desc:'Assess corporate and retail creditworthiness, prepare credit memos, monitor exposures and recommend limits. Egyptian banks such as CIB, NBE and QNB regularly hire credit analysts.',sponsorChance:.24},
  {id:'biz-treasury-analyst',trackId:'finance',group:'finance',roleTitle:'Treasury Analyst',titles:['Treasury Assistant','Treasury Analyst','Senior Treasury Analyst','Treasury Manager','Group Treasurer'],factor:1.02,degree:'business',smarts:52,eng:40,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:42,stress:4,contract:'Permanent; liquidity and FX exposure',desc:'Manage cash positions, FX exposures, bank relationships and funding schedules. Relevant at banks, corporates and multinationals with Egyptian operations.',sponsorChance:.24},
  {id:'biz-esg-sustainability-analyst',trackId:'finance',group:'finance',roleTitle:'ESG / Sustainability Analyst',titles:['ESG Assistant','ESG Analyst','Senior ESG Analyst','ESG Manager','Head of Sustainability'],factor:1.00,degree:'business',degrees:['business','biology','law'],smarts:52,eng:45,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:42,stress:4,contract:'Permanent; reporting and disclosure',desc:'Collect ESG data, support sustainability reporting, assess climate risks and respond to investor questionnaires. Demand is rising across banks, developers and exporters.',sponsorChance:.26},
  {id:'biz-fintech-product-ops',trackId:'finance',group:'finance',roleTitle:'Fintech Product Operations Analyst',titles:['Product Ops Assistant','Fintech Product Ops Analyst','Senior Product Ops Analyst','Product Ops Lead','Head of Product Ops'],factor:1.05,degree:'business',degrees:['business','cs'],smarts:50,eng:42,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid / remote by team',hours:42,stress:4,contract:'Permanent; fast-paced fintech',desc:'Investigate payment failures, document product requirements, track KPIs and coordinate between engineering, compliance and customer teams. Employers include Fawry, Paymob, Thndr and MNT-Halan.',sponsorChance:.30},
  {id:'biz-supply-chain-analyst',trackId:'entry',group:'finance',roleTitle:'Supply Chain / Logistics Analyst',titles:['Supply Chain Assistant','Supply Chain Analyst','Senior Supply Chain Analyst','Supply Chain Manager','Director of Supply Chain'],factor:.95,degree:'business',smarts:44,eng:32,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'On-site / hybrid',hours:42,stress:4,contract:'Permanent; operations and planning',desc:'Track inventory, analyse demand, coordinate suppliers and improve delivery performance. Retail, FMCG and logistics employers such as Mansour Group, Jumia and Bosta hire supply-chain analysts.',sponsorChance:.20},
  {id:'biz-hr-analyst',trackId:'entry',group:'finance',roleTitle:'HR / People Analytics Analyst',titles:['HR Analyst','People Analytics Analyst','Senior People Analyst','HR Analytics Manager','Head of People Analytics'],factor:.90,degree:'business',smarts:46,eng:38,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'Hybrid',hours:40,stress:3,contract:'Permanent; HR and workforce data',desc:'Analyse headcount, attrition, compensation and engagement data; build dashboards and support workforce planning. Multinationals and large Egyptian groups hire HR analysts from business programmes.',sponsorChance:.18},
  {id:'biz-consulting-analyst',trackId:'entry',group:'finance',roleTitle:'Management Consulting Analyst',titles:['Consulting Analyst','Business Analyst','Senior Consultant','Engagement Manager','Partner'],factor:1.20,degree:'business',degrees:['business','law','cs'],smarts:60,eng:50,minExp:0,medical:true,social:true,bonus:.08,leave:21,remote:'Hybrid / client site',hours:55,stress:6,contract:'Permanent; project-based travel',desc:'Structure problems, gather data, build models and present recommendations. Firms such as PwC, Deloitte, EY and KPMG recruit graduate consultants in Cairo.',sponsorChance:.26}
 ],
 cs:[
  /* Original 6 CS roles — unchanged */
  {id:'cs-it-support',trackId:'tech',group:'tech',roleTitle:'IT Support Analyst',titles:['IT Support Technician','IT Support Analyst','Senior IT Analyst','IT Service Desk Lead','IT Operations Manager'],factor:.82,degree:'cs',smarts:42,eng:40,minExp:0,medical:true,social:true,bonus:.03,leave:18,remote:'Hybrid / on-site',hours:40,stress:4,contract:'Permanent; shift support may apply',desc:'Troubleshooting devices, accounts, networks and internal user issues; practical skills may matter as much as grades.',sponsorChance:.20},
  {id:'cs-qa',trackId:'tech',group:'tech',roleTitle:'Junior QA / Software Tester',titles:['QA Trainee','QA Engineer','Senior QA Engineer','QA Lead','Quality Engineering Manager'],factor:.90,degree:'cs',smarts:50,eng:40,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Write test cases, reproduce bugs, validate fixes and document release quality.',sponsorChance:.28},
  {id:'cs-data',trackId:'tech',group:'tech',roleTitle:'Junior Data / BI Analyst',titles:['Data Analyst Intern','Junior Data Analyst','Data Analyst','Senior BI Analyst','Analytics Manager'],factor:.94,degree:'cs',degrees:['cs','business'],smarts:54,eng:42,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid / remote by team',hours:40,stress:4,contract:'Permanent; portfolio may be requested',desc:'Clean data, use SQL and spreadsheets, build dashboards and explain trends to non-technical users.',sponsorChance:.31},
  {id:'cs-dev',trackId:'tech',group:'tech',roleTitle:'Junior Software Developer',titles:['Graduate Developer','Junior Developer','Software Engineer','Senior Engineer','Engineering Lead'],factor:1.02,degree:'cs',smarts:58,eng:48,minExp:0,medical:true,social:true,bonus:.06,leave:22,remote:'Hybrid / remote by employer',hours:40,stress:5,contract:'Permanent; technical interview',desc:'Build, test and maintain software. Hiring depends on portfolio, coding interviews and current team demand.',sponsorChance:.38},
  {id:'cs-erp',trackId:'tech',group:'tech',roleTitle:'ERP / Business Systems Analyst',titles:['ERP Support Assistant','Business Systems Analyst','Senior Systems Analyst','ERP Product Owner','Enterprise Systems Manager'],factor:1.00,degree:'cs',degrees:['cs','business'],smarts:52,eng:45,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Support ERP modules, investigate process issues and connect finance, operations and technical teams.',sponsorChance:.32},
  {id:'cs-security',trackId:'tech',group:'tech',roleTitle:'Junior Security Operations Analyst',titles:['Security Operations Trainee','SOC Analyst','Senior SOC Analyst','Security Team Lead','Security Manager'],factor:1.08,degree:'cs',smarts:61,eng:50,minExp:1,medical:true,social:true,bonus:.06,leave:22,remote:'Shift-based / hybrid',hours:42,stress:6,contract:'Permanent; shift rotation possible',desc:'Monitor alerts, document incidents and follow response procedures. Some roles require certifications or shift work.',sponsorChance:.35},
  /* Expanded CS / tech roles */
  {id:'cs-backend-engineer',trackId:'tech',group:'tech',roleTitle:'Backend Software Engineer',titles:['Backend Intern','Backend Engineer','Senior Backend Engineer','Staff Engineer','Principal Engineer'],factor:1.08,degree:'cs',smarts:60,eng:48,minExp:0,medical:true,social:true,bonus:.06,leave:22,remote:'Hybrid / remote by employer',hours:42,stress:5,contract:'Permanent; coding interview and system design',desc:'Design APIs, manage databases, write server-side logic and improve reliability. Employers include Thndr, Paymob, Fawry, Noon and international remote teams.',sponsorChance:.35},
  {id:'cs-frontend-engineer',trackId:'tech',group:'tech',roleTitle:'Frontend / Web Engineer',titles:['Frontend Intern','Frontend Engineer','Senior Frontend Engineer','Frontend Lead','Principal Frontend Engineer'],factor:1.03,degree:'cs',degrees:['cs','business'],smarts:55,eng:50,minExp:0,medical:true,social:true,bonus:.05,leave:22,remote:'Hybrid / remote by employer',hours:40,stress:4,contract:'Permanent; portfolio review',desc:'Build responsive interfaces, work with design systems and optimise web performance. Fintechs, e-commerce and agencies hire frontend engineers with strong JavaScript and React skills.',sponsorChance:.32},
  {id:'cs-mobile-engineer',trackId:'tech',group:'tech',roleTitle:'Mobile App Developer',titles:['Mobile Intern','Mobile Developer','Senior Mobile Developer','Mobile Lead','Head of Mobile'],factor:1.06,degree:'cs',smarts:56,eng:44,minExp:0,medical:true,social:true,bonus:.05,leave:22,remote:'Hybrid / remote by employer',hours:40,stress:4,contract:'Permanent; app-store deployment',desc:'Develop iOS or Android applications, integrate APIs, debug performance issues and release updates. Super-app and fintech employers actively recruit mobile developers.',sponsorChance:.33},
  {id:'cs-devops',trackId:'tech',group:'tech',roleTitle:'DevOps / Cloud Engineer',titles:['DevOps Trainee','DevOps Engineer','Senior DevOps Engineer','DevOps Lead','Head of Platform'],factor:1.12,degree:'cs',smarts:62,eng:48,minExp:0,medical:true,social:true,bonus:.06,leave:22,remote:'Hybrid / remote by employer',hours:42,stress:5,contract:'Permanent; on-call rotation possible',desc:'Manage CI/CD pipelines, cloud infrastructure, container orchestration and monitoring. AWS, Azure and GCP certifications strengthen applications.',sponsorChance:.34},
  {id:'cs-data-engineer',trackId:'tech',group:'tech',roleTitle:'Data Engineer',titles:['Data Engineering Intern','Data Engineer','Senior Data Engineer','Data Engineering Lead','Head of Data Platform'],factor:1.10,degree:'cs',degrees:['cs','business'],smarts:60,eng:46,minExp:0,medical:true,social:true,bonus:.06,leave:22,remote:'Hybrid / remote by employer',hours:42,stress:5,contract:'Permanent; pipeline and warehouse work',desc:'Build ETL pipelines, model warehouses, manage data quality and support analytics teams. Banks, fintechs and large retailers are hiring data engineers.',sponsorChance:.32},
  {id:'cs-ml-engineer',trackId:'tech',group:'tech',roleTitle:'Machine Learning Engineer',titles:['ML Intern','ML Engineer','Senior ML Engineer','ML Lead','Head of ML'],factor:1.18,degree:'cs',degrees:['cs','biology'],smarts:68,eng:52,minExp:0,medical:true,social:true,bonus:.07,leave:22,remote:'Hybrid / remote by employer',hours:42,stress:5,contract:'Permanent; research-to-production',desc:'Train, evaluate and deploy machine-learning models; work with data scientists and engineers. Strong Python, statistics and MLOps skills are expected.',sponsorChance:.30},
  {id:'cs-product-manager',trackId:'tech',group:'tech',roleTitle:'Associate Product Manager',titles:['APM','Associate Product Manager','Product Manager','Senior PM','Head of Product'],factor:1.12,degree:'cs',degrees:['cs','business'],smarts:58,eng:50,minExp:0,medical:true,social:true,bonus:.06,leave:22,remote:'Hybrid',hours:44,stress:5,contract:'Permanent; cross-functional role',desc:'Define features, write specifications, prioritise backlogs and coordinate engineering, design and business teams. Fintech and e-commerce companies run APM programmes.',sponsorChance:.32},
  {id:'cs-cybersecurity-grc',trackId:'tech',group:'tech',roleTitle:'Cybersecurity GRC Analyst',titles:['GRC Assistant','GRC Analyst','Senior GRC Analyst','GRC Manager','Head of GRC'],factor:1.05,degree:'cs',degrees:['cs','law','business'],smarts:55,eng:48,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent; governance and compliance',desc:'Assess cyber risks, maintain policies, support audits and map controls to frameworks such as ISO 27001 and NIST. Banks and regulated employers hire GRC analysts.',sponsorChance:.30},
  {id:'cs-network-engineer',trackId:'tech',group:'tech',roleTitle:'Network / Infrastructure Engineer',titles:['Network Trainee','Network Engineer','Senior Network Engineer','Network Lead','Head of Infrastructure'],factor:1.00,degree:'cs',smarts:50,eng:42,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site / hybrid',hours:42,stress:4,contract:'Permanent; shift and on-call possible',desc:'Configure routers, switches, firewalls and WAN links; troubleshoot connectivity and support data-centre operations. Telecoms and banks maintain large network teams.',sponsorChance:.26},
  {id:'cs-game-developer',trackId:'tech',group:'tech',roleTitle:'Game Developer',titles:['Junior Game Developer','Game Developer','Senior Game Developer','Game Lead','Studio Technical Director'],factor:1.02,degree:'cs',smarts:55,eng:40,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid / remote by studio',hours:44,stress:5,contract:'Permanent or project-based',desc:'Implement gameplay systems, optimise performance and work with artists and designers. Regional studios and remote indie teams hire junior developers with Unity or Unreal portfolios.',sponsorChance:.22}
 ],
 medicine:[
  /* Original 4 medicine roles — unchanged */
  {id:'med-resident',trackId:'medical',group:'medical',roleTitle:'Junior Doctor / Resident',titles:['Intern / Junior Doctor','Resident Doctor','Specialist Physician','Consultant / Department Lead','Clinical Director'],factor:.82,degree:'medicine',smarts:68,eng:30,minExp:0,medical:true,social:true,bonus:.01,leave:21,remote:'On-site',hours:60,stress:8,contract:'Hospital training / residency; local licensing required',desc:'Clinical work under supervision. Graduation alone may not authorise independent practice; local registration and internship requirements apply.',sponsorChance:.18},
  {id:'med-clinical-research',trackId:'medical',group:'medical',roleTitle:'Clinical Research Coordinator',titles:['Clinical Research Assistant','Clinical Research Coordinator','Senior Research Coordinator','Clinical Research Manager','Research Operations Director'],factor:.91,degree:'medicine',degrees:['medicine','biology'],smarts:58,eng:50,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site / hybrid admin',hours:40,stress:4,contract:'Hospital / research centre contract',desc:'Coordinate study documents, visits, data entry and protocol compliance. Research roles still require relevant training.',sponsorChance:.26},
  {id:'med-quality',trackId:'medical',group:'medical',roleTitle:'Healthcare Quality & Patient Safety Officer',titles:['Quality Assistant','Quality Officer','Senior Quality Officer','Patient Safety Manager','Quality Director'],factor:.94,degree:'medicine',smarts:56,eng:40,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'On-site / hybrid reporting',hours:42,stress:5,contract:'Permanent',desc:'Audit patient pathways, investigate incidents and maintain quality documentation.',sponsorChance:.23},
  {id:'med-public-health',trackId:'medical',group:'medical',roleTitle:'Public Health Programme Officer',titles:['Programme Assistant','Public Health Officer','Senior Programme Officer','Programme Manager','Public Health Director'],factor:.90,degree:'medicine',degrees:['medicine','biology'],smarts:55,eng:48,minExp:0,medical:true,social:true,bonus:.02,leave:21,remote:'Hybrid / field work',hours:40,stress:4,contract:'Permanent or grant-funded',desc:'Support prevention programmes, health reporting, community projects and outcome monitoring.',sponsorChance:.23},
  /* Expanded medicine / healthcare roles */
  {id:'med-hospital-administrator',trackId:'medical',group:'medical',roleTitle:'Hospital Operations / Administration Officer',titles:['Administrative Assistant','Hospital Operations Officer','Senior Operations Officer','Hospital Operations Manager','Chief Operating Officer'],factor:.95,degree:'medicine',degrees:['medicine','business'],smarts:54,eng:40,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'On-site',hours:44,stress:5,contract:'Permanent; hospital management',desc:'Coordinate bed capacity, staffing rosters, patient flow and departmental reporting. Private hospital groups such as Cleopatra and NMC hire operations officers.',sponsorChance:.20},
  {id:'med-health-informatics',trackId:'medical',group:'medical',roleTitle:'Health Informatics Analyst',titles:['Informatics Assistant','Health Informatics Analyst','Senior Informatics Analyst','Informatics Manager','Chief Information Officer (Health)'],factor:1.02,degree:'medicine',degrees:['medicine','cs','biology'],smarts:58,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent; clinical data and systems',desc:'Manage electronic health records, analyse clinical data, support digital-health projects and train staff on new systems. Hospitals and health insurers are expanding informatics teams.',sponsorChance:.24},
  {id:'med-pharmacovigilance',trackId:'medical',group:'medical',roleTitle:'Pharmacovigilance Associate',titles:['PV Assistant','Pharmacovigilance Associate','Senior PV Associate','PV Manager','Head of Pharmacovigilance'],factor:.96,degree:'medicine',degrees:['medicine','biology'],smarts:55,eng:42,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent; regulatory reporting',desc:'Collect and assess adverse-event reports, prepare safety submissions and maintain product safety files. Pharmaceutical companies and CROs hire life-science graduates for PV roles.',sponsorChance:.22},
  {id:'med-medical-device-specialist',trackId:'medical',group:'medical',roleTitle:'Medical Device / Clinical Applications Specialist',titles:['Applications Trainee','Clinical Applications Specialist','Senior Applications Specialist','Applications Manager','Head of Clinical Applications'],factor:.98,degree:'medicine',degrees:['medicine','biology'],smarts:54,eng:44,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site / travel to hospitals',hours:42,stress:4,contract:'Permanent; device training and support',desc:'Train clinicians on medical equipment, support installations and troubleshoot device performance. MedTech distributors and device manufacturers hire clinical specialists.',sponsorChance:.20},
  {id:'med-health-insurance-analyst',trackId:'medical',group:'medical',roleTitle:'Health Insurance / Claims Analyst',titles:['Claims Assistant','Health Claims Analyst','Senior Claims Analyst','Claims Manager','Head of Health Claims'],factor:.94,degree:'medicine',degrees:['medicine','business'],smarts:52,eng:38,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'Hybrid',hours:42,stress:4,contract:'Permanent; insurer or TPA',desc:'Review medical claims, apply policy rules, investigate anomalies and coordinate with providers. Employers include Allianz, AXA, MetLife and Bupa Arabia.',sponsorChance:.22},
  {id:'med-clinical-psychologist',trackId:'medical',group:'medical',roleTitle:'Clinical Psychology Assistant',titles:['Psychology Assistant','Clinical Psychology Assistant','Clinical Psychologist','Senior Clinical Psychologist','Head of Psychology'],factor:.90,degree:'medicine',degrees:['medicine','biology'],smarts:58,eng:42,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'On-site',hours:40,stress:5,contract:'Permanent; supervised practice',desc:'Support assessments, therapy sessions and patient records under supervision. Licensing requirements vary by country and setting.',sponsorChance:.16},
  {id:'med-radiology-technologist',trackId:'medical',group:'medical',roleTitle:'Radiology Technologist',titles:['Radiology Trainee','Radiology Technologist','Senior Technologist','Radiology Supervisor','Radiology Manager'],factor:.92,degree:'medicine',smarts:52,eng:30,minExp:0,medical:true,social:false,bonus:.02,leave:21,remote:'On-site',hours:44,stress:5,contract:'Permanent; hospital imaging department',desc:'Operate X-ray, CT and MRI equipment, prepare patients and maintain safety protocols. Hospitals across the region hire licensed technologists.',sponsorChance:.15},
  {id:'med-nursing-supervisor',trackId:'medical',group:'medical',roleTitle:'Nursing Team Supervisor',titles:['Staff Nurse','Senior Nurse','Nursing Supervisor','Nursing Manager','Director of Nursing'],factor:.88,degree:'medicine',smarts:48,eng:28,minExp:1,medical:true,social:true,bonus:.02,leave:21,remote:'On-site',hours:48,stress:6,contract:'Permanent; shift leadership',desc:'Supervise nursing teams, manage rosters, ensure care standards and support patient safety. Requires nursing qualification and registration in most countries.',sponsorChance:.12}
 ],
 biology:[
  /* Original 5 biology roles — unchanged */
  {id:'bio-lab',trackId:'bio',group:'bio',roleTitle:'Laboratory Assistant / Technician',titles:['Lab Assistant','Laboratory Technician','Senior Lab Technician','Lab Supervisor','Laboratory Manager'],factor:.82,degree:'biology',smarts:48,eng:30,minExp:0,medical:true,social:true,bonus:.02,leave:18,remote:'On-site',hours:40,stress:4,contract:'Permanent or research grant',desc:'Handle samples, maintain safety logs, perform routine tests and follow standard operating procedures.',sponsorChance:.22},
  {id:'bio-qc',trackId:'bio',group:'bio',roleTitle:'Pharmaceutical QA / QC Analyst',titles:['QC Trainee','QA / QC Analyst','Senior QC Analyst','QC Supervisor','Quality Manager'],factor:.91,degree:'biology',smarts:52,eng:34,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site',hours:42,stress:5,contract:'Permanent; quality procedures and shift work may apply',desc:'Sample testing, batch records and quality documentation in a pharmaceutical or manufacturing environment.',sponsorChance:.25},
  {id:'bio-clinical',trackId:'bio',group:'bio',roleTitle:'Clinical Trial Assistant',titles:['Clinical Trial Assistant','Clinical Research Associate','Senior CRA','Clinical Trial Manager','Clinical Operations Lead'],factor:.96,degree:'biology',smarts:54,eng:48,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'Hybrid / site visits',hours:40,stress:4,contract:'Research / pharma contract',desc:'Coordinate trial documentation, site communication and monitoring records.',sponsorChance:.28},
  {id:'bio-food',trackId:'bio',group:'bio',roleTitle:'Food / Environmental Laboratory Analyst',titles:['Lab Trainee','Laboratory Analyst','Senior Analyst','Lab Supervisor','Technical Manager'],factor:.86,degree:'biology',smarts:46,eng:28,minExp:0,medical:false,social:true,bonus:.02,leave:18,remote:'On-site',hours:40,stress:3,contract:'Permanent or fixed-term',desc:'Test food, water or environmental samples, record results and keep equipment calibrated.',sponsorChance:.18},
  {id:'bio-regulatory',trackId:'bio',group:'bio',roleTitle:'Regulatory Affairs Associate',titles:['Regulatory Assistant','Regulatory Affairs Associate','Senior Regulatory Specialist','Regulatory Manager','Regulatory Affairs Director'],factor:.98,degree:'biology',degrees:['biology','medicine'],smarts:55,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid paperwork / on-site',hours:40,stress:4,contract:'Permanent',desc:'Prepare product registrations, maintain technical files and respond to regulator requests.',sponsorChance:.26},
  /* Expanded biology / life-science roles */
  {id:'bio-biotech-research',trackId:'bio',group:'bio',roleTitle:'Biotechnology Research Assistant',titles:['Research Assistant','Biotech Research Assistant','Senior Research Associate','Research Scientist','Principal Scientist'],factor:1.00,degree:'biology',smarts:58,eng:40,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site',hours:42,stress:4,contract:'Research grant or industry lab',desc:'Run experiments, culture cells, analyse samples and document results. Research institutes and biotech companies hire biology graduates for wet-lab roles.',sponsorChance:.24},
  {id:'bio-genomics',trackId:'bio',group:'bio',roleTitle:'Genomics / Molecular Biology Analyst',titles:['Genomics Assistant','Genomics Analyst','Senior Genomics Analyst','Genomics Lead','Head of Genomics'],factor:1.06,degree:'biology',degrees:['biology','cs','medicine'],smarts:62,eng:46,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid / lab',hours:42,stress:4,contract:'Permanent or research programme',desc:'Process sequencing data, interpret variants and support molecular diagnostics. Demand is growing in research hospitals, diagnostic labs and precision-medicine programmes.',sponsorChance:.25},
  {id:'bio-clinical-data',trackId:'bio',group:'bio',roleTitle:'Clinical Data Manager',titles:['Data Assistant','Clinical Data Manager','Senior Clinical Data Manager','Data Management Lead','Head of Clinical Data'],factor:1.02,degree:'biology',degrees:['biology','cs','medicine'],smarts:56,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid / remote by employer',hours:40,stress:4,contract:'Permanent; CRO or sponsor',desc:'Design data-collection forms, clean trial data, manage databases and support statistical analysis. CROs and pharma sponsors hire clinical data managers.',sponsorChance:.26},
  {id:'bio-bioprocess',trackId:'bio',group:'bio',roleTitle:'Bioprocess / Manufacturing Associate',titles:['Manufacturing Trainee','Bioprocess Associate','Senior Bioprocess Associate','Manufacturing Manager','Head of Bioprocessing'],factor:.96,degree:'biology',smarts:52,eng:34,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'On-site',hours:44,stress:5,contract:'Permanent; GMP environment',desc:'Operate bioreactors, monitor fermentation, follow clean-room procedures and document batch records. Pharmaceutical manufacturers and contract manufacturers hire bioprocess associates.',sponsorChance:.22},
  {id:'bio-environmental',trackId:'bio',group:'bio',roleTitle:'Environmental Scientist / Analyst',titles:['Environmental Assistant','Environmental Scientist','Senior Environmental Scientist','Environmental Manager','Head of Environment'],factor:.92,degree:'biology',smarts:50,eng:36,minExp:0,medical:false,social:true,bonus:.02,leave:21,remote:'Hybrid / field work',hours:40,stress:4,contract:'Permanent or consultancy',desc:'Collect air, water and soil samples, assess contamination, prepare environmental reports and support permit applications. Consultancies and industrial operators hire environmental scientists.',sponsorChance:.18},
  {id:'bio-agriculture',trackId:'bio',group:'bio',roleTitle:'Agricultural / Crop Science Officer',titles:['Field Assistant','Crop Science Officer','Senior Crop Scientist','Agricultural Manager','Head of Agronomy'],factor:.88,degree:'biology',smarts:48,eng:30,minExp:0,medical:false,social:true,bonus:.02,leave:18,remote:'On-site / field',hours:42,stress:4,contract:'Permanent; agribusiness',desc:'Support crop trials, soil testing, pest management and farmer training. Agribusinesses, NGOs and research stations hire agricultural officers.',sponsorChance:.16},
  {id:'bio-veterinary',trackId:'bio',group:'bio',roleTitle:'Veterinary / Animal Health Assistant',titles:['Vet Assistant','Veterinary Officer','Senior Veterinary Officer','Veterinary Manager','Chief Veterinary Officer'],factor:.90,degree:'biology',degrees:['biology','medicine'],smarts:52,eng:28,minExp:0,medical:true,social:true,bonus:.02,leave:21,remote:'On-site / field',hours:42,stress:4,contract:'Permanent; clinic or livestock programme',desc:'Support animal health checks, vaccination programmes and livestock disease surveillance. Requires relevant veterinary registration where applicable.',sponsorChance:.14}
 ]
};

function p15DegreeKeys(){
  if(!S)return [];
  const out=[];if(S.degree&&P15_DEGREE_JOBS[S.degree])out.push(S.degree);
  const mf=S.masterField||(S.mastDone&&S.mast&&S.mast.field)||(S.localMast&&S.localMast.field)||'';
  const map={finance:'business',mba:'business',analytics:'business',cs:'cs',law:'law',health:'biology'};
  const mk=map[mf]||null;if(mk&&P15_DEGREE_JOBS[mk]&&!out.includes(mk))out.push(mk);
  return out;
}
function p15DegreeFits(post,degree){
  const allowed=post&&post.degrees&&post.degrees.length?post.degrees:(post&&post.degree?[post.degree]:[]);
  return !allowed.length || allowed.includes(degree);
}
function p15DegreeMatch(post,degree){
  const allowed=post&&post.degrees&&post.degrees.length?post.degrees:(post&&post.degree?[post.degree]:[]);
  return !!degree&&allowed.length>0&&allowed.includes(degree);
}
function p15RoleTrackRelevant(post,major){
  if(!post)return false;
  if(post.p15DegreeMajor===major)return true;
  const trackMap={law:'law',business:'finance',cs:'tech',medicine:'medical',biology:'bio'};
  return post.trackId===trackMap[major] && (post.degree===major || (post.degrees||[]).includes(major));
}
function p15DegreePosts(country,major){
  const defs=P15_DEGREE_JOBS[major]||[];
  const year=gameYear();
  return defs.map((d,i)=>{
    const out={...d,titles:d.titles.slice(),id:`p15_${country}_${year}_${d.id}`,p15DegreeMajor:major,postedYear:year,
      name:p15LocalEmployer(country,d.group,i),companySize:i%4===0?'large national / regional employer':i%3===0?'mid-sized employer':'small or specialist employer'};
    if(out.sponsorship==null){
      const chance=country===S.home?0:(out.sponsorChance==null?((out.trackId==='tech'||out.trackId==='finance')?.30:.18):out.sponsorChance);
      out.sponsorship=country===S.home?false:Math.random()<chance;
    }
    if(!out.degree && !out.degrees)out.degree=major;
    return out;
  });
}

/* Merge major-specific vacancies into the current year's generated board,
   retain the board for the year, then put related options at the top. */
const P15_companyListBeforeMajorMerge=companyListFor;
companyListFor=function(country=S.country){
  let board=P15_companyListBeforeMajorMerge(country);
  if(!S)return board;
  p12InitState(S);
  if(!Array.isArray(board))board=[];
  let merged=board.slice();
  for(const major of p15DegreeKeys()){
    const extras=p15DegreePosts(country,major);
    for(const post of extras){
      const found=merged.find(x=>x.id===post.id);
      if(!found)merged.push(post);
    }
  }
  const degree=S.degree;
  const score=post=>{
    if(!degree)return post.p15DegreeMajor?10:0;
    if(post.p15DegreeMajor===degree)return 100;
    if((post.degrees||[]).includes(degree)||post.degree===degree)return 90;
    if(p15RoleTrackRelevant(post,degree))return 80;
    return post.p15DegreeMajor?20:0;
  };
  merged.sort((a,b)=>score(b)-score(a));
  const key=`${country}-${gameYear()}`;
  S.jobBoards=S.jobBoards||{};S.jobBoards[key]=merged;
  return merged;
};

/* Degree eligibility supports joint pathways such as law-to-compliance and
   business-to-contracts; it no longer assumes every job accepts one degree. */
const P15_jobEligibleBeforeDegrees=jobEligible;
jobEligible=function(post){
  if(post&&((post.degrees&&post.degrees.length)||post.degree)){
    const allowed=post.degrees&&post.degrees.length?post.degrees:[post.degree];
    if(!S.degree||!allowed.includes(S.degree)){
      const labels=allowed.map(k=>MAJORS[k]?.name||k).join(' or ');
      return `Requires a degree in ${labels}.`;
    }
    return P15_jobEligibleBeforeDegrees({...post,degree:null,degrees:null});
  }
  return P15_jobEligibleBeforeDegrees(post);
};

/* Make the displayed qualification line reflect multiple accepted majors. */
const P15_oldRequirementText="${(post.degrees&&post.degrees.length)?`degree in ${post.degrees.map(k=>MAJORS[k]?.name||k).join(' or ')}; `:(post.degree?`degree in ${MAJORS[post.degree]?.name||post.degree}; `:'')}English ${post.eng||0}%+, Smarts ${post.smarts||0}%+${post.minExp?`, ${post.minExp}+ relevant years`:''}. Hiring also depends on interviews, competition and budget.";
const P15_newRequirementText="${(post.degrees&&post.degrees.length)?`degree in ${post.degrees.map(k=>MAJORS[k]?.name||k).join(' or ')}; `:(post.degree?`degree in ${MAJORS[post.degree]?.name||post.degree}; `:'')}English ${post.eng||0}%+, Smarts ${post.smarts||0}%+${post.minExp?`, ${post.minExp}+ relevant years`:''}. Hiring also depends on interviews, competition and budget.";
/* This is a source-string patch to the career renderer so the multi-degree
   eligibility message displayed to the player matches the actual logic. */
const P15_oldCareerRendererSource = viewCareer;
viewCareer=function(){
  p15AdoptLegacyRemote();
  let html=P15_oldCareerRendererSource();
  if(html.includes(P15_oldRequirementText))html=html.replace(P15_oldRequirementText,P15_newRequirementText);
  if(S&&S.job&&S.job.isRemoteUSD){
    html=html.replace('A similar role may exist remotely for an international company, but USD pay is not automatic. Strong English, a proven portfolio, reliable communication, relevant experience and selection performance improve your chances.','Your current remote USD contract is your MAIN job, shown above. The listings below are alternative jobs; if you win one, it replaces your current job rather than adding a second salary. Remote contracts usually do not provide immigration sponsorship, and benefits may be weaker than local employment.');
  }
  return html;
};

/* Remote vacancies — original six entries are preserved below; expanded
   real-company remote roles follow. Each new entry uses the same schema
   (id, t, eng, smarts, usd, deg, st, track, exp, perks) so P15’s
   p15RemoteTrack(), p15SearchRemote() and the remote eligibility checks
   continue to work without changes. */
[
  /* Original six remote roles */
  {id:'p15-rem-law-review',t:'Remote legal document review analyst',eng:78,smarts:62,usd:21000,deg:'law',st:4,track:'law',exp:0,perks:'Cross-border contract review; jurisdiction-specific advice is not part of the role; benefits depend on the contractor agreement.'},
  {id:'p15-rem-jr-fullstack',t:'Junior remote full-stack developer',eng:75,smarts:55,usd:28000,deg:'cs',st:4,track:'tech',exp:0,perks:'Technical interview and portfolio required; paid leave and insurance are employer-dependent.'},
  {id:'p15-rem-systems-architect',t:'Senior remote systems architect',eng:88,smarts:82,usd:58000,deg:'cs',st:6,track:'tech',exp:5,premium:true,perks:'Rare senior contract; substantial production experience, architecture interviews and strong references expected.'},
  {id:'p15-rem-fin-controller',t:'Remote financial analyst / controller',eng:80,smarts:68,usd:36000,deg:'business',st:5,track:'finance',exp:3,perks:'Financial modelling and reporting deadlines; benefits vary by contract and the client may require overlap with its time zone.'},
  {id:'p15-rem-customer-success',t:'Bilingual customer success specialist',eng:70,smarts:42,usd:16000,deg:null,st:3,track:'entry',exp:0,perks:'Time-zone coverage and performance targets; paid leave and health insurance may not be included.'},
  {id:'p15-rem-growth',t:'Remote digital growth / SEO strategist',eng:76,smarts:52,usd:22000,deg:null,st:4,track:'entry',exp:1,perks:'Portfolio-led hiring; campaign budgets, analytics evidence and client communication matter.'},
  /* Expanded real-company-inspired remote roles */
  {id:'p15-rem-legal-ops',t:'Remote legal operations associate',eng:80,smarts:60,usd:24000,deg:'law',st:4,track:'law',exp:0,perks:'Contract lifecycle management, legal intake and outside-counsel coordination. Remote-first startups and legal-tech companies hire legal operations associates.'},
  {id:'p15-rem-compliance-analyst',t:'Remote compliance / AML analyst',eng:82,smarts:58,usd:26000,deg:'business',degrees:['business','law'],st:4,track:'finance',exp:0,perks:'KYC reviews, transaction monitoring and regulatory reporting. Remote fintechs and compliance consultancies hire analysts with finance or law backgrounds.'},
  {id:'p15-rem-junior-data-analyst',t:'Remote junior data analyst',eng:75,smarts:55,usd:27000,deg:'cs',degrees:['cs','business'],st:4,track:'tech',exp:0,perks:'SQL, dashboards and stakeholder reporting. Portfolio or take-home task required; time-zone overlap may be specified.'},
  {id:'p15-rem-qa-engineer',t:'Remote QA / test automation engineer',eng:78,smarts:56,usd:29000,deg:'cs',st:4,track:'tech',exp:1,perks:'Manual and automated testing; frameworks such as Selenium or Cypress expected. Contract benefits vary.'},
  {id:'p15-rem-product-manager',t:'Remote associate product manager',eng:85,smarts:62,usd:35000,deg:'business',degrees:['business','cs'],st:5,track:'tech',exp:1,perks:'Roadmap ownership, stakeholder communication and analytics. Fintech and SaaS companies hire remote APMs.'},
  {id:'p15-rem-financial-reporting',t:'Remote financial reporting analyst',eng:82,smarts:62,usd:32000,deg:'business',st:5,track:'finance',exp:2,perks:'Month-end close, variance analysis and management reporting. Accounting qualification or progress toward one preferred.'},
  {id:'p15-rem-ux-designer',t:'Remote UX / product designer',eng:80,smarts:58,usd:30000,deg:null,st:4,track:'entry',exp:1,perks:'Portfolio-led hiring; user research, wireframing and design-system experience expected.'},
  {id:'p15-rem-technical-writer',t:'Remote technical writer',eng:88,smarts:56,usd:25000,deg:'cs',degrees:['cs','business'],st:4,track:'tech',exp:0,perks:'API documentation, developer guides and release notes. Strong English and ability to read code required.'},
  {id:'p15-rem-clinical-data',t:'Remote clinical data coordinator',eng:82,smarts:55,usd:28000,deg:'biology',degrees:['biology','medicine'],st:4,track:'bio',exp:0,perks:'Trial data entry, query resolution and site communication. CROs and sponsors hire remote clinical data staff.'},
  {id:'p15-rem-regulatory-affairs',t:'Remote regulatory affairs associate',eng:85,smarts:60,usd:31000,deg:'biology',degrees:['biology','medicine'],st:5,track:'bio',exp:1,perks:'Product registration, technical files and health-authority correspondence. Life-science consultancies hire remote regulatory staff.'},
  {id:'p15-rem-health-informatics',t:'Remote health informatics analyst',eng:80,smarts:58,usd:30000,deg:'medicine',degrees:['medicine','cs','biology'],st:4,track:'medical',exp:0,perks:'EHR configuration, clinical data quality and reporting. Health systems and digital-health vendors hire remote analysts.'},
  {id:'p15-rem-esg-analyst',t:'Remote ESG / sustainability analyst',eng:85,smarts:58,usd:29000,deg:'business',degrees:['business','biology','law'],st:4,track:'finance',exp:0,perks:'ESG data collection, disclosure support and climate-risk analysis. Consultancies and asset managers hire remote ESG analysts.'},
  {id:'p15-rem-cybersecurity-analyst',t:'Remote cybersecurity / GRC analyst',eng:85,smarts:60,usd:32000,deg:'cs',st:5,track:'tech',exp:1,perks:'Policy review, risk assessments and audit evidence. Certifications such as Security+ or ISO 27001 lead auditor strengthen applications.'}
].forEach(r=>{if(!REMOTE.some(x=>x.id===r.id))REMOTE.push(r);});

/* All successful remote applications now become the player's only main job.
   A rejection leaves the existing job untouched. A contractor offer is not a visa. */
function p15RemoteTrack(r){
  if(r.track)return r.track;
  if(r.deg==='cs')return 'tech';if(r.deg==='business')return 'finance';if(r.deg==='law')return 'law';
  const t=String(r.t||'').toLowerCase();if(/analyst|account|bookkeep|financial|finance|compliance/.test(t))return 'finance';
  if(/develop|engineer|data|software|systems|technical/.test(t))return 'tech';return 'entry';
}
function p15AdoptLegacyRemote(){
  if(!S||!S.remote)return;
  if(S.job&&S.job.isRemoteUSD){S.remote=null;S.remoteJob=null;return;}
  if(S.age<18){S.remote=null;S.remoteJob=null;return;}
  const old=S.job?{...S.job}:null, r=S.remote, listing=REMOTE.find(x=>x.id===r.id), track=p15RemoteTrack(listing||r);
  if(old)recordCareer(old,true);
  const cr=(S.careerRecords||{})[track],level=cr?cr.level||0:0;
  S.job={trackId:track,level,title:r.title||listing?.t||'Remote contractor',salary:Math.max(0,Number(r.usd)||0),perf:45,years:0,company:r.company||'International Remote Contractor',companyId:`legacy_remote_${S.age}`,industry:'International remote work',isRemoteUSD:true,visaSponsorship:false,companyFactor:1,stress:r.st||4,benefits:{medical:false,social:false,pension:false,bonus:0,leave:10,remote:'Fully remote · USD contract',hours:40,contract:'Legacy remote contract — no guaranteed benefits'},remotePerks:r.perks||listing?.perks||'Benefits depend on contract.'};
  S.lastSalary=S.job.salary;S.retired=false;S.remote=null;S.remoteJob=null;
  log(`Save compatibility update: your existing remote contract is now your main job, replacing ${old?old.title+' at '+(old.company||'your former employer'):'the empty main-job slot'}. A second full-time salary is no longer counted.`);
}
function p15SearchRemote(id){
  if(!S||S.age<18)return hint('Full-time remote roles start at 18.');
  const r=REMOTE.find(x=>x.id===id);if(!r)return hint('This remote vacancy is no longer available.');
  const why=p12RemoteEligibility(r);if(why)return hint(why);
  if(S.pendingJobOffer)return hint('Resolve the pending work-visa sponsorship case before changing jobs.');
  if(S.country!==S.home&&!p12CanWorkWithoutSponsor())return hint('This remote contractor role does not sponsor a visa. You need a status that independently permits this work before replacing an overseas employer.');
  if(S.didW===S.age)return hint('You have already used your remote-job application this year.');
  S.didW=S.age;
  const track=p15RemoteTrack(r),experience=trackExperience(track),current=S.job?{...S.job,benefits:{...(S.job.benefits||{})}}:null;
  let chance=.035+Math.max(0,S.eng-(r.eng||0))/260+Math.max(0,S.smarts-(r.smarts||0))/420+experience*.025+((S.masterField||S.mastDone)?.05:0);
  if(r.premium)chance=.008+Math.max(0,S.eng-92)/100+Math.max(0,S.smarts-88)/160+Math.max(0,experience-5)*.015;
  if(S.econ==='recession')chance*=.7;chance=Math.max(.01,Math.min(r.premium ? .12 : .48,chance));
  if(Math.random()>=chance){S.rsTry=(S.rsTry||0)+1;fx({happiness:-3});S.jobApplications=S.jobApplications||[];S.jobApplications.push({year:gameYear(),company:r.company||'International client',role:r.t,result:'Rejected — remote application'});log(`Your application for ${r.t} was rejected or the client chose another candidate. Your current main job remains unchanged.`);realismNotice('Remote application unsuccessful',`International remote roles are competitive. Improve relevant experience, English, portfolio evidence and interview performance before trying again.`);hint();render();return;}
  if(current)recordCareer(current,true);
  const record=(S.careerRecords||{})[track],level=Math.max(record?record.level||0:0,current&&current.trackId===track?current.level||0:0);
  const salaryUSD=Math.round((r.usd||0)*(S.wrEra||1));
  const orgs={
    'cold':'Veloce Global Contact Services','supp':'Northbridge Customer Operations','dev':'Veloce Cloud Inc.','ana':'Boreal International Business Services',
    'bookkeep':'Cedarline Finance Operations','arremote':'Boreal Finance Services','eval':'Pioneer Data Quality Network','finremote':'Boreal Asset Group','biremote':'Atlas Analytics Partners','devremote':'Veloce Cloud Inc.','uspremium':'Northstar International Analytics',
    'p15-rem-law-review':'Northstar Legal Process Services','p15-rem-jr-fullstack':'Veloce Cloud Inc.','p15-rem-systems-architect':'Nexus Data Systems','p15-rem-fin-controller':'Boreal Asset Group','p15-rem-customer-success':'Clearpath Customer Success','p15-rem-growth':'Horizon Digital Growth',
    'p15-rem-legal-ops':'Axiom Legal Operations','p15-rem-compliance-analyst':'ComplyAdvantage Remote','p15-rem-junior-data-analyst':'Databricks Partner Analytics','p15-rem-qa-engineer':'Testlio Remote QA','p15-rem-product-manager':'Remote SaaS Product Studio','p15-rem-financial-reporting':'Boreal Financial Reporting','p15-rem-ux-designer':'Toptal Design Network','p15-rem-technical-writer':'Stripe Docs Contractor Network','p15-rem-clinical-data':'IQVIA Remote Clinical Data','p15-rem-regulatory-affairs':'Freyr Regulatory Remote','p15-rem-health-informatics':'Epic Remote Analyst Network','p15-rem-esg-analyst':'Sustainalytics Remote','p15-rem-cybersecurity-analyst':'Arctic Wolf Remote GRC'
  };
  const company=orgs[r.id]||'International Remote Employer';
  const benefits={medical:false,social:false,pension:false,bonus:0,leave:10,remote:'Fully remote · USD contract',hours:r.hrs||40,contract:'International contractor; no guaranteed employer benefits'};
  const oldTitle=current?current.title:null;
  S.job={trackId:track,level,title:r.t,salary:salaryUSD,perf:Math.max(45,(current&&current.perf)||48),years:0,company,companyId:`remote_${r.id}_${gameYear()}`,industry:'International remote work',companyFactor:1,isRemoteUSD:true,visaSponsorship:false,benefits,stress:r.st||4,remotePerks:r.perks||'Benefits depend on the contract.'};
  S.remote=null;S.remoteJob=null;S.retired=false;S.lastSalary=salaryUSD;S.vacationCap=20;S.vacationDays=Math.min(S.vacationDays||0,20);
  S.jobApplications=S.jobApplications||[];S.jobApplications.push({year:gameYear(),company,role:r.t,result:'Hired — remote job replaced main employment'});
  fx({happiness:8});log(`You accepted ${r.t} at ${company}, paid in USD. ${oldTitle?`You left ${oldTitle}; it is no longer your current job.`:'This is now your main salaried job.'} The contract does not itself grant an immigration visa and does not guarantee healthcare, pension or paid leave.`);
  realismNotice('Remote offer accepted — main job updated',`${r.t} at ${company}. Gross pay: ${usd(salaryUSD)}/year. Your previous job was closed and recorded in career history; you do not receive two full-time salaries. Employer-sponsored immigration is not included in this remote contract.`);
  hint();render();
}
searchRemote=p15SearchRemote;
quitRemote=function(){
  if(S&&S.job&&S.job.isRemoteUSD){quitJob();return;}
  if(S&&S.remote){S.remote=null;log('Legacy remote contract closed.');render();return;}
  hint('There is no separate remote contract to quit.');
};
const P15_searchCurrentRemoteBefore=p15SearchRemote;
/* The same-title remote route uses its dedicated offer terms, but we also
   clear any stale legacy side-job field when it succeeds. */
const P15_searchCurrentTitleBefore=searchCurrentRemoteOffer;
searchCurrentRemoteOffer=function(){
  const before=S&&S.job;P15_searchCurrentTitleBefore();
  if(S&&S.job&&S.job.isRemoteUSD){S.remote=null;S.remoteJob=null;}
};

/* Old saves sometimes carried S.remote beside S.job. Convert that contract
   to the main job on load/render and skip the old second-salary yearly hook. */
const P15_renderBeforeRemoteMigration=render;
render=function(){p15AdoptLegacyRemote();return P15_renderBeforeRemoteMigration();};
const P15_p10YearBeforeRemoteUnstack=p10Year;
p10Year=function(){p15AdoptLegacyRemote();return P15_p10YearBeforeRemoteUnstack();};
/* Remote vacancies inspired by the supplied version's US/UK company list. */
[
  {id:'p15-rem-law-review',t:'Remote legal document review analyst',eng:78,smarts:62,usd:21000,deg:'law',st:4,track:'law',exp:0,perks:'Cross-border contract review; jurisdiction-specific advice is not part of the role; benefits depend on the contractor agreement.'},
  {id:'p15-rem-jr-fullstack',t:'Junior remote full-stack developer',eng:75,smarts:55,usd:28000,deg:'cs',st:4,track:'tech',exp:0,perks:'Technical interview and portfolio required; paid leave and insurance are employer-dependent.'},
  {id:'p15-rem-systems-architect',t:'Senior remote systems architect',eng:88,smarts:82,usd:58000,deg:'cs',st:6,track:'tech',exp:5,premium:true,perks:'Rare senior contract; substantial production experience, architecture interviews and strong references expected.'},
  {id:'p15-rem-fin-controller',t:'Remote financial analyst / controller',eng:80,smarts:68,usd:36000,deg:'business',st:5,track:'finance',exp:3,perks:'Financial modelling and reporting deadlines; benefits vary by contract and the client may require overlap with its time zone.'},
  {id:'p15-rem-customer-success',t:'Bilingual customer success specialist',eng:70,smarts:42,usd:16000,deg:null,st:3,track:'entry',exp:0,perks:'Time-zone coverage and performance targets; paid leave and health insurance may not be included.'},
  {id:'p15-rem-growth',t:'Remote digital growth / SEO strategist',eng:76,smarts:52,usd:22000,deg:null,st:4,track:'entry',exp:1,perks:'Portfolio-led hiring; campaign budgets, analytics evidence and client communication matter.'}
].forEach(r=>{if(!REMOTE.some(x=>x.id===r.id))REMOTE.push(r);});

/* All successful remote applications now become the player's only main job.
   A rejection leaves the existing job untouched. A contractor offer is not a visa. */
function p15RemoteTrack(r){
  if(r.track)return r.track;
  if(r.deg==='cs')return 'tech';if(r.deg==='business')return 'finance';if(r.deg==='law')return 'law';
  const t=String(r.t||'').toLowerCase();if(/analyst|account|bookkeep|financial|finance|compliance/.test(t))return 'finance';
  if(/develop|engineer|data|software|systems|technical/.test(t))return 'tech';return 'entry';
}
function p15AdoptLegacyRemote(){
  if(!S||!S.remote)return;
  if(S.job&&S.job.isRemoteUSD){S.remote=null;S.remoteJob=null;return;}
  if(S.age<18){S.remote=null;S.remoteJob=null;return;}
  const old=S.job?{...S.job}:null, r=S.remote, listing=REMOTE.find(x=>x.id===r.id), track=p15RemoteTrack(listing||r);
  if(old)recordCareer(old,true);
  const cr=(S.careerRecords||{})[track],level=cr?cr.level||0:0;
  S.job={trackId:track,level,title:r.title||listing?.t||'Remote contractor',salary:Math.max(0,Number(r.usd)||0),perf:45,years:0,company:r.company||'International Remote Contractor',companyId:`legacy_remote_${S.age}`,industry:'International remote work',isRemoteUSD:true,visaSponsorship:false,companyFactor:1,stress:r.st||4,benefits:{medical:false,social:false,pension:false,bonus:0,leave:10,remote:'Fully remote · USD contract',hours:40,contract:'Legacy remote contract — no guaranteed benefits'},remotePerks:r.perks||listing?.perks||'Benefits depend on contract.'};
  S.lastSalary=S.job.salary;S.retired=false;S.remote=null;S.remoteJob=null;
  log(`Save compatibility update: your existing remote contract is now your main job, replacing ${old?old.title+' at '+(old.company||'your former employer'):'the empty main-job slot'}. A second full-time salary is no longer counted.`);
}
function p15SearchRemote(id){
  if(!S||S.age<18)return hint('Full-time remote roles start at 18.');
  const r=REMOTE.find(x=>x.id===id);if(!r)return hint('This remote vacancy is no longer available.');
  const why=p12RemoteEligibility(r);if(why)return hint(why);
  if(S.pendingJobOffer)return hint('Resolve the pending work-visa sponsorship case before changing jobs.');
  if(S.country!==S.home&&!p12CanWorkWithoutSponsor())return hint('This remote contractor role does not sponsor a visa. You need a status that independently permits this work before replacing an overseas employer.');
  if(S.didW===S.age)return hint('You have already used your remote-job application this year.');
  S.didW=S.age;
  const track=p15RemoteTrack(r),experience=trackExperience(track),current=S.job?{...S.job,benefits:{...(S.job.benefits||{})}}:null;
  let chance=.035+Math.max(0,S.eng-(r.eng||0))/260+Math.max(0,S.smarts-(r.smarts||0))/420+experience*.025+((S.masterField||S.mastDone)?.05:0);
  if(r.premium)chance=.008+Math.max(0,S.eng-92)/100+Math.max(0,S.smarts-88)/160+Math.max(0,experience-5)*.015;
  if(S.econ==='recession')chance*=.7;chance=Math.max(.01,Math.min(r.premium ? .12 : .48,chance));
  if(Math.random()>=chance){S.rsTry=(S.rsTry||0)+1;fx({happiness:-3});S.jobApplications=S.jobApplications||[];S.jobApplications.push({year:gameYear(),company:r.company||'International client',role:r.t,result:'Rejected — remote application'});log(`Your application for ${r.t} was rejected or the client chose another candidate. Your current main job remains unchanged.`);realismNotice('Remote application unsuccessful',`International remote roles are competitive. Improve relevant experience, English, portfolio evidence and interview performance before trying again.`);hint();render();return;}
  if(current)recordCareer(current,true);
  const record=(S.careerRecords||{})[track],level=Math.max(record?record.level||0:0,current&&current.trackId===track?current.level||0:0);
  const salaryUSD=Math.round((r.usd||0)*(S.wrEra||1));
  const orgs={
    'cold':'Veloce Global Contact Services','supp':'Northbridge Customer Operations','dev':'Veloce Cloud Inc.','ana':'Boreal International Business Services',
    'bookkeep':'Cedarline Finance Operations','arremote':'Boreal Finance Services','eval':'Pioneer Data Quality Network','finremote':'Boreal Asset Group','biremote':'Atlas Analytics Partners','devremote':'Veloce Cloud Inc.','uspremium':'Northstar International Analytics',
    'p15-rem-law-review':'Northstar Legal Process Services','p15-rem-jr-fullstack':'Veloce Cloud Inc.','p15-rem-systems-architect':'Nexus Data Systems','p15-rem-fin-controller':'Boreal Asset Group','p15-rem-customer-success':'Clearpath Customer Success','p15-rem-growth':'Horizon Digital Growth'
  };
  const company=orgs[r.id]||'International Remote Employer';
  const benefits={medical:false,social:false,pension:false,bonus:0,leave:10,remote:'Fully remote · USD contract',hours:r.hrs||40,contract:'International contractor; no guaranteed employer benefits'};
  const oldTitle=current?current.title:null;
  S.job={trackId:track,level,title:r.t,salary:salaryUSD,perf:Math.max(45,(current&&current.perf)||48),years:0,company,companyId:`remote_${r.id}_${gameYear()}`,industry:'International remote work',companyFactor:1,isRemoteUSD:true,visaSponsorship:false,benefits,stress:r.st||4,remotePerks:r.perks||'Benefits depend on the contract.'};
  S.remote=null;S.remoteJob=null;S.retired=false;S.lastSalary=salaryUSD;S.vacationCap=20;S.vacationDays=Math.min(S.vacationDays||0,20);
  S.jobApplications=S.jobApplications||[];S.jobApplications.push({year:gameYear(),company,role:r.t,result:'Hired — remote job replaced main employment'});
  fx({happiness:8});log(`You accepted ${r.t} at ${company}, paid in USD. ${oldTitle?`You left ${oldTitle}; it is no longer your current job.`:'This is now your main salaried job.'} The contract does not itself grant an immigration visa and does not guarantee healthcare, pension or paid leave.`);
  realismNotice('Remote offer accepted — main job updated',`${r.t} at ${company}. Gross pay: ${usd(salaryUSD)}/year. Your previous job was closed and recorded in career history; you do not receive two full-time salaries. Employer-sponsored immigration is not included in this remote contract.`);
  hint();render();
}
searchRemote=p15SearchRemote;
quitRemote=function(){
  if(S&&S.job&&S.job.isRemoteUSD){quitJob();return;}
  if(S&&S.remote){S.remote=null;log('Legacy remote contract closed.');render();return;}
  hint('There is no separate remote contract to quit.');
};
const P15_searchCurrentRemoteBefore=p15SearchRemote;
/* The same-title remote route uses its dedicated offer terms, but we also
   clear any stale legacy side-job field when it succeeds. */
const P15_searchCurrentTitleBefore=searchCurrentRemoteOffer;
searchCurrentRemoteOffer=function(){
  const before=S&&S.job;P15_searchCurrentTitleBefore();
  if(S&&S.job&&S.job.isRemoteUSD){S.remote=null;S.remoteJob=null;}
};

/* Old saves sometimes carried S.remote beside S.job. Convert that contract
   to the main job on load/render and skip the old second-salary yearly hook. */
const P15_renderBeforeRemoteMigration=render;
render=function(){p15AdoptLegacyRemote();return P15_renderBeforeRemoteMigration();};
const P15_p10YearBeforeRemoteUnstack=p10Year;
p10Year=function(){p15AdoptLegacyRemote();return P15_p10YearBeforeRemoteUnstack();};

/* ================= PHASE 16 — IDEAS MERGED FROM THE ALTERNATE BUILD =================
   Interactive phone, childhood enrichment, family outings, and purpose-specific
   requests for parental support. These features are deliberately non-lethal. */
function p16OwnPhone(){
  if(!S||!Array.isArray(S.inventory))return null;
  return S.inventory.find(i=>i&&i.cat==='phone'&&!i.broken&&(i.life==null||i.age==null||i.age<i.life))||null;
}
function p16IsSmartphone(item){
  if(!item)return false;
  const y=gameYear(),model=String(item.model||'').toLowerCase();
  return y>=2009&&/(iphone|galaxy s|galaxy note|nexus|pixel|blackberry|omnia|smartphone)/.test(model);
}
function p16EscapeText(t){return String(t||'').slice(0,100).replace(/[<>]/g,'').replace(/\s+/g,' ').trim();}
function openLifePhone(){
  if(S.age<10)return hint('Your own phone usually unlocks around age 10–13.');
  const item=p16OwnPhone();
  if(!item)return hint('You need a working phone first. You may receive one from your parents or buy one in Shopping.');
  $('p16-phone-model').textContent=item.model||'Your phone';
  p16RenderPhoneScreen();
  $('life-phone-modal').classList.remove('hidden');
}
function closeLifePhone(){const el=$('life-phone-modal');if(el)el.classList.add('hidden');}
function p16PhoneLogKey(kind,target){return `${gameYear()}:${kind}:${target||'self'}`;}
function p16TextTargets(){
  const fam=(S.family||[]).filter(m=>m&&m.alive!==false&&['Mother','Father','Sibling','Partner','Spouse','Child'].includes(m.role)).map(m=>({id:m.id,name:m.name,role:m.role,bond:m.bond,person:m,source:'family'}));
  const fr=(S.friends||[]).map(m=>({id:m.id,name:m.name,role:'Friend',bond:m.bond,person:m,source:'friend'}));
  return fam.concat(fr).slice(0,10);
}
function p16RenderPhoneScreen(){
  const screen=$('p16-phone-screen'),item=p16OwnPhone();if(!screen)return;
  if(!item){screen.innerHTML='<p class="muted">Your phone is broken or no longer usable. Visit Shopping for a replacement.</p>';return;}
  const smart=p16IsSmartphone(item),targets=p16TextTargets(),year=gameYear();
  const textButtons=targets.length?targets.map(t=>{
    const key=p16PhoneLogKey('text',t.id),used=!!((S.p16PhoneActions||{})[key]);
    return `<div class="p16-phone-item"><div><b>${t.name}</b> <span class="muted">· ${t.role}</span></div><button class="btn" ${used?'disabled':''} onclick="p16PhoneAction('text','${t.id}')">${used?'Already messaged this year':'Send a check-in message'}</button></div>`;
  }).join(''):'<p class="muted">You do not have anyone to message yet. Build friendships through school, work and activities.</p>';
  const social=smart&&year>=2009?`<div style="margin-top:12px;border-top:1px solid var(--line);padding-top:10px"><b>Social feed</b><p class="muted" style="margin:4px 0 6px">Post once per year. Friends may react positively—or barely notice.</p><input id="p16-post-caption" type="text" maxlength="100" placeholder="Write a short update…" style="width:100%"><button class="btn" ${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('post')]?'disabled':''} onclick="p16PhoneAction('post')">${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('post')]?'Already posted this year':'Publish update'}</button><button class="btn" ${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('photo')]?'disabled':''} onclick="p16PhoneAction('photo')">Take a photo and save the memory</button></div>`:'';
  const music=year>=2010?`<div class="acts" style="margin-top:6px"><button class="btn" onclick="p16PhoneAction('music')">Play downloaded music · free</button><button class="btn" ${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('stream')]?'disabled':''} onclick="p16PhoneAction('stream')">Subscribe to music streaming</button></div>`:`<button class="btn" onclick="p16PhoneAction('music')">Listen to saved music / radio · free</button>`;
  screen.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center"><span class="muted" style="font-size:.76rem">${year} · ${smart?'Smartphone':'Mobile phone'}</span><span class="badge badge-cyan">Personal device</span></div><p style="margin:8px 0 12px">Text people, save memories, listen to music and—if your device supports it—post to a social feed. Each activity has its own yearly limit.</p><section><h3>Messages</h3>${textButtons}</section><section style="margin-top:12px;border-top:1px solid var(--line);padding-top:10px"><h3>Entertainment</h3><button class="btn" ${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('game')]?'disabled':''} onclick="p16PhoneAction('game')">Play a mobile game</button>${music}</section>${social}<section style="margin-top:12px;border-top:1px solid var(--line);padding-top:10px"><b>Saved memories (${(S.p16PhonePosts||[]).length})</b>${(S.p16PhonePosts||[]).slice(-3).reverse().map(x=>`<div class="p16-phone-item"><b>${x.year}</b> · ${x.caption}</div>`).join('')||'<p class="muted" style="margin-top:5px">Your first photo or post will appear here.</p>'}</section>`;
}
function p16PhoneAction(kind,targetId){
  const item=p16OwnPhone();if(!item)return hint('You need a working phone.');
  S.p16PhoneActions=S.p16PhoneActions||{};const key=p16PhoneLogKey(kind,kind==='text'?targetId:null);
  if(S.p16PhoneActions[key])return hint('You have already done that this year.');
  if(kind==='text'){
    const t=p16TextTargets().find(x=>x.id===targetId);if(!t)return hint('That contact is no longer available.');
    S.p16PhoneActions[key]=true;
    if(Math.random()<(.55+(Number(t.bond)||0)/240)){
      t.person.bond=clamp((Number(t.person.bond)||0)+3);fx({happiness:1,social:2});
      log(`You messaged ${t.name} to check in. They responded warmly and you felt more connected.`);
    }else{fx({social:1});log(`You messaged ${t.name}. They were busy and replied briefly, but you were glad you reached out.`);}
  }else if(kind==='post'){
    if(!p16IsSmartphone(item)||gameYear()<2009)return hint('This phone and year do not support social-media posting yet.');
    S.p16PhoneActions[key]=true;const caption=p16EscapeText($('p16-post-caption')?.value||'A little moment from today');const likes=Math.max(0,Math.round((S.social||0)/12+rnd(8)-2));
    S.p16PhonePosts=S.p16PhonePosts||[];S.p16PhonePosts.push({year:gameYear(),caption,likes});S.p16PhonePosts=S.p16PhonePosts.slice(-30);
    if(likes>=4){fx({happiness:3,social:2});log(`You posted “${caption}” and received ${likes} positive reactions.`);}else{fx({happiness:-1,social:1});log(`You posted “${caption}”. It received only ${likes} reactions, and you reminded yourself that likes do not define your worth.`);}
  }else if(kind==='photo'){
    if(!p16IsSmartphone(item)||gameYear()<2009)return hint('A capable camera phone is needed for this feature.');
    S.p16PhoneActions[key]=true;const caption=`Photo memory from ${gameYear()}`;S.p16PhonePosts=S.p16PhonePosts||[];S.p16PhonePosts.push({year:gameYear(),caption,likes:0});S.p16PhonePosts=S.p16PhonePosts.slice(-30);fx({happiness:3});log(`You saved a photo memory from ${gameYear()}.`);
  }else if(kind==='game'){
    S.p16PhoneActions[key]=true;fx({happiness:2});log(`You played a game on your ${item.model}. It gave you a relaxing break.`);
  }else if(kind==='music'){
    S.p16PhoneActions[key]=true;fx({happiness:2});log('You listened to music on your phone and relaxed for a while.');
  }else if(kind==='stream'){
    const localFactor=S.country==='egy'?p14EgyptPriceIndex(gameYear()):(typeof prOf==='function'?prOf(gameYear(),S):1);const localAmount=Math.round((S.country==='egy'?1200:65)*localFactor);const cost=p12LocalCurrencyInternal(localAmount,S.country,gameYear());if(S.wealth<cost){realismNotice('Subscription not affordable',`The yearly music subscription costs about ${money(cost)} in ${C().cur}. You can keep listening to downloaded music for free.`);return;}
    S.p16PhoneActions[key]=true;S.wealth-=cost;S.expenses=(S.expenses||0)+cost;fx({happiness:3});log(`You paid ${money(cost)} for a year of music streaming.`);
  }
  render();if(!$('life-phone-modal').classList.contains('hidden')){ $('p16-phone-model').textContent=item.model||'Your phone';p16RenderPhoneScreen(); }
}
function p16FamilyWeekend(){
  if(S.p16FamilyWeekendYear===S.age)return hint('You already had a family outing this year.');
  const people=(S.family||[]).filter(m=>m&&m.alive!==false&&['Mother','Father','Sibling','Child'].includes(m.role));
  const heads=Math.min(6,people.length+1),egy=S.country==='egy';
  const factor=egy?(typeof p14EgyptPriceIndex==='function'?p14EgyptPriceIndex(gameYear()):1):(typeof prOf==='function'?prOf(gameYear(),S):1);
  const localCost=Math.round(((egy?500:25)+Math.max(0,heads-1)*(egy?180:9))*factor);
  const cost=p12LocalCurrencyInternal(localCost,S.country,gameYear());
  let familyPays=false;
  if(S.age<18&&S.famWealth>0){const odds=[.08,.48,.86][Math.max(0,Math.min(2,S.famWealth))];familyPays=Math.random()<odds;}
  if(!familyPays&&S.wealth<cost)return hint(`The outing costs about ${money(cost)}. Save up or wait for your family to be able to afford it.`);
  if(!familyPays){S.wealth-=cost;S.expenses=(S.expenses||0)+cost;}else log('Your parents paid for the family outing.');
  S.p16FamilyWeekendYear=S.age;people.forEach(m=>m.bond=clamp((m.bond||0)+5));fx({happiness:5,social:3});
  log(`You spent time with your family on a weekend outing${familyPays?' paid for by your parents':` costing ${money(cost)}`}. It was a welcome break from routine.`);render();
}
function p16ChildActivity(type){
  if(S.age<8||S.age>17)return hint('These school-age activities are available from ages 8–17.');
  S.p16ChildActivityYears=S.p16ChildActivityYears||{};const key=`${gameYear()}:${type}`;if(S.p16ChildActivityYears[key])return hint('You already took this activity this year.');
  const opts={sport:{label:'a sports club',egy:13,other:55,fx:{health:5,social:3,happiness:2}},art:{label:'an art or music class',egy:12,other:48,fx:{happiness:4,social:2,smarts:1}},coding:{label:'a coding / science club',egy:22,other:85,fx:{smarts:5,happiness:2,social:1}}};const o=opts[type];if(!o)return;
  const localBase=S.country==='egy'?o.egy*100:o.other;const localFactor=S.country==='egy'?(typeof p14EgyptPriceIndex==='function'?p14EgyptPriceIndex(gameYear()):1):(typeof prOf==='function'?prOf(gameYear(),S):1);const localCost=Math.round(localBase*localFactor);
  const cost=p12LocalCurrencyInternal(localCost,S.country,gameYear());let parentsPay=false;
  if(S.age<18&&S.famWealth>0){let chance=[.05,.5,.85][Math.max(0,Math.min(2,S.famWealth))]*(.55+(bestBond()/220));if(cost>familySupportCapUSD()*2)chance*=.45;parentsPay=Math.random()<Math.min(.95,chance);}
  if(!parentsPay&&S.wealth<cost)return hint(`You need about ${money(cost)} for ${o.label}. Ask your parents for support or save your allowance.`);
  if(!parentsPay){S.wealth-=cost;S.expenses=(S.expenses||0)+cost;}S.p16ChildActivityYears[key]=true;fx(o.fx);log(`You joined ${o.label}${parentsPay?' with your parents paying':' and paid '+money(cost)}. You learned something and built confidence.`);render();
}
function p16ParentAskPanel(){
  if(S.age>25||!parents().length||S.p16AskedParentYear===S.age)return '';
  const purposes=S.age<18?['School supplies / books','Transport or school trip','Course or activity','Phone or repair','Medical expense','Emergency need']:['Bills or rent deposit','English / exam course','Laptop or work equipment','Local master’s application','Overseas study application','Medical expense','Emergency need'];
  const options=purposes.map(x=>`<option value="${x}">${x}</option>`).join('');
  const factor=S.country==='egy'?(typeof p14EgyptPriceIndex==='function'?p14EgyptPriceIndex(gameYear()):1):(typeof prOf==='function'?prOf(gameYear(),S):1);const defaultLocal=Math.max(1,Math.round((S.country==='egy'?500:25)*factor));
  return `<section class="card"><h3>Ask your parents for specific help</h3><p class="muted">A specific request is more realistic than receiving a random amount. Their answer depends on family finances, your relationship and how much you ask for. Amounts are in ${C().cur}.</p><div class="row"><label for="p16-ask-purpose">Purpose</label><select id="p16-ask-purpose" style="width:62%">${options}</select></div><div class="row"><label for="p16-ask-amount">Amount requested (${C().cur})</label><input id="p16-ask-amount" type="number" min="1" value="${defaultLocal}" style="width:145px"></div><button class="btn" onclick="p16AskParent()">Ask for this amount</button></section>`;
}
function p16AskParent(){
  if(S.age>25||!parents().length)return hint('Your parents are not available to support this request.');
  if(S.p16AskedParentYear===S.age)return hint('You have already asked your parents for support this year.');
  const local=Number($('p16-ask-amount')?.value),purpose=$('p16-ask-purpose')?.value||'an expense';
  if(!Number.isFinite(local)||local<=0)return hint('Enter a positive amount.');
  const amount=p12LocalCurrencyInternal(local,S.country,gameYear());
  const wealth=Math.max(0,Math.min(2,S.famWealth||0)),cap=familySupportCapUSD();
  let chance=[.22,.56,.82][wealth]*(.42+(bestBond()/175));
  if(amount>cap)chance*=Math.max(.06,cap/amount);
  if(amount>cap*3)chance*=.35;
  if(S.age>=18)chance*=.82;
  chance=Math.max(.02,Math.min(.94,chance));S.p16AskedParentYear=S.age;
  if(Math.random()<chance){S.wealth+=amount;parents().forEach(m=>m.bond=clamp(m.bond+2));fx({happiness:2});log(`Your parents agreed to help with ${purpose} and gave you ${money(amount)}.`);realismNotice('Parents agreed to help',`You received ${money(amount)} for ${purpose}. Keep in mind that your parents have their own bills and may not be able to repeat this support.`);}
  else{parents().forEach(m=>m.bond=clamp(m.bond-2));fx({happiness:-2});log(`Your parents refused the request for ${money(amount)} for ${purpose}. They may not have enough money, or the request was too large.`);realismNotice('Parents could not help',`Your request for ${money(amount)} for ${purpose} was refused. Consider a smaller amount, saving, a scholarship, or a different plan.`);}
  render();
}
const P16_viewFamilyBefore=viewFamily;
viewFamily=function(){return P16_viewFamilyBefore()+p16ParentAskPanel();};
const P16_viewActivitiesBefore=viewActivities;
viewActivities=function(){
  let html=P16_viewActivitiesBefore();
  const phone=p16OwnPhone();
  html+=`<section class="card"><h3>Phone & digital life</h3><p class="muted">${phone?`You own a ${phone.model}. Messaging, games, music and eligible social features are available.`:'No working phone yet. Parents may offer a first phone around ages 11–13, or you can shop for one once Shopping unlocks.'}</p><button class="btn" ${!phone||S.age<10?'disabled':''} onclick="openLifePhone()">Open phone</button></section>`;
  const ageActivities=S.age>=8&&S.age<18?`<section class="card"><h3>School-age interests</h3><p class="muted">Clubs build skills and friendships but cost money. A parent may agree to pay, depending on family finances.</p><div class="acts"><button class="btn" onclick="p16ChildActivity('sport')">Join a sports club</button><button class="btn" onclick="p16ChildActivity('art')">Art or music class</button><button class="btn" onclick="p16ChildActivity('coding')">Coding / science club</button></div></section>`:'';
  const familyCount=(S.family||[]).filter(m=>m&&m.alive!==false&&['Mother','Father','Sibling','Child'].includes(m.role)).length;
  const outing=`<section class="card"><h3>Family time</h3><p class="muted">A low-key weekend outing can improve family relationships. Spending depends on how many people come and local prices; your parents may pay if you are young and the family can afford it.</p><button class="btn" ${S.p16FamilyWeekendYear===S.age?'disabled':''} onclick="p16FamilyWeekend()">${S.p16FamilyWeekendYear===S.age?'Already had a family outing this year':'Plan a family weekend outing'}<small>${familyCount+1} possible travellers · cost estimated on selection</small></button></section>`;
  return html+ageActivities+outing;
};

/* ================= PHASE 17 — FAMILY, HOST-COUNTRY WORK, TRAVEL & NEEDS =================
   Adds relation-labelled family requests, country-specific sponsored hiring,
   an asylum decision path, a detailed editable trip planner and savings goals.
*/

/* Keep historical exchange-rate data in the simulation, but remove its history / outlook wording from the visible UI. */
if (COUNTRIES.egy) {
  COUNTRIES.egy.hiddenCurrencyDescription = COUNTRIES.egy.d;
  COUNTRIES.egy.d = 'A large, diverse economy with substantial differences between cities, employers and household budgets. Imported goods can be expensive relative to local salaries, and building enough savings to move out or buy a home can take many years.';
}

function p17Relation(m, capital=false) {
  if (!m) return capital ? 'Your family member' : 'your family member';
  const name = String(m.name || '').replace(/[<>]/g, '').trim();
  let relation = 'family member';
  if (m.role === 'Mother') relation = 'mother';
  else if (m.role === 'Father') relation = 'father';
  else if (m.role === 'Sibling') relation = m.g === 'f' ? 'sister' : 'brother';
  else if (m.role === 'Partner') relation = 'partner';
  else if (m.role === 'Spouse') relation = 'spouse';
  else if (m.role === 'Child') relation = 'child';
  else if (m.role === 'Friend') relation = 'friend';
  const result = `your ${relation}${name ? ` (${name})` : ''}`;
  return capital ? result.charAt(0).toUpperCase() + result.slice(1) : result;
}

/* Use relationship titles in prompts, not a bare name that hides who is asking. */
const P17_requestStateBefore = p14RequestState;
p14RequestState = function() {
  const r = P17_requestStateBefore();
  if (r && r.m) r.name = p17Relation(r.m, true);
  return r;
};

/* Family requests now include siblings as well as parents and state a concrete need. */
p12GenerateFamilyNeed = function() {
  if (!S || S.age < 18 || S.p12NeedAge === S.age || S.familyNeed || S.parentNeed) return;
  S.p12NeedAge = S.age;
  const eligible = (S.family || []).filter(m => m && m.alive !== false && ['Mother','Father','Sibling'].includes(m.role));
  if (!eligible.length) return;
  const seniorParents = eligible.filter(m => ['Mother','Father'].includes(m.role) && m.age >= 58).length;
  const chance = Math.min(.30, (S.famWealth === 0 ? .17 : S.famWealth === 1 ? .11 : .06) + seniorParents * .035);
  if (Math.random() > chance) return;
  const m = pick(eligible);
  const reasons = m.role === 'Sibling'
    ? ['monthly groceries and bills','rent deposit or overdue rent','medical treatment or medicine','school / university fees','work clothes or transport for a new job','an urgent phone repair','a family event','temporary loss of income']
    : m.age >= 58
      ? ['monthly groceries','electricity and gas bills','blood tests and medication','hospital treatment','urgent plumbing repair','rent and household bills','home maintenance']
      : ['monthly groceries','electricity and gas bills','helping a younger sibling with school fees','a hospital or clinic bill','medication','a family wedding expense','urgent home repair','temporary loss of income'];
  const reason = pick(reasons), home = S.home || 'egy';
  const local = p14SuggestedFamilyNeed(reason, S.famWealth, gameYear(), home);
  const need = {id:m.id,reason,amountHomeLocal:local,amountHomeCurrency:(COUNTRIES[home]||COUNTRIES.egy).cur,amountInternal:localCurrencyInternal(local,home,gameYear()),year:gameYear()};
  if (m.role === 'Sibling') S.familyNeed = need; else S.parentNeed = need;
  log(`${p17Relation(m, true)} asked for help with ${reason}. The request is about ${money(need.amountInternal)} in today's player-currency equivalent; you can send a smaller amount or refuse.`);
  realismNotice('A family member asks for help',`${p17Relation(m, true)} needs help with ${reason}. You decide how much to send, if anything. Refusing may hurt trust; sending too much may delay your own rent, education, phone or housing goals.`);
};

p14RespondFamilyNeed = function(send) {
  const r = p14RequestState();
  if (!r) return;
  const m = r.m;
  if (send) {
    const value = Number($('p14-family-request-amount')?.value);
    if (!Number.isFinite(value) || value < 0) return hint('Enter a valid amount of zero or more.');
    const transfer = p12LocalCurrencyInternal(value, S.country, gameYear());
    const fee = S.country !== (S.home || S.country) ? transfer * .025 : 0;
    const total = transfer + fee;
    if (total > S.wealth) return hint(`You cannot afford ${money(total)} including the estimated transfer fee. Choose a smaller amount or decline.`);
    S.wealth -= total; S.expenses = (S.expenses || 0) + total;
    S.bill = S.bill || {}; S.bill.familySupport = (S.bill.familySupport || 0) + total;
    if (S.yearPopup) S.yearPopup.expenses = (S.yearPopup.expenses || 0) + total;
    if (m) {
      const ratio = r.amountInternal > 0 ? transfer / r.amountInternal : 0;
      m.bond = clamp(m.bond + (ratio >= .9 ? 9 : ratio >= .35 ? 5 : ratio > 0 ? 2 : -3));
    }
    if (transfer > 0) {
      fx({happiness: Math.min(3, Math.round(transfer / Math.max(1, r.amountInternal) * 2))});
      log(`You sent ${money(transfer)} to ${p17Relation(m)} for ${r.reason}${fee ? `; the international transfer fee was ${money(fee)}` : ''}. The requested amount was ${money(r.amountInternal)} and you chose what fit your budget.`);
    } else {
      fx({happiness:-2}); log(`You sent no money to ${p17Relation(m)} for ${r.reason}. They understood your budget was tight, but felt disappointed.`);
    }
  } else {
    if (m) m.bond = clamp(m.bond - 7);
    fx({happiness:-3}); log(`You declined ${p17Relation(m)}'s request for ${r.reason}. They were disappointed, but you protected your own limited savings.`);
  }
  if (r.kind === 'parent') S.parentNeed = null; else S.familyNeed = null;
  const el = document.getElementById('p14-parent-request-modal'); if (el) el.remove();
  hint(); render();
};

/* Also make ordinary gifts and recurring support explain the relationship in the Life log. */
transferFamilyCustom = function(id) {
  const m = S.family.find(x => x.id === id); if (!m || m.alive === false) return hint('This family member is not available.');
  const local = Number($(`gift-${id}`)?.value); if (!Number.isFinite(local) || local <= 0) return hint('Enter an amount greater than zero.');
  const amount = p12LocalCurrencyInternal(local, S.country, gameYear()); if (S.wealth < amount) return hint('You do not have enough cash for that transfer.');
  S.wealth -= amount; m.bond = clamp(m.bond + (amount > p12LocalCurrencyInternal(S.country === 'egy' ? 1000 : 25, S.country, gameYear()) ? 5 : 2));
  fx({happiness:1,social:1}); log(`You transferred ${money(amount)} to ${p17Relation(m)}.`); hint(); render();
};
p12GiveFamily = function(id) {
  const m = S.family.find(x => x.id === id); if (!m) return;
  const local = Number($(`p12-gift-${id}`)?.value); if (!Number.isFinite(local) || local <= 0) return hint('Enter an amount greater than zero.');
  const amount = p12LocalCurrencyInternal(local, S.country, gameYear()); if (amount > S.wealth) return hint('Not enough cash.');
  S.wealth -= amount; m.bond = clamp(m.bond + (amount > p12LocalCurrencyInternal(S.country === 'egy' ? 1000 : 25, S.country, gameYear()) ? 5 : 2));
  log(`You gave ${money(amount)} to ${p17Relation(m)}.`); render();
};
p12SetAllowance = function(id) {
  const m = S.family.find(x => x.id === id); if (!m) return;
  const local = Number($(`p12-allow-${id}`)?.value); if (!Number.isFinite(local) || local < 0) return hint('Enter zero or a positive annual amount.');
  m.allowLocal = local; m.allowCurrency = S.country; m.allow = p12LocalCurrencyInternal(local, S.country, gameYear());
  log(`You set ${p17Relation(m)}'s recurring allowance to ${money(m.allow)} per year.`); hint(); render();
};

/* Clear visible EGP history / forecast text while retaining the historic rate table and calculation functions in code. */
const P17_viewWorldBeforeCurrencyCleanup = viewWorld;
viewWorld = function() {
  let html = P17_viewWorldBeforeCurrencyCleanup();
  html = html.replace(/<section class="card"><h3>Egyptian pound history and outlook<\/h3>[\s\S]*?(?=<section class="card">|$)/, '');
  html = html.replace(/The US Dollar rose from 5\.5 EGP in 2007 to over 50 EGP today\. Holding USD protects wealth\./g, 'Imported goods can be expensive relative to local salaries.');
  return html + p17HostWorkSection() + p17AsylumPanel();
};

/* Country-specific work board: every employer, salary and sponsorship flag belongs to the country the player is actually living in. */
function p17HostWorkSection() {
  if (!S || S.country === S.home || !S.imm) return '';
  const c = COUNTRIES[S.country] || COUNTRIES.usa;
  const posts = (companyListFor(S.country) || []).slice();
  const trackRecord = S.careerRecords || {};
  const degree = S.degree;
  const score = p => {
    if (!degree) return p.degree == null ? 60 : 0;
    if (p.p15DegreeMajor === degree || p.degree === degree || (p.degrees || []).includes(degree) || (typeof p15RoleTrackRelevant === 'function' && p15RoleTrackRelevant(p, degree))) return 100;
    return p.degree == null ? 30 : 0;
  };
  posts.sort((a,b)=>score(b)-score(a));
  const status = S.undocumented || S.imm.stage === 'irregular' ? 'No valid status' : S.imm.stage === 'student' ? 'Student status — work is restricted' : S.imm.stage === 'post' ? 'Post-study job-search window' : S.imm.stage === 'pr' || S.imm.stage === 'gc' || S.imm.stage === 'citizen' || S.imm.stage === 'asylum' ? 'May work subject to the status / permit conditions' : 'Sponsorship or a separate work right may be required';
  const blockedStudent = S.imm.stage === 'student';
  const pendingAsylum = !!S.asylumCase;
  const listings = posts.slice(0, 24).map(p => {
    const rec = trackRecord[p.trackId], level = Math.max(0, Math.min(4, rec ? rec.level || 0 : 0));
    const title = (typeof p12RoleTitle === 'function' ? p12RoleTitle(p, level) : salaryTitle(p.trackId, level));
    const salary = jobSalaryForPost(p, level, S.country, gameYear());
    const allowedDegrees = p.degrees && p.degrees.length ? p.degrees : p.degree ? [p.degree] : [];
    const education = allowedDegrees.length ? allowedDegrees.map(d=>MAJORS[d]?.name||d).join(' / ') : 'Degree not always required';
    const sponsor = p.sponsorship ? '<span class="badge badge-mint">May sponsor</span>' : '<span class="badge badge-amber">No sponsorship</span>';
    const why = pendingAsylum ? 'An asylum claim is pending; this simulation does not assume it gives you immediate work permission.' : blockedStudent ? 'Student status may restrict hours and type of work; use permitted campus work for now.' : p12Eligibility(p);
    const noWork = !!why || (S.pendingJobOffer && S.pendingJobOffer.years >= 0);
    return `<details class="p17-posting"><summary>${p.name} · ${title} ${S.country !== S.home ? sponsor : ''}</summary>${PR(p.desc || 'Employer posting; duties and terms depend on the vacancy.')}${ROW('Country / market', c.n)}${ROW('Estimated annual gross pay', p.isRemoteUSD ? usd(salary) : money(salary))}${ROW('Education', education)}${ROW('Experience', `${p.minExp || 0} relevant year(s) minimum`)}${ROW('Benefits', benefitsSummary({medical:p.medical,social:p.social,bonus:p.bonus,leave:p.leave,remote:p.remote,hours:p.hours,contract:p.contract}))}${ROW('Work-visa sponsorship', S.country === S.home ? 'Not needed for a home-country role' : p.sponsorship ? 'Employer is willing to consider sponsorship; government approval is separate' : 'Not offered for this vacancy')}${noWork ? PR(`Not currently applicable: ${why}`) : ''}<button class="btn" onclick="applyCompany('${p.id}')" ${noWork ? 'disabled' : ''}>${noWork ? 'Not currently available' : 'Apply to this local employer'}</button></details>`;
  }).join('');
  return SEC(`Jobs in ${c.n}`, PR(`These employers and vacancies are generated for ${c.n}, not ${COUNTRIES[S.home]?.n || 'your home country'}. Salaries, healthcare and sponsorship vary by company; a “may sponsor” label is not a visa guarantee.`)+ROW('Current immigration status',status)+PR(blockedStudent ? 'Finish or check your study conditions first. Some student visas allow limited hours or internships but do not allow unrestricted full-time work.' : 'Look for relevant roles, check sponsorship before accepting, and keep enough time for visa processing before your current permission expires.')+(listings || PR('No openings were generated this year; check again after the next age-up.')));
}

/* Asylum / protection is a separate uncertain branch. It does not promise approval, work authorisation or protection from removal. */
function p17AsylumPanel() {
  if (!S || S.country === S.home || !S.imm || ['citizen','pr','gc','asylum'].includes(S.imm.stage)) return '';
  if (S.asylumDecisionPending) {
    const d = S.asylumDecisionPending;
    return SEC('Protection claim refused — choose what happens next', PR(`The host country's decision-maker refused the claim based on “${d.reasonLabel}”. Refusal does not guarantee an immediate physical return, but your remaining options and any appeal rights depend on local law and your facts.`)+B('Seek an appeal / qualified legal review',`Estimated filing and advice cost ${money(imp(250))}; another uncertain processing period.`,'p17ChooseAsylumRefusal(\'appeal\')',S.wealth<imp(250))+B('Remain without valid status','You may stay in the game, but risks include exploitation, housing insecurity, status checks and future visa problems.','p17ChooseAsylumRefusal(\'stay\')')+B('Return home voluntarily','End your stay abroad and restart your plans at home.','p17ChooseAsylumRefusal(\'return\')'));
  }
  if (S.asylumCase) return SEC('Protection / asylum application',ROW('Ground raised',S.asylumCase.reasonLabel)+ROW('Evidence / support',S.asylumCase.evidenceLabel)+ROW('Processing',`${S.asylumCase.years || 0} of about 1 game year`)+PR('The outcome is uncertain. Eligibility depends on individual circumstances, evidence and the host country’s law. A pending claim does not automatically authorise work in this simulation.')+B('Withdraw the claim','This does not automatically renew any expired visa.','p17WithdrawAsylum()'));
  const opts = [
    ['orientation','Risk related to sexual orientation or gender identity'],
    ['persecution','Risk of persecution or serious harm if returned'],
    ['humanitarian','Humanitarian circumstances / unsafe conditions']
  ].map(([id,l])=>`<option value="${id}">${l}</option>`).join('');
  const evidence = `<option value="limited">Limited independent evidence</option><option value="some">Some supporting documents / credible records</option><option value="legal">Qualified legal support and supporting evidence</option>`;
  return SEC('Protection / asylum options',PR('If you genuinely fear persecution or serious harm, the game lets you explore a protection claim. Claims can be accepted or refused; rules, evidence standards, deadlines and work rights differ by country. This is a game system, not legal advice.')+`<label class="muted" for="p17-asylum-reason">Reason for seeking protection</label><select id="p17-asylum-reason" style="width:100%;margin:6px 0 10px">${opts}</select><label class="muted" for="p17-asylum-evidence">How supported is the claim?</label><select id="p17-asylum-evidence" style="width:100%;margin:6px 0 10px">${evidence}</select>`+B('Apply for protection / asylum',`Filing and translation cost about ${money(imp(120))}; approval is not guaranteed.`,'p17ApplyAsylum()',S.asylumAttempts>=2||S.wealth<imp(120)));
}
function p17ApplyAsylum() {
  if (!S || S.country === S.home || !S.imm) return hint('A protection claim is only available in a country outside your home country.');
  if (S.asylumCase || S.asylumDecisionPending) return hint('Resolve the current protection case first.');
  if ((S.asylumAttempts || 0) >= 2) return hint('You have used the two modeled attempts for this life.');
  const reasonId = $('p17-asylum-reason')?.value || 'persecution';
  const evidence = $('p17-asylum-evidence')?.value || 'limited';
  const reasons = {orientation:'sexual-orientation / gender-identity risk',persecution:'risk of persecution or serious harm',humanitarian:'humanitarian / unsafe conditions'};
  const labels = {limited:'limited evidence',some:'some supporting evidence',legal:'qualified legal support and evidence'};
  const fee = imp(120);
  if (S.wealth < fee) return hint(`You need ${money(fee)} for the modeled application and translation costs.`);
  S.wealth -= fee; S.expenses = (S.expenses || 0) + fee;
  S.asylumCase = {reason:reasonId,reasonLabel:reasons[reasonId]||reasons.persecution,evidence,evidenceLabel:labels[evidence]||labels.limited,years:0,appeal:false,startedYear:gameYear()};
  S.asylumAttempts = (S.asylumAttempts || 0) + 1;
  log(`You filed a protection claim in ${C().n}, citing ${S.asylumCase.reasonLabel}. Filing costs were ${money(fee)}; the outcome and any work rights remain uncertain.`);
  realismNotice('Protection claim filed',`Your claim in ${C().n} has entered the modeled process. A claim can be accepted or refused; do not assume a pending claim allows work or settles your immigration status.`);
  hint(); render();
}
function p17ChooseAsylumRefusal(action) {
  const d = S && S.asylumDecisionPending; if (!d) return;
  if (action === 'appeal') {
    const fee = imp(250);
    if (S.wealth < fee) return hint(`You need ${money(fee)} for the modeled appeal / legal review.`);
    S.wealth -= fee; S.expenses = (S.expenses || 0) + fee;
    S.asylumDecisionPending = null;
    S.asylumCase = {reason:d.reason,reasonLabel:d.reasonLabel,evidence:d.evidence,evidenceLabel:d.evidenceLabel,years:0,appeal:true,startedYear:gameYear()};
    log(`You requested an appeal / legal review of the refused protection claim. It will take more time and money, and can still be refused.`);
    realismNotice('Appeal lodged',`Your appeal is pending. The process may take time; it does not automatically create unrestricted work rights.`);
  } else if (action === 'stay') {
    S.asylumDecisionPending = null; S.undocumented = true; S.undocumentedYears = S.undocumentedYears || 0;
    S.imm = {stage:'irregular',left:0,yrs:0,tries:0}; S.futureVisaPenalty = (S.futureVisaPenalty || 0) + 1;
    log(`Your protection claim was refused. You chose to remain in ${C().n} without valid status; your future stays, informal income and risk are uncertain.`);
    realismNotice('You stayed after a refusal',`You can continue the simulation without status, but the game will model precarious work, exploitation, housing insecurity, checks and future visa difficulties.`);
  } else {
    S.asylumDecisionPending = null; S.asylumCase = null; S.undocumented = false;
    leaveAbroad(`After the protection claim was refused, you chose to return to ${COUNTRIES[S.home].n}. The application cost time and money, but you can plan your next steps at home.`);
    return;
  }
  hint(); render();
}
function p17WithdrawAsylum() {
  if (!S || !S.asylumCase) return;
  S.asylumCase = null; log('You withdrew your protection claim. This did not renew or extend any previous visa or work permission.'); hint(); render();
}

/* Process a protection case at age-up, without automatically forcing a return after a refusal. */
const P17_immYearBeforeAsylum = immYear;
immYear = function() {
  if (S && S.asylumCase) {
    const a = S.asylumCase; a.years = (a.years || 0) + 1;
    if (a.years < 1) { log(`Protection case processing continues in ${C().n}.`); return; }
    let chance = a.reason === 'orientation' ? (sameSex() ? (C().ssm ? .62 : .47) : .20) : a.reason === 'persecution' ? .43 : .32;
    chance += a.evidence === 'legal' ? .16 : a.evidence === 'some' ? .08 : -.08;
    chance += S.smarts >= 65 ? .02 : 0;
    chance = Math.max(.05, Math.min(.88, chance));
    S.asylumCase = null;
    if (Math.random() < chance) {
      S.undocumented = false; S.undocumentedWork = null;
      S.imm = {stage:'asylum',left:5,yrs:0,tries:0,route:'protection granted'};
      log(`Your protection claim was accepted in ${C().n}. You received a protected status in this simulation; renewal, travel rights and employment conditions still depend on the country.`);
      realismNotice('Protection granted',`Your claim was accepted. The game treats this status as permitting ordinary work, but actual work and travel rights are country-specific and subject to your documents.`);
    } else {
      S.asylumDecisionPending = {reason:a.reason,evidence:a.evidence,reasonLabel:a.reasonLabel,evidenceLabel:a.evidenceLabel};
      log(`Your protection claim was refused in ${C().n}. You were not automatically transported out of the country; you must choose whether to seek review, return voluntarily or stay without valid status.`);
    }
    return;
  }
  return P17_immYearBeforeAsylum();
};
const P17_canWorkBeforeAsylum = p12CanWorkWithoutSponsor;
p12CanWorkWithoutSponsor = function() {
  return P17_canWorkBeforeAsylum() || !!(S && S.imm && S.imm.stage === 'asylum' && !S.asylumCase);
};
const P17_eligibilityBeforeAsylum = p12Eligibility;
p12Eligibility = function(post) {
  if (S && S.asylumCase) return 'Your protection claim is pending; this game does not assume it grants immediate work authorisation.';
  return P17_eligibilityBeforeAsylum(post);
};

/* More specific annual leave / travel planner. The player controls food, shopping,
   host gifts, lodging, cabin class, duration and the exact leave requested. */
const P17_tripRenderBefore = p12RenderTravel;
p12RenderTravel = function() {
  let html = P17_tripRenderBefore();
  html = html.replace(/<div><label class="muted">Daily food, shopping and spending budget \(destination currency\)<\/label><input id="p12-trip-spend"[^>]*><\/div>/,
    '<div><label class="muted" for="p12-trip-spend">Daily food budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()" style="width:100%"></div><div><label class="muted" for="p17-trip-shopping">Daily shopping / clothes / souvenirs budget (destination currency)</label><input id="p17-trip-shopping" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" style="width:100%"></div>');
  html = html.replace('<div class="acts"><div><label class="muted">Return airfare class</label>',
    '<div style="margin:8px 0"><label class="muted" for="p17-trip-stay">Where will you stay?</label><select id="p17-trip-stay" onchange="p12RefreshTripQuote()" style="width:100%;margin-top:5px"><option value="hotel">Hotel (use selected quality)</option><option value="airbnb">Airbnb / serviced apartment</option><option value="motel">Motel / hostel / budget guesthouse</option><option value="parents">Parents’ home (family visit only)</option><option value="sibling">Brother’s / sister’s home (family visit only)</option><option value="friend">Friend’s home / staying with a host</option></select></div><div><label class="muted" for="p17-trip-night">Custom cost per night (destination currency; 0 = estimate / free host stay)</label><input id="p17-trip-night" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" style="width:100%"></div><div style="margin:8px 0"><label class="muted" for="p17-trip-leave-days">Days off requested from work</label><input id="p17-trip-leave-days" type="number" min="0" max="60" value="4" oninput="p12RefreshTripQuote()" style="width:100%"><p class="muted" style="margin-top:4px">Trip duration and leave days can differ. Paid days reduce your available annual-leave balance; your manager can refuse.</p></div><div class="acts"><div><label class="muted">Return airfare class</label>');
  html = html.replace('<div><label class="muted">Time off from work</label>',
    '<div style="margin-top:8px"><label class="muted" for="p17-trip-gift-type">Gift to bring</label><select id="p17-trip-gift-type" onchange="p12RefreshTripQuote()" style="width:100%"><option value="none">No gift</option><option value="sweets">Sweets / groceries / small souvenirs</option><option value="clothes">Clothes or a useful household gift</option><option value="medicine">Medicine / health items</option><option value="electronics">Electronics / a more expensive gift</option><option value="cash">Cash gift / contribution</option><option value="custom">Custom gift</option></select></div><div><label class="muted" for="p17-trip-gift-recipient">Gift recipient</label><select id="p17-trip-gift-recipient" style="width:100%"><option value="family">Family in general</option><option value="mother">Mother</option><option value="father">Father</option><option value="sibling">Brother / sister</option><option value="friend">Friend / host</option><option value="partner">Partner</option></select></div><div><label class="muted" for="p17-trip-gifts">One-time gift budget (destination currency)</label><input id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" style="width:100%"></div><div><label class="muted">Time off from work</label>');
  html = html.replace('Time off from work</label><select id="p12-trip-leave"', 'Time off / wage treatment</label><select id="p12-trip-leave"');
  return html;
};

const P17_tripQuoteBefore = p12TripQuote;
p12TripQuote = function() {
  const q = P17_tripQuoteBefore(); if (!q) return q;
  const staySelect = $('p17-trip-stay');
  let stay = staySelect?.value || 'hotel';
  const isFamilyVisit = q.d && q.d.id === 'trip-home';
  if (!isFamilyVisit && (stay === 'parents' || stay === 'sibling')) {
    stay = 'hotel'; if (staySelect) staySelect.value = 'hotel';
  }
  const defaultHotel = q.hotel;
  const customNight = Math.max(0, Number($('p17-trip-night')?.value) || 0);
  const freeStay = ['parents','sibling','friend'].includes(stay);
  if (stay === 'airbnb') q.hotel = Math.round(defaultHotel * .78);
  else if (stay === 'motel') q.hotel = Math.round(defaultHotel * .48);
  else if (freeStay) q.hotel = 0;
  else q.hotel = defaultHotel;
  if (customNight > 0) q.hotel = p12LocalCurrencyInternal(customNight * q.nights * q.rooms, q.d.country, gameYear());
  q.stayType = stay;
  q.lodgingLabel = ({hotel:`${$('p12-trip-hotel')?.value || 'comfort'} hotel`,airbnb:'Airbnb / serviced apartment',motel:'Motel / hostel / budget guesthouse',parents:'parents’ home',sibling:'brother’s / sister’s home',friend:'friend’s home / host stay'})[stay] || 'hotel';
  q.shoppingLocal = Math.max(0, Number($('p17-trip-shopping')?.value) || 0);
  q.shopping = p12LocalCurrencyInternal(q.shoppingLocal * q.days * q.people, q.d.country, gameYear());
  q.giftType = $('p17-trip-gift-type')?.value || 'none';
  q.giftRecipient = $('p17-trip-gift-recipient')?.value || 'family';
  q.giftLocal = Math.max(0, Number($('p17-trip-gifts')?.value) || 0);
  q.giftLabel = ({none:'no gift',sweets:'sweets / groceries / small souvenirs',clothes:'clothes / household gift',medicine:'medicine / health items',electronics:'electronics gift',cash:'cash gift / contribution',custom:'custom gift'})[q.giftType] || 'gift';
  q.gifts = q.giftType === 'none' ? 0 : p12LocalCurrencyInternal(q.giftLocal, q.d.country, gameYear());
  q.leaveDays = Math.max(0, Math.min(60, Math.floor(Number($('p17-trip-leave-days')?.value ?? q.days))));
  q.food = q.spend;
  q.total = q.airfare + q.transport + q.hotel + q.spend + q.activities + q.shopping + q.gifts;
  return q;
};
function p17RefreshTripQuote() {
  const q = p12TripQuote(), el = $('p12-trip-estimate'); if (!el || !q) return;
  const currency = COUNTRIES[q.d.country]?.cur || C().cur;
  el.innerHTML = `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><b>Estimated total</b><strong style="font-size:1.15rem;color:var(--mint)">${money(q.total)}</strong></div>${ROW(q.international?'Return airfare · '+q.classKey:'Local transport',money(q.airfare||q.transport))}${q.international?ROW('Local transport',money(q.transport)):''}${ROW(`Stay · ${q.lodgingLabel} · ${q.nights} night(s)`,money(q.hotel))}${ROW('Food / meals',money(q.spend))}${ROW('Activities',money(q.activities))}${ROW('Shopping / clothes',money(q.shopping))}${ROW(q.gifts?`Gift · ${q.giftLabel}`:'Gifts',money(q.gifts))}${ROW('Trip length',`${q.days} day(s) · ${q.people} traveller(s)`)}${ROW('Annual leave requested',`${q.leaveDays} day(s)`)}${PR(`Local spending fields are in ${currency}. Return-fare and hotel values are estimates, not bookable live quotes. If you stay with family or a friend, accommodation may be free, but food, gifts, transport and your host’s circumstances still matter.`)}`;
}
p12RefreshTripQuote = p17RefreshTripQuote;

/* This booking handler respects the manager's decision and paid-leave balance, then records all itemised costs. */
p12BookTrip = function(purpose='holiday') {
  const q = p12TripQuote(); if (!q) return hint('Choose a destination.');
  const leaveDays = q.leaveDays == null ? q.days : q.leaveDays;
  const leaveType = $('p12-trip-leave')?.value || 'paid'; let lost = 0;
  if (S.p17LastFamilyVisitYear === gameYear() && q.d.id === 'trip-home') return hint('You already completed a family visit this in-game year.');
  if (S.undocumented && q.international && q.d.country !== S.home) return hint('Without valid status, leaving for another country may prevent you from re-entering this country. You can plan local outings or decide to return home.');
  if (S.job && leaveType === 'unpaid') lost = Math.round((S.job.salary || 0) / 260 * leaveDays);
  if (S.wealth < q.total + lost) return hint(`The trip and any unpaid wages total about ${money(q.total + lost)}. You cannot afford this yet.`);
  if (S.job) {
    if (leaveType === 'paid' && leaveDays > (S.vacationDays || 0)) return hint(`You have ${Math.floor(S.vacationDays || 0)} paid-leave day(s). Request fewer days or choose unpaid leave.`);
    const approval = purpose === 'funeral' ? .92 : Math.min(.94,.53+(S.job.perf||45)/240+(S.job.benefits && S.job.benefits.leave ? .08 : 0)+(leaveDays<=5?.08:0)-(leaveDays>12?.16:0)-(leaveType==='unpaid'?.12:0));
    if (Math.random() > approval) { log(`${S.job.company || 'Your manager'} refused your ${purpose==='funeral'?'emergency funeral':'holiday'} leave request for ${leaveDays} day(s). You did not buy tickets and no travel expenses were charged.`); fx({happiness:-3}); realismNotice('Leave request refused',`Your manager refused ${leaveDays} day(s) off. No travel money was spent. You can try different dates, fewer days or a different leave arrangement.`); render(); return; }
    if (leaveType === 'paid') S.vacationDays = Math.max(0,(S.vacationDays||0)-leaveDays);
    else { S.wealth -= lost; S.income = Math.max(0,(S.income||0)-lost); S.expenses = (S.expenses||0)+lost; }
  } else if (S.imm && S.imm.stage === 'student' && Math.random() < .12) {
    log('Your university schedule / exam dates made the trip risky, so you postponed it.'); realismNotice('Trip postponed',`Your study or attendance schedule made this trip risky. You kept your money and can plan during a break.`); render(); return;
  }
  S.wealth -= q.total; S.expenses = (S.expenses||0)+q.total; S.bill = S.bill||{}; S.bill.travel=(S.bill.travel||0)+q.total;
  S.tripHistory = S.tripHistory || [];
  const record = {year:gameYear(),destination:q.d.name,destinationCountry:q.d.country,days:q.days,leaveDays,people:q.people,total:q.total,purpose,class:q.classKey,stay:q.lodgingLabel,food:q.spend,shopping:q.shopping,gifts:q.gifts,giftType:q.giftLabel};
  S.tripHistory.unshift(record); S.tripHistory=S.tripHistory.slice(0,20);
  if(q.d.id==='trip-home') S.p17LastFamilyVisitYear=gameYear();
  if(q.stayType==='parents'||q.stayType==='sibling') (S.family||[]).filter(m=>m&&m.alive!==false&&['Mother','Father','Sibling'].includes(m.role)).forEach(m=>m.bond=clamp(m.bond+4));
  if(q.gifts>0 && q.giftType!=='none') {
    let m=null;
    if(q.giftRecipient==='mother')m=(S.family||[]).find(x=>x.role==='Mother');
    else if(q.giftRecipient==='father')m=(S.family||[]).find(x=>x.role==='Father');
    else if(q.giftRecipient==='sibling')m=(S.family||[]).find(x=>x.role==='Sibling');
    else if(q.giftRecipient==='partner')m=partner();
    else if(q.giftRecipient==='friend')m=(S.friends||[])[0]||null;
    else m=(S.family||[]).find(x=>['Mother','Father','Sibling'].includes(x.role));
    if(m)m.bond=clamp(m.bond+Math.min(12,Math.max(2,Math.round(q.gifts/Math.max(1,q.giftLocal||1)*3+2))));
  }
  fx({happiness:Math.min(18,5+q.days*1.2),social:q.people>1?5:2});
  const companion=$('p12-trip-with')?.value||'solo';
  if(companion==='partner'&&partner())partner().bond=clamp(partner().bond+8);
  if(companion==='friend'&&S.friends&&S.friends.length)S.friends[0].bond=clamp(S.friends[0].bond+8);
  if(companion==='family')(S.family||[]).filter(m=>m.alive!==false&&['Mother','Father','Sibling','Child'].includes(m.role)).forEach(m=>m.bond=clamp(m.bond+5));
  if(purpose==='funeral'&&S.funeralNotice)S.funeralNotice=null;
  const giftLog=q.gifts?`; you brought ${q.giftLabel} for ${q.giftRecipient==='mother'?'your mother':q.giftRecipient==='father'?'your father':q.giftRecipient==='sibling'?'your brother / sister':q.giftRecipient==='partner'?'your partner':q.giftRecipient==='friend'?'your friend / host':'your family'} (${money(q.gifts)})`:'';
  const unpaidLog=lost?`; unpaid leave / missed wages ${money(lost)}`:'';
  log(`${purpose==='funeral'?'Funeral trip':q.d.id==='trip-home'?'Annual family visit':'Holiday'}: ${q.d.name}, ${q.days} day(s), ${q.people} traveller(s); ${q.international?`return ${q.classKey} airfare ${money(q.airfare)}`:`local transport ${money(q.transport)}`}; stay ${q.lodgingLabel} ${money(q.hotel)}; food ${money(q.spend)}; shopping ${money(q.shopping)}; activities ${money(q.activities)}${giftLog}${unpaidLog}. Total ${money(q.total+lost)}.`);
  realismNotice(purpose==='funeral'?'Family funeral trip':q.d.id==='trip-home'?'Annual family visit':'Holiday completed',`You spent ${money(q.total+lost)} on ${q.d.name} for ${q.days} day(s) and requested ${leaveDays} day(s) off. ${S.job?`Remaining paid leave: ${Math.floor(S.vacationDays||0)} day(s). `:''}The trip improved your mood and relationships, but slowed your savings goals.`);
  hint(); render();
};

/* Needs / goals: phones, clothing, study, family visits, health costs and a home deposit. */
const P17_NEED_TYPES = {
  phone:{label:'Phone / phone replacement',egy:18000,usd:350},
  clothes:{label:'New clothes / work wardrobe',egy:9000,usd:180},
  laptop:{label:'Laptop / work equipment',egy:45000,usd:850},
  visit:{label:'Visit family / airfare and gifts',egy:65000,usd:1200},
  holiday:{label:'Holiday / trip with friends',egy:22000,usd:450},
  medical:{label:'Medical treatment / emergency fund',egy:18000,usd:500},
  course:{label:'English course / certification',egy:12000,usd:250},
  rent:{label:'Rent deposit / moving out',egy:90000,usd:1800},
  home:{label:'Home / property down payment',egy:650000,usd:25000}
};
function p17GoalDefaultLocal(type) {
  const item=P17_NEED_TYPES[type]||P17_NEED_TYPES.phone;
  const y=gameYear();
  if(S.country==='egy')return Math.round(item.egy*(typeof p14EgyptPriceIndex==='function'?p14EgyptPriceIndex(y):1));
  const c=COUNTRIES[S.country]||COUNTRIES.usa, infl=typeof prOf==='function'?prOf(y,S):1;
  return Math.round(item.usd*(c.rate||1)*infl);
}
function p17NeedsGoalsPanel() {
  if(!S||S.age<16)return '';
  S.p17Goals=Array.isArray(S.p17Goals)?S.p17Goals:[];
  const opts=Object.entries(P17_NEED_TYPES).filter(([id])=>S.age>=18||!['rent','home'].includes(id)).map(([id,v])=>`<option value="${id}">${v.label}</option>`).join('');
  const goals=S.p17Goals;
  const rows=goals.length?goals.map(g=>{
    const left=Math.max(0,g.targetInternal-(g.savedInternal||0)),percent=Math.min(100,Math.round((g.savedInternal||0)/Math.max(1,g.targetInternal)*100));
    const amountId=`p17-fund-${g.id}`;
    return `<div class="card" style="padding:12px;margin-top:8px;border-color:${g.done?'var(--mint)':'var(--line)'}"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><b>${g.label}</b><span class="badge ${g.done?'badge-mint':'badge-violet'}">${g.done?'Completed':percent+'%'}</span></div><div class="row"><span>Target</span><b>${money(g.targetInternal)}</b></div><div class="row"><span>Saved toward goal</span><b>${money(g.savedInternal||0)}</b></div><div class="row"><span>Still needed</span><b>${money(left)}</b></div><div class="bar" style="height:7px;margin:8px 0"><div class="fill" style="width:${percent}%;background:var(--mint)"></div></div>${g.done?PR(`Completed in ${g.completedYear||gameYear()}. The action is recorded in your Life log.`):`<div class="row"><label for="${amountId}">Add savings (${C().cur})</label><input id="${amountId}" type="number" min="1" placeholder="Amount to save" style="width:145px"></div><div class="acts"><button class="btn" onclick="p17FundGoal('${g.id}')">Move money into goal</button><button class="btn" onclick="p17CompleteGoal('${g.id}')" ${left>0?'disabled':''}>Use savings / complete goal</button></div>`}</div>`;
  }).join(''):'<p class="muted">No active goals yet. Create one for something you need, then set aside money gradually.</p>';
  return `<section class="card" style="border-color:var(--cyan)"><h3>Needs & savings goals</h3><p class="muted">Plan for a phone, work clothes, a laptop, a family visit, treatment, English courses, a rent deposit or a home down payment. Goals do not buy the item automatically—you decide when to use the saved amount.</p><div class="row"><label for="p17-goal-type">Goal</label><select id="p17-goal-type" onchange="p17SetGoalDefault()" style="width:65%">${opts}</select></div><div class="row"><label for="p17-goal-label">Name / details</label><input id="p17-goal-label" type="text" maxlength="70" placeholder="e.g. visit family next summer" style="width:65%"></div><div class="row"><label for="p17-goal-target">Target amount (${C().cur})</label><input id="p17-goal-target" type="number" min="1" value="${p17GoalDefaultLocal('phone')}" style="width:145px"></div><button class="btn btn-primary" onclick="p17CreateGoal()">Create savings goal</button>${rows}</section>`;
}
function p17SetGoalDefault() { const el=$('p17-goal-target'),type=$('p17-goal-type')?.value;if(el&&type)el.value=p17GoalDefaultLocal(type); }
function p17CreateGoal() {
  const type=$('p17-goal-type')?.value||'phone',local=Number($('p17-goal-target')?.value),userLabel=String($('p17-goal-label')?.value||'').replace(/[<>]/g,'').trim();
  if(!Number.isFinite(local)||local<=0)return hint('Enter a target amount greater than zero.');
  S.p17Goals=Array.isArray(S.p17Goals)?S.p17Goals:[];
  if(S.p17Goals.filter(g=>!g.done).length>=8)return hint('Complete or remove a goal before adding another.');
  const id='g'+Math.random().toString(36).slice(2,9),amount=p12LocalCurrencyInternal(local,S.country,gameYear()),label=userLabel||P17_NEED_TYPES[type].label;
  S.p17Goals.push({id,type,label,targetInternal:amount,savedInternal:0,createdYear:gameYear(),done:false});
  log(`You set a savings goal: ${label}, targeting ${money(amount)}. This gives you a plan for an important need instead of spending the money on something else.`);hint();render();
}
function p17FundGoal(id) {
  const g=(S.p17Goals||[]).find(x=>x.id===id);if(!g||g.done)return;
  const local=Number($(`p17-fund-${id}`)?.value);if(!Number.isFinite(local)||local<=0)return hint('Enter an amount greater than zero.');
  const desired=p12LocalCurrencyInternal(local,S.country,gameYear()),left=Math.max(0,g.targetInternal-(g.savedInternal||0)),amount=Math.min(desired,left);
  if(S.wealth<amount)return hint(`You only have ${money(S.wealth)} available. Add a smaller amount to the goal.`);
  if(amount<=0)return hint('This goal is already fully funded.');
  S.wealth-=amount;g.savedInternal=(g.savedInternal||0)+amount;S.expenses=(S.expenses||0);log(`You moved ${money(amount)} into your “${g.label}” savings goal. ${money(Math.max(0,g.targetInternal-g.savedInternal))} remains.`);hint();render();
}
function p17CompleteGoal(id) {
  const g=(S.p17Goals||[]).find(x=>x.id===id);if(!g||g.done)return;
  if((g.savedInternal||0)<g.targetInternal)return hint(`Save another ${money(g.targetInternal-(g.savedInternal||0))} first.`);
  const saved=g.savedInternal;g.savedInternal=0;g.done=true;g.completedYear=gameYear();
  if(g.type==='phone'){
    S.inventory=S.inventory||[];S.inventory.push({uid:'p17-'+id,key:'p17-budget-phone',cat:'phone',type:'phone',model:'Budget smartphone',price:saved,age:0,life:3,hap:1,hp:0,soc:1,tier:1,homeId:null,broken:false,insured:false,portable:true});
  } else if(g.type==='clothes') {
    S.inventory=S.inventory||[];S.inventory.push({uid:'p17-'+id,key:'p17-work-clothes',cat:'fashion',type:'fashion',model:g.label,price:saved,age:0,life:2,hap:1,hp:0,soc:1,tier:1,homeId:null,broken:false,insured:false,portable:true});
  }
  fx({happiness: g.type==='visit'||g.type==='holiday'?5:2});
  log(`You used ${money(saved)} to complete your goal: ${g.label}. The savings became a purchase or funded plan; your liquid cash fell, but you reached an important milestone.`);hint();render();
}
const P17_viewActivitiesBeforeGoals=viewActivities;
viewActivities=function(){ return P17_viewActivitiesBeforeGoals()+p17NeedsGoalsPanel(); };
const P17_netWorthBeforeGoals=netWorth;
netWorth=function(){ return P17_netWorthBeforeGoals()+(S&&Array.isArray(S.p17Goals)?S.p17Goals.reduce((sum,g)=>sum+(!g.done?(g.savedInternal||0):0),0):0); };

/* Polish the career view, use role-specific names instead of only generic track titles, and group degree matches first for every major. */
function p17CurrentJobCard() {
  if(!S.job)return '';
  const j=S.job,b=j.benefits||{},remote=!!j.isRemoteUSD;
  const salary=remote?`${usd(j.salary)}/year in USD · approx. ${money(j.salary)}/year equivalent`:money(j.salary)+'/year';
  const status=remote?'REMOTE · USD CONTRACT':S.country!==S.home&&j.visaSponsorship?'HOST-COUNTRY EMPLOYMENT · SPONSORSHIP ATTACHED':'ACTIVE MAIN JOB';
  return `<section class="card" style="border-color:var(--violet);background:linear-gradient(150deg,rgba(139,92,246,.13),var(--card));box-shadow:0 8px 28px rgba(0,0,0,.2)"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><span class="badge badge-violet">${status}</span><span class="muted" style="font-size:.78rem">Only one main job can be active</span></div><h3 style="margin-top:10px">${j.title}</h3><p style="font-size:.92rem;color:var(--muted)">${j.company||'Employer'} · ${(COUNTRIES[S.country]||COUNTRIES.usa).n}</p><div class="row"><span>Annual gross pay</span><b>${salary}</b></div><div class="row"><span>Seniority / track level</span><b>${(j.level||0)+1}/5</b></div><div class="row"><span>Tenure</span><b>${j.years||0} year(s)</b></div><div class="row"><span>Healthcare</span><b>${b.medical?'Employer medical cover':'No employer cover'}</b></div><div class="row"><span>Paid annual leave</span><b>${b.leave||14} days · ${Math.floor(S.vacationDays||0)} available</b></div><div class="row"><span>Work arrangement</span><b>${b.remote||'On-site'} · ${b.hours||40} h/week</b></div><div class="row"><span>Visa sponsorship</span><b>${S.country===S.home?'Not needed at home':remote?'Not included':j.visaSponsorship?'Employer willing to sponsor':'Not attached to this role'}</b></div>${PR(`Benefits: ${benefitsSummary(b)}. A remote USD role replaces any previous main job; it does not stack a second salary.`)}<div class="acts"><button class="btn" onclick="workHarder()" ${S.worked?'disabled':''}>Work harder</button><button class="btn" onclick="askPromotion()" ${S.promoTried?'disabled':''}>Request promotion</button></div>${B('Resign / leave this job','Your work history remains recorded; income from the role stops.','quitJob()')}</section>`;
}
function p17CareerSearchBoard() {
  if(!S||S.age<18)return '';
  const list=companyListFor(S.country)||[],degree=S.degree,trackMap={law:'law',business:'finance',cs:'tech',medicine:'medical',biology:'bio'};
  const match=p=>!!degree&&((p.p15DegreeMajor===degree)||(p.degree===degree)||(p.degrees||[]).includes(degree)||(p.trackId===trackMap[degree]));
  const sorted=list.slice().sort((a,b)=>Number(match(b))-Number(match(a)));
  const levelFor=p=>Math.max(0,Math.min(4,(S.careerRecords||{})[p.trackId]?.level||0));
  const card=p=>{
    const level=levelFor(p),title=p12RoleTitle(p,level),pay=jobSalaryForPost(p,level,S.country,gameYear());
    const req=p12Eligibility(p),degList=p.degrees&&p.degrees.length?p.degrees:p.degree?[p.degree]:[];
    const ed=degList.length?degList.map(x=>MAJORS[x]?.name||x).join(' / '):'Degree may not be required';
    const sponsor=S.country!==S.home?(p.sponsorship?'<span class="badge badge-mint">May sponsor</span>':'<span class="badge badge-amber">No sponsorship</span>'):'';
    return `<details class="p17-posting"><summary><b>${p.name}</b> · ${title} ${sponsor}</summary>${PR(p.desc||'Role duties depend on the employer and department.')}${ROW('Estimated annual gross pay',money(pay))}${ROW('Relevant degree',ed)}${ROW('Experience',`${p.minExp||0} year(s) minimum`)}${ROW('Hours / contract',`${p.hours||40} hours/week · ${p.contract||'Terms vary'}`)}${ROW('Benefits',benefitsSummary({medical:p.medical,social:p.social,bonus:p.bonus,leave:p.leave,remote:p.remote,hours:p.hours,contract:p.contract}))}${S.country!==S.home?ROW('Work sponsorship',p.sponsorship?'Employer may sponsor; immigration approval is separate':'This employer does not sponsor this vacancy'):''}${req?PR(`Not currently available: ${req}`):''}<button class="btn" onclick="applyCompany('${p.id}')" ${req?'disabled':''}>${req?'Requirements not met':`Apply · ${title}`}</button></details>`;
  };
  const relevant=sorted.filter(match),other=sorted.filter(p=>!match(p));
  const recommend=(relevant.length?relevant:sorted.filter(p=>!p.degree&&!p.degrees)).slice(0,8);
  const shown=new Set(recommend.map(p=>p.id));
  return SEC(`Job search · ${C().n}`,PR(`Job postings are generated for your current country. ${degree?`Your ${MAJORS[degree]?.name||degree} degree places related options first, including entry-level and adjacent roles.`:'You can still pursue general entry-level roles, while many specialist vacancies require a degree.'} Applications may be rejected, and salaries / perks differ by employer.`)+`<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:10px 0"><div class="card" style="padding:10px"><span class="muted" style="font-size:.72rem">APPLICATIONS</span><b style="display:block">${S.jobAppsAge===S.age?Math.max(0,4-(S.jobAppsCount||0)):4} left</b></div><div class="card" style="padding:10px"><span class="muted" style="font-size:.72rem">EXPERIENCE</span><b style="display:block">${allExperience()} yr</b></div><div class="card" style="padding:10px"><span class="muted" style="font-size:.72rem">STATUS</span><b style="display:block;font-size:.78rem">${S.job?'Employed':'Searching'}</b></div></div>${recommend.length?`<h4 style="margin:12px 0 4px;color:var(--cyan)">Recommended for your degree / background</h4>${recommend.map(card).join('')}`:PR('No matching vacancies this year; check the general openings below.')}${other.length?`<details style="margin-top:12px"><summary>Other openings (${other.length})</summary>${other.map(card).join('')}</details>`:''}`);
}
const P17_viewCareerBeforeBoard = viewCareer;
viewCareer = function() {
  let html=P17_viewCareerBeforeBoard();
  html=html.replace(/<section class="card"><h3>Your current job<\/h3>[\s\S]*?(?=<section class="card">|$)/, p17CurrentJobCard());
  html=html.replace(/<section class="card"><h3>Local job postings · [^<]*<\/h3>[\s\S]*?(?=<section class="card">|$)/, p17CareerSearchBoard());
  return html;
};

/* Preserve exactly one main job across changes of employer, remote contracts and migration. */
const P17_moveAbroadBeforeSingleJob = moveAbroad;
moveAbroad = function(dest,fund,cover) {
  if(S&&S.job) recordCareer({...S.job},true);
  if(S){S.remote=null;S.remoteJob=null;S.pendingJobOffer=null;}
  P17_moveAbroadBeforeSingleJob(dest,fund,cover);
  if(S){S.remote=null;S.remoteJob=null;S.job=null;}
};
const P17_leaveAbroadBeforeSingleJob = leaveAbroad;
leaveAbroad = function(msg) {
  if(S){S.remote=null;S.remoteJob=null;S.asylumCase=null;S.asylumDecisionPending=null;S.undocumented=false;S.undocumentedWork=null;}
  P17_leaveAbroadBeforeSingleJob(msg);
  if(S){S.remote=null;S.remoteJob=null;S.job=null;}
};
const P17_applyCompanyBeforeSingleJob = applyCompany;
applyCompany = function(id) {
  const result=P17_applyCompanyBeforeSingleJob(id);
  if(S&&S.job){S.remote=null;S.remoteJob=null;}
  return result;
};

/* The original start screen / HUD and old saves may still hold the exchange outlook panel or note. Hide it in rendered output only. */
const P17_renderBeforeUiCleanup = render;
render = function() {
  if(S){
    if(S.job && (S.remote || S.remoteJob)){S.remote=null;S.remoteJob=null;}
    if(S.job && S.job.isRemoteUSD){S.remote=null;S.remoteJob=null;}
    if(S.undocumentedWork){S.job=null;S.remote=null;S.remoteJob=null;}
    if(S.yearPopup&&S.yearPopup.note)S.yearPopup.note=S.yearPopup.note.replace(/\n\nUSD\/EGP context:[\s\S]*/,'');
  }
  const r=P17_renderBeforeUiCleanup();
  const fxPanel=$('p14-fx-panel');if(fxPanel)fxPanel.remove();
  const startDesc=$('country-desc');if(startDesc&&startDesc.textContent)startDesc.textContent=startDesc.textContent.replace(/The US Dollar rose from 5\.5 EGP in 2007 to over 50 EGP today\. Holding USD protects wealth\./g,'Imported goods can be expensive relative to local salaries.');
  return r;
};

/* ================= PHASE 18 — CAREER WIDTH, COUNTRY TRAVEL & FAMILY LANGUAGE =================
   Makes all degree pathways discoverable, keeps country/year vacancies stable, expands
   the travel planner, uses relationship labels for money requests, and tightens status rules.
*/

/* One stable job market per country and game year, including all specialist pathways.
   The player's own degree / postgraduate specialisation sorts first; other career
   directions remain discoverable with their real qualification requirements. */
const P18_companyListBeforeAllMajors = (typeof P15_companyListBeforeMajorMerge === 'function') ? P15_companyListBeforeMajorMerge : companyListFor;
companyListFor = function(country = S ? S.country : 'usa') {
  if (!S) return P18_companyListBeforeAllMajors(country);
  p12InitState(S);
  const year = gameYear();
  const cacheKey = `p18-all-major-${country}-${year}`;
  if (Array.isArray(S.jobBoards?.[cacheKey])) return S.jobBoards[cacheKey];
  let base = [];
  try { base = P18_companyListBeforeAllMajors(country) || []; } catch (_) { base = []; }
  const merged = Array.isArray(base) ? base.slice() : [];
  const seen = new Set(merged.map(p => p.id));
  for (const major of Object.keys(P15_DEGREE_JOBS || {})) {
    const posts = p15DegreePosts(country, major) || [];
    for (const post of posts) {
      if (!seen.has(post.id)) { merged.push(post); seen.add(post.id); }
    }
  }
  const trackFor = {law:'law',business:'finance',cs:'tech',medicine:'medical',biology:'bio'};
  const degree = S.degree;
  const masterMap = {finance:'business',accounting:'business',mba:'business',analytics:'business',data:'cs',computer:'cs',law:'law',health:'biology',biology:'biology'};
  const master = masterMap[String(S.masterField || '').toLowerCase()] || null;
  const score = p => {
    if (degree && p.p15DegreeMajor === degree) return 120;
    if (degree && ((p.degree === degree) || (p.degrees || []).includes(degree))) return 110;
    if (degree && p15RoleTrackRelevant(p, degree)) return 100;
    if (master && p.p15DegreeMajor === master) return 80;
    if (master && ((p.degree === master) || (p.degrees || []).includes(master))) return 70;
    if (!p.degree && !(p.degrees || []).length && !p.p15DegreeMajor) return 30;
    return 10;
  };
  merged.sort((a,b) => score(b) - score(a));
  S.jobBoards[`${country}-${year}`] = merged;
  S.jobBoards[cacheKey] = merged;
  return merged;
};

/* Family-help cards use relationship first — e.g. “Your mother (Mariam)” —
   while normal family profiles continue to show each person's name normally. */
const P18_familyRequestsBeforeRelationshipLabels = p12FamilyRequests;
p12FamilyRequests = function() {
  let html = P18_familyRequestsBeforeRelationshipLabels();
  for (const m of (S && S.family) || []) {
    if (!m || !m.name || typeof p17Relation !== 'function') continue;
    const safeName = String(m.name);
    const rel = p17Relation(m, true);
    html = html.replaceAll(`${safeName} asked for help with`, `${rel} asked for help with`);
    html = html.replaceAll(`${safeName} needs help with`, `${rel} needs help with`);
    html = html.replaceAll(`${safeName} needs help`, `${rel} needs help`);
    html = html.replaceAll(`${safeName}’s request`, `${rel}’s request`);
    html = html.replaceAll(`${safeName}'s request`, `${rel}'s request`);
  }
  return html;
};

function p18RelabelNewestLog(m, patterns) {
  if (!S || !m || !m.name || !Array.isArray(S.logRows) || !S.logRows.length) return;
  const row = S.logRows[0];
  if (!row || typeof row.t !== 'string') return;
  for (const prefix of patterns || []) row.t = row.t.replace(prefix, p17Relation(m, true));
}
const P18_answerParentBeforeRelationshipLog = p12AnswerParentNeed;
p12AnswerParentNeed = function(yes) {
  const id = S && S.parentNeed && S.parentNeed.id;
  const m = id && S.family.find(x => x.id === id);
  P18_answerParentBeforeRelationshipLog(yes);
  p18RelabelNewestLog(m, [m?.name ? `${m.name} asked` : '', m?.name ? `help ${m.name}` : '', m?.name ? `${m.name}` : ''].filter(Boolean));
};
const P18_answerSpecificBeforeRelationshipLog = p12RespondSpecific;
p12RespondSpecific = function(yes) {
  const id = S && S.familyNeed && S.familyNeed.id;
  const m = id && S.family.find(x => x.id === id);
  P18_answerSpecificBeforeRelationshipLog(yes);
  p18RelabelNewestLog(m, [m?.name ? `${m.name}` : ''].filter(Boolean));
};

/* Add many city-level holiday destinations across the countries that can be played.
   Prices stay estimates and are calculated in the selected destination's currency. */
const P18_CITY_DESTINATIONS = [
  ['trip-manchester','Manchester','gbr'],['trip-edinburgh','Edinburgh','gbr'],
  ['trip-nice','Nice / French Riviera','fra'],['trip-berlin','Berlin','deu'],['trip-munich','Munich','deu'],
  ['trip-rome','Rome','ita'],['trip-milan','Milan','ita'],['trip-amsterdam','Amsterdam','nld'],
  ['trip-new-york','New York','usa'],['trip-los-angeles','Los Angeles','usa'],['trip-chicago','Chicago','usa'],
  ['trip-vancouver','Vancouver','can'],['trip-montreal','Montreal','can'],
  ['trip-dubai-city','Dubai','uae'],['trip-abu-dhabi','Abu Dhabi','uae'],
  ['trip-riyadh','Riyadh','sau'],['trip-jeddah','Jeddah','sau'],
  ['trip-sydney','Sydney','aus'],['trip-melbourne','Melbourne','aus'],
  ['trip-auckland','Auckland','nzl'],['trip-queenstown','Queenstown','nzl'],
  ['trip-istanbul-city','Istanbul','tur'],['trip-cappadocia','Cappadocia','tur'],
  ['trip-mumbai','Mumbai','ind'],['trip-delhi','Delhi','ind'],['trip-lahore','Lahore','pak'],
  ['trip-lagos','Lagos','nga'],['trip-sao-paulo','São Paulo','bra'],
  ['trip-tokyo','Tokyo','jpn'],['trip-osaka','Osaka','jpn'],
  ['trip-seoul','Seoul','kor'],['trip-busan','Busan','kor'],['trip-singapore','Singapore','sgp']
];
const P18_destinationOptionsBeforeCityExpansion = p12DestinationOptions;
p12DestinationOptions = function() {
  const arr = P18_destinationOptionsBeforeCityExpansion();
  const seen = new Set(arr.map(d => d.id));
  for (const [id,name,country] of P18_CITY_DESTINATIONS) {
    if (!seen.has(id) && COUNTRIES[country]) arr.push({id,name,country,local:country === S.country,cityDestination:true});
  }
  if (!seen.has('trip-custom')) arr.push({id:'trip-custom',name:'Custom city / country…',country:S.country,local:true,custom:true});
  return arr;
};

function p18MoneyDefaultFood(country) {
  const local = {egy:650,ind:900,nga:18000,pak:1200,bra:85,tur:500,usa:45,gbr:35,can:45,deu:32,fra:35,ita:30,nld:35,uae:50,sau:45,aus:55,nzl:50,jpn:4200,kor:38000,sgp:45};
  return local[country] || (country === 'egy' ? 650 : 30);
}
function p18MoneyDefaultTransport(country) {
  const local = {egy:220,ind:250,nga:3500,pak:350,bra:25,tur:180,usa:22,gbr:18,can:25,deu:15,fra:18,ita:15,nld:18,uae:25,sau:22,aus:28,nzl:25,jpn:2400,kor:22000,sgp:18};
  return local[country] || (country === 'egy' ? 220 : 18);
}
function p18DestinationCountry() {
  const sel = $('p12-trip-dest');
  if (sel && sel.value === 'trip-custom') return $('p18-trip-country')?.value || S.country;
  return p12DestinationOptions().find(d => d.id === (sel?.value || ''))?.country || S.country;
}
function p18TripDestinationChanged() {
  const country = p18DestinationCountry();
  const food = $('p12-trip-spend'), transport = $('p18-trip-local-transport');
  if (food && food.dataset.userEdited !== '1') food.value = p18MoneyDefaultFood(country);
  if (transport && transport.dataset.userEdited !== '1') transport.value = p18MoneyDefaultTransport(country);
  p12RefreshTripQuote();
}

const P18_renderTravelBeforeCustomDestination = p12RenderTravel;
p12RenderTravel = function() {
  let html = P18_renderTravelBeforeCustomDestination();
  html = html.replace('id="p12-trip-dest" onchange="p12RefreshTripQuote()"','id="p12-trip-dest" onchange="p18TripDestinationChanged()"');
  html = html.replace('id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()"','id="p12-trip-spend" type="number" min="0" value="650" oninput="this.dataset.userEdited=\'1\';p12RefreshTripQuote()"');
  const countryOptions = Object.entries(COUNTRIES).map(([k,c]) => `<option value="${k}" ${k===S.country?'selected':''}>${c.n} (${c.cur})</option>`).join('');
  const customFields = `<details style="margin-top:10px"><summary>Custom destination — choose any supported country and type a city</summary><label class="muted" for="p18-trip-city">City / destination name</label><input id="p18-trip-city" type="text" maxlength="70" placeholder="e.g. Valencia, Madrid, Kyoto" value="" style="width:100%;margin:5px 0 10px"><label class="muted" for="p18-trip-country">Destination country</label><select id="p18-trip-country" onchange="p18TripDestinationChanged()" style="width:100%;margin:5px 0 8px">${countryOptions}</select><p class="muted">Custom routes use the country-pair fare estimate and your chosen city name; they are not live fares.</p></details>`;
  html = html.replace('<div id="p12-trip-estimate"', `${customFields}<div><label class="muted" for="p18-trip-local-transport">Daily local transport budget (destination currency)</label><input id="p18-trip-local-transport" type="number" min="0" value="${p18MoneyDefaultTransport((p12DestinationOptions()[0]||{}).country||S.country)}" oninput="this.dataset.userEdited='1';p12RefreshTripQuote()" style="width:100%"></div><div id="p12-trip-estimate"`);
  html = html.replace('id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()"','id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()"');
  html = html.replace('<div id="p12-trip-estimate"', '<div><label class="muted" for="p18-trip-gift-details">Gift details (optional)</label><input id="p18-trip-gift-details" type="text" maxlength="70" placeholder="e.g. groceries for my parents" style="width:100%"></div><div id="p12-trip-estimate"');
  return html;
};

/* Reprice the trip against the actual chosen city/country, and include local transport.
   The custom-city branch calculates the route again; it does not reuse the placeholder country fare. */
const P18_tripQuoteBeforeCustomAndTransport = p12TripQuote;
p12TripQuote = function() {
  const destSel = $('p12-trip-dest');
  const selectedId = destSel?.value;
  const originalValue = selectedId;
  const customCountry = selectedId === 'trip-custom' ? ($('p18-trip-country')?.value || S.country) : null;
  const selectedStay = $('p17-trip-stay')?.value || 'hotel';
  let temporarilyUseHome = false;
  if (selectedId === 'trip-custom' && customCountry === (S.home || S.country) && ['parents','sibling'].includes(selectedStay)) {
    if (destSel) destSel.value = 'trip-home';
    temporarilyUseHome = true;
  }
  const q = P18_tripQuoteBeforeCustomAndTransport();
  if (temporarilyUseHome && destSel) destSel.value = originalValue;
  if (!q) return q;
  if (selectedId === 'trip-custom') {
    const target = customCountry || S.country;
    const typed = String($('p18-trip-city')?.value || '').replace(/[<>"`]/g,'').trim();
    q.d = {id:'trip-custom',name:typed || `Custom city in ${(COUNTRIES[target]||COUNTRIES.usa).n}`,country:target,local:target===S.country,custom:true};
    q.international = S.country !== target;
    q.classKey = $('p12-trip-class')?.value || 'economy';
    const era = typeof prOf === 'function' ? prOf(gameYear(),S) : 1;
    q.airfare = q.international ? flightFareUsd(S.country,target) * p12FlightClassFactor(q.classKey) * q.people * era : 0;
    if (q.international) q.transport = 0;
    const hotelKey = $('p12-trip-hotel')?.value || 'comfort';
    let hotelBase = p12HotelInternal(q.d,hotelKey,1,gameYear()) * q.nights * q.rooms;
    const stay = selectedStay;
    if (stay === 'airbnb') hotelBase = Math.round(hotelBase * .78);
    else if (stay === 'motel') hotelBase = Math.round(hotelBase * .48);
    else if (['parents','sibling','friend'].includes(stay) && (stay === 'friend' || target === (S.home || S.country))) hotelBase = 0;
    const customNight = Math.max(0,Number($('p17-trip-night')?.value)||0);
    if (customNight > 0) hotelBase = p12LocalCurrencyInternal(customNight*q.nights*q.rooms,target,gameYear());
    q.hotel = hotelBase;
    const spendLocal = Math.max(0,Number($('p12-trip-spend')?.value)||0);
    q.spendLocal = spendLocal;
    q.spend = p12LocalCurrencyInternal(spendLocal*q.days*q.people,target,gameYear());
    const activity = $('p12-trip-activity')?.value || 'normal';
    q.activities = ({budget:0,normal:30,luxury:125}[activity]||30) * q.people * q.days * ((COUNTRIES[target]||COUNTRIES.usa).p||1) * era;
    q.shoppingLocal = Math.max(0,Number($('p17-trip-shopping')?.value)||0);
    q.shopping = p12LocalCurrencyInternal(q.shoppingLocal*q.days*q.people,target,gameYear());
    q.giftLocal = Math.max(0,Number($('p17-trip-gifts')?.value)||0);
    q.gifts = q.giftType === 'none' ? 0 : p12LocalCurrencyInternal(q.giftLocal,target,gameYear());
    q.stayType = stay;
    q.lodgingLabel = ({hotel:`${hotelKey} hotel`,airbnb:'Airbnb / serviced apartment',motel:'Motel / hostel / budget guesthouse',parents:'parents’ home',sibling:'brother’s / sister’s home',friend:'friend’s home / host stay'})[stay] || 'hotel';
  }
  const transportLocal = Math.max(0,Number($('p18-trip-local-transport')?.value)||0);
  q.destinationTransportLocal = transportLocal;
  q.destinationTransport = p12LocalCurrencyInternal(transportLocal*q.days*q.people,q.d.country,gameYear());
  q.giftDetails = String($('p18-trip-gift-details')?.value||'').replace(/[<>"`]/g,'').trim();
  if (q.giftType === 'custom' && q.giftDetails) q.giftLabel = q.giftDetails;
  q.total = q.airfare + q.transport + q.hotel + q.spend + q.activities + (q.shopping||0) + (q.gifts||0) + q.destinationTransport;
  return q;
};

function p18RefreshTripQuote() {
  const q = p12TripQuote(), el = $('p12-trip-estimate');
  if (!q || !el) return;
  const currency = COUNTRIES[q.d.country]?.cur || C().cur;
  el.innerHTML = `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><b>Estimated trip budget</b><strong style="font-size:1.15rem;color:var(--mint)">${money(q.total)}</strong></div>${ROW(q.international?'Return airfare · '+q.classKey:'Intercity / local transport',money(q.airfare||q.transport))}${ROW('Transport while there',money(q.destinationTransport||0))}${ROW(`Accommodation · ${q.lodgingLabel||'hotel'} · ${q.nights} night(s)`,money(q.hotel))}${ROW('Food / meals',money(q.spend))}${ROW('Shopping / clothes',money(q.shopping||0))}${ROW('Activities / excursions',money(q.activities))}${ROW(q.gifts?`Gift · ${q.giftLabel} for ${q.giftRecipient}`:'Gift budget',money(q.gifts||0))}${ROW('Trip length',`${q.days} day(s) · ${q.people} traveller(s)`)}${ROW('Annual leave requested',`${q.leaveDays} day(s)`)}${PR(`Food, local transport and gifts are in ${currency}. Lodging and airfare are estimates, not live bookable fares. The employer can refuse your leave, and travelling without valid status can create re-entry problems.`)}`;
}
p12RefreshTripQuote = p18RefreshTripQuote;

/* Correct the leave-approval probability's benefits bonus, then block a pretend return trip
   that would let an undocumented resident exit and re-enter as if nothing happened. */
const P18_bookTripBeforeReentryCheck = p12BookTrip;
p12BookTrip = function(purpose='holiday') {
  const q = p12TripQuote();
  if (S && S.undocumented && q && q.d && q.d.id === 'trip-home') {
    return hint('A home visit is not a round trip you can safely assume you can re-enter from. Choose voluntary return home, or remain in-country and plan a local trip instead.');
  }
  const before = S && S.tripHistory ? S.tripHistory.length : 0;
  P18_bookTripBeforeReentryCheck(purpose);
  if (S && S.tripHistory && S.tripHistory.length > before && q) {
    const record = S.tripHistory[0];
    record.destinationTransport = q.destinationTransport || 0;
    record.customCity = q.d && q.d.id === 'trip-custom' ? q.d.name : null;
    record.giftDetails = q.giftDetails || '';
    if (S.logRows && S.logRows[0] && typeof S.logRows[0].t === 'string' && (q.destinationTransport||0)>0) {
      S.logRows[0].t = S.logRows[0].t.replace(/\. Total /, `; destination transport ${money(q.destinationTransport)}. Total `);
    }
    if (S.logRows && S.logRows[0] && q.giftDetails && S.logRows[0].t.includes('you brought')) {
      S.logRows[0].t = S.logRows[0].t.replace('you brought ', `you brought ${q.giftDetails} `);
    }
    save();
  }
};

/* Broaden informal fallback work in the host country; it remains explicitly precarious and
   does not create visa rights. The existing annual income simulation applies to these options. */
Object.assign(P14_informalJobs, {
  cafe:{name:'Cafe / restaurant kitchen shifts',base:12500,stress:4,desc:'Low-paid kitchen prep, dishwashing or clearing tables, often with short notice and inconsistent shifts.'},
  hotel:{name:'Hotel housekeeping / laundry',base:13800,stress:4,desc:'Physically tiring cleaning and room-turnover work with little bargaining power and no guaranteed hours.'},
  warehouse:{name:'Warehouse picker / packer',base:16000,stress:5,desc:'Shift work with physical demands, possible unpaid waiting time and no reliable formal protection.'},
  seasonal:{name:'Seasonal farm / packing work',base:11200,stress:5,desc:'Seasonal work may disappear between harvests; accommodation or transport deductions can reduce take-home pay.'},
  delivery:{name:'Cash-paid delivery / errands',base:13200,stress:5,desc:'Unstable cash work with transport costs, accident risk and no normal employee benefits.'}
});

/* Show needs-goal priorities on the Life screen too, rather than hiding all needs under Activities. */
const P18_viewLifeBeforeGoalReminder = viewLife;
viewLife = function() {
  let html = P18_viewLifeBeforeGoalReminder();
  const active = (S && Array.isArray(S.p17Goals) ? S.p17Goals : []).filter(g => !g.done);
  if (active.length) {
    const top = active.slice(0,3).map(g => ROW(g.label,`${Math.min(100,Math.round((g.savedInternal||0)/Math.max(1,g.targetInternal)*100))}% funded · ${money(Math.max(0,g.targetInternal-(g.savedInternal||0)))} to go`)).join('');
    html += SEC('Your current priorities',PR('Important needs compete with rent, family support and daily costs. Save gradually and decide which goal matters most first.')+top+B('Manage needs & savings goals','Phones, clothing, courses, family visits, medical costs, rent deposits and home deposits.','go(\'act\')'));
  }
  return html;
};

/* Final UI clean-up: the historic rate table stays in JavaScript but the game UI never explains
   the pound's history / outlook unprompted. The actual local currency still displays on prices. */
const P18_viewWorldBeforeRateNarrativeCleanup = viewWorld;
viewWorld = function() {
  let html = P18_viewWorldBeforeRateNarrativeCleanup();
  html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3[^>]*>[^<]*(?:Egyptian pound|USD\s*\/\s*EGP|exchange-rate)[^<]*(?:history|outlook|forecast)[^<]*<\/h3>[\s\S]*?<\/section>/gi,'');
  html = html.replace(/The US Dollar rose from 5\.5 EGP in 2007 to over 50 EGP today\. Holding USD protects wealth\./g,'Imported goods can be expensive relative to local salaries.');
  return html;
};
const P18_renderBeforeVisibleRateCleanup = render;
render = function() {
  if (S && S.job && (S.remote || S.remoteJob)) { S.remote = null; S.remoteJob = null; }
  const out = P18_renderBeforeVisibleRateCleanup();
  const panel = $('p14-fx-panel'); if (panel) panel.remove();
  if (S && S.yearPopup && typeof S.yearPopup.note === 'string') {
    S.yearPopup.note = S.yearPopup.note.replace(/\n\nUSD\/EGP context:[\s\S]*/,'');
    S.yearPopup.note = S.yearPopup.note.replace(/Egyptian pound history and outlook[\s\S]*/i,'');
  }
  return out;
};

/* ================= PHASE 19 — STABLE FULL CAREER MARKET & FINAL POLISH ================= */

/* Cache the entire vacancy set once per country and in-game year, including all majors.
   Sorting is recalculated for the player's current degree, so choosing / graduating in a
   different field never leaves the board ranked for a previous major. Sponsorship flags
   do not re-roll every time the Career tab is opened. */
const P19_companyListBeforeStableMarket = (typeof P15_companyListBeforeMajorMerge === 'function') ? P15_companyListBeforeMajorMerge : companyListFor;
companyListFor = function(country = S ? S.country : 'usa') {
  if (!S) return P19_companyListBeforeStableMarket(country);
  p12InitState(S);
  const year = gameYear();
  const rawKey = `p19-raw-${country}-${year}`;
  S.p19RawJobBoards = S.p19RawJobBoards || {};
  if (!Array.isArray(S.p19RawJobBoards[rawKey])) {
    let base = [];
    try { base = P19_companyListBeforeStableMarket(country) || []; } catch (_) { base = []; }
    const merged = Array.isArray(base) ? base.slice() : [];
    const seen = new Set(merged.map(p => p.id));
    for (const major of Object.keys(P15_DEGREE_JOBS || {})) {
      for (const post of (p15DegreePosts(country, major) || [])) {
        if (!seen.has(post.id)) { merged.push(post); seen.add(post.id); }
      }
    }
    S.p19RawJobBoards[rawKey] = merged;
  }
  const merged = S.p19RawJobBoards[rawKey].slice();
  const degree = S.degree;
  const masterMap = {finance:'business',accounting:'business',mba:'business',analytics:'business',data:'cs',computer:'cs',law:'law',health:'biology',biology:'biology'};
  const master = masterMap[String(S.masterField || '').toLowerCase()] || null;
  const score = post => {
    if (degree && post.p15DegreeMajor === degree) return 120;
    if (degree && ((post.degree === degree) || (post.degrees || []).includes(degree))) return 110;
    if (degree && p15RoleTrackRelevant(post, degree)) return 100;
    if (master && post.p15DegreeMajor === master) return 80;
    if (master && ((post.degree === master) || (post.degrees || []).includes(master))) return 70;
    if (!post.degree && !(post.degrees || []).length && !post.p15DegreeMajor) return 30;
    return 10;
  };
  merged.sort((a,b) => score(b) - score(a));
  S.jobBoards[`${country}-${year}`] = merged;
  return merged;
};

/* Family requests and relationship cards must identify both the relationship and the name. */
const P19_viewFamilyBeforeRelationshipContext = viewFamily;
viewFamily = function() {
  let html = P19_viewFamilyBeforeRelationshipContext();
  if (S && Array.isArray(S.family)) {
    for (const m of S.family) {
      if (!m || !m.name) continue;
      const rel = p17Relation(m, true);
      const name = String(m.name);
      html = html.replaceAll(`${name} asked for help with`, `${rel} asked for help with`)
                 .replaceAll(`${name} needs help with`, `${rel} needs help with`)
                 .replaceAll(`${name} needs help`, `${rel} needs help`)
                 .replaceAll(`${name}’s request`, `${rel}’s request`)
                 .replaceAll(`${name}'s request`, `${rel}'s request`);
    }
  }
  return html;
};

/* Work is one main employment status at a time: a local job, a remote USD contract,
   or the informal survival route when no valid work status exists — never stacked pay. */
const P19_renderBeforeSingleWorkStatus = render;
render = function() {
  if (S) {
    if (S.undocumentedWork) {
      S.job = null; S.part = null; S.remote = null; S.remoteJob = null;
    } else if (S.job) {
      S.part = null; S.remote = null; S.remoteJob = null;
    }
  }
  const result = P19_renderBeforeSingleWorkStatus();
  if (S && activeTab === 'world') {
    try { p18TripDestinationChanged(); } catch (_) { try { p12RefreshTripQuote(); } catch (_) {} }
  }
  return result;
};

/* ================= PHASE 20 — FAMILY LIFE, CITY COSTS & AGE MILESTONES =================
   Additive patch: preserves prior game systems and saved-state compatibility. */

const P20_CITY_MARKETS = {
  egy:[['Alexandria · Smouha','alex-smouha',0.95],['Alexandria · central / waterfront','alex-central',1.08],['Cairo · Nasr City','cairo-nasr',1.12],['Cairo · Maadi','cairo-maadi',1.35],['Cairo · New Cairo','cairo-new',1.65],['Giza · Dokki','giza-dokki',1.08],['10th of Ramadan City','ramadan',0.82],['North Coast (seasonal)','north-coast',1.85]],
  usa:[['New York City','nyc',1.75],['Los Angeles, California','la',1.55],['San Francisco, California','sf',1.85],['Chicago, Illinois','chicago',1.12],['Houston, Texas','houston',0.98],['Atlanta, Georgia','atlanta',1.02],['Columbus, Ohio','columbus',0.82]],
  gbr:[['London','london',1.65],['Manchester','manchester',1.05],['Birmingham','birmingham',0.95],['Leeds','leeds',0.92],['Glasgow','glasgow',0.90]],
  can:[['Toronto','toronto',1.45],['Vancouver','vancouver',1.55],['Montreal','montreal',1.05],['Calgary','calgary',1.05],['Ottawa','ottawa',1.10]],
  deu:[['Munich','munich',1.35],['Berlin','berlin',1.12],['Hamburg','hamburg',1.18],['Leipzig','leipzig',0.90],['Frankfurt','frankfurt',1.25]],
  fra:[['Paris','paris',1.55],['Lyon','lyon',1.12],['Marseille','marseille',1.02],['Toulouse','toulouse',0.98]],
  aus:[['Sydney','sydney',1.55],['Melbourne','melbourne',1.35],['Brisbane','brisbane',1.12],['Perth','perth',1.10]],
  uae:[['Dubai','dubai',1.45],['Abu Dhabi','abudhabi',1.32],['Sharjah','sharjah',0.92]],
  sau:[['Riyadh','riyadh',1.18],['Jeddah','jeddah',1.08],['Dammam','dammam',0.98]],
  ind:[['Mumbai','mumbai',1.45],['Bengaluru','bengaluru',1.20],['Delhi','delhi',1.12],['Pune','pune',1.02]],
  nld:[['Amsterdam','amsterdam',1.55],['Rotterdam','rotterdam',1.12],['Eindhoven','eindhoven',1.08]],
  ita:[['Milan','milan',1.42],['Rome','rome',1.20],['Naples','naples',0.92]],
  jpn:[['Tokyo','tokyo',1.45],['Osaka','osaka',1.12],['Fukuoka','fukuoka',0.92]],
  sgp:[['Singapore · central','sg-central',1.35],['Singapore · outer district','sg-outer',1.05]],
  nzl:[['Auckland','auckland',1.35],['Wellington','wellington',1.22],['Christchurch','christchurch',1.00]],
  bra:[['São Paulo','saopaulo',1.30],['Rio de Janeiro','rio',1.22],['Curitiba','curitiba',1.00]],
  tur:[['Istanbul','istanbul',1.35],['Ankara','ankara',1.00],['Izmir','izmir',1.08]],
  pak:[['Karachi','karachi',1.18],['Lahore','lahore',1.08],['Islamabad','islamabad',1.28]],
  nga:[['Lagos','lagos',1.40],['Abuja','abuja',1.28],['Ibadan','ibadan',0.88]]
};
function p20CityOptions(){return P20_CITY_MARKETS[S.country]||[['Capital city','capital',1.2],['Regional city','regional',0.9]];}
function p20CityTuple(){return p20CityOptions().find(x=>x[1]===S.cityId)||p20CityOptions()[0];}
function p20CityMultiplier(){return p20CityTuple()[2]||1;}
function p20SetCity(id){const x=p20CityOptions().find(a=>a[1]===id);if(!x)return;S.cityId=id;S.cityName=x[0];S.cityCostMultiplier=x[2];S.propertyMarket=[];log(`You chose to live in ${x[0]}. Local rent, care, home-help and property listings reflect this city's price level. Other prices remain country-based.`);realismNotice('City selected',`${x[0]} has a city-specific cost level. Higher wages may be available in some major cities, but rent and daily costs can also be much higher.`);render();}
function p20CityPanel(){const opts=p20CityOptions();if(!S.cityId||!opts.some(x=>x[1]===S.cityId)){const best=opts[0];S.cityId=best[1];S.cityName=best[0];S.cityCostMultiplier=best[2];}return `<section class="card"><h3>Choose your city</h3><p class="muted">Country-wide averages hide big differences. This sets your local market. Property listings, rent, care, home-help and selected furnishing costs use this city index; many other prices remain country-based.</p><select id="p20-city" onchange="p20SetCity(this.value)" style="width:100%">${opts.map(x=>`<option value="${x[1]}" ${x[1]===S.cityId?'selected':''}>${x[0]} · ${x[2].toFixed(2)}× local cost level</option>`).join('')}</select><p class="muted" style="margin-top:8px">Selected: <b>${S.cityName}</b> · city cost index ${p20CityMultiplier().toFixed(2)}×</p></section>`;}

function p20Init(o){if(!o)return;const d={cityId:null,cityName:null,cityCostMultiplier:1,homeHelp:null,elderCare:{},p20AgeEventResolvedAge:-1,p20AgeEventsDone:[],p21AgeAdvancePending:false,p20CallsAge:-1,p20CallQueued:false,p20Furniture:{},p20NeedGoals:[],p20TeenApplyAge:-1,p20TeenApplyCount:0};for(const k in d)if(!(k in o))o[k]=d[k];if(!o.elderCare||typeof o.elderCare!=='object')o.elderCare={};if(!Array.isArray(o.p20AgeEventsDone))o.p20AgeEventsDone=[];if(!Array.isArray(o.p20NeedGoals))o.p20NeedGoals=[];}
const P20_migrate=migrate;migrate=function(o){o=P20_migrate(o);p20Init(o);return o;};
const P20_newGame=newGame;newGame=function(...args){P20_newGame(...args);p20Init(S);};

/* Age-specific, choice-driven milestones appear before advancing that age. */
const P20_AGE_STORIES={
  6:{title:'First day of primary school',text:'Your school bag feels enormous. A classmate smiles at you, the teacher asks a simple maths question, and you wonder whether you will fit in.',choices:[['Sit beside a friendly classmate',()=>({social:5,happiness:4,msg:'You made your first school friend. They saved you a seat the next morning.'})],['Try hard on the maths question',()=>({smarts:4,happiness:2,msg:'Your teacher praised your effort. You felt proud, even though you were nervous.'})],['Stay quiet and observe',()=>({happiness:1,msg:'You watched how the class worked. It took time, but you began to feel safer.'})]]},
  7:{title:'Bicycle training wheels come off',text:'A parent holds the back of your bicycle as you prepare to try riding without training wheels.',choices:[['Practise patiently',()=>({health:3,smarts:1,happiness:4,msg:'You wobbled, fell onto the grass, then managed a few metres on your own.'})],['Ask to keep practising with support',()=>({happiness:3,social:2,msg:'You chose not to rush. Your family encouraged you to try again another day.'})]]},
  8:{title:'Your eighth birthday',text:'Your family asks what birthday gift you would love. Their budget depends on what they can realistically afford.',choices:[['Ask for a handheld game console',()=>p20GiftChoice('console')],['Ask for a sports bicycle',()=>p20GiftChoice('bike')],['Ask for a science discovery kit',()=>p20GiftChoice('science')],['Choose a small celebration instead',()=>({happiness:5,social:3,msg:'You had cake and a simple family celebration. It felt warm, even without an expensive gift.'})]]},
  9:{title:'School science fair and athletics',text:'The science fair and the school athletics team tournament are happening in the same week.',choices:[['Build a volcano model with classmates',()=>({smarts:4,social:3,happiness:3,msg:'Your model was messy but memorable. Your classmates helped you finish it.'})],['Train for the athletics tournament',()=>({health:4,happiness:4,msg:'You trained hard and learned that practice matters more than winning every race.'})]]},
  10:{title:'Double digits',text:'Your neighbourhood friends have two plans: build a secret fort or spend the afternoon at a video-game tournament.',choices:[['Build the neighbourhood fort',()=>({social:5,smarts:1,happiness:4,msg:'You made a hideout from old sheets and cardboard and created a summer memory.'})],['Join the game tournament',()=>({smarts:2,social:4,happiness:3,msg:'You had fun competing and learned to handle losing without falling out with friends.'})]]},
  11:{title:'Middle school and a first phone',text:'School is getting bigger. You ask your parents whether it is time for your first mobile phone.',choices:[['Ask for an affordable phone',()=>p20ParentTechAsk('phone')],['Wait and focus on school',()=>({smarts:3,happiness:1,msg:'You agreed to wait. It was disappointing, but you understood money was tight.'})]]},
  12:{title:'A note from a classmate',text:'You receive a kind note from someone you have a small crush on. A few classmates begin gossiping.',choices:[['Keep it private and be kind',()=>({social:4,happiness:3,msg:'You kept the note private and treated your classmate kindly. The gossip soon faded.'})],['Talk to a trusted friend',()=>({social:3,smarts:1,msg:'Your friend helped you avoid turning a small crush into unnecessary drama.'})],['Show off the note',()=>({happiness:1,social:-3,msg:'The attention felt exciting briefly, but your classmate felt embarrassed and trust was damaged.'})]]},
  13:{title:'Your teenage interests',text:'You want to commit to something outside school. Your choices can shape skills and friendships.',choices:[['Join a music group',()=>({smarts:1,social:3,happiness:3,msg:'You practised with other beginners. Progress was slow, but you found your people.'})],['Join a sports league',()=>({health:4,social:4,happiness:3,msg:'Training improved your stamina and gave your week a routine.'})],['Learn coding or game modding',()=>({smarts:5,social:1,msg:'You broke things, searched for answers and gradually learned how to make your own project.'})]]},
  14:{title:'Your first chance to earn money',text:'You are old enough for some age-appropriate part-time work in this game. It may teach responsibility, but it can compete with study time.',choices:[['Look for babysitting work',()=>p20StartTeenJob('babysitter')],['Offer private tutoring to younger pupils',()=>p20StartTeenJob('tutor')],['Try a café or shop assistant shift',()=>p20StartTeenJob('cafe')],['Prioritise school this year',()=>({smarts:3,happiness:1,msg:'You focused on school and kept your schedule manageable.'})]]},
  15:{title:'An invitation for the weekend',text:'Three plans land at once: a house party, a study group and a cinema night with friends.',choices:[['Go to the study group',()=>({smarts:4,social:2,msg:'You studied together and still found time to laugh. Your exam confidence improved.'})],['Go to the cinema with friends',()=>({social:4,happiness:4,wealth:-p20LocalCost(12),msg:'You enjoyed a film and snacks. The outing cost money, but gave you a good memory.'}),()=>p20LocalCost(12)],['Attend the party with clear boundaries',()=>({social:4,happiness:3,msg:'You had fun, stayed within your boundaries and got home safely.'})]]},
  16:{title:'Driving test and first date invitation',text:'You can begin the process of learning to drive where local rules allow, and someone you like asks whether you want to go to the cinema.',choices:[['Prepare for the driving theory test',()=>({smarts:3,msg:'You started studying road signs. A licence still requires meeting local age and legal requirements.'})],['Go on a simple group cinema outing',()=>({social:4,happiness:4,wealth:-p20LocalCost(18),msg:'You enjoyed a low-pressure outing with friends. It felt good to get out of the house.'}),()=>p20LocalCost(18)],['Save the money and focus on exams',()=>({smarts:3,wealth:0,msg:'You chose to save money and keep your exam plans on track.'})]]},
  17:{title:'Senior-year exam pressure',text:'Entrance exams are getting close. Friends are stressed, and everyone has a different idea about how to prepare.',choices:[['Make a study plan and follow it',()=>({smarts:6,happiness:-1,msg:'You followed a realistic revision plan. You still felt pressure, but the material became more manageable.'})],['Join a study group',()=>({smarts:4,social:3,msg:'Explaining topics to each other helped the group spot gaps and stay motivated.'})],['Take a rest day before returning to study',()=>({health:2,happiness:4,smarts:1,msg:'You rested before burnout set in, then returned with a clearer head.'})]]},
  18:{title:'High-school graduation',text:'You have reached a major milestone. Your family wants to celebrate, but money and plans differ from household to household.',choices:[['Plan a modest family celebration',()=>({happiness:6,social:4,msg:'You celebrated with the people who supported you. It was meaningful without being extravagant.'})],['Ask about university and career plans',()=>({smarts:3,happiness:2,msg:'You discussed tuition, scholarships, work and the choices ahead with your family.'})],['Take a quiet day to reflect',()=>({happiness:3,msg:'You gave yourself a moment to recognise how much had changed since primary school.'})]]}
};
function p20LocalCost(usdBase){const inflation=(typeof prOf==='function'?prOf(gameYear(),S):1);return Math.max(1,Math.round((Number(usdBase)||0)*inflation*p20CityMultiplier()));}
function p20GiftChoice(kind){const costs={console:180,bike:95,science:35};const labels={console:'a handheld game console',bike:'a sports bicycle',science:'a science discovery kit'};const amount=p20LocalCost(costs[kind]);const wi=Math.max(0,Math.min(2,S.famWealth||0));const chances={console:[.06,.30,.70],bike:[.30,.60,.85],science:[.55,.82,.95]};if(kind==='console'&&S.inventory.some(i=>i.cat==='console'))return {happiness:2,msg:'You already have a games console, so you chose not to ask your family to buy another one.'};if(Math.random()<(chances[kind]||[.3,.6,.85])[wi]&&parents().length){if(kind==='console'){const it=giftPick('console',[0,.3,.7][wi]);if(!it){parents().forEach(m=>m.bond=clamp(m.bond+1));return {happiness:2,msg:'Your family agreed to consider a console, but could not find an affordable model this year.'};}giftItem(it,'parents');parents().forEach(m=>m.bond=clamp(m.bond+2));return {happiness:6,social:2,msg:`Your family planned the birthday budget and bought you a ${it.model}. You promised to look after it.`};}parents().forEach(m=>m.bond=clamp(m.bond+2));return {happiness:kind==='science'?4:5,social:2,msg:`Your family managed to buy ${labels[kind]}. It took planning, and they reminded you to take care of it.`};}parents().forEach(m=>m.bond=clamp(m.bond+1));return {happiness:2,msg:`Your parents explained that ${money(amount)} is beyond the birthday budget this year. You chose another way to celebrate.`};}
function p20ParentTechAsk(cat){const label=cat==='phone'?'an affordable first phone':'a tech item';if(cat==='phone'&&S.inventory.some(i=>i.cat==='phone'))return {happiness:1,msg:'You already have a phone, so your parents suggested keeping it for now instead of buying another one.'};const wealthIndex=Math.max(0,Math.min(2,S.famWealth||0));const chance=[.18,.48,.78][wealthIndex];const item=cat==='phone'?giftPick('phone',[0,.45,.85][wealthIndex]):null;if(Math.random()<chance&&parents().length&&item){giftItem(item,null);parents().forEach(m=>m.bond=clamp(m.bond+2));return {happiness:4,social:2,msg:`Your parents bought you an affordable first phone (${item.model}). They planned for the cost and asked you to take good care of it.`};}return {happiness:1,msg:`Your parents could not arrange ${label} this year. They explained that bills and school costs had to come first, and you agreed to ask again another time.`};}
function p20StartTeenJob(kind){const jobs={babysitter:{title:'Babysitter',pay:()=>p20LocalCost(500),smarts:20},tutor:{title:'Private Tutor (younger pupils)',pay:()=>p20LocalCost(850),smarts:40},cafe:{title:'Café Assistant',pay:()=>p20LocalCost(650),smarts:15}};const j=jobs[kind];if(!j)return {msg:'No vacancy found.'};if(S.p20TeenJob)return {happiness:-1,msg:`You already have a part-time job as ${S.p20TeenJob.title}. Keep it or leave it before applying for another role.`};if(S.smarts<j.smarts)return {happiness:-1,msg:`You were not ready for ${j.title} yet. Building skills and asking around may help next year.`};const pay=j.pay();S.p20TeenJob={id:kind,title:j.title,pay};log(`Started age-appropriate part-time work as ${j.title}; expected annual earnings ${money(pay)}.`);return {social:2,happiness:2,msg:`You found occasional work as a ${j.title}. It can bring in around ${money(pay)} over a year, but shifts and demand are not guaranteed.`};}
function p20RunAgeStory(){const age=S.age,e=P20_AGE_STORIES[age];if(!e)return false;S.p20AgeEventsDone=S.p20AgeEventsDone||[];if(S.p20AgeEventsDone.includes(age)||S.p20AgeEventResolvedAge===age)return false;S.ev={title:e.title,text:e.text+' Choose an option to resolve this milestone; your age will advance automatically.',choices:e.choices.map(([label,fx,cost])=>({label,fx,...(cost!==undefined?{cost}: {})}))};S.evId=`p20-age-${age}`;S.pending=true;activeTab='life';log(`A milestone needs your attention: ${e.title}.`);render();return true;}
const P20_ageUpBefore=ageUp;ageUp=function(){if(!S||S.pending)return P20_ageUpBefore();p20Init(S);if(S.age>=6&&S.age<=18&&S.p20AgeEventResolvedAge!==S.age&&!S.p20AgeEventsDone.includes(S.age)){if(p20RunAgeStory())return;}if(S.p20AgeEventResolvedAge===S.age){S.p20AgeEventsDone.push(S.age);S.p20AgeEventsDone=[...new Set(S.p20AgeEventsDone)];S.p20AgeEventResolvedAge=-1;}return P20_ageUpBefore();};
const P20_chooseBefore=choose;choose=function(i){const id=S&&S.evId,ageBefore=S&&S.age;P20_chooseBefore(i);if(S&&id&&id.startsWith('p20-age-')&&S.age===ageBefore&&!S.pending&&S.evId!==id){S.p20AgeEventResolvedAge=S.age;S.p20AgeEventsDone=S.p20AgeEventsDone||[];if(!S.p20AgeEventsDone.includes(S.age))S.p20AgeEventsDone.push(S.age);save();render();}};

/* Family calls: emotional but not punitive; a refusal can be understood, and support has a real cash effect. */
function p20FamilyCallEvent(){const alive=(S.family||[]).filter(m=>m&&m.alive!==false&&['Mother','Father','Sibling'].includes(m.role));if(!alive.length)return null;const m=pick(alive),rel=p17Relation(m),local= p20LocalCost(m.role==='Sibling'?(S.age<25?55:85):45),purpose=m.role==='Sibling'?pick(['college tuition deposit','a replacement phone for school','exam fees','a transport pass','urgent textbooks']):pick(['groceries for the week','electricity and gas bills','a clinic appointment','prescription medicine','a leaking pipe repair','an unexpected household bill']);return {id:`p20-call-${S.age}-${m.id}`,min:Math.max(6,S.age),max:90,ok:()=>S.p20CallsAge!==S.age,title:`A call from your ${rel}`,text:`Your ${rel} (${m.name}) calls. “I’m sorry to ask at a difficult time, but we need help with ${purpose}. Would you be able to send ${money(local)}? Even part of it would help.”`,choices:[{label:`Send the requested ${money(local)}`,cost:()=>local,fx:()=>{S.p20CallsAge=S.age;m.bond=clamp(m.bond+7);return {wealth:-local,happiness:2,msg:`Your ${rel} was relieved. “Thank you. This really has been a tough time, and your help means a lot. I know you have your own expenses too.”`};}},{label:'Send a smaller amount',fx:()=>{const amount=Math.min(Math.max(0,S.wealth),Math.round(local*.45));S.p20CallsAge=S.age;S.wealth-=amount;m.bond=clamp(m.bond+4);return {happiness:1,wealth:0,msg:`You sent ${money(amount)} toward ${purpose}. Your ${rel} replied, “Thank you. It doesn’t cover everything, but it helps. I know you’re doing what you can.”`};}},{label:'Explain that you cannot help right now',fx:()=>{S.p20CallsAge=S.age;m.bond=clamp(m.bond-1);return {happiness:-1,msg:`Your ${rel} sounded disappointed, then said, “I understand. I know you have bills of your own. We’ll try to manage another way.”`};}}]};}
EVENTS.push({id:'p20-family-call',min:18,max:90,ok:()=>!!S.family?.some(m=>m.alive!==false&&['Mother','Father','Sibling'].includes(m.role))&&S.p20CallsAge!==S.age,title:'Family needs your help',text:'A family member calls with an unexpected expense.',choices:[{label:'Check in with family',fx:()=>({social:2,happiness:1,msg:'You checked in and agreed to keep talking. Sometimes listening is help too.'})}]});
function p20ShowQueuedCall(){if(!S||!S.p20CallQueued||S.pending||S.age<18||S.p20CallsAge===S.age)return false;if(S.familyNeed||S.parentNeed){S.p20CallQueued=false;return false;}const e=p20FamilyCallEvent();S.p20CallQueued=false;if(!e)return false;S.ev=e;S.evId=e.id;S.pending=true;activeTab='life';render();return true;}
const P20_ageUpForCalls=ageUp;ageUp=function(){const before=S&&S.age;P20_ageUpForCalls();if(S&&S.age!==before&&S.age>=18&&S.p20CallsAge!==S.age&&!S.familyNeed&&!S.parentNeed&&S.p12FamilyHelpLastAge!==S.age&&Math.random()<.08){S.p20CallQueued=true;p20ShowQueuedCall();}};
const P20_chooseForCalls=choose;choose=function(i){const id=S&&S.evId;if(id&&id.startsWith('p20-call-')){const ev=S.ev,c=ev.choices[i];if(!c)return;if(unaffordable(c))return hint('Not enough money. Choose a smaller amount or explain that you cannot help.');const f=typeof c.fx==='function'?c.fx():c.fx;fx(f);const msg=f.msg||c.result||'You responded to your family.';log(`${ev.title}: ${msg}`);S.ev={title:'A message from your family',text:msg,choices:[]};S.pending=false;S.evId=null;realismNotice('Family replied',msg);render();return;}P20_chooseForCalls(i);p20ShowQueuedCall();};

/* City costs / care services / home help and furniture. */
const P20_viewWorldBefore=viewWorld;viewWorld=function(){return p20CityPanel()+P20_viewWorldBefore();};
const P20_propertyMarketBefore=p12PropertyMarket;p12PropertyMarket=function(){const arr=P20_propertyMarketBefore();const key=S.cityId||'default';if(S.p20PropertyCityKey!==key){S.p20PropertyCityKey=key;arr.forEach(x=>{if(!x.p20CityAdjusted){x.priceInternal=Math.round(x.priceInternal*p20CityMultiplier());x.p20CityAdjusted=true;}});}return arr;};
function p20CareCard(){const oldParents=(S.family||[]).filter(m=>['Mother','Father'].includes(m.role)&&m.alive!==false&&m.age>=60);const canAfford=amount=>S.age>=18&&S.wealth>=amount;const services=[{id:'nurse',name:'Visiting nurse for a parent',usd:1500,desc:'Help with medication routines, appointments and basic care.'},{id:'caregiver',name:'Part-time elder caregiver',usd:950,desc:'Regular visits and help with daily activities.'}];let out=`<section class="card"><h3>Care for ageing parents</h3><p class="muted">Care costs are priced in the city where you live. You can help pay for your parents even if they live elsewhere; the service is modelled as a contribution toward their care.</p>`;if(!oldParents.length)out+='<p class="muted">This becomes relevant when a parent reaches 60.</p>';else{out+=oldParents.map(m=>{const care=S.elderCare[m.id]||'none';return `<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b>${p17Relation(m,true)} (${m.name})</b><div class="muted">Age ${m.age} · current care: ${care==='nurse'?'visiting nurse':care==='caregiver'?'part-time caregiver':'family support only'}</div>${services.map(s=>{const price=Math.round(p20LocalCost(s.usd)*.38);return `<button class="btn" ${canAfford(price)?'':'disabled'} onclick="p20HireCare('${m.id}','${s.id}',${price})">Hire ${s.name} · ${money(price)}/year<small>${s.desc}</small></button>`;}).join('')}<button class="btn" onclick="p20StopCare('${m.id}')">Stop paid care</button></div>`;}).join('');}return out+'</section>';}
function p20HireCare(id,kind,cost){if(!S||S.age<18)return hint('Paid parent-care arrangements are available from age 18.');const m=S.family.find(x=>x.id===id);if(!m||S.wealth<cost)return hint('You cannot afford this care plan right now.');if(S.elderCare[id]===kind)return hint('This care plan is already active.');S.wealth-=cost;S.elderCare[id]=kind;S.expenses=(S.expenses||0)+cost;m.bond=clamp(m.bond+8);fx({happiness:2});const rel=p17Relation(m);const msg=`You arranged ${kind==='nurse'?'a visiting nurse':'a part-time caregiver'} for your ${rel} (${m.name}) and paid ${money(cost)} for the year. They called to thank you: “I feel safer knowing someone is checking in. Thank you for looking after me.”`;log(msg);realismNotice('Your parent is grateful',msg);render();}
function p20StopCare(id){delete S.elderCare[id];log('You stopped a paid family care arrangement. You can arrange it again when your budget allows.');render();}
function p20HomeHelpCard(){const current=S.homeHelp||'none';if(S.age<18)return `<section class="card"><h3>Home help</h3><p class="muted">Household services are managed by the adults in your family. Your character can arrange paid help from age 18.</p></section>`;const choices=[['none','No paid home help',0],['cleaner','Cleaner, twice a month',p20LocalCost(700)],['maid','Regular household helper',p20LocalCost(2200)]];return `<section class="card"><h3>Home help</h3><p class="muted">A cleaner or household helper can reduce fatigue from work and chores. Costs vary by city; paid help is optional and can be cancelled.</p><div class="muted">Current arrangement: <b>${current==='none'?'None':current==='cleaner'?'Cleaner twice a month':'Regular household helper'}</b></div>${choices.map(([id,label,cost])=>`<button class="btn" ${id!=='none'&&S.wealth<cost?'disabled':''} onclick="p20SetHomeHelp('${id}',${cost})">${label}${cost?` · ${money(cost)}/year`:''}<small>${id==='none'?'Keep the money; chores stay yours.':id==='cleaner'?'Light cleaning support.':'More frequent cleaning and household assistance.'}</small></button>`).join('')}</section>`;}
function p20SetHomeHelp(id,cost){const old=S.homeHelpCost||0;if(S.wealth<cost)return hint('Not enough money for this arrangement.');S.wealth-=cost;S.homeHelp=id;S.homeHelpCost=cost;if(id!=='none'){fx({happiness:3});S.energy=clamp((S.energy||50)+8);}log(id==='none'?'You cancelled paid home help.':`You hired ${id==='cleaner'?'a cleaner':'a household helper'} for ${money(cost)} per year. Your workload should feel lighter.`);render();}
const P20_viewFamilyBefore=viewFamily;viewFamily=function(){return P20_viewFamilyBefore()+p20CareCard()+p20HomeHelpCard();};
const P20_viewShopBefore=viewShop;viewShop=function(){let html=P20_viewShopBefore();if(S.age<18&&['apple','samsung','other','laptop','tv'].includes(activeShopTab)){const tech=catalog().filter(i=>['phone','laptop','tablet','console'].includes(i.cat));html+=`<section class="card"><h3>Ask your parents to buy it</h3><p class="muted">Under 18? Choose the exact phone, laptop, tablet or console you want. Parents may agree, suggest something cheaper, or refuse if household bills come first.</p><select id="p20-tech-item" style="width:100%">${tech.map(i=>`<option value="${i.key}">${i.model||i.name||i.key} · ${money(i.cost)}</option>`).join('')}</select><button class="btn" onclick="p20AskParentsForTech()">Ask parents to buy this item</button></section>`;}if(activeShopTab==='furnish'){html+=`<section class="card"><h3>Furniture & home comfort upgrades</h3><p class="muted">Furnishings give a small immediate happiness boost. When your comfort score reaches 10, a comfortable home also adds 1 happiness each simulated year.</p>${[['bed','Quality bed and mattress',p20LocalCost(420),3],['sofa','Sofa and living-room set',p20LocalCost(650),3],['desk','Work / study desk and chair',p20LocalCost(180),2],['dining','Dining table and chairs',p20LocalCost(280),2],['curtains','Curtains, rugs and lighting',p20LocalCost(160),2],['wardrobe','Wardrobe and storage',p20LocalCost(240),2],['balcony','Balcony plants and seating',p20LocalCost(200),2],['smart','Smart-home and security kit',p20LocalCost(500),2]].map(([id,label,cost,benefit])=>`<button class="btn" ${S.wealth<cost?'disabled':''} onclick="p20BuyFurniture('${id}',${cost},${benefit})">${label} · ${money(cost)}<small>${S.p20Furniture[id]?'Already purchased':'Adds comfort and helps the home feel more complete.'}</small></button>`).join('')}</section>`;}return html;};
function p20AskParentsForTech(){if(S.age>=18||!parents().length)return hint('This option is for players under 18 who live with a parent.');if(S.p20AskedTech===S.age)return hint('You have already asked about a tech purchase this year.');const key=$('p20-tech-item')?.value;const item=catalog().find(i=>i.key===key&&['phone','laptop','tablet','console'].includes(i.cat));if(!item)return hint('Choose a phone, laptop, tablet or console first.');S.p20AskedTech=S.age;const chance=[.18,.48,.78][Math.min(2,S.famWealth||0)];const price=Number(item.cost)||0;const affordable=S.famWealth>0||price<80;if(Math.random()<chance&&affordable){parents().forEach(m=>m.bond=clamp(m.bond+3));giftItem(item,'parents');fx({happiness:4});log(`Your parents bought you a ${item.model||item.name||'tech item'} after discussing the household budget.`);realismNotice('Your parents agreed',`They said, “We can make this work, but please look after your ${item.model||item.name||'new device'}. We had to plan for this expense.”`);}else{parents().forEach(m=>m.bond=clamp(m.bond+1));log(`Your parents could not afford the ${item.model||item.name||'tech item'} this year. They explained that household bills come first.`);realismNotice('Your parents explained the budget','They said, “We know you want it. We cannot manage that cost this year, and we hope you understand.”');}render();}
function p20BuyFurniture(id,cost,benefit){if(!S.housing)return hint('Choose your current housing before buying furniture.');if(S.p20Furniture[id])return hint('You already own this item.');if(S.wealth<cost)return hint('Not enough money.');S.wealth-=cost;S.p20Furniture[id]=true;S.homeComfort=clamp((S.homeComfort||0)+benefit,0,100);log(`Bought ${id} furniture / home upgrade for ${money(cost)}.`);fx({happiness:2});render();}

/* Teenage part-time job choices are also available in Education, as requested. */
const P20_viewSchoolBefore=viewSchool;viewSchool=function(){let html=P20_viewSchoolBefore();if(S.age>=14&&S.age<=17){const jobs=[['babysitter','Babysitter',()=>p20LocalCost(500),'Reliable and trusted with children; irregular hours.'],['tutor','Private tutor',()=>p20LocalCost(850),'Needs good school results; can build communication skills.'],['cafe','Café assistant',()=>p20LocalCost(650),'Entry-level shifts; physically tiring and not guaranteed every week.']];html+=`<section class="card"><h3>Teenage part-time jobs (ages 14–17)</h3><p class="muted">Annual earnings are illustrative and depend on local wages, hours, demand and school schedule. Work should not replace school or violate local labour rules.</p>${jobs.map(([id,title,pay,desc])=>{const amt=pay();return `<button class="btn" onclick="p20ApplyTeenJob('${id}',${amt})">Apply: ${title}<small>Estimated ${money(amt)}/year · ${desc}</small></button>`;}).join('')}${S.p20TeenJob?`<p class="muted">Current side job: ${S.p20TeenJob.title}. Estimated annual income ${money(S.p20TeenJob.pay)}.</p><button class="btn" onclick="S.p20TeenJob=null;log('You left your teenage part-time job.');render();">Leave part-time job</button>`:''}</section>`;}return html;};
function p20ApplyTeenJob(id,pay){if(S.age<14||S.age>17)return hint('This job is available in the game from ages 14 to 17.');if(S.p20TeenJob)return hint('You can only hold one teenage part-time job at a time. Leave the current job first.');if(S.p20TeenApplyAge!==S.age){S.p20TeenApplyAge=S.age;S.p20TeenApplyCount=0;}if((S.p20TeenApplyCount||0)>=3)return hint('You have made three applications this year. Try again next year.');const j={babysitter:'Babysitter',tutor:'Private Tutor',cafe:'Café Assistant'}[id];if(!j)return;if(id==='tutor'&&S.smarts<40)return hint('Tutoring requires stronger school results; improve your skills before applying.');S.p20TeenApplyCount=(S.p20TeenApplyCount||0)+1;const baseChance=id==='tutor'?(S.smarts>=65?.74:.48):id==='babysitter'?(S.social>=60?.72:.58):(S.social>=55?.66:.52);if(Math.random()>baseChance){fx({happiness:-1});log(`You applied for ${j}, but the employer had limited shifts or chose another applicant.`);realismNotice('Application not successful',`You were not selected for ${j}. It was a competitive or limited-hours opening; you can apply for another type of teen job this year.`);render();return;}S.p20TeenJob={id,title:j,pay};log(`Your application for age-appropriate part-time work as ${j} was accepted. Estimated annual pay: ${money(pay)}, depending on shifts.`);realismNotice('Part-time job accepted',`You have a part-time role as ${j}. Your estimated annual pay is ${money(pay)}, though the amount will vary with shifts and school commitments.`);render();}
const P20_ageUpForTeenPay=ageUp;ageUp=function(){const ageBefore=S&&S.age;P20_ageUpForTeenPay();if(S&&S.age!==ageBefore&&S.p20TeenJob&&ageBefore>=14&&ageBefore<=17){const estimate=Number(S.p20TeenJob.pay)||0;const pay=Math.round(estimate*(.75+Math.random()*.5));S.wealth+=pay;S.income=(S.income||0)+pay;S.expenses=S.expenses||0;if(S.yearPopup)S.yearPopup.income=S.income;log(`Teenage job income: earned ${money(pay)} as ${S.p20TeenJob.title} (estimate ${money(estimate)}; shifts varied).`);if(S.effort==='hard')fx({happiness:-1,health:-1});if(S.age>17){log(`Your teenage job as ${S.p20TeenJob.title} ended as you aged out of the programme.`);S.p20TeenJob=null;}render();}};

/* Life tab shows tangible needs and the current year log rather than an empty-feeling summary. */
const P20_viewLifeBefore=viewLife;viewLife=function(){let html=P20_viewLifeBefore();if(S.age<12)html=p20CityPanel()+html;const needs=[['phone','Working phone',S.inventory.some(i=>i.cat==='phone')],['clothes','Clothes in reasonable condition',S.inventory.some(i=>i.cat==='fashion')],['home','Stable housing',!!S.housing],['family','Living in your home country',S.country===S.home],['savings','Emergency savings',S.wealth>=p20LocalCost(500)]];const goals=needs.map(([id,label,met])=>`<div class="row"><span>${label}</span><b style="color:${met?'var(--mint)':'var(--amber)'}">${met?'Covered':'Need / goal'}</b></div>`).join('');html+=`<section class="card"><h3>Everyday needs & goals</h3><p class="muted">Needs change as you grow: staying connected, replacing clothes, keeping a stable home, visiting family and having emergency savings all compete with other priorities.</p>${goals}${S.age>=12?`<button class="btn" onclick="go('shop')">Check phones, clothes and home items</button><button class="btn" onclick="go('world')">Plan a family visit or a trip</button>`:`<button class="btn" onclick="go('family')">Talk with your family about essentials</button><button class="btn" onclick="go('act')">Look at age-appropriate activities</button><p class="muted">Shopping and travel planning unlock at age 12.</p>`}</section>`;return html;};

/* Persist state fields for new and old saves. */
p20Init(S);



/* Recurring care / home help renews each simulated year after the first payment. */
const P20_ageUpForRecurringCare=ageUp;
ageUp=function(){const age0=S&&S.age;P20_ageUpForRecurringCare();if(!S||S.age===age0)return;p20Init(S);const careEntries=Object.entries(S.elderCare||{}).filter(([id,kind])=>kind&&kind!=='none'&&S.family.some(m=>m.id===id&&m.alive!==false));let careCost=0;for(const [id,kind] of careEntries)careCost+=Math.round(p20LocalCost(kind==='nurse'?1500:950)*.38);const homeCost=S.homeHelp==='cleaner'?p20LocalCost(700):S.homeHelp==='maid'?p20LocalCost(2200):0;const total=careCost+homeCost;if(total>0){S.wealth-=total;S.expenses=(S.expenses||0)+total;if(S.yearPopup)S.yearPopup.expenses=S.expenses;log(`Annual care and home-help costs: ${money(total)}. These services reduce family-care pressure and household fatigue.`);if(S.wealth<0)fx({happiness:-2});if(S.homeHelp&&S.homeHelp!=='none')fx({happiness:2,health:1});}for(const [id,kind] of careEntries){const m=S.family.find(x=>x.id===id);if(m)m.bond=clamp(m.bond+1);}render();};

/* ================= PHASE 21 — BUG REVIEW / FLOW CONSISTENCY =================
   Fixes age-up gating, city-price refresh, real inventory gifts and year-ledger display.
*/

/* Age-up must honour required setup before showing a birthday/milestone event.
   This prevents the age-6 story from hiding the mandatory school selection. */
const P21_ageUpBeforeSetupGate = ageUp;
ageUp = function(){
  if(!S) return;
  const setupMissing = (S.age < 18 && !S.school) || (S.age >= 18 && !S.housing);
  if(setupMissing) return P20_ageUpBefore();
  return P21_ageUpBeforeSetupGate();
};

/* Explain the two-step milestone flow: make a choice, then advance to next age. */
const P21_chooseBeforeAgeHint = choose;
choose = function(i){
  const id = S && S.evId;
  const ageBefore = S && S.age;
  P21_chooseBeforeAgeHint(i);
  /* If the selected option was unaffordable, the event remains pending. Do not
     mark it resolved or try to advance time until a choice really succeeded. */
  if(S && id && id.startsWith('p20-age-') && S.age === ageBefore &&
     S.p20AgeEventResolvedAge === ageBefore && !S.pending && S.evId !== id){
    save();
    S.p21AgeAdvancePending = false;
    ageUp();
    /* Older pre-year events may interrupt this transition. Remember to resume
       after their choice rather than making the player click Age up a second time. */
    if(S && S.age === ageBefore && S.pending) S.p21AgeAdvancePending = true;
    if(S && S.age === ageBefore && !S.pending && !S.yearPopup){
      hint(`Milestone saved. Age is still ${S.age}; check the setup prompt, then press Age up.`);
      save(); render();
    }
  }
};

/* Resume an age-up automatically if a legacy pre-year event interrupted a milestone transition. */
const P21_chooseBeforeContinueAge = choose;
choose = function(i){
  const pendingBefore = !!(S && S.pending), ageBefore = S && S.age, idBefore = S && S.evId;
  P21_chooseBeforeContinueAge(i);
  if(S && S.p21AgeAdvancePending && pendingBefore && !S.pending && S.age === ageBefore && S.evId !== idBefore){
    S.p21AgeAdvancePending = false;
    save();
    ageUp();
    if(S && S.age === ageBefore && S.pending) S.p21AgeAdvancePending = true;
    save(); render();
  }
};

/* The original random phone/console events duplicated the new guaranteed milestone prompts. */
for(let i=EVENTS.length-1;i>=0;i--) if(['first_phone','first_console','p20-family-call'].includes(EVENTS[i].id)) EVENTS.splice(i,1);

/* Keep all current-year listings city-adjusted, including markets regenerated on later years. */
const P21_propertyMarketBeforeRefresh = p12PropertyMarket;
p12PropertyMarket = function(){
  const list = P21_propertyMarketBeforeRefresh();
  const multiplier = p20CityMultiplier();
  list.forEach(item=>{
    if(!item.p20CityAdjusted){
      item.priceInternal = Math.round((Number(item.priceInternal)||0) * multiplier);
      item.p20CityAdjusted = true;
      item.p20CityMultiplier = multiplier;
    }
  });
  return list;
};

/* City price index also affects rental homes, matching the City panel's description. */
const P21_rentCostBeforeCity = rentCost;
rentCost = function(home){
  const base = P21_rentCostBeforeCity(home);
  return Math.max(0, Math.round(base * p20CityMultiplier()));
};

/* Home help cannot be hired by a minor, a cancellation is always free, and the same plan
   cannot be charged twice by repeated clicks. No refund is assumed for a prepaid year. */
p20SetHomeHelp = function(id,cost){
  if(!S) return;
  if(S.age<18) return hint('Paid household help is managed by adults and unlocks at age 18.');
  const current = S.homeHelp || 'none';
  if(id==='none'){
    if(current==='none') return hint('You do not currently have paid home help.');
    S.homeHelp='none'; S.homeHelpCost=0;
    log('You cancelled paid home help. The current prepaid period is not refunded.');
    render(); return;
  }
  if(current===id) return hint('This home-help arrangement is already active.');
  if(S.wealth<cost) return hint('Not enough money for this arrangement.');
  S.wealth-=cost; S.homeHelp=id; S.homeHelpCost=cost;
  fx({happiness:3}); S.energy=clamp((S.energy||50)+8);
  log(`You hired ${id==='cleaner'?'a cleaner':'a household helper'} for ${money(cost)} for the first year. Switching arrangements starts a new prepaid year.`);
  render();
};

/* Keep the full district name so city selections are displayed consistently. */
p20SetCity = function(id){
  const x=p20CityOptions().find(a=>a[1]===id); if(!x)return;
  S.cityId=id; S.cityName=x[0]; S.cityCostMultiplier=x[2]; S.propertyMarket=[];
  log(`You chose to live in ${x[0]}. Local rent, care, home-help and property listings reflect this city's price level.`);
  realismNotice('City selected',`${x[0]} has a city-specific cost level. This version adjusts rent, property listings and selected services, but job salary bands remain country-based rather than city-indexed.`);
  render();
};

/* Comfort now has a small, real yearly effect after the comfort score reaches 10. */
const P21_ageUpBeforeComfortBonus = ageUp;
ageUp = function(){
  const ageBefore = S && S.age;
  P21_ageUpBeforeComfortBonus();
  if(!S || S.age === ageBefore) return;
  const comfort = Number(S.homeComfort) || 0;
  if(comfort >= 10) fx({happiness:1});
  render();
};

/* Use actual supported stats rather than 'creativity', which the game's fx() engine ignores. */

/* Age-story gifts should exist in My Items, not only in the narrative. */
function p21AddNonCatalogGift(kind){
  if(!S||!Array.isArray(S.inventory))return;
  const data = kind==='bike'
    ? {key:'p20-birthday-bike',cat:'bike',type:'bike',model:'Sports bicycle (birthday gift)',price:p20LocalCost(95),life:10,hap:1,hp:1,soc:0,portable:true}
    : {key:'p20-science-kit',cat:'toy',type:'toy',model:'Science discovery kit (birthday gift)',price:p20LocalCost(35),life:4,hap:1,hp:0,soc:1,portable:true};
  if(S.inventory.some(i=>i.key===data.key))return;
  S.inventory.push({uid:'u'+(S.uidN++),...data,age:0,tier:1,homeId:null,broken:false,insured:false,storage:null});
}
p20GiftChoice = function(kind){
  const costs={console:180,bike:95,science:35};
  const labels={console:'a handheld game console',bike:'a sports bicycle',science:'a science discovery kit'};
  const amount=p20LocalCost(costs[kind]);
  const wi=Math.max(0,Math.min(2,S.famWealth||0));
  const chances={console:[.06,.30,.70],bike:[.30,.60,.85],science:[.55,.82,.95]};
  if(kind==='console'&&S.inventory.some(i=>i.cat==='console'))return {happiness:2,msg:'You already have a games console, so you chose not to ask your family to buy another one.'};
  if(Math.random()<(chances[kind]||[.3,.6,.85])[wi]&&parents().length){
    if(kind==='console'){
      const it=giftPick('console',[0,.3,.7][wi]);
      if(!it){parents().forEach(m=>m.bond=clamp(m.bond+1));return {happiness:2,msg:'Your family agreed to consider a console, but could not find an affordable model this year.'};}
      giftItem(it,'parents'); parents().forEach(m=>m.bond=clamp(m.bond+2));
      return {happiness:6,social:2,msg:`Your family planned the birthday budget and bought you a ${it.model}. You promised to look after it.`};
    }
    p21AddNonCatalogGift(kind); parents().forEach(m=>m.bond=clamp(m.bond+2));
    return {happiness:kind==='science'?4:5,social:2,msg:`Your family managed to buy ${labels[kind]}. It is now listed in My Items. It took planning, and they reminded you to take care of it.`};
  }
  parents().forEach(m=>m.bond=clamp(m.bond+1));
  return {happiness:2,msg:`Your parents explained that ${money(amount)} is beyond the birthday budget this year. You chose another way to celebrate.`};
};

/* Use the catalog's real .cost property and don't make portable tech live permanently at home. */
const P21_askParentsForTechBeforeBudget = p20AskParentsForTech;
p20AskParentsForTech = function(){
  if(!S||S.age>=18||!parents().length)return hint('This option is for players under 18 who live with a parent.');
  if(S.p20AskedTech===S.age)return hint('You have already asked about a tech purchase this year.');
  const key=$('p20-tech-item')?.value;
  const item=catalog().find(i=>i.key===key&&['phone','laptop','tablet','console'].includes(i.cat));
  if(!item)return hint('Choose a phone, laptop, tablet or console first.');
  if(item.cat==='phone'&&S.inventory.some(i=>i.cat==='phone'&&!i.broken&&i.age<i.life))return hint('You already have a working phone. Ask for a replacement after it wears out.');
  S.p20AskedTech=S.age;
  const wi=Math.max(0,Math.min(2,S.famWealth||0));
  const price=Math.max(0,Number(item.cost)||0);
  const budget=[250,1200,3500][wi];
  const chance=[.24,.52,.80][wi];
  const affordable=price<=budget;
  if(affordable&&Math.random()<chance){
    parents().forEach(m=>m.bond=clamp(m.bond+3));
    giftItem(item,item.cat==='console'?'parents':null);
    fx({happiness:4});
    log(`Your parents bought you ${item.model||item.name||'a tech item'} after discussing the household budget.`);
    realismNotice('Your parents agreed',`They agreed to pay ${money(price)} for ${item.model||item.name||'the item'}. They explained that they planned for the cost and asked you to look after it.`);
  }else{
    parents().forEach(m=>m.bond=clamp(m.bond+1));
    log(`Your parents could not afford or approve ${item.model||item.name||'the tech item'} this year.`);
    realismNotice('Your parents explained the budget',`The item costs ${money(price)}, which is beyond the budget they set for this purchase. They suggested saving up or choosing a cheaper model.`);
  }
  render();
};

/* ================= PHASE 22 — HARD AGE-PROGRESSION & HOUSING FIX =================
   Final controller: prevents older wrappers, orphaned events, corrupt 
   university data, or custom housing IDs from trapping the player at one age.
*/

/* ---------- 1. SAFE HOUSING & COMFORT GUARD ---------- */
if (typeof HOUSING_CATALOG !== 'undefined' && Array.isArray(HOUSING_CATALOG)) {
  const P22_rawCatalogFind = HOUSING_CATALOG.find;
  HOUSING_CATALOG.find = function(predicate, thisArg) {
    const found = P22_rawCatalogFind.call(this, predicate, thisArg);
    if (found) return found;

    // Check custom owned homes if not in standard catalog
    if (S && Array.isArray(S.ownedHomes)) {
      const owned = P22_rawCatalogFind.call(S.ownedHomes, predicate, thisArg);
      if (owned) {
        return {
          id: owned.id,
          name: owned.name,
          hap: Number(owned.hapBuff) || 2,
          hp: Number(owned.hpBuff) || 1,
          sm: 0,
          pay: 0,
          util: 0,
          price: owned.value || 0,
          kind: 'buy'
        };
      }
    }

    // Safe dummy fallback object to prevent `.hap` / `.hp` reading crashes
    return { id: 'fallback_home', name: 'Home', hap: 0, hp: 0, sm: 0, pay: 0, util: 0, price: 0, kind: 'rent' };
  };
}

if (typeof comfort === 'function') {
  const P22_rawComfort = comfort;
  comfort = function(homeId) {
    try {
      const res = P22_rawComfort(homeId);
      if (res && typeof res === 'object') {
        return {
          hap: Number(res.hap) || 0,
          hp: Number(res.hp) || 0,
          sm: Number(res.sm) || 0
        };
      }
    } catch(e) {}

    if (S && Array.isArray(S.ownedHomes)) {
      const home = S.ownedHomes.find(x => x.id === homeId);
      if (home) return { hap: Number(home.hapBuff) || 2, hp: Number(home.hpBuff) || 1, sm: 0 };
    }
    return { hap: 0, hp: 0, sm: 0 };
  };
}

/* ---------- 2. SAFE UNIVERSITY YEAR GUARD ---------- */
if (typeof uniYear === 'function') {
  const P22_rawUniYear = uniYear;
  uniYear = function() {
    if (!S || !S.uni) return;

    if (!S.effort || typeof EFFORT === 'undefined' || !EFFORT[S.effort]) {
      S.effort = 'norm';
      if (typeof EFFORT !== 'undefined' && !EFFORT['norm']) {
        EFFORT['norm'] = { label: 'Normal effort', mult: 1.0 };
      }
    }

    if (typeof MAJORS !== 'undefined') {
      const currentMajorKey = S.uni.major || 'general';
      if (!MAJORS[currentMajorKey]) {
        MAJORS[currentMajorKey] = {
          name: S.uni.faculty || S.uni.universityName || 'General Studies',
          mult: 1.0,
          min: 50,
          years: S.uni.yearsTotal || 4
        };
      }
      S.uni.major = currentMajorKey;
    }

    try {
      P22_rawUniYear();
    } catch (err) {
      console.warn('Recovered from uniYear calculation error:', err);
      if (S.uni) {
        S.uni.year = (Number(S.uni.year) || 1) + 1;
        const maxYears = Number(S.uni.yearsTotal) || 4;
        if (S.uni.year > maxYears) {
          S.degree = S.uni.major || 'degree';
          S.uni = null;
          if (typeof log === 'function') log('Graduated from university!');
        }
      }
    }
  };
}

/* ---------- 3. AGE PROGRESSION CONTROLLER ---------- */
const P22_wrappedYearProgression = typeof P21_ageUpBeforeSetupGate === 'function' 
  ? P21_ageUpBeforeSetupGate 
  : (typeof ageUp === 'function' ? ageUp : function(){});

const P22_renderBeforeStaleEventRepair = typeof render === 'function' ? render : function(){};

render = function(){
  if(S && S.pending && (!S.ev || !Array.isArray(S.ev.choices) || S.ev.choices.length === 0)){
    const orphanId = S.evId;
    S.pending = false;
    if(orphanId && orphanId.startsWith('p20-age-')){
      const n = Number(orphanId.slice('p20-age-'.length));
      if(Number.isFinite(n)){
        S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
        if(!S.p20AgeEventsDone.includes(n)) S.p20AgeEventsDone.push(n);
        S.p20AgeEventResolvedAge = n;
      }
    }
    S.evId = null;
    if (typeof log === 'function') log('Recovered an unfinished event with no choices, so the life simulation can continue.');
  }
  return P22_renderBeforeStaleEventRepair();
};

ageUp = function(){
  if(!S) return;
  if(typeof p20Init === 'function') p20Init(S);

  if(S.pending){
    if(S.ev && Array.isArray(S.ev.choices) && S.ev.choices.length){
      if (typeof hint === 'function') hint('Choose an option in the current event before advancing time.');
      return;
    }
    S.pending = false;
    S.evId = null;
  }
  if(S.age < 18 && !S.school){
    activeTab = 'school';
    if (typeof render === 'function') render();
    if (typeof hint === 'function') hint('Choose a school in Education first. Then press Age up again.');
    return;
  }
  if(S.age >= 18 && !S.housing){
    activeTab = 'assets';
    if (typeof render === 'function') render();
    if (typeof hint === 'function') hint('Choose your housing in Real Estate first. Then press Age up again.');
    return;
  }

  if(S.parentNeed || S.familyNeed){
    activeTab = 'life';
    if (typeof hint === 'function') hint('Please answer the family money request first. You can send any amount or decline, then press Age up again.');
    if(typeof p14ShowParentRequestModal === 'function') p14ShowParentRequestModal();
    else if (typeof render === 'function') render();
    return;
  }

  const ageBefore = Number(S.age) || 6;
  const story = (typeof P20_AGE_STORIES !== 'undefined') ? P20_AGE_STORIES[ageBefore] : null;
  S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
  const done = S.p20AgeEventsDone.includes(ageBefore);
  const resolved = S.p20AgeEventResolvedAge === ageBefore;
  const alreadyClosed = !!(story && S.ev && S.ev.title === story.title &&
    (!S.pending) && (!Array.isArray(S.ev.choices) || S.ev.choices.length === 0));

  if(story && !done && !resolved && !alreadyClosed){
    if(typeof p20RunAgeStory === 'function') p20RunAgeStory();
    return;
  }
  if(story && (resolved || alreadyClosed) && !done) S.p20AgeEventsDone.push(ageBefore);
  if(story && (done || resolved || alreadyClosed)) S.p20AgeEventResolvedAge = ageBefore;

  const previousAge = S.age;
  let progressionError = null;

  try {
    P22_wrappedYearProgression();
  } catch(e) {
    progressionError = e;
    console.error('Age progression wrapper failed; attempting safe legacy chain.', e);
  }

  if(S && S.age === previousAge && !S.pending && !S.yearPopup &&
     !(S.age < 18 && !S.school) && !(S.age >= 18 && !S.housing)){
    try {
      S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
      if(story && !S.p20AgeEventsDone.includes(previousAge)) S.p20AgeEventsDone.push(previousAge);
      if(typeof P20_ageUpBefore === 'function') P20_ageUpBefore();
    } catch(e) {
      console.error('Legacy age progression fallback failed.', e);
      if (typeof hint === 'function') hint('Age progression encountered an error. Your save is preserved; try reloading the game.');
    }
  }

  if(S && S.age !== previousAge){
    S.p21AgeAdvancePending = false;
    if((Number(S.homeComfort) || 0) >= 10 && typeof fx === 'function') fx({ happiness: 1 });
    if(typeof save === 'function') save();
  } else if(S && S.age === previousAge && !S.pending && !S.yearPopup){
    if (typeof hint === 'function') hint(`The game could not complete the year at age ${previousAge}. Your save is preserved; use Age up again to retry.`);
    if(progressionError) console.error(progressionError);
  }
  if(S && !S.dead && typeof render === 'function') render();
};

/* ---------- 4. STATE REPAIR ON LOAD ---------- */
function p22RepairAgeState(){
  if(!S) return;
  if(typeof p20Init === 'function') p20Init(S);
  if(S.pending && S.ev && Array.isArray(S.ev.choices) && S.ev.choices.length === 0) S.pending = false;
  const id = String(S.evId || '');
  if(id.startsWith('p20-age-') && (!S.pending || !S.ev || !Array.isArray(S.ev.choices) || S.ev.choices.length === 0)){
    const a = Number(id.slice('p20-age-'.length));
    if(Number.isFinite(a)){
      S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
      if(!S.p20AgeEventsDone.includes(a)) S.p20AgeEventsDone.push(a);
      S.p20AgeEventResolvedAge = a;
    }
    S.evId = null;
  }
}

const P22_loadGameBeforeRepair = typeof loadGame === 'function' ? loadGame : function(){};
loadGame = function(){ 
  P22_loadGameBeforeRepair(); 
  p22RepairAgeState(); 
  if(S && typeof render === 'function') render(); 
};

p22RepairAgeState();

/* ================= PHASE 23 — PAY REVIEWS, OPENINGS & ACTIVE MATTERS =================
   Additive systems: preserve the earlier simulation and saved-game shape. */
function p23Init(o){
  if(!o)return;
  if(!Array.isArray(o.p23Matters))o.p23Matters=[];
  if(!o.p23CarePlans||typeof o.p23CarePlans!=='object')o.p23CarePlans={};
  if(!o.p23CareAlertAge||typeof o.p23CareAlertAge!=='object')o.p23CareAlertAge={};
  if(!o.p23MatterSeq)o.p23MatterSeq=1;
  if(o.p23LastMatterCreatedAge==null)o.p23LastMatterCreatedAge=-1;
  if(o.raiseTriedAge==null)o.raiseTriedAge=-1;
}
function p23MoneyLabel(job, amount){
  return job&&job.isRemoteUSD ? `${usd(Math.round(amount))} USD/year (about ${money(amount)} in ${C().cur})` : `${money(amount)}/year`;
}
function p23Pct(oldValue,newValue){return oldValue>0?((newValue-oldValue)/oldValue*100):0;}
function p23PromotedTitle(job,nextLevel){
  if(job.titles&&job.titles[nextLevel])return job.titles[nextLevel];
  if(job.isRemoteUSD){
    const ladders={finance:['Remote Finance Associate','Remote Finance Specialist','Senior Remote Finance Specialist','Remote Finance Lead','Remote Finance Manager'],tech:['Remote Technical Associate','Remote Analyst / Engineer','Senior Remote Analyst / Engineer','Remote Technical Lead','Principal Remote Specialist'],law:['Remote Legal Operations Associate','Remote Legal Specialist','Senior Remote Legal Specialist','Remote Legal Team Lead','Remote Legal Operations Manager'],bio:['Remote Research Associate','Remote Research Specialist','Senior Remote Research Specialist','Remote Research Lead','Remote Research Manager'],entry:['Remote Operations Associate','Remote Operations Specialist','Senior Remote Operations Specialist','Remote Operations Lead','Remote Operations Manager']};
    return (ladders[job.trackId]||ladders.entry)[Math.max(0,Math.min(4,nextLevel))];
  }
  return p12RoleTitle({titles:job.titles,trackId:job.trackId},nextLevel);
}
/* Promotion can never convert a USD contractor's pay into a local salary band. */
askPromotion=function(){
  if(!S||!S.job)return hint('You do not have a current job to promote from.');
  const j=S.job,track=TRACKS[j.trackId];
  if(!track)return hint('This job has no defined promotion ladder.');
  if((j.level||0)>=4)return hint('You have reached the highest rank in this career.');
  if(S.promoTried)return hint('You already requested a promotion this year.');
  S.promoTried=true;
  const oldLevel=Math.max(0,Number(j.level)||0),nextLevel=oldLevel+1,oldSalary=Math.max(0,Number(j.salary)||0),years=Math.max(0,Number(j.years)||0);
  const chance=Math.max(.05,Math.min(.82,.06+(Number(j.perf)||0)/175+(Number(S.smarts)||0)/450+Math.min(years,8)*.035-(S.econ==='recession'?.12:0)));
  if((S.smarts||0)<(track.levels[nextLevel]?.reqSmarts||0)||Math.random()>chance){
    j.perf=clamp((j.perf||0)-4);fx({happiness:-2});
    log(`${j.company||'Management'} declined your promotion request. Your title and salary stayed the same at ${p23MoneyLabel(j,oldSalary)}; this was not a demotion.`);
    realismNotice('Promotion declined',`Your request was declined. Your title and salary stayed at ${p23MoneyLabel(j,oldSalary)}. Improve performance and revisit the discussion in a later review.`);
  }else{
    const perf=Math.max(0,Math.min(100,Number(j.perf)||50));
    let raisePct=j.isRemoteUSD ? (.08 + Math.min(.06,perf/1000) + Math.min(.03,years*.003)) : 0;
    let proposed;
    if(j.isRemoteUSD){
      /* Remote salary is in USD units; don't pass it through the country's salary table. */
      proposed=Math.round(oldSalary*(1+raisePct));
    }else{
      proposed=Math.round(salaryForTrack(j.trackId,nextLevel,S.country,gameYear(),j.companyFactor||j._companyFactor||1));
      proposed=Math.max(proposed,Math.round(oldSalary*1.08));
    }
    proposed=Math.max(oldSalary+1,proposed);
    const actualPct=p23Pct(oldSalary,proposed),difference=proposed-oldSalary;
    /* Promote within the same track without erasing years already earned. Employer tenure resets; career experience does not. */
    recordCareer(j,true);
    j.level=nextLevel;j.title=p23PromotedTitle(j,nextLevel);j.salary=proposed;S.lastSalary=proposed;j.perf=50;j.years=0;j._recordedYears=0;
    recordCareer(j);
    fx({happiness:8});
    const unit=j.isRemoteUSD?'USD':'local currency';
    const detail=`Previous annual salary: ${p23MoneyLabel(j,oldSalary)}. New annual salary: ${p23MoneyLabel(j,proposed)}. Increase: ${j.isRemoteUSD?usd(difference)+' USD':money(difference)} (${actualPct.toFixed(1)}%).`;
    log(`PROMOTION at ${j.company||'your employer'}: ${j.title}. ${detail}`);
    realismNotice('Promotion and salary confirmed',`You advanced to ${j.title}. ${detail} Your salary was protected from a currency-basis downgrade. Responsibilities may increase too.`);
  }
  render();
};
function askSalaryRaise(){
  if(!S||!S.job)return hint('You need a current job before asking for a raise.');
  if((Number(S.job.years)||0)<1)return hint('Build at least one year of tenure before asking for a salary review.');
  if(S.raiseTriedAge===S.age)return hint('You already requested a salary raise this year.');
  S.raiseTriedAge=S.age;
  const j=S.job,old=Math.max(0,Number(j.salary)||0),perf=Math.max(0,Math.min(100,Number(j.perf)||45)),tenure=Math.max(0,Number(j.years)||0);
  const chance=Math.max(.08,Math.min(.78,.20+perf*.004+Math.min(tenure,6)*.035-(S.econ==='recession'?.12:0)));
  if(Math.random()>chance){fx({happiness:-2});log(`${j.company||'Your employer'} declined your salary-raise request. Your annual salary remains ${p23MoneyLabel(j,old)}; it did not go down.`);realismNotice('Salary review: no increase',`The employer declined your request this year. Your pay remains ${p23MoneyLabel(j,old)}. No salary cut was applied; ask again after delivering results or during the next review cycle.`);render();return;}
  const pct=j.isRemoteUSD ? (.035+Math.min(.045,perf/1800)+Math.min(.02,tenure*.003)+Math.random()*.015) : (.04+Math.min(.04,perf/1800)+Math.min(.025,tenure*.004)+Math.random()*.025);
  const proposed=Math.max(old+1,Math.round(old*(1+pct))),diff=proposed-old,actualPct=p23Pct(old,proposed);
  j.salary=proposed;S.lastSalary=proposed;recordCareer(j);
  const detail=`Before: ${p23MoneyLabel(j,old)}. After: ${p23MoneyLabel(j,proposed)}. Raise: ${j.isRemoteUSD?usd(diff)+' USD':money(diff)} per year (+${actualPct.toFixed(1)}%).`;
  log(`Salary raise approved at ${j.company||'your employer'}. ${detail}`);
  realismNotice('Salary raise approved',detail+' The raise applies to your annual gross pay; contract benefits and immigration status do not automatically change.');
  fx({happiness:6});render();
}
/* Put a clear separate salary-review action in Career rather than hiding it in promotion. */
const P23_p17CareerSearchBoardBeforeExperienceSpotlight=p17CareerSearchBoard;
p17CareerSearchBoard=function(){
  let html=P23_p17CareerSearchBoardBeforeExperienceSpotlight();
  if(!S||S.age<18)return html;
  const list=companyListFor(S.country)||[],degree=S.degree,trackMap={law:'law',business:'finance',cs:'tech',medicine:'medical',biology:'bio'};
  const match=p=>!!degree&&((p.p15DegreeMajor===degree)||(p.degree===degree)||(p.degrees||[]).includes(degree)||(p.trackId===trackMap[degree]));
  const sorted=list.slice().sort((a,b)=>Number(match(b))-Number(match(a))),relevant=sorted.filter(match);
  const recommended=(relevant.length?relevant:sorted.filter(p=>!p.degree&&!(p.degrees||[]).length)).slice(0,8),already=new Set(recommended.map(p=>p.id));
  const unlocked=list.filter(p=>String(p.id||'').startsWith('p23-exp-')&&!already.has(p.id));
  const exp=trackExperience(p23CareerTrack());
  const content=unlocked.length?unlocked.map(p=>{
    const level=Math.max(0,Math.min(4,(S.careerRecords||{})[p.trackId]?.level||0)),title=p12RoleTitle(p,level),pay=jobSalaryForPost(p,level,S.country,gameYear()),why=p12Eligibility(p);
    const allowed=p.degrees||[];
    return `<details class="p17-posting"><summary><b>${p.name}</b> · ${title}</summary>${PR(p.desc)}${ROW('Experience match',`${p.minExp} relevant year(s) required`)}${ROW('Estimated annual gross pay',money(pay))}${ROW('Education',allowed.length?allowed.map(k=>MAJORS[k]?.name||k).join(' / '):'No specific degree listed')}${why?PR(`Not currently available: ${why}`):''}<button class="btn" onclick="applyCompany('${p.id}')" ${why?'disabled':''}>${why?'Requirements not met':`Apply · ${title}`}</button></details>`;
  }).join('') : PR('All unlocked specialist roles for your experience already appear in the recommended list above, or your current degree / experience does not yet meet another specialist opening.');
  html+=SEC('Openings matched to your experience',PR(`You have ${exp} relevant year(s) in ${p23CareerTrack()}. More specialist openings unlock at 1, 3 and 5 years; promotions reset employer tenure, not accumulated career experience.`)+content);
  return html;
};
const P23_viewCareerBeforeRaiseCard=viewCareer;
viewCareer=function(){
  let html=P23_viewCareerBeforeRaiseCard();
  if(S&&S.job){
    const disabled=S.raiseTriedAge===S.age||(Number(S.job.years)||0)<1;
    const note=S.raiseTriedAge===S.age?'Already requested this year.':(Number(S.job.years)||0)<1?'Available after one completed year with this employer.':'A successful request reports the old salary, new salary, annual difference and percentage increase. A rejection never cuts your pay.';
    html+=SEC('Salary review',PR(note)+B('Request salary raise',S.job.isRemoteUSD?'Remote contractor raises stay in USD and are never recalculated using local salary bands.':'A raise is separate from a promotion and is not guaranteed.','askSalaryRaise()',disabled));
  }
  return html;
};

/* Career-market variety grows with the player's relevant experience and degree. */
const P23_companyListBeforeExperienceOpenings=companyListFor;
function p23CareerTrack(){
  if(S.job&&S.job.trackId)return S.job.trackId;
  const preferred={business:'finance',cs:'tech',law:'law',medicine:'medical',biology:'bio'}[S.degree];
  if(preferred)return preferred;
  const entries=Object.entries(S.careerRecords||{}).sort((a,b)=>(b[1]?.years||0)-(a[1]?.years||0));
  return entries[0]?.[0]||'entry';
}
function p23ExperienceOpenings(country){
  if(!S||country!==S.country||S.age<18)return [];
  const track=p23CareerTrack(),exp=trackExperience(track);
  const specs={
    finance:[
      {band:1,title:'Financial Reporting Analyst',titles:['Reporting Assistant','Financial Reporting Analyst','Senior Reporting Analyst','Reporting Lead','Reporting Manager'],factor:1.06,smarts:44,eng:32,minExp:1,desc:'Reconciliations, month-end schedules, management reports and variance investigation.'},
      {band:1,title:'Credit Control / Receivables Specialist',titles:['Credit Control Assistant','Receivables Specialist','Senior Credit Controller','Credit Control Lead','Credit Control Manager'],factor:1.00,smarts:40,eng:26,minExp:1,desc:'Customer balances, overdue debt, credit limits, payment plans and dispute resolution.'},
      {band:3,title:'FP&A / Commercial Finance Analyst',titles:['Finance Analyst','FP&A Analyst','Senior FP&A Analyst','FP&A Manager','Head of FP&A'],factor:1.18,smarts:58,eng:45,minExp:3,desc:'Forecasts, budgets, margin analysis, cost drivers and management decision support.'},
      {band:5,title:'Finance Business Partner',titles:['Finance Business Partner','Senior Finance Business Partner','Lead Finance Partner','Finance Partner Manager','Director of Finance Business Partnering'],factor:1.30,smarts:66,eng:55,minExp:5,desc:'Own planning cycles, challenge business assumptions and advise senior stakeholders.'}
    ],
    tech:[
      {band:1,title:'Data / BI Analyst',titles:['Junior Data Analyst','Data Analyst','Senior Data Analyst','BI Lead','Analytics Manager'],factor:1.10,smarts:52,eng:40,minExp:1,desc:'SQL, spreadsheets, dashboards, data checks and explaining metrics to stakeholders.'},
      {band:1,title:'Product Operations Analyst',titles:['Product Operations Assistant','Product Operations Analyst','Senior Product Analyst','Product Ops Lead','Product Operations Manager'],factor:1.05,smarts:50,eng:42,minExp:1,desc:'Investigate user issues, track product metrics, organise requirements and improve workflows.'},
      {band:3,title:'Senior BI / Insights Analyst',titles:['BI Analyst','Senior BI Analyst','Analytics Consultant','BI Lead','Analytics Manager'],factor:1.22,smarts:62,eng:52,minExp:3,desc:'Own dashboards and datasets, validate metrics and advise teams on product or commercial performance.'},
      {band:5,title:'Analytics Lead',titles:['Analytics Lead','Senior Analytics Lead','Head of BI','Analytics Director','VP of Analytics'],factor:1.35,smarts:72,eng:62,minExp:5,desc:'Set analytics standards, coach analysts and own prioritisation and delivery across teams.'}
    ],
    law:[
      {band:1,title:'Contracts / Compliance Specialist',titles:['Contracts Assistant','Compliance Specialist','Senior Compliance Specialist','Compliance Lead','Compliance Manager'],factor:1.06,smarts:48,eng:40,minExp:1,desc:'Contract registers, review checklists, compliance evidence and policy controls.'},
      {band:3,title:'Regulatory / Compliance Analyst',titles:['Regulatory Analyst','Senior Compliance Analyst','Regulatory Lead','Compliance Manager','Head of Compliance'],factor:1.18,smarts:60,eng:50,minExp:3,desc:'Manage risk registers, support audits and interpret regulatory changes for business teams.'},
      {band:5,title:'Legal Operations Manager',titles:['Legal Operations Lead','Legal Operations Manager','Senior Legal Operations Manager','Head of Legal Operations','Legal Operations Director'],factor:1.30,smarts:68,eng:58,minExp:5,desc:'Lead legal workflows, budgets, outside counsel processes and contract lifecycle improvements.'}
    ],
    medical:[
      {band:1,title:'Healthcare Quality Coordinator',titles:['Quality Assistant','Healthcare Quality Coordinator','Senior Quality Coordinator','Quality Lead','Quality Manager'],factor:1.06,smarts:52,eng:34,minExp:1,desc:'Patient-safety documentation, incident reporting and clinical quality metrics. Clinical licences still apply where required.'},
      {band:3,title:'Clinical Operations Analyst',titles:['Clinical Operations Analyst','Senior Clinical Operations Analyst','Clinical Programme Lead','Clinical Operations Manager','Director of Clinical Operations'],factor:1.16,smarts:58,eng:44,minExp:3,desc:'Clinical reporting and project coordination; regulated clinical duties require local authorisation.'},
      {band:5,title:'Healthcare Programme Manager',titles:['Programme Officer','Programme Manager','Senior Programme Manager','Healthcare Director','Regional Healthcare Director'],factor:1.28,smarts:65,eng:52,minExp:5,desc:'Own programme delivery, budgets and service improvements; specialist clinical practice remains regulated.'}
    ],
    bio:[
      {band:1,title:'Quality Control Analyst',titles:['QC Assistant','QC Analyst','Senior QC Analyst','QC Lead','QC Manager'],factor:1.07,smarts:50,eng:34,minExp:1,desc:'Lab records, sample testing, deviation reports and quality procedures.'},
      {band:3,title:'Regulatory Affairs Specialist',titles:['Regulatory Associate','Regulatory Affairs Specialist','Senior Regulatory Specialist','Regulatory Lead','Regulatory Manager'],factor:1.16,smarts:58,eng:48,minExp:3,desc:'Product registration, technical files and coordination with regulators.'},
      {band:5,title:'Research / Quality Team Lead',titles:['Research Coordinator','Research Team Lead','Senior Research Lead','Laboratory Manager','Research Director'],factor:1.27,smarts:66,eng:54,minExp:5,desc:'Coordinate staff, lab workflows and research delivery; roles vary with qualification and sector.'}
    ],
    entry:[
      {band:1,title:'Operations Coordinator',titles:['Operations Assistant','Operations Coordinator','Senior Operations Coordinator','Operations Team Lead','Operations Manager'],factor:1.04,smarts:38,eng:25,minExp:1,desc:'Process tracking, issue resolution, service metrics and coordination across teams.'},
      {band:3,title:'Operations / Customer Experience Analyst',titles:['Operations Analyst','Customer Experience Analyst','Senior Operations Analyst','Operations Lead','Operations Manager'],factor:1.13,smarts:48,eng:38,minExp:3,desc:'Analyse service quality, identify recurring problems and improve workflows.'},
      {band:5,title:'Operations Team Manager',titles:['Team Lead','Operations Supervisor','Operations Manager','Senior Operations Manager','Operations Director'],factor:1.23,smarts:56,eng:42,minExp:5,desc:'Manage workflows, performance coaching and service-level delivery.'}
    ]
  };
  const available=(specs[track]||specs.entry).filter(x=>exp>=x.band);
  const names={egy:['Nile Crest Business Services','Alexandria Professional Group','Cairo Growth Partners','Delta Operations & Advisory'],usa:['Northstar Business Partners','Cedarline Professional Group','Redwood Advisory Services','Lakeview Operations'],gbr:['Westbridge Advisory','Thames Professional Services','Northfield Business Partners','Crown Operations Group'],can:['Maple Business Partners','Northern Professional Services','Clearpath Advisory','Harbour Operations Group'],deu:['Rhein Advisory Group','Alpen Professional Services','Klar Operations GmbH','Frankfurt Business Partners'],uae:['Gulf Horizon Partners','Emirates Advisory Services','Oasis Business Group','Dune Operations'],sau:['Riyadh Growth Partners','Najd Advisory Group','Kingdom Business Services','Desert Operations'],ind:['Lotus Business Partners','Deccan Advisory Group','Eastern Operations Services','Banyan Growth Partners']};
  const pool=names[country]||['Regional Professional Services','Brightline Business Partners','Summit Advisory Group','Clearway Operations'];
  return available.map((x,i)=>{
    const id=`p23-exp-${country}-${gameYear()}-${track}-${x.band}-${i}`;
    const degrees=({finance:['business'],tech:['cs'],law:['law','business'],medical:['medicine','biology'],bio:['biology','medicine']}[track]||null);
    const post={id,trackId:track,group:track==='finance'?'finance':track==='tech'?'tech':track==='law'?'legal':track==='medical'?'medical':track==='bio'?'bio':'entry',roleTitle:x.title,titles:x.titles.slice(),factor:x.factor,smarts:x.smarts,eng:x.eng,minExp:x.minExp,degreeExperienceAlternative:true,medical:exp>=3,social:true,bonus:exp>=3?.05:.02,leave:exp>=3?21:18,remote:track==='tech'||track==='finance'?'Hybrid / remote by employer':'Hybrid where duties allow',hours:40,stress:track==='medical'?5:4,contract:exp>=3?'Permanent / specialist contract':'Permanent / fixed-term',desc:x.desc,name:pool[(gameYear()+i+x.band)%pool.length],companySize:exp>=5?'large employer / leadership vacancy':exp>=3?'mid-sized specialist employer':'small or growing employer',sponsorship:country===S.home?false:(exp>=3&&Math.random()<.30)};
    if(degrees)post.degrees=degrees;
    return post;
  });
}
companyListFor=function(country=S.country){
  const base=P23_companyListBeforeExperienceOpenings(country)||[];
  if(!S||country!==S.country||S.age<18)return base;
  const extra=p23ExperienceOpenings(country),ids=new Set(base.map(p=>p.id));
  extra.forEach(p=>{if(!ids.has(p.id))base.push(p);});
  return base;
};

/* Active Matters: responses stay visible in one place and unresolved requests have consequences. */
const P23_jobEligibleBeforeDegreeArray=jobEligible;
jobEligible=function(post){
  const base=P23_jobEligibleBeforeDegreeArray(post);if(base)return base;
  const allowed=post&&Array.isArray(post.degrees)?post.degrees:[];
  if(allowed.length){
    const earned=typeof p15DegreeKeys==='function'?p15DegreeKeys():[S.degree].filter(Boolean);
    const experienceAlternative=!!post.degreeExperienceAlternative&&typeof trackExperience==='function'&&trackExperience(post.trackId)>=Math.max(5,(Number(post.minExp)||0)+3);
    if(!allowed.some(k=>earned.includes(k))&&!experienceAlternative)return `Requires one of these relevant qualifications, or equivalent experience: ${allowed.map(k=>MAJORS[k]?.name||k).join(' or ')}.`;
  }
  return '';
};
function p23ActiveCount(){
  if(!S)return 0;p23Init(S);
  let n=S.p23Matters.filter(m=>!m.resolved).length;
  if(S.pending&&S.ev&&Array.isArray(S.ev.choices)&&S.ev.choices.length)n++;
  if(S.parentNeed||S.familyNeed)n++;
  if(S.pendingJobOffer)n++;
  n+=(S.ownedHomes||[]).filter(h=>h&&h.p12&&['vacant','p12-listed'].includes(h.status)&&S.housing!==h.id).length;
  n+=Object.entries(S.p23CarePlans||{}).filter(([id,p])=>p&&p.kind&&(S.family||[]).some(m=>m.id===id&&m.alive!==false)).length;
  return n;
}
function p23GetMatter(id){return (S.p23Matters||[]).find(m=>m.id===id&&!m.resolved);}
function p23ResolveMatter(id){const m=p23GetMatter(id);if(m)m.resolved=true;S.p23Matters=(S.p23Matters||[]).filter(x=>!x.resolved);}
function p23QueueAnnualMatter(){
  if(!S)return;p23Init(S);
  if(S.pending||S.parentNeed||S.familyNeed)return;
  S.p23Matters=S.p23Matters.filter(m=>!m.resolved);
  if(S.p23Matters.length>=3)return;
  const elders=parents().filter(p=>Number(p.age)>=60&&!S.p23CarePlans[p.id]&&!(S.elderCare&&S.elderCare[p.id]&&S.elderCare[p.id]!=='none'));
  const overdue=elders.find(p=>S.p23CareAlertAge[p.id]==null||S.age-(Number(S.p23CareAlertAge[p.id])||0)>=3);
  if(overdue && (Number(overdue.age)===60 || Math.random()<.48)){
    S.p23CareAlertAge[overdue.id]=S.age;
    const id=`p23-care-${overdue.id}-${S.p23MatterSeq++}`;
    S.p23Matters.push({id,type:'eldercare',memberId:overdue.id,title:`Your ${p17Relation(overdue)} needs more support`,text:`${overdue.name} is ${overdue.age}. You and your siblings need to decide whether to share the care, arrange paid help, or organise regular family visits. Ignoring this request may affect your relationship.`,createdAge:S.age,dueAge:S.age+1,resolved:false});
    S.p23LastMatterCreatedAge=S.age;return;
  }
  if(S.p23LastMatterCreatedAge===S.age)return;
  const members=(S.family||[]).filter(m=>m&&m.alive!==false&&['Mother','Father','Sibling'].includes(m.role));
  if(members.length&&Math.random()<.22){
    const m=pick(members),id=`p23-attention-${m.id}-${S.p23MatterSeq++}`;
    S.p23Matters.push({id,type:'attention',memberId:m.id,title:`Make time for ${m.name}`,text:`${m.name} has been feeling out of touch. A call, meal together or a few hours helping with something would mean a lot. Time is limited, and ignoring it may weaken the relationship.`,createdAge:S.age,dueAge:S.age+1,resolved:false});
    S.p23LastMatterCreatedAge=S.age;
  }
}
function p23ExpireMatters(){
  if(!S||!Array.isArray(S.p23Matters))return;
  const keep=[];
  S.p23Matters.forEach(m=>{
    if(m.resolved)return;
    if((Number(m.dueAge)||Infinity)<=S.age){
      const person=(S.family||[]).find(x=>x.id===m.memberId);
      if(person){person.bond=clamp((person.bond||0)-(m.type==='eldercare'?8:6));}
      fx({happiness:-2});
      log(m.type==='eldercare'?`${person?.name||'Your family'} had to manage ageing-parent care without a clear plan. The relationship was strained.`:`You did not make time for ${person?.name||'your family'} before the request expired. They felt neglected.`);
      m.resolved=true;
    }else keep.push(m);
  });
  S.p23Matters=keep;
}
function p23ResolveAttention(id,choice){
  const m=p23GetMatter(id);if(!m||m.type!=='attention')return;
  const person=(S.family||[]).find(x=>x.id===m.memberId&&x.alive!==false);
  if(!person)return hint('This family member is no longer available.');
  if(choice==='time'){
    if((S.actions||0)<1)return hint('You have no free action left this year. You can still choose to decline, or resolve it next year with consequences.');
    S.actions--;person.bond=clamp((person.bond||0)+8);fx({happiness:3,social:2});
    log(`You made time for ${person.name}. Your family bond improved, though you gave up time for another activity.`);
    realismNotice('Family time well spent',`You spent some of your limited time with ${person.name}. Your bond improved; you had one fewer action available for other activities this year.`);
  }else{person.bond=clamp((person.bond||0)-5);fx({happiness:-1});log(`You could not make time for ${person.name} this year. They understood your workload but felt disappointed.`);}
  p23ResolveMatter(id);render();
}
function p23CareCost(kind,parentCount=1){const base={nurse:1500,maid:2200,both:3500,caregiver:950};return Math.round(p20LocalCost(base[kind]||1500)*.38)*Math.max(1,parentCount);}
function p23SiblingList(){return (S.family||[]).filter(m=>m&&m.alive!==false&&m.role==='Sibling');}
function p23ArrangeCare(matterId,kind,mode='split',allParents=false){
  if(!S||S.age<18)return hint('You can organise a paid care plan from age 18.');p23Init(S);
  const matter=p23GetMatter(matterId),target= matter && matter.type==='eldercare'?(S.family||[]).find(m=>m.id===matter.memberId&&m.alive!==false):null;
  let targets=allParents?parents().filter(m=>m.age>=60):target?[target]:[];
  if(!targets.length)return hint('No eligible parent needs this care plan.');
  const total=p23CareCost(kind,targets.length);let playerTotal=total,sibling=null,siblingTotal=0;
  if(mode==='split'){
    const siblings=p23SiblingList();if(!siblings.length){if(matter)matter.note='No living brother or sister is available to share costs.';return hint('There is no living brother or sister available to share the cost. Choose to pay yourself or provide care time.');}
    sibling=pick(siblings);const bond=Math.max(0,Math.min(100,Number(sibling.bond)||0));const chance=Math.max(.15,Math.min(.82,.28+bond*.004+(sibling.age>=25?.06:0)));
    if(Math.random()>chance){sibling.bond=clamp((sibling.bond||0)-3);if(matter){matter.note=`${sibling.name} refused to contribute this time. You can pay the full cost, provide care yourself, or ask for help later.`;matter.refusedSiblingId=sibling.id;}log(`${sibling.name} refused to split the parent-care costs. No care was booked and no money was charged.`);realismNotice('Your sibling declined to contribute',`${sibling.name} said they could not or would not contribute to this care plan. The service has not been booked and you have not been charged.`);render();return;}
    playerTotal=Math.ceil(total*.5);siblingTotal=total-playerTotal;
    sibling.bond=clamp((sibling.bond||0)+2);
  }
  if(S.wealth<playerTotal)return hint(`You need ${money(playerTotal)} available for your share of this year's care. No payment was taken.`);
  S.wealth-=playerTotal;S.expenses=(S.expenses||0)+playerTotal;S.bill=S.bill||{};S.bill.familyCare=(S.bill.familyCare||0)+playerTotal;
  const perPlayer=Math.ceil(playerTotal/targets.length),perSibling=Math.floor(siblingTotal/targets.length);
  targets.forEach(parent=>{S.p23CarePlans[parent.id]={kind,annualTotal:Math.round(total/targets.length),playerShare:perPlayer,siblingShare:perSibling,siblingId:sibling?sibling.id:null,createdAge:S.age,autoMarket:true};parent.bond=clamp((parent.bond||0)+5);});
  if(matter)p23ResolveMatter(matterId);
  const label={nurse:'visiting nurse',maid:'household helper / maid',both:'visiting nurse plus household helper',caregiver:'part-time caregiver'}[kind]||'care service';
  log(`You arranged ${label} for ${targets.map(m=>m.name).join(' and ')}. ${sibling?`${sibling.name} agreed to contribute ${money(siblingTotal)} per year; `:''}your share is ${money(playerTotal)} now and approximately ${money(playerTotal)} each following year.`);
  realismNotice('Family care plan arranged',`${label} is arranged for ${targets.map(m=>m.name).join(' and ')}. Your share: ${money(playerTotal)}/year.${sibling?` ${sibling.name} agreed to contribute about ${money(siblingTotal)}/year.`:''} You can change or stop the plan in Active Matters / Relationships later.`);
  render();
}
function p23CareByTime(matterId,mode='self',allParents=false){
  const matter=p23GetMatter(matterId);const target=matter&&(S.family||[]).find(m=>m.id===matter.memberId&&m.alive!==false);
  let targets=allParents?parents().filter(m=>m.age>=60):target?[target]:[];
  if(!targets.length)return hint('No eligible parent needs this care plan.');
  if(mode==='self'&&(S.actions||0)<1)return hint('You need one free action to commit to regular care this year.');
  let sibling=null;
  if(mode==='sibling'){
    const siblings=p23SiblingList();if(!siblings.length)return hint('No living brother or sister is available.');sibling=pick(siblings);
    const chance=Math.max(.18,Math.min(.84,.30+(Number(sibling.bond)||0)*.004));
    if(Math.random()>chance){sibling.bond=clamp((sibling.bond||0)-3);if(matter)matter.note=`${sibling.name} declined to take regular care shifts. You can take the time yourself or arrange paid support.`;log(`${sibling.name} refused to take regular care shifts for your ageing parent(s).`);realismNotice('Sibling declined care duties',`${sibling.name} was unable or unwilling to take regular care shifts. No care plan was started.`);render();return;}
    sibling.bond=clamp((sibling.bond||0)+3);
  }else S.actions--;
  targets.forEach(m=>{S.p23CarePlans[m.id]={kind:mode==='sibling'?'sibling-time':'family-time',annualTotal:0,playerShare:0,siblingId:sibling?sibling.id:null,createdAge:S.age};m.bond=clamp((m.bond||0)+6);});
  if(matter)p23ResolveMatter(matterId);
  const who=sibling?sibling.name:'you';log(`${who} agreed to regular care and check-ins for ${targets.map(m=>m.name).join(' and ')}. It saves money but uses time and attention.`);
  realismNotice('Family care plan',`${who} will take on regular care/check-ins for ${targets.map(m=>m.name).join(' and ')}. Paid support costs nothing under this plan, but family time and energy are still required.`);render();
}
function p23StopCarePlan(id){if(!S.p23CarePlans||!S.p23CarePlans[id])return;delete S.p23CarePlans[id];log(`You ended the dedicated care plan for ${(S.family||[]).find(m=>m.id===id)?.name||'your parent'}. Any paid service will stop at the end of the current paid period.`);render();}
function p23ApplyCareYear(){
  if(!S)return;p23Init(S);
  const plans=Object.entries(S.p23CarePlans).filter(([id,p])=>p&&p.kind&&S.family.some(m=>m.id===id&&m.alive!==false));let total=0;
  plans.forEach(([id,p])=>{
    const m=S.family.find(x=>x.id===id);
    if(p.kind==='family-time'){fx({health:-2,happiness:-2});if(S.job)S.job.perf=clamp((S.job.perf||0)-3);m.bond=clamp((m.bond||0)+2);}
    else if(p.kind==='sibling-time'){m.bond=clamp((m.bond||0)+1);}
    else if((Number(p.playerShare)||0)>0){
      total+=Number(p.playerShare)||0;
      if((Number(p.siblingShare)||0)>0&&p.siblingId){
        const sibling=(S.family||[]).find(x=>x.id===p.siblingId&&x.alive!==false);
        if(sibling){log(`${sibling.name} contributed ${money(p.siblingShare)} toward ${m.name}'s annual care plan.`);sibling.bond=clamp((sibling.bond||0)+1);}
      }
    }
  });
  if(total>0){S.wealth-=total;S.expenses=(S.expenses||0)+total;S.bill=S.bill||{};S.bill.familyCare=(S.bill.familyCare||0)+total;if(S.yearPopup){S.yearPopup.expenses=(S.yearPopup.expenses||0)+total;}log(`Recurring parent-care costs: your share was ${money(total)} this year.${S.wealth<0?' The expense pushed you into debt.':''}`);if(S.wealth<0)fx({happiness:-2});}
}
function p23MatterCareCard(m){
  const parent=(S.family||[]).find(x=>x.id===m.memberId);if(!parent)return '';
  const oldCount=parents().filter(x=>x.age>=60).length, siblingText=p23SiblingList().length?'A brother or sister may agree to split the cost, but can refuse.':'No brother or sister is available to share costs.';
  return `<section class="card"><h3>${m.title}</h3><p class="muted">${m.text}</p>${m.note?`<p style="color:var(--amber);font-size:.85rem">${m.note}</p>`:''}<p class="muted">${siblingText}</p><b>Paid care for ${parent.name}</b>${[['nurse','Hire a visiting nurse'],['maid','Hire a household helper / maid'],['both','Hire both nurse and maid']].map(([kind,label])=>{const cost=p23CareCost(kind,1),share=Math.ceil(cost/2);return `${p23SiblingList().length?`<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','split',false)">${label} · ${money(share)}/year if sibling agrees<small>If your sibling refuses, nothing is charged and this decision stays open.</small></button>`:''}<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','self',false)">Pay for ${label.toLowerCase()} yourself · ${money(cost)}/year</button>`;}).join('')}<button class="btn" onclick="p23CareByTime('${m.id}','self',false)">I will provide regular care myself (uses 1 action and ongoing time)<small>No service bill, but it reduces your time and energy each year.</small></button>${p23SiblingList().length?`<button class="btn" onclick="p23CareByTime('${m.id}','sibling',false)">Ask a sibling to take regular care shifts<small>They may agree or refuse. No money is charged.</small></button>`:''}${oldCount>1?`<hr style="border-color:var(--line);margin:12px 0"><b>Plan for both ageing parents</b>${[['nurse','Nurse for both'],['maid','Maid/helper for both'],['both','Nurse + maid for both']].map(([kind,label])=>`${p23SiblingList().length?`<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','split',true)">${label} · ${money(Math.ceil(p23CareCost(kind,oldCount)/2))}/year each share if sibling agrees</button>`:''}<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','self',true)">Pay full cost for ${label.toLowerCase()} · ${money(p23CareCost(kind,oldCount))}/year</button>`).join('')}<button class="btn" onclick="p23CareByTime('${m.id}','self',true)">I will help both parents myself (uses 1 action and ongoing time)</button></section>`:''}</section>`;
}
function p23AutoRentAndFind(homeId){
  if(!S||S.age<18)return hint('Renting out property is available from age 18.');
  const h=(S.ownedHomes||[]).find(x=>x.id===homeId);if(!h)return hint('Property not found.');
  if(S.housing===h.id)return hint('Move into another home first. You cannot rent out the home you currently live in.');
  if(h.status==='p12-rented'&&h.tenant)return hint('This property already has a tenant.');
  const country=h.rentCurrency||h.marketCountry||S.country,rate=Math.max(.0001,rateForCountry(country,gameYear()));
  const yieldRate=Math.max(.001,Number(h.marketRentRate||h.listingDetails?.marketRentRate||.003));
  const monthlyInternal=Math.max(1,(Number(h.value)||1000)*yieldRate);
  const localMonthly=Math.max(1,Math.round(monthlyInternal*rate));
  h.p12=true;h.marketCountry=country;h.rentCurrency=country;h.rentLocalAmount=localMonthly;h.rentAmount=localMonthly/rate;h.rentInc=h.rentAmount*12;h.rentStepPct=0;h.rentContractYears=0;h.p23AutoMarketRent=true;h.p23LastMarketTrendYear=gameYear();h.tenant=true;h.status='p12-rented';h.tenantStartYear=gameYear();
  log(`You priced ${h.name} at the current fair market rent (${localMonthly.toLocaleString()} ${(COUNTRIES[country]||COUNTRIES.usa).cur}/month) and found a tenant immediately. Future rent will follow the local market trend, with gradual changes at renewal.`);
  realismNotice('Tenant found at market rent',`${h.name} is now rented. Asking rent: ${localMonthly.toLocaleString()} ${(COUNTRIES[country]||COUNTRIES.usa).cur}/month. The initial rent uses an estimated market yield; after each simulated year, rent moves gradually toward the updated market level. Maintenance, vacancy risk and taxes still matter.`);
  render();
}
function p23ListCustomRentAndFind(homeId){
  const h=(S.ownedHomes||[]).find(x=>x.id===homeId);if(!h)return hint('Property not found.');
  if(S.housing===h.id)return hint('Move into another home before listing this property.');
  const el=$(`p12-rent-${homeId}`),local=Number(el&&el.value);
  if(!Number.isFinite(local)||local<=0)return hint('Enter a monthly rent first, or use the automatic market-rent option.');
  const country=h.rentCurrency||h.marketCountry||S.country,rate=Math.max(.0001,rateForCountry(country,gameYear())),fair=(Number(h.value)||1000)*Math.max(.001,Number(h.marketRentRate||h.listingDetails?.marketRentRate||.003))*rate;
  const ratio=local/Math.max(1,fair);
  if(ratio>1.35)return hint('That asking rent is more than 35% above the estimated market level. Reduce it or use automatic market pricing to find a tenant now.');
  if(ratio<.55)return hint('That asking rent is far below the estimated market level. Check the amount before publishing.');
  h.p12=true;h.marketCountry=country;h.rentCurrency=country;h.rentLocalAmount=Math.round(local);h.rentAmount=h.rentLocalAmount/rate;h.rentInc=h.rentAmount*12;h.rentStepPct=Number($(`p12-rise-${homeId}`)?.value)||0;h.rentContractYears=0;h.p23AutoMarketRent=false;h.tenant=true;h.status='p12-rented';h.tenantStartYear=gameYear();
  log(`You listed ${h.name} at ${h.rentLocalAmount.toLocaleString()} ${(COUNTRIES[country]||COUNTRIES.usa).cur}/month. A tenant accepted immediately because the asking rent was within a plausible market range.`);realismNotice('Tenant accepted your asking rent',`A tenant has agreed to ${h.rentLocalAmount.toLocaleString()} ${(COUNTRIES[country]||COUNTRIES.usa).cur}/month. Lease increases follow the contract terms you selected; a tenant may still leave later.`);render();
}
const P23_viewAssetsBeforeQuickRent=viewAssets;
viewAssets=function(){
  let html=P23_viewAssetsBeforeQuickRent();if(!S||S.age<18||!Array.isArray(S.ownedHomes)||!S.ownedHomes.length)return html;
  const homes=S.ownedHomes.filter(h=>h&&h.status!=='p12-rented'&&!(h.status==='rent'&&h.tenant));
  if(!homes.length)return html+SEC('Automatic rental market','All eligible properties already have tenants.');
  html+=SEC('Automatic rent pricing & immediate tenant search',PR('Skip manually setting rent. The game estimates a fair monthly price from property value and the local rental yield, then places a tenant immediately. Automatic rents update gradually with market prices each year. You can also publish a reasonable custom asking rent from the property’s rent input above.')+homes.map(h=>{
    const country=h.rentCurrency||h.marketCountry||S.country,rate=Math.max(.0001,rateForCountry(country,gameYear())),yieldRate=Math.max(.001,Number(h.marketRentRate||h.listingDetails?.marketRentRate||.003)),fair=Math.round((Number(h.value)||1000)*yieldRate*rate);
    return `<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px"><b>${h.name}</b>${ROW('Estimated market rent',`${fair.toLocaleString()} ${(COUNTRIES[country]||COUNTRIES.usa).cur}/month`)}${ROW('Status',S.housing===h.id?'You live here':h.status==='p12-listed'?'Listed — vacant':'Vacant') }<button class="btn" ${S.housing===h.id?'disabled':''} onclick="p23AutoRentAndFind('${h.id}')">Set market rent & find tenant now</button><button class="btn" ${S.housing===h.id?'disabled':''} onclick="p23ListCustomRentAndFind('${h.id}')">Use entered rent & find tenant now</button></div>`;
  }).join(''));
  return html;
};
const P23_p12SettlementBeforeMarketRent=p12SettleRentalYear;
p12SettleRentalYear=function(){
  if(S&&Array.isArray(S.ownedHomes))S.ownedHomes.forEach(h=>{
    if(!h||!h.p23AutoMarketRent||h.status!=='p12-rented'||!h.tenant||gameYear()<=(h.p23LastMarketTrendYear||gameYear()))return;
    const country=h.rentCurrency||h.marketCountry||S.country,rate=Math.max(.0001,rateForCountry(country,gameYear()));
    const target=Math.max(1,Math.round((Number(h.value)||1000)*Math.max(.001,Number(h.marketRentRate||h.listingDetails?.marketRentRate||.003))*rate));
    const current=Math.max(1,Number(h.rentLocalAmount)||target),delta=target-current;
    const adjusted=Math.round(current+Math.max(-current*.08,Math.min(current*.12,delta)));
    h.rentLocalAmount=adjusted;h.rentAmount=adjusted/rate;h.rentInc=h.rentAmount*12;h.p23LastMarketTrendYear=gameYear();
    if(adjusted!==current)log(`Market rent review for ${h.name}: monthly rent adjusted gradually from ${current.toLocaleString()} to ${adjusted.toLocaleString()} ${(COUNTRIES[country]||COUNTRIES.usa).cur}.`);
  });
  return P23_p12SettlementBeforeMarketRent();
};

function viewMatters(){
  if(!S)return SEC('Active Matters','Start a life to see pending decisions.');p23Init(S);
  let html=SEC('Active Matters',PR('This is the central place for decisions that need a response. Unresolved family requests may affect relationships, money, time and future care costs. Some items have a deadline; ignoring them can have consequences.'));
  if(S.pending&&S.ev&&Array.isArray(S.ev.choices)&&S.ev.choices.length){
    html+=SEC(S.ev.title||'A decision is waiting',PR(evText(S.ev)||S.ev.text||'Choose how to respond.')+(S.ev.choices||[]).map((c,i)=>{const no=unaffordable(c);return `<button class="btn" ${no?'disabled':''} onclick="choose(${i})">${c.label||`Option ${i+1}`}${no?'<small>Not enough cash</small>':''}</button>`;}).join(''));
  }
  if(S.parentNeed||S.familyNeed){
    const r=p14RequestState();if(r){html+=SEC(`${r.name} asks for help`,PR(`They need help with ${r.reason}. The suggested amount is ${money(r.amountInternal)}. You can send a smaller amount or decline, but this request should be answered before time advances.`)+`<label for="p14-family-request-amount" class="muted">Amount to send (${C().cur})</label><input id="p14-family-request-amount" type="number" min="0" value="${Math.round(r.amountPlayer)}" style="width:100%;margin:8px 0 12px">`+B('Send chosen amount','Only the amount you choose is transferred.','p14RespondFamilyNeed(true)')+B('Decline for now','Protect your budget; the relationship may be strained.','p14RespondFamilyNeed(false)'));}
  }
  const active=(S.p23Matters||[]).filter(m=>!m.resolved);
  if(active.length)html+=active.map(m=>m.type==='eldercare'?p23MatterCareCard(m):SEC(m.title,PR(m.text)+PR(`Respond before age ${m.dueAge}; ignoring it may weaken this relationship.`)+B('Make time for them — use one action','Improve the bond and happiness, but lose an action for this year.',`p23ResolveAttention('${m.id}','time')`,(S.actions||0)<1)+B('I cannot make time this year','The person may feel neglected.',`p23ResolveAttention('${m.id}','skip')`))).join('');
  const ongoingCare=Object.entries(S.p23CarePlans||{}).filter(([id,p])=>p&&p.kind&&(S.family||[]).some(m=>m.id===id&&m.alive!==false));
  if(ongoingCare.length){
    html+=SEC('Ongoing parent-care arrangements',PR('Review these commitments here. Paid services renew yearly; stopping a plan prevents the next renewal. Family-care plans use ongoing time and can affect energy or work performance.')+ongoingCare.map(([id,p])=>{
      const person=(S.family||[]).find(m=>m.id===id),sib=(S.family||[]).find(m=>m.id===p.siblingId&&m.alive!==false);
      const labels={nurse:'Visiting nurse',maid:'Household helper / maid',both:'Nurse + household helper',caregiver:'Part-time caregiver','family-time':'You provide regular family care','sibling-time':`${sib?sib.name:'A sibling'} provides regular care`};
      return SEC(`${person?person.name:'Parent'} · ${labels[p.kind]||'Care plan'}`,ROW('Your recurring share',p.playerShare?`${money(p.playerShare)}/year`:'No service bill')+(p.siblingShare?ROW('Sibling contribution',`${money(p.siblingShare)}/year${sib?' · '+sib.name:''}`):'')+B('Stop this arrangement','No further renewal after the current paid period.',`p23StopCarePlan('${id}')`));
    }).join(''));
  }
  if(S.pendingJobOffer){const p=S.pendingJobOffer;html+=SEC('Job / sponsorship decision processing',ROW('Employer',p.job?.company||'Employer')+ROW('Role',p.job?.title||'Position')+ROW('Status',`Awaiting immigration decision · ${p.years||0} processing year(s)`)+PR('You do not receive this job’s salary before approval. The decision will be recorded in your Career tab and Life log.'));}
  const vacant=(S.ownedHomes||[]).filter(h=>h&&h.p12&&['vacant','p12-listed'].includes(h.status)&&S.housing!==h.id);
  if(vacant.length)html+=SEC('Vacant properties',PR('A vacant property still costs money to maintain. Set a market-based rent and place a tenant now, or review the property in Real Estate.')+vacant.map(h=>B(h.name,`Find a tenant at estimated market rent · ${money(Math.round((h.value||1000)*(h.marketRentRate||h.listingDetails?.marketRentRate||.003)))}/month`, `p23AutoRentAndFind('${h.id}')`)).join(''));
  if(!p23ActiveCount())html+=SEC('Nothing needs a response right now',PR('No pending events, family requests, ageing-parent decisions or vacant rental actions are waiting. New matters may appear as your life and family change.'));
  return html;
}
/* In Active Matters, render money requests inline instead of covering the tab with a modal. */
const P23_parentModalBeforeInline=p14ShowParentRequestModal;
p14ShowParentRequestModal=function(){
  if(activeTab==='matters'){
    const el=document.getElementById('p14-parent-request-modal');if(el)el.remove();return;
  }
  return P23_parentModalBeforeInline();
};

/* Load/init support for all pre-existing saves. */
const P23_migrateBeforeInit=migrate;
migrate=function(o){const r=P23_migrateBeforeInit(o);p23Init(r);return r;};
const P23_newGameBeforeInit=newGame;
newGame=function(...args){P23_newGameBeforeInit(...args);p23Init(S);};
const P23_loadGameBeforeInit=loadGame;
loadGame=function(){P23_loadGameBeforeInit();if(S){p23Init(S);render();}};
const P23_ageUpBeforeMatters=ageUp;
ageUp=function(){
  if(!S)return;
  p23Init(S);
  if((S.parentNeed||S.familyNeed)&&activeTab==='matters'){
    hint('Please answer the family money request in Active Matters before advancing time.');render();return;
  }
  const before=S.age;
  P23_ageUpBeforeMatters();
  if(!S||S.age===before)return;
  p23Init(S);
  p23ExpireMatters();
  p23ApplyCareYear();
  p23QueueAnnualMatter();
  render();
};
p23Init(S);

/* Final invariants: a saved USD contract must never be re-priced as a local job. */
const P23_migrateBeforeUsdContractGuard=migrate;
migrate=function(o){
  const savedRemote=o&&o.job&&o.job.isRemoteUSD?{
    salary:Number(o.job.salary)||0,
    lastSalary:Number(o.lastSalary)||0
  }:null;
  const r=P23_migrateBeforeUsdContractGuard(o);
  if(savedRemote&&r&&r.job&&r.job.isRemoteUSD){
    r.job.salary=Math.max(0,savedRemote.salary);
    r.lastSalary=r.job.salary;
  }
  return r;
};
/* Local inflation is not an automatic contract amendment to a USD-paid contractor salary. */
const P23_packYearBeforeUsdContractGuard=packYear;
packYear=function(...args){
  const jobBefore=S&&S.job,remoteBefore=!!(jobBefore&&jobBefore.isRemoteUSD),salaryBefore=remoteBefore?Math.max(0,Number(jobBefore.salary)||0):0;
  const result=P23_packYearBeforeUsdContractGuard(...args);
  if(remoteBefore&&S&&S.job===jobBefore){S.job.salary=salaryBefore;S.lastSalary=salaryBefore;}
  return result;
};

/* ================= PHASE 24 — UI CLEANUP & AGE-APPROPRIATE SYSTEMS =================
   Consolidates duplicate screens, moves tasks to the right tabs, and keeps the
   existing simulation functions as the source of truth wherever possible. */

function p24Esc(v){return String(v==null?'':v).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function p24StripSection(html, headingRe){
  /* Remove whole card sections with balanced nested <section> tags. The old
     non-greedy regex stopped at the first nested closing tag and could damage
     the remaining screen markup. */
  const strip=fragment=>{
    let out='',cursor=0,start;
    const marker='<section class="card">';
    while((start=fragment.indexOf(marker,cursor))>=0){
      out+=fragment.slice(cursor,start);
      const openEnd=start+marker.length,token=/<\/?section\b[^>]*>/ig;token.lastIndex=start;
      let depth=0,end=-1,closeStart=-1,closeText='';let m;
      while((m=token.exec(fragment))){
        if(/^<\/section/i.test(m[0]))depth--;else depth++;
        if(depth===0){end=token.lastIndex;closeStart=m.index;closeText=m[0];break;}
      }
      if(end<0){out+=fragment.slice(start);return out;}
      const inside=fragment.slice(openEnd,closeStart),heading=inside.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
      const title=heading?heading[1].replace(/<[^>]*>/g,'').trim():'';
      headingRe.lastIndex=0;
      if(heading&&headingRe.test(title)){cursor=end;continue;}
      out+=marker+strip(inside)+closeText;cursor=end;
    }
    return out+fragment.slice(cursor);
  };
  return strip(String(html||''));
}
function p24Relation(m){return typeof p17Relation==='function'?p17Relation(m,true):`${m&&m.role||'Family member'}${m&&m.name?` (${m.name})`:''}`;}
function p24Popup(title,message){
  const old=document.getElementById('p24-feedback-modal');if(old)old.remove();
  const backdrop=document.createElement('div');backdrop.className='p24-modal-backdrop';backdrop.id='p24-feedback-modal';backdrop.setAttribute('role','dialog');backdrop.setAttribute('aria-modal','true');
  backdrop.innerHTML=`<div class="p24-modal"><div class="p24-pill">LIFELINE · LIFE UPDATE</div><h2>${p24Esc(title)}</h2><p>${p24Esc(message)}</p><button class="btn" id="p24-feedback-close" style="text-align:center;margin-top:16px">Continue</button></div>`;
  document.body.appendChild(backdrop);
  const close=()=>{const e=document.getElementById('p24-feedback-modal');if(e)e.remove();};
  backdrop.querySelector('#p24-feedback-close').onclick=close;backdrop.addEventListener('click',e=>{if(e.target===backdrop)close();});
}

/* The Life page is for the current story and meaningful events, not a generic
   checklist of adult needs shown to a child. */
const P24_viewLifeBefore=viewLife;
viewLife=function(){
  let html=P24_viewLifeBefore();
  html=p24StripSection(html,/Everyday needs & goals/i);
  return html;
};

/* A credit score added noise without creating a useful life-simulation choice.
   Replace it with transparent debt pricing based on loan size and mortgage rate. */
const P24_econCardBefore=econCard;
econCard=function(){return P24_econCardBefore().replace(/<div class="row"><span>Credit score<\/span><b class="mono">[\s\S]*?<\/div>/g,'');};
const P24_viewBankBefore=viewBank;
viewBank=function(){
  let html=P24_viewBankBefore();
  html=p24StripSection(html,/^Credit score$/i);
  html=html.replace(/Credit Limit:/g,'Available borrowing estimate:');
  html=html.replace(/Credit limit[^<]*/gi,'Borrowing capacity');
  return html;
};

/* One selected relative at a time: a single transfer or monthly support plan. */
function p24FamilySupportCard(){
  if(!S||S.age<18)return '';
  const members=(S.family||[]).filter(m=>m&&m.alive!==false&&['Mother','Father','Sibling','Child','Partner','Spouse'].includes(m.role));
  if(!members.length)return '';
  const selected=members.find(m=>(Number(m.allow)||0)>0)||members[0];
  const opts=members.map(m=>`<option value="${p24Esc(m.id)}" ${m.id===selected.id?'selected':''}>${p24Esc(p24Relation(m))}</option>`).join('');
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">FAM</span><div><h3 style="margin-bottom:2px">Family financial support</h3><p class="muted" style="font-size:.8rem">Choose one person, then decide how to help. Transfers happen immediately; monthly support is deducted as 12 months at the yearly turn.</p></div></div>
  <div class="p24-field"><label for="p24-support-member">Family member</label><select id="p24-support-member" onchange="p24UpdateSupportPreview()">${opts}</select></div>
  <div id="p24-support-current" class="row" style="margin-top:8px"><span>Current monthly support</span><b>${money((selected.allow||0)/12)}/month</b></div>
  <div class="p24-field" style="margin-top:12px"><label for="p24-support-once">One-time transfer · ${p24Esc(C().cur)}</label><input id="p24-support-once" type="number" min="1" step="any" placeholder="Enter amount"></div>
  <button class="btn" onclick="p24FamilySupport('once')">Send one-time support<small>The recipient responds, and your cash changes immediately.</small></button>
  <div class="p24-field" style="margin-top:14px"><label for="p24-support-monthly">Monthly allowance / support · ${p24Esc(C().cur)}</label><input id="p24-support-monthly" type="number" min="0" step="any" value="${Math.max(0,Math.round(selected.allowCurrency===S.country&&Number.isFinite(selected.allowLocal)?selected.allowLocal/12:(selected.allow||0)*rateNow()/12))}"></div>
  <div class="p24-filter-grid"><button class="btn" style="margin:0" onclick="p24FamilySupport('monthly')">Set monthly support<small>Charged yearly as 12 × the amount entered.</small></button><button class="btn" style="margin:0" onclick="p24FamilySupport('stop')">Stop recurring support<small>No future yearly deduction.</small></button></div>
  <p class="muted" style="font-size:.77rem;margin-top:10px">Support currently costs ${money(selected.allow||0)} per year for ${p24Esc(p24Relation(selected))}. The game uses yearly turns, so it settles the 12 monthly payments together.</p>
  ${S.country!==S.home&&parents().length?`<hr style="border-color:var(--line);margin:14px 0"><b>Need help from home?</b><p class="muted" style="font-size:.82rem;margin:5px 0 8px">Ask your parents for a transfer while living abroad. They can send less than requested or refuse if their own budget is tight.</p><div class="p24-field"><label for="abroad-parent-amount">Amount requested · USD equivalent</label><input id="abroad-parent-amount" type="number" min="1" placeholder="e.g. 200"></div><button class="btn" onclick="p24AskParentsAbroad()" ${(S.askAb===S.age||!parents().length)?'disabled':''}>Ask parents for help</button>`:''}
  </section>`;
}
function p24UpdateSupportPreview(){
  const id=document.getElementById('p24-support-member')?.value,m=(S.family||[]).find(x=>x.id===id&&x.alive!==false);const el=document.getElementById('p24-support-current');
  if(el&&m)el.innerHTML=`<span>Current monthly support</span><b>${money((Number(m.allow)||0)/12)}/month</b>`;
  const monthly=document.getElementById('p24-support-monthly');if(monthly&&m)monthly.value=Math.max(0,Math.round(m.allowCurrency===S.country&&Number.isFinite(m.allowLocal)?m.allowLocal/12:(Number(m.allow)||0)*rateNow()/12));
}
function p24FamilySupport(mode){
  if(!S||S.age<18)return hint('You can manage family support from age 18.');
  const id=document.getElementById('p24-support-member')?.value,m=(S.family||[]).find(x=>x.id===id&&x.alive!==false);
  if(!m)return hint('Choose a living family member first.');
  const rel=p24Relation(m);
  if(mode==='once'){
    const local=Number(document.getElementById('p24-support-once')?.value);
    if(!Number.isFinite(local)||local<=0)return hint('Enter an amount greater than zero.');
    const amount=p12LocalCurrencyInternal(local,S.country,gameYear());
    if(amount>S.wealth)return hint(`You need ${money(amount)} available to send this transfer.`);
    S.wealth-=amount;m.bond=clamp((Number(m.bond)||45)+(amount>=Math.max(1,(S.wealth+amount)*.05)?7:3));
    log(`You sent ${money(amount)} to ${rel}.`);fx({happiness:1,social:1});render();
    p24Popup(`${rel} replied`,`“Thank you for sending ${money(amount)}. This helps me with my expenses. I know you have responsibilities of your own, and I really appreciate you thinking of me.”`);return;
  }
  if(mode==='monthly'){
    const monthly=Number(document.getElementById('p24-support-monthly')?.value);
    if(!Number.isFinite(monthly)||monthly<0)return hint('Enter zero or a positive monthly amount.');
    m.allowMonthlyLocal=monthly;m.allowLocal=monthly*12;m.allowCurrency=S.country;m.allow=p12LocalCurrencyInternal(monthly*12,S.country,gameYear());m.allowPaidYear=null;
    if(monthly>0){m.bond=clamp((Number(m.bond)||45)+2);log(`You arranged monthly support of ${money(p12LocalCurrencyInternal(monthly,S.country,gameYear()))} for ${rel} (${money(m.allow)} per year).`);render();p24Popup(`${rel} is grateful`,`“Thank you for making this regular. Knowing I can count on ${money(p12LocalCurrencyInternal(monthly,S.country,gameYear()))} each month makes planning much easier.”`);}
    else{log(`You cancelled recurring support for ${rel}.`);render();p24Popup('Support cancelled',`Recurring financial support for ${rel} has been stopped. No future yearly payment will be taken.`);}return;
  }
  if(mode==='stop'){
    m.allowMonthlyLocal=0;m.allowLocal=0;m.allowCurrency=S.country;m.allow=0;m.allowPaidYear=null;
    log(`You cancelled recurring support for ${rel}.`);render();p24Popup('Support cancelled',`Recurring financial support for ${rel} has been stopped. No future yearly payment will be taken.`);
  }
}
function p24AskParentsAbroad(){askParentsAbroad();}

/* Keep the familiar profile / conversation controls, but remove the repeating
   Money for X cards, fixed allowance buttons and inactive care/help panels. */
const P24_viewFamilyBefore=viewFamily;
viewFamily=function(){
  let html=P24_viewFamilyBefore();
  html=p24StripSection(html,/^Money for /i);
  html=p24StripSection(html,/^Custom transfers and recurring support$/i);
  html=p24StripSection(html,/^Care for ageing parents$/i);
  html=p24StripSection(html,/^Home help$/i);
  html=p24StripSection(html,/^A family member needs help$/i);
  html=p24StripSection(html,/^Specific request from family$/i);
  html=html.replace(/<div class="acts acts3" style="margin-top:6px">[\s\S]*?onclick="famGive\([\s\S]*?<\/div>/g,'');
  html=html.replace(/<p class="muted" style="font-size:\.82rem;margin-top:8px">(?:Allowance|Regular support) \([\s\S]*?<\/div>/g,'');
  return html+p24FamilySupportCard();
};

/* Home help belongs with property / household costs, never inside Relationships.
   Prices are moved closer to a real recurring service budget and are kept in one place. */
p20HomeHelpCard=function(){
  if(!S||S.age<18)return '';
  const current=S.homeHelp||'none';
  const choices=[['none','No paid home help',0],['cleaner','Cleaner twice a month',p20LocalCost(1400)],['maid','Regular household helper',p20LocalCost(6500)]];
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">HOME</span><div><h3 style="margin-bottom:2px">Household help</h3><p class="muted" style="font-size:.8rem">Optional service for your own home. Costs vary by city and price level; renewing it competes with savings, rent and other bills.</p></div></div><p class="muted" style="font-size:.85rem;margin-bottom:8px">Current arrangement: <b>${current==='none'?'None':current==='cleaner'?'Cleaner twice a month':'Regular household helper'}</b></p>${choices.map(([id,label,cost])=>`<button class="btn" ${id!=='none'&&current===id?'disabled':''} ${id!=='none'&&S.wealth<cost?'disabled':''} onclick="p20SetHomeHelp('${id}',${cost})">${label}${cost?` · ${money(cost)}/year`:''}<small>${id==='none'?'Cancel after the prepaid period; no new annual bill.':id==='cleaner'?'Occasional cleaning; you still handle most chores.':'More frequent household assistance; a large recurring expense.'}</small></button>`).join('')}</section>`;
};
const P24_viewAssetsBefore=viewAssets;
viewAssets=function(){let html=P24_viewAssetsBefore();html=p24StripSection(html,/^Home help$/i);return html+p20HomeHelpCard();};

/* Parent care is now shown only when an actual Active Matter asks for a decision.
   Existing legacy plans remain manageable under Active Matters. */
p23CareCost=function(kind,parentCount=1){
  const base={nurse:6500,maid:4500,both:9800,caregiver:3200};
  return Math.round(p20LocalCost(base[kind]||6500)*Math.max(1,parentCount));
};
const P24_viewMattersBefore=viewMatters;
viewMatters=function(){
  let html=P24_viewMattersBefore();
  if(S&&(S.parentNeed||S.familyNeed)){const r=p14RequestState(),m=r&&(S.family||[]).find(x=>x.id===r.id);if(r&&m)html=html.replace(`${r.name} asks for help`,`${p24Esc(p24Relation(m))} asks for help`);}
  const legacy=Object.entries(S.elderCare||{}).filter(([id,kind])=>kind&&kind!=='none'&&(S.family||[]).some(m=>m.id===id&&m.alive!==false));
  if(legacy.length){html=html.replace(/<section class="card"><h3>Nothing needs a response right now<\/h3>[\s\S]*?<\/section>/,'');html+=SEC('Existing parent-care arrangements',PR('These are older saved care arrangements. They renew as annual expenses; stop them here when they are no longer needed.')+legacy.map(([id,kind])=>{const m=S.family.find(x=>x.id===id);return ROW(p24Relation(m),kind==='nurse'?'Visiting nurse':'Part-time caregiver')+B('Stop paid care','Future renewals will stop.','p20StopCare(\''+id+'\')');}).join(''));}
  return html;
};

/* Move informal overseas survival work into Career, where all work choices belong. */
Object.assign(P14_informalJobs,{
  cafe:{name:'Cash-paid café / barista shifts',base:13800,stress:4,desc:'Irregular café shifts and no guaranteed contract, benefits or visa sponsorship.'},
  waiter:{name:'Cash-paid waiter / restaurant shifts',base:15000,stress:5,desc:'Tips and hours vary; wage theft and unsafe working conditions are possible.'},
  valet:{name:'Cash-paid valet / parking attendant',base:14500,stress:5,desc:'Unstable shifts; accident and liability risks with no normal employee protections.'},
  delivery:{name:'Cash-paid delivery / errands',base:13200,stress:5,desc:'Unstable cash work with transport costs and accident risk.'}
});
function p24ImmigrationCard(){
  if(!S||S.country===S.home||!S.imm)return '';
  const im=S.imm,c=COUNTRIES[S.country]||COUNTRIES.usa,home=COUNTRIES[S.home]||COUNTRIES.egy;
  const label={student:'Student status',post:'Post-study job-search permission',visa:'Work sponsorship / visa decision',work:'Employer-sponsored work status',gc:'Permanent residence process',pr:'Permanent resident',citizen:'Citizen',asylum:'Protection claim / asylum status',irregular:'No valid immigration status'}[im.stage]||String(im.stage||'Status needs review');
  let permission='Check the exact conditions attached to your permit before accepting work or travelling.';
  let next='Keep copies of permits, contracts, payslips and renewal evidence.';
  if(im.stage==='student'){permission='Work may be limited by study status. Do not assume an unrestricted full-time role is permitted.';next='Keep enrolment and attendance valid, check the work-hour limit, and use permitted campus work if eligible.';}
  else if(im.stage==='post'){permission=`You have a job-search / post-study window of about ${Math.max(0,Number(im.left)||0)} year(s). A job offer may require a new sponsorship decision.`;next='Prioritise eligible jobs and check sponsorship before the current permission expires.';}
  else if(im.stage==='visa'){permission='A job offer or employer willingness does not by itself grant permission to work. Wait for the modeled immigration decision.';next='Keep the current status valid while the application is processing; do not count the offered salary before approval.';}
  else if(im.stage==='work'){permission=S.job?'Your current job may be tied to the sponsor. Losing it can put your status at risk.':'Your sponsored status needs eligible employment; you currently have no active job.';next='Keep the sponsoring employment and documents current. If the job ends, act before any grace period expires.';}
  else if(im.stage==='gc'){permission=`Residence processing remains open; estimated time left: ${Math.max(0,Number(im.left)||0)} year(s).`;next='Keep identity, residence and employment records and respond to official requests.';}
  else if(im.stage==='pr'){permission='Permanent residence usually gives broader work rights than a temporary visa, but it is not citizenship.';next=(Number(im.left)||0)<=0?'You may be eligible to apply for citizenship if you meet the destination’s requirements.':'Track the residence period and any language / application requirements.';}
  else if(im.stage==='asylum'){permission='The game records a protection status. Work and travel rights are not universal; check the permit and avoid assuming that re-entry is automatic.';next='Keep the protection decision, identity documents, renewal dates and any work authorisation together. Ask for qualified local advice before international travel.';}
  else if(im.stage==='citizen'){permission='You are recorded as a citizen in this simulation.';next='Your work rights no longer depend on employer sponsorship in this destination.';}
  else if(im.stage==='irregular'||S.undocumented){permission='You do not have valid status. Informal work does not legalise your stay and can carry exploitation, wage-theft and removal risks.';next='Consider qualified immigration advice, legal-aid services or voluntary return.';}
  const urgent=(['post','visa','work','gc','pr'].includes(im.stage)&&Number(im.left)>0)?` · ${Number(im.left)} year(s) recorded in the current process`:'';
  const actions=`<button class="btn" onclick="go('career')">Open Career & work options<small>Filter sponsor / no-sponsor jobs and check conditions before applying.</small></button>${im.stage==='student'?`<button class="btn" onclick="go('school')">Review study and campus-work options</button>`:''}${im.stage==='pr'&&Number(im.left)<=0?B('Review citizenship application',`Application fee estimate ${money(imp(1200))}`,'applyCitizen()',S.wealth<imp(1200)):''}<button class="btn" onclick="go('matters')">Review active decisions</button><button class="btn" onclick="goHome()">Return to ${p24Esc(home.n)}<small>Your overseas status and some employment / study rights may end.</small></button>`;
  return SEC('Immigration & work rights',ROW('Current status',label+urgent)+ROW('Destination',`${c.f||''} ${c.n}`)+ROW('Work permission',permission)+ROW('Next practical step',next)+PR('This is a simplified simulation, not legal advice. Work rights, grace periods and pathways vary by country and individual permit.')+actions);
}

/* Career board: experience-aware roles, sponsorship filters, employer monograms,
   benefits separated into readable fields and one overseas listings location. */
function p24CareerFilter(){
  const q=(document.getElementById('p24-career-search')?.value||'').toLowerCase().trim();
  const sponsor=document.getElementById('p24-career-sponsor')?.value||'all';
  const type=document.getElementById('p24-career-type')?.value||'all';
  let visible=0;
  document.querySelectorAll('.p24-job-card').forEach(el=>{
    const text=(el.dataset.search||'').toLowerCase(),sp=el.dataset.sponsor||'na',types=(el.dataset.type||'general').split(/\s+/);
    const ok=(!q||text.includes(q))&&(sponsor==='all'||sp===sponsor)&&(type==='all'||types.includes(type));
    el.style.display=ok?'':'none';if(ok)visible++;
  });
  const count=document.getElementById('p24-career-count');if(count)count.textContent=`${visible} opening(s) match these filters`;
}
p17CareerSearchBoard=function(){
  if(!S||S.age<18)return '';
  let list=(companyListFor(S.country)||[]).slice();const degree=S.degree,records=S.careerRecords||{},used=S.jobAppsAge===S.age?(S.jobAppsCount||0):0;
  const degMatch=p=>!!degree&&(p.p15DegreeMajor===degree||p.degree===degree||(p.degrees||[]).includes(degree)||(typeof p15RoleTrackRelevant==='function'&&p15RoleTrackRelevant(p,degree)));
  list=list.filter(p=>{const ex=typeof trackExperience==='function'?trackExperience(p.trackId):0;const lv=Math.max(0,Math.min(4,(records[p.trackId]?.level||0)));const title=p12RoleTitle(p,lv);const senior=/\b(senior|lead|manager|director|head|principal)\b/i.test(title);return ex>=Math.max(Number(p.minExp)||0,senior?3:0);});
  list.sort((a,b)=>Number(degMatch(b))-Number(degMatch(a)));
  const cards=list.map(p=>{
    const exp=typeof trackExperience==='function'?trackExperience(p.trackId):0;
    const level=Math.max(0,Math.min(4,(records[p.trackId]?.level||0)));
    let title=p12RoleTitle(p,level);
    const senior=/\b(senior|lead|manager|director|head|principal)\b/i.test(`${title} ${p.name||''}`);
    const minExp=Math.max(Number(p.minExp)||0,senior?3:0);
    const pay=jobSalaryForPost(p,level,S.country,gameYear());
    const degreeList=p.degrees&&p.degrees.length?p.degrees:p.degree?[p.degree]:[];
    const education=degreeList.length?degreeList.map(k=>MAJORS[k]?.name||k).join(' / '):'Relevant qualification or equivalent skills';
    const track=String(p.trackId||p.group||'general');
    const mode=String(p.remote||'On-site');
    const types=[];if(degMatch(p))types.push('field');if(minExp===0)types.push('entry');else types.push('experienced');if(/remote|hybrid/i.test(mode))types.push('remote');const type=types.join(' ');
    const sponsor=S.country===S.home?'na':p.sponsorship?'yes':'no';
    const requirements=p12Eligibility(p);
    let blockReason=requirements||'';
    if(!blockReason&&exp<minExp)blockReason=`This role normally requires ${minExp} relevant year(s); your current record is ${exp}.`;
    if(!blockReason&&S.country!==S.home&&(S.undocumented||S.imm?.stage==='irregular'))blockReason='No valid work authorisation is recorded. This formal job cannot be started without resolving status.';
    if(!blockReason&&S.country!==S.home&&S.imm?.stage==='student')blockReason='Student status may restrict full-time work. Check the permit; use approved campus / part-time options if eligible.';
    if(!blockReason&&S.country!==S.home&&S.asylumCase)blockReason='A pending protection claim does not automatically grant work permission in this simulation.';
    const brand=String(p.name||'Employer').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase().slice(0,3)||'CO';
    const benefit=benefitsSummary({medical:p.medical,social:p.social,bonus:p.bonus,leave:p.leave,remote:p.remote,hours:p.hours,contract:p.contract});
    const salary=money(pay);
    const payBasis=p.isRemoteUSD?'USD contract':'Local annual pay';
    const search=`${p.name} ${title} ${p.desc||''} ${education} ${track}`.toLowerCase();
    return `<details class="p24-job-card p17-posting" data-sponsor="${sponsor}" data-type="${type}" data-search="${p24Esc(search)}"><summary><span class="p24-brand">${p24Esc(brand)}</span><span style="vertical-align:middle"><b>${p24Esc(title)}</b><small style="display:block;color:var(--muted);margin-top:2px">${p24Esc(p.name||'Employer')} · ${p24Esc(mode)}</small></span>${sponsor==='yes'?'<span class="badge badge-mint" style="float:right">May sponsor</span>':sponsor==='no'?'<span class="badge badge-amber" style="float:right">No sponsorship</span>':''}</summary>
    ${PR(p.desc||'Role duties depend on the employer and team.')}
    <div class="p24-filter-grid"><div><span class="p24-muted-label">Estimated gross pay</span><div class="p24-value">${p.isRemoteUSD?usd(pay):salary}</div><span class="muted" style="font-size:.72rem">${payBasis} · annual estimate</span></div><div><span class="p24-muted-label">Experience</span><div class="p24-value">${minExp===0?'Entry level':`${minExp}+ years`}</div><span class="muted" style="font-size:.72rem">Relevant experience preferred</span></div></div>
    ${ROW('Education',education)}${ROW('Hours & contract',`${p.hours||40} hrs/week · ${p.contract||'Terms vary'}`)}${ROW('Healthcare',p.medical?'Employer medical plan listed':'No employer medical plan listed')}${ROW('Pension / social insurance',p.social?'Contribution or statutory plan listed':'No employer contribution listed')}${ROW('Paid annual leave',`${p.leave||14} days/year`)}${ROW('Target bonus',p.bonus?`${Math.round(p.bonus*100)}% · not guaranteed`:'Not listed')}${ROW('Work arrangement',mode)}${S.country!==S.home?ROW('Sponsorship',p.sponsorship?'Employer may consider sponsorship; government approval is separate':'This vacancy does not offer sponsorship'):''}${blockReason?PR(`Not currently available: ${blockReason}`):''}<button class="btn" onclick="applyCompany('${p.id}')" ${blockReason||used>=4?'disabled':''}>${blockReason?'Requirements not met':used>=4?'Application limit reached':`Apply to ${p24Esc(p.name||'employer')}`}</button></details>`;
  });
  const careerCards=cards.join('');
  const filter=SEC('Find work',PR(`Employers shown here are generated for ${C().n}; these are fictional game vacancies, not live listings. You have ${Math.max(0,4-used)} application(s) left this year. Senior/lead titles require a relevant track record, and company sponsorship is not a visa guarantee.`)+`<div class="p24-filter-grid"><div><label for="p24-career-search">Search by role / employer</label><input id="p24-career-search" type="search" placeholder="e.g. accountant, analyst" oninput="p24CareerFilter()"></div><div><label for="p24-career-sponsor">Sponsorship</label><select id="p24-career-sponsor" onchange="p24CareerFilter()"><option value="all">All vacancies</option><option value="yes">May sponsor</option><option value="no">No sponsorship</option><option value="na">Not applicable / home country</option></select></div><div><label for="p24-career-type">Role type</label><select id="p24-career-type" onchange="p24CareerFilter()"><option value="all">All role types</option><option value="field">Related to my degree</option><option value="entry">Entry-level</option><option value="experienced">Experienced / senior</option><option value="remote">Remote / hybrid</option></select></div><div style="display:flex;align-items:end"><span id="p24-career-count" class="muted" style="font-size:.8rem">${list.length} openings</span></div></div>${careerCards}`);
  return filter;
};
const P24_viewCareerBeforeFilters=viewCareer;
viewCareer=function(){
  let html=P24_viewCareerBeforeFilters();
  html=html.replace(/<section class="card"><h3>Job search · [\s\S]*?<\/section>/,'');
  html=p24StripSection(html,/^Local job postings/i);
  if(S&&(S.undocumented||S.imm?.stage==='irregular')&&S.country!==S.home)html+=p14InformalWorkSection();
  return html;
};

/* The host country's employer board is deliberately absent from World now. */
const P24_viewWorldBeforeFinal=viewWorld;
viewWorld=function(){
  let html=P24_viewWorldBeforeFinal();
  html=p24StripSection(html,/^Current country$/i);
  html=p24StripSection(html,/^Immigration status$/i);

  html=p24StripSection(html,/^Jobs in /i);
  html=p24StripSection(html,/^Precarious survival work/i);
  html=p24StripSection(html,/^Ways to reduce harm$/i);
  html=p24StripSection(html,/^Financial support from home$/i);
  html=html.replace(/<button class="btn"[^>]*onclick="askParentsAbroad\(\)">[\s\S]*?<\/button>/g,'');
  const country=COUNTRIES[S.country]||COUNTRIES.usa,home=COUNTRIES[S.home]||COUNTRIES.egy;
  const loc=`<section class="card"><div class="p24-topline"><span class="p24-brand">${p24Esc(country.f||'LOC')}</span><div><h3 style="margin-bottom:2px">Current location</h3><p class="muted" style="font-size:.82rem">${p24Esc(country.n)}${S.country!==S.home?` · Home country: ${p24Esc(home.n)}`:''}</p></div></div><p class="muted" style="font-size:.82rem">Local prices, available employers and immigration options depend on where you live. Figures are estimates.</p></section>`;
  return loc+p24ImmigrationCard()+html;
};


/* Compact trip planner: essential choices first, detail under a disclosure.
   Destination lists are grouped and the long currency catalogue is not printed. */
function p24TripDailyDefault(country){
  return ({egy:1000,usa:100,can:110,gbr:70,deu:65,fra:65,nld:65,ita:60,uae:180,sau:160,aus:105,nzl:110,tur:1800,ind:2800,pak:6000,nga:45000,bra:300,jpn:8500,kor:65000,sgp:100})[country]||70;
}
const P24_tripQuoteBeforeSeason=p12TripQuote;
p12TripQuote=function(){
  const q=P24_tripQuoteBeforeSeason();if(!q)return q;
  const season=document.getElementById('p12-trip-season')?.value||q.season||'shoulder';
  /* Earlier travel logic already prices peak / off-peak dates by destination. Don't
     multiply those seasonal price adjustments a second time. */
  q.total=(Number(q.airfare)||0)+(Number(q.transport)||0)+(Number(q.hotel)||0)+(Number(q.spend)||0)+(Number(q.activities)||0)+(Number(q.shopping)||0)+(Number(q.gifts)||0)+(Number(q.destinationTransport)||0);
  q.season=season;
  return q;
};
p12RefreshTripQuote=function(){
  const q=p12TripQuote(),el=document.getElementById('p12-trip-estimate');if(!el||!q)return;
  const destCurrency=(COUNTRIES[q.d.country]||C()).cur;
  const stayName=q.lodgingLabel||'Hotel';
  const seasonName={summer:'Summer / peak season',winter:'Winter / off-peak',shoulder:'Shoulder season',peak:'Peak season',offpeak:'Off-peak'}[q.season]||'Shoulder season';
  const people=`${q.days} day(s) · ${q.people} traveller(s)`;
  el.innerHTML=`<div class="p24-topline"><span class="p24-brand">EST</span><div><span class="p24-muted-label">Estimated total trip budget</span><div class="p24-value">${money(q.total)}</div><span class="muted" style="font-size:.72rem">Planning estimate · not live fares</span></div></div><div class="p24-filter-grid"><div><span class="p24-muted-label">${q.international?'Return airfare · '+q.classKey:'Intercity / local transport'}</span><div class="p24-value">${money(q.airfare||q.transport)}</div></div><div><span class="p24-muted-label">Accommodation · ${p24Esc(stayName)}</span><div class="p24-value">${money(q.hotel)}</div></div><div><span class="p24-muted-label">Food / meals</span><b>${money(q.spend)}</b></div><div><span class="p24-muted-label">Activities</span><b>${money(q.activities)}</b></div><div><span class="p24-muted-label">Shopping / clothes</span><b>${money(q.shopping||0)}</b></div><div><span class="p24-muted-label">Gift / family contribution</span><b>${money(q.gifts||0)}</b></div></div>${q.international?ROW('Transport at destination',money(q.destinationTransport||0)):ROW('Transport while there',money(q.destinationTransport||0))}${ROW('Trip length',people)}${ROW('Annual leave requested',`${q.leaveDays==null?q.days:q.leaveDays} day(s)`)}${ROW('Travel season',seasonName)}${PR(`Food, local transport and gifts are entered in ${destCurrency}; totals are converted to your current game currency. Staying with a host may remove lodging cost. Return fares and accommodation are estimates, not live bookable prices. A manager can refuse leave, and travelling without valid status may create re-entry problems.`)}`;
};
p12RenderTravel=function(){
  const allDests=p12DestinationOptions(),seenDestinations=new Set();
  const dests=allDests.filter(d=>{if(d.custom||d.id==='trip-custom')return true;const key=`${String(d.name||'').trim().toLowerCase()}|${d.country}`;if(seenDestinations.has(key))return false;seenDestinations.add(key);return true;});
  if(!dests.length)return SEC('Plan a trip',PR('No destinations are available at the moment.'));
  const current=dests.filter(d=>d.local||d.country===S.country),international=dests.filter(d=>!d.local&&d.country!==S.country);
  const option=d=>`<option value="${p24Esc(d.id)}">${p24Esc(d.name)}</option>`;
  const options=(current.length?`<optgroup label="Within ${p24Esc(C().n)}">${current.map(option).join('')}</optgroup>`:'')+(international.length?`<optgroup label="International destinations">${international.map(option).join('')}</optgroup>`:'');
  const countryOptions=Object.entries(COUNTRIES).map(([k,c])=>`<option value="${k}" ${k===S.country?'selected':''}>${p24Esc(c.n)} (${p24Esc(c.cur)})</option>`).join('');
  const first=current[0]||dests[0],firstCountry=first?.country||S.country;
  const defaultFood=typeof p18MoneyDefaultFood==='function'?p18MoneyDefaultFood(firstCountry):p24TripDailyDefault(firstCountry);
  const defaultTransport=typeof p18MoneyDefaultTransport==='function'?p18MoneyDefaultTransport(firstCountry):0;
  return SEC('Trips & family time',PR('Choose the destination and length first. The estimate updates automatically. Travel style, lodging, gifts and leave settings are grouped under Advanced options.')+`
    <div class="p24-trip-main"><div class="p24-field wide"><label for="p12-trip-dest">Destination</label><select id="p12-trip-dest" onchange="p24TripDestinationChanged()">${options}</select></div><div class="p24-field"><label for="p12-trip-with">Who is travelling?</label><select id="p12-trip-with" onchange="p12RefreshTripQuote()"><option value="solo">Just me</option><option value="partner">Me and my partner</option><option value="friend">Me and a friend</option><option value="family">Family trip</option></select></div><div class="p24-field"><label for="p12-trip-days">Days away</label><input id="p12-trip-days" type="number" min="1" max="30" value="4" oninput="p12RefreshTripQuote()"></div></div>
    <details style="margin-top:12px"><summary>Advanced trip options</summary><div class="p24-trip-main" style="margin-top:10px">
      <div class="p24-field"><label for="p12-trip-season">Travel season</label><select id="p12-trip-season" onchange="p12RefreshTripQuote()"><option value="shoulder">Shoulder season</option><option value="summer">Summer / peak season</option><option value="winter">Winter / off-peak where applicable</option></select></div>
      <div class="p24-field"><label for="p12-trip-class">Return airfare class</label><select id="p12-trip-class" onchange="p12RefreshTripQuote()"><option value="economy">Economy</option><option value="premium">Premium economy</option><option value="business">Business</option></select></div>
      <div class="p24-field"><label for="p12-trip-hotel">Hotel quality</label><select id="p12-trip-hotel" onchange="p12RefreshTripQuote()"><option value="budget">Budget</option><option value="comfort" selected>Comfort / mid-range</option><option value="luxury">Luxury</option></select></div>
      <div class="p24-field"><label for="p17-trip-stay">Where will you stay?</label><select id="p17-trip-stay" onchange="p12RefreshTripQuote()"><option value="hotel">Hotel</option><option value="airbnb">Airbnb / serviced apartment</option><option value="motel">Motel / hostel / budget guesthouse</option><option value="parents">Parents’ home (family visit only)</option><option value="sibling">Brother’s / sister’s home (family visit only)</option><option value="friend">Friend’s home / staying with a host</option></select></div>
      <div class="p24-field"><label for="p12-trip-activity">Activities & dining</label><select id="p12-trip-activity" onchange="p12RefreshTripQuote()"><option value="budget">Low-cost activities</option><option value="normal" selected>Restaurants and activities</option><option value="luxury">Luxury dining / excursions</option></select></div>
      <div class="p24-field"><label for="p12-trip-transport">Travel to destination</label><select id="p12-trip-transport" onchange="p12RefreshTripQuote()"><option value="public">Public transport / bus</option><option value="train">Train / intercity coach</option><option value="car">Drive / private ride</option></select></div>
      <div class="p24-field"><label for="p12-trip-spend">Daily food budget (${p24Esc((COUNTRIES[firstCountry]||C()).cur)})</label><input id="p12-trip-spend" type="number" min="0" value="${defaultFood}" oninput="this.dataset.userEdited='1';p12RefreshTripQuote()"></div>
      <div class="p24-field"><label for="p17-trip-shopping">Daily shopping / souvenirs (${p24Esc((COUNTRIES[firstCountry]||C()).cur)})</label><input id="p17-trip-shopping" type="number" min="0" value="0" oninput="this.dataset.userEdited='1';p12RefreshTripQuote()"></div>
      <div class="p24-field"><label for="p18-trip-local-transport">Daily local transport (${p24Esc((COUNTRIES[firstCountry]||C()).cur)})</label><input id="p18-trip-local-transport" type="number" min="0" value="${defaultTransport}" oninput="this.dataset.userEdited='1';p12RefreshTripQuote()"></div>
      <div class="p24-field"><label for="p17-trip-night">Custom lodging per night</label><input id="p17-trip-night" type="number" min="0" value="0" oninput="p12RefreshTripQuote()"><small class="muted">0 = estimate, or free host stay.</small></div>
      <div class="p24-field"><label for="p17-trip-leave-days">Days off requested</label><input id="p17-trip-leave-days" type="number" min="0" max="60" value="4" oninput="p12RefreshTripQuote()"></div>
      <div class="p24-field"><label for="p12-trip-leave">Leave / wage treatment</label><select id="p12-trip-leave" onchange="p12RefreshTripQuote()"><option value="paid">Request paid annual leave</option><option value="unpaid">Request unpaid leave / lost wages</option></select></div>
      <div class="p24-field"><label for="p17-trip-gift-type">Gift to bring</label><select id="p17-trip-gift-type" onchange="p12RefreshTripQuote()"><option value="none">No gift</option><option value="sweets">Sweets / groceries / souvenirs</option><option value="clothes">Clothes / household gift</option><option value="medicine">Medicine / health items</option><option value="electronics">Electronics gift</option><option value="cash">Cash gift / contribution</option><option value="custom">Custom gift</option></select></div>
      <div class="p24-field"><label for="p17-trip-gift-recipient">Gift recipient</label><select id="p17-trip-gift-recipient"><option value="family">Family in general</option><option value="mother">Mother</option><option value="father">Father</option><option value="sibling">Brother / sister</option><option value="friend">Friend / host</option><option value="partner">Partner</option></select></div>
      <div class="p24-field"><label for="p17-trip-gifts">One-time gift budget (${p24Esc((COUNTRIES[firstCountry]||C()).cur)})</label><input id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()"></div>
      <div class="p24-field"><label for="p18-trip-gift-details">Gift details (optional)</label><input id="p18-trip-gift-details" type="text" maxlength="70" placeholder="e.g. groceries for my parents" oninput="p12RefreshTripQuote()"></div>
    </div><details style="margin-top:8px"><summary>Custom city / country</summary><div class="p24-field" style="margin-top:10px"><label for="p18-trip-city">City / destination name</label><input id="p18-trip-city" type="text" maxlength="70" placeholder="e.g. Valencia, Madrid, Kyoto" oninput="p12RefreshTripQuote()"></div><div class="p24-field"><label for="p18-trip-country">Destination country</label><select id="p18-trip-country" onchange="p18TripDestinationChanged()">${countryOptions}</select></div><p class="muted">Custom routes use an estimated country-pair fare, not live bookable fares.</p></details></details>
    <div id="p12-trip-estimate" class="card" style="margin-top:12px"><span class="p24-muted-label">Estimated trip budget</span><p class="muted">Calculating estimate…</p></div><div class="p24-filter-grid"><button class="btn" style="margin:0" onclick="p12RefreshTripQuote()">Refresh estimate</button><button class="btn" style="margin:0" onclick="p12BookTrip('${S.funeralNotice?'funeral':'holiday'}')">${S.funeralNotice?'Review funeral trip':'Request leave & book'}</button></div>${S.job?PR(`Current employer: ${S.job.company||'Employer'} · ${Math.floor(S.vacationDays||0)} paid-leave day(s) available. Your manager may refuse leave.`):PR(S.mast?'You are studying; plan around exams and student-status conditions.':'You have no current job, so there is no employer leave approval or salary loss.')}`);
};
const P24_renderBeforeTripEstimate=render;
render=function(...args){P24_renderBeforeTripEstimate(...args);if(activeTab==='world'&&document.getElementById('p12-trip-estimate'))p12RefreshTripQuote();};

function p24TripDestinationChanged(){
  if(typeof p18TripDestinationChanged==='function')p18TripDestinationChanged();else p12RefreshTripQuote();
  const country=typeof p18DestinationCountry==='function'?p18DestinationCountry():(p12DestinationOptions().find(d=>d.id===document.getElementById('p12-trip-dest')?.value)?.country||S.country);
  const currency=(COUNTRIES[country]||C()).cur;
  const labels={'p12-trip-spend':`Daily food budget (${currency})`,'p17-trip-shopping':`Daily shopping / souvenirs (${currency})`,'p18-trip-local-transport':`Daily local transport (${currency})`,'p17-trip-gifts':`One-time gift budget (${currency})`};
  Object.entries(labels).forEach(([id,label])=>{const input=document.getElementById(id),lab=document.querySelector(`label[for="${id}"]`);if(input&&lab)lab.textContent=label;});
}

/* Keep family requests in Active Matters as the single response queue and show
   a true response popup instead of leaving the outcome as faded Life text. */
p14ShowParentRequestModal=function(){const el=document.getElementById('p14-parent-request-modal');if(el)el.remove();if(S&&activeTab!=='matters'){activeTab='matters';render();}};
const P24_respondFamilyBeforePopup=p14RespondFamilyNeed;
p14RespondFamilyNeed=function(yes){
  const need=S&&S.familyNeed,m=need&&(S.family||[]).find(x=>x.id===need.id),rel=m?p24Relation(m):'Your family';
  const before=S&&S.logRows&&S.logRows[0]?S.logRows[0].t:'';
  P24_respondFamilyBeforePopup(yes);
  const after=S&&S.logRows&&S.logRows[0]?S.logRows[0].t:'';
  if(after&&after!==before)p24Popup(`${rel} · request answered`,after.replace(m&&m.name?m.name:'__not_a_name__',rel));
};
const P24_answerParentNeedBeforePopup=p12AnswerParentNeed;
p12AnswerParentNeed=function(yes){
  const m=S&&S.parentNeed&&(S.family||[]).find(x=>x.id===S.parentNeed.id),rel=m?p24Relation(m):'Your family';
  P24_answerParentNeedBeforePopup(yes);
  const row=S&&S.logRows&&S.logRows[0];if(row)p24Popup(yes?`${rel} · thank you for helping`:`${rel} was not helped this time`,row.t.replace(m&&m.name?m.name:'__not_a_name__',rel));
};
const P24_respondSpecificBeforePopup=p12RespondSpecific;
p12RespondSpecific=function(yes){
  const n=S&&S.familyNeed,m=n&&(S.family||[]).find(x=>x.id===n.id),rel=m?p24Relation(m):'Your family';
  P24_respondSpecificBeforePopup(yes);
  const row=S&&S.logRows&&S.logRows[0];if(row)p24Popup(yes?`${rel} · support received`:`${rel} request declined`,row.t.replace(m&&m.name?m.name:'__not_a_name__',rel));
};
const P24_askParentBeforePopup=p16AskParent;
p16AskParent=function(){
  const tab=activeTab,old=(S.notices||[])[0];P24_askParentBeforePopup();
  if(S){activeTab=tab;render();const n=(S.notices||[])[0];if(n&&n!==old)p24Popup(n.title,n.text);}
};
const P24_askAbroadBeforePopup=askParentsAbroad;
askParentsAbroad=function(){
  const tab=activeTab,old=(S.notices||[])[0];P24_askAbroadBeforePopup();
  if(S){activeTab=tab;render();const n=(S.notices||[])[0];if(n&&n!==old)p24Popup(n.title,n.text);}
};

/* Apply recurring support to every selected family member. The old yearly routine
   already handles minor children and parents aged 60+, so settle other relatives here. */
const P24_familyYearBeforeGeneralSupport=familyYear;
familyYear=function(...args){
  const year=gameYear();
  const extra=(S&&S.family||[]).filter(m=>m&&m.alive!==false&&Number(m.allow)>0&&!(m.role==='Child'&&m.age<18)&&!(['Mother','Father'].includes(m.role)&&m.age>=60));
  /* Preserve the numeric child-cost ledger returned by the existing family-year chain.
     Returning nothing here made bill.children undefined, which poisoned yearly expenses
     and cash with NaN on the very first age-up. */
  const childCosts=P24_familyYearBeforeGeneralSupport(...args);
  if(!S)return childCosts;
  for(const m of extra){
    const amount=Math.max(0,Number(m.allow)||0);if(!amount||m.allowPaidYear===year)continue;
    S.wealth-=amount;S.expenses=(Number.isFinite(S.expenses)?S.expenses:0)+amount;S.bill=S.bill||{};S.bill.familySupport=(S.bill.familySupport||0)+amount;m.allowPaidYear=year;
    m.bond=clamp((Number.isFinite(Number(m.bond))?Number(m.bond):45)+2);
    log(`Annual financial support paid to ${p24Relation(m)}: ${money(amount)}. Your remaining budget is lower by this amount.`);
    if(S.yearPopup)S.yearPopup.expenses=(S.yearPopup.expenses||0)+amount;
  }
  save();
  return Number.isFinite(childCosts)?childCosts:0;
};

/* Match the advertised home-help price to the recurring annual bill. The legacy
   wrapper already charges the old baseline, so add only the price difference. */
const P24_ageUpBeforeHomeHelpPrice=p20SetHomeHelp;
p20SetHomeHelp=function(id,cost){
  if(!S||S.age<18)return hint('Paid household help is available from age 18.');
  const prior=S.homeHelp||'none';
  if(id==='none')return P24_ageUpBeforeHomeHelpPrice(id,0);
  if(prior===id)return hint('This arrangement is already active.');
  return P24_ageUpBeforeHomeHelpPrice(id,cost);
};
const P24_ageUpBeforeHelpBilling=ageUp;
ageUp=function(...args){
  const age0=S&&S.age,help=S&&S.homeHelp;
  P24_ageUpBeforeHelpBilling(...args);
  if(!S||S.age===age0)return;
  const legacy=help==='cleaner'?p20LocalCost(700):help==='maid'?p20LocalCost(2200):0;
  const actual=help==='cleaner'?p20LocalCost(1400):help==='maid'?p20LocalCost(6500):0;
  const extra=Math.max(0,actual-legacy);
  if(extra>0){S.wealth-=extra;S.expenses=(S.expenses||0)+extra;S.bill=S.bill||{};S.bill.homeHelp=(S.bill.homeHelp||0)+extra;log(`Annual household-help cost adjustment: ${money(extra)}. Total yearly cost now matches the selected service price.`);if(S.wealth<0)fx({happiness:-1});save();}
};

/* City selection no longer redirects the player to Life or displays unrelated
   currency / mortgage stats. */
p20CityPanel=function(){
  const opts=p20CityOptions();if(!S.cityId||!opts.some(x=>x[1]===S.cityId)){const best=opts[0];S.cityId=best[1];S.cityName=best[0];S.cityCostMultiplier=best[2];}
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">CITY</span><div><h3 style="margin-bottom:2px">City / local market</h3><p class="muted" style="font-size:.8rem">Changes local rent, properties and selected services. Job salaries remain country-based estimates.</p></div></div><select id="p20-city" onchange="p24SetCity(this.value)" style="width:100%">${opts.map(x=>`<option value="${x[1]}" ${x[1]===S.cityId?'selected':''}>${p24Esc(x[0])}</option>`).join('')}</select></section>`;
};
function p24SetCity(id){
  const active=activeTab,x=p20CityOptions().find(a=>a[1]===id);if(!x)return;
  S.cityId=id;S.cityName=x[0];S.cityCostMultiplier=x[2];S.propertyMarket=[];
  log(`You chose to live in ${x[0]}. Local rent, property listings and selected service costs now use this city level.`);
  activeTab=active;render();p24Popup('City updated',`${x[0]} is now your selected local market. Rent, property listings and selected household / care services use this cost level; most wages remain country-based.`);
}

/* ================= PHASE 25 — TAB LOCK / RENDER REDIRECT FIX =================
   A prior UI cleanup redirected every render to Active Matters, even when no family
   request existed. This made the Education tab unreachable and trapped the player at
   age 6. Only route to Active Matters when a real request is awaiting an answer.
   If there is no live request, leave navigation completely alone.
*/
p14ShowParentRequestModal = function(){
  const el = document.getElementById('p14-parent-request-modal');
  const needsResponse = !!(S && (S.parentNeed || S.familyNeed));
  if (!needsResponse) {
    if (el) el.remove();
    return;
  }
  /* Active Matters renders family requests inline, so no blocking overlay is needed. */
  if (el) el.remove();
  if (activeTab !== 'matters') {
    activeTab = 'matters';
    render();
  }
};

/* Existing saves may already have JSON nulls from the old NaN ledger bug. Repair the
   financial state during load so a previously affected save does not stay corrupted. */
const P25_migrateBeforeFinancialRepair = migrate;
migrate = function(o){
  const r = P25_migrateBeforeFinancialRepair(o);
  if (!r) return r;
  let repaired = false;
  for (const key of ['wealth','income','expenses','loan','nest','savings','invest','pension','lastSalary']) {
    const value = r[key];
    if (value == null || !Number.isFinite(Number(value))) {
      r[key] = 0;
      repaired = true;
    } else if (typeof value !== 'number') r[key] = Number(value);
  }
  if (!r.bill || typeof r.bill !== 'object' || Array.isArray(r.bill)) { r.bill = {}; repaired = true; }
  for (const key of Object.keys(r.bill)) {
    const value = r.bill[key];
    if (value == null || !Number.isFinite(Number(value))) { r.bill[key] = 0; repaired = true; }
    else if (typeof value !== 'number') r.bill[key] = Number(value);
  }
  if (r.yearPopup && typeof r.yearPopup === 'object') {
    for (const key of ['income','expenses']) {
      if (r.yearPopup[key] == null || !Number.isFinite(Number(r.yearPopup[key]))) { r.yearPopup[key] = 0; repaired = true; }
      else r.yearPopup[key] = Number(r.yearPopup[key]);
    }
  }
  if (repaired && Array.isArray(r.logRows)) {
    r.logRows.unshift({age:Number(r.age)||6,t:'Save repair: repaired invalid financial ledger values from an older version. Any balance that had already become invalid was reset to zero because its original value could not be recovered.'});
    r.logRows = r.logRows.slice(0,200);
  }
  return r;
};

buildStart();
