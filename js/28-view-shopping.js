/* ============================================================
   VIEW: SHOPPING — v3
   ============================================================
   Adds:
   - Credit card visibility (balance + available + pay from shopping)
   - Card installment plans at checkout (full / 3mo / 6mo / 12mo)
   - Extended warranty at checkout (basic / premium)
   - Gift registry tab (history of gifts by year + recipient)
   - All prior features preserved (bank loans, store finance, home association)
   ============================================================ */

/* ---------- STATE ---------- */
function ensureShoppingState() {
  if (!S) return;
  if (!S.shopping) {
    S.shopping = {
      tab: 'phone',
      inventory: [],
      loans: [],
      cardInstallments: [],
      history: [],
      activeSale: null,
      saleCheckYear: 0
    };
  }
  const sp = S.shopping;
  if (!Array.isArray(sp.inventory)) sp.inventory = [];
  if (!Array.isArray(sp.loans)) sp.loans = [];
  if (!Array.isArray(sp.cardInstallments)) sp.cardInstallments = [];
  if (!Array.isArray(sp.history)) sp.history = [];
  if (typeof sp.saleCheckYear !== 'number') sp.saleCheckYear = 0;
  if (!sp.tab) sp.tab = 'phone';
  if (typeof S.uidN !== 'number') S.uidN = 1;

  /* Ensure S.bank exists so card charging never crashes */
  if (!S.bank) S.bank = { creditCards: [], loans: [], accounts: [], score: 680, cashbackBal: 0 };
  if (!Array.isArray(S.bank.creditCards)) S.bank.creditCards = [];
  if (!Array.isArray(S.bank.accounts)) S.bank.accounts = [];

  /* Migrate legacy inventory */
  if (Array.isArray(S.inventory) && S.inventory.length > 0 && sp.inventory.length === 0) {
    sp.inventory = S.inventory;
    S.inventory = [];
  }

  /* Backfill fields */
  sp.inventory.forEach(function(item) {
    if (typeof item.warrantyUntil === 'undefined') {
      const years = _shopWarrantyYears(item);
      item.warrantyUntil = years > 0 ? (item.purchaseYear || gameYear()) + years : 0;
    }
    if (typeof item.extendedWarranty === 'undefined') item.extendedWarranty = false;
    if (typeof item.extendedWarrantyUntil === 'undefined') item.extendedWarrantyUntil = 0;
    if (typeof item.homeId === 'undefined') item.homeId = null;
    if (typeof item.homeName === 'undefined') item.homeName = null;
  });

  /* Backfill gift records if legacy history has them but no dedicated log */
  if (!Array.isArray(sp.gifts)) sp.gifts = [];
  sp.history.forEach(function(h) {
    if (h.action === 'gifted' && h.to && !sp.gifts.some(function(g) { return g.year === h.year && g.name === h.name && g.to === h.to; })) {
      sp.gifts.push({ year: h.year, name: h.name, price: h.price, to: h.to });
    }
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

function _shopWarrantyYears(item) {
  const base = (typeof SHOP_WARRANTY_YEARS !== 'undefined' && SHOP_WARRANTY_YEARS[item.cat]) || 0;
  if (item.cat === 'watch' && (item.priceUSD || 0) > 5000) return 5;
  if (item.cat === 'appliances') {
    if ((item.priceUSD || 0) > 1500) return 5;
    if ((item.priceUSD || 0) > 500) return 3;
  }
  if (item.subcat === 'bag' && (item.priceUSD || 0) > 1000) return 2;
  return base;
}

/* ---------- FINANCIAL STATE READERS ---------- */
function _shopCashOnly() { return S.wealth || 0; }
function _shopSavingsTotal() {
  return (S.bank && Array.isArray(S.bank.accounts)) ? S.bank.accounts.reduce(function(s, a) { return s + (a.balance || 0); }, 0) : 0;
}
function _shopTotalLiquid() { return _shopCashOnly() + _shopSavingsTotal(); }
function _shopCardAvailable(card) { return Math.max(0, (card.limit || 0) - (card.balance || 0)); }
function _shopCardsTotalOwed() {
  if (!S.bank || !Array.isArray(S.bank.creditCards)) return 0;
  return S.bank.creditCards.reduce(function(s, c) { return s + (c.balance || 0); }, 0);
}

/* Deduct from savings accounts first (matches real bankSpend behavior), then cash */
function _shopSpend(amount, label) {
  if (_shopTotalLiquid() < amount) return false;
  let remaining = amount;

  /* Drain savings accounts first */
  if (S.bank && Array.isArray(S.bank.accounts)) {
    for (const acc of S.bank.accounts) {
      if (remaining <= 0) break;
      const pay = Math.min(acc.balance || 0, remaining);
      acc.balance = (acc.balance || 0) - pay;
      remaining -= pay;
    }
  }
  /* Then cash (may go negative if needed — but we already verified total) */
  if (remaining > 0) S.wealth -= remaining;
  return true;
}

/* ---------- CARD PICKER ---------- */
function _shopPickCard() {
  if (!S.bank || !Array.isArray(S.bank.creditCards) || !S.bank.creditCards.length) {
    return null;
  }
  const usable = S.bank.creditCards.filter(function(c) { return (c.balance || 0) < (c.limit || 0); });
  if (!usable.length) return null;
  if (usable.length === 1) return usable[0];

  const opts = usable.map(function(c, i) {
    return (i + 1) + '. ' + c.name + ' — ' + money(_shopCardAvailable(c)) + ' of ' + money(c.limit) + ' available';
  }).join('\n');
  const pick = prompt('Which card?\n\n' + opts + '\n\nEnter number:', '1');
  const idx = parseInt(pick, 10) - 1;
  return usable[idx] || usable[0];
}

/* ---------- CARD CHARGE WITH PLAN ---------- */
function _shopChargeCard(item, price, allowInstallments) {
  const card = _shopPickCard();
  if (!card) {
    log('❌ No credit card with available room.');
    return { ok: false };
  }

  let plan = SHOP_CARD_INSTALLMENTS[0]; /* default full */
  if (allowInstallments) {
    const planOpts = SHOP_CARD_INSTALLMENTS.map(function(p, i) {
      const withFee = Math.round(price * (1 + p.fee));
      return (i + 1) + '. ' + p.label + ' — ' + money(withFee) + (p.months > 0 ? ' (' + money(Math.ceil(withFee / p.months)) + '/mo)' : '');
    }).join('\n');
    const planPick = prompt(
      'Charge ' + money(price) + ' to ' + card.name + '.\n\n' +
      'Available credit: ' + money(_shopCardAvailable(card)) + ' of ' + money(card.limit) + '\n\n' +
      'Choose a plan:\n' + planOpts + '\n\nEnter number (default 1 = full):',
      '1'
    );
    const idx = parseInt(planPick, 10) - 1;
    if (idx >= 0 && idx < SHOP_CARD_INSTALLMENTS.length) plan = SHOP_CARD_INSTALLMENTS[idx];
  }

  const totalWithFee = Math.round(price * (1 + plan.fee));

  if (totalWithFee > _shopCardAvailable(card)) {
    log('❌ Charge ' + money(totalWithFee) + ' would exceed card limit (' + money(_shopCardAvailable(card)) + ' available).');
    return { ok: false };
  }

  /* Add to card balance */
  card.balance = (card.balance || 0) + totalWithFee;

  /* Cashback (based on base price, not fee) */
  if (card.cashbackRate > 0) {
    S.bank.cashbackBal = (S.bank.cashbackBal || 0) + Math.round(price * card.cashbackRate);
  }

  /* Log transaction if banking helper exists */
  if (typeof bankLogTransaction === 'function') {
    bankLogTransaction(card.name + ' — ' + item.name, totalWithFee, 'card');
  }

  /* Record installment if not full charge */
  if (plan.months > 0) {
    S.shopping.cardInstallments.push({
      id: 'ci_' + Math.random().toString(36).slice(2, 8),
      cardId: card.id,
      cardName: card.name,
      itemName: item.name,
      totalWithFee: totalWithFee,
      remaining: totalWithFee,
      monthlyPayment: Math.ceil(totalWithFee / plan.months),
      monthsLeft: plan.months,
      originalMonths: plan.months,
      startedYear: gameYear()
    });
    log('💳 Charged ' + money(totalWithFee) + ' to ' + card.name + ' on ' + plan.label + ' plan. Card balance now ' + money(card.balance) + ' / ' + money(card.limit) + '.');
  } else {
    log('💳 Charged ' + money(totalWithFee) + ' to ' + card.name + '. Card balance now ' + money(card.balance) + ' / ' + money(card.limit) + '.');
  }

  return { ok: true };
}

/* ---------- BANK LOAN ---------- */
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
    log('❌ Bank declined: ' + money(monthlyPayment) + '/mo exceeds 40% of income (' + money(monthlyIncome) + '/mo).');
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

  log('🏦 Bank approved: ' + money(monthlyPayment) + '/mo × ' + years + ' years (' + money(totalOwed) + ' total).');
  return true;
}

/* ---------- STORE FINANCE ---------- */
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

/* ---------- HOME PICKER ---------- */
function _shopAskHome(item) {
  if (item.cat !== 'furniture' && item.cat !== 'appliances') return null;

  const owned = (S.ownedHomes || []).filter(function(h) { return h.status !== 'sold'; });
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

/* ---------- GIFT RECIPIENT ---------- */
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
    log('❌ No one to gift to. Need family, spouse, or children.');
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
    if (typeof recipient.obj.bond === 'number') recipient.obj.bond = Math.min(100, recipient.obj.bond + boost);
    if (typeof recipient.obj.happiness === 'number') recipient.obj.happiness = Math.min(100, recipient.obj.happiness + boost);
    if (typeof recipient.obj.health === 'number' && item.cat === 'appliances') {
      recipient.obj.health = Math.min(100, recipient.obj.health + Math.floor(boost / 2));
    }
  }
  fx({ happiness: Math.floor(boost / 2), social: 2 });
}

/* ---------- EXTENDED WARRANTY PROMPT ---------- */
function _shopAskWarranty(item, price) {
  if (SHOP_WARRANTY_ELIGIBLE.indexOf(item.cat) < 0) return { id: 'none', cost: 0, years: 0 };

  const opts = ['1. None (standard warranty only)'];
  Object.keys(SHOP_EXTENDED_WARRANTY).forEach(function(k) {
    if (k === 'none') return;
    const w = SHOP_EXTENDED_WARRANTY[k];
    opts.push((opts.length + 1) + '. ' + w.label + ' — ' + money(Math.round(price * w.multiplier)));
  });

  const pick = prompt(
    item.brand + ' ' + item.name + '\n\n' +
    'Add extended warranty?\n\n' +
    opts.join('\n') + '\n\nEnter number (default 1 = none):',
    '1'
  );
  const idx = parseInt(pick, 10);
  const keys = Object.keys(SHOP_EXTENDED_WARRANTY);
  if (idx === 2 && keys[1]) return { id: 'basic', cost: Math.round(price * SHOP_EXTENDED_WARRANTY.basic.multiplier), years: SHOP_EXTENDED_WARRANTY.basic.extraYears };
  if (idx === 3 && keys[2]) return { id: 'premium', cost: Math.round(price * SHOP_EXTENDED_WARRANTY.premium.multiplier), years: SHOP_EXTENDED_WARRANTY.premium.extraYears };
  return { id: 'none', cost: 0, years: 0 };
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

  /* Ask extended warranty (skip for gifts) */
  const warranty = giftTo ? { id: 'none', cost: 0, years: 0 } : _shopAskWarranty(item, item.priceLocal);

  /* Total charge = item + warranty cost */
  const basePrice = item.priceLocal;
  const grandTotal = basePrice + warranty.cost;

  /* ---- PROCESS PAYMENT ---- */
  let paid = false;
  let cardCharged = null;

  if (method === 'cash') {
    if (_shopTotalLiquid() < grandTotal) {
      log('❌ Not enough liquid cash (' + money(_shopTotalLiquid()) + ' available, need ' + money(grandTotal) + ').');
      render(); return;
    }
    _shopSpend(grandTotal, 'Purchase: ' + item.name);
    paid = true;
  } else if (method === 'card') {
    const result = _shopChargeCard(item, grandTotal, true);
    paid = result.ok;
    cardCharged = true;
  } else if (method === 'bank') {
    paid = _shopBankLoan(item, grandTotal);
  } else if (method === 'inst12') {
    paid = _shopStoreFinance(item, grandTotal, 1, 0.10);
  } else if (method === 'inst24') {
    paid = _shopStoreFinance(item, grandTotal, 2, 0.20);
  } else if (method === 'inst36') {
    paid = _shopStoreFinance(item, grandTotal, 3, 0.35);
  }

  if (!paid) { render(); return; }

  /* ---- GIFT PATH ---- */
  if (giftTo) {
    _shopDeliverGift(item, giftTo);
    if (!Array.isArray(S.shopping.gifts)) S.shopping.gifts = [];
    S.shopping.gifts.unshift({
      year: gameYear(),
      itemId: item.id,
      name: item.brand + ' ' + item.name,
      price: basePrice,
      to: giftTo.name,
      toType: giftTo.type
    });
    S.shopping.history.unshift({ year: gameYear(), action: 'gifted', name: item.name, price: basePrice, to: giftTo.name });
    S.shopping.history = S.shopping.history.slice(0, 30);
    log('🎁 Gifted ' + item.brand + ' ' + item.name + ' to ' + giftTo.name + '.');
    render();
    return;
  }

  /* ---- SELF PATH ---- */
  const warrantyYears = _shopWarrantyYears(item);
  const extendedYears = warranty.years;
  const homeInfo = _shopAskHome(item);

  S.shopping.inventory.push({
    uid: 'i' + (S.uidN++),
    itemId: item.id,
    brand: item.brand,
    name: item.name,
    cat: item.cat,
    subcat: item.subcat,
    priceUSD: item.priceUSD,
    purchasePrice: grandTotal,
    currentValue: basePrice,   /* warranty is not resellable */
    purchaseYear: gameYear(),
    age: 0,
    life: item.life,
    happiness: item.happiness,
    social: item.social,
    broken: false,
    condition: 100,
    warrantyUntil: warrantyYears > 0 ? gameYear() + warrantyYears : 0,
    extendedWarranty: extendedYears > 0,
    extendedWarrantyUntil: extendedYears > 0 ? gameYear() + warrantyYears + extendedYears : 0,
    homeId: homeInfo ? homeInfo.homeId : null,
    homeName: homeInfo ? homeInfo.homeName : null
  });

  S.shopping.history.unshift({ year: gameYear(), action: 'bought', name: item.name, price: grandTotal });
  S.shopping.history = S.shopping.history.slice(0, 30);

  fx({ happiness: item.happiness * 2, social: item.social * 2 });
  log('🛍 Bought ' + item.brand + ' ' + item.name + ' for ' + money(grandTotal) + '.' +
    (extendedYears > 0 ? ' Extended warranty +' + extendedYears + 'y.' : '') +
    (homeInfo ? ' Placed in ' + homeInfo.homeName + '.' : ''));
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
    'Gift "' + item.name + '" to ' + recipient.name + ' (' + money(item.priceLocal) + ')?\n\n' +
    '1. Cash\n' +
    '2. Credit card (full)\n' +
    '3. Credit card (installments)\n\n' +
    'Enter 1-3:',
    '1'
  );
  if (payMethod === '1') shopBuy(itemId, 'cash', recipient);
  else if (payMethod === '2') shopBuy(itemId, 'card', recipient);
  else if (payMethod === '3') shopBuy(itemId, 'card', recipient); /* Card function handles plan */
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

/* ---------- REPAIR ---------- */
function shopRepair(uid) {
  const item = S.shopping.inventory.find(function(i) { return i.uid === uid; });
  if (!item || !item.broken) return;

  const now = gameYear();
  const inStandard = item.warrantyUntil && item.warrantyUntil >= now;
  const inExtended = item.extendedWarranty && item.extendedWarrantyUntil >= now;
  const underWarranty = inStandard || inExtended;
  const cost = underWarranty ? 0 : Math.round(item.purchasePrice * 0.25);

  if (!underWarranty && S.wealth < cost) {
    log('❌ Repair costs ' + money(cost) + '. Not enough cash.');
    render(); return;
  }
  if (!underWarranty) S.wealth -= cost;

  item.broken = false;
  item.condition = Math.min(100, item.condition + 40);

  if (inExtended) log('🛡 Repaired FREE under extended warranty.');
  else if (inStandard) log('🛡 Repaired FREE under warranty.');
  else log('🔧 Repaired ' + item.name + ' for ' + money(cost) + '.');
  render();
}
window.shopRepair = shopRepair;

/* ---------- PAY CARD (from Shopping) ---------- */
window.shopPayCard = function(cardId) {
  if (!S.bank || !Array.isArray(S.bank.creditCards)) return;
  const card = S.bank.creditCards.find(function(c) { return c.id === cardId; });
  if (!card || card.balance <= 0) return;

  const input = prompt(
    'Pay ' + card.name + '\n' +
    'Balance: ' + money(card.balance) + '\n' +
    'Available liquid: ' + money(_shopTotalLiquid()) + '\n\n' +
    'Amount to pay (or "full"):',
    String(card.balance)
  );
  if (!input) return;
  let amount = input.toLowerCase() === 'full' ? card.balance : Math.round(Number(input) || 0);
  if (amount <= 0) return;
  if (amount > card.balance) amount = card.balance;

  if (!_shopSpend(amount, 'Pay ' + card.name)) {
    log('❌ Not enough liquid funds.');
    render(); return;
  }
  card.balance = Math.max(0, card.balance - amount);
  card.lastPaymentYear = gameYear();
  log('💳 Paid ' + money(amount) + ' to ' + card.name + '. Remaining balance: ' + money(card.balance) + '.');
  render();
};

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
    ['mine', '🏷 My Items'],
    ['gifts', '🎁 Gifts']
  ];

  const sale = S.shopping.activeSale;
  const saleBadge = sale ? ' · 🎉 ' + sale.label + ' ' + Math.round(sale.discount * 100) + '% OFF' : '';

  /* Financial header */
  let finHeader = '<div class="card" style="padding:10px;border-color:#22d3ee"><h4 style="font-size:.82rem;color:#22d3ee;margin-bottom:6px">💳 FINANCES AT A GLANCE</h4>' +
    '<div class="row"><span>💰 Cash</span><b>' + money(S.wealth) + '</b></div>' +
    '<div class="row"><span>🏦 Savings accounts</span><b>' + money(_shopSavingsTotal()) + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;padding-top:4px;margin-top:4px"><b>Total liquid</b><b class="good">' + money(_shopTotalLiquid()) + '</b></div>';

  /* Show cards */
  const cards = (S.bank && Array.isArray(S.bank.creditCards)) ? S.bank.creditCards : [];
  if (cards.length > 0) {
    finHeader += '<div style="margin-top:8px"><b style="font-size:.75rem;color:#fb7185">CREDIT CARDS</b>';
    cards.forEach(function(c) {
      const avail = _shopCardAvailable(c);
      const pct = c.limit > 0 ? Math.round((c.balance / c.limit) * 100) : 0;
      finHeader += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b style="font-size:.82rem">' + c.name + '</b>' +
        '<b class="' + (avail > 0 ? 'good' : 'bad') + '" style="font-size:.82rem">' + money(avail) + ' avail</b></div>' +
        '<div class="muted small">Balance ' + money(c.balance) + ' / ' + money(c.limit) + ' limit · ' + pct + '% used · APR ' + Math.round((c.apr || 0) * 100) + '%</div>' +
        (c.balance > 0 ? '<button class="opt" style="margin-top:4px;padding:3px 8px;font-size:.7rem;background:#fb7185;color:#fff" onclick="shopPayCard(\'' + c.id + '\')">💵 Pay card</button>' : '') +
        '</div>';
    });
    finHeader += '</div>';
  } else {
    finHeader += '<div class="muted small" style="margin-top:8px;color:#888">No credit cards. Open one in the Banking tab to finance purchases.</div>';
  }
  finHeader += '</div>';

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#8b5cf615 0%,transparent 100%);border-color:#8b5cf6">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">SHOPPING · ' + C().name.toUpperCase() + ' ' + gameYear() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + S.shopping.inventory.length + ' items owned' + saleBadge + '</div></div>' +
    '<div style="font-size:2rem">🛍</div></div>' +
    '<div style="display:flex;gap:4px;overflow-x:auto;margin-top:10px;scrollbar-width:none">' +
    tabs.map(function(t) { return '<button class="pill ' + (S.shopping.tab === t[0] ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;white-space:nowrap" onclick="shopSetTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') +
    '</div></div>';

  /* Show finance header on most tabs */
  if (S.shopping.tab !== 'gifts') html += finHeader;

  if (S.shopping.tab === 'mine') html += shopRenderMine();
  else if (S.shopping.tab === 'gifts') html += shopRenderGifts();
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
      const canAfford = _shopTotalLiquid() >= item.priceLocal;
      const hasCard = S.bank && Array.isArray(S.bank.creditCards) && S.bank.creditCards.some(function(c) { return _shopCardAvailable(c) >= item.priceLocal; });
      const hasIncome = (S.job && S.job.salary) || S.income || 0;

      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start">' +
        '<div style="flex:1"><div style="font-weight:700">' + item.brand + ' · ' + item.name + '</div>' +
        '<div class="muted small">' + item.desc + ageTag + saleTag + '</div>' +
        '<div class="muted small">Happy +' + item.happiness + (item.social > 0 ? ' · Social +' + item.social : '') + ' · Life ' + item.life + 'yr</div></div>' +
        '<div style="text-align:right;flex-shrink:0;margin-left:8px">' +
        (item.discount > 0 ? '<div style="text-decoration:line-through;color:#888;font-size:.72rem">' + money(item.originalLocal) + '</div>' : '') +
        '<div style="font-weight:bold;color:#8b5cf6">' + money(item.priceLocal) + '</div></div></div>' +
        '<div style="display:flex;gap:4px;margin-top:6px">' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem;background:' + (canAfford ? '#34d399' : '#25253a') + ';color:' + (canAfford ? '#000' : '#666') + '" ' + (canAfford ? '' : 'disabled') + ' onclick="shopBuy(\'' + item.id + '\',\'cash\')">💵 Cash</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem;' + (hasCard ? 'background:#8b5cf6;color:#fff' : 'opacity:.4') + '" ' + (hasCard ? '' : 'disabled') + ' onclick="shopBuy(\'' + item.id + '\',\'card\')">💳 Card</button>' +
        '<button class="opt" style="flex:1;padding:5px;font-size:.68rem;' + (hasIncome ? '' : 'opacity:.4') + '" ' + (hasIncome ? '' : 'disabled') + ' onclick="shopBuy(\'' + item.id + '\',\'bank\')">🏦 Bank</button>' +
        '</div>' +
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
  const cardInst = S.shopping.cardInstallments || [];
  if (!inv.length && !cardInst.length) {
    return '<div class="card"><h3>🏷 My Items</h3><p class="muted small">You don\'t own anything yet.</p></div>';
  }

  let html = '<div class="card"><h3>🏷 My Items (' + inv.length + ')</h3></div>';

  /* ---- Active financing ---- */
  const storeLoans = S.shopping.loans.filter(function(l) { return l.yearsLeft > 0; });
  const bankShopLoans = (S.bank && Array.isArray(S.bank.loans))
    ? S.bank.loans.filter(function(l) { return l.loanType === 'shopping' && l.monthsLeft > 0; })
    : [];

  if (storeLoans.length > 0 || bankShopLoans.length > 0 || cardInst.length > 0) {
    html += '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">💳 Active Financing</h3>';

    storeLoans.forEach(function(l) {
      html += '<div class="row"><span>📅 ' + l.itemName + ' · ' + l.yearsLeft + 'y left</span><b class="bad">' + money(l.yearlyPayment) + '/yr</b></div>';
    });
    bankShopLoans.forEach(function(l) {
      html += '<div class="row"><span>🏦 ' + l.name + ' · ' + Math.ceil(l.monthsLeft / 12) + 'y left</span><b class="bad">' + money(l.monthlyPayment) + '/mo</b></div>';
    });
    cardInst.forEach(function(ci) {
      html += '<div class="row"><span>💳 ' + ci.itemName + ' · ' + ci.monthsLeft + 'mo left</span><b class="bad">' + money(ci.monthlyPayment) + '/mo</b></div>' +
        '<div class="muted small" style="padding-left:8px;font-size:.72rem">Card: ' + ci.cardName + ' · Remaining: ' + money(ci.remaining) + '</div>';
    });
    html += '</div>';
  }

  /* ---- Home contents ---- */
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
        const w = _warrantyStatusText(item);
        html += '<div class="row" style="padding:4px 0;font-size:.78rem">' +
          '<span>' + item.brand + ' ' + item.name + '</span>' +
          '<span class="muted" style="color:' + condColor + '">' + item.condition + '% · ' + money(item.currentValue) + w + '</span>' +
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
      const w = _warrantyStatusText(item);
      const ext = item.extendedWarranty ? ' (extended)' : '';

      html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between">' +
        '<div><div style="font-weight:700">' + item.brand + ' · ' + item.name + (item.broken ? ' 🔧' : '') + '</div>' +
        '<div class="muted small">' + item.age + 'y old · ' + item.life + 'yr life</div>' +
        (item.homeName ? '<div class="muted small">🏠 ' + item.homeName + '</div>' : '') +
        '<div style="display:flex;gap:6px;align-items:center;margin-top:2px;font-size:.7rem">' +
        '<span style="color:' + condColor + '">Condition ' + item.condition + '%</span>' +
        '<span class="muted">·</span>' + w +
        '</div></div>' +
        '<div style="text-align:right"><div style="color:#22d3ee;font-weight:bold">' + money(item.currentValue) + '</div>' +
        '<div class="muted small">resale</div></div></div>' +
        '<div style="display:flex;gap:4px;margin-top:6px">' +
        (item.broken ? _repairButton(item) : '') +
        '<button class="opt" style="flex:1;padding:4px;font-size:.7rem" onclick="shopSell(\'' + item.uid + '\')">💰 Sell ' + money(item.currentValue) + '</button>' +
        '</div></div>';
    });
    html += '</div>';
  });

  return html;
}

function _warrantyStatusText(item) {
  const now = gameYear();
  const inStd = item.warrantyUntil && item.warrantyUntil >= now;
  const inExt = item.extendedWarranty && item.extendedWarrantyUntil >= now;
  if (inExt) return ' <span style="color:#34d399">🛡 Ext ' + (item.extendedWarrantyUntil - now) + 'y</span>';
  if (inStd) return ' <span style="color:#34d399">🛡 ' + (item.warrantyUntil - now) + 'y</span>';
  if (item.warrantyUntil || item.extendedWarrantyUntil) return ' <span class="muted">⚠️ expired</span>';
  return '';
}

function _repairButton(item) {
  const now = gameYear();
  const inStd = item.warrantyUntil && item.warrantyUntil >= now;
  const inExt = item.extendedWarranty && item.extendedWarrantyUntil >= now;
  if (inStd || inExt) {
    return '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#34d399;color:#000" onclick="shopRepair(\'' + item.uid + '\')">🛡 Repair FREE</button>';
  }
  return '<button class="opt" style="flex:1;padding:4px;font-size:.7rem;background:#fb7185;color:#fff" onclick="shopRepair(\'' + item.uid + '\')">🔧 Repair ' + money(Math.round(item.purchasePrice * 0.25)) + '</button>';
}

/* ---------- GIFT REGISTRY TAB ---------- */
function shopRenderGifts() {
  const gifts = S.shopping.gifts || [];
  if (!gifts.length) {
    return '<div class="card"><h3>🎁 Gift Registry</h3><p class="muted small">You haven\'t gifted anything yet. Click the 🎁 button on any item to send it to a family member.</p></div>';
  }

  const totalSpent = gifts.reduce(function(s, g) { return s + (g.price || 0); }, 0);
  const byRecipient = {};
  gifts.forEach(function(g) {
    if (!byRecipient[g.to]) byRecipient[g.to] = { name: g.to, count: 0, spent: 0, items: [] };
    byRecipient[g.to].count++;
    byRecipient[g.to].spent += g.price || 0;
    byRecipient[g.to].items.push(g);
  });

  let html = '<div class="card" style="border-color:#fb7185"><h3 style="color:#fb7185">🎁 Gift Registry</h3>' +
    '<div class="row"><span>Total gifts given</span><b>' + gifts.length + '</b></div>' +
    '<div class="row"><span>Total spent on gifts</span><b class="bad">' + money(totalSpent) + '</b></div>' +
    '</div>';

  html += '<div class="card"><h3>By Recipient</h3>';
  Object.keys(byRecipient).forEach(function(name) {
    const r = byRecipient[name];
    html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
      '<div style="display:flex;justify-content:space-between"><b>' + r.name + '</b><span class="good">' + money(r.spent) + '</span></div>' +
      '<div class="muted small">' + r.count + ' gift' + (r.count > 1 ? 's' : '') + '</div>' +
      '</div>';
  });
  html += '</div>';

  html += '<div class="card"><h3>Gift History</h3>';
  gifts.slice(0, 50).forEach(function(g) {
    html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a;font-size:.82rem">' +
      '<span class="muted mono" style="font-size:.72rem">' + g.year + '</span> · ' +
      '<b>' + g.name + '</b> → <span style="color:#fb7185">' + g.to + '</span>' +
      '<span class="muted" style="float:right">' + money(g.price) + '</span>' +
      '</div>';
  });
  html += '</div>';

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

  /* Age inventory + depreciation (all 4 fixes intact) */
  sp.inventory.forEach(function(item) {
    item.age++;

    let depreciation = 0.15;
    if (item.cat === 'phone') depreciation = 0.25;
    else if (item.cat === 'laptop' || item.cat === 'tablet' || item.cat === 'desktop') depreciation = 0.20;
    else if (item.cat === 'tv') depreciation = 0.15;
    else if (item.cat === 'watch') depreciation = ((item.priceUSD || 0) > 5000) ? -0.03 : 0.08;
    else if (item.subcat === 'bag' || item.subcat === 'accessory' || item.subcat === 'wallet' || item.subcat === 'scarf') {
      depreciation = ((item.priceUSD || 0) > 1500) ? -0.02 : 0.25;
    } else if (item.cat === 'fashion') depreciation = 0.60;
    else if (item.cat === 'furniture') depreciation = 0.10;
    else if (item.cat === 'appliances') depreciation = 0.12;
    else if (item.cat === 'audio') depreciation = 0.18;

    item.currentValue = Math.max(item.purchasePrice * 0.05, Math.round(item.currentValue * (1 - depreciation)));
    item.condition = Math.max(0, item.condition - Math.floor(Math.random() * 5 + 2));

    if (!item.broken && item.age > item.life / 2 && item.cat !== 'fashion') {
      const breakChance = 0.05 + item.age * 0.02;
      if (Math.random() < breakChance) {
        item.broken = true;
        item.condition = Math.max(0, item.condition - 30);
        const inStd = item.warrantyUntil && item.warrantyUntil >= year;
        const inExt = item.extendedWarranty && item.extendedWarrantyUntil >= year;
        log('⚠️ ' + item.brand + ' ' + item.name + ' broke down.' + ((inStd || inExt) ? ' (Free repair under warranty.)' : ''));
      }
    }
  });

  /* Store financing */
  sp.loans = sp.loans.filter(function(loan) {
    const payment = loan.yearlyPayment;
    if (_shopTotalLiquid() >= payment) {
      _shopSpend(payment, 'Store financing');
      log('📅 Paid ' + money(payment) + ' store financing for ' + loan.itemName + '.');
    } else {
      log('⚠️ Could not pay store financing for ' + loan.itemName + '. Went into debt.');
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

  /* ---- Card installment auto-payments ---- */
  sp.cardInstallments = sp.cardInstallments.filter(function(ci) {
    const card = S.bank && Array.isArray(S.bank.creditCards)
      ? S.bank.creditCards.find(function(c) { return c.id === ci.cardId; })
      : null;

    if (!card) {
      log('⚠️ Card for ' + ci.itemName + ' installment no longer exists. Installment dropped.');
      return false;
    }

    const yearPayment = ci.monthlyPayment * 12;

    if (_shopTotalLiquid() >= yearPayment) {
      _shopSpend(yearPayment, 'Card installment: ' + ci.itemName);
      card.balance = Math.max(0, card.balance - yearPayment);
      ci.remaining = Math.max(0, ci.remaining - yearPayment);
      ci.monthsLeft -= 12;
      log('💳 Auto-paid ' + money(yearPayment) + ' toward ' + ci.itemName + ' card installment. Balance left: ' + money(card.balance) + '.');
    } else {
      /* Missed — card accrues interest on remaining */
      log('⚠️ Could not pay card installment for ' + ci.itemName + '. Card interest accrues.');
      card.balance = Math.round(card.balance * 1.20); /* 20% interest */
    }

    if (ci.monthsLeft <= 0) {
      log('✅ ' + ci.itemName + ' card installment complete.');
      return false;
    }
    return true;
  });

  /* Age out of useful life */
  sp.inventory.forEach(function(item) {
    if (item.age >= item.life && !item.broken) {
      item.broken = true;
      item.condition = 0;
      log('⏳ ' + item.brand + ' ' + item.name + ' has reached the end of its useful life.');
    }
  });
});

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'shopping', label: '🛍 Shopping', order: 14, view: shoppingView });
