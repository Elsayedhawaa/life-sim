/* =====================================================================
   83. POST-TRAVEL FIXES
   - Force-quit any job every tick when abroad on a student visa
   - Remove the "Ask for employer medical insurance" card entirely when abroad
   - Strip "YOU CURRENTLY LIVE IN Parents' home" from every tab when abroad
   - Rebuild the Master's modal so its buttons actually work
   Load AFTER 82-force-home-fix.js and BEFORE 99-boot.js
   ===================================================================== */

(function p83PostTravelFixes() {

  /* ---- 1. Force-quit any job when abroad on a student visa ---- */
  function p83KillJobIfAbroadStudent() {
    if (typeof S === 'undefined' || !S) return;
    if (S.country === S.home) return;
    if (!S.p69 || !S.p69.enrolled) return;
    if (!S.job) return;
    const oldTitle = S.job.title || 'your job';
    const oldCompany = S.job.company || 'your employer';
    S.job = null;
    S.part = null;
    if (typeof log === 'function') log('💼 You left ' + oldTitle + ' at ' + oldCompany + ' — student visas do not permit full-time work.');
    if (typeof save === 'function') save();
  }
  setInterval(p83KillJobIfAbroadStudent, 400);

  /* ---- 2. Strip Egypt content while abroad (runs after every render) ---- */
  function p83Strip() {
    if (typeof S === 'undefined' || !S) return;
    if (S.country === S.home) return;
    const view = document.getElementById('view');
    if (!view) return;

    /* a) Medical insurance card — remove entirely */
    view.querySelectorAll('section.card').forEach(function (sec) {
      const t = sec.textContent || '';
      if (t.indexOf('Ask for employer medical insurance') !== -1) sec.remove();
    });

    /* b) "YOU CURRENTLY LIVE IN Parents' home" panel — anywhere */
    view.querySelectorAll('section.card').forEach(function (sec) {
      const t = sec.textContent || '';
      if (t.indexOf('YOU CURRENTLY LIVE IN') !== -1 && t.indexOf("Parents' home") !== -1) sec.remove();
    });
    view.querySelectorAll('div').forEach(function (div) {
      const t = (div.textContent || '').trim();
      if (t.indexOf('YOU CURRENTLY LIVE IN') === 0 && t.indexOf('Parents') !== -1) div.remove();
    });
  }

  try {
    const origRender = render;
    render = function () {
      const r = origRender.apply(this, arguments);
      setTimeout(p83KillJobIfAbroadStudent, 20);
      setTimeout(p83Strip, 60);
      return r;
    };
  } catch (e) { console.warn('[p83] wrap render failed:', e); }

  setInterval(p83Strip, 600);

  /* ---- 3. Rebuild the Master's modal so the buttons actually work ---- */
  window.p81ShowMasterModal = function () {
    if (typeof S === 'undefined' || !S) return;
    const existing = document.getElementById('p81-master-modal');
    if (existing) existing.remove();

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const bankEGP = Math.round((S.wealth || 0) * rate);
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;

    const modal = document.createElement('div');
    modal.id = 'p81-master-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    modal.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🎓 Master\'s options</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p81-master-modal\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">GPA <b>' + gpa.toFixed(2) + '</b> · Bank <b>E£' + bankEGP.toLocaleString() + '</b></p>' +

      '<div style="margin-top:14px;padding:12px;background:rgba(52,211,153,.08);border-radius:8px;border-left:3px solid var(--mint)">' +
      '<b style="font-size:.88rem">🇪🇬 Local master\'s in Egypt</b>' +
      '<p class="muted" style="font-size:.75rem;margin-top:4px">Public: 25k–70k EGP/yr · Private: 85k–200k EGP/yr · 1–2 years · Scholarship for GPA 3.5+</p>' +
      '<button class="btn" style="margin-top:8px;width:100%;text-align:center" onclick="p83OpenLocalMasterModal()">Open local master\'s form →</button>' +
      '</div>' +

      '<div style="margin-top:12px;padding:12px;background:rgba(139,92,246,.08);border-radius:8px;border-left:3px solid var(--violet)">' +
      '<b style="font-size:.88rem">🌍 Master\'s abroad</b>' +
      '<p class="muted" style="font-size:.75rem;margin-top:4px">UK · USA · Germany · Canada · France · Netherlands · Australia · Japan · South Korea · Singapore · Italy</p>' +
      '<p class="muted" style="font-size:.75rem">Full cost = tuition + living + blocked account + visa + flight + setup</p>' +
      '<button class="btn" style="margin-top:8px;width:100%;text-align:center" onclick="p83OpenAbroadList()">Open study-abroad list →</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(modal);
  };

  /* --- Local master's modal (self-contained) --- */
  window.p83OpenLocalMasterModal = function () {
    const m = document.getElementById('p81-master-modal');
    if (m) m.remove();

    let fieldOpts = '<option value="mba">MBA — Business Administration</option>' +
                    '<option value="msc-fin">MSc Accounting & Finance</option>' +
                    '<option value="msc-econ">MSc Economics</option>' +
                    '<option value="mph">MPH — Public Health</option>' +
                    '<option value="msc-cs">MSc Computer Science</option>' +
                    '<option value="llm">LLM — Law</option>';
    if (typeof MASTER_FIELDS !== 'undefined' && Array.isArray(MASTER_FIELDS)) {
      fieldOpts = MASTER_FIELDS.map(function (f) {
        return '<option value="' + f.id + '">' + f.name + '</option>';
      }).join('');
    }

    const modal = document.createElement('div');
    modal.id = 'p83-local-master-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    modal.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🎓 Local Master\'s in Egypt</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p83-local-master-modal\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">Public universities: 25k–70k EGP/yr. Private: 85k–200k EGP/yr. Duration 1–2 years. Scholarship available for GPA 3.5+.</p>' +
      '<label class="muted" style="font-size:.8rem;display:block;margin-top:10px">Subject</label>' +
      '<select id="p83-lm-field" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' + fieldOpts + '</select>' +
      '<label class="muted" style="font-size:.8rem;display:block;margin-top:6px">University type</label>' +
      '<select id="p83-lm-type" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<option value="public">Public university</option>' +
      '<option value="private">Private university</option>' +
      '</select>' +
      '<label class="muted" style="font-size:.8rem;display:block;margin-top:6px">Funding</label>' +
      '<select id="p83-lm-fund" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<option value="self">Pay myself</option>' +
      '<option value="parents">Ask parents</option>' +
      '<option value="partial">Compete for 50% scholarship</option>' +
      '<option value="scholar">Compete for full scholarship</option>' +
      '</select>' +
      '<button class="btn" style="margin-top:12px;width:100%;text-align:center" onclick="p83SubmitLocalMaster()">Apply for local master\'s</button>' +
      '</div>';
    document.body.appendChild(modal);
  };

  window.p83SubmitLocalMaster = function () {
    const field = document.getElementById('p83-lm-field');
    const type = document.getElementById('p83-lm-type');
    const fund = document.getElementById('p83-lm-fund');
    if (!field || !type || !fund) return;
    if (typeof applyLocalMasters === 'function') {
      applyLocalMasters(field.value, type.value, fund.value);
    } else if (typeof hint === 'function') {
      hint('Local master\'s system not available in this build.');
    }
    const m = document.getElementById('p83-local-master-modal');
    if (m) m.remove();
  };

  /* --- Abroad picker — reuse p80's modal --- */
  window.p83OpenAbroadList = function () {
    const m = document.getElementById('p81-master-modal');
    if (m) m.remove();
    if (typeof p80ShowAbroadModal === 'function') {
      p80ShowAbroadModal();
      return;
    }
    if (typeof p80ShowPathwayModal === 'function') {
      p80ShowPathwayModal();
      return;
    }
    if (typeof hint === 'function') hint('Study-abroad picker not available.');
  };

  /* --- Diagnostics --- */
  window.p83Diag = function () {
    console.log({
      home: S && S.home,
      country: S && S.country,
      isAbroad: S && S.country !== S.home,
      enrolled: !!(S && S.p69 && S.p69.enrolled),
      job: S && S.job && (S.job.title + ' at ' + S.job.company),
      visa: S && S.p81 && S.p81.visa && S.p81.visa.name
    });
  };

  console.log('[p83] Post-travel corrections loaded');
})();
