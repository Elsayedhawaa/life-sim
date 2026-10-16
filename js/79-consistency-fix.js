/* =====================================================================
   79. CONSISTENCY FIX
   - Family car offer scales with wealth tier + hides after university
   - Hide Thanaweya cutoffs after you graduate
   - Move "career ladder" card: Education tab → Career tab
   - Passport panel: only World tab (remove from Life + Education)
   - Family business card: only Career tab (remove from Life)
   - Family business salary counts as income
   - "Consider local master's" and "Study abroad" buttons open real modals
   - Local master's modal includes private universities
   - Remove the useless "Target destination" dropdown and "Year 1 costs" text card
   Load AFTER 78-reality-fix.js and BEFORE 99-boot.js
   ===================================================================== */

(function p79ConsistencyFix() {

  /* =================================================================
     1. FAMILY CAR OFFER — scale by wealth, hide after university
     ================================================================= */
  function p79ShouldOfferCar() {
    if (!S) return false;
    if (S.age < 18) return false;
    /* Once you graduate high school / enter university, no more handout */
    if (S.uni || S.degree) return false;
    /* Already has a car */
    if (S.cars && S.cars.length > 0) return false;
    /* Family wealth tier */
    const level = (S.p76 && S.p76.wealthLevel) || 0;
    /* Poor / lower-middle don't gift cars */
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

  /* Rebuild accept to pick tier-appropriate car and always close the modal */
  window.p62AcceptParentCar = function () {
    try {
      if (!S) return;
      const off = (S.p62 && S.p62.pendingOffers && S.p62.pendingOffers.length) ? S.p62.pendingOffers.shift() : null;
      const level = (S.p76 && S.p76.wealthLevel) || 0;
      const year = (typeof gameYear === 'function') ? gameYear() : 2026;
      if (typeof p62Init === 'function') p62Init();

      if (typeof P62_MODELS === 'undefined' || typeof P62_BRANDS === 'undefined') {
        return hint('Car data unavailable.');
      }

      /* Choose class pool by tier */
      let pool;
      if (level >= 5) {
        /* Ultra: luxury brands, brand new */
        pool = P62_MODELS.filter(function (m) {
          const fromY = Number(m[8]) || 0, toY = Number(m[9]) || 9999;
          if (year < fromY || year > toY) return false;
          const brand = P62_BRANDS[m[0]] || {};
          return (brand.tier || 0) >= 3 && ['lux','exec','sport','suv'].indexOf(m[2]) >= 0;
        });
      } else if (level === 4) {
        /* Wealthy: premium/luxury */
        pool = P62_MODELS.filter(function (m) {
          const fromY = Number(m[8]) || 0, toY = Number(m[9]) || 9999;
          if (year < fromY || year > toY) return false;
          const brand = P62_BRANDS[m[0]] || {};
          return (brand.tier || 0) >= 3 && ['lux','exec','suv'].indexOf(m[2]) >= 0;
        });
      } else if (level === 3) {
        /* Upper-middle: new mid-size / SUV */
        pool = P62_MODELS.filter(function (m) {
          const fromY = Number(m[8]) || 0, toY = Number(m[9]) || 9999;
          if (year < fromY || year > toY) return false;
          return ['mid','suv','compact'].indexOf(m[2]) >= 0;
        });
      } else {
        /* Middle: used econ/compact */
        pool = P62_MODELS.filter(function (m) {
          const fromY = Number(m[8]) || 0, toY = Number(m[9]) || 9999;
          if (year < fromY || year > toY) return false;
          return ['econ','compact'].indexOf(m[2]) >= 0;
        });
      }

      if (!pool.length) pool = P62_MODELS.filter(function (m) {
        const fromY = Number(m[8]) || 0, toY = Number(m[9]) || 9999;
        return year >= fromY && year <= toY;
      });
      if (!pool.length) { hint('No car available.'); return; }

      const model = pool[Math.floor(Math.random() * pool.length)];
      const brand = P62_BRANDS[model[0]] || { name: model[0] };
      const base = (typeof p62BasePriceUSD === 'function') ? p62BasePriceUSD(model, year) : (model[3] * 52.7);
      const carAge = level >= 4 ? 0 : level === 3 ? 1 : 3 + Math.floor(Math.random() * 4);
      const value = (typeof p62Depreciation === 'function') ? Math.round(base * p62Depreciation(carAge)) : base;

      const car = {
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
      };
      S.cars = S.cars || [];
      S.cars.push(car);
      S.cars = S.cars.slice(-4);

      (typeof parents === 'function' ? parents() : []).forEach(function (p) {
        if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 8);
      });
      if (typeof fx === 'function') fx({ happiness: 6, social: level >= 4 ? 5 : 3 });
      if (typeof log === 'function') {
        log('🎁 Your parents gave you a ' + car.year + ' ' + car.make + ' ' + car.name + (carAge === 0 ? ' — brand new' : ''));
      }
    } catch (err) {
      console.error('[p79] accept car failed:', err);
    } finally {
      const m = document.getElementById('p62-offer-modal');
      if (m) m.remove();
      if (typeof save === 'function') save();
      if (typeof render === 'function') render();
    }
  };

  /* Offer text reflects tier */
  const p79OrigShowOffer = (typeof p62ShowPendingOffer === 'function') ? p62ShowPendingOffer : null;
  if (p79OrigShowOffer) {
    p62ShowPendingOffer = function () {
      const modal = document.getElementById('p62-offer-modal');
      if (modal) modal.remove();
      const level = (S && S.p76 && S.p76.wealthLevel) || 2;
      let desc;
      if (level >= 5) desc = 'Your family is upgrading their fleet. They are giving you the outgoing top-of-the-line model — a luxury car in excellent condition.';
      else if (level === 4) desc = 'Your family is buying a new car and passing their previous one to you. It is a premium vehicle in excellent condition.';
      else if (level === 3) desc = 'Your parents are upgrading their car and passing their older model to you. It is a solid mid-range car in good condition.';
      else desc = 'Your parents offer you their old car now that they are upgrading. You will still pay insurance and maintenance yourself.';

      const el = document.createElement('div');
      el.id = 'p62-offer-modal';
      el.className = 'p24-modal-backdrop';
      el.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.78);backdrop-filter:blur(7px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px';
      el.innerHTML =
        '<div class="p24-modal" style="max-width:460px">' +
        '<div class="p24-pill">FAMILY OFFER · ' + ((typeof gameYear === 'function') ? gameYear() : '') + '</div>' +
        '<h2>🚗 Your parents offer you a car</h2>' +
        '<p>' + desc + '</p>' +
        '<div class="acts" style="margin-top:14px">' +
        '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p62AcceptParentCar();return false;">Accept the offer</button>' +
        '<button class="btn" onclick="p62DeclineParentCar();return false;">Politely decline</button>' +
        '</div></div>';
      document.body.appendChild(el);
    };
  }

  /* =================================================================
     2. HIDE THANAWEYA CUTOFFS AFTER GRADUATION
     ================================================================= */
  const p79OrigViewSchool = viewSchool;
  viewSchool = function () {
    let html = p79OrigViewSchool.apply(this, arguments);
    if (!html || !S) return html;

    /* If the player has a degree, no Thanaweya content should show */
    if (S.degree) {
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Your Thanaweya Amma position<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Choose Thanaweya Amma track<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/Choose a Thanaweya Amma track first\./g, '');
      /* If enrolled in university, hide too */
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
    } else if (S.uni) {
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
    }

    /* Remove duplicate EDUCATION STATUS (keep only the first) */
    const statusMatches = html.match(/<section class="card"[^>]*>\s*<div[^>]*>EDUCATION STATUS[\s\S]*?<\/section>/g);
    if (statusMatches && statusMatches.length > 1) {
      let count = 0;
      html = html.replace(/<section class="card"[^>]*>\s*<div[^>]*>EDUCATION STATUS[\s\S]*?<\/section>/g, function (m) {
        count++;
        return count === 1 ? m : '';
      });
    }

    /* Remove the "💼 Your X career ladder" card from Education — it belongs in Career */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💼 Your [^<]*career ladder<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove "🎯 Target destination" dropdown — it did nothing */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🎯 Target destination<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove the "🌍 Master's abroad — year 1 costs" text-heavy table */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🌍 Master's abroad — year 1 costs<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove passport panel from Education — belongs in World tab only */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g, '');

    /* Remove private lessons / school trips / olympiads if graduated */
    if (S.degree) {
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📚 Private lessons[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🚌 School trips[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🏆 School olympiads[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📖 Thanaweya Amma pressure<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>🔧 Vocational \/ technical school<\/h3>[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>👥 Join a study group<\/h3>[\s\S]*?<\/section>/g, '');
    }

    /* Replace "What to do next" buttons with real actions */
    html = html.replace(
      /<button[^>]*onclick="activeTab='career';render\(\)"[^>]*>💼 Open Career tab<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="go(\'career\')">💼 Open Career tab</button>'
    );
    html = html.replace(
      /<button[^>]*onclick="activeTab='school';render\(\)"[^>]*>🎓 Consider local master's<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="p79OpenLocalMaster()">🎓 Consider local master\'s</button>'
    );
    html = html.replace(
      /<button[^>]*onclick="activeTab='school';render\(\)"[^>]*>🎓 Consider master's<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="p79OpenLocalMaster()">🎓 Consider master\'s</button>'
    );
    html = html.replace(
      /<button[^>]*>🌍 Study abroad<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="p79OpenStudyAbroad()">🌍 Study abroad</button>'
    );
    html = html.replace(
      /<button[^>]*onclick="p75ToggleStudyAbroad\(\)"[^>]*>🌍 Study abroad<\/button>/g,
      '<button class="btn" style="text-align:left" onclick="p79OpenStudyAbroad()">🌍 Study abroad</button>'
    );

    return html;
  };

  /* =================================================================
     3. FAMILY BUSINESS CARD — Career tab only, and salary counts
     ================================================================= */
  const p79OrigViewCareer = viewCareer;
  viewCareer = function () {
    let html = p79OrigViewCareer.apply(this, arguments);
    if (!S || S.age < 18) return html;
    if (S.country !== S.home) return html;
    if (!S.p76 || !S.p76.familyBusiness) return html;

    /* Add the family business card at the top */
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const rev = (S.p77 && S.p77.familyBusinessRevenue) || 0;
    const revEGP = Math.round(rev * rate);
    const works = !!(S.p77 && S.p77.worksForFamily);
    const manages = !!(S.p77 && S.p77.familyBusinessManaged);

    /* Include family business salary in the income calculation display */
    if (works && S.job && S.job.isFamilyBusiness) {
      const salEGP = Math.round((S.job.salary || 0) * rate);
      html = html.replace(
        /Yearly income \(live — includes salary, rent, certificates\)<\/span><b class="mono" style="color:var\(--mint\)">E£[\d,]+<\/b>/,
        'Yearly income (live — includes family business salary)<\/span><b class="mono" style="color:var(--mint)">E£' + (Math.round(((typeof p54LiveIncome === 'function') ? p54LiveIncome() : 0) * rate) + salEGP).toLocaleString() + '<\/b>'
      );
    }

    let card = '<section class="card" style="border-color:var(--mint)"><h3>💼 ' + S.p76.familyBusiness + '</h3>' +
      '<p class="muted" style="font-size:.82rem">Your family owns and operates this business.</p>' +
      '<div class="row"><span>Annual revenue</span><b class="mono">E£' + revEGP.toLocaleString() + '</b></div>' +
      '<div class="row"><span>Employees</span><b>' + ((S.p77 && S.p77.familyBusinessEmployees) || 0) + '</b></div>';

    if (works) {
      const salEGP = Math.round((S.job && S.job.salary || 0) * rate);
      card += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span>Your role</span><b>Employee</b></div>' +
        '<div class="row"><span>Your salary</span><b class="mono">E£' + salEGP.toLocaleString() + '/yr</b></div>' +
        '<button class="btn" style="border-color:var(--rose);color:var(--rose)" onclick="p77QuitFamilyBusiness()">Leave</button>';
    } else {
      card += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p77WorkForFamily()">Work for the family business</button>';
    }

    if (manages) {
      card += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span>You manage</span><b style="color:var(--mint)">Active</b></div>' +
        '<button class="btn" style="border-color:var(--amber)" onclick="p77StopManaging()">Stop managing</button>';
    } else if (S.age >= 21) {
      card += '<button class="btn" onclick="p77ManageFamilyBusiness()">Manage the business</button>';
    }
    if (S.age >= 25) {
      card += '<button class="btn" onclick="p77InheritBusiness()" style="border-color:var(--violet)">Request your share</button>';
    }
    card += '</section>';

    /* Insert at top */
    return card + html;
  };

  /* Remove family business card from Life tab */
  const p79OrigViewLife = viewLife;
  viewLife = function () {
    let html = p79OrigViewLife.apply(this, arguments);
    /* Remove the family business card (anywhere it appears) */
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family owns and operates this business[\s\S]*?<\/section>/g, '');
    /* Remove the standalone passport panel from Life */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g, '');
    return html;
  };

  /* Also remove family business from Assets and Family tabs (if it appeared there) */
  const p79OrigViewAssets = viewAssets;
  viewAssets = function () {
    let html = p79OrigViewAssets.apply(this, arguments);
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family owns and operates this business[\s\S]*?<\/section>/g, '');
    return html;
  };

  /* =================================================================
     4. MAKE FAMILY BUSINESS ROLE ACTUALLY SET S.job
     ================================================================= */
  window.p77WorkForFamily = function () {
    if (!S || !S.p77) return;
    if (S.job) return hint('Quit your current job first.');
    if (S.age < 18) return hint('You must be 18+ to work.');
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const revEGP = Math.round((S.p77.familyBusinessRevenue || 0) * rate);
    const salaryEGP = Math.round(revEGP * 0.03);
    const salaryInternal = salaryEGP / rate;
    S.p77.worksForFamily = true;
    S.job = {
      trackId: 'entry',
      level: 0,
      title: 'Family Business Associate',
      salary: salaryInternal,
      perf: 60,
      years: 0,
      company: S.p76.familyBusiness,
      companySize: 'family business',
      companyFactor: 1,
      benefits: { medical: true, social: true, bonus: 0.02, leave: 21, remote: 'On-site', hours: 40, pension: true, contract: 'Family employment' },
      stress: 3,
      isFamilyBusiness: true
    };
    log('💼 You started working for ' + S.p76.familyBusiness + ' at E£' + salaryEGP.toLocaleString() + '/year.');
    realismNotice('Working for the family', 'You joined the family business.');
    render();
  };

  /* =================================================================
     5. LOCAL MASTER'S MODAL — with public AND private unis
     ================================================================= */
  window.p79OpenLocalMaster = function () {
    if (!S) return;
    const modal = document.createElement('div');
    modal.id = 'p79-local-master-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.85);backdrop-filter:blur(6px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto';
    modal.innerHTML =
      '<div style="background:#14141f;border:1px solid #51416e;border-radius:16px;padding:18px;max-width:520px;width:100%;max-height:88vh;overflow-y:auto;color:#e8e8f2">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
      '<b style="font-size:1rem">🎓 Local Master\'s in Egypt</b>' +
      '<button class="menu-btn" onclick="document.getElementById(\'p79-local-master-modal\').remove()">✕</button>' +
      '</div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:8px">Public universities: 25k–70k EGP/yr. Private universities: 85k–200k EGP/yr. Duration 1–2 years. Scholarships available for GPA 3.5+.</p>' +
      '<label class="muted" style="font-size:.8rem;display:block;margin-top:10px">Subject</label>' +
      '<select id="p79-lm-field" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<option value="mba">MBA — Business Administration</option>' +
      '<option value="msc-fin">MSc Accounting & Finance</option>' +
      '<option value="msc-econ">MSc Economics</option>' +
      '<option value="msc-cs">MSc Computer Science</option>' +
      '<option value="mph">MPH — Public Health</option>' +
      '<option value="llm">LLM — Law</option>' +
      '<option value="msc-eng">MSc Engineering</option>' +
      '<option value="msc-med">MSc Medical Sciences</option>' +
      '</select>' +
      '<label class="muted" style="font-size:.8rem;display:block;margin-top:8px">University type</label>' +
      '<select id="p79-lm-type" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<option value="public">Public (Cairo, Ain Shams, Alexandria)</option>' +
      '<option value="private">Private (AUC, GUC, BUE, MIU)</option>' +
      '</select>' +
      '<label class="muted" style="font-size:.8rem;display:block;margin-top:8px">Funding</label>' +
      '<select id="p79-lm-fund" style="width:100%;margin:6px 0;padding:6px;background:#1d1d2a;color:#e8e8f2;border:1px solid #51416e;border-radius:6px">' +
      '<option value="self">Pay myself</option>' +
      '<option value="parents">Ask parents</option>' +
      '<option value="partial">Compete for 50% scholarship</option>' +
      '<option value="scholar">Compete for full scholarship</option>' +
      '</select>' +
      '<button class="btn" style="margin-top:12px;width:100%;text-align:center;background:var(--mint);color:#000;font-weight:700" onclick="p79SubmitLocalMaster()">Apply for local master\'s</button>' +
      '</div>';
    document.body.appendChild(modal);
  };

  window.p79SubmitLocalMaster = function () {
    const field = document.getElementById('p79-lm-field');
    const type = document.getElementById('p79-lm-type');
    const fund = document.getElementById('p79-lm-fund');
    if (!field || !type || !fund) return;

    const typeLabel = type.options[type.selectedIndex].text;
    const fundLabel = fund.options[fund.selectedIndex].text;
    if (!S.localMast) S.localMast = {};
    S.localMast = {
      fieldId: field.value,
      fieldName: field.options[field.selectedIndex].text,
      kind: type.value,
      kindLabel: typeLabel,
      funding: fund.value,
      fundingLabel: fundLabel,
      year: 0,
      yearsTotal: 2
    };
    log('🎓 You enrolled in ' + S.localMast.fieldName + ' at a ' + typeLabel + ' — funding: ' + fundLabel + '.');
    realismNotice('Local master\'s started', 'You are now enrolled in ' + S.localMast.fieldName + '.');
    const m = document.getElementById('p79-local-master-modal');
    if (m) m.remove();
    render();
  };

  /* =================================================================
     6. STUDY ABROAD MODAL — picker with country → universities
     ================================================================= */
  window.p79OpenStudyAbroad = function () {
    if (typeof p80ShowAbroadModal === 'function') {
      /* Prefer the existing rich modal if it exists */
      return p80ShowAbroadModal();
    }
    if (typeof p80ShowPathwayModal === 'function') {
      return p80ShowPathwayModal();
    }
    /* Simple fallback */
    hint('Study-abroad picker not available.');
  };

  /* =================================================================
     7. INCOME — include family business salary
     ================================================================= */
  const p79OrigLiveIncome = (typeof p54LiveIncome === 'function') ? p54LiveIncome : null;
  if (p79OrigLiveIncome) {
    p54LiveIncome = function () {
      let total = p79OrigLiveIncome.apply(this, arguments) || 0;
      /* If working for family business, add the salary (only if not already counted) */
      if (S && S.job && S.job.isFamilyBusiness && S.p77 && S.p77.worksForFamily) {
        total += Number(S.job.salary) || 0;
      }
      return total;
    };
  }

  /* =================================================================
     8. DIAGNOSTICS
     ================================================================= */
  window.p79Diag = function () {
    console.log({
      age: S && S.age,
      degree: S && S.degree,
      uni: S && S.uni,
      job: S && S.job && (S.job.title + ' @ ' + S.job.company),
      familyBiz: S && S.p76 && S.p76.familyBusiness,
      worksForFamily: S && S.p77 && S.p77.worksForFamily,
      familyBizSalary: S && S.job && S.job.salary,
      p77rev: S && S.p77 && S.p77.familyBusinessRevenue,
      liveIncome: (typeof p54LiveIncome === 'function') ? p54LiveIncome() : null
    });
  };

  console.log('[p79] Consistency fix loaded');
})();
