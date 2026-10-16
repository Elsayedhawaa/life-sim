/* =====================================================================
   79. CONSISTENCY FIX v3 — pure DOM approach, no wrappers
   - Sets S.salary (not just S.job.salary) for family business
   - Rewrites broken buttons via DOM walker
   - Removes duplicate cards by DOM walker
   - Fixes E£0/yr salary display
   - Includes its own modal functions
   Load AFTER 78-reality-fix.js and BEFORE 99-boot.js
   ===================================================================== */

console.log('[p79] v3 loading...');

(function() {
  'use strict';

  /* =================================================================
     1. SALARY SYNC — set ALL the places the game might read from
     ================================================================= */
  function syncSalary() {
    if (typeof S === 'undefined' || !S) return;
    if (!S.p77 || !S.p77.worksForFamily) return;

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const rev = Number(S.p77.familyBusinessRevenue) || 0;
    const salary = rev * 0.03;

    /* Set every possible place the game might read salary from */
    S.salary = salary;
    S.p77.familySalary = salary;
    S.p77.familySalaryEGP = Math.round(salary * rate);
    if (S.job && S.job.isFamilyBusiness) {
      S.job.salary = salary;
    }
  }
  setInterval(syncSalary, 500);
  setTimeout(syncSalary, 100);

  /* =================================================================
     2. GLOBAL MODALS
     ================================================================= */
  window.p79OpenLocalMaster = function () {
    if (typeof S === 'undefined' || !S) return;
    const existing = document.getElementById('p79-local-master-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'p79-local-master-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    modal.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:540px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🎓 Local Master\'s in Egypt</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p79-local-master-modal\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">Pick a university and subject. Public: 25k–70k EGP/yr. Private: 85k–200k EGP/yr. Duration 1–2 years.</p>' +

      '<label class="muted" style="font-size:.8rem;display:block;margin-top:10px">University</label>' +
      '<select id="p79-lm-uni" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<optgroup label="Public">' +
      '<option value="cairo|public">Cairo University</option>' +
      '<option value="ain-shams|public">Ain Shams University</option>' +
      '<option value="alexandria|public">Alexandria University</option>' +
      '<option value="mansoura|public">Mansoura University</option>' +
      '</optgroup>' +
      '<optgroup label="Private">' +
      '<option value="auc|private">American University in Cairo (AUC)</option>' +
      '<option value="guc|private">German University in Cairo (GUC)</option>' +
      '<option value="bue|private">British University in Egypt (BUE)</option>' +
      '<option value="aastmt|private">Arab Academy for Science & Technology</option>' +
      '<option value="miu|private">Misr International University (MIU)</option>' +
      '</optgroup>' +
      '</select>' +

      '<label class="muted" style="font-size:.8rem;display:block;margin-top:8px">Subject</label>' +
      '<select id="p79-lm-field" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<option value="mba">MBA — Business Administration</option>' +
      '<option value="msc-fin">MSc Accounting & Finance</option>' +
      '<option value="msc-econ">MSc Economics</option>' +
      '<option value="msc-cs">MSc Computer Science</option>' +
      '<option value="mph">Master of Public Health</option>' +
      '<option value="llm">LLM — Law</option>' +
      '<option value="msc-eng">MSc Engineering</option>' +
      '<option value="msc-med">MSc Medical Sciences</option>' +
      '</select>' +

      '<label class="muted" style="font-size:.8rem;display:block;margin-top:8px">Funding</label>' +
      '<select id="p79-lm-fund" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<option value="self">Pay myself</option>' +
      '<option value="parents">Ask parents</option>' +
      '<option value="partial">Compete for 50% scholarship</option>' +
      '<option value="scholar">Compete for full scholarship</option>' +
      '</select>' +

      '<button class="btn" style="margin-top:14px;width:100%;text-align:center;background:var(--mint);color:#000;font-weight:700" onclick="p79SubmitLocalMaster()">Apply for master\'s</button>' +
      '</div>';
    document.body.appendChild(modal);
  };

  window.p79SubmitLocalMaster = function () {
    const uniEl = document.getElementById('p79-lm-uni');
    const fieldEl = document.getElementById('p79-lm-field');
    const fundEl = document.getElementById('p79-lm-fund');
    if (!uniEl || !fieldEl || !fundEl) return;
    const parts = uniEl.value.split('|');
    const uniName = uniEl.options[uniEl.selectedIndex].text;
    const fieldName = fieldEl.options[fieldEl.selectedIndex].text;
    const fundLabel = fundEl.options[fundEl.selectedIndex].text;

    S.localMast = {
      universityId: parts[0],
      universityName: uniName,
      kind: parts[1],
      fieldId: fieldEl.value,
      fieldName: fieldName,
      funding: fundEl.value,
      fundingLabel: fundLabel,
      year: 0,
      yearsTotal: 2,
      startYear: (typeof gameYear === 'function') ? gameYear() : 2026
    };

    if (typeof log === 'function') log('🎓 Enrolled at ' + uniName + ' — ' + fieldName + '. Funding: ' + fundLabel + '.');
    if (typeof realismNotice === 'function') realismNotice('Local master\'s started', uniName + ' — ' + fieldName + '.');

    const m = document.getElementById('p79-local-master-modal');
    if (m) m.remove();
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p79OpenStudyAbroad = function () {
    if (typeof S === 'undefined' || !S) return;
    const existing = document.getElementById('p79-abroad-modal');
    if (existing) existing.remove();

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex((typeof gameYear === 'function') ? gameYear() : 2026) : 1;
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    const bankEGP = Math.round((S.wealth || 0) * rate);
    const level = S.degree ? 'master' : 'bachelor';

    const countries = [
      { code: 'gbr', flag: '🇬🇧', name: 'United Kingdom', costUSD: 28000 + 15000 + 0 + 490 + 650 + 1000 },
      { code: 'usa', flag: '🇺🇸', name: 'United States', costUSD: 44000 + 18000 + 0 + 185 + 1100 + 1500 },
      { code: 'deu', flag: '🇩🇪', name: 'Germany', costUSD: 0 + 11500 + 11208 + 75 + 590 + 800 },
      { code: 'fra', flag: '🇫🇷', name: 'France', costUSD: 3000 + 10500 + 0 + 100 + 620 + 800 },
      { code: 'can', flag: '🇨🇦', name: 'Canada', costUSD: 25000 + 16000 + 14000 + 150 + 1000 + 1200 },
      { code: 'nld', flag: '🇳🇱', name: 'Netherlands', costUSD: 15000 + 12500 + 0 + 210 + 640 + 900 },
      { code: 'aus', flag: '🇦🇺', name: 'Australia', costUSD: 30000 + 20000 + 0 + 710 + 1350 + 1200 },
      { code: 'ita', flag: '🇮🇹', name: 'Italy', costUSD: 2900 + 9500 + 0 + 90 + 580 + 700 },
      { code: 'jpn', flag: '🇯🇵', name: 'Japan', costUSD: 5000 + 12000 + 0 + 60 + 850 + 900 },
      { code: 'kor', flag: '🇰🇷', name: 'South Korea', costUSD: 6000 + 11000 + 0 + 60 + 850 + 900 },
      { code: 'sgp', flag: '🇸🇬', name: 'Singapore', costUSD: 28000 + 16000 + 0 + 90 + 950 + 1000 },
      { code: 'sau', flag: '🇸🇦', name: 'Saudi Arabia', costUSD: 8000 + 11000 + 0 + 200 + 340 + 700 },
      { code: 'uae', flag: '🇦🇪', name: 'UAE', costUSD: 32000 + 14000 + 0 + 250 + 300 + 800 }
    ];

    const rows = countries.map(function (c) {
      const costEGP = Math.round(c.costUSD * 52.7 * idx);
      const afford = bankEGP >= costEGP;
      return '<div style="margin-top:8px;padding:10px;border:1px solid #2a2a3a;border-radius:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px">' +
        '<div><b>' + c.flag + ' ' + c.name + '</b>' +
        '<div class="muted" style="font-size:.72rem;margin-top:2px">Year 1 from E£' + costEGP.toLocaleString() + '</div>' +
        '</div>' +
        '<button class="btn" style="margin:0;padding:6px 12px;font-size:.72rem" onclick="p79ShowCountryUnis(\'' + c.code + '\',\'' + c.name + '\')">See universities</button>' +
        '</div>' +
        (afford ? '<div style="color:var(--mint);font-size:.72rem;margin-top:4px">✓ Affordable</div>' :
                  '<div style="color:var(--rose);font-size:.72rem;margin-top:4px">Short E£' + (costEGP - bankEGP).toLocaleString() + '</div>') +
        '</div>';
    }).join('');

    const modal = document.createElement('div');
    modal.id = 'p79-abroad-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    modal.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🌍 Study abroad — ' + (level === 'master' ? 'Master\'s' : 'Bachelor\'s') + '</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p79-abroad-modal\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">GPA <b>' + gpa.toFixed(2) + '</b> · IELTS <b>' + (ielts || 'none') + '</b> · Bank <b>E£' + bankEGP.toLocaleString() + '</b></p>' +
      rows +
      '</div>';
    document.body.appendChild(modal);
  };

  window.p79ShowCountryUnis = function (code, countryName) {
    const UNIS = {
      gbr: [
        { n: 'University of Oxford', gpa: 3.8, ielts: 7.5, tuitionUSD: 28000 },
        { n: 'University of Cambridge', gpa: 3.8, ielts: 7.5, tuitionUSD: 28000 },
        { n: 'Imperial College London', gpa: 3.6, ielts: 7.0, tuitionUSD: 32000 },
        { n: 'LSE', gpa: 3.7, ielts: 7.0, tuitionUSD: 30000 },
        { n: 'UCL', gpa: 3.5, ielts: 7.0, tuitionUSD: 28000 },
        { n: 'KCL', gpa: 3.3, ielts: 6.5, tuitionUSD: 26000 },
        { n: 'Edinburgh', gpa: 3.3, ielts: 6.5, tuitionUSD: 24000 },
        { n: 'Manchester', gpa: 3.1, ielts: 6.5, tuitionUSD: 22000 }
      ],
      usa: [
        { n: 'MIT', gpa: 3.9, ielts: 7.5, tuitionUSD: 55000 },
        { n: 'Harvard', gpa: 3.9, ielts: 7.5, tuitionUSD: 55000 },
        { n: 'Stanford', gpa: 3.9, ielts: 7.5, tuitionUSD: 55000 },
        { n: 'Yale', gpa: 3.8, ielts: 7.0, tuitionUSD: 52000 },
        { n: 'Princeton', gpa: 3.8, ielts: 7.0, tuitionUSD: 52000 },
        { n: 'Columbia', gpa: 3.7, ielts: 7.0, tuitionUSD: 55000 },
        { n: 'UC Berkeley', gpa: 3.6, ielts: 7.0, tuitionUSD: 44000 },
        { n: 'UCLA', gpa: 3.5, ielts: 7.0, tuitionUSD: 42000 }
      ],
      deu: [
        { n: 'TUM', gpa: 3.6, ielts: 6.5, tuitionUSD: 0 },
        { n: 'Heidelberg', gpa: 3.5, ielts: 6.5, tuitionUSD: 0 },
        { n: 'RWTH Aachen', gpa: 3.4, ielts: 6.5, tuitionUSD: 0 },
        { n: 'FU Berlin', gpa: 3.1, ielts: 6.0, tuitionUSD: 0 }
      ],
      fra: [
        { n: 'Sorbonne', gpa: 3.5, ielts: 6.5, tuitionUSD: 3000 },
        { n: 'Sciences Po', gpa: 3.6, ielts: 7.0, tuitionUSD: 14000 },
        { n: 'HEC Paris', gpa: 3.7, ielts: 7.0, tuitionUSD: 22000 },
        { n: 'Polytechnique', gpa: 3.7, ielts: 6.5, tuitionUSD: 8000 }
      ],
      can: [
        { n: 'University of Toronto', gpa: 3.6, ielts: 6.5, tuitionUSD: 35000 },
        { n: 'McGill', gpa: 3.5, ielts: 6.5, tuitionUSD: 25000 },
        { n: 'UBC', gpa: 3.5, ielts: 6.5, tuitionUSD: 32000 },
        { n: 'Waterloo', gpa: 3.5, ielts: 6.5, tuitionUSD: 28000 }
      ],
      nld: [
        { n: 'TU Delft', gpa: 3.5, ielts: 6.5, tuitionUSD: 18000 },
        { n: 'Univ. of Amsterdam', gpa: 3.4, ielts: 6.5, tuitionUSD: 16000 },
        { n: 'Utrecht', gpa: 3.3, ielts: 6.5, tuitionUSD: 15000 }
      ],
      aus: [
        { n: 'Melbourne', gpa: 3.5, ielts: 6.5, tuitionUSD: 32000 },
        { n: 'Sydney', gpa: 3.4, ielts: 6.5, tuitionUSD: 34000 },
        { n: 'ANU', gpa: 3.4, ielts: 6.5, tuitionUSD: 30000 }
      ],
      ita: [
        { n: 'Bologna', gpa: 3.3, ielts: 6.0, tuitionUSD: 3000 },
        { n: 'Politecnico Milano', gpa: 3.4, ielts: 6.0, tuitionUSD: 3500 },
        { n: 'Sapienza Rome', gpa: 3.3, ielts: 6.0, tuitionUSD: 2900 }
      ],
      jpn: [
        { n: 'Univ. of Tokyo', gpa: 3.6, ielts: 6.5, tuitionUSD: 5000 },
        { n: 'Kyoto', gpa: 3.5, ielts: 6.5, tuitionUSD: 5000 },
        { n: 'Osaka', gpa: 3.3, ielts: 6.0, tuitionUSD: 5000 }
      ],
      kor: [
        { n: 'Seoul National', gpa: 3.5, ielts: 6.5, tuitionUSD: 6000 },
        { n: 'KAIST', gpa: 3.6, ielts: 6.5, tuitionUSD: 6000 },
        { n: 'Yonsei', gpa: 3.3, ielts: 6.0, tuitionUSD: 8000 }
      ],
      sgp: [
        { n: 'NUS', gpa: 3.7, ielts: 6.5, tuitionUSD: 30000 },
        { n: 'NTU', gpa: 3.6, ielts: 6.5, tuitionUSD: 28000 }
      ],
      sau: [
        { n: 'King Fahd', gpa: 3.3, ielts: 6.0, tuitionUSD: 8000 },
        { n: 'KAUST', gpa: 3.6, ielts: 6.5, tuitionUSD: 12000 }
      ],
      uae: [
        { n: 'NYU Abu Dhabi', gpa: 3.8, ielts: 7.0, tuitionUSD: 55000 },
        { n: 'AUS', gpa: 3.3, ielts: 6.5, tuitionUSD: 32000 }
      ]
    };
    const list = UNIS[code] || [];
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex((typeof gameYear === 'function') ? gameYear() : 2026) : 1;
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    const bankEGP = Math.round((S.wealth || 0) * rate);
    const level = S.degree ? 'master' : 'bachelor';

    const rows = list.map(function (u, i) {
      const requiredGpa = level === 'master' ? u.gpa + 0.1 : u.gpa;
      const gpaOK = gpa >= requiredGpa;
      const ieltsOK = ielts >= u.ielts;
      const tuitionEGP = Math.round(u.tuitionUSD * 52.7 * idx);
      const canApply = gpaOK && ieltsOK;
      return '<div style="margin-top:10px;padding:10px;border:1px solid #2a2a3a;border-radius:8px">' +
        '<b>' + u.n + '</b>' +
        '<div class="row" style="border:0;padding:2px 0;font-size:.78rem"><span>Tuition/year</span><b class="mono">' + (u.tuitionUSD === 0 ? 'FREE' : 'E£' + tuitionEGP.toLocaleString()) + '</b></div>' +
        '<div class="row" style="border:0;padding:2px 0;font-size:.78rem"><span>Needs</span><b>GPA ' + requiredGpa.toFixed(2) + '+ · IELTS ' + u.ielts + '+</b></div>' +
        (canApply
          ? '<button class="btn" style="margin-top:6px;width:100%;text-align:center" onclick="p79ApplyAbroadSubmit(\'' + code + '\',\'' + u.n + '\',' + requiredGpa + ',' + u.ielts + ',' + u.tuitionUSD + ')">Apply</button>'
          : '<p style="color:var(--rose);font-size:.72rem;margin-top:5px">' +
            (!gpaOK ? '❌ GPA ' + gpa.toFixed(2) + ' < ' + requiredGpa.toFixed(2) + '. ' : '') +
            (!ieltsOK ? '❌ IELTS ' + (ielts || 'none') + ' < ' + u.ielts + '.' : '') +
            '</p>') +
        '</div>';
    }).join('');

    const m = document.getElementById('p79-abroad-modal');
    if (!m) return;
    m.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🌍 ' + countryName + '</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p79-abroad-modal\').remove()">✕</button>' +
      '</div>' +
      rows +
      '<button class="btn" style="margin-top:14px;width:100%;text-align:center" onclick="p79OpenStudyAbroad()">← Back to countries</button>' +
      '</div>';
  };

  window.p79ApplyAbroadSubmit = function (code, uniName, requiredGpa, requiredIelts, tuitionUSD) {
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex((typeof gameYear === 'function') ? gameYear() : 2026) : 1;
    const feeEGP = Math.round(100 * 52.7 * idx);
    const internal = feeEGP / rate;
    if (S.wealth < internal) return typeof hint === 'function' ? hint('Application fee: E£' + feeEGP.toLocaleString()) : null;
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;

    S.p79 = S.p79 || {};
    S.p79.appliedUnis = S.p79.appliedUnis || [];
    S.p79.appliedUnis.push({
      uni: uniName,
      country: code,
      level: S.degree ? 'master' : 'bachelor',
      funding: 'self',
      appliedYear: (typeof gameYear === 'function') ? gameYear() : 2026,
      appliedAbs: S.pacingAbsoluteMonth || 0,
      resolveAfterMonths: 2,
      resolved: false,
      result: null,
      reqGpa: requiredGpa,
      reqIelts: requiredIelts,
      tuitionUSD: tuitionUSD,
      year1CostEGP: Math.round((tuitionUSD + 15000) * 52.7 * idx)
    });

    if (typeof log === 'function') log('📤 Applied to ' + uniName + ' — ' + (S.degree ? 'Master\'s' : 'Bachelor\'s') + '. Fee: E£' + feeEGP.toLocaleString() + '.');
    if (typeof realismNotice === 'function') realismNotice('Application submitted', uniName);
    const m = document.getElementById('p79-abroad-modal');
    if (m) m.remove();
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* Replace the old broken handler globally */
  window.p75ToggleStudyAbroad = window.p79OpenStudyAbroad;
  window.p68ApplyLocalMaster = window.p79SubmitLocalMaster;

  /* =================================================================
     3. DOM FIXER — runs every 400ms on the actual rendered HTML
     ================================================================= */
  function domFix() {
    if (typeof S === 'undefined' || !S) return;
    const view = document.getElementById('view');
    if (!view) return;

    /* ---- 3a. Fix broken buttons by DOM walker ---- */
    view.querySelectorAll('button').forEach(function (btn) {
      const txt = (btn.textContent || '');
      const oc = btn.getAttribute('onclick') || '';

      /* "Study abroad" buttons */
      if (txt.indexOf('Study abroad') !== -1) {
        if (oc.indexOf('p79OpenStudyAbroad') === -1) {
          btn.setAttribute('onclick', 'p79OpenStudyAbroad()');
        }
      }

      /* "Consider master's" / "Consider local master's" buttons */
      if (txt.indexOf('Consider master') !== -1 || txt.indexOf('Consider local master') !== -1) {
        if (oc.indexOf('p79OpenLocalMaster') === -1) {
          btn.setAttribute('onclick', 'p79OpenLocalMaster()');
        }
      }

      /* The inline "Apply for local master's" button — route to our modal */
      if (txt.indexOf('Apply for local master') !== -1) {
        if (oc.indexOf('p79OpenLocalMaster') === -1 && oc.indexOf('p79SubmitLocalMaster') === -1) {
          btn.setAttribute('onclick', 'p79OpenLocalMaster()');
        }
      }
    });

    /* ---- 3b. Remove duplicate family business cards (keep first) ---- */
    const bizCards = [];
    view.querySelectorAll('section.card').forEach(function (card) {
      const t = card.textContent || '';
      if (t.indexOf('Your family owns and operates') !== -1 ||
          t.indexOf('Your family owns and operates this business') !== -1) {
        bizCards.push(card);
      }
    });
    bizCards.forEach(function (card, i) {
      if (i > 0) card.remove();
    });

    /* ---- 3c. Fix E£0/yr salary in the family business card ---- */
    bizCards.forEach(function (card) {
      if (!card.parentNode) return;
      card.querySelectorAll('.row').forEach(function (row) {
        const span = row.querySelector('span');
        const b = row.querySelector('b');
        if (!span || !b) return;
        const label = (span.textContent || '').trim();
        if (label === 'Your salary') {
          const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
          const rev = (S.p77 && S.p77.familyBusinessRevenue) || 0;
          const salaryEGP = Math.round(rev * 0.03 * rate);
          const expected = 'E£' + salaryEGP.toLocaleString() + '/yr';
          if ((b.textContent || '').indexOf('E£0') !== -1 || (b.textContent || '').indexOf('E£0/yr') !== -1) {
            b.textContent = expected;
          }
        }
      });
    });

    /* ---- 3d. Remove duplicate local master's inline cards (keep first) ---- */
    const lmCards = [];
    view.querySelectorAll('section.card').forEach(function (card) {
      const h3 = card.querySelector('h3');
      if (!h3) return;
      const t = (h3.textContent || '');
      if (t.indexOf("Local Master's in Egypt") !== -1 || t.indexOf('Local Master\u2019s in Egypt') !== -1) {
        lmCards.push(card);
      }
    });
    lmCards.forEach(function (card, i) {
      if (i > 0) card.remove();
    });

    /* ---- 3e. Remove useless cards ---- */
    view.querySelectorAll('section.card').forEach(function (card) {
      const h3 = card.querySelector('h3');
      if (!h3) return;
      const t = h3.textContent || '';
      if (t.indexOf('Target destination') !== -1) card.remove();
      if (t.indexOf("Master's abroad") !== -1 && t.indexOf('year 1 cost') !== -1) card.remove();
      if (t.indexOf('Study abroad — realistic costs') !== -1) card.remove();
      if (t.indexOf('Your passport and your options') !== -1 && activeTab !== 'world') card.remove();
      if (t.indexOf('career ladder') !== -1 && activeTab !== 'career') card.remove();
    });

    /* ---- 3f. Hide Thanaweya content after graduation ---- */
    if (S.degree || S.uni) {
      view.querySelectorAll('section.card').forEach(function (card) {
        const h3 = card.querySelector('h3');
        if (!h3) return;
        const t = h3.textContent || '';
        if (t.indexOf('Egyptian university cutoffs') !== -1) card.remove();
        if (t.indexOf('Thanaweya Amma:') !== -1) card.remove();
        if (t.indexOf('Your Thanaweya Amma position') !== -1) card.remove();
        if (t.indexOf('Choose Thanaweya Amma track') !== -1) card.remove();
        if (t.indexOf('Private lessons') !== -1) card.remove();
        if (t.indexOf('School trips') !== -1) card.remove();
        if (t.indexOf('School olympiads') !== -1) card.remove();
        if (t.indexOf('Thanaweya Amma pressure') !== -1) card.remove();
        if (t.indexOf('Vocational / technical') !== -1) card.remove();
        if (t.indexOf('Join a study group') !== -1) card.remove();
      });
    }

    /* ---- 3g. Update top-bar income display ---- */
    syncSalary();

    /* ---- 3h. Update the "Yearly income" card to include family business ---- */
    if (S.p77 && S.p77.worksForFamily) {
      view.querySelectorAll('section.card').forEach(function (card) {
        const t = card.textContent || '';
        if (t.indexOf('Does your income cover your life?') === -1) return;
        const rows = card.querySelectorAll('.row');
        rows.forEach(function (row) {
          const span = row.querySelector('span');
          const b = row.querySelector('b');
          if (!span || !b) return;
          if ((span.textContent || '').indexOf('Yearly income') !== -1) {
            const base = (typeof p54LiveIncome === 'function') ? p54LiveIncome() : 0;
            const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
            const famSalary = S.p77.familyBusinessRevenue * 0.03;
            const total = base + famSalary;
            b.textContent = 'E£' + Math.round(total * rate).toLocaleString();
          }
        });
      });
    }
  }

  /* Run on interval — catches everything on every render */
  setInterval(domFix, 400);
  setTimeout(domFix, 200);

  console.log('[p79] v3 loaded successfully');
})();
