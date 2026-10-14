/* =====================================================================
   37. LIFE INTEGRATION — credit cards, shared accounts, life pressure
   Connects Bank ↔ Shopping ↔ Marriage ↔ Life so the tabs feel real.
   Load AFTER 36-certificate-buy-fix.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ INIT ============ */
function p37Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.bank || typeof o.bank !== 'object') {
    o.bank = { score: 680, savingsBal: 0, activeCards: [], primaryCard: null, cardDebt: {}, loans: [], missedPmts: 0 };
  }
  if (!o.bank.cardDebt || typeof o.bank.cardDebt !== 'object') o.bank.cardDebt = {};
  if (!Array.isArray(o.bank.activeCards)) o.bank.activeCards = [];
  if (!o.bank.installments || typeof o.bank.installments !== 'object') o.bank.installments = {};
  if (!Array.isArray(o.p37Events)) o.p37Events = [];
  if (typeof o.p37LastPressureYear !== 'number') o.p37LastPressureYear = -1;
}
const P37_migrate = migrate;
migrate = function (o) { const r = P37_migrate(o); p37Init(r); return r; };
const P37_newGame = newGame;
newGame = function () { P37_newGame.apply(this, arguments); p37Init(S); };

/* ============ 1. CREDIT CARD ENGINE ============ */
function p37GetCardLimit(cardId) {
  if (!S) return 0;
  const income = (S.job && S.job.salary) ? S.job.salary : (S.income || 0);
  const isPremium = /premium|wealth|infinite|world|sapphire|signature|platinum/i.test(String(cardId || ''));
  const mult = isPremium ? 0.6 : 0.25;
  /* Income is already internal units; limit is also internal units. */
  return Math.max(500, Math.round(income * mult));
}
function p37TotalCardDebt() {
  p37Init();
  let t = 0;
  Object.values(S.bank.cardDebt).forEach(v => { if (isFinite(v) && v > 0) t += v; });
  return t;
}
function p37TotalInstallments() {
  p37Init();
  let t = 0;
  Object.values(S.bank.installments).forEach(inst => { if (inst && inst.remaining > 0) t += inst.remaining; });
  return t;
}
function p37PayCard(cardId, amount) {
  p37Init();
  const debt = Number(S.bank.cardDebt[cardId]) || 0;
  if (debt <= 0) return hint('No balance on this card.');
  const pay = Math.min(amount, debt, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash or nothing to pay.');
  S.wealth -= pay;
  S.bank.cardDebt[cardId] = debt - pay;
  if (S.bank.cardDebt[cardId] < 0.5) S.bank.cardDebt[cardId] = 0;
  log('Paid ' + money(pay) + ' toward credit card balance.');
  if (S.bank.cardDebt[cardId] === 0) {
    S.bank.score = Math.min(850, (S.bank.score || 680) + 5);
    log('Card fully paid off. Credit score improved.');
  }
  render();
}
function p37PayCardPrompt(cardId) {
  const debt = Number(S.bank.cardDebt[cardId]) || 0;
  if (debt <= 0) return hint('No balance on this card.');
  const input = prompt('How much to pay? (Full balance: ' + Math.round(debt * (typeof rateNow === 'function' ? rateNow() : 1)).toLocaleString() + ' EGP)', String(Math.round(debt * (typeof rateNow === 'function' ? rateNow() : 1))));
  if (input == null) return;
  const egp = Number(input);
  if (!isFinite(egp) || egp <= 0) return hint('Invalid amount.');
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const internal = egp / rate;
  p37PayCard(cardId, internal);
}
function p37InstallmentCard(cardId, months) {
  p37Init();
  const debt = Number(S.bank.cardDebt[cardId]) || 0;
  if (debt <= 0) return hint('No balance to convert.');
  if (![6, 12, 24, 36].indexOf(months) === -1) return hint('Invalid plan.');
  const feeRate = months <= 6 ? 0.04 : months <= 12 ? 0.07 : months <= 24 ? 0.12 : 0.18;
  const fee = Math.round(debt * feeRate);
  const total = debt + fee;
  const monthly = Math.round(total / months);
  S.bank.cardDebt[cardId] = 0;
  const key = 'card_' + cardId + '_' + Date.now();
  S.bank.installments[key] = {
    name: 'Card balance — ' + cardId,
    totalBalance: total,
    remaining: total,
    monthlyPayment: monthly,
    monthsTotal: months,
    monthsLeft: months,
    fee: fee,
    startedYear: gameYear()
  };
  log('Converted ' + money(debt) + ' to ' + months + '-month installment. Monthly: ' + money(monthly) + '. Fee: ' + money(fee) + '.');
  realismNotice('Installment plan started', 'Card balance ' + money(debt) + ' converted to ' + months + ' months at ' + money(monthly) + '/month. Total: ' + money(total) + ' including fee.');
  render();
}
function p37ProcessInstallments() {
  p37Init();
  const keys = Object.keys(S.bank.installments);
  if (!keys.length) return;
  let totalPaid = 0;
  keys.forEach(k => {
    const inst = S.bank.installments[k];
    if (!inst || inst.remaining <= 0) { delete S.bank.installments[k]; return; }
    const yearlyPayment = Math.min(inst.remaining, inst.monthlyPayment * 12);
    if (S.wealth >= yearlyPayment) {
      S.wealth -= yearlyPayment;
      inst.remaining -= yearlyPayment;
      inst.monthsLeft = Math.max(0, inst.monthsLeft - 12);
      totalPaid += yearlyPayment;
      if (inst.remaining <= 0.5) {
        log('Installment "' + inst.name + '" fully paid.');
        delete S.bank.installments[k];
        S.bank.score = Math.min(850, (S.bank.score || 680) + 15);
      }
    } else {
      const penalty = Math.round(inst.remaining * 0.05);
      inst.remaining += penalty;
      S.bank.score = Math.max(300, (S.bank.score || 680) - 40);
      log('Missed installment payment. Penalty: ' + money(penalty) + '. Credit score dropped.');
    }
  });
  if (totalPaid > 0) {
    S.expenses = (S.expenses || 0) + totalPaid;
    if (!S.bill) S.bill = {};
    S.bill.installments = (S.bill.installments || 0) + totalPaid;
    log('Installment payments this year: ' + money(totalPaid) + '.');
  }
}
/* Yearly hook for installments */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('year', p37ProcessInstallments);
} else {
  const _p37Year = p10Year;
  p10Year = function () { const r = _p37Year.apply(this, arguments); try { p37ProcessInstallments(); } catch (e) {} return r; };
}

/* ============ 2. SHOPPING INTEGRATION ============ */
const P37_buyItemBefore = buyItem;
buyItem = function (key, method) {
  if (method === 'credit') return p37BuyWithCredit(key);
  if (method === 'inst12') return p37BuyWithInstallment(key, 12);
  if (method === 'inst24') return p37BuyWithInstallment(key, 24);
  return P37_buyItemBefore.apply(this, arguments);
};

function p37BuyWithCredit(key) {
  p37Init();
  if (!S.bank.activeCards || !S.bank.activeCards.length) return hint('You need a credit card first. Apply in the Bank tab.');
  const it = catalog().find(x => x.key === key);
  if (!it) return hint('Item not found.');

  /* Optional storage option for phones */
  let add = 0, st = null;
  if (it.cat === 'phone') {
    const sel = $('st_' + key);
    const i = sel ? Number(sel.value) : 0;
    const o = it.sto && it.sto[i] ? it.sto[i] : (it.sto ? it.sto[0] : [0, 0]);
    add = o[1] || 0; st = o[0] || null;
  }
  const total = shopPrice(it, add);
  const cardId = S.bank.primaryCard || S.bank.activeCards[0];
  const currentDebt = Number(S.bank.cardDebt[cardId]) || 0;
  const limit = p37GetCardLimit(cardId);
  if (currentDebt + total > limit) {
    return hint('Would exceed credit limit. Limit: ' + money(limit) + ', current balance: ' + money(currentDebt) + ', purchase: ' + money(total) + '.');
  }
  S.bank.cardDebt[cardId] = currentDebt + total;

  const portable = PORTABLE.indexOf(it.cat) !== -1;
  const home = portable ? null : targetHome();
  S.inventory.push({
    uid: 'u' + (S.uidN++), key: it.key, cat: it.cat, type: it.type || it.cat,
    model: it.model, price: total, age: it.start || 0, life: it.life,
    hap: it.hap, hp: it.hp, soc: it.soc, tier: it.tier == null ? 1 : it.tier,
    homeId: home, broken: false, insured: false, storage: st, portable: portable
  });
  fx({ happiness: it.hap * 2, social: it.soc * 2 });
  log('Charged ' + money(total) + ' to credit card for ' + it.model + '. New balance: ' + money(S.bank.cardDebt[cardId]) + '.');
  realismNotice('Charged to credit card', it.model + ' — ' + money(total) + '. Balance now ' + money(S.bank.cardDebt[cardId]) + '. Pay it off or convert to installments in the Bank tab.');
  hint();
  render();
}

function p37BuyWithInstallment(key, months) {
  p37Init();
  const it = catalog().find(x => x.key === key);
  if (!it) return hint('Item not found.');
  let add = 0, st = null;
  if (it.cat === 'phone') {
    const sel = $('st_' + key);
    const i = sel ? Number(sel.value) : 0;
    const o = it.sto && it.sto[i] ? it.sto[i] : (it.sto ? it.sto[0] : [0, 0]);
    add = o[1] || 0; st = o[0] || null;
  }
  const price = shopPrice(it, add);
  const feeRate = months <= 6 ? 0.04 : months <= 12 ? 0.07 : months <= 24 ? 0.12 : 0.18;
  const fee = Math.round(price * feeRate);
  const total = price + fee;
  const monthly = Math.round(total / months);
  const incomeBasis = (S.job && S.job.salary) ? S.job.salary : (S.income || 0);
  if (incomeBasis < monthly * 3) return hint('Bank requires income of at least ' + money(monthly * 3) + '/year. You have ' + money(incomeBasis) + '.');

  const key2 = 'item_' + key + '_' + Date.now();
  S.bank.installments[key2] = {
    name: it.model, totalBalance: total, remaining: total,
    monthlyPayment: monthly, monthsTotal: months, monthsLeft: months,
    fee: fee, startedYear: gameYear()
  };
  const portable = PORTABLE.indexOf(it.cat) !== -1;
  const home = portable ? null : targetHome();
  S.inventory.push({
    uid: 'u' + (S.uidN++), key: it.key, cat: it.cat, type: it.type || it.cat,
    model: it.model, price: price, age: it.start || 0, life: it.life,
    hap: it.hap, hp: it.hp, soc: it.soc, tier: it.tier == null ? 1 : it.tier,
    homeId: home, broken: false, insured: false, storage: st, portable: portable
  });
  fx({ happiness: it.hap * 2, social: it.soc * 2 });
  log('Financed ' + it.model + ' over ' + months + ' months. Monthly: ' + money(monthly) + '. Total: ' + money(total) + '.');
  realismNotice('Bank installment approved', it.model + ' — ' + months + ' months at ' + money(monthly) + '/month. Total: ' + money(total) + '.');
  hint();
  render();
}

/* Add credit/installment buttons to item cards */
const P37_itemCardBefore = itemCard;
itemCard = function (it) {
  let html = P37_itemCardBefore(it);
  if (!S || S.age < 18) return html;
  if (!S.bank || !S.bank.activeCards || !S.bank.activeCards.length) return html;
  if (it.cat === 'fashion') return html;
  const price = it.cost;
  const f12 = Math.round(price * 0.07);
  const f24 = Math.round(price * 0.12);
  const extra = `<div class="acts" style="margin-top:6px">
    <button class="btn" onclick="buyItem('${it.key}','credit')">Pay with credit card</button>
    <button class="btn" onclick="buyItem('${it.key}','inst12')">12-mo · +${money(f12)}</button>
    <button class="btn" onclick="buyItem('${it.key}','inst24')">24-mo · +${money(f24)}</button>
  </div>`;
  return html + extra;
};

/* ============ 3. LIFE PRESSURE EVENTS ============ */
function p37LocalCostEGP(egpBase) {
  const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  return Math.round(egpBase * idx);
}
function p37AddPressureMatter(matter) {
  p37Init();
  if (!Array.isArray(S.p23Matters)) S.p23Matters = [];
  /* avoid duplicates */
  if (S.p23Matters.some(m => m && m.type === matter.type && !m.resolved)) return;
  if (S.p23Matters.length >= 5) return; /* don't overload */
  S.p23Matters.push(matter);
}
function p37GeneratePressureEvents() {
  p37Init();
  if (!S || S.age < 18) return;
  if (S.p37LastPressureYear === gameYear()) return;
  S.p37LastPressureYear = gameYear();

  const spouse = (typeof partner === 'function') ? partner() : null;
  const kids = (S.family || []).filter(m => m && m.role === 'Child' && m.alive !== false);

  /* 1. Own phone broken or worn out */
  const ownPhone = (S.inventory || []).find(i => i.cat === 'phone');
  if (ownPhone && (ownPhone.broken || ownPhone.age >= ownPhone.life) && Math.random() < 0.55) {
    p37AddPressureMatter({
      id: 'p37-ownphone-' + gameYear(), type: 'p37-own-phone',
      title: 'Your phone is ' + (ownPhone.broken ? 'broken' : 'too old'),
      text: 'Your ' + ownPhone.model + ' is ' + (ownPhone.broken ? 'broken' : 'outdated and unreliable') + '. Friends notice when you cannot reply, and work or family may be affected.',
      createdAge: S.age, dueAge: S.age + 1, resolved: false
    });
  }

  /* 2. Wife's phone broken (if married) */
  if (spouse && spouse.stage === 'married') {
    if (Math.random() < 0.30) {
      const cost = p37LocalCostEGP(25000 + Math.random() * 40000);
      p37AddPressureMatter({
        id: 'p37-wifephone-' + gameYear(), type: 'p37-wife-phone',
        title: spouse.name + ' needs a new phone',
        text: spouse.name + ' says her phone is ' + (Math.random() < 0.5 ? 'broken' : 'too old') + ' and her friends are getting new models. She wants you to buy her one (about ' + cost.toLocaleString() + ' EGP).',
        createdAge: S.age, dueAge: S.age + 1, resolved: false,
        amountEGP: cost
      });
    }
  }

  /* 3. Wife demands money for specific things */
  if (spouse && spouse.stage === 'married' && Math.random() < 0.40) {
    const reasons = [
      { id: 'shopping', label: 'a shopping trip with her friends', egp: 8000 + Math.random() * 15000 },
      { id: 'beauty',   label: 'a beauty and spa day', egp: 4000 + Math.random() * 8000 },
      { id: 'family',   label: 'help for her parents', egp: 6000 + Math.random() * 20000 },
      { id: 'gift',     label: 'a gift for her friend\'s wedding', egp: 3000 + Math.random() * 8000 },
      { id: 'medical',  label: 'a medical appointment or procedure', egp: 5000 + Math.random() * 20000 }
    ];
    const r = reasons[Math.floor(Math.random() * reasons.length)];
    const egp = p37LocalCostEGP(r.egp);
    p37AddPressureMatter({
      id: 'p37-wifedemand-' + gameYear() + '-' + r.id, type: 'p37-wife-demand',
      title: spouse.name + ' asks for money',
      text: spouse.name + ' is asking for money for ' + r.label + ' — about ' + egp.toLocaleString() + ' EGP. She expects her husband to provide. Refusing may hurt the relationship.',
      createdAge: S.age, dueAge: S.age + 1, resolved: false,
      amountEGP: egp, reason: r.label
    });
  }

  /* 4. Broken appliance at home */
  if (S.housing && S.housing !== 'parents' && Math.random() < 0.28) {
    const appliances = (S.inventory || []).filter(i => i.cat === 'appliance' && !i.broken && i.age >= i.life * 0.7);
    if (appliances.length) {
      const broken = appliances[0];
      broken.broken = true;
      const cost = p37LocalCostEGP(15000 + Math.random() * 30000);
      p37AddPressureMatter({
        id: 'p37-appliance-' + gameYear(), type: 'p37-appliance',
        title: 'Your ' + broken.model + ' broke down',
        text: 'The ' + broken.model + ' stopped working. Repair or replace it — living without it is disruptive, especially with family at home. A replacement costs about ' + cost.toLocaleString() + ' EGP.',
        createdAge: S.age, dueAge: S.age + 1, resolved: false,
        amountEGP: cost, itemUid: broken.uid
      });
    }
  }

  /* 5. Kid needs (school season) */
  if (kids.length && Math.random() < 0.35) {
    const kid = kids[Math.floor(Math.random() * kids.length)];
    const egp = p37LocalCostEGP(8000 + Math.random() * 20000);
    p37AddPressureMatter({
      id: 'p37-kid-' + gameYear() + '-' + kid.id, type: 'p37-kid-need',
      title: kid.name + ' needs school supplies',
      text: 'The school year is starting. ' + kid.name + ' needs uniforms, books and supplies — about ' + egp.toLocaleString() + ' EGP. Parents are expected to provide.',
      createdAge: S.age, dueAge: S.age + 1, resolved: false,
      amountEGP: egp, kidId: kid.id
    });
  }

  /* 6. Social comparison — friend has new phone */
  if (Math.random() < 0.18) {
    p37AddPressureMatter({
      id: 'p37-social-' + gameYear(), type: 'p37-social',
      title: 'Social pressure — a new phone upgrade',
      text: 'Everyone around you has a newer phone. You feel behind. It is not strictly necessary, but the pressure is real.',
      createdAge: S.age, dueAge: S.age + 1, resolved: false
    });
  }
}
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('year', p37GeneratePressureEvents);
} else {
  const _p37AfterYear = ageUp;
  ageUp = function () {
    const before = S && S.age;
    _p37AfterYear.apply(this, arguments);
    if (S && S.age !== before) try { p37GeneratePressureEvents(); } catch (e) {}
  };
}

/* Resolution handlers for pressure matters */
function p37ResolveWifeDemand(matterId, agree) {
  const m = (S.p23Matters || []).find(x => x.id === matterId);
  if (!m) return;
  const spouse = (typeof partner === 'function') ? partner() : null;
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const internal = (m.amountEGP || 0) / rate;
  if (agree) {
    if (S.wealth < internal) return hint('You cannot afford ' + money(internal) + ' right now.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.wifeSupport = (S.bill.wifeSupport || 0) + internal;
    if (spouse) spouse.bond = Math.max(0, Math.min(100, (spouse.bond || 50) + 6));
    log('You gave ' + spouse.name + ' ' + money(internal) + ' for ' + (m.reason || 'her request') + '.');
  } else {
    if (spouse) spouse.bond = Math.max(0, Math.min(100, (spouse.bond || 50) - 9));
    log('You refused ' + spouse.name + '\'s request for ' + (m.reason || 'money') + '.');
    realismNotice('Request refused', spouse.name + ' is unhappy. The relationship strain may grow.');
  }
  m.resolved = true;
  S.p23Matters = S.p23Matters.filter(x => !x.resolved);
  render();
}
function p37ResolveWifePhone(matterId, agree) {
  const m = (S.p23Matters || []).find(x => x.id === matterId);
  if (!m) return;
  const spouse = (typeof partner === 'function') ? partner() : null;
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const internal = (m.amountEGP || 0) / rate;
  if (agree) {
    if (S.wealth < internal) return hint('You need ' + money(internal) + '.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.wifeSupport = (S.bill.wifeSupport || 0) + internal;
    if (spouse) spouse.bond = Math.max(0, Math.min(100, (spouse.bond || 50) + 8));
    log('You bought ' + spouse.name + ' a new phone for ' + money(internal) + '.');
  } else {
    if (spouse) spouse.bond = Math.max(0, Math.min(100, (spouse.bond || 50) - 12));
    log('You refused to buy ' + spouse.name + ' a new phone.');
  }
  m.resolved = true;
  S.p23Matters = S.p23Matters.filter(x => !x.resolved);
  render();
}
function p37ResolveOwnPhone(matterId, mode) {
  const m = (S.p23Matters || []).find(x => x.id === matterId);
  if (!m) return;
  if (mode === 'shop') {
    m.resolved = true;
    S.p23Matters = S.p23Matters.filter(x => !x.resolved);
    go('shop');
    return;
  }
  m.resolved = true;
  S.p23Matters = S.p23Matters.filter(x => !x.resolved);
  fx({ happiness: -3, social: -2 });
  log('You kept using the old phone. It works but people notice.');
  render();
}
function p37ResolveAppliance(matterId, mode) {
  const m = (S.p23Matters || []).find(x => x.id === matterId);
  if (!m) return;
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const internal = (m.amountEGP || 0) / rate;
  if (mode === 'buy') {
    if (S.wealth < internal) return hint('You need ' + money(internal) + '.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.homeRepairs = (S.bill.homeRepairs || 0) + internal;
    const item = (S.inventory || []).find(i => i.uid === m.itemUid);
    if (item) { item.broken = false; item.age = 0; }
    log('Replaced the broken appliance for ' + money(internal) + '.');
  } else {
    fx({ happiness: -4, health: -2 });
    log('You lived without the appliance. It makes daily life harder.');
  }
  m.resolved = true;
  S.p23Matters = S.p23Matters.filter(x => !x.resolved);
  render();
}
function p37ResolveKidNeed(matterId, agree) {
  const m = (S.p23Matters || []).find(x => x.id === matterId);
  if (!m) return;
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const internal = (m.amountEGP || 0) / rate;
  const kid = (S.family || []).find(x => x.id === m.kidId);
  if (agree) {
    if (S.wealth < internal) return hint('You need ' + money(internal) + '.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.kidSupport = (S.bill.kidSupport || 0) + internal;
    if (kid) kid.bond = Math.max(0, Math.min(100, (kid.bond || 50) + 6));
    log('You provided for ' + kid.name + '\'s school needs.');
  } else {
    if (kid) kid.bond = Math.max(0, Math.min(100, (kid.bond || 50) - 10));
    fx({ happiness: -3 });
    log('You could not cover ' + kid.name + '\'s school needs.');
  }
  m.resolved = true;
  S.p23Matters = S.p23Matters.filter(x => !x.resolved);
  render();
}
function p37ResolveSocial(matterId, agree) {
  const m = (S.p23Matters || []).find(x => x.id === matterId);
  if (!m) return;
  if (agree) {
    m.resolved = true;
    S.p23Matters = S.p23Matters.filter(x => !x.resolved);
    go('shop');
    return;
  }
  m.resolved = true;
  S.p23Matters = S.p23Matters.filter(x => !x.resolved);
  fx({ happiness: 1, social: -1 });
  log('You resisted the social pressure.');
  render();
}

/* ============ 4. RENDER PRESSURE MATTERS ============ */
const P37_viewMattersBefore = (typeof viewMatters === 'function') ? viewMatters : null;
if (P37_viewMattersBefore) {
  viewMatters = function () {
    let html = P37_viewMattersBefore();
    const matters = (S.p23Matters || []).filter(m => m && !m.resolved && String(m.type || '').indexOf('p37-') === 0);
    if (!matters.length) return html;
    matters.forEach(m => {
      if (m.type === 'p37-wife-demand') {
        const egp = (m.amountEGP || 0);
        html += '<section class="card"><h3>' + m.title + '</h3><p class="muted">' + m.text + '</p>' +
          '<div class="row"><span>Requested</span><b>' + egp.toLocaleString() + ' EGP</b></div>' +
          '<div class="acts">' +
          '<button class="btn" onclick="p37ResolveWifeDemand(\'' + m.id + '\',true)">Give the money</button>' +
          '<button class="btn" onclick="p37ResolveWifeDemand(\'' + m.id + '\',false)">Refuse</button>' +
          '</div></section>';
      } else if (m.type === 'p37-wife-phone') {
        const egp = (m.amountEGP || 0);
        html += '<section class="card"><h3>' + m.title + '</h3><p class="muted">' + m.text + '</p>' +
          '<div class="row"><span>Cost</span><b>' + egp.toLocaleString() + ' EGP</b></div>' +
          '<div class="acts">' +
          '<button class="btn" onclick="p37ResolveWifePhone(\'' + m.id + '\',true)">Buy it</button>' +
          '<button class="btn" onclick="p37ResolveWifePhone(\'' + m.id + '\',false)">Refuse</button>' +
          '</div></section>';
      } else if (m.type === 'p37-own-phone') {
        html += '<section class="card"><h3>' + m.title + '</h3><p class="muted">' + m.text + '</p>' +
          '<div class="acts">' +
          '<button class="btn" onclick="p37ResolveOwnPhone(\'' + m.id + '\',\'shop\')">Go shopping for a new phone</button>' +
          '<button class="btn" onclick="p37ResolveOwnPhone(\'' + m.id + '\',\'keep\')">Keep using it</button>' +
          '</div></section>';
      } else if (m.type === 'p37-appliance') {
        const egp = (m.amountEGP || 0);
        html += '<section class="card"><h3>' + m.title + '</h3><p class="muted">' + m.text + '</p>' +
          '<div class="row"><span>Replacement cost</span><b>' + egp.toLocaleString() + ' EGP</b></div>' +
          '<div class="acts">' +
          '<button class="btn" onclick="p37ResolveAppliance(\'' + m.id + '\',\'buy\')">Replace it</button>' +
          '<button class="btn" onclick="p37ResolveAppliance(\'' + m.id + '\',\'skip\')">Live without it</button>' +
          '</div></section>';
      } else if (m.type === 'p37-kid-need') {
        const egp = (m.amountEGP || 0);
        html += '<section class="card"><h3>' + m.title + '</h3><p class="muted">' + m.text + '</p>' +
          '<div class="row"><span>Cost</span><b>' + egp.toLocaleString() + ' EGP</b></div>' +
          '<div class="acts">' +
          '<button class="btn" onclick="p37ResolveKidNeed(\'' + m.id + '\',true)">Provide everything</button>' +
          '<button class="btn" onclick="p37ResolveKidNeed(\'' + m.id + '\',false)">Postpone</button>' +
          '</div></section>';
      } else if (m.type === 'p37-social') {
        html += '<section class="card"><h3>' + m.title + '</h3><p class="muted">' + m.text + '</p>' +
          '<div class="acts">' +
          '<button class="btn" onclick="p37ResolveSocial(\'' + m.id + '\',true)">Go see new phones</button>' +
          '<button class="btn" onclick="p37ResolveSocial(\'' + m.id + '\',false)">Resist the pressure</button>' +
          '</div></section>';
      }
    });
    return html;
  };
}

/* ============ 5. BANK TAB — shared account + credit card manager ============ */
const P37_viewBankBefore = viewBank;
viewBank = function () {
  p37Init();
  let html = P37_viewBankBefore();

  /* Credit card manager — only if the player has at least one card */
  const cards = S.bank.activeCards || [];
  if (cards.length) {
    html += '<section class="card"><h3>💳 Credit card balances</h3>' +
      '<p class="muted">Real credit card behavior: you can pay part or all of the balance, or convert the balance into an installment plan.</p>';
    cards.forEach(cardId => {
      const debt = Number(S.bank.cardDebt[cardId]) || 0;
      const limit = p37GetCardLimit(cardId);
      const rate = (typeof rateNow === 'function') ? rateNow() : 1;
      html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<b>' + cardId + '</b>' +
        '<div class="row"><span>Balance</span><b class="mono" style="color:' + (debt > 0 ? 'var(--rose)' : 'var(--mint)') + '">' + money(debt) + '</b></div>' +
        '<div class="row"><span>Credit limit</span><b>' + money(limit) + '</b></div>' +
        '<div class="row"><span>Approx. EGP balance</span><b>' + Math.round(debt * rate).toLocaleString() + ' EGP</b></div>';
      if (debt > 0) {
        html += '<div class="acts" style="margin-top:6px">' +
          '<button class="btn" onclick="p37PayCardPrompt(\'' + cardId + '\')">Pay balance</button>' +
          '<button class="btn" onclick="p37InstallmentCard(\'' + cardId + '\',12)">Installment 12 mo</button>' +
          '<button class="btn" onclick="p37InstallmentCard(\'' + cardId + '\',24)">Installment 24 mo</button>' +
          '</div>';
      } else {
        html += '<p class="muted" style="margin-top:6px">No balance.</p>';
      }
      html += '</div>';
    });
    html += '</section>';
  }

  /* Installments manager */
  const instKeys = Object.keys(S.bank.installments || {});
  if (instKeys.length) {
    html += '<section class="card"><h3>📅 Active installment plans</h3>';
    instKeys.forEach(k => {
      const inst = S.bank.installments[k];
      if (!inst) return;
      html += '<div style="margin-top:8px;padding:8px;border:1px solid var(--line);border-radius:8px">' +
        '<b>' + inst.name + '</b>' +
        '<div class="row"><span>Remaining</span><b>' + money(inst.remaining) + '</b></div>' +
        '<div class="row"><span>Monthly</span><b>' + money(inst.monthlyPayment) + '</b></div>' +
        '<div class="row"><span>Months left</span><b>' + inst.monthsLeft + '</b></div>' +
        '</div>';
    });
    html += '</section>';
  }

  /* Shared account — moved here from Love tab */
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (spouse && spouse.stage === 'married') {
    const married = S.marriage || {};
    html += '<section class="card"><h3>👥 Shared household account</h3>' +
      '<p class="muted">In real life, couples often open a shared household account for joint bills, rent and savings. You and ' + spouse.name + ' can each deposit into it and use it together.</p>' +
      '<div class="row"><span>Shared balance</span><b>' + money(married.sharedBal || 0) + '</b></div>';
    if (married.sharedBank) {
      html += '<div class="acts" style="margin-top:8px">' +
        '<button class="btn" onclick="p37DepositShared()">Deposit to shared</button>' +
        '<button class="btn" onclick="p37WithdrawShared()">Withdraw from shared</button>' +
        '</div>';
    } else {
      html += '<button class="btn" style="margin-top:8px" onclick="p37OpenShared()">Open a shared account</button>';
    }
    html += '</section>';
  }

  return html;
};

function p37OpenShared() {
  if (!S.marriage) S.marriage = {};
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || spouse.stage !== 'married') return hint('You must be married.');
  if (spouse.generosity < 0.3 && Math.random() < 0.5) {
    spouse.bond = Math.max(0, Math.min(100, (spouse.bond || 50) - 5));
    log(spouse.name + ' refuses to open a shared account. She says each person should keep their own money.');
    return render();
  }
  S.marriage.sharedBank = true;
  spouse.bond = Math.max(0, Math.min(100, (spouse.bond || 50) + 4));
  log('You and ' + spouse.name + ' opened a shared bank account.');
  render();
}
function p37DepositShared() {
  const amt = Number(prompt('Amount to deposit:') || 0);
  if (!isFinite(amt) || amt <= 0) return;
  if (S.wealth < amt) return hint('Not enough cash.');
  S.wealth -= amt;
  S.marriage.sharedBal = (S.marriage.sharedBal || 0) + amt;
  log('You deposited ' + money(amt) + ' into the shared account.');
  render();
}
function p37WithdrawShared() {
  const amt = Number(prompt('Amount to withdraw:') || 0);
  if (!isFinite(amt) || amt <= 0) return;
  if ((S.marriage.sharedBal || 0) < amt) return hint('Not enough in shared account.');
  S.marriage.sharedBal -= amt;
  S.wealth += amt;
  log('You withdrew ' + money(amt) + ' from shared account.');
  render();
}
window.p37OpenShared = p37OpenShared;
window.p37DepositShared = p37DepositShared;
window.p37WithdrawShared = p37WithdrawShared;

/* ============ 6. MONEY TAB — clean actionable overview ============ */
const P37_viewMoneyBefore = viewMoney;
viewMoney = function () {
  const base = P37_viewMoneyBefore();
  if (!S || S.age < 18) return base;

  /* Debt breakdown rows that are clickable */
  const mortgage = (S.ownedHomes || []).reduce((s, h) => s + Math.max(0, Number(h.balance) || 0), 0);
  const bankLoans = (S.loans || []).reduce((s, l) => s + Math.max(0, Number(l.bal) || 0), 0)
    + (S.shopLoans || []).reduce((s, l) => s + Math.max(0, Number(l.bal) || 0), 0)
    + ((S.bank && S.bank.loans) ? S.bank.loans.reduce((s, l) => s + Math.max(0, Number(l.remainingBal) || 0), 0) : 0);
  const card = p37TotalCardDebt();
  const inst = p37TotalInstallments();
  const student = Math.max(0, Number(S.loan) || 0);

  let debtHtml = '';
  if (mortgage > 0) debtHtml += '<div class="row"><span>Home mortgages</span><b class="mono" style="color:var(--rose)">' + money(-mortgage) + '</b></div>';
  if (bankLoans > 0) debtHtml += '<div class="row"><span>Bank loans</span><b class="mono" style="color:var(--rose)">' + money(-bankLoans) + '</b></div>';
  if (card > 0) debtHtml += '<div class="row"><span>Credit cards <button class="menu-btn" style="padding:2px 8px;font-size:.7rem" onclick="go(\'bank\')">Manage</button></span><b class="mono" style="color:var(--rose)">' + money(-card) + '</b></div>';
  if (inst > 0) debtHtml += '<div class="row"><span>Installments <button class="menu-btn" style="padding:2px 8px;font-size:.7rem" onclick="go(\'bank\')">Manage</button></span><b class="mono" style="color:var(--rose)">' + money(-inst) + '</b></div>';
  if (student > 0) debtHtml += '<div class="row"><span>Student loan</span><b class="mono" style="color:var(--rose)">' + money(-student) + '</b></div>';
  if (!debtHtml) debtHtml = '<p class="muted">You have no debt.</p>';

  const actionable = '<section class="card"><h3>Debt — actionable</h3>' +
    '<div class="row"><span><b>Total owed</b></span><b class="mono" style="color:var(--rose)">' + money(-(mortgage + bankLoans + card + inst + student)) + '</b></div>' +
    debtHtml +
    '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">' +
    (card > 0 ? '<button class="btn" onclick="go(\'bank\')">Pay credit card</button>' : '') +
    (inst > 0 ? '<button class="btn" onclick="go(\'bank\')">Review installments</button>' : '') +
    (mortgage > 0 ? '<button class="btn" onclick="go(\'assets\')">Manage mortgage</button>' : '') +
    '</div></section>';

  /* Strip the old duplicate debt section from base */
  const cleaned = base.replace(/<section class="card">\s*<h3>Debt breakdown<\/h3>[\s\S]*?<\/section>/i, '');
  return cleaned + actionable;
};

/* ============ 7. Love tab cleanup — remove shared account panel ============ */
const P37_viewLoveBefore = viewLove;
viewLove = function () {
  let html = P37_viewLoveBefore();
  /* Remove "Open shared account" / "Deposit" / "Withdraw" from Love tab if present */
  html = html.replace(/<button[^>]*onclick="p35OpenSharedAccount\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
  html = html.replace(/<button[^>]*onclick="p35DepositShared\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
  html = html.replace(/<button[^>]*onclick="p35WithdrawShared\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
  return html;
};

/* ============ RUN ON LOAD ============ */
p37Init(S);
