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
  return `<section class="card"><h3>${m.title}</h3><p class="muted">${m.text}</p>${m.note?`<p style="color:var(--amber);font-size:.85rem">${m.note}</p>`:''}<p class="muted">${siblingText}</p><b>Paid care for ${parent.name}</b>${[['nurse','Hire a visiting nurse'],['maid','Hire a household helper / maid'],['both','Hire both nurse and maid']].map(([kind,label])=>{const cost=p23CareCost(kind,1),share=Math.ceil(cost/2);return `${p23SiblingList().length?`<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','split',false)">${label} · ${money(share)}/year if sibling agrees<small>If your sibling refuses, nothing is charged and this decision stays open.</small></button>`:''}<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','self',false)">Pay for ${label.toLowerCase()} yourself · ${money(cost)}/year</button>`;}).join('')}<button class="btn" onclick="p23CareByTime('${m.id}','self',false)">I will provide regular care myself (uses 1 action and ongoing time)<small>No service bill, but it reduces your time and energy each year.</small></button>${p23SiblingList().length?`<button class="btn" onclick="p23CareByTime('${m.id}','sibling',false)">Ask a sibling to take regular care shifts<small>They may agree or refuse. No money is charged.</small></button>`:''}${oldCount>1?`<hr style="border-color:var(--line);margin:12px 0"><b>Plan for both ageing parents</b>${[['nurse','Nurse for both'],['maid','Maid/helper for both'],['both','Nurse + maid for both']].map(([kind,label])=>`${p23SiblingList().length?`<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','split',true)">${label} · ${money(Math.ceil(p23CareCost(kind,oldCount)/2))}/year each share if sibling agrees</button>`:''}<button class="btn" onclick="p23ArrangeCare('${m.id}','${kind}','self',true)">Pay full cost for ${label.toLowerCase()} · ${money(p23CareCost(kind,oldCount))}/year</button>`).join('')}<button class="btn" onclick="p23CareByTime('${m.id}','self',true)">I will help both parents myself (uses 1 action and ongoing time)</button></section>`:''}</section>`;
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
    return `<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px"><b>${h.name}</b>${ROW('Estimated market rent',`${fair.toLocaleString()} ${(COUNTRIES[country]||COUNTRIES.usa).cur}/month`)}${ROW('Status',S.housing===h.id?'You live here':h.status==='p12-listed'?'Listed — vacant':'Vacant') }<button class="btn" ${S.housing===h.id?'disabled':''} onclick="p23AutoRentAndFind('${h.id}')">Set market rent & find tenant now</button><button class="btn" ${S.housing===h.id?'disabled':''} onclick="p23ListCustomRentAndFind('${h.id}')">Use entered rent & find tenant now</button></div>`;
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
    const r=p14RequestState();if(r){html+=SEC(`${r.name} asks for help`,PR(`They need help with ${r.reason}. The suggested amount is ${money(r.amountInternal)}. You can send a smaller amount or decline, but this request should be answered before time advances.`)+`<label for="p14-family-request-amount" class="muted">Amount to send (${C().cur})</label><input id="p14-family-request-amount" type="number" min="0" value="${Math.round(r.amountPlayer)}" style="width:100%;margin:8px 0 12px">`+B('Send chosen amount','Only the amount you choose is transferred.','p14RespondFamilyNeed(true)')+B('Decline for now','Protect your budget; the relationship may be strained.','p14RespondFamilyNeed(false)'));}
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



