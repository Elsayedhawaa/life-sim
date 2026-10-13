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

buildStart();

/* ---------- Boot ---------- */
renderPick();
$('name-input').addEventListener('keydown', e => { if (e.key==='Enter') startGame(); });
window.addEventListener('beforeunload', () => save());
if (initStart()){   // a save exists: restore it straight away
  try { loadGame(); }
  catch(err){ S=null; $('game').classList.add('hidden'); $('start').classList.remove('hidden'); }
}
