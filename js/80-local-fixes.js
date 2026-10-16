/* =====================================================================
   80. LOCAL GAME FIXES — Egypt-first usability
   - Local master's card: fix "undefined" type and "1 of NaN"
   - Life events: fire reliably in yearly mode (blocked by base event)
   - Family business: real positions, real structure
   - "What to do next" card: cleaned, useful actions only
   - Study abroad: moved to bottom, organized
   Load AFTER 79-consistency-fix.js and BEFORE 99-boot.js
   ===================================================================== */

(function p80LocalFixes() {

  /* =================================================================
     1. LOCAL MASTER'S — normalize the data so nothing shows "undefined"
     ================================================================= */
  function p80NormalizeLocalMast() {
    if (!S || !S.localMast) return;
    const m = S.localMast;
    /* Type / kind */
    if (!m.kind) {
      m.kind = m.universityType || m.type || m.sector || 'public';
    }
    /* Years */
    if (!m.yearsTotal || isNaN(m.yearsTotal)) m.yearsTotal = 2;
    if (typeof m.year !== 'number' || isNaN(m.year)) m.year = 0;
    /* Field name */
    if (!m.fieldName || m.fieldName === 'undefined') {
      m.fieldName = m.field || m.programme || m.subject || 'Postgraduate programme';
    }
    /* University name */
    if (!m.universityName || m.universityName === 'undefined') {
      m.universityName = m.university || m.uniName || null;
    }
    /* Left / remaining */
    if (typeof m.left !== 'number' || isNaN(m.left)) {
      m.left = Math.max(0, (m.yearsTotal || 2) - (m.year || 0));
    }
  }
  setInterval(p80NormalizeLocalMast, 500);
  setTimeout(p80NormalizeLocalMast, 100);

  /* =================================================================
     2. LIFE EVENTS — fix yearly mode (blocked by base game pending)
     Base game sets S.pending when a yearly event is chosen.
     Our p57 life events check S.pending and bail, so they never fire.
     Solution: retry every 1.5s until the base event resolves.
     ================================================================= */
  function p80FireYearlyEvent() {
    if (!S) return;
    /* Only for yearly pacing */
    if (S.pacing === 'monthly') return;
    /* Don't stack multiple event modals */
    if (document.getElementById('p57-event-modal')) return;
    if (document.getElementById('p80-yly-event-pending')) return;
    /* Wait for base game pending event to clear */
    if (S.pending) {
      setTimeout(p80FireYearlyEvent, 1500);
      return;
    }
    /* Check whether this year already had a life event */
    if (S.p57 && S.p57.lastEventYear === gameYear()) return;

    if (typeof p57PickEvent !== 'function') return;
    if (typeof p57ShowEventModal !== 'function') return;

    /* Mark intent so we don't double-fire */
    const marker = document.createElement('div');
    marker.id = 'p80-yly-event-pending';
    marker.style.display = 'none';
    document.body.appendChild(marker);

    /* Small delay so age-up popups settle first */
    setTimeout(function () {
      if (!S) { marker.remove(); return; }
      if (document.getElementById('p57-event-modal')) { marker.remove(); return; }
      const ev = p57PickEvent();
      if (ev) {
        try {
          p57ShowEventModal(ev);
          if (!S.p57) S.p57 = {};
          S.p57.lastEventYear = gameYear();
          S.p57.eventsThisYear = (S.p57.eventsThisYear || 0) + 1;
        } catch (e) {
          console.error('[p80] life event failed:', e);
        }
      }
      marker.remove();
    }, 900);
  }

  /* Hook into yearly age-up */
  const P80_ageUpBefore = ageUp;
  ageUp = function () {
    const before = S && S.age;
    const r = P80_ageUpBefore.apply(this, arguments);
    if (!S || S.age === before) return r;
    if (S.pacing === 'monthly') return r;
    /* Schedule the life event attempt */
    setTimeout(p80FireYearlyEvent, 600);
    return r;
  };

  /* Also try on load in case the player has a stuck year */
  setTimeout(p80FireYearlyEvent, 2000);

  /* =================================================================
     3. FAMILY BUSINESS — realistic positions and structure
     Replace the flat "Employee" concept with a career ladder.
     ================================================================= */

  const P80_FAMILY_ROLES = [
    { level: 0, title: 'Junior Associate',       minAge: 18, salary: 0.015, next: 'Marketing & Operations' },
    { level: 1, title: 'Operations Associate',   minAge: 20, salary: 0.025, next: 'Senior Associate' },
    { level: 2, title: 'Senior Associate',       minAge: 23, salary: 0.035, next: 'Department Manager' },
    { level: 3, title: 'Department Manager',     minAge: 26, salary: 0.055, next: 'Operations Director' },
    { level: 4, title: 'Operations Director',    minAge: 30, salary: 0.080, next: 'General Manager' },
    { level: 5, title: 'General Manager',        minAge: 35, salary: 0.120, next: 'CEO / Chairman' },
    { level: 6, title: 'CEO / Chairman',         minAge: 40, salary: 0.180, next: null }
  ];

  function p80FamilyRoleFor(yearsWorked, age) {
    let role = P80_FAMILY_ROLES[0];
    for (let i = 0; i < P80_FAMILY_ROLES.length; i++) {
      const r = P80_FAMILY_ROLES[i];
      if (age >= r.minAge && yearsWorked >= i * 2) role = r;
    }
    return role;
  }

  /* Replacement family business card — richer, real positions */
  function p80FamilyBusinessCard() {
    if (!S || !S.p76 || !S.p76.familyBusiness) return '';
    if (S.country !== S.home) return '';
    if (S.age < 18) return '';
    if (typeof p77Init === 'function') p77Init(S);

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const revEGP = Math.round((S.p77 && S.p77.familyBusinessRevenue || 0) * rate);
    const works = !!(S.p77 && S.p77.worksForFamily);
    const manages = !!(S.p77 && S.p77.familyBusinessManaged);
    const yearsWorked = (S.p80_familyYearsWorked || 0);
    const currentRole = works ? p80FamilyRoleFor(yearsWorked, S.age) : null;

    /* Sector-based flavour */
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
    } else {
      const startRole = P80_FAMILY_ROLES[0];
      const startSalaryEGP = Math.round(revEGP * startRole.salary);
      html += '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">';
      html += '<div class="muted" style="font-size:.72rem;margin-bottom:4px">The business is hiring family. Start as:</div>';
      html += '<b>' + startRole.title + '</b> · E£' + startSalaryEGP.toLocaleString() + '/yr';
      html += '<p class="muted" style="font-size:.75rem;margin-top:6px">You can advance through the ladder: Operations Associate → Senior Associate → Department Manager → Operations Director → General Manager → CEO.</p>';
      html += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700;margin-top:6px" onclick="p77WorkForFamily()">Join the family business</button>';
      html += '</div>';
    }

    if (manages) {
      html += '<div class="row" style="border-top:1px solid var(--line);margin-top:10px;padding-top:8px"><span>You manage</span><b style="color:var(--mint)">Active</b></div>';
      html += '<button class="btn" style="border-color:var(--amber)" onclick="p77StopManaging()">Step back from management</button>';
    } else if (S.age >= 25 && works) {
      html += '<button class="btn" onclick="p77ManageFamilyBusiness()">Take on management<small>+15–30%/yr revenue, but less personal time</small></button>';
    }
    if (S.age >= 30 && works) {
      html += '<button class="btn" onclick="p77InheritBusiness()" style="border-color:var(--violet)">Request your share of the business</button>';
    }

    html += '</section>';
    return html;
  }

  /* Override the p77 card on the Career tab */
  const P80_viewCareerBefore = viewCareer;
  viewCareer = function () {
    let html = P80_viewCareerBefore.apply(this, arguments);
    if (!html || !S) return html;
    /* Remove any family business card */
    html = html.replace(
      /<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Your family owns and operates this business[\s\S]*?<\/section>/g,
      ''
    );
    const biz = p80FamilyBusinessCard();
    if (biz) {
      /* Insert near the top — before ACTIVE MAIN JOB if present */
      const marker = html.indexOf('ACTIVE MAIN JOB');
      if (marker !== -1) {
        const secStart = html.lastIndexOf('<section', marker);
        if (secStart !== -1) return html.slice(0, secStart) + biz + html.slice(secStart);
      }
      return biz + html;
    }
    return html;
  };

  /* Track years worked in family business */
  const P80_ageUpForTenure = ageUp;
  ageUp = function () {
    const r = P80_ageUpForTenure.apply(this, arguments);
    if (S && S.p77 && S.p77.worksForFamily) {
      S.p80_familyYearsWorked = (S.p80_familyYearsWorked || 0) + 1;
    } else {
      S.p80_familyYearsWorked = 0;
    }
    return r;
  };

  /* Sync job title to the current role */
  setInterval(function () {
    if (!S || !S.p77 || !S.p77.worksForFamily) return;
    if (!S.job || !S.job.isFamilyBusiness) return;
    const years = S.p80_familyYearsWorked || 0;
    const role = p80FamilyRoleFor(years, S.age);
    if (!role) return;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const revEGP = Math.round((S.p77.familyBusinessRevenue || 0) * rate);
    const salaryInternal = (revEGP * role.salary) / rate;
    if (S.job.title !== role.title) {
      S.job.title = role.title;
    }
    S.job.salary = salaryInternal;
    S.salary = salaryInternal;
  }, 800);

  /* =================================================================
     4. "WHAT TO DO NEXT" CARD — cleaner, useful actions only
     ================================================================= */
  function p80BuildCleanActions() {
    const actions = [];

    if (S.age < 18) {
      if (!S.school) actions.push({ icon: '📚', label: 'Pick a school', action: 'go(\'school\')' });
      if (S.age >= 9) actions.push({ icon: '🎓', label: 'Take private lessons', action: 'go(\'school\')' });
      if (S.age >= 12) actions.push({ icon: '🌐', label: 'Improve English', action: 'go(\'school\')' });
      if (S.age >= 15 && S.country === 'egy' && (!S.p68 || !S.p68.thanaweyaTrack)) {
        actions.push({ icon: '📝', label: 'Choose Thanaweya Amma track', action: 'go(\'school\')' });
      }
      return actions;
    }

    /* Adult (18+) */
    if (S.uni) {
      actions.push({ icon: '📖', label: 'Adjust study effort', action: 'go(\'school\')' });
      if (S.p71 && !S.p71.studyGroupActive) actions.push({ icon: '👥', label: 'Join a study group', action: 'p71JoinStudyGroup()' });
    } else if (S.localMast) {
      actions.push({ icon: '📖', label: 'Continue master\'s', action: 'go(\'school\')' });
    } else if (S.degree && !S.localMast) {
      if (!S.job) actions.push({ icon: '💼', label: 'Find a job', action: 'go(\'career\')' });
      else actions.push({ icon: '💼', label: 'Advance your career', action: 'go(\'career\')' });
    } else if (S.diploma && !S.degree && !S.uni) {
      actions.push({ icon: '🎓', label: 'Enrol in university', action: 'go(\'school\')' });
      if (!S.job) actions.push({ icon: '💼', label: 'Find a job', action: 'go(\'career\')' });
    }

    /* Health / life basics */
    if (S.job && (S.job.perf || 0) < 60) actions.push({ icon: '📈', label: 'Improve work performance', action: 'go(\'career\')' });
    if (S.health < 50) actions.push({ icon: '🏥', label: 'Visit a doctor', action: 'go(\'medical\')' });
    if (S.happiness < 40) actions.push({ icon: '😊', label: 'Do something enjoyable', action: 'go(\'act\')' });

    return actions;
  }

  const P80_viewSchoolCleanup = viewSchool;
  viewSchool = function () {
    let html = P80_viewSchoolCleanup.apply(this, arguments);
    if (!html || !S) return html;

    /* Remove the old "What to do next" card */
    html = html.replace(/<section class="card">\s*<h3>✅ What to do next<\/h3>[\s\S]*?<\/section>/g, '');

    /* Build a new clean version */
    const actions = p80BuildCleanActions();
    if (actions.length) {
      const card = '<section class="card"><h3>✅ What to do next</h3>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' +
        actions.slice(0, 4).map(function (a) {
          return '<button class="btn" style="margin:0;text-align:left" onclick="' + a.action + '">' +
            a.icon + ' ' + a.label + '</button>';
        }).join('') +
        '</div></section>';

      /* Insert after the first status card */
      const firstEnd = html.indexOf('</section>');
      if (firstEnd !== -1) {
        html = html.slice(0, firstEnd + 10) + card + html.slice(firstEnd + 10);
      }
    }

    /* Remove the Local Master's card if there's a broken one */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>📖 Local master's in progress<\/h3>[\s\S]*?<\/section>/g,
      p80LocalMastCard()
    );

    /* Remove study-abroad from the top (we'll add it at the bottom) */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🌍 Study abroad<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🌍 Master's abroad[^<]*<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🌍 Study abroad — realistic costs<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🎯 Target destination<\/h3>[\s\S]*?<\/section>/g, '');

    /* Add a compact Study abroad invitation at the very bottom */
    if (S.country === S.home && S.degree && !S.localMast && !S.mast) {
      html += '<section class="card" style="border-color:var(--violet);text-align:center;padding:18px">' +
        '<h3 style="margin:0">🌍 Study abroad</h3>' +
        '<p class="muted" style="font-size:.85rem;margin:8px 0">Master\'s programmes in the UK, USA, Germany, France, Canada and more.</p>' +
        '<button class="btn" style="width:100%;text-align:center;background:var(--violet);color:#fff;font-weight:700" onclick="p79OpenStudyAbroad()">' +
        'Explore destinations' +
        '</button>' +
        '</section>';
    }

    return html;
  };

  function p80LocalMastCard() {
    if (!S || !S.localMast) return '';
    p80NormalizeLocalMast();
    const m = S.localMast;
    const uniLine = m.universityName ? m.universityName + ' · ' : '';
    const typeLabel = m.kind === 'private' ? 'Private' : 'Public';

    return '<section class="card">' +
      '<h3>📖 Local master\'s in progress</h3>' +
      '<div class="row"><span>Programme</span><b>' + m.fieldName + '</b></div>' +
      '<div class="row"><span>University</span><b>' + (m.universityName || 'Egyptian university') + '</b></div>' +
      '<div class="row"><span>Type</span><b>' + typeLabel + '</b></div>' +
      '<div class="row"><span>Year</span><b>' + ((m.year || 0) + 1) + ' of ' + (m.yearsTotal || 2) + '</b></div>' +
      '<button class="btn" style="border-color:var(--rose);color:var(--rose)" onclick="p80LeaveLocalMaster()">Leave master\'s</button>' +
      '</section>';
  }

  window.p80LeaveLocalMaster = function () {
    if (!S || !S.localMast) return;
    if (!confirm('Leave your master\'s programme? Tuition paid so far is not refunded.')) return;
    S.localMast = null;
    if (typeof log === 'function') log('You withdrew from your master\'s programme.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     5. REMOVE BROKEN/LOW-VALUE CARDS ACROSS TABS
     ================================================================= */
  /* Life tab cleanup */
  const P80_viewLifeBefore = viewLife;
  viewLife = function () {
    let html = P80_viewLifeBefore.apply(this, arguments);
    if (!html) return html;
    /* Passport panel doesn't belong here */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g, '');
    /* Family business removed from Life (it's on Career) */
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Your family owns and operates this business[\s\S]*?<\/section>/g, '');
    return html;
  };

  /* Egypt cutoffs hidden after graduation or when enrolled */
  const P80_viewSchoolCutoffs = viewSchool;
  viewSchool = function () {
    let html = P80_viewSchoolCutoffs.apply(this, arguments);
    if (!html || !S) return html;
    if (S.degree || S.uni || S.localMast) {
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Your Thanaweya Amma position<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Choose Thanaweya Amma track<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/Choose a Thanaweya Amma track first\./g, '');
    }
    return html;
  };

  /* =================================================================
     6. DIAGNOSTICS
     ================================================================= */
  window.p80Diag = function () {
    console.log({
      pacing: S && S.pacing,
      localMast: S && S.localMast,
      familyBusiness: S && S.p76 && S.p76.familyBusiness,
      worksForFamily: S && S.p77 && S.p77.worksForFamily,
      familyYearsWorked: S && S.p80_familyYearsWorked,
      p57Exists: typeof p57PickEvent === 'function',
      p57LastYear: S && S.p57 && S.p57.lastEventYear
    });
  };

  console.log('[p80] Local fixes loaded — localMast, life events, family business, clean UI');
})();
