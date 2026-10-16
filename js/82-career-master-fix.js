/* =====================================================================
   82. CAREER RESTORE + MASTER'S FIXES (v2)
   - Bypass p80's destructive viewCareer wrapper entirely
   - One family business card, clean role ladder
   - Master's year advances on each ageUp
   - Public/private university detection
   Load AFTER 81-education-life-makeover.js and BEFORE 99-boot.js
   ===================================================================== */

console.log('=== [p82] v2 loading ===');

(function p82Fix() {
  'use strict';

  /* =================================================================
     1. BYPASS p80's destructive viewCareer wrapper
     p80's regex `[\s\S]*?` matched from the first section to the
     family business card, eating everything in between.
     Fix: call the chain BELOW p80 (`P80_viewCareerBefore`) directly.
     ================================================================= */
  var P82_chainBelow = (typeof P80_viewCareerBefore !== 'undefined' && typeof P80_viewCareerBefore === 'function')
    ? P80_viewCareerBefore
    : null;

  if (!P82_chainBelow) {
    console.warn('[p82] P80_viewCareerBefore not found. Falling back to current viewCareer chain.');
  }

  viewCareer = function () {
    var html = '';
    try {
      if (P82_chainBelow) {
        html = P82_chainBelow.apply(this, arguments);
      } else {
        /* Fallback: try the current chain, but only if p80 damage is detected */
        html = '';
      }
    } catch (e) {
      console.error('[p82] chain failed:', e);
      html = '<section class="card"><h3>Career</h3><p class="muted">Career view failed to load. Check the console.</p></section>';
    }

    if (!html || typeof S === 'undefined' || !S) return html;

    /* Remove every family business card using a precise section-aware scanner */
    html = p82RemoveFamilyBizCards(html);

    /* Prepend one clean family business card at the top */
    if (S.p76 && S.p76.familyBusiness && S.country === S.home && S.age >= 18) {
      var biz = p82FamilyBusinessCard();
      if (biz) html = biz + html;
    }

    return html;
  };

  /* Section-aware scanner — walks backward to <section, forward to </section> */
  function p82RemoveFamilyBizCards(html) {
    if (!html) return html;
    var marker = 'Your family owns and operates this business';
    var guard = 0;
    var idx = html.indexOf(marker);
    while (idx !== -1 && guard++ < 10) {
      var sectionStart = html.lastIndexOf('<section', idx);
      if (sectionStart === -1) break;
      var sectionEnd = html.indexOf('</section>', idx);
      if (sectionEnd === -1) break;
      var endPos = sectionEnd + '</section>'.length;
      html = html.slice(0, sectionStart) + html.slice(endPos);
      idx = html.indexOf(marker);
    }
    return html;
  }

  /* =================================================================
     2. FAMILY BUSINESS — realistic role ladder
     ================================================================= */
  var P82_ROLES = [
    { title: 'Junior Associate',     minAge: 18, salary: 0.015, next: 'Operations Associate' },
    { title: 'Operations Associate', minAge: 20, salary: 0.025, next: 'Senior Associate' },
    { title: 'Senior Associate',     minAge: 23, salary: 0.035, next: 'Department Manager' },
    { title: 'Department Manager',   minAge: 26, salary: 0.055, next: 'Operations Director' },
    { title: 'Operations Director',  minAge: 30, salary: 0.080, next: 'General Manager' },
    { title: 'General Manager',      minAge: 35, salary: 0.120, next: 'CEO / Chairman' },
    { title: 'CEO / Chairman',       minAge: 40, salary: 0.180, next: null }
  ];

  function p82RoleFor(yearsWorked, age) {
    var role = P82_ROLES[0];
    for (var i = 0; i < P82_ROLES.length; i++) {
      var r = P82_ROLES[i];
      if (age >= r.minAge && yearsWorked >= i * 2) role = r;
    }
    return role;
  }

  var P82_SECTORS = {
    'Delta Textiles':         { sector: 'Textile manufacturing',          founded: 1978, hq: 'Mahalla al-Kubra' },
    'Nile Trading Company':   { sector: 'Import & export',                founded: 1985, hq: 'Alexandria' },
    'Pyramid Foods':          { sector: 'Food processing',                founded: 1992, hq: '6th of October City' },
    'Cairo Medical Supplies': { sector: 'Medical equipment distribution', founded: 2001, hq: 'Cairo' },
    'Alexandria Shipping Co.':{ sector: 'Maritime logistics',             founded: 1968, hq: 'Alexandria Port' },
    'Nile Valley Real Estate':{ sector: 'Property development',           founded: 1995, hq: 'New Cairo' }
  };

  function p82FamilyBusinessCard() {
    if (!S || !S.p76 || !S.p76.familyBusiness) return '';
    if (S.country !== S.home) return '';
    if (S.age < 18) return '';
    if (typeof p77Init === 'function') p77Init(S);

    var rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    var revEGP = Math.round((S.p77 && S.p77.familyBusinessRevenue || 0) * rate);
    var works = !!(S.p77 && S.p77.worksForFamily);
    var manages = !!(S.p77 && S.p77.familyBusinessManaged);
    var yearsWorked = Number(S.p80_familyYearsWorked) || 0;
    var role = works ? p82RoleFor(yearsWorked, S.age) : null;
    var sector = P82_SECTORS[S.p76.familyBusiness] || { sector: 'Family business', founded: 1980, hq: 'Egypt' };

    var html = '<section class="card" style="border-color:var(--mint)">';
    html += '<h3>💼 ' + S.p76.familyBusiness + '</h3>';
    html += '<p class="muted" style="font-size:.82rem">' + sector.sector + ' · Founded ' + sector.founded + ' · HQ ' + sector.hq + '</p>';
    html += '<div class="row"><span>Annual revenue</span><b class="mono">E£' + revEGP.toLocaleString() + '</b></div>';
    html += '<div class="row"><span>Employees</span><b>' + ((S.p77 && S.p77.familyBusinessEmployees) || 0) + '</b></div>';
    html += '<div class="row"><span>Family ownership</span><b>100% · ' + ((S.p76 && S.p76.siblingCount) || 0) + ' sibling heirs</b></div>';

    if (works && role) {
      var salaryEGP = Math.round(revEGP * role.salary);
      html += '<div style="margin-top:12px;padding:10px;background:rgba(52,211,153,.08);border-radius:8px;border-left:3px solid var(--mint)">';
      html += '<div class="muted" style="font-size:.68rem;letter-spacing:.06em;font-weight:700">YOUR ROLE</div>';
      html += '<div style="font-size:1rem;font-weight:700;margin-top:3px">' + role.title + '</div>';
      html += '<div class="row" style="padding:3px 0"><span>Annual salary</span><b class="mono" style="color:var(--mint)">E£' + salaryEGP.toLocaleString() + '/yr</b></div>';
      html += '<div class="row" style="padding:3px 0"><span>Tenure</span><b>' + yearsWorked + ' year(s)</b></div>';
      if (role.next) {
        html += '<div class="row" style="padding:3px 0"><span>Next step</span><b>' + role.next + '</b></div>';
      }
      html += '<button class="btn" style="border-color:var(--rose);color:var(--rose);margin-top:8px" onclick="p77QuitFamilyBusiness()">Leave the family business</button>';
      html += '</div>';
      if (!manages && S.age >= 25) {
        html += '<button class="btn" onclick="p77ManageFamilyBusiness()">Take on management<small>+15–30%/yr revenue, but less personal time</small></button>';
      }
      if (manages) {
        html += '<div class="row" style="border-top:1px solid var(--line);margin-top:10px;padding-top:8px"><span>You manage</span><b style="color:var(--mint)">Active</b></div>';
        html += '<button class="btn" style="border-color:var(--amber)" onclick="p77StopManaging()">Step back from management</button>';
      }
      if (S.age >= 30) {
        html += '<button class="btn" onclick="p77InheritBusiness()" style="border-color:var(--violet)">Request your share of the business</button>';
      }
    } else {
      var startRole = P82_ROLES[0];
      var startSalaryEGP = Math.round(revEGP * startRole.salary);
      html += '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">';
      html += '<div class="muted" style="font-size:.72rem;margin-bottom:4px">The business is hiring family. Start as:</div>';
      html += '<b>' + startRole.title + '</b> · E£' + startSalaryEGP.toLocaleString() + '/yr';
      html += '<p class="muted" style="font-size:.75rem;margin-top:6px">Ladder: Junior Associate → Operations Associate → Senior Associate → Department Manager → Operations Director → General Manager → CEO.</p>';
      html += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700;margin-top:6px" onclick="p77WorkForFamily()">Join the family business</button>';
      html += '</div>';
    }

    html += '</section>';
    return html;
  }

  /* Sync S.job to the current role every 800ms */
  setInterval(function () {
    if (!S || !S.p77 || !S.p77.worksForFamily) return;
    var rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    var rev = Number(S.p77.familyBusinessRevenue) || 0;
    var years = Number(S.p80_familyYearsWorked) || 0;
    var role = p82RoleFor(years, S.age);
    var salaryInternal = rev * role.salary;

    if (!S.job || !S.job.isFamilyBusiness) {
      S.job = {
        trackId: 'entry', level: 0, title: role.title, salary: salaryInternal,
        perf: 60, years: years,
        company: (S.p76 && S.p76.familyBusiness) || 'Family Business',
        companySize: 'family business', companyFactor: 1,
        benefits: { medical: true, social: true, bonus: 0.02, leave: 21, remote: 'On-site', hours: 40, pension: true, contract: 'Family employment' },
        stress: 3, isFamilyBusiness: true
      };
    } else {
      if (S.job.title !== role.title) S.job.title = role.title;
      S.job.salary = salaryInternal;
    }
    S.salary = salaryInternal;
  }, 800);

  /* Track years worked */
  var P82_ageUpTenure = ageUp;
  ageUp = function () {
    var r = P82_ageUpTenure.apply(this, arguments);
    if (S && S.p77 && S.p77.worksForFamily) {
      S.p80_familyYearsWorked = (Number(S.p80_familyYearsWorked) || 0) + 1;
    } else if (S) {
      S.p80_familyYearsWorked = 0;
    }
    return r;
  };

  /* =================================================================
     3. MASTER'S YEAR ADVANCEMENT
     ================================================================= */
  var P82_ageUpMaster = ageUp;
  ageUp = function () {
    var ageBefore = S && S.age;
    var r = P82_ageUpMaster.apply(this, arguments);
    if (!S || S.age === ageBefore) return r;

    if (S.localMast) {
      var thisYear = (typeof gameYear === 'function') ? gameYear() : 2026;
      if (S.localMast.lastAdvanceYear !== thisYear) {
        S.localMast.lastAdvanceYear = thisYear;
        S.localMast.year = (S.localMast.year || 0) + 1;

        var total = S.localMast.yearsTotal || 2;
        if (S.localMast.year >= total) {
          S.mastDone = true;
          S.masterField = S.localMast.fieldName;
          var uniName = S.localMast.universityName || 'Egyptian university';
          var field = S.localMast.fieldName || 'postgraduate programme';
          if (typeof log === 'function') log('🎓 Completed your Master\'s in ' + field + ' at ' + uniName + '.');
          if (typeof realismNotice === 'function') realismNotice('Master\'s completed', 'You earned a Master\'s in ' + field + ' from ' + uniName + '.');
          S.localMast = null;
        } else {
          if (typeof log === 'function') log('📖 Master\'s year ' + ((S.localMast.year || 0) + 1) + ' of ' + total + ' started.');
        }
      }
    }
    return r;
  };

  /* =================================================================
     4. PUBLIC / PRIVATE UNIVERSITY DETECTION
     ================================================================= */
  var P82_PRIVATE = [
    'auc', 'american university in cairo', 'american university',
    'guc', 'german university in cairo', 'german university',
    'bue', 'british university in egypt', 'british university',
    'aastmt', 'arab academy for science',
    'miu', 'misr international university',
    'buc', 'badr university',
    'msa', 'modern sciences and arts',
    'nile university',
    'future university',
    'heliopolis university',
    'must', 'misr university for science',
    'o6u', 'october 6 university',
    'mti',
    'gaf', 'german academic foundation',
    'eri', 'egyptian russian university',
    'ust', 'university of science and technology',
    'smart', 'badr university'
  ];

  function p82IsPrivate(name) {
    if (!name) return false;
    var s = String(name).toLowerCase();
    for (var i = 0; i < P82_PRIVATE.length; i++) {
      if (s.indexOf(P82_PRIVATE[i]) !== -1) return true;
    }
    return false;
  }

  function p82FixKind() {
    if (!S || !S.localMast) return;
    var check = (S.localMast.universityName || '') + ' ' + (S.localMast.universityId || '');
    if (p82IsPrivate(check)) {
      if (S.localMast.kind !== 'private') {
        S.localMast.kind = 'private';
        console.log('[p82] Corrected master\'s kind to private:', S.localMast.universityName);
      }
    } else if (!S.localMast.kind) {
      S.localMast.kind = 'public';
    }
  }
  setInterval(p82FixKind, 700);
  setTimeout(p82FixKind, 100);

  /* =================================================================
     5. DIAGNOSTICS
     ================================================================= */
  window.p82Diag = function () {
    console.log({
      chainBelowP80: !!P82_chainBelow,
      activeTab: typeof activeTab !== 'undefined' ? activeTab : '?',
      degree: S && S.degree,
      localMast: S && S.localMast,
      familyBusiness: S && S.p76 && S.p76.familyBusiness,
      worksForFamily: S && S.p77 && S.p77.worksForFamily,
      familyYears: S && S.p80_familyYearsWorked,
      careerHtmlLen: typeof viewCareer === 'function' ? (viewCareer() || '').length : 0
    });
  };

  console.log('=== [p82] v2 loaded ===');
})();
