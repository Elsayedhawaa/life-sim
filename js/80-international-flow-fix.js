/* =====================================================================
   80. INTERNATIONAL UNIVERSITY FLOW + FAMILY BUSINESS PROTECTION
   - Working modal for international university applications
   - Clean rebuild of Education tab for IGCSE/IB/American students
   - Family business can never fire you (fixes "released from family business")
   - Aggressive dedup of status cards, passport, TOEFL, languages
   Load AFTER 79-emergency-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p80Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p80Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

function p80Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p80) o.p80 = {};
  if (typeof o.p80.modalOpen !== 'boolean') o.p80.modalOpen = false;
}
const P80_migrate = migrate;
migrate = function (o) { const r = P80_migrate(o); p80Init(r); return r; };
const P80_newGame = newGame;
newGame = function () { P80_newGame.apply(this, arguments); p80Init(S); };

/* =================================================================
   1. FAMILY BUSINESS NEVER FIRES
   ================================================================= */
const P80_packYearBefore = packYear;
packYear = function () {
  if (!S) return P80_packYearBefore.apply(this, arguments);

  const isFamilyBiz = !!(S.job && S.job.isFamilyBusiness);
  const savedJob = isFamilyBiz ? {
    trackId: S.job.trackId,
    level: S.job.level,
    title: S.job.title,
    salary: S.job.salary,
    perf: Math.max(60, S.job.perf || 60),
    years: (S.job.years || 0),
    company: S.job.company,
    companySize: S.job.companySize,
    companyFactor: S.job.companyFactor,
    benefits: S.job.benefits,
    stress: S.job.stress,
    isFamilyBusiness: true
  } : null;

  const result = P80_packYearBefore.apply(this, arguments);

  /* If family business job was terminated by base layoff logic, restore it */
  if (isFamilyBiz && savedJob && !S.job) {
    S.job = savedJob;
    S.job.years = (S.job.years || 0) + 1;
    log('ℹ️ The family business continues — you remain employed as ' + S.job.title + '.');
  }
  return result;
};

/* =================================================================
   2. INTERNATIONAL SYSTEM DETECTION
   ================================================================= */
function p80IsInternational() {
  if (!S || !S.p78) return false;
  return ['igcse', 'american', 'ib'].indexOf(S.p78.educationSystem) !== -1;
}

/* =================================================================
   3. WORKING INTERNATIONAL UNIVERSITY MODAL
   ================================================================= */
const P80_INT_UNIS = {
  gbr: [
    { n: 'University of Oxford',          tier: 1, req: 3.7, ielts: 7.5, tuition: 28000 },
    { n: 'University of Cambridge',       tier: 1, req: 3.7, ielts: 7.5, tuition: 28000 },
    { n: 'Imperial College London',       tier: 1, req: 3.5, ielts: 7.0, tuition: 32000 },
    { n: 'London School of Economics',    tier: 1, req: 3.6, ielts: 7.0, tuition: 30000 },
    { n: 'University College London',     tier: 1, req: 3.4, ielts: 7.0, tuition: 28000 },
    { n: 'King\'s College London',        tier: 2, req: 3.2, ielts: 6.5, tuition: 26000 },
    { n: 'University of Edinburgh',       tier: 2, req: 3.2, ielts: 6.5, tuition: 24000 },
    { n: 'University of Manchester',      tier: 2, req: 3.0, ielts: 6.5, tuition: 22000 },
    { n: 'University of Warwick',         tier: 2, req: 3.1, ielts: 6.5, tuition: 24000 },
    { n: 'University of Bristol',         tier: 2, req: 3.0, ielts: 6.5, tuition: 24000 }
  ],
  usa: [
    { n: 'MIT',                           tier: 1, req: 3.8, ielts: 7.5, tuition: 55000 },
    { n: 'Harvard University',            tier: 1, req: 3.8, ielts: 7.5, tuition: 55000 },
    { n: 'Stanford University',           tier: 1, req: 3.8, ielts: 7.5, tuition: 55000 },
    { n: 'Yale University',               tier: 1, req: 3.7, ielts: 7.0, tuition: 52000 },
    { n: 'Princeton University',          tier: 1, req: 3.7, ielts: 7.0, tuition: 52000 },
    { n: 'Columbia University',           tier: 1, req: 3.6, ielts: 7.0, tuition: 55000 },
    { n: 'UC Berkeley',                   tier: 1, req: 3.5, ielts: 7.0, tuition: 44000 },
    { n: 'UCLA',                          tier: 2, req: 3.4, ielts: 7.0, tuition: 42000 },
    { n: 'New York University',           tier: 2, req: 3.3, ielts: 7.0, tuition: 50000 }
  ],
  deu: [
    { n: 'Technical University of Munich', tier: 1, req: 3.5, ielts: 6.5, tuition: 0 },
    { n: 'Heidelberg University',          tier: 1, req: 3.4, ielts: 6.5, tuition: 0 },
    { n: 'RWTH Aachen University',         tier: 1, req: 3.3, ielts: 6.5, tuition: 0 },
    { n: 'Free University of Berlin',      tier: 2, req: 3.0, ielts: 6.0, tuition: 0 },
    { n: 'Humboldt University of Berlin',  tier: 2, req: 3.0, ielts: 6.0, tuition: 0 }
  ],
  can: [
    { n: 'University of Toronto',          tier: 1, req: 3.5, ielts: 6.5, tuition: 35000 },
    { n: 'McGill University',              tier: 1, req: 3.4, ielts: 6.5, tuition: 25000 },
    { n: 'University of British Columbia', tier: 1, req: 3.4, ielts: 6.5, tuition: 32000 },
    { n: 'University of Waterloo',         tier: 1, req: 3.4, ielts: 6.5, tuition: 28000 }
  ],
  fra: [
    { n: 'Sorbonne University',            tier: 1, req: 3.4, ielts: 6.5, tuition: 3000 },
    { n: 'Sciences Po Paris',              tier: 1, req: 3.5, ielts: 7.0, tuition: 14000 },
    { n: 'HEC Paris',                      tier: 1, req: 3.6, ielts: 7.0, tuition: 22000 },
    { n: 'École Polytechnique',            tier: 1, req: 3.6, ielts: 6.5, tuition: 8000 }
  ],
  nld: [
    { n: 'Delft University of Technology', tier: 1, req: 3.4, ielts: 6.5, tuition: 18000 },
    { n: 'University of Amsterdam',        tier: 1, req: 3.3, ielts: 6.5, tuition: 16000 },
    { n: 'Utrecht University',             tier: 1, req: 3.2, ielts: 6.5, tuition: 15000 }
  ],
  aus: [
    { n: 'University of Melbourne',        tier: 1, req: 3.4, ielts: 6.5, tuition: 32000 },
    { n: 'University of Sydney',           tier: 1, req: 3.3, ielts: 6.5, tuition: 34000 },
    { n: 'Australian National University', tier: 1, req: 3.3, ielts: 6.5, tuition: 30000 }
  ]
};

const P80_INT_SCHOLARSHIPS = {
  gbr: [
    { name: 'Chevening Scholarship',       cover: 1.0, reqGpa: 3.5, reqIelts: 7.0, chance: 0.18 },
    { name: 'Commonwealth Scholarship',    cover: 1.0, reqGpa: 3.4, reqIelts: 6.5, chance: 0.15 },
    { name: 'University merit scholarship', cover: 0.5, reqGpa: 3.5, reqIelts: 6.5, chance: 0.35 }
  ],
  usa: [
    { name: 'Fulbright Foreign Student Program', cover: 1.0, reqGpa: 3.6, reqIelts: 7.0, chance: 0.12 },
    { name: 'University full-ride',         cover: 1.0, reqGpa: 3.8, reqIelts: 7.5, chance: 0.08 },
    { name: 'University partial scholarship', cover: 0.5, reqGpa: 3.5, reqIelts: 7.0, chance: 0.30 }
  ],
  deu: [
    { name: 'DAAD Scholarship',             cover: 1.0, reqGpa: 3.4, reqIelts: 6.5, chance: 0.20 },
    { name: 'Erasmus+ Scholarship',         cover: 0.8, reqGpa: 3.2, reqIelts: 6.5, chance: 0.25 }
  ],
  can: [{ name: 'University entrance scholarship', cover: 0.4, reqGpa: 3.3, reqIelts: 6.5, chance: 0.35 }],
  fra: [{ name: 'Eiffel Excellence Scholarship', cover: 1.0, reqGpa: 3.5, reqIelts: 6.5, chance: 0.15 }],
  nld: [{ name: 'Orange Tulip Scholarship', cover: 0.6, reqGpa: 3.3, reqIelts: 6.5, chance: 0.28 }],
  aus: [{ name: 'Australia Awards',          cover: 1.0, reqGpa: 3.4, reqIelts: 6.5, chance: 0.15 }]
};

function p80Year1Cost(countryCode, tuitionUSD) {
  const living = { gbr: 15000, usa: 18000, deu: 11500, can: 16000, fra: 10500, nld: 12500, aus: 20000 }[countryCode] || 15000;
  const blocked = { deu: 11208, can: 14000 }[countryCode] || 0;
  const visa = { gbr: 490, usa: 185, deu: 75, can: 150, fra: 100, nld: 210, aus: 710 }[countryCode] || 200;
  const flight = { gbr: 650, usa: 1100, deu: 590, can: 1000, fra: 620, nld: 640, aus: 1350 }[countryCode] || 700;
  const setup = 1000;
  const total = (tuitionUSD || 0) + living + blocked + visa + flight + setup;
  return Math.round(total * 52.7 * p80Idx());
}

function p80ShowUniModal(country) {
  p80Init(S);
  if (!S) return;
  const rate = p80Rate();
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  const bankEGP = Math.round(S.wealth * rate);

  const countries = Object.keys(P80_INT_UNIS);
  const active = country || S.p80?.modalCountry || 'gbr';
  S.p80 = S.p80 || {};
  S.p80.modalCountry = active;

  const unis = P80_INT_UNIS[active] || [];
  const schols = P80_INT_SCHOLARSHIPS[active] || [];
  const c = COUNTRIES[active] || {};

  const countryTabs = countries.map(function (code) {
    const cc = COUNTRIES[code] || {};
    const sel = code === active;
    return '<button class="btn ' + (sel ? 'sel' : '') + '" style="margin:0;padding:6px;font-size:.72rem;flex:1;min-width:70px" onclick="p80ShowUniModal(\'' + code + '\')">' +
      (cc.f || '') + ' ' + (cc.n || code) + '</button>';
  }).join('');

  const uniCards = unis.map(function (uni, i) {
    const tuitionEGP = Math.round(uni.tuition * 52.7 * p80Idx());
    const canApply = gpa >= uni.req && ielts >= uni.ielts;
    const applied = (S.p79 && Array.isArray(S.p79.appliedUnis)) && S.p79.appliedUnis.some(function (a) { return a.uni === uni.n; });

    return '<div style="margin-top:8px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<b style="font-size:.9rem">' + uni.n + '</b> <span class="muted" style="font-size:.72rem">· Tier ' + uni.tier + '</span>' +
      '<div class="row" style="border:0;padding:2px 0;font-size:.76rem"><span>Tuition/year</span><b class="mono">' + (uni.tuition === 0 ? 'FREE' : 'E£' + tuitionEGP.toLocaleString()) + '</b></div>' +
      '<div class="row" style="border:0;padding:2px 0;font-size:.76rem"><span>Needs</span><b>GPA ' + uni.req + '+ · IELTS ' + uni.ielts + '+</b></div>' +
      (applied
        ? '<p style="color:var(--amber);font-size:.76rem;margin-top:6px">⏳ Application submitted</p>'
        : canApply
          ? '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin-top:6px">' +
            '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80Apply(\'' + active + '\',' + i + ',\'self\')">Self</button>' +
            '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80Apply(\'' + active + '\',' + i + ',\'scholarship\')">Scholarship</button>' +
            '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80Apply(\'' + active + '\',' + i + ',\'parents\')">Family</button>' +
            '</div>'
          : '<p style="color:var(--rose);font-size:.72rem;margin-top:5px">' +
            (gpa < uni.req ? '❌ GPA ' + gpa.toFixed(2) + ' < ' + uni.req + '. ' : '') +
            (ielts < uni.ielts ? '❌ IELTS ' + (ielts || 'none') + ' < ' + uni.ielts + '.' : '') +
            '</p>') +
      '</div>';
  }).join('');

  const scholsHtml = schols.length ? '<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line)">' +
    '<b style="font-size:.82rem;color:var(--cyan)">Scholarships for ' + (c.n || active) + '</b>' +
    schols.map(function (s) {
      const ok = gpa >= s.reqGpa && ielts >= s.reqIelts;
      return '<div style="margin-top:6px;padding:8px;border-left:3px solid ' + (ok ? 'var(--mint)' : 'var(--line)') + ';background:rgba(255,255,255,.02);border-radius:4px">' +
        '<b style="font-size:.8rem">' + s.name + '</b> <span style="color:var(--mint);font-size:.72rem">· ' + Math.round(s.cover * 100) + '%</span>' +
        '<div class="muted" style="font-size:.72rem;margin-top:2px">GPA ' + s.reqGpa + '+ · IELTS ' + s.reqIelts + '+</div>' +
        (ok ? '<div style="color:var(--mint);font-size:.72rem;margin-top:3px">✓ You qualify</div>' : '') +
        '</div>';
    }).join('') + '</div>' : '';

  const existing = document.getElementById('p80-uni-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'p80-uni-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
  modal.innerHTML = '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
    '<b style="font-size:1rem">🌍 Apply to international universities</b>' +
    '<button class="menu-btn" onclick="document.getElementById(\'p80-uni-modal\').remove()">✕</button>' +
    '</div>' +
    '<p class="muted" style="font-size:.8rem;margin-top:8px">Your GPA: <b>' + gpa.toFixed(2) + '</b> · IELTS: <b>' + (ielts || 'none') + '</b> · Bank: <b>E£' + bankEGP.toLocaleString() + '</b></p>' +
    '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">' + countryTabs + '</div>' +
    '<div style="margin-top:12px">' + uniCards + '</div>' +
    scholsHtml +
    '</div>';
  document.body.appendChild(modal);
}
window.p80ShowUniModal = p80ShowUniModal;

function p80Apply(country, index, funding) {
  if (!S) return;
  const unis = P80_INT_UNIS[country] || [];
  const uni = unis[index];
  if (!uni) return hint('University not found.');

  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  if (gpa < uni.req) return hint('GPA too low: needs ' + uni.req + '+');
  if (ielts < uni.ielts) return hint('IELTS too low: needs ' + uni.ielts + '+');

  const feeEGP = Math.round(100 * 52.7 * p80Idx());
  const internal = feeEGP / p80Rate();
  if (S.wealth < internal) return hint('Application fee: E£' + feeEGP.toLocaleString());

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;

  p79Init(S);
  S.p79.appliedUnis = S.p79.appliedUnis || [];
  S.p79.appliedUnis.push({
    uni: uni.n, country: country, level: 'bachelor',
    funding: funding, appliedYear: gameYear(),
    appliedAbs: S.pacingAbsoluteMonth || 0,
    resolved: false, result: null,
    tuitionUSD: uni.tuition, reqGpa: uni.req, reqIelts: uni.ielts
  });

  log('📤 Applied to ' + uni.n + ' · ' + funding + '. Fee: E£' + feeEGP.toLocaleString() + '.');
  realismNotice('Application submitted', uni.n + ' — ' + funding + '. Decision expected soon.');

  /* Immediate resolution for gameplay */
  setTimeout(function () { p80Resolve(uni.n); }, 400);
  hint(); render();
}
window.p80Apply = p80Apply;

function p80Resolve(uniName) {
  p79Init(S);
  const app = (S.p79.appliedUnis || []).find(function (a) { return a.uni === uniName && !a.resolved; });
  if (!app) return;

  const gpa = (S.gpa && S.gpaN) ? S.gpa : 2.5;
  const ielts = S.ielts || 0;
  const gpaDelta = gpa - (app.reqGpa || 3.0);
  const ieltsDelta = ielts - (app.reqIelts || 6.5);
  let chance = 0.35 + gpaDelta * 0.4 + ieltsDelta * 0.08;
  if ((app.reqGpa || 3.0) >= 3.5) chance -= 0.15;
  chance = Math.max(0.05, Math.min(0.9, chance));

  if (Math.random() > chance) {
    app.resolved = true;
    app.result = 'rejected';
    log('❌ ' + uniName + ' rejected your application.');
    realismNotice('Application rejected', uniName + ' did not admit you.');
    hint(); render();
    return;
  }

  /* Funding */
  if (app.funding === 'self') {
    const year1 = p80Year1Cost(app.country, app.tuitionUSD);
    const bank = Math.round(S.wealth * p80Rate());
    if (bank < year1) {
      app.resolved = true;
      app.result = 'admitted-no-funds';
      log('⚠️ Admitted to ' + uniName + ' but bank is E£' + bank.toLocaleString() + ' and year 1 costs E£' + year1.toLocaleString() + '.');
    } else {
      app.resolved = true;
      app.result = 'admitted-self';
      log('✅ Admitted to ' + uniName + '! Self-funded.');
    }
  } else if (app.funding === 'parents') {
    const tier = (S.p76 && S.p76.wealthLevel) || 0;
    const agreeChance = tier >= 4 ? 0.92 : tier >= 3 ? 0.55 : 0.15;
    if (Math.random() < agreeChance) {
      app.resolved = true;
      app.result = 'admitted-parents';
      log('✅ Admitted to ' + uniName + '! Parents agreed to fund.');
    } else {
      app.resolved = true;
      app.result = 'admitted-no-funds';
      log('⚠️ Admitted to ' + uniName + ' but parents declined to fund.');
    }
  } else {
    const schols = P80_INT_SCHOLARSHIPS[app.country] || [];
    const target = schols.find(function (s) { return gpa >= s.reqGpa && ielts >= s.reqIelts; });
    if (target && Math.random() < target.chance + gpaDelta * 0.05) {
      app.resolved = true;
      app.result = 'admitted-scholarship';
      app.scholarship = target.name;
      app.cover = target.cover;
      log('🏆 Admitted to ' + uniName + ' with ' + target.name + ' (' + Math.round(target.cover * 100) + '%)!');
      realismNotice('Admitted with scholarship', target.name + ' at ' + uniName + '.');
    } else {
      app.resolved = true;
      app.result = 'admitted-no-funds';
      log('⚠️ Admitted to ' + uniName + ' but no scholarship was awarded.');
    }
  }
  save(); hint(); render();
}
window.p80Resolve = p80Resolve;

/* =================================================================
   4. CLEAN REBUILD OF EDUCATION TAB FOR INTERNATIONAL SYSTEM
   ================================================================= */
const P80_viewSchoolBefore = viewSchool;
viewSchool = function () {
  if (!S) return P80_viewSchoolBefore.apply(this, arguments);

  /* Only take over when: international system, ready for university, no uni yet */
  if (p80IsInternational() && !S.uni && !S.degree && S.diploma && S.age >= 15) {
    return p80BuildCleanIntView();
  }

  /* Otherwise, apply dedup + button fix on top of the normal view */
  let html = P80_viewSchoolBefore.apply(this, arguments);
  html = p80DedupEverything(html);
  html = p80FixButtons(html);
  return html;
};

function p80DedupEverything(html) {
  if (!html) return html;

  /* Aggressive dedup: keep FIRST occurrence of any repeated <section> with same H3 title */
  const h3Pattern = /<section class="card"[^>]*>\s*<h3>([^<]+)<\/h3>/g;
  const seenTitles = {};
  let match;
  const sections = [];
  let lastIndex = 0;

  /* Collect all section starts with their titles */
  const starts = [];
  let m;
  const h3re = /<section class="card"[^>]*>\s*<h3>([^<]+)<\/h3>/g;
  while ((m = h3re.exec(html)) !== null) {
    starts.push({ idx: m.index, title: m[1].trim() });
  }

  /* For each pair of duplicates, remove the later one */
  const titles = {};
  starts.forEach(function (s) {
    if (titles[s.title] == null) {
      titles[s.title] = s.idx;
    } else {
      /* Find the section end for this occurrence */
      const start = s.idx;
      let end = html.indexOf('</section>', start);
      if (end === -1) return;
      end += '</section>'.length;
      /* Check if already removed (position moved) */
      if (start < html.length && html.slice(start, start + 20).indexOf('<section') === 0) {
        html = html.slice(0, start) + html.slice(end);
      }
    }
  });

  /* Also dedup by unique heading strings */
  const uniqueHeadings = [
    'EDUCATION STATUS',
    '🛂 Your passport and your options',
    '🇩🇪 German',
    '🇳🇱 Dutch',
    '📝 IELTS / TOEFL',
    '🎓 Your education'
  ];

  uniqueHeadings.forEach(function (heading) {
    let count = 0;
    const re = new RegExp('<section class="card"[^>]*>\\s*<h3>[^<]*' + heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?<\\/section>', 'g');
    html = html.replace(re, function (match) {
      count++;
      return count === 1 ? match : '';
    });
  });

  /* Special handling for EDUCATION STATUS which is inside a div, not h3 */
  const statusMatches = html.match(/<section class="card"[^>]*>\s*<div[^>]*>EDUCATION STATUS[\s\S]*?<\/section>/g);
  if (statusMatches && statusMatches.length > 1) {
    let count = 0;
    html = html.replace(/<section class="card"[^>]*>\s*<div[^>]*>EDUCATION STATUS[\s\S]*?<\/section>/g, function (match) {
      count++;
      return count === 1 ? match : '';
    });
  }

  return html;
}

function p80FixButtons(html) {
  if (!html) return html;

  /* Replace dead "Apply to universities" button */
  html = html.replace(
    /<button[^>]*onclick="activeTab=&#39;school&#39;;render\(\)"[^>]*>🌍 Apply to universities \(international system\)<\/button>/g,
    '<button class="btn" style="text-align:left" onclick="p80ShowUniModal()">🌍 Apply to universities (international system)</button>'
  );
  html = html.replace(
    /<button[^>]*onclick="activeTab='school';render\(\)"[^>]*>🌍 Apply to universities \(international system\)<\/button>/g,
    '<button class="btn" style="text-align:left" onclick="p80ShowUniModal()">🌍 Apply to universities (international system)</button>'
  );

  return html;
}

/* =================================================================
   5. CLEAN INTERNATIONAL VIEW (used when player is on IGCSE/IB/American + ready for uni)
   ================================================================= */
function p80BuildCleanIntView() {
  p80Init(S);
  const rate = p80Rate();
  const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
  const gpaColor = gpa >= 3.7 ? 'var(--mint)' : gpa >= 3.0 ? 'var(--cyan)' : gpa >= 2.0 ? 'var(--amber)' : 'var(--rose)';
  const bankEGP = Math.round(S.wealth * rate);
  const sysLabel = (typeof p78EducationSystemLabel === 'function')
    ? p78EducationSystemLabel(S.p78.educationSystem)
    : S.p78.educationSystem;

  let html = '';

  /* Status card */
  html += '<section class="card" style="padding:14px;border-left:3px solid var(--violet)">' +
    '<div class="muted" style="font-size:.72rem;letter-spacing:.06em;font-weight:700">EDUCATION STATUS</div>' +
    '<div style="font-size:1.15rem;font-weight:700;margin-top:4px">🎓 Ready for university</div>' +
    '<div class="muted" style="font-size:.82rem;margin-top:2px">' + sysLabel + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">' +
    '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
    '<div class="muted" style="font-size:.68rem;text-transform:uppercase">GPA</div>' +
    '<div class="mono" style="font-size:1.05rem;font-weight:700;margin-top:3px;color:' + gpaColor + '">' + gpa.toFixed(2) + '</div>' +
    '</div>' +
    '<div style="padding:8px;background:rgba(255,255,255,.03);border-radius:6px">' +
    '<div class="muted" style="font-size:.68rem;text-transform:uppercase">IELTS</div>' +
    '<div class="mono" style="font-size:1.05rem;font-weight:700;margin-top:3px">' + (S.ielts || '—') + '</div>' +
    '</div>' +
    '</div>' +
    '</section>';

  /* Action buttons */
  html += '<section class="card"><h3>✅ What to do next</h3>' +
    '<button class="btn" style="text-align:left;background:var(--violet);color:#fff;font-weight:700" onclick="p80ShowUniModal()">' +
    '🌍 Apply to international universities' +
    '<small>Choose country, then apply to specific universities</small>' +
    '</button>' +
    (S.age >= 16 && !S.ielts ? '<button class="btn" style="text-align:left" onclick="takeIelts()">📝 Take IELTS first (' + (S.eng >= 75 ? 'recommended' : 'consider improving English first') + ')</button>' : '') +
    '</section>';

  /* Applications in progress */
  const apps = (S.p79 && Array.isArray(S.p79.appliedUnis)) ? S.p79.appliedUnis.filter(function (a) { return !a.resolved; }) : [];
  if (apps.length) {
    html += '<section class="card" style="border-color:var(--amber)"><h3>📤 Applications in progress</h3>' +
      apps.map(function (a) {
        const cc = COUNTRIES[a.country] || {};
        return '<div class="row" style="padding:5px 0;font-size:.82rem"><span>' + (cc.f || '') + ' ' + a.uni + '</span><b>' + a.funding + '</b></div>';
      }).join('') +
      '</section>';
  }

  /* Resolved applications */
  const doneApps = (S.p79 && Array.isArray(S.p79.appliedUnis)) ? S.p79.appliedUnis.filter(function (a) { return a.resolved; }) : [];
  if (doneApps.length) {
    html += '<section class="card"><h3>📋 Recent application results</h3>' +
      doneApps.slice(-5).reverse().map(function (a) {
        const cc = COUNTRIES[a.country] || {};
        const result = a.result === 'admitted-scholarship' ? '🏆 Admitted · ' + (a.scholarship || 'Scholarship')
          : a.result === 'admitted-self' ? '✅ Admitted · Self-funded'
          : a.result === 'admitted-parents' ? '✅ Admitted · Family funded'
          : a.result === 'admitted-no-funds' ? '⚠️ Admitted but no funding'
          : '❌ Rejected';
        return '<div class="row" style="padding:5px 0;font-size:.82rem"><span>' + (cc.f || '') + ' ' + a.uni + '</span><b>' + result + '</b></div>';
      }).join('') +
      '</section>';
  }

  /* English language section */
  html += '<section class="card"><h3>🇬🇧 English language — ' + (S.eng || 0) + '%</h3>' +
    '<p class="muted" style="font-size:.82rem">Needed for international universities and IELTS.</p>' +
    '<button class="btn" onclick="takeEng(0)">Self-study · Free · +2</button>' +
    '<button class="btn" onclick="takeEng(1)">Online course · +5</button>' +
    '<button class="btn" onclick="takeEng(2)">Language institute · +9</button>' +
    '<button class="btn" onclick="takeEng(3)">Intensive + speaking club · +14</button>' +
    '</section>';

  /* IELTS/TOEFL card */
  html += '<section class="card"><h3>📝 IELTS / TOEFL</h3>' +
    '<div class="row"><span>IELTS</span><b>' + (S.ielts || 'Not taken') + '</b></div>' +
    '<div class="row"><span>TOEFL</span><b>' + (S.toefl ? S.toefl + '/120' : 'Not taken') + '</b></div>' +
    '<button class="btn" onclick="takeIelts()">Take IELTS · ' + money((typeof imp === 'function' ? imp(250) : 250)) + '</button>' +
    (typeof takeToefl === 'function' ? '<button class="btn" onclick="takeToefl()">Take TOEFL · ' + money((typeof imp === 'function' ? imp(250) : 250)) + '</button>' : '') +
    '</section>';

  /* Passport — single card */
  if (S.age >= 16 && typeof passportCard === 'function') {
    const passportHtml = passportCard();
    if (passportHtml) html += passportHtml;
  }

  /* Return / reset option */
  html += '<section class="card"><h3>⚙️ Options</h3>' +
    '<p class="muted" style="font-size:.78rem">You can switch to the Egyptian Thanaweya Amma system (only if you have not graduated high school yet) or continue with the international route.</p>' +
    '<button class="btn" style="border-color:var(--amber)" onclick="p80ResetEducationSystem()">Switch to Thanaweya Amma (Egyptian)</button>' +
    '</section>';

  return html;
}

function p80ResetEducationSystem() {
  if (!S) return;
  if (S.age > 16) return hint('You are too old to switch education systems.');
  S.p78.educationSystem = 'thanaweya';
  S.p78.systemChosen = true;
  log('🎓 You switched to the Egyptian Thanaweya Amma system.');
  hint(); render();
}
window.p80ResetEducationSystem = p80ResetEducationSystem;

/* =================================================================
   6. STATE INIT
   ================================================================= */
p80Init(S);
console.log('[p80] International university modal + family business protection loaded');
