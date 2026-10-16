/* =====================================================================
   86. VISA SYSTEM + MASTER'S + SPONSORSHIP FIXES
   - Master's applications now save the correct level
   - Already-applied display fixed (pending vs rejected vs enrolled)
   - Level picker added to the study-abroad modal
   - Sponsorship filter toggle in Career
   - Full visa application pipeline (submitted → biometrics → interview → decision)
   - Graduate Route / OPT / Skilled Worker actions in World tab
   - Work-visa violation warning
   Load AFTER 85-view-rebuilds.js and BEFORE 99-boot.js
   ===================================================================== */

(function p86VisaAndMasters() {

  /* =================================================================
     1. STATE
     ================================================================= */
  function p86Init(o) {
    o = o || S;
    if (!o) return;
    if (!o.p86) o.p86 = {};
    const d = o.p86;
    if (!d.visaApp) d.visaApp = null;
    if (typeof d.showSponsoredOnly !== 'boolean') d.showSponsoredOnly = true;
    if (!Array.isArray(d.visaHistory)) d.visaHistory = [];
    if (typeof d.abroadLevel !== 'string') d.abroadLevel = null;
  }
  const P86_migrate = migrate;
  migrate = function (o) { const r = P86_migrate(o); p86Init(r); return r; };
  const P86_newGame = newGame;
  newGame = function () { P86_newGame.apply(this, arguments); p86Init(S); };
  p86Init(S);

  /* =================================================================
     2. LEVEL-AWARE APPLICATION
     Override p80ApplyAbroad to accept a 4th arg: level
     ================================================================= */
  const p86OrigApply = (typeof p80ApplyAbroad === 'function') ? p80ApplyAbroad : null;
  if (p86OrigApply) {
    p80ApplyAbroad = function (country, index, funding, level) {
      level = level || (S.degree ? 'master' : 'bachelor');

      const unis = (typeof P80_INT_UNIS !== 'undefined' && P80_INT_UNIS[country]) || [];
      const uni = unis[index];
      if (!uni) return hint('University not found.');

      /* Pre-check for master's */
      if (level === 'master') {
        if (!S.degree) return hint('You need a bachelor\'s degree first.');
        const requiredGpa = (uni.req || 3.0) + 0.1; /* master's is slightly stricter */
        const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
        if (gpa < requiredGpa) {
          return hint('Master\'s programmes typically require a higher GPA than the bachelor route. You need ' + requiredGpa.toFixed(2) + '+. You have ' + gpa.toFixed(2) + '.');
        }
      }

      /* Call original */
      const r = p86OrigApply.apply(this, arguments);

      /* Patch the newly-created application so it knows its level */
      if (S.p79 && Array.isArray(S.p79.appliedUnis) && S.p79.appliedUnis.length) {
        const last = S.p79.appliedUnis[S.p79.appliedUnis.length - 1];
        if (last && last.uni === uni.n && !last.__p86Fixed) {
          last.level = level;
          last.__p86Fixed = true;
          /* Master's decisions are faster (2 months) */
          if (level === 'master') {
            last.resolveAfterMonths = 2;
            /* Bump GPA requirement to match master's strictness */
            last.reqGpa = (uni.req || 3.0) + 0.1;
          }
        }
      }
      save();
      return r;
    };
    window.p80ApplyAbroad = p80ApplyAbroad;
  }

  /* =================================================================
     3. LEVEL PICKER + FIXED ALREADY-APPLIED CHECK in the modal
     Override p80ShowAbroadModal
     ================================================================= */
  const p86OrigModal = (typeof p80ShowAbroadModal === 'function') ? p80ShowAbroadModal : null;
  if (p86OrigModal) {
    p80ShowAbroadModal = function () {
      /* Set default level if not chosen */
      p86Init(S);
      if (!S.p86.abroadLevel) {
        S.p86.abroadLevel = S.degree ? 'master' : 'bachelor';
      }

      /* Call the original to build everything */
      p86OrigModal.apply(this, arguments);

      /* Now patch the modal HTML to add a level picker at the top
         and fix the alreadyApplied display logic */
      const modal = document.getElementById('p80-abroad-modal');
      if (!modal) return;

      /* -- a) Insert level picker at the top of the modal body -- */
      const level = S.p86.abroadLevel;
      const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
      const picker =
        '<div style="margin-top:14px;padding:10px;background:rgba(139,92,246,.08);border-radius:8px">' +
        '<b style="font-size:.82rem;color:var(--violet)">Application level</b>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">' +
        '<button class="btn" style="margin:0;padding:8px;font-size:.75rem;' +
          (level === 'bachelor' ? 'border-color:var(--violet);background:rgba(139,92,246,.15)' : '') +
          '" onclick="p86SetLevel(\'bachelor\')">🎓 Bachelor\'s<small>Requires diploma (or Thanaweya ≥ 70%)</small></button>' +
        (S.degree
          ? '<button class="btn" style="margin:0;padding:8px;font-size:.75rem;' +
            (level === 'master' ? 'border-color:var(--violet);background:rgba(139,92,246,.15)' : '') +
            '" onclick="p86SetLevel(\'master\')">🎓 Master\'s<small>Requires bachelor\'s · higher GPA (' + (gpa + 0.1).toFixed(2) + '+)</small></button>'
          : '<button class="btn" style="margin:0;padding:8px;font-size:.75rem;opacity:.5" disabled>🎓 Master\'s<small>Complete a bachelor\'s first</small></button>') +
        '</div></div>';

      const inner = modal.querySelector('div > div');
      if (inner && !inner.querySelector('.p86-level-picker')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'p86-level-picker';
        wrapper.innerHTML = picker;
        /* Insert after the GPA/IELTS/Bank summary line */
        const summary = inner.querySelector('p.muted');
        if (summary && summary.nextSibling) {
          summary.parentNode.insertBefore(wrapper, summary.nextSibling);
        } else {
          inner.appendChild(wrapper);
        }
      }

      /* -- b) Fix "Application submitted" display logic -- */
      /* Walk every university card. If the underlying app is rejected/nulled,
         replace the pending text with a Reapply button; if enrolled, show "You are here" */
      const cards = inner.querySelectorAll('div[style*="border:1px solid"]');
      cards.forEach(function (card) {
        const bold = card.querySelector('b');
        if (!bold) return;
        const uniName = bold.textContent.trim();
        const app = (S.p79.appliedUnis || []).find(function (a) { return a.uni === uniName; });
        if (!app) return;

        const submittedP = Array.from(card.querySelectorAll('p')).find(function (p) {
          return (p.textContent || '').indexOf('Application submitted') !== -1;
        });
        if (!submittedP) return;

        if (app.result === 'enrolled') {
          submittedP.textContent = '✓ You are here';
          submittedP.style.color = 'var(--mint)';
        } else if (app.resolved && app.result === 'rejected') {
          /* Replace with a Reapply button */
          const level = S.p86.abroadLevel;
          const unis = P80_INT_UNIS[S.p80.modalCountry] || [];
          const idx = unis.findIndex(function (u) { return u.n === uniName; });
          if (idx >= 0) {
            submittedP.outerHTML =
              '<p style="color:var(--rose);font-size:.74rem;margin-top:5px">❌ Rejected previously</p>' +
              '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin-top:6px">' +
              '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80ApplyAbroad(\'' + S.p80.modalCountry + '\',' + idx + ',\'self\',\'' + level + '\')">Self</button>' +
              '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80ApplyAbroad(\'' + S.p80.modalCountry + '\',' + idx + ',\'scholarship\',\'' + level + '\')">Scholarship</button>' +
              '<button class="btn" style="margin:0;padding:5px;font-size:.68rem" onclick="p80ApplyAbroad(\'' + S.p80.modalCountry + '\',' + idx + ',\'parents\',\'' + level + '\')">Family</button>' +
              '</div>';
          }
        } else if (app.resolved && app.result && app.result.indexOf('admitted') === 0) {
          submittedP.textContent = '✅ ' + (app.result === 'admitted-no-funds' ? 'Admitted (no funding)' : 'Admitted — click to enrol');
          submittedP.style.color = app.result === 'admitted-no-funds' ? 'var(--rose)' : 'var(--mint)';
        }
      });

      /* -- c) Rewrite all onclick handlers to include the current level -- */
      const newButtons = inner.querySelectorAll('button');
      newButtons.forEach(function (btn) {
        const oc = btn.getAttribute('onclick') || '';
        if (oc.indexOf('p80ApplyAbroad') === -1) return;
        if (oc.indexOf("'bachelor'") !== -1 || oc.indexOf("'master'") !== -1) return;
        /* Already set — but we need to make sure it uses the current level,
           not the level baked at button creation time */
        btn.setAttribute('onclick', oc.replace(
          /p80ApplyAbroad\(([^)]+)\)/,
          "p80ApplyAbroad($1,'" + level + "')"
        ));
      });
    };
    window.p80ShowAbroadModal = p80ShowAbroadModal;
  }

  window.p86SetLevel = function (level) {
    p86Init(S);
    S.p86.abroadLevel = level;
    save();
    /* Rebuild the modal */
    const m = document.getElementById('p80-abroad-modal');
    if (m) m.remove();
    if (typeof p80ShowAbroadModal === 'function') p80ShowAbroadModal();
  };

  /* =================================================================
     4. SPONSORSHIP FILTER IN CAREER TAB
     ================================================================= */
  const p86OrigCareer = viewCareer;
  viewCareer = function () {
    let html = p86OrigCareer.apply(this, arguments);
    if (!html || !S) return html;

    /* Filter toggle — only when abroad */
    if (S.country !== S.home) {
      const on = S.p86.showSponsoredOnly;
      const toggle =
        '<section class="card" style="padding:10px 12px;border-left:3px solid ' +
        (on ? 'var(--mint)' : 'var(--amber)') + '">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
        '<div style="min-width:0;flex:1">' +
        '<div class="muted" style="font-size:.68rem;font-weight:700;letter-spacing:.05em">VISA SPONSORSHIP</div>' +
        '<div style="font-size:.82rem;margin-top:2px">' +
        (on ? 'Showing sponsored roles only' : 'Showing all roles (unsponsored flagged)') +
        '</div>' +
        '</div>' +
        '<button class="btn" style="margin:0;padding:6px 10px;font-size:.72rem" onclick="p86ToggleSponsored()">' +
        (on ? 'Show all' : 'Sponsored only') +
        '</button>' +
        '</div></section>';

      const firstEnd = html.indexOf('</section>');
      if (firstEnd > 0) {
        html = html.slice(0, firstEnd + 10) + toggle + html.slice(firstEnd + 10);
      }

      /* When filter is ON, hide unsponsored job blocks */
      if (on) {
        /* Job blocks are individual <div style="padding:...;border:..."> inside the "Openings" section */
        /* We look for blocks that contain "Work visa sponsorship" and "No —" and remove them */
        html = html.replace(
          /<div style="[^"]*">(?:(?!<div style="[^"]*">)[\s\S])*?Work visa sponsorship[\s\S]*?No —[\s\S]*?<\/div>\s*(?=<div|<\/section>|$)/g,
          ''
        );
      }
    }

    return html;
  };

  window.p86ToggleSponsored = function () {
    p86Init(S);
    S.p86.showSponsoredOnly = !S.p86.showSponsoredOnly;
    save();
    render();
  };

  /* =================================================================
     5. VISA APPLICATION PIPELINE
     ================================================================= */
  const P86_VISA_APPS = {
    graduate_route_gbr: {
      name: 'UK Graduate Route',
      short: 'Graduate Route',
      durationYears: 2,
      feeGBP: 715,
      processingWeeks: 8,
      notes: 'No sponsorship needed. Full-time work for any employer.',
      resultVisa: {
        type: 'poststudy',
        name: 'UK Graduate Route',
        workRights: 'Full-time, any employer'
      }
    },
    opt_usa: {
      name: 'US OPT (Optional Practical Training)',
      short: 'OPT',
      durationYears: 1,
      feeUSD: 470,
      processingWeeks: 12,
      notes: 'Must be in your field. Employer must be E-Verify enrolled.',
      resultVisa: {
        type: 'poststudy',
        name: 'US OPT',
        workRights: 'Full-time in your field of study'
      }
    },
    skilled_worker_gbr: {
      name: 'UK Skilled Worker visa',
      short: 'Skilled Worker',
      durationYears: 5,
      feeGBP: 719,
      processingWeeks: 12,
      notes: 'Tied to the sponsoring employer.',
      resultVisa: {
        type: 'work',
        name: 'UK Skilled Worker visa',
        workRights: 'Full-time for the sponsoring employer'
      }
    }
  };

  function p86Eligible(appKey) {
    const v = S.p81 && S.p81.visa;
    if (!v) return false;
    if (S.p86.visaApp) return false;
    if (S.p86.visaHistory && S.p86.visaHistory.some(function (h) { return h.type === appKey && h.result === 'approved'; })) return false;

    if (appKey === 'graduate_route_gbr') {
      return v.country === 'gbr' && v.type === 'student' && !!S.degree;
    }
    if (appKey === 'opt_usa') {
      return v.country === 'usa' && v.type === 'student' && !!S.degree;
    }
    if (appKey === 'skilled_worker_gbr') {
      return v.country === 'gbr' && S.job && S.job.visaSponsorship === true;
    }
    return false;
  }

  window.p86StartVisaApp = function (appKey) {
    p86Init(S);
    const app = P86_VISA_APPS[appKey];
    if (!app) return hint('Unknown visa type.');
    if (S.p86.visaApp) return hint('You already have a visa application in progress.');
    if (!p86Eligible(appKey)) return hint('You are not eligible for this visa right now.');

    const rate = rateNow();
    /* Convert fee to EGP: £1 ≈ 60 EGP, $1 ≈ 50 EGP */
    let feeEGP = 0;
    if (app.feeGBP) feeEGP = app.feeGBP * 60;
    if (app.feeUSD) feeEGP = app.feeUSD * 50;
    const feeInternal = feeEGP / rate;
    if (S.wealth < feeInternal) {
      return hint('Application fee: E£' + Math.round(feeEGP).toLocaleString() + '. You have E£' + Math.round(S.wealth * rate).toLocaleString() + '.');
    }

    S.wealth -= feeInternal;
    S.expenses = (S.expenses || 0) + feeInternal;

    S.p86.visaApp = {
      type: appKey,
      submittedAbs: S.pacingAbsoluteMonth || 0,
      submittedYear: gameYear(),
      stage: 'submitted',
      processingWeeks: app.processingWeeks
    };

    log('📋 Visa application submitted: ' + app.name + '. Fee: E£' + Math.round(feeEGP).toLocaleString() + '. Processing: ~' + app.processingWeeks + ' weeks.');
    realismNotice('Visa application submitted', 'You applied for the ' + app.name + '. Biometrics appointment will be scheduled within 2–4 weeks.');
    save();
    hint();
    render();
  };

  function p86TickVisaApp() {
    if (!S || !S.p86 || !S.p86.visaApp) return;
    const va = S.p86.visaApp;
    const app = P86_VISA_APPS[va.type];
    if (!app) return;

    const absMonth = S.pacingAbsoluteMonth || 0;
    const elapsed = absMonth - va.submittedAbs;
    const processingMonths = Math.ceil(app.processingWeeks / 4);

    if (va.stage === 'submitted' && elapsed >= 1) {
      va.stage = 'biometrics';
      log('📅 Biometrics appointment for ' + app.name + ' completed. Application under review.');
      save();
    } else if (va.stage === 'biometrics' && elapsed >= processingMonths - 1) {
      va.stage = 'interview';
      log('💬 Interview requested for ' + app.name + '. Prepare your documents.');
      save();
    } else if (elapsed >= processingMonths) {
      /* Decision time */
      const rate = rateNow();
      const chance = p86ApprovalChance(va.type);
      if (Math.random() < chance) {
        va.stage = 'approved';
        const rv = app.resultVisa;
        if (S.p81) {
          S.p81.visa = {
            type: rv.type,
            name: rv.name,
            country: S.country,
            grantedYear: gameYear(),
            expiresYear: gameYear() + app.durationYears,
            workRights: rv.workRights,
            notes: ''
          };
        }
        S.p86.visaHistory.push({ type: va.type, year: gameYear(), result: 'approved' });
        log('✅ ' + app.name + ' APPROVED. Your new visa: ' + rv.name + ' — ' + rv.workRights + '.');
        realismNotice('Visa approved', 'You are now on a ' + rv.name + ' (' + app.durationYears + ' years). ' + rv.workRights + '.');
      } else {
        va.stage = 'refused';
        S.p86.visaHistory.push({ type: va.type, year: gameYear(), result: 'refused' });
        log('❌ ' + app.name + ' REFUSED. The fee was not refunded.');
        realismNotice('Visa refused', 'Your application for the ' + app.name + ' was refused. You may reapply after addressing the reason.');
      }
      S.p86.visaApp = null;
      save();
    }
  }

  function p86ApprovalChance(key) {
    if (key === 'graduate_route_gbr') return 0.95;
    if (key === 'opt_usa') return 0.92;
    if (key === 'skilled_worker_gbr') {
      if (!S.job || !S.job.visaSponsorship) return 0.05;
      return 0.82;
    }
    return 0.7;
  }

  const p86OrigTick = p52MonthlyTick;
  p52MonthlyTick = function () {
    p86OrigTick.apply(this, arguments);
    try { p86TickVisaApp(); } catch (e) { console.error('[p86 visa tick]', e); }
  };

  /* =================================================================
     6. VISA ACTIONS CARD IN WORLD TAB
     ================================================================= */
  const p86OrigWorld = viewWorld;
  viewWorld = function () {
    let html = p86OrigWorld.apply(this, arguments);
    if (!html || !S) return html;
    if (S.country === S.home) return html;
    if (!S.p81 || !S.p81.visa) return html;

    const v = S.p81.visa;
    let card = '<section class="card" style="border-color:var(--violet)">' +
      '<h3>🛂 Visa actions</h3>' +
      '<div class="row"><span>Current visa</span><b>' + v.name + '</b></div>' +
      '<div class="row"><span>Work rights</span><b style="color:var(--cyan)">' + v.workRights + '</b></div>' +
      (v.expiresYear ? '<div class="row"><span>Expires</span><b>' + v.expiresYear + '</b></div>' : '');

    /* In-progress application */
    if (S.p86 && S.p86.visaApp) {
      const va = S.p86.visaApp;
      const app = P86_VISA_APPS[va.type];
      const stageLabel = { submitted: 'Submitted', biometrics: 'Biometrics done', interview: 'Interview stage' }[va.stage] || va.stage;
      card +=
        '<div style="margin-top:10px;padding:10px;background:rgba(139,92,246,.08);border-radius:8px">' +
        '<b style="font-size:.85rem">📋 ' + (app ? app.name : 'Visa application') + '</b>' +
        '<div class="row" style="padding:3px 0"><span>Stage</span><b>' + stageLabel + '</b></div>' +
        '<div class="row" style="padding:3px 0"><span>Processing</span><b>' + va.processingWeeks + ' weeks</b></div>' +
        '<p class="muted" style="font-size:.72rem;margin-top:4px">The decision will arrive automatically after processing. Check your log.</p>' +
        '</div>';
    } else {
      /* Eligible actions */
      const actions = [];
      if (p86Eligible('graduate_route_gbr')) actions.push('graduate_route_gbr');
      if (p86Eligible('opt_usa')) actions.push('opt_usa');
      if (p86Eligible('skilled_worker_gbr')) actions.push('skilled_worker_gbr');

      if (actions.length) {
        card += '<p class="muted" style="font-size:.78rem;margin-top:10px">You can apply for:</p>';
        actions.forEach(function (key) {
          const app = P86_VISA_APPS[key];
          const feeLabel = app.feeGBP ? '£' + app.feeGBP : '$' + app.feeUSD;
          card +=
            '<button class="btn" style="margin-top:6px;text-align:left" onclick="p86StartVisaApp(\'' + key + '\')">' +
            '📋 ' + app.name +
            '<small>' + app.durationYears + ' yr · ' + feeLabel + ' · ~' + app.processingWeeks + ' weeks</small>' +
            '<small style="color:var(--muted)">' + app.notes + '</small>' +
            '</button>';
        });
      } else {
        card += '<p class="muted" style="font-size:.78rem;margin-top:10px">No visas to apply for right now. Finish your degree, or get a sponsored job offer, or accumulate residence time for PR.</p>';
      }

      /* PR timeline */
      const rules = (typeof p81VisaRulesFor === 'function') ? p81VisaRulesFor(v.country) : null;
      if (rules && rules.pr) {
        const yearsHere = (S.p81 && S.p81.abroadSinceYear > 0) ? (gameYear() - S.p81.abroadSinceYear) : 0;
        card +=
          '<div style="margin-top:14px;padding:10px;background:rgba(52,211,153,.06);border-radius:8px">' +
          '<b style="font-size:.82rem;color:var(--mint)">Path to permanent residence</b>' +
          '<div class="row" style="padding:3px 0"><span>' + rules.pr.name + '</span><b>after ' + rules.pr.afterYears + ' years</b></div>' +
          '<div class="row" style="padding:3px 0"><span>Years in country</span><b>' + yearsHere + '</b></div>' +
          '</div>';
      }
    }
    card += '</section>';

    /* Insert after the passport card */
    const marker = html.indexOf('Your passport and your options');
    if (marker !== -1) {
      const secEnd = html.indexOf('</section>', marker);
      if (secEnd !== -1) {
        const insertAt = secEnd + '</section>'.length;
        html = html.slice(0, insertAt) + card + html.slice(insertAt);
      } else {
        html = card + html;
      }
    } else {
      html = card + html;
    }

    return html;
  };

  /* =================================================================
     7. WORK-VISA VIOLATION CHECK
     ================================================================= */
  function p86CheckWorkVisa() {
    if (!S || !S.job) return;
    if (S.country === S.home) return;
    if (!S.p81 || !S.p81.visa) return;
    const v = S.p81.visa;

    if (v.type === 'student') {
      const hours = (S.job.benefits && S.job.benefits.hours) || 40;
      if (hours >= 35 && !S.job.visaViolationFlagged) {
        S.job.visaViolationFlagged = true;
        log('🚨 VISA VIOLATION: You are working full-time on a ' + v.name + ', which only allows ' + v.workRights + '.');
        realismNotice('Visa violation', 'Working full-time on a student visa is illegal. You must reduce hours, leave the role, or switch to a sponsored work visa.');
        save();
      }
    }
  }

  const p86OrigAgeUp = ageUp;
  ageUp = function () {
    const r = p86OrigAgeUp.apply(this, arguments);
    try { p86CheckWorkVisa(); } catch (e) {}
    return r;
  };

  /* =================================================================
     8. DIAGNOSTICS
     ================================================================= */
  window.p86Diag = function () {
    console.log({
      home: S && S.home,
      country: S && S.country,
      level: S && S.p86 && S.p86.abroadLevel,
      visa: S && S.p81 && S.p81.visa,
      visaApp: S && S.p86 && S.p86.visaApp,
      sponsoredOnly: S && S.p86 && S.p86.showSponsoredOnly,
      applications: S && S.p79 && S.p79.appliedUnis && S.p79.appliedUnis.map(function (a) {
        return a.uni + ' [' + a.level + '] ' + (a.result || 'pending');
      })
    });
  };

  console.log('[p86] Visa system + master\'s fixes + sponsorship filter loaded');
})();
