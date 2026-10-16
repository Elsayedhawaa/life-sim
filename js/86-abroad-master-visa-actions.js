/* =====================================================================
   86. ABROAD MASTER'S + VISA ACTIONS + EDUCATION CLEANUP
   ===================================================================== */

(function p86AbroadMasterVisaActions() {

  /* ---- 1. STATE ---- */
  function p86Init() {
    if (typeof S === 'undefined' || !S) return;
    if (!S.p86) S.p86 = {};
    const d = S.p86;
    if (!Array.isArray(d.masterApplications)) d.masterApplications = [];
    if (typeof d.postStudyVisa !== 'string') d.postStudyVisa = null;
    if (typeof d.naturalizationPending !== 'boolean') d.naturalizationPending = false;
    if (typeof d.workVisaPending !== 'boolean') d.workVisaPending = false;
  }
  p86Init();

  /* ---- 2. Master's university catalog ---- */
  /* Reuse base unis but mark as master's and adjust requirements */
  function p86MasterUnis(countryCode) {
    const base = (typeof P80_INT_UNIS !== 'undefined' && P80_INT_UNIS[countryCode]) || [];
    return base.map(function (u) {
      return {
        n: u.n,
        tier: u.tier,
        req: Math.round((u.req + 0.1) * 10) / 10,   // master's slightly harder
        ielts: u.ielts,
        tuition: Math.round(u.tuition * 1.1),         // master's tuition +10%
        level: 'master'
      };
    });
  }

  /* ---- 3. Master's picker modal ---- */
  window.p86OpenMasterPicker = function (countryCode) {
    if (typeof S === 'undefined' || !S) return;

    /* Default to the country the player is currently in, or UK */
    const activeCountry = countryCode || S.country || 'gbr';
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const bankEGP = Math.round((S.wealth || 0) * rate);
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;

    const unis = p86MasterUnis(activeCountry);
    const schols = (typeof P80_INT_SCHOLARSHIPS !== 'undefined' && P80_INT_SCHOLARSHIPS[activeCountry]) || [];

    const existing = document.getElementById('p86-master-picker');
    if (existing) existing.remove();

    /* Already applied to some in this country? */
    const appliedIn = (S.p86.masterApplications || []).filter(function (a) {
      return a.country === activeCountry;
    });
    const appliedNames = appliedIn.map(function (a) { return a.uni; });

    const countries = Object.keys((typeof P80_INT_UNIS !== 'undefined') ? P80_INT_UNIS : { gbr: 1, usa: 1, deu: 1, can: 1, fra: 1, nld: 1 });

    let html = '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:540px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🎓 Master\'s abroad</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p86-master-picker\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">GPA <b>' + gpa.toFixed(2) + '</b> · IELTS <b>' + (ielts || 'none') + '</b> · Bank <b>E£' + bankEGP.toLocaleString() + '</b></p>' +

      /* Country tabs */
      '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:10px">' +
      countries.map(function (code) {
        const c = (typeof COUNTRIES !== 'undefined' && COUNTRIES[code]) || {};
        const sel = code === activeCountry;
        return '<button class="btn ' + (sel ? 'sel' : '') + '" style="margin:0;padding:5px;font-size:.7rem;flex:1;min-width:60px" onclick="p86OpenMasterPicker(\'' + code + '\')">' +
          (c.f || '') + ' ' + (c.n || code) + '</button>';
      }).join('') +
      '</div>' +

      '<h4 style="font-size:.85rem;color:var(--cyan);margin-top:14px">Master\'s programs in ' + ((typeof COUNTRIES !== 'undefined' && COUNTRIES[activeCountry] && COUNTRIES[activeCountry].n) || activeCountry) + '</h4>';

    /* Universities */
    if (!unis.length) {
      html += '<p class="muted" style="font-size:.8rem">No master\'s programs listed for this country.</p>';
    } else {
      unis.forEach(function (uni, i) {
        const tuitionEGP = Math.round(uni.tuition * 52.7 * ((typeof p80Idx === 'function') ? p80Idx() : 1));
        const eligible = gpa >= uni.req && ielts >= uni.ielts;
        const alreadyApplied = appliedNames.indexOf(uni.n) !== -1;

        html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
          '<b style="font-size:.86rem">' + uni.n + '</b> <span class="muted" style="font-size:.7rem">· Tier ' + uni.tier + '</span>' +
          '<div class="row" style="border:0;padding:2px 0;font-size:.76rem"><span>Tuition/year</span><b class="mono">' + (uni.tuition === 0 ? 'FREE' : 'E£' + tuitionEGP.toLocaleString()) + '</b></div>' +
          '<div class="row" style="border:0;padding:2px 0;font-size:.76rem"><span>Requires</span><b>GPA ' + uni.req + '+ · IELTS ' + uni.ielts + '+</b></div>';

        if (alreadyApplied) {
          html += '<p style="color:var(--amber);font-size:.74rem;margin-top:6px">⏳ Master\'s application submitted</p>';
        } else if (eligible) {
          html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;margin-top:8px">' +
            '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p86ApplyMaster(\'' + activeCountry + '\',' + i + ',\'self\')">Self</button>' +
            '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p86ApplyMaster(\'' + activeCountry + '\',' + i + ',\'scholarship\')">Scholarship</button>' +
            '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p86ApplyMaster(\'' + activeCountry + '\',' + i + ',\'parents\')">Family</button>' +
            '</div>';
        } else {
          html += '<p style="color:var(--rose);font-size:.72rem;margin-top:6px">' +
            (gpa < uni.req ? '❌ GPA ' + gpa.toFixed(2) + ' < ' + uni.req + '. ' : '') +
            (ielts < uni.ielts ? '❌ IELTS ' + (ielts || 'none') + ' < ' + uni.ielts + '.' : '') +
            '</p>';
        }
        html += '</div>';
      });
    }

    /* Scholarships */
    if (schols.length) {
      html += '<h4 style="font-size:.85rem;color:var(--cyan);margin-top:14px">Scholarships</h4>';
      schols.forEach(function (s) {
        const ok = gpa >= s.reqGpa && ielts >= s.reqIelts;
        html += '<div style="margin-top:6px;padding:8px;border-left:3px solid ' + (ok ? 'var(--mint)' : 'var(--line)') + ';background:rgba(255,255,255,.02);border-radius:4px">' +
          '<b style="font-size:.78rem">' + s.name + '</b> <span style="color:var(--mint);font-size:.7rem">· ' + Math.round(s.cover * 100) + '%</span>' +
          '<div class="muted" style="font-size:.7rem;margin-top:2px">GPA ' + s.reqGpa + '+ · IELTS ' + s.reqIelts + '+</div>' +
          (ok ? '<div style="color:var(--mint);font-size:.72rem;margin-top:3px">✓ You qualify</div>' : '') +
          '</div>';
      });
    }

    /* Already applied section */
    const pending = appliedIn.filter(function (a) { return !a.resolved; });
    if (pending.length) {
      html += '<h4 style="font-size:.85rem;color:var(--amber);margin-top:14px">Pending applications</h4>';
      pending.forEach(function (a) {
        html += '<div style="margin-top:6px;padding:8px;background:rgba(251,191,36,.06);border-left:3px solid var(--amber);border-radius:4px;font-size:.78rem">' +
          '<b>' + a.uni + '</b> · ' + a.funding +
          '<div class="muted" style="font-size:.72rem;margin-top:2px">Decision pending</div>' +
          '</div>';
      });
    }

    html += '</div>';

    const modal = document.createElement('div');
    modal.id = 'p86-master-picker';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    modal.innerHTML = html;
    document.body.appendChild(modal);
  };

  /* ---- 4. Apply for master's ---- */
  window.p86ApplyMaster = function (countryCode, uniIndex, fundingType) {
    if (typeof S === 'undefined' || !S) return;
    p86Init();
    const unis = p86MasterUnis(countryCode);
    const uni = unis[uniIndex];
    if (!uni) return hint('University not found.');

    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    if (gpa < uni.req) return hint('GPA too low: needs ' + uni.req + '+');
    if (ielts < uni.ielts) return hint('IELTS too low: needs ' + uni.ielts + '+');

    /* Application fee */
    const feeEGP = Math.round(150 * 52.7 * ((typeof p80Idx === 'function') ? p80Idx() : 1));
    const internal = feeEGP / ((typeof p80Rate === 'function') ? p80Rate() : 52.7);
    if (S.wealth < internal) return hint('Application fee is E£' + feeEGP.toLocaleString());

    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;

    /* Compute year-1 cost */
    const year1CostEGP = (typeof p80Year1CostAbroad === 'function') ? p80Year1CostAbroad(countryCode, uni.tuition) : feeEGP * 20;

    S.p86.masterApplications.push({
      id: 'master_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      uni: uni.n,
      country: countryCode,
      level: 'master',
      funding: fundingType,
      gpaAtApply: gpa,
      ieltsAtApply: ielts,
      reqGpa: uni.req,
      reqIelts: uni.ielts,
      tuitionUSD: uni.tuition,
      year1CostEGP: year1CostEGP,
      appliedYear: (typeof gameYear === 'function') ? gameYear() : 2026,
      appliedAbs: S.pacingAbsoluteMonth || 0,
      resolveAfterMonths: 3,
      resolved: false,
      result: null
    });

    if (typeof log === 'function') log('📤 Applied to ' + uni.n + ' (' + countryCode.toUpperCase() + ') for Master\'s · ' + fundingType + '. Fee: E£' + feeEGP.toLocaleString() + '.');
    if (typeof realismNotice === 'function') realismNotice('Master\'s application submitted', uni.n + ' — ' + fundingType + '. Decision expected in ~3 months.');

    /* Close and re-render */
    const modal = document.getElementById('p86-master-picker');
    if (modal) modal.remove();
    if (typeof hint === 'function') hint();
    if (typeof render === 'function') render();
  };

  /* ---- 5. Resolve master's applications every month ---- */
  function p86ResolveMasters() {
    if (typeof S === 'undefined' || !S) return;
    p86Init();
    const absMonth = S.pacingAbsoluteMonth || 0;
    let changed = false;

    S.p86.masterApplications.forEach(function (app) {
      if (!app || app.resolved) return;
      const readyAbs = app.appliedAbs + (app.resolveAfterMonths || 3);
      if (absMonth < readyAbs) return;

      const gpaDelta = app.gpaAtApply - app.reqGpa;
      const ieltsDelta = app.ieltsAtApply - app.reqIelts;
      let chance = 0.30 + gpaDelta * 0.5 + ieltsDelta * 0.1;
      if (app.reqGpa >= 3.5) chance -= 0.15;
      chance = Math.max(0.05, Math.min(0.9, chance));

      if (Math.random() > chance) {
        app.resolved = true;
        app.result = 'rejected';
        if (typeof log === 'function') log('❌ ' + app.uni + ' rejected your Master\'s application.');
        changed = true;
        return;
      }

      /* Admitted — decide funding */
      if (app.funding === 'self') {
        const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
        const bank = Math.round((S.wealth || 0) * rate);
        if (bank < app.year1CostEGP) {
          app.resolved = true;
          app.result = 'admitted-no-funds';
          if (typeof log === 'function') log('⚠️ Admitted to ' + app.uni + ' for Master\'s but you cannot afford year 1.');
        } else {
          app.resolved = true;
          app.result = 'admitted-self';
          if (typeof log === 'function') log('✅ Admitted to ' + app.uni + ' Master\'s! Self-funded.');
        }
      } else if (app.funding === 'parents') {
        const tier = (S.p76 && S.p76.wealthLevel) || 0;
        const agreeChance = tier >= 4 ? 0.9 : tier >= 3 ? 0.55 : 0.15;
        if (Math.random() < agreeChance) {
          app.resolved = true;
          app.result = 'admitted-parents';
          if (typeof log === 'function') log('✅ Admitted to ' + app.uni + ' Master\'s! Parents agreed to fund.');
        } else {
          app.resolved = true;
          app.result = 'admitted-no-funds';
          if (typeof log === 'function') log('⚠️ Admitted but parents declined to fund.');
        }
      } else {
        /* Scholarship */
        const schols = (typeof P80_INT_SCHOLARSHIPS !== 'undefined' && P80_INT_SCHOLARSHIPS[app.country]) || [];
        const target = schols.find(function (s) {
          return app.gpaAtApply >= s.reqGpa && app.ieltsAtApply >= s.reqIelts;
        });
        if (target && Math.random() < target.chance + gpaDelta * 0.05) {
          app.resolved = true;
          app.result = 'admitted-scholarship';
          app.scholarship = target.name;
          app.cover = target.cover;
          if (typeof log === 'function') log('🏆 Admitted to ' + app.uni + ' Master\'s with ' + target.name + '!');
        } else {
          app.resolved = true;
          app.result = 'admitted-no-funds';
          if (typeof log === 'function') log('⚠️ Admitted but no scholarship was awarded.');
        }
      }
      changed = true;
    });

    if (changed && typeof save === 'function') save();
  }

  /* Tick every monthly step */
  try {
    const origMonthly = window.p52MonthlyTick;
    window.p52MonthlyTick = function () {
      origMonthly.apply(this, arguments);
      p86ResolveMasters();
    };
  } catch (e) {}

  /* Also run on yearly age-up */
  try {
    const origAge = ageUp;
    ageUp = function () {
      const r = origAge.apply(this, arguments);
      p86ResolveMasters();
      return r;
    };
  } catch (e) {}

  /* Run on load */
  setTimeout(p86ResolveMasters, 1200);

  /* ---- 6. Visa actions for abroad players ---- */
  function p86BuildVisaActionsCard() {
    if (typeof S === 'undefined' || !S) return '';
    if (S.country === S.home) return '';
    const visa = S.p81 && S.p81.visa;
    if (!visa) return '';

    const hostName = ((typeof COUNTRIES !== 'undefined' && COUNTRIES[S.country] && COUNTRIES[S.country].n) || S.country);
    const yearsAbroad = (S.p81 && S.p81.abroadSinceYear > 0) ? (gameYear() - S.p81.abroadSinceYear) : 0;
    const graduated = !!(S.p69 && S.p69.enrolled === null && (S.degree || S.mastDone));

    let html = '<section class="card" style="border-color:var(--violet)"><h3>🛂 Visa actions</h3>' +
      '<div class="row"><span>Current visa</span><b>' + visa.name + '</b></div>' +
      '<div class="row"><span>Work rights</span><b style="color:var(--cyan)">' + visa.workRights + '</b></div>' +
      '<div class="row"><span>Expires</span><b>' + (visa.expiresYear || '—') + '</b></div>';

    /* Post-study work visa */
    if (visa.type === 'student') {
      const rules = (typeof P81_VISA_RULES !== 'undefined' && P81_VISA_RULES[S.country]) || null;
      const psName = rules && rules.postStudy ? rules.postStudy.name : 'Post-study work visa';

      if (!graduated) {
        html += '<div style="margin-top:10px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
          '<b style="font-size:.82rem">Post-study work visa</b>' +
          '<p class="muted" style="font-size:.78rem;margin-top:4px">You must complete your degree before applying. Finish your program first.</p>' +
          '</div>';
      } else if (S.p86.postStudyVisa) {
        html += '<div style="margin-top:10px;padding:10px;background:rgba(52,211,153,.08);border-left:3px solid var(--mint);border-radius:8px">' +
          '<b style="font-size:.82rem;color:var(--mint)">✓ You hold ' + S.p86.postStudyVisa + '</b>' +
          '<p class="muted" style="font-size:.78rem;margin-top:4px">Full-time work without employer sponsorship, for the duration of the visa.</p>' +
          '</div>';
      } else {
        html += '<div style="margin-top:10px;padding:10px;background:rgba(139,92,246,.08);border-radius:8px">' +
          '<b style="font-size:.82rem">Post-study work visa</b>' +
          '<p class="muted" style="font-size:.78rem;margin-top:4px">You graduated. Apply for ' + psName + ' to work full-time for up to ' + (rules && rules.postStudy ? rules.postStudy.durationYears : 2) + ' year(s) without sponsorship.</p>' +
          '<button class="btn" style="margin-top:6px;background:var(--violet);color:#fff;font-weight:700" onclick="p86ApplyPostStudy()">Apply for ' + psName + '</button>' +
          '</div>';
      }
    }

    /* Employer sponsorship → Skilled Worker */
    const longTerm = (typeof P81_VISA_RULES !== 'undefined' && P81_VISA_RULES[S.country] && P81_VISA_RULES[S.country].longTerm) || null;
    if (longTerm) {
      if (S.p86.workVisaPending) {
        html += '<div style="margin-top:10px;padding:10px;background:rgba(251,191,36,.08);border-left:3px solid var(--amber);border-radius:8px">' +
          '<b style="font-size:.82rem;color:var(--amber)">⏳ ' + longTerm.name + ' — pending</b>' +
          '<p class="muted" style="font-size:.78rem;margin-top:4px">Waiting for an employer offer with sponsorship. Continue applying to sponsored roles in the Career tab.</p>' +
          '</div>';
      } else {
        html += '<div style="margin-top:10px;padding:10px;background:rgba(251,191,36,.08);border-radius:8px">' +
          '<b style="font-size:.82rem">' + longTerm.name + '</b>' +
          '<p class="muted" style="font-size:.78rem;margin-top:4px">Long-term work visa. Requires ' + longTerm.needs + '.</p>' +
          '<button class="btn" style="margin-top:6px" onclick="p86StartWorkVisa()">Start looking for a sponsored role</button>' +
          '</div>';
      }
    }

    /* Naturalization */
    if (visa.type !== 'citizen' && yearsAbroad >= 5) {
      html += '<div style="margin-top:10px;padding:10px;background:rgba(52,211,153,.08);border-radius:8px">' +
        '<b style="font-size:.82rem">Naturalization in ' + hostName + '</b>' +
        '<p class="muted" style="font-size:.78rem;margin-top:4px">You have lived here ' + yearsAbroad + ' years. You may be eligible to apply for permanent residence and eventually citizenship.</p>' +
        '<button class="btn" style="margin-top:6px" onclick="p86ApplyNaturalization()">Apply for naturalization</button>' +
        '</div>';
    } else if (visa.type !== 'citizen') {
      const yearsNeeded = Math.max(0, 5 - yearsAbroad);
      html += '<p class="muted" style="font-size:.78rem;margin-top:10px">Naturalization in ' + hostName + ' typically requires ' + yearsNeeded + ' more year(s) of legal residence with permanent status.</p>';
    }

    /* Return home */
    html += '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">' +
      '<b style="font-size:.82rem">Return home to Egypt</b>' +
      '<p class="muted" style="font-size:.78rem;margin-top:4px">Your degree and any work experience carry back. Your passport stays Egyptian.</p>' +
      '<button class="btn" style="margin-top:6px;border-color:var(--amber)" onclick="p86ReturnHome()">Return home</button>' +
      '</div>';

    html += '</section>';
    return html;
  }

  /* Action handlers */
  window.p86ApplyPostStudy = function () {
    p86Init();
    if (!S || !S.degree) return hint('You need a completed degree.');
    const rules = (typeof P81_VISA_RULES !== 'undefined' && P81_VISA_RULES[S.country]) || null;
    if (!rules || !rules.postStudy) return hint('No post-study option for this country.');
    const name = rules.postStudy.name;

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const feeEGP = 25000;  /* post-study application fee */
    const internal = feeEGP / rate;
    if (S.wealth < internal) return hint('Application fee is E£' + feeEGP.toLocaleString());

    if (!confirm('Apply for the ' + name + '?\n\nCost: E£' + feeEGP.toLocaleString() + '\nDuration: ' + rules.postStudy.durationYears + ' year(s)\nWork rights: ' + rules.postStudy.workRights + '\n\nProceed?')) return;

    S.wealth -= internal;
    S.p86.postStudyVisa = name;
    S.p81.visa = {
      type: 'poststudy',
      name: name,
      country: S.country,
      grantedYear: (typeof gameYear === 'function') ? gameYear() : 2026,
      expiresYear: ((typeof gameYear === 'function') ? gameYear() : 2026) + (rules.postStudy.durationYears || 2),
      workRights: rules.postStudy.workRights,
      notes: 'Full-time work allowed without employer sponsorship.'
    };
    if (typeof log === 'function') log('✅ ' + name + ' granted. You can now work full-time without sponsorship.');
    if (typeof realismNotice === 'function') realismNotice('Post-study visa granted', name + ' — ' + rules.postStudy.workRights);
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p86StartWorkVisa = function () {
    p86Init();
    S.p86.workVisaPending = true;
    if (typeof log === 'function') log('🔍 You started looking for a role that offers employer visa sponsorship. Filter the Career tab by "sponsorship: Yes".');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p86ApplyNaturalization = function () {
    p86Init();
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const feeEGP = 150000;
    const internal = feeEGP / rate;
    if (S.wealth < internal) return hint('Naturalization application costs E£' + feeEGP.toLocaleString());
    if (!confirm('Apply for naturalization?\n\nCost: E£' + feeEGP.toLocaleString() + '\nProcessing: 1-2 years\n\nYou will need to pass a language and citizenship test. Proceed?')) return;
    S.wealth -= internal;
    if (Math.random() < 0.7) {
      const c = (typeof COUNTRIES !== 'undefined' && COUNTRIES[S.country]) || {};
      S.p81.visa = {
        type: 'citizen',
        name: c.n + ' citizenship',
        country: S.country,
        grantedYear: (typeof gameYear === 'function') ? gameYear() : 2026,
        expiresYear: 9999,
        workRights: 'Full citizen rights',
        notes: 'You are now a citizen.'
      };
      if (typeof log === 'function') log('🎉 Naturalization approved! You are now a citizen of ' + (c.n || S.country) + '.');
      if (typeof realismNotice === 'function') realismNotice('Citizenship granted', 'You are now a citizen of ' + (c.n || S.country) + '.');
    } else {
      if (typeof log === 'function') log('❌ Naturalization application rejected. You can reapply next year.');
    }
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p86ReturnHome = function () {
    if (!confirm('Return home to Egypt? Your foreign visa ends.')) return;
    S.country = S.home || 'egy';
    S.p81 = S.p81 || {};
    S.p81.visa = null;
    S.p81.abroadSinceYear = -1;
    if (S.p69) S.p69.enrolled = null;
    if (typeof setWorld === 'function') {
      try { setWorld(S); } catch (e) {}
    }
    if (typeof log === 'function') log('✈️ You returned home to Egypt.');
    if (typeof realismNotice === 'function') realismNotice('Returned home', 'You are back in Egypt. Your foreign visa has ended.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* ---- 7. Inject visa actions card into World tab ---- */
  try {
    const origWorld = viewWorld;
    viewWorld = function () {
      let html = origWorld.apply(this, arguments);
      if (typeof S === 'undefined' || !S) return html;
      if (S.country === S.home) return html;
      const card = p86BuildVisaActionsCard();
      if (!card) return html;
      /* Insert right after the passport section */
      const passportEnd = html.indexOf('A visa application costs money, takes weeks, and is not refunded if refused.');
      if (passportEnd !== -1) {
        const closeIdx = html.indexOf('</section>', passportEnd);
        if (closeIdx !== -1) {
          return html.slice(0, closeIdx + 10) + card + html.slice(closeIdx + 10);
        }
      }
      return card + html;
    };
  } catch (e) { console.warn('[p86] viewWorld wrap failed:', e); }

  /* ---- 8. Education tab: if graduated abroad, show master's picker prominently ---- */
  try {
    const origSchool = viewSchool;
    viewSchool = function () {
      let html = origSchool.apply(this, arguments);
      if (typeof S === 'undefined' || !S) return html;
      if (S.country === S.home) return html;
      if (!S.degree) return html;  /* not graduated yet */

      /* If graduated abroad, inject a "Master's options" card at the top of the education tab */
      const masterCard =
        '<section class="card" style="border-color:var(--mint);padding:14px">' +
        '<div style="font-size:1.05rem;font-weight:700;margin-bottom:6px">🎓 Master\'s opportunities</div>' +
        '<p class="muted" style="font-size:.82rem;margin-bottom:10px">You have a bachelor\'s degree. You can now apply for a master\'s program in any country.</p>' +
        '<button class="btn" style="width:100%;text-align:center;background:var(--violet);color:#fff;font-weight:700" onclick="p86OpenMasterPicker()">Open master\'s picker →</button>' +
        '<button class="btn" style="width:100%;text-align:center;margin-top:8px" onclick="p86OpenMasterPicker(\'egy\')">🇪🇬 Local master\'s in Egypt</button>' +
        '</section>';

      /* Only if not already shown */
      if (html.indexOf('Master\'s opportunities') === -1) {
        /* Insert near the top, after the status card */
        const firstSectionEnd = html.indexOf('</section>');
        if (firstSectionEnd !== -1) {
          html = html.slice(0, firstSectionEnd + 10) + masterCard + html.slice(firstSectionEnd + 10);
        } else {
          html = masterCard + html;
        }
      }

      /* Remove the "You are living in United Kingdom ... not enrolled" card since the picker is now shown */
      html = html.replace(
        /<section class="card"[^>]*>\s*<h3>🌍 You are living in[^<]*<\/h3>[\s\S]*?not currently enrolled[\s\S]*?<\/section>/g,
        ''
      );

      return html;
    };
  } catch (e) { console.warn('[p86] viewSchool wrap failed:', e); }

  /* ---- 9. Diagnostics ---- */
  window.p86Diag = function () {
    console.log({
      home: S && S.home,
      country: S && S.country,
      visa: S && S.p81 && S.p81.visa && S.p81.visa.name,
      visaType: S && S.p81 && S.p81.visa && S.p81.visa.type,
      degree: S && S.degree,
      gradYear: S && S.p49 && S.p49.graduationYear,
      masterApps: S && S.p86 && S.p86.masterApplications && S.p86.masterApplications.length,
      postStudyVisa: S && S.p86 && S.p86.postStudyVisa
    });
  };

  console.log('[p86] Master\'s abroad + visa actions loaded');
})();
