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
  backdrop.innerHTML=`<div class="p24-modal"><div class="p24-pill">LIFELINE · LIFE UPDATE</div><h2>${p24Esc(title)}</h2><p>${p24Esc(message)}</p><button class="btn" id="p24-feedback-close" style="text-align:center;margin-top:16px">Continue</button></div>`;
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
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">FAM</span><div><h3 style="margin-bottom:2px">Family financial support</h3><p class="muted" style="font-size:.8rem">Choose one person, then decide how to help. Transfers happen immediately; monthly support is deducted as 12 months at the yearly turn.</p></div></div>
  <div class="p24-field"><label for="p24-support-member">Family member</label><select id="p24-support-member" onchange="p24UpdateSupportPreview()">${opts}</select></div>
  <div id="p24-support-current" class="row" style="margin-top:8px"><span>Current monthly support</span><b>${money((selected.allow||0)/12)}/month</b></div>
  <div class="p24-field" style="margin-top:12px"><label for="p24-support-once">One-time transfer · ${p24Esc(C().cur)}</label><input id="p24-support-once" type="number" min="1" step="any" placeholder="Enter amount"></div>
  <button class="btn" onclick="p24FamilySupport('once')">Send one-time support<small>The recipient responds, and your cash changes immediately.</small></button>
  <div class="p24-field" style="margin-top:14px"><label for="p24-support-monthly">Monthly allowance / support · ${p24Esc(C().cur)}</label><input id="p24-support-monthly" type="number" min="0" step="any" value="${Math.max(0,Math.round(selected.allowCurrency===S.country&&Number.isFinite(selected.allowLocal)?selected.allowLocal/12:(selected.allow||0)*rateNow()/12))}"></div>
  <div class="p24-filter-grid"><button class="btn" style="margin:0" onclick="p24FamilySupport('monthly')">Set monthly support<small>Charged yearly as 12 × the amount entered.</small></button><button class="btn" style="margin:0" onclick="p24FamilySupport('stop')">Stop recurring support<small>No future yearly deduction.</small></button></div>
  <p class="muted" style="font-size:.77rem;margin-top:10px">Support currently costs ${money(selected.allow||0)} per year for ${p24Esc(p24Relation(selected))}. The game uses yearly turns, so it settles the 12 monthly payments together.</p>
  ${S.country!==S.home&&parents().length?`<hr style="border-color:var(--line);margin:14px 0"><b>Need help from home?</b><p class="muted" style="font-size:.82rem;margin:5px 0 8px">Ask your parents for a transfer while living abroad. They can send less than requested or refuse if their own budget is tight.</p><div class="p24-field"><label for="abroad-parent-amount">Amount requested · USD equivalent</label><input id="abroad-parent-amount" type="number" min="1" placeholder="e.g. 200"></div><button class="btn" onclick="p24AskParentsAbroad()" ${(S.askAb===S.age||!parents().length)?'disabled':''}>Ask parents for help</button>`:''}
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
  html=html.replace(/<div class="acts acts3" style="margin-top:6px">[\s\S]*?onclick="famGive\([\s\S]*?<\/div>/g,'');
  html=html.replace(/<p class="muted" style="font-size:\.82rem;margin-top:8px">(?:Allowance|Regular support) \([\s\S]*?<\/div>/g,'');
  return html+p24FamilySupportCard();
};

/* Home help belongs with property / household costs, never inside Relationships.
   Prices are moved closer to a real recurring service budget and are kept in one place. */
p20HomeHelpCard=function(){
  if(!S||S.age<18)return '';
  const current=S.homeHelp||'none';
  const choices=[['none','No paid home help',0],['cleaner','Cleaner twice a month',p20LocalCost(1400)],['maid','Regular household helper',p20LocalCost(6500)]];
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">HOME</span><div><h3 style="margin-bottom:2px">Household help</h3><p class="muted" style="font-size:.8rem">Optional service for your own home. Costs vary by city and price level; renewing it competes with savings, rent and other bills.</p></div></div><p class="muted" style="font-size:.85rem;margin-bottom:8px">Current arrangement: <b>${current==='none'?'None':current==='cleaner'?'Cleaner twice a month':'Regular household helper'}</b></p>${choices.map(([id,label,cost])=>`<button class="btn" ${id!=='none'&&current===id?'disabled':''} ${id!=='none'&&S.wealth<cost?'disabled':''} onclick="p20SetHomeHelp('${id}',${cost})">${label}${cost?` · ${money(cost)}/year`:''}<small>${id==='none'?'Cancel after the prepaid period; no new annual bill.':id==='cleaner'?'Occasional cleaning; you still handle most chores.':'More frequent household assistance; a large recurring expense.'}</small></button>`).join('')}</section>`;
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
    el.style.display=ok?'':'none';if(ok)visible++;
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
    return `<details class="p24-job-card p17-posting" data-sponsor="${sponsor}" data-type="${type}" data-search="${p24Esc(search)}"><summary><span class="p24-brand">${p24Esc(brand)}</span><span style="vertical-align:middle"><b>${p24Esc(title)}</b><small style="display:block;color:var(--muted);margin-top:2px">${p24Esc(p.name||'Employer')} · ${p24Esc(mode)}</small></span>${sponsor==='yes'?'<span class="badge badge-mint" style="float:right">May sponsor</span>':sponsor==='no'?'<span class="badge badge-amber" style="float:right">No sponsorship</span>':''}</summary>
    ${PR(p.desc||'Role duties depend on the employer and team.')}
    <div class="p24-filter-grid"><div><span class="p24-muted-label">Estimated gross pay</span><div class="p24-value">${p.isRemoteUSD?usd(pay):salary}</div><span class="muted" style="font-size:.72rem">${payBasis} · annual estimate</span></div><div><span class="p24-muted-label">Experience</span><div class="p24-value">${minExp===0?'Entry level':`${minExp}+ years`}</div><span class="muted" style="font-size:.72rem">Relevant experience preferred</span></div></div>
    ${ROW('Education',education)}${ROW('Hours & contract',`${p.hours||40} hrs/week · ${p.contract||'Terms vary'}`)}${ROW('Healthcare',p.medical?'Employer medical plan listed':'No employer medical plan listed')}${ROW('Pension / social insurance',p.social?'Contribution or statutory plan listed':'No employer contribution listed')}${ROW('Paid annual leave',`${p.leave||14} days/year`)}${ROW('Target bonus',p.bonus?`${Math.round(p.bonus*100)}% · not guaranteed`:'Not listed')}${ROW('Work arrangement',mode)}${S.country!==S.home?ROW('Sponsorship',p.sponsorship?'Employer may consider sponsorship; government approval is separate':'This vacancy does not offer sponsorship'):''}${blockReason?PR(`Not currently available: ${blockReason}`):''}<button class="btn" onclick="applyCompany('${p.id}')" ${blockReason||used>=4?'disabled':''}>${blockReason?'Requirements not met':used>=4?'Application limit reached':`Apply to ${p24Esc(p.name||'employer')}`}</button></details>`;
  });
  const careerCards=cards.join('');
  const filter=SEC('Find work',PR(`Employers shown here are generated for ${C().n}; these are fictional game vacancies, not live listings. You have ${Math.max(0,4-used)} application(s) left this year. Senior/lead titles require a relevant track record, and company sponsorship is not a visa guarantee.`)+`<div class="p24-filter-grid"><div><label for="p24-career-search">Search by role / employer</label><input id="p24-career-search" type="search" placeholder="e.g. accountant, analyst" oninput="p24CareerFilter()"></div><div><label for="p24-career-sponsor">Sponsorship</label><select id="p24-career-sponsor" onchange="p24CareerFilter()"><option value="all">All vacancies</option><option value="yes">May sponsor</option><option value="no">No sponsorship</option><option value="na">Not applicable / home country</option></select></div><div><label for="p24-career-type">Role type</label><select id="p24-career-type" onchange="p24CareerFilter()"><option value="all">All role types</option><option value="field">Related to my degree</option><option value="entry">Entry-level</option><option value="experienced">Experienced / senior</option><option value="remote">Remote / hybrid</option></select></div><div style="display:flex;align-items:end"><span id="p24-career-count" class="muted" style="font-size:.8rem">${list.length} openings</span></div></div>${careerCards}`);
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
  const loc=`<section class="card"><div class="p24-topline"><span class="p24-brand">${p24Esc(country.f||'LOC')}</span><div><h3 style="margin-bottom:2px">Current location</h3><p class="muted" style="font-size:.82rem">${p24Esc(country.n)}${S.country!==S.home?` · Home country: ${p24Esc(home.n)}`:''}</p></div></div><p class="muted" style="font-size:.82rem">Local prices, available employers and immigration options depend on where you live. Figures are estimates.</p></section>`;
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
  el.innerHTML=`<div class="p24-topline"><span class="p24-brand">EST</span><div><span class="p24-muted-label">Estimated total trip budget</span><div class="p24-value">${money(q.total)}</div><span class="muted" style="font-size:.72rem">Planning estimate · not live fares</span></div></div><div class="p24-filter-grid"><div><span class="p24-muted-label">${q.international?'Return airfare · '+q.classKey:'Intercity / local transport'}</span><div class="p24-value">${money(q.airfare||q.transport)}</div></div><div><span class="p24-muted-label">Accommodation · ${p24Esc(stayName)}</span><div class="p24-value">${money(q.hotel)}</div></div><div><span class="p24-muted-label">Food / meals</span><b>${money(q.spend)}</b></div><div><span class="p24-muted-label">Activities</span><b>${money(q.activities)}</b></div><div><span class="p24-muted-label">Shopping / clothes</span><b>${money(q.shopping||0)}</b></div><div><span class="p24-muted-label">Gift / family contribution</span><b>${money(q.gifts||0)}</b></div></div>${q.international?ROW('Transport at destination',money(q.destinationTransport||0)):ROW('Transport while there',money(q.destinationTransport||0))}${ROW('Trip length',people)}${ROW('Annual leave requested',`${q.leaveDays==null?q.days:q.leaveDays} day(s)`)}${ROW('Travel season',seasonName)}${PR(`Food, local transport and gifts are entered in ${destCurrency}; totals are converted to your current game currency. Staying with a host may remove lodging cost. Return fares and accommodation are estimates, not live bookable prices. A manager can refuse leave, and travelling without valid status may create re-entry problems.`)}`;
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
    <details style="margin-top:12px"><summary>Advanced trip options</summary><div class="p24-trip-main" style="margin-top:10px">
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
    </div><details style="margin-top:8px"><summary>Custom city / country</summary><div class="p24-field" style="margin-top:10px"><label for="p18-trip-city">City / destination name</label><input id="p18-trip-city" type="text" maxlength="70" placeholder="e.g. Valencia, Madrid, Kyoto" oninput="p12RefreshTripQuote()"></div><div class="p24-field"><label for="p18-trip-country">Destination country</label><select id="p18-trip-country" onchange="p18TripDestinationChanged()">${countryOptions}</select></div><p class="muted">Custom routes use an estimated country-pair fare, not live bookable fares.</p></details></details>
    <div id="p12-trip-estimate" class="card" style="margin-top:12px"><span class="p24-muted-label">Estimated trip budget</span><p class="muted">Calculating estimate…</p></div><div class="p24-filter-grid"><button class="btn" style="margin:0" onclick="p12RefreshTripQuote()">Refresh estimate</button><button class="btn" style="margin:0" onclick="p12BookTrip('${S.funeralNotice?'funeral':'holiday'}')">${S.funeralNotice?'Review funeral trip':'Request leave & book'}</button></div>${S.job?PR(`Current employer: ${S.job.company||'Employer'} · ${Math.floor(S.vacationDays||0)} paid-leave day(s) available. Your manager may refuse leave.`):PR(S.mast?'You are studying; plan around exams and student-status conditions.':'You have no current job, so there is no employer leave approval or salary loss.')}`);
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
  return `<section class="card"><div class="p24-topline"><span class="p24-brand">CITY</span><div><h3 style="margin-bottom:2px">City / local market</h3><p class="muted" style="font-size:.8rem">Changes local rent, properties and selected services. Job salaries remain country-based estimates.</p></div></div><select id="p20-city" onchange="p24SetCity(this.value)" style="width:100%">${opts.map(x=>`<option value="${x[1]}" ${x[1]===S.cityId?'selected':''}>${p24Esc(x[0])}</option>`).join('')}</select></section>`;
};
function p24SetCity(id){
  const active=activeTab,x=p20CityOptions().find(a=>a[1]===id);if(!x)return;
  S.cityId=id;S.cityName=x[0];S.cityCostMultiplier=x[2];S.propertyMarket=[];
  log(`You chose to live in ${x[0]}. Local rent, property listings and selected service costs now use this city level.`);
  activeTab=active;render();p24Popup('City updated',`${x[0]} is now your selected local market. Rent, property listings and selected household / care services use this cost level; most wages remain country-based.`);
}


