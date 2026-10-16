/* =====================================================================
   79. CONSISTENCY FIX — FINAL
   Run synchronously inside the render wrapper.
   ===================================================================== */

console.log('=== [p79] FILE IS LOADING ===');

(function () {
  'use strict';

  /* =================================================================
     1. SALARY SYNC — force S.job to exist when working for family
     ================================================================= */
  function syncFamilyJob() {
    if (typeof S === 'undefined' || !S) return;
    if (!S.p77 || !S.p77.worksForFamily) return;

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const rev = Number(S.p77.familyBusinessRevenue) || 0;
    const salary = rev * 0.03;

    /* Set every possible field the game might read */
    S.salary = salary;
    S.p77.familySalary = salary;
    S.p77.familySalaryEGP = Math.round(salary * rate);

    /* Force S.job to exist */
    if (!S.job || !S.job.isFamilyBusiness) {
      S.job = {
        trackId: 'entry',
        level: 0,
        title: 'Family Business Associate',
        salary: salary,
        perf: 60,
        years: (S.job && S.job.years) || 0,
        company: (S.p76 && S.p76.familyBusiness) || 'Family Business',
        companySize: 'family business',
        companyFactor: 1,
        benefits: {
          medical: true, social: true, bonus: 0.02, leave: 21,
          remote: 'On-site', hours: 40, pension: true, contract: 'Family employment'
        },
        stress: 3,
        isFamilyBusiness: true
      };
    } else {
      S.job.salary = salary;
    }
  }

  /* =================================================================
     2. MODALS
     ================================================================= */
  window.p79OpenLocalMaster = function () {
    if (typeof S === 'undefined' || !S) return;
    const old = document.getElementById('p79-local-master-modal');
    if (old) old.remove();
    const modal = document.createElement('div');
    modal.id = 'p79-local-master-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    modal.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:540px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🎓 Local Master\'s in Egypt</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p79-local-master-modal\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">Public: 25k–70k EGP/yr · Private: 85k–200k EGP/yr · 1–2 years.</p>' +
      '<label class="muted" style="font-size:.8rem;display:block;margin-top:10px">University</label>' +
      '<select id="p79-lm-uni" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<optgroup label="Public"><option>Cairo University</option><option>Ain Shams University</option><option>Alexandria University</option><option>Mansoura University</option></optgroup>' +
      '<optgroup label="Private"><option>American University in Cairo (AUC)</option><option>German University in Cairo (GUC)</option><option>British University in Egypt (BUE)</option><option>Arab Academy for Science &amp; Technology</option><option>Misr International University (MIU)</option></optgroup>' +
      '</select>' +
      '<label class="muted" style="font-size:.8rem;display:block;margin-top:8px">Subject</label>' +
      '<select id="p79-lm-field" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<option>MBA — Business Administration</option>' +
      '<option>MSc Accounting &amp; Finance</option>' +
      '<option>MSc Economics</option>' +
      '<option>MSc Computer Science</option>' +
      '<option>Master of Public Health</option>' +
      '<option>LLM — Law</option>' +
      '<option>MSc Engineering</option>' +
      '<option>MSc Medical Sciences</option>' +
      '</select>' +
      '<button class="btn" style="margin-top:14px;width:100%;text-align:center;background:var(--mint);color:#000;font-weight:700" onclick="p79SubmitLocalMaster()">Apply</button>' +
      '</div>';
    document.body.appendChild(modal);
  };

  window.p79SubmitLocalMaster = function () {
    const uniEl = document.getElementById('p79-lm-uni');
    const fieldEl = document.getElementById('p79-lm-field');
    if (!uniEl || !fieldEl) return;
    S.localMast = {
      universityName: uniEl.value,
      fieldName: fieldEl.value,
      year: 0,
      yearsTotal: 2,
      startYear: (typeof gameYear === 'function') ? gameYear() : 2026
    };
    if (typeof log === 'function') log('🎓 Enrolled at ' + uniEl.value + ' — ' + fieldEl.value + '.');
    const m = document.getElementById('p79-local-master-modal');
    if (m) m.remove();
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p79OpenStudyAbroad = function () {
    if (typeof S === 'undefined' || !S) return;
    const old = document.getElementById('p79-abroad-modal');
    if (old) old.remove();

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex((typeof gameYear === 'function') ? gameYear() : 2026) : 1;
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    const bankEGP = Math.round((S.wealth || 0) * rate);
    const level = S.degree ? 'master' : 'bachelor';

    const countries = [
      { c: 'gbr', f: '🇬🇧', n: 'United Kingdom', cost: 28000 + 15000 + 490 + 650 + 1000 },
      { c: 'usa', f: '🇺🇸', n: 'United States', cost: 44000 + 18000 + 185 + 1100 + 1500 },
      { c: 'deu', f: '🇩🇪', n: 'Germany', cost: 0 + 11500 + 11208 + 75 + 590 + 800 },
      { c: 'fra', f: '🇫🇷', n: 'France', cost: 3000 + 10500 + 100 + 620 + 800 },
      { c: 'can', f: '🇨🇦', n: 'Canada', cost: 25000 + 16000 + 14000 + 150 + 1000 + 1200 },
      { c: 'nld', f: '🇳🇱', n: 'Netherlands', cost: 15000 + 12500 + 210 + 640 + 900 },
      { c: 'aus', f: '🇦🇺', n: 'Australia', cost: 30000 + 20000 + 710 + 1350 + 1200 },
      { c: 'ita', f: '🇮🇹', n: 'Italy', cost: 2900 + 9500 + 90 + 580 + 700 },
      { c: 'jpn', f: '🇯🇵', n: 'Japan', cost: 5000 + 12000 + 60 + 850 + 900 },
      { c: 'kor', f: '🇰🇷', n: 'South Korea', cost: 6000 + 11000 + 60 + 850 + 900 },
      { c: 'sgp', f: '🇸🇬', n: 'Singapore', cost: 28000 + 16000 + 90 + 950 + 1000 },
      { c: 'sau', f: '🇸🇦', n: 'Saudi Arabia', cost: 8000 + 11000 + 200 + 340 + 700 },
      { c: 'uae', f: '🇦🇪', n: 'UAE', cost: 32000 + 14000 + 250 + 300 + 800 }
    ];

    const rows = countries.map(function (c) {
      const costEGP = Math.round(c.cost * 52.7 * idx);
      const afford = bankEGP >= costEGP;
      return '<button class="btn" style="margin-top:6px;text-align:left;width:100%" onclick="p79ShowCountryUnis(\'' + c.c + '\')">' +
        c.f + ' <b>' + c.n + '</b>' +
        '<small>Year 1 from E£' + costEGP.toLocaleString() + ' ' + (afford ? '· ✓ Affordable' : '· ✗ Short E£' + (costEGP - bankEGP).toLocaleString()) + '</small>' +
        '</button>';
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

  window.p79ShowCountryUnis = function (code) {
    const UNIS = {
      gbr: [
        { n: 'University of Oxford', gpa: 3.8, ielts: 7.5, tu: 28000 },
        { n: 'University of Cambridge', gpa: 3.8, ielts: 7.5, tu: 28000 },
        { n: 'Imperial College London', gpa: 3.6, ielts: 7.0, tu: 32000 },
        { n: 'LSE', gpa: 3.7, ielts: 7.0, tu: 30000 },
        { n: 'UCL', gpa: 3.5, ielts: 7.0, tu: 28000 },
        { n: 'KCL', gpa: 3.3, ielts: 6.5, tu: 26000 },
        { n: 'Edinburgh', gpa: 3.3, ielts: 6.5, tu: 24000 },
        { n: 'Manchester', gpa: 3.1, ielts: 6.5, tu: 22000 }
      ],
      usa: [
        { n: 'MIT', gpa: 3.9, ielts: 7.5, tu: 55000 },
        { n: 'Harvard', gpa: 3.9, ielts: 7.5, tu: 55000 },
        { n: 'Stanford', gpa: 3.9, ielts: 7.5, tu: 55000 },
        { n: 'Yale', gpa: 3.8, ielts: 7.0, tu: 52000 },
        { n: 'Princeton', gpa: 3.8, ielts: 7.0, tu: 52000 },
        { n: 'Columbia', gpa: 3.7, ielts: 7.0, tu: 55000 }
      ],
      deu: [
        { n: 'TUM', gpa: 3.6, ielts: 6.5, tu: 0 },
        { n: 'Heidelberg', gpa: 3.5, ielts: 6.5, tu: 0 },
        { n: 'RWTH Aachen', gpa: 3.4, ielts: 6.5, tu: 0 }
      ],
      fra: [
        { n: 'Sorbonne', gpa: 3.5, ielts: 6.5, tu: 3000 },
        { n: 'Sciences Po', gpa: 3.6, ielts: 7.0, tu: 14000 },
        { n: 'HEC Paris', gpa: 3.7, ielts: 7.0, tu: 22000 }
      ],
      can: [
        { n: 'Toronto', gpa: 3.6, ielts: 6.5, tu: 35000 },
        { n: 'McGill', gpa: 3.5, ielts: 6.5, tu: 25000 },
        { n: 'UBC', gpa: 3.5, ielts: 6.5, tu: 32000 }
      ],
      nld: [
        { n: 'TU Delft', gpa: 3.5, ielts: 6.5, tu: 18000 },
        { n: 'Amsterdam', gpa: 3.4, ielts: 6.5, tu: 16000 },
        { n: 'Utrecht', gpa: 3.3, ielts: 6.5, tu: 15000 }
      ],
      aus: [
        { n: 'Melbourne', gpa: 3.5, ielts: 6.5, tu: 32000 },
        { n: 'Sydney', gpa: 3.4, ielts: 6.5, tu: 34000 },
        { n: 'ANU', gpa: 3.4, ielts: 6.5, tu: 30000 }
      ],
      ita: [
        { n: 'Bologna', gpa: 3.3, ielts: 6.0, tu: 3000 },
        { n: 'Politecnico Milano', gpa: 3.4, ielts: 6.0, tu: 3500 },
        { n: 'Sapienza Rome', gpa: 3.3, ielts: 6.0, tu: 2900 }
      ],
      jpn: [
        { n: 'Tokyo', gpa: 3.6, ielts: 6.5, tu: 5000 },
        { n: 'Kyoto', gpa: 3.5, ielts: 6.5, tu: 5000 }
      ],
      kor: [
        { n: 'Seoul National', gpa: 3.5, ielts: 6.5, tu: 6000 },
        { n: 'KAIST', gpa: 3.6, ielts: 6.5, tu: 6000 }
      ],
      sgp: [
        { n: 'NUS', gpa: 3.7, ielts: 6.5, tu: 30000 },
        { n: 'NTU', gpa: 3.6, ielts: 6.5, tu: 28000 }
      ],
      sau: [
        { n: 'King Fahd', gpa: 3.3, ielts: 6.0, tu: 8000 },
        { n: 'KAUST', gpa: 3.6, ielts: 6.5, tu: 12000 }
      ],
      uae: [
        { n: 'NYU Abu Dhabi', gpa: 3.8, ielts: 7.0, tu: 55000 },
        { n: 'AUS', gpa: 3.3, ielts: 6.5, tu: 32000 }
      ]
    };
    const list = UNIS[code] || [];
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex((typeof gameYear === 'function') ? gameYear() : 2026) : 1;
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    const level = S.degree ? 'master' : 'bachelor';

    const rows = list.map(function (u) {
      const requiredGpa = level === 'master' ? u.gpa + 0.1 : u.gpa;
      const gpaOK = gpa >= requiredGpa;
      const ieltsOK = ielts >= u.ielts;
      const tuitionEGP = Math.round(u.tu * 52.7 * idx);
      const canApply = gpaOK && ieltsOK;
      return '<div style="margin-top:10px;padding:10px;border:1px solid #2a2a3a;border-radius:8px">' +
        '<b>' + u.n + '</b>' +
        '<div class="row" style="border:0;padding:2px 0;font-size:.78rem"><span>Tuition/year</span><b class="mono">' + (u.tu === 0 ? 'FREE' : 'E£' + tuitionEGP.toLocaleString()) + '</b></div>' +
        '<div class="row" style="border:0;padding:2px 0;font-size:.78rem"><span>Needs</span><b>GPA ' + requiredGpa.toFixed(2) + '+ · IELTS ' + u.ielts + '+</b></div>' +
        (canApply
          ? '<button class="btn" style="margin-top:6px;width:100%" onclick="p79SubmitAbroad(\'' + code + '\',\'' + u.n + '\',' + requiredGpa + ',' + u.ielts + ',' + u.tu + ')">Apply</button>'
          : '<p style="color:var(--rose);font-size:.72rem;margin-top:5px">' + (!gpaOK ? '❌ GPA too low. ' : '') + (!ieltsOK ? '❌ IELTS too low.' : '') + '</p>') +
        '</div>';
    }).join('');

    const m = document.getElementById('p79-abroad-modal');
    if (m) m.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b>Universities</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p79-abroad-modal\').remove()">✕</button>' +
      '</div>' + rows +
      '<button class="btn" style="margin-top:14px;width:100%" onclick="p79OpenStudyAbroad()">← Back</button>' +
      '</div>';
  };

  window.p79SubmitAbroad = function (code, uniName, reqGpa, reqIelts, tuitionUSD) {
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex((typeof gameYear === 'function') ? gameYear() : 2026) : 1;
    const feeEGP = Math.round(100 * 52.7 * idx);
    const internal = feeEGP / rate;
    if (S.wealth < internal) return hint('Fee: E£' + feeEGP.toLocaleString());
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.p79 = S.p79 || {};
    S.p79.appliedUnis = S.p79.appliedUnis || [];
    S.p79.appliedUnis.push({
      uni: uniName, country: code,
      level: S.degree ? 'master' : 'bachelor',
      funding: 'self',
      appliedYear: (typeof gameYear === 'function') ? gameYear() : 2026,
      appliedAbs: S.pacingAbsoluteMonth || 0,
      resolveAfterMonths: 2,
      resolved: false, result: null,
      reqGpa: reqGpa, reqIelts: reqIelts,
      tuitionUSD: tuitionUSD,
      year1CostEGP: Math.round((tuitionUSD + 15000) * 52.7 * idx)
    });
    log('📤 Applied to ' + uniName + '.');
    const m = document.getElementById('p79-abroad-modal');
    if (m) m.remove();
    save(); render();
  };

  /* Alias old broken handlers */
  window.p75ToggleStudyAbroad = window.p79OpenStudyAbroad;
  window.p68ApplyLocalMaster = window.p79SubmitLocalMaster;

  /* =================================================================
     3. THE FIX: synchronous DOM correction inside a render wrapper
     ================================================================= */

  function fixDOMNow() {
    if (typeof S === 'undefined' || !S) return;
    const view = document.getElementById('view');
    if (!view) return;

    /* 3a) Rewire broken buttons by walking the actual buttons */
    const btns = view.querySelectorAll('button');
    for (let i = 0; i < btns.length; i++) {
      const b = btns[i];
      const t = (b.textContent || '');
      const oc = b.getAttribute('onclick') || '';
      if (t.indexOf('Study abroad') !== -1 && oc.indexOf('p79OpenStudyAbroad') === -1) {
        b.setAttribute('onclick', 'p79OpenStudyAbroad()');
      }
      if ((t.indexOf('Consider master') !== -1 || t.indexOf('Consider local master') !== -1) && oc.indexOf('p79OpenLocalMaster') === -1) {
        b.setAttribute('onclick', 'p79OpenLocalMaster()');
      }
      if (t.indexOf('Apply for local master') !== -1 && oc.indexOf('p79OpenLocalMaster') === -1 && oc.indexOf('p79SubmitLocalMaster') === -1) {
        b.setAttribute('onclick', 'p79OpenLocalMaster()');
      }
    }

    /* 3b) Remove ALL family business cards — we re-add one clean one */
    const allCards = view.querySelectorAll('section.card');
    let keptBizCard = false;
    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      const t = card.textContent || '';
      if (t.indexOf('Your family owns and operates') !== -1) {
        if (keptBizCard) {
          card.remove();
        } else {
          keptBizCard = true;
          /* Fix the salary line inside this card */
          const rows = card.querySelectorAll('.row');
          for (let j = 0; j < rows.length; j++) {
            const span = rows[j].querySelector('span');
            const bEl = rows[j].querySelector('b');
            if (span && bEl && (span.textContent || '').trim() === 'Your salary') {
              const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
              const rev = (S.p77 && S.p77.familyBusinessRevenue) || 0;
              const correctEGP = Math.round(rev * 0.03 * rate);
              bEl.textContent = 'E£' + correctEGP.toLocaleString() + '/yr';
              bEl.style.color = 'var(--mint)';
            }
          }
        }
      }
    }

    /* 3c) Remove duplicate local master's cards */
    let keptLM = false;
    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      if (!card.parentNode) continue;
      const h3 = card.querySelector('h3');
      if (!h3) continue;
      const t = h3.textContent || '';
      if (t.indexOf("Local Master's in Egypt") !== -1 || t.indexOf('Local Master\u2019s in Egypt') !== -1) {
        if (keptLM) card.remove();
        else keptLM = true;
      }
    }

    /* 3d) Remove useless cards */
    for (let i = 0; i < allCards.length; i++) {
      const card = allCards[i];
      if (!card.parentNode) continue;
      const h3 = card.querySelector('h3');
      if (!h3) continue;
      const t = h3.textContent || '';
      if (t.indexOf('Target destination') !== -1) card.remove();
      else if (t.indexOf("Master's abroad") !== -1 && t.indexOf('year 1 cost') !== -1) card.remove();
      else if (t.indexOf('Study abroad — realistic costs') !== -1) card.remove();
      else if (t.indexOf('Your passport and your options') !== -1 && activeTab !== 'world') card.remove();
      else if (t.indexOf('career ladder') !== -1 && activeTab !== 'career') card.remove();
    }

    /* 3e) Hide Egyptian school content after graduation */
    if (S.degree || S.uni) {
      for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        if (!card.parentNode) continue;
        const h3 = card.querySelector('h3');
        if (!h3) continue;
        const t = h3.textContent || '';
        if (t.indexOf('Egyptian university cutoffs') !== -1) card.remove();
        else if (t.indexOf('Thanaweya Amma') !== -1) card.remove();
        else if (t.indexOf('Your Thanaweya') !== -1) card.remove();
        else if (t.indexOf('Private lessons') !== -1) card.remove();
        else if (t.indexOf('School trips') !== -1) card.remove();
        else if (t.indexOf('School olympiads') !== -1) card.remove();
        else if (t.indexOf('Vocational / technical') !== -1) card.remove();
        else if (t.indexOf('Join a study group') !== -1) card.remove();
      }
    }
  }

  /* THE KEY: wrap render so we fix the DOM synchronously,
     not via setTimeout, before the browser paints */
  var _origRender = window.render;
  window.render = function () {
    syncFamilyJob();                             /* 1. set salary BEFORE render */
    var r = _origRender.apply(this, arguments);  /* 2. base render runs */
    try { fixDOMNow(); } catch (e) { console.error('[p79] fixDOMNow', e); }  /* 3. synchronous fix */
    return r;
  };

  /* Also fix on ageUp */
  var _origAgeUp = window.ageUp;
  window.ageUp = function () {
    syncFamilyJob();
    var r = _origAgeUp.apply(this, arguments);
    try { fixDOMNow(); } catch (e) { console.error('[p79] ageUp fix', e); }
    return r;
  };

  /* Fix once on load */
  if (typeof S !== 'undefined' && S) {
    syncFamilyJob();
    fixDOMNow();
  }

  console.log('=== [p79] FILE LOADED SUCCESSFULLY ===');
})();
