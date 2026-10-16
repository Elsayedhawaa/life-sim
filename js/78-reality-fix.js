/* =====================================================================
   78. REALITY FIX — track gating, modal freeze, card placement
   Load AFTER 77-dynasty-class-system.js and BEFORE 99-boot.js
   ===================================================================== */

(function p78RealityFix() {

  /* =================================================================
     PART 1 — FAMILY CAR OFFER MODAL FREEZE
     Bug: p62AcceptParentCar used m[3] (price) as class, so pool was
     always empty and the modal threw an error and never closed.
     Model row: [0]make [1]model [2]class [3]price [4]mpg [5]hap
                [6]soc [7]life [8]fromYear [9]toYear [10]hybridFrom
                [11]isElectric
     ================================================================= */

  window.p62AcceptParentCar = function () {
    try {
      p62Init();
      if (!S || !S.p62 || !S.p62.pendingOffers || !S.p62.pendingOffers.length) {
        const m = document.getElementById('p62-offer-modal');
        if (m) m.remove();
        return;
      }
      const off = S.p62.pendingOffers.shift();
      const fw = off.wealthTier;
      const year = gameYear();

      const pool = P62_MODELS.filter(function (m) {
        if (!m || !Array.isArray(m)) return false;
        const fromYear = Number(m[8]) || 0;
        const toYear = Number(m[9]) || 9999;
        if (year < fromYear || year > toYear) return false;
        const cls = m[2];                       /* CLASS is at index 2 */
        if (fw === 2) return ['compact', 'mid', 'suv'].indexOf(cls) !== -1;
        return ['econ', 'compact'].indexOf(cls) !== -1;
      });
      const fallback = P62_MODELS.filter(function (m) {
        const fromYear = Number(m[8]) || 0;
        const toYear = Number(m[9]) || 9999;
        return year >= fromYear && year <= toYear;
      });
      const usePool = pool.length ? pool : fallback;
      if (!usePool.length) {
        const m = document.getElementById('p62-offer-modal');
        if (m) m.remove();
        return hint('No car available from your parents this year.');
      }

      const model = usePool[Math.floor(Math.random() * usePool.length)];
      const brand = P62_BRANDS[model[0]] || { name: model[0] };
      const base = p62BasePriceUSD(model, year);
      const carAge = fw === 2 ? 0 : 3 + Math.floor(Math.random() * 4);
      const value = Math.round(base * p62Depreciation(carAge));

      const car = {
        uid: 'cg' + Math.random().toString(36).slice(2, 8),
        make: brand.name,
        name: model[1],
        cls: model[2],                          /* class is m[2] */
        year: year - carAge,
        trim: 0, color: 0, interior: 0, opts: [],
        msrp: base, paid: 0,
        insurance: 'tp',
        insuranceExpiry: year + 1,
        registrationExpiry: year + 1,
        miles: carAge * 12000,
        cond: fw === 2 ? 98 : 70,
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
      fx({ happiness: 6, social: fw === 2 ? 5 : 3 });
      log('🎁 Your parents gave you a ' + car.year + ' ' + car.make + ' ' + car.name + '.');
    } catch (err) {
      console.error('[p78] accept car failed:', err);
      hint('Error giving you the car. Trying again.');
    } finally {
      /* ALWAYS close the modal — even if the code above throws */
      const m = document.getElementById('p62-offer-modal');
      if (m) m.remove();
      save();
      render();
    }
  };

  window.p62DeclineParentCar = function () {
    try {
      p62Init();
      if (S && S.p62 && S.p62.pendingOffers && S.p62.pendingOffers.length) {
        S.p62.pendingOffers.shift();
      }
      (typeof parents === 'function' ? parents() : []).forEach(function (p) {
        if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 3);
      });
      log('You politely declined your parents\' car offer.');
    } catch (err) {
      console.error('[p78] decline car failed:', err);
    } finally {
      const m = document.getElementById('p62-offer-modal');
      if (m) m.remove();
      save();
      render();
    }
  };

  /* Also make Escape close a stuck modal */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    const m = document.getElementById('p62-offer-modal');
    if (m && S && S.p62 && S.p62.pendingOffers) {
      S.p62.pendingOffers = [];
      m.remove();
      render();
    }
  });

  /* =================================================================
     PART 2 — THANAWEYA AMMA: track first → score at 18 → faculty filter
     ================================================================= */

  /* Faculty eligibility per track (real Egyptian system) */
  const P78_TRACK_FACULTIES = {
    'adabi': [
      'law', 'arts', 'education', 'mass_comm', 'languages', 'humanities',
      'social_work', 'tourism', 'economics', 'business', 'commerce'
    ],
    'elmi-riyada': [
      'engineering', 'computer_science', 'science', 'pharmacy',
      'economics', 'business', 'commerce', 'applied_sciences',
      'logistics', 'physical_therapy', 'agriculture'
    ],
    'elmi-olom': [
      'medicine', 'dentistry', 'pharmacy', 'physical_therapy', 'nursing',
      'veterinary', 'science', 'agriculture', 'business', 'commerce',
      'applied_sciences'
    ]
  };

  /* Cutoff per faculty per track (2024 realistic Egyptian numbers) */
  const P78_CUTOFFS = {
    'adabi': {
      law: 68.5, arts: 65.0, education: 62.5, mass_comm: 72.0,
      languages: 67.0, humanities: 63.5, social_work: 64.0,
      tourism: 63.5, economics: 74.0, business: 65.5, commerce: 63.5
    },
    'elmi-riyada': {
      engineering: 83.5, computer_science: 80.0, science: 76.5,
      pharmacy: 88.0, economics: 76.5, business: 72.0, commerce: 70.5,
      applied_sciences: 72.0, logistics: 72.0, physical_therapy: 84.0,
      agriculture: 63.0
    },
    'elmi-olom': {
      medicine: 91.5, dentistry: 90.8, pharmacy: 89.2,
      physical_therapy: 85.0, veterinary: 85.5, science: 76.5,
      agriculture: 63.0, nursing: 70.0, business: 72.0, commerce: 70.5,
      applied_sciences: 72.0
    }
  };

  const P78_FACULTY_LABELS = {
    medicine: 'Medicine', dentistry: 'Dentistry', pharmacy: 'Pharmacy',
    physical_therapy: 'Physical Therapy', veterinary: 'Veterinary',
    engineering: 'Engineering', computer_science: 'Computer Science',
    science: 'Science', nursing: 'Nursing', economics: 'Economics',
    business: 'Business', commerce: 'Commerce', mass_comm: 'Mass Comm',
    law: 'Law', arts: 'Arts', education: 'Education', agriculture: 'Agriculture',
    languages: 'Languages', humanities: 'Humanities', social_work: 'Social Work',
    tourism: 'Tourism & Hotels', applied_sciences: 'Applied Sciences',
    logistics: 'Logistics'
  };

  /* Allow track choice at 16-18 (not just 18) */
  window.p68ChooseTrack = function (track) {
    if (!S) return;
    if (S.age < 16 || S.age > 18) return hint('Choose your Thanaweya Amma track between ages 16 and 18.');
    if (!S.p68) S.p68 = {};
    if (S.p68.thanaweyaTrack) return hint('You already chose your track.');
    S.p68.thanaweyaTrack = track;
    const label = { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[track];
    log('📝 You chose the Thanaweya Amma track: ' + label + '.');
    realismNotice('Thanaweya Amma track chosen', 'You are now on the ' + label + ' track. This determines which university faculties you can apply to.');
    render();
  };

  /* Require track before computing score */
  const p78OrigCompute = window.p69ComputeAndShowResult;
  window.p69ComputeAndShowResult = function () {
    if (!S) return;
    if (!S.p68 || !S.p68.thanaweyaTrack) {
      return hint('Choose your Thanaweya Amma track first (Adabi / Elmi Riyada / Elmi Olom).');
    }
    if (S.age < 18) return hint('You will get your Thanaweya Amma score at age 18.');
    return p78OrigCompute.apply(this, arguments);
  };

  /* Rebuild the school view — strip Egypt content when no track, filter cutoffs */
  const p78OrigViewSchool = viewSchool;
  viewSchool = function () {
    let html = p78OrigViewSchool.apply(this, arguments);
    if (!S) return html;

    /* Only apply the Thanaweya flow in Egypt */
    const inEgypt = (S.country === 'egy' || !S.country);
    if (!inEgypt) return html;

    const isSchoolAge = S.age >= 6 && S.age <= 19;
    const hasDegree = !!S.degree;
    if (!isSchoolAge && hasDegree) return html;

    const track = (S.p68 && S.p68.thanaweyaTrack) || null;
    const score = (S.p69 && S.p69.thanaweya && S.p69.thanaweya.score) || null;

    /* A) If NO track chosen and age 15-18: hide everything Egyptian except the track picker */
    if (!track && S.age >= 15 && S.age <= 18) {
      /* Remove the cutoff table */
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
      /* Remove "📝 Thanaweya Amma: X%" result card */
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
      /* Remove "Get score" button */
      html = html.replace(/<button[^>]*onclick="p69ComputeAndShowResult\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
      /* Remove the "Your Thanaweya Amma position" card that shows "Choose a track first" */
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Your Thanaweya Amma position<\/h3>[\s\S]*?<\/section>/g, '');
      return html;
    }

    /* B) Track chosen but no score yet, age 15-17: hide cutoffs, hide result, hide score button */
    if (track && !score && S.age < 18) {
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
      html = html.replace(/<button[^>]*onclick="p69ComputeAndShowResult\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
      /* Add an info card explaining the timeline */
      const info =
        '<section class="card" style="border-color:var(--cyan)">' +
        '<h3>📝 Thanaweya Amma</h3>' +
        '<p class="muted" style="font-size:.82rem">You are on the ' +
        { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[track] +
        ' track. You will sit the Thanaweya Amma exam at age 18 and receive your score then.</p>' +
        '</section>';
      const firstEnd = html.indexOf('</section>');
      if (firstEnd > 0) html = html.slice(0, firstEnd + 10) + info + html.slice(firstEnd + 10);
      return html;
    }

    /* C) Track chosen + score obtained: filter the cutoff table by track */
    if (track && score != null) {
      const cutoffs = P78_CUTOFFS[track] || {};
      const scoreColor = function (c) { return score >= c ? 'var(--mint)' : 'var(--rose)'; };
      const rows = Object.keys(cutoffs).sort(function (a, b) { return cutoffs[b] - cutoffs[a]; }).map(function (key) {
        const cutoff = cutoffs[key];
        const eligible = score >= cutoff;
        return '<div class="row" style="padding:5px 0;font-size:.84rem">' +
          '<span>' + (eligible ? '✓ ' : '✗ ') + (P78_FACULTY_LABELS[key] || key) + '</span>' +
          '<span><b class="mono" style="color:' + scoreColor(cutoff) + '">' + cutoff + '%</b></span>' +
          '</div>';
      }).join('');

      const newTable =
        '<section class="card"><h3>📊 Egyptian university cutoffs — your track</h3>' +
        '<p class="muted" style="font-size:.82rem">' +
        { 'adabi': 'Adabi (Literary)', 'elmi-riyada': 'Elmi Riyada (Science-Math)', 'elmi-olom': 'Elmi Olom (Science-Biology)' }[track] +
        '. Only faculties listed here are open to you.</p>' +
        '<div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)"><span><b>Your score</b></span>' +
        '<b class="mono" style="color:var(--cyan)">' + score.toFixed(1) + '%</b></div>' +
        rows + '</section>';

      /* Replace the existing cutoff table */
      const replaced = html.replace(
        /<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/,
        newTable
      );
      if (replaced === html) {
        /* No existing table — insert the new one */
        const firstEnd = html.indexOf('</section>');
        html = firstEnd > 0 ? html.slice(0, firstEnd + 10) + newTable + html.slice(firstEnd + 10) : newTable + html;
      } else {
        html = replaced;
      }
    }

    /* D) Remove the redundant "Your Thanaweya Amma position" card */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Your Thanaweya Amma position<\/h3>[\s\S]*?<\/section>/g, '');

    return html;
  };

  /* =================================================================
     PART 3 — MOVE CARDS TO CORRECT TABS
     ================================================================= */

  /* A) Remove from Life: family business, extended family, household staff, trust fund, marriage expectations, prestige */
  const p78OrigViewLife = viewLife;
  viewLife = function () {
    let html = p78OrigViewLife.apply(this, arguments);
    if (!html) return html;

    /* Family business card */
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family owns and operates this business[\s\S]*?<\/section>/g, '');
    /* Extended family */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👨‍👩‍👧‍👦 Extended family<\/h3>[\s\S]*?<\/section>/g, '');
    /* Household staff */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👥 Household staff<\/h3>[\s\S]*?<\/section>/g, '');
    /* Trust fund */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏦 Family Trust Fund<\/h3>[\s\S]*?<\/section>/g, '');
    /* Marriage expectations */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💍 Marriage expectations<\/h3>[\s\S]*?<\/section>/g, '');
    /* Prestige / Social Standing */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>⭐ Social Standing<\/h3>[\s\S]*?<\/section>/g, '');

    return html;
  };

  /* B) Career tab: add family business card (only if you work there or can apply) */
  const p78OrigViewCareer = viewCareer;
  viewCareer = function () {
    let html = p78OrigViewCareer.apply(this, arguments);
    if (!S || S.age < 18) return html;
    if (S.country !== S.home) return html;             /* Don't show when abroad */
    if (!S.p76 || !S.p76.familyBusiness) return html;
    if (typeof p77FamilyBusinessCard === 'function') {
      html += p77FamilyBusinessCard();
    }
    return html;
  };

  /* C) Relationships tab: extended family + prestige */
  const p78OrigViewFamily = viewFamily;
  viewFamily = function () {
    let html = p78OrigViewFamily.apply(this, arguments);
    if (!S || !S.p77) return html;
    if (typeof p77ExtendedFamilyCard === 'function') {
      const card = p77ExtendedFamilyCard();
      if (card) html += card;
    }
    if (typeof p77PrestigeCard === 'function') {
      const card = p77PrestigeCard();
      if (card) html += card;
    }
    return html;
  };

  /* D) Real Estate tab: household staff */
  const p78OrigViewAssets = viewAssets;
  viewAssets = function () {
    let html = p78OrigViewAssets.apply(this, arguments);
    if (!S || !S.p77) return html;
    if (S.country !== S.home) return html;             /* Not when abroad */
    if (typeof p77HouseholdStaffCard === 'function') {
      const card = p77HouseholdStaffCard();
      if (card) html += card;
    }
    return html;
  };

  /* E) Bank tab: trust fund */
  const p78OrigViewBank = viewBank;
  viewBank = function () {
    let html = p78OrigViewBank.apply(this, arguments);
    if (!S || !S.p77 || S.p77.trustFundBalance <= 0) return html;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const balanceEGP = Math.round(S.p77.trustFundBalance * rate);
    const unlockAge = S.p77.trustFundUnlockAge || 21;
    const locked = S.age < unlockAge;
    const card = '<section class="card" style="border-color:var(--amber)"><h3>🏦 Family Trust Fund</h3>' +
      '<div class="row"><span>Balance</span><b class="mono" style="color:var(--mint)">E£' + balanceEGP.toLocaleString() + '</b></div>' +
      '<div class="row"><span>Unlocks at age</span><b>' + unlockAge + '</b></div>' +
      (locked
        ? '<p class="muted" style="font-size:.82rem;margin-top:8px">Managed by your family until age ' + unlockAge + '. Earns 12% APY.</p>'
        : '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p77WithdrawTrustFund()">Withdraw entire balance</button>') +
      '</section>';
    return html + card;
  };

  /* F) Strip duplicate passport panels (keep only one) */
  const p78OrigViewWorld = viewWorld;
  viewWorld = function () {
    let html = p78OrigViewWorld.apply(this, arguments);
    const matches = html.match(/<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g);
    if (matches && matches.length > 1) {
      let count = 0;
      html = html.replace(
        /<section class="card"[^>]*>\s*<h3>🛂 Your passport and your options<\/h3>[\s\S]*?<\/section>/g,
        function (m) { count++; return count === 1 ? m : ''; }
      );
    }
    return html;
  };

  console.log('[p78] Reality fix loaded — Thanaweya flow, modal freeze, card placement');
})();
