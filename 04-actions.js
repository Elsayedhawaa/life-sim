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

