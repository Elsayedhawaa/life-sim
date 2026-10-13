/* ================= PHASE 15 — MERGED USER JOB-MARKET IDEAS =================
   Adds degree-specific career options inspired by the attached version's
   employer roster and dynamic vacancy plan. Remote offers now replace the
   main employment record; no second full-time salary is stacked on top. */

/* Employer-name ideas from the supplied version, mixed into the existing
   rotating fictional market. The vacancies remain simulated, not live ads. */
const P15_EGY_EMPLOYERS = [
  'Vodafone Egypt Shared Services','Commercial International Bank','National Bank of Egypt',
  'Dar Al-Handasah Project Services','Cleopatra Healthcare Network','Mansour Retail & Automotive',
  'Bosta Logistics Technology','Eva Pharma Operations','Orascom Project Services',
  'Delta Contracts & Compliance','NileBridge Legal Research','Sphinx Legal Partners',
  'Fawry Digital Services','Pyramid Data Solutions','Canal Audit & Tax Services'
];
P15_EGY_EMPLOYERS.forEach(n=>{if(typeof P12_EGY_BRANDS!=='undefined'&&!P12_EGY_BRANDS.includes(n))P12_EGY_BRANDS.push(n);});
const P15_GLOBAL_PREFIX={usa:'Northstar',gbr:'Westbridge',can:'Maple',deu:'Rhein',fra:'Lumière',ita:'Milano',nld:'Canal',aus:'Southern Cross',nzl:'Koru',uae:'Gulf Crescent',sau:'Riyadh',ind:'Deccan',pak:'Indus',nga:'Atlantic',bra:'Verde',tur:'Anatolia',jpn:'Sakura',kor:'Han River',sgp:'Lion City',egy:'NileBridge'};
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

const P15_DEGREE_JOBS={
 law:[
  {id:'law-trainee',trackId:'law',group:'legal',roleTitle:'Graduate Legal Trainee',titles:['Graduate Legal Trainee','Junior Legal Associate','Legal Associate','Senior Legal Associate','Legal Team Lead'],factor:.66,degree:'law',smarts:38,eng:22,minExp:0,medical:false,social:true,bonus:0,leave:14,remote:'On-site',hours:44,stress:4,contract:'Paid trainee / entry-level contract',desc:'Research, document preparation, case files and supervised legal work. Newly qualified graduates normally start with supervised tasks.',sponsorChance:.15},
  {id:'law-assistant',trackId:'law',group:'legal',roleTitle:'Legal Assistant / Paralegal',titles:['Legal Assistant','Paralegal','Senior Paralegal','Paralegal Team Lead','Legal Operations Manager'],factor:.72,degree:'law',smarts:38,eng:25,minExp:0,medical:false,social:true,bonus:.01,leave:14,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent or 1-year contract',desc:'File preparation, court schedules, document checks, client follow-up and research support.',sponsorChance:.16},
  {id:'law-litigation',trackId:'law',group:'legal',roleTitle:'Litigation & Disputes Assistant',titles:['Disputes Assistant','Junior Litigation Associate','Litigation Associate','Senior Disputes Associate','Disputes Team Lead'],factor:.78,degree:'law',smarts:42,eng:28,minExp:0,medical:false,social:true,bonus:.02,leave:15,remote:'On-site / hybrid by team',hours:45,stress:5,contract:'Permanent; court deadlines can require overtime',desc:'Prepare case bundles, track hearings, organise evidence and assist lawyers with litigation deadlines.',sponsorChance:.15},
  {id:'law-research',trackId:'law',group:'legal',roleTitle:'Legal Researcher',titles:['Junior Legal Researcher','Legal Researcher','Senior Legal Researcher','Research Lead','Legal Knowledge Manager'],factor:.81,degree:'law',smarts:48,eng:35,minExp:0,medical:false,social:true,bonus:.02,leave:18,remote:'Hybrid where available',hours:40,stress:4,contract:'Permanent or project-funded',desc:'Research statutes, regulations and case law; summarise findings for lawyers and business teams.',sponsorChance:.20},
  {id:'law-contracts',trackId:'law',group:'legal',roleTitle:'Contracts Administrator',titles:['Contracts Assistant','Contracts Administrator','Senior Contracts Specialist','Contracts Manager','Head of Commercial Contracts'],factor:.90,degree:'law',degrees:['law','business'],smarts:44,eng:34,minExp:0,medical:true,social:true,bonus:.03,leave:18,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Review standard clauses, manage renewals, track signatures and flag issues for legal review. Law or business graduates may qualify.',sponsorChance:.24},
  {id:'law-compliance',trackId:'finance',group:'finance',roleTitle:'Compliance Analyst',titles:['Compliance Assistant','Compliance Analyst','Senior Compliance Analyst','Compliance Manager','Head of Compliance'],factor:.88,degree:'law',degrees:['law','business'],smarts:48,eng:38,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent; regulated-sector controls',desc:'Support policy controls, regulatory checks, audit evidence and compliance reporting. A law degree is relevant, but employers also hire suitable business graduates.',sponsorChance:.30},
  {id:'law-aml',trackId:'finance',group:'finance',roleTitle:'KYC / AML Analyst',titles:['KYC Associate','AML / KYC Analyst','Senior AML Analyst','Financial Crime Team Lead','Financial Crime Manager'],factor:.91,degree:'law',degrees:['law','business'],smarts:46,eng:40,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid by employer',hours:42,stress:5,contract:'Bank / fintech employment',desc:'Review customer files, identify missing documents, escalate suspicious patterns and maintain regulatory records.',sponsorChance:.34},
  {id:'law-insurance',trackId:'law',group:'legal',roleTitle:'Insurance Claims & Policy Specialist',titles:['Claims Assistant','Claims & Policy Specialist','Senior Claims Specialist','Claims Team Lead','Claims Operations Manager'],factor:.86,degree:'law',degrees:['law','business'],smarts:40,eng:30,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'Hybrid / office',hours:42,stress:4,contract:'Permanent',desc:'Interpret policy wording, organise claim evidence and coordinate disputes with customers and insurers.',sponsorChance:.20},
  {id:'law-inhouse',trackId:'law',group:'legal',roleTitle:'Junior In-house Legal Associate',titles:['Junior Legal Associate','Corporate Legal Associate','Senior Corporate Counsel','Legal Manager','General Counsel'],factor:1.05,degree:'law',smarts:58,eng:48,minExp:1,medical:true,social:true,bonus:.07,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent corporate role',desc:'Support commercial contracts, legal risk registers, internal advice and business stakeholders. Usually more competitive than trainee positions.',sponsorChance:.30},
  {id:'law-public',trackId:'law',group:'legal',roleTitle:'Public-Sector Legal Research Clerk',titles:['Legal Administration Clerk','Legal Research Clerk','Senior Legal Research Officer','Legal Section Supervisor','Legal Administration Manager'],factor:.70,degree:'law',smarts:40,eng:18,minExp:0,medical:false,social:true,bonus:0,leave:21,remote:'On-site',hours:40,stress:3,contract:'Public-sector exam / fixed recruitment cycle',desc:'Administrative legal support and records. Recruitment may require a public examination, local eligibility or a long hiring cycle.',sponsorChance:.01},
  {id:'law-legalops',trackId:'law',group:'legal',roleTitle:'Legal Operations & Document Review Analyst',titles:['Document Review Assistant','Legal Operations Analyst','Senior Document Review Analyst','Legal Operations Lead','Legal Operations Manager'],factor:.93,degree:'law',smarts:48,eng:52,minExp:0,medical:true,social:true,bonus:.04,leave:20,remote:'Hybrid; remote by project',hours:40,stress:4,contract:'Permanent or project contract',desc:'Organise contract repositories, review document sets, maintain legal trackers and support process improvement.',sponsorChance:.28},
  {id:'law-ip',trackId:'law',group:'legal',roleTitle:'Intellectual Property Assistant',titles:['IP Assistant','Trademark / IP Associate','Senior IP Associate','IP Portfolio Manager','IP Practice Lead'],factor:.95,degree:'law',smarts:50,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent; specialist training helpful',desc:'Support trademark filings, brand protection, licensing and intellectual-property documentation.',sponsorChance:.23}
 ],
 business:[
  {id:'biz-junior-accountant',trackId:'finance',group:'finance',roleTitle:'Junior Accountant',titles:['Junior Accountant','Accountant','Senior Accountant','Accounting Supervisor','Accounting Manager'],factor:.82,degree:'business',smarts:34,eng:20,minExp:0,medical:false,social:true,bonus:.02,leave:14,remote:'On-site',hours:42,stress:4,contract:'Permanent / probation period',desc:'Invoices, journal entries, account reconciliations, receivables and month-end support.',sponsorChance:.12},
  {id:'biz-audit',trackId:'finance',group:'finance',roleTitle:'Audit Associate',titles:['Audit Trainee','Audit Associate','Senior Auditor','Audit Manager','Audit Partner'],factor:.93,degree:'business',smarts:48,eng:38,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Office / client site',hours:48,stress:6,contract:'Permanent; busy-season overtime',desc:'Testing, workpapers, financial statements and client evidence. Busy season can mean long days.',sponsorChance:.22},
  {id:'biz-ap-ar',trackId:'finance',group:'finance',roleTitle:'Accounts Payable / Receivable Specialist',titles:['AR/AP Assistant','AR/AP Accountant','Senior AR/AP Accountant','Receivables Manager','Finance Operations Lead'],factor:.86,degree:'business',smarts:36,eng:24,minExp:0,medical:false,social:true,bonus:.02,leave:14,remote:'Mostly on-site',hours:42,stress:4,contract:'Permanent or 1-year contract',desc:'Customer/vendor balances, invoice matching, payment allocation and overdue follow-up.',sponsorChance:.14},
  {id:'biz-banking',trackId:'finance',group:'finance',roleTitle:'Banking Operations Officer',titles:['Operations Assistant','Banking Operations Officer','Senior Operations Officer','Operations Manager','Branch Operations Head'],factor:1.00,degree:'business',smarts:42,eng:35,minExp:0,medical:true,social:true,bonus:.07,leave:21,remote:'On-site',hours:40,stress:4,contract:'Permanent; screening and references',desc:'Account servicing, documents, transaction controls and operational-risk checks.',sponsorChance:.24},
  {id:'biz-tax',trackId:'finance',group:'finance',roleTitle:'Tax & Payroll Assistant',titles:['Tax Assistant','Tax / Payroll Accountant','Senior Tax Analyst','Tax Manager','Head of Tax'],factor:.88,degree:'business',smarts:44,eng:32,minExp:0,medical:false,social:true,bonus:.03,leave:15,remote:'Hybrid by employer',hours:42,stress:5,contract:'Permanent; deadlines around filings',desc:'Payroll records, tax workpapers, supporting schedules and returns under supervision.',sponsorChance:.18},
  {id:'biz-finops',trackId:'finance',group:'finance',roleTitle:'Finance Operations Analyst',titles:['Finance Operations Assistant','Finance Operations Analyst','Senior Finance Analyst','Finance Operations Manager','Finance Director'],factor:.94,degree:'business',smarts:45,eng:35,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'Hybrid',hours:42,stress:4,contract:'Permanent',desc:'Reconciliations, payment exceptions, expense reviews, monthly reporting and control checks.',sponsorChance:.22},
  {id:'biz-fpa',trackId:'finance',group:'finance',roleTitle:'FP&A / Budget Analyst',titles:['Budget Assistant','FP&A Analyst','Senior FP&A Analyst','FP&A Manager','Head of Planning'],factor:1.13,degree:'business',smarts:57,eng:48,minExp:1,medical:true,social:true,bonus:.08,leave:21,remote:'Hybrid',hours:43,stress:5,contract:'Permanent; forecast cycles',desc:'Budgeting, variance analysis, forecasts and management reporting. Usually expects strong Excel and some experience.',sponsorChance:.28},
  {id:'biz-risk',trackId:'finance',group:'finance',roleTitle:'Risk / Internal Controls Analyst',titles:['Controls Assistant','Risk & Controls Analyst','Senior Risk Analyst','Risk Manager','Head of Risk'],factor:1.02,degree:'business',smarts:52,eng:42,minExp:0,medical:true,social:true,bonus:.06,leave:21,remote:'Hybrid',hours:42,stress:5,contract:'Permanent; control-heavy work',desc:'Test controls, investigate exceptions, update risk registers and prepare evidence for audit.',sponsorChance:.28},
  {id:'biz-procurement',trackId:'entry',group:'finance',roleTitle:'Procurement & Vendor Analyst',titles:['Procurement Assistant','Vendor Analyst','Senior Procurement Analyst','Procurement Manager','Supply Chain Director'],factor:.91,degree:'business',smarts:40,eng:30,minExp:0,medical:true,social:true,bonus:.04,leave:18,remote:'On-site / hybrid',hours:42,stress:4,contract:'Permanent',desc:'Compare vendor quotations, verify purchase orders and track delivery and payment terms.',sponsorChance:.20}
 ],
 cs:[
  {id:'cs-it-support',trackId:'tech',group:'tech',roleTitle:'IT Support Analyst',titles:['IT Support Technician','IT Support Analyst','Senior IT Analyst','IT Service Desk Lead','IT Operations Manager'],factor:.82,degree:'cs',smarts:42,eng:40,minExp:0,medical:true,social:true,bonus:.03,leave:18,remote:'Hybrid / on-site',hours:40,stress:4,contract:'Permanent; shift support may apply',desc:'Troubleshooting devices, accounts, networks and internal user issues; practical skills may matter as much as grades.',sponsorChance:.20},
  {id:'cs-qa',trackId:'tech',group:'tech',roleTitle:'Junior QA / Software Tester',titles:['QA Trainee','QA Engineer','Senior QA Engineer','QA Lead','Quality Engineering Manager'],factor:.90,degree:'cs',smarts:50,eng:40,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Write test cases, reproduce bugs, validate fixes and document release quality.',sponsorChance:.28},
  {id:'cs-data',trackId:'tech',group:'tech',roleTitle:'Junior Data / BI Analyst',titles:['Data Analyst Intern','Junior Data Analyst','Data Analyst','Senior BI Analyst','Analytics Manager'],factor:.94,degree:'cs',degrees:['cs','business'],smarts:54,eng:42,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid / remote by team',hours:40,stress:4,contract:'Permanent; portfolio may be requested',desc:'Clean data, use SQL and spreadsheets, build dashboards and explain trends to non-technical users.',sponsorChance:.31},
  {id:'cs-dev',trackId:'tech',group:'tech',roleTitle:'Junior Software Developer',titles:['Graduate Developer','Junior Developer','Software Engineer','Senior Engineer','Engineering Lead'],factor:1.02,degree:'cs',smarts:58,eng:48,minExp:0,medical:true,social:true,bonus:.06,leave:22,remote:'Hybrid / remote by employer',hours:40,stress:5,contract:'Permanent; technical interview',desc:'Build, test and maintain software. Hiring depends on portfolio, coding interviews and current team demand.',sponsorChance:.38},
  {id:'cs-erp',trackId:'tech',group:'tech',roleTitle:'ERP / Business Systems Analyst',titles:['ERP Support Assistant','Business Systems Analyst','Senior Systems Analyst','ERP Product Owner','Enterprise Systems Manager'],factor:1.00,degree:'cs',degrees:['cs','business'],smarts:52,eng:45,minExp:0,medical:true,social:true,bonus:.05,leave:21,remote:'Hybrid',hours:40,stress:4,contract:'Permanent',desc:'Support ERP modules, investigate process issues and connect finance, operations and technical teams.',sponsorChance:.32},
  {id:'cs-security',trackId:'tech',group:'tech',roleTitle:'Junior Security Operations Analyst',titles:['Security Operations Trainee','SOC Analyst','Senior SOC Analyst','Security Team Lead','Security Manager'],factor:1.08,degree:'cs',smarts:61,eng:50,minExp:1,medical:true,social:true,bonus:.06,leave:22,remote:'Shift-based / hybrid',hours:42,stress:6,contract:'Permanent; shift rotation possible',desc:'Monitor alerts, document incidents and follow response procedures. Some roles require certifications or shift work.',sponsorChance:.35}
 ],
 medicine:[
  {id:'med-resident',trackId:'medical',group:'medical',roleTitle:'Junior Doctor / Resident',titles:['Intern / Junior Doctor','Resident Doctor','Specialist Physician','Consultant / Department Lead','Clinical Director'],factor:.82,degree:'medicine',smarts:68,eng:30,minExp:0,medical:true,social:true,bonus:.01,leave:21,remote:'On-site',hours:60,stress:8,contract:'Hospital training / residency; local licensing required',desc:'Clinical work under supervision. Graduation alone may not authorise independent practice; local registration and internship requirements apply.',sponsorChance:.18},
  {id:'med-clinical-research',trackId:'medical',group:'medical',roleTitle:'Clinical Research Coordinator',titles:['Clinical Research Assistant','Clinical Research Coordinator','Senior Research Coordinator','Clinical Research Manager','Research Operations Director'],factor:.91,degree:'medicine',degrees:['medicine','biology'],smarts:58,eng:50,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site / hybrid admin',hours:40,stress:4,contract:'Hospital / research centre contract',desc:'Coordinate study documents, visits, data entry and protocol compliance. Research roles still require relevant training.',sponsorChance:.26},
  {id:'med-quality',trackId:'medical',group:'medical',roleTitle:'Healthcare Quality & Patient Safety Officer',titles:['Quality Assistant','Quality Officer','Senior Quality Officer','Patient Safety Manager','Quality Director'],factor:.94,degree:'medicine',smarts:56,eng:40,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'On-site / hybrid reporting',hours:42,stress:5,contract:'Permanent',desc:'Audit patient pathways, investigate incidents and maintain quality documentation.',sponsorChance:.23},
  {id:'med-public-health',trackId:'medical',group:'medical',roleTitle:'Public Health Programme Officer',titles:['Programme Assistant','Public Health Officer','Senior Programme Officer','Programme Manager','Public Health Director'],factor:.90,degree:'medicine',degrees:['medicine','biology'],smarts:55,eng:48,minExp:0,medical:true,social:true,bonus:.02,leave:21,remote:'Hybrid / field work',hours:40,stress:4,contract:'Permanent or grant-funded',desc:'Support prevention programmes, health reporting, community projects and outcome monitoring.',sponsorChance:.23}
 ],
 biology:[
  {id:'bio-lab',trackId:'bio',group:'bio',roleTitle:'Laboratory Assistant / Technician',titles:['Lab Assistant','Laboratory Technician','Senior Lab Technician','Lab Supervisor','Laboratory Manager'],factor:.82,degree:'biology',smarts:48,eng:30,minExp:0,medical:true,social:true,bonus:.02,leave:18,remote:'On-site',hours:40,stress:4,contract:'Permanent or research grant',desc:'Handle samples, maintain safety logs, perform routine tests and follow standard operating procedures.',sponsorChance:.22},
  {id:'bio-qc',trackId:'bio',group:'bio',roleTitle:'Pharmaceutical QA / QC Analyst',titles:['QC Trainee','QA / QC Analyst','Senior QC Analyst','QC Supervisor','Quality Manager'],factor:.91,degree:'biology',smarts:52,eng:34,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'On-site',hours:42,stress:5,contract:'Permanent; quality procedures and shift work may apply',desc:'Sample testing, batch records and quality documentation in a pharmaceutical or manufacturing environment.',sponsorChance:.25},
  {id:'bio-clinical',trackId:'bio',group:'bio',roleTitle:'Clinical Trial Assistant',titles:['Clinical Trial Assistant','Clinical Research Associate','Senior CRA','Clinical Trial Manager','Clinical Operations Lead'],factor:.96,degree:'biology',smarts:54,eng:48,minExp:0,medical:true,social:true,bonus:.03,leave:21,remote:'Hybrid / site visits',hours:40,stress:4,contract:'Research / pharma contract',desc:'Coordinate trial documentation, site communication and monitoring records.',sponsorChance:.28},
  {id:'bio-food',trackId:'bio',group:'bio',roleTitle:'Food / Environmental Laboratory Analyst',titles:['Lab Trainee','Laboratory Analyst','Senior Analyst','Lab Supervisor','Technical Manager'],factor:.86,degree:'biology',smarts:46,eng:28,minExp:0,medical:false,social:true,bonus:.02,leave:18,remote:'On-site',hours:40,stress:3,contract:'Permanent or fixed-term',desc:'Test food, water or environmental samples, record results and keep equipment calibrated.',sponsorChance:.18},
  {id:'bio-regulatory',trackId:'bio',group:'bio',roleTitle:'Regulatory Affairs Associate',titles:['Regulatory Assistant','Regulatory Affairs Associate','Senior Regulatory Specialist','Regulatory Manager','Regulatory Affairs Director'],factor:.98,degree:'biology',degrees:['biology','medicine'],smarts:55,eng:48,minExp:0,medical:true,social:true,bonus:.04,leave:21,remote:'Hybrid paperwork / on-site',hours:40,stress:4,contract:'Permanent',desc:'Prepare product registrations, maintain technical files and respond to regulator requests.',sponsorChance:.26}
 ]
};

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
const P15_oldRequirementText="${(post.degrees&&post.degrees.length)?`degree in ${post.degrees.map(k=>MAJORS[k]?.name||k).join(' or ')}; `:(post.degree?`degree in ${MAJORS[post.degree]?.name||post.degree}; `:'')}English ${post.eng||0}%+, Smarts ${post.smarts||0}%+${post.minExp?`, ${post.minExp}+ relevant years`:''}. Hiring also depends on interviews, competition and budget.";
const P15_newRequirementText="${(post.degrees&&post.degrees.length)?`degree in ${post.degrees.map(k=>MAJORS[k]?.name||k).join(' or ')}; `:(post.degree?`degree in ${MAJORS[post.degree]?.name||post.degree}; `:'')}English ${post.eng||0}%+, Smarts ${post.smarts||0}%+${post.minExp?`, ${post.minExp}+ relevant years`:''}. Hiring also depends on interviews, competition and budget.";
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
}

/* ==========================================
   REMOTE / USD CONTRACT RAISE FIX
   ========================================== */
function askRaise() {
  if (!S || !S.job) {
    if (typeof hint === 'function') hint("You don't currently have a job to ask for a raise.");
    return;
  }

  // Calculate random raise between 5% and 15%
  const raisePercent = 0.05 + Math.random() * 0.10;

  // Check if current job is a remote contract paid in USD
  if (S.job.isRemoteUSD || S.job.currency === 'USD' || S.job.usdSalary) {
    const oldUsdSalary = S.job.usdSalary || S.job.salary;
    const newUsdSalary = Math.round(oldUsdSalary * (1 + raisePercent));
    const usdIncrease = newUsdSalary - oldUsdSalary;

    // 1. Store updated USD contract rate
    S.job.usdSalary = newUsdSalary;

    // 2. Convert to local currency using current exchange rate
    const rate = S.exchangeRate || (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1);
    S.job.salary = Math.round(newUsdSalary * rate);

    if (typeof log === 'function') {
      log(`Your raise was approved! USD Salary increased by $${usdIncrease.toLocaleString()} USD (+${(raisePercent * 100).toFixed(1)}%).`);
    }
  } else {
    // Standard local currency job
    const oldSalary = S.job.salary;
    const newSalary = Math.round(oldSalary * (1 + raisePercent));
    const increase = newSalary - oldSalary;

    S.job.salary = newSalary;
    if (typeof log === 'function') {
      log(`Your raise was approved! Salary increased by ${typeof money === 'function' ? money(increase) : increase} (+${(raisePercent * 100).toFixed(1)}%).`);
    }
  }

  // Re-render the UI
  if (typeof render === 'function') render();
}
