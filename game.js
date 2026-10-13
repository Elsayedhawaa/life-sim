
/* Runtime state and simulation engine. Static tables are loaded from data.js. */















/* --- Detailed Multi-Tiered Career Tracks --- */


/* --- Cost of Living (base values are 2026 dollars; the Era Pack scales them by year) --- */









   // old saves load as United States

const rnd = n => Math.floor(Math.random()*n);
const pick = a => a[rnd(a.length)];

/* Catalog of Available Properties (rent = per year, buy = price + yearly mortgage payment `pay`) */


/* --- Shopping data --- */
   // these travel with you; everything else is installed in a home

 // longer plan = more interest

/* Gadgets are filled in by the Era Pack (section 7), which knows what existed in each year */

/* Appliances: [type, label, base life, big?, health-type?, [[model, price, specs] x3 = basic, good, excellent]] */


/* Furnishing: category -> [label, [[name, price, happiness, health, smarts, value-added fraction] x options]] */



/* Property renovations: cost, condition gained, value added */






const face = (g,t,age) => age<3 ? '👶'+TONES[t||0] : FACES[g||'n'][age<13?0:age<65?1:2] + TONES[t||0];

/* Random events. cost (number or function) is checked against your cash; a cost of 0 is always free. */


/* =====================================================================
   2. STATE MANAGEMENT & HELPERS
   ===================================================================== */
let S, activeTab = 'life', activeShopTab = 'apple';

function newGame(name, g, t){
  S = {
    name: name||'Alex', age:6, health:100, happiness:100, smarts:50, social:50, wealth:0,
    av: {g:g||'n', t:t||0},
    school: null, effort:'coast', skips:0, diploma:false,
    job: null, schedule: 'norm',
    income:0, expenses:0, bill:{},
    actions:2, worked:false, promoTried:false,
    pending:false, lastEvent:null, ev:null, evId:null, logRows:[],
    housing: 'parents', ownedHomes: [],
    family: [], dead:false,
    famWealth: rnd(3), uni:null, degree:null, loan:0, part:null,
    payPref: 'self', askedAge:-1,
    loans: [], food:'mid', transport:'bus', insured:false,
    contrib:0, nest:0, retired:false, pension:0, lastSalary:0,
    inventory: [], shopLoans: [],
    rentIndex:1, promo:null, shopHome:null, furn:{}, uidN:1
  };
  addMember('Mother',28+rnd(10),55+rnd(35));
  addMember('Father',28+rnd(10),55+rnd(35));
  for (let i=rnd(3); i>0; i--) addMember('Sibling',Math.max(1,3+rnd(7)),50+rnd(40));
}

const $ = id => document.getElementById(id);
const clamp = n => Math.max(0, Math.min(100, Math.round(n)));
const money = n => (typeof S!=='undefined' && S && typeof fmtMoney==='function') ? fmtMoney(n) : (n<0?'-$':'$') + Math.abs(Math.round(n)).toLocaleString();
const hint = t => { $('hint').textContent = t||''; };
function log(t){ S.logRows.unshift({age:S.age, t}); }

function fx(o){
  for (const k of ['health','happiness','smarts','social']) if (o[k]) S[k] = clamp(S[k]+o[k]);
  if (o.wealth) S.wealth += o.wealth;
  if (S.age<18) S.wealth = Math.max(0,S.wealth);   // minors cannot hold debt
}
const bar = (l,v,c) => { const pct=Math.max(0,Math.min(100,Math.round(Number(v)||0))); const tone=(String(c||'var(--cyan)').match(/--([\w-]+)/)||[])[1]||'cyan'; return `<div><div class="stat-top"><span>${l}</span><b class="mono">${v}%</b></div><div class="bar"><div class="fill fill-width-${pct}" data-fill-tone="${tone}"></div></div></div>`; };
function go(t){ activeTab=t; render(); }
const evText = e => typeof e.text==='function' ? e.text() : e.text;
const costOf = c => { const v = typeof c.cost==='function' ? c.cost() : c.cost; return Number(v)||0; };
const unaffordable = c => costOf(c)>0 && S.wealth<costOf(c);

const partner = () => S.family.find(m => (m.role==='Partner'||m.role==='Spouse') && m.alive);
const kids = () => S.family.filter(m => m.role==='Child');
const parents = () => S.family.filter(m => (m.role==='Mother'||m.role==='Father') && m.alive);
const bestBond = () => Math.max(0, ...parents().map(m=>m.bond));
const bankDebt = () => S.loans.reduce((a,l)=>a+l.bal,0) + S.shopLoans.reduce((a,l)=>a+l.bal,0);

function propertyValueTotal(){
  let tot = 0;
  S.ownedHomes.forEach(h => tot += (h.value - h.balance));
  return tot;
}
var netWorth = () => S.wealth + propertyValueTotal() + S.nest - S.loan - bankDebt();
const studying = () => S.age<18 || !!S.uni;
const myFace = () => face(S.av.g, S.av.t, S.age);
const memFace = m => face(m.g, m.t, m.age);

/* Where do you live? Returns {cat, own?} for rentals/owned homes, null for the family home */
function homeInfo(){
  if (S.housing==='parents' || !S.housing) return null;
  const own = S.ownedHomes.find(h=>h.id===S.housing);
  if (own) return {own, cat:HOUSING_CATALOG.find(c=>c.id===own.catId)};
  const cat = HOUSING_CATALOG.find(c=>c.id===S.housing && c.kind==='rent');
  return cat ? {cat} : null;
}

/* ---------- calendar, rent, homes, comfort ---------- */
let activeAppType = 'kettle';
const gameYear = () => (S.born||2001) + S.age;             // born 2001: age 6 = 2007
let rentCost = h => Math.round(h.cost*S.rentIndex);       // rent follows wages; country-specific override below
function homeName(id){
  if (id==='parents') return "Parents' home";
  const o=S.ownedHomes.find(h=>h.id===id); if (o) return o.name+' (owned)';
  const c=HOUSING_CATALOG.find(x=>x.id===id); return c ? c.name+' (rented)' : 'Unknown home';
}
function homeChoices(){   // homes where things can be installed
  const ids=[];
  if (S.housing==='parents') ids.push('parents');
  if (S.housing && S.housing!=='parents' && !S.ownedHomes.find(h=>h.id===S.housing)) ids.push(S.housing);
  S.ownedHomes.forEach(h=>ids.push(h.id));
  return ids;
}
function targetHome(){ const ids=homeChoices(); return ids.includes(S.shopHome) ? S.shopHome : (ids.includes(S.housing) ? S.housing : (ids[0]||null)); }
function setShopHome(id){ S.shopHome=id; render(); }
function comfort(id){   // yearly bonus from furnishing, capped
  const f=(S.furn||{})[id]||{}; let hap=0,hp=0,sm=0;
  for (const c in f){ const o=FURN[c] && FURN[c].opts.find(x=>x.id===f[c]); if (o){ hap+=o.hap; hp+=o.hp; sm+=o.sm; } }
  return {hap:Math.min(8,hap), hp:Math.min(3,hp), sm:Math.min(2,sm)};
}
const promoPct = cat => S.promo && (S.promo.cats.includes('all') || S.promo.cats.includes(cat)) ? S.promo.pct : 0;
const shopPrice = (it,add=0) => Math.round((it.cost+add)*(1-promoPct(it.cat)));

function schoolBlock(k){
  const s=SCHOOLS[k]; if (S.age>=18) return '';
  if (S.famWealth<s.need) return `Your family cannot afford this (needs ${FAMILY[s.need]} family).`;
  if (bestBond()<s.approve) return 'Your parents do not approve yet.';
  return '';
}

function tuitionFor(u){ return Math.round(UNIS[u.type].tuition*(u.scholar?.5:1)); }
function fundUni(u){
  const t=tuitionFor(u);
  if (u.pay==='parents' && parents().length && bestBond()>=20) return {help:t,cash:0,loan:0};
  if (u.pay==='loan') return {help:0,cash:0,loan:t};
  const cash=Math.min(t,Math.max(0,S.wealth));
  return {help:0,cash,loan:t-cash};
}

function parentsAgree(type){
  if (!parents().length) return false;
  const base=[[.5,0],[.85,.45],[.95,.8]][S.famWealth][type==='private'?1:0];
  return Math.random() < base*(.5+bestBond()/200);
}

function uniYear(notes,bill){
  const u=S.uni, un=UNIS[u.type], ef=EFFORT[S.effort], mj=MAJORS[u.major];
  if (u.pay==='parents' && !(parents().length && bestBond()>=20)){ u.pay='self'; log('Your parents can no longer pay tuition.'); }
  const f=fundUni(u), t=tuitionFor(u);
  fx({smarts:Math.round(ef.smarts>0?ef.smarts*un.mult:ef.smarts), happiness:ef.happiness, social:ef.social});
  if (f.cash) bill.tuition=f.cash;
  S.loan+=f.loan; u.year++;
  notes.push(`university year ${u.year}/${mj.years}, tuition ${money(t)}`);
  if (u.year>=mj.years){ S.degree=u.major; S.uni=null; fx({happiness:8,social:3}); log(`Graduated with a degree in ${mj.name}!`); }
}

function incomeTax(taxable){
  let tax=0, prev=0;
  for (const [cap,rate] of BRACKETS){
    if (taxable>prev) tax += (Math.min(taxable,cap)-prev)*rate;
    prev=cap; if (taxable<=cap) break;
  }
  return Math.round(tax);
}
const incomeBasis = () => S.job ? S.job.salary : (S.retired ? S.pension : S.income);
const creditLimit = () => Math.max(0, Math.round(incomeBasis()*3 + propertyValueTotal()*.5 - S.loan - bankDebt()));

function retireNow(forced){
  const base = S.job ? S.job.salary : S.lastSalary;
  S.pension = Math.max(6000, Math.round(base*.4));
  S.retired = true; S.job = null; S.part = null;
  log(`${forced?'Mandatory retirement':'You retired'}. Pension: ${money(S.pension)}/yr.`);
}
function retireClick(){ retireNow(false); render(); }

/* Fills in fields older saves are missing so they load cleanly */
function migrate(o){
  const base={
    famWealth:1,uni:null,degree:null,loan:0,part:null,housing:'parents',ownedHomes:[],
    family:[],evId:null,logRows:[],dead:false,social:50,av:{g:'n',t:0},payPref:'self',
    askedAge:-1,loans:[],food:'mid',transport:'bus',insured:false,contrib:0,nest:0,
    retired:false,pension:0,lastSalary:0,bill:{},inventory:[],shopLoans:[],schedule:'norm',rentIndex:1,promo:null,shopHome:null,furn:{},uidN:1
  };
  for (const k in base) if (!(k in o)) o[k]=base[k];
  if (o.school==='public'||o.school==='home') o.school='national';
  if (o.uni && !o.uni.pay) o.uni.pay='self';
  if (o.housing==='apt') o.housing='apt2';
  if (o.home){   // old single-home format becomes an owned property
    const c=HOUSING_CATALOG.find(x=>x.id===o.housing);
    if (c && c.kind==='buy'){ o.ownedHomes.push({id:'h_old',catId:c.id,name:c.name,value:o.home.value,balance:o.home.balance,cond:100,rentInc:c.rentInc,status:'live'}); o.housing='h_old'; }
    delete o.home;
  }
  if (o.job && !o.job.trackId) o.job=null;   // old job format has no career track
  o.inventory = o.inventory.map((i,n)=> i.uid ? i : {uid:'u'+(n+1),key:i.itemId||'old',cat:'watch',type:'old',model:i.model,price:0,age:i.age||0,life:i.life||4,hap:i.hap||0,hp:i.hp||0,soc:i.soc||0,tier:1,homeId:null,broken:false,insured:false,portable:true});
  o.uidN = Math.max(o.uidN||1, o.inventory.length+1);
  o.family.forEach(m=>{ if(!m.g) m.g = m.role==='Mother'?'f':m.role==='Father'?'m':'n'; if(m.t==null) m.t=o.av.t; });
  return o;
}

function addMember(role, age, bond){
  const g = role==='Mother'?'f':role==='Father'?'m':pick(['f','m']);
  const t = role==='Partner' ? rnd(3) : (S.av?S.av.t:0);
  const m = {id:'m'+Math.random().toString(36).slice(2,8), name:pick(NAMES), role, age, bond:clamp(bond), g, t, alive:true, done:false};
  S.family.push(m); return m;
}

function familyYear(){
  S.family.forEach(m => {
    if (!m.alive) return;
    m.age++; m.done=false; m.bond=clamp(m.bond-2);
    /* Character death is disabled in this life-simulation mode. */
  });
  if (S.age>=18 && S.housing==='parents' && !parents().length){ S.housing=null; log('Your family home is no longer available. Choose housing in Real Estate.'); }
  return kids().filter(k=>k.alive && k.age<18).length*CHILD_COST;
}

/* Save / Restore */
let menuOpen=false, menuMsg='', resetArmed=false, newArmed=false;
function save(){
  if (!S || S.dead) return false;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({S, activeTab})); return true; } catch(e){ return false; }
}
function loadGame(){
  let d=null;
  try { d=JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e){}
  if (!d || !d.S){ menuMsg='No saved game found.'; if (S) render(); return; }
  S = migrate(d.S); activeTab = d.activeTab || 'life'; menuOpen=false; hint();
  if (S.pending && S.evId) S.ev = EVENTS.find(e=>e.id===S.evId) || null;
  if (S.pending && !S.ev) S.pending=false;
  $('start').classList.add('hidden'); if($('gameover'))$('gameover').classList.add('hidden'); $('game').classList.remove('hidden');
  menuMsg='Game loaded.'; render();
}
function manualSave(){ menuMsg = save() ? 'Game saved.' : 'Could not save.'; render(); }

function restartLifeAtSix(){
  if (!confirm('Are you sure you want to restart life at Age 6 (2007)? Current progress will be lost.')) return;
  const name = S.name, g = S.av.g, t = S.av.t;
  newGame(name, g, t);
  activeTab = 'life'; menuOpen = false;
  $('start').classList.add('hidden'); if($('gameover'))$('gameover').classList.add('hidden'); $('game').classList.remove('hidden');
  log('Life restarted at Age 6.');
  render();
}

function resetGame(){
  if (!resetArmed){ resetArmed=true; menuMsg='Tap Reset game again to delete save.'; render(); return; }
  try { localStorage.removeItem(SAVE_KEY); } catch(e){}
  S = null; location.reload();
}
function toggleMenu(){ menuOpen=!menuOpen; menuMsg=''; resetArmed=false; render(); }

const menuCard = () => `<section class="card"><h3>Menu</h3><p class="muted">${menuMsg||'Your game saves automatically after every change.'}</p>
  <div class="acts">
    <button class="btn" onclick="manualSave()">Save game</button>
    <button class="btn" onclick="loadGame()">Load game</button>
    <button class="btn" onclick="restartLifeAtSix()">Restart at Age 6</button>
    <button class="btn" onclick="resetGame()">${resetArmed?'Confirm Delete':'Reset Game'}</button>
    <button class="btn" onclick="toggleMenu()">Close</button>
  </div></section>`;

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
    <div class="wealth"><span>Wealth</span><b class="mono" class="${S.wealth<0?'text-rose':'text-mint'}">${money(S.wealth)}</b></div>${typeof usdLine==='function'?usdLine():''}`;

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
    ['act','Activities',true,''],
    ['matters','Active Matters'+(typeof p23ActiveCount==='function'&&p23ActiveCount()?' ('+p23ActiveCount()+')':''),true,'']
  ];
  const cur = tabs.find(t=>t[0]===activeTab); if (!cur || !cur[2]) activeTab='life';
  $('tabs').innerHTML = tabs.map(([id,l,ok,why]) => `<button class="tab ${activeTab===id?'on':''}" ${ok?'':`disabled title="${why}"`} onclick="go('${id}')">${l}</button>`).join('');

  $('age-btn').disabled = S.pending;
  $('view').innerHTML = (menuOpen?menuCard():'') + ({
    life:viewLife, school:viewSchool, part:viewPart, career:viewCareer, family:viewFamily, love:viewLove, world:viewWorld,
    assets:viewAssets, shop:viewShop, money:viewMoney, bank:viewBank, act:viewActivities, matters:viewMatters
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

  const skipUniCard = `<section class="card" data-ui-style="ui-009">
    <h3>Skip University</h3>
    <p class="muted">University is completely optional. You can stick with your High School Diploma and enter the workforce directly.</p>
    <button class="btn" data-ui-style="ui-010" onclick="go('career')">Skip University & View Jobs</button>
  </section>`;

  const payBtns = Object.entries(PAYERS).map(([k,p]) => `<button class="btn ${S.payPref===k?'sel':''}" onclick="setPay('${k}')">${p.label}<small>${p.desc}</small></button>`).join('');
  const majors = Object.entries(MAJORS).map(([k,m]) => `<div data-ui-style="ui-011"><b>${m.name}</b> <span class="muted">· ${m.years} yrs · Req Smarts ${m.min}%</span>
    <div class="acts" data-ui-style="ui-012"><button class="btn" onclick="enrollUni('national','${k}')">National · ${money(UNIS.national.tuition)}/yr</button><button class="btn" onclick="enrollUni('private','${k}')">Private · ${money(UNIS.private.tuition)}/yr</button></div></div>`).join('');

  return skipUniCard + `<section class="card"><h3>Who pays tuition?</h3>${payBtns}</section><section class="card"><h3>University Options</h3>${majors}</section>`;
}

function viewPart(){
  const cur=S.part;
  const list = PART_JOBS.map(p => { const why=(S.age<p.minAge?`From age ${p.minAge}. `:'')+(S.smarts<p.smarts?`Needs ${p.smarts}% Smarts.`:'');
    return `<button class="btn ${cur&&cur.id===p.id?'sel':''}" ${why?'disabled':''} onclick="takePart('${p.id}')">${p.title} · ${money(p.pay)}/yr<small>${why||'Stress '+p.stress+'/yr.'}</small></button>`; }).join('');
  return `<section class="card"><h3>Part-time work</h3><p class="muted">${cur?`Working as a ${cur.title.toLowerCase()}.`:'Side job for students.'}</p>${list}${cur?'<button class="btn" onclick="quitPart()">Quit job</button>':''}</section>`;
}

function viewCareer() {
  const currentJob = S.job || null;
  const userEdu = S.degree ? MAJORS[S.degree]?.name : (S.diploma ? "High School Diploma" : "None");
  const expYears = S.exp || 0;
  const userSmarts = S.smarts || 0;
  const userEng = S.eng || 0;

  // Render Current Active Position Header
  let currentHtml = "";
  if (currentJob) {
    const annualPay = currentJob.salary || currentJob.baseSalary || 30000;
    const monthlyNet = Math.round(annualPay / 12);
    
    currentHtml = `
      <div class="card p24-job-card" open>
        <div class="p24-topline">
          <div class="p24-brand">${(currentJob.company || "CORP").slice(0, 3).toUpperCase()}</div>
          <div>
            <h3>${currentJob.title || currentJob.roleTitle}</h3>
            <div class="muted">${currentJob.company || "Corporate"} • ${currentJob.trackName || "General Service"}</div>
          </div>
        </div>
        <div class="row" style="margin-top:8px">
          <span>Monthly Income</span>
          <b class="text-mint">${money(monthlyNet)} / mo</b>
        </div>
        <div class="row">
          <span>Annual Base Salary</span>
          <b>${money(annualPay)} / yr</b>
        </div>
        <div class="row">
          <span>Contract & Work Schedule</span>
          <small>${currentJob.hours || 40} hrs/wk • ${currentJob.remote || "On-site"}</small>
        </div>
        <div style="margin-top:10px">
          <small class="muted" style="display:block;margin-bottom:4px">Perks & Benefits:</small>
          <div>
            <span class="p24-pill">✓ Health Insurance</span>
            <span class="p24-pill">✓ Paid Leave (${currentJob.leave || 14} days)</span>
            ${currentJob.bonus ? `<span class="p24-pill">✓ Annual Bonus (${Math.round(currentJob.bonus * 100)}%)</span>` : ''}
          </div>
        </div>
        <button class="btn" onclick="resignJob()" style="margin-top:12px;border-color:var(--rose);color:var(--rose);text-align:center">Resign Position</button>
      </div>
    `;
  } else {
    currentHtml = `
      <div class="card" style="text-align:center;padding:20px">
        <div class="muted">You are currently unemployed.</div>
        <small style="display:block;margin-top:4px;color:var(--amber)">Browse available career opportunities below to start earning.</small>
      </div>
    `;
  }

  // Sector Filter Navigation
  if (!S._careerFilter) S._careerFilter = "all";

  const tracks = [
    { id: 'all', name: 'All Sectors' },
    { id: 'bpo', name: '📞 BPO & English Centers' },
    { id: 'entry', name: '🛍️ General & Retail' },
    { id: 'tech', name: '💻 Technology & CS' },
    { id: 'finance', name: '📊 Finance & Business' },
    { id: 'law', name: '⚖️ Legal Services' },
    { id: 'medical', name: '🩺 Healthcare' },
    { id: 'bio', name: '🔬 Science & Bio' }
  ];

  const filterTabs = tracks.map(t => `
    <button class="sub-tab ${S._careerFilter === t.id ? 'on' : ''}" onclick="setCareerFilter('${t.id}')">
      ${t.name}
    </button>
  `).join("");

  // Compile Jobs List based on selected filter
  let displayJobs = [];

  Object.keys(TRACKS).forEach(trackKey => {
    if (S._careerFilter !== "all" && S._careerFilter !== trackKey) return;
    
    const track = TRACKS[trackKey];
    track.levels.forEach((lvl, idx) => {
      displayJobs.push({
        id: `${trackKey}_lvl_${idx}`,
        trackKey: trackKey,
        trackName: track.name,
        title: lvl.title,
        company: trackKey === 'bpo' ? (idx === 0 ? 'Sutherland' : idx === 1 ? 'Vodafone UK' : idx === 2 ? 'Concentrix' : 'BPO Global') : 'Corporate Client',
        salary: lvl.salary,
        hours: lvl.hrs,
        stress: lvl.stress,
        reqSmarts: lvl.reqSmarts || 0,
        reqEng: lvl.eng || 0,
        reqDiploma: lvl.diploma,
        reqDegree: track.degree || null,
        desc: `Level ${idx + 1} position in the ${track.name} sector.`
      });
    });
  });

  const jobListHtml = displayJobs.map(j => {
    const isCurrent = currentJob && currentJob.id === j.id;
    const meetsDiploma = !j.reqDiploma || S.diploma || S.degree;
    const meetsDegree = !j.reqDegree || S.degree === j.reqDegree;
    const meetsSmarts = userSmarts >= j.reqSmarts;
    const meetsEng = userEng >= j.reqEng;
    const canApply = meetsDiploma && meetsDegree && meetsSmarts && meetsEng && !isCurrent;

    const monthlyPay = Math.round(j.salary / 12);

    return `
      <details class="p24-job-card" ${isCurrent ? 'open' : ''}>
        <summary>
          <div style="display:inline-flex;align-items:center;justify-content:space-between;width:calc(100% - 20px)">
            <span><b>${j.title}</b> <small class="muted">at ${j.company}</small></span>
            <b class="text-mint">${money(monthlyPay)}/mo</b>
          </div>
        </summary>
        <div style="padding-top:10px;border-top:1px solid var(--line);margin-top:8px">
          <p class="muted" style="font-size:.84rem">${j.desc}</p>
          <div class="row" style="margin-top:6px">
            <span>Requirements</span>
            <small>
              ${j.reqDegree ? `Degree: <b class="${meetsDegree ? 'text-mint' : 'text-rose'}">${j.reqDegree.toUpperCase()}</b> | ` : ''}
              Smarts: <b class="${meetsSmarts ? 'text-mint' : 'text-rose'}">${j.reqSmarts}%</b>
              ${j.reqEng ? ` | English: <b class="${meetsEng ? 'text-mint' : 'text-rose'}">${j.reqEng}%</b>` : ''}
            </small>
          </div>
          <div style="margin-top:8px">
            <span class="p24-pill">Hours: ${j.hours}h/wk</span>
            <span class="p24-pill">Stress Level: ${j.stress}/10</span>
          </div>
          <button class="btn" 
            ${!canApply ? 'disabled' : ''} 
            onclick="applyJobById('${j.id}')" 
            style="margin-top:10px;text-align:center">
            ${isCurrent ? 'Current Position' : (canApply ? 'Submit Application' : 'Requirements Not Met')}
          </button>
        </div>
      </details>
    `;
  }).join("");

  return `
    <div class="card">
      <h3>Active Career Status</h3>
      ${currentHtml}
    </div>
    
    <div class="card" style="margin-top:12px">
      <h3>Job Marketplace</h3>
      <div class="sub-tabs" style="margin-top:8px">${filterTabs}</div>
      <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
        ${jobListHtml}
      </div>
    </div>
  `;
}

// Controller helper functions
function setCareerFilter(cat) {
  S._careerFilter = cat;
  render();
}

function applyJobById(jobId) {
  let selected = null;
  
  Object.keys(TRACKS).forEach(trackKey => {
    const track = TRACKS[trackKey];
    track.levels.forEach((lvl, idx) => {
      if (`${trackKey}_lvl_${idx}` === jobId) {
        selected = {
          id: jobId,
          title: lvl.title,
          company: trackKey === 'bpo' ? (idx === 0 ? 'Sutherland' : idx === 1 ? 'Vodafone UK' : idx === 2 ? 'Concentrix' : 'BPO Global') : 'Corporate Client',
          salary: lvl.salary,
          hours: lvl.hrs,
          stress: lvl.stress,
          trackName: track.name,
          leave: 14 + (idx * 2),
          bonus: 0.03 * (idx + 1)
        };
      }
    });
  });

  if (!selected) return;
  S.job = selected;
  if (typeof addLog === "function") {
    addLog(`Started working as ${selected.title} at ${selected.company}.`);
  }
  render();
}

function resignJob() {
  if (S.job && typeof addLog === "function") {
    addLog(`Resigned from position as ${S.job.title}.`);
  }
  S.job = null;
  render();

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
      html += `<div data-ui-style="ui-018">
        <b>${h.name}</b> (${h.cond}% condition)<br>
        <span class="muted" data-ui-style="ui-017">Market Value: ${money(h.value)} | Mortgage Left: ${money(h.balance)}</span><br>
        <span class="muted" data-ui-style="ui-017">Status: <b>${isLive ? 'Living Here' : isRent ? 'Rented Out ('+money(Math.round(h.rentInc*S.rentIndex))+'/yr income)' : 'Vacant'}</b> · Comfort: Happiness +${cf.hap}, Health +${cf.hp}</span>
        ${h.balance>0 ? `<div data-ui-style="ui-019"><span class="muted" data-ui-style="ui-017">Extra mortgage payment (any amount)</span>
          <div data-ui-style="ui-020"><input type="number" id="mp${idx}" min="0" placeholder="Amount" data-ui-style="ui-021">
          <button class="btn" data-ui-style="ui-022" onclick="payMortgage(${idx},false)">Pay</button>
          <button class="btn" data-ui-style="ui-022" ${S.wealth<h.balance?'disabled':''} onclick="payMortgage(${idx},true)">Pay off ${money(h.balance)}</button></div></div>` : ''}
        <div class="acts" data-ui-style="ui-019">
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
    return `<div data-ui-style="ui-023">
      <b>${h.name}</b> · ${money(h.price)}
      <p class="muted" data-ui-style="ui-017">${h.desc} Mortgage ${money(h.pay)}/yr (${((S.mortRate||.05)*100).toFixed(1)}% rate this year). Rental income potential: ${money(Math.round(h.rentInc*S.rentIndex))}/yr</p>
      <div class="acts" data-ui-style="ui-012">
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
  return `<p class="muted" data-ui-style="ui-024">Install in:</p><div class="sub-tabs" data-ui-style="ui-025">${ids.map(id=>`<button class="sub-tab ${t===id?'on':''}" onclick="setShopHome('${id}')">${homeName(id)}</button>`).join('')}</div>`;
}
function viewFurnish(){
  const homes=homeChoices();
  if (!homes.length) return '<section class="card"><h3>Furnishing</h3><p class="muted">You need a home first. Rent or buy one in Real Estate.</p></section>';
  const h=targetHome(), f=S.furn[h]||{}, cf=comfort(h), own=S.ownedHomes.find(x=>x.id===h);
  const cats=Object.entries(FURN).map(([k,c])=>`<div data-ui-style="ui-011"><b>${c.label}</b> <span class="muted" data-ui-style="ui-017">${f[k]?'· '+c.opts.find(o=>o.id===f[k]).n:'· nothing yet'}</span>
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
    return `<div data-ui-style="ui-018"><b>${i.model}${i.storage?' · '+(i.storage>=1024?'1 TB':i.storage+' GB'):''}</b><br>
      <span class="muted" data-ui-style="ui-026">${i.portable?'With you':homeName(i.homeId)} · age ${i.age}/${i.life} yrs · ${i.insured?'Insured':'Not insured'}</span><br><span class="status-text ${col==='var(--rose)'?'text-rose':col==='var(--amber)'?'text-amber':'text-mint'}">${st}</span>
      <div class="acts" data-ui-style="ui-012">
        ${i.broken&&!worn?`<button class="btn" onclick="repairItem('${i.uid}')">Repair ${money(fix)}</button>`:''}
        ${i.broken&&i.price?`<button class="btn" onclick="replaceItem('${i.uid}')">Buy new ${money(i.price)}</button>`:''}
        ${!i.broken&&i.cat!=='fashion'?`<button class="btn" onclick="toggleInsure('${i.uid}')">${i.insured?'Cancel insurance':'Add insurance'}</button>`:''}
        <button class="btn" onclick="discardItem('${i.uid}')">Discard</button></div></div>`; }).join('');
  return `<section class="card"><h3>My Items</h3><p class="muted">Items break and wear out with age. Insured items are cheap to repair. Items in a home only help while you live there.</p>${rows}</section>`;
}

/* =====================================================================
   4. USER ACTIONS & CAREER LOGIC
   ===================================================================== */
function pickSchool(k){ const why=schoolBlock(k); if (why) return hint(why); S.school=k; log(`Enrolled in ${SCHOOLS[k].name}.`); hint(); render(); }
function pickEffort(k){ S.effort=k; render(); }
function setPay(k){ S.payPref=k; hint(); render(); }

function enrollUni(type, major){
  const un=UNIS[type], mj=MAJORS[major];
  if (S.job) return hint('Quit your job before enrolling.');
  if (S.smarts<mj.min+un.minOff) return hint(`Requires ${mj.min+un.minOff}% Smarts.`);

  const u={type, major, year:0, pay:S.payPref, scholar:false};
  if (u.pay==='parents'){
    if (S.askedAge===S.age) return hint('You already asked your parents this year.');
    S.askedAge=S.age;
    if (!parentsAgree(type)){
      parents().forEach(m=>m.bond=clamp(m.bond-3));
      log(`Your parents refused to pay for ${mj.name}.`); render();
      return hint('Your parents refused.');
    }
  }

  const f = fundUni(u);
  if (S.loan + f.loan > LOAN_CAP) return hint('Student loan limit would be exceeded.');

  S.uni=u; log(`Enrolled in ${mj.name} at ${un.name}.`); hint(); render();
}

function dropOut(){ log('Dropped out of university.'); S.uni=null; render(); }
function takePart(id){ const p=PART_JOBS.find(x=>x.id===id); S.part={id:p.id,title:p.title,pay:p.pay,stress:p.stress}; log(`Started a part-time job as ${p.title}.`); render(); }
function quitPart(){ log('Quit part-time job.'); S.part=null; render(); }

function applyTrack(trackId){
  const track = TRACKS[trackId], level0 = track.levels[0];
  if (S.uni) return hint('Finish university first.');
  S.job = {trackId, level:0, title:level0.title, salary:level0.salary, perf:50, years:0};
  log(`Started a new career: ${track.name} as ${level0.title} (${money(level0.salary)}/yr)!`);
  render();
}

function setSchedule(sched){ S.schedule = sched; render(); }

function workHarder(){
  S.worked = true;
  S.job.perf = clamp(S.job.perf + 15);
  fx({health:-4, happiness:-4});
  log('Worked extra hard on your job projects.');
  render();
}

function askPromotion(){
  S.promoTried = true;
  const j = S.job, track = TRACKS[j.trackId];
  if (j.level >= track.levels.length - 1){
    render(); return hint('You have reached the highest rank in this career!');
  }
  const nextLevel = track.levels[j.level + 1];
  const successChance = (j.perf * 0.5 + S.smarts * 0.3 + Math.min(j.years, 5) * 4) / 100;
  if (Math.random() < successChance && S.smarts >= nextLevel.reqSmarts){
    j.level++; j.title = nextLevel.title; j.salary = nextLevel.salary; j.perf = 50; j.years = 0;
    fx({happiness:10});
    log(`PROMOTED! You are now a ${j.title} earning ${money(j.salary)}/yr!`);
  } else {
    j.perf = clamp(j.perf - 8);
    fx({happiness:-5});
    log('Your promotion request was denied by management.');
  }
  render();
}

function quitJob(){ log(`Quit job as ${S.job.title}.`); S.lastSalary=S.job.salary; S.job=null; render(); }

/* Property management */
function stayHome(){
  if (!parents().length || bestBond()<30) return hint('Your parents will not take you in. Improve your bond first.');
  S.housing='parents'; log('Living with parents.'); hint(); render();
}
function rentHome(id){
  const h=HOUSING_CATALOG.find(x=>x.id===id);
  if (id!=='room' && S.wealth<Math.round(rentCost(h)/12)) return hint('You cannot cover the first month of rent.');
  S.housing=id; log(`Rented a ${h.name.toLowerCase()}.`); hint(); render();
}

function setLiveProperty(idx){
  S.ownedHomes.forEach(h => { if(h.status==='live') h.status='vacant'; });
  S.ownedHomes[idx].status = 'live';
  S.housing = S.ownedHomes[idx].id;
  log(`Moved into ${S.ownedHomes[idx].name}.`);
  render();
}

const fallbackHome = () => parents().length ? 'parents' : null;
function setRentProperty(idx){
  S.ownedHomes[idx].status = 'rent';
  if (S.housing === S.ownedHomes[idx].id) S.housing = fallbackHome();
  log(`Rented out ${S.ownedHomes[idx].name} to tenants.`);
  render();
}

function renovateProperty(idx, kind='repair'){
  const r=RENOS[kind], h=S.ownedHomes[idx], c=rc(r);
  if (S.wealth < c) return hint(`${r.n} costs ${money(c)}.`);
  S.wealth -= c;
  h.cond = clamp(h.cond + r.cond);
  h.value = Math.round(h.value * (1+r.val));
  log(`${r.n} done on ${h.name}. Its value went up.`);
  render();
}

/* Pay extra toward a mortgage: any amount, or close it completely */
function payMortgage(idx, all){
  const h=S.ownedHomes[idx]; const el=$('mp'+idx);
  let amt = all ? h.balance : Math.floor(Number(el&&el.value)||0);
  if (amt<=0) return hint('Enter an amount to pay.');
  amt=Math.min(amt,h.balance);
  if (S.wealth<amt) return hint('Not enough cash.');
  S.wealth-=amt; h.balance-=amt;
  log(h.balance===0?`You paid off the mortgage on ${h.name}!`:`You paid ${money(amt)} extra toward the mortgage on ${h.name}.`);
  hint(); render();
}
function furnishHome(id){ S.shopHome=id; activeShopTab='furnish'; go('shop'); }
function buyFurn(cat, optId){
  const h=targetHome(), o=FURN[cat].opts.find(x=>x.id===optId), pr=Math.round(o.cost*(S.pr||1)*(1-promoPct('furn')));
  if (!h) return hint('You need a home first.');
  if (S.wealth<0 || S.wealth<pr) return hint('Not enough cash.');
  S.wealth-=pr; (S.furn[h]=S.furn[h]||{})[cat]=optId;
  const own=S.ownedHomes.find(x=>x.id===h); if (own && o.val) own.value+=Math.round(pr*o.val);
  log(`Bought ${o.n} for ${homeName(h)}.`); hint(); render();
}

function sellOwnedProperty(idx){
  const h = S.ownedHomes[idx], equity = h.value - h.balance;
  S.wealth += equity;
  if (S.housing === h.id) S.housing = fallbackHome();
  log(`Sold ${h.name} for ${money(equity)} net equity.`);
  delete S.furn[h.id]; S.inventory=S.inventory.filter(i=>i.homeId!==h.id);   // fittings and installed items go with the sale
  S.ownedHomes.splice(idx, 1);
  render();
}

const findItem = uid => S.inventory.find(i=>i.uid===uid);
function repairItem(uid){
  const i=findItem(uid); if (!i) return;
  if (i.age>=i.life) return hint('It is too old to repair. Buy a new one.');
  const c=i.insured?Math.max(30,Math.round(i.price*.08)):Math.max(50,Math.round(i.price*.3));
  if (S.wealth<c) return hint('Not enough cash.');
  S.wealth-=c; i.broken=false; log(`Repaired your ${i.model} for ${money(c)}.`); hint(); render();
}
function replaceItem(uid){
  const i=findItem(uid); if (!i) return;
  if (S.wealth<i.price) return hint('Not enough cash.');
  S.wealth-=i.price; i.broken=false; i.age=0; log(`Bought a new ${i.model} for ${money(i.price)}.`); hint(); render();
}
function toggleInsure(uid){ const i=findItem(uid); if (!i) return; i.insured=!i.insured; log(`${i.insured?'Insured':'Cancelled insurance on'} your ${i.model}.`); render(); }
function discardItem(uid){ const i=findItem(uid); if (!i) return; S.inventory=S.inventory.filter(x=>x.uid!==uid); log(`Threw away your ${i.model}.`); render(); }

/* Yearly: aging, breakdowns, benefits, insurance premiums */
function itemsYear(bill){
  const keep=[];
  S.inventory.forEach(inv=>{
    inv.age++;
    if (inv.cat==='fashion'){ if (inv.age>=inv.life){ log(`Your ${inv.model} wore out.`); return; } }
    else if (!inv.broken){
      const worn=inv.age>=inv.life;
      const p=worn?1:0.02+Math.max(0,(inv.age-inv.life*.5)/inv.life)*.35+(inv.tier===0?.03:0);
      if (Math.random()<p){ inv.broken=true; log(worn?`Your ${inv.model} is worn out for good. Time for a new one.`:`Your ${inv.model} broke.${inv.insured?' It is insured, so a repair is cheap.':' Repair it or buy a new one in My Items.'}`); }
    }
    if (!inv.broken && (inv.portable || inv.homeId===S.housing)){
      const k=inv.age>=Math.ceil(inv.life*.75)?.5:1;   // outdated items give half the benefit
      fx({happiness:Math.round(inv.hap*k), health:Math.round(inv.hp*k), social:Math.round(inv.soc*k)});
    }
    if (inv.insured) bill.deviceInsurance=(bill.deviceInsurance||0)+Math.round(inv.price*.07);
    keep.push(inv);
  });
  S.inventory=keep;
}

function setFood(k){ S.food=k; render(); }
function toggleInsurance(){ S.insured=!S.insured; render(); }

function payBank(i){
  const l = S.loans[i];
  if (S.wealth < l.bal) return hint('Not enough cash.');
  S.wealth -= l.bal;
  S.loans.splice(i, 1);
  log('Paid off a bank loan completely!');
  render();
}

function famAct(id, type){
  const m = S.family.find(x=>x.id===id); m.done=true;
  const k=S.pr||1;
  if (type==='time'){ m.bond=clamp(m.bond+8); fx({happiness:2,social:2}); log(`Spent time with ${m.name}.`); }
  else if (type==='compliment'){ m.bond=clamp(m.bond+5); fx({social:1}); log(`Complimented ${m.name}.`); }
  else if (type==='argue'){ m.bond=clamp(m.bond-10); fx({happiness:3,social:-2}); log(`Argued with ${m.name}.`); }
  else if (Math.random()<m.bond/100*.9){ const amt=Math.round(((S.age<18?50:300)+rnd(150))*k); S.wealth+=amt; m.bond=clamp(m.bond-2); log(`${m.name} gave you ${money(amt)}.`); }
  else { m.bond=clamp(m.bond-4); log(`${m.name} declined your request.`); }
  render();
}

function p12ChooseOriginal(i){
  const c = S.ev.choices[i];
  if (unaffordable(c)) return hint('Not enough cash.');
  const f = typeof c.fx==='function' ? c.fx() : c.fx;
  fx(f);
  const msg = f.msg || c.result;
  log(`${S.ev.title}: ${msg}`);
  S.ev = {title:S.ev.title, text:msg, choices:[]};
  S.pending = false; S.evId = null;
  checkDeath(); render();
}

/* =====================================================================
   5. YEARLY AGE UP TICK
   ===================================================================== */
function ageUp(){
  if (S.pending) return hint('Make your choice first.');
  if (S.age < 18 && !S.school){ go('school'); return hint('Pick a school first.'); }
  if (S.age >= 18 && !S.housing){ go('assets'); return hint('Choose housing in Real Estate first.'); }
  hint();

  S.age++; S.actions=2; S.worked=false; S.promoTried=false; S.income=0; S.expenses=0;
  const notes = [], bill = {};
  const wasStudying = S.age<=18 || !!S.uni;
  if (S.age>=18){   // rents follow wages (set by the Era Pack each year)
    const rise = S.rentWorld ? (S.rentRise||0) : .02+Math.random()*.05;
    if (!S.rentWorld) S.rentIndex*=1+rise;
    if (S.housing && homeInfo() && !homeInfo().own) notes.push(`rent ${rise>=0?'rose':'fell'} ${Math.abs(Math.round(rise*100))}%`);
  }
  S.promo = Math.random()<.6 ? pick(PROMOS) : null;   // this year's store sale

  // School year (ages 7-18). Parents pay the fees, so nothing is charged to you.
  if (S.age <= 18){
    const sc=SCHOOLS[S.school]||SCHOOLS.national, ef=EFFORT[S.effort];
    fx({smarts:Math.round(ef.smarts>0?ef.smarts*sc.mult:ef.smarts), happiness:ef.happiness, social:ef.social+sc.social});
    if (S.effort==='skip') S.skips++;
  }
  if (S.age===18){
    S.diploma = S.skips<5;
    log(S.diploma?'Graduated high school! University is optional: you can also start working.':'Left school without a diploma.');
  }

  if (S.uni) uniYear(notes, bill);

  // Part-time work
  if (S.part){
    if (!wasStudying){ S.part=null; log('Your part-time job ended with your studies.'); }
    else { const st=S.part.stress+(S.effort==='hard'?2:0); S.income+=S.part.pay; fx({happiness:-st, health:-1, smarts:-1}); }
  }

  // Career: salary, schedule stress, performance, forced retirement
  if (S.job){
    const lvlData = TRACKS[S.job.trackId].levels[S.job.level];
    let extraPerf = 0, extraStress = 0;
    if (S.schedule === 'over'){ extraPerf = 8; extraStress = 4; }
    else if (S.schedule === 'crunch'){ extraPerf = 18; extraStress = 9; }

    S.job.perf = clamp(S.job.perf + extraPerf - 2);
    fx({happiness: -(lvlData.stress + extraStress), health: extraStress > 5 ? -2 : 0});
    S.income += S.job.salary; S.lastSalary = S.job.salary;
    S.job.years++;

    if (S.job.perf < 10){
      log(`Fired from ${S.job.title} due to poor performance!`);
      S.job = null;
    } else if (S.age >= RETIRE_FORCED){ retireNow(true); }
  }
  if (S.retired) S.income += S.pension;

  // Owned properties: condition decay, mortgage, tenants (value changes come from the Era Pack's housing market)
  S.ownedHomes.forEach(h => {
    const cat = HOUSING_CATALOG.find(c=>c.id===h.catId);
    h.cond = clamp(h.cond - 3);
    h.value = Math.round(h.value * 1.03);
    if (h.balance > 0){
      h.balance = Math.round(h.balance * (1+(h.rate||.05)));
      const pmt = Math.min(h.balance, h.pay || (cat ? cat.pay : Math.round(h.value*.04)));
      h.balance -= pmt;
      bill.mortgage = (bill.mortgage||0) + pmt;
    }
    if (h.status === 'rent'){
      const rentCollected = Math.round(h.rentInc * S.rentIndex * (h.cond / 100));
      S.income += rentCollected;
      notes.push(`tenants paid ${money(rentCollected)}`);
    }
  });

  // Items you own: aging, breakdowns, yearly benefits, insurance
  itemsYear(bill);

  // Shop installments and bank loans: interest, then the yearly payment
  S.shopLoans.forEach(l => { const p=Math.min(l.bal,l.pmt); l.bal-=p; bill.installments=(bill.installments||0)+p; });
  S.shopLoans = S.shopLoans.filter(l => l.bal > 0);
  S.loans.forEach(l => { l.bal=Math.round(l.bal*(1+l.rate)); const p=Math.min(l.bal,l.pmt); l.bal-=p; bill.bankLoans=(bill.bankLoans||0)+p; });
  S.loans = S.loans.filter(l => l.bal > 0);

  // Living costs (adults)
  if (S.age>=18){
    const hi = homeInfo(), fd=FOOD[S.food], tr=TRANSPORT[S.transport];
    bill.groceries = Math.round(fd.cost*(S.housing==='parents'?.4:1));
    bill.phone = PHONE;
    bill.transport = tr.cost;
    if (S.insured) bill.insurance = Math.round(INSURANCE*(S.pr||1));
    fx({health:fd.hp, happiness:fd.hap+tr.hap});

    if (S.housing==='parents'){ if (S.famWealth<1) bill.familyContribution = Math.round(1500*(S.pr||1)); }
    else if (hi){
      fx({happiness:hi.cat.hap, health:hi.cat.hp});
      bill.utilities = hi.cat.util;
      if (hi.own){ bill.propertyTax = Math.round(hi.own.value*PROP_TAX); if (hi.own.cond<40) fx({happiness:-2}); }
      else bill.rent = rentCost(hi.cat);
    }

    bill.payrollTax = Math.round(S.income * PAYROLL);
    bill.incomeTax = incomeTax(Math.max(0, S.income));

    if (S.loan>0){   // student loan: 5% interest, repay up to 10% of income
      S.loan = Math.round(S.loan * 1.05);
      const r = Math.min(S.loan, Math.round(S.income * .10));
      S.loan -= r;
      bill.studentLoan = r;
    }
  }

  bill.children = familyYear();
  const cf = comfort(S.housing); if (cf.hap||cf.hp||cf.sm) fx({happiness:cf.hap, health:cf.hp, smarts:cf.sm});   // furnished home comfort
  S.expenses = Object.values(bill).reduce((a,b)=>a+b,0);
  S.bill = bill;
  S.wealth += S.income - S.expenses;
  if (S.age<18) S.wealth = Math.max(0, S.wealth);   // parents absorb any shortfall

  if (S.age>=18) notes.push(`earned ${money(S.income)}, spent ${money(S.expenses)}`);
  if (S.wealth<0 && S.age>=18){ fx({happiness:-3}); notes.push('debt is weighing on you'); }
  if (S.age>50) fx({health:-Math.ceil((S.age-50)/8)});
  if (notes.length) log(notes.join('; ')+'.');

  const pool = EVENTS.filter(e=>S.age>=e.min && S.age<=e.max && e.id!==S.lastEvent && (!e.ok || e.ok()));
  if (pool.length && Math.random()<.8){
    const e = pool[Math.floor(Math.random()*pool.length)];
    S.lastEvent=e.id; S.ev=e; S.evId=e.id; S.pending=true; activeTab='life';
  } else S.ev={title:'A quiet year',text:'Nothing major happened. Life went on.',choices:[]};

  checkDeath(); render();
}

function checkDeath(){ if(S) S.dead=false; }

/* =====================================================================
   6. SETUP & INITIALIZATION
   ===================================================================== */
let avG='n', avT=0;
function renderPick(){
  $('av-big').textContent = face(avG,avT,6);
  $('av-g').innerHTML = [['f','Girl'],['n','Neutral'],['m','Boy']].map(([g,l])=>`<button class="chip ${avG===g?'sel':''}" onclick="pickG('${g}')">${face(g,avT,20)}</button>`).join('');
  $('av-t').innerHTML = [0,1,2].map(t=>`<button class="chip ${avT===t?'sel':''}" onclick="pickT(${t})">🖐${TONES[t]}</button>`).join('');
}
function pickG(g){ avG=g; renderPick(); }
function pickT(t){ avT=t; renderPick(); }

function hasSave(){ let d=null; try { d=JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e){} return !!(d && d.S); }

function startGame(){
  if (hasSave() && !newArmed){ newArmed=true; $('start-btn').textContent='Tap again to replace saved life'; return; }
  newGame($('name-input').value.trim(), avG, avT);
  activeTab='life'; menuOpen=false; newArmed=false;
  $('start').classList.add('hidden'); $('game').classList.remove('hidden');
  log('Life began at age 6.');
  S.ev={title:'Your story begins',text:`${S.name}, you are 6 years old and starting school. Open the Education tab and choose a school.`,choices:[]};
  render();
}

function initStart(){
  let d=null; try { d=JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e){}
  const b=$('cont-btn');
  if (d && d.S){ b.textContent=`Continue saved life: ${d.S.name}, age ${d.S.age}`; b.classList.remove('hidden'); return true; }
  b.classList.add('hidden'); return false;
}

/* =====================================================================
   7. ERA PACK (Phase 9): you were born in 2001, life starts in 2007.
   Real inflation, wages, house prices, gas prices, stock returns and
   real products (iPhone 1 onwards, TVs, consoles, cars) by year.
   ===================================================================== */

/* ---------- 7.1 The real world, year by year ----------
   [inflation %, stock market %, house prices %, economy, savings rate %, mortgage rate %, gas $/gal] */


for (let y=Y0+1; y<=Y1; y++){ CPI[y]=CPI[y-1]*(1+YD[y][0]/100); HPI[y]=HPI[y-1]*(1+YD[y][2]/100); }



function ydat(y,o){
  o=o||S; if (y<Y0) y=Y0;
  if (y<=Y1){ const r=YD[y]; return {infl:r[0]/100,mret:r[1]/100,hg:r[2]/100,econ:r[3],save:r[4]/100,mort:r[5]/100,gas:r[6]}; }
  o.fut=o.fut||{};
  if (!o.fut[y]){
    const pv=ydat(y-1,o), r=Math.random();
    const econ = pv.econ==='recession'&&Math.random()<.4 ? 'recession' : r<.08?'recession' : r<.2?'boom':'normal';
    const infl={normal:.025,boom:.04,recession:.012}[econ]+Math.random()*.01-.005;
    o.fut[y]={infl, econ, mret: econ==='recession'?-.22+Math.random()*.14 : econ==='boom'?.10+Math.random()*.15 : -.02+Math.random()*.2,
      hg: econ==='recession'?-.07+Math.random()*.04 : econ==='boom'?.06+Math.random()*.03 : .01+Math.random()*.04,
      save:Math.max(.005,infl), mort:.055+Math.random()*.02, gas:Math.max(1.8,pv.gas*(1+Math.random()*.2-.09))};
  }
  return o.fut[y];
}
function prOf(y,o){ if (y<=Y1) return CPI[Math.max(y,Y0)]/CPI[Y1]; let p=1; for (let k=Y1+1;k<=y;k++) p*=1+ydat(k,o).infl; return p; }
function hprOf(y,o){ if (y<=Y1) return HPI[Math.max(y,Y0)]/HPI[Y1]; let p=1; for (let k=Y1+1;k<=y;k++) p*=1+ydat(k,o).hg; return p; }

/* Sets prices for the given age: pr = all prices (2026 = 1), wr = wages and rents, hpr = house prices */
function setWorld(o, age){
  age = age==null ? o.age : age;
  const y=(o.born||2001)+age, D=ydat(y,o), pr=prOf(y,o), oldRent=o.rentIndex;
  o.pr=pr; o.cpi=pr*CPI[Y1]; o.wr=Math.pow(pr,1.15); o.hpr=hprOf(y,o);
  o.rentIndex=o.wr; o.rentRise = oldRent && o.rentWorld ? o.rentIndex/oldRent-1 : 0; o.rentWorld=true;
  o.econ=D.econ; o.inflRate=D.infl; o.mret=D.mret; o.gas=D.gas; o.saveRate=D.save; o.mortRate=D.mort;
  BRACKETS.forEach((b,i)=>{ if (isFinite(BASE_BR[i])) b[0]=Math.round(BASE_BR[i]*o.wr); });
}
const mortRate = () => (S&&S.mortRate)||.05;
const rc = r => Math.round(r.cost*(S.pr||1));

/* ---------- 7.2 Price scaling on the original tables ---------- */
function gx(obj,key,fn){ const base=obj[key]; Object.defineProperty(obj,key,{get(){ return Math.round(base*fn()); },enumerable:true,configurable:true}); }
const FPR=()=>(S&&S.pr)||1, FWR=()=>(S&&S.wr)||1, FHP=()=>(S&&S.hpr)||1;
Object.values(FOOD).forEach(f=>gx(f,'cost',FPR));
TRANSPORT.bike={name:'Bicycle',cost:120,hap:0,desc:'Cheap and good for your health. Not much fun in the rain.'};
TRANSPORT.taxi={name:'Taxi / ride-hailing',cost:3200,hap:0,desc:'No car needed. Convenient, but it adds up.'};
Object.values(TRANSPORT).forEach(t=>gx(t,'cost',FPR));
Object.defineProperty(TRANSPORT.car,'cost',{get:()=>0,enumerable:true,configurable:true});
TRANSPORT.car.name='Drive a car'; TRANSPORT.car.desc='Buy, lease or rent one in Shopping > Vehicles. Fuel, insurance and upkeep are billed separately.';
HOUSING_CATALOG.forEach(h=>{ gx(h,'util',FPR); if (h.kind==='buy'){ gx(h,'price',FHP); gx(h,'pay',FHP); } });
Object.values(SCHOOLS).forEach(s=>{ if (s.cost) gx(s,'cost',FPR); });
Object.values(UNIS).forEach(u=>gx(u,'tuition',()=>Math.pow(FPR(),1.4)));
PART_JOBS.forEach(p=>gx(p,'pay',FWR));
Object.values(TRACKS).forEach(t=>t.levels.forEach(l=>gx(l,'salary',FWR)));


/* ---------- 7.3 New fields, old-save migration, start of a new life ---------- */
function packInit(o){
  const b={born:2001,cpi:1,pr:1,wr:1,hpr:1,inflRate:.025,econ:'normal',mret:.07,gas:2.8,saveRate:.03,mortRate:.05,rentWorld:false,rentRise:0,rent0:1,fut:{},
    savings:0,invest:0,credit:650,gpa:0,gpaN:0,retPct:0,didYear:{},cars:[],rental:null,lot:null,dp:0,friends:[],pets:[],prevEcon:'normal'};
  for (const k in b) if (!(k in o)) o[k]=b[k];
  return o;
}
const _migrate = migrate;
migrate = function(o){
  const first = !('born' in o);
  packInit(_migrate(o));
  /* old Phase 8 cars were plain inventory items: turn them into garage cars */
  const old=o.inventory.filter(i=>i.cat==='car'); o.inventory=o.inventory.filter(i=>i.cat!=='car');
  old.forEach(i=>{ o.cars.push({uid:'c'+i.uid,mid:'corolla',make:'',name:i.model,cls:'compact',year:2019,fuel:'g',trim:0,color:0,int:0,intc:0,opts:[],mods:[],msrp:i.price,paid:i.price,miles:i.age*11000,cond:80,age:i.age,acc:false,ins:'liab',life:i.life,broken:false,fix:0,warr:0,lemon:false,seller:'dealer',hap:i.hap,soc:i.soc,legacy:true}); });
  if (first){ o.rentWorld=false; }
  setWorld(o); if (first) o.rent0=o.rentIndex;
  o.prevEcon=o.econ; if (!o.rent0||o.rent0===1) o.rent0=o.rentIndex;
  o.ownedHomes.forEach(h=>{ if (!h.pay){ const c=HOUSING_CATALOG.find(x=>x.id===h.catId); h.pay=c?Math.round(c.pay):0; } if (!h.rate) h.rate=.05; });
  return o;
};
const _newGame = newGame;
newGame = function(n,g,t){
  _newGame(n,g,t); packInit(S); S.born=2001; S.rentWorld=false; setWorld(S); S.rent0=S.rentIndex; S.prevEcon=S.econ;
};
const _startGame = startGame;
startGame = function(){
  _startGame();
  if (S && !S.dead && S.age===6 && S.logRows.length===1){ log(`2007: ${HIST[2007]}`); render(); }
};
/* BUG FIX: moving out of an owned home left it marked "Living Here" */
function packLeaveHome(prev){ if (S.housing!==prev){ const o=S.ownedHomes.find(h=>h.id===prev && h.status==='live'); if (o) o.status='vacant'; } }
const _rentHome = rentHome;  rentHome = function(id){ const p=S.housing; _rentHome(id); packLeaveHome(p); render(); };
const _stayHome = stayHome;  stayHome = function(){ const p=S.housing; _stayHome(); packLeaveHome(p); render(); };

try { netWorth = () => S.wealth + propertyValueTotal() + S.nest + (S.savings||0) + (S.invest||0) + carsEquity() - S.loan - bankDebt(); } catch(e){}

/* Buying a home now uses the mortgage rate and house price of that year */
function buyProperty(catId, isCash){
  const cat=HOUSING_CATALOG.find(c=>c.id===catId), price=cat.price, cost=isCash?price:price*0.20;
  if (S.wealth<0 || S.wealth<cost) return hint('Not enough cash.');
  S.wealth-=cost;
  S.ownedHomes.push({id:'h_'+Math.random().toString(36).slice(2,7),catId,name:cat.name,value:price,balance:isCash?0:price-cost,cond:100,rentInc:cat.rentInc||0,status:'vacant',pay:cat.pay,rate:S.mortRate});
  log(`Bought a property: ${cat.name} for ${money(price)}${isCash?'':` with a ${(S.mortRate*100).toFixed(1)}% mortgage`}.`); hint(); render();
}

/* ---------- 7.4 Phones and gadgets by year ---------- */

function futurePhones(y){
  const out=[];
  for (let yy=2027; yy<=y; yy++){
    out.push(['apple',`iPhone ${yy-2008}`,yy,799,4,4,6,'Latest chip and camera system',0],['apple',`iPhone ${yy-2008} Pro`,yy,1099,6,5,6,'Pro camera system, ProMotion display',1],['apple',`iPhone ${yy-2008} Pro Max`,yy,1199,6,6,6,'Biggest display and battery',1],
      ['samsung',`Samsung Galaxy S${yy-2000}`,yy,799,5,5,5,'Newest Galaxy flagship',0],['samsung',`Samsung Galaxy S${yy-2000} Ultra`,yy,1299,7,6,5,'Top-end camera and S Pen',1]);
  }
  return out;
}
const stOpts=(y,pro)=>{ let a = y<2010?[[4,0],[8,100],[16,200]] : y<2013?[[16,0],[32,100],[64,200]] : y<2017?[[16,0],[32,100],[64,200],[128,300]] : y<2020?[[64,0],[128,100],[256,200],[512,350]] : [[128,0],[256,100],[512,300],[1024,550]]; return pro&&y>=2017?a.slice(1):a; };

/* Gadgets: key, category, store, model, launch price, happiness, social, life, specs, available from, available until */
STATIC.length=0;
STATIC.push(
 ['lp_eee','laptop','Electronics Mall','ASUS Eee PC netbook',399,1,0,4,'7" screen, 4GB flash, Linux',2007,2012],
 ['lp_acer07','laptop','Electronics Mall','Acer Aspire 5000',599,1,0,5,'Athlon, 1GB RAM, 120GB HDD, Windows Vista',2007,2011],
 ['lp_insp','laptop','Dell Store','Dell Inspiron 1525',699,1,0,5,'Core 2 Duo, 2GB RAM, 160GB HDD',2007,2010],
 ['lp_t61','laptop','Lenovo Store','Lenovo ThinkPad T61',1299,2,1,6,'Core 2 Duo, 2GB, 14" display',2007,2010],
 ['lp_mb','laptop','Apple Store','MacBook (white polycarbonate)',1099,3,3,6,'Core 2 Duo, 1GB RAM, 80GB HDD, iSight camera',2007,2011],
 ['lp_mbp07','laptop','Apple Store','MacBook Pro 15"',1999,4,4,6,'Core 2 Duo, 2GB RAM, 120GB HDD, LED backlight',2007,2011],
 ['lp_mbair08','laptop','Apple Store','MacBook Air (original)',1799,3,4,6,'13.3", 80GB HDD, the thinnest laptop ever',2008,2009],
 ['lp_chrome','laptop','Electronics Mall','Chromebook',349,1,0,5,'ChromeOS, 16GB storage, web-based apps',2011,2018],
 ['lp_mbair11','laptop','Apple Store','MacBook Air 13"',999,3,3,6,'Flash storage, 4GB RAM, instant-on',2010,2017],
 ['lp_mbpr','laptop','Apple Store','MacBook Pro 13" Retina',1299,4,3,6,'Retina display, SSD, 8GB RAM',2012,2019],
 ['lp_surf','laptop','Microsoft Store','Surface Pro',899,3,2,5,'Tablet and laptop in one, Windows 8',2013,2020],
 ['lp_xps13','laptop','Dell Store','Dell XPS 13',999,3,2,5,'Core i5, 8GB, edge-to-edge InfinityEdge screen',2015,2020],
 ['lp_acer','laptop','Electronics Mall','Acer Aspire 5 15"',550,1,0,5,'Core i5, 8GB RAM, 512GB SSD',2019,9999],
 ['lp_hp','laptop','Electronics Mall','HP Pavilion 15',750,2,0,5,'Ryzen 7, 16GB RAM, 512GB SSD',2019,9999],
 ['lp_m1','laptop','Apple Store','MacBook Air M1',999,4,3,6,'Apple M1 chip, 8GB, 256GB, fanless',2020,2023],
 ['lp_think','laptop','Lenovo Store','Lenovo ThinkPad E14',950,2,1,6,'Core Ultra 5, 16GB, 512GB, business keyboard',2021,9999],
 ['lp_rog','laptop','ASUS Store','ASUS ROG Zephyrus G14',1900,5,2,5,'Ryzen AI 9, RTX 5070, 32GB, 1TB',2023,9999],
 ['lp_xps','laptop','Dell Store','Dell XPS 14',1700,4,2,6,'Core Ultra 7, 32GB, 14.5" OLED',2024,9999],
 ['lp_air','laptop','Apple Store','MacBook Air 13" M5',1099,4,2,6,'M5 chip, 16GB, 256GB, 18h battery',2025,9999],
 ['l_macbook','laptop','Apple Store','MacBook Pro M5 (16-inch)',2499,5,3,6,'M5 Pro, 24GB, 1TB, mini-LED display',2025,9999],
 ['tb_ipad1','tablet','Apple Store','iPad (1st gen)',499,3,3,5,'9.7" touchscreen, 16GB, 10h battery',2010,2012],
 ['tb_gtab','tablet','Samsung Store','Samsung Galaxy Tab 7"',499,2,1,5,'7" screen, Android, 3G',2010,2012],
 ['tb_fire','tablet','Electronics Mall','Amazon Kindle Fire',199,1,0,4,'7" colour tablet, Amazon apps',2011,2017],
 ['tb_mini','tablet','Apple Store','iPad mini',329,2,2,5,'7.9" screen, Lightning, 16GB',2012,2020],
 ['tb_nex7','tablet','Electronics Mall','Google Nexus 7',199,1,1,4,'7" HD, Android Jelly Bean',2012,2014],
 ['tb_air1','tablet','Apple Store','iPad Air',499,3,2,6,'9.7" Retina, A7 chip, slim body',2013,2016],
 ['tb_pro97','tablet','Apple Store','iPad Pro 9.7"',599,4,3,6,'True Tone display, Apple Pencil support',2016,2018],
 ['tb_a9','tablet','Samsung Store','Galaxy Tab A9+',220,1,0,5,'11" 90Hz, 64GB',2023,9999],
 ['tb_s10','tablet','Samsung Store','Galaxy Tab S10 Ultra',1199,5,2,6,'14.6" AMOLED, S Pen',2024,9999],
 ['tb_ipad','tablet','Apple Store','iPad (11-inch)',349,2,1,6,'A16 chip, 128GB',2022,9999],
 ['tb_air','tablet','Apple Store','iPad Air 11" M3',599,3,1,6,'M3 chip, 128GB',2025,9999],
 ['tb_pro','tablet','Apple Store','iPad Pro 13" M5',1299,5,3,7,'M5 chip, tandem OLED, 256GB',2025,9999],
 ['tv_crt','tv','Electronics Mall','27" CRT TV',250,1,1,10,'27", 4:3, standard definition',2007,2009],
 ['tv_lcd32','tv','Electronics Mall','Samsung 32" LCD',599,2,1,8,'32", 720p, 60Hz',2007,2011],
 ['tv_pl42','tv','Electronics Mall','Panasonic 42" Plasma',1199,3,2,8,'42", plasma, 720p',2007,2011],
 ['tv_bravia','tv','Samsung Store','Sony Bravia 46" LCD',1799,4,2,8,'46", 1080p, 120Hz',2007,2012],
 ['tv_led','tv','Samsung Store','Samsung 46" LED 3D',1299,4,2,9,'46", LED backlight, 240Hz, 3D ready',2009,2014],
 ['tv_smart','tv','Electronics Mall','Smart TV 50" 1080p',649,3,2,8,'50", apps and WiFi',2012,2018],
 ['tv_4k','tv','LG Store','LG 55" 4K UHD',999,4,2,9,'55", 4K, webOS',2014,2019],
 ['tv_oled17','tv','LG Store','LG OLED55 B7',1999,5,3,9,'55", OLED, HDR, Dolby Vision',2017,2020],
 ['tv_sony85','tv','Electronics Mall','Sony Bravia 85" 8K Smart TV',3200,5,2,6,'85", 8K, Google TV',2019,9999],
 ['tv_s43','tv','Samsung Store','Samsung 43" Crystal 4K',320,2,1,7,'43", 4K, 60Hz',2020,9999],
 ['tv_tcl','tv','Electronics Mall','TCL 65" QLED 4K',550,3,1,7,'65", QLED, 120Hz',2020,9999],
 ['tv_s95','tv','Samsung Store','Samsung S95 77" OLED',3500,6,3,9,'77", QD-OLED, 144Hz',2024,9999],
 ['tv_lg55','tv','LG Store','LG 55" OLED B5',1100,4,2,8,'55", OLED, 120Hz, webOS',2025,9999],
 ['tv_c5','tv','LG Store','LG C5 65" OLED evo',1700,5,2,9,'65", OLED evo, Dolby Vision',2025,9999],
 ['cn_ds','console','Nintendo Store','Nintendo DS Lite',130,3,3,6,'Dual screens, touch, Pokemon',2007,2011],
 ['cn_psp','console','PlayStation Direct','Sony PSP',170,3,3,6,'Handheld, UMD discs',2007,2013],
 ['cn_wii','console','Nintendo Store','Nintendo Wii',250,4,4,7,'Motion controls, Wii Sports',2007,2013],
 ['cn_360','console','Microsoft Store','Xbox 360',280,4,4,7,'Xbox Live, HD gaming',2007,2013],
 ['cn_ps3','console','PlayStation Direct','PlayStation 3',400,4,4,8,'Blu-ray, 80GB HDD',2007,2016],
 ['cn_3ds','console','Nintendo Store','Nintendo 3DS',250,3,3,6,'Glasses-free 3D handheld',2011,2018],
 ['cn_wiiu','console','Nintendo Store','Nintendo Wii U',299,3,3,6,'Tablet-style GamePad',2012,2016],
 ['cn_ps4','console','PlayStation Direct','PlayStation 4',399,4,4,7,'500GB HDD, 1080p gaming',2013,2020],
 ['cn_xb1','console','Microsoft Store','Xbox One',499,4,4,7,'Kinect, 500GB, TV integration',2013,2020],
 ['cn_sw1','console','Nintendo Store','Nintendo Switch',299,5,4,7,'Handheld and docked, Zelda',2017,2024],
 ['cn_ps5','console','PlayStation Direct','PlayStation 5 Slim',500,4,3,7,'1TB SSD, 4K 120fps',2020,9999],
 ['cn_xbox','console','Microsoft Store','Xbox Series X',500,4,3,7,'1TB SSD, 4K 120fps',2020,9999],
 ['cn_ps5p','console','PlayStation Direct','PlayStation 5 Pro',700,5,3,7,'2TB SSD, enhanced ray tracing',2024,9999],
 ['cn_sw2','console','Nintendo Store','Nintendo Switch 2',450,4,3,6,'Handheld and docked, 256GB',2025,9999],
 ['c_uni','fashion','Uniqlo','Uniqlo Essentials Wardrobe',120,1,1,2,'Basics and layers',0,9999],
 ['c_zara','fashion','Zara / Retail','Zara Everyday Casual Collection',350,2,1,2,'Trendy everyday outfits',0,9999],
 ['c_nike','fashion','Nike Store','Nike Tech Fleece & Air Max Set',550,3,2,2,'Sportswear and sneakers',0,9999],
 ['c_adidas','fashion','Adidas Store','Adidas Ultraboost & Tracksuit',320,3,2,3,'Running shoes and track set',0,9999],
 ['c_gucci','fashion','Luxury Outlets','Gucci Designer Suit & Accessories',2800,5,5,3,'Tailored designer look',0,9999],
 ['c_lv','fashion','Luxury Outlets','Louis Vuitton Trunk & Apparel',5400,7,7,4,'Luxury apparel and luggage',0,9999],
 ['w_casio','watch','Watch Boutique','Casio G-Shock',110,1,1,6,'Shock resistant, 200m water resistance',0,9999],
 ['w_aw0','watch','Apple Store','Apple Watch (1st gen to Series 3)',349,2,2,4,'Notifications and fitness tracking',2015,2018],
 ['w_aw1','watch','Apple Store','Apple Watch Series 4 to 9',399,3,3,5,'ECG, always-on display, fall detection',2019,2024],
 ['w_aw','watch','Apple Store','Apple Watch Series 11',399,3,3,5,'Health sensors, always-on display',2025,9999],
 ['w_omega','watch','Watch Boutique','Omega Seamaster',6200,7,8,20,'Swiss automatic dive watch',0,9999]
);



function catalog(){
  const y=gameYear(), pr=S.pr||1, nom=Math.max(1,pr), out=[];
  PH.concat(futurePhones(y)).forEach(r=>{
    const d=y-r[2]; if (d<0||d>10) return;
    const f=d<=4?Math.max(.4,1-.2*d):Math.max(.1,.4-.05*(d-4)), used=d>=5, life=r[6];
    const dec=1-.12*Math.min(d,8), start=Math.min(d,life-1), tag=used?'Second-hand. ':d>=2?'Refurbished. ':'';
    out.push({key:'ph_'+r[0]+'_'+r[1].replace(/\W/g,''),cat:'phone',grp:r[0],store:r[0]==='apple'?'Apple Store':r[0]==='samsung'?'Samsung Store':'Electronics Mall',model:r[1],
      cost:Math.round(r[3]*nom*f),hap:Math.max(1,Math.round(r[4]*dec)),soc:Math.round(r[5]*dec),hp:0,life,spec:tag+r[7],d,yrs:d,start,sto:stOpts(r[2],r[8])});
  });
  STATIC.forEach(r=>{
    if (y<r[9]||y>r[10]) return;
    const sc=(NOMINAL_CATS.includes(r[1])||r[0].startsWith('w_aw'))?nom:pr, yrs=r[9]>0?Math.max(0,y-r[9]):0;
    out.push({key:r[0],cat:r[1],store:r[2],model:r[3],cost:Math.round(r[4]*sc),hap:r[5],soc:r[6],hp:0,life:r[7],spec:r[8],d:0,yrs:0,start:0});
  });
  APPL.forEach(r=>r[5].forEach((m,i)=>{ const fr=(APF[r[0]]||[2007,2007,2007])[i]; if (y<fr) return;
    out.push({key:`ap_${r[0]}_${i}`,cat:'appliance',type:r[0],tier:i,store:'Home Appliances',model:m[0],cost:Math.round(m[1]*pr),spec:m[2],
      hap:r[3]?[2,3,5][i]:[1,1,2][i],hp:r[4]?[0,1,2][i]:0,soc:0,life:Math.round(r[2]*[.8,1,1.3][i]),d:0,yrs:0,start:0}); }));
  return out;
}
const stLabel = gb => gb>=1024?'1 TB':gb+' GB';
function itemCard(it){
  const adult=S.age>=18, insurable=it.cat!=='fashion', p=shopPrice(it,0);
  const sel=it.cat==='phone'?`<select id="st_${it.key}" data-ui-style="ui-027">${it.sto.map(([gb,add],j)=>`<option value="${j}">${stLabel(gb)} · ${money(shopPrice(it,add))}</option>`).join('')}</select>`:'';
  return `<div data-ui-style="ui-018">
    <b>${it.model}</b> <span class="muted">(${it.store})</span><br>
    <span class="muted" data-ui-style="ui-026">${it.spec}</span><br>
    <span data-ui-style="ui-028">${p<it.cost?`<s class="muted">${money(it.cost)}</s> `:''}<b>${it.cat==='phone'?'from ':''}${money(p)}</b></span>
    <span class="muted" data-ui-style="ui-029"> · lasts about ${it.life} yrs · Happiness +${it.hap}${it.soc?', Social +'+it.soc:''}${it.hp?', Health +'+it.hp:''}${it.yrs?' · '+it.yrs+'-year-old model':''}</span>
    ${sel}
    ${insurable?`<label class="muted" data-ui-style="ui-030"><input type="checkbox" id="in_${it.key}"> Insurance (about ${money(p*.07)}/yr, cheap repairs)</label>`:''}
    <div class="acts acts3" data-ui-style="ui-012">
      <button class="btn" onclick="buyItem('${it.key}','cash')">Pay cash</button>
      <button class="btn" ${adult?'':'disabled'} onclick="buyItem('${it.key}','inst')">3 yrs +15%</button>
      <button class="btn" ${adult?'':'disabled'} onclick="buyItem('${it.key}','inst5')">5 yrs +30%</button></div></div>`;
}
function buyItem(key, method){
  const it=catalog().find(x=>x.key===key); if (!it) return hint('That model is no longer sold.');
  const portable=PORTABLE.includes(it.cat);
  let add=0, st=null;
  if (it.cat==='phone'){ const sel=$('st_'+key), i=sel?Number(sel.value):0, o=it.sto[i]||it.sto[0]; add=o[1]; st=o[0]; }
  const total=shopPrice(it,add), home=portable?null:targetHome();
  if (!portable && !home) return hint('You need a home to install this in.');
  if (method==='cash'){
    if (S.wealth<0 || S.wealth<total) return hint('Not enough cash.');
    S.wealth-=total; log(`Bought ${it.model} for ${money(total)}.`);
  } else {
    const pl=PLANS[method]; if (S.age<18) return hint('Installment plans need adult credit.');
    const bal=Math.round(total*(1+pl.rate)), pmt=Math.ceil(bal/pl.years);
    if (creditLimit()<pmt) return hint('The bank declined installment credit.');
    S.shopLoans.push({item:it.model,bal,pmt}); log(`Financed ${it.model} over ${pl.years} years (${money(pmt)}/yr).`);
  }
  const chk=$('in_'+key), insured=!!(chk&&chk.checked&&it.cat!=='fashion');
  S.inventory.push({uid:'u'+(S.uidN++),key:it.key,cat:it.cat,type:it.type||it.cat,model:it.model,price:total,age:it.start||0,life:it.life,hap:it.hap,hp:it.hp,soc:it.soc,tier:it.tier==null?1:it.tier,homeId:home,broken:false,insured,storage:st,portable});
  fx({happiness:it.hap*2, social:it.soc*2}); hint(); render();
}

let activeCarTab='new';
function viewShop(){
  const subs=[['apple','Apple'],['samsung','Samsung'],['other','Other phones'],['laptop','Laptops & Tablets'],['tv','TV & Gaming'],['appliance','Appliances'],['furnish','Furnishing'],['cars','Vehicles'],['fashion','Fashion'],['mine','My Items']];
  if (!subs.some(x=>x[0]===activeShopTab)) activeShopTab='apple';
  const nav=`<div class="sub-tabs">${subs.map(([id,l])=>`<button class="sub-tab ${activeShopTab===id?'on':''}" onclick="activeShopTab='${id}';render();">${l}</button>`).join('')}</div>`;
  const pr=S.promo?`<p data-ui-style="ui-031">${S.promo.label}: ${Math.round(S.promo.pct*100)}% off ${S.promo.cats[0]==='all'?'everything':'selected items'} this year.</p>`:'';
  const head=`<section class="card"><h3>Shopping Mall & Stores</h3><p class="muted" data-ui-style="ui-032">It is ${gameYear()}. Prices are ${Math.round((S.cpi-1)*100)}% higher than in 2007.</p>${pr}${nav}</section>`;
  if (activeShopTab==='furnish') return head+viewFurnish();
  if (activeShopTab==='mine') return head+viewMine();
  if (activeShopTab==='cars') return head+viewCars();
  const all=catalog(); let body='';
  if (['apple','samsung','other'].includes(activeShopTab)){
    const ph=all.filter(i=>i.cat==='phone'&&i.grp===activeShopTab);
    for (let d=0; d<5; d++){ const list=ph.filter(i=>i.d===d); if (!list.length) continue;
      body+=`<details ${d===0?'open':''}><summary>${d===0?'Newest generation':d+(d===1?' year old':' years old')+', discounted'}</summary>${list.map(itemCard).join('')}</details>`; }
    const old=ph.filter(i=>i.d>=5); if (old.length) body+=`<details><summary>Second-hand and collector models</summary>${old.map(itemCard).join('')}</details>`;
    if (!body) body='<p class="muted">Nothing from this brand is on sale this year.</p>';
  } else if (activeShopTab==='laptop') body=all.filter(i=>i.cat==='laptop'||i.cat==='tablet').map(itemCard).join('');
  else if (activeShopTab==='tv') body=placeSelector()+all.filter(i=>i.cat==='tv'||i.cat==='console').map(itemCard).join('');
  else if (activeShopTab==='fashion') body=all.filter(i=>i.cat==='fashion'||i.cat==='watch').map(itemCard).join('');
  else {
    const chips=`<div class="sub-tabs">${APPL.map(r=>`<button class="sub-tab ${activeAppType===r[0]?'on':''}" onclick="activeAppType='${r[0]}';render();">${r[1]}</button>`).join('')}</div>`;
    const list=all.filter(i=>i.cat==='appliance'&&i.type===activeAppType);
    body=chips+placeSelector()+(list.length?list.map(itemCard).join(''):'<p class="muted">This product does not exist yet.</p>');
  }
  return head+`<section class="card">${body}</section>`;
}

/* ---------- 7.5 Cars: showroom, used lot, rentals, insurance, garage, mods ---------- */













const carM = c => CARS.find(m=>m[0]===c.mid)||CARS[3];
const fuelsFor=(m,y)=>{ if (m[12]) return ['e']; if (m[0]==='prius') return ['h']; return m[11]&&y>=m[11]?['g','h']:['g']; };

const msrpOf=(m,y,fuel,trim)=>Math.round(m[4]*prOf(y,S)*TRIMS[trim].m*(fuel==='h'&&m[0]!=='prius'?1.12:1));
function carStats(c){
  const m=carM(c); let hap=(c.hap!=null&&c.legacy)?c.hap:m[6], soc=(c.soc!=null&&c.legacy)?c.soc:m[7], saf=0, insMod=0;
  if (!c.legacy){
    hap+=TRIMS[c.trim].hap+INTS[c.int][2]; soc+=TRIMS[c.trim].soc+INTS[c.int][3]+(COLORS[c.color]&&COLORS[c.color][2]>=900?1:0);
    c.opts.forEach(id=>{ const o=OPTS.find(x=>x[0]===id); if (o){ hap+=o[3]; soc+=o[4]; saf+=o[5]; } });
    c.mods.forEach(id=>{ const o=MODS.find(x=>x[0]===id); if (o){ hap+=o[3]; soc+=o[4]; insMod+=o[5]; } });
  }
  return {hap:Math.min(10,hap),soc:Math.min(10,soc),saf,insMod,mpg:c.fuel==='h'&&m[0]!=='prius'?m[5]*1.4:m[5]};
}
function carValue(c){
  const a=Math.min(c.age,DEP.length-1); let v=c.msrp*DEP[a]*(c.fuel==='e'?.93:1);
  v*=Math.max(.6,1-Math.max(0,c.miles-12000*c.age)/200000); v*=.6+.4*(c.cond/100); if (c.acc) v*=.88;
  v+= (c.modCost||0)*.25; return Math.max(Math.round(300*(S.pr||1)),Math.round(v));
}
const carsEquity=()=>S.cars?S.cars.reduce((a,c)=>a+(c.lease?0:carValue(c)),0):0;
function carIns(c){
  const st=carStats(c), val=carValue(c), young=S.age<21?1.9:S.age<25?1.45:S.age>=70?1.25:1;
  let p=(val*.032+420*S.pr)*(c.cls==='sport'||c.cls==='exec'?1.5:c.cls==='lux'?1.2:1)*young*(1+st.insMod)*(1-Math.min(.15,st.saf*.03))*(1+.2*(S.dp||0));
  return Math.round(c.ins==='liab'?p*.45:p);
}
const activeVehicle=()=>S.cars.find(c=>!c.broken) || (S.rental?{rental:true}:null);
function hasCar(){ return !!activeVehicle(); }
const autoRate=()=>Math.max(.03,(S.mortRate||.05)+.02);
const kwh=y=>.106+.0034*(y-2007);
let CFG={mid:null,fuel:'g',trim:0,color:0,int:0,intc:0,opts:[]};
function cfgModels(){ const y=gameYear(); return CARS.filter(m=>y>=m[9]&&y<=m[10]); }
function cfgFix(){
  const ms=cfgModels(); if (!ms.length) return null;
  let m=ms.find(x=>x[0]===CFG.mid); if (!m){ m=ms.find(x=>x[0]==='corolla')||ms[0]; CFG.mid=m[0]; CFG.opts=[]; }
  const fs=fuelsFor(m,gameYear()); if (!fs.includes(CFG.fuel)) CFG.fuel=fs[0];
  CFG.opts=CFG.opts.filter(id=>{ const o=OPTS.find(x=>x[0]===id); return o&&gameYear()>=o[6]&&gameYear()<=o[7]; });
  return m;
}
function cfgCalc(){
  const m=cfgFix(); if (!m) return null; const y=gameYear(), pr=S.pr;
  const base=msrpOf(m,y,CFG.fuel,CFG.trim), cadd=Math.round(COLORS[CFG.color][2]*pr), iadd=Math.round(INTS[CFG.int][1]*pr);
  const oadd=CFG.opts.reduce((a,id)=>a+Math.round(OPTS.find(x=>x[0]===id)[2]*pr),0);
  const msrp=base+cadd+iadd+oadd, fees=Math.round(msrp*.07+400*pr);
  return {m,base,cadd,iadd,oadd,msrp,fees,total:msrp+fees};
}
function cfgSet(k,v){ if (k==='opt'){ const i=CFG.opts.indexOf(v); if (i>=0) CFG.opts.splice(i,1); else CFG.opts.push(v); } else { CFG[k]=(k==='mid'||k==='fuel')?v:Number(v); if (k==='mid') CFG.opts=[]; } render(); }
function carSvg(hex,cls){
  const tall=cls==='suv'||cls==='truck', roofY=tall?10:16;
  return `<svg viewBox="0 0 240 100" width="100%" data-ui-style="ui-033"><ellipse cx="120" cy="86" rx="100" ry="5" fill="#000" opacity=".35"/>
    <path d="M12 68 Q10 52 36 47 L68 ${roofY+10} Q78 ${roofY} 102 ${roofY} L152 ${roofY} Q172 ${roofY+2} 184 44 L214 50 Q230 54 230 68 Z" fill="${hex}" stroke="#000" stroke-opacity=".35"/>
    <path d="M80 ${roofY+10} L102 ${roofY+4} L120 ${roofY+4} L120 44 L66 44Z M128 ${roofY+4} L150 ${roofY+4} Q166 ${roofY+6} 174 44 L128 44Z" fill="#aad4ee" opacity=".85"/>
    <circle cx="62" cy="70" r="15" fill="#15151b"/><circle cx="62" cy="70" r="7" fill="#9a9aa8"/><circle cx="178" cy="70" r="15" fill="#15151b"/><circle cx="178" cy="70" r="7" fill="#9a9aa8"/></svg>`;
}
function makeCar(src,extra){
  const c=Object.assign({uid:'c'+Math.random().toString(36).slice(2,8),opts:[],mods:[],modCost:0,miles:0,cond:100,age:0,acc:false,ins:'liab',broken:false,fix:0,warr:0,lemon:false,seller:'dealer',intc:0},src,extra||{});
  return c;
}
function financeCar(name,price,method){   // returns false (and shows a hint) if it cannot be done
  if (method==='cash'){ if (S.wealth<price){ hint('Not enough cash.'); return false; } S.wealth-=price; return true; }
  if (S.age<18){ hint('Loans need adult credit.'); return false; }
  const yrs=method==='loan7'?7:5, down=Math.round(price*.1), fin=price-down, r=autoRate(), bal=Math.round(fin*(1+r*yrs*.55)), pmt=Math.ceil(bal/yrs);
  if (S.wealth<down){ hint(`You need a ${money(down)} down payment.`); return false; }
  if (creditLimit()<pmt){ hint('The bank declined the car loan.'); return false; }
  S.wealth-=down; S.shopLoans.push({item:name,bal,pmt}); log(`Financed ${name}: ${money(down)} down, ${yrs} years at ${(r*100).toFixed(1)}% (${money(pmt)}/yr).`); return true;
}
function buyNewCar(method){
  if (S.age<18) return hint('You need a driving licence (18+).');
  if (S.cars.length>=3) return hint('Your garage is full. Sell a car first.');
  const k=cfgCalc(); if (!k) return hint('No cars available.'); const m=k.m, y=gameYear(), name=`${y} ${m[1]} ${m[2]}`;
  if (method==='lease'){
    const pmt=Math.round(k.msrp*.21); if (creditLimit()<pmt) return hint('The lender declined the lease.');
    S.cars.push(makeCar({mid:m[0],make:m[1],name:m[2],cls:m[3],year:y,fuel:CFG.fuel,trim:CFG.trim,color:CFG.color,int:CFG.int,intc:CFG.intc,opts:CFG.opts.slice(),msrp:k.msrp,paid:0,life:m[8],ins:'full',lease:{left:3,pmt}}));
    log(`Leased a ${name} for 3 years at ${money(pmt)}/yr.`);
  } else {
    if (!financeCar(name,k.total,method)) return;
    S.cars.push(makeCar({mid:m[0],make:m[1],name:m[2],cls:m[3],year:y,fuel:CFG.fuel,trim:CFG.trim,color:CFG.color,int:CFG.int,intc:CFG.intc,opts:CFG.opts.slice(),msrp:k.msrp,paid:k.total,life:m[8],ins:'full',warr:3}));
    log(`Bought a new ${name} for ${money(k.total)} including taxes and fees.`);
  }
  const st=carStats(S.cars[S.cars.length-1]); fx({happiness:st.hap*2,social:st.soc*2}); hint(); activeCarTab='garage'; render();
}
function inspectCar(uid){ const c=S.lot&&S.lot.find(x=>x.uid===uid); if (!c) return; if (S.wealth<Math.round(150*S.pr)) return hint('Not enough cash for the inspection.'); S.wealth-=Math.round(150*S.pr); c.insp=true; hint(); render(); }
function buyUsedCar(uid,method){
  if (S.age<18) return hint('You need a driving licence (18+).');
  if (S.cars.length>=3) return hint('Your garage is full. Sell a car first.');
  const c=S.lot.find(x=>x.uid===uid); if (!c) return;
  const w=$('wr_'+uid), wp=(w&&w.checked)?Math.round(c.price*.06):0, total=c.price+wp;
  if (!financeCar(`${c.year} ${c.make} ${c.name}`,total,method)) return;
  const car=makeCar(c,{paid:total,warr:wp?2:0,ins:method==='cash'?'liab':'full'}); delete car.price; delete car.insp;
  S.cars.push(car); S.lot=S.lot.filter(x=>x.uid!==uid);
  log(`Bought a used ${c.year} ${c.make} ${c.name} (${c.miles.toLocaleString()} miles) for ${money(total)}.`); fx({happiness:2}); hint(); activeCarTab='garage'; render();
}
function genLot(){
  const y=gameYear(), out=[]; let tries=0;
  while (out.length<10 && tries++<300){
    const age=2+rnd(11), my=y-age, pool=CARS.filter(m=>m[9]<=my&&my<=m[10]); if (!pool.length) continue;
    const m=pick(pool), fuel=pick(fuelsFor(m,my)), trim=rnd(3), seller=Math.random()<.35?'private':'dealer';
    const c=makeCar({mid:m[0],make:m[1],name:m[2],cls:m[3],year:my,fuel,trim,color:rnd(6),int:rnd(2),intc:rnd(4),msrp:msrpOf(m,my,fuel,trim),miles:Math.round(age*(9000+rnd(6000))),
      cond:Math.max(25,Math.round(92-age*2.6-rnd(14))),age,acc:Math.random()<.22,lemon:Math.random()<(seller==='private'?.2:.1),seller,life:m[8]});
    c.price=Math.round(carValue(c)*(seller==='dealer'?1.1:.93)); c.insp=false; out.push(c);
  }
  return out.sort((a,b)=>a.price-b.price);
}
function sellCar(uid){
  const c=S.cars.find(x=>x.uid===uid); if (!c) return;
  if (c.lease) return hint('A leased car cannot be sold. Return it or buy it out.');
  const v=Math.round(carValue(c)*.85); S.wealth+=v; S.cars=S.cars.filter(x=>x!==c); log(`Sold your ${c.year} ${c.make} ${c.name} for ${money(v)}.`); hint(); render();
}
function leaseBuyout(uid){ const c=S.cars.find(x=>x.uid===uid); if (!c||!c.lease) return; const v=Math.round(carValue(c)*1.05); if (S.wealth<v) return hint('Not enough cash.'); S.wealth-=v; c.paid=v; c.lease=null; log(`You bought out the lease on your ${c.name} for ${money(v)}.`); hint(); render(); }
function leaseReturn(uid){ const c=S.cars.find(x=>x.uid===uid); if (!c||!c.lease) return; const pen=Math.round(c.lease.pmt*c.lease.left*.4); if (S.wealth<pen) return hint('Not enough cash for the early return fee.'); S.wealth-=pen; S.cars=S.cars.filter(x=>x!==c); log(`Returned the leased ${c.name} early. Fee: ${money(pen)}.`); hint(); render(); }
function setCarIns(uid,v){ const c=S.cars.find(x=>x.uid===uid); if (!c) return; if (c.lease&&v==='liab') return hint('Leased cars need full cover.'); c.ins=v; render(); }
function repairCar(uid){ const c=S.cars.find(x=>x.uid===uid); if (!c||!c.broken) return; if (S.wealth<c.fix) return hint('Not enough cash.'); S.wealth-=c.fix; c.broken=false; c.cond=clamp(c.cond+10); log(`Repaired your ${c.name} for ${money(c.fix)}.`); c.fix=0; hint(); render(); }
function modCar(uid,id){
  const c=S.cars.find(x=>x.uid===uid), o=MODS.find(x=>x[0]===id); if (!c||!o) return;
  if (c.lease) return hint('You cannot modify a leased car.');
  const p=Math.round(o[2]*S.pr); if (S.wealth<p) return hint('Not enough cash.');
  S.wealth-=p; c.mods.push(id); c.modCost=(c.modCost||0)+p; if (WRAP[id]) c.color=WRAP[id][0];
  log(`Fitted ${o[1].toLowerCase()} to your ${c.name} for ${money(p)}.`); fx({happiness:o[3]*2,social:o[4]*2}); hint(); render();
}
function rentCar(k){ if (S.age<18) return hint('You need a driving licence (18+).'); if (S.cars.some(c=>!c.broken)) return hint('You already own a working car.'); S.rental={cls:k}; log(`Started renting a ${RENTALS[k][0].toLowerCase()}.`); hint(); render(); }
function endRental(){ S.rental=null; if (S.transport==='car'&&!hasCar()) S.transport='bus'; log('Ended your car rental.'); render(); }
function setTransport(k){
  if (k==='car' && !hasCar()) return hint('You need a car first. Buy, lease or rent one in Shopping > Vehicles.');
  S.transport=k; hint(); render();
}

function viewCars(){
  if (S.age<18) return '<section class="card"><h3>Vehicles</h3><p class="muted">You need to be 18 to get a driving licence. Until then, ask your parents for rides.</p></section>';
  if (!S.lot||!S.lot.length) S.lot=genLot();
  const tabs=[['new','New cars'],['used','Used cars'],['rent','Rent a car'],['garage','My garage ('+S.cars.length+')']];
  const nav=`<div class="sub-tabs" data-ui-style="ui-034">${tabs.map(([id,l])=>`<button class="sub-tab ${activeCarTab===id?'on':''}" onclick="activeCarTab='${id}';render();">${l}</button>`).join('')}</div>`;
  let body='';
  if (activeCarTab==='new') body=viewNewCars();
  else if (activeCarTab==='used') body=viewUsedCars();
  else if (activeCarTab==='rent') body=viewRent();
  else body=viewGarage();
  return `<section class="card"><h3>Car dealership</h3><p class="muted" data-ui-style="ui-017">Gas is $${S.gas.toFixed(2)} a gallon this year. New cars come with 3 years of warranty. You must carry insurance on any car you own.</p>${nav}</section>${body}`;
}
function viewNewCars(){
  const k=cfgCalc(); if (!k) return '<section class="card"><p class="muted">No cars on sale.</p></section>';
  const m=k.m, y=gameYear(), fs=fuelsFor(m,y), pr=S.pr, st=carStats({...makeCar({mid:m[0],fuel:CFG.fuel,trim:CFG.trim,int:CFG.int,color:CFG.color,opts:CFG.opts})});
  const groups=Object.keys(CLS).map(cl=>{ const l=cfgModels().filter(x=>x[3]===cl); return l.length?`<optgroup label="${CLS[cl]}">${l.map(x=>`<option value="${x[0]}" ${x[0]===m[0]?'selected':''}>${x[1]} ${x[2]} · from ${money(msrpOf(x,y,fuelsFor(x,y)[0],0))}</option>`).join('')}</optgroup>`:''; }).join('');
  const mpg=st.mpg, run = CFG.fuel==='e'?`${Math.round(mpg)} MPGe · about ${money(11000*(33.7/mpg)*kwh(y))}/yr to charge`:`${Math.round(mpg)} mpg · about ${money(11000/mpg*S.gas)}/yr in fuel`;
  const fuelBtns=fs.map(f=>`<button class="btn ${CFG.fuel===f?'sel':''}" data-ui-style="ui-035" onclick="cfgSet('fuel','${f}')">${FUELN[f]}</button>`).join('');
  const trimBtns=TRIMS.map((t,i)=>`<button class="btn ${CFG.trim===i?'sel':''}" data-ui-style="ui-035" onclick="cfgSet('trim',${i})">${t.n}<small>${i?'+'+Math.round((t.m-1)*100)+'%':'standard'}</small></button>`).join('');
  const cols=COLORS.map((c,i)=>`<button title="${c[0]}${c[2]?' +'+money(c[2]*pr):''}" onclick="cfgSet('color',${i})" class="p15-paint-swatch ${CFG.color===i?'selected':''}" data-paint-index="${i}"></button>`).join('');
  const opts=OPTS.filter(o=>y>=o[6]&&y<=o[7]).map(o=>`<label class="muted" data-ui-style="ui-036"><input type="checkbox" ${CFG.opts.includes(o[0])?'checked':''} onchange="cfgSet('opt','${o[0]}')"> ${o[1]} · ${money(o[2]*pr)}</label>`).join('');
  const lp=Math.round(k.msrp*.21);
  return `<section class="card"><h3>${y} ${m[1]} ${m[2]}</h3>${carSvg(COLORS[CFG.color][1],m[3])}
    <select data-ui-style="ui-037" onchange="cfgSet('mid',this.value)">${groups}</select>
    <p class="muted" data-ui-style="ui-038">${CLS[m[3]]} · ${run} · Happiness +${st.hap}, Social +${st.soc}${st.saf?', Safety +'+st.saf:''}</p>
    <b data-ui-style="ui-017">Engine</b><div class="acts" data-ui-style="ui-034">${fuelBtns}</div>
    <b data-ui-style="ui-039">Trim</b><div class="acts acts3" data-ui-style="ui-034">${trimBtns}</div>
    <b data-ui-style="ui-039">Paint: ${COLORS[CFG.color][0]}</b><div data-ui-style="ui-040">${cols}</div>
    <b data-ui-style="ui-039">Interior</b>
    <select data-ui-style="ui-041" onchange="cfgSet('int',this.value)">${INTS.map((o,i)=>`<option value="${i}" ${CFG.int===i?'selected':''}>${o[0]}${o[1]?' · +'+money(o[1]*pr):''}</option>`).join('')}</select>
    <select data-ui-style="ui-042" onchange="cfgSet('intc',this.value)">${INTC.map((n,i)=>`<option value="${i}" ${CFG.intc===i?'selected':''}>${n} interior</option>`).join('')}</select>
    <b data-ui-style="ui-039">Options</b>${opts}
    <div data-ui-style="ui-011"><div class="row"><span>Price with options</span><b class="mono">${money(k.msrp)}</b></div><div class="row"><span>Tax, registration, fees</span><b class="mono">${money(k.fees)}</b></div><div class="row"><span>On-the-road price</span><b class="mono">${money(k.total)}</b></div></div>
    <div class="acts" data-ui-style="ui-019"><button class="btn" onclick="buyNewCar('cash')">Pay cash</button><button class="btn" onclick="buyNewCar('loan5')">Loan 5 yrs<small>10% down</small></button>
    <button class="btn" onclick="buyNewCar('loan7')">Loan 7 yrs<small>10% down</small></button><button class="btn" onclick="buyNewCar('lease')">Lease 3 yrs<small>${money(lp)}/yr</small></button></div></section>`;
}
function viewUsedCars(){
  if (!S.lot||!S.lot.length) S.lot=genLot();
  const cards=S.lot.map(c=>{
    return `<div data-ui-style="ui-018"><div data-ui-style="ui-043"><div data-ui-style="ui-044">${carSvg(COLORS[c.color][1],c.cls)}</div>
      <div><b>${c.year} ${c.make} ${c.name}</b> <span class="muted">${TRIMS[c.trim].n}, ${FUELN[c.fuel]}</span><br><span class="muted" data-ui-style="ui-026">${c.miles.toLocaleString()} miles · ${COLORS[c.color][0]} · ${INTS[c.int][0].toLowerCase()} · ${c.seller==='dealer'?'Dealership':'Private seller'}</span></div></div>
      <div data-ui-style="ui-012">${bar('Condition',c.cond,'var(--cyan)')}</div>
      <p class="p15-inspection ${!c.insp?'text-muted':(c.acc||c.lemon)?'text-amber':'text-mint'}">${c.insp?`Inspection: ${c.acc?'previous accident on record. ':''}${c.lemon?'hidden mechanical problems found. ':''}${!c.acc&&!c.lemon?'clean bill of health.':''}`:'Not inspected. History unknown.'}</p>
      <div class="row" data-ui-style="ui-045"><span>Price</span><b class="mono">${money(c.price)}</b></div>
      <label class="muted" data-ui-style="ui-046"><input type="checkbox" id="wr_${c.uid}"> 2-year warranty (+${money(c.price*.06)})</label>
      <div class="acts acts3" data-ui-style="ui-012"><button class="btn" ${c.insp?'disabled':''} onclick="inspectCar('${c.uid}')">Inspect ${money(150*S.pr)}</button><button class="btn" onclick="buyUsedCar('${c.uid}','cash')">Pay cash</button><button class="btn" onclick="buyUsedCar('${c.uid}','loan5')">Loan 5 yrs</button></div></div>`; }).join('');
  return `<section class="card"><h3>Used cars</h3><p class="muted" data-ui-style="ui-017">The lot refreshes every year. Used cars lose less value, but check for hidden problems. Private sellers are cheaper and riskier.</p>${cards}</section>`;
}
function viewRent(){
  const cur=S.rental;
  const list=Object.entries(RENTALS).map(([k,r])=>`<button class="btn ${cur&&cur.cls===k?'sel':''}" onclick="rentCar('${k}')">${r[0]} · ${money(r[1]*S.pr)}/yr<small>Insurance and servicing included. Fuel is extra. Happiness +${r[2]}.</small></button>`).join('');
  return `<section class="card"><h3>Rent a car</h3><p class="muted" data-ui-style="ui-017">Can not afford to buy? Rent by the year. You never own it and nothing depreciates on you.${cur?' You are renting now.':''}</p>${list}${cur?'<button class="btn" onclick="endRental()">End rental</button>':''}</section>`;
}
function viewGarage(){
  if (!S.cars.length) return `<section class="card"><h3>My garage</h3><p class="muted">You do not own a car.${S.rental?' You are renting one.':''}</p></section>`;
  const cards=S.cars.map(c=>{
    const st=carStats(c), val=carValue(c), act=activeVehicle()===c;
    const mods=MODS.filter(o=>!c.mods.includes(o[0])&&!(WRAP[o[0]]&&c.mods.some(x=>WRAP[x]))).map(o=>`<button class="btn" onclick="modCar('${c.uid}','${o[0]}')">${o[1]}<small>${money(o[2]*S.pr)} · Happiness +${o[3]}, Social +${o[4]}${o[5]?', insurance +'+Math.round(o[5]*100)+'%':''}</small></button>`).join('');
    return `<section class="card"><h3>${c.year} ${c.make} ${c.name} ${act?'<span class="muted" data-ui-style="ui-029">· your daily car</span>':''}</h3>${carSvg(COLORS[c.color]?COLORS[c.color][1]:'#888',c.cls)}
      <p class="muted" data-ui-style="ui-026">${c.legacy?'':TRIMS[c.trim].n+' · '}${FUELN[c.fuel]} · ${c.miles.toLocaleString()} miles · ${c.age} yrs old${c.warr>0?' · under warranty':''}${c.legacy?'':' · '+INTS[c.int][0].toLowerCase()+', '+INTC[c.intc].toLowerCase()}<br>
      ${c.opts.length?'Options: '+c.opts.map(id=>OPTS.find(o=>o[0]===id)[1]).join(', ')+'<br>':''}${c.mods.length?'Mods: '+c.mods.map(id=>MODS.find(o=>o[0]===id)[1]).join(', ')+'<br>':''}</p>
      ${bar('Condition',c.cond,c.cond<40?'var(--rose)':'var(--cyan)')}
      <div class="row" data-ui-style="ui-012"><span>Market value</span><b class="mono">${c.lease?'Leased':money(val)}</b></div>
      <div class="row"><span>Insurance (${c.ins==='full'?'full cover':'liability only'})</span><b class="mono">${money(carIns(c))}/yr</b></div>
      ${c.lease?`<div class="row"><span>Lease</span><b class="mono">${money(c.lease.pmt)}/yr, ${c.lease.left} yr left</b></div>`:''}
      ${c.broken?`<p data-ui-style="ui-047">Broken down. It cannot be driven until repaired.</p>`:''}
      <div class="acts" data-ui-style="ui-019">
        ${c.broken?`<button class="btn" onclick="repairCar('${c.uid}')">Repair ${money(c.fix)}</button>`:''}
        <button class="btn ${c.ins==='liab'?'sel':''}" onclick="setCarIns('${c.uid}','liab')">Liability only<small>Cheaper, your car is not covered</small></button>
        <button class="btn ${c.ins==='full'?'sel':''}" onclick="setCarIns('${c.uid}','full')">Full cover<small>Covers damage, small excess</small></button>
        ${c.lease?`<button class="btn" onclick="leaseBuyout('${c.uid}')">Buy out ${money(val*1.05)}</button><button class="btn" onclick="leaseReturn('${c.uid}')">Return early</button>`:`<button class="btn" onclick="sellCar('${c.uid}')">Sell for ${money(val*.85)}</button>`}
      </div>
      ${!c.lease?`<details><summary>Modify this car</summary>${mods||'<p class="muted">Everything is fitted.</p>'}</details>`:''}</section>`;
  }).join('');
  return cards;
}

/* Yearly car costs, wear, breakdowns, accidents. ad(name, amount) adds a bill. */
function carsYear(ad){
  const act=activeVehicle(), driving=S.transport==='car', y=gameYear(), pr=S.pr, danger=S.age<25?1.6:1;
  S.cars.slice().forEach(c=>{
    c.age++; const main=act===c, mi=main&&driving?11000:main?3000:1500; c.miles+=mi; c.cond=clamp(c.cond-2.5-(c.age>8?1.5:0)-(c.mods.includes('tune')?1:0));
    const st=carStats(c), val=carValue(c);
    if (c.lease){ ad('leasePayment',c.lease.pmt); c.lease.left--; if (c.lease.left<=0){ log(`Your lease on the ${c.name} ended and the car was returned.`); S.cars=S.cars.filter(x=>x!==c); return; } }
    ad('carInsurance',carIns(c)); ad('carMaintenance',CSERV[c.cls]*pr*(1+.05*c.age)*(c.fuel==='e'?.6:1)); ad('carRegistration',120*pr+c.msrp*.004);
    if (main&&driving){ ad('fuel', c.fuel==='e'?mi*(33.7/st.mpg)*kwh(y):mi/st.mpg*S.gas); fx({happiness:Math.round(st.hap*(c.cond>=50?1:.5)),social:Math.round(st.soc*(c.cond>=50?1:.5))}); }
    if (!c.broken){
      const p=Math.min(.7,.04+.03*c.age+(c.cond<50?.1:0)+(c.lemon?.15:0));
      if (Math.random()<p){
        const cost=Math.min(val*.6,Math.round(CREP[c.cls]*pr*(.5+Math.random())*(c.fuel==='e'?.8:1)));
        if (c.age<=3||c.warr>0){ log(`Your ${c.name} had a fault, but the warranty covered the repair.`); }
        else { c.broken=true; c.fix=cost; log(`Your ${c.make} ${c.name} broke down. The repair will cost ${money(cost)}.`); }
      }
    }
    if (c.warr>0) c.warr--;
    if (main&&!c.broken&&Math.random()<.07*danger*(1-.06*st.saf)*(c.mods.length?1.1:1)){
      const dmg=Math.round(val*(.08+Math.random()*.42)), fault=Math.random()<.55, ded=Math.max(Math.round(500*pr),Math.round(val*.012));
      const pay=c.ins==='full'?Math.min(dmg,ded):dmg; ad('accidentCosts',pay); if (fault) S.dp++;
      if (Math.random()<.3) fx({health:-(2+rnd(7))});
      log(`You were in a car accident${fault?' and it was your fault':''}. Damage ${money(dmg)}, you paid ${money(pay)}${c.ins==='full'?' (insurance covered the rest)':' (liability-only cover does not pay for your own car)'}.`);
      c.cond=clamp(c.cond-10); if (!c.ins||c.ins==='liab') { if (dmg>val*.45){ log(`Your ${c.name} was written off.`); S.cars=S.cars.filter(x=>x!==c); } }
    }
  });
  if (S.rental){
    const r=RENTALS[S.rental.cls]; ad('carRental',r[1]*pr);
    if (driving){ const mi=11000; ad('fuel',mi/r[3]*S.gas); fx({happiness:r[2]}); }
  }
  if (S.dp>0) S.dp=Math.max(0,S.dp-0.5);
  if (S.transport==='car' && !activeVehicle()){ S.transport='bus'; log('You no longer have a working car, so you went back to public transport.'); }
}

/* ---------- 7.6 Family, friends, pets ---------- */
const giveAmts=()=>[100,500,2000].map(a=>Math.max(10,Math.round(a*S.pr/10)*10));

function famGive(id,amt){
  const m=S.family.find(x=>x.id===id); if (!m||S.wealth<amt) return hint('Not enough cash.');
  S.wealth-=amt; const ref=giveAmts(); m.bond=clamp(m.bond+(amt>=ref[2]?12:amt>=ref[1]?7:3)); fx({social:1,happiness:1}); log(`You gave ${money(amt)} to ${m.name}.`); hint(); render();
}
function setAllow(id,v){ const m=S.family.find(x=>x.id===id); if (!m) return; m.allow=v; render(); }
function dateNight(id){ const m=S.family.find(x=>x.id===id), c=Math.round(150*S.pr); if (!m||m.dn===S.age) return; if (S.wealth<c) return hint('Not enough cash.'); S.wealth-=c; m.dn=S.age; m.bond=clamp(m.bond+10); fx({happiness:3,social:1}); log(`A lovely evening out with ${m.name}.`); hint(); render(); }
function addFriend(){ if (S.friends.length>=8) return; const f={id:'f'+Math.random().toString(36).slice(2,7),name:pick(NAMES),age:Math.max(5,S.age+rnd(5)-2),bond:45+rnd(25),done:false,loan:0}; S.friends.push(f); return f; }
function friendAct(id,type){
  const f=S.friends.find(x=>x.id===id); if (!f||f.done) return; const cost={hang:30,gift:80,lend:500}[type]*S.pr*(S.age<18?.3:1);
  const c=Math.round(cost);
  if (type!=='hang'&&S.wealth<c) return hint('Not enough cash.'); if (type==='hang'&&S.age>=18&&S.wealth<c) return hint('Not enough cash.');
  f.done=true;
  if (type==='hang'){ if (S.age>=18) S.wealth-=c; f.bond=clamp(f.bond+8); fx({social:3,happiness:2}); log(`Hung out with ${f.name}.`); }
  else if (type==='gift'){ S.wealth-=c; f.bond=clamp(f.bond+6); fx({social:1,happiness:1}); log(`You bought ${f.name} a gift.`); }
  else { S.wealth-=c; f.loan+=c; f.bond=clamp(f.bond+4); log(`You lent ${money(c)} to ${f.name}.`); }
  hint(); render();
}
function dropFriend(id){ S.friends=S.friends.filter(f=>f.id!==id); render(); }

function adoptPet(t){ const p=PETS[t], c=Math.round(p.adopt*S.pr); if (S.pets.length>=2) return hint('Two pets is plenty.'); if (S.wealth<c) return hint('Not enough cash.'); S.wealth-=c; S.pets.push({id:'p'+Math.random().toString(36).slice(2,6),type:t,name:pick(NAMES),age:0}); log(`You adopted a ${p.n.toLowerCase()}.`); fx({happiness:6}); hint(); render(); }
function viewFamily(){
  const g=giveAmts(), kid=m=>m.role==='Child'&&m.age<18, elder=m=>(m.role==='Mother'||m.role==='Father')&&m.age>=60&&S.age>=18;
  const acts=m=>{
    if (!m.alive) return '<p class="muted">Passed away.</p>';
    const give=`<div class="acts acts3" data-ui-style="ui-012">${g.map(a=>`<button class="btn" ${S.wealth<a?'disabled':''} onclick="famGive('${m.id}',${a})">Give ${money(a)}</button>`).join('')}</div>`;
    const allow=(kid(m)||elder(m))?`<p class="muted" data-ui-style="ui-048">${kid(m)?'Allowance':'Regular support'} (${money(m.allow||0)}/yr)</p><div class="acts acts3" data-ui-style="ui-049">${ALLOW.map(a=>{ const v=Math.round(a*S.pr/10)*10; return `<button class="btn ${(m.allow||0)===v?'sel':''}" onclick="setAllow('${m.id}',${v})">${v?money(v):'None'}</button>`; }).join('')}</div>`:'';
    const dn=(m.role==='Partner'||m.role==='Spouse')?`<button class="btn" ${m.dn===S.age||S.wealth<150*S.pr?'disabled':''} onclick="dateNight('${m.id}')">Date night ${money(150*S.pr)}</button>`:'';
    return `<div class="acts">
      <button class="btn" ${m.done?'disabled':''} onclick="famAct('${m.id}','time')">Spend time</button>
      <button class="btn" ${m.done?'disabled':''} onclick="famAct('${m.id}','compliment')">Compliment</button>
      ${(m.role==='Mother'||m.role==='Father')?`<button class="btn" ${m.done||S.age>=25?'disabled':''} onclick="famAct('${m.id}','money')">Ask money</button>`:''}
      <button class="btn" ${m.done?'disabled':''} onclick="famAct('${m.id}','argue')">Argue</button>${dn}</div>${give}${allow}`;
  };
  const fam=S.family.map(m=>`<section class="card"><div data-ui-style="ui-050"><span data-ui-style="ui-051">${m.alive?memFace(m):'🕊️'}</span><div><b>${m.name}</b> <span class="muted">· ${m.role}, ${m.age}</span></div></div>${m.alive?bar('Bond',m.bond,'var(--violet)'):''}<div data-ui-style="ui-019">${acts(m)}</div></section>`).join('');
  const fr=S.friends.map(f=>`<div data-ui-style="ui-018"><b>${f.name}</b> <span class="muted">· friend, ${f.age}${f.loan?' · owes you '+money(f.loan):''}</span>${bar('Bond',f.bond,'var(--cyan)')}
    <div class="acts acts3" data-ui-style="ui-012"><button class="btn" ${f.done?'disabled':''} onclick="friendAct('${f.id}','hang')">Hang out</button><button class="btn" ${f.done?'disabled':''} onclick="friendAct('${f.id}','gift')">Gift</button><button class="btn" ${f.done||S.age<18?'disabled':''} onclick="friendAct('${f.id}','lend')">Lend ${money(500*S.pr)}</button></div>
    <button class="btn" data-ui-style="ui-052" onclick="dropFriend('${f.id}')">Drift apart</button></div>`).join('');
  const pets=S.pets.map(p=>`<div class="row"><span>${PETS[p.type].n}: ${p.name}, age ${p.age}</span><b class="mono">${money(PETS[p.type].keep*S.pr)}/yr</b></div>`).join('');
  const adopt=S.age>=18?`<div class="acts" data-ui-style="ui-019"><button class="btn" onclick="adoptPet('dog')">Adopt a dog ${money(400*S.pr)}</button><button class="btn" onclick="adoptPet('cat')">Adopt a cat ${money(150*S.pr)}</button></div>`:'';
  return `<section class="card"><h3>Family & Relationships</h3><p class="muted">One interaction per person each year. Gifts and allowances help bonds. You can ask parents for money until 25.</p></section>${fam}
    <section class="card"><h3>Friends (${S.friends.length}/8)</h3><p class="muted" data-ui-style="ui-017">Meet new friends at school, at work and through activities. Bonds fade if you ignore them.</p>${fr||'<p class="muted">No close friends yet.</p>'}</section>
    <section class="card"><h3>Pets</h3>${pets||'<p class="muted">No pets. A pet costs money but makes you happier.</p>'}${adopt}</section>`;
}

/* ---------- 7.7 Yearly world tick ---------- */
function histYear(){
  const y=gameYear(), t=HIST[y]; if (t) log(`${y}: ${t}`);
  if (y===2008 && S.famWealth>0 && Math.random()<.4){ S.famWealth--; log('Your family lost income in the crash and had to cut back.'); }
  if (y===2020){ fx({happiness:-4,social:-6}); }
  if ((y===2020||y===2021) && S.age>=18){ const c=y===2020?1200:1400; if (S.income<80000){ S.wealth+=c; log(`You received a ${money(c)} stimulus payment.`); } }
}
function packYear(){
  const adult=S.age>=18, bill=S.bill||(S.bill={}), y=gameYear(), pr=S.pr;
  const ad=(k,v)=>{ v=Math.round(v); if (!v) return; bill[k]=(bill[k]||0)+v; S.expenses+=v; S.wealth-=v; };
  if (S.econ!==S.prevEcon){ log(S.econ==='recession'?'The economy slipped into a recession. Layoffs are more likely and markets are falling.':S.econ==='boom'?'The economy is booming. Markets and house prices are climbing.':'The economy has stabilised.'); S.prevEcon=S.econ; }
  histYear();
  if (S.age>=7 && S.age<=18){
    const g=Math.max(0,Math.min(4, S.smarts/100*3.2+{hard:.6,coast:0,skip:-.9}[S.effort]+(Math.random()*.4-.2))); S.gpa=(S.gpa*S.gpaN+g)/(S.gpaN+1); S.gpaN++;
    if (S.friends.length<6 && Math.random()<.45) { const f=addFriend(); if (f) log(`You made a new friend: ${f.name}.`); }
  }
  if (S.age>=8 && S.age<18){ const pk=Math.round([150,400,1000][S.famWealth]*pr/10)*10; S.wealth+=pk; }
  if (S.age>=80 && S.health<20){ fx({happiness:-2}); log('Later life requires more attention to health, mobility and medical costs.'); }
  S.friends.forEach(f=>{ f.done=false; f.age++; f.bond=clamp(f.bond-3);
    if (f.loan>0){ if (Math.random()<.65){ S.wealth+=f.loan; log(`${f.name} paid back ${money(f.loan)}.`); f.bond=clamp(f.bond+5); } else { log(`${f.name} never repaid the ${money(f.loan)} you lent.`); f.bond=clamp(f.bond-12); } f.loan=0; } });
  if (S.age>=18){ const before=S.friends.length; S.friends=S.friends.filter(f=>f.bond>=8||Math.random()<.5); if (S.friends.length<before) log('You lost touch with an old friend.'); }
  S.pets.forEach(p=>{ p.age++; });
  S.pets=S.pets.filter(p=>true); // Pet-loss events are disabled along with death mechanics.
  if (S.age>=18) S.lot=genLot();
  if (!adult) return;

  ad('inflation', (pr-1)*((bill.phone||0)+(bill.insurance||0)+(bill.children||0)+(bill.familyContribution||0)));
  if (S.transport==='bike') fx({health:1});
  carsYear(ad);
  S.pets.forEach(p=>{ ad('petCare',PETS[p.type].keep*pr); fx({happiness:PETS[p.type].hap,health:PETS[p.type].hp,social:PETS[p.type].soc}); if (Math.random()<.15) ad('vetBills',600*pr); });
  S.family.forEach(m=>{ if (m.alive&&m.allow&&((m.role==='Child'&&m.age<18)||((m.role==='Mother'||m.role==='Father')&&m.age>=60))){ ad('familySupport',m.allow); m.bond=clamp(m.bond+3); } });

  const D=ydat(y,S);
  S.ownedHomes.forEach(h=>{ ad('maintenance',h.value*.01); h.value=Math.round(h.value*(1+D.hg)/1.03); });
  if (S.wealth<0 && S.savings>0){ const t=Math.min(S.savings,-S.wealth); S.savings-=t; S.wealth+=t; log(`Your savings covered a ${money(t)} shortfall.`); }
  const intr=Math.round(S.savings*S.saveRate); S.savings+=intr;
  const gain=Math.round(S.invest*S.mret); S.invest+=gain;
  if (intr||gain) log(`Savings earned ${money(intr)}. Investments ${gain>=0?'gained':'lost'} ${money(Math.abs(gain))} (${(S.mret*100).toFixed(1)}%).`);
  if (S.job && S.retPct>0){
    const c=Math.round(S.job.salary*S.retPct/100), m=Math.round(S.job.salary*Math.min(S.retPct,5)/200);
    ad('retirementContribution',c); S.nest+=c+m; log(`You put ${money(c)} into retirement and your employer added ${money(m)}.`);
  }
  S.nest=Math.round(S.nest*(1+Math.max(-.12,S.mret*.6+.01)));
  if (S.retired && S.nest>0){ const d=Math.round(S.nest*.05); S.nest-=d; S.wealth+=d; S.income+=d; }
  if (S.job){
    const infl=Math.max(0,S.inflRate), raise=S.job.perf>=60?infl+.01+Math.random()*.02:S.job.perf>=35?infl:0;
    if (raise>0) S.job.salary=Math.round(S.job.salary*(1+raise));
    let p=S.econ==='recession'?.07:.015; if (S.job.perf<40) p+=.04;
    if (Math.random()<p){ const sev=Math.round(S.job.salary*.25); S.wealth+=sev; S.lastSalary=S.job.salary;
      log(`You were laid off from ${S.job.title}${S.econ==='recession'?' as the recession hit':''}. Severance: ${money(sev)}.`); S.job=null; fx({happiness:-10}); }
  }
  if (S.wealth<0){
    const i=Math.round(-S.wealth*.18); S.wealth-=i; bill.overdraftInterest=(bill.overdraftInterest||0)+i; S.expenses+=i;
    log(`Overdraft interest: ${money(i)}. Repeated overdrafts make day-to-day bills harder to manage.`);
  }
}
const _ageUp = ageUp;
ageUp = function(){
  const will=!(S.pending||(S.age<18&&!S.school)||(S.age>=18&&!S.housing)), a0=S.age;
  if (will) setWorld(S,S.age+1);
  _ageUp();
  if (!S||S.dead||S.age===a0){ if (will&&S&&S.age===a0) setWorld(S); return; }
  try { packYear(); } catch(e){ console.error(e); }
  checkDeath(); if (!S.dead) render();
};
const _askPromotion = askPromotion;
askPromotion = function(){
  const l0=S.job.level, s0=S.job.salary; _askPromotion();
  if (S.job && S.job.level>l0){ S.job.salary=Math.round(Math.max(S.job.salary,s0*1.1)); render(); }
};
const _familyYear = familyYear;
familyYear = function(){
  const before=parents().map(m=>m.id), r=_familyYear();
  if (S.age>=18) before.forEach(id=>{ const m=S.family.find(x=>x.id===id);
    if (m && !m.alive){ const amt=Math.round([1500,12000,60000][S.famWealth]*S.pr*(.5+Math.random())); S.wealth+=amt; log(`You inherited ${money(amt)} from ${m.name}.`); } });
  return r;
};
const _viewSchool = viewSchool;
viewSchool = function(){
  const g=S.gpaN?`<section class="card"><h3>Grades</h3><div class="row"><span>GPA (out of 4.0)</span><b class="mono">${S.gpa.toFixed(2)}</b></div><p class="muted" data-ui-style="ui-017">A GPA of 3.5 or more earns a 50% scholarship when you enrol at university.</p></section>`:'';
  return g+_viewSchool();
};
const _enrollUni = enrollUni;
enrollUni = function(type,major){
  const had=S.uni; _enrollUni(type,major);
  if (!had && S.uni && S.gpa>=3.5 && !S.uni.scholar){ S.uni.scholar=true; log(`Your grades earned a scholarship: tuition is halved (GPA ${S.gpa.toFixed(2)}).`); render(); }
};

/* ---------- 7.8 Economy card, Money, Bank, Activities ---------- */

function econCard(){
  const c=S.econ==='recession'?'var(--rose)':S.econ==='boom'?'var(--mint)':'var(--muted)';
  return `<section class="card"><h3>${gameYear()} · the economy: <span class="${S.econ==='recession'?'text-rose':S.econ==='boom'?'text-mint':'text-muted'}">${ECON[S.econ]||'Stable'}</span></h3>
    <div class="row"><span>Inflation this year</span><b class="mono">${(S.inflRate*100).toFixed(1)}%</b></div>
    <div class="row"><span>Prices vs. 2007</span><b class="mono">+${Math.round((S.cpi-1)*100)}%</b></div>
    <div class="row"><span>Stock market last year</span><b class="mono" class="${S.mret<0?'text-rose':'text-mint'}">${(S.mret*100).toFixed(1)}%</b></div>
    ${S.age>=18?`<div class="row"><span>Mortgage rate</span><b class="mono">${(S.mortRate*100).toFixed(1)}%</b></div><div class="row"><span>Credit score</span><b class="mono">${S.credit}</b></div>`:''}</section>`;
}
const _viewLife = viewLife;
viewLife = function(){ return econCard()+_viewLife(); };
function setRet(p){ S.retPct=p; render(); }
function viewMoney(){
  const sel=c=>c?'sel':'';
  const food=Object.entries(FOOD).map(([id,f])=>`<button class="btn ${sel(S.food===id)}" onclick="setFood('${id}')">${f.name} · ${money(f.cost)}/yr<small>${f.desc}</small></button>`).join('');
  const trans=Object.entries(TRANSPORT).map(([id,t])=>`<button class="btn ${sel(S.transport===id)}" onclick="setTransport('${id}')">${t.name}${id==='car'?'':' · '+money(t.cost)+'/yr'}<small>${t.desc}</small></button>`).join('');
  const ins=`<button class="btn ${sel(S.insured)}" onclick="toggleInsurance()">Health insurance: ${S.insured?'ON':'OFF'} · ${money(INSURANCE*S.pr)}/yr</button>`;
  const ret=`<section class="card"><h3>Retirement plan</h3><p class="muted">Contribute a share of your salary each year. Your employer matches half of it, up to 5%. It grows with the market and pays out 5% a year once you retire.</p>
    <div class="acts acts3" data-ui-style="ui-049">${[0,5,10,15].map(p=>`<button class="btn ${sel(S.retPct===p)}" onclick="setRet(${p})">${p}%</button>`).join('')}</div>
    <div class="row" data-ui-style="ui-019"><span>Retirement pot</span><b class="mono">${money(S.nest)}</b></div></section>`;
  const rows=Object.entries(S.bill||{}).filter(([k,v])=>v>0).map(([k,v])=>`<div class="row"><span class="cap">${k.replace(/([A-Z])/g,' $1')}</span><b class="mono">${money(-v)}</b></div>`).join('');
  return `<section class="card"><h3>Financial Overview</h3>
    <div class="row"><span>Cash</span><b class="mono">${money(S.wealth)}</b></div><div class="row"><span>Savings</span><b class="mono">${money(S.savings)}</b></div>
    <div class="row"><span>Investments</span><b class="mono">${money(S.invest)}</b></div><div class="row"><span>Retirement pot</span><b class="mono">${money(S.nest)}</b></div>
    <div class="row"><span>Real Estate Equity</span><b class="mono">${money(propertyValueTotal())}</b></div><div class="row"><span>Cars</span><b class="mono">${money(carsEquity())}</b></div>
    <div class="row"><span>Total Debts</span><b class="mono" data-ui-style="ui-053">${money(-(bankDebt()+S.loan))}</b></div><div class="row"><span>Net Worth</span><b class="mono">${money(netWorth())}</b></div></section>`
  +econCard()+ret+`<section class="card"><h3>Lifestyle & Spending</h3>${food}<h3 data-ui-style="ui-023">Transport</h3>${trans}<h3 data-ui-style="ui-023">Insurance</h3>${ins}</section>`
  +`<section class="card"><h3>Last Year Expense Breakdown</h3>${rows||'<p class="muted">No bills recorded yet.</p>'}</section>`;
}
const packRate=a=>a<=5000?.09:a<=25000?.12:.16;
function takeLoan(a){
  if (a>creditLimit()) return hint('Credit limit exceeded.');
  const r=packRate(a), pmt=Math.round(a*r/(1-Math.pow(1+r,-5)));
  S.loans.push({amt:a,bal:a,rate:r,pmt}); S.wealth+=a; log(`Borrowed ${money(a)} from the bank at ${(r*100).toFixed(0)}%.`); render();
}
function packMove(kind){
  const el=$('pk_amt'); let amt=Math.floor(Number(el&&el.value)||0); if (amt<=0) return hint('Enter an amount.');
  if (kind==='dep'||kind==='inv'){ if (S.wealth<amt) return hint('Not enough cash.'); S.wealth-=amt; if (kind==='dep') S.savings+=amt; else S.invest+=amt; }
  else { const pool=kind==='wd'?'savings':'invest'; amt=Math.min(amt,S[pool]); if (amt<=0) return hint('Nothing to take out.'); S[pool]-=amt; S.wealth+=amt; }
  hint(); render();
}
function viewBank(){
  const lim=creditLimit();
  const offers=[2000,5000,10000,25000,50000].map(a=>{ const r=packRate(a), pmt=Math.round(a*r/(1-Math.pow(1+r,-5)));
    return `<button class="btn" ${a>lim?'disabled':''} onclick="takeLoan(${a})">Borrow ${money(a)}<small>${(r*100).toFixed(0)}% interest, ${money(pmt)}/yr for 5 yrs</small></button>`; }).join('');
  const bl=S.loans.map((l,i)=>`<div data-ui-style="ui-023"><b>Bank Loan</b> · Owed ${money(l.bal)} (${money(l.pmt)}/yr)<button class="btn" ${S.wealth<l.bal?'disabled':''} onclick="payBank(${i},'all')">Pay off ${money(l.bal)}</button></div>`).join('');
  const sl=S.shopLoans.map(l=>`<div data-ui-style="ui-023"><b>Installment: ${l.item}</b> · Owed ${money(l.bal)} (${money(l.pmt)}/yr)</div>`).join('');
  return `<section class="card"><h3>Credit score</h3><div class="row"><span>Score (300 to 850)</span><b class="mono">${S.credit}</b></div><p class="muted" data-ui-style="ui-017">Pay on time and stay out of the red to raise it. A higher score means cheaper loans. Negative cash costs 18% interest a year.</p></section>
  <section class="card"><h3>Savings & Investing</h3>
    <div class="row"><span>Savings (${(S.saveRate*100).toFixed(1)}%/yr this year, safe)</span><b class="mono">${money(S.savings)}</b></div>
    <div class="row"><span>Index fund (risky, averages ~8%)</span><b class="mono">${money(S.invest)}</b></div>
    <input type="number" id="pk_amt" min="0" placeholder="Amount" data-ui-style="ui-054">
    <div class="acts" data-ui-style="ui-012"><button class="btn" onclick="packMove('dep')">Save</button><button class="btn" onclick="packMove('wd')">Withdraw savings</button><button class="btn" onclick="packMove('inv')">Invest</button><button class="btn" onclick="packMove('sell')">Sell investments</button></div></section>
  <section class="card"><h3>Bank Credit & Loans</h3><p class="muted">Credit Limit: <b>${money(lim)}</b></p>${offers}</section>
  <section class="card"><h3>Active Debt Contracts</h3>${bl||sl?bl+sl:'<p class="muted">No bank debt.</p>'}</section>`;
}
ACTIVITIES.push(
  {label:'Annual health check-up',cost:150,minAge:18,once:true,fx:{health:4},msg:'A check-up caught small problems early.'},
  {label:'Take a holiday abroad',cost:2500,minAge:18,once:true,fx:{happiness:12,social:3,health:2},msg:'You came back rested and full of stories.'},
  {label:'Therapy sessions',cost:900,minAge:18,fx:{happiness:6,health:1},msg:'Talking things through lifted a weight.'},
  {label:'Online course',cost:600,minAge:16,fx:{smarts:4},msg:'You picked up a valuable new skill.'},
  {label:'Hobby class (art, music, sport)',cost:350,minAge:12,fx:{happiness:4,social:3,smarts:1},msg:'You found a hobby you love.'},
  {label:'Donate to charity',cost:500,minAge:18,fx:{happiness:3,social:2},msg:'Giving back felt good.'}
);
function viewActivities(){
  const list=ACTIVITIES.map((a,i)=>({a,i})).filter(x=>S.age>=(x.a.minAge||0)).map(({a,i})=>{
    const done=a.once&&(S.didYear||{})[a.label]===S.age, cost=S.age>=18?Math.round(a.cost*S.pr):0;
    return `<button class="btn" ${done||cost>S.wealth?'disabled':''} onclick="doActivity(${i})">${a.label}<small>${done?'Already done this year':cost?money(cost):'Free'}</small></button>`; }).join('');
  return `<section class="card"><h3>Activities & Lifestyle</h3><p class="muted">Do as many as you can afford. Holidays and check-ups are once a year.</p>${list}</section>`;
}
function doActivity(i){
  const a=ACTIVITIES[i], cost=S.age>=18?Math.round(a.cost*S.pr):0;
  if (S.age<(a.minAge||0)) return hint('You are too young for that.');
  if (a.once&&(S.didYear||(S.didYear={}))[a.label]===S.age) return hint('You already did that this year.');
  if (cost>S.wealth) return hint('Not enough cash.');
  S.wealth-=cost; fx(a.fx); if (a.once) S.didYear[a.label]=S.age; log(a.msg);
  if (a.label==='Meet up with friends'||a.label==='Hobby class (art, music, sport)'){ if (Math.random()<.4){ const f=addFriend(); if (f) log(`You met a new friend: ${f.name}.`); } }
  render();
}

/* ---------- 7.9 New life events ---------- */
const giftPick=(cat,tier)=>{ const l=catalog().filter(i=>i.cat===cat&&i.d<=3).sort((a,b)=>a.cost-b.cost); return l.length?l[Math.min(l.length-1,Math.floor(l.length*tier))]:null; };
function giftItem(it,home){ S.inventory.push({uid:'u'+(S.uidN++),key:it.key,cat:it.cat,type:it.type||it.cat,model:it.model,price:it.cost,age:it.start||0,life:it.life,hap:it.hap,hp:it.hp,soc:it.soc,tier:1,homeId:home,broken:false,insured:false,storage:it.sto?it.sto[0][0]:null,portable:!home}); }
EVENTS.push(
  {id:'first_phone',min:11,max:13,ok:()=>!S.inventory.some(i=>i.cat==='phone'),title:'Your first phone',text:'Your parents think you are old enough for a mobile phone.',choices:[
    {label:'Accept it, thank you!',fx:()=>{ const it=giftPick('phone',[0,.45,.85][S.famWealth]); if(!it) return {happiness:2,msg:'They could not find one in time.'}; giftItem(it,null); return {happiness:5,social:3,msg:`Your parents bought you a ${it.model}.`}; }}]},
  {id:'first_console',min:8,max:13,ok:()=>!S.inventory.some(i=>i.cat==='console')&&S.housing==='parents'&&S.famWealth>=1,title:'A surprise gift',text:'Your parents surprise you with a games console for your birthday.',choices:[
    {label:'Wow, thank you!',fx:()=>{ const it=giftPick('console',[0,.3,.7][S.famWealth]); if(!it) return {happiness:2,msg:'Nothing in stock.'}; giftItem(it,'parents'); return {happiness:6,social:3,msg:`You got a ${it.model}.`}; }}]},
  {id:'first_car',min:18,max:21,ok:()=>!S.cars.length&&S.famWealth>=1&&parents().length>0,title:'The old family car',text:'Your parents offer you their old car now that they are upgrading.',choices:[
    {label:'Accept the car',fx:()=>{ const y=gameYear(), my=y-9, pool=CARS.filter(m=>m[9]<=my&&my<=m[10]&&['econ','compact','mid'].includes(m[3])&&!m[12]); const m=pool.length?pick(pool):CARS[3];
      S.cars.push(makeCar({mid:m[0],make:m[1],name:m[2],cls:m[3],year:my,fuel:'g',trim:0,color:rnd(4),int:0,intc:0,msrp:msrpOf(m,my,'g',0),miles:100000,cond:60,age:9,life:m[8]+0,ins:'liab'}));
      return {happiness:6,social:2,msg:`You got a ${my} ${m[1]} ${m[2]}. Insurance is on you.`}; }},
    {label:'No thanks',fx:{},result:'You decided to wait.'}]},
  {id:'friendloan',min:20,max:70,ok:()=>S.friends.some(f=>f.bond>=40),title:'A friend in need',text:()=>{ const f=S.friends.filter(x=>x.bond>=40)[0]; return `${f?f.name:'A friend'} is short on rent and asks to borrow $${Math.round(800*S.pr).toLocaleString()}.`; },choices:[
    {label:'Lend the money',cost:()=>Math.round(800*S.pr),fx:()=>{ const f=S.friends.filter(x=>x.bond>=40)[0], a=Math.round(800*S.pr); if(f){ f.loan+=a; f.bond=clamp(f.bond+10); } return {wealth:-a,social:2,msg:`You lent ${money(a)}. Fingers crossed.`}; }},
    {label:'Politely decline',fx:()=>{ const f=S.friends.filter(x=>x.bond>=40)[0]; if(f) f.bond=clamp(f.bond-10); return {social:-1,msg:'They said they understood, but it felt awkward.'}; }}]},
  {id:'parentneed',min:30,max:70,ok:()=>parents().some(m=>m.age>=65),title:'Your parents need help',text:'Your parents are struggling with bills in retirement.',choices:[
    {label:'Help them out',cost:()=>Math.round(2000*S.pr),fx:()=>{ const a=Math.round(2000*S.pr); parents().forEach(m=>m.bond=clamp(m.bond+12)); return {wealth:-a,happiness:2,msg:`You gave your parents ${money(a)}.`}; }},
    {label:'Not this time',fx:()=>{ parents().forEach(m=>m.bond=clamp(m.bond-10)); return {happiness:-3,msg:'They were hurt that you said no.'}; }}]},
  {id:'burglary',min:18,max:90,ok:()=>S.housing!=='parents',title:'Burglary',text:'You came home to a broken window and missing valuables.',choices:[
    {label:'File a report and replace what you can',fx:()=>({wealth:-Math.round(400*S.pr),happiness:-4,msg:'You lost some belongings.'})},
    {label:'Install an alarm',cost:()=>Math.round(600*S.pr),fx:()=>({wealth:-Math.round(600*S.pr),happiness:2,msg:'You paid for an alarm and feel safer.'})}]},
  {id:'lottery',min:18,max:90,title:'Lottery ticket',text:'A $20 ticket tempts you at the corner shop.',choices:[
    {label:'Buy a ticket',cost:20,fx:()=>Math.random()<.01?{wealth:49980,happiness:15,msg:'You won $50,000!'}:{wealth:-20,happiness:-1,msg:'Not a winner.'}},
    {label:'Walk past',fx:{},result:'You kept your money.'}]},
  {id:'headhunter',min:22,max:58,ok:()=>S.job&&S.job.perf>=60,title:'A recruiter calls',text:'A rival firm offers you a 20% higher salary.',choices:[
    {label:'Accept the offer',fx:()=>{ S.job.salary=Math.round(S.job.salary*1.2); S.job.perf=50; S.job.years=0; return {happiness:3,social:-1,msg:'You switched employers for a 20% raise.'}; }},
    {label:'Stay where you are',fx:()=>{ S.job.perf=clamp(S.job.perf+5); return {happiness:1,msg:'Your loyalty was noticed.'}; }}]},
  {id:'divorce',min:25,max:70,ok:()=>{const p=partner(); return p&&p.role==='Spouse'&&p.bond<40;},title:'Marriage in trouble',text:'You and your spouse keep drifting apart.',choices:[
    {label:'Try couples counselling',cost:()=>Math.round(1200*S.pr),fx:()=>{ partner().bond=clamp(partner().bond+25); return {wealth:-Math.round(1200*S.pr),happiness:2,msg:'Counselling helped you reconnect.'}; }},
    {label:'Divorce',cost:()=>Math.round(3000*S.pr),fx:()=>{ const p=partner(), half=Math.max(0,Math.round(S.wealth*.3)), c=Math.round(3000*S.pr); S.family=S.family.filter(m=>m!==p); return {wealth:-(c+half),happiness:-8,social:-3,msg:`You divorced. Legal fees and the settlement cost ${money(c+half)}.`}; }}]},
  {id:'wedding',min:22,max:50,title:'A friend is getting married',text:"You are invited to a friend's wedding abroad.",choices:[
    {label:'Go and bring a gift',cost:()=>Math.round(300*S.pr),fx:()=>({wealth:-Math.round(300*S.pr),social:5,happiness:3,msg:'You had a wonderful time.'})},
    {label:'Send your regrets',fx:{social:-2,msg:'You sent a card.'}}]},
  {id:'scare',min:40,max:100,title:'Health scare',text:'A strange symptom keeps coming back.',choices:[
    {label:'Get a full screening',cost:()=>Math.round(400*S.pr),fx:()=>({wealth:-Math.round(400*S.pr),health:5,happiness:-1,msg:'The screening found it early.'})},
    {label:'Ignore it',fx:()=>Math.random()<.25?{health:-15,happiness:-4,msg:'It got worse.'}:{msg:'It went away on its own.'}}]},
  {id:'audit',min:25,max:90,ok:()=>S.income>40000*S.wr,title:'Tax audit',text:'The tax office wants to review your returns.',choices:[
    {label:'Hire an accountant',cost:()=>Math.round(700*S.pr),fx:()=>({wealth:-Math.round(700*S.pr),msg:'Your accountant cleared it up.'})},
    {label:'Handle it yourself',fx:()=>Math.random()<.4?{wealth:-Math.round(2500*S.pr),happiness:-4,msg:'You made mistakes and paid a penalty.'}:{happiness:-1,msg:'It turned out fine.'}}]},
  {id:'tip',min:21,max:80,ok:()=>S.wealth>5000*S.pr,title:'A hot stock tip',text:'A coworker swears a small company is about to take off.',choices:[
    {label:'Put some money in',cost:()=>Math.round(2000*S.pr),fx:()=>{ const a=Math.round(2000*S.pr); return Math.random()<.45?{wealth:Math.round(a*.6),happiness:4,msg:'The stock jumped 60%.'}:{wealth:-Math.round(a*.5),happiness:-4,msg:'The stock fell 50%.'}; }},
    {label:'Pass',fx:{},result:'You stayed away from gambling.'}]}
);

/* =====================================================================
   8. PHASE 10: COUNTRIES, MONEY, ABROAD, LOVE
   Prices/wages/house prices are multiplied by the country of residence.
   The USA is the baseline (all factors 1), so old saves behave as before.
   p = local prices, w = wages, h = house prices, r = rent vs wages,
   imp = imported goods (phones, laptops), mr = extra mortgage rate,
   dev = yearly chance of currency crash after 2026.
   ===================================================================== */


let pendCountry='egy', pendLike='f';
function C(o){ o=o||S; return COUNTRIES[(o&&o.country)||'usa']||COUNTRIES.usa; }
function cfx(o){ o=o||S; const c=C(o); if(!o.cf||o.cf.k!==o.country) o.cf={k:o.country||'usa',p:c.p,w:c.w,h:c.h,r:c.r,mr:c.mr,mul:1}; return o.cf; }
function rateNow(){ const c=C(); if (c.cur==='USD') return 1; const y=gameYear(); return (c.hist&&y<2026?c.hist(y):c.rate)*((S.cf&&S.cf.mul)||1); }
function fmtMoney(n){ const c=C(), v=Math.round(Math.abs(n)*rateNow()); return (n<0?'-':'')+c.sym+v.toLocaleString(); }
const usd = n => (n<0?'-$':'$')+Math.abs(Math.round(n)).toLocaleString();
const svc = b => Math.round(b*(S.prEra||1)*cfx().p);                  // local services
const imp = b => Math.round(b*(S.prEra||1)*C().imp);                  // imported / luxury goods
const mix = b => Math.round(b*(S.prEra||1)*(cfx().p+C().imp)/2);
const usdLine = () => C().cur==='USD'&&!S.usdHold ? '' : `<div class="wealth" data-ui-style="ui-055"><span>${C().cur==='USD'?'USD savings held':'≈ in US dollars'}</span><b class="mono">${usd(S.wealth)}${S.usdHold?` + ${usd(S.usdHold)} held`:''}</b></div>`;

/* ----- start screen: country + who you are attracted to ----- */
function likeLabel(){ const g=avG; if (g==='n') return null; return pendLike===g?'Gay':'Straight'; }
function buildStart(){
  const s=$('country-sel'); if (!s) return;
  if (!s.options.length) s.innerHTML=Object.entries(COUNTRIES).map(([k,c])=>`<option value="${k}">${c.f} ${c.n} (${c.tier===3?'hard mode':c.tier===2?'medium':'easy'})</option>`).join('');
  s.value=pendCountry; s.onchange=()=>{ pendCountry=s.value; buildStart(); };
  $('like-p').innerHTML=[['f','Attracted to women'],['m','Attracted to men']].map(([v,l])=>`<button class="chip ${pendLike===v?'sel':''}" data-ui-style="ui-017" onclick="pendLike='${v}';buildStart()">${l}</button>`).join('');
  const c=COUNTRIES[pendCountry], lb=likeLabel();
  $('country-desc').textContent=`${c.f} ${c.n} · ${c.cur}${c.cur==='USD'?'':` (≈ ${c.rate} per $1)`}. ${c.d}${lb?' · '+lb:''}`;
}
const _pickG=pickG; pickG=function(g){ _pickG(g); buildStart(); };

/* ----- state fields, migration, new life ----- */
function p10Init(o){
  const b={country:'usa',home:null,like:'f',eng:30,ielts:0,imm:null,usdHold:0,remote:null,mast:null,mastDone:false,pool:[],dact:0,gact:0,wed:null,cf:null,curF:1,prEra:1,wrEra:1,rsTry:0,didW:0,engDone:-1,askAb:-1,jobTry:0,poolAge:-1};
  for (const k in b) if (!(k in o)) o[k]=b[k];
  if (!o.home) o.home=o.country; return o;
}
const _migrate10=migrate; migrate=function(o){ if(!o.country) o.country='usa'; _migrate10(o); p10Init(o); return o; };
const _newGame10=newGame;
newGame=function(n,g,t){
  _newGame10(n,g,t); const c=COUNTRIES[pendCountry];
  S.country=pendCountry; S.home=pendCountry; S.like=pendLike; p10Init(S); S.cf=null; S.curF=1; S.rentWorld=false; setWorld(S); S.rent0=S.rentIndex;
  S.eng=Math.min(100,c.eng+rnd(15)); if (c.tier===3) S.famWealth=Math.random()<.75?0:1; else if (c.tier===2) S.famWealth=Math.min(S.famWealth,1);
  S.pool=genPool();
  log(`You were born in ${c.n} ${c.f}. ${c.tier===3?'Life here will not be easy.':''}`);
};
const _setWorld10=setWorld;
setWorld=function(o,age){
  const prev=o.curF||1; if (o.rentWorld) o.rentIndex/=prev;
  _setWorld10(o,age); const k=cfx(o);
  o.prEra=o.pr; o.wrEra=o.wr; o.pr*=k.p; o.wr*=k.w; o.hpr*=k.h; o.curF=k.w*k.r; o.rentIndex=o.wr*k.r; o.mortRate+=k.mr;
  BRACKETS.forEach((b,i)=>{ if (isFinite(BASE_BR[i])) b[0]=Math.round(BASE_BR[i]*o.wr); });
};
/* imported goods keep world prices even in poor countries */
const _catalog10=catalog;
catalog=function(){ const a=_catalog10(), k=C().imp/Math.max(1,S.pr||1);
  if (Math.abs(k-1)>.01) a.forEach(i=>{ if (['phone','laptop','tablet','tv','console'].includes(i.cat)) i.cost=Math.round(i.cost*k); }); return a; };
const _netWorth10=netWorth; netWorth=function(){ return _netWorth10()+(S.usdHold||0); };
for (let i=EVENTS.length-1;i>=0;i--) if (['date','proposal'].includes(EVENTS[i].id)) EVENTS.splice(i,1);   // replaced by the Love tab

/* =============== ENGLISH, REMOTE WORK, USD ================= */

function takeEng(i){ const e=ENG[i], c=svc(e[1]); if (S.engDone===S.age) return hint('One English course per year.'); if (S.wealth<c) return hint('Not enough cash.');
  S.wealth-=c; S.engDone=S.age; S.eng=Math.min(100,S.eng+e[2]); fx({smarts:1}); log(`${e[0]}: English level is now ${S.eng}%.`); hint(); render(); }
function takeIelts(){ const c=imp(250); if (S.wealth<c) return hint('Not enough cash for the exam.'); S.wealth-=c;
  S.ielts=Math.min(9,Math.round((S.eng/100*9+Math.random()-.5)*2)/2); log(`IELTS result: band ${S.ielts}.`); hint(); render(); }

function remOk(r){ return S.age>=18 && S.eng>=r.eng && (!r.deg || (r.deg==='any'?!!S.degree:S.degree===r.deg)); }
function searchRemote(id){ const r=REMOTE.find(x=>x.id===id); if (!remOk(r)) return hint('You do not meet the requirements yet.'); if (S.didW===S.age) return hint('One search per year.');
  S.didW=S.age; const p=Math.min(.7,.12+(S.eng-r.eng)/90+S.smarts/400+S.rsTry*.05);
  if (Math.random()<p){ S.remote={id,title:r.t,usd:Math.round(r.usd*S.wrEra),st:r.st}; S.rsTry=0; fx({happiness:8}); log(`You landed a remote job: ${r.t}, paid in US dollars (${usd(S.remote.usd)}/yr).`); }
  else { S.rsTry++; fx({happiness:-3}); log('A year of applications, ghosting and rejections. Remote work is hard to land.'); } hint(); render(); }
function quitRemote(){ log('You left your remote job.'); S.remote=null; render(); }
function holdUsd(frac){ const a=Math.round(Math.max(0,S.wealth)*frac); if (a<=0) return hint('Nothing to convert.'); S.wealth-=a; S.usdHold+=a; log(`You moved ${money(a)} into US dollars.`); hint(); render(); }
function releaseUsd(){ S.wealth+=S.usdHold; log(`You converted ${usd(S.usdHold)} back to local cash.`); S.usdHold=0; render(); }

/* =============== STUDY ABROAD & IMMIGRATION ================= */
function applyMasters(d,fund){
  const c=COUNTRIES[d]; if (!S.degree) return hint('You need a bachelor degree first.'); if (S.imm) return hint('You are already abroad.'); if (d===S.country) return hint('Choose another country.');
  if (S.ielts<c.ms.i) return hint(`${c.n} requires IELTS ${c.ms.i}+. Yours: ${S.ielts||'not taken'}.`);
  const fee=imp(300); if (S.wealth<fee) return hint('Not enough cash for application fees.'); S.wealth-=fee;
  const score=S.smarts*.5+S.gpa*10+S.eng*.2;
  if (Math.random()>Math.min(.9,.15+score/130)){ fx({happiness:-6}); log(`${c.n}: your master's application was rejected (fees ${money(fee)}).`); hint(); return render(); }
  let cover=0;
  if (fund==='full'){ if (Math.random()<(score>=80?.25:score>=65?.08:.02)) cover=1; else { log(`Admitted in ${c.n}, but the full scholarship went to someone else.`); hint(); return render(); } }
  else if (fund==='part'){ if (Math.random()<(score>=65?.45:.25)) cover=.5; else { log(`Admitted in ${c.n}, but no partial scholarship was offered.`); hint(); return render(); } }
  else if (fund==='parents'){ const f=[0,.6,1][S.famWealth]; if (!parents().length||f===0||bestBond()<35||Math.random()<.25){ log('Your parents could not afford to pay for a master\'s abroad.'); hint(); return render(); } cover=f; }
  else { const t=Math.round(c.ms.t*S.prEra); if (S.wealth<t*.5){ log('You need at least half of the first year\'s tuition in cash.'); hint(); return render(); } }
  moveAbroad(d,fund,cover);
}
function moveAbroad(d,fund,cover){
  const c=COUNTRIES[d];
  S.mast={dest:d,left:c.ms.y,cover,fund,work:false}; S.imm={stage:'student',yrs:0};
  S.country=d; S.cf=null; S.rentWorld=false; S.curF=1; S.job=null; S.part=null; S.housing='room'; S.transport='bus'; S.ownedHomes.forEach(h=>{ if (h.status==='live') h.status='vacant'; });
  setWorld(S); fx({happiness:6,social:-4});
  log(`You moved to ${c.n} ${c.f} for a ${c.ms.y}-year master's (${fund==='full'?'full scholarship':fund==='part'?'50% scholarship':fund==='parents'?'paid by parents':'self-funded'}). Rent and food are now priced locally.`);
  hint(); go('world');
}
function leaveAbroad(msg){
  S.country=S.home; S.cf=null; S.rentWorld=false; S.curF=1; S.imm=null; S.mast=null; S.job=null; S.housing=parents().length?'parents':null; setWorld(S);
  log(msg||'You moved back home.'); fx({happiness:-3}); render();
}
function goHome(){ if (!confirm('Move back home? You will lose your visa status.')) return; leaveAbroad('You moved back to '+COUNTRIES[S.home].n+'.'); }
function askParentsAbroad(){
  if (S.askAb===S.age) return hint('You already asked this year.'); S.askAb=S.age;
  if (!parents().length) return hint('Your parents are no longer with you.');
  const amt=Math.round([700,2500,9000][S.famWealth]*S.wrEra*(.6+Math.random()*.6));
  if (bestBond()>=35 && Math.random()<.8){ S.wealth+=amt; parents().forEach(m=>m.bond=clamp(m.bond-3)); log(`Your parents sent ${usd(amt)}${S.famWealth===0?'. It is a real sacrifice for them':''}.`); }
  else { parents().forEach(m=>m.bond=clamp(m.bond-2)); log('Your parents could not send anything this year.'); } hint(); render(); }
function toggleCampusJob(){ S.mast.work=!S.mast.work; render(); }

function searchJobAbroad(){
  const im=S.imm; if (!im||im.stage==='student') return hint('Finish your studies first.'); if (S.job) return hint('You already have a job.'); if (S.jobTry>=2) return hint('Two applications per year.'); S.jobTry++;
  const c=C(), sponsor=im.stage==='post'||im.stage==='visa', p=Math.max(.04,.12+S.smarts/300+S.eng/500+(S.mastDone?.08:0)+(S.econ==='boom'?.06:S.econ==='recession'?-.1:0)-(sponsor?c.jh:c.jh/2));
  if (Math.random()<p){ const tid=TRACK_OF[S.degree]||'entry', lv=S.mastDone&&tid!=='entry'?1:0, L=TRACKS[tid].levels[lv];
    S.job={trackId:tid,level:lv,title:L.title,salary:L.salary,perf:50,years:0}; if (im.stage==='post'){ im.stage='visa'; im.tries=0; im.nojob=0; }
    fx({happiness:8}); log(`You got a job as ${L.title} in ${c.n} (${money(L.salary)}/yr)${sponsor?'. Your employer will try to sponsor your work visa':''}.`); }
  else { fx({happiness:-3}); log('Job application rejected. Many employers will not sponsor visas.'); } hint(); render(); }
function applyCitizen(){
  const im=S.imm, fee=imp(1200); if (!im||im.stage!=='pr'||im.left>0) return; if (S.wealth<fee) return hint('Not enough cash for the application fee.'); S.wealth-=fee;
  if (Math.random()<.88){ im.stage='citizen'; fx({happiness:15}); log(`You became a citizen of ${C().n}! The long road is over.`); } else { im.left=1; fx({happiness:-5}); log('Your citizenship application was delayed. Try again next year.'); } hint(); render(); }

function immYear(){
  const im=S.imm; if (!im||S.country===S.home) return; const c=C(); fx({social:-1}); if (im.stage!=='citizen') fx({happiness:-2});
  if (im.stage!=='citizen' && Math.random()<.35){ const h=pick(HARD), f=imp(h[1]); S.wealth-=f; S.expenses+=f; fx({happiness:h[2]}); log(`${h[0]}${f?` (${money(f)})`:''}.`); }
  if (S.family.some(m=>m.alive)) parents().forEach(m=>m.bond=clamp(m.bond-3));
  if (im.stage==='post'){ im.left--; if (im.left<=0 && !S.job) return leaveAbroad('Your post-study permit expired without a sponsoring employer. You had to leave.'); }
  else if (im.stage==='visa'){
    if (!S.job){ im.nojob=(im.nojob||0)+1; if (im.nojob>=1) return leaveAbroad('You lost your job and your work visa with it. You had to leave.'); }
    else if (Math.random()<c.v){ if (c.gc){ im.stage='gc'; im.left=c.gc+rnd(4); log(`Your work visa was approved. The green card process begins (about ${im.left} years).`); } else { im.stage='pr'; im.left=c.nat; log(`You received permanent residence in ${c.n}. Citizenship is ${c.nat} years away.`); } fx({happiness:10}); }
    else { im.tries++; log(`${c.n==='United States'?'Your H-1B lottery entry lost':'Your visa application was refused'}. You can try again.`); fx({happiness:-6}); if (im.tries>=(c.n==='United States'?3:2)) return leaveAbroad('You ran out of visa attempts and had to leave.'); }
  }
  else if (im.stage==='gc'){
    if (!S.job){ im.nojob=(im.nojob||0)+1; if (im.nojob>=2) return leaveAbroad('You lost your sponsoring job and the process collapsed. You had to leave.'); } else im.nojob=0;
    im.left--; if (im.left<=0){ im.stage='pr'; im.left=c.nat; fx({happiness:12}); log('You received your green card!'); }
  }
  else if (im.stage==='pr'){ if (im.left>0){ im.left--; if (im.left===0) log('You are now eligible to apply for citizenship (World tab).'); } }
}
function mastYear(){
  const m=S.mast, c=COUNTRIES[m.dest], ad=(v)=>{ S.wealth-=v; S.expenses+=v; };
  const t=Math.round(c.ms.t*S.prEra*(1-m.cover)); if (t){ ad(t); S.bill.mastersTuition=t; }
  if (m.fund==='full'){ const st=Math.round(10000*S.prEra); S.wealth+=st; S.income+=st; log(`Your scholarship stipend paid ${money(st)}.`); }
  if (m.work){ const w=PART_JOBS[1].pay; S.wealth+=w; S.income+=w; fx({happiness:-2,smarts:-1}); }
  fx({smarts:3}); if (S.wealth<0){ fx({happiness:-3}); log('Money is tight abroad. Ask your parents for help or work part-time.'); }
  m.left--; if (m.left<=0){ S.mastDone=true; S.mast=null; S.imm={stage:'post',left:c.win,yrs:0}; fx({happiness:8,smarts:4});
    log(`You graduated with a master's degree in ${c.n}! You have ${c.win} year(s) to find an employer who will sponsor you.`); }
}

/* =============== LOVE ================= */







const lp=()=>{ const m=partner(); if (m&&m.stage==null){ m.stage=m.role==='Spouse'?'married':'dating'; m.mode='split'; m.together=false; m.yrs=0; m.likes=pick(LIKES)[0]; m.trait=pick(TRAITS); m.tier=rnd(3); } return m; };
const sameSex=()=>S.av.g!=='n'&&S.like===S.av.g;
function genPool(){ const out=[], lo=S.age<18?16:18; for (let i=0;i<3;i++) out.push({id:'c'+i+Math.random().toString(36).slice(2,5),name:pick(NAMES),age:Math.max(lo,Math.min(S.age<18?17:99,S.age+rnd(7)-3)),g:S.like,t:rnd(3),trait:pick(TRAITS),likes:pick(LIKES)[0],tier:rnd(3)}); return out; }
function newPeople(){ if (S.poolAge===S.age) return hint('You already went out to meet people this year.'); S.poolAge=S.age; S.pool=genPool(); log('You went out and met some new people.'); fx({social:1}); hint(); render(); }
function meetAsk(id){
  if (partner()) return hint('You are already with someone.'); const c=S.pool.find(x=>x.id===id); if (!c) return;
  S.pool=S.pool.filter(x=>x.id!==id);
  if (Math.random()<Math.min(.9,.35+S.social/200+S.happiness/500+S.smarts/800)){ const m=addMember('Partner',c.age,40); m.name=c.name; m.g=c.g; m.t=c.t; m.stage='dating'; m.mode='split'; m.together=false; m.yrs=0; m.likes=c.likes; m.trait=c.trait; m.tier=c.tier;
    fx({happiness:8,social:4}); log(`${c.name} said yes. You started dating.`); } else { fx({happiness:-4}); log(`${c.name} politely said no.`); } hint(); render(); }
const dateCost=b=>Math.round(svc(b)*(S.age<18?.3:1)), giftCost=(b,lux)=>Math.round((lux?imp(b):svc(b))*(S.age<18?.3:1));
function hang(i){ const m=lp(), h=HANG[i], c=dateCost(h[1]); if (S.dact>=3) return hint('Three outings per year.'); if (S.wealth<c) return hint('Not enough cash.');
  S.wealth-=c; S.dact++; m.bond=clamp(m.bond+h[2]+(m.trait==='Adventurous'&&i>=4?3:0)+(m.trait==='Romantic'&&i>=3?2:0)); fx({happiness:2,social:1}); log(`${h[0]} with ${m.name}${c?' ('+money(c)+')':''}.`); hint(); render(); }
function gift(i){ const m=lp(), g=GIFT[i], c=giftCost(g[1],g[4]); if (S.gact>=3) return hint('Three gifts per year.'); if (S.wealth<c) return hint('Not enough cash.');
  const fav=g[2]===m.likes; S.wealth-=c; S.gact++; m.bond=clamp(m.bond+Math.round(g[3]*(fav?1.5:1))); fx({happiness:1}); log(`You gave ${m.name} a gift: ${g[0].toLowerCase()} (${money(c)})${fav?'. It was exactly their taste':''}.`); hint(); render(); }
function ringList(){ return RINGS.concat(S.country==='egy'?[SHABKA]:[]); }
function propose(i){ const m=lp(), r=ringList()[i], c=imp(r[1]);
  if (S.age<18) return hint('You must be 18 to get engaged.'); if (m.yrs<1||m.bond<55) return hint('Date for at least a year with a bond of 55+ first.'); if (S.wealth<c) return hint('Not enough cash for that ring.');
  S.wealth-=c; if (Math.random()<clamp(45+(m.bond-55)/1.5+r[2]*6)/100){ m.stage='engaged'; m.bond=clamp(m.bond+8); fx({happiness:12,social:3}); log(`${m.name} said yes! The ${r[0].toLowerCase()} cost ${money(c)}. You are engaged.`); }
  else { m.bond=clamp(m.bond-12); S.wealth+=Math.round(c*.5); fx({happiness:-8}); log(`${m.name} said not yet. You returned the ring for half its price.`); } hint(); render(); }
function askMoveIn(){ const m=lp(); if (!S.housing||S.housing==='parents') return hint('Rent or buy your own home first (Real Estate tab).');
  if (Math.random()<.4+m.bond/200){ m.together=true; m.bond=clamp(m.bond+5); fx({happiness:5}); log(`${m.name} moved in with you.`); } else { m.bond=clamp(m.bond-5); log(`${m.name} is not ready to move in yet.`); } hint(); render(); }
function setMode(x){ lp().mode=x; render(); }
function breakUp(){ const m=lp(); if (!confirm(`Break up with ${m.name}?`)) return; S.family=S.family.filter(x=>x!==m); fx({happiness:-8}); log(`You broke up with ${m.name}.`); render(); }
function wedState(){ if (!S.wed) S.wed={venue:1,dress:1,suit:1,food:1,guests:1,photo:0,music:0,decor:0,honey:0,payer:'me'}; return S.wed; }
function wedCost(){ const w=wedState(), o=k=>WED[k][w[k]+1][1]; return svc(o('venue'))+mix(o('dress'))+mix(o('suit'))+svc(o('food')*o('guests'))+svc(o('photo'))+svc(o('music'))+svc(o('decor'))+svc(o('honey')); }
function wedShare(){ const t=wedCost(), m=lp(), p=wedState().payer;
  return p==='me'?t:p==='split'?Math.round(t/2):Math.round(t*(1-Math.min(.85,(parents().length?[.15,.35,.55][S.famWealth]:0)+[.1,.3,.5][m.tier]))); }
function wedSet(k,v){ if (k==='payer') wedState().payer=v; else wedState()[k]=+v; render(); }
function holdWedding(){ const m=lp(), w=wedState(), c=wedShare(); if (S.wealth<c) return hint(`You need ${money(c)} for your share.`);
  S.wealth-=c; m.stage='married'; m.role='Spouse'; m.bond=clamp(m.bond+15); const lux=w.venue+w.dress+w.suit+w.food; fx({happiness:6+Math.round(lux/2),social:5});
  if (sameSex()&&!C().ssm){ fx({happiness:-3}); log(`You and ${m.name} held a wedding for ${money(c)} (your share). It is a symbolic ceremony: ${C().n} does not legally recognise it.`); }
  else log(`You married ${m.name}! Your share of the wedding cost ${money(c)}.`);
  S.wed=null; hint(); render(); }
function loveYear(){
  const m=lp(); S.dact=0; S.gact=0; if (S.age>=16&&(!S.pool||!S.pool.length||S.poolAge<S.age-1)) S.pool=genPool();
  if (!m) return; m.yrs++;
  if (m.stage!=='married'){ m.bond=clamp(m.bond-(m.together?1:3)); if (m.bond<25&&Math.random()<.45){ S.family=S.family.filter(x=>x!==m); fx({happiness:-10}); return log(`${m.name} ended the relationship. You drifted apart.`); } }
  if (m.together){ const b=S.bill||{}, sh=(b.rent||0)+(b.utilities||0)+(b.groceries||0)+(b.propertyTax||0)+(b.mortgage||0);
    if (m.mode==='split'){ const r=Math.round(sh*.5); S.wealth+=r; if (r) log(`${m.name} covered half of the shared costs (${money(r)}).`); }
    else if (m.mode==='free'){ const r=Math.round(sh*[.6,.85,1][m.tier]); S.wealth+=r; m.bond=clamp(m.bond-2); if (r) log(`${m.name} paid ${money(r)} of the household costs. You pay nothing, but it is unequal.`); }
    else { const t=Math.round(sh*.4)+svc(1500); S.wealth-=t; S.expenses+=t; m.bond=clamp(m.bond+5); log(`Princess treatment: you spoiled ${m.name} with treats and paid for everything (extra ${money(t)}).`); } }
  if (S.country!==S.home&&m.stage!=='married'&&!m.together) m.bond=clamp(m.bond-5);
}

/* =============== YEARLY HOOK ================= */

function p10Year(){
  const c=C(), y=gameYear(), adult=S.age>=18;
  if (c.cur!=='USD'){   // currency crashes
    let f=0; if (S.country==='egy'&&EGY_SHOCK[y]) f=EGY_SHOCK[y];
    else if (y>2026&&Math.random()<c.dev){ f=.8; const k=cfx(); k.mul*=1.25; k.w*=.85; k.p*=.9; }
    if (f&&adult){ const lost=Math.round(Math.max(0,S.wealth+(S.savings||0))*(1-f)); S.wealth=S.wealth>0?Math.round(S.wealth*f):S.wealth; S.savings=Math.round((S.savings||0)*f); fx({happiness:-4});
      log(`The ${c.cur} lost value this year. Prices jumped and local savings lost ${money(lost)}.${S.usdHold?' Your US dollars kept their value.':' Holding US dollars would have protected you.'}`); }
  }
  if (S.country===S.home&&c.eng<80) S.eng=Math.min(100,S.eng+(S.age<18?2:0)); else if (S.country!==S.home) S.eng=Math.min(100,S.eng+4);
  if (S.remote&&adult){ const r=S.remote; S.remote.usd=Math.round(r.usd*(1+Math.max(0,S.inflRate))); let pay=r.usd; if (Math.random()<.12){ pay=Math.round(pay*.75); log('A client paid late and short this year.'); }
    S.wealth+=pay; S.income+=pay; fx({happiness:-r.st,health:-1}); log(`Remote job: ${usd(pay)} paid in US dollars (${money(pay)} here).`); }
  if (c.tier===3&&adult&&S.housing!=='parents') fx({happiness:-1});
  loveYear();
  if (S.mast) mastYear();
  immYear();
  S.expenses=Object.values(S.bill||{}).reduce((a,b)=>a+b,0);
}
const _ageUp10=ageUp;
ageUp=function(){ const a0=S.age; _ageUp10(); if (!S||S.dead||S.age===a0) return; try { p10Year(); } catch(e){ console.error(e); } checkDeath(); if (!S.dead) render(); };

/* =============== VIEWS ================= */
const B=(l,sub,fn,dis)=>`<button class="btn" ${dis?'disabled':''} onclick="${fn}">${l}${sub?`<small>${sub}</small>`:''}</button>`;
const SEC=(t,b)=>`<section class="card"><h3>${t}</h3>${b}</section>`;
const ROW=(a,b)=>`<div class="row"><span>${a}</span><b class="mono">${b}</b></div>`;
const PR=m=>`<p class="muted" data-ui-style="ui-032">${m}</p>`;

function viewLove(){
  const m=lp(), lb=likeLabel();
  const intro=SEC('Love and dating',PR(`${lb?lb+' · ':''}You are attracted to ${S.like==='f'?'women':'men'}. Dating starts at 16. Outings and gifts are limited to three each per year. ${sameSex()&&!C().ssm?`Same-sex marriage is not legally recognised in ${C().n}.`:''}`));
  if (!m){
    const pool=S.pool.map(c=>`<div data-ui-style="ui-018"><span data-ui-style="ui-056">${face(c.g,c.t,25)}</span> <b>${c.name}</b> <span class="muted">· ${c.age} · ${c.trait}</span>${B('Ask out','',`meetAsk('${c.id}')`)}</div>`).join('');
    return intro+SEC('People you could meet',(pool||PR('Nobody right now.'))+B('Go out and meet new people','Once a year, free','newPeople()',S.poolAge===S.age));
  }
  const st=m.stage, tg=m.together;
  const head=SEC(`${face(m.g,m.t,25)} ${m.name}`,`${PR(`${m.age} · ${m.trait} · likes ${LIKES.find(l=>l[0]===m.likes)[1]} · ${st==='dating'?'dating':st==='engaged'?'engaged':'married'}${tg?' · living with you':''} · together ${m.yrs} yr`)}${bar('Love',m.bond,'var(--rose)')}`);
  const hangs=S.age>=16?SEC(`Hang out (${S.dact}/3)`,`<div class="acts">${HANG.map((h,i)=>{ const c=dateCost(h[1]); return `<button class="btn" ${S.dact>=3||S.wealth<c?'disabled':''} onclick="hang(${i})">${h[0]}<small>${c?money(c):'free'}</small></button>`; }).join('')}</div>`):'';
  const gifts=SEC(`Gifts and shopping (${S.gact}/3)`,`<div class="acts">${GIFT.map((g,i)=>{ const c=giftCost(g[1],g[4]); return `<button class="btn" ${S.gact>=3||S.wealth<c?'disabled':''} onclick="gift(${i})">${g[0]}<small>${money(c)}${g[2]===m.likes?' · their taste':''}</small></button>`; }).join('')}</div>`);
  let steps='';
  if (st==='dating') steps=SEC('Engagement rings',PR('Needs a year together, love 55+, and age 18+. Better rings raise the chance of a yes.')+ringList().map((r,i)=>B(r[0],money(imp(r[1])),`propose(${i})`,S.wealth<imp(r[1]))).join(''));
  if (st==='engaged'){
    const w=wedState(), pay={me:'I pay everything',split:'Split with my partner',families:'Both families contribute'};
    const sel=Object.keys(WED).map(k=>{ const g=WED[k]; return `<div class="row" data-ui-style="ui-057"><span>${g[0]}</span><select onchange="wedSet('${k}',this.value)">${g.slice(1).map((o,i)=>{ const p=k==='food'?svc(o[1])+'/guest':k==='guests'?'':money(k==='dress'||k==='suit'?mix(o[1]):svc(o[1])); return `<option value="${i}" ${w[k]===i?'selected':''}>${o[0]}${p?' · '+p:''}</option>`; }).join('')}</select></div>`; }).join('');
    steps=SEC('Plan the wedding',PR('Choose the hall, dress, suit, food, guests and extras.')+sel+`<div class="row"><span>Who pays</span><select onchange="wedSet('payer',this.value)">${Object.entries(pay).map(([v,l])=>`<option value="${v}" ${w.payer===v?'selected':''}>${l}</option>`).join('')}</select></div>${ROW('Total cost',money(wedCost()))}${ROW('Your share',money(wedShare()))}`+B('Hold the wedding',sameSex()&&!C().ssm?'Symbolic: not legally recognised here':'',`holdWedding()`,S.wealth<wedShare()));
  }
  let home='';
  if (st!=='married'||tg) home=SEC('Living together',tg?PR('How do you share the home costs?')+[['split','Split 50/50','Fair and balanced.'],['princess','Princess treatment','You pay for everything and spoil them. Love grows.'],['free','I pay nothing','Your partner covers what they can afford. Love shrinks a little.']].map(([id,l,d])=>`<button class="btn ${m.mode===id?'sel':''}" onclick="setMode('${id}')">${l}<small>${d}</small></button>`).join(''):B('Ask them to move in','Needs your own rented or owned home',`askMoveIn()`,!S.housing||S.housing==='parents'));
  return intro+head+hangs+gifts+steps+home+(st!=='married'?SEC('',B('Break up','','breakUp()')):'');
}

function viewWorld(){
  const c=C(), h=COUNTRIES[S.home], abroad=S.country!==S.home, im=S.imm;
  let out=SEC(`${c.f} ${c.n}`,PR(c.d)+ROW('Currency',`${c.cur}${c.cur==='USD'?'':` · ${rateNow().toFixed(rateNow()<10?2:0)} per $1`}`)+ROW('Wage level vs USA',Math.round(cfx().w*100)+'%')+ROW('Home prices vs USA',Math.round(cfx().h*100)+'%')+ROW('Mortgage rate',(S.mortRate*100).toFixed(1)+'%')+(abroad?ROW('Home country',h.f+' '+h.n):''));
  if (im){
    const stg={student:'Student visa',post:`Post-study permit (${im.left} yr left)`,visa:`Work visa / sponsorship (${im.tries||0} failed)`,gc:`Green card in process (${im.left} yr)`,pr:im.left>0?`Permanent resident (${im.left} yr to citizenship)`:'Permanent resident, eligible for citizenship',citizen:'Citizen'}[im.stage];
    out+=SEC('Immigration status',ROW('Status',stg)+(im.stage==='post'||im.stage==='visa'||im.stage==='gc'||im.stage==='pr'?B('Search for a job','Two applications a year. Visa status depends on having an employer.','searchJobAbroad()',!!S.job||S.jobTry>=2):'')+(im.stage==='pr'&&im.left<=0?B('Apply for citizenship',money(imp(1200)),'applyCitizen()'):''));
    if (S.mast) out+=SEC('Your master\'s',ROW('Years left',S.mast.left)+B('Ask your parents for money','Once a year. They may not be able to.','askParentsAbroad()',S.askAb===S.age)+B(S.mast.work?'Stop campus job':'Work a campus job (visa allows it)',`Earns ${money(PART_JOBS[1].pay)}/yr, costs energy`,'toggleCampusJob()'));
    out+=SEC('',B('Move back home','You will lose your visa status.','goHome()'));
  }
  out+=SEC(`English level ${S.eng}%`,bar('English',S.eng,'var(--cyan)')+PR(`IELTS band: ${S.ielts||'not taken'}. Remote work and universities abroad need good English.`)+ENG.map((e,i)=>B(e[0],`${svc(e[1])?money(svc(e[1])):'free'} · +${e[2]} English`,`takeEng(${i})`,S.engDone===S.age||S.wealth<svc(e[1]))).join('')+B('Take the IELTS exam',money(imp(250)),'takeIelts()',S.wealth<imp(250)));
  if (S.age>=18&&!abroad){
    out+=SEC('Remote work (paid in US dollars)',PR(S.remote?`You work as: ${S.remote.title} · ${usd(S.remote.usd)}/yr`:'Finding remote work is hard and stressful. One search per year; success depends on English and smarts.')+(S.remote?B('Quit remote job','','quitRemote()'):REMOTE.map(r=>B(r.t,`${usd(Math.round(r.usd*S.wrEra))}/yr · English ${r.eng}+${r.deg?' · degree '+(r.deg==='any'?'needed':r.deg):''}`,`searchRemote('${r.id}')`,!remOk(r)||S.didW===S.age)).join('')));
    if (S.degree) out+=SEC('Master\'s degree abroad',PR(`Needs a bachelor degree, IELTS and money. Applications cost ${money(imp(300))}. Funding: scholarships are rare, parents may not afford it.`)+MS_KEYS.filter(k=>k!==S.country).map(k=>{ const d=COUNTRIES[k]; return `<details><summary>${d.f} ${d.n} · tuition ${usd(Math.round(d.ms.t*S.prEra))}/yr · ${d.ms.y} yr · IELTS ${d.ms.i}</summary><div class="acts">${[['self','Self-funded'],['parents','Parents pay'],['part','50% scholarship'],['full','Full scholarship']].map(([f,l])=>`<button class="btn" onclick="applyMasters('${k}','${f}')">${l}</button>`).join('')}</div></details>`; }).join(''));
    else out+=SEC('Master\'s degree abroad',PR('Finish a bachelor degree first (Education tab).'));
  }
  if (c.cur!=='USD'||S.usdHold) out+=SEC('Protect your savings with US dollars',PR(`Your ${c.cur} can lose value overnight. Dollars you hold are safe from crashes.`)+ROW('US dollars held',usd(S.usdHold))+`<div class="acts acts3">${[['25%',.25],['50%',.5],['All',1]].map(([l,f])=>`<button class="btn" onclick="holdUsd(${f})">Hold ${l}</button>`).join('')}</div>`+(S.usdHold?B('Convert back to local cash','','releaseUsd()'):''));
  return out;
}
/* =====================================================================
   PHASE 11 — REALISM & CAREER / EDUCATION / MIGRATION OVERHAUL
   Built as a compatibility layer over the existing Lifeline simulation.
   All salary and price figures below are broad 2026 reference estimates,
   not promises of actual pay, admission or immigration outcomes.
   ===================================================================== */

/* Country data: expand the playable map and calibrate the most important
   economy inputs. `p` is local consumer prices vs the US baseline, `w` is
   a rough wage ratio, `h` home purchase prices, and `r` is a separate rent
   factor (no longer incorrectly tied directly to wages). */
Object.assign(COUNTRIES, {
  uae:{n:'United Arab Emirates',f:'🇦🇪',cur:'AED',sym:'AED ',rate:3.67,p:.90,w:.78,h:1.05,r:1.45,imp:1.08,mr:.025,dev:.025,tier:1,eng:72,ssm:0,skillRoute:false,workYears:4,nat:99,gc:0,win:2,livingUSD:1800,mastersPublicFactor:.7,mastersPrivateFactor:1.5,ms:{t:18000,y:2,i:6.0,liv:1800},v:.5,jh:.16,d:'High salaries in some sectors, but housing, school fees and health cover can be expensive. Long-term citizenship is difficult for most expatriates.'},
  sau:{n:'Saudi Arabia',f:'🇸🇦',cur:'SAR',sym:'SAR ',rate:3.75,p:.68,w:.65,h:.78,r:.78,imp:.95,mr:.035,dev:.025,tier:2,eng:45,ssm:0,skillRoute:false,workYears:4,nat:99,gc:0,win:2,livingUSD:1200,mastersPublicFactor:.3,mastersPrivateFactor:1.1,ms:{t:12000,y:2,i:6.0,liv:1200},v:.48,jh:.18,d:'Some professional jobs pay well, but roles are competitive and residency is commonly tied to employment.'},
  aus:{n:'Australia',f:'🇦🇺',cur:'AUD',sym:'A$',rate:1.52,p:1.00,w:.90,h:1.25,r:1.75,imp:1.05,mr:.015,dev:0,tier:1,eng:100,ssm:1,skillRoute:true,workYears:3,nat:4,gc:0,win:3,livingUSD:1900,mastersPublicFactor:.8,mastersPrivateFactor:1.5,ms:{t:30000,y:2,i:6.5,liv:1900},v:.58,jh:.15,d:'High wages, high rent and a points-based skilled migration route for eligible applicants.'},
  fra:{n:'France',f:'🇫🇷',cur:'EUR',sym:'€',rate:.92,p:.88,w:.82,h:.82,r:1.25,imp:1.02,mr:.005,dev:0,tier:1,eng:55,ssm:1,skillRoute:false,workYears:4,nat:5,gc:0,win:2,livingUSD:1450,mastersPublicFactor:.08,mastersPrivateFactor:1.3,ms:{t:4000,y:2,i:6.0,liv:1450},v:.58,jh:.15,d:'Public higher education can be relatively affordable, but French skills improve many job prospects.'},
  ita:{n:'Italy',f:'🇮🇹',cur:'EUR',sym:'€',rate:.92,p:.82,w:.68,h:.72,r:.9,imp:1.00,mr:.005,dev:0,tier:1,eng:45,ssm:1,skillRoute:false,workYears:5,nat:10,gc:0,win:2,livingUSD:1250,mastersPublicFactor:.15,mastersPrivateFactor:1.2,ms:{t:3000,y:2,i:6.0,liv:1250},v:.42,jh:.2,d:'Lower salaries than some northern European countries and a stronger need for local language skills.'},
  nld:{n:'Netherlands',f:'🇳🇱',cur:'EUR',sym:'€',rate:.92,p:1.00,w:.92,h:1.05,r:1.65,imp:1.05,mr:.005,dev:0,tier:1,eng:95,ssm:1,skillRoute:false,workYears:5,nat:5,gc:0,win:1,livingUSD:1750,mastersPublicFactor:.7,mastersPrivateFactor:1.35,ms:{t:18000,y:2,i:6.5,liv:1750},v:.56,jh:.15,d:'Many English-friendly international jobs, but housing is difficult and expensive.'},
  jpn:{n:'Japan',f:'🇯🇵',cur:'JPY',sym:'¥',rate:150,p:.78,w:.72,h:.75,r:.85,imp:1.0,mr:.005,dev:0,tier:1,eng:25,ssm:1,skillRoute:false,workYears:5,nat:5,gc:0,win:2,livingUSD:1300,mastersPublicFactor:.25,mastersPrivateFactor:1.4,ms:{t:10000,y:2,i:6.0,liv:1300},v:.48,jh:.22,d:'Large job market, but Japanese language ability matters for many careers and daily life.'},
  kor:{n:'South Korea',f:'🇰🇷',cur:'KRW',sym:'₩',rate:1370,p:.78,w:.78,h:.90,r:1.05,imp:1.0,mr:.02,dev:0,tier:1,eng:45,ssm:1,skillRoute:false,workYears:5,nat:5,gc:0,win:2,livingUSD:1350,mastersPublicFactor:.2,mastersPrivateFactor:1.2,ms:{t:10000,y:2,i:6.0,liv:1350},v:.48,jh:.2,d:'Advanced technology sector and competitive recruitment. Korean language skills expand options.'},
  sgp:{n:'Singapore',f:'🇸🇬',cur:'SGD',sym:'S$',rate:1.29,p:1.05,w:.95,h:1.45,r:2.0,imp:1.05,mr:.015,dev:0,tier:1,eng:100,ssm:1,skillRoute:false,workYears:4,nat:99,gc:0,win:2,livingUSD:1900,mastersPublicFactor:.7,mastersPrivateFactor:1.5,ms:{t:24000,y:2,i:6.5,liv:1900},v:.45,jh:.2,d:'Strong regional business hub, with expensive housing and selective work passes.'},
  pak:{n:'Pakistan',f:'🇵🇰',cur:'PKR',sym:'Rs ',rate:280,p:.22,w:.08,h:.30,r:.28,imp:.95,mr:.08,dev:.11,tier:3,eng:62,ssm:0,skillRoute:false,workYears:4,nat:5,gc:0,win:2,livingUSD:500,mastersPublicFactor:.08,mastersPrivateFactor:.6,ms:{t:2000,y:2,i:6.0,liv:500},v:.3,jh:.3,d:'Low local wages and pressure on household budgets; international salaries can change outcomes.'},
  nzl:{n:'New Zealand',f:'🇳🇿',cur:'NZD',sym:'NZ$',rate:1.68,p:.98,w:.82,h:1.1,r:1.55,imp:1.05,mr:.015,dev:0,tier:1,eng:100,ssm:1,skillRoute:true,workYears:3,nat:5,gc:0,win:3,livingUSD:1650,mastersPublicFactor:.75,mastersPrivateFactor:1.4,ms:{t:28000,y:2,i:6.5,liv:1650},v:.58,jh:.16,d:'Good quality of life, smaller job market and expensive housing in major cities.'}
});

COUNTRIES.egy.rate=52.7;
COUNTRIES.egy.p=.28; COUNTRIES.egy.w=.075; COUNTRIES.egy.h=.55; COUNTRIES.egy.r=.39; COUNTRIES.egy.imp=.90; COUNTRIES.egy.mr=.12;
COUNTRIES.egy.hist=y=>y<=2015?6.8:y===2016?10:y<=2021?16.5:y===2022?19:y===2023?31:y===2024?48:y===2025?50:52.7;
COUNTRIES.usa.r=1.8; COUNTRIES.gbr.r=1.55; COUNTRIES.can.r=1.7; COUNTRIES.deu.r=1.15;
COUNTRIES.ind.r=.34; COUNTRIES.nga.r=.36; COUNTRIES.bra.r=.72; COUNTRIES.tur.r=.72;
COUNTRIES.usa.livingUSD=2200; COUNTRIES.gbr.livingUSD=1800; COUNTRIES.can.livingUSD=1800; COUNTRIES.deu.livingUSD=1250;
COUNTRIES.usa.workYears=3; COUNTRIES.usa.gc=3; COUNTRIES.usa.nat=5;
COUNTRIES.gbr.workYears=3; COUNTRIES.gbr.nat=5; COUNTRIES.can.workYears=3; COUNTRIES.can.nat=3; COUNTRIES.deu.workYears=3; COUNTRIES.deu.nat=5;
COUNTRIES.can.skillRoute=true; COUNTRIES.can.livingUSD=1800; COUNTRIES.can.mastersPublicFactor=.55; COUNTRIES.can.mastersPrivateFactor=1.25;
COUNTRIES.gbr.mastersPublicFactor=.75; COUNTRIES.gbr.mastersPrivateFactor=1.45;
COUNTRIES.deu.mastersPublicFactor=.045; COUNTRIES.deu.mastersPrivateFactor=1.25;
COUNTRIES.usa.mastersPublicFactor=1.0; COUNTRIES.usa.mastersPrivateFactor=1.7;
COUNTRIES.egy.ms={t:1200,y:2,i:5.5,liv:500};
COUNTRIES.egy.livingUSD=500; COUNTRIES.egy.skillRoute=false; COUNTRIES.egy.workYears=4; COUNTRIES.egy.nat=99;

/* Preserve the original state migration, but initialise the new systems. */
function realismInit(o){
  if(!o) return o;
  const defaults={careerRecords:{},moveCase:null,moveAttempts:{},localMast:null,studentVisaCase:null,completedMasters:[],masterField:'',notices:[],jobAppsAge:-1,jobAppsCount:0,lastTripAge:-99,parentHelpAge:-99,parentAskAge:-99,parentNeed:null,masterAppsAge:-1,localMasterAppsAge:-1,allowanceAmount:0};
  for(const k in defaults) if(!(k in o)) o[k]=defaults[k];
  if(!o.careerRecords||typeof o.careerRecords!=='object') o.careerRecords={};
  if(!Array.isArray(o.completedMasters)) o.completedMasters=[];
  if(!Array.isArray(o.notices)) o.notices=[];
  if(!o.moveAttempts||typeof o.moveAttempts!=='object') o.moveAttempts={};
  return o;
}
const _migrateRealism = migrate;
migrate = function(o){ o=_migrateRealism(o); realismInit(o); if(o.job&&o.job.trackId&&COUNTRIES[o.country]) o.job.salary=salaryForTrack(o.job.trackId,o.job.level||0,o.country,gameYearFor(o)); return o; };
const _newGameRealism = newGame;
newGame = function(n,g,t){
  _newGameRealism(n,g,t); realismInit(S);
  S.family.forEach(m=>{m.name=localName(S.country,m.g);});
  if(S.pool) S.pool.forEach(m=>{m.name=localName(S.country,m.g);});
  S.job=null; S.remote=null; S.localMast=null; S.moveCase=null;
};


function gameYearFor(o){return (o&&o.born||2001)+(o&&o.age||6);}
function rateForCountry(country,year){const c=COUNTRIES[country]||COUNTRIES.usa; if(c.hist&&year<2026)return c.hist(year); return c.rate||1;}
function localPriceIndex(country,year){const c=COUNTRIES[country]||COUNTRIES.usa; const p=(typeof prOf==='function'?prOf(year,S):(S&&S.prEra)||1); return p*rateForCountry(country,year)/(c.rate||1);}
function localCurrencyInternal(amount,country=S.country,year=gameYear()){return Math.max(0,Number(amount)||0)/Math.max(.0001,rateForCountry(country,year));}
function egyptWageIndex(year){const ys=Object.keys(REAL_WAGE_INDEX_EGY).map(Number).sort((a,b)=>a-b); if(year<=ys[0])return REAL_WAGE_INDEX_EGY[ys[0]]; if(year>=ys[ys.length-1])return REAL_WAGE_INDEX_EGY[ys[ys.length-1]]; let lo=ys[0],hi=ys[1]; for(let i=1;i<ys.length;i++){if(year<=ys[i]){lo=ys[i-1];hi=ys[i];break;}} const t=(year-lo)/(hi-lo);return REAL_WAGE_INDEX_EGY[lo]+(REAL_WAGE_INDEX_EGY[hi]-REAL_WAGE_INDEX_EGY[lo])*t;}

/* Current local salary estimates (annual, 2026 nominal). Senior roles are
   possible but rare; degree-level salaries are not all treated like US pay. */
/* Education costs use local EGP estimates instead of blindly converting US fees.
   Families still need the relevant family tier to unlock private/international school. */

Object.entries(SCHOOLS).forEach(([k,school])=>{
  const d=Object.getOwnPropertyDescriptor(school,'cost');
  const oldCost=d&&d.get?d.get.bind(school):()=>d&&d.value||0;
  Object.defineProperty(school,'cost',{configurable:true,enumerable:true,get(){
    if(!S||S.country!=='egy'||!EGY_SCHOOL_LOCAL[k])return oldCost();
    return localCurrencyInternal(EGY_SCHOOL_LOCAL[k]*egyptWageIndex(gameYear()),'egy',gameYear());
  }});
});

Object.entries(UNIS).forEach(([k,uni])=>{
  const d=Object.getOwnPropertyDescriptor(uni,'tuition');
  const oldTuition=d&&d.get?d.get.bind(uni):()=>d&&d.value||0;
  Object.defineProperty(uni,'tuition',{configurable:true,enumerable:true,get(){
    if(S&&S.country==='egy')return localCurrencyInternal(EGY_UNI_LOCAL[k]*egyptWageIndex(gameYear()),'egy',gameYear());
    return oldTuition();
  }});
});




function salaryForTrack(trackId,level,country=S.country,year=gameYear(),factor=1){
  const ix=Math.max(0,Math.min(4,Number(level)||0)), c=COUNTRIES[country]||COUNTRIES.usa;
  if(country==='egy') return Math.round(EGY_SALARY_2026[trackId][ix]*egyptWageIndex(year)*factor/Math.max(.0001,rateForCountry(country,year)));
  const base=(BASE_US_SALARIES[trackId]||BASE_US_SALARIES.entry)[ix];
  const historic=typeof prOf==='function'?prOf(year,S):1;
  return Math.round(base*(c.w||1)*(c.rate||1)*historic*factor/Math.max(.0001,rateForCountry(country,year)));
}
function trackExperience(trackId){const r=(S.careerRecords||{})[trackId];return Math.max(0,r?r.years||0:0)+(S.job&&S.job.trackId===trackId?Math.max(0,S.job.years||0):0);}
function allExperience(){return Object.values(S.careerRecords||{}).reduce((n,r)=>n+Math.max(0,r.years||0),0)+(S.job?Math.max(0,S.job.years||0):0);}
function recordCareer(job,ending=false){
  if(!job||!job.trackId)return;
  realismInit(S); const rec=S.careerRecords[job.trackId]||(S.careerRecords[job.trackId]={level:0,years:0,title:'',bestSalary:0});
  rec.level=Math.max(rec.level||0,job.level||0); rec.title=job.title||rec.title; rec.bestSalary=Math.max(rec.bestSalary||0,job.salary||0);
  if(ending){rec.years=Math.max(0,rec.years||0)+Math.max(0,(job.years||0)-(job._recordedYears||0)); job._recordedYears=job.years||0;}
}
const _addMemberRealism=addMember;
addMember=function(role,age,bond){const m=_addMemberRealism(role,age,bond);if(role==='Partner'&&S&&S.like)m.g=S.like;if(S&&S.country)m.name=localName(S.country,m.g);return m;};

function localName(country,g){const a=REAL_NAMES[country]||REAL_NAMES.usa;const arr=a[g]||a.n;return arr[Math.floor(Math.random()*arr.length)];}
const _genPoolRealism=genPool;
genPool=function(){const out=_genPoolRealism();out.forEach(m=>m.name=localName(S.country,m.g));return out;};
const _addFriendRealism=addFriend;
addFriend=function(){const f=_addFriendRealism();if(f&&S&&S.country)f.name=localName(S.country,'n');return f;};

/* Correct local rent: the rent factor is city/country-specific and is no
   longer multiplied by a wage factor. */
const _cfxRealism=cfx;
cfx=function(o){o=o||S;const c=C(o);const old=o.cf||{};const same=old.k===(o.country||'usa')&&old.realism==='phase11';o.cf={k:o.country||'usa',p:same&&Number.isFinite(old.p)?old.p:c.p,w:same&&Number.isFinite(old.w)?old.w:c.w,h:same&&Number.isFinite(old.h)?old.h:c.h,r:same&&Number.isFinite(old.r)?old.r:c.r,mr:same&&Number.isFinite(old.mr)?old.mr:c.mr,mul:old.mul||1,realism:'phase11'};return o.cf;};
const _setWorldRealism=setWorld;
setWorld=function(o,age){const before=o.rentIndex||0;_setWorldRealism(o,age);const country=o.country||'usa',c=COUNTRIES[country]||COUNTRIES.usa;const y=gameYearFor({...o,age:age==null?o.age:age});o.rentIndex=(typeof prOf==='function'?prOf(y,o):1)*(c.r||1);o.rentRise=before?o.rentIndex/before-1:0;o.rentWorld=true;};

/* Recalibrate the pocket-money system. A child in a low-income Egyptian
   household should not quietly receive hundreds of dollars each year. */
function childPocketMoneyInternal(){
  const age=Math.max(8,S.age), fw=Math.max(0,Math.min(2,S.famWealth||0)), c=C(), y=gameYear();
  const ageFactor=1+Math.max(0,age-8)*.10;
  if(S.country==='egy')return localCurrencyInternal([1200,6000,24000][fw]*egyptWageIndex(y)*ageFactor,'egy',y);
  const usdTarget=[180,600,3600][fw]*ageFactor;
  return localCurrencyInternal(usdTarget*(c.rate||1)*(typeof prOf==='function'?prOf(y,S):1),S.country,y);
}
const _packYearRealism=packYear;
packYear=function(){const y=S&&S.age;const oldAllowance=(y>=8&&y<18)?Math.round([150,400,1000][S.famWealth]*S.pr/10)*10:0;_packYearRealism();if(y>=8&&y<18){S.wealth-=oldAllowance;S.wealth+=childPocketMoneyInternal();}};
const _familyYearRealism=familyYear;
familyYear=function(){_familyYearRealism();const count=kids().filter(k=>k.alive&&k.age<18).length;const y=gameYear();const c=COUNTRIES[S.country]||COUNTRIES.usa;const target=S.country==='egy'?50000*egyptWageIndex(y):(c.childCostLocal||8000*(c.p||1)*(c.rate||1))*(typeof prOf==='function'?prOf(y,S):1);return count*localCurrencyInternal(target,S.country,y);};

/* A realistic minimum private-sector salary exists in the Egypt scenario;
   historical hiring salaries are much lower than 2026 nominal salaries. */
function salaryTitle(trackId,level){return (CAREER_TITLES[trackId]||CAREER_TITLES.entry)[Math.max(0,Math.min(4,level||0))];}
function companyListFor(country=S.country){
  const banks={egy:['Delta Trade & Distribution','Alexandria Commercial Bank','Nile Business Services','Pyramid Digital','NileCare Clinics','Sphinx Legal Partners'],ind:['Banyan Retail & Services','Deccan Finance Group','Monsoon Business Process Services','Lotus Tech Works','Sanjeevani Health Network','Eastern Legal Associates'],nga:['Lagos Retail & Services','Atlantic Finance House','Westline Outsourcing','Palm Tech Systems','Unity Health Network','Harbour Legal Associates'],bra:['Samba Retail & Services','Aurora Financial Group','Verde Business Services','Sol Digital','Vida Health Network','Costa Legal Partners'],tur:['Marmara Retail & Services','Bosporus Finance Group','Anatolia Support Services','Anka Digital','Anadolu Health Network','Istanbul Legal Partners'],usa:['Cedar Retail Group','Northstar Financial','Clearline Support Services','Redwood Digital','Community Health Network','Lakeview Legal'],gbr:['Westbridge Retail','Thames Financial Group','Brightdesk Services','Northfield Digital','Crown Health Network','Westminster Legal'],can:['Maple Retail Group','Northern Financial','Clearpath Support Services','Aurora Digital','Harbour Health Network','Pinecrest Legal'],deu:['Rhein Retail GmbH','Alpen Finance GmbH','Klar Service Group','Werk Digital GmbH','Gesund Health Network','Berlin Legal Partners'],uae:['Emirates Business Retail','Gulf Crescent Finance','Sandstone Business Services','Dune Digital','Oasis Health Group','Harbour Legal Advisory'],sau:['Riyadh Retail Group','Desert Crescent Finance','Najd Business Services','PalmTech Arabia','Vision Health Network','Kingdom Legal Partners'],aus:['Southern Retail Group','Coral Financial','Brightline Support','Outback Digital','Harbour Health Network','Southern Legal Group'],fra:['Rive Gauche Retail','Lumière Finance','Clair Service Groupe','Bleu Numérique','Santé Horizon','Cabinet du Centre'],ita:['Milano Retail Group','Stella Finance','Linea Servizi','Vento Digital','Salute Italia','Studio Centrale'],nld:['Canal Retail Group','Orange Finance','Clearwork Services','Tulip Digital','Lowlands Health','Canal Legal'],jpn:['Sakura Retail Group','Koyo Finance','Mirai Services','Hikari Digital','Sora Health','Tokyo Legal'],kor:['Han River Retail','Morning Finance','Hanul Business Services','Mirae Digital','Seoul Health Network','Han Legal Partners'],sgp:['Lion City Retail','Merlion Financial','Harbour Business Services','Orchid Digital','City Health Network','Marina Legal'],nzl:['Southern Cross Retail','Koru Finance','Clearpath Services','Fern Digital','Kiwi Health Network','Aotearoa Legal'],pak:['Indus Retail & Services','Crescent Finance','Mehr Business Services','Indus Digital','Shifa Health Network','Civic Legal']};
  const names=banks[country]||banks.usa;
  const defs=[
    {id:'retail',trackId:'entry',name:names[0],factor:.90,degree:null,smarts:25,eng:0,medical:false,social:true,bonus:0,leave:14,remote:'On-site',hours:45,stress:4,contract:'Permanent',desc:'Retail, front office and operations work. Stable work but modest pay and busy shifts.'},
    {id:'finance',trackId:'finance',name:names[1],factor:1.06,degree:'business',smarts:48,eng:35,medical:true,social:true,bonus:.08,leave:21,remote:'Hybrid where available',hours:42,stress:4,contract:'Permanent',desc:'Accounting, finance operations, reporting and analyst openings. Competition depends on city and employer.'},
    {id:'outsourcing',trackId:'entry',name:names[2],factor:1.00,degree:null,smarts:35,eng:country==='egy'?40:55,medical:country!=='egy',social:true,bonus:.03,leave:14,remote:'Mostly on-site',hours:45,stress:6,contract:'Permanent or outsourced',desc:'Customer support and service operations. Shift targets can be stressful; benefits vary by contract.'},
    {id:'tech',trackId:'tech',name:names[3],factor:1.10,degree:'cs',smarts:55,eng:55,medical:true,social:true,bonus:.08,leave:24,remote:'Hybrid / remote by team',hours:40,stress:4,contract:'Permanent',desc:'IT, software, analytics and digital products. Skills and portfolio matter.'},
    {id:'health',trackId:'medical',name:names[4],factor:1.02,degree:'medicine',smarts:65,eng:25,medical:true,social:true,bonus:.03,leave:21,remote:'On-site',hours:48,stress:7,contract:'Permanent',desc:'Clinical and healthcare roles. High responsibility; hours vary by specialty.'},
    {id:'legal',trackId:'law',name:names[5],factor:1.04,degree:'law',smarts:58,eng:40,medical:country!=='egy',social:true,bonus:.05,leave:21,remote:'Hybrid by employer',hours:45,stress:5,contract:'Permanent',desc:'Legal support, contracts, compliance and advisory work.'}
  ];
  /* Make a posting visible for the graduate's own track even where a small
     market would not typically recruit every specialty through this board. */
  if(S&&S.degree==='biology'&&!defs.some(d=>d.trackId==='bio'))defs.push({id:'science',trackId:'bio',name:'Regional Science & Research Group',factor:.95,degree:'biology',smarts:50,eng:40,medical:true,social:true,bonus:.03,leave:21,remote:'On-site / hybrid',hours:40,stress:4,contract:'Fixed-term or permanent',desc:'Laboratory and research roles.'});
  return defs;
}
function findCompany(id,country=S.country){return companyListFor(country).find(x=>x.id===id)||null;}
function jobEligible(post){
  if(S.age<18)return 'You must be 18 or older.';
  if(!S.diploma)return 'A high-school diploma is required.';
  if(S.smarts<(post.smarts||0))return `Needs ${post.smarts}% Smarts.`;
  if(S.eng<(post.eng||0))return `Needs English level ${post.eng}%.`;
  if(post.degree&&S.degree!==post.degree&&!(post.degree==='business'&&S.degree==='business'))return `Requires a ${post.degree} degree.`;
  if(S.uni)return 'Finish your current university degree first.';
  return '';
}
function jobSalaryForPost(post,level,country=S.country,year=gameYear()){
  let factor=post.factor||1;
  if(S.masterField||S.mastDone)factor*=1.06;
  return salaryForTrack(post.trackId,level,country,year,factor);
}
function applyCompany(companyId){
  if(S.age<18)return hint('Full-time job applications start at 18.');
  realismInit(S);
  if(S.jobAppsAge!==S.age){S.jobAppsAge=S.age;S.jobAppsCount=0;}
  if(S.jobAppsCount>=4)return hint('You have used your four job applications this year.');
  const post=findCompany(companyId);if(!post)return hint('That vacancy is no longer listed.');
  const why=jobEligible(post);if(why)return hint(why);
  S.jobAppsCount++;
  const current=S.job?{...S.job}:null;
  const rec=S.careerRecords[post.trackId];let level=rec?rec.level:0;
  if(current&&current.trackId===post.trackId)level=Math.max(level,current.level||0);
  const degreeBonus=(S.degree===post.degree?0.12:0),experienceBonus=Math.min(.20,trackExperience(post.trackId)*.035);
  const chance=Math.max(.08,Math.min(.88,.16+S.smarts/360+S.social/900+S.eng/1200+degreeBonus+experienceBonus+(current&&current.perf>=65?.06:0)-(S.econ==='recession'?.12:0)));
  if(Math.random()>chance){fx({happiness:-2});log(`${post.name} rejected your application for ${salaryTitle(post.trackId,level)}. You kept your current job.`);hint();render();return;}
  if(current)recordCareer(current,true);
  level=Math.max(level,(S.careerRecords[post.trackId]&&S.careerRecords[post.trackId].level)||0);
  const salary=jobSalaryForPost(post,level,S.country,gameYear());
  const oldTitle=current?current.title:'';
  S.job={trackId:post.trackId,level,title:salaryTitle(post.trackId,level),salary,perf:current&&current.trackId===post.trackId?Math.max(40,current.perf-5):48,years:0,companyId:post.id,company:post.name,benefits:{medical:!!post.medical,social:!!post.social,bonus:post.bonus||0,leave:post.leave||14,remote:post.remote||'On-site',hours:post.hours||40,pension:!!post.social,contract:post.contract||'Permanent'},stress:post.stress||3};
  S.job._companyFactor=post.factor||1;
  if(S.country!==S.home&&S.imm&&S.imm.stage==='post'){S.imm.stage='visa';S.imm.tries=0;S.imm.nojob=0;log('Your local job offer is not permanent-residence permission. Employer sponsorship and immigration approval are still required.');realismNotice('Job offer — sponsorship pending',`You received a job offer from ${post.name}, but your post-study status is not yet a long-term work visa. The immigration decision is still pending.`);}
  fx({happiness:current?2:5});
  log(current?`You changed employers from ${oldTitle} to ${S.job.title} at ${post.name}. Your track level (${level+1}/5) was retained; benefits and pay changed.`:`You were hired by ${post.name} as ${S.job.title}. Salary ${money(salary)}/year.`);
  hint();render();
}
const _applyTrackRealism=applyTrack;
applyTrack=function(trackId){
  const track=TRACKS[trackId];if(!track)return;
  realismInit(S);if(S.age<18)return hint('Full-time jobs start at 18.');
  const rec=S.careerRecords[trackId];const level=rec?rec.level:0;
  const post={trackId,factor:1};const salary=jobSalaryForPost(post,level,S.country,gameYear());
  if(S.job)recordCareer({...S.job},true);
  S.job={trackId,level,title:salaryTitle(trackId,level),salary,perf:50,years:0,company:'Independent employer',benefits:{medical:false,social:true,bonus:0,leave:14,remote:'On-site',hours:40,pension:true,contract:'Permanent'}};
  log(`Started work as ${S.job.title}. Previously earned career rank is retained where applicable.`);render();
};
const _quitJobRealism=quitJob;
quitJob=function(){if(S.job)recordCareer({...S.job},true);_quitJobRealism();};
const _askPromotionRealism=askPromotion;
askPromotion=function(){
  if(!S.job)return;const job=S.job;const l0=job.level;
  _askPromotionRealism();
  if(S.job&&S.job.level>l0){S.job.title=salaryTitle(S.job.trackId,S.job.level);S.job.salary=salaryForTrack(S.job.trackId,S.job.level,S.country,gameYear(),S.job._companyFactor||1.0);recordCareer(S.job);}
  render();
};

/* Scale the original US-dollar pension floor to local wage levels. The base
   game used a flat $6,000 minimum everywhere, which made an Egyptian or other
   lower-income pension larger than many local salaries. */
const _retireNowLocalEconomy=retireNow;
retireNow=function(forced){
  const c=C(),base=S.job?S.job.salary:S.lastSalary;
  const floor=6000*(c.w||1)*(S.country==='egy'?egyptWageIndex(gameYear()):1);
  S.pension=Math.max(Math.round(floor),Math.round(Math.max(0,base||0)*.4));
  S.retired=true;S.job=null;S.part=null;
  log(`${forced?'Mandatory retirement':'You retired'}. Pension: ${money(S.pension)}/yr.`);
};

/* Country-specific taxes and family costs. Other countries retain the
   source model's tax table; the Egyptian tax bands are only an approximation. */
const _incomeTaxRealism=incomeTax;
incomeTax=function(taxable){
  if(!S||S.country!=='egy')return _incomeTaxRealism(taxable);
  const income=Math.max(0,taxable)*rateNow();let tax=0;
  const bands=[[60000,0],[200000,.10],[400000,.15],[1200000,.20],[Infinity,.25]];let prev=0;
  for(const [limit,rate] of bands){if(income>prev)tax+=(Math.min(income,limit)-prev)*rate;prev=limit;if(income<=limit)break;}
  return Math.round(tax/Math.max(.0001,rateNow()));
};
const _histYearRealism=histYear;
histYear=function(){
  const y=gameYear(),t=HIST[y];if(t)log(`${y}: ${t}`);
  if(y===2008&&S.famWealth>0&&Math.random()<.4){S.famWealth--;log('The global financial crisis affected your family income, so they cut back.');}
  if(y===2020){fx({happiness:-4,social:-6});log('COVID disrupted school, work and social life. The impact varied by country and household.');}
  /* US federal stimulus must not be handed to characters living in Egypt or elsewhere. */
  if(S.country==='usa'&&(y===2020||y===2021)&&S.age>=18){const a=y===2020?1200:1400;if(S.income<80000){S.wealth+=a;log(`You received a US pandemic stimulus payment (${money(a)}).`);}}
};

/* Correct a few fixed-price and insurance issues after the original annual
   ledger runs. Employer medical insurance counts as coverage. */
function hasEmployerMedical(){return !!(S&&S.job&&S.job.benefits&&S.job.benefits.medical);}
function effectiveMedicalCover(){return !!(S&&(S.insured||hasEmployerMedical()));}
const medicalEvent=EVENTS.find(e=>e.id==='medical');
if(medicalEvent){
  medicalEvent.text=()=>effectiveMedicalCover()?'A health problem needs treatment. Your health cover pays most of the bill, but there is still a co-payment.':'A health problem needs treatment. Without health cover, the private clinic or hospital bill will be difficult to manage.';
  medicalEvent.choices[0].cost=()=>svc(effectiveMedicalCover()?120:900);
  medicalEvent.choices[0].fx=()=>{const cost=svc(effectiveMedicalCover()?120:900);return {wealth:-cost,health:effectiveMedicalCover()?4:3,msg:`You paid ${money(cost)} for treatment and recovered.`};};
}
const phoneLine=PHONE;
const _ageUpRealism=ageUp;
ageUp=function(){
  const oldJob=S&&S.job?{...S.job}:null;const startAge=S&&S.age;
  if(S&&S.job&&S.job.trackId)recordCareer(S.job,false);
  _ageUpRealism();
  if(!S||S.dead||S.age===startAge)return;
  if(oldJob&&!S.job){oldJob.years=(oldJob.years||0)+1;recordCareer(oldJob,true);}
  if(S.job)recordCareer(S.job,false);
  /* The base game used a flat US-dollar phone bill even in low-cost markets. */
  if(S.bill&&Number.isFinite(S.bill.phone)){
    const before=S.bill.phone,after=Math.round(phoneLine*(S.pr||1));
    if(before!==after){S.bill.phone=after;S.wealth+=before-after;S.expenses+=after-before;}
  }
  if(S.country==='egy'&&S.insured&&S.bill&&S.bill.insurance){
    /* A voluntary private plan is expensive, but not a US-price plan converted blindly. */
    const before=S.bill.insurance,after=localCurrencyInternal(18000,'egy',gameYear());
    S.bill.insurance=after;S.wealth+=before-after;S.expenses+=after-before;
  }
  render();
};

/* ==================== EDUCATION: ENGLISH + LOCAL / INTERNATIONAL MASTERS ==================== */


function localMastersTuition(field,kind,country=S.country){
  if(country==='egy')return Math.round(EGY_MASTERS_LOCAL[field][kind]*p14EgyptPriceIndex(gameYear()));
  const c=COUNTRIES[country]||COUNTRIES.usa;const f=MASTER_FIELDS.find(x=>x.id===field)||MASTER_FIELDS[0];
  let factor=kind==='public'?(c.mastersPublicFactor??.7):(c.mastersPrivateFactor??1.5);
  return Math.round(f.baseUsd*(c.rate||1)*factor);
}
function applyLocalMasters(field,kind,fund){
  if(S.age<21)return hint('Most master’s programmes require an undergraduate degree and adult entry.');
  if(!S.degree)return hint('Finish a bachelor’s degree first.');
  if(S.uni||S.mast||S.localMast)return hint('Finish or leave your current study programme first.');
  if(S.localMasterAppsAge===S.age)return hint('You have already applied for a local master’s this year.');
  if(!MASTER_FIELDS.some(f=>f.id===field))return hint('Choose a master’s subject.');
  const tuition=localMastersTuition(field,kind,S.country),fee=localCurrencyInternal(S.country==='egy'?1500:Math.round(80*(COUNTRIES[S.country]?.rate||1)),S.country,gameYear());
  if(S.wealth<fee)return hint(`Application and document fees cost ${money(fee)}.`);
  S.wealth-=fee;S.localMasterAppsAge=S.age;
  const fieldData=MASTER_FIELDS.find(f=>f.id===field),match=fieldData.related.includes(S.degree),gpa=S.gpaN?S.gpa:2.5;
  let admit=.28+(S.smarts/250)+(match?.12:0)+(gpa>=3.4?.1:0);if(S.econ==='recession')admit-=.04;admit=Math.max(.12,Math.min(.86,admit));
  if(Math.random()>admit){fx({happiness:-4});log(`Your application for ${fieldData.name} at a local ${kind==='public'?'public':'private'} university was rejected. Application fees were not refunded.`);realismNotice('Local master’s application refused',`The university did not offer you a place on ${fieldData.name}. You remain in ${C().n}; you can strengthen your profile and apply in a later year.`);hint();render();return;}
  let cover=0;
  if(fund==='scholar'){const chance=gpa>=3.6?.35:gpa>=3.2?.18:.06;if(Math.random()<chance)cover=1;else{log(`You were admitted to ${fieldData.name}, but the scholarship was not awarded.`);realismNotice('Admission without scholarship',`You were accepted for ${fieldData.name}, but the scholarship competition was unsuccessful. No place was started; choose another funding route in a future year.`);hint();render();return;}}
  else if(fund==='partial'){if(Math.random()<(gpa>=3.4?.48:.25))cover=.5;else{log(`You were admitted to ${fieldData.name}, but no partial scholarship was available.`);realismNotice('Admission without partial funding',`You were accepted for ${fieldData.name}, but no partial scholarship was awarded. You stayed in ${C().n}.`);hint();render();return;}}
  else if(fund==='parents'){const cap=[.18,.55,.95][S.famWealth]||.18;if(!parents().length||bestBond()<30||Math.random()>cap){log('Your parents could not commit to covering your master’s tuition.');hint();render();return;}cover=S.famWealth===0?.25:S.famWealth===1?.6:1;}
  S.localMast={field,fieldName:fieldData.name,kind,fund,cover,left:fieldData.years,year:0,tuition};
  log(`Accepted to a local ${kind==='public'?'public':'private'} programme: ${fieldData.name}. Duration ${fieldData.years} years; tuition ${money(localCurrencyInternal(tuition,S.country,gameYear()))}/year before funding.`);
  realismNotice('Local master’s admission',`You were accepted into ${fieldData.name} in ${C().n}. Check your funding and annual tuition in Education; admission does not guarantee a better job.`);go('school');
}
function leaveLocalMasters(){if(!S.localMast)return;log(`You left ${S.localMast.fieldName} before graduating. Tuition already paid is not refunded.`);S.localMast=null;render();}
function localMastersYear(){
  const m=S.localMast;if(!m)return;
  m.tuition=localMastersTuition(m.field,m.kind,S.country);const tuition=localCurrencyInternal(m.tuition,S.country,gameYear());let due=tuition*(1-(m.cover||0));
  if(m.fund==='parents'&&m.cover<1){const ok=parents().length&&bestBond()>=30&&Math.random()<([.18,.55,.95][S.famWealth]||.18);if(!ok){log('Your parents could not cover this year’s master’s tuition. You must cover the remaining cost yourself.');}else{due=0;log('Your parents helped cover this year’s master’s tuition.');}}
  if(due>0){S.wealth-=due;S.expenses=(S.expenses||0)+due;S.bill=S.bill||{};S.bill.localMasters=(S.bill.localMasters||0)+due;}
  m.year++;m.left--;
  fx({smarts:2,happiness:-1});
  if(S.wealth<0)log('Your master’s tuition and living costs are putting you under financial pressure.');
  if(m.left<=0){const field=m.fieldName;S.completedMasters.push(field);S.masterField=field;S.mastDone=true;S.localMast=null;fx({smarts:5,happiness:7});log(`You completed ${field} in ${C().n}. The qualification may help with relevant jobs but does not guarantee promotion.`);realismNotice('Master’s degree completed',`You completed ${field}. Use Career to apply for roles that value the qualification; experience and company hiring needs still matter.`);}
}
function educationExtras(){
  let html='';
  if(S.age>=12){
    html+=SEC(`English language · current level ${S.eng}%`,PR('English courses belong here because they build a skill for university and work. Self-study is slow but free; paid courses cost money and do not guarantee fluent speaking.')+bar('English',S.eng,'var(--cyan)')+PR(`IELTS result: ${S.ielts||'not taken'}. Universities set their own score requirements.`)+ENG.map((e,i)=>B(e[0],`${svc(e[1])?money(svc(e[1])):'Free'} · +${e[2]} English`,`takeEng(${i})`,S.engDone===S.age||S.wealth<svc(e[1]))).join('')+(S.age>=16?B('Take IELTS / English proficiency exam',money(imp(250)),'takeIelts()',S.wealth<imp(250)):'<p class="muted">You can study English now; IELTS becomes available at 16.</p>'));
  }
  if(S.studentVisaCase){const v=S.studentVisaCase,c=COUNTRIES[v.dest],f=MASTER_FIELDS.find(x=>x.id===v.field);html+=SEC('International master’s · student visa pending',ROW('Admission offer',f?f.name:v.field)+ROW('Destination',`${c.f} ${c.n}`)+ROW('Processing time',`${v.years} of about 1 year`)+PR('You remain at home until the visa decision. The university admission is not the same thing as immigration approval; refusal is possible and fees are not refunded.'));}
  if(S.mast){const c=COUNTRIES[S.mast.dest];html+=SEC('International master’s in progress',ROW('Programme',MASTER_FIELDS.find(f=>f.id===S.mast.field)?.name||S.mast.field||'Master’s programme')+ROW('Country',`${c.f} ${c.n}`)+ROW('Years remaining',S.mast.left)+ROW('Tuition funding',S.mast.fund==='full'?'Full scholarship':S.mast.fund==='part'?'Partial scholarship':S.mast.fund==='parents'?'Family support':'Self-funded')+B('Ask parents for a transfer','They may help or refuse.','askParentsAbroad()')+B(S.mast.work?'Stop campus job':'Work a permitted campus job','Limited work hours; the income rarely covers everything.','toggleCampusJob()')+B('Leave the programme','You may lose student status and may need to return home.','leaveMasterProgram()'));
  }
  if(S.localMast){const m=S.localMast;html+=SEC('Local master’s in progress',ROW('Programme',m.fieldName)+ROW('University type',m.kind==='public'?'Public':'Private')+ROW('Year',`${m.year+1} of ${m.year+m.left}`)+ROW('Tuition before funding',money(localCurrencyInternal(m.tuition,S.country,gameYear()))+'/year')+ROW('Funding',m.cover===1?'Full scholarship':m.cover===.5?'50% scholarship':m.fund==='parents'?'Parents agreed to help':'Self-funded')+B('Leave this master’s','Paid fees are not refunded.','leaveLocalMasters()'));
  }
  if(S.age>=18&&S.degree&&!S.localMast&&!S.mast&&!S.studentVisaCase){
    const fieldSelect=`<select id="local-master-field" data-ui-style="ui-058">${MASTER_FIELDS.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}</select>`;
    const schoolSelect=`<select id="local-master-type" data-ui-style="ui-058"><option value="public">Public university</option><option value="private">Private university</option></select>`;
    const fundSelect=`<select id="local-master-fund" data-ui-style="ui-058"><option value="self">Pay myself</option><option value="parents">Ask parents to pay what they can</option><option value="partial">Compete for a 50% scholarship</option><option value="scholar">Compete for a full scholarship</option></select>`;
    html+=SEC('Local master’s degree',PR(`Choose the subject, public/private institution and funding plan in ${C().n}. A master’s usually takes 1–2 years; admission and scholarships are not guaranteed. Tuition varies sharply by country and university.`)+fieldSelect+schoolSelect+fundSelect+B('Apply for local master’s','Application fees are paid even if rejected.','applyLocalMasters($(\'local-master-field\').value,$(\'local-master-type\').value,$(\'local-master-fund\').value)',S.localMasterAppsAge===S.age));
    if(S.country===S.home){
      const intlField=`<select id="intl-master-field" data-ui-style="ui-058">${MASTER_FIELDS.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}</select>`;
      const countries=Object.entries(COUNTRIES).filter(([k,c])=>k!==S.country&&c.ms).map(([k,c])=>`<details><summary>${c.f} ${c.n} · tuition about ${usd(Math.round((c.ms.t/Math.max(.0001,c.rate||1))*S.prEra))}/yr in USD equivalent · ${c.ms.y} yr · IELTS ${c.ms.i}+</summary>${PR(`Estimated living budget: about ${usd((c.ms.liv||c.livingUSD||1200)*12)}/year before tuition. Germany’s public tuition can be low, but rent, insurance, blocked funds and semester fees still matter. A student visa does not guarantee a job or permanent residence.`)}<div class="acts">${[['self','Self-funded'],['parents','Ask parents to fund'],['part','Apply for 50% funding'],['full','Apply for full scholarship']].map(([f,l])=>`<button class="btn" onclick="applyMasters('${k}','${f}',$('intl-master-field').value)">${l}</button>`).join('')}</div></details>`).join('');
      html+=SEC('International master’s · Europe, North America and beyond',PR('A bachelor’s degree, English test, admission offer, funding evidence and visa decision may all be required. Full scholarships are competitive; rejection is possible, and acceptance does not guarantee a later work visa.')+intlField+countries);
    }
  } else if(S.age>=18&&!S.degree){html+=SEC('Master’s requirements',PR('A master’s requires a completed bachelor’s degree. Choose a local bachelor’s degree in University options first, or enter the workforce if you prefer.'));}
  return html;
}
const _viewSchoolRealism=viewSchool;
viewSchool=function(){return _viewSchoolRealism()+educationExtras();};

/* Replace the old international-master application with explicit admission,
   scholarship and financial checks, then preserve the exact programme field. */
function applyMasters(d,fund,field='finance'){
  const c=COUNTRIES[d];if(!c||!c.ms)return hint('That country has no master’s programme in this version.');
  if(!S.degree)return hint('You need a bachelor’s degree first.');if(S.imm||S.country!==S.home)return hint('You are already abroad.');if(d===S.country)return hint('Choose a different country for an international degree.');
  if(S.mast||S.localMast||S.studentVisaCase)return hint('Finish or resolve your current study / visa application first.');
  if(S.masterAppsAge===S.age)return hint('You have already submitted an international master’s application this year.');
  const f=MASTER_FIELDS.find(x=>x.id===field)||MASTER_FIELDS[0];
  if(S.ielts<(c.ms.i||6))return hint(`${c.n} typically requires IELTS ${c.ms.i}+. Yours: ${S.ielts||'not taken'}.`);
  const fee=imp(300);if(S.wealth<fee)return hint(`Application and document fees cost ${money(fee)}.`);S.wealth-=fee;S.masterAppsAge=S.age;
  const match=f.related.includes(S.degree),gpa=S.gpaN?S.gpa:2.5;
  let chance=.18+S.smarts/300+S.eng/450+(match?.12:0)+(gpa>=3.5?.12:0);if(S.econ==='recession')chance-=.04;chance=Math.max(.1,Math.min(.86,chance));
  if(Math.random()>chance){fx({happiness:-6});log(`${c.n} rejected your application for ${f.name}. The fees were not refunded.`);realismNotice('Master’s admission refused',`${c.n} did not offer you a place on ${f.name}. You stayed in ${C().n}; you can improve your grades, English score or funding before trying again.`);hint();render();return;}
  let cover=0;
  if(fund==='full'){const p=gpa>=3.65?.24:gpa>=3.3?.10:.025;if(Math.random()<p)cover=1;else{log(`You were admitted to ${f.name} in ${c.n}, but the full scholarship was awarded to another candidate.`);realismNotice('Admitted, but scholarship refused',`You received an admission offer from ${c.n} for ${f.name}, but did not receive full funding. You remain at home unless you can meet the funding requirements.`);hint();render();return;}}
  else if(fund==='part'){if(Math.random()<(gpa>=3.3?.42:.22))cover=.5;else{log(`You were admitted to ${f.name} in ${c.n}, but did not receive partial funding.`);realismNotice('Admitted, but partial funding refused',`You received an admission offer for ${f.name}, but no partial scholarship was awarded. You stayed at home.`);hint();render();return;}}
  else if(fund==='parents'){const cap=[.15,.55,.93][S.famWealth]||.15;if(!parents().length||bestBond()<35||Math.random()>.7*cap){log('Your parents could not afford a master’s abroad.');realismNotice('Family funding unavailable','Your parents could not commit to the international tuition and living costs. You stayed in your home country.');hint();render();return;}cover=S.famWealth===0?.20:S.famWealth===1?.55:.85;}
  /* Tuition is listed in the destination's currency; cash and proof-of-funds
     remain in the game's internal USD-equivalent units. */
  const tuitionUSD=(c.ms.t||0)/Math.max(.0001,rateForCountry(d,gameYear()));
  const living=(c.ms.liv||c.livingUSD||1200);
  const proof=cover===1?living*3:Math.max(tuitionUSD*.35,living*5);
  const visaFee=imp(350);
  if(S.wealth<proof+visaFee){log(`You were admitted to ${f.name} in ${c.n}, but you could not afford the visa fees and show enough funds for tuition and living costs.`);realismNotice('Admission without sufficient visa funds',`You received an offer for ${f.name}, but could not meet the estimated proof-of-funds and visa costs. You remain in ${C().n}; the admission may expire.`);hint();render();return;}
  S.wealth-=visaFee;S.studentVisaCase={dest:d,fund,cover,field,years:0,started:gameYear(),proof,visaFee};
  log(`You received an admission offer for ${f.name} in ${c.n}. You applied for a student visa; the decision has not arrived yet.`);
  realismNotice('Master’s admission — visa pending',`You were admitted to ${f.name} in ${c.n}, but you have not moved yet. You paid the visa/application processing costs and must wait about one year for a decision. Refusal is possible; if refused, you stay in ${C().n}.`);go('school');hint();render();
}
function processStudentVisaCase(){
  const req=S&&S.studentVisaCase;if(!req)return;
  req.years++;const c=COUNTRIES[req.dest],field=MASTER_FIELDS.find(f=>f.id===req.field)||MASTER_FIELDS[0];
  if(req.years<1){log(`Student visa update for ${c.n}: processing (${req.years}/1 year).`);return;}
  const base={usa:.68,gbr:.77,can:.79,deu:.86,fra:.82,ita:.81,nld:.78,aus:.76,nzl:.78,jpn:.78,kor:.77,sgp:.77,uae:.74,sau:.75}[req.dest]||.75;
  let chance=base+(req.cover===1?.12:req.cover===.5?.05:0)+(S.ielts>=(c.ms.i||6)+.5?.04:0)+(S.wealth>=req.proof*1.5?.04:0)-(S.famWealth===0&&req.cover<1?.05:0);
  chance=Math.max(.2,Math.min(.96,chance));S.studentVisaCase=null;
  if(Math.random()<chance){moveAbroad(req.dest,req.fund,req.cover);if(S.mast)S.mast.field=req.field;realismNotice('Student visa approved',`Your student visa for ${c.n} was approved after the processing period. You travelled to start ${field.name}. Tuition, living costs and your future right to remain are separate challenges.`);}
  else{fx({happiness:-8});log(`Your student visa for ${c.n} was refused after about one year. The admission and visa fees were not refunded.`);realismNotice('Student visa refused',`Your student visa was refused. You stayed in ${C().n}; you did not travel, and the university may not hold your offer. You can improve documentation/funding or try a different intake later.`);}
  hint();render();
}

function leaveMasterProgram(){if(!S.mast)return;const c=COUNTRIES[S.mast.dest];const dest=S.mast.dest;S.mast=null;log(`You withdrew from the master’s programme in ${c.n}. Your student status may end, so you returned to ${COUNTRIES[S.home].n}.`);leaveAbroad(`You withdrew from your programme in ${c.n} and returned to ${COUNTRIES[S.home].n}.`);}
const _mastYearRealism=mastYear;
mastYear=function(){const m=S&&S.mast?{...S.mast}:null,field=m?m.field:null,dest=m?m.dest:null;let raw=0;if(m){const c=COUNTRIES[dest];raw=Math.round(c.ms.t*S.prEra*(1-m.cover));}_mastYearRealism();if(m&&raw&&S.bill){const fixed=Math.round(raw/Math.max(.0001,rateNow()));S.wealth+=raw-fixed;S.bill.mastersTuition=fixed;}if(S&&dest&&!S.mast&&S.mastDone){S.masterField=field||S.masterField||'';if(field&&!S.completedMasters.includes(field))S.completedMasters.push(field);}};
const _toggleCampusJobRealism=toggleCampusJob;
toggleCampusJob=function(){if(!S.mast)return hint('You are not enrolled in a master’s programme.');_toggleCampusJobRealism();};

/* Remote USD jobs now live in Career, not World. Add a believable job board,
   benefit differences and retained seniority when switching employers. */
function benefitsSummary(b){if(!b)return 'Benefits not recorded';return `${b.medical?'medical plan':'no employer medical plan'} · ${b.social?'social insurance/pension':'limited statutory benefits'} · ${b.leave||14} paid-leave days · ${b.remote||'on-site'} · ${b.contract||'contract details vary'}${b.bonus?` · target bonus ${Math.round(b.bonus*100)}%`:''}`;}
function viewCareer(){
  if(S.age<18)return SEC('Career preparation',PR('You can study, improve English, build experience and take eligible part-time jobs. Full-time roles start at 18.'));
  const ex=allExperience(),rec=S.careerRecords||{};
  let out=SEC('Career market',PR(`Job postings are fictional examples for gameplay, not live vacancies. Pay ranges are approximate local annual pay; your actual offer depends on skills, experience, negotiation and employer. You have ${S.jobAppsAge===S.age?Math.max(0,4-S.jobAppsCount):4} application(s) left this year.`)+ROW('Work experience',`${ex} year(s)`)+ROW('Bachelor’s degree',S.degree?MAJORS[S.degree]?.name||S.degree:'No degree yet')+ROW('Master’s',S.masterField||'None'));
  if(S.job){const j=S.job, b=j.benefits||{};out+=SEC('Your current job',ROW('Employer',j.company||'Employer not recorded')+ROW('Position',j.title)+ROW('Career rank',`${(j.level||0)+1}/5`)+ROW('Annual salary',money(j.salary)) +ROW('Tenure',`${j.years||0} year(s)`)+ROW('Performance',`${j.perf||0}%`)+PR(benefitsSummary(b))+ROW('Remote work',S.remote?S.remote.title:'No separate remote role')+B('Work overtime / harder','May improve performance but increases stress.','workHarder()',S.worked)+B('Request promotion','Promotion is not guaranteed.','askPromotion()',S.promoTried)+B('Resign','Your career rank and experience remain on your record.','quitJob()'));
  }else if(S.retired){out+=SEC('Retirement',ROW('Pension',money(S.pension)+'/year'));}
  else out+=SEC('Job search',PR('Apply to different employers. Switching companies may improve salary or benefits; if you earned a senior rank in a track, that rank is retained in your career history.'));
  const postings=companyListFor(S.country).map(p=>{
    const why=jobEligible(p),rec0=S.careerRecords[p.trackId],lvl=rec0?rec0.level:0,salary=jobSalaryForPost(p,lvl,S.country,gameYear());
    const title=salaryTitle(p.trackId,lvl),matches=S.degree===p.degree||!p.degree;
    return `<details><summary>${p.name} · ${title}</summary>${PR(p.desc)}${ROW('Estimated pay',money(salary)+'/year')}${ROW('Role level',`${lvl+1}/5`)}${ROW('Hours',`${p.hours} hours/week`)}${ROW('Contract',p.contract)}${PR(benefitsSummary(p))}${PR(`Requirements: ${p.degree?`degree in ${p.degree}; `:''}English ${p.eng}%+, Smarts ${p.smarts}%+.`)}<button class="btn" onclick="applyCompany('${p.id}')" ${why?'disabled':''}>${why?why:'Apply to this employer'}</button></details>`;
  }).join('');
  out+=SEC(`Local job postings · ${C().n}`,PR('Open a posting to compare salary, contract, leave, healthcare, pension and remote-work options.')+postings);
  out+=SEC('Remote jobs paid in USD',PR(S.remote?`Current remote role: ${S.remote.title} · ${usd(S.remote.usd)}/year. Client income can be unstable; payments may arrive late or be cut.`:'Remote work is competitive and not guaranteed. You need English, skills, a suitable degree for some roles, reliable internet and time for assessments.')+(S.remote?B('Quit remote contract','You lose the USD income.','quitRemote()'):REMOTE.map(r=>B(r.t,`${usd(Math.round(r.usd*S.wrEra))}/year · English ${r.eng}%+${r.deg?` · ${r.deg==='any'?'bachelor’s degree':`${r.deg} degree`}`:''}`,`searchRemote('${r.id}')`,!remOk(r)||S.didW===S.age)).join('')));
  out+=SEC('Career history',Object.entries(rec).length?Object.entries(rec).map(([id,r])=>ROW(TRACKS[id]?.name||id,`${salaryTitle(id,r.level)} · ${r.years||0} year(s) · highest level ${(r.level||0)+1}/5`)).join(''):PR('Your career history will be recorded when you leave a job, change employers or get promoted.'));
  return out;
}

/* ==================== FAMILY SUPPORT / CUSTOM MONEY / HOUSE GIFTS ==================== */
function transferFamilyCustom(id){const m=S.family.find(x=>x.id===id);if(!m||!m.alive)return hint('This family member is not available.');const el=$(`gift-${id}`),local=Number(el&&el.value);if(!Number.isFinite(local)||local<=0)return hint('Enter an amount greater than zero.');const amount=local/Math.max(.0001,rateNow());if(S.wealth<amount)return hint('You do not have enough cash for that transfer.');S.wealth-=amount;m.bond=clamp(m.bond+(amount>=localCurrencyInternal(S.country==='egy'?5000:100,S.country,gameYear())?6:2));fx({happiness:1,social:1});log(`You transferred ${money(amount)} to ${m.name}.`);hint();render();}
function setCustomAllowance(id){const m=S.family.find(x=>x.id===id);if(!m)return;const el=$(`allow-${id}`),local=Number(el&&el.value);if(!Number.isFinite(local)||local<0)return hint('Enter zero or a positive annual amount.');m.allowLocal=local;m.allowCurrency=S.country;m.allow=local/Math.max(.0001,rateNow());log(`${m.name}'s recurring allowance/support was set to ${money(m.allow)} per year in ${C().cur}.`);hint();render();}
function familySupportCapUSD(){const h=S.home||S.country,fw=Math.max(0,Math.min(2,S.famWealth||0));const caps={egy:[35,150,800],ind:[40,180,800],pak:[30,120,600],nga:[30,130,650],bra:[50,220,1000],tur:[45,200,900],usa:[300,1200,5000],gbr:[250,900,4000],can:[250,900,4000],deu:[200,800,3500],uae:[250,1000,4500],sau:[200,900,4000]};return (caps[h]||[75,300,1400])[fw];}
function requestParentSupport(){
  if(S.age<18)return hint('Use the normal family interaction while you are a minor.');
  if(S.parentHelpAge===S.age)return hint('You already asked your parents this year.');
  if(!parents().length)return hint('Your parents are not available to help.');
  const local=Number($('parent-help-amount')?.value);if(!Number.isFinite(local)||local<=0)return hint('Enter how much help you are asking for.');
  S.parentHelpAge=S.age;const req=local/Math.max(.0001,rateNow());const max=familySupportCapUSD();
  const chance=Math.min(.85,([.25,.58,.82][S.famWealth]||.25)+bestBond()/400);
  if(Math.random()<chance&&bestBond()>=25){const sent=Math.min(req,max);if(sent<=0)return hint('Your family cannot send money from their available budget.');S.wealth+=sent;parents().forEach(m=>m.bond=clamp(m.bond-2));log(`Your parents sent ${money(sent)} toward your expenses${sent<req?'; it was less than you requested because their budget is limited':''}.`);realismNotice('Family transfer received',`Your parents sent ${money(sent)}. Asking regularly can strain them financially and affect your relationship.`);}
  else{parents().forEach(m=>m.bond=clamp(m.bond-2));log('Your parents could not send money this year. Their own bills and income limited what they could do.');realismNotice('Family support refused',`Your parents could not send the requested amount this year. You need another way to cover your costs.`);}
  hint();render();
}
function rateNowForHome(){const y=gameYear();return rateForCountry(S.home||S.country,y);}
function helpParentsWithRequest(){
  const need=S.parentNeed;if(!need)return hint('There is no pending family request.');
  const local=Number($('parent-need-amount')?.value);if(!Number.isFinite(local)||local<=0)return hint('Enter the amount you can afford to give.');
  const amount=local/Math.max(.0001,rateNow());if(amount>S.wealth)return hint('You do not have enough available cash for that amount.');
  S.wealth-=amount;S.expenses=(S.expenses||0)+amount;S.bill=S.bill||{};S.bill.familySupport=(S.bill.familySupport||0)+amount;
  const parent=S.family.find(m=>m.id===need.id);if(parent)parent.bond=clamp(parent.bond+5);fx({happiness:1});S.parentNeed=null;
  log(`You gave ${money(amount)} to your family to help with ${need.reason}. This may delay your own savings goals.`);hint();render();
}
function declineParentRequest(){if(!S.parentNeed)return;const need=S.parentNeed,m=S.family.find(x=>x.id===need.id);if(m)m.bond=clamp(m.bond-5);S.parentNeed=null;fx({happiness:-2});log(`You could not help your family with ${need.reason} this year. The financial pressure remains.`);hint();render();}
function giftHomeToFamily(homeId,memberId){
  const h=S.ownedHomes.find(x=>x.id===homeId),m=S.family.find(x=>x.id===memberId&&x.alive);if(!h||!m)return hint('Choose a home and a living family member.');
  if((h.balance||0)>0)return hint('Pay off the remaining mortgage before transferring the house. The loan cannot disappear with the property.');
  if(!confirm(`Give ${h.name} to ${m.name}? The property and its equity will no longer belong to you.`))return;
  const val=h.value||0,bal=h.balance||0;
  m.giftedHomes=m.giftedHomes||[];m.giftedHomes.push({name:h.name,value:val,balance:bal,cond:h.cond||100});
  if(S.housing===h.id)S.housing=parents().length?'parents':null;
  S.ownedHomes=S.ownedHomes.filter(x=>x!==h);log(`You transferred ${h.name} to ${m.name}. It is now their property and the mortgage responsibility must be resolved within the family.`);realismNotice('Family property transfer',`You gave ${h.name} to ${m.name}. You no longer count its value as your net worth; any remaining mortgage still needs a plan.`);hint();render();
}
const _viewFamilyRealism=viewFamily;
viewFamily=function(){
  const base=_viewFamilyRealism();
  const custom=S.family.map(m=>{if(!m.alive)return '';return `<section class="card"><h3>Money for ${m.name}</h3><p class="muted">Type the amount yourself in ${C().cur}. Transfers reduce your cash immediately; recurring support is charged each year.</p><div class="row"><span>One-time transfer</span><span data-ui-style="ui-059"><input id="gift-${m.id}" type="number" min="0" placeholder="Amount" data-ui-style="ui-060"><button class="menu-btn" onclick="transferFamilyCustom('${m.id}')">Send</button></span></div><div class="row"><span>Annual allowance / support</span><span data-ui-style="ui-059"><input id="allow-${m.id}" type="number" min="0" placeholder="Amount / year" data-ui-style="ui-060"><button class="menu-btn" onclick="setCustomAllowance('${m.id}')">Set</button></span></div><p class="muted" data-ui-style="ui-029">Current recurring support: ${money(m.allow||0)}/year.</p></section>`;}).join('');
  const homes=(S.ownedHomes||[]).map(h=>`<option value="${h.id}">${h.name} · equity ${money((h.value||0)-(h.balance||0))}</option>`).join('');
  const relatives=S.family.filter(m=>m.alive&&(m.role==='Mother'||m.role==='Father'||m.role==='Sibling'||m.role==='Child')).map(m=>`<option value="${m.id}">${m.name} (${m.role})</option>`).join('');
  const homeCard=S.ownedHomes.length&&relatives
    ? SEC('Give a house to a parent or sibling',PR('A house transfer removes the property from your assets. An existing mortgage does not disappear just because you give the property away.')+`<select id="gift-home-id" data-ui-style="ui-058">${homes}</select><select id="gift-home-member" data-ui-style="ui-058">${relatives}</select>`+B('Transfer property','This is a permanent asset transfer.','giftHomeToFamily($(\'gift-home-id\').value,$(\'gift-home-member\').value)'))
    : SEC('Property gifts to family',PR('Buy a property first; then you can transfer an eligible property to a parent or sibling.'));
  const parentNeed=S.parentNeed?SEC('Your family is asking for help',PR(`${(S.family.find(m=>m.id===S.parentNeed.id)||{name:'A parent'}).name} needs help with ${S.parentNeed.reason}. You decide how much you can afford; it is okay to protect your own rent, food and emergency savings.`)+`<div class="row"><span>Amount you can give (${C().cur})</span><input id="parent-need-amount" type="number" min="1" placeholder="Enter amount" data-ui-style="ui-061"></div>`+B('Help with this amount','One-off payment; no fixed amount is imposed.','helpParentsWithRequest()')+B('Decline this year','Your bond may fall, but you can protect your budget.','declineParentRequest()')):'';
  const ask= S.age>=18?SEC('Ask your parents for financial help',PR('They may say no or send only part of the amount. A transfer can strain family savings, especially if they have modest income. Enter the amount you need in your current currency.')+`<div class="row"><span>Requested amount</span><input id="parent-help-amount" type="number" min="1" placeholder="${C().cur}" data-ui-style="ui-061"></div>${B('Ask parents for a transfer','Limited to one request per year.','requestParentSupport()',S.parentHelpAge===S.age||!parents().length)}`):'';
  return base+custom+parentNeed+homeCard+ask;
};

/* ==================== DIRECT IMMIGRATION WITHOUT A MASTER'S ==================== */

function yearsExperience(){return allExperience();}
function startWorkVisaRoute(dest,trackId){
  if(S.age<18)return hint('You must be an adult to apply.');if(S.country!==S.home)return hint('You are already abroad; use your current visa and job options.');if(S.moveCase)return hint('You already have an immigration case processing.');
  if(!COUNTRIES[dest]||dest===S.country)return hint('Choose another country.');
  if(!S.degree&&yearsExperience()<3)return hint('Without a master’s, you can still apply, but you need a bachelor’s degree or around three years of relevant work experience.');
  if(!TRACKS[trackId])return hint('Choose a job category.');
  const fee=imp(350);if(S.wealth<fee)return hint(`Credential checks, translations and visa/job application costs need about ${money(fee)}.`);
  S.wealth-=fee;S.moveCase={kind:'work',dest,trackId,years:0,processing:2,started:gameYear(),attempt:((S.moveAttempts[dest]||0)+1)};S.moveAttempts[dest]=(S.moveAttempts[dest]||0)+1;
  log(`You submitted an employer-sponsored work route to ${COUNTRIES[dest].n}. You stay in ${C().n} while the case processes; rejection is possible and the result will appear in the Life log.`);
  realismNotice('Work visa application submitted',`Your employer-sponsored work route to ${COUNTRIES[dest].n} is processing. It may take more than a year; you are still living and paying bills in ${C().n}. No master’s degree is required if your education or work experience qualifies you.`);hint();go('world');
}
function startSkilledRoute(dest){
  const c=COUNTRIES[dest];if(S.age<18)return hint('You must be an adult to apply.');if(S.country!==S.home)return hint('You are already abroad.');if(S.moveCase)return hint('You already have a case processing.');if(!c||!c.skillRoute)return hint(`${c?.n||'This country'} does not have a skilled route represented in this simple simulation.`);
  if(!S.degree||S.eng<75||yearsExperience()<3)return hint('This route needs a degree, strong English and around three years of relevant experience. A master’s is optional, not mandatory.');
  const fee=imp(900),proof=(c.livingUSD||1500)*6;if(S.wealth<fee+proof)return hint(`Application fees plus proof of funds are roughly ${money(fee+proof)} in this scenario.`);
  S.wealth-=fee;S.moveCase={kind:'skilled',dest,years:0,processing:2,started:gameYear(),attempt:((S.moveAttempts[dest]||0)+1)};S.moveAttempts[dest]=(S.moveAttempts[dest]||0)+1;
  log(`You submitted a points-based skilled migration application for ${c.n}. It is not a guaranteed visa and the funds stay committed while you wait.`);realismNotice('Skilled migration application submitted',`Your ${c.n} skilled-migration case is processing. You remain at home for now and will receive a clear acceptance/refusal result after the processing period.`);hint();go('world');
}
function relocateForWork(dest,trackId){
  const c=COUNTRIES[dest],post=companyListFor(dest).find(x=>x.trackId===trackId)||{id:'international_employer',name:`${c.n} employer`,trackId,factor:1,medical:false,social:true,bonus:0,leave:14,remote:'On-site',hours:40,contract:'Employer-sponsored',stress:4};
  if(S.job)recordCareer({...S.job},true);
  const rec=S.careerRecords[trackId],level=rec?rec.level:0;const salary=salaryForTrack(trackId,level,dest,gameYear(),post.factor||1);
  S.country=dest;S.cf=null;S.rentWorld=false;S.curF=1;S.housing='room';S.transport='bus';S.ownedHomes.forEach(h=>{if(h.status==='live')h.status='vacant';});
  S.job={trackId,level,title:salaryTitle(trackId,level),salary,perf:48,years:0,company:post.name,companyId:post.id,benefits:{medical:!!post.medical,social:!!post.social,bonus:post.bonus||0,leave:post.leave||14,remote:post.remote||'On-site',hours:post.hours||40,pension:!!post.social,contract:post.contract||'Employer-sponsored'},stress:post.stress||4};
  S.job._companyFactor=post.factor||1;S.imm={stage:'work',yrs:0,left:0,nojob:0,tries:0,route:'employer-sponsored'};S.moveCase=null;setWorld(S);fx({happiness:5,social:-5});
  log(`Your employer-sponsored route was approved. You moved to ${c.n} and started work at ${post.name} as ${S.job.title}. Local rent and living bills now apply.`);
  realismNotice('Work visa approved',`Your employer-sponsored route was accepted. You moved to ${c.n} and started ${S.job.title} at ${post.name}. Your residence now depends on keeping eligible status and meeting the local rules.`);
}
function finishSkilledRoute(dest){
  const c=COUNTRIES[dest];S.country=dest;S.cf=null;S.rentWorld=false;S.curF=1;S.housing='room';S.transport='bus';S.ownedHomes.forEach(h=>{if(h.status==='live')h.status='vacant';});S.job=null;S.moveCase=null;S.imm={stage:'pr',yrs:0,left:c.nat||5,nojob:0,tries:0,route:'skilled migration'};setWorld(S);fx({happiness:8,social:-6});log(`Your skilled migration application was approved. You moved to ${c.n} as a permanent resident, but still need to find work and cover living costs.`);realismNotice('Skilled migration approved',`You moved to ${c.n} as a permanent resident. Your visa does not provide a job; local hiring, rent, healthcare and daily expenses begin immediately.`);
}
function processMoveCase(){
  const m=S.moveCase;if(!m)return;m.years++;
  if(m.years<m.processing){log(`Immigration update: your ${m.kind==='work'?'work-sponsored':'skilled'} application for ${COUNTRIES[m.dest].n} is still processing (${m.years}/${m.processing} years).`);return;}
  const c=COUNTRIES[m.dest];let p;
  if(m.kind==='work'){
    const hasDegree=!!S.degree,exp=yearsExperience(),lang=S.eng/(DEST_LANG[m.dest]||55);
    p=.08+(c.v||.35)*.45+Math.min(.18,exp*.025)+(hasDegree?.12:0)+Math.min(.18,lang*.12)+(S.masterField?.05:0)+(S.econ==='recession'?-.08:0);
    p=Math.max(.05,Math.min(.72,p));
    if(Math.random()<p){const dest=m.dest,track=m.trackId;relocateForWork(dest,track);return;}
    S.moveCase=null;fx({happiness:-7});log(`Your employer-sponsored visa/job application for ${c.n} was refused. The decision arrived after ${m.years} years and the fee was not refunded.`);realismNotice('Work visa application refused',`${c.n} refused your work route. You stayed in ${C().n}; this does not automatically end your career. Improve English, experience or skills before reapplying.`);
  }else{
    p=.06+(S.smarts/500)+(S.eng/350)+Math.min(.18,yearsExperience()*.03)+(S.gpa>=3.5?.08:0)+(S.masterField?.06:0);
    p=Math.max(.05,Math.min(.65,p));
    if(Math.random()<p){finishSkilledRoute(m.dest);return;}
    S.moveCase=null;fx({happiness:-7});log(`Your skilled migration application for ${c.n} was refused after ${m.years} years. You remained at home; the fees were not refunded.`);realismNotice('Skilled migration refused',`${c.n} refused your skilled migration application. You stayed in ${C().n}. Recheck points, language results, work history and proof of funds before another application.`);
  }
}
const _immYearRealism=immYear;
immYear=function(){
  const im=S&&S.imm;if(im&&S.country!==S.home&&im.stage==='work'){
    if(!S.job){im.nojob=(im.nojob||0)+1;if(im.nojob===1){log('Work visa warning: you have lost your job. You need eligible work or a new valid status before the grace period expires.');realismNotice('Work visa warning','You lost your sponsoring job. Your permit may be at risk; apply quickly for eligible work or another lawful status.');im.left=1;}else{leaveAbroad('Your work visa grace period ended without eligible work. You had to return to '+COUNTRIES[S.home].n+'.');}return;}
    im.nojob=0;im.yrs=(im.yrs||0)+1;
    if(im.yrs>=(COUNTRIES[S.country].workYears||4)){
      const c=COUNTRIES[S.country];if(c.gc){im.stage='gc';im.left=c.gc;log(`After ${im.yrs} years in eligible work, your employer-backed permanent residence / green-card process started in ${c.n}. Estimated processing: ${im.left} years.`);realismNotice('Permanent residence process started',`Your employer-backed residence process started in ${c.n}. You must keep meeting the work and immigration rules while it is processed.`);}else{im.stage='pr';im.left=c.nat||5;log(`You became eligible for permanent residence in ${c.n}. Citizenship is not immediate; the game estimates ${im.left} more years before eligibility.`);realismNotice('Permanent residence granted',`You received permanent residence in ${c.n}. Citizenship has separate residence, language and application requirements.`);}
    }
    return;
  }
  const prevCountry=S.country,prevStage=im&&im.stage,prevLeft=im&&im.left;
  if(im&&im.stage==='post'&&im.left<=1&&!S.job)realismNotice('Post-study permit nearly expired',`Your post-study work window in ${C().n} has ${im.left} year remaining. You need an eligible employer and a valid status; without one you may have to leave.`);
  _immYearRealism();
  if(S&&prevCountry!==S.country){realismNotice('Immigration status changed',`Your immigration status changed. Check World for the new country, visa and next deadlines.`);}
  else if(S&&S.imm&&prevStage&&S.imm.stage!==prevStage){realismNotice('Immigration status updated',`Your status moved from ${prevStage} to ${S.imm.stage}. Check the World tab for the next step and required timeline.`);}
  else if(S&&S.imm&&prevStage==='pr'&&prevLeft===1&&S.imm.left===0){realismNotice('Citizenship eligibility reached',`You may now apply for citizenship if you meet the country’s current rules and can pay the application costs.`);}
};
const _leaveAbroadRealism=leaveAbroad;
leaveAbroad=function(msg){const before=COUNTRIES[S.country]?.n||S.country,after=COUNTRIES[S.home]?.n||S.home;_leaveAbroadRealism(msg);if(S){realismInit(S);S.lastReturnReason=msg||`You returned from ${before} to ${after}.`;S.notices.unshift({year:gameYear(),title:'Returned home',text:S.lastReturnReason});S.notices=S.notices.slice(0,6);activeTab='life';render();}};
function realismNotice(title,text){if(!S)return;realismInit(S);S.notices.unshift({year:gameYear(),title,text});S.notices=S.notices.slice(0,6);activeTab='life';}
const _viewLifeRealism=viewLife;
viewLife=function(){const notices=(S.notices||[]).slice(0,3).map(n=>SEC(`${n.year} · ${n.title}`,PR(n.text))).join('');return notices+_viewLifeRealism();};

/* Clear milestones when international programme ends, and process new annual
   systems after the original economy has completed the normal ledger. */
const _p10YearRealism=p10Year;
p10Year=function(){
  if(S&&Array.isArray(S.family))S.family.forEach(m=>{if(m.allowLocal!=null)m.allow=localCurrencyInternal(m.allowLocal,m.allowCurrency||S.home||S.country,gameYear());});
  _p10YearRealism();if(!S||S.dead)return;
  if(S.localMast)localMastersYear();
  if(S.moveCase)processMoveCase();
  if(S.studentVisaCase)processStudentVisaCase();
  if(S.job&&S.job.benefits&&S.job.benefits.bonus>0&&Math.random()<.7){const bonus=Math.round(S.job.salary*S.job.benefits.bonus);S.wealth+=bonus;S.income+=bonus;log(`${S.job.company||'Your employer'} paid an annual performance / company bonus of ${money(bonus)} before personal tax.`);}
  if(S.job&&S.job.benefits&&S.job.benefits.medical)S.insured=false;
  if(S.age>=20&&parents().length&&S.parentAskAge!==S.age&&!S.parentNeed){
    const senior=parents().filter(m=>m.age>=55).length,prob=Math.min(.32,(S.famWealth===0?.18:S.famWealth===1?.12:.07)+senior*.05);
    if(Math.random()<prob){const m=pick(parents()),reason=pick(m.age>=60?['medical expenses','retirement income falling short','rent and household bills','an unexpected home repair']:['a medical bill','helping a younger sibling','rent and utility increases','temporary loss of income']);S.parentAskAge=S.age;S.parentNeed={id:m.id,reason,year:gameYear()};log(`${m.name} asked whether you could help with ${reason}. You can choose an amount in Relationships.`);realismNotice('Family asked for help',`${m.name} needs help with ${reason}. You can enter any amount in Relationships, or decline and protect your own budget.`);}
  }
};

/* ==================== HOME VISITS + WORK LEAVE ==================== */
function flightFareUsd(from,to){
  const pair=[from,to].sort().join('-');if(pair==='egy-usa'||pair==='can-usa'||pair==='aus-usa')return 1150;
  const near=['uae','sau','egy','tur','deu','fra','gbr','ita','nld'];
  if((from==='egy'&&['uae','sau','tur'].includes(to))||(to==='egy'&&['uae','sau','tur'].includes(from)))return 300;
  if(near.includes(from)&&near.includes(to))return 500;
  if(['usa','can','aus','nzl'].includes(from)||['usa','can','aus','nzl'].includes(to))return 1000;
  return 650;
}
function visitHome(mode){
  if(S.age<18)return hint('You cannot travel independently yet.');if(S.country===S.home)return hint('You are already in your home country.');if(S.lastTripAge>=S.age-1)return hint('A long-distance family visit is available about once every two years in this simulation.');
  if(S.imm&&S.imm.stage==='student'&&S.mast&&S.mast.left<=0)return hint('Your student status has ended. Resolve your next visa before travelling.');
  const spendLocal=Number($('visit-spend')?.value||0);if(spendLocal<0||!Number.isFinite(spendLocal))return hint('Enter a valid spending budget.');
  const fare=flightFareUsd(S.country,S.home)*(S.prEra||1),spend=spendLocal/Math.max(.0001,rateNow());let leaveCost=0;
  if(S.job){
    const paid=mode==='paid';const chance=paid?(.55+(S.job.perf||0)/300+(S.job.benefits?.leave?0.12:0)):(.78+(S.job.perf||0)/700);if(Math.random()>Math.min(.95,chance)){S.lastTripAge=S.age;log(`${S.job.company||'Your manager'} refused your leave request. You did not buy the ticket.`);realismNotice('Leave request refused',`Your employer refused the leave request this year. You saved the flight and trip money; try again in a later year.`);hint();render();return;}
    if(!paid)leaveCost=Math.round((S.job.salary/52)*2);
  }else if(S.imm?.stage==='student'&&Math.random()<.12){S.lastTripAge=S.age;log('Your course attendance / visa situation made travel too risky this term.');realismNotice('Travel postponed',`You decided not to travel because your academic calendar or visa conditions made the timing risky.`);hint();render();return;}
  const total=fare+spend+leaveCost;if(S.wealth<total)return hint(`The flight, time off and trip spending need about ${money(total)}. You cannot afford it yet.`);
  S.wealth-=total;S.expenses=(S.expenses||0)+total;S.lastTripAge=S.age;S.bill=S.bill||{};S.bill.familyVisit=(S.bill.familyVisit||0)+total;S.social=clamp(S.social+7);S.happiness=clamp(S.happiness+10);parents().forEach(m=>m.bond=clamp(m.bond+8));const leaveText=leaveCost?`, unpaid leave / missed wages ${money(leaveCost)}`:'';const leaveDescription=S.job?(mode==='paid'?'approved paid leave':'unpaid leave or missed wages'):(S.imm?.stage==='student'?'a study break':'time away without a current job');log(`You visited family in ${COUNTRIES[S.home].n}. Flight ${money(fare)}, trip spending ${money(spend)}${leaveText}.`);realismNotice('Family visit completed',`You travelled home to see family. The trip cost ${money(total)}; work/leave impact was ${leaveDescription}. Flights and time away from work or study make frequent visits hard.`);hint();render();
}
function askParentsAbroad(amount){
  if(S.askAb===S.age)return hint('You already asked this year.');S.askAb=S.age;if(!parents().length)return hint('Your parents are no longer available.');
  const requested=Number(amount??$('abroad-parent-amount')?.value);if(!Number.isFinite(requested)||requested<=0)return hint('Enter the amount you are asking your family to send in USD equivalent.');
  const maxUsd=familySupportCapUSD();const asked=requested;const chance=Math.min(.82,([.3,.58,.8][S.famWealth]||.3)+bestBond()/500);
  if(Math.random()<chance&&bestBond()>=25){const sent=Math.min(asked,maxUsd);S.wealth+=sent;parents().forEach(m=>m.bond=clamp(m.bond-2));log(`Your family sent ${usd(sent)} (USD equivalent) while you were abroad${sent<asked?'; less than you requested because their own finances are limited':''}.`);realismNotice('Family transfer received',`Your family sent ${usd(sent)} while you were abroad. You do not need to repay it, but the support may strain their budget.`);}
  else{parents().forEach(m=>m.bond=clamp(m.bond-2));log('Your family could not send money this year. They had their own living costs and commitments.');realismNotice('Family transfer refused','Your family could not help financially this year. Plan around your own savings, permitted work or university support.');}hint();render();
}

/* ==================== WORLD VIEW: VISA PATHWAYS, NOT ENGLISH / MASTER'S ==================== */
function viewWorld(){
  const c=C(),home=COUNTRIES[S.home]||COUNTRIES.egy,abroad=S.country!==S.home,im=S.imm;let out='';
  out+=SEC('Current country',PR(`${c.f} ${c.n}. ${c.d}`)+ROW('Currency',`${c.cur}${c.cur==='USD'?'':` · current reference ${c.rate} per $1`}`)+ROW('Wage level vs USA',`${Math.round((c.w||1)*100)}%`)+ROW('Home purchase cost vs USA',`${Math.round((c.h||1)*100)}%`)+ROW('Approximate rent factor',`${(c.r||1).toFixed(2)}× base rent`)+ROW('Mortgage rate',(S.mortRate*100).toFixed(1)+'%')+(abroad?ROW('Home country',`${home.f} ${home.n}`):'')+PR('Prices and salaries are approximate country-level game values. City, sector, employer, inflation and exchange rates vary widely.'));
  if(abroad&&im){
    const status={student:'Student visa',post:`Post-study job-search window (${im.left} year(s) left)`,visa:`Employer visa decision / sponsorship (${im.tries||0} refusal(s))`,gc:`Green-card / residence process (${im.left} year(s) left)`,pr:im.left>0?`Permanent resident · citizenship eligibility in about ${im.left} year(s)`:'Permanent resident · check citizenship eligibility',citizen:'Citizen',work:`Employer-sponsored work visa · eligible work ${im.yrs||0} year(s)`}[im.stage]||im.stage;
    out+=SEC('Immigration status',ROW('Current status',status)+ROW('Destination',`${c.f} ${c.n}`)+PR(im.stage==='post'?'This is a deadline: an eligible job and a valid next status are required before the post-study period expires. A job offer alone may not guarantee sponsorship.':im.stage==='gc'?'Residence processing can be delayed. Keep records, renew documents and check whether job loss changes your status.':im.stage==='pr'?'Permanent residence is not citizenship. The eligibility period, language tests, fees and other requirements depend on the country.':'Keep valid status, records and employment evidence. Work-permit rules differ by country.')+(im.stage==='post'||im.stage==='visa'?B('Apply for a local job','Two job-search attempts per year in this simplified visa stage.','searchJobAbroad()',!!S.job||S.jobTry>=2):'')+(im.stage==='pr'&&im.left<=0?B('Apply for citizenship',money(imp(1200)),'applyCitizen()',S.wealth<imp(1200)):'')+B('Move back home','You will lose your current overseas status.','goHome()'));
    if(S.mast){out+=SEC('Student expenses and support',ROW('Programme',MASTER_FIELDS.find(f=>f.id===S.mast.field)?.name||S.mast.field||'Master’s programme')+ROW('Tuition each year',money(Math.round((c.ms.t/Math.max(.0001,c.rate||1))*S.prEra*(1-(S.mast.cover||0)))))+ROW('Estimated living budget',usd((c.ms.liv||c.livingUSD||1200)*12)+'/year')+PR('Rent, food, utilities, insurance, transport, textbooks, deposits and travel are separate. A campus job is limited and may not cover all costs.')+B('Ask parents for money','The family may refuse or only send part of the request.','askParentsAbroad()',S.askAb===S.age)+B(S.mast.work?'Stop permitted campus work':'Work a permitted campus job',`Limited hours; approximately ${money(PART_JOBS[1].pay)}/year before local tax`,'toggleCampusJob()')+B('Visit home and family','Airfare, spending and time away from study are extra.','go(\'world\');document.getElementById(\'visit-card\')?.scrollIntoView()'));
    }
    out+=SEC('Visit family back home',PR(S.job?'Long-haul airfare can cost a large share of your savings. Request leave from your employer; it may be refused. Unpaid leave can reduce your wages.':S.imm?.stage==='student'?'Plan the visit during a semester break. Airfare and spending are still expensive, and absence can create attendance or re-entry risks.':'Without a current job, there is no employer leave to request, but airfare and trip spending still cost money.')+ROW('Approximate return airfare',usd(flightFareUsd(S.country,S.home)))+`<div class="row"><label for="visit-spend">Trip spending (${c.cur})</label><input id="visit-spend" type="number" min="0" placeholder="Hotel / gifts / spending" data-ui-style="ui-062"></div>`+`<div class="acts">${S.job?`<button class="btn" onclick="visitHome('paid')" ${S.lastTripAge>=S.age-1?'disabled':''}>Request paid leave and visit</button><button class="btn" onclick="visitHome('unpaid')" ${S.lastTripAge>=S.age-1?'disabled':''}>Request unpaid leave and visit</button>`:`<button class="btn" onclick="visitHome('student')" ${S.lastTripAge>=S.age-1?'disabled':''}>Visit family during available time</button>`}</div>`);
    out+=SEC('Financial support from home',PR(`Ask your parents for a transfer in USD equivalent. Their resources depend on your family’s circumstances; the amount is capped and they can refuse.`)+`<div class="row"><label for="abroad-parent-amount">Amount requested (USD)</label><input id="abroad-parent-amount" type="number" min="1" placeholder="e.g. 200" data-ui-style="ui-061"></div>${B('Ask parents for money','One request per year.','askParentsAbroad()',S.askAb===S.age||!parents().length)}`);
  }
  if(S.studentVisaCase)out+=SEC('Student visa pending',PR(`Your student visa for ${COUNTRIES[S.studentVisaCase.dest].n} is processing. You remain in ${C().n}; the university offer did not guarantee entry. The decision arrives after the annual processing period.`));
  if(!abroad&&S.age>=18&&!S.studentVisaCase){
    const destOpts=Object.entries(COUNTRIES).filter(([k])=>k!==S.country).map(([k,x])=>`<option value="${k}">${x.f} ${x.n}</option>`).join('');
    const trOpts=Object.entries(TRACKS).map(([k,x])=>`<option value="${k}">${x.name}</option>`).join('');
    if(S.moveCase){const m=S.moveCase;out+=SEC('Immigration case in progress',ROW('Route',m.kind==='work'?'Employer-sponsored job':'Points-based skilled migration')+ROW('Destination',`${COUNTRIES[m.dest].f} ${COUNTRIES[m.dest].n}`)+ROW('Time elapsed',`${m.years} of approximately ${m.processing} years`)+PR('You remain in your current country while the case is processed. The decision may be acceptance or refusal; fees are not refunded.'));
    }else{
      out+=SEC('Immigrate without doing a master’s',PR('A master’s degree is optional for some routes. Employer-sponsored jobs usually require a relevant bachelor’s degree or substantial experience, useful English, proof of skills and an employer willing to sponsor. Some destinations also have skilled-migration routes with points and proof-of-funds requirements.')+`<label for="work-dest" class="muted">Destination country</label><select id="work-dest" data-ui-style="ui-058">${destOpts}</select><label for="work-track" class="muted">Job category to target</label><select id="work-track" data-ui-style="ui-058">${trOpts}</select>${B('Apply for employer-sponsored job + work visa','Processing can take years; refusal is possible and fees are not refundable.','startWorkVisaRoute($(\'work-dest\').value,$(\'work-track\').value)')}${B('Apply for points-based skilled migration','Available only for selected destinations; degree, English, experience and proof of funds are checked.','startSkilledRoute($(\'work-dest\').value)')}`);
    }
  }
  out+=SEC('Currency and savings',ROW('Cash available',money(S.wealth))+ROW('US dollars held',usd(S.usdHold||0))+PR('Currency conversion and inflation are simplified for gameplay. Holding dollars can help protect against some local-currency drops but does not remove local living costs or investment risk.')+(c.cur!=='USD'?`<div class="acts acts3">${[['25%',.25],['50%',.5],['All',1]].map(([l,f])=>`<button class="btn" onclick="holdUsd(${f})">Hold ${l} in USD</button>`).join('')}</div>`:'')+(S.usdHold?B('Convert held USD back to local cash','','releaseUsd()'):'') );
  out=out.replace('<section class="card"><h3>Visit family back home</h3>','<section id="visit-card" class="card"><h3>Visit family back home</h3>');
  return out;
}

/* Preserve return-home context in a visible Life notice instead of appearing
   to teleport back to the home country with no explanation. */
const _goHomeRealism=goHome;
goHome=function(){const from=C().n;if(!confirm(`Return to ${COUNTRIES[S.home].n}? You may lose the current overseas visa, job or study status. This cannot be undone.`))return;_goHomeRealism();if(S){S.notices.unshift({year:gameYear(),title:'Voluntary return home',text:`You chose to return from ${from} to ${COUNTRIES[S.home].n}. Your previous overseas visa and any work/study rights ended.`});S.notices=S.notices.slice(0,6);activeTab='life';render();}};


const _searchJobAbroadCareerPatch=searchJobAbroad;
searchJobAbroad=function(){
  const old=S.job,stage=S.imm&&S.imm.stage;
  _searchJobAbroadCareerPatch();
  if(S.job&&S.job!==old&&S.country!==S.home){
    const j=S.job,post=companyListFor(S.country).find(p=>p.trackId===j.trackId);
    j.salary=salaryForTrack(j.trackId,j.level||0,S.country,gameYear(),(post&&post.factor)||1);
    j.company=post?post.name:`Local employer in ${C().n}`;
    j.benefits={medical:!!(post&&post.medical),social:!!(post&&post.social),bonus:(post&&post.bonus)||0,leave:(post&&post.leave)||14,remote:(post&&post.remote)||'On-site',hours:(post&&post.hours)||40,pension:!!(post&&post.social),contract:(post&&post.contract)||'Offer pending sponsorship'};
    if(stage==='post'){S.imm.stage='visa';S.imm.tries=0;S.imm.nojob=0;log(`You found a job at ${j.company}, but your post-study visa still needs employer sponsorship and immigration approval.`);realismNotice('Job offer — sponsorship pending',`You have a job offer in ${C().n}; it is not a visa approval. The application can be refused.`);}
    render();
  }
};

/* Gate expensive parent gifts for families who clearly cannot afford them. */
const phoneGiftEvent=EVENTS.find(e=>e.id==='first_phone');if(phoneGiftEvent){const oldOk=phoneGiftEvent.ok;phoneGiftEvent.ok=()=>S.famWealth>=1&&(!oldOk||oldOk());}

/* Build a version note into the page and finish boot. */
const realismNote=document.createElement('div');realismNote.className='muted realism-note';realismNote.textContent='Lifeline · Realism update: local wages, separate rent scales, education pathways, company benefits and explicit visa outcomes.';const appEl=document.getElementById('app');if(appEl)appEl.appendChild(realismNote);



/* =====================================================================
   PHASE 12 — richer employment, leave/travel, family emergencies and property
   All prices below are game estimates calibrated to public 2026 price examples.
   Employer names and vacancies are fictional, generated and refreshed by year.
   ===================================================================== */

/* ---------- Employment market: varied vacancies and actual application outcomes ---------- */
const P12_OLD_COMPANY_LIST = companyListFor;



function p12Shuffle(a){const b=a.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function p12MakeBoard(country){
  const c=COUNTRIES[country]||COUNTRIES.usa, y=gameYear();
  const required=['arap','accounting','financial','data','customer','supply','developer','bankops'];
  const selected=required.map(id=>P12_ROLE_PROFILES.find(p=>p.id===id)).concat(p12Shuffle(P12_ROLE_PROFILES.filter(p=>!required.includes(p.id))).slice(0,7));
  const board=selected.map((profile,i)=>{
    const brand=country==='egy'?P12_EGY_BRANDS[rnd(P12_EGY_BRANDS.length)]:`${pick(P12_GLOBAL_BRANDS)} ${c.n}`;
    const levelRange=country==='egy'?[.72,1.34]:[.78,1.38];
    const factor=levelRange[0]+Math.random()*(levelRange[1]-levelRange[0]);
    const lowCountry=['egy','ind','pak','nga'].includes(country);
    const sponsorChance=country==='egy' ? .035 : (country==='uae'||country==='sau') ? .22 : (profile.trackId==='tech'||profile.trackId==='finance') ? .32 : .16;
    return {id:`p12_${country}_${y}_${profile.id}_${i}`,trackId:profile.trackId,profileId:profile.id,roleTitle:profile.roleTitle,titles:profile.titles.slice(),name:brand,factor,degree:profile.degree,smarts:profile.smarts,eng:profile.eng,minExp:profile.minExp,medical:Math.random()<(lowCountry ? .36 : .76)&&profile.medical,social:profile.social,bonus:profile.bonus,leave:profile.leave,remote:profile.remote,hours:profile.hours,stress:profile.stress,contract:profile.contract,desc:profile.desc,sponsorship:Math.random()<sponsorChance,postingYear:y,cityCountry:c.n,companySize:pick(['small local employer','mid-sized company','large national employer','regional group']),postedSalaryFactor:factor};
  });
  /* For a player applying abroad, show a genuine mix of employers: at least one willing to sponsor and one that will not. Neither outcome guarantees visa approval. */
  if(country!==S.home&&board.length>=2){
    if(!board.some(p=>p.sponsorship)) board[0].sponsorship=true;
    if(!board.some(p=>!p.sponsorship)) board[board.length-1].sponsorship=false;
  }
  return board;
}
companyListFor=function(country=S.country){
  if(!S)return P12_OLD_COMPANY_LIST(country);
  if(!S.jobBoards)S.jobBoards={};
  const key=`${country}-${gameYear()}`;
  if(S.jobBoards[key])return S.jobBoards[key];
  const board=p12MakeBoard(country);S.jobBoards[key]=board;
  return board;
};
function p12EnsureParentEstateSeed(o){
  if(!o||!Array.isArray(o.family))return;
  const home=o.home||o.country||'egy',year=gameYearFor(o),tier=Math.max(0,Math.min(2,Math.floor(Number(o.famWealth)||0)));
  const cashByCountry={egy:[5000,75000,500000],usa:[400,8000,60000],gbr:[300,6000,42000],can:[350,7000,50000],deu:[250,5000,35000],fra:[250,4500,30000],aus:[350,7000,52000],nzl:[300,6000,43000],uae:[300,8000,55000],sau:[300,7000,50000],nld:[250,5000,35000],ita:[180,3500,25000],tur:[10000,180000,900000],ind:[12000,150000,800000],pak:[9000,120000,650000],nga:[60000,600000,3000000],bra:[1500,25000,180000]};
  const propertyChance=tier===2?.42:tier===1?.08:0;
  for(const m of o.family){
    if(!m||!['Mother','Father'].includes(m.role)||m.estateSeeded)continue;
    const local=(cashByCountry[home]||[300,5000,35000])[tier];
    const scale=home==='egy'?p14EgyptPriceIndex(year):p12ScaleForYear(home,year);
    m.estateInternal=p12LocalCurrencyInternal(local*scale,home,year)*(.65+Math.random()*.70);
    m.estateSeedScale=Math.max(.0001,scale);
    m.estateProperty=tier>0&&Math.random()<propertyChance;
    m.estateSeeded=true;
  }
}
function p12InitState(o){if(!o)return o;const d={jobBoards:{},vacationDays:0,vacationCap:0,jobApplications:[],pendingJobOffer:null,preAgeSeenAge:-1,preAgeResolvedAge:-1,yearPopup:null,propertyMarket:null,tripHistory:[],funeralNotice:null,familyNeed:null,p12NeedAge:-1,medicalQuoteAge:-1,medicalQuote:0,familyEstatePool:0,familyEstatePropertyPool:false,familyEstatePoolYear:0};for(const k in d)if(!(k in o))o[k]=d[k];p12EnsureParentEstateSeed(o);return o;}
const P12_migrateBefore=migrate;migrate=function(o){o=P12_migrateBefore(o);p12InitState(o);return o;};
const P12_newGameBefore=newGame;newGame=function(n,g,t){P12_newGameBefore(n,g,t);p12InitState(S);S.vacationDays=0;S.vacationCap=0;S.jobBoards={};S.tripHistory=[];};
function p12Pip(value){return Number.isFinite(Number(value))?Number(value):0;}
function p12RoleTitle(post,level){const arr=post&&post.titles;return arr&&arr[Math.max(0,Math.min(arr.length-1,level||0))]||salaryTitle(post.trackId,level||0);}
function p12Eligibility(post){
  const base=jobEligible(post);if(base)return base;
  if(trackExperience(post.trackId)<(post.minExp||0))return `Needs ${post.minExp} relevant year(s) of experience.`;
  if(S.age<18)return 'Full-time jobs start at 18.';
  if(S.country!==S.home){const stage=S.imm&&S.imm.stage;if(stage==='student')return 'Your student visa normally limits work hours. Use the permitted campus-work option while studying.';if(!stage)return 'You do not currently have work authorisation for this country.';}
  return '';
}
function p12CanWorkWithoutSponsor(){return S.country===S.home||!!(S.imm&&['citizen','pr','gc'].includes(S.imm.stage));}
function p12BuildJob(post,level,current){
  const salary=jobSalaryForPost(post,level,S.country,gameYear());
  return {trackId:post.trackId,level,title:p12RoleTitle(post,level),roleBase:post.roleTitle||p12RoleTitle(post,level),titles:post.titles||null,salary,perf:current&&current.trackId===post.trackId?Math.max(40,(current.perf||50)-5):48,years:0,companyId:post.id,company:post.name,companySize:post.companySize||'local employer',companyFactor:post.factor||1,postProfileId:post.profileId,benefits:{medical:!!post.medical,social:!!post.social,bonus:post.bonus||0,leave:post.leave||14,remote:post.remote||'On-site',hours:post.hours||40,pension:!!post.social,contract:post.contract||'Contract terms vary'},visaSponsorship:!!post.sponsorship,stress:post.stress||3,vacationGranted:post.leave||14};
}
function applyCompany(companyId){
  if(S.age<18)return hint('Full-time applications start at 18.');p12InitState(S);
  if(S.jobAppsAge!==S.age){S.jobAppsAge=S.age;S.jobAppsCount=0;}
  if(S.jobAppsCount>=4)return hint('You have used all four applications this year. New postings arrive after your next birthday.');
  const post=findCompany(companyId);if(!post)return hint('This vacancy has closed. Check the refreshed job board next year.');
  const why=p12Eligibility(post);if(why)return hint(why);
  S.jobAppsCount++;S.jobApplications=S.jobApplications||[];
  const current=S.job?{...S.job}:null,rec=S.careerRecords[post.trackId];let level=rec?rec.level:0;
  if(current&&current.trackId===post.trackId)level=Math.max(level,current.level||0);
  const exp=trackExperience(post.trackId),fit=(S.degree&&p15DegreeMatch(post,S.degree))? .12:0;
  const chance=Math.max(.06,Math.min(.82,.08+S.smarts/340+S.eng/310+S.social/1100+fit+Math.min(.20,exp*.035)+(current&&current.perf>=65 ? .07 : 0)+(S.masterField ? .04 : 0)+(S.econ==='recession' ? -.14:0)));
  if(Math.random()>chance){S.jobApplications.push({year:gameYear(),company:post.name,role:p12RoleTitle(post,level),result:'Rejected'});fx({happiness:-2});log(`${post.name} rejected your application for ${p12RoleTitle(post,level)}. ${current?'You kept your current job.':'You are still job hunting.'}`);realismNotice('Job application rejected',`${post.name} did not select you for ${post.roleTitle}. Keep your current role if you have one, improve relevant experience, and apply to different employers.`);hint();render();return;}
  const job=p12BuildJob(post,level,current);
  if(S.country!==S.home&&!p12CanWorkWithoutSponsor()){
    const stage=S.imm&&S.imm.stage;
    if(!post.sponsorship){S.jobApplications.push({year:gameYear(),company:post.name,role:job.title,result:'Could not sponsor'});fx({happiness:-1});log(`${post.name} liked your profile but could not sponsor a work visa. No job started.`);realismNotice('Offer unavailable without sponsorship',`${post.name} does not sponsor this type of role. Your current visa has not changed and you cannot legally start this job. Keep searching for a sponsoring employer before your status expires.`);hint();render();return;}
    S.pendingJobOffer={job,postId:post.id,years:0,startedStage:stage||'post',previousJob:current,submittedYear:gameYear(),tries:0};
    S.jobApplications.push({year:gameYear(),company:post.name,role:job.title,result:'Offer — sponsorship decision pending'});
    log(`${post.name} offered you ${job.title}, but work-visa sponsorship and immigration approval are still pending. You cannot start work yet.`);
    realismNotice('Job offer — visa sponsorship pending',`${post.name} offered ${job.title}. The employer is willing to sponsor, but the immigration office still has to approve the case. You remain in your current legal status and receive no salary from the new job until approval.`);hint();render();return;
  }
  if(current)recordCareer(current,true);
  S.job=job;S.retired=false;S.lastSalary=job.salary;S.vacationCap=Math.max(14,(job.benefits.leave||14)*2);S.vacationDays=Math.min(S.vacationCap,Math.max(S.vacationDays||0,job.benefits.leave||14));
  const priorTitle=current?current.title:null;
  S.jobApplications.push({year:gameYear(),company:post.name,role:job.title,result:'Hired'});fx({happiness:current?3:6});
  log(current?`You changed employers from ${priorTitle} to ${job.title} at ${post.name}. Relevant career rank was retained where applicable. Pay, insurance, paid leave and working hours changed with the new contract.`:`You were hired at ${post.name} as ${job.title}, earning ${money(job.salary)} per year before tax. Benefits are shown in Career.`);
  realismNotice(current?'New job and employer':'New job offer accepted',`${post.name}: ${job.title}. Annual pay ${money(job.salary)} before tax; ${benefitsSummary(job.benefits)}. The offer is not a guarantee of promotion or long-term security.`);hint();render();
}
function askPromotion(){
  if(!S.job)return;const j=S.job,track=TRACKS[j.trackId];if(!track||j.level>=track.levels.length-1)return hint('You have reached the top available rank in this track.');
  if(S.promoTried)return hint('You already requested a promotion this year.');S.promoTried=true;
  const next=j.level+1,years=j.years||0;const chance=Math.max(.05,Math.min(.78,.08+(j.perf||0)/180+S.smarts/400+Math.min(years,8)*.035-(S.econ==='recession'?.12:0)));
  if(S.smarts<track.levels[next].reqSmarts||Math.random()>chance){j.perf=clamp(j.perf-5);fx({happiness:-3});log(`${j.company||'Management'} refused your promotion request. You remain ${j.title}; the decision was not a demotion.`);realismNotice('Promotion declined',`Your request was declined. Your existing job title, salary and seniority remain; revisit after delivering results or gaining another year of experience.`);}
  else{j.level=next;j.title=p12RoleTitle({titles:j.titles,trackId:j.trackId},next);j.salary=Math.round(salaryForTrack(j.trackId,next,S.country,gameYear(),j.companyFactor||1));j.perf=50;j.years=0;recordCareer(j);fx({happiness:8});log(`PROMOTED at ${j.company||'your employer'}: ${j.title}, now earning ${money(j.salary)}/year.`);realismNotice('Promotion received',`You advanced to ${j.title}. Your salary increased; hours, responsibility and stress may also increase.`);}
  render();
}
function quitJob(){if(!S.job)return;const j={...S.job};recordCareer(j,true);S.lastSalary=j.salary;S.job=null;log(`You resigned from ${j.company||'your employer'} as ${j.title}. Your recorded experience and career rank remain on file; you do not automatically start at junior level when you apply again.`);realismNotice('Employment ended',`You left ${j.company||'your employer'} as ${j.title}. You now have no salary from that position. Your career history is preserved, but re-employment and pay are not guaranteed.`);render();}
function p12RemoteEligibility(r){if(!r||S.age<18)return 'Available from age 18.';if(S.eng<(r.eng||0))return `English level ${r.eng}% is required.`;if(S.smarts<(r.smarts||0))return `Needs ${r.smarts}% Smarts.`;if(r.deg&&r.deg!=='any'&&S.degree!==r.deg)return `Needs a ${r.deg} degree.`;if(r.deg==='any'&&!S.degree)return 'A completed bachelor’s degree is required.';if(trackExperience(r.track||'entry')<(r.exp||0))return `Needs ${r.exp} relevant year(s) of experience.`;if(r.premium&&!S.masterField&&!S.mastDone&&S.smarts<85)return 'Premium US-pay roles need a very strong profile, portfolio and/or postgraduate study.';return '';}
REMOTE.push(
  {id:'bookkeep',t:'Remote bookkeeping assistant (international SME)',eng:48,smarts:40,usd:9000,deg:null,st:3,track:'finance',exp:0,perks:'Contractor; no guaranteed insurance, paid leave or sponsorship.'},
  {id:'arremote',t:'Remote AR/AP accountant (global finance team)',eng:63,smarts:50,usd:16000,deg:'business',st:4,track:'finance',exp:1,perks:'USD contract; invoicing and close deadlines; benefits depend on employer.'},
  {id:'eval',t:'Remote data quality / AI evaluator',eng:62,smarts:58,usd:12000,deg:null,st:4,track:'tech',exp:0,perks:'Project-based work; hours and task availability can change abruptly.'},
  {id:'finremote',t:'Remote financial analyst (international company)',eng:80,smarts:70,usd:30000,deg:'business',st:5,track:'finance',exp:3,perks:'Competitive contract; usually requires demonstrable reporting experience.'},
  {id:'biremote',t:'Remote BI / data analyst (international company)',eng:84,smarts:76,usd:38000,deg:'any',st:5,track:'tech',exp:3,perks:'Portfolio and stakeholder communication required; USD pay is not common.'},
  {id:'devremote',t:'Remote software engineer (international company)',eng:84,smarts:78,usd:46000,deg:'cs',st:6,track:'tech',exp:3,perks:'Technical interview, code review and strong production skills expected.'},
  {id:'uspremium',t:'Rare US-market salary remote analyst',eng:92,smarts:88,usd:62000,deg:'any',st:7,track:'finance',exp:5,premium:true,perks:'Very competitive; US-level pay from Egypt is rare and usually demands senior results, excellent English and a strong portfolio.'}
);
const P15_remoteEligibilityBeforeStatus=p12RemoteEligibility;
p12RemoteEligibility=function(r){const why=P15_remoteEligibilityBeforeStatus(r);if(why)return why;if(S&&S.country!==S.home&&!p12CanWorkWithoutSponsor())return 'This contractor role does not provide visa sponsorship; your current overseas status does not independently authorise this job.';return '';};
remOk=function(r){return !p12RemoteEligibility(r);};
searchRemote=function(id){const r=REMOTE.find(x=>x.id===id);const why=p12RemoteEligibility(r);if(why)return hint(why);if(S.didW===S.age)return hint('You already used your remote-work search this year.');S.didW=S.age;const exp=trackExperience(r.track||'entry');let chance=.035+Math.max(0,S.eng-(r.eng||0))/260+Math.max(0,S.smarts-(r.smarts||0))/420+exp*.025+((S.masterField||S.mastDone)? .05 : 0);if(r.premium)chance=.008+Math.max(0,S.eng-92)/100+Math.max(0,S.smarts-88)/160+Math.max(0,exp-5)*.015;if(S.econ==='recession')chance*=.7;chance=Math.min(r.premium ? .12 : .48,chance);if(Math.random()<chance){S.remote={id,title:r.t,usd:Math.round(r.usd*(S.wrEra||1)),st:r.st,perks:r.perks||'Benefits depend on contract.'};S.rsTry=0;fx({happiness:8});log(`You landed ${r.t}, paying about ${usd(S.remote.usd)}/year. This is a remote contract, not local salary parity or an immigration visa.`);realismNotice('Remote role secured',`${r.t}. USD income can improve your options, but it is competitive and may have no employer healthcare, pension, paid leave or visa sponsorship.`);}else{S.rsTry=(S.rsTry||0)+1;fx({happiness:-3});log(`Your application for ${r.t} was rejected or the client chose another applicant. Remote hiring is competitive; the vacancy may reopen later.`);realismNotice('Remote job search unsuccessful',`You did not get ${r.t} this year. Improve portfolio evidence, English, relevant work experience and interview performance before trying again.`);}hint();render();};

/* Make benefits matter during a work year; a plan protects against large medical bills. */
function p12HasHealthCover(){return !!(S&&(S.insured||(S.job&&S.job.benefits&&S.job.benefits.medical)));}
function p12MedicalBill(){if(S.medicalQuoteAge===S.age&&S.medicalQuote>0)return S.medicalQuote;const c=COUNTRIES[S.country]||COUNTRIES.usa;let usdBase;if(S.country==='egy'){const egp=p12HasHealthCover()?3500+Math.random()*8500:18000+Math.random()*95000;S.medicalQuote=localCurrencyInternal(egp*p14EgyptPriceIndex(gameYear()),'egy',gameYear());}else{usdBase=p12HasHealthCover()?90+Math.random()*450:800+Math.random()*12000;S.medicalQuote=usdBase*(c.p||1);}S.medicalQuoteAge=S.age;return S.medicalQuote;}
const P12_medicalEvent=EVENTS.find(e=>e.id==='medical');if(P12_medicalEvent){P12_medicalEvent.text=()=>p12HasHealthCover()?`A health problem requires treatment. Your ${S.job&&S.job.benefits&&S.job.benefits.medical?'employer health plan':'insurance'} covers much of the bill, but the estimated out-of-pocket cost is ${money(p12MedicalBill())}.`:`A health problem requires treatment and you do not have effective insurance. The estimated bill is ${money(p12MedicalBill())}, which could wipe out savings.`;P12_medicalEvent.choices[0].cost=()=>p12MedicalBill();P12_medicalEvent.choices[0].fx=()=>{const cost=p12MedicalBill();return {wealth:-cost,health:6,msg:`You paid ${money(cost)} for treatment and recovered, but your finances took a hit.`};};}
const P12_incomeTaxBefore=incomeTax;
incomeTax=function(taxable){
  const t=Math.max(0,Number(taxable)||0),country=S&&S.country;
  if(!S||country==='egy')return P12_incomeTaxBefore(t);
  if(country==='uae'||country==='sau')return 0;
  const bands={
    usa:[[11925,.10],[48350,.12],[103350,.22],[197300,.24],[250525,.32],[626350,.35],[Infinity,.37]],
    can:[[55867,.15],[111733,.205],[173205,.26],[246752,.29],[Infinity,.33]],
    gbr:[[15000,0],[50000,.20],[125000,.40],[Infinity,.45]],
    deu:[[12000,0],[70000,.22],[300000,.42],[Infinity,.45]],
    fra:[[12000,0],[30000,.11],[85000,.30],[180000,.41],[Infinity,.45]],
    aus:[[18200,0],[45000,.16],[135000,.30],[190000,.37],[Infinity,.45]],
    nld:[[10000,.09],[75000,.37],[Infinity,.495]],
    ita:[[8500,.23],[28000,.25],[50000,.35],[Infinity,.43]],
    nzd:[[15600,.105],[53500,.175],[78100,.30],[180000,.33],[Infinity,.39]],
    sgp:[[20000,0],[40000,.02],[80000,.07],[120000,.115],[200000,.18],[500000,.22],[Infinity,.24]],
    jpn:[[7000,.05],[20000,.10],[40000,.20],[70000,.23],[150000,.33],[300000,.40],[Infinity,.45]],
    kor:[[12000,.06],[46000,.15],[85000,.24],[150000,.35],[300000,.38],[Infinity,.45]]
  }[country]||[[12000,0],[40000,.12],[90000,.22],[200000,.30],[Infinity,.35]];
  let tax=0,prev=0;for(const [limit,rate] of bands){if(t>prev)tax+=(Math.min(t,limit)-prev)*rate;prev=limit;if(t<=limit)break;}return Math.round(tax);
};

/* ---------- Property market: unique listings and features, local price scales ---------- */


function p12LocalCurrencyInternal(amount,country=S.country,year=gameYear()){return Math.max(0,Number(amount)||0)/Math.max(.0001,rateForCountry(country,year));}
function p12ScaleForYear(country,y){return country==='egy'?egyptWageIndex(y):(typeof prOf==='function'?prOf(y,S):1);}
function p12EnsureListingCategory(listing){if(!listing||!listing.catId)return null;let c=HOUSING_CATALOG.find(x=>x.id===listing.catId);if(c)return c;const type=P12_PROPERTY_TYPES.find(x=>x.id===listing.typeId)||P12_PROPERTY_TYPES[0];const price=listing.priceInternal||listing.internalPrice||100000;const cat={id:listing.catId,kind:'buy',name:listing.name,price, pay:Math.round(price*.08),util:Math.round(price*.008),rentInc:Math.round(price*(type.rent||.003)*12),cost:0,hap:listing.condition<50?-1:listing.features.some(x=>/view|garden|terrace/i.test(x))?3:1,hp:listing.condition<45?-1:1,desc:(listing.features||[]).join(', ')};HOUSING_CATALOG.push(cat);return cat;}
function p12GenerateMarket(){
  const c=COUNTRIES[S.country]||COUNTRIES.usa,y=gameYear(),out=[];
  const types=p12Shuffle(P12_PROPERTY_TYPES).slice(0,7);
  const locationList=P12_LOCATIONS[S.country]||P12_LOCATIONS.gulf;
  types.forEach((type,i)=>{
    const condition=35+rnd(66),factor=.78+Math.random()*.60,location=pick(locationList);
    const features=[];
    type.features.forEach(f=>{if(Math.random()<.66)features.push(f);});
    if(Math.random()<.35)features.push('Renovated kitchen');if(Math.random()<.3)features.push('New water heater');if(Math.random()<.20)features.push('Jacuzzi bath');if(Math.random()<.18)features.push('Premium marble');
    const view=['Quiet courtyard view','Street view','Green garden view','Landmark view','Sea / lake view','Neighbourhood skyline'][rnd(6)];if(Math.random()<.68)features.push(view);
    const furnishedQuality=pick(['Unfurnished','Basic furniture','Good quality furniture','Premium furnished']);if(furnishedQuality!=='Unfurnished')features.push(furnishedQuality);
    const conditionFactor=.60+(condition/100)*.52;
    const featureFactor=(features.some(f=>/Sea|Landmark/i.test(f))?1.13:1)*(features.includes('Private garden')||features.includes('Green garden view')?1.10:1)*(features.includes('Elevator')?1.035:1)*(features.includes('Renovated kitchen')?1.045:1)*(furnishedQuality==='Premium furnished'?1.055:furnishedQuality==='Good quality furniture'?1.025:1);
    let internal=type.base*(c.h||1)*factor*conditionFactor*featureFactor*p12ScaleForYear(S.country,y);
    if(S.country==='egy'){const currentEgp=internal*rateForCountry('egy',y);/* listings calibrated against Alexandria / Cairo asking-price examples */ internal=Math.max(p12LocalCurrencyInternal((type.id==='studio'?850000:type.id==='oldflat'?1700000:type.id==='modernflat'?2700000:type.id==='condo'?3800000:type.id==='townhouse'?6500000:type.id==='villa'?9000000:type.id==='penthouse'?8500000:24000000)*p14EgyptPriceIndex(y),'egy',y),internal);}
    const catId=`p12home_${S.country}_${y}_${i}_${Math.random().toString(36).slice(2,5)}`;
    const listing={id:`listing_${catId}`,catId,typeId:type.id,name:`${condition<50?'Needs work · ':condition>88?'Excellent condition · ':''}${type.name}`,typeLabel:type.name,location,condition,features,furnishedQuality,priceInternal:Math.round(internal),originalYear:y,marketRentRate:type.rent,tenantChance:.35+condition/220};
    p12EnsureListingCategory(listing);out.push(listing);
  });return out;
}
function p12PropertyMarket(){p12InitState(S);if(!Array.isArray(S.propertyMarket)||!S.propertyMarket.length||S.propertyMarketYear!==gameYear()||S.propertyMarketCountry!==S.country){S.propertyMarket=p12GenerateMarket();S.propertyMarketYear=gameYear();S.propertyMarketCountry=S.country;}S.propertyMarket.forEach(p12EnsureListingCategory);return S.propertyMarket;}
const P12_rentCostBefore=rentCost;
rentCost=function(h){if(S&&S.country==='egy'&&['room','studio','apt2'].includes(h.id)){const base={room:30000,studio:54000,apt2:96000}[h.id];return p12LocalCurrencyInternal(base*egyptWageIndex(gameYear()),'egy',gameYear());}return P12_rentCostBefore(h);};
function p12BuyListing(id,financing){const list=p12PropertyMarket().find(x=>x.id===id);if(!list)return hint('This listing was withdrawn; check the new market.');const cat=p12EnsureListingCategory(list);const price=list.priceInternal,down=financing==='mortgage'?Math.round(price*.20):price;if(S.wealth<down)return hint(`You need ${money(down)} upfront. Property prices are based on location, condition and features.`);if(S.housing!== 'parents' && S.housing==null)return hint('Choose your current housing situation first.');S.wealth-=down;const rate=S.mortRate||.05;const years=20;const annualPay=financing==='mortgage'?Math.round((price-down)*(rate/(1-Math.pow(1+rate,-years)))):0;const home={id:'h_p12_'+Math.random().toString(36).slice(2,8),catId:cat.id,name:list.name,value:price,balance:financing==='mortgage'?price-down:0,cond:list.condition,rentInc:Math.round(price*(list.marketRentRate||.003)*12),status:'vacant',pay:annualPay,rate,features:list.features.slice(),location:list.location,marketCountry:S.country,typeId:list.typeId,furnishedQuality:list.furnishedQuality,marketRentRate:list.marketRentRate||.003,p12:true,listingDetails:{...list}};S.ownedHomes.push(home);S.propertyMarket=S.propertyMarket.filter(x=>x.id!==id);if(financing!=='mortgage')home.balance=0;log(`You bought ${home.name} in ${home.location} for ${money(price)}${financing==='mortgage'?` with a 20% deposit and estimated annual mortgage payments of ${money(annualPay)}`:' in cash'}.`);realismNotice('Property purchased',`${home.name} in ${home.location}. Condition: ${home.cond}%. Features: ${home.features.join(', ')||'basic finish'}. Maintain it, insure it where available, and account for mortgage interest, repairs, vacancy and taxes.`);render();}
function p12SetRental(homeId){
  const h=S.ownedHomes.find(x=>x.id===homeId);if(!h)return;
  const el=$(`p12-rent-${homeId}`),pct=$(`p12-rise-${homeId}`);
  const local=Number(el&&el.value),rentCountry=h.marketCountry||h.rentCurrency||S.country;
  const currency=(COUNTRIES[rentCountry]||COUNTRIES.usa).cur;
  if(!Number.isFinite(local)||local<=0)return hint('Enter a monthly rent amount.');
  const amount=local/Math.max(.0001,rateForCountry(rentCountry,gameYear()));
  if(S.housing===h.id){const confirmed=confirm('You are living in this property. Listing it for rent means you will need to move out. Continue?');if(!confirmed)return;S.housing=parents().length?'parents':null;}
  h.p12=true;h.marketCountry=h.marketCountry||rentCountry;h.rentLocalAmount=local;h.rentAmount=amount;h.rentCurrency=rentCountry;h.rentStepPct=Number(pct&&pct.value)||0;h.rentContractYears=0;h.tenant=false;h.status='p12-listed';h.rentInc=amount*12;
  log(`You listed ${h.name} in ${rentCountry} for ${local.toLocaleString()} ${currency} per month with ${h.rentStepPct}% annual contract increases. Finding a tenant is not guaranteed.`);
  hint();render();
}
function p12SettleRentalYear(){
  if(!S||!Array.isArray(S.ownedHomes))return;
  S.ownedHomes.forEach(h=>{
    if(!h.p12||!['p12-listed','p12-rented'].includes(h.status))return;
    const rentCountry=h.rentCurrency||h.marketCountry||S.country;
    if(Number.isFinite(h.rentLocalAmount)&&h.rentLocalAmount>0)h.rentAmount=h.rentLocalAmount/Math.max(.0001,rateForCountry(rentCountry,gameYear()));
    const fair=h.value*(h.marketRentRate||.003)*12;
    if(h.status==='p12-listed'){
      const ask=h.rentAmount*12,acceptance=Math.min(.88,Math.max(.04,.72-(ask-fair)/Math.max(1,fair)*.5));
      if(Math.random()<acceptance){h.status='p12-rented';h.tenant=true;h.tenantStartYear=gameYear();h.rentContractYears=0;log(`A tenant agreed to rent ${h.name} at ${(h.rentLocalAmount||Math.round(h.rentAmount*rateForCountry(rentCountry,gameYear()))).toLocaleString()} ${(COUNTRIES[rentCountry]||COUNTRIES.usa).cur}/month. A lease is in place.`);}
      else{log(`No tenant accepted the asking rent for ${h.name} this year. The property stayed vacant.`);return;}
    }
    if(h.status==='p12-rented'){
      const annual=h.rentAmount*12*Math.max(.35,(h.cond||100)/100),received=Math.round(annual);
      S.wealth+=received;S.income=(S.income||0)+received;S.expenses=S.expenses||0;S.bill=S.bill||{};S.bill.propertyRent=(S.bill.propertyRent||0)+received;
      const maintenance=Math.round(h.value*((h.cond||100)<50?.025:.012));S.wealth-=maintenance;S.expenses+=maintenance;S.bill.rentalMaintenance=(S.bill.rentalMaintenance||0)+maintenance;
      if(gameYear()>(h.tenantStartYear||gameYear())){
        h.rentContractYears=(h.rentContractYears||0)+1;
        if(h.rentStepPct&&h.rentContractYears>=1){h.rentLocalAmount=Math.round((h.rentLocalAmount||h.rentAmount*rateForCountry(rentCountry,gameYear()))*(1+h.rentStepPct/100));h.rentAmount=h.rentLocalAmount/Math.max(.0001,rateForCountry(rentCountry,gameYear()));h.rentContractYears=0;log(`The signed lease allows a ${h.rentStepPct}% rent increase for ${h.name}. The new nominal monthly rent is ${h.rentLocalAmount.toLocaleString()} ${(COUNTRIES[rentCountry]||COUNTRIES.usa).cur}.`);}
        if(Math.random()<.12){h.tenant=false;h.status='p12-listed';log(`Your tenant left ${h.name}. You will need to find a replacement tenant.`);}
      }
    }
  });
}
const P12_sellOwnedBefore=sellOwnedProperty;sellOwnedProperty=function(idx){const h=S.ownedHomes[idx];if(h&&h.p12&&!confirm(`Sell ${h.name} in ${h.location||'the selected area'} for an estimated net equity of ${money(h.value-h.balance)}? Asking prices may not equal the price received.`))return;P12_sellOwnedBefore(idx);};
function p12Renovate(homeId,kind,quality){
  const h=S.ownedHomes.find(x=>x.id===homeId);if(!h)return;
  const marketCountry=h.marketCountry||S.country,c=COUNTRIES[marketCountry]||COUNTRIES.usa,q=Math.max(1,Math.min(3,Number(quality)||1));
  const table={
    kitchen:[['Basic cabinet repair and countertop',1200,15000],['New cabinets, sink and durable countertop',4200,52000],['Premium kitchen, stone surfaces and custom cabinetry',12000,145000]],
    bathroom:[['Fix plumbing, tiles and standard heater',700,9000],['Modern bathroom, heated water and quality fixtures',2500,31000],['Marble finish, premium shower and jacuzzi bath',6500,82000]],
    appliances:[['Basic refrigerator or washing-machine replacement',350,4500],['Two mid-range appliances',950,12500],['Premium imported appliance package',3200,42000]],
    electrical:[['Safety repairs and basic rewiring',500,6500],['New distribution board, wiring and lighting',1700,22000],['Smart controls and premium fittings',4200,54000]],
    paint:[['Patch and repaint',250,3200],['Quality paint and finish',700,9000],['Designer finish and decorative panels',2200,28000]],
    aircon:[['One basic split AC',500,6500],['Inverter AC plus installation',1100,14000],['Multi-room climate system',4000,51000]]
  };
  const opt=(table[kind]||table.kitchen)[q-1],desc=opt[0];
  const localCost=marketCountry==='egy'?opt[2]*p14EgyptPriceIndex(gameYear()):opt[1]*(c.p||1)*p12ScaleForYear(marketCountry,gameYear())*Math.max(.0001,rateForCountry(marketCountry,gameYear()));
  const internal=localCost/Math.max(.0001,rateForCountry(marketCountry,gameYear()));
  if(S.wealth<internal)return hint(`${desc} costs about ${money(internal)} equivalent. You need more available cash.`);
  S.wealth-=internal;h.renovations=h.renovations||[];h.features=h.features||[];h.renovations.push(desc);
  if(kind==='kitchen')h.features.push(q===3?'Premium renovated kitchen':'Renovated kitchen');
  if(kind==='bathroom')h.features.push(q===3?'Marble bathroom with jacuzzi':'Updated bathroom and heated water');
  if(kind==='appliances')h.features.push(q===3?'Premium appliances':q===2?'Mid-range appliances':'Replacement appliances');
  if(kind==='aircon')h.features.push('Air conditioning');
  h.cond=clamp((h.cond||50)+([10,18,25][q-1]));h.value=Math.round(h.value*(1+[.015,.04,.08][q-1]));
  log(`Renovated ${h.name} in ${marketCountry}: ${desc}. Cost ${money(internal)} equivalent.`);render();
}
function p12Features(h){return (h.features||[]).length?h.features.join(' · '):'Basic features; no special finish recorded.';}
function viewAssets(){
 if(S.age<18)return SEC('Real estate',PR('You live with your family. In adult life, home prices depend on location, condition, floor, building maintenance, views and finish.'));
 p12PropertyMarket();let out=SEC('Property dashboard',ROW('Owned properties',S.ownedHomes.length)+ROW('Property equity',money(propertyValueTotal()))+ROW('Local mortgage rate',`${((S.mortRate||.05)*100).toFixed(1)}%`)+PR('Listings are generated game examples, not live properties. Condition, location, elevator, balcony, garden, sea/landmark views, kitchen finish and furniture can change the asking price. Mortgage payments and repairs continue even when a home is vacant.'));
 const current=S.ownedHomes.find(h=>h.id===S.housing);
 if(current)out+=SEC('Your current home',ROW('Property',current.name)+ROW('Location',current.location||'Not recorded')+ROW('Condition',`${current.cond||100}%`)+PR(p12Features(current))+ROW('Mortgage remaining',money(current.balance||0))+B('Furnish this property','Shop for appliances and furniture.','furnishHome(\''+current.id+'\')'));
 if(S.ownedHomes.length){out+=SEC('Manage owned properties',S.ownedHomes.map((h,i)=>{
   p12EnsureListingCategory(h.listingDetails||h);const rentInput=`<div class="row"><label for="p12-rent-${h.id}">Monthly asking rent (${(COUNTRIES[h.marketCountry||h.rentCurrency||S.country]||C()).cur})</label><input id="p12-rent-${h.id}" type="number" min="1" value="${h.rentLocalAmount||''}" placeholder="Monthly rent" data-ui-style="ui-063"></div><div class="row"><label for="p12-rise-${h.id}">Signed-contract annual rise</label><select id="p12-rise-${h.id}"><option value="0">0%</option><option value="10">10%</option><option value="20">20%</option></select></div>`;
   const reno=`<details><summary>Detailed renovations</summary><p class="muted">Each tier changes the condition and estimated resale value. Premium appliances and finishes cost substantially more.</p><label>Renovation</label><select id="p12-reno-${h.id}" data-ui-style="ui-064"><option value="kitchen">Kitchen / cabinets / countertop</option><option value="bathroom">Bathroom / hot water / jacuzzi / marble</option><option value="appliances">Appliances</option><option value="electrical">Electrical and lighting</option><option value="paint">Paint and finish</option><option value="aircon">Air conditioning</option></select><label>Quality</label><select id="p12-quality-${h.id}" data-ui-style="ui-064"><option value="1">Basic / repair</option><option value="2">Good quality</option><option value="3">Premium / luxury</option></select><button class="btn" onclick="p12Renovate('${h.id}',$('p12-reno-${h.id}').value,$('p12-quality-${h.id}').value)">Complete renovation</button></details>`;
   return `<div data-ui-style="ui-065"><b>${h.name}</b><p class="muted" data-ui-style="ui-026">${h.location||'Location not recorded'} · ${h.cond||100}% condition</p>${ROW('Estimated value',money(h.value))}${ROW('Mortgage balance',money(h.balance||0))}${ROW('Status',h.status==='p12-rented'?'Tenant in place':h.status==='p12-listed'?'Listed for rent':S.housing===h.id?'You live here':h.status==='rent'?'Rental investment':'Vacant')}${PR(p12Features(h))}${h.renovations&&h.renovations.length?PR('Renovations: '+h.renovations.join('; ')):''}<div class="acts acts3"><button class="btn" onclick="setLiveProperty(${i})" ${S.housing===h.id?'disabled':''}>Move in</button><button class="btn" onclick="p12SetRental('${h.id}')">List for rent</button><button class="btn" onclick="sellOwnedProperty(${i})">Sell property</button></div>${rentInput}<button class="btn" onclick="p12SetRental('${h.id}')">Publish rent listing</button>${reno}</div>`;
 }).join(''));
 const renRows=S.ownedHomes.map(h=>{if(!h.p12||!['p12-listed','p12-rented'].includes(h.status))return '';return ROW(h.name,`${h.status==='p12-rented'?'Occupied':'Vacant / finding tenant'} · ${(h.rentLocalAmount||Math.round((h.rentAmount||0)*rateForCountry(h.rentCurrency||h.marketCountry||S.country,gameYear()))).toLocaleString()} ${(COUNTRIES[h.rentCurrency||h.marketCountry||S.country]||C()).cur}/month`);}).join('');if(renRows)out+=SEC('Rental income and contracts',renRows+PR('Tenants are not guaranteed. Asking above comparable market rent makes vacancy more likely. Signed contract increases are applied when the contract anniversary arrives.'));
 }
 const market=p12PropertyMarket();out+=SEC(`Market listings in ${C().n} (${market.length})`,PR('Each listing has its own asking price and condition. A mortgage needs a deposit, interest and annual payments; banks may reject applications or unaffordable borrowing.')+market.map((l,i)=>`<details><summary>${l.name} · ${money(l.priceInternal)}</summary>${ROW('Location',l.location)}${ROW('Condition',`${l.condition}%`)}${ROW('Furnishing',l.furnishedQuality)}${PR(p12Features(l))}${ROW('Mortgage deposit (20%)',money(Math.round(l.priceInternal*.2)))}${ROW('Estimated full cash price',money(l.priceInternal))}<div class="acts"><button class="btn" onclick="p12BuyListing('${l.id}','cash')" ${S.wealth<l.priceInternal?'disabled':''}>Buy cash</button><button class="btn" onclick="p12BuyListing('${l.id}','mortgage')" ${S.wealth<l.priceInternal*.2?'disabled':''}>Mortgage / 20% deposit</button></div></details>`).join(''));
 const oldRent=HOUSING_CATALOG.filter(h=>h.kind==='rent');out+=SEC('Lower-cost rental choices',PR('Rent is charged monthly in real life; the game keeps an annual cost ledger. Utilities, transport and groceries are separate.')+oldRent.map(h=>B(h.name,`${money(rentCost(h))}/year + about ${money(S.country==='egy'&&typeof p14EgyptUtilityCost==='function'?p14EgyptUtilityCost(h):h.util)}/year utilities · ${h.desc}`,`rentHome('${h.id}')`,S.housing===h.id)).join(''));
 return out;
}

/* ---------- Travel planner: return fares, hotel, spending, leave approval ---------- */
function flightFareUsd(from,to){
  if(!from||!to||from===to)return 0;const p=[from,to].sort().join('-');
  const fare={
    'egy-gbr':650,'egy-usa':920,'can-usa':520,'aus-usa':1250,'can-egy':1050,'aus-egy':1350,'deu-egy':600,'fra-egy':620,'ita-egy':580,'nld-egy':640,
    'egy-uae':300,'egy-sau':340,'egy-tur':330,'egy-can':1100,'egy-deu':590,'egy-fra':620,'egy-ita':570,'egy-nld':630,
    'gbr-usa':650,'gbr-can':600,'can-gbr':600,'gbr-deu':180,'fra-gbr':180,'deu-usa':700,'fra-usa':720,'deu-can':700,'nld-usa':700,'uae-usa':950,'sau-usa':1000
  }[p];if(fare)return fare;
  const long=['usa','can','aus','nzl'].includes(from)||['usa','can','aus','nzl'].includes(to);
  const gulf=['egy','uae','sau'].includes(from)&&['egy','uae','sau'].includes(to);
  const near=['egy','tur','deu','fra','gbr','ita','nld','sau','uae'].includes(from)&&['egy','tur','deu','fra','gbr','ita','nld','sau','uae'].includes(to);
  return long?1050:gulf?320:near?520:700;
}
function p12FlightClassFactor(k){return k==='business'?3.35:k==='premium'?1.72:1;}
function p12DestinationOptions(){const abroad=S.country!==S.home;const arr=[];if(S.country==='egy')arr.push({id:'north-coast',name:'North Coast family resort',country:'egy',local:true},{id:'alex-beach',name:'Alexandria beach weekend',country:'egy',local:true},{id:'red-sea',name:'Red Sea resort',country:'egy',local:true},{id:'siwa',name:'Siwa Oasis',country:'egy',local:true},{id:'luxor',name:'Luxor and Aswan',country:'egy',local:true},{id:'cairo',name:'Cairo city break',country:'egy',local:true});else arr.push({id:'local-city',name:`Explore ${C().n}`,country:S.country,local:true},{id:'nature-break',name:'Nature / countryside break',country:S.country,local:true});
  arr.push({id:'trip-london',name:'London',country:'gbr',local:false},{id:'trip-paris',name:'Paris',country:'fra',local:false},{id:'trip-istanbul',name:'Istanbul',country:'tur',local:false},{id:'trip-dubai',name:'Dubai',country:'uae',local:false},{id:'trip-new-york',name:'New York',country:'usa',local:false},{id:'trip-toronto',name:'Toronto',country:'can',local:false});if(abroad)arr.unshift({id:'trip-home',name:`Visit family in ${COUNTRIES[S.home].n}`,country:S.home,local:false});return arr;}
function p12PeopleCount(k){if(k==='partner')return partner()?2:2;if(k==='friend')return 2;if(k==='family')return Math.min(5,Math.max(2,S.family.filter(m=>m.alive&&(m.role==='Mother'||m.role==='Father'||m.role==='Sibling'||m.role==='Child')).length+1));return 1;}
function p12HotelInternal(dest,tier,night,y){const idx=tier==='luxury'?2:tier==='comfort'?1:0;const egpMap={
  'north-coast':[2600,3800,7500],'alex-beach':[1800,4600,12000],'red-sea':[3500,8500,19000],siwa:[1500,3300,8500],luxor:[1300,3500,9500],cairo:[1600,4200,11500]
};
  if(dest.country==='egy'&&egpMap[dest.id]){return p12LocalCurrencyInternal(egpMap[dest.id][idx]*egyptWageIndex(y),'egy',y);}
  const c=COUNTRIES[dest.country]||COUNTRIES.usa,usdNight=[55,135,360][idx];return usdNight*(c.p||1)*p12ScaleForYear(dest.country,y);
}
function p12TripQuote(){
 const sel=$('p12-trip-dest'),d=(p12DestinationOptions().find(x=>x.id===(sel&&sel.value))||p12DestinationOptions()[0]);if(!d)return null;
 const people=p12PeopleCount($('p12-trip-with')?.value||'solo'),days=Math.max(1,Math.min(30,Math.floor(Number($('p12-trip-days')?.value)||4))),nights=Math.max(1,days-1),classKey=$('p12-trip-class')?.value||'economy',hotelKey=$('p12-trip-hotel')?.value||'comfort',activity=$('p12-trip-activity')?.value||'normal',spendLocal=Math.max(0,Number($('p12-trip-spend')?.value)||0),era=typeof prOf==='function'?prOf(gameYear(),S):1;
 const origin=S.country,to=d.country,international=origin!==to;let airfare=0,transport=0;
 if(international)airfare=flightFareUsd(origin,to)*p12FlightClassFactor(classKey)*people*era;
 else{const mode=$('p12-trip-transport')?.value||'public';const localCosts=origin==='egy'?{public:500,train:950,car:2500}:{public:15,train:35,car:90};const raw=localCosts[mode]||localCosts.public;transport=(origin==='egy'?p12LocalCurrencyInternal(raw*egyptWageIndex(gameYear()),'egy',gameYear()):raw*(COUNTRIES[origin].p||1))*people;}
 const rooms=Math.ceil(people/2),hotel=p12HotelInternal(d,hotelKey,1,gameYear())*nights*rooms;
 const spend=p12LocalCurrencyInternal(spendLocal*days*people,d.country,gameYear());const activityRate={budget:0,normal:30,luxury:125}[activity]||30;const activities=activityRate*people*days*(COUNTRIES[to].p||1)*era;
 const total=airfare+transport+hotel+spend+activities;return {d,people,days,nights,rooms,international,classKey,airfare,transport,hotel,spend,activities,total,spendLocal};
}
function p12RefreshTripQuote(){const q=p12TripQuote();const el=$('p12-trip-estimate');if(!el||!q)return;el.innerHTML=`<b>Estimated total: ${money(q.total)}</b><div class="row"><span>${q.international?'Round-trip airfare · '+q.classKey:'Local transport'}</span><b>${money(q.airfare||q.transport)}</b></div>${q.international?ROW('Local transport',money(q.transport)):''}${ROW(`Accommodation · ${q.nights} night(s), ${q.rooms} room(s)`,money(q.hotel))}${ROW('Food / personal spending',money(q.spend))}${ROW('Activities',money(q.activities))}${PR(`Party size: ${q.people}; duration: ${q.days} day(s). Fare estimates are for planning, not live bookable quotes; dates and airlines can change them.`)}`;}
function p12RenderTravel(){const dests=p12DestinationOptions(),d0=dests[0];const labels=Object.fromEntries(dests.map(d=>[d.id,d.name]));const options=dests.map(d=>`<option value="${d.id}">${d.name}</option>`).join('');const currencyLabels=dests.map(d=>`${d.name}: ${COUNTRIES[d.country].cur}`).join(' · ');
 return SEC('Trips, holidays and family time',PR(`Plan solo trips, a break with a partner or friend, or a family holiday. Total costs include transport / return airfare, lodging, daily spending and activities. Destination currencies: ${currencyLabels}.`)+`<label class="muted">Destination</label><select id="p12-trip-dest" onchange="p12RefreshTripQuote()" data-ui-style="ui-064">${options}</select><label class="muted">Who is travelling?</label><select id="p12-trip-with" onchange="p12RefreshTripQuote()" data-ui-style="ui-064"><option value="solo">Just me</option><option value="partner">Me and my partner</option><option value="friend">Me and a friend</option><option value="family">Family trip</option></select><div class="acts"><div><label class="muted">Days</label><input id="p12-trip-days" type="number" min="1" max="30" value="4" oninput="p12RefreshTripQuote()" data-ui-style="ui-037"></div><div><label class="muted">Accommodation</label><select id="p12-trip-hotel" onchange="p12RefreshTripQuote()" data-ui-style="ui-037"><option value="budget">Budget</option><option value="comfort" selected>Comfort / mid-range</option><option value="luxury">Luxury</option></select></div></div><div class="acts"><div><label class="muted">Return airfare class</label><select id="p12-trip-class" onchange="p12RefreshTripQuote()" data-ui-style="ui-037"><option value="economy">Economy</option><option value="premium">Premium economy</option><option value="business">Business</option></select></div><div><label class="muted">Activities</label><select id="p12-trip-activity" onchange="p12RefreshTripQuote()" data-ui-style="ui-037"><option value="budget">Low-cost activities</option><option value="normal" selected>Restaurants and activities</option><option value="luxury">Luxury dining / excursions</option></select></div></div><div><label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1800" oninput="p12RefreshTripQuote()" data-ui-style="ui-037"></div><div><label class="muted">Time off from work</label><select id="p12-trip-leave" onchange="p12RefreshTripQuote()" data-ui-style="ui-037"><option value="paid">Request paid annual leave</option><option value="unpaid">Request unpaid leave / lost wages</option></select></div><div><label class="muted">Local transport</label><select id="p12-trip-transport" onchange="p12RefreshTripQuote()" data-ui-style="ui-037"><option value="public">Public transport / bus</option><option value="train">Train / intercity coach</option><option value="car">Drive / private ride</option></select></div><div id="p12-trip-estimate" class="card" data-ui-style="ui-023"></div><div class="acts"><button class="btn" onclick="p12RefreshTripQuote()">Update budget</button><button class="btn" onclick="p12BookTrip('${S.funeralNotice?'funeral':'holiday'}')">${S.funeralNotice?'Request emergency leave and book funeral trip':'Request leave and book'}</button></div>${S.job?PR(`Current employer: ${S.job.company||'Employer'} · paid-leave balance ${Math.floor(S.vacationDays||0)} day(s). A manager can refuse, especially for a long trip or busy period.`):PR(S.mast?'You are studying; avoid exam periods and keep student-status requirements in mind.':'You do not currently have a job, so there is no manager approval or paid-leave deduction.')}`);
}
function p12BookTrip(purpose='holiday'){
 const q=p12TripQuote();if(!q)return hint('Choose a destination.');const leaveDays=q.days,leaveType=$('p12-trip-leave')?.value||'paid';let lost=0;
 if(S.wealth<q.total)return hint(`The trip estimate is ${money(q.total)}. You cannot afford this yet.`);
 if(S.job){if(leaveType==='paid'&&leaveDays>(S.vacationDays||0))return hint(`You have ${Math.floor(S.vacationDays||0)} paid-leave day(s). Choose fewer days or request unpaid leave.`);const p=purpose==='funeral' ? .92 : Math.min(.94,.53+(S.job.perf||45)/240+(S.job.benefits?.leave? .08:0)+(leaveDays<=5?.08:0)-(leaveDays>12?.16:0)-(leaveType==='unpaid'?-.12:0));if(Math.random()>p){log(`${S.job.company||'Your manager'} refused your ${purpose==='funeral'?'emergency funeral':'holiday'} leave request for ${leaveDays} day(s). You did not buy tickets.`);fx({happiness:-3});realismNotice('Leave request refused',`Your manager refused the requested ${leaveDays} day(s) off. No travel money was spent. You can try different dates, fewer days, or unpaid leave later.`);render();return;}
  if(leaveType==='paid')S.vacationDays=Math.max(0,(S.vacationDays||0)-leaveDays);else if(leaveType==='unpaid'){lost=Math.round((S.job.salary||0)/260*leaveDays);S.wealth-=lost;S.income=Math.max(0,(S.income||0)-lost);S.expenses=(S.expenses||0)+lost;}
 }else if(S.imm&&S.imm.stage==='student'&&Math.random()<.12){log('Your university schedule made the trip risky, so you postponed it.');realismNotice('Trip postponed',`Your study attendance / exam schedule made this trip too risky. You kept your money and can plan a break next year.`);render();return;}
 S.wealth-=q.total;S.expenses=(S.expenses||0)+q.total;S.bill=S.bill||{};S.bill.travel=(S.bill.travel||0)+q.total;const p12TripRecord={year:gameYear(),destination:q.d.name,days:q.days,people:q.people,total:q.total,purpose,class:q.classKey};S.tripHistory=S.tripHistory||[];S.tripHistory.unshift(p12TripRecord);S.tripHistory=S.tripHistory.slice(0,15);
 fx({happiness:Math.min(18,5+q.days*1.2),social:q.people>1?5:2});const comp=$('p12-trip-with')?.value||'solo';if(comp==='partner'&&partner())partner().bond=clamp(partner().bond+8);if(comp==='friend'&&S.friends&&S.friends.length)S.friends[0].bond=clamp(S.friends[0].bond+8);if(comp==='family')S.family.filter(m=>m.alive&&['Mother','Father','Sibling','Child'].includes(m.role)).forEach(m=>m.bond=clamp(m.bond+5));if(purpose==='funeral'&&S.funeralNotice)S.funeralNotice=null;
 log(`${purpose==='funeral'?'Funeral trip': 'Holiday'}: ${q.d.name}, ${q.days} day(s), ${q.people} traveller(s). ${q.international?`Return ${q.classKey} tickets ${money(q.airfare)}`:`local transport ${money(q.transport)}`}; accommodation ${money(q.hotel)}; food/spending ${money(q.spend)}; activities ${money(q.activities)}${lost?`; unpaid leave / lost wages ${money(lost)}`:''}. Total ${money(q.total+lost)}.`);
 realismNotice(purpose==='funeral'?'Family funeral trip':'Holiday completed',`You spent ${money(q.total+lost)} on ${q.d.name} for ${q.days} day(s). ${leaveDays} day(s) away from work/study${S.job?`; remaining paid leave: ${Math.floor(S.vacationDays||0)} day(s)`:''}. Time with loved ones improved mood and relationship bonds, but travel delays savings goals.`);hint();render();
}
function p12TravelFuneral(){if(!S.funeralNotice)return;const dests=p12DestinationOptions();const sel=$('p12-trip-dest');if(sel){const target=S.country!==S.home?'trip-home':S.country==='egy'?'alex-beach':'local-city';if(dests.some(d=>d.id===target))sel.value=target;}const days=$('p12-trip-days');if(days)days.value=5;const withSelect=$('p12-trip-with');if(withSelect)withSelect.value='solo';const leave=$('p12-trip-leave');if(leave&&S.job&&Number(S.vacationDays||0)<5)leave.value='unpaid';p12RefreshTripQuote();hint('Funeral travel is prepared below. Review the destination, ticket class, spending and leave type, then book only if you can afford it.');}
const P12_viewWorldBefore=viewWorld;
viewWorld=function(){let h=P12_viewWorldBefore();h=h.replace(/<section id="visit-card" class="card">[\s\S]*?<\/section>/,'');let add=p12RenderTravel();if(S.funeralNotice){add=SEC('Urgent family news',PR(`${S.funeralNotice.name} has died. You may need to request emergency leave and travel for the funeral. Tickets, accommodation and time away can be expensive; inheritance may depend on the estate and other family members.`)+B('Plan emergency funeral travel','Use the travel choices below; airfare class and trip costs apply.','p12TravelFuneral()')+add);}if(S.country!==S.home){const c=COUNTRIES[S.country],home=COUNTRIES[S.home];const classInput=`<label class="muted">Return ticket class</label><select id="p12-trip-class-old" data-ui-style="ui-037"><option value="economy">Economy</option><option value="premium">Premium economy</option><option value="business">Business</option></select>`;add=add.replace(/<section class="card"><h3>Trips, holidays and family time<\/h3>/,'<section class="card"><h3>Trips, holidays and family time</h3>');}
return h+add;};

/* ---------- Family needs, custom help, funeral and inheritance ---------- */
const P12_viewFamilyBefore=viewFamily;
function p12FamilyRequests(){let html='';if(S.parentNeed){const m=S.family.find(x=>x.id===S.parentNeed.id),suggested=S.parentNeed.amountLocal||Math.round((S.country==='egy'?6000:180)*p12ScaleForYear(S.home||S.country,gameYear()));html+=SEC('A family member needs help',PR(`${m?m.name:'A parent'} asked for help with ${S.parentNeed.reason||'household expenses'}. You may help with any amount you can afford, or refuse. Refusal may hurt trust; offering more than you can afford can put you in debt.`)+`<div class="row"><label for="p12-parent-help">Amount to send (${C().cur})</label><input id="p12-parent-help" type="number" min="0" value="${suggested}" data-ui-style="ui-066"></div><div class="acts"><button class="btn" onclick="p12AnswerParentNeed(true)">Send this amount</button><button class="btn" onclick="p12AnswerParentNeed(false)">Refuse for now</button></div>`);}
 if(S.familyNeed){const n=S.familyNeed,m=S.family.find(x=>x.id===n.id);html+=SEC('Specific request from family',PR(`${m?m.name:'A relative'} needs help with ${n.reason}. They asked for ${money(n.amountInternal)} (about ${C().cur} ${Math.round(n.amountInternal*rateNow()).toLocaleString()}). You may send the full amount, less, or refuse.`)+`<div class="row"><label for="p12-specific-help">Amount to send (${C().cur})</label><input id="p12-specific-help" type="number" min="0" placeholder="Enter any amount" data-ui-style="ui-066"></div><div class="acts"><button class="btn" onclick="p12RespondSpecific(true)">Send chosen amount</button><button class="btn" onclick="p12RespondSpecific(false)">Decline</button></div>`);}
 const family=S.family.filter(m=>m.alive&&['Mother','Father','Sibling','Child'].includes(m.role));if(family.length){html+=SEC('Custom transfers and recurring support',PR('Enter any one-off gift or an annual allowance in your current currency. You can also help with treatment, rent or an important family event; keep your own emergency savings in mind.')+family.map(m=>`<div data-ui-style="ui-067"><b>${m.name}</b> <span class="muted">· ${m.role}</span><div class="row"><label for="p12-gift-${m.id}">One-off transfer (${C().cur})</label><input id="p12-gift-${m.id}" type="number" min="0" placeholder="Amount" data-ui-style="ui-068"></div><div class="acts"><button class="btn" onclick="p12GiveFamily('${m.id}')">Send money</button><button class="btn" onclick="p12SetAllowance('${m.id}')">Set annual allowance</button></div><div class="row"><label for="p12-allow-${m.id}">Annual allowance (${C().cur})</label><input id="p12-allow-${m.id}" type="number" min="0" value="${Math.round((m.allow||0)*rateNow())}" data-ui-style="ui-068"></div></div>`).join(''));}
 if(S.tripHistory&&S.tripHistory.length)html+=SEC('Recent trips',S.tripHistory.slice(0,5).map(t=>ROW(`${t.year} · ${t.destination}`,`${t.days} days · ${money(t.total)}`)).join(''));
 return html;}
function p12AnswerParentNeed(yes){if(!S.parentNeed)return;const m=S.family.find(x=>x.id===S.parentNeed.id);if(yes){const local=Number($('p12-parent-help')?.value||0),amt=p12LocalCurrencyInternal(local,S.country,gameYear());if(!Number.isFinite(local)||local<0)return hint('Enter zero or a positive amount.');if(amt>S.wealth)return hint('You cannot afford that amount.');S.wealth-=amt;if(m)m.bond=clamp(m.bond+Math.min(12,Math.round(amt/Math.max(1,localCurrencyInternal(S.country==='egy'?5000:100,S.country,gameYear()))*3+2)));log(`You sent ${money(amt)} to help ${m?m.name:'your family'} with ${S.parentNeed.reason}.`);fx({happiness:1});}else{if(m)m.bond=clamp(m.bond-10);fx({happiness:-4});log(`You could not help ${m?m.name:'your family'} with ${S.parentNeed.reason}. They felt disappointed, although your own budget was protected.`);}S.parentNeed=null;render();}
function p12RespondSpecific(yes){if(!S.familyNeed)return;const n=S.familyNeed,m=S.family.find(x=>x.id===n.id);if(yes){const local=Number($('p12-specific-help')?.value||0),amt=p12LocalCurrencyInternal(local,S.country,gameYear());if(!Number.isFinite(local)||local<0)return hint('Enter any non-negative amount.');if(amt>S.wealth)return hint('You cannot afford that amount.');S.wealth-=amt;if(m)m.bond=clamp(m.bond+(amt>0?Math.min(10,Math.ceil(amt/Math.max(1,n.amountInternal)*8)):0));log(`You sent ${money(amt)} to ${m?m.name:'a relative'} for ${n.reason}.`);fx({happiness:amt>0?1:0});}else{if(m)m.bond=clamp(m.bond-8);fx({happiness:-3});log(`You refused ${m?m.name:'your relative'}’s request for ${n.reason}. They were upset.`);}S.familyNeed=null;render();}
function p12GiveFamily(id){const m=S.family.find(x=>x.id===id);if(!m)return;const local=Number($(`p12-gift-${id}`)?.value);if(!Number.isFinite(local)||local<=0)return hint('Enter an amount greater than zero.');const amt=p12LocalCurrencyInternal(local,S.country,gameYear());if(amt>S.wealth)return hint('Not enough cash.');S.wealth-=amt;m.bond=clamp(m.bond+(amt>localCurrencyInternal(S.country==='egy'?1000:25,S.country,gameYear())?5:2));log(`You gave ${money(amt)} to ${m.name}.`);render();}
function p12SetAllowance(id){const m=S.family.find(x=>x.id===id);if(!m)return;const local=Number($(`p12-allow-${id}`)?.value);if(!Number.isFinite(local)||local<0)return hint('Enter zero or a positive annual amount.');m.allowLocal=local;m.allowCurrency=S.country;m.allow=p12LocalCurrencyInternal(local,S.country,gameYear());log(`You set ${m.name}’s annual allowance to ${money(m.allow)} in current-currency equivalent.`);render();}
viewFamily=function(){return P12_viewFamilyBefore()+p12FamilyRequests();};
const P12_familyYearBefore=familyYear;
familyYear=function(){
  p12InitState(S);
  const before=parents().filter(m=>m.alive).map(m=>({id:m.id,name:m.name,assets:Number(m.estateInternal)||0,seedScale:Number(m.estateSeedScale)||1,ownsProperty:!!m.estateProperty}));
  const r=P12_familyYearBefore();
  const now=parents();
  const died=before.filter(p=>{const m=S.family.find(x=>x.id===p.id);return m&&!m.alive;});
  if(died.length){
    p12InitState(S);
    const home=S.home||S.country||'egy';
    if(!S.familyEstatePoolYear)S.familyEstatePoolYear=gameYear();
    died.forEach(p=>{
      const currentScale=Math.max(.0001,home==='egy'?p14EgyptPriceIndex(gameYear()):p12ScaleForYear(home,gameYear()));
      const seedScale=Math.max(.0001,p.seedScale||1);
      S.familyEstatePool=(S.familyEstatePool||0)+Math.max(0,(p.assets||0)*(currentScale/seedScale));
      if(p.ownsProperty)S.familyEstatePropertyPool=true;
    });
    const parent=died[0];
    S.funeralNotice={name:parent.name,year:gameYear(),abroad:S.country!==S.home};
    if(!now.length){
      const inherited=Math.max(0,S.familyEstatePool||0);
      if(inherited>0){S.wealth+=inherited;log(`After your last living parent died, you inherited an estimated ${money(inherited)} in family savings. Debts, probate costs, co-heirs and a will can change the final amount.`);}
      S.familyEstatePool=0;S.familyEstatePoolYear=0;
      if(S.familyEstatePropertyPool){
        const tier=Math.max(0,Math.min(2,Math.floor(Number(S.famWealth)||0)));
        const localValue=home==='egy'?[0,900000,4200000][tier]:(home==='gbr'?[0,180000,420000][tier]:home==='usa'?[0,220000,500000][tier]:[0,90000,280000][tier]);
        if(localValue>0){
          const scale=home==='egy'?p14EgyptPriceIndex(gameYear()):p12ScaleForYear(home,gameYear());
          const price=p12LocalCurrencyInternal(localValue*scale,home,gameYear());
          const id=`p12-inherited-${gameYear()}-${Math.random().toString(36).slice(2,5)}`;
          const cat={id,kind:'buy',name:`Inherited family property from ${parent.name}`,price,pay:0,util:Math.round(price*.004),rentInc:Math.round(price*.003*12),cost:0,hap:1,hp:1,desc:'Inherited family property; condition, title, debts and other heirs may require legal review.'};
          HOUSING_CATALOG.push(cat);
          S.ownedHomes.push({id:'h_'+id,catId:id,name:cat.name,value:price,balance:0,cond:Math.round(40+rnd(55)),rentInc:cat.rentInc,status:'vacant',pay:0,rate:S.mortRate||.05,features:['Inherited family property','Condition and title require inspection'],location:home==='egy'?'Family home / Egypt':`Family estate / ${COUNTRIES[home]?.n||home}`,marketCountry:home,rentCurrency:home,p12:true,marketRentRate:.003});
          log(`Your family transferred a property to you. Its condition, title, possible debts and maintenance costs need checking before you live in it or rent it out.`);
        }
      }
      S.familyEstatePropertyPool=false;
    }
    if(S.country!==S.home)realismNotice('Family bereavement — travel may be needed',`${parent.name} died while you were abroad. You can plan an emergency trip in World, choose a ticket class, and request funeral leave. Costs and your manager’s decision still matter.`);
    else realismNotice('Family bereavement',`${parent.name} died. Any family savings or property inherited by you may be affected by debts, probate, a will and other heirs.`);
  }
  return r;
};
function p12GenerateFamilyNeed(){if(!S||S.age<20||S.p12NeedAge===S.age||S.familyNeed||S.parentNeed)return;S.p12NeedAge=S.age;if(S.p12FamilyHelpNextAge===S.age){S.p12FamilyHelpNextAge=-1;S.p12FamilyHelpLastAge=S.age;return;}if(Math.random()<.13){const candidates=S.family.filter(m=>m.alive&&['Mother','Father','Sibling'].includes(m.role));if(!candidates.length)return;const m=pick(candidates),reason=pick(['rent and utility bills','medical treatment','a sibling’s education fees','a family wedding','urgent home repairs','lost income at work']);const local=S.country==='egy'?([1500,5500,20000][S.famWealth]+rnd(8000)):([40,160,700][S.famWealth]+rnd(300));S.familyNeed={id:m.id,reason,amountInternal:p12LocalCurrencyInternal(local*(S.country==='egy'?egyptWageIndex(gameYear()):1),S.country,gameYear()),year:gameYear()};log(`${m.name} asked for help with ${reason}. You can decide the amount in Relationships.`);}}

/* ---------- Pre-age decisions, year summary popup and annual maintenance ---------- */
function p12PreAgeEvent(){const pool=[];
 if(S.age>=18&&S.job&&Math.random()<.25)pool.push({id:'p12-pre-overtime',title:'A difficult request at work',text:`${S.job.company||'Your manager'} asks you to take on an urgent assignment before the next review. It could improve your reputation but add stress.`,choices:[{label:'Accept the extra responsibility',fx:()=>{S.job.perf=clamp(S.job.perf+9);fx({happiness:-4,health:-2});return {msg:'You accepted the assignment, improved performance and sacrificed some recovery time.'};}},{label:'Set a reasonable boundary',fx:()=>{fx({happiness:1});return {msg:'You explained your workload. Your health was protected, although the manager may remember the refusal.'};}}]});
 if(S.age>=18&&S.friends&&S.friends.some(f=>f.bond>=40)&&Math.random()<.22){const f=S.friends.filter(x=>x.bond>=40)[0],amt=p12LocalCurrencyInternal(S.country==='egy'?Math.round(3500*egyptWageIndex(gameYear())):150,S.country,gameYear());pool.push({id:'p12-pre-loan',title:'A friend asks to borrow money',text:`${f.name} is short on rent and asks to borrow ${money(amt)}. They promise to repay you, but some loans are never repaid.`,choices:[{label:'Lend the money',cost:amt,fx:()=>{f.loan=(f.loan||0)+amt;f.bond=clamp(f.bond+8);return {wealth:-amt,msg:`You lent ${money(amt)} to ${f.name}. Repayment is uncertain.`};}},{label:'Decline kindly',fx:()=>{f.bond=clamp(f.bond-3);return {happiness:-1,msg:`You declined. ${f.name} was disappointed, but you protected your own emergency budget.`};}}]});}
 if(S.age>=22&&parents().length&&Math.random()<.24){const m=pick(parents()),local=S.country==='egy'?Math.round((S.famWealth===0?2500:S.famWealth===1?7000:18000)*p14EgyptPriceIndex(gameYear())):Math.round([80,220,700][S.famWealth]);const amt=p12LocalCurrencyInternal(local,S.country,gameYear());pool.push({id:'p12-pre-parent',title:'Your family needs help',text:`${m.name} tells you the household is under pressure from ${pick(['a medical bill','rent and utilities','school fees for a younger relative','a home repair'])}. They ask for ${money(amt)}, but you are saving for your own future.`,choices:[{label:`Help with ${money(amt)}`,cost:amt,fx:()=>{m.bond=clamp(m.bond+8);return {wealth:-amt,happiness:2,msg:`You sent ${money(amt)} to ${m.name}. Their immediate pressure eased, but your savings fell.`};}},{label:'Explain that you cannot afford it',fx:()=>{m.bond=clamp(m.bond-5);return {happiness:-2,msg:`You could not help ${m.name} this year. The conversation was painful, but your own finances are tight.`};}}]});}
 if(S.age>=18&&S.job&&S.job.years>=2&&Math.random()<.16){pool.push({id:'p12-pre-benefits',title:'Annual employment review',text:`Your employer is reviewing contracts. You can ask for better benefits, or keep your head down during a busy year.`,choices:[{label:'Ask about medical cover and paid leave',fx:()=>{if(Math.random()<.5){S.job.benefits.medical=true;S.job.benefits.leave=Math.max(S.job.benefits.leave||14,18);S.vacationCap=Math.max(S.vacationCap||0,S.job.benefits.leave*2);return {happiness:4,msg:'HR approved a medical plan and a larger paid-leave allowance. Your salary did not change.'};}return {happiness:-1,msg:'The company said benefits will not change this year.'};}},{label:'Avoid the conversation for now',fx:{happiness:1},result:'You kept the relationship with your manager steady and postponed the discussion.'}]});}
 return pool;}
const P12_chooseBefore=p12ChooseOriginal;
function choose(i){const ev=S&&S.ev,id=S&&S.evId,pre=ev&&String(id||'').startsWith('p12-pre-');P12_chooseBefore(i);if(pre&&S&&!S.pending&&S.evId!==id){S.p12PreAgeResolvedAge=S.age;if(id==='p12-pre-parent')S.p12FamilyHelpNextAge=S.age+1;render();}}
function p12ShowYearPopup(){if(!S||!S.yearPopup||S.pending){const hidden=document.getElementById('p12-year-modal');if(hidden)hidden.remove();return;}let el=document.getElementById('p12-year-modal');if(!el){el=document.createElement('div');el.id='p12-year-modal';el.className='p12-year-modal-overlay';document.body.appendChild(el);}const p=S.yearPopup;el.innerHTML=`<div data-ui-style="ui-069"><div data-ui-style="ui-070">YEAR ${p.year} COMPLETE</div><h2 data-ui-style="ui-071">Age ${p.age}: ${p.title||'Another year lived'}</h2><div class="row"><span>Income recorded</span><b>${money(p.income||0)}</b></div><div class="row"><span>Expenses recorded</span><b>${money(p.expenses||0)}</b></div><div class="row"><span>Net change this year</span><b>${money((p.income||0)-(p.expenses||0))}</b></div><p data-ui-style="ui-072">${p.note||'Check the Life log for family news, work events and financial changes. Important decisions may appear before your next birthday.'}</p><button class="btn" data-ui-style="ui-073" onclick="p12DismissYearPopup()">Continue</button></div>`;}
function p12DismissYearPopup(){if(S)S.yearPopup=null;const e=document.getElementById('p12-year-modal');if(e)e.remove();}
const P12_renderBefore=render;render=function(){P12_renderBefore();if(S&&S.yearPopup)p12ShowYearPopup();else{const e=document.getElementById('p12-year-modal');if(e)e.remove();}};
const P12_ageUpBefore=ageUp;
ageUp=function(){if(!S)return;if(S.pending)return hint('Respond to the event before advancing time.');if(S.age<18&&!S.school){P12_ageUpBefore();return;}if(S.age>=18&&!S.housing){P12_ageUpBefore();return;}
 if(S.p12PreAgeResolvedAge===S.age){S.p12PreAgeResolvedAge=-1;S.p12PreAgeSeenAge=S.age;}else if(S.p12PreAgeSeenAge!==S.age){S.p12PreAgeSeenAge=S.age;const options=p12PreAgeEvent();if(options.length&&Math.random()<.64){const e=pick(options);S.ev={title:e.title,text:e.text,choices:e.choices};S.evId=e.id;S.pending=true;activeTab='life';log(`Decision before age ${S.age+1}: ${e.title}.`);render();return;}}
 const before=S.age;P12_ageUpBefore();if(!S||S.dead||S.age===before)return;p12InitState(S);S.yearPopup={age:S.age,year:gameYear(),income:S.income||0,expenses:S.expenses||0,title:S.job?S.job.title:S.uni?'University year':S.mast?'Master’s abroad':S.localMast?'Local master’s':'Life update',note:'Your age advanced, financial records updated and relationships / career events were processed. Review the Life log and resolve any event before advancing again.'};
 if(S.job){const days=S.job.benefits?.leave||14;S.vacationCap=Math.max(14,days*2);S.vacationDays=Math.min(S.vacationCap,(S.vacationDays||0)+days);}
 try{p12SettleRentalYear();p12GenerateFamilyNeed();if(S.yearPopup){S.yearPopup.income=S.income||0;S.yearPopup.expenses=S.expenses||0;}}catch(e){console.error(e);}render();};

/* Make the year summary appear after the complete original and expansion ledgers. */
const P12_liveYearPopupRender=render;render=function(){P12_liveYearPopupRender();if(S&&S.yearPopup)p12ShowYearPopup();};

/* Extra appliance models, with launch years and Egyptian-market estimates anchored to 2026 listings. */

APPL.forEach(r=>{const x=P12_EXTRA_APPLIANCES[r[0]];if(!x)return;r[5].push([x[0],x[1],x[2]]);APF[r[0]]=(APF[r[0]]||[2007,2007,2007]).concat(x[3]);});
const P12_catalogBefore=catalog;catalog=function(){const a=P12_catalogBefore();a.forEach(it=>{if(it.key&&it.key.startsWith('ap_')){const idx=Number(it.key.split('_').pop());if(idx>=3){it.tier=idx;it.hap=it.type==='fridge'||it.type==='airpure'?[0,1,2,4][idx]:[1,1,2,4][idx];it.hp=['fridge','airpure','water'].includes(it.type)?2:0;it.life=Math.max(it.life,Math.round((APPL.find(r=>r[0]===it.type)||[])[2]*1.4));it.spec+=' · premium model';}}});return a;};

/* Realistic round-trip fares referenced in the 2026 market: Cairo-London around EGP 30k–39k economy and Cairo-New York around EGP 47k–49k economy before date changes. See sources cited in the response. */


/* ========== FINAL REALISM / FLOW FIXES ========== */

/* Keep each annual job board diverse: employer names are unique on a given board. */
const P12_jobBoardMapBefore = companyListFor;
companyListFor = function(country=S.country){
  if(!S) return P12_jobBoardMapBefore(country);
  p12InitState(S);
  const key=`${country}-${gameYear()}`;
  if(S.jobBoards[key]) return S.jobBoards[key];
  const board=p12MakeBoard(country);
  const pool=p12Shuffle(country==='egy'?P12_EGY_BRANDS:P12_GLOBAL_BRANDS);
  board.forEach((p,i)=>{ p.name=country==='egy' ? pool[i%pool.length] : `${pool[i%pool.length]} ${COUNTRIES[country]?.n||country.toUpperCase()}`; });
  S.jobBoards[key]=board;
  return board;
};

/* Full-time salary floor in Egypt follows the modelled local minimum wage, not USD thresholds. */
const P12_salaryBeforeLocalFloor = jobSalaryForPost;
jobSalaryForPost = function(post,level,country=S.country,year=gameYear()){
  let pay=P12_salaryBeforeLocalFloor(post,level,country,year);
  if(country==='egy'){
    const minimumEgp=84000*egyptWageIndex(year);
    pay=Math.max(pay,minimumEgp/Math.max(.0001,rateForCountry('egy',year)));
  }
  return Math.round(pay);
};

/* Egypt salary taxation is calculated in EGP, then translated back to the game's internal USD units. */
const P12_incomeTaxBeforeEgp = incomeTax;
incomeTax = function(taxable){
  const t=Math.max(0,Number(taxable)||0);
  if(!S||S.country!=='egy') return P12_incomeTaxBeforeEgp(t);
  const local=t*Math.max(.0001,rateNow());
  const bands=[[40000,0],[55000,.10],[70000,.15],[200000,.20],[400000,.225],[Infinity,.25]];
  let tax=0,previous=0;
  for(const [cap,rate] of bands){ if(local>previous) tax+=(Math.min(local,cap)-previous)*rate; previous=cap; if(local<=cap)break; }
  return Math.round(tax/Math.max(.0001,rateNow()));
};

/* Every Career posting clearly exposes job title, changing employer, salary, benefits and sponsorship. */
viewCareer = function(){
  if(S.age<18) return SEC('Career preparation',PR('Build knowledge and English, keep grades up, seek age-appropriate internships or part-time work, and learn practical skills. Full-time applications start at 18.'));
  p12InitState(S);
  const ex=allExperience(),records=S.careerRecords||{};
  const used=S.jobAppsAge===S.age?(S.jobAppsCount||0):0;
  let out=SEC('Career market',PR(`Job postings are fictional but locally scaled gameplay examples, not live vacancies. Companies, titles, salaries, contracts and benefits change over time. Similar roles may pay local wages or USD for remote international employers; US-level remote pay from Egypt is rare and competitive.`)+ROW('Total work experience',`${ex} year(s)`)+ROW('Applications used this year',`${used} / 4`)+ROW('Degree',S.degree?MAJORS[S.degree]?.name||S.degree:'No bachelor’s yet')+ROW('Master’s',S.masterField||'None')+ROW('Job-search outlook',S.econ==='recession'?'Weak market — hiring and offers are harder':'Depends on skills, experience, local economy and employer'));
  if(S.pendingJobOffer){const po=S.pendingJobOffer;out+=SEC('Visa sponsorship decision pending',ROW('Employer',po.job.company)+ROW('Role',po.job.title)+ROW('Estimated pay',money(po.job.salary)+'/year')+ROW('Employer sponsorship','Offered')+PR('The employer has made an offer, but immigration approval is not guaranteed. The application is processing; you cannot start the new job or receive its salary before the decision.'))}
  if(S.job){const j=S.job,b=j.benefits||{};out+=SEC('Your current job',ROW('Employer',j.company||'Employer not recorded')+ROW('Position',j.title)+ROW('Career rank',`${(j.level||0)+1}/5`)+ROW('Annual salary before tax',money(j.salary))+ROW('Pay basis',j.isRemoteUSD?`USD ${Number(j.salary).toLocaleString()}/year, converted at the current exchange rate`:'Local-market salary shown in your current currency') +ROW('Tenure',`${j.years||0} year(s)`)+ROW('Performance',`${j.perf||0}%`)+ROW('Healthcare',b.medical?'Employer medical plan (coverage limits may apply)':'No employer medical plan — budget for treatment or private insurance')+ROW('Social insurance / pension',b.social?'Included / statutory scheme':'No employer contribution recorded')+ROW('Paid annual leave',`${b.leave||14} days · balance ${Math.floor(S.vacationDays||0)} days`)+ROW('Work style',`${b.remote||'On-site'} · ${b.hours||40} hours/week`)+ROW('Contract',b.contract||'See offer terms')+ROW('Bonus',b.bonus?`${Math.round(b.bonus*100)}% target; not guaranteed`:'No bonus recorded')+ROW('Visa sponsorship',S.country===S.home?'Not needed for your home-country job':j.visaSponsorship?'Employer-sponsored status — keep your permit valid':'No sponsorship attached to this role')+PR('Switching employer can change pay, benefits, working hours, leave and job security. Existing track experience and highest recorded level are retained; a new company may still offer a different title or salary.')+B('Work overtime / take extra responsibility','Can improve performance, but raises stress.','workHarder()',S.worked)+B('Request promotion','A rejection does not demote you.','askPromotion()',S.promoTried)+B('Resign / leave this job','Career history stays on record; income stops when employment ends.','quitJob()'));}
  else if(S.retired){out+=SEC('Retirement',ROW('Pension',money(S.pension)+'/year')+PR('Pension and benefits depend on your contribution history and location.'));}
  else {out+=SEC('Job search status',PR('You have no current salaried job. Apply to different employers, improve relevant skills, and keep emergency savings for gaps between jobs.')+(S.country!==S.home?PR(`You are not a citizen of ${C().n}. Each vacancy lists whether that employer is willing to sponsor; even a “yes” can still be refused by immigration.`):''));}
  const board=companyListFor(S.country);
  const postings=board.map(post=>{
    const why=p12Eligibility(post),rec=records[post.trackId],curLevel=S.job&&S.job.trackId===post.trackId?S.job.level||0:0;
    const level=Math.max(rec?rec.level||0:0,curLevel),title=p12RoleTitle(post,level),salary=jobSalaryForPost(post,level,S.country,gameYear());
    const sponsor=S.country===S.home?'Not applicable — this is a job in your home country':(post.sponsorship?'Potentially yes — employer sponsorship available, subject to a visa decision':'No — this vacancy does not offer sponsorship');
    const contract=post.contract||'Contract terms vary';
    return `<details><summary>${post.name} · ${title}</summary>${PR(post.desc||'Role duties and requirements vary by team.')}${ROW('Estimated annual gross pay',money(salary))}${ROW('Level offered',`${level+1}/5${rec?' · based on recorded experience':''}`)}${ROW('Employer type',post.companySize||'Local employer')}${ROW('Working hours',`${post.hours||40} hours/week`)}${ROW('Contract',contract)}${ROW('Healthcare',post.medical?'Employer medical cover available':'No employer medical cover listed')}${ROW('Social insurance / pension',post.social?'Contribution / statutory plan expected':'No employer contribution listed')}${ROW('Paid leave',`${post.leave||14} days/year`)}${ROW('Remote/hybrid',post.remote||'On-site')}${ROW('Bonus',post.bonus?`${Math.round(post.bonus*100)}% target (not guaranteed)`:'No target bonus listed')}${ROW('Work visa sponsorship',sponsor)}${PR(`Requirements: ${(post.degrees&&post.degrees.length)?`degree in ${post.degrees.map(k=>MAJORS[k]?.name||k).join(' or ')}; `:(post.degree?`degree in ${MAJORS[post.degree]?.name||post.degree}; `:'')}English ${post.eng||0}%+, Smarts ${post.smarts||0}%+${post.minExp?`, ${post.minExp}+ relevant years`:''}. Hiring also depends on interviews, competition and budget.`)}<button class="btn" onclick="applyCompany('${post.id}')" ${why||used>=4?'disabled':''}>${why|| (used>=4?'Application limit reached':`Apply to ${title}`)}</button></details>`;
  }).join('');
  out+=SEC(`Openings in ${C().n} · ${board.length} postings`,PR('Compare the actual offer details instead of assuming all companies pay or provide the same benefits. A posting with sponsorship is only the first step; visa approval may take time and can be refused.')+postings);
  out+=SEC('Remote work paid in USD',PR(S.remote?`Current remote contract: ${S.remote.title} · ${usd(S.remote.usd)}/year. Availability, hours and contracts may change; contractor roles often do not include insurance, paid leave or visa sponsorship.`:'A similar role may exist remotely for an international company, but USD pay is not automatic. Strong English, a proven portfolio, reliable communication, relevant experience and selection performance improve your chances.')+(S.remote?B('Quit remote contract','USD income stops; any local job is kept.','quitRemote()'):REMOTE.map(r=>B(r.t,`${usd(Math.round(r.usd*(S.wrEra||1)))}/year · English ${r.eng}%+${r.deg?` · ${r.deg==='any'?'bachelor’s degree':`${r.deg} degree`}`:''} · ${r.perks||'Benefits vary by contract'}`,`searchRemote('${r.id}')`,!remOk(r)||S.didW===S.age)).join('')));
  out+=SEC('Recent applications',S.jobApplications&&S.jobApplications.length?S.jobApplications.slice(-8).reverse().map(a=>ROW(`${a.year} · ${a.company}`,`${a.role} — ${a.result}`)).join(''):PR('No applications recorded yet. An application may be accepted, rejected, or lead to an offer that still needs sponsorship / immigration approval.'));
  out+=SEC('Career history',Object.entries(records).length?Object.entries(records).map(([id,r])=>ROW(TRACKS[id]?.name||id,`${r.title||salaryTitle(id,r.level)} · ${r.years||0} recorded year(s) · highest level ${(r.level||0)+1}/5`)).join(''):PR('Career level and years accumulate as jobs are recorded. You do not lose experience just because you change companies.'));
  return out;
};

/* Employer sponsorship is a distinct immigration decision, and it pauses the usual post-study deadline for one processing year. */
const P12_immYearBeforeSponsorWait = immYear;
immYear = function(){
  if(S&&S.pendingJobOffer&&S.country!==S.home&&S.imm&&['post','visa','work'].includes(S.imm.stage)){
    S.pendingJobOffer.years=(S.pendingJobOffer.years||0)+1;
    return;
  }
  return P12_immYearBeforeSponsorWait();
};
function p12ProcessJobOffer(){
  const pending=S&&S.pendingJobOffer;if(!pending)return;
  if(S.country===S.home||!S.imm){S.pendingJobOffer=null;log('The sponsorship application could not proceed because you no longer had an eligible overseas status.');return;}
  if((pending.years||0)<1)return;
  const dest=S.country,stage=S.imm.stage;
  const base={usa:.32,gbr:.62,can:.64,aus:.64,nzl:.62,deu:.76,fra:.60,nld:.57,ita:.48,uae:.73,sau:.78,sgp:.48,jpn:.40,kor:.40}[dest]||.5;
  const fit=(pending.job&&pending.job.trackId&&S.degree===TRACKS[pending.job.trackId]?.degree)?.06:0;
  const chance=Math.max(.12,Math.min(.9,base+Math.max(0,S.eng-55)/500+Math.max(0,S.smarts-55)/700+fit-(S.econ==='recession'?.07:0)));
  S.pendingJobOffer=null;
  if(Math.random()<chance){
    const old=S.job;
    if(old)recordCareer({...old},true);
    S.job=pending.job;S.retired=false;S.lastSalary=pending.job.salary;
    S.vacationCap=Math.max(14,(pending.job.benefits?.leave||14)*2);S.vacationDays=Math.min(S.vacationCap,Math.max(S.vacationDays||0,Math.min(7,pending.job.benefits?.leave||14)));
    S.imm={...(S.imm||{}),stage:'work',yrs:0,left:0,nojob:0,tries:0,route:'employer-sponsored'};
    S.jobApplications=S.jobApplications||[];
    for(let i=S.jobApplications.length-1;i>=0;i--){if(S.jobApplications[i].company===pending.job.company&&String(S.jobApplications[i].result).includes('pending')){S.jobApplications[i].result='Hired — work visa approved';break;}}
    fx({happiness:7});log(`Immigration approved the work visa for ${pending.job.company}. You started as ${pending.job.title}; salary begins now, not during the waiting year.`);
    realismNotice('Work visa approved',`${pending.job.company} can now employ you lawfully as ${pending.job.title}. Pay: ${money(pending.job.salary)}/year before tax. Keep your status valid and review medical cover, leave and contract terms.`);
  }else{
    for(let i=S.jobApplications.length-1;i>=0;i--){if(S.jobApplications[i].company===pending.job.company&&String(S.jobApplications[i].result).includes('pending')){S.jobApplications[i].result='Work visa refused';break;}}
    fx({happiness:-7});log(`The employer was willing to sponsor, but immigration refused the work permit for ${pending.job.company}. You did not start the job${S.job?'; your current job remains unchanged':'; you remain without that salary'}.`);
    realismNotice('Work visa refused',`The employer’s willingness to sponsor did not guarantee approval. You have not started the job. You may need another sponsoring vacancy before your current permission expires.`);
  }
}

/* Pay recurring family allowances annually and record them in expenses, not as a free relationship bonus. */
function p12PayFamilyAllowances(){
  if(!S||!Array.isArray(S.family))return;
  S.family.forEach(m=>{
    if(!m.alive||!(m.allow>0)||m.allowPaidYear===gameYear())return;
    const cost=Number.isFinite(m.allowLocal)?p12LocalCurrencyInternal(m.allowLocal,m.allowCurrency||S.country,gameYear()):m.allow;
    m.allow=cost;S.wealth-=cost;S.expenses=(S.expenses||0)+cost;S.bill=S.bill||{};S.bill.familyAllowance=(S.bill.familyAllowance||0)+cost;m.allowPaidYear=gameYear();
    log(`Annual family allowance: ${money(cost)} sent to ${m.name}. This recurring support reduced your available savings.`);
  });
}
const P12_p10YearBeforeFinal = p10Year;
p10Year = function(){
  P12_p10YearBeforeFinal();
  if(!S||S.dead)return;
  p12PayFamilyAllowances();
  p12ProcessJobOffer();
};

/* Keep an age summary but show the trip quote immediately and use destination-currency spending defaults. */
function p12DefaultDailySpend(country){
  return ({egy:1500,usa:95,can:90,gbr:70,deu:65,fra:70,ita:55,nld:70,aus:100,nzl:90,uae:260,sau:200,tur:180,jpn:9000,kor:80000,sgp:130,ind:1800,pak:4000,nga:35000,bra:250}[country]||70);
}
function p12SetTripDefaultSpend(force=false){
  const input=$('p12-trip-spend'),sel=$('p12-trip-dest');if(!input||!sel)return;
  const d=p12DestinationOptions().find(x=>x.id===sel.value)||p12DestinationOptions()[0];if(!d)return;
  const next=p12DefaultDailySpend(d.country),last=Number(input.dataset.lastDefault||input.value||0);
  if(force||!input.value||Number(input.value)===last){input.value=next;input.dataset.lastDefault=String(next);}
}
const P12_tripRefreshBeforeDefaults=p12RefreshTripQuote;
p12RefreshTripQuote=function(){p12SetTripDefaultSpend(false);return P12_tripRefreshBeforeDefaults();};
const P12_tripQuoteBeforeSeason=p12TripQuote;
p12TripQuote=function(){
  p12SetTripDefaultSpend(false);
  const q=P12_tripQuoteBeforeSeason();if(!q)return q;
  const season=$('p12-trip-season')?.value||'shoulder';
  const d=q.d;
  let factor=1;
  if(d.country==='egy'&&d.id==='north-coast')factor=season==='summer'?1.48:season==='winter'?.78:1;
  else if(d.country==='egy'&&d.id==='red-sea')factor=season==='winter'?1.27:season==='summer'?.94:1;
  else factor=season==='summer'?1.15:season==='winter'?.96:1;
  q.hotel=Math.round(q.hotel*factor);
  if(q.international)q.airfare=Math.round(q.airfare*(season==='summer'?1.12:season==='winter'?.98:1));
  q.total=q.airfare+q.transport+q.hotel+q.spend+q.activities;
  q.season=season;
  return q;
};
const P12_destinationOptionsBeforeEgyptReturn=p12DestinationOptions;
p12DestinationOptions=function(){
  const arr=P12_destinationOptionsBeforeEgyptReturn();
  if(S&&S.country!==S.home&&S.home==='egy'){
    const add=[{id:'north-coast',name:'North Coast family resort',country:'egy',local:true},{id:'alex-beach',name:'Alexandria beach weekend',country:'egy',local:true},{id:'red-sea',name:'Red Sea resort',country:'egy',local:true},{id:'siwa',name:'Siwa Oasis',country:'egy',local:true},{id:'luxor',name:'Luxor and Aswan',country:'egy',local:true}];
    add.forEach(d=>{if(!arr.some(x=>x.id===d.id))arr.push(d);});
  }
  return arr;
};
/* Modify existing trip UI to include season and a leave type; class and prices remain selectable. */
const P12_renderTravelBeforeSeason=p12RenderTravel;
p12RenderTravel=function(){
  let html=P12_renderTravelBeforeSeason();
  html=html.replace('<label class="muted">Who is travelling?</label>', '<label class="muted">Travel season</label><select id="p12-trip-season" onchange="p12RefreshTripQuote()" data-ui-style="ui-064"><option value="shoulder">Shoulder season</option><option value="summer">Summer / peak season</option><option value="winter">Winter / off-peak where applicable</option></select><label class="muted">Who is travelling?</label>');
  html=html.replace('<label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1800" oninput="p12RefreshTripQuote()" data-ui-style="ui-037">', '<label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()" data-ui-style="ui-074"muted">Who is travelling?</label>', '<label class="muted">Travel season</label><select id="p12-trip-season" onchange="p12RefreshTripQuote()" data-ui-style="ui-064"><option value="shoulder">Shoulder season</option><option value="summer">Summer / peak season</option><option value="winter">Winter / off-peak where applicable</option></select><label class="muted">Who is travelling?</label>');
  html=html.replace('<label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1800" oninput="p12RefreshTripQuote()" data-ui-style="ui-037">','<label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()" data-ui-style="ui-037">');
  return html;
};
const P12_tripBookBeforeUnpaidFix=p12BookTrip;
p12BookTrip=function(purpose='holiday'){
  const leave=$('p12-trip-leave');
  if(leave&&purpose==='funeral')leave.value='unpaid';
  return P12_tripBookBeforeUnpaidFix(purpose);
};
/* No special family travel option should have to leave Egypt for every holiday. */
const P12_renderBeforeTripQuote=render;
render=function(){
  const result=P12_renderBeforeTripQuote();
  if(S&&activeTab==='world'){
    try{p12RefreshTripQuote();}catch(e){/* destination may not be mounted yet */}
  }
  return result;
};



/* A separate, rare chance to get the same title through a USD-paying remote employer.
   This is deliberately harder to obtain than a local job and does not grant immigration status. */
function searchCurrentRemoteOffer(){
  if(!S||S.age<18)return hint('Full-time remote roles start at 18.');
  if(!S.job)return hint('Take a relevant job first; this option searches for a remote version of your current title.');
  if(S.country!==S.home)return hint('Cross-border remote work does not automatically authorise you to stay abroad. Do not replace an employer-tied visa with a contractor role unless your permit allows it.');
  if(S.job.isRemoteUSD)return hint('Your current job already pays in USD. You can keep it or use the regular remote listings to look for another contract.');
  if(S.currentRemoteTryAge===S.age)return hint('You already tried for a remote version of this title this year.');
  if(S.jobAppsAge!==S.age){S.jobAppsAge=S.age;S.jobAppsCount=0;}if((S.jobAppsCount||0)>=4)return hint('You have used your four job applications this year.');S.jobAppsCount=(S.jobAppsCount||0)+1;
  const j={...S.job,benefits:{...(S.job.benefits||{})}},level=Math.max(0,Math.min(4,j.level||0)),track=j.trackId||'entry';
  if(track==='medical')return hint('This clinical title requires in-person practice or local professional licensing; this same-title remote route is not available.');
  S.currentRemoteTryAge=S.age;
  const exp=allExperience(),perf=j.perf||45;
  let chance=.012+Math.max(0,S.eng-60)/1100+Math.max(0,S.smarts-60)/1400+Math.max(0,perf-55)/650+Math.min(8,exp)*.009+((S.masterField||S.mastDone)? .025:0);
  if(track==='law')chance*=.55;
  if(S.country==='egy')chance*=.88;
  if(S.econ==='recession')chance*=.72;
  chance=Math.max(.01,Math.min(.18,chance));
  if(Math.random()>chance){fx({happiness:-2});log(`Your search for a remote USD-paying ${j.title} role did not succeed. The employer chose another candidate or did not offer location-independent pay. Strong English, demonstrable results, experience and interviews all matter.`);realismNotice('Remote role not secured',`Your current title can exist in remote work, but companies rarely pay full US-market rates to every overseas applicant. Keep your job and try again in another year after building relevant results.`);hint();render();return;}
  const ranges={entry:[15000,28000,42000,56000,72000],finance:[22000,42000,60000,78000,105000],tech:[25000,50000,76000,105000,145000],law:[18000,40000,62000,85000,115000],bio:[15000,35000,55000,76000,100000],medical:[0,0,0,0,0]};
  const base=(ranges[track]||ranges.entry)[level]||12000;
  const usdSalary=Math.round(base*(S.country==='egy'?1:(COUNTRIES[S.country]?.w||.8))*(.90+Math.random()*.22));
  const names=['Meridian Global Services','Northbridge International','Cedarline Remote Operations','Atlas Digital Partners','Blue Harbour Business Services','OpenLane Global'];
  recordCareer({...j},true);
  const medical=Math.random()<.28,leave=Math.random()<.35?18:10,contract=Math.random()<.28?'Remote employment contract':'International contractor';
  S.job={...j,company:pick(names),companyId:'remote-current-'+S.age+'-'+rnd(9999),salary:usdSalary,years:0,perf:Math.max(48,perf-3),isRemoteUSD:true,visaSponsorship:false,companyFactor:1,benefits:{medical,social:false,pension:false,bonus:Math.random()<.18?.05:0,leave,remote:'Fully remote · USD pay',hours:40,contract}};
  S.vacationCap=Math.max(14,leave*2);S.vacationDays=Math.min(S.vacationDays||0,S.vacationCap);
  S.jobApplications=S.jobApplications||[];S.jobApplications.push({year:gameYear(),company:S.job.company,role:j.title,result:'Hired — remote USD offer'});
  fx({happiness:10});log(`You secured a rare remote USD-paying role with ${S.job.company} as ${j.title}. The salary is USD ${usdSalary.toLocaleString()}/year, converted to ${C().cur} for your budget. Benefits are limited and this contract does not grant a visa.`);
  realismNotice('Rare remote offer secured',`Your title is unchanged, but the employer and pay model changed. Annual gross USD pay: ${usdSalary.toLocaleString()}. ${medical?'This offer includes a limited medical plan.':'This offer has no employer medical plan.'} Social insurance, paid leave, tax obligations and contract protections may differ from local employment.`);hint();render();
}
const P13_viewCareerBeforeCurrentRemote=viewCareer;
viewCareer=function(){
  let html=P13_viewCareerBeforeCurrentRemote();
  if(S&&S.job){
    const existing=S.job.isRemoteUSD?PR('You already hold a remote USD-paying role with this title. You can still explore other postings, but switching contracts risks losing current benefits.'):'The same title can sometimes be performed remotely for an international employer. This option is intentionally rare, depends on English, results and experience, and can replace local benefits with a contractor agreement.';
    html+=SEC('Remote version of your current title',existing+B(S.job.isRemoteUSD?'Already remote in USD':'Search for the same title with a USD-paying employer','The chance is low; a successful offer replaces your current job, does not create a second full-time job, and does not provide immigration sponsorship.','searchCurrentRemoteOffer()',S.currentRemoteTryAge===S.age||S.job.isRemoteUSD||S.country!==S.home));
  }
  return html;
};



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
  return `<div id="p14-fx-panel" class="card" data-ui-style="ui-075"><div data-ui-style="ui-076"><b data-ui-style="ui-026">USD / EGP · ${o.year}</b><b class="mono" data-ui-style="ui-077">$1 ≈ EGP ${current}</b></div><p class="muted" data-ui-style="ui-078">${o.basis==='historical annual reference'?'Historical annual reference':o.basis==='current-year reference'?'Current-year reference':'Model forecast'} · not an exact daily bank rate.</p><div data-ui-style="ui-079">Next year (${o.year+1}): <b>EGP ${next}/$</b> <span class="muted">(scenario range ${o.nextRange})</span></div><div data-ui-style="ui-080">When you turn 18 (${o.adultYear}): <b>EGP ${adult}/$</b> <span class="muted">(${o.adultBasis}${o.adultRange?`; broad scenario range EGP ${o.adultRange}`:''})</span></div><details data-ui-style="ui-081"><summary>Why the exchange rate changes</summary><p class="muted" data-ui-style="ui-082">Imported goods can become more expensive when the pound weakens. Local prices also rise with Egyptian inflation; salaries do not always catch up. From 2027 onward, the game uses a 5.5% annual base-case depreciation assumption, a ±7% next-year band, and a wider 3%–8% annual range for longer forecasts. It is an educational scenario, not financial advice or a guaranteed forecast.</p></details></div>`;
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
  if(!el){el=document.createElement('div');el.id='p14-parent-request-modal';el.className='p14-parent-request-overlay';document.body.appendChild(el);}
  const cur=C().cur, value=Math.round(r.amountPlayer);
  el.innerHTML=`<div data-ui-style="ui-083"><div data-ui-style="ui-084">FAMILY MESSAGE · ${gameYear()}</div><h2 data-ui-style="ui-085">${r.name} asks for your help</h2><p data-ui-style="ui-086">They need help with <b>${r.reason}</b>. The requested amount is about <b>${money(r.amountInternal)}</b> in your current currency. Family needs can be real, but you also have bills and goals of your own.</p><label for="p14-family-request-amount" class="muted">Amount you choose to send (${cur})</label><input id="p14-family-request-amount" type="number" min="0" value="${value}" data-ui-style="ui-087"><p class="muted" data-ui-style="ui-029">You may send the full amount, a smaller amount, or nothing. If you are abroad, an estimated 2.5% transfer fee is added. You cannot age up until you respond.</p><div class="acts"><button class="btn" data-ui-style="ui-088" onclick="p14RespondFamilyNeed(true)">Send chosen amount</button><button class="btn" data-ui-style="ui-004" onclick="p14RespondFamilyNeed(false)">Decline for now</button></div></div>`;
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
   rotating fictional market. The vacancies remain simulated, not live ads. */

P15_EGY_EMPLOYERS.forEach(n=>{if(typeof P12_EGY_BRANDS!=='undefined'&&!P12_EGY_BRANDS.includes(n))P12_EGY_BRANDS.push(n);});

function p15LocalEmployer(country,suffix,index){
  if(country==='egy'){
    const egyptNames={
      legal:['Sphinx Legal Partners','NileBridge Corporate Counsel','Delta Contracts & Compliance','Cairo Commercial Law Group','Alexandria Disputes & Claims','Nile Regulatory Advisory','Public Legal Services Office','Crescent KYC & Compliance','Canal Legal Research Centre','Mansour Contracts Office','Nile Employment Law Services','Cross-Border Document Review'],
      finance:['Delta Audit & Tax','Alexandria Commercial Bank','Crescent KYC & Regulatory','Nile Finance Operations','Canal Insurance Claims'],
      tech:['Pyramid Digital Solutions','Nile Data Systems','Delta Software Services','Alexandria Analytics Lab'],
      medical:['Nile Clinical Services','Cleopatra Healthcare Network','Mediterranean Medical Group'],
      bio:['Eva Pharma Quality Labs','Delta Clinical Research','Nile Scientific Services']
    };
    const arr=egyptNames[suffix]||egyptNames.legal;return arr[index%arr.length];
  }
  const prefix=P15_GLOBAL_PREFIX[country]||'Meridian';
  return `${prefix} ${suffix}`;
}



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
  const social=smart&&year>=2009?`<div data-ui-style="ui-089"><b>Social feed</b><p class="muted" data-ui-style="ui-090">Post once per year. Friends may react positively—or barely notice.</p><input id="p16-post-caption" type="text" maxlength="100" placeholder="Write a short update…" data-ui-style="ui-037"><button class="btn" ${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('post')]?'disabled':''} onclick="p16PhoneAction('post')">${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('post')]?'Already posted this year':'Publish update'}</button><button class="btn" ${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('photo')]?'disabled':''} onclick="p16PhoneAction('photo')">Take a photo and save the memory</button></div>`:'';
  const music=year>=2010?`<div class="acts" data-ui-style="ui-012"><button class="btn" onclick="p16PhoneAction('music')">Play downloaded music · free</button><button class="btn" ${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('stream')]?'disabled':''} onclick="p16PhoneAction('stream')">Subscribe to music streaming</button></div>`:`<button class="btn" onclick="p16PhoneAction('music')">Listen to saved music / radio · free</button>`;
  screen.innerHTML=`<div data-ui-style="ui-091"><span class="muted" data-ui-style="ui-092">${year} · ${smart?'Smartphone':'Mobile phone'}</span><span class="badge badge-cyan">Personal device</span></div><p data-ui-style="ui-093">Text people, save memories, listen to music and—if your device supports it—post to a social feed. Each activity has its own yearly limit.</p><section><h3>Messages</h3>${textButtons}</section><section data-ui-style="ui-089"><h3>Entertainment</h3><button class="btn" ${S.p16PhoneActions&&S.p16PhoneActions[p16PhoneLogKey('game')]?'disabled':''} onclick="p16PhoneAction('game')">Play a mobile game</button>${music}</section>${social}<section data-ui-style="ui-089"><b>Saved memories (${(S.p16PhonePosts||[]).length})</b>${(S.p16PhonePosts||[]).slice(-3).reverse().map(x=>`<div class="p16-phone-item"><b>${x.year}</b> · ${x.caption}</div>`).join('')||'<p class="muted" data-ui-style="ui-094">Your first photo or post will appear here.</p>'}</section>`;
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
  return `<section class="card"><h3>Ask your parents for specific help</h3><p class="muted">A specific request is more realistic than receiving a random amount. Their answer depends on family finances, your relationship and how much you ask for. Amounts are in ${C().cur}.</p><div class="row"><label for="p16-ask-purpose">Purpose</label><select id="p16-ask-purpose" data-ui-style="ui-095">${options}</select></div><div class="row"><label for="p16-ask-amount">Amount requested (${C().cur})</label><input id="p16-ask-amount" type="number" min="1" value="${defaultLocal}" data-ui-style="ui-063"></div><button class="btn" onclick="p16AskParent()">Ask for this amount</button></section>`;
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
  return SEC('Protection / asylum options',PR('If you genuinely fear persecution or serious harm, the game lets you explore a protection claim. Claims can be accepted or refused; rules, evidence standards, deadlines and work rights differ by country. This is a game system, not legal advice.')+`<label class="muted" for="p17-asylum-reason">Reason for seeking protection</label><select id="p17-asylum-reason" data-ui-style="ui-096">${opts}</select><label class="muted" for="p17-asylum-evidence">How supported is the claim?</label><select id="p17-asylum-evidence" data-ui-style="ui-096">${evidence}</select>`+B('Apply for protection / asylum',`Filing and translation cost about ${money(imp(120))}; approval is not guaranteed.`,'p17ApplyAsylum()',S.asylumAttempts>=2||S.wealth<imp(120)));
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
    '<div><label class="muted" for="p12-trip-spend">Daily food budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()" data-ui-style="ui-037"></div><div><label class="muted" for="p17-trip-shopping">Daily shopping / clothes / souvenirs budget (destination currency)</label><input id="p17-trip-shopping" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" data-ui-style="ui-037"></div>');
  html = html.replace('<div class="acts"><div><label class="muted">Return airfare class</label>',
    '<div data-ui-style="ui-097"><label class="muted" for="p17-trip-stay">Where will you stay?</label><select id="p17-trip-stay" onchange="p12RefreshTripQuote()" data-ui-style="ui-098"><option value="hotel">Hotel (use selected quality)</option><option value="airbnb">Airbnb / serviced apartment</option><option value="motel">Motel / hostel / budget guesthouse</option><option value="parents">Parents’ home (family visit only)</option><option value="sibling">Brother’s / sister’s home (family visit only)</option><option value="friend">Friend’s home / staying with a host</option></select></div><div><label class="muted" for="p17-trip-night">Custom cost per night (destination currency; 0 = estimate / free host stay)</label><input id="p17-trip-night" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" data-ui-style="ui-037"></div><div data-ui-style="ui-097"><label class="muted" for="p17-trip-leave-days">Days off requested from work</label><input id="p17-trip-leave-days" type="number" min="0" max="60" value="4" oninput="p12RefreshTripQuote()" data-ui-style="ui-037"><p class="muted" data-ui-style="ui-034">Trip duration and leave days can differ. Paid days reduce your available annual-leave balance; your manager can refuse.</p></div><div class="acts"><div><label class="muted">Return airfare class</label>');
  html = html.replace('<div><label class="muted">Time off from work</label>',
    '<div data-ui-style="ui-019"><label class="muted" for="p17-trip-gift-type">Gift to bring</label><select id="p17-trip-gift-type" onchange="p12RefreshTripQuote()" data-ui-style="ui-037"><option value="none">No gift</option><option value="sweets">Sweets / groceries / small souvenirs</option><option value="clothes">Clothes or a useful household gift</option><option value="medicine">Medicine / health items</option><option value="electronics">Electronics / a more expensive gift</option><option value="cash">Cash gift / contribution</option><option value="custom">Custom gift</option></select></div><div><label class="muted" for="p17-trip-gift-recipient">Gift recipient</label><select id="p17-trip-gift-recipient" data-ui-style="ui-037"><option value="family">Family in general</option><option value="mother">Mother</option><option value="father">Father</option><option value="sibling">Brother / sister</option><option value="friend">Friend / host</option><option value="partner">Partner</option></select></div><div><label class="muted" for="p17-trip-gifts">One-time gift budget (destination currency)</label><input id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" data-ui-style="ui-037"></div><div><label class="muted">Time off from work</label>');
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
  el.innerHTML = `<div data-ui-style="ui-099"><b>Estimated total</b><strong data-ui-style="ui-100">${money(q.total)}</strong></div>${ROW(q.international?'Return airfare · '+q.classKey:'Local transport',money(q.airfare||q.transport))}${q.international?ROW('Local transport',money(q.transport)):''}${ROW(`Stay · ${q.lodgingLabel} · ${q.nights} night(s)`,money(q.hotel))}${ROW('Food / meals',money(q.spend))}${ROW('Activities',money(q.activities))}${ROW('Shopping / clothes',money(q.shopping))}${ROW(q.gifts?`Gift · ${q.giftLabel}`:'Gifts',money(q.gifts))}${ROW('Trip length',`${q.days} day(s) · ${q.people} traveller(s)`)}${ROW('Annual leave requested',`${q.leaveDays} day(s)`)}${PR(`Local spending fields are in ${currency}. Return-fare and hotel values are estimates, not bookable live quotes. If you stay with family or a friend, accommodation may be free, but food, gifts, transport and your host’s circumstances still matter.`)}`;
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
    return `<div class="card p17-goal ${g.done?'p17-goal-done':'p17-goal-active'}"><div data-ui-style="ui-101"><b>${g.label}</b><span class="badge ${g.done?'badge-mint':'badge-violet'}">${g.done?'Completed':percent+'%'}</span></div><div class="row"><span>Target</span><b>${money(g.targetInternal)}</b></div><div class="row"><span>Saved toward goal</span><b>${money(g.savedInternal||0)}</b></div><div class="row"><span>Still needed</span><b>${money(left)}</b></div><div class="bar" data-ui-style="ui-102"><div class="fill fill-mint fill-width-${Math.max(0,Math.min(100,Math.round(percent)))}"></div></div>${g.done?PR(`Completed in ${g.completedYear||gameYear()}. The action is recorded in your Life log.`):`<div class="row"><label for="${amountId}">Add savings (${C().cur})</label><input id="${amountId}" type="number" min="1" placeholder="Amount to save" data-ui-style="ui-063"></div><div class="acts"><button class="btn" onclick="p17FundGoal('${g.id}')">Move money into goal</button><button class="btn" onclick="p17CompleteGoal('${g.id}')" ${left>0?'disabled':''}>Use savings / complete goal</button></div>`}</div>`;
  }).join(''):'<p class="muted">No active goals yet. Create one for something you need, then set aside money gradually.</p>';
  return `<section class="card" data-ui-style="ui-103"><h3>Needs & savings goals</h3><p class="muted">Plan for a phone, work clothes, a laptop, a family visit, treatment, English courses, a rent deposit or a home down payment. Goals do not buy the item automatically—you decide when to use the saved amount.</p><div class="row"><label for="p17-goal-type">Goal</label><select id="p17-goal-type" onchange="p17SetGoalDefault()" data-ui-style="ui-104">${opts}</select></div><div class="row"><label for="p17-goal-label">Name / details</label><input id="p17-goal-label" type="text" maxlength="70" placeholder="e.g. visit family next summer" data-ui-style="ui-104"></div><div class="row"><label for="p17-goal-target">Target amount (${C().cur})</label><input id="p17-goal-target" type="number" min="1" value="${p17GoalDefaultLocal('phone')}" data-ui-style="ui-063"></div><button class="btn btn-primary" onclick="p17CreateGoal()">Create savings goal</button>${rows}</section>`;
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
  return `<section class="card" data-ui-style="ui-105"><div data-ui-style="ui-106"><span class="badge badge-violet">${status}</span><span class="muted" data-ui-style="ui-082">Only one main job can be active</span></div><h3 data-ui-style="ui-023">${j.title}</h3><p data-ui-style="ui-107">${j.company||'Employer'} · ${(COUNTRIES[S.country]||COUNTRIES.usa).n}</p><div class="row"><span>Annual gross pay</span><b>${salary}</b></div><div class="row"><span>Seniority / track level</span><b>${(j.level||0)+1}/5</b></div><div class="row"><span>Tenure</span><b>${j.years||0} year(s)</b></div><div class="row"><span>Healthcare</span><b>${b.medical?'Employer medical cover':'No employer cover'}</b></div><div class="row"><span>Paid annual leave</span><b>${b.leave||14} days · ${Math.floor(S.vacationDays||0)} available</b></div><div class="row"><span>Work arrangement</span><b>${b.remote||'On-site'} · ${b.hours||40} h/week</b></div><div class="row"><span>Visa sponsorship</span><b>${S.country===S.home?'Not needed at home':remote?'Not included':j.visaSponsorship?'Employer willing to sponsor':'Not attached to this role'}</b></div>${PR(`Benefits: ${benefitsSummary(b)}. A remote USD role replaces any previous main job; it does not stack a second salary.`)}<div class="acts"><button class="btn" onclick="workHarder()" ${S.worked?'disabled':''}>Work harder</button><button class="btn" onclick="askPromotion()" ${S.promoTried?'disabled':''}>Request promotion</button></div>${B('Resign / leave this job','Your work history remains recorded; income from the role stops.','quitJob()')}</section>`;
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
  return SEC(`Job search · ${C().n}`,PR(`Job postings are generated for your current country. ${degree?`Your ${MAJORS[degree]?.name||degree} degree places related options first, including entry-level and adjacent roles.`:'You can still pursue general entry-level roles, while many specialist vacancies require a degree.'} Applications may be rejected, and salaries / perks differ by employer.`)+`<div data-ui-style="ui-108"><div class="card" data-ui-style="ui-109"><span class="muted" data-ui-style="ui-007">APPLICATIONS</span><b data-ui-style="ui-110">${S.jobAppsAge===S.age?Math.max(0,4-(S.jobAppsCount||0)):4} left</b></div><div class="card" data-ui-style="ui-109"><span class="muted" data-ui-style="ui-007">EXPERIENCE</span><b data-ui-style="ui-110">${allExperience()} yr</b></div><div class="card" data-ui-style="ui-109"><span class="muted" data-ui-style="ui-007">STATUS</span><b data-ui-style="ui-111">${S.job?'Employed':'Searching'}</b></div></div>${recommend.length?`<h4 data-ui-style="ui-112">Recommended for your degree / background</h4>${recommend.map(card).join('')}`:PR('No matching vacancies this year; check the general openings below.')}${other.length?`<details data-ui-style="ui-011"><summary>Other openings (${other.length})</summary>${other.map(card).join('')}</details>`:''}`);
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
  const customFields = `<details data-ui-style="ui-023"><summary>Custom destination — choose any supported country and type a city</summary><label class="muted" for="p18-trip-city">City / destination name</label><input id="p18-trip-city" type="text" maxlength="70" placeholder="e.g. Valencia, Madrid, Kyoto" value="" data-ui-style="ui-113"><label class="muted" for="p18-trip-country">Destination country</label><select id="p18-trip-country" onchange="p18TripDestinationChanged()" data-ui-style="ui-114">${countryOptions}</select><p class="muted">Custom routes use the country-pair fare estimate and your chosen city name; they are not live fares.</p></details>`;
  html = html.replace('<div id="p12-trip-estimate"', `${customFields}<div><label class="muted" for="p18-trip-local-transport">Daily local transport budget (destination currency)</label><input id="p18-trip-local-transport" type="number" min="0" value="${p18MoneyDefaultTransport((p12DestinationOptions()[0]||{}).country||S.country)}" oninput="this.dataset.userEdited='1';p12RefreshTripQuote()" data-ui-style="ui-037"></div><div id="p12-trip-estimate"`);
  html = html.replace('id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()"','id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()"');
  html = html.replace('<div id="p12-trip-estimate"', '<div><label class="muted" for="p18-trip-gift-details">Gift details (optional)</label><input id="p18-trip-gift-details" type="text" maxlength="70" placeholder="e.g. groceries for my parents" data-ui-style="ui-037"></div><div id="p12-trip-estimate"');
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
  el.innerHTML = `<div data-ui-style="ui-099"><b>Estimated trip budget</b><strong data-ui-style="ui-100">${money(q.total)}</strong></div>${ROW(q.international?'Return airfare · '+q.classKey:'Intercity / local transport',money(q.airfare||q.transport))}${ROW('Transport while there',money(q.destinationTransport||0))}${ROW(`Accommodation · ${q.lodgingLabel||'hotel'} · ${q.nights} night(s)`,money(q.hotel))}${ROW('Food / meals',money(q.spend))}${ROW('Shopping / clothes',money(q.shopping||0))}${ROW('Activities / excursions',money(q.activities))}${ROW(q.gifts?`Gift · ${q.giftLabel} for ${q.giftRecipient}`:'Gift budget',money(q.gifts||0))}${ROW('Trip length',`${q.days} day(s) · ${q.people} traveller(s)`)}${ROW('Annual leave requested',`${q.leaveDays} day(s)`)}${PR(`Food, local transport and gifts are in ${currency}. Lodging and airfare are estimates, not live bookable fares. The employer can refuse your leave, and travelling without valid status can create re-entry problems.`)}`;
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


function p20CityOptions(){return P20_CITY_MARKETS[S.country]||[['Capital city','capital',1.2],['Regional city','regional',0.9]];}
function p20CityTuple(){return p20CityOptions().find(x=>x[1]===S.cityId)||p20CityOptions()[0];}
function p20CityMultiplier(){return p20CityTuple()[2]||1;}
function p20SetCity(id){const x=p20CityOptions().find(a=>a[1]===id);if(!x)return;S.cityId=id;S.cityName=x[0];S.cityCostMultiplier=x[2];S.propertyMarket=[];log(`You chose to live in ${x[0]}. Local rent, care, home-help and property listings reflect this city's price level. Other prices remain country-based.`);realismNotice('City selected',`${x[0]} has a city-specific cost level. Higher wages may be available in some major cities, but rent and daily costs can also be much higher.`);render();}
function p20CityPanel(){const opts=p20CityOptions();if(!S.cityId||!opts.some(x=>x[1]===S.cityId)){const best=opts[0];S.cityId=best[1];S.cityName=best[0];S.cityCostMultiplier=best[2];}return `<section class="card"><h3>Choose your city</h3><p class="muted">Country-wide averages hide big differences. This sets your local market. Property listings, rent, care, home-help and selected furnishing costs use this city index; many other prices remain country-based.</p><select id="p20-city" onchange="p20SetCity(this.value)" data-ui-style="ui-037">${opts.map(x=>`<option value="${x[1]}" ${x[1]===S.cityId?'selected':''}>${x[0]} · ${x[2].toFixed(2)}× local cost level</option>`).join('')}</select><p class="muted" data-ui-style="ui-019">Selected: <b>${S.cityName}</b> · city cost index ${p20CityMultiplier().toFixed(2)}×</p></section>`;}

function p20Init(o){if(!o)return;const d={cityId:null,cityName:null,cityCostMultiplier:1,homeHelp:null,elderCare:{},p20AgeEventResolvedAge:-1,p20AgeEventsDone:[],p21AgeAdvancePending:false,p20CallsAge:-1,p20CallQueued:false,p20Furniture:{},p20NeedGoals:[],p20TeenApplyAge:-1,p20TeenApplyCount:0};for(const k in d)if(!(k in o))o[k]=d[k];if(!o.elderCare||typeof o.elderCare!=='object')o.elderCare={};if(!Array.isArray(o.p20AgeEventsDone))o.p20AgeEventsDone=[];if(!Array.isArray(o.p20NeedGoals))o.p20NeedGoals=[];}
const P20_migrate=migrate;migrate=function(o){o=P20_migrate(o);p20Init(o);return o;};
const P20_newGame=newGame;newGame=function(...args){P20_newGame(...args);p20Init(S);};

/* Age-specific, choice-driven milestones appear before advancing that age. */

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
function p20CareCard(){const oldParents=(S.family||[]).filter(m=>['Mother','Father'].includes(m.role)&&m.alive!==false&&m.age>=60);const canAfford=amount=>S.age>=18&&S.wealth>=amount;const services=[{id:'nurse',name:'Visiting nurse for a parent',usd:1500,desc:'Help with medication routines, appointments and basic care.'},{id:'caregiver',name:'Part-time elder caregiver',usd:950,desc:'Regular visits and help with daily activities.'}];let out=`<section class="card"><h3>Care for ageing parents</h3><p class="muted">Care costs are priced in the city where you live. You can help pay for your parents even if they live elsewhere; the service is modelled as a contribution toward their care.</p>`;if(!oldParents.length)out+='<p class="muted">This becomes relevant when a parent reaches 60.</p>';else{out+=oldParents.map(m=>{const care=S.elderCare[m.id]||'none';return `<div data-ui-style="ui-067"><b>${p17Relation(m,true)} (${m.name})</b><div class="muted">Age ${m.age} · current care: ${care==='nurse'?'visiting nurse':care==='caregiver'?'part-time caregiver':'family support only'}</div>${services.map(s=>{const price=Math.round(p20LocalCost(s.usd)*.38);return `<button class="btn" ${canAfford(price)?'':'disabled'} onclick="p20HireCare('${m.id}','${s.id}',${price})">Hire ${s.name} · ${money(price)}/year<small>${s.desc}</small></button>`;}).join('')}<button class="btn" onclick="p20StopCare('${m.id}')">Stop paid care</button></div>`;}).join('');}return out+'</section>';}
function p20HireCare(id,kind,cost){if(!S||S.age<18)return hint('Paid parent-care arrangements are available from age 18.');const m=S.family.find(x=>x.id===id);if(!m||S.wealth<cost)return hint('You cannot afford this care plan right now.');if(S.elderCare[id]===kind)return hint('This care plan is already active.');S.wealth-=cost;S.elderCare[id]=kind;S.expenses=(S.expenses||0)+cost;m.bond=clamp(m.bond+8);fx({happiness:2});const rel=p17Relation(m);const msg=`You arranged ${kind==='nurse'?'a visiting nurse':'a part-time caregiver'} for your ${rel} (${m.name}) and paid ${money(cost)} for the year. They called to thank you: “I feel safer knowing someone is checking in. Thank you for looking after me.”`;log(msg);realismNotice('Your parent is grateful',msg);render();}
function p20StopCare(id){delete S.elderCare[id];log('You stopped a paid family care arrangement. You can arrange it again when your budget allows.');render();}
function p20HomeHelpCard(){const current=S.homeHelp||'none';if(S.age<18)return `<section class="card"><h3>Home help</h3><p class="muted">Household services are managed by the adults in your family. Your character can arrange paid help from age 18.</p></section>`;const choices=[['none','No paid home help',0],['cleaner','Cleaner, twice a month',p20LocalCost(700)],['maid','Regular household helper',p20LocalCost(2200)]];return `<section class="card"><h3>Home help</h3><p class="muted">A cleaner or household helper can reduce fatigue from work and chores. Costs vary by city; paid help is optional and can be cancelled.</p><div class="muted">Current arrangement: <b>${current==='none'?'None':current==='cleaner'?'Cleaner twice a month':'Regular household helper'}</b></div>${choices.map(([id,label,cost])=>`<button class="btn" ${id!=='none'&&S.wealth<cost?'disabled':''} onclick="p20SetHomeHelp('${id}',${cost})">${label}${cost?` · ${money(cost)}/year`:''}<small>${id==='none'?'Keep the money; chores stay yours.':id==='cleaner'?'Light cleaning support.':'More frequent cleaning and household assistance.'}</small></button>`).join('')}</section>`;}
function p20SetHomeHelp(id,cost){const old=S.homeHelpCost||0;if(S.wealth<cost)return hint('Not enough money for this arrangement.');S.wealth-=cost;S.homeHelp=id;S.homeHelpCost=cost;if(id!=='none'){fx({happiness:3});S.energy=clamp((S.energy||50)+8);}log(id==='none'?'You cancelled paid home help.':`You hired ${id==='cleaner'?'a cleaner':'a household helper'} for ${money(cost)} per year. Your workload should feel lighter.`);render();}
const P20_viewFamilyBefore=viewFamily;viewFamily=function(){return P20_viewFamilyBefore()+p20CareCard()+p20HomeHelpCard();};
const P20_viewShopBefore=viewShop;viewShop=function(){let html=P20_viewShopBefore();if(S.age<18&&['apple','samsung','other','laptop','tv'].includes(activeShopTab)){const tech=catalog().filter(i=>['phone','laptop','tablet','console'].includes(i.cat));html+=`<section class="card"><h3>Ask your parents to buy it</h3><p class="muted">Under 18? Choose the exact phone, laptop, tablet or console you want. Parents may agree, suggest something cheaper, or refuse if household bills come first.</p><select id="p20-tech-item" data-ui-style="ui-037">${tech.map(i=>`<option value="${i.key}">${i.model||i.name||i.key} · ${money(i.cost)}</option>`).join('')}</select><button class="btn" onclick="p20AskParentsForTech()">Ask parents to buy this item</button></section>`;}if(activeShopTab==='furnish'){html+=`<section class="card"><h3>Furniture & home comfort upgrades</h3><p class="muted">Furnishings give a small immediate happiness boost. When your comfort score reaches 10, a comfortable home also adds 1 happiness each simulated year.</p>${[['bed','Quality bed and mattress',p20LocalCost(420),3],['sofa','Sofa and living-room set',p20LocalCost(650),3],['desk','Work / study desk and chair',p20LocalCost(180),2],['dining','Dining table and chairs',p20LocalCost(280),2],['curtains','Curtains, rugs and lighting',p20LocalCost(160),2],['wardrobe','Wardrobe and storage',p20LocalCost(240),2],['balcony','Balcony plants and seating',p20LocalCost(200),2],['smart','Smart-home and security kit',p20LocalCost(500),2]].map(([id,label,cost,benefit])=>`<button class="btn" ${S.wealth<cost?'disabled':''} onclick="p20BuyFurniture('${id}',${cost},${benefit})">${label} · ${money(cost)}<small>${S.p20Furniture[id]?'Already purchased':'Adds comfort and helps the home feel more complete.'}</small></button>`).join('')}</section>`;}return html;};
function p20AskParentsForTech(){if(S.age>=18||!parents().length)return hint('This option is for players under 18 who live with a parent.');if(S.p20AskedTech===S.age)return hint('You have already asked about a tech purchase this year.');const key=$('p20-tech-item')?.value;const item=catalog().find(i=>i.key===key&&['phone','laptop','tablet','console'].includes(i.cat));if(!item)return hint('Choose a phone, laptop, tablet or console first.');S.p20AskedTech=S.age;const chance=[.18,.48,.78][Math.min(2,S.famWealth||0)];const price=Number(item.cost)||0;const affordable=S.famWealth>0||price<80;if(Math.random()<chance&&affordable){parents().forEach(m=>m.bond=clamp(m.bond+3));giftItem(item,'parents');fx({happiness:4});log(`Your parents bought you a ${item.model||item.name||'tech item'} after discussing the household budget.`);realismNotice('Your parents agreed',`They said, “We can make this work, but please look after your ${item.model||item.name||'new device'}. We had to plan for this expense.”`);}else{parents().forEach(m=>m.bond=clamp(m.bond+1));log(`Your parents could not afford the ${item.model||item.name||'tech item'} this year. They explained that household bills come first.`);realismNotice('Your parents explained the budget','They said, “We know you want it. We cannot manage that cost this year, and we hope you understand.”');}render();}
function p20BuyFurniture(id,cost,benefit){if(!S.housing)return hint('Choose your current housing before buying furniture.');if(S.p20Furniture[id])return hint('You already own this item.');if(S.wealth<cost)return hint('Not enough money.');S.wealth-=cost;S.p20Furniture[id]=true;S.homeComfort=clamp((S.homeComfort||0)+benefit,0,100);log(`Bought ${id} furniture / home upgrade for ${money(cost)}.`);fx({happiness:2});render();}

/* Teenage part-time job choices are also available in Education, as requested. */
const P20_viewSchoolBefore=viewSchool;viewSchool=function(){let html=P20_viewSchoolBefore();if(S.age>=14&&S.age<=17){const jobs=[['babysitter','Babysitter',()=>p20LocalCost(500),'Reliable and trusted with children; irregular hours.'],['tutor','Private tutor',()=>p20LocalCost(850),'Needs good school results; can build communication skills.'],['cafe','Café assistant',()=>p20LocalCost(650),'Entry-level shifts; physically tiring and not guaranteed every week.']];html+=`<section class="card"><h3>Teenage part-time jobs (ages 14–17)</h3><p class="muted">Annual earnings are illustrative and depend on local wages, hours, demand and school schedule. Work should not replace school or violate local labour rules.</p>${jobs.map(([id,title,pay,desc])=>{const amt=pay();return `<button class="btn" onclick="p20ApplyTeenJob('${id}',${amt})">Apply: ${title}<small>Estimated ${money(amt)}/year · ${desc}</small></button>`;}).join('')}${S.p20TeenJob?`<p class="muted">Current side job: ${S.p20TeenJob.title}. Estimated annual income ${money(S.p20TeenJob.pay)}.</p><button class="btn" onclick="S.p20TeenJob=null;log('You left your teenage part-time job.');render();">Leave part-time job</button>`:''}</section>`;}return html;};
function p20ApplyTeenJob(id,pay){if(S.age<14||S.age>17)return hint('This job is available in the game from ages 14 to 17.');if(S.p20TeenJob)return hint('You can only hold one teenage part-time job at a time. Leave the current job first.');if(S.p20TeenApplyAge!==S.age){S.p20TeenApplyAge=S.age;S.p20TeenApplyCount=0;}if((S.p20TeenApplyCount||0)>=3)return hint('You have made three applications this year. Try again next year.');const j={babysitter:'Babysitter',tutor:'Private Tutor',cafe:'Café Assistant'}[id];if(!j)return;if(id==='tutor'&&S.smarts<40)return hint('Tutoring requires stronger school results; improve your skills before applying.');S.p20TeenApplyCount=(S.p20TeenApplyCount||0)+1;const baseChance=id==='tutor'?(S.smarts>=65?.74:.48):id==='babysitter'?(S.social>=60?.72:.58):(S.social>=55?.66:.52);if(Math.random()>baseChance){fx({happiness:-1});log(`You applied for ${j}, but the employer had limited shifts or chose another applicant.`);realismNotice('Application not successful',`You were not selected for ${j}. It was a competitive or limited-hours opening; you can apply for another type of teen job this year.`);render();return;}S.p20TeenJob={id,title:j,pay};log(`Your application for age-appropriate part-time work as ${j} was accepted. Estimated annual pay: ${money(pay)}, depending on shifts.`);realismNotice('Part-time job accepted',`You have a part-time role as ${j}. Your estimated annual pay is ${money(pay)}, though the amount will vary with shifts and school commitments.`);render();}
const P20_ageUpForTeenPay=ageUp;ageUp=function(){const ageBefore=S&&S.age;P20_ageUpForTeenPay();if(S&&S.age!==ageBefore&&S.p20TeenJob&&ageBefore>=14&&ageBefore<=17){const estimate=Number(S.p20TeenJob.pay)||0;const pay=Math.round(estimate*(.75+Math.random()*.5));S.wealth+=pay;S.income=(S.income||0)+pay;S.expenses=S.expenses||0;if(S.yearPopup)S.yearPopup.income=S.income;log(`Teenage job income: earned ${money(pay)} as ${S.p20TeenJob.title} (estimate ${money(estimate)}; shifts varied).`);if(S.effort==='hard')fx({happiness:-1,health:-1});if(S.age>17){log(`Your teenage job as ${S.p20TeenJob.title} ended as you aged out of the programme.`);S.p20TeenJob=null;}render();}};

/* Life tab shows tangible needs and the current year log rather than an empty-feeling summary. */
const P20_viewLifeBefore=viewLife;viewLife=function(){let html=P20_viewLifeBefore();if(S.age<12)html=p20CityPanel()+html;const needs=[['phone','Working phone',S.inventory.some(i=>i.cat==='phone')],['clothes','Clothes in reasonable condition',S.inventory.some(i=>i.cat==='fashion')],['home','Stable housing',!!S.housing],['family','Living in your home country',S.country===S.home],['savings','Emergency savings',S.wealth>=p20LocalCost(500)]];const goals=needs.map(([id,label,met])=>`<div class="row"><span>${label}</span><b class="${met?'text-mint':'text-amber'}">${met?'Covered':'Need / goal'}</b></div>`).join('');html+=`<section class="card"><h3>Everyday needs & goals</h3><p class="muted">Needs change as you grow: staying connected, replacing clothes, keeping a stable home, visiting family and having emergency savings all compete with other priorities.</p>${goals}${S.age>=12?`<button class="btn" onclick="go('shop')">Check phones, clothes and home items</button><button class="btn" onclick="go('world')">Plan a family visit or a trip</button>`:`<button class="btn" onclick="go('family')">Talk with your family about essentials</button><button class="btn" onclick="go('act')">Look at age-appropriate activities</button><p class="muted">Shopping and travel planning unlock at age 12.</p>`}</section>`;return html;};

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

/* ================= PHASE 22 — HARD AGE-PROGRESSION FIX =================
   Final controller: don't let older wrappers or an orphaned saved event trap the
   player at one age. The normal wrapped yearly ledger runs first; a legacy-chain
   fallback is used only if the age did not change and no decision is pending.
*/
const P22_wrappedYearProgression = P21_ageUpBeforeSetupGate;
const P22_renderBeforeStaleEventRepair = render;
render = function(){
  if(S && S.pending && (!S.ev || !Array.isArray(S.ev.choices) || S.ev.choices.length===0)){
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
    log('Recovered an unfinished event with no choices, so the life simulation can continue.');
  }
  return P22_renderBeforeStaleEventRepair();
};

ageUp = function(){
  if(!S) return;
  p20Init(S);

  /* Setup requirements should guide the player, never silently consume a year. */
  if(S.pending){
    if(S.ev && Array.isArray(S.ev.choices) && S.ev.choices.length){
      hint('Choose an option in the current event before advancing time.');
      return;
    }
    S.pending = false;
    S.evId = null;
  }
  if(S.age < 18 && !S.school){
    activeTab = 'school';
    render();
    hint('Choose a school in Education first. Then press Age up again.');
    return;
  }
  if(S.age >= 18 && !S.housing){
    activeTab = 'assets';
    render();
    hint('Choose your housing in Real Estate first. Then press Age up again.');
    return;
  }

  /* The parent-request modal is not represented by S.pending. Treat it as a real
     blocker so the fallback cannot misinterpret the modal as a broken age-up. */
  if(S.parentNeed || S.familyNeed){
    activeTab = 'life';
    hint('Please answer the family money request first. You can send any amount or decline, then press Age up again.');
    if(typeof p14ShowParentRequestModal === 'function') p14ShowParentRequestModal();
    else render();
    return;
  }

  const ageBefore = Number(S.age)||6;
  const story = P20_AGE_STORIES[ageBefore];
  S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
  const done = S.p20AgeEventsDone.includes(ageBefore);
  const resolved = S.p20AgeEventResolvedAge === ageBefore;
  const alreadyClosed = !!(story && S.ev && S.ev.title===story.title &&
    (!S.pending) && (!Array.isArray(S.ev.choices) || S.ev.choices.length===0));

  /* Show each age milestone once. A previously closed/saved milestone is treated as done. */
  if(story && !done && !resolved && !alreadyClosed){
    p20RunAgeStory();
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
    console.error('Age progression wrapper failed; trying legacy progression chain.', e);
  }

  /* The wrappers may return early on a stale flag. If no actual event is waiting,
     retry through the chain that predates the milestone wrapper. */
  if(S && S.age === previousAge && !S.pending && !S.yearPopup &&
     !(S.age < 18 && !S.school) && !(S.age >= 18 && !S.housing)){
    try {
      S.p20AgeEventsDone = Array.isArray(S.p20AgeEventsDone) ? S.p20AgeEventsDone : [];
      if(story && !S.p20AgeEventsDone.includes(previousAge)) S.p20AgeEventsDone.push(previousAge);
      P20_ageUpBefore();
    } catch(e) {
      console.error('Legacy age progression fallback failed.', e);
      hint('Age progression encountered an error. Your save is preserved; try reloading the game.');
    }
  }

  if(S && S.age !== previousAge){
    S.p21AgeAdvancePending = false;
    if((Number(S.homeComfort)||0) >= 10) fx({happiness:1});
    save();
  } else if(S && S.age === previousAge && !S.pending && !S.yearPopup){
    hint(`The game could not complete the year at age ${previousAge}. Your save is preserved; use Age up again to retry.`);
    if(progressionError) console.error(progressionError);
  }
  if(S && !S.dead) render();
};

/* Existing saves can contain an age-story card that was already answered but was
   saved before its completion marker was written. Reconcile that state on load. */
function p22RepairAgeState(){
  if(!S) return;
  p20Init(S);
  if(S.pending && S.ev && Array.isArray(S.ev.choices) && S.ev.choices.length===0) S.pending=false;
  const id=String(S.evId||'');
  if(id.startsWith('p20-age-') && (!S.pending || !S.ev || !Array.isArray(S.ev.choices) || S.ev.choices.length===0)){
    const a=Number(id.slice('p20-age-'.length));
    if(Number.isFinite(a)){
      S.p20AgeEventsDone=Array.isArray(S.p20AgeEventsDone)?S.p20AgeEventsDone:[];
      if(!S.p20AgeEventsDone.includes(a))S.p20AgeEventsDone.push(a);
      S.p20AgeEventResolvedAge=a;
    }
    S.evId=null;
  }
}
const P22_loadGameBeforeRepair = loadGame;
loadGame = function(){ P22_loadGameBeforeRepair(); p22RepairAgeState(); if(S) render(); };
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
  return `<section class="card"><h3>${m.title}</h3><p class="muted">${m.text}</p>${m.note?`<p data-ui-style="ui-115">${m.note}</p>`:''}<p class="muted">${siblingText}</p><b>Paid care for ${parent.name}</b>${[['nurse','Hire a visiting nurse'],['maid','Hire a household helper / maid'],['both','Hire both nurse and maid']].map(([kind,label])=>{const cost=p23CareCost(kind,1),share=Math.ceil(cost/2);return `${p23SiblingList().length?`<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','split',false)">${label} · ${money(share)}/year if sibling agrees<small>If your sibling refuses, nothing is charged and this decision stays open.</small></button>`:''}<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','self',false)">Pay for ${label.toLowerCase()} yourself · ${money(cost)}/year</button>`;}).join('')}<button class="btn" onclick="p23CareByTime('${m.id}','self',false)">I will provide regular care myself (uses 1 action and ongoing time)<small>No service bill, but it reduces your time and energy each year.</small></button>${p23SiblingList().length?`<button class="btn" onclick="p23CareByTime('${m.id}','sibling',false)">Ask a sibling to take regular care shifts<small>They may agree or refuse. No money is charged.</small></button>`:''}${oldCount>1?`<hr data-ui-style="ui-116"><b>Plan for both ageing parents</b>${[['nurse','Nurse for both'],['maid','Maid/helper for both'],['both','Nurse + maid for both']].map(([kind,label])=>`${p23SiblingList().length?`<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','split',true)">${label} · ${money(Math.ceil(p23CareCost(kind,oldCount)/2))}/year each share if sibling agrees</button>`:''}<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','self',true)">Pay full cost for ${label.toLowerCase()} · ${money(p23CareCost(kind,oldCount))}/year</button>`).join('')}<button class="btn" onclick="p23CareByTime('${m.id}','self',true)">I will help both parents myself (uses 1 action and ongoing time)</button></section>`:''}</section>`;
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
    return `<div data-ui-style="ui-018"><b>${h.name}</b>${ROW('Estimated market rent',`${fair.toLocaleString()} ${(COUNTRIES[country]||COUNTRIES.usa).cur}/month`)}${ROW('Status',S.housing===h.id?'You live here':h.status==='p12-listed'?'Listed — vacant':'Vacant') }<button class="btn" ${S.housing===h.id?'disabled':''} onclick="p23AutoRentAndFind('${h.id}')">Set market rent & find tenant now</button><button class="btn" ${S.housing===h.id?'disabled':''} onclick="p23ListCustomRentAndFind('${h.id}')">Use entered rent & find tenant now</button></div>`;
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
    const r=p14RequestState();if(r){html+=SEC(`${r.name} asks for help`,PR(`They need help with ${r.reason}. The suggested amount is ${money(r.amountInternal)}. You can send a smaller amount or decline, but this request should be answered before time advances.`)+`<label for="p14-family-request-amount" class="muted">Amount to send (${C().cur})</label><input id="p14-family-request-amount" type="number" min="0" value="${Math.round(r.amountPlayer)}" data-ui-style="ui-117">`+B('Send chosen amount','Only the amount you choose is transferred.','p14RespondFamilyNeed(true)')+B('Decline for now','Protect your budget; the relationship may be strained.','p14RespondFamilyNeed(false)'));}
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
  backdrop.innerHTML=`<div class="p24-modal"><div class="p24-pill">LIFELINE · LIFE UPDATE</div><h2>${p24Esc(title)}</h2><p>${p24Esc(message)}</p><button class="btn" id="p24-feedback-close" data-ui-style="ui-118">Continue</button></div>`;
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
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">FAM</span><div><h3 data-ui-style="ui-119">Family financial support</h3><p class="muted" data-ui-style="ui-029">Choose one person, then decide how to help. Transfers happen immediately; monthly support is deducted as 12 months at the yearly turn.</p></div></div>
  <div class="p24-field"><label for="p24-support-member">Family member</label><select id="p24-support-member" onchange="p24UpdateSupportPreview()">${opts}</select></div>
  <div id="p24-support-current" class="row" data-ui-style="ui-019"><span>Current monthly support</span><b>${money((selected.allow||0)/12)}/month</b></div>
  <div class="p24-field" data-ui-style="ui-011"><label for="p24-support-once">One-time transfer · ${p24Esc(C().cur)}</label><input id="p24-support-once" type="number" min="1" step="any" placeholder="Enter amount"></div>
  <button class="btn" onclick="p24FamilySupport('once')">Send one-time support<small>The recipient responds, and your cash changes immediately.</small></button>
  <div class="p24-field" data-ui-style="ui-120"><label for="p24-support-monthly">Monthly allowance / support · ${p24Esc(C().cur)}</label><input id="p24-support-monthly" type="number" min="0" step="any" value="${Math.max(0,Math.round(selected.allowCurrency===S.country&&Number.isFinite(selected.allowLocal)?selected.allowLocal/12:(selected.allow||0)*rateNow()/12))}"></div>
  <div class="p24-filter-grid"><button class="btn" data-ui-style="ui-121" onclick="p24FamilySupport('monthly')">Set monthly support<small>Charged yearly as 12 × the amount entered.</small></button><button class="btn" data-ui-style="ui-121" onclick="p24FamilySupport('stop')">Stop recurring support<small>No future yearly deduction.</small></button></div>
  <p class="muted" data-ui-style="ui-122">Support currently costs ${money(selected.allow||0)} per year for ${p24Esc(p24Relation(selected))}. The game uses yearly turns, so it settles the 12 monthly payments together.</p>
  ${S.country!==S.home&&parents().length?`<hr data-ui-style="ui-123"><b>Need help from home?</b><p class="muted" data-ui-style="ui-124">Ask your parents for a transfer while living abroad. They can send less than requested or refuse if their own budget is tight.</p><div class="p24-field"><label for="abroad-parent-amount">Amount requested · USD equivalent</label><input id="abroad-parent-amount" type="number" min="1" placeholder="e.g. 200"></div><button class="btn" onclick="p24AskParentsAbroad()" ${(S.askAb===S.age||!parents().length)?'disabled':''}>Ask parents for help</button>`:''}
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
  html=html.replace(/<div class="acts acts3" data-ui-style="ui-012">[\s\S]*?onclick="famGive\([\s\S]*?<\/div>/g,'');
  html=html.replace(/<p class="muted" data-ui-style="ui-125">(?:Allowance|Regular support) \([\s\S]*?<\/div>/g,'');
  return html+p24FamilySupportCard();
};

/* Home help belongs with property / household costs, never inside Relationships.
   Prices are moved closer to a real recurring service budget and are kept in one place. */
p20HomeHelpCard=function(){
  if(!S||S.age<18)return '';
  const current=S.homeHelp||'none';
  const choices=[['none','No paid home help',0],['cleaner','Cleaner twice a month',p20LocalCost(1400)],['maid','Regular household helper',p20LocalCost(6500)]];
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">HOME</span><div><h3 data-ui-style="ui-119">Household help</h3><p class="muted" data-ui-style="ui-029">Optional service for your own home. Costs vary by city and price level; renewing it competes with savings, rent and other bills.</p></div></div><p class="muted" data-ui-style="ui-126">Current arrangement: <b>${current==='none'?'None':current==='cleaner'?'Cleaner twice a month':'Regular household helper'}</b></p>${choices.map(([id,label,cost])=>`<button class="btn" ${id!=='none'&&current===id?'disabled':''} ${id!=='none'&&S.wealth<cost?'disabled':''} onclick="p20SetHomeHelp('${id}',${cost})">${label}${cost?` · ${money(cost)}/year`:''}<small>${id==='none'?'Cancel after the prepaid period; no new annual bill.':id==='cleaner'?'Occasional cleaning; you still handle most chores.':'More frequent household assistance; a large recurring expense.'}</small></button>`).join('')}</section>`;
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
    el.classList.toggle('hidden',!ok);if(ok)visible++;
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
    return `<details class="p24-job-card p17-posting" data-sponsor="${sponsor}" data-type="${type}" data-search="${p24Esc(search)}"><summary><span class="p24-brand">${p24Esc(brand)}</span><span data-ui-style="ui-127"><b>${p24Esc(title)}</b><small data-ui-style="ui-128">${p24Esc(p.name||'Employer')} · ${p24Esc(mode)}</small></span>${sponsor==='yes'?'<span class="badge badge-mint" data-ui-style="ui-129">May sponsor</span>':sponsor==='no'?'<span class="badge badge-amber" data-ui-style="ui-129">No sponsorship</span>':''}</summary>
    ${PR(p.desc||'Role duties depend on the employer and team.')}
    <div class="p24-filter-grid"><div><span class="p24-muted-label">Estimated gross pay</span><div class="p24-value">${p.isRemoteUSD?usd(pay):salary}</div><span class="muted" data-ui-style="ui-007">${payBasis} · annual estimate</span></div><div><span class="p24-muted-label">Experience</span><div class="p24-value">${minExp===0?'Entry level':`${minExp}+ years`}</div><span class="muted" data-ui-style="ui-007">Relevant experience preferred</span></div></div>
    ${ROW('Education',education)}${ROW('Hours & contract',`${p.hours||40} hrs/week · ${p.contract||'Terms vary'}`)}${ROW('Healthcare',p.medical?'Employer medical plan listed':'No employer medical plan listed')}${ROW('Pension / social insurance',p.social?'Contribution or statutory plan listed':'No employer contribution listed')}${ROW('Paid annual leave',`${p.leave||14} days/year`)}${ROW('Target bonus',p.bonus?`${Math.round(p.bonus*100)}% · not guaranteed`:'Not listed')}${ROW('Work arrangement',mode)}${S.country!==S.home?ROW('Sponsorship',p.sponsorship?'Employer may consider sponsorship; government approval is separate':'This vacancy does not offer sponsorship'):''}${blockReason?PR(`Not currently available: ${blockReason}`):''}<button class="btn" onclick="applyCompany('${p.id}')" ${blockReason||used>=4?'disabled':''}>${blockReason?'Requirements not met':used>=4?'Application limit reached':`Apply to ${p24Esc(p.name||'employer')}`}</button></details>`;
  });
  const careerCards=cards.join('');
  const filter=SEC('Find work',PR(`Employers shown here are generated for ${C().n}; these are fictional game vacancies, not live listings. You have ${Math.max(0,4-used)} application(s) left this year. Senior/lead titles require a relevant track record, and company sponsorship is not a visa guarantee.`)+`<div class="p24-filter-grid"><div><label for="p24-career-search">Search by role / employer</label><input id="p24-career-search" type="search" placeholder="e.g. accountant, analyst" oninput="p24CareerFilter()"></div><div><label for="p24-career-sponsor">Sponsorship</label><select id="p24-career-sponsor" onchange="p24CareerFilter()"><option value="all">All vacancies</option><option value="yes">May sponsor</option><option value="no">No sponsorship</option><option value="na">Not applicable / home country</option></select></div><div><label for="p24-career-type">Role type</label><select id="p24-career-type" onchange="p24CareerFilter()"><option value="all">All role types</option><option value="field">Related to my degree</option><option value="entry">Entry-level</option><option value="experienced">Experienced / senior</option><option value="remote">Remote / hybrid</option></select></div><div data-ui-style="ui-130"><span id="p24-career-count" class="muted" data-ui-style="ui-029">${list.length} openings</span></div></div>${careerCards}`);
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
  const loc=`<section class="card"><div class="p24-topline"><span class="p24-brand">${p24Esc(country.f||'LOC')}</span><div><h3 data-ui-style="ui-119">Current location</h3><p class="muted" data-ui-style="ui-026">${p24Esc(country.n)}${S.country!==S.home?` · Home country: ${p24Esc(home.n)}`:''}</p></div></div><p class="muted" data-ui-style="ui-026">Local prices, available employers and immigration options depend on where you live. Figures are estimates.</p></section>`;
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
  el.innerHTML=`<div class="p24-topline"><span class="p24-brand">EST</span><div><span class="p24-muted-label">Estimated total trip budget</span><div class="p24-value">${money(q.total)}</div><span class="muted" data-ui-style="ui-007">Planning estimate · not live fares</span></div></div><div class="p24-filter-grid"><div><span class="p24-muted-label">${q.international?'Return airfare · '+q.classKey:'Intercity / local transport'}</span><div class="p24-value">${money(q.airfare||q.transport)}</div></div><div><span class="p24-muted-label">Accommodation · ${p24Esc(stayName)}</span><div class="p24-value">${money(q.hotel)}</div></div><div><span class="p24-muted-label">Food / meals</span><b>${money(q.spend)}</b></div><div><span class="p24-muted-label">Activities</span><b>${money(q.activities)}</b></div><div><span class="p24-muted-label">Shopping / clothes</span><b>${money(q.shopping||0)}</b></div><div><span class="p24-muted-label">Gift / family contribution</span><b>${money(q.gifts||0)}</b></div></div>${q.international?ROW('Transport at destination',money(q.destinationTransport||0)):ROW('Transport while there',money(q.destinationTransport||0))}${ROW('Trip length',people)}${ROW('Annual leave requested',`${q.leaveDays==null?q.days:q.leaveDays} day(s)`)}${ROW('Travel season',seasonName)}${PR(`Food, local transport and gifts are entered in ${destCurrency}; totals are converted to your current game currency. Staying with a host may remove lodging cost. Return fares and accommodation are estimates, not live bookable prices. A manager can refuse leave, and travelling without valid status may create re-entry problems.`)}`;
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
    <details data-ui-style="ui-011"><summary>Advanced trip options</summary><div class="p24-trip-main" data-ui-style="ui-023">
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
    </div><details data-ui-style="ui-019"><summary>Custom city / country</summary><div class="p24-field" data-ui-style="ui-023"><label for="p18-trip-city">City / destination name</label><input id="p18-trip-city" type="text" maxlength="70" placeholder="e.g. Valencia, Madrid, Kyoto" oninput="p12RefreshTripQuote()"></div><div class="p24-field"><label for="p18-trip-country">Destination country</label><select id="p18-trip-country" onchange="p18TripDestinationChanged()">${countryOptions}</select></div><p class="muted">Custom routes use an estimated country-pair fare, not live bookable fares.</p></details></details>
    <div id="p12-trip-estimate" class="card" data-ui-style="ui-011"><span class="p24-muted-label">Estimated trip budget</span><p class="muted">Calculating estimate…</p></div><div class="p24-filter-grid"><button class="btn" data-ui-style="ui-121" onclick="p12RefreshTripQuote()">Refresh estimate</button><button class="btn" data-ui-style="ui-121" onclick="p12BookTrip('${S.funeralNotice?'funeral':'holiday'}')">${S.funeralNotice?'Review funeral trip':'Request leave & book'}</button></div>${S.job?PR(`Current employer: ${S.job.company||'Employer'} · ${Math.floor(S.vacationDays||0)} paid-leave day(s) available. Your manager may refuse leave.`):PR(S.mast?'You are studying; plan around exams and student-status conditions.':'You have no current job, so there is no employer leave approval or salary loss.')}`);
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
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">CITY</span><div><h3 data-ui-style="ui-119">City / local market</h3><p class="muted" data-ui-style="ui-029">Changes local rent, properties and selected services. Job salaries remain country-based estimates.</p></div></div><select id="p20-city" onchange="p24SetCity(this.value)" data-ui-style="ui-037">${opts.map(x=>`<option value="${x[1]}" ${x[1]===S.cityId?'selected':''}>${p24Esc(x[0])}</option>`).join('')}</select></section>`;
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


/* Refactor fix: one source of truth for teen employment. An unsuccessful application
   never creates a job record or pays income; legacy duplicate side-job records are merged. */
const P24_p20InitBeforeTeenJobFix = p20Init;
p20Init = function(o) {
  P24_p20InitBeforeTeenJobFix(o);
  if (!o) return;
  if (Number(o.age) >= 14 && Number(o.age) <= 17) {
    if (o.p20TeenJob && o.part) o.part = null;
    else if (!o.p20TeenJob && o.part && ['baby','cafe','tutor'].includes(o.part.id)) {
      const id = o.part.id === 'baby' ? 'babysitter' : o.part.id;
      const rule = P24_TEEN_JOB_RULES[id];
      o.p20TeenJob = { id, title: rule?.title || o.part.title || 'Part-time worker', pay: Math.max(0, Number(o.part.pay) || 0) };
      o.part = null;
    }
    if (o.p20TeenJob && (!Number.isFinite(Number(o.p20TeenJob.pay)) || Number(o.p20TeenJob.pay) < 0)) o.p20TeenJob = null;
    /* Repair legacy saves whose latest same-age log says this same application failed. */
    if (o.p20TeenJob && Array.isArray(o.logRows)) {
      const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      const jobName = norm(o.p20TeenJob.title);
      const failure = o.logRows.slice(0, 12).find(row => {
        if (Number(row.age) !== Number(o.age)) return false;
        const text = norm(row.t);
        const rejected = /not selected|limited shifts|chose another applicant|unsuccessful application/.test(text);
        const sameRole = jobName && text.includes(jobName);
        return rejected && sameRole;
      });
      if (failure) {
        const title = o.p20TeenJob.title;
        o.p20TeenJob = null;
        o.logRows.unshift({ age:Number(o.age)||6, t:`Save repair: cleared the ${title} job record because the latest application record says you were not hired. No future income will be paid for that rejected application.` });
        o.logRows = o.logRows.slice(0,200);
      }
    }
  }
};
function p24CurrentTeenJob() {
  if (S && S.p20TeenJob) return S.p20TeenJob;
  if (S && S.age >= 14 && S.age <= 17 && S.part) return { id:S.part.id === 'baby' ? 'babysitter' : S.part.id, title:S.part.title, pay:S.part.pay, legacy:true };
  return null;
}
function p24AttemptTeenJob(id, payOverride) {
  if (!S || S.age < 14 || S.age > 17) return { ok:false, blocked:true, message:'Teen jobs are available from ages 14 to 17 in this simulation.' };
  const rule=P24_TEEN_JOB_RULES[id];
  if (!rule) return { ok:false, blocked:true, message:'That teen job is not available.' };
  const current=p24CurrentTeenJob();
  if (current) return { ok:false, blocked:true, message:`You already have a part-time job as ${current.title}. Leave it before applying for another role.` };
  if (S.smarts < rule.minSmarts) return { ok:false, blocked:true, message:`This employer requires at least ${rule.minSmarts}% Smarts for ${rule.title}. Improve your skills before applying.` };
  if (S.p20TeenApplyAge !== S.age) { S.p20TeenApplyAge=S.age; S.p20TeenApplyCount=0; }
  if ((S.p20TeenApplyCount||0) >= 3) return { ok:false, blocked:true, message:'You have made three applications this year. Try again next year.' };
  S.p20TeenApplyCount=(S.p20TeenApplyCount||0)+1;
  const chance=Number(S[rule.chanceStat]) >= rule.chanceThreshold ? rule.chanceHigh : rule.chanceLow;
  if (Math.random() >= chance) {
    S.p20TeenJobLastOutcome={age:S.age,id,title:rule.title,ok:false};
    return { ok:false, blocked:false, title:rule.title, message:`You were not selected for ${rule.title}. The employer had limited shifts or chose another applicant. You do not hold this job and will not receive income from this application.` };
  }
  const pay=Number.isFinite(Number(payOverride)) && Number(payOverride)>0 ? Number(payOverride) : p20LocalCost(rule.basePay);
  S.p20TeenJob={id,title:rule.title,pay};
  S.p20TeenJobLastOutcome={age:S.age,id,title:rule.title,ok:true};
  S.part=null;
  return { ok:true, title:rule.title, pay, message:`Your application was accepted for occasional work as ${rule.title}. Estimated annual income is ${money(pay)}, though shifts vary around school.` };
}
p20StartTeenJob = function(kind) {
  const result=p24AttemptTeenJob(kind);
  if (!result.ok) return { happiness:-1, msg:result.message };
  log(`Teen job application accepted: ${result.title}; estimated annual income ${money(result.pay)}.`);
  return { social:2, happiness:2, msg:result.message };
};
p20ApplyTeenJob = function(id,pay) {
  const result=p24AttemptTeenJob(id,pay);
  if (!result.ok) {
    if (result.blocked) return hint(result.message);
    fx({happiness:-1});
    log(`Unsuccessful application for ${result.title}. No job was created and no salary was added.`);
    realismNotice('Application not successful',result.message);
    render();
    return;
  }
  log(`Your application for ${result.title} was accepted. Estimated annual pay: ${money(result.pay)}, depending on shifts.`);
  realismNotice('Part-time job accepted',`You have a part-time role as ${result.title}. Estimated annual pay is ${money(result.pay)}; actual income varies with shifts and school commitments.`);
  render();
};
const P24_takePartBeforeTeenUnification = takePart;
takePart = function(id) {
  if (S && S.age >= 14 && S.age <= 17) {
    const mapped = id === 'baby' ? 'babysitter' : id;
    return p20ApplyTeenJob(mapped);
  }
  return P24_takePartBeforeTeenUnification(id);
};


/* Static HTML controls use listeners here rather than inline onclick attributes. */
$('start-btn')?.addEventListener('click', startGame);
$('cont-btn')?.addEventListener('click', loadGame);
$('age-btn')?.addEventListener('click', ageUp);
$('p16-phone-close')?.addEventListener('click', closeLifePhone);

buildStart();

/* ---------- Boot ---------- */
renderPick();
$('name-input').addEventListener('keydown', e => { if (e.key==='Enter') startGame(); });
window.addEventListener('beforeunload', () => save());
if (initStart()){   // a save exists: restore it straight away
  try { loadGame(); }
  catch(err){ S=null; $('game').classList.add('hidden'); $('start').classList.remove('hidden'); }
}
