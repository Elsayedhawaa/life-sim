/* =====================================================================
   51. BPO JOBS — Direct Injection (bypasses companyListFor entirely)
   The wrapper chain for companyListFor is too deep for safe injection.
   This wraps viewCareer directly and injects BPO job cards into the
   rendered HTML. No interference with the existing job board.
   Load AFTER 50-school-bpo-medical-gpa.js and BEFORE 99-boot.js
   ===================================================================== */

function p51Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p51Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* BPO companies — real Egyptian BPO sector 2026 */
const P51_BPO_COMPANIES = [
  { name: 'Sutherland',                        lang: 'eng', tier: 'premium', factor: 1.15 },
  { name: 'Teleperformance',                   lang: 'eng', tier: 'standard', factor: 1.00 },
  { name: 'Concentrix',                        lang: 'eng', tier: 'standard', factor: 1.00 },
  { name: 'Vodafone VOIS',                     lang: 'eng', tier: 'premium', factor: 1.10 },
  { name: 'Raya CX',                           lang: 'eng', tier: 'standard', factor: 0.90 },
  { name: 'Xceed (Telecom Egypt)',             lang: 'eng', tier: 'standard', factor: 0.95 },
  { name: 'Alorica Egypt',                     lang: 'eng', tier: 'standard', factor: 0.92 },
  { name: 'Foundever Egypt',                   lang: 'eng', tier: 'standard', factor: 0.95 },
  { name: 'Teleperformance — German Desk',     lang: 'deu', tier: 'premium', factor: 1.45 },
  { name: 'Sutherland — French Desk',          lang: 'fra', tier: 'premium', factor: 1.40 },
  { name: 'Concentrix — German Team',          lang: 'deu', tier: 'premium', factor: 1.50 },
  { name: 'Xceed — French Team',               lang: 'fra', tier: 'premium', factor: 1.35 }
];

/* Base monthly salary for level 1 in EGP (2026 reference) */
const P51_BASE_MONTHLY_EGP = 12000;

function p51GetJobsForYear() {
  if (!S || S.country !== 'egy') return [];
  const year = gameYear();
  /* Deterministic per year so the same companies appear all year */
  const seed = year * 13 + 7;
  const jobCount = 3 + (seed % 3); /* 3, 4 or 5 */
  const jobs = [];
  for (let i = 0; i < jobCount; i++) {
    const c = P51_BPO_COMPANIES[(seed + i * 5) % P51_BPO_COMPANIES.length];
    const monthlyEGP = Math.round(P51_BASE_MONTHLY_EGP * c.factor * p51Idx());
    const annualEGP = monthlyEGP * 12;
    const annualInternal = annualEGP / p51Rate();

    /* Requirement text */
    const langReq = c.lang === 'eng' ? 'English 40%+' : (c.lang === 'deu' ? 'German 20%+ (or English 60%+)' : 'French 20%+ (or English 60%+)');
    const minEng = c.lang === 'eng' ? 40 : 60;
    const minSmarts = 20;

    jobs.push({
      id: 'p51_bpo_' + year + '_' + i,
      company: c.name,
      lang: c.lang,
      tier: c.tier,
      factor: c.factor,
      monthlyEGP: monthlyEGP,
      annualEGP: annualEGP,
      annualInternal: annualInternal,
      minEng: minEng,
      minSmarts: minSmarts,
      langReq: langReq,
      langField: c.lang === 'deu' ? 'german' : c.lang === 'fra' ? 'french' : null,
      medical: c.tier === 'premium',
      leave: 14,
      hours: 42,
      desc: 'Customer support for ' + (c.lang === 'eng' ? 'English' : c.lang === 'deu' ? 'German' : 'French') + ' accounts. Shift work (day/evening/night). Training provided. Attendance and quality metrics affect pay and promotion.'
    });
  }
  return jobs;
}

/* Check if player can apply */
function p51Eligibility(job) {
  if (!S || S.age < 18) return 'Must be 18 or older.';
  if (S.country !== 'egy') return 'This job is in Egypt.';
  /* Language check */
  if (job.lang === 'eng') {
    if ((S.eng || 0) < 40) return 'Needs English 40%+. You have ' + Math.round(S.eng || 0) + '%.';
  } else {
    const langField = job.langField;
    const langLevel = (S.lang && S.lang[langField]) || 0;
    const engLevel = S.eng || 0;
    if (langLevel < 20 && engLevel < 60) {
      return 'Needs ' + (job.lang === 'deu' ? 'German' : 'French') + ' 20%+ or English 60%+.';
    }
  }
  if ((S.smarts || 0) < job.minSmarts) return 'Needs ' + job.minSmarts + '% Smarts.';
  return '';
}

/* Apply handler */
function p51ApplyBPO(jobId) {
  if (!S || S.age < 18) return hint('You must be 18 to apply.');
  const jobs = p51GetJobsForYear();
  const job = jobs.find(j => j.id === jobId);
  if (!job) return hint('This job posting has closed.');

  const why = p51Eligibility(job);
  if (why) return hint(why);

  /* Application chance */
  const eng = S.eng || 0;
  const smarts = S.smarts || 0;
  const baseChance = 0.35
    + Math.min(0.25, (eng - job.minEng) / 200)
    + Math.min(0.15, (smarts - job.minSmarts) / 300);
  const chance = Math.max(0.15, Math.min(0.75, baseChance));

  if (Math.random() > chance) {
    log('❌ ' + job.company + ' rejected your application for Customer Service Agent.');
    if (typeof realismNotice === 'function') {
      realismNotice('BPO application rejected', 'You were not selected by ' + job.company + ' this time. Improve your English (or add German/French) and try again next year.');
    }
    return render();
  }

  /* Hired */
  if (S.job && typeof recordCareer === 'function') {
    try { recordCareer({ ...S.job }, true); } catch (e) {}
  }

  S.job = {
    trackId: 'bpo',
    level: 0,
    title: 'Customer Service Agent',
    salary: job.annualInternal,
    perf: 50,
    years: 0,
    companyId: job.id,
    company: job.company,
    companySize: job.tier === 'premium' ? 'large multinational BPO' : 'large regional BPO',
    companyFactor: job.factor,
    benefits: {
      medical: job.medical,
      social: true,
      bonus: 0.02,
      leave: job.leave,
      remote: 'On-site (call center)',
      hours: job.hours,
      pension: true,
      contract: 'Permanent' + (job.lang !== 'eng' ? ' · language premium' : '')
    },
    stress: 5,
    isBPO: true,
    _recordedYears: 0
  };
  S.retired = false;
  S.lastSalary = S.job.salary;
  S.vacationCap = Math.max(14, job.leave * 2);
  S.vacationDays = Math.min(S.vacationCap, job.leave);

  if (typeof recordCareer === 'function') {
    try { recordCareer(S.job, false); } catch (e) {}
  }

  fx({ happiness: 6 });
  log('✅ Hired at ' + job.company + ' as Customer Service Agent. Annual pay: ' + job.annualEGP.toLocaleString() + ' EGP.');

  if (typeof realismNotice === 'function') {
    realismNotice('Hired at BPO call center',
      job.company + ' — Customer Service Agent. Annual gross pay: ' + job.annualEGP.toLocaleString() + ' EGP (' + job.monthlyEGP.toLocaleString() + ' EGP/month). Shift work. Career path: Senior Agent → Team Leader → Operations Manager → Site Director.');
  }
  hint();
  render();
}
window.p51ApplyBPO = p51ApplyBPO;

/* ============ INJECT INTO CAREER TAB ============ */
const P51_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P51_viewCareerBefore();
  if (!S || S.country !== 'egy' || S.age < 18) return html;

  /* Remove any previous injection to avoid duplicates */
  html = html.replace(/<section class="card" id="p51-bpo-section"[\s\S]*?<\/section>/g, '');

  const jobs = p51GetJobsForYear();
  if (!jobs.length) return html;

  const currentJobIsBPO = S.job && S.job.isBPO;
  const cards = jobs.map(job => {
    const why = p51Eligibility(job);
    const isCurrent = currentJobIsBPO && S.job.company === job.company;
    let actionBtn;
    if (isCurrent) {
      actionBtn = '<p class="muted" style="font-size:.82rem;color:var(--mint)">✅ This is your current employer.</p>';
    } else if (why) {
      actionBtn = '<button class="btn" disabled>' + why + '</button>';
    } else {
      actionBtn = '<button class="btn" onclick="p51ApplyBPO(\'' + job.id + '\')">Apply to ' + job.company + '<small>Chance depends on your English and profile</small></button>';
    }

    return '<details style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<summary style="cursor:pointer"><b>' + job.company + '</b> · Customer Service Agent <span style="float:right;color:var(--mint);font-size:.82rem">' + job.annualEGP.toLocaleString() + ' EGP/yr</span></summary>' +
      '<p class="muted" style="font-size:.82rem;margin:6px 0">' + job.desc + '</p>' +
      '<div class="row"><span>Annual gross pay</span><b class="mono">' + job.annualEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Monthly (before tax)</span><b class="mono">' + job.monthlyEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Language requirement</span><b>' + job.langReq + '</b></div>' +
      '<div class="row"><span>Working hours</span><b>' + job.hours + ' hrs/week · shifts</b></div>' +
      '<div class="row"><span>Contract</span><b>Permanent' + (job.lang !== 'eng' ? ' · language premium' : '') + '</b></div>' +
      '<div class="row"><span>Healthcare</span><b>' + (job.medical ? 'Employer medical plan' : 'No employer medical listed') + '</b></div>' +
      '<div class="row"><span>Paid leave</span><b>' + job.leave + ' days/year</b></div>' +
      '<div class="row"><span>Career path</span><b>Agent → Senior Agent → Team Leader → Ops Manager → Site Director</b></div>' +
      actionBtn +
      '</details>';
  }).join('');

  const section = '<section class="card" id="p51-bpo-section">' +
    '<h3>📞 Call Center & BPO openings (Egypt 2026)</h3>' +
    '<p class="muted">Real BPO employers in Egypt. Shift work, English or European language accounts. Premium pay for German/French desks. Career path leads to Site Director over 5 levels. Open from age 18 — you can work while studying, but it affects your GPA.</p>' +
    cards +
    '</section>';

  /* Insert before the first existing "Openings in" section */
  const anchor = /<section class="card"><h3>Openings in /;
  if (anchor.test(html)) {
    return html.replace(anchor, section + '<section class="card"><h3>Openings in ');
  }
  /* Fallback: prepend to end */
  return html + section;
};

/* ============ RUN ON LOAD ============ */
if (S) {
  /* Nothing to do until render */
}
