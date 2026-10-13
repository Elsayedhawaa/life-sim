/* =====================================================================
   3. RENDERING VIEWS
   ===================================================================== */
function render(){
  /* Safety net: if a pending event has no choice you can afford, let the moment pass so the game never locks */
  if (S.pending && S.ev && S.ev.choices && S.ev.choices.length && S.ev.choices.every(unaffordable)){
    log(`${S.ev.title}: you could not afford any option, so the moment passed.`);
    S.ev={title:S.ev.title,text:'You could not afford any option, so the moment passed.',choices:[]}; S.pending=false; S.evId=null;
  }
  $('top').innerHTML = `
    <div class="prof"><div class="who"><span class="avatar">${myFace()}</span><b>${S.name}</b></div><button class="menu-btn" onclick="toggleMenu()">Menu</button><div class="age">${S.age}<small>years old · ${gameYear()}</small></div></div>
    <div class="stats">${bar('Health',S.health,'var(--rose)')}${bar('Happiness',S.happiness,'var(--amber)')}${bar('Smarts',S.smarts,'var(--cyan)')}${bar('Social',S.social,'var(--violet)')}</div>
    <div class="wealth"><span>Wealth</span><b class="mono" style="color:${S.wealth<0?'var(--rose)':'var(--mint)'}">${money(S.wealth)}</b></div>${typeof usdLine==='function'?usdLine():''}`;

  const tabs = [
    ['life','Life',true,''],
    ['school','Education',true,''],
    ['part','Part-time',S.age>=14&&studying(),'Students age 14+'],
    ['career','Career',S.age>=18,'Unlocks at 18'],
    ['family','Relationships',true,''],
    ['love','Love',S.age>=16,'Unlocks at 16'],
    ['world','World',S.age>=12,'Unlocks at 12'],
    ['assets','Real Estate',true,''],
    ['shop','Shopping',S.age>=12,'Unlocks at 12'],
    ['money','Money',S.age>=18,'Unlocks at 18'],
    ['bank','Bank',S.age>=18,'Unlocks at 18'],
    ['act','Activities',true,'']
  ];
  const cur = tabs.find(t=>t[0]===activeTab); if (!cur || !cur[2]) activeTab='life';
  $('tabs').innerHTML = tabs.map(([id,l,ok,why]) => `<button class="tab ${activeTab===id?'on':''}" ${ok?'':`disabled title="${why}"`} onclick="go('${id}')">${l}</button>`).join('');

  $('age-btn').disabled = S.pending;
  $('view').innerHTML = (menuOpen?menuCard():'') + ({
    life:viewLife, school:viewSchool, part:viewPart, career:viewCareer, family:viewFamily, love:viewLove, world:viewWorld,
    assets:viewAssets, shop:viewShop, money:viewMoney, bank:viewBank, act:viewActivities
  })[activeTab]();
  save();
}

function viewLife(){
  const e = S.ev;
  const household = `<section class="card"><div class="famrow"><div><span>${myFace()}</span>You</div>${S.family.filter(m=>m.alive).map(m=>`<div><span>${memFace(m)}</span>${m.name}</div>`).join('')}</div></section>`;

  const eventCard = e
    ? `<section class="card"><h3>${e.title}</h3><p class="muted">${evText(e)}</p>${(e.choices||[]).map((c,i)=>{
        const no = unaffordable(c);
        return `<button class="btn" ${no?'disabled':''} onclick="choose(${i})">${c.label}${no?'<small>Not enough cash</small>':''}</button>`;
      }).join('')}</section>`
    : `<section class="card"><h3>Your story</h3><p class="muted">Press Age up to continue.</p></section>`;

  return household + eventCard + `<section class="card"><h3>Life log</h3><div id="log">${S.logRows.map(r=>`<div class="log-row"><b>Age ${r.age}</b>${r.t}</div>`).join('')}</div></section>`;
}

function viewSchool(){
  const efforts = Object.entries(EFFORT).map(([k,e]) => `<button class="btn ${S.effort===k?'sel':''}" onclick="pickEffort('${k}')">${e.label}</button>`).join('');
  const effortCard = `<section class="card"><h3>Effort this year</h3><p class="muted">Applied when you age up.${S.age<18?' Years skipped: '+S.skips+'.':''}</p>${efforts}</section>`;

  if (S.age<18){
    const schools = Object.entries(SCHOOLS).map(([k,s]) => { const why=schoolBlock(k);
      return `<button class="btn ${S.school===k?'sel':''}" ${why?'disabled':''} onclick="pickSchool('${k}')">${s.name} · ${s.cost?money(s.cost)+'/yr, paid by parents':'Free'}<small>${why||s.desc}</small></button>`; }).join('');
    return `<section class="card"><h3>School</h3><p class="muted">Family status: <b>${FAMILY[S.famWealth]}</b>. Pick a school before you age up.</p>${schools}</section>` + effortCard + '';
  }

  if (S.uni){
    const u=S.uni, un=UNIS[u.type], mj=MAJORS[u.major];
    return `<section class="card"><h3>${mj.name} · ${un.name}</h3><p class="muted">Year ${u.year} of ${mj.years}. Tuition ${money(tuitionFor(u))}/yr. Student loan: ${money(S.loan)}.</p><button class="btn" onclick="dropOut()">Drop out</button></section>` + effortCard;
  }

  if (S.degree) return `<section class="card"><h3>Graduate</h3><p class="muted">Degree: <b>${MAJORS[S.degree].name}</b>. Higher career levels unlocked!</p></section>`;
  if (!S.diploma) return `<section class="card"><h3>No diploma</h3><p class="muted">You left school without a diploma.</p></section>`;

  const skipUniCard = `<section class="card" style="border:1px solid var(--cyan)">
    <h3>Skip University</h3>
    <p class="muted">University is completely optional. You can stick with your High School Diploma and enter the workforce directly.</p>
    <button class="btn" style="text-align:center;background:var(--violet);color:#fff;font-weight:700;margin-top:8px" onclick="go('career')">Skip University & View Jobs</button>
  </section>`;

  const payBtns = Object.entries(PAYERS).map(([k,p]) => `<button class="btn ${S.payPref===k?'sel':''}" onclick="setPay('${k}')">${p.label}<small>${p.desc}</small></button>`).join('');
  const majors = Object.entries(MAJORS).map(([k,m]) => `<div style="margin-top:12px"><b>${m.name}</b> <span class="muted">· ${m.years} yrs · Req Smarts ${m.min}%</span>
    <div class="acts" style="margin-top:6px"><button class="btn" onclick="enrollUni('national','${k}')">National · ${money(UNIS.national.tuition)}/yr</button><button class="btn" onclick="enrollUni('private','${k}')">Private · ${money(UNIS.private.tuition)}/yr</button></div></div>`).join('');

  return skipUniCard + `<section class="card"><h3>Who pays tuition?</h3>${payBtns}</section><section class="card"><h3>University Options</h3>${majors}</section>`;
}

function viewPart(){
  const cur=S.part;
  const list = PART_JOBS.map(p => { const why=(S.age<p.minAge?`From age ${p.minAge}. `:'')+(S.smarts<p.smarts?`Needs ${p.smarts}% Smarts.`:'');
    return `<button class="btn ${cur&&cur.id===p.id?'sel':''}" ${why?'disabled':''} onclick="takePart('${p.id}')">${p.title} · ${money(p.pay)}/yr<small>${why||'Stress '+p.stress+'/yr.'}</small></button>`; }).join('');
  return `<section class="card"><h3>Part-time work</h3><p class="muted">${cur?`Working as a ${cur.title.toLowerCase()}.`:'Side job for students.'}</p>${list}${cur?'<button class="btn" onclick="quitPart()">Quit job</button>':''}</section>`;
}

/* CAREER TAB: multi-tier ranks, work schedules, overtime, retirement */
function viewCareer(){
  const net = S.income - S.expenses;
  const fin = `<section class="card"><h3>Finances (last year)</h3>
    <div class="row"><span>Gross income</span><b class="mono" style="color:var(--mint)">${money(S.income)}</b></div>
    <div class="row"><span>Net change</span><b class="mono">${money(net)}</b></div>
    <div class="row"><span>Net worth</span><b class="mono">${money(netWorth())}</b></div></section>`;

  if (S.retired) return fin + `<section class="card"><h3>Retired</h3><p class="muted">Pension ${money(S.pension)}/yr.</p></section>`;

  if (S.job){
    const j = S.job;
    const schedText = S.schedule==='over' ? 'Long Hours (50 hrs/wk, +Perf, +Stress)' : S.schedule==='crunch' ? 'Crunch Mode (60 hrs/wk, ++Perf, ++Stress)' : 'Standard (40 hrs/wk)';
    return fin + `<section class="card">
      <h3>${j.title}</h3>
      <p class="muted">Track: ${TRACKS[j.trackId].name} (Level ${j.level+1}/5)</p>
      <p class="muted">Salary ${money(j.salary)}/yr · Tenure: ${j.years} year(s)</p>
      <div style="margin:10px 0">${bar('Performance',j.perf,'var(--cyan)')}</div>

      <p class="muted" style="margin-top:8px;font-size:.85rem">Work Schedule: <b>${schedText}</b></p>
      <div class="acts" style="margin-top:6px">
        <button class="btn ${S.schedule==='norm'?'sel':''}" onclick="setSchedule('norm')">40 hrs/wk</button>
        <button class="btn ${S.schedule==='over'?'sel':''}" onclick="setSchedule('over')">50 hrs/wk</button>
        <button class="btn ${S.schedule==='crunch'?'sel':''}" onclick="setSchedule('crunch')">60 hrs/wk</button>
      </div>

      <button class="btn" ${S.worked?'disabled':''} onclick="workHarder()">Work Overtime / Harder<small>Boost performance once this year.</small></button>
      <button class="btn" ${S.promoTried?'disabled':''} onclick="askPromotion()">Request Rank Promotion<small>Advance to the next career level if qualified.</small></button>
      ${S.age>=RETIRE_MIN?'<button class="btn" onclick="retireClick()">Retire<small>Pension of about 40% of your salary.</small></button>':''}
      <button class="btn" onclick="quitJob()">Resign / Quit</button>
    </section>`;
  }

  let html = fin + `<section class="card"><h3>Career Market Tracks</h3><p class="muted">${S.uni?'Finish university to unlock full-time careers.':'Apply for entry level or degree positions:'}</p>`;

  Object.entries(TRACKS).forEach(([trackId, track]) => {
    const entryJob = track.levels[0];
    const canDegree = !track.degree || S.degree === track.degree;
    const blockWhy = (S.uni?'Finish university first. ':'') + (!canDegree ? `Requires ${MAJORS[track.degree].name} degree. ` : '') + (S.smarts < entryJob.reqSmarts ? `Requires ${entryJob.reqSmarts}% Smarts.` : '') + (entryJob.diploma&&!S.diploma?'Requires a diploma. ':'');

    html += `<div style="margin-top:12px;padding:10px;border:1px solid var(--line);border-radius:8px">
      <b>${track.name}</b><br>
      <span class="muted" style="font-size:.85rem">Level 1: ${entryJob.title} (${money(entryJob.salary)}/yr)</span>
      <button class="btn" ${blockWhy?'disabled':''} onclick="applyTrack('${trackId}')">${blockWhy ? blockWhy : 'Apply for Entry Position'}</button>
    </div>`;
  });

  html += `</section>`;
  return html;
}

/* REAL ESTATE TAB: own, rent out, renovate, furnish, pay down mortgages */
function viewAssets(){
  if (S.age<18) return `<section class="card"><h3>Real Estate</h3><p class="muted">You live with your parents. Unlocks at Age 18.</p></section>`;

  let html = `<section class="card"><h3>Real Estate Portfolio</h3><p class="muted">Total Equity: <b>${money(propertyValueTotal())}</b>. Rents have risen ${Math.round((S.rentIndex/(S.rent0||1)-1)*100)}% since you were 6, following wages.</p></section>`;

  const rented = HOUSING_CATALOG.find(c=>c.id===S.housing && c.kind==='rent');
  if (rented){
    const cf=comfort(rented.id);
    html += `<section class="card"><h3>Your Rental</h3><p class="muted">${rented.name} · rent ${money(rentCost(rented))}/yr. Comfort: Happiness +${cf.hap}, Health +${cf.hp}. Furniture stays behind if you move.</p>
      <button class="btn" onclick="furnishHome('${rented.id}')">Furnish this home</button></section>`;
  }

  if (S.ownedHomes.length > 0){
    html += `<section class="card"><h3>Your Owned Properties</h3>`;
    S.ownedHomes.forEach((h, idx) => {
      const isLive = S.housing === h.id, isRent = h.status === 'rent', cf = comfort(h.id);
      html += `<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">
        <b>${h.name}</b> (${h.cond}% condition)<br>
        <span class="muted" style="font-size:.85rem">Market Value: ${money(h.value)} | Mortgage Left: ${money(h.balance)}</span><br>
        <span class="muted" style="font-size:.85rem">Status: <b>${isLive ? 'Living Here' : isRent ? 'Rented Out ('+money(Math.round(h.rentInc*S.rentIndex))+'/yr income)' : 'Vacant'}</b> · Comfort: Happiness +${cf.hap}, Health +${cf.hp}</span>
        ${h.balance>0 ? `<div style="margin-top:8px"><span class="muted" style="font-size:.85rem">Extra mortgage payment (any amount)</span>
          <div style="display:flex;gap:6px;margin-top:4px"><input type="number" id="mp${idx}" min="0" placeholder="Amount" style="flex:1;min-width:0">
          <button class="btn" style="width:auto;margin:0" onclick="payMortgage(${idx},false)">Pay</button>
          <button class="btn" style="width:auto;margin:0" ${S.wealth<h.balance?'disabled':''} onclick="payMortgage(${idx},true)">Pay off ${money(h.balance)}</button></div></div>` : ''}
        <div class="acts" style="margin-top:8px">
          ${!isLive ? `<button class="btn" onclick="setLiveProperty(${idx})">Move In</button>` : ''}
          ${!isRent && !isLive ? `<button class="btn" onclick="setRentProperty(${idx})">Rent Out</button>` : ''}
          ${Object.entries(RENOS).map(([k,r])=>`<button class="btn" ${S.wealth<rc(r)?'disabled':''} onclick="renovateProperty(${idx},'${k}')">${r.n} (${money(rc(r))})</button>`).join('')}
          <button class="btn" onclick="furnishHome('${h.id}')">Furnish</button>
          <button class="btn" onclick="sellOwnedProperty(${idx})">Sell Property</button>
        </div>
      </div>`;
    });
    html += `</section>`;
  }

  const stayFamily = `<button class="btn ${S.housing==='parents'?'sel':''}" onclick="stayHome()">Stay with parents<small>${S.famWealth>=1?'Free':money(1500*(S.pr||1))+'/yr contribution'}. Needs a living parent with a good bond.</small></button>`;

  const rents = HOUSING_CATALOG.filter(h=>h.kind==='rent').map(h =>
    `<button class="btn ${S.housing===h.id?'sel':''}" ${h.id!=='room'&&S.wealth<Math.round(rentCost(h)/12)?'disabled':''} onclick="rentHome('${h.id}')">${h.name} · ${money(rentCost(h))}/yr + ${money(S.country==='egy'&&typeof p14EgyptUtilityCost==='function'?p14EgyptUtilityCost(h):h.util)} utilities<small>${h.desc} Happiness ${h.hap>=0?'+':''}${h.hap}, Health ${h.hp>=0?'+':''}${h.hp} per year.</small></button>`
  ).join('');

  const buys = HOUSING_CATALOG.filter(h=>h.kind==='buy').map(h => {
    const down = h.price * 0.20;
    return `<div style="margin-top:10px">
      <b>${h.name}</b> · ${money(h.price)}
      <p class="muted" style="font-size:.85rem">${h.desc} Mortgage ${money(h.pay)}/yr (${((S.mortRate||.05)*100).toFixed(1)}% rate this year). Rental income potential: ${money(Math.round(h.rentInc*S.rentIndex))}/yr</p>
      <div class="acts" style="margin-top:6px">
        <button class="btn" ${S.wealth<h.price?'disabled':''} onclick="buyProperty('${h.id}', true)">Cash ${money(h.price)}</button>
        <button class="btn" ${S.wealth<down?'disabled':''} onclick="buyProperty('${h.id}', false)">Down ${money(down)}</button>
      </div>
    </div>`;
  }).join('');

  return html + `<section class="card"><h3>Living Options</h3>${stayFamily}</section>
    <section class="card"><h3>Rent an Apartment</h3><p class="muted">You need the first month of rent in cash (except the shared room). Rent follows wages.</p>${rents}</section>
    <section class="card"><h3>Buy Real Estate</h3>${buys}</section>`;
}

/* SHOPPING helpers */
function placeSelector(){
  const ids=homeChoices();
  if (!ids.length) return '<p class="muted">You need a home to install things in. Rent or buy one in Real Estate.</p>';
  const t=targetHome();
  return `<p class="muted" style="font-size:.85rem;margin:8px 0 4px">Install in:</p><div class="sub-tabs" style="flex-wrap:wrap">${ids.map(id=>`<button class="sub-tab ${t===id?'on':''}" onclick="setShopHome('${id}')">${homeName(id)}</button>`).join('')}</div>`;
}
function viewFurnish(){
  const homes=homeChoices();
  if (!homes.length) return '<section class="card"><h3>Furnishing</h3><p class="muted">You need a home first. Rent or buy one in Real Estate.</p></section>';
  const h=targetHome(), f=S.furn[h]||{}, cf=comfort(h), own=S.ownedHomes.find(x=>x.id===h);
  const cats=Object.entries(FURN).map(([k,c])=>`<div style="margin-top:12px"><b>${c.label}</b> <span class="muted" style="font-size:.85rem">${f[k]?'· '+c.opts.find(o=>o.id===f[k]).n:'· nothing yet'}</span>
    ${c.opts.filter(o=>{ const fr=FURN_FROM[o.id]; return !fr||gameYear()>=fr; }).map(o=>{ const pr=Math.round(o.cost*(S.pr||1)*(1-promoPct('furn')));
      return `<button class="btn ${f[k]===o.id?'sel':''}" ${f[k]===o.id||S.wealth<pr?'disabled':''} onclick="buyFurn('${k}','${o.id}')">${o.n} · ${money(pr)}<small>Happiness +${o.hap}${o.hp?', Health +'+o.hp:''}${o.sm?', Smarts +'+o.sm:''}${o.val&&own?', adds value to your property':''}</small></button>`; }).join('')}</div>`).join('');
  return `<section class="card"><h3>Furnish & Decorate</h3><p class="muted">Comfort here: Happiness +${cf.hap}, Health +${cf.hp}${cf.sm?', Smarts +'+cf.sm:''} per year while you live in it. ${own?'Flooring and AC add to the property value.':'Furniture in a rental stays behind if you move.'}</p>${placeSelector()}${cats}</section>`;
}
function viewMine(){
  if (!S.inventory.length) return '<section class="card"><h3>My Items</h3><p class="muted">You do not own anything yet.</p></section>';
  const rows=S.inventory.map(i=>{
    const worn=i.age>=i.life, outd=!i.broken && i.age>=Math.ceil(i.life*.75);
    const st=i.broken?(worn?'Worn out, beyond repair':'Broken'):outd?'Outdated: effects halved':'Working';
    const col=i.broken?'var(--rose)':outd?'var(--amber)':'var(--mint)';
    const fix=i.insured?Math.max(30,Math.round(i.price*.08)):Math.max(50,Math.round(i.price*.3));
    return `<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px"><b>${i.model}${i.storage?' · '+(i.storage>=1024?'1 TB':i.storage+' GB'):''}</b><br>
      <span class="muted" style="font-size:.82rem">${i.portable?'With you':homeName(i.homeId)} · age ${i.age}/${i.life} yrs · ${i.insured?'Insured':'Not insured'}</span><br><span style="font-size:.85rem;color:${col}">${st}</span>
      <div class="acts" style="margin-top:6px">
        ${i.broken&&!worn?`<button class="btn" onclick="repairItem('${i.uid}')">Repair ${money(fix)}</button>`:''}
        ${i.broken&&i.price?`<button class="btn" onclick="replaceItem('${i.uid}')">Buy new ${money(i.price)}</button>`:''}
        ${!i.broken&&i.cat!=='fashion'?`<button class="btn" onclick="toggleInsure('${i.uid}')">${i.insured?'Cancel insurance':'Add insurance'}</button>`:''}
        <button class="btn" onclick="discardItem('${i.uid}')">Discard</button></div></div>`; }).join('');
  return `<section class="card"><h3>My Items</h3><p class="muted">Items break and wear out with age. Insured items are cheap to repair. Items in a home only help while you live there.</p>${rows}</section>`;
}

