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

const REAL_WAGE_INDEX_EGY={2007:.07,2008:.075,2009:.08,2010:.085,2011:.09,2012:.095,2013:.10,2014:.11,2015:.12,2016:.17,2017:.18,2018:.22,2019:.25,2020:.26,2021:.29,2022:.34,2023:.43,2024:.78,2025:.90,2026:1};
function gameYearFor(o){return (o&&o.born||2001)+(o&&o.age||6);}
function rateForCountry(country,year){const c=COUNTRIES[country]||COUNTRIES.usa; if(c.hist&&year<2026)return c.hist(year); return c.rate||1;}
function localPriceIndex(country,year){const c=COUNTRIES[country]||COUNTRIES.usa; const p=(typeof prOf==='function'?prOf(year,S):(S&&S.prEra)||1); return p*rateForCountry(country,year)/(c.rate||1);}
function localCurrencyInternal(amount,country=S.country,year=gameYear()){return Math.max(0,Number(amount)||0)/Math.max(.0001,rateForCountry(country,year));}
function egyptWageIndex(year){const ys=Object.keys(REAL_WAGE_INDEX_EGY).map(Number).sort((a,b)=>a-b); if(year<=ys[0])return REAL_WAGE_INDEX_EGY[ys[0]]; if(year>=ys[ys.length-1])return REAL_WAGE_INDEX_EGY[ys[ys.length-1]]; let lo=ys[0],hi=ys[1]; for(let i=1;i<ys.length;i++){if(year<=ys[i]){lo=ys[i-1];hi=ys[i];break;}} const t=(year-lo)/(hi-lo);return REAL_WAGE_INDEX_EGY[lo]+(REAL_WAGE_INDEX_EGY[hi]-REAL_WAGE_INDEX_EGY[lo])*t;}

/* Current local salary estimates (annual, 2026 nominal). Senior roles are
   possible but rare; degree-level salaries are not all treated like US pay. */
/* Education costs use local EGP estimates instead of blindly converting US fees.
   Families still need the relevant family tier to unlock private/international school. */
const EGY_SCHOOL_LOCAL={private:75000,international:280000};
Object.entries(SCHOOLS).forEach(([k,school])=>{
  const d=Object.getOwnPropertyDescriptor(school,'cost');
  const oldCost=d&&d.get?d.get.bind(school):()=>d&&d.value||0;
  Object.defineProperty(school,'cost',{configurable:true,enumerable:true,get(){
    if(!S||S.country!=='egy'||!EGY_SCHOOL_LOCAL[k])return oldCost();
    return localCurrencyInternal(EGY_SCHOOL_LOCAL[k]*egyptWageIndex(gameYear()),'egy',gameYear());
  }});
});
const EGY_UNI_LOCAL={national:8000,private:200000};
Object.entries(UNIS).forEach(([k,uni])=>{
  const d=Object.getOwnPropertyDescriptor(uni,'tuition');
  const oldTuition=d&&d.get?d.get.bind(uni):()=>d&&d.value||0;
  Object.defineProperty(uni,'tuition',{configurable:true,enumerable:true,get(){
    if(S&&S.country==='egy')return localCurrencyInternal(EGY_UNI_LOCAL[k]*egyptWageIndex(gameYear()),'egy',gameYear());
    return oldTuition();
  }});
});

const EGY_SALARY_2026={
 entry:[84000,108000,144000,216000,360000],
 tech:[144000,240000,420000,720000,1200000],
 finance:[108000,180000,300000,540000,900000],
 law:[84000,132000,240000,480000,840000],
 medical:[84000,180000,360000,600000,1000000],
 bio:[84000,144000,240000,420000,720000]
};
const BASE_US_SALARIES={entry:[14000,19000,26000,36000,52000],tech:[48000,72000,105000,145000,210000],finance:[42000,64000,98000,140000,225000],law:[55000,82000,120000,185000,260000],medical:[72000,125000,190000,250000,340000],bio:[36000,58000,88000,130000,195000]};
const CAREER_TITLES={
 entry:['Entry-level service worker','Retail / operations associate','Customer support specialist','Shift supervisor','Operations manager'],
 tech:['Junior developer / IT analyst','Software engineer','Senior engineer / tech lead','Engineering manager','Technology director / CTO'],
 finance:['Junior accountant / finance assistant','Accountant / financial analyst','Senior accountant / finance manager','Finance director','Chief financial officer'],
 law:['Junior legal assistant','Legal associate','Senior legal associate','Legal partner / team lead','Managing partner'],
 medical:['Junior clinical role / resident','Experienced clinician','Specialist clinician','Department head','Chief medical officer'],
 bio:['Laboratory technician','Research analyst','Senior scientist','R&D manager','Chief scientist']
};
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
const REAL_NAMES={
 egy:{f:['Mariam','Salma','Nour','Farida','Malak','Aya','Yasmin','Habiba','Nadine','Hana'],m:['Omar','Youssef','Ahmed','Karim','Mostafa','Mina','Ziad','Adam','Ali','Hassan'],n:['Nour','Malak','Mariam','Omar','Youssef','Ali']},
 ind:{f:['Aarushi','Priya','Ananya','Isha','Meera','Kavya'],m:['Aarav','Arjun','Rohan','Kabir','Aditya','Vikram'],n:['Ari','Kiran','Aadi']},nga:{f:['Adaeze','Amara','Chiamaka','Zainab','Ngozi'],m:['Chinedu','Tunde','Emeka','Ibrahim','Kelechi'],n:['Amari','Zuri']},bra:{f:['Ana','Beatriz','Camila','Mariana','Sofia'],m:['Gabriel','Lucas','Rafael','Pedro','Mateus'],n:['Alex','Dani']},tur:{f:['Zeynep','Elif','Defne','Ece','Aylin'],m:['Emre','Kerem','Mehmet','Arda','Can'],n:['Deniz','Eren']},usa:{f:['Olivia','Emma','Ava','Sophia','Mia'],m:['Liam','Noah','Oliver','James','Ethan'],n:['Alex','Riley','Jordan']},gbr:{f:['Olivia','Amelia','Isla','Emily','Freya'],m:['Oliver','George','Harry','Arthur','Oscar'],n:['Alex','Riley','Jamie']},can:{f:['Olivia','Charlotte','Amelia','Ava','Maya'],m:['Noah','Liam','Lucas','Benjamin','Ethan'],n:['Alex','Riley','Jordan']},deu:{f:['Mia','Emilia','Hannah','Lena','Lea'],m:['Noah','Leon','Paul','Lukas','Finn'],n:['Alex','Robin','Kim']},uae:{f:['Mariam','Aisha','Noora','Fatima','Lina'],m:['Omar','Rashid','Ahmed','Khalid','Zayed'],n:['Noor','Rayan']},sau:{f:['Noura','Layan','Hala','Sara','Reem'],m:['Fahad','Omar','Abdullah','Saud','Khalid'],n:['Noor','Rayan']},pak:{f:['Ayesha','Fatima','Sana','Zara','Hira'],m:['Ahmed','Ali','Hamza','Bilal','Usman'],n:['Noor','Ari']},aus:{f:['Charlotte','Olivia','Isla','Matilda','Ruby'],m:['Oliver','Noah','Jack','Henry','Leo'],n:['Alex','Charlie']},fra:{f:['Emma','Jade','Louise','Camille','Chloé'],m:['Gabriel','Louis','Raphaël','Jules','Lucas'],n:['Camille','Alex']},ita:{f:['Giulia','Sofia','Aurora','Chiara','Alice'],m:['Leonardo','Francesco','Lorenzo','Alessandro','Mattia'],n:['Andrea','Alex']},nld:{f:['Emma','Julia','Tess','Sophie','Mila'],m:['Noah','Daan','Sem','Lucas','Levi'],n:['Alex','Robin']},jpn:{f:['Yui','Hina','Sakura','Aoi','Mei'],m:['Haruto','Sota','Ren','Yuto','Minato'],n:['Aoi','Haru']},kor:{f:['Seo-yeon','Ji-woo','Ha-eun','Min-seo','Soo-jin'],m:['Min-jun','Seo-jun','Do-yun','Ji-ho','Hyun-woo'],n:['Ji-woo','Jin']},sgp:{f:['Aisha','Mei Lin','Alicia','Chloe','Jia Yi'],m:['Ryan','Ethan','Wei Ming','Daniel','Arjun'],n:['Ari','Kai']},nzl:{f:['Isla','Charlotte','Amelia','Harper','Mila'],m:['Oliver','Noah','Leo','Jack','Lachlan'],n:['Alex','Riley']}
};
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
const MASTER_FIELDS=[
  {id:'finance',name:'MSc Accounting & Finance',related:['business'],years:2,baseUsd:18000},
  {id:'mba',name:'MBA / Management',related:['business'],years:2,baseUsd:24000},
  {id:'analytics',name:'MSc Data Analytics / Business Intelligence',related:['business','cs'],years:2,baseUsd:20000},
  {id:'cs',name:'MSc Computer Science',related:['cs'],years:2,baseUsd:22000},
  {id:'law',name:'LLM / Master of Laws',related:['law'],years:1,baseUsd:18000},
  {id:'health',name:'Master of Public Health',related:['medicine','biology'],years:2,baseUsd:20000}
];
const EGY_MASTERS_LOCAL={finance:{public:25000,private:85000},mba:{public:70000,private:180000},analytics:{public:35000,private:105000},cs:{public:40000,private:125000},law:{public:25000,private:90000},health:{public:35000,private:110000}};
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
    const fieldSelect=`<select id="local-master-field" style="width:100%;margin:8px 0">${MASTER_FIELDS.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}</select>`;
    const schoolSelect=`<select id="local-master-type" style="width:100%;margin:8px 0"><option value="public">Public university</option><option value="private">Private university</option></select>`;
    const fundSelect=`<select id="local-master-fund" style="width:100%;margin:8px 0"><option value="self">Pay myself</option><option value="parents">Ask parents to pay what they can</option><option value="partial">Compete for a 50% scholarship</option><option value="scholar">Compete for a full scholarship</option></select>`;
    html+=SEC('Local master’s degree',PR(`Choose the subject, public/private institution and funding plan in ${C().n}. A master’s usually takes 1–2 years; admission and scholarships are not guaranteed. Tuition varies sharply by country and university.`)+fieldSelect+schoolSelect+fundSelect+B('Apply for local master’s','Application fees are paid even if rejected.','applyLocalMasters($(\'local-master-field\').value,$(\'local-master-type\').value,$(\'local-master-fund\').value)',S.localMasterAppsAge===S.age));
    if(S.country===S.home){
      const intlField=`<select id="intl-master-field" style="width:100%;margin:8px 0">${MASTER_FIELDS.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}</select>`;
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
  const custom=S.family.map(m=>{if(!m.alive)return '';return `<section class="card"><h3>Money for ${m.name}</h3><p class="muted">Type the amount yourself in ${C().cur}. Transfers reduce your cash immediately; recurring support is charged each year.</p><div class="row"><span>One-time transfer</span><span style="display:flex;gap:5px"><input id="gift-${m.id}" type="number" min="0" placeholder="Amount" style="width:125px"><button class="menu-btn" onclick="transferFamilyCustom('${m.id}')">Send</button></span></div><div class="row"><span>Annual allowance / support</span><span style="display:flex;gap:5px"><input id="allow-${m.id}" type="number" min="0" placeholder="Amount / year" style="width:125px"><button class="menu-btn" onclick="setCustomAllowance('${m.id}')">Set</button></span></div><p class="muted" style="font-size:.8rem">Current recurring support: ${money(m.allow||0)}/year.</p></section>`;}).join('');
  const homes=(S.ownedHomes||[]).map(h=>`<option value="${h.id}">${h.name} · equity ${money((h.value||0)-(h.balance||0))}</option>`).join('');
  const relatives=S.family.filter(m=>m.alive&&(m.role==='Mother'||m.role==='Father'||m.role==='Sibling'||m.role==='Child')).map(m=>`<option value="${m.id}">${m.name} (${m.role})</option>`).join('');
  const homeCard=S.ownedHomes.length&&relatives
    ? SEC('Give a house to a parent or sibling',PR('A house transfer removes the property from your assets. An existing mortgage does not disappear just because you give the property away.')+`<select id="gift-home-id" style="width:100%;margin:8px 0">${homes}</select><select id="gift-home-member" style="width:100%;margin:8px 0">${relatives}</select>`+B('Transfer property','This is a permanent asset transfer.','giftHomeToFamily($(\'gift-home-id\').value,$(\'gift-home-member\').value)'))
    : SEC('Property gifts to family',PR('Buy a property first; then you can transfer an eligible property to a parent or sibling.'));
  const parentNeed=S.parentNeed?SEC('Your family is asking for help',PR(`${(S.family.find(m=>m.id===S.parentNeed.id)||{name:'A parent'}).name} needs help with ${S.parentNeed.reason}. You decide how much you can afford; it is okay to protect your own rent, food and emergency savings.`)+`<div class="row"><span>Amount you can give (${C().cur})</span><input id="parent-need-amount" type="number" min="1" placeholder="Enter amount" style="width:150px"></div>`+B('Help with this amount','One-off payment; no fixed amount is imposed.','helpParentsWithRequest()')+B('Decline this year','Your bond may fall, but you can protect your budget.','declineParentRequest()')):'';
  const ask= S.age>=18?SEC('Ask your parents for financial help',PR('They may say no or send only part of the amount. A transfer can strain family savings, especially if they have modest income. Enter the amount you need in your current currency.')+`<div class="row"><span>Requested amount</span><input id="parent-help-amount" type="number" min="1" placeholder="${C().cur}" style="width:150px"></div>${B('Ask parents for a transfer','Limited to one request per year.','requestParentSupport()',S.parentHelpAge===S.age||!parents().length)}`):'';
  return base+custom+parentNeed+homeCard+ask;
};

/* ==================== DIRECT IMMIGRATION WITHOUT A MASTER'S ==================== */
const DEST_LANG={usa:65,gbr:65,can:65,deu:45,aus:65,nzl:65,fra:45,nld:60,uae:40,sau:35,sgp:65,jpn:35,kor:35,ita:35,ind:30,bra:25,tur:25,pak:35,nga:40};
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
    out+=SEC('Visit family back home',PR(S.job?'Long-haul airfare can cost a large share of your savings. Request leave from your employer; it may be refused. Unpaid leave can reduce your wages.':S.imm?.stage==='student'?'Plan the visit during a semester break. Airfare and spending are still expensive, and absence can create attendance or re-entry risks.':'Without a current job, there is no employer leave to request, but airfare and trip spending still cost money.')+ROW('Approximate return airfare',usd(flightFareUsd(S.country,S.home)))+`<div class="row"><label for="visit-spend">Trip spending (${c.cur})</label><input id="visit-spend" type="number" min="0" placeholder="Hotel / gifts / spending" style="width:170px"></div>`+`<div class="acts">${S.job?`<button class="btn" onclick="visitHome('paid')" ${S.lastTripAge>=S.age-1?'disabled':''}>Request paid leave and visit</button><button class="btn" onclick="visitHome('unpaid')" ${S.lastTripAge>=S.age-1?'disabled':''}>Request unpaid leave and visit</button>`:`<button class="btn" onclick="visitHome('student')" ${S.lastTripAge>=S.age-1?'disabled':''}>Visit family during available time</button>`}</div>`);
    out+=SEC('Financial support from home',PR(`Ask your parents for a transfer in USD equivalent. Their resources depend on your family’s circumstances; the amount is capped and they can refuse.`)+`<div class="row"><label for="abroad-parent-amount">Amount requested (USD)</label><input id="abroad-parent-amount" type="number" min="1" placeholder="e.g. 200" style="width:150px"></div>${B('Ask parents for money','One request per year.','askParentsAbroad()',S.askAb===S.age||!parents().length)}`);
  }
  if(S.studentVisaCase)out+=SEC('Student visa pending',PR(`Your student visa for ${COUNTRIES[S.studentVisaCase.dest].n} is processing. You remain in ${C().n}; the university offer did not guarantee entry. The decision arrives after the annual processing period.`));
  if(!abroad&&S.age>=18&&!S.studentVisaCase){
    const destOpts=Object.entries(COUNTRIES).filter(([k])=>k!==S.country).map(([k,x])=>`<option value="${k}">${x.f} ${x.n}</option>`).join('');
    const trOpts=Object.entries(TRACKS).map(([k,x])=>`<option value="${k}">${x.name}</option>`).join('');
    if(S.moveCase){const m=S.moveCase;out+=SEC('Immigration case in progress',ROW('Route',m.kind==='work'?'Employer-sponsored job':'Points-based skilled migration')+ROW('Destination',`${COUNTRIES[m.dest].f} ${COUNTRIES[m.dest].n}`)+ROW('Time elapsed',`${m.years} of approximately ${m.processing} years`)+PR('You remain in your current country while the case is processed. The decision may be acceptance or refusal; fees are not refunded.'));
    }else{
      out+=SEC('Immigrate without doing a master’s',PR('A master’s degree is optional for some routes. Employer-sponsored jobs usually require a relevant bachelor’s degree or substantial experience, useful English, proof of skills and an employer willing to sponsor. Some destinations also have skilled-migration routes with points and proof-of-funds requirements.')+`<label for="work-dest" class="muted">Destination country</label><select id="work-dest" style="width:100%;margin:8px 0">${destOpts}</select><label for="work-track" class="muted">Job category to target</label><select id="work-track" style="width:100%;margin:8px 0">${trOpts}</select>${B('Apply for employer-sponsored job + work visa','Processing can take years; refusal is possible and fees are not refundable.','startWorkVisaRoute($(\'work-dest\').value,$(\'work-track\').value)')}${B('Apply for points-based skilled migration','Available only for selected destinations; degree, English, experience and proof of funds are checked.','startSkilledRoute($(\'work-dest\').value)')}`);
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
const realismNote=document.createElement('div');realismNote.className='muted';realismNote.style.cssText='font-size:.72rem;text-align:center;padding:4px 8px';realismNote.textContent='Lifeline · Realism update: local wages, separate rent scales, education pathways, company benefits and explicit visa outcomes.';const appEl=document.getElementById('app');if(appEl)appEl.appendChild(realismNote);



