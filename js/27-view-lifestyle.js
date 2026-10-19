/* ============================================================
   VIEW: LIFESTYLE (EXPANDED & DETAILED)
   ============================================================
   Owns: S.lifestyle (config), annual living costs.
   REFUNDS engine's basic charge in year tick — replaces it entirely
   once player configures.
   Registers tab 'lifestyle' at order 13.
   ============================================================ */

/* ---------- STATE ---------- */
function ensureLifestyleState() {
  if (!S) return;
  if (!S.lifestyle) {
    S.lifestyle = {
      active: false,
      country: S.country,
      phone: 'basic',
      internet: 'basic',
      utilities: 'standard',
      food: 'standard',
      dining: 'sometimes',
      transport: 'public',
      clothing: 'standard',
      entertainment: 'standard',
      personal_care: 'standard',
      domestic_staff: 'none',
      healthcare_insurance: 'public',
      subscriptions: [],
      charityPct: 0,
      tab: 'overview',
      monthlyTotal: 0,
      yearlyTotal: 0
    };
  }
  const lf = S.lifestyle;
  if (typeof lf.active !== 'boolean') lf.active = false;
  if (typeof lf.country !== 'string') lf.country = S.country;
  if (!Array.isArray(lf.subscriptions)) lf.subscriptions = [];
  if (typeof lf.charityPct !== 'number') lf.charityPct = 0;
  if (!lf.tab) lf.tab = 'overview';
  if (typeof lf.monthlyTotal !== 'number') lf.monthlyTotal = 0;
  if (typeof lf.yearlyTotal !== 'number') lf.yearlyTotal = 0;

  /* Handle missing new categories from updates */
  if (!lf.personal_care) lf.personal_care = 'standard';
  if (!lf.domestic_staff) lf.domestic_staff = 'none';
  if (!lf.healthcare_insurance) lf.healthcare_insurance = 'public';

  /* Country changed → reset plans to country defaults */
  if (lf.country !== S.country) {
    lf.country = S.country;
    lf.active = false;
    lf.phone = 'basic';
    lf.internet = 'basic';
    lf.utilities = 'standard';
    lf.food = 'standard';
    lf.dining = 'sometimes';
    lf.transport = 'public';
    lf.clothing = 'standard';
    lf.entertainment = 'standard';
    lf.personal_care = 'standard';
    lf.domestic_staff = 'none';
    lf.healthcare_insurance = 'public';
    lf.subscriptions = [];
  }
}
GameHooks.on('newGame', ensureLifestyleState);
GameHooks.on('migrate', ensureLifestyleState);

/* ---------- HELPERS ---------- */
function lifeSetTab(tab) { S.lifestyle.tab = tab; render(); }
window.lifeSetTab = lifeSetTab;

function lifeCurrency() { return C().currency || 'EGP'; }
function lifePlans() { return LIFE_PLANS[S.country] || LIFE_PLANS.egy; }

function lifeSubPrice(subId) {
  const sub = LIFE_SUBSCRIPTIONS.find(function(s) { return s.id === subId; });
  if (!sub) return 0;
  return sub.prices[S.country] || sub.prices.egy || 0;
}

/* Calculate the monthly + yearly total */
function lifeCalculate() {
  const plans = lifePlans();
  const lf = S.lifestyle;
  let monthly = 0;
  let happiness = 0;
  let health = 0;
  let smarts = 0;
  let social = 0;

  /* If living with parents: minimal personal spending */
  if (S.housing === 'parents') {
    const phonePlan = plans.phone.find(function(p) { return p.id === lf.phone; }) || plans.phone[0];
    monthly = phonePlan.monthly + 200; // personal allowance
    
    // They still pay for their own subscriptions
    lf.subscriptions.forEach(function(subId) {
      const sub = LIFE_SUBSCRIPTIONS.find(function(s) { return s.id === subId; });
      if (!sub) return;
      monthly += lifeSubPrice(subId);
      if (sub.happiness) happiness += sub.happiness;
      if (sub.health) health += sub.health;
      if (sub.smarts) smarts += sub.smarts;
      if (sub.social) social += sub.social;
    });

    return { monthly: monthly, yearly: Math.round(monthly * 12), happiness: happiness, health: health, smarts: smarts, social: social, isMinimal: true };
  }

  /* Regular Lifestyle Calc */
  const getMonthly = function(category) {
      const planList = plans[category];
      if(!planList) return 0;
      const plan = planList.find(function(p) { return p.id === lf[category]; }) || planList[0];
      return plan.monthly;
  };

  monthly += getMonthly('phone');
  monthly += getMonthly('internet');
  monthly += getMonthly('utilities');
  monthly += getMonthly('food');
  monthly += getMonthly('dining');
  monthly += getMonthly('transport');
  monthly += getMonthly('clothing');
  monthly += getMonthly('entertainment');
  monthly += getMonthly('personal_care');
  monthly += getMonthly('domestic_staff');
  monthly += getMonthly('healthcare_insurance');

  /* Subscriptions */
  lf.subscriptions.forEach(function(subId) {
    const sub = LIFE_SUBSCRIPTIONS.find(function(s) { return s.id === subId; });
    if (!sub) return;
    monthly += lifeSubPrice(subId);
    if (sub.happiness) happiness += sub.happiness;
    if (sub.health) health += sub.health;
    if (sub.smarts) smarts += sub.smarts;
    if (sub.social) social += sub.social;
  });

  /* Housing costs */
  let housingMonthly = 0;
  if (S.housing === 'rented') {
    /* C().prices.rent is yearly — divide to get monthly */
    housingMonthly = (C().prices.rent || 0) / 12;
  }
  /* Owned property: mortgage separate, not in lifestyle */
  monthly += housingMonthly;

  /* Happiness/health from tier selection */
  if (lf.food === 'survival') { happiness -= 3; health -= 3; }
  if (lf.food === 'budget') { happiness -= 1; health -= 1; }
  if (lf.food === 'premium') { happiness += 1; health += 2; }
  if (lf.food === 'luxury') { happiness += 3; health += 4; }
  
  if (lf.dining === 'often') happiness += 2;
  if (lf.dining === 'fine_dining') { happiness += 4; social += 2; }
  if (lf.dining === 'exclusive') { happiness += 6; social += 4; }
  
  if (lf.clothing === 'premium') { happiness += 2; social += 2; }
  if (lf.clothing === 'luxury') { happiness += 4; social += 5; }
  if (lf.clothing === 'haute_couture') { happiness += 6; social += 8; }
  
  if (lf.entertainment === 'active') { happiness += 4; social += 2; }
  if (lf.entertainment === 'luxury') { happiness += 7; social += 5; }
  if (lf.entertainment === 'jetset') { happiness += 10; social += 8; }
  
  if (lf.transport === 'public') { happiness -= 1; }
  if (lf.transport === 'own_car') { happiness += 3; health -= 1; }
  if (lf.transport === 'luxury_car') { happiness += 6; social += 3; }
  
  if (lf.personal_care === 'premium') { happiness += 2; health += 1; }
  if (lf.personal_care === 'luxury') { happiness += 5; health += 3; }
  
  if (lf.domestic_staff === 'cleaner') happiness += 2;
  if (lf.domestic_staff === 'full_maid') happiness += 5;
  if (lf.domestic_staff === 'full_estate_team') { happiness += 10; social += 5; }
  
  if (lf.healthcare_insurance === 'public') health -= 1;
  if (lf.healthcare_insurance === 'premium_private') health += 3;
  if (lf.healthcare_insurance === 'vip_concierge') { health += 6; happiness += 2; }

  return {
    monthly: Math.round(monthly),
    yearly: Math.round(monthly * 12),
    housingMonthly: Math.round(housingMonthly),
    happiness: happiness,
    health: health,
    smarts: smarts,
    social: social,
    isMinimal: false
  };
}

/* ---------- ACTIONS ---------- */
function lifeSetPlan(category, planId) {
  if (!S.lifestyle) return;
  S.lifestyle.active = true;
  S.lifestyle[category] = planId;
  render();
}
window.lifeSetPlan = lifeSetPlan;

function lifeToggleSubscription(subId) {
  if (!S.lifestyle) return;
  const lf = S.lifestyle;
  lf.active = true;
  const idx = lf.subscriptions.indexOf(subId);
  if (idx >= 0) lf.subscriptions.splice(idx, 1);
  else lf.subscriptions.push(subId);
  render();
}
window.lifeToggleSubscription = lifeToggleSubscription;

function lifeApplyPreset(presetId) {
  const preset = LIFE_PRESETS[presetId];
  if (!preset) return;
  S.lifestyle.active = true;
  
  const keys = ['phone', 'internet', 'utilities', 'food', 'dining', 'transport', 'clothing', 'entertainment', 'personal_care', 'domestic_staff', 'healthcare_insurance'];
  keys.forEach(function(k) {
      if(preset[k]) S.lifestyle[k] = preset[k];
  });
  
  S.lifestyle.subscriptions = preset.subscriptions.slice();
  log('🏠 Applied ' + preset.label + ' lifestyle preset.');
  render();
}
window.lifeApplyPreset = lifeApplyPreset;

function lifeSetCharity() {
  const input = prompt('Set charity/zakat % of wealth per year:\n(0 = none, 2.5 = zakat, 10 = generous)', String(S.lifestyle.charityPct));
  if (input === null) return;
  const pct = Math.max(0, Math.min(20, parseFloat(input) || 0));
  S.lifestyle.charityPct = pct;
  S.lifestyle.active = true;
  if (pct > 0) log('💝 Charity set to ' + pct + '% of wealth per year.');
  else log('Charity set to 0%.');
  render();
}
window.lifeSetCharity = lifeSetCharity;

/* ---------- MAIN VIEW ---------- */
function lifestyleView() {
  ensureLifestyleState();
  if (!S) return '';
  if (S.age < 15) return '<div class="card"><h3>🏠 Lifestyle</h3><p class="muted">Available from age 15+. Your parents handle the bills right now.</p></div>';

  const tabs = [
    ['overview', '📊 Overview'],
    ['home', '🏡 Home & Staff'],
    ['food', '🍽 Food & Dining'],
    ['style', '👕 Style & Care'],
    ['fun', '🎉 Fun & Travel'],
    ['charity', '💝 Charity']
  ];

  const totals = lifeCalculate();
  S.lifestyle.monthlyTotal = totals.monthly;
  S.lifestyle.yearlyTotal = totals.yearly;

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#f59e0b15 0%,transparent 100%);border-color:#f59e0b">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">LIFESTYLE BUDGET · ' + lifeCurrency() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + (S.lifestyle.active ? '💰 ' + money(totals.monthly) + '/mo' : '⚙️ Needs Configuration') + '</div></div>' +
    '<div style="font-size:2rem">🏠</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (S.lifestyle.tab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="lifeSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

  if (S.lifestyle.tab === 'overview') html += lifeRenderOverview(totals);
  else if (S.lifestyle.tab === 'home') html += lifeRenderHome(totals);
  else if (S.lifestyle.tab === 'food') html += lifeRenderFood(totals);
  else if (S.lifestyle.tab === 'style') html += lifeRenderStyle(totals);
  else if (S.lifestyle.tab === 'fun') html += lifeRenderFun(totals);
  else if (S.lifestyle.tab === 'charity') html += lifeRenderCharity(totals);

  return html;
}

/* ---------- OVERVIEW ---------- */
function lifeRenderOverview(totals) {
  const lf = S.lifestyle;
  let html = '';

  if (!lf.active) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">⚙️ Configure Your Lifestyle</h3>' +
      '<p class="muted small">Choose a preset below, then fine-tune from the tabs. Once configured, your yearly expenses are managed here.</p></div>';
  }

  /* Preset quick-apply */
  html += '<div class="card"><h3>⚡ Quick Presets</h3>';
  Object.keys(LIFE_PRESETS).forEach(function(key) {
    const p = LIFE_PRESETS[key];
    html += '<button class="opt" style="width:100%;margin-top:6px;text-align:left;padding:10px;font-size:.78rem" onclick="lifeApplyPreset(\'' + key + '\')">' +
      '<div style="font-weight:700">' + p.label + '</div>' +
      '<div class="muted small">' + p.description + '</div></button>';
  });
  html += '</div>';

  /* Breakdown */
  /* Breakdown */
  if (lf.active) {
    let subsMonthly = 0;
    lf.subscriptions.forEach(function(id) { subsMonthly += lifeSubPrice(id); });

    if (totals.isMinimal) {
      /* Living with parents — simplified breakdown only */
      const phoneOnly = totals.monthly - subsMonthly - 200;
      html += '<div class="card"><h3>📊 Monthly Breakdown</h3>' +
        '<div class="row"><span>📱 Phone</span><b>' + money(phoneOnly) + '</b></div>' +
        (subsMonthly > 0 ? '<div class="row"><span>📺 Subscriptions</span><b>' + money(subsMonthly) + '</b></div>' : '') +
        '<div class="row"><span>💵 Personal allowance</span><b>' + money(200) + '</b></div>' +
        '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total per month</b><b style="color:#f59e0b">' + money(totals.monthly) + '</b></div>' +
        '<div class="row"><b>Total per year</b><b style="color:#f59e0b">' + money(totals.yearly) + '</b></div>' +
        '</div>';
    } else {
      /* Full breakdown for independent living */
      const plans = lifePlans();
      const getCost = function(cat) {
          const plan = plans[cat] ? plans[cat].find(function(p) { return p.id === lf[cat]; }) || plans[cat][0] : null;
          return plan ? plan.monthly : 0;
      };

      html += '<div class="card"><h3>📊 Monthly Breakdown</h3>' +
        '<div class="row"><span>📱 Phone & Internet</span><b>' + money(getCost('phone') + getCost('internet')) + '</b></div>' +
        '<div class="row"><span>⚡ Utilities & Staff</span><b>' + money(getCost('utilities') + getCost('domestic_staff')) + '</b></div>' +
        '<div class="row"><span>🛒 Food & Dining</span><b>' + money(getCost('food') + getCost('dining')) + '</b></div>' +
        '<div class="row"><span>🚗 Transport</span><b>' + money(getCost('transport')) + '</b></div>' +
        '<div class="row"><span>👕 Clothes & Care</span><b>' + money(getCost('clothing') + getCost('personal_care')) + '</b></div>' +
        '<div class="row"><span>🩺 Healthcare Ins.</span><b>' + money(getCost('healthcare_insurance')) + '</b></div>' +
        '<div class="row"><span>🎉 Ent. & Subs</span><b>' + money(getCost('entertainment') + subsMonthly) + '</b></div>' +
        (totals.housingMonthly > 0 ? '<div class="row" style="margin-top:6px; color:#fbbf24"><span>🏠 Rent</span><b>' + money(totals.housingMonthly) + '</b></div>' : '') +
        '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total per month</b><b style="color:#f59e0b">' + money(totals.monthly) + '</b></div>' +
        '<div class="row"><b>Total per year</b><b style="color:#f59e0b">' + money(totals.yearly) + '</b></div>' +
        '</div>';
    }
  }

    /* Income comparison */
    if (S.job && S.job.salary) {
      const yearIncome = S.job.salary;
      const yearExpenses = totals.yearly;
      const net = yearIncome - yearExpenses;
      html += '<div class="card"><h3>💵 Income vs Expenses</h3>' +
        '<div class="row"><span>Yearly net income</span><b class="good">' + money(yearIncome) + '</b></div>' +
        '<div class="row"><span>Yearly lifestyle burn</span><b class="bad">' + money(yearExpenses) + '</b></div>' +
        '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Savings per year</b><b class="' + (net >= 0 ? 'good' : 'bad') + '">' + money(net) + '</b></div>' +
        '<div class="row"><span>Monthly savings</span><b class="' + (net >= 0 ? 'good' : 'bad') + '">' + money(Math.round(net / 12)) + '</b></div>' +
        '</div>';
    }

    /* Lifestyle effects */
    if (totals.happiness !== 0 || totals.health !== 0 || totals.smarts !== 0 || totals.social !== 0) {
      html += '<div class="card"><h3>💭 Annual Stat Effects</h3>' +
        (totals.happiness !== 0 ? '<div class="row"><span>Happiness</span><b class="' + (totals.happiness > 0 ? 'good' : 'bad') + '">' + (totals.happiness > 0 ? '+' : '') + totals.happiness + '</b></div>' : '') +
        (totals.health !== 0 ? '<div class="row"><span>Health</span><b class="' + (totals.health > 0 ? 'good' : 'bad') + '">' + (totals.health > 0 ? '+' : '') + totals.health + '</b></div>' : '') +
        (totals.smarts !== 0 ? '<div class="row"><span>Smarts</span><b class="' + (totals.smarts > 0 ? 'good' : 'bad') + '">' + (totals.smarts > 0 ? '+' : '') + totals.smarts + '</b></div>' : '') +
        (totals.social !== 0 ? '<div class="row"><span>Social</span><b class="' + (totals.social > 0 ? 'good' : 'bad') + '">' + (totals.social > 0 ? '+' : '') + totals.social + '</b></div>' : '') +
        '</div>';
    }
  }

  if (S.housing === 'parents') {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🏠 Living with Parents</h3>' +
      '<p class="muted small">You live with your parents. You only pay for your Phone plan and subscriptions, plus a small allowance. Everything else is covered.</p></div>';
  }

  return html;
}

/* ---------- RENDER HELPER ---------- */
function renderLifeCategory(title, key, list, icon) {
  const lf = S.lifestyle;
  if(!list) return '';
  let h = '<div class="card"><h3>' + icon + ' ' + title + '</h3>' +
    '<div style="display:flex; flex-direction:column; gap:4px">';
  list.forEach(function(item) {
    h += '<button class="pill ' + (lf[key] === item.id ? 'on' : '') + '" style="padding:8px;font-size:.75rem;text-align:left; display:flex; justify-content:space-between; align-items:center;" onclick="lifeSetPlan(\'' + key + '\',\'' + item.id + '\')">' +
      '<div><div style="font-weight:700">' + item.label + '</div>' +
      (item.perks ? '<div class="muted" style="font-size:.65rem; margin-top:2px;">' + item.perks + '</div>' : '') +
      '</div>' +
      '<div style="font-weight:bold">' + money(item.monthly) + '/mo</div>' +
      '</button>';
  });
  h += '</div></div>';
  return h;
}

/* ---------- HOME & STAFF ---------- */
function lifeRenderHome(totals) {
  if (S.housing === 'parents') {
    return '<div class="card"><h3>🏠 Home & Staff</h3>' +
      '<p class="muted small">You live with your parents. Housing, utilities, and staff are handled by them. When you move out, these categories become active.</p></div>';
  }
  const plans = lifePlans();
  let html = renderLifeCategory('Internet & TV', 'internet', plans.internet, '🌐');
  html += renderLifeCategory('Utilities (Water/Gas/Electricity)', 'utilities', plans.utilities, '⚡');
  html += renderLifeCategory('Domestic Staff', 'domestic_staff', plans.domestic_staff, '🧹');
  return html;
}

/* ---------- FOOD & DINING ---------- */
function lifeRenderFood(totals) {
  if (S.housing === 'parents') {
    return '<div class="card"><h3>🍽 Food & Dining</h3>' +
      '<p class="muted small">Your parents cover groceries and household meals. You can still spend on dining out and personal food choices from your allowance.</p></div>';
  }
  const plans = lifePlans();
  let html = renderLifeCategory('Groceries (Home Cooking)', 'food', plans.food, '🛒');
  html += renderLifeCategory('Dining Out', 'dining', plans.dining, '🍽');
  return html;
}

/* ---------- STYLE & CARE ---------- */
function lifeRenderStyle(totals) {
  if (S.housing === 'parents') {
    return '<div class="card"><h3>👕 Style & Care</h3>' +
      '<p class="muted small">Parents cover the basics. Use your allowance for personal clothing and grooming.</p></div>';
  }
  const plans = lifePlans();
  let html = renderLifeCategory('Clothing & Shopping', 'clothing', plans.clothing, '👕');
  html += renderLifeCategory('Personal Care & Grooming', 'personal_care', plans.personal_care, '🧴');
  html += renderLifeCategory('Healthcare Insurance', 'healthcare_insurance', plans.healthcare_insurance, '🩺');
  return html;
}

/* ---------- FUN & TRAVEL ---------- */
function lifeRenderFun(totals) {
  const plans = lifePlans();
  const lf = S.lifestyle;

  let html = renderLifeCategory('Mobile Phone Plan', 'phone', plans.phone, '📱');
  html += renderLifeCategory('Daily Transport', 'transport', plans.transport, '🚗');

  if (S.cars && S.cars.length > 0 && lf.transport !== 'own_car' && lf.transport !== 'luxury_car') {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">💡 Tip</h3>' +
      '<p class="muted small">You own a car but aren\'t budgeting for it. Switch Transport to "Own car" to cover fuel, insurance, and maintenance.</p></div>';
  }

  html += renderLifeCategory('Entertainment & Leisure', 'entertainment', plans.entertainment, '🎉');

  /* Subscriptions - Grouped */
  html += '<div class="card"><h3>📺 App Subscriptions & Gyms</h3>';
  LIFE_SUBSCRIPTIONS.forEach(function(sub) {
    const on = lf.subscriptions.indexOf(sub.id) >= 0;
    const price = lifeSubPrice(sub.id);
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.75rem;' + (on ? 'background:#34d39920;border-color:#34d399' : '') + '" onclick="lifeToggleSubscription(\'' + sub.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + sub.label + (on ? ' ✓' : '') + '</b><span>' + money(price) + '/mo</span></div>' +
      '<div class="muted small">' + sub.category.toUpperCase() +
        (sub.happiness ? ' · Happy +' + sub.happiness : '') +
        (sub.health ? ' · Health +' + sub.health : '') +
        (sub.smarts ? ' · Smarts +' + sub.smarts : '') +
        '</div></button>';
  });
  html += '</div>';

  return html;
}

/* ---------- CHARITY ---------- */
function lifeRenderCharity(totals) {
  const lf = S.lifestyle;
  const currentPct = lf.charityPct || 0;
  const yearlyWealth = S.wealth; // approximate
  const yearlyCharity = Math.round(yearlyWealth * currentPct / 100);

  let html = '<div class="card"><h3>💝 Charity & Zakat</h3>' +
    '<p class="muted small">Give a percentage of your wealth each year. Boosts happiness and social standing.</p>' +
    '<div class="row"><span>Current percentage</span><b>' + currentPct + '%</b></div>' +
    '<div class="row"><span>Approximate yearly amount</span><b>' + money(yearlyCharity) + '</b></div>' +
    '<button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#f59e0b;color:#000;font-weight:700" onclick="lifeSetCharity()">Set charity %</button>' +
    '</div>';

  html += '<div class="card"><h3>Common Amounts</h3>' +
    '<button class="opt" style="width:100%;margin-top:4px;padding:8px;font-size:.75rem" onclick="S.lifestyle.charityPct=0;S.lifestyle.active=true;render()">0% (None)</button>' +
    '<button class="opt" style="width:100%;margin-top:4px;padding:8px;font-size:.75rem" onclick="S.lifestyle.charityPct=2.5;S.lifestyle.active=true;render()">2.5% (Zakat/Sadaqah)</button>' +
    '<button class="opt" style="width:100%;margin-top:4px;padding:8px;font-size:.75rem" onclick="S.lifestyle.charityPct=5;S.lifestyle.active=true;render()">5% (Generous Donor)</button>' +
    '<button class="opt" style="width:100%;margin-top:4px;padding:8px;font-size:.75rem" onclick="S.lifestyle.charityPct=10;S.lifestyle.active=true;render()">10% (Tithing/Philanthropist)</button>' +
    '</div>';

  return html;
}

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureLifestyleState();
  if (!S) return;
  if (S.age < 18) return;
  if (!S.lifestyle.active) return; // Player hasn't configured — let engine's basic charge stand

  /* Refund engine's basic charge since Lifestyle overrides it */
  const c = C();
  let engineCharge = 0;
  if (S.housing === 'parents') {
    engineCharge = Math.round((c.prices.phone || 0) * 0.5 + (c.prices.transport || 0) * 0.25);
  } else {
    engineCharge = (c.prices.food || 0) + (c.prices.phone || 0) + (c.prices.transport || 0);
    if (S.housing === 'rented') engineCharge += (c.prices.rent || 0);
  }
  S.wealth += engineCharge;

  /* Apply lifestyle total */
  const totals = lifeCalculate();
  S.lifestyle.monthlyTotal = totals.monthly;
  S.lifestyle.yearlyTotal = totals.yearly;

  if (S.wealth >= totals.yearly) {
    S.wealth -= totals.yearly;
    log('🏠 Lifestyle expenses paid: ' + money(totals.yearly) + ' (' + money(totals.monthly) + '/month).');
  } else {
    const partial = Math.max(0, S.wealth);
    S.wealth = 0;
    S.wealth -= (totals.yearly - partial); // go into debt
    log('⚠️ Could not fully cover lifestyle expenses. Went ' + money(totals.yearly - partial) + ' into debt.');
    fx({ happiness: -15, health: -5 });
  }

  /* Apply happiness/health/smarts/social effects */
  if (totals.happiness !== 0) fx({ happiness: totals.happiness });
  if (totals.health !== 0) fx({ health: totals.health });
  if (totals.smarts !== 0) fx({ smarts: totals.smarts });
  if (totals.social !== 0) fx({ social: totals.social });

  /* Charity */
  if (S.lifestyle.charityPct > 0 && S.wealth > 0) {
    const charityAmount = Math.round(S.wealth * S.lifestyle.charityPct / 100);
    S.wealth -= charityAmount;
    log('💝 Gave ' + money(charityAmount) + ' to charity (' + S.lifestyle.charityPct + '% of wealth).');
    fx({ happiness: 8, social: 5 });
  }
});

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'lifestyle', label: '🏠 Lifestyle', order: 13, view: lifestyleView });
