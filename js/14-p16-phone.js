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

