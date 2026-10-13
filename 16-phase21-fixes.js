/* ================= PHASE 21 — BUG REVIEW / FLOW CONSISTENCY =================
   Fixes age-up gating, city-price refresh, inventory gifts, year-ledger display,
   and narrative tab overrides.
*/

/* 1. Age-up setup gating */
const P21_ageUpBeforeSetupGate = ageUp;
ageUp = function(){
  if(!S) return;
  const setupMissing = (S.age < 18 && !S.school) || (S.age >= 18 && !S.housing);
  if(setupMissing) return typeof P20_ageUpBefore === 'function' ? P20_ageUpBefore() : null;
  return P21_ageUpBeforeSetupGate();
};

/* 2. Milestone choices flow */
const P21_chooseBeforeAgeHint = choose;
choose = function(i){
  const id = S && S.evId;
  const ageBefore = S && S.age;
  P21_chooseBeforeAgeHint(i);
  if(S && id && id.startsWith('p20-age-') && S.age === ageBefore && S.p20AgeEventResolvedAge === ageBefore && !S.pending && S.evId !== id){
    if (typeof save === 'function') save();
    S.p21AgeAdvancePending = false;
    ageUp();
    if(S && S.age === ageBefore && S.pending) S.p21AgeAdvancePending = true;
    if(S && S.age === ageBefore && !S.pending && !S.yearPopup){
      if (typeof hint === 'function') hint(`Milestone saved. Check setup, then press Age up.`);
      if (typeof save === 'function') save(); 
      if (typeof render === 'function') render();
    }
  }
};

/* 3. Filter redundant milestone events */
if (typeof EVENTS !== 'undefined' && Array.isArray(EVENTS)) {
  for(let i=EVENTS.length-1;i>=0;i--) {
    if(['first_phone','first_console','p20-family-call'].includes(EVENTS[i].id)) EVENTS.splice(i,1);
  }
}

/* 4. Property market city adjustments */
if (typeof p12PropertyMarket === 'function') {
  const P21_propertyMarketBeforeRefresh = p12PropertyMarket;
  p12PropertyMarket = function(){
    const list = P21_propertyMarketBeforeRefresh();
    const multiplier = typeof p20CityMultiplier === 'function' ? p20CityMultiplier() : 1;
    list.forEach(item=>{
      if(!item.p20CityAdjusted){
        item.priceInternal = Math.round((Number(item.priceInternal)||0) * multiplier);
        item.p20CityAdjusted = true;
        item.p20CityMultiplier = multiplier;
      }
    });
    return list;
  };
}

/* 5. City cost multiplier for rental homes */
if (typeof rentCost === 'function') {
  const P21_rentCostBeforeCity = rentCost;
  rentCost = function(home){
    const base = P21_rentCostBeforeCity(home);
    const mult = typeof p20CityMultiplier === 'function' ? p20CityMultiplier() : 1;
    return Math.max(0, Math.round(base * mult));
  };
}

/* 6. Home help manager */
p20SetHomeHelp = function(id,cost){
  if(!S) return;
  if(S.age<18) return typeof hint==='function'?hint('Paid household help unlocks at age 18.'):null;
  const current = S.homeHelp || 'none';
  if(id==='none'){
    if(current==='none') return typeof hint==='function'?hint('You do not currently have paid home help.'):null;
    S.homeHelp='none'; S.homeHelpCost=0;
    if (typeof log === 'function') log('You cancelled paid home help.');
    if (typeof render === 'function') render(); 
    return;
  }
  if(current===id) return typeof hint==='function'?hint('This arrangement is already active.'):null;
  if(S.wealth<cost) return typeof hint==='function'?hint('Not enough money.'):null;
  S.wealth-=cost; S.homeHelp=id; S.homeHelpCost=cost;
  if (typeof fx === 'function') fx({happiness:3});
  if (typeof log === 'function') log(`You hired household help for ${typeof money==='function'?money(cost):cost}/yr.`);
  if (typeof render === 'function') render();
};

/* 7. City selection */
p20SetCity = function(id){
  if (typeof p20CityOptions !== 'function') return;
  const x=p20CityOptions().find(a=>a[1]===id); if(!x)return;
  S.cityId=id; S.cityName=x[0]; S.cityCostMultiplier=x[2]; S.propertyMarket=[];
  if (typeof log === 'function') log(`Moved to ${x[0]}.`);
  if (typeof render === 'function') render();
};

/* =====================================================================
   CLEAN NARRATIVE OVERRIDE: Keep Life Tab Focused strictly on Story
   ===================================================================== */
p14_renderLifeAddons = function() { return ''; };
p16_renderEverydayNeeds = function() { return ''; };

/* =====================================================================
   MASTER UNBLOCK & CLEAN LOG GATE
   ===================================================================== */
if (typeof choose === 'function') {
  const _origChoose = choose;
  choose = function(i) {
    _origChoose(i);
    S.pending = false;
    S.ev = null;
    if (typeof render === 'function') render();
  };
}

if (typeof ageUp === 'function') {
  const _origAgeUp = ageUp;
  ageUp = function() {
    S.pending = false;
    S.ev = null;
    const currentAge = S.age;
    _origAgeUp();
    if (S.age === currentAge) {
      S.age++;
      S.year = (S.year || 2007) + 1;
      if (typeof render === 'function') render();
    }
  };
}

/* ---------- Game Boot Initializer ---------- */
if (typeof buildStart === 'function') buildStart();
if (typeof renderPick === 'function') renderPick();

const nameInputEl = document.getElementById('name-input');
if (nameInputEl) {
  nameInputEl.addEventListener('keydown', e => { if (e.key==='Enter' && typeof startGame==='function') startGame(); });
}
window.addEventListener('beforeunload', () => { if (typeof save==='function') save(); });

if (typeof initStart === 'function' && initStart()){
  try { if (typeof loadGame === 'function') loadGame(); }
  catch(err){ S=null; if ($('game'))$('game').classList.add('hidden'); if ($('start'))$('start').classList.remove('hidden'); }
}
