/* =====================================================================
   PHASE 12 — richer employment, leave/travel, family emergencies and property
   All prices below are game estimates calibrated to public 2026 price examples.
   Employer names and vacancies are fictional, generated and refreshed by year.
   ===================================================================== */

/* ---------- Employment market: varied vacancies and actual application outcomes ---------- */
const P12_OLD_COMPANY_LIST = companyListFor;
const P12_ROLE_PROFILES = [
  {id:'arap',trackId:'finance',roleTitle:'Accounts Receivable / Payable Accountant',titles:['Accounts Assistant','AR/AP Accountant','Senior AR/AP Accountant','Receivables Manager','Finance Operations Lead'],degree:'business',smarts:36,eng:25,minExp:0,factor:.84,medical:false,social:true,bonus:.01,leave:14,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent or 1-year contract',desc:'Customer balances, invoices, payment allocation, reconciliation and overdue follow-up.'},
  {id:'audit',trackId:'finance',roleTitle:'Audit Associate',titles:['Audit Trainee','Audit Associate','Senior Auditor','Audit Manager','Audit Partner'],degree:'business',smarts:48,eng:38,minExp:0,factor:.94,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid in busy season',hours:48,stress:6,contract:'Permanent; busy-season overtime',desc:'Audit testing, workpapers, client evidence and month-end / year-end deadlines.'},
  {id:'financial',trackId:'finance',roleTitle:'Financial Analyst',titles:['Junior Financial Analyst','Financial Analyst','Senior Financial Analyst','Finance Manager','Finance Director'],degree:'business',smarts:55,eng:45,minExp:1,factor:1.12,medical:true,social:true,bonus:.08,leave:21,remote:'Hybrid',hours:43,stress:5,contract:'Permanent',desc:'Budgeting, variance analysis, forecasts and management reporting.'},
  {id:'data',trackId:'tech',roleTitle:'Data / BI Analyst',titles:['Junior Data Analyst','Data Analyst','Senior BI Analyst','Analytics Manager','Head of Analytics'],degree:null,smarts:56,eng:48,minExp:1,factor:1.12,medical:true,social:true,bonus:.06,leave:21,remote:'Hybrid; remote by team',hours:40,stress:4,contract:'Permanent',desc:'Clean data, build reports, explain trends and work with stakeholders.'},
  {id:'accounting',trackId:'finance',roleTitle:'Junior Accountant',titles:['Junior Accountant','Accountant','Senior Accountant','Accounting Manager','Financial Controller'],degree:'business',smarts:34,eng:20,minExp:0,factor:.87,medical:false,social:true,bonus:.02,leave:14,remote:'On-site',hours:42,stress:4,contract:'Permanent',desc:'General ledger, invoices, journal entries, reconciliations and closing.'},
  {id:'bankops',trackId:'finance',roleTitle:'Banking Operations Officer',titles:['Operations Assistant','Banking Operations Officer','Senior Operations Officer','Operations Manager','Branch Operations Head'],degree:'business',smarts:42,eng:35,minExp:0,factor:1.02,medical:true,social:true,bonus:.07,leave:21,remote:'On-site / hybrid',hours:40,stress:4,contract:'Permanent',desc:'Account servicing, documentation, transaction controls and operational risk.'},
  {id:'customer',trackId:'entry',roleTitle:'Customer Support Specialist',titles:['Support Representative','Customer Support Specialist','Senior Support Specialist','Team Supervisor','Operations Manager'],degree:null,smarts:30,eng:40,minExp:0,factor:.83,medical:false,social:true,bonus:.03,leave:14,remote:'On-site or remote, depending on employer',hours:45,stress:6,contract:'Permanent or outsourced contract',desc:'Chat, email or voice support; targets and shifts vary. Non-voice roles are not guaranteed.'},
  {id:'hr',trackId:'entry',roleTitle:'HR / Administration Coordinator',titles:['HR Assistant','HR Coordinator','Senior HR Coordinator','HR Manager','People Operations Director'],degree:null,smarts:38,eng:35,minExp:0,factor:.88,medical:false,social:true,bonus:.02,leave:14,remote:'Mostly on-site',hours:40,stress:3,contract:'Permanent',desc:'Employee records, onboarding, attendance, recruitment scheduling and office operations.'},
  {id:'supply',trackId:'entry',roleTitle:'Supply Chain / Logistics Officer',titles:['Logistics Assistant','Supply Chain Officer','Senior Planner','Logistics Manager','Supply Chain Director'],degree:null,smarts:40,eng:30,minExp:0,factor:.94,medical:true,social:true,bonus:.04,leave:18,remote:'On-site / hybrid',hours:45,stress:5,contract:'Permanent',desc:'Purchase orders, deliveries, inventory, suppliers and shipment exceptions.'},
  {id:'sales',trackId:'entry',roleTitle:'Sales Executive',titles:['Sales Representative','Sales Executive','Senior Account Executive','Sales Manager','Commercial Director'],degree:null,smarts:32,eng:25,minExp:0,factor:.82,medical:false,social:true,bonus:.12,leave:14,remote:'Field / hybrid',hours:45,stress:6,contract:'Base salary plus variable commission',desc:'Customer accounts, targets, negotiations and commissions that are not guaranteed.'},
  {id:'developer',trackId:'tech',roleTitle:'Software Developer',titles:['Junior Developer','Software Developer','Senior Engineer','Engineering Manager','Technology Director'],degree:'cs',smarts:58,eng:50,minExp:0,factor:1.10,medical:true,social:true,bonus:.08,leave:24,remote:'Hybrid / remote by team',hours:40,stress:5,contract:'Permanent',desc:'Software development, testing, code review and delivery.'},
  {id:'productops',trackId:'tech',roleTitle:'Product Operations Analyst',titles:['Product Operations Assistant','Product Operations Analyst','Senior Product Analyst','Product Operations Manager','Head of Product Operations'],degree:null,smarts:54,eng:50,minExp:1,factor:1.04,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Product metrics, issue triage, customer insight and coordination with product teams.'},
  {id:'marketing',trackId:'entry',roleTitle:'Marketing Coordinator',titles:['Marketing Assistant','Marketing Coordinator','Marketing Specialist','Marketing Manager','Marketing Director'],degree:null,smarts:38,eng:40,minExp:0,factor:.90,medical:false,social:true,bonus:.03,leave:14,remote:'Hybrid',hours:40,stress:4,contract:'Permanent or agency contract',desc:'Campaign operations, content calendars, reporting and coordination.'},
  {id:'compliance',trackId:'law',roleTitle:'Compliance / Legal Associate',titles:['Compliance Assistant','Compliance Associate','Senior Compliance Officer','Compliance Manager','Head of Compliance'],degree:'law',smarts:56,eng:42,minExp:0,factor:1.06,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid by employer',hours:43,stress:5,contract:'Permanent',desc:'Policy controls, regulatory documentation, due diligence and legal support.'},
  {id:'medicaladmin',trackId:'entry',roleTitle:'Clinic Administration Officer',titles:['Clinic Assistant','Medical Admin Officer','Senior Clinic Coordinator','Clinic Operations Manager','Regional Operations Lead'],degree:null,smarts:36,eng:25,minExp:0,factor:.86,medical:true,social:true,bonus:.02,leave:18,remote:'On-site',hours:44,stress:5,contract:'Permanent / shift-based',desc:'Appointments, billing coordination, insurance paperwork and clinic workflow.'},
  {id:'lab',trackId:'bio',roleTitle:'Laboratory Technician',titles:['Lab Assistant','Laboratory Technician','Senior Lab Technician','Lab Manager','Research Operations Director'],degree:'biology',smarts:50,eng:35,minExp:0,factor:.92,medical:true,social:true,bonus:.03,leave:21,remote:'On-site',hours:40,stress:4,contract:'Permanent or research grant',desc:'Sample handling, safety records, tests and laboratory quality procedures.'},
  {id:'clinical',trackId:'medical',roleTitle:'Clinical / Healthcare Professional',titles:['Junior Clinical Role','Qualified Clinician','Senior Specialist','Department Lead','Clinical Director'],degree:'medicine',smarts:68,eng:35,minExp:0,factor:1.00,medical:true,social:true,bonus:.04,leave:21,remote:'On-site',hours:48,stress:8,contract:'Hospital or clinic contract',desc:'Patient care with licensing, training and local qualification requirements.'},
  {id:'auditdata',trackId:'finance',roleTitle:'Finance Data / Reporting Officer',titles:['Reporting Assistant','Finance Reporting Analyst','Senior Reporting Analyst','Reporting Manager','Head of Reporting'],degree:'business',smarts:50,eng:40,minExp:1,factor:1.02,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:42,stress:4,contract:'Permanent',desc:'Excel / BI reporting, reconciliations, finance data quality and recurring dashboards.'},
  {id:'procurement',trackId:'entry',roleTitle:'Procurement Officer',titles:['Procurement Assistant','Procurement Officer','Senior Buyer','Procurement Manager','Head of Procurement'],degree:null,smarts:40,eng:32,minExp:0,factor:.93,medical:true,social:true,bonus:.03,leave:18,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent',desc:'Supplier quotations, purchase approvals, stock availability and price negotiations.'}
];
const P12_EGY_BRANDS=['Nile Crest Packaging','Alexandria Commercial Bank','Fawry Digital Services','Sphinx FMCG Distribution','Mediterranean Pharma','Canal Business Services','Delta Audit & Tax','Pyramid Data Solutions','Red Sea Logistics','Cairo Business Process Services','Aman Retail Group','Blue Harbor Insurance','FirstGate Capital','NileCare Medical Network','Mansoura Industrial Group','Arabian Gulf Shared Services','Beacon Consumer Goods','Eastline Outsourcing','Atlas Business Systems','Harbour Medical Group','Pioneer Retail Egypt','Meridian Supply Chain'];
const P12_GLOBAL_BRANDS=['Northstar','Harbour','Meridian','Atlas','Evergreen','Crescent','Pioneer','Summit','BrightPath','Beacon','Vertex','Silverline','Union','Horizon','BluePeak','Redwood','Cedar','BridgePoint','Oakstone','FirstGate','Willow','Clearpath'];
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
const P12_PROPERTY_TYPES=[
 {id:'studio',name:'Older studio apartment',base:58000,kind:'buy',features:['Compact layout','Older plumbing','Walk-up building'],rent:.0030},
 {id:'oldflat',name:'Older 2-bedroom apartment',base:105000,kind:'buy',features:['Street-facing balcony','Older kitchen','Walk-up building'],rent:.0033},
 {id:'modernflat',name:'Modern 2-bedroom apartment',base:155000,kind:'buy',features:['Elevator','Balcony','Modern bathroom'],rent:.0031},
 {id:'condo',name:'Condo with shared facilities',base:235000,kind:'buy',features:['Security','Elevator','Shared garden'],rent:.0030},
 {id:'townhouse',name:'Townhouse',base:330000,kind:'buy',features:['Private entrance','Small garden','Parking'],rent:.0028},
 {id:'villa',name:'Family villa',base:520000,kind:'buy',features:['Private garden','Parking','Terrace'],rent:.0025},
 {id:'penthouse',name:'Landmark-view penthouse',base:410000,kind:'buy',features:['Landmark or sea view','Large terrace','Elevator'],rent:.0025},
 {id:'mansion',name:'Luxury mansion / estate',base:1850000,kind:'buy',features:['Landscaped gardens','Staff annex','Private pool'],rent:.0018}
];
const P12_LOCATIONS={egy:['Smouha, Alexandria','Sidi Gaber, Alexandria','Miami, Alexandria','Agami, Alexandria','Nasr City, Cairo','Maadi, Cairo','New Cairo','6th of October','New Administrative Capital','North Coast resort area'],usa:['Older suburb','City fringe','Downtown district','Transit-connected suburb'],gbr:['Outer London zone','Regional city centre','Commuter town'],can:['Suburban neighbourhood','Transit-connected district','City core'],deu:['Regional city','Outer-city district','Central neighbourhood'],gulf:['Residential district','New development','Central business district']};
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
   p12EnsureListingCategory(h.listingDetails||h);const rentInput=`<div class="row"><label for="p12-rent-${h.id}">Monthly asking rent (${(COUNTRIES[h.marketCountry||h.rentCurrency||S.country]||C()).cur})</label><input id="p12-rent-${h.id}" type="number" min="1" value="${h.rentLocalAmount||''}" placeholder="Monthly rent" style="width:145px"></div><div class="row"><label for="p12-rise-${h.id}">Signed-contract annual rise</label><select id="p12-rise-${h.id}"><option value="0">0%</option><option value="10">10%</option><option value="20">20%</option></select></div>`;
   const reno=`<details><summary>Detailed renovations</summary><p class="muted">Each tier changes the condition and estimated resale value. Premium appliances and finishes cost substantially more.</p><label>Renovation</label><select id="p12-reno-${h.id}" style="width:100%;margin:6px 0"><option value="kitchen">Kitchen / cabinets / countertop</option><option value="bathroom">Bathroom / hot water / jacuzzi / marble</option><option value="appliances">Appliances</option><option value="electrical">Electrical and lighting</option><option value="paint">Paint and finish</option><option value="aircon">Air conditioning</option></select><label>Quality</label><select id="p12-quality-${h.id}" style="width:100%;margin:6px 0"><option value="1">Basic / repair</option><option value="2">Good quality</option><option value="3">Premium / luxury</option></select><button class="btn" onclick="p12Renovate('${h.id}',$('p12-reno-${h.id}').value,$('p12-quality-${h.id}').value)">Complete renovation</button></details>`;
   return `<div style="margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:10px"><b>${h.name}</b><p class="muted" style="font-size:.82rem">${h.location||'Location not recorded'} · ${h.cond||100}% condition</p>${ROW('Estimated value',money(h.value))}${ROW('Mortgage balance',money(h.balance||0))}${ROW('Status',h.status==='p12-rented'?'Tenant in place':h.status==='p12-listed'?'Listed for rent':S.housing===h.id?'You live here':h.status==='rent'?'Rental investment':'Vacant')}${PR(p12Features(h))}${h.renovations&&h.renovations.length?PR('Renovations: '+h.renovations.join('; ')):''}<div class="acts acts3"><button class="btn" onclick="setLiveProperty(${i})" ${S.housing===h.id?'disabled':''}>Move in</button><button class="btn" onclick="p12SetRental('${h.id}')">List for rent</button><button class="btn" onclick="sellOwnedProperty(${i})">Sell property</button></div>${rentInput}<button class="btn" onclick="p12SetRental('${h.id}')">Publish rent listing</button>${reno}</div>`;
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
 return SEC('Trips, holidays and family time',PR(`Plan solo trips, a break with a partner or friend, or a family holiday. Total costs include transport / return airfare, lodging, daily spending and activities. Destination currencies: ${currencyLabels}.`)+`<label class="muted">Destination</label><select id="p12-trip-dest" onchange="p12RefreshTripQuote()" style="width:100%;margin:6px 0">${options}</select><label class="muted">Who is travelling?</label><select id="p12-trip-with" onchange="p12RefreshTripQuote()" style="width:100%;margin:6px 0"><option value="solo">Just me</option><option value="partner">Me and my partner</option><option value="friend">Me and a friend</option><option value="family">Family trip</option></select><div class="acts"><div><label class="muted">Days</label><input id="p12-trip-days" type="number" min="1" max="30" value="4" oninput="p12RefreshTripQuote()" style="width:100%"></div><div><label class="muted">Accommodation</label><select id="p12-trip-hotel" onchange="p12RefreshTripQuote()" style="width:100%"><option value="budget">Budget</option><option value="comfort" selected>Comfort / mid-range</option><option value="luxury">Luxury</option></select></div></div><div class="acts"><div><label class="muted">Return airfare class</label><select id="p12-trip-class" onchange="p12RefreshTripQuote()" style="width:100%"><option value="economy">Economy</option><option value="premium">Premium economy</option><option value="business">Business</option></select></div><div><label class="muted">Activities</label><select id="p12-trip-activity" onchange="p12RefreshTripQuote()" style="width:100%"><option value="budget">Low-cost activities</option><option value="normal" selected>Restaurants and activities</option><option value="luxury">Luxury dining / excursions</option></select></div></div><div><label class="muted">Daily food, shopping and spending budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1800" oninput="p12RefreshTripQuote()" style="width:100%"></div><div><label class="muted">Time off from work</label><select id="p12-trip-leave" onchange="p12RefreshTripQuote()" style="width:100%"><option value="paid">Request paid annual leave</option><option value="unpaid">Request unpaid leave / lost wages</option></select></div><div><label class="muted">Local transport</label><select id="p12-trip-transport" onchange="p12RefreshTripQuote()" style="width:100%"><option value="public">Public transport / bus</option><option value="train">Train / intercity coach</option><option value="car">Drive / private ride</option></select></div><div id="p12-trip-estimate" class="card" style="margin-top:10px"></div><div class="acts"><button class="btn" onclick="p12RefreshTripQuote()">Update budget</button><button class="btn" onclick="p12BookTrip('${S.funeralNotice?'funeral':'holiday'}')">${S.funeralNotice?'Request emergency leave and book funeral trip':'Request leave and book'}</button></div>${S.job?PR(`Current employer: ${S.job.company||'Employer'} · paid-leave balance ${Math.floor(S.vacationDays||0)} day(s). A manager can refuse, especially for a long trip or busy period.`):PR(S.mast?'You are studying; avoid exam periods and keep student-status requirements in mind.':'You do not currently have a job, so there is no manager approval or paid-leave deduction.')}`);
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
viewWorld=function(){let h=P12_viewWorldBefore();h=h.replace(/<section id="visit-card" class="card">[\s\S]*?<\/section>/,'');let add=p12RenderTravel();if(S.funeralNotice){add=SEC('Urgent family news',PR(`${S.funeralNotice.name} has died. You may need to request emergency leave and travel for the funeral. Tickets, accommodation and time away can be expensive; inheritance may depend on the estate and other family members.`)+B('Plan emergency funeral travel','Use the travel choices below; airfare class and trip costs apply.','p12TravelFuneral()')+add);}if(S.country!==S.home){const c=COUNTRIES[S.country],home=COUNTRIES[S.home];const classInput=`<label class="muted">Return ticket class</label><select id="p12-trip-class-old" style="width:100%"><option value="economy">Economy</option><option value="premium">Premium economy</option><option value="business">Business</option></select>`;add=add.replace(/<section class="card"><h3>Trips, holidays and family time<\/h3>/,'<section class="card"><h3>Trips, holidays and family time</h3>');}
return h+add;};

/* ---------- Family needs, custom help, funeral and inheritance ---------- */
const P12_viewFamilyBefore=viewFamily;
function p12FamilyRequests(){let html='';if(S.parentNeed){const m=S.family.find(x=>x.id===S.parentNeed.id),suggested=S.parentNeed.amountLocal||Math.round((S.country==='egy'?6000:180)*p12ScaleForYear(S.home||S.country,gameYear()));html+=SEC('A family member needs help',PR(`${m?m.name:'A parent'} asked for help with ${S.parentNeed.reason||'household expenses'}. You may help with any amount you can afford, or refuse. Refusal may hurt trust; offering more than you can afford can put you in debt.`)+`<div class="row"><label for="p12-parent-help">Amount to send (${C().cur})</label><input id="p12-parent-help" type="number" min="0" value="${suggested}" style="width:155px"></div><div class="acts"><button class="btn" onclick="p12AnswerParentNeed(true)">Send this amount</button><button class="btn" onclick="p12AnswerParentNeed(false)">Refuse for now</button></div>`);}
 if(S.familyNeed){const n=S.familyNeed,m=S.family.find(x=>x.id===n.id);html+=SEC('Specific request from family',PR(`${m?m.name:'A relative'} needs help with ${n.reason}. They asked for ${money(n.amountInternal)} (about ${C().cur} ${Math.round(n.amountInternal*rateNow()).toLocaleString()}). You may send the full amount, less, or refuse.`)+`<div class="row"><label for="p12-specific-help">Amount to send (${C().cur})</label><input id="p12-specific-help" type="number" min="0" placeholder="Enter any amount" style="width:155px"></div><div class="acts"><button class="btn" onclick="p12RespondSpecific(true)">Send chosen amount</button><button class="btn" onclick="p12RespondSpecific(false)">Decline</button></div>`);}
 const family=S.family.filter(m=>m.alive&&['Mother','Father','Sibling','Child'].includes(m.role));if(family.length){html+=SEC('Custom transfers and recurring support',PR('Enter any one-off gift or an annual allowance in your current currency. You can also help with treatment, rent or an important family event; keep your own emergency savings in mind.')+family.map(m=>`<div style="padding:8px 0;border-bottom:1px solid var(--line)"><b>${m.name}</b> <span class="muted">· ${m.role}</span><div class="row"><label for="p12-gift-${m.id}">One-off transfer (${C().cur})</label><input id="p12-gift-${m.id}" type="number" min="0" placeholder="Amount" style="width:130px"></div><div class="acts"><button class="btn" onclick="p12GiveFamily('${m.id}')">Send money</button><button class="btn" onclick="p12SetAllowance('${m.id}')">Set annual allowance</button></div><div class="row"><label for="p12-allow-${m.id}">Annual allowance (${C().cur})</label><input id="p12-allow-${m.id}" type="number" min="0" value="${Math.round((m.allow||0)*rateNow())}" style="width:130px"></div></div>`).join(''));}
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
function p12ShowYearPopup(){if(!S||!S.yearPopup||S.pending){const hidden=document.getElementById('p12-year-modal');if(hidden)hidden.remove();return;}let el=document.getElementById('p12-year-modal');if(!el){el=document.createElement('div');el.id='p12-year-modal';el.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.78);display:flex;align-items:center;justify-content:center;padding:16px;';document.body.appendChild(el);}const p=S.yearPopup;el.innerHTML=`<div style="background:#14141f;color:#e8e8f2;border:1px solid #35354b;border-radius:16px;padding:20px;max-width:480px;width:100%;max-height:85vh;overflow:auto;box-shadow:0 18px 60px #0009"><div style="color:#22d3ee;font-size:.8rem;font-weight:700;letter-spacing:.08em">YEAR ${p.year} COMPLETE</div><h2 style="margin:8px 0 12px;font-size:1.5rem">Age ${p.age}: ${p.title||'Another year lived'}</h2><div class="row"><span>Income recorded</span><b>${money(p.income||0)}</b></div><div class="row"><span>Expenses recorded</span><b>${money(p.expenses||0)}</b></div><div class="row"><span>Net change this year</span><b>${money((p.income||0)-(p.expenses||0))}</b></div><p style="font-size:.88rem;color:#aaaac0;margin:12px 0">${p.note||'Check the Life log for family news, work events and financial changes. Important decisions may appear before your next birthday.'}</p><button class="btn" style="text-align:center;background:#8b5cf6;border-color:#8b5cf6" onclick="p12DismissYearPopup()">Continue</button></div>`;}
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
const P12_EXTRA_APPLIANCES={
 kettle:['Bosch Styline variable-temperature kettle',95,'1.7L, variable temperature and boil-dry protection',2014],toaster:['Smeg premium 4-slice toaster',330,'4 slots, bagel and defrost functions',2012],microwave:['Samsung premium inverter microwave',380,'42L, inverter heating and grill',2018],oven:['Miele premium built-in oven',2800,'Large capacity, self-cleaning programmes and precise temperature control',2017],coffee:['Jura premium automatic coffee machine',2600,'Bean-to-cup, automatic milk system and cleaning programme',2016],blender:['Vitamix professional blender',900,'Commercial-grade motor and variable speed',2010],airfryer:['Ninja dual-drawer premium air fryer',520,'Large dual-zone cooking capacity',2022],fridge:['LG premium French-door refrigerator',4200,'Large capacity, dual cooling and premium finish',2018],dishwasher:['Miele premium dishwasher',2300,'Quiet operation, efficient cycles and premium racks',2015],washer:['Miele premium 9kg washer',2500,'Efficient motor, automatic dosing and low vibration',2017],dryer:['Miele heat-pump dryer',2400,'Heat-pump drying and fabric-care settings',2016],iron:['Laurastar premium steam station',800,'High-pressure steam station and garment-care board',2015],vacuum:['Dyson premium cordless vacuum',950,'High suction, filtration and multiple attachments',2018],robovac:['Roborock premium self-emptying robot vacuum',1500,'Mapping, mop-lift and auto-empty dock',2022],airpure:['Blueair premium whole-room purifier',1200,'High-capacity particle filtration',2018],water:['Premium under-sink reverse-osmosis system',1100,'Multi-stage filtration with replacement cartridges',2019]
};
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



