/* =====================================================================
   82. CAREER TAB RESTORE + MASTER'S ADVANCEMENT
   - Fixes the greedy regex that p80 used on viewCareer
   - Family business card inserted cleanly at the top
   - Master's year advances on each ageUp
   - Public/private university detection
   Load AFTER 81-education-life-makeover.js and BEFORE 99-boot.js
   ===================================================================== */

(function p82Fix() {

  /* =================================================================
     1. CAREER TAB — bypass p80's broken wrapper entirely
     ================================================================= */
  /* p80 exposed P80_viewCareerBefore as a top-level const. We call it
     directly, skip p80's regex mess, and prepend the family business
     card. The chain below p80 (p78, p73, p72, p51, p50, p19, base) is
     preserved. */

  const P82_careerChainBelow = (typeof P80_viewCareerBefore === 'function')
    ? P80_viewCareerBefore
    : null;

  if (P82_careerChainBelow) {
    viewCareer = function () {
      let html = '';
      try {
        html = P82_careerChainBelow.apply(this, arguments);
      } catch (e) {
        console.error('[p82] career chain failed:', e);
        html = '<section class="card"><h3>Career</h3><p class="muted">Career view failed to load. Check the console.</p></section>';
      }
      if (!html || typeof S === 'undefined' || !S) return html;

      /* Family business card — insert at the TOP only if player has one */
      if (S.p76 && S.p76.familyBusiness && S.country === S.home && S.age >= 18) {
        const biz = p82FamilyBusinessCard();
        if (biz) html = biz + html;
      }
      return html;
    };
  } else {
    /* If P80 wasn't loaded, still clean up any stray family biz card on the top level */
    const P82_currentCareer = viewCareer;
    viewCareer = function () {
      let html = P82_currentCareer.apply(this, arguments);
      if (html) {
        /* Remove only the exact family business card by walking text */
        html = p82RemoveFamilyBizFromHtml(html);
        if (S && S.p76 && S.p76.familyBusiness && S.country === S.home && S.age >= 18) {
          const biz = p82FamilyBusinessCard();
          if (biz) html = biz + html;
        }
      }
      return html;
    };
  }

  /* Helper that removes ONLY the family business card, using a precise scanner
     (no cross-section greedy regex). */
  function p82RemoveFamilyBizFromHtml(html) {
    if (!html) return html;
    const marker = 'Your family owns and operates this business';
    let idx = html.indexOf(marker);
    while (idx !== -1) {
      /* Walk backwards to find the enclosing <section */
      const sectionStart = html.lastIndexOf('<section', idx);
      if (sectionStart === -1) break;
      /* Walk forwards from the section start to find the closing </section> */
      const sectionEnd = html.indexOf('</section>', idx);
      if (sectionEnd === -1) break;
      const endPos = sectionEnd + '</section>'.length;
      html = html.slice(0, sectionStart) + html.slice(endPos);
      idx = html.indexOf(marker);
    }
    return html;
  }

  /* =================================================================
     2. FAMILY BUSINESS CARD — realistic roles ladder
     ================================================================= */
  const P82_FAMILY_ROLES = [
    { level: 0, title: 'Junior Associate',       minAge: 18, salary: 0.015, next: 'Operations Associate' },
    { level: 1, title: 'Operations Associate',   minAge: 20, salary: 0.025, next: 'Senior Associate' },
    { level: 2, title: 'Senior Associate',       minAge: 23, salary: 0.035, next: 'Department Manager' },
    { level: 3, title: 'Department Manager',     minAge: 26, salary: 0.055, next: 'Operations Director' },
    { level: 4, title: 'Operations Director',    minAge: 30, salary: 0.080, next: 'General Manager' },
    { level: 5, title: 'General Manager',        minAge: 35, salary: 0.120, next: 'CEO / Chairman' },
    { level: 6, title: 'CEO / Chairman',         minAge: 40, salary: 0.180, next: null }
  ];

  function p82FamilyRoleFor(yearsWorked, age) {
    let role = P82_FAMILY_ROLES[0];
    for (let i = 0; i < P82_FAMILY_ROLES.length; i++) {
      const r = P82_FAMILY_ROLES[i];
      if (age >= r.minAge && yearsWorked >= i * 2) role = r;
    }
    return role;
  }

  function p82FamilyBusinessCard() {
    if (!S || !S.p76 || !S.p76.familyBusiness) return '';
    if (S.country !== S.home) return '';
    if (S.age < 18) return '';
    if (typeof p77Init === 'function') p77Init(S);

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const revEGP = Math.round((S.p77 && S.p77.familyBusinessRevenue || 0) * rate);
    const works = !!(S.p77 && S.p77.worksForFamily);
    const manages = !!(S.p77 && S.p77.familyBusinessManaged);
    const yearsWorked = Number(S.p80_familyYearsWorked) || 0;
    const currentRole = works ? p82FamilyRoleFor(yearsWorked, S.age) : null;

    const sectorInfo = {
      'Delta Textiles': { sector: 'Textile manufacturing', founded: 1978, hq: 'Mahalla al-Kubra' },
      'Nile Trading Company': { sector: 'Import & export', founded: 1985, hq: 'Alexandria' },
      'Pyramid Foods': { sector: 'Food processing', founded: 1992, hq: '6th of October City' },
      'Cairo Medical Supplies': { sector: 'Medical equipment distribution', founded: 2001, hq: 'Cairo' },
      'Alexandria Shipping Co.': { sector: 'Maritime logistics', founded: 1968, hq: 'Alexandria Port' },
      'Nile Valley Real Estate': { sector: 'Property development', founded: 1995, hq: 'New Cairo' }
    }[S.p76.familyBusiness] || { sector: 'Family business', founded: 1980, hq: 'Egypt' };

    let html = '<section class="card" style="border-color:var(--mint)">';
    html += '<h3>💼 ' + S.p76.familyBusiness + '</h3>';
    html += '<p class="muted" style="font-size:.82rem">' + sectorInfo.sector + ' · Founded ' + sectorInfo.founded + ' · HQ ' + sectorInfo.hq + '</p>';
    html += '<div class="row"><span>Annual revenue</span><b class="mono">E£' + revEGP.toLocaleString() + '</b></div>';
    html += '<div class="row"><span>Employees</span><b>' + ((S.p77 && S.p77.familyBusinessEmployees) || 0) + '</b></div>';
    html += '<div class="row"><span>Family ownership</span><b>100% · ' + ((S.p76 && S.p76.siblingCount) || 0) + ' sibling heirs</b></div>';

    if (works && currentRole) {
      const salaryEGP = Math.round(revEGP * currentRole.salary);
      html += '<div style="margin-top:12px;padding:10px;background:rgba(52,211,153,.08);border-radius:8px;border-left:3px solid var(--mint)">';
      html += '<div class="muted" style="font-size:.68rem;letter-spacing:.06em;font-weight:700">YOUR ROLE</div>';
      html += '<div style="font-size:1rem;font-weight:700;margin-top:3px">' + currentRole.title + '</div>';
      html += '<div class="row" style="padding:3px 0"><span>Annual salary</span><b class="mono" style="color:var(--mint)">E£' + salaryEGP.toLocaleString() + '/yr</b></div>';
      html += '<div class="row" style="padding:3px 0"><span>Tenure</span><b>' + yearsWorked + ' year(s)</b></div>';
      if (currentRole.next) {
        html += '<div class="row" style="padding:3px 0"><span>Next step</span><b>' + currentRole.next + '</b></div>';
        html += '<p class="muted" style="font-size:.72rem;margin-top:6px">You advance through the family business ladder with age and tenure.</p>';
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
      const startRole = P82_FAMILY_ROLES[0];
      const startSalaryEGP = Math.round(revEGP * startRole.salary);
      html += '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">';
      html += '<div class="muted" style="font-size:.72rem;margin-bottom:4px">The business is hiring family. Start as:</div>';
      html += '<b>' + startRole.title + '</b> · E£' + startSalaryEGP.toLocaleString() + '/yr';
      html += '<p class="muted" style="font-size:.75rem;margin-top:6px">You can advance through the ladder: Operations Associate → Senior Associate → Department Manager → Operations Director → General Manager → CEO.</p>';
      html += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700;margin-top:6px" onclick="p77WorkForFamily()">Join the family business</button>';
      html += '</div>';
    }

    html += '</section>';
    return html;
  }

  /* Sync job title and salary every 800ms */
  setInterval(function () {
    if (!S || !S.p77 || !S.p77.worksForFamily) return;
    if (!S.job || !S.job.isFamilyBusiness) {
      /* Restore the job if it was cleared */
      const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
      const rev = Number(S.p77.familyBusinessRevenue) || 0;
      const years = Number(S.p80_familyYearsWorked) || 0;
      const role = p82FamilyRoleFor(years, S.age);
      const salaryInternal = (rev * role.salary);
      S.job = {
        trackId: 'entry', level: 0,
        title: role.title,
        salary: salaryInternal,
        perf: 60, years: years,
        company: (S.p76 && S.p76.familyBusiness) || 'Family Business',
        companySize: 'family business', companyFactor: 1,
        benefits: { medical: true, social: true, bonus: 0.02, leave: 21, remote: 'On-site', hours: 40, pension: true, contract: 'Family employment' },
        stress: 3,
        isFamilyBusiness: true
      };
      S.salary = salaryInternal;
      return;
    }
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const rev = Number(S.p77.familyBusinessRevenue) || 0;
    const years = Number(S.p80_familyYearsWorked) || 0;
    const role = p82FamilyRoleFor(years, S.age);
    const salaryInternal = (rev * role.salary);
    if (S.job.title !== role.title) S.job.title = role.title;
    S.job.salary = salaryInternal;
    S.salary = salaryInternal;
  }, 800);

  /* =================================================================
     3. MASTER'S YEAR ADVANCEMENT — advance on ageUp
     ================================================================= */
  const P82_ageUpBefore = ageUp;
  ageUp = function () {
    const ageBefore = S && S.age;
    const r = P82_ageUpBefore.apply(this, arguments);
    if (!S || S.age === ageBefore) return r;

    /* Advance the master's year once per game year */
    if (S.localMast) {
      const thisYear = (typeof gameYear === 'function') ? gameYear() : 2026;
      if (S.localMast.lastAdvanceYear !== thisYear) {
        S.localMast.lastAdvanceYear = thisYear;
        S.localMast.year = (S.localMast.year || 0) + 1;

        if (S.localMast.year >= (S.localMast.yearsTotal || 2)) {
          /* Completed */
          S.mastDone = true;
          S.masterField = S.localMast.fieldName;
          const uniName = S.localMast.universityName || 'Egyptian university';
          const field = S.localMast.fieldName || 'postgraduate programme';
          log('🎓 Completed your Master\'s in ' + field + ' at ' + uniName + '.');
          if (typeof realismNotice === 'function') {
            realismNotice('Master\'s completed', 'You earned a Master\'s in ' + field + ' from ' + uniName + '. Career options are now open in the Career tab.');
          }
          S.localMast = null;
        } else {
          log('📖 Master\'s year ' + ((S.localMast.year || 0) + 1) + ' of ' + (S.localMast.yearsTotal || 2) + ' started.');
        }
      }
    }

    /* Advance the abroad bachelor's month counter if applicable */
    if (S.p69 && S.p69.enrolled && S.p74 && typeof p74EnrollmentMonthsElapsed === 'function') {
      /* Already handled by p74 */
    }

    return r;
  };

  /* =================================================================
     4. PUBLIC / PRIVATE UNIVERSITY DETECTION
     ================================================================= */
  const P82_PRIVATE_UNIVERSITIES = [
    'auc', 'american university in cairo', 'american university',
    'guc', 'german university in cairo', 'german university',
    'bue', 'british university in egypt', 'british university',
    'aastmt', 'arab academy for science',
    'miu', 'misr international university',
    'buc', 'badr university',
    'msa', 'modern sciences and arts', 'modern sciences',
    'nile university',
    'future university',
    'heliopolis university',
    'must', 'misr university for science',
    'o6u', 'october 6 university',
    'mti', 'modern sciences and arts university',
    'gaf', 'german academic foundation',
    'eri', 'egyptian russian university',
    'ust', 'university of science and technology'
  ];

  function p82IsPrivateUniversity(nameOrId) {
    if (!nameOrId) return false;
    const s = String(nameOrId).toLowerCase();
    for (let i = 0; i < P82_PRIVATE_UNIVERSITIES.length; i++) {
      if (s.indexOf(P82_PRIVATE_UNIVERSITIES[i]) !== -1) return true;
    }
    return false;
  }
  window.p82IsPrivateUniversity = p82IsPrivateUniversity;

  /* Fix wrong kind on existing save */
  function p82FixLocalMastKind() {
    if (!S || !S.localMast) return;
    const m = S.localMast;
    const check = (m.universityName || '') + ' ' + (m.universityId || '');
    if (p82IsPrivateUniversity(check)) {
      if (m.kind !== 'private') {
        m.kind = 'private';
        console.log('[p82] Corrected master\'s university kind to private:', m.universityName);
      }
    } else if (!m.kind) {
      m.kind = 'public';
    }
  }
  setInterval(p82FixLocalMastKind, 700);
  setTimeout(p82FixLocalMastKind, 200);

  /* =================================================================
     5. DIAGNOSTICS
     ================================================================= */
  window.p82Diag = function () {
    console.log({
      careerChainBelowP80: !!P82_careerChainBelow,
      activeTab: typeof activeTab !== 'undefined' ? activeTab : '?',
      degree: S && S.degree,
      uni: !!(S && S.uni),
      localMast: S && S.localMast,
      familyBusiness: S && S.p76 && S.p76.familyBusiness,
      worksForFamily: S && S.p77 && S.p77.worksForFamily,
      familyYears: S && S.p80_familyYearsWorked
    });
  };

  console.log('[p82] Career + Master\'s fixes loaded');
})();
