/* ============================================================
   FAMILY VISITS & GIFTS — The "Expat ATM" Experience (v2)
   ============================================================
   NEW: Works for all expats globally (EU/USA/Gulf)
   NEW: Shipping Methods (DHL vs Mandoob/Traveler)
   NEW: Family Drama Events (Loans, Medical Emergencies, Devaluation)
   NEW: Visit Complications (Overstays, Medical bills)
   ============================================================ */

function ensureFamilyVisitState() {
  if (!S) return;
  if (!S.familyVisits) {
    S.familyVisits = {
      incoming: [],
      gifts: [],
      allowanceHistory: 0
    };
  }
}
GameHooks.on('newGame', ensureFamilyVisitState);
GameHooks.on('migrate', ensureFamilyVisitState);

/* ---------- HELPERS ---------- */
function _fvRate() { return (C().rate || 1) / 52.7; }
function _fvLocal(egp) { return Math.round(egp * _fvRate()); }

function _fvIsExpat() {
  const home = S.homeCountry || 'egy';
  return S.country && S.country !== home;
}

/* ---------- SHIPPING METHODS ---------- */
const FV_SHIPPING_METHODS = [
  { id: 'dhl', label: 'Official Courier (DHL/Aramex)', costMult: 0.15, customsRiskMult: 2.0, lossRisk: 0.0, desc: 'Expensive shipping. Customs will 100% inspect and tax it.' },
  { id: 'mandoob', label: 'Trusted Traveler (Mandoob)', costMult: 0.05, customsRiskMult: 0.2, lossRisk: 0.15, desc: 'Cheap. Dodges most customs. 15% chance it gets "lost" or confiscated.' },
  { id: 'friend', label: 'Returning Friend', costMult: 0.0, customsRiskMult: 0.6, lossRisk: 0.02, desc: 'Free to send. Moderate chance customs stops them at Cairo Airport.' }
];

/* ---------- EXPAT DRAMA EVENTS ---------- */
const FV_EXPAT_DRAMA = [
  {
    id: 'startup_loan',
    weight: 10,
    title: 'The "Rich Expat" Loan',
    text: 'Your brother thinks you are swimming in cash abroad. He wants a "loan" of 100,000 EGP to start a café in Cairo. (He will likely never repay it).',
    requiresSibling: true,
    choices: [
      { label: 'Send the money', effect: 'pay' },
      { label: 'Refuse firmly', effect: 'refuse' }
    ]
  },
  {
    id: 'medical_emergency',
    weight: 15,
    title: 'Medical Emergency Back Home',
    text: 'Your mother needs an urgent operation. The family is looking to you, the expat, to cover the 150,000 EGP private hospital bill.',
    requiresParent: true,
    choices: [
      { label: 'Pay the bill', effect: 'pay' },
      { label: 'Send what you can (50k EGP)', effect: 'partial' },
      { label: 'I cannot afford it', effect: 'refuse' }
    ]
  },
  {
    id: 'currency_panic',
    weight: 12,
    title: 'Currency Devaluation Panic',
    text: 'The EGP just dropped in value again. Your family is panicking and begging you to send USD/Local currency immediately to protect their savings.',
    choices: [
      { label: 'Wire emergency funds', effect: 'pay' },
      { label: 'Tell them to calm down', effect: 'refuse' }
    ]
  },
  {
    id: 'ungrateful_gift',
    weight: 8,
    title: 'Ungrateful Reception',
    text: 'You sent a nice phone home. Your relative complained that it wasn\'t the "Pro Max" version. "If you live abroad, you should buy the best!"',
    choice: false,
    effect: 'ungrateful'
  }
];

/* ---------- BRING FAMILY TO VISIT YOU ---------- */
window.familyInviteVisitor = function(memberId) {
  ensureFamilyVisitState();
  if (!_fvIsExpat()) { log('❌ You must be living abroad to invite family.'); render(); return; }

  const member = (S.family || []).find(function(m) { return m.id === memberId; });
  if (!member || member.alive === false) { log('❌ Invalid family member.'); render(); return; }

  if (!S.rentedHome && S.housing !== 'owned') {
    log('❌ You need your own place for family to stay. Rent an apartment first.'); render(); return;
  }

  /* Determine costs based on location */
  const inGulf = (typeof GULF_COUNTRIES !== 'undefined' && GULF_COUNTRIES.includes(S.country));
  let minSalaryEGP = 150000;
  let visaCostEGP = 5000;
  let maxDays = 30;

  if (inGulf && typeof GULF_FAMILY_VISA_RULES !== 'undefined' && GULF_FAMILY_VISA_RULES[S.country]) {
    const r = GULF_FAMILY_VISA_RULES[S.country];
    minSalaryEGP = r.minSalaryEGP; visaCostEGP = r.costEGP; maxDays = r.maxDays;
  } else if (!inGulf) {
    /* US/EU/UK Tourist Visa estimates */
    minSalaryEGP = 400000; 
    visaCostEGP = 15000;
    maxDays = 90;
  }

  const salary = (S.career && S.career.job ? S.career.job.salary : 0) || (S.job ? S.job.salary : 0);
  if (salary < _fvLocal(minSalaryEGP)) {
    log('❌ Your salary is too low to sponsor a visit. Minimum required: ' + money(_fvLocal(minSalaryEGP)) + '/year.');
    render(); return;
  }

  const flight = _fvLocal(inGulf ? 25000 : 60000); /* Flights to EU/US are more expensive */
  const visa = _fvLocal(visaCostEGP);
  const total = flight + visa;

  if (S.wealth < total) { log('❌ Need ' + money(total) + ' for flight + visa.'); render(); return; }
  if (!confirm('Bring ' + member.name + ' to visit ' + C().name + '?\n\nFlight: ' + money(flight) + '\nVisa fees: ' + money(visa) + '\nMax stay: ' + maxDays + ' days\n\nTotal: ' + money(total))) return;

  S.wealth -= total;

  /* Visa Approval Roll (Harder for US/EU than Gulf) */
  const denialChance = inGulf ? 0.15 : 0.40;
  if (Math.random() < denialChance) {
    log('❌ Visa application for ' + member.name + ' was denied by ' + C().name + ' embassy. Money lost.');
    fx({ happiness: -10 });
    render(); return;
  }

  /* Pre-roll visit complications */
  let complication = 'none';
  const compRoll = Math.random();
  if (compRoll < 0.10) complication = 'medical';
  else if (compRoll < 0.15) complication = 'overstay';

  member.bond = Math.min(100, (member.bond || 70) + 15);
  S.familyVisits.incoming.push({
    memberId: memberId, memberName: member.name, year: gameYear(),
    days: maxDays, cost: total, complication: complication,
    returnedAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) + Math.ceil(maxDays / 30)
  });

  log('✈️ ' + member.name + ' arrived safely! They will stay for ' + maxDays + ' days.');
  fx({ happiness: 20, stress: -10 }); /* Having family around reduces stress */
  
  /* If you have kids, grandparents help massively */
  if (S.children && S.children.length > 0 && (member.role === 'Father' || member.role === 'Mother')) {
    log('👶 ' + member.name + ' is helping take care of the kids! Major stress relief.');
    fx({ stress: -15, happiness: 10 });
  }
  
  render();
};

/* ---------- SEND GIFT FROM ABROAD ---------- */
window.familySendGiftAbroad = function(memberId, giftId, methodId) {
  ensureFamilyVisitState();
  if (!_fvIsExpat()) { log('❌ You must live abroad to send remittances.'); render(); return; }
  
  const member = (S.family || []).find(function(m) { return m.id === memberId; });
  if (!member || member.alive === false) return;
  const gift = (window.GULF_GIFT_CATALOG || []).find(function(g) { return g.id === giftId; });
  if (!gift) return;
  const method = FV_SHIPPING_METHODS.find(function(m) { return m.id === methodId; });
  if (!method) return;

  const itemPrice = Math.round(gift.basePriceUSD * (C().rate || 1));
  const shippingCost = Math.round(itemPrice * method.costMult);
  const total = itemPrice + shippingCost;

  if (S.wealth < total) { log('❌ Need ' + money(total) + ' for gift + shipping.'); render(); return; }
  
  S.wealth -= total;

  /* Loss Risk (Stolen by Mandoob) */
  if (Math.random() < method.lossRisk) {
    log('🚨 The ' + method.label + ' lost or stole the ' + gift.label + '! It never arrived.');
    fx({ happiness: -10 }); render(); return;
  }

  /* Customs Risk */
  const actualCustomsRisk = Math.min(1.0, gift.customsRisk * method.customsRiskMult);
  if (Math.random() < actualCustomsRisk) {
    const tax = Math.round(itemPrice * 0.40);
    S.pending = {
      title: '🚨 Customs Seizure at Cairo Airport',
      text: 'The ' + gift.label + ' sent via ' + method.label + ' was flagged by Egyptian customs. They demand ' + money(tax) + ' in tariffs.',
      choices: [
        { label: 'Pay Tariff (' + money(tax) + ')', effect: function(s) { 
            if (s.wealth >= tax) { s.wealth -= tax; log('💸 Paid customs. ' + member.name + ' received the ' + gift.label + '.'); _fvApplyGiftSuccess(member, gift); }
            else { log('❌ Could not afford tariff. Item confiscated.'); fx({ happiness: -5 }); }
          }
        },
        { label: 'Refuse (Item Lost)', effect: function(s) { log('😡 Item abandoned at customs.'); fx({ happiness: -5 }); } }
      ]
    };
    S.evId = 'gift_customs';
    render(); return;
  }

  log('🎁 The ' + gift.label + ' cleared customs and was delivered to ' + member.name + ' via ' + method.label + '.');
  _fvApplyGiftSuccess(member, gift);
  render();
};

function _fvApplyGiftSuccess(member, gift) {
  member.bond = Math.min(100, (member.bond || 50) + gift.emotional);
  fx({ happiness: 5 });
  S.familyVisits.gifts.push({ year: gameYear(), memberName: member.name, giftLabel: gift.label });
}

/* ---------- SET MONTHLY ALLOWANCE ---------- */
window.familySetAllowanceUI = function(memberId) {
  ensureFamilyVisitState();
  const member = (S.family || []).find(function(m) { return m.id === memberId; });
  if (!member) return;
  
  const current = (S.parentAllowances && S.parentAllowances[memberId]) || 0;
  const currentLocal = Math.round(current * _fvRate());
  const input = prompt(
    'Set monthly allowance for ' + member.name + '?\n\nCurrent: ' + money(currentLocal) + '/month\n(Equivalent to ' + current + ' EGP)\n\nEnter 0 to stop.',
    String(currentLocal)
  );
  if (input === null) return;
  
  const amtLocal = Math.max(0, Math.round(Number(input) || 0));
  const amtEGP = Math.round(amtLocal / _fvRate());
  
  if (!S.parentAllowances) S.parentAllowances = {};
  if (amtEGP === 0) delete S.parentAllowances[memberId];
  else S.parentAllowances[memberId] = amtEGP;
  
  log('💸 Allowance for ' + member.name + ' set to ' + money(amtLocal) + '/month.');
  render();
};

/* ---------- EXPAT DRAMA HANDLER ---------- */
function _fvTriggerExpatDrama() {
  const eligible = FV_EXPAT_DRAMA.filter(function(ev) {
    if (ev.requiresSibling && !(S.family || []).some(function(m) { return m.alive !== false && m.isSibling; })) return false;
    if (ev.requiresParent && !(S.family || []).some(function(m) { return m.alive !== false && (m.role === 'Father' || m.role === 'Mother'); })) return false;
    return true;
  });
  if (!eligible.length) return;

  const totalWeight = eligible.reduce(function(acc, ev) { return acc + ev.weight; }, 0);
  let roll = Math.random() * totalWeight;
  let chosen = eligible[0];
  for (let i = 0; i < eligible.length; i++) {
    roll -= eligible[i].weight;
    if (roll <= 0) { chosen = eligible[i]; break; }
  }

  if (chosen.choice === false) {
    if (chosen.effect === 'ungrateful') { log('😒 ' + chosen.title + ': ' + chosen.text); fx({ happiness: -10, stress: 10 }); }
    return;
  }

  S.pending = {
    title: '🌍 ' + chosen.title,
    text: chosen.text,
    choices: chosen.choices.map(function(c) {
      return {
        label: c.label,
        effect: function(s) { _fvResolveDrama(chosen.id, c.effect, s); }
      };
    })
  };
  S.evId = 'expat_drama';
  render();
}

function _fvResolveDrama(eventId, effect, s) {
  if (eventId === 'startup_loan') {
    const cost = _fvLocal(100000);
    if (effect === 'pay') {
      if (s.wealth >= cost) { s.wealth -= cost; log('💸 You sent the loan. Don\'t expect it back.'); fx({ happiness: -5 }); }
      else { log('❌ You couldn\'t afford it. Brother is furious.'); _fvDamageFamilyBond(20); }
    } else {
      log('😤 You refused. Your brother accused you of changing since you left Egypt.'); _fvDamageFamilyBond(30);
    }
  } else if (eventId === 'medical_emergency') {
    const cost = _fvLocal(150000);
    const partial = _fvLocal(50000);
    if (effect === 'pay') {
      if (s.wealth >= cost) { s.wealth -= cost; log('🏥 You covered the full surgery. Your family is eternally grateful.'); fx({ happiness: 15 }); }
      else { log('❌ You didn\'t have enough for the full amount.'); _fvDamageFamilyBond(15); }
    } else if (effect === 'partial') {
      if (s.wealth >= partial) { s.wealth -= partial; log('🏥 You sent ' + money(partial) + '. They had to borrow the rest.'); }
      else { log('❌ You couldn\'t even afford that.'); _fvDamageFamilyBond(20); }
    } else {
      log('😭 You refused. The family is devastated and disappointed in you.'); _fvDamageFamilyBond(40);
    }
  } else if (eventId === 'currency_panic') {
    const cost = _fvLocal(40000);
    if (effect === 'pay') {
      if (s.wealth >= cost) { s.wealth -= cost; log('💸 You wired emergency funds to stabilize them.'); }
      else log('❌ You couldn\'t afford to help.');
    } else {
      log('📱 You told them to ride it out. They are very stressed.'); _fvDamageFamilyBond(10);
    }
  }
}

function _fvDamageFamilyBond(amount) {
  if (S.family) {
    S.family.forEach(function(m) { if (m.alive !== false) m.bond = Math.max(0, (m.bond || 50) - amount); });
  }
  fx({ stress: 15, happiness: -15 });
}

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureFamilyVisitState();
  if (!S) return;

  /* Process Allowances */
  if (S.parentAllowances && typeof S.parentAllowances === 'object') {
    let totalEGP = 0;
    Object.keys(S.parentAllowances).forEach(function(k) { totalEGP += (S.parentAllowances[k] || 0); });
    if (totalEGP > 0) {
      const totalLocal = _fvLocal(totalEGP * 12); /* Monthly * 12 */
      if (S.wealth >= totalLocal) {
        S.wealth -= totalLocal;
        S.familyVisits.allowanceHistory += totalLocal;
        log('💸 Sent annual family allowances back home: ' + money(totalLocal));
        Object.keys(S.parentAllowances).forEach(function(k) {
          const m = (S.family || []).find(function(x) { return x.id === k; });
          if (m) m.bond = Math.min(100, (m.bond || 70) + 5);
        });
      } else {
        log('⚠️ You could not afford to send family allowances this year (' + money(totalLocal) + ').');
        _fvDamageFamilyBond(10);
      }
    }
  }

  /* Process Returning Visitors & Complications */
  const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
  S.familyVisits.incoming.forEach(function(v) {
    if (v.loggedReturn) return;
    if (currentAbs >= v.returnedAbsMonth) {
      v.loggedReturn = true;
      if (v.complication === 'medical') {
        const bill = _fvLocal(25000);
        log('🚨 ' + v.memberName + ' got sick during their visit! Without local insurance, you paid ' + money(bill) + ' in medical bills.');
        S.wealth = Math.max(0, S.wealth - bill);
        fx({ stress: 10, happiness: -10 });
      } else if (v.complication === 'overstay') {
        const fine = _fvLocal(15000);
        log('🚨 ' + v.memberName + ' missed their flight and overstayed their visa! You had to pay ' + money(fine) + ' in immigration fines.');
        S.wealth = Math.max(0, S.wealth - fine);
        fx({ stress: 15 });
      } else {
        log('👋 ' + v.memberName + ' returned home safely after their visit.');
      }
    }
  });

  /* Expat Drama Roll */
  if (_fvIsExpat() && Math.random() < 0.25 && !S.pending) {
    _fvTriggerExpatDrama();
  }
});

/* ---------- RENDER UI ---------- */
window.familyVisitsRender = function() {
  ensureFamilyVisitState();
  if (!_fvIsExpat()) {
    return '<div class="card" style="border-color:#6b7280"><h3 style="color:#6b7280">🌍 Remittances & Visits</h3><p class="muted small">This section is only available when you live and work abroad as an expat.</p></div>';
  }

  const family = (S.family || []).filter(function(m) { return m.alive !== false && !m.estranged; });
  let html = '<div class="card" style="border-color:#22d3ee">' +
    '<h3 style="color:#22d3ee">🌍 The "Expat ATM"</h3>' +
    '<p class="muted small">Manage family visits, send gifts, and distribute monthly allowances back home.</p>' +
    '</div>';

  /* Allowances Section */
  if (family.length) {
    html += '<div class="card" style="border-color:#fbbf24"><h4 style="color:#fbbf24">💸 Monthly Allowances</h4>' +
      '<p class="muted small">Set auto-deducted stipends to support family back home.</p>';
    family.slice(0, 5).forEach(function(m) {
      const amt = (S.parentAllowances && S.parentAllowances[m.id]) || 0;
      const amtLocal = Math.round(amt * _fvRate());
      html += '<div class="row" style="padding:4px 0;font-size:.8rem"><span>' + m.name + '</span>' +
        '<button class="pill" style="padding:4px 8px;font-size:.7rem;border-color:#fbbf24" onclick="familySetAllowanceUI(\'' + m.id + '\')">' + (amtLocal > 0 ? money(amtLocal) + '/mo' : 'Set Allowance') + '</button></div>';
    });
    html += '</div>';
  }

  /* Gifts Section with Shipping Options */
  if (window.GULF_GIFT_CATALOG && family.length) {
    html += '<div class="card" style="border-color:#8b5cf6"><h4 style="color:#8b5cf6">📦 Send Remittance & Gifts</h4>' +
      '<p class="muted small">Choose an item and a shipping method. Beware of Egyptian customs!</p>';
    
    html += '<div style="margin-bottom:10px">';
    html += '<select id="fv_gift_select" style="width:100%;margin-bottom:6px;padding:6px">';
    window.GULF_GIFT_CATALOG.forEach(function(g) {
      const price = Math.round(g.basePriceUSD * (C().rate || 1));
      html += '<option value="' + g.id + '">' + g.label + ' (' + money(price) + ')</option>';
    });
    html += '</select>';

    html += '<select id="fv_shipping_select" style="width:100%;margin-bottom:6px;padding:6px">';
    FV_SHIPPING_METHODS.forEach(function(m) {
      html += '<option value="' + m.id + '">' + m.label + ' (Fee: +' + Math.round(m.costMult * 100) + '%)</option>';
    });
    html += '</select>';

    html += '<select id="fv_member_select" style="width:100%;margin-bottom:6px;padding:6px">';
    family.forEach(function(m) {
      html += '<option value="' + m.id + '">Send to: ' + m.name + '</option>';
    });
    html += '</select>';

    html += '<button class="opt" style="width:100%;text-align:center;background:#8b5cf620;border-color:#8b5cf6" onclick="familySendGiftAbroad(document.getElementById(\'fv_member_select\').value, document.getElementById(\'fv_gift_select\').value, document.getElementById(\'fv_shipping_select\').value)">✈️ Buy & Send Package</button>';
    html += '</div></div>';
  }

  /* Visits Section */
  html += '<div class="card"><h4 style="font-size:.85rem;color:#34d399">✈️ Invite Family on Visit Visa</h4>' +
    '<p class="muted small" style="margin-bottom:6px">Requires stable income and a rented/owned home. Risk of visa denial or overstays.</p>';
  family.forEach(function(m) {
    html += '<button class="opt" style="width:100%;margin-top:4px;text-align:left;padding:8px;font-size:.78rem" onclick="familyInviteVisitor(\'' + m.id + '\')">' +
      '<div style="display:flex;justify-content:space-between"><b>' + m.name + ' (' + (m.role || 'family') + ')</b><span>Apply for Visa</span></div>' +
      '<div class="muted small">Bond ' + (m.bond || 70) + '%</div></button>';
  });
  html += '</div>';

  return html;
};

console.log('[World Life] 35-family-visits.js loaded (Expat ATM Expansion)');
