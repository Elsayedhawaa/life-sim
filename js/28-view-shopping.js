/* ============================================================
   VIEW: SHOPPING
   ============================================================
   Owns: S.shopping (inventory, loans, history), S.uidN
   Registers tab 'shopping' at order 14.
   ============================================================ */

/* ---------- STATE ---------- */
function ensureShoppingState() {
  if (!S) return;
  if (!S.shopping) {
    S.shopping = {
      tab: 'phone',
      inventory: [],
      loans: [],
      history: [],
      activeSale: null,
      saleCheckYear: 0
    };
  }
  const sp = S.shopping;
  if (!Array.isArray(sp.inventory)) sp.inventory = [];
  if (!Array.isArray(sp.loans)) sp.loans = [];
  if (!Array.isArray(sp.history)) sp.history = [];
  if (typeof sp.saleCheckYear !== 'number') sp.saleCheckYear = 0;
  if (!sp.tab) sp.tab = 'phone';
  if (typeof S.uidN !== 'number') S.uidN = 1;

  /* Migrate legacy inventory if any */
  if (Array.isArray(S.inventory) && S.inventory.length > 0 && sp.inventory.length === 0) {
    sp.inventory = S.inventory;
    S.inventory = [];
  }
  if (Array.isArray(S.shopLoans) && S.shopLoans.length > 0 && sp.loans.length === 0) {
    sp.loans = S.shopLoans;
    S.shopLoans = [];
  }
}
GameHooks.on('newGame', ensureShoppingState);
GameHooks.on('migrate', ensureShoppingState);

/* ---------- HELPERS ---------- */
function shopSetTab(tab) { S.shopping.tab = tab; render(); }
window.shopSetTab = shopSetTab;

function shopMult(cat) {
  const m = SHOP_MULT[S.country] || SHOP_MULT.egy;
  return m[cat] || 1.0;
}

/* Get active sale discount for a category */
function shopSaleDiscount(cat) {
  const sale = S.shopping.activeSale;
  if (!sale) return 0;
  if (sale.cats.indexOf(cat) < 0) return 0;
  return sale.discount;
}

/* ---------- BUILD CATALOG ---------- */
function shopBuildCatalog(catFilter) {
  const year = gameYear();
  const out = [];

  SHOP_ALL.forEach(function(row) {
    const cat = row[2];
    if (catFilter && cat !== catFilter) return;
    const subcat = row[3];
    const fromYear = row[9] || 0;
    const untilYear = row[10] || 9999;
    if (year < fromYear || year > untilYear) return;

    const baseUSD = row[4];
    const age = fromYear > 0 ? year - fromYear : 0;
    let priceMult = 1.0;
    let tag = '';
    if (age >= 1 && age <= 6) {
      priceMult = Math.max(0.35, 1 - age * 0.15);
      if (age >= 2) tag = 'Refurbished · ';
    } else if (age > 6) {
      priceMult = 0.25;
      tag = 'Second-hand · ';
    }

    const discount = shopSaleDiscount(cat);
    const finalMult = priceMult * (1 - discount);

    out.push({
      id: row[0].toLowerCase().replace(/\W/g, '_') + '_' + row[1].toLowerCase().replace(/\W/g, '_'),
      brand: row[0], name: row[1], cat: cat, subcat: subcat,
      priceUSD: baseUSD,
      priceLocal: Math.round(baseUSD * shopMult(cat) * (C().rate || 1) * finalMult),
      originalLocal: Math.round(baseUSD * shopMult(cat) * (C().rate || 1)),
      happiness: row[5], social: row[6], life: row[7],
      desc: tag + row[8],
      age: age,
      discount: discount,
      fromYear: fromYear, untilYear: untilYear
    });
  });

  /* Add future iPhones and Galaxy S models */
  if (!catFilter || catFilter === 'phone') {
    for (let y = 2026; y <= year; y++) {
      const n = y - 2008;
      const future = [
        ['Apple', 'iPhone ' + n, 'phone', 'smartphone', 799, 4, 4, 6, 'Latest flagship'],
        ['Apple', 'iPhone ' + n + ' Plus', 'phone', 'smartphone', 899, 5, 4, 6, 'Large latest model'],
        ['Apple', 'iPhone ' + n + ' Pro', 'phone', 'smartphone', 1099, 6, 5, 6, 'Pro camera system'],
        ['Apple', 'iPhone ' + n + ' Pro Max', 'phone', 'smartphone', 1199, 6, 6, 6, 'Largest display'],
        ['Apple', 'iPhone ' + n + 'e', 'phone', 'smartphone', 599, 3, 2, 6, 'Budget modern'],
        ['Samsung', 'Galaxy S' + (y - 2000), 'phone', 'smartphone', 799, 5, 5, 5, 'Galaxy flagship'],
        ['Samsung', 'Galaxy S' + (y - 2000) + '+', 'phone', 'smartphone', 999, 5, 5, 5, 'Large flagship'],
        ['Samsung', 'Galaxy S' + (y - 2000) + ' Ultra', 'phone', 'smartphone', 1299, 7, 6, 5, 'Ultra flagship'],
        ['Google', 'Pixel ' + (n - 6), 'phone', 'smartphone', 799, 4, 4, 5, 'Google AI flagship'],
        ['Google', 'Pixel ' + (n - 6) + ' Pro', 'phone', 'smartphone', 999, 5, 5, 5, 'Google AI Pro']
      ];
      future.forEach(function(row) {
        const age = y === year ? 0 : year - y;
        const priceMult = age === 0 ? 1.0 : Math.max(0.4, 1 - age * 0.15);
        const discount = shopSaleDiscount('phone');
        out.push({
          id: row[0].toLowerCase() + '_' + row[1].toLowerCase().replace(/\W/g, '_'),
          brand: row[0], name: row[1], cat: row[2], subcat: row[3],
          priceUSD: row[4],
          priceLocal: Math.round(row[4] * shopMult('phone') * (C().rate || 1) * priceMult * (1 - discount)),
          originalLocal: Math.round(row[4] * shopMult('phone') * (C().rate || 1)),
          happiness: row[5], social: row[6], life: row[7],
          desc: row[8],
          age: age, discount: discount,
          fromYear: y, untilYear: 9999
        });
      });
    }
  }

  return out;
}

/* ---------- BUY ---------- */
function shopBuy(itemId, method) {
  ensureShoppingState();
  const all = shopBuildCatalog(null);
  const item = all.find(function(i) { return i.id === itemId; });
  if (!item) { log('Item not found.'); render(); return; }

  if (S.age < 16 && item.cat !== 'fashion') {
    log('❌ Must be 16+ to buy this.');
    render(); return;
  }

  const price = item.priceLocal;

  if (method === 'cash') {
    if (S.wealth < price) { log('❌ Not enough cash (' + money(price) + ').'); render(); return; }
    S.wealth -= price;
  } else {
    /* Installments */
    const plans = {
      'inst12': { years: 1, markup: 0.10 },
      'inst24': { years: 2, markup: 0.20 },
      'inst36': { years: 3, markup: 0.35 }
    };
    const plan = plans[method];
    if (!plan) return;
    const totalOwed = Math.round(price * (1 + plan.markup));
    const yearlyPayment = Math.ceil(totalOwed / plan.years);
    S.shopping.loans.push({
      id: 'loan_' + Math.random().toString(36).slice(2, 8),
      itemName: item.name,
      itemId: item.id,
      totalOwed: totalOwed,
      yearlyPayment: yearlyPayment,
      yearsLeft: plan.years,
      startedYear: gameYear()
    });
    log('💳 Financed ' + item.name + ' · ' + money(yearlyPayment) + '/yr × ' + plan.years + ' years.');
  }

  /* Add to inventory — priceUSD is critical for luxury depreciation checks */
  S.shopping.inventory.push({
    uid: 'i' + (S.uidN++),
    itemId: item.id,
    brand: item.brand,
    name: item.name,
    cat: item.cat,
    subcat: item.subcat,
    priceUSD: item.priceUSD,
    purchasePrice: price,
    currentValue: price,
    purchaseYear: gameYear(),
    age: 0,
    life: item.life,
    happiness: item.happiness,
    social: item.social,
    broken: false,
    condition: 100
  });

  S.shopping.history.unshift({ year: gameYear(), action: 'bought', name: item.name, price: price });
  S.shopping.history = S.shopping.history.slice(0, 30);

  fx({ happiness: item.happiness * 2, social: item.social * 2 });
  log('🛍 Bought ' + item.brand + ' ' + item.name + ' for ' + money(price) + '.');
  render();
}
window.shopBuy = shopBuy;

/* ---------- SELL ---------- */
function shopSell(uid) {
  const idx = S.shopping.inventory.findIndex(function(i) { return i.uid === uid; });
  if (idx < 0) return;
  const item = S.shopping.inventory[idx];
  const price = item.currentValue;
  S.wealth += price;
  S.shopping.inventory.splice(idx, 1);
  S.shopping.history.unshift({ year: gameYear(), action: 'sold', name: item.name, price: price });
  log('💰 Sold ' + item.name + ' for ' + money(price) + '.');
  render();
}
window.shopSell = shopSell;

/* ---------- REPAIR ---------- */
function shopRepair(uid) {
  const item = S.shopping.inventory.find(function(i) { return i.uid === uid; });
  if (!item || !item.broken) return;
  const cost = Math.round(item.purchasePrice * 0.25);
  if (S.wealth < cost) { log('❌ Repair costs ' + money(cost) + '. Not enough cash.'); render(); return; }
  S.wealth -= cost;
  item.broken = false;
  item.condition = Math.min(100, item.condition + 40);
  log('🔧 Repaired ' + item.name + ' for ' + money(cost) + '.');
  render();
}
window.shopRepair = shopRepair;

/* ---------- MAIN VIEW ---------- */
function shoppingView() {
  ensureShoppingState();
  if (!S) return '';

  const tabs = [
    ['phone', '📱 Phones'],
    ['tablet', '📱 Tablets'],
    ['laptop', '💻 Laptops'],
    ['desktop', '🖥 Desktops'],
    ['tv', '📺 TVs'],
    ['audio', '🎧 Audio'],
    ['watch', '⌚ Watches'],
    ['appliances', '🍳 Appliances'],
    ['furniture', '🛋 Furniture'],
    ['fashion', '👕 Fashion'],
    ['mine', '🏷 My Items']
  ];

  const sale = S.shopping.activeSale;
  const saleBadge = sale ? ' · 🎉 ' + sale.label + ' ' + Math.round(sale.discount * 100) + '% OFF' : '';

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#8b5cf615 0%,transparent 100%);border-color:#8b5cf6">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">SHOPPING · ' + C().name.toUpperCase() + ' ' + gameYear() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + S.shopping.inventory.length + ' items owned' + saleBadge + '</div></div>' +
    '<div style="font-size:2rem">🛍</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) {
      return '<button class="pill ' + (S.shopping.tab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="shopSetTab(\'' + t[0] + '\')">' + t[1] + '</button>';
    }).join('') +
    '</div></div>';

  if (S.shopping.tab === 'mine') html += shopRenderMine();
  else html += shopRenderCategory(S.shopping.tab);

  return html;
}

function shopRenderCategory(cat) {
  const items = shopBuildCatalog(cat);
  if (!items.length) {
    return '<div class="card"><p class="muted small">Nothing available in this category right now.</p></div>';
  }

  let html = '<div class="card"><h3>' + cat.charAt(0).toUpperCase() + cat.slice(1) + ' · ' + items.length + ' items</h3></div>';

  const subcats = {};
  items.forEach(function(i) {
    if (!subcats[i.subcat]) subcats[i.subcat] = [];
    subcats[i.subcat].push(i);
  });

  Object.keys(subcats).forEach(function(sub) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">' + sub.replace(/_/g, ' ').toUpperCase() + '</h4>';
    subcats[sub].forEach(function(item) {
      const ageTag = item.age > 0 ? ' · ' + item.age + 'y old' : '';
      const saleTag = item.discount > 0 ? ' · 🎉 SALE' : '';
      const canAfford = S.wealth >= item.priceLocal;

      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="flex:1"><div style="font-weight:700">' + item.brand + ' · ' + item.name + '</div>' +
        '<div class="muted small">' + item.desc + ageTag + saleTag + '</div>' +
        '<div class="muted small">Happy +' + item.happiness + (item.social > 0 ? ' · Social +' + item.social : '') + ' · Life ' + item.life + 'yr</div></div>' +
        '<div style="text-align:right;flex-shrink:0;margin-left:8px">' +
        (item.discount > 0 ? '<div style="text-decoration:line-through;color:#888;font-size:.72rem">' + money(item.originalLocal) + '</div>' : '') +
        '<div style="font-weight:bold;color:#8b5cf6">' + money(item.priceLocal) + '</div></div></div>' +
        '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem;background:' + (canAfford ? '#34d399' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="shopBuy(\'' + item.id + '\',\'cash\')">💵 Cash ' + money(item.priceLocal) + '</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="shopBuy(\'' + item.id + '\',\'inst12\')">💳 1yr +10%</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.7rem" onclick="shopBuy(\'' + item.id + '\',\'inst24\')">💳 2yr +20%</button>' +
        '</div></div>';
    });
    html += '</div>';
  });

  return html;
}

function shopRenderMine() {
  const inv = S.shopping.inventory;
  if (!inv.length) {
    return '<div class="card"><h3>🏷 My Items</h3><p class="muted small">You don\'t own anything from the shop yet.</p></div>';
  }

  let html = '<div class="card"><h3>🏷 My Items (' + inv.length + ')</h3></div>';

  /* Loans summary */
  if (S.shopping.loans.length > 0) {
    const totalYearly = S.shopping.loans.reduce(function(s, l) { return s + l.yearlyPayment; }, 0);
    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">💳 Active Financing</h3>' +
      S.shopping.loans.map(function(l) {
        return '<div class="row"><span>' + l.itemName + ' · ' + l.yearsLeft + 'y left</span><b class="bad">' + money(l.yearlyPayment) + '/yr</b></div>';
      }).join('') +
      '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total yearly payment</b><b class="bad">' + money(totalYearly) + '</b></div>' +
      '</div>';
  }

  /* Items grouped by category */
  const byCat = {};
  inv.forEach(function(i) {
    if (!byCat[i.cat]) byCat[i.cat] = [];
    byCat[i.cat].push(i);
  });

  Object.keys(byCat).forEach(function(cat) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">' + cat.toUpperCase() + ' (' + byCat[cat].length + ')</h4>';
    byCat[cat].forEach(function(item) {
      const condColor = item.condition > 70 ? '#34d399' : item.condition > 40 ? '#fbbf24' : '#fb7185';
      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between">' +
        '<div><div style="font-weight:700">' + item.brand + ' · ' + item.name + (item.broken ? ' 🔧' : '') + '</div>' +
        '<div class="muted small">' + item.age + 'y old · ' + item.life + 'yr life</div>' +
        '<div style="display:flex;gap:4px;align-items:center;margin-top:2px"><span class="muted" style="font-size:.7rem">Condition ' + item.condition + '%</span>' +
        '<div style="height:3px;width:60px;background:#1a1a2a;border-radius:2px"><div style="height:100%;width:' + item.condition + '%;background:' + condColor + ';border-radius:2px"></div></div></div></div>' +
        '<div style="text-align:right"><div style="color:#22d3ee;font-weight:bold">' + money(item.currentValue) + '</div>' +
        '<div class="muted small">resale</div></div></div>' +
        '<div style="display:flex;gap:4px;margin-top:6px">' +
        (item.broken ? '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#fb7185;color:#fff" onclick="shopRepair(\'' + item.uid + '\')">🔧 Repair</button>' : '') +
        '<button class="opt" style="flex:1;padding:4px;font-size:.7rem" onclick="shopSell(\'' + item.uid + '\')">💰 Sell ' + money(item.currentValue) + '</button>' +
        '</div></div>';
    });
    html += '</div>';
  });

  return html;
}

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureShoppingState();
  if (!S) return;
  if (S.age < 16) return;
  const year = gameYear();
  const sp = S.shopping;

  /* 1. Rotate sales */
  if (sp.saleCheckYear !== year) {
    sp.saleCheckYear = year;
    sp.activeSale = null;
    const eligibleSales = SHOP_SALES.filter(function(s) {
      if (s.countries && s.countries.indexOf(S.country) < 0) return false;
      return true;
    });
    if (Math.random() < 0.40 && eligibleSales.length > 0) {
      sp.activeSale = eligibleSales[Math.floor(Math.random() * eligibleSales.length)];
      log('🎉 ' + sp.activeSale.label + ' is running! ' + Math.round(sp.activeSale.discount * 100) + '% off on ' + sp.activeSale.cats.join(', ') + '.');
    }
  }

  /* 2. Age inventory + depreciation */
  sp.inventory.forEach(function(item) {
    item.age++;

    /* Determine depreciation. IMPORTANT ORDER:
       1. watch (own category)
       2. luxury subcats (bag/accessory/wallet/scarf) — these are cat:'fashion' but hold value
       3. generic fashion (fast fashion loses 60%/yr)
       4. other categories
       5. default for desktop etc.
    */
    let depreciation = 0.15;

    if (item.cat === 'phone') {
      depreciation = 0.25;
    } else if (item.cat === 'laptop' || item.cat === 'tablet') {
      depreciation = 0.20;
    } else if (item.cat === 'tv') {
      depreciation = 0.15;
    } else if (item.cat === 'watch') {
      /* Luxury watches hold value, cheap ones lose it — check USD base */
      if ((item.priceUSD || 0) > 5000) depreciation = -0.03;
      else depreciation = 0.08;
    } else if (item.subcat === 'bag' || item.subcat === 'accessory' || item.subcat === 'wallet' || item.subcat === 'scarf') {
      /* Luxury bags and small leather goods hold value */
      if ((item.priceUSD || 0) > 1500) depreciation = -0.02;
      else depreciation = 0.25;
    } else if (item.cat === 'fashion') {
      /* Fast fashion loses most value after 1 year */
      depreciation = 0.60;
    } else if (item.cat === 'furniture') {
      depreciation = 0.10;
    } else if (item.cat === 'appliances') {
      depreciation = 0.12;
    } else if (item.cat === 'audio') {
      depreciation = 0.18;
    }

    item.currentValue = Math.max(item.purchasePrice * 0.05, Math.round(item.currentValue * (1 - depreciation)));

    /* Condition decay */
    item.condition = Math.max(0, item.condition - Math.floor(Math.random() * 5 + 2));

    /* Breakage for items older than half life (except fashion) */
    if (!item.broken && item.age > item.life / 2 && item.cat !== 'fashion') {
      const breakChance = 0.05 + item.age * 0.02;
      if (Math.random() < breakChance) {
        item.broken = true;
        item.condition = Math.max(0, item.condition - 30);
        log('⚠️ Your ' + item.brand + ' ' + item.name + ' broke down.');
      }
    }
  });

  /* 3. Process loan payments */
  sp.loans = sp.loans.filter(function(loan) {
    const payment = loan.yearlyPayment;
    if (S.wealth >= payment) {
      S.wealth -= payment;
      log('💳 Paid ' + money(payment) + ' financing for ' + loan.itemName + '.');
    } else {
      log('⚠️ Could not pay financing for ' + loan.itemName + '. Credit may suffer.');
      S.wealth -= payment;
    }
    loan.totalOwed -= payment;
    loan.yearsLeft--;
    if (loan.yearsLeft <= 0) {
      log('✅ Financing for ' + loan.itemName + ' fully paid.');
      return false;
    }
    return true;
  });

  /* 4. Age out of useful life */
  sp.inventory.forEach(function(item) {
    if (item.age >= item.life && !item.broken) {
      item.broken = true;
      item.condition = 0;
      log('⏳ Your ' + item.brand + ' ' + item.name + ' has reached the end of its useful life.');
    }
  });
});

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'shopping', label: '🛍 Shopping', order: 14, view: shoppingView });
