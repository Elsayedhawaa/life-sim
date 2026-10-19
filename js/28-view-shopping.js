/* ============================================================
   VIEW: SHOPPING (with warranty, gifts, 4 payment methods,
                     home association)
   ============================================================
   Owns: S.shopping (inventory, loans, history), S.uidN
   Uses: S.bank (credit cards, loans) for card & bank payments
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

  /* Migrate legacy inventory */
  if (Array.isArray(S.inventory) && S.inventory.length > 0 && sp.inventory.length === 0) {
    sp.inventory = S.inventory;
    S.inventory = [];
  }
  if (Array.isArray(S.shopLoans) && S.shopLoans.length > 0 && sp.loans.length === 0) {
    sp.loans = S.shopLoans;
    S.shopLoans = [];
  }

  /* Backfill warranty + home fields on existing items */
  sp.inventory.forEach(function(item) {
    if (typeof item.warrantyUntil === 'undefined') {
      const years = _shopWarrantyYears(item);
      item.warrantyUntil = years > 0 ? (item.purchaseYear || gameYear()) + years : 0;
    }
    if (typeof item.homeId === 'undefined') item.homeId = null;
    if (typeof item.homeName === 'undefined') item.homeName = null;
  });
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

function shopSaleDiscount(cat) {
  const sale = S.shopping.activeSale;
  if (!sale) return 0;
  if (sale.cats.indexOf(cat) < 0) return 0;
  return sale.discount;
}

/* Warranty years — category base, adjusted for luxury tier */
function _shopWarrantyYears(item) {
  const base = (typeof SHOP_WARRANTY_YEARS !== 'undefined' && SHOP_WARRANTY_YEARS[item.cat]) || 0;
  /* Luxury upgrades */
  if (item.cat === 'watch' && (item.priceUSD || 0) > 5000) return 5;
  if (item.cat === 'appliances') {
    if ((item.priceUSD || 0) > 1500) return 5;
    if ((item.priceUSD || 0) > 500) return 3;
  }
  if (item.subcat === 'bag' && (item.priceUSD || 0) > 1000) return 2;
  return base;
}

/* ---------- PAYMENT HELPERS ---------- */

/* Charge to credit card. Returns true/false. */
function _shopChargeCard(item, price) {
  if (!S.bank) S.bank = { creditCards: [], loans: [], score: 680 };
  if (!Array.isArray(S.bank.creditCards)) S.bank.creditCards = [];

  if (!S.bank.creditCards.length) {
    log('❌ No credit card on file. Open one in the Banking tab.');
    return false;
  }

  /* Pick first card with enough room */
  const card = S.bank.creditCards.find(function(c) { return (c.balance || 0) + price <= (c.limit || 0); });
  if (!card) {
    const worst = S.bank.creditCards[0];
    log('❌ Card limit would be exceeded on ' + worst.name + ' (' + money(worst.limit - worst.balance) + ' available).');
    return false;
  }

  card.balance = (card.balance || 0) + price;

  /* Cashback */
  if (card.cashbackRate > 0) {
    S.bank.cashbackBal = (S.bank.cashbackBal || 0) + Math.round(price * card.cashbackRate);
  }

  /* Log transaction if banking helper exists */
  if (typeof bankLogTransaction === 'function') {
    bankLogTransaction('Card: ' + item.name, price, 'card');
  }

  log('💳 Charged ' + money(price) + ' to ' + card.name + '. New balance: ' + money(card.balance) + '.');
  return true;
}

/* Create a bank loan entry. Prompts for years. Returns true/false. */
function _shopBankLoan(item, price) {
  if (!S.bank) S.bank = { creditCards: [], loans: [], score: 680 };
  if (!Array.isArray(S.bank.loans)) S.bank.loans = [];

  const income = (S.job && S.job.salary) || S.income || 0;
  if (!income) {
    log('❌ Bank installments require employment or income.');
    return false;
  }

  const yearsStr = prompt('Finance over how many years? (1-5)', '2');
  const years = parseInt(yearsStr, 10);
  if (!years || years < 1 || years > 5) return false;

  const rate = 0.15;
  const totalOwed = Math.round(price * (1 + rate * years));
  const monthlyPayment = Math.ceil(totalOwed / (years * 12));
  const monthlyIncome = income / 12;

  if (monthlyPayment > monthlyIncome * 0.40) {
    log('❌ Bank declined: monthly payment ' + money(monthlyPayment) + ' exceeds 40% of income (' + money(monthlyIncome) + '/mo).');
    return false;
  }

  S.bank.loans.push({
    id: 'shop_loan_' + Math.random().toString(36).slice(2, 8),
    loanType: 'shopping',
    name: 'Purchase: ' + item.name,
    principal: price,
    remaining: totalOwed,
    rate: rate,
    monthsLeft: years * 12,
    monthsTotal: years * 12,
    monthlyPayment: monthlyPayment,
    startYear: gameYear(),
    missedPayments: 0
  });

  if (typeof bankLogTransaction === 'function') {
    bankLogTransaction('Bank loan: ' + item.name, price, 'loan');
  }

  log('🏦 Bank approved: ' + money(monthlyPayment) + '/mo × ' + years + ' years (total ' + money(totalOwed) + ').');
  return true;
}

/* Store financing (original 1yr/2yr) */
function _shopStoreFinance(item, price, years, markup) {
  const totalOwed = Math.round(price * (1 + markup));
  const yearlyPayment = Math.ceil(totalOwed / years);
  S.shopping.loans.push({
    id: 'loan_' + Math.random().toString(36).slice(2, 8),
    itemName: item.name,
    itemId: item.id,
    totalOwed: totalOwed,
    yearlyPayment: yearlyPayment,
    yearsLeft: years,
    startedYear: gameYear()
  });
  log('📅 Store financing: ' + money(yearlyPayment) + '/yr × ' + years + ' years (' + money(totalOwed) + ' total).');
  return true;
}

/* Home selection for furniture/appliances */
function _shopAskHome(item) {
  if (item.cat !== 'furniture' && item.cat !== 'appliances') return null;

  const owned = S.ownedHomes || [];
  if (owned.length === 0) {
    if (S.housing === 'parents') return { homeId: 'parents', homeName: "Parents' house" };
    if (S.housing === 'rented') return { homeId: 'rented', homeName: 'Rented home' };
    return { homeId: 'unassigned', homeName: 'Unassigned' };
  }
  if (owned.length === 1) {
    return { homeId: owned[0].id, homeName: owned[0].name };
  }
  const opts = owned.map(function(h, i) { return (i + 1) + '. ' + h.name + (h.city ? ' (' + h.city + ')' : ''); }).join('\n');
  const pick = prompt('Which home is this for?\n\n' + opts + '\n\nEnter number:', '1');
  const idx = parseInt(pick, 10) - 1;
  if (idx >= 0 && idx < owned.length) {
    return { homeId: owned[idx].id, homeName: owned[idx].name };
  }
  return { homeId: owned[0].id, homeName: owned[0].name };
}

/* Gift recipient picker — returns { name, type, obj } or null */
function _shopPickRecipient() {
  const list = [];
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    list.push({ name: S.marriage.partner.name, type: 'spouse', obj: S.marriage.partner });
  }
  (S.childrenList || []).forEach(function(c) {
    list.push({ name: c.name, type: 'child', obj: c });
  });
  (S.family || []).forEach(function(m) {
    if (m.alive === false) return;
    if (m.role === 'Mother' || m.role === 'Father') list.push({ name: m.name, type: 'parent', obj: m });
    else if (m.isSibling) list.push({ name: m.name, type: 'sibling', obj: m });
  });
  if (!list.length) {
    log('❌ No one to gift to. Family, spouse, or children required.');
    return null;
  }
  const opts = list.map(function(r, i) { return (i + 1) + '. ' + r.name + ' (' + r.type + ')'; }).join('\n');
  const pick = prompt('Gift to:\n\n' + opts + '\n\nEnter number:', '1');
  const idx = parseInt(pick, 10) - 1;
  if (idx < 0 || idx >= list.length) return null;
  return list[idx];
}

function _shopDeliverGift(item, recipient) {
  const boost = Math.max(2, item.happiness * 3);
  if (recipient.obj) {
    if (typeof recipient.obj.bond === 'number') {
      recipient.obj.bond = Math.min(100, recipient.obj.bond + boost);
    }
    if (typeof recipient.obj.happiness === 'number') {
      recipient.obj.happiness = Math.min(100, recipient.obj.happiness + boost);
    }
    if (typeof recipient.obj.health === 'number' && item.cat === 'appliances') {
      recipient.obj.health = Math.min(100, recipient.obj.health + Math.floor(boost / 2));
    }
  }
  /* Player feels good too */
  fx({ happiness: Math.floor(boost / 2), social: 2 });
}

/* ---------- BUILD CATALOG (unchanged) ---------- */
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
      age: age, discount: discount,
      fromYear: fromYear, untilYear: untilYear
    });
  });

  /* Future phone generation */
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
function shopBuy(itemId, method, giftTo) {
  ensureShoppingState();
  const all = shopBuildCatalog(null);
  const item = all.find(function(i) { return i.id === itemId; });
  if (!item) { log('Item not found.'); render(); return; }

  if (S.age < 16 && item.cat !== 'fashion') {
    log('❌ Must be 16+ to buy this.');
    render(); return;
  }

  const price = item.priceLocal;

  /* ---- PROCESS PAYMENT ---- */
  let paid = false;
  if (method === 'cash') {
    if (S.wealth < price) { log('❌ Not enough cash (' + money(price) + ').'); render(); return; }
    S.wealth -= price;
    paid = true;
  } else if (method === 'card') {
    paid = _shopChargeCard(item, price);
  } else if (method === 'bank') {
    paid = _shopBankLoan(item, price);
  } else if (method === 'inst12') {
    paid = _shopStoreFinance(item, price, 1, 0.10);
  } else if (method === 'inst24') {
    paid = _shopStoreFinance(item, price, 2, 0.20);
  } else if (method === 'inst36') {
    paid = _shopStoreFinance(item, price, 3, 0.35);
  }

  if (!paid) { render(); return; }

  /* ---- GIFT PATH ---- */
  if (giftTo) {
    _shopDeliverGift(item, giftTo);
    S.shopping.history.unshift({
      year: gameYear(),
      action: 'gifted',
      name: item.name,
      price: price,
      to: giftTo.name
    });
    S.shopping.history = S.shopping.history.slice(0, 30);
    log('🎁 Gifted ' + item.brand + ' ' + item.name + ' to ' + giftTo.name + '.');
    render();
    return;
  }

  /* ---- SELF PATH ---- */
  const warrantyYears = _shopWarrantyYears(item);
  const homeInfo = _shopAskHome(item);

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
    condition: 100,
    warrantyUntil: warrantyYears > 0 ? gameYear() + warrantyYears : 0,
    homeId: homeInfo ? homeInfo.homeId : null,
    homeName: homeInfo ? homeInfo.homeName : null
  });

  S.shopping.history.unshift({ year: gameYear(), action: 'bought', name: item.name, price: price });
  S.shopping.history = S.shopping.history.slice(0, 30);

  fx({ happiness: item.happiness * 2, social: item.social * 2 });
  log('🛍 Bought ' + item.brand + ' ' + item.name + ' for ' + money(price) + '.' +
    (homeInfo ? ' Placed in ' + homeInfo.homeName + '.' : '') +
    (warrantyYears > 0 ? ' Warranty: ' + warrantyYears + ' years.' : ''));
  render();
}
window.shopBuy = shopBuy;

/* ---------- GIFT ACTION ---------- */
window.shopGift = function(itemId) {
  ensureShoppingState();
  const all = shopBuildCatalog(null);
  const item = all.find(function(i) { return i.id === itemId; });
  if (!item) { log('Item not found.'); return; }

  const recipient = _shopPickRecipient();
  if (!recipient) { render(); return; }

  const payMethod = prompt(
    'Payment for gift to ' + recipient.name + ':\n\n' +
    '1. Cash (' + money(item.priceLocal) + ')\n' +
    '2. Credit card\n\n' +
    'Enter 1 or 2:',
    '1'
  );
  if (payMethod === '1') shopBuy(itemId, 'cash', recipient);
  else if (payMethod === '2') shopBuy(itemId, 'card', recipient);
  else render();
};

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

/* ---------- REPAIR (with warranty check) ---------- */
function shopRepair(uid) {
  const item = S.shopping.inventory.find(function(i) { return i.uid === uid; });
  if (!item || !item.broken) return;

  const underWarranty = item.warrantyUntil && item.warrantyUntil >= gameYear();
  const cost = underWarranty ? 0 : Math.round(item.purchasePrice * 0.25);

  if (!underWarranty && S.wealth < cost) {
    log('❌ Repair costs ' + money(cost) + '. Not enough cash.');
    render(); return;
  }

  if (!underWarranty) S.wealth -= cost;

  item.broken = false;
  item.condition = Math.min(100, item.condition + 40);

  if (underWarranty) log('🛡 Repaired ' + item.name + ' FREE under warranty.');
  else log('🔧 Repaired ' + item.name + ' for ' + money(cost) + '.');

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
    tabs.map(function(t) { return '<button class="pill ' + (S.shopping.tab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="shopSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
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
      const hasCard = S.bank && Array.isArray(S.bank.creditCards) && S.bank.creditCards.length > 0;
      const hasIncome = (S.job && S.job.salary) || S.income || 0;

      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="flex:1"><div style="font-weight:700">' + item.brand + ' · ' + item.name + '</div>' +
        '<div class="muted small">' + item.desc + ageTag + saleTag + '</div>' +
        '<div class="muted small">Happy +' + item.happiness + (item.social > 0 ? ' · Social +' + item.social : '') + ' · Life ' + item.life + 'yr</div></div>' +
        '<div style="text-align:right;flex-shrink:0;margin-left:8px">' +
        (item.discount > 0 ? '<div style="text-decoration:line-through;color:#888;font-size:.72rem">' + money(item.originalLocal) + '</div>' : '') +
        '<div style="font-weight:bold;color:#8b5cf6">' + money(item.priceLocal) + '</div></div></div>' +
        /* Payment row 1 */
        '<div style="display:flex;gap:4px;margin-top:6px">' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem;background:' + (canAfford ? '#34d399' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="shopBuy(\'' + item.id + '\',\'cash\')">💵 Cash</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem;' + (hasCard ? '' : 'opacity:.4') + '" ' + (hasCard ? '' : 'disabled') + ' onclick="shopBuy(\'' + item.id + '\',\'card\')">💳 Card</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem;' + (hasIncome ? '' : 'opacity:.4') + '" ' + (hasIncome ? '' : 'disabled') + ' onclick="shopBuy(\'' + item.id + '\',\'bank\')">🏦 Bank</button>' +
        '</div>' +
        /* Payment row 2 */
        '<div style="display:flex;gap:4px;margin-top:4px">' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem" onclick="shopBuy(\'' + item.id + '\',\'inst12\')">📅 1yr +10%</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem" onclick="shopBuy(\'' + item.id + '\',\'inst24\')">📅 2yr +20%</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem;border-color:#fb7185;color:#fb7185" onclick="shopGift(\'' + item.id + '\')">🎁 Gift</button>' +
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

  /* ---- Active financing: store loans + bank shopping loans ---- */
  const storeLoans = S.shopping.loans.filter(function(l) { return l.yearsLeft > 0; });
  const bankShopLoans = (S.bank && Array.isArray(S.bank.loans))
    ? S.bank.loans.filter(function(l) { return l.loanType === 'shopping' && l.monthsLeft > 0; })
    : [];

  if (storeLoans.length > 0 || bankShopLoans.length > 0) {
    const totalYearly = storeLoans.reduce(function(s, l) { return s + l.yearlyPayment; }, 0);
    const totalBankMonthly = bankShopLoans.reduce(function(s, l) { return s + (l.monthlyPayment || 0); }, 0);

    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">💳 Active Financing</h3>';

    storeLoans.forEach(function(l) {
      html += '<div class="row"><span>📅 ' + l.itemName + ' · ' + l.yearsLeft + 'y left</span><b class="bad">' + money(l.yearlyPayment) + '/yr</b></div>';
    });
    bankShopLoans.forEach(function(l) {
      html += '<div class="row"><span>🏦 ' + l.name + ' · ' + Math.ceil(l.monthsLeft / 12) + 'y left</span><b class="bad">' + money(l.monthlyPayment) + '/mo</b></div>';
    });

    html += '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total monthly commitment</b><b class="bad">' + money(Math.round(totalYearly / 12) + totalBankMonthly) + '</b></div>';
    html += '</div>';
  }

  /* ---- Home contents section (furniture + appliances) ---- */
  const homeItems = inv.filter(function(i) { return i.cat === 'furniture' || i.cat === 'appliances'; });
  if (homeItems.length > 0) {
    const byHome = {};
    homeItems.forEach(function(item) {
      const key = item.homeId || 'unassigned';
      if (!byHome[key]) byHome[key] = { name: item.homeName || 'Unassigned', items: [] };
      byHome[key].items.push(item);
    });

    html += '<div class="card" style="border-color:#22d3ee"><h3 style="color:#22d3ee">🏠 Home Contents</h3>';
    Object.keys(byHome).forEach(function(homeId) {
      const group = byHome[homeId];
      html += '<h4 style="font-size:.82rem;color:#22d3ee;margin-top:8px">' + group.name + ' (' + group.items.length + ')</h4>';
      group.items.forEach(function(item) {
        const condColor = item.condition > 70 ? '#34d399' : item.condition > 40 ? '#fbbf24' : '#fb7185';
        const warrantyBadge = item.warrantyUntil && item.warrantyUntil >= gameYear()
          ? ' 🛡' + (item.warrantyUntil - gameYear()) + 'y'
          : (item.warrantyUntil ? ' ⚠️No warranty' : '');
        html += '<div class="row" style="padding:4px 0;font-size:.78rem">' +
          '<span>' + item.brand + ' ' + item.name + warrantyBadge + '</span>' +
          '<span class="muted" style="color:' + condColor + '">' + item.condition + '% · ' + money(item.currentValue) + '</span>' +
          '</div>';
      });
    });
    html += '</div>';
  }

  /* ---- Items by category ---- */
  const byCat = {};
  inv.forEach(function(i) {
    if (!byCat[i.cat]) byCat[i.cat] = [];
    byCat[i.cat].push(i);
  });

  Object.keys(byCat).forEach(function(cat) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#8b5cf6">' + cat.toUpperCase() + ' (' + byCat[cat].length + ')</h4>';
    byCat[cat].forEach(function(item) {
      const condColor = item.condition > 70 ? '#34d399' : item.condition > 40 ? '#fbbf24' : '#fb7185';
      const underWarranty = item.warrantyUntil && item.warrantyUntil >= gameYear();
      const warrantyLine = item.warrantyUntil
        ? (underWarranty
            ? '<span style="color:#34d399">🛡 Warranty: ' + (item.warrantyUntil - gameYear()) + 'y left</span>'
            : '<span class="muted">Warranty expired</span>')
        : '<span class="muted">No warranty</span>';

      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between">' +
        '<div><div style="font-weight:700">' + item.brand + ' · ' + item.name + (item.broken ? ' 🔧' : '') + '</div>' +
        '<div class="muted small">' + item.age + 'y old · ' + item.life + 'yr life</div>' +
        (item.homeName ? '<div class="muted small">🏠 ' + item.homeName + '</div>' : '') +
        '<div style="display:flex;gap:6px;align-items:center;margin-top:2px;font-size:.7rem">' +
        '<span style="color:' + condColor + '">Condition ' + item.condition + '%</span>' +
        '<span class="muted">·</span>' + warrantyLine +
        '</div></div>' +
        '<div style="text-align:right"><div style="color:#22d3ee;font-weight:bold">' + money(item.currentValue) + '</div>' +
        '<div class="muted small">resale</div></div></div>' +
        '<div style="display:flex;gap:4px;margin-top:6px">' +
        (item.broken
          ? (underWarranty
              ? '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#34d399;color:#000" onclick="shopRepair(\'' + item.uid + '\')">🛡 Repair FREE</button>'
              : '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#fb7185;color:#fff" onclick="shopRepair(\'' + item.uid + '\')">🔧 Repair ' + money(Math.round(item.purchasePrice * 0.25)) + '</button>')
          : '') +
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

  /* Rotate sales */
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

  /* Age inventory + depreciation (with all 4 fixes) */
  sp.inventory.forEach(function(item) {
    item.age++;

    let depreciation = 0.15;
    if (item.cat === 'phone') {
      depreciation = 0.25;
    } else if (item.cat === 'laptop' || item.cat === 'tablet' || item.cat === 'desktop') {
      depreciation = 0.20;
    } else if (item.cat === 'tv') {
      depreciation = 0.15;
    } else if (item.cat === 'watch') {
      depreciation = ((item.priceUSD || 0) > 5000) ? -0.03 : 0.08;
    } else if (item.subcat === 'bag' || item.subcat === 'accessory' || item.subcat === 'wallet' || item.subcat === 'scarf') {
      depreciation = ((item.priceUSD || 0) > 1500) ? -0.02 : 0.25;
    } else if (item.cat === 'fashion') {
      depreciation = 0.60;
    } else if (item.cat === 'furniture') {
      depreciation = 0.10;
    } else if (item.cat === 'appliances') {
      depreciation = 0.12;
    } else if (item.cat === 'audio') {
      depreciation = 0.18;
    }

    item.currentValue = Math.max(item.purchasePrice * 0.05, Math.round(item.currentValue * (1 - depreciation)));
    item.condition = Math.max(0, item.condition - Math.floor(Math.random() * 5 + 2));

    /* Breakage — skip if under warranty (warranty covers free repair) */
    if (!item.broken && item.age > item.life / 2 && item.cat !== 'fashion') {
      const breakChance = 0.05 + item.age * 0.02;
      if (Math.random() < breakChance) {
        item.broken = true;
        item.condition = Math.max(0, item.condition - 30);
        const underWarranty = item.warrantyUntil && item.warrantyUntil >= year;
        log('⚠️ Your ' + item.brand + ' ' + item.name + ' broke down.' +
          (underWarranty ? ' (Covered by warranty — free repair available.)' : ''));
      }
    }
  });

  /* Store financing payments */
  sp.loans = sp.loans.filter(function(loan) {
    const payment = loan.yearlyPayment;
    if (S.wealth >= payment) {
      S.wealth -= payment;
      log('📅 Paid ' + money(payment) + ' store financing for ' + loan.itemName + '.');
    } else {
      log('⚠️ Could not pay store financing for ' + loan.itemName + '.');
      S.wealth -= payment;
    }
    loan.totalOwed -= payment;
    loan.yearsLeft--;
    if (loan.yearsLeft <= 0) {
      log('✅ Store financing for ' + loan.itemName + ' fully paid.');
      return false;
    }
    return true;
  });

  /* Age out of useful life */
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
