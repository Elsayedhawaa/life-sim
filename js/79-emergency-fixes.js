/* =====================================================================
   79. CONSISTENCY FIX v2
   - Family business: sync S.job with p77 revenue, remove duplicate card
   - Family car offer: tier-aware, hidden after university
   - Hide Egyptian school content after graduation
   - Hide duplicate local master's inline card
   - Self-contained study-abroad picker (no file 80 required)
   - Real local master's modal with university names
   Load AFTER 78-reality-fix.js and BEFORE 99-boot.js
   ===================================================================== */

(function p79ConsistencyFix() {

  /* =================================================================
     1. FAMILY BUSINESS — sync S.job with p77.worksForFamily
     The base game clears S.job on layoff and never restores it.
     We restore it here, and set the salary from revenue so it always
     matches what the business card shows.
     ================================================================= */
  function p79FamilySalaryInternal() {
    if (!S || !S.p77) return 0;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const rev = Number(S.p77.familyBusinessRevenue) || 0;
    return (rev * 0.03);
  }

  function p79SyncFamilyJob() {
    if (!S || !S.p77) return;
    if (!S.p77.worksForFamily) return;

    /* Compute salary in internal units from revenue (matches the card) */
    const salaryInternal = p79FamilySalaryInternal();

    /* If no job or the current job isn't the family job, set it */
    if (!S.job || !S.job.isFamilyBusiness) {
      S.job = {
        trackId: 'entry',
        level: 0,
        title: 'Family Business Associate',
        salary: salaryInternal,
        perf: 60,
        years: (S.job && S.job.years) || 0,
        company: (S.p76 && S.p76.familyBusiness) || 'Family Business',
        companySize: 'family business',
        companyFactor: 1,
        benefits: { medical: true, social: true, bonus: 0.02, leave: 21, remote: 'On-site', hours: 40, pension: true, contract: 'Family employment' },
        stress: 3,
        isFamilyBusiness: true
      };
    } else {
      /* Update salary to match current revenue */
      S.job.salary = salaryInternal;
    }
  }

  /* Run immediately, after load, and on every age up */
  setTimeout(p79SyncFamilyJob, 400);
  setTimeout(p79SyncFamilyJob, 1500);
  setTimeout(p79SyncFamilyJob, 3000);
  const p79OrigAgeUpSync = ageUp;
  ageUp = function () {
    const r = p79OrigAgeUpSync.apply(this, arguments);
    p79SyncFamilyJob();
    return r;
  };

  /* =================================================================
     2. FAMILY CAR OFFER — tier-aware, hidden after university
     ================================================================= */
  function p79ShouldOfferCar() {
    if (!S || S.age < 18) return false;
    if (S.uni || S.degree) return false;
    if (S.cars && S.cars.length > 0) return false;
    const level = (S.p76 && S.p76.wealthLevel) || 0;
    if (level < 2) return false;
    return true;
  }

  const p79OrigParentOffer = (typeof p62ParentCarOffer === 'function') ? p62ParentCarOffer : null;
  if (p79OrigParentOffer) {
    p62ParentCarOffer = function () {
      if (!p79ShouldOfferCar()) return;
      return p79OrigParentOffer.apply(this, arguments);
    };
  }

  /* Custom car accept — tier-aware pool, always closes modal */
  window.p62AcceptParentCar = function () {
    try {
      if (!S) return;
      if (typeof p62Init === 'function') p62Init();
      if (S.p62 && S.p62.pendingOffers && S.p62.pendingOffers.length) S.p62.pendingOffers.shift();

      const level = (S.p76 && S.p76.wealthLevel) || 2;
      const year = (typeof gameYear === 'function') ? gameYear() : 2026;
      if (typeof P62_MODELS === 'undefined') return;

      let pool = [];
      const inYear = function (m) {
        const f = Number(m[8]) || 0, t = Number(m[9]) || 9999;
        return year >= f && year <= t;
      };
      const tierOf = function (m) {
        const b = P62_BRANDS[m[0]] || {};
        return b.tier || 0;
      };
      if (level >= 5) {
        pool = P62_MODELS.filter(function (m) { return inYear(m) && tierOf(m) >= 3 && ['lux','exec','sport','suv'].indexOf(m[2]) >= 0; });
      } else if (level === 4) {
        pool = P62_MODELS.filter(function (m) { return inYear(m) && tierOf(m) >= 3 && ['lux','exec','suv'].indexOf(m[2]) >= 0; });
      } else if (level === 3) {
        pool = P62_MODELS.filter(function (m) { return inYear(m) && ['mid','suv','compact'].indexOf(m[2]) >= 0; });
      } else {
        pool = P62_MODELS.filter(function (m) { return inYear(m) && ['econ','compact'].indexOf(m[2]) >= 0; });
      }
      if (!pool.length) pool = P62_MODELS.filter(inYear);
      if (!pool.length) return;

      const model = pool[Math.floor(Math.random() * pool.length)];
      const brand = P62_BRANDS[model[0]] || { name: model[0] };
      const base = (typeof p62BasePriceUSD === 'function') ? p62BasePriceUSD(model, year) : (model[3] * 52.7);
      const carAge = level >= 4 ? 0 : level === 3 ? 1 : 3 + Math.floor(Math.random() * 4);
      const value = (typeof p62Depreciation === 'function') ? Math.round(base * p62Depreciation(carAge)) : base;

      S.cars = S.cars || [];
      S.cars.push({
        uid: 'cg' + Math.random().toString(36).slice(2, 8),
        make: brand.name,
        name: model[1],
        cls: model[2],
        year: year - carAge,
        trim: 0, color: 0, interior: 0, opts: [],
        msrp: base, paid: 0,
        insurance: 'tp',
        insuranceExpiry: year + 1,
        registrationExpiry: year + 1,
        miles: carAge * 12000,
        cond: level >= 4 ? 98 : level === 3 ? 85 : 70,
        age: carAge,
        acc: false, broken: false, fix: 0,
        mods: [], modCost: 0,
        seller: 'parents',
        brand: model[0],
        fuel: model[11] ? 'e' : (model[10] && year >= model[10] ? 'h' : 'g'),
        life: model[7],
        value: value,
        int: 0, intc: 0,
        hasLoan: false
      });
      S.cars = S.cars.slice(-4);

      (typeof parents === 'function' ? parents() : []).forEach(function (p) {
        if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 8);
      });
      if (typeof fx === 'function') fx({ happiness: 6, social: level >= 4 ? 5 : 3 });
      if (typeof log === 'function') log('🎁 Your parents gave you a ' + (year - carAge) + ' ' + brand.name + ' ' + model[1] + (carAge === 0 ? ' — brand new' : ''));
    } catch (err) {
      console.error('[p79] accept car failed:', err);
    } finally {
      const m = document.getElementById('p62-offer-modal');
      if (m) m.remove();
      if (typeof save === 'function') save();
      if (typeof render === 'function') render();
    }
  };

  /* =================================================================
     3. VIEW SCHOOL — hide Egyptian content after graduation,
        remove duplicate local master's card, wire buttons
     ================================================================= */
  const p79OrigViewSchool = viewSchool;
  viewSchool = function () {
    let html = p79OrigViewSchool.apply(this, arguments);
    if (!html || !S) return html;

    /* If a graduate or enrolled at university, hide Thanaweya content */
    if (S.degree || S.uni) {
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Your Thanaweya Amma position<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Choose Thanaweya Amma track<\/h3>[\s\S]*?<\/section>/g, '');
    }

    /* Remove the inline p68 local master's card — we replace it with a modal */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🎓 Local Master's in Egypt<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove "Master's abroad — year 1 costs" text-heavy table */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🌍 Master's abroad — year 1 costs<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🌍 Study abroad — realistic costs<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove the target destination dropdown */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🎯 Target destination<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove passport panel from Education (belongs in World tab) */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove the career ladder card from Education (belongs in Career) */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💼 Your [^<]*career ladder<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove school-age cards if graduated */
    if (S.degree) {
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📚 Private lessons[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🚌 School trips[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🏆 School olympiads[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📖 Thanaweya Amma pressure<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🔧 Vocational \/ technical school<\/h3>[\s\S]*?<\/section>/g, '');
    }

    /* Keep only ONE EDUCATION STATUS card */
    const statusMatches = html.match(/<section class="card"[^>]*>\s*<div[^>]*>EDUCATION STATUS[\s\S]*?<\/section>/g);
    if (statusMatches && statusMatches.length > 1) {
      let count = 0;
      html = html.replace(/<section class="card"[^>]*>\s*<div[^>]*>EDUCATION STATUS[\s\S]*?<\/section>/g, function (m) {
        count++;
        return count === 1 ? m : '';
      });
    }

    /* Replace broken action buttons with real handlers */
    html = html.replace(/<button[^>]*onclick="activeTab='career';render\(\)"[^>]*>💼 Open Career tab<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="go(\'career\')">💼 Open Career tab</button>');
    html = html.replace(/<button[^>]*onclick="activeTab='school';render\(\)"[^>]*>🎓 Consider local master's<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="p79OpenLocalMaster()">🎓 Consider local master\'s</button>');
    html = html.replace(/<button[^>]*onclick="p75ToggleStudyAbroad\(\)"[^>]*>🌍 Study abroad<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="p79OpenStudyAbroad()">🌍 Study abroad</button>');
    html = html.replace(/<button[^>]*>🌍 Study abroad<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="p79OpenStudyAbroad()">🌍 Study abroad</button>');

    return html;
  };

  /* =================================================================
     4. VIEW CAREER — one family business card with correct salary
     ================================================================= */
  const p79OrigViewCareer = viewCareer;
  viewCareer = function () {
    let html = p79OrigViewCareer.apply(this, arguments);
    if (!html || !S || S.age < 18) return html;
    if (S.country !== S.home) return html;
    if (!S.p76 || !S.p76.familyBusiness) return html;

    /* Remove ANY existing family business card so we can add our own */
    html = html.replace(
      /<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Your family owns and operates this business[\s\S]*?<\/section>/g,
      ''
    );

    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const revEGP = Math.round((S.p77 && S.p77.familyBusinessRevenue || 0) * rate);
    const works = !!(S.p77 && S.p77.worksForFamily);
    const manages = !!(S.p77 && S.p77.familyBusinessManaged);
    /* Compute salary directly from revenue — same as the p77 card did */
    const salaryEGP = Math.round(revEGP * 0.03);

    let card = '<section class="card" style="border-color:var(--mint)"><h3>💼 ' + S.p76.familyBusiness + '</h3>' +
      '<p class="muted" style="font-size:.82rem">Your family owns and operates this business.</p>' +
      '<div class="row"><span>Annual revenue</span><b class="mono">E£' + revEGP.toLocaleString() + '</b></div>' +
      '<div class="row"><span>Employees</span><b>' + ((S.p77 && S.p77.familyBusinessEmployees) || 0) + '</b></div>';

    if (works) {
      card += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span>Your role</span><b>Employee</b></div>' +
        '<div class="row"><span>Your salary</span><b class="mono" style="color:var(--mint)">E£' + salaryEGP.toLocaleString() + '/yr</b></div>' +
        '<button class="btn" style="border-color:var(--rose);color:var(--rose)" onclick="p77QuitFamilyBusiness()">Leave</button>';
    } else {
      card += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p77WorkForFamily()">Work for the family business · E£' + salaryEGP.toLocaleString() + '/yr</button>';
    }
    if (manages) {
      card += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span>You manage</span><b style="color:var(--mint)">Active</b></div>' +
        '<button class="btn" style="border-color:var(--amber)" onclick="p77StopManaging()">Stop managing</button>';
    } else if (S.age >= 21) {
      card += '<button class="btn" onclick="p77ManageFamilyBusiness()">Manage the business<small>+15–30%/yr revenue, less personal time</small></button>';
    }
    if (S.age >= 25) {
      card += '<button class="btn" onclick="p77InheritBusiness()" style="border-color:var(--violet)">Request your share of the business</button>';
    }
    card += '</section>';

    return card + html;
  };

  /* =================================================================
     5. VIEW LIFE — strip family business, passport, extended family
     ================================================================= */
  const p79OrigViewLife = viewLife;
  viewLife = function () {
    let html = p79OrigViewLife.apply(this, arguments);
    if (!html) return html;
    /* Family business */
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family owns and operates this business[\s\S]*?<\/section>/g, '');
    /* Passport panel */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g, '');
    /* Extended family + prestige (already moved to Relationships) */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👨‍👩‍👧‍👦 Extended family<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>⭐ Social Standing<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💍 Marriage expectations<\/h3>[\s\S]*?<\/section>/g, '');
    /* Household staff + trust fund (moved to Real Estate / Bank) */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👥 Household staff<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏦 Family Trust Fund<\/h3>[\s\S]*?<\/section>/g, '');
    return html;
  };

  /* Also strip family business from Assets tab */
  const p79OrigViewAssets = viewAssets;
  viewAssets = function () {
    let html = p79OrigViewAssets.apply(this, arguments);
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family owns and operates this business[\s\S]*?<\/section>/g, '');
    return html;
  };

  /* =================================================================
     6. LOCAL MASTER'S MODAL — full with university names
     ================================================================= */
  window.p79OpenLocalMaster = function () {
    if (!S) return;
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
      '<optgroup label="Public universities">' +
      '<option value="cairo|public">Cairo University</option>' +
      '<option value="ain-shams|public">Ain Shams University</option>' +
      '<option value="alexandria|public">Alexandria University</option>' +
      '<option value="mansoura|public">Mansoura University</option>' +
      '<option value="assiut|public">Assiut University</option>' +
      '</optgroup>' +
      '<optgroup label="Private universities">' +
      '<option value="auc|private">American University in Cairo (AUC)</option>' +
      '<option value="guc|private">German University in Cairo (GUC)</option>' +
      '<option value="bue|private">British University in Egypt (BUE)</option>' +
      '<option value="aastmt|private">Arab Academy for Science & Technology</option>' +
      '<option value="miu|private">Misr International University (MIU)</option>' +
      '<option value="buc|private">Badr University in Cairo (BUC)</option>' +
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
      '<option value="msw">Master of Social Work</option>' +
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
    const uniId = parts[0];
    const uniKind = parts[1];
    const uniName = uniEl.options[uniEl.selectedIndex].text;
    const fieldName = fieldEl.options[fieldEl.selectedIndex].text;
    const fundLabel = fundEl.options[fundEl.selectedIndex].text;

    /* Cost estimate */
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const baseEGP = uniKind === 'public' ? 45000 : 140000;
    const firstYearInternal = baseEGP / rate;

    /* Payment */
    if (fundEl.value === 'self') {
      if (S.wealth < firstYearInternal) {
        hint('You need E£' + baseEGP.toLocaleString() + ' for year 1.');
        return;
      }
      S.wealth -= firstYearInternal;
      S.expenses = (S.expenses || 0) + firstYearInternal;
    } else if (fundEl.value === 'parents') {
      const level = (S.p76 && S.p76.wealthLevel) || 0;
      const agree = level >= 4 ? 0.9 : level >= 3 ? 0.6 : level >= 2 ? 0.3 : 0.05;
      if (Math.random() > agree) {
        hint('Your parents declined to fund the master\'s.');
        return;
      }
    }

    S.localMast = {
      universityId: uniId,
      universityName: uniName,
      kind: uniKind,
      fieldId: fieldEl.value,
      fieldName: fieldName,
      funding: fundEl.value,
      fundingLabel: fundLabel,
      year: 0,
      yearsTotal: 2,
      annualCostEGP: baseEGP,
      startYear: gameYear()
    };

    log('🎓 Enrolled at ' + uniName + ' — ' + fieldName + '. Funding: ' + fundLabel + '.');
    realismNotice('Local master\'s started', uniName + ' — ' + fieldName + '.');
    const m = document.getElementById('p79-local-master-modal');
    if (m) m.remove();
    save();
    render();
  };

  /* =================================================================
     7. STUDY-ABROAD PICKER — self-contained (no file 80 needed)
     ================================================================= */
  const P79_COUNTRIES = [
    { code: 'gbr', name: 'United Kingdom', flag: '🇬🇧', livingUSD: 15000, visaUSD: 490, flightUSD: 650, blockedUSD: 0,
      unis: [
        { n: 'University of Oxford', tier: 1, gpaMin: 3.7, ieltsMin: 7.5, tuitionUSD: 28000 },
        { n: 'University of Cambridge', tier: 1, gpaMin: 3.7, ieltsMin: 7.5, tuitionUSD: 28000 },
        { n: 'Imperial College London', tier: 1, gpaMin: 3.5, ieltsMin: 7.0, tuitionUSD: 32000 },
        { n: 'LSE', tier: 1, gpaMin: 3.6, ieltsMin: 7.0, tuitionUSD: 30000 },
        { n: 'UCL', tier: 1, gpaMin: 3.4, ieltsMin: 7.0, tuitionUSD: 28000 },
        { n: 'King\'s College London', tier: 2, gpaMin: 3.2, ieltsMin: 6.5, tuitionUSD: 26000 },
        { n: 'University of Edinburgh', tier: 2, gpaMin: 3.2, ieltsMin: 6.5, tuitionUSD: 24000 },
        { n: 'University of Manchester', tier: 2, gpaMin: 3.0, ieltsMin: 6.5, tuitionUSD: 22000 }
      ]
    },
    { code: 'usa', name: 'United States', flag: '🇺🇸', livingUSD: 18000, visaUSD: 185, flightUSD: 1100, blockedUSD: 0,
      unis: [
        { n: 'MIT', tier: 1, gpaMin: 3.8, ieltsMin: 7.5, tuitionUSD: 55000 },
        { n: 'Harvard University', tier: 1, gpaMin: 3.8, ieltsMin: 7.5, tuitionUSD: 55000 },
        { n: 'Stanford University', tier: 1, gpaMin: 3.8, ieltsMin: 7.5, tuitionUSD: 55000 },
        { n: 'Yale University', tier: 1, gpaMin: 3.7, ieltsMin: 7.0, tuitionUSD: 52000 },
        { n: 'Princeton University', tier: 1, gpaMin: 3.7, ieltsMin: 7.0, tuitionUSD: 52000 },
        { n: 'Columbia University', tier: 1, gpaMin: 3.6, ieltsMin: 7.0, tuitionUSD: 55000 },
        { n: 'UC Berkeley', tier: 1, gpaMin: 3.5, ieltsMin: 7.0, tuitionUSD: 44000 },
        { n: 'UCLA', tier: 2, gpaMin: 3.4, ieltsMin: 7.0, tuitionUSD: 42000 },
        { n: 'NYU', tier: 2, gpaMin: 3.3, ieltsMin: 7.0, tuitionUSD: 50000 }
      ]
    },
    { code: 'deu', name: 'Germany', flag: '🇩🇪', livingUSD: 11500, visaUSD: 75, flightUSD: 590, blockedUSD: 11208,
      unis: [
        { n: 'Technical University of Munich', tier: 1, gpaMin: 3.5, ieltsMin: 6.5, tuitionUSD: 0 },
        { n: 'Heidelberg University', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 0 },
        { n: 'RWTH Aachen University', tier: 1, gpaMin: 3.3, ieltsMin: 6.5, tuitionUSD: 0 },
        { n: 'Free University of Berlin', tier: 2, gpaMin: 3.0, ieltsMin: 6.0, tuitionUSD: 0 },
        { n: 'Humboldt University of Berlin', tier: 2, gpaMin: 3.0, ieltsMin: 6.0, tuitionUSD: 0 }
      ]
    },
    { code: 'fra', name: 'France', flag: '🇫🇷', livingUSD: 10500, visaUSD: 100, flightUSD: 620, blockedUSD: 0,
      unis: [
        { n: 'Sorbonne University', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 3000 },
        { n: 'Sciences Po Paris', tier: 1, gpaMin: 3.5, ieltsMin: 7.0, tuitionUSD: 14000 },
        { n: 'HEC Paris', tier: 1, gpaMin: 3.6, ieltsMin: 7.0, tuitionUSD: 22000 },
        { n: 'École Polytechnique', tier: 1, gpaMin: 3.6, ieltsMin: 6.5, tuitionUSD: 8000 }
      ]
    },
    { code: 'can', name: 'Canada', flag: '🇨🇦', livingUSD: 16000, visaUSD: 150, flightUSD: 1000, blockedUSD: 14000,
      unis: [
        { n: 'University of Toronto', tier: 1, gpaMin: 3.5, ieltsMin: 6.5, tuitionUSD: 35000 },
        { n: 'McGill University', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 25000 },
        { n: 'UBC', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 32000 },
        { n: 'University of Waterloo', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 28000 }
      ]
    },
    { code: 'nld', name: 'Netherlands', flag: '🇳🇱', livingUSD: 12500, visaUSD: 210, flightUSD: 640, blockedUSD: 0,
      unis: [
        { n: 'Delft University of Technology', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 18000 },
        { n: 'University of Amsterdam', tier: 1, gpaMin: 3.3, ieltsMin: 6.5, tuitionUSD: 16000 },
        { n: 'Utrecht University', tier: 1, gpaMin: 3.2, ieltsMin: 6.5, tuitionUSD: 15000 }
      ]
    },
    { code: 'aus', name: 'Australia', flag: '🇦🇺', livingUSD: 20000, visaUSD: 710, flightUSD: 1350, blockedUSD: 0,
      unis: [
        { n: 'University of Melbourne', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 32000 },
        { n: 'University of Sydney', tier: 1, gpaMin: 3.3, ieltsMin: 6.5, tuitionUSD: 34000 },
        { n: 'ANU', tier: 1, gpaMin: 3.3, ieltsMin: 6.5, tuitionUSD: 30000 }
      ]
    },
    { code: 'ita', name: 'Italy', flag: '🇮🇹', livingUSD: 9500, visaUSD: 90, flightUSD: 580, blockedUSD: 0,
      unis: [
        { n: 'University of Bologna', tier: 1, gpaMin: 3.2, ieltsMin: 6.0, tuitionUSD: 3000 },
        { n: 'Politecnico di Milano', tier: 1, gpaMin: 3.3, ieltsMin: 6.0, tuitionUSD: 3500 },
        { n: 'Sapienza University of Rome', tier: 1, gpaMin: 3.2, ieltsMin: 6.0, tuitionUSD: 2900 }
      ]
    },
    { code: 'jpn', name: 'Japan', flag: '🇯🇵', livingUSD: 12000, visaUSD: 60, flightUSD: 850, blockedUSD: 0,
      unis: [
        { n: 'University of Tokyo', tier: 1, gpaMin: 3.5, ieltsMin: 6.5, tuitionUSD: 5000 },
        { n: 'Kyoto University', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 5000 },
        { n: 'Osaka University', tier: 1, gpaMin: 3.2, ieltsMin: 6.0, tuitionUSD: 5000 }
      ]
    },
    { code: 'kor', name: 'South Korea', flag: '🇰🇷', livingUSD: 11000, visaUSD: 60, flightUSD: 850, blockedUSD: 0,
      unis: [
        { n: 'Seoul National University', tier: 1, gpaMin: 3.4, ieltsMin: 6.5, tuitionUSD: 6000 },
        { n: 'KAIST', tier: 1, gpaMin: 3.5, ieltsMin: 6.5, tuitionUSD: 6000 },
        { n: 'Yonsei University', tier: 1, gpaMin: 3.2, ieltsMin: 6.0, tuitionUSD: 8000 }
      ]
    },
    { code: 'sgp', name: 'Singapore', flag: '🇸🇬', livingUSD: 16000, visaUSD: 90, flightUSD: 950, blockedUSD: 0,
      unis: [
        { n: 'National University of Singapore', tier: 1, gpaMin: 3.6, ieltsMin: 6.5, tuitionUSD: 30000 },
        { n: 'Nanyang Technological University', tier: 1, gpaMin: 3.5, ieltsMin: 6.5, tuitionUSD: 28000 }
      ]
    },
    { code: 'sau', name: 'Saudi Arabia', flag: '🇸🇦', livingUSD: 11000, visaUSD: 200, flightUSD: 340, blockedUSD: 0,
      unis: [
        { n: 'King Fahd University', tier: 1, gpaMin: 3.2, ieltsMin: 6.0, tuitionUSD: 8000 },
        { n: 'KAUST', tier: 1, gpaMin: 3.5, ieltsMin: 6.5, tuitionUSD: 12000 }
      ]
    },
    { code: 'uae', name: 'UAE', flag: '🇦🇪', livingUSD: 14000, visaUSD: 250, flightUSD: 300, blockedUSD: 0,
      unis: [
        { n: 'NYU Abu Dhabi', tier: 1, gpaMin: 3.7, ieltsMin: 7.0, tuitionUSD: 55000 },
        { n: 'American University of Sharjah', tier: 2, gpaMin: 3.2, ieltsMin: 6.5, tuitionUSD: 32000 }
      ]
    }
  ];

  function p79Year1CostUSD(c, uni, level) {
    return (uni.tuitionUSD || 0) + c.livingUSD + c.blockedUSD + c.visaUSD + c.flightUSD + 1000;
  }

  window.p79OpenStudyAbroad = function () {
    if (!S) return;
    const modal = document.createElement('div');
    modal.id = 'p79-abroad-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    const bankEGP = Math.round((S.wealth || 0) * rate);
    const level = S.degree ? 'master' : 'bachelor';

    const countryRows = P79_COUNTRIES.map(function (c) {
      const cheapest = Math.min.apply(null, c.unis.map(function (u) { return p79Year1CostUSD(c, u); }));
      const costEGP = Math.round(cheapest * 52.7 * idx);
      const afford = bankEGP >= costEGP;
      return '<button class="btn" style="margin-top:6px;text-align:left" onclick="p79SelectAbroadCountry(\'' + c.code + '\')">' +
        c.flag + ' <b>' + c.name + '</b>' +
        '<small>' + (level === 'master' ? 'Master\'s' : 'Bachelor\'s') + ' · Year 1 from E£' + costEGP.toLocaleString() + ' ' + (afford ? '· ✓ Affordable' : '· ✗ Short') + '</small></button>';
    }).join('');

    modal.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🌍 Study abroad — ' + (level === 'master' ? 'Master\'s' : 'Bachelor\'s') + '</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p79-abroad-modal\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">GPA <b>' + gpa.toFixed(2) + '</b> · IELTS <b>' + (ielts || 'none') + '</b> · Bank <b>E£' + bankEGP.toLocaleString() + '</b></p>' +
      '<p class="muted" style="font-size:.75rem;margin-top:6px">Pick a country to see universities. Cost includes tuition + living + blocked account + visa + flight + setup.</p>' +
      '<div style="margin-top:10px">' + countryRows + '</div>' +
      '</div>';
    document.body.appendChild(modal);
  };

  window.p79SelectAbroadCountry = function (code) {
    const c = P79_COUNTRIES.find(function (x) { return x.code === code; });
    if (!c) return;
    const modal = document.getElementById('p79-abroad-modal');
    if (!modal) return;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    const bankEGP = Math.round((S.wealth || 0) * rate);
    const level = S.degree ? 'master' : 'bachelor';

    const rows = c.unis.map(function (u, i) {
      const cost = p79Year1CostUSD(c, u);
      const costEGP = Math.round(cost * 52.7 * idx);
      const tuitionEGP = Math.round((u.tuitionUSD || 0) * 52.7 * idx);
      const requiredGpa = level === 'master' ? (u.gpaMin + 0.1) : u.gpaMin;
      const gpaOK = gpa >= requiredGpa;
      const ieltsOK = ielts >= u.ieltsMin;
      const afford = bankEGP >= costEGP;
      const canApply = gpaOK && ieltsOK && afford;
      return '<div style="margin-top:10px;padding:10px;border:1px solid #2a2a3a;border-radius:8px">' +
        '<b>' + u.n + '</b> <span class="muted" style="font-size:.7rem">· Tier ' + u.tier + '</span>' +
        '<div class="row" style="border:0;padding:2px 0;font-size:.78rem"><span>Tuition/year</span><b class="mono">' + (u.tuitionUSD === 0 ? 'FREE' : 'E£' + tuitionEGP.toLocaleString()) + '</b></div>' +
        '<div class="row" style="border:0;padding:2px 0;font-size:.78rem"><span>Year 1 total</span><b class="mono">E£' + costEGP.toLocaleString() + '</b></div>' +
        '<div class="row" style="border:0;padding:2px 0;font-size:.78rem"><span>Needs</span><b>GPA ' + requiredGpa.toFixed(2) + '+ · IELTS ' + u.ieltsMin + '+</b></div>' +
        (canApply
          ? '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-top:8px">' +
            '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p79ApplyAbroad(\'' + code + '\',' + i + ',\'self\')">Self</button>' +
            '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p79ApplyAbroad(\'' + code + '\',' + i + ',\'scholarship\')">Scholarship</button>' +
            '<button class="btn" style="margin:0;padding:6px;font-size:.7rem" onclick="p79ApplyAbroad(\'' + code + '\',' + i + ',\'parents\')">Family</button>' +
            '</div>'
          : '<p style="color:var(--rose);font-size:.72rem;margin-top:5px">' +
            (!gpaOK ? '❌ GPA ' + gpa.toFixed(2) + ' < ' + requiredGpa.toFixed(2) + '. ' : '') +
            (!ieltsOK ? '❌ IELTS ' + (ielts || 'none') + ' < ' + u.ieltsMin + '. ' : '') +
            (!afford ? '❌ Need E£' + (costEGP - bankEGP).toLocaleString() + ' more. ' : '') +
            '</p>') +
        '</div>';
    }).join('');

    modal.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:560px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">' + c.flag + ' ' + c.name + ' — ' + (level === 'master' ? 'Master\'s' : 'Bachelor\'s') + '</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p79-abroad-modal\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">Bank <b>E£' + bankEGP.toLocaleString() + '</b> · ' + c.unis.length + ' universities</p>' +
      rows +
      '<button class="btn" style="margin-top:14px;width:100%;text-align:center" onclick="p79OpenStudyAbroad()">← Back to countries</button>' +
      '</div>';
  };

  window.p79ApplyAbroad = function (code, idxInList, funding) {
    const c = P79_COUNTRIES.find(function (x) { return x.code === code; });
    if (!c) return;
    const u = c.unis[idxInList];
    if (!u) return;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;

    const gpa = (S.gpa && S.gpaN) ? S.gpa : 0;
    const ielts = S.ielts || 0;
    const level = S.degree ? 'master' : 'bachelor';
    const requiredGpa = level === 'master' ? (u.gpaMin + 0.1) : u.gpaMin;
    if (gpa < requiredGpa) return hint('GPA too low: needs ' + requiredGpa.toFixed(2) + '+');
    if (ielts < u.ieltsMin) return hint('IELTS too low: needs ' + u.ieltsMin + '+');

    const feeEGP = Math.round(100 * 52.7 * idx);
    const feeInternal = feeEGP / rate;
    if (S.wealth < feeInternal) return hint('Application fee: E£' + feeEGP.toLocaleString());
    S.wealth -= feeInternal;
    S.expenses = (S.expenses || 0) + feeInternal;

    S.p79 = S.p79 || {};
    S.p79.appliedUnis = S.p79.appliedUnis || [];
    const year1EGP = Math.round(p79Year1CostUSD(c, u, level) * 52.7 * idx);
    S.p79.appliedUnis.push({
      uni: u.n,
      country: code,
      level: level,
      funding: funding,
      appliedYear: gameYear(),
      appliedAbs: S.pacingAbsoluteMonth || 0,
      resolveAfterMonths: level === 'master' ? 2 : 3,
      resolved: false,
      result: null,
      reqGpa: requiredGpa,
      reqIelts: u.ieltsMin,
      tuitionUSD: u.tuitionUSD,
      year1CostEGP: year1EGP
    });

    log('📤 Applied to ' + u.n + ' (' + c.name + ') · ' + level + ' · ' + funding + '. Fee: E£' + feeEGP.toLocaleString() + '.');
    realismNotice('Application submitted', u.n + ' — ' + level + '. Decision in ~2 months.');
    const m = document.getElementById('p79-abroad-modal');
    if (m) m.remove();
    save();
    render();
  };

  /* =================================================================
     8. DIAGNOSTICS
     ================================================================= */
  window.p79Diag = function () {
    console.log({
      age: S && S.age,
      degree: S && S.degree,
      uni: S && S.uni,
      job: S && S.job && (S.job.title + ' @ ' + S.job.company + ' · salary=' + S.job.salary),
      worksForFamily: S && S.p77 && S.p77.worksForFamily,
      familyRev: S && S.p77 && S.p77.familyBusinessRevenue,
      famSalaryComputed: S && S.p77 && Math.round(S.p77.familyBusinessRevenue * 0.03),
      localMast: S && S.localMast,
      abroadApps: S && S.p79 && S.p79.appliedUnis && S.p79.appliedUnis.length
    });
  };

  /* Run initial sync */
  setTimeout(p79SyncFamilyJob, 600);
  console.log('[p79 v2] Consistency fix loaded');
})();
