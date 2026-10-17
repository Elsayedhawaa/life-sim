/* =====================================================================
   76. FAMILY + DYNASTY (Phase 3.3b)
   Consolidates 76-life-customization.js and 77-dynasty-class-system.js
   Also fixes: Extended Family / Social Standing / Marriage Expectations
   cards appearing on the LIFE tab. They now appear only in the correct
   tabs (Relationships, Real Estate, Bank, Career).
   Load AFTER 72-faculty-career-connection.js and BEFORE 99-boot.js
   ===================================================================== */

(function p76FamilyDynasty() {
  'use strict';

  /* =================================================================
     PART 1 — WEALTH TIERS, PRESETS, OCCUPATIONS (from 76)
     ================================================================= */
  const P76_TIERS = {
    poor: { id:'poor', order:0, name:'Poor', label:'Poor (فقير)', icon:'🛖',
      desc:'Family struggles to cover basics. Government school only, no pocket money.',
      startWealthEGP:0, homeType:'crowded', homeDesc:'Small shared flat',
      pocketMoneyBase:0, schoolTier:'national',
      giftChance:0.05, giftScale:0.3, carGift:'never', apartmentGift:'never',
      tuitionSupport:0.05, businessChance:0, requestFrequency:'high', requestScale:1.3, reputation:20 },
    lower_mid: { id:'lower_mid', order:1, name:'Lower-middle', label:'Lower-middle (متوسط بسيط)', icon:'🏚️',
      desc:'Basics but no extras. National school. Small pocket money.',
      startWealthEGP:500, homeType:'small_flat', homeDesc:'Small 2-bedroom older flat',
      pocketMoneyBase:80, schoolTier:'national',
      giftChance:0.15, giftScale:0.5, carGift:'never', apartmentGift:'never',
      tuitionSupport:0.3, businessChance:0.05, requestFrequency:'medium', requestScale:1.0, reputation:35 },
    middle: { id:'middle', order:2, name:'Middle class', label:'Middle class (متوسط)', icon:'🏢',
      desc:'Comfortable apartment, private school possible, modest allowance.',
      startWealthEGP:8000, homeType:'apartment', homeDesc:'3-bedroom apartment',
      pocketMoneyBase:300, schoolTier:'private',
      giftChance:0.40, giftScale:1.0, carGift:'used_possible', apartmentGift:'partial',
      tuitionSupport:0.7, businessChance:0.15, requestFrequency:'low', requestScale:0.7, reputation:55 },
    upper_mid: { id:'upper_mid', order:3, name:'Upper-middle', label:'Upper-middle (متوسط مرتفع)', icon:'🏘️',
      desc:'Compound living, private schooling, generous allowance.',
      startWealthEGP:60000, homeType:'compound_flat', homeDesc:'Modern compound apartment',
      pocketMoneyBase:1500, schoolTier:'private',
      giftChance:0.65, giftScale:1.8, carGift:'used_likely', apartmentGift:'full',
      tuitionSupport:0.95, businessChance:0.35, requestFrequency:'never', requestScale:0, reputation:72 },
    wealthy: { id:'wealthy', order:4, name:'Wealthy', label:'Wealthy (غني)', icon:'🏰',
      desc:'Villa in gated compound, international school, private tutors.',
      startWealthEGP:500000, homeType:'villa', homeDesc:'Family villa with garden and pool',
      pocketMoneyBase:5000, schoolTier:'international',
      giftChance:0.85, giftScale:3.5, carGift:'new_likely', apartmentGift:'full_plus',
      tuitionSupport:1.0, businessChance:0.65, requestFrequency:'never', requestScale:0, reputation:88 },
    ultra: { id:'ultra', order:5, name:'Ultra-wealthy', label:'Ultra-wealthy (ثري جداً)', icon:'🏛️',
      desc:'Mansion, chauffeured cars, staff, overseas properties.',
      startWealthEGP:5000000, homeType:'mansion', homeDesc:'Mansion or gated estate',
      pocketMoneyBase:25000, schoolTier:'international',
      giftChance:0.95, giftScale:8.0, carGift:'luxury', apartmentGift:'luxury',
      tuitionSupport:1.0, businessChance:0.9, requestFrequency:'never', requestScale:0, reputation:98 }
  };

  const P76_PARENT_PRESETS = {
    balanced:    { id:'balanced',    label:'Balanced & supportive', icon:'⚖️', desc:'Reasonable balance.',
      strictness:5, warmth:7, generosity:6, ambitionFocus:'balanced', traditional:5, religious:5 },
    strict:      { id:'strict',      label:'Strict & demanding',    icon:'👨‍🏫', desc:'High expectations.',
      strictness:9, warmth:4, generosity:4, ambitionFocus:'academic', traditional:7, religious:7 },
    warm:        { id:'warm',        label:'Warm & lenient',        icon:'🤗', desc:'Affectionate and forgiving.',
      strictness:3, warmth:9, generosity:8, ambitionFocus:'balanced', traditional:4, religious:4 },
    traditional: { id:'traditional', label:'Traditional & religious', icon:'🕌', desc:'Strong family values.',
      strictness:7, warmth:7, generosity:6, ambitionFocus:'balanced', traditional:9, religious:9 },
    business:    { id:'business',    label:'Business-focused',      icon:'💼', desc:'Success-oriented.',
      strictness:6, warmth:5, generosity:7, ambitionFocus:'business', traditional:5, religious:3 },
    artistic:    { id:'artistic',    label:'Artistic & modern',     icon:'🎨', desc:'Creative freedom.',
      strictness:3, warmth:8, generosity:5, ambitionFocus:'artistic', traditional:2, religious:2 },
    absent:      { id:'absent',      label:'Distant & hands-off',   icon:'🌫️', desc:'Emotionally distant.',
      strictness:4, warmth:2, generosity:3, ambitionFocus:'balanced', traditional:4, religious:3 }
  };

  const P76_OCCUPATIONS = [
    { id:'none', name:'Not applicable', minTier:0, connections:0 },
    { id:'gov', name:'Government employee', minTier:1, connections:15 },
    { id:'teacher', name:'Teacher / academic', minTier:1, connections:20 },
    { id:'doctor', name:'Doctor', minTier:2, connections:40 },
    { id:'engineer', name:'Engineer', minTier:2, connections:35 },
    { id:'army', name:'Military / police officer', minTier:2, connections:45 },
    { id:'business', name:'Business owner (SME)', minTier:3, connections:55 },
    { id:'importer', name:'Importer / trader', minTier:3, connections:50 },
    { id:'landowner', name:'Large landowner', minTier:4, connections:65 },
    { id:'bigbusiness', name:'Big business', minTier:4, connections:85 },
    { id:'oldmoney', name:'Old family wealth', minTier:5, connections:95 }
  ];

  /* =================================================================
     PART 2 — STATE (p76 + p77)
     ================================================================= */
  function p76Init(o) {
    o = o || S;
    if (!o) return;
    if (!o.p76) o.p76 = {};
    const d = o.p76;
    if (typeof d.wealthTier !== 'string') d.wealthTier = 'middle';
    if (typeof d.wealthLevel !== 'number') d.wealthLevel = 2;
    if (!d.parentsTraits) d.parentsTraits = { preset:'balanced', strictness:5, warmth:7, generosity:6, ambitionFocus:'balanced', traditional:5, religious:5 };
    if (typeof d.siblingCount !== 'number') d.siblingCount = 1;
    if (typeof d.familyOccupation !== 'string') d.familyOccupation = 'none';
    if (typeof d.familyBusiness !== 'string') d.familyBusiness = null;
    if (typeof d.reputation !== 'number') d.reputation = 50;
    if (typeof d.setupDone !== 'boolean') d.setupDone = false;
    if (!d.giftMemory) d.giftMemory = {};

    if (!o.p77) o.p77 = {};
    const e = o.p77;
    if (!Array.isArray(e.extendedFamily)) e.extendedFamily = [];
    if (typeof e.familyBusinessManaged !== 'boolean') e.familyBusinessManaged = false;
    if (typeof e.worksForFamily !== 'boolean') e.worksForFamily = false;
    if (typeof e.familyBusinessRevenue !== 'number') e.familyBusinessRevenue = 0;
    if (typeof e.familyBusinessEmployees !== 'number') e.familyBusinessEmployees = 0;
    if (!Array.isArray(e.householdStaff)) e.householdStaff = [];
    if (typeof e.trustFundBalance !== 'number') e.trustFundBalance = 0;
    if (typeof e.trustFundUnlockAge !== 'number') e.trustFundUnlockAge = 21;
    if (!Array.isArray(e.landHoldings)) e.landHoldings = [];
    if (typeof e.socialClass !== 'string') e.socialClass = 'middle';
    if (typeof e.prestigePoints !== 'number') e.prestigePoints = 0;
    if (!Array.isArray(e.connections)) e.connections = [];
    if (typeof e.eliteNetwork !== 'boolean') e.eliteNetwork = false;
    if (!Array.isArray(e.childhoodPrivileges)) e.childhoodPrivileges = [];
    if (typeof e.dowryOwed !== 'number') e.dowryOwed = 0;
    if (typeof e.mahrOwed !== 'number') e.mahrOwed = 0;
    if (!e.dynasty) e.dynasty = { generation:1, familyName:null, prestige:0, holdings:[], ancestors:[] };
  }
  const _migrate = migrate;
  migrate = function (o) { const r = _migrate(o); p76Init(r); return r; };
  const _newGame = newGame;
  newGame = function () {
    _newGame.apply(this, arguments);
    p76Init(S);
    p76ApplySetupToState();
    p77SetupFromTier();
  };

  /* =================================================================
     PART 3 — APPLY SETUP (from 76)
     ================================================================= */
  function p76ApplySetupToState() {
    if (!S) return;
    p76Init(S);
    const cfg = (typeof window !== 'undefined' && window.P76_SETUP) || {};
    const tier = P76_TIERS[cfg.tier] || P76_TIERS.middle;
    const preset = P76_PARENT_PRESETS[cfg.parentPreset] || P76_PARENT_PRESETS.balanced;

    S.p76.wealthTier = tier.id;
    S.p76.wealthLevel = tier.order;
    S.p76.parentsTraits = { preset:preset.id, strictness:preset.strictness, warmth:preset.warmth,
      generosity:preset.generosity, ambitionFocus:preset.ambitionFocus,
      traditional:preset.traditional, religious:preset.religious };
    S.p76.reputation = tier.reputation;
    S.p76.siblingCount = Math.max(0, Math.min(5, Number(cfg.siblingCount) || 0));
    S.p76.setupDone = true;
    S.famWealth = tier.order <= 1 ? 0 : tier.order <= 3 ? 1 : 2;

    const startEGP = tier.startWealthEGP * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1);
    S.wealth = startEGP / (typeof rateNow === 'function' ? rateNow() : 52.7);

    /* Siblings */
    S.family = (S.family || []).filter(function (m) { return m && (m.role === 'Mother' || m.role === 'Father'); });
    for (let i = 0; i < S.p76.siblingCount; i++) {
      const age = Math.max(1, S.age + Math.floor(Math.random() * 12) - 4);
      const sib = (typeof addMember === 'function') ? addMember('Sibling', age, 55 + Math.floor(Math.random() * 20)) : null;
      if (sib) sib.p76SiblingTrait = ['studious','ambitious','artistic','rebellious','quiet','protective'][Math.floor(Math.random() * 6)];
    }

    const occ = P76_OCCUPATIONS.find(function (o) { return o.id === cfg.occupation; });
    const validOcc = occ && occ.minTier <= tier.order ? occ : null;
    S.p76.familyOccupation = validOcc ? validOcc.id : 'none';
    S.p76.connections = validOcc ? validOcc.connections : 0;

    if (tier.businessChance > 0 && Math.random() < tier.businessChance) {
      const bizNames = {
        egy:['Nile Trading Company','Delta Textiles','Pyramid Foods','Cairo Medical Supplies','Alexandria Shipping Co.','Nile Valley Real Estate'],
        default:['Family Holdings','Regional Trading Co.','Local Industries Ltd']
      };
      const names = bizNames[S.country] || bizNames.default;
      S.p76.familyBusiness = names[Math.floor(Math.random() * names.length)];
    }

    (S.family || []).forEach(function (m) {
      if (!m) return;
      if (m.role === 'Mother' || m.role === 'Father') {
        m.p76Strictness = preset.strictness;
        m.p76Warmth = preset.warmth;
        m.p76Generosity = preset.generosity;
        m.p76Traditional = preset.traditional;
        m.p76Religious = preset.religious;
        m.p76AmbitionFocus = preset.ambitionFocus;
      }
    });

    try {
      if (typeof p60GenerateParentsHome === 'function') {
        p60GenerateParentsHome();
        p76OverrideParentsHome();
      }
    } catch (e) {}

    if (typeof log === 'function') {
      log('🏠 Family background: ' + tier.label + ' · Parents: ' + preset.label);
      if (S.p76.familyBusiness) log('💼 Family business: ' + S.p76.familyBusiness);
      if (S.p76.siblingCount > 0) log('👥 ' + S.p76.siblingCount + ' sibling(s)');
    }
  }
  window.p76ApplySetupToState = p76ApplySetupToState;

  function p76OverrideParentsHome() {
    if (!S || !S.p60 || !S.p60.parentsHome) return;
    const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
    const h = S.p60.parentsHome;
    const profiles = {
      crowded:      { type:'shared flat',         area:55 + Math.floor(Math.random() * 25), rooms:2, cond:40, valueMult:0.5 },
      small_flat:   { type:'older flat',          area:85 + Math.floor(Math.random() * 30), rooms:2, cond:55, valueMult:0.7 },
      apartment:    { type:'apartment',           area:130 + Math.floor(Math.random() * 40), rooms:3, cond:70, valueMult:1.0 },
      compound_flat:{ type:'compound apartment',  area:160 + Math.floor(Math.random() * 50), rooms:3, cond:85, valueMult:1.8 },
      villa:        { type:'villa',               area:320 + Math.floor(Math.random() * 120), rooms:5, cond:90, valueMult:3.5 },
      mansion:      { type:'mansion',             area:700 + Math.floor(Math.random() * 400), rooms:8, cond:95, valueMult:8.0 }
    };
    const profile = profiles[tier.homeType] || profiles.apartment;
    h.type = profile.type;
    h.area = profile.area;
    h.rooms = profile.rooms;
    h.condition = profile.cond;
    const baseValue = 3500000;
    h.value = Math.round(baseValue * profile.valueMult * (typeof p14EgyptPriceIndex === 'function' ? p14EgyptPriceIndex(gameYear()) : 1));
    const neighborhoods = {
      0:['Shubra','Bulaq','Ain Shams','Imbaba','Old Cairo'],
      1:['Smouha','Sidi Gaber','Nasr City','Faisal','Agouza'],
      2:['Heliopolis','Maadi','Miami','Dokki','Mohandessin'],
      3:['New Cairo','Sheikh Zayed','Rehab','Madinaty','Palm Hills'],
      4:['Mivida','Villette','Sodic East','Marassi','Uptown Cairo'],
      5:['Katameya Heights','SODIC Estates','Marassi','Gouna','Diplomatic Quarter']
    };
    const hoods = neighborhoods[S.p76.wealthLevel] || neighborhoods[2];
    h.neighbourhood = hoods[Math.floor(Math.random() * hoods.length)];
    const featureBase = ['Balcony','Parking','Air conditioning'];
    const featureMid = featureBase.concat(['Elevator','Modern kitchen','Storage']);
    const featureHigh = featureMid.concat(['Private garden','Pool','Security gate','Staff quarters','Central AC']);
    h.features = S.p76.wealthLevel <= 1 ? featureBase.slice(0, 2)
      : S.p76.wealthLevel === 2 ? featureMid.slice(0, 4)
      : S.p76.wealthLevel === 3 ? featureMid : featureHigh;
    h.address = h.neighbourhood + ', ' + (h.city || 'Cairo');
  }

  /* =================================================================
     PART 4 — SETUP FROM TIER (from 77)
     ================================================================= */
  function p77SetupFromTier() {
    if (!S || !S.p76) return;
    p76Init(S);
    const level = S.p76.wealthLevel || 2;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;

    S.p77.socialClass = ['poor','poor','lower_mid','middle','upper','elite'][level] || 'middle';

    if (level >= 4) {
      S.p77.landHoldings = [
        { id:'land_farm', name:'Family agricultural land', acres:20 + Math.floor(Math.random() * 100), location:'Delta', valueInternal:(500000 + Math.random() * 2000000) * idx / rate }
      ];
      if (level === 5) {
        S.p77.landHoldings.push({ id:'land_north_coast', name:'North Coast beach plot', acres:2 + Math.random() * 5, location:'Marassi area', valueInternal:(3000000 + Math.random() * 7000000) * idx / rate });
        S.p77.landHoldings.push({ id:'land_new_cairo', name:'New Cairo plot', acres:5 + Math.random() * 10, location:'New Cairo', valueInternal:(5000000 + Math.random() * 10000000) * idx / rate });
      }
    }

    if (level >= 4) {
      S.p77.householdStaff = [
        { id:'maid', name:'Housekeeper', monthlyCostEGP:6500 },
        { id:'cook', name:'Cook', monthlyCostEGP:9000 }
      ];
      if (level === 5) {
        S.p77.householdStaff.push({ id:'driver', name:'Chauffeur', monthlyCostEGP:11000 });
        S.p77.householdStaff.push({ id:'nanny', name:'Nanny / governess', monthlyCostEGP:12000 });
        S.p77.householdStaff.push({ id:'gardener', name:'Gardener', monthlyCostEGP:5500 });
      }
    }

    /* Trust fund — bigger for ultra-wealthy */
    if (level === 5) {
      S.p77.trustFundBalance = (20000000 + Math.random() * 20000000) * idx / rate;
      S.p77.trustFundUnlockAge = 21;
    } else if (level === 4) {
      S.p77.trustFundBalance = (2000000 + Math.random() * 3000000) * idx / rate;
      S.p77.trustFundUnlockAge = 21;
    } else if (level === 3) {
      S.p77.trustFundBalance = (100000 + Math.random() * 100000) * idx / rate;
      S.p77.trustFundUnlockAge = 25;
    }

    S.p77.eliteNetwork = level >= 4;
    p77GenerateExtendedFamily();

    if (S.p76.familyBusiness) p77InitBusinessFromName(S.p76.familyBusiness, level);
  }

  function p77GenerateExtendedFamily() {
    if (!S || !S.p76) return;
    const level = S.p76.wealthLevel || 2;
    const extCount = level >= 4 ? 5 + Math.floor(Math.random() * 4)
      : level >= 2 ? 3 + Math.floor(Math.random() * 3)
      : 1 + Math.floor(Math.random() * 2);
    const roles = ['Uncle','Aunt','Cousin','Cousin','Uncle','Aunt','Grandfather','Grandmother','Cousin'];
    S.p77.extendedFamily = [];
    for (let i = 0; i < extCount; i++) {
      const role = roles[i % roles.length];
      const name = (typeof localName === 'function') ? localName(S.country, Math.random() < 0.5 ? 'm' : 'f') : 'Family Member';
      const baseAge = role === 'Grandfather' || role === 'Grandmother' ? 68 + Math.floor(Math.random() * 15)
        : role === 'Uncle' || role === 'Aunt' ? (S.age + 25 + Math.floor(Math.random() * 20))
        : (S.age + Math.floor(Math.random() * 15) - 5);
      S.p77.extendedFamily.push({
        id: 'ext_' + i + '_' + Math.random().toString(36).slice(2, 6),
        role: role, name: name, age: baseAge,
        bond: 40 + Math.floor(Math.random() * 40),
        tier: level, alive: true,
        notes: role === 'Grandfather' || role === 'Grandmother'
          ? (level >= 4 ? 'Owns family land' : 'Retired')
          : role === 'Uncle' || role === 'Aunt'
            ? (level >= 4 ? 'Has business interests' : 'Regular middle-class life')
            : (level >= 4 ? 'Well-connected' : 'Studies or works locally')
      });
    }
  }

  function p77InitBusinessFromName(name, level) {
    if (!S) return;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
    const baseRevenue = level === 5 ? 20000000 : level === 4 ? 3000000 : 500000;
    const baseEmployees = level === 5 ? 200 : level === 4 ? 35 : 8;
    S.p77.familyBusinessRevenue = (baseRevenue + Math.random() * baseRevenue * 0.5) * idx / rate;
    S.p77.familyBusinessEmployees = baseEmployees + Math.floor(Math.random() * baseEmployees * 0.5);
    S.p77.familyBusinessName = name;
  }

  /* =================================================================
     PART 5 — CARDS
     ================================================================= */
  function p77FamilyBusinessCard() {
    if (!S || !S.p76 || !S.p76.familyBusiness) return '';
    p76Init(S);
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const bizName = S.p76.familyBusiness;
    const revenueEGP = Math.round(S.p77.familyBusinessRevenue * rate);
    const employees = S.p77.familyBusinessEmployees;
    const works = S.p77.worksForFamily;
    const manages = S.p77.familyBusinessManaged;

    const sectorInfo = {
      'Delta Textiles': { sector:'Textile manufacturing', founded:1978, hq:'Mahalla al-Kubra' },
      'Nile Trading Company': { sector:'Import & export', founded:1985, hq:'Alexandria' },
      'Pyramid Foods': { sector:'Food processing', founded:1992, hq:'6th of October' },
      'Cairo Medical Supplies': { sector:'Medical equipment distribution', founded:2001, hq:'Cairo' },
      'Alexandria Shipping Co.': { sector:'Maritime logistics', founded:1968, hq:'Alexandria Port' },
      'Nile Valley Real Estate': { sector:'Property development', founded:1995, hq:'New Cairo' }
    }[bizName] || { sector:'Family business', founded:1980, hq:'Egypt' };

    const roles = [
      { title:'Junior Associate', minAge:18, salary:0.015, next:'Operations Associate' },
      { title:'Operations Associate', minAge:20, salary:0.025, next:'Senior Associate' },
      { title:'Senior Associate', minAge:23, salary:0.035, next:'Department Manager' },
      { title:'Department Manager', minAge:26, salary:0.055, next:'Operations Director' },
      { title:'Operations Director', minAge:30, salary:0.080, next:'General Manager' },
      { title:'General Manager', minAge:35, salary:0.120, next:'CEO / Chairman' },
      { title:'CEO / Chairman', minAge:40, salary:0.180, next:null }
    ];
    let currentRole = roles[0];
    const yearsWorked = Number(S.p80_familyYearsWorked) || 0;
    for (let i = 0; i < roles.length; i++) {
      if (S.age >= roles[i].minAge && yearsWorked >= i * 2) currentRole = roles[i];
    }

    let html = '<section class="card" style="border-color:var(--mint)">';
    html += '<h3>💼 ' + bizName + '</h3>';
    html += '<p class="muted" style="font-size:.82rem">' + sectorInfo.sector + ' · Founded ' + sectorInfo.founded + ' · HQ ' + sectorInfo.hq + '</p>';
    html += '<div class="row"><span>Annual revenue</span><b class="mono" style="color:var(--mint)">E£' + revenueEGP.toLocaleString() + '</b></div>';
    html += '<div class="row"><span>Employees</span><b>' + employees + '</b></div>';
    html += '<div class="row"><span>Family ownership</span><b>100% · ' + (S.p76.siblingCount || 0) + ' sibling heirs</b></div>';

    if (works) {
      const sal = Math.round(revenueEGP * currentRole.salary);
      html += '<div style="margin-top:12px;padding:10px;background:rgba(52,211,153,.08);border-radius:8px;border-left:3px solid var(--mint)">';
      html += '<div class="muted" style="font-size:.68rem;letter-spacing:.06em;font-weight:700">YOUR ROLE</div>';
      html += '<div style="font-size:1rem;font-weight:700;margin-top:3px">' + currentRole.title + '</div>';
      html += '<div class="row" style="padding:3px 0"><span>Annual salary</span><b class="mono" style="color:var(--mint)">E£' + sal.toLocaleString() + '/yr</b></div>';
      html += '<div class="row" style="padding:3px 0"><span>Tenure</span><b>' + yearsWorked + ' year(s)</b></div>';
      if (currentRole.next) html += '<div class="row" style="padding:3px 0"><span>Next step</span><b>' + currentRole.next + '</b></div>';
      html += '<button class="btn" style="border-color:var(--rose);color:var(--rose);margin-top:8px" onclick="p77QuitFamilyBusiness()">Leave the family business</button>';
      html += '</div>';
      if (!manages && S.age >= 21) html += '<button class="btn" onclick="p77ManageFamilyBusiness()">Manage the business<small>+15–30%/yr revenue</small></button>';
      if (manages) {
        html += '<div class="row" style="border-top:1px solid var(--line);margin-top:10px;padding-top:8px"><span>You manage</span><b style="color:var(--mint)">Active</b></div>';
        html += '<button class="btn" style="border-color:var(--amber)" onclick="p77StopManaging()">Step back</button>';
      }
      if (S.age >= 25) html += '<button class="btn" onclick="p77InheritBusiness()" style="border-color:var(--violet)">Request your share</button>';
    } else {
      const startSalary = Math.round(revenueEGP * roles[0].salary);
      html += '<div style="margin-top:12px;padding:10px;background:rgba(255,255,255,.03);border-radius:8px">';
      html += '<div class="muted" style="font-size:.72rem;margin-bottom:4px">Join the family business:</div>';
      html += '<b>' + roles[0].title + '</b> · E£' + startSalary.toLocaleString() + '/yr';
      html += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700;margin-top:6px" onclick="p77WorkForFamily()">Join the family business</button>';
      html += '</div>';
    }
    html += '</section>';
    return html;
  }
  window.p77FamilyBusinessCard = p77FamilyBusinessCard;

  function p77HouseholdStaffCard() {
    if (!S || !S.p77 || !S.p77.householdStaff.length) return '';
    const monthly = S.p77.householdStaff.reduce(function (s, x) { return s + (x.monthlyCostEGP || 0); }, 0);
    let html = '<section class="card" style="border-color:var(--violet)"><h3>👥 Household staff</h3>' +
      '<p class="muted" style="font-size:.82rem">Employed by your family. Covered by them while you live at home.</p>';
    S.p77.householdStaff.forEach(function (s) {
      html += '<div class="row" style="padding:4px 0;font-size:.84rem"><span>' + s.name + '</span><b class="mono">E£' + s.monthlyCostEGP.toLocaleString() + '/month</b></div>';
    });
    html += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Total monthly</b></span><b class="mono" style="color:var(--rose)">E£' + monthly.toLocaleString() + '</b></div>';
    html += '<div class="row"><span><b>Total yearly</b></span><b class="mono" style="color:var(--rose)">E£' + (monthly * 12).toLocaleString() + '</b></div>';
    html += '</section>';
    return html;
  }
  window.p77HouseholdStaffCard = p77HouseholdStaffCard;

  function p77TrustFundCard() {
    if (!S || !S.p77 || S.p77.trustFundBalance <= 0) return '';
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const bal = Math.round(S.p77.trustFundBalance * rate);
    const unlockAge = S.p77.trustFundUnlockAge || 21;
    const locked = S.age < unlockAge;
    let html = '<section class="card" style="border-color:var(--amber)"><h3>🏦 Family Trust Fund</h3>' +
      '<div class="row"><span>Balance</span><b class="mono" style="color:var(--mint)">E£' + bal.toLocaleString() + '</b></div>' +
      '<div class="row"><span>Unlocks at age</span><b>' + unlockAge + '</b></div>';
    if (locked) html += '<p class="muted" style="font-size:.82rem;margin-top:8px">Managed by your family until age ' + unlockAge + '. Earns 12% APY.</p>';
    else html += '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p77WithdrawTrustFund()">Withdraw entire balance</button>';
    html += '</section>';
    return html;
  }
  window.p77TrustFundCard = p77TrustFundCard;

  function p77ExtendedFamilyCard() {
    if (!S || !S.p77 || !S.p77.extendedFamily.length) return '';
    let html = '<section class="card" style="border-color:var(--cyan)"><h3>👨‍👩‍👧‍👦 Extended family</h3>' +
      '<p class="muted" style="font-size:.82rem">Uncles, aunts, cousins, grandparents. Their connections matter for jobs and marriage prospects.</p>';
    S.p77.extendedFamily.forEach(function (ext) {
      if (!ext.alive) return;
      const bondColor = ext.bond >= 70 ? 'var(--mint)' : ext.bond >= 40 ? 'var(--cyan)' : 'var(--amber)';
      html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center">' +
        '<div><b>' + ext.name + '</b> <span class="muted" style="font-size:.78rem">· ' + ext.role + ', ' + ext.age + '</span></div>' +
        '<span style="color:' + bondColor + ';font-size:.78rem">Bond ' + ext.bond + '%</span>' +
        '</div>' +
        '<p class="muted" style="font-size:.78rem;margin-top:4px">' + (ext.notes || '') + '</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:6px">' +
        '<button class="btn" style="margin:0;padding:6px;font-size:.75rem" onclick="p77VisitExtended(\'' + ext.id + '\')">Visit</button>' +
        '<button class="btn" style="margin:0;padding:6px;font-size:.75rem" onclick="p77AskExtendedFavor(\'' + ext.id + '\')">Ask favor</button>' +
        '</div></div>';
    });
    html += '</section>';
    return html;
  }
  window.p77ExtendedFamilyCard = p77ExtendedFamilyCard;

  function p77PrestigeCard() {
    if (!S || !S.p77) return '';
    const prestige = S.p77.prestigePoints || 0;
    const level = (S.p76 && S.p76.wealthLevel) || 2;
    const basePrestige = [10,20,40,60,80,100][level] || 40;
    const total = basePrestige + prestige;
    const rank = total >= 150 ? 'Legendary' : total >= 120 ? 'Elite' : total >= 90 ? 'High Society' : total >= 60 ? 'Upper class' : total >= 40 ? 'Middle class' : 'Working class';
    const color = total >= 120 ? 'var(--amber)' : total >= 90 ? 'var(--violet)' : total >= 60 ? 'var(--cyan)' : 'var(--muted)';
    return '<section class="card"><h3>⭐ Social Standing</h3>' +
      '<div class="row"><span>Rank</span><b style="color:' + color + '">' + rank + '</b></div>' +
      '<div class="row"><span>Prestige</span><b class="mono">' + total + '</b></div>' +
      '<p class="muted" style="font-size:.78rem;margin-top:6px">Prestige comes from education, career, marriage, and family name.</p>' +
      '</section>';
  }
  window.p77PrestigeCard = p77PrestigeCard;

  function p77MarriageExpectationCard() {
    if (!S || !S.p76 || S.age < 16) return '';
    const traits = S.p76.parentsTraits || {};
    if ((traits.traditional || 5) < 7) return '';
    const level = S.p76.wealthLevel || 2;
    const expectedDowry = level >= 4 ? 500000 : level >= 2 ? 100000 : 30000;
    const expectedMahr = level >= 4 ? 200000 : level >= 2 ? 50000 : 15000;
    return '<section class="card" style="border-color:var(--violet)"><h3>💍 Marriage expectations</h3>' +
      '<p class="muted" style="font-size:.82rem">Your family follows traditional Egyptian customs.</p>' +
      '<div class="row"><span>Expected Mahr (dowry)</span><b class="mono">E£' + expectedMahr.toLocaleString() + '</b></div>' +
      '<div class="row"><span>Expected wedding scale</span><b>' + (level >= 4 ? 'Large (300+ guests)' : level >= 2 ? 'Medium (150 guests)' : 'Modest (50 guests)') + '</b></div>' +
      '</section>';
  }
  window.p77MarriageExpectationCard = p77MarriageExpectationCard;

  /* =================================================================
     PART 6 — ACTIONS
     ================================================================= */
  window.p77WorkForFamily = function () {
    if (!S || !S.p77) return;
    if (S.age < 18) return hint('You must be 18+ to work at the family business.');
    if (!S.degree && !S.diploma) return hint('You need at least a high school diploma.');
    if (S.job) return hint('Quit your current job first.');
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const revEGP = Math.round(S.p77.familyBusinessRevenue * rate);
    const salaryEGP = Math.round(revEGP * 0.015);
    const salaryInternal = salaryEGP / rate;
    S.p77.worksForFamily = true;
    S.job = {
      trackId:'entry', level:0, title:'Family Business Associate',
      salary: salaryInternal, perf:60, years:0,
      company: S.p76.familyBusiness, companySize:'family business', companyFactor:1,
      benefits:{ medical:true, social:true, bonus:0.02, leave:21, remote:'On-site', hours:40, pension:true, contract:'Family employment' },
      stress:3, isFamilyBusiness:true
    };
    log('💼 You started working for ' + S.p76.familyBusiness + ' at E£' + salaryEGP.toLocaleString() + '/year.');
    render();
  };

  window.p77QuitFamilyBusiness = function () {
    if (!S || !S.p77) return;
    if (!confirm('Leave the family business? Your parents may be disappointed.')) return;
    S.p77.worksForFamily = false;
    if (S.job && S.job.isFamilyBusiness) S.job = null;
    (typeof parents === 'function' ? parents() : []).forEach(function (p) { if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 8); });
    log('You left the family business.');
    render();
  };

  window.p77ManageFamilyBusiness = function () {
    if (!S || !S.p77) return;
    if (S.p77.familyBusinessManaged) return hint('You already manage it.');
    if (S.age < 21) return hint('Managing requires age 21+.');
    S.p77.familyBusinessManaged = true;
    S.p77.familyBusinessRevenue *= 1.20;
    fx({ happiness: 4, smarts: 2, health: -2 });
    log('💼 You took on a management role at ' + S.p76.familyBusiness + '. Revenue +20% year 1.');
    render();
  };

  window.p77StopManaging = function () {
    if (!S || !S.p77) return;
    S.p77.familyBusinessManaged = false;
    log('You stepped back from managing.');
    render();
  };

  window.p77InheritBusiness = function () {
    if (!S || !S.p76 || !S.p77) return;
    const siblings = (S.family || []).filter(function (m) { return m && m.role === 'Sibling' && m.alive !== false; });
    const totalShares = 1 + siblings.length;
    const myShare = 1 / totalShares;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const bizValueEGP = Math.round(S.p77.familyBusinessRevenue * rate * 3.5);
    const myValueEGP = Math.round(bizValueEGP * myShare);
    if (!confirm('Request your share of ' + S.p76.familyBusiness + '?\n\nTotal value: E£' + bizValueEGP.toLocaleString() + '\nYour share: E£' + myValueEGP.toLocaleString() + ' (' + Math.round(myShare * 100) + '%)')) return;
    const generosity = (S.p76.parentsTraits && S.p76.parentsTraits.generosity) || 6;
    if (Math.random() < Math.min(0.9, 0.35 + generosity * 0.05)) {
      S.wealth += myValueEGP / rate * 0.5;
      log('💼 Parents agreed to transfer some business equity. Cash advance: E£' + Math.round(myValueEGP * 0.5).toLocaleString() + '.');
      S.p77.familyBusinessManaged = true;
    } else {
      (typeof parents === 'function' ? parents() : []).forEach(function (p) { if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 5); });
      log('❌ Your parents declined to transfer business shares.');
    }
    render();
  };

  window.p77VisitExtended = function (id) {
    const ext = (S.p77.extendedFamily || []).find(function (e) { return e.id === id; });
    if (!ext) return;
    ext.bond = Math.min(100, ext.bond + 6);
    fx({ social: 2, happiness: 2 });
    log('You visited your ' + ext.role.toLowerCase() + ' ' + ext.name + '.');
    render();
  };

  window.p77AskExtendedFavor = function (id) {
    const ext = (S.p77.extendedFamily || []).find(function (e) { return e.id === id; });
    if (!ext) return;
    if (ext.bond < 40) return hint('Your bond is too low.');
    if (ext.tier >= 4) {
      const amt = 20000 + Math.floor(Math.random() * 80000);
      if (Math.random() < 0.55) {
        S.wealth += amt / (typeof rateNow === 'function' ? rateNow() : 52.7);
        log('💵 Your ' + ext.role.toLowerCase() + ' lent you E£' + amt.toLocaleString() + '.');
      } else log('Your ' + ext.role.toLowerCase() + ' politely declined.');
    } else log('Your ' + ext.role.toLowerCase() + ' cannot help much financially.');
    render();
  };

  window.p77WithdrawTrustFund = function () {
    if (!S || !S.p77) return;
    if (S.age < (S.p77.trustFundUnlockAge || 21)) return hint('Trust fund is locked until age ' + S.p77.trustFundUnlockAge + '.');
    if (!confirm('Withdraw entire trust fund?')) return;
    const amt = S.p77.trustFundBalance;
    S.wealth += amt;
    log('💎 Withdrew E£' + Math.round(amt * (typeof rateNow === 'function' ? rateNow() : 52.7)).toLocaleString() + ' from the family trust fund.');
    S.p77.trustFundBalance = 0;
    render();
  };

  /* =================================================================
     PART 7 — YEARLY TICKS (business, trust fund, extended family)
     ================================================================= */
  function p77Year() {
    if (!S || !S.p77) return;
    p76Init(S);
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;

    /* Trust fund interest */
    if (S.p77.trustFundBalance > 0 && S.age < (S.p77.trustFundUnlockAge || 21)) {
      const interest = S.p77.trustFundBalance * 0.12;
      S.p77.trustFundBalance += interest;
      log('💎 Trust fund interest: E£' + Math.round(interest * rate).toLocaleString() + ' this year.');
    }

    /* Family business revenue */
    if (S.p77.familyBusinessRevenue > 0 && S.p76.familyBusiness) {
      const growth = S.p77.familyBusinessManaged ? 0.20 + Math.random() * 0.15 : 0.05 + Math.random() * 0.08;
      S.p77.familyBusinessRevenue *= (1 + growth);
      if (S.age >= 21 && !S.p77.worksForFamily) {
        const divPct = S.p77.familyBusinessManaged ? 0.18 : 0.10;
        const sibCount = (S.family || []).filter(function (m) { return m && m.role === 'Sibling'; }).length;
        const dividend = S.p77.familyBusinessRevenue * divPct / (1 + sibCount);
        S.wealth += dividend;
        S.income = (S.income || 0) + dividend;
        log('📈 Family business dividend: E£' + Math.round(dividend * rate).toLocaleString() + '.');
      }
    }

    /* Land appreciation */
    S.p77.landHoldings.forEach(function (land) {
      if (land) land.valueInternal = (Number(land.valueInternal) || 0) * (1 + 0.05 + Math.random() * 0.05);
    });

    /* Extended family ages */
    S.p77.extendedFamily.forEach(function (ext) {
      if (!ext || !ext.alive) return;
      ext.age++;
      ext.bond = Math.max(0, ext.bond - 3);
      if (ext.age >= 75 && Math.random() < 0.10) {
        ext.alive = false;
        log('🕊️ Your ' + ext.role.toLowerCase() + ' ' + ext.name + ' passed away.');
      }
    });

    p77ApplyChildhoodPrivileges();
  }

  function p77ApplyChildhoodPrivileges() {
    if (!S || !S.p76 || S.age > 18) return;
    const level = S.p76.wealthLevel || 2;
    if (level >= 4 && S.age >= 6 && S.age <= 17) {
      if (S.p77.childhoodPrivileges.indexOf('tutors_' + S.age) === -1) {
        S.p77.childhoodPrivileges.push('tutors_' + S.age);
        fx({ smarts: 3, happiness: 2 });
        log('🎓 Private tutors and enrichment lessons.');
      }
    }
    if (level >= 3 && S.age >= 6 && S.age <= 17) {
      if (S.p77.childhoodPrivileges.indexOf('intl_school_' + S.age) === -1) {
        S.p77.childhoodPrivileges.push('intl_school_' + S.age);
        fx({ smarts: 2, social: 3 });
        log('🌍 International school events and networks.');
      }
    }
    if (level >= 4 && S.age >= 10 && S.age <= 17) {
      if (Math.random() < 0.5) {
        S.p77.childhoodPrivileges.push('summer_abroad_' + S.age);
        fx({ smarts: 2, social: 3, happiness: 4 });
        log('✈️ Summer abroad — international culture exposure.');
      }
    }
    if (level === 5 && S.age >= 6 && S.age <= 17) {
      if (S.p77.childhoodPrivileges.indexOf('elite_hobbies_' + S.age) === -1) {
        S.p77.childhoodPrivileges.push('elite_hobbies_' + S.age);
        fx({ smarts: 1, social: 4, health: 2, happiness: 3 });
        log('🏇 Elite hobbies: riding, tennis, piano.');
      }
    }
  }

  /* =================================================================
     PART 8 — SINGLE ageUp WRAPPER
     ================================================================= */
  const _ageUp = ageUp;
  ageUp = function () {
    const a0 = S && S.age;
    const r = _ageUp.apply(this, arguments);
    if (!S || S.age === a0) return r;
    try { p77Year(); } catch (e) { console.error('[p76] p77Year failed:', e); }
    if (S.p77 && S.p77.worksForFamily) S.p80_familyYearsWorked = (S.p80_familyYearsWorked || 0) + 1;
    else S.p80_familyYearsWorked = 0;
    return r;
  };

  /* =================================================================
     PART 9 — VIEW WRAPPERS
     ================================================================= */

  /* ---- viewCareer: family business card ---- */
  const _viewCareer = viewCareer;
  viewCareer = function () {
    let html = '';
    try { html = _viewCareer.apply(this, arguments); } catch (e) { console.error('[p76] viewCareer:', e); html = ''; }
    if (!html || !S) return html;
    if (S.country !== S.home) return html;
    if (S.age < 18) return html;
    if (!S.p76 || !S.p76.familyBusiness) return html;
    /* Remove any existing family business card so we add only one */
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family ownership[\s\S]*?<\/section>/g, '');
    const card = p77FamilyBusinessCard();
    return card ? card + html : html;
  };

  /* ---- viewFamily: extended family + prestige + marriage ---- */
  const _viewFamily = viewFamily;
  viewFamily = function () {
    let html = _viewFamily.apply(this, arguments);
    if (!S || !S.p77) return html;
    /* Remove any existing instance of these cards to prevent duplication */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👨‍👩‍👧‍👦 Extended family<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>⭐ Social Standing<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💍 Marriage expectations<\/h3>[\s\S]*?<\/section>/g, '');
    html += p77ExtendedFamilyCard();
    html += p77PrestigeCard();
    html += p77MarriageExpectationCard();
    return html;
  };

  /* ---- viewAssets: household staff ---- */
  const _viewAssets = viewAssets;
  viewAssets = function () {
    let html = _viewAssets.apply(this, arguments);
    if (!S || !S.p77) return html;
    if (S.country !== S.home) return html;
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👥 Household staff<\/h3>[\s\S]*?<\/section>/g, '');
    html += p77HouseholdStaffCard();
    return html;
  };

  /* ---- viewBank: trust fund ---- */
  const _viewBank = viewBank;
  viewBank = function () {
    let html = _viewBank.apply(this, arguments);
    if (!S || !S.p77) return html;
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏦 Family Trust Fund<\/h3>[\s\S]*?<\/section>/g, '');
    html += p77TrustFundCard();
    return html;
  };

  /* ---- viewLife: STRIP the misplaced cards ---- */
  const _viewLife = viewLife;
  viewLife = function () {
    let html = '';
    try { html = _viewLife.apply(this, arguments); } catch (e) { console.error('[p76] viewLife:', e); html = ''; }
    if (!html) return html;

    /* Remove cards that belong in other tabs */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👨‍👩‍👧‍👦 Extended family<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>⭐ Social Standing<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>💍 Marriage expectations<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>👥 Household staff<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏦 Family Trust Fund<\/h3>[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family ownership[\s\S]*?<\/section>/g, '');

    /* Keep the family background card (that one belongs on Life) */

    return html;
  };

  /* Add family background card to Life tab */
  const _viewLife2 = viewLife;
  viewLife = function () {
    let html = _viewLife2.apply(this, arguments);
    if (!S || !S.p76 || !S.p76.setupDone) return html;
    const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
    const preset = P76_PARENT_PRESETS[S.p76.parentsTraits ? S.p76.parentsTraits.preset : 'balanced'] || P76_PARENT_PRESETS.balanced;
    const occ = P76_OCCUPATIONS.find(function (o) { return o.id === S.p76.familyOccupation; });
    const card = '<section class="card" style="padding:12px;border-left:3px solid ' + (S.p76.wealthLevel >= 4 ? 'var(--mint)' : S.p76.wealthLevel >= 2 ? 'var(--cyan)' : 'var(--amber)') + '">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<div>' +
      '<div class="muted" style="font-size:.68rem;letter-spacing:.06em;font-weight:700">FAMILY BACKGROUND</div>' +
      '<div style="font-size:1rem;font-weight:700;margin-top:4px">' + tier.icon + ' ' + tier.name + '</div>' +
      '<div class="muted" style="font-size:.75rem;margin-top:2px">' + preset.icon + ' ' + preset.label +
      (occ && occ.id !== 'none' ? ' · ' + occ.name : '') +
      (S.p76.siblingCount > 0 ? ' · ' + S.p76.siblingCount + ' sibling(s)' : '') + '</div>' +
      '</div>' +
      '<div style="text-align:right"><div class="mono" style="font-size:.85rem;color:var(--mint)">Rep ' + S.p76.reputation + '</div><div class="muted" style="font-size:.65rem">family reputation</div></div>' +
      '</div>' +
      (S.p76.familyBusiness ? '<div class="row" style="margin-top:8px;border:0;padding:3px 0;font-size:.78rem"><span>Family business</span><b>' + S.p76.familyBusiness + '</b></div>' : '') +
      (S.p76.connections > 0 ? '<div class="row" style="border:0;padding:3px 0;font-size:.78rem"><span>Family connections</span><b>' + S.p76.connections + '/100</b></div>' : '') +
      '</section>';
    return card + html;
  };

  /* =================================================================
     PART 10 — WATCHDOG: keep Life tab clean on every render
     ================================================================= */
  function cleanLifeTab() {
    if (!S) return;
    if (typeof activeTab === 'undefined' || activeTab !== 'life') return;
    const view = document.getElementById('view');
    if (!view) return;
    const badHeadings = ['👨‍👩‍👧‍👦 Extended family', '⭐ Social Standing', '💍 Marriage expectations', '👥 Household staff', '🏦 Family Trust Fund'];
    view.querySelectorAll('section.card').forEach(function (sec) {
      const h3 = sec.querySelector('h3');
      if (!h3) return;
      const t = h3.textContent || '';
      for (let i = 0; i < badHeadings.length; i++) {
        if (t.indexOf(badHeadings[i]) !== -1) { sec.remove(); return; }
      }
      if (t.indexOf('💼') === 0 && (sec.textContent || '').indexOf('Family ownership') !== -1) sec.remove();
    });
  }
  setInterval(cleanLifeTab, 200);

  /* =================================================================
     PART 11 — FAMILY YEAR (pocket money, gifts, dividends)
     ================================================================= */
  const _familyYear = familyYear;
  familyYear = function () {
    const r = _familyYear.apply(this, arguments);
    if (!S || !S.p76) return r;
    const tier = P76_TIERS[S.p76.wealthTier] || P76_TIERS.middle;
    const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;

    /* Pocket money for children 8-17 */
    if (S.age >= 8 && S.age < 18 && tier.pocketMoneyBase > 0) {
      /* Age-scaled: 5% under 11, 15% 11-13, 30% 14-15, 50% 16-17 */
      const factor = S.age <= 10 ? 0.05 : S.age <= 13 ? 0.15 : S.age <= 15 ? 0.30 : 0.50;
      const monthly = Math.round(tier.pocketMoneyBase * factor);
      const annual = monthly * 12;
      const internal = annual * idx / rate;
      S.wealth += internal;
      S.income = (S.income || 0) + internal;
      if (annual > 0) log('💰 Received E£' + annual.toLocaleString() + ' in pocket money.');
    }

    /* Gifts for 18-25 */
    if (S.age >= 18 && S.age <= 25 && tier.giftChance > 0) {
      if (Math.random() < tier.giftChance) {
        const amt = Math.round(30000 * tier.giftScale * idx);
        S.wealth += amt / rate;
        S.income = (S.income || 0) + amt / rate;
        log('🎁 Your parents gave you E£' + amt.toLocaleString() + ' as a gift.');
      }
    }

    /* Ultra-wealthy family support */
    if (S.p76.wealthLevel >= 4 && S.age >= 18 && S.age <= 35) {
      if (Math.random() < 0.4) {
        const amt = Math.round((100000 + Math.random() * 500000) * idx);
        S.wealth += amt / rate;
        S.income = (S.income || 0) + amt / rate;
        log('💎 Family support: E£' + amt.toLocaleString() + '.');
      }
    }

    /* Family business dividends handled by p77Year */

    return r;
  };

  /* =================================================================
     PART 12 — INVERT FAMILY REQUESTS FOR RICH TIERS
     ================================================================= */
  function blockRichFamilyRequests() {
    if (!S || !S.p76) return false;
    return Number(S.p76.wealthLevel) >= 3;
  }

  if (typeof p12GenerateFamilyNeed === 'function') {
    const _gen = p12GenerateFamilyNeed;
    p12GenerateFamilyNeed = function () {
      if (blockRichFamilyRequests()) return;
      return _gen.apply(this, arguments);
    };
  }

  if (typeof p14ShowParentRequestModal === 'function') {
    const _p14 = p14ShowParentRequestModal;
    p14ShowParentRequestModal = function () {
      if (blockRichFamilyRequests()) {
        if (S) { S.parentNeed = null; S.familyNeed = null; }
        const el = document.getElementById('p14-parent-request-modal');
        if (el) el.remove();
        return;
      }
      return _p14.apply(this, arguments);
    };
  }

  /* =================================================================
     PART 13 — ELITE NETWORK reduces job requirements
     ================================================================= */
  if (typeof p12Eligibility === 'function') {
    const _elig = p12Eligibility;
    p12Eligibility = function (post) {
      if (S && S.p77 && S.p77.eliteNetwork && post) {
        const smartsReq = post.smarts || 0;
        const engReq = post.eng || 0;
        if ((S.smarts || 0) < smartsReq && (S.smarts || 0) >= smartsReq * 0.9) return '';
        if ((S.eng || 0) < engReq && (S.eng || 0) >= engReq * 0.9) return '';
      }
      return _elig.apply(this, arguments);
    };
  }

  /* =================================================================
     PART 14 — INHERITANCE UPGRADE
     ================================================================= */
  if (typeof p60HandleParentDeath === 'function') {
    const _death = p60HandleParentDeath;
    p60HandleParentDeath = function (parent, cause) {
      const wasLast = (S.family || []).filter(function (m) { return m && m.alive !== false && m !== parent && (m.role === 'Mother' || m.role === 'Father'); }).length === 0;
      const r = _death.apply(this, arguments);
      if (wasLast && S.p77) {
        const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
        /* Business inheritance */
        if (S.p76 && S.p76.familyBusiness) {
          const sibCount = (S.family || []).filter(function (m) { return m && m.role === 'Sibling' && m.alive !== false; }).length;
          const myShare = 1 / (1 + sibCount);
          const bizValueEGP = Math.round(S.p77.familyBusinessRevenue * rate * 3.5);
          S.wealth += (bizValueEGP * myShare) / rate;
          log('💼 Inherited ' + Math.round(myShare * 100) + '% of ' + S.p76.familyBusiness + '.');
          if (myShare >= 0.5) S.p77.familyBusinessManaged = true;
        }
        /* Land inheritance */
        let landTotal = 0;
        S.p77.landHoldings.forEach(function (l) { landTotal += Number(l.valueInternal) || 0; });
        if (landTotal > 0) {
          const sibCount = (S.family || []).filter(function (m) { return m && m.role === 'Sibling' && m.alive !== false; }).length;
          S.wealth += landTotal / (1 + sibCount);
          log('🏞️ Inherited land worth E£' + Math.round(landTotal / (1 + sibCount) * rate).toLocaleString() + '.');
        }
        /* Trust fund unlock */
        if (S.p77.trustFundBalance > 0) {
          S.p77.trustFundUnlockAge = 0;
          log('💎 Trust fund unlocked. Balance: E£' + Math.round(S.p77.trustFundBalance * rate).toLocaleString() + '.');
        }
      }
      return r;
    };
  }

  /* =================================================================
     PART 15 — INIT
     ================================================================= */
  p76Init(S);
  console.log('[p76] Family + dynasty (Phase 3.3b) loaded');
})();
