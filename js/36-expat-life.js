/* ============================================================
   EXPAT LIFE — Egyptian reality systems
   ============================================================
   - EGP devaluation events (real Egyptian economy)
   - Black market / hawala exchange
   - Gold savings as inflation hedge
   - Family pressure scaling with years abroad
   - Egyptian community (mosque, church, ahwa, football)
   - Return home calculator + the big return event
   - Second passport goal tracking
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
      returnChecklist: {
        apartment: false,
        savingsGoal: false,
        income: false,
        familyApproved: false
      },
      passToReturnHome: false
    };
  }
  const e = S.expat;
  if (!Array.isArray(e.goldStash)) e.goldStash = [];
  if (!Array.isArray(e.homeCrashes)) e.homeCrashes = [];
  if (typeof e.communityBond !== 'number') e.communityBond = 50;
  if (typeof e.remittancePressure !== 'number') e.remittancePressure = 0;
  if (!e.returnChecklist) e.returnChecklist = { apartment: false, savingsGoal: false, income: false, familyApproved: false };
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
window.expatIsAbroad = _expatIsAbroad;

/* Convert current wealth to home country currency for display */
function expatWealthInHome() {
  if (!S) return 0;
  const homeRate = _expatHomeRate();
  const currentRate = C().rate || 1;
  return Math.round((S.wealth || 0) / currentRate * homeRate);
}
window.expatWealthInHome = expatWealthInHome;

/* ============================================================
   1. EGP DEVALUATION EVENTS
   ============================================================ */
/* Real Egyptian economy: pound repeatedly crashes 20-50% */
GameHooks.on('year', function() {
  ensureExpatState();
  if (!S) return;
  const e = S.expat;

  /* Only fire devaluation events when player is Egyptian (or home is egy) */
  const homeCountry = S.homeCountry || 'egy';
  if (homeCountry !== 'egy') return;

  const currentAbs = _expatAbs();
  const yearsSinceLast = (currentAbs - (e.lastDevaluationAbs || 0)) / 12;

  /* Every 2-4 years, ~40% chance of a devaluation */
  if (yearsSinceLast >= 2 && Math.random() < 0.40) {
    const severity = Math.random();
    const pct = severity < 0.3 ? 0.10 : severity < 0.7 ? 0.25 : 0.45;
    _expatTriggerDevaluation(pct);
    e.lastDevaluationAbs = currentAbs;
  }
});

function _expatTriggerDevaluation(pct) {
  const e = S.expat;
  const currentAbs = _expatAbs();
  const oldRate = COUNTRIES.egy.rate;

  /* Devaluation means 1 USD buys more EGP, so EGP rate goes UP */
  COUNTRIES.egy.rate = Math.round(oldRate * (1 + pct) * 100) / 100;

  e.homeCrashes.push({
    year: gameYear(),
    pct: pct,
    oldRate: oldRate,
    newRate: COUNTRIES.egy.rate
  });
  if (e.homeCrashes.length > 10) e.homeCrashes = e.homeCrashes.slice(-10);

  /* If player is IN Egypt → their wealth loses value proportionally */
  if (S.country === 'egy') {
    /* Wealth already in EGP - they lose purchasing power relative to imports */
    log('💱 EGP devalued ' + Math.round(pct * 100) + '%! Prices of imports and gold jump.');
    fx({ happiness: -6 });
  } else {
    /* Player is abroad earning foreign currency → their money is now worth MORE in Egypt */
    const boost = Math.round(pct * 100);
    log('💱 EGP crashed ' + boost + '%! Your ' + C().currency + ' savings are now worth much more back home.');
    log('📈 Family back home will need more money — prices doubled.');
    fx({ happiness: 4 });
    e.remittancePressure += 2;
  }

  emitSignal('egpDevalued', { pct: pct, newRate: COUNTRIES.egy.rate });
}

/* ============================================================
   2. BLACK MARKET / HAWALA EXCHANGE
   ============================================================ */
function _hawalaSpread() {
  /* Black market premium over official rate: 15-30% historically */
  return 0.15 + Math.random() * 0.15;
}

window.expatFindHawala = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ You are not abroad.'); render(); return; }
  if ((S.homeCountry || 'egy') !== 'egy') { log('❌ Hawala is Egyptian-specific.'); render(); return; }
  if (S.expat.blackMarketContacts) { log('✅ You already know a hawala broker.'); render(); return; }

  if (!confirm('Look for a hawala broker?\n\nHawala is the traditional Egyptian remittance network.\n\n✓ 15-30% better exchange rate than banks\n✗ Illegal\n✗ Risk of loss (5-10% scam chance)\n\nProceed?')) return;

  if (Math.random() < 0.30) {
    log('❌ No trustworthy broker found this time. Ask again next year.');
    render(); return;
  }

  S.expat.blackMarketContacts = true;
  log('🤝 You found a hawala broker. Future remittances will use the black market rate.');
  emitSignal('hawalaContactsAcquired', {});
  render();
};

window.expatSendRemittance = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ You are not abroad.'); render(); return; }
  const input = prompt('How much to send home?\n\nYou have ' + money(S.wealth) + '\n\nTip: Send in chunks. More than 50% of your wealth at once is risky.', String(Math.round(S.wealth * 0.2)));
  if (!input) return;
  const amount = Math.round(Number(input));
  if (amount <= 0 || amount > S.wealth) { log('❌ Invalid amount.'); render(); return; }

  const currentRate = C().rate || 1;
  const homeRate = _expatHomeRate();
  let rate = currentRate / homeRate; /* foreign per EGP */

  /* Apply hawala bonus if available */
  if (S.expat.blackMarketContacts) {
    const spread = _hawalaSpread();
    rate = rate * (1 + spread);
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

  /* Distribute to family if present, else to mother allowance pool */
  const livingParents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false;
  });
  if (livingParents.length) {
    const share = Math.round(homeAmount / livingParents.length);
    livingParents.forEach(function(p) {
      p.wealth = (p.wealth || 0) + share;
      p.bond = Math.min(100, (p.bond || 70) + 3);
    });
    log('💸 Sent ' + money(amount) + ' home via ' + (S.expat.blackMarketContacts ? 'hawala' : 'bank') + ' → ' + homeAmount.toLocaleString() + ' EGP received. Family bond +3 each.');
  } else {
    log('💸 Sent ' + money(amount) + ' home → ' + homeAmount.toLocaleString() + ' EGP (family not present, stored as savings).');
  }

  /* Reduce remittance pressure */
  S.expat.remittancePressure = Math.max(0, S.expat.remittancePressure - 1);
  fx({ happiness: 3 });
  emitSignal('remittanceSent', { amount: amount, homeAmount: homeAmount });
  render();
};

/* ============================================================
   3. GOLD SAVINGS (inflation hedge)
   ============================================================ */
const GOLD_VOLATILITY = {
  buyPremiumPct: 0.03,  /* dealer mark-up when buying */
  sellDiscountPct: 0.02  /* dealer discount when selling */
};

function _goldPricePerGramLocal() {
  const prices = (typeof GOLD_PRICES !== 'undefined' && GOLD_PRICES[S.country]) ? GOLD_PRICES[S.country] : null;
  if (prices) return prices.perGram21K || 3200;
  return Math.round(85 * (C().rate || 1));
}

window.expatBuyGold = function(grams) {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ You must be abroad.'); render(); return; }
  const price = _goldPricePerGramLocal();
  const total = Math.round(price * grams * (1 + GOLD_VOLATILITY.buyPremiumPct));
  if (S.wealth < total) { log('❌ Need ' + money(total) + '.'); render(); return; }
  if (!confirm('Buy ' + grams + 'g of 21K gold?\n\nPrice: ' + money(total) + '\nDealer markup: 3%\n\nGold holds value against EGP devaluation.')) return;

  S.wealth -= total;
  S.expat.goldStash.push({
    id: 'gold_' + Math.random().toString(36).slice(2, 8),
    grams: grams,
    buyPricePerGram: price,
    buyLocal: total,
    buyYear: gameYear(),
    buyCountry: S.country
  });
  log('🪙 Bought ' + grams + 'g of 21K gold for ' + money(total) + '.');
  fx({ happiness: 3 });
  render();
};

window.expatSellGold = function(goldId) {
  ensureExpatState();
  const idx = S.expat.goldStash.findIndex(function(g) { return g.id === goldId; });
  if (idx < 0) return;
  const gold = S.expat.goldStash[idx];
  const price = _goldPricePerGramLocal();
  const value = Math.round(price * gold.grams * (1 - GOLD_VOLATILITY.sellDiscountPct));
  if (!confirm('Sell ' + gold.grams + 'g of gold?\n\nCurrent price: ' + money(value) + '\nBought for: ' + money(gold.buyLocal) + '\n\nProceed?')) return;

  S.wealth += value;
  S.expat.goldStash.splice(idx, 1);
  const profit = value - gold.buyLocal;
  const pct = gold.buyLocal > 0 ? Math.round((profit / gold.buyLocal) * 100) : 0;
  log('🪙 Sold ' + gold.grams + 'g gold for ' + money(value) + ' (' + (profit >= 0 ? '+' : '') + pct + '%).');
  render();
};

window.expatGoldSummary = function() {
  if (!S || !S.expat || !S.expat.goldStash) return { grams: 0, valueLocal: 0, valueHome: 0 };
  const price = _goldPricePerGramLocal();
  const grams = S.expat.goldStash.reduce(function(s, g) { return s + g.grams; }, 0);
  const valueLocal = Math.round(price * grams);
  const homeRate = _expatHomeRate();
  const currentRate = C().rate || 1;
  return {
    grams: grams,
    valueLocal: valueLocal,
    valueHome: Math.round(valueLocal / currentRate * homeRate)
  };
};

/* Gold price grows with devaluation + slow appreciation */
GameHooks.on('year', function() {
  ensureExpatState();
  if (!S) return;
  /* Gold price tracks home currency + slight inflation premium */
  const goldPriceEGP = (typeof GOLD_PRICES !== 'undefined' && GOLD_PRICES.egy) ? GOLD_PRICES.egy : null;
  if (goldPriceEGP) {
    /* Egyptian gold has risen faster than inflation */
    goldPriceEGP.perGram21K = Math.round(goldPriceEGP.perGram21K * 1.08);
    goldPriceEGP.perGram24K = Math.round(goldPriceEGP.perGram24K * 1.08);
    goldPriceEGP.perGram18K = Math.round(goldPriceEGP.perGram18K * 1.08);
  }
});

/* ============================================================
   4. FAMILY PRESSURE SCALING
   ============================================================ */
GameHooks.on('year', function() {
  ensureExpatState();
  if (!S || !_expatIsAbroad()) return;
  const e = S.expat;
  e.yearsAbroad = (e.yearsAbroad || 0) + 1;

  /* Pressure grows slowly */
  e.remittancePressure = Math.min(10, (e.remittancePressure || 0) + 1);

  /* Fire pressure events based on level */
  if (e.remittancePressure >= 3 && Math.random() < 0.40) {
    _expatFamilyPressureEvent();
  }
});

function _expatFamilyPressureEvent() {
  const e = S.expat;
  const pressureLevel = e.remittancePressure;
  const homeCountry = S.homeCountry || 'egy';
  const homeCurrency = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].currency) || 'EGP';
  const homeRate = _expatHomeRate();
  const currentRate = C().rate || 1;

  const events = [
    { minLevel: 3, maxLevel: 10, id: 'mother_wants_visit', text: 'Your mother called. "When will you come home? It\'s been ' + e.yearsAbroad + ' years."', choice: false,
      effect: function() { fx({ happiness: -3 }); (S.family || []).forEach(function(m) { if (m.role === 'Mother') m.bond = Math.max(0, (m.bond || 70) - 3); }); } },
    { minLevel: 4, maxLevel: 10, id: 'sibling_wedding', text: 'Your sibling is getting married. Family expects a significant contribution — the standard for an expat.', choice: true,
      choices: ['Send 50,000 EGP (real cost)', 'Send 20,000 EGP (what you can)', 'Refuse — you cannot afford it'] },
    { minLevel: 5, maxLevel: 10, id: 'father_medical', text: 'Your father needs a medical procedure. Family is asking if you can help cover part of the bill.', choice: true,
      choices: ['Pay for the whole procedure (30,000 EGP)', 'Send what you can (15,000 EGP)', 'Not this time'] },
    { minLevel: 5, maxLevel: 10, id: 'pressure_to_return', text: 'Your family is asking when you\'ll return permanently. "The kids are growing up without you."', choice: true,
      choices: ['Reassure them — a plan exists', 'Says you\'ll stay longer', 'Consider returning sooner'] },
    { minLevel: 6, maxLevel: 10, id: 'building_apartment', text: 'The family is building or buying an apartment. They want you to contribute — this would be YOUR apartment.', choice: true,
      choices: ['Contribute 150,000 EGP for your share', 'Contribute 60,000 EGP', 'Say no — you have other plans'] },
    { minLevel: 7, maxLevel: 10, id: 'sister_tuition', text: 'Your younger sister needs university tuition. Family can\'t cover it alone.', choice: true,
      choices: ['Pay full tuition (40,000 EGP/year)', 'Split with siblings', 'Refuse'] },
    { minLevel: 8, maxLevel: 10, id: 'pressure_marry_cousin', text: 'Your family is suggesting a marriage arrangement back home. "A good Egyptian girl/boy."', choice: true,
      choices: ['Consider it', 'Decline politely', 'Say yes to an introduction'] }
  ];

  const eligible = events.filter(function(ev) {
    return pressureLevel >= ev.minLevel && pressureLevel <= ev.maxLevel;
  });
  if (!eligible.length) return;
  const ev = eligible[Math.floor(Math.random() * eligible.length)];

  /* Convert to current currency */
  const toLocal = function(egp) { return Math.round(egp / homeRate * currentRate); };

  if (!ev.choice) {
    log('📞 ' + ev.text);
    if (ev.effect) ev.effect();
    emitSignal('familyPressure', { event: ev.id });
    return;
  }

  /* Build choice dialog */
  const costMap = { 
    'sibling_wedding': [50000, 20000, 0],
    'father_medical': [30000, 15000, 0],
    'building_apartment': [150000, 60000, 0],
    'sister_tuition': [40000, 0, 0]
  };
  const costs = costMap[ev.id] || [0, 0, 0];

  S.pending = {
    title: '👨‍👩‍👧 Family Pressure',
    text: ev.text,
    choices: ev.choices.map(function(label, idx) {
      return {
        label: label,
        effect: function(s) {
          const costEGP = costs[idx] || 0;
          const costLocal = toLocal(costEGP);
          if (costLocal > 0) {
            if (s.wealth < costLocal) {
              log('❌ You cannot afford that.');
              s.expat.remittancePressure = Math.min(10, s.expat.remittancePressure + 1);
              return;
            }
            s.wealth -= costLocal;
            log('💸 Sent ' + money(costLocal) + ' home (' + costEGP.toLocaleString() + ' ' + homeCurrency + ').');
            s.expat.remittancePressure = Math.max(0, s.expat.remittancePressure - 2);
            /* Family bond up */
            (s.family || []).forEach(function(m) {
              if (m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 5);
            });
            fx({ happiness: 3 });
          } else {
            log('😐 You declined. Family bond decreased.');
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
   5. EGYPTIAN COMMUNITY ABROAD
   ============================================================ */
const EGYPTIAN_COMMUNITY_EVENTS = [
  { id: 'mosque_dinner',   weight: 8,  text: 'Egyptian community dinner at the mosque. Old friends, home food, football on the TV.', happy: 6, soc: 5, costEGP: 200 },
  { id: 'church_festival', weight: 6,  text: 'Coptic church festival with Egyptian families. Koshary and ahwa.', happy: 5, soc: 4, costEGP: 150 },
  { id: 'ahwa_cafe',       weight: 10, text: 'Egyptian café (ahwa) — shisha, tea, and complaints about the motherland.', happy: 4, soc: 4, costEGP: 100 },
  { id: 'ahly_zamalek',    weight: 7,  text: 'Ahly vs Zamalek match at the community center. Everyone yelling in Arabic.', happy: 6, soc: 6, costEGP: 80 },
  { id: 'ramadan_iftar',   weight: 5,  text: 'Community iftar during Ramadan. Long tables, molokhia, everyone homesick together.', happy: 10, soc: 7, costEGP: 300, requiresRamadan: true },
  { id: 'eid_gathering',   weight: 5,  text: 'Eid gathering with Egyptian families. Kids running around, uncles smoking, mothers cooking.', happy: 9, soc: 6, costEGP: 400 },
  { id: 'new_year_party',  weight: 4,  text: 'Egyptian New Year party. Someone brought an oud. Everyone sings along.', happy: 7, soc: 5, costEGP: 500 },
  { id: 'job_referral',    weight: 3,  text: 'A community member offers to refer you to a better position.', happy: 4, soc: 3, costEGP: 0, special: 'referral' },
  { id: 'doctor_solidarity', weight: 3, text: 'An Egyptian doctor in the community gives you free medical advice.', happy: 3, health: 5, costEGP: 0 },
  { id: 'helping_newcomer', weight: 5, text: 'A newly-arrived Egyptian family asks for help settling in. You remember being new.', happy: 5, soc: 6, costEGP: 200, choice: true }
];

GameHooks.on('year', function() {
  ensureExpatState();
  if (!S || !_expatIsAbroad()) return;
  const e = S.expat;

  /* Community bond grows naturally over time */
  e.communityBond = Math.min(100, (e.communityBond || 50) + 2);

  /* Random community event — ~35% chance per year */
  if (Math.random() < 0.35 && !S.pending) {
    const eligible = EGYPTIAN_COMMUNITY_EVENTS.filter(function(ev) {
      if (ev.requiresRamadan && typeof isRamadanMonth === 'function' && !isRamadanMonth()) return false;
      return true;
    });
    if (!eligible.length) return;
    const total = eligible.reduce(function(s, e) { return s + e.weight; }, 0);
    let roll = Math.random() * total;
    let chosen = eligible[0];
    for (let i = 0; i < eligible.length; i++) {
      roll -= eligible[i].weight;
      if (roll <= 0) { chosen = eligible[i]; break; }
    }

    const costLocal = Math.round((chosen.costEGP || 0) * ((C().rate || 1) / 52.7));

    if (chosen.special === 'referral') {
      if (S.career && S.career.job) {
        const bump = Math.round(S.career.job.salary * 0.10);
        S.career.job.salary += bump;
        log('🤝 ' + chosen.text + ' Your salary went up by ' + money(bump) + '!');
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
            log('🤝 You helped the new family. Community bond +5.');
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

    /* Simple non-choice event */
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
   6. RETURN HOME READINESS
   ============================================================ */
function _expatCalculateReturnReadiness() {
  const homeRate = _expatHomeRate();
  const currentRate = C().rate || 1;
  const wealthHome = Math.round((S.wealth || 0) / currentRate * homeRate);

  /* What does returning home require? */
  const checks = {
    apartment: {
      label: 'Own a property in home country',
      ok: (S.ownedHomes || []).some(function(h) { return h.country === (S.homeCountry || 'egy') && h.status !== 'sold'; }),
      optional: false
    },
    savingsGoal: {
      label: 'Have ~2 years of emergency savings in home currency',
      ok: wealthHome >= 1500000,
      detail: 'Need ' + (1500000).toLocaleString() + ' EGP · Have ' + wealthHome.toLocaleString() + ' EGP'
    },
    income: {
      label: 'Have source of income (job, business, pension) in home country',
      ok: !!(S.job || (S.career && S.career.job) || (S.career && S.career.businesses && S.career.businesses.length > 0) || (S.career && S.career.pension && S.career.pension.accumulated > 500000)),
      optional: false
    },
    familyApproved: {
      label: 'Family supports your return',
      ok: (S.family || []).filter(function(m) {
        return m.alive !== false && (m.role === 'Mother' || m.role === 'Father');
      }).every(function(m) { return (m.bond || 70) >= 50; }),
      optional: true
    }
  };

  const requiredCount = Object.keys(checks).filter(function(k) { return !checks[k].optional; }).length;
  const requiredMet = Object.keys(checks).filter(function(k) { return !checks[k].optional && checks[k].ok; }).length;
  const optionalMet = Object.keys(checks).filter(function(k) { return checks[k].optional && checks[k].ok; }).length;

  return {
    ready: requiredMet >= requiredCount,
    score: (requiredMet / requiredCount) * 100,
    checks: checks,
    wealthHome: wealthHome
  };
}
window.expatReturnReadiness = _expatCalculateReturnReadiness;

window.expatReturnHome = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) { log('❌ You are not abroad.'); render(); return; }
  const readiness = _expatCalculateReturnReadiness();
  if (!readiness.ready) {
    log('❌ Not ready to return. Complete the required checklist first.');
    render();
    return;
  }
  const homeCountry = S.homeCountry || 'egy';
  const homeName = COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].name : homeCountry;

  const reason = prompt('Return to ' + homeName + '?\n\n1. Retire comfortably\n2. Start a business back home\n3. Work in ' + homeName + '\n4. Just miss home\n\nEnter 1-4:', '1');
  if (!reason) return;
  const reasons = { '1': 'retire', '2': 'business', '3': 'work', '4': 'family' };
  const reasonKey = reasons[reason] || 'family';

  if (!confirm('Return home to ' + homeName + '?\n\nYour foreign salary ends.\nYour wealth converts to ' + homeName + ' currency.\nYour Gulf/career status resets.\n\nProceed?')) return;

  /* Conversion */
  const oldRate = C().rate || 1;
  const newRate = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].rate) || 1;
  if (typeof S.wealth === 'number') S.wealth = Math.round(S.wealth / oldRate * newRate);
  if (S.bank && Array.isArray(S.bank.accounts)) S.bank.accounts.forEach(function(a) { if (typeof a.balance === 'number') a.balance = Math.round(a.balance / oldRate * newRate); });

  S.country = homeCountry;
  S._lastCountry = homeCountry;

  /* Clear Gulf work / immigration foreign status */
  if (S.gulfWork) S.gulfWork.active = false;
  if (S.immigration) {
    S.immigration.destination = null;
    S.immigration.visaType = null;
    S.immigration.status = 'citizen_home';
  }

  /* End foreign job */
  if (S.career && S.career.job) {
    if (typeof carLeaveCurrentJob === 'function') carLeaveCurrentJob('returned home');
    else { S.career.job = null; S.job = null; }
  }

  /* Event */
  log('🏠 RETURNED HOME to ' + homeName + ' after ' + (S.expat.yearsAbroad || 0) + ' years abroad!');
  log('💰 Wealth: ' + money(S.wealth) + ' · Reason: ' + reasonKey);
  fx({ happiness: 25, social: 15 });
  (S.family || []).forEach(function(m) {
    if (m.alive !== false) m.bond = Math.min(100, (m.bond || 70) + 20);
  });

  S.expat.yearsAbroad = 0;
  S.expat.passToReturnHome = true;
  S.expat.returnChecklist = { apartment: false, savingsGoal: false, income: false, familyApproved: false };

  emitSignal('returnedHome', { from: oldRate, to: newRate, reason: reasonKey });
  render();
};

/* ============================================================
   7. RENDER
   ============================================================ */
window.expatRender = function() {
  ensureExpatState();
  if (!_expatIsAbroad()) {
    return '<div class="card"><h3>🌍 Expat Life</h3><p class="muted small">You are living in your home country. Travel abroad first.</p></div>';
  }

  const e = S.expat;
  const homeCountry = S.homeCountry || 'egy';
  const homeName = COUNTRIES[homeCountry] ? COUNTRIES[homeCountry].name : homeCountry;
  const homeCurrency = (COUNTRIES[homeCountry] && COUNTRIES[homeCountry].currency) || 'EGP';
  const wealthHome = expatWealthInHome();
  const gold = expatGoldSummary();

  let html = '<div class="card" style="border-color:#22d3ee;padding:12px;background:linear-gradient(180deg,#22d3ee15 0%,transparent 100%)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">🌍 EXPAT LIFE</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + (e.yearsAbroad || 0) + ' year' + ((e.yearsAbroad || 0) !== 1 ? 's' : '') + ' in ' + C().name + '</div></div>' +
    '<div style="font-size:2rem">🇪🇬</div></div>' +
    '<div style="margin-top:10px;padding:8px;background:#0a0a12;border-radius:6px">' +
    '<div class="row" style="font-size:.78rem"><span>Wealth in ' + homeCurrency + '</span><b class="good">' + wealthHome.toLocaleString() + ' ' + homeCurrency + '</b></div>' +
    '<div class="row" style="font-size:.78rem"><span>Gold stash</span><b>' + gold.grams + 'g · ' + gold.valueHome.toLocaleString() + ' ' + homeCurrency + '</b></div>' +
    '<div class="row" style="font-size:.78rem"><span>Family pressure</span><b class="' + (e.remittancePressure > 5 ? 'bad' : 'good') + '">' + e.remittancePressure + '/10</b></div>' +
    '<div class="row" style="font-size:.78rem"><span>Community bond</span><b>' + e.communityBond + '/100</b></div>' +
    '</div></div>';

  /* Currency events history */
  if (e.homeCrashes.length > 0) {
    html += '<div class="card"><h4 style="font-size:.85rem;color:#fb7185">💱 EGP Devaluations</h4>';
    e.homeCrashes.slice(-3).reverse().forEach(function(crash) {
      html += '<div class="row" style="font-size:.78rem"><span>' + crash.year + ' — EGP crashed ' + Math.round(crash.pct * 100) + '%</span><b>' + crash.oldRate.toFixed(2) + ' → ' + crash.newRate.toFixed(2) + '</b></div>';
    });
    html += '<p class="muted small" style="margin-top:6px">Each crash makes your foreign savings worth more in Egypt, but prices at home double.</p></div>';
  }

  /* Gold */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#fbbf24">🪙 Gold Savings (inflation hedge)</h4>' +
    '<p class="muted small">Egyptians store wealth in gold — it holds value when the pound crashes.</p>' +
    '<div class="row"><span>Total gold</span><b>' + gold.grams + 'g</b></div>' +
    '<div class="row"><span>Value (local)</span><b class="mono">' + money(gold.valueLocal) + '</b></div>' +
    '<div class="row"><span>Value (home)</span><b class="mono good">' + gold.valueHome.toLocaleString() + ' ' + homeCurrency + '</b></div>';
  if (e.goldStash.length > 0) {
    html += '<div style="margin-top:8px">';
    e.goldStash.forEach(function(g) {
      html += '<div style="padding:6px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="display:flex;justify-content:space-between"><b>' + g.grams + 'g 21K · bought ' + g.buyYear + '</b>' +
        '<button class="pill" style="padding:3px 8px;font-size:.68rem" onclick="expatSellGold(\'' + g.id + '\')">Sell</button></div>' +
        '<div class="muted small">Bought for ' + money(g.buyLocal) + ' in ' + g.buyCountry + '</div></div>';
    });
    html += '</div>';
  }
  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">';
  [5, 10, 20].forEach(function(g) {
    const cost = Math.round(_goldPricePerGramLocal() * g * 1.03);
    html += '<button class="opt" style="padding:6px;font-size:.72rem;text-align:center" onclick="expatBuyGold(' + g + ')">Buy ' + g + 'g · ' + money(cost) + '</button>';
  });
  html += '<button class="opt" style="padding:6px;font-size:.72rem;text-align:center" onclick="expatBuyGold(prompt(\'Grams?\',\'15\')*1)">Buy custom</button>';
  html += '</div></div>';

  /* Hawala + remittance */
  html += '<div class="card" style="border-color:#34d399"><h4 style="color:#34d399">💸 Send Money Home</h4>' +
    '<p class="muted small">Remittance pressure: <b>' + e.remittancePressure + '/10</b></p>' +
    (e.blackMarketContacts
      ? '<div class="row"><span>Hawala broker</span><b class="good">Connected (+15-30% rate)</b></div>'
      : '<button class="opt" style="margin-top:6px;width:100%;text-align:center;font-size:.75rem" onclick="expatFindHawala()">🔍 Look for hawala broker</button>') +
    '<button class="opt" style="margin-top:6px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;font-size:.78rem" onclick="expatSendRemittance()">💸 Send Remittance</button>' +
    '</div>';

  /* Return readiness */
  const readiness = _expatCalculateReturnReadiness();
  html += '<div class="card" style="border-color:' + (readiness.ready ? '#34d399' : '#fbbf24') + '">' +
    '<h4 style="color:' + (readiness.ready ? '#34d399' : '#fbbf24') + '">🏠 Return Home Readiness</h4>' +
    '<div class="muted small" style="margin-bottom:6px">Before you can move back to ' + homeName + ':</div>';
  Object.keys(readiness.checks).forEach(function(k) {
    const c = readiness.checks[k];
    html += '<div class="row" style="padding:4px 0;font-size:.78rem">' +
      '<span>' + (c.ok ? '✅' : c.optional ? '⚪' : '❌') + ' ' + c.label + (c.optional ? ' (optional)' : '') + '</span>' +
      (c.detail ? '<span class="muted small">' + c.detail + '</span>' : '') +
      '</div>';
  });
  html += '<div class="row" style="margin-top:8px"><span>Overall readiness</span><b class="' + (readiness.ready ? 'good' : '') + '">' + Math.round(readiness.score) + '%</b></div>';
  if (readiness.ready) {
    html += '<button class="opt" style="margin-top:10px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700;font-size:.85rem;padding:10px" onclick="expatReturnHome()">🏠 Return Home to ' + homeName + '</button>';
  } else {
    html += '<div class="muted small" style="margin-top:6px;padding:8px;background:#0f0f1a;border-radius:6px">💡 Complete the required checks (❌) to unlock return home. Optional (⚪) items add bonus happiness when you return.</div>';
  }
  html += '</div>';

  return html;
};

console.log('[World Life] 36-expat-life.js loaded');
