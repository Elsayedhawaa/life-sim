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
  html=html.replace('<label class="muted">Who is travelling?</label>', '<label class="muted">Travel season</label><select id="p12-trip-season" onchange="p12RefreshTripQuote()" style="width:100%;margin:6px 0"><option value="shoulder">Shoulder season</option><option value="summer">Summer / peak season</option><option value="winter">Winter / off-peak where applicable</option></select><label class="muted">Who is travelling?</label>');
  html=html.replace('<label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1800" oninput="p12RefreshTripQuote()" style="width:100%">', '<label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()" style="width:100%>');
  /* Restore the quote container when the string replacement above could not match an older layout. */
  return html;
};
/* Fix HTML string above using a safe targeted correction. */
p12RenderTravel=function(){
  let html=P12_renderTravelBeforeSeason();
  html=html.replace('<label class="muted">Who is travelling?</label>', '<label class="muted">Travel season</label><select id="p12-trip-season" onchange="p12RefreshTripQuote()" style="width:100%;margin:6px 0"><option value="shoulder">Shoulder season</option><option value="summer">Summer / peak season</option><option value="winter">Winter / off-peak where applicable</option></select><label class="muted">Who is travelling?</label>');
  html=html.replace('<label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1800" oninput="p12RefreshTripQuote()" style="width:100%">','<label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()" style="width:100%">');
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



