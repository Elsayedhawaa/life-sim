/* =====================================================================
   8. PHASE 10: COUNTRIES, MONEY, ABROAD, LOVE
   Prices/wages/house prices are multiplied by the country of residence.
   The USA is the baseline (all factors 1), so old saves behave as before.
   p = local prices, w = wages, h = house prices, r = rent vs wages,
   imp = imported goods (phones, laptops), mr = extra mortgage rate,
   dev = yearly chance of currency crash after 2026.
   ===================================================================== */
const COUNTRIES={
  egy:{n:'Egypt',f:'🇪🇬',cur:'EGP',sym:'E£',rate:50,p:.28,w:.10,h:.55,r:2,imp:.9,mr:.12,dev:.14,tier:3,eng:25,ssm:0,hist:y=>y<=2015?6.8:y===2016?10:y<=2021?16.5:y===2022?19:y===2023?31:y===2024?48:50,
    d:'Low wages, high living costs, a weak currency and mortgages near 17%. Owning a home is a dream; most people live with family for years.'},
  ind:{n:'India',f:'🇮🇳',cur:'INR',sym:'₹',rate:83,p:.30,w:.12,h:.45,r:1.6,imp:.9,mr:.04,dev:.04,tier:3,eng:55,ssm:0,d:'Huge job market, low wages, cheap local costs, expensive imports.'},
  nga:{n:'Nigeria',f:'🇳🇬',cur:'NGN',sym:'₦',rate:1500,p:.32,w:.07,h:.5,r:2,imp:1,mr:.15,dev:.15,tier:3,eng:70,ssm:0,d:'Very low wages, high inflation, a volatile currency.'},
  bra:{n:'Brazil',f:'🇧🇷',cur:'BRL',sym:'R$',rate:5.2,p:.5,w:.2,h:.5,r:1.3,imp:1,mr:.06,dev:.06,tier:2,eng:20,ssm:1,d:'Middle-income. Good cities, high interest rates and inequality.'},
  tur:{n:'Türkiye',f:'🇹🇷',cur:'TRY',sym:'₺',rate:38,p:.45,w:.18,h:.5,r:1.5,imp:1.1,mr:.12,dev:.12,tier:2,eng:20,ssm:0,d:'Middle-income with heavy inflation and a falling lira.'},
  usa:{n:'United States',f:'🇺🇸',cur:'USD',sym:'$',rate:1,p:1,w:1,h:1,r:1,imp:1,mr:0,dev:0,tier:1,eng:100,ssm:1,d:'High wages and high costs. The baseline of the game.',
    ms:{t:38000,y:2,i:6.5},v:.30,jh:.22,win:1,gc:1,nat:5},
  gbr:{n:'United Kingdom',f:'🇬🇧',cur:'GBP',sym:'£',rate:.79,p:1,w:.85,h:1.1,r:1.1,imp:1.1,mr:0,dev:0,tier:1,eng:100,ssm:1,d:'High costs, strong public services.',
    ms:{t:30000,y:1,i:6.5},v:.6,jh:.18,win:2,gc:0,nat:5},
  can:{n:'Canada',f:'🇨🇦',cur:'CAD',sym:'C$',rate:1.37,p:.95,w:.85,h:1,r:1,imp:1,mr:0,dev:0,tier:1,eng:100,ssm:1,d:'Welcoming to immigrants, expensive housing.',
    ms:{t:24000,y:2,i:6.5},v:.65,jh:.12,win:3,gc:0,nat:3},
  deu:{n:'Germany',f:'🇩🇪',cur:'EUR',sym:'€',rate:.92,p:.95,w:.9,h:.8,r:.9,imp:1,mr:0,dev:0,tier:1,eng:50,ssm:1,d:'Strong economy, almost free public universities.',
    ms:{t:1500,y:2,i:6.0},v:.7,jh:.12,win:2,gc:0,nat:6}
};
const MS_KEYS=['usa','gbr','can','deu'];
let pendCountry='egy', pendLike='f';
function C(o){ o=o||S; return COUNTRIES[(o&&o.country)||'usa']||COUNTRIES.usa; }
function cfx(o){ o=o||S; const c=C(o); if(!o.cf||o.cf.k!==o.country) o.cf={k:o.country||'usa',p:c.p,w:c.w,h:c.h,r:c.r,mr:c.mr,mul:1}; return o.cf; }
function rateNow(){ const c=C(); if (c.cur==='USD') return 1; const y=gameYear(); return (c.hist&&y<2026?c.hist(y):c.rate)*((S.cf&&S.cf.mul)||1); }
function fmtMoney(n){ const c=C(), v=Math.round(Math.abs(n)*rateNow()); return (n<0?'-':'')+c.sym+v.toLocaleString(); }
const usd = n => (n<0?'-$':'$')+Math.abs(Math.round(n)).toLocaleString();
const svc = b => Math.round(b*(S.prEra||1)*cfx().p);                  // local services
const imp = b => Math.round(b*(S.prEra||1)*C().imp);                  // imported / luxury goods
const mix = b => Math.round(b*(S.prEra||1)*(cfx().p+C().imp)/2);
const usdLine = () => C().cur==='USD'&&!S.usdHold ? '' : `<div class="wealth" style="margin-top:2px"><span>${C().cur==='USD'?'USD savings held':'≈ in US dollars'}</span><b class="mono">${usd(S.wealth)}${S.usdHold?` + ${usd(S.usdHold)} held`:''}</b></div>`;

/* ----- start screen: country + who you are attracted to ----- */
function likeLabel(){ const g=avG; if (g==='n') return null; return pendLike===g?'Gay':'Straight'; }
function buildStart(){
  const s=$('country-sel'); if (!s) return;
  if (!s.options.length) s.innerHTML=Object.entries(COUNTRIES).map(([k,c])=>`<option value="${k}">${c.f} ${c.n} (${c.tier===3?'hard mode':c.tier===2?'medium':'easy'})</option>`).join('');
  s.value=pendCountry; s.onchange=()=>{ pendCountry=s.value; buildStart(); };
  $('like-p').innerHTML=[['f','Attracted to women'],['m','Attracted to men']].map(([v,l])=>`<button class="chip ${pendLike===v?'sel':''}" style="font-size:.85rem" onclick="pendLike='${v}';buildStart()">${l}</button>`).join('');
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
const ENG=[['Self-study (apps and videos)',0,2],['Online course',250,5],['Language institute',900,9],['Intensive course + speaking club',2200,14]];
function takeEng(i){ const e=ENG[i], c=svc(e[1]); if (S.engDone===S.age) return hint('One English course per year.'); if (S.wealth<c) return hint('Not enough cash.');
  S.wealth-=c; S.engDone=S.age; S.eng=Math.min(100,S.eng+e[2]); fx({smarts:1}); log(`${e[0]}: English level is now ${S.eng}%.`); hint(); render(); }
function takeIelts(){ const c=imp(250); if (S.wealth<c) return hint('Not enough cash for the exam.'); S.wealth-=c;
  S.ielts=Math.min(9,Math.round((S.eng/100*9+Math.random()-.5)*2)/2); log(`IELTS result: band ${S.ielts}.`); hint(); render(); }
const REMOTE=[
  {id:'cold',t:'Cold caller for a US company',eng:40,usd:7000,deg:null,st:3},
  {id:'supp',t:'Remote customer support (US)',eng:55,usd:11000,deg:null,st:3},
  {id:'dev', t:'Remote / freelance developer',eng:60,usd:24000,deg:'cs',st:4},
  {id:'ana', t:'Remote analyst / account manager',eng:72,usd:32000,deg:'any',st:4}];
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
const TRACK_OF={cs:'tech',business:'finance',biology:'bio',law:'entry',medicine:'entry'};
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
const HARD=[['Visa processing delay: the paperwork sat for months',0,-3],['Request for evidence from the immigration office',300,-2],['Immigration lawyer fees',1200,-1],['Embassy appointment backlog, you could not visit family',0,-4],['Fingerprint and medical exam fees',450,0],['An interview left you anxious for weeks',0,-3]];
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
const TRAITS=['Kind','Ambitious','Funny','Artistic','Adventurous','Bookish','Calm','Romantic'];
const LIKES=[['jewelry','jewelry'],['fashion','fashion'],['tech','gadgets'],['sweets','flowers and sweets'],['trips','experiences']];
const HANG=[['Walk in the park',0,5],['Coffee date',15,7],['Cinema',25,8],['Dinner at a restaurant',70,10],['Day trip / amusement park',130,12],['Fine dining',250,15],['Weekend getaway',750,20]];
const GIFT=[['Flowers',20,'sweets',4,0],['Chocolates and cake',18,'sweets',4,0],['Perfume / cologne',120,'fashion',8,1],['Clothes shopping trip',300,'fashion',9,0],['Designer outfit',1100,'fashion',13,1],['Phone or tablet',700,'tech',11,1],['Watch',1800,'jewelry',14,1],['Jewelry',3000,'jewelry',17,1],['Designer bag',4200,'fashion',19,1],['Luxury shopping spree',9000,'fashion',25,1]];
const RINGS=[['Simple band',300,0],['Classic solitaire',1500,1],['Designer diamond ring',6000,2],['Luxury heirloom diamond',22000,3]];
const SHABKA=['Shabka (gold set, Egyptian tradition)',2800,1.5];
const WED={
  venue:['Venue',['Family home or garden',400],['Community banquet hall',3500],['Hotel ballroom',12000],['Luxury palace / 5-star resort',45000]],
  dress:['Wedding dress',['Rent a dress',250],['Off-the-rack gown',1200],['Designer gown',6000],['Couture gown',20000]],
  suit:['Wedding suit',['Rent a suit',150],['Tailored suit',800],['Designer tuxedo',3000],['Bespoke luxury tuxedo',9000]],
  food:['Catering, per guest',['Simple buffet',12],['Full dinner',35],['Premium dinner',80],['Gourmet and open bar',200]],
  guests:['Guest list',['30 close guests',30],['80 guests',80],['150 guests',150],['300 guests',300]],
  photo:['Photo and video',['None',0],['Photographer',600],['Photo and video team',3000],['Cinematic crew',9000]],
  music:['Music',['None',0],['Playlist and speakers',150],['Live band or DJ',2500],['Orchestra and stars',9000]],
  decor:['Flowers and decor',['None',0],['Simple flowers',400],['Full decor',3000],['Luxury floral design',12000]],
  honey:['Honeymoon',['None',0],['Staycation',300],['Beach trip',3000],['Luxury world trip',15000]]
};
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
const EGY_SHOCK={2016:.6,2022:.82,2023:.72,2024:.78};
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
const PR=m=>`<p class="muted" style="font-size:.85rem;margin-bottom:6px">${m}</p>`;

function viewLove(){
  const m=lp(), lb=likeLabel();
  const intro=SEC('Love and dating',PR(`${lb?lb+' · ':''}You are attracted to ${S.like==='f'?'women':'men'}. Dating starts at 16. Outings and gifts are limited to three each per year. ${sameSex()&&!C().ssm?`Same-sex marriage is not legally recognised in ${C().n}.`:''}`));
  if (!m){
    const pool=S.pool.map(c=>`<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px"><span style="font-size:1.6rem">${face(c.g,c.t,25)}</span> <b>${c.name}</b> <span class="muted">· ${c.age} · ${c.trait}</span>${B('Ask out','',`meetAsk('${c.id}')`)}</div>`).join('');
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
    const sel=Object.keys(WED).map(k=>{ const g=WED[k]; return `<div class="row" style="align-items:center"><span>${g[0]}</span><select onchange="wedSet('${k}',this.value)">${g.slice(1).map((o,i)=>{ const p=k==='food'?svc(o[1])+'/guest':k==='guests'?'':money(k==='dress'||k==='suit'?mix(o[1]):svc(o[1])); return `<option value="${i}" ${w[k]===i?'selected':''}>${o[0]}${p?' · '+p:''}</option>`; }).join('')}</select></div>`; }).join('');
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
