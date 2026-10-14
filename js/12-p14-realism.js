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


