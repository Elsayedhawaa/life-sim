/* ==================== P14 REALISM PATCH ==================== */

// 1. GLOBAL DECLARATION AT VERY TOP (Guarantees definition even if rest of file has runtime errors)
var P14_informalJobs = window.P14_informalJobs || {
  dish:  { name: 'Dishwashing / kitchen porter', base: 14500, stress: 4, desc: 'Low-paid shifts, often unstable hours and limited protection.' },
  clean: { name: 'Cleaning / warehouse shifts', base: 15500, stress: 4, desc: 'Physically tiring shifts; pay and hours can vary.' },
  build: { name: 'Construction labourer', base: 18500, stress: 6, desc: 'Higher possible cash earnings but physical injury and wage-theft risks.' }
};

// 2. Safe function overrides wrapped in try/catch to prevent const re-assignment crashes
try { checkDeath = function(){ if(S) S.dead=false; }; } catch(e){}

try {
  if (typeof migrate === 'function') {
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
  }
} catch(e){}

try {
  familyYear = function(){
    if(!S) return 0;
    (S.family||[]).forEach(m=>{ if(!m) return; m.alive=true; m.age=(Number(m.age)||0)+1; m.done=false; m.bond=clamp((m.bond||0)-2); });
    if(S.age>=18 && S.housing==='parents' && typeof parents === 'function' && !parents().length){ S.housing=null; log('You no longer have access to the family home. Choose housing in Real Estate.'); }
    const count=(S.family||[]).filter(k=>k.role==='Child'&&k.alive&&k.age<18).length;
    const y=gameYear(), country=S.country||'usa';
    const perChild=country==='egy' ? localCurrencyInternal(50000*p14EgyptPriceIndex(y),'egy',y) : localCurrencyInternal(((COUNTRIES[country]||COUNTRIES.usa).childCostLocal||8000)*(typeof prOf==='function'?prOf(y,S):1),country,y);
    return count*perChild;
  };
} catch(e){}

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

try {
  const P14_egyptWageIndexBeforeForecast = typeof egyptWageIndex === 'function' ? egyptWageIndex : function(y){ return 1; };
  egyptWageIndex = function(year){
    const y=Number(year)||2007;
    if(y<=2026) return P14_egyptWageIndexBeforeForecast(y);
    return Math.pow(1.075,y-2026);
  };
} catch(e){}

try {
  p12ScaleForYear = function(country,y){
    if(country==='egy') return p14EgyptPriceIndex(y)*(rateForCountry('egy',2026)/Math.max(.0001,rateForCountry('egy',y)));
    return typeof prOf==='function'?prOf(y,S):(S&&S.prEra)||1;
  };
} catch(e){}

if (typeof COUNTRIES !== 'undefined' && COUNTRIES.egy) {
  COUNTRIES.egy.hist = y => {
    const yr=Number(y)||2007;
    if(P14_EGP_USD_HISTORY[yr]!=null) return P14_EGP_USD_HISTORY[yr];
    if(yr<2007) return 5.635*Math.pow(1.025,2007-yr);
    return P14_EGP_USD_HISTORY[2026]*Math.pow(1.055,yr-2026);
  };
  COUNTRIES.egy.rate=52.70;
}

try {
  rateForCountry = function(country,year){
    const c=(typeof COUNTRIES !== 'undefined' && COUNTRIES[country]) || (typeof COUNTRIES !== 'undefined' ? COUNTRIES.usa : {rate:1});
    const y=Number(year)||gameYear();
    if(country==='egy' && c.hist) return c.hist(y);
    if(c.hist&&y<2026) return c.hist(y);
    return c.rate||1;
  };
} catch(e){}

try {
  rateNow = function(){
    const c=typeof C==='function'?C():{cur:'$'};
    const y=gameYear();
    return rateForCountry(S&&S.country||'usa',y)*((S&&S.cf&&S.cf.mul)||1);
  };
} catch(e){}

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

try {
  p12GenerateFamilyNeed=function(){
    if(!S||S.age<18||S.p12NeedAge===S.age||S.familyNeed||S.parentNeed)return;
    if (typeof parents !== 'function') return;
    const ps=parents(); if(!ps.length)return;
    S.p12NeedAge=S.age;
    const senior=ps.filter(m=>m.age>=55).length, chance=Math.min(.27,(S.famWealth===0?.17:S.famWealth===1?.11:.06)+senior*.035);
    if(Math.random()>chance)return;
    const m=pick(ps);
    const reason=pick(m.age>=60?['monthly groceries','electricity and gas bills','blood tests and medication','hospital treatment','urgent plumbing repair','rent and household bills']:['monthly groceries','electricity and gas bills','helping a younger sibling with school fees','a hospital or clinic bill','medication','a family wedding expense','urgent home repair','temporary loss of income']);
    const local=p14SuggestedFamilyNeed(reason,S.famWealth,gameYear(),S.home||'egy');
    S.parentNeed={id:m.id,reason,amountHomeLocal:local,amountHomeCurrency:(COUNTRIES[S.home||'egy']||COUNTRIES.egy).cur,amountInternal:localCurrencyInternal(local,S.home||'egy',gameYear()),year:gameYear()};
    log(`${m.name} (your ${m.role.toLowerCase()}) asked for help with ${reason}.`);
  };
} catch(e){}

function p14RespondFamilyNeed(send){
  const r=p14RequestState(); if(!r)return;
  if(send){
    const value=Number($('p14-family-request-amount')?.value);
    if(!Number.isFinite(value)||value<0)return hint('Enter a valid amount of zero or more.');
    const transfer=localCurrencyInternal(value,S.country,gameYear());
    const fee=S.country!==(S.home||S.country)?transfer*.025:0;
    const total=transfer+fee;
    if(total>S.wealth)return hint(`You cannot afford ${money(total)}. Choose a smaller amount or decline.`);
    S.wealth-=total;S.expenses=(S.expenses||0)+total;S.bill=S.bill||{};S.bill.familySupport=(S.bill.familySupport||0)+total;
    if(r.m){
      const ratio=r.amountInternal>0?transfer/r.amountInternal:0;
      r.m.bond=clamp(r.m.bond+(ratio>=.9?9:ratio>=.35?5:ratio>0?2:-3));
    }
    if(transfer>0){if(typeof fx==='function')fx({happiness:Math.min(3,Math.round(transfer/Math.max(1,r.amountInternal)*2))});log(`You sent ${money(transfer)} to ${r.name} for ${r.reason}.`);}
    else {if(typeof fx==='function')fx({happiness:-2});log(`You offered no money to ${r.name} for ${r.reason}.`);}
  } else {
    if(r.m)r.m.bond=clamp(r.m.bond-7);if(typeof fx==='function')fx({happiness:-3});log(`You declined ${r.name}'s request for ${r.reason}.`);
  }
  if(r.kind==='parent')S.parentNeed=null;else S.familyNeed=null;
  const el=document.getElementById('p14-parent-request-modal');if(el)el.remove();if(typeof hint==='function')hint();if(typeof render==='function')render();
}

function p14ShowParentRequestModal(){
  if(!S||S.pending||S.yearPopup)return;
  const r=p14RequestState(),existing=document.getElementById('p14-parent-request-modal');
  if(!r){if(existing)existing.remove();return;}
  let el=existing;
  if(!el){el=document.createElement('div');el.id='p14-parent-request-modal';el.style.cssText='position:fixed;inset:0;z-index:10001;background:rgba(2,2,10,.82);display:flex;align-items:center;justify-content:center;padding:16px;';document.body.appendChild(el);}
  const cur=typeof C==='function'?C().cur:'$', value=Math.round(r.amountPlayer);
  el.innerHTML=`<div style="background:#14141f;color:#e8e8f2;border:1px solid #51416e;border-radius:16px;padding:20px;max-width:480px;width:100%;max-height:86vh;overflow:auto;box-shadow:0 18px 60px #0009"><div style="font-size:.75rem;letter-spacing:.08em;color:#22d3ee;font-weight:700">FAMILY MESSAGE · ${gameYear()}</div><h2 style="font-size:1.45rem;margin:8px 0">${r.name} asks for your help</h2><p style="line-height:1.5;margin-bottom:10px">They need help with <b>${r.reason}</b>. The requested amount is about <b>${money(r.amountInternal)}</b> in your current currency.</p><label for="p14-family-request-amount" class="muted">Amount you choose to send (${cur})</label><input id="p14-family-request-amount" type="number" min="0" value="${value}" style="width:100%;margin:8px 0 12px;padding:12px;background:#0b0b12;color:#e8e8f2;border:1px solid #35354b;border-radius:10px;font:inherit"><div class="acts"><button class="btn" style="text-align:center;background:#8b5cf6" onclick="p14RespondFamilyNeed(true)">Send chosen amount</button><button class="btn" style="text-align:center" onclick="p14RespondFamilyNeed(false)">Decline for now</button></div></div>`;
}

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
  return 24000;
}

function p14EgyptUtilityCost(input){return p14EgyptLocalToInternal(p14EgyptUtilityLocal2026(input));}

function p14ReconcileEgyptAdultCosts(){
  if(!S||S.country!=='egy'||S.age<18||!S.bill||typeof S.bill!=='object')return false;
  const y=gameYear(), f=S.housing==='parents'?.4:1, food={cheap:24000,mid:54000,lux:120000}[S.food||'mid']||54000;
  const replacements={
    groceries:p14EgyptLocalToInternal(food*f,y),
    phone:p14EgyptLocalToInternal(4800,y),
    transport:p14EgyptLocalToInternal(S.transport==='car'?100000:8000,y),
    insurance:S.insured?p14EgyptLocalToInternal(30000,y):null
  };
  let delta=0;
  for(const [key,value] of Object.entries(replacements)){
    if(value==null||!Object.prototype.hasOwnProperty.call(S.bill,key))continue;
    const old=Number(S.bill[key])||0, next=Math.round(value);
    delta+=next-old;S.bill[key]=next;
  }
  if(delta){
    S.expenses=Math.max(0,(Number(S.expenses)||0)+delta);
    S.wealth-=delta;
    return true;
  }
  return false;
}
