/* ============================================================
   EXPAT LIFE — Egyptian reality systems (v2)
   ============================================================
   v2 fixes:
   - Inflation fires for Egyptians everywhere (also in Egypt)
   - Gold 18K/21K/24K with real per-karat prices, buyable anywhere
   - Egyptian bank account for EGP savings while earning abroad
   - Family Wants integration — pay EGP wants from Egypt account
   - Works in Egypt too (limited view: gold + inflation only)
   ============================================================ */

function ensureExpatState() {
  if (!S) return;
  if (!S.expat) {
    S.expat = {
      yearsAbroad: 0,
      startAbsMonth: null,
      goldStash: [],
      communityBond: 50,
      remittancePressure: 0,
      blackMarketContacts: false,
      lastDevaluationAbs: 0,
      homeCrashes: [],
      egyptAccount: { balanceEGP: 0, openedYear: null, totalDeposited: 0 },
      returnChecklist: { apartment: false, savingsGoal: false, income: false, familyApproved: false },
      passToReturnHome: false,
      _goldKarat: '21K'
    };
  }
  const e = S.expat;
  if (!Array.isArray(e.goldStash)) e.goldStash = [];
  if (!Array.isArray(e.homeCrashes)) e.homeCrashes = [];
  if (typeof e.communityBond !== 'number') e.communityBond = 50;
  if (typeof e.remittancePressure !== 'number') e.remittancePressure = 0;
  if (!e.egyptAccount || typeof e.egyptAccount.balanceEGP !== 'number') {
    e.egyptAccount = { balanceEGP: 0, openedYear: null, totalDeposited: 0 };
  }
  if (!e.returnChecklist) e.returnChecklist = { apartment: false, savingsGoal: false, income: false, familyApproved: false };
  if (!e._goldKarat) e._goldKarat = '21K';
}
GameHooks.on('newGame', ensureExpatState);
GameHooks.on('migrate', ensureExpatState);

function _expatAbs() { return (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1); }
function _expatAbsToYear(abs) { return 2001 + Math.floor((abs - 1) / 12); }
function _expatRate() { return (C().rate || 1) / 52.7; }
function _expatHomeRate() {
  const hc = S.homeCountry || 'egy';
  return (COUNTRIES[hc] && COUNTRIES[hc].rate) || 1;
}
function _expatIsAbroad() {
  return S.homeCountry && S.country !== S.homeCountry;
}
function _expatFromEGP(egp) { return Math.round((egp || 0) * ((C().rate || 1) / 52.7)); }
function _expatToEGP(local) { return Math.round((local || 0) / ((C().rate || 1) / 52.7)); }
window.expatIsAbroad = _expatIsAbroad;

/* ============================================================
   GOLD — 18K / 21K / 24K, buyable anywhere
   ============================================================ */
const GOLD_KARAT_CONFIG = {
  '24K': { label: '24K Gold — Investment Grade', purity: 0.999, craftsmanshipPct: 0.00, resaleDiscountPct: 0.02, desc: 'Pure 24K bars. Best for wealth storage and resale.' },
  '21K': { label: '21K Gold — Egyptian Standard', purity: 0.875, craftsmanshipPct: 0.03, resaleDiscountPct: 0.05, desc: 'The wedding & savings standard in Egypt. Good resale value.' },
  '18K': { label: '18K Gold — Fashion Jewelry', purity: 0.750, craftsmanshipPct: 0.08, resaleDiscountPct: 0.15, desc: 'Fashion jewelry. Lower purity, higher labor cost, worst resale.' }
};
const GOLD_DEALER_SPREAD = 0.03;

function _goldPricePerGram(karat) {
  const prices = (typeof GOLD_PRICES !== 'undefined' && GOLD_PRICES[S.country]) ? GOLD_PRICES[S.country] : { perGram24K: 5200, perGram21K: 4500, perGram18K: 3800 };
  const key = 'perGram' + karat;
  return prices[key] || prices.perGram21K || 3200;
}

function _goldBuyCostLocal(karat, grams) {
  const cfg = GOLD_KARAT_CONFIG[karat] || GOLD_KARAT_CONFIG['21K'];
  const base = _goldPricePerGram(karat) * grams;
  return Math.round(base * (1 + cfg.craftsmanshipPct) * (1 + GOLD_DEALER_SPREAD));
}

function _goldSellValueLocal(karat, grams) {
  const cfg = GOLD_KARAT_CONFIG[karat] || GOLD_KARAT_CONFIG['21K'];
  const base = _goldPricePerGram(karat) * grams;
  return Math.round(base * (1 - cfg.resaleDiscountPct - GOLD_DEALER_SPREAD / 2));
}

function _goldPricePerGramInHome(karat) {
  const homePrices = (typeof GOLD_PRICES !== 'undefined' && GOLD_PRICES.egy) ? GOLD_PRICES.egy : { perGram24K: 5200, perGram21K: 4500, perGram18K: 3800 };
  const key = 'perGram' + karat;
  return homePrices[key] || homePrices.perGram21K || 4500;
}

function expatWealthInHome() {
  if (!S) return 0;
  const homeRate = _expatHomeRate();
  const currentRate = C().rate || 1;
  const cash = Math.round((S.wealth || 0) / currentRate * homeRate);
  const egyptAcct = S.expat && S.expat.egyptAccount ? S.expat.egyptAccount.balanceEGP : 0;
  const gold = S.expat && S.expat.goldStash
    ? S.expat.goldStash.reduce(function(s, g) { return s + Math.round(g.grams * _goldPricePerGramInHome(g.karat || '21K')); }, 0)
    : 0;
  return cash + egyptAcct + gold;
}
window.expatWealthInHome = expatWealthInHome;

window.expatSetGoldKarat = function(karat) {
  if (!GOLD_KARAT_CONFIG[karat]) return;
  S.expat._goldKarat = karat;
  render();
};

window.expatBuyGold = function(grams) {
  ensureExpatState();
  const karat = S.expat._goldKarat || '21K';
  grams = Number(grams);
  if (!grams || grams <= 0) { log('❌ Invalid amount.'); render(); return; }
  const total = _goldBuyCostLocal(karat, grams);
  if (S.wealth < total) { log('❌ Need ' + money(total) + '.'); render(); return; }
  const cfg = GOLD_KARAT_CONFIG[karat];
  if (!confirm('Buy ' + grams + 'g ' + karat + ' gold?\n\nPrice: ' + money(total) + '\nCraftsmanship: ' + Math.round(cfg.craftsmanshipPct * 100) + '%\nDealer spread: ' + Math.round(GOLD_DEALER_SPREAD * 100) + '%\n\n' + cfg.desc)) return;

  S.wealth -= total;
  S.expat.goldStash.push({
    id: 'gold_' + Math.random().toString(36).slice(2, 8),
    karat: karat,
    grams: grams,
    buyPricePerGram: _goldPricePerGram(karat),
    buyLocal: total,
    buyYear: gameYear(),
    buyCountry: S.country
  });
  log('🪙 Bought ' + grams + 'g ' + karat + ' gold for ' + money(total) + '.');
  fx({ happiness: 3 });
  render();
};

window.expatSellGold = function(goldId) {
  ensureExpatState();
  const idx = S.expat.goldStash.findIndex(function(g) { return g.id === goldId; });
  if (idx < 0) return;
  const gold = S.expat.goldStash[idx];
  const karat = gold.karat || '21K';
  const value = _goldSellValueLocal(karat, gold.grams);
  const profit = value - gold.buyLocal;
  const pct = gold.buyLocal > 0 ? Math.round((profit / gold.buyLocal) * 100) : 0;
  if (!confirm('Sell ' + gold.grams + 'g ' + karat + ' gold?\n\nCurrent sell price: ' + money(value) + '\nBought for: ' + money(gold.buyLocal) + '\nProfit: ' + (profit >= 0 ? '+' : '') + pct + '%')) return;

  S.wealth += value;
  S.expat.goldStash.splice(idx, 1);
  log('🪙 Sold ' + gold.grams + 'g ' + karat + ' gold for ' + money(value) + ' (' + (profit >= 0 ? '+' : '') + pct + '%).');
  render();
};

window.expatGoldSummary = function() {
  if (!S || !S.expat || !S.expat.goldStash) return { grams: 0, valueLocal: 0, valueHome: 0, byKarat: {} };
  const byKarat = { '24K': { grams: 0, value: 0 }, '21K': { grams: 0, value: 0 }, '18K': { grams: 0, value: 0 } };
  let totalGrams = 0;
  let totalLocal = 0;
  S.expat.goldStash.forEach(function(g) {
    const k = g.karat || '21K';
    if (!byKarat[k]) byKarat[k] = { grams: 0, value: 0 };
    byKarat[k].grams += g.grams;
    byKarat[k].value += _goldSellValueLocal(k, g.grams);
    totalGrams += g.grams;
    totalLocal += _goldSellValueLocal(k, g.grams);
  });
  const homeRate = _expatHomeRate();
  const currentRate = C().rate || 1;
  return {
    grams: totalGrams,
    valueLocal: totalLocal,
    valueHome: Math.round(totalLocal / currentRate * homeRate),
    byKarat: byKarat
  };
};

/* ============================================================
   EGYPTIAN BANK ACCOUNT — save EGP while earning abroad
   ============================================================ */
window.expatDepositEgypt = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ Only useful when you are abroad (you can bank directly in Egypt).'); render(); return; }
  const input = prompt('Deposit into your Egyptian account.\n\nYou have ' + money(S.wealth) + ' in ' + C().currency + '.\n\nEnter amount in ' + C().currency + ':', String(Math.round(S.wealth * 0.3)));
  if (!input) return;
  const amount = Math.round(Number(input));
  if (amount <= 0 || amount > S.wealth) { log('❌ Invalid amount.'); render(); return; }
  const egp = _expatToEGP(amount);
  if (!confirm('Convert ' + money(amount) + ' → ' + egp.toLocaleString() + ' EGP?\n\nThis locks the money into Egyptian pounds.\nIf EGP devalues, this loses purchasing power abroad.')) return;
  S.wealth -= amount;
  S.expat.egyptAccount.balanceEGP += egp;
  S.expat.egyptAccount.totalDeposited += egp;
  if (!S.expat.egyptAccount.openedYear) S.expat.egyptAccount.openedYear = gameYear();
  log('🏦 Deposited ' + money(amount) + ' → ' + egp.toLocaleString() + ' EGP in Egyptian account.');
  render();
};

window.expatWithdrawEgypt = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ Already in Egypt.'); render(); return; }
  if (S.expat.egyptAccount.balanceEGP <= 0) { log('❌ Egyptian account is empty.'); render(); return; }
  const input = prompt('Withdraw from Egyptian account.\n\nBalance: ' + S.expat.egyptAccount.balanceEGP.toLocaleString() + ' EGP.\n\nEnter amount in EGP:', String(Math.round(S.expat.egyptAccount.balanceEGP * 0.5)));
  if (!input) return;
  const egpAmount = Math.round(Number(input));
  if (egpAmount <= 0 || egpAmount > S.expat.egyptAccount.balanceEGP) { log('❌ Invalid amount.'); render(); return; }
  const local = _expatFromEGP(egpAmount);
  if (!confirm('Withdraw ' + egpAmount.toLocaleString() + ' EGP → ' + money(local) + '?\n\nConverted at current rate.')) return;
  S.expat.egyptAccount.balanceEGP -= egpAmount;
  S.wealth += local;
  log('🏦 Withdrew ' + egpAmount.toLocaleString() + ' EGP → ' + money(local) + '.');
  render();
};

/* ============================================================
   EGP DEVALUATION — fires for anyone with Egypt home OR in Egypt
   ============================================================ */
GameHooks.on('year', function() {
  ensureExpatState();
  if (!S) return;
  const e = S.expat;
  const homeCountry = S.homeCountry || 'egy';
  const inEgypt = S.country === 'egy';
  /* Fire if home is Egypt OR you live in Egypt */
  if (homeCountry !== 'egy' && !inEgypt) return;

  const currentAbs = _expatAbs();
  const yearsSinceLast = (currentAbs - (e.lastDevaluationAbs || 0)) / 12;
  if (yearsSinceLast < 2) return;
  if (Math.random() > 0.40) return;

  const severity = Math.random();
  const pct = severity < 0.3 ? 0.10 : severity < 0.7 ? 0.25 : 0.45;
  _expatTriggerDevaluation(pct);
  e.lastDevaluationAbs = currentAbs;
});

function _expatTriggerDevaluation(pct) {
  const e = S.expat;
  const oldRate = COUNTRIES.egy.rate;
  COUNTRIES.egy.rate = Math.round(oldRate * (1 + pct) * 100) / 100;

  e.homeCrashes.push({ year: gameYear(), pct: pct, oldRate: oldRate, newRate: COUNTRIES.egy.rate });
  if (e.homeCrashes.length > 10) e.homeCrashes = e.homeCrashes.slice(-10);

  /* Gold in EGP jumps with devaluation (gold is priced in USD globally) */
  if (typeof GOLD_PRICES !== 'undefined' && GOLD_PRICES.egy) {
    GOLD_PRICES.egy.perGram24K = Math.round(GOLD_PRICES.egy.perGram24K * (1 + pct * 0.9));
    GOLD_PRICES.egy.perGram21K = Math.round(GOLD_PRICES.egy.perGram21K * (1 + pct * 0.9));
    GOLD_PRICES.egy.perGram18K = Math.round(GOLD_PRICES.egy.perGram18K * (1 + pct * 0.9));
  }

  const inEgypt = S.country === 'egy';
  const abroad = _expatIsAbroad();

  if (inEgypt) {
    log('💱 EGP devalued ' + Math.round(pct * 100) + '%. Import prices jump. Gold soars.');
    log('📉 Your EGP savings have the same number but worth less in real terms.');
    fx({ happiness: -8 });
  } else if (abroad) {
    log('💱 EGP crashed ' + Math.round(pct * 100) + '%! Your ' + C().currency + ' savings worth more back home.');
    log('📈 Family will need more — Egyptian prices doubled.');
    fx({ happiness: 3 });
    e.remittancePressure += 2;
  } else {
    log('💱 EGP devalued ' + Math.round(pct * 100) + '%. Local prices jump.');
    fx({ happiness: -5 });
  }

  emitSignal('egpDevalued', { pct: pct, newRate: COUNTRIES.egy.rate });
}

/* ============================================================
   GOLD PRICE GROWTH (independent of devaluation)
   ============================================================ */
GameHooks.on('year', function() {
  if (!S) return;
  /* Gold has risen faster than inflation historically */
  if (typeof GOLD_PRICES !== 'undefined') {
    Object.keys(GOLD_PRICES).forEach(function(country) {
      const p = GOLD_PRICES[country];
      if (!p) return;
      p.perGram24K = Math.round(p.perGram24K * 1.04);
      p.perGram21K = Math.round(p.perGram21K * 1.04);
      p.perGram18K = Math.round(p.perGram18K * 1.04);
    });
  }
});

/* ============================================================
   HAWALA / REMITTANCE
   ============================================================ */
function _hawalaSpread() { return 0.15 + Math.random() * 0.15; }

window.expatFindHawala = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ You are not abroad.'); render(); return; }
  if (S.expat.blackMarketContacts) { log('✅ Already connected to a broker.'); render(); return; }
  if (!confirm('Look for a hawala broker?\n\nHawala gives 15-30% better rate than banks.\n\n5-10% scam risk per transfer once connected.')) return;
  if (Math.random() < 0.30) { log('❌ No trustworthy broker found. Try again next year.'); render(); return; }
  S.expat.blackMarketContacts = true;
  log('🤝 Connected to a hawala broker. Future remittances use the black market rate.');
  emitSignal('hawalaContactsAcquired', {});
  render();
};

window.expatSendRemittance = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ You are not abroad.'); render(); return; }
  const input = prompt('How much to send home?\n\nYou have ' + money(S.wealth) + '\nEnter amount in ' + C().currency + ':', String(Math.round(S.wealth * 0.2)));
  if (!input) return;
  const amount = Math.round(Number(input));
  if (amount <= 0 || amount > S.wealth) { log('❌ Invalid amount.'); render(); return; }

  const currentRate = C().rate || 1;
  const homeRate = _expatHomeRate();
  let rate = currentRate / homeRate;
  if (S.expat.blackMarketContacts) {
    rate = rate * (1 + _hawalaSpread());
    if (Math.random() < 0.05) {
      log('🚨 The hawala broker vanished with your money. ' + money(amount) + ' lost.');
      S.wealth -= amount;
      fx({ happiness: -15 });
      S.expat.blackMarketContacts = false;
      emitSignal('hawalaScammed', { amount: amount });
      render();
      return;
    }
  }
  const homeAmount = Math.round(amount * rate);
  S.wealth -= amount;

  const livingParents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false;
  });
  if (livingParents.length) {
    const share = Math.round(homeAmount / livingParents.length);
    livingParents.forEach(function(p) {
      p.wealth = (p.wealth || 0) + share;
      p.bond = Math.min(100, (p.bond || 70) + 3);
    });
  }
  S.expat.remittancePressure = Math.max(0, S.expat.remittancePressure - 1);
  log('💸 Sent ' + money(amount) + ' home via ' + (S.expat.blackMarketContacts ? 'hawala' : 'bank') + ' → ' + homeAmount.toLocaleString() + ' EGP received.');
  fx({ happiness: 3 });
  emitSignal('remittanceSent', { amount: amount, homeAmount: homeAmount });
  render();
};

/* ============================================================
   FAMILY WANTS — pay from Egypt account or current currency
   ============================================================ */
window.expatPayFamilyWantFromEgypt = function(wantId) {
  ensureExpatState();
  if (typeof familyDepthGetActiveWants !== 'function') { log('❌ Family wants not loaded.'); return; }
  const wants = familyDepthGetActiveWants();
  const want = wants.find(function(w) { return w.id === wantId; });
  if (!want) return;
  const costEGP = want.costEGP || 0;
  if (costEGP <= 0) { log('❌ Not a financial want.'); render(); return; }
  if (S.expat.egyptAccount.balanceEGP < costEGP) {
    log('❌ Egyptian account has ' + S.expat.egyptAccount.balanceEGP.toLocaleString() + ' EGP — need ' + costEGP.toLocaleString() + ' EGP.');
    render();
    return;
  }
  if (!confirm('Pay ' + costEGP.toLocaleString() + ' EGP to ' + want.relationName + ' from your Egyptian account?\n\nFor: ' + want.label)) return;
  S.expat.egyptAccount.balanceEGP -= costEGP;
  /* Mark want as fulfilled */
  want.status = 'fulfilled';
  /* Apply bond */
  const rel = (S.family || []).find(function(m) { return m.name === want.relationName; });
  if (rel) {
    rel.bond = Math.min(100, (rel.bond || 70) + (want.bondFulfill || 10));
    if (typeof rel.happiness === 'number') rel.happiness = Math.min(100, rel.happiness + 5);
  }
  fx({ happiness: 5 });
  log('💝 Paid ' + costEGP.toLocaleString() + ' EGP from Egyptian account to ' + want.relationName + ' for ' + want.label + '.');
  emitSignal('wantFulfilledFromEgypt', { want: want });
  render();
};

/* ============================================================
   FAMILY PRESSURE
   ============================================================ */
GameHooks.on('year', function() {
  ensureExpatState();
  if (!S || !_expatIsAbroad()) return;
  const e = S.expat;
  e.yearsAbroad = (e.yearsAbroad || 0) + 1;
  e.remittancePressure = Math.min(10, (e.remittancePressure || 0) + 1);
  if (e.remittancePressure >= 3 && Math.random() < 0.40) _expatFamilyPressureEvent();
});

function _expatFamilyPressureEvent() {
  const e = S.expat;
  const pressureLevel = e.remittancePressure;
  const homeCountry = S.homeCountry || 'egy';
  const homeCurrency = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].currency) || 'EGP';

  const events = [
    { minLevel: 3, maxLevel: 10, id: 'mother_wants_visit', text: 'Your mother called. "When will you come home? It\'s been ' + e.yearsAbroad + ' years."', choice: false,
      effect: function() { fx({ happiness: -3 }); (S.family || []).forEach(function(m) { if (m.role === 'Mother') m.bond = Math.max(0, (m.bond || 70) - 3); }); } },
    { minLevel: 4, maxLevel: 10, id: 'sibling_wedding', text: 'Your sibling is getting married. Family expects a significant contribution.', choice: true,
      choices: ['Send 50,000 EGP (real cost)', 'Send 20,000 EGP (what you can)', 'Refuse'] },
    { minLevel: 5, maxLevel: 10, id: 'father_medical', text: 'Your father needs a medical procedure. Family is asking if you can help.', choice: true,
      choices: ['Pay full (30,000 EGP)', 'Send what you can (15,000 EGP)', 'Not this time'] },
    { minLevel: 5, maxLevel: 10, id: 'pressure_to_return', text: 'Your family is asking when you\'ll return permanently.', choice: true,
      choices: ['Reassure them', 'Says you\'ll stay longer', 'Consider returning sooner'] },
    { minLevel: 6, maxLevel: 10, id: 'building_apartment', text: 'The family is building an apartment. They want you to contribute — this would be YOUR apartment.', choice: true,
      choices: ['Contribute 150,000 EGP for your share', 'Contribute 60,000 EGP', 'Say no'] },
    { minLevel: 7, maxLevel: 10, id: 'sister_tuition', text: 'Your younger sister needs university tuition. Family can\'t cover it alone.', choice: true,
      choices: ['Pay full tuition (40,000 EGP/year)', 'Split with siblings', 'Refuse'] }
  ];
  const eligible = events.filter(function(ev) { return pressureLevel >= ev.minLevel && pressureLevel <= ev.maxLevel; });
  if (!eligible.length) return;
  const ev = eligible[Math.floor(Math.random() * eligible.length)];

  if (!ev.choice) {
    log('📞 ' + ev.text);
    if (ev.effect) ev.effect();
    emitSignal('familyPressure', { event: ev.id });
    return;
  }

  const costMap = { 'sibling_wedding': [50000, 20000, 0], 'father_medical': [30000, 15000, 0], 'building_apartment': [150000, 60000, 0], 'sister_tuition': [40000, 0, 0] };
  const costs = costMap[ev.id] || [0, 0, 0];

  S.pending = {
    title: '👨‍👩‍👧 Family Pressure',
    text: ev.text,
    choices: ev.choices.map(function(label, idx) {
      return {
        label: label,
        effect: function(s) {
          const costEGP = costs[idx] || 0;
          const costLocal = _expatFromEGP(costEGP);
          if (costLocal > 0) {
            /* Try Egypt account first */
            if (s.expat.egyptAccount.balanceEGP >= costEGP) {
              s.expat.egyptAccount.balanceEGP -= costEGP;
              log('💸 Paid ' + costEGP.toLocaleString() + ' EGP from Egyptian account.');
            } else if (s.wealth >= costLocal) {
              s.wealth -= costLocal;
              log('💸 Sent ' + money(costLocal) + ' (' + costEGP.toLocaleString() + ' EGP).');
            } else {
              log('❌ Cannot afford.');
              s.expat.remittancePressure = Math.min(10, s.expat.remittancePressure + 1);
              return;
            }
            s.expat.remittancePressure = Math.max(0, s.expat.remittancePressure - 2);
            (s.family || []).forEach(function(m) {
              if (m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 5);
            });
            fx({ happiness: 3 });
          } else {
            (s.family || []).forEach(function(m) {
              if (m.alive !== false) m.bond = Math.max(0, (m.bond || 70) - 5);
            });
            s.expat.remittancePressure = Math.min(10, s.expat.remittancePressure + 2);
            fx({ happiness: -4 });
          }
        }
      };
    })
  };
  S.evId = 'expat_pressure_' + ev.id;
  emitSignal('familyPressure', { event: ev.id });
  render();
}

/* ============================================================
   COMMUNITY EVENTS
   ============================================================ */
const EGYPTIAN_COMMUNITY_EVENTS = [
  { id: 'mosque_dinner',     weight: 8,  text: 'Egyptian community dinner at the mosque.', happy: 6, soc: 5, costEGP: 200 },
  { id: 'church_festival',   weight: 6,  text: 'Coptic church festival with Egyptian families.', happy: 5, soc: 4, costEGP: 150 },
  { id: 'ahwa_cafe',         weight: 10, text: 'Egyptian café (ahwa) — shisha, tea, and complaints about the motherland.', happy: 4, soc: 4, costEGP: 100 },
  { id: 'ahly_zamalek',      weight: 7,  text: 'Ahly vs Zamalek match at the community center.', happy: 6, soc: 6, costEGP: 80 },
  { id: 'ramadan_iftar',     weight: 5,  text: 'Community iftar during Ramadan.', happy: 10, soc: 7, costEGP: 300, requiresRamadan: true },
  { id: 'eid_gathering',     weight: 5,  text: 'Eid gathering with Egyptian families.', happy: 9, soc: 6, costEGP: 400 },
  { id: 'new_year_party',    weight: 4,  text: 'Egyptian New Year party. Someone brought an oud.', happy: 7, soc: 5, costEGP: 500 },
  { id: 'job_referral',      weight: 3,  text: 'A community member offers to refer you to a better position.', happy: 4, soc: 3, costEGP: 0, special: 'referral' },
  { id: 'doctor_solidarity', weight: 3,  text: 'An Egyptian doctor gives you free medical advice.', happy: 3, health: 5, costEGP: 0 },
  { id: 'helping_newcomer',  weight: 5,  text: 'A newly-arrived Egyptian family asks for help settling in.', happy: 5, soc: 6, costEGP: 200, choice: true }
];

GameHooks.on('year', function() {
  ensureExpatState();
  if (!S || !_expatIsAbroad()) return;
  const e = S.expat;
  e.communityBond = Math.min(100, (e.communityBond || 50) + 2);
  if (Math.random() < 0.35 && !S.pending) {
    const eligible = EGYPTIAN_COMMUNITY_EVENTS.filter(function(ev) {
      if (ev.requiresRamadan && typeof isRamadanMonth === 'function' && !isRamadanMonth()) return false;
      return true;
    });
    if (!eligible.length) return;
    const total = eligible.reduce(function(s, x) { return s + x.weight; }, 0);
    let roll = Math.random() * total;
    let chosen = eligible[0];
    for (let i = 0; i < eligible.length; i++) { roll -= eligible[i].weight; if (roll <= 0) { chosen = eligible[i]; break; } }
    const costLocal = _expatFromEGP(chosen.costEGP || 0);

    if (chosen.special === 'referral') {
      if (S.career && S.career.job) {
        const bump = Math.round(S.career.job.salary * 0.10);
        S.career.job.salary += bump;
        log('🤝 ' + chosen.text + ' Salary +' + money(bump) + '!');
        fx({ happiness: chosen.happy || 0, social: chosen.soc || 0 });
        emitSignal('communityReferral', { bump: bump });
      }
      return;
    }

    if (chosen.choice) {
      S.pending = {
        title: '🇪🇬 Egyptian Community',
        text: chosen.text,
        choices: [
          { label: 'Help them (' + money(costLocal) + ')', effect: function(s) {
            if (s.wealth < costLocal) { log('❌ Cannot afford.'); return; }
            s.wealth -= costLocal;
            s.expat.communityBond = Math.min(100, s.expat.communityBond + 5);
            fx({ happiness: chosen.happy || 0, social: chosen.soc || 0 });
          }},
          { label: 'Politely decline', effect: function(s) {
            s.expat.communityBond = Math.max(0, s.expat.communityBond - 3);
            fx({ happiness: -2 });
          }}
        ]
      };
      S.evId = 'community_' + chosen.id;
      return;
    }

    if (costLocal > 0 && S.wealth < costLocal) return;
    if (costLocal > 0) S.wealth -= costLocal;
    log('🇪🇬 ' + chosen.text);
    const effects = { happiness: chosen.happy || 0, social: chosen.soc || 0 };
    if (chosen.health) effects.health = chosen.health;
    fx(effects);
    e.communityBond = Math.min(100, (e.communityBond || 50) + 1);
    emitSignal('communityEvent', { event: chosen.id });
  }
});

/* ============================================================
   RETURN HOME
   ============================================================ */
function _expatCalculateReturnReadiness() {
  const wealthHome = expatWealthInHome();
  const checks = {
    apartment: { label: 'Own a property in home country', ok: (S.ownedHomes || []).some(function(h) { return h.country === (S.homeCountry || 'egy') && h.status !== 'sold'; }), optional: false },
    savingsGoal: { label: 'Have ~1.5M EGP equivalent savings', ok: wealthHome >= 1500000, detail: 'Have ' + wealthHome.toLocaleString() + ' EGP equivalent' },
    income: { label: 'Have source of income in home country', ok: !!(S.job || (S.career && S.career.job) || (S.career && S.career.businesses && S.career.businesses.length > 0) || (S.career && S.career.pension && S.career.pension.accumulated > 500000)), optional: false },
    familyApproved: { label: 'Family supports your return', ok: (S.family || []).filter(function(m) { return m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); }).every(function(m) { return (m.bond || 70) >= 50; }), optional: true }
  };
  const requiredCount = Object.keys(checks).filter(function(k) { return !checks[k].optional; }).length;
  const requiredMet = Object.keys(checks).filter(function(k) { return !checks[k].optional && checks[k].ok; }).length;
  return { ready: requiredMet >= requiredCount, score: (requiredMet / requiredCount) * 100, checks: checks, wealthHome: wealthHome };
}
window.expatReturnReadiness = _expatCalculateReturnReadiness;

window.expatReturnHome = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ You are not abroad.'); render(); return; }
  const readiness = _expatCalculateReturnReadiness();
  if (!readiness.ready) { log('❌ Not ready to return.'); render(); return; }
  const homeCountry = S.homeCountry || 'egy';
  const homeName = COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].name : homeCountry;
  if (!confirm('Return home to ' + homeName + '?\n\nYour foreign salary ends.\nYour wealth converts to ' + homeName + ' currency.\nYour Gulf/career status resets.\n\nProceed?')) return;

  const oldRate = C().rate || 1;
  const newRate = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].rate) || 1;
  if (typeof S.wealth === 'number') S.wealth = Math.round(S.wealth / oldRate * newRate);
  /* Egyptian account is already in EGP — no conversion */
  if (S.bank && Array.isArray(S.bank.accounts)) S.bank.accounts.forEach(function(a) { if (typeof a.balance === 'number') a.balance = Math.round(a.balance / oldRate * newRate); });

  S.country = homeCountry;
  S._lastCountry = homeCountry;
  if (S.gulfWork) S.gulfWork.active = false;
  if (S.immigration) { S.immigration.destination = null; S.immigration.visaType = null; S.immigration.status = 'citizen_home'; }
  if (S.career && S.career.job) {
    if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('returned home');
    else { S.career.job = null; S.job = null; }
  }
  log('🏠 RETURNED HOME to ' + homeName + ' after ' + (S.expat.yearsAbroad || 0) + ' years abroad!');
  log('💰 Wealth: ' + money(S.wealth) + ' · Egyptian account: ' + S.expat.egyptAccount.balanceEGP.toLocaleString() + ' EGP');
  fx({ happiness: 25, social: 15 });
  (S.family || []).forEach(function(m) { if (m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 20); });
  S.expat.yearsAbroad = 0;
  S.expat.passToReturnHome = true;
  emitSignal('returnedHome', { from: oldRate, to: newRate });
  render();
};

/* ============================================================
   RENDER
   ============================================================ */
window.expatRender = function() {
  ensureExpatState();
  const abroad = _expatIsAbroad();
  const e = S.expat;
  const homeCountry = S.homeCountry || 'egy';
  const homeName = COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].name : homeCountry;
  const homeCurrency = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].currency) || 'EGP';
  const wealthHome = expatWealthInHome();
  const gold = expatGoldSummary();
  const karat = e._goldKarat || '21K';
  const karatCfg = GOLD_KARAT_CONFIG[karat];

  let html = '<div class="card" style="border-color:#22d3ee;padding:12px;background:linear-gradient(180deg,#22d3ee15 0%,transparent 100%)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">🇪🇬 EGYPT & EXPAT LIFE</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + (abroad ? (e.yearsAbroad || 0) + ' year' + ((e.yearsAbroad || 0) !== 1 ? 's' : '') + ' in ' + C().name : 'Living in Egypt') + '</div></div>' +
    '<div style="font-size:2rem">🇪🇬</div></div>' +
    '<div style="margin-top:10px;padding:8px;background:#0a0a12;border-radius:6px">' +
    '<div class="row" style="font-size:.78rem"><span>Total wealth in ' + homeCurrency + '</span><b class="good">' + wealthHome.toLocaleString() + ' ' + homeCurrency + '</b></div>' +
    '<div class="row" style="font-size:.78rem"><span>Gold stash</span><b>' + gold.grams + 'g · ' + gold.valueHome.toLocaleString() + ' ' + homeCurrency + '</b></div>' +
    '<div class="row" style="font-size:.78rem"><span>Egyptian account</span><b>' + (e.egyptAccount.balanceEGP || 0).toLocaleString() + ' EGP</b></div>' +
    (abroad ? '<div class="row" style="font-size:.78rem"><span>Family pressure</span><b class="' + (e.remittancePressure > 5 ? 'bad' : 'good') + '">' + e.remittancePressure + '/10</b></div>' : '') +
    '</div></div>';

  /* Devaluation history */
  if (e.homeCrashes.length > 0) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#fb7185">💱 EGP Devaluations</h4>';
    e.homeCrashes.slice(-3).reverse().forEach(function(crash) {
      html += '<div class="row" style="font-size:.78rem"><span>' + crash.year + ' — EGP crashed ' + Math.round(crash.pct * 100) + '%</span><b>' + crash.oldRate.toFixed(2) + ' → ' + crash.newRate.toFixed(2) + '</b></div>';
    });
    html += '<p class="muted small" style="margin-top:6px">' + (abroad ? 'Each crash makes your foreign savings worth more in Egypt.' : 'Each crash makes imports more expensive and gold more valuable.') + '</p></div>';
  }

  /* Gold section — always visible */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#fbbf24">🪙 Gold Savings</h4>' +
    '<p class="muted small">Buy in any country. Sell anywhere. Prices auto-update with market.</p>';

  /* Karat selector */
  html += '<div style="display:flex;gap:4px;margin-top:6px;flex-wrap:wrap">';
  Object.keys(GOLD_KARAT_CONFIG).forEach(function(k) {
    html += '<button class="pill ' + (karat === k ? 'on' : '') + '" style="padding:6px 10px;font-size:.72rem;flex:1" onclick="expatSetGoldKarat(\'' + k + '\')">' + k + '</button>';
  });
  html += '</div>';

  const perGram = _goldPricePerGram(karat);
  html += '<div class="muted small" style="margin-top:6px;font-size:.72rem">' + karatCfg.label + ' · ' + karatCfg.desc + '</div>' +
    '<div class="row"><span>Per gram</span><b class="mono">' + money(perGram) + '</b></div>' +
    '<div class="row"><span>Buy 1g total</span><b class="mono">' + money(_goldBuyCostLocal(karat, 1)) + '</b></div>' +
    '<div class="row"><span>Sell 1g nets</span><b class="mono">' + money(_goldSellValueLocal(karat, 1)) + '</b></div>';

  /* Buy buttons */
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px">';
  [5, 10, 20].forEach(function(g) {
    const cost = _goldBuyCostLocal(karat, g);
    html += '<button class="opt" style="padding:6px;font-size:.7rem;text-align:center" onclick="expatBuyGold(' + g + ')">Buy ' + g + 'g<br><span class="muted" style="font-size:.65rem">' + money(cost) + '</span></button>';
  });
  html += '</div>';

  /* Existing stash */
  if (e.goldStash.length > 0) {
    html += '<div style="margin-top:10px"><div class="muted small" style="font-weight:700;margin-bottom:4px">YOUR STASH</div>';
    Object.keys(gold.byKarat).forEach(function(k) {
      if (gold.byKarat[k].grams <= 0) return;
      html += '<div class="row" style="font-size:.78rem"><span>' + k + ' · ' + gold.byKarat[k].grams + 'g</span><b class="mono">' + money(gold.byKarat[k].value) + '</b></div>';
    });
    e.goldStash.slice(0, 8).forEach(function(g) {
      html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b style="font-size:.78rem">' + g.grams + 'g ' + (g.karat || '21K') + ' · bought ' + g.buyYear + '</b>' +
        '<button class="pill" style="padding:3px 8px;font-size:.65rem" onclick="expatSellGold(\'' + g.id + '\')">Sell ' + money(_goldSellValueLocal(g.karat || '21K', g.grams)) + '</button></div>' +
        '<div class="muted small" style="font-size:.68rem">Bought for ' + money(g.buyLocal) + ' in ' + g.buyCountry + '</div></div>';
    });
    html += '</div>';
  }
  html += '</div>';

  /* Egyptian bank account — only when abroad */
  if (abroad) {
    html += '<div class="card" style="border-color:#34d399"><h4 style="color:#34d399">🏦 Egyptian Bank Account</h4>' +
      '<p class="muted small">Save EGP while earning foreign currency. Accessible from anywhere.</p>' +
      '<div class="row"><span>Balance</span><b class="mono good">' + (e.egyptAccount.balanceEGP || 0).toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>≈ in ' + C().currency + '</span><b class="mono">' + money(_expatFromEGP(e.egyptAccount.balanceEGP || 0)) + '</b></div>' +
      (e.egyptAccount.openedYear ? '<div class="muted small">Opened ' + e.egyptAccount.openedYear + ' · Total deposited ' + e.egyptAccount.totalDeposited.toLocaleString() + ' EGP</div>' : '') +
      '<div style="display:flex;gap:6px;margin-top:8px">' +
      '<button class="opt" style="flex:1;text-align:center;font-size:.75rem;background:#34d39920;border-color:#34d399;padding:8px" onclick="expatDepositEgypt()">➕ Deposit</button>' +
      '<button class="opt" style="flex:1;text-align:center;font-size:.75rem;padding:8px" onclick="expatWithdrawEgypt()">➖ Withdraw</button>' +
      '</div></div>';

    /* Family wants integration */
    if (typeof familyDepthGetActiveWants === 'function') {
      const financialWants = familyDepthGetActiveWants().filter(function(w) { return (w.costEGP || 0) > 0; });
      if (financialWants.length > 0) {
        html += '<div class="card" style="border-color:#8b5cf6"><h4 style="color:#8b5cf6">💝 Family Wants (pay from Egypt account)</h4>' +
          '<p class="muted small">Your family needs money back home. Pay directly from your Egyptian savings.</p>';
        financialWants.forEach(function(w) {
          const egpNeeded = w.costEGP || 0;
          const canPay = e.egyptAccount.balanceEGP >= egpNeeded;
          html += '<div style="padding:8px 0;border-bottom:1px solid #1a1a2a">' +
            '<div style="font-weight:700;font-size:.82rem">' + w.relationName + '</div>' +
            '<div class="muted small">Wants ' + w.label + '</div>' +
            '<div class="row"><span>Cost</span><b>' + egpNeeded.toLocaleString() + ' EGP</b></div>' +
            '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.72rem;' + (canPay ? 'background:#8b5cf620;border-color:#8b5cf6' : 'opacity:.5') + '" ' + (canPay ? '' : 'disabled') + ' onclick="expatPayFamilyWantFromEgypt(\'' + w.id + '\')">' + (canPay ? '💝 Pay from Egypt account' : 'Need ' + (egpNeeded - e.egyptAccount.balanceEGP).toLocaleString() + ' more EGP') + '</button>' +
            '</div>';
        });
        html += '</div>';
      }
    }

    /* Hawala + remittance */
    html += '<div class="card" style="border-color:#34d399"><h4 style="color:#34d399">💸 Send Money Home</h4>' +
      '<p class="muted small">Remittance pressure: <b>' + e.remittancePressure + '/10</b></p>' +
      (e.blackMarketContacts
        ? '<div class="row"><span>Hawala broker</span><b class="good">Connected (+15-30%)</b></div>'
        : '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="expatFindHawala()">🔍 Look for hawala broker</button>') +
      '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;font-size:.78rem" onclick="expatSendRemittance()">💸 Send Remittance</button>' +
      '</div>';

    /* Return readiness */
    const readiness = _expatCalculateReturnReadiness();
    html += '<div class="card" style="border-color:' + (readiness.ready ? '#34d399' : '#fbbf24') + '">' +
      '<h4 style="color:' + (readiness.ready ? '#34d399' : '#fbbf24') + '">🏠 Return Home Readiness</h4>';
    Object.keys(readiness.checks).forEach(function(k) {
      const c = readiness.checks[k];
      html += '<div class="row" style="padding:4px 0;font-size:.78rem">' +
        '<span>' + (c.ok ? '✅' : c.optional ? '⚪' : '❌') + ' ' + c.label + (c.optional ? ' (optional)' : '') + '</span>' +
        (c.detail ? '<span class="muted small">' + c.detail + '</span>' : '') + '</div>';
    });
    html += '<div class="row" style="margin-top:8px"><span>Overall</span><b class="' + (readiness.ready ? 'good' : '') + '">' + Math.round(readiness.score) + '%</b></div>';
    if (readiness.ready) {
      html += '<button class="opt" style="margin-top:10px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;font-size:.85rem;padding:10px" onclick="expatReturnHome()">🏠 Return Home</button>';
    }
    html += '</div>';
  } else {
    html += '<div class="card" style="border-color:#666;opacity:.7"><p class="muted small">💡 <b>You are in Egypt.</b> Travel abroad to unlock remittance, hawala, Egyptian bank deposits, and return planning. But gold and inflation tracking work everywhere.</p></div>';
  }

  return html;
};

console.log('[World Life] 36-expat-life.js loaded — v2');
