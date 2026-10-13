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
const bar = (l,v,c) => `<div><div class="stat-top"><span>${l}</span><b class="mono">${v}%</b></div><div class="bar"><div class="fill" style="width:${v}%;background:${c}"></div></div></div>`;
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
  </div></section>`
/* ==========================================
   STATE INITIALIZATION FOR PENDING REQUESTS
   ========================================== */
if (typeof S !== 'undefined') {
  S.pendingRequests = S.pendingRequests || [];
}
